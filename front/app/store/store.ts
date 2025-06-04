import { configureStore } from "@reduxjs/toolkit";
import categoriesReducer from "./categoriesSlice";
import authReducer from "./authSlice";
import { CategoriesState } from "./types";

const initialState: CategoriesState = {
  categories: [],
  loading: false,
  error: null,
};

// Load persisted states from localStorage
const loadPersistedState = () => {
  if (typeof window === "undefined") {
    return {
      auth: undefined,
      categories: initialState,
    };
  }

  try {
    const persistedAuth = localStorage.getItem("authState");
    const persistedCategories = localStorage.getItem("categoriesState");

    let authState = persistedAuth ? JSON.parse(persistedAuth) : undefined;
    const categoriesState = persistedCategories ? JSON.parse(persistedCategories) : undefined;

    // Only restore auth if we have both user and csrfToken
    if (authState && !(authState.user && authState.csrfToken)) {
      authState = undefined;
    }

    return {
      auth: authState,
      categories: categoriesState || initialState,
    };
  } catch (error) {
    console.error("Error loading persisted state:", error);
    return {
      auth: undefined,
      categories: initialState,
    };
  }
};

const makeStore = () => {
  const persistedState = loadPersistedState();

  return configureStore({
    reducer: {
      categories: categoriesReducer,
      auth: authReducer,
    },
    preloadedState: persistedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

// Create the store instance
const store = makeStore();

// Subscribe to store changes to persist states
if (typeof window !== "undefined") {
  store.subscribe(() => {
    try {
      const state = store.getState();

      // Persist auth state
      if (state.auth.user && state.auth.csrfToken) {
        localStorage.setItem("authState", JSON.stringify(state.auth));
        // Only persist categories when user is authenticated
        localStorage.setItem("categoriesState", JSON.stringify(state.categories));
      } else {
        // Clear both auth and categories when user is not authenticated
        localStorage.removeItem("authState");
        localStorage.removeItem("categoriesState");
      }
    } catch (error) {
      console.error("Error persisting state:", error);
    }
  });
}

export { store };

// Infer the type of makeStore
export type AppStore = typeof store;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
