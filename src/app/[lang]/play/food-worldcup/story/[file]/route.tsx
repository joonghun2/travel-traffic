import { ImageResponse } from 'next/og';
import { cjkFontFamily, loadCjkFonts } from '@/lib/ogFonts';
import { isLang, pick } from '@/lib/i18n/routing';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { FOODS } from '@/data/foods';

// Instagram Story card for a World Cup winner: /play/food-worldcup/story/9.png (Korean, via rewrite), /en/...
export const revalidate = 86400;

const CTA: Record<string, string> = {
  ko: '너의 1위는? 👉 checkeastpoint.com/play',
  en: "What's your #1? 👉 checkeastpoint.com/play",
  ja: 'あなたの1位は？ 👉 checkeastpoint.com/play',
  'zh-cn': '你的第一名是？ 👉 checkeastpoint.com/play',
  'zh-tw': '你的第一名是？ 👉 checkeastpoint.com/play',
};

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string; file: string }> }) {
  const { lang, file } = await params;
  const food = FOODS.find((f) => `${f.id}.png` === file);
  if (!isLang(lang) || !food) return new Response('Not found', { status: 404 });
  const tr = TRANSLATIONS[lang];
  const title = tr['wc.title'];
  const label = tr['wc.winnerLabel'];
  const name = pick(food.name, lang);
  const cta = CTA[lang];

  const fonts = await loadCjkFonts(`${title}${label}${name}${cta}Check East Point🏆`, 800, lang);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          // Clear of Instagram's top bar and reply box.
          padding: '220px 72px 240px',
          background: 'linear-gradient(160deg, #0d0e12 0%, #3b0a2a 55%, #7c2d12 100%)',
          color: 'white',
          fontFamily: cjkFontFamily(lang),
        }}
      >
        <div style={{ display: 'flex', fontSize: 34, color: '#fcd34d' }}>🏆 {title}</div>
        <div style={{ display: 'flex', fontSize: 48, marginTop: 120 }}>{label}</div>
        <div style={{ display: 'flex', fontSize: 380, lineHeight: 1, marginTop: 60 }}>{food.emoji}</div>
        <div style={{ display: 'flex', textAlign: 'center', fontSize: name.length > 14 ? 76 : 104, lineHeight: 1.15, marginTop: 60 }}>{name}</div>
        <div style={{ display: 'flex', flex: 1 }} />
        <div style={{ display: 'flex', padding: '26px 44px', borderRadius: 999, background: 'linear-gradient(90deg, #f59e0b, #f43f5e)', fontSize: 38 }}>{cta}</div>
        <div style={{ display: 'flex', fontSize: 28, color: '#fda4af', marginTop: 28 }}>Check East Point</div>
      </div>
    ),
    { width: 1080, height: 1920, fonts, headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
  );
}
