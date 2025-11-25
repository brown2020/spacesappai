import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ============================================================================
// ROUTE CONFIGURATION
// ============================================================================

/**
 * Public routes - accessible without authentication
 */
const publicRoutes = ["/", "/sign-in(.*)", "/sign-up(.*)", "/api/webhooks(.*)"];

/**
 * Protected routes - require authentication
 */
const protectedRoutes = ["/doc(.*)", "/dashboard(.*)", "/settings(.*)"];

// Create route matchers
const isPublicRoute = createRouteMatcher(publicRoutes);
const isProtectedRoute = createRouteMatcher(protectedRoutes);

// ============================================================================
// MAIN PROXY HANDLER
// ============================================================================

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Skip static assets
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot|map)$/.test(
      pathname
    )
  ) {
    return NextResponse.next();
  }

  // Get authentication state
  const { userId } = await auth();
  const isAuthenticated = !!userId;

  // Protect routes - redirect to sign-in if not authenticated
  if (isProtectedRoute(req) && !isAuthenticated) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect authenticated users away from auth pages
  if (
    isAuthenticated &&
    (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up"))
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

// ============================================================================
// ROUTE MATCHER CONFIGURATION
// ============================================================================

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)",
  ],
};
