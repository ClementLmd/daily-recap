export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  CATEGORY: "/category",
} as const;

// Simple helper to check if a path is public
export const isPublicPath = (path: string): boolean => {
  return path === ROUTES.HOME || path === ROUTES.LOGIN || path === ROUTES.REGISTER;
};

// Simple helper to build login URL with redirect
export const getLoginUrl = (from?: string): string => {
  if (!from || isPublicPath(from)) return ROUTES.LOGIN;
  return `${ROUTES.LOGIN}?from=${encodeURIComponent(from)}`;
};
