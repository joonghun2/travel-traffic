import { unstable_cache } from 'next/cache';
import { ForecastDay } from '@/lib/forecast';

// Korea Tourism Organization 30-day visitor-concentration forecast for selected Seoul spots, keyed by
// spot slug. Same API as the Jeju/Busan forecast (src/lib/forecast.ts), but only a handful of calls a
// day, so it is fetched separately. Shown as the whole-day outlook next to the live score.
const SEOUL_KTO: Record<string, { signguCd: number; ktoName: string }> = {
  'lotte-world-theme-park-magic-island': { signguCd: 11710, ktoName: '롯데월드 어드벤처' },
};

export const hasSeoulKtoForecast = (slug: string) => slug in SEOUL_KTO;

const toDate = (ymd: string) => `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;

async function fetchSeoulKto(slug: string): Promise<ForecastDay[]> {
  const spot = SEOUL_KTO[slug];
  const key = process.env.DATA_GO_KR_SERVICE_KEY;
  if (!spot || !key) throw new Error('no spot or key');
  const q = new URLSearchParams({
    serviceKey: key,
    pageNo: '1',
    numOfRows: '60',
    MobileOS: 'WEB',
    MobileApp: 'CheckEastPoint',
    areaCd: '11',
    signguCd: String(spot.signguCd),
    tAtsNm: spot.ktoName,
    _type: 'json',
  });
  const res = await fetch(`https://apis.data.go.kr/B551011/TatsCnctrRateService/tatsCnctrRatedList?${q}`, {
    signal: AbortSignal.timeout(10000),
    cache: 'no-store',
  });
  const text = await res.text();
  if (!res.ok || !text.startsWith('{')) throw new Error(`KTO http ${res.status}`);
  let items = JSON.parse(text)?.response?.body?.items?.item ?? [];
  if (!Array.isArray(items)) items = [items];
  const days = (items as { baseYmd: string; cnctrRate: string; tAtsNm: string }[])
    .filter((i) => i.tAtsNm === spot.ktoName)
    .map((i) => ({ date: toDate(i.baseYmd), rate: Math.round(Number(i.cnctrRate)) }))
    .sort((a, b) => a.date.localeCompare(b.date));
  // Throwing keeps the previous day's cache instead of caching an empty answer.
  if (!days.length) throw new Error('KTO no items');
  return days;
}

const cached = unstable_cache(fetchSeoulKto, ['seoul-kto-forecast-v1'], { revalidate: 86400 });

/** The spot's 30-day forecast, or null when it has none or the API is unavailable (the card is then hidden). */
export async function getSeoulKtoForecast(slug: string): Promise<ForecastDay[] | null> {
  if (!hasSeoulKtoForecast(slug) || process.env.NEXT_PHASE === 'phase-production-build') return null;
  try {
    return await cached(slug);
  } catch (err) {
    console.warn('Seoul KTO forecast unavailable:', slug, err instanceof Error ? err.message : err);
    return null;
  }
}
