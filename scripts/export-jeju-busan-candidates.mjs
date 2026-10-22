// Phase 2: export every Jeju/Busan place that has a 30-day concentration forecast,
// joined with Busan attraction coordinates and Busan metro station exits, into a
// review CSV so the places to publish can be chosen.
// usage: node --env-file=.env.local scripts/export-jeju-busan-candidates.mjs
// Calls: ~35 forecast pages + 2 Busan attraction pages (dev quota is 1,000/day).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const KEY = process.env.DATA_GO_KR_SERVICE_KEY;
if (!KEY) throw new Error('DATA_GO_KR_SERVICE_KEY missing');

const AREAS = {
  50: { city: 'jeju', gu: { 50110: '제주시', 50130: '서귀포시' } },
  26: {
    city: 'busan',
    gu: {
      26110: '중구', 26140: '서구', 26170: '동구', 26200: '영도구', 26230: '부산진구', 26260: '동래구',
      26290: '남구', 26320: '북구', 26350: '해운대구', 26380: '사하구', 26410: '금정구', 26440: '강서구',
      26470: '연제구', 26500: '수영구', 26530: '사상구', 26710: '기장군',
    },
  },
};

// Well-known names used to pre-tick a suggested shortlist (edit freely in the CSV).
const SUGGEST = {
  jeju: ['성산일출봉', '우도', '한라산', '협재', '함덕', '월정리', '섭지코지', '천지연', '정방폭포', '중문', '주상절리', '오설록', '카멜리아힐', '사려니', '비자림', '만장굴', '용두암', '동문', '올레시장', '새별오름', '쇠소깍', '산방산', '용머리', '애월', '곽지', '이호테우', '송악산', '에코랜드', '금오름', '한림공원', '성읍', '표선', '김녕', '세화', '휴애리', '녹산로'],
  busan: ['해운대해수욕장', '광안리', '감천문화마을', '태종대', '해동용궁사', '자갈치', '국제시장', 'BIFF', '용두산', '흰여울', '송도해상케이블카', '송도해수욕장', '오륙도', '이기대', '다대포해수욕장', '더베이101', '마린시티', '동백섬', '청사포', '블루라인', '부산시민공원', '범어사', '금정산성', '기장시장', '롯데월드 어드벤처 부산', '국립해양박물관', '영도대교', '광복로', '전포', '송정해수욕장', '일광해수욕장', '아홉산', '온천천', '부산박물관', 'SEA LIFE', '벡스코', '부산 해운대시장'],
};

// Matches of SUGGEST that are not the landmark itself (factories, spas, mini attractions).
const NOT_SUGGEST = ['탄산온천', '소주공장', '해수랜드', '막걸리', '양곱창', '책방', '미로', '성읍랜드', '사굴', '월전포구'];

const norm = (s) => String(s).replace(/\(.*?\)|\[.*?\]/g, '').replace(/[\s·・,]/g, '').toLowerCase();

async function json(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  return res.json();
}

// 1) Forecast rows, all pages.
const places = new Map();
for (const [areaCd, area] of Object.entries(AREAS)) {
  for (const [signguCd, guName] of Object.entries(area.gu)) {
    for (let page = 1; ; page++) {
      const q = new URLSearchParams({
        serviceKey: KEY, pageNo: String(page), numOfRows: '1000', MobileOS: 'WEB', MobileApp: 'CheckEastPoint',
        areaCd, signguCd, _type: 'json',
      });
      const d = await json(`https://apis.data.go.kr/B551011/TatsCnctrRateService/tatsCnctrRatedList?${q}`);
      const body = d.response?.body;
      let items = body?.items?.item ?? [];
      if (!Array.isArray(items)) items = [items];
      for (const it of items) {
        const key = `${area.city}|${guName}|${it.tAtsNm}`;
        const p = places.get(key) || { city: area.city, gu: guName, name: it.tAtsNm, rates: [], base: it.baseYmd };
        p.rates.push(Number(it.cnctrRate));
        places.set(key, p);
      }
      if (!body || page * 1000 >= body.totalCount) break;
    }
  }
}

// 2) Busan attractions (coordinates).
const attractions = [];
for (let page = 1; page <= 3; page++) {
  const q = new URLSearchParams({ ServiceKey: KEY, pageNo: String(page), numOfRows: '200', resultType: 'json' });
  const d = await json(`https://apis.data.go.kr/6260000/AttractionService/getAttractionKr?${q}`);
  const items = d.getAttractionKr?.item ?? [];
  attractions.push(...items);
  if (items.length < 200) break;
}

// 3) Busan metro station attractions (UTF-8 copy of the 2021 CSV).
const stationRows = readFileSync('data/sources/busan-metro-station-attractions-20211020.csv', 'utf8')
  .trim().split('\n').slice(1)
  .map((line) => line.match(/("[^"]*"|[^,]*)(,|$)/g).map((c) => c.replace(/,$/, '').replace(/^"|"$/g, '')));

function findAttraction(name) {
  const n = norm(name);
  return attractions.find((a) => {
    const t = norm(a.MAIN_TITLE || a.PLACE || '');
    return t && (t.includes(n) || n.includes(t));
  });
}
function findStation(name) {
  const n = norm(name);
  return stationRows.find((r) => {
    const t = norm(r[1]);
    return t.length > 1 && (t.includes(n) || n.includes(t));
  });
}

const rows = [...places.values()].map((p) => {
  const avg = p.rates.reduce((a, b) => a + b, 0) / p.rates.length;
  const att = p.city === 'busan' ? findAttraction(p.name) : undefined;
  const st = p.city === 'busan' ? findStation(p.name) : undefined;
  const suggested =
    SUGGEST[p.city].some((s) => norm(p.name).includes(norm(s))) && !NOT_SUGGEST.some((s) => p.name.includes(s));
  return {
    publish: suggested ? 'Y' : '',
    city: p.city,
    district: p.gu,
    place: p.name,
    base_date: p.base,
    today_rate: p.rates[0]?.toFixed(1),
    avg_30d: avg.toFixed(1),
    max_30d: Math.max(...p.rates).toFixed(1),
    days: p.rates.length,
    busan_attraction_match: att ? att.MAIN_TITLE : '',
    lat: att?.LAT ?? '',
    lng: att?.LNG ?? '',
    station: st ? `${st[6]}역 (${st[5]}호선)` : '',
    exit: st ? st[4] : '',
  };
});
rows.sort((a, b) => a.city.localeCompare(b.city) || (b.publish === 'Y') - (a.publish === 'Y') || Number(b.avg_30d) - Number(a.avg_30d));

mkdirSync('docs/review', { recursive: true });
const cols = Object.keys(rows[0]);
const esc = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
writeFileSync(
  'docs/review/phase2-jeju-busan-candidates.csv',
  '﻿' + [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n') + '\n'
);

const count = (f) => rows.filter(f).length;
console.log(JSON.stringify({
  jeju: count((r) => r.city === 'jeju'),
  busan: count((r) => r.city === 'busan'),
  suggested: { jeju: count((r) => r.city === 'jeju' && r.publish), busan: count((r) => r.city === 'busan' && r.publish) },
  busanWithCoords: count((r) => r.city === 'busan' && r.lat),
  busanWithStation: count((r) => r.city === 'busan' && r.station),
  busanAttractionsTotal: attractions.length,
  baseDate: rows[0]?.base_date,
}));
