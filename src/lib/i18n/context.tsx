'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lang } from '@/types';
import { TRANSLATIONS } from './translations';

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'ko',
  setLang: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ko');

  useEffect(() => {
    // Detect stored language or browser language
    const saved = localStorage.getItem('cep_lang') as Lang | null;
    if (saved && (saved === 'ko' || saved === 'en' || saved === 'ja')) {
      setLangState(saved);
      return;
    }

    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('ja')) {
      setLangState('ja');
    } else if (browserLang.startsWith('ko')) {
      setLangState('ko');
    } else {
      setLangState('en');
    }
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('cep_lang', newLang);
    document.documentElement.lang = newLang;
  };

  const t = (key: string, fallback?: string): string => {
    const table = TRANSLATIONS[lang] || TRANSLATIONS.ko;
    return table[key] || fallback || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
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

