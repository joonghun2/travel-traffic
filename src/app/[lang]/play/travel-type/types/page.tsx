import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SITE_URL, isLang, languageAlternates, localizePath } from '@/lib/i18n/routing';
import { RARITY, STATS, TEST_PATH, THEME, TYPES, TYPE_KEYS, loc, resultPath, tt } from '@/lib/travelType';
import DashboardHeader from '@/components/DashboardHeader';
import BottomNav from '@/components/BottomNav';

type Params = Promise<{ lang: string }>;
const PATH = `${TEST_PATH}/types`;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const title = `${tt('typesTitle', lang)} — ${tt('title', lang)}`;
  const description = TYPE_KEYS.map((k) => loc(TYPES[k].name, lang)).join(' · ');
  const url = `${SITE_URL}${localizePath(PATH, lang)}`;
  return {
    title: { absolute: `${title} | Check East Point` },
    description,
    alternates: { canonical: url, languages: languageAlternates(PATH) },
    openGraph: { title, description, url, siteName: 'Check East Point', type: 'website' },
  };
}

export default async function TravelTypesPage({ params }: { params: Params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <div className="min-h-screen bg-[#f6f4ff] text-slate-900 flex flex-col pb-24">
      <DashboardHeader />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 pt-6 space-y-5">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{tt('typesTitle', lang)}</h1>
        <section className="p-5 rounded-3xl bg-white">
          <h2 className="text-base font-extrabold">{tt('statsHow', lang)}</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{tt('statsHowDesc', lang)}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {STATS.map((s) => (
              <span key={s} className="px-2.5 py-1 rounded-full bg-violet-50 text-xs font-bold text-violet-700">
                {tt(`stat.${s}`, lang)}
              </span>
            ))}
          </div>
        </section>
        <ul className="grid sm:grid-cols-2 gap-3">
          {TYPE_KEYS.map((k) => (
            <li key={k}>
              <Link href={localizePath(resultPath(k), lang)} className="block h-full p-5 rounded-3xl hover:shadow-md transition" style={{ background: THEME[k].bg }}>
                <p className="text-xs font-bold" style={{ color: THEME[k].accent }}>
                  {tt('rarity', lang, { n: RARITY[k] })}
                </p>
                <h2 className="mt-1 text-xl font-black">{loc(TYPES[k].name, lang)}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-700">{loc(TYPES[k].tagline, lang)}</p>
                <p className="mt-2 text-xs text-slate-600">{loc(TYPES[k].direction, lang)}</p>
              </Link>
            </li>
          ))}
        </ul>
        <Link href={localizePath(TEST_PATH, lang)} className="block w-full h-14 rounded-2xl bg-violet-600 text-white text-lg font-extrabold text-center leading-[3.5rem]">
          {tt('start', lang)} →
        </Link>
        <p className="text-[11px] leading-relaxed text-slate-400">{tt('disclaimer', lang)}</p>
      </main>
      <BottomNav />
    </div>
  );
}
