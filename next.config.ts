import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "cdn-cf.cms.flixbus.com",
      },
    ],
  },
};

export default nextConfig;
