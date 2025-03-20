/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,

  // Disable telemetry
  telemetry: {
    telemetryDisabled: true,
  },

  // Disable React DevTools in production
  reactStrictMode: false,

  // Compress responses
  compress: true,

  // Minimize JS
  swcMinify: true,

  // Disable X-Powered-By header
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dytx4wqfa/**",
      },
    ],
    // Minimize image information exposure
    minimumCacheTTL: 60,
  },

  // Add security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          // {
          //   key: "Strict-Transport-Security",
          //   value: "max-age=63072000; includeSubDomains; preload",
          // },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
