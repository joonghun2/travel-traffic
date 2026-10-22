import type { Metadata } from 'next';
import { SITE_URL, isLang, languageAlternates, localizePath } from '@/lib/i18n/routing';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { SEO } from '@/lib/i18n/seo';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const title = TRANSLATIONS[lang]['list.metaTitle'];
  const url = `${SITE_URL}${localizePath('/list', lang)}`;
  return {
    title: { absolute: `${title} | Check East Point` },
    description: SEO[lang].description,
    alternates: { canonical: url, languages: languageAlternates('/list') },
    openGraph: { title, description: SEO[lang].description, url, siteName: 'Check East Point', type: 'website' },
  };
}

export default function ListLayout({ children }: { children: React.ReactNode }) {
  return children;
}
