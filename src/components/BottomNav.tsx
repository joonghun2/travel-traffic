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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 dark:bg-[#0c101d]/90 backdrop-blur-xl border-t border-gray-200/80 dark:border-gray-800/80 px-3 py-1.5 pb-safe shadow-[0_-8px_24px_rgba(0,0,0,0.12)]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* 1. Live Crowd (Home) */}
        <Link
          href="/"
          className={`relative flex flex-col items-center gap-0.5 py-1 px-4 rounded-2xl transition-all duration-150 active:scale-90 ${
            isHome && !isNearbyActive
              ? 'text-indigo-600 dark:text-cyan-400 font-bold'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium'
          }`}
        >
          <span className="text-xl">🏠</span>
          <span className="text-[11px] tracking-tight leading-none">{t('nav.live')}</span>
          {isHome && !isNearbyActive ? (
            <span className="w-1 h-1 rounded-full bg-indigo-600 dark:bg-cyan-400 shadow-[0_0_6px_rgba(76,215,246,0.8)] mt-1" />
          ) : (
            <span className="w-1 h-1 mt-1" />
          )}
        </Link>

        {/* 2. Play / Tests */}
        <Link
          href="/play"
          className={`relative flex flex-col items-center gap-0.5 py-1 px-4 rounded-2xl transition-all duration-150 active:scale-90 ${
            isPlay
              ? 'text-purple-600 dark:text-purple-400 font-bold'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium'
          }`}
        >
          <span className="text-xl">🎮</span>
          <span className="text-[11px] tracking-tight leading-none">{t('nav.play')}</span>
          {isPlay ? (
            <span className="w-1 h-1 rounded-full bg-purple-600 dark:bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.8)] mt-1" />
          ) : (
            <span className="w-1 h-1 mt-1" />
          )}
        </Link>

        {/* 3. Nearby Spots (Quick action) */}
        {onNearbyClick ? (
          <button
            onClick={onNearbyClick}
            className={`relative flex flex-col items-center gap-0.5 py-1 px-4 rounded-2xl transition-all duration-150 active:scale-90 ${
              isNearbyActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium'
            }`}
          >
            <span className="text-xl">🎯</span>
            <span className="text-[11px] tracking-tight leading-none">{t('nav.nearby')}</span>
            {isNearbyActive ? (
              <span className="w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)] mt-1" />
            ) : (
              <span className="w-1 h-1 mt-1" />
            )}
          </button>
        ) : (
          <Link
            href="/?sort=distance"
            className="relative flex flex-col items-center gap-0.5 py-1 px-4 rounded-2xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-150 active:scale-90"
          >
            <span className="text-xl">🎯</span>
            <span className="text-[11px] tracking-tight leading-none">{t('nav.nearby')}</span>
            <span className="w-1 h-1 mt-1" />
          </Link>
        )}
      </div>
    </nav>
  );
}
