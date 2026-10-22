import { notFound } from 'next/navigation';
import { CityId } from '@/types';
import { htmlLang, isLang, pick } from '@/lib/i18n/routing';
import { citySpots } from '@/lib/themes';
import { getSpotSlug } from '@/lib/slug';
import { infoMetadata, tr } from '@/components/InfoPage';
import DashboardHeader from '@/components/DashboardHeader';
import BottomNav from '@/components/BottomNav';
import WidgetBuilder from '@/components/WidgetBuilder';

type Params = Promise<{ lang: string }>;

const CITIES: CityId[] = ['seoul', 'jeju', 'busan'];

export async function generateMetadata({ params }: { params: Params }) {
  const { lang } = await params;
  return isLang(lang) ? infoMetadata(lang, '/widget', 'widget.metaTitle', 'widget.metaDesc') : {};
}

export default async function WidgetPage({ params }: { params: Params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = tr(lang);
  const groups = CITIES.map((city) => ({
    city,
    label: t(`map.city.${city}`),
    spots: citySpots(city)
      .map((s) => ({ slug: getSpotSlug(s), name: pick(s.name, lang), city }))
      .sort((a, b) => a.name.localeCompare(b.name, lang)),
  }));

  return (
    <div className="min-h-screen pb-24 lg:pb-10" lang={htmlLang(lang)}>
      <DashboardHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-5">
        <header className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">{t('widget.title')}</h1>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{t('widget.intro')}</p>
        </header>
        <section className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <WidgetBuilder groups={groups} />
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
