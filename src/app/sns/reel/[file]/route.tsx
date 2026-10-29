import { ImageResponse } from 'next/og';
import { NextResponse } from 'next/server';
import { cjkFontFamily, loadCjkFonts } from '@/lib/ogFonts';
import { backgroundFor, CardBackground } from '@/lib/cardBackground';
import { BusiestWeek, busiestSeoulLastWeek } from '@/lib/snsReel';
import { SPOTS_DATA } from '@/data/spotsData';
import { getSpotSlug } from '@/lib/slug';

// Weekly reel "지난 한 주 서울에서 가장 붐볐던 곳은?!" (scripts/make-weekly-reel.mjs):
//   /sns/reel/beats.json          beat list, durations and caption
//   /sns/reel/hook-bg.png         scenery layer, /sns/reel/hook-text.png text layer (transparent)
//   /sns/reel/rank-3.png          both layers together (preview)
// Beats: hook, rank-5 ... rank-1, outro. 1080x1920, text kept clear of Instagram's UI.
export const preferredRegion = 'icn1';
export const revalidate = 3600;

const W = 1080;
const H = 1920;
const BEATS = ['hook', 'rank-5', 'rank-4', 'rank-3', 'rank-2', 'rank-1', 'outro'] as const;
type Beat = (typeof BEATS)[number];
// Fast tempo: quick countdown, a longer hold on #1.
const SECONDS: Record<Beat, number> = { hook: 1.6, 'rank-5': 1.1, 'rank-4': 1.1, 'rank-3': 1.1, 'rank-2': 1.1, 'rank-1': 2.0, outro: 1.8 };

const YELLOW = '#facc15';
const RED = '#f43f5e';
// Thick outline + drop shadow keep white text readable on any scenery.
const IMPACT = { color: 'white', WebkitTextStroke: '10px #0f172a', textShadow: '0 10px 0 #0f172a, 0 18px 30px rgba(0,0,0,0.45)' } as const;

const md = (ymd: string) => `${Number(ymd.slice(5, 7))}/${Number(ymd.slice(8, 10))}`;

/** Dev without Supabase keys: rank the pattern model's busiest spots so the layout can be checked. */
function demoWeek(): BusiestWeek {
  const spots = [...SPOTS_DATA].sort((a, b) => b.baseScore - a.baseScore).slice(0, 5);
  return {
    from: '2026-10-26',
    to: '2026-11-01',
    samples: 0,
    spots: spots.map((s, i) => ({ rank: i + 1, slug: getSpotSlug(s), ko: s.name.ko.split(/\s*&\s*/)[0], en: s.name.en.split(/\s*&\s*/)[0], emoji: s.emoji ?? '📍', score: 90 - i * 3 })),
  };
}

async function week(): Promise<BusiestWeek | null> {
  const w = await busiestSeoulLastWeek().catch(() => null);
  if (w?.spots.length) return w;
  return process.env.NODE_ENV === 'development' ? demoWeek() : null;
}

function caption(w: BusiestWeek) {
  const list = [...w.spots].reverse().map((s) => `${s.rank}위 ${s.ko} (${s.en}) · 평균 ${s.score}`).join('\n');
  return [
    `지난 한 주 서울에서 가장 붐볐던 곳은?! 🔥 (${md(w.from)}~${md(w.to)})`,
    ``,
    list,
    ``,
    `이번 주엔 피해서 여유롭게 가세요 😎`,
    `Seoul's most crowded spots last week. Avoid them this week!`,
    ``,
    `* 서울시 실시간 도시데이터 실측, 낮 10~22시 평균 혼잡도`,
    `실시간 혼잡도는 프로필 링크에서 → checkeastpoint.com`,
    ``,
    `#서울여행 #서울핫플 #서울가볼만한곳 #주말데이트 #seoultravel #koreatravel #seoul #reels`,
  ].join('\n');
}

