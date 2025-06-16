import { configureStore } from "@reduxjs/toolkit";
import activitiesReducer from "./activitiesSlice";
import authReducer from "./authSlice";
import { ActivitiesState } from "./types";

const initialState: ActivitiesState = {
  activities: [],
  loading: false,
  error: null,
};

// Load persisted states from localStorage
const loadPersistedState = () => {
  if (typeof window === "undefined") {
    return {
      auth: undefined,
      activities: initialState,
    };
  }

  try {
    const persistedAuth = localStorage.getItem("authState");
    const persistedActivities = localStorage.getItem("activitiesState");

    let authState = persistedAuth ? JSON.parse(persistedAuth) : undefined;
    const activitiesState = persistedActivities ? JSON.parse(persistedActivities) : undefined;

    // Only restore auth if we have both user and csrfToken
    if (authState && !(authState.user && authState.csrfToken)) {
      authState = undefined;
    }

    return {
      auth: authState,
      activities: activitiesState || initialState,
    };
  } catch (error) {
    console.error("Error loading persisted state:", error);
    return {
      auth: undefined,
      activities: initialState,
    };
  }
};

const makeStore = () => {
  const persistedState = loadPersistedState();

  return configureStore({
    reducer: {
      activities: activitiesReducer,
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
        // Only persist activities when user is authenticated
        localStorage.setItem("activitiesState", JSON.stringify(state.activities));
      } else {
        // Clear both auth and activities when user is not authenticated
        localStorage.removeItem("authState");
        localStorage.removeItem("activitiesState");
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
