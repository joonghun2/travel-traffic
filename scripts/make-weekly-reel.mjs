// Builds the Sunday Reel from the week's six story cards on /sns, 1080x1920, no audio (add trending
// music in the Instagram app). Each card is two layers from /sns/[file]: the scenery (-story-bg.png)
// slowly zooms while the text (-story-text.png) stays still on top; cards crossfade.
// usage: node scripts/make-weekly-reel.mjs [YYYY-MM-DD monday] [--base http://localhost:3000]
// Needs ffmpeg in .tools (cd .tools && npm install ffmpeg-static@5.3.0).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const baseAt = args.indexOf('--base');
const BASE = baseAt >= 0 ? args[baseAt + 1] : 'https://www.checkeastpoint.com';
const week = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));
const OUT_DIR = '/Volumes/무제/사진 data/릴스';
const FFMPEG = '.tools/node_modules/ffmpeg-static/ffmpeg';
const SECONDS = 3;
const FADE = 0.5;
const FPS = 30;

if (!existsSync(FFMPEG)) throw new Error(`ffmpeg not found at ${FFMPEG}`);

const html = await (await fetch(`${BASE}/sns${week ? `?week=${week}` : ''}`)).text();
const monday = html.match(/SNS 주간 게시물 · (?:<!-- -->)?(\d+)월 (\d+)일/);
const slides = [...new Set([...html.matchAll(/href="(\/sns\/[a-z0-9-]+-story\.png)"/g)].map((m) => m[1]))];
if (!slides.length) throw new Error('No story cards found on /sns');

const tmp = mkdtempSync(join(tmpdir(), 'cep-reel-'));
const download = async (path, file) => {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
};
const inputs = [];
for (const [i, path] of slides.entries()) {
  const bg = join(tmp, `${i}-bg.png`);
  const text = join(tmp, `${i}-text.png`);
  await download(path.replace('-story.png', '-story-bg.png'), bg);
  await download(path.replace('-story.png', '-story-text.png'), text);
  inputs.push({ bg, text });
  console.log(`✓ ${path}`);
}

// Inputs: scenery i at 2i (one frame; zoompan makes the frames), text i at 2i+1 (looped).
// Each card: zoom the scenery 1.00 -> 1.06 over SECONDS, lay the text on top, then crossfade.
const frames = SECONDS * FPS;
const parts = inputs.map(
  (_, i) =>
    `[${2 * i}:v]scale=2160:3840,zoompan=z='1+0.06*on/${frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1080x1920:fps=${FPS}[z${i}];` +
    `[z${i}][${2 * i + 1}:v]overlay=0:0:shortest=1,setsar=1[v${i}]`
);
let last = 'v0';
for (let i = 1; i < inputs.length; i++) {
  const out = i === inputs.length - 1 ? 'out' : `x${i}`;
  parts.push(`[${last}][v${i}]xfade=transition=fade:duration=${FADE}:offset=${(i * (SECONDS - FADE)).toFixed(2)}[${out}]`);
  last = out;
}
if (inputs.length === 1) parts.push('[v0]null[out]');

mkdirSync(OUT_DIR, { recursive: true });
const name = monday ? `${new Date().getFullYear()}-${monday[1].padStart(2, '0')}-${monday[2].padStart(2, '0')}` : 'week';
const output = join(OUT_DIR, `${name}-릴스.mp4`);
execFileSync(
  FFMPEG,
  ['-y', '-loglevel', 'error', ...inputs.flatMap((f) => ['-i', f.bg, '-loop', '1', '-t', String(SECONDS), '-framerate', String(FPS), '-i', f.text]), '-filter_complex', parts.join(';'), '-map', '[out]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', output],
  { stdio: 'inherit' }
);
rmSync(tmp, { recursive: true, force: true });
console.log(`\nReel: ${output}`);
