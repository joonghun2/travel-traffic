/**
 * Featured Seoul spots, in the order shown on the zoomed-out map and in the
 * "most visited by tourists" list (phase 8). Edit this list to change the ranking.
 *
 * Basis: Seoul AI Foundation 2025 foreign visitor footfall analysis and Korea
 * Tourism Organization data on foreign visitors' preferred destinations.
 * Values are spot slugs (see /spot/<slug>).
 */
export const FEATURED_RANK: { slug: string; icon: string }[] = [
  { slug: 'myeongdong-shopping-street-cathedral', icon: 'shopping-bag' },
  { slug: 'n-seoul-tower-namsan-park', icon: 'tower' },
  { slug: 'coex-mall-starfield-library', icon: 'book' },
  { slug: 'gangnam-station-boulevard', icon: 'train' },
  { slug: 'hongdae-walking-street-busking-zone', icon: 'music' },
  { slug: 'gyeongbokgung-palace-gwanghwamun', icon: 'palace' },
  { slug: 'seongsu-yeonmujang-gil-cafe-street', icon: 'coffee' },
  { slug: 'dongdaemun-design-plaza-ddp', icon: 'arch' },
  { slug: 'yeouido-hangang-park', icon: 'tree' },
  { slug: 'jamsil-lotte-world-mall-seokchon-lake', icon: 'skyscraper' },
];
