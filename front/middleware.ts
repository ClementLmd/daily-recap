import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const csrfToken = request.cookies.get("csrf-token");

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
