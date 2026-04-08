import type { NextConfig } from "next";

function toOrigin(value: string, fallback: string) {
  try {
    return new URL(value).origin;
  } catch {
    return fallback;
  }
}

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    const backendOrigin = toOrigin(backendUrl, "http://localhost:3000");
    const apiOrigin = toOrigin(apiUrl, "http://localhost:3000");
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob: ${backendOrigin}`,
      `connect-src 'self' ${apiOrigin} ${backendOrigin} ws: wss:`,
      "font-src 'self'",
      "frame-ancestors 'none'",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/media/file/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3010",
        pathname: "/api/media/file/**",
      },
    ],
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL || "http://localhost:3000",
  },
};

export default nextConfig;
