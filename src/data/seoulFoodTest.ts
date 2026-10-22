import { Lang, LocalizedString } from '@/types';
import { pick } from '@/lib/i18n/routing';

export const TEST_PATH = '/play/seoul-food-test';

export type AreaId = 'hongdae' | 'gangnam' | 'jongno' | 'seongsu';
export type FoodTypeId = 'spicy' | 'soup' | 'noodle' | 'meat' | 'dumpling' | 'chicken';

export const AREA_IDS: AreaId[] = ['hongdae', 'gangnam', 'jongno', 'seongsu'];
export const FOOD_TYPE_IDS: FoodTypeId[] = ['spicy', 'soup', 'noodle', 'meat', 'dumpling', 'chicken'];

export function isAreaId(v: string | null | undefined): v is AreaId {
  return AREA_IDS.includes(v as AreaId);
}
export function isFoodTypeId(v: string | null | undefined): v is FoodTypeId {
  return FOOD_TYPE_IDS.includes(v as FoodTypeId);
}

const L = (ko: string, en: string, ja: string): LocalizedString => ({ ko, en, ja });

export const AREAS: Record<AreaId, { emoji: string; name: LocalizedString; desc: LocalizedString; mapKeyword: string; center: [number, number] }> = {
  hongdae: {
    emoji: '🎸',
    name: L('홍대·합정·연남', 'Hongdae · Hapjeong', '弘大・合井・延南'),
    desc: L('버스킹과 골목 맛집', 'Buskers and alley eateries', 'ストリートライブと路地裏グルメ'),
    mapKeyword: '홍대',
    center: [37.5563, 126.9236],
  },
  gangnam: {
    emoji: '🏙️',
    name: L('강남·신사·압구정', 'Gangnam · Sinsa', '江南・新沙・狎鴎亭'),
    desc: L('세련된 거리의 오래된 맛집', 'Old favourites on chic streets', 'おしゃれな街の老舗'),
    mapKeyword: '강남 신사',
    center: [37.5172, 127.0286],
  },
  jongno: {
    emoji: '🏯',
    name: L('종로·을지로', 'Jongno · Euljiro', '鍾路・乙支路'),
    desc: L('노포와 시장의 맛', 'Heritage eateries and markets', '老舗と市場の味'),
    mapKeyword: '종로 을지로',
    center: [37.5687, 126.9910],
  },
  seongsu: {
    emoji: '🏭',
    name: L('성수·건대', 'Seongsu · Konkuk Univ.', '聖水・建大'),
    desc: L('공장 골목 핫플', 'Hip spots in old factory lanes', '倉庫街のホットスポット'),
    mapKeyword: '성수',
    center: [37.5446, 127.0557],
  },
};

export interface FoodType {
  emoji: string;
  /** Result name, shown as "오늘은 <title>". */
  title: LocalizedString;
  menu: LocalizedString;
  /** Search keyword used for "more on the map". */
  mapKeyword: string;
  desc: LocalizedString;
  traits: [LocalizedString, LocalizedString, LocalizedString];
  gradient: string;
}

