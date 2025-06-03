import { createSlice } from "@reduxjs/toolkit";
import { AuthState } from "./types";
import { login, logout, checkSession } from "./auth.thunks";
import { clearAuthState } from "../utils/auth";

const initialState: AuthState = {
  user: null,
  csrfToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.csrfToken = action.payload.csrfToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Login failed";
        state.isAuthenticated = false;
        state.user = null;
        state.csrfToken = null;
      })
      // Logout
      .addCase(logout.fulfilled, () => clearAuthState())
      .addCase(logout.rejected, () => clearAuthState())
      // Check Session
      .addCase(checkSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.csrfToken = action.payload.csrfToken;
      })
      .addCase(checkSession.rejected, () => clearAuthState());
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
