import { CityId, CrowdStatus, ForecastSpot, Spot } from '@/types';
import { citySpots } from '@/lib/themes';
import { getCrowdSnapshot } from '@/lib/crowdSnapshot';
import { getForecast, statusOfRate, todayOf } from '@/lib/forecast';
import { getSpotSlug } from '@/lib/slug';

export interface RankedSpot {
  spot: Spot | ForecastSpot;
  slug: string;
  score: number;
  status: CrowdStatus;
  /** Seoul: true when the score is a pattern estimate rather than live data. */
  estimate: boolean;
}

export interface CityRanking {
  city: CityId;
  live: boolean;
  /** Seoul: data fetch time; Jeju/Busan: forecast date (YYYY-MM-DD). */
  asOf: string;
  spots: RankedSpot[];
}

/** Every spot in a city, quietest first: Seoul by live population, Jeju/Busan by today's KTO forecast. */
export async function rankCity(city: CityId): Promise<CityRanking> {
  const spots = citySpots(city);
  if (city === 'seoul') {
    const snap = await getCrowdSnapshot();
    const byId = new Map(snap.spots.map((m) => [m.id, m]));
    const rows = spots.map((spot) => {
      const m = byId.get(spot.id);
      return {
        spot,
        slug: getSpotSlug(spot),
        score: m?.currentScore ?? 50,
        status: m?.status ?? 'moderate',
        estimate: !m?.isLive,
      };
    });
    // Live readings first, so an estimate never tops the "quietest right now" list.
    rows.sort((a, b) => Number(a.estimate) - Number(b.estimate) || a.score - b.score);
    return { city, live: true, asOf: snap.fetchedAt ?? new Date().toISOString(), spots: rows };
  }

  const data = await getForecast();
  let asOf = '';
  const rows = spots.map((spot) => {
    const today = todayOf(data.spots[spot.id]);
    if (today && today.date > asOf) asOf = today.date;
    const score = Math.round(today?.rate ?? 50);
    return { spot, slug: getSpotSlug(spot), score, status: statusOfRate(score), estimate: !today };
  });
  rows.sort((a, b) => Number(a.estimate) - Number(b.estimate) || a.score - b.score);
  return { city, live: false, asOf, spots: rows };
}

export async function quietestSpots(city: CityId, n: number): Promise<CityRanking> {
  const r = await rankCity(city);
  return { ...r, spots: r.spots.slice(0, n) };
}
