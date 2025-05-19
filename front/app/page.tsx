"use client";

import { useState } from "react";

export default function Home() {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Daily Activity Tracker
        </h1>

        <form onSubmit={handleAddCategory} className="space-y-4">
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Add New Category
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-500"
                placeholder="e.g., Push-ups done"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add
              </button>
            </div>
          </div>
        </form>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Categories
          </h2>
          {categories.length === 0 ? (
            <p className="text-gray-500 text-center">No categories added yet</p>
          ) : (
            <ul className="space-y-2">
              {categories.map((category, index) => (
                <li
                  key={index}
                  className="bg-white p-4 rounded-md shadow-sm border border-gray-200 text-gray-700"
                >
                  {category}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
