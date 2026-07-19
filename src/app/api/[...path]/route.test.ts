import { afterEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import { GET, POST } from "./route";

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
      headers: {
        "content-type": "application/json",
        "x-request-id": "trace-1",
        "x-next-cursor": "665f0c1d2e3a4b5c6d7e8f90",
      },
    }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(request("https://app.example.com", '{"email":"a@example.com"}'), context);
    expect(response.status).toBe(201);
    expect(response.headers.get("x-request-id")).toBe("trace-1");
    expect(response.headers.get("x-next-cursor")).toBe("665f0c1d2e3a4b5c6d7e8f90");
    expect(await response.json()).toEqual({ ok: true });
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://backend.internal/api/auth/login");
    expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({
      method: "POST",
      cache: "no-store",
      redirect: "manual",
    }));
  });

  it("passes OAuth redirects and cookies back to the browser without following them", async () => {
    vi.stubEnv("BACKEND_API_URL", "https://backend.internal/api");
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, {
      status: 302,
      headers: {
        location: "https://accounts.example.test/authorize",
        "set-cookie": "katalume_oauth_state=state; Path=/; HttpOnly; Secure; SameSite=Lax",
      },
    }));
    vi.stubGlobal("fetch", fetchMock);
    const nextUrl = new URL("https://app.example.com/api/auth/oauth/google");
    const oauthRequest = {
      method: "GET",
      headers: new Headers({ host: "app.example.com", "x-forwarded-proto": "https" }),
      nextUrl,
      arrayBuffer: async () => new ArrayBuffer(0),
    } as unknown as NextRequest;

    const response = await GET(oauthRequest, {
      params: Promise.resolve({ path: ["auth", "oauth", "google"] }),
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://accounts.example.test/authorize");
    expect(response.headers.get("set-cookie")).toContain("katalume_oauth_state=state");
    expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({ redirect: "manual" }));
  });
});