function Text({ beat, w }: { beat: Beat; w: BusiestWeek }) {
  const box = { width: W, height: H, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '260px 64px 360px', textAlign: 'center' } as const;
  if (beat === 'hook') {
    return (
      <div style={box}>
        <div style={{ display: 'flex', padding: '14px 36px', borderRadius: 999, background: '#0f172a', color: YELLOW, fontSize: 44 }}>
          지난 한 주 · {md(w.from)}~{md(w.to)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 48, fontSize: 132, lineHeight: 1.15, ...IMPACT }}>
          <span>서울에서</span>
          <span style={{ color: YELLOW }}>가장 붐볐던</span>
          <span>곳은?!</span>
        </div>
        <div style={{ display: 'flex', marginTop: 40, fontSize: 48, ...IMPACT, WebkitTextStroke: '6px #0f172a' }}>Seoul&apos;s busiest spots 🔥</div>
      </div>
    );
  }
  if (beat === 'outro') {
    return (
      <div style={box}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 118, lineHeight: 1.15, ...IMPACT }}>
          <span>이번 주엔</span>
          <span style={{ color: YELLOW }}>피해서 가세요!</span>
        </div>
        <div style={{ display: 'flex', marginTop: 56, padding: '22px 44px', borderRadius: 999, background: 'white', color: '#0f172a', fontSize: 46 }}>
          실시간 혼잡도 👉 checkeastpoint.com
        </div>
        <div style={{ display: 'flex', marginTop: 28, fontSize: 30, ...IMPACT, WebkitTextStroke: '4px #0f172a' }}>* 서울시 실시간 도시데이터 실측 · 낮 시간 평균</div>
      </div>
    );
  }
  const spot = w.spots[Number(beat.slice(5)) - 1];
  if (!spot) return null;
  const first = spot.rank === 1;
  return (
    <div style={box}>
      <div style={{ display: 'flex', alignItems: 'baseline', fontSize: first ? 300 : 250, lineHeight: 1, ...IMPACT, color: first ? RED : YELLOW }}>
        {first ? '👑 ' : ''}
        {spot.rank}위
      </div>
      <div style={{ display: 'flex', marginTop: 40, fontSize: spot.ko.length > 7 ? 104 : 132, lineHeight: 1.15, ...IMPACT }}>{spot.ko}</div>
      <div style={{ display: 'flex', marginTop: 16, fontSize: 46, ...IMPACT, WebkitTextStroke: '6px #0f172a' }}>{spot.en}</div>
      <div style={{ display: 'flex', marginTop: 48, padding: '18px 40px', borderRadius: 999, background: first ? RED : '#0f172a', color: 'white', fontSize: 48 }}>
        평균 혼잡도 {spot.score}
      </div>
    </div>
  );
}

export async function GET(request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const w = await week();
  if (!w) return new Response('No crowd history yet', { status: 503 });

  if (file === 'beats.json') {
    return NextResponse.json({ ...w, beats: BEATS.map((id) => ({ id, seconds: SECONDS[id] })), caption: caption(w) });
  }
  const m = file.match(/^(hook|rank-[1-5]|outro)(?:-(bg|text))?\.png$/);
  if (!m) return new Response('Not found', { status: 404 });
  const beat = m[1] as Beat;
  const layer = m[2] ?? 'all';
  const spot = beat.startsWith('rank-') ? w.spots[Number(beat.slice(5)) - 1] : undefined;
  const bg = backgroundFor(request.url, spot?.slug, 'seoul');

  const text = `지난 한 주서울에서가장 붐볐던곳은?!Seoul's busiest spots 🔥이번 주엔피해서 가세요!실시간 혼잡도 👉 checkeastpoint.com* 서울시 실시간 도시데이터 실측 · 낮 시간 평균평균 혼잡도위👑~/0123456789${w.spots.map((s) => s.ko + s.en).join('')}`;
  const fonts = layer === 'bg' ? undefined : await loadCjkFonts(text, 800, 'ko');
  return new ImageResponse(
    (
      <div style={{ width: W, height: H, display: 'flex', position: 'relative', background: layer === 'text' ? 'transparent' : 'linear-gradient(180deg, #3b82f6, #e0f2fe)', fontFamily: cjkFontFamily('ko') }}>
        {layer !== 'text' && <CardBackground src={bg} width={W} height={H} wash={false} />}
        {layer !== 'bg' && (
          <div style={{ position: 'absolute', top: 0, left: 0, display: 'flex' }}>
            <Text beat={beat} w={w} />
          </div>
        )}
      </div>
    ),
    { width: W, height: H, fonts, headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
  );
}
