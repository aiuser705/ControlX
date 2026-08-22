import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { sendBookingConfirmation } from '@/lib/email';
import { sendAdminNotifications } from '@/lib/notifications';

/**
 * POST /api/payments/verify-payment
 *
 * Verifies a Cashfree payment order status directly against Cashfree API,
 * updates the database state machine, and triggers confirmation email once.
 *
 * Security:
 *  - Requires authenticated user session (401 if missing)
 *  - Returns 404 uniformly for both not-found and not-owned bookings
 *    (prevents order-ID enumeration oracle via 403 vs 404 distinction)
 *  - Raw error details never returned to client
 */
export async function POST(req: NextRequest) {
  try {
    // ── 0. Authenticate the caller ────────────────────────────────────────────
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    // ── 1. Parse & validate orderId ───────────────────────────────────────────
    const body = await req.json().catch(() => ({}));
    const orderId = body.orderId || body.order_id;

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing orderId parameter.' },
        { status: 400 }
      );
    }

    const CF_APP_ID = process.env.CASHFREE_APP_ID;
    const CF_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
    const baseUrl = process.env.CASHFREE_BASE_URL ?? 'https://sandbox.cashfree.com/pg';
    const CF_API_VERSION = '2023-08-01';

    if (!CF_APP_ID || !CF_SECRET_KEY) {
      console.error('[verify-payment] Missing Cashfree API credentials in environment.');
      return NextResponse.json(
        { success: false, error: 'Payment gateway configuration missing.' },
        { status: 500 }
      );
    }

    const adminSupabase = createAdminClient();

    // ── 2. Fetch booking and enforce ownership ─────────────────────────────────
    const { data: booking, error: dbFetchError } = await adminSupabase
      .from('bookings')
      .select('*')
      .eq('cashfree_order_id', orderId)
      .maybeSingle();

    if (dbFetchError) {
      console.warn('[verify-payment] Database lookup note:', dbFetchError.message);
    }

    // Return 404 for both "not found" and "not owned by caller".
    // Uniform 404 prevents an enumeration oracle (403 would reveal a valid ID exists).
    if (!booking || booking.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Booking not found.' },
        { status: 404 }
      );
    }

    // Fast-path: already confirmed in DB — return immediately
    if (booking.status === 'confirmed') {
      console.log(`[verify-payment] Order ${orderId} is already CONFIRMED in database.`);
      return NextResponse.json({
        success: true,
        status: 'confirmed',
        booking: {
          id: booking.id,
          service_name: booking.service_name,
          amount: booking.amount,
          currency: booking.currency,
          customer_name: booking.customer_name,
          customer_email: booking.customer_email,
          customer_phone: booking.customer_phone,
          cashfree_order_id: booking.cashfree_order_id,
        },
      });
    }

    // ── 3. Query Cashfree Orders API directly ──────────────────────────────────
    const fetchUrl = `${baseUrl}/orders/${encodeURIComponent(orderId)}`;
    console.log(`[verify-payment] Requesting: GET ${fetchUrl}`);

    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-client-id': CF_APP_ID,
        'x-client-secret': CF_SECRET_KEY,
        'x-api-version': CF_API_VERSION,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[verify-payment] Cashfree verification failed:', response.status, errorText);
      return NextResponse.json(
        { success: false, status: 'failed', error: 'Payment gateway verification failed.' },
        { status: response.status }
      );
    }

    const cfOrder = await response.json();
    const rawStatus = (cfOrder.order_status as string || '').toUpperCase();
    console.log(`[verify-payment] Cashfree returned raw order_status: ${rawStatus}`);

    let mappedStatus: 'confirmed' | 'failed' | 'cancelled' | 'pending_payment' = 'pending_payment';

    switch (rawStatus) {
      case 'PAID':
        mappedStatus = 'confirmed';
        break;
      case 'EXPIRED':
      case 'TERMINATED':
      case 'FAILED':
        mappedStatus = 'failed';
        break;
      case 'CANCELLED':
      case 'USER_DROPPED':
        mappedStatus = 'cancelled';
        break;
      case 'ACTIVE':
      default:
        mappedStatus = 'pending_payment';
        break;
    }

    // ── 4. Authoritative DB state update & email dispatch ──────────────────────
    if (booking.id) {
      console.log(`[verify-payment] Cashfree status is ${rawStatus} → ${mappedStatus}. Updating DB...`);

      const updatePayload: Record<string, any> = { status: mappedStatus };

      if (mappedStatus === 'confirmed' && !booking.email_sent) {
        console.log('[verify-payment] Triggering confirmation email...');
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
            updatePayload.email_sent = true;
          } else {
            console.error('[verify-payment] Confirmation email delivery failed. email_sent remains false.');
          }
        } catch (emailErr) {
          console.error('[verify-payment] Non-fatal email error:', emailErr);
        }

        // Admin notifications (Telegram + Admin Email) — non-blocking
        try {
          await sendAdminNotifications({ booking });
        } catch (notifyErr) {
          console.error('[verify-payment] Non-fatal error during admin notifications:', notifyErr);
        }
      }

      const { error: updateError } = await adminSupabase
        .from('bookings')
        .update(updatePayload)
        .eq('id', booking.id);

      if (updateError) {
        console.error('[verify-payment] Error updating booking status in DB:', updateError.message);
      } else {
        console.log(`[verify-payment] DB booking ${booking.id} updated to status=${mappedStatus}`);
      }

      // Internal Edge Function relay (Telegram notification)
      if (mappedStatus === 'confirmed' && process.env.SUPABASE_EDGE_FUNCTION_URL) {
        try {
          await fetch(process.env.SUPABASE_EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Internal-Secret': process.env.INTERNAL_WEBHOOK_SECRET || '',
            },
            body: JSON.stringify({ booking_id: booking.id }),
          });
        } catch (notifyError) {
          // Non-fatal: payment is confirmed even if relay is down
          console.error('[verify-payment] Failed to call Edge Function relay:', notifyError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      status: mappedStatus,
      booking: {
        id: booking.id || cfOrder.order_id || orderId,
        service_name: booking.service_name || '1-Hour Executive Consultation',
        amount: booking.amount || cfOrder.order_amount || 5000,
        currency: booking.currency || cfOrder.order_currency || 'INR',
        customer_name: booking.customer_name || cfOrder.customer_details?.customer_name || 'Customer',
        customer_email: booking.customer_email || cfOrder.customer_details?.customer_email || '',
        customer_phone: booking.customer_phone || cfOrder.customer_details?.customer_phone || '',
        cashfree_order_id: cfOrder.order_id || orderId,
      },
    });
  } catch (err: any) {
    // Log full error server-side; never expose internals to client
    console.error('[verify-payment] Unexpected internal error:', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
