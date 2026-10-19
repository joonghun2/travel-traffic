'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n/context';

const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
const KAKAO_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    Kakao?: any;
    gtag?: (...args: any[]) => void;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

let kakaoLoading: Promise<boolean> | null = null;

function loadKakao(): Promise<boolean> {
  if (!KAKAO_JS_KEY) return Promise.resolve(false);
  if (window.Kakao?.isInitialized?.()) return Promise.resolve(true);
  if (!kakaoLoading) {
    kakaoLoading = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = KAKAO_SDK_URL;
      script.async = true;
      script.onload = () => {
        try {
          if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_JS_KEY);
          resolve(true);
        } catch {
          resolve(false);
        }
      };
      script.onerror = () => {
        kakaoLoading = null;
        resolve(false);
      };
      document.head.appendChild(script);
    });
  }
  return kakaoLoading;
}

interface ShareButtonProps {
  /** Language-less app path, e.g. "/spot/gyeongbokgung-palace-gwanghwamun". */
  path: string;
  title: string;
  text: string;
  /** Absolute image URL for the KakaoTalk card. */
  imageUrl: string;
  className?: string;
}

export default function ShareButton({ path, title, text, imageUrl, className = '' }: ShareButtonProps) {
  const { t, localePath } = useTranslation();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [kakaoReady, setKakaoReady] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  // Load the Kakao SDK when the sheet opens so the share call itself stays inside the click gesture.
  useEffect(() => {
    if (open) loadKakao().then(setKakaoReady);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const urlFor = (channel: string) => {
    const url = new URL(localePath(path), window.location.origin);
    url.searchParams.set('utm_source', channel);
    url.searchParams.set('utm_medium', 'share');
    return url.toString();
  };

  const track = (channel: string) => {
    window.gtag?.('event', 'share', { method: channel, item_id: path });
  };

  const openWindow = (channel: string, href: string) => {
    track(channel);
    window.open(href, '_blank', 'noopener,noreferrer,width=600,height=640');
    setOpen(false);
  };

  const shareKakao = () => {
    const url = urlFor('kakao');
    track('kakao');
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title,
        description: text,
        imageUrl,
        link: { mobileWebUrl: url, webUrl: url },
      },
      buttons: [{ title: t('share.kakaoButton'), link: { mobileWebUrl: url, webUrl: url } }],
    });
    setOpen(false);
  };

  const shareNative = async () => {
    track('native');
    try {
      await navigator.share({ title, text, url: urlFor('native') });
    } catch {}
    setOpen(false);
  };

  const copyLink = async () => {
    track('copy');
    const url = urlFor('copy');
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API can be blocked (permissions, in-app browsers); fall back to a hidden textarea.
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    setOpen(false);
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };

  const options = [
    ...(kakaoReady ? [{ key: 'kakao', label: t('share.kakao'), icon: '💬', cls: 'bg-[#FEE500] text-gray-900', onClick: shareKakao }] : []),
    {
      key: 'line',
      label: t('share.line'),
      icon: 'L',
      cls: 'bg-[#06C755] text-white',
      onClick: () => openWindow('line', `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(urlFor('line'))}`),
    },
    {
      key: 'x',
      label: t('share.x'),
      icon: '𝕏',
      cls: 'bg-black text-white',
      onClick: () =>
        openWindow('x', `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(urlFor('x'))}`),
    },
    {
      key: 'facebook',
      label: t('share.facebook'),
      icon: 'f',
      cls: 'bg-[#1877F2] text-white',
      onClick: () => openWindow('facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlFor('facebook'))}`),
    },
    { key: 'copy', label: t('share.copy'), icon: '🔗', cls: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100', onClick: copyLink },
    ...(canNativeShare
      ? [{ key: 'native', label: t('share.more'), icon: '⋯', cls: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100', onClick: shareNative }]
      : []),
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-bold text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition cursor-pointer ${className}`}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        {t('share.button')}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-sheet-title"
        >
          <div
            className="w-full max-w-md bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-gray-100 dark:border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4 sm:hidden" />
            <div className="flex items-center justify-between mb-4">
              <h2 id="share-sheet-title" className="text-base font-bold text-gray-900 dark:text-white">
                {t('share.title')}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center text-sm font-semibold"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {options.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  onClick={o.onClick}
                  className="flex flex-col items-center gap-1.5 py-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition cursor-pointer"
                >
                  <span className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black ${o.cls}`} aria-hidden="true">
                    {o.icon}
                  </span>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{o.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-semibold shadow-lg" role="status">
          {t('share.copied')}
        </div>
      )}
    </>
  );
}
