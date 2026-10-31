import { NextResponse } from 'next/server';
import { BUSAN_FOODS, BUSAN_FOODS_BY_ID } from '@/data/busanFood';
import { isLang } from '@/lib/i18n/routing';
import { getSupabaseAdmin } from '@/lib/supabase/server';

// Busan Food Olympics votes (supabase/busan-food-votes.sql).
// POST saves one finished bracket; GET returns everyone's totals for the result page.
export const runtime = 'nodejs';
export const preferredRegion = 'icn1';
export const dynamic = 'force-dynamic';

export interface BusanFoodStats {
  total: number;
  foods: Record<string, { golds: number; wins: number; games: number }>;
}

const isFood = (v: unknown): v is string => typeof v === 'string' && BUSAN_FOODS_BY_ID.has(v);

export async function GET() {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'supabase_not_configured' }, { status: 503 });

  const [{ count, error: countError }, { data, error }] = await Promise.all([
    db.from('busan_food_votes').select('id', { count: 'exact', head: true }),
    db.from('busan_food_stats').select('food, golds, wins, games'),
  ]);
  if (countError || error) return NextResponse.json({ error: (countError ?? error)!.message }, { status: 500 });

  const foods: BusanFoodStats['foods'] = {};
  for (const row of data ?? []) {
    if (isFood(row.food)) foods[row.food] = { golds: row.golds, wins: row.wins, games: row.games };
  }
  const body: BusanFoodStats = { total: count ?? 0, foods };
  return NextResponse.json(body, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
}

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'supabase_not_configured' }, { status: 503 });

  const body = await request.json().catch(() => null);
  const matches: unknown = body?.matches;
  const semifinalists: unknown = body?.semifinalists;

  // A real 16-food bracket: 15 matches between known foods, every food in it exactly once as a loser
  // except the champion, and the final being champion vs runner-up.
  const valid =
    isLang(body?.lang) &&
    isFood(body?.champion) &&
    isFood(body?.runnerUp) &&
    Array.isArray(semifinalists) &&
    semifinalists.length === 2 &&
    semifinalists.every(isFood) &&
    Array.isArray(matches) &&
    matches.length === BUSAN_FOODS.length - 1 &&
    matches.every((m) => Array.isArray(m) && m.length === 2 && isFood(m[0]) && isFood(m[1]) && m[0] !== m[1]) &&
    new Set((matches as string[][]).map((m) => m[1])).size === BUSAN_FOODS.length - 1 &&
    !(matches as string[][]).some((m) => m[1] === body.champion) &&
    (matches as string[][])[matches.length - 1][0] === body.champion &&
    (matches as string[][])[matches.length - 1][1] === body.runnerUp;
  if (!valid) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const { error } = await db.from('busan_food_votes').insert({
    lang: body.lang,
    champion: body.champion,
    runner_up: body.runnerUp,
    semifinalists,
    matches,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
