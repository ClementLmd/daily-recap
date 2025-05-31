import React, { useState } from "react";

interface CategoryFormProps {
  onSubmit: (categoryName: string) => void;
}

export default function CategoryForm({ onSubmit }: CategoryFormProps) {
  const [categoryName, setCategoryName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryName.trim()) {
      onSubmit(categoryName.trim());
      setCategoryName("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">
          New Category
        </label>
        <input
          type="text"
          id="categoryName"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          className="mt-1 block w-full px-4 py-3 text-gray-800 bg-white border-2 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm"
          placeholder="Enter category name"
          maxLength={50}
          required
        />
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Add Category
      </button>
    </form>
  );
}
