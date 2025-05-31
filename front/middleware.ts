import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Add paths that don't require authentication
const publicPaths = ["/", "/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session");
  const csrfToken = request.cookies.get("csrf-token");

  // Handle public paths
  if (publicPaths.includes(pathname)) {
    // If user is authenticated and tries to access public routes, redirect to dashboard
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // For protected routes, check authentication
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // For API routes, verify CSRF token
  if (pathname.startsWith("/api/")) {
    const csrfHeader = request.headers.get("x-csrf-token");
    if (!csrfHeader || !csrfToken || csrfHeader !== csrfToken.value) {
      return new NextResponse(
        JSON.stringify({
          status: "error",
          message: "Invalid CSRF token",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
