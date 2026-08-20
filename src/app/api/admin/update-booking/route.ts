import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    // Auth + admin check
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { bookingId, contactStatus, bookingStatus, adminNotes, followUpAt } = body;

    if (!bookingId) return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });

    const adminSupabase = createAdminClient();
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    const changeLogs: string[] = [];

    // Operational Contact Status (Pending, Contacted, Callback Required, No Response, Not Contacted)
    if (contactStatus !== undefined) {
      updatePayload.contact_status = contactStatus;
      changeLogs.push(`Contact: ${contactStatus}`);
    }

    // Operational Booking Status (Confirmed, Completed, Cancelled)
    if (bookingStatus !== undefined) {
      updatePayload.booking_status = bookingStatus;
      changeLogs.push(`Booking Status: ${bookingStatus}`);
    }

    // Admin Notes
    if (adminNotes !== undefined) {
      updatePayload.admin_notes = adminNotes;
      changeLogs.push('Admin Note updated');
    }

    // Follow-up Date
    if (followUpAt !== undefined) {
      updatePayload.follow_up_at = followUpAt || null;
      if (followUpAt) {
        changeLogs.push(`Follow-up scheduled: ${followUpAt}`);
      } else {
        changeLogs.push('Follow-up cleared');
      }
    }

    // Note: STRICTLY DO NOT TOUCH the 'status' (Payment) column!
    const { error: updateErr } = await adminSupabase
      .from('bookings')
      .update(updatePayload)
      .eq('id', bookingId);

    if (updateErr) {
      console.error('[update-booking] DB error:', updateErr.message);
      return NextResponse.json({ error: `Failed to update booking: ${updateErr.message}` }, { status: 500 });
    }

    // Log to audit trail
    if (changeLogs.length > 0) {
      await adminSupabase.from('booking_history').insert({
        booking_id: bookingId,
        action: 'CRM Update',
        note: changeLogs.join(' | '),
        admin_id: user.id,
      });
    }

    return NextResponse.json({ success: true, updated: updatePayload });
  } catch (err: any) {
    console.error('[update-booking] Error:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
