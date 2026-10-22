import { Lang } from '@/types';
import { FORECAST_SPOTS } from '@/data/spots/forecastSpots';
import { ForecastData, ForecastDay, statusOfRate, todayOf } from '@/lib/forecast';
import { MapSpot } from '@/lib/mapSpots';
import { getSpotSlug } from '@/lib/slug';

const LOCALE: Record<Lang, string> = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP' };

/** "11월 10일 (화)" / "Tue, Nov 10" / "11月10日(火)". */
export function formatForecastDate(date: string, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALE[lang], { month: 'short', day: 'numeric', weekday: 'short', timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00Z`)
  );
}

export function quietestDay(days: ForecastDay[] | undefined): ForecastDay | undefined {
  return days?.reduce<ForecastDay | undefined>((min, d) => (!min || d.rate < min.rate ? d : min), undefined);
}

export function busiestDay(days: ForecastDay[] | undefined): ForecastDay | undefined {
  return days?.reduce<ForecastDay | undefined>((max, d) => (!max || d.rate > max.rate ? d : max), undefined);
}

/** Map records for one forecast city; the 10 most visited are featured when zoomed out. */
export function forecastToMapSpots(data: ForecastData, city: 'jeju' | 'busan', lang: Lang): MapSpot[] {
  const spots = FORECAST_SPOTS.filter((s) => s.city === city);
  const featured = new Map([...spots].sort((a, b) => b.popularity - a.popularity).slice(0, 10).map((s, i) => [s.id, i + 1]));
  return spots.map((s) => {
    const days = data.spots[s.id];
    const today = todayOf(days);
    const quiet = quietestDay(days);
    const rate = Math.round(today?.rate ?? s.popularity);
    return {
      id: s.id,
      kind: 'forecast',
      slug: getSpotSlug(s),
      name: s.name[lang] || s.name.ko,
      gu: s.area.ko,
      lat: s.lat,
      lng: s.lng,
      category: s.category,
      emoji: s.emoji,
      score: rate,
      status: statusOfRate(rate),
      wait: 0,
      bestTime: quiet ? formatForecastDate(quiet.date, lang) : '',
      isLive: false,
      featured: featured.get(s.id),
      popularity: s.popularity,
      searchText: [s.name.ko, s.name.en, s.name.ja, s.ktoName].join(' ').toLowerCase(),
    };
  });
}
