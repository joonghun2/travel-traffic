import { LocalizedString } from '@/types';

/**
 * Verified practical facts per spot (keyed by slug). Only filled-in facts are shown,
 * as FAQ entries and FAQPage JSON-LD. Leave a field out rather than guessing; the
 * checklist of spots still to fill is docs/review/phase6-spot-facts.csv.
 */
export interface SpotFacts {
  parking?: LocalizedString;
  closedDays?: LocalizedString;
  admission?: LocalizedString;
  accessibility?: LocalizedString;
  /** Where the facts were checked (official site URL) and when (YYYY-MM-DD). */
  source?: string;
  checkedAt?: string;
}

export const SPOT_FACTS: Record<string, SpotFacts> = {};
