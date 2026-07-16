"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import MainLayout from "../../components/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { fetchCompetitionById, fetchContestLeaderboard, registerForContest } from "@/lib/api";
import { CompetitionDetail, ContestLeaderboardEntry, Difficulty } from "@/types";

function difficultyClass(difficulty: Difficulty): string {
  if (difficulty === "Easy") return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  if (difficulty === "Hard") return "bg-rose-500/10 text-rose-700 dark:text-rose-300";
  return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
}

function statusLabel(contest: CompetitionDetail): string {
  if (contest.status === "live") return "Live now";
  if (contest.status === "upcoming") return `Starts ${new Date(contest.startTime).toLocaleString()}`;
  return `Ended ${new Date(contest.endTime).toLocaleString()}`;
}

export default function CompetitionDetailPage() {
  const rankedEnabled = process.env.NEXT_PUBLIC_EXECUTION_MODE === "server";
  const params = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [contest, setContest] = useState<CompetitionDetail | null>(null);
  const [leaderboard, setLeaderboard] = useState<ContestLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([fetchCompetitionById(params.id), fetchContestLeaderboard(params.id)])
      .then(([detail, entries]) => {
        if (active) { setContest(detail); setRegistered(Boolean(detail.isRegistered)); setLeaderboard(entries); }
      })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Could not load contest."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params.id]);

  async function register() {
    setRegistering(true);
    setError(null);
    try {
      await registerForContest(params.id);
      setRegistered(true);
      setContest((current) => current ? { ...current, participantCount: current.participantCount + 1 } : current);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Registration failed.");
    } finally { setRegistering(false); }
  }

  return (
    <MainLayout title={contest?.title ?? "Competition"} subtitle="Contest details and standings">
      <Link href="/competitions" className="w-fit text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">← All competitions</Link>
      {loading ? <div className="card p-6 text-sm text-zinc-500">Loading contest…</div> : error && !contest ? <div role="alert" className="card p-6 text-sm text-rose-600">{error}</div> : contest ? (
        <>
          <section className="card overflow-hidden">
            <div className="bg-gradient-to-r from-brand-800 via-brand-600 to-brand-500 p-6 text-white sm:p-8">
              <p className="eyebrow !text-brand-100">{statusLabel(contest)}</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{contest.title}</h1>
              <p className="mt-3 max-w-2xl text-sm text-brand-50">{contest.description || "A timed ML problem-solving contest."}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-white/15 px-3 py-1.5">{contest.problemCount} problems</span>
                <span className="rounded-full bg-white/15 px-3 py-1.5">{contest.participantCount.toLocaleString()} participants</span>
                <span className="rounded-full bg-white/15 px-3 py-1.5">Ends {new Date(contest.endTime).toLocaleString()}</span>
              </div>
              <div className="mt-6">
                {isAuthenticated ? (
                  <button type="button" onClick={() => void register()} disabled={!rankedEnabled || registering || registered || contest.status === "ended"} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-800 shadow-sm transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60">{!rankedEnabled ? "Ranked launch coming soon" : registered ? "Registered" : registering ? "Registering…" : contest.status === "ended" ? "Contest ended" : "Register"}</button>
                ) : <Link href="/login" className="inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-800 shadow-sm">Sign in to register</Link>}
              </div>
            </div>
          </section>
          {error ? <p role="alert" className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
          <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            <div className="card p-5 sm:p-6">
              <p className="eyebrow">Problems</p>
              <div className="mt-4 space-y-3">
                {contest.problems.length === 0 ? <p className="text-sm text-zinc-500">Problems will appear when the contest opens.</p> : contest.problems.map((problem, index) => (
                  <Link key={problem.id} href={rankedEnabled ? `/problems/${problem.slug}?contest=${encodeURIComponent(contest.id)}` : `/problems/${problem.slug}`} className="flex items-center justify-between rounded-2xl bg-zinc-100/70 p-4 transition hover:bg-brand-50 dark:bg-white/[0.04] dark:hover:bg-brand-500/[0.08]">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{index + 1}. {problem.title}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${difficultyClass(problem.difficulty)}`}>{problem.difficulty}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="card p-5 sm:p-6">
              <p className="eyebrow">Leaderboard</p>
              <div className="mt-4 space-y-2">
                {leaderboard.length === 0 ? <p className="text-sm text-zinc-500">No scores yet.</p> : leaderboard.map((entry) => (
                  <div key={entry.userId} className="flex items-center justify-between rounded-2xl bg-zinc-100/70 px-4 py-3 dark:bg-white/[0.04]">
                    <span className="text-sm font-semibold">#{entry.rank} {entry.username}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{entry.score} pts · {entry.problemsSolved} solved</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </MainLayout>
  );
}
