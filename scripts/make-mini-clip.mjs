// Turns one photoreal place photo into a moving "miniature city" clip: cars glide along the roads and
// people stream along walkways (both ways), with tilt-shift blur, toy-like colours and a slow push-in.
// Motion is a flow map: the pixels inside each road or crowd area slide along its direction, and two
// copies half a period apart cross-fade so the loop never shows a seam.
//
// The spec sits next to the photo (<name>.json) in the photo's own 768-wide pixel coordinates:
//   { "roads":  [{ "pts": [[x, y, halfWidth], ...], "speed": 1, "oneway": false }],
//     "crowds": [{ "poly": [[x, y], ...], "dir": [dx, dy], "speed": 1 }],
//     "focus":  [y0, y1] }   // the sharp band; above and below get the tilt-shift blur
// Two-way roads: lanes left of the centre line run against the point order, lanes right of it with it
// ("oneway": true makes every lane follow the point order). Far road parts (narrower) move slower.
//
// usage: node scripts/make-mini-clip.mjs <photo.jpg> <out.mp4> [--seconds 3] [--grade day|night]
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

const args = process.argv.slice(2);
const arg = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const [photo, out] = args;
if (!photo || !out) throw new Error('usage: node scripts/make-mini-clip.mjs <photo.jpg> <out.mp4> [--seconds 3] [--grade day|night]');
const SECONDS = Number(arg('--seconds', 3));
const GRADE = arg('--grade', 'day');
const spec = JSON.parse(readFileSync(photo.replace(/\.\w+$/, '.json'), 'utf8'));
const FFMPEG = '.tools/node_modules/ffmpeg-static/ffmpeg';
const FPS = 30;
const W = 1188; // working size: 10% wider than the reel so the push-in never shows an edge
const H = 2112;
const OUT_W = 1080;
const OUT_H = 1920;
const CAR_PX_S = 150; // car speed on the nearest, widest road, working pixels per second
const WALK_PX_S = 22; // walking speed

const meta = await sharp(photo).metadata();
const K = W / meta.width;
const scaledH = Math.round(meta.height * K);
const OY = Math.max(0, Math.round((scaledH - H) / 2));
// Scale to the working width, then cover-crop to the working height (one resize per sharp pipeline).
const scaled = await sharp(photo).resize(W).toBuffer();
const base = await sharp(scaled).resize(W, H, { fit: 'cover' }).removeAlpha().raw().toBuffer();
const P = (x, y) => [x * K, y * K - OY];

// --- Flow field ------------------------------------------------------------------------------------
const n = W * H;
const fx = new Float32Array(n); // unit direction
const fy = new Float32Array(n);
const speed = new Float32Array(n); // px per second
const period = new Float32Array(n); // px slid before the copy fades out
const weight = new Float32Array(n); // 0 = still, 1 = fully moving

for (const road of spec.roads ?? []) {
  const pts = road.pts.map(([x, y, w]) => [...P(x, y), w * K]);
  const wMax = Math.max(...pts.map((p) => p[2]));
  for (let s = 0; s < pts.length - 1; s++) {
    const [ax, ay, aw] = pts[s];
    const [bx, by, bw] = pts[s + 1];
    const dx = bx - ax;
    const dy = by - ay;
    const L = Math.hypot(dx, dy);
    const tx = dx / L;
    const ty = dy / L;
    const reach = Math.max(aw, bw);
    const x0 = Math.max(0, Math.floor(Math.min(ax, bx) - reach));
    const x1 = Math.min(W - 1, Math.ceil(Math.max(ax, bx) + reach));
    const y0 = Math.max(0, Math.floor(Math.min(ay, by) - reach));
    const y1 = Math.min(H - 1, Math.ceil(Math.max(ay, by) + reach));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const u = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (L * L)));
        const half = aw + (bw - aw) * u;
        const side = (x - ax) * ty - (y - ay) * tx; // > 0: right of the direction of travel
        const d = Math.hypot(x - (ax + u * dx), y - (ay + u * dy));
        if (d > half) continue;
        const m = Math.min(1, (half - d) / Math.max(3, half * 0.12));
        const p = y * W + x;
        if (m <= weight[p]) continue;
        const sign = road.oneway ? 1 : side >= 0 ? 1 : -1;
        const depth = half / wMax; // narrower = farther away = slower on screen
        weight[p] = m;
        fx[p] = tx * sign;
        fy[p] = ty * sign;
        speed[p] = CAR_PX_S * (road.speed ?? 1) * Math.max(0.15, depth);
        period[p] = Math.max(18, 70 * K * Math.max(0.2, depth));
      }
    }
  }
}

