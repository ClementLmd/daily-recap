import { createSlice } from "@reduxjs/toolkit";
import { ActivitiesState } from "./types";
import {
  fetchActivities,
  addActivity,
  saveProgress,
  deleteActivity,
  deleteProgress,
} from "./activities.thunks";

export interface Activity {
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

const initialState: ActivitiesState = {
  activities: [],
  loading: false,
  error: null,
};

export const activitiesSlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    incrementCount: (state, action) => {
      const activity = state.activities.find((cat) => cat._id === action.payload);
      if (activity) {
        activity.tempCount += 1;
        // Store updated temp count in localStorage
        const storedTempCounts = JSON.parse(localStorage.getItem("tempCounts") || "{}");
        storedTempCounts[activity._id] = activity.tempCount;
        localStorage.setItem("tempCounts", JSON.stringify(storedTempCounts));
      }
    },
    decrementCount: (state, action) => {
      const activity = state.activities.find((cat) => cat._id === action.payload);
      if (activity) {
        activity.tempCount = Math.max(0, activity.tempCount - 1);
        // Store updated temp count in localStorage
        const storedTempCounts = JSON.parse(localStorage.getItem("tempCounts") || "{}");
        storedTempCounts[activity._id] = activity.tempCount;
        localStorage.setItem("tempCounts", JSON.stringify(storedTempCounts));
      }
    },
    setCount: (state, action) => {
      const activity = state.activities.find((cat) => cat._id === action.payload.activityId);
      if (activity) {
        activity.tempCount = Math.max(0, action.payload.value);
        // Store updated temp count in localStorage
        const storedTempCounts = JSON.parse(localStorage.getItem("tempCounts") || "{}");
        storedTempCounts[activity._id] = activity.tempCount;
        localStorage.setItem("tempCounts", JSON.stringify(storedTempCounts));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch activities
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch activities";
      })
      // Add activity
      .addCase(addActivity.fulfilled, (state, action) => {
        if (action.payload) {
          state.activities.push(action.payload);
        }
      })
      // Save progress
      .addCase(saveProgress.fulfilled, (state, action) => {
        const activity = state.activities.find((cat) => cat._id === action.payload.activityId);
        if (activity) {
          // Update with the new count from the backend
          activity.count = action.payload.count;
          activity.tempCount = 0;
          activity.progress.push({
            value: action.payload.count,
            date: new Date().toISOString(),
            notes: action.payload.notes,
          });
          // Clear the temp count from localStorage
          const storedTempCounts = JSON.parse(localStorage.getItem("tempCounts") || "{}");
          delete storedTempCounts[activity._id];
          localStorage.setItem("tempCounts", JSON.stringify(storedTempCounts));
        }
      })
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.activities = state.activities.filter((cat) => cat._id !== action.payload);
      })
      .addCase(deleteProgress.fulfilled, (state, action) => {
        const updatedActivity = action.payload;
        if (updatedActivity && updatedActivity._id) {
          const activity = state.activities.find((cat) => cat._id === updatedActivity._id);
          if (activity) {
            activity.count = updatedActivity.count;
            activity.progress = updatedActivity.progress;
          }
        }
      });
  },
});

export const { incrementCount, decrementCount, setCount } = activitiesSlice.actions;

export default activitiesSlice.reducer;
