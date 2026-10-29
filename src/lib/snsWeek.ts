import { CrowdStatus, ForecastCityId, ForecastSpot, Spot } from '@/types';
import { SPOTS_DATA } from '@/data/spotsData';
import { FORECAST_SPOTS } from '@/data/spots/forecastSpots';
import { getSpotSlug } from '@/lib/slug';
import { getHourlyForecast, HourlyPoint } from '@/lib/spots';
import { ForecastData, statusOfRate } from '@/lib/forecast';
import { STATUS_COLOR } from '@/lib/mapSpots';
import { SITE_URL } from '@/lib/i18n/routing';

// One week of Instagram/Threads posts (Korean + English), uploaded by hand through
// Meta Business Suite from /sns. Images come from /sns/[file].

export type PostKind = 'hours' | 'gem' | 'day' | 'reel';

export interface SnsPost {
  /** YYYY-MM-DD (KST) the post goes up. */
  date: string;
  kind: PostKind;
  /** Image file name without the -feed.png / -story.png suffix (none for the reel). */
  image?: string;
  caption: string;
}

const DAY = 86400000;
const KO_DOW = ['일', '월', '화', '수', '목', '금', '토'];
const EN_DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const EN_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const addDays = (ymd: string, n: number) => new Date(Date.parse(`${ymd}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);
const dow = (ymd: string) => new Date(`${ymd}T00:00:00Z`).getUTCDay();

/** "11월 7일 (토)" */
export const koDate = (ymd: string) => `${Number(ymd.slice(5, 7))}월 ${Number(ymd.slice(8, 10))}일 (${KO_DOW[dow(ymd)]})`;
/** "Sat, Nov 7" */
export const enDate = (ymd: string) => `${EN_DOW[dow(ymd)]}, ${EN_MON[Number(ymd.slice(5, 7)) - 1]} ${Number(ymd.slice(8, 10))}`;

export const koHour = (h: number) => (h < 12 ? `오전 ${h === 0 ? 12 : h}시` : `오후 ${h === 12 ? 12 : h - 12}시`);
export const enHour = (h: number) => `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? 'AM' : 'PM'}`;

/** The Monday (KST) on or after tomorrow: the next week to schedule. */
export function nextMonday(now = Date.now()): string {
  const tomorrow = new Date(now + 9 * 3600 * 1000 + DAY).toISOString().slice(0, 10);
  return addDays(tomorrow, (8 - dow(tomorrow)) % 7);
}

/** First part of a name, e.g. "경복궁 & 광화문 광장" -> "경복궁". Keeps headlines short. */
export const shortName = (name: string) => name.split(/\s*[&＆(（/]\s*/)[0].trim();

// Busiest Seoul spots make the best "when is it quiet?" posts.
const HOUR_SPOTS: Spot[] = [...SPOTS_DATA].sort((a, b) => b.baseScore - a.baseScore).slice(0, 26);
const GEM_SPOTS: Spot[] = SPOTS_DATA.filter((s) => s.escapeRoute);

export const seoulSpotBySlug = (slug: string) => SPOTS_DATA.find((s) => getSpotSlug(s) === slug);

export interface HoursSummary {
  weekday: HourlyPoint[];
  quietWeekday: number;
  quietWeekend: number;
  peakWeekday: number;
}

/** Quietest/busiest daytime hours (9:00-21:00) from the pattern model. */
export function hoursSummary(spot: Spot): HoursSummary {
  const day = (points: HourlyPoint[]) => points.filter((p) => p.hour >= 9 && p.hour <= 21);
  const weekday = getHourlyForecast(spot, false);
  const weekend = getHourlyForecast(spot, true);
  const min = (ps: HourlyPoint[]) => day(ps).reduce((m, p) => (p.score < m.score ? p : m)).hour;
  const max = (ps: HourlyPoint[]) => day(ps).reduce((m, p) => (p.score > m.score ? p : m)).hour;
  return { weekday, quietWeekday: min(weekday), quietWeekend: min(weekend), peakWeekday: max(weekday) };
}

export interface DayRow {
  spot: ForecastSpot;
  score: number;
  status: CrowdStatus;
  color: string;
}

/** Quietest forecast spots in a city on a date; falls back to the nearest forecast date. */
export function quietestOn(data: ForecastData, city: ForecastCityId, date: string, n = 5): { date: string; rows: DayRow[] } {
  const spots = FORECAST_SPOTS.filter((s) => s.city === city);
  const dates = [...new Set(spots.flatMap((s) => (data.spots[s.id] ?? []).map((d) => d.date)))].sort();
  const target = dates.includes(date) ? date : dates.filter((d) => d <= date).pop() ?? dates[0] ?? date;
  const rows = spots
    .flatMap((spot) => {
      const day = data.spots[spot.id]?.find((d) => d.date === target);
      const status = day && statusOfRate(day.rate);
      return day && status ? [{ spot, score: Math.round(day.rate), status, color: STATUS_COLOR[status] }] : [];
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, n);
  return { date: target, rows };
}

const link = (path: string, campaign: string) => `${SITE_URL}${path}?utm_source=sns&utm_medium=social&utm_campaign=${campaign}`;

function hoursCaption(spot: Spot) {
  const s = hoursSummary(spot);
  const ko = shortName(spot.name.ko);
  const en = shortName(spot.name.en);
  const slug = getSpotSlug(spot);
  return [
    `${ko}, 몇 시에 가야 한산할까? 🤔`,
    ``,
    `✅ 평일엔 ${koHour(s.quietWeekday)}, 주말엔 ${koHour(s.quietWeekend)}이 가장 여유로워요.`,
    `⚠️ 평일 ${koHour(s.peakWeekday)} 전후는 피하세요.`,
    `지금 실시간 혼잡도는 프로필 링크에서 확인!`,
    ``,
    `When is ${en} least crowded?`,
    `Weekdays around ${enHour(s.quietWeekday)}, weekends around ${enHour(s.quietWeekend)}. Skip ${enHour(s.peakWeekday)} on weekdays.`,
    `Live crowd levels: link in bio.`,
    ``,
    `🔗 ${link(`/spot/${slug}`, 'weekly-hours')}`,
    `* 요일·시간대 패턴 예측 / pattern-based estimate`,
    ``,
    `#서울여행 #${ko.replace(/\s/g, '')} #서울가볼만한곳 #한산한곳 #seoultravel #koreatravel #seoul`,
  ].join('\n');
}

