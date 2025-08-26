import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const path = req.nextUrl.pathname;
  const accessToken = req.cookies.get('accessToken')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;

  const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/verify'];
  const isVerifyRoute = path.match(/^\/auth\/verify\/[^\/]+$/);
  const isPublicRoute = publicRoutes.includes(path) || !!isVerifyRoute;

  // Handle public routes
  if (isPublicRoute) {
    // If user is authenticated and trying to access login/register, redirect to appropriate dashboard
    if (accessToken && (path === '/' || path === '/auth/login' || path === '/auth/register')) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(accessToken, secret, {
          issuer: 'ED_TECH',
        });

        const dashboardUrl = payload.role === 'student' ? '/student/dashboard' : '/teacher/dashboard';
        return NextResponse.redirect(new URL(dashboardUrl, req.url));
      } catch (error) {
        // Token is invalid, clear cookies and continue to login
        const response = NextResponse.next();
        response.cookies.delete('accessToken');
        response.cookies.delete('refreshToken');
        return response;
      }
    }
    return NextResponse.next();
  }

  // Handle protected routes
  if (!accessToken && !refreshToken) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  if (accessToken) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(accessToken, secret, {
        issuer: 'ED_TECH',
      });

      // Role-based access control
      if (path.startsWith('/student/') && payload.role !== 'student') {
        return NextResponse.redirect(new URL('/teacher/dashboard', req.url));
      }
      
      if (path.startsWith('/teacher/') && payload.role !== 'teacher') {
        return NextResponse.redirect(new URL('/student/dashboard', req.url));
      }
      
      return NextResponse.next();

    } catch (error) {
      // Token is invalid
      if (refreshToken) {
        // Let the page handle token refresh
        return NextResponse.next();
      }
      
      // No refresh token, redirect to login
      const response = NextResponse.redirect(new URL('/auth/login', req.url));
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      return response;
    }
  }

  // Has refresh token but no access token
  if (refreshToken) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL('/auth/login', req.url));
}

export const config = {
  matcher: [
    '/student/:path*',
    '/teacher/:path*',
    '/auth/login',
    '/auth/register',
    '/',
  ],
};