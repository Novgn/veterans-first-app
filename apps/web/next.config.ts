import type { NextConfig } from "next";

// Draft Next.js config for consolidated web app (dispatch | admin | business).
// Populated in later stories (1.5.3 / 1.5.4) with image domains, transpilePackages,
// and other settings merged from the former apps/admin and apps/business configs.
const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
