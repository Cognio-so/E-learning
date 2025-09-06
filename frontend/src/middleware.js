import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-jwt-secret-key');

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  
  console.log('🔍 Middleware running for:', pathname);

  const roleRoutes = {
    admin: ['/admin'],
    teacher: ['/teacher'],
    student: ['/student']
  };

  const protectedPaths = ['/student', '/teacher', '/admin'];
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  try {
    const accessToken = req.cookies.get('accessToken')?.value;
    
    if (!accessToken) {
      console.log('❌ No access token found, redirecting to login');
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    const { payload } = await jwtVerify(accessToken, JWT_SECRET);
    const userRole = payload.role;

    console.log('👤 User role:', userRole, 'Accessing:', pathname);

    const allowedRoutes = roleRoutes[userRole] || [];
    const hasAccess = allowedRoutes.some(route => pathname.startsWith(route));

    if (!hasAccess) {
      console.log('🚫 Access denied for role:', userRole, 'to path:', pathname);
      
      const redirectPath = userRole === 'admin' ? '/admin/dashboard' 
                         : userRole === 'teacher' ? '/teacher/dashboard'
                         : userRole === 'student' ? '/student/dashboard'
                         : '/auth/login';
      
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }

    console.log('✅ Access granted for role:', userRole, 'to path:', pathname);
    return NextResponse.next();

  } catch (error) {
    console.error('🔐 JWT verification failed:', error);
    
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}

export const config = {
  matcher: [
    '/student/:path*',
    '/teacher/:path*',
    '/admin/:path*',
  ],
}