import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const responseHeaders = [
  "content-type",
  "content-disposition",
  "cache-control",
  "location",
  "retry-after",
  "x-request-id",
  "ratelimit",
  "ratelimit-policy",
];

async function forward(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const backend = process.env.BACKEND_API_URL;
  if (!backend) {
    return NextResponse.json({ message: "Backend API is not configured" }, { status: 503 });
  }
  const origin = request.headers.get("origin");
  const publicHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const publicProtocol = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "");
  const publicOrigin = publicHost ? `${publicProtocol}://${publicHost}` : request.nextUrl.origin;
  if (!["GET", "HEAD"].includes(request.method) && origin && origin !== publicOrigin) {
    return NextResponse.json({ message: "Cross-origin mutation rejected" }, { status: 403 });
  }
  const { path } = await context.params;
  const base = backend.endsWith("/") ? backend : `${backend}/`;
  const target = new URL(path.map(encodeURIComponent).join("/"), base);
  target.search = request.nextUrl.search;

  const headers = new Headers();
  for (const name of ["content-type", "cookie", "idempotency-key", "x-request-id", "user-agent"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("x-forwarded-host", request.nextUrl.host);
  headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));
  const forwardedFor = request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for");
  if (forwardedFor) headers.set("x-forwarded-for", forwardedFor);

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const requestBody = hasBody ? await request.arrayBuffer() : undefined;
  if (requestBody && requestBody.byteLength > 102400) {
    return NextResponse.json({ message: "Request body exceeds 100 KB" }, { status: 413 });
  }
  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: requestBody,
      cache: "no-store",
      // OAuth endpoints answer with redirects that must be completed by the
      // user's browser. Following them here would send the provider's login
      // page back as an API response and prevent cookies from being set on the
      // public web-app origin.
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return NextResponse.json({
      message: "Backend API is unavailable",
      requestId: request.headers.get("x-request-id") || undefined,
    }, { status: 502 });
  }

  const outgoing = new Headers();
  for (const name of responseHeaders) {
    const value = upstream.headers.get(name);
    if (value) outgoing.set(name, value);
  }
  const getSetCookie = (upstream.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  const fallbackCookie = upstream.headers.get("set-cookie");
  const cookies = getSetCookie
    ? getSetCookie.call(upstream.headers)
    : fallbackCookie ? [fallbackCookie] : [];
  for (const cookie of cookies) outgoing.append("set-cookie", cookie);

  return new NextResponse(upstream.status === 204 ? null : await upstream.arrayBuffer(), {
    status: upstream.status,
    headers: outgoing,
  });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
