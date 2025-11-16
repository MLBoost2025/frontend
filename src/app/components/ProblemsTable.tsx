"use client";

import { Problem } from "@/types";

interface ProblemsTableProps {
  problems: Problem[];
  onProblemClick?: (problemId: string) => void;
}

export default function ProblemsTable({
  problems,
  onProblemClick,
}: ProblemsTableProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-50 text-green-700 border border-green-200";
      case "Medium":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "Hard":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "solved":
        return (
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case "attempted":
        return (
          <div className="w-5 h-5 rounded-full border-2 border-orange-500"></div>
        );
      default:
        return (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
        );
    }
  };

  const handleProblemClick = (problemId: string) => {
    if (onProblemClick) {
      onProblemClick(problemId);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Problem
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                Difficulty
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-48">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                Acceptance
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {problems.map((problem, index) => (
              <tr
                key={problem.id}
                className={`hover:bg-gray-100 transition-colors cursor-pointer ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
                onClick={() => handleProblemClick(problem.id)}
              >
                <td className="px-6 py-4">{getStatusIcon(problem.status)}</td>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900 hover:text-blue-600 mb-1">
                      {problem.title}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {problem.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-medium rounded ${getDifficultyColor(
                      problem.difficulty
                    )}`}
                  >
                    {problem.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {problem.category}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {problem.acceptance}%
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProblemClick(problem.id);
                    }}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    Solve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {problems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No problems found. Try adjusting your filters.
        </div>
      )}
    </div>
  );
}
