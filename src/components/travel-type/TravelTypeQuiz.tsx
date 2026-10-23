'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n/context';
import { QUESTIONS, STATS, TEST_PATH, decodeAnswers, encodeAnswers, loc, resultPath, scoreAnswers, tt, typeOf } from '@/lib/travelType';

export const OWN_RESULT_KEY = 'cep_travel_type';
const LETTERS = ['A', 'B', 'C', 'D'];
const BAR_COLORS = ['#534AB7', '#0F6E56', '#993556', '#854F0B', '#185FA5', '#3B6D11'];

export default function TravelTypeQuiz() {
  const { lang, localePath } = useTranslation();
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [friend, setFriend] = useState<string | null>(null);
  // Taps on the outgoing question (still on screen while it slides out) or a quick double tap
  // must not answer twice; answersRef always holds the latest answers.
  const lockedUntil = useRef(0);
  const answersRef = useRef<number[]>([]);
  answersRef.current = answers;

  useEffect(() => {
    const f = new URLSearchParams(window.location.search).get('f');
    if (decodeAnswers(f)) setFriend(f);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [started, analyzing]);

  const answer = (qi: number, oi: number) => {
    const now = Date.now();
    if (qi !== answersRef.current.length || now < lockedUntil.current) return;
    lockedUntil.current = now + 300;
    const next = [...answersRef.current, oi];
    answersRef.current = next;
    setAnswers(next);
    if (next.length < QUESTIONS.length) return;
    const stats = scoreAnswers(next);
    const key = typeOf(stats);
    const a = encodeAnswers(next);
    try {
      sessionStorage.setItem(OWN_RESULT_KEY, a);
    } catch {}
    window.gtag?.('event', 'travel_type_complete', { result: key, compare: Boolean(friend) });
    setAnalyzing(true);
    const query = `?a=${a}${friend ? `&f=${friend}` : ''}`;
    setTimeout(() => router.push(`${localePath(resultPath(key))}${query}`), 1800);
  };

  if (analyzing) {
    return (
      <div className="py-16 space-y-6">
        <p className="text-center text-lg font-extrabold">{tt('analyzing', lang)}</p>
        <div className="space-y-3 max-w-xs mx-auto">
          {STATS.map((s, i) => (
            <div key={s}>
              <p className="text-xs font-bold text-slate-500 mb-1">{tt(`stat.${s}`, lang)}</p>
              <div className="h-2.5 rounded-full bg-white overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: BAR_COLORS[i] }}
                  initial={{ width: '0%' }}
                  animate={{ width: ['0%', '85%', '45%', '70%'] }}
                  transition={{ duration: 1.6, delay: i * 0.08, ease: 'easeInOut' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (started) {
    const qi = answers.length;
    const q = QUESTIONS[qi];
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
            <span>{tt('title', lang)}</span>
            <span className="tabular-nums">
              {qi + 1} / {QUESTIONS.length}
            </span>
          </div>
          <div className="flex gap-1" aria-hidden="true">
            {QUESTIONS.map((_, i) => (
              <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < qi ? 'bg-violet-500' : i === qi ? 'bg-violet-300' : 'bg-white'}`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={qi}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
            className="space-y-5"
          >
            <h2 className="text-[1.35rem] sm:text-2xl font-extrabold leading-snug">
              <span className="inline-flex items-center justify-center w-9 h-9 mr-2 rounded-xl bg-violet-500 text-white text-base align-middle">
                {qi + 1}
              </span>
              {loc(q.q, lang)}
            </h2>
            <div className="space-y-3">
              {q.options.map((o, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => answer(qi, i)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white border-2 border-transparent hover:border-violet-300 shadow-sm text-left text-[15px] font-semibold text-slate-800 transition active:scale-[0.98] cursor-pointer"
                >
                  <span className="shrink-0 w-7 h-7 rounded-lg bg-violet-50 text-violet-600 text-sm font-black flex items-center justify-center">{LETTERS[i]}</span>
                  {loc(o.t, lang)}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={() => (qi === 0 ? setStarted(false) : setAnswers(answers.slice(0, -1)))}
          className="text-sm font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          ← {tt('back', lang)}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center">
      {friend && (
        <div className="p-4 rounded-2xl bg-white border-2 border-violet-200 text-sm font-bold text-violet-700">{tt('friendInvite', lang)}</div>
      )}
      <div className="pt-4">
        <IntroHexagon />
        <h1 className="mt-5 text-3xl sm:text-4xl font-black tracking-tight">{tt('title', lang)}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{tt('intro', lang)}</p>
        <p className="mt-3 inline-block px-3 py-1 rounded-full bg-white text-xs font-bold text-slate-500">{tt('meta', lang)}</p>
      </div>
      <div className="grid grid-cols-3 gap-2 text-left">
        {STATS.map((s, i) => (
          <div key={s} className="p-3 rounded-2xl bg-white">
            <span className="block w-2 h-2 rounded-full mb-1.5" style={{ background: BAR_COLORS[i] }} />
            <span className="text-xs font-bold text-slate-700">{tt(`stat.${s}`, lang)}</span>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          setAnswers([]);
          setStarted(true);
          window.gtag?.('event', 'travel_type_start', { compare: Boolean(friend) });
        }}
        className="w-full h-14 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-lg font-extrabold shadow-lg shadow-violet-500/25 active:scale-[0.98] transition cursor-pointer"
      >
        {tt('start', lang)} →
      </button>
      <p className="text-[11px] leading-relaxed text-slate-400">{tt('disclaimer', lang)}</p>
      <a href={localePath(`${TEST_PATH}/types`)} className="block text-sm font-bold text-violet-600 hover:underline">
        {tt('allTypes', lang)} →
      </a>
    </div>
  );
}

/** Small decorative hexagon that keeps "breathing" on the intro screen. */
function IntroHexagon() {
  const pts = (r: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 3;
      return `${60 + r * Math.cos(a)},${60 + r * Math.sin(a)}`;
    }).join(' ');
  return (
    <svg viewBox="0 0 120 120" className="w-28 h-28 mx-auto" aria-hidden="true">
      <polygon points={pts(50)} fill="none" stroke="#c4b5fd" strokeWidth={2} />
      <polygon points={pts(33)} fill="none" stroke="#ddd6fe" strokeWidth={2} />
      <motion.polygon
        points="60,22 92,44 84,84 60,96 30,78 36,40"
        fill="#a78bfa"
        fillOpacity={0.45}
        stroke="#7c3aed"
        strokeWidth={2.5}
        animate={{ scale: [0.85, 1, 0.85] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '60px 60px' }}
      />
    </svg>
  );
}
