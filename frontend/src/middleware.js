import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const path = req.nextUrl.pathname;
  const accessToken = req.cookies.get('accessToken')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;

  // Ensure we're working with HTTPS URLs in production
  const baseUrl = req.nextUrl.clone();
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/verify'];
  const isVerifyRoute = path.match(/^\/auth\/verify\/[^\/]+$/);
  const isPublicRoute = publicRoutes.includes(path) || !!isVerifyRoute;

  // If it's a public route, allow access
  if (isPublicRoute) {
    // Only redirect authenticated users away from login/register pages
    if (accessToken && (path === '/auth/login' || path === '/auth/register')) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(accessToken, secret, {
          issuer: 'ED_TECH',
        });

        const dashboardPath = payload.role === 'student' ? '/student/dashboard' : '/teacher/dashboard';
        const dashboardUrl = new URL(dashboardPath, baseUrl);
        return NextResponse.redirect(dashboardUrl);
      } catch (error) {
        // Token is invalid, clear cookies and allow access to login
        const response = NextResponse.next();
        response.cookies.set('accessToken', '', { 
          expires: new Date(0),
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });
        response.cookies.set('refreshToken', '', { 
          expires: new Date(0),
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });
        return response;
      }
    }
    
    // For root path, redirect authenticated users to their dashboard
    if (path === '/' && accessToken) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(accessToken, secret, {
          issuer: 'ED_TECH',
        });

        const dashboardPath = payload.role === 'student' ? '/student/dashboard' : '/teacher/dashboard';
        const dashboardUrl = new URL(dashboardPath, baseUrl);
        return NextResponse.redirect(dashboardUrl);
      } catch (error) {
        // Token is invalid, allow access to home page
        const response = NextResponse.next();
        response.cookies.set('accessToken', '', { 
          expires: new Date(0),
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });
        response.cookies.set('refreshToken', '', { 
          expires: new Date(0),
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });
        return response;
      }
    }
    
    return NextResponse.next();
  }

  // Handle protected routes (student and teacher routes)
  if (!accessToken && !refreshToken) {
    const loginUrl = new URL('/auth/login', baseUrl);
    return NextResponse.redirect(loginUrl);
  }

  if (accessToken) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(accessToken, secret, {
        issuer: 'ED_TECH',
      });

      // Role-based access control
      if (path.startsWith('/student/') && payload.role !== 'student') {
        const teacherUrl = new URL('/teacher/dashboard', baseUrl);
        return NextResponse.redirect(teacherUrl);
      }
      
      if (path.startsWith('/teacher/') && payload.role !== 'teacher') {
        const studentUrl = new URL('/student/dashboard', baseUrl);
        return NextResponse.redirect(studentUrl);
      }
      
      return NextResponse.next();

    } catch (error) {
      // Token is invalid
      if (refreshToken) {
        // Let the page handle token refresh
        return NextResponse.next();
      }
      
      // No refresh token, redirect to login
      const loginUrl = new URL('/auth/login', baseUrl);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set('accessToken', '', { 
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
      });
      response.cookies.set('refreshToken', '', { 
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
      });
      return response;
    }
  }

  // Has refresh token but no access token - let the page handle refresh
  if (refreshToken) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/auth/login', baseUrl);
  return NextResponse.redirect(loginUrl);
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