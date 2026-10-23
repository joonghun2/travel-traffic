import { ImageResponse } from 'next/og';
import QRCode from 'qrcode';
import { Lang } from '@/types';
import { SITE_URL, localizePath } from '@/lib/i18n/routing';
import { cjkFontFamily, loadCjkFonts } from '@/lib/ogFonts';
import { STATS, Stats, TEST_PATH, THEME, TYPES, TypeKey, grade, isPlanner, loc, tt } from '@/lib/travelType';
import { withUtm } from '@/lib/utm';

export type CardSize = 'og' | 'feed' | 'story';
const SIZES: Record<CardSize, { width: number; height: number }> = {
  og: { width: 1200, height: 630 },
  feed: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
};

/** Hexagon radar as Satori-friendly SVG (shapes only; labels are absolutely positioned divs). */
function Radar({ stats, size, accent, soft, labels }: { stats: Stats; size: number; accent: string; soft: string; labels: Record<string, string> }) {
  const c = size / 2;
  const r = size * 0.34;
  const pt = (i: number, rr: number) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 3;
    return [c + rr * Math.cos(a), c + rr * Math.sin(a)];
  };
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, (r * v) / 100).join(',')).join(' ');
  const font = Math.round(size * 0.05);
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {[25, 50, 75, 100].map((f) => (
          <polygon key={f} points={poly([f, f, f, f, f, f])} fill="none" stroke="#1e1b2e" strokeOpacity={0.15} strokeWidth={2} />
        ))}
        {STATS.map((s, i) => {
          const [x, y] = pt(i, r);
          return <line key={s} x1={c} y1={c} x2={x} y2={y} stroke="#1e1b2e" strokeOpacity={0.15} strokeWidth={2} />;
        })}
        <polygon points={poly(STATS.map((s) => stats[s]))} fill={soft} fillOpacity={0.85} stroke={accent} strokeWidth={5} strokeLinejoin="round" />
      </svg>
      {STATS.map((s, i) => {
        const [x, y] = pt(i, r + font * 1.6);
        return (
          <div
            key={s}
            style={{
              position: 'absolute',
              left: x - 170,
              top: y - font * 0.75,
              width: 340,
              display: 'flex',
              justifyContent: 'center',
              whiteSpace: 'nowrap',
              fontSize: font,
              color: '#1e1b2e',
            }}
          >
            {`${labels[s]} ${stats[s]}`}
          </div>
        );
      })}
    </div>
  );
}

/** Font size that fits `text` on one line in `width` px (CJK glyphs ~1em, Latin ~0.55em). */
const fit = (text: string, width: number, max: number) => {
  const ems = [...text].reduce((n, ch) => n + (ch.charCodeAt(0) < 0x2e80 ? 0.56 : 1), 0);
  return Math.floor(Math.min(max, width / Math.max(ems, 1)));
};

export async function renderTypeCard({ key, stats, lang, size, personal }: { key: TypeKey; stats: Stats; lang: Lang; size: CardSize; personal: boolean }) {
  const { width, height } = SIZES[size];
  const theme = THEME[key];
  const info = TYPES[key];
  const name = loc(info.name, lang);
  const tagline = loc(info.tagline, lang);
  const prefix = personal ? tt(isPlanner(stats) ? 'planner' : 'spontaneous', lang) : '';
  const title = tt('title', lang);
  const labels = Object.fromEntries(STATS.map((s) => [s, tt(`stat.${s}`, lang)]));
  const link = withUtm(`${SITE_URL}${localizePath(TEST_PATH, lang)}`, { source: 'card', medium: 'image', campaign: 'travel-type', content: `${info.slug}-${size}` });
  const qr = size === 'og' ? null : await QRCode.toDataURL(link, { width: 300, margin: 1, color: { dark: theme.accent, light: '#ffffff' } });
  const text = `${name}${tagline}${prefix}${title}${Object.values(labels).join('')}${tt('start', lang)}Check East Point checkeastpoint.com SABC 0123456789`;
  const fonts = await loadCjkFonts(text, 800, lang);

  const grades = (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
      {STATS.map((s) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 999, background: 'rgba(255,255,255,0.8)', fontSize: 30 }}>
          <span>{labels[s]}</span>
          <span style={{ color: theme.accent }}>{grade(stats[s])}</span>
        </div>
      ))}
    </div>
  );

  const body =
    size === 'og' ? (
      <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', padding: '0 70px', gap: 40 }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 14 }}>
          <div style={{ display: 'flex', fontSize: 26, color: theme.accent, whiteSpace: 'nowrap' }}>{`Check East Point · ${title}`}</div>
          <div style={{ display: 'flex', fontSize: fit(name, 560, 88), lineHeight: 1.1 }}>{name}</div>
          <div style={{ display: 'flex', fontSize: 34, opacity: 0.8 }}>{tagline}</div>
        </div>
        <Radar stats={stats} size={520} accent={theme.accent} soft={theme.soft} labels={labels} />
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', padding: size === 'story' ? '150px 70px 130px' : '70px 70px 60px' }}>
        <div style={{ display: 'flex', fontSize: 32, color: theme.accent }}>{`Check East Point · ${title}`}</div>
        {prefix && <div style={{ display: 'flex', marginTop: size === 'story' ? 60 : 36, fontSize: 38, color: theme.accent }}>{prefix}</div>}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: prefix ? 18 : 40, height: Math.round(fit(name, 920, 104) * 1.45), fontSize: fit(name, 920, 104), whiteSpace: 'nowrap' }}>{name}</div>
        <div style={{ display: 'flex', marginTop: 8, fontSize: fit(tagline, 940, 38), opacity: 0.8, whiteSpace: 'nowrap' }}>{tagline}</div>
        <div style={{ display: 'flex', marginTop: size === 'story' ? 50 : 16 }}>
          <Radar stats={stats} size={size === 'story' ? 860 : 700} accent={theme.accent} soft={theme.soft} labels={labels} />
        </div>
        {grades}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginTop: 'auto' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {qr && <img src={qr} width={150} height={150} style={{ borderRadius: 18 }} alt="" />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', fontSize: 40 }}>{tt('start', lang)}</div>
            <div style={{ display: 'flex', fontSize: 30, color: theme.accent }}>checkeastpoint.com</div>
          </div>
        </div>
      </div>
    );

  return new ImageResponse(
    <div style={{ display: 'flex', width: '100%', height: '100%', background: theme.bg, color: '#1e1b2e', fontFamily: cjkFontFamily(lang) }}>{body}</div>,
    { width, height, fonts }
  );
}
