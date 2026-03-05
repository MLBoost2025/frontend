"use client";

import { useEffect, useMemo, useState } from "react";
import MainLayout from "../components/MainLayout";
import { fetchUserProfile } from "@/lib/api";
import { UserProfile } from "@/types";

function shortDay(date: string): string {
  return new Date(date).toLocaleDateString(undefined, { weekday: "short" });
}

export default function ProgressPage() {
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

  const weekly = useMemo(() => {
    if (!profile) {
      return [] as Array<{ day: string; value: number }>;
    }

    return profile.heatmap.slice(-7).map((cell) => ({
      day: shortDay(cell.date),
      value: cell.count,
    }));
  }, [profile]);

  const weeklyTotal = useMemo(
    () => weekly.reduce((sum, item) => sum + item.value, 0),
    [weekly]
  );

  return (
    <MainLayout title="Progress" subtitle="Track consistency, strengths, and weak spots">
      {isLoading || !profile ? (
        <div className="rounded-2xl border border-zinc-800 bg-[#171b22] p-10 text-center text-sm text-zinc-400">
          Loading progress...
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <article className="xl:col-span-2 rounded-2xl border border-zinc-800 bg-[#171b22] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Submissions This Week
                </h3>
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-300">
                  {weeklyTotal} total
                </span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {weekly.map((item) => (
                  <div
                    key={item.day}
                    className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-2 py-3 text-center"
                  >
                    <p className="text-[11px] text-zinc-500">{item.day}</p>
                    <p className="mt-2 text-xl font-semibold text-zinc-100">{item.value}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-zinc-800 bg-[#171b22] p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Streak Summary
              </h3>
              <p className="text-3xl font-semibold text-zinc-100">
                {profile.streakDays} days
              </p>
              <p className="mt-2 text-xs text-zinc-500">Keep one accepted submission daily.</p>
              <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-900/70 p-3 text-sm text-zinc-300">
                Acceptance rate: <span className="font-semibold text-zinc-100">{profile.acceptanceRate}%</span>
              </div>
            </article>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-[#171b22] p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Topic Coverage
            </h3>
            <div className="space-y-4">
              {profile.topicProgress.map((area) => {
                const percent = Math.round((area.solved / Math.max(1, area.total)) * 100);
                return (
                  <article key={area.topic}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-zinc-200">{area.topic}</span>
                      <span className="text-zinc-500">
                        {area.solved}/{area.total}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-800">
                      <div
                        className="h-2 rounded-full bg-amber-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-[#171b22] p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Acceptance Trend
            </h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {profile.acceptanceTrend.map((point) => (
                <article
                  key={point.label}
                  className="rounded-lg border border-zinc-700 bg-zinc-900/70 p-3"
                >
                  <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">{point.label}</p>
                  <p className="mt-2 text-xl font-semibold text-zinc-100">{point.acceptance}%</p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </MainLayout>
  );
}
