"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown"; // New dependency
import { Toaster, toast } from "react-hot-toast"; // New dependency
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "@/context/AuthContext"; // Use global auth
import {
  fetchProblemBySlug,
  submitSolution,
  ProblemDetail,
  SubmissionResult,
} from "@/lib/api";

export default function ProblemSolvePage() {
  const { slug } = useParams();
  const { token } = useAuth(); // Get real token
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState<SubmissionResult | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "submissions">("description");

  useEffect(() => {
    if (slug) {
      fetchProblemBySlug(slug as string)
        .then((data) => {
          setProblem(data);
          // Set default code template based on language if available
          setCode("# Write your Python solution here\n# Use 'solution' function usually\n\ndef solve(X, y):\n    return []");
        })
        .catch(() => toast.error("Failed to load problem"));
    }
  }, [slug]);

  const handleSubmit = async () => {
    if (!problem) return;
    if (!token) {
      toast.error("Please login to submit");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Evaluating solution...");

    try {
      const result = await submitSolution(problem._id, code, 71, token);
      setOutput(result);
      
      if (result.status === "Accepted") {
        toast.success("Solution Accepted!", { id: toastId });
      } else {
        toast.error(`Failed: ${result.status}`, { id: toastId });
      }
    } catch (e) {
      console.error(e);
      toast.error("Submission error", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!problem) return <div className="flex h-screen items-center justify-center text-gray-500">Loading Workspace...</div>;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Toaster position="top-right" />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-60" : "ml-0"}`}>
        <Navbar isSidebarOpen={isSidebarOpen} />

        <div className="flex-1 flex mt-16 h-[calc(100vh-64px)]">
          {/* Left Panel: Problem & Tabs */}
          <div className="w-5/12 flex flex-col bg-white border-r border-gray-200">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button 
                onClick={() => setActiveTab("description")}
                className={`px-4 py-3 text-sm font-medium ${activeTab === "description" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                Description
              </button>
              <button 
                 onClick={() => setActiveTab("submissions")}
                 className={`px-4 py-3 text-sm font-medium ${activeTab === "submissions" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                Submissions
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "description" ? (
                <>
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">{problem.title}</h1>
                    <div className="flex gap-2 mt-3">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                        problem.difficulty === "Easy" ? "bg-green-100 text-green-800" : 
                        problem.difficulty === "Medium" ? "bg-yellow-100 text-yellow-800" : 
                        "bg-red-100 text-red-800"
                      }`}>
                        {problem.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Markdown Rendered Description */}
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <ReactMarkdown>{problem.description || "No description provided."}</ReactMarkdown>
                  </div>

                  {/* Examples */}
                  {problem.sampleTestCases?.map((tc, idx) => (
                    <div key={idx} className="mt-8 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 font-medium text-xs text-gray-500 uppercase">
                        Example {idx + 1}
                      </div>
                      <div className="p-4 space-y-3 text-sm font-mono">
                        <div>
                          <span className="text-gray-500 select-none">Input:</span> 
                          <div className="mt-1 p-2 bg-white border rounded text-gray-800">{tc.input}</div>
                        </div>
                        <div>
                          <span className="text-gray-500 select-none">Output:</span>
                          <div className="mt-1 p-2 bg-white border rounded text-gray-800">{tc.output}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center text-gray-500 mt-10">
                  <p>No past submissions yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Editor & Console */}
          <div className="w-7/12 flex flex-col bg-[#1e1e1e]">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3e3e3e]">
              <div className="flex items-center gap-2">
                <span className="text-gray-300 text-xs font-medium px-2 py-1 bg-[#333] rounded">Python 3.10</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-5 py-1.5 rounded-md text-sm font-semibold transition-all ${
                  isSubmitting
                    ? "bg-gray-600 cursor-not-allowed opacity-70"
                    : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-900/20"
                }`}
              >
                {isSubmitting ? "Running..." : "Submit Solution"}
              </button>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 relative">
              <Editor
                height="100%"
                defaultLanguage="python"
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16 }
                }}
              />
            </div>

            {/* Interactive Console */}
            {output && (
              <div className="h-1/3 bg-[#1e1e1e] border-t border-[#3e3e3e] flex flex-col">
                <div className="px-4 py-2 bg-[#252526] border-b border-[#3e3e3e] flex justify-between items-center">
                  <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Console Output</span>
                  <button onClick={() => setOutput(null)} className="text-gray-500 hover:text-white text-xs">Close</button>
                </div>
                <div className="p-4 overflow-auto font-mono text-sm">
                  {output.status === "Accepted" ? (
                    <div className="space-y-2">
                      <div className="text-green-400 font-bold flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        Accepted
                      </div>
                      <div className="text-gray-400 text-xs">Runtime: {output.runtime}ms</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                       <div className="text-red-400 font-bold flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                        {output.status}
                      </div>
                      {output.errorMessage && (
                        <div className="p-3 bg-red-900/20 text-red-200 rounded border border-red-900/50 whitespace-pre-wrap">
                          {output.errorMessage}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}