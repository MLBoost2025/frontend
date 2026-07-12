"use client";

import { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import { fetchUserProgress } from "@/lib/api";
import { UserProgress } from "@/types";

export default function ProgressPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchUserProgress();
        if (active) setProgress(data);
      } catch {
        if (active) setError("Could not load your progress.");
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const weekly = progress?.weekly ?? [];
  const topics = progress?.topics ?? [];

  return (
    <MainLayout title="Progress" subtitle="Track consistency, strengths, and weak spots">
      {error ? (
        <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      ) : null}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <article className="xl:col-span-2 card p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Problems Solved This Week
          </h3>
          {isLoading ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {weekly.map((item) => (
                <div
                  key={item.date}
                  className="rounded-xl bg-zinc-50/70 px-2 py-3 text-center dark:bg-white/[0.025]"
                >
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{item.label}</p>
                  <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {item.solved}
                  </p>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="card p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Streak Summary
          </h3>
          <p className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
            {isLoading || !progress ? "—" : `${progress.currentStreak} days`}
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Best streak: {isLoading || !progress ? "—" : `${progress.longestStreak} days`}
          </p>
        </article>
      </section>

      <section className="card p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
          Topic Coverage
        </h3>
        {isLoading ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
        ) : topics.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Solve some problems to see your topic coverage.
          </p>
        ) : (
          <div className="space-y-4">
            {topics.map((topic) => {
              const percent = topic.total > 0 ? Math.round((topic.solved / topic.total) * 100) : 0;
              return (
                <article key={topic.tag}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium capitalize text-zinc-800 dark:text-zinc-200">
                      {topic.tag}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {topic.solved}/{topic.total}
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`${topic.tag} progress`}
                    aria-valuemin={0}
                    aria-valuemax={topic.total}
                    aria-valuenow={topic.solved}
                    className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800"
                  >
                    <div
                      className="h-1.5 rounded-full bg-orange-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </MainLayout>
  );
}
