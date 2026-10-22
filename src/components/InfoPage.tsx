import type { Metadata } from 'next';
import { Lang } from '@/types';
import { SITE_URL, htmlLang, localizePath, languageAlternates } from '@/lib/i18n/routing';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import DashboardHeader from '@/components/DashboardHeader';
import BottomNav from '@/components/BottomNav';

export const tr = (lang: Lang) => (key: string) => TRANSLATIONS[lang][key] ?? TRANSLATIONS.en[key] ?? TRANSLATIONS.ko[key] ?? key;

export function infoMetadata(lang: Lang, path: string, titleKey: string, descKey: string): Metadata {
  const t = tr(lang);
  const url = `${SITE_URL}${localizePath(path, lang)}`;
  return {
    title: { absolute: `${t(titleKey)} | Check East Point` },
    description: t(descKey),
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: { title: t(titleKey), description: t(descKey), url, siteName: 'Check East Point', type: 'article' },
  };
}

/** Simple text page (About, Methodology): a title and titled sections. */
export default function InfoPage({ lang, title, sections }: { lang: Lang; title: string; sections: { heading?: string; body: string }[] }) {
  return (
    <div className="min-h-screen pb-24 lg:pb-10" lang={htmlLang(lang)}>
      <DashboardHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 space-y-5">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">{title}</h1>
        {sections.map((s, i) => (
          <section key={i} className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            {s.heading && <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">{s.heading}</h2>}
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{s.body}</p>
          </section>
        ))}
      </main>
      <BottomNav />
    </div>
  );
}
