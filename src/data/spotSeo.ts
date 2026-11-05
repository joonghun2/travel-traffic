import { Lang } from '@/types';

/**
 * Search-focused copy for the spots that already win clicks (Search Console, Oct-Nov 2026): people look
 * for "지금 사람 많아?", "실시간 혼잡도" and "待ち時間". Titles use those words; the answers say plainly what
 * our score is and is not (an area crowd level, not a head count or an official queue time).
 */
type L5 = Record<Lang, string>;
interface Faq {
  q: string;
  a: string;
}

export interface SpotSeo {
  title: L5;
  /** {status} and {score} are filled in with the current reading. */
  description: L5;
  guideTitle: L5;
  guide: Record<Lang, string[]>;
  faqs: Record<Lang, Faq[]>;
  /** Slugs of closely related spots. */
  related: string[];
}

const LOTTE: L5 = { ko: '롯데월드', en: 'Lotte World', ja: 'ロッテワールド', 'zh-cn': '乐天世界', 'zh-tw': '樂天世界' };
const MALL: L5 = { ko: '롯데월드몰·석촌호수', en: 'Lotte World Mall and Seokchon Lake', ja: 'ロッテワールドモール・石村湖', 'zh-cn': '乐天世界购物城·石村湖', 'zh-tw': '樂天世界購物城·石村湖' };
const BUSAN: L5 = { ko: '부산 롯데월드', en: 'Lotte World Busan', ja: '釜山ロッテワールド', 'zh-cn': '釜山乐天世界', 'zh-tw': '釜山樂天世界' };
const GIMPO: L5 = { ko: '김포공항', en: 'Gimpo Airport', ja: '金浦空港', 'zh-cn': '金浦机场', 'zh-tw': '金浦機場' };

const guideTitle = (n: L5): L5 => ({
  ko: `${n.ko}, 지금 갈까 말까?`,
  en: `Should you go to ${n.en} now?`,
  ja: `${n.ja}、今行くべき？`,
  'zh-cn': `${n['zh-cn']}现在该去吗？`,
  'zh-tw': `${n['zh-tw']}現在該去嗎？`,
});

const LIVE_GUIDE: Record<Lang, string[]> = {
  ko: ['점수 40 미만(여유): 지금 가기 좋아요.', '40~69(보통): 가도 괜찮지만, 아래 시간대 그래프에서 더 한산한 시간을 확인해 보세요.', '70 이상(붐빔): 가능하면 한산한 시간으로 옮기고, 어렵다면 근처 장소를 먼저 들르세요.'],
  en: ['Under 40 (relaxed): a good time to go.', '40-69 (moderate): fine to go, but check the hourly chart below for a quieter time.', '70 or more (crowded): move to a quieter hour if you can, or visit somewhere nearby first.'],
  ja: ['40未満（空いている）：今が行きどきです。', '40〜69（普通）：行っても大丈夫ですが、下の時間帯グラフでより空いている時間を確認しましょう。', '70以上（混雑）：できれば空いている時間にずらすか、先に近くの場所へ。'],
  'zh-cn': ['低于40（宽松）：现在去很合适。', '40至69（一般）：可以去，但建议看下方时段图，找人更少的时间。', '70及以上（拥挤）：尽量改到人少的时段，或先去附近的地方。'],
  'zh-tw': ['低於40（寬鬆）：現在去很合適。', '40至69（普通）：可以去，但建議看下方時段圖，找人更少的時間。', '70以上（擁擠）：盡量改到人少的時段，或先去附近的地方。'],
};

