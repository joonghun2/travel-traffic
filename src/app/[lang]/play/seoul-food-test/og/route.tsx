import { ImageResponse } from 'next/og';
import { cjkFontFamily, loadCjkFonts } from '@/lib/ogFonts';
import { LANGS, isLang } from '@/lib/i18n/routing';
import { AREAS, AREA_IDS, ui } from '@/data/seoulFoodTest';

// Served at /play/seoul-food-test/og (Korean, via rewrite), /en/..., /ja/...
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = isLang(rawLang) ? rawLang : 'ko';
  const title = ui('title', lang);
  const areas = AREA_IDS.map((id) => AREAS[id].name[lang]);
  const question = ui('todayIs', lang);

  const fonts = await loadCjkFonts(`${title}${areas.join('')}${question}?Check East Point`, 800);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 26,
          background: 'linear-gradient(135deg, #0d0e12 0%, #4c0519 55%, #9a3412 100%)',
          color: 'white',
          fontFamily: cjkFontFamily(lang),
        }}
      >
        <div style={{ display: 'flex', gap: 22, fontSize: 110 }}>
          <span>🌶️</span>
          <span>🍲</span>
          <span>🍜</span>
          <span>🥩</span>
          <span>🥟</span>
          <span>🍗</span>
        </div>
        <div style={{ fontSize: 80, display: 'flex' }}>{title}</div>
        <div style={{ fontSize: 40, color: '#fcd34d', display: 'flex' }}>{question} ?</div>
        <div style={{ display: 'flex', gap: 14 }}>
          {areas.map((a) => (
            <div
              key={a}
              style={{
                display: 'flex',
                padding: '8px 22px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.14)',
                fontSize: 28,
              }}
            >
              {a}
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', bottom: 28, right: 40, fontSize: 24, color: '#94a3b8', display: 'flex' }}>
          Check East Point
        </div>
      </div>
    ),
    { width: 1200, height: 630, emoji: 'twemoji', fonts }
  );
}
