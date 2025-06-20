import { getWeekStart, getMonthStart, isDateInRange } from "../../utils/dateUtils";
import { ProgressEntry } from "../../store/types";

interface ActivityStatsProps {
  totalCount: number;
  progress: ProgressEntry[];
}

export default function ActivityStats({ totalCount, progress }: ActivityStatsProps) {
  const now = new Date();
  const weekStart = getWeekStart(now);
  const monthStart = getMonthStart(now);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const todayCount = progress.reduce((sum, entry) => {
    const entryDate = new Date(entry.date);
    return isDateInRange(entryDate, todayStart, now) ? sum + entry.value : sum;
  }, 0);

  const weeklyCount = progress.reduce((sum, entry) => {
    const entryDate = new Date(entry.date);
    return isDateInRange(entryDate, weekStart, now) ? sum + entry.value : sum;
  }, 0);

  const monthlyCount = progress.reduce((sum, entry) => {
    const entryDate = new Date(entry.date);
    return isDateInRange(entryDate, monthStart, now) ? sum + entry.value : sum;
  }, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Total Count</h2>
          <p className="text-3xl font-bold text-blue-600">{totalCount}</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Today&apos;s Count</h2>
          <p className="text-3xl font-bold text-green-600">{todayCount}</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">This Week</h2>
          <p className="text-3xl font-bold text-purple-600">{weeklyCount}</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">This Month</h2>
          <p className="text-3xl font-bold text-orange-600">{monthlyCount}</p>
        </div>
      </div>
    </div>
  );
}
