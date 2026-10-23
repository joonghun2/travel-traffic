import { notFound } from 'next/navigation';
import { LANGS, isLang } from '@/lib/i18n/routing';
import InfoPage, { infoMetadata, tr } from '@/components/InfoPage';

type Params = Promise<{ lang: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { lang } = await params;
  return isLang(lang) ? infoMetadata(lang, '/terms', 'terms.title', 'terms.metaDesc') : {};
}

export default async function TermsPage({ params }: { params: Params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = tr(lang);
  const sections = [
    { body: t('terms.intro') },
    ...Array.from({ length: 7 }, (_, i) => ({ heading: t(`terms.s${i + 1}.h`), body: t(`terms.s${i + 1}.b`) })),
  ];
  return <InfoPage lang={lang} title={t('terms.title')} sections={sections} />;
}
