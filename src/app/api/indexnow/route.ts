import { NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/i18n/routing';
import { allUrls } from '@/lib/sitemaps';

// IndexNow: Bing, Naver, Yandex and Seznam share submissions via api.indexnow.org.
// The key is public by design and verified at /df7d3b1bc2a4d681e6af478fc31ecfc6.txt.
const KEY = 'df7d3b1bc2a4d681e6af478fc31ecfc6';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Called daily by Vercel Cron (vercel.json) after the forecast refresh. Submits the
// Jeju/Busan pages (their forecast changes every day) and the core pages.
export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  const fromCron = request.headers.get('user-agent')?.startsWith('vercel-cron') ?? false;
  const secret = process.env.CRON_SECRET;
  if (secret ? auth !== `Bearer ${secret}` : !fromCron) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const urlList = await allUrls(['jeju', 'busan', 'core']);
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: new URL(SITE_URL).host, key: KEY, keyLocation: `${SITE_URL}/${KEY}.txt`, urlList }),
  });
  return NextResponse.json({ submitted: urlList.length, status: res.status });
}
