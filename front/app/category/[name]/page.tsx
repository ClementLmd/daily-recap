"use client";

import { useAppSelector } from "../../store/hooks";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function CategoryDetail() {
  const params = useParams();
  const categoryName = decodeURIComponent(params.name as string);
  const categories = useAppSelector((state) => state.categories.categories);
  const category = categories.find((cat) => cat.name === categoryName);

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Category Not Found
          </h1>
          <Link
            href="/"
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
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            ← Back
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">
                Total Count
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {category.count}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">
                Today&apos;s Count
              </span>
              <span className="text-2xl font-bold text-green-600">
                {category.tempCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
