import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/supabase/server';

// ── Allowlists for operational status fields (FINDING-011) ────────────────────
// Prevents stored-XSS or arbitrary string injection into the admin CRM view.
// NOTE: STRICTLY DO NOT include the 'status' (payment) column here — it may
// only be mutated by the webhook or verify-payment routes.
const ALLOWED_CONTACT_STATUSES = new Set([
  'Pending',
  'Contacted',
  'Callback Required',
  'No Response',
  'Not Contacted',
]);

const ALLOWED_BOOKING_STATUSES = new Set([
  'Confirmed',
  'Completed',
  'Cancelled',
]);

export async function POST(req: NextRequest) {
  try {
    // ── Auth + admin check (FINDING-004 / shared helper) ─────────────────────
    const { res, user } = await requireAdminApi();
    if (res) return res;

    const body = await req.json();
    const { bookingId, contactStatus, bookingStatus, adminNotes, followUpAt } = body;

    if (!bookingId || typeof bookingId !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid bookingId.' }, { status: 400 });
    }

    // ── Validate status values against allowlists (FINDING-011) ──────────────
    if (contactStatus !== undefined && !ALLOWED_CONTACT_STATUSES.has(contactStatus)) {
      return NextResponse.json(
        { error: `Invalid contact status value: "${contactStatus}".` },
        { status: 400 }
      );
    }
    if (bookingStatus !== undefined && !ALLOWED_BOOKING_STATUSES.has(bookingStatus)) {
      return NextResponse.json(
        { error: `Invalid booking status value: "${bookingStatus}".` },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    const changeLogs: string[] = [];

    if (contactStatus !== undefined) {
      updatePayload.contact_status = contactStatus;
      changeLogs.push(`Contact: ${contactStatus}`);
    }
    if (bookingStatus !== undefined) {
      updatePayload.booking_status = bookingStatus;
      changeLogs.push(`Booking Status: ${bookingStatus}`);
    }
    if (adminNotes !== undefined) {
      updatePayload.admin_notes = adminNotes;
      changeLogs.push('Admin Note updated');
    }
    if (followUpAt !== undefined) {
      updatePayload.follow_up_at = followUpAt || null;
      changeLogs.push(followUpAt ? `Follow-up scheduled: ${followUpAt}` : 'Follow-up cleared');
    }

    // STRICTLY DO NOT TOUCH the 'status' (payment) column!
    const { error: updateErr } = await adminSupabase
      .from('bookings')
      .update(updatePayload)
      .eq('id', bookingId);

    if (updateErr) {
      // Log full DB error server-side; return generic message to client (FINDING-007)
      console.error('[update-booking] DB update error:', updateErr.message);
      return NextResponse.json(
        { error: 'Failed to update booking. Please try again.' },
        { status: 500 }
      );
    }

    // Log to audit trail
    if (changeLogs.length > 0) {
      await adminSupabase.from('booking_history').insert({
        booking_id: bookingId,
        action: 'CRM Update',
        note: changeLogs.join(' | '),
        admin_id: user!.id,
      });
    }

    return NextResponse.json({ success: true, updated: updatePayload });
  } catch (err: any) {
    // Generic error for client; full detail in server logs (FINDING-007)
    console.error('[update-booking] Unexpected error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
