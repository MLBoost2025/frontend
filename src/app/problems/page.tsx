"use client";

import { useState, useMemo, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ProblemsTable from "../components/ProblemsTable";
import SearchBar from "../components/SearchBar";
import { Problem, FilterState } from "@/types";
import { fetchProblems } from "@/lib/api";

const SAMPLE_PROBLEMS: Problem[] = [
  {
    id: "1",
    title: "Linear Regression from Scratch",
    difficulty: "Easy",
    category: "Supervised Learning",
    acceptance: 78,
    status: "solved",
    tags: ["regression", "numpy"],
  },
  {
    id: "2",
    title: "Convolutional Neural Network",
    difficulty: "Medium",
    category: "Deep Learning",
    acceptance: 54,
    status: "solved",
    tags: ["cnn", "tensorflow", "images"],
  },
  {
    id: "3",
    title: "LSTM Time Series Prediction",
    difficulty: "Medium",
    category: "Deep Learning",
    acceptance: 48,
    status: "unsolved",
    tags: ["lstm", "time-series"],
  },
  {
    id: "4",
    title: "Transformer Architecture",
    difficulty: "Hard",
    category: "NLP",
    acceptance: 32,
    status: "unsolved",
    tags: ["transformer", "attention", "nlp"],
  },
  {
    id: "5",
    title: "K-Means Clustering",
    difficulty: "Easy",
    category: "Unsupervised Learning",
    acceptance: 72,
    status: "attempted",
    tags: ["clustering", "unsupervised"],
  },
  {
    id: "6",
    title: "Object Detection with YOLO",
    difficulty: "Medium",
    category: "Computer Vision",
    acceptance: 45,
    status: "unsolved",
    tags: ["object-detection", "yolo", "cv"],
  },
  {
    id: "7",
    title: "Sentiment Analysis",
    difficulty: "Easy",
    category: "NLP",
    acceptance: 65,
    status: "solved",
    tags: ["nlp", "classification"],
  },
  {
    id: "8",
    title: "GAN for Image Generation",
    difficulty: "Hard",
    category: "Deep Learning",
    acceptance: 28,
    status: "unsolved",
    tags: ["gan", "generative", "images"],
  },
  {
    id: "9",
    title: "Q-Learning CartPole",
    difficulty: "Medium",
    category: "Reinforcement Learning",
    acceptance: 51,
    status: "unsolved",
    tags: ["rl", "q-learning"],
  },
  {
    id: "10",
    title: "Neural Style Transfer",
    difficulty: "Hard",
    category: "Computer Vision",
    acceptance: 38,
    status: "unsolved",
    tags: ["style-transfer", "cnn", "art"],
  },
];

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    level: "All Levels",
    category: "All Categories",
    statusFilter: "all",
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadProblems = async () => {
      try {
        setIsLoading(true);
        // Try to get problems from the backend API
        const data = await fetchProblems();

        // If API doesn't return any data, use our hardcoded sample problems instead
        const problemsData =
          !data || data.length === 0 ? SAMPLE_PROBLEMS : data;
        setProblems(problemsData);
      } catch (error) {
        console.error("Failed to fetch problems, using hardcoded data:", error);
        // If API call fails, just use the hardcoded sample data
        setProblems(SAMPLE_PROBLEMS);
      } finally {
        setIsLoading(false);
      }
    };

    loadProblems();
  }, []);

  const filteredProblems = useMemo(() => {
    let filtered = [...problems];

    if (filters.level !== "All Levels") {
      filtered = filtered.filter((p) => p.difficulty === filters.level);
    }

    if (filters.category !== "All Categories") {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          p.category.toLowerCase().includes(query)
      );
    }

    if (filters.statusFilter === "solved") {
      filtered = filtered.filter((p) => p.status === "solved");
    } else if (filters.statusFilter === "todo") {
      filtered = filtered.filter(
        (p) => p.status === "unsolved" || p.status === "attempted"
      );
    }

    return filtered;
  }, [filters, problems, searchQuery]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setFilters((prev) => ({ ...prev, category }));
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
              Practice Problems
            </h1>
            <p className="text-gray-600">
              Master AI/ML concepts through hands-on challenges
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <select
                  value={filters.level}
                  onChange={(e) =>
                    setFilters({ ...filters, level: e.target.value })
                  }
                  className="appearance-none bg-white px-4 py-2.5 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-pointer"
                >
                  <option>All Levels</option>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              <div className="relative">
                <select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                  className="appearance-none bg-white px-4 py-2.5 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-pointer"
                >
                  <option>All Categories</option>
                  <option>Supervised Learning</option>
                  <option>Deep Learning</option>
                  <option>NLP</option>
                  <option>Computer Vision</option>
                  <option>Reinforcement Learning</option>
                  <option>Unsupervised Learning</option>
                </select>
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              <div className="ml-auto text-sm text-gray-600 font-medium">
                {filteredProblems.length} problems
              </div>
            </div>
          </div>

          <div className="mb-6">
            <SearchBar onSearch={setSearchQuery} />
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setFilters({ ...filters, statusFilter: "all" })}
              className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
                filters.statusFilter === "all"
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              All Problems
            </button>
            <button
              onClick={() => setFilters({ ...filters, statusFilter: "todo" })}
              className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
                filters.statusFilter === "todo"
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              To Do
            </button>
            <button
              onClick={() => setFilters({ ...filters, statusFilter: "solved" })}
              className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
                filters.statusFilter === "solved"
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Solved
            </button>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading problems...</p>
              </div>
            </div>
          ) : (
            <ProblemsTable
              problems={filteredProblems}
              onProblemClick={(id) => console.log("Navigate to problem:", id)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
