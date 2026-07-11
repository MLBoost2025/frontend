import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchRecentActivity,
  fetchSubmissionHistory,
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
    document.cookie = "mlboost_auth=; path=/; max-age=0";
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
    expect(history[0].result.source).toBe("mock");
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
});
