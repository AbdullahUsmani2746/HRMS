import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

// Role-based access control
const rolePermissions = {
  SuperAdmin: ['/admin', '/client', '/employee'], // Full access
  Admin: ['/client', '/employee'],          // Client & Employee pages
  User: ['/employee'],                  // Employee pages only
};

// Map applications to their respective pages
const APPLICATION_PAGES = {
  payroll: ['/payroll', '/reports', '/analytics'], // Payroll-related pages
  crm: ['/crm', '/leads', '/contacts'], // CRM-related pages
};

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;
  console.log(token)

  if (!token) {
    // Redirect unauthenticated users to login
    return NextResponse.redirect(new URL('/login', req.url));
  }

   // Fetch the user's subscription plan from the database
  //  const subscription = await getUserSubscription(token.userId); // Assuming `userId` is in the token

  // Role-based access control
  const allowedPaths = rolePermissions[token.role] || [];
  const isAllowedByRole = allowedPaths.some((path) => pathname.startsWith(path));

 
  // Application-based access control
  // const applicationPages = APPLICATION_PAGES[subscription.application] || [];
  // const isAllowedByApplication = applicationPages.some((path) => pathname.startsWith(path));


   // Redirect unauthorized users (role or subscription)
  //  if (!isAllowedByRole || !isAllowedBySubscription) {
   if (!isAllowedByRole) {

    if (!isAllowedByRole) {
      // Redirect users without the required role
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    } else if (!isAllowedBySubscription) {
      // Redirect users without the required subscription
      return NextResponse.redirect(new URL('/subscription-required', req.url));
    }
  }

  // Allow access to the requested page
  return NextResponse.next();

}

export const config = {
  matcher: [ '/admin/:path*', '/client/:path*', '/employee/:path*'], // Protect these routes
};
