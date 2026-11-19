import { Lang } from '@/types';
import { LUGGAGE_STORAGE, YESIM_KOREA, klookSearchLink, withSubId } from '@/lib/affiliate';
import { COUPANG, COUPANG_DISCLOSURE } from '@/lib/coupang';

// Shown near the top of airport pages (Gimpo): people checking an airport's crowd are arriving or
// leaving, so the useful offers are getting into the city, data, and dropping bags. Foreign visitors
// get Klook transfers and an eSIM; Korean visitors get luggage storage and two Coupang travel items.

export const AIRPORT_SLUGS = new Set(['gimpo-airport']);

type Row = { icon: string; title: string; sub: string; href: string };

const T: Record<Lang, { title: string; transfer: [string, string]; esim: [string, string]; storage: [string, string]; disclosure: string }> = {
  ko: {
    title: '✈️ 공항 가시는 길이라면',
    transfer: ['', ''],
    esim: ['', ''],
    storage: ['서울 짐 보관소 찾기', '체크인 전후로 캐리어 맡기고 가볍게 (Radical Storage)'],
    disclosure: '제휴 링크예요. 예약하시면 사이트 운영에 작은 수수료가 들어오지만, 가격은 똑같아요.',
  },
  en: {
    title: '✈️ Arriving or leaving Gimpo?',
    transfer: ['Gimpo Airport transfers & airport rail', 'Get into the city without the taxi queue (Klook)'],
    esim: ['Korea eSIM: set it up before you fly', 'Data works the moment you land, install by QR (Yesim)'],
    storage: ['Luggage storage in Seoul', 'Drop your bags before or after check-in (Radical Storage)'],
    disclosure: 'Affiliate links: we may earn a small commission at no extra cost to you.',
  },
  ja: {
    title: '✈️ 金浦空港を利用するなら',
    transfer: ['金浦空港の送迎・空港鉄道', 'タクシー待ちなしで市内へ（Klook）'],
    esim: ['韓国eSIM：出発前に設定', '着陸した瞬間からネットが使える・QRで簡単設定（Yesim）'],
    storage: ['ソウルの荷物預かり', 'チェックイン前後にスーツケースを預けて身軽に（Radical Storage）'],
    disclosure: 'アフィリエイトリンクです。ご予約で当サイトに手数料が入ることがありますが、料金は変わりません。',
  },
  'zh-cn': {
    title: '✈️ 在金浦机场出发或到达？',
    transfer: ['金浦机场接送与机场铁路', '不用排出租车，直达市区（Klook）'],
    esim: ['韩国 eSIM：出发前设置好', '落地即可上网，扫码安装（Yesim）'],
    storage: ['首尔行李寄存', '值机前后寄存行李，轻装出行（Radical Storage）'],
    disclosure: '推广链接：通过链接预订，本站可能获得少量佣金，价格不变。',
  },
  'zh-tw': {
    title: '✈️ 在金浦機場出發或抵達？',
    transfer: ['金浦機場接送與機場鐵路', '不用排計程車，直達市區（Klook）'],
    esim: ['韓國 eSIM：出發前設定好', '落地即可上網，掃碼安裝（Yesim）'],
    storage: ['首爾行李寄放', '報到前後寄放行李，輕裝出行（Radical Storage）'],
    disclosure: '推廣連結：透過連結預訂，本站可能獲得少量佣金，價格不變。',
  },
};

export default function AirportCard({ lang, slug }: { lang: Lang; slug: string }) {
  const t = T[lang];
  const ko = lang === 'ko';
  const rows: Row[] = ko
    ? [
        { icon: '🧳', title: t.storage[0], sub: t.storage[1], href: withSubId(LUGGAGE_STORAGE.seoul, `${slug}-airport-storage`) },
        { icon: '🔋', title: '기내용 보조배터리', sub: '쿠팡에서 보기', href: COUPANG.powerBank },
        { icon: '👝', title: '여행용 파우치·정리백', sub: '쿠팡에서 보기', href: COUPANG.travelPouch },
      ]
    : [
        { icon: '🚆', title: t.transfer[0], sub: t.transfer[1], href: klookSearchLink('Gimpo Airport transfer', `${slug}-airport-transfer`, lang) },
        { icon: '📶', title: t.esim[0], sub: t.esim[1], href: withSubId(YESIM_KOREA, `${slug}-airport-esim`) },
        { icon: '🧳', title: t.storage[0], sub: t.storage[1], href: withSubId(LUGGAGE_STORAGE.seoul, `${slug}-airport-storage`) },
      ];

  return (
    <section className="p-5 rounded-3xl bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/40 dark:to-indigo-950/30 border border-sky-100 dark:border-sky-900/40 space-y-2">
      <h2 className="text-base font-bold text-gray-900 dark:text-white">{t.title}</h2>
      {rows.map((r) => (
        <a
          key={r.href}
          href={r.href}
          target="_blank"
          rel="sponsored noopener noreferrer"
          suppressHydrationWarning
          className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-gray-900 border border-sky-100 dark:border-sky-900 hover:border-sky-300 transition-colors"
        >
          <span>
            <span className="block text-sm font-bold text-gray-900 dark:text-white">
              {r.icon} {r.title}
            </span>
            <span className="block text-xs text-gray-500 dark:text-gray-400">{r.sub}</span>
          </span>
          <span className="text-gray-400" aria-hidden="true">↗</span>
        </a>
      ))}
      <p className="text-[11px] text-gray-400">{ko ? COUPANG_DISCLOSURE : t.disclosure}</p>
      {ko && <p className="text-[11px] text-gray-400">{t.disclosure}</p>}
    </section>
  );
}
