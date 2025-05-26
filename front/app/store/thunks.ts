import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../services/api";
import { Category, SaveProgressPayload } from "./types";
import { RootState } from "./store";

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const response = await api.getCategories(state.auth.csrfToken);
    // Get stored temp counts from localStorage
    const storedTempCounts = JSON.parse(
      localStorage.getItem("tempCounts") || "{}"
    );

    return (response.apiResponseData.categories || []).map((cat: Category) => ({
      _id: cat._id,
      name: cat.name,
      count: cat.count,
      tempCount: storedTempCounts[cat._id] || 0,
      progress: cat.progress,
    }));
  }
);

export const addCategory = createAsyncThunk(
  "categories/addCategory",
  async (name: string, { getState }) => {
    const state = getState() as RootState;
    const response = await api.addCategory(name, state.auth.csrfToken);
    if (response.apiResponseData.newCategory) {
      return {
        ...response.apiResponseData.newCategory,
        tempCount: 0,
      };
    }
    return null;
  }
);

export const saveProgress = createAsyncThunk(
  "categories/saveProgress",
  async (payload: SaveProgressPayload, { getState }) => {
    const state = getState() as RootState;
    const response = await api.saveProgress(payload, state.auth.csrfToken);
    return {
      categoryId:
        response.apiResponseData.updatedCategory?._id || payload.categoryId,
      count: response.apiResponseData.updatedCategory?.count || 0,
      notes: payload.notes,
    };
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (categoryId: string, { getState }) => {
    const state = getState() as RootState;
    await api.deleteCategory(categoryId, state.auth.csrfToken);
    return categoryId;
  }
);
