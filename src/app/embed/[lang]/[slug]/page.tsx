import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CrowdStatus, Lang } from '@/types';
import { SITE_URL, isLang, localizePath, pick } from '@/lib/i18n/routing';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { getSpotBySlug } from '@/lib/spots';
import { getForecastSpotBySlug } from '@/lib/forecastSpots';
import { getCrowdSnapshot } from '@/lib/crowdSnapshot';
import { getForecast, statusOfRate, todayOf } from '@/lib/forecast';
import { STATUS_COLOR } from '@/lib/mapSpots';
import { withUtm } from '@/lib/utm';

// /embed/<lang>/<slug>?theme=dark — the iframe badge from /widget.
// Rendered on first request, then refreshed every 5 minutes (Seoul is live).
export const revalidate = 300;
export const preferredRegion = 'icn1';

export function generateStaticParams() {
  return [];
}

export const metadata: Metadata = { robots: { index: false, follow: true } };

const tr = (lang: Lang, key: string) => TRANSLATIONS[lang][key] ?? TRANSLATIONS.en[key] ?? key;

// Theme is read in the browser so the page itself stays cacheable.
const THEME_SCRIPT = `if(new URLSearchParams(location.search).get('theme')==='dark')document.documentElement.dataset.theme='dark'`;

const CSS = `
:root{--bg:#ffffff;--fg:#0f172a;--muted:#64748b;--line:#e2e8f0;--track:#f1f5f9}
:root[data-theme=dark]{--bg:#0f172a;--fg:#f8fafc;--muted:#94a3b8;--line:#1e293b;--track:#1e293b}
.cep{box-sizing:border-box;display:block;height:100vh;max-height:160px;padding:14px 16px;border:1px solid var(--line);border-radius:16px;
background:var(--bg);color:var(--fg);font:14px/1.35 system-ui,-apple-system,"Segoe UI","Apple SD Gothic Neo","Noto Sans KR","Noto Sans JP","Noto Sans SC",sans-serif;text-decoration:none;overflow:hidden}
.top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.name{font-weight:700;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tag{flex-shrink:0;font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;border:1px solid currentColor}
.row{display:flex;align-items:baseline;gap:8px;margin-top:8px}
.score{font-size:28px;font-weight:800}
.status{font-weight:700}
.bar{height:6px;border-radius:99px;background:var(--track);margin-top:8px;overflow:hidden}
.bar i{display:block;height:100%;border-radius:99px}
.foot{margin-top:8px;font-size:11px;color:var(--muted)}
`;

export default async function EmbedPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const spot = getSpotBySlug(slug);
  const fSpot = getForecastSpotBySlug(slug);
  if (!spot && !fSpot) notFound();

  let score: number, status: CrowdStatus, tag: string;
  if (spot) {
    const m = (await getCrowdSnapshot()).spots.find((s) => s.id === spot.id);
    score = m?.currentScore ?? 50;
    status = m?.status ?? 'moderate';
    tag = tr(lang, 'widget.live');
  } else {
    score = Math.round(todayOf((await getForecast()).spots[fSpot!.id])?.rate ?? 50);
    status = statusOfRate(score);
    tag = tr(lang, 'widget.today');
  }
  const name = pick((spot ?? fSpot)!.name, lang);
  const color = STATUS_COLOR[status];
  const href = withUtm(`${SITE_URL}${localizePath(`/spot/${slug}`, lang)}`, { source: 'embed', medium: 'widget', campaign: 'badge', content: slug });

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <a className="cep" href={href} target="_blank" rel="noopener">
        <div className="top">
          <span className="name">{name}</span>
          <span className="tag" style={{ color }}>{tag}</span>
        </div>
        <div className="row">
          <span className="score" style={{ color }}>{score}</span>
          <span className="status" style={{ color }}>{tr(lang, `card.status.${status}`)}</span>
        </div>
        <div className="bar">
          <i style={{ width: `${Math.max(4, score)}%`, background: color }} />
        </div>
        <div className="foot">{tr(lang, 'widget.powered')} →</div>
      </a>
    </>
  );
}
