import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/play', '/event1/', '/event2/'],
        disallow: ['/api/'],
      },
    ],
    sitemap: 'https://www.checkeastpoint.com/sitemap.xml',
  };
}
