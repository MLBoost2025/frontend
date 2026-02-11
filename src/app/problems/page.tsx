"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { fetchProblems } from "@/lib/api";
import { Problem } from "@/types";
import { Search, Filter, CheckCircle, Circle } from "lucide-react";

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("All");

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchProblems();
        setProblems(data);
      } catch (error) {
        console.error("Failed to load problems");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredProblems = problems.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesDiff = filterDifficulty === "All" || p.difficulty === filterDifficulty;
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={true} onClose={() => {}} />
      <div className="flex-1 ml-60 flex flex-col">
        <Navbar isSidebarOpen={true} />
        
        <main className="flex-1 p-8 mt-16 overflow-y-auto">
          {/* Header & Filters */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Problem Library</h1>
              <p className="text-gray-500 text-sm">Master ML algorithms through practice</p>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search problems..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select 
                className="border rounded-lg px-4 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
              >
                <option value="All">All Levels</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Problem List Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-6">Title</div>
              <div className="col-span-2">Difficulty</div>
              <div className="col-span-3">Tags</div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading library...</div>
            ) : filteredProblems.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No problems found.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredProblems.map((problem) => (
                  <Link 
                    key={problem.id} 
                    href={`/problems/${problem.slug}`}
                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors group cursor-pointer"
                  >
                    <div className="col-span-1 flex justify-center">
                      {problem.status === "solved" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                      )}
                    </div>
                    <div className="col-span-6 font-medium text-gray-900 group-hover:text-blue-600">
                      {problem.title}
                    </div>
                    <div className="col-span-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        problem.difficulty === "Easy" ? "bg-green-100 text-green-700" :
                        problem.difficulty === "Medium" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {problem.difficulty}
                      </span>
                    </div>
                    <div className="col-span-3 flex flex-wrap gap-2">
                      {problem.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}