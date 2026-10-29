import { ImageResponse } from 'next/og';
import QRCode from 'qrcode';
import { CityId, Lang } from '@/types';
import { SITE_URL, isLang, localizePath, pick } from '@/lib/i18n/routing';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { cjkFontFamily, loadCjkFonts } from '@/lib/ogFonts';
import { quietestSpots } from '@/lib/rankings';
import { STATUS_COLOR } from '@/lib/mapSpots';
import { withUtm } from '@/lib/utm';
import { backgroundFor, CardBackground } from '@/lib/cardBackground';

// /cards/seoul-feed.png (Korean, via rewrite), /en/cards/busan-story.png, ...
// Seoul is live, so cards regenerate every 5 minutes; Jeju/Busan change once a day.
export const revalidate = 300;
export const preferredRegion = 'icn1';

const SIZES = { feed: { width: 1080, height: 1350 }, story: { width: 1080, height: 1920 } } as const;
type SizeId = keyof typeof SIZES;

// Rendered on first request rather than at build time, when Seoul live data is not fetched.
export function generateStaticParams() {
  return [];
}

const tr = (lang: Lang, key: string, vars: Record<string, string> = {}) =>
  (TRANSLATIONS[lang][key] ?? TRANSLATIONS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

/** "2026.10.22 14:05" in Korea time. */
function kstStamp(iso: string) {
  const d = new Date(new Date(iso).getTime() + 9 * 3600 * 1000).toISOString();
  return `${d.slice(0, 10).replace(/-/g, '.')} ${d.slice(11, 16)}`;
}

export async function GET(request: Request, { params }: { params: Promise<{ lang: string; file: string }> }) {
  const { lang, file } = await params;
  const m = file.match(/^(seoul|jeju|busan)-(feed|story)\.png$/);
  if (!isLang(lang) || !m) return new Response('Not found', { status: 404 });
  const city = m[1] as CityId;
  const sizeId = m[2] as SizeId;
  const size = SIZES[sizeId];
  const story = sizeId === 'story';

  const ranking = await quietestSpots(city, 5);
  const cityName = tr(lang, `map.city.${city}`);
  const heading = tr(lang, ranking.live ? 'cards.headingLive' : 'cards.headingForecast', { city: cityName });
  const asOf = ranking.live
    ? tr(lang, 'cards.asOfLive', { time: kstStamp(ranking.asOf) })
    : tr(lang, 'cards.asOfForecast', { date: ranking.asOf.replace(/-/g, '.') });
  const badge = ranking.live ? 'LIVE' : tr(lang, 'forecast.badge');
  const cta = tr(lang, 'cards.cta');
  const rows = ranking.spots.map((r) => ({
    name: pick(r.spot.name, lang),
    area: pick(r.spot.area, lang) || '',
    emoji: r.spot.emoji,
    score: r.score,
    label: tr(lang, `card.status.${r.status}`),
    color: STATUS_COLOR[r.status],
  }));

  const hub = city === 'seoul' ? '/' : `/${city}`;
  const link = withUtm(`${SITE_URL}${localizePath(hub, lang)}`, { source: 'card', medium: 'image', campaign: 'daily-top5', content: `${city}-${sizeId}` });
  const qr = await QRCode.toDataURL(link, { width: 360, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } });

  const text = `${heading}${asOf}${badge}${cta}${rows.map((r) => r.name + r.area + r.label).join('')}Check East Point checkeastpoint.com TOP5 0123456789`;
  const fonts = await loadCjkFonts(text, 700, lang);

  const rowGap = story ? 28 : 16;
  const rowPad = story ? '30px 32px' : '18px 28px';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          padding: story ? '150px 72px 140px' : '72px 72px 64px',
          background: 'linear-gradient(160deg, #0f172a 0%, #1e3a8a 60%, #312e81 100%)',
          color: 'white',
          fontFamily: cjkFontFamily(lang),
        }}
      >
        <CardBackground src={backgroundFor(request.url, city)} {...size} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 18,
              background: 'linear-gradient(45deg, #2563eb, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 34,
            }}
          >
            C
          </div>
          <div style={{ fontSize: 32, display: 'flex' }}>Check East Point</div>
          <div style={{ display: 'flex', marginLeft: 8, padding: '4px 16px', borderRadius: 999, border: '2px solid #34d399', color: '#6ee7b7', fontSize: 22 }}>
            {badge}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', marginTop: story ? 72 : 40, gap: 14 }}>
          <div style={{ display: 'flex', fontSize: 30, color: '#93c5fd' }}>{asOf}</div>
          {story ? (
            <>
              <div style={{ display: 'flex', fontSize: 76, lineHeight: 1.15 }}>{heading}</div>
              <div style={{ display: 'flex', fontSize: 120, lineHeight: 1, color: '#6ee7b7' }}>TOP5</div>
            </>
          ) : (
            // Feed is 570px shorter: keep TOP5 on the heading line.
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 20, fontSize: heading.length > 14 ? 50 : 58, lineHeight: 1.15 }}>
              <span>{heading}</span>
              <span style={{ color: '#6ee7b7' }}>TOP5</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: rowGap, marginTop: story ? 64 : 36, marginBottom: 32 }}>
          {rows.map((r, i) => (
            <div
              key={r.name}
              style={{ display: 'flex', alignItems: 'center', gap: 24, padding: rowPad, borderRadius: 28, background: 'rgba(255,255,255,0.09)' }}
            >
              <div style={{ display: 'flex', width: 52, fontSize: 44, color: '#93c5fd' }}>{i + 1}</div>
              <div style={{ display: 'flex', fontSize: 52 }}>{r.emoji}</div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', fontSize: r.name.length > 16 ? 34 : 42, lineHeight: 1.2 }}>{r.name}</div>
                {r.area && <div style={{ display: 'flex', fontSize: 24, color: '#cbd5e1', marginTop: 4 }}>{r.area}</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', fontSize: 46, color: r.color }}>{r.score}</div>
                <div style={{ display: 'flex', fontSize: 22, color: r.color }}>{r.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginTop: 'auto' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} width={story ? 200 : 150} height={story ? 200 : 150} style={{ borderRadius: 20 }} alt="" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', fontSize: 40 }}>{cta}</div>
            <div style={{ display: 'flex', fontSize: 30, color: '#93c5fd' }}>checkeastpoint.com</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts, headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
  );
}
