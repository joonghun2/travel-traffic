import { ImageResponse } from 'next/og';
import { cjkFontFamily, loadCjkFonts } from '@/lib/ogFonts';
import { LANGS, isLang } from '@/lib/i18n/routing';
import { TRANSLATIONS } from '@/lib/i18n/translations';

// Served at /play/food-worldcup/og (Korean, via rewrite), /en/..., /ja/...
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

const SAMPLE = ['🍗', '🍕', '🍜', '🍣', '🥩', '🌶️', '🍔', '🥟', '🍰', '🌮', '🍲', '🧋'];

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = isLang(rawLang) ? rawLang : 'ko';
  const tr = TRANSLATIONS[lang];
  const title = tr['wc.title'];
  const badge = tr['wc.roundOption'].replace('{n}', '128');
  const sub = tr['play.card4.sub'];

  const text = `${title}${badge}${sub}VSCheck East Point`;
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
          justifyContent: 'center',
          gap: 18,
          background: 'linear-gradient(135deg, #0d0e12 0%, #3b0a2a 55%, #7c2d12 100%)',
          color: 'white',
          fontFamily: cjkFontFamily(lang),
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 36, fontSize: 130 }}>
          <span>🍗</span>
          <span
            style={{
              fontSize: 48,
              width: 110,
              height: 110,
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #f59e0b, #f43f5e)',
            }}
          >
            VS
          </span>
          <span>🍕</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 76 }}>{title}</span>
          <span
            style={{
              fontSize: 36,
              padding: '6px 20px',
              borderRadius: 999,
              background: '#f43f5e',
            }}
          >
            {badge}
          </span>
        </div>
        <div style={{ fontSize: 32, color: '#fcd34d', display: 'flex' }}>{sub}</div>
        <div style={{ display: 'flex', gap: 14, fontSize: 44, marginTop: 8, opacity: 0.85 }}>
          {SAMPLE.map((e) => (
            <span key={e}>{e}</span>
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
