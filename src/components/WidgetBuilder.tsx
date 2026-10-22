'use client';

import { useState } from 'react';
import { Lang } from '@/types';
import { LANGS, SITE_URL } from '@/lib/i18n/routing';
import { useTranslation } from '@/lib/i18n/context';

export interface WidgetOption {
  slug: string;
  name: string;
  city: string;
}

const LANG_LABEL: Record<Lang, string> = { ko: '한국어', en: 'English', ja: '日本語', 'zh-cn': '简体中文', 'zh-tw': '繁體中文' };

export default function WidgetBuilder({ groups }: { groups: { city: string; label: string; spots: WidgetOption[] }[] }) {
  const { lang, t } = useTranslation();
  const [slug, setSlug] = useState(groups[0]?.spots[0]?.slug ?? '');
  const [wLang, setWLang] = useState<Lang>(lang);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [copied, setCopied] = useState(false);

  const path = `/embed/${wLang}/${slug}${theme === 'dark' ? '?theme=dark' : ''}`;
  const src = `${SITE_URL}${path}`;
  const name = groups.flatMap((g) => g.spots).find((s) => s.slug === slug)?.name ?? '';
  const code = `<iframe src="${src}" width="320" height="140" style="border:0;max-width:100%" loading="lazy" title="${name.replace(/"/g, '&quot;')} — Check East Point"></iframe>`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      window.gtag?.('event', 'widget_copy', { item_id: slug });
    } catch {}
  };

  const field = 'w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white';

  return (
    <div className="grid sm:grid-cols-2 gap-5">
      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{t('widget.spot')}</span>
          <select className={field} value={slug} onChange={(e) => setSlug(e.target.value)}>
            {groups.map((g) => (
              <optgroup key={g.city} label={g.label}>
                {g.spots.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{t('widget.language')}</span>
          <select className={field} value={wLang} onChange={(e) => setWLang(e.target.value as Lang)}>
            {LANGS.map((l) => (
              <option key={l} value={l}>
                {LANG_LABEL[l]}
              </option>
            ))}
          </select>
        </label>
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{t('widget.style')}</span>
          <div className="flex gap-2">
            {(['light', 'dark'] as const).map((th) => (
              <button
                key={th}
                type="button"
                onClick={() => setTheme(th)}
                className={`flex-1 h-10 rounded-xl text-sm font-bold border ${
                  theme === th ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'
                }`}
              >
                {t(`widget.${th}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{t('widget.preview')}</span>
          <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-100'}`}>
            <iframe key={path} src={path} width={320} height={140} style={{ border: 0, maxWidth: '100%' }} loading="lazy" title={name} />
          </div>
        </div>
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{t('widget.code')}</span>
          <textarea readOnly value={code} rows={4} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 font-mono text-xs text-gray-800 dark:text-gray-200" onFocus={(e) => e.target.select()} />
          <button type="button" onClick={copy} className="w-full h-10 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold">
            {copied ? t('widget.copied') : t('widget.copy')}
          </button>
        </div>
      </div>
    </div>
  );
}
