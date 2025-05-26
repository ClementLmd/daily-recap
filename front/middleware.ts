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
  if (!session) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // For POST, PUT, DELETE requests, verify CSRF token
  if (["POST", "PUT", "DELETE"].includes(request.method)) {
    const csrfToken = request.headers.get("X-CSRF-Token");
    const csrfCookie = request.cookies.get("csrf-token");

    if (!csrfToken || !csrfCookie || csrfToken !== csrfCookie.value) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid CSRF token" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
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
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
