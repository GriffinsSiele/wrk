import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  // Protect admin, coach, learner routes
  const isProtectedPath = path.startsWith('/admin') || path.startsWith('/coach') || path.startsWith('/learner');

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Basic RBAC checking
  if (token) {
    try {
      // Decode JWT payload (without verifying signature for Edge runtime simplicity)
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
      // Learner paths can be accessed by everyone
    } catch {
      // Invalid token format
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/coach/:path*', '/learner/:path*'],
}
