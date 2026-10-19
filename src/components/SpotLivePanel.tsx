'use client';

import React, { useEffect, useState } from 'react';
import { CrowdStatus, LiveSpotMetric } from '@/types';
import { useTranslation } from '@/lib/i18n/context';

const STATUS_STYLE: Record<CrowdStatus, { text: string; badge: string; bar: string; label: string }> = {
  relaxed: {
    text: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    bar: 'bg-emerald-500',
    label: 'card.status.relaxed',
  },
  moderate: {
    text: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    bar: 'bg-amber-500',
    label: 'card.status.moderate',
  },
  crowded: {
    text: 'text-orange-600 dark:text-orange-400',
    badge: 'bg-orange-50 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700',
    bar: 'bg-orange-500',
    label: 'card.status.crowded',
  },
  very_crowded: {
    text: 'text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700',
    bar: 'bg-rose-500',
    label: 'card.status.very_crowded',
  },
  packed: {
    text: 'text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700',
    bar: 'bg-rose-500',
    label: 'card.status.very_crowded',
  },
};

export default function SpotLivePanel({ initial }: { initial: LiveSpotMetric }) {
  const { t } = useTranslation();
  const [metric, setMetric] = useState(initial);

  useEffect(() => {
    const fetchMetric = async () => {
      try {
        const res = await fetch('/api/crowd', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const live = (data.spots as LiveSpotMetric[] | undefined)?.find((s) => s.id === initial.id);
        if (live) setMetric(live);
      } catch {}
    };
    fetchMetric();
    const interval = setInterval(fetchMetric, 60000);
    return () => clearInterval(interval);
  }, [initial.id]);

  const style = STATUS_STYLE[metric.status] || STATUS_STYLE.moderate;
  const trend = metric.trend || 'stable';

  return (
    <section className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">{t('spot.liveNow')}</h2>
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${style.badge}`}>
          <span className={`inline-block w-2 h-2 rounded-full ${style.bar}`} aria-hidden="true" />
          {t(style.label)}
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-4">
        <div className="flex items-baseline gap-1">
          <span className={`text-6xl font-black tabular-nums tracking-tight ${style.text}`}>{metric.currentScore}</span>
          <span className="text-sm font-bold text-gray-400 dark:text-gray-500">/100</span>
        </div>
        <div className="text-right">
          <span className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400">{t('card.waitTime')}</span>
          <span className="text-lg font-extrabold text-gray-900 dark:text-white">
            ⏱️ {t('card.approx')} {metric.waitTimeMinutes}
            {t('card.waitMins')}
          </span>
        </div>
      </div>

      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
          style={{ width: `${Math.min(100, Math.max(5, metric.currentScore))}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="font-semibold">
          {trend === 'rising' ? '↗' : trend === 'falling' ? '↘' : '→'} {t(`spot.trend.${trend}`)}
        </span>
        <span>{t('spot.updated')}</span>
      </div>
    </section>
  );
}
