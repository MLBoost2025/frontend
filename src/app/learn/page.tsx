"use client";

import { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import { fetchLearningTracks } from "@/lib/api";
import { LearningTrack } from "@/types";

export default function LearnPage() {
  const [tracks, setTracks] = useState<LearningTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchLearningTracks();
        if (active) setTracks(data);
      } catch {
        if (active) setError("Could not load learning tracks.");
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // "Suggested Next" = the first lessons across the available tracks.
  const suggested = tracks.flatMap((track) => track.lessons).slice(0, 4);

  return (
    <MainLayout
      title="Learn"
      subtitle="Curated paths that map directly to coding practice"
    >
      {error ? (
        <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      ) : null}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.8fr_1fr]">
        <div className="rounded-xl border border-zinc-200 bg-white/90 p-5 dark:border-zinc-800 dark:bg-zinc-900/80">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Learning Tracks
          </h3>

          {isLoading ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading tracks…</p>
          ) : tracks.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No learning tracks available yet.
            </p>
          ) : (
            <div className="space-y-3">
              {tracks.map((track) => (
                <article
                  key={track.id}
                  className="rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {track.title}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {track.description}
                      </p>
                    </div>
                    <span className="whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-400">
                      {track.lessonCount} lessons
                    </span>
                  </div>
                  {track.tags.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {track.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium capitalize text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          {tag.replace(/-/g, " ")}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="rounded-xl border border-zinc-200 bg-white/90 p-5 dark:border-zinc-800 dark:bg-zinc-900/80">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Suggested Next
          </h3>
          {isLoading ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
          ) : suggested.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Nothing suggested yet.</p>
          ) : (
            <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              {suggested.map((lesson) => (
                <li
                  key={lesson}
                  className="rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800"
                >
                  {lesson}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>
    </MainLayout>
  );
}
