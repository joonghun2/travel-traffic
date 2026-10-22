'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/lib/i18n/context';
import Link from 'next/link';
import { CityId, LiveSpotMetric } from '@/types';
import type { MapCamera } from '@/lib/jejuCameras';
import { MAP_THEMES, MapSpot, MapThemeId, matchesTheme, rankByPopularity } from '@/lib/mapSpots';
import { calculateDistanceKm } from '@/lib/geoUtils';
import DashboardHeader from '@/components/DashboardHeader';
import BottomNav from '@/components/BottomNav';
import SpotList from './SpotList';
import SpotSheet from './SpotSheet';

const KakaoAdfitBanner = dynamic(() => import('@/components/KakaoAdfitBanner'), { ssr: false });

// Kakao AdFit units shown with the spot card: 300x250 beside it on PC, 320x100 under it on mobile.
const AD_UNIT_PC = 'DAN-dtTgaQki8TeayQUI';
const AD_UNIT_MOBILE = 'DAN-3AoY158moOHDzJXk';

// PC list panel width: draggable, remembered per browser.
const LIST_W = { min: 200, max: 480, default: 260, storageKey: 'cep_list_width' };

function useListWidth() {
  const [width, setWidth] = useState(LIST_W.default);
  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(LIST_W.storageKey));
      if (saved >= LIST_W.min && saved <= LIST_W.max) setWidth(saved);
    } catch {}
  }, []);
  const update = useCallback((w: number) => {
    const next = Math.round(Math.min(LIST_W.max, Math.max(LIST_W.min, w)));
    setWidth(next);
    try {
      localStorage.setItem(LIST_W.storageKey, String(next));
    } catch {}
  }, []);
  return [width, update] as const;
}

/** true on >=1024px, false below, null before mount. AdFit skips hidden slots, so only the visible ad is mounted. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isDesktop;
}

// The map is loaded after first paint so it never blocks LCP; the list renders first.
const CrowdMap = dynamic(() => import('./CrowdMap'), {
  ssr: false,
  loading: () => <MapPlaceholder />,
});

function MapPlaceholder() {
  const { t } = useTranslation();
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-sm text-gray-500">
      {t('map.loading')}
    </div>
  );
}

// Per-city map centre, "inside the city" bounds and the fallback point (city hall).
export const CITY_CONFIG: Record<CityId, { center: [number, number]; hall: { lat: number; lng: number }; bounds: { south: number; north: number; west: number; east: number }; path: string }> = {
  seoul: { center: [126.985, 37.552], hall: { lat: 37.5663, lng: 126.9779 }, bounds: { south: 37.41, north: 37.72, west: 126.76, east: 127.19 }, path: '/' },
  jeju: { center: [126.55, 33.38], hall: { lat: 33.4996, lng: 126.5312 }, bounds: { south: 33.1, north: 33.6, west: 126.1, east: 127.0 }, path: '/jeju' },
  busan: { center: [129.075, 35.16], hall: { lat: 35.1798, lng: 129.075 }, bounds: { south: 34.9, north: 35.4, west: 128.75, east: 129.35 }, path: '/busan' },
};
const LOCATE_TIMEOUT_MS = 4000;

type LocateIssue = 'map.loc.denied' | 'map.loc.timeout' | 'map.loc.outside';

interface Props {
  city: CityId;
  initialSpots: MapSpot[];
  liveCount: number;
  /** Forecast cities: first forecast date and whether the fallback snapshot is shown. */
  baseDate?: string | null;
  fromSnapshot?: boolean;
  /** Jeju: safety cameras behind the CCTV chip. */
  cameras?: MapCamera[];
}

