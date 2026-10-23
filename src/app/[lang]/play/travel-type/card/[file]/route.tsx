import { isLang } from '@/lib/i18n/routing';
import { decodeAnswers, scoreAnswers, typeOf } from '@/lib/travelType';
import { renderTypeCard } from '@/lib/travelTypeCard';

// /play/travel-type/card/<answers>-<feed|story>.png — a result card with the person's own stats.
// Answers fully determine the image, so it is cached for a long time.
export function generateStaticParams() {
  return [];
}

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string; file: string }> }) {
  const { lang, file } = await params;
  const m = file.match(/^([0-3]+)-(feed|story)\.png$/);
  const answers = m && decodeAnswers(m[1]);
  if (!isLang(lang) || !m || !answers) return new Response('Not found', { status: 404 });
  const stats = scoreAnswers(answers);
  const res = await renderTypeCard({ key: typeOf(stats), stats, lang, size: m[2] as 'feed' | 'story', personal: true });
  res.headers.set('Cache-Control', 'public, max-age=86400, s-maxage=31536000, immutable');
  return res;
}
