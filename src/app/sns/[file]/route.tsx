import { ImageResponse } from 'next/og';
import { CrowdStatus, ForecastCityId } from '@/types';
import { cjkFontFamily, loadCjkFonts } from '@/lib/ogFonts';
import { getForecast } from '@/lib/forecast';
import { backgroundFor, CardBackground } from '@/lib/cardBackground';
import { enDate, enHour, hoursSummary, koDate, koHour, quietestOn, seoulSpotBySlug, shortName } from '@/lib/snsWeek';

// Weekly Instagram/Threads images (Korean + English), listed on /sns:
//   /sns/hours-<seoul-slug>-feed.png   when a Seoul spot is quiet (pattern model)
//   /sns/gem-<seoul-slug>-story.png    the quieter spot nearby
//   /sns/day-jeju-2026-11-07-feed.png  quietest Jeju/Busan spots on a date (KTO forecast)
export const preferredRegion = 'icn1';
export const revalidate = 3600;

const SIZES = { feed: { width: 1080, height: 1350 }, story: { width: 1080, height: 1920 } } as const;
type SizeId = keyof typeof SIZES;

const BG = 'linear-gradient(160deg, #0f172a 0%, #1e3a8a 60%, #312e81 100%)';
const GREEN = '#6ee7b7';
const BLUE = '#93c5fd';
const MUTED = '#cbd5e1';

function Frame({ story, children, source, bg }: { story: boolean; children: React.ReactNode; source: string; bg: string | null }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        // Story: keep clear of Instagram's top bar and reply box.
        padding: story ? '200px 72px 220px' : '72px 72px 64px',
        background: BG,
        color: 'white',
        fontFamily: cjkFontFamily('ko'),
      }}
    >
      <CardBackground src={bg} {...SIZES[story ? 'story' : 'feed']} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(45deg, #2563eb, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
          C
        </div>
        <div style={{ display: 'flex', fontSize: 30 }}>Check East Point</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginTop: story ? 80 : 48 }}>{children}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', fontSize: 34 }}>checkeastpoint.com</div>
          <div style={{ display: 'flex', fontSize: 24, color: BLUE }}>실시간 혼잡도 · Live crowd levels</div>
        </div>
        <div style={{ display: 'flex', fontSize: 20, color: MUTED, textAlign: 'right', maxWidth: 420 }}>{source}</div>
      </div>
    </div>
  );
}

