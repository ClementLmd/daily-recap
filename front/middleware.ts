import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Add paths that don't require authentication
const publicPaths = ["/", "/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is public
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for authentication
  const session = request.cookies.get("session");
  const csrfToken = request.cookies.get("csrf-token");

  // If no session or CSRF token, redirect to login
  if (!session || !csrfToken) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // For API routes, verify CSRF token
  if (pathname.startsWith("/api/")) {
    const csrfHeader = request.headers.get("x-csrf-token");
    if (!csrfHeader || csrfHeader !== csrfToken.value) {
      return new NextResponse(JSON.stringify({ message: "Invalid CSRF token" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
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
     * - api (API routes are handled by the backend)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|api/).*)",
  ],
};
