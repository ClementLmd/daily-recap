import { configureStore } from "@reduxjs/toolkit";
import categoriesReducer, { CategoriesState } from "./categoriesSlice";

const initialState: CategoriesState = {
  categories: [],
  loading: false,
  error: null,
};

const makeStore = () => {
  return configureStore({
    reducer: {
      categories: categoriesReducer,
    },
    preloadedState: {
      categories: initialState,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
    devTools: process.env.NODE_ENV !== "production",
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

// Create the store instance
export const store = makeStore();
