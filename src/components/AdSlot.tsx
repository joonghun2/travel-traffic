'use client';

import dynamic from 'next/dynamic';
import { useTranslation } from '@/lib/i18n/context';
import { airaloKoreaLink, klookSearchLink } from '@/lib/affiliate';
import { Lang } from '@/types';

const KakaoAdfitBanner = dynamic(() => import('./KakaoAdfitBanner'), { ssr: false });

type ForeignLang = Exclude<Lang, 'ko'>;

const TEXT: Record<ForeignLang, { klook: string; klookSub: string; esim: string; esimSub: string; disclosure: string }> = {
  en: {
    klook: 'Tours & tickets: {q}',
    klookSub: 'Skip-the-line deals on Klook',
    esim: 'Korea eSIM',
    esimSub: 'Data from landing (Airalo)',
    disclosure: 'Affiliate links: we may earn a small commission at no extra cost to you.',
  },
  ja: {
    klook: '{q}のツアー・チケット',
    klookSub: 'Klookでお得に予約',
    esim: '韓国旅行用eSIM',
    esimSub: '到着後すぐ使える（Airalo）',
    disclosure: 'アフィリエイトリンクです。料金は変わりません。',
  },
  'zh-cn': {
    klook: '{q} 门票与一日游',
    klookSub: '在 Klook 比较优惠',
    esim: '韩国旅行 eSIM',
    esimSub: '落地即可上网（Airalo）',
    disclosure: '推广链接：本站可能获得少量佣金，价格不变。',
  },
  'zh-tw': {
    klook: '{q} 門票與一日遊',
    klookSub: '在 Klook 比較優惠',
    esim: '韓國旅行 eSIM',
    esimSub: '落地即可上網（Airalo）',
    disclosure: '推廣連結：本站可能獲得少量佣金，價格不變。',
  },
};

const linkCls =
  'flex items-center justify-between gap-3 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-left';

interface AdSlotProps {
  /** Kakao AdFit unit shown to Korean visitors. */
  unit: string;
  width: string;
  height: string;
  /** English search term for the Klook link shown to foreign-language visitors, e.g. "Seoul food tour". */
  query: string;
  /** Travelpayouts sub_id, to see which placement earns (e.g. "play-travel-type"). */
  subId: string;
  className?: string;
}

/**
 * One ad placement that follows the page language: Korean pages show Kakao AdFit, other languages
 * show Travelpayouts links (Klook tours for `query`, plus a Korea eSIM) in roughly the same space.
 */
export default function AdSlot({ unit, width, height, query, subId, className = '' }: AdSlotProps) {
  const { lang } = useTranslation();
  if (lang === 'ko') return <KakaoAdfitBanner unit={unit} width={width} height={height} className={className} />;

  const text = TEXT[lang as ForeignLang] ?? TEXT.en;
  const compact = Number(height) < 150;
  const esim = airaloKoreaLink(lang, subId);
  return (
    <aside
      aria-label="Travel deals"
      className={`w-full max-w-[320px] mx-auto space-y-2 ${className}`}
      style={{ minHeight: compact ? undefined : `${height}px` }}
    >
      <a href={klookSearchLink(query, subId)} target="_blank" rel="sponsored noopener noreferrer" className={linkCls} suppressHydrationWarning>
        <span>
          <span className="block text-sm font-bold text-gray-800 dark:text-gray-100">🎟️ {text.klook.replace('{q}', query)}</span>
          <span className="block text-xs text-gray-500 dark:text-gray-400">{text.klookSub}</span>
        </span>
        <span className="text-gray-400" aria-hidden="true">↗</span>
      </a>
      {!compact && esim && (
        <a href={esim} target="_blank" rel="sponsored noopener noreferrer" className={linkCls} suppressHydrationWarning>
          <span>
            <span className="block text-sm font-bold text-gray-800 dark:text-gray-100">📶 {text.esim}</span>
            <span className="block text-xs text-gray-500 dark:text-gray-400">{text.esimSub}</span>
          </span>
          <span className="text-gray-400" aria-hidden="true">↗</span>
        </a>
      )}
      {!compact && <p className="text-[11px] text-gray-400 text-center">{text.disclosure}</p>}
    </aside>
  );
}
