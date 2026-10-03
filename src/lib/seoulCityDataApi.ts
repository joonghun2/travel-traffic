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
 * Maps Seoul citydata congestion level to our 0-100 crowd score.
 * 여유 -> 20-35, 보통 -> 45-55, 약간 혼잡 -> 60-72, 혼잡 -> 75-92
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
    case '약간 혼잡':
      return Math.round(68 + popFactor * 14); // 68-82
    case '혼잡':
      return Math.round(84 + popFactor * 12); // 84-96
    default:
      return 50;
  }
}

function congestionToStatus(level: string): CrowdStatus {
  switch (level) {
    case '여유': return 'relaxed';
    case '보통': return 'moderate';
    case '약간 혼잡': return 'crowded';
    case '혼잡': return 'very_crowded';
    default: return 'moderate';
  }
}

/**
 * Fetches real-time city data for a specific area from Seoul Open Data API.
 * Returns null if API key is missing or the request fails.
 */
export async function fetchSeoulAreaData(
  areaName: string,
  apiKey: string
): Promise<SeoulCityDataResult | null> {
  try {
    const encodedArea = encodeURIComponent(areaName);
    const url = `http://openapi.seoul.go.kr:8088/${apiKey}/json/citydata/1/5/${encodedArea}`;
    
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    const cityData = data?.CITYDATA;
    if (!cityData) return null;
    
    const ppltnData = cityData.LIVE_PPLTN_STTS?.[0];
    if (!ppltnData) return null;
    
    const level = ppltnData.AREA_CONGEST_LVL || '보통';
    const popMin = parseInt(ppltnData.AREA_PPLTN_MIN || '0', 10);
    const popMax = parseInt(ppltnData.AREA_PPLTN_MAX || '0', 10);
    
    return {
      areaName: cityData.AREA_NM || areaName,
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

/**
 * Batch-fetch multiple Seoul areas in parallel.
 * Uses Promise.allSettled for resilience — individual failures don't block others.
 */
export async function fetchSeoulBatchData(
  areaNames: string[],
  apiKey: string
): Promise<Map<string, SeoulCityDataResult>> {
  const uniqueAreas = [...new Set(areaNames)];
  const results = await Promise.allSettled(
    uniqueAreas.map((area) => fetchSeoulAreaData(area, apiKey))
  );
  
  const resultMap = new Map<string, SeoulCityDataResult>();
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      resultMap.set(uniqueAreas[index], result.value);
    }
  });
  
  return resultMap;
}
