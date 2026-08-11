import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/** TEMP: set BYPASS_PORTAL_AUTH=true to open portals without login. Never enable in production. */
const BYPASS_PORTAL_AUTH = process.env.BYPASS_PORTAL_AUTH === 'true'

export function middleware(request: NextRequest) {
  if (BYPASS_PORTAL_AUTH) {
    return NextResponse.next()
  }

  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  // Protect admin, coach, learner routes
  const isProtectedPath = path.startsWith('/admin') || path.startsWith('/coach') || path.startsWith('/learner');

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Edge RBAC: decode only (API verifies signature). Admin/coach gated; any signed-in role may open /learner.
  if (token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      const role = payload.role;

      if (path.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      if (path.startsWith('/coach') && !['coach', 'admin'].includes(role)) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/coach/:path*', '/learner/:path*'],
}
