import Link from 'next/link';
import { Lang, LiveSpotMetric, Spot } from '@/types';
import { localizePath, pick } from '@/lib/i18n/routing';
import { getSpotSlug } from '@/lib/spots';
import ShareButton from '@/components/ShareButton';
import { courseStops, courseTitle } from '@/lib/course';

// Two cards for spots people visit right after searching (Lotte World first):
// - QueueTestCard: "3-minute test while you wait in line" -> the travel-type test (low bounce, shareable).
// - NearbyCourseCard: an ordered course of the spot and its sightseeing neighbors, quietest first
//   by the current crowd score, with a share button that sends the course as text.

type CourseCopy = {
  title: string;
  sub: string;
  walk: string;
  share: string;
  shareTitle: string;
  queueTitle: string;
  queueBody: string;
  queueCta: string;
  status: Record<string, string>;
};

const COPY: Partial<Record<Lang, CourseCopy>> & { en: CourseCopy } = {
  ko: {
    title: '{course} (지금 혼잡도 기준)',
    sub: '지금 가장 한산한 곳부터 도는 순서예요. 점수는 실시간으로 바뀌어요.',
    walk: '여기서 {d}',
    share: '친구에게 코스 보내기',
    shareTitle: '{course}',
    queueTitle: '⏳ 줄 서는 동안 3분 테스트 어때요?',
    queueBody: '나는 어떤 여행자일까? 결과를 친구에게 보내면 둘의 여행 궁합 %도 바로 나와요.',
    queueCta: '여행 성향 테스트 하기 →',
    status: { relaxed: '여유', moderate: '보통', crowded: '혼잡', very_crowded: '매우 혼잡', packed: '매우 혼잡' },
  },
  en: {
    title: '{course} right now',
    sub: 'Start with the quietest spot. Scores update live.',
    walk: '{d} from here',
    share: 'Send this route to friends',
    shareTitle: '{course}',
    queueTitle: '⏳ Waiting in line? Try a 3-minute test',
    queueBody: 'What kind of traveler are you? Share your result and see your travel match with friends.',
    queueCta: 'Take the travel test →',
    status: { relaxed: 'Quiet', moderate: 'Moderate', crowded: 'Busy', very_crowded: 'Very busy', packed: 'Very busy' },
  },
};

const DOT: Record<string, string> = {
  relaxed: 'bg-emerald-500',
  moderate: 'bg-amber-500',
  crowded: 'bg-orange-500',
  very_crowded: 'bg-rose-500',
  packed: 'bg-rose-600',
};

const copyFor = (lang: Lang) => COPY[lang] ?? COPY.en;
const dist = (km: number) => (km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`);

export function QueueTestCard({ lang }: { lang: Lang }) {
  const c = copyFor(lang);
  return (
    <section className="p-5 rounded-3xl bg-gradient-to-br from-amber-50 to-rose-50 dark:from-amber-950/30 dark:to-rose-950/30 border border-amber-100 dark:border-amber-900/40">
      <h2 className="text-base font-bold text-gray-900 dark:text-white">{c.queueTitle}</h2>
      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{c.queueBody}</p>
      <Link
        href={localizePath('/play/travel-type', lang)}
        className="mt-3 inline-flex items-center px-4 py-2.5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold"
      >
        {c.queueCta}
      </Link>
    </section>
  );
}

export function NearbyCourseCard({
  lang,
  spot,
  metric,
  metrics,
  sharePath,
  shareImageUrl,
}: {
  lang: Lang;
  spot: Spot;
  metric: LiveSpotMetric;
  metrics: LiveSpotMetric[];
  sharePath: string;
  /** Course infographic for the share card (src/app/share/course/[slug]). */
  shareImageUrl: string;
}) {
  const base = copyFor(lang);
  const course = courseTitle(getSpotSlug(spot), lang);
  const c = { ...base, title: base.title.replace('{course}', course), shareTitle: base.shareTitle.replace('{course}', course) };
  const stops = courseStops(spot, metric, metrics);

  const shareText = [
    `${c.shareTitle}`,
    ...stops.map((s, i) => `${i + 1}. ${pick(s.spot.name, lang)} · ${c.status[s.m.status]} ${s.m.currentScore}`),
  ].join('\n');

  return (
    <section className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
      <div>
        <h2 className="text-base font-bold text-gray-900 dark:text-white">🗺️ {c.title}</h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{c.sub}</p>
      </div>
      <ol className="space-y-2">
        {stops.map((s, i) => (
          <li key={s.spot.id}>
            <Link
              href={localizePath(`/spot/${getSpotSlug(s.spot)}`, lang)}
              className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="w-7 h-7 shrink-0 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-black flex items-center justify-center">
                {i + 1}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold text-gray-900 dark:text-white truncate">
                  {s.spot.emoji} {pick(s.spot.name, lang)}
                </span>
                {s.distanceKm > 0 && <span className="block text-[11px] text-gray-500">{c.walk.replace('{d}', dist(s.distanceKm))}</span>}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-200 shrink-0">
                <span className={`w-2.5 h-2.5 rounded-full ${DOT[s.m.status] ?? 'bg-gray-400'}`} />
                {c.status[s.m.status]} {s.m.currentScore}
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <ShareButton path={sharePath} title={c.shareTitle} text={shareText} imageUrl={shareImageUrl} label={c.share} />
    </section>
  );
}
