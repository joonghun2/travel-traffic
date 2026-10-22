import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Lang, Spot } from '@/types';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { LANGS, SITE_URL, isLang, languageAlternates, localizePath, pick, isChinese } from '@/lib/i18n/routing';
import {
  getAllSpotSlugs,
  getHourlyForecast,
  getNearbySpots,
  getQuietestDaytimeHour,
  getSpotBySlug,
  getSpotSlug,
  HourlyPoint,
} from '@/lib/spots';
import { computeLiveSpotMetric } from '@/lib/crowdEngine';
import { getCrowdSnapshot } from '@/lib/crowdSnapshot';
import { formatDistance, getGoogleNavUrl, getKakaoNavUrl, getNaverNavUrl } from '@/lib/geoUtils';
import DashboardHeader from '@/components/DashboardHeader';
import BottomNav from '@/components/BottomNav';
import SpotLivePanel from '@/components/SpotLivePanel';
import ForecastSpotView from '@/components/city/ForecastSpotView';
import { getAllForecastSlugs, getForecastSpotBySlug } from '@/lib/forecastSpots';
import { getForecast } from '@/lib/forecast';
import { formatForecastDate, quietestDay } from '@/lib/forecastMap';

export const dynamicParams = false;
// Re-render with the cached Seoul snapshot every 5 minutes; the panel polls /api/crowd on the client.
export const revalidate = 300;
export const preferredRegion = 'icn1';

type Params = Promise<{ lang: string; slug: string }>;

export function generateStaticParams() {
  // Seoul (live) spots plus Jeju/Busan (forecast) spots.
  const slugs = [...getAllSpotSlugs(), ...getAllForecastSlugs()];
  return LANGS.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

function translator(lang: Lang) {
  return (key: string, vars: Record<string, string | number> = {}) => {
    const template = TRANSLATIONS[lang][key] ?? TRANSLATIONS.en[key] ?? TRANSLATIONS.ko[key] ?? key;
    return template.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ''));
  };
}

function formatHour(lang: Lang, hour: number) {
  const t = translator(lang);
  const h = hour % 24;
  return t('spot.hour', { h, h12: h % 12 === 0 ? 12 : h % 12, ampm: h < 12 ? 'AM' : 'PM' });
}

function busiestRange(lang: Lang, spot: Spot) {
  const hours = [...spot.peakHours].sort((a, b) => a - b);
  return `${formatHour(lang, hours[0])}–${formatHour(lang, hours[hours.length - 1] + 1)}`;
}

function resolve(lang: string, slug: string) {
  const spot = getSpotBySlug(slug);
  if (!isLang(lang) || !spot) return null;
  return { lang, spot, path: `/spot/${slug}` };
}

