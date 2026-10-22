import { ImageResponse } from 'next/og';
import QRCode from 'qrcode';
import { cjkFontFamily, loadCjkFonts } from '@/lib/ogFonts';
import { SITE_URL, isLang, localizePath, pick } from '@/lib/i18n/routing';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { AREAS, FOOD_TYPES, OG_GRADIENTS, TEST_PATH, isAreaId, isFoodTypeId, ui } from '@/data/seoulFoodTest';
import { getCrowdSnapshot } from '@/lib/crowdSnapshot';
import { pickQuietNear } from '@/lib/quietNear';
import { STATUS_COLOR } from '@/lib/mapSpots';
import { withUtm } from '@/lib/utm';

// 1080×1920 story card: food type + 3 quiet places near the chosen area right now.
// /play/seoul-food-test/result/<type>/story/<area>.png — rendered on demand, refreshed every 5 minutes.
export const revalidate = 300;
export const preferredRegion = 'icn1';

export function generateStaticParams() {
  return [];
}

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string; type: string; file: string }> }) {
  const { lang, type, file } = await params;
  const area = file.replace(/\.png$/, '');
  if (!isLang(lang) || !isFoodTypeId(type) || !isAreaId(area)) return new Response('Not found', { status: 404 });
  const info = FOOD_TYPES[type];
  const tr = (key: string, vars: Record<string, string> = {}) =>
    (TRANSLATIONS[lang][key] ?? TRANSLATIONS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

  const areaName = pick(AREAS[area].name, lang);
  const quiet = pickQuietNear((await getCrowdSnapshot()).spots, AREAS[area].center, 3).map((m) => ({
    name: pick(m.name, lang),
    score: m.currentScore,
    label: tr(`card.status.${m.status}`),
    color: STATUS_COLOR[m.status],
    emoji: m.emoji,
  }));

  const todayIs = ui('todayIs', lang);
  const title = pick(info.title, lang);
  const menu = `${ui('bestMenu', lang)}: ${pick(info.menu, lang)}`;
  const quietTitle = tr('quiet.title', { area: areaName });
  const cta = ui('tryIt', lang);
  const link = withUtm(`${SITE_URL}${localizePath(TEST_PATH, lang)}`, { source: 'card', medium: 'image', campaign: 'food-test', content: `${type}-story` });
  const qr = await QRCode.toDataURL(link, { width: 320, margin: 1 });

  const text = `${todayIs}${title}${menu}${quietTitle}${cta}${quiet.map((q) => q.name + q.label).join('')}Check East Point checkeastpoint.com 0123456789`;
  const fonts = await loadCjkFonts(text, 800, lang);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '150px 72px 140px',
          background: OG_GRADIENTS[type],
          color: 'white',
          fontFamily: cjkFontFamily(lang),
        }}
      >
        <div style={{ display: 'flex', fontSize: 34, opacity: 0.9 }}>Check East Point</div>
        <div style={{ display: 'flex', fontSize: 40, marginTop: 56 }}>{todayIs}</div>
        <div style={{ display: 'flex', fontSize: title.length > 14 ? 70 : 88, lineHeight: 1.1, marginTop: 8, textAlign: 'center' }}>{title}</div>
        <div style={{ display: 'flex', fontSize: 190, marginTop: 24 }}>{info.emoji}</div>
        <div style={{ display: 'flex', fontSize: 36, padding: '10px 28px', borderRadius: 999, background: 'rgba(0,0,0,0.25)', marginTop: 16 }}>{menu}</div>

        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: 64, padding: '36px 40px', borderRadius: 40, background: 'rgba(15,23,42,0.55)', gap: 22 }}>
          <div style={{ display: 'flex', fontSize: 36 }}>{quietTitle}</div>
          {quiet.map((q) => (
            <div key={q.name} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ display: 'flex', fontSize: 44 }}>{q.emoji}</div>
              <div style={{ display: 'flex', flex: 1, fontSize: q.name.length > 16 ? 30 : 36 }}>{q.name}</div>
              <div style={{ display: 'flex', fontSize: 32, color: q.color, background: 'rgba(255,255,255,0.92)', padding: '4px 18px', borderRadius: 999 }}>
                {q.label} {q.score}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginTop: 'auto' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} width={170} height={170} style={{ borderRadius: 18 }} alt="" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', fontSize: 40 }}>{cta}</div>
            <div style={{ display: 'flex', fontSize: 28, opacity: 0.9 }}>checkeastpoint.com</div>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920, fonts, headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
  );
}
