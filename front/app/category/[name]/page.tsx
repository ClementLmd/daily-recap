"use client";

import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import ProgressTable from "../../components/ProgressTable";
import ProgressGraph from "../../components/ProgressGraph";
import Link from "next/link";
import { useState } from "react";

export default function CategoryPage() {
  const params = useParams();
  const categoryName = decodeURIComponent(params.name as string);
  const [viewMode, setViewMode] = useState<"table" | "graph">("table");

  const category = useSelector((state: RootState) =>
    state.categories.categories.find((cat) => cat.name === categoryName),
  );

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Category Not Found</h1>
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
          <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 hover:underline">
            ← Back
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Total Count</h2>
              <p className="text-3xl font-bold text-blue-600">{category.count}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Count</h2>
              <p className="text-3xl font-bold text-green-600">{category.tempCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Progress History</h2>
                <p className="text-sm text-gray-500">Total entries: {category.progress.length}</p>
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
            <ProgressTable progress={category.progress} />
          ) : (
            <ProgressGraph progress={category.progress} />
          )}
        </div>
      </div>
    </div>
  );
}
