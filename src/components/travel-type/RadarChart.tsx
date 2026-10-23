'use client';

import { useEffect, useState } from 'react';
import { STATS, Stats } from '@/lib/travelType';

interface Props {
  stats: Stats;
  labels: Record<string, string>;
  accent: string;
  soft: string;
  /** Optional second shape (friend comparison), drawn dashed. */
  compare?: Stats;
  compareColor?: string;
  className?: string;
}

const CX = 160;
const CY = 150;
const R = 100;
const point = (i: number, r: number) => {
  const a = -Math.PI / 2 + (i * Math.PI) / 3;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)] as const;
};
const polygon = (values: number[], k: number) => values.map((v, i) => point(i, (R * v * k) / 100).join(',')).join(' ');

/** Six-stat hexagon that grows from the centre on mount (ease-out, ~1.1s). */
export default function RadarChart({ stats, labels, accent, soft, compare, compareColor = '#64748b', className = '' }: Props) {
  const [k, setK] = useState(0);
  const key = STATS.map((s) => stats[s]).join('-') + (compare ? STATS.map((s) => compare[s]).join('-') : '');

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setK(1);
      return;
    }
    let raf = 0;
    let start = 0;
    const step = (ts: number) => {
      start ||= ts;
      const t = Math.min(1, (ts - start) / 1100);
      setK(1 - Math.pow(1 - t, 3));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    setK(0);
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [key]);

  const values = STATS.map((s) => stats[s]);
  return (
    <svg viewBox="0 0 320 300" className={className} role="img" aria-label={STATS.map((s) => `${labels[s]} ${stats[s]}`).join(', ')}>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon key={f} points={polygon([100, 100, 100, 100, 100, 100], f)} fill="none" stroke="currentColor" strokeOpacity={0.15} strokeWidth={1} />
      ))}
      {STATS.map((s, i) => {
        const [x, y] = point(i, R);
        return <line key={s} x1={CX} y1={CY} x2={x} y2={y} stroke="currentColor" strokeOpacity={0.15} strokeWidth={1} />;
      })}
      {compare && (
        <polygon
          points={polygon(STATS.map((s) => compare[s]), k)}
          fill={compareColor}
          fillOpacity={0.12}
          stroke={compareColor}
          strokeWidth={2}
          strokeDasharray="5 4"
        />
      )}
      <polygon points={polygon(values, k)} fill={soft} fillOpacity={0.7} stroke={accent} strokeWidth={2.5} strokeLinejoin="round" />
      {values.map((v, i) => {
        const [x, y] = point(i, (R * v * k) / 100);
        return <circle key={i} cx={x} cy={y} r={3.5} fill={accent} />;
      })}
      {STATS.map((s, i) => {
        const [x, y] = point(i, R + 24);
        return (
          <text key={s} x={x} y={y + 4} textAnchor="middle" fontSize={13} fontWeight={700} fill="currentColor" fillOpacity={0.75}>
            {labels[s]}
          </text>
        );
      })}
    </svg>
  );
}
