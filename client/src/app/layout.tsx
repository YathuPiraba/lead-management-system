import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { getSubdomain } from "@/utils/tenant";
import { headers } from "next/headers";
import AppLayout from "@/components/AppLayout";

export const metadata: Metadata = {
  description: "Lead Management System",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost";
  const subdomain = await getSubdomain(host);

  return (
    <html lang="en">
      <head>
        <title>Lead Management System</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AppLayout subdomain={subdomain}>{children}</AppLayout>
      </body>
    </html>
  );
}
