import { ImageResponse } from 'next/og';
import { cjkFontFamily, loadCjkFonts } from '@/lib/ogFonts';
import { LANGS, isLang, pick } from '@/lib/i18n/routing';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { getAllSpotSlugs, getHourlyForecast, getSpotBySlug } from '@/lib/spots';
import { getAllForecastSlugs, getForecastSpotBySlug } from '@/lib/forecastSpots';
import { getForecast } from '@/lib/forecast';
import { formatForecastDate, quietestDay } from '@/lib/forecastMap';

const size = { width: 1200, height: 630 };

// Served at /spot/<slug>/og (Korean, via rewrite), /en/spot/<slug>/og, /ja/spot/<slug>/og.
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = [...getAllSpotSlugs(), ...getAllForecastSlugs()];
  return LANGS.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
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
  const fSpot = getForecastSpotBySlug(slug);
  if ((!spot && !fSpot) || !isLang(lang)) {
    return new ImageResponse(<div style={{ display: 'flex' }}>Check East Point</div>, size);
  }

  const tr = TRANSLATIONS[lang];
  let name: string, area: string, bestTime: string, heading: string, bestLabel: string, forecastLabel: string, badge: string;
  let forecast: { key: string; score: number }[];
  let barWidth = 18;
  if (spot) {
    // Seoul: live data, hourly pattern.
    name = pick(spot.name, lang);
    area = pick(spot.area, lang) || '';
    bestTime = pick(spot.bestTime, lang);
    heading = tr['spot.home'];
    bestLabel = tr['card.bestTime'];
    forecastLabel = tr['spot.hourlyTitle'];
    badge = 'LIVE';
    forecast = getHourlyForecast(spot, false)
      .filter((p) => p.hour >= 7)
      .map((p) => ({ key: String(p.hour), score: p.score }));
  } else {
    // Jeju/Busan: KTO 30-day concentration forecast.
    const days = (await getForecast()).spots[fSpot!.id] ?? [];
    const quiet = quietestDay(days);
    name = pick(fSpot!.name, lang);
    area = pick(fSpot!.area, lang);
    bestTime = quiet ? formatForecastDate(quiet.date, lang) : '';
    heading = tr['forecast.hubName'].replace('{city}', tr[`map.city.${fSpot!.city}`]);
    bestLabel = tr['forecast.quietDays'];
    forecastLabel = tr['forecast.chartTitle'];
    badge = tr['forecast.badge'];
    forecast = days.map((d) => ({ key: d.date, score: d.rate }));
    barWidth = 10;
  }

  const text = `${name}${area}${bestTime}${heading}${bestLabel}${forecastLabel}${badge}Check East Point LIVE 0123456789`;
  const fonts = await loadCjkFonts(text, 700, lang);

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
          fontFamily: cjkFontFamily(lang),
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
            {badge}
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
                  key={p.key}
                  style={{
                    width: barWidth,
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
    { ...size, fonts }
  );
}