function MapSearch({ spots, onPick, className = '' }: { spots: MapSpot[]; onPick: (id: number) => void; className?: string }) {
  const { t } = useTranslation();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    return query ? spots.filter((s) => s.searchText.includes(query) || s.name.toLowerCase().includes(query)).slice(0, 8) : [];
  }, [q, spots]);

  const pick = (id: number) => {
    onPick(id);
    setQ('');
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => e.key === 'Enter' && results[0] && pick(results[0].id)}
        placeholder={t('map.searchPlaceholder')}
        aria-label={t('map.searchPlaceholder')}
        className="w-full h-11 pl-10 pr-4 rounded-2xl bg-gray-100 dark:bg-gray-900 border border-transparent focus:border-blue-400 focus:bg-white dark:focus:bg-gray-900 outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
      />
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">🔍</span>
      {open && results.length > 0 && (
        <ul className="absolute z-40 mt-1 w-full rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
          {results.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(s.id)}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 cursor-pointer"
              >
                <span aria-hidden="true">{s.emoji}</span>
                <span className="flex-1 truncate text-gray-800 dark:text-gray-100">{s.name}</span>
                <span className="text-xs text-gray-400 tabular-nums">{s.score}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function MapHome({ city, initialSpots, liveCount, baseDate, fromSnapshot, cameras }: Props) {
  const { lang, t, localePath } = useTranslation();
  const cfg = CITY_CONFIG[city];
  const isDesktop = useIsDesktop();
  const [listWidth, setListWidth] = useListWidth();
  const gridRef = useRef<HTMLDivElement>(null);

  const startResize = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const left = gridRef.current?.getBoundingClientRect().left ?? 0;
    const move = (ev: PointerEvent) => setListWidth(ev.clientX - left);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  const isLiveCity = city === 'seoul';
  const [spots, setSpots] = useState(initialSpots);
  const [theme, setTheme] = useState<MapThemeId>('all');
  const [showCameras, setShowCameras] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [focus, setFocus] = useState<{ lat: number; lng: number; zoom?: number; ts: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<LocateIssue | null>(null);

  // Keep Seoul scores fresh (the server snapshot is at most 5 minutes old). Forecasts change daily.
  useEffect(() => {
    if (!isLiveCity) return;
    const refresh = async () => {
      try {
        const res = await fetch('/api/crowd', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const byId = new Map((data.spots as LiveSpotMetric[]).map((s) => [s.id, s]));
        setSpots((prev) =>
          prev.map((s) => {
            const live = byId.get(s.id);
            return live
              ? { ...s, score: live.currentScore, status: live.status, wait: live.waitTimeMinutes, isLive: Boolean(live.isLive) }
              : s;
          })
        );
      } catch {}
    };
    refresh();
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [isLiveCity]);

  const visible = useMemo(() => spots.filter((s) => matchesTheme(s, theme)), [spots, theme]);

  const distances = useMemo(() => {
    if (!userLocation) return null;
    return new Map(spots.map((s) => [s.id, calculateDistanceKm(userLocation.lat, userLocation.lng, s.lat, s.lng)]));
  }, [spots, userLocation]);

  const ordered = useMemo(
    () => (distances ? [...visible].sort((a, b) => distances.get(a.id)! - distances.get(b.id)!) : rankByPopularity(visible)),
    [visible, distances]
  );

  const selected = spots.find((s) => s.id === selectedId) ?? null;

  const selectAndFocus = useCallback(
    (id: number) => {
      const s = spots.find((x) => x.id === id);
      if (!s) return;
      setSelectedId(id);
      setFocus({ lat: s.lat, lng: s.lng, ts: Date.now() });
    },
    [spots]
  );

  // Location stays in the browser: it is never sent to the server or stored.
  const locate = useCallback(() => {
    const fallbackTo = (issue: LocateIssue) => {
      setNotice(issue);
      setUserLocation(cfg.hall);
    };
    const finish = (loc: { lat: number; lng: number }) => {
      setLocating(false);
      setUserLocation(loc);
      const nearest = [...visible].sort(
        (a, b) => calculateDistanceKm(loc.lat, loc.lng, a.lat, a.lng) - calculateDistanceKm(loc.lat, loc.lng, b.lat, b.lng)
      )[0];
      if (nearest) setSelectedId(nearest.id);
      setFocus({ ...loc, zoom: 14, ts: Date.now() });
    };

    if (!navigator.geolocation) {
      fallbackTo('map.loc.denied');
      finish(cfg.hall);
      return;
    }
    setLocating(true);
    setNotice(null);
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      fallbackTo('map.loc.timeout');
      finish(cfg.hall);
    }, LOCATE_TIMEOUT_MS);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const b = cfg.bounds;
        const inCity = loc.lat >= b.south && loc.lat <= b.north && loc.lng >= b.west && loc.lng <= b.east;
        if (!inCity) {
          fallbackTo('map.loc.outside');
          finish(cfg.hall);
        } else {
          finish(loc);
        }
      },
      (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        fallbackTo(err.code === err.PERMISSION_DENIED ? 'map.loc.denied' : 'map.loc.timeout');
        finish(cfg.hall);
      },
      { enableHighAccuracy: false, timeout: LOCATE_TIMEOUT_MS, maximumAge: 60000 }
    );
  }, [visible, cfg]);

  // "내 주변" tab links to /?near=1.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('near') === '1') locate();
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(id);
  }, [notice]);

  const mapLabels = useMemo(
    () => ({
      zoomIn: t('map.zoomIn'),
      zoomOut: t('map.zoomOut'),
      locate: t('map.locate'),
      cluster: t('map.cluster'),
      estimate: t('map.estimate'),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang]
  );

  const cameraLabels = useMemo(
    () => ({ view: t('cctv.view'), angles: t('cctv.angles'), near: t('cctv.near'), source: t('cctv.source') }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang]
  );

  const listTitle = distances ? t('map.list.nearby') : t('map.list.popular');

  const cityTabs = (
    <nav className="flex items-center gap-1.5 shrink-0" aria-label={t('map.pageTitle')}>
      {(Object.keys(CITY_CONFIG) as CityId[]).map((c) => (
        <Link
          key={c}
          href={localePath(CITY_CONFIG[c].path)}
          aria-current={c === city ? 'page' : undefined}
          className={`h-8 px-3 rounded-full text-xs font-bold flex items-center whitespace-nowrap ${
            c === city
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {t(`map.city.${c}`)}
          {c === 'seoul' ? (
            <span className="ml-1 text-[9px] font-black text-emerald-500">LIVE</span>
          ) : (
            <span className="ml-1 px-1 py-px rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-[9px]">
              {t('forecast.badge')}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );

  const forecastBanner = !isLiveCity && baseDate && (
    <p className="text-[11px] text-gray-500 dark:text-gray-400">
      <span className="px-1.5 py-0.5 mr-1 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-bold">{t('forecast.badge')}</span>
      {fromSnapshot ? t('forecast.snapshotNote').replace('{date}', baseDate) : t('forecast.baseDate').replace('{date}', baseDate)}
      {' · '}
      {t('forecast.source')}
      {cameras && (
        <>
          {' · '}
          <Link href={localePath('/jeju/cctv')} className="font-semibold text-blue-600 hover:underline">
            📹 {t('cctv.title')}
          </Link>
        </>
      )}
    </p>
  );

  const themeChips = (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
      {MAP_THEMES.map((th) => (
        <button
          key={th.id}
          type="button"
          onClick={() => setTheme(th.id)}
          aria-pressed={theme === th.id}
          className={`h-8 px-3 rounded-full text-xs font-semibold whitespace-nowrap border transition cursor-pointer ${
            theme === th.id
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-gray-400'
          }`}
        >
          <span aria-hidden="true">{th.icon}</span> {t(`map.theme.${th.id}`)}
        </button>
      ))}
      {cameras && (
        <button
          type="button"
          onClick={() => setShowCameras((v) => !v)}
          aria-pressed={showCameras}
          className={`h-8 px-3 rounded-full text-xs font-semibold whitespace-nowrap border transition cursor-pointer ${
            showCameras
              ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900'
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-gray-400'
          }`}
        >
          <span aria-hidden="true">📹</span> {t('map.cctv')}
        </button>
      )}
    </div>
  );

  const legend = (
    <div className="absolute top-3 left-3 z-10 px-2.5 py-1.5 rounded-xl bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 shadow-md flex items-center gap-2.5 text-[11px] font-semibold text-gray-700 dark:text-gray-200" aria-label={t('map.legend')}>
      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />{t('card.status.relaxed')}</span>
      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" aria-hidden="true" />{t('card.status.moderate')}</span>
      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-500" aria-hidden="true" />{t('card.status.crowded')}</span>
    </div>
  );

  const map = (
    <CrowdMap
      spots={visible}
      selectedId={selectedId}
      onSelect={setSelectedId}
      userLocation={userLocation}
      focus={focus}
      lang={lang}
      center={cfg.center}
      labels={mapLabels}
      cameras={showCameras ? cameras : undefined}
      cameraLabels={cameraLabels}
      spotHref={(slug) => localePath(`/spot/${slug}`)}
      onLocate={locate}
      locating={locating}
    />
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-16 lg:pb-0">
      <DashboardHeader connectedCount={liveCount} live={isLiveCity} center={<MapSearch spots={spots} onPick={selectAndFocus} className="w-full" />} />
      <h1 className="sr-only">{city === 'seoul' ? t('map.pageTitle') : t('forecast.hubName').replace('{city}', t(`map.city.${city}`))}</h1>

      {/* Mobile: search, city tabs, theme chips */}
      <div className="lg:hidden px-4 pt-3 space-y-2.5">
        <MapSearch spots={spots} onPick={selectAndFocus} />
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">{cityTabs}</div>
        {themeChips}
        {forecastBanner}
      </div>

      {/* PC: city tabs | theme chips */}
      <div className="hidden lg:flex items-center gap-3 px-6 py-2.5 border-b border-gray-100 dark:border-gray-800">
        {cityTabs}
        <span className="w-px h-5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
        {themeChips}
        {forecastBanner && <div className="ml-auto shrink-0">{forecastBanner}</div>}
      </div>

      <div
        ref={gridRef}
        style={{ '--list-w': `${listWidth}px` } as React.CSSProperties}
        className="relative lg:grid lg:grid-cols-[var(--list-w)_1fr] lg:h-[calc(100vh-7.75rem)]"
      >
        {/* Map (right on PC) */}
        <div className="relative mt-3 lg:mt-0 h-[58vh] min-h-[340px] lg:h-full lg:order-2 overflow-hidden">
          {map}
          {legend}
          {selected && (
            <SpotSheet
              spot={selected}
              distanceKm={distances?.get(selected.id)}
              onClose={() => setSelectedId(null)}
              className="hidden lg:block absolute bottom-6 left-4 z-20 w-80 rounded-2xl"
            />
          )}
          {selected && isDesktop && (
            <aside
              aria-label="AD"
              className="absolute bottom-6 left-[21.5rem] z-20 w-[300px] rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl"
            >
              <KakaoAdfitBanner unit={AD_UNIT_PC} width="300" height="250" />
            </aside>
          )}
        </div>

        {/* Ranked list (left on PC, below the map on mobile) */}
        <SpotList
          spots={ordered}
          title={listTitle}
          selectedId={selectedId}
          onSelect={selectAndFocus}
          distances={distances}
          className="lg:order-1 lg:h-full lg:overflow-y-auto lg:border-r border-gray-100 dark:border-gray-800"
        />

        {/* Drag (or arrow keys) to resize the list on PC; double-click resets. */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={t('map.resizeList')}
          aria-valuemin={LIST_W.min}
          aria-valuemax={LIST_W.max}
          aria-valuenow={listWidth}
          tabIndex={0}
          onPointerDown={startResize}
          onDoubleClick={() => setListWidth(LIST_W.default)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') setListWidth(listWidth - 20);
            if (e.key === 'ArrowRight') setListWidth(listWidth + 20);
          }}
          style={{ left: listWidth - 4 }}
          className="hidden lg:block absolute top-0 bottom-0 z-30 w-2 cursor-col-resize group focus:outline-none"
        >
          <span className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-transparent group-hover:bg-blue-400 group-focus-visible:bg-blue-500 transition-colors" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-10 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-400" />
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {selected && (
        <div className="lg:hidden fixed left-0 right-0 bottom-16 z-30">
          <SpotSheet spot={selected} distanceKm={distances?.get(selected.id)} onClose={() => setSelectedId(null)} className="rounded-t-3xl" />
          {isDesktop === false && (
            <aside aria-label="AD" className="bg-white dark:bg-gray-900 border-x border-gray-200 dark:border-gray-800 flex justify-center py-1">
              <KakaoAdfitBanner unit={AD_UNIT_MOBILE} width="320" height="100" />
            </aside>
          )}
        </div>
      )}

      {notice && (
        <div role="status" className="fixed z-40 left-1/2 -translate-x-1/2 top-20 max-w-[90vw] px-4 py-2.5 rounded-2xl bg-gray-900/95 text-white text-xs font-medium shadow-xl text-center">
          {t(notice).replace('{place}', t(`map.cityHall.${city}`))}
          <div className="mt-0.5 text-[10px] text-gray-300">{t('map.loc.privacy')}</div>
        </div>
      )}

      <BottomNav onNearbyClick={locate} isNearbyActive={Boolean(userLocation)} />
    </div>
  );
}
