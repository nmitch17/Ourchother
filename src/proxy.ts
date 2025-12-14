import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js 16 Proxy (replaces middleware.ts)
 *
 * Security Note: Per CVE-2025-29927 recommendations, this proxy only checks
 * for cookie existence. Full session validation happens in server components
 * and API routes. This is the recommended pattern for Next.js 16+.
 *
 * Only (admin) routes under /dashboard are protected. All other routes are public.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect admin routes (dashboard)
  // All other routes are public by default
  const protectedRoutes = ['/dashboard']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // If not a protected route, allow access
  if (!isProtectedRoute) {
    // Special case: redirect authenticated users from /login to /dashboard
    if (pathname === '/login') {
      const hasAuthCookie = request.cookies.has('sb-access-token') ||
                            request.cookies.getAll().some(cookie =>
                              cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')
                            )
      if (hasAuthCookie) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    return NextResponse.next()
  }

  // For protected routes, check for auth cookie existence
  // Full session validation is done in server components/API routes
  const hasAuthCookie = request.cookies.has('sb-access-token') ||
                        request.cookies.getAll().some(cookie =>
                          cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')
                        )

  // Redirect to login if no auth cookie present
  if (!hasAuthCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
