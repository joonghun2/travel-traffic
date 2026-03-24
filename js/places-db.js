// Global Places Database for Route Planner and Congestion Dashboards
window.GLOBAL_PLACES = [
  // SEOUL
  {id:0,city:'seoul',name:'홍대 거리',area:'마포구',cat:'쇼핑·관광',emoji:'🎸',lat:37.5563,lng:126.9234,base:72,peaks:[13,14,17,18,19,20],best:'평일 오전 11시',tip:'클럽·카페·버스킹 거리',nameEn:'Hongdae Street',nameJa:'弘大通り',catEn:'Shopping & Sightseeing',catJa:'ショッピング・観光',tipEn:'Clubs, Cafes, Busking',tipJa:'クラブ・カフェ・バスキング',bestEn:'Weekdays 11AM',bestJa:'平日午前11時'},
  {id:1,city:'seoul',name:'명동',area:'중구',cat:'쇼핑·관광',emoji:'🛍️',lat:37.5636,lng:126.9860,base:88,peaks:[12,13,14,15,16,17,18],best:'주중 오전 일찍',tip:'뷰티·패션 쇼핑 1번지',nameEn:'Myeong-dong',nameJa:'明洞',catEn:'Shopping & Sightseeing',catJa:'ショッピング・観光',tipEn:'Beauty & Fashion Hub',tipJa:'美容・ファッションの中心',bestEn:'Weekdays Early AM',bestJa:'平日午前中の早い時間'},
  {id:2,city:'seoul',name:'경복궁',area:'종로구',cat:'고궁',emoji:'🏯',lat:37.5796,lng:126.9770,base:42,peaks:[10,11,12,13,14],best:'개관 직후 9시',tip:'수문장 교대식 인기',nameEn:'Gyeongbokgung Palace',nameJa:'景福宮',catEn:'Palace',catJa:'古宮',tipEn:'Royal Guard Changing Ceremony',tipJa:'王宮守門将交代儀式',bestEn:'Right after opening',bestJa:'開館直後'},
  {id:3,city:'seoul',name:'남산서울타워',area:'중구',cat:'쇼핑·관광',emoji:'🗼',lat:37.5512,lng:126.9882,base:66,peaks:[14,15,19,20],best:'야경 저녁 7시',tip:'야경 명소 & 자물쇠 이벤트',nameEn:'N Seoul Tower',nameJa:'Nソウルタワー',catEn:'Shopping & Sightseeing',catJa:'ショッピング・観光',tipEn:'Night view & Love locks',tipJa:'夜景と愛の南京錠',bestEn:'Night view 7PM',bestJa:'夜景 午後7時'},
  {id:4,city:'seoul',name:'여의도 한강공원',area:'영등포구',cat:'자연·공원',emoji:'🌊',lat:37.5283,lng:126.9322,base:28,peaks:[17,18,19],best:'언제든 쾌적',tip:'봄 벚꽃 최고 명소',nameEn:'Yeouido Hangang Park',nameJa:'汝矣島漢江公園',catEn:'Nature & Park',catJa:'自然・公園',tipEn:'Best cherry blossom spot',tipJa:'桜の名所',bestEn:'Anytime',bestJa:'いつでも快適'},
  {id:5,city:'seoul',name:'북촌 한옥마을',area:'종로구',cat:'고궁',emoji:'🏘️',lat:37.5826,lng:126.9832,base:35,peaks:[11,12,13,14],best:'오전 이른 시간',tip:'전통 한옥 포토스팟',nameEn:'Bukchon Hanok Village',nameJa:'北村韓屋村',catEn:'Palace',catJa:'古宮',tipEn:'Traditional photo spots',tipJa:'伝統的な写真スポット',bestEn:'Early morning',bestJa:'午前中の早い時間'},
  {id:6,city:'seoul',name:'동대문 DDP',area:'중구',cat:'쇼핑·관광',emoji:'🌀',lat:37.5669,lng:127.0098,base:79,peaks:[12,13,14,19,20,21],best:'평일 오전',tip:'자하 하디드 건축 디자인',nameEn:'Dongdaemun DDP',nameJa:'東大門DDP',catEn:'Shopping & Sightseeing',catJa:'ショッピング・観光',tipEn:'Zaha Hadid architecture',tipJa:'ザハ・ハディド建築',bestEn:'Weekday mornings',bestJa:'平日午前'},
  {id:7,city:'seoul',name:'인사동',area:'종로구',cat:'쇼핑·관광',emoji:'🎨',lat:37.5742,lng:126.9854,base:44,peaks:[11,12,13,14],best:'주말 오전 10시',tip:'전통 공예·갤러리 밀집',nameEn:'Insadong',nameJa:'仁寺洞',catEn:'Shopping & Sightseeing',catJa:'ショッピング・観光',tipEn:'Traditional crafts & galleries',tipJa:'伝統工芸とギャラリー',bestEn:'Weekends 10AM',bestJa:'週末午前10時'},
  {id:40,city:'seoul',name:'롯데월드',area:'송파구',cat:'테마파크',emoji:'🎢',lat:37.5111,lng:127.0981,base:85,peaks:[10,11,12,13,14,15,16,17],best:'개장 시',tip:'환상적인 모험',nameEn:'Lotte World',nameJa:'ロッテワールド',catEn:'Theme Park',catJa:'テーマパーク',tipEn:'Fantastic adventure',tipJa:'夢と希望の国',bestEn:'At opening',bestJa:'開園時'},
  {id:41,city:'seoul',name:'코엑스 몰',area:'강남구',cat:'쇼핑·관광',emoji:'🏙️',lat:37.5116,lng:127.0591,base:70,peaks:[12,13,14,18,19],best:'낮 시간대',tip:'별마당 도서관',nameEn:'COEX Mall',nameJa:'コエックスモール',catEn:'Shopping & Sightseeing',catJa:'ショッピング・観光',tipEn:'Starfield Library',tipJa:'ピョルマダン図書館',bestEn:'Daytime',bestJa:'昼間'},
  {id:42,city:'seoul',name:'광장시장',area:'종로구',cat:'쇼핑·관광',emoji:'🥘',lat:37.5700,lng:126.9990,base:75,peaks:[12,13,18,19,20],best:'저녁 시간',tip:'육회와 빈대떡',nameEn:'Gwangjang Market',nameJa:'広蔵市場',catEn:'Shopping & Sightseeing',catJa:'ショッピング・観光',tipEn:'Beef tartare & Bindaetteok',tipJa:'ユッケとピンデトック',bestEn:'Evening',bestJa:'夕方'},
  {id:43,city:'seoul',name:'청계천',area:'종로구',cat:'자연·공원',emoji:'🌊',lat:37.5691,lng:126.9787,base:30,peaks:[19,20,21],best:'밤 8시',tip:'밤 산책 명소',nameEn:'Cheonggyecheon',nameJa:'清渓川',catEn:'Nature & Park',catJa:'自然・公園',tipEn:'Night stroll spot',tipJa:'夜の散歩コース',bestEn:'8PM',bestJa:'午後8時'},
  {id:44,city:'seoul',name:'서울숲',area:'성동구',cat:'자연·공원',emoji:'🌳',lat:37.5443,lng:127.0374,base:40,peaks:[14,15,16],best:'오후 2시',tip:'피크닉 추천',nameEn:'Seoul Forest',nameJa:'ソウルの森',catEn:'Nature & Park',catJa:'自然・公園',tipEn:'Recommended for picnics',tipJa:'ピクニックにおすすめ',bestEn:'2PM',bestJa:'午後2時'},
  {id:45,city:'seoul',name:'청와대',area:'종로구',cat:'고궁',emoji:'🏛️',lat:37.5866,lng:126.9748,base:50,peaks:[10,11,14,15],best:'예약 시간',tip:'대통령 집무실',nameEn:'Cheong Wa Dae',nameJa:'青瓦台',catEn:'Palace',catJa:'古宮',tipEn:'Presidential office',tipJa:'大統領執務室',bestEn:'Reserved time',bestJa:'予約時間'},
  {id:46,city:'seoul',name:'익선동',area:'종로구',cat:'쇼핑·관광',emoji:'☕',lat:37.5744,lng:126.9896,base:80,peaks:[15,16,17,18,19],best:'오후 3시',tip:'한옥 카페 거리',nameEn:'Ikseon-dong',nameJa:'益善洞',catEn:'Shopping & Sightseeing',catJa:'ショッピング・観光',tipEn:'Hanok cafe street',tipJa:'韓屋カフェ通り',bestEn:'3PM',bestJa:'午後3時'},
  {id:47,city:'seoul',name:'낙산공원',area:'종로구',cat:'자연·공원',emoji:'🏰',lat:37.5807,lng:127.0062,base:20,peaks:[19,20,21],best:'일몰 후',tip:'성곽길 야경',nameEn:'Naksan Park',nameJa:'駱山公園',catEn:'Nature & Park',catJa:'自然・公園',tipEn:'City wall night view',tipJa:'城郭の夜景',bestEn:'After sunset',bestJa:'日没後'},
  
  // JEJU
  {id:10,city:'jeju',name:'한라산 국립공원',area:'제주 중심부',cat:'자연·공원',emoji:'⛰️',lat:33.3617,lng:126.5332,base:30,peaks:[8,9,10,11],best:'새벽 6시',tip:'등산화 필수',nameEn:'Hallasan National Park',nameJa:'漢拏山国立公園',catEn:'Nature & Park',catJa:'自然・公園',tipEn:'Hiking boots required',tipJa:'登山靴必須',bestEn:'6AM',bestJa:'午前6時'},
  {id:11,city:'jeju',name:'성산 일출봉',area:'성산읍',cat:'자연·공원',emoji:'🌅',lat:33.4585,lng:126.9421,base:45,peaks:[6,7,11,12],best:'일출 전',tip:'최고의 일출',nameEn:'Seongsan Ilchulbong',nameJa:'城山日出峰',catEn:'Nature & Park',catJa:'自然・公園',tipEn:'Best sunrise',tipJa:'最高の日の出',bestEn:'Before sunrise',bestJa:'日の出前'},
  {id:12,city:'jeju',name:'만장굴',area:'구좌읍',cat:'자연·공원',emoji:'🦇',lat:33.5284,lng:126.7716,base:35,peaks:[12,13,14,15],best:'오후 2시',tip:'겉옷 필수',nameEn:'Manjanggul Cave',nameJa:'万丈窟',catEn:'Nature & Park',catJa:'自然・公園',tipEn:'Outerwear required',tipJa:'上着必須',bestEn:'2PM',bestJa:'午後2時'},
  {id:13,city:'jeju',name:'정방폭포',area:'서귀포시',cat:'자연·공원',emoji:'🌊',lat:33.2448,lng:126.5718,base:40,peaks:[11,12,14,15],best:'오전 10시',tip:'동양 유일의 해안 폭포',nameEn:'Jeongbang Waterfall',nameJa:'正房の滝',catEn:'Nature & Park',catJa:'自然・公園',tipEn:'Only coastal waterfall in Asia',tipJa:'東洋唯一の海岸瀑布',bestEn:'10AM',bestJa:'午前10時'},
  {id:14,city:'jeju',name:'함덕 해수욕장',area:'조천읍',cat:'자연·공원',emoji:'🏖️',lat:33.5430,lng:126.6692,base:60,peaks:[13,14,15,16,17],best:'만조 시',tip:'에메랄드빛 바다',nameEn:'Hamdeok Beach',nameJa:'咸徳海水浴場',catEn:'Nature & Park',catJa:'自然・公園',tipEn:'Emerald sea',tipJa:'エメラルド色の海',bestEn:'High tide',bestJa:'満潮時'},
  {id:15,city:'jeju',name:'오설록 티 뮤지엄',area:'안덕면',cat:'박물관',emoji:'🍵',lat:33.3056,lng:126.2894,base:70,peaks:[13,14,15,16],best:'평일 오후',tip:'녹차 아이스크림',nameEn:'Osulloc Tea Museum',nameJa:'オソルロック',catEn:'Museum',catJa:'博物館',tipEn:'Green tea ice cream',tipJa:'抹茶アイスクリーム',bestEn:'Weekday afternoons',bestJa:'平日午後'},
  {id:50,city:'jeju',name:'우도',area:'우도면',cat:'자연·공원',emoji:'⛴️',lat:33.5115,lng:126.9538,base:40,peaks:[11,12,13,14],best:'오전 배',tip:'섬 속의 섬',nameEn:'Udo Island',nameJa:'牛島',catEn:'Nature & Park',catJa:'自然・公園',tipEn:'Island in an island',tipJa:'島の中の島',bestEn:'Morning ferry',bestJa:'午前の船'},
  {id:51,city:'jeju',name:'주상절리대',area:'중문',cat:'자연·공원',emoji:'🗿',lat:33.2384,lng:126.4259,base:45,peaks:[11,12,14,15],best:'파도 센 날',tip:'화산석의 신비',nameEn:'Jusangjeolli Cliff',nameJa:'大浦柱状節理',catEn:'Nature & Park',catJa:'自然・公園',tipEn:'Mysterious volcanic rocks',tipJa:'神秘的な火山岩',bestEn:'High waves',bestJa:'波が高い日'},
  {id:52,city:'jeju',name:'비자림',area:'구좌읍',cat:'자연·공원',emoji:'🌲',lat:33.4912,lng:126.7725,base:30,peaks:[10,11,14,15],best:'비 온 후',tip:'천년의 숲',nameEn:'Bijarim Forest',nameJa:'榧子林',catEn:'Nature & Park',catJa:'自然・公園',tipEn:'Thousand-year forest',tipJa:'千年の森',bestEn:'After rain',bestJa:'雨上がり'},
  {id:53,city:'jeju',name:'카멜리아 힐',area:'안덕면',cat:'자연·공원',emoji:'🌺',lat:33.2842,lng:126.3703,base:35,peaks:[11,12,14],best:'꽃 개화기',tip:'인생샷 명소',nameEn:'Camellia Hill',nameJa:'カメリアヒル',catEn:'Nature & Park',catJa:'自然・公園',tipEn:'Photo spot',tipJa:'写真スポット',bestEn:'Blooming season',bestJa:'開花時期'},
  {id:54,city:'jeju',name:'월정리 해변',area:'구좌읍',cat:'자연·공원',emoji:'⛱️',lat:33.5532,lng:126.7932,base:55,peaks:[16,17,18],best:'해질녘',tip:'카페 거리',nameEn:'Woljeongri Beach',nameJa:'月汀里ビーチ',catEn:'Nature & Park',catJa:'自然・公園',tipEn:'Cafe street',tipJa:'カフェ通り',bestEn:'At sunset',bestJa:'夕暮れ時'},
  {id:55,city:'jeju',name:'천지연 폭포',area:'서귀포시',cat:'자연·공원',emoji:'🌊',lat:33.2458,lng:126.5593,base:50,peaks:[19,20,21],best:'밤 산책',tip:'야간 조명 폭포',nameEn:'Cheonjiyeon Waterfall',nameJa:'天地淵の滝',catEn:'Nature & Park',catJa:'自然・公園',tipEn:'Night illumination',tipJa:'夜間照明',bestEn:'Night stroll',bestJa:'夜の散歩'},
  {id:56,city:'jeju',name:'협재 해수욕장',area:'한림읍',cat:'자연·공원',emoji:'🏝️',lat:33.3938,lng:126.2393,base:65,peaks:[14,15,16,17],best:'물 빠질 때',tip:'맑은 바다',nameEn:'Hyeopjae Beach',nameJa:'狭才海水浴場',catEn:'Nature & Park',catJa:'自然・公園',tipEn:'Clear waters',tipJa:'透き通る海',bestEn:'Low tide',bestJa:'干潮時'},
  {id:57,city:'jeju',name:'약천사',area:'대포동',cat:'박물관',emoji:'🏯',lat:33.2435,lng:126.4485,base:25,peaks:[10,11,14],best:'낮 시간',tip:'웅장한 법당',nameEn:'Yakcheonsa Temple',nameJa:'薬泉寺',catEn:'Museum',catJa:'博物館',tipEn:'Grand main hall',tipJa:'壮大な本堂',bestEn:'Daytime',bestJa:'昼間'},
  {id:58,city:'jeju',name:'생각하는 정원',area:'한경면',cat:'자연·공원',emoji:'🌳',lat:33.3245,lng:126.2541,base:20,peaks:[11,12,14],best:'낮',tip:'분수와 정원',nameEn:'Spirited Garden',nameJa:'考える庭園',catEn:'Nature & Park',catJa:'自然・公園',tipEn:'Fountains and gardens',tipJa:'噴水と庭園',bestEn:'Daytime',bestJa:'昼'},
  {id:59,city:'jeju',name:'에코랜드',area:'조천읍',cat:'테마파크',emoji:'🚂',lat:33.4560,lng:126.6680,base:45,peaks:[11,12,14,15],best:'가족과 함께',tip:'숲 속 기차',nameEn:'Ecoland',nameJa:'エコランド',catEn:'Theme Park',catJa:'テーマパーク',tipEn:'Forest train',tipJa:'森の機関車',bestEn:'With family',bestJa:'家族と一緒に'},
  
  // BUSAN
  {id:100,city:'busan',name:'해운대 해수욕장',area:'해운대구',cat:'바다·관광',emoji:'🌊',lat:35.1587,lng:129.1604,base:60,peaks:[14,15,16,19,20],best:'평일 오후',tip:'여름시즌 초밀집',nameEn:'Haeundae Beach',nameJa:'海雲台海水浴場',catEn:'Beach & Sightseeing',catJa:'海と観光',tipEn:'Crowded in summer',tipJa:'夏は非常に混雑',bestEn:'Weekday afternoon',bestJa:'平日午後'},
  {id:101,city:'busan',name:'광안리 해수욕장',area:'수영구',cat:'바다·야경',emoji:'🌉',lat:35.1532,lng:129.1189,base:55,peaks:[18,19,20,21],best:'저녁 야경 시작 전',tip:'드론쇼와 광안대교 야경',nameEn:'Gwangalli Beach',nameJa:'広安里海水浴場',catEn:'Beach & Night View',catJa:'海と夜景',tipEn:'Drone show & Night view',tipJa:'ドローンショーと夜景',bestEn:'Before evening',bestJa:'夜景が始まる前'},
  {id:102,city:'busan',name:'감천문화마을',area:'사하구',cat:'명소·관광',emoji:'🏘️',lat:35.0970,lng:128.9996,base:45,peaks:[12,13,14,15,16],best:'오전 10시',tip:'어린왕자 포토존',nameEn:'Gamcheon Culture Village',nameJa:'甘川文化村',catEn:'Attraction',catJa:'名所・観光',tipEn:'Little Prince photo zone',tipJa:'星の王子さまフォトゾーン',bestEn:'10AM',bestJa:'午前10時'},
  {id:103,city:'busan',name:'흰여울문화마을',area:'영도구',cat:'명소·관광',emoji:'⚓',lat:35.0782,lng:129.0442,base:35,peaks:[14,15,16,17],best:'일몰 직전',tip:'절영해안산책로',nameEn:'Huinnyeoul Culture Village',nameJa:'白瀬文化村',catEn:'Attraction',catJa:'名所・観光',tipEn:'Jeoryeong Coastal Trail',tipJa:'絶影海岸散策路',bestEn:'Just before sunset',bestJa:'日没直前'},
  {id:104,city:'busan',name:'자갈치시장',area:'중구',cat:'쇼핑·맛집',emoji:'🐟',lat:35.0967,lng:129.0305,base:80,peaks:[12,13,18,19],best:'이른 저녁',tip:'부산 최대 해산물 시장',nameEn:'Jagalchi Market',nameJa:'チャガルチ市場',catEn:'Shopping & Dining',catJa:'ショッピング・グルメ',tipEn:'Busan largest seafood market',tipJa:'釜山最大の海鮮市場',bestEn:'Early evening',bestJa:'早めの夕方'},
  {id:105,city:'busan',name:'태종대',area:'영도구',cat:'자연·공원',emoji:'🏞️',lat:35.0531,lng:129.0874,base:40,peaks:[11,12,13,14],best:'오전 10시',tip:'다누비 열차와 기암절벽',nameEn:'Taejongdae',nameJa:'太宗台',catEn:'Nature & Park',catJa:'自然・公園',tipEn:'Danubi Train & Cliffs',tipJa:'ダヌビ列車と奇岩絶壁',bestEn:'10AM',bestJa:'午前10時'},
  {id:106,city:'busan',name:'해동용궁사',area:'기장군',cat:'명소·관광',emoji:'🏯',lat:35.1884,lng:129.2233,base:65,peaks:[10,11,12,13,14],best:'개장 직후',tip:'바다와 가장 가까운 사찰',nameEn:'Haedong Yonggungsa',nameJa:'海東龍宮寺',catEn:'Attraction',catJa:'名所・観光',tipEn:'Temple closest to the sea',tipJa:'海に最も近い寺',bestEn:'Right after opening',bestJa:'開場直後'},
  {id:107,city:'busan',name:'서면 젊음의 거리',area:'부산진구',cat:'쇼핑·관광',emoji:'🛍️',lat:35.1528,lng:129.0594,base:85,peaks:[17,18,19,20,21,22],best:'평일 오후',tip:'부산 최대 번화가, 전포카페거리',nameEn:'Seomyeon Youth Street',nameJa:'西面若者の街',catEn:'Shopping & Sightseeing',catJa:'ショッピング・観光',tipEn:'Busan biggest downtown',tipJa:'釜山最大の繁華街',bestEn:'Weekday afternoon',bestJa:'平日午後'},
  {id:108,city:'busan',name:'송도 해상케이블카',area:'서구',cat:'명소·관광',emoji:'🚠',lat:35.0763,lng:129.0225,base:50,peaks:[13,14,15],best:'해질녘',tip:'바다 위를 나는 기분',nameEn:'Songdo Marine Cable Car',nameJa:'松島海上ケーブルカー',catEn:'Attraction',catJa:'名所・観光',tipEn:'Flying over the sea',tipJa:'海の上を飛ぶ気分',bestEn:'At sunset',bestJa:'夕暮れ時'},
  
  // OSAKA
  {id:20,city:'osaka',region:'osaka',name:'도톤보리',area:'오사카 나니와구',cat:'쇼핑·관광',emoji:'🏮',lat:34.6687,lng:135.5013,base:85,peaks:[12,13,18,19,20,21],best:'저녁 야경',tip:'글리코상 인증샷',nameEn:'Dotonbori',nameJa:'道頓堀',catEn:'Shopping & Sightseeing',catJa:'ショッピング・観光',tipEn:'Glico running man',tipJa:'グリコサイン',bestEn:'Night view',bestJa:'夜景'},
  {id:21,city:'osaka',region:'osaka',name:'오사카성',area:'오사카 주오구',cat:'고궁',emoji:'🏯',lat:34.6873,lng:135.5262,base:40,peaks:[10,11,13,14],best:'오전 9시',tip:'천수각 전망',nameEn:'Osaka Castle',nameJa:'大阪城',catEn:'Palace',catJa:'古宮',tipEn:'Main tower view',tipJa:'天守閣からの眺め',bestEn:'9AM',bestJa:'午前9時'},
  {id:22,city:'osaka',region:'osaka',name:'신세카이',area:'오사카 나니와구',cat:'쇼핑·관광',emoji:'🍢',lat:34.6525,lng:135.5063,base:55,peaks:[12,13,17,18,19],best:'늦은 오후',tip:'쿠시카츠 맛집',nameEn:'Shinsekai',nameJa:'新世界',catEn:'Shopping & Sightseeing',catJa:'ショッピング・観光',tipEn:'Kushikatsu spots',tipJa:'串カツの名店',bestEn:'Late afternoon',bestJa:'午後遅く'},
  {id:23,city:'osaka',region:'osaka',name:'신사이바시',area:'오사카 주오구',cat:'쇼핑·관광',emoji:'🛍️',lat:34.6720,lng:135.5015,base:80,peaks:[14,15,16,17,18],best:'평일 오후',tip:'쇼핑의 거리',nameEn:'Shinsaibashi',nameJa:'心斎橋',catEn:'Shopping & Sightseeing',catJa:'ショッピング・観光',tipEn:'Shopping street',tipJa:'ショッピング通り',bestEn:'Weekday afternoon',bestJa:'平日午後'},
  {id:24,city:'osaka',region:'osaka',name:'유니버설 스튜디오 재팬',area:'오사카 코노하나구',cat:'테마파크',emoji:'🎢',lat:34.6654,lng:135.4323,base:90,peaks:[10,11,12,13,14,15,16,17],best:'개장 직후',tip:'익스프레스 패스 추천',nameEn:'Universal Studios Japan',nameJa:'USJ',catEn:'Theme Park',catJa:'テーマパーク',tipEn:'Express pass recommended',tipJa:'エクスプレスパス推奨',bestEn:'Right after opening',bestJa:'開園直後'},
  {id:25,city:'osaka',region:'osaka',name:'우메다 스카이 빌딩',area:'오사카 키타구',cat:'전망대',emoji:'🏙️',lat:34.7052,lng:135.4897,base:50,peaks:[18,19,20],best:'일몰 전후',tip:'야경 명소',nameEn:'Umeda Sky Building',nameJa:'梅田スカイビル',catEn:'Observatory',catJa:'展望台',tipEn:'Night view spot',tipJa:'夜景スポット',bestEn:'Around sunset',bestJa:'日没前後'},
  {id:26,city:'osaka',region:'osaka',name:'쿠로몬 시장',area:'오사카 주오구',cat:'쇼핑·관광',emoji:'🐟',lat:34.6655,lng:135.5068,base:70,peaks:[11,12,13,14],best:'오전 11시',tip:'현지 해산물',nameEn:'Kuromon Market',nameJa:'黒門市場',catEn:'Shopping & Sightseeing',catJa:'ショッピング・観光',tipEn:'Local seafood',tipJa:'地元の海鮮',bestEn:'11AM',bestJa:'午前11時'},
  {id:200,city:'osaka',region:'osaka',name:'해유관',area:'오사카 미나토구',cat:'박물관',emoji:'🐠',lat:34.6545,lng:135.4289,base:75,peaks:[11,12,13,14,15],best:'오전 10시',tip:'거대 고래상어',nameEn:'Kaiyukan',nameJa:'海遊館',catEn:'Museum',catJa:'博物館',tipEn:'Giant whale sharks',tipJa:'巨大ジンベエザメ',bestEn:'10AM',bestJa:'午前10時'},
  {id:201,city:'osaka',region:'osaka',name:'덴포잔 대관람차',area:'오사카 미나토구',cat:'쇼핑·관광',emoji:'🎡',lat:34.6562,lng:135.4310,base:45,peaks:[17,18,19],best:'일몰 시',tip:'야경 명소',nameEn:'Tempozan Ferris Wheel',nameJa:'天保山大観覧車',catEn:'Shopping & Sightseeing',catJa:'ショッピング・観光',tipEn:'Night view spot',tipJa:'夜景スポット',bestEn:'At sunset',bestJa:'日没時'},
  {id:202,city:'osaka',region:'osaka',name:'스미요시 타이샤',area:'오사카 스미요시',cat:'고궁',emoji:'⛩️',lat:34.6120,lng:135.4930,base:30,peaks:[9,10,11],best:'이른 아침',tip:'아치형 다리',nameEn:'Sumiyoshi Taisha',nameJa:'住吉大社',catEn:'Palace',catJa:'古宮',tipEn:'Arched bridge',tipJa:'太鼓橋',bestEn:'Early morning',bestJa:'早朝'},
  {id:203,city:'osaka',region:'osaka',name:'아메리카무라',area:'오사카 주오구',cat:'쇼핑·관광',emoji:'🇺🇸',lat:34.6725,lng:135.4984,base:65,peaks:[14,15,16,17],best:'주말 오후',tip:'젊음의 거리',nameEn:'Americamura',nameJa:'アメリカ村',catEn:'Shopping & Sightseeing',catJa:'ショッピング・観光',tipEn:'Youth street',tipJa:'若者の街',bestEn:'Weekend afternoon',bestJa:'週末午後'},
  {id:204,city:'osaka',region:'osaka',name:'난바 파크스',area:'오사카 나니와구',cat:'쇼핑·관광',emoji:'🌿',lat:34.6616,lng:135.5019,base:40,peaks:[16,17,18],best:'늦은 오후',tip:'옥상 정원',nameEn:'Namba Parks',nameJa:'なんばパークス',catEn:'Shopping & Sightseeing',catJa:'ショッピング・観光',tipEn:'Rooftop garden',tipJa:'屋上庭園',bestEn:'Late afternoon',bestJa:'午後遅く'},
  
  // KYOTO
  {id:30,city:'kyoto',region:'kyoto',name:'기요미즈데라',area:'교토 히가시야마',cat:'고궁',emoji:'⛩️',lat:34.9948,lng:135.7850,base:60,peaks:[10,11,12,14,15],best:'이른 아침',tip:'교토 전경',nameEn:'Kiyomizu-dera',nameJa:'清水寺',catEn:'Palace',catJa:'古宮',tipEn:'Kyoto panoramic view',tipJa:'京都の全景',bestEn:'Early morning',bestJa:'早朝'},
  {id:31,city:'kyoto',region:'kyoto',name:'후시미 이나리',area:'교토 후시미',cat:'고궁',emoji:'🦊',lat:34.9671,lng:135.7726,base:50,peaks:[9,10,11,13,14],best:'오전 8시',tip:'천본 도리이',nameEn:'Fushimi Inari',nameJa:'伏見稲荷',catEn:'Palace',catJa:'古宮',tipEn:'1000 Torii gates',tipJa:'千本鳥居',bestEn:'8AM',bestJa:'午前8時'},
  {id:32,city:'kyoto',region:'kyoto',name:'금각사',area:'교토 키타구',cat:'고궁',emoji:'✨',lat:35.0393,lng:135.7292,base:45,peaks:[11,12,13,14],best:'오전 9시',tip:'화려한 금박',nameEn:'Kinkaku-ji',nameJa:'金閣寺',catEn:'Palace',catJa:'古宮',tipEn:'Golden Pavilion',tipJa:'華麗な金箔',bestEn:'9AM',bestJa:'午前9時'},
  {id:33,city:'kyoto',region:'kyoto',name:'아라시야마',area:'교토 우쿄구',cat:'자연·공원',emoji:'🎋',lat:35.0125,lng:135.6728,base:55,peaks:[11,12,13,15],best:'오전 일찍',tip:'대나무 숲 산책',nameEn:'Arashiyama',nameJa:'嵐山',catEn:'Nature & Park',catJa:'自然・公園',tipEn:'Bamboo grove walk',tipJa:'竹林の小径',bestEn:'Early morning',bestJa:'早朝'},
  {id:34,city:'kyoto',region:'kyoto',name:'기온 거리',area:'교토 히가시야마',cat:'쇼핑·관광',emoji:'👘',lat:35.0035,lng:135.7750,base:65,peaks:[17,18,19,20],best:'늦은 오후',tip:'전통 거리 산책',nameEn:'Gion Street',nameJa:'祇園通り',catEn:'Shopping & Sightseeing',catJa:'ショッピング・観光',tipEn:'Traditional street walk',tipJa:'伝統的な街歩き',bestEn:'Late afternoon',bestJa:'午後遅く'},
  {id:35,city:'kyoto',region:'kyoto',name:'니조 성',area:'교토 나카교구',cat:'고궁',emoji:'🏰',lat:35.0142,lng:135.7482,base:35,peaks:[10,11,13,14],best:'오전 10시',tip:'꾀꼬리 마루 체험',nameEn:'Nijo Castle',nameJa:'二条城',catEn:'Palace',catJa:'古宮',tipEn:'Nightingale floors',tipJa:'鴬張りの廊下',bestEn:'10AM',bestJa:'午前10時'},
  {id:36,city:'kyoto',region:'kyoto',name:'은각사',area:'교토 사쿄구',cat:'고궁',emoji:'🍃',lat:35.0268,lng:135.7982,base:40,peaks:[10,11,13,14],best:'오전 10시',tip:'아름다운 모래 정원',nameEn:'Ginkaku-ji',nameJa:'銀閣寺',catEn:'Palace',catJa:'古宮',tipEn:'Beautiful sand garden',tipJa:'美しい砂の庭園',bestEn:'10AM',bestJa:'午前10時'},
  {id:205,city:'kyoto',region:'kyoto',name:'난젠지',area:'교토 사쿄구',cat:'고궁',emoji:'🌉',lat:35.0112,lng:135.7936,base:45,peaks:[10,11,13,14],best:'오전 9시',tip:'벽돌 수로각',nameEn:'Nanzen-ji',nameJa:'南禅寺',catEn:'Palace',catJa:'古宮',tipEn:'Brick aqueduct',tipJa:'レンガ造りの水路閣',bestEn:'9AM',bestJa:'午前9時'},
  {id:206,city:'kyoto',region:'kyoto',name:'철학의 길',area:'교토 사쿄구',cat:'자연·공원',emoji:'🌸',lat:35.0229,lng:135.7958,base:25,peaks:[10,11,14,15],best:'벚꽃 시즌',tip:'사색의 산책로',nameEn:"Philosopher's Path",nameJa:'哲学の道',catEn:'Nature & Park',catJa:'自然・公園',tipEn:'Stroll for thought',tipJa:'思索の散歩道',bestEn:'Cherry blossom season',bestJa:'桜の季節'},
  {id:207,city:'kyoto',region:'kyoto',name:'헤이안 신궁',area:'교토 사쿄구',cat:'고궁',emoji:'⛩️',lat:35.0159,lng:135.7824,base:35,peaks:[11,12,14],best:'오전 11시',tip:'거대 토리이',nameEn:'Heian Shrine',nameJa:'平安神宮',catEn:'Palace',catJa:'古宮',tipEn:'Giant Torii',tipJa:'巨大な鳥居',bestEn:'11AM',bestJa:'午前11時'},
  {id:208,city:'kyoto',region:'kyoto',name:'교토 어소',area:'교토 카미교구',cat:'고궁',emoji:'🏯',lat:35.0232,lng:135.7620,base:20,peaks:[10,11,14],best:'예약 시간',tip:'황궁의 품격',nameEn:'Kyoto Imperial Palace',nameJa:'京都御所',catEn:'Palace',catJa:'古宮',tipEn:'Elegance of palace',tipJa:'皇宮の品格',bestEn:'Reserved time',bestJa:'予約時間'},
  {id:209,city:'kyoto',region:'kyoto',name:'청수사(재복사)',area:'교토 사쿄구',cat:'고궁',emoji:'🍃',lat:35.0268,lng:135.7983,base:40,peaks:[11,12,13,14],best:'오후 2시',tip:'모래 정원',nameEn:'Ryoan-ji',nameJa:'龍安寺',catEn:'Palace',catJa:'古宮',tipEn:'Rock garden',tipJa:'石庭',bestEn:'2PM',bestJa:'午後2時'},
];

