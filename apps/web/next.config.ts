import path from "node:path";
import type { NextConfig } from "next";

const workspaceRoot = path.resolve(process.cwd(), "../..");
const isDevelopment = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  distDir: isDevelopment ? ".next-dev" : ".next",
  experimental: {
    externalDir: true
  },
  outputFileTracingRoot: workspaceRoot,
  transpilePackages: ["@rukhsar/types", "@rukhsar/ui", "@rukhsar/config"],
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@rukhsar/config": path.join(workspaceRoot, "packages/config/src/index.ts"),
      "@rukhsar/types": path.join(workspaceRoot, "packages/types/src/index.ts"),
      "@rukhsar/ui": path.join(workspaceRoot, "packages/ui/src/index.tsx")
    };

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  }
};

export default nextConfig;
