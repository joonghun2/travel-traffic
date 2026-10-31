import type { Metadata } from 'next';
import { SITE_URL, isLang, languageAlternates, localizePath } from '@/lib/i18n/routing';
import { BF_TEXT } from '@/data/busanFood';
import DashboardHeader from '@/components/DashboardHeader';
import BottomNav from '@/components/BottomNav';
import BusanFoodOlympics from '@/components/BusanFoodOlympics';

const PATH = '/play/busan-food-olympics';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const title = BF_TEXT[lang].metaTitle;
  const description = BF_TEXT[lang].metaDesc;
  const url = `${SITE_URL}${localizePath(PATH, lang)}`;

  return {
    title: { absolute: `${title} | Check East Point` },
    description,
    alternates: { canonical: url, languages: languageAlternates(PATH) },
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

export default function BusanFoodOlympicsPage() {
  return (
    <div className="min-h-screen bg-[#0d0e12] text-white flex flex-col pb-24">
      <DashboardHeader />
      <main className="flex-1 max-w-lg w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        <BusanFoodOlympics />
      </main>
      <BottomNav />
    </div>
  );
}
