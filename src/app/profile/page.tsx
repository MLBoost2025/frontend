"use client";

import { useEffect, useMemo, useState } from "react";
import MainLayout from "../components/MainLayout";
import { fetchUserProfile } from "@/lib/api";
import { UserProfile } from "@/types";

function heatLevelClass(count: number): string {
  if (count >= 5) {
    return "bg-emerald-500";
  }
  if (count >= 3) {
    return "bg-emerald-400";
  }
  if (count >= 1) {
    return "bg-emerald-300";
  }
  return "bg-zinc-200 dark:bg-zinc-800";
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await fetchUserProfile();
        setProfile(data);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const heatmapWeeks = useMemo(() => {
    if (!profile) {
      return [] as UserProfile["heatmap"][];
    }

    const cells = [...profile.heatmap];
    const weeks: UserProfile["heatmap"][] = [];

    while (cells.length > 0) {
      weeks.push(cells.splice(0, 7));
    }

    return weeks.slice(-18);
  }, [profile]);

  return (
    <MainLayout
      title="Profile"
      subtitle="Your streaks, acceptance trend, topic strengths, and contest ranks"
    >
      {isLoading || !profile ? (
        <div className="rounded-xl border border-zinc-200 bg-white/90 p-10 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300">
          Loading profile...
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <article className="rounded-xl border border-zinc-200 bg-white/90 p-4 dark:border-zinc-800 dark:bg-zinc-900/80">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">Solved</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{profile.totalSolved}</p>
            </article>
            <article className="rounded-xl border border-zinc-200 bg-white/90 p-4 dark:border-zinc-800 dark:bg-zinc-900/80">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">Acceptance</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{profile.acceptanceRate}%</p>
            </article>
            <article className="rounded-xl border border-zinc-200 bg-white/90 p-4 dark:border-zinc-800 dark:bg-zinc-900/80">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">Current Streak</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{profile.streakDays} days</p>
            </article>
            <article className="rounded-xl border border-zinc-200 bg-white/90 p-4 dark:border-zinc-800 dark:bg-zinc-900/80">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">Recent Contest Rank</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">#{profile.recentContestRanks[0]?.rank ?? "-"}</p>
            </article>
          </section>

          <section className="card p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
              Submission Heatmap
            </h2>
            <div className="overflow-x-auto">
              <div className="flex gap-1">
                {heatmapWeeks.map((week, index) => (
                  <div key={index} className="flex flex-col gap-1">
                    {week.map((cell) => (
                      <div
                        key={cell.date}
                        title={`${cell.date}: ${cell.count} submissions`}
                        className={`h-3 w-3 rounded-[2px] ${heatLevelClass(cell.count)}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <article className="card p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                Solved by Topic
              </h2>
              <div className="space-y-3">
                {profile.topicProgress.map((topic) => {
                  const pct = Math.round((topic.solved / topic.total) * 100);
                  return (
                    <div key={topic.topic}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-zinc-800 dark:text-zinc-200">{topic.topic}</span>
                        <span className="text-zinc-500 dark:text-zinc-400">{topic.solved}/{topic.total}</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                        <div className="h-2 rounded-full bg-orange-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="card p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                Acceptance Trend
              </h2>
              <div className="grid grid-cols-6 gap-2">
                {profile.acceptanceTrend.map((point) => (
                  <div key={point.label} className="flex flex-col items-center gap-1">
                    <div className="flex h-28 w-full items-end rounded bg-zinc-200/70 px-1 dark:bg-zinc-800">
                      <div
                        className="w-full rounded-t bg-emerald-500"
                        style={{ height: `${Math.min(100, point.acceptance)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{point.label.slice(5)}</p>
                    <p className="text-[11px] text-zinc-700 dark:text-zinc-300">{point.acceptance}%</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="card p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
              Recent Contest Ranks
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-left text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                  <tr>
                    <th className="pb-2">Contest</th>
                    <th className="pb-2">Rank</th>
                    <th className="pb-2">Participants</th>
                    <th className="pb-2">Score</th>
                    <th className="pb-2">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {profile.recentContestRanks.map((row) => (
                    <tr key={row.contest}>
                      <td className="py-2 text-zinc-800 dark:text-zinc-200">{row.contest}</td>
                      <td className="py-2 text-zinc-800 dark:text-zinc-200">#{row.rank}</td>
                      <td className="py-2 text-zinc-500 dark:text-zinc-400">{row.participants}</td>
                      <td className="py-2 text-zinc-500 dark:text-zinc-400">{row.score}</td>
                      <td className="py-2 text-zinc-500 dark:text-zinc-400">{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </MainLayout>
  );
}
