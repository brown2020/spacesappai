import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

// ============================================================================
// ROUTE CONFIGURATION
// ============================================================================

/**
 * Public routes - accessible without authentication
 * Add any routes that should be publicly accessible here
 */
const publicRoutes = ["/", "/sign-in(.*)", "/sign-up(.*)", "/api/webhooks(.*)"];

/**
 * Protected routes - require authentication
 * Users will be redirected to sign-in if not authenticated
 */
const protectedRoutes = ["/doc(.*)", "/dashboard(.*)", "/settings(.*)"];

/**
 * API routes that require authentication
 */
const protectedApiRoutes = [
  "/api/auth-endpoint(.*)",
  "/api/documents(.*)",
  "/api/users(.*)",
];

// Create route matchers
const isPublicRoute = createRouteMatcher(publicRoutes);
const isProtectedRoute = createRouteMatcher(protectedRoutes);
const isProtectedApiRoute = createRouteMatcher(protectedApiRoutes);

/**
 * Check if route should be ignored (static assets, etc.)
 * Uses manual check since path-to-regexp doesn't support file extension patterns
 */
const staticExtensions = new Set([
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".css",
  ".js",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".map",
]);

function isIgnoredRoute(req: NextRequest): boolean {
  const { pathname } = req.nextUrl;

  // Ignore Next.js internals
  if (pathname.startsWith("/_next")) return true;

  // Ignore favicon
  if (pathname === "/favicon.ico") return true;

  // Ignore static file extensions
  const ext = pathname.slice(pathname.lastIndexOf("."));
  if (staticExtensions.has(ext)) return true;

  return false;
}

// ============================================================================
// SECURITY HEADERS
// ============================================================================

/**
 * Security headers applied to all responses
 * Following OWASP best practices
 */
const securityHeaders = {
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
} as const;

/**
 * Apply security headers to response
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// ============================================================================
// RATE LIMITING (In-Memory - Use Redis in production)
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limit configuration per route type
 */
const rateLimitConfig = {
  api: { windowMs: 60_000, maxRequests: 100 }, // 100 requests per minute
  auth: { windowMs: 300_000, maxRequests: 10 }, // 10 auth attempts per 5 minutes
  default: { windowMs: 60_000, maxRequests: 200 }, // 200 requests per minute
} as const;

type RateLimitType = keyof typeof rateLimitConfig;

/**
 * Get rate limit type based on request path
 */
function getRateLimitType(pathname: string): RateLimitType {
  if (pathname.startsWith("/api/")) return "api";
  if (pathname.includes("sign-in") || pathname.includes("sign-up"))
    return "auth";
  return "default";
}

/**
 * Check if request should be rate limited
 * Returns true if rate limit exceeded
 */
function isRateLimited(ip: string, pathname: string): boolean {
  const type = getRateLimitType(pathname);
  const config = rateLimitConfig[type];
  const key = `${ip}:${type}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return false;
  }

  entry.count++;
  return entry.count > config.maxRequests;
}

/**
 * Clean up expired rate limit entries (run periodically)
 */
function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimitStore, 300_000);
}

// ============================================================================
// LOGGING & DEBUGGING
// ============================================================================

const isDev = process.env.NODE_ENV === "development";

interface RequestLog {
  method: string;
  path: string;
  ip: string;
  userAgent: string | null;
  timestamp: string;
  authenticated: boolean;
}

/**
 * Log request details in development mode
 */
function logRequest(req: NextRequest, authenticated: boolean): void {
  if (!isDev) return;

  const log: RequestLog = {
    method: req.method,
    path: req.nextUrl.pathname,
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
    timestamp: new Date().toISOString(),
    authenticated,
  };

  console.log(
    `[Proxy] ${log.method} ${log.path} | Auth: ${log.authenticated} | IP: ${log.ip}`
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract client IP from request headers
 * Handles various proxy configurations
 */
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") || // Cloudflare
    "unknown"
  );
}

/**
 * Create redirect URL for authentication
 */
function createSignInRedirectUrl(req: NextRequest): string {
  const signInUrl = new URL("/sign-in", req.url);
  signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname);
  return signInUrl.toString();
}

/**
 * Create a rate limit exceeded response
 */
function createRateLimitResponse(): NextResponse {
  return new NextResponse(
    JSON.stringify({
      error: "Too Many Requests",
      message: "Rate limit exceeded. Please try again later.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": "60",
      },
    }
  );
}

// ============================================================================
// MAIN PROXY HANDLER
// ============================================================================

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const ip = getClientIp(req);

  // Skip ignored routes (static assets, etc.)
  if (isIgnoredRoute(req)) {
    return NextResponse.next();
  }

  // Rate limiting check
  if (isRateLimited(ip, pathname)) {
    return applySecurityHeaders(createRateLimitResponse());
  }

  // Get authentication state
  const { userId } = await auth();
  const isAuthenticated = !!userId;

  // Log request in development
  logRequest(req, isAuthenticated);

  // Handle protected routes - redirect to sign-in if not authenticated
  if (isProtectedRoute(req) && !isAuthenticated) {
    const signInUrl = createSignInRedirectUrl(req);
    return NextResponse.redirect(signInUrl);
  }

  // Handle protected API routes - return 401 if not authenticated
  if (isProtectedApiRoute(req) && !isAuthenticated) {
    return applySecurityHeaders(
      new NextResponse(
        JSON.stringify({
          error: "Unauthorized",
          message: "Authentication required to access this resource.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      )
    );
  }

  // Redirect authenticated users away from auth pages
  if (
    isAuthenticated &&
    (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up"))
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Apply security headers and continue
  const response = NextResponse.next();
  return applySecurityHeaders(response);
});

// ============================================================================
// ROUTE MATCHER CONFIGURATION
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
