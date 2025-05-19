import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Category {
  name: string;
  count: number;
  tempCount: number; // Temporary count before saving
}

export interface CategoriesState {
  categories: Category[];
}

const initialState: CategoriesState = {
  categories: [],
};

export const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    addCategory: (state, action: PayloadAction<string>) => {
      const categoryName = action.payload;
      if (!state.categories.some((cat) => cat.name === categoryName)) {
        state.categories.push({
          name: categoryName,
          count: 0,
          tempCount: 0,
        });
      }
    },
    incrementCount: (state, action: PayloadAction<string>) => {
      const category = state.categories.find(
        (cat) => cat.name === action.payload
      );
      if (category) {
        category.tempCount += 1;
      }
    },
    decrementCount: (state, action: PayloadAction<string>) => {
      const category = state.categories.find(
        (cat) => cat.name === action.payload
      );
      if (category) {
        category.tempCount = Math.max(0, category.tempCount - 1);
      }
    },
    setCount: (
      state,
      action: PayloadAction<{ categoryName: string; value: number }>
    ) => {
      const category = state.categories.find(
        (cat) => cat.name === action.payload.categoryName
      );
      if (category) {
        category.tempCount = Math.max(0, action.payload.value);
      }
    },
    saveCount: (state, action: PayloadAction<string>) => {
      const category = state.categories.find(
        (cat) => cat.name === action.payload
      );
      if (category) {
        category.count += category.tempCount;
        category.tempCount = 0;
      }
    },
  },
});

export const {
  addCategory,
  incrementCount,
  decrementCount,
  setCount,
  saveCount,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;
