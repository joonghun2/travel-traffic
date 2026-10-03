'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Spot,
  LiveSpotMetric,
  SeoulDistrict,
  SpotCategory,
} from '@/types';
import { SPOTS_DATA } from '@/data/spotsData';
import { computeLiveSpotMetric } from '@/lib/crowdEngine';
import { useTranslation } from '@/lib/i18n/context';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  calculateDistanceKm,
  estimateWalkMinutes,
  estimateTransitMinutes,
} from '@/lib/geoUtils';

import dynamic from 'next/dynamic';
import DashboardHeader from '@/components/DashboardHeader';
import SpotSearchAutocomplete from '@/components/SpotSearchAutocomplete';
import DistrictTabs from '@/components/DistrictTabs';
import CrowdCard from '@/components/CrowdCard';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';

const NativeInFeedAdCard = dynamic(() => import('@/components/NativeInFeedAdCard'), {
  ssr: false,
});
const BannerAd = dynamic(() => import('@/components/BannerAd'), {
  ssr: false,
});

export default function Home() {
  const { t, lang } = useTranslation();

  // Baseline spots metric state
  const [spots, setSpots] = useState<LiveSpotMetric[]>(() =>
    SPOTS_DATA.map((s: Spot) => computeLiveSpotMetric(s))
  );

  // Filter & sort states
  const [activeDistrict, setActiveDistrict] = useState<SeoulDistrict>('all');
  const [activeCategory, setActiveCategory] = useState<SpotCategory>('all');
  const [crowdFilter, setCrowdFilter] = useState<'all' | 'safe' | 'warning'>('all');
  const [searchSelectedSpotId, setSearchSelectedSpotId] = useState<number | null>(null);

  // User Geolocation state
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationErrorKey, setLocationErrorKey] = useState<string | null>(null);
  const [sortByDistance, setSortByDistance] = useState<boolean>(false);

  // Data source & API connection tracker
  const [dataSource, setDataSource] = useState<{
    type: string;
    spotsConnected: number;
  }>({
    type: 'LIVE_API',
    spotsConnected: 0,
  });

  const spotListRef = useRef<HTMLDivElement>(null);

  // 1. Request user geolocation
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationErrorKey('location.unsupported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationErrorKey(null);
        setSortByDistance(true); // Automatically sort by distance when granted
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setLocationErrorKey('location.permission_prompt');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Try auto-fetching location if permission already granted
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.permissions
        ?.query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          if (result.state === 'granted') {
            handleRequestLocation();
          }
        })
        .catch(() => {});
    }
  }, []);

  // 2. Fetch live crowd data from server API (with Seoul Open Data API)
  useEffect(() => {
    const fetchCrowdData = async () => {
      try {
        const res = await fetch('/api/crowd', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.spots && Array.isArray(data.spots)) {
            setSpots(data.spots);
          }
          if (data.dataSource?.seoul) {
            setDataSource({
              type: data.dataSource.seoul.type,
              spotsConnected: data.dataSource.seoul.spotsConnected || 0,
            });
          }
        }
      } catch (err) {
        console.warn('API crowd fetch failed, using fallback metrics:', err);
      }
    };

    fetchCrowdData();
    const interval = setInterval(fetchCrowdData, 60000); // 60s live poll

    // Supabase Realtime sync if configured
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const channel = client
        .channel('public:crowd_metrics')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'crowd_metrics' },
          (payload) => {
            const updated = payload.new as {
              spot_id: number;
              current_score: number;
              status_level: 'relaxed' | 'moderate' | 'packed';
              wait_time_minutes: number;
              surge_alert: boolean;
            };

            setSpots((prev) =>
              prev.map((s) => {
                if (s.id === updated.spot_id) {
                  return {
                    ...s,
                    currentScore: updated.current_score,
                    status: updated.status_level,
                    waitTimeMinutes: updated.wait_time_minutes,
                    surgeAlert: updated.surge_alert,
                  };
                }
                return s;
              })
            );
          }
        )
        .subscribe();

      return () => {
        clearInterval(interval);
        client.removeChannel(channel);
      };
    }

    return () => clearInterval(interval);
  }, []);

  // 3. Inject computed distance and travel times into spots
  const spotsWithDistance = useMemo(() => {
    return spots.map((spot) => {
      if (!userLocation) return spot;
      const distanceKm = calculateDistanceKm(
        userLocation.lat,
        userLocation.lng,
        spot.lat,
        spot.lng
      );
      return {
        ...spot,
        distanceKm,
        walkTimeMinutes: estimateWalkMinutes(distanceKm),
        transitTimeMinutes: estimateTransitMinutes(distanceKm),
      };
    });
  }, [spots, userLocation]);

  // 4. Filter and sort spots
  const displaySpots = useMemo(() => {
    let list = [...spotsWithDistance];

    // District filter
    if (activeDistrict !== 'all') {
      list = list.filter((s) => s.district === activeDistrict);
    }

    // Category filter
    if (activeCategory !== 'all') {
      list = list.filter((s) => s.category === activeCategory);
    }

    // Crowd status filter
    if (crowdFilter === 'safe') {
      list = list.filter((s) => s.status === 'relaxed');
    } else if (crowdFilter === 'warning') {
      list = list.filter((s) => s.status === 'packed');
    }

    // Sorting
    if (sortByDistance && userLocation) {
      list.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
    } else {
      // Default: highlight searched spot first, then sort by lower crowd score
      list.sort((a, b) => {
        if (searchSelectedSpotId) {
          if (a.id === searchSelectedSpotId) return -1;
          if (b.id === searchSelectedSpotId) return 1;
        }
        return a.currentScore - b.currentScore;
      });
    }

    return list;
  }, [
    spotsWithDistance,
    activeDistrict,
    activeCategory,
    crowdFilter,
    sortByDistance,
    userLocation,
    searchSelectedSpotId,
  ]);

  // Calm spots highlight (Top 4 spots with lowest crowd score)
  const calmSpots = useMemo(() => {
    return [...spotsWithDistance]
      .filter((s) => s.status === 'relaxed' || s.status === 'moderate')
      .sort((a, b) => a.currentScore - b.currentScore)
      .slice(0, 4);
  }, [spotsWithDistance]);

  // 5. Progressive rendering: initial 18 cards to keep initial DOM < 600 nodes and LCP blazing fast
  const [visibleCount, setVisibleCount] = useState<number>(18);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset visibleCount whenever filters or sort change
  useEffect(() => {
    setVisibleCount(18);
  }, [activeDistrict, activeCategory, crowdFilter, sortByDistance, searchSelectedSpotId]);

  // Progressive infinite scroll loading via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 18, displaySpots.length));
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [displaySpots.length]);

  const visibleSpots = useMemo(() => {
    return displaySpots.slice(0, visibleCount);
  }, [displaySpots, visibleCount]);

  // Handle autocomplete spot selection
  const handleSelectSpot = (spot: LiveSpotMetric) => {
    setSearchSelectedSpotId(spot.id);
    setActiveDistrict('all');
    setActiveCategory('all');
    setCrowdFilter('all');
    setVisibleCount(18);
    // Scroll to spot card
    setTimeout(() => {
      spotListRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <DashboardHeader
        dataSourceType={dataSource.type}
        connectedCount={dataSource.spotsConnected}
      />

      {/* Hero & Search Section */}
      <section className="pt-6 sm:pt-10 pb-4 sm:pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold mb-2.5 border border-blue-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-radar absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          <span>{t('hero.badge')}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
          {t('hero.title')}
        </h1>
        <p className="mt-2 text-xs sm:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          {t('hero.subtitle')}
        </p>

        {/* Search Autocomplete */}
        <div className="mt-4 sm:mt-6">
          <SpotSearchAutocomplete
            spots={spotsWithDistance}
            onSelectSpot={handleSelectSpot}
          />
        </div>

        {/* Location Notice / Error */}
        {locationErrorKey && (
          <div className="mt-2.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
            {t(locationErrorKey)}
          </div>
        )}

        {/* Figma Style Play Test Quick Launcher */}
        <div className="mt-4 sm:mt-6 max-w-xl mx-auto grid grid-cols-2 gap-2 sm:gap-2.5">
          <Link
            href="/play"
            className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-purple-950/40 via-purple-900/30 to-indigo-950/40 border border-purple-800/40 hover:border-purple-600/60 transition-all flex items-center gap-2.5 sm:gap-3 text-left group shadow-sm hover:shadow-md active:scale-95 duration-150"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#6b21a8] to-[#a855f7] flex items-center justify-center text-base sm:text-lg flex-shrink-0 shadow-xs">
              ✈️
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                {t('play.card2.title')}
              </div>
              <div className="text-[10px] text-gray-400 truncate">
                {t('play.card2.sub')}
              </div>
            </div>
            <span className="text-gray-500 group-hover:text-white text-xs pr-1">›</span>
          </Link>

          <Link
            href="/play"
            className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-teal-900/30 to-blue-950/40 border border-cyan-800/40 hover:border-cyan-600/60 transition-all flex items-center gap-2.5 sm:gap-3 text-left group shadow-sm hover:shadow-md active:scale-95 duration-150"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0891b2] to-[#22d3ee] flex items-center justify-center text-base sm:text-lg flex-shrink-0 shadow-xs">
              🌃
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                {t('play.card3.title')}
              </div>
              <div className="text-[10px] text-gray-400 truncate">
                {t('play.card3.sub')}
              </div>
            </div>
            <span className="text-gray-500 group-hover:text-white text-xs pr-1">›</span>
          </Link>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16" ref={spotListRef}>
        <h2 className="sr-only">{t('hero.title')} - {t('filter.count')}</h2>

        {/* Real-time Calm Spots Recommendation Strip */}
        {calmSpots.length > 0 && (
          <section className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/20 dark:border-emerald-500/30">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-xs">
                  {t('calm.badge')}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                  {t('calm.title')}
                </h3>
              </div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 hidden sm:inline">
                {t('calm.subtitle')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {calmSpots.map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => handleSelectSpot(spot)}
                  className="p-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 border border-emerald-100 dark:border-emerald-950/40 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all text-left shadow-xs hover:shadow-sm group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-1 w-full">
                    <span className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      {spot.name[lang] || spot.name.ko}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex-shrink-0">
                      {spot.currentScore}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 w-full">
                    <span className="truncate">{(spot.area?.[lang] || spot.area?.ko) || t(`district.${spot.district}_name`, spot.district)}</span>
                    {spot.distanceKm !== undefined && (
                      <span className="text-blue-600 dark:text-blue-400 font-medium ml-1 flex-shrink-0">
                        {spot.distanceKm < 1
                          ? `${Math.round(spot.distanceKm * 1000)}m`
                          : `${spot.distanceKm.toFixed(1)}km`}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* District & Theme Filter Tabs */}
        <DistrictTabs
          activeDistrict={activeDistrict}
          onSelectDistrict={(d) => {
            setActiveDistrict(d);
            setSearchSelectedSpotId(null);
          }}
          activeCategory={activeCategory}
          onSelectCategory={(c) => {
            setActiveCategory(c);
            setSearchSelectedSpotId(null);
          }}
          sortByDistance={sortByDistance}
          onToggleSortByDistance={() => setSortByDistance(!sortByDistance)}
          hasUserLocation={!!userLocation}
          onRequestLocation={handleRequestLocation}
        />

        {/* Horizontal Banner Ad (Kakao AdFit 320x100) */}
        <div className="my-4 flex justify-center w-full">
          <BannerAd />
        </div>

        {/* Quick Filter Bar & Count */}
        <div className="flex items-center justify-between gap-3 mb-5 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1 font-medium">
            <span>{t('filter.count')}</span>
            <strong className="text-gray-900 dark:text-white text-sm">
              {displaySpots.length}
            </strong>
            <span>{t('filter.places')}</span>
            {userLocation && (
              <span className="text-blue-600 dark:text-blue-400 font-semibold ml-1">
                {t('filter.from_user')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCrowdFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                crowdFilter === 'all'
                  ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold'
                  : 'hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t('filter.all')}
            </button>
            <button
              onClick={() => setCrowdFilter('safe')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                crowdFilter === 'safe'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'hover:text-emerald-600'
              }`}
            >
              <span>🟢</span>
              <span>{t('filter.safe')}</span>
            </button>
            <button
              onClick={() => setCrowdFilter('warning')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                crowdFilter === 'warning'
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold'
                  : 'hover:text-rose-600'
              }`}
            >
              <span>🔴</span>
              <span>{t('filter.warning')}</span>
            </button>
          </div>
        </div>

        {/* Spot Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {visibleSpots.map((spot, index) => {
            const isMiddle = index === Math.floor(visibleSpots.length / 2);
            return (
              <React.Fragment key={spot.id}>
                {isMiddle && <NativeInFeedAdCard />}
                <div className="content-visibility-auto">
                  <CrowdCard
                    spot={spot}
                    userLat={userLocation?.lat}
                    userLng={userLocation?.lng}
                  />
                </div>
              </React.Fragment>
            );
          })}
          {/* Bottom Ad Card: Aligned naturally inside the grid */}
          {visibleSpots.length > 0 && <NativeInFeedAdCard />}
        </div>

        {/* Sentinel for progressive infinite scroll loading */}
        {visibleCount < displaySpots.length && (
          <div ref={sentinelRef} className="h-12 w-full flex items-center justify-center py-4">
            <span className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" aria-hidden="true" />
          </div>
        )}

        {/* Empty state */}
        {displaySpots.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="text-3xl mb-2">🔍</div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t('filter.empty_title')}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {t('filter.empty_desc')}
            </p>
            <button
              onClick={() => {
                setActiveDistrict('all');
                setActiveCategory('all');
                setCrowdFilter('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              {t('filter.reset')}
            </button>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        onNearbyClick={handleRequestLocation}
        isNearbyActive={sortByDistance}
      />
    </div>
  );
}
