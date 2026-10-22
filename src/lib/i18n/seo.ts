import { Lang } from '@/types';

interface SeoCopy {
  title: string;
  description: string;
  keywords: string[];
  ogLocale: string;
  ogAlt: string;
  playTitle: string;
  playDescription: string;
}

export const SEO: Record<Lang, SeoCopy> = {
  ko: {
    title: 'Check East Point | 서울 주요 관광지 실시간 혼잡도 확인',
    description:
      '경복궁, 명동, 홍대, 성수 등 서울 주요 관광지와 핫플레이스의 실시간 혼잡도를 확인하세요. 쾌적한 서울 여행과 나들이 일정을 위한 실시간 가이드 서비스.',
    keywords: [
      '서울 실시간 혼잡도',
      '서울 관광지 혼잡도',
      '서울 여행 혼잡도',
      '경복궁 혼잡도',
      '성수동 혼잡도',
      '홍대 혼잡도',
      '명동 혼잡도',
      'Check East Point',
      '체크이스트포인트',
    ],
    ogLocale: 'ko_KR',
    ogAlt: 'Check East Point - 서울 주요 관광지 실시간 혼잡도 확인',
    playTitle: '플레이 - 여행 성향 테스트',
    playDescription: '서울 여행 스타일을 알아보는 재미있는 성향 테스트와 실시간 혼잡도 가이드.',
  },
  en: {
    title: 'Check East Point | Live Crowd Levels at Seoul Attractions',
    description:
      'See real-time crowd levels, wait times and quiet alternatives for 130+ Seoul places — Gyeongbokgung, Myeongdong, Hongdae, Seongsu and more. Plan a calmer trip to Seoul.',
    keywords: [
      'Seoul crowd levels',
      'Seoul live crowd',
      'Seoul tourist attractions busy',
      'Gyeongbokgung crowd',
      'Myeongdong crowd',
      'Hongdae crowd',
      'Seoul travel guide',
      'Korea travel tips',
      'Check East Point',
    ],
    ogLocale: 'en_US',
    ogAlt: 'Check East Point - Live crowd levels at Seoul attractions',
    playTitle: 'Play - Travel Personality Tests',
    playDescription: 'Fun travel personality tests for your Seoul trip, plus live crowd levels at top attractions.',
  },
  ja: {
    title: 'Check East Point | ソウル観光地のリアルタイム混雑度',
    description:
      '景福宮・明洞・弘大・聖水などソウルの130か所以上のリアルタイム混雑度、待ち時間、空いている穴場スポットを確認。快適なソウル旅行のためのリアルタイムガイド。',
    keywords: [
      'ソウル 混雑',
      'ソウル 観光地 混雑状況',
      'ソウル旅行',
      '景福宮 混雑',
      '明洞 混雑',
      '弘大 混雑',
      '韓国旅行 穴場',
      'Check East Point',
    ],
    ogLocale: 'ja_JP',
    ogAlt: 'Check East Point - ソウル観光地のリアルタイム混雑度',
    playTitle: 'プレイ - 旅行タイプ診断',
    playDescription: 'ソウル旅行のスタイルがわかる診断テストと、人気スポットのリアルタイム混雑度ガイド。',
  },
  'zh-cn': {
    title: 'Check East Point | 首尔景点实时拥挤度',
    description: '一眼查看景福宫、明洞、弘大、圣水等首尔130多处景点的实时拥挤度、排队时间和人少的替代去处，轻松规划首尔旅行。',
    keywords: ['首尔 拥挤度', '首尔 实时人流', '首尔旅游', '景福宫 人多吗', '明洞 拥挤', '弘大 人流', '韩国旅游 攻略', 'Check East Point'],
    ogLocale: 'zh_CN',
    ogAlt: 'Check East Point - 首尔景点实时拥挤度',
    playTitle: '趣味测试 - 旅行性格测试',
    playDescription: '测测你的首尔旅行风格，同时查看热门景点实时拥挤度。',
  },
  'zh-tw': {
    title: 'Check East Point | 首爾景點即時擁擠度',
    description: '一次掌握景福宮、明洞、弘大、聖水等首爾130多處景點的即時擁擠度、排隊時間與人少的替代去處，輕鬆規劃首爾旅行。',
    keywords: ['首爾 擁擠度', '首爾 即時人潮', '首爾旅遊', '景福宮 人多嗎', '明洞 擁擠', '弘大 人潮', '韓國旅遊 攻略', 'Check East Point'],
    ogLocale: 'zh_TW',
    ogAlt: 'Check East Point - 首爾景點即時擁擠度',
    playTitle: '趣味測驗 - 旅行性格測驗',
    playDescription: '測測你的首爾旅行風格，同時查看熱門景點即時擁擠度。',
  },
};
