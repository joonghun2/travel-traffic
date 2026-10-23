import { TYPE_KEYS, resultPath } from '@/lib/travelType';
import { JEJU_CCTV_ENABLED } from '@/config/features';
import { Lang } from '@/types';
import { LANGS, SITE_URL, languageAlternates, localizePath } from '@/lib/i18n/routing';
import { getAllSpotSlugs } from '@/lib/spots';
import { FORECAST_SPOTS } from '@/data/spots/forecastSpots';
import { FOOD_TYPE_IDS } from '@/data/seoulFoodTest';
import { getSpotSlug } from '@/lib/slug';
import { themesFor } from '@/lib/themes';
import { getForecast } from '@/lib/forecast';

/** Sitemaps per language and section: ko-core, en-seoul, ja-jeju, ... */
export const SECTIONS = ['core', 'seoul', 'jeju', 'busan'] as const;
export type Section = (typeof SECTIONS)[number];

export const sitemapNames = () => LANGS.flatMap((l) => SECTIONS.map((s) => `${l}-${s}`));

export function parseName(name: string): { lang: Lang; section: Section } | null {
  const m = name.replace(/\.xml$/, '').match(/^(ko|en|ja|zh-cn|zh-tw)-(core|seoul|jeju|busan)$/);
  return m ? { lang: m[1] as Lang, section: m[2] as Section } : null;
}

/** Set at build time (next.config env); last deploy = last change of static pages. */
const BUILD_TIME = process.env.BUILD_TIME ?? new Date().toISOString();

interface Entry {
  path: string;
  lastmod: string;
  changefreq: 'hourly' | 'daily' | 'weekly';
  priority: number;
}

export async function entriesFor(section: Section): Promise<Entry[]> {
  if (section === 'seoul') {
    // Live data: these pages change every 5 minutes.
    const now = new Date().toISOString();
    return [
      ...themesFor('seoul').map((t) => ({ path: `/seoul/${t.slug}`, lastmod: now, changefreq: 'hourly' as const, priority: 0.8 })),
      ...getAllSpotSlugs().map((slug) => ({ path: `/spot/${slug}`, lastmod: now, changefreq: 'hourly' as const, priority: 0.8 })),
    ];
  }
  if (section === 'jeju' || section === 'busan') {
    const base = (await getForecast()).baseDate ?? BUILD_TIME.slice(0, 10);
    return [
      { path: `/${section}`, lastmod: base, changefreq: 'daily', priority: 0.9 },
      ...(section === 'jeju' && JEJU_CCTV_ENABLED ? [{ path: '/jeju/cctv', lastmod: base, changefreq: 'daily' as const, priority: 0.8 }] : []),
      ...themesFor(section).map((t) => ({ path: `/${section}/${t.slug}`, lastmod: base, changefreq: 'daily' as const, priority: 0.7 })),
      ...FORECAST_SPOTS.filter((s) => s.city === section).map((s) => ({
        path: `/spot/${getSpotSlug(s)}`,
        lastmod: base,
        changefreq: 'daily' as const,
        priority: 0.8,
      })),
    ];
  }
  const now = new Date().toISOString();
  return [
    { path: '/', lastmod: now, changefreq: 'hourly', priority: 1.0 },
    { path: '/list', lastmod: now, changefreq: 'hourly', priority: 0.9 },
    { path: '/cards', lastmod: now, changefreq: 'hourly', priority: 0.7 },
    { path: '/widget', lastmod: BUILD_TIME, changefreq: 'weekly', priority: 0.5 },
    { path: '/contact', lastmod: BUILD_TIME, changefreq: 'weekly', priority: 0.4 },
    { path: '/privacy', lastmod: BUILD_TIME, changefreq: 'weekly', priority: 0.3 },
    { path: '/terms', lastmod: BUILD_TIME, changefreq: 'weekly', priority: 0.3 },
    { path: '/play', lastmod: BUILD_TIME, changefreq: 'weekly', priority: 0.8 },
    { path: '/play/food-worldcup', lastmod: BUILD_TIME, changefreq: 'weekly', priority: 0.8 },
    { path: '/play/travel-type', lastmod: BUILD_TIME, changefreq: 'weekly', priority: 0.9 },
    { path: '/play/travel-type/types', lastmod: BUILD_TIME, changefreq: 'weekly', priority: 0.7 },
    ...TYPE_KEYS.map((k) => ({ path: resultPath(k), lastmod: now, changefreq: 'daily' as const, priority: 0.7 })),
    { path: '/play/seoul-food-test', lastmod: BUILD_TIME, changefreq: 'weekly', priority: 0.8 },
    ...FOOD_TYPE_IDS.map((t) => ({ path: `/play/seoul-food-test/result/${t}`, lastmod: BUILD_TIME, changefreq: 'weekly' as const, priority: 0.6 })),
    { path: '/about', lastmod: BUILD_TIME, changefreq: 'weekly', priority: 0.5 },
    { path: '/about/methodology', lastmod: BUILD_TIME, changefreq: 'weekly', priority: 0.6 },
  ];
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export async function sitemapXml(lang: Lang, section: Section): Promise<string> {
  const entries = await entriesFor(section);
  const urls = entries
    .map((e) => {
      const alts = Object.entries(languageAlternates(e.path))
        .map(([hl, href]) => `<xhtml:link rel="alternate" hreflang="${hl}" href="${esc(href)}"/>`)
        .join('');
      return `<url><loc>${esc(`${SITE_URL}${localizePath(e.path, lang)}`)}</loc>${alts}<lastmod>${e.lastmod}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
}

/** Every URL the site wants indexed, used by IndexNow. */
export async function allUrls(sections: readonly Section[] = SECTIONS): Promise<string[]> {
  const out: string[] = [];
  for (const section of sections) {
    const entries = await entriesFor(section);
    for (const lang of LANGS) for (const e of entries) out.push(`${SITE_URL}${localizePath(e.path, lang)}`);
  }
  return out;
}
