import { Spot } from '@/types';
import { SPOTS_DATA } from '@/data/spotsData';
import { computeLiveSpotMetric } from '@/lib/crowdEngine';
import { calculateDistanceKm } from '@/lib/geoUtils';
import { getSpotSlug } from '@/lib/slug';

export { getSpotSlug };

const SPOTS_BY_SLUG = new Map(SPOTS_DATA.map((spot) => [getSpotSlug(spot), spot]));

export function getSpotBySlug(slug: string): Spot | undefined {
  return SPOTS_BY_SLUG.get(slug);
}

export function getAllSpotSlugs(): string[] {
  return [...SPOTS_BY_SLUG.keys()];
}

export function getNearbySpots(spot: Spot, count: number): { spot: Spot; distanceKm: number }[] {
  return SPOTS_DATA.filter((s) => s.id !== spot.id)
    .map((s) => ({ spot: s, distanceKm: calculateDistanceKm(spot.lat, spot.lng, s.lat, s.lng) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, count);
}

export interface HourlyPoint {
  hour: number;
  score: number;
}

// Typical crowd score for each KST hour on a weekday (Wed) or weekend (Sat).
export function getHourlyForecast(spot: Spot, weekend: boolean): HourlyPoint[] {
  const day = weekend ? 10 : 7; // 2026-01-10 is a Saturday, 2026-01-07 a Wednesday
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    score: computeLiveSpotMetric(spot, new Date(Date.UTC(2026, 0, day, hour - 9, 0))).currentScore,
  }));
}

export function getQuietestDaytimeHour(points: HourlyPoint[]): number {
  return points
    .filter((p) => p.hour >= 9 && p.hour <= 21)
    .reduce((min, p) => (p.score < min.score ? p : min)).hour;
}
