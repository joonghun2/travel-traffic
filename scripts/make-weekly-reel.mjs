// Builds the weekly Reel "지난 한 주 서울에서 가장 붐볐던 곳은?!" from /sns/reel (measured Supabase data):
// hook, rank 5 -> 1, outro. Fast cuts with a white flash, the scenery layer zooms quickly and the text
// layer slams up into place. 1080x1920 MP4, saved with its layers and caption to the drive for editing:
//   /Volumes/무제/사진 data/릴스/<date>/릴스.mp4, 레이어/<beat>-배경.png, <beat>-글씨.png, 캡션.txt
// Music: royalty-free tracks in the drive's 음악 folder (one per week, starting where it gets loud,
// faded); none -> silent.
// usage: node scripts/make-weekly-reel.mjs [--base http://localhost:3000]
// Needs ffmpeg in .tools (cd .tools && npm install ffmpeg-static@5.3.0).
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const baseAt = args.indexOf('--base');
const BASE = baseAt >= 0 ? args[baseAt + 1] : 'https://www.checkeastpoint.com';
const DRIVE = '/Volumes/무제/사진 data';
const MUSIC_DIR = join(DRIVE, '음악');
const FFMPEG = '.tools/node_modules/ffmpeg-static/ffmpeg';
const FPS = 30;
const FLASH = 0.12; // white flash between beats
const SLAM = 0.16; // text slides up and fades in over this long

if (!existsSync(FFMPEG)) throw new Error(`ffmpeg not found at ${FFMPEG}`);
if (!existsSync(DRIVE)) throw new Error(`Drive not mounted: ${DRIVE}`);

const res = await fetch(`${BASE}/sns/reel/beats.json`);
if (!res.ok) throw new Error(`beats.json: HTTP ${res.status} ${await res.text()}`);
const week = await res.json();
if (week.samples && week.samples < 121 * 12 * 3) console.warn(`⚠️ Only ${week.samples} hourly samples: less than ~3 days of data behind this ranking.`);

const today = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const outDir = join(DRIVE, '릴스', today);
const layerDir = join(outDir, '레이어');
mkdirSync(layerDir, { recursive: true });

const download = async (path, file) => {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  writeFileSync(file, Buffer.from(await r.arrayBuffer()));
};
const beats = [];
for (const b of week.beats) {
  const bg = join(layerDir, `${b.id}-배경.png`);
  const text = join(layerDir, `${b.id}-글씨.png`);
  await download(`/sns/reel/${b.id}-bg.png`, bg);
  await download(`/sns/reel/${b.id}-text.png`, text);
  beats.push({ ...b, bg, text });
  console.log(`✓ ${b.id}`);
}
writeFileSync(join(outDir, '캡션.txt'), `${week.caption}\n`);

// Inputs: scenery i at 2i (one frame; zoompan makes the frames), text i at 2i+1 (looped).
const parts = [];
beats.forEach((b, i) => {
  const frames = Math.round(b.seconds * FPS);
  parts.push(
    `[${2 * i}:v]scale=2160:3840,zoompan=z='1+0.12*on/${frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1080x1920:fps=${FPS}[z${i}]`,
    `[${2 * i + 1}:v]format=rgba,fade=t=in:st=0:d=${SLAM}:alpha=1[t${i}]`,
    // Slam: start 140 px low and ease up into place.
    `[z${i}][t${i}]overlay=x=0:y='140*pow(max(0,1-t/${SLAM}),2)':eval=frame:shortest=1,setsar=1[v${i}]`
  );
});
let last = 'v0';
let offset = 0;
for (let i = 1; i < beats.length; i++) {
  offset += beats[i - 1].seconds - FLASH;
  const out = i === beats.length - 1 ? 'out' : `x${i}`;
  parts.push(`[${last}][v${i}]xfade=transition=fadewhite:duration=${FLASH}:offset=${offset.toFixed(3)}[${out}]`);
  last = out;
}
const duration = beats.reduce((s, b) => s + b.seconds, 0) - FLASH * (beats.length - 1);

const tracks = existsSync(MUSIC_DIR) ? readdirSync(MUSIC_DIR).filter((f) => /\.(mp3|m4a|aac|wav)$/i.test(f) && !f.startsWith('.')).sort() : [];
const track = tracks.length ? join(MUSIC_DIR, tracks[Math.floor(Date.now() / (7 * 86400000)) % tracks.length]) : null;
/** Seconds into the track where it first gets near full loudness, skipping a quiet intro. */
function loudStart(file) {
  // ebur128 prints short-term loudness (S) every 0.1 s on stderr.
  const log = spawnSync(FFMPEG, ['-hide_banner', '-t', '120', '-i', file, '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const points = [...log.matchAll(/t:\s*([\d.]+).*?S:\s*(-?[\d.]+)/g)].map((m) => ({ t: Number(m[1]), s: Number(m[2]) })).filter((p) => p.s > -70);
  if (!points.length) return 0;
  const peak = Math.max(...points.map((p) => p.s));
  return Math.max(0, Math.floor((points.find((p) => p.s >= peak - 4)?.t ?? 1) - 1));
}
const audio = track
  ? {
      input: ['-ss', String(loudStart(track)), '-i', track],
      filter: `;[${beats.length * 2}:a]atrim=0:${duration},afade=t=in:d=0.5,afade=t=out:st=${(duration - 1).toFixed(2)}:d=1,volume=0.8[aout]`,
      map: ['-map', '[aout]', '-c:a', 'aac', '-b:a', '192k', '-shortest'],
    }
  : { input: [], filter: '', map: [] };

const output = join(outDir, '릴스.mp4');
execFileSync(
  FFMPEG,
  [
    '-y',
    '-loglevel',
    'error',
    ...beats.flatMap((b) => ['-i', b.bg, '-loop', '1', '-t', String(b.seconds), '-framerate', String(FPS), '-i', b.text]),
    ...audio.input,
    '-filter_complex',
    parts.join(';') + audio.filter,
    '-map',
    '[out]',
    ...audio.map,
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-r',
    String(FPS),
    '-movflags',
    '+faststart',
    output,
  ],
  { stdio: 'inherit' }
);
console.log(`\nReel (${duration.toFixed(1)} s): ${output}`);
console.log(`Layers and caption: ${outDir}`);
console.log(track ? `Music: ${track}` : `No music (add tracks to ${MUSIC_DIR}, or add music in the Instagram app)`);
