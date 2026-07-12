import {
  AuthSession,
  CompanyTrack,
  Competition,
  CompetitionStatus,
  ContestRank,
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
  UserProfile,
  UserProgress,
  UserStats,
} from "@/types";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_TTL_SECONDS } from "@/lib/auth";
import { trackEvent } from "@/lib/analytics";
import { reportError, reportMessage } from "@/lib/observability";

type ApiMode = "mock" | "live" | "auto";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
const API_MODE = ((process.env.NEXT_PUBLIC_API_MODE || "mock").toLowerCase() ||
  "mock") as ApiMode;
const API_RETRY_COUNT = Number(process.env.NEXT_PUBLIC_API_RETRY_COUNT || 2);
const API_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || 8000);
const ALLOW_MOCK_FALLBACK = process.env.NEXT_PUBLIC_API_FALLBACK_TO_MOCK !== "false";

const MOCK_SESSION_KEY = "mlboost.mock.session";
const ACCESS_TOKEN_KEY = "accessToken";
const SUBMISSION_HISTORY_KEY = "mlboost.submission.history";

const SUBMIT_DELAY_MS = 2000;
const FETCH_DELAY_MS = 420;
const AUTH_DELAY_MS = 550;

interface EvaluationRule {
  requiredPatterns: RegExp[];
  guidance: string;
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

const MOCK_PROBLEMS: ProblemDetail[] = [
  {
    id: "p-001",
    slug: "knn-classifier-iris",
    title: "KNN Classifier on Iris",
    difficulty: "Easy",
    category: "Supervised Learning",
    acceptance: 74,
    acceptanceRate: 74,
    status: "unsolved",
    tags: ["scikit-learn", "classification", "knn"],
    companies: ["Meta", "Amazon", "DoorDash"],
    trackIds: ["track-ml-core-50"],
    summary: "Implement KNN and return deterministic predictions on Iris slices.",
    description:
      "Implement `fit_and_predict(X_train, y_train, X_test, k)` using K-Nearest Neighbors logic. Use Euclidean distance and majority voting. Do not use `KNeighborsClassifier`.",
    constraints: [
      "1 <= k <= len(X_train)",
      "All features are numeric floats.",
      "Return a list of integer class predictions.",
    ],
    examples: [
      {
        input:
          "X_train=[[5.1,3.5],[4.9,3.0]], y_train=[0,0], X_test=[[5.0,3.4]], k=1",
        output: "[0]",
      },
      {
        input:
          "X_train=[[6.7,3.1],[6.3,2.9],[5.0,3.6]], y_train=[2,1,0], X_test=[[6.5,3.0]], k=3",
        output: "[1]",
      },
    ],
    sampleTestCases: [
      {
        input:
          "X_train=[[5.1,3.5],[4.9,3.0]], y_train=[0,0], X_test=[[5.0,3.4]], k=1",
        output: "[0]",
      },
      {
        input:
          "X_train=[[6.7,3.1],[6.3,2.9],[5.0,3.6]], y_train=[2,1,0], X_test=[[6.5,3.0]], k=3",
        output: "[1]",
      },
      {
        input:
          "X_train=[[5.4,3.9],[6.1,2.8],[6.9,3.1]], y_train=[0,1,2], X_test=[[6.0,3.0]], k=1",
        output: "[1]",
      },
    ],
    hiddenTestCount: 6,
    hints: [
      "Compute distances for every test point against every train point.",
      "Sort by distance and pick the first k neighbors.",
      "Vote with class frequency; break ties by choosing the smallest label.",
    ],
    editorial: {
      summary:
        "Use a brute-force nearest neighbor search over all training points and stable tie-breaking.",
      approach:
        "For each test vector, compute Euclidean distances to every train vector, sort ascending, take top-k labels, and vote by frequency with deterministic tie breaks.",
      timeComplexity: "O(n_test * n_train * d + n_test * n_train log n_train)",
      spaceComplexity: "O(n_train)",
      pitfalls: [
        "Using Manhattan distance instead of Euclidean by mistake.",
        "Not handling label ties deterministically.",
        "Mutating input arrays during sorting.",
      ],
    },
    starterCode: `import math
from collections import Counter

def fit_and_predict(X_train, y_train, X_test, k):
    predictions = []
    for x in X_test:
        distances = []
        for i, train_x in enumerate(X_train):
            distance = math.sqrt(sum((a - b) ** 2 for a, b in zip(x, train_x)))
            distances.append((distance, y_train[i]))

        distances.sort(key=lambda item: item[0])
        top_k = [label for _, label in distances[:k]]
        vote = Counter(top_k).most_common()
        vote.sort(key=lambda pair: (-pair[1], pair[0]))
        predictions.append(vote[0][0])
    return predictions`,
  },
  {
    id: "p-002",
    slug: "linear-regression-gradient-descent",
    title: "Linear Regression via Gradient Descent",
    difficulty: "Medium",
    category: "Supervised Learning",
    acceptance: 61,
    acceptanceRate: 61,
    status: "attempted",
    tags: ["numpy", "regression", "optimization"],
    companies: ["Google", "Stripe", "Databricks"],
    trackIds: ["track-ml-core-50"],
    summary:
      "Train y = wx + b with gradient descent and return learned parameters.",
    description:
      "Implement `train_linear_regression(X, y, lr, epochs)` and return `(w, b)`. Optimize Mean Squared Error with gradient descent.",
    constraints: [
      "X and y are 1D lists of equal length.",
      "Use full-batch gradient descent.",
      "Return floats rounded to 4 decimals.",
    ],
    examples: [
      {
        input: "X=[1,2,3], y=[3,5,7], lr=0.01, epochs=1000",
        output: "(2.0, 1.0)",
      },
    ],
    sampleTestCases: [
      {
        input: "X=[1,2,3], y=[3,5,7], lr=0.01, epochs=1000",
        output: "(2.0, 1.0)",
      },
      {
        input: "X=[0,1,2], y=[1,3,5], lr=0.02, epochs=800",
        output: "(2.0, 1.0)",
      },
      {
        input: "X=[2,4,6], y=[5,9,13], lr=0.01, epochs=1200",
        output: "(2.0, 1.0)",
      },
    ],
    hiddenTestCount: 7,
    hints: [
      "Prediction: y_hat = w*x + b.",
      "dw = (2/n) * sum((y_hat - y) * x); db = (2/n) * sum(y_hat - y).",
      "Update both parameters each epoch.",
    ],
    editorial: {
      summary:
        "Batch gradient descent converges quickly on 1D linear relations if updates are consistent.",
      approach:
        "Initialize w, b to 0. In each epoch compute predictions, derive gradients over all samples, and update both parameters using learning rate.",
      timeComplexity: "O(epochs * n)",
      spaceComplexity: "O(n)",
      pitfalls: [
        "Forgetting factor 2 in MSE gradient.",
        "Updating w before computing db from same step.",
        "Choosing an unstable learning rate.",
      ],
    },
    starterCode: `def train_linear_regression(X, y, lr=0.01, epochs=1000):
    n = len(X)
    w = 0.0
    b = 0.0

    for _ in range(epochs):
        y_hat = [w * x + b for x in X]
        dw = (2 / n) * sum((pred - target) * x for pred, target, x in zip(y_hat, y, X))
        db = (2 / n) * sum(pred - target for pred, target in zip(y_hat, y))
        w -= lr * dw
        b -= lr * db

    return round(w, 4), round(b, 4)`,
  },
  {
    id: "p-003",
    slug: "standardize-dataset",
    title: "Standardize Dataset Columns",
    difficulty: "Easy",
    category: "Data Preprocessing",
    acceptance: 82,
    acceptanceRate: 82,
    status: "solved",
    tags: ["pandas", "numpy", "preprocessing"],
    companies: ["Uber", "Airbnb", "Flipkart"],
    trackIds: ["track-pandas-interview-30"],
    summary: "Apply z-score standardization to selected numeric columns.",
    description:
      "Given a pandas DataFrame and a list of columns, return a new DataFrame where those columns are standardized using (x - mean) / std.",
    constraints: [
      "Do not mutate the input DataFrame.",
      "Use population standard deviation (ddof=0).",
      "Return values rounded to 5 decimals.",
    ],
    examples: [
      {
        input: "df={'age':[20,30,40]}, columns=['age']",
        output: "age=[-1.22474, 0.0, 1.22474]",
      },
    ],
    sampleTestCases: [
      {
        input: "df={'age':[20,30,40]}, columns=['age']",
        output: "age=[-1.22474, 0.0, 1.22474]",
      },
      {
        input: "df={'a':[1,2,3], 'b':[10,10,10]}, columns=['a']",
        output: "a=[-1.22474, 0.0, 1.22474]",
      },
      {
        input: "df={'x':[2,4,6,8]}, columns=['x']",
        output: "x=[-1.34164,-0.44721,0.44721,1.34164]",
      },
    ],
    hiddenTestCount: 5,
    hints: [
      "Work on a copy: `scaled = df.copy()`.",
      "Use vectorized operations for each column.",
      "Handle zero std by filling that column with 0.0.",
    ],
    editorial: {
      summary:
        "Standardization should be stable, non-mutating, and safe on constant columns.",
      approach:
        "Copy input frame, loop over target columns, compute mean/std (ddof=0), handle std=0 edge case, and write standardized values.",
      timeComplexity: "O(n * c)",
      spaceComplexity: "O(n * c)",
      pitfalls: [
        "Mutating original DataFrame.",
        "Using sample std (ddof=1) accidentally.",
        "Divide by zero for constant columns.",
      ],
    },
    starterCode: `import pandas as pd

def standardize_columns(df: pd.DataFrame, columns: list[str]) -> pd.DataFrame:
    scaled = df.copy()
    for col in columns:
        mean = scaled[col].mean()
        std = scaled[col].std(ddof=0)
        if std == 0:
            scaled[col] = 0.0
        else:
            scaled[col] = ((scaled[col] - mean) / std).round(5)
    return scaled`,
  },
  {
    id: "p-004",
    slug: "f1-score-from-scratch",
    title: "Compute F1 Score from Scratch",
    difficulty: "Medium",
    category: "Model Evaluation",
    acceptance: 58,
    acceptanceRate: 58,
    status: "unsolved",
    tags: ["metrics", "classification", "scikit-learn"],
    companies: ["Netflix", "Grab", "Microsoft"],
    trackIds: ["track-ml-core-50", "track-recommendation-20"],
    summary: "Implement precision, recall, and F1 for binary classification.",
    description:
      "Implement `binary_f1(y_true, y_pred)` returning a float in [0, 1]. Treat label `1` as positive class.",
    constraints: [
      "y_true and y_pred have equal lengths.",
      "Handle divide-by-zero safely.",
      "Round output to 4 decimals.",
    ],
    examples: [
      {
        input: "y_true=[1,0,1,1], y_pred=[1,0,0,1]",
        output: "0.8",
      },
    ],
    sampleTestCases: [
      {
        input: "y_true=[1,0,1,1], y_pred=[1,0,0,1]",
        output: "0.8",
      },
      {
        input: "y_true=[0,0,0], y_pred=[0,0,0]",
        output: "0.0",
      },
      {
        input: "y_true=[1,1,1], y_pred=[1,1,1]",
        output: "1.0",
      },
    ],
    hiddenTestCount: 8,
    hints: [
      "Count TP, FP, FN explicitly.",
      "precision = TP / (TP + FP), recall = TP / (TP + FN).",
      "F1 is 0 when precision + recall is 0.",
    ],
    editorial: {
      summary:
        "F1 balances precision and recall and is useful for imbalanced positives.",
      approach:
        "Compute TP/FP/FN in one pass, derive precision and recall with safe denominators, then harmonic mean.",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      pitfalls: [
        "Using macro formula on binary labels incorrectly.",
        "Not guarding denominator = 0.",
        "Mixing positive class label.",
      ],
    },
    starterCode: `def binary_f1(y_true, y_pred):
    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)

    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0

    if precision + recall == 0:
        return 0.0
    return round(2 * precision * recall / (precision + recall), 4)`,
  },
];

const EVALUATION_RULES: Record<string, EvaluationRule> = {
  "p-001": {
    requiredPatterns: [
      /def\s+fit_and_predict\s*\(/,
      /distance/i,
      /sort\(/,
      /Counter|most_common/,
    ],
    guidance:
      "Ensure you compute Euclidean distances and majority vote across the nearest neighbors.",
  },
  "p-002": {
    requiredPatterns: [
      /def\s+train_linear_regression\s*\(/,
      /dw\s*=/,
      /db\s*=/,
      /for\s+_\s+in\s+range\(epochs\)/,
    ],
    guidance:
      "Your loop should update both w and b every epoch using gradients from MSE.",
  },
  "p-003": {
    requiredPatterns: [
      /def\s+standardize_columns\s*\(/,
      /copy\(/,
      /std\(/,
      /mean\(/,
    ],
    guidance:
      "Work on a DataFrame copy and standardize each requested column with z-score.",
  },
  "p-004": {
    requiredPatterns: [
      /def\s+binary_f1\s*\(/,
      /precision\s*=/,
      /recall\s*=/,
      /tp|true[_\s]?positive/i,
    ],
    guidance:
      "Compute TP/FP/FN first, then precision and recall before calculating F1.",
  },
};

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
  return "mock";
}

export function getBackendMode(): ApiMode {
  return getNormalizedApiMode();
}

function persistSession(session: AuthSession): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
  window.localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  window.document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; max-age=${AUTH_COOKIE_TTL_SECONDS}; samesite=lax`;
}

function readStoredSession(): AuthSession | null {
  if (!isBrowser()) {
    return null;
  }
  const hasAuthCookie = window.document.cookie
    .split(";")
    .some((part) => part.trim().startsWith(`${AUTH_COOKIE_NAME}=`));

  if (!hasAuthCookie) {
    window.localStorage.removeItem(MOCK_SESSION_KEY);
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
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
  if (!isBrowser()) {
    return;
  }
  window.localStorage.removeItem(MOCK_SESSION_KEY);
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

function getStoredAccessToken(): string | null {
  if (!isBrowser()) {
    return null;
  }
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
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

function getRule(problemId: string): EvaluationRule {
  return (
    EVALUATION_RULES[problemId] ?? {
      requiredPatterns: [/def\s+\w+\s*\(/],
      guidance: "Define a function and return deterministic output.",
    }
  );
}

function readSubmissionHistoryStore(): SubmissionRecord[] {
  if (!isBrowser()) {
    return [];
  }

  const raw = window.localStorage.getItem(SUBMISSION_HISTORY_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as SubmissionRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    window.localStorage.removeItem(SUBMISSION_HISTORY_KEY);
    return [];
  }
}

function writeSubmissionHistoryStore(records: SubmissionRecord[]): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    SUBMISSION_HISTORY_KEY,
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

function makeSampleOrHiddenCases(
  mode: ExecutionMode,
  problem: ProblemDetail
): Array<{ input: string; output: string }> {
  if (mode === "run") {
    return problem.sampleTestCases.slice(0, 2);
  }

  return Array.from({ length: problem.hiddenTestCount }).map((_, index) => ({
    input: `hidden-${index + 1}`,
    output: "hidden-output",
  }));
}

function buildTestCaseResult(
  mode: ExecutionMode,
  index: number,
  test: { input: string; output: string },
  passed: boolean,
  guidance: string,
  runtimeTriggered: boolean
): SubmissionTestCaseResult {
  const visibility = mode === "run" ? "sample" : "hidden";

  if (runtimeTriggered) {
    return {
      name: visibility === "sample" ? `Sample ${index + 1}` : `Hidden ${index + 1}`,
      visibility,
      passed: false,
      errorMessage: "Execution terminated unexpectedly.",
      input: visibility === "sample" ? test.input : undefined,
      expectedOutput: visibility === "sample" ? test.output : undefined,
      actualOutput: visibility === "sample" ? "" : undefined,
    };
  }

  if (visibility === "sample") {
    return {
      name: `Sample ${index + 1}`,
      visibility,
      input: test.input,
      expectedOutput: test.output,
      actualOutput: passed ? test.output : "Incorrect output",
      passed,
      errorMessage: passed ? undefined : guidance,
    };
  }

  return {
    name: `Hidden ${index + 1}`,
    visibility,
    passed,
    errorMessage: passed ? undefined : guidance,
  };
}

function createSubmissionResult(
  problemId: string,
  code: string,
  mode: ExecutionMode,
  source: "mock" | "live" = "mock"
): SubmissionResult {
  const problem = getProblemByIdentifier(problemId);

  if (!problem) {
    return {
      submissionId: `sub_${Date.now()}`,
      problemId,
      mode,
      visibility: mode === "run" ? "sample" : "hidden",
      status: "Runtime Error",
      runtimeMs: 0,
      memoryMb: 0,
      score: 0,
      passedCount: 0,
      totalCount: 0,
      message: "Problem not found.",
      traceback: "LookupError: The requested problem could not be loaded.",
      testCases: [],
      source,
      submittedAt: new Date().toISOString(),
    };
  }

  const cleanedCode = code.trim();
  const rule = getRule(problem.id);
  const hasPlaceholder = /\bpass\b/.test(cleanedCode) || cleanedCode.length < 25;
  const runtimeTriggered =
    /1\s*\/\s*0/.test(cleanedCode) || /raise\s+[A-Za-z_]\w*Error/.test(cleanedCode);
  const matchedPatterns = rule.requiredPatterns.filter((pattern) =>
    pattern.test(cleanedCode)
  ).length;

  const isStrongSolution =
    !hasPlaceholder && matchedPatterns === rule.requiredPatterns.length;
  const isPartialSolution =
    !hasPlaceholder &&
    matchedPatterns >= Math.max(1, Math.ceil(rule.requiredPatterns.length * 0.5));

  const cases = makeSampleOrHiddenCases(mode, problem);

  const testCases = cases.map((testCase, index) => {
    let passed = false;

    if (runtimeTriggered) {
      passed = false;
    } else if (isStrongSolution) {
      passed = true;
    } else if (isPartialSolution && index === 0) {
      passed = true;
    }

    return buildTestCaseResult(
      mode,
      index,
      testCase,
      passed,
      rule.guidance,
      runtimeTriggered
    );
  });

  const passedCount = testCases.filter((testCase) => testCase.passed).length;
  const totalCount = testCases.length;
  const score = Math.round((passedCount / Math.max(1, totalCount)) * 100);
  const runtimeMs = runtimeTriggered ? 0 : 42 + Math.floor(Math.random() * 190);
  const memoryMb = runtimeTriggered ? 0 : 14 + Math.floor(Math.random() * 36);

  if (runtimeTriggered) {
    return {
      submissionId: `sub_${Date.now()}`,
      problemId: problem.id,
      mode,
      visibility: mode === "run" ? "sample" : "hidden",
      status: "Runtime Error",
      runtimeMs,
      memoryMb,
      score: 0,
      passedCount: 0,
      totalCount,
      message: "Runtime error while executing your solution.",
      traceback:
        "Traceback (most recent call last):\n  File \"main.py\", line 1, in <module>\nRuntimeError: simulated execution failure",
      testCases,
      source,
      submittedAt: new Date().toISOString(),
    };
  }

  if (passedCount === totalCount) {
    return {
      submissionId: `sub_${Date.now()}`,
      problemId: problem.id,
      mode,
      visibility: mode === "run" ? "sample" : "hidden",
      status: "Accepted",
      runtimeMs,
      memoryMb,
      score: 100,
      passedCount,
      totalCount,
      message:
        mode === "run"
          ? "All sample test cases passed."
          : "Accepted on hidden tests.",
      testCases,
      source,
      submittedAt: new Date().toISOString(),
    };
  }

  return {
    submissionId: `sub_${Date.now()}`,
    problemId: problem.id,
    mode,
    visibility: mode === "run" ? "sample" : "hidden",
    status: "Failed",
    runtimeMs,
    memoryMb,
    score,
    passedCount,
    totalCount,
    message: `Passed ${passedCount}/${totalCount} ${
      mode === "run" ? "sample" : "hidden"
    } tests. ${rule.guidance}`,
    testCases,
    source,
    submittedAt: new Date().toISOString(),
  };
}

function createSubmissionRecord(
  problemId: string,
  code: string,
  mode: ExecutionMode,
  result: SubmissionResult
): SubmissionRecord {
  const problem = getProblemByIdentifier(problemId);

  return {
    id: result.submissionId,
    problemId,
    problemSlug: problem?.slug || problemId,
    problemTitle: problem?.title || "Unknown Problem",
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

  // Attach the bearer token so live API calls are authenticated.
  const token = getStoredAccessToken();
  const authHeaders: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  let attempt = 0;
  let lastError: unknown;

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
          ...authHeaders,
          ...(init?.headers || {}),
        },
      });

      clearTimeout(timeoutId);

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

  const token = parsed.accessToken || parsed.token || `live_${Date.now()}`;
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
    accessToken: token,
    expiresAt:
      parsed.expiresAt || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

function toProblemFromLive(payload: unknown): Problem {
  const parsed = payload as Partial<Problem> & { _id?: string };
  return {
    id: parsed.id || parsed._id || `p-live-${Math.random().toString(36).slice(2, 8)}`,
    slug: parsed.slug,
    title: parsed.title || "Untitled Problem",
    difficulty: parsed.difficulty || "Medium",
    category: parsed.category || "General",
    acceptance: parsed.acceptance || parsed.acceptanceRate || 0,
    acceptanceRate: parsed.acceptanceRate || parsed.acceptance || 0,
    status: parsed.status || "unsolved",
    tags: parsed.tags || [],
    summary: parsed.summary,
    companies: parsed.companies,
    trackIds: parsed.trackIds,
  };
}

function toProblemDetailFromLive(slug: string, payload: unknown): ProblemDetail {
  const base = toProblemFromLive(payload);
  const parsed = payload as Partial<ProblemDetail>;

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
      parsed.editorial ||
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

  const totalCount = parsed.totalCount ?? testCases.length;
  const passedCount =
    parsed.passedCount ?? testCases.filter((testCase) => testCase.passed).length;

  return {
    submissionId: parsed.submissionId || `sub_live_${Date.now()}`,
    problemId,
    mode,
    visibility: parsed.visibility || (mode === "run" ? "sample" : "hidden"),
    status:
      parsed.status === "Accepted" ||
      parsed.status === "Failed" ||
      parsed.status === "Runtime Error"
        ? parsed.status
        : "Failed",
    runtimeMs: parsed.runtimeMs ?? 0,
    memoryMb: parsed.memoryMb ?? 0,
    score: parsed.score ?? Math.round((passedCount / Math.max(1, totalCount)) * 100),
    message: parsed.message || "Execution completed.",
    passedCount,
    totalCount,
    traceback: parsed.traceback,
    testCases,
    source: "live",
    submittedAt: parsed.submittedAt || new Date().toISOString(),
  };
}

function mockFetchProblems(): Problem[] {
  return clone(MOCK_PROBLEMS.map(normalizeToListItem));
}

function mockFetchProblemBySlug(slug: string): ProblemDetail {
  const problem = MOCK_PROBLEMS.find((item) => item.slug === slug);
  if (!problem) {
    throw new Error(`Problem with slug "${slug}" was not found.`);
  }
  return clone(problem);
}

async function liveFetchProblems(): Promise<Problem[]> {
  const data = await fetchWithRetry<unknown[]>("/problems", { method: "GET" });
  return data.map((entry) => toProblemFromLive(entry));
}

async function liveFetchProblemBySlug(slug: string): Promise<ProblemDetail> {
  const data = await fetchWithRetry<unknown>(`/problems/${slug}`, { method: "GET" });
  return toProblemDetailFromLive(slug, data);
}

async function mockExecute(problemId: string, code: string, mode: ExecutionMode) {
  await wait(mode === "submit" ? SUBMIT_DELAY_MS : 900);
  return createSubmissionResult(problemId, code, mode, "mock");
}

async function liveExecute(problemId: string, code: string, mode: ExecutionMode) {
  const endpoint = mode === "run" ? "/submissions/run" : "/submissions";
  const data = await fetchWithRetry<unknown>(endpoint, {
    method: "POST",
    body: JSON.stringify({
      problemId,
      code,
      language: "python",
      languageId: 71,
      mode,
    }),
  });

  return normalizeLiveSubmission(problemId, mode, data);
}

async function persistExecutionRecord(
  problemId: string,
  code: string,
  mode: ExecutionMode,
  result: SubmissionResult
): Promise<void> {
  const record = createSubmissionRecord(problemId, code, mode, result);

  // Only cache locally for mock results. In live mode the backend is the source
  // of truth for history and solved-state; caching live results here would
  // create a split-brain (e.g. localStorage-derived "solved" status diverging
  // from the server). `source` is "mock" both in mock mode and when a live
  // call falls back to mock, which is exactly when we want the local cache.
  if (result.source === "mock") {
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
  const data = await fetchWithRetry<CompanyTrack[]>("/tracks", { method: "GET" });
  return data;
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
  await wait(120);
  return clone(readStoredSession());
}

export async function logoutUser(): Promise<void> {
  await wait(90);
  clearStoredSession();
  void trackEvent({ name: "auth_logout" });
}

export async function fetchProblems(): Promise<Problem[]> {
  const mockExecutor = async () => {
    await wait(FETCH_DELAY_MS);
    return mockFetchProblems();
  };

  const liveExecutor = async () => {
    const data = await liveFetchProblems();
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

  return runWithBackendSwitch("fetch_problem_detail", liveExecutor, mockExecutor);
}

export async function runCode(
  problemId: string,
  code: string,
  _problemSlug?: string,
  _problemTitle?: string
): Promise<SubmissionResult> {
  void _problemSlug;
  void _problemTitle;

  const mockExecutor = async () => mockExecute(problemId, code, "run");
  const liveExecutor = async () => liveExecute(problemId, code, "run");

  const result = await runWithBackendSwitch("run_code", liveExecutor, mockExecutor);
  await persistExecutionRecord(problemId, code, "run", result);
  return result;
}

export async function submitSolution(
  problemId: string,
  code: string,
  _languageId = 71,
  _token?: string,
  _problemSlug?: string,
  _problemTitle?: string
): Promise<SubmissionResult> {
  void _languageId;
  void _token;
  void _problemSlug;
  void _problemTitle;

  const mockExecutor = async () => mockExecute(problemId, code, "submit");
  const liveExecutor = async () => liveExecute(problemId, code, "submit");

  const result = await runWithBackendSwitch("submit_code", liveExecutor, mockExecutor);
  await persistExecutionRecord(problemId, code, "submit", result);
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
  return runWithBackendSwitch(
    "fetch_user_profile",
    () => liveFetchUserProfile(),
    () => mockFetchUserProfile()
  );
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
  for (const problem of MOCK_PROBLEMS) {
    const bucket = byDifficulty[problem.difficulty];
    if (bucket) {
      bucket.total += 1;
      if (solved.has(problem.slug)) bucket.solved += 1;
    }
  }

  return {
    totalProblems: MOCK_PROBLEMS.length,
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
    tags: ["data-preprocessing"],
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
  window.localStorage.removeItem(SUBMISSION_HISTORY_KEY);
}
