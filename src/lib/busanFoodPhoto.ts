import { SITE_URL } from '@/lib/i18n/routing';
import { busanFoodImage } from '@/data/busanFood';

/**
 * A Busan food photo as a data URL for next/og, or null if it can't be fetched (the card then
 * renders without it instead of failing). Fetched from the public site URL, not request.url,
 * which on Vercel can be an internal address for cached route handlers.
 */
export async function busanFoodPhotoData(id: string): Promise<string | null> {
  try {
    const res = await fetch(`${SITE_URL}${busanFoodImage(id)}`);
    if (!res.ok) return null;
    return `data:image/jpeg;base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`;
  } catch {
    return null;
  }
}
