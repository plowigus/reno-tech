import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io", // UploadThing
      },
      {
        protocol: "https",
        hostname: "img.clerk.com", // Opcjonalnie, jeśli kiedyś wrócisz do Clerk
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://vercel.live https://va.vercel-scripts.com;
              style-src 'self' 'unsafe-inline';
              img-src 'self' blob: data: https://utfs.io https://vercel.live;
              font-src 'self';
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'none';
              connect-src 'self' https://challenges.cloudflare.com https://vercel.live https://va.vercel-scripts.com;
              upgrade-insecure-requests;
            `.replace(/\s{2,}/g, " ").trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;