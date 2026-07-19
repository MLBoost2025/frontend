// Per-account Learn progress, stored locally with the same opaque-uid key
// scoping as the practice submission history (see lib/api.ts).

const LEARN_PROGRESS_KEY = "katalume.learn.progress";
const ACTIVE_USER_KEY = "katalume.active.user";

export interface LessonProgress {
  completedAt?: string;
  /** Best quiz score as correct-answer count. */
  quizBest?: number;
  quizTotal?: number;
}

export type LearnProgress = Record<string, LessonProgress>;

function progressKey(): string {
  if (typeof window === "undefined") return `${LEARN_PROGRESS_KEY}.anon`;
  const uid = window.localStorage.getItem(ACTIVE_USER_KEY) || "anon";
  return `${LEARN_PROGRESS_KEY}.${uid}`;
}

export function lessonKey(courseSlug: string, lessonSlug: string): string {
  return `${courseSlug}/${lessonSlug}`;
}

const EMPTY_PROGRESS: LearnProgress = {};

// Cached snapshot so useSyncExternalStore sees a stable object identity until
// the underlying storage value actually changes.
let snapshotRaw: string | null | undefined;
let snapshotValue: LearnProgress = EMPTY_PROGRESS;
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

export function subscribeLearnProgress(listener: () => void): () => void {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", listener);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", listener);
    }
  };
}

export function readLearnProgress(): LearnProgress {
  if (typeof window === "undefined") return EMPTY_PROGRESS;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(progressKey());
  } catch {
    return EMPTY_PROGRESS;
  }
  if (raw !== snapshotRaw) {
    snapshotRaw = raw;
    try {
      const parsed = raw ? (JSON.parse(raw) as LearnProgress) : EMPTY_PROGRESS;
      snapshotValue = parsed && typeof parsed === "object" ? parsed : EMPTY_PROGRESS;
    } catch {
      snapshotValue = EMPTY_PROGRESS;
    }
  }
  return snapshotValue;
}

export function serverSnapshotLearnProgress(): LearnProgress {
  return EMPTY_PROGRESS;
}

function writeLearnProgress(progress: LearnProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(progressKey(), JSON.stringify(progress));
  } catch {
    // Storage may be full or unavailable; progress is a convenience, not data.
  }
  notify();
}

export function markLessonComplete(courseSlug: string, lessonSlug: string): LearnProgress {
  const current = readLearnProgress();
  const key = lessonKey(courseSlug, lessonSlug);
  const progress: LearnProgress = {
    ...current,
    [key]: { ...current[key], completedAt: new Date().toISOString() },
  };
  writeLearnProgress(progress);
  return progress;
}

export function recordQuizResult(
  courseSlug: string,
  lessonSlug: string,
  correct: number,
  total: number
): LearnProgress {
  const current = readLearnProgress();
  const key = lessonKey(courseSlug, lessonSlug);
  const previous = current[key] || {};
  const updated: LessonProgress = {
    ...previous,
    quizBest: Math.max(previous.quizBest ?? 0, correct),
    quizTotal: total,
  };
  // A passed quiz (all answers correct) also completes the lesson.
  if (correct === total && !updated.completedAt) {
    updated.completedAt = new Date().toISOString();
  }
  const progress: LearnProgress = { ...current, [key]: updated };
  writeLearnProgress(progress);
  return progress;
}
