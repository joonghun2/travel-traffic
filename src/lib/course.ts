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

/** Spots that show the course card, with the area name used in its title. */
export const COURSE_AREAS: Record<string, { ko: string; en: string }> = {
  'lotte-world-theme-park-magic-island': { ko: '잠실', en: 'Jamsil' },
  'jamsil-lotte-world-mall-seokchon-lake': { ko: '잠실', en: 'Jamsil' },
  'gyeongbokgung-palace-gwanghwamun': { ko: '경복궁·광화문', en: 'Gyeongbokgung' },
  'myeongdong-shopping-street-cathedral': { ko: '명동', en: 'Myeongdong' },
  'n-seoul-tower-namsan-park': { ko: '남산', en: 'Namsan' },
  'bukchon-hanok-village': { ko: '북촌·삼청동', en: 'Bukchon' },
  'hongdae-walking-street-busking-zone': { ko: '홍대', en: 'Hongdae' },
  'gwangjang-market-food-alley': { ko: '종로·광장시장', en: 'Gwangjang Market' },
};

export const hasCourse = (slug: string) => slug in COURSE_AREAS;

/** "잠실 최적 코스" / "Best Jamsil route". */
export function courseTitle(slug: string, lang: string): string {
  const area = COURSE_AREAS[slug];
  if (!area) return lang === 'ko' ? '근처 최적 코스' : 'Best nearby route';
  return lang === 'ko' ? `${area.ko} 최적 코스` : `Best ${area.en} route`;
}
