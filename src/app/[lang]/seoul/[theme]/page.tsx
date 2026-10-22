import { ThemeHubPage, themeMetadata, themeStaticParams } from '@/components/city/ThemeHub';

export const dynamicParams = false;
export const revalidate = 300;
export const preferredRegion = 'icn1';
export const generateStaticParams = themeStaticParams('seoul');
export const generateMetadata = themeMetadata('seoul');

export default function Page({ params }: { params: Promise<{ lang: string; theme: string }> }) {
  return <ThemeHubPage params={params} city="seoul" />;
}
