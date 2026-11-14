import { Lang } from '@/types';
import { ForecastDay, statusOfRate } from '@/lib/forecast';
import { klookSearchLink } from '@/lib/affiliate';
import { COUPANG, COUPANG_DISCLOSURE } from '@/lib/coupang';

// "If you're going today" card for spots people search right before a visit (Lotte World first).
// Shows the Korea Tourism Organization outlook for today and the next days, a mood line for today's
// crowd level, a checklist of stable, verifiable tips, and a ticket link. Text only states facts from
// the park's official guide (hours vary by day; some Magic Island rides stop in rain, wind or extreme
// temperatures; Magic Pass reservations are in the official app).

type Level = 'relaxed' | 'moderate' | 'crowded' | 'very_crowded';

interface Copy {
  title: string;
  outlook: string;
  source: string;
  mood: Record<Level, string>;
  checklistTitle: string;
  checklist: string[];
  hoursLink: string;
  ticket: { title: string; sub: string };
  disclosure: string;
  levels: Record<Level, string>;
  dow: string[];
  today: string;
}

const COPY: Record<Lang, Copy> = {
  ko: {
    title: '오늘 롯데월드 가신다면',
    outlook: '오늘 하루 예보',
    source: '한국관광공사 관광지 집중률 예측',
    mood: {
      relaxed: '오늘은 여유로운 편이에요. 타고 싶은 걸 마음껏 타고 오세요! 🎢',
      moderate: '보통 수준이에요. 인기 어트랙션만 먼저 타면 하루가 훨씬 편해져요.',
      crowded: '꽤 붐빌 것 같아요. 인기 어트랙션은 줄이 길 수 있으니 순서를 미리 정해 두세요.',
      very_crowded: '많이 붐비는 날이에요. 긴 줄은 각오하고, 마음의 여유부터 챙겨 가세요 😌',
    },
    checklistTitle: '출발 전 체크리스트',
    checklist: [
      '오늘 운영 시간 확인하고 개장 30분 전 도착하기',
      '매직패스는 공식 앱에서 미리 예약하기',
      '앱을 계속 쓰니 보조배터리 챙기기',
      '오래 걷고 줄 서니 편한 신발 신기',
      '아이와 함께라면 어트랙션 키 제한 미리 확인하기',
      '비·강풍·추위엔 매직아일랜드(야외) 일부가 멈출 수 있어요. 실내 어트랙션 위주로 계획하기',
    ],
    hoursLink: '오늘 운영 시간·운휴 시설 보기 (롯데월드 공식)',
    ticket: { title: '롯데월드 입장권 할인가 비교', sub: 'Klook에서 가격 확인하기' },
    disclosure: '입장권은 제휴 링크예요. 예약하시면 사이트 운영에 작은 수수료가 들어오지만, 가격은 똑같아요.',
    levels: { relaxed: '여유', moderate: '보통', crowded: '붐빔', very_crowded: '매우 붐빔' },
    dow: ['일', '월', '화', '수', '목', '금', '토'],
    today: '오늘',
  },
  en: {
    title: 'Going to Lotte World today?',
    outlook: "Today's outlook",
    source: 'Korea Tourism Organization visitor forecast',
    mood: {
      relaxed: 'A relaxed day. Ride whatever you like! 🎢',
      moderate: 'Moderate crowds. Hit the popular rides first and the day gets much easier.',
      crowded: 'Expect a busy day. Popular rides may have long lines, so plan your order.',
      very_crowded: 'A very busy day. Expect long lines and bring some patience 😌',
    },
    checklistTitle: 'Before you go',
    checklist: [
      "Check today's opening hours and arrive 30 minutes before opening",
      'Reserve Magic Pass in the official app',
      "Bring a power bank: you'll use the app all day",
      'Wear comfortable shoes for long walks and lines',
      'With kids, check ride height limits in advance',
      'Some outdoor Magic Island rides can stop in rain, strong wind or cold; plan indoor rides as backup',
    ],
    hoursLink: "Today's hours & closed rides (official site)",
    ticket: { title: 'Compare Lotte World ticket deals', sub: 'Check prices on Klook' },
    disclosure: 'The ticket link is an affiliate link: we may earn a small commission at no extra cost to you.',
    levels: { relaxed: 'Relaxed', moderate: 'Moderate', crowded: 'Busy', very_crowded: 'Very busy' },
    dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    today: 'Today',
  },
  ja: {
    title: '今日ロッテワールドに行くなら',
    outlook: '今日の予報',
    source: '韓国観光公社 観光地集中率予測',
    mood: {
      relaxed: '今日は比較的すいています。好きなアトラクションを楽しんで！🎢',
      moderate: '普通の混雑です。人気アトラクションを先に乗ると一日が楽になります。',
      crowded: 'かなり混みそうです。人気アトラクションは行列が長くなるので順番を決めておきましょう。',
      very_crowded: 'とても混む日です。長い行列を覚悟して、心に余裕を持って 😌',
    },
    checklistTitle: '出発前チェックリスト',
    checklist: [
      '今日の営業時間を確認し、開園30分前に到着',
      'マジックパスは公式アプリで事前予約',
      'アプリを使い続けるのでモバイルバッテリーを',
      'たくさん歩くので歩きやすい靴で',
      'お子さま連れは身長制限を事前に確認',
      '雨・強風・寒さでマジックアイランド（屋外）の一部が止まることも。屋内中心に計画を',
    ],
    hoursLink: '今日の営業時間・運休施設（公式サイト）',
    ticket: { title: 'ロッテワールドのチケットを比較', sub: 'Klookで料金をチェック' },
    disclosure: 'チケットはアフィリエイトリンクです。料金は変わりません。',
    levels: { relaxed: 'すいている', moderate: '普通', crowded: '混雑', very_crowded: '大混雑' },
    dow: ['日', '月', '火', '水', '木', '金', '土'],
    today: '今日',
  },
  'zh-cn': {
    title: '今天去乐天世界吗？',
    outlook: '今日预报',
    source: '韩国观光公社 景区集中率预测',
    mood: {
      relaxed: '今天比较空，尽情玩吧！🎢',
      moderate: '人流一般。先玩热门项目，一整天会轻松很多。',
      crowded: '预计人较多，热门项目可能排长队，提前规划顺序。',
      very_crowded: '今天非常拥挤，做好排长队的心理准备 😌',
    },
    checklistTitle: '出发前清单',
    checklist: [
      '确认今天的营业时间，开园前30分钟到达',
      '在官方App提前预约Magic Pass',
      '整天都要用App，带上充电宝',
      '要走很多路，穿舒适的鞋',
      '带孩子的话，提前确认项目身高限制',
      '下雨、强风或寒冷时，魔幻岛（室外）部分项目可能停运，备好室内方案',
    ],
    hoursLink: '今日营业时间·停运设施（官方网站）',
    ticket: { title: '比较乐天世界门票价格', sub: '在 Klook 查看价格' },
    disclosure: '门票为推广链接：本站可能获得少量佣金，价格不变。',
    levels: { relaxed: '空闲', moderate: '一般', crowded: '拥挤', very_crowded: '非常拥挤' },
    dow: ['日', '一', '二', '三', '四', '五', '六'],
    today: '今天',
  },
  'zh-tw': {
    title: '今天去樂天世界嗎？',
    outlook: '今日預報',
    source: '韓國觀光公社 景點集中率預測',
    mood: {
      relaxed: '今天比較空，盡情玩吧！🎢',
      moderate: '人潮普通。先玩熱門設施，一整天會輕鬆很多。',
      crowded: '預計人較多，熱門設施可能大排長龍，先規劃好順序。',
      very_crowded: '今天非常擁擠，做好排長隊的心理準備 😌',
    },
    checklistTitle: '出發前清單',
    checklist: [
      '確認今天的營業時間，開園前30分鐘到達',
      '在官方App提前預約Magic Pass',
      '整天都要用App，記得帶行動電源',
      '要走很多路，穿舒適的鞋',
      '帶小孩的話，先確認設施身高限制',
      '下雨、強風或寒冷時，魔幻島（戶外）部分設施可能停駛，準備室內備案',
    ],
    hoursLink: '今日營業時間·停駛設施（官方網站）',
    ticket: { title: '比較樂天世界門票價格', sub: '在 Klook 查看價格' },
    disclosure: '門票為推廣連結：本站可能獲得少量佣金，價格不變。',
    levels: { relaxed: '空閒', moderate: '普通', crowded: '擁擠', very_crowded: '非常擁擠' },
    dow: ['日', '一', '二', '三', '四', '五', '六'],
    today: '今天',
  },
};

