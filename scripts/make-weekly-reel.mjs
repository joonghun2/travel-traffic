// Builds the weekly Reel "지난 한 주 서울에서 가장 붐볐던 곳은?!" from /sns/reel (measured Supabase data):
// hook, rank 5 -> 1, outro. Each beat has its own scene with a camera move, scenes change with a
// whip-style transition, the light runs day -> golden -> dusk -> night like a time-lapse, seasonal
// weather (clouds, rain, snow, cherry petals, autumn leaves) drifts over it, and each beat's text
// layer slams up into place. 1080x1920 MP4, saved with its layers and caption to the drive:
//   /Volumes/무제/사진 data/릴스/<date>/릴스.mp4, 레이어/<beat>-배경.png, <beat>-글씨.png, 캡션.txt
// Scenes (drive: 사진 data/AI 일러스트/움직이는 배경):
//   hook   any Seoul scene, "01-한강철교.png" ... rotating weekly
//   rank   장소/<spot slug>.png, the ranked place (made with Figma; missing ones are listed with
//          prompts in 장소/만들어야 할 장소.txt and stand in with a Seoul scene)
//   outro  the night Han River scene ("*야경*"), else the next Seoul scene
// Music: tracks in the drive's 음악 folder (one per week, starting where it gets loud, faded); none -> silent.
// usage: node scripts/make-weekly-reel.mjs [--base http://localhost:3000] [--weather 구름|비|눈|벚꽃|낙엽|없음] [--out dir]
// Needs ffmpeg in .tools (cd .tools && npm install ffmpeg-static@5.3.0).
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

const args = process.argv.slice(2);
const arg = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const BASE = arg('--base') ?? 'https://www.checkeastpoint.com';
const DRIVE = '/Volumes/무제/사진 data';
const MUSIC_DIR = join(DRIVE, '음악');
const SCENE_DIR = join(DRIVE, 'AI 일러스트', '움직이는 배경');
const PLACE_DIR = join(SCENE_DIR, '장소');
const FFMPEG = '.tools/node_modules/ffmpeg-static/ffmpeg';
const FPS = 30;
const SWIPE = 0.3; // scene transition length
const SLAM = 0.16; // text slides up and fades in over this long
const W = 1080;
const H = 1920;

if (!existsSync(FFMPEG)) throw new Error(`ffmpeg not found at ${FFMPEG}`);
if (!existsSync(DRIVE)) throw new Error(`Drive not mounted: ${DRIVE}`);

const res = await fetch(`${BASE}/sns/reel/beats.json`);
if (!res.ok) throw new Error(`beats.json: HTTP ${res.status} ${await res.text()}`);
const week = await res.json();
if (week.samples && week.samples < 121 * 12 * 3) console.warn(`⚠️ Only ${week.samples} hourly samples: less than ~3 days of data behind this ranking.`);

const now = new Date(Date.now() + 9 * 3600 * 1000);
const today = now.toISOString().slice(0, 10);
const outDir = arg('--out') ?? join(DRIVE, '릴스', today);
const layerDir = join(outDir, '레이어');
mkdirSync(layerDir, { recursive: true });

const download = async (path, file) => {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  writeFileSync(file, Buffer.from(await r.arrayBuffer()));
};
const beats = [];
let start = 0;
for (const b of week.beats) {
  const bg = join(layerDir, `${b.id}-배경.png`);
  const text = join(layerDir, `${b.id}-글씨.png`);
  await download(`/sns/reel/${b.id}-bg.png`, bg);
  await download(`/sns/reel/${b.id}-text.png`, text);
  beats.push({ ...b, bg, text, start });
  start += b.seconds;
  console.log(`✓ ${b.id}`);
}
writeFileSync(join(outDir, '캡션.txt'), `${week.caption}\n`);
const duration = start;

