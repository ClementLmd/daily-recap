import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../services/api";

export interface Category {
  _id: string;
  name: string;
  count: number;
  tempCount: number; // Temporary count before saving
}

export interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async () => {
    const response = await api.getCategories();
    return response.data.map((cat) => ({
      _id: cat._id,
      name: cat.name,
      count: cat.count,
      tempCount: 0,
    }));
  }
);

export const addCategory = createAsyncThunk(
  "categories/addCategory",
  async (name: string) => {
    const response = await api.addCategory(name);
    return {
      ...response.data,
      tempCount: 0,
    };
  }
);

export const saveProgress = createAsyncThunk(
  "categories/saveProgress",
  async ({ categoryId, count }: { categoryId: string; count: number }) => {
    await api.addProgress(categoryId, count);
    return { categoryId, count };
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (categoryId: string) => {
    await api.deleteCategory(categoryId);
    return categoryId;
  }
);

export const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    incrementCount: (state, action) => {
      const category = state.categories.find(
        (cat) => cat._id === action.payload
      );
      if (category) {
        category.tempCount += 1;
      }
    },
    decrementCount: (state, action) => {
      const category = state.categories.find(
        (cat) => cat._id === action.payload
      );
      if (category) {
        category.tempCount = Math.max(0, category.tempCount - 1);
      }
    },
    setCount: (state, action) => {
      const category = state.categories.find(
        (cat) => cat._id === action.payload.categoryId
      );
      if (category) {
        category.tempCount = Math.max(0, action.payload.value);
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
        state.categories.push(action.payload);
      })
      // Save progress
      .addCase(saveProgress.fulfilled, (state, action) => {
        const category = state.categories.find(
          (cat) => cat._id === action.payload.categoryId
        );
        if (category) {
          category.count += action.payload.count;
          category.tempCount = 0;
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (cat) => cat._id !== action.payload
        );
      });
  },
});

export const { incrementCount, decrementCount, setCount } =
  categoriesSlice.actions;

export default categoriesSlice.reducer;
