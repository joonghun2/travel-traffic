'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Lang } from '@/types';
import { TRANSLATIONS } from './translations';
import { DEFAULT_LANG, isChinese, isLang, localizePath, stripLang } from './routing';

const LANG_STORAGE_KEY = 'cep_lang';
const BOT_UA = /bot|crawl|spider|slurp|lighthouse|headless|preview/i;

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, fallback?: string) => string;
  /** Prefixes an app path ("/play") with the current language ("/en/play"). */
  localePath: (path: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (key) => key,
  localePath: (path) => path,
});

// The language comes from the URL (/, /en, /ja) so every language is
// server-rendered and indexable on its own address.
export function I18nProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Visitors landing on the unprefixed Korean URL are sent to their saved or
  // browser language. Crawlers are left alone so they index each URL as-is.
  useEffect(() => {
    if (lang !== DEFAULT_LANG || /^\/ko(\/|$)/.test(window.location.pathname)) return;
    if (BOT_UA.test(navigator.userAgent)) return;

    let preferred: Lang | null = null;
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (isLang(saved)) preferred = saved;
    } catch {}
    if (!preferred) {
      const browserLang = navigator.language.toLowerCase();
      preferred = browserLang.startsWith('ko')
        ? 'ko'
        : browserLang.startsWith('ja')
        ? 'ja'
        : /^zh-(tw|hk|mo|hant)/.test(browserLang)
        ? 'zh-tw'
        : browserLang.startsWith('zh')
        ? 'zh-cn'
        : 'en';
    }

    if (preferred !== DEFAULT_LANG) {
      const target = localizePath(stripLang(window.location.pathname), preferred);
      router.replace(target + window.location.search + window.location.hash);
    }
    // Only on first load of a page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = (newLang: Lang) => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
    } catch {}
    if (newLang === lang) return;
    router.push(localizePath(stripLang(pathname), newLang) + window.location.search);
  };

  // Own language -> English (for Chinese) -> caller fallback -> Korean -> key.
  const t = (key: string, fallback?: string): string =>
    TRANSLATIONS[lang]?.[key] || (isChinese(lang) ? TRANSLATIONS.en[key] : '') || fallback || TRANSLATIONS.ko[key] || key;

  const localePath = (path: string) => localizePath(path, lang);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, localePath }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

// Aliases for unified API
export const useTranslation = useI18n;
export const TranslationProvider = I18nProvider;
