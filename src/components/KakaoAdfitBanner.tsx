'use client';

import React, { useEffect, useRef, useState } from 'react';

interface KakaoAdfitBannerProps {
  unit?: string;
  width?: string;
  height?: string;
  className?: string;
}

// Global singleton Promise to guarantee ba.min.js is fetched at most once
let kakaoScriptPromise: Promise<void> | null = null;

function loadKakaoAdfitScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as any).__kakaoAdfitLoaded) return Promise.resolve();
  if (kakaoScriptPromise) return kakaoScriptPromise;

  kakaoScriptPromise = new Promise((resolve) => {
    const existing = document.querySelector('script[src*="ba.min.js"]');
    if (existing) {
      (window as any).__kakaoAdfitLoaded = true;
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//t1.kakaocdn.net/kas/static/ba.min.js';
    script.async = true;
    script.onload = () => {
      (window as any).__kakaoAdfitLoaded = true;
      resolve();
    };
    script.onerror = () => {
      resolve(); // Do not block UI on ad network failure
    };
    document.head.appendChild(script);
  });

  return kakaoScriptPromise;
}

export default function KakaoAdfitBanner({
  unit = 'DAN-dtTgaQki8TeayQUI',
  width = '300',
  height = '250',
  className = '',
}: KakaoAdfitBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // 1. Defer loading until banner approaches viewport
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // 2. Load singleton script when visible
  useEffect(() => {
    if (!isVisible) return;
    loadKakaoAdfitScript().catch((err) => {
      console.warn('Failed to load Kakao Adfit script:', err);
    });
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      className={`w-full flex items-center justify-center overflow-hidden min-h-[250px] ${className}`}
    >
      {isVisible && (
        <ins
          className="kakao_ad_area"
          style={{ display: 'none' }}
          data-ad-unit={unit}
          data-ad-width={width}
          data-ad-height={height}
        />
      )}
    </div>
  );
}
