// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'
// import jwt from 'jsonwebtoken'

// export async function middleware(request: NextRequest) {
//   const token = request.cookies.get('token')?.value

//   // Protect dashboard routes
//   if (request.nextUrl.pathname.startsWith('/dashboard')) {
//     if (!token) {
//       return NextResponse.redirect(new URL('/signin', request.url))
//     }

//     try {
//       jwt.verify(token, process.env.JWT_SECRET!)
//       return NextResponse.next()
//     } catch {
//       return NextResponse.redirect(new URL('/signin', request.url))
//     }
//   }

//   // Redirect authenticated users from auth pages
//   if (request.nextUrl.pathname.startsWith('/signin') ||
//       request.nextUrl.pathname.startsWith('/signup')) {
//     if (token) {
//       try {
//         jwt.verify(token, process.env.JWT_SECRET!)
//         return NextResponse.redirect(new URL('/dashboard', request.url))
//       } catch {
//         // Invalid token, continue to auth pages
//       }
//     }
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: ['/dashboard/:path*', '/signin', '/signup']
// }

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    console.log("middleware", req.nextauth.token);
    const token = req.nextauth.token;
    console.log("token", token);
    const isAdmin = token?.role === "ADMIN";
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Allow authenticated users to access protected routes
    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/signin",
    },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard", "/leaderboard", "/admin:path*"], // Protect specific pages
};
