import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        if (req.nextUrl.pathname.startsWith('/api/auth') || 
            req.nextUrl.pathname.startsWith('/login') ||
            req.nextUrl.pathname.startsWith('/signup') ||
            req.nextUrl.pathname.startsWith('/welcome') ||
            req.nextUrl.pathname === '/') {
          return true;
        }
        
        // For API routes, allow if token exists (even if it's a Google ID)
        if (req.nextUrl.pathname.startsWith('/api/')) {
          return !!token;
        }
        
        // For other routes, require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 