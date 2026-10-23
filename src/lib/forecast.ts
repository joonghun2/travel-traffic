import { unstable_cache } from 'next/cache';
import { FORECAST_SPOTS } from '@/data/spots/forecastSpots';
import { CrowdStatus, ForecastSpot } from '@/types';
import SNAPSHOT from '../../data/forecast/kto-forecast-snapshot.json';

/** One forecast day: date YYYY-MM-DD and concentration 0-100 (100 = busiest period). */
export interface ForecastDay {
  date: string;
  rate: number;
}

export interface ForecastData {
  /** First forecast date (KST), i.e. the "기준일". */
  baseDate: string | null;
  /** Where the numbers came from: today's API fetch or the committed fallback snapshot. */
  source: 'api' | 'snapshot';
  spots: Record<number, ForecastDay[]>;
  /** Snapshot only: why today's fetch failed (never includes the key). */
  issue?: 'no_key' | 'fetch_failed' | 'build' | 'backoff';
  /** Snapshot only: e.g. "3/75 spots, first error: http 401". */
  issueDetail?: string;
}

const AREA_CD: Record<ForecastSpot['city'], number> = { jeju: 50, busan: 26 };
const CONCURRENCY = 6;

const toDate = (ymd: string) => `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;

/** First failure of the latest fetch round, for diagnostics (status codes only, no URLs). */
let firstFailure: string | null = null;
const fail = (reason: string) => {
  firstFailure ??= reason;
  return null;
};

async function fetchSpotForecast(spot: ForecastSpot, key: string): Promise<ForecastDay[] | null> {
  const q = new URLSearchParams({
    serviceKey: key,
    pageNo: '1',
    numOfRows: '60',
    MobileOS: 'WEB',
    MobileApp: 'CheckEastPoint',
    areaCd: String(AREA_CD[spot.city]),
    signguCd: String(spot.signguCd),
    tAtsNm: spot.ktoName,
    _type: 'json',
  });
  try {
    const res = await fetch(`https://apis.data.go.kr/B551011/TatsCnctrRateService/tatsCnctrRatedList?${q}`, {
      signal: AbortSignal.timeout(10000),
      cache: 'no-store',
    });
    if (!res.ok) return fail(`http ${res.status}`);
    const text = await res.text();
    // Key/quota errors come back as XML (OpenAPI_ServiceResponse) with HTTP 200.
    if (!text.startsWith('{')) return fail(`non-json: ${text.match(/<returnAuthMsg>([^<]*)/)?.[1] ?? text.slice(0, 40)}`);
    const data = JSON.parse(text);
    const code = data?.response?.header?.resultCode;
    if (code && code !== '0000') return fail(`resultCode ${code}`);
    let items = data?.response?.body?.items?.item ?? [];
    if (!Array.isArray(items)) items = [items];
    const days = (items as { baseYmd: string; cnctrRate: string; tAtsNm: string }[])
      .filter((i) => i.tAtsNm === spot.ktoName)
      .map((i) => ({ date: toDate(i.baseYmd), rate: Math.round(Number(i.cnctrRate) * 10) / 10 }))
      .sort((a, b) => a.date.localeCompare(b.date));
    return days.length ? days : fail('no items');
  } catch (err) {
    return fail(err instanceof Error && err.name === 'TimeoutError' ? 'timeout' : 'network');
  }
}

/** Fetches the 30-day forecast for every Jeju/Busan spot (one call per spot). */
export async function fetchAllForecasts(key: string): Promise<ForecastData | null> {
  firstFailure = null;
  const queue = [...FORECAST_SPOTS];
  const spots: Record<number, ForecastDay[]> = {};
  const worker = async () => {
    for (let s = queue.shift(); s; s = queue.shift()) {
      const days = await fetchSpotForecast(s, key);
      if (days) spots[s.id] = days;
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  const ids = Object.keys(spots);
  // Treat a mostly-empty answer as a failure so the last good data is kept.
  if (ids.length < FORECAST_SPOTS.length / 2) {
    lastFailureDetail = `${ids.length}/${FORECAST_SPOTS.length} spots, first error: ${firstFailure ?? 'unknown'}`;
    return null;
  }
  const baseDate = ids.map((id) => spots[Number(id)][0].date).sort()[0] ?? null;
  return { baseDate, source: 'api', spots };
}

let lastFailureDetail: string | undefined;

// Refreshed at most once a day (the forecast itself is published daily). Throwing keeps
// the previously cached day instead of caching a failed fetch.
const getCachedForecast = unstable_cache(
  async (): Promise<ForecastData> => {
    const key = process.env.DATA_GO_KR_SERVICE_KEY;
    if (!key) throw new Error('DATA_GO_KR_SERVICE_KEY missing');
    const data = await fetchAllForecasts(key);
    if (!data) throw new Error('KTO forecast fetch failed');
    return data;
  },
  ['kto-forecast-v1'],
  { revalidate: 86400, tags: ['kto-forecast'] }
);

const snapshot = SNAPSHOT as unknown as ForecastData;

/** After a failed fetch, serve the snapshot for this long before calling the API again. */
const RETRY_MS = 30 * 60 * 1000;
let failedAt = 0;
let inflight: Promise<ForecastData> | null = null;

/**
 * Forecast for all Jeju/Busan spots. Uses the daily API cache; if the API is unavailable
 * (or during `next build`) it falls back to the committed snapshot and its base date.
 *
 * Quota guard: a failed fetch is not cached, so without it every page render retried all 75
 * calls and exhausted the daily KTO quota (HTTP 429). Concurrent callers now share one fetch,
 * and after a failure this instance waits RETRY_MS before trying again.
 */
export async function getForecast(): Promise<ForecastData> {
  // Builds render many pages in parallel workers; never call the API from there.
  if (process.env.NEXT_PHASE === 'phase-production-build') return { ...snapshot, source: 'snapshot', issue: 'build' };
  if (Date.now() - failedAt < RETRY_MS) return { ...snapshot, source: 'snapshot', issue: 'backoff', issueDetail: lastFailureDetail };
  inflight ??= getCachedForecast().finally(() => {
    inflight = null;
  });
  try {
    return await inflight;
  } catch (err) {
    failedAt = Date.now();
    console.warn('KTO forecast unavailable, using snapshot:', err, lastFailureDetail);
    const noKey = !process.env.DATA_GO_KR_SERVICE_KEY;
    return { ...snapshot, source: 'snapshot', issue: noKey ? 'no_key' : 'fetch_failed', issueDetail: noKey ? undefined : lastFailureDetail };
  }
}

/** True when showing an older snapshot because today's forecast could not be fetched. */
export function isStale(data: ForecastData): boolean {
  const today = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  return data.source === 'snapshot' && (!data.baseDate || data.baseDate < today);
}

/** Today's (KST) entry, falling back to the first forecast day. */
export function todayOf(days: ForecastDay[] | undefined): ForecastDay | undefined {
  if (!days?.length) return undefined;
  const today = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  return days.find((d) => d.date === today) ?? days[0];
}

/** Same bands as the Seoul score (relaxed < 40, moderate < 70, crowded < 85). */
export function statusOfRate(rate: number): CrowdStatus {
  if (rate >= 85) return 'very_crowded';
  if (rate >= 70) return 'crowded';
  if (rate >= 40) return 'moderate';
  return 'relaxed';
}
