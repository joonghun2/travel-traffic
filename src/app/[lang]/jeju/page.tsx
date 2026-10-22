import { ForecastHubPage, forecastHubMetadata } from '@/components/city/forecastHub';

// The KTO forecast is refreshed daily; re-render hourly so the "today" column moves on time.
export const revalidate = 3600;
export const preferredRegion = 'icn1';
export const generateMetadata = forecastHubMetadata('jeju');

export default function Page({ params }: { params: Promise<{ lang: string }> }) {
  return <ForecastHubPage params={params} city="jeju" />;
}
