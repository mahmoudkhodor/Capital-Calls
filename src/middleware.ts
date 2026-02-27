import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes
    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    // Startup routes
    if (path.startsWith('/startup') && token?.role !== 'STARTUP') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    // Investor routes
    if (path.startsWith('/investor') && token?.role !== 'INVESTOR') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/startup/:path*', '/investor/:path*'],
};
