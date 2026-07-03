import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Destination/car/blog cover images are admin-managed URLs from the DigitalService
    // API (Cloudinary today, potentially other hosts later) — allow any https host.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
