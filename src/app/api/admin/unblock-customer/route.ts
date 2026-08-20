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

    const { blockId } = await req.json();
    if (!blockId) return NextResponse.json({ error: 'Missing blockId' }, { status: 400 });

    const adminSupabase = createAdminClient();

    // Fetch block details before deletion for audit log
    const { data: block } = await adminSupabase
      .from('customer_blocks')
      .select('email, user_id')
      .eq('id', blockId)
      .maybeSingle();

    const { error: deleteErr } = await adminSupabase
      .from('customer_blocks')
      .delete()
      .eq('id', blockId);

    if (deleteErr) {
      console.error('[unblock-customer] DB error:', deleteErr.message);
      return NextResponse.json({ error: 'Failed to remove block record.' }, { status: 500 });
    }

    console.log(`[unblock-customer] Unblocked ${block?.email || blockId} by admin ${user.id}`);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[unblock-customer] Error:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
