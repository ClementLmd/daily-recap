import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../services/api";
import { Category, SaveProgressPayload } from "./types";

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async () => {
    const response = await api.getCategories();
    // Get stored temp counts from localStorage
    const storedTempCounts = JSON.parse(
      localStorage.getItem("tempCounts") || "{}"
    );

    return response.data.map((cat) => ({
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
  async (name: string) => {
    const response = await api.addCategory(name);
    return {
      ...response.data,
      count: 0,
      tempCount: 0,
      progress: [],
    };
  }
);

export const saveProgress = createAsyncThunk(
  "categories/saveProgress",
  async ({ categoryId, count, notes }: SaveProgressPayload) => {
    await api.addProgress(categoryId, count, notes);
    return { categoryId, count, notes };
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (categoryId: string) => {
    await api.deleteCategory(categoryId);
    return categoryId;
  }
);
