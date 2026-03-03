"use client";

import { CheckCircle2, Circle, Dot } from "lucide-react";
import { Problem } from "@/types";

interface ProblemsTableProps {
  problems: Problem[];
  onProblemClick?: (problemId: string) => void;
}

function difficultyClass(difficulty: Problem["difficulty"]): string {
  if (difficulty === "Easy") {
    return "text-emerald-600 dark:text-emerald-300";
  }
  if (difficulty === "Medium") {
    return "text-amber-600 dark:text-amber-300";
  }
  return "text-rose-600 dark:text-rose-300";
}

function statusIcon(status: Problem["status"]) {
  if (status === "solved") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  }
  if (status === "attempted") {
    return <Dot className="h-5 w-5 text-amber-500" />;
  }
  return <Circle className="h-4 w-4 text-zinc-400" />;
}

export default function ProblemsTable({
  problems,
  onProblemClick,
}: ProblemsTableProps) {
  if (problems.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white/90 p-10 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400">
        No problems match your current filters.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white/90 dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="border-b border-zinc-200 bg-zinc-100/80 dark:border-zinc-800 dark:bg-zinc-900">
            <tr className="text-left text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3">Difficulty</th>
              <th className="px-4 py-3">Acceptance</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem) => (
              <tr
                key={problem.id}
                onClick={() => onProblemClick?.(problem.id)}
                className="cursor-pointer border-b border-zinc-200 text-sm transition hover:bg-zinc-100/70 dark:border-zinc-800 dark:hover:bg-zinc-800/70"
              >
                <td className="px-4 py-3">{statusIcon(problem.status)}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {problem.title}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {problem.tags.map((tag) => (
                      <span
                        key={`${problem.id}-${tag}`}
                        className="rounded-md bg-zinc-200/80 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className={`px-4 py-3 font-medium ${difficultyClass(problem.difficulty)}`}>
                  {problem.difficulty}
                </td>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                  {problem.acceptanceRate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
