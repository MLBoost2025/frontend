"use client";

import MainLayout from "../components/MainLayout";

const TRACKS = [
  {
    id: "t1",
    title: "ML Foundations",
    description: "Linear models, overfitting, feature scaling, and evaluation.",
    lessons: 18,
    progress: 72,
  },
  {
    id: "t2",
    title: "Pandas for Interviews",
    description: "Joins, groupby, window operations, and common data transforms.",
    lessons: 14,
    progress: 38,
  },
  {
    id: "t3",
    title: "Model Selection",
    description: "Cross-validation, hyperparameter tuning, and proper split strategy.",
    lessons: 11,
    progress: 12,
  },
];

const MODULES = [
  "Bias-Variance Tradeoff",
  "Confusion Matrix and F1",
  "Regularization in Practice",
  "Feature Drift Detection",
];

export default function LearnPage() {
  return (
    <MainLayout
      title="Learn"
      subtitle="Curated paths that map directly to coding practice"
    >
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.8fr_1fr]">
        <div className="rounded-xl border border-zinc-200 bg-white/90 p-5 dark:border-zinc-800 dark:bg-zinc-900/80">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Learning Tracks
          </h3>
          <div className="space-y-3">
            {TRACKS.map((track) => (
              <article
                key={track.id}
                className="rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{track.title}</p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{track.description}</p>
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{track.lessons} lessons</span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-1.5 rounded-full bg-orange-500"
                    style={{ width: `${track.progress}%` }}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-xl border border-zinc-200 bg-white/90 p-5 dark:border-zinc-800 dark:bg-zinc-900/80">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Suggested Next
          </h3>
          <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            {MODULES.map((module) => (
              <li key={module} className="rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800">
                {module}
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </MainLayout>
  );
}
