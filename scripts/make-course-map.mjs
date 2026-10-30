// Course map for a blog post: numbered stops joined by a route line over an OpenStreetMap base map,
// with each stop's crowd forecast. 1080x1350 PNG.
// usage: node scripts/make-course-map.mjs <spec.json>
//   spec: { out, title, subtitle, footnote, stops: [{ name, lat, lng, when, rate }], legs: ["도보", ...] }
//   legs[i] labels the way from stop i to stop i+1 ("도보" draws a dotted walking line).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

const spec = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const W = 1080;
const H = 1350;
const TILE = 256;
const FONT = 'Apple SD Gothic Neo';
const CACHE = join(tmpdir(), 'checkeastpoint-osm-tiles');
mkdirSync(CACHE, { recursive: true });

// Web Mercator pixel position at zoom z.
const px = (lng, z) => ((lng + 180) / 360) * TILE * 2 ** z;
const py = (lat, z) => {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * TILE * 2 ** z;
};

// Highest zoom whose 4:5 window (stops kept inside the middle of the frame) is at most 2x the output.
const lats = spec.stops.map((s) => s.lat);
const lngs = spec.stops.map((s) => s.lng);
let z = 17;
let view;
for (; z >= 8; z--) {
  const x0 = px(Math.min(...lngs), z);
  const x1 = px(Math.max(...lngs), z);
  const y0 = py(Math.max(...lats), z);
  const y1 = py(Math.min(...lats), z);
  // Stops use the middle 62% of the width and the band between the header and footer (52% of the height).
  const vw = Math.max((x1 - x0) / 0.62, ((y1 - y0) / 0.52) * (W / H), W * 0.6);
  if (vw <= W * 2) {
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2 + vw * (H / W) * 0.04; // stops sit a little below centre (header is taller)
    view = { left: cx - vw / 2, top: cy - (vw * H) / W / 2, width: vw, height: (vw * H) / W };
    break;
  }
}
if (!view) throw new Error('Stops are too far apart for one map');

