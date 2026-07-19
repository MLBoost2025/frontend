export type Difficulty = "Easy" | "Medium" | "Hard";

export type ProblemStatus = "solved" | "attempted" | "unsolved";

export type SubmissionVerdict = "Accepted" | "Failed" | "Runtime Error";

export type ExecutionMode = "run" | "submit";

export type TestCaseVisibility = "sample" | "hidden";

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  id: string;
  slug?: string;
  title: string;
  difficulty: Difficulty;
  category: string;
  acceptance: number;
  acceptanceRate: number;
  status: ProblemStatus;
  tags: string[];
  summary?: string;
  description?: string;
  constraints?: string[];
  examples?: ProblemExample[];
  hints?: string[];
  starterCode?: string;
  companies?: string[];
  trackIds?: string[];
  accessTier?: "free" | "plus";
  locked?: boolean;
}

export interface ProblemEditorial {
  summary: string;
  approach: string;
  timeComplexity: string;
  spaceComplexity: string;
  pitfalls: string[];
}

export interface ProblemDetail extends Problem {
  slug: string;
  description: string;
  constraints: string[];
  examples: ProblemExample[];
  hints: string[];
  starterCode: string;
  sampleTestCases: ProblemExample[];
  hiddenTestCount: number;
  editorial: ProblemEditorial;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  roles?: string[];
}

export interface NewProblemInput {
  title: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  starterCode?: string;
  constraints?: string[];
}

export interface NewContestInput {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
}

export interface NewLearningTrackInput {
  title: string;
  description?: string;
  tags: string[];
  lessons: string[];
  order?: number;
}

export interface AuthSession {
  user: User;
  /** Present only for the isolated mock adapter; live auth uses httpOnly cookies. */
  accessToken?: string;
  expiresAt: string;
}

export type BillingTier = "free" | "plus" | "lumus";
export type BillingCadence = "weekly" | "monthly" | "yearly" | "lifetime";

export interface BillingOffer {
  offerKey: string;
  name: string;
  tier: Exclude<BillingTier, "free">;
  cadence: BillingCadence;
  currency: "INR";
  amountMinor: number;
  benefits: string[];
  popular: boolean;
}

export interface BillingConfiguration {
  billingEnabled: boolean;
  checkoutEnabled: boolean;
  enforcementEnabled: boolean;
  provider: "cashfree" | "disabled";
  environment: "sandbox" | "production";
}

export interface BillingEntitlement {
  tier: BillingTier;
  benefits: string[];
  startsAt: string | null;
  endsAt: string | null;
}

