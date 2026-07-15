import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/itinerary/(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/itineraries(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth.protect();
  }
});

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
