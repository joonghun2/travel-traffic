import type { Metadata } from 'next';
import { getForecast } from '@/lib/forecast';
import { buildWeek, koDate, nextMonday, SnsPost } from '@/lib/snsWeek';
import CopyCaption from './CopyCaption';

// Operator page: next week's Instagram/Threads posts to schedule in Meta Business Suite.
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
            <li>각 게시물의 <b>피드 이미지</b>를 저장하고 <b>글 복사</b>를 누르세요.</li>
            <li>Meta Business Suite → <b>게시물 만들기</b> → 인스타그램 선택 → 이미지·글 붙여넣기 → <b>예약</b>(날짜·시간 지정).</li>
            <li>Threads는 Threads 앱에서 같은 이미지·글로 <b>예약</b>하세요.</li>
            <li>일요일 릴스: 아래 스토리 이미지 6장을 인스타 앱 <b>릴스</b>에서 한 번에 고르고 인기 음악을 붙이세요.</li>
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
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-300">이번 주 스토리 이미지 6장으로 릴스를 만드세요 (사진당 2~3초).</p>
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
