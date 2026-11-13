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

// Ready-made Travelpayouts short links (made in the dashboard's link generator, account 797404). Each one
// opens the brand's Korea page and is tracked to this account. Regenerate there if a brand changes its URLs.
export type KoreaCity = 'seoul' | 'busan' | 'jeju';

/** Yesim South Korea eSIM (18%, 90-day cookie). */
export const YESIM_KOREA = 'https://yesim.tpo.lv/7VILpm9x';

/** Radical Storage luggage lockers in the city (8%). */
export const LUGGAGE_STORAGE: Record<KoreaCity, string> = {
  seoul: 'https://radicalstorage.tpo.lv/2vdVF1BD',
  busan: 'https://radicalstorage.tpo.lv/yRd3udle',
  jeju: 'https://radicalstorage.tpo.lv/vnsWhuqJ',
};

/** Kiwitaxi private transfer from the city's main airport (Incheon, Gimhae, Jeju) (9-11%). */
export const AIRPORT_TRANSFER: Record<KoreaCity, string> = {
  seoul: 'https://kiwitaxi.tpo.lv/W62azu8p',
  busan: 'https://kiwitaxi.tpo.lv/pNTxqcX5',
  jeju: 'https://kiwitaxi.tpo.lv/3DOHV2R2',
};

/** Localrent car rental in Korea (7.5-10%); offered on Jeju pages, where most visitors drive. */
export const CAR_RENTAL_KOREA = 'https://localrent.tpo.lv/LxiiyvX3';
