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

    const { bookingId, reason } = await req.json();

    if (!bookingId || !reason?.trim()) {
      return NextResponse.json({ error: 'Missing bookingId or reason' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // Fetch full booking details for multi-identifier block
    const { data: booking } = await adminSupabase
      .from('bookings')
      .select('user_id, customer_email, customer_phone, ip_address, user_agent')
      .eq('id', bookingId)
      .maybeSingle();

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    // Insert block record with all identifiers
    const { error: blockErr } = await adminSupabase.from('customer_blocks').insert({
      user_id: booking.user_id,
      email: booking.customer_email,
      phone: booking.customer_phone || null,
      ip_address: booking.ip_address || null,
      user_agent: booking.user_agent || null,
      reason: reason.trim(),
      blocked_by: user.id,
    });

    if (blockErr) {
      console.error('[block-customer] DB error:', blockErr.message);
      return NextResponse.json({ error: 'Failed to create block record.' }, { status: 500 });
    }

    // Log to audit trail
    await adminSupabase.from('booking_history').insert({
      booking_id: bookingId,
      action: 'Customer Blocked',
      note: `Reason: ${reason.trim()}`,
      admin_id: user.id,
    });

    // Update contact_status to signal blocked
    await adminSupabase
      .from('bookings')
      .update({ contact_status: 'No Response' })
      .eq('id', bookingId);

    console.log(`[block-customer] Blocked user ${booking.user_id} (${booking.customer_email}) by admin ${user.id}`);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[block-customer] Error:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
