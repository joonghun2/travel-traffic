import type { MetadataRoute } from 'next';
import { LANGS, SITE_URL, languageAlternates, localizePath } from '@/lib/i18n/routing';
import { getAllSpotSlugs } from '@/lib/spots';

const PAGES: { path: string; changeFrequency: 'hourly' | 'weekly'; priority: number }[] = [
  { path: '/', changeFrequency: 'hourly', priority: 1.0 },
  { path: '/play', changeFrequency: 'weekly', priority: 0.9 },
  ...getAllSpotSlugs().map((slug) => ({
    path: `/spot/${slug}`,
    changeFrequency: 'hourly' as const,
    priority: 0.8,
  })),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const appPages = PAGES.flatMap(({ path, changeFrequency, priority }) =>
    LANGS.map((lang) => ({
      url: `${SITE_URL}${localizePath(path, lang)}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages: languageAlternates(path) },
    }))
  );

  // Static test pages in /public pick their language from ?lang=.
  const eventPages = ['event1', 'event2'].map((name) => ({
    url: `${SITE_URL}/${name}/index.html`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    alternates: {
      languages: Object.fromEntries(
        LANGS.map((lang) => [lang, `${SITE_URL}/${name}/index.html?lang=${lang}`])
      ),
    },
  }));

  return [...appPages, ...eventPages];
}
