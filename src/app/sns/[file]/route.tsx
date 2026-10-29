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
// Each card also comes as separate layers: ...-story-bg.png (scenery only) and ...-story-text.png
// (panels and text on transparency), so the reel can move the scenery under fixed text.
// Layout: a bright illustration (public/bg, via scripts/sync-sns-backgrounds.mjs) with frosted white
// panels on top and bottom, so the scenery stays visible in the middle.
export const preferredRegion = 'icn1';
export const revalidate = 3600;

const SIZES = { feed: { width: 1080, height: 1350 }, story: { width: 1080, height: 1920 } } as const;
type SizeId = keyof typeof SIZES;
type Layer = 'all' | 'bg' | 'text';

// Sky gradient when no illustration exists yet for the spot or city.
const SKY = 'linear-gradient(180deg, #3b82f6 0%, #93c5fd 45%, #e0f2fe 100%)';
const INK = '#0f172a';
const MUTED = '#475569';
const GREEN = '#059669';
const RED = '#e11d48';
const BLUE = '#2563eb';
const PANEL = { borderRadius: 40, background: 'rgba(255,255,255,0.9)', boxShadow: '0 12px 40px rgba(15,23,42,0.18)' } as const;

interface CardOpts {
  story: boolean;
  bg: string | null;
  layer: Layer;
}

function Frame({ story, bg, layer, top, bottom }: CardOpts & { top: React.ReactNode; bottom: React.ReactNode }) {
  const size = SIZES[story ? 'story' : 'feed'];
  const scenery = layer !== 'text';
  const text = layer !== 'bg';
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        // Story: keep clear of Instagram's top bar and reply box.
        padding: story ? '190px 56px 230px' : '48px 48px 48px',
        background: scenery && !bg ? SKY : 'transparent',
        color: INK,
        fontFamily: cjkFontFamily('ko'),
      }}
    >
      {scenery && <CardBackground src={bg} {...size} wash={false} />}
      {text && (
      <div style={{ ...PANEL, display: 'flex', flexDirection: 'column', padding: '36px 44px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, color: BLUE }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(45deg, #2563eb, #6366f1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
            C
          </div>
          Check East Point
        </div>
        {top}
      </div>
      )}
      {text && (
      <div style={{ ...PANEL, display: 'flex', flexDirection: 'column', padding: story ? '40px 44px' : '32px 40px' }}>
        {bottom}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, fontSize: 24, color: MUTED }}>
          <span style={{ color: INK }}>checkeastpoint.com</span>
          <span>실시간 혼잡도 · Live crowd</span>
        </div>
      </div>
      )}
    </div>
  );
}

// Satori lays a fragment's children out in a row, so card sections use Col instead of <>.
const Col = ({ children }: { children: React.ReactNode }) => <div style={{ display: 'flex', flexDirection: 'column' }}>{children}</div>;

const Note = ({ children }: { children: React.ReactNode }) => <div style={{ display: 'flex', fontSize: 20, color: MUTED, marginTop: 14 }}>{children}</div>;

