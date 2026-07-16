import { afterEach, describe, expect, it, vi } from "vitest";
import { runPythonInBrowser, type BrowserPracticeCase } from "@/lib/browserPython";

class FakeWorker {
  static lastMessage: { tests: Array<{ visibility: string }> } | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  terminate = vi.fn();

  postMessage(message: { id: string; tests: Array<{ visibility: string }> }) {
    FakeWorker.lastMessage = message;
    queueMicrotask(() => {
      this.onmessage?.({
        data: {
          id: message.id,
          ok: true,
          runtimeMs: 17,
          results: message.tests.map((test, index) => ({
            name: `Test ${index + 1}`,
            visibility: test.visibility,
            passed: true,
          })),
        },
      } as MessageEvent);
    });
  }
}

const cases: BrowserPracticeCase[] = [
  { input: "{}", expectedOutput: "1", isPublic: true },
  { input: "{}", expectedOutput: "2", isPublic: true },
  { input: "{}", expectedOutput: "3", isPublic: false },
];

describe("browser Python client", () => {
  const originalWorker = globalThis.Worker;

  afterEach(() => {
    globalThis.Worker = originalWorker;
    FakeWorker.lastMessage = null;
  });

  it("runs only public examples in Run mode", async () => {
    globalThis.Worker = FakeWorker as unknown as typeof Worker;
    const result = await runPythonInBrowser("p-001", "def solve(payload): return 1", "run", cases);

    expect(FakeWorker.lastMessage?.tests).toHaveLength(2);
    expect(result.source).toBe("browser");
    expect(result.status).toBe("Accepted");
    expect(result.totalCount).toBe(2);
  });

  it("checks the full local practice suite in Submit mode", async () => {
    globalThis.Worker = FakeWorker as unknown as typeof Worker;
    const result = await runPythonInBrowser("p-001", "def solve(payload): return 1", "submit", cases);

    expect(FakeWorker.lastMessage?.tests).toHaveLength(3);
    expect(result.totalCount).toBe(3);
    expect(result.message).toContain("locally");
  });

  it("fails clearly when Web Workers are unavailable", async () => {
    // @ts-expect-error exercise a browser without Worker support
    globalThis.Worker = undefined;
    await expect(runPythonInBrowser("p-001", "", "run", cases)).rejects.toThrow(
      "requires Web Worker support"
    );
  });
});
