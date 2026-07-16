import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const runPythonInBrowserMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/browserPython", () => ({
  runPythonInBrowser: runPythonInBrowserMock,
}));

import {
  fetchCompetitions,
  fetchLeaderboard,
  fetchLearningTracks,
  fetchRecentActivity,
  fetchSubmissionHistory,
  fetchUserProgress,
  fetchUserStats,
  getCurrentSession,
  loginUser,
  runCode,
  submitSolution,
} from "@/lib/api";

describe("mock api", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
    document.cookie = "katalume_auth=; path=/; max-age=0";
    runPythonInBrowserMock.mockImplementation(
      async (problemId: string, code: string, mode: "run" | "submit") => {
        const accepted = !/\bpass\b|NotImplementedError/.test(code);
        const totalCount = mode === "run" ? 2 : 8;
        const passedCount = accepted ? totalCount : 0;
        return {
          submissionId: `local_${Date.now()}`,
          problemId,
          mode,
          visibility: mode === "run" ? "sample" : "hidden",
          status: accepted ? "Accepted" : "Failed",
          runtimeMs: 10,
          memoryMb: 0,
          score: accepted ? 100 : 0,
          passedCount,
          totalCount,
          message: accepted ? "Passed locally." : "Practice tests failed.",
          testCases: Array.from({ length: totalCount }, (_, index) => ({
            name: `Test ${index + 1}`,
            visibility: mode === "run" ? "sample" : "hidden",
            passed: accepted,
          })),
          source: "browser",
          submittedAt: new Date().toISOString(),
        };
      }
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates and restores a mock login session", async () => {
    const loginPromise = loginUser({
      email: "alice@example.com",
      password: "secret123",
    });

    await vi.runAllTimersAsync();
    const session = await loginPromise;

    expect(session.user.email).toBe("alice@example.com");

    const currentSessionPromise = getCurrentSession();
    await vi.runAllTimersAsync();
    const currentSession = await currentSessionPromise;

    expect(currentSession?.accessToken).toBeTruthy();
    expect(currentSession?.user.name).toBe("Alice");
  });

  it("returns accepted status for a strong run", async () => {
    const runPromise = runCode(
      "p-004",
      `def binary_f1(y_true, y_pred):\n    tp = 1\n    precision = 1\n    recall = 1\n    return 1`
    );

    await vi.runAllTimersAsync();
    const result = await runPromise;

    expect(result.status).toBe("Accepted");
    expect(result.testCases.length).toBeGreaterThan(0);
    expect(result.testCases.every((testCase) => testCase.passed)).toBe(true);
  });

  it("uses the slug catalog key when the live problem id is a database id", async () => {
    const result = await runCode(
      "66f1234567890abcdef12345",
      "def solve(payload): return 1",
      "healthcare-feature-mean"
    );

    expect(result.problemId).toBe("66f1234567890abcdef12345");
    expect(runPythonInBrowserMock).toHaveBeenCalledWith(
      "66f1234567890abcdef12345",
      expect.any(String),
      "run",
      expect.arrayContaining([expect.objectContaining({ isPublic: true })])
    );

    const historyPromise = fetchSubmissionHistory("healthcare-feature-mean");
    await vi.runAllTimersAsync();
    const history = await historyPromise;
    expect(history[0]).toEqual(
      expect.objectContaining({
        problemId: "66f1234567890abcdef12345",
        problemSlug: "healthcare-feature-mean",
      })
    );
  });

  it("returns failed status for placeholder submission", async () => {
    const submitPromise = submitSolution(
      "p-001",
      `def fit_and_predict(X_train, y_train, X_test, k):\n    pass`
    );

    await vi.runAllTimersAsync();
    const result = await submitPromise;

    expect(result.status).toBe("Failed");
    expect(result.score).toBeLessThan(100);
  });

  it("records a mock submission in local history", async () => {
    const submitPromise = submitSolution(
      "p-004",
      `def binary_f1(y_true, y_pred):\n    return 1`
    );
    await vi.runAllTimersAsync();
    await submitPromise;

    const historyPromise = fetchSubmissionHistory("p-004");
    await vi.runAllTimersAsync();
    const history = await historyPromise;

    expect(history.length).toBeGreaterThan(0);
    expect(history[0].result.source).toBe("browser");
  });

  it("derives user stats from mock submission history", async () => {
    const emptyPromise = fetchUserStats();
    await vi.runAllTimersAsync();
    const empty = await emptyPromise;
    expect(empty.solved).toBe(0);
    expect(empty.totalProblems).toBeGreaterThan(0);

    const submitPromise = submitSolution(
      "p-004",
      `def binary_f1(y_true, y_pred):\n    return 1`
    );
    await vi.runAllTimersAsync();
    await submitPromise;

    const statsPromise = fetchUserStats();
    await vi.runAllTimersAsync();
    const stats = await statsPromise;

    // The submission is counted, and the problem lands in solved or attempted.
    expect(stats.totalSubmissions).toBeGreaterThanOrEqual(1);
    expect(stats.solved + stats.attempted).toBeGreaterThanOrEqual(1);
  });

  it("returns recent activity from mock submissions", async () => {
    const emptyPromise = fetchRecentActivity(5);
    await vi.runAllTimersAsync();
    expect(await emptyPromise).toEqual([]);

    const submitPromise = submitSolution(
      "p-004",
      `def binary_f1(y_true, y_pred):\n    return 1`
    );
    await vi.runAllTimersAsync();
    await submitPromise;

    const activityPromise = fetchRecentActivity(5);
    await vi.runAllTimersAsync();
    const activity = await activityPromise;

    expect(activity.length).toBeGreaterThanOrEqual(1);
    expect(activity[0].title).toBeTruthy();
    expect(["Easy", "Medium", "Hard"]).toContain(activity[0].difficulty);
  });

  it("returns mock competitions with computed statuses", async () => {
    const promise = fetchCompetitions();
    await vi.runAllTimersAsync();
    const competitions = await promise;

    expect(competitions.length).toBeGreaterThan(0);
    for (const c of competitions) {
      expect(["upcoming", "live", "ended"]).toContain(c.status);
    }
    expect(competitions.some((c) => c.status === "live")).toBe(true);
    expect(competitions.some((c) => c.status === "upcoming")).toBe(true);
  });

  it("returns a mock leaderboard", async () => {
    const promise = fetchLeaderboard(3);
    await vi.runAllTimersAsync();
    const board = await promise;
    expect(board).toHaveLength(3);
    expect(board[0].rank).toBe(1);
    expect(board[0].solved).toBeGreaterThan(0);
  });

  it("returns a 7-day progress week from mock history", async () => {
    const promise = fetchUserProgress();
    await vi.runAllTimersAsync();
    const progress = await promise;
    expect(progress.weekly).toHaveLength(7);
    expect(progress.currentStreak).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(progress.topics)).toBe(true);
  });

  it("returns mock learning tracks with lesson counts", async () => {
    const promise = fetchLearningTracks();
    await vi.runAllTimersAsync();
    const tracks = await promise;

    expect(tracks.length).toBeGreaterThan(0);
    expect(tracks[0].title).toBeTruthy();
    expect(tracks[0].lessonCount).toBe(tracks[0].lessons.length);
  });
});
