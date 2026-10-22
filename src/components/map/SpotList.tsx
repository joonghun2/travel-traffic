'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { MapSpot, STATUS_COLOR } from '@/lib/mapSpots';
import { formatDistance } from '@/lib/geoUtils';

interface Props {
  spots: MapSpot[];
  title: string;
  selectedId: number | null;
  onSelect: (id: number) => void;
  distances: Map<number, number> | null;
  className?: string;
}

// Ranked list of every spot. Server-rendered so names and scores are in the HTML.
export default function SpotList({ spots, title, selectedId, onSelect, distances, className = '' }: Props) {
  const { t, localePath } = useTranslation();
  const selectedRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedId]);

  return (
    <section className={className} aria-label={title}>
      <h2 className="px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 sticky top-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur z-10">
        {title}
      </h2>
      <ol className="divide-y divide-gray-100 dark:divide-gray-800">
        {spots.map((s, i) => {
          const selected = s.id === selectedId;
          const d = distances?.get(s.id);
          return (
            <li key={s.id} ref={selected ? selectedRef : undefined} className={selected ? 'bg-blue-50 dark:bg-blue-950/40' : ''}>
              <div className="flex items-center gap-2 pr-2">
                <button
                  type="button"
                  onClick={() => onSelect(s.id)}
                  aria-pressed={selected}
                  className="flex-1 min-w-0 flex items-center gap-2 px-3 py-2 text-left cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <span className="w-5 text-right text-[11px] font-bold text-gray-400 tabular-nums">{i + 1}</span>
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLOR[s.status] }} aria-hidden="true" />
                  <span className={`flex-1 min-w-0 truncate text-sm ${selected ? 'font-extrabold' : 'font-medium'} text-gray-800 dark:text-gray-100`}>
                    {s.name}
                  </span>
                  <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400 shrink-0">
                    {d !== undefined ? formatDistance(d) : `${s.score}${s.isLive ? '' : '*'}`}
                  </span>
                </button>
                <Link
                  href={localePath(`/spot/${s.slug}`)}
                  aria-label={`${s.name} ${t('map.detail')}`}
                  className="text-gray-300 hover:text-blue-500 text-sm px-1"
                >
                  ›
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="px-3 py-2 text-[10px] text-gray-400">* {t('map.estimate')}</p>
    </section>
  );
}
