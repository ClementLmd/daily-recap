"use client";

import { useParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import ProgressTable from "../../components/activities/ProgressTable";
import ProgressGraph from "../../components/activities/ProgressGraph";
import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchActivities } from "../../store/activities.thunks";
import ActivityStats from "../../components/activities/ActivityStats";

export default function CategoryPage() {
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const activityName = decodeURIComponent(params.name as string);
  const [viewMode, setViewMode] = useState<"table" | "graph">("table");

  // Fetch latest data when page loads
  useEffect(() => {
    dispatch(fetchActivities());
  }, [dispatch]);

  const activity = useSelector((state: RootState) =>
    state.activities.activities.find((act) => act.name === activityName),
  );

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Activity Not Found</h1>
          <Link
            href="/dashboard"
            className="block text-center text-blue-600 hover:text-blue-800 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{activity.name}</h1>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 hover:underline">
            ← Back
          </Link>
        </div>

        <div className="space-y-6">
          <ActivityStats totalCount={activity.count} progress={activity.progress} />

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Progress History</h2>
                  <p className="text-sm text-gray-500">Total entries: {activity.progress.length}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`px-4 py-2 rounded-md ${
                      viewMode === "table"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode("graph")}
                    className={`px-4 py-2 rounded-md ${
                      viewMode === "graph"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Graph
                  </button>
                </div>
              </div>
            </div>

            {viewMode === "table" ? (
              <ProgressTable progress={activity.progress} activityName={activity.name} />
            ) : (
              <ProgressGraph progress={activity.progress} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
