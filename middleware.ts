import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "./src/lib/auth";

function isAuthenticated(request: NextRequest): boolean {
  return request.cookies.has(AUTH_COOKIE_NAME);
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authenticated = isAuthenticated(request);

  if (pathname === "/login" && authenticated) {
    const problemsUrl = new URL("/problems", request.url);
    return NextResponse.redirect(problemsUrl);
  }

  if (!authenticated && pathname !== "/login") {
    const loginUrl = new URL("/login", request.url);
    const redirectPath = `${pathname}${search}`;
    loginUrl.searchParams.set("redirect", redirectPath);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/problems/:path*",
    "/competitions/:path*",
    "/learn/:path*",
    "/tracks/:path*",
    "/progress/:path*",
    "/profile/:path*",
  ],
};
