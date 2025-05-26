"use client";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import CategoryForm from "../components/CategoryForm";
import CategoryList from "../components/CategoryList";
import { useEffect } from "react";
import { addCategory } from "../store/thunks";
import { useRouter } from "next/navigation";
import { logout, checkSession } from "../store/authSlice";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check session when component mounts
    const checkAuth = async () => {
      try {
        await dispatch(checkSession()).unwrap();
      } catch (error) {
        console.error("Session check failed:", error);
        router.push("/login");
      }
    };
    checkAuth();
  }, [dispatch, router]);

  const handleAddCategory = (categoryName: string) => {
    dispatch(addCategory(categoryName));
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
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

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
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
            <CategoryForm onSubmit={handleAddCategory} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <CategoryList />
          </div>
        </div>
      </div>
    </div>
  );
}
