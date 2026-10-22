'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { MapSpot, STATUS_COLOR } from '@/lib/mapSpots';
import { formatDistance, getGoogleNavUrl, getKakaoNavUrl, getNaverNavUrl } from '@/lib/geoUtils';
import NavigationSheet from '@/components/NavigationSheet';

const STATUS_LABEL: Record<MapSpot['status'], string> = {
  relaxed: 'card.status.relaxed',
  moderate: 'card.status.moderate',
  crowded: 'card.status.crowded',
  very_crowded: 'card.status.very_crowded',
  packed: 'card.status.very_crowded',
};

interface Props {
  spot: MapSpot;
  distanceKm?: number;
  onClose: () => void;
  className?: string;
}

export default function SpotSheet({ spot, distanceKm, onClose, className = '' }: Props) {
  const { lang, t, localePath } = useTranslation();
  const [navOpen, setNavOpen] = useState(false);
  const color = STATUS_COLOR[spot.status];

  return (
    <>
      <section
        aria-label={spot.name}
        className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl p-4 ${className}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white leading-snug">
              <span aria-hidden="true" className="mr-1">{spot.emoji}</span>
              {spot.name}
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {lang === 'ko' && spot.gu ? spot.gu : null}
              {lang === 'ko' && spot.gu && distanceKm !== undefined ? ' · ' : null}
              {distanceKm !== undefined ? t('map.fromMe').replace('{d}', formatDistance(distanceKm)) : null}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('map.close')}
            className="w-8 h-8 shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-black tabular-nums" style={{ color }}>
              {spot.score}
            </span>
            <span className="text-xs font-bold text-gray-400">/100</span>
            <span
              className="ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {t(STATUS_LABEL[spot.status])}
            </span>
            {spot.kind === 'forecast' ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                {t('forecast.badge')}
              </span>
            ) : (
              !spot.isLive && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500">
                  {t('map.estimate')}
                </span>
              )
            )}
          </div>
          {spot.kind === 'live' && (
          <div className="text-right text-xs text-gray-500 dark:text-gray-400">
            {t('card.waitTime')}
            <div className="text-sm font-extrabold text-gray-900 dark:text-white">
              ⏱️ {t('card.approx')} {spot.wait}
              {t('card.waitMins')}
            </div>
          </div>
          )}
        </div>

        <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
          {spot.kind === 'forecast' ? (
            <>⏰ {t('forecast.bestDay').replace('{date}', spot.bestTime)}</>
          ) : (
            <>
              <strong className="font-semibold">⏰ {t('card.bestTime')}:</strong> {spot.bestTime}
            </>
          )}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            href={localePath(`/spot/${spot.slug}`)}
            className="h-11 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t('map.detail')}
          </Link>
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
            {t('map.directions')}
          </button>
        </div>
      </section>

      <NavigationSheet
        isOpen={navOpen}
        onClose={() => setNavOpen(false)}
        spotName={spot.name}
        kakaoUrl={getKakaoNavUrl(spot.name, spot.lat, spot.lng)}
        naverUrl={getNaverNavUrl(spot.name, spot.lat, spot.lng)}
        googleUrl={getGoogleNavUrl(spot.name, spot.lat, spot.lng)}
        address={lang === 'ko' ? spot.gu : undefined}
        distanceKm={distanceKm}
      />
    </>
  );
}
