import { ThemeHubPage, themeMetadata, themeStaticParams } from '@/components/city/ThemeHub';

export const dynamicParams = false;
export const revalidate = 3600;
export const preferredRegion = 'icn1';
export const generateStaticParams = themeStaticParams('jeju');
export const generateMetadata = themeMetadata('jeju');

export default function Page({ params }: { params: Promise<{ lang: string; theme: string }> }) {
  return <ThemeHubPage params={params} city="jeju" />;
}
