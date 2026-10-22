import { notFound } from 'next/navigation';
import { isLang } from '@/lib/i18n/routing';
import { getCrowdSnapshot } from '@/lib/crowdSnapshot';
import { toMapSpots } from '@/lib/mapSpots';
import MapHome from '@/components/map/MapHome';

// Re-render with the cached Seoul snapshot every 5 minutes; the client polls /api/crowd.
export const revalidate = 300;
export const preferredRegion = 'icn1';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const snapshot = await getCrowdSnapshot();
  return <MapHome city="seoul" initialSpots={toMapSpots(snapshot.spots, lang)} liveCount={snapshot.liveCount} />;
}
