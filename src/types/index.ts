export interface Problem {
  id: string;
  slug?: string; // Added for routing
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  acceptance: number;
  status: "solved" | "attempted" | "unsolved";
  tags: string[];
}

export interface FilterState {
  level: string;
  category: string;
  statusFilter: "all" | "todo" | "solved";
}