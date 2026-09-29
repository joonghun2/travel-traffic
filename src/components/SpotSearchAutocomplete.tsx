'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LiveSpotMetric } from '@/types';
import { useTranslation } from '@/lib/i18n/context';

interface SpotSearchAutocompleteProps {
  spots: LiveSpotMetric[];
  onSelectSpot: (spot: LiveSpotMetric) => void;
  className?: string;
}

export default function SpotSearchAutocomplete({
  spots,
  onSelectSpot,
  className = '',
}: SpotSearchAutocompleteProps) {
  const { lang, t } = useTranslation();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter spots matching query
  const filteredSpots = query.trim()
    ? spots
        .filter((spot) => {
          const q = query.toLowerCase().trim();
          const nameKo = spot.name.ko.toLowerCase();
          const nameEn = spot.name.en.toLowerCase();
          const address = (spot.address?.ko || spot.area?.ko || '').toLowerCase();
          return nameKo.includes(q) || nameEn.includes(q) || address.includes(q);
        })
        .slice(0, 8)
    : [];

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className={`relative w-full max-w-xl mx-auto ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <div className="absolute left-4 text-gray-400">🔍</div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={t('search.placeholder') || '서울 명소 검색 (예: 경복궁, 홍대, 성수동, 명동)'}
          className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-xs"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs px-1.5 py-0.5"
          >
            ✕
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && filteredSpots.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden max-h-80 overflow-y-auto">
          {filteredSpots.map((spot) => {
            const name = spot.name[lang] || spot.name.ko;
            const address =
              (spot.address?.[lang] || spot.address?.ko) ||
              (spot.area?.[lang] || spot.area?.ko) ||
              '';
            const score = spot.currentScore;

            let scoreColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40';
            if (spot.status === 'moderate') {
              scoreColor = 'text-amber-600 bg-amber-50 dark:bg-amber-950/40';
            } else if (spot.status === 'packed') {
              scoreColor = 'text-rose-600 bg-rose-50 dark:bg-rose-950/40';
            }

            return (
              <button
                key={spot.id}
                onClick={() => {
                  onSelectSpot(spot);
                  setQuery('');
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 flex items-center justify-between transition-colors border-b border-gray-50 dark:border-gray-800/40 last:border-0"
              >
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">
                    {name}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{address}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${scoreColor}`}>
                    혼잡도 {score}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
