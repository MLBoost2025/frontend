"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import StatsCard from "./components/StatsCard";
import RecentActivity from "./components/RecentActivity";
import WeeklyGoals from "./components/WeeklyGoals";

const STATS = {
  problemsSolved: 47,
  currentStreak: 12,
  ranking: "#1,247",
  achievements: 8,
};

const RECENT_ACTIVITIES = [
  {
    id: "1",
    title: "Image Classification with CNN",
    difficulty: "Medium" as const,
    status: "Completed" as const,
    progress: 100,
  },
  {
    id: "2",
    title: "Sentiment Analysis Model",
    difficulty: "Easy" as const,
    status: "In Progress" as const,
    progress: 60,
  },
  {
    id: "3",
    title: "Time Series Forecasting",
    difficulty: "Hard" as const,
    status: "In Progress" as const,
    progress: 30,
  },
];

const WEEKLY_GOALS = [
  { title: "Problems Solved", current: 7, target: 10 },
  { title: "Learning Hours", current: 8, target: 12 },
  { title: "Code Reviews", current: 3, target: 5 },
];

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleLogout = () => {
    console.log("Logging out...");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-30 p-2 bg-white border border-gray-300 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
          aria-label="Open sidebar"
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "ml-60" : "ml-0"
        }`}
      >
        <Navbar onLogout={handleLogout} isSidebarOpen={isSidebarOpen} />

        <main className="mt-16 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, Alex
            </h1>
            <p className="text-gray-600">
              Continue your AI/ML learning journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Problems Solved"
              value={STATS.problemsSolved}
              icon={
                <svg
                  className="w-12 h-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
            <StatsCard
              title="Current Streak"
              value={STATS.currentStreak}
              icon={
                <svg
                  className="w-12 h-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                  />
                </svg>
              }
            />
            <StatsCard
              title="Ranking"
              value={STATS.ranking}
              icon={
                <svg
                  className="w-12 h-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              }
            />
            <StatsCard
              title="Achievements"
              value={STATS.achievements}
              icon={
                <svg
                  className="w-12 h-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <RecentActivity activities={RECENT_ACTIVITIES} />
            </div>

            <div className="lg:col-span-1">
              <WeeklyGoals goals={WEEKLY_GOALS} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
