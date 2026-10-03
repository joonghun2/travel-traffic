'use client';

import React, { useState } from 'react';
import { LiveSpotMetric } from '@/types';
import { useTranslation } from '@/lib/i18n/context';
import dynamic from 'next/dynamic';
import NavigationSheet from './NavigationSheet';
import {
  formatDistance,
  getKakaoNavUrl,
  getNaverNavUrl,
  getGoogleNavUrl,
} from '@/lib/geoUtils';

const EscapeRouteCard = dynamic(() => import('./EscapeRouteCard'), {
  ssr: false,
});

interface CrowdCardProps {
  spot: LiveSpotMetric;
  userLat?: number | null;
  userLng?: number | null;
}

export default function CrowdCard({ spot, userLat, userLng }: CrowdCardProps) {
  const { lang, t } = useTranslation();
  const [showEscape, setShowEscape] = useState(false);
  const [showNavSheet, setShowNavSheet] = useState(false);

  const name = spot.name[lang] || spot.name.ko;
  const address =
    (spot.address?.[lang] || spot.address?.ko) ||
    (spot.area?.[lang] || spot.area?.ko) ||
    '';
  const bestTime = spot.bestTime?.[lang] || spot.bestTime?.ko || '';
  const secretTip =
    (spot.secretTip?.[lang] || spot.secretTip?.ko) ||
    (spot.tip?.[lang] || spot.tip?.ko) ||
    '';

  // Status tokens with WCAG AA 4.5:1 compliant contrast & semantic colors
  const getStatusBadge = () => {
    switch (spot.status) {
      case 'relaxed':
        return {
          colorText: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
          dot: 'bg-emerald-600 dark:bg-emerald-400',
          bar: 'bg-emerald-500',
          text: t('card.status.relaxed'),
        };
      case 'moderate':
        return {
          colorText: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700',
          dot: 'bg-amber-600 dark:bg-amber-400',
          bar: 'bg-amber-500',
          text: t('card.status.moderate'),
        };
      case 'crowded':
        return {
          colorText: 'text-orange-600 dark:text-orange-400',
          bg: 'bg-orange-50 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700',
          dot: 'bg-orange-600 dark:bg-orange-400',
          bar: 'bg-orange-500',
          text: t('card.status.crowded'),
        };
      case 'very_crowded':
      case 'packed':
      default:
        return {
          colorText: 'text-rose-600 dark:text-rose-400',
          bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700',
          dot: 'bg-rose-600 dark:bg-rose-400',
          bar: 'bg-rose-500',
          text: t('card.status.very_crowded'),
        };
    }
  };

  const badge = getStatusBadge();

  // Navigation URLs
  const kakaoUrl = getKakaoNavUrl(
    name,
    spot.lat,
    spot.lng,
    userLat || undefined,
    userLng || undefined
  );
  const naverUrl = getNaverNavUrl(name, spot.lat, spot.lng);
  const googleUrl = getGoogleNavUrl(
    name,
    spot.lat,
    spot.lng,
    userLat || undefined,
    userLng || undefined
  );

  return (
    <>
      <article className="group relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800/90 p-5 hover:shadow-xl transition-all duration-200 flex flex-col justify-between shadow-xs">
        {/* Row 1: Header (Spot Name, District/Address, 4-tier Badge) */}
        <div>
          <div className="flex items-start justify-between gap-2.5 mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {spot.emoji && (
                  <span className="text-base select-none" aria-hidden="true">
                    {spot.emoji}
                  </span>
                )}
                <h2 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {name}
                </h2>
              </div>
              {address && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {address}
                </p>
              )}
            </div>

            {/* Single 4-tier status badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold flex-shrink-0 shadow-2xs ${badge.bg}`}
            >
              <span className={`inline-block w-2 h-2 rounded-full ${badge.dot}`} aria-hidden="true" />
              <span>{badge.text}</span>
            </div>
          </div>

          {/* Row 2: HeyDealer Big Number Hierarchy (Giant Score + /100 + Wait Time) */}
          <div className="my-3 p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100/80 dark:border-gray-800/60">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-0.5">
                  {t('card.crowdIndex')}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl sm:text-5xl font-black tabular-nums tracking-tight ${badge.colorText}`}>
                    {spot.currentScore}
                  </span>
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
                    /100
                  </span>
                </div>
              </div>

              {/* Wait Time Pill */}
              <div className="text-right">
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-0.5">
                  {t('card.waitTime')}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white dark:bg-gray-900 font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white border border-gray-200/80 dark:border-gray-700/80 shadow-2xs">
                  ⏱️ 약 {spot.waitTimeMinutes}{t('card.waitMins')}
                </span>
              </div>
            </div>

            {/* Gauge progress bar */}
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${badge.bar}`}
                style={{ width: `${Math.min(100, Math.max(5, spot.currentScore))}%` }}
              />
            </div>
          </div>

          {/* Row 3: Recommended Visit Time & Tip (Clean 1-line) */}
          <div className="space-y-1.5 mb-4 text-xs">
            {bestTime && (
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 font-medium truncate">
                <span className="text-emerald-500 font-bold" aria-hidden="true">⏰</span>
                <span className="truncate">
                  <strong className="text-gray-800 dark:text-gray-200 font-semibold">{t('card.bestTime')}:</strong> {bestTime}
                </span>
              </div>
            )}
            {secretTip && (
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[11px] truncate">
                <span className="text-amber-500 font-bold" aria-hidden="true">💡</span>
                <span className="truncate">{secretTip}</span>
              </div>
            )}
          </div>
        </div>

        {/* Row 4: Single [길찾기] Button + Escape Route Tag */}
        <div>
          {/* Distance Bar if user location available */}
          {typeof spot.distanceKm === 'number' && (
            <div className="mb-2.5 px-2.5 py-1.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100/60 dark:border-blue-900/30 flex items-center justify-between text-[11px]">
              <span className="text-blue-700 dark:text-blue-300 font-bold">
                📍 {formatDistance(spot.distanceKm)}
              </span>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium">
                {typeof spot.walkTimeMinutes === 'number' && (
                  <span>도보 ~{spot.walkTimeMinutes}분</span>
                )}
                {typeof spot.transitTimeMinutes === 'number' && (
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                    교통 ~{spot.transitTimeMinutes}분
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Row: Single [길찾기] button + Escape Gem toggle */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setShowNavSheet(true)}
              className="flex-1 h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
              </svg>
              <span>길찾기 안내</span>
            </button>

            {spot.escapeRoute && (
              <button
                onClick={() => setShowEscape(!showEscape)}
                className={`h-11 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border cursor-pointer active:scale-95 ${
                  showEscape
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                }`}
                title="인파 회피 히든 스팟 확인"
              >
                <span>✨</span>
                <span className="hidden sm:inline">{showEscape ? t('escape.close') : t('escape.open')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Escape Route Box */}
        {showEscape && spot.escapeRoute && (
          <div className="mt-3">
            <EscapeRouteCard
              escapeRoute={spot.escapeRoute}
              parentSpotName={name}
              originLat={spot.lat}
              originLng={spot.lng}
            />
          </div>
        )}
      </article>

      {/* Navigation Bottom Sheet */}
      <NavigationSheet
        isOpen={showNavSheet}
        onClose={() => setShowNavSheet(false)}
        spotName={name}
        kakaoUrl={kakaoUrl}
        naverUrl={naverUrl}
        googleUrl={googleUrl}
        address={address}
        distanceKm={spot.distanceKm}
        walkMinutes={spot.walkTimeMinutes}
        transitMinutes={spot.transitTimeMinutes}
      />
    </>
  );
}
