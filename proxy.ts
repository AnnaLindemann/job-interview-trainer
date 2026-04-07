import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

const publicRoutes = new Set(["/login", "/register", "/auth/signin"]);

export default auth((request) => {
  const { nextUrl } = request;
  const isLoggedIn = Boolean(request.auth?.user);
  const isPublicRoute = publicRoutes.has(nextUrl.pathname);

  if (isPublicRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|api/auth/register|_next/static|_next/image|favicon.ico|manifest.webmanifest|icon|apple-icon|sw.js|robots.txt|sitemap.xml).*)",
  ],
};