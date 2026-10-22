'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { localizePath, stripLang } from '@/lib/i18n/routing';
import ThemeToggle from './ThemeToggle';

interface DashboardHeaderProps {
  connectedCount?: number;
  /** Shown between the brand and the tools on wide screens (e.g. the map search). */
  center?: React.ReactNode;
  /** Full-width bar instead of the centred max-w-7xl container. */
  wide?: boolean;
  /** Show the LIVE badge (Seoul only; Jeju/Busan are forecasts). */
  live?: boolean;
}

const LANG_LABEL = { ko: '한국어', en: 'English', ja: '日本語' } as const;

function LanguageMenu({ path }: { path: string }) {
  const { lang, setLang, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('lang.menu')}
        className="h-9 px-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1 cursor-pointer"
      >
        <span aria-hidden="true">🌐</span>
        {lang.toUpperCase()}
        <span aria-hidden="true" className="text-[9px]">▾</span>
      </button>
      {/* Links stay in the DOM (hidden when closed) so crawlers can follow every language. */}
      <div
        role="menu"
        className={`${open ? '' : 'hidden'} absolute right-0 mt-1 w-36 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl py-1 z-50`}
      >
        {(['ko', 'en', 'ja'] as const).map((code) => (
          <Link
            key={code}
            role="menuitem"
            href={localizePath(path, code)}
            hrefLang={code}
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
              setLang(code);
            }}
            className={`block px-3 py-2 text-sm ${
              lang === code ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
            } hover:bg-gray-50 dark:hover:bg-gray-800`}
          >
            {LANG_LABEL[code]}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function DashboardHeader({
  connectedCount = 0,
  center,
  wide = false,
  live = true,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const { lang, t, localePath } = useTranslation();

  const path = stripLang(pathname);
  const isHome = path === '/';
  const isPlay = path.startsWith('/play');

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border-b border-gray-100 dark:border-gray-800 transition-colors">
      <div className={`${wide ? '' : 'max-w-7xl mx-auto '}px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3`}>
        {/* Logo & Brand */}
        <div className="flex items-center gap-2">
          <Link href={localePath('/')} className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm sm:text-base shadow-md shadow-blue-500/20">
              C
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-gray-900 dark:text-white tracking-tight text-base sm:text-lg">
                Check East Point
              </span>
{live && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold">
                <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                  <span className="animate-radar absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span>LIVE</span>
              </div>
              )}
            </div>
          </Link>

          {/* Navigation Tabs (App style) */}
          <nav className="hidden sm:flex items-center gap-1 ml-4 bg-gray-100/80 dark:bg-gray-900/80 p-1 rounded-xl border border-gray-200/50 dark:border-gray-800/60 text-xs font-semibold">
            <Link
              href={localePath('/')}
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
              href={localePath('/play')}
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

        {center && <div className="hidden lg:block flex-1 max-w-xl mx-4">{center}</div>}

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

          {/* Language menu */}
          <LanguageMenu path={path} />

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
