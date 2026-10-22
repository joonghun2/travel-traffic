// Phase 2 sample calls: list the Jeju/Busan places each public API returns.
// usage: node --env-file=.env.local scripts/sample-jeju-busan.mjs
// Uses well under 100 calls of the 1,000/day development quota.
const KEY = process.env.DATA_GO_KR_SERVICE_KEY;
if (!KEY) throw new Error('DATA_GO_KR_SERVICE_KEY missing');

const SIGNGU = {
  50: { name: '제주', list: { 50110: '제주시', 50130: '서귀포시' } },
  26: {
    name: '부산',
    list: {
      26110: '중구', 26140: '서구', 26170: '동구', 26200: '영도구', 26230: '부산진구', 26260: '동래구',
      26290: '남구', 26320: '북구', 26350: '해운대구', 26380: '사하구', 26410: '금정구', 26440: '강서구',
      26470: '연제구', 26500: '수영구', 26530: '사상구', 26710: '기장군',
    },
  },
};

async function getJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text.slice(0, 200) };
  }
}

async function forecast(areaCd, signguCd) {
  const q = new URLSearchParams({
    serviceKey: KEY, pageNo: '1', numOfRows: '1000', MobileOS: 'WEB', MobileApp: 'CheckEastPoint',
    areaCd: String(areaCd), signguCd: String(signguCd), _type: 'json',
  });
  const d = await getJson(`https://apis.data.go.kr/B551011/TatsCnctrRateService/tatsCnctrRatedList?${q}`);
  if (d.raw) return { error: d.raw };
  const header = d.response?.header;
  let items = d.response?.body?.items?.item ?? [];
  if (!Array.isArray(items)) items = [items];
  return { header, items };
}

const out = { forecast: {}, busanAttractions: null };
for (const [areaCd, area] of Object.entries(SIGNGU)) {
  for (const [code, name] of Object.entries(area.list)) {
    const r = await forecast(areaCd, code);
    if (r.error || r.header?.resultCode !== '0000') {
      out.forecast[`${area.name} ${name}`] = { error: r.error || r.header };
      continue;
    }
    const byPlace = new Map();
    for (const it of r.items) {
      const p = byPlace.get(it.tAtsNm) || { days: 0, max: 0, base: it.baseYmd };
      p.days++;
      p.max = Math.max(p.max, Number(it.cnctrRate));
      byPlace.set(it.tAtsNm, p);
    }
    out.forecast[`${area.name} ${name}`] = {
      rows: r.items.length,
      places: [...byPlace.keys()],
      sample: r.items.slice(0, 2),
    };
  }
}

const q = new URLSearchParams({ ServiceKey: KEY, pageNo: '1', numOfRows: '200', resultType: 'json' });
const b = await getJson(`https://apis.data.go.kr/6260000/AttractionService/getAttractionKr?${q}`);
const bi = b.getAttractionKr;
out.busanAttractions = bi
  ? {
      total: bi.totalCount,
      header: bi.header,
      places: (bi.item || []).map((x) => ({ id: x.UC_SEQ, name: x.MAIN_TITLE, gu: x.GUGUN_NM, lat: x.LAT, lng: x.LNG })),
    }
  : { error: b.raw || JSON.stringify(b).slice(0, 300) };

console.log(JSON.stringify(out, null, 1));
