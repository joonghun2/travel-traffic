import { Spot } from '@/types';

// URL slug from the English name, e.g. "Dongdaemun Design Plaza (DDP)" -> "dongdaemun-design-plaza-ddp".
// Kept dependency-free so client components can use it without bundling spot data.
export function getSpotSlug(spot: Pick<Spot, 'name'>): string {
  return spot.name.en
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
