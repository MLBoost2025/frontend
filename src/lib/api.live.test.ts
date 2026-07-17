import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const runPythonInBrowserMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/browserPython", () => ({
  runPythonInBrowser: runPythonInBrowserMock,
}));

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
    runPythonInBrowserMock.mockReset();
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

  it("loads the active live practice suite for browser execution", async () => {
    vi.stubEnv("NEXT_PUBLIC_EXECUTION_MODE", "browser");
    const testcases = [
      { input: '{"value":1}', expectedOutput: '1', isPublic: true },
      { input: '{"value":2}', expectedOutput: '2', isPublic: false },
    ];
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      problemId: "problem-1",
      slug: "dynamic-problem",
      testcaseVersion: 3,
      testcases,
    }));
    vi.stubGlobal("fetch", fetchMock);
    runPythonInBrowserMock.mockResolvedValue({
      submissionId: "local-1",
      problemId: "problem-1",
      mode: "run",
      visibility: "sample",
      status: "Accepted",
      runtimeMs: 10,
      memoryMb: 0,
      score: 100,
      passedCount: 1,
      totalCount: 1,
      message: "Passed.",
      testCases: [],
      source: "browser",
      submittedAt: new Date().toISOString(),
    });

    const { runCode } = await import("./api");
    await runCode("problem-1", "def solve(payload): return payload['value']", "dynamic-problem");

    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "/problems/dynamic-problem/practice"
    );
    expect(runPythonInBrowserMock).toHaveBeenCalledWith(
      "problem-1",
      expect.any(String),
      "run",
      testcases
    );
  });

  it("records the arena-supplied title for problems outside the bundled catalog", async () => {
    vi.stubEnv("NEXT_PUBLIC_EXECUTION_MODE", "browser");
    const testcases = [{ input: '{"value":1}', expectedOutput: "1", isPublic: true }];
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ problemId: "imported-1", slug: "viterbi-decoding", testcaseVersion: 1, testcases })
    );
    vi.stubGlobal("fetch", fetchMock);
    runPythonInBrowserMock.mockResolvedValue({
      submissionId: "local-2",
      problemId: "imported-1",
      mode: "submit",
      visibility: "hidden",
      status: "Accepted",
      runtimeMs: 5,
      memoryMb: 0,
      score: 100,
      passedCount: 8,
      totalCount: 8,
      message: "Passed.",
      testCases: [],
      source: "browser",
      submittedAt: new Date().toISOString(),
    });

    const { submitSolution } = await import("./api");
    // "viterbi-decoding" is an imported problem, absent from the bundled
    // catalog, so metadata resolution must fall back to the passed title.
    await submitSolution(
      "imported-1",
      "def solve(payload): return 1",
      71,
      undefined,
      "viterbi-decoding",
      "Viterbi Decoding"
    );

    const stored = JSON.parse(
      window.localStorage.getItem("katalume.submission.history") || "[]"
    );
    expect(stored.length).toBeGreaterThan(0);
    expect(stored[0].problemTitle).toBe("Viterbi Decoding");
    expect(stored[0].problemTitle).not.toBe("Unknown Problem");
  });

  function acceptedRecord(overrides: Record<string, unknown>) {
    return {
      id: "s",
      problemId: "p",
      problemSlug: "s",
      problemTitle: "P",
      code: "",
      mode: "submit",
      createdAt: new Date().toISOString(),
      result: {
        submissionId: "s",
        problemId: "p",
        mode: "submit",
        visibility: "hidden",
        status: "Accepted",
        runtimeMs: 1,
        memoryMb: 0,
        score: 100,
        passedCount: 8,
        totalCount: 8,
        message: "ok",
        testCases: [],
        source: "browser",
        submittedAt: new Date().toISOString(),
      },
      ...overrides,
    };
  }

  it("derives the profile from local history in browser mode, never from /profile/me", async () => {
    vi.stubEnv("NEXT_PUBLIC_EXECUTION_MODE", "browser");
    window.localStorage.setItem(
      "katalume.submission.history",
      JSON.stringify([acceptedRecord({ problemId: "p-1", problemSlug: "any-slug" })])
    );
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ totalSolved: 0, acceptanceRate: 0 }));
    vi.stubGlobal("fetch", fetchMock);

    const { fetchUserProfile } = await import("./api");
    const profile = await fetchUserProfile();

    // Reflects the local browser-execution history (matching the dashboard),
    // and must not fall back to the backend's 0-solved /profile/me.
    expect(profile.totalSolved).toBe(1);
    expect(fetchMock.mock.calls.every((call) => !String(call[0]).includes("/profile/me"))).toBe(true);
  });

  it("attributes solves of imported (non-bundled) problems to difficulty and topic", async () => {
    vi.stubEnv("NEXT_PUBLIC_EXECUTION_MODE", "browser");
    const meta = {
      slug: "viterbi-decoding",
      id: "imported-1",
      title: "Viterbi Decoding",
      difficulty: "Hard",
      category: "NLP",
    };
    window.localStorage.setItem(
      "katalume.problem.meta",
      JSON.stringify({ "viterbi-decoding": meta, "imported-1": meta })
    );
    window.localStorage.setItem(
      "katalume.submission.history",
      JSON.stringify([acceptedRecord({ problemId: "imported-1", problemSlug: "viterbi-decoding" })])
    );
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({})));

    const { fetchUserStats, fetchUserProfile } = await import("./api");

    const stats = await fetchUserStats();
    expect(stats.byDifficulty.Hard.solved).toBeGreaterThanOrEqual(1);

    const profile = await fetchUserProfile();
    expect(profile.topicProgress.find((topic) => topic.topic === "NLP")?.solved).toBeGreaterThanOrEqual(1);
  });
});