function gemCaption(spot: Spot) {
  const g = spot.escapeRoute!;
  const ko = shortName(spot.name.ko);
  const en = shortName(spot.name.en);
  return [
    `${ko} 너무 붐빌 땐? 여기로 피하세요 🏃`,
    ``,
    `💎 ${g.gemName.ko}`,
    `${g.gemDesc.ko}`,
    `🚶 도보 ${g.walkMinutes}분 · 사람 ${g.crowdDiffPercent}% 적어요`,
    ``,
    `Too crowded at ${en}? Try ${g.gemName.en}: ${g.walkMinutes} min walk, ${g.crowdDiffPercent}% fewer people.`,
    ``,
    `저장해 두고 다음 서울 여행에 써먹기 📌 / Save this for your Seoul trip 📌`,
    `🔗 ${link(`/spot/${getSpotSlug(spot)}`, 'weekly-gem')}`,
    ``,
    `#서울여행 #서울숨은명소 #${ko.replace(/\s/g, '')} #서울데이트 #seoultravel #hiddengems #koreatravel`,
  ].join('\n');
}

const CITY_KO: Record<ForecastCityId, string> = { jeju: '제주', busan: '부산' };
const CITY_EN: Record<ForecastCityId, string> = { jeju: 'Jeju', busan: 'Busan' };

function dayCaption(data: ForecastData, city: ForecastCityId, date: string) {
  const { date: d, rows } = quietestOn(data, city, date);
  const list = rows.map((r, i) => `${i + 1}. ${r.spot.name.ko} (${r.spot.name.en})`).join('\n');
  const quiet = rows[0]?.status === 'relaxed';
  return [
    quiet ? `${koDate(d)} ${CITY_KO[city]}, 사람 적은 곳만 골랐어요 🌿` : `${koDate(d)} ${CITY_KO[city]}, 그나마 덜 붐비는 곳은 여기예요 🌿`,
    ``,
    list,
    ``,
    `${quiet ? 'Quietest' : 'Least crowded'} spots in ${CITY_EN[city]} on ${enDate(d)} (Korea Tourism Organization forecast).`,
    ``,
    `주말 여행 계획에 저장 📌 / Save for your weekend plan 📌`,
    `🔗 ${link(`/${city}`, 'weekly-day')}`,
    `* 한국관광공사 관광지 집중률 예측 기준`,
    ``,
    `#${CITY_KO[city]}여행 #${CITY_KO[city]}가볼만한곳 #주말여행 #한산한곳 #${CITY_EN[city].toLowerCase()} #koreatravel #${CITY_EN[city].toLowerCase()}travel`,
  ].join('\n');
}

const REEL_CAPTION = [
  `이번 주 한산한 곳 총정리 🗺️ 서울·제주·부산`,
  `사람 많은 곳 피해서 여유롭게 여행하세요.`,
  ``,
  `This week's quiet spots in Seoul, Jeju and Busan. Skip the crowds!`,
  ``,
  `🔗 ${link('/', 'weekly-reel')}`,
  ``,
  `#국내여행 #서울여행 #제주여행 #부산여행 #여행꿀팁 #koreatravel #travelkorea #reels`,
].join('\n');

/** Mon hours · Tue gem · Wed Jeju Saturday · Thu hours · Fri Busan Saturday · Sat gem · Sun reel. */
export function buildWeek(monday: string, data: ForecastData): SnsPost[] {
  // Rotate spots by week so posts don't repeat for months.
  const week = Math.round((Date.parse(`${monday}T00:00:00Z`) - Date.parse('2026-01-05T00:00:00Z')) / (7 * DAY));
  const hours = (i: number) => HOUR_SPOTS[(week * 2 + i) % HOUR_SPOTS.length];
  // Skip gems whose spot is already this week's "hours" post.
  const gemPool = GEM_SPOTS.filter((s) => s !== hours(0) && s !== hours(1));
  const gem = (i: number) => gemPool[(week * 2 + i) % gemPool.length];
  const saturday = addDays(monday, 5);
  const posts: SnsPost[] = [];
  const add = (offset: number, kind: PostKind, image: string | undefined, caption: string) =>
    posts.push({ date: addDays(monday, offset), kind, image, caption });

  const h1 = hours(0), g1 = gem(0), h2 = hours(1), g2 = gem(1);
  add(0, 'hours', `hours-${getSpotSlug(h1)}`, hoursCaption(h1));
  add(1, 'gem', `gem-${getSpotSlug(g1)}`, gemCaption(g1));
  add(2, 'day', `day-jeju-${saturday}`, dayCaption(data, 'jeju', saturday));
  add(3, 'hours', `hours-${getSpotSlug(h2)}`, hoursCaption(h2));
  add(4, 'day', `day-busan-${saturday}`, dayCaption(data, 'busan', saturday));
  add(5, 'gem', `gem-${getSpotSlug(g2)}`, gemCaption(g2));
  add(6, 'reel', undefined, REEL_CAPTION);
  return posts;
}
