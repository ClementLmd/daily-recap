import { Category } from "../store/categoriesSlice";
import Link from "next/link";

interface CategoryListProps {
  categories: Category[];
  onIncrement: (categoryName: string) => void;
  onDecrement: (categoryName: string) => void;
  onDone: (categoryName: string) => void;
  onCountChange: (categoryName: string, value: number) => void;
}

export default function CategoryList({
  categories,
  onIncrement,
  onDecrement,
  onDone,
  onCountChange,
}: CategoryListProps) {
  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <div
          key={category.name}
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
              onClick={() => onDecrement(category.name)}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              -
            </button>

            <input
              type="number"
              min="0"
              value={category.tempCount}
              onChange={(e) =>
                onCountChange(category.name, parseInt(e.target.value) || 0)
              }
              className="w-20 px-2 py-1 text-center text-gray-800 border border-gray-300 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />

            <button
              onClick={() => onIncrement(category.name)}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              +
            </button>

            <button
              onClick={() => onDone(category.name)}
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