function Hours({ slug, ...opts }: CardOpts & { slug: string }) {
  const { story } = opts;
  const spot = seoulSpotBySlug(slug);
  if (!spot) return null;
  const s = hoursSummary(spot);
  const ko = shortName(spot.name.ko);
  const en = shortName(spot.name.en);
  return {
    text: `${ko}몇 시에 가야 한산할까?${en}When is least crowded?평일주말피하기WeekdaysWeekendsAvoid${koHour(s.quietWeekday)}${koHour(s.quietWeekend)}${koHour(s.peakWeekday)}${enHour(s.quietWeekday)}${enHour(s.quietWeekend)}${enHour(s.peakWeekday)}* 요일·시간대 패턴 예측 Pattern-based estimate`,
    node: (
      <Frame
        {...opts}
        top={
          <Col>
            <div style={{ display: 'flex', fontSize: story ? 64 : 58, lineHeight: 1.2, marginTop: 18 }}>{ko},</div>
            <div style={{ display: 'flex', fontSize: story ? 64 : 58, lineHeight: 1.2, color: GREEN }}>몇 시에 가야 한산할까?</div>
            <div style={{ display: 'flex', fontSize: 28, color: MUTED, marginTop: 10 }}>When is {en} least crowded?</div>
          </Col>
        }
        bottom={
          <Col>
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { ko: '평일', en: 'Weekdays', h: s.quietWeekday, color: GREEN, tint: '#ecfdf5' },
                { ko: '주말', en: 'Weekends', h: s.quietWeekend, color: GREEN, tint: '#ecfdf5' },
                { ko: '피하기', en: 'Avoid', h: s.peakWeekday, color: RED, tint: '#fff1f2' },
              ].map((c) => (
                <div key={c.ko} style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '20px 22px', borderRadius: 26, background: c.tint }}>
                  <div style={{ display: 'flex', fontSize: 22, color: MUTED }}>{c.ko} · {c.en}</div>
                  <div style={{ display: 'flex', fontSize: 44, color: c.color, marginTop: 4 }}>{koHour(c.h)}</div>
                  <div style={{ display: 'flex', fontSize: 22, color: MUTED }}>{enHour(c.h)}</div>
                </div>
              ))}
            </div>
            <Note>* 요일·시간대 패턴 예측 · Pattern-based estimate</Note>
          </Col>
        }
      />
    ),
  };
}

function Gem({ slug, ...opts }: CardOpts & { slug: string }) {
  const { story } = opts;
  const spot = seoulSpotBySlug(slug);
  const g = spot?.escapeRoute;
  if (!spot || !g) return null;
  const ko = shortName(spot.name.ko);
  const en = shortName(spot.name.en);
  return {
    text: `${ko}너무 붐빌 땐?Too crowded at${en}?여기로 피하세요 💎${g.gemName.ko}${g.gemName.en}${g.gemDesc.ko}도보분사람% 적어요min walkfewer people0123456789* 혼잡 차이는 예상치 Crowd difference is an estimate`,
    node: (
      <Frame
        {...opts}
        top={
          <Col>
            <div style={{ display: 'flex', fontSize: story ? 60 : 54, lineHeight: 1.2, marginTop: 18 }}>{ko} 너무 붐빌 땐?</div>
            <div style={{ display: 'flex', fontSize: story ? 60 : 54, lineHeight: 1.2, color: BLUE }}>여기로 피하세요 💎</div>
            <div style={{ display: 'flex', fontSize: 28, color: MUTED, marginTop: 10 }}>Too crowded at {en}?</div>
          </Col>
        }
        bottom={
          <Col>
            <div style={{ display: 'flex', fontSize: g.gemName.ko.length > 16 ? 44 : 52, lineHeight: 1.2 }}>{g.gemName.ko}</div>
            <div style={{ display: 'flex', fontSize: 26, color: BLUE, marginTop: 6 }}>{g.gemName.en}</div>
            <div style={{ display: 'flex', fontSize: 26, color: MUTED, lineHeight: 1.45, marginTop: 14 }}>{g.gemDesc.ko}</div>
            <div style={{ display: 'flex', gap: 14, marginTop: 20 }}>
              {[`🚶 도보 ${g.walkMinutes}분 · ${g.walkMinutes} min`, `👥 사람 ${g.crowdDiffPercent}% 적어요`].map((t) => (
                <div key={t} style={{ display: 'flex', padding: '12px 22px', borderRadius: 999, background: '#ecfdf5', color: GREEN, fontSize: 26 }}>{t}</div>
              ))}
            </div>
            <Note>* 혼잡 차이는 예상치 · Crowd difference is an estimate</Note>
          </Col>
        }
      />
    ),
  };
}

const CITY_KO: Record<ForecastCityId, string> = { jeju: '제주', busan: '부산' };
const CITY_EN: Record<ForecastCityId, string> = { jeju: 'Jeju', busan: 'Busan' };
const STATUS_KO: Record<CrowdStatus, string> = { relaxed: '여유', moderate: '보통', crowded: '붐빔', very_crowded: '매우 붐빔', packed: '매우 붐빔' };