const FORECAST_GUIDE: Record<Lang, string[]> = {
  ko: ['오늘 점수가 70 미만이면 비교적 여유로운 날이에요.', '70 이상이면 아래 30일 그래프에서 점수가 낮은 날로 옮기는 걸 추천해요.', '예측값이라 날씨나 행사에 따라 달라질 수 있어요.'],
  en: ["If today's score is under 70, it should be a fairly relaxed day.", 'At 70 or more, try a lower-scoring day on the 30-day chart below.', 'This is a forecast, so weather and events can change it.'],
  ja: ['今日のスコアが70未満なら、比較的ゆったりした日です。', '70以上なら、下の30日グラフでスコアの低い日にずらすのがおすすめです。', '予測値のため、天気やイベントで変わることがあります。'],
  'zh-cn': ['今天分数低于70，通常是比较宽松的一天。', '70及以上时，建议在下方30天图表中改选分数较低的日子。', '这是预测值，可能因天气或活动而变化。'],
  'zh-tw': ['今天分數低於70，通常是比較寬鬆的一天。', '70以上時，建議在下方30天圖表中改選分數較低的日子。', '這是預測值，可能因天氣或活動而變化。'],
};

const howLive = (n: L5): Record<Lang, Faq> => ({
  ko: { q: `${n.ko} 실시간 혼잡도는 어떻게 확인하나요?`, a: '이 페이지 맨 위 점수를 보면 돼요. 서울시 실시간 인구 데이터를 바탕으로 약 5분 단위로 바뀌어요.' },
  en: { q: `How do I check the live crowd level at ${n.en}?`, a: 'Look at the score at the top of this page. It comes from Seoul real-time population data and changes about every 5 minutes.' },
  ja: { q: `${n.ja}の混雑状況をリアルタイムで確認するには？`, a: 'このページ上部のスコアをご覧ください。ソウル市のリアルタイム人口データをもとに、約5分単位で更新されます。' },
  'zh-cn': { q: `如何查看${n['zh-cn']}的实时拥挤度？`, a: '请看本页顶部的分数。它基于首尔市实时人口数据，大约每5分钟变化一次。' },
  'zh-tw': { q: `如何查看${n['zh-tw']}的即時擁擠度？`, a: '請看本頁頂部的分數。它根據首爾市即時人口資料，大約每5分鐘變化一次。' },
});

const headCount = (n: L5): Record<Lang, Faq> => ({
  ko: { q: `지금 ${n.ko}에 있는 정확한 사람 수도 알 수 있나요?`, a: '아니요. 입장객 수가 아니라 주변 지역 인구 데이터를 바탕으로 한 혼잡도 점수예요. 붐비는 정도를 가늠하는 용도로 봐 주세요.' },
  en: { q: `Can I see the exact number of people at ${n.en}?`, a: 'No. This is a crowd score based on population data for the surrounding area, not a visitor count. Use it as a guide to how busy it is.' },
  ja: { q: `${n.ja}にいる正確な人数は分かりますか？`, a: 'いいえ。入場者数ではなく、周辺エリアの人口データにもとづく混雑スコアです。混み具合の目安としてご覧ください。' },
  'zh-cn': { q: `能查到${n['zh-cn']}的准确人数吗？`, a: '不能。这是基于周边区域人口数据的拥挤度分数，不是入场人数。请作为判断拥挤程度的参考。' },
  'zh-tw': { q: `能查到${n['zh-tw']}的準確人數嗎？`, a: '不能。這是根據周邊區域人口資料的擁擠度分數，不是入場人數。請作為判斷擁擠程度的參考。' },
});

const merge = (...items: Record<Lang, Faq>[]): Record<Lang, Faq[]> => ({
  ko: items.map((i) => i.ko),
  en: items.map((i) => i.en),
  ja: items.map((i) => i.ja),
  'zh-cn': items.map((i) => i['zh-cn']),
  'zh-tw': items.map((i) => i['zh-tw']),
});

const LOTTE_SLUGS = ['lotte-world-theme-park-magic-island', 'jamsil-lotte-world-mall-seokchon-lake', 'lotte-world-adventure-busan'];
const others = (slug: string) => LOTTE_SLUGS.filter((s) => s !== slug);

