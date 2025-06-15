import { ProgressEntry } from "../../store/types";

interface ActivityStatsProps {
  totalCount: number;
  progress: ProgressEntry[];
}

export default function ActivityStats({ totalCount, progress }: ActivityStatsProps) {
  const lastWeekCount = progress
    .filter((entry) => {
      const entryDate = new Date(entry.date);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return entryDate >= oneWeekAgo;
    })
    .reduce((sum, entry) => sum + entry.value, 0);

  const lastMonthCount = progress
    .filter((entry) => {
      const entryDate = new Date(entry.date);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return entryDate >= oneMonthAgo;
    })
    .reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900">Total Count</h3>
        <p className="text-3xl font-bold text-indigo-600">{totalCount}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900">Last 7 Days</h3>
        <p className="text-3xl font-bold text-indigo-600">{lastWeekCount}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900">Last 30 Days</h3>
        <p className="text-3xl font-bold text-indigo-600">{lastMonthCount}</p>
      </div>
    </div>
  );
}
