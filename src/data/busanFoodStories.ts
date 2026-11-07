import { LocalizedString } from '@/types';

/**
 * Per food: a one-line joke shown on the match card, and a short history (the "TMI") shown with the
 * results. Origin stories that are folklore rather than record are told as "people say" / "one story".
 */
export interface BusanFoodStory {
  quip: LocalizedString;
  story: LocalizedString;
}

const s = (quip: [string, string, string, string, string], story: [string, string, string, string, string]): BusanFoodStory => ({
  quip: { ko: quip[0], en: quip[1], ja: quip[2], 'zh-cn': quip[3], 'zh-tw': quip[4] },
  story: { ko: story[0], en: story[1], ja: story[2], 'zh-cn': story[3], 'zh-tw': story[4] },
});

export const BUSAN_FOOD_STORIES: Record<string, BusanFoodStory> = {
  'dwaeji-gukbap': s(
    [
      '부산 사람 혈관엔 국물이 흐른다는 소문이…',
      'Rumor has it Busan people have broth in their veins…',
      '釜山の人の血管にはスープが流れているという噂が…',
      '传说釜山人的血管里流的是汤…',
      '傳說釜山人的血管裡流的是湯…',
    ],
    [
      '한국전쟁 때 부산으로 피란 온 사람들이 구하기 쉬운 돼지뼈로 국을 끓여 먹던 데서 시작됐다는 이야기가 유명해요. 새우젓으로 간을 맞추는 게 부산식!',
      'A popular story says it began during the Korean War, when refugees in Busan boiled cheap pork bones into soup. Seasoning it yourself with salted shrimp is the Busan way!',
      '朝鮮戦争のとき釜山へ避難してきた人々が、手に入りやすい豚骨でスープを作ったのが始まりという話が有名。アミの塩辛で味を調えるのが釜山流！',
      '据说起源于朝鲜战争时期，逃难到釜山的人们用容易买到的猪骨熬汤。用虾酱自己调味才是釜山吃法！',
      '據說起源於韓戰時期，逃難到釜山的人們用容易買到的豬骨熬湯。用蝦醬自己調味才是釜山吃法！',
    ]
  ),
  milmyeon: s(
    [
      '냉면인 척하는 100% 부산 토박이',
      'Pretends to be naengmyeon, 100% Busan local',
      '冷麺のふりをした生粋の釜山っ子',
      '假装是冷面的百分百釜山土著',
      '假裝是冷麵的百分百釜山土著',
    ],
    [
      '한국전쟁 때 북쪽에서 온 피란민들이 고향의 냉면이 그리웠지만 메밀이 귀해서, 구호물자로 받은 밀가루로 면을 뽑은 게 밀면의 시작이에요.',
      'Refugees from the North missed their buckwheat cold noodles during the Korean War, but buckwheat was scarce, so they made the noodles from relief-aid wheat flour. That became milmyeon.',
      '朝鮮戦争で北から避難してきた人々が故郷の冷麺を懐かしんだものの、そば粉が手に入らず、救援物資の小麦粉で麺を作ったのがミルミョンの始まり。',
      '朝鲜战争时，从北方逃难来的人们怀念家乡的冷面，但荞麦难求，于是用救济物资的面粉做面，这就是小麦冷面的由来。',
      '韓戰時，從北方逃難來的人們懷念家鄉的冷麵，但蕎麥難求，於是用救濟物資的麵粉做麵，這就是小麥冷麵的由來。',
    ]
  ),
  'jogae-gui': s(
    [
      '조개가 입 벌리는 순간 = 집게 전쟁 시작',
      'The second a clam opens = the tong war begins',
      '貝が口を開けた瞬間 = トング戦争スタート',
      '贝壳一张嘴 = 夹子大战开始',
      '貝殼一張嘴 = 夾子大戰開始',
    ],
    [
      '청사포, 태종대 같은 부산 바닷가 포장마차의 대표 메뉴예요. 파도 소리 들으면서 연탄불에 구워 먹는 게 국룰, 마지막엔 치즈 올린 가리비가 하이라이트!',
      'The signature dish of seaside tents at Cheongsapo and Taejongdae. Grill them over charcoal to the sound of waves, and save the cheese-topped scallops for the grand finale!',
      '青沙浦や太宗台など釜山の海辺の屋台の定番。波の音を聞きながら練炭で焼くのがお約束、締めはチーズをのせたホタテ！',
      '青沙浦、太宗台等釜山海边大排档的招牌。听着海浪声用炭火烤是标配，最后的芝士扇贝才是高潮！',
      '青沙浦、太宗台等釜山海邊大排檔的招牌。聽著海浪聲用炭火烤是標配，最後的起司扇貝才是高潮！',
    ]
  ),
  nakgopsae: s(
    [
      '낙지·곱창·새우 어벤져스. 볶음밥이 진짜 본게임',
      'Octopus, tripe and shrimp assemble. The fried rice is the real main event',
      'タコ・ホルモン・エビのアベンジャーズ。本番は締めのポックンパ',
      '章鱼、牛肠、虾组成复仇者联盟，最后的炒饭才是正片',
      '章魚、牛腸、蝦組成復仇者聯盟，最後的炒飯才是正片',
    ],
    [
      '부산 범일동 옛 조선방직(조방) 앞 낙지볶음 골목에서 낙지에 곱창과 새우를 더하면서 생긴 조합이에요. 이름도 세 재료 앞 글자를 딴 거예요.',
      'Born in the spicy-octopus alley outside the old Joseon Textile mill ("Jobang") in Beomil-dong, where cooks added beef tripe and shrimp. The name takes the first syllable of each.',
      '釜山・凡一洞の旧朝鮮紡織（チョバン）前のナクチポックム通りで、タコにホルモンとエビを加えて生まれた組み合わせ。名前は3つの具材の頭文字から。',
      '诞生于釜山凡一洞旧朝鲜纺织（朝纺）门前的辣炒章鱼街，在章鱼里加入牛肠和虾。名字取自三种食材的第一个字。',
      '誕生於釜山凡一洞舊朝鮮紡織（朝紡）門前的辣炒章魚街，在章魚裡加入牛腸和蝦。名字取自三種食材的第一個字。',
    ]
  ),
  'lee-jae-mo-pizza': s(
    [
      '치즈 늘어나는 길이 = 부산 사랑의 길이',
      'How far the cheese stretches = how much Busan loves you',
      'チーズの伸びる長さ = 釜山の愛の深さ',
      '芝士拉丝的长度 = 釜山对你的爱',
      '起司牽絲的長度 = 釜山對你的愛',
    ],
    [
      '부산 남포동의 줄 서는 피자집이에요. 치즈를 아끼지 않는 두툼한 피자로 입소문이 나서, 이제는 "부산 가면 꼭 먹는 피자"가 됐어요.',
      'A Nampo-dong pizzeria with a line out the door. Word spread about its thick, cheese-loaded pies, and now it is "the pizza you must eat in Busan".',
      '釜山・南浦洞の行列ができるピザ屋。チーズをたっぷりのせた厚めのピザが口コミで広まり、今や「釜山に行ったら必ず食べるピザ」に。',
      '釜山南浦洞的排队披萨店。芝士给得毫不手软的厚披萨口口相传，如今成了"去釜山必吃的披萨"。',
      '釜山南浦洞的排隊披薩店。起司給得毫不手軟的厚披薩口耳相傳，如今成了「去釜山必吃的披薩」。',
    ]
  ),
  'kkomjangeo-gui': s(
    [
      '구우면 꼼지락거려서 꼼장어(라는 설). 소주 각',
      'Named for how it wriggles on the grill (supposedly). Soju time',
      '焼くとくねくね動くからコムジャンオ（という説）。焼酎確定',
      '据说因为烤的时候会扭来扭去而得名，烧酒走起',
      '據說因為烤的時候會扭來扭去而得名，燒酒走起',
    ],
    [
      '전쟁 뒤 먹장어 가죽은 지갑을 만드는 수출품이었고, 남은 살을 연탄불에 구워 먹으면서 자갈치 꼼장어 골목이 생겼다는 이야기가 전해져요.',
      'After the war, hagfish skin was exported to make wallets, and the story goes that people grilled the leftover meat over coal, giving birth to Jagalchi\'s hagfish alley.',
      '戦後、ヌタウナギの皮は財布用の輸出品で、残った身を練炭で焼いて食べたのがチャガルチのコムジャンオ横丁の始まりと伝えられています。',
      '战后盲鳗的皮是做钱包的出口品，据说人们把剩下的肉用炭火烤来吃，札嘎其的烤盲鳗街就此诞生。',
      '戰後盲鰻的皮是做錢包的出口品，據說人們把剩下的肉用炭火烤來吃，札嘎其的烤盲鰻街就此誕生。',
    ]
  ),
  'ssiat-hotteok': s(
    [
      '첫입에 꿀 조심. 진짜 뜨거움 주의',
      'Careful with the first bite. The syrup is lava',
      '一口目の蜜に注意。マジで熱い',
      '第一口小心糖浆，真的超烫',
      '第一口小心糖漿，真的超燙',
    ],
    [
      '남포동 BIFF 광장 노점에서 기름에 튀기듯 구운 호떡을 갈라 해바라기씨, 땅콩 같은 씨앗을 듬뿍 넣어 팔기 시작한 게 원조예요. 부산국제영화제 거리의 대표 간식!',
      'Street stalls at BIFF Square in Nampo-dong started splitting fried hotteok open and stuffing them with sunflower seeds and peanuts. Now it is the snack of the film-festival street!',
      '南浦洞BIFF広場の屋台で、揚げ焼きしたホットクを割ってヒマワリの種やピーナッツをたっぷり詰めたのが元祖。釜山国際映画祭通りの名物おやつ！',
      '起源于南浦洞BIFF广场的小摊，把煎炸的糖饼掰开，塞满葵花籽、花生等坚果。是釜山国际电影节街的招牌小吃！',
      '起源於南浦洞BIFF廣場的小攤，把煎炸的糖餅掰開，塞滿葵花籽、花生等堅果。是釜山國際影展街的招牌小吃！',
    ]
  ),
  'gijang-daege': s(
    [
      '다리 하나 발라 먹으면 말이 사라지는 음식',
      'Crack one leg and the whole table goes silent',
      '脚を1本ほじると会話が消える料理',
      '剥开一条腿，全桌瞬间安静',
      '剝開一條腿，全桌瞬間安靜',
    ],
    [
      '기장은 대게가 많이 잡히는 곳이라기보다 대게를 "먹으러 가는" 동네예요. 기장시장에 대게집이 줄지어 있어서 고르고 바로 쪄 먹을 수 있어요.',
      'Gijang is less where snow crab is caught and more where people go to eat it. Crab shops line Gijang Market: pick one and it is steamed on the spot.',
      '機張はズワイガニが獲れる町というより「食べに行く」町。機張市場にカニ屋が並び、選んですぐ蒸してもらえます。',
      '机张与其说是盛产雪蟹的地方，不如说是专门"去吃"雪蟹的地方。机张市场蟹店林立，挑好马上就能蒸。',
      '機張與其說是盛產雪蟹的地方，不如說是專門「去吃」雪蟹的地方。機張市場蟹店林立，挑好馬上就能蒸。',
    ]
  ),
  'busan-eomuk': s(
    [
      '꼬치 하나에 국물 무한 리필이 국룰',
      'One skewer, unlimited broth refills. That is the law',
      '串1本でスープおかわり無限がお約束',
      '一串鱼糕，汤无限续，这是规矩',
      '一串魚板，湯無限續，這是規矩',
    ],
    [
      '부산은 일제강점기부터 어묵 공장이 있던 어묵의 도시예요. 전쟁 뒤 부평시장(깡통시장) 일대에 어묵 가게가 몰리면서 "부산어묵"이라는 이름이 전국에 퍼졌어요.',
      'Busan has made fish cakes since the early 1900s. After the war, makers clustered around Bupyeong (Kkangtong) Market, and "Busan eomuk" became a name known nationwide.',
      '釜山は日本統治時代からオムク工場があったオムクの街。戦後、富平市場（カントン市場）周辺に店が集まり「釜山オムク」の名が全国に広まりました。',
      '釜山从日据时期起就有鱼糕工厂。战后鱼糕店聚集在富平市场（罐头市场）一带，"釜山鱼糕"从此闻名全国。',
      '釜山從日治時期起就有魚板工廠。戰後魚板店聚集在富平市場（罐頭市場）一帶，「釜山魚板」從此聞名全國。',
    ]
  ),
  'jagalchi-hoe': s(
    [
      '"오이소, 보이소, 사이소!" 들리면 이미 자갈치',
      'Hear "Come, look, buy!" and you are already at Jagalchi',
      '「オイソ、ボイソ、サイソ！」が聞こえたらもうチャガルチ',
      '听到"来看看、来买买！"就知道到札嘎其了',
      '聽到「來看看、來買買！」就知道到札嘎其了',
    ],
    [
      '자갈이 많던 바닷가에 생긴 시장이라 "자갈치"라는 이름이 붙었다는 설이 있어요. 1층에서 생선을 고르면 2층 식당에서 바로 회를 떠 줘요.',
      'One story says the name comes from the pebbles (jagal) on the old shore here. Pick your fish downstairs, and the restaurants upstairs slice it into sashimi on the spot.',
      '砂利（チャガル）の多い浜にできた市場だから「チャガルチ」という説も。1階で魚を選ぶと、2階の食堂ですぐ刺身にしてくれます。',
      '有一说是因为市场建在满是碎石（자갈）的海边而得名。在1楼挑好鱼，2楼餐厅马上切成生鱼片。',
      '有一說是因為市場建在滿是碎石（자갈）的海邊而得名。在1樓挑好魚，2樓餐廳馬上切成生魚片。',
    ]
  ),
  'bibim-dangmyeon': s(
    [
      '시장 플라스틱 의자에 앉아야 완성되는 맛',
      'Only tastes right on a market plastic stool',
      '市場のプラスチック椅子に座ってこそ完成する味',
      '必须坐在市场塑料凳上吃才对味',
      '必須坐在市場塑膠凳上吃才對味',
    ],
    [
      '부평 깡통시장 상인들이 바쁜 장사 중에 후루룩 먹던 한 그릇이에요. 깡통시장은 전쟁 뒤 미군 통조림(깡통)이 많이 팔려서 붙은 이름이에요.',
      'A quick bowl that busy traders at Bupyeong Kkangtong Market slurped between customers. "Kkangtong" means tin can: the market got its name from the US Army canned goods sold there after the war.',
      '富平カントン市場の商人たちが忙しい合間にすすった一杯。カントン（缶）市場の名は、戦後に米軍の缶詰がたくさん売られたことから。',
      '富平罐头市场的商贩们在忙碌中呼噜呼噜吃的一碗。罐头市场的名字来自战后这里大量出售的美军罐头。',
      '富平罐頭市場的商販們在忙碌中呼嚕呼嚕吃的一碗。罐頭市場的名字來自戰後這裡大量出售的美軍罐頭。',
    ]
  ),
  bokguk: s(
    [
      '어제 마신 술을 없던 일로 만들어 주는 국물',
      'The broth that makes last night\'s drinks never happen',
      '昨夜のお酒をなかったことにしてくれるスープ',
      '让昨晚的酒像没喝过一样的汤',
      '讓昨晚的酒像沒喝過一樣的湯',
    ],
    [
      '바다를 끼고 있는 부산엔 복어 요리 전문점이 일찍 자리 잡았어요. 미나리 듬뿍 넣고 맑게 끓인 복국(지리)은 부산 사람들의 대표 해장국이에요.',
      'With the sea at its door, Busan had pufferfish restaurants early on. A clear pufferfish soup loaded with water parsley is the city\'s go-to hangover cure.',
      '海に面した釜山にはフグ料理の専門店が早くから根付きました。セリたっぷりの澄んだフグ汁は釜山っ子の定番の二日酔いスープ。',
      '靠海的釜山很早就有河豚料理专门店。放满水芹菜的清汤河豚汤是釜山人的招牌解酒汤。',
      '靠海的釜山很早就有河豚料理專門店。放滿水芹菜的清湯河豚湯是釜山人的招牌解酒湯。',
    ]
  ),
  'naengchae-jokbal': s(
    [
      '코끝 찡한 겨자 소스 → 젓가락 직진',
      'Mustard hits your nose → chopsticks keep going',
      '鼻にツンとくるカラシ → 箸が止まらない',
      '芥末冲上鼻尖 → 筷子停不下来',
      '芥末衝上鼻尖 → 筷子停不下來',
    ],
    [
      '부산 부평동 족발골목에서 탄생한 부산식 족발이에요. 차갑게 썬 족발에 해파리, 오이, 새콤한 겨자 소스를 얹어서 여름에도 시원하게 먹어요.',
      'Busan-style pork trotters from the jokbal alley in Bupyeong-dong. Cold sliced trotters come with jellyfish, cucumber and a tangy mustard sauce: refreshing even in summer.',
      '釜山・富平洞の豚足横丁で生まれた釜山式チョッパル。冷たく切った豚足にクラゲ、キュウリ、甘酸っぱいカラシソースをのせて、夏でもさっぱり。',
      '诞生于釜山富平洞猪蹄街的釜山式猪蹄。冷切猪蹄配上海蜇、黄瓜和酸甜芥末酱，夏天吃也很清爽。',
      '誕生於釜山富平洞豬腳街的釜山式豬腳。冷切豬腳配上海蜇、小黃瓜和酸甜芥末醬，夏天吃也很清爽。',
    ]
  ),
  multteok: s(
    [
      '다른 지역: "물떡이 뭐야?" 부산: (할 말을 잃음)',
      'Rest of Korea: "What is multteok?" Busan: (speechless)',
      '他の地域「ムルトッて何？」釜山「（絶句）」',
      '外地人："汤年糕是什么？" 釜山人：（无语）',
      '外地人：「湯年糕是什麼？」釜山人：（無語）',
    ],
    [
      '부산 어묵 노점에서 어묵 국물 속에 가래떡 꼬치를 꽂아 두고 같이 끓여 팔던 게 시작이에요. 국물이 푹 배어 말랑해진 떡이 별미!',
      'Busan fish-cake stalls started dropping skewers of rice cake into the fish-cake broth. Soaked soft in that broth, they became a treat of their own!',
      '釜山のオムク屋台で、オムクのスープに棒餅の串を入れて一緒に煮たのが始まり。スープがしみてやわらかくなったお餅が絶品！',
      '起源于釜山鱼糕摊，把年糕串插进鱼糕汤里一起煮。吸饱汤汁变软的年糕是一绝！',
      '起源於釜山魚板攤，把年糕串插進魚板湯裡一起煮。吸飽湯汁變軟的年糕是一絕！',
    ]
  ),
  'dongnae-pajeon': s(
    [
      '밀가루보다 파가 주인공. 막걸리 자동 소환',
      'More green onion than batter. Makgeolli summoned automatically',
      '小麦粉よりネギが主役。マッコリ自動召喚',
      '葱比面糊还多，马格利酒自动召唤',
      '蔥比麵糊還多，馬格利酒自動召喚',
    ],
    [
      '동래 장터에서 시작된 파전으로, 조선시대에 임금님께 올렸다는 이야기가 전해져요. 쪽파와 해산물을 듬뿍 넣고 찹쌀 반죽으로 촉촉하게 부쳐서 초장에 찍어 먹어요.',
      'Born at the old Dongnae market, and said to have been offered to the king in the Joseon era. Piled with scallions and seafood in a sticky-rice batter, it is dipped in spicy vinegar sauce.',
      '東莱の市場で始まったパジョンで、朝鮮時代に王様へ献上されたと伝えられています。ワケギと海鮮をたっぷり入れ、もち米の生地でしっとり焼いて酢コチュジャンでいただきます。',
      '起源于东莱集市，相传朝鲜时代曾进贡给国王。放满细葱和海鲜，用糯米面糊煎得湿润，蘸醋辣酱吃。',
      '起源於東萊市集，相傳朝鮮時代曾進貢給國王。放滿細蔥和海鮮，用糯米麵糊煎得濕潤，沾醋辣醬吃。',
    ]
  ),
  'yubu-jumeoni': s(
    [
      '열어 보기 전엔 모르는 복주머니. 당면 가득!',
      'A lucky pouch: you never know until you bite. (Glass noodles. It is glass noodles.)',
      '開けるまでわからない福袋。中身は春雨たっぷり！',
      '不打开不知道的福袋，里面塞满粉丝！',
      '不打開不知道的福袋，裡面塞滿冬粉！',
    ],
    [
      '유부 속에 당면과 채소를 꽉 채우고 어묵 국물에 끓여 낸 부산 시장 간식이에요. 국제시장, 부평시장 어묵 가게에서 꼭 보이는 단골 메뉴!',
      'A Busan market snack: fried tofu pouches stuffed with glass noodles and vegetables, simmered in fish-cake broth. A fixture at fish-cake shops in Gukje and Bupyeong markets!',
      '油揚げに春雨と野菜をぎっしり詰めてオムクのスープで煮た釜山の市場おやつ。国際市場や富平市場のオムク屋の定番！',
      '在油豆腐里塞满粉丝和蔬菜，放进鱼糕汤里煮的釜山市场小吃。国际市场、富平市场鱼糕店的常驻菜单！',
      '在油豆腐裡塞滿冬粉和蔬菜，放進魚板湯裡煮的釜山市場小吃。國際市場、富平市場魚板店的常駐菜單！',
    ]
  ),
};
