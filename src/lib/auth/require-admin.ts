/**
 * src/lib/auth/require-admin.ts
 *
 * Centralised admin authorization helpers.
 * Having a single source of truth prevents the auth logic from drifting
 * between admin pages, layouts, and API routes — which was the root cause
 * of FINDING-004 (admin page relied entirely on layout for auth).
 *
 * Usage:
 *   Server Pages/Layouts: const user = await requireAdminPage();
 *   API Routes:           const { user, res } = await requireAdminApi();
 *                         if (res) return res;
 */

import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * requireAdminPage
 *
 * For use in Server Components (pages, layouts).
 * Redirects unauthenticated callers to /login and non-admins to /.
 * Returns the authenticated Supabase User on success.
 */
export async function requireAdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/admin');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }

  return { user, profile };
}

/**
 * requireAdminApi
 *
 * For use in API Route Handlers.
 * Returns { user, profile, res: null } on success.
 * Returns { user: null, profile: null, res: NextResponse } when authorization fails
 * — the caller must `return res` immediately.
 */
export async function requireAdminApi(): Promise<
  | { user: import('@supabase/supabase-js').User; profile: { role: string; email: string }; res: null }
  | { user: null; profile: null; res: NextResponse }
> {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      user: null,
      profile: null,
      res: NextResponse.json({ error: 'Unauthorized.' }, { status: 401 }),
    };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return {
      user: null,
      profile: null,
      res: NextResponse.json({ error: 'Forbidden.' }, { status: 403 }),
    };
  }

  return { user, profile, res: null };
}
