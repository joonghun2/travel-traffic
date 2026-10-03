export type CrowdStatus = 'relaxed' | 'moderate' | 'crowded' | 'very_crowded' | 'packed';

export type CityId = 'seoul';

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
  | 'attraction';

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
  category: 'palace' | 'shopping' | 'food' | 'nature' | 'view' | 'attraction';
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
}

export interface CityMetric {
  cityId: CityId;
  avgScore: number;
  status: CrowdStatus;
  hotspotsCount: number;
  safeSpotsCount: number;
  lastUpdated: string;
}
