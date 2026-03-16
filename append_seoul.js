const fs = require('fs');
const blogsPath = './data/blogs.json';
const existingBlogs = JSON.parse(fs.readFileSync(blogsPath, 'utf8'));

const newBlogs = [
    {
        "id": "blog-bukchon-ko",
        "spotId": 5,
        "lang": "ko",
        "title": "북촌 한옥마을 완벽 가이드 — 인생 사진 명당 8곳과 사람 없는 시간 공략법",
        "content": [
            {
                "type": "text",
                "value": "경복궁과 창덕궁 사이, 900여 채의 한옥이 살아 숨 쉬는 공간. 북촌은 서울에서 가장 한국적인 풍경을 품은 곳입니다.\n\n### **인생 사진 핵심 포인트**\n북촌 3경(가회동 계단 골목)이 가장 유명하지만 이른 아침이 아니면 사람이 가득합니다. 북촌 2경(원서동 공방길)과 북촌 6경(가회동 골목 전경)은 상대적으로 여유롭고 사진이 더 아름답게 나옵니다.\n\n### **사람 없는 타이밍**\n평일 오전 9시 이전이 최고입니다. 주말 낮은 항상 붐빕니다.\n\n### **반드시 지킬 것**\n가회동 11번지 일대는 주민 생활 보호 정숙 구역입니다. 소음 자제, 쓰레기 투기 금지는 기본 매너입니다.\n\n### **기본 정보**\n위치: 서울 종로구 가회동·계동길 일대 / 교통: 지하철 3호선 안국역 2번 출구 도보 10분 / 입장료: 무료"
            }
        ],
        "author": "Admin",
        "createdAt": "2026-03-16"
    },
    {
        "id": "blog-bukchon-en",
        "spotId": 5,
        "lang": "en",
        "title": "Bukchon Hanok Village Guide — Best Photo Spots & How to Visit Without the Crowds",
        "content": [
            {
                "type": "text",
                "value": "Nestled between Gyeongbokgung and Changdeokgung Palaces, Bukchon Hanok Village preserves around 900 traditional Korean houses (hanok) in the heart of modern Seoul — a living cultural heritage that's absolutely unmissable.\n\n### **Best Photo Spots**\nBukchon View #3 (Gahoe-dong Stairway Alley) is the most famous, but crowded unless you arrive early. Views #2 (Wonseo-dong Craft Alley) and #6 (Gahoe-dong Panoramic Alley) offer more breathing room and equally stunning shots.\n\n### **Avoiding the Crowds**\nWeekday mornings before 9 AM are ideal. Weekend afternoons are always packed.\n\n### **Please Respect**\nThe area near Gahoe-dong No. 11 is a designated quiet zone to protect residents' daily lives. Keep noise low and take your rubbish with you.\n\n### **Essential Info**\nLocation: Gahoe-dong / Gye-dong, Jongno-gu, Seoul / Access: Subway Line 3 — Anguk Station, Exit 2 (10-min walk) / Admission: Free"
            }
        ],
        "author": "Admin",
        "createdAt": "2026-03-16"
    },
    {
        "id": "blog-bukchon-ja",
        "spotId": 5,
        "lang": "ja",
        "title": "北村韓屋村完全ガイド — インスタ映え絶景8選・人の少ない時間帯攻略法",
        "content": [
            {
                "type": "text",
                "value": "景福宮と昌徳宮の間に広がる、約900棟の韓屋（ハノク）が現役で使われている空間. 北村は現代ソウルの中心部で最も「韓国らしい」風景を体験できる場所です.\n\n### **フォトスポット厳선ポイント**\n北村3경（嘉会洞の階段路地）は最も有名ですが, 早朝以外は人でいっぱい. 2경（院西洞の工房通り）と6경（嘉会洞の街並みパノラマ）は比較的空いていて, より美しい写真が撮れます.\n\n### **人の少ない時間帯**\n平日の午前9시前がベスト. 週末の昼間は常に混雑しています.\n\n### **必ず守ること**\n嘉会洞11번지周辺은住民保護のための静粛区域です. 騒音を避け, ゴミは持ち帰りましょう.\n\n### **基本情報**\n場所：ソウル市鍾路区嘉会洞・桂洞通り一帯 / アクセス：地下鉄3号線 安国駅2번出口 徒歩10分 / 入場料：無料"
            }
        ],
        "author": "Admin",
        "createdAt": "2026-03-16"
    },
    {
        "id": "blog-ddp-ko",
        "spotId": 6,
        "lang": "ko",
        "title": "동대문 DDP 완벽 가이드 — 자하 하디드의 건축 걸작과 LED 야경 즐기는 법",
        "content": [
            {
                "type": "text",
                "value": "밤이면 서울에서 가장 비현실적인 풍경이 펼쳐지는 곳, 동대문 DDP. 세계적 건축가 자하 하디드가 설계한 45,133장의 알루미늄 패널로 이루어진 이 건물은 어느 각도에서 봐도 완전히 다른 형태를 보여줍니다.\n\n### **낮과 밤, 완전히 다른 DDP**\n낮에는 알림터 전시관과 디자인 박물관을 탐방하고, 무료 개방된 옥상 '디자인 둘레길'을 걸어보세요. 밤에는 건물 조명이 켜지는 일몰 후가 골든 타임입니다. 봄 시즌 LED 장미 정원은 서울 야간 명소 중 단연 최고입니다.\n\n### **꿀팁**\n청계천 건너 오간수교 위에서 찍는 DDP 사진이 숨은 명당입니다. 바로 옆 동대문 쇼핑 타운과 광장시장을 함께 묶으면 하루 코스가 완성됩니다.\n\n### **기본 정보**\n위치: 서울 중구 을지로 281 / 교통: 지하철 2·4·5호선 동대문역사문화공원역 1번 출구 직결 / 외부 관람: 무료"
            }
        ],
        "author": "Admin",
        "createdAt": "2026-03-16"
    },
    {
        "id": "blog-ddp-en",
        "spotId": 6,
        "lang": "en",
        "title": "Dongdaemun DDP Guide — Zaha Hadid's Masterpiece & Seoul's Best LED Night Experience",
        "content": [
            {
                "type": "text",
                "value": "The Dongdaemun Design Plaza (DDP) is one of the most architecturally stunning buildings in all of Asia. Designed by the late Zaha Hadid, its fluid, organic form is covered in 45,133 aluminum panels — no two exactly alike — creating a shape that looks completely different from every angle.\n\n### **Day vs Night — Two Completely Different Experiences**\nBy day, explore the Alrim exhibition halls and Design Museum inside, or walk the free rooftop \"Design Trail\" connecting to the Dongdaemun shopping district. After sunset, the building transforms under dramatic lighting — the spring LED Rose Garden installation is one of Seoul's most spectacular nighttime events.\n\n### **Hidden Gem Photo Spot**\nCross to Ogansugyo Bridge over Cheonggyecheon Stream for the best full-frame DDP shot. Pair your visit with Gwangjang Market (food) and Doota Mall (shopping) next door.\n\n### **Essential Info**\nLocation: 281 Euljiro, Jung-gu, Seoul / Access: Subway Lines 2/4/5 — DDP Station, Exit 1 (direct) / Outdoor viewing: Free"
            }
        ],
        "author": "Admin",
        "createdAt": "2026-03-16"
    },
    {
        "id": "blog-ddp-ja",
        "spotId": 6,
        "lang": "ja",
        "title": "東大門DDP完全ガイド — ザハ・ハ디드の建築傑作とLED夜景の楽しみ方",
        "content": [
            {
                "type": "text",
                "value": "夜になるとソウルで最も非現実的な光景が広がる場所, 東大門DDP（東大門デザインプラザ）. 世界的建築家ザハ・ハディドが設計したこの建物は, 45,133枚のアルミニウムパネルで覆われ, どの角度から見ても全く異なる形を見せます.\n\n### **昼と夜で全く違うDDP**\n昼間は展示館とデザイン博物館を見学し, 無料開放の屋上「デザイン散策路」を歩いてみましょう. 夜は日没後の建物イルミネーションがゴール덴타임. 春シーズンのLEDバラ庭園はソウルの夜間スポット中, 最高の評判を誇ります.\n\n### **隠れた撮影スポット**\n清渓川の烏干水橋からDDPを撮るアングルが穴場です. 隣接する東大門ショッピングタウンと広蔵市場とセットにすれば, 1日コース完成.\n\n### **基本정보**\n場所：ソウル市中区乙支路281 / アクセス：地下철2・4・5号線 東大門歴史文化公園駅1番出口直結 / 外観見学：無料"
            }
        ],
        "author": "Admin",
        "createdAt": "2026-03-16"
    },
    {
        "id": "blog-insadong-ko",
        "spotId": 7,
        "lang": "ko",
        "title": "인사동 완벽 가이드 — 쌈지길·전통 공예·길거리 먹거리 실전 코스",
        "content": [
            {
                "type": "text",
                "value": "조선 시대부터 이어진 문화의 거리, 인사동. 갤러리, 전통 찻집, 공예품 숍이 가득한 이 거리는 서울에서 가장 '한국다운' 하루를 보낼 수 있는 곳입니다.\n\n### **꼭 들러야 할 쌈지길**\n인사동 메인 거리의 작은 입구로 들어가면 나선형 4층 건물인 쌈지길이 펼쳐집니다. 작가들의 핸드메이드 작품과 독창적인 소품을 구입할 수 있는 인사동 최고의 숨은 공간입니다.\n\n### **기념품 고르는 법**\n'메이드 인 차이나' 제품을 피하려면 쌈지길 내부 공방이나 전통 공예 인증 스티커가 붙은 가게를 이용하세요.\n\n### **길거리 먹거리 순서**\n꿀타래(실 솜사탕) → 전통 한과 → 씨앗 호떡 순서로 즐기면 인사동 먹거리 완성.\n\n### **기본 정보**\n위치: 서울 종로구 인사동길 일대 / 교통: 지하철 3호선 안국역 6번 출구 도보 5분 / 주말 차 없는 거리: 토·일 오전 10시~오후 10시"
            }
        ],
        "author": "Admin",
        "createdAt": "2026-03-16"
    },
    {
        "id": "blog-insadong-en",
        "spotId": 7,
        "lang": "en",
        "title": "Insadong Complete Guide — Ssamziegil, Traditional Crafts & Street Food Route",
        "content": [
            {
                "type": "text",
                "value": "Insadong has been Seoul's cultural street since the Joseon era. Galleries, traditional tea houses, craft shops, and a uniquely Korean street atmosphere make it the perfect place to spend an authentically local afternoon.\n\n### **Don't Miss Ssamziegil**\nLook for a small entrance along the main Insadong street — it leads into Ssamziegil, a spiral four-floor complex full of handmade crafts, artist studios, and independent cafes. It's the best-kept gem of the entire district.\n\n### **Authentic Souvenir Shopping**\nAvoid mass-produced items by sticking to craft workshops inside Ssamziegil or shops displaying traditional craft certification stickers.\n\n### **Street Food Order**\nKkultarae (honey comb candy) → Traditional Korean rice snacks (hangwa) → Ssiat hotteok (seed-filled pancake). That's Insadong street food done right.\n\n### **Essential Info**\nLocation: Insadong-gil, Jongno-gu, Seoul / Access: Subway Line 3 — Anguk Station, Exit 6 (5-min walk) / Car-free street: Weekends 10 AM–10 PM"
            }
        ],
        "author": "Admin",
        "createdAt": "2026-03-16"
    },
    {
        "id": "blog-insadong-ja",
        "spotId": 7,
        "lang": "ja",
        "title": "仁寺洞完全ガイド — サムジキル・伝統工芸・屋台グルメ実践コース",
        "content": [
            {
                "type": "text",
                "value": "朝鮮時代から続く文化の通り, 仁寺洞（インサドン）. ギャラリー, 伝統茶房, 工芸品ショップが並ぶこの通りは, ソウルで最も「韓国らしい」1日を過ごせる場所です.\n\n### **必訪スポット：サムジキル**\n仁寺洞メイン通りにある小さな入口を入ると, 螺旋状の4階建て建物「サム지길（쌈지길）」が現れます. アーティストのハンドメイド作品や独創적인小物が揃う, 仁寺洞最高の隠れ名所です.\n\n### **お土産選び의コツ**\n中国製品を避けたいなら, サムジキル内の工房か, 伝統工芸認証シールが貼られた店舗を選びましょう.\n\n### **屋台グルメ의順番**\nクルタレ（糸飴）→ 伝統韓菓 → シアットホットク（種入りのお焼き）. この順番で仁寺洞グルメ完全制覇.\n\n### **基本情報**\n場所：ソウル市鍾路区仁寺洞ギル一帯 / アクセ스：地下철3号線 安국역6番出口 徒歩5분 / 週末歩行者天国：土・日 午前10時〜午後10時"
            }
        ],
        "author": "Admin",
        "createdAt": "2026-03-16"
    }
];

fs.writeFileSync(blogsPath, JSON.stringify([...existingBlogs, ...newBlogs], null, 4));
console.log('Successfully appended 9 Seoul blogs.');
