'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import ThemeToggle from './ThemeToggle';

interface DashboardHeaderProps {
  dataSourceType?: string;
  connectedCount?: number;
}

export default function DashboardHeader({
  dataSourceType = 'LIVE_API',
  connectedCount = 0,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const { lang, setLang, t } = useTranslation();

  const isHome = pathname === '/';
  const isPlay = pathname.startsWith('/play');

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border-b border-gray-100 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm sm:text-base shadow-md shadow-blue-500/20">
              C
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-gray-900 dark:text-white tracking-tight text-base sm:text-lg">
                Check East Point
              </span>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold">
                <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                  <span className="animate-radar absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span>LIVE</span>
              </div>
            </div>
          </Link>

          {/* Navigation Tabs (App style) */}
          <nav className="hidden sm:flex items-center gap-1 ml-4 bg-gray-100/80 dark:bg-gray-900/80 p-1 rounded-xl border border-gray-200/50 dark:border-gray-800/60 text-xs font-semibold">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isHome
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span>🏠</span>
              <span>{t('nav.live')}</span>
            </Link>
            <Link
              href="/play"
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isPlay
                  ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-2xs font-bold'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span>🎮</span>
              <span>{t('nav.play')}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
            </Link>
          </nav>
        </div>

        {/* Right Tools: Live Indicator, Language Switcher & Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Live indicator badge */}
          {connectedCount > 0 && (
            <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span>
                {t('header.live_api')} {connectedCount}
                {lang === 'ko' ? '곳' : lang === 'ja' ? '箇所' : ' spots'}
              </span>
            </div>
          )}

          {/* Language Switcher */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-0.5 text-xs font-semibold">
            {(['ko', 'en', 'ja'] as const).map((code) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`px-2 py-1 rounded-lg transition-all ${
                  lang === code
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-2xs font-bold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
