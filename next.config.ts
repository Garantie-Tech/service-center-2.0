import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qa-garantie-cdn.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "prod-garantie.s3.ap-south-1.amazonaws.com",
      },
    ],
    domains: ['prod-garantie-cdn.s3.ap-south-1.amazonaws.com', 'qa-garantie-cdn.s3.ap-south-1.amazonaws.com'],
  },
};

export default nextConfig;
