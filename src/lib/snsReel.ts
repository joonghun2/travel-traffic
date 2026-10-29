import { unstable_cache } from 'next/cache';
import { Spot } from '@/types';
import { SPOTS_DATA } from '@/data/spotsData';
import { SEOUL_AREA_MAPPING } from '@/data/seoulAreaMapping';
import { getSpotSlug } from '@/lib/slug';
import { getSupabaseAdmin } from '@/lib/supabase/server';

// Weekly reel "지난 한 주 서울에서 가장 붐볐던 곳": the five Seoul places with the highest measured
// daytime (10:00-21:59 KST) crowd score over the last 7 days, from Supabase (supabase/crowd-history.sql,
// view seoul_area_week_profile, filled nightly by rollup_seoul_hourly). Images: /sns/reel/[file].

export interface BusiestSpot {
  rank: number;
  slug: string;
  ko: string;
  en: string;
  emoji: string;
  /** Average measured crowd score 0-100. */
  score: number;
}

export interface BusiestWeek {
  /** KST dates covered, YYYY-MM-DD. */
  from: string;
  to: string;
  /** Hours of data behind the ranking (all areas), to spot a thin week. */
  samples: number;
  spots: BusiestSpot[];
}

/** First part of a name, e.g. "경복궁 & 광화문 광장" -> "경복궁". */
const short = (name: string) => name.split(/\s*[&＆(（/]\s*/)[0].trim();

// Each official area code -> the first spot that reads it (several spots can share an area).
const SPOT_BY_AREA = new Map<string, Spot>();
for (const spot of SPOTS_DATA) {
  const code = spot.areaCode ?? SEOUL_AREA_MAPPING[spot.id];
  if (code && !SPOT_BY_AREA.has(code)) SPOT_BY_AREA.set(code, spot);
}

const kstDate = (offsetDays: number) => new Date(Date.now() + 9 * 3600 * 1000 + offsetDays * 86400000).toISOString().slice(0, 10);

async function load(): Promise<BusiestWeek | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;
  const rows: { area_code: string; avg_score: number; samples: number }[] = [];
  // PostgREST returns at most 1000 rows per request.
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from('seoul_area_week_profile')
      .select('area_code, avg_score, samples')
      .gte('hour', 10)
      .lte('hour', 21)
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  const byArea = new Map<string, { sum: number; n: number }>();
  for (const r of rows) {
    const a = byArea.get(r.area_code) ?? { sum: 0, n: 0 };
    a.sum += Number(r.avg_score);
    a.n += 1;
    byArea.set(r.area_code, a);
  }
  const spots = [...byArea.entries()]
    .flatMap(([code, a]) => {
      const spot = SPOT_BY_AREA.get(code);
      return spot ? [{ spot, score: Math.round(a.sum / a.n) }] : [];
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ spot, score }, i) => ({
      rank: i + 1,
      slug: getSpotSlug(spot),
      ko: short(spot.name.ko),
      en: short(spot.name.en),
      emoji: spot.emoji ?? '📍',
      score,
    }));
  return { from: kstDate(-7), to: kstDate(-1), samples: rows.reduce((s, r) => s + Number(r.samples), 0), spots };
}

/** Last week's busiest Seoul places; null when Supabase is not configured. Cached for an hour. */
export const busiestSeoulLastWeek = unstable_cache(load, ['sns-busiest-seoul-v1'], { revalidate: 3600 });
