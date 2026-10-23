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
  return isLang(lang) ? infoMetadata(lang, '/privacy', 'privacy.title', 'privacy.metaDesc') : {};
}

export default async function PrivacyPage({ params }: { params: Params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = tr(lang);
  const sections = [
    { body: t('privacy.intro') },
    ...Array.from({ length: 10 }, (_, i) => ({ heading: t(`privacy.s${i + 1}.h`), body: t(`privacy.s${i + 1}.b`) })),
  ];
  return <InfoPage lang={lang} title={t('privacy.title')} sections={sections} />;
}
