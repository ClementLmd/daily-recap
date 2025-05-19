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

  useEffect(() => {
    console.log("Current state:", categories);
  }, [categories]);

  const handleAddCategory = (categoryName: string) => {
    console.log("Adding category:", categoryName);
    dispatch(addCategory(categoryName));
  };

  const handleIncrement = (categoryName: string) => {
    console.log("Incrementing:", categoryName);
    dispatch(incrementCount(categoryName));
  };

  const handleDecrement = (categoryName: string) => {
    console.log("Decrementing:", categoryName);
    dispatch(decrementCount(categoryName));
  };

  const handleCountChange = (categoryName: string, value: number) => {
    console.log("Setting count:", { categoryName, value });
    dispatch(setCount({ categoryName, value }));
  };

  const handleDone = (categoryName: string) => {
    console.log("Saving count:", categoryName);
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
