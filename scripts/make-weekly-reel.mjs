// Builds the weekly Reel "지난 한 주 서울에서 가장 붐볐던 곳은?!" from /sns/reel (measured Supabase data):
// hook, rank 5 -> 1, outro. Fast cuts with a white flash; each beat's text layer slams up into place.
// 1080x1920 MP4, saved with its layers and caption to the drive for editing:
//   /Volumes/무제/사진 data/릴스/<date>/릴스.mp4, 레이어/<beat>-배경.png, <beat>-글씨.png, 캡션.txt
// Background, first available: AI-animated clips in the drive's 움직이는 배경/영상 (one per beat); an
// animated Han River scene from 움직이는 배경 (sky and clouds drifting, ground fixed, optional rain);
// else each beat's own zooming scenery from /sns/reel.
// Music: tracks in the drive's 음악 folder (one per week, starting where it gets loud, faded); none -> silent.
// Prompts for the scenes and clips: 움직이는 배경/이미지 프롬프트.txt on the drive.
// usage: node scripts/make-weekly-reel.mjs [--base http://localhost:3000] [--look 노을|비|밤] [--out dir]
// Needs ffmpeg in .tools (cd .tools && npm install ffmpeg-static@5.3.0).
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const arg = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const BASE = arg('--base') ?? 'https://www.checkeastpoint.com';
const LOOK = arg('--look');
const DRIVE = '/Volumes/무제/사진 data';
const MUSIC_DIR = join(DRIVE, '음악');
const SCENE_DIR = join(DRIVE, 'AI 일러스트', '움직이는 배경');
const FFMPEG = '.tools/node_modules/ffmpeg-static/ffmpeg';
const FPS = 30;
const FLASH = 0.12; // white flash between beats
const SLAM = 0.16; // text slides up and fades in over this long
const GREEN = '0x00FF00';

if (!existsSync(FFMPEG)) throw new Error(`ffmpeg not found at ${FFMPEG}`);
if (!existsSync(DRIVE)) throw new Error(`Drive not mounted: ${DRIVE}`);

const res = await fetch(`${BASE}/sns/reel/beats.json`);
if (!res.ok) throw new Error(`beats.json: HTTP ${res.status} ${await res.text()}`);
const week = await res.json();
if (week.samples && week.samples < 121 * 12 * 3) console.warn(`⚠️ Only ${week.samples} hourly samples: less than ~3 days of data behind this ranking.`);

const today = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
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

/** "<name>-<look>.png" if it exists, else "<name>.png", else null. */
function sceneFile(dir, name) {
  const file = [LOOK && `${name}-${LOOK}.png`, `${name}.png`].filter(Boolean).find((f) => existsSync(join(SCENE_DIR, dir, f)));
  return file ? join(SCENE_DIR, dir, file) : null;
}
// 한강 = the "Your Name"-style set from 이미지 프롬프트.txt; 서울 = the first prototype.
const scene = {
  sky: sceneFile('한강', '하늘') ?? sceneFile('서울', '하늘'),
  ground: sceneFile('한강', '땅') ?? sceneFile('서울', '땅-철교-투명'),
  clouds: sceneFile('한강', '구름'),
  rain: LOOK === '비' && existsSync(join(SCENE_DIR, '빗줄기.png')) ? join(SCENE_DIR, '빗줄기.png') : null,
};
// AI-animated scene clips (e.g. CapCut image-to-video) in 움직이는 배경/영상: one per beat, so the scene
// cuts with every rank. Order rotates weekly.
const CLIP_DIR = join(SCENE_DIR, '영상');
const clips = existsSync(CLIP_DIR) ? readdirSync(CLIP_DIR).filter((f) => /\.(mp4|mov|m4v)$/i.test(f) && !f.startsWith('.')).sort() : [];
const animated = Boolean(scene.sky && scene.ground);
const weekIndex = Math.floor(Date.now() / (7 * 86400000));

const inputs = [];
const parts = [];
const inputCount = () => inputs.filter((x) => x === '-i').length;
const still = (file, seconds = duration) => {
  inputs.push('-loop', '1', '-t', String(seconds), '-framerate', String(FPS), '-i', file);
  return inputCount() - 1;
};
const usesClips = clips.length > 0;

