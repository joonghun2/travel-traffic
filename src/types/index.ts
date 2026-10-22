export type CrowdStatus = 'relaxed' | 'moderate' | 'crowded' | 'very_crowded' | 'packed';

export type CityId = 'seoul' | 'jeju' | 'busan';
/** Cities served from the KTO 30-day concentration forecast instead of live data. */
export type ForecastCityId = Exclude<CityId, 'seoul'>;

export type Lang = 'ko' | 'en' | 'ja';
export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'crimson' | 'ocean' | 'emerald' | 'violet';

export type SpotCategory =
  | 'all'
  | 'palace'
  | 'shopping'
  | 'food'
  | 'nature'
  | 'view'
  | 'attraction'
  | 'neighborhood';

export type SeoulDistrict =
  | 'all'
  | 'downtown'   // 종로/중구/용산 (도심권)
  | 'west'       // 마포/서대문/은평 (서북권)
  | 'east'       // 성동/광진/동대문/중랑 (동북권)
  | 'south'      // 강남/서초/송파/강동 (동남권)
  | 'southwest'; // 영등포/구로/양천 (서남권)

export interface LocalizedString {
  ko: string;
  en: string;
  ja: string;
}

export interface EscapeRoute {
  gemName: LocalizedString;
  gemDesc: LocalizedString;
  walkMinutes: number;
  crowdDiffPercent: number;
  lat?: number;
  lng?: number;
}

export interface Spot {
  id: number;
  name: LocalizedString;
  city: CityId;
  category: Exclude<SpotCategory, 'all'>;
  /** Official Seoul real-time data place code (AREA_CD, e.g. POI003); falls back to SEOUL_AREA_MAPPING. */
  areaCode?: string;
  district: SeoulDistrict;
  baseScore: number;
  peakHours: number[];
  lat: number;
  lng: number;
  area?: LocalizedString;
  address?: LocalizedString;
  bestTime: LocalizedString;
  tip?: LocalizedString;
  secretTip?: LocalizedString;
  emoji?: string;
  searchKeywords?: string[];
  escapeRoute?: EscapeRoute;
}

export interface LiveSpotMetric extends Spot {
  currentScore: number;
  status: CrowdStatus;
  waitTimeMinutes: number;
  surgeAlert: boolean;
  isPeak: boolean;
  trend?: 'rising' | 'falling' | 'stable';
  scoreDelta?: number;
  distanceKm?: number;
  walkTimeMinutes?: number;
  transitTimeMinutes?: number;
  /** True when the score comes from Seoul real-time population data, false for estimates. */
  isLive?: boolean;
  /** Seoul data timestamp (PPLTN_TIME, KST "YYYY-MM-DD HH:mm"). */
  liveUpdatedAt?: string;
}

export interface CityMetric {
  cityId: CityId;
  avgScore: number;
  status: CrowdStatus;
  hotspotsCount: number;
  safeSpotsCount: number;
  lastUpdated: string;
}

/** Jeju/Busan spot backed by the KTO 30-day concentration forecast (phase 3). */
export interface ForecastSpot {
  id: number;
  city: ForecastCityId;
  /** Exact attraction name in the KTO forecast API (tAtsNm). */
  ktoName: string;
  /** KTO/legal district code (signguCd), e.g. 50110 for Jeju-si. */
  signguCd: number;
  name: LocalizedString;
  area: LocalizedString;
  category: Exclude<SpotCategory, 'all'>;
  emoji: string;
  lat: number;
  lng: number;
  /** Nearest Busan metro station and exits (Busan Transportation Corp., 2021). */
  station?: { name: string; exit: string };
  /** Nearest Visit Jeju safety camera within 3 km. */
  camera?: { name: string; url: string };
  /** Average 30-day concentration when shortlisted; orders "most visited". */
  popularity: number;
}
