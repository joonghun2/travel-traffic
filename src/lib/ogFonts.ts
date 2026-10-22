// Satori (next/og) has no CJK glyphs, so fetch Google Fonts subsets that
// contain only the characters an image draws.
async function loadFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`)
    ).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    return await (await fetch(src)).arrayBuffer();
  } catch {
    return null;
  }
}

const FONT_FILES: Record<string, [string, string]> = {
  KR: ['Noto+Sans+KR', 'NotoKR'],
  JP: ['Noto+Sans+JP', 'NotoJP'],
  SC: ['Noto+Sans+SC', 'NotoSC'],
  TC: ['Noto+Sans+TC', 'NotoTC'],
};
// Two subsets per language: its own script plus Korean for Korean place names.
const FONTS_FOR: Record<string, string[]> = { ko: ['KR', 'JP'], en: ['KR', 'JP'], ja: ['JP', 'KR'], 'zh-cn': ['SC', 'KR'], 'zh-tw': ['TC', 'KR'] };

export async function loadCjkFonts(text: string, weight: 700 | 800 = 700, lang = 'ko') {
  const fonts = await Promise.all(
    (FONTS_FOR[lang] ?? FONTS_FOR.ko).map((id) => {
      const [family, name] = FONT_FILES[id];
      return loadFont(family, weight, text).then((data) => data && { name, data, weight });
    })
  );
  const loaded = fonts.filter((f): f is NonNullable<typeof f> => f !== null);
  return loaded.length ? loaded : undefined;
}

export const cjkFontFamily = (lang: string) =>
  lang === 'ja'
    ? 'NotoJP, NotoKR, NotoSC'
    : lang === 'zh-cn'
    ? 'NotoSC, NotoTC, NotoKR'
    : lang === 'zh-tw'
    ? 'NotoTC, NotoSC, NotoKR'
    : 'NotoKR, NotoJP, NotoSC';
