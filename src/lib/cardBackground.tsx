import BACKGROUNDS from '@/data/snsBackgrounds.json';

// Photo backgrounds for share/SNS cards, keyed by spot slug or city id.
// Filled by scripts/sync-sns-backgrounds.mjs from the operator's photo folder.
const MAP = BACKGROUNDS as Record<string, string[]>;

/** Absolute URL of the first available background for the keys (spot first, then city), or null. */
export function backgroundFor(requestUrl: string, ...keys: (string | undefined)[]): string | null {
  // Rotate through a spot's photos week by week.
  const week = Math.floor(Date.now() / (7 * 86400000));
  for (const key of keys) {
    const list = key ? MAP[key] : undefined;
    if (list?.length) return new URL(list[week % list.length], requestUrl).toString();
  }
  return null;
}

/**
 * Full-bleed photo with a dark wash so white text stays readable. Place first inside the card root
 * (position: relative). Sizes are in pixels: Satori resolves % against the padded content box.
 */
export function CardBackground({ src, width, height }: { src: string | null; width: number; height: number }) {
  if (!src) return null;
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width, height, display: 'flex' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={width} height={height} style={{ width, height, objectFit: 'cover' }} />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height,
          background: 'linear-gradient(180deg, rgba(15,23,42,0.66) 0%, rgba(15,23,42,0.52) 40%, rgba(15,23,42,0.88) 100%)',
        }}
      />
    </div>
  );
}
