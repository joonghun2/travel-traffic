import { SEOUL_SPOTS } from './spots/seoul';
import { SEOUL_OFFICIAL_SPOTS } from './spots/seoulOfficial';
import { Spot } from '@/types';

// Seoul spots: the original curated 52 plus every other place in the official
// Seoul real-time population data list (121 places), so all 121 are covered.
export const SPOTS_DATA: Spot[] = [...SEOUL_SPOTS, ...SEOUL_OFFICIAL_SPOTS];
