import { createAsyncThunk } from "@reduxjs/toolkit";
import { clearAuthState } from "../utils/auth";

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      },
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Login failed");
    }

    const data = await response.json();

    // Store CSRF token in a cookie with proper attributes
    document.cookie = `csrf-token=${data.csrfToken}; path=/; secure; samesite=none`;

    return data;
  },
);

export const logout = createAsyncThunk("auth/logout", async (_, { getState }) => {
  const state = getState() as { auth: { csrfToken: string | null } };
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}/auth/logout`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": state.auth.csrfToken || "",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Logout failed");
  }

  // Clear all auth-related cookies
  clearAuthState();
});

export const checkSession = createAsyncThunk(
  "auth/checkSession",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}/auth/check`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        // If session is invalid, clear auth state
        clearAuthState();
        throw new Error("Session check failed");
      }

      const data = await response.json();

      // Update CSRF token cookie if a new one is provided
      if (data.csrfToken) {
        document.cookie = `csrf-token=${data.csrfToken}; path=/; secure; samesite=none`;
      }

      return data;
    } catch (error) {
      return rejectWithValue("Session check failed");
    }
  },
);
