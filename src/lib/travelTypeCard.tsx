import { ImageResponse } from 'next/og';
import QRCode from 'qrcode';
import { Lang } from '@/types';
import { SITE_URL, localizePath } from '@/lib/i18n/routing';
import { cjkFontFamily, loadCjkFonts } from '@/lib/ogFonts';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { FUN, RARITY, Stats, TEST_PATH, THEME, TYPES, TypeKey, cardArt, cardFace, isPlanner, loc, tt } from '@/lib/travelType';
import { withUtm } from '@/lib/utm';

export type CardSize = 'og' | 'feed' | 'story';
const SIZES: Record<CardSize, { width: number; height: number }> = {
  og: { width: 1200, height: 630 },
  feed: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
};

/** Font size that fits `text` on one line in `width` px (CJK glyphs ~1em, Latin ~0.55em). */
const fit = (text: string, width: number, max: number) => {
  const ems = [...text].reduce((n, ch) => n + (ch.charCodeAt(0) < 0x2e80 ? 0.56 : 1), 0);
  return Math.floor(Math.min(max, width / Math.max(ems, 1)));
};

/** Card art as a data URL: from public/ when the files are there (dev, build), else the live site. */
export async function artDataUrl(key: TypeKey): Promise<string | null> {
  const path = cardArt(key);
  try {
    const buf = await readFile(join(process.cwd(), 'public', path));
    return `data:image/jpeg;base64,${buf.toString('base64')}`;
  } catch {}
  try {
    const res = await fetch(`${SITE_URL}${path}`);
    if (res.ok) return `data:image/jpeg;base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`;
  } catch {}
  return null;
}

