'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/lib/i18n/context';
import { LiveSpotMetric } from '@/types';
import { MAP_THEMES, MapSpot, MapThemeId, matchesTheme, rankByPopularity } from '@/lib/mapSpots';
import { calculateDistanceKm } from '@/lib/geoUtils';
import DashboardHeader from '@/components/DashboardHeader';
import BottomNav from '@/components/BottomNav';
import SpotList from './SpotList';
import SpotSheet from './SpotSheet';

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

const CITY_HALL = { lat: 37.5663, lng: 126.9779 };
const SEOUL_BOUNDS = { south: 37.41, north: 37.72, west: 126.76, east: 127.19 };
const LOCATE_TIMEOUT_MS = 4000;

type LocateIssue = 'map.loc.denied' | 'map.loc.timeout' | 'map.loc.outside';

interface Props {
  initialSpots: MapSpot[];
  liveCount: number;
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

export default function MapHome({ initialSpots, liveCount }: Props) {
  const { lang, t } = useTranslation();
  const [spots, setSpots] = useState(initialSpots);
  const [theme, setTheme] = useState<MapThemeId>('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [focus, setFocus] = useState<{ lat: number; lng: number; zoom?: number; ts: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<LocateIssue | null>(null);

  // Keep scores fresh (the server snapshot is at most 5 minutes old).
  useEffect(() => {
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
  }, []);

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
      setUserLocation(CITY_HALL);
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
      finish(CITY_HALL);
      return;
    }
    setLocating(true);
    setNotice(null);
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      fallbackTo('map.loc.timeout');
      finish(CITY_HALL);
    }, LOCATE_TIMEOUT_MS);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const inSeoul =
          loc.lat >= SEOUL_BOUNDS.south && loc.lat <= SEOUL_BOUNDS.north && loc.lng >= SEOUL_BOUNDS.west && loc.lng <= SEOUL_BOUNDS.east;
        if (!inSeoul) {
          fallbackTo('map.loc.outside');
          finish(CITY_HALL);
        } else {
          finish(loc);
        }
      },
      (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        fallbackTo(err.code === err.PERMISSION_DENIED ? 'map.loc.denied' : 'map.loc.timeout');
        finish(CITY_HALL);
      },
      { enableHighAccuracy: false, timeout: LOCATE_TIMEOUT_MS, maximumAge: 60000 }
    );
  }, [visible]);

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

  const listTitle = distances ? t('map.list.nearby') : t('map.list.popular');

  const cityTabs = (
    <div className="flex items-center gap-1.5 shrink-0" role="tablist" aria-label={t('map.pageTitle')}>
      <button type="button" role="tab" aria-selected="true" className="h-8 px-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold">
        {t('map.city.seoul')} <span className="ml-0.5 text-[9px] font-black text-emerald-400 dark:text-emerald-600">LIVE</span>
      </button>
      {(['jeju', 'busan'] as const).map((city) => (
        <button
          key={city}
          type="button"
          role="tab"
          aria-selected="false"
          disabled
          title={t('map.comingSoon')}
          className="h-8 px-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 text-xs font-bold cursor-not-allowed"
        >
          {t(`map.city.${city}`)}
          <span className="ml-1 px-1 py-px rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-[9px]">
            {t('map.forecast')}
          </span>
        </button>
      ))}
    </div>
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
      labels={mapLabels}
      onLocate={locate}
      locating={locating}
    />
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-16 lg:pb-0">
      <DashboardHeader connectedCount={liveCount} center={<MapSearch spots={spots} onPick={selectAndFocus} className="w-full" />} />
      <h1 className="sr-only">{t('map.pageTitle')}</h1>

      {/* Mobile: search, city tabs, theme chips */}
      <div className="lg:hidden px-4 pt-3 space-y-2.5">
        <MapSearch spots={spots} onPick={selectAndFocus} />
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">{cityTabs}</div>
        {themeChips}
      </div>

      {/* PC: city tabs | theme chips */}
      <div className="hidden lg:flex items-center gap-3 px-6 py-2.5 border-b border-gray-100 dark:border-gray-800">
        {cityTabs}
        <span className="w-px h-5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
        {themeChips}
      </div>

      <div className="lg:grid lg:grid-cols-[210px_1fr] lg:h-[calc(100vh-7.75rem)]">
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
      </div>

      {/* Mobile bottom sheet */}
      {selected && (
        <SpotSheet
          spot={selected}
          distanceKm={distances?.get(selected.id)}
          onClose={() => setSelectedId(null)}
          className="lg:hidden fixed left-0 right-0 bottom-16 z-30 rounded-t-3xl"
        />
      )}

      {notice && (
        <div role="status" className="fixed z-40 left-1/2 -translate-x-1/2 top-20 max-w-[90vw] px-4 py-2.5 rounded-2xl bg-gray-900/95 text-white text-xs font-medium shadow-xl text-center">
          {t(notice)}
          <div className="mt-0.5 text-[10px] text-gray-300">{t('map.loc.privacy')}</div>
        </div>
      )}

      <BottomNav onNearbyClick={locate} isNearbyActive={Boolean(userLocation)} />
    </div>
  );
}
