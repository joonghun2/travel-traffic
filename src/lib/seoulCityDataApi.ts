import { CrowdStatus } from '@/types';

export interface SeoulCityDataResult {
  areaName: string;
  congestionLevel: string;  // 여유 | 보통 | 약간 혼잡 | 혼잡
  congestionMessage: string;
  populationMin: number;
  populationMax: number;
  updatedAt: string;
  // Converted to our format
  score: number;
  status: CrowdStatus;
}

/**
 * Maps Seoul congestion level (AREA_CONGEST_LVL: 여유 | 보통 | 약간 붐빔 | 붐빔)
 * to our 0-100 crowd score. Older docs used 약간 혼잡/혼잡, so both are accepted.
 */
function congestionToScore(level: string, popMin: number, popMax: number): number {
  const popAvg = (popMin + popMax) / 2;
  // Use population as a fine-grained differentiator within each band
  const popFactor = Math.min(popAvg / 100000, 1); // normalize
  
  switch (level) {
    case '여유':
      return Math.round(20 + popFactor * 15); // 20-35
    case '보통':
      return Math.round(45 + popFactor * 18); // 45-63
    case '약간 붐빔':
    case '약간 혼잡':
      return Math.round(70 + popFactor * 12); // 70-82
    case '붐빔':
    case '혼잡':
      return Math.round(85 + popFactor * 11); // 85-96
    default:
      return 50;
  }
}

function congestionToStatus(level: string): CrowdStatus {
  switch (level) {
    case '여유': return 'relaxed';
    case '보통': return 'moderate';
    case '약간 붐빔':
    case '약간 혼잡': return 'crowded';
    case '붐빔':
    case '혼잡': return 'very_crowded';
    default: return 'moderate';
  }
}

const PLACEHOLDER_KEYS = new Set(['', 'your_seoul_api_key_here', 'sample']);

/** Names of env vars that look like a Seoul API key (e.g. SEOUL_API_KEY, SEOUL_OPENDATA_API_KEY). */
export function seoulKeyCandidates(): string[] {
  const preferred = ['SEOUL_API_KEY', 'SEOUL_OPENDATA_API_KEY'];
  const others = Object.keys(process.env).filter(
    (name) => /SEOUL/i.test(name) && /KEY/i.test(name) && !preferred.includes(name)
  );
  return [...preferred, ...others].filter((name) => !PLACEHOLDER_KEYS.has((process.env[name] ?? '').trim()));
}

/** Seoul Open API key; SEOUL_API_KEY is the preferred name, SEOUL_OPENDATA_API_KEY the original. */
export function getSeoulApiKey(): string | null {
  const name = seoulKeyCandidates()[0];
  return name ? process.env[name]!.trim().replace(/^["']|["']$/g, '') : null;
}

/**
 * Fetches real-time population data (서울시 실시간 인구데이터, OA-21778) for one area.
 * The API only accepts one area per call. Returns null if the request fails.
 */
export async function fetchSeoulAreaData(
  areaName: string,
  apiKey: string
): Promise<SeoulCityDataResult | null> {
  try {
    const encodedArea = encodeURIComponent(areaName);
    const url = `http://openapi.seoul.go.kr:8088/${apiKey}/json/citydata_ppltn/1/5/${encodedArea}`;

    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      cache: 'no-store', // the caller caches the combined result
    });

    if (!res.ok) return null;

    const body = await res.text();
    if (body.startsWith('<')) {
      // Errors (e.g. traffic limit) come back as XML regardless of the requested format.
      const code = body.match(/<CODE>(.*?)<\/CODE>/)?.[1];
      const message = body.match(/<MESSAGE>(.*?)<\/MESSAGE>/)?.[1];
      console.warn(`Seoul API ${code ?? 'error'} for ${areaName}: ${message ?? ''}`);
      return null;
    }
    const data = JSON.parse(body);
    const rows = data?.['SeoulRtd.citydata_ppltn'];
    const ppltnData = Array.isArray(rows) ? rows[0] : rows;
    if (!ppltnData?.AREA_CONGEST_LVL) return null;
    
    const level = ppltnData.AREA_CONGEST_LVL || '보통';
    const popMin = parseInt(ppltnData.AREA_PPLTN_MIN || '0', 10);
    const popMax = parseInt(ppltnData.AREA_PPLTN_MAX || '0', 10);
    
    return {
      areaName: ppltnData.AREA_NM || areaName,
      congestionLevel: level,
      congestionMessage: ppltnData.AREA_CONGEST_MSG || '',
      populationMin: popMin,
      populationMax: popMax,
      updatedAt: ppltnData.PPLTN_TIME || new Date().toISOString(),
      score: congestionToScore(level, popMin, popMax),
      status: congestionToStatus(level),
    };
  } catch (err) {
    console.error(`Seoul API error for ${areaName}:`, err);
    return null;
  }
}

const BATCH_CONCURRENCY = 4;

/**
 * Batch-fetch Seoul areas with limited concurrency. The Seoul server drops
 * large bursts of simultaneous connections, so at most BATCH_CONCURRENCY
 * requests run at once; individual failures don't block the others.
 */
export async function fetchSeoulBatchData(
  areaNames: string[],
  apiKey: string
): Promise<Map<string, SeoulCityDataResult>> {
  const queue = [...new Set(areaNames)];
  const resultMap = new Map<string, SeoulCityDataResult>();

  const worker = async () => {
    for (let area = queue.shift(); area !== undefined; area = queue.shift()) {
      const result = await fetchSeoulAreaData(area, apiKey);
      if (result) resultMap.set(area, result);
    }
  };
  await Promise.all(Array.from({ length: BATCH_CONCURRENCY }, worker));

  return resultMap;
}
