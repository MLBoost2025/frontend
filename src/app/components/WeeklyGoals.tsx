"use client";

interface Goal {
  title: string;
  current: number;
  target: number;
}

interface WeeklyGoalsProps {
  goals: Goal[];
  title?: string;
}

export default function WeeklyGoals({ goals, title = "Weekly Goals" }: WeeklyGoalsProps) {
  return (
    <section className="card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
        {title}
      </h2>

      <div className="space-y-4">
        {goals.map((goal) => {
          const pct = goal.target > 0 ? Math.min(100, (goal.current / goal.target) * 100) : 0;

          return (
            <article key={goal.title}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {goal.title}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  {goal.current}/{goal.target}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className="h-1.5 rounded-full bg-brand-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
