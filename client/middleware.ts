import { getSubdomain } from "@/utils/tenant";
import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_PROTECTED_PREFIX,
  ADMIN_PUBLIC_PATHS,
  PUBLIC_PATHS,
} from "@/constants/routes";
import { validateSubdomain } from "@/services/organizationService";
import { verifyAccessToken } from "@/services/userService";

// Helper function to verify token with error handling
async function verifyTokenSafely(): Promise<boolean> {
  try {
    return await verifyAccessToken();
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, hostname } = req.nextUrl;
  const accessToken = req.cookies.get("access_token")?.value;

  const subdomain = await getSubdomain(hostname);
  const isRootDomain = !subdomain || subdomain === "www";

  // Early return for public marketing routes on root domain
  if (isRootDomain && PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Admin panel routing
  if (pathname.startsWith(ADMIN_PROTECTED_PREFIX)) {
    if (ADMIN_PUBLIC_PATHS.includes(pathname)) {
      return NextResponse.next();
    }

    // Protected admin routes - verify token exists and is valid
    if (!accessToken || !(await verifyTokenSafely())) {
      return NextResponse.redirect(new URL("/app/admin/login", req.url));
    }

    return NextResponse.next();
  }

  // Tenant subdomain handling
  if (subdomain && !isRootDomain) {
    // Early exit if no token for tenant routes
    if (!accessToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Parallel validation for better performance
    const [isValidSubdomain, isValidToken] = await Promise.allSettled([
      validateSubdomain(subdomain),
      verifyTokenSafely(),
    ]);

    // Handle invalid subdomain
    if (isValidSubdomain.status === "rejected" || !isValidSubdomain.value) {
      return NextResponse.rewrite(new URL("/invalid-subdomain", req.url));
    }

    // Handle invalid token
    if (isValidToken.status === "rejected" || !isValidToken.value) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Set tenant header and continue
    const response = NextResponse.next();
    response.headers.set("x-tenant-subdomain", subdomain);
    return response;
  }

  // Default redirect to root for unmatched routes
  return NextResponse.redirect(new URL("/", req.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/public|assets|.*\\..*).*)",
  ],
};
