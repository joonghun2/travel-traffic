import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LANGS, SITE_URL, isLang, languageAlternates, localizePath } from '@/lib/i18n/routing';
import { FOOD_TYPES, FOOD_TYPE_IDS, TEST_PATH, isFoodTypeId, ui } from '@/data/seoulFoodTest';
import DashboardHeader from '@/components/DashboardHeader';
import BottomNav from '@/components/BottomNav';
import { SeoulFoodTestResult } from '@/components/SeoulFoodTest';

type Params = Promise<{ lang: string; type: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.flatMap((lang) => FOOD_TYPE_IDS.map((type) => ({ lang, type })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, type } = await params;
  if (!isLang(lang) || !isFoodTypeId(type)) return {};
  const info = FOOD_TYPES[type];
  const title = `${ui('todayIs', lang)} ${info.title[lang]} ${info.emoji}`;
  const description = `${ui('bestMenu', lang)}: ${info.menu[lang]} — ${info.desc[lang]}`;
  const path = `${TEST_PATH}/result/${type}`;
  const url = `${SITE_URL}${localizePath(path, lang)}`;

  return {
    title: { absolute: `${title} | ${ui('title', lang)}` },
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Check East Point',
      type: 'website',
      images: [{ url: `${url}/og`, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [`${url}/og`] },
  };
}

export default async function SeoulFoodTestResultPage({ params }: { params: Params }) {
  const { type } = await params;
  if (!isFoodTypeId(type)) notFound();

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white flex flex-col pb-24">
      <DashboardHeader />
      <main className="flex-1 max-w-lg w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        <SeoulFoodTestResult type={type} />
      </main>
      <BottomNav />
    </div>
  );
}
