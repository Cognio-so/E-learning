import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get('accessToken')?.value;

  // Public routes that don't need authentication
  const publicRoutes = ['/', '/auth/login', '/auth/register'];
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

  // Verify JWT token for protected routes only
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(accessToken, secret, {
      issuer: 'ED_TECH',
    });

    // Role-based access control
    const userRole = payload.role;
    
    if (pathname.startsWith('/student/') && userRole !== 'student') {
      return NextResponse.redirect(new URL('/teacher/dashboard', req.url));
    }
    
    if (pathname.startsWith('/teacher/') && userRole !== 'teacher') {
      return NextResponse.redirect(new URL('/student/dashboard', req.url));
    }

    return NextResponse.next();

  } catch (error) {
    // Invalid token - redirect to login
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}

export const config = {
  matcher: [
    '/student/:path*',
    '/teacher/:path*'
  ]
};