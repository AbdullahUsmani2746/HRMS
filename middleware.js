import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

// Role-based access control
const rolePermissions = {
  SuperAdmin: ['/admin', '/client', '/employee'], // Full access
  Admin: ['/client', '/employee'],          // Client & Employee pages
  User: ['/employee'],                  // Employee pages only
};

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  if (!token) {
    // Redirect unauthenticated users to login
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const allowedPaths = rolePermissions[token.role] || [];
  const isAllowed = allowedPaths.some((path) => pathname.startsWith(path));

  if (!isAllowed) {
    // Redirect unauthorized users to an error or dashboard page
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [ '/admin/:path*', '/client/:path*', '/employee/:path*'], // Protect these routes
};
