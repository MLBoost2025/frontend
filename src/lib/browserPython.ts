import type {
  ExecutionMode,
  SubmissionResult,
  SubmissionTestCaseResult,
} from "@/types";

export interface BrowserPracticeCase {
  input: string;
  expectedOutput: string;
  isPublic: boolean;
}

interface WorkerReply {
  id: string;
  ok: boolean;
  runtimeMs: number;
  results?: SubmissionTestCaseResult[];
  error?: string;
}

// The first invocation also compiles the local CPython WebAssembly runtime.
// Budget enough time for low-end/mobile hardware; the disposable worker is
// still forcibly terminated at the deadline.
const EXECUTION_TIMEOUT_MS = 60_000;
const MAX_SOURCE_BYTES = 64_000;

export function runPythonInBrowser(
  problemId: string,
  source: string,
  mode: ExecutionMode,
  cases: BrowserPracticeCase[]
): Promise<SubmissionResult> {
  if (new TextEncoder().encode(source).byteLength > MAX_SOURCE_BYTES) {
    return Promise.reject(new Error("Solutions are limited to 64 KB in local practice mode."));
  }
  if (typeof Worker === "undefined") {
    return Promise.reject(new Error("Browser Python requires Web Worker support."));
  }

  const selected = mode === "run" ? cases.filter((item) => item.isPublic) : cases;
  if (selected.length === 0) {
    return Promise.reject(new Error("This problem has no practice tests."));
  }

  const id = crypto.randomUUID();
  const worker = new Worker("/python-runner.worker.mjs", { type: "module" });

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      worker.terminate();
      reject(new Error("Execution exceeded the 60 second local practice limit."));
    }, EXECUTION_TIMEOUT_MS);

    const finish = () => {
      window.clearTimeout(timeout);
      worker.terminate();
    };

    worker.onerror = () => {
      finish();
      reject(new Error("The local Python sandbox failed to start."));
    };

    worker.onmessage = (event: MessageEvent<WorkerReply>) => {
      if (event.data.id !== id) return;
      finish();
      if (!event.data.ok || !event.data.results) {
        reject(new Error(event.data.error || "Python execution failed."));
        return;
      }

      const testCases = event.data.results;
      const passedCount = testCases.filter((testCase) => testCase.passed).length;
      const totalCount = testCases.length;
      const accepted = passedCount === totalCount;
      const firstError = testCases.find((testCase) => testCase.errorMessage)?.errorMessage;

      resolve({
        submissionId: `local_${Date.now()}`,
        problemId,
        mode,
        visibility: mode === "run" ? "sample" : "hidden",
        status: accepted ? "Accepted" : firstError?.includes("Traceback") ? "Runtime Error" : "Failed",
        runtimeMs: event.data.runtimeMs,
        memoryMb: 0,
        score: Math.round((passedCount / totalCount) * 100),
        passedCount,
        totalCount,
        message: accepted
          ? `Passed all ${totalCount} ${mode === "run" ? "sample" : "practice"} tests locally.`
          : `Passed ${passedCount}/${totalCount} ${mode === "run" ? "sample" : "practice"} tests locally.`,
        traceback: firstError?.includes("Traceback") ? firstError : undefined,
        testCases,
        source: "browser",
        submittedAt: new Date().toISOString(),
      });
    };

    worker.postMessage({
      id,
      source,
      tests: selected.map((testCase, index) => ({
        name: `${testCase.isPublic ? "Sample" : "Practice"} ${index + 1}`,
        visibility: testCase.isPublic ? "sample" : "hidden",
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
      })),
    });
  });
}
