"use client";

import { useAppDispatch } from "../store/hooks";
import CategoryForm from "../components/CategoryForm";
import CategoryList from "../components/CategoryList";
import { useEffect, useState } from "react";
import { addCategory } from "../store/thunks";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [csrfToken, setCsrfToken] = useState<string>("");

  useEffect(() => {
    // Fetch CSRF token when component mounts
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}/auth/check`,
          {
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setCsrfToken(data.csrfToken);
        }
      } catch (error) {
        console.error("Failed to fetch CSRF token:", error);
      }
    };

    fetchCsrfToken();
  }, []);

  const handleAddCategory = (categoryName: string) => {
    dispatch(addCategory(categoryName));
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
        }
      );

      if (response.ok) {
        router.push("/");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Daily Activity Tracker
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Logout
          </button>
        </div>

        <CategoryForm onSubmit={handleAddCategory} />

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Categories
          </h2>
          <CategoryList />
        </div>
      </div>
    </div>
  );
}
