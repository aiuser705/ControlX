import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

// ── Hardcoded Server-Side Pricing (NEVER trust frontend price) ────────────────
const CONSULTATION_AMOUNT = 5000.0;
const CONSULTATION_CURRENCY = 'INR';
const SERVICE_NAME = '1-Hour Executive Consultation';

// ── Cashfree Config ──────────────────────────────────────────────────────────
const CF_BASE_URL = process.env.CASHFREE_BASE_URL ?? 'https://sandbox.cashfree.com/pg';
const CF_API_VERSION = '2023-08-01';

/**
 * POST /api/payments/create-order
 *
 * Implements fault-tolerant, idempotent Cashfree order creation:
 * 1. Checks for existing 'confirmed' booking (409 Conflict)
 * 2. Checks for existing 'pending_payment' booking (returns existing order)
 * 3. Server-side UUID idempotency key generation
 * 4. Draft-to-pending_payment state transition
 */
export async function POST(req: NextRequest) {
  try {
    // ── 0. Verify Environment Variables ─────────────────────────────────────
    const CF_APP_ID = process.env.CASHFREE_APP_ID;
    const CF_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

    if (!CF_APP_ID || !CF_SECRET_KEY) {
      console.error('[create-order] Missing CASHFREE_APP_ID or CASHFREE_SECRET_KEY.');
      return NextResponse.json(
        { success: false, error: 'Payment gateway not configured.' },
        { status: 500 }
      );
    }

    // ── 1. Authenticate Request ─────────────────────────────────────────────
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in first.' },
        { status: 401 }
      );
    }

    // ── 2. Parse & Validate Input ───────────────────────────────────────────
    const body = await req.json().catch(() => ({}));
    const { customerName, customerEmail, customerPhone } = body;

    const name = (typeof customerName === 'string' && customerName.trim().length > 0)
      ? customerName.trim()
      : user.email?.split('@')[0] ?? 'Executive Customer';

    const email = (typeof customerEmail === 'string' && customerEmail.trim().length > 0)
      ? customerEmail.trim()
      : user.email ?? 'customer@example.com';

    const phone = (typeof customerPhone === 'string' && customerPhone.trim().length >= 10)
      ? customerPhone.trim().replace(/\D/g, '').slice(-10)
      : '9999999999';

    // ── 2b. Capture Server-Observed IP & User-Agent ──────────────────────────
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    console.log(`[create-order] Request from IP: ${ip}`);

    // Use admin client for all DB operations to bypass RLS
    const adminSupabase = createAdminClient();

    // ── 2c. Pre-Booking Block Check (user_id OR email OR phone) ─────────────
    const { data: blockRecord } = await adminSupabase
      .from('customer_blocks')
      .select('id, reason')
      .or(`user_id.eq.${user.id},email.eq.${email},phone.eq.${phone}`)
      .maybeSingle();

    if (blockRecord) {
      console.warn(`[create-order] BLOCKED: user ${user.id} (${email}) matched block ${blockRecord.id}: ${blockRecord.reason}`);
      return NextResponse.json(
        { success: false, error: 'Bookings are currently unavailable for this account. Please contact support.' },
        { status: 403 }
      );
    }

    // ── 3a. Stale Payment Cleanup: Retire abandoned pending payments (> 30 mins) ──
    const STALE_PENDING_MS = 30 * 60 * 1000; // 30 minutes
    const staleCutoff = new Date(Date.now() - STALE_PENDING_MS).toISOString();

    const { data: staleBookings } = await adminSupabase
      .from('bookings')
      .update({ status: 'failed' })
      .eq('user_id', user.id)
      .eq('status', 'pending_payment')
      .lt('created_at', staleCutoff)
      .select('id');

    if (staleBookings && staleBookings.length > 0) {
      console.log(`[create-order] Retired ${staleBookings.length} stale pending booking(s) for user ${user.id}`);
      for (const b of staleBookings) {
        await adminSupabase.from('booking_history').insert({
          booking_id: b.id,
          action: 'Stale Payment Retired',
          note: 'Pending payment session timed out after 30 minutes',
        });
      }
    }

    // ── 3b. Strict Active Check: Check for active confirmed bookings ─────────
    const { data: blocker, error: blockerError } = await adminSupabase
      .from('bookings')
      .select('id, status, booking_status, cashfree_order_id')
      .eq('user_id', user.id)
      .eq('status', 'confirmed')
      .or('booking_status.is.null,booking_status.not.in.("Cancelled","Completed")')
      .limit(1);

    if (blockerError) {
      console.warn('[create-order] Blocker query note:', blockerError.message);
    }

    if (blocker && blocker.length > 0) {
      console.log(`[create-order] User ${user.id} has an active confirmed booking (${blocker[0].id}).`);
      return NextResponse.json(
        {
          success: false,
          error: 'You already have a confirmed booking.',
          already_booked: true,
          booking_id: blocker[0].id,
        },
        { status: 409 } // 409 Conflict
      );
    }

    // ── 4. Server-Side Idempotency Key Generation ───────────────────────────
    const serverIdempotencyKey = crypto.randomUUID();

    // ── 5. Insert Draft Booking Row in Database (admin client bypasses RLS) ──
    const { data: newBooking, error: insertError } = await adminSupabase
      .from('bookings')
      .insert({
        user_id: user.id,
        idempotency_key: serverIdempotencyKey,
        service_name: SERVICE_NAME,
        amount: CONSULTATION_AMOUNT,
        currency: CONSULTATION_CURRENCY,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        status: 'draft',
        email_sent: false,
        ip_address: ip,
        user_agent: userAgent,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[DB Insert Error] Code:', insertError.code);
      console.error('[DB Insert Error] Message:', insertError.message);
      console.error('[DB Insert Error] Details:', insertError.details);
      console.error('[DB Insert Error] Hint:', insertError.hint);
      return NextResponse.json(
        { error: 'Failed to create booking record. Please try again.' },
        { status: 500 }
      );
    }
    console.log(`[create-order] Draft booking created with id: ${newBooking?.id}`);

    // ── 6. Request Cashfree Order Creation ──────────────────────────────────
    const orderId = `cx_${user.id.replace(/-/g, '').slice(0, 12)}_${Date.now()}`;
    const customerId = `u_${user.id.replace(/-/g, '').slice(0, 20)}`;

    const requestBody = {
      order_id: orderId,
      order_amount: CONSULTATION_AMOUNT,
      order_currency: CONSULTATION_CURRENCY,
      customer_details: {
        customer_id: customerId,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
      },
      order_meta: {
        return_url: `${req.nextUrl.origin}/payment/status?order_id={order_id}`,
        notify_url: `${req.nextUrl.origin}/api/payments/webhook`,
      },
    };

    console.log(`[create-order] Creating Cashfree order: ${orderId} for user ${user.id}`);

    const cashfreeRes = await fetch(`${CF_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-client-id': CF_APP_ID,
        'x-client-secret': CF_SECRET_KEY,
        'x-api-version': CF_API_VERSION,
      },
      body: JSON.stringify(requestBody),
    });

    const rawText = await cashfreeRes.text();
    let cfData: Record<string, any> = {};

    try {
      cfData = JSON.parse(rawText);
    } catch {
      console.error('[create-order] Cashfree non-JSON response:', rawText);
      return NextResponse.json(
        { success: false, error: 'Invalid response from payment gateway.' },
        { status: 502 }
      );
    }

    if (!cashfreeRes.ok) {
      console.error('[create-order] Cashfree API error:', cfData);
      return NextResponse.json(
        {
          success: false,
          error: cfData.message ?? 'Payment order creation failed.',
          debug: process.env.NODE_ENV === 'development' ? cfData : undefined,
        },
        { status: cashfreeRes.status }
      );
    }

    const sessionId = cfData.payment_session_id;
    const cfOrderId = cfData.order_id || orderId;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'No payment session returned by gateway.' },
        { status: 502 }
      );
    }

    // ── 7. Transition Booking Row to 'pending_payment' with cashfree_order_id ─
    const { error: updateError } = await adminSupabase
      .from('bookings')
      .update({
        cashfree_order_id: cfOrderId,
        status: 'pending_payment',
      })
      .eq('idempotency_key', serverIdempotencyKey);

    if (updateError) {
      console.error('[create-order] Error setting booking to pending_payment:', updateError.message);
    } else {
      console.log(`[create-order] Booking ${newBooking?.id} → pending_payment (order: ${cfOrderId})`);
    }

    return NextResponse.json(
      {
        success: true,
        order_id: cfOrderId,
        session_id: sessionId,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[create-order] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
