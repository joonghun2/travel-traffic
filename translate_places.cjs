const fs = require('fs');

let content = fs.readFileSync('js/places-db.js', 'utf8');

const tMap = {
  0: { en: 'Hongdae Street', ja: '弘大通り', tE: 'Clubs, Cafes, Busking', tJ: 'クラブ・カフェ・バスキング', bE: 'Weekdays 11AM', bJ: '平日午前11時' },
  1: { en: 'Myeong-dong', ja: '明洞', tE: 'Beauty & Fashion Hub', tJ: '美容・ファッションの中心', bE: 'Weekdays Early AM', bJ: '平日午前中の早い時間' },
  2: { en: 'Gyeongbokgung Palace', ja: '景福宮', tE: 'Royal Guard Changing Ceremony', tJ: '王宮守門将交代儀式', bE: 'Right after opening', bJ: '開館直後' },
  3: { en: 'N Seoul Tower', ja: 'Nソウルタワー', tE: 'Night view & Love locks', tJ: '夜景と愛の南京錠', bE: 'Night view 7PM', bJ: '夜景 午後7時' },
  4: { en: 'Yeouido Hangang Park', ja: '汝矣島漢江公園', tE: 'Best cherry blossom spot', tJ: '桜の名所', bE: 'Anytime', bJ: 'いつでも快適' },
  5: { en: 'Bukchon Hanok Village', ja: '北村韓屋村', tE: 'Traditional photo spots', tJ: '伝統的な写真スポット', bE: 'Early morning', bJ: '午前中の早い時間' },
  6: { en: 'Dongdaemun DDP', ja: '東大門DDP', tE: 'Zaha Hadid architecture', tJ: 'ザハ・ハディド建築', bE: 'Weekday mornings', bJ: '平日午前' },
  7: { en: 'Insadong', ja: '仁寺洞', tE: 'Traditional crafts & galleries', tJ: '伝統工芸とギャラリー', bE: 'Weekends 10AM', bJ: '週末午前10時' },
  40: { en: 'Lotte World', ja: 'ロッテワールド', tE: 'Fantastic adventure', tJ: '夢と希望の国', bE: 'At opening', bJ: '開園時' },
  41: { en: 'COEX Mall', ja: 'コエックスモール', tE: 'Starfield Library', tJ: 'ピョルマダン図書館', bE: 'Daytime', bJ: '昼間' },
  42: { en: 'Gwangjang Market', ja: '広蔵市場', tE: 'Beef tartare & Bindaetteok', tJ: 'ユッケとピンデトック', bE: 'Evening', bJ: '夕方' },
  43: { en: 'Cheonggyecheon', ja: '清渓川', tE: 'Night stroll spot', tJ: '夜の散歩コース', bE: '8PM', bJ: '午後8時' },
  44: { en: 'Seoul Forest', ja: 'ソウルの森', tE: 'Recommended for picnics', tJ: 'ピクニックにおすすめ', bE: '2PM', bJ: '午後2時' },
  45: { en: 'Cheong Wa Dae', ja: '青瓦台', tE: 'Presidential office', tJ: '大統領執務室', bE: 'Reserved time', bJ: '予約時間' },
  46: { en: 'Ikseon-dong', ja: '益善洞', tE: 'Hanok cafe street', tJ: '韓屋カフェ通り', bE: '3PM', bJ: '午後3時' },
  47: { en: 'Naksan Park', ja: '駱山公園', tE: 'City wall night view', tJ: '城郭の夜景', bE: 'After sunset', bJ: '日没後' },
  
  10: { en: 'Hallasan National Park', ja: '漢拏山国立公園', tE: 'Hiking boots required', tJ: '登山靴必須', bE: '6AM', bJ: '午前6時' },
  11: { en: 'Seongsan Ilchulbong', ja: '城山日出峰', tE: 'Best sunrise', tJ: '最高の日の出', bE: 'Before sunrise', bJ: '日の出前' },
  12: { en: 'Manjanggul Cave', ja: '万丈窟', tE: 'Outerwear required', tJ: '上着必須', bE: '2PM', bJ: '午後2時' },
  13: { en: 'Jeongbang Waterfall', ja: '正房の滝', tE: 'Only coastal waterfall in Asia', tJ: '東洋唯一の海岸瀑布', bE: '10AM', bJ: '午前10時' },
  14: { en: 'Hamdeok Beach', ja: '咸徳海水浴場', tE: 'Emerald sea', tJ: 'エメラルド色の海', bE: 'High tide', bJ: '満潮時' },
  15: { en: 'Osulloc Tea Museum', ja: 'オソルロック', tE: 'Green tea ice cream', tJ: '抹茶アイスクリーム', bE: 'Weekday afternoons', bJ: '平日午後' },
  50: { en: 'Udo Island', ja: '牛島', tE: 'Island in an island', tJ: '島の中の島', bE: 'Morning ferry', bJ: '午前の船' },
  51: { en: 'Jusangjeolli Cliff', ja: '大浦柱状節理', tE: 'Mysterious volcanic rocks', tJ: '神秘的な火山岩', bE: 'High waves', bJ: '波が高い日' },
  52: { en: 'Bijarim Forest', ja: '榧子林', tE: 'Thousand-year forest', tJ: '千年の森', bE: 'After rain', bJ: '雨上がり' },
  53: { en: 'Camellia Hill', ja: 'カメリアヒル', tE: 'Photo spot', tJ: '写真スポット', bE: 'Blooming season', bJ: '開花時期' },
  54: { en: 'Woljeongri Beach', ja: '月汀里ビーチ', tE: 'Cafe street', tJ: 'カフェ通り', bE: 'At sunset', bJ: '夕暮れ時' },
  55: { en: 'Cheonjiyeon Waterfall', ja: '天地淵の滝', tE: 'Night illumination', tJ: '夜間照明', bE: 'Night stroll', bJ: '夜の散歩' },
  56: { en: 'Hyeopjae Beach', ja: '狭才海水浴場', tE: 'Clear waters', tJ: '透き通る海', bE: 'Low tide', bJ: '干潮時' },
  57: { en: 'Yakcheonsa Temple', ja: '薬泉寺', tE: 'Grand main hall', tJ: '壮大な本堂', bE: 'Daytime', bJ: '昼間' },
  58: { en: 'Spirited Garden', ja: '考える庭園', tE: 'Fountains and gardens', tJ: '噴水と庭園', bE: 'Daytime', bJ: '昼' },
  59: { en: 'Ecoland', ja: 'エコランド', tE: 'Forest train', tJ: '森の機関車', bE: 'With family', bJ: '家族と一緒に' },
  
  100: { en: 'Haeundae Beach', ja: '海雲台海水浴場', tE: 'Crowded in summer', tJ: '夏は非常に混雑', bE: 'Weekday afternoon', bJ: '平日午後' },
  101: { en: 'Gwangalli Beach', ja: '広安里海水浴場', tE: 'Drone show & Night view', tJ: 'ドローンショーと夜景', bE: 'Before evening', bJ: '夜景が始まる前' },
  102: { en: 'Gamcheon Culture Village', ja: '甘川文化村', tE: 'Little Prince photo zone', tJ: '星の王子さまフォトゾーン', bE: '10AM', bJ: '午前10時' },
  103: { en: 'Huinnyeoul Culture Village', ja: '白瀬文化村', tE: 'Jeoryeong Coastal Trail', tJ: '絶影海岸散策路', bE: 'Just before sunset', bJ: '日没直前' },
  104: { en: 'Jagalchi Market', ja: 'チャガルチ市場', tE: 'Busan largest seafood market', tJ: '釜山最大の海鮮市場', bE: 'Early evening', bJ: '早めの夕方' },
  105: { en: 'Taejongdae', ja: '太宗台', tE: 'Danubi Train & Cliffs', tJ: 'ダヌビ列車と奇岩絶壁', bE: '10AM', bJ: '午前10時' },
  106: { en: 'Haedong Yonggungsa', ja: '海東龍宮寺', tE: 'Temple closest to the sea', tJ: '海に最も近い寺', bE: 'Right after opening', bJ: '開場直後' },
  107: { en: 'Seomyeon Youth Street', ja: '西面若者の街', tE: 'Busan biggest downtown', tJ: '釜山最大の繁華街', bE: 'Weekday afternoon', bJ: '平日午後' },
  108: { en: 'Songdo Marine Cable Car', ja: '松島海上ケーブルカー', tE: 'Flying over the sea', tJ: '海の上を飛ぶ気分', bE: 'At sunset', bJ: '夕暮れ時' },
  
  20: { en: 'Dotonbori', ja: '道頓堀', tE: 'Glico running man', tJ: 'グリコサイン', bE: 'Night view', bJ: '夜景' },
  21: { en: 'Osaka Castle', ja: '大阪城', tE: 'Main tower view', tJ: '天守閣からの眺め', bE: '9AM', bJ: '午前9時' },
  22: { en: 'Shinsekai', ja: '新世界', tE: 'Kushikatsu spots', tJ: '串カツの名店', bE: 'Late afternoon', bJ: '午後遅く' },
  23: { en: 'Shinsaibashi', ja: '心斎橋', tE: 'Shopping street', tJ: 'ショッピング通り', bE: 'Weekday afternoon', bJ: '平日午後' },
  24: { en: 'Universal Studios Japan', ja: 'USJ', tE: 'Express pass recommended', tJ: 'エクスプレスパス推奨', bE: 'Right after opening', bJ: '開園直後' },
  25: { en: 'Umeda Sky Building', ja: '梅田スカイビル', tE: 'Night view spot', tJ: '夜景スポット', bE: 'Around sunset', bJ: '日没前後' },
  26: { en: 'Kuromon Market', ja: '黒門市場', tE: 'Local seafood', tJ: '地元の海鮮', bE: '11AM', bJ: '午前11時' },
  200: { en: 'Kaiyukan', ja: '海遊館', tE: 'Giant whale sharks', tJ: '巨大ジンベエザメ', bE: '10AM', bJ: '午前10時' },
  201: { en: 'Tempozan Ferris Wheel', ja: '天保山大観覧車', tE: 'Night view spot', tJ: '夜景スポット', bE: 'At sunset', bJ: '日没時' },
  202: { en: 'Sumiyoshi Taisha', ja: '住吉大社', tE: 'Arched bridge', tJ: '太鼓橋', bE: 'Early morning', bJ: '早朝' },
  203: { en: 'Americamura', ja: 'アメリカ村', tE: 'Youth street', tJ: '若者の街', bE: 'Weekend afternoon', bJ: '週末午後' },
  204: { en: 'Namba Parks', ja: 'なんばパークス', tE: 'Rooftop garden', tJ: '屋上庭園', bE: 'Late afternoon', bJ: '午後遅く' },
  
  30: { en: 'Kiyomizu-dera', ja: '清水寺', tE: 'Kyoto panoramic view', tJ: '京都の全景', bE: 'Early morning', bJ: '早朝' },
  31: { en: 'Fushimi Inari', ja: '伏見稲荷', tE: '1000 Torii gates', tJ: '千本鳥居', bE: '8AM', bJ: '午前8時' },
  32: { en: 'Kinkaku-ji', ja: '金閣寺', tE: 'Golden Pavilion', tJ: '華麗な金箔', bE: '9AM', bJ: '午前9時' },
  33: { en: 'Arashiyama', ja: '嵐山', tE: 'Bamboo grove walk', tJ: '竹林の小径', bE: 'Early morning', bJ: '早朝' },
  34: { en: 'Gion Street', ja: '祇園通り', tE: 'Traditional street walk', tJ: '伝統的な街歩き', bE: 'Late afternoon', bJ: '午後遅く' },
  35: { en: 'Nijo Castle', ja: '二条城', tE: 'Nightingale floors', tJ: '鴬張りの廊下', bE: '10AM', bJ: '午前10時' },
  36: { en: 'Ginkaku-ji', ja: '銀閣寺', tE: 'Beautiful sand garden', tJ: '美しい砂の庭園', bE: '10AM', bJ: '午前10時' },
  205: { en: 'Nanzen-ji', ja: '南禅寺', tE: 'Brick aqueduct', tJ: 'レンガ造りの水路閣', bE: '9AM', bJ: '午前9時' },
  206: { en: "Philosopher's Path", ja: '哲学の道', tE: 'Stroll for thought', tJ: '思索の散歩道', bE: 'Cherry blossom season', bJ: '桜の季節' },
  207: { en: 'Heian Shrine', ja: '平安神宮', tE: 'Giant Torii', tJ: '巨大な鳥居', bE: '11AM', bJ: '午前11時' },
  208: { en: 'Kyoto Imperial Palace', ja: '京都御所', tE: 'Elegance of palace', tJ: '皇宮の品格', bE: 'Reserved time', bJ: '予約時間' },
  209: { en: 'Ryoan-ji', ja: '龍安寺', tE: 'Rock garden', tJ: '石庭', bE: '2PM', bJ: '午後2時' }
};

