import type { Metadata } from 'next';
import { SITE_URL, isLang, languageAlternates, localizePath } from '@/lib/i18n/routing';
import { TEST_PATH, tt } from '@/lib/travelType';
import DashboardHeader from '@/components/DashboardHeader';
import BottomNav from '@/components/BottomNav';
import TravelTypeQuiz from '@/components/travel-type/TravelTypeQuiz';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const title = tt('metaTitle', lang);
  const description = tt('metaDesc', lang);
  const url = `${SITE_URL}${localizePath(TEST_PATH, lang)}`;
  const image = `${SITE_URL}${localizePath(`${TEST_PATH}/result/romantic-solitary`, lang)}/og`;
  return {
    title: { absolute: `${title} | Check East Point` },
    description,
    alternates: { canonical: url, languages: languageAlternates(TEST_PATH) },
    openGraph: { title, description, url, siteName: 'Check East Point', type: 'website', images: [{ url: image, width: 1200, height: 630, alt: title }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default function TravelTypePage() {
  return (
    <div className="min-h-screen bg-[#f6f4ff] text-slate-900 flex flex-col pb-24">
      <DashboardHeader />
      <main className="flex-1 max-w-lg w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        <TravelTypeQuiz />
      </main>
      <BottomNav />
    </div>
  );
}
