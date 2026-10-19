'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Food, FOODS, FOODS_BY_ID } from '@/data/foods';
import { SPOTS_DATA } from '@/data/spotsData';
import { getSpotSlug } from '@/lib/spots';
import { useTranslation } from '@/lib/i18n/context';
import { SITE_URL } from '@/lib/i18n/routing';
import ShareButton from './ShareButton';

const KakaoAdfitBanner = dynamic(() => import('./KakaoAdfitBanner'), { ssr: false });

const AD_UNIT = 'DAN-1KAy0L6HlzeWlDlY';
const BRACKETS = [16, 32, 64, 128] as const;
const PATH = '/play/food-worldcup';

interface Bracket {
  size: number;
  round: Food[];
  winners: Food[];
  match: number;
  semifinalists: Food[];
  runnerUp?: Food;
  champion?: Food;
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
    semifinalists: state.round.length === 4 ? [...state.semifinalists, loser] : state.semifinalists,
  };
  if (state.round.length === 2) return { ...next, runnerUp: loser, champion: chosen };
  if (next.match * 2 >= state.round.length) return { ...next, round: next.winners, winners: [], match: 0 };
  return next;
}

export default function FoodWorldCup() {
  const { lang, t, localePath } = useTranslation();
  const [size, setSize] = useState<number>(32);
  const [history, setHistory] = useState<Bracket[]>([]);
  const [picked, setPicked] = useState<0 | 1 | null>(null);
  const [friendPick, setFriendPick] = useState<Food | null>(null);

  const fill = (key: string, vars: Record<string, string | number>) =>
    Object.entries(vars).reduce((text, [k, v]) => text.replace(`{${k}}`, String(v)), t(key));

  useEffect(() => {
    const id = Number(new URLSearchParams(window.location.search).get('w'));
    setFriendPick(FOODS_BY_ID.get(id) ?? null);
  }, []);

  const state = history[history.length - 1];
  const phase = !state ? 'intro' : state.champion ? 'result' : 'play';

  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (phase === 'result' && state?.champion) {
      window.gtag?.('event', 'worldcup_complete', { bracket: state.size, winner: state.champion.name.en });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const start = () => {
    setHistory([{ size, round: shuffle(FOODS).slice(0, size), winners: [], match: 0, semifinalists: [] }]);
    window.gtag?.('event', 'worldcup_start', { bracket: size });
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

  const roundLabel = (n: number) =>
    n === 2 ? t('wc.final') : n === 4 ? t('wc.semifinal') : fill('wc.round', { n });

  // ---------- Intro ----------
  if (phase === 'intro') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-6xl mb-3" aria-hidden="true">🍗🆚🍕</div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t('wc.title')}</h1>
          <p className="mt-3 text-sm text-gray-400 leading-relaxed">{t('wc.subtitle')}</p>
        </div>

        {friendPick && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 to-rose-500/15 border border-amber-500/30 text-center">
            <p className="text-lg font-bold">
              {friendPick.emoji} {fill('wc.friendPick', { food: friendPick.name[lang] })}
            </p>
            <p className="mt-1 text-xs text-gray-300">{t('wc.friendPickSub')}</p>
          </div>
        )}

        <div>
          <p className="text-sm font-bold text-gray-300 mb-3">{t('wc.chooseRound')}</p>
          <div className="grid grid-cols-2 gap-3">
            {BRACKETS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSize(n)}
                className={`relative p-4 rounded-2xl border text-left transition cursor-pointer ${
                  size === n
                    ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/40'
                    : 'bg-[#16171d] border-gray-800 hover:border-gray-600'
                }`}
              >
                {(n === 32 || n === 128) && (
                  <span
                    className={`absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      n === 128 ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {n === 128 ? t('wc.hardcore') : t('wc.recommended')}
                  </span>
                )}
                <span className="block text-xl font-extrabold">{fill('wc.roundOption', { n })}</span>
                <span className="block mt-0.5 text-xs text-gray-400">{fill('wc.matches', { n: n - 1 })}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={start}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-white text-lg font-extrabold shadow-lg shadow-rose-500/20 active:scale-[0.98] transition cursor-pointer"
        >
          {t('wc.start')} 🔥
        </button>
      </div>
    );
  }

  // ---------- Result ----------
  if (phase === 'result' && state.champion) {
    const champion = state.champion;
    const spot = champion.spotId ? SPOTS_DATA.find((s) => s.id === champion.spotId) : undefined;
    const ranking: { food: Food; label: string }[] = [
      { food: champion, label: t('wc.rank1') },
      ...(state.runnerUp ? [{ food: state.runnerUp, label: t('wc.rank2') }] : []),
      ...state.semifinalists.map((food) => ({ food, label: t('wc.rank3') })),
    ];
    const shareText = fill('wc.shareText', { emoji: champion.emoji, food: champion.name[lang], n: state.size });

    return (
      <div className="space-y-5">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/20 via-rose-500/10 to-purple-500/20 border border-amber-400/40 text-center">
          <p className="text-xs font-bold text-amber-300 tracking-wide">
            🏆 {fill('wc.round', { n: state.size })} · {t('wc.winnerLabel')}
          </p>
          <div className="text-8xl my-4" aria-hidden="true">{champion.emoji}</div>
          <h1 className="text-3xl font-extrabold">{champion.name[lang]}</h1>
        </div>

        <ShareButton
          path={`${PATH}?w=${champion.id}`}
          title={t('wc.title')}
          text={shareText}
          imageUrl={`${SITE_URL}${localePath(PATH)}/og`}
          className="w-full h-12 !bg-white !text-gray-900 !border-0 text-base"
        />

        {spot && (
          <Link
            href={localePath(`/spot/${getSpotSlug(spot)}`)}
            className="block p-4 rounded-2xl bg-blue-600/15 border border-blue-500/40 hover:bg-blue-600/25 transition"
          >
            <p className="text-xs font-bold text-blue-300">📍 {t('wc.whereToEat')}</p>
            <p className="mt-1 text-sm font-semibold">
              {spot.emoji} {fill('wc.whereToEatSub', { spot: spot.name[lang] })}
            </p>
          </Link>
        )}

        <div className="p-5 rounded-2xl bg-[#16171d] border border-gray-800">
          <p className="text-sm font-bold text-gray-300 mb-3">{t('wc.top4')}</p>
          <ol className="space-y-2">
            {ranking.map(({ food, label }, i) => (
              <li key={food.id} className="flex items-center gap-3">
                <span className="w-6 text-center text-sm font-black text-gray-500">{i < 2 ? i + 1 : 3}</span>
                <span className="text-2xl" aria-hidden="true">{food.emoji}</span>
                <span className="flex-1 text-sm font-semibold">{food.name[lang]}</span>
                <span className="text-[11px] text-gray-400">{label}</span>
              </li>
            ))}
          </ol>
        </div>

        <KakaoAdfitBanner unit={AD_UNIT} width="300" height="250" />

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={reset}
            className="h-12 rounded-2xl bg-[#16171d] border border-gray-700 font-bold text-sm hover:border-gray-500 transition cursor-pointer"
          >
            ↻ {t('wc.restart')}
          </button>
          <Link
            href={localePath('/play')}
            className="h-12 rounded-2xl bg-[#16171d] border border-gray-700 font-bold text-sm hover:border-gray-500 transition flex items-center justify-center"
          >
            🎮 {t('wc.otherTests')}
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
        <p className="text-2xl font-extrabold">{roundLabel(state.round.length)}</p>
        <p className="mt-1 text-sm text-gray-400 tabular-nums">
          {fill('wc.progress', { cur: state.match + 1, total: totalMatches })}
        </p>
        <div className="mt-3 h-1.5 rounded-full bg-gray-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-300"
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
            className={`h-44 sm:h-52 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-[0.98] ${
              picked === i
                ? 'border-amber-400 bg-amber-500/20 scale-[1.02]'
                : picked !== null
                ? 'border-gray-800 bg-[#16171d] opacity-40 scale-95'
                : 'border-gray-800 bg-[#16171d] hover:border-amber-400/60 hover:bg-[#1d1f27]'
            }`}
          >
            <span className="text-7xl" aria-hidden="true">{food.emoji}</span>
            <span className="text-lg sm:text-xl font-bold px-4 text-center">{food.name[lang]}</span>
          </button>
        ))}
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-sm font-black shadow-lg pointer-events-none">
          {t('wc.vs')}
        </span>
      </div>

      <div className="flex justify-between text-sm">
        <button
          type="button"
          onClick={undo}
          disabled={history.length <= 1}
          className="px-3 py-2 rounded-xl text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-default"
        >
          ↶ {t('wc.undo')}
        </button>
        <button type="button" onClick={reset} className="px-3 py-2 rounded-xl text-gray-400 hover:text-white cursor-pointer">
          {t('wc.quit')}
        </button>
      </div>
    </div>
  );
}
