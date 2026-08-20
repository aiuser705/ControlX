import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user & verify admin role
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    // 2. Parse request payload
    const body = await req.json();
    const { messageId, status, adminNotes } = body;

    if (!messageId) {
      return NextResponse.json({ error: 'Missing messageId' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const updatePayload: Record<string, any> = {};

    if (status !== undefined) {
      updatePayload.status = status.toLowerCase();
    }

    if (adminNotes !== undefined) {
      updatePayload.admin_notes = adminNotes;
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { error: updateErr } = await adminSupabase
      .from('contact_messages')
      .update(updatePayload)
      .eq('id', messageId);

    if (updateErr) {
      console.error('[update-message] DB error:', updateErr.message);
      return NextResponse.json({ error: `Failed to update message: ${updateErr.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated: updatePayload });
  } catch (err: any) {
    console.error('[update-message] Internal error:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
