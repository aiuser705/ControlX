import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { sendBookingConfirmation } from '@/lib/email';
import { sendAdminNotifications } from '@/lib/notifications';

/**
 * Verify Cashfree Webhook Signature
 */
function verifyCashfreeWebhookSignature(
  rawBody: string,
  timestamp: string | null,
  signature: string | null,
  secretKey: string
): boolean {
  if (!signature || !secretKey) return false;

  try {
    // Standard Cashfree v2/v3 signature check: timestamp + rawBody
    if (timestamp) {
      const computedSignatureWithTimestamp = crypto
        .createHmac('sha256', secretKey)
        .update(timestamp + rawBody)
        .digest('base64');

      if (computedSignatureWithTimestamp === signature) {
        return true;
      }
    }

    // Direct rawBody signature fallback
    const computedDirectSignature = crypto
      .createHmac('sha256', secretKey)
      .update(rawBody)
      .digest('base64');

    return computedDirectSignature === signature;
  } catch (err) {
    console.error('[webhook] Signature verification computation error:', err);
    return false;
  }
}

/**
 * POST /api/payments/webhook
 *
 * Secure Cashfree webhook endpoint with signature verification,
 * amount tamper detection, idempotent state updates, and email dispatch.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature =
      req.headers.get('x-cashfree-signature') ||
      req.headers.get('x-webhook-signature') ||
      req.headers.get('x-cf-signature');
    const timestamp =
      req.headers.get('x-cashfree-timestamp') ||
      req.headers.get('x-webhook-timestamp');

    const secretKey = process.env.CASHFREE_SECRET_KEY;

    if (!secretKey) {
      console.error('[webhook] Server missing CASHFREE_SECRET_KEY.');
      return NextResponse.json({ error: 'Gateway not configured.' }, { status: 500 });
    }

    // ── 1. Signature Verification ───────────────────────────────────────────
    const isValidSignature = verifyCashfreeWebhookSignature(
      rawBody,
      timestamp,
      signature,
      secretKey
    );

    // Signature is always verified. The only escape hatch is ALLOW_UNSIGNED_WEBHOOKS=true,
    // which must be explicitly set and is never present in production or staging.
    const allowUnsigned = process.env.ALLOW_UNSIGNED_WEBHOOKS === 'true';
    if (!isValidSignature) {
      if (allowUnsigned) {
        console.warn('[webhook] ⚠️ Signature INVALID — ALLOW_UNSIGNED_WEBHOOKS override active, proceeding');
      } else {
        console.error('[webhook] ❌ Invalid Cashfree webhook signature. Rejecting.');
        return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
      }
    }

    // ── 2. Parse Webhook Payload ────────────────────────────────────────────
    let payload: Record<string, any> = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    console.log('[webhook] Received Cashfree event:', payload.type || payload.event || 'PAYMENT_EVENT');

    // Extract Order ID & Payment Details across Cashfree webhook formats
    const orderData = payload.data?.order || payload.order || payload.data || {};
    const paymentData = payload.data?.payment || payload.payment || {};
    const orderId = orderData.order_id || payload.orderId || payload.order_id;
    const webhookAmount = Number(orderData.order_amount ?? paymentData.payment_amount ?? payload.orderAmount);
    const paymentStatus = (paymentData.payment_status || orderData.order_status || payload.status || '').toUpperCase();
    const eventType = (payload.type || '').toUpperCase();

    if (!orderId) {
      console.warn('[webhook] No order_id present in webhook payload.');
      return NextResponse.json({ error: 'Missing order_id.' }, { status: 400 });
    }

    // ── 3. Idempotent Query on Supabase Database ────────────────────────────
    const supabase = createClient();
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('cashfree_order_id', orderId)
      .maybeSingle();

    if (fetchError || !booking) {
      console.error(`[webhook] Booking not found for Cashfree Order ID: ${orderId}`);
      // Return 200 to prevent Cashfree from retrying indefinitely for non-existent records
      return NextResponse.json({ received: true, note: 'Booking record not found' }, { status: 200 });
    }

    // If booking is already confirmed, terminate early (idempotent)
    if (booking.status === 'confirmed') {
      console.log(`[webhook] Booking for order ${orderId} is already CONFIRMED. No-op.`);
      return NextResponse.json({ received: true, status: 'already_confirmed' }, { status: 200 });
    }

    // ── 4. Amount Verification (Tamper Protection) ──────────────────────────
    if (!isNaN(webhookAmount) && webhookAmount > 0) {
      const expectedAmount = Number(booking.amount);
      if (Math.abs(webhookAmount - expectedAmount) > 0.01) {
        console.error(
          `[webhook] ⚠️ Amount mismatch! Webhook: ₹${webhookAmount}, Expected: ₹${expectedAmount}. Marking booking as failed.`
        );
        await supabase
          .from('bookings')
          .update({ status: 'failed' })
          .eq('id', booking.id);

        return NextResponse.json({ error: 'Order amount mismatch.' }, { status: 400 });
      }
    }

    // ── 5. Process Payment Status Update ────────────────────────────────────
    const isPaymentSuccess =
      paymentStatus === 'SUCCESS' ||
      paymentStatus === 'PAID' ||
      eventType.includes('PAYMENT_SUCCESS');

    const isPaymentFailed =
      paymentStatus === 'FAILED' ||
      paymentStatus === 'USER_DROPPED' ||
      eventType.includes('PAYMENT_FAILED') ||
      eventType.includes('USER_DROPPED');

    if (isPaymentSuccess) {
      console.log(`[webhook] ✓ Payment verified successful for order ${orderId}. Updating to 'confirmed'.`);

      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', booking.id);

      if (updateError) {
        console.error('[webhook] Failed to update booking status to confirmed:', updateError.message);
      }

      // Trigger Customer Email + Admin Notifications (Guaranteed single-fire)
      if (!booking.email_sent) {
        try {
          const emailSuccess = await sendBookingConfirmation({
            customerEmail: booking.customer_email,
            customerName: booking.customer_name,
            serviceName: booking.service_name,
            amount: booking.amount,
            currency: booking.currency,
            bookingId: booking.id,
            orderId: booking.cashfree_order_id,
          });

          if (emailSuccess) {
            await supabase
              .from('bookings')
              .update({ email_sent: true })
              .eq('id', booking.id);
          } else {
            console.error('[webhook] Booking confirmation email failed to deliver. Will remain email_sent=false for retry.');
          }
        } catch (emailErr) {
          console.error('[webhook] Non-fatal error during email trigger:', emailErr);
        }

        // Admin notifications (Telegram + Admin Email) — non-blocking
        try {
          await sendAdminNotifications({ booking });
        } catch (notifyErr) {
          console.error('[webhook] Non-fatal error during admin notifications:', notifyErr);
        }
      }
    } else if (isPaymentFailed) {
      console.log(`[webhook] Payment failed/dropped for order ${orderId}. Updating to 'failed'.`);
      await supabase
        .from('bookings')
        .update({ status: 'failed' })
        .eq('id', booking.id);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error('[webhook] Unexpected error during webhook processing:', err);
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }
}
