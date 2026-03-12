// Mock restaurant data for each spot
// Includes rating, reviews, placeUrl, and multi-lingual names

const RESTAURANT_DATA = {
    // 0: Hongdae Street
    "0": [
        { id: "h01", rating: 4.8, reviews: 3500, placeUrl: "https://www.google.com/maps/search/윤씨밀방+홍대", names: { ko: "윤씨밀방", en: "Yoon's Millbang", ja: "ユン氏密房" } },
        { id: "h02", rating: 4.6, reviews: 2900, placeUrl: "https://www.google.com/maps/search/칸다소바+홍대점", names: { ko: "칸다소바 홍대점", en: "Kanda Soba Hongdae", ja: "神田そば 弘大店" } },
        { id: "h03", rating: 4.5, reviews: 2100, placeUrl: "https://www.google.com/maps/search/바다회사랑", names: { ko: "바다회사랑", en: "Bada Hoe Sarang", ja: "海を愛する刺身屋" } },
        { id: "h04", rating: 4.7, reviews: 4200, placeUrl: "https://www.google.com/maps/search/또보겠지떡볶이집", names: { ko: "또보겠지떡볶이집", en: "Ttobogetji Tteokbokki", ja: "トボゲッチトッポッキ" } },
        { id: "h05", rating: 4.4, reviews: 1800, placeUrl: "https://www.google.com/maps/search/우와+홍대본점", names: { ko: "우와 홍대본점", en: "Woowa Hongdae", ja: "ウワ 弘大本店" } },
        { id: "h06", rating: 4.3, reviews: 5200, placeUrl: "https://www.google.com/maps/search/홍대조폭떡볶이", names: { ko: "홍대조폭떡볶이", en: "Hongdae Jopok Tteokbokki", ja: "弘大暴力組織トッポッキ" } },
        { id: "h07", rating: 4.5, reviews: 1540, placeUrl: "https://www.google.com/maps/search/테일러커피+홍대", names: { ko: "테일러커피", en: "Tailor Coffee", ja: "テイラー・コーヒー" } },
        { id: "h08", rating: 4.2, reviews: 890,  placeUrl: "https://www.google.com/maps/search/신미경홍대닭갈비", names: { ko: "신미경홍대닭갈비", en: "Shin Mi Kyung Dakgalbi", ja: "シン・ミギョン弘大タッカルビ" } },
        { id: "h09", rating: 4.6, reviews: 3100, placeUrl: "https://www.google.com/maps/search/교동짬뽕+홍대", names: { ko: "교동짬뽕", en: "Gyodong Jjamppong", ja: "校洞ちゃんぽん" } },
        { id: "h10", rating: 4.4, reviews: 1450, placeUrl: "https://www.google.com/maps/search/소년식당+홍대", names: { ko: "소년식당", en: "Boy's Diner", ja: "少年食堂" } },
        { id: "h11", rating: 4.5, reviews: 2600, placeUrl: "https://www.google.com/maps/search/무라+홍대", names: { ko: "무라", en: "Mura", ja: "ムラ" } },
        { id: "h12", rating: 4.3, reviews: 1900, placeUrl: "https://www.google.com/maps/search/돈수백+홍대", names: { ko: "돈수백", en: "Donsoobaek", ja: "豚寿百" } },
        { id: "h13", rating: 4.7, reviews: 980,  placeUrl: "https://www.google.com/maps/search/카미야+홍대", names: { ko: "카미야", en: "Kamiya", ja: "神谷" } },
        { id: "h14", rating: 4.2, reviews: 1100, placeUrl: "https://www.google.com/maps/search/혼카츠+홍대", names: { ko: "혼카츠", en: "Honkatsu", ja: "ホンカツ" } },
        { id: "h15", rating: 4.5, reviews: 2300, placeUrl: "https://www.google.com/maps/search/감성타코+홍대", names: { ko: "감성타코", en: "Gamsung Taco", ja: "感性タコス" } },
        { id: "h16", rating: 4.4, reviews: 3200, placeUrl: "https://www.google.com/maps/search/홍스쭈꾸미+홍대본점", names: { ko: "홍스쭈꾸미", en: "Hongs Jjuggumi", ja: "ホンスチュクミ" } },
        { id: "h17", rating: 4.1, reviews: 1400, placeUrl: "https://www.google.com/maps/search/비트포비아+홍대", names: { ko: "푸하하크림빵", en: "Fuhaha Cream Bread", ja: "プハハクリームパン" } }, // Used another name as requested for a food spot
        { id: "h18", rating: 4.6, reviews: 2900, placeUrl: "https://www.google.com/maps/search/하카타분코+홍대", names: { ko: "하카타분코", en: "Hakata Bunko", ja: "博多文庫" } },
        { id: "h19", rating: 4.3, reviews: 1600, placeUrl: "https://www.google.com/maps/search/마늘떡볶이+홍대", names: { ko: "마늘떡볶이", en: "Garlic Tteokbokki", ja: "ニンニクトッポッキ" } },
        { id: "h20", rating: 4.5, reviews: 1150, placeUrl: "https://www.google.com/maps/search/피자보이즈+홍대", names: { ko: "피자보이즈", en: "Pizza Boys", ja: "ピザボーイズ" } },
        { id: "h21", rating: 3.8, reviews: 400,  placeUrl: "https://www.google.com/maps/search/홍대+랜덤식당", names: { ko: "랜덤식당", en: "Random Diner", ja: "ランダム食堂" } }, // Will be filtered out
    ],
    // 10: Hallasan
    "10": [
        { id: "j01", rating: 4.6, reviews: 8500, placeUrl: "https://www.google.com/maps/search/우진해장국", names: { ko: "우진해장국", en: "Woojin Haejangguk", ja: "ウジンヘジャンクク" } },
        { id: "j02", rating: 4.5, reviews: 7100, placeUrl: "https://www.google.com/maps/search/자매국수", names: { ko: "자매국수", en: "Jamae Noodle", ja: "姉妹ククス" } },
        { id: "j03", rating: 4.7, reviews: 4300, placeUrl: "https://www.google.com/maps/search/은희네해장국+본점", names: { ko: "은희네해장국 본점", en: "Eunhui-ne Haejangguk", ja: "ウンヒネヘジャンクク 本店" } },
        { id: "j04", rating: 4.4, reviews: 5200, placeUrl: "https://www.google.com/maps/search/늘봄흑돼지", names: { ko: "늘봄흑돼지", en: "Neulbom Black Pork", ja: "ヌルボム黒豚" } },
        { id: "j05", rating: 4.3, reviews: 6800, placeUrl: "https://www.google.com/maps/search/흑돈가+제주본점", names: { ko: "흑돈가 제주본점", en: "Heukdonga Jeju", ja: "黒豚家 済州本店" } },
        { id: "j06", rating: 4.5, reviews: 3100, placeUrl: "https://www.google.com/maps/search/명진전복", names: { ko: "명진전복", en: "Myeongjin Abalone", ja: "ミョンジンアワビ" } },
        { id: "j07", rating: 4.2, reviews: 4100, placeUrl: "https://www.google.com/maps/search/올래국수", names: { ko: "올래국수", en: "Olle Noodle", ja: "オルレククス" } },
        { id: "j08", rating: 4.6, reviews: 2900, placeUrl: "https://www.google.com/maps/search/춘심이네+본점", names: { ko: "춘심이네 본점", en: "Chunsim-ine", ja: "チュンシミネ 本店" } },
        { id: "j09", rating: 4.4, reviews: 1500, placeUrl: "https://www.google.com/maps/search/산방식당", names: { ko: "산방식당", en: "Sanbang Diner", ja: "山房食堂" } },
        { id: "j10", rating: 4.5, reviews: 2600, placeUrl: "https://www.google.com/maps/search/돈사돈+본점", names: { ko: "돈사돈 본점", en: "Donsadon", ja: "トンサドン 本店" } },
        { id: "j11", rating: 4.3, reviews: 1800, placeUrl: "https://www.google.com/maps/search/맛나식당", names: { ko: "맛나식당", en: "Matna Diner", ja: "マンナ食堂" } },
        { id: "j12", rating: 4.7, reviews: 1200, placeUrl: "https://www.google.com/maps/search/숙성도+노형본점", names: { ko: "숙성도 노형본점", en: "Sukseongdo", ja: "熟成肉 老衡本店" } },
        { id: "j13", rating: 4.2, reviews: 900,  placeUrl: "https://www.google.com/maps/search/가시아방국수", names: { ko: "가시아방국수", en: "Gasiabang Noodle", ja: "カシアバンククス" } },
        { id: "j14", rating: 4.5, reviews: 3300, placeUrl: "https://www.google.com/maps/search/연돈", names: { ko: "연돈", en: "Yeondon", ja: "ヨンドン" } },
        { id: "j15", rating: 4.4, reviews: 2100, placeUrl: "https://www.google.com/maps/search/다가미김밥", names: { ko: "다가미김밥", en: "Dagami Gimbap", ja: "ダガミキンパ" } },
        { id: "j16", rating: 4.6, reviews: 1400, placeUrl: "https://www.google.com/maps/search/순옥이네명가", names: { ko: "순옥이네명가", en: "Sunok-ine", ja: "スノキネ名家" } },
        { id: "j17", rating: 4.3, reviews: 2800, placeUrl: "https://www.google.com/maps/search/미향해장국", names: { ko: "미향해장국", en: "Mihyang Haejangguk", ja: "ミヒャンヘジャンクク" } },
        { id: "j18", rating: 4.5, reviews: 1900, placeUrl: "https://www.google.com/maps/search/오는정김밥", names: { ko: "오는정김밥", en: "Oneunjeong Gimbap", ja: "オヌンジョンキンパ" } },
        { id: "j19", rating: 4.2, reviews: 1700, placeUrl: "https://www.google.com/maps/search/삼성혈해물탕", names: { ko: "삼성혈해물탕", en: "Samseonghyeol Seafood", ja: "三姓穴ヘムルタン" } },
        { id: "j20", rating: 4.4, reviews: 2500, placeUrl: "https://www.google.com/maps/search/제주분식", names: { ko: "제주분식", en: "Jeju Bunsik", ja: "済州粉食" } },
        { id: "j21", rating: 3.5, reviews: 300,  placeUrl: "https://www.google.com/maps/search/평범한+식당", names: { ko: "평범한 식당", en: "Average Diner", ja: "普通の食堂" } }, // Will be filtered out
    ],
    // 20: Dotonbori
    "20": [
        { id: "o01", rating: 4.5, reviews: 14500, placeUrl: "https://www.google.com/maps/search/Ichiran+Dotonbori", names: { ko: "이치란 도톤보리점 본관", en: "Ichiran Dotonbori", ja: "一蘭 道頓堀店本館" } },
        { id: "o02", rating: 4.3, reviews: 9200,  placeUrl: "https://www.google.com/maps/search/Kani+Doraku+Dotonbori", names: { ko: "카니도라쿠 도톤보리 본점", en: "Kani Doraku Honten", ja: "かに道楽 道頓堀本店" } },
        { id: "o03", rating: 4.4, reviews: 7600,  placeUrl: "https://www.google.com/maps/search/Kushikatsu+Daruma", names: { ko: "쿠시카츠 다루마", en: "Kushikatsu Daruma", ja: "串かつだるま" } },
        { id: "o04", rating: 4.6, reviews: 4800,  placeUrl: "https://www.google.com/maps/search/Mizuno+Okonomiyaki", names: { ko: "미즈노 (오코노미야키)", en: "Mizuno", ja: "美津の" } },
        { id: "o05", rating: 4.2, reviews: 8100,  placeUrl: "https://www.google.com/maps/search/Kinryu+Ramen+Honten", names: { ko: "킨류 라멘 본점", en: "Kinryu Ramen Honten", ja: "金龍ラーメン 本店" } },
        { id: "o06", rating: 4.5, reviews: 3200,  placeUrl: "https://www.google.com/maps/search/Kukuru+Takoyaki", names: { ko: "쿠쿠루 도톤보리 본점", en: "Kukuru Takoyaki", ja: "たこ家道頓堀くくる 本店" } },
        { id: "o07", rating: 4.4, reviews: 5400,  placeUrl: "https://www.google.com/maps/search/Chibo+Dotonbori", names: { ko: "치보 도톤보리 빌딩점", en: "Chibo Dotonbori", ja: "千房 道頓堀ビル店" } },
        { id: "o08", rating: 4.7, reviews: 2900,  placeUrl: "https://www.google.com/maps/search/Matsusakagyu+Yakiniku+M", names: { ko: "마쓰사카규 야키니쿠 M", en: "Matsusakagyu Yakiniku M", ja: "松阪牛焼肉 M" } },
        { id: "o09", rating: 4.3, reviews: 4100,  placeUrl: "https://www.google.com/maps/search/Zuboraya+Dotonbori", names: { ko: "즈보라야 (복어)", en: "Zuboraya", ja: "づぼらや" } },
        { id: "o10", rating: 4.5, reviews: 6200,  placeUrl: "https://www.google.com/maps/search/Kamukura+Dotonbori", names: { ko: "카무쿠라 도톤보리점", en: "Kamukura", ja: "神座 道頓堀店" } },
        { id: "o11", rating: 4.6, reviews: 1800,  placeUrl: "https://www.google.com/maps/search/Hariju+Dotonbori", names: { ko: "하리쥬 (스키야키)", en: "Hariju", ja: "はり重" } },
        { id: "o12", rating: 4.4, reviews: 3700,  placeUrl: "https://www.google.com/maps/search/Ganko+Sushi+Dotonbori", names: { ko: "간코 스시 도톤보리점", en: "Ganko Sushi", ja: "がんこ寿司 道頓堀店" } },
        { id: "o13", rating: 4.2, reviews: 2500,  placeUrl: "https://www.google.com/maps/search/Acchichi+Honpo", names: { ko: "앗치치혼포 도톤보리점", en: "Acchichi Honpo", ja: "あっちち本舗" } },
        { id: "o14", rating: 4.5, reviews: 1400,  placeUrl: "https://www.google.com/maps/search/Crepes+de+cocorico", names: { ko: "크레페 드 코코리코", en: "Crepes de cocorico", ja: "クレープ・ド・ココリコ" } },
        { id: "o15", rating: 4.3, reviews: 3100,  placeUrl: "https://www.google.com/maps/search/Rikuro+Ojisan", names: { ko: "리쿠로 오지산의 가게", en: "Rikuro Ojisan no Mise", ja: "りくろーおじさんの店" } },
        { id: "o16", rating: 4.7, reviews: 2100,  placeUrl: "https://www.google.com/maps/search/Hokkyokusei+Shinsaibashi", names: { ko: "홋쿄쿠세이 (오므라이스)", en: "Hokkyokusei", ja: "北極星 心斎橋本店" } },
        { id: "o17", rating: 4.4, reviews: 4500,  placeUrl: "https://www.google.com/maps/search/Pablos+Cheese+Tart", names: { ko: "파블로 치즈타르트", en: "Pablo", ja: "パブロ" } },
        { id: "o18", rating: 4.6, reviews: 1200,  placeUrl: "https://www.google.com/maps/search/Tsurutontan+Soji", names: { ko: "츠루동탄 소에몬초점", en: "Tsurutontan", ja: "つるとんたん 宗右衛門町店" } },
        { id: "o19", rating: 4.2, reviews: 2800,  placeUrl: "https://www.google.com/maps/search/Genrokusushi+Dotonbori", names: { ko: "겐로쿠스시 도톤보리점", en: "Genroku Sushi", ja: "元禄寿司 道頓堀店" } },
        { id: "o20", rating: 4.5, reviews: 1900,  placeUrl: "https://www.google.com/maps/search/Daruma+Honten", names: { ko: "다루마 신세카이 본점", en: "Daruma Honten", ja: "だるま 新世界本店" } },
        { id: "o21", rating: 3.9, reviews: 500,   placeUrl: "https://www.google.com/maps/search/Dotonbori+Fast+Food", names: { ko: "일반 패스트푸드", en: "General Fast Food", ja: "一般ファーストフード" } }, // Will be filtered out
    ]
};

// Expose to window for the main restaurants script to use
window.RESTAURANT_DATA = RESTAURANT_DATA;
