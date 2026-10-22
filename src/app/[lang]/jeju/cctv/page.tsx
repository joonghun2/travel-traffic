import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Lang } from '@/types';
import { LANGS, SITE_URL, htmlLang, isLang, languageAlternates, localizePath } from '@/lib/i18n/routing';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { jejuMapCameras } from '@/lib/jejuCameras';
import { getForecast, statusOfRate, todayOf } from '@/lib/forecast';
import { STATUS_COLOR } from '@/lib/mapSpots';
import DashboardHeader from '@/components/DashboardHeader';
import BottomNav from '@/components/BottomNav';

type Params = Promise<{ lang: string }>;

// Cameras are static; the "today" forecast next to each one changes daily.
export const revalidate = 3600;
export const preferredRegion = 'icn1';
export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

const PATH = '/jeju/cctv';

const tr = (lang: Lang) => (key: string, vars: Record<string, string | number> = {}) =>
  (TRANSLATIONS[lang][key] ?? TRANSLATIONS.en[key] ?? TRANSLATIONS.ko[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = tr(lang);
  const n = jejuMapCameras(lang).length;
  const title = t('cctv.metaTitle', { n });
  const description = t('cctv.metaDesc', { n });
  const url = `${SITE_URL}${localizePath(PATH, lang)}`;
  return {
    title: { absolute: `${title} | Check East Point` },
    description,
    alternates: { canonical: url, languages: languageAlternates(PATH) },
    openGraph: { title, description, url, siteName: 'Check East Point', type: 'website' },
  };
}

export default async function JejuCctvPage({ params }: { params: Params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = tr(lang);
  const cameras = jejuMapCameras(lang);
  const forecast = await getForecast();
  const todayFor = (id: number) => {
    const day = todayOf(forecast.spots[id]);
    return day ? { score: Math.round(day.rate), status: statusOfRate(day.rate) } : undefined;
  };
  const regions = [
    { key: 'jeju', match: '제주시' },
    { key: 'seogwipo', match: '서귀포시' },
  ].map((r) => ({ ...r, cameras: cameras.filter((c) => c.address.includes(r.match)) }));
  const url = `${SITE_URL}${localizePath(PATH, lang)}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: t('cctv.title'),
      inLanguage: htmlLang(lang),
      itemListElement: cameras.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: { '@type': 'Place', name: c.name, address: c.address, geo: { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lng } },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: t('map.city.jeju'), item: `${SITE_URL}${localizePath('/jeju', lang)}` },
        { '@type': 'ListItem', position: 2, name: t('cctv.title'), item: url },
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-24 lg:pb-10" lang={htmlLang(lang)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DashboardHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        <nav className="text-xs text-gray-500 dark:text-gray-400">
          <Link href={localizePath('/jeju', lang)} className="hover:text-blue-600">{t('map.city.jeju')}</Link> › {t('cctv.title')}
        </nav>
        <header className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            📹 {t('cctv.title')}
          </h1>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{t('cctv.intro', { n: cameras.length })}</p>
          <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">{t('cctv.note')}</p>
          <Link href={localizePath('/jeju', lang)} className="inline-block text-sm font-bold text-blue-600 hover:underline">
            🗺️ {t('cctv.mapLink')} →
          </Link>
        </header>

        {regions.map((r) => (
          <section key={r.key} className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {t(`cctv.region.${r.key}`)} <span className="text-sm font-semibold text-gray-400">{r.cameras.length}</span>
            </h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {r.cameras.map((c) => {
                const today = c.near && todayFor(c.near.id);
                return (
                  <li key={c.id} className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">{c.name}</h3>
                      <span className="shrink-0 text-[11px] text-gray-400">{t('cctv.angles', { n: c.count })}</span>
                    </div>
                    {lang === 'ko' && <p className="text-xs text-gray-500 dark:text-gray-400">{c.address}</p>}
                    {c.near && (
                      <Link
                        href={localizePath(`/spot/${c.near.slug}`, lang)}
                        className="flex items-center justify-between gap-2 text-sm text-blue-600 hover:underline"
                      >
                        <span className="truncate">{t('cctv.near', { name: c.near.name })}</span>
                        {today && (
                          <span className="shrink-0 text-xs font-bold" style={{ color: STATUS_COLOR[today.status] }}>
                            {t('cctv.today')} {t(`card.status.${today.status}`)} {today.score}
                          </span>
                        )}
                      </Link>
                    )}
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto h-10 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold flex items-center justify-center"
                    >
                      {t('cctv.view')} ↗
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <p className="text-[11px] text-gray-400">{t('cctv.source')}</p>
      </main>
      <BottomNav />
    </div>
  );
}
