import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ForecastCityId } from '@/types';
import { SITE_URL, isLang, languageAlternates, localizePath } from '@/lib/i18n/routing';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { getForecast, isStale } from '@/lib/forecast';
import { forecastToMapSpots } from '@/lib/forecastMap';
import MapHome from '@/components/map/MapHome';
import { jejuMapCameras } from '@/lib/jejuCameras';

type Params = Promise<{ lang: string }>;

export function forecastHubMetadata(city: ForecastCityId) {
  return async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { lang } = await params;
    if (!isLang(lang)) return {};
    const title = TRANSLATIONS[lang][`hub.${city}.title`];
    const description = TRANSLATIONS[lang][`hub.${city}.desc`];
    const path = `/${city}`;
    const url = `${SITE_URL}${localizePath(path, lang)}`;
    return {
      title: { absolute: `${title} | Check East Point` },
      description,
      alternates: { canonical: url, languages: languageAlternates(path) },
      openGraph: { title, description, url, siteName: 'Check East Point', type: 'website' },
    };
  };
}

/** Jeju/Busan hub: the same map UI as Seoul, fed by the KTO 30-day forecast. */
export async function ForecastHubPage({ params, city }: { params: Params; city: ForecastCityId }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const data = await getForecast();
  return (
    <MapHome
      city={city}
      initialSpots={forecastToMapSpots(data, city, lang)}
      liveCount={0}
      baseDate={data.baseDate}
      fromSnapshot={isStale(data)}
      cameras={city === 'jeju' ? jejuMapCameras(lang) : undefined}
    />
  );
}
