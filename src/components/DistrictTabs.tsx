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
    icon: string;
    nameKey: string;
    subKey: string;
  }[] = [
    { id: 'all', icon: '📍', nameKey: 'district.all_name', subKey: 'district.all_sub' },
    { id: 'downtown', icon: '🏛️', nameKey: 'district.downtown_name', subKey: 'district.downtown_sub' },
    { id: 'west', icon: '🎸', nameKey: 'district.west_name', subKey: 'district.west_sub' },
    { id: 'east', icon: '☕', nameKey: 'district.east_name', subKey: 'district.east_sub' },
    { id: 'south', icon: '🏙️', nameKey: 'district.south_name', subKey: 'district.south_sub' },
    { id: 'southwest', icon: '🌳', nameKey: 'district.southwest_name', subKey: 'district.southwest_sub' },
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
    <div className="w-full space-y-3 mb-5">
      {/* 1. Header Bar: District Section Title + Location Distance Button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1">
            <span>🗺️</span>
            <span>{t('district.section_title')}</span>
          </span>
          <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">
            ({t('district.section_sub')})
          </span>
        </div>

        {/* Location Action Button / Distance Sort Toggle */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {hasUserLocation ? (
            <button
              onClick={onToggleSortByDistance}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold transition-all duration-150 active:scale-95 flex items-center gap-1 border shadow-2xs ${
                sortByDistance
                  ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-blue-500'
              }`}
            >
              <span>📍</span>
              <span>{sortByDistance ? t('filter.sorting_distance') : t('filter.sort_distance')}</span>
            </button>
          ) : (
            <button
              onClick={onRequestLocation}
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200/90 dark:border-blue-800/80 transition-all duration-150 active:scale-95 flex items-center gap-1 shadow-2xs"
            >
              <span>🎯</span>
              <span>{t('filter.check_location')}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. District Filter Buttons: 3-column Grid on Mobile, 6-column on Desktop */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
        {districtList.map((d) => {
          const isSelected = activeDistrict === d.id;
          return (
            <button
              key={d.id}
              onClick={() => onSelectDistrict(d.id)}
              className={`px-2 py-2 sm:py-2.5 rounded-xl text-center transition-all duration-150 active:scale-95 flex flex-col items-center justify-center border shadow-2xs min-h-[52px] sm:min-h-[58px] ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25 dark:bg-blue-500 dark:border-blue-500'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200/90 dark:border-gray-800'
              }`}
            >
              <span className="flex items-center gap-1 text-xs font-bold leading-tight">
                <span className="text-sm">{d.icon}</span>
                <span>{t(d.nameKey)}</span>
              </span>
              <span
                className={`text-[10px] mt-0.5 leading-none truncate max-w-full font-medium ${
                  isSelected
                    ? 'text-blue-100 dark:text-blue-100'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {t(d.subKey)}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Category / Theme Adaptive Filter Chips */}
      <div className="pt-1">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <span>🏷️</span>
            <span>{t('category.section_title')}</span>
          </span>
        </div>

        {/* Adaptive Layout: automatically reflows with browser size */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {categoryList.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex-1 sm:flex-initial min-w-[72px] sm:min-w-0 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95 flex items-center justify-center gap-1 sm:gap-1.5 border shadow-2xs text-center ${
                  isSelected
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-950 border-gray-900 dark:border-white shadow-xs'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200/90 dark:border-gray-800'
                }`}
              >
                <span className="text-sm flex-shrink-0">{cat.icon}</span>
                <span className="whitespace-nowrap">{t(cat.key)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
