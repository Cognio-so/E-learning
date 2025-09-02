import { NextResponse } from 'next/server';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get('accessToken')?.value;
  
  // Debug logging
  console.log('🔍 Middleware Debug:', {
    pathname,
    hasAccessToken: !!accessToken,
    tokenLength: accessToken?.length || 0,
    allCookies: req.cookies.getAll().map(c => c.name)
  });

  // Public routes that don't need authentication
  const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/verify'];
  const isVerifyRoute = pathname.startsWith('/auth/verify/');
  const isPublicRoute = publicRoutes.includes(pathname) || isVerifyRoute;

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if user is authenticated for protected routes
  if (!accessToken) {
    console.log('❌ No access token, redirecting to login');
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  console.log('✅ Access token found, allowing access');
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}