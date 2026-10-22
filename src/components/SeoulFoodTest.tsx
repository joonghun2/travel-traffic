'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  AREAS,
  AREA_IDS,
  AreaId,
  FOOD_TYPES,
  FoodTypeId,
  QUESTIONS,
  RESTAURANTS,
  Restaurant,
  TEST_PATH,
  isAreaId,
  scoreAnswers,
  ui,
} from '@/data/seoulFoodTest';
import { useTranslation } from '@/lib/i18n/context';
import { SITE_URL, pick } from '@/lib/i18n/routing';
import { pickQuietNear } from '@/lib/quietNear';
import { getSpotSlug } from '@/lib/slug';
import { STATUS_COLOR } from '@/lib/mapSpots';
import { LiveSpotMetric } from '@/types';
import ShareButton from './ShareButton';

const KakaoAdfitBanner = dynamic(() => import('./KakaoAdfitBanner'), { ssr: false });

const AD_UNIT = 'DAN-1KAy0L6HlzeWlDlY';
const STORAGE_KEY = 'cep_sft_result';

const resultPath = (type: FoodTypeId, area: AreaId) => `${TEST_PATH}/result/${type}?a=${area}`;

function mapLinks(r: Restaurant) {
  const q = encodeURIComponent(`${r.name.ko} ${r.address}`);
  const name = encodeURIComponent(r.name.ko);
  return {
    google: `https://www.google.com/maps/search/?api=1&query=${q}`,
    naver: `https://map.naver.com/p/search/${name}`,
    kakao: `https://map.kakao.com/link/search/${name}`,
    embed: `https://maps.google.com/maps?q=${q}&z=16&output=embed`,
  };
}

