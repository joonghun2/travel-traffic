import Link from 'next/link';
import { Lang } from '@/types';
import { localizePath, pick } from '@/lib/i18n/routing';
import { getSpotBySlug } from '@/lib/spots';
import { getForecastSpotBySlug } from '@/lib/forecastSpots';
import { SPOT_SEO_RELATED_TITLE, SpotSeo } from '@/data/spotSeo';

/** "Should you go now?" box for spots with extra search copy (src/data/spotSeo.ts). */
export default function SpotGuide({ seo, lang }: { seo: SpotSeo; lang: Lang }) {
  const related = seo.related.flatMap((slug) => {
    const spot = getSpotBySlug(slug) ?? getForecastSpotBySlug(slug);
    return spot ? [{ slug, name: pick(spot.name, lang), emoji: spot.emoji }] : [];
  });
  return (
    <section className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
      <h2 className="text-base font-bold text-gray-900 dark:text-white">{seo.guideTitle[lang]}</h2>
      <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300 list-disc pl-5">
        {seo.guide[lang].map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      {related.length > 0 && (
        <div className="pt-1">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400">{SPOT_SEO_RELATED_TITLE[lang]}</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={localizePath(`/spot/${r.slug}`, lang)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-xs font-semibold text-blue-700 dark:text-blue-300"
                >
                  {r.emoji} {r.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
