import {
  AuthSession,
  CompanyTrack,
  Competition,
  CompetitionDetail,
  CompetitionStatus,
  ContestRank,
  ContestLeaderboardEntry,
  Difficulty,
  ExecutionMode,
  LeaderboardEntry,
  LearningTrack,
  LoginPayload,
  NewContestInput,
  NewLearningTrackInput,
  NewProblemInput,
  Problem,
  ProblemDetail,
  SignupPayload,
  SubmissionRecord,
  SubmissionResult,
  RecentActivityItem,
  SubmissionTestCaseResult,
  TopicProgressPoint,
  UpdateProfileInput,
  User,
  UserProfile,
  UserProgress,
  UserStats,
} from "@/types";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_TTL_SECONDS } from "@/lib/auth";
import { trackEvent } from "@/lib/analytics";
import { reportError, reportMessage } from "@/lib/observability";
import rawProblemCatalog from "@/data/problem-catalog.json";
import { runPythonInBrowser, type BrowserPracticeCase } from "@/lib/browserPython";

type ApiMode = "mock" | "live" | "auto";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const DEFAULT_API_MODE = process.env.NODE_ENV === "production" ? "live" : "mock";
const API_MODE = ((process.env.NEXT_PUBLIC_API_MODE || DEFAULT_API_MODE).toLowerCase() ||
  DEFAULT_API_MODE) as ApiMode;
const API_RETRY_COUNT = Number(process.env.NEXT_PUBLIC_API_RETRY_COUNT || 2);
const API_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || 8000);
const EXECUTION_ADAPTER = (process.env.NEXT_PUBLIC_EXECUTION_MODE || "browser").toLowerCase();
const ALLOW_MOCK_FALLBACK = process.env.NEXT_PUBLIC_API_FALLBACK_TO_MOCK
  ? process.env.NEXT_PUBLIC_API_FALLBACK_TO_MOCK === "true"
  : process.env.NODE_ENV !== "production";

const MOCK_SESSION_KEY = "katalume.mock.session";
const SUBMISSION_HISTORY_KEY = "katalume.submission.history";
const ACTIVE_USER_KEY = "katalume.active.user";

// Practice history is scoped per signed-in account so two people sharing a
// browser never inherit each other's local progress. The marker holds only an
// opaque user id (never a credential); anonymous practice uses "anon".
function setActiveUser(userId: string | null): void {
  if (!isBrowser()) return;
  if (userId) window.localStorage.setItem(ACTIVE_USER_KEY, userId);
  else window.localStorage.removeItem(ACTIVE_USER_KEY);
}

function submissionHistoryKey(): string {
  if (!isBrowser()) return SUBMISSION_HISTORY_KEY;
  const uid = window.localStorage.getItem(ACTIVE_USER_KEY) || "anon";
  const scoped = `${SUBMISSION_HISTORY_KEY}.${uid}`;
  // One-time migration: claim the old shared key for the current account.
  const legacy = window.localStorage.getItem(SUBMISSION_HISTORY_KEY);
  if (legacy !== null && window.localStorage.getItem(scoped) === null) {
    window.localStorage.setItem(scoped, legacy);
    window.localStorage.removeItem(SUBMISSION_HISTORY_KEY);
  }
  return scoped;
}

const FETCH_DELAY_MS = 420;
const AUTH_DELAY_MS = 550;

interface CatalogProblemSpec {
  slug: string;
  title: string;
  difficulty: Difficulty;
  category: string;
  acceptanceRate: number;
  tags: string[];
  summary: string;
  description: string;
  constraints: string[];
  hints: string[];
  starterCode: string;
  sampleTestCases: Array<{ input: string; output: string }>;
  hiddenTestCount: number;
  editorial: ProblemDetail["editorial"];
  testcases: Array<BrowserPracticeCase & { timeLimit: number; memoryLimit: number }>;
}

interface LivePracticeSpec {
  problemId: string;
  slug: string;
  testcaseVersion: number;
  testcases: Array<BrowserPracticeCase & { timeLimit?: number; memoryLimit?: number }>;
}

const MOCK_COMPANY_TRACKS: CompanyTrack[] = [
  {
    id: "track-ml-core-50",
    title: "ML Engineer Core 50",
    company: "Meta",
    description:
      "A focused set of 50 modeling + feature engineering problems for ML interviews.",
    totalProblems: 50,
    solvedProblems: 19,
    tags: ["modeling", "metrics", "feature-engineering"],
  },
  {
    id: "track-pandas-interview-30",
    title: "Pandas Interview 30",
    company: "Uber",
    description:
      "Table transform and aggregation patterns commonly asked in data interviews.",
    totalProblems: 30,
    solvedProblems: 11,
    tags: ["pandas", "joins", "groupby"],
  },
  {
    id: "track-recommendation-20",
    title: "Recommendation Systems 20",
    company: "Netflix",
    description:
      "Ranking, retrieval, and evaluation exercises for recommender workflows.",
    totalProblems: 20,
    solvedProblems: 4,
    tags: ["ranking", "retrieval", "offline-metrics"],
  },
];

const MOCK_RECENT_RANKS: ContestRank[] = [
  {
    contest: "Model Metrics Sprint",
    rank: 182,
    participants: 4820,
    score: 1780,
    date: "2026-02-24",
  },
  {
    contest: "Feature Engineering Weekly",
    rank: 96,
    participants: 3910,
    score: 1860,
    date: "2026-02-17",
  },
  {
    contest: "Data Prep Rapid Round",
    rank: 121,
    participants: 4055,
    score: 1814,
    date: "2026-02-10",
  },
];

const PROBLEM_CATALOG = rawProblemCatalog as unknown as CatalogProblemSpec[];

const MOCK_PROBLEMS: ProblemDetail[] = PROBLEM_CATALOG.map((problem, index) => ({
  id: `p-${String(index + 1).padStart(3, "0")}`,
  slug: problem.slug,
  title: problem.title,
  difficulty: problem.difficulty,
  category: problem.category,
  acceptance: problem.acceptanceRate,
  acceptanceRate: problem.acceptanceRate,
  status: "unsolved",
  tags: problem.tags,
  summary: problem.summary,
  description: problem.description,
  constraints: problem.constraints,
  examples: problem.sampleTestCases,
  sampleTestCases: problem.sampleTestCases,
  hiddenTestCount: problem.hiddenTestCount,
  hints: problem.hints,
  editorial: problem.editorial,
  starterCode: problem.starterCode,
  companies: [],
  trackIds: [],
}));

const CATALOG_BY_IDENTIFIER = new Map<string, CatalogProblemSpec>();
PROBLEM_CATALOG.forEach((problem, index) => {
  CATALOG_BY_IDENTIFIER.set(problem.slug, problem);
  CATALOG_BY_IDENTIFIER.set(`p-${String(index + 1).padStart(3, "0")}`, problem);
});

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getNormalizedApiMode(): ApiMode {
  if (API_MODE === "mock" || API_MODE === "live" || API_MODE === "auto") {
    return API_MODE;
  }
  return DEFAULT_API_MODE as ApiMode;
}

export function getBackendMode(): ApiMode {
  return getNormalizedApiMode();
}

