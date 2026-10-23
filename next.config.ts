import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Used for sitemap <lastmod> of static pages (last deploy).
  env: { BUILD_TIME: new Date().toISOString() },
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
      // The Seoul hub is the home page.
      { source: '/seoul', destination: '/', permanent: true },
      { source: '/:lang(en|ja|zh-cn|zh-tw)/seoul', destination: '/:lang', permanent: true },
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
        { source: '/:city(seoul|jeju|busan)/:theme', destination: '/ko/:city/:theme' },
        { source: '/about', destination: '/ko/about' },
        { source: '/about/:path*', destination: '/ko/about/:path*' },
        { source: '/cards', destination: '/ko/cards' },
        { source: '/cards/:path*', destination: '/ko/cards/:path*' },
        { source: '/widget', destination: '/ko/widget' },
        { source: '/privacy', destination: '/ko/privacy' },
        { source: '/terms', destination: '/ko/terms' },
        { source: '/contact', destination: '/ko/contact' },
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
