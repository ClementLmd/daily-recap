import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { incrementCount, decrementCount, setCount } from "../../store/activitiesSlice";
import Link from "next/link";
import { deleteActivity, fetchActivities, saveProgress } from "../../store/activities.thunks";
import { isDateInRange } from "../../utils/dateUtils";
import { Activity, ProgressEntry } from "@/app/store/types";

export default function ActivityList() {
  const dispatch = useDispatch<AppDispatch>();
  const { activities, loading, error } = useSelector((state: RootState) => state.activities);

  const getTodayCount = (activity: Activity) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return (
      activity.progress?.reduce((sum: number, entry: ProgressEntry) => {
        const entryDate = new Date(entry.date);
        return isDateInRange(entryDate, todayStart, now) ? sum + entry.value : sum;
      }, 0) || 0
    );
  };

  useEffect(() => {
    dispatch(fetchActivities());
  }, [dispatch]);

  if (loading) {
    return <div className="text-center py-8">Loading activities...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">
          No activities yet. Add some activities to get started!
        </p>
      </div>
    );
  }

  const handleIncrement = (activityId: string) => {
    dispatch(incrementCount(activityId));
  };

  const handleDecrement = (activityId: string) => {
    dispatch(decrementCount(activityId));
  };

  const handleCountChange = (activityId: string, value: number) => {
    dispatch(setCount({ activityId, value }));
  };

  const handleDone = async (activityId: string) => {
    const activity = activities.find((cat) => cat._id === activityId);
    if (activity && activity.tempCount > 0) {
      const notesInput = document.getElementById(`notes-${activityId}`) as HTMLInputElement;
      const notes = notesInput?.value || "";
      await dispatch(saveProgress({ activityId, count: activity.tempCount, notes }));
      // Clear the notes input
      if (notesInput) {
        notesInput.value = "";
      }
    }
  };

  const handleDelete = async (activityId: string) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      await dispatch(deleteActivity(activityId));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, activityId: string) => {
    if (e.key === "Enter") {
      handleDone(activityId);
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity._id}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <Link
              href={`/activity/${encodeURIComponent(activity.name)}`}
              className="text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline"
            >
              {activity.name}
            </Link>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Total: {activity.count}</span>
              <span className="text-sm text-gray-500">Today: {getTodayCount(activity)}</span>
              <button
                onClick={() => handleDelete(activity._id)}
                className="ml-2 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                title="Delete activity"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleDecrement(activity._id)}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                -
              </button>

              <input
                type="number"
                min="0"
                value={activity.tempCount}
                onChange={(e) => handleCountChange(activity._id, parseInt(e.target.value) || 0)}
                onKeyDown={(e) => handleKeyDown(e, activity._id)}
                className="w-20 px-3 py-2 text-center text-gray-800 bg-white border-2 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />

              <button
                onClick={() => handleIncrement(activity._id)}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                +
              </button>

              <button
                onClick={() => handleDone(activity._id)}
                disabled={activity.tempCount === 0}
                className="ml-auto px-4 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Done
              </button>
            </div>

            <input
              id={`notes-${activity._id}`}
              type="text"
              placeholder="Add notes (optional)"
              onKeyDown={(e) => handleKeyDown(e, activity._id)}
              className="w-full px-4 py-2 text-sm text-gray-800 bg-white border-2 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 placeholder-gray-400"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
