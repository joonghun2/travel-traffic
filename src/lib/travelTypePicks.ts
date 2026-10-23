import { CityId, CrowdStatus, Lang } from '@/types';
import PICKS_JSON from '@/data/travel-type/picks.json';
import { SPOTS_DATA } from '@/data/spotsData';
import { FORECAST_SPOTS } from '@/data/spots/forecastSpots';
import { getCrowdSnapshot } from '@/lib/crowdSnapshot';
import { getForecast, statusOfRate, todayOf } from '@/lib/forecast';
import { getSpotSlug } from '@/lib/slug';
import { Loc, TypeKey, loc } from '@/lib/travelType';

interface PickSource {
  id: string;
  type: TypeKey;
  city: CityId;
  spotId?: number;
  q: string;
  name: Loc;
  why: Loc;
}

export interface TravelPick {
  id: string;
  city: CityId;
  name: string;
  why: string;
  /** Primary map link for the language (Naver for ko/zh, Google for en/ja) and the other one. */
  mapUrl: string;
  altMapUrl: string;
  /** Set when the place has a live (Seoul) or forecast (Jeju/Busan) page on the site. */
  live?: { slug: string; score: number; status: CrowdStatus; forecast: boolean };
}

const PICKS = PICKS_JSON.picks as PickSource[];

const naver = (q: string) => `https://map.naver.com/p/search/${encodeURIComponent(q)}`;
const google = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

/** Curated picks for a type, with today's crowd level where the site has data. */
export async function picksFor(key: TypeKey, lang: Lang): Promise<TravelPick[]> {
  const picks = PICKS.filter((p) => p.type === key);
  const needsSeoul = picks.some((p) => p.spotId && p.city === 'seoul');
  const needsForecast = picks.some((p) => p.spotId && p.city !== 'seoul');
  const [snap, forecast] = await Promise.all([needsSeoul ? getCrowdSnapshot() : null, needsForecast ? getForecast() : null]);
  const naverFirst = lang === 'ko' || lang === 'zh-cn' || lang === 'zh-tw';

  return picks.map((p) => {
    let live: TravelPick['live'];
    if (p.spotId && p.city === 'seoul' && snap) {
      const spot = SPOTS_DATA.find((s) => s.id === p.spotId);
      const m = snap.spots.find((s) => s.id === p.spotId);
      if (spot && m) live = { slug: getSpotSlug(spot), score: m.currentScore, status: m.status, forecast: false };
    } else if (p.spotId && forecast) {
      const spot = FORECAST_SPOTS.find((s) => s.id === p.spotId);
      const today = todayOf(forecast.spots[p.spotId]);
      if (spot && today) {
        const score = Math.round(today.rate);
        live = { slug: getSpotSlug(spot), score, status: statusOfRate(score), forecast: true };
      }
    }
    return {
      id: p.id,
      city: p.city,
      name: loc(p.name, lang),
      why: loc(p.why, lang),
      mapUrl: naverFirst ? naver(p.q) : google(p.q),
      altMapUrl: naverFirst ? google(p.q) : naver(p.q),
      live,
    };
  });
}
