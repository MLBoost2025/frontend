import { afterEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import { POST } from "./route";

function request(origin: string, body = "{}") {
  const nextUrl = new URL("http://internal:3000/api/auth/login");
  return {
    method: "POST",
    headers: new Headers({
      origin,
      host: "app.example.com",
      "x-forwarded-proto": "https",
      "content-type": "application/json",
      cookie: "katalume_session=session",
    }),
    nextUrl,
    arrayBuffer: async () => new TextEncoder().encode(body).buffer,
  } as unknown as NextRequest;
}

const context = { params: Promise.resolve({ path: ["auth", "login"] }) };

describe("same-origin API gateway", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("rejects cross-origin mutations before contacting the backend", async () => {
    vi.stubEnv("BACKEND_API_URL", "https://backend.internal/api");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(request("https://evil.example"), context);
    expect(response.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards same-origin requests and preserves operational response headers", async () => {
    vi.stubEnv("BACKEND_API_URL", "https://backend.internal/api");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers: { "content-type": "application/json", "x-request-id": "trace-1" },
    }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(request("https://app.example.com", '{"email":"a@example.com"}'), context);
    expect(response.status).toBe(201);
    expect(response.headers.get("x-request-id")).toBe("trace-1");
    expect(await response.json()).toEqual({ ok: true });
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://backend.internal/api/auth/login");
    expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({ method: "POST", cache: "no-store" }));
  });
});
