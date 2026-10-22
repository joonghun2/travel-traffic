import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CityId, Lang } from '@/types';
import { LANGS, SITE_URL, htmlLang, isLang, languageAlternates, localizePath, pick } from '@/lib/i18n/routing';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { themeSpots, themesFor } from '@/lib/themes';
import { getCrowdSnapshot } from '@/lib/crowdSnapshot';
import { getForecast, statusOfRate, todayOf } from '@/lib/forecast';
import { getSpotSlug } from '@/lib/slug';
import { STATUS_COLOR } from '@/lib/mapSpots';
import DashboardHeader from '@/components/DashboardHeader';
import BottomNav from '@/components/BottomNav';

type Params = Promise<{ lang: string; theme: string }>;

const t = (lang: Lang) => (key: string, vars: Record<string, string | number> = {}) =>
  (TRANSLATIONS[lang][key] ?? TRANSLATIONS.en[key] ?? TRANSLATIONS.ko[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));

export function themeStaticParams(city: CityId) {
  return () => LANGS.flatMap((lang) => themesFor(city).map((th) => ({ lang, theme: th.slug })));
}

const hubPath = (city: CityId) => (city === 'seoul' ? '/' : `/${city}`);

export function themeMetadata(city: CityId) {
  return async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { lang, theme } = await params;
    if (!isLang(lang)) return {};
    const tr = t(lang);
    const spots = themeSpots(city, theme);
    if (!spots.length) return {};
    const vars = { city: tr(`map.city.${city}`), theme: tr(`theme.${theme}`), n: spots.length };
    const title = tr(city === 'seoul' ? 'theme.title.live' : 'theme.title.forecast', vars);
    const description = tr('theme.metaDesc', { ...vars, examples: spots.slice(0, 3).map((s) => pick(s.name, lang)).join(', ') });
    const path = `/${city}/${theme}`;
    const url = `${SITE_URL}${localizePath(path, lang)}`;
    return {
      title: { absolute: `${title} | Check East Point` },
      description,
      alternates: { canonical: url, languages: languageAlternates(path) },
      openGraph: { title, description, url, siteName: 'Check East Point', type: 'website' },
    };
  };
}

export async function ThemeHubPage({ params, city }: { params: Params; city: CityId }) {
  const { lang, theme } = await params;
  if (!isLang(lang)) notFound();
  const spots = themeSpots(city, theme);
  if (!spots.length) notFound();
  const tr = t(lang);
  const live = city === 'seoul';
  const cityName = tr(`map.city.${city}`);
  const themeName = tr(`theme.${theme}`);

  // Score per spot: Seoul live snapshot, or today's KTO forecast.
  let scoreOf: (id: number) => { score: number; estimate: boolean };
  if (live) {
    const snap = await getCrowdSnapshot();
    const byId = new Map(snap.spots.map((m) => [m.id, m]));
    scoreOf = (id) => ({ score: byId.get(id)?.currentScore ?? 50, estimate: !byId.get(id)?.isLive });
  } else {
    const data = await getForecast();
    scoreOf = (id) => ({ score: Math.round(todayOf(data.spots[id])?.rate ?? 50), estimate: false });
  }
  const rows = spots.map((s) => ({ s, ...scoreOf(s.id) })).sort((a, b) => a.score - b.score);
  const title = tr(live ? 'theme.title.live' : 'theme.title.forecast', { city: cityName, theme: themeName });
  const path = `/${city}/${theme}`;
  const url = `${SITE_URL}${localizePath(path, lang)}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: title,
      inLanguage: htmlLang(lang),
      itemListElement: rows.map((r, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: pick(r.s.name, lang),
        url: `${SITE_URL}${localizePath(`/spot/${getSpotSlug(r.s)}`, lang)}`,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: cityName, item: `${SITE_URL}${localizePath(hubPath(city), lang)}` },
        { '@type': 'ListItem', position: 2, name: themeName, item: url },
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-24 lg:pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DashboardHeader live={live} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-5 space-y-4">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 dark:text-gray-400">
          <Link href={localizePath(hubPath(city), lang)} className="hover:text-blue-600">{cityName}</Link>
          <span className="mx-1.5">›</span>
          <span className="text-gray-700 dark:text-gray-200">{themeName}</span>
        </nav>
        <header>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">{title}</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {tr(live ? 'theme.intro.live' : 'theme.intro.forecast', { city: cityName, theme: themeName, n: rows.length })}
          </p>
        </header>

        <ol className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map(({ s, score, estimate }, i) => {
            const status = statusOfRate(score);
            return (
              <li key={s.id}>
                <Link href={localizePath(`/spot/${getSpotSlug(s)}`, lang)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60">
                  <span className="w-6 text-right text-xs font-bold text-gray-400 tabular-nums">{i + 1}</span>
                  <span aria-hidden="true">{s.emoji}</span>
                  <span className="flex-1 min-w-0 truncate text-sm font-semibold text-gray-800 dark:text-gray-100">{pick(s.name, lang)}</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: STATUS_COLOR[status] }}>
                    {tr(`card.status.${status}`)}
                  </span>
                  <span className="w-10 text-right text-sm font-black tabular-nums" style={{ color: STATUS_COLOR[status] }}>
                    {score}
                    {estimate ? '*' : ''}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
        <p className="text-[11px] text-gray-400">
          {live ? `* ${tr('map.estimate')} · ${tr('spot.attribution')}` : tr('forecast.source')}
        </p>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">{tr('theme.others')}</h2>
          <ul className="flex flex-wrap gap-2">
            {themesFor(city)
              .filter((th) => th.slug !== theme)
              .map((th) => (
                <li key={th.slug}>
                  <Link
                    href={localizePath(`/${city}/${th.slug}`, lang)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:border-blue-400"
                  >
                    <span aria-hidden="true">{th.icon}</span> {tr(`theme.${th.slug}`)}
                  </Link>
                </li>
              ))}
          </ul>
        </section>

        <Link href={localizePath(hubPath(city), lang)} className="h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center">
          🗺️ {tr('theme.openMap', { city: cityName })} →
        </Link>
      </main>
      <BottomNav />
    </div>
  );
}
