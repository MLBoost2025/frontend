import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { isAuthenticated, proxy } from "./proxy";

describe("session proxy", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("keeps the local mock cookie gate for standalone mode", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_MODE", "mock");
    const request = new NextRequest("http://localhost:3000/problems", {
      headers: { cookie: "mlboost_auth=1" },
    });
    expect(await isAuthenticated(request)).toBe(true);
  });

  it("rejects a forged client cookie in live mode", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_MODE", "live");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 401 })));
    const request = new NextRequest("http://localhost:3000/profile", {
      headers: { cookie: "mlboost_auth=1" },
    });

    const response = await proxy(request);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?redirect=%2Fprofile");
  });

  it("allows a backend-validated signed session", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_MODE", "live");
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const request = new NextRequest("http://localhost:3000/problems", {
      headers: { cookie: "mlboost_session=signed-token" },
    });

    const response = await proxy(request);
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:5001/api/auth/session",
      expect.objectContaining({ headers: { cookie: "mlboost_session=signed-token" } })
    );
  });
});
