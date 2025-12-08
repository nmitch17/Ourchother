import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js 16 Proxy (replaces middleware.ts)
 *
 * Security Note: Per CVE-2025-29927 recommendations, this proxy only checks
 * for cookie existence. Full session validation happens in server components
 * and API routes. This is the recommended pattern for Next.js 16+.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Define public routes that don't require auth
  const publicRoutes = [
    '/login',
    '/onboard',
    '/project',
    '/api/onboarding/templates',
    '/api/onboarding/submissions',
    '/api/onboarding/upload',
    '/api/client-dashboard',
  ]

  // Check if the current path starts with any public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For protected routes, check for auth cookie existence
  // Full session validation is done in server components/API routes
  const hasAuthCookie = request.cookies.has('sb-access-token') ||
                        request.cookies.getAll().some(cookie =>
                          cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')
                        )

  // Redirect to login if no auth cookie present
  if (!hasAuthCookie && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to dashboard if auth cookie exists and trying to access login
  if (hasAuthCookie && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
