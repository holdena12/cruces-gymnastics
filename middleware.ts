import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSecurityHeaders } from './lib/security'

export function middleware(request: NextRequest) {
  // Create response
  const response = NextResponse.next()

  // Apply security headers globally
  const securityHeaders = getSecurityHeaders()
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production' && !request.nextUrl.pathname.startsWith('/api/')) {
    if (request.headers.get('x-forwarded-proto') !== 'https') {
      return NextResponse.redirect(
        `https://${request.headers.get('host')}${request.nextUrl.pathname}${request.nextUrl.search}`,
        301
      )
    }
  }

  // Admin route protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // TODO: Add JWT verification here for admin routes
    // For now, we'll let the page handle authentication
  }

  return response
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 