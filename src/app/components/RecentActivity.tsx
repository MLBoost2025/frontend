"use client";

import { RecentActivityItem } from "@/types";

interface RecentActivityProps {
  activities: RecentActivityItem[];
}

function difficultyClasses(difficulty: RecentActivityItem["difficulty"]): string {
  if (difficulty === "Easy") {
    return "text-emerald-600 dark:text-emerald-300";
  }
  if (difficulty === "Medium") {
    return "text-amber-600 dark:text-amber-300";
  }
  return "text-rose-600 dark:text-rose-300";
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white/90 p-5 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
          Recent Activity
        </h2>
        <button className="text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100">
          View all
        </button>
      </div>

      {activities.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No activity yet — solve a problem to get started.
        </p>
      ) : null}

      <div className="space-y-3">
        {activities.map((activity) => (
          <article
            key={activity.id}
            className="rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {activity.title}
                </p>
                <div className="mt-1 flex items-center gap-3 text-xs">
                  <span className={difficultyClasses(activity.difficulty)}>
                    {activity.difficulty}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {activity.status}
                  </span>
                </div>
              </div>
              <button className="text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100">
                Continue
              </button>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-1.5 rounded-full bg-orange-500"
                style={{ width: `${activity.progress}%` }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
