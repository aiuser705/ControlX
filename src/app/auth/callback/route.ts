import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /auth/callback
 *
 * Supabase redirects users here after they click a magic link or OAuth
 * provider link. This handler exchanges the one-time `code` for a session
 * (stored in a secure HttpOnly cookie by @supabase/ssr) then sends the
 * browser to wherever `next` says — defaulting to /reset-password for
 * password-recovery flows.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/reset-password';

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // Code was invalid or already consumed — redirect to login with a flag
      const loginUrl = new URL('/login', requestUrl.origin);
      loginUrl.searchParams.set('error', 'link_expired');
      return NextResponse.redirect(loginUrl.toString());
    }
  }

  // Redirect to the intended destination (e.g. /reset-password)
  return NextResponse.redirect(`${requestUrl.origin}${next}`);
}