// --- Scenes -------------------------------------------------------------------------------------
const weekIndex = Math.floor(Date.now() / (7 * 86400000));
const images = (dir, test = () => true) => (existsSync(dir) ? readdirSync(dir).filter((f) => /\.(png|jpe?g)$/i.test(f) && test(f)).sort().map((f) => join(dir, f)) : []);
const seoulScenes = images(SCENE_DIR, (f) => /^\d+/.test(f));
const seoulScene = (k) => (seoulScenes.length ? seoulScenes[(weekIndex + k) % seoulScenes.length] : null);
const missing = [];
beats.forEach((b, i) => {
  if (b.id === 'hook') b.scene = seoulScene(0);
  else if (b.id === 'outro') b.scene = seoulScenes.find((f) => f.includes('야경')) ?? seoulScene(1);
  else {
    const spot = week.spots[Number(b.id.slice(5)) - 1];
    b.scene = images(PLACE_DIR, (f) => f.replace(/\.\w+$/, '') === spot.slug)[0];
    if (!b.scene) {
      missing.push(spot);
      b.scene = seoulScene(i + 1);
    }
  }
  b.scene ??= b.bg; // no drive scenes at all: the site's own scenery
});
if (missing.length) {
  const style =
    'peaceful anime scenery, hand-painted anime film background art with soft brush texture, hyper-detailed, vivid saturated colors, luminous warm sunlight, big fluffy white clouds in a deep blue sky where the sky shows, cinematic composition, 4K, no people, no readable text, no letters, no logos, no watermark';
  writeFileSync(
    join(PLACE_DIR, '만들어야 할 장소.txt'),
    missing.map((s) => `[${s.slug}.png] ${s.ko}\nVertical 9:16. ${s.en} in Seoul (${s.ko}), its most recognizable view, ${style}\n`).join('\n')
  );
  console.warn(`⚠️ No scene image yet for: ${missing.map((s) => s.ko).join(', ')} (prompts: 장소/만들어야 할 장소.txt). Using Seoul scenes instead.`);
}

// --- Seasonal weather ----------------------------------------------------------------------------
const SEASON = { 12: '눈', 1: '눈', 2: '눈', 3: '벚꽃', 4: '벚꽃', 5: '구름', 6: '구름', 7: '비', 8: '구름', 9: '낙엽', 10: '낙엽', 11: '낙엽' };
const weather = arg('--weather') ?? SEASON[now.getUTCMonth() + 1];
const withClouds = ['구름', '벚꽃', '낙엽'].includes(weather);
const FX_DIR = join(tmpdir(), 'checkeastpoint-reel-fx');
mkdirSync(FX_DIR, { recursive: true });

