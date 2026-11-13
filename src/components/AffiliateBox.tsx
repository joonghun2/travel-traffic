import { Lang } from '@/types';
import { AIRPORT_TRANSFER, CAR_RENTAL_KOREA, KoreaCity, LUGGAGE_STORAGE, YESIM_KOREA, klookSearchLink } from '@/lib/affiliate';

type Row = { title: string; sub: string };
type Text = {
  title: string;
  klook: Row;
  storage: Row;
  transfer: Row;
  car: Row;
  esim: Row;
  airport: Record<KoreaCity, string>;
  disclosure: string;
};

const TEXT: Record<Lang, Text> = {
  ko: {
    title: '여행 준비',
    klook: { title: '{name} 투어·입장권 보기', sub: 'Klook에서 할인 티켓 찾기' },
    storage: { title: '근처 짐 보관소 찾기', sub: '캐리어 맡기고 가볍게 구경하기 (Radical Storage)' },
    transfer: { title: '{airport} 픽업 예약', sub: '' },
    car: { title: '', sub: '' },
    esim: { title: '', sub: '' },
    airport: { seoul: '인천공항', busan: '김해공항', jeju: '제주공항' },
    disclosure: '제휴 링크예요. 예약하시면 사이트 운영에 작은 수수료가 들어오지만, 가격은 똑같아요.',
  },
  en: {
    title: 'Plan your visit',
    klook: { title: 'Tours & tickets for {name}', sub: 'Compare deals on Klook' },
    storage: { title: 'Luggage storage nearby', sub: 'Drop your bags and explore light (Radical Storage)' },
    transfer: { title: 'Private transfer from {airport}', sub: 'Fixed price, driver waits at arrivals (Kiwitaxi)' },
    car: { title: 'Rent a car in Jeju', sub: 'Most of Jeju is easiest by car (Localrent)' },
    esim: { title: 'Korea eSIM', sub: 'Data from landing, no SIM swap (Yesim)' },
    airport: { seoul: 'Incheon Airport', busan: 'Gimhae Airport', jeju: 'Jeju Airport' },
    disclosure: 'Affiliate links: we may earn a small commission at no extra cost to you.',
  },
  ja: {
    title: '旅の準備',
    klook: { title: '{name}のツアー・チケット', sub: 'Klookでお得なチケットを探す' },
    storage: { title: '近くの荷物預かり', sub: '荷物を預けて身軽に観光（Radical Storage）' },
    transfer: { title: '{airport}からの送迎', sub: '定額・到着ロビーでお出迎え（Kiwitaxi）' },
    car: { title: '済州島でレンタカー', sub: '済州は車での移動が便利（Localrent）' },
    esim: { title: '韓国旅行用eSIM', sub: '到着後すぐ使えるデータ通信（Yesim）' },
    airport: { seoul: '仁川空港', busan: '金海空港', jeju: '済州空港' },
    disclosure: 'アフィリエイトリンクです。ご予約で当サイトに手数料が入ることがありますが、料金は変わりません。',
  },
  'zh-cn': {
    title: '行程准备',
    klook: { title: '{name} 门票与一日游', sub: '在 Klook 比较优惠' },
    storage: { title: '附近的行李寄存', sub: '寄存行李，轻装游玩（Radical Storage）' },
    transfer: { title: '{airport}接机', sub: '一口价，司机在到达厅等候（Kiwitaxi）' },
    car: { title: '济州岛租车', sub: '济州自驾最方便（Localrent）' },
    esim: { title: '韩国旅行 eSIM', sub: '落地即可上网，无需换卡（Yesim）' },
    airport: { seoul: '仁川机场', busan: '金海机场', jeju: '济州机场' },
    disclosure: '本页含推广链接：通过链接预订，本站可能获得少量佣金，价格不变。',
  },
  'zh-tw': {
    title: '行程準備',
    klook: { title: '{name} 門票與一日遊', sub: '在 Klook 比較優惠' },
    storage: { title: '附近的行李寄放', sub: '寄放行李，輕裝遊玩（Radical Storage）' },
    transfer: { title: '{airport}接機', sub: '一口價，司機在入境大廳等候（Kiwitaxi）' },
    car: { title: '濟州島租車', sub: '濟州自駕最方便（Localrent）' },
    esim: { title: '韓國旅行 eSIM', sub: '落地即可上網，免換卡（Yesim）' },
    airport: { seoul: '仁川機場', busan: '金海機場', jeju: '濟州機場' },
    disclosure: '本頁含推廣連結：透過連結預訂，本站可能獲得少量佣金，價格不變。',
  },
};

// suppressHydrationWarning: the Travelpayouts Drive script (layout head) rewrites these hrefs before React hydrates.
const linkCls =
  'flex items-center justify-between gap-3 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors';

function AffLink({ href, icon, row }: { href: string; icon: string; row: Row }) {
  return (
    <a href={href} target="_blank" rel="sponsored noopener noreferrer" className={linkCls} suppressHydrationWarning>
      <span>
        <span className="block text-sm font-bold text-gray-800 dark:text-gray-100">
          {icon} {row.title}
        </span>
        {row.sub && <span className="block text-xs text-gray-500 dark:text-gray-400">{row.sub}</span>}
      </span>
      <span className="text-gray-400" aria-hidden="true">↗</span>
    </a>
  );
}

/**
 * Travel links for a spot page, all via Travelpayouts: Klook tours/tickets and nearby luggage storage for
 * everyone; for foreign-language visitors also an airport transfer, a Korea eSIM, and on Jeju a rental car.
 */
export default function AffiliateBox({
  lang,
  name,
  enName,
  slug,
  city = 'seoul',
}: {
  lang: Lang;
  name: string;
  enName: string;
  slug: string;
  city?: KoreaCity;
}) {
  const text = TEXT[lang];
  const foreign = lang !== 'ko';
  return (
    <section className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-2">
      <h2 className="text-base font-bold text-gray-900 dark:text-white">{text.title}</h2>
      <AffLink href={klookSearchLink(enName, slug)} icon="🎟️" row={{ ...text.klook, title: text.klook.title.replace('{name}', name) }} />
      <AffLink href={LUGGAGE_STORAGE[city]} icon="🧳" row={text.storage} />
      {foreign && (
        <AffLink href={AIRPORT_TRANSFER[city]} icon="🚐" row={{ ...text.transfer, title: text.transfer.title.replace('{airport}', text.airport[city]) }} />
      )}
      {foreign && city === 'jeju' && <AffLink href={CAR_RENTAL_KOREA} icon="🚗" row={text.car} />}
      {foreign && <AffLink href={YESIM_KOREA} icon="📶" row={text.esim} />}
      <p className="text-[11px] text-gray-400">{text.disclosure}</p>
    </section>
  );
}
