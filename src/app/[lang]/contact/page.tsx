import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LANGS, isLang, localizePath } from '@/lib/i18n/routing';
import InfoPage, { infoMetadata, tr } from '@/components/InfoPage';
import { CONTACT_EMAIL } from '@/config/site';

type Params = Promise<{ lang: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { lang } = await params;
  return isLang(lang) ? infoMetadata(lang, '/contact', 'contact.title', 'contact.metaDesc') : {};
}

export default async function ContactPage({ params }: { params: Params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = tr(lang);
  return (
    <InfoPage lang={lang} title={t('contact.title')} sections={[{ body: t('contact.intro') }]}>
      <section className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-3">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">{t('contact.email')}</p>
        <p className="text-lg font-black text-gray-900 dark:text-white break-all">{CONTACT_EMAIL}</p>
        <a
          href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('[Check East Point] ')}`}
          className="inline-flex h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold items-center"
        >
          ✉️ {t('contact.send')}
        </a>
      </section>
      <section className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">{t('contact.topics.h')}</h2>
        <p className="text-sm leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-300">{t('contact.topics.b')}</p>
      </section>
      <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
        {t('contact.note')}{' '}
        <Link href={localizePath('/privacy', lang)} className="text-blue-600 hover:underline">
          {t('privacy.title')} →
        </Link>
      </p>
    </InfoPage>
  );
}
