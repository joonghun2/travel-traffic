import { Lang } from '@/types';

export const LANGS: Lang[] = ['ko', 'en', 'ja'];
export const DEFAULT_LANG: Lang = 'ko';
export const SITE_URL = 'https://www.checkeastpoint.com';

export function isLang(value: string | null | undefined): value is Lang {
  return value === 'ko' || value === 'en' || value === 'ja';
}

// Korean is served from the unprefixed URL ("/", "/play");
// other languages live under "/en", "/ja".
export function localizePath(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === DEFAULT_LANG) return clean;
  return clean === '/' ? `/${lang}` : `/${lang}${clean}`;
}

// Accepts both the browser URL ("/en/play") and the rewritten
// internal path ("/ko/play"), returning the language-less path ("/play").
export function stripLang(pathname: string): string {
  const match = pathname.match(/^\/(ko|en|ja)(?=\/|$)/);
  const rest = match ? pathname.slice(match[0].length) : pathname;
  return rest || '/';
}

export function languageAlternates(path: string): Record<string, string> {
  return {
    ko: `${SITE_URL}${localizePath(path, 'ko')}`,
    en: `${SITE_URL}${localizePath(path, 'en')}`,
    ja: `${SITE_URL}${localizePath(path, 'ja')}`,
    'x-default': `${SITE_URL}${localizePath(path, DEFAULT_LANG)}`,
  };
}
