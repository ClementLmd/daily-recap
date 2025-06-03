import { createSlice } from "@reduxjs/toolkit";
import { CategoriesState } from "./types";
import { fetchCategories, addCategory, saveProgress, deleteCategory } from "./categories.thunks";

export interface Category {
  _id: string;
  name: string;
  count: number;
  tempCount: number; // Temporary count before saving
  progress: ProgressEntry[];
}

export interface ProgressEntry {
  value: number;
  date: string;
  notes?: string;
}

const initialState: CategoriesState = {
  categories: [],
  loading: false,
  error: null,
};

export const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    incrementCount: (state, action) => {
      const category = state.categories.find((cat) => cat._id === action.payload);
      if (category) {
        category.tempCount += 1;
        // Store updated temp count in localStorage
        const storedTempCounts = JSON.parse(localStorage.getItem("tempCounts") || "{}");
        storedTempCounts[category._id] = category.tempCount;
        localStorage.setItem("tempCounts", JSON.stringify(storedTempCounts));
      }
    },
    decrementCount: (state, action) => {
      const category = state.categories.find((cat) => cat._id === action.payload);
      if (category) {
        category.tempCount = Math.max(0, category.tempCount - 1);
        // Store updated temp count in localStorage
        const storedTempCounts = JSON.parse(localStorage.getItem("tempCounts") || "{}");
        storedTempCounts[category._id] = category.tempCount;
        localStorage.setItem("tempCounts", JSON.stringify(storedTempCounts));
      }
    },
    setCount: (state, action) => {
      const category = state.categories.find((cat) => cat._id === action.payload.categoryId);
      if (category) {
        category.tempCount = Math.max(0, action.payload.value);
        // Store updated temp count in localStorage
        const storedTempCounts = JSON.parse(localStorage.getItem("tempCounts") || "{}");
        storedTempCounts[category._id] = category.tempCount;
        localStorage.setItem("tempCounts", JSON.stringify(storedTempCounts));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch categories";
      })
      // Add category
      .addCase(addCategory.fulfilled, (state, action) => {
        if (action.payload) {
          state.categories.push(action.payload);
        }
      })
      // Save progress
      .addCase(saveProgress.fulfilled, (state, action) => {
        const category = state.categories.find((cat) => cat._id === action.payload.categoryId);
        if (category) {
          // Update with the new count from the backend
          category.count = action.payload.count;
          category.tempCount = 0;
          category.progress.push({
            value: action.payload.count,
            date: new Date().toISOString(),
            notes: action.payload.notes,
          });
          // Clear the temp count from localStorage
          const storedTempCounts = JSON.parse(localStorage.getItem("tempCounts") || "{}");
          delete storedTempCounts[category._id];
          localStorage.setItem("tempCounts", JSON.stringify(storedTempCounts));
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((cat) => cat._id !== action.payload);
      });
  },
});

export const { incrementCount, decrementCount, setCount } = categoriesSlice.actions;

export default categoriesSlice.reducer;
