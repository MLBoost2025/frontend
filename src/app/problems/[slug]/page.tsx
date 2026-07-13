"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { Group, Panel, Separator } from "react-resizable-panels";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Loader2,
  Play,
  RefreshCcw,
  RotateCw,
  SendHorizontal,
  XCircle,
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
        Loading editor…
      </div>
    ),
  }
);

function getDraftStorageKey(slug: string): string {
  return `katalume:draft:${slug}`;
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
      ? "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400"
      : difficulty === "Medium"
      ? "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400"
      : "bg-rose-500/10 text-rose-600 ring-rose-500/20 dark:text-rose-400";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${classes}`}>
      {difficulty}
    </span>
  );
}

/** A pill segmented-control button. */
function SegButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        active
          ? "bg-white text-zinc-900 shadow-sm dark:bg-white/10 dark:text-white"
          : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
      }`}
    >
      {children}
    </button>
  );
}

function ghostButton() {
  return "inline-flex items-center gap-1.5 rounded-full border border-black/[0.07] px-2.5 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-white/[0.08] dark:text-zinc-300 dark:hover:bg-white/[0.05]";
}

function ResultView({ result }: { result: SubmissionResult | null }) {
  if (!result) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-sm text-zinc-400 dark:text-zinc-500">
        Run your code to see results here.
      </div>
    );
  }

  const positive = result.status === "Accepted";

  return (
    <div className="h-full overflow-y-auto p-4 text-sm" aria-live="polite">
      <div
        className={`mb-4 rounded-xl px-4 py-3 ${
          positive
            ? "bg-emerald-500/[0.08] ring-1 ring-inset ring-emerald-500/20"
            : "bg-rose-500/[0.08] ring-1 ring-inset ring-rose-500/20"
        }`}
      >
        <div
          className={`flex items-center gap-2 text-sm font-semibold ${
            positive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {positive ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {result.status}
        </div>
        <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-300">{result.message}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
          <span>
            {result.mode === "run" ? "Sample" : "Hidden"} tests:{" "}
            <span className="font-medium text-zinc-700 dark:text-zinc-200">
              {result.passedCount}/{result.totalCount}
            </span>
          </span>
          <span>·</span>
          <span>Runtime {result.runtimeMs}ms</span>
          <span>·</span>
          <span>Memory {result.memoryMb}MB</span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400">
            {result.source}
          </span>
        </div>
      </div>

      {result.traceback ? (
        <pre className="mb-4 overflow-x-auto rounded-xl bg-rose-500/[0.06] p-3 text-xs text-rose-700 ring-1 ring-inset ring-rose-500/15 dark:text-rose-300">
          {result.traceback}
        </pre>
      ) : null}

      <div className="space-y-2">
        {result.testCases.map((testCase) => (
          <article
            key={`${testCase.visibility}-${testCase.name}`}
            className={`rounded-xl px-3.5 py-2.5 ${
              testCase.passed
                ? "bg-emerald-500/[0.05] ring-1 ring-inset ring-emerald-500/15"
                : "bg-rose-500/[0.05] ring-1 ring-inset ring-rose-500/15"
            }`}
          >
            <p
              className={`flex items-center gap-1.5 font-medium ${
                testCase.passed
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {testCase.passed ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              {testCase.name}
            </p>
            {testCase.input ? (
              <p className="mt-1.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">Input: {testCase.input}</p>
            ) : null}
            {testCase.expectedOutput ? (
              <p className="mt-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                Expected: {testCase.expectedOutput}
              </p>
            ) : null}
            {testCase.actualOutput ? (
              <p className="mt-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">Got: {testCase.actualOutput}</p>
            ) : null}
            {testCase.errorMessage ? (
              <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">{testCase.errorMessage}</p>
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
  const searchParams = useSearchParams();
  const contestId = searchParams.get("contest") || undefined;
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
          problem.title,
          contestId
        );
        setSubmitResult(result);
        setActiveConsoleTab("hidden");

        if (result.status === "Accepted") {
          setIsEditorialUnlocked(true);
          const unlockedProblem = await fetchProblemBySlug(problem.slug);
          setProblem(unlockedProblem);
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
    [problem, isExecuting, refreshHistory, contestId]
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
      <div className="flex h-screen items-center justify-center bg-white text-zinc-500 dark:bg-[#0a091e] dark:text-zinc-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-brand-500" />
        Loading problem arena…
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-zinc-900 dark:bg-[#0a091e] dark:text-zinc-100">
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-300">
          {error ?? "Problem could not be loaded."}
        </p>
        <button
          onClick={() => router.push("/problems")}
          className="rounded-full border border-black/[0.07] px-4 py-2 text-sm transition hover:bg-zinc-100 dark:border-white/[0.08] dark:hover:bg-white/[0.05]"
        >
          Back to Problem List
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-white text-zinc-900 dark:bg-[#0a091e] dark:text-zinc-100">
      <header className="flex h-14 items-center justify-between border-b border-black/[0.06] bg-white/70 px-3 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#0a091e]/80 md:px-4">
        <div className="flex min-w-0 items-center gap-2.5 md:gap-3">
          <button
            onClick={() => router.push("/problems")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.07] text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/[0.08] dark:text-zinc-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
            aria-label="Back to problems"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-tight">{problem.title}</h1>
            <div className="mt-0.5 flex items-center gap-2">
              <DifficultyBadge difficulty={problem.difficulty} />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{problem.category}</span>
              {problem.companies?.length ? (
                <span className="hidden text-xs text-zinc-400 dark:text-zinc-500 sm:inline">
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
            className="hidden rounded-full border border-black/[0.07] px-3.5 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-white/[0.08] dark:text-zinc-300 dark:hover:bg-white/[0.05] sm:inline-flex"
          >
            Reset
          </button>
          <button
            onClick={() => void handleRun()}
            disabled={!canExecute}
            className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-4 py-1.5 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-zinc-100 dark:hover:bg-white/[0.1]"
          >
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run
          </button>
          <button
            onClick={() => void handleSubmit()}
            disabled={!canExecute}
            className="btn-primary px-4 py-1.5"
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
              className={`h-full overflow-y-auto border-r border-black/[0.06] bg-white p-4 focus:outline-none dark:border-white/[0.06] dark:bg-[#12113a]/60 md:p-6 ${
                activePane === "problem" ? "ring-1 ring-inset ring-brand-500/30" : ""
              }`}
              onFocus={() => setActivePane("problem")}
            >
              <div className="mb-5 inline-flex gap-1 rounded-full bg-zinc-100 p-1 dark:bg-white/[0.05]">
                <SegButton active={activeLeftTab === "description"} onClick={() => setActiveLeftTab("description")}>
                  Description
                </SegButton>
                <SegButton active={activeLeftTab === "editorial"} onClick={() => setActiveLeftTab("editorial")}>
                  Editorial
                </SegButton>
                <SegButton active={activeLeftTab === "history"} onClick={() => setActiveLeftTab("history")}>
                  History
                </SegButton>
              </div>

              {activeLeftTab === "description" ? (
                <>
                  <p className="whitespace-pre-wrap text-[15px] leading-7 text-zinc-700 dark:text-zinc-200">
                    {problem.description}
                  </p>

                  {problem.constraints.length > 0 ? (
                    <div className="mt-6">
                      <h3 className="eyebrow mb-2">Constraints</h3>
                      <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                        {problem.constraints.map((constraint) => (
                          <li key={constraint} className="flex items-start gap-2">
                            <span className="mt-2 block h-1.5 w-1.5 rounded-full bg-brand-500/70" />
                            <span>{constraint}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {problem.examples.length > 0 ? (
                    <div className="mt-6 space-y-3">
                      <h3 className="eyebrow">Examples</h3>
                      {problem.examples.map((example, index) => (
                        <div
                          key={`${example.input}-${index}`}
                          className="rounded-xl bg-zinc-50/80 p-3.5 dark:bg-white/[0.025]"
                        >
                          <p className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                            Example {index + 1}
                          </p>
                          <div className="space-y-1.5 font-mono text-xs text-zinc-600 dark:text-zinc-300">
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
                    <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-200">{problem.editorial.summary}</p>
                    <h3 className="eyebrow mt-5 mb-1">Approach</h3>
                    <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">{problem.editorial.approach}</p>

                    <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
                      <article className="rounded-xl bg-zinc-50/80 p-3 text-xs text-zinc-600 dark:bg-white/[0.025] dark:text-zinc-300">
                        <p className="text-zinc-400 dark:text-zinc-500">Time Complexity</p>
                        <p className="mt-1 font-mono">{problem.editorial.timeComplexity}</p>
                      </article>
                      <article className="rounded-xl bg-zinc-50/80 p-3 text-xs text-zinc-600 dark:bg-white/[0.025] dark:text-zinc-300">
                        <p className="text-zinc-400 dark:text-zinc-500">Space Complexity</p>
                        <p className="mt-1 font-mono">{problem.editorial.spaceComplexity}</p>
                      </article>
                    </div>

                    <h3 className="eyebrow mt-5 mb-2">Common Pitfalls</h3>
                    <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                      {problem.editorial.pitfalls.map((pitfall) => (
                        <li key={pitfall} className="flex items-start gap-2">
                          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                          <span>{pitfall}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="rounded-xl bg-zinc-50/80 p-5 text-sm text-zinc-600 dark:bg-white/[0.025] dark:text-zinc-300">
                    Editorial unlocks after an{" "}
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Accepted</span>{" "}
                    submission on hidden tests.
                  </div>
                )
              ) : null}

              {activeLeftTab === "history" ? (
                <div>
                  {isLoadingHistory ? (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading history…</p>
                  ) : history.length === 0 ? (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">No runs yet for this problem.</p>
                  ) : (
                    <div className="space-y-2">
                      {history.map((entry) => (
                        <article
                          key={entry.id}
                          className="rounded-xl bg-zinc-50/80 p-3.5 dark:bg-white/[0.025]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p
                                className={`text-sm font-semibold ${
                                  entry.result.status === "Accepted"
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : entry.result.status === "Failed"
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-rose-600 dark:text-rose-400"
                                }`}
                              >
                                {entry.mode === "run" ? "Run" : "Submit"} · {entry.result.status}
                              </p>
                              <p className="mt-1 flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                                <Clock3 className="h-3.5 w-3.5" />
                                {formatSubmissionDate(entry.createdAt)}
                              </p>
                              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                {entry.result.passedCount}/{entry.result.totalCount} tests · {entry.result.runtimeMs}ms
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => loadHistoryCode(entry)} className={ghostButton()}>
                                Load
                              </button>
                              <button onClick={() => void rerunHistoryRecord(entry)} className={ghostButton()}>
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

          <Separator className="w-1 bg-black/[0.05] transition hover:bg-brand-500/40 dark:bg-white/[0.05] dark:hover:bg-brand-500/40" />

          <Panel defaultSize={isDesktop ? 62 : 52} minSize={28}>
            <Group orientation="vertical" className="h-full">
              <Panel defaultSize={72} minSize={35}>
                <section
                  className={`h-full bg-white dark:bg-[#0a091e] ${
                    activePane === "editor" ? "ring-1 ring-inset ring-brand-500/30" : ""
                  }`}
                  onFocus={() => setActivePane("editor")}
                >
                  <div className="flex h-10 items-center justify-between border-b border-black/[0.06] px-4 dark:border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">main.py</span>
                      <span className="rounded-md bg-brand-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
                        Python
                      </span>
                    </div>
                    <span className="hidden text-[11px] text-zinc-400 dark:text-zinc-500 lg:block">
                      ⌘↵ Run · ⌘⇧↵ Submit · Alt+1/2/3 panes
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
                      renderLineHighlight: "line",
                      smoothScrolling: true,
                    }}
                  />
                </section>
              </Panel>

              <Separator className="h-1 bg-black/[0.05] transition hover:bg-brand-500/40 dark:bg-white/[0.05] dark:hover:bg-brand-500/40" />

              <Panel defaultSize={28} minSize={18}>
                <section
                  ref={consolePaneRef}
                  tabIndex={-1}
                  className={`h-full border-t border-black/[0.06] bg-white focus:outline-none dark:border-white/[0.06] dark:bg-[#12113a]/60 ${
                    activePane === "console" ? "ring-1 ring-inset ring-brand-500/30" : ""
                  }`}
                  onFocus={() => setActivePane("console")}
                >
                  <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-2 dark:border-white/[0.06]">
                    <div className="inline-flex gap-1 rounded-full bg-zinc-100 p-1 dark:bg-white/[0.05]">
                      <SegButton active={activeConsoleTab === "sample"} onClick={() => setActiveConsoleTab("sample")}>
                        Sample tests
                      </SegButton>
                      <SegButton active={activeConsoleTab === "hidden"} onClick={() => setActiveConsoleTab("hidden")}>
                        Hidden tests
                      </SegButton>
                    </div>
                    <button
                      onClick={() => (problem ? void refreshHistory(problem.slug) : undefined)}
                      className={ghostButton()}
                    >
                      <RefreshCcw className="h-3.5 w-3.5" />
                      Refresh
                    </button>
                  </div>

                  {isExecuting ? (
                    <div className="space-y-3 p-4">
                      <div className="h-4 w-40 animate-pulse rounded-full bg-zinc-200 dark:bg-white/[0.08]" />
                      <div className="h-3 w-full animate-pulse rounded-full bg-zinc-200 dark:bg-white/[0.05]" />
                      <div className="h-3 w-5/6 animate-pulse rounded-full bg-zinc-200 dark:bg-white/[0.05]" />
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
