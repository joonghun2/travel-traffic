import { LiveSpotMetric } from '@/types';
import { calculateDistanceKm } from '@/lib/geoUtils';

/**
 * The n quietest places around a point: live readings within radiusKm first,
 * widened to the nearest places when too few are that close.
 */
export function pickQuietNear(spots: LiveSpotMetric[], [lat, lng]: [number, number], n = 3, radiusKm = 2.5): LiveSpotMetric[] {
  const byDistance = spots
    .map((s) => ({ s, d: calculateDistanceKm(lat, lng, s.lat, s.lng) }))
    .sort((a, b) => a.d - b.d);
  const near = byDistance.filter((x) => x.d <= radiusKm);
  const pool = (near.length >= n * 2 ? near : byDistance.slice(0, Math.max(n * 3, near.length))).map((x) => x.s);
  return pool.sort((a, b) => Number(!a.isLive) - Number(!b.isLive) || a.currentScore - b.currentScore).slice(0, n);
}
