import { Lang } from '@/types';

// Travelpayouts account (marker) and project (trs = checkeastpoint.com). Not secrets: they appear in every link.
const MARKER = '797404';
const TRS = '592750';

// Travelpayouts program ids: p = partner, campaign_id = program page id in the dashboard.
const PROGRAMS = {
  klook: { p: '4110', campaignId: '137' },
  airalo: { p: '8310', campaignId: '541' },
} as const;

function tpLink(program: keyof typeof PROGRAMS, url: string, subId: string) {
  const { p, campaignId } = PROGRAMS[program];
  const params = new URLSearchParams({ marker: MARKER, trs: TRS, p, u: url, campaign_id: campaignId, sub_id: subId });
  return `https://tp.media/r?${params}`;
}

/** First part of an English spot name, e.g. "Gyeongbokgung Palace & Gwanghwamun" -> "Gyeongbokgung Palace". */
const searchTerm = (enName: string) => enName.split(/\s*[&(/]\s*/)[0].trim();

/** Klook search for tours and tickets around a spot. Klook picks the visitor's language itself. */
export function klookSearchLink(enName: string, subId: string) {
  return tpLink('klook', `https://www.klook.com/search/result/?query=${encodeURIComponent(searchTerm(enName))}`, subId);
}

const AIRALO_PATH: Record<Exclude<Lang, 'ko'>, string> = { en: '', ja: 'ja/', 'zh-cn': 'zh-CN/', 'zh-tw': 'zh-TW/' };

/** Airalo's South Korea eSIM page; only for foreign-language pages (Korean visitors don't need one). */
export function airaloKoreaLink(lang: Lang, subId: string) {
  return lang === 'ko' ? null : tpLink('airalo', `https://www.airalo.com/${AIRALO_PATH[lang]}south-korea-esim`, subId);
}
