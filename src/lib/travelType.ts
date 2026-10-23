// Travel stats test: scoring and result logic. Client-safe (no spot data, no server imports).
// Content lives in src/data/travel-type/*.json; balance is checked by scripts/travel-type-sim.mjs.
import { Lang } from '@/types';
import QUESTIONS_JSON from '@/data/travel-type/questions.json';
import TYPES_JSON from '@/data/travel-type/types.json';
import UI_JSON from '@/data/travel-type/ui.json';

export type Loc = Partial<Record<Lang, string>> & { ko: string };
type LocList = Partial<Record<Lang, string[]>> & { ko: string[] };

export const STATS = ['SOC', 'EXP', 'SEN', 'ACT', 'PLN', 'CRW'] as const;
export type StatId = (typeof STATS)[number];
export type Stats = Record<StatId, number>;

export interface Question {
  id: string;
  q: Loc;
  options: { t: Loc; w: Partial<Record<StatId, number>> }[];
}

/** SOC/EXP/ACT pattern: S=social s=solo, E=explore e=classic, A=active a=calm. */
export type TypeKey = 'sEa' | 'sEA' | 'sea' | 'seA' | 'SEa' | 'SEA' | 'Sea' | 'SeA';

export interface TravelType {
  slug: string;
  name: Loc;
  tagline: Loc;
  desc: Loc;
  strengths: LocList;
  pitfalls: LocList;
  direction: Loc;
  plannerTip: Loc;
  spontaneousTip: Loc;
  buddy: TypeKey;
  clash: TypeKey;
}

export const QUESTIONS = QUESTIONS_JSON.questions as Question[];
export const TYPES = TYPES_JSON.types as Record<TypeKey, TravelType>;
export const TYPE_KEYS = Object.keys(TYPES) as TypeKey[];
export const TEST_PATH = '/play/travel-type';
export const resultPath = (key: TypeKey) => `${TEST_PATH}/result/${TYPES[key].slug}`;
export const typeBySlug = (slug: string) => TYPE_KEYS.find((k) => TYPES[k].slug === slug);

/** Share of each type under random answering (scripts/travel-type-sim.mjs); shown as "estimated". */
export const RARITY: Record<TypeKey, number> = { sEa: 14, sEA: 13, sea: 12, seA: 13, SEa: 9, SEA: 14, Sea: 10, SeA: 17 };

/** Card and chart colours per type (pastel background, strong accent). */
export const THEME: Record<TypeKey, { bg: string; accent: string; soft: string }> = {
  sEa: { bg: '#EEEDFE', accent: '#534AB7', soft: '#CECBF6' },
  sEA: { bg: '#E1F5EE', accent: '#0F6E56', soft: '#9FE1CB' },
  sea: { bg: '#E6F1FB', accent: '#185FA5', soft: '#B5D4F4' },
  seA: { bg: '#FAEEDA', accent: '#854F0B', soft: '#FAC775' },
  SEa: { bg: '#FAECE7', accent: '#993C1D', soft: '#F5C4B3' },
  SEA: { bg: '#FBEAF0', accent: '#993556', soft: '#F4C0D1' },
  Sea: { bg: '#EAF3DE', accent: '#3B6D11', soft: '#C0DD97' },
  SeA: { bg: '#FCEBEB', accent: '#A32D2D', soft: '#F7C1C1' },
};

export function loc(text: Loc, lang: Lang): string;
export function loc(text: LocList, lang: Lang): string[];
export function loc(text: Loc | LocList, lang: Lang) {
  return text[lang] ?? text.en ?? text.ko;
}

