"use client";

import { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import { fetchCompetitions, fetchLeaderboard } from "@/lib/api";
import { Competition, LeaderboardEntry } from "@/types";
import Link from "next/link";

function StatusBadge({ status }: { status: Competition["status"] }) {
  const styles =
    status === "live"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
      : status === "upcoming"
      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
      : "bg-zinc-500/15 text-zinc-600 dark:text-zinc-300";
  const label = status === "live" ? "Live" : status === "upcoming" ? "Upcoming" : "Ended";
  return (
    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${styles}`}>{label}</span>
  );
}

function timing(competition: Competition): string {
  const now = Date.now();
  const start = new Date(competition.startTime).getTime();
  const end = new Date(competition.endTime).getTime();

  const rel = (ms: number): string => {
    const mins = Math.round(ms / 60000);
    if (mins < 60) return `${Math.max(mins, 1)}m`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.round(hours / 24)}d`;
  };

  if (competition.status === "upcoming") return `Starts in ${rel(start - now)}`;
  if (competition.status === "live") return `Ends in ${rel(end - now)}`;
  return "Ended";
}

function durationLabel(competition: Competition): string {
  const mins = Math.round(
    (new Date(competition.endTime).getTime() - new Date(competition.startTime).getTime()) / 60000
  );
  if (Number.isNaN(mins) || mins <= 0) return "—";
  return mins < 60 ? `${mins} min` : `${Math.round(mins / 60)} hr`;
}

export default function CompetitionsPage() {
  const rankedEnabled = process.env.NEXT_PUBLIC_EXECUTION_MODE === "server";
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [contestData, boardData] = await Promise.all([
          fetchCompetitions(),
          fetchLeaderboard(5),
        ]);
        if (active) {
          setCompetitions(contestData);
          setLeaderboard(boardData);
        }
      } catch {
        if (active) setError("Could not load competitions.");
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const featured = competitions.find((c) => c.status === "live") ?? competitions[0];

  return (
    <MainLayout
      title="Competitions"
      subtitle="Timed contests designed for ML interview readiness"
    >
      {!rankedEnabled ? (
        <p className="rounded-xl border border-brand-500/20 bg-brand-500/[0.06] px-4 py-3 text-sm text-zinc-700 dark:text-zinc-200">
          Ranked contests are coming next. The free beta is focused on the 126-problem local practice arena; preview schedules and formats here.
        </p>
      ) : null}
      <section className="rounded-2xl bg-gradient-to-r from-brand-800 via-brand-600 to-brand-500 px-6 py-6 text-white">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-100">
          {featured?.status === "live" ? "Live Now" : "Featured Event"}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          {featured?.title ?? "No contests yet"}
        </h2>
        <p className="mt-2 text-sm text-brand-50">
          {featured?.description ?? "Check back soon for upcoming ML competitions."}
        </p>
      </section>

      {error ? (
        <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      ) : null}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 card p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Contests
          </h3>

          {isLoading ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading contests...</p>
          ) : competitions.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No contests scheduled right now.
            </p>
          ) : (
            <div className="space-y-3">
              {competitions.map((contest) => (
                <Link
                  key={contest.id}
                  href={`/competitions/${contest.id}`}
                  className="grid gap-3 rounded-2xl bg-zinc-50/70 px-4 py-3 transition hover:bg-brand-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:bg-white/[0.025] dark:hover:bg-brand-500/[0.08] md:grid-cols-[1fr_auto_auto_auto] md:items-center"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {contest.title}
                      </p>
                      <StatusBadge status={contest.status} />
                    </div>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {timing(contest)}
                    </p>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300">
                    {contest.participantCount.toLocaleString()} participants
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300">
                    {durationLabel(contest)}
                  </p>
                  <p className="text-xs font-medium text-brand-600 dark:text-brand-300">
                    {contest.problemCount} problems
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Leaderboard
          </h3>
          {isLoading ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
          ) : leaderboard.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No ranked solvers yet.</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className="flex items-center justify-between rounded-xl bg-zinc-50/70 px-3 py-2 text-sm dark:bg-white/[0.025]"
                >
                  <span className="font-medium text-zinc-800 dark:text-zinc-100">
                    #{entry.rank} {entry.username}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {entry.solved} solved
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
