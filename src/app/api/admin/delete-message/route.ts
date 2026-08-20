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
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
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
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json({ error: 'Missing messageId' }, { status: 400 });
    }

    // 3. Delete from contact_messages using admin client
    const adminSupabase = createAdminClient();
    const { error: deleteErr } = await adminSupabase
      .from('contact_messages')
      .delete()
      .eq('id', messageId);

    if (deleteErr) {
      console.error('[/api/admin/delete-message] DB error:', deleteErr.message);
      return NextResponse.json(
        { error: `Failed to delete message: ${deleteErr.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Message permanently deleted.' });
  } catch (err: any) {
    console.error('[/api/admin/delete-message] Internal error:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
