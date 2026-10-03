'use client';

import React, { useState } from 'react';
import { LiveSpotMetric } from '@/types';
import { useTranslation } from '@/lib/i18n/context';
import dynamic from 'next/dynamic';
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

  // Status colors & labels (WCAG AA 4.5:1 compliant contrast)
  const getStatusBadge = () => {
    switch (spot.status) {
      case 'relaxed':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
          dot: 'bg-emerald-600 dark:bg-emerald-400',
          text: t('card.status.relaxed'),
        };
      case 'moderate':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700',
          dot: 'bg-amber-600 dark:bg-amber-400',
          text: t('card.status.moderate'),
        };
      case 'packed':
      default:
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700',
          dot: 'bg-rose-600 dark:bg-rose-400 animate-pulse',
          text: t('card.status.packed'),
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

  const navSuffix = lang === 'ko' ? '길찾기' : lang === 'ja' ? '道案内' : 'Directions';

  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-lg transition-all duration-300">
      {/* Header: Name, Address, Status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            {spot.emoji && <span className="text-base" aria-hidden="true">{spot.emoji}</span>}
            <h2 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {name}
            </h2>
            {spot.surgeAlert && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800/60">
                {t('surge.alert')}
              </span>
            )}
          </div>
          {address && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{address}</p>
          )}
        </div>

        {/* Live Status Badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${badge.bg}`}>
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span
              className={`animate-radar absolute inline-flex h-full w-full rounded-full opacity-75 ${
                spot.status === 'packed'
                  ? 'bg-rose-500'
                  : spot.status === 'moderate'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${badge.dot}`} />
          </span>
          <span>{badge.text}</span>
        </div>
      </div>

      {/* Real-time Distance & Travel Time from User Location */}
      {typeof spot.distanceKm === 'number' && (
        <div className="mb-3.5 px-3 py-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-semibold">
            <span>📍 {t('dist.from_me')}</span>
            <span className="font-bold">{formatDistance(spot.distanceKm)}</span>
          </div>
          <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-300">
            {typeof spot.walkTimeMinutes === 'number' && (
              <span className="flex items-center gap-0.5">
                🚶 {t('dist.walk')} <strong>{spot.walkTimeMinutes}{t('dist.min')}</strong>
              </span>
            )}
            {typeof spot.transitTimeMinutes === 'number' && (
              <span className="flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400">
                🚌 {t('dist.transit')} <strong>{spot.transitTimeMinutes}{t('dist.min')}</strong>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Metrics Bar: Crowd Score & Wait Time */}
      <div className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-center">
        <div>
          <span className="text-[11px] text-gray-600 dark:text-gray-300 block font-medium">
            {t('card.crowdIndex')}
          </span>
          <span className="text-xl font-black text-gray-900 dark:text-white">
            {spot.currentScore}
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-0.5">/100</span>
          </span>
        </div>
        <div>
          <span className="text-[11px] text-gray-600 dark:text-gray-300 block font-medium">
            {t('card.waitTime')}
          </span>
          <span className="text-xl font-black text-gray-900 dark:text-white">
            {spot.waitTimeMinutes}
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-0.5">{t('card.waitMins')}</span>
          </span>
        </div>
      </div>

      {/* Tips: Best Time & Secret Tip */}
      <div className="space-y-1.5 mb-4 text-xs">
        {bestTime && (
          <div className="flex items-start gap-1.5 text-gray-600 dark:text-gray-400">
            <span className="text-emerald-500 font-bold flex-shrink-0" aria-hidden="true">⏰</span>
            <span>
              <strong className="text-gray-700 dark:text-gray-300">{t('card.bestTime')}:</strong>{' '}
              {bestTime}
            </span>
          </div>
        )}
        {secretTip && (
          <div className="flex items-start gap-1.5 text-gray-600 dark:text-gray-400">
            <span className="text-amber-500 font-bold flex-shrink-0" aria-hidden="true">💡</span>
            <span>
              <strong className="text-gray-700 dark:text-gray-300">{t('card.secretTip')}:</strong>{' '}
              {secretTip}
            </span>
          </div>
        )}
      </div>

      {/* Card Actions: Multi-Map Navigation & Escape Route Toggle */}
      <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2">
        {/* Map Links (Kakao, Naver, Google) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <a
            href={kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#FEE500] hover:bg-[#FDD835] text-[#191919] transition-all flex items-center gap-1 shadow-2xs hover:scale-105 active:scale-95"
            title={`${name} - ${t('map.kakao')}`}
            aria-label={`${t('map.kakao')} - ${name} ${navSuffix}`}
          >
            <span className="w-4 h-4 rounded-full bg-[#191919] text-[#FEE500] text-[10px] font-black flex items-center justify-center" aria-hidden="true">
              K
            </span>
            <span>{t('map.kakao')}</span>
          </a>

          <a
            href={naverUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#03C75A] hover:bg-[#02b351] text-white transition-all flex items-center gap-1 shadow-2xs hover:scale-105 active:scale-95"
            title={`${name} - ${t('map.naver')}`}
            aria-label={`${t('map.naver')} - ${name} ${navSuffix}`}
          >
            <span className="w-4 h-4 rounded-full bg-white text-[#03C75A] text-[10px] font-black flex items-center justify-center" aria-hidden="true">
              N
            </span>
            <span>{t('map.naver')}</span>
          </a>

          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 transition-all flex items-center gap-1 shadow-2xs hover:scale-105 active:scale-95"
            title={`${name} - ${t('map.google')}`}
            aria-label={`${t('map.google')} - ${name} ${navSuffix}`}
          >
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center" aria-hidden="true">
              G
            </span>
            <span>{t('map.google')}</span>
          </a>
        </div>

        {/* Toggle Hidden Gem Escape Route */}
        {spot.escapeRoute && (
          <button
            onClick={() => setShowEscape(!showEscape)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              showEscape
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50'
            }`}
          >
            <span>✨</span>
            <span>{showEscape ? t('escape.close') : t('escape.open')}</span>
          </button>
        )}
      </div>

      {/* Render Escape Route Card */}
      {showEscape && spot.escapeRoute && (
        <EscapeRouteCard
          escapeRoute={spot.escapeRoute}
          parentSpotName={name}
          originLat={spot.lat}
          originLng={spot.lng}
        />
      )}
    </div>
  );
}