/** The trading card itself at a given width (height is 7/5 of it); same layout as TravelCard. */
export function CardFace({ k, stats, lang, badge, art, w }: { k: TypeKey; stats: Stats; lang: Lang; badge: string; art: string | null; w: number }) {
  const theme = THEME[k];
  const info = TYPES[k];
  const face = cardFace(stats, lang);
  const u = w / 360; // design units: TravelCard is laid out at 360 px wide
  const h = Math.round(w * 1.4);
  const inner = { w: w - 18 * u, h: h - 18 * u };
  const shadow = `0 ${2 * u}px 0 rgba(0,0,0,0.55)`;
  return (
    <div
      style={{
        display: 'flex',
        width: w,
        height: h,
        padding: 9 * u,
        borderRadius: 22 * u,
        background: `linear-gradient(135deg, ${theme.accent} 0%, #fde68a 30%, ${theme.soft} 52%, #ffffff 64%, ${theme.accent} 100%)`,
      }}
    >
      <div style={{ display: 'flex', position: 'relative', width: inner.w, height: inner.h, borderRadius: 15 * u, overflow: 'hidden', background: '#0f172a' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {art && <img src={art} width={inner.w} height={inner.h} style={{ position: 'absolute', top: 0, left: 0, objectFit: 'cover' }} alt="" />}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: inner.w,
            display: 'flex',
            justifyContent: 'space-between',
            padding: `${10 * u}px ${12 * u}px ${32 * u}px`,
            backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.25), rgba(0,0,0,0))',
            color: 'white',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignSelf: 'flex-start', padding: `${2 * u}px ${8 * u}px`, borderRadius: 999, background: 'rgba(255,255,255,0.85)', color: theme.accent, fontSize: 10 * u }}>
              {badge}
            </div>
            <div style={{ display: 'flex', marginTop: 4 * u, fontSize: fit(loc(info.name, lang), 230 * u, 24 * u), textShadow: shadow }}>{loc(info.name, lang)}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', fontSize: 10 * u }}>{tt('power', lang)}</div>
            <div style={{ display: 'flex', fontSize: 30 * u, lineHeight: 1, marginTop: 4 * u, textShadow: shadow }}>{String(face.power)}</div>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: inner.w,
            display: 'flex',
            flexDirection: 'column',
            padding: `${40 * u}px ${12 * u}px ${10 * u}px`,
            backgroundImage: 'linear-gradient(to top, #ffffff, rgba(255,255,255,0.95) 70%, rgba(255,255,255,0))',
            color: '#0f172a',
          }}
        >
          {face.moves.map((m, i) => (
            <div key={m.stat} style={{ display: 'flex', flexDirection: 'column', padding: `${6 * u}px 0`, borderBottom: `${u}px solid rgba(15,23,42,0.1)` }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', marginRight: 8 * u }}>
                  {Array.from({ length: m.dots }, (_, d) => (
                    <div key={d} style={{ display: 'flex', width: 14 * u, height: 14 * u, marginRight: 2 * u, borderRadius: 999, background: m.color, border: `${u}px solid white` }} />
                  ))}
                </div>
                <div style={{ display: 'flex', flex: 1, fontSize: fit(m.name, 200 * u, 14 * u) }}>{m.name}</div>
                <div style={{ display: 'flex', fontSize: 20 * u }}>{String(m.value)}</div>
              </div>
              {i === 1 && <div style={{ display: 'flex', marginTop: 2 * u, fontSize: 11 * u, color: '#475569', lineHeight: 1.35 }}>{loc(FUN[k].habit, lang)}</div>}
            </div>
          ))}
          <div style={{ display: 'flex', marginTop: 6 * u, fontSize: 10 * u }}>
            <div style={{ display: 'flex', flex: 1, marginRight: 6 * u, padding: `${4 * u}px ${8 * u}px`, borderRadius: 6 * u, background: 'rgba(15,23,42,0.05)', whiteSpace: 'nowrap', fontSize: fit(`${tt('weakness', lang)} · ${loc(TYPES[info.clash].name, lang)} +20`, 150 * u, 10 * u) }}>
              {`${tt('weakness', lang)} · ${loc(TYPES[info.clash].name, lang)} +20`}
            </div>
            <div style={{ display: 'flex', flex: 1, padding: `${4 * u}px ${8 * u}px`, borderRadius: 6 * u, background: 'rgba(15,23,42,0.05)' }}>
              {`${tt('retreat', lang)} ${'●'.repeat(face.homesick)}`}
            </div>
          </div>
          <div style={{ display: 'flex', marginTop: 6 * u, padding: `${6 * u}px ${10 * u}px`, borderRadius: 8 * u, background: theme.bg, fontSize: 11.5 * u, lineHeight: 1.35 }}>
            {`“${loc(FUN[k].roast, lang)}”`}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 * u, fontSize: 9 * u, color: '#64748b' }}>
            <span>Illus. Check East Point</span>
            <span>{tt('rarity', lang, { n: RARITY[k] })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Every character a card face (plus the page around it) draws, for loading just those font glyphs. */
export function cardText(key: TypeKey, stats: Stats, lang: Lang, badge: string) {
  const info = TYPES[key];
  return [
    loc(info.name, lang),
    loc(TYPES[info.clash].name, lang),
    loc(FUN[key].roast, lang),
    loc(FUN[key].habit, lang),
    ...cardFace(stats, lang).moves.map((m) => m.name),
    badge,
    tt('title', lang),
    ...['power', 'weakness', 'retreat', 'start', 'introFun'].map((k) => tt(k, lang)),
    tt('rarity', lang, { n: RARITY[key] }),
    'Check East Point checkeastpoint.com Illus. “”·+●0123456789',
  ].join('');
}

export async function renderTypeCard({ key, stats, lang, size, personal }: { key: TypeKey; stats: Stats; lang: Lang; size: CardSize; personal: boolean }) {
  const { width, height } = SIZES[size];
  const theme = THEME[key];
  const info = TYPES[key];
  const badge = personal ? tt(isPlanner(stats) ? 'planner' : 'spontaneous', lang) : tt('cardBadge', lang);
  const title = tt('title', lang);
  const link = withUtm(`${SITE_URL}${localizePath(TEST_PATH, lang)}`, { source: 'card', medium: 'image', campaign: 'travel-type', content: `${info.slug}-${size}` });
  const [qr, art] = await Promise.all([
    size === 'og' ? null : QRCode.toDataURL(link, { width: 300, margin: 1, color: { dark: theme.accent, light: '#ffffff' } }),
    artDataUrl(key),
  ]);
  const fonts = await loadCjkFonts(cardText(key, stats, lang, badge), 800, lang);
  const card = (w: number) => <CardFace k={key} stats={stats} lang={lang} badge={badge} art={art} w={w} />;
  const header = <div style={{ display: 'flex', fontSize: 34, color: theme.accent }}>{`Check East Point · ${title}`}</div>;

  const body =
    size === 'og' ? (
      <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', padding: '0 70px', gap: 60 }}>
        {card(400)}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 18 }}>
          <div style={{ display: 'flex', fontSize: 28, color: theme.accent }}>{`Check East Point · ${title}`}</div>
          <div style={{ display: 'flex', fontSize: fit(loc(info.name, lang), 560, 84), lineHeight: 1.1 }}>{loc(info.name, lang)}</div>
          <div style={{ display: 'flex', fontSize: 32, lineHeight: 1.35, opacity: 0.85 }}>{`“${loc(FUN[key].roast, lang)}”`}</div>
        </div>
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', padding: size === 'story' ? '150px 60px 120px' : '40px 60px 36px' }}>
        {header}
        <div style={{ display: 'flex', marginTop: size === 'story' ? 50 : 24 }}>{card(size === 'story' ? 860 : 740)}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginTop: size === 'story' ? 'auto' : 26 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {qr && <img src={qr} width={size === 'story' ? 150 : 110} height={size === 'story' ? 150 : 110} style={{ borderRadius: 18 }} alt="" />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', fontSize: size === 'story' ? 40 : 32 }}>{tt('start', lang)}</div>
            <div style={{ display: 'flex', fontSize: size === 'story' ? 30 : 24, color: theme.accent }}>checkeastpoint.com</div>
          </div>
        </div>
      </div>
    );

  return new ImageResponse(
    <div style={{ display: 'flex', width: '100%', height: '100%', backgroundImage: `linear-gradient(160deg, #fff3e8, ${theme.bg})`, color: '#1e1b2e', fontFamily: cjkFontFamily(lang) }}>{body}</div>,
    { width, height, fonts }
  );
}
