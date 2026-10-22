import { ForecastSpot } from '@/types';
import { FORECAST_SPOTS } from '@/data/spots/forecastSpots';
import { getSpotSlug } from '@/lib/slug';
import { calculateDistanceKm } from '@/lib/geoUtils';

const BY_SLUG = new Map(FORECAST_SPOTS.map((s) => [getSpotSlug(s), s]));

export function getForecastSpotBySlug(slug: string): ForecastSpot | undefined {
  return BY_SLUG.get(slug);
}

export function getAllForecastSlugs(): string[] {
  return [...BY_SLUG.keys()];
}

export function getNearbyForecastSpots(spot: ForecastSpot, count: number) {
  return FORECAST_SPOTS.filter((s) => s.city === spot.city && s.id !== spot.id)
    .map((s) => ({ spot: s, distanceKm: calculateDistanceKm(spot.lat, spot.lng, s.lat, s.lng) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, count);
}
