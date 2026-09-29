import { NextResponse } from 'next/server';
import { SPOTS_DATA } from '@/data/spotsData';
import { computeLiveSpotMetric } from '@/lib/crowdEngine';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { fetchSeoulBatchData } from '@/lib/seoulCityDataApi';
import { SEOUL_AREA_MAPPING } from '@/data/seoulAreaMapping';
import { Spot, LiveSpotMetric } from '@/types';

export const runtime = 'edge';
export const revalidate = 30;

export async function GET(request: Request) {
  try {
    // Step 1: Start with baseline heuristic for Seoul spots
    const liveMetrics: LiveSpotMetric[] = SPOTS_DATA.map((spot: Spot) =>
      computeLiveSpotMetric(spot)
    );

    // Step 2: Overlay real-time data from Seoul Open Data API
    const seoulApiKey = process.env.SEOUL_OPENDATA_API_KEY;
    let seoulApiActive = false;
    let seoulApiCount = 0;

    if (seoulApiKey && seoulApiKey !== 'your_seoul_api_key_here' && seoulApiKey.length > 0) {
      const seoulSpotIds = liveMetrics
        .filter((s) => typeof s.id === 'number')
        .map((s) => s.id as number);

      // Collect unique area names that have mappings
      const areaNames = seoulSpotIds
        .map((id) => SEOUL_AREA_MAPPING[id])
        .filter(Boolean) as string[];

      if (areaNames.length > 0) {
        try {
          const seoulData = await fetchSeoulBatchData(areaNames, seoulApiKey);

          if (seoulData.size > 0) {
            seoulApiActive = true;
            // Apply real API data to matching spots
            liveMetrics.forEach((spot) => {
              if (typeof spot.id === 'number') {
                const areaName = SEOUL_AREA_MAPPING[spot.id];
                if (areaName && seoulData.has(areaName)) {
                  const realData = seoulData.get(areaName)!;
                  spot.currentScore = realData.score;
                  spot.status = realData.status;

                  // Recalculate wait time based on real score
                  if (realData.status === 'packed') {
                    spot.waitTimeMinutes = Math.round(
                      25 + ((realData.score - 70) / 30) * 55
                    );
                  } else if (realData.status === 'moderate') {
                    spot.waitTimeMinutes = Math.round(
                      5 + ((realData.score - 40) / 30) * 15
                    );
                  } else {
                    spot.waitTimeMinutes = Math.round((realData.score / 40) * 5);
                  }

                  spot.surgeAlert =
                    realData.score >= 82 || (spot.isPeak && realData.score >= 75);
                  seoulApiCount++;
                }
              }
            });
          }
        } catch (apiErr) {
          console.warn('Seoul API batch fetch failed, falling back to simulation:', apiErr);
        }
      }
    }

    // Step 3: Apply Supabase DB overrides if configured
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data: dbMetrics } = await supabase
          .from('crowd_metrics')
          .select('*');

        if (dbMetrics && (dbMetrics as any[]).length > 0) {
          const metricMap = new Map(
            (dbMetrics as any[]).map((m) => [String(m.spot_id), m])
          );
          liveMetrics.forEach((spot) => {
            const dbVal = metricMap.get(String(spot.id));
            if (dbVal) {
              spot.currentScore = dbVal.current_score;
              spot.status = dbVal.status_level;
              spot.waitTimeMinutes = dbVal.wait_time_minutes;
              spot.surgeAlert = dbVal.surge_alert;
            }
          });
        }
      } catch (dbErr) {
        console.warn('Supabase DB override failed:', dbErr);
      }
    }

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        city: 'seoul',
        count: liveMetrics.length,
        dataSource: {
          seoul: seoulApiActive
            ? {
                type: 'LIVE_API',
                provider: '서울 실시간 도시데이터',
                spotsConnected: seoulApiCount,
              }
            : {
                type: 'SIMULATION',
                provider: 'crowdEngine Heuristic',
                spotsConnected: 0,
              },
        },
        spots: liveMetrics,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err) {
    console.error('Edge crowd API error:', err);
    return NextResponse.json(
      { error: 'Failed to compute crowd metrics' },
      { status: 500 }
    );
  }
}
