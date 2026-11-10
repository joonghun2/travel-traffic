'use client';

import React from 'react';
import AdSlot from './AdSlot';

interface BannerAdProps {
  className?: string;
}

/**
 * 320x100 banner: Kakao AdFit on Korean pages, Travelpayouts links on other languages (see AdSlot).
 * - Unit: DAN-3AoY158moOHDzJXk
 */
export default function BannerAd({ className = '' }: BannerAdProps) {
  return (
    <div className={`w-full flex justify-center items-center py-2 ${className}`}>
      <AdSlot unit="DAN-3AoY158moOHDzJXk" width="320" height="100" query="Seoul" subId="list-banner" />
    </div>
  );
}
