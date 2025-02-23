import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
