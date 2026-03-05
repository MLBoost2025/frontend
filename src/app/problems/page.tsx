"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bookmark,
  BriefcaseBusiness,
  CheckCircle2,
  Circle,
  Dot,
  Filter,
  Flame,
  NotebookTabs,
  Search,
  SlidersHorizontal,
  Star,
  Trophy,
} from "lucide-react";
import MainLayout from "../components/MainLayout";
import { FilterState, Problem } from "@/types";
import { fetchProblems } from "@/lib/api";

const LEFT_ITEMS = [
  { label: "Library", icon: NotebookTabs },
  { label: "Quest", icon: Trophy, badge: "New" },
  { label: "Study Plan", icon: Flame },
];

const LIST_ITEMS = ["Favorites", "Top Interview 150", "SQL 50"];
const TOPIC_FILTERS = [
  { key: "all", label: "All Topics" },
  { key: "algorithms", label: "Algorithms" },
  { key: "database", label: "Database" },
  { key: "shell", label: "Shell" },
] as const;
const DATABASE_HINTS = ["database", "sql", "pandas", "joins", "groupby", "preprocessing"];
const SHELL_HINTS = ["shell", "bash", "terminal", "script"];

type TopicFilterKey = (typeof TOPIC_FILTERS)[number]["key"];

function getTopicBucket(problem: Problem): Exclude<TopicFilterKey, "all"> {
  const tags = problem.tags.map((tag) => tag.toLowerCase());
  const isDatabase = tags.some((tag) =>
    DATABASE_HINTS.some((needle) => tag.includes(needle))
  );
  if (isDatabase) {
    return "database";
  }

  const isShell = tags.some((tag) => SHELL_HINTS.some((needle) => tag.includes(needle)));
  if (isShell) {
    return "shell";
  }

  return "algorithms";
}

function statusIcon(status: Problem["status"]) {
  if (status === "solved") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
  }
  if (status === "attempted") {
    return <Dot className="h-5 w-5 text-amber-400" />;
  }
  return <Circle className="h-4 w-4 text-zinc-500" />;
}

function difficultyClass(difficulty: Problem["difficulty"]) {
  if (difficulty === "Easy") {
    return "text-emerald-400";
  }
  if (difficulty === "Medium") {
    return "text-amber-300";
  }
  return "text-rose-400";
}

