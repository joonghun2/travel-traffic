'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/lib/i18n/context';
import { STATUS_COLOR } from '@/lib/mapSpots';
import ShareButton from '@/components/ShareButton';
import RadarChart from './RadarChart';
import { OWN_RESULT_KEY } from './TravelTypeQuiz';
import {
  QUESTIONS,
  RARITY,
  STATS,
  Stats,
  TEST_PATH,
  THEME,
  TYPES,
  TypeKey,
  decisiveAnswers,
  decodeAnswers,
  grade,
  isPlanner,
  loc,
  matchScore,
  nearType,
  personaStats,
  resultPath,
  scoreAnswers,
  tt,
  typeOf,
} from '@/lib/travelType';
import type { TravelPick } from '@/lib/travelTypePicks';
import { SITE_URL } from '@/lib/i18n/routing';

const KakaoAdfitBanner = dynamic(() => import('@/components/KakaoAdfitBanner'), { ssr: false });
const AD_UNIT = 'DAN-1KAy0L6HlzeWlDlY';

type Viewer = 'loading' | 'own' | 'friend' | 'type';

export default function TravelTypeResult({ typeKey, picks }: { typeKey: TypeKey; picks: TravelPick[] }) {
  const { lang, t, localePath } = useTranslation();
  const [answers, setAnswers] = useState<number[] | null>(null);
  const [friendAnswers, setFriendAnswers] = useState<number[] | null>(null);
  const [viewer, setViewer] = useState<Viewer>('loading');

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const a = decodeAnswers(p.get('a'));
    // A shared link can only be trusted for this page's type.
    const valid = a && typeOf(scoreAnswers(a)) === typeKey ? a : null;
    setAnswers(valid);
    setFriendAnswers(decodeAnswers(p.get('f')));
    let own = false;
    try {
      own = Boolean(valid) && sessionStorage.getItem(OWN_RESULT_KEY) === p.get('a');
    } catch {}
    setViewer(!valid ? 'type' : own ? 'own' : 'friend');
  }, [typeKey]);

  const info = TYPES[typeKey];
  const theme = THEME[typeKey];
  const stats: Stats = useMemo(() => (answers ? scoreAnswers(answers) : personaStats(typeKey)), [answers, typeKey]);
  const friendStats = useMemo(() => (friendAnswers ? scoreAnswers(friendAnswers) : null), [friendAnswers]);
  const labels = Object.fromEntries(STATS.map((s) => [s, tt(`stat.${s}`, lang)]));
  const planner = isPlanner(stats);
  const near = answers ? nearType(stats) : null;
  const decisive = answers ? decisiveAnswers(answers, typeKey) : [];
  const quietFirst = stats.CRW < 40;
  const timeKey = stats.CRW < 40 ? 'time.low' : stats.CRW < 65 ? 'time.mid' : 'time.high';

  // Low crowd tolerance: today's quietest places first (places without data keep their order).
  const orderedPicks = useMemo(() => {
    if (!quietFirst) return picks;
    return [...picks].sort((a, b) => (a.live?.score ?? 50) - (b.live?.score ?? 50));
  }, [picks, quietFirst]);

  const a = answers?.join('');
  const sharePath = a ? `${resultPath(typeKey)}?a=${a}` : resultPath(typeKey);
  const shareText = tt('shareText', lang, { name: loc(info.name, lang), exp: stats.EXP, crw: stats.CRW });
  const name = loc(info.name, lang);

  return (
    <div className="space-y-5">
      {viewer === 'friend' && (
        <Link href={localePath(`${TEST_PATH}?f=${a}`)} className="block p-4 rounded-2xl bg-white border-2 border-violet-200 text-center">
          <p className="text-sm text-slate-600">{tt('friendResult', lang)}</p>
          <p className="mt-1 text-lg font-extrabold text-violet-700">{tt('tryIt', lang)} →</p>
        </Link>
      )}

      {/* Stat card */}
      <section className="rounded-[28px] p-5 sm:p-6 shadow-sm" style={{ background: theme.bg, color: '#1e1b2e' }}>
        <div className="flex items-center justify-between gap-2 text-xs font-bold">
          <span className="truncate" style={{ color: theme.accent }}>
            {tt('title', lang)}
          </span>
          <span className="shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full bg-white/70" style={{ color: theme.accent }}>
            {tt('rarity', lang, { n: RARITY[typeKey] })}
          </span>
        </div>
        <p className="mt-4 text-sm font-extrabold" style={{ color: theme.accent }}>
          {answers ? tt(planner ? 'planner' : 'spontaneous', lang) : ' '}
        </p>
        <h1 className="text-[2rem] leading-tight font-black tracking-tight">{name}</h1>
        <p className="mt-1.5 text-[15px] font-semibold opacity-80">{loc(info.tagline, lang)}</p>
        {near && (
          <p className="mt-2 inline-block px-2.5 py-1 rounded-full bg-white/70 text-xs font-bold" style={{ color: theme.accent }}>
            {tt('near', lang, { name: loc(TYPES[near].name, lang) })}
          </p>
        )}

        <RadarChart
          stats={stats}
          compare={viewer !== 'friend' ? friendStats ?? undefined : undefined}
          labels={labels}
          accent={theme.accent}
          soft={theme.soft}
          className="w-full max-w-[340px] mx-auto mt-2 text-slate-900"
        />

        <div className="grid grid-cols-3 gap-2">
          {STATS.map((s) => (
            <div key={s} className="rounded-2xl bg-white/75 px-2 py-2.5 text-center">
              <p className="text-[11px] font-bold text-slate-500">{labels[s]}</p>
              <p className="mt-0.5 text-lg font-black tabular-nums">
                {stats[s]}
                <span className="ml-1 text-xs font-black" style={{ color: theme.accent }}>
                  {grade(stats[s])}
                </span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Friend comparison */}
      {friendStats && viewer !== 'friend' && (
        <section className="p-5 rounded-3xl bg-white">
          <h2 className="text-base font-extrabold">{tt('compareTitle', lang)}</h2>
          <p className="mt-1 text-3xl font-black" style={{ color: theme.accent }}>
            {tt('compareScore', lang, { n: matchScore(stats, friendStats) })}
          </p>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            {tt(matchScore(stats, friendStats) >= 75 ? 'compare.high' : matchScore(stats, friendStats) >= 55 ? 'compare.mid' : 'compare.low', lang)}
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ background: theme.accent }} />
              {tt('compareMe', lang)} · {name}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm border-2 border-dashed border-slate-500" />
              {tt('compareFriend', lang)} · {loc(TYPES[typeOf(friendStats)].name, lang)}
            </span>
          </div>
        </section>
      )}

      {/* Description */}
      <section className="p-5 rounded-3xl bg-white space-y-4">
        <p className="text-[15px] leading-relaxed text-slate-700">{loc(info.desc, lang)}</p>
        {decisive.length > 0 && (
          <div>
            <h2 className="text-sm font-extrabold">{tt('why', lang)}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{tt('whyDesc', lang)}</p>
            <ul className="mt-2 space-y-2">
              {decisive.map(({ qi, oi }) => (
                <li key={qi} className="p-3 rounded-2xl bg-slate-50 text-sm">
                  <span className="block text-xs text-slate-500">{loc(QUESTIONS[qi].q, lang)}</span>
                  <span className="block mt-0.5 font-bold text-slate-800">“{loc(QUESTIONS[qi].options[oi].t, lang)}”</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <h2 className="text-sm font-extrabold">{tt('strengths', lang)}</h2>
          <ul className="mt-2 space-y-1.5">
            {loc(info.strengths, lang).map((s) => (
              <li key={s} className="flex gap-2 text-sm text-slate-700">
                <span style={{ color: theme.accent }}>✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-extrabold">{tt('pitfalls', lang)}</h2>
          <ul className="mt-2 space-y-2">
            {loc(info.pitfalls, lang).map((s) => {
              const [problem, fix] = s.split('→').map((x) => x.trim());
              return (
                <li key={s} className="p-3 rounded-2xl bg-amber-50 text-sm">
                  <span className="block text-slate-700">{problem}</span>
                  {fix && <span className="block mt-1 font-bold text-amber-800">→ {fix}</span>}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Prescription */}
      <section className="p-5 rounded-3xl bg-white space-y-3">
        <h2 className="text-lg font-extrabold">💊 {tt('prescription', lang)}</h2>
        <div className="p-3 rounded-2xl" style={{ background: theme.bg }}>
          <p className="text-xs font-bold" style={{ color: theme.accent }}>
            {tt('direction', lang)}
          </p>
          <p className="mt-0.5 text-[15px] font-extrabold text-slate-900">{loc(info.direction, lang)}</p>
        </div>
        {quietFirst && <p className="text-xs font-semibold text-slate-500">{tt('quietFirst', lang)}</p>}
        <ul className="space-y-2.5">
          {orderedPicks.map((p) => (
            <li key={p.id} className="p-3.5 rounded-2xl border border-slate-100">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-400">
                    {p.live ? tt('live', lang) : tt('local', lang)} · {t(`map.city.${p.city}`)}
                  </p>
                  <p className="text-[15px] font-extrabold text-slate-900">{p.name}</p>
                </div>
                {p.live && (
                  <span
                    className="shrink-0 px-2 py-1 rounded-full text-xs font-bold bg-slate-50"
                    style={{ color: STATUS_COLOR[p.live.status] }}
                  >
                    {p.live.forecast ? tt('forecast', lang) : tt('live', lang)} {t(`card.status.${p.live.status}`)} {p.live.score}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">{p.why}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                <a href={p.mapUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-xl bg-slate-900 text-white">
                  📍 {tt('map', lang)}
                </a>
                <a href={p.altMapUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
                  {p.altMapUrl.includes('naver') ? 'Naver' : 'Google'}
                </a>
                {p.live && (
                  <Link href={localePath(`/spot/${p.live.slug}`)} className="px-3 py-1.5 rounded-xl bg-violet-50 text-violet-700">
                    {tt('crowdPage', lang)} →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
        <p className="p-3 rounded-2xl bg-slate-50 text-sm font-semibold text-slate-700">🕘 {tt(timeKey, lang)}</p>
        <p className="text-sm text-slate-600">💡 {loc(planner ? info.plannerTip : info.spontaneousTip, lang)}</p>
      </section>

      <KakaoAdfitBanner unit={AD_UNIT} width="300" height="250" />

      {/* Buddy / clash */}
      <section className="grid grid-cols-2 gap-3">
        {(['buddy', 'clash'] as const).map((rel) => {
          const k = info[rel];
          return (
            <Link key={rel} href={localePath(resultPath(k))} className="p-4 rounded-3xl bg-white hover:shadow-sm transition">
              <p className="text-xs font-bold text-slate-400">{tt(rel, lang)}</p>
              <p className="mt-1 text-base font-extrabold" style={{ color: THEME[k].accent }}>
                {loc(TYPES[k].name, lang)}
              </p>
              <p className="mt-1 text-xs text-slate-500 leading-snug">{loc(TYPES[k].tagline, lang)}</p>
            </Link>
          );
        })}
      </section>

      {/* Share */}
      <section className="p-5 rounded-3xl bg-white space-y-3">
        {a && (
          <div className="grid grid-cols-2 gap-2">
            {(['feed', 'story'] as const).map((size) => (
              <a
                key={size}
                href={localePath(`${TEST_PATH}/card/${a}-${size}.png`)}
                download={`travel-type-${info.slug}-${size}.png`}
                onClick={() => window.gtag?.('event', 'travel_type_card', { size, result: typeKey })}
                className="h-11 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center"
              >
                {tt(size === 'feed' ? 'saveFeed' : 'saveStory', lang)}
              </a>
            ))}
          </div>
        )}
        <ShareButton
          path={sharePath}
          title={`${name} · ${tt('title', lang)}`}
          text={shareText}
          imageUrl={`${SITE_URL}${localePath(resultPath(typeKey))}/og`}
          storyImage={a ? { src: localePath(`${TEST_PATH}/card/${a}-story.png`), fileName: `travel-type-${info.slug}-story.png` } : undefined}
          className="w-full h-12 !bg-violet-600 !text-white !border-0 text-base"
        />
        {a && (
          <ShareButton
            path={`${TEST_PATH}?f=${a}`}
            title={tt('compareTitle', lang)}
            text={tt('friendInvite', lang)}
            label={tt('compareCta', lang)}
            imageUrl={`${SITE_URL}${localePath(resultPath(typeKey))}/og`}
            className="w-full h-12"
          />
        )}
        <div className="flex justify-center gap-4 text-sm font-bold">
          <Link href={localePath(TEST_PATH)} className="text-violet-600 hover:underline">
            ↺ {tt('retake', lang)}
          </Link>
          <Link href={localePath(`${TEST_PATH}/types`)} className="text-slate-500 hover:underline">
            {tt('allTypes', lang)}
          </Link>
        </div>
      </section>

      <p className="text-[11px] leading-relaxed text-slate-400">{tt('disclaimer', lang)}</p>
    </div>
  );
}
