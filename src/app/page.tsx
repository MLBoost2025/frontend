"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CircleCheckBig, Flame, ListChecks, Loader2, Target } from "lucide-react";
import MainLayout from "./components/MainLayout";
import Landing from "./components/Landing";
import StatsCard from "./components/StatsCard";
import RecentActivity from "./components/RecentActivity";
import WeeklyGoals from "./components/WeeklyGoals";
import { fetchRecentActivity, fetchUserStats } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { RecentActivityItem, UserStats } from "@/types";

function acceptanceRate(stats: UserStats): string {
  if (stats.totalSubmissions === 0) return "—";
  return `${Math.round((stats.acceptedSubmissions / stats.totalSubmissions) * 100)}%`;
}

// The root route is public: logged-out visitors see the marketing landing,
// authenticated users get their dashboard.
export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div role="status" aria-label="Loading your session" className="flex min-h-screen items-center justify-center text-zinc-400">
        <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
      </div>
    );
  }

  return isAuthenticated ? <DashboardHome /> : <Landing />;
}

function DashboardHome() {
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
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0c0e13] px-7 py-8 text-white">
        {/* ambient glow + grid inside the hero */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(600px 300px at 88% -20%, rgba(244,102,31,0.35), transparent 60%), radial-gradient(500px 260px at 10% 130%, rgba(14,165,233,0.22), transparent 60%)",
          }}
        />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-brand-300">
            <Flame className="h-3.5 w-3.5" /> Daily Focus
          </span>
          <h2 className="mt-4 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
            Sharpen your ML edge. Solve, submit, and climb the ranks.
          </h2>
          <p className="mt-2 max-w-xl text-sm text-zinc-400">
            Interview-grade problems with instant judging, contests, and clean
            progress tracking — LeetCode rigor meets Kaggle depth.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/problems" className="btn-primary">
              Start solving <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/competitions"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/5"
            >
              Browse contests
            </Link>
          </div>
        </div>
      </section>

      {error ? (
        <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Problems Solved" value={isLoading || !stats ? "—" : stats.solved} icon={CircleCheckBig} accent="emerald" />
        <StatsCard title="Attempted" value={isLoading || !stats ? "—" : stats.attempted} icon={Target} accent="brand" />
        <StatsCard title="Submissions" value={isLoading || !stats ? "—" : stats.totalSubmissions} icon={ListChecks} accent="accent" />
        <StatsCard title="Acceptance" value={isLoading || !stats ? "—" : acceptanceRate(stats)} icon={Flame} accent="violet" />
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
