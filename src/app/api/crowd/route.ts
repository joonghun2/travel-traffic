import { NextResponse } from 'next/server';
import { getCrowdSnapshot } from '@/lib/crowdSnapshot';

// Node runtime: the Seoul Open API is plain http on port 8088.
export const runtime = 'nodejs';
// Run next to the Seoul API (Vercel Seoul region).
export const preferredRegion = 'icn1';
// The JSON is regenerated at most every 10 minutes (crowd data is collected every 10 minutes), which
// keeps ISR writes within the free plan. Visitors polling every minute are served from the CDN cache.
export const revalidate = 600;

export async function GET() {
  try {
    const { spots, liveCount, fetchedAt, issue, keyCandidates } = await getCrowdSnapshot();

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
                  issue,
                  keyCandidates,
                },
        },
        spots,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=600',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err) {
    console.error('Crowd API error:', err);
    return NextResponse.json({ error: 'Failed to compute crowd metrics' }, { status: 500 });
  }
}
