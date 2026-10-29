import { NextResponse } from 'next/server';
import { getSeoulLiveAreas } from '@/lib/crowdSnapshot';
import { getForecast } from '@/lib/forecast';
import { getSupabaseAdmin } from '@/lib/supabase/server';

// Called every 10 minutes by Supabase pg_cron (supabase/crowd-history-cron.sql): saves the current
// Seoul readings, and once a day the KTO forecast. Runs in the cloud, so it never depends on a PC.
export const runtime = 'nodejs';
export const preferredRegion = 'icn1';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const kstToday = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);

/** Seoul PPLTN_TIME ("YYYY-MM-DD HH:mm", KST) as an ISO timestamp. */
const kstTimestamp = (s: string) => {
  const m = s.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/);
  return m ? `${m[1]}T${m[2]}:00+09:00` : null;
};

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'supabase_not_configured' }, { status: 500 });

  // Seoul: one row per area and Seoul update time; re-sending the same reading is ignored.
  const live = await getSeoulLiveAreas();
  const rows = Object.entries(live.areas).flatMap(([areaCode, r]) => {
    const observedAt = kstTimestamp(r.updatedAt);
    return observedAt
      ? [{ area_code: areaCode, observed_at: observedAt, congest_lvl: r.congestionLevel, score: r.score, pop_min: r.populationMin, pop_max: r.populationMax }]
      : [];
  });
  let seoul: string | number = live.issue ?? 0;
  if (rows.length) {
    const { error } = await db.from('seoul_area_readings').upsert(rows, { onConflict: 'area_code,observed_at', ignoreDuplicates: true });
    seoul = error ? `error: ${error.message}` : rows.length;
  }

  // KTO forecast: once per KST day, only when today's API data (not the fallback snapshot) is available.
  const today = kstToday();
  let forecast: string | number = 'already saved';
  const { count } = await db.from('kto_forecast_daily').select('spot_id', { count: 'exact', head: true }).eq('base_date', today);
  if (!count) {
    const data = await getForecast();
    if (data.source !== 'api') {
      forecast = `skipped: ${data.issue ?? 'snapshot'}`;
    } else {
      const fRows = Object.entries(data.spots).flatMap(([spotId, days]) =>
        days.map((d) => ({ spot_id: Number(spotId), base_date: today, target_date: d.date, rate: d.rate }))
      );
      const { error } = await db.from('kto_forecast_daily').upsert(fRows, { onConflict: 'spot_id,base_date,target_date', ignoreDuplicates: true });
      forecast = error ? `error: ${error.message}` : fRows.length;
    }
  }

  return NextResponse.json({ seoul, forecast, fetchedAt: live.fetchedAt });
}
