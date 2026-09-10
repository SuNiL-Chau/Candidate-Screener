import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("screener_session");

  let isAuthenticated = false;
  if (sessionCookie && sessionCookie.value) {
    try {
      const parsed = JSON.parse(sessionCookie.value);
      if (parsed?.email) {
        isAuthenticated = true;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // Protected paths that require authentication
  const isProtectedPath =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname.startsWith("/roles") ||
    pathname.startsWith("/candidates");

  if (isProtectedPath && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and visiting /login, redirect to /dashboard
  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const middleware = proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (/api/*)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
