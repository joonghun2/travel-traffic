import { notFound } from 'next/navigation';
import { CityId } from '@/types';
import { htmlLang, isLang, localizePath } from '@/lib/i18n/routing';
import { infoMetadata, tr } from '@/components/InfoPage';
import DashboardHeader from '@/components/DashboardHeader';
import BottomNav from '@/components/BottomNav';

type Params = Promise<{ lang: string }>;

const CITIES: CityId[] = ['seoul', 'jeju', 'busan'];

export async function generateMetadata({ params }: { params: Params }) {
  const { lang } = await params;
  return isLang(lang) ? infoMetadata(lang, '/cards', 'cards.metaTitle', 'cards.metaDesc') : {};
}

export default async function CardsPage({ params }: { params: Params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = tr(lang);

  return (
    <div className="min-h-screen pb-24 lg:pb-10" lang={htmlLang(lang)}>
      <DashboardHeader />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">{t('cards.title')}</h1>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{t('cards.intro')}</p>
        </header>

        {CITIES.map((city) => (
          <section key={city} className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t(`map.city.${city}`)}</h2>
            <div className="grid grid-cols-2 gap-4">
              {(['feed', 'story'] as const).map((size) => {
                const src = localizePath(`/cards/${city}-${size}.png`, lang);
                return (
                  <figure key={size} className="space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`${t(`map.city.${city}`)} TOP5 — ${t(`cards.${size}`)}`}
                      width={1080}
                      height={size === 'feed' ? 1350 : 1920}
                      loading="lazy"
                      className="w-full h-auto rounded-2xl border border-gray-100 dark:border-gray-800 bg-slate-900"
                    />
                    <figcaption className="flex items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{t(`cards.${size}`)}</span>
                      <a
                        href={src}
                        download={`checkeastpoint-${city}-top5-${size}-${lang}.png`}
                        className="shrink-0 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
                      >
                        {t('cards.download')}
                      </a>
                    </figcaption>
                  </figure>
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
