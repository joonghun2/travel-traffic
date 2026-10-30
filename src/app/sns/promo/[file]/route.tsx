import { ImageResponse } from 'next/og';
import { cjkFontFamily, loadCjkFonts } from '@/lib/ogFonts';
import { THEME, TYPES, TypeKey } from '@/lib/travelType';

// Instagram promo for the travel-type test (scripts/make-travel-type-promo.mjs puts these over drive
// scenery): transparent text layers only.
//   /sns/promo/travel-type-<1..10>.png  carousel slide, 1080x1350 (1 cover, 2-9 the eight types, 10 call to action)
//   /sns/promo/travel-type-story.png    story, 1080x1920
const W = 1080;
const INK = '#1e1b2e';
const KEYS = Object.keys(TYPES) as TypeKey[];
const PANEL = { display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.9)', borderRadius: 48, boxShadow: '0 20px 60px rgba(15,23,42,0.25)' } as const;
const PILL = { display: 'flex', padding: '12px 30px', borderRadius: 999, background: INK, color: 'white', fontSize: 34 } as const;

function Cover({ story }: { story: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: story ? '200px 64px 300px' : '72px 64px' }}>
      <div style={{ display: 'flex' }}>
        <div style={PILL}>15문항 · 3분 · 무료</div>
      </div>
      <div style={{ ...PANEL, padding: '56px 56px 52px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 92, lineHeight: 1.18, color: INK }}>
          <span>나는 서울에서</span>
          <span style={{ color: '#4f46e5' }}>어떤 여행자일까? 🧳</span>
        </div>
        <div style={{ display: 'flex', marginTop: 28, fontSize: 40, color: '#475569' }}>8가지 여행 성향 테스트</div>
        <div style={{ display: 'flex', marginTop: 8, fontSize: 32, color: '#94a3b8' }}>What kind of Seoul traveler are you?</div>
        <div style={{ display: 'flex', marginTop: 36, fontSize: 38, color: INK }}>{story ? '👇 링크 눌러서 바로 테스트' : '넘겨서 8가지 유형 미리보기 👉'}</div>
      </div>
      {story && (
        <div style={{ display: 'flex', alignSelf: 'center', marginTop: 40, padding: '26px 60px', borderRadius: 28, border: '4px dashed rgba(255,255,255,0.9)', color: 'white', fontSize: 34 }}>
          링크 스티커 자리
        </div>
      )}
    </div>
  );
}

function TypeSlide({ n }: { n: number }) {
  const key = KEYS[n];
  const type = TYPES[key];
  const theme = THEME[key];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: '72px 64px' }}>
      <div style={{ display: 'flex' }}>
        <div style={{ ...PILL, background: theme.accent }}>{`TYPE ${n + 1} / 8`}</div>
      </div>
      <div style={{ ...PANEL, padding: '52px 56px' }}>
        <div style={{ display: 'flex', fontSize: 88, color: theme.accent }}>{type.name.ko}</div>
        <div style={{ display: 'flex', marginTop: 6, fontSize: 32, color: '#94a3b8' }}>{type.name.en}</div>
        <div style={{ display: 'flex', marginTop: 26, fontSize: 42, lineHeight: 1.35, color: INK }}>{`“${type.tagline.ko}”`}</div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 26, padding: '24px 30px', borderRadius: 28, background: theme.bg }}>
          {type.strengths.ko.slice(0, 2).map((s) => (
            <div key={s} style={{ display: 'flex', fontSize: 32, lineHeight: 1.4, color: '#334155', marginTop: 4 }}>{`· ${s}`}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Cta() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', height: '100%', padding: '72px 64px' }}>
      <div style={{ ...PANEL, alignItems: 'center', padding: '64px 56px', textAlign: 'center' }}>
        <div style={{ display: 'flex', fontSize: 50, color: '#475569' }}>나는 몇 번 유형일까?</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 18, fontSize: 84, lineHeight: 1.2, color: INK }}>
          <span>프로필 링크에서</span>
          <span style={{ color: '#4f46e5' }}>바로 테스트 👆</span>
        </div>
        <div style={{ display: 'flex', marginTop: 40, padding: '20px 40px', borderRadius: 999, background: INK, color: 'white', fontSize: 36 }}>checkeastpoint.com/play/travel-type</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40, fontSize: 36, lineHeight: 1.45, color: '#334155' }}>
          <span>결과 카드를 스토리에 올리고</span>
          <span>같이 여행 갈 친구를 태그해 보세요 🏷️</span>
        </div>
        <div style={{ display: 'flex', marginTop: 24, fontSize: 30, color: '#94a3b8' }}>Take the quiz · link in bio</div>
      </div>
    </div>
  );
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const m = file.match(/^travel-type-(\d+|story)\.png$/);
  const slide = m && (m[1] === 'story' ? 'story' : Number(m[1]));
  if (!slide || (typeof slide === 'number' && (slide < 1 || slide > 10))) return new Response('Not found', { status: 404 });
  const story = slide === 'story';
  const text = `15문항·3분무료나는서울에서어떤여행자일까?🧳8가지여행성향테스트What kind of Seoul traveler are you?👇링크눌러서바로테스트넘겨서유형미리보기👉스티커자리TYPE/·“”0123456789${KEYS.map((k) => TYPES[k].name.ko + TYPES[k].name.en + TYPES[k].tagline.ko + TYPES[k].strengths.ko.join('')).join('')}나는몇번유형일까?프로필링크에서바로테스트👆checkeastpoint.com/play/travel-type결과카드를스토리에올리고같이갈친구를태그해보세요🏷️Take the quiz · link in bio`;
  const fonts = await loadCjkFonts(text, 800, 'ko');
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: 'transparent', fontFamily: cjkFontFamily('ko') }}>
        {story || slide === 1 ? <Cover story={story} /> : slide === 10 ? <Cta /> : <TypeSlide n={(slide as number) - 2} />}
      </div>
    ),
    { width: W, height: story ? 1920 : 1350, fonts }
  );
}
