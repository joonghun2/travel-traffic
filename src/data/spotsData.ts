import { SEOUL_SPOTS } from './spots/seoul';
import { Spot } from '@/types';

// Seoul-exclusive spots dataset (52 curated hotspots connected with Seoul Open Data API)
export const SPOTS_DATA: Spot[] = [...SEOUL_SPOTS];
