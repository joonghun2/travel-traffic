'use client';

import React from 'react';
import { EscapeRoute } from '@/types';
import { useTranslation } from '@/lib/i18n/context';
import { getKakaoNavUrl, getNaverNavUrl, getGoogleNavUrl } from '@/lib/geoUtils';

interface EscapeRouteCardProps {
  escapeRoute: EscapeRoute;
  parentSpotName: string;
  originLat?: number;
  originLng?: number;
}

export default function EscapeRouteCard({
  escapeRoute,
  parentSpotName,
  originLat,
  originLng,
}: EscapeRouteCardProps) {
  const { lang, t } = useTranslation();

  const gemName = escapeRoute.gemName[lang] || escapeRoute.gemName.ko;
  const gemDesc = escapeRoute.gemDesc[lang] || escapeRoute.gemDesc.ko;

  const targetLat = escapeRoute.lat || originLat || 37.5665;
  const targetLng = escapeRoute.lng || originLng || 126.9780;

  const kakaoUrl = getKakaoNavUrl(
    gemName,
    targetLat,
    targetLng,
    originLat,
    originLng
  );
  const naverUrl = getNaverNavUrl(gemName, targetLat, targetLng);
  const googleUrl = getGoogleNavUrl(
    gemName,
    targetLat,
    targetLng,
    originLat,
    originLng
  );

  return (
    <div className="mt-3 p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 relative overflow-hidden transition-all duration-200">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs flex-shrink-0">
            ✨
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block tracking-tight">
              {t('escape.badge')}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {parentSpotName} ➔ <strong className="text-gray-800 dark:text-gray-200">{gemName}</strong>
            </span>
          </div>
        </div>

        {/* Walk time badge */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
            🚶 {t('dist.walk')} {escapeRoute.walkMinutes}{t('dist.min')}
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
            -{escapeRoute.crowdDiffPercent}%
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed pl-8 mb-3">
        {gemDesc}
      </p>

      {/* Action Buttons: Multi-Map Direct Navigation */}
      <div className="flex items-center gap-1.5 pl-8 pt-1 flex-wrap">
        <a
          href={kakaoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#FEE500] hover:bg-[#FDD835] text-[#191919] transition-all shadow-2xs hover:scale-105 active:scale-95"
          title={t('escape.navKakao')}
        >
          <span className="w-3.5 h-3.5 rounded-full bg-[#191919] text-[#FEE500] text-[9px] font-black flex items-center justify-center">
            K
          </span>
          <span>{t('map.kakao')}</span>
        </a>

        <a
          href={naverUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#03C75A] hover:bg-[#02b351] text-white transition-all shadow-2xs hover:scale-105 active:scale-95"
          title={t('escape.navNaver')}
        >
          <span className="w-3.5 h-3.5 rounded-full bg-white text-[#03C75A] text-[9px] font-black flex items-center justify-center">
            N
          </span>
          <span>{t('map.naver')}</span>
        </a>

        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 transition-all shadow-2xs hover:scale-105 active:scale-95"
          title={t('escape.navGoogle')}
        >
          <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center">
            G
          </span>
          <span>{t('map.google')}</span>
        </a>
      </div>
    </div>
  );
}
