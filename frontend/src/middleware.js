import { NextResponse } from 'next/server';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get('accessToken')?.value;

  // Public routes that don't need authentication
  const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/verify'];
  const isVerifyRoute = pathname.startsWith('/auth/verify/');
  const isPublicRoute = publicRoutes.includes(pathname) || isVerifyRoute;

  // Allow ALL public routes (no redirects for authenticated users)
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if user is authenticated for protected routes
  if (!accessToken) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Don't verify JWT in frontend middleware - let the backend handle it
  // Just check if token exists
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/student/:path*',
    '/teacher/:path*'
  ]
};