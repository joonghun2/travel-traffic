import { ImageResponse } from 'next/og';
import { cjkFontFamily, loadCjkFonts } from '@/lib/ogFonts';
import { LANGS, isLang, pick } from '@/lib/i18n/routing';
import { FOOD_TYPES, FOOD_TYPE_IDS, OG_GRADIENTS as GRADIENTS, isFoodTypeId, ui } from '@/data/seoulFoodTest';

// Served at /play/seoul-food-test/result/<type>/og (Korean, via rewrite), /en/..., /ja/...
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.flatMap((lang) => FOOD_TYPE_IDS.map((type) => ({ lang, type })));
}

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string; type: string }> }) {
  const { lang: rawLang, type: rawType } = await params;
  const lang = isLang(rawLang) ? rawLang : 'ko';
  const type = isFoodTypeId(rawType) ? rawType : 'spicy';
  const info = FOOD_TYPES[type];

  const todayIs = ui('todayIs', lang);
  const title = pick(info.title, lang);
  const menu = `${ui('bestMenu', lang)}: ${pick(info.menu, lang)}`;
  const testName = ui('title', lang);
  const traits = info.traits.map((t) => pick(t, lang)).join('  ');

  const fonts = await loadCjkFonts(`${todayIs}${title}${menu}${testName}${traits}Check East Point`, 800, lang);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 56,
          padding: '0 80px',
          background: GRADIENTS[type],
          color: 'white',
          fontFamily: cjkFontFamily(lang),
        }}
      >
        <div
          style={{
            width: 330,
            height: 330,
            flexShrink: 0,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 200,
          }}
        >
          {info.emoji}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
          <div style={{ fontSize: 34, opacity: 0.9, display: 'flex' }}>{todayIs}</div>
          <div style={{ fontSize: title.length > 14 ? 60 : 72, lineHeight: 1.15, display: 'flex' }}>{title}</div>
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              marginTop: 8,
              padding: '10px 26px',
              borderRadius: 999,
              background: 'rgba(0,0,0,0.25)',
              fontSize: 34,
            }}
          >
            {menu}
          </div>
          <div style={{ fontSize: 26, opacity: 0.9, display: 'flex', marginTop: 6 }}>{traits}</div>
        </div>
        <div style={{ position: 'absolute', bottom: 28, right: 40, fontSize: 24, opacity: 0.85, display: 'flex' }}>
          {testName} · Check East Point
        </div>
      </div>
    ),
    { width: 1200, height: 630, emoji: 'twemoji', fonts }
  );
}
