'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { BF_MIN_VOTES, BF_TEXT, BUSAN_FOODS, BUSAN_FOODS_BY_ID, BusanFood, busanFoodImage } from '@/data/busanFood';
import { BUSAN_FOOD_STORIES } from '@/data/busanFoodStories';
import { useTranslation } from '@/lib/i18n/context';
import { SITE_URL, pick as pickText } from '@/lib/i18n/routing';
import type { BusanFoodStats } from '@/app/api/busan-food/route';
import ShareButton from './ShareButton';

const KakaoAdfitBanner = dynamic(() => import('./KakaoAdfitBanner'), { ssr: false });

const AD_UNIT = 'DAN-1KAy0L6HlzeWlDlY';
const PATH = '/play/busan-food-olympics';

interface Bracket {
  round: BusanFood[];
  winners: BusanFood[];
  match: number;
  /** Every match so far as [winner, loser] ids, sent with the vote. */
  matches: [string, string][];
  semifinalists: BusanFood[];
  runnerUp?: BusanFood;
  champion?: BusanFood;
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function advance(state: Bracket, pickIndex: 0 | 1): Bracket {
  const chosen = state.round[state.match * 2 + pickIndex];
  const loser = state.round[state.match * 2 + (1 - pickIndex)];
  const next: Bracket = {
    ...state,
    winners: [...state.winners, chosen],
    match: state.match + 1,
    matches: [...state.matches, [chosen.id, loser.id]],
    semifinalists: state.round.length === 4 ? [...state.semifinalists, loser] : state.semifinalists,
  };
  if (state.round.length === 2) return { ...next, runnerUp: loser, champion: chosen };
  if (next.match * 2 >= state.round.length) return { ...next, round: next.winners, winners: [], match: 0 };
  return next;
}

function FoodPhoto({ food, sizes, className = '' }: { food: BusanFood; sizes: string; className?: string }) {
  return <Image src={busanFoodImage(food.id)} alt="" fill sizes={sizes} className={`object-cover ${className}`} />;
}

/** A food's history, open for the champion and tap-to-open for the rest of the top 4. */
function FoodTmi({ food, open = false }: { food: BusanFood; open?: boolean }) {
  const { lang } = useTranslation();
  const text = BF_TEXT[lang];
  const story = BUSAN_FOOD_STORIES[food.id];
  if (!story) return null;
  if (open) return <p className="text-sm leading-relaxed text-slate-700">{pickText(story.story, lang)}</p>;
  return (
    <details className="group mt-1">
      <summary className="list-none cursor-pointer text-[11px] font-bold text-sky-600 select-none">
        📜 {text.tmiMore} <span className="inline-block transition group-open:rotate-180">▾</span>
      </summary>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{pickText(story.story, lang)}</p>
    </details>
  );
}

export default function BusanFoodOlympics() {
  const { lang, localePath } = useTranslation();
  const text = BF_TEXT[lang];
  const [history, setHistory] = useState<Bracket[]>([]);
  const [picked, setPicked] = useState<0 | 1 | null>(null);
  const [friendPick, setFriendPick] = useState<BusanFood | null>(null);
  const [stats, setStats] = useState<BusanFoodStats | null>(null);
  const savedFor = useRef<Bracket | null>(null);

  const fill = (key: keyof typeof text, vars: Record<string, string | number>) =>
    Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, String(v)), text[key]);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('w') ?? '';
    setFriendPick(BUSAN_FOODS_BY_ID.get(id) ?? null);
  }, []);

  const state = history[history.length - 1];
  const phase = !state ? 'intro' : state.champion ? 'result' : 'play';

  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (phase !== 'result' || !state?.champion || !state.runnerUp) return;
    window.gtag?.('event', 'busan_food_complete', { winner: state.champion.id });

    // Save this bracket once (undo + finish again must not count twice), then load everyone's totals.
    const vote =
      savedFor.current === null
        ? fetch('/api/busan-food', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lang,
              champion: state.champion.id,
              runnerUp: state.runnerUp.id,
              semifinalists: state.semifinalists.map((f) => f.id),
              matches: state.matches,
            }),
          }).catch(() => null)
        : Promise.resolve(null);
    savedFor.current = state;
    vote
      .then(() => fetch('/api/busan-food', { cache: 'no-store' }))
      .then((r) => (r.ok ? r.json() : null))
      .then((s: BusanFoodStats | null) => setStats(s))
      .catch(() => setStats(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const start = () => {
    savedFor.current = null;
    setStats(null);
    setHistory([{ round: shuffle(BUSAN_FOODS), winners: [], match: 0, matches: [], semifinalists: [] }]);
    window.gtag?.('event', 'busan_food_start');
  };

  const pick = (index: 0 | 1) => {
    if (!state || picked !== null) return;
    setPicked(index);
    setTimeout(() => {
      setHistory((h) => [...h, advance(h[h.length - 1], index)]);
      setPicked(null);
    }, 280);
  };

  const undo = () => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
  const reset = () => setHistory([]);

  const roundLabel = (n: number) => (n === 2 ? text.final : n === 4 ? text.semifinal : fill('roundOf', { n }));
  const roundCheer = (n: number) => (n === 2 ? text.cheerFinal : n === 4 ? text.cheerSemi : n === 8 ? text.cheer8 : text.cheer16);

  // ---------- Intro ----------
  if (phase === 'intro') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="grid grid-cols-4 gap-2 mb-6" aria-hidden="true">
            {BUSAN_FOODS.slice(0, 8).map((food, i) => (
              <div
                key={food.id}
                className={`relative aspect-square rounded-2xl overflow-hidden border-[3px] border-white shadow-md ${i % 2 ? 'rotate-3' : '-rotate-3'}`}
              >
                <FoodPhoto food={food} sizes="25vw" />
              </div>
            ))}
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-900 text-xs font-black mb-3 shadow-sm">
            🥇 {fill('roundOf', { n: 16 })} · 🌊 BUSAN
          </div>
          <h1 className="text-4xl font-black tracking-tight">
            {text.title} <span aria-hidden="true">🏅</span>
          </h1>
          <p className="mt-3 text-[15px] text-slate-600 leading-relaxed">{text.subtitle}</p>
        </div>

        {friendPick && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border-2 border-amber-300 shadow-sm">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
              <FoodPhoto food={friendPick} sizes="64px" />
            </div>
            <div>
              <p className="font-bold">{fill('friendPick', { food: pickText(friendPick.name, lang) })}</p>
              <p className="mt-0.5 text-xs text-slate-500">{text.friendPickSub}</p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={start}
          className="w-full h-16 rounded-2xl bg-gradient-to-r from-sky-500 to-amber-400 text-white text-xl font-black shadow-[0_6px_0_#0c4a6e] active:translate-y-1 active:shadow-[0_2px_0_#0c4a6e] transition cursor-pointer"
        >
          {text.start} 🔥
        </button>
      </div>
    );
  }

  // ---------- Result ----------
  if (phase === 'result' && state.champion) {
    const champion = state.champion;
    const ranking: { food: BusanFood; label: string; medal: string }[] = [
      { food: champion, label: text.rank1, medal: '🥇' },
      ...(state.runnerUp ? [{ food: state.runnerUp, label: text.rank2, medal: '🥈' }] : []),
      ...state.semifinalists.map((food) => ({ food, label: text.rank3, medal: '🏅' })),
    ];
    const shareText = fill('shareText', { emoji: champion.emoji, food: pickText(champion.name, lang) });

    return (
      <div className="space-y-5">
        <div className="rounded-3xl overflow-hidden border-4 border-amber-300 bg-white shadow-xl">
          <div className="relative aspect-square">
            <FoodPhoto food={champion} sizes="(max-width: 512px) 100vw, 512px" />
            <div className="absolute inset-x-0 bottom-0 p-5 pt-16 bg-gradient-to-t from-black/80 to-transparent text-center text-white">
              <p className="text-xs font-bold text-amber-300 tracking-wide">🥇 {text.winnerLabel}</p>
              <h1 className="mt-1 text-3xl font-black">{pickText(champion.name, lang)}</h1>
              {BUSAN_FOOD_STORIES[champion.id] && (
                <p className="mt-1.5 text-sm text-white/90">{pickText(BUSAN_FOOD_STORIES[champion.id].quip, lang)}</p>
              )}
            </div>
          </div>
          <div className="p-5 bg-amber-50">
            <p className="text-sm font-black text-amber-700 mb-1.5">{text.tmiTitle}</p>
            <FoodTmi food={champion} open />
          </div>
        </div>

        <ShareButton
          path={`${PATH}?w=${champion.id}`}
          title={text.title}
          text={shareText}
          imageUrl={`${SITE_URL}${localePath(PATH)}/og`}
          storyImage={{ src: localePath(`${PATH}/story/${champion.id}.png`), fileName: `busan-food-${champion.id}.png` }}
          className="w-full h-12 !bg-slate-900 !text-white !border-0 text-base"
        />

        <OthersPanel stats={stats} champion={champion} fill={fill} />

        <div className="p-5 rounded-2xl bg-white shadow-sm border border-slate-200">
          <p className="text-sm font-black text-slate-700 mb-3">{text.top4}</p>
          <ol className="space-y-3">
            {ranking.map(({ food, label, medal }) => (
              <li key={food.id} className="flex items-start gap-3">
                <span className="w-6 pt-2 text-center text-lg" aria-hidden="true">{medal}</span>
                <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                  <FoodPhoto food={food} sizes="48px" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-bold">{pickText(food.name, lang)}</span>
                    <span className="text-[11px] text-slate-400 shrink-0">{label}</span>
                  </div>
                  <FoodTmi food={food} />
                </div>
              </li>
            ))}
          </ol>
        </div>

        <KakaoAdfitBanner unit={AD_UNIT} width="300" height="250" />

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={start}
            className="h-12 rounded-2xl bg-white border border-slate-200 shadow-sm font-bold text-sm hover:border-slate-400 transition cursor-pointer"
          >
            ↻ {text.restart}
          </button>
          <Link
            href={localePath('/play')}
            className="h-12 rounded-2xl bg-white border border-slate-200 shadow-sm font-bold text-sm hover:border-slate-400 transition flex items-center justify-center"
          >
            🎮 {text.otherTests}
          </Link>
        </div>
      </div>
    );
  }

  // ---------- Match ----------
  const pair = [state.round[state.match * 2], state.round[state.match * 2 + 1]] as const;
  const totalMatches = state.round.length / 2;

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-3xl font-black">{roundLabel(state.round.length)}</p>
        <p className="mt-1 text-sm font-bold text-sky-700">{roundCheer(state.round.length)}</p>
        <p className="mt-0.5 text-xs text-slate-400 tabular-nums">{fill('progress', { cur: state.match + 1, total: totalMatches })}</p>
        <div className="mt-3 h-2 rounded-full bg-white shadow-inner overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-amber-500 transition-all duration-300"
            style={{ width: `${(state.match / totalMatches) * 100}%` }}
          />
        </div>
      </div>

      <div className="relative grid grid-cols-1 gap-3">
        {pair.map((food, i) => (
          <button
            key={`${state.round.length}-${state.match}-${food.id}`}
            type="button"
            onClick={() => pick(i as 0 | 1)}
            className={`relative h-56 sm:h-64 rounded-3xl overflow-hidden border-4 shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98] ${
              picked === i
                ? 'border-amber-400 scale-[1.03] rotate-1'
                : picked !== null
                ? 'border-white opacity-40 scale-95'
                : 'border-white hover:border-amber-300'
            }`}
          >
            <FoodPhoto food={food} sizes="(max-width: 512px) 100vw, 512px" />
            <span className="absolute inset-x-0 bottom-0 px-4 pb-3 pt-12 bg-gradient-to-t from-black/85 via-black/50 to-transparent text-center text-white">
              <span className="block text-lg sm:text-xl font-black">{pickText(food.name, lang)}</span>
              {BUSAN_FOOD_STORIES[food.id] && (
                <span className="block mt-0.5 text-xs sm:text-sm text-white/85">{pickText(BUSAN_FOOD_STORIES[food.id].quip, lang)}</span>
              )}
            </span>
            {picked === i && (
              <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-400 text-slate-900 text-sm font-black shadow" aria-hidden="true">
                PICK! 😋
              </span>
            )}
          </button>
        ))}
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-6 w-14 h-14 rounded-full bg-gradient-to-br from-sky-500 to-amber-400 border-4 border-white text-white flex items-center justify-center text-base font-black shadow-lg pointer-events-none">
          {text.vs}
        </span>
      </div>

      <div className="flex justify-between text-sm">
        <button
          type="button"
          onClick={undo}
          disabled={history.length <= 1}
          className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer disabled:cursor-default"
        >
          ↶ {text.undo}
        </button>
        <button type="button" onClick={reset} className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-900 cursor-pointer">
          {text.quit}
        </button>
      </div>
    </div>
  );
}

