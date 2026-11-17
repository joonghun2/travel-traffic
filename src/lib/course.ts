import { LiveSpotMetric, Spot } from '@/types';
import { getNearbySpots } from '@/lib/spots';

export interface CourseStop {
  spot: Spot;
  distanceKm: number;
  m: LiveSpotMetric;
}

/**
 * A short sightseeing course around a spot: the spot plus up to 3 neighbors within 3.5 km
 * (stations skipped), ordered quietest first by the current crowd score.
 */
export function courseStops(spot: Spot, metric: LiveSpotMetric, metrics: LiveSpotMetric[]): CourseStop[] {
  const near = getNearbySpots(spot, 10)
    .filter((n) => n.distanceKm <= 3.5 && !/station/i.test(n.spot.name.en))
    .slice(0, 3)
    .map((n) => ({ ...n, m: metrics.find((x) => x.id === n.spot.id) }));
  return [{ spot, distanceKm: 0, m: metric }, ...near]
    .filter((s): s is CourseStop => Boolean(s.m))
    .sort((a, b) => a.m.currentScore - b.m.currentScore);
}
