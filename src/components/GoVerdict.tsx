'use client';

import Link from 'next/link';
import { Lang, LiveSpotMetric } from '@/types';
import { localizePath, pick } from '@/lib/i18n/routing';
import { getSpotSlug } from '@/lib/slug';
import { pickQuietNear } from '@/lib/quietNear';

// "Should I go now?" at the top of a spot page: the live crowd level turned into a decision, the
// usual quiet time, and on busy days the quietest places nearby. Uses the live reading the panel
// polls, so it stays current although the page itself is regenerated once a day.

type Copy = {
  go: string;
  ok: string;
  okRising: string;
  busy: string;
  goSub: string;
  okSub: string;
  okRisingSub: string;
  busySub: string;
  quietTime: string;
  instead: string;
};

const COPY: Partial<Record<Lang, Copy>> & { en: Copy } = {
  ko: {
    go: '✅ 지금 가기 좋아요',
    ok: '🙂 가도 괜찮아요',
    okRising: '⏩ 가려면 지금 출발하세요',
    busy: '⚠️ 지금은 붐벼요',
    goSub: '지금은 여유로운 편이에요.',
    okSub: '보통 수준이에요. 주말 오후만 피하면 편해요.',
    okRisingSub: '보통이지만 점점 붐비는 중이에요.',
    busySub: '시간을 바꾸거나, 근처 한산한 곳을 먼저 둘러보세요.',
    quietTime: '한산한 시간',
    instead: '대신 지금 한산한 근처',
  },
  en: {
    go: '✅ Good time to go now',
    ok: '🙂 Fine to go',
    okRising: '⏩ If you are going, leave now',
    busy: '⚠️ Busy right now',
    goSub: 'It is fairly quiet at the moment.',
    okSub: 'Moderate crowds. Avoiding weekend afternoons helps.',
    okRisingSub: 'Moderate, but getting busier.',
    busySub: 'Try a different time, or visit a quiet place nearby first.',
    quietTime: 'Quiet time',
    instead: 'Quiet nearby right now',
  },
  ja: {
    go: '✅ 今が行きどきです',
    ok: '🙂 行っても大丈夫',
    okRising: '⏩ 行くなら今出発を',
    busy: '⚠️ 今は混雑しています',
    goSub: '今は比較的空いています。',
    okSub: '普通の混み具合です。週末の午後を避けると快適です。',
    okRisingSub: '普通ですが、だんだん混んできています。',
    busySub: '時間をずらすか、近くの空いている場所を先に回りましょう。',
    quietTime: '空いている時間',
    instead: '今空いている近くの場所',
  },
  'zh-cn': {
    go: '✅ 现在去正好',
    ok: '🙂 可以去',
    okRising: '⏩ 要去的话现在出发',
    busy: '⚠️ 现在很拥挤',
    goSub: '目前比较空闲。',
    okSub: '人流一般，避开周末下午会更舒适。',
    okRisingSub: '人流一般，但正在变多。',
    busySub: '换个时间，或先去附近人少的地方。',
    quietTime: '人少的时间',
    instead: '附近现在人少的地方',
  },
  'zh-tw': {
    go: '✅ 現在去正好',
    ok: '🙂 可以去',
    okRising: '⏩ 要去的話現在出發',
    busy: '⚠️ 現在很擁擠',
    goSub: '目前比較空閒。',
    okSub: '人潮普通，避開週末下午會更舒適。',
    okRisingSub: '人潮普通，但正在變多。',
    busySub: '換個時間，或先去附近人少的地方。',
    quietTime: '人少的時間',
    instead: '附近現在人少的地方',
  },
};

const BUSY = new Set(['crowded', 'very_crowded', 'packed']);

export default function GoVerdict({ metric, spots, lang }: { metric: LiveSpotMetric; spots: LiveSpotMetric[]; lang: Lang }) {
  const c = COPY[lang] ?? COPY.en;
  const busy = BUSY.has(metric.status);
  const rising = metric.trend === 'rising';
  const [title, sub, tone] =
    metric.status === 'relaxed'
      ? [c.go, c.goSub, 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800']
      : busy
        ? [c.busy, c.busySub, 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800']
        : rising
          ? [c.okRising, c.okRisingSub, 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800']
          : [c.ok, c.okSub, 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'];

  // Quiet places nearby (stations and this spot left out), only when this one is busy.
  const alternatives = busy
    ? pickQuietNear(
        spots.filter((s) => s.id !== metric.id && !/station/i.test(s.name.en)),
        [metric.lat, metric.lng],
        3,
      ).filter((s) => !BUSY.has(s.status))
    : [];
  const bestTime = pick(metric.bestTime, lang);

  return (
    <div className={`mb-4 p-4 rounded-2xl border ${tone}`}>
      <p className="text-lg font-black text-gray-900 dark:text-white">{title}</p>
      <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-200">{sub}</p>
      {bestTime && (
        <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
          <strong className="font-bold">⏰ {c.quietTime}:</strong> {bestTime}
        </p>
      )}
      {alternatives.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-200">🌿 {c.instead}</p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {alternatives.map((s) => (
              <li key={s.id}>
                <Link
                  href={localizePath(`/spot/${getSpotSlug(s)}`, lang)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-800 dark:text-gray-100"
                >
                  {s.emoji} {pick(s.name, lang)} <span className="text-emerald-600 dark:text-emerald-400">{s.currentScore}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
