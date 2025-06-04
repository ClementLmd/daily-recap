"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "../../store/hooks";
import { ROUTES, isPublicPath, getLoginUrl } from "../../config/routes";

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!loading) {
      // If not authenticated and trying to access protected route
      if (!isAuthenticated && !isPublicPath(pathname)) {
        router.replace(getLoginUrl(pathname));
      }
      // If authenticated and trying to access public routes (home, login, register)
      else if (isAuthenticated && isPublicPath(pathname)) {
        router.replace(ROUTES.DASHBOARD);
      }
    }
  }, [isAuthenticated, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}