const LEVEL_STYLE: Record<Level, string> = {
  relaxed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
  moderate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
  crowded: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
  very_crowded: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200',
};

// Korean pages: Coupang search links for the checklist items you can buy (index into checklist).
const COUPANG_ITEMS: Record<number, string> = { 2: COUPANG.powerBank, 4: COUPANG.kidsIdBracelet, 5: COUPANG.raincoat };
const KO_WINTER_ITEM = '매직아일랜드는 야외라 추워요. 핫팩과 터치 장갑 챙기기';

const OFFICIAL_HOURS = 'https://adventure.lotteworld.com/usage-guide/service/closed';

function CoupangLink({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="sponsored noopener noreferrer" className="ml-1.5 inline-block text-xs font-semibold text-sky-700 dark:text-sky-300 underline underline-offset-2">
      쿠팡에서 보기 ↗
    </a>
  );
}

export default function GoingTodayCard({ lang, days, slug }: { lang: Lang; days: ForecastDay[] | null; slug: string }) {
  const c = COPY[lang];
  const todayYmd = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  const upcoming = (days ?? []).filter((d) => d.date >= todayYmd).slice(0, 7);
  const today = upcoming[0]?.date === todayYmd ? upcoming[0] : undefined;
  // statusOfRate never returns "packed" (that band is Seoul-only).
  const level = (today ? statusOfRate(today.rate) : 'moderate') as Level;
  const ko = lang === 'ko';
  const month = Number(todayYmd.slice(5, 7));
  const winter = month >= 11 || month <= 2;

  return (
    <section className="p-5 rounded-3xl bg-gradient-to-br from-violet-50 to-sky-50 dark:from-violet-950/40 dark:to-sky-950/30 border border-violet-100 dark:border-violet-900/40 space-y-4">
      <h2 className="text-base font-bold text-gray-900 dark:text-white">🎡 {c.title}</h2>

      {today && (
        <div className="space-y-2">
          <p className="text-sm text-gray-700 dark:text-gray-200">
            {c.outlook}:{' '}
            <span className={`inline-block px-2 py-0.5 rounded-lg font-bold ${LEVEL_STYLE[level]}`}>
              {c.levels[level]} {today.rate}
            </span>
          </p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{c.mood[level]}</p>
          {upcoming.length > 1 && (
            <ol className="grid grid-cols-7 gap-1 pt-1" aria-label={c.source}>
              {upcoming.map((d) => {
                const lv = statusOfRate(d.rate) as Level;
                const dt = new Date(`${d.date}T00:00:00Z`);
                return (
                  <li key={d.date} className={`rounded-xl py-1.5 text-center ${LEVEL_STYLE[lv]}`}>
                    <span className="block text-[10px] font-semibold opacity-80">
                      {d.date === todayYmd ? c.today : `${dt.getUTCMonth() + 1}/${dt.getUTCDate()}`}
                    </span>
                    <span className="block text-[11px] font-bold">{c.dow[dt.getUTCDay()]}</span>
                    <span className="block text-xs font-black">{d.rate}</span>
                  </li>
                );
              })}
            </ol>
          )}
          <p className="text-[11px] text-gray-500 dark:text-gray-400">* {c.source}</p>
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">✅ {c.checklistTitle}</h3>
        <ul className="mt-2 space-y-1.5 text-sm text-gray-700 dark:text-gray-200">
          {c.checklist.map((item, i) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true">☐</span>
              <span>
                {item}
                {ko && COUPANG_ITEMS[i] && <CoupangLink href={COUPANG_ITEMS[i]} />}
              </span>
            </li>
          ))}
          {ko && winter && (
            <li className="flex gap-2">
              <span aria-hidden="true">☐</span>
              <span>
                {KO_WINTER_ITEM}
                <CoupangLink href={COUPANG.handWarmer} />
              </span>
            </li>
          )}
        </ul>
        <a href={OFFICIAL_HOURS} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold text-violet-700 dark:text-violet-300 underline underline-offset-2">
          {c.hoursLink} ↗
        </a>
      </div>

      <a
        href={klookSearchLink('Lotte World Adventure ticket', `${slug}-going-today`)}
        target="_blank"
        rel="sponsored noopener noreferrer"
        suppressHydrationWarning
        className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-gray-900 border border-violet-200 dark:border-violet-800 hover:border-violet-400 transition-colors"
      >
        <span>
          <span className="block text-sm font-bold text-gray-900 dark:text-white">🎟️ {c.ticket.title}</span>
          <span className="block text-xs text-gray-500 dark:text-gray-400">{c.ticket.sub}</span>
        </span>
        <span className="text-gray-400" aria-hidden="true">↗</span>
      </a>
      <p className="text-[11px] text-gray-400">{c.disclosure}</p>
      {ko && <p className="text-[11px] text-gray-400">{COUPANG_DISCLOSURE}</p>}
    </section>
  );
}
