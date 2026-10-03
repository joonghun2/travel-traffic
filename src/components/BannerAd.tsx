'use client';

import React from 'react';
import KakaoAdfitBanner from './KakaoAdfitBanner';

interface BannerAdProps {
  className?: string;
}

/**
 * Kakao AdFit 320x100 Horizontal Banner Unit
 * - Unit: DAN-3AoY158moOHDzJXk
 */
export default function BannerAd({ className = '' }: BannerAdProps) {
  return (
    <div className={`w-full flex justify-center items-center py-2 ${className}`}>
      <KakaoAdfitBanner
        unit="DAN-3AoY158moOHDzJXk"
        width="320"
        height="100"
      />
    </div>
  );
}
