import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const path = req.nextUrl.pathname;
  const accessToken = req.cookies.get('accessToken')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;

  const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/verify'];
  const isVerifyRoute = path.match(/^\/auth\/verify\/[^\/]+$/);
  const isPublicRoute = publicRoutes.includes(path) || !!isVerifyRoute;

  if (isPublicRoute) {
    if (accessToken && (path === '/' || path === '/auth/login' || path === '/auth/register')) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(accessToken, secret, {
          issuer: 'ED_TECH',
        });

        const dashboardUrl = payload.role === 'student' ? '/student/dashboard' : '/teacher/dashboard';
        return NextResponse.redirect(new URL(dashboardUrl, req.url));
      } catch (error) {
      }
    }
    return NextResponse.next();
  }

  
  if (!accessToken && !refreshToken) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  if (accessToken) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(accessToken, secret, {
        issuer: 'ED_TECH',
      });

      if (path.startsWith('/student/') && payload.role !== 'student') {
        return NextResponse.redirect(new URL('/teacher/dashboard', req.url));
      }
      
      if (path.startsWith('/teacher/') && payload.role !== 'teacher') {
        return NextResponse.redirect(new URL('/student/dashboard', req.url));
      }
      
      return NextResponse.next();

    } catch (error) {
      
      if (refreshToken) {
        return NextResponse.next();
      }
      
      const response = NextResponse.redirect(new URL('/auth/login', req.url));
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      return response;
    }
  }

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