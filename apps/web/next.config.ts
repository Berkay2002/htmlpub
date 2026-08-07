import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@htmlpub/core", "@htmlpub/db"]
};

export default nextConfig;
