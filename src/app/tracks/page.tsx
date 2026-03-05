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
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("All Companies");

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

  const companies = useMemo(
    () => ["All Companies", ...Array.from(new Set(tracks.map((track) => track.company)))],
    [tracks]
  );

  const visibleTracks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tracks
      .filter((track) => companyFilter === "All Companies" || track.company === companyFilter)
      .filter((track) => {
        if (!query) {
          return true;
        }
        return (
          track.title.toLowerCase().includes(query) ||
          track.description.toLowerCase().includes(query) ||
          track.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => b.solvedProblems / b.totalProblems - a.solvedProblems / a.totalProblems);
  }, [tracks, companyFilter, searchQuery]);

  return (
    <MainLayout
      title="Interview Tracks"
      subtitle="Company-flavored curated sets to prepare for specific ML/Data interviews"
      headerSlot={
        <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-zinc-800 bg-[#171b22] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Tracks</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-100">{tracks.length}</p>
          </article>
          <article className="rounded-xl border border-zinc-800 bg-[#171b22] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Solved in Tracks</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-100">{totals.solvedProblems}</p>
          </article>
          <article className="rounded-xl border border-zinc-800 bg-[#171b22] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Total Questions</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-100">{totals.totalProblems}</p>
          </article>
        </section>
      }
    >
      <section className="rounded-xl border border-zinc-800 bg-[#171b22] p-3">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_240px]">
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search tracks by company, title, or tag"
            className="h-10 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
          />
          <select
            value={companyFilter}
            onChange={(event) => setCompanyFilter(event.target.value)}
            className="h-10 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-200 outline-none"
          >
            {companies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
        </div>
      </section>

      {isLoading ? (
        <div className="rounded-xl border border-zinc-800 bg-[#171b22] p-10 text-center text-sm text-zinc-400">
          Loading company tracks...
        </div>
      ) : visibleTracks.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-[#171b22] p-10 text-center text-sm text-zinc-400">
          No tracks matched your filters.
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {visibleTracks.map((track) => {
            const progress = Math.round((track.solvedProblems / track.totalProblems) * 100);
            return (
              <article
                key={track.id}
                className="rounded-xl border border-zinc-800 bg-[#171b22] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-400">
                      {track.company}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-zinc-100">{track.title}</h2>
                    <p className="mt-2 text-sm text-zinc-300">{track.description}</p>
                  </div>
                  <button
                    onClick={() => router.push("/problems")}
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                  >
                    Open Track
                  </button>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-xs text-zinc-500">
                    <span>
                      {track.solvedProblems}/{track.totalProblems} solved
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800">
                    <div className="h-2 rounded-full bg-amber-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {track.tags.map((tag) => (
                    <span
                      key={`${track.id}-${tag}`}
                      className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300"
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
