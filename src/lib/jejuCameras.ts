import { Lang } from '@/types';
import { JEJU_CAMERAS } from '@/data/jejuCameras';
import { FORECAST_SPOTS } from '@/data/spots/forecastSpots';
import { calculateDistanceKm } from '@/lib/geoUtils';
import { getSpotSlug } from '@/lib/slug';
import { pick } from '@/lib/i18n/routing';

/** Cameras farther than this from every spot get no "near" spot. */
const NEAR_KM = 5;

/** Single-language camera record for the map and the /jeju/cctv page. */
export interface MapCamera {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  url: string;
  count: number;
  near?: { id: number; slug: string; name: string; km: number };
}

export function jejuMapCameras(lang: Lang): MapCamera[] {
  const spots = FORECAST_SPOTS.filter((s) => s.city === 'jeju');
  return JEJU_CAMERAS.map((c) => {
    const nearest = spots
      .map((s) => ({ s, km: calculateDistanceKm(c.lat, c.lng, s.lat, s.lng) }))
      .sort((a, b) => a.km - b.km)[0];
    return {
      ...c,
      near:
        nearest && nearest.km <= NEAR_KM
          ? { id: nearest.s.id, slug: getSpotSlug(nearest.s), name: pick(nearest.s.name, lang), km: Math.round(nearest.km * 10) / 10 }
          : undefined,
    };
  });
}
