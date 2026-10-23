import { LANGS, isLang } from '@/lib/i18n/routing';
import { TYPES, TYPE_KEYS, personaStats, typeBySlug } from '@/lib/travelType';
import { renderTypeCard } from '@/lib/travelTypeCard';

// /play/travel-type/result/<slug>/og — the type's typical stats, for link previews.
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.flatMap((lang) => TYPE_KEYS.map((k) => ({ lang, type: TYPES[k].slug })));
}

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string; type: string }> }) {
  const { lang, type } = await params;
  const key = typeBySlug(type);
  if (!isLang(lang) || !key) return new Response('Not found', { status: 404 });
  return renderTypeCard({ key, stats: personaStats(key), lang, size: 'og', personal: false });
}
