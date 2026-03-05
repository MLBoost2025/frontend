"use client";

import { useEffect, useMemo, useState } from "react";
import MainLayout from "../components/MainLayout";
import { AlarmClockCheck, Shuffle, Trophy } from "lucide-react";

const UPCOMING = [
  {
    id: "weekly",
    title: "Weekly Contest 492",
    startsAt: "2026-03-08T08:00:00+05:30",
    gradient: "from-amber-300/90 via-orange-400/90 to-amber-700/70",
  },
  {
    id: "biweekly",
    title: "Biweekly Contest 178",
    startsAt: "2026-03-14T20:00:00+05:30",
    gradient: "from-indigo-500/90 via-violet-500/90 to-indigo-900/70",
  },
];

function formatCountdown(targetMs: number, nowMs: number): string {
  const remaining = targetMs - nowMs;
  if (remaining <= 0) {
    return "Live now";
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const padded = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
  return `${days}d ${padded}`;
}

export default function CompetitionsPage() {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const contestCards = useMemo(
    () =>
      UPCOMING.map((contest) => {
        const startsAtMs = new Date(contest.startsAt).getTime();
        return {
          ...contest,
          startsAtLabel: new Date(contest.startsAt).toLocaleString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZoneName: "short",
          }),
          countdownLabel: formatCountdown(startsAtMs, nowMs),
          isLive: startsAtMs <= nowMs,
        };
      }),
    [nowMs]
  );

  return (
    <MainLayout title="Contest" subtitle="Contest every week. Compete and climb the rankings.">
      <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-[#11141b] p-6 md:p-10">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.18),transparent_35%),radial-gradient(circle_at_70%_70%,rgba(59,130,246,0.16),transparent_40%)]"
        />
        <div className="relative z-10 text-center">
          <div className="mx-auto inline-flex h-24 w-24 items-center justify-center rounded-full border border-amber-400/40 bg-amber-500/15 text-5xl text-amber-300">
            <Trophy className="h-12 w-12" />
          </div>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-zinc-100">
            MLBoost Contest
          </h1>
          <p className="mt-2 text-lg text-zinc-400">
            Weekly and biweekly battles for machine learning interview mastery.
          </p>
        </div>

        <div className="relative z-10 mt-10 grid grid-cols-1 gap-4 xl:grid-cols-2">
          {contestCards.map((contest) => (
            <article
              key={contest.id}
              className={`overflow-hidden rounded-3xl border border-zinc-700/60 bg-gradient-to-br ${contest.gradient}`}
            >
              <div className="flex items-center justify-between bg-black/20 px-5 py-3 text-sm text-white/90">
                <p className="inline-flex items-center gap-1.5">
                  <AlarmClockCheck className="h-4 w-4" />
                  {contest.countdownLabel}
                </p>
                <button className="rounded-full bg-white/25 px-3 py-1 text-xs">
                  {contest.isLive ? "Join Live" : "Notify me"}
                </button>
              </div>
              <div className="p-6">
                <h2 className="text-4xl font-semibold text-white">{contest.title}</h2>
                <p className="mt-2 text-base text-white/90">{contest.startsAtLabel}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-center gap-2">
        <button className="rounded-full bg-amber-500 px-6 py-2 text-sm font-semibold text-zinc-900">
          Global
        </button>
        <button className="rounded-full bg-zinc-800 px-6 py-2 text-sm text-zinc-200">Past Contests</button>
        <button className="rounded-full bg-zinc-800 px-6 py-2 text-sm text-zinc-200">My Contests</button>
        <button className="inline-flex items-center gap-2 rounded-full bg-fuchsia-500 px-5 py-2 text-sm font-medium text-white">
          <Shuffle className="h-4 w-4" />
          Shuffle
        </button>
      </section>
    </MainLayout>
  );
}
