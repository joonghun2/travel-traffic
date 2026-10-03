import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/ko',
        destination: '/',
        permanent: true,
      },
      {
        source: '/ko/:path*',
        destination: '/:path*',
        permanent: true,
      },
      {
        source: '/en',
        destination: '/?lang=en',
        permanent: true,
      },
      {
        source: '/ja',
        destination: '/?lang=ja',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