/** Everyone's gold medals; stays a "N people so far" teaser until BF_MIN_VOTES have played. */
function OthersPanel({
  stats,
  champion,
  fill,
}: {
  stats: BusanFoodStats | null;
  champion: BusanFood;
  fill: (key: keyof (typeof BF_TEXT)['ko'], vars: Record<string, string | number>) => string;
}) {
  const { lang } = useTranslation();
  const text = BF_TEXT[lang];
  if (!stats) return null;

  if (stats.total < BF_MIN_VOTES) {
    return (
      <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-center">
        <p className="text-sm font-bold">👥 {fill('participants', { n: stats.total })}</p>
        <p className="mt-1 text-xs text-slate-500">{fill('unlockHint', { n: BF_MIN_VOTES })}</p>
      </div>
    );
  }

  const pct = (n: number) => Math.round((n / stats.total) * 100);
  const top = BUSAN_FOODS.map((food) => ({ food, golds: stats.foods[food.id]?.golds ?? 0 }))
    .sort((a, b) => b.golds - a.golds)
    .slice(0, 5);
  const mine = stats.foods[champion.id];

  return (
    <div className="p-5 rounded-2xl bg-white shadow-sm border border-sky-200">
      <div className="flex items-baseline justify-between mb-1">
        <p className="text-sm font-black text-slate-700">👥 {text.othersTitle}</p>
        <p className="text-[11px] text-slate-400">{fill('participants', { n: stats.total })}</p>
      </div>
      <p className="text-xs font-bold text-amber-600 mb-4">{fill('sameAsYou', { pct: pct(mine?.golds ?? 0) })}</p>
      <ol className="space-y-2.5">
        {top.map(({ food, golds }, i) => (
          <li key={food.id} className="flex items-center gap-3 text-sm">
            <span className="w-4 text-center font-black text-slate-400">{i + 1}</span>
            <span className={`w-28 truncate ${food.id === champion.id ? 'text-amber-600 font-bold' : ''}`}>
              {pickText(food.name, lang)}
            </span>
            <span className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
              <span
                className={`block h-full rounded-full ${food.id === champion.id ? 'bg-amber-400' : 'bg-sky-500'}`}
                style={{ width: `${pct(golds)}%` }}
              />
            </span>
            <span className="w-10 text-right tabular-nums text-slate-500">{pct(golds)}%</span>
          </li>
        ))}
      </ol>
      {mine && mine.games > 0 && (
        <p className="mt-4 text-xs text-slate-500">
          {pickText(champion.name, lang)} · {text.winRate} {Math.round((mine.wins / mine.games) * 100)}%
        </p>
      )}
    </div>
  );
}
