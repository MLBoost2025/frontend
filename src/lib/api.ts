import { Problem } from "@/types";

// Dummy API endpoint - replace with actual backend URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Fetch all problems from the backend
 * @returns Promise with array of problems
 */
export async function fetchProblems(): Promise<Problem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/problems`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch problems");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching problems:", error);
    throw error;
  }
}

/**
 * Fetch a single problem by ID
 * @param problemId - The ID of the problem to fetch
 * @returns Promise with problem details
 */
export async function fetchProblemById(problemId: string): Promise<Problem> {
  try {
    const response = await fetch(`${API_BASE_URL}/problems/${problemId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch problem");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching problem:", error);
    throw error;
  }
}

/**
 * Fetch problems filtered by category
 * @param category - The category to filter by
 * @returns Promise with filtered array of problems
 */
export async function fetchProblemsByCategory(
  category: string
): Promise<Problem[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/problems?category=${encodeURIComponent(category)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch problems by category");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching problems by category:", error);
    throw error;
  }
}

/**
 * Fetch user's problem solving statistics
 * @returns Promise with user statistics
 */
export async function fetchUserStats(): Promise<unknown> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Add authentication token here when implemented
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user stats");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user stats:", error);
    throw error;
  }
}

/**
 * Submit a solution for a problem
 * @param problemId - The ID of the problem
 * @param solution - The solution code
 * @returns Promise with submission result
 */
export async function submitSolution(
  problemId: string,
  solution: string
): Promise<unknown> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/problems/${problemId}/submit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authentication token here when implemented
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ solution }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to submit solution");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error submitting solution:", error);
    throw error;
  }
}

/**
 * Logout user
 * @returns Promise with logout result
 */
export async function logout(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add authentication token here when implemented
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to logout");
    }
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
}
