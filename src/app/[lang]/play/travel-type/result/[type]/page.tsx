import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LANGS, SITE_URL, isLang, languageAlternates, localizePath } from '@/lib/i18n/routing';
import { TYPES, TYPE_KEYS, loc, resultPath, tt, typeBySlug } from '@/lib/travelType';
import { picksFor } from '@/lib/travelTypePicks';
import DashboardHeader from '@/components/DashboardHeader';
import BottomNav from '@/components/BottomNav';
import TravelTypeResult from '@/components/travel-type/TravelTypeResult';

type Params = Promise<{ lang: string; type: string }>;

// Picks show today's crowd level; Seoul data refreshes every 5 minutes.
export const revalidate = 300;
export const preferredRegion = 'icn1';
export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.flatMap((lang) => TYPE_KEYS.map((k) => ({ lang, type: TYPES[k].slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, type } = await params;
  const key = typeBySlug(type);
  if (!isLang(lang) || !key) return {};
  const info = TYPES[key];
  const title = `${loc(info.name, lang)} — ${loc(info.tagline, lang)}`;
  const description = `${loc(info.desc, lang).split(/(?<=[.。!?])\s/)[0]} ${tt('direction', lang)}: ${loc(info.direction, lang)}`;
  const path = resultPath(key);
  const url = `${SITE_URL}${localizePath(path, lang)}`;
  return {
    title: { absolute: `${title} | ${tt('title', lang)}` },
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: { title, description, url, siteName: 'Check East Point', type: 'website', images: [{ url: `${url}/og`, width: 1200, height: 630, alt: title }] },
    twitter: { card: 'summary_large_image', title, description, images: [`${url}/og`] },
  };
}

export default async function TravelTypeResultPage({ params }: { params: Params }) {
  const { lang, type } = await params;
  const key = typeBySlug(type);
  if (!isLang(lang) || !key) notFound();
  const picks = await picksFor(key, lang);
  return (
    <div className="min-h-screen bg-[#f6f4ff] text-slate-900 flex flex-col pb-24">
      <DashboardHeader />
      <main className="flex-1 max-w-lg w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <TravelTypeResult typeKey={key} picks={picks} />
      </main>
      <BottomNav />
    </div>
  );
}
