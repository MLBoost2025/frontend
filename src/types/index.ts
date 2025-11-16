export interface Problem {
  id: string;
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
