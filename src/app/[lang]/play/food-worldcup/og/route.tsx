import { ImageResponse } from 'next/og';
import { LANGS, isLang } from '@/lib/i18n/routing';
import { TRANSLATIONS } from '@/lib/i18n/translations';

// Served at /play/food-worldcup/og (Korean, via rewrite), /en/..., /ja/...
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

const SAMPLE = ['🍗', '🍕', '🍜', '🍣', '🥩', '🌶️', '🍔', '🥟', '🍰', '🌮', '🍲', '🧋'];

async function loadFont(family: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@800&text=${encodeURIComponent(text)}`)
    ).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    return await (await fetch(src)).arrayBuffer();
  } catch {
    return null;
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = isLang(rawLang) ? rawLang : 'ko';
  const tr = TRANSLATIONS[lang];
  const title = tr['wc.title'];
  const badge = tr['wc.roundOption'].replace('{n}', '128');
  const sub = tr['play.card4.sub'];

  const text = `${title}${badge}${sub}VSCheck East Point`;
  const fonts = (
    await Promise.all([
      loadFont('Noto+Sans+KR', text).then((data) => data && { name: 'NotoKR', data, weight: 800 as const }),
      loadFont('Noto+Sans+JP', text).then((data) => data && { name: 'NotoJP', data, weight: 800 as const }),
    ])
  ).filter((f): f is NonNullable<typeof f> => f !== null);

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
          fontFamily: lang === 'ja' ? 'NotoJP, NotoKR' : 'NotoKR, NotoJP',
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
    { width: 1200, height: 630, emoji: 'twemoji', fonts: fonts.length ? fonts : undefined }
  );
}