export const FOOD_TYPES: Record<FoodTypeId, FoodType> = {
  spicy: {
    emoji: '🌶️',
    title: L('화끈한 열정의 추억가', 'a fiery, nostalgic dreamer', '情熱あふれる思い出メーカー'),
    menu: L('떡볶이', 'Tteokbokki', 'トッポッキ'),
    mapKeyword: '떡볶이',
    desc: L(
      '매운 맛에 스트레스를 날리고, 분식집 추억에 웃음 짓는 당신. 오늘은 땀 쫙 빼는 빨간 떡볶이가 정답이에요.',
      'You beat stress with spice and smile at snack-bar memories. Today the answer is a fiery bowl of tteokbokki.',
      '辛さでストレスを吹き飛ばし、粉食店の思い出に笑顔になるあなた。今日は汗をかく真っ赤なトッポッキが正解！'
    ),
    traits: [L('#매운맛중독', '#SpiceAddict', '#辛さ中毒'), L('#추억소환', '#Nostalgia', '#思い出'), L('#에너자이저', '#Energizer', '#エネルギッシュ')],
    gradient: 'from-rose-500 via-red-500 to-orange-500',
  },
  soup: {
    emoji: '🍲',
    title: L('든든한 의리의 해결사', 'a loyal, dependable fixer', '頼れる義理堅い解決人'),
    menu: L('국밥·곰탕', 'Gukbap · Gomtang (rice soup)', 'クッパ・コムタン'),
    mapKeyword: '국밥 곰탕',
    desc: L(
      '말보다 행동, 친구가 힘들면 제일 먼저 달려가는 당신. 뜨끈한 국물 한 그릇으로 오늘을 든든하게 채우세요.',
      'Actions over words: you are first to show up when a friend needs you. Fill up today with a hot bowl of soup.',
      '口より行動、友だちが困ったら一番に駆けつけるあなた。熱々のスープ一杯で今日をしっかりチャージ。'
    ),
    traits: [L('#의리파', '#Loyal', '#義理堅い'), L('#국물파', '#SoupLover', '#スープ派'), L('#든든함', '#Reliable', '#頼もしい')],
    gradient: 'from-amber-600 via-orange-600 to-yellow-600',
  },
  noodle: {
    emoji: '🍜',
    title: L('슴슴한 매력의 고수', 'a subtle, refined connoisseur', '素朴な魅力の達人'),
    menu: L('냉면·국수', 'Naengmyeon · Noodles', '冷麺・麺料理'),
    mapKeyword: '냉면 국수',
    desc: L(
      '유행보다 내 취향, 은근한 맛을 아는 진짜 고수. 오늘은 깔끔한 면 한 그릇으로 나만의 시간을 즐겨 보세요.',
      'Your own taste beats any trend; you appreciate quiet flavours. Enjoy some me-time over a clean bowl of noodles.',
      '流行より自分の好み、さりげない味がわかる本物の達人。今日はすっきり麺で自分の時間を楽しんで。'
    ),
    traits: [L('#취향확실', '#KnowsWhatTheyLike', '#こだわり派'), L('#노포러버', '#OldSchool', '#老舗好き'), L('#담백함', '#Subtle', '#あっさり')],
    gradient: 'from-sky-500 via-cyan-500 to-teal-500',
  },
  meat: {
    emoji: '🥩',
    title: L('지글지글 불꽃 리더', 'a sizzling, fired-up leader', 'ジュージュー燃えるリーダー'),
    menu: L('고기구이·불고기', 'Korean BBQ · Bulgogi', '焼肉・プルコギ'),
    mapKeyword: '고기 맛집',
    desc: L(
      '모임이 있으면 자연스럽게 집게를 드는 당신. 오늘은 지글지글 고기 굽는 소리와 함께 사람들을 이끌어 보세요.',
      'At any gathering you naturally pick up the tongs. Lead the table today to the sound of sizzling meat.',
      '集まりがあれば自然とトングを持つあなた。今日はジュージュー焼ける音とともにみんなを引っ張って。'
    ),
    traits: [L('#집게담당', '#GrillMaster', '#トング担当'), L('#리더십', '#Leader', '#リーダー'), L('#에너지폭발', '#HighEnergy', '#元気爆発')],
    gradient: 'from-red-600 via-rose-600 to-pink-600',
  },
  dumpling: {
    emoji: '🥟',
    title: L('포근한 다정함의 힐러', 'a warm, gentle healer', 'ほっこり優しいヒーラー'),
    menu: L('만두·칼국수', 'Mandu · Kalguksu', '餃子・カルグクス'),
    mapKeyword: '만두 칼국수',
    desc: L(
      '곁에 있으면 마음이 편해지는 사람. 오늘은 손으로 빚은 만두와 따뜻한 칼국수로 나를 다독여 주세요.',
      'People relax just being around you. Treat yourself today to hand-made dumplings and warm knife-cut noodles.',
      'そばにいると心が落ち着く人。今日は手作り餃子と温かいカルグクスで自分を癒して。'
    ),
    traits: [L('#다정함', '#Kind', '#優しさ'), L('#힐링', '#Healing', '#癒し'), L('#집순이집돌이', '#Homebody', '#おうち派')],
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
  },
  chicken: {
    emoji: '🍗',
    title: L('톡톡 튀는 파티피플', 'a bubbly party person', 'はじけるパーティーピープル'),
    menu: L('치킨·호프', 'Fried Chicken & Beer', 'チキン＆ビール'),
    mapKeyword: '치킨 호프',
    desc: L(
      '어디서든 분위기 메이커! 오늘 저녁은 바삭한 치킨에 시원한 맥주 한 잔, 사람들과 웃고 떠들어요.',
      'The life of every party! Tonight is crispy chicken, a cold beer and lots of laughs with friends.',
      'どこでもムードメーカー！今夜はサクサクチキンと冷たいビールで、みんなとワイワイ。'
    ),
    traits: [L('#분위기메이커', '#LifeOfTheParty', '#ムードメーカー'), L('#치맥', '#Chimaek', '#チメク'), L('#인싸', '#Social', '#陽キャ')],
    gradient: 'from-yellow-500 via-amber-500 to-orange-500',
  },
};

