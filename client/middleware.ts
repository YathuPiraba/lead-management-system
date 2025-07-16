import { getSubdomain } from "@/utils/tenant";
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/plans", "/signup", "/reset-password"];

export async function middleware(req: NextRequest) {
  const { pathname, hostname } = req.nextUrl;

  const accessToken = req.cookies.get("access_token")?.value;

  // Check if public route (no auth needed)
  const isPublicRoute = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  // Allow public access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Subdomain handling — e.g., org1.localhost:3000
  const subdomain = await getSubdomain(hostname);

  // For protected subdomain routes: enforce auth
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Optionally, attach subdomain header for SSR/API requests
  const response = NextResponse.next();
  if (subdomain) {
    response.headers.set("x-tenant-subdomain", subdomain);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/public|assets|.*\\..*).*)",
  ],
};
