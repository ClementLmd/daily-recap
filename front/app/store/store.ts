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
    if (persistedState) {
      try {
        const parsedState = JSON.parse(persistedState);
        // Only restore if we have both user and csrfToken
        if (parsedState.user && parsedState.csrfToken) {
          return parsedState;
        }
      } catch (e) {
        console.error("Failed to parse persisted auth state:", e);
      }
    }
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
    // Only persist if we have both user and csrfToken
    if (state.auth.user && state.auth.csrfToken) {
      localStorage.setItem("authState", JSON.stringify(state.auth));
    } else {
      localStorage.removeItem("authState");
    }
  });
}

export { store };

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
