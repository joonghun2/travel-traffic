'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/lib/theme/ThemeContext';
import { ThemeMode, AccentColor } from '@/types';
import { Sun, Moon, Laptop, Palette, Check } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { themeMode, resolvedTheme, accentColor, setThemeMode, setAccentColor } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const modes: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { id: 'system', label: '시스템 자동', icon: <Laptop className="h-3.5 w-3.5" /> },
    { id: 'light', label: '화이트 모드', icon: <Sun className="h-3.5 w-3.5" /> },
    { id: 'dark', label: '블랙(다크)', icon: <Moon className="h-3.5 w-3.5" /> },
  ];

  const accents: { id: AccentColor; label: string; colorClass: string; bg: string }[] = [
    { id: 'crimson', label: '크림슨 레드', colorClass: 'text-rose-500', bg: '#ff385c' },
    { id: 'ocean', label: '오션 블루', colorClass: 'text-sky-500', bg: '#0ea5e9' },
    { id: 'emerald', label: '에메랄드 그린', colorClass: 'text-emerald-500', bg: '#10b981' },
    { id: 'violet', label: '사이버 바이올렛', colorClass: 'text-purple-500', bg: '#8b5cf6' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-2 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        title="테마 및 모드 설정"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="h-4 w-4 text-amber-400" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500" />
        )}
        <span
          className="h-2.5 w-2.5 rounded-full ring-2 ring-slate-200 dark:ring-white/20"
          style={{
            backgroundColor:
              accents.find((a) => a.id === accentColor)?.bg || '#ff385c',
          }}
        />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/15 bg-white/95 dark:bg-slate-900/95 p-3 shadow-2xl backdrop-blur-xl z-50 animate-fade-in">
          {/* Theme Mode Header */}
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            화면 모드 (Dark / Light)
          </div>

          <div className="space-y-1">
            {modes.map((m) => {
              const isSelected = themeMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setThemeMode(m.id);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-brand-50 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-500/30'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {m.icon}
                    <span>{m.label}</span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />}
                </button>
              );
            })}
          </div>

          {/* Accent Color Palette */}
          <div className="mt-3 border-t border-slate-200 dark:border-white/10 pt-3">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Palette className="h-3 w-3" />
              <span>포인트 컬러</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {accents.map((acc) => {
                const isSelected = accentColor === acc.id;
                return (
                  <button
                    key={acc.id}
                    onClick={() => {
                      setAccentColor(acc.id);
                    }}
                    className={`relative flex h-8 w-full items-center justify-center rounded-xl transition-all hover:scale-110 ${
                      isSelected ? 'ring-2 ring-slate-900 dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : 'opacity-85'
                    }`}
                    style={{ backgroundColor: acc.bg }}
                    title={acc.label}
                  >
                    {isSelected && <Check className="h-4 w-4 text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;