const cMap = {
  '쇼핑·관광': { en: 'Shopping & Sightseeing', ja: 'ショッピング・観光' },
  '고궁': { en: 'Palace', ja: '古宮' },
  '자연·공원': { en: 'Nature & Park', ja: '自然・公園' },
  '테마파크': { en: 'Theme Park', ja: 'テーマパーク' },
  '바다·관광': { en: 'Beach & Sightseeing', ja: '海と観光' },
  '바다·야경': { en: 'Beach & Night View', ja: '海と夜景' },
  '명소·관광': { en: 'Attraction', ja: '名所・観光' },
  '쇼핑·맛집': { en: 'Shopping & Dining', ja: 'ショッピング・グルメ' },
  '전망대': { en: 'Observatory', ja: '展望台' },
  '박물관': { en: 'Museum', ja: '博物館' }
};

// Regex to find each object in window.GLOBAL_PLACES array
let newContent = content.replace(/\{([^}]+)\}/g, (match, inner) => {
    // extract id
    let idMatch = inner.match(/id:\s*(\d+)/);
    let catMatch = inner.match(/cat:\s*'([^']+)'/);
    if (idMatch && catMatch) {
       let id = parseInt(idMatch[1]);
       let cat = catMatch[1];
       let t = tMap[id];
       let c = cMap[cat] || {en:cat, ja:cat};
       if (t) {
           // check if we already have nameEn indicating it's appended
           if (!inner.includes('nameEn:')) {
               let additions = `,nameEn:'${t.en.replace(/'/g,"\\\\'")}',nameJa:'${t.ja}',catEn:'${c.en}',catJa:'${c.ja}',tipEn:'${t.tE.replace(/'/g,"\\\\'")}',tipJa:'${t.tJ}',bestEn:'${t.bE}',bestJa:'${t.bJ}'`;
               return `{${inner}${additions}}`;
           }
       }
    }
    return match;
});

fs.writeFileSync('js/places-db.js', newContent, 'utf8');
console.log("places-db.js successfully translated.");
