"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, Clock3, Trophy } from "lucide-react";
import MainLayout from "../../components/MainLayout";
import { courseLessons, getCourse } from "@/lib/learn";
import {
  lessonKey,
  readLearnProgress,
  serverSnapshotLearnProgress,
  subscribeLearnProgress,
} from "@/lib/learn/progress";

export default function CoursePage() {
  const params = useParams<{ course: string }>();
  const course = getCourse(params.course);
  const progress = useSyncExternalStore(
    subscribeLearnProgress,
    readLearnProgress,
    serverSnapshotLearnProgress
  );

  if (!course) notFound();

  const lessons = courseLessons(course);
  const completed = lessons.filter(
    (lesson) => progress[lessonKey(course.slug, lesson.slug)]?.completedAt
  ).length;
  const percent = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;
  const nextLesson = lessons.find(
    (lesson) => !progress[lessonKey(course.slug, lesson.slug)]?.completedAt
  );

  return (
    <MainLayout title={course.title} subtitle={course.tagline}>
      <Link
        href="/learn"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-brand-600 dark:text-zinc-400 dark:hover:text-brand-300"
      >
        <ArrowLeft className="h-4 w-4" /> All courses
      </Link>

      <section className="card relative overflow-hidden p-6 md:p-7">
        <div
          className={`pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br opacity-15 blur-3xl ${course.accent}`}
        />
        <div className="relative">
          <span className="inline-flex rounded-full bg-brand-500/10 px-2.5 py-1 text-[11px] font-semibold text-brand-600 dark:text-brand-300">
            {course.level}
          </span>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {course.description}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <div className="min-w-[200px] flex-1">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>
                  {completed} of {lessons.length} lessons complete
                </span>
                <span className="font-semibold">{percent}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
                <div
                  className={`h-full rounded-full bg-gradient-to-r transition-all ${course.accent}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
            {nextLesson && (
              <Link
                href={`/learn/${course.slug}/${nextLesson.slug}`}
                className="btn-primary px-5 py-2.5 text-sm"
              >
                {completed === 0 ? "Start course" : "Continue"}
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="space-y-5">
        {course.modules.map((module, moduleIndex) => (
          <section key={module.slug} className="card p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-600 dark:text-brand-300">
              Module {moduleIndex + 1}
            </p>
            <h2 className="mt-1 font-display text-lg font-bold text-zinc-900 dark:text-white">
              {module.title}
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{module.description}</p>
            <ol className="mt-4 divide-y divide-zinc-100 dark:divide-white/[0.06]">
              {module.lessons.map((lesson) => {
                const state = progress[lessonKey(course.slug, lesson.slug)];
                const done = Boolean(state?.completedAt);
                return (
                  <li key={lesson.slug}>
                    <Link
                      href={`/learn/${course.slug}/${lesson.slug}`}
                      className="group flex items-center gap-3.5 py-3.5"
                    >
                      {done ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5 shrink-0 text-zinc-300 dark:text-zinc-600" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-medium text-zinc-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-300">
                          {lesson.title}
                        </p>
                        <p className="mt-0.5 flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-3 w-3" /> {lesson.minutes} min
                          </span>
                          <span>{lesson.quiz.length}-question quiz</span>
                          {typeof state?.quizBest === "number" && (
                            <span className="inline-flex items-center gap-1 font-medium text-brand-600 dark:text-brand-300">
                              <Trophy className="h-3 w-3" /> {state.quizBest}/{state.quizTotal}
                            </span>
                          )}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </MainLayout>
  );
}
