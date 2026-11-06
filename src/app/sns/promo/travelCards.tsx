import { ImageResponse } from 'next/og';
import { cjkFontFamily, loadCjkFonts } from '@/lib/ogFonts';
import { TYPES, TypeKey, personaStats, tt } from '@/lib/travelType';
import { CardFace, artDataUrl, cardText, renderTypeCard } from '@/lib/travelTypeCard';

// Instagram carousel for the travel-type test with its trading cards (1080x1350, finished slides):
//   /sns/promo/travel-card-1.png      cover: a fan of five cards
//   /sns/promo/travel-card-2..9.png   one type's card each (its typical stats)
//   /sns/promo/travel-card-10.png     call to action: all eight cards
const W = 1080;
const H = 1350;
const INK = '#1e1b2e';
const KEYS = Object.keys(TYPES) as TypeKey[];
const BG = 'linear-gradient(165deg, #fff3e8 0%, #fff8f2 45%, #f6f4ff 100%)';
const PILL = { display: 'flex', padding: '12px 30px', borderRadius: 999, background: INK, color: 'white', fontSize: 34 } as const;
const COPY =
  '15문항·3분·무료내여행성향이카드로나온다?!8종여행자카드중나는어떤카드?넘겨서8장다보기👉나는몇번카드일까?프로필링크에서3분테스트👆checkeastpoint.com/play/travel-type결과카드를스토리에올리고같이갈친구를태그해보세요🏷️';

async function faces(keys: TypeKey[], w: number) {
  const badge = tt('cardBadge', 'ko');
  const arts = await Promise.all(keys.map((k) => artDataUrl(k)));
  return keys.map((k, i) => <CardFace key={k} k={k} stats={personaStats(k)} lang="ko" badge={badge} art={arts[i]} w={w} />);
}

async function fonts(keys: TypeKey[]) {
  const badge = tt('cardBadge', 'ko');
  return loadCjkFonts(COPY + keys.map((k) => cardText(k, personaStats(k), 'ko', badge)).join(''), 800, 'ko');
}

async function cover() {
  // Middle card on top; the outer ones fan out behind it.
  const keys: TypeKey[] = [KEYS[0], KEYS[3], KEYS[5], KEYS[6], KEYS[7]];
  const cards = await faces(keys, 380);
  const fan = [
    { r: -16, x: 40, y: 70, z: 1 },
    { r: -8, x: 200, y: 30, z: 2 },
    { r: 0, x: 350, y: 0, z: 5 },
    { r: 8, x: 500, y: 30, z: 2 },
    { r: 16, x: 660, y: 70, z: 1 },
  ];
  const order = [0, 4, 1, 3, 2]; // draw back to front
  return new ImageResponse(
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', backgroundImage: BG, color: INK, fontFamily: cjkFontFamily('ko'), padding: '64px 60px 0' }}>
      <div style={PILL}>15문항 · 3분 · 무료</div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 34, fontSize: 92, lineHeight: 1.15 }}>
        <span>내 여행 성향이</span>
        <span style={{ color: '#e11d48' }}>카드로 나온다?!</span>
      </div>
      <div style={{ display: 'flex', marginTop: 20, fontSize: 38, color: '#64748b' }}>8종 여행자 카드 중 나는 어떤 카드?</div>
      <div style={{ display: 'flex', position: 'relative', width: 1080, height: 640, marginTop: 40 }}>
        {order.map((i) => (
          <div key={i} style={{ display: 'flex', position: 'absolute', left: fan[i].x, top: fan[i].y, transform: `rotate(${fan[i].r}deg)`, boxShadow: '0 24px 50px rgba(30,27,46,0.35)', borderRadius: 24 }}>
            {cards[i]}
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: 44, ...PILL, background: '#e11d48' }}>넘겨서 8장 다 보기 👉</div>
    </div>,
    { width: W, height: H, fonts: await fonts(keys) }
  );
}

async function callToAction() {
  const cards = await faces(KEYS, 230);
  return new ImageResponse(
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', backgroundImage: BG, color: INK, fontFamily: cjkFontFamily('ko'), padding: '70px 40px 0' }}>
      <div style={{ display: 'flex', fontSize: 86 }}>나는 몇 번 카드일까?</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22, width: 1010, marginTop: 44 }}>
        {cards.map((c, i) => (
          <div key={i} style={{ display: 'flex', boxShadow: '0 14px 30px rgba(30,27,46,0.28)', borderRadius: 16 }}>
            {c}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 48, ...PILL, fontSize: 44, padding: '18px 44px', background: '#e11d48' }}>프로필 링크에서 3분 테스트 👆</div>
      <div style={{ display: 'flex', marginTop: 22, fontSize: 34, color: '#4f46e5' }}>checkeastpoint.com/play/travel-type</div>
      <div style={{ display: 'flex', marginTop: 14, fontSize: 30, color: '#64748b' }}>결과 카드를 스토리에 올리고 같이 갈 친구를 태그해 보세요 🏷️</div>
    </div>,
    { width: W, height: H, fonts: await fonts(KEYS) }
  );
}

/** Slide n (1-10) of the card carousel, or null when out of range. */
export async function travelCardSlide(n: number) {
  if (n === 1) return cover();
  if (n === 10) return callToAction();
  if (n < 2 || n > 9) return null;
  const key = KEYS[n - 2];
  return renderTypeCard({ key, stats: personaStats(key), lang: 'ko', size: 'feed', personal: false });
}
