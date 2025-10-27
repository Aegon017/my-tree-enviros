import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Middleware for protecting specific routes that require authentication
 * Most routes are public - users can browse without login
 * Only checkout, account, and order pages require authentication
 */
export function middleware(req: NextRequest) {
  // For Sanctum SPA authentication, Laravel sets a session cookie
  const sessionCookie =
    req.cookies.get("my-tree-enviros-session") || req.cookies.get("XSRF-TOKEN");

  // If no session cookie, redirect to sign-in
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Configure which routes should be protected (require authentication)
export const config = {
  matcher: [
    /*
     * Only protect these routes:
     * - /checkout (requires login to complete purchase)
     * - /my-account (user profile)
     * - /my-orders (order history)
     * - /notifications (user notifications)
     *
     * All other routes are PUBLIC and don't require authentication:
     * - / (home)
     * - /sponsor-a-tree
     * - /adopt-a-tree
     * - /feed-a-tree
     * - /store
     * - /cart (guest cart)
     * - /wishlist (guest wishlist)
     * - /blogs
     */
    "/checkout/:path*",
    "/my-account/:path*",
    "/my-orders/:path*",
    "/notifications/:path*",
  ],
};