function Hours({ slug, story, bg }: { slug: string; story: boolean; bg: string | null }) {
  const spot = seoulSpotBySlug(slug);
  if (!spot) return null;
  const s = hoursSummary(spot);
  const bars = s.weekday.filter((p) => p.hour >= 8 && p.hour <= 22);
  const max = Math.max(...bars.map((p) => p.score), 1);
  const ko = shortName(spot.name.ko);
  const en = shortName(spot.name.en);
  const chartH = story ? 420 : 300;
  return {
    text: `${ko}몇 시에 가야 한산할까?${en}When is least crowded?평일주말피크WeekdaysWeekendsBusiest${koHour(s.quietWeekday)}${koHour(s.quietWeekend)}${koHour(s.peakWeekday)}${enHour(s.quietWeekday)}${enHour(s.quietWeekend)}${enHour(s.peakWeekday)}평일 시간대별 혼잡도 Weekday by hour 요일·시간대 패턴 예측 Pattern-based estimate`,
    node: (
      <Frame story={story} bg={bg} source="요일·시간대 패턴 예측 · Pattern-based estimate">
        <div style={{ display: 'flex', fontSize: story ? 64 : 58, lineHeight: 1.2 }}>{spot.emoji} {ko},</div>
        <div style={{ display: 'flex', fontSize: story ? 64 : 58, lineHeight: 1.2, color: GREEN }}>몇 시에 가야 한산할까?</div>
        <div style={{ display: 'flex', fontSize: 30, color: BLUE, marginTop: 12 }}>When is {en} least crowded?</div>

        <div style={{ display: 'flex', gap: 20, marginTop: story ? 64 : 40 }}>
          {[
            { ko: '평일', en: 'Weekdays', h: s.quietWeekday, color: GREEN },
            { ko: '주말', en: 'Weekends', h: s.quietWeekend, color: GREEN },
            { ko: '피크', en: 'Busiest', h: s.peakWeekday, color: '#fda4af' },
          ].map((c) => (
            <div key={c.ko} style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '22px 24px', borderRadius: 24, background: 'rgba(255,255,255,0.09)' }}>
              <div style={{ display: 'flex', fontSize: 24, color: MUTED }}>{c.ko} · {c.en}</div>
              <div style={{ display: 'flex', fontSize: 44, color: c.color, marginTop: 6 }}>{koHour(c.h)}</div>
              <div style={{ display: 'flex', fontSize: 24, color: MUTED }}>{enHour(c.h)}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', fontSize: 24, color: MUTED, marginTop: story ? 64 : 40 }}>평일 시간대별 혼잡도 · Weekday by hour</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: chartH, marginTop: 16 }}>
          {bars.map((p) => (
            <div
              key={p.hour}
              style={{
                display: 'flex',
                flex: 1,
                height: Math.max(16, Math.round((p.score / max) * chartH)),
                borderRadius: 10,
                background: p.hour === s.quietWeekday ? GREEN : p.hour === s.peakWeekday ? '#fb7185' : 'rgba(255,255,255,0.28)',
              }}
            />
          ))}
        </div>
        {/* Same columns as the bars, so each label sits under its hour. */}
        <div style={{ display: 'flex', gap: 8, fontSize: 22, color: MUTED, marginTop: 10 }}>
          {bars.map((p) => (
            <div key={p.hour} style={{ display: 'flex', flex: 1, justifyContent: 'center' }}>
              {p.hour % 3 === 2 ? `${p.hour}시` : ''}
            </div>
          ))}
        </div>
      </Frame>
    ),
  };
}

function Gem({ slug, story, bg }: { slug: string; story: boolean; bg: string | null }) {
  const spot = seoulSpotBySlug(slug);
  const g = spot?.escapeRoute;
  if (!spot || !g) return null;
  const ko = shortName(spot.name.ko);
  const en = shortName(spot.name.en);
  return {
    text: `${ko}너무 붐빌 땐?Too crowded at${en}?${g.gemName.ko}${g.gemName.en}${g.gemDesc.ko}도보분사람% 적어요min walkfewer people0123456789 💎 혼잡 차이는 예상치 Crowd difference is an estimate`,
    node: (
      <Frame story={story} bg={bg} source="혼잡 차이는 예상치 · Crowd difference is an estimate">
        <div style={{ display: 'flex', fontSize: 30, color: '#fda4af' }}>{spot.emoji} {ko} 너무 붐빌 땐?</div>
        <div style={{ display: 'flex', fontSize: 26, color: MUTED, marginTop: 6 }}>Too crowded at {en}?</div>

        <div style={{ display: 'flex', fontSize: 40, color: BLUE, marginTop: story ? 80 : 48 }}>여기로 피하세요 ↓</div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 20, padding: story ? '48px 44px' : '36px 40px', borderRadius: 32, background: 'rgba(255,255,255,0.10)', border: `3px solid ${GREEN}` }}>
          <div style={{ display: 'flex', fontSize: 30, color: GREEN }}>💎 Hidden gem</div>
          <div style={{ display: 'flex', fontSize: g.gemName.ko.length > 16 ? 50 : 60, lineHeight: 1.2, marginTop: 12 }}>{g.gemName.ko}</div>
          <div style={{ display: 'flex', fontSize: 28, color: BLUE, marginTop: 8 }}>{g.gemName.en}</div>
          <div style={{ display: 'flex', fontSize: 30, color: MUTED, lineHeight: 1.45, marginTop: 24 }}>{g.gemDesc.ko}</div>
        </div>

        <div style={{ display: 'flex', gap: 20, marginTop: story ? 56 : 36 }}>
          {[
            { big: `도보 ${g.walkMinutes}분`, small: `${g.walkMinutes} min walk` },
            { big: `사람 ${g.crowdDiffPercent}% 적어요`, small: `${g.crowdDiffPercent}% fewer people` },
          ].map((c) => (
            <div key={c.big} style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '22px 26px', borderRadius: 24, background: 'rgba(255,255,255,0.09)' }}>
              <div style={{ display: 'flex', fontSize: 40, color: GREEN }}>{c.big}</div>
              <div style={{ display: 'flex', fontSize: 24, color: MUTED, marginTop: 4 }}>{c.small}</div>
            </div>
          ))}
        </div>
      </Frame>
    ),
  };
}

