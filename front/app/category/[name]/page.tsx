"use client";

import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import ProgressTable from "../../components/ProgressTable";
import Link from "next/link";

export default function CategoryPage() {
  const params = useParams();
  const categoryName = decodeURIComponent(params.name as string);

  const category = useSelector((state: RootState) =>
    state.categories.categories.find((cat) => cat.name === categoryName)
  );

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Category Not Found
          </h1>
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
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            ← Back
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Total Count
              </h2>
              <p className="text-3xl font-bold text-blue-600">
                {category.count}
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Today&apos;s Count
              </h2>
              <p className="text-3xl font-bold text-green-600">
                {category.tempCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Progress History
            </h2>
            <p className="text-sm text-gray-500">
              Total entries: {category.progress.length}
            </p>
          </div>

          <ProgressTable progress={category.progress} />
        </div>
      </div>
    </div>
  );
}
