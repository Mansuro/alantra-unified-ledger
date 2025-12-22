import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"]
    }
  },
  serverExternalPackages: ["@libsql/client", "@prisma/adapter-libsql", "libsql"]
};

export default nextConfig;
