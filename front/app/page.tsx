"use client";

import { useAppDispatch, useAppSelector } from "./store/hooks";
import {
  addCategory,
  incrementCount,
  decrementCount,
  setCount,
  saveCount,
} from "./store/categoriesSlice";
import CategoryForm from "./components/CategoryForm";
import CategoryList from "./components/CategoryList";
import { useEffect } from "react";

export default function Home() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.categories.categories);

  useEffect(() => {}, [categories]);

  const handleAddCategory = (categoryName: string) => {
    dispatch(addCategory(categoryName));
  };

  const handleIncrement = (categoryName: string) => {
    dispatch(incrementCount(categoryName));
  };

  const handleDecrement = (categoryName: string) => {
    dispatch(decrementCount(categoryName));
  };

  const handleCountChange = (categoryName: string, value: number) => {
    dispatch(setCount({ categoryName, value }));
  };

  const handleDone = (categoryName: string) => {
    dispatch(saveCount(categoryName));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Daily Activity Tracker
        </h1>

        <CategoryForm onSubmit={handleAddCategory} />

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Categories
          </h2>
          <CategoryList
            categories={categories}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onDone={handleDone}
            onCountChange={handleCountChange}
          />
        </div>
      </div>
    </div>
  );
}
