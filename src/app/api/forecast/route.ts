import { NextResponse } from 'next/server';
import { getForecast, statusOfRate, todayOf } from '@/lib/forecast';
import { FORECAST_SPOTS } from '@/data/spots/forecastSpots';

export const runtime = 'nodejs';
export const preferredRegion = 'icn1';
export const maxDuration = 60;
// Called daily by Vercel Cron (vercel.json); the KTO data itself is cached for a day,
// so extra requests never cost API quota.
export const revalidate = 3600;

export async function GET() {
  const data = await getForecast();
  return NextResponse.json(
    {
      baseDate: data.baseDate,
      source: data.source,
      provider: '한국관광공사 관광지 집중률 방문자 추이 예측 (KT 이동통신 데이터 기반)',
      spots: FORECAST_SPOTS.map((s) => {
        const today = todayOf(data.spots[s.id]);
        return {
          id: s.id,
          city: s.city,
          name: s.name.ko,
          today: today?.rate ?? null,
          status: today ? statusOfRate(today.rate) : null,
          days: data.spots[s.id] ?? [],
        };
      }),
    },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
  );
}
