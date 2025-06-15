import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { incrementCount, decrementCount, setCount } from "../../store/activitiesSlice";
import { deleteActivity, fetchActivities, saveProgress } from "../../store/activities.thunks";

export default function ActivityList() {
  const dispatch = useDispatch<AppDispatch>();
  const activities = useSelector((state: RootState) => state.activities.activities);
  const loading = useSelector((state: RootState) => state.activities.loading);
  const error = useSelector((state: RootState) => state.activities.error);

  useEffect(() => {
    dispatch(fetchActivities());
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
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
    const activity = activities.find((act) => act._id === activityId);
    if (activity && activity.tempCount > 0) {
      const notesInput = document.getElementById(`notes-${activityId}`) as HTMLInputElement;
      const notes = notesInput?.value || "";
      await dispatch(saveProgress({ activityId, count: activity.tempCount, notes }));
    }
  };

  const handleDelete = async (activityId: string) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      await dispatch(deleteActivity(activityId));
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity._id} className="bg-white shadow rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <a
              href={`/activity/${encodeURIComponent(activity.name)}`}
              className="text-lg font-medium text-gray-900 hover:text-indigo-600"
            >
              {activity.name}
            </a>
            <div className="flex space-x-2">
              <span className="text-sm text-gray-500">Total: {activity.count}</span>
              <span className="text-sm text-gray-500">Today: {activity.tempCount}</span>
              <button
                onClick={() => handleDelete(activity._id)}
                className="text-red-600 hover:text-red-800"
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

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleDecrement(activity._id)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <input
              type="number"
              min="0"
              className="w-20 text-center border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={activity.tempCount}
              onChange={(e) => handleCountChange(activity._id, parseInt(e.target.value) || 0)}
            />

            <button
              onClick={() => handleIncrement(activity._id)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <button
              onClick={() => handleDone(activity._id)}
              disabled={activity.tempCount === 0}
              className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Done
            </button>
          </div>

          <input
            type="text"
            id={`notes-${activity._id}`}
            placeholder="Add notes (optional)"
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      ))}
    </div>
  );
}
