import { Lang, LocalizedString } from '@/types';

export const LANGS: Lang[] = ['ko', 'en', 'ja', 'zh-cn', 'zh-tw'];
export const DEFAULT_LANG: Lang = 'ko';
export const SITE_URL = 'https://www.checkeastpoint.com';

export function isLang(value: string | null | undefined): value is Lang {
  return LANGS.includes(value as Lang);
}

export const isChinese = (lang: Lang) => lang === 'zh-cn' || lang === 'zh-tw';

/** BCP 47 tag for <html lang> and hreflang. */
export function htmlLang(lang: Lang): string {
  return lang === 'zh-cn' ? 'zh-Hans' : lang === 'zh-tw' ? 'zh-Hant' : lang;
}

/** Localized text with fallbacks: Chinese -> English -> Korean. */
export function pick(text: LocalizedString | undefined, lang: Lang): string {
  if (!text) return '';
  return text[lang] || (isChinese(lang) ? text.en : '') || text.ko;
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
  const match = pathname.match(/^\/(ko|en|ja|zh-cn|zh-tw)(?=\/|$)/);
  const rest = match ? pathname.slice(match[0].length) : pathname;
  return rest || '/';
}

// hreflang for all five languages; x-default points to English (international visitors).
export function languageAlternates(path: string): Record<string, string> {
  return {
    ...Object.fromEntries(LANGS.map((l) => [htmlLang(l), `${SITE_URL}${localizePath(path, l)}`])),
    'x-default': `${SITE_URL}${localizePath(path, 'en')}`,
  };
}