async function forecastMetadata(lang: Lang, slug: string): Promise<Metadata> {
  const spot = getForecastSpotBySlug(slug)!;
  const t = translator(lang);
  const name = pick(spot.name, lang);
  const data = await getForecast();
  const quiet = quietestDay(data.spots[spot.id]);
  const title = t('forecast.metaTitle', { name });
  const description = t('forecast.metaDesc', { name, quiet: quiet ? formatForecastDate(quiet.date, lang) : '' });
  const path = `/spot/${slug}`;
  const url = `${SITE_URL}${localizePath(path, lang)}`;
  return {
    title: { absolute: `${title} | Check East Point` },
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: { title, description, url, siteName: 'Check East Point', type: 'article', images: [{ url: `${url}/og`, width: 1200, height: 630, alt: title }] },
    twitter: { card: 'summary_large_image', title, description, images: [`${url}/og`] },
  };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  if (isLang(rawLang) && getForecastSpotBySlug(slug)) return forecastMetadata(rawLang, slug);
  const resolved = resolve(rawLang, slug);
  if (!resolved) return {};
  const { lang, spot, path } = resolved;
  const t = translator(lang);
  const name = pick(spot.name, lang);
  const title = t('spot.metaTitle', { name });
  const description = t('spot.metaDesc', { name, best: pick(spot.bestTime, lang) });
  const url = `${SITE_URL}${localizePath(path, lang)}`;

  return {
    title: { absolute: `${title} | Check East Point` },
    description,
    keywords: [...(spot.searchKeywords || []), spot.name.ko, spot.name.en, spot.name.ja],
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Check East Point',
      type: 'article',
      images: [{ url: `${url}/og`, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [`${url}/og`] },
  };
}

function ForecastBars({ points, label, lang }: { points: HourlyPoint[]; label: string; lang: Lang }) {
  const visible = points.filter((p) => p.hour >= 7);
  return (
    <div>
      <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-2">{label}</p>
      <div className="flex items-end gap-[3px] h-24" role="img" aria-label={label}>
        {visible.map((p) => (
          <div
            key={p.hour}
            className={`flex-1 rounded-t ${
              p.score >= 85 ? 'bg-rose-500' : p.score >= 70 ? 'bg-orange-500' : p.score >= 40 ? 'bg-amber-400' : 'bg-emerald-500'
            }`}
            style={{ height: `${Math.max(6, p.score)}%` }}
            title={`${formatHour(lang, p.hour)}: ${p.score}`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-gray-400">
        {visible
          .filter((p) => p.hour % 3 === 1)
          .map((p) => (
            <span key={p.hour}>{formatHour(lang, p.hour)}</span>
          ))}
      </div>
    </div>
  );
}

export default async function SpotPage({ params }: { params: Params }) {
  const { lang: rawLang, slug } = await params;
  const forecastSpot = isLang(rawLang) ? getForecastSpotBySlug(slug) : undefined;
  if (forecastSpot && isLang(rawLang)) {
    return <ForecastSpotView spot={forecastSpot} data={await getForecast()} lang={rawLang} />;
  }
  const resolved = resolve(rawLang, slug);
  if (!resolved) notFound();
  const { lang, spot, path } = resolved;
  const t = translator(lang);

  const name = pick(spot.name, lang);
  const area = pick(spot.address, lang) || pick(spot.area, lang) || '';
  const bestTime = pick(spot.bestTime, lang);
  const tip = pick(spot.secretTip, lang) || pick(spot.tip, lang);
  const snapshot = await getCrowdSnapshot();
  const initial = snapshot.spots.find((s) => s.id === spot.id) ?? computeLiveSpotMetric(spot);
  const weekday = getHourlyForecast(spot, false);
  const weekend = getHourlyForecast(spot, true);
  const quietHour = formatHour(lang, getQuietestDaytimeHour(weekday));
  const busy = busiestRange(lang, spot);
  const nearby = getNearbySpots(spot, 4);
  const homeHref = localizePath('/', lang);
  const url = `${SITE_URL}${localizePath(path, lang)}`;

  const faqs = [
    { q: t('spot.faq.q1', { name }), a: t('spot.faq.a1', { quiet: quietHour, busy, best: bestTime }) },
    ...(spot.escapeRoute
      ? [
          {
            q: t('spot.faq.q2', { name }),
            a: t('spot.faq.a2', {
              gem: pick(spot.escapeRoute.gemName, lang),
              desc: pick(spot.escapeRoute.gemDesc, lang),
            }),
          },
        ]
      : []),
    { q: t('spot.faq.q3'), a: t('spot.faq.a3') },
  ];

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'TouristAttraction',
      name,
      alternateName: LANGS.filter((l) => l !== lang).map((l) => spot.name[l]),
      description: t('spot.metaDesc', { name, best: bestTime }),
      url,
      inLanguage: lang,
      geo: { '@type': 'GeoCoordinates', latitude: spot.lat, longitude: spot.lng },
      address: {
        '@type': 'PostalAddress',
        addressLocality: area || 'Seoul',
        addressRegion: 'Seoul',
        addressCountry: 'KR',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: t('spot.home'), item: `${SITE_URL}${homeHref}` },
        { '@type': 'ListItem', position: 2, name, item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];

  const kakao = { label: TRANSLATIONS[lang]['map.kakao'], href: getKakaoNavUrl(name, spot.lat, spot.lng), cls: 'bg-[#FEE500] text-gray-900' };
  const naver = { label: TRANSLATIONS[lang]['map.naver'], href: getNaverNavUrl(name, spot.lat, spot.lng), cls: 'bg-[#03C75A] text-white' };
  const google = { label: TRANSLATIONS[lang]['map.google'], href: getGoogleNavUrl(name, spot.lat, spot.lng), cls: 'bg-blue-600 text-white' };
  // Chinese pages: Naver first (Google Maps is hard to reach from mainland China).
  const mapLinks = isChinese(lang) ? [naver, kakao, google] : [kakao, naver, google];

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DashboardHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-5 space-y-4">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 dark:text-gray-400">
          <Link href={homeHref} className="hover:text-blue-600 dark:hover:text-blue-400">
            {t('spot.home')}
          </Link>
          <span className="mx-1.5">›</span>
          <span className="text-gray-700 dark:text-gray-200">{name}</span>
        </nav>

        <header>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            {spot.emoji && <span className="mr-2" aria-hidden="true">{spot.emoji}</span>}
            {name}
          </h1>
          {area && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{area}</p>}
        </header>

        <SpotLivePanel
          initial={initial}
          name={name}
          sharePath={path}
          shareImageUrl={`${url}/og`}
        />

        <section className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3 text-sm">
          <p className="text-gray-700 dark:text-gray-200">
            <strong className="font-semibold">⏰ {t('card.bestTime')}:</strong> {bestTime}
          </p>
          {tip && (
            <p className="text-gray-600 dark:text-gray-300">
              <strong className="font-semibold">💡 {t('card.secretTip')}:</strong> {tip}
            </p>
          )}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {mapLinks.map((m) => (
              <a
                key={m.label}
                href={m.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`h-11 rounded-xl font-bold text-xs flex items-center justify-center text-center px-2 ${m.cls}`}
              >
                {m.label}
              </a>
            ))}
          </div>
        </section>

        <section className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{t('spot.hourlyTitle')}</h2>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40">
              <dt className="text-gray-500 dark:text-gray-400">{t('spot.busiest')}</dt>
              <dd className="mt-0.5 font-bold text-rose-700 dark:text-rose-300">{busy}</dd>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
              <dt className="text-gray-500 dark:text-gray-400">{t('spot.quietest')}</dt>
              <dd className="mt-0.5 font-bold text-emerald-700 dark:text-emerald-300">{quietHour}</dd>
            </div>
          </dl>
          <ForecastBars points={weekday} label={t('spot.weekday')} lang={lang} />
          <ForecastBars points={weekend} label={t('spot.weekend')} lang={lang} />
        </section>

        {spot.escapeRoute && (
          <section className="p-5 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
            <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-300">💎 {t('card.escapeTitle')}</h2>
            <p className="mt-1 text-base font-bold text-gray-900 dark:text-white">{pick(spot.escapeRoute.gemName, lang)}</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{pick(spot.escapeRoute.gemDesc, lang)}</p>
            <p className="mt-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              {t('spot.escapeMeta', { min: spot.escapeRoute.walkMinutes, pct: spot.escapeRoute.crowdDiffPercent })}
            </p>
          </section>
        )}

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{t('spot.nearby')}</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {nearby.map(({ spot: s, distanceKm }) => (
              <li key={s.id}>
                <Link
                  href={localizePath(`/spot/${getSpotSlug(s)}`, lang)}
                  className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                    {s.emoji} {pick(s.name, lang)}
                  </span>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatDistance(distanceKm)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">{t('spot.faqTitle')}</h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <div key={f.q}>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Q. {f.q}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <Link
          href={homeHref}
          className="block h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center"
        >
          {t('spot.viewAll')} →
        </Link>
      </main>

      <BottomNav />
    </div>
  );
}
