import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000", "hypeup.vercel.app", "*.vercel.app"] },
  },
};

export default nextConfig;
