"use client";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import ActivityForm from "../components/activities/ActivityForm";
import ActivityList from "../components/activities/ActivityList";
import { useRouter } from "next/navigation";
import { logout } from "../store/auth.thunks";
import { addActivity } from "../store/activities.thunks";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading } = useAppSelector((state) => state.auth);

  const handleAddActivity = (activityName: string) => {
    dispatch(addActivity(activityName));
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      router.push("/login");
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <ActivityForm onSubmit={handleAddActivity} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <ActivityList />
          </div>
        </div>
      </div>
    </div>
  );
}
