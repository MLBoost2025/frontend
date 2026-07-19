"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, ListChecks } from "lucide-react";
import MainLayout from "../components/MainLayout";
import { COURSES, courseLessons, totalLessonCount, totalQuizCount } from "@/lib/learn";
import {
  lessonKey,
  readLearnProgress,
  serverSnapshotLearnProgress,
  subscribeLearnProgress,
} from "@/lib/learn/progress";

const LEVEL_BADGES: Record<string, string> = {
  Beginner: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Intermediate: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Advanced: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export default function LearnPage() {
  const progress = useSyncExternalStore(
    subscribeLearnProgress,
    readLearnProgress,
    serverSnapshotLearnProgress
  );

  const completedTotal = COURSES.reduce(
    (sum, course) =>
      sum +
      courseLessons(course).filter(
        (lesson) => progress[lessonKey(course.slug, lesson.slug)]?.completedAt
      ).length,
    0
  );

  return (
    <MainLayout title="Learn" subtitle="Concept lessons and quizzes, beginner to advanced">
      <section className="card relative overflow-hidden p-6 md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
              <GraduationCap className="h-3.5 w-3.5" /> Structured curriculum
            </span>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-3xl">
              From first principles to <span className="text-gradient-brand">deep learning.</span>
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Focused lessons that teach the why, quizzes that prove you got it, and hand-picked
              arena problems to make each concept stick. No videos — just clear thinking, at your pace.
            </p>
          </div>
          <div className="grid shrink-0 grid-cols-3 gap-3 md:gap-4">
            {[
              { icon: BookOpen, value: totalLessonCount(), label: "Lessons" },
              { icon: ListChecks, value: totalQuizCount(), label: "Quiz questions" },
              { icon: CheckCircle2, value: completedTotal, label: "Completed" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="rounded-2xl border border-zinc-200 px-4 py-3 text-center dark:border-white/10">
                <Icon className="mx-auto h-4 w-4 text-brand-500" />
                <p className="mt-1.5 font-display text-xl font-bold text-zinc-900 dark:text-white">{value}</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {COURSES.map((course, courseIndex) => {
          const lessons = courseLessons(course);
          const completed = lessons.filter(
            (lesson) => progress[lessonKey(course.slug, lesson.slug)]?.completedAt
          ).length;
          const percent = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;
          return (
            <Link
              key={course.slug}
              href={`/learn/${course.slug}`}
              className="card group flex flex-col p-5 transition-shadow hover:shadow-lg md:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm ${course.accent}`}
                >
                  <span className="font-display text-sm font-bold">{courseIndex + 1}</span>
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${LEVEL_BADGES[course.level]}`}>
                  {course.level}
                </span>
              </div>
              <h2 className="mt-4 font-display text-lg font-bold tracking-tight text-zinc-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-300">
                {course.title}
              </h2>
              <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                {course.tagline}
              </p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {course.description}
              </p>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {course.modules.length} modules · {lessons.length} lessons
                  </span>
                  <span className="font-semibold">
                    {completed}/{lessons.length}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r transition-all ${course.accent}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-300">
                {completed === 0 ? "Start course" : completed === lessons.length ? "Review course" : "Continue"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </MainLayout>
  );
}
