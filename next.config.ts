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
      // Korean lives on the unprefixed URL.
      { source: '/ko', destination: '/', permanent: true },
      { source: '/ko/:path*', destination: '/:path*', permanent: true },
      // Legacy ?lang= links -> language URLs.
      { source: '/', has: [{ type: 'query', key: 'lang', value: '(?<lang>en|ja)' }], destination: '/:lang', permanent: true },
      { source: '/play', has: [{ type: 'query', key: 'lang', value: '(?<lang>en|ja)' }], destination: '/:lang/play', permanent: true },
    ];
  },
  async rewrites() {
    return {
      // Serve the Korean pages (app/[lang] with lang=ko) from the unprefixed URLs.
      beforeFiles: [
        { source: '/', destination: '/ko' },
        { source: '/list', destination: '/ko/list' },
        { source: '/jeju', destination: '/ko/jeju' },
        { source: '/busan', destination: '/ko/busan' },
        { source: '/play', destination: '/ko/play' },
        { source: '/play/:path*', destination: '/ko/play/:path*' },
        { source: '/spot/:path*', destination: '/ko/spot/:path*' },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
