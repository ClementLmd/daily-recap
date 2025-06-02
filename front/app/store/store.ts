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
  if (typeof window !== "undefined") {
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
  }
  return {
    auth: undefined,
    categories: initialState,
  };
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
  });
}

export { store };

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
