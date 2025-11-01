import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes (don't require login)
const publicRoutes = ["/api/auth", "/login", "/public"];

export default auth(async (req: NextRequest) => {
  const { nextUrl } = req;

  // ✅ Allow static files and Next.js internals
  if (
    nextUrl.pathname.startsWith("/_next") || // Next.js internal files
    nextUrl.pathname.startsWith("/static") || // Static files
    nextUrl.pathname.includes(".") // Files with extensions (css, js, images, etc.)
  ) {
    return NextResponse.next();
  }

  const isPublic = publicRoutes.some((path) =>
    nextUrl.pathname.startsWith(path)
  );

  // If route is public, allow access
  if (isPublic) return NextResponse.next();

  // If not signed in, redirect to sign-in page
  if (!req.auth) {
    const signInUrl = new URL("/login", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Otherwise, allow request
  return NextResponse.next();
});

// ✅ Add matcher config to only run middleware on specific routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};