export default function ProblemsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState<TopicFilterKey>("all");
  const [starredProblems, setStarredProblems] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    level: "All Levels",
    category: "All Categories",
    statusFilter: "all",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProblems();
        setProblems(data);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const queryParam = searchParams.get("query") || "";
    setFilters((current) => ({
      ...current,
      category: categoryParam || "All Categories",
    }));
    setSearchQuery(queryParam);
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
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const problem of problems) {
      counts.set(problem.category, (counts.get(problem.category) || 0) + 1);
    }
    return Array.from(counts.entries());
  }, [problems]);

  const companyCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const problem of problems) {
      for (const company of problem.companies || []) {
        counts.set(company, (counts.get(company) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [problems]);

  const topicCounts = useMemo(() => {
    return TOPIC_FILTERS.reduce<Record<TopicFilterKey, number>>(
      (acc, filter) => {
        acc[filter.key] =
          filter.key === "all"
            ? problems.length
            : problems.filter((problem) => getTopicBucket(problem) === filter.key).length;
        return acc;
      },
      { all: 0, algorithms: 0, database: 0, shell: 0 }
    );
  }, [problems]);

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
          problem.category.toLowerCase().includes(query) ||
          problem.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (topicFilter !== "all") {
      list = list.filter((problem) => getTopicBucket(problem) === topicFilter);
    }

    return list;
  }, [problems, filters, searchQuery, topicFilter]);

  const solvedCount = problems.filter((problem) => problem.status === "solved").length;

  return (
    <MainLayout
      title="Problemset"
      subtitle="Practice curated ML and data interview problems with contest-grade workflows"
    >
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[220px_1fr_290px]">
        <aside className="hidden h-fit rounded-2xl border border-zinc-800 bg-[#161a22] p-3 xl:sticky xl:top-24 xl:block">
          <div className="space-y-1">
            {LEFT_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon className="h-4 w-4 text-zinc-400" />
                    {item.label}
                  </span>
                  {item.badge ? (
                    <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[11px] text-cyan-300">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-6 border-t border-zinc-800 pt-4">
            <p className="mb-3 px-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
              My Lists
            </p>
            <div className="space-y-2">
              {LIST_ITEMS.map((item) => (
                <button
                  key={item}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                >
                  <Bookmark className="h-4 w-4" />
                  {item}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="space-y-4">
          <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <article className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-300/45 via-sky-500/35 to-indigo-500/35 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-100">Offer Campaign</p>
              <h2 className="mt-1 text-xl font-semibold text-white">2026 Spring Sprint</h2>
              <p className="mt-1 text-sm text-cyan-50/90">Daily curated set for interview momentum.</p>
            </article>
            <article className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-300/45 via-orange-500/35 to-amber-700/35 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-amber-100">Today</p>
              <h2 className="mt-1 text-xl font-semibold text-white">JavaScript Day 30</h2>
              <p className="mt-1 text-sm text-amber-50/90">One challenge · 18 min estimate.</p>
            </article>
            <article className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/45 via-indigo-500/35 to-cyan-500/35 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-blue-100">Interview Bank</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Top Questions</h2>
              <p className="mt-1 text-sm text-blue-50/90">Most asked in current hiring loops.</p>
            </article>
          </section>

          <section className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-800 bg-[#161a22] p-3 text-sm text-zinc-400">
            {categories.map(([category, count]) => (
              <button
                key={category}
                onClick={() => setFilters((current) => ({ ...current, category }))}
                className={`rounded-full px-3 py-1 transition ${
                  filters.category === category
                    ? "bg-zinc-100 text-zinc-900"
                    : "bg-zinc-800/70 hover:bg-zinc-700 hover:text-zinc-200"
                }`}
              >
                {category} <span className="text-xs opacity-80">{count}</span>
              </button>
            ))}
          </section>

          <section className="space-y-3 rounded-2xl border border-zinc-800 bg-[#161a22] p-3">
            <div className="flex flex-wrap items-center gap-2">
              {TOPIC_FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setTopicFilter(filter.key)}
                  className={`rounded-full px-4 py-1.5 text-sm ${
                    topicFilter === filter.key
                      ? "bg-zinc-100 text-zinc-900"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  {filter.label}
                  <span className="ml-1 text-xs opacity-70">{topicCounts[filter.key]}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_auto_auto_auto]">
              <label className="flex h-11 items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-zinc-400">
                <Search className="h-4 w-4" />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search questions"
                  className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
                />
              </label>
              <button className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-zinc-300 hover:bg-zinc-800">
                <SlidersHorizontal className="h-4 w-4" />
              </button>
              <button className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-zinc-300 hover:bg-zinc-800">
                <Filter className="h-4 w-4" />
              </button>
              <select
                value={filters.level}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, level: event.target.value }))
                }
                className="h-11 rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-200 outline-none"
              >
                <option>All Levels</option>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
              <select
                value={filters.statusFilter}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    statusFilter: event.target.value as FilterState["statusFilter"],
                  }))
                }
                className="h-11 rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-200 outline-none"
              >
                <option value="all">All Status</option>
                <option value="solved">Solved</option>
                <option value="todo">To Do</option>
              </select>
            </div>

            <div className="flex items-center justify-between text-sm text-zinc-500">
              <span>
                {solvedCount}/{problems.length} solved
              </span>
              <span>
                {filteredProblems.length} shown · Press / to focus search
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-zinc-800">
              <table className="w-full min-w-[780px] border-collapse">
                <thead className="bg-zinc-900 text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Acceptance</th>
                    <th className="px-4 py-3">Difficulty</th>
                    <th className="px-4 py-3">Star</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-zinc-400">
                        Loading problemset...
                      </td>
                    </tr>
                  ) : filteredProblems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-zinc-400">
                        No problems matched your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredProblems.map((problem, index) => (
                      <tr
                        key={problem.id}
                        onClick={() => problem.slug && router.push(`/problems/${problem.slug}`)}
                        className="cursor-pointer border-t border-zinc-800/80 bg-zinc-950/70 text-sm text-zinc-200 transition hover:bg-zinc-900"
                      >
                        <td className="px-4 py-3 text-zinc-500">{index + 1}</td>
                        <td className="px-4 py-3">{statusIcon(problem.status)}</td>
                        <td className="px-4 py-3 font-medium">{problem.title}</td>
                        <td className="px-4 py-3 text-zinc-400">{problem.acceptanceRate}%</td>
                        <td className={`px-4 py-3 font-medium ${difficultyClass(problem.difficulty)}`}>
                          {problem.difficulty}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setStarredProblems((previous) => {
                                const next = new Set(previous);
                                if (next.has(problem.id)) {
                                  next.delete(problem.id);
                                } else {
                                  next.add(problem.id);
                                }
                                return next;
                              });
                            }}
                            className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-amber-300"
                            aria-label={`Toggle favorite for ${problem.title}`}
                          >
                            <Star
                              className={`h-4 w-4 ${
                                starredProblems.has(problem.id)
                                  ? "fill-amber-300 text-amber-300"
                                  : ""
                              }`}
                            />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="hidden h-fit space-y-4 xl:sticky xl:top-24 xl:block">
          <article className="rounded-2xl border border-zinc-800 bg-[#161a22] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Today</p>
            <h3 className="mt-2 text-lg font-semibold text-zinc-200">Weekly Premium</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Solve one premium question and keep your 7-day streak active.
            </p>
            <button className="mt-4 rounded-lg bg-amber-500/20 px-3 py-2 text-sm font-medium text-amber-300">
              Redeem
            </button>
          </article>

          <article className="rounded-2xl border border-zinc-800 bg-[#161a22] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Trending Companies
              </h3>
              <BriefcaseBusiness className="h-4 w-4 text-zinc-500" />
            </div>
            <div className="space-y-2">
              {companyCounts.map(([company, count]) => (
                <div
                  key={company}
                  className="flex items-center justify-between rounded-lg bg-zinc-800/70 px-3 py-2 text-sm"
                >
                  <span className="text-zinc-300">{company}</span>
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>
    </MainLayout>
  );
}