const UI = UI_JSON.ui as Record<string, Loc>;
export function tt(key: string, lang: Lang, vars: Record<string, string | number> = {}): string {
  const s = UI[key] ? loc(UI[key], lang) : key;
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

// Per stat: reachable min/max and the mean under uniform random answers. The mean maps to 50,
// so a neutral answer pattern sits in the middle and each axis splits about evenly.
const RANGE = Object.fromEntries(
  STATS.map((s) => {
    let lo = 0;
    let hi = 0;
    let mu = 0;
    for (const q of QUESTIONS) {
      const ws = q.options.map((o) => o.w[s] ?? 0);
      lo += Math.min(...ws);
      hi += Math.max(...ws);
      mu += ws.reduce((a, b) => a + b, 0) / ws.length;
    }
    return [s, { lo, hi, mu }];
  })
) as Record<StatId, { lo: number; hi: number; mu: number }>;

export function scoreAnswers(answers: number[]): Stats {
  const raw = Object.fromEntries(STATS.map((s) => [s, 0])) as Stats;
  answers.forEach((a, i) => {
    const w = QUESTIONS[i]?.options[a]?.w ?? {};
    for (const s of STATS) raw[s] += w[s] ?? 0;
  });
  return Object.fromEntries(
    STATS.map((s) => {
      const { lo, hi, mu } = RANGE[s];
      const v = raw[s] >= mu ? 50 + (50 * (raw[s] - mu)) / (hi - mu) : 50 - (50 * (mu - raw[s])) / (mu - lo);
      return [s, Math.max(0, Math.min(100, Math.round(v)))];
    })
  ) as Stats;
}

export const typeOf = (st: Stats): TypeKey =>
  `${st.SOC >= 50 ? 'S' : 's'}${st.EXP >= 50 ? 'E' : 'e'}${st.ACT >= 50 ? 'A' : 'a'}` as TypeKey;

export const isPlanner = (st: Stats) => st.PLN >= 50;

export const grade = (v: number) => (v >= 85 ? 'S' : v >= 70 ? 'A' : v >= 45 ? 'B' : 'C');

/** The type you'd be if the closest of the three core axes (within 8 points of 50) flipped. */
export function nearType(st: Stats): TypeKey | null {
  const axes = [
    { s: 'SOC' as const, i: 0 },
    { s: 'EXP' as const, i: 1 },
    { s: 'ACT' as const, i: 2 },
  ]
    .map((a) => ({ ...a, d: Math.abs(st[a.s] - 50) }))
    .filter((a) => a.d <= 8)
    .sort((a, b) => a.d - b.d);
  if (!axes.length) return null;
  const key = typeOf(st).split('');
  const c = key[axes[0].i];
  key[axes[0].i] = c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase();
  return key.join('') as TypeKey;
}

/** The two answers that pushed hardest toward this type's three core axes. */
export function decisiveAnswers(answers: number[], key: TypeKey): { qi: number; oi: number }[] {
  const dir = { SOC: key[0] === 'S' ? 1 : -1, EXP: key[1] === 'E' ? 1 : -1, ACT: key[2] === 'A' ? 1 : -1 };
  return answers
    .map((oi, qi) => {
      const w = QUESTIONS[qi]?.options[oi]?.w ?? {};
      const push = (w.SOC ?? 0) * dir.SOC + (w.EXP ?? 0) * dir.EXP + (w.ACT ?? 0) * dir.ACT;
      return { qi, oi, push };
    })
    .sort((a, b) => b.push - a.push)
    .slice(0, 2)
    .filter((a) => a.push > 0)
    .map(({ qi, oi }) => ({ qi, oi }));
}

/** 0-100 travel match: closeness across all six stats. */
export function matchScore(a: Stats, b: Stats): number {
  const diff = STATS.reduce((sum, s) => sum + Math.abs(a[s] - b[s]), 0) / STATS.length;
  return Math.max(0, Math.min(100, Math.round(100 - diff * 1.3)));
}

/** Answers as a short URL-safe string, e.g. "012301230123012". */
export const encodeAnswers = (answers: number[]) => answers.join('');
export function decodeAnswers(s: string | null | undefined): number[] | null {
  if (!s || s.length !== QUESTIONS.length || !/^[0-3]+$/.test(s)) return null;
  const a = s.split('').map(Number);
  return a.every((v, i) => v < QUESTIONS[i].options.length) ? a : null;
}

/**
 * Typical stats for a type (its OG image, and the chart when no answers are shared): the answers
 * that best fit the three core axes, with calm types also leaning toward sensibility.
 */
export function personaStats(key: TypeKey): Stats {
  const want = { SOC: key[0] === 'S' ? 1 : -1, EXP: key[1] === 'E' ? 1 : -1, ACT: key[2] === 'A' ? 1 : -1, SEN: key[2] === 'a' ? 0.6 : 0.2 };
  const answers = QUESTIONS.map(
    (q) =>
      q.options
        .map(
          (o, i) =>
            [i, want.SOC * (o.w.SOC ?? 0) + want.EXP * (o.w.EXP ?? 0) + want.ACT * (o.w.ACT ?? 0) + want.SEN * (o.w.SEN ?? 0)] as const
        )
        .sort((x, y) => y[1] - x[1])[0][0]
  );
  return scoreAnswers(answers);
}
