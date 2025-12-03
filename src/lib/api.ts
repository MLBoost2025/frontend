import { Problem } from "@/types";

// Update to match your backend port (5001)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// Shape of the problem list response from the backend
interface ProblemApiResponse {
  _id: string;
  slug: string;
  title: string;
  difficulty: Problem["difficulty"];
  tags?: string[];
}

// Shape of a sample test case in the problem detail
export interface SampleTestCase {
  input: string;
  output: string;
  explanation?: string;
}

// Full problem detail returned by GET /problems/:slug
export interface ProblemDetail {
  _id: string;
  slug: string;
  title: string;
  difficulty: Problem["difficulty"];
  tags?: string[];
  description?: string;
  sampleTestCases?: SampleTestCase[];
}

// Result returned by /submissions
export interface SubmissionResult {
  status: string;
  runtime?: number;
  errorMessage?: string;
  // allow extra fields without using `any`
  [key: string]: unknown;
}

export async function fetchProblems(): Promise<Problem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/problems`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Add Authorization header if you implement protected problem lists later
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch problems");
    }

    const data: ProblemApiResponse[] = await response.json();

    // Map Backend Data (MongoDB _id) to Frontend Interface
    return data.map((item: ProblemApiResponse): Problem => ({
      id: item._id, // Map _id to id
      slug: item.slug, // Important for routing
      title: item.title,
      difficulty: item.difficulty,
      // Fallback for fields not yet in backend
      category: item.tags?.[0] || "General",
      acceptance: 0, // Backend doesn't calculate this yet
      status: "unsolved", // Needs user-specific fetch
      tags: item.tags || [],
    }));
  } catch (error) {
    console.error("Error fetching problems:", error);
    return [];
  }
}

export async function fetchProblemBySlug(
  slug: string
): Promise<ProblemDetail> {
  try {
    const response = await fetch(`${API_BASE_URL}/problems/${slug}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to fetch problem");

    const problem: ProblemDetail = await response.json();
    return problem;
  } catch (error) {
    console.error("Error fetching problem:", error);
    throw error;
  }
}

export async function submitSolution(
  problemId: string,
  code: string,
  languageId: number,
  token: string
): Promise<SubmissionResult> {
  const response = await fetch(`${API_BASE_URL}/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Secure submission
    },
    body: JSON.stringify({ problemId, code, languageId }),
  });

  const result: SubmissionResult = await response.json();
  return result;
}
