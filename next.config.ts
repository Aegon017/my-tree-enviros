import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      {
        protocol: "http",
        hostname: "192.168.1.2",
      },
      {
        protocol: "https",
        hostname: "arboraid.co",
      },
    ],
  },
};

export default nextConfig;
