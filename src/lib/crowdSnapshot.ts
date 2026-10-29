import { unstable_cache } from 'next/cache';
import { SPOTS_DATA } from '@/data/spotsData';
import { SEOUL_AREA_MAPPING } from '@/data/seoulAreaMapping';
import { computeLiveSpotMetric } from '@/lib/crowdEngine';
import { fetchSeoulBatchData, getSeoulApiKey, seoulKeyCandidates, SeoulCityDataResult } from '@/lib/seoulCityDataApi';
import { CrowdStatus, LiveSpotMetric, Spot } from '@/types';

/** Seoul publishes population data in 5-minute steps; refetch at most this often. */
export const SEOUL_REFRESH_SECONDS = 300;

interface SeoulLiveCache {
  /** Keyed by official area code (AREA_CD). */
  areas: Record<string, SeoulCityDataResult>;
  fetchedAt: string | null;
  /** Why no live data is available (never includes the key). */
  issue?: 'no_key' | 'fetch_failed' | 'build';
}

// One shared, server-side cache for all visitors: the Seoul API is called once
// per area every SEOUL_REFRESH_SECONDS, no matter how much traffic the site gets.
const getSeoulLive = unstable_cache(
  async (): Promise<SeoulLiveCache> => {
    const apiKey = getSeoulApiKey();
    if (!apiKey) return { areas: {}, fetchedAt: null, issue: 'no_key' };
    const areaCodes = SPOTS_DATA.map(areaCodeFor).filter((c): c is string => Boolean(c));
    const results = await fetchSeoulBatchData(areaCodes, apiKey);
    return {
      areas: Object.fromEntries(results),
      fetchedAt: new Date().toISOString(),
      issue: results.size === 0 ? 'fetch_failed' : undefined,
    };
  },
  ['seoul-live-ppltn-v5'],
  { revalidate: SEOUL_REFRESH_SECONDS }
);

/** Cached Seoul readings keyed by area code (same 5-minute cache the site uses). */
export async function getSeoulLiveAreas() {
  return getSeoulLive();
}

/** Official place code for a spot: its own areaCode, else the legacy ID mapping. */
function areaCodeFor(spot: Spot): string | undefined {
  return spot.areaCode ?? SEOUL_AREA_MAPPING[spot.id];
}

function waitMinutesFor(category: Spot['category'], status: CrowdStatus, score: number): number {
  const multiplier = category === 'food' || category === 'shopping' ? 1.2 : 0.7;
  if (status === 'very_crowded' || status === 'packed') return Math.round((35 + ((score - 85) / 13) * 35) * multiplier);
  if (status === 'crowded') return Math.round((15 + ((score - 70) / 15) * 20) * multiplier);
  if (status === 'moderate') return Math.round((5 + ((score - 40) / 30) * 10) * multiplier);
  return Math.round((score / 40) * 5 * multiplier);
}

export interface CrowdSnapshot {
  spots: LiveSpotMetric[];
  liveCount: number;
  fetchedAt: string | null;
  issue?: SeoulLiveCache['issue'];
  /** How many env vars look like a Seoul key (count only, for diagnosing deploy config). */
  keyCandidates: number;
}

/**
 * Crowd metrics for every spot: real Seoul population data where available
 * (isLive = true), otherwise the time-of-day estimate from crowdEngine.
 */
export async function getCrowdSnapshot(): Promise<CrowdSnapshot> {
  let seoul: SeoulLiveCache = { areas: {}, fetchedAt: null, issue: 'build' };
  try {
    // Skip during `next build`: dozens of prerender workers would hit the API at once.
    // Pages render estimates and pick up live data on their first revalidation.
    if (process.env.NEXT_PHASE !== 'phase-production-build') seoul = await getSeoulLive();
  } catch (err) {
    console.warn('Seoul live data unavailable, using estimates:', err);
    seoul = { areas: {}, fetchedAt: null, issue: 'fetch_failed' };
  }

  let liveCount = 0;
  const spots = SPOTS_DATA.map((spot) => {
    const metric: LiveSpotMetric = { ...computeLiveSpotMetric(spot), isLive: false };
    const code = areaCodeFor(spot);
    const real = code ? seoul.areas[code] : undefined;
    if (real) {
      metric.currentScore = real.score;
      metric.status = real.status;
      metric.waitTimeMinutes = waitMinutesFor(spot.category, real.status, real.score);
      metric.surgeAlert = real.score >= 90 || (metric.isPeak && real.score >= 85);
      metric.isLive = true;
      metric.liveUpdatedAt = real.updatedAt;
      liveCount++;
    }
    return metric;
  });

  return { spots, liveCount, fetchedAt: seoul.fetchedAt, issue: seoul.issue, keyCandidates: seoulKeyCandidates().length };
}
