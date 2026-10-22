import { parseName, sitemapNames, sitemapXml } from '@/lib/sitemaps';

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return sitemapNames().map((n) => ({ name: `${n}.xml` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const parsed = parseName((await params).name);
  if (!parsed) return new Response('Not found', { status: 404 });
  return new Response(await sitemapXml(parsed.lang, parsed.section), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
