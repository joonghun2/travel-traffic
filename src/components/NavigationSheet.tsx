'use client';

import React, { useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/context';

interface NavigationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  spotName: string;
  kakaoUrl: string;
  naverUrl: string;
  googleUrl: string;
  address?: string;
  distanceKm?: number;
  walkMinutes?: number;
  transitMinutes?: number;
}

export default function NavigationSheet({
  isOpen,
  onClose,
  spotName,
  kakaoUrl,
  naverUrl,
  googleUrl,
  address,
  distanceKm,
  walkMinutes,
  transitMinutes,
}: NavigationSheetProps) {
  const { t, lang } = useTranslation();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navSuffix = lang === 'ko' ? '길찾기' : lang === 'ja' ? '道案内' : 'Directions';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="nav-sheet-title"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-gray-100 dark:border-gray-800 transition-all animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle for mobile */}
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 tracking-wide uppercase">
              {t('map.title', '스마트 길찾기')}
            </span>
            <h2 id="nav-sheet-title" className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
              {spotName}
            </h2>
            {address && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{address}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors text-sm font-semibold"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Distance Info if available */}
        {typeof distanceKm === 'number' && (
          <div className="mb-4 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-xs">
            <span className="font-semibold text-blue-700 dark:text-blue-300">
              📍 내 위치에서 약 {distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`}
            </span>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-medium">
              {walkMinutes && <span>도보 ~{walkMinutes}분</span>}
              {transitMinutes && <span className="text-indigo-600 dark:text-indigo-400">대중교통 ~{transitMinutes}분</span>}
            </div>
          </div>
        )}

        {/* Map Links */}
        <div className="space-y-2.5">
          {/* Kakao Map */}
          <a
            href={kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-12 px-4 rounded-xl font-bold text-sm bg-[#FEE500] hover:bg-[#FDD835] text-[#191919] transition-all flex items-center justify-between shadow-2xs hover:shadow-sm group active:scale-[0.99]"
            aria-label={`${t('map.kakao')} - ${spotName} ${navSuffix}`}
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#191919] text-[#FEE500] text-xs font-black flex items-center justify-center" aria-hidden="true">
                K
              </span>
              <span>{t('map.kakao')}</span>
            </div>
            <span className="text-xs text-black/60 group-hover:translate-x-0.5 transition-transform">
              열기 →
            </span>
          </a>

          {/* Naver Map */}
          <a
            href={naverUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-12 px-4 rounded-xl font-bold text-sm bg-[#03C75A] hover:bg-[#02b351] text-white transition-all flex items-center justify-between shadow-2xs hover:shadow-sm group active:scale-[0.99]"
            aria-label={`${t('map.naver')} - ${spotName} ${navSuffix}`}
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-white text-[#03C75A] text-xs font-black flex items-center justify-center" aria-hidden="true">
                N
              </span>
              <span>{t('map.naver')}</span>
            </div>
            <span className="text-xs text-white/80 group-hover:translate-x-0.5 transition-transform">
              열기 →
            </span>
          </a>

          {/* Google Maps */}
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-12 px-4 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 transition-all flex items-center justify-between shadow-2xs hover:shadow-sm group active:scale-[0.99]"
            aria-label={`${t('map.google')} - ${spotName} ${navSuffix}`}
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center" aria-hidden="true">
                G
              </span>
              <span>{t('map.google')}</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:translate-x-0.5 transition-transform">
              열기 →
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
