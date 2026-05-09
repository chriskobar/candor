import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow the login page and its API route through
  if (pathname === "/login" || pathname === "/api/auth") {
    return NextResponse.next();
  }

  const password = process.env.SITE_PASSWORD;

  // No password set — site is fully open (public deployment behavior)
  if (!password) return NextResponse.next();

  // Check for valid auth cookie
  const auth = request.cookies.get("candor-auth");
  if (auth?.value === password) return NextResponse.next();

  // Not authenticated — redirect to login, preserving the intended destination
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Apply to all routes except Next.js internals and static assets
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.webp).*)",
  ],
};
