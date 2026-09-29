'use client';

import React, { useEffect, useRef } from 'react';

interface KakaoAdfitBannerProps {
  unit?: string;
  width?: string;
  height?: string;
  className?: string;
}

export default function KakaoAdfitBanner({
  unit = 'DAN-dtTgaQki8TeayQUI',
  width = '300',
  height = '250',
  className = '',
}: KakaoAdfitBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    try {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '//t1.kakaocdn.net/kas/static/ba.min.js';
      script.async = true;
      container.appendChild(script);

      return () => {
        if (container.contains(script)) {
          container.removeChild(script);
        }
      };
    } catch (e) {
      console.warn('Kakao AdFit script append warning:', e);
    }
  }, [unit]);

  return (
    <div
      ref={containerRef}
      className={`w-full flex items-center justify-center overflow-hidden min-h-[250px] ${className}`}
    >
      <ins
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit={unit}
        data-ad-width={width}
        data-ad-height={height}
      />
    </div>
  );
}
