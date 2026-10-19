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

export async function loadCjkFonts(text: string, weight: 700 | 800 = 700) {
  const fonts = await Promise.all([
    loadFont('Noto+Sans+KR', weight, text).then((data) => data && { name: 'NotoKR', data, weight }),
    loadFont('Noto+Sans+JP', weight, text).then((data) => data && { name: 'NotoJP', data, weight }),
  ]);
  const loaded = fonts.filter((f): f is NonNullable<typeof f> => f !== null);
  return loaded.length ? loaded : undefined;
}

export const cjkFontFamily = (lang: string) => (lang === 'ja' ? 'NotoJP, NotoKR' : 'NotoKR, NotoJP');