async function Day({ city, date, ...opts }: CardOpts & { city: ForecastCityId; date: string }) {
  const { story } = opts;
  const { date: d, rows } = quietestOn(await getForecast(), city, date);
  if (!rows.length) return null;
  // Don't call a list "quiet" when even its top spot is only moderate.
  const quiet = rows[0].status === 'relaxed';
  const headKo = quiet ? '한산한 곳' : '덜 붐비는 곳';
  const headEn = quiet ? 'Quietest spots' : 'Least crowded spots';
  return {
    text: `${koDate(d)}${enDate(d)}${CITY_KO[city]}${CITY_EN[city]}한산한 곳덜 붐비는 곳 TOP5Quietest spotsLeast crowded spots in on여유보통붐빔매우${rows.map((r) => r.spot.name.ko + r.spot.name.en).join('')}0123456789* 한국관광공사 관광지 집중률 예측 KTO concentration forecast`,
    node: (
      <Frame
        {...opts}
        top={
          <Col>
            <div style={{ display: 'flex', fontSize: 30, color: BLUE, marginTop: 16 }}>{koDate(d)} · {enDate(d)}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, fontSize: story ? 66 : 58, lineHeight: 1.2, marginTop: 6 }}>
              <span>{CITY_KO[city]} {headKo}</span>
              <span style={{ color: GREEN }}>TOP5</span>
            </div>
            <div style={{ display: 'flex', fontSize: 28, color: MUTED, marginTop: 6 }}>{headEn} in {CITY_EN[city]}</div>
          </Col>
        }
        bottom={
          <Col>
            <div style={{ display: 'flex', flexDirection: 'column', gap: story ? 18 : 10 }}>
              {rows.map((r, i) => (
                <div key={r.spot.id} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <div style={{ display: 'flex', width: 52, height: 52, borderRadius: 999, background: '#eff6ff', color: BLUE, fontSize: 28, alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', fontSize: r.spot.name.ko.length > 12 ? 32 : 36, lineHeight: 1.2 }}>{r.spot.name.ko}</div>
                    <div style={{ display: 'flex', fontSize: 20, color: MUTED }}>{r.spot.name.en}</div>
                  </div>
                  <div style={{ display: 'flex', padding: '6px 18px', borderRadius: 999, background: `${r.color}22`, color: r.color, fontSize: 24 }}>
                    {STATUS_KO[r.status]} {r.score}
                  </div>
                </div>
              ))}
            </div>
            <Note>* 한국관광공사 관광지 집중률 예측 · KTO concentration forecast</Note>
          </Col>
        }
      />
    ),
  };
}

export async function GET(request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const m =
    file.match(/^(hours|gem)-([a-z0-9-]+?)-(feed|story)(?:-(bg|text))?\.png$/) ??
    file.match(/^(day)-((?:jeju|busan)-\d{4}-\d{2}-\d{2})-(feed|story)(?:-(bg|text))?\.png$/);
  if (!m) return new Response('Not found', { status: 404 });
  const [, kind, key, sizeId, layerId] = m;
  const story = sizeId === 'story';
  const layer = (layerId ?? 'all') as Layer;
  const city = key.slice(0, key.indexOf('-')) as ForecastCityId;
  const card =
    kind === 'hours'
      ? Hours({ slug: key, story, layer, bg: backgroundFor(request.url, key, 'seoul') })
      : kind === 'gem'
      ? // Not the crowded spot's image: the card recommends a different place.
        Gem({ slug: key, story, layer, bg: backgroundFor(request.url, 'seoul') })
      : await Day({ city, date: key.slice(key.indexOf('-') + 1), story, layer, bg: backgroundFor(request.url, city) });
  if (!card) return new Response('Not found', { status: 404 });

  const fonts = await loadCjkFonts(`Check East Point checkeastpoint.com 실시간 혼잡도 · Live crowd 🚶👥 ${card.text}`, 700, 'ko');
  return new ImageResponse(card.node, {
    ...SIZES[sizeId as SizeId],
    fonts,
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