const inside = (poly, x, y) => {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
};
for (const crowd of spec.crowds ?? []) {
  const poly = crowd.poly.map(([x, y]) => P(x, y));
  const len = Math.hypot(...crowd.dir);
  const [dx, dy] = [crowd.dir[0] / len, crowd.dir[1] / len];
  const lane = 9 * K; // alternating strips walk opposite ways
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  for (let y = Math.max(0, Math.floor(Math.min(...ys))); y <= Math.min(H - 1, Math.ceil(Math.max(...ys))); y++) {
    for (let x = Math.max(0, Math.floor(Math.min(...xs))); x <= Math.min(W - 1, Math.ceil(Math.max(...xs))); x++) {
      if (!inside(poly, x, y)) continue;
      const p = y * W + x;
      const strip = Math.floor((x * -dy + y * dx) / lane);
      const sign = strip % 2 ? 1 : -1;
      weight[p] = 1;
      fx[p] = dx * sign;
      fy[p] = dy * sign;
      speed[p] = WALK_PX_S * K * (crowd.speed ?? 1);
      period[p] = 16 * K;
    }
  }
}

// --- Tilt-shift mask -------------------------------------------------------------------------------
// The sharp band, moved from photo coordinates to the reel frame (crop offset of the push-in start).
const cropY = (H - OUT_H) * 0.5;
const [f0, f1] = (spec.focus ?? [meta.height * 0.4, meta.height * 0.7]).map((y) => y * K - OY - cropY);
const tilt = Buffer.alloc(OUT_W * OUT_H);
for (let y = 0; y < OUT_H; y++) {
  let v = y < f0 ? (f0 - y) / 420 : y > f1 ? (y - f1) / 420 : 0;
  v = Math.min(1, v);
  v = v * v * (3 - 2 * v);
  tilt.fill(Math.round(v * 255), y * OUT_W, (y + 1) * OUT_W);
}
const tiltFile = join(tmpdir(), `mini-tilt-${process.pid}.png`);
writeFileSync(tiltFile, await sharp(tilt, { raw: { width: OUT_W, height: OUT_H, channels: 1 } }).png().toBuffer());

// --- Render ----------------------------------------------------------------------------------------
const T = SECONDS;
const grade =
  GRADE === 'night'
    ? `eq=brightness='-0.04-0.08*t/${T}':saturation=1.1:eval=frame,colorbalance=bs=0.08:bm=0.04`
    : `eq=brightness='0.03-0.05*t/${T}':eval=frame`;
const ff = spawn(
  FFMPEG,
  [
    '-loglevel', 'error', '-y',
    '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
    '-loop', '1', '-framerate', String(FPS), '-t', String(T), '-i', tiltFile,
    '-filter_complex',
    `[0:v]eq=saturation=1.4:contrast=1.12:gamma=1.05,unsharp=5:5:0.8,scale='${W}*(1+0.08*t/${T})':-2:eval=frame[z];` +
      `[z]crop=${OUT_W}:${OUT_H}:x='(iw-${OUT_W})/2':y='(ih-${OUT_H})*0.5'[base];[base]split[a][b];[b]gblur=sigma=16[bl];` +
      `[1:v]format=gray[m];[bl][m]alphamerge[blm];[a][blm]overlay=0:0,${grade},vignette=PI/6,format=yuv420p[out]`,
    '-map', '[out]', '-t', String(T), '-r', String(FPS), '-c:v', 'libx264', '-crf', '18', out,
  ],
  { stdio: ['pipe', 'inherit', 'inherit'] }
);

const frame = Buffer.alloc(n * 3);
const sample = (x, y, c) => {
  x = Math.max(0, Math.min(W - 1.001, x));
  y = Math.max(0, Math.min(H - 1.001, y));
  const x0 = x | 0;
  const y0 = y | 0;
  const ax = x - x0;
  const ay = y - y0;
  const i = (y0 * W + x0) * 3 + c;
  return (base[i] * (1 - ax) + base[i + 3] * ax) * (1 - ay) + (base[i + W * 3] * (1 - ax) + base[i + W * 3 + 3] * ax) * ay;
};
const frames = Math.round(T * FPS);
for (let f = 0; f < frames; f++) {
  const t = f / FPS;
  for (let p = 0; p < n; p++) {
    const i = p * 3;
    const m = weight[p];
    if (m === 0) {
      frame[i] = base[i];
      frame[i + 1] = base[i + 1];
      frame[i + 2] = base[i + 2];
      continue;
    }
    const x = p % W;
    const y = (p / W) | 0;
    const per = period[p];
    const ph0 = ((speed[p] * t) % per) / per; // 0..1
    const ph1 = (ph0 + 0.5) % 1;
    const w0 = 1 - Math.abs(2 * ph0 - 1); // a copy is fully shown mid-slide, invisible at the jump
    const o0 = (ph0 - 0.5) * per;
    const o1 = (ph1 - 0.5) * per;
    for (let c = 0; c < 3; c++) {
      const v = w0 * sample(x - fx[p] * o0, y - fy[p] * o0, c) + (1 - w0) * sample(x - fx[p] * o1, y - fy[p] * o1, c);
      frame[i + c] = base[i + c] * (1 - m) + v * m;
    }
  }
  if (!ff.stdin.write(Buffer.from(frame))) await new Promise((r) => ff.stdin.once('drain', r));
}
ff.stdin.end();
await new Promise((resolve, reject) => ff.on('close', (code) => (code ? reject(new Error(`ffmpeg exited ${code}`)) : resolve())));
console.log(`✓ ${out}`);