export interface Question {
  q: LocalizedString;
  options: { text: LocalizedString; types: FoodTypeId[] }[];
}

export const QUESTIONS: Question[] = [
  {
    q: L('오늘 아침 눈을 떴을 때 기분은?', 'How did you feel when you woke up today?', '今朝起きたときの気分は？'),
    options: [
      { text: L('뭔가 짜릿한 일이 생길 것 같다 ⚡', 'Something exciting is about to happen ⚡', '何かワクワクすることが起きそう ⚡'), types: ['spicy', 'chicken'] },
      { text: L('조용히 나만의 시간을 갖고 싶다 🌿', 'I want some quiet time alone 🌿', '静かに自分の時間を過ごしたい 🌿'), types: ['noodle', 'dumpling'] },
      { text: L('할 일 많다, 일단 든든하게! 💪', 'Busy day, need to fuel up first! 💪', 'やることが多い、まずはしっかり食べる！💪'), types: ['soup', 'meat'] },
    ],
  },
  {
    q: L('친구가 갑자기 "지금 나와!" 하면?', 'A friend texts: "Come out now!" You…', '友だちから急に「今から出てきて！」と言われたら？'),
    options: [
      { text: L('바로 출발, 어디든 간다', 'Leave immediately, anywhere is fine', 'すぐ出発、どこでも行く'), types: ['chicken', 'meat'] },
      { text: L('어디서 뭐 하는지부터 묻는다', 'Ask where and what first', 'まずどこで何をするか聞く'), types: ['noodle', 'soup'] },
      { text: L('귀찮지만… 결국 나간다', "It's a hassle… but I go anyway", '面倒だけど…結局行く'), types: ['dumpling', 'spicy'] },
    ],
  },
  {
    q: L('스트레스가 쌓였을 때 나는?', 'When stress piles up, you…', 'ストレスがたまったときは？'),
    options: [
      { text: L('엄청 매운 거 먹고 땀 쫙 빼기 🔥', 'Eat something super spicy and sweat it out 🔥', '激辛を食べて汗をかく 🔥'), types: ['spicy'] },
      { text: L('사람들 만나서 실컷 떠들기 🗣️', 'See people and talk it all out 🗣️', '人に会っておしゃべりしまくる 🗣️'), types: ['chicken', 'meat'] },
      { text: L('따뜻한 국물에 조용히 혼밥 🍚', 'A quiet solo meal with warm soup 🍚', '温かいスープで静かにひとりご飯 🍚'), types: ['soup', 'dumpling'] },
    ],
  },
  {
    q: L('가장 좋아하는 날씨는?', 'Your favourite weather?', '一番好きな天気は？'),
    options: [
      { text: L('쨍쨍한 한여름 ☀️', 'Blazing summer sun ☀️', 'カンカン照りの真夏 ☀️'), types: ['noodle', 'chicken'] },
      { text: L('창밖에 비 오는 날 🌧️', 'Rain outside the window 🌧️', '窓の外は雨 🌧️'), types: ['dumpling', 'soup'] },
      { text: L('쌀쌀한 겨울 저녁 ❄️', 'A chilly winter evening ❄️', '肌寒い冬の夜 ❄️'), types: ['spicy', 'meat'] },
    ],
  },
  {
    q: L('여행 가면 꼭 하는 것은?', 'On a trip, you always…', '旅行で必ずすることは？'),
    options: [
      { text: L('현지인만 아는 노포 찾아가기', 'Hunt down old local favourites', '地元の人だけが知る老舗を探す'), types: ['noodle', 'soup'] },
      { text: L('요즘 핫플 인증샷 남기기 📸', 'Snap photos at the trendiest spots 📸', '話題のスポットで映え写真 📸'), types: ['spicy', 'chicken'] },
      { text: L('맛집 한 곳에서 오래 먹고 마시기', 'Settle into one great place for hours', '一軒の名店でじっくり飲み食い'), types: ['meat', 'dumpling'] },
    ],
  },
  {
    q: L('나를 한 단어로 표현한다면?', 'Describe yourself in one word', '自分を一言で表すなら？'),
    options: [
      { text: L('열정 🔥', 'Passion 🔥', '情熱 🔥'), types: ['spicy', 'meat'] },
      { text: L('의리 🤝', 'Loyalty 🤝', '義理 🤝'), types: ['soup', 'chicken'] },
      { text: L('감성 🌙', 'Sensitivity 🌙', '感性 🌙'), types: ['noodle', 'dumpling'] },
    ],
  },
];

