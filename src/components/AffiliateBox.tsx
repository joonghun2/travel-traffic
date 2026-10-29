import { Lang } from '@/types';
import { airaloKoreaLink, klookSearchLink } from '@/lib/affiliate';

const TEXT: Record<Lang, { title: string; klook: string; klookSub: string; esim: string; esimSub: string; disclosure: string }> = {
  ko: {
    title: '여행 준비',
    klook: '{name} 투어·입장권 보기',
    klookSub: 'Klook에서 할인 티켓 찾기',
    esim: '',
    esimSub: '',
    disclosure: '제휴 링크예요. 예약하시면 사이트 운영에 작은 수수료가 들어오지만, 가격은 똑같아요.',
  },
  en: {
    title: 'Plan your visit',
    klook: 'Tours & tickets for {name}',
    klookSub: 'Compare deals on Klook',
    esim: 'Korea eSIM for your trip',
    esimSub: 'Data from landing, no SIM swap (Airalo)',
    disclosure: 'Affiliate links: we may earn a small commission at no extra cost to you.',
  },
  ja: {
    title: '旅の準備',
    klook: '{name}のツアー・チケット',
    klookSub: 'Klookでお得なチケットを探す',
    esim: '韓国旅行用eSIM',
    esimSub: '到着後すぐ使えるデータ通信（Airalo）',
    disclosure: 'アフィリエイトリンクです。ご予約で当サイトに手数料が入ることがありますが、料金は変わりません。',
  },
  'zh-cn': {
    title: '行程准备',
    klook: '{name} 门票与一日游',
    klookSub: '在 Klook 比较优惠',
    esim: '韩国旅行 eSIM',
    esimSub: '落地即可上网，无需换卡（Airalo）',
    disclosure: '本页含推广链接：通过链接预订，本站可能获得少量佣金，价格不变。',
  },
  'zh-tw': {
    title: '行程準備',
    klook: '{name} 門票與一日遊',
    klookSub: '在 Klook 比較優惠',
    esim: '韓國旅行 eSIM',
    esimSub: '落地即可上網，免換卡（Airalo）',
    disclosure: '本頁含推廣連結：透過連結預訂，本站可能獲得少量佣金，價格不變。',
  },
};

// suppressHydrationWarning: the Travelpayouts Drive script (layout head) rewrites these hrefs before React hydrates.
const linkCls =
  'flex items-center justify-between gap-3 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors';

/** Klook tours/tickets for this spot, plus a Korea eSIM on foreign-language pages. */
export default function AffiliateBox({ lang, name, enName, slug }: { lang: Lang; name: string; enName: string; slug: string }) {
  const text = TEXT[lang];
  const esim = airaloKoreaLink(lang, slug);
  return (
    <section className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-2">
      <h2 className="text-base font-bold text-gray-900 dark:text-white">{text.title}</h2>
      <a href={klookSearchLink(enName, slug)} target="_blank" rel="sponsored noopener noreferrer" className={linkCls} suppressHydrationWarning>
        <span>
          <span className="block text-sm font-bold text-gray-800 dark:text-gray-100">🎟️ {text.klook.replace('{name}', name)}</span>
          <span className="block text-xs text-gray-500 dark:text-gray-400">{text.klookSub}</span>
        </span>
        <span className="text-gray-400" aria-hidden="true">↗</span>
      </a>
      {esim && (
        <a href={esim} target="_blank" rel="sponsored noopener noreferrer" className={linkCls} suppressHydrationWarning>
          <span>
            <span className="block text-sm font-bold text-gray-800 dark:text-gray-100">📶 {text.esim}</span>
            <span className="block text-xs text-gray-500 dark:text-gray-400">{text.esimSub}</span>
          </span>
          <span className="text-gray-400" aria-hidden="true">↗</span>
        </a>
      )}
      <p className="text-[11px] text-gray-400">{text.disclosure}</p>
    </section>
  );
}
