import { JEJU_CCTV_ENABLED } from '@/config/features';
import Link from 'next/link';
import { ForecastSpot, Lang } from '@/types';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { SITE_URL, localizePath, pick, htmlLang } from '@/lib/i18n/routing';
import { ForecastData, isStale, statusOfRate, todayOf } from '@/lib/forecast';
import { busiestDay, formatForecastDate, quietestDay } from '@/lib/forecastMap';
import { getNearbyForecastSpots, getSameThemeForecastSpots } from '@/lib/forecastSpots';
import { getSpotSlug } from '@/lib/slug';
import { STATUS_COLOR } from '@/lib/mapSpots';
import { formatDistance, getGoogleNavUrl, getKakaoNavUrl, getNaverNavUrl } from '@/lib/geoUtils';
import DashboardHeader from '@/components/DashboardHeader';
import BottomNav from '@/components/BottomNav';
import ShareButton from '@/components/ShareButton';
import AffiliateBox from '@/components/AffiliateBox';

const STATUS_KEY = {
  relaxed: 'card.status.relaxed',
  moderate: 'card.status.moderate',
  crowded: 'card.status.crowded',
  very_crowded: 'card.status.very_crowded',
  packed: 'card.status.very_crowded',
} as const;

function translator(lang: Lang) {
  return (key: string, vars: Record<string, string | number> = {}) =>
    (TRANSLATIONS[lang][key] ?? TRANSLATIONS.en[key] ?? TRANSLATIONS.ko[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

/** FAQ entries, shared with the page's FAQPage JSON-LD. */
export function forecastFaqs(spot: ForecastSpot, data: ForecastData, lang: Lang) {
  const t = translator(lang);
  const name = pick(spot.name, lang);
  const days = data.spots[spot.id];
  const quiet = quietestDay(days);
  const busy = busiestDay(days);
  return [
    ...(quiet && busy
      ? [{ q: t('forecast.faq.q1', { name }), a: t('forecast.faq.a1', { quiet: formatForecastDate(quiet.date, lang), busy: formatForecastDate(busy.date, lang) }) }]
      : []),
    {
      q: t('spot.faq.qNearby', { name }),
      a: t('spot.faq.aNearby', {
        list: getNearbyForecastSpots(spot, 3).map((n) => pick(n.spot.name, lang)).join(lang === 'en' || lang === 'ko' ? ', ' : '、'),
      }),
    },
    { q: t('forecast.faq.q2'), a: t('forecast.faq.a2') },
    ...(spot.station
      ? [{ q: t('forecast.faq.q3', { name }), a: t('forecast.faq.a3', { station: spot.station.name, exit: spot.station.exit }) }]
      : []),
  ];
}

export default function ForecastSpotView({ spot, data, lang }: { spot: ForecastSpot; data: ForecastData; lang: Lang }) {
  const t = translator(lang);
  const name = pick(spot.name, lang);
  const slug = getSpotSlug(spot);
  const path = `/spot/${slug}`;
  const url = `${SITE_URL}${localizePath(path, lang)}`;
  const hubPath = localizePath(`/${spot.city}`, lang);
  const cityName = t(`map.city.${spot.city}`);
  const days = data.spots[spot.id] ?? [];
  const today = todayOf(days);
  const rate = today ? Math.round(today.rate) : null;
  const status = statusOfRate(rate ?? 0);
  const color = STATUS_COLOR[status];
  const sortedByRate = [...days].sort((a, b) => a.rate - b.rate);
  const quietDays = sortedByRate.slice(0, 3);
  const busyDays = sortedByRate.slice(-3).reverse();
  const nearby = getNearbyForecastSpots(spot, 4);
  const sameTheme = getSameThemeForecastSpots(spot, 4);
  const faqs = forecastFaqs(spot, data, lang);
  const listSep = lang === 'en' || lang === 'ko' ? ', ' : '、';
  const quietD = sortedByRate[0];
  const busyD = sortedByRate[sortedByRate.length - 1];
  const about = t('forecast.about', {
    name,
    city: cityName,
    area: pick(spot.area, lang),
    theme: t(`category.${spot.category}`),
    score: rate ?? '-',
    status: t(STATUS_KEY[status]),
    quiet: quietD ? formatForecastDate(quietD.date, lang) : '-',
    busy: busyD ? formatForecastDate(busyD.date, lang) : '-',
    station: spot.station ? t('forecast.aboutStation', { station: spot.station.name, exit: spot.station.exit }) : '',
    nearby: nearby.slice(0, 3).map((n) => pick(n.spot.name, lang)).join(listSep),
  });
  const baseLine = isStale(data) ? t('forecast.snapshotNote', { date: data.baseDate ?? '' }) : t('forecast.baseDate', { date: data.baseDate ?? '' });

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'TouristAttraction',
      name,
      alternateName: (['ko', 'en', 'ja'] as const).filter((l) => l !== lang).map((l) => spot.name[l]),
      url,
      description: about,
      image: `${url}/og`,
      inLanguage: htmlLang(lang),
      geo: { '@type': 'GeoCoordinates', latitude: spot.lat, longitude: spot.lng },
      address: { '@type': 'PostalAddress', addressLocality: pick(spot.area, lang), addressRegion: cityName, addressCountry: 'KR' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: t('forecast.metaTitle', { name }),
      url,
      inLanguage: htmlLang(lang),
      dateModified: data.baseDate ?? undefined,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: t('forecast.hubName', { city: cityName }), item: `${SITE_URL}${hubPath}` },
        { '@type': 'ListItem', position: 2, name, item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];

  const mapLinks = [
    // Naver/Kakao first: they work best for Korean addresses.
    { label: TRANSLATIONS[lang]['map.naver'], href: getNaverNavUrl(spot.name.ko, spot.lat, spot.lng), cls: 'bg-[#03C75A] text-white' },
    { label: TRANSLATIONS[lang]['map.kakao'], href: getKakaoNavUrl(spot.name.ko, spot.lat, spot.lng), cls: 'bg-[#FEE500] text-gray-900' },
    { label: TRANSLATIONS[lang]['map.google'], href: getGoogleNavUrl(name, spot.lat, spot.lng), cls: 'bg-blue-600 text-white' },
  ];
  const maxRate = Math.max(100, ...days.map((d) => d.rate));
  const shareText = rate !== null ? `${name} · ${t('forecast.today')} ${rate}/100 (${t(STATUS_KEY[status])})` : name;

  return (
    <div className="min-h-screen pb-24 lg:pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DashboardHeader live={false} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-5 space-y-4">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 dark:text-gray-400">
          <Link href={hubPath} className="hover:text-blue-600 dark:hover:text-blue-400">
            {t('forecast.hubName', { city: cityName })}
          </Link>
          <span className="mx-1.5">›</span>
          <span className="text-gray-700 dark:text-gray-200">{name}</span>
        </nav>

        <header>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            <span className="mr-2" aria-hidden="true">{spot.emoji}</span>
            {name}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{pick(spot.area, lang)}</p>
          {data.baseDate && (
            <p className="mt-1 text-[11px] text-gray-400">
              <time dateTime={data.baseDate}>{t('spot.updatedAt', { date: data.baseDate })}</time>
            </p>
          )}
        </header>

        <section className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">{t('forecast.today')}</h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
              {t('forecast.badge')}
            </span>
          </div>
          {rate !== null && (
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-6xl font-black tabular-nums tracking-tight" style={{ color }}>
                {rate}
              </span>
              <span className="text-sm font-bold text-gray-400">/100</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: color }}>
                {t(STATUS_KEY[status])}
              </span>
            </div>
          )}
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {baseLine} · {t('forecast.scale')}
          </p>
          <ShareButton path={path} title={name} text={shareText} imageUrl={`${url}/og`} className="mt-4 w-full" />
        </section>

        <section className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{t('forecast.chartTitle')}</h2>
          <div className="flex items-end gap-[2px] h-32" role="img" aria-label={t('forecast.chartTitle')}>
            {days.map((d) => {
              const weekday = new Date(`${d.date}T00:00:00Z`).getUTCDay();
              return (
                <div
                  key={d.date}
                  title={`${formatForecastDate(d.date, lang)}: ${Math.round(d.rate)}`}
                  className={`flex-1 rounded-t ${weekday === 0 || weekday === 6 ? 'opacity-100' : 'opacity-80'}`}
                  style={{ height: `${Math.max(6, (d.rate / maxRate) * 100)}%`, backgroundColor: STATUS_COLOR[statusOfRate(d.rate)] }}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-gray-400">
            {days.filter((_, i) => i % 7 === 0).map((d) => (
              <span key={d.date}>{formatForecastDate(d.date, lang)}</span>
            ))}
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
              <dt className="text-gray-500 dark:text-gray-400">{t('forecast.quietDays')}</dt>
              <dd className="mt-1 font-bold text-emerald-700 dark:text-emerald-300 space-y-0.5">
                {quietDays.map((d) => (
                  <div key={d.date}>
                    {formatForecastDate(d.date, lang)} · {Math.round(d.rate)}
                  </div>
                ))}
              </dd>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40">
              <dt className="text-gray-500 dark:text-gray-400">{t('forecast.busyDays')}</dt>
              <dd className="mt-1 font-bold text-rose-700 dark:text-rose-300 space-y-0.5">
                {busyDays.map((d) => (
                  <div key={d.date}>
                    {formatForecastDate(d.date, lang)} · {Math.round(d.rate)}
                  </div>
                ))}
              </dd>
            </div>
          </dl>
        </section>

        {(spot.station || (JEJU_CCTV_ENABLED && spot.camera)) && (
          <section className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3 text-sm">
            {spot.station && (
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400">🚇 {t('forecast.station')}</p>
                <p className="mt-1 font-bold text-gray-900 dark:text-white">
                  {spot.station.name} · {t('forecast.exit', { exit: spot.station.exit })}
                </p>
                <p className="mt-1 text-[11px] text-gray-400">{t('forecast.stationSource')}</p>
              </div>
            )}
            {JEJU_CCTV_ENABLED && spot.camera && (
              <div>
                <a
                  href={spot.camera.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold"
                >
                  📹 {t('forecast.camera')} ↗
                </a>
                <p className="mt-1 text-[11px] text-gray-400">{t('forecast.cameraNote', { name: spot.camera.name })}</p>
              </div>
            )}
          </section>
        )}

        <section className="grid grid-cols-3 gap-2">
          {mapLinks.map((m) => (
            <a key={m.label} href={m.href} target="_blank" rel="noopener noreferrer" className={`h-11 rounded-xl font-bold text-xs flex items-center justify-center px-2 ${m.cls}`}>
              {m.label}
            </a>
          ))}
        </section>

        <AffiliateBox lang={lang} name={name} enName={spot.name.en} slug={slug} />

        <section className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{t('spot.aboutTitle', { name })}</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{about}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{t('spot.nearby')}</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {nearby.map(({ spot: s, distanceKm }) => {
              const r = todayOf(data.spots[s.id])?.rate;
              return (
                <li key={s.id}>
                  <Link
                    href={localizePath(`/spot/${getSpotSlug(s)}`, lang)}
                    className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700"
                  >
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                      {s.emoji} {pick(s.name, lang)}
                    </span>
                    <span className="text-xs text-gray-400 shrink-0 tabular-nums">
                      {r !== undefined ? `${Math.round(r)} · ` : ''}
                      {formatDistance(distanceKm)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {sameTheme.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">{t('spot.sameTheme')}</h2>
            <ul className="flex flex-wrap gap-2">
              {sameTheme.map((s) => (
                <li key={s.id}>
                  <Link
                    href={localizePath(`/spot/${getSpotSlug(s)}`, lang)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:border-blue-400"
                  >
                    {s.emoji} {pick(s.name, lang)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

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

        <p className="text-[11px] text-gray-400">{t('forecast.source')}</p>

        <Link href={hubPath} className="h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center">
          {t('forecast.hubName', { city: cityName })} →
        </Link>
      </main>

      <BottomNav />
    </div>
  );
}