export interface BillingSummary {
  entitlement: BillingEntitlement;
  subscription: {
    id: string;
    offerKey: string;
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  purchase: {
    id: string;
    offerKey: string;
    status: string;
    capturedAt: string;
  } | null;
  configuration: BillingConfiguration;
}

export interface BillingOffersResponse {
  offers: BillingOffer[];
  configuration: BillingConfiguration;
  freeProblemCount: number;
}

export type BillingCheckout =
  | {
      kind: "subscription";
      subscriptionSessionId: string;
      providerResourceId: string;
      environment: "sandbox" | "production";
    }
  | {
      kind: "payment";
      paymentSessionId: string;
      providerResourceId: string;
      environment: "sandbox" | "production";
    };

export interface BillingReceipt {
  id: string;
  documentKind: "payment_receipt";
  label: string;
  offerKey: string;
  offerName: string;
  cadence: BillingCadence | null;
  amountMinor: number;
  currency: "INR";
  status: "captured" | "refunded";
  occurredAt: string;
  refundedMinor: number;
  refundedAt: string | null;
  providerPaymentReference: string;
  taxStatus: "pending_legal_review" | "not_applicable" | "final";
  isTaxInvoice: false;
}

export interface BillingReceiptsResponse {
  receipts: BillingReceipt[];
  notice: string;
}

export interface BillingOperationalAlert {
  _id: string;
  kind: string;
  severity: "info" | "warning" | "critical";
  status: "open" | "resolved";
  resourceType: string;
  resourceId: string;
  summary: string;
  details: Record<string, unknown>;
  firstDetectedAt: string;
  lastDetectedAt: string;
  resolvedAt: string | null;
}

export interface BillingAdminOverview {
  counts: {
    customers: number;
    activeSubscriptions: number;
    capturedPurchases: number;
    openAlerts: number;
    failedWebhooks: number;
  };
  revenue: Array<{ _id: string; amountMinor: number; count: number }>;
  latestReconciliation: {
    _id: string;
    status: string;
    startedAt: string;
    finishedAt: string | null;
    checked: number;
    drifted: number;
    providerErrors: number;
  } | null;
  configuration: BillingConfiguration & {
    webhookProcessingEnabled: boolean;
    reconciliationEnabled: boolean;
  };
}

export interface BillingAdminCustomer {
  id: string;
  userId: string;
  billingName: string;
  billingEmail: string;
  phoneLastFour: string;
  subscription: { offerKey: string; status: string; currentPeriodEnd?: string } | null;
  purchase: { offerKey: string; status: string; capturedAt?: string } | null;
  updatedAt: string;
}

export interface BillingWebhookEvent {
  _id: string;
  eventType: string;
  occurredAt: string;
  status: string;
  resourceId: string;
  errorCode: string;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload extends LoginPayload {
  name: string;
}

export interface UpdateProfileInput {
  name: string;
  avatarUrl?: string;
}

export interface SubmissionTestCaseResult {
  name: string;
  visibility: TestCaseVisibility;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  passed: boolean;
  errorMessage?: string;
}

export interface SubmissionResult {
  submissionId: string;
  problemId: string;
  status: SubmissionVerdict;
  runtimeMs: number;
  memoryMb: number;
  score: number;
  message: string;
  mode: ExecutionMode;
  visibility: TestCaseVisibility;
  passedCount: number;
  totalCount: number;
  traceback?: string;
  testCases: SubmissionTestCaseResult[];
  source: "mock" | "live" | "browser";
  submittedAt: string;
}

export interface CodeExecutionPayload {
  problemId: string;
  code: string;
  language: "python";
}

export interface SubmissionRecord {
  id: string;
  problemId: string;
  problemSlug: string;
  problemTitle: string;
  code: string;
  mode: ExecutionMode;
  result: SubmissionResult;
  createdAt: string;
}

export interface CompanyTrack {
  id: string;
  title: string;
  company: string;
  description: string;
  totalProblems: number;
  solvedProblems: number;
  tags: string[];
}

export interface HeatmapCell {
  date: string;
  count: number;
}

export interface AcceptanceTrendPoint {
  label: string;
  acceptance: number;
}

export interface TopicProgressPoint {
  topic: string;
  solved: number;
  total: number;
}

export interface ContestRank {
  contest: string;
  rank: number;
  participants: number;
  score: number;
  date: string;
}

export interface UserProfile {
  user: User;
  totalSolved: number;
  acceptanceRate: number;
  streakDays: number;
  heatmap: HeatmapCell[];
  acceptanceTrend: AcceptanceTrendPoint[];
  topicProgress: TopicProgressPoint[];
  recentContestRanks: ContestRank[];
}

export interface FilterState {
  level: string;
  category: string;
  statusFilter: "all" | "todo" | "solved";
}

export interface WeeklyProgressPoint {
  date: string;
  label: string;
  solved: number;
}

export interface TopicCoverage {
  tag: string;
  solved: number;
  total: number;
}

export interface UserProgress {
  weekly: WeeklyProgressPoint[];
  currentStreak: number;
  longestStreak: number;
  topics: TopicCoverage[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  solved: number;
}

export interface LearningTrack {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  lessons: string[];
  lessonCount: number;
  order?: number;
}

export type CompetitionStatus = "upcoming" | "live" | "ended";

export interface Competition {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  participantCount: number;
  problemCount: number;
  status: CompetitionStatus;
}

export interface ContestProblem {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
}

export interface CompetitionDetail extends Competition {
  problems: ContestProblem[];
  isRegistered?: boolean;
}

export interface ContestLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  problemsSolved: number;
  lastSubmissionTime?: string;
}

export interface RecentActivityItem {
  id: string;
  title: string;
  difficulty: Difficulty;
  status: "Completed" | "In Progress";
  progress: number;
}

export interface DifficultyStat {
  solved: number;
  total: number;
}

export interface UserStats {
  totalProblems: number;
  solved: number;
  attempted: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  byDifficulty: {
    Easy: DifficultyStat;
    Medium: DifficultyStat;
    Hard: DifficultyStat;
  };
}
