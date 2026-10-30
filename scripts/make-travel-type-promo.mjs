// Instagram promo for the travel-type test (/play/travel-type): a 10-slide carousel and a story.
// Text layers come from /sns/promo, scenery from the drive's 움직이는 배경 folder; both layers and the
// finished images are saved for editing:
//   /Volumes/무제/사진 data/인스타/여행성향테스트/01.png ... 10.png, 스토리.png, 레이어/, 캡션.txt
// usage: node scripts/make-travel-type-promo.mjs [--base http://localhost:3000]
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const args = process.argv.slice(2);
const BASE = args.includes('--base') ? args[args.indexOf('--base') + 1] : 'https://www.checkeastpoint.com';
const DRIVE = '/Volumes/무제/사진 data';
const SCENES = join(DRIVE, 'AI 일러스트', '움직이는 배경');
const OUT = join(DRIVE, '인스타', '여행성향테스트');
const LAYERS = join(OUT, '레이어');
if (!existsSync(DRIVE)) throw new Error(`Drive not mounted: ${DRIVE}`);
mkdirSync(LAYERS, { recursive: true });

// Scenery per slide: cover, the eight types in TYPES order (sEa sEA sea seA SEa SEA Sea SeA), call to action.
const BG = [
  '01-한강철교.png',
  '03-북촌한옥.png', // 낭만 고독자: a quiet alley alone
  '장소/n-seoul-tower-namsan-park.png', // 고독한 탐험가: a forest path off the map
  '02-경복궁.png', // 사색하는 산책자: famous place at its quietest
  '장소/lotte-world-theme-park-magic-island.png', // 버킷리스트 헌터
  '장소/gwangjang-market-food-alley.png', // 다정한 로컬러: the market
  '08-골목상점.png', // 골목 모험대장
  '06-청계천.png', // 힐링 메이트
  '장소/myeongdong-shopping-street-cathedral.png', // 에너자이저 리더
  '05-성곽길노을.png',
];
const STORY_BG = '07-한강야경.png';

async function slide(name, bgFile, textPath, width, height) {
  const r = await fetch(`${BASE}${textPath}`);
  if (!r.ok) throw new Error(`${textPath}: HTTP ${r.status}`);
  const text = Buffer.from(await r.arrayBuffer());
  const bg = join(SCENES, bgFile);
  writeFileSync(join(LAYERS, `${name}-글씨.png`), text);
  copyFileSync(bg, join(LAYERS, `${name}-배경${bgFile.slice(bgFile.lastIndexOf('.'))}`));
  await sharp(bg)
    .resize(width, height, { fit: 'cover' })
    .composite([{ input: text }])
    .png()
    .toFile(join(OUT, `${name}.png`));
  console.log(`✓ ${name}`);
}

for (let n = 1; n <= 10; n++) await slide(String(n).padStart(2, '0'), BG[n - 1], `/sns/promo/travel-type-${n}.png`, 1080, 1350);
await slide('스토리', STORY_BG, '/sns/promo/travel-type-story.png', 1080, 1920);

writeFileSync(
  join(OUT, '캡션.txt'),
  `나는 서울에서 어떤 여행자일까? 🧳
15문항, 3분이면 나의 여행 성향이 나와요.

낭만 고독자 · 고독한 탐험가 · 사색하는 산책자 · 버킷리스트 헌터
다정한 로컬러 · 골목 모험대장 · 힐링 메이트 · 에너자이저 리더
👉 넘겨서 8가지 유형을 미리 보고, 나는 몇 번일지 댓글로 맞혀 보세요!

결과 카드를 스토리에 올리고 같이 여행 갈 친구를 태그해 보세요 🏷️
테스트는 프로필 링크에서 → checkeastpoint.com/play/travel-type

What kind of Seoul traveler are you? 15 questions, 3 minutes, 8 travel types.
Take the quiz via the link in bio and tag your travel buddy!

#여행성향테스트 #심리테스트 #서울여행 #여행스타그램 #MBTI여행 #국내여행 #서울가볼만한곳 #테스트 #seoultravel #koreatravel #travelquiz #personalitytest
`
);
console.log(`\nSaved to ${OUT}`);
