import { SITE_URL } from '@/lib/i18n/routing';
import { sitemapNames } from '@/lib/sitemaps';

// Sitemap index: one sitemap per language x section (core, seoul, jeju, busan).
export const revalidate = 3600;

export function GET() {
  const now = new Date().toISOString();
  const items = sitemapNames()
    .map((n) => `<sitemap><loc>${SITE_URL}/sitemaps/${n}.xml</loc><lastmod>${now}</lastmod></sitemap>`)
    .join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
  );
}
