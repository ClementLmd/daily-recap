import { useState } from "react";
import { ProgressEntry } from "../../store/types";
import { useAppDispatch } from "../../store/hooks";
import { deleteProgress } from "../../store/categories.thunks";

interface ProgressTableProps {
  progress: ProgressEntry[];
  categoryName: string;
}

export default function ProgressTable({ progress, categoryName }: ProgressTableProps) {
  const dispatch = useAppDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(progress.length / itemsPerPage);

  // Sort progress by date, most recent first
  const sortedProgress = [...progress].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // Get current page items
  const currentItems = sortedProgress.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleDelete = async (displayIndex: number) => {
    // Calculate the actual index in the sorted array
    const actualIndex = (currentPage - 1) * itemsPerPage + displayIndex;

    if (window.confirm("Are you sure you want to delete this progress entry?")) {
      await dispatch(deleteProgress({ categoryName, progressIndex: actualIndex }));
    }
  };

  if (progress.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No progress entries yet. Start tracking your progress to see it here!
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
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
            {currentItems.map((entry, displayIndex) => (
              <tr key={displayIndex}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(entry.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.value}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{entry.notes || "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(displayIndex)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete entry"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
