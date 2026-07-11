import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchSubmissionHistory,
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
});
