'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { stripLang } from '@/lib/i18n/routing';

interface BottomNavProps {
  /** On the map page "내 주변" locates the user in place; elsewhere it links to /?near=1. */
  onNearbyClick?: () => void;
  isNearbyActive?: boolean;
}

const ICONS = {
  map: (
    <>
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </>
  ),
  list: (
    <>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="3.5" cy="6" r="1" />
      <circle cx="3.5" cy="12" r="1" />
      <circle cx="3.5" cy="18" r="1" />
    </>
  ),
  nearby: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </>
  ),
  play: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="3" />
      <path d="M6 12h4m-2-2v4" />
      <circle cx="17" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="13" r="1" fill="currentColor" />
    </>
  ),
};

export default function BottomNav({ onNearbyClick, isNearbyActive = false }: BottomNavProps) {
  const pathname = usePathname();
  const { t, localePath } = useTranslation();
  const path = stripLang(pathname);

  const tabs = [
    { key: 'map', label: t('nav.map'), href: localePath('/'), active: path === '/' && !isNearbyActive },
    { key: 'list', label: t('nav.list'), href: localePath('/list'), active: path.startsWith('/list') },
    { key: 'nearby', label: t('nav.nearby'), href: `${localePath('/')}?near=1`, active: isNearbyActive, onClick: onNearbyClick },
    { key: 'play', label: t('nav.play'), href: localePath('/play'), active: path.startsWith('/play') },
  ] as const;

  const itemClass = (active: boolean) =>
    `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-150 active:scale-90 ${
      active
        ? 'text-blue-600 dark:text-blue-400 font-bold'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-gray-800/80 px-2 py-1.5 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const icon = (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={tab.active ? '2.5' : '2'} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {ICONS[tab.key]}
            </svg>
          );
          const body = (
            <>
              {icon}
              <span className="text-[11px] tracking-tight">{tab.label}</span>
            </>
          );
          return 'onClick' in tab && tab.onClick ? (
            <button key={tab.key} type="button" onClick={tab.onClick} aria-pressed={tab.active} className={`${itemClass(tab.active)} cursor-pointer`}>
              {body}
            </button>
          ) : (
            <Link key={tab.key} href={tab.href} aria-current={tab.active ? 'page' : undefined} className={itemClass(tab.active)}>
              {body}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
