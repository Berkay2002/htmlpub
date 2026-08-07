import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@htmlpub/core", "@htmlpub/db", "@htmlpub/ui"]
};

export default nextConfig;
