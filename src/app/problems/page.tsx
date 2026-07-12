"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "../components/MainLayout";
import ProblemsTable from "../components/ProblemsTable";
import SearchBar from "../components/SearchBar";
import { FilterState, Problem } from "@/types";
import { fetchProblems } from "@/lib/api";

export default function ProblemsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    level: "All Levels",
    category: "All Categories",
    statusFilter: "all",
  });
  const trackTitle = searchParams.get("track")?.trim() || "";
  const trackTags = useMemo(
    () => (searchParams.get("tags") || "").split(",").map((tag) => tag.trim()).filter(Boolean),
    [searchParams]
  );
  const trackTagsKey = trackTags.join(",");

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProblems({
          tags: trackTagsKey ? trackTagsKey.split(",") : [],
        });
        setProblems(data);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [trackTagsKey]);

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const category = categoryParam?.trim() || "All Categories";
    setSelectedCategory(category);
    setFilters((current) => {
      if (current.category === category) {
        return current;
      }
      return { ...current, category };
    });
  }, [searchParams]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTextInput =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (event.key === "/" && !isTextInput) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => {
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  const filteredProblems = useMemo(() => {
    let list = [...problems];

    if (filters.level !== "All Levels") {
      list = list.filter((problem) => problem.difficulty === filters.level);
    }
    if (filters.category !== "All Categories") {
      list = list.filter((problem) => problem.category === filters.category);
    }
    if (filters.statusFilter === "solved") {
      list = list.filter((problem) => problem.status === "solved");
    }
    if (filters.statusFilter === "todo") {
      list = list.filter((problem) => problem.status !== "solved");
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (problem) =>
          problem.title.toLowerCase().includes(query) ||
          problem.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          problem.category.toLowerCase().includes(query)
      );
    }

    return list;
  }, [problems, filters, searchQuery]);

  const solvedCount = problems.filter((problem) => problem.status === "solved").length;
  const mediumCount = problems.filter(
    (problem) => problem.difficulty === "Medium"
  ).length;

  const headerSlot = (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <article className="rounded-xl border border-black/[0.06] bg-white/90 px-4 py-4 dark:border-white/[0.06] dark:bg-zinc-900/80">
        <p className="text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
          Total Problems
        </p>
        <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {problems.length}
        </p>
      </article>
      <article className="rounded-xl border border-black/[0.06] bg-white/90 px-4 py-4 dark:border-white/[0.06] dark:bg-zinc-900/80">
        <p className="text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
          Solved
        </p>
        <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {solvedCount}
        </p>
      </article>
      <article className="rounded-xl border border-black/[0.06] bg-white/90 px-4 py-4 dark:border-white/[0.06] dark:bg-zinc-900/80">
        <p className="text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
          Medium Challenges
        </p>
        <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {mediumCount}
        </p>
      </article>
    </section>
  );

  return (
    <MainLayout
      title="Problems"
      subtitle="Practice interview-grade ML and data science questions"
      headerSlot={headerSlot}
      selectedCategory={selectedCategory}
      onCategoryChange={(category) => {
        setSelectedCategory(category);
        setFilters((current) => ({ ...current, category }));
      }}
    >
      {trackTitle ? (
        <section className="flex flex-col gap-3 rounded-2xl bg-brand-500/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Interview track</p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{trackTitle}</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Showing problems matching {trackTags.join(", ") || "this track"}.
            </p>
          </div>
          <button type="button" onClick={() => router.push("/problems")} className="w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm dark:bg-white/[0.08] dark:text-zinc-200">
            View all problems
          </button>
        </section>
      ) : null}
      <section className="rounded-xl border border-black/[0.06] bg-white/90 p-4 dark:border-white/[0.06] dark:bg-zinc-900/80">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          <SearchBar
            inputId="problem-search"
            inputRef={searchInputRef}
            value={searchQuery}
            onSearch={setSearchQuery}
            placeholder="Search title, tags, or category"
          />

          <select
            aria-label="Difficulty"
            value={filters.level}
            onChange={(event) =>
              setFilters((current) => ({ ...current, level: event.target.value }))
            }
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          >
            <option>All Levels</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <select
            aria-label="Category"
            value={filters.category}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                category: event.target.value,
              }))
            }
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          >
            <option>All Categories</option>
            <option>Supervised Learning</option>
            <option>Data Preprocessing</option>
            <option>Model Evaluation</option>
          </select>

          <select
            aria-label="Completion status"
            value={filters.statusFilter}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                statusFilter: event.target.value as FilterState["statusFilter"],
              }))
            }
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="solved">Solved</option>
          </select>
        </div>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Shortcut: press <span className="font-semibold">/</span> to focus search.
        </p>
      </section>

      <section>
        {isLoading ? (
          <div className="rounded-xl border border-black/[0.06] bg-white/90 p-12 text-center text-zinc-600 dark:border-white/[0.06] dark:bg-zinc-900/80 dark:text-zinc-300">
            Loading problems...
          </div>
        ) : (
          <ProblemsTable
            problems={filteredProblems}
            onProblemClick={(id) => {
              const problem = problems.find((item) => item.id === id);
              if (problem?.slug) {
                router.push(`/problems/${problem.slug}`);
              }
            }}
          />
        )}
      </section>
    </MainLayout>
  );
}
