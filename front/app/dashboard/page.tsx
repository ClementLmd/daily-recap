"use client";

import { addActivity } from "../store/activities.thunks";
import { useAppDispatch } from "../store/hooks";
import ActivityForm from "../components/activities/ActivityForm";
import ActivityList from "../components/activities/ActivityList";

export default function DashboardPage() {
  const dispatch = useAppDispatch();

  const handleAddActivity = (activityName: string) => {
    dispatch(addActivity(activityName));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Track your daily activities and monitor your progress over time.
          </p>
        </div>

        <div className="mb-8">
          <ActivityForm onSubmit={handleAddActivity} />
        </div>

        <div>
          <ActivityList />
        </div>
      </div>
    </div>
  );
}