/** Picks the type with the most points; ties go to the type chosen most recently. */
export function scoreAnswers(answers: number[]): FoodTypeId {
  const score: Record<FoodTypeId, number> = { spicy: 0, soup: 0, noodle: 0, meat: 0, dumpling: 0, chicken: 0 };
  const lastSeen: Record<FoodTypeId, number> = { spicy: -1, soup: -1, noodle: -1, meat: -1, dumpling: -1, chicken: -1 };
  answers.forEach((optionIndex, qi) => {
    QUESTIONS[qi].options[optionIndex]?.types.forEach((type) => {
      score[type] += 1;
      lastSeen[type] = qi;
    });
  });
  return FOOD_TYPE_IDS.reduce((best, type) =>
    score[type] > score[best] || (score[type] === score[best] && lastSeen[type] > lastSeen[best]) ? type : best
  );
}

export interface Restaurant {
  name: { ko: string; en: string };
  address: string;
  note: LocalizedString;
  /** Michelin Guide Seoul Bib Gourmand recognition. */
  bib?: string;
}

const R = (ko: string, en: string, address: string, note: LocalizedString, bib?: string): Restaurant => ({
  name: { ko, en },
  address,
  note,
  bib,
});

// Curated, verified real restaurants (Michelin Bib Gourmand 2026 first, then long-running local favourites).
// Ratings and hours change, so the UI links to live map listings rather than showing scores.
export const RESTAURANTS: Record<FoodTypeId, Record<AreaId, Restaurant[]>> = {
  spicy: {
    hongdae: [
      R('또보겠지 떡볶이', 'Ttobogetji Tteokbokki', '마포구 와우산로21길',
        L('깻잎 듬뿍 즉석떡볶이, 마무리는 날치알 볶음밥', 'Pot-style tteokbokki loaded with perilla leaves; finish with flying-fish-roe fried rice', 'エゴマの葉たっぷりの即席トッポッキ、締めはトビコ炒飯')),
    ],
    gangnam: [
      R('다모아분식', 'Damoa Bunsik', '강남구 논현로150길 41',
        L('1993년부터 한자리, 멸치육수 떡볶이', 'Same spot since 1993; anchovy-broth tteokbokki', '1993年から同じ場所、煮干し出汁のトッポッキ')),
      R('루비떡볶이', 'Ruby Tteokbokki', '강남구 선릉로153길 21',
        L('새우튀김 얹은 떡볶이와 소시지김밥', 'Tteokbokki topped with fried shrimp, plus sausage gimbap', 'エビ天のせトッポッキとソーセージキンパ')),
    ],
    jongno: [
      R('원조 정할머니 기름떡볶이', 'Jeong Halmeoni Oil Tteokbokki', '종로구 자하문로15길 18 (통인시장)',
        L('통인시장 명물 기름떡볶이, 간장·고추장 두 가지 맛', 'Tongin Market’s famous pan-fried tteokbokki in soy or chili flavour', '通仁市場名物の油トッポッキ、醤油味とコチュジャン味')),
    ],
    seongsu: [
      R('오빠네 옛날떡볶이 성수점', 'Oppane Old-style Tteokbokki Seongsu', '성동구 연무장7가길 9',
        L('테이블에서 끓여 먹는 가성비 즉석떡볶이', 'Budget-friendly tteokbokki cooked at your table', 'テーブルで煮込むコスパ抜群の即席トッポッキ')),
    ],
  },
  soup: {
    hongdae: [
      R('옥동식', 'Okdongsik', '마포구 양화로7길 44-10',
        L('맑고 깔끔한 돼지곰탕', 'Clear, clean pork-bone soup', '澄んだスープの豚コムタン'), '2026'),
      R('합정옥', 'Hapjeongok', '마포구 합정동',
        L('정갈한 소고기 곰탕', 'Neat, rich beef gomtang', '丁寧に仕上げた牛コムタン'), '2026'),
    ],
    gangnam: [
      R('곰탕랩', 'Gomtang Lab', '강남구 도산대로 153',
        L('하루 한정 콜라겐 사골곰탕', 'Limited daily collagen bone-broth gomtang', '数量限定のコラーゲン牛骨コムタン'), '2026'),
    ],
    jongno: [
      R('대성집', 'Daeseongjip', '종로구 교남동 (독립문역 인근)',
        L('뽀얀 국물의 도가니탕 노포', 'Heritage spot for milky ox-knee soup', '白濁スープのトガニタン（牛膝軟骨スープ）の老舗'), '2026'),
      R('용금옥', 'Yonggeumok', '중구 다동 (시청·광화문 인근)',
        L('서울식 추어탕 노포', 'Old-school Seoul-style loach soup', 'ソウル式ドジョウ汁の老舗'), '2026'),
    ],
    seongsu: [
      R('계월곰탕', 'Kyewol Gomtang', '성동구 성덕정3길 8',
        L('닭으로 끓인 맑은 닭곰탕', 'Clear chicken gomtang', '鶏で炊いた澄んだ鶏コムタン'), '2026'),
      R('소문난성수감자탕', 'Somunnan Seongsu Gamjatang', '성동구 연무장길 45',
        L('줄 서서 먹는 성수 감자탕, 우거지·수제비 추가 추천', 'Queue-worthy pork-bone stew; add greens and sujebi', '行列のできるカムジャタン、ウゴジとスジェビ追加がおすすめ')),
    ],
  },
  noodle: {
    hongdae: [
      R('사루카메', 'Sarukame', '마포구 연남로 15',
        L('연남동 라멘 전문점', 'Ramen specialist in Yeonnam-dong', '延南洞のラーメン専門店'), '2026'),
      R('교다이야', 'Kyodaiya', '마포구 성지길 39',
        L('쫄깃한 사누키 우동', 'Chewy Sanuki udon', 'コシのある讃岐うどん'), '2026'),
    ],
    gangnam: [
      R('진미평양냉면', 'Jinmi Pyongyang Naengmyeon', '강남구 학동로 305-3',
        L('평양냉면과 제육·만두로 유명', 'Known for Pyongyang cold noodles, boiled pork and dumplings', '平壌冷麺と茹で豚・餃子が有名')),
    ],
    jongno: [
      R('우래옥', 'Woo Lae Oak', '중구 창경궁로 (을지로4가역 인근)',
        L('서울을 대표하는 평양냉면 노포', 'One of Seoul’s defining Pyongyang naengmyeon houses', 'ソウルを代表する平壌冷麺の老舗'), '2026'),
      R('미진', 'Mijin', '종로구 종로 (광화문 인근)',
        L('메밀국수 노포', 'Heritage buckwheat-noodle house', 'そばの老舗'), '2026'),
    ],
    seongsu: [
      R('정면', 'Jeongmyeon', '광진구 능동로13길 88',
        L('셰프 혼자 운영하는 고기국수 (백면·홍면)', 'Chef-run pork noodle soup, white or red', 'シェフ一人で営む豚骨麺（白麺・紅麺）'), '2026'),
    ],
  },
  meat: {
    hongdae: [
      R('역전회관', 'Yeokjeon Hoegwan', '마포구 (공덕·마포역 인근)',
        L('바싹 구운 서울식 불고기', 'Crispy Seoul-style bulgogi', 'カリッと焼いたソウル式プルコギ'), '2026'),
    ],
    gangnam: [
      R('한일관', 'Hanilkwan', '강남구 압구정로38길 14',
        L('1939년 시작한 불고기 명가', 'Bulgogi institution founded in 1939', '1939年創業のプルコギの名店')),
    ],
    jongno: [
      R('금돼지식당', 'Geumdwaeji Sikdang', '중구 신당동 (약수역 인근)',
        L('두툼한 돼지고기 구이로 유명', 'Famous for thick-cut grilled pork', '厚切り豚焼肉で有名'), '2026'),
    ],
    seongsu: [
      R('대성갈비', 'Daeseong Galbi', '성동구 성수동',
        L('직장인 회식 성지, 돼지갈비', 'Local after-work favourite for pork galbi', '会社帰りの定番、豚カルビ')),
    ],
  },
  dumpling: {
    hongdae: [
      R('미필담', 'Mipildam', '마포구 성지3길 22',
        L('황해도식 손만둣국', 'Hwanghae-style hand-made dumpling soup', '黄海道式の手作り餃子スープ'), '2026'),
    ],
    gangnam: [
      R('뉴만두집', 'New Mandujip', '강남구 압구정동',
        L('오래 사랑받은 만둣국', 'Long-loved dumpling soup', '長く愛される餃子スープ')),
      R('한성칼국수', 'Hanseong Kalguksu', '강남구 논현동',
        L('칼국수와 만두의 전통 노포', 'Traditional spot for kalguksu and dumplings', 'カルグクスと餃子の老舗')),
    ],
    jongno: [
      R('황생가칼국수', 'Hwangsaengga Kalguksu', '종로구 북촌로5길',
        L('사골 칼국수와 왕만두', 'Beef-bone kalguksu and giant dumplings', '牛骨カルグクスと王餃子'), '2026'),
      R('자하손만두', 'Jaha Son Mandu', '종로구 부암동',
        L('부암동 언덕의 손만두 명소', 'Hand-made dumplings on Buam-dong hill', '付岩洞の丘の手作り餃子'), '2026'),
    ],
    seongsu: [
      R('밀본', 'Milbon', '성동구 성수동',
        L('한우 사골 칼국수와 군만두', 'Hanwoo bone-broth kalguksu and fried dumplings', '韓牛骨スープのカルグクスと焼き餃子'), '2018·2019'),
    ],
  },
  chicken: {
    hongdae: [
      R('야망치킨', 'Yamang Chicken', '마포구 동교로27길 21-8',
        L('바삭한 후라이드와 사워비어', 'Crispy fried chicken with sour beer', 'サクサクフライドとサワービール')),
      R('청원통닭', 'Cheongwon Tongdak', '마포구 동교로 220-5',
        L('가성비 옛날통닭과 생맥주', 'Old-school whole chicken and draft beer', '昔ながらの丸鶏揚げと生ビール')),
    ],
    gangnam: [
      R('야야호프', 'Yaya Hof', '강남구 강남대로122길 6',
        L('촉촉한 전기구이 통닭', 'Juicy rotisserie chicken', 'ジューシーな電気焼き丸鶏')),
    ],
    jongno: [
      R('계열사', 'Gyeyeolsa', '종로구 부암동 (창의문 인근)',
        L('얇고 바삭한 튀김옷의 후라이드', 'Fried chicken with a thin, crisp coating', '薄くてサクサクの衣のフライドチキン')),
    ],
    seongsu: [
      R('행운호프', 'Haengun Hof', '성수역 4번 출구 앞',
        L('옛날식 후라이드와 양배추 샐러드', 'Old-style fried chicken with cabbage salad', '昔ながらのフライドチキンとキャベツサラダ')),
    ],
  },
};

