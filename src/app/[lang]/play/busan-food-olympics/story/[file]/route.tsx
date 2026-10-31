import { ImageResponse } from 'next/og';
import { cjkFontFamily, loadCjkFonts } from '@/lib/ogFonts';
import { isLang, pick } from '@/lib/i18n/routing';
import { BF_TEXT, BUSAN_FOODS_BY_ID } from '@/data/busanFood';
import { busanFoodPhotoData } from '@/lib/busanFoodPhoto';

// Instagram Story card for a gold medal: /play/busan-food-olympics/story/milmyeon.png (Korean, via rewrite), /en/...
export const revalidate = 86400;

export function generateStaticParams() {
  return [];
}

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string; file: string }> }) {
  const { lang, file } = await params;
  const food = BUSAN_FOODS_BY_ID.get(file.replace(/\.png$/, ''));
  if (!isLang(lang) || !food) return new Response('Not found', { status: 404 });
  const text = BF_TEXT[lang];
  const name = pick(food.name, lang);
  const [photo, fonts] = await Promise.all([
    busanFoodPhotoData(food.id),
    loadCjkFonts(`${text.title}${text.winnerLabel}${name}${text.storyCta}Check East Point🥇`, 800, lang),
  ]);

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
          padding: '200px 72px 220px',
          background: 'linear-gradient(160deg, #0d0e12 0%, #0c3a5a 55%, #7c4a0a 100%)',
          color: 'white',
          fontFamily: cjkFontFamily(lang),
        }}
      >
        <div style={{ display: 'flex', fontSize: 36, color: '#fcd34d' }}>🥇 {text.title}</div>
        <div style={{ display: 'flex', fontSize: 46, marginTop: 56 }}>{text.winnerLabel}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 872, height: 872, marginTop: 40, borderRadius: 48, overflow: 'hidden', border: '6px solid #fbbf24', fontSize: 360 }}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" width={860} height={860} style={{ width: 860, height: 860, objectFit: 'cover' }} />
          ) : (
            food.emoji
          )}
        </div>
        <div style={{ display: 'flex', textAlign: 'center', fontSize: name.length > 14 ? 64 : 96, lineHeight: 1.15, marginTop: 48 }}>{name}</div>
        <div style={{ display: 'flex', flex: 1 }} />
        <div style={{ display: 'flex', padding: '26px 44px', borderRadius: 999, background: 'linear-gradient(90deg, #0ea5e9, #f59e0b)', fontSize: 38 }}>
          {text.storyCta}
        </div>
        <div style={{ display: 'flex', fontSize: 28, color: '#bae6fd', marginTop: 28 }}>Check East Point</div>
      </div>
    ),
    { width: 1080, height: 1920, fonts, headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
  );
}
