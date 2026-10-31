// Instagram promo for the Busan Food Olympics (/play/busan-food-olympics): a 10-slide carousel and a story.
// Text layers come from /sns/promo, photos from public/images/busan-food; both layers and the finished
// images are saved for editing:
//   /Volumes/무제/사진 data/인스타/부산음식올림픽/01.png ... 10.png, 스토리.png, 레이어/, 캡션.txt
// usage: node scripts/make-busan-food-promo.mjs [--base http://localhost:3000]
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const args = process.argv.slice(2);
const BASE = args.includes('--base') ? args[args.indexOf('--base') + 1] : 'https://www.checkeastpoint.com';
const DRIVE = '/Volumes/무제/사진 data';
const PHOTOS = 'public/images/busan-food';
const OUT = join(DRIVE, '인스타', '부산음식올림픽');
const LAYERS = join(OUT, '레이어');
if (!existsSync(DRIVE)) throw new Error(`Drive not mounted: ${DRIVE}`);
mkdirSync(LAYERS, { recursive: true });

// Same pairs as BUSAN_PROMO_MATCHES in src/app/sns/promo/busanFood.tsx.
const MATCHES = [
  ['dwaeji-gukbap', 'milmyeon'],
  ['nakgopsae', 'kkomjangeo-gui'],
  ['ssiat-hotteok', 'multteok'],
  ['jogae-gui', 'jagalchi-hoe'],
  ['gijang-daege', 'bokguk'],
  ['busan-eomuk', 'yubu-jumeoni'],
  ['bibim-dangmyeon', 'naengchae-jokbal'],
  ['dongnae-pajeon', 'lee-jae-mo-pizza'],
];
const photo = (id) => join(PHOTOS, `${id}.jpg`);

/** Photos tiled into a cols x rows grid filling width x height. */
async function grid(ids, cols, rows, width, height) {
  const w = Math.ceil(width / cols);
  const h = Math.ceil(height / rows);
  const tiles = await Promise.all(
    ids.slice(0, cols * rows).map(async (id, i) => ({
      input: await sharp(photo(id)).resize(w, h, { fit: 'cover' }).toBuffer(),
      left: (i % cols) * w,
      top: Math.floor(i / cols) * h,
    }))
  );
  return sharp({ create: { width, height, channels: 3, background: '#0d0e12' } }).composite(tiles).png().toBuffer();
}

async function slide(name, background, textPath, height) {
  const r = await fetch(`${BASE}${textPath}`);
  if (!r.ok) throw new Error(`${textPath}: HTTP ${r.status}`);
  const text = Buffer.from(await r.arrayBuffer());
  writeFileSync(join(LAYERS, `${name}-글씨.png`), text);
  writeFileSync(join(LAYERS, `${name}-배경.png`), background);
  await sharp(background).resize(1080, height, { fit: 'cover' }).composite([{ input: text }]).png().toFile(join(OUT, `${name}.png`));
  console.log(`✓ ${name}`);
}

const cover = ['dwaeji-gukbap', 'milmyeon', 'ssiat-hotteok', 'gijang-daege', 'nakgopsae', 'busan-eomuk'];
await slide('01', await grid(cover, 2, 3, 1080, 1350), '/sns/promo/busan-food-1.png', 1350);
for (const [i, pair] of MATCHES.entries()) {
  await slide(String(i + 2).padStart(2, '0'), await grid(pair, 1, 2, 1080, 1350), `/sns/promo/busan-food-${i + 2}.png`, 1350);
}
const all = MATCHES.flat();
await slide('10', await grid(all, 4, 4, 1080, 1350), '/sns/promo/busan-food-10.png', 1350);
await slide('스토리', await grid(all.slice(0, 12), 3, 4, 1080, 1920), '/sns/promo/busan-food-story.png', 1920);

writeFileSync(
  join(OUT, '캡션.txt'),
  `부산 음식 올림픽 🥇 당신의 금메달은?
유튜브에서 가장 많이 찾은 부산 음식 16가지가 붙었어요.

돼지국밥 vs 밀면, 씨앗호떡 vs 물떡, 기장대게 vs 복국…
👉 넘겨서 1라운드 8경기를 보고, 댓글로 ① or ② 골라 주세요!
(예: 1번 ①, 2번 ②, 3번 ①…)

16강 전부 해보기는 프로필 링크에서 → checkeastpoint.com/play
30명이 모이면 다른 사람들의 순위도 공개돼요 👀
결과를 스토리에 올리고 부산 같이 갈 친구를 태그해 보세요 🏷️

Busan Food Olympics: 16 Busan foods, one gold medal. Which one wins yours? Link in bio.

#부산음식올림픽 #부산맛집 #부산여행 #부산음식 #돼지국밥 #밀면 #씨앗호떡 #이상형월드컵 #음식월드컵 #국내여행 #부산가볼만한곳 #busan #busanfood #koreanfood
`
);
console.log(`\nSaved to ${OUT}`);
