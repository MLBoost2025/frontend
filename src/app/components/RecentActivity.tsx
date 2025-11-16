"use client";

interface ActivityItem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Completed" | "In Progress";
  progress: number;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-50 text-green-700 border border-green-200";
      case "Medium":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "Hard":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
      <div className="space-y-0">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={`border-b border-gray-200 last:border-b-0 p-3 ${
              index % 2 === 0 ? "bg-white" : "bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {activity.title}
                </h3>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${getDifficultyColor(
                      activity.difficulty
                    )}`}
                  >
                    {activity.difficulty}
                  </span>
                  <span className="text-sm text-gray-600">
                    {activity.status}
                  </span>
                </div>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                Continue
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
