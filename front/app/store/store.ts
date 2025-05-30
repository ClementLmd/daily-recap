import { configureStore } from "@reduxjs/toolkit";
import categoriesReducer from "./categoriesSlice";
import authReducer from "./authSlice";
import { CategoriesState } from "./types";

const initialState: CategoriesState = {
  categories: [],
  loading: false,
  error: null,
};

// Load persisted auth state from localStorage
const loadAuthState = () => {
  if (typeof window !== "undefined") {
    const persistedState = localStorage.getItem("authState");
    return persistedState ? JSON.parse(persistedState) : undefined;
  }
  return undefined;
};

const makeStore = () => {
  return configureStore({
    reducer: {
      categories: categoriesReducer,
      auth: authReducer,
    },
    preloadedState: {
      categories: initialState,
      auth: loadAuthState(),
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
    devTools: process.env.NODE_ENV !== "production",
  });
};

// Create the store instance
const store = makeStore();

// Subscribe to store changes to persist auth state
if (typeof window !== "undefined") {
  store.subscribe(() => {
    const state = store.getState();
    localStorage.setItem("authState", JSON.stringify(state.auth));
  });
}

export { store };

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
