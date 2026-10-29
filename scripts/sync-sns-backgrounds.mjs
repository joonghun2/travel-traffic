// Turns photos named after spots into card backgrounds:
//   /Volumes/무제/사진 data/경복궁.jpg -> public/bg/gyeongbokgung-palace-gwanghwamun.jpg
//   서울.jpg / 제주.jpg / 부산.jpg     -> public/bg/seoul.jpg (city fallback)
// and writes src/data/snsBackgrounds.json, which the card routes read.
// Own photos in the folder come first; AI illustrations in its "AI 일러스트" subfolder fill the gaps.
// usage: node scripts/sync-sns-backgrounds.mjs ["/path/to/folder"]
// HEIC is converted with macOS sips; sharp (installed with Next.js) applies EXIF rotation and crops to 1080x1920.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import sharp from 'sharp';

const SRC = process.argv[2] ?? '/Volumes/무제/사진 data';
const OUT_DIR = 'public/bg';
const MANIFEST = 'src/data/snsBackgrounds.json';

const slugify = (en) => en.toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const norm = (s) => s.toLowerCase().normalize('NFC').replace(/[\s&＆()（）·.,_-]+/g, '');
const short = (ko) => ko.split(/\s*[&＆(（/]\s*/)[0];

// Spot names straight from the data files (both `name: { ko: '..', en: '..' }` and JSON style).
const NAME_RE = /(?<![A-Za-z])"?name"?\s*:\s*\{\s*"?ko"?\s*:\s*(['"])(.+?)\1\s*,\s*"?en"?\s*:\s*(['"])(.+?)\3/gs;
const spots = ['src/data/spots/seoul.ts', 'src/data/spots/seoulOfficial.ts', 'src/data/spots/forecastSpots.ts'].flatMap((f) =>
  [...readFileSync(f, 'utf8').matchAll(NAME_RE)].map((m) => ({ ko: m[2], en: m[4], slug: slugify(m[4]) }))
);
const CITIES = { 서울: 'seoul', seoul: 'seoul', 제주: 'jeju', jeju: 'jeju', 부산: 'busan', busan: 'busan' };

function keyFor(base) {
  const b = norm(base);
  if (CITIES[b]) return CITIES[b];
  const exact = spots.find((s) => [s.ko, short(s.ko), s.en, s.slug].some((n) => norm(n) === b));
  if (exact) return exact.slug;
  // Then "contains" (해운대해수욕장), then "letters in order" (남대문시장 -> 남대문 전통시장).
  const inOrder = (name) => {
    let i = 0;
    for (const c of name) if (c === b[i]) i++;
    return i === b.length;
  };
  for (const test of [(s) => norm(s.ko).includes(b), (s) => inOrder(norm(s.ko))]) {
    const hits = [...new Set(spots.filter((s) => b.length >= 2 && test(s)).map((s) => s.slug))];
    if (hits.length === 1) return hits[0];
    if (hits.length) return { ambiguous: hits };
  }
  return null;
}

const IMAGE = /\.(jpe?g|png|heic|heif|webp)$/i;
const imagesIn = (dir) => {
  try {
    return readdirSync(dir).filter((f) => IMAGE.test(f) && !f.startsWith('.')).sort().map((f) => ({ dir, file: f }));
  } catch {
    return [];
  }
};
const files = [...imagesIn(SRC), ...imagesIn(join(SRC, 'AI 일러스트'))];
const tmp = mkdtempSync(join(tmpdir(), 'cep-bg-'));
const manifest = {};
const skipped = [];
rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

for (const { dir, file } of files) {
  // "경복궁 2.jpg" -> "경복궁"
  const base = file.slice(0, -extname(file).length).normalize('NFC').replace(/[\s_-]*\d+$/, '');
  const key = keyFor(base);
  if (!key || typeof key !== 'string') {
    skipped.push(key?.ambiguous ? `${file} (여러 명소와 겹침: ${key.ambiguous.join(', ')})` : `${file} (명소 이름을 못 찾음)`);
    continue;
  }
  let input = join(dir, file);
  if (/\.hei[cf]$/i.test(file)) {
    const jpg = join(tmp, `${manifest[key]?.length ?? 0}-${key}.jpg`);
    execFileSync('sips', ['-s', 'format', 'jpeg', input, '--out', jpg], { stdio: 'ignore' });
    input = jpg;
  }
  const list = (manifest[key] ??= []);
  const name = `${key}${list.length ? `-${list.length + 1}` : ''}.jpg`;
  await sharp(input).rotate().resize(1080, 1920, { fit: 'cover', position: 'attention' }).jpeg({ quality: 72, mozjpeg: true }).toFile(join(OUT_DIR, name));
  list.push(`/bg/${name}`);
  console.log(`✓ ${file} -> ${name}`);
}

rmSync(tmp, { recursive: true, force: true });
writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`\n${Object.values(manifest).flat().length} backgrounds for ${Object.keys(manifest).length} spots/cities -> ${MANIFEST}`);
if (skipped.length) console.log(`\nSkipped:\n  ${skipped.join('\n  ')}`);
