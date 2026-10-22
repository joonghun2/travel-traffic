'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';

const SEOUL_THEMES = ['palaces', 'parks', 'night-view', 'markets', 'shopping', 'landmarks'];

// Site-wide footer: city hubs, Seoul themes, info pages and data credits.
export default function SiteFooter() {
  const { t, localePath } = useTranslation();
  const col = 'space-y-1.5 text-xs';
  const a = 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400';
  return (
    <footer className="mt-10 mb-20 lg:mb-0 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div className={col}>
          <p className="font-bold text-gray-800 dark:text-gray-200">{t('footer.cities')}</p>
          <p><Link className={a} href={localePath('/')}>{t('map.city.seoul')}</Link></p>
          <p><Link className={a} href={localePath('/jeju')}>{t('map.city.jeju')}</Link></p>
          <p><Link className={a} href={localePath('/busan')}>{t('map.city.busan')}</Link></p>
          <p><Link className={a} href={localePath('/list')}>{t('footer.list')}</Link></p>
        </div>
        <div className={col}>
          <p className="font-bold text-gray-800 dark:text-gray-200">{t('footer.themes')}</p>
          {SEOUL_THEMES.map((th) => (
            <p key={th}><Link className={a} href={localePath(`/seoul/${th}`)}>{t(`theme.${th}`)}</Link></p>
          ))}
        </div>
        <div className={col}>
          <p className="font-bold text-gray-800 dark:text-gray-200">{t('footer.more')}</p>
          <p><Link className={a} href={localePath('/jeju/beaches')}>{t('map.city.jeju')} · {t('theme.beaches')}</Link></p>
          <p><Link className={a} href={localePath('/busan/beaches')}>{t('map.city.busan')} · {t('theme.beaches')}</Link></p>
          <p><Link className={a} href={localePath('/play')}>{t('footer.play')}</Link></p>
        </div>
        <div className={col}>
          <p className="font-bold text-gray-800 dark:text-gray-200">Check East Point</p>
          <p><Link className={a} href={localePath('/about')}>{t('footer.about')}</Link></p>
          <p><Link className={a} href={localePath('/about/methodology')}>{t('footer.method')}</Link></p>
        </div>
      </div>
      <p className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 text-[10px] leading-relaxed text-gray-400">{t('footer.sources')}</p>
    </footer>
  );
}
