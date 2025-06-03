import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  csrfToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  csrfToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Helper function to clear auth state
const clearAuthState = () => {
  // Clear CSRF token cookie
  document.cookie =
    "csrf-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=none";
  // Clear session cookie
  document.cookie =
    "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=none";
  return initialState;
};

// Async thunks
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
  const state = getState() as { auth: AuthState };
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
      .addCase(logout.fulfilled, (state) => {
        return clearAuthState();
      })
      .addCase(logout.rejected, (state) => {
        // Even if logout fails, clear the state
        return clearAuthState();
      })
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
      .addCase(checkSession.rejected, (state) => {
        return clearAuthState();
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
