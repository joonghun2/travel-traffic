// Writes data/forecast/kto-forecast-snapshot.json: the fallback used when the KTO
// forecast API is unavailable (and during `next build`). Run it now and then to keep
// the fallback recent. One call per Jeju/Busan spot (~75 of the 1,000/day quota).
// usage: node --env-file=.env.local scripts/snapshot-forecast.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const KEY = process.env.DATA_GO_KR_SERVICE_KEY;
if (!KEY) throw new Error('DATA_GO_KR_SERVICE_KEY missing');

const src = readFileSync('src/data/spots/forecastSpots.ts', 'utf8');
const spots = JSON.parse(src.slice(src.indexOf('= [') + 2, src.lastIndexOf(']') + 1));
const AREA_CD = { jeju: 50, busan: 26 };
const toDate = (ymd) => `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;

const out = {};
const queue = [...spots];
async function worker() {
  for (let s = queue.shift(); s; s = queue.shift()) {
    const q = new URLSearchParams({
      serviceKey: KEY, pageNo: '1', numOfRows: '60', MobileOS: 'WEB', MobileApp: 'CheckEastPoint',
      areaCd: String(AREA_CD[s.city]), signguCd: String(s.signguCd), tAtsNm: s.ktoName, _type: 'json',
    });
    const d = await (await fetch(`https://apis.data.go.kr/B551011/TatsCnctrRateService/tatsCnctrRatedList?${q}`)).json();
    let items = d?.response?.body?.items?.item ?? [];
    if (!Array.isArray(items)) items = [items];
    const days = items
      .filter((i) => i.tAtsNm === s.ktoName)
      .map((i) => ({ date: toDate(i.baseYmd), rate: Math.round(Number(i.cnctrRate) * 10) / 10 }))
      .sort((a, b) => a.date.localeCompare(b.date));
    if (days.length) out[s.id] = days;
    else console.warn('no forecast for', s.ktoName);
  }
}
await Promise.all(Array.from({ length: 6 }, worker));

const baseDate = Object.values(out).map((d) => d[0].date).sort()[0] ?? null;
mkdirSync('data/forecast', { recursive: true });
writeFileSync('data/forecast/kto-forecast-snapshot.json', JSON.stringify({ baseDate, source: 'snapshot', spots: out }) + '\n');
console.log(JSON.stringify({ baseDate, spots: Object.keys(out).length, of: spots.length }));
