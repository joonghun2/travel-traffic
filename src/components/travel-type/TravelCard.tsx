'use client';

import { useRef, useState } from 'react';
import { Lang } from '@/types';
import { FUN, RARITY, Stats, THEME, TYPES, TypeKey, cardArt, cardFace, loc, tt } from '@/lib/travelType';

/** The result as a full-art trading card: art fills the card, name and power on top, moves below. */
export default function TravelCard({ typeKey, stats, lang, badge }: { typeKey: TypeKey; stats: Stats; lang: Lang; badge: string }) {
  const theme = THEME[typeKey];
  const info = TYPES[typeKey];
  const fun = FUN[typeKey];
  const face = cardFace(stats, lang);
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Leans a little toward the pointer, like holding a card under a light.
  const onMove = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -8, y: ((e.clientX - r.left) / r.width - 0.5) * 10 });
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      className="relative mx-auto w-full max-w-[360px] aspect-[5/7] rounded-[22px] p-[9px] shadow-[0_18px_40px_-12px_rgba(30,27,46,0.45)] transition-transform duration-200"
      style={{
        background: `linear-gradient(135deg, ${theme.accent} 0%, #fde68a 30%, ${theme.soft} 52%, #ffffff 64%, ${theme.accent} 100%)`,
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[15px] bg-slate-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cardArt(typeKey)} alt={loc(info.name, lang)} className="absolute inset-0 h-full w-full object-cover" />
        <div className="travel-card-holo pointer-events-none absolute inset-0" />

        <div className="absolute inset-x-0 top-0 px-3 pt-2.5 pb-8 bg-gradient-to-b from-black/55 via-black/25 to-transparent text-white">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="inline-block px-2 py-0.5 rounded-full bg-white/85 text-[10px] font-black" style={{ color: theme.accent }}>
                {badge}
              </span>
              <h1 className="mt-1 text-[24px] leading-tight font-black tracking-tight [text-shadow:0_2px_0_rgba(0,0,0,0.55)] truncate">
                {loc(info.name, lang)}
              </h1>
            </div>
            <div className="shrink-0 text-right leading-none">
              <span className="block text-[10px] font-bold opacity-90">{tt('power', lang)}</span>
              <span className="block mt-1 text-[30px] font-black tabular-nums [text-shadow:0_2px_0_rgba(0,0,0,0.55)]">{face.power}</span>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 px-3 pb-2.5 pt-10 bg-gradient-to-t from-white via-white/95 to-white/0 text-slate-900">
          {face.moves.map((m, i) => (
            <div key={m.stat} className="py-1.5 border-b border-slate-900/10">
              <div className="flex items-center gap-2">
                <span className="flex gap-0.5 shrink-0" aria-hidden="true">
                  {Array.from({ length: m.dots }, (_, d) => (
                    <span key={d} className="w-3.5 h-3.5 rounded-full border border-white shadow-sm" style={{ background: m.color }} />
                  ))}
                </span>
                <span className="flex-1 min-w-0 text-[14px] font-black truncate">{m.name}</span>
                <span className="text-[20px] font-black tabular-nums">{m.value}</span>
              </div>
              {i === 1 && <p className="mt-0.5 text-[11px] leading-snug text-slate-600">{loc(fun.habit, lang)}</p>}
            </div>
          ))}
          <div className="mt-1.5 grid grid-cols-2 gap-1.5 text-[10px] font-bold">
            <span className="px-2 py-1 rounded-md bg-slate-900/5 truncate">
              {tt('weakness', lang)} · {loc(TYPES[info.clash].name, lang)} +20
            </span>
            <span className="px-2 py-1 rounded-md bg-slate-900/5 truncate">
              {tt('retreat', lang)} {'●'.repeat(face.homesick)}
            </span>
          </div>
          <p className="mt-1.5 px-2.5 py-1.5 rounded-lg text-[11.5px] font-bold leading-snug" style={{ background: theme.bg, color: '#1e1b2e' }}>
            “{loc(fun.roast, lang)}”
          </p>
          <div className="mt-1 flex justify-between text-[9px] text-slate-500">
            <span>Illus. Check East Point</span>
            <span>{tt('rarity', lang, { n: RARITY[typeKey] })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
