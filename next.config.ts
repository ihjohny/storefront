import type { NextConfig } from "next";

const defaultLocalOrigin = "http://localhost:3000" as const;

function toOrigin(value: string, fallback: string) {
  try {
    return new URL(value).origin;
  } catch {
    return fallback;
  }
}

function resolveBackendPublicOrigin(): string {
  if (process.env.BACKEND_URL?.trim()) {
    return toOrigin(process.env.BACKEND_URL, defaultLocalOrigin);
  }
  const api = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (api) {
    return toOrigin(api, defaultLocalOrigin);
  }
  return defaultLocalOrigin;
}

type RemotePattern = NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
>[number];

function buildMediaRemotePatterns(): RemotePattern[] {
  const list: RemotePattern[] = [
    {
      protocol: "http",
      hostname: "localhost",
      port: "3000",
      pathname: "/api/media/file/**",
    },
    {
      protocol: "http",
      hostname: "localhost",
      port: "4000",
      pathname: "/api/media/file/**",
    },
  ];
  const seen = new Set<string>();
  for (const p of list) {
    seen.add(`${p.protocol}://${p.hostname}:${p.port ?? ""}`);
  }
  const add = (raw: string) => {
    if (!raw?.trim()) return;
    const withProto =
      /^\s*https?:\/\//i.test(raw) ? raw.trim() : `https://${raw.trim()}`;
    let u: URL;
    try {
      u = new URL(withProto);
    } catch {
      return;
    }
    if (u.hostname === "localhost") return;
    const key = `${u.protocol === "https:" ? "https" : "http"}://${u.hostname}:${u.port || ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    const pat: RemotePattern = {
      protocol: u.protocol === "https:" ? "https" : "http",
      hostname: u.hostname,
      pathname: "/api/media/file/**",
    };
    if (u.port) pat.port = u.port;
    list.push(pat);
  };
  add(process.env.NEXT_PUBLIC_API_URL || "");
  add(process.env.BACKEND_URL || "");
  return list;
}

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    const backendOrigin = resolveBackendPublicOrigin();
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || `${resolveBackendPublicOrigin()}/api`;
    const apiOrigin = toOrigin(apiUrl, defaultLocalOrigin);
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
    remotePatterns: buildMediaRemotePatterns(),
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL || defaultLocalOrigin,
  },
};

export default nextConfig;
