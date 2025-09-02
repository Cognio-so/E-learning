import { NextResponse } from 'next/server';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  
  console.log('🔍 Middleware running for:', pathname);

  // For separate deployments, don't rely on cookies in middleware
  // Let the frontend components handle authentication checks
  
  // Only protect specific routes, not everything
  const protectedPaths = ['/student', '/teacher'];
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // For cross-domain deployments, redirect to login if no local storage token
  // This will be handled by your auth store instead
  console.log('✅ Protected route accessed, letting component handle auth');
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only match protected routes, not everything
    '/student/:path*',
    '/teacher/:path*',
  ],
}