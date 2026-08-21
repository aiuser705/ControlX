import { NextResponse, type NextRequest } from 'next/server';

// Routes that require an authenticated session
const PROTECTED_ROUTES = ['/account', '/admin', '/settings', '/orders', '/profile', '/reset-password'];

// Routes that authenticated users should be bounced away from
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Guard: if Supabase env vars are missing, skip auth logic entirely
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[middleware] Supabase env vars not set — skipping auth checks');
    return NextResponse.next({ request });
  }

  // Build the initial pass-through response
  let supabaseResponse = NextResponse.next({ request });

  let user = null;

  try {
    // Dynamically import to avoid edge-runtime bundling issues
    const { createServerClient } = await import('@supabase/ssr');

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // getUser() validates the JWT against Supabase Auth server on every request
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (err) {
    // If Supabase is unreachable or throws, do NOT crash the middleware.
    // Simply pass the request through; protected pages will handle auth themselves.
    console.error('[middleware] Supabase auth check failed — passing through:', err);
    return NextResponse.next({ request });
  }

  // Check prefix matches so /account/settings is also protected
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // 1. Unauthenticated user hitting a protected route → send to /login
  if (!user && isProtectedRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated user hitting an auth route → send to /account
  if (user && isAuthRoute) {
    const accountUrl = request.nextUrl.clone();
    accountUrl.pathname = '/account';
    accountUrl.search = '';
    return NextResponse.redirect(accountUrl);
  }

  // 3. All other requests — allow through with refreshed session cookies
  return supabaseResponse;
}
