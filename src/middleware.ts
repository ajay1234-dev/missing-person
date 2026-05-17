import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  // In Next.js middleware, reading Firebase Auth state directly via the JS SDK is not possible 
  // without setting a custom session cookie. Because we are using client-side Firebase Auth,
  // we will do a basic check here for a standard token or rely on a client-side wrapper 
  // for the dashboard layout if the standard cookie isn't present.
  
  // A robust production approach uses Firebase Admin + session cookies.
  // For this prototype, we'll verify this at the Layout level, so middleware just passes through.
  // We'll set a standard auth-token cookie on client login and check it here.

  const session = request.cookies.get('auth-token');
  
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}
 
export const config = {
  matcher: ['/dashboard/:path*'],
}