// ---------------------------------------------------------------------------
// Quiz: area -> 6 questions -> result URL
// ---------------------------------------------------------------------------
export function SeoulFoodTestQuiz() {
  const { lang, localePath } = useTranslation();
  const router = useRouter();
  const [area, setArea] = useState<AreaId | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [started, setStarted] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [started, analyzing]);

  const answer = (optionIndex: number) => {
    const next = [...answers, optionIndex];
    setAnswers(next);
    if (next.length < QUESTIONS.length || !area) return;

    const type = scoreAnswers(next);
    setAnalyzing(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, type);
    } catch {}
    window.gtag?.('event', 'food_test_complete', { result: type, area });
    setTimeout(() => router.push(localePath(resultPath(type, area))), 1400);
  };

  if (analyzing) {
    return (
      <div className="py-24 flex flex-col items-center gap-5 text-center">
        <div className="text-6xl animate-bounce" aria-hidden="true">🍽️</div>
        <p className="text-lg font-bold">{ui('analyzing', lang)}</p>
      </div>
    );
  }

  if (started && area) {
    const qi = answers.length;
    const question = QUESTIONS[qi];
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>
              {AREAS[area].emoji} {pick(AREAS[area].name, lang)}
            </span>
            <span className="tabular-nums">
              {ui('question', lang)} {qi + 1} / {QUESTIONS.length}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-300"
              style={{ width: `${(qi / QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        <h2 className="text-2xl font-extrabold leading-snug">
          <span className="text-rose-400">Q{qi + 1}.</span> {pick(question.q, lang)}
        </h2>

        <div className="space-y-3">
          {question.options.map((o, i) => (
            <button
              key={`${qi}-${i}`}
              type="button"
              onClick={() => answer(i)}
              className="w-full p-4 rounded-2xl bg-[#16171d] border border-gray-800 hover:border-rose-400/60 hover:bg-[#1d1f27] text-left text-base font-semibold transition active:scale-[0.98] cursor-pointer"
            >
              {pick(o.text, lang)}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => (qi === 0 ? setStarted(false) : setAnswers(answers.slice(0, -1)))}
          className="text-sm text-gray-400 hover:text-white cursor-pointer"
        >
          ← {ui('back', lang)}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-3" aria-hidden="true">🍽️</div>
        <h1 className="text-3xl font-extrabold tracking-tight">{ui('title', lang)}</h1>
        <p className="mt-3 text-sm text-gray-400 leading-relaxed">{ui('subtitle', lang)}</p>
      </div>

      <div>
        <p className="text-sm font-bold text-gray-300 mb-3">{ui('chooseArea', lang)}</p>
        <div className="grid grid-cols-2 gap-3">
          {AREA_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setArea(id)}
              className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                area === id
                  ? 'bg-rose-500/15 border-rose-400 ring-2 ring-rose-400/40'
                  : 'bg-[#16171d] border-gray-800 hover:border-gray-600'
              }`}
            >
              <span className="block text-2xl" aria-hidden="true">{AREAS[id].emoji}</span>
              <span className="block mt-1 text-base font-extrabold">{pick(AREAS[id].name, lang)}</span>
              <span className="block mt-0.5 text-xs text-gray-400">{pick(AREAS[id].desc, lang)}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!area}
        onClick={() => {
          setAnswers([]);
          setStarted(true);
          window.gtag?.('event', 'food_test_start', { area });
        }}
        className="w-full h-14 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-lg font-extrabold shadow-lg shadow-rose-500/20 active:scale-[0.98] transition cursor-pointer disabled:opacity-40 disabled:cursor-default"
      >
        {ui('start', lang)} →
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result page (shareable URL: /play/seoul-food-test/result/<type>?a=<area>)
// ---------------------------------------------------------------------------
function RestaurantCard({ r, showMap }: { r: Restaurant; showMap: boolean }) {
  const { lang } = useTranslation();
  const links = mapLinks(r);
  return (
    <li className="p-4 rounded-2xl bg-[#16171d] border border-gray-800 space-y-3">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-bold">{r.name.ko}</h3>
          {lang !== 'ko' && <span className="text-xs text-gray-400">{r.name.en}</span>}
          {r.bib && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
              {ui('bib', lang, { year: r.bib })}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-300">{pick(r.note, lang)}</p>
        <p className="mt-1 text-xs text-gray-500">📍 {r.address}</p>
      </div>

      {showMap && (
        <iframe
          src={links.embed}
          title={r.name.en}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-44 rounded-xl border-0 bg-gray-900"
        />
      )}

      <div className="grid grid-cols-3 gap-2 text-xs font-bold">
        <a href={links.google} target="_blank" rel="noopener noreferrer" className="h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
          Google
        </a>
        <a href={links.naver} target="_blank" rel="noopener noreferrer" className="h-10 rounded-xl bg-[#03C75A] text-white flex items-center justify-center">
          Naver
        </a>
        <a href={links.kakao} target="_blank" rel="noopener noreferrer" className="h-10 rounded-xl bg-[#FEE500] text-gray-900 flex items-center justify-center">
          Kakao
        </a>
      </div>
    </li>
  );
}

/** "3 quiet spots near <area> right now" from the live crowd API, plus a story card to save. */
function QuietSpotsNearArea({ type, area }: { type: FoodTypeId; area: AreaId }) {
  const { lang, t, localePath } = useTranslation();
  const [spots, setSpots] = useState<LiveSpotMetric[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/crowd')
      .then((r) => r.json())
      .then((d) => alive && setSpots(d.spots ?? []))
      .catch(() => alive && setSpots([]));
    return () => {
      alive = false;
    };
  }, []);

  const quiet = spots ? pickQuietNear(spots, AREAS[area].center, 3) : [];
  const storyPath = localePath(`${TEST_PATH}/result/${type}/story/${area}.png`);

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-extrabold">🟢 {t('quiet.title').replace('{area}', pick(AREAS[area].name, lang))}</h2>
        <p className="text-xs text-gray-400 mt-1">{t('quiet.desc')}</p>
      </div>
      {!spots ? (
        <p className="text-sm text-gray-400">{t('quiet.loading')}</p>
      ) : (
        <ul className="space-y-2">
          {quiet.map((m) => (
            <li key={m.id}>
              <Link
                href={localePath(`/spot/${getSpotSlug(m)}`)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#16171d] border border-gray-800 hover:border-gray-600"
              >
                <span className="text-2xl" aria-hidden="true">{m.emoji}</span>
                <span className="flex-1 min-w-0 text-sm font-bold truncate">{pick(m.name, lang)}</span>
                <span className="shrink-0 text-xs font-bold px-2 py-1 rounded-full bg-white/90" style={{ color: STATUS_COLOR[m.status] }}>
                  {t(`card.status.${m.status}`)} {m.currentScore}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <a
        href={storyPath}
        download={`checkeastpoint-${type}-${area}.png`}
        onClick={() => window.gtag?.('event', 'story_card_download', { item_id: `${type}-${area}` })}
        className="block p-3 rounded-2xl bg-white/10 border border-white/15 text-center text-sm font-bold hover:bg-white/15"
      >
        📸 {t('quiet.story')}
      </a>
    </section>
  );
}

export function SeoulFoodTestResult({ type }: { type: FoodTypeId }) {
  const { lang, localePath } = useTranslation();
  const [area, setArea] = useState<AreaId>('hongdae');
  const [isOwn, setIsOwn] = useState(true);
  const info = FOOD_TYPES[type];

  useEffect(() => {
    const a = new URLSearchParams(window.location.search).get('a');
    if (isAreaId(a)) setArea(a);
    try {
      setIsOwn(sessionStorage.getItem(STORAGE_KEY) === type);
    } catch {
      setIsOwn(false);
    }
  }, [type]);

  const selectArea = (next: AreaId) => {
    setArea(next);
    const url = new URL(window.location.href);
    url.searchParams.set('a', next);
    window.history.replaceState(null, '', url.toString());
  };

  const restaurants = RESTAURANTS[type][area];
  const areaName = pick(AREAS[area].name, lang);
  const moreQuery = encodeURIComponent(`${AREAS[area].mapKeyword} ${info.mapKeyword} 맛집`);
  const shareText = ui('shareText', lang, { title: pick(info.title, lang), emoji: info.emoji, menu: pick(info.menu, lang) });

  return (
    <div className="space-y-5">
      {!isOwn && (
        <Link
          href={localePath(TEST_PATH)}
          className="block p-4 rounded-2xl bg-gradient-to-r from-rose-500/20 to-amber-500/20 border border-rose-400/40 text-center"
        >
          <p className="text-sm text-gray-300">{ui('friendResult', lang)}</p>
          <p className="mt-1 text-lg font-extrabold">🍽️ {ui('tryIt', lang)} →</p>
        </Link>
      )}

      <section className={`p-6 rounded-3xl bg-gradient-to-br ${info.gradient} text-white text-center shadow-xl`}>
        <p className="text-sm font-bold opacity-90">{ui('todayIs', lang)}</p>
        <h1 className="mt-1 text-[1.7rem] leading-tight font-black">{pick(info.title, lang)}</h1>
        <div className="text-7xl my-4" aria-hidden="true">{info.emoji}</div>
        <p className="inline-block px-4 py-1.5 rounded-full bg-black/25 text-sm font-bold">
          {ui('bestMenu', lang)}: {pick(info.menu, lang)}
        </p>
        <p className="mt-4 text-sm leading-relaxed opacity-95">{pick(info.desc, lang)}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {info.traits.map((tr) => (
            <span key={tr.en} className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-bold">
              {tr[lang]}
            </span>
          ))}
        </div>
      </section>

      <ShareButton
        path={resultPath(type, area)}
        title={`${ui('todayIs', lang)} ${pick(info.title, lang)}`}
        text={shareText}
        imageUrl={`${SITE_URL}${localePath(`${TEST_PATH}/result/${type}`)}/og`}
        className="w-full h-12 !bg-white !text-gray-900 !border-0 text-base"
      />

      <section className="space-y-3">
        <h2 className="text-lg font-extrabold">
          {info.emoji} {ui('restaurantsIn', lang, { area: areaName })}
        </h2>
        <ul className="space-y-3">
          {restaurants.map((r, i) => (
            <RestaurantCard key={r.name.ko} r={r} showMap={i === 0} />
          ))}
        </ul>
        <a
          href={`https://www.google.com/maps/search/${moreQuery}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-3 rounded-2xl border border-dashed border-gray-700 text-center text-sm font-semibold text-blue-300 hover:border-blue-400"
        >
          {ui('moreOnMap', lang, { area: areaName, menu: pick(info.menu, lang) })}
        </a>
        <p className="text-[11px] text-gray-500">{ui('ratingNote', lang)}</p>
      </section>

      <QuietSpotsNearArea type={type} area={area} />

      <section>
        <p className="text-sm font-bold text-gray-300 mb-2">{ui('otherAreas', lang)}</p>
        <div className="grid grid-cols-2 gap-2">
          {AREA_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => selectArea(id)}
              className={`p-3 rounded-xl border text-sm font-bold text-left transition cursor-pointer ${
                id === area ? 'bg-rose-500/15 border-rose-400' : 'bg-[#16171d] border-gray-800 hover:border-gray-600'
              }`}
            >
              {AREAS[id].emoji} {pick(AREAS[id].name, lang)}
            </button>
          ))}
        </div>
      </section>

      <KakaoAdfitBanner unit={AD_UNIT} width="300" height="250" />

      <div className="grid grid-cols-2 gap-3">
        <Link
          href={localePath(TEST_PATH)}
          className="h-12 rounded-2xl bg-[#16171d] border border-gray-700 font-bold text-sm hover:border-gray-500 transition flex items-center justify-center"
        >
          ↻ {ui('retry', lang)}
        </Link>
        <Link
          href={localePath('/play')}
          className="h-12 rounded-2xl bg-[#16171d] border border-gray-700 font-bold text-sm hover:border-gray-500 transition flex items-center justify-center"
        >
          🎮 {ui('otherTests', lang)}
        </Link>
      </div>
    </div>
  );
}
