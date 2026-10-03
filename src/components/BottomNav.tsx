'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';

interface BottomNavProps {
  onNearbyClick?: () => void;
  isNearbyActive?: boolean;
}

export default function BottomNav({
  onNearbyClick,
  isNearbyActive = false,
}: BottomNavProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const isHome = pathname === '/';
  const isPlay = pathname.startsWith('/play');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-gray-800/80 px-4 py-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* 1. Live Crowd (Home) */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all duration-150 active:scale-90 ${
            isHome && !isNearbyActive
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium'
          }`}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={isHome && !isNearbyActive ? '2.5' : '2'} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="text-[11px] tracking-tight">{t('nav.live')}</span>
        </Link>

        {/* 2. Play / Tests */}
        <Link
          href="/play"
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all duration-150 active:scale-90 ${
            isPlay
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium'
          }`}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={isPlay ? '2.5' : '2'} strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="3" />
            <path d="M6 12h4m-2-2v4" />
            <circle cx="17" cy="10" r="1" fill="currentColor" />
            <circle cx="15" cy="13" r="1" fill="currentColor" />
          </svg>
          <span className="text-[11px] tracking-tight">{t('nav.play')}</span>
        </Link>

        {/* 3. Nearby Spots (Quick action) */}
        {onNearbyClick ? (
          <button
            onClick={onNearbyClick}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all duration-150 active:scale-90 cursor-pointer ${
              isNearbyActive
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium'
            }`}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={isNearbyActive ? '2.5' : '2'} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={isNearbyActive ? 'currentColor' : 'none'} />
            </svg>
            <span className="text-[11px] tracking-tight">{t('nav.nearby')}</span>
          </button>
        ) : (
          <Link
            href="/?sort=distance"
            className="flex flex-col items-center gap-1 py-1 px-4 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-150 active:scale-90"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            <span className="text-[11px] tracking-tight">{t('nav.nearby')}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
