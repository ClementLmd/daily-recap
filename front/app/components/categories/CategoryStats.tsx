import { getWeekStart, getMonthStart, isDateInRange } from "../../utils/dateUtils";
import { ProgressEntry } from "../../store/types";

interface CategoryStatsProps {
  totalCount: number;
  progress: ProgressEntry[];
}

export default function CategoryStats({ totalCount, progress }: CategoryStatsProps) {
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Total Count</h2>
          <p className="text-3xl font-bold text-blue-600">{totalCount}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Count</h2>
          <p className="text-3xl font-bold text-green-600">{todayCount}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">This Week</h2>
          <p className="text-3xl font-bold text-purple-600">{weeklyCount}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">This Month</h2>
          <p className="text-3xl font-bold text-orange-600">{monthlyCount}</p>
        </div>
      </div>
    </div>
  );
}