const CITY_KO: Record<ForecastCityId, string> = { jeju: '제주', busan: '부산' };
const CITY_EN: Record<ForecastCityId, string> = { jeju: 'Jeju', busan: 'Busan' };
const STATUS_KO: Record<CrowdStatus, string> = { relaxed: '여유', moderate: '보통', crowded: '붐빔', very_crowded: '매우 붐빔', packed: '매우 붐빔' };

async function Day({ city, date, story, bg }: { city: ForecastCityId; date: string; story: boolean; bg: string | null }) {
  const { date: d, rows } = quietestOn(await getForecast(), city, date);
  if (!rows.length) return null;
  // Don't call a list "quiet" when even its top spot is only moderate.
  const quiet = rows[0].status === 'relaxed';
  const headKo = quiet ? '한산한 곳' : '덜 붐비는 곳';
  const headEn = quiet ? 'Quietest spots' : 'Least crowded spots';
  return {
    text: `${koDate(d)}${enDate(d)}${CITY_KO[city]}${CITY_EN[city]}한산한 곳덜 붐비는 곳 TOP5Quietest spotsLeast crowded spots in on여유보통붐빔매우${rows.map((r) => r.spot.name.ko + r.spot.name.en).join('')}0123456789 한국관광공사 관광지 집중률 예측 KTO concentration forecast`,
    node: (
      <Frame story={story} bg={bg} source="한국관광공사 관광지 집중률 예측 · KTO concentration forecast">
        <div style={{ display: 'flex', fontSize: 34, color: BLUE }}>{koDate(d)} · {enDate(d)}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, fontSize: story ? 72 : 62, lineHeight: 1.2, marginTop: 12 }}>
          <span>{CITY_KO[city]} {headKo}</span>
          <span style={{ color: GREEN }}>TOP5</span>
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: MUTED, marginTop: 6 }}>{headEn} in {CITY_EN[city]}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: story ? 26 : 16, marginTop: story ? 64 : 36 }}>
          {rows.map((r, i) => (
            <div key={r.spot.id} style={{ display: 'flex', alignItems: 'center', gap: 22, padding: story ? '30px 30px' : '20px 28px', borderRadius: 26, background: 'rgba(255,255,255,0.09)' }}>
              <div style={{ display: 'flex', width: 44, fontSize: 42, color: BLUE }}>{i + 1}</div>
              <div style={{ display: 'flex', fontSize: 46 }}>{r.spot.emoji}</div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', fontSize: r.spot.name.ko.length > 12 ? 36 : 42, lineHeight: 1.2 }}>{r.spot.name.ko}</div>
                <div style={{ display: 'flex', fontSize: 24, color: MUTED, marginTop: 2 }}>{r.spot.name.en}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', fontSize: 44, color: r.color }}>{r.score}</div>
                <div style={{ display: 'flex', fontSize: 20, color: r.color }}>{STATUS_KO[r.status]}</div>
              </div>
            </div>
          ))}
        </div>
      </Frame>
    ),
  };
}

export async function GET(request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const m = file.match(/^(hours|gem)-([a-z0-9-]+)-(feed|story)\.png$/) ?? file.match(/^(day)-((?:jeju|busan)-\d{4}-\d{2}-\d{2})-(feed|story)\.png$/);
  if (!m) return new Response('Not found', { status: 404 });
  const [, kind, key, sizeId] = m;
  const story = sizeId === 'story';
  const city = key.slice(0, key.indexOf('-')) as ForecastCityId;
  const card =
    kind === 'hours'
      ? Hours({ slug: key, story, bg: backgroundFor(request.url, key, 'seoul') })
      : kind === 'gem'
      // Not the crowded spot's photo: the card recommends a different place.
      ? Gem({ slug: key, story, bg: backgroundFor(request.url, 'seoul') })
      : await Day({ city, date: key.slice(key.indexOf('-') + 1), story, bg: backgroundFor(request.url, city) });
  if (!card) return new Response('Not found', { status: 404 });

  const fonts = await loadCjkFonts(`Check East Point checkeastpoint.com 실시간 혼잡도 · Live crowd levels ↓여기로 피하세요Hidden gem ${card.text}`, 700, 'ko');
  return new ImageResponse(card.node, {
    ...SIZES[sizeId as SizeId],
    fonts,
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
