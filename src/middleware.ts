import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Next.js root middleware — runs on every matched request.
 * Delegates to the Supabase updateSession helper which:
 *  - Refreshes the auth token via HttpOnly cookies (SSR-safe, no XSS risk)
 *  - Redirects unauthenticated users away from protected routes
 *  - Redirects authenticated users away from auth pages (login / signup)
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *  - _next/static  (Next.js build output — JS, CSS chunks)
     *  - _next/image   (Next.js image optimisation endpoint)
     *  - favicon.ico   (browser favicon request)
     *  - Any static media file (svg, png, jpg, jpeg, gif, webp, mp4)
     *
     * This ensures static assets are never intercepted or delayed by
     * the middleware, keeping them served at full CDN speed.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)',
  ],
};
