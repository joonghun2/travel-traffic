import { notFound } from 'next/navigation';
import { isLang } from '@/lib/i18n/routing';
import InfoPage, { infoMetadata, tr } from '@/components/InfoPage';

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { lang } = await params;
  return isLang(lang) ? infoMetadata(lang, '/about', 'about.title', 'about.metaDesc') : {};
}

export default async function AboutPage({ params }: { params: Params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = tr(lang);
  return <InfoPage lang={lang} title={t('about.title')} sections={[{ body: t('about.p1') }, { body: t('about.p2') }, { body: t('about.p3') }]} />;
}
