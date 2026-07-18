"use client";

import { useEffect, useMemo, useState } from "react";
import MainLayout from "../components/MainLayout";
import { fetchUserProfile } from "@/lib/api";
import { UserProfile } from "@/types";
import { useAuth } from "@/context/AuthContext";
import PremiumPanel from "../components/PremiumPanel";

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
  const { updateProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await fetchUserProfile();
        setProfile(data);
        setName(data.user.name);
        setAvatarUrl(data.user.avatarUrl || "");
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setSaveState("saving");
    setSaveMessage("");
    try {
      const user = await updateProfile({ name, avatarUrl });
      setProfile((current) => current ? { ...current, user } : current);
      setName(user.name);
      setAvatarUrl(user.avatarUrl || "");
      setSaveState("saved");
      setSaveMessage("Profile updated.");
      setIsEditing(false);
    } catch (error) {
      setSaveState("error");
      setSaveMessage(error instanceof Error ? error.message : "Could not update profile.");
    }
  }

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
        <div className="rounded-xl border border-black/[0.06] bg-white/90 p-10 text-center text-sm text-zinc-600 dark:border-white/[0.06] dark:bg-zinc-900/80 dark:text-zinc-300">
          Loading profile...
        </div>
      ) : (
        <>
          <PremiumPanel surface="profile" />
          <section className="card p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 bg-cover bg-center text-xl font-bold text-white shadow-lg shadow-brand-500/20"
                  style={profile.user.avatarUrl ? { backgroundImage: `url(${profile.user.avatarUrl})` } : undefined}
                  role="img"
                  aria-label={`${profile.user.name} avatar`}
                >
                  {profile.user.avatarUrl ? null : profile.user.name.trim().charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="eyebrow">Your profile</p>
                  <h2 className="mt-1 truncate text-xl font-semibold text-zinc-900 dark:text-zinc-100">{profile.user.name}</h2>
                  <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">{profile.user.email}</p>
                </div>
              </div>
              <button type="button" onClick={() => { setIsEditing((value) => !value); setSaveState("idle"); setSaveMessage(""); }} className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600">
                {isEditing ? "Cancel" : "Edit profile"}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={saveProfile} className="mt-6 grid gap-4 rounded-2xl bg-zinc-100/70 p-4 dark:bg-white/[0.04] sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Display name</span>
                  <input value={name} onChange={(event) => setName(event.target.value)} minLength={3} maxLength={28} required className="w-full rounded-xl bg-white px-3.5 py-2.5 text-sm outline-none ring-1 ring-black/[0.05] focus:ring-brand-400/60 dark:bg-white/[0.07] dark:ring-white/[0.05]" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">Avatar URL</span>
                  <input type="url" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} maxLength={2048} placeholder="https://example.com/avatar.jpg" className="w-full rounded-xl bg-white px-3.5 py-2.5 text-sm outline-none ring-1 ring-black/[0.05] focus:ring-brand-400/60 dark:bg-white/[0.07] dark:ring-white/[0.05]" />
                </label>
                <div className="sm:col-span-2">
                  <button type="submit" disabled={saveState === "saving"} className="btn-primary disabled:opacity-50">{saveState === "saving" ? "Saving…" : "Save changes"}</button>
                </div>
              </form>
            ) : null}
            {saveMessage ? <p role={saveState === "error" ? "alert" : "status"} className={`mt-4 rounded-xl px-3.5 py-2.5 text-sm ${saveState === "error" ? "bg-rose-500/10 text-rose-600 dark:text-rose-300" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}>{saveMessage}</p> : null}
          </section>

          <section className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <article className="rounded-xl border border-black/[0.06] bg-white/90 p-4 dark:border-white/[0.06] dark:bg-zinc-900/80">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">Solved</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{profile.totalSolved}</p>
            </article>
            <article className="rounded-xl border border-black/[0.06] bg-white/90 p-4 dark:border-white/[0.06] dark:bg-zinc-900/80">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">Acceptance</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{profile.acceptanceRate}%</p>
            </article>
            <article className="rounded-xl border border-black/[0.06] bg-white/90 p-4 dark:border-white/[0.06] dark:bg-zinc-900/80">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">Current Streak</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{profile.streakDays} days</p>
            </article>
            <article className="rounded-xl border border-black/[0.06] bg-white/90 p-4 dark:border-white/[0.06] dark:bg-zinc-900/80">
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
                        role="img"
                        aria-label={`${cell.date}: ${cell.count} submissions`}
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
                      <div
                        role="progressbar"
                        aria-label={`${topic.topic} progress`}
                        aria-valuemin={0}
                        aria-valuemax={topic.total}
                        aria-valuenow={topic.solved}
                        className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800"
                      >
                        <div className="h-2 rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
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
                    <div
                      role="img"
                      aria-label={`${point.label}: ${point.acceptance}% acceptance`}
                      className="flex h-28 w-full items-end rounded bg-zinc-200/70 px-1 dark:bg-zinc-800"
                    >
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
