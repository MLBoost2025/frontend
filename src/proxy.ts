import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "./lib/auth";

function hasValidSessionCookie(request: NextRequest): boolean {
  const value = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!value) {
    return false;
  }

  const expiryMs = Number(value);
  if (Number.isFinite(expiryMs)) {
    return expiryMs > Date.now();
  }

  return true;
}

function isPublicPath(pathname: string): boolean {
  return pathname === "/login";
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAuthenticated = hasValidSessionCookie(request);

  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/problems", request.url));
  }

  if (isPublicPath(pathname) || isAuthenticated) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  const redirectTarget = `${pathname}${search}`;
  if (redirectTarget !== "/") {
    loginUrl.searchParams.set("redirect", redirectTarget);
  } else {
    loginUrl.searchParams.set("redirect", "/problems");
  }

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
