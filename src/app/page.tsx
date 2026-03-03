"use client";

import MainLayout from "./components/MainLayout";
import StatsCard from "./components/StatsCard";
import RecentActivity from "./components/RecentActivity";
import WeeklyGoals from "./components/WeeklyGoals";

const STATS = {
  problemsSolved: 47,
  currentStreak: 12,
  ranking: "#1,247",
  achievements: 8,
};

const RECENT_ACTIVITIES = [
  {
    id: "1",
    title: "Image Classification with CNN",
    difficulty: "Medium" as const,
    status: "Completed" as const,
    progress: 100,
  },
  {
    id: "2",
    title: "Sentiment Analysis Model",
    difficulty: "Easy" as const,
    status: "In Progress" as const,
    progress: 60,
  },
  {
    id: "3",
    title: "Time Series Forecasting",
    difficulty: "Hard" as const,
    status: "In Progress" as const,
    progress: 30,
  },
];

const WEEKLY_GOALS = [
  { title: "Problems Solved", current: 7, target: 10 },
  { title: "Learning Hours", current: 8, target: 12 },
  { title: "Code Reviews", current: 3, target: 5 },
];

export default function Home() {
  return (
    <MainLayout
      title="Dashboard"
      subtitle="Your daily machine learning practice command center"
    >
      <section className="rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 px-6 py-6 text-zinc-100">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
          Daily Focus
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Keep the streak alive and solve 2 ML problems today
        </h2>
        <p className="mt-2 text-sm text-zinc-300">
          Interview-style challenges, instant feedback, and clean progress
          tracking.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Problems Solved" value={STATS.problemsSolved} />
        <StatsCard title="Current Streak" value={`${STATS.currentStreak} days`} />
        <StatsCard title="Ranking" value={STATS.ranking} />
        <StatsCard title="Achievements" value={STATS.achievements} />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className="xl:col-span-3">
          <RecentActivity activities={RECENT_ACTIVITIES} />
        </div>
        <div className="xl:col-span-1">
          <WeeklyGoals goals={WEEKLY_GOALS} />
        </div>
      </section>
    </MainLayout>
  );
}
