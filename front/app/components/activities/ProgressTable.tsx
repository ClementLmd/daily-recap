import { useDispatch } from "react-redux";
import { deleteProgress } from "../../store/activities.thunks";
import { ProgressEntry } from "../../store/types";
import { AppDispatch } from "../../store/store";

interface ProgressTableProps {
  progress: ProgressEntry[];
  activityName: string;
}

export default function ProgressTable({ progress, activityName }: ProgressTableProps) {
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = async (index: number) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      const actualIndex = progress.length - 1 - index;
      await dispatch(deleteProgress({ activityName, progressIndex: actualIndex }));
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Count
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notes
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {[...progress].reverse().map((entry, index) => (
            <tr key={entry.date}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(entry.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.value}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{entry.notes}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => handleDelete(index)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
