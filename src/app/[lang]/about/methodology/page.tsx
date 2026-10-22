import { notFound } from 'next/navigation';
import { isLang } from '@/lib/i18n/routing';
import InfoPage, { infoMetadata, tr } from '@/components/InfoPage';

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { lang } = await params;
  return isLang(lang) ? infoMetadata(lang, '/about/methodology', 'method.title', 'method.metaDesc') : {};
}

export default async function MethodologyPage({ params }: { params: Params }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = tr(lang);
  return (
    <InfoPage
      lang={lang}
      title={t('method.title')}
      sections={(['live', 'forecast', 'bands', 'limits', 'sources'] as const).map((k) => ({ heading: t(`method.${k}Title`), body: t(`method.${k}`) }))}
    />
  );
}