async function tile(x, y) {
  const file = join(CACHE, `${z}-${x}-${y}.png`);
  if (!existsSync(file)) {
    const r = await fetch(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`, { headers: { 'User-Agent': 'checkeastpoint-course-map/1.0 (contact@checkeastpoint.com)' } });
    if (!r.ok) throw new Error(`tile ${z}/${x}/${y}: HTTP ${r.status}`);
    writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  }
  return file;
}

// Stitch the tiles under the view, then crop and scale to the output size.
const tx0 = Math.floor(view.left / TILE);
const ty0 = Math.floor(view.top / TILE);
const tx1 = Math.floor((view.left + view.width) / TILE);
const ty1 = Math.floor((view.top + view.height) / TILE);
const tiles = [];
for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) tiles.push({ input: await tile(tx, ty), left: (tx - tx0) * TILE, top: (ty - ty0) * TILE });
const mosaic = await sharp({ create: { width: (tx1 - tx0 + 1) * TILE, height: (ty1 - ty0 + 1) * TILE, channels: 3, background: '#f2efe9' } })
  .composite(tiles)
  .png()
  .toBuffer();
const base = await sharp(mosaic)
  .extract({ left: Math.round(view.left - tx0 * TILE), top: Math.round(view.top - ty0 * TILE), width: Math.round(view.width), height: Math.round(view.height) })
  .resize(W, H)
  .modulate({ saturation: 0.55, brightness: 1.04 })
  .png()
  .toBuffer();

const scale = W / view.width;
const at = (s) => ({ x: (px(s.lng, z) - view.left) * scale, y: (py(s.lat, z) - view.top) * scale });
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const STATUS = (rate) =>
  rate >= 85 ? ['매우 붐빔', '#dc2626'] : rate >= 70 ? ['붐빔', '#ea580c'] : rate >= 40 ? ['보통', '#ca8a04'] : ['여유', '#16a34a'];
const ACCENT = '#2563eb';

const pts = spec.stops.map(at);
const svg = [];
const legLabels = [];
// Route legs: a white casing under a coloured line; walking legs dotted.
spec.stops.slice(1).forEach((_, i) => {
  const a = pts[i];
  const b = pts[i + 1];
  const walk = spec.legs?.[i] === '도보';
  svg.push(
    `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="white" stroke-width="16" stroke-linecap="round"/>`,
    `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${ACCENT}" stroke-width="8" stroke-linecap="round" ${walk ? 'stroke-dasharray="2 16"' : 'stroke-dasharray="26 14"'}/>`
  );
  if (spec.legs?.[i]) {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const label = esc(spec.legs[i]);
    const w = 28 + label.length * 22;
    legLabels.push(
      `<rect x="${mx - w / 2}" y="${my - 22}" width="${w}" height="44" rx="22" fill="${ACCENT}" stroke="white" stroke-width="3"/>`,
      `<text x="${mx}" y="${my + 9}" font-family="${FONT}" font-weight="700" font-size="24" fill="white" text-anchor="middle">${label}</text>`
    );
  }
});
// Stops: numbered pin plus a card with name, time of day and the crowd forecast.
spec.stops.forEach((s, i) => {
  const p = pts[i];
  const [label, color] = STATUS(s.rate);
  const cardW = Math.max(300, 46 + s.name.length * 36);
  const right = p.x + 50 + cardW < W - 24;
  const cx = right ? p.x + 48 : p.x - 48 - cardW;
  const cy = Math.min(Math.max(p.y - 58, 300), H - 230);
  svg.push(
    `<rect x="${cx}" y="${cy}" width="${cardW}" height="116" rx="22" fill="white" fill-opacity="0.95" stroke="#e2e8f0" stroke-width="2"/>`,
    `<text x="${cx + 22}" y="${cy + 48}" font-family="${FONT}" font-weight="800" font-size="34" fill="#0f172a">${esc(s.name)}</text>`,
    `<text x="${cx + 22}" y="${cy + 92}" font-family="${FONT}" font-weight="600" font-size="24" fill="#64748b">${esc(s.when)}</text>`,
    `<rect x="${cx + cardW - 150}" y="${cy + 66}" width="132" height="38" rx="19" fill="${color}" fill-opacity="0.14"/>`,
    `<text x="${cx + cardW - 84}" y="${cy + 93}" font-family="${FONT}" font-weight="800" font-size="22" fill="${color}" text-anchor="middle">${label} ${Math.round(s.rate)}</text>`,
    `<circle cx="${p.x}" cy="${p.y}" r="34" fill="${ACCENT}" stroke="white" stroke-width="7"/>`,
    `<text x="${p.x}" y="${p.y + 13}" font-family="${FONT}" font-weight="800" font-size="36" fill="white" text-anchor="middle">${i + 1}</text>`
  );
});
// Leg labels on top of the cards so none is hidden; then header and footer panels.
svg.push(
  ...legLabels,
  `<rect x="32" y="32" width="${W - 64}" height="200" rx="36" fill="white" fill-opacity="0.94"/>`,
  `<text x="70" y="104" font-family="${FONT}" font-weight="700" font-size="32" fill="${ACCENT}">${esc(spec.subtitle)}</text>`,
  `<text x="70" y="176" font-family="${FONT}" font-weight="800" font-size="62" fill="#0f172a">${esc(spec.title)}</text>`,
  `<rect x="32" y="${H - 120}" width="${W - 64}" height="88" rx="28" fill="white" fill-opacity="0.94"/>`,
  `<text x="64" y="${H - 82}" font-family="${FONT}" font-weight="600" font-size="20" fill="#64748b">${esc(spec.footnote)}</text>`,
  `<text x="64" y="${H - 50}" font-family="${FONT}" font-weight="600" font-size="20" fill="#94a3b8">지도 © OpenStreetMap contributors</text>`,
  `<text x="${W - 64}" y="${H - 62}" font-family="${FONT}" font-weight="800" font-size="28" fill="#0f172a" text-anchor="end">checkeastpoint.com</text>`
);

await sharp(base)
  .composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${svg.join('')}</svg>`) }])
  .png()
  .toFile(spec.out);
console.log(`✓ ${spec.out} (zoom ${z}, ${tiles.length} tiles)`);
