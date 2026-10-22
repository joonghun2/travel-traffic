import { NextResponse } from 'next/server';
import { getCrowdSnapshot } from '@/lib/crowdSnapshot';

// Node runtime: the Seoul Open API is plain http on port 8088.
export const runtime = 'nodejs';
// The JSON is regenerated at most once a minute; Seoul data itself is cached for 5 minutes.
export const revalidate = 60;

export async function GET() {
  try {
    const { spots, liveCount, fetchedAt } = await getCrowdSnapshot();

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        city: 'seoul',
        count: spots.length,
        dataSource: {
          seoul:
            liveCount > 0
              ? {
                  type: 'LIVE_API',
                  provider: '서울 실시간 인구데이터',
                  spotsConnected: liveCount,
                  fetchedAt,
                }
              : {
                  type: 'SIMULATION',
                  provider: 'crowdEngine Heuristic',
                  spotsConnected: 0,
                },
        },
        spots,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err) {
    console.error('Crowd API error:', err);
    return NextResponse.json({ error: 'Failed to compute crowd metrics' }, { status: 500 });
  }
}