function persistSession(session: AuthSession): void {
  setActiveUser(session.user?.id || null);
  if (!isBrowser()) {
    return;
  }
  if (getNormalizedApiMode() === "mock") {
    window.localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
    window.document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; max-age=${AUTH_COOKIE_TTL_SECONDS}; samesite=lax`;
  } else {
    window.localStorage.removeItem(MOCK_SESSION_KEY);
    window.document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
  }
}

function readStoredSession(): AuthSession | null {
  if (!isBrowser()) {
    return null;
  }
  const hasMockAuthCookie = window.document.cookie
      .split(";")
      .some((part) => part.trim().startsWith(`${AUTH_COOKIE_NAME}=`));

  if (getNormalizedApiMode() === "mock" && !hasMockAuthCookie) {
    window.localStorage.removeItem(MOCK_SESSION_KEY);
    return null;
  }

  const raw = window.localStorage.getItem(MOCK_SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    window.localStorage.removeItem(MOCK_SESSION_KEY);
    return null;
  }
}

function clearStoredSession(): void {
  setActiveUser(null);
  if (!isBrowser()) {
    return;
  }
  window.localStorage.removeItem(MOCK_SESSION_KEY);
  window.document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

function createMockSession(name: string, email: string): AuthSession {
  const now = new Date();
  const token = `mock_${Math.random().toString(36).slice(2)}_${Date.now()}`;

  return {
    user: {
      id: `user_${email.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      name,
      email: email.toLowerCase(),
      avatarUrl: "",
      createdAt: now.toISOString(),
      roles: ["User"],
    },
    accessToken: token,
    expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

function getProblemByIdentifier(identifier: string): ProblemDetail | undefined {
  return MOCK_PROBLEMS.find(
    (problem) => problem.id === identifier || problem.slug === identifier
  );
}

// Lightweight metadata for a problem, enough to attribute a solve to its
// difficulty and topic. Problems served by the live backend are not in the
// bundled catalog, so we remember their metadata when the arena opens them
// (see fetchProblemBySlug) and consult it wherever the bundle lookup misses,
// keeping progress views consistent for imported problems.
interface ProblemMeta {
  slug: string;
  id: string;
  title: string;
  difficulty: Difficulty;
  category: string;
}

const PROBLEM_META_KEY = "katalume.problem.meta";

function rememberProblemMeta(problem: ProblemDetail): void {
  if (!isBrowser()) return;
  try {
    const raw = window.localStorage.getItem(PROBLEM_META_KEY);
    const store = (raw ? JSON.parse(raw) : {}) as Record<string, ProblemMeta>;
    const meta: ProblemMeta = {
      slug: problem.slug,
      id: problem.id,
      title: problem.title,
      difficulty: problem.difficulty,
      category: problem.category,
    };
    store[problem.slug] = meta;
    store[problem.id] = meta;
    window.localStorage.setItem(PROBLEM_META_KEY, JSON.stringify(store));
  } catch {
    // Best-effort cache; ignore quota/serialization errors.
  }
}

// Cache metadata for EVERY problem the live backend lists (not just opened
// ones) so difficulty denominators and topic totals reflect the full catalog
// instead of the bundled subset.
function rememberProblemList(problems: Problem[]): void {
  if (!isBrowser()) return;
  try {
    const raw = window.localStorage.getItem(PROBLEM_META_KEY);
    const store = (raw ? JSON.parse(raw) : {}) as Record<string, ProblemMeta>;
    for (const problem of problems) {
      if (!problem.slug || !problem.difficulty) continue;
      const meta: ProblemMeta = {
        slug: problem.slug,
        id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty,
        category: (problem as { category?: string }).category || "General",
      };
      store[problem.slug] = meta;
      store[problem.id] = meta;
    }
    window.localStorage.setItem(PROBLEM_META_KEY, JSON.stringify(store));
  } catch {
    // Best-effort cache; ignore quota/serialization errors.
  }
}

// The union of bundled problems and every remembered live problem, deduped by
// slug — the closest local view of the real catalog.
function allKnownProblemMeta(): Map<string, ProblemMeta> {
  const known = new Map<string, ProblemMeta>();
  for (const problem of MOCK_PROBLEMS) {
    known.set(problem.slug, {
      slug: problem.slug,
      id: problem.id,
      title: problem.title,
      difficulty: problem.difficulty,
      category: problem.category,
    });
  }
  if (isBrowser()) {
    try {
      const raw = window.localStorage.getItem(PROBLEM_META_KEY);
      if (raw) {
        const store = JSON.parse(raw) as Record<string, ProblemMeta>;
        for (const meta of Object.values(store)) {
          if (meta?.slug && !known.has(meta.slug)) known.set(meta.slug, meta);
        }
      }
    } catch {
      // fall back to the bundle alone
    }
  }
  return known;
}

function resolveProblemMeta(identifier: string): ProblemMeta | undefined {
  const bundled = getProblemByIdentifier(identifier);
  if (bundled) {
    return {
      slug: bundled.slug,
      id: bundled.id,
      title: bundled.title,
      difficulty: bundled.difficulty,
      category: bundled.category,
    };
  }
  if (!isBrowser()) return undefined;
  try {
    const raw = window.localStorage.getItem(PROBLEM_META_KEY);
    if (!raw) return undefined;
    const store = JSON.parse(raw) as Record<string, ProblemMeta>;
    return store[identifier];
  } catch {
    return undefined;
  }
}

function readSubmissionHistoryStore(): SubmissionRecord[] {
  if (!isBrowser()) {
    return [];
  }

  const raw = window.localStorage.getItem(submissionHistoryKey());
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as SubmissionRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    window.localStorage.removeItem(submissionHistoryKey());
    return [];
  }
}

function writeSubmissionHistoryStore(records: SubmissionRecord[]): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    submissionHistoryKey(),
    JSON.stringify(records.slice(0, 180))
  );
}

function upsertSubmissionRecord(record: SubmissionRecord): void {
  const history = readSubmissionHistoryStore();
  history.unshift(record);
  writeSubmissionHistoryStore(history);
}

function computeDynamicStatus(
  problemId: string,
  fallback: Problem["status"]
): Problem["status"] {
  const history = readSubmissionHistoryStore();
  const forProblem = history.filter((entry) => entry.problemId === problemId);

  if (forProblem.some((entry) => entry.mode === "submit" && entry.result.status === "Accepted")) {
    return "solved";
  }

  if (forProblem.length > 0) {
    return "attempted";
  }

  return fallback;
}

function normalizeToListItem(problem: ProblemDetail): Problem {
  return {
    id: problem.id,
    slug: problem.slug,
    title: problem.title,
    difficulty: problem.difficulty,
    category: problem.category,
    acceptance: problem.acceptance,
    acceptanceRate: problem.acceptanceRate,
    status: computeDynamicStatus(problem.id, problem.status),
    tags: [...problem.tags],
    summary: problem.summary,
    companies: problem.companies,
    trackIds: problem.trackIds,
  };
}

function createSubmissionRecord(
  problemId: string,
  code: string,
  mode: ExecutionMode,
  result: SubmissionResult,
  problemIdentifier = problemId,
  fallbackTitle?: string
): SubmissionRecord {
  const problem = getProblemByIdentifier(problemIdentifier);

  return {
    id: result.submissionId,
    problemId,
    problemSlug: problem?.slug || problemId,
    // Problems served by the live backend (e.g. imported pipeline problems)
    // are not in the bundled catalog, so fall back to the title the arena
    // passes through instead of showing "Unknown Problem".
    problemTitle: problem?.title || fallbackTitle || "Unknown Problem",
    code,
    mode,
    result,
    createdAt: result.submittedAt,
  };
}

function parseJsonSafely<T>(text: string): T {
  return JSON.parse(text) as T;
}

