import { headers } from "next/headers";

export async function getHostname(): Promise<string> {
  if (typeof window !== "undefined") {
    // Browser environment
    return window.location.hostname;
  } else {
    const hdrs = await headers();
    return hdrs.get("host") || "";
  }
}

export async function getSubdomain(hostname?: string): Promise<string | null> {
  const host = hostname || (await getHostname());

  if (host.includes("localhost")) {
    const parts = host.split(".");
    return parts.length > 1 ? parts[0] : null;
  }

  // For production (e.g., org1.yourdomain.com)
  const domainParts = host.split(".");
  return domainParts.length > 2 ? domainParts[0] : null;
}