if (usesClips) {
  beats.forEach((b, i) => {
    inputs.push('-stream_loop', '-1', '-t', String(b.seconds), '-i', join(CLIP_DIR, clips[(i + weekIndex) % clips.length]));
    parts.push(
      `[${inputCount() - 1}:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=${FPS},trim=duration=${b.seconds},setpts=PTS-STARTPTS[c${i}]`
    );
  });
  parts.push(`${beats.map((_, i) => `[c${i}]`).join('')}concat=n=${beats.length}:v=1:a=0[bg0]`);
} else if (animated) {
  // Sky pans across its whole width over the reel; clouds cross faster; ground stays put.
  const grey = LOOK === '비' && !scene.sky.endsWith('하늘-비.png') ? ',eq=saturation=0.12:brightness=0.12:contrast=0.75' : '';
  parts.push(`[${still(scene.sky)}:v]scale=-2:1100,crop=1080:1100:x='(iw-1080)*t/${duration}':y=0,pad=1080:1920:0:0:color=0x3b82f6${grey}[sky]`);
  let below = 'sky';
  if (scene.clouds) {
    parts.push(
      `[${still(scene.clouds)}:v]colorkey=${GREEN}:0.3:0.08,despill=type=green:mix=0.6,scale=-2:640[cl]`,
      `[sky][cl]overlay=x='-(w-W)*t/${duration}':y=80:eval=frame[skycl]`
    );
    below = 'skycl';
  }
  parts.push(`[${still(scene.ground)}:v]scale=1080:1920,colorkey=${GREEN}:0.18:0.05[gr]`, `[${below}][gr]overlay=0:0[scene]`);
  let last = 'scene';
  if (scene.rain) {
    parts.push(
      `[scene]eq=brightness=-0.08:saturation=0.75[dim]`,
      `[${still(scene.rain)}:v]crop=1080:1920:x=0:y='1920-mod(t*2400\\,1920)',format=rgba,colorkey=black:0.2:0.1,colorchannelmixer=aa=0.45[rn]`,
      `[dim][rn]overlay=0:0[wet]`
    );
    last = 'wet';
  }
  // Slow push-in over the whole reel.
  parts.push(`[${last}]scale=1188:2112,crop=1080:1920:x='(iw-1080)/2*t/${duration}':y='(ih-1920)/2*t/${duration}',setsar=1[bg0]`);
}

if (usesClips || animated) {
  let last = 'bg0';
  // Each beat's text slams up while it is on screen.
  beats.forEach((b, i) => {
    const end = b.start + b.seconds;
    parts.push(
      `[${still(b.text)}:v]format=rgba,fade=t=in:st=${b.start}:d=${SLAM}:alpha=1[t${i}]`,
      `[${last}][t${i}]overlay=x=0:y='140*pow(max(0,1-(t-${b.start})/${SLAM}),2)':eval=frame:enable='between(t,${b.start},${end})'[o${i}]`
    );
    last = `o${i}`;
  });
  const flashes = beats.slice(1).map((b) => `drawbox=x=0:y=0:w=iw:h=ih:color=white@0.85:t=fill:enable='between(t,${(b.start - FLASH / 2).toFixed(3)},${(b.start + FLASH / 2).toFixed(3)})'`);
  parts.push(`[${last}]${flashes.join(',')},format=yuv420p[out]`);
} else {
  // Per-beat scenery: scenery i zooms (zoompan makes the frames), text i slams up, white-flash cuts.
  beats.forEach((b, i) => {
    const frames = Math.round(b.seconds * FPS);
    inputs.push('-i', b.bg);
    const bg = inputs.filter((x) => x === '-i').length - 1;
    parts.push(
      `[${bg}:v]scale=2160:3840,zoompan=z='1+0.12*on/${frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1080x1920:fps=${FPS}[z${i}]`,
      `[${still(b.text, b.seconds)}:v]format=rgba,fade=t=in:st=0:d=${SLAM}:alpha=1[t${i}]`,
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
}
const length = usesClips || animated ? duration : duration - FLASH * (beats.length - 1);

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
let audioMap = [];
if (track) {
  inputs.push('-ss', String(loudStart(track)), '-i', track);
  const a = inputs.filter((x) => x === '-i').length - 1;
  parts.push(`[${a}:a]atrim=0:${length},afade=t=in:d=0.5,afade=t=out:st=${(length - 1).toFixed(2)}:d=1,volume=0.8[aout]`);
  audioMap = ['-map', '[aout]', '-c:a', 'aac', '-b:a', '192k', '-shortest'];
}

const output = join(outDir, '릴스.mp4');
execFileSync(
  FFMPEG,
  ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', parts.join(';'), '-map', '[out]', ...audioMap, '-t', String(length), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', output],
  { stdio: 'inherit' }
);
console.log(`\nReel (${length.toFixed(1)} s): ${output}`);
console.log(
  usesClips
    ? `Background: ${clips.length} clip(s) in ${CLIP_DIR}`
    : animated
      ? `Background: ${[scene.sky, scene.clouds, scene.ground, scene.rain].filter(Boolean).join(', ')}`
      : 'Background: per-beat scenery (no clips or 하늘/땅 images in 움직이는 배경)'
);
console.log(`Layers and caption: ${outDir}`);
console.log(track ? `Music: ${track}` : `No music (add tracks to ${MUSIC_DIR}, or add music in the Instagram app)`);
