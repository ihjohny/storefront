export const siteConfig = {
  name: "BS Commerce",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  backendUrl: process.env.BACKEND_URL || "http://localhost:3000",
  storefrontUrl:
    process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:3001",
} as const;
