import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if user is authenticated
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET || 'your-nextauth-secret-key-here-change-in-production'
  });
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/try', '/analysis'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/onboarding', '/journal', '/tasks', '/finance', '/people', '/wheel-of-life'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // If not authenticated and trying to access protected route, redirect to login
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If not authenticated and trying to access any other route (except public), redirect to login
  if (!token && !isPublicRoute && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If authenticated and trying to access login/signup, redirect to check-in
  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/check-in', request.url));
  }
  
  // If authenticated and accessing root, redirect to check-in
  if (token && pathname === '/') {
    return NextResponse.redirect(new URL('/check-in', request.url));
  }
  
  // If not authenticated and accessing root, redirect to login
  if (!token && pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 