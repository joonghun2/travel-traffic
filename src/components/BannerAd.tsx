import React from 'react';
import KakaoAdfitBanner from './KakaoAdfitBanner';

interface BannerAdProps {
  slotId?: string;
  format?: 'horizontal' | 'rectangle' | 'in-feed';
  className?: string;
}

/**
 * Kakao AdFit real banner ad unit.
 */
export default function BannerAd({
  className = '',
}: BannerAdProps) {
  return (
    <KakaoAdfitBanner
      unit="DAN-3AoY158moOHDzJXk"
      width="320"
      height="100"
      className={className}
    />
  );
}
