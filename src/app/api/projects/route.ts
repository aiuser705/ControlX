import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/projects
 *
 * Returns all published portfolio projects ordered by sort_order ASC,
 * then created_at DESC (newest first within same sort order).
 * Public endpoint — no authentication required.
 */
export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[/api/projects] Supabase fetch error:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to load projects.' },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}
