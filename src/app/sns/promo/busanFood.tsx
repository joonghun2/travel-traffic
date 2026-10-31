import type { ReactElement } from 'react';
import { BUSAN_FOODS_BY_ID } from '@/data/busanFood';

// Busan Food Olympics Instagram promo, transparent text layers (scripts/make-busan-food-promo.mjs puts
// them over the food photos):
//   busan-food-1.png      cover, 1080x1350
//   busan-food-2..9.png   one first-round match per slide (food A on top, B below), 1080x1350
//   busan-food-10.png     call to action, 1080x1350
//   busan-food-story.png  story, 1080x1920

/** The eight matches on slides 2-9; the script uses the same pairs for the photos. */
export const BUSAN_PROMO_MATCHES: [string, string][] = [
  ['dwaeji-gukbap', 'milmyeon'],
  ['nakgopsae', 'kkomjangeo-gui'],
  ['ssiat-hotteok', 'multteok'],
  ['jogae-gui', 'jagalchi-hoe'],
  ['gijang-daege', 'bokguk'],
  ['busan-eomuk', 'yubu-jumeoni'],
  ['bibim-dangmyeon', 'naengchae-jokbal'],
  ['dongnae-pajeon', 'lee-jae-mo-pizza'],
];

const INK = '#1e1b2e';
const ACCENT = '#0369a1';
const PANEL = { display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.92)', borderRadius: 48, boxShadow: '0 20px 60px rgba(15,23,42,0.3)' } as const;
const PILL = { display: 'flex', padding: '12px 30px', borderRadius: 999, background: INK, color: 'white', fontSize: 34 } as const;

const nameOf = (id: string) => BUSAN_FOODS_BY_ID.get(id)?.name.ko ?? id;

/** Every character the slides draw, for the font subset. */
export const BUSAN_PROMO_TEXT =
  '부산음식올림픽🥇16강·무료돼지국밥vs밀면,당신의금메달은?넘겨서1라운드미리보기👉👇링크눌러서바로하기스티커자리MATCH/①②VS댓글로or골라주세요유튜브에서가장많이찾은가지16강전부해보기프로필에서바로👆checkeastpoint.com/play30명이모이면다른사람들의순위가공개돼요결과를스토리에올리고친구를태그해보세요🏷️Busan Food Olympics·link in bio0123456789' +
  BUSAN_PROMO_MATCHES.flat().map(nameOf).join('');

function Cover({ story }: { story: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: story ? '200px 64px 300px' : '72px 64px' }}>
      <div style={{ display: 'flex' }}>
        <div style={PILL}>🥇 16강 · 무료</div>
      </div>
      <div style={{ ...PANEL, padding: '56px 56px 52px' }}>
        <div style={{ display: 'flex', fontSize: 44, color: '#475569' }}>유튜브에서 가장 많이 찾은 16가지</div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 12, fontSize: 104, lineHeight: 1.15, color: INK }}>
          <span>부산 음식</span>
          <span style={{ color: ACCENT }}>올림픽 🥇</span>
        </div>
        <div style={{ display: 'flex', marginTop: 26, fontSize: 42, color: INK }}>돼지국밥 vs 밀면, 당신의 금메달은?</div>
        <div style={{ display: 'flex', marginTop: 8, fontSize: 30, color: '#94a3b8' }}>Busan Food Olympics</div>
        <div style={{ display: 'flex', marginTop: 34, fontSize: 38, color: INK }}>{story ? '👇 링크 눌러서 바로 하기' : '넘겨서 1라운드 미리보기 👉'}</div>
      </div>
      {story && (
        <div style={{ display: 'flex', alignSelf: 'center', marginTop: 40, padding: '26px 60px', borderRadius: 28, border: '4px dashed rgba(255,255,255,0.9)', color: 'white', fontSize: 34 }}>
          링크 스티커 자리
        </div>
      )}
    </div>
  );
}

function NameTag({ mark, id }: { mark: string; id: string }) {
  return (
    <div style={{ ...PANEL, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', padding: '22px 40px', borderRadius: 999 }}>
      <span style={{ display: 'flex', fontSize: 56, color: ACCENT }}>{mark}</span>
      <span style={{ display: 'flex', marginLeft: 18, fontSize: 64, color: INK }}>{nameOf(id)}</span>
    </div>
  );
}

function Match({ n }: { n: number }) {
  const [a, b] = BUSAN_PROMO_MATCHES[n];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 675, padding: '56px 56px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={PILL}>{`MATCH ${n + 1}/8`}</div>
          <div style={{ ...PILL, background: ACCENT }}>댓글로 ① or ② 👇</div>
        </div>
        <NameTag mark="①" id={a} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 675, padding: '48px 56px 56px' }}>
        <NameTag mark="②" id={b} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 440,
          top: 575,
          width: 200,
          height: 200,
          borderRadius: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0ea5e9, #f59e0b)',
          border: '8px solid white',
          color: 'white',
          fontSize: 76,
          boxShadow: '0 12px 40px rgba(15,23,42,0.4)',
        }}
      >
        VS
      </div>
    </div>
  );
}

function Cta() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', height: '100%', padding: '72px 64px' }}>
      <div style={{ ...PANEL, alignItems: 'center', padding: '64px 56px', textAlign: 'center' }}>
        <div style={{ display: 'flex', fontSize: 50, color: '#475569' }}>나의 부산 금메달은?</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 18, fontSize: 84, lineHeight: 1.2, color: INK }}>
          <span>16강 전부 해보기</span>
          <span style={{ color: ACCENT }}>프로필 링크에서 👆</span>
        </div>
        <div style={{ display: 'flex', marginTop: 40, padding: '20px 40px', borderRadius: 999, background: INK, color: 'white', fontSize: 36 }}>checkeastpoint.com/play</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40, fontSize: 36, lineHeight: 1.45, color: '#334155' }}>
          <span>30명이 모이면 다른 사람들의 순위가 공개돼요</span>
          <span>결과를 스토리에 올리고 친구를 태그해 보세요 🏷️</span>
        </div>
        <div style={{ display: 'flex', marginTop: 24, fontSize: 30, color: '#94a3b8' }}>Busan Food Olympics · link in bio</div>
      </div>
    </div>
  );
}

/** The layer for busan-food-<slide>.png, or null when the slide doesn't exist. */
export function busanFoodPromoSlide(slide: string): { node: ReactElement; height: number } | null {
  if (slide === 'story') return { node: <Cover story />, height: 1920 };
  const n = Number(slide);
  if (n === 1) return { node: <Cover story={false} />, height: 1350 };
  if (n >= 2 && n <= 9) return { node: <Match n={n - 2} />, height: 1350 };
  if (n === 10) return { node: <Cta />, height: 1350 };
  return null;
}
