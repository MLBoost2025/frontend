"use client";

import MainLayout from "../components/MainLayout";

const UPCOMING = [
  {
    id: "c1",
    title: "Regression Sprint #12",
    startsIn: "2h 15m",
    participants: 1240,
    duration: "90 min",
    difficulty: "Medium",
  },
  {
    id: "c2",
    title: "Feature Engineering Arena",
    startsIn: "Tomorrow",
    participants: 980,
    duration: "120 min",
    difficulty: "Hard",
  },
  {
    id: "c3",
    title: "Pandas Speed Round",
    startsIn: "3 days",
    participants: 2100,
    duration: "60 min",
    difficulty: "Easy",
  },
];

const LEADERBOARD = [
  { rank: 1, name: "Aarav", score: 1980 },
  { rank: 2, name: "Emily", score: 1945 },
  { rank: 3, name: "Noah", score: 1910 },
  { rank: 4, name: "Saanvi", score: 1890 },
];

export default function CompetitionsPage() {
  return (
    <MainLayout
      title="Competitions"
      subtitle="Timed contests designed for ML interview readiness"
    >
      <section className="rounded-2xl bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 px-6 py-6 text-white">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-100">Weekly Event</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Model Metrics Championship</h2>
        <p className="mt-2 text-sm text-orange-50">
          Solve 5 evaluation-heavy challenges under 75 minutes.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-xl border border-zinc-200 bg-white/90 p-5 dark:border-zinc-800 dark:bg-zinc-900/80">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Upcoming Contests
          </h3>
          <div className="space-y-3">
            {UPCOMING.map((contest) => (
              <article
                key={contest.id}
                className="grid gap-3 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800 md:grid-cols-[1fr_auto_auto_auto]"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{contest.title}</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Starts in {contest.startsIn}
                  </p>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300">{contest.participants} participants</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-300">{contest.duration}</p>
                <p className="text-xs font-medium text-orange-600 dark:text-orange-300">{contest.difficulty}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white/90 p-5 dark:border-zinc-800 dark:bg-zinc-900/80">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Leaderboard Snapshot
          </h3>
          <div className="space-y-2">
            {LEADERBOARD.map((entry) => (
              <div
                key={entry.rank}
                className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
              >
                <span className="font-medium text-zinc-800 dark:text-zinc-100">#{entry.rank} {entry.name}</span>
                <span className="text-zinc-500 dark:text-zinc-400">{entry.score}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
