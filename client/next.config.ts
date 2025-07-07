/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV?.trim() === "production";

const nextConfig = {
  // Enable source maps only in development
  productionBrowserSourceMaps: !isProd,

  // Enable React Strict Mode only in development
  reactStrictMode: !isProd,

  // Compress responses in production
  compress: isProd,

  // Hide X-Powered-By header
  poweredByHeader: true,

  images: {
    domains: ["res.cloudinary.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dytx4wqfa/**",
      },
    ],
    minimumCacheTTL: 60,
    unoptimized: true,
  },

  // Only add security headers in production
  async headers() {
    if (!isProd) return [];

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "same-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
