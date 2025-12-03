"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Editor from "@monaco-editor/react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import {
  fetchProblemBySlug,
  submitSolution,
  ProblemDetail,
  SubmissionResult,
} from "@/lib/api";

export default function ProblemSolvePage() {
  const { slug } = useParams();
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [code, setCode] = useState(
    "# Write your Python solution here\n\ndef solve():\n    pass"
  );
  const [output, setOutput] = useState<SubmissionResult | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Closed by default for more coding space
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProblemBySlug(slug as string)
        .then(setProblem)
        .catch(console.error);
    }
  }, [slug]);

  const handleSubmit = async () => {
    if (!problem) return;

    setIsSubmitting(true);
    // TODO: Get real token from AuthContext
    const token = localStorage.getItem("accessToken") || "";

    try {
      const result = await submitSolution(problem._id, code, 71, token); // 71 is Python
      setOutput(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!problem) return <div className="p-10">Loading Problem...</div>;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "ml-60" : "ml-0"
        }`}
      >
        <Navbar isSidebarOpen={isSidebarOpen} />

        <div className="flex-1 flex mt-16 h-[calc(100vh-64px)]">
          {/* Left Panel: Problem Description */}
          <div className="w-2/5 p-6 overflow-y-auto bg-white border-r border-gray-200">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {problem.title}
              </h1>
              <div className="flex gap-2 mt-2">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    problem.difficulty === "Easy"
                      ? "bg-green-100 text-green-800"
                      : problem.difficulty === "Medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {problem.difficulty}
                </span>
                {problem.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="prose max-w-none text-gray-700">
              <p className="whitespace-pre-wrap">{problem.description}</p>
            </div>

            {/* Sample Test Cases Display */}
            {problem.sampleTestCases?.map((tc, idx) => (
              <div key={idx} className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-sm text-gray-900 mb-2">
                  Example {idx + 1}
                </h3>
                <div className="space-y-2 text-sm font-mono">
                  <div>
                    <span className="text-gray-500">Input:</span> {tc.input}
                  </div>
                  <div>
                    <span className="text-gray-500">Output:</span> {tc.output}
                  </div>
                  {tc.explanation && (
                    <div>
                      <span className="text-gray-500">Explanation:</span>{" "}
                      {tc.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right Panel: Code Editor */}
          <div className="w-3/5 flex flex-col bg-[#1e1e1e]">
            <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-[#3e3e3e]">
              <span className="text-gray-300 text-sm">Python 3.8</span>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                  isSubmitting
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {isSubmitting ? "Running..." : "Submit"}
              </button>
            </div>

            <div className="flex-1">
              <Editor
                height="100%"
                defaultLanguage="python"
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                }}
              />
            </div>

            {/* Output Console */}
            {output && (
              <div className="h-48 bg-[#1e1e1e] border-t border-[#3e3e3e] p-4 overflow-y-auto">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">
                  Result
                </h3>
                {output.status === "Accepted" ? (
                  <div className="text-green-400 font-mono text-sm">
                    ✓ Accepted{" "}
                    {typeof output.runtime === "number" && (
                      <span className="text-gray-500 ml-2">
                        Runtime: {output.runtime}s
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-red-400 font-mono text-sm whitespace-pre-wrap">
                    ✗ {output.status}
                    {output.errorMessage && (
                      <div className="mt-2 text-gray-300">
                        {output.errorMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
