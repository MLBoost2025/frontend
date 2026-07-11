"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Group, Panel, Separator } from "react-resizable-panels";
import {
  ArrowLeft,
  ChevronRight,
  Clock3,
  Loader2,
  Play,
  RefreshCcw,
  RotateCw,
  SendHorizontal,
} from "lucide-react";
import {
  fetchProblemBySlug,
  fetchSubmissionHistory,
  runCode,
  submitSolution,
} from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { ProblemDetail, SubmissionRecord, SubmissionResult } from "@/types";
import ThemeSwitcher from "@/app/components/ThemeSwitcher";

const MonacoEditor = dynamic(
  async () => (await import("@monaco-editor/react")).default,
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
        Loading editor...
      </div>
    ),
  }
);

function getDraftStorageKey(slug: string): string {
  return `mlboost:draft:${slug}`;
}

function formatSubmissionDate(value: string): string {
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DifficultyBadge({ difficulty }: { difficulty: ProblemDetail["difficulty"] }) {
  const classes =
    difficulty === "Easy"
      ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300 dark:border-emerald-500/20"
      : difficulty === "Medium"
      ? "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300 dark:border-amber-500/20"
      : "bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-300 dark:border-red-500/20";

  return (
    <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${classes}`}>
      {difficulty}
    </span>
  );
}

function ResultView({ result }: { result: SubmissionResult | null }) {
  if (!result) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-sm text-zinc-500 dark:text-zinc-400">
        No execution yet for this tab.
      </div>
    );
  }

  const positive = result.status === "Accepted";

  return (
    <div className="h-full overflow-y-auto p-4 text-sm">
      <div
        className={`mb-4 rounded-md border px-3 py-2 ${
          positive
            ? "border-emerald-500/40 bg-emerald-500/10 dark:border-emerald-700/50"
            : "border-rose-500/40 bg-rose-500/10 dark:border-rose-700/50"
        }`}
      >
        <div
          className={`font-semibold ${
            positive
              ? "text-emerald-700 dark:text-emerald-300"
              : "text-rose-700 dark:text-rose-300"
          }`}
        >
          {result.status}
        </div>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{result.message}</p>
        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {result.mode === "run" ? "Sample" : "Hidden"} tests: {result.passedCount}/
          {result.totalCount} | Runtime: {result.runtimeMs}ms | Memory: {result.memoryMb}MB
          <span className="ml-2 rounded border border-zinc-300 px-1.5 py-0.5 text-[10px] uppercase tracking-wide dark:border-zinc-700">
            {result.source}
          </span>
        </div>
      </div>

      {result.traceback ? (
        <pre className="mb-4 overflow-x-auto rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-700 dark:border-rose-700/40 dark:text-rose-200">
          {result.traceback}
        </pre>
      ) : null}

      <div className="space-y-2">
        {result.testCases.map((testCase) => (
          <article
            key={`${testCase.visibility}-${testCase.name}`}
            className={`rounded-md border px-3 py-2 ${
              testCase.passed
                ? "border-emerald-500/40 bg-emerald-500/5 dark:border-emerald-700/40"
                : "border-rose-500/40 bg-rose-500/5 dark:border-rose-700/40"
            }`}
          >
            <p
              className={
                testCase.passed
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-rose-700 dark:text-rose-300"
              }
            >
              {testCase.name}: {testCase.passed ? "Passed" : "Failed"}
            </p>
            {testCase.input ? (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Input: {testCase.input}</p>
            ) : null}
            {testCase.expectedOutput ? (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Expected: {testCase.expectedOutput}
              </p>
            ) : null}
            {testCase.actualOutput ? (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Got: {testCase.actualOutput}</p>
            ) : null}
            {testCase.errorMessage ? (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{testCase.errorMessage}</p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}

export default function ProblemArenaPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const { resolvedTheme } = useTheme();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [code, setCode] = useState("");
  const [runResult, setRunResult] = useState<SubmissionResult | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmissionResult | null>(null);
  const [history, setHistory] = useState<SubmissionRecord[]>([]);
  const [activeLeftTab, setActiveLeftTab] = useState<"description" | "editorial" | "history">(
    "description"
  );
  const [activeConsoleTab, setActiveConsoleTab] = useState<"sample" | "hidden">(
    "sample"
  );
  const [activePane, setActivePane] = useState<"problem" | "editor" | "console">(
    "editor"
  );
  const [isLoadingProblem, setIsLoadingProblem] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(true);
  const [isEditorialUnlocked, setIsEditorialUnlocked] = useState(false);

  // Editor theme follows the app theme (next-themes), so there is no separate
  // theme-detection mechanism competing with it.
  const editorTheme = resolvedTheme === "light" ? "light" : "vs-dark";

  const problemPaneRef = useRef<HTMLElement | null>(null);
  const consolePaneRef = useRef<HTMLElement | null>(null);
  const editorRef = useRef<{ focus: () => void } | null>(null);

  const isExecuting = isRunning || isSubmitting;

  const canExecute = useMemo(
    () => Boolean(problem && code.trim()) && !isExecuting,
    [problem, code, isExecuting]
  );

  const refreshHistory = useCallback(async (identifier: string) => {
    try {
      setIsLoadingHistory(true);
      const entries = await fetchSubmissionHistory(identifier);
      setHistory(entries);

      const accepted = entries.some(
        (entry) => entry.mode === "submit" && entry.result.status === "Accepted"
      );
      setIsEditorialUnlocked(accepted);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const desktopMedia = window.matchMedia("(min-width: 1024px)");
    const syncLayout = () => setIsDesktop(desktopMedia.matches);

    syncLayout();
    desktopMedia.addEventListener("change", syncLayout);

    return () => {
      desktopMedia.removeEventListener("change", syncLayout);
    };
  }, []);

  useEffect(() => {
    if (!slug) {
      setError("Missing problem slug.");
      setIsLoadingProblem(false);
      return;
    }

    let isActive = true;

    const loadProblem = async () => {
      try {
        setIsLoadingProblem(true);
        setError(null);

        const data = await fetchProblemBySlug(slug);
        if (!isActive) {
          return;
        }

        setProblem(data);

        if (typeof window !== "undefined") {
          const savedDraft = window.localStorage.getItem(getDraftStorageKey(data.slug));
          setCode(savedDraft ?? data.starterCode);
        } else {
          setCode(data.starterCode);
        }

        await refreshHistory(data.slug);
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        const message =
          loadError instanceof Error ? loadError.message : "Unable to load problem.";
        setError(message);
      } finally {
        if (isActive) {
          setIsLoadingProblem(false);
        }
      }
    };

    void loadProblem();

    return () => {
      isActive = false;
    };
  }, [slug, refreshHistory]);

  useEffect(() => {
    if (!problem || typeof window === "undefined") {
      return;
    }

    const key = getDraftStorageKey(problem.slug);
    const timer = window.setTimeout(() => {
      if (!code.trim() || code.trim() === problem.starterCode.trim()) {
        window.localStorage.removeItem(key);
        return;
      }
      window.localStorage.setItem(key, code);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [problem, code]);

  const executeRun = useCallback(
    async (sourceCode: string) => {
      if (!problem || isExecuting || !sourceCode.trim()) {
        return;
      }

      try {
        setIsRunning(true);
        const result = await runCode(problem.id, sourceCode, problem.slug, problem.title);
        setRunResult(result);
        setActiveConsoleTab("sample");
        await refreshHistory(problem.slug);
      } catch (runError) {
        const failed =
          runError instanceof Error ? runError.message : "Unexpected run-time failure.";
        setRunResult({
          submissionId: `sub_${Date.now()}`,
          problemId: problem.id,
          status: "Runtime Error",
          runtimeMs: 0,
          memoryMb: 0,
          score: 0,
          message: "Run failed.",
          mode: "run",
          visibility: "sample",
          passedCount: 0,
          totalCount: 0,
          traceback: failed,
          testCases: [],
          source: "mock",
          submittedAt: new Date().toISOString(),
        });
      } finally {
        setIsRunning(false);
      }
    },
    [problem, isExecuting, refreshHistory]
  );

  const executeSubmit = useCallback(
    async (sourceCode: string) => {
      if (!problem || isExecuting || !sourceCode.trim()) {
        return;
      }

      try {
        setIsSubmitting(true);
        const result = await submitSolution(
          problem.id,
          sourceCode,
          71,
          undefined,
          problem.slug,
          problem.title
        );
        setSubmitResult(result);
        setActiveConsoleTab("hidden");

        if (result.status === "Accepted") {
          setIsEditorialUnlocked(true);
          void trackEvent({
            name: "editorial_unlocked",
            payload: { problemId: problem.id, slug: problem.slug },
          });
        }

        await refreshHistory(problem.slug);
      } catch (submitError) {
        const failed =
          submitError instanceof Error
            ? submitError.message
            : "Unexpected submission failure.";

        setSubmitResult({
          submissionId: `sub_${Date.now()}`,
          problemId: problem.id,
          status: "Runtime Error",
          runtimeMs: 0,
          memoryMb: 0,
          score: 0,
          message: "Submission failed.",
          mode: "submit",
          visibility: "hidden",
          passedCount: 0,
          totalCount: 0,
          traceback: failed,
          testCases: [],
          source: "mock",
          submittedAt: new Date().toISOString(),
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [problem, isExecuting, refreshHistory]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isInputLike =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        if (event.shiftKey) {
          void executeSubmit(code);
        } else {
          void executeRun(code);
        }
        return;
      }

      if (event.altKey && !isInputLike) {
        if (event.key === "1") {
          event.preventDefault();
          setActivePane("problem");
          problemPaneRef.current?.focus();
        }
        if (event.key === "2") {
          event.preventDefault();
          setActivePane("editor");
          editorRef.current?.focus();
        }
        if (event.key === "3") {
          event.preventDefault();
          setActivePane("console");
          consolePaneRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [code, executeRun, executeSubmit]);

  const handleRun = async () => {
    await executeRun(code);
  };

  const handleSubmit = async () => {
    await executeSubmit(code);
  };

  const loadHistoryCode = (record: SubmissionRecord) => {
    setCode(record.code);
    setActivePane("editor");
    editorRef.current?.focus();
  };

  const rerunHistoryRecord = async (record: SubmissionRecord) => {
    loadHistoryCode(record);

    if (record.mode === "submit") {
      await executeSubmit(record.code);
    } else {
      await executeRun(record.code);
    }
  };

  if (isLoadingProblem) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-zinc-700 dark:bg-zinc-950 dark:text-zinc-200">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading problem arena...
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-300">
          {error ?? "Problem could not be loaded."}
        </p>
        <button
          onClick={() => router.push("/problems")}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Back to Problem List
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="flex h-14 items-center justify-between border-b border-zinc-200 px-3 dark:border-zinc-800 md:px-4">
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          <button
            onClick={() => router.push("/problems")}
            className="rounded-md border border-zinc-300 p-1.5 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="Back to problems"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold">{problem.title}</h1>
            <div className="mt-0.5 flex items-center gap-2">
              <DifficultyBadge difficulty={problem.difficulty} />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{problem.category}</span>
              {problem.companies?.length ? (
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {problem.companies.slice(0, 2).join(", ")}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeSwitcher compact />
          <button
            onClick={() => setCode(problem.starterCode)}
            className="inline-flex items-center rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Reset
          </button>
          <button
            onClick={() => void handleRun()}
            disabled={!canExecute}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run
          </button>
          <button
            onClick={() => void handleSubmit()}
            disabled={!canExecute}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
            Submit
          </button>
        </div>
      </header>

      <main className="h-[calc(100vh-3.5rem)]">
        <Group orientation={isDesktop ? "horizontal" : "vertical"} className="h-full">
          <Panel defaultSize={isDesktop ? 38 : 48} minSize={24}>
            <section
              ref={problemPaneRef}
              tabIndex={-1}
              className={`h-full overflow-y-auto border-r border-zinc-200 bg-zinc-50 p-4 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/60 md:p-6 ${
                activePane === "problem" ? "ring-1 ring-zinc-400 dark:ring-zinc-500" : ""
              }`}
              onFocus={() => setActivePane("problem")}
            >
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => setActiveLeftTab("description")}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                    activeLeftTab === "description"
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveLeftTab("editorial")}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                    activeLeftTab === "editorial"
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  Editorial
                </button>
                <button
                  onClick={() => setActiveLeftTab("history")}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                    activeLeftTab === "history"
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  History
                </button>
              </div>

              {activeLeftTab === "description" ? (
                <>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
                    Problem
                  </h2>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-700 dark:text-zinc-200">
                    {problem.description}
                  </p>

                  {problem.constraints.length > 0 ? (
                    <div className="mt-6">
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Constraints
                      </h3>
                      <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                        {problem.constraints.map((constraint) => (
                          <li key={constraint} className="flex items-start gap-2">
                            <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                            <span>{constraint}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {problem.examples.length > 0 ? (
                    <div className="mt-6 space-y-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Examples
                      </h3>
                      {problem.examples.map((example, index) => (
                        <div
                          key={`${example.input}-${index}`}
                          className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950/50"
                        >
                          <p className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                            Example {index + 1}
                          </p>
                          <div className="space-y-2 font-mono text-xs text-zinc-600 dark:text-zinc-300">
                            <p>
                              <span className="text-zinc-400 dark:text-zinc-500">Input: </span>
                              {example.input}
                            </p>
                            <p>
                              <span className="text-zinc-400 dark:text-zinc-500">Output: </span>
                              {example.output}
                            </p>
                            {example.explanation ? (
                              <p>
                                <span className="text-zinc-400 dark:text-zinc-500">Explanation: </span>
                                {example.explanation}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : null}

              {activeLeftTab === "editorial" ? (
                isEditorialUnlocked ? (
                  <div>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
                      Editorial
                    </h2>
                    <p className="text-sm text-zinc-700 dark:text-zinc-200">{problem.editorial.summary}</p>
                    <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Approach
                    </h3>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{problem.editorial.approach}</p>

                    <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
                      <article className="rounded border border-zinc-200 bg-white p-3 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-300">
                        <p className="text-zinc-400 dark:text-zinc-500">Time Complexity</p>
                        <p className="mt-1">{problem.editorial.timeComplexity}</p>
                      </article>
                      <article className="rounded border border-zinc-200 bg-white p-3 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-300">
                        <p className="text-zinc-400 dark:text-zinc-500">Space Complexity</p>
                        <p className="mt-1">{problem.editorial.spaceComplexity}</p>
                      </article>
                    </div>

                    <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Common Pitfalls
                    </h3>
                    <ul className="mt-2 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                      {problem.editorial.pitfalls.map((pitfall) => (
                        <li key={pitfall} className="flex items-start gap-2">
                          <ChevronRight className="mt-0.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                          <span>{pitfall}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-300">
                    Editorial unlocks after an{" "}
                    <span className="font-semibold text-emerald-600 dark:text-emerald-300">Accepted</span>{" "}
                    submission on hidden tests.
                  </div>
                )
              ) : null}

              {activeLeftTab === "history" ? (
                <div>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
                    Submission History
                  </h2>
                  {isLoadingHistory ? (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading history...</p>
                  ) : history.length === 0 ? (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">No runs yet for this problem.</p>
                  ) : (
                    <div className="space-y-2">
                      {history.map((entry) => (
                        <article
                          key={entry.id}
                          className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950/50"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p
                                className={`text-sm font-medium ${
                                  entry.result.status === "Accepted"
                                    ? "text-emerald-600 dark:text-emerald-300"
                                    : entry.result.status === "Failed"
                                    ? "text-amber-600 dark:text-amber-300"
                                    : "text-rose-600 dark:text-rose-300"
                                }`}
                              >
                                {entry.mode === "run" ? "Run" : "Submit"}: {entry.result.status}
                              </p>
                              <p className="mt-1 flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                                <Clock3 className="h-3.5 w-3.5" />
                                {formatSubmissionDate(entry.createdAt)}
                              </p>
                              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                {entry.result.passedCount}/{entry.result.totalCount} tests | Runtime {" "}
                                {entry.result.runtimeMs}ms
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => loadHistoryCode(entry)}
                                className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                              >
                                Load
                              </button>
                              <button
                                onClick={() => void rerunHistoryRecord(entry)}
                                className="inline-flex items-center gap-1 rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                              >
                                <RotateCw className="h-3.5 w-3.5" />
                                Re-run
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </section>
          </Panel>

          <Separator className="w-1 bg-zinc-200 transition hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700" />

          <Panel defaultSize={isDesktop ? 62 : 52} minSize={28}>
            <Group orientation="vertical" className="h-full">
              <Panel defaultSize={72} minSize={35}>
                <section
                  className={`h-full bg-white dark:bg-zinc-950 ${
                    activePane === "editor" ? "ring-1 ring-zinc-400 dark:ring-zinc-500" : ""
                  }`}
                  onFocus={() => setActivePane("editor")}
                >
                  <div className="flex h-10 items-center justify-between border-b border-zinc-200 px-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    <span>main.py</span>
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      Run: Ctrl/Cmd+Enter | Submit: Ctrl/Cmd+Shift+Enter | Focus panes: Alt+1/2/3
                    </span>
                  </div>
                  <MonacoEditor
                    onMount={(editor) => {
                      editorRef.current = editor;
                    }}
                    height="calc(100% - 2.5rem)"
                    language="python"
                    theme={editorTheme}
                    value={code}
                    onChange={(value) => setCode(value ?? "")}
                    options={{
                      minimap: { enabled: false },
                      lineNumbers: "on",
                      scrollBeyondLastLine: false,
                      fontSize: 14,
                      automaticLayout: true,
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                      tabSize: 4,
                      padding: { top: 12 },
                    }}
                  />
                </section>
              </Panel>

              <Separator className="h-1 bg-zinc-200 transition hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700" />

              <Panel defaultSize={28} minSize={18}>
                <section
                  ref={consolePaneRef}
                  tabIndex={-1}
                  className={`h-full border-t border-zinc-200 bg-zinc-50 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 ${
                    activePane === "console" ? "ring-1 ring-zinc-400 dark:ring-zinc-500" : ""
                  }`}
                  onFocus={() => setActivePane("console")}
                >
                  <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      <button
                        onClick={() => setActiveConsoleTab("sample")}
                        className={`rounded px-2 py-1 ${
                          activeConsoleTab === "sample"
                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                            : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        }`}
                      >
                        Official Testcases
                      </button>
                      <button
                        onClick={() => setActiveConsoleTab("hidden")}
                        className={`rounded px-2 py-1 ${
                          activeConsoleTab === "hidden"
                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                            : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        }`}
                      >
                        Hidden Testcases
                      </button>
                    </div>
                    <button
                      onClick={() => (problem ? void refreshHistory(problem.slug) : undefined)}
                      className="inline-flex items-center gap-1 rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      <RefreshCcw className="h-3.5 w-3.5" />
                      Refresh
                    </button>
                  </div>

                  {isExecuting ? (
                    <div className="space-y-3 p-4">
                      <div className="h-4 w-36 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                      <div className="h-3 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                      <div className="h-3 w-5/6 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                  ) : activeConsoleTab === "sample" ? (
                    <ResultView result={runResult} />
                  ) : (
                    <ResultView result={submitResult} />
                  )}
                </section>
              </Panel>
            </Group>
          </Panel>
        </Group>
      </main>
    </div>
  );
}
