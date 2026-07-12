"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "../components/MainLayout";
import { CompanyTrack } from "@/types";
import { fetchCompanyTracks } from "@/lib/api";

export default function TracksPage() {
  const router = useRouter();
  const [tracks, setTracks] = useState<CompanyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCompanyTracks();
        setTracks(data);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const totals = useMemo(() => {
    const totalProblems = tracks.reduce((sum, track) => sum + track.totalProblems, 0);
    const solvedProblems = tracks.reduce((sum, track) => sum + track.solvedProblems, 0);
    return { totalProblems, solvedProblems };
  }, [tracks]);

  return (
    <MainLayout
      title="Interview Tracks"
      subtitle="Company-flavored curated sets to prepare for specific ML/Data interviews"
      headerSlot={
        <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-black/[0.06] bg-white/90 px-4 py-4 dark:border-white/[0.06] dark:bg-zinc-900/80">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
              Tracks
            </p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {tracks.length}
            </p>
          </article>
          <article className="rounded-xl border border-black/[0.06] bg-white/90 px-4 py-4 dark:border-white/[0.06] dark:bg-zinc-900/80">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
              Solved in Tracks
            </p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {totals.solvedProblems}
            </p>
          </article>
          <article className="rounded-xl border border-black/[0.06] bg-white/90 px-4 py-4 dark:border-white/[0.06] dark:bg-zinc-900/80">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
              Total Questions
            </p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {totals.totalProblems}
            </p>
          </article>
        </section>
      }
    >
      {isLoading ? (
        <div className="rounded-xl border border-black/[0.06] bg-white/90 p-10 text-center text-sm text-zinc-600 dark:border-white/[0.06] dark:bg-zinc-900/80 dark:text-zinc-300">
          Loading company tracks...
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {tracks.map((track) => {
            const progress = track.totalProblems > 0
              ? Math.round((track.solvedProblems / track.totalProblems) * 100)
              : 0;
            return (
              <article
                key={track.id}
                className="card p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-500">
                      {track.company}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {track.title}
                    </h2>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                      {track.description}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const query = new URLSearchParams({
                        track: track.title,
                        tags: track.tags.join(","),
                      });
                      router.push(`/problems?${query.toString()}`);
                    }}
                    className="rounded-full bg-brand-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-600"
                  >
                    Open Track
                  </button>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>
                      {track.solvedProblems}/{track.totalProblems} solved
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`${track.title} progress`}
                    aria-valuemin={0}
                    aria-valuemax={track.totalProblems}
                    aria-valuenow={track.solvedProblems}
                    className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800"
                  >
                    <div className="h-2 rounded-full bg-orange-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {track.tags.map((tag) => (
                    <span
                      key={`${track.id}-${tag}`}
                      className="rounded-md bg-zinc-200/80 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </MainLayout>
  );
}