export const UI: Record<string, LocalizedString> = {
  title: L('서울 오늘의 메뉴 테스트', 'Seoul Food Mood Test', 'ソウル今日のメニュー診断'),
  subtitle: L(
    '6개 질문으로 알아보는 오늘 나의 음식 유형! 고른 동네의 진짜 맛집까지 지도로 바로 안내해 드려요.',
    'Six quick questions reveal your food mood today — then we map real restaurants in the neighbourhood you pick.',
    '6つの質問で今日のあなたの食べ物タイプを診断！選んだエリアの本物の名店まで地図でご案内。'
  ),
  chooseArea: L('오늘 어디로 갈까요?', 'Where are you heading today?', '今日はどこへ行きますか？'),
  start: L('테스트 시작', 'Start the test', '診断スタート'),
  question: L('질문', 'Question', '質問'),
  back: L('이전', 'Back', '戻る'),
  analyzing: L('당신의 오늘 메뉴를 고르는 중…', 'Picking your menu for today…', '今日のメニューを選んでいます…'),
  todayIs: L('오늘은', 'Today you are', '今日のあなたは'),
  bestMenu: L('찰떡 메뉴', 'Your perfect dish', 'ぴったりメニュー'),
  restaurantsIn: L('{area} 추천 맛집', 'Top picks in {area}', '{area}のおすすめ店'),
  otherAreas: L('다른 동네 보기', 'Other neighbourhoods', '他のエリア'),
  bib: L('미쉐린 빕구르망 {year}', 'Michelin Bib Gourmand {year}', 'ミシュラン ビブグルマン {year}'),
  moreOnMap: L('{area} {menu} 평점순으로 더 보기 →', 'More top-rated {menu} in {area} →', '{area}の{menu}を評価順にもっと見る →'),
  ratingNote: L(
    '평점·리뷰 수와 영업시간은 자주 바뀌어요. 지도 버튼에서 최신 정보를 확인하세요.',
    'Ratings, review counts and opening hours change often — check the latest on the map buttons.',
    '評価・レビュー数・営業時間は変わることがあります。地図ボタンで最新情報を確認してください。'
  ),
  share: L('결과 공유하기', 'Share my result', '結果をシェア'),
  shareText: L(
    '오늘은 {title} {emoji} 찰떡 메뉴는 {menu}! 너는 오늘 뭐 먹을 타입이야?',
    'Today I’m {title} {emoji} My perfect dish: {menu}! What’s yours?',
    '今日の私は{title}{emoji} ぴったりメニューは{menu}！あなたは？'
  ),
  friendResult: L('친구의 결과예요!', 'This is your friend’s result!', '友だちの結果です！'),
  tryIt: L('나도 테스트하기', 'Take the test', '自分も診断する'),
  retry: L('다시 하기', 'Try again', 'もう一度'),
  otherTests: L('다른 테스트', 'Other tests', '他のテスト'),
  metaTitle: L(
    '서울 오늘의 메뉴 테스트 - 나에게 맞는 음식과 맛집 추천',
    'Seoul Food Mood Test - Your Dish and Real Restaurant Picks',
    'ソウル今日のメニュー診断 - あなたに合う料理と名店'
  ),
  metaDesc: L(
    '홍대·강남·종로·성수 중 동네를 고르고 6가지 질문에 답하면, 오늘 나에게 맞는 메뉴와 미쉐린 빕구르망 등 실제 맛집을 지도와 함께 추천해 드려요.',
    'Pick Hongdae, Gangnam, Jongno or Seongsu, answer six questions, and get your dish for today plus real restaurants — including Michelin Bib Gourmand picks — with map links.',
    '弘大・江南・鍾路・聖水からエリアを選び6つの質問に答えると、今日のあなたに合うメニューとミシュラン・ビブグルマンなど実在の名店を地図付きでおすすめ。'
  ),
};

export function ui(key: keyof typeof UI, lang: Lang, vars: Record<string, string | number> = {}): string {
  return Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, String(v)), pick(UI[key], lang));
}

/** Result-card backgrounds for next/og images (Satori needs CSS gradients, not Tailwind classes). */
export const OG_GRADIENTS: Record<string, string> = {
  spicy: 'linear-gradient(135deg, #f43f5e, #ef4444 50%, #f97316)',
  soup: 'linear-gradient(135deg, #d97706, #ea580c 50%, #ca8a04)',
  noodle: 'linear-gradient(135deg, #0ea5e9, #06b6d4 50%, #14b8a6)',
  meat: 'linear-gradient(135deg, #dc2626, #e11d48 50%, #db2777)',
  dumpling: 'linear-gradient(135deg, #10b981, #14b8a6 50%, #0891b2)',
  chicken: 'linear-gradient(135deg, #eab308, #f59e0b 50%, #f97316)',
};

