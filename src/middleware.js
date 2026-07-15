import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isClerkConfigured = 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "your_clerk_publishable_key";

const isPublicRoute = createRouteMatcher([
  "/",
  "/itinerary/(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/itineraries(.*)",
]);

export default function middleware(request, event) {
  // Gracefully bypass Clerk middleware in Demo Mode if keys are not set
  if (!isClerkConfigured) {
    return NextResponse.next();
  }

  // Otherwise, run Clerk route protection
  return clerkMiddleware((auth, req) => {
    if (!isPublicRoute(req)) {
      auth().protect();
    }
  })(request, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.[\\w]+$|_next/image|favicon.ico).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Clerk auto-proxy
    "/__clerk/:path*",
  ],
};
