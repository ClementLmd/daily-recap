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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <div className="text-center text-gray-600">
          <p>Checking your session...</p>
          <p className="text-sm mt-2">
            Our backend is hosted on a free tier, so it may take up to 30 seconds to wake up.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
