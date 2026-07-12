import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "./lib/auth";

export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const apiMode = (process.env.NEXT_PUBLIC_API_MODE || "mock").toLowerCase();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
  if (apiMode === "mock") {
    return request.cookies.has(AUTH_COOKIE_NAME);
  }

  const cookie = request.headers.get("cookie");
  if (!cookie) return false;
  try {
    const response = await fetch(`${apiBaseUrl}/auth/session`, {
      method: "GET",
      headers: { cookie },
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authenticated = await isAuthenticated(request);

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
