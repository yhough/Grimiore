import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'auth_session'
const PUBLIC_PATHS = ['/login', '/signup']
const PUBLIC_API_PREFIXES = ['/api/auth/', '/api/webhooks/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(COOKIE_NAME)?.value

  // Always allow public API routes
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Allow Next.js internals and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/fonts/')
  ) {
    return NextResponse.next()
  }

  const isPublicPage = PUBLIC_PATHS.includes(pathname)

  // Only redirect to signup when there is definitely no cookie at all.
  // Never redirect away from public pages here — the server components
  // validate the session properly and handle stale-cookie cases.
  if (!token && !isPublicPage) {
    return NextResponse.redirect(new URL('/signup', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
