"use client";

interface Goal {
  title: string;
  current: number;
  target: number;
}

interface WeeklyGoalsProps {
  goals: Goal[];
}

export default function WeeklyGoals({ goals }: WeeklyGoalsProps) {
  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Goals</h2>
      <div className="space-y-6">
        {goals.map((goal, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {goal.title}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {goal.current}/{goal.target}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-black rounded-full h-2 transition-all duration-300"
                style={{
                  width: `${getProgressPercentage(goal.current, goal.target)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
