import { AuthState } from "../store/types";

const COOKIE_OPTIONS = {
  path: "/",
  expires: new Date(0),
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

export const clearAuthState = () => {
  // Clear CSRF token cookie
  document.cookie = `csrf-token=; ${Object.entries(COOKIE_OPTIONS)
    .map(([key, value]) => `${key}=${value}`)
    .join("; ")}`;

  // Clear session cookie
  document.cookie = `session=; ${Object.entries(COOKIE_OPTIONS)
    .map(([key, value]) => `${key}=${value}`)
    .join("; ")}`;

  return {
    user: null,
    csrfToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  } as AuthState;
};
