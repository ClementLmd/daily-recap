import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Add paths that don't require authentication
const publicPaths = ["/", "/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session");
  const csrfToken = request.cookies.get("csrf-token");

  // Allow access to public paths
  if (publicPaths.includes(pathname)) {
    // If user is already authenticated and tries to access login/register, redirect to dashboard
    if (sessionCookie && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Check for session cookie
  if (!sessionCookie) {
    // Redirect to login with the current path as the "from" parameter
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
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

  // Add a response header to indicate the request is authenticated
  const response = NextResponse.next();
  response.headers.set("x-auth-status", "authenticated");
  return response;
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
