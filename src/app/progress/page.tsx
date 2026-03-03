"use client";

import MainLayout from "../components/MainLayout";

const DAILY = [
  { day: "Mon", value: 3 },
  { day: "Tue", value: 1 },
  { day: "Wed", value: 4 },
  { day: "Thu", value: 2 },
  { day: "Fri", value: 5 },
  { day: "Sat", value: 2 },
  { day: "Sun", value: 4 },
];

const AREAS = [
  { label: "Supervised Learning", solved: 24, total: 40 },
  { label: "Data Preprocessing", solved: 11, total: 22 },
  { label: "Model Evaluation", solved: 9, total: 18 },
  { label: "Feature Engineering", solved: 5, total: 16 },
];

export default function ProgressPage() {
  return (
    <MainLayout title="Progress" subtitle="Track consistency, strengths, and weak spots">
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <article className="xl:col-span-2 rounded-xl border border-zinc-200 bg-white/90 p-5 dark:border-zinc-800 dark:bg-zinc-900/80">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Problems Solved This Week
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {DAILY.map((item) => (
              <div key={item.day} className="rounded-md border border-zinc-200 px-2 py-3 text-center dark:border-zinc-800">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{item.day}</p>
                <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{item.value}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-zinc-200 bg-white/90 p-5 dark:border-zinc-800 dark:bg-zinc-900/80">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Streak Summary
          </h3>
          <p className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">12 days</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Best streak: 23 days
          </p>
        </article>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white/90 p-5 dark:border-zinc-800 dark:bg-zinc-900/80">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
          Topic Coverage
        </h3>
        <div className="space-y-4">
          {AREAS.map((area) => {
            const percent = Math.round((area.solved / area.total) * 100);
            return (
              <article key={area.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{area.label}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">{area.solved}/{area.total}</span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-1.5 rounded-full bg-orange-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </MainLayout>
  );
}
