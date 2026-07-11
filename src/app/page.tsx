"use client";

import { useEffect, useState } from "react";
import MainLayout from "./components/MainLayout";
import StatsCard from "./components/StatsCard";
import RecentActivity from "./components/RecentActivity";
import WeeklyGoals from "./components/WeeklyGoals";
import { fetchRecentActivity, fetchUserStats } from "@/lib/api";
import { RecentActivityItem, UserStats } from "@/types";

function acceptanceRate(stats: UserStats): string {
  if (stats.totalSubmissions === 0) return "—";
  return `${Math.round((stats.acceptedSubmissions / stats.totalSubmissions) * 100)}%`;
}

export default function Home() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [statsData, activityData] = await Promise.all([
          fetchUserStats(),
          fetchRecentActivity(5),
        ]);
        if (active) {
          setStats(statsData);
          setActivities(activityData);
        }
      } catch {
        if (active) setError("Could not load your dashboard.");
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const difficultyGoals = stats
    ? (["Easy", "Medium", "Hard"] as const).map((level) => ({
        title: level,
        current: stats.byDifficulty[level].solved,
        target: stats.byDifficulty[level].total,
      }))
    : [];

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

      {error ? (
        <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Problems Solved" value={isLoading || !stats ? "—" : stats.solved} />
        <StatsCard title="Attempted" value={isLoading || !stats ? "—" : stats.attempted} />
        <StatsCard
          title="Submissions"
          value={isLoading || !stats ? "—" : stats.totalSubmissions}
        />
        <StatsCard
          title="Acceptance"
          value={isLoading || !stats ? "—" : acceptanceRate(stats)}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className="xl:col-span-3">
          <RecentActivity activities={activities} />
        </div>
        <div className="xl:col-span-1">
          <WeeklyGoals title="Difficulty Progress" goals={difficultyGoals} />
        </div>
      </section>
    </MainLayout>
  );
}
