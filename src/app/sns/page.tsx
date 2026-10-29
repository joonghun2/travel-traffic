import type { Metadata } from 'next';
import { getForecast } from '@/lib/forecast';
import { buildWeek, koDate, nextMonday, SnsPost } from '@/lib/snsWeek';
import CopyCaption from './CopyCaption';

// Operator page: next week's Instagram/Threads posts to schedule in the Instagram and Threads apps.
// Not linked anywhere and kept out of search (also disallowed in robots.ts).
export const metadata: Metadata = { title: 'SNS 주간 게시물', robots: { index: false, follow: false } };
export const revalidate = 3600;
export const preferredRegion = 'icn1';

const KIND_LABEL: Record<SnsPost['kind'], string> = {
  hours: '⏰ 한산한 시간',
  gem: '💎 숨은 명소',
  day: '📅 주말 한산한 곳',
  reel: '🎬 릴스',
};

const btn = 'h-10 px-4 rounded-xl text-xs font-bold flex items-center justify-center';

export default async function SnsWeekPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const { week } = await searchParams;
  const monday = week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? week : nextMonday();
  const posts = buildWeek(monday, await getForecast());
  const slides = posts.filter((p) => p.image);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-black">SNS 주간 게시물 · {koDate(monday)} 주</h1>
          <ol className="text-sm text-gray-600 dark:text-gray-300 list-decimal pl-5 space-y-1">
            <li>휴대폰에서 이 페이지를 열고, 게시물마다 <b>피드 이미지 저장</b>과 <b>글 복사</b>를 누르세요.</li>
            <li>인스타 앱 <b>＋</b> → 이미지 고르기 → 글 붙여넣기 → <b>고급 설정 → 이 게시물 예약하기</b>.</li>
            <li>Threads는 Threads 앱에서 같은 이미지·글로 <b>예약</b>하세요.</li>
            <li>일요일 릴스: 무제 드라이브 <b>사진 data/릴스</b> 폴더의 영상(직접 편집) → 인스타 앱 <b>릴스</b> → <b>♪ 인기 음악</b> → 예약.</li>
          </ol>
          <p className="text-xs text-gray-500">추천 시간: 평일 저녁 7~9시, 주말 오전 10~12시</p>
        </header>

        {posts.map((p) => (
          <section key={p.date} className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-3">
            <h2 className="font-bold">
              {koDate(p.date)} · {KIND_LABEL[p.kind]}
            </h2>
            {p.image ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/sns/${p.image}-feed.png`} alt="" width={1080} height={1350} loading="lazy" className="w-full max-w-sm rounded-2xl" />
                <div className="flex flex-wrap gap-2">
                  <a href={`/sns/${p.image}-feed.png`} download={`${p.date}-${p.image}-feed.png`} className={`${btn} bg-blue-600 text-white`}>
                    피드 이미지 저장
                  </a>
                  <a href={`/sns/${p.image}-story.png`} download={`${p.date}-${p.image}-story.png`} className={`${btn} bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100`}>
                    스토리 이미지 저장
                  </a>
                  <CopyCaption text={p.caption} />
                </div>
                <p className="text-xs text-gray-500">
                  레이어 따로 받기:{' '}
                  <a href={`/sns/${p.image}-story-bg.png`} download={`${p.date}-${p.image}-배경.png`} className="underline">
                    배경만
                  </a>{' '}
                  ·{' '}
                  <a href={`/sns/${p.image}-story-text.png`} download={`${p.date}-${p.image}-글씨.png`} className="underline">
                    글씨만(투명)
                  </a>
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-300">릴스 영상과 레이어는 무제 드라이브의 사진 data/릴스 폴더에 저장돼요. 직접 만들려면 아래 스토리 이미지를 쓰세요.</p>
                <div className="grid grid-cols-3 gap-2">
                  {slides.map((s, i) => (
                    <a key={s.image} href={`/sns/${s.image}-story.png`} download={`reel-${i + 1}-${s.image}.png`} className={`${btn} bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100`}>
                      {i + 1}번 저장
                    </a>
                  ))}
                </div>
                <CopyCaption text={p.caption} />
              </>
            )}
            <pre className="whitespace-pre-wrap [overflow-wrap:anywhere] text-xs leading-relaxed p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">{p.caption}</pre>
          </section>
        ))}
      </div>
    </main>
  );
}
