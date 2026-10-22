import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CityId } from '@/types';
import { htmlLang, isLang, localizePath, pick } from '@/lib/i18n/routing';
import { quietestSpots } from '@/lib/rankings';
import { STATUS_COLOR } from '@/lib/mapSpots';
import { infoMetadata, tr } from '@/components/InfoPage';
import DashboardHeader from '@/components/DashboardHeader';
import BottomNav from '@/components/BottomNav';

type Params = Promise<{ lang: string }>;

// Same refresh as the Seoul card images.
export const revalidate = 300;
export const preferredRegion = 'icn1';

const CITIES: CityId[] = ['seoul', 'jeju', 'busan'];

export async function generateMetadata({ params }: { params: Params }) {
  const { lang } = await params;
  return isLang(lang) ? infoMetadata(lang, '/cards', 'cards.metaTitle', 'cards.metaDesc') : {};
}

export default async function CardsPage({ params }: { params: Params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = tr(lang);
  const rankings = await Promise.all(CITIES.map((city) => quietestSpots(city, 5)));

  return (
    <div className="min-h-screen pb-24 lg:pb-10" lang={htmlLang(lang)}>
      <DashboardHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">{t('cards.title')}</h1>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{t('cards.intro')}</p>
        </header>

        {rankings.map(({ city, live, spots }) => (
          // The list is the card's content as HTML; the PNGs (≈300 KB each) load only on download or preview.
          <section key={city} className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {t(live ? 'cards.headingLive' : 'cards.headingForecast').replace('{city}', t(`map.city.${city}`))} TOP5
            </h2>
            <ol className="space-y-2">
              {spots.map((r, i) => (
                <li key={r.slug}>
                  <Link
                    href={localizePath(`/spot/${r.slug}`, lang)}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <span className="w-5 text-sm font-black text-blue-500">{i + 1}</span>
                    <span className="text-xl" aria-hidden="true">{r.spot.emoji}</span>
                    <span className="flex-1 min-w-0 text-sm font-bold text-gray-900 dark:text-white truncate">{pick(r.spot.name, lang)}</span>
                    <span className="shrink-0 text-xs font-bold" style={{ color: STATUS_COLOR[r.status] }}>
                      {t(`card.status.${r.status}`)} {r.score}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            <div className="grid grid-cols-2 gap-2">
              {(['feed', 'story'] as const).map((size) => {
                const src = localizePath(`/cards/${city}-${size}.png`, lang);
                return (
                  <div key={size} className="flex flex-col gap-1">
                    <a
                      href={src}
                      download={`checkeastpoint-${city}-top5-${size}-${lang}.png`}
                      className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center"
                    >
                      {t('cards.download')} · {t(`cards.${size}`)}
                    </a>
                    <a href={src} target="_blank" rel="noopener" className="text-center text-[11px] text-gray-500 dark:text-gray-400 hover:text-blue-600">
                      {t('widget.preview')} ↗
                    </a>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <section className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">{t('cards.poster')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('cards.posterDesc')}</p>
          </div>
          <a
            href={`/posters/checkeastpoint-poster-${lang}.pdf`}
            download
            className="px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold"
          >
            PDF ↓
          </a>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
