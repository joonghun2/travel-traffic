import { ImageResponse } from 'next/og';
import { cjkFontFamily, loadCjkFonts } from '@/lib/ogFonts';
import { isLang, pick } from '@/lib/i18n/routing';
import { getSpotBySlug } from '@/lib/spots';
import { getCrowdSnapshot } from '@/lib/crowdSnapshot';
import { computeLiveSpotMetric } from '@/lib/crowdEngine';
import { courseStops } from '@/lib/course';
import { Lang } from '@/types';

// Share-card infographic for the "best course right now" card: /share/course/<slug>?lang=ko.
// 800x400 (Kakao feed ratio). Rendered on request and cached at the CDN for 5 minutes only (no ISR
// writes; see the Vercel Hobby limits note), since the order follows the live crowd scores.
export const dynamic = 'force-dynamic';

const W = 800;
const H = 400;
const TONE: Record<string, { bg: string; fg: string }> = {
  relaxed: { bg: '#d1fae5', fg: '#047857' },
  moderate: { bg: '#fef3c7', fg: '#b45309' },
  crowded: { bg: '#ffedd5', fg: '#c2410c' },
  very_crowded: { bg: '#ffe4e6', fg: '#be123c' },
  packed: { bg: '#ffe4e6', fg: '#be123c' },
};
const TEXT = {
  ko: { title: '잠실 최적 코스', sub: '지금 가장 한산한 곳부터', live: '실시간 혼잡도', status: { relaxed: '여유', moderate: '보통', crowded: '혼잡', very_crowded: '매우 혼잡', packed: '매우 혼잡' } },
  en: { title: 'Best Jamsil route', sub: 'Quietest spot first', live: 'Live crowd levels', status: { relaxed: 'Quiet', moderate: 'Moderate', crowded: 'Busy', very_crowded: 'Very busy', packed: 'Very busy' } },
} as const;

const short = (s: string) => s.split(/\s*[&(]\s*/)[0].trim();

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const spot = getSpotBySlug(slug);
  if (!spot) return new Response('Not found', { status: 404 });
  const q = new URL(request.url).searchParams.get('lang') ?? 'ko';
  const lang: Lang = isLang(q) ? q : 'ko';
  const t = lang === 'ko' ? TEXT.ko : TEXT.en;

  const snapshot = await getCrowdSnapshot();
  const metric = snapshot.spots.find((s) => s.id === spot.id) ?? computeLiveSpotMetric(spot);
  const stops = courseStops(spot, metric, snapshot.spots);
  const kst = new Date(Date.now() + 9 * 3600 * 1000);
  const time = `${kst.getUTCMonth() + 1}/${kst.getUTCDate()} ${String(kst.getUTCHours()).padStart(2, '0')}:${String(kst.getUTCMinutes()).padStart(2, '0')}`;
  const names = stops.map((s) => short(pick(s.spot.name, lang)));
  const text = `${t.title}${t.sub}${t.live}${Object.values(t.status).join('')}${names.join('')}${time}0123456789·checkeastpoint.com→`;
  const fonts = await loadCjkFonts(text, 800, lang);

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          padding: '28px 32px 24px',
          backgroundImage: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 55%, #0e7490 100%)',
          fontFamily: cjkFontFamily(lang),
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 38, fontWeight: 800 }}>🗺️ {t.title}</div>
            <div style={{ display: 'flex', marginTop: 2, fontSize: 20, opacity: 0.85 }}>{t.sub}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', borderRadius: 999, background: 'rgba(255,255,255,0.15)', fontSize: 18 }}>
            <div style={{ display: 'flex', width: 10, height: 10, borderRadius: 999, background: '#34d399', marginRight: 8 }} />
            {t.live} · {time}
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, marginTop: 20, gap: 12 }}>
          {stops.map((s, i) => {
            const tone = TONE[s.m.status] ?? TONE.moderate;
            return (
              <div
                key={s.spot.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  padding: '14px 14px',
                  borderRadius: 24,
                  background: 'rgba(255,255,255,0.96)',
                  color: '#0f172a',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', width: 36, height: 36, borderRadius: 999, background: '#0f172a', color: 'white', fontSize: 20, fontWeight: 800, alignItems: 'center', justifyContent: 'center' }}>
                    {i + 1}
                  </div>
                  <div style={{ display: 'flex', fontSize: 30 }}>{s.spot.emoji}</div>
                </div>
                <div style={{ display: 'flex', marginTop: 10, fontSize: 20, fontWeight: 800, lineHeight: 1.25, height: 52, wordBreak: 'keep-all', overflow: 'hidden' }}>{names[i]}</div>
                <div style={{ display: 'flex', marginTop: 'auto', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', fontSize: 34, fontWeight: 800, color: tone.fg }}>{s.m.currentScore}</div>
                  <div style={{ display: 'flex', padding: '4px 12px', borderRadius: 999, background: tone.bg, color: tone.fg, fontSize: 18, fontWeight: 800 }}>
                    {t.status[s.m.status as keyof typeof t.status] ?? ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 18, opacity: 0.9 }}>
          <div style={{ display: 'flex' }}>{stops.map((_, i) => `${i + 1}`).join(' → ')}</div>
          <div style={{ display: 'flex', fontWeight: 800 }}>checkeastpoint.com</div>
        </div>
      </div>
    ),
    { width: W, height: H, fonts, headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
  );
}
