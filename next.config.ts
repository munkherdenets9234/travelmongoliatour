import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Destination/car/blog cover images are admin-managed URLs from the DigitalService
    // API (Cloudinary today, potentially other hosts later) — allow any https host.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    serverActions: {
      // Must stay above the MAX_BYTES image cap in src/lib/uploads.ts.
      bodySizeLimit: "11mb",
    },
  },
  async rewrites() {
    return {
      // Serves the default locale at "/" without an HTTP redirect round-trip
      // (canonical tag on the [locale] pages still points search engines to "/en").
      beforeFiles: [{ source: "/", destination: "/en" }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
