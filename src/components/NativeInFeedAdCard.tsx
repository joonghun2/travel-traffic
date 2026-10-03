'use client';

import React from 'react';
import KakaoAdfitBanner from './KakaoAdfitBanner';

interface NativeInFeedAdCardProps {
  className?: string;
}

/**
 * Kakao AdFit 300x250 In-Feed Ad Unit
 * - Unit: DAN-dtTgaQki8TeayQUI
 */
export default function NativeInFeedAdCard({
  className = '',
}: NativeInFeedAdCardProps) {
  return (
    <article
      className={`group relative w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg transition-all duration-300 flex flex-col justify-between shadow-xs ${className}`}
    >
      {/* Header: AD badge & title */}
      <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-gray-100 dark:border-gray-800/80">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[11px] font-extrabold tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
            AD
          </span>
          <h2 className="font-bold text-gray-900 dark:text-white text-base">
            스폰서 추천 안내
          </h2>
        </div>
        <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">
          Check East Point
        </span>
      </div>

      {/* 300x250 Kakao Ad Unit */}
      <div className="w-full flex-1 flex items-center justify-center my-auto py-2 overflow-hidden min-h-[250px]">
        <KakaoAdfitBanner
          unit="DAN-dtTgaQki8TeayQUI"
          width="300"
          height="250"
          className="my-0"
        />
      </div>

      {/* Footer */}
      <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>실시간 스폰서 가이드</span>
        <span className="text-blue-600 dark:text-blue-400 font-medium">공식 파트너</span>
      </div>
    </article>
  );
}