async function fetchWithRetry<T>(
  path: string,
  init?: RequestInit,
  retries = API_RETRY_COUNT
): Promise<T> {
  const method = (init?.method || "GET").toUpperCase();
  // Only retry idempotent methods. Retrying POST (e.g. /submissions) on a
  // timeout can duplicate a submission that actually succeeded server-side.
  const isIdempotent = method === "GET" || method === "HEAD";
  const maxRetries = isIdempotent ? retries : 0;

  let attempt = 0;
  let lastError: unknown;
  let refreshedSession = false;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        signal: controller.signal,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers || {}),
        },
      });

      clearTimeout(timeoutId);

      if (
        (response.status === 401 || response.status === 403) &&
        !refreshedSession &&
        !path.startsWith("/auth/") &&
        getNormalizedApiMode() !== "mock"
      ) {
        refreshedSession = true;
        const refreshed = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (refreshed.ok) continue;
      }

      if (!response.ok) {
        const message = await response.text();
        const error: Error & { retryable?: boolean } = new Error(
          `HTTP ${response.status}: ${message || "Request failed"}`
        );
        // Client errors (4xx) are deterministic — retrying can't help. Only 5xx is retryable.
        error.retryable = response.status >= 500;
        throw error;
      }

      const text = await response.text();
      return text ? parseJsonSafely<T>(text) : ({} as T);
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;
      attempt += 1;
      // Network/abort errors carry no `retryable` flag → treated as retryable.
      const retryable = (error as { retryable?: boolean })?.retryable !== false;
      if (retryable && attempt <= maxRetries) {
        await wait(250 * attempt);
        continue;
      }
      break;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Request failed");
}

async function runWithBackendSwitch<T>(
  operation: string,
  liveExecutor: () => Promise<T>,
  mockExecutor: () => Promise<T>
): Promise<T> {
  const mode = getNormalizedApiMode();

  if (mode === "mock") {
    return mockExecutor();
  }

  try {
    const response = await liveExecutor();
    void trackEvent({ name: "api_live_success", payload: { operation } });
    return response;
  } catch (error) {
    reportError(error, { operation, mode });

    if (mode === "live" && !ALLOW_MOCK_FALLBACK) {
      throw error instanceof Error ? error : new Error("Live API request failed");
    }

    reportMessage("Falling back to mock API", { operation, mode });
    void trackEvent({ name: "api_live_fallback", payload: { operation, mode } });

    return mockExecutor();
  }
}

