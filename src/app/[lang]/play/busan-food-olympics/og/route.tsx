import { ImageResponse } from 'next/og';
import { cjkFontFamily, loadCjkFonts } from '@/lib/ogFonts';
import { isLang } from '@/lib/i18n/routing';
import { BF_TEXT, BUSAN_FOODS } from '@/data/busanFood';
import { busanFoodPhotoData } from '@/lib/busanFoodPhoto';

// 1200×630 link preview: /play/busan-food-olympics/og (Korean, via rewrite), /en/..., /ja/...
// Rendered on first request (the food photos are fetched from the live site), then cached.
export const revalidate = 86400;

export function generateStaticParams() {
  return [];
}

const TILE = 210;

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = isLang(rawLang) ? rawLang : 'ko';
  const text = BF_TEXT[lang];
  const badge = text.roundOf.replace('{n}', '16');
  const [fonts, photos] = await Promise.all([
    loadCjkFonts(`${text.title}${badge}${text.cardSub}Check East Point🥇`, 800, lang),
    Promise.all(BUSAN_FOODS.slice(0, 10).map((food) => busanFoodPhotoData(food.id))),
  ]);
  const tiles = photos.filter((p): p is string => p !== null);

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#0d0e12', fontFamily: cjkFontFamily(lang) }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630, display: 'flex', flexWrap: 'wrap' }}>
          {[...tiles, ...tiles].slice(0, 18).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt="" width={200} height={TILE} style={{ width: 200, height: TILE, objectFit: 'cover' }} />
          ))}
        </div>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
            color: 'white',
            background: 'linear-gradient(180deg, rgba(13,14,18,0.55) 0%, rgba(13,14,18,0.82) 60%, rgba(13,14,18,0.92) 100%)',
          }}
        >
          <div style={{ display: 'flex', fontSize: 40, padding: '8px 28px', borderRadius: 999, background: 'linear-gradient(90deg, #0ea5e9, #f59e0b)' }}>
            🥇 {badge}
          </div>
          <div style={{ display: 'flex', fontSize: 92 }}>{text.title}</div>
          <div style={{ display: 'flex', fontSize: 36, color: '#fcd34d' }}>{text.cardSub}</div>
        </div>
        <div style={{ position: 'absolute', bottom: 24, right: 36, fontSize: 24, color: '#cbd5e1', display: 'flex' }}>Check East Point</div>
      </div>
    ),
    { width: 1200, height: 630, emoji: 'twemoji', fonts }
  );
}
