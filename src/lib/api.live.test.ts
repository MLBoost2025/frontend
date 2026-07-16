import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: vi.fn().mockResolvedValue(body === undefined ? "" : JSON.stringify(body)),
  } as unknown as Response;
}

describe("live API contract", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_API_MODE", "live");
    vi.stubEnv("NEXT_PUBLIC_API_FALLBACK_TO_MOCK", "false");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.test/api");
    vi.stubEnv("NEXT_PUBLIC_EXECUTION_MODE", "server");
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("keeps live credentials out of browser storage", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      accessToken: "server-returned-token",
      user: { id: "u1", username: "Alice", email: "alice@example.com", roles: ["User"] },
    }));
    vi.stubGlobal("fetch", fetchMock);
    const { loginUser } = await import("./api");
    const session = await loginUser({ email: "alice@example.com", password: "secret123" });

    expect(session.user.name).toBe("Alice");
    expect(window.localStorage.getItem("accessToken")).toBeNull();
    expect(window.localStorage.getItem("katalume.mock.session")).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/api/auth/login",
      expect.objectContaining({ credentials: "include" })
    );
  });

  it("uses the runner job contract and polls to completion", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ id: "job-1", status: "queued" }, 202))
      .mockResolvedValueOnce(jsonResponse({
        id: "job-1",
        status: "completed",
        result: { status: "Accepted", statusId: 3, time: 0.02, memory: 2048, stdout: "ok" },
      }));
    vi.stubGlobal("fetch", fetchMock);
    const { runCode } = await import("./api");
    const result = await runCode("p1", "print(1)");

    expect(result.status).toBe("Accepted");
    expect(result.source).toBe("live");
    expect(String(fetchMock.mock.calls[0][0]).endsWith("/runner/run")).toBe(true);
    expect(String(fetchMock.mock.calls[1][0]).endsWith("/runner/jobs/job-1")).toBe(true);
  });

  it("submits with an idempotency key and polls the canonical submission resource", async () => {
    vi.stubGlobal("crypto", { randomUUID: () => "request-uuid" });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ _id: "sub-1", status: "Queued" }, 202))
      .mockResolvedValueOnce(jsonResponse({
        _id: "sub-1", status: "Wrong Answer", runtime: 0.1, memory: 1024,
      }));
    vi.stubGlobal("fetch", fetchMock);
    const { submitSolution } = await import("./api");
    const result = await submitSolution("p1", "print(0)");

    expect(result.status).toBe("Failed");
    expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({
      headers: expect.objectContaining({ "Idempotency-Key": "request-uuid" }),
    }));
    expect(String(fetchMock.mock.calls[1][0]).endsWith("/submissions/sub-1")).toBe(true);
  });
});
