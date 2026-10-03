'use client';

import React from 'react';
import { SeoulDistrict, SpotCategory } from '@/types';
import { useTranslation } from '@/lib/i18n/context';

interface DistrictTabsProps {
  activeDistrict: SeoulDistrict;
  onSelectDistrict: (district: SeoulDistrict) => void;
  activeCategory: SpotCategory;
  onSelectCategory: (cat: SpotCategory) => void;
  sortByDistance: boolean;
  onToggleSortByDistance: () => void;
  hasUserLocation: boolean;
  onRequestLocation: () => void;
}

export default function DistrictTabs({
  activeDistrict,
  onSelectDistrict,
  activeCategory,
  onSelectCategory,
  sortByDistance,
  onToggleSortByDistance,
  hasUserLocation,
  onRequestLocation,
}: DistrictTabsProps) {
  const { t } = useTranslation();

  const districtList: {
    id: SeoulDistrict;
    nameKey: string;
  }[] = [
    { id: 'all', nameKey: 'district.all_name' },
    { id: 'downtown', nameKey: 'district.downtown_name' },
    { id: 'west', nameKey: 'district.west_name' },
    { id: 'east', nameKey: 'district.east_name' },
    { id: 'south', nameKey: 'district.south_name' },
    { id: 'southwest', nameKey: 'district.southwest_name' },
  ];

  const categoryList: { id: SpotCategory; key: string; icon: string }[] = [
    { id: 'all', key: 'category.all', icon: '✨' },
    { id: 'palace', key: 'category.palace', icon: '🏯' },
    { id: 'shopping', key: 'category.shopping', icon: '🛍️' },
    { id: 'food', key: 'category.food', icon: '🥢' },
    { id: 'nature', key: 'category.nature', icon: '🌿' },
    { id: 'view', key: 'category.view', icon: '🌃' },
    { id: 'attraction', key: 'category.attraction', icon: '🎡' },
  ];

  return (
    <div className="w-full space-y-2.5 mb-4">
      {/* 1. Single Row Horizontal Scrollable District Chips */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0 flex-1">
          {districtList.map((d) => {
            const isSelected = activeDistrict === d.id;
            return (
              <button
                key={d.id}
                onClick={() => onSelectDistrict(d.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 flex-shrink-0 cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xs'
                    : 'bg-white dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 border border-gray-200/80 dark:border-gray-700/80 hover:border-gray-400'
                }`}
              >
                {t(d.nameKey)}
              </button>
            );
          })}
        </div>

        {/* Location Toggle Button */}
        <div className="flex-shrink-0 pl-1">
          {hasUserLocation ? (
            <button
              onClick={onToggleSortByDistance}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150 active:scale-95 flex items-center gap-1 cursor-pointer border ${
                sortByDistance
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-500'
              }`}
            >
              <span>📍</span>
              <span className="hidden sm:inline">{sortByDistance ? t('filter.sorting_distance') : t('filter.sort_distance')}</span>
              <span className="sm:hidden">{sortByDistance ? '가까운순' : '거리순'}</span>
            </button>
          ) : (
            <button
              onClick={onRequestLocation}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition-all duration-150 active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <span>🎯</span>
              <span className="hidden sm:inline">{t('filter.check_location')}</span>
              <span className="sm:hidden">내 위치</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Theme Category Chips Row (Horizontal Scroll) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4 sm:mx-0 sm:px-0">
        {categoryList.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all duration-150 flex items-center gap-1 flex-shrink-0 cursor-pointer active:scale-95 ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span aria-hidden="true">{cat.icon}</span>
              <span>{t(cat.key)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