function toAuthSessionFromLive(
  payload: unknown,
  fallbackName: string,
  fallbackEmail: string
): AuthSession {
  const parsed = (payload || {}) as {
    token?: string;
    accessToken?: string;
    expiresAt?: string;
    user?: Partial<AuthSession["user"]> & { username?: string };
  };

  const now = new Date();

  return {
    user: {
      id: parsed.user?.id || `user_${fallbackEmail.replace(/[^a-z0-9]/gi, "")}`,
      name: parsed.user?.name || parsed.user?.username || fallbackName,
      email: parsed.user?.email || fallbackEmail,
      avatarUrl: parsed.user?.avatarUrl || "",
      createdAt: parsed.user?.createdAt || now.toISOString(),
      roles: parsed.user?.roles || ["User"],
    },
    expiresAt:
      parsed.expiresAt || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

function toProblemFromLive(payload: unknown): Problem {
  const parsed = payload as Partial<Problem> & { _id?: string };
  const id = parsed.id || parsed._id || `p-live-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    slug: parsed.slug,
    title: parsed.title || "Untitled Problem",
    difficulty: parsed.difficulty || "Medium",
    category: parsed.category || "General",
    acceptance: parsed.acceptance || parsed.acceptanceRate || 0,
    acceptanceRate: parsed.acceptanceRate || parsed.acceptance || 0,
    status:
      EXECUTION_ADAPTER === "browser"
        ? computeDynamicStatus(id, parsed.status || "unsolved")
        : parsed.status || "unsolved",
    tags: parsed.tags || [],
    summary: parsed.summary,
    companies: parsed.companies,
    trackIds: parsed.trackIds,
  };
}

function toProblemDetailFromLive(slug: string, payload: unknown): ProblemDetail {
  const base = toProblemFromLive(payload);
  const parsed = payload as Partial<ProblemDetail>;
  const bundled = getProblemByIdentifier(slug);

  return {
    ...base,
    slug: parsed.slug || slug,
    description: parsed.description || "Problem description is unavailable.",
    constraints: parsed.constraints || [],
    examples: parsed.examples || [],
    hints: parsed.hints || [],
    sampleTestCases: parsed.sampleTestCases || parsed.examples || [],
    hiddenTestCount: parsed.hiddenTestCount || 0,
    editorial:
      parsed.editorial || bundled?.editorial ||
      ({
        summary: "Editorial unavailable.",
        approach: "Connect the backend editorial endpoint to populate this section.",
        timeComplexity: "N/A",
        spaceComplexity: "N/A",
        pitfalls: [],
      } as ProblemDetail["editorial"]),
    starterCode: parsed.starterCode || "def solve():\n    pass",
  };
}

function normalizeLiveSubmission(
  problemId: string,
  mode: ExecutionMode,
  payload: unknown
): SubmissionResult {
  const parsed = payload as Partial<SubmissionResult> & {
    status?: SubmissionResult["status"] | string;
    _id?: string;
    id?: string;
    runtime?: number;
    memory?: number;
    errorMessage?: string;
    stderr?: string;
    compileOutput?: string;
    stdout?: string;
  };

  const testCases: SubmissionTestCaseResult[] = (parsed.testCases || []).map((item) => ({
    name: item.name || "Case",
    visibility: item.visibility || (mode === "run" ? "sample" : "hidden"),
    input: item.input,
    expectedOutput: item.expectedOutput,
    actualOutput: item.actualOutput,
    passed: Boolean(item.passed),
    errorMessage: item.errorMessage,
  }));

  const accepted = parsed.status === "Accepted";
  const totalCount = parsed.totalCount ?? (testCases.length || 1);
  const passedCount =
    parsed.passedCount ?? (testCases.length ? testCases.filter((testCase) => testCase.passed).length : accepted ? 1 : 0);
  const executionError = /runtime|compilation|internal|limit|error/i.test(parsed.status || "");

  return {
    submissionId: parsed.submissionId || parsed._id || parsed.id || `sub_live_${Date.now()}`,
    problemId,
    mode,
    visibility: parsed.visibility || (mode === "run" ? "sample" : "hidden"),
    status: accepted ? "Accepted" : executionError ? "Runtime Error" : "Failed",
    runtimeMs: parsed.runtimeMs ?? Math.round(Number(parsed.runtime || 0) * 1000),
    memoryMb: parsed.memoryMb ?? Number(parsed.memory || 0) / 1024,
    score: parsed.score ?? Math.round((passedCount / Math.max(1, totalCount)) * 100),
    message: parsed.message || (accepted ? "Execution accepted." : parsed.status || "Execution completed."),
    passedCount,
    totalCount,
    traceback: parsed.traceback || parsed.errorMessage || parsed.stderr || parsed.compileOutput,
    testCases,
    source: "live",
    submittedAt: parsed.submittedAt || new Date().toISOString(),
  };
}

function mockFetchProblems(tags: string[] = []): Problem[] {
  const problems = tags.length
    ? MOCK_PROBLEMS.filter((problem) => problem.tags.some((tag) => tags.includes(tag)))
    : MOCK_PROBLEMS;
  return clone(problems.map(normalizeToListItem));
}

function mockFetchProblemBySlug(slug: string): ProblemDetail {
  const problem = MOCK_PROBLEMS.find((item) => item.slug === slug);
  if (!problem) {
    throw new Error(`Problem with slug "${slug}" was not found.`);
  }
  return clone(problem);
}

async function liveFetchProblems(tags: string[] = []): Promise<Problem[]> {
  const query = tags.length ? `?tags=${encodeURIComponent(tags.join(","))}` : "";
  const data = await fetchWithRetry<unknown[]>(`/problems${query}`, { method: "GET" });
  return data.map((entry) => toProblemFromLive(entry));
}

async function liveFetchProblemBySlug(slug: string): Promise<ProblemDetail> {
  const data = await fetchWithRetry<unknown>(`/problems/${slug}`, { method: "GET" });
  return toProblemDetailFromLive(slug, data);
}

async function browserExecute(
  problemId: string,
  code: string,
  mode: ExecutionMode,
  catalogIdentifier = problemId
) {
  let testcases: BrowserPracticeCase[];
  if (getNormalizedApiMode() === "mock") {
    const spec = CATALOG_BY_IDENTIFIER.get(catalogIdentifier);
    if (!spec) {
      throw new Error("The selected practice problem could not be loaded.");
    }
    testcases = spec.testcases;
  } else {
    const live = await fetchWithRetry<LivePracticeSpec>(
      `/problems/${encodeURIComponent(catalogIdentifier)}/practice`,
      { method: "GET" }
    );
    if (!Array.isArray(live.testcases) || live.testcases.length === 0) {
      throw new Error("This problem has no browser-practice tests.");
    }
    testcases = live.testcases.map((testcase) => ({
      input: testcase.input,
      expectedOutput: testcase.expectedOutput,
      isPublic: Boolean(testcase.isPublic),
    }));
  }
  return runPythonInBrowser(problemId, code, mode, testcases);
}

async function liveExecute(problemId: string, code: string, mode: ExecutionMode, contestId?: string) {
  if (mode === "run") {
    const queued = await fetchWithRetry<{ id: string; status: string }>("/runner/run", {
      method: "POST",
      body: JSON.stringify({ problemId, code, languageId: 71, customInput: "" }),
    });
    const completed = await pollEvaluation<{ status: string; result?: unknown; error?: string }>(
      `/runner/jobs/${queued.id}`
    );
    if (!completed.result) throw new Error(completed.error || "Run evaluation failed");
    return normalizeLiveSubmission(problemId, mode, completed.result);
  }

  const idempotencyKey = crypto.randomUUID();
  const queued = await fetchWithRetry<{ _id: string; status: string }>("/submissions", {
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey },
    body: JSON.stringify({ problemId, code, languageId: 71, ...(contestId ? { contestId } : {}) }),
  });
  const completed = await pollEvaluation<{ _id: string; status: string; runtime?: number; memory?: number; errorMessage?: string }>(
    `/submissions/${queued._id}`
  );
  return normalizeLiveSubmission(problemId, mode, completed);
}

async function pollEvaluation<T extends { status: string }>(path: string): Promise<T> {
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    const state = await fetchWithRetry<T>(path, { method: "GET" });
    if (!["queued", "processing", "Queued", "Processing"].includes(state.status)) return state;
    await wait(500);
  }
  throw new Error("Evaluation timed out. The job remains available in submission history.");
}

async function persistExecutionRecord(
  problemId: string,
  code: string,
  mode: ExecutionMode,
  result: SubmissionResult,
  problemIdentifier = problemId,
  fallbackTitle?: string
): Promise<void> {
  const record = createSubmissionRecord(problemId, code, mode, result, problemIdentifier, fallbackTitle);

  // Cache local and legacy mock results. In live mode the backend is the source
  // of truth for history and solved-state; caching live results here would
  // create a split-brain (e.g. localStorage-derived "solved" status diverging
  // from the server). `source` is "mock" both in mock mode and when a live
  // call falls back to mock, which is exactly when we want the local cache.
  if (result.source !== "live") {
    upsertSubmissionRecord(record);
  }

  void trackEvent({
    name: mode === "run" ? "code_run" : "code_submit",
    payload: {
      problemId,
      problemSlug: record.problemSlug,
      result: result.status,
      passedCount: result.passedCount,
      totalCount: result.totalCount,
      source: result.source,
    },
  });
}

function buildHeatmap(history: SubmissionRecord[]) {
  const today = new Date();
  const data: UserProfile["heatmap"] = [];

  for (let i = 119; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    const count = history.filter((entry) => entry.createdAt.slice(0, 10) === key).length;
    data.push({ date: key, count });
  }

  return data;
}

function buildAcceptanceTrend(history: SubmissionRecord[]) {
  const monthMap = new Map<string, { accepted: number; total: number }>();

  history.forEach((entry) => {
    const month = entry.createdAt.slice(0, 7);
    const existing = monthMap.get(month) || { accepted: 0, total: 0 };
    existing.total += 1;
    if (entry.result.status === "Accepted") {
      existing.accepted += 1;
    }
    monthMap.set(month, existing);
  });

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .slice(-6)
    .map(([label, value]) => ({
      label,
      acceptance:
        value.total === 0 ? 0 : Math.round((value.accepted / value.total) * 100),
    }));
}

function buildTopicProgress(history: SubmissionRecord[]): TopicProgressPoint[] {
  const solvedByProblem = new Set(
    history
      .filter((entry) => entry.mode === "submit" && entry.result.status === "Accepted")
      .map((entry) => entry.problemId)
  );

  const topicTotals = new Map<string, { solved: number; total: number }>();

  MOCK_PROBLEMS.forEach((problem) => {
    const existing = topicTotals.get(problem.category) || { solved: 0, total: 0 };
    existing.total += 1;
    if (solvedByProblem.has(problem.id)) {
      existing.solved += 1;
    }
    topicTotals.set(problem.category, existing);
  });

  // Fold in solved problems served by the live backend (not in the bundle),
  // attributed to their topic via remembered metadata, so topic coverage
  // reflects imported solves instead of staying at zero.
  const catalogIds = new Set(MOCK_PROBLEMS.map((problem) => problem.id));
  const importedSolved = new Map<string, ProblemMeta>();
  for (const entry of history) {
    if (entry.mode !== "submit" || entry.result.status !== "Accepted") continue;
    if (catalogIds.has(entry.problemId)) continue;
    const meta = resolveProblemMeta(entry.problemSlug) || resolveProblemMeta(entry.problemId);
    if (meta) importedSolved.set(meta.slug, meta);
  }
  for (const meta of importedSolved.values()) {
    const existing = topicTotals.get(meta.category) || { solved: 0, total: 0 };
    existing.solved += 1;
    existing.total += 1;
    topicTotals.set(meta.category, existing);
  }

  return Array.from(topicTotals.entries()).map(([topic, data]) => ({
    topic,
    solved: data.solved,
    total: data.total,
  }));
}

async function mockFetchUserProfile(): Promise<UserProfile> {
  const session = readStoredSession();
  const history = readSubmissionHistoryStore();
  const submits = history.filter((entry) => entry.mode === "submit");
  const accepted = submits.filter((entry) => entry.result.status === "Accepted");

  const fallbackUser = session?.user || {
    id: "user_guest",
    name: "Learner",
    email: "learner@example.com",
    avatarUrl: "",
    createdAt: new Date().toISOString(),
  };

  return {
    user: fallbackUser,
    totalSolved: new Set(accepted.map((entry) => entry.problemId)).size,
    acceptanceRate:
      submits.length === 0
        ? 0
        : Math.round((accepted.length / Math.max(1, submits.length)) * 100),
    streakDays: 12,
    heatmap: buildHeatmap(history),
    acceptanceTrend: buildAcceptanceTrend(history),
    topicProgress: buildTopicProgress(history),
    recentContestRanks: clone(MOCK_RECENT_RANKS),
  };
}

async function liveFetchUserProfile(): Promise<UserProfile> {
  const data = await fetchWithRetry<Partial<UserProfile>>("/profile/me", {
    method: "GET",
  });

  const fallback = await mockFetchUserProfile();

  return {
    user: data.user || fallback.user,
    totalSolved: data.totalSolved ?? fallback.totalSolved,
    acceptanceRate: data.acceptanceRate ?? fallback.acceptanceRate,
    streakDays: data.streakDays ?? fallback.streakDays,
    heatmap: data.heatmap || fallback.heatmap,
    acceptanceTrend: data.acceptanceTrend || fallback.acceptanceTrend,
    topicProgress: data.topicProgress || fallback.topicProgress,
    recentContestRanks: data.recentContestRanks || fallback.recentContestRanks,
  };
}

async function mockFetchCompanyTracks(): Promise<CompanyTrack[]> {
  return clone(MOCK_COMPANY_TRACKS);
}

async function liveFetchCompanyTracks(): Promise<CompanyTrack[]> {
  const tracks = await fetchWithRetry<LearningTrack[]>("/learn/tracks", { method: "GET" });
  return Promise.all((Array.isArray(tracks) ? tracks : []).map(async (track) => {
    const problems = await liveFetchProblems(track.tags ?? []);
    return {
      id: track.id,
      title: track.title,
      company: "Katalume curated",
      description: track.description ?? "",
      totalProblems: problems.length,
      solvedProblems: problems.filter((problem) => problem.status === "solved").length,
      tags: track.tags ?? [],
    };
  }));
}

export async function loginUser(payload: LoginPayload): Promise<AuthSession> {
  const email = payload.email.trim().toLowerCase();
  const password = payload.password.trim();

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const guessedName = email.split("@")[0] || "Learner";
  const name = guessedName
    .split(/[.\-_]/g)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");

  const mockExecutor = async () => {
    await wait(AUTH_DELAY_MS);
    return createMockSession(name || "Learner", email);
  };

  const liveExecutor = async () => {
    const response = await fetchWithRetry<unknown>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    return toAuthSessionFromLive(response, name || "Learner", email);
  };

  const session = await runWithBackendSwitch("login", liveExecutor, mockExecutor);
  persistSession(session);
  void trackEvent({ name: "auth_login", payload: { mode: getNormalizedApiMode() } });
  return clone(session);
}

export async function signupUser(payload: SignupPayload): Promise<AuthSession> {
  const email = payload.email.trim().toLowerCase();
  const password = payload.password.trim();
  const name = payload.name.trim();

  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required.");
  }

  const mockExecutor = async () => {
    await wait(AUTH_DELAY_MS);
    return createMockSession(name, email);
  };

  const liveExecutor = async () => {
    const response = await fetchWithRetry<unknown>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
    return toAuthSessionFromLive(response, name, email);
  };

  const session = await runWithBackendSwitch("signup", liveExecutor, mockExecutor);
  persistSession(session);
  void trackEvent({ name: "auth_signup", payload: { mode: getNormalizedApiMode() } });
  return clone(session);
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  if (getNormalizedApiMode() === "mock") {
    await wait(120);
    return clone(readStoredSession());
  }

  try {
    const sessionState = await fetchWithRetry<{
      authenticated: boolean;
      user: { id?: string; _id?: string; username?: string; email?: string; avatarUrl?: string; createdAt?: string; roles?: string[] };
    }>("/auth/session", { method: "GET" });
    if (!sessionState.authenticated) {
      clearStoredSession();
      return null;
    }
    const user = sessionState.user;
    const session: AuthSession = {
      user: {
        id: user.id || user._id || "",
        name: user.username || "User",
        email: user.email || "",
        avatarUrl: user.avatarUrl || "",
        createdAt: user.createdAt || new Date().toISOString(),
        roles: user.roles || ["User"],
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    persistSession(session);
    return clone(session);
  } catch {
    clearStoredSession();
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  if (getNormalizedApiMode() === "mock") {
    await wait(90);
  } else {
    try {
      await fetchWithRetry<void>("/auth/logout", { method: "POST" });
    } catch (error) {
      reportError(error, { operation: "auth_logout", mode: getNormalizedApiMode() });
    }
  }
  clearStoredSession();
  void trackEvent({ name: "auth_logout" });
}

export async function fetchProblems(options: { tags?: string[] } = {}): Promise<Problem[]> {
  const tags = options.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [];
  const mockExecutor = async () => {
    await wait(FETCH_DELAY_MS);
    return mockFetchProblems(tags);
  };

  const liveExecutor = async () => {
    const data = await liveFetchProblems(tags);
    rememberProblemList(data);
    return data;
  };

  return runWithBackendSwitch("fetch_problems", liveExecutor, mockExecutor);
}

export async function fetchProblemBySlug(slug: string): Promise<ProblemDetail> {
  const mockExecutor = async () => {
    await wait(FETCH_DELAY_MS + 100);
    return mockFetchProblemBySlug(slug);
  };

  const liveExecutor = async () => liveFetchProblemBySlug(slug);

  const detail = await runWithBackendSwitch("fetch_problem_detail", liveExecutor, mockExecutor);
  // Remember metadata so a later solve of a non-bundled (imported) problem can
  // still be attributed to its title, difficulty and topic.
  rememberProblemMeta(detail);
  return detail;
}

export async function runCode(
  problemId: string,
  code: string,
  problemSlug?: string,
  problemTitle?: string
): Promise<SubmissionResult> {
  if (EXECUTION_ADAPTER === "browser") {
    const result = await browserExecute(problemId, code, "run", problemSlug);
    await persistExecutionRecord(problemId, code, "run", result, problemSlug, problemTitle);
    return result;
  }

  const mockExecutor = async () => browserExecute(problemId, code, "run", problemSlug);
  const liveExecutor = async () => liveExecute(problemId, code, "run");

  const result = await runWithBackendSwitch("run_code", liveExecutor, mockExecutor);
  await persistExecutionRecord(problemId, code, "run", result, problemSlug, problemTitle);
  return result;
}

export async function submitSolution(
  problemId: string,
  code: string,
  _languageId = 71,
  _token?: string,
  problemSlug?: string,
  problemTitle?: string,
  contestId?: string
): Promise<SubmissionResult> {
  void _languageId;
  void _token;

  if (EXECUTION_ADAPTER === "browser") {
    if (contestId) {
      throw new Error("Ranked contests require the server judge and are not available in local practice mode.");
    }
    const result = await browserExecute(problemId, code, "submit", problemSlug);
    await persistExecutionRecord(problemId, code, "submit", result, problemSlug, problemTitle);
    return result;
  }

  const mockExecutor = async () => browserExecute(problemId, code, "submit", problemSlug);
  const liveExecutor = async () => liveExecute(problemId, code, "submit", contestId);

  const result = await runWithBackendSwitch("submit_code", liveExecutor, mockExecutor);
  await persistExecutionRecord(problemId, code, "submit", result, problemSlug, problemTitle);
  return result;
}

async function mockFetchSubmissionHistory(
  problemIdentifier: string
): Promise<SubmissionRecord[]> {
  await wait(120);
  const problem = getProblemByIdentifier(problemIdentifier);
  const slug = problem?.slug || problemIdentifier;

  return clone(
    readSubmissionHistoryStore()
      .filter((entry) => entry.problemSlug === slug || entry.problemId === problemIdentifier)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  );
}

interface LiveSubmission {
  _id: string;
  problemId?: { _id?: string; title?: string; slug?: string; difficulty?: string } | string;
  code?: string;
  status?: string;
  runtime?: number;
  memory?: number;
  errorMessage?: string;
  createdAt?: string;
}

function toVerdictFromLive(status?: string): SubmissionResult["status"] {
  if (status === "Accepted") return "Accepted";
  if (status === "Runtime Error") return "Runtime Error";
  return "Failed";
}

function toSubmissionRecordFromLive(raw: LiveSubmission): SubmissionRecord {
  const populated =
    raw.problemId && typeof raw.problemId === "object" ? raw.problemId : undefined;
  const problemId =
    populated?._id || (typeof raw.problemId === "string" ? raw.problemId : "") || "";
  const status = toVerdictFromLive(raw.status);
  const createdAt = raw.createdAt || new Date().toISOString();
  const accepted = status === "Accepted";

  const result: SubmissionResult = {
    submissionId: raw._id,
    problemId,
    status,
    // Backend stores Judge0 time in seconds and memory in KB.
    runtimeMs: Math.round((raw.runtime || 0) * 1000),
    memoryMb: Math.round(((raw.memory || 0) / 1024) * 100) / 100,
    score: accepted ? 100 : 0,
    message: raw.errorMessage || status,
    mode: "submit",
    visibility: "hidden",
    passedCount: accepted ? 1 : 0,
    totalCount: 1,
    traceback: raw.errorMessage,
    testCases: [],
    source: "live",
    submittedAt: createdAt,
  };

  return {
    id: raw._id,
    problemId,
    problemSlug: populated?.slug || problemId,
    problemTitle: populated?.title || "Problem",
    code: raw.code || "",
    mode: "submit",
    result,
    createdAt,
  };
}

async function liveFetchSubmissionHistory(
  problemIdentifier: string
): Promise<SubmissionRecord[]> {
  const query = problemIdentifier
    ? `?problemId=${encodeURIComponent(problemIdentifier)}`
    : "";
  const data = await fetchWithRetry<LiveSubmission[]>(`/submissions${query}`, {
    method: "GET",
  });
  return (Array.isArray(data) ? data : []).map(toSubmissionRecordFromLive);
}

export async function fetchSubmissionHistory(
  problemIdentifier: string
): Promise<SubmissionRecord[]> {
  if (EXECUTION_ADAPTER === "browser") {
    return mockFetchSubmissionHistory(problemIdentifier);
  }
  return runWithBackendSwitch(
    "fetch_submission_history",
    () => liveFetchSubmissionHistory(problemIdentifier),
    () => mockFetchSubmissionHistory(problemIdentifier)
  );
}

export async function fetchCompanyTracks(): Promise<CompanyTrack[]> {
  return runWithBackendSwitch(
    "fetch_company_tracks",
    () => liveFetchCompanyTracks(),
    () => mockFetchCompanyTracks()
  );
}

export async function fetchUserProfile(): Promise<UserProfile> {
  // When code runs in the browser (Pyodide), solves are recorded to local
  // history and never reach the backend, so the profile must be derived from
  // that same local history — matching fetchUserStats / fetchUserProgress /
  // fetchRecentActivity. Reading /profile/me here would show 0 solved while
  // the dashboard shows the real count (the split-brain QA flagged).
  if (EXECUTION_ADAPTER === "browser") {
    return mockFetchUserProfile();
  }
  return runWithBackendSwitch(
    "fetch_user_profile",
    () => liveFetchUserProfile(),
    () => mockFetchUserProfile()
  );
}

export async function updateUserProfile(input: UpdateProfileInput): Promise<User> {
  const current = readStoredSession();
  if (!current) throw new Error("Sign in to update your profile.");

  const updated = await runWithBackendSwitch(
    "update_user_profile",
    async () => {
      const raw = await fetchWithRetry<{
        _id?: string;
        id?: string;
        username?: string;
        email?: string;
        avatarUrl?: string;
        createdAt?: string;
        roles?: string[];
      }>(`/users/${current.user.id}`, {
        method: "PUT",
        body: JSON.stringify({
          username: input.name.trim(),
          avatarUrl: input.avatarUrl?.trim() || "",
        }),
      });
      return {
        id: raw.id || raw._id || current.user.id,
        name: raw.username || input.name.trim(),
        email: raw.email || current.user.email,
        avatarUrl: raw.avatarUrl || "",
        createdAt: raw.createdAt || current.user.createdAt,
        roles: raw.roles || current.user.roles,
      };
    },
    async () => {
      await wait(200);
      return {
        ...current.user,
        name: input.name.trim(),
        avatarUrl: input.avatarUrl?.trim() || "",
      };
    }
  );

  persistSession({ ...current, user: updated });
  return clone(updated);
}

const EMPTY_DIFFICULTY = { Easy: { solved: 0, total: 0 }, Medium: { solved: 0, total: 0 }, Hard: { solved: 0, total: 0 } };

// Derive stats from the local mock problems + submission history so the mock
// dashboard reflects problems actually solved in this browser.
async function mockFetchUserStats(): Promise<UserStats> {
  await wait(120);
  const history = readSubmissionHistoryStore();

  const solved = new Set<string>();
  const attempted = new Set<string>();
  let acceptedSubmissions = 0;
  for (const entry of history) {
    if (entry.mode === "submit" && entry.result.status === "Accepted") {
      solved.add(entry.problemSlug);
      acceptedSubmissions += 1;
    } else {
      attempted.add(entry.problemSlug);
    }
  }
  for (const slug of solved) attempted.delete(slug);

  const byDifficulty = {
    Easy: { solved: 0, total: 0 },
    Medium: { solved: 0, total: 0 },
    Hard: { solved: 0, total: 0 },
  };
  const known = allKnownProblemMeta();
  for (const meta of known.values()) {
    const bucket = byDifficulty[meta.difficulty];
    if (bucket) {
      bucket.total += 1;
      if (solved.has(meta.slug)) bucket.solved += 1;
    }
  }
  // Solved problems we have no metadata for at all (e.g. cache cleared):
  // still count them somewhere sensible rather than dropping them.
  for (const slug of solved) {
    if (known.has(slug)) continue;
    const meta = resolveProblemMeta(slug);
    const bucket = meta ? byDifficulty[meta.difficulty] : undefined;
    if (bucket) {
      bucket.solved += 1;
      bucket.total += 1;
    }
  }

  return {
    totalProblems: known.size,
    solved: solved.size,
    attempted: attempted.size,
    totalSubmissions: history.length,
    acceptedSubmissions,
    byDifficulty,
  };
}

async function liveFetchUserStats(): Promise<UserStats> {
  const data = await fetchWithRetry<Partial<UserStats>>("/users/me/stats", {
    method: "GET",
  });
  return {
    totalProblems: data.totalProblems ?? 0,
    solved: data.solved ?? 0,
    attempted: data.attempted ?? 0,
    totalSubmissions: data.totalSubmissions ?? 0,
    acceptedSubmissions: data.acceptedSubmissions ?? 0,
    byDifficulty: data.byDifficulty ?? EMPTY_DIFFICULTY,
  };
}

export async function fetchUserStats(): Promise<UserStats> {
  if (EXECUTION_ADAPTER === "browser") {
    return mockFetchUserStats();
  }
  return runWithBackendSwitch(
    "fetch_user_stats",
    () => liveFetchUserStats(),
    () => mockFetchUserStats()
  );
}

function toDifficulty(value: unknown): Difficulty {
  return value === "Easy" || value === "Medium" || value === "Hard" ? value : "Medium";
}

async function mockFetchRecentActivity(limit: number): Promise<RecentActivityItem[]> {
  await wait(120);
  return readSubmissionHistoryStore()
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit)
    .map((rec) => {
      const problem =
        getProblemByIdentifier(rec.problemSlug) || getProblemByIdentifier(rec.problemId);
      const accepted = rec.result.status === "Accepted";
      const progress = accepted
        ? 100
        : rec.result.totalCount > 0
        ? Math.round((rec.result.passedCount / rec.result.totalCount) * 100)
        : 40;
      return {
        id: rec.id,
        title: rec.problemTitle,
        difficulty: toDifficulty(problem?.difficulty),
        status: accepted ? "Completed" : "In Progress",
        progress,
      };
    });
}

async function liveFetchRecentActivity(limit: number): Promise<RecentActivityItem[]> {
  const data = await fetchWithRetry<LiveSubmission[]>(`/submissions?limit=${limit}`, {
    method: "GET",
  });
  return (Array.isArray(data) ? data : []).map((sub) => {
    const populated =
      sub.problemId && typeof sub.problemId === "object" ? sub.problemId : undefined;
    const accepted = sub.status === "Accepted";
    return {
      id: sub._id,
      title: populated?.title || "Problem",
      difficulty: toDifficulty(populated?.difficulty),
      status: accepted ? "Completed" : "In Progress",
      progress: accepted ? 100 : 40,
    };
  });
}

export async function fetchRecentActivity(limit = 5): Promise<RecentActivityItem[]> {
  if (EXECUTION_ADAPTER === "browser") {
    return mockFetchRecentActivity(limit);
  }
  return runWithBackendSwitch(
    "fetch_recent_activity",
    () => liveFetchRecentActivity(limit),
    () => mockFetchRecentActivity(limit)
  );
}

function competitionStatus(startTime: string, endTime: string): CompetitionStatus {
  const now = Date.now();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return "upcoming";
  if (now < start) return "upcoming";
  if (now > end) return "ended";
  return "live";
}

interface LiveContest {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  participantCount?: number;
  problemCount?: number;
  problems?: Array<{ _id?: string; id?: string; slug?: string; title?: string; difficulty?: Difficulty }>;
  isRegistered?: boolean;
}

function toCompetitionFromLive(raw: LiveContest): Competition {
  const startTime = raw.startTime || new Date().toISOString();
  const endTime = raw.endTime || startTime;
  return {
    id: raw._id || raw.id || "",
    title: raw.title || "Untitled Contest",
    description: raw.description,
    startTime,
    endTime,
    participantCount: raw.participantCount ?? 0,
    problemCount: raw.problemCount ?? 0,
    status: competitionStatus(startTime, endTime),
  };
}

const HOUR_MS = 60 * 60 * 1000;

function mockFetchCompetitions(): Promise<Competition[]> {
  const now = Date.now();
  const raw: LiveContest[] = [
    {
      _id: "comp-live",
      title: "Model Metrics Championship",
      description: "Solve 5 evaluation-heavy challenges under 75 minutes.",
      startTime: new Date(now - HOUR_MS).toISOString(),
      endTime: new Date(now + HOUR_MS).toISOString(),
      participantCount: 1240,
      problemCount: 5,
    },
    {
      _id: "comp-soon",
      title: "Feature Engineering Arena",
      description: "Timed feature-engineering gauntlet.",
      startTime: new Date(now + 3 * HOUR_MS).toISOString(),
      endTime: new Date(now + 5 * HOUR_MS).toISOString(),
      participantCount: 980,
      problemCount: 4,
    },
    {
      _id: "comp-upcoming",
      title: "Pandas Speed Round",
      description: "Fast data-wrangling sprint.",
      startTime: new Date(now + 3 * 24 * HOUR_MS).toISOString(),
      endTime: new Date(now + 3 * 24 * HOUR_MS + HOUR_MS).toISOString(),
      participantCount: 2100,
      problemCount: 6,
    },
    {
      _id: "comp-past",
      title: "Regression Sprint #11",
      description: "Last week's regression contest.",
      startTime: new Date(now - 7 * 24 * HOUR_MS).toISOString(),
      endTime: new Date(now - 7 * 24 * HOUR_MS + 2 * HOUR_MS).toISOString(),
      participantCount: 1740,
      problemCount: 5,
    },
  ];
  return Promise.resolve(raw.map(toCompetitionFromLive));
}

async function liveFetchCompetitions(): Promise<Competition[]> {
  const data = await fetchWithRetry<LiveContest[]>("/contests", { method: "GET" });
  return (Array.isArray(data) ? data : []).map(toCompetitionFromLive);
}

export async function fetchCompetitions(): Promise<Competition[]> {
  return runWithBackendSwitch(
    "fetch_competitions",
    () => liveFetchCompetitions(),
    () => mockFetchCompetitions()
  );
}

export async function fetchCompetitionById(id: string): Promise<CompetitionDetail> {
  return runWithBackendSwitch(
    "fetch_competition_detail",
    async () => {
      const raw = await fetchWithRetry<LiveContest>(`/contests/${id}`, { method: "GET" });
      return {
        ...toCompetitionFromLive({ ...raw, problemCount: raw.problems?.length ?? raw.problemCount }),
        problems: (raw.problems ?? []).map((problem) => ({
          id: problem._id || problem.id || "",
          slug: problem.slug || "",
          title: problem.title || "Untitled Problem",
          difficulty: toDifficulty(problem.difficulty),
        })),
        isRegistered: raw.isRegistered,
      };
    },
    async () => {
      const competition = (await mockFetchCompetitions()).find((item) => item.id === id);
      if (!competition) throw new Error("Contest not found.");
      return {
        ...competition,
        problems: MOCK_PROBLEMS.slice(0, Math.min(competition.problemCount, 3)).map((problem) => ({
          id: problem.id,
          slug: problem.slug,
          title: problem.title,
          difficulty: problem.difficulty,
        })),
      };
    }
  );
}

export async function fetchContestLeaderboard(id: string): Promise<ContestLeaderboardEntry[]> {
  return runWithBackendSwitch(
    "fetch_contest_leaderboard",
    () => fetchWithRetry<ContestLeaderboardEntry[]>(`/contests/${id}/leaderboard`, { method: "GET" }),
    async () => MOCK_LEADERBOARD.slice(0, 5).map((entry) => ({
      rank: entry.rank,
      userId: entry.userId,
      username: entry.username,
      score: entry.solved,
      problemsSolved: Math.min(entry.solved, 5),
    }))
  );
}

export async function registerForContest(id: string): Promise<void> {
  return runWithBackendSwitch(
    "register_for_contest",
    () => fetchWithRetry<void>(`/contests/${id}/register`, { method: "POST" }),
    () => wait(250)
  );
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dayStartMs(value: string | number): number {
  const d = new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

async function mockFetchUserProgress(): Promise<UserProgress> {
  await wait(120);
  const accepted = readSubmissionHistoryStore().filter(
    (entry) => entry.mode === "submit" && entry.result.status === "Accepted"
  );

  const todayStart = dayStartMs(Date.now());
  const weekly = Array.from({ length: 7 }, (_, i) => {
    const start = todayStart - (6 - i) * HOUR_MS * 24;
    const solved = new Set(
      accepted.filter((e) => dayStartMs(e.createdAt) === start).map((e) => e.problemSlug)
    );
    return {
      date: new Date(start).toISOString().slice(0, 10),
      label: WEEKDAY_LABELS[new Date(start).getDay()],
      solved: solved.size,
    };
  });

  const activeDays = new Set(accepted.map((e) => dayStartMs(e.createdAt)));
  let currentStreak = 0;
  for (let day = todayStart; activeDays.has(day); day -= HOUR_MS * 24) currentStreak += 1;
  let longestStreak = 0;
  for (const day of activeDays) {
    if (!activeDays.has(day - HOUR_MS * 24)) {
      let run = 1;
      let next = day + HOUR_MS * 24;
      while (activeDays.has(next)) {
        run += 1;
        next += HOUR_MS * 24;
      }
      longestStreak = Math.max(longestStreak, run);
    }
  }

  const solvedSlugs = new Set(accepted.map((e) => e.problemSlug));
  const tagTotal = new Map<string, number>();
  const tagSolved = new Map<string, number>();
  for (const problem of MOCK_PROBLEMS) {
    for (const tag of problem.tags) {
      tagTotal.set(tag, (tagTotal.get(tag) || 0) + 1);
      if (solvedSlugs.has(problem.slug)) tagSolved.set(tag, (tagSolved.get(tag) || 0) + 1);
    }
  }
  const topics = [...tagTotal.entries()]
    .map(([tag, total]) => ({ tag, total, solved: tagSolved.get(tag) || 0 }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  return { weekly, currentStreak, longestStreak, topics };
}

async function liveFetchUserProgress(): Promise<UserProgress> {
  const data = await fetchWithRetry<Partial<UserProgress>>("/users/me/progress", {
    method: "GET",
  });
  return {
    weekly: data.weekly ?? [],
    currentStreak: data.currentStreak ?? 0,
    longestStreak: data.longestStreak ?? 0,
    topics: data.topics ?? [],
  };
}

export async function fetchUserProgress(): Promise<UserProgress> {
  if (EXECUTION_ADAPTER === "browser") {
    return mockFetchUserProgress();
  }
  return runWithBackendSwitch(
    "fetch_user_progress",
    () => liveFetchUserProgress(),
    () => mockFetchUserProgress()
  );
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: "u-aarav", username: "Aarav", solved: 128 },
  { rank: 2, userId: "u-emily", username: "Emily", solved: 121 },
  { rank: 3, userId: "u-noah", username: "Noah", solved: 117 },
  { rank: 4, userId: "u-saanvi", username: "Saanvi", solved: 110 },
  { rank: 5, userId: "u-liam", username: "Liam", solved: 104 },
];

async function mockFetchLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
  await wait(120);
  return clone(MOCK_LEADERBOARD).slice(0, limit);
}

async function liveFetchLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
  const data = await fetchWithRetry<LeaderboardEntry[]>(`/leaderboard?limit=${limit}`, {
    method: "GET",
  });
  return Array.isArray(data) ? data : [];
}

export async function fetchLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  return runWithBackendSwitch(
    "fetch_leaderboard",
    () => liveFetchLeaderboard(limit),
    () => mockFetchLeaderboard(limit)
  );
}

const MOCK_LEARNING_TRACKS: LearningTrack[] = [
  {
    id: "track-ml-foundations",
    slug: "ml-foundations",
    title: "ML Foundations",
    description: "Linear models, overfitting, feature scaling, and evaluation.",
    tags: ["supervised-learning", "model-evaluation"],
    lessons: [
      "Bias-Variance Tradeoff",
      "Confusion Matrix and F1",
      "Regularization in Practice",
      "Gradient Descent Intuition",
    ],
    lessonCount: 4,
  },
  {
    id: "track-pandas-interviews",
    slug: "pandas-for-interviews",
    title: "Pandas for Interviews",
    description: "Joins, groupby, window operations, and common data transforms.",
    tags: ["pandas", "preprocessing"],
    lessons: ["GroupBy Deep Dive", "Joins and Merges", "Window Functions"],
    lessonCount: 3,
  },
  {
    id: "track-model-selection",
    slug: "model-selection",
    title: "Model Selection",
    description: "Cross-validation, hyperparameter tuning, and proper split strategy.",
    tags: ["model-evaluation"],
    lessons: ["Cross-Validation", "Hyperparameter Tuning", "Feature Drift Detection"],
    lessonCount: 3,
  },
];

async function mockFetchLearningTracks(): Promise<LearningTrack[]> {
  await wait(120);
  return clone(MOCK_LEARNING_TRACKS);
}

async function liveFetchLearningTracks(): Promise<LearningTrack[]> {
  const data = await fetchWithRetry<LearningTrack[]>("/learn/tracks", { method: "GET" });
  return (Array.isArray(data) ? data : []).map((track) => ({
    id: track.id,
    slug: track.slug,
    title: track.title,
    description: track.description ?? "",
    tags: track.tags ?? [],
    lessons: track.lessons ?? [],
    lessonCount: track.lessonCount ?? (track.lessons ?? []).length,
    order: track.order ?? 0,
  }));
}

export async function fetchLearningTracks(): Promise<LearningTrack[]> {
  return runWithBackendSwitch(
    "fetch_learning_tracks",
    () => liveFetchLearningTracks(),
    () => mockFetchLearningTracks()
  );
}

// --- Admin authoring ------------------------------------------------------
// These POST to the backend in live mode (the bearer token is attached by
// fetchWithRetry). In mock mode they simulate success, since there is no local
// persistence store for authored content.

export async function createProblem(input: NewProblemInput): Promise<{ slug?: string }> {
  return runWithBackendSwitch(
    "create_problem",
    () =>
      fetchWithRetry<{ slug?: string }>("/problems", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    async () => {
      await wait(200);
      return { slug: `${input.title.toLowerCase().replace(/[^\w]+/g, "-")}` };
    }
  );
}

export async function createContest(input: NewContestInput): Promise<{ _id?: string }> {
  return runWithBackendSwitch(
    "create_contest",
    () =>
      fetchWithRetry<{ _id?: string }>("/contests", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    async () => {
      await wait(200);
      return { _id: `mock-${Date.now()}` };
    }
  );
}

export async function createLearningTrack(
  input: NewLearningTrackInput
): Promise<{ slug?: string }> {
  return runWithBackendSwitch(
    "create_learning_track",
    () =>
      fetchWithRetry<{ slug?: string }>("/learn/tracks", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    async () => {
      await wait(200);
      return { slug: `${input.title.toLowerCase().replace(/[^\w]+/g, "-")}` };
    }
  );
}

export async function updateProblem(
  id: string,
  input: NewProblemInput
): Promise<{ slug?: string }> {
  return runWithBackendSwitch(
    "update_problem",
    () =>
      fetchWithRetry<{ slug?: string }>(`/problems/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    async () => {
      await wait(200);
      return {};
    }
  );
}

export async function deleteProblem(id: string): Promise<void> {
  return runWithBackendSwitch(
    "delete_problem",
    () => fetchWithRetry<void>(`/problems/${id}`, { method: "DELETE" }),
    () => wait(200)
  );
}

export async function updateContest(id: string, input: NewContestInput): Promise<void> {
  return runWithBackendSwitch(
    "update_contest",
    () =>
      fetchWithRetry<void>(`/contests/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    () => wait(200)
  );
}

export async function deleteContest(id: string): Promise<void> {
  return runWithBackendSwitch(
    "delete_contest",
    () => fetchWithRetry<void>(`/contests/${id}`, { method: "DELETE" }),
    () => wait(200)
  );
}

export async function updateLearningTrack(
  id: string,
  input: NewLearningTrackInput
): Promise<void> {
  return runWithBackendSwitch(
    "update_learning_track",
    () =>
      fetchWithRetry<void>(`/learn/tracks/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    () => wait(200)
  );
}

export async function deleteLearningTrack(id: string): Promise<void> {
  return runWithBackendSwitch(
    "delete_learning_track",
    () => fetchWithRetry<void>(`/learn/tracks/${id}`, { method: "DELETE" }),
    () => wait(200)
  );
}

export async function clearSubmissionHistory(): Promise<void> {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.removeItem(submissionHistoryKey());
}

// ----- Social login (OAuth) -----

export type SocialProvider = "google" | "github";
export interface AuthProvider {
  id: SocialProvider;
  name: string;
}

export function socialLoginUrl(provider: SocialProvider): string {
  // Always start OAuth through the same-origin BFF. The gateway preserves the
  // backend's redirects and Set-Cookie headers, so real auth works on a free
  // vercel.app hostname without cross-site cookies or a purchased domain.
  return `/api/auth/oauth/${provider}`;
}

// Which social providers the backend has configured. In mock mode we advertise
// both so the public demo shows the full sign-in experience.
export async function fetchAuthProviders(): Promise<AuthProvider[]> {
  if (getNormalizedApiMode() === "mock") {
    return [
      { id: "google", name: "Google" },
      { id: "github", name: "GitHub" },
    ];
  }
  try {
    const response = await fetch(`${API_BASE_URL}/auth/providers`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return [];
    const data = (await response.json()) as { providers?: AuthProvider[] };
    return Array.isArray(data.providers) ? data.providers : [];
  } catch {
    return [];
  }
}

export function isMockMode(): boolean {
  return getNormalizedApiMode() === "mock";
}
