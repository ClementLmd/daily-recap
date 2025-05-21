import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import {
  fetchCategories,
  incrementCount,
  decrementCount,
  setCount,
  saveProgress,
} from "../store/categoriesSlice";
import Link from "next/link";

export default function CategoryList() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading, error } = useSelector(
    (state: RootState) => state.categories
  );

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  if (loading) {
    return <div className="text-center py-8">Loading categories...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">
          No categories yet. Add some categories to get started!
        </p>
      </div>
    );
  }

  const handleIncrement = (categoryId: string) => {
    dispatch(incrementCount(categoryId));
  };

  const handleDecrement = (categoryId: string) => {
    dispatch(decrementCount(categoryId));
  };

  const handleCountChange = (categoryId: string, value: number) => {
    dispatch(setCount({ categoryId, value }));
  };

  const handleDone = async (categoryId: string) => {
    const category = categories.find((cat) => cat._id === categoryId);
    if (category) {
      await dispatch(saveProgress({ categoryId, count: category.tempCount }));
    }
  };

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <div
          key={category._id}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <Link
              href={`/category/${encodeURIComponent(category.name)}`}
              className="text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline"
            >
              {category.name}
            </Link>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Total: {category.count}
              </span>
              <span className="text-sm text-gray-500">
                Today: {category.tempCount}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-4">
            <button
              onClick={() => handleDecrement(category._id)}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              -
            </button>

            <input
              type="number"
              min="0"
              value={category.tempCount}
              onChange={(e) =>
                handleCountChange(category._id, parseInt(e.target.value) || 0)
              }
              className="w-20 px-2 py-1 text-center text-gray-800 border border-gray-300 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />

            <button
              onClick={() => handleIncrement(category._id)}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              +
            </button>

            <button
              onClick={() => handleDone(category._id)}
              className="ml-auto px-4 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
