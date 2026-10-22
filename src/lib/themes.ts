import { CityId, ForecastSpot, Spot } from '@/types';
import { SPOTS_DATA } from '@/data/spotsData';
import { FORECAST_SPOTS } from '@/data/spots/forecastSpots';

type AnySpot = Spot | ForecastSpot;

interface ThemeDef {
  slug: string;
  icon: string;
  match: (s: AnySpot) => boolean;
}

const cat = (...c: Spot['category'][]) => (s: AnySpot) => c.includes(s.category);
const isBeach = (s: AnySpot) => s.category === 'nature' && s.emoji === '🏖️';

/** Theme hubs per city (/seoul/palaces, /busan/beaches, ...). */
export const CITY_THEMES: Record<CityId, ThemeDef[]> = {
  seoul: [
    { slug: 'palaces', icon: '🏯', match: cat('palace') },
    { slug: 'parks', icon: '🌳', match: cat('nature') },
    { slug: 'night-view', icon: '🌃', match: cat('view') },
    { slug: 'markets', icon: '🥢', match: cat('food') },
    { slug: 'shopping', icon: '🛍️', match: cat('shopping') },
    { slug: 'landmarks', icon: '🎡', match: cat('attraction') },
    { slug: 'neighborhoods', icon: '🚉', match: cat('neighborhood') },
  ],
  jeju: [],
  busan: [],
};
const FORECAST_THEMES: ThemeDef[] = [
  { slug: 'beaches', icon: '🏖️', match: isBeach },
  { slug: 'nature', icon: '⛰️', match: (s) => s.category === 'nature' && !isBeach(s) },
  { slug: 'markets', icon: '🛍️', match: cat('food') },
  { slug: 'temples', icon: '🛕', match: cat('palace') },
  { slug: 'views', icon: '🌉', match: cat('view') },
  { slug: 'attractions', icon: '🎡', match: cat('attraction') },
];
CITY_THEMES.jeju = FORECAST_THEMES;
CITY_THEMES.busan = FORECAST_THEMES;

export function citySpots(city: CityId): AnySpot[] {
  return city === 'seoul' ? SPOTS_DATA : FORECAST_SPOTS.filter((s) => s.city === city);
}

/** Themes with at least two spots in the city. */
export function themesFor(city: CityId): ThemeDef[] {
  const spots = citySpots(city);
  return CITY_THEMES[city].filter((t) => spots.filter(t.match).length >= 2);
}

export function themeSpots(city: CityId, slug: string): AnySpot[] {
  const def = CITY_THEMES[city].find((t) => t.slug === slug);
  return def ? citySpots(city).filter(def.match) : [];
}