export const SPOT_SEO: Record<string, SpotSeo> = {
  'lotte-world-theme-park-magic-island': {
    title: {
      ko: '롯데월드 실시간 혼잡도 · 오늘 사람 많을까? 한산한 시간',
      en: 'Lotte World Seoul Crowds Today: Live Crowd Level & Best Time',
      ja: 'ロッテワールド 混雑状況リアルタイム・待ち時間の目安と空いている時間',
      'zh-cn': '乐天世界现在人多吗？实时拥挤度·排队时间参考',
      'zh-tw': '樂天世界現在人多嗎？即時擁擠度·排隊時間參考',
    },
    description: {
      ko: '롯데월드 지금 사람 많을까? 현재 {status}({score}/100). 서울시 실시간 데이터로 본 혼잡도와 평일·주말 한산한 시간을 확인하세요.',
      en: 'Is Lotte World busy right now? Currently {status} ({score}/100). Check the live crowd level from Seoul data and the quietest hours on weekdays and weekends.',
      ja: 'ロッテワールドは今混んでいる？現在{status}（{score}/100）。ソウル市のリアルタイムデータで混雑状況と、平日・週末の空いている時間をチェック。',
      'zh-cn': '乐天世界现在人多吗？当前{status}（{score}/100）。查看首尔市实时数据显示的拥挤度，以及平日和周末人少的时段。',
      'zh-tw': '樂天世界現在人多嗎？目前{status}（{score}/100）。查看首爾市即時資料顯示的擁擠度，以及平日和週末人少的時段。',
    },
    guideTitle: guideTitle(LOTTE),
    guide: LIVE_GUIDE,
    faqs: merge(howLive(LOTTE), {
      ko: { q: '롯데월드 대기시간도 알 수 있나요?', a: '이 페이지의 대기 시간은 혼잡도로 계산한 예상치예요. 놀이기구별 실제 대기시간은 롯데월드 공식 안내에서 확인하세요.' },
      en: { q: 'Can I see ride wait times for Lotte World?', a: 'The wait shown here is an estimate calculated from the crowd level. Check official Lotte World information for actual ride wait times.' },
      ja: { q: 'ロッテワールドの待ち時間は分かりますか？', a: 'このページの待ち時間は混雑度から計算した目安です。アトラクションごとの実際の待ち時間はロッテワールドの公式案内でご確認ください。' },
      'zh-cn': { q: '能查到乐天世界的排队时间吗？', a: '本页显示的等待时间是根据拥挤度计算的估算值。各游乐设施的实际排队时间请查看乐天世界官方信息。' },
      'zh-tw': { q: '能查到樂天世界的排隊時間嗎？', a: '本頁顯示的等待時間是根據擁擠度計算的估算值。各遊樂設施的實際排隊時間請查看樂天世界官方資訊。' },
    }, headCount(LOTTE)),
    related: others('lotte-world-theme-park-magic-island'),
  },
  'jamsil-lotte-world-mall-seokchon-lake': {
    title: {
      ko: '롯데월드몰·석촌호수 실시간 혼잡도 · 지금 사람 많을까?',
      en: 'Lotte World Mall & Seokchon Lake Crowds: Live Level & Best Time',
      ja: 'ロッテワールドモール・石村湖 混雑状況リアルタイム・空いている時間',
      'zh-cn': '乐天世界购物城·石村湖现在人多吗？实时拥挤度',
      'zh-tw': '樂天世界購物城·石村湖現在人多嗎？即時擁擠度',
    },
    description: {
      ko: '롯데월드몰·석촌호수 지금 사람 많을까? 현재 {status}({score}/100). 실시간 혼잡도와 평일·주말 한산한 시간을 확인하세요.',
      en: 'Is Lotte World Mall busy right now? Currently {status} ({score}/100). Check the live crowd level and the quietest hours on weekdays and weekends.',
      ja: 'ロッテワールドモール・石村湖は今混んでいる？現在{status}（{score}/100）。リアルタイムの混雑状況と平日・週末の空いている時間をチェック。',
      'zh-cn': '乐天世界购物城·石村湖现在人多吗？当前{status}（{score}/100）。查看实时拥挤度及平日和周末人少的时段。',
      'zh-tw': '樂天世界購物城·石村湖現在人多嗎？目前{status}（{score}/100）。查看即時擁擠度及平日和週末人少的時段。',
    },
    guideTitle: guideTitle(MALL),
    guide: LIVE_GUIDE,
    faqs: merge(howLive(MALL), headCount(MALL)),
    related: others('jamsil-lotte-world-mall-seokchon-lake'),
  },
  'lotte-world-adventure-busan': {
    title: {
      ko: '부산 롯데월드 혼잡도 · 오늘 사람 많을까? 30일 예측과 한산한 날',
      en: 'Lotte World Busan Crowds: Today’s Forecast & Quietest Days',
      ja: '釜山ロッテワールド 混雑予想・今日の混雑状況と空いている日',
      'zh-cn': '釜山乐天世界今天人多吗？拥挤度预测·人少的日子',
      'zh-tw': '釜山樂天世界今天人多嗎？擁擠度預測·人少的日子',
    },
    description: {
      ko: '부산 롯데월드 오늘 사람 많을까? 오늘 예측 {status}({score}/100). 한국관광공사 데이터로 본 30일 혼잡 예측과 가장 한산한 날을 확인하세요.',
      en: "Will Lotte World Busan be busy? Today's forecast: {status} ({score}/100). See the 30-day crowd forecast from Korea Tourism Organization data and the quietest days.",
      ja: '釜山ロッテワールドは今日混む？今日の予測は{status}（{score}/100）。韓国観光公社データによる30日間の混雑予想と空いている日をチェック。',
      'zh-cn': '釜山乐天世界今天人多吗？今日预测{status}（{score}/100）。查看基于韩国观光公社数据的30天拥挤预测和人最少的日子。',
      'zh-tw': '釜山樂天世界今天人多嗎？今日預測{status}（{score}/100）。查看根據韓國觀光公社資料的30天擁擠預測和人最少的日子。',
    },
    guideTitle: guideTitle(BUSAN),
    guide: FORECAST_GUIDE,
    faqs: merge({
      ko: { q: '부산 롯데월드 실시간 대기시간도 알 수 있나요?', a: '아니요. 이 페이지는 한국관광공사 데이터로 만든 날짜별 혼잡 예측이에요. 놀이기구별 실제 대기시간은 공식 안내에서 확인하세요.' },
      en: { q: 'Can I see live wait times for Lotte World Busan?', a: 'No. This page shows a day-by-day crowd forecast from Korea Tourism Organization data. Check official information for actual ride wait times.' },
      ja: { q: '釜山ロッテワールドのリアルタイム待ち時間は分かりますか？', a: 'いいえ。このページは韓国観光公社のデータによる日別の混雑予想です。実際の待ち時間は公式案内でご確認ください。' },
      'zh-cn': { q: '能查到釜山乐天世界的实时排队时间吗？', a: '不能。本页是基于韩国观光公社数据的每日拥挤预测。实际排队时间请查看官方信息。' },
      'zh-tw': { q: '能查到釜山樂天世界的即時排隊時間嗎？', a: '不能。本頁是根據韓國觀光公社資料的每日擁擠預測。實際排隊時間請查看官方資訊。' },
    }),
    related: others('lotte-world-adventure-busan'),
  },
  'gimpo-airport': {
    title: {
      ko: '김포공항 혼잡도 · 지금 사람 많을까? 붐비는 시간과 한산한 시간',
      en: 'Gimpo Airport Crowds Now: Live Level, Busy Hours & Quiet Hours',
      ja: '金浦空港 混雑状況リアルタイム・混む時間帯と空いている時間',
      'zh-cn': '金浦机场现在人多吗？实时拥挤度·高峰与人少时段',
      'zh-tw': '金浦機場現在人多嗎？即時擁擠度·尖峰與人少時段',
    },
    description: {
      ko: '김포공항 지금 사람 많을까? 현재 {status}({score}/100). 서울시 실시간 데이터로 본 혼잡도와 붐비는 시간, 한산한 시간을 확인하세요.',
      en: 'Is Gimpo Airport busy right now? Currently {status} ({score}/100). Check the live crowd level from Seoul data, plus its busy and quiet hours.',
      ja: '金浦空港は今混んでいる？現在{status}（{score}/100）。ソウル市のリアルタイムデータで混雑状況と、混む時間帯・空いている時間をチェック。',
      'zh-cn': '金浦机场现在人多吗？当前{status}（{score}/100）。查看首尔市实时数据显示的拥挤度，以及高峰和人少的时段。',
      'zh-tw': '金浦機場現在人多嗎？目前{status}（{score}/100）。查看首爾市即時資料顯示的擁擠度，以及尖峰和人少的時段。',
    },
    guideTitle: {
      ko: '김포공항, 지금 얼마나 붐빌까?',
      en: 'How busy is Gimpo Airport now?',
      ja: '金浦空港、今どれくらい混んでいる？',
      'zh-cn': '金浦机场现在有多拥挤？',
      'zh-tw': '金浦機場現在有多擁擠？',
    },
    guide: {
      ko: ['점수는 공항과 주변 지역의 전체 혼잡도예요. 공항 안 쇼핑몰 방문객도 함께 반영될 수 있어요.', '70 이상(붐빔)이면 공항까지 가는 시간과 수속 시간을 넉넉히 잡으세요.', '탑승 수속과 보안검색 시간은 항공사와 공항 공식 안내를 따르세요.'],
      en: ['The score is the overall crowd level for the airport and its surrounding area. Shoppers at the connected mall may be included.', 'At 70 or more (crowded), allow extra time to reach the airport and check in.', 'For check-in and security times, follow your airline and the official airport information.'],
      ja: ['スコアは空港と周辺エリア全体の混雑度です。併設モールの来店客も含まれる場合があります。', '70以上（混雑）なら、空港までの移動と手続きの時間に余裕を持ちましょう。', '搭乗手続きと保安検査の時間は、航空会社と空港の公式案内に従ってください。'],
      'zh-cn': ['分数是机场及周边区域的整体拥挤度，可能包含相连商场的顾客。', '70及以上（拥挤）时，请为前往机场和办理手续预留更多时间。', '值机和安检时间请以航空公司和机场官方信息为准。'],
      'zh-tw': ['分數是機場及周邊區域的整體擁擠度，可能包含相連商場的顧客。', '70以上（擁擠）時，請為前往機場和辦理手續預留更多時間。', '報到和安檢時間請以航空公司和機場官方資訊為準。'],
    },
    faqs: merge(howLive(GIMPO), {
      ko: { q: '김포공항 보안검색 대기시간도 알 수 있나요?', a: '아니요. 공항 지역 전체의 혼잡도 점수라서 보안검색이나 출국장 대기시간과는 달라요. 해당 시간은 공항 공식 안내에서 확인하세요.' },
      en: { q: 'Does this show the security wait at Gimpo Airport?', a: 'No. This is a crowd score for the whole airport area, which is different from security or departure hall waits. Check official airport information for those.' },
      ja: { q: '金浦空港の保安検査の待ち時間は分かりますか？', a: 'いいえ。空港エリア全体の混雑スコアのため、保安検査や出発ロビーの待ち時間とは異なります。空港の公式案内でご確認ください。' },
      'zh-cn': { q: '能查到金浦机场的安检等待时间吗？', a: '不能。这是整个机场区域的拥挤度分数，与安检或出境大厅的等待时间不同。请查看机场官方信息。' },
      'zh-tw': { q: '能查到金浦機場的安檢等候時間嗎？', a: '不能。這是整個機場區域的擁擠度分數，與安檢或出境大廳的等候時間不同。請查看機場官方資訊。' },
    }),
    related: [],
  },
};

export const SPOT_SEO_RELATED_TITLE: L5 = {
  ko: '같이 확인해 보세요',
  en: 'Also check',
  ja: 'あわせてチェック',
  'zh-cn': '也可以看看',
  'zh-tw': '也可以看看',
};
