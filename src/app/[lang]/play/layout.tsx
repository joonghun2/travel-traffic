import type { Metadata } from 'next';
import { SITE_URL, isLang, languageAlternates, localizePath } from '@/lib/i18n/routing';
import { SEO } from '@/lib/i18n/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const seo = SEO[lang];
  const url = `${SITE_URL}${localizePath('/play', lang)}`;

  return {
    title: seo.playTitle,
    description: seo.playDescription,
    alternates: {
      canonical: url,
      languages: languageAlternates('/play'),
    },
    openGraph: {
      title: `${seo.playTitle} | Check East Point`,
      description: seo.playDescription,
      url,
      siteName: 'Check East Point',
      locale: seo.ogLocale,
      type: 'website',
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: seo.ogAlt }],
    },
  };
}

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
