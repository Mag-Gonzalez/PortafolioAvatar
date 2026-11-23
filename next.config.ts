import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Turbopack procesa CSS de forma nativa en Next.js 16;
  // no se requiere el loader @tailwindcss/turbopack.
};

export default nextConfig;
