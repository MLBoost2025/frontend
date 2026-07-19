"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  Target,
} from "lucide-react";
import MainLayout from "../../../components/MainLayout";
import LessonBlocks from "../../../components/learn/LessonBlocks";
import LessonQuiz from "../../../components/learn/LessonQuiz";
import { getLesson } from "@/lib/learn";
import {
  lessonKey,
  markLessonComplete,
  readLearnProgress,
  recordQuizResult,
  serverSnapshotLearnProgress,
  subscribeLearnProgress,
} from "@/lib/learn/progress";

const DIFFICULTY_BADGES: Record<string, string> = {
  Easy: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Hard: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export default function LessonPage() {
  const params = useParams<{ course: string; lesson: string }>();
  const ref = getLesson(params.course, params.lesson);
  const progress = useSyncExternalStore(
    subscribeLearnProgress,
    readLearnProgress,
    serverSnapshotLearnProgress
  );

  const handleQuizComplete = useCallback(
    (correct: number, total: number) => {
      recordQuizResult(params.course, params.lesson, correct, total);
    },
    [params.course, params.lesson]
  );

  if (!ref) notFound();

  const { course, module, lesson, previous, next } = ref;
  const state = progress[lessonKey(course.slug, lesson.slug)];
  const done = Boolean(state?.completedAt);

  return (
    <MainLayout title={lesson.title} subtitle={course.title}>
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/learn" className="hover:text-brand-600 dark:hover:text-brand-300">
          Learn
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/learn/${course.slug}`} className="hover:text-brand-600 dark:hover:text-brand-300">
          {course.title}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-800 dark:text-zinc-200">{lesson.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-6">
          <article className="card p-5 md:p-7">
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="rounded-full bg-brand-500/10 px-2.5 py-1 font-semibold text-brand-600 dark:text-brand-300">
                {module.title}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5" /> {lesson.minutes} min
              </span>
              {done && (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                </span>
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                <Target className="h-4 w-4 text-brand-500" /> You will learn to
              </p>
              <ul className="mt-2 space-y-1.5 pl-1 text-sm text-zinc-700 dark:text-zinc-300">
                {lesson.objectives.map((objective) => (
                  <li key={objective} className="flex gap-2">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                    {objective}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <LessonBlocks blocks={lesson.blocks} />
            </div>
          </article>

          <LessonQuiz
            questions={lesson.quiz}
            best={state?.quizBest}
            onComplete={handleQuizComplete}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            {previous ? (
              <Link
                href={`/learn/${course.slug}/${previous.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:border-brand-400/60 dark:border-white/10 dark:text-zinc-300"
              >
                <ArrowLeft className="h-4 w-4" /> {previous.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/learn/${course.slug}/${next.slug}`} className="btn-primary px-4 py-2 text-sm">
                {next.title} <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link href={`/learn/${course.slug}`} className="btn-primary px-4 py-2 text-sm">
                Finish course <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          {lesson.practice.length > 0 && (
            <section className="card p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
                <Code2 className="h-4 w-4 text-brand-500" /> Practice in the arena
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                Implement what you just learned — these problems match this lesson.
              </p>
              <ul className="mt-3 space-y-2">
                {lesson.practice.map((problem) => (
                  <li key={problem.slug}>
                    <Link
                      href={`/problems/${problem.slug}`}
                      className="group flex items-center justify-between gap-2 rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm hover:border-brand-400/60 dark:border-white/10"
                    >
                      <span className="min-w-0 truncate font-medium text-zinc-800 group-hover:text-brand-600 dark:text-zinc-200 dark:group-hover:text-brand-300">
                        {problem.title}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${DIFFICULTY_BADGES[problem.difficulty]}`}
                      >
                        {problem.difficulty}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!done && (
            <section className="card p-5">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Done reading?</h2>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                Ace the quiz to complete this lesson automatically, or mark it done yourself.
              </p>
              <button
                type="button"
                onClick={() => markLessonComplete(course.slug, lesson.slug)}
                className="mt-3 w-full rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:border-brand-400/60 dark:border-white/10 dark:text-zinc-300"
              >
                Mark lesson complete
              </button>
            </section>
          )}
        </aside>
      </div>
    </MainLayout>
  );
}
