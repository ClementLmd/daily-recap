import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../services/api";
import { Activity, SaveProgressPayload } from "./types";
import { RootState } from "./store";

export const fetchActivities = createAsyncThunk(
  "activities/fetchActivities",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const response = await api.getActivities(state.auth.csrfToken);
    // Get stored temp counts from localStorage
    const storedTempCounts = JSON.parse(localStorage.getItem("tempCounts") || "{}");

    return (response.apiResponseData.activities || []).map((cat: Activity) => ({
      _id: cat._id,
      name: cat.name,
      count: cat.count,
      tempCount: storedTempCounts[cat._id] || 0,
      progress: cat.progress,
    }));
  },
);

export const addActivity = createAsyncThunk(
  "activities/addActivity",
  async (name: string, { getState }) => {
    const state = getState() as RootState;
    const response = await api.addActivity(name, state.auth.csrfToken);
    if (response.apiResponseData.newActivity) {
      return {
        ...response.apiResponseData.newActivity,
        tempCount: 0,
      };
    }
    return null;
  },
);

export const saveProgress = createAsyncThunk(
  "activities/saveProgress",
  async (payload: SaveProgressPayload, { getState }) => {
    const state = getState() as RootState;
    const response = await api.saveProgress(payload, state.auth.csrfToken);
    return {
      activityId: response.apiResponseData.updatedActivity?._id || payload.activityId,
      count: response.apiResponseData.updatedActivity?.count || 0,
      notes: payload.notes,
    };
  },
);

export const deleteActivity = createAsyncThunk(
  "activities/deleteActivity",
  async (activityId: string, { getState }) => {
    const state = getState() as RootState;
    await api.deleteActivity(activityId, state.auth.csrfToken);
    return activityId;
  },
);

export const deleteProgress = createAsyncThunk(
  "activities/deleteProgress",
  async (payload: { activityName: string; progressIndex: number }, { getState }) => {
    const state = getState() as RootState;
    const response = await api.deleteProgress(
      payload.activityName,
      payload.progressIndex,
      state.auth.csrfToken,
    );
    return response.apiResponseData.updatedActivity;
  },
);
