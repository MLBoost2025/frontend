"use client";

import { CheckCircle2, Circle, CircleDashed } from "lucide-react";
import { Problem } from "@/types";

interface ProblemsTableProps {
  problems: Problem[];
  onProblemClick?: (problemId: string) => void;
}

function difficultyPill(difficulty: Problem["difficulty"]): string {
  if (difficulty === "Easy") {
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20";
  }
  if (difficulty === "Medium") {
    return "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20";
  }
  return "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20";
}

function statusIcon(status: Problem["status"]) {
  if (status === "solved") {
    return <CheckCircle2 className="h-[18px] w-[18px] text-emerald-500" />;
  }
  if (status === "attempted") {
    return <CircleDashed className="h-[18px] w-[18px] text-amber-500" />;
  }
  return <Circle className="h-[18px] w-[18px] text-zinc-300 dark:text-zinc-600" />;
}

export default function ProblemsTable({
  problems,
  onProblemClick,
}: ProblemsTableProps) {
  if (problems.length === 0) {
    return (
      <div className="card p-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
        No problems match your current filters.
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="divide-y divide-zinc-100 md:hidden dark:divide-white/[0.04]">
        {problems.map((problem) => (
          <article key={problem.id} className="p-4">
            <button
              type="button"
              onClick={() => onProblemClick?.(problem.id)}
              disabled={!onProblemClick}
              className="w-full text-left"
              aria-label={`Open ${problem.title}`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0" aria-hidden="true">
                  {statusIcon(problem.status)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="sr-only">{problem.status} status. </span>
                  <span className="block text-sm font-semibold text-zinc-800 transition-colors hover:text-brand-600 dark:text-zinc-100 dark:hover:text-brand-400">
                    {problem.title}
                  </span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {problem.tags.slice(0, 3).map((tag) => (
                      <span
                        key={`${problem.id}-${tag}`}
                        className="rounded-lg bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-white/[0.05] dark:text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </span>
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${difficultyPill(
                    problem.difficulty
                  )}`}
                >
                  {problem.difficulty}
                </span>
              </div>
              <span className="mt-3 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {problem.acceptanceRate}% acceptance
              </span>
            </button>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="border-b border-zinc-200/70 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:border-white/[0.06] dark:text-zinc-400">
              <th className="w-16 px-5 py-3 text-center">Status</th>
              <th className="px-2 py-3">Title</th>
              <th className="px-2 py-3">Tags</th>
              <th className="px-2 py-3">Difficulty</th>
              <th className="px-5 py-3 text-right">Acceptance</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem, index) => (
              <tr
                key={problem.id}
                className={`group text-sm transition-colors hover:bg-brand-500/[0.04] dark:hover:bg-white/[0.03] ${
                  index !== problems.length - 1
                    ? "border-b border-zinc-100 dark:border-white/[0.04]"
                    : ""
                }`}
              >
                <td className="px-5 py-3.5">
                  <div className="flex justify-center">
                    <span className="sr-only">{problem.status} status</span>
                    <span aria-hidden="true">{statusIcon(problem.status)}</span>
                  </div>
                </td>
                <td className="px-2 py-3.5">
                  <button
                    type="button"
                    onClick={() => onProblemClick?.(problem.id)}
                    disabled={!onProblemClick}
                    className="rounded-sm text-left font-medium text-zinc-800 transition-colors hover:text-brand-600 dark:text-zinc-100 dark:hover:text-brand-400"
                    aria-label={`Open ${problem.title}`}
                  >
                    {problem.title}
                  </button>
                </td>
                <td className="px-2 py-3.5">
                  <div className="flex flex-wrap gap-1.5">
                    {problem.tags.slice(0, 3).map((tag) => (
                      <span
                        key={`${problem.id}-${tag}`}
                        className="rounded-lg bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-white/[0.05] dark:text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-2 py-3.5">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${difficultyPill(
                      problem.difficulty
                    )}`}
                  >
                    {problem.difficulty}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-2">
                    <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/[0.06] sm:block">
                      <div
                        className="h-full rounded-full bg-zinc-400 dark:bg-zinc-500"
                        style={{ width: `${Math.min(problem.acceptanceRate, 100)}%` }}
                      />
                    </div>
                    <span className="w-11 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {problem.acceptanceRate}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
