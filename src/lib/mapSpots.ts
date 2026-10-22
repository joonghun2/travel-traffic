import { CrowdStatus, Lang, LiveSpotMetric, Spot } from '@/types';
import { FEATURED_RANK } from '@/config/featuredRank';
import { getSpotSlug } from '@/lib/slug';
import { pick } from '@/lib/i18n/routing';

/** Compact, single-language spot record for the map home page. */
export interface MapSpot {
  id: number;
  /** Seoul live data, or a Jeju/Busan KTO 30-day forecast. */
  kind: 'live' | 'forecast';
  slug: string;
  name: string;
  /** District (구) in Korean; shown only on the Korean page. */
  gu: string;
  lat: number;
  lng: number;
  category: Spot['category'];
  emoji: string;
  score: number;
  status: CrowdStatus;
  wait: number;
  /** Seoul: recommended visit time. Forecast cities: the quietest upcoming day. */
  bestTime: string;
  isLive: boolean;
  /** 1-based position in FEATURED_RANK, if featured. */
  featured?: number;
  /** Popularity proxy used to order non-featured spots. */
  popularity: number;
  /** Lower-cased names in every language plus search keywords. */
  searchText: string;
}

export const STATUS_COLOR: Record<CrowdStatus, string> = {
  relaxed: '#10b981',
  moderate: '#f59e0b',
  crowded: '#f97316',
  very_crowded: '#f43f5e',
  packed: '#f43f5e',
};

export type MapThemeId = 'all' | 'palace' | 'park' | 'hot' | 'night';

export const MAP_THEMES: { id: MapThemeId; icon: string; categories: Spot['category'][] | null }[] = [
  { id: 'all', icon: '✨', categories: null },
  { id: 'palace', icon: '🏯', categories: ['palace'] },
  { id: 'park', icon: '🌳', categories: ['nature'] },
  { id: 'hot', icon: '🔥', categories: ['shopping', 'food', 'attraction', 'neighborhood'] },
  { id: 'night', icon: '🌃', categories: ['view'] },
];

const FEATURED_POSITION = new Map(FEATURED_RANK.map((f, i) => [f.slug, i + 1]));

function guOf(spot: Spot): string {
  const area = spot.area?.ko || spot.address?.ko || '';
  return area.match(/\S+구/)?.[0] ?? area.split(' ')[0] ?? '';
}

export function toMapSpots(metrics: LiveSpotMetric[], lang: Lang): MapSpot[] {
  return metrics.map((m) => {
    const slug = getSpotSlug(m);
    return {
      id: m.id,
      kind: 'live' as const,
      slug,
      name: pick(m.name, lang),
      gu: guOf(m),
      lat: m.lat,
      lng: m.lng,
      category: m.category,
      emoji: m.emoji || '📍',
      score: m.currentScore,
      status: m.status,
      wait: m.waitTimeMinutes,
      bestTime: pick(m.bestTime, lang),
      isLive: Boolean(m.isLive),
      featured: FEATURED_POSITION.get(slug),
      popularity: m.baseScore,
      searchText: [m.name.ko, m.name.en, m.name.ja, m.name['zh-cn'], m.name['zh-tw'], ...(m.searchKeywords || [])].join(' ').toLowerCase(),
    };
  });
}

/** "Most visited by tourists": featured ranking first, then by popularity. */
export function rankByPopularity(spots: MapSpot[]): MapSpot[] {
  return [...spots].sort((a, b) => {
    if (a.featured && b.featured) return a.featured - b.featured;
    if (a.featured) return -1;
    if (b.featured) return 1;
    return b.popularity - a.popularity;
  });
}

export function matchesTheme(spot: MapSpot, theme: MapThemeId): boolean {
  const categories = MAP_THEMES.find((t) => t.id === theme)?.categories;
  return !categories || categories.includes(spot.category);
}
