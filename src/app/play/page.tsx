'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardHeader from '@/components/DashboardHeader';
import BottomNav from '@/components/BottomNav';
import { useTranslation } from '@/lib/i18n/context';

export default function PlayPage() {
  const { lang, t } = useTranslation();

  // Active test runner in full-screen iframe modal
  const [activeTestKey, setActiveTestKey] = useState<'event1' | 'event2' | null>(null);

  const handleOpenTest = (key: 'event1' | 'event2') => {
    setActiveTestKey(key);
  };

  const handleCloseTest = () => {
    setActiveTestKey(null);
  };

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data === 'CLOSE_TEST') {
        handleCloseTest();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const activeIframeUrl = activeTestKey ? `/${activeTestKey}/index.html?lang=${lang}` : null;
  const activeTestTitle =
    activeTestKey === 'event1'
      ? t('play.card2.title')
      : activeTestKey === 'event2'
      ? t('play.card3.title')
      : '';

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white flex flex-col selection:bg-purple-500 selection:text-white pb-24">
      {/* Header */}
      <DashboardHeader />

      {/* Main Play Hub Container */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        {/* Title & Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold mb-3">
            <span>🎮</span>
            <span>{t('play.badge')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {t('play.title')}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-400">
            {t('play.subtitle')}
          </p>
        </div>

        {/* Figma App-Style Menu Cards (Exact match with user design) */}
        <div className="space-y-3.5">
          {/* Card 1: 실시간 여행지 혼잡도 확인 */}
          <Link
            href="/"
            className="group w-full p-4 sm:p-5 rounded-2xl bg-[#16171d] hover:bg-[#1d1f27] border border-gray-800/80 hover:border-gray-700/80 transition-all duration-200 flex items-center justify-between gap-4 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              {/* Pink/Red Squircle Icon */}
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#ff2a6d] via-[#ff477e] to-[#ff70a6] flex items-center justify-center text-2xl sm:text-3xl shadow-md shadow-rose-500/20 flex-shrink-0">
                🗺️
              </div>
              <div className="text-left">
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-rose-400 transition-colors">
                  {t('play.card1.title')}
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5 font-medium">
                  {t('play.card1.sub')}
                </p>
              </div>
            </div>
            {/* Arrow Icon */}
            <div className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </Link>

          {/* Card 2: 여행 생존 유형 테스트 */}
          <button
            onClick={() => handleOpenTest('event1')}
            className="group w-full p-4 sm:p-5 rounded-2xl bg-[#16171d] hover:bg-[#1d1f27] border border-gray-800/80 hover:border-purple-800/50 transition-all duration-200 flex items-center justify-between gap-4 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99] text-left"
          >
            <div className="flex items-center gap-4">
              {/* Violet/Purple Squircle Icon */}
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#6b21a8] via-[#8b5cf6] to-[#a855f7] flex items-center justify-center text-2xl sm:text-3xl shadow-md shadow-purple-500/20 flex-shrink-0">
                ✈️
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                    {t('play.card2.title')}
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {t('play.card2.badge')}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5 font-medium">
                  {t('play.card2.sub')}
                </p>
              </div>
            </div>
            {/* Arrow Icon */}
            <div className="text-gray-500 group-hover:text-purple-300 group-hover:translate-x-1 transition-all flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </button>

          {/* Card 3: 로컬 찐바이브 생존 테스트 */}
          <button
            onClick={() => handleOpenTest('event2')}
            className="group w-full p-4 sm:p-5 rounded-2xl bg-[#16171d] hover:bg-[#1d1f27] border border-gray-800/80 hover:border-cyan-800/50 transition-all duration-200 flex items-center justify-between gap-4 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99] text-left"
          >
            <div className="flex items-center gap-4">
              {/* Cyan/Teal Squircle Icon */}
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#0891b2] via-[#06b6d4] to-[#22d3ee] flex items-center justify-center text-2xl sm:text-3xl shadow-md shadow-cyan-500/20 flex-shrink-0">
                🌃
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {t('play.card3.title')}
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {t('play.card3.badge')}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5 font-medium">
                  {t('play.card3.sub')}
                </p>
              </div>
            </div>
            {/* Arrow Icon */}
            <div className="text-gray-500 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </button>
        </div>

        {/* Tip banner for dwell time */}
        <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-purple-950/30 via-indigo-950/20 to-blue-950/30 border border-purple-900/30 text-center">
          <p className="text-xs text-gray-300 leading-relaxed">
            {t('play.tip_prefix')}
            <strong className="text-purple-400">{t('play.tip_highlight')}</strong>
            {t('play.tip_suffix')}
          </p>
        </div>
      </main>

      {/* Full-screen App-like In-App Test Modal */}
      {activeIframeUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
          {/* In-app Top Bar */}
          <div className="h-14 bg-[#16171d] border-b border-gray-800 px-4 flex items-center justify-between text-white">
            <button
              onClick={handleCloseTest}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            >
              <span>←</span>
              <span>{t('play.back')}</span>
            </button>
            <span className="font-bold text-sm tracking-tight truncate max-w-[200px]">
              {activeTestTitle}
            </span>
            <a
              href={activeIframeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
              title={t('play.new_tab_title')}
            >
              <span>{t('play.new_tab')}</span>
              <span>↗</span>
            </a>
          </div>

          {/* Test Iframe Content */}
          <div className="flex-1 w-full h-full relative overflow-hidden bg-black">
            <iframe
              src={activeIframeUrl}
              title={activeTestTitle}
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