/** Tileable 1120x3840 particle sheet (two identical 1920 tiles, so a sliding crop loops seamlessly). */
async function particleSheet(name, count, draw) {
  const file = join(FX_DIR, `${name}.png`);
  if (existsSync(file)) return file;
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const shapes = [];
  for (let k = 0; k < count; k++) {
    const x = rnd() * 1120;
    const y = rnd() * H;
    const shape = draw(rnd);
    // Draw again one tile up/down so pieces crossing a tile edge wrap around.
    for (const dy of [-H, 0, H, 2 * H]) shapes.push(`<g transform="translate(${x.toFixed(1)} ${(y + dy).toFixed(1)})">${shape}</g>`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="${2 * H}"><defs><filter id="b"><feGaussianBlur stdDeviation="0.8"/></filter></defs>${shapes.join('')}</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(file);
  return file;
}
const pick = (rnd, list) => list[Math.floor(rnd() * list.length)];
const PARTICLES = {
  눈: { speed: 150, sway: 18, sheet: () => particleSheet('snow-v2', 260, (r) => `<circle r="${(3 + r() * 6).toFixed(1)}" fill="white" opacity="${(0.55 + r() * 0.4).toFixed(2)}" filter="url(#b)"/>`) },
  벚꽃: {
    speed: 170,
    sway: 26,
    sheet: () =>
      particleSheet('petals-v2', 90, (r) => `<ellipse rx="${(10 + r() * 6).toFixed(1)}" ry="${(5 + r() * 3).toFixed(1)}" transform="rotate(${Math.round(r() * 180)})" fill="${pick(r, ['#fbcfe8', '#f9a8d4', '#fce7f3'])}" opacity="0.9"/>`),
  },
  낙엽: {
    speed: 200,
    sway: 30,
    sheet: () =>
      particleSheet(
        'leaves-v2',
        70,
        (r) =>
          `<g transform="rotate(${Math.round(r() * 180)})"><ellipse rx="${(12 + r() * 7).toFixed(1)}" ry="${(6 + r() * 4).toFixed(1)}" fill="${pick(r, ['#ea580c', '#dc2626', '#f59e0b', '#b45309'])}" opacity="0.92"/><line x1="-14" x2="14" stroke="#7c2d12" stroke-width="1" opacity="0.6"/></g>`
      ),
  },
};
/** The drive's Figma cloud layer, faded out at the bottom so it can float over any scene. */
async function softClouds() {
  const src = join(SCENE_DIR, '한강', '구름.png');
  if (!existsSync(src)) return null;
  const file = join(FX_DIR, 'clouds-soft.png');
  if (!existsSync(file)) {
    const { data, info } = await sharp(src).resize({ height: 560 }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let y = 0; y < info.height; y++) {
      const keep = Math.min(1, Math.max(0, (info.height * 0.92 - y) / (info.height * 0.4)));
      for (let x = 0; x < info.width; x++) data[(y * info.width + x) * 4 + 3] *= keep;
    }
    await sharp(data, { raw: info }).png().toFile(file);
  }
  return file;
}

/** Whether the top quarter of an image is mostly open sky (blue), so floating clouds belong there. */
async function showsSky(file) {
  const { data, info } = await sharp(file).resize(60, 108, { fit: 'cover' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let sky = 0;
  const rows = Math.round(info.height / 4);
  for (let k = 0; k < rows * info.width; k++) {
    const [r, g, b] = [data[k * 3], data[k * 3 + 1], data[k * 3 + 2]];
    if (b > r + 25 && b >= g) sky++;
  }
  return sky / (rows * info.width) > 0.3;
}

// --- Filter graph --------------------------------------------------------------------------------
const inputs = [];
const parts = [];
const inputCount = () => inputs.filter((x) => x === '-i').length;
const still = (file, seconds = duration) => {
  inputs.push('-loop', '1', '-t', String(seconds), '-framerate', String(FPS), '-i', file);
  return inputCount() - 1;
};

// Each scene: a camera push-in drifting sideways (direction alternates), held SWIPE longer so the next
// scene can swipe in over it; the swipe starts on the next beat.
const SWIPES = ['smoothleft', 'smoothup', 'smoothright', 'zoomin', 'smoothdown', 'smoothleft'];
beats.forEach((b, i) => {
  const seconds = b.seconds + (i < beats.length - 1 ? SWIPE : 0);
  const frames = Math.round(seconds * FPS);
  const side = i % 2 ? 1 : -1;
  inputs.push('-i', b.scene);
  parts.push(
    `[${inputCount() - 1}:v]scale=${2 * W}:${2 * H}:force_original_aspect_ratio=increase,crop=${2 * W}:${2 * H},` +
      `zoompan=z='1.04+0.12*on/${frames}':x='(iw-iw/zoom)*(0.5+${side}*0.35*on/${frames})':y='(ih-ih/zoom)/2':d=${frames}:s=${W}x${H}:fps=${FPS},setsar=1,format=yuv420p[c${i}]`
  );
});
let last = 'c0';
beats.slice(1).forEach((b, i) => {
  parts.push(`[${last}][c${i + 1}]xfade=transition=${SWIPES[i % SWIPES.length]}:duration=${SWIPE}:offset=${b.start.toFixed(3)}[x${i + 1}]`);
  last = `x${i + 1}`;
});

// Weather drifts over the scenes (and takes the time-of-day light with them).
const clouds = withClouds ? await softClouds() : null;
if (clouds) {
  // Only over scenes with open sky (not indoor markets or street canyons).
  const open = [];
  for (const b of beats) if (await showsSky(b.scene)) open.push(`between(t,${b.start},${b.start + b.seconds})`);
  if (open.length) {
    parts.push(`[${still(clouds)}:v]format=rgba,colorchannelmixer=aa=0.6[cl]`, `[${last}][cl]overlay=x='300-75*t':y=40:eval=frame:enable='${open.join('+')}'[wc]`);
    last = 'wc';
  }
}
const particles = PARTICLES[weather];
if (particles) {
  parts.push(
    `[${still(await particles.sheet())}:v]crop=${W}:${H}:x='20+${particles.sway}*sin(t*1.6)':y='${H}-mod(t*${particles.speed}\\,${H})'[pt]`,
    `[${last}][pt]overlay=0:0[wp]`
  );
  last = 'wp';
} else if (weather === '비' && existsSync(join(SCENE_DIR, '빗줄기.png'))) {
  parts.push(
    `[${last}]eq=brightness=-0.06:saturation=0.8[dim]`,
    `[${still(join(SCENE_DIR, '빗줄기.png'))}:v]crop=${W}:${H}:x=0:y='${H}-mod(t*2400\\,${H})',format=rgba,colorkey=black:0.2:0.1,colorchannelmixer=aa=0.45[rn]`,
    `[dim][rn]overlay=0:0[wp]`
  );
  last = 'wp';
}

// Time-lapse light: day, then golden hour, dusk and night each fade in fast over the one before.
// Curves keep the brightest parts (windows, lamps) bright while the rest darkens.
const LIGHT = [
  { at: 0.22, curves: "r='0/0 0.5/0.56 1/1':g='0/0 0.5/0.47 1/0.95':b='0/0 0.5/0.36 1/0.82'" },
  { at: 0.45, curves: "r='0/0.02 0.5/0.42 1/0.96':g='0/0 0.5/0.28 1/0.8':b='0/0.06 0.5/0.42 1/0.93'" },
  { at: 0.68, curves: "r='0/0 0.5/0.1 0.85/0.5 1/0.95':g='0/0 0.5/0.13 0.85/0.5 1/0.9':b='0/0.04 0.5/0.3 0.85/0.66 1/1'" },
];
parts.push(`[${last}]split=${LIGHT.length + 1}[day]${LIGHT.map((_, k) => `[l${k}]`).join('')}`);
last = 'day';
LIGHT.forEach((l, k) => {
  parts.push(
    `[l${k}]curves=${l.curves},format=rgba,fade=t=in:st=${(l.at * duration).toFixed(2)}:d=${(duration * 0.1).toFixed(2)}:alpha=1[lf${k}]`,
    `[${last}][lf${k}]overlay=0:0[lt${k}]`
  );
  last = `lt${k}`;
});

// Each beat's text slams up while it is on screen.
beats.forEach((b, i) => {
  const end = b.start + b.seconds;
  parts.push(
    `[${still(b.text)}:v]format=rgba,fade=t=in:st=${b.start}:d=${SLAM}:alpha=1[t${i}]`,
    `[${last}][t${i}]overlay=x=0:y='140*pow(max(0,1-(t-${b.start})/${SLAM}),2)':eval=frame:enable='between(t,${b.start},${end})'[o${i}]`
  );
  last = `o${i}`;
});
parts.push(`[${last}]format=yuv420p[out]`);

// --- Music ---------------------------------------------------------------------------------------
const tracks = existsSync(MUSIC_DIR) ? readdirSync(MUSIC_DIR).filter((f) => /\.(mp3|m4a|aac|wav)$/i.test(f) && !f.startsWith('.')).sort() : [];
const track = tracks.length ? join(MUSIC_DIR, tracks[weekIndex % tracks.length]) : null;
/** Seconds into the track where it first gets near full loudness, skipping a quiet intro. */
function loudStart(file) {
  // ebur128 prints short-term loudness (S) every 0.1 s on stderr.
  const log = spawnSync(FFMPEG, ['-hide_banner', '-t', '120', '-i', file, '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const points = [...log.matchAll(/t:\s*([\d.]+).*?S:\s*(-?[\d.]+)/g)].map((m) => ({ t: Number(m[1]), s: Number(m[2]) })).filter((p) => p.s > -70);
  if (!points.length) return 0;
  const peak = Math.max(...points.map((p) => p.s));
  return Math.max(0, Math.floor((points.find((p) => p.s >= peak - 4)?.t ?? 1) - 1));
}
let audioMap = [];
if (track) {
  inputs.push('-ss', String(loudStart(track)), '-i', track);
  parts.push(`[${inputCount() - 1}:a]atrim=0:${duration},afade=t=in:d=0.5,afade=t=out:st=${(duration - 1).toFixed(2)}:d=1,volume=0.8[aout]`);
  audioMap = ['-map', '[aout]', '-c:a', 'aac', '-b:a', '192k', '-shortest'];
}

const output = join(outDir, '릴스.mp4');
execFileSync(
  FFMPEG,
  ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', parts.join(';'), '-map', '[out]', ...audioMap, '-t', String(duration), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', output],
  { stdio: 'inherit' }
);
console.log(`\nReel (${duration.toFixed(1)} s): ${output}`);
console.log(`Scenes: ${beats.map((b) => `${b.id}=${b.scene.split('/').pop()}`).join(', ')}`);
console.log(`Weather: ${weather}${clouds ? ' + 구름' : ''}`);
console.log(`Layers and caption: ${outDir}`);
console.log(track ? `Music: ${track}` : `No music (add tracks to ${MUSIC_DIR}, or add music in the Instagram app)`);
