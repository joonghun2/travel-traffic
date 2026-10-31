// UTM rules for every link that leaves the site (docs/review/phase7-utm.md).
//   utm_source   where the link is posted: kakao, x, threads, line, whatsapp, wechat, copy, native,
//                facebook, embed, poster, card
//   utm_medium   share | widget | qr | image
//   utm_campaign spot-share, theme-share, food-test, travel-type, daily-top5, badge, poster
export type UtmMedium = 'share' | 'widget' | 'qr' | 'image';

export interface Utm {
  source: string;
  medium: UtmMedium;
  campaign: string;
  /** Optional utm_content, e.g. a spot slug or card size. */
  content?: string;
}

export function withUtm(url: string, { source, medium, campaign, content }: Utm): string {
  const u = new URL(url);
  u.searchParams.set('utm_source', source);
  u.searchParams.set('utm_medium', medium);
  u.searchParams.set('utm_campaign', campaign);
  if (content) u.searchParams.set('utm_content', content);
  return u.toString();
}

/** Campaign for a share from a given app path. */
export function campaignForPath(path: string): string {
  if (path.startsWith('/spot/')) return 'spot-share';
  if (path.startsWith('/play/seoul-food-test')) return 'food-test';
  if (path.startsWith('/play/travel-type')) return 'travel-type';
  if (path.startsWith('/play/busan-food-olympics')) return 'busan-food';
  if (path.startsWith('/play/')) return 'play-share';
  if (path.startsWith('/cards')) return 'daily-top5';
  if (/^\/(seoul|jeju|busan)\//.test(path)) return 'theme-share';
  return 'site-share';
}