window.RouteStore = {
  ROUTE_KEY: 'travel_route',
  getRoute() {
    return JSON.parse(localStorage.getItem(this.ROUTE_KEY) || '[]');
  },
  addSpot(spotId) {
    let route = this.getRoute();
    if (!route.includes(spotId)) {
      route.push(spotId);
      localStorage.setItem(this.ROUTE_KEY, JSON.stringify(route));
      this.updateCartUI();
    }
  },
  removeSpot(spotId) {
    let route = this.getRoute();
    route = route.filter(id => id !== spotId);
    localStorage.setItem(this.ROUTE_KEY, JSON.stringify(route));
    this.updateCartUI();
  },
  clearRoute() {
    localStorage.removeItem(this.ROUTE_KEY);
    this.updateCartUI();
  },
  updateCartUI() {
    let route = this.getRoute();
    let badge = document.getElementById('route-badge');
    if(!badge) {
       badge = document.createElement('div');
       badge.id = 'route-badge';
       badge.style.position = 'fixed';
       badge.style.bottom = '30px';
       badge.style.right = '30px';
       badge.style.background = 'var(--primary-color, #ff385c)';
       badge.style.color = '#fff';
       badge.style.padding = '12px 20px';
       badge.style.borderRadius = '30px';
       badge.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
       badge.style.cursor = 'pointer';
       badge.style.zIndex = '9999';
       badge.style.fontWeight = '700';
       badge.style.display = 'flex';
       badge.style.alignItems = 'center';
       badge.style.gap = '8px';
       badge.style.transition = 'transform 0.2s';
       badge.onclick = () => window.location.href = 'route.html';
       
       badge.onmouseenter = () => badge.style.transform = 'scale(1.05)';
       badge.onmouseleave = () => badge.style.transform = 'scale(1)';
       
       document.body.appendChild(badge);
    }
    
    if(route.length > 0) {
      badge.style.display = 'flex';
      badge.innerHTML = `<span style="font-size:1.2rem;">🗺️</span> ${window.t('route.badge', '여행 루트')} <span style="background:#fff;color:#ff385c;border-radius:50%;padding:2px 8px;font-size:0.9rem;">${route.length}</span>`;
    } else {
      badge.style.display = 'none';
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
    window.RouteStore.updateCartUI();
});
