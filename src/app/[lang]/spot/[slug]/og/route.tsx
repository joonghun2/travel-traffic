import { ImageResponse } from 'next/og';
import { LANGS, isLang } from '@/lib/i18n/routing';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { getAllSpotSlugs, getHourlyForecast, getSpotBySlug } from '@/lib/spots';

const size = { width: 1200, height: 630 };

// Served at /spot/<slug>/og (Korean, via rewrite), /en/spot/<slug>/og, /ja/spot/<slug>/og.
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.flatMap((lang) => getAllSpotSlugs().map((slug) => ({ lang, slug })));
}

// Satori has no CJK glyphs, so fetch a Google Fonts subset containing only the text we draw.
async function loadFont(family: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@700&text=${encodeURIComponent(text)}`)
    ).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    return await (await fetch(src)).arrayBuffer();
  } catch {
    return null;
  }
}

function barColor(score: number) {
  if (score >= 85) return '#f43f5e';
  if (score >= 70) return '#f97316';
  if (score >= 40) return '#fbbf24';
  return '#10b981';
}

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const spot = getSpotBySlug(slug);
  if (!spot || !isLang(lang)) {
    return new ImageResponse(<div style={{ display: 'flex' }}>Check East Point</div>, size);
  }

  const tr = TRANSLATIONS[lang];
  const name = spot.name[lang];
  const area = spot.area?.[lang] || '';
  const bestTime = spot.bestTime[lang];
  const heading = tr['spot.home'];
  const bestLabel = tr['card.bestTime'];
  const forecastLabel = tr['spot.hourlyTitle'];
  const forecast = getHourlyForecast(spot, false).filter((p) => p.hour >= 7);

  const text = `${name}${area}${bestTime}${heading}${bestLabel}${forecastLabel}Check East Point LIVE 0123456789`;
  const fonts = (
    await Promise.all([
      loadFont('Noto+Sans+KR', text).then((data) => data && { name: 'NotoKR', data, weight: 700 as const }),
      loadFont('Noto+Sans+JP', text).then((data) => data && { name: 'NotoJP', data, weight: 700 as const }),
    ])
  ).filter((f): f is NonNullable<typeof f> => f !== null);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 64px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          color: 'white',
          fontFamily: lang === 'ja' ? 'NotoJP, NotoKR' : 'NotoKR, NotoJP',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(45deg, #2563eb, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
            }}
          >
            C
          </div>
          <div style={{ fontSize: 30, display: 'flex' }}>Check East Point</div>
          <div
            style={{
              display: 'flex',
              marginLeft: 8,
              padding: '4px 14px',
              borderRadius: 999,
              border: '2px solid #34d399',
              color: '#6ee7b7',
              fontSize: 20,
            }}
          >
            LIVE
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 26, color: '#93c5fd', display: 'flex' }}>{heading}</div>
          <div style={{ fontSize: name.length > 24 ? 56 : 68, lineHeight: 1.15, display: 'flex' }}>{name}</div>
          {area && <div style={{ fontSize: 28, color: '#cbd5e1', display: 'flex' }}>{area}</div>}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 560 }}>
            <div style={{ fontSize: 22, color: '#93c5fd', display: 'flex' }}>⏰ {bestLabel}</div>
            <div style={{ fontSize: 30, display: 'flex' }}>{bestTime}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 20, color: '#93c5fd', display: 'flex' }}>{forecastLabel}</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 120 }}>
              {forecast.map((p) => (
                <div
                  key={p.hour}
                  style={{
                    width: 18,
                    height: `${Math.max(8, p.score)}%`,
                    borderRadius: 4,
                    background: barColor(p.score),
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined }
  );
}
