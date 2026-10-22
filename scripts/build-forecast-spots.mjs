// Phase 3: build the Jeju/Busan forecast spot list from the reviewed shortlist
// (publish=Y in docs/review/phase2-jeju-busan-candidates.csv).
//   - coordinates: official Busan attraction API when the name matches exactly,
//     otherwise OpenStreetMap Nominatim (flagged for review)
//   - Busan: nearest metro station/exit from the Busan Transportation Corp. CSV
//   - Jeju: nearest Visit Jeju safety camera within 3 km
// Writes src/data/spots/forecastSpots.ts and docs/review/phase3-jeju-busan-spots.csv.
// usage: node --env-file=.env.local scripts/build-forecast-spots.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const KEY = process.env.DATA_GO_KR_SERVICE_KEY;
if (!KEY) throw new Error('DATA_GO_KR_SERVICE_KEY missing');

// Draft display names (ko cleaned for display; en/ja drafts for review). Keyed by KTO name (tAtsNm).
const NAMES = {
  // Jeju
  '카멜리아힐': ['카멜리아힐', 'Camellia Hill', 'カメリアヒル'],
  '중문관광단지': ['중문관광단지', 'Jungmun Tourist Complex', '中文観光団地'],
  '용두암': ['용두암', 'Yongduam Rock', '龍頭岩'],
  '서귀포매일올레시장': ['서귀포매일올레시장', 'Seogwipo Maeil Olle Market', '西帰浦毎日オルレ市場'],
  '새별오름': ['새별오름', 'Saebyeol Oreum', 'セビョルオルム'],
  '성산일출봉 [유네스코 세계자연유산]': ['성산일출봉', 'Seongsan Ilchulbong Peak', '城山日出峰'],
  '성읍민속마을': ['성읍민속마을', 'Seongeup Folk Village', '城邑民俗村'],
  '주상절리대(대포동지삿개)': ['주상절리대 (대포동)', 'Jusangjeolli Cliff (Daepo)', '柱状節理帯（大浦洞）'],
  '천지연 걸매생태공원': ['걸매생태공원', 'Geolmae Ecological Park', 'コルメ生態公園'],
  '동문재래시장': ['동문재래시장', 'Dongmun Traditional Market', '東門在来市場'],
  '섭지코지': ['섭지코지', 'Seopjikoji', 'ソプチコジ'],
  '함덕 서우봉 해변 (함덕해수욕장)': ['함덕해수욕장 (서우봉 해변)', 'Hamdeok Beach', '咸徳ビーチ'],
  '중문·색달 해변': ['중문·색달 해변', 'Jungmun Saekdal Beach', '中文・穡達ビーチ'],
  '에코랜드테마파크': ['에코랜드 테마파크', 'Eco Land Theme Park', 'エコランド テーマパーク'],
  '오설록 티뮤지엄': ['오설록 티뮤지엄', "O'sulloc Tea Museum", 'オソルロック ティーミュージアム'],
  '한라산 (제주도 국가지질공원)': ['한라산', 'Hallasan Mountain', '漢拏山'],
  '천지연폭포 (제주도 국가지질공원)': ['천지연폭포', 'Cheonjiyeon Waterfall', '天地淵瀑布'],
  '우도 산호해변(서빈백사)': ['우도 산호해변 (서빈백사)', 'Udo Coral Beach (Seobin Baeksa)', '牛島 サンゴビーチ（西浜白沙）'],
  '소정방폭포': ['소정방폭포', 'Sojeongbang Waterfall', '小正房瀑布'],
  '우도(해양도립공원)': ['우도', 'Udo Island', '牛島'],
  '정방폭포': ['정방폭포', 'Jeongbang Waterfall', '正房瀑布'],
  '송악산': ['송악산', 'Songaksan Mountain', '松岳山'],
  '비자림': ['비자림', 'Bijarim Forest', '榧子林'],
  '월정리해변(월정리해수욕장)': ['월정리해변', 'Woljeongri Beach', '月汀里ビーチ'],
  '표선 해비치 해변': ['표선 해비치 해변', 'Pyoseon Haevichi Beach', '表善ヘビチビーチ'],
  '우도 등대': ['우도 등대', 'Udo Lighthouse', '牛島灯台'],
  '협재해수욕장': ['협재해수욕장', 'Hyeopjae Beach', '挟才海水浴場'],
  '산방산(제주)': ['산방산', 'Sanbangsan Mountain', '山房山'],
  '곽지해수욕장 (곽지과물해변)': ['곽지해수욕장', 'Gwakji Beach', '郭支海水浴場'],
  '세화해변': ['세화해변', 'Sehwa Beach', '細花ビーチ'],
  '이호테우해변': ['이호테우해변', 'Iho Tewoo Beach', '梨湖テウビーチ'],
  '쇠소깍': ['쇠소깍', 'Soesokkak', 'ソェソカク'],
  '용머리해안': ['용머리해안', 'Yongmeori Coast', '龍頭海岸'],
  '한림공원': ['한림공원', 'Hallim Park', '翰林公園'],
  '휴애리자연생활공원': ['휴애리 자연생활공원', 'Hueree Nature Park', 'ヒュエリ自然生活公園'],
  '만장굴 (제주도 국가지질공원)': ['만장굴', 'Manjanggul Lava Tube', '万丈窟'],
  '금오름': ['금오름', 'Geumoreum', 'クムオルム'],
  '김녕성세기해변 (김녕해수욕장)': ['김녕 성세기해변', 'Gimnyeong Seongsegi Beach', '金寧ソンセギビーチ'],
  // Busan
  '용두산공원': ['용두산공원', 'Yongdusan Park', '龍頭山公園'],
  '광복로문화패션거리': ['광복로 문화패션거리', 'Gwangbok-ro Fashion Street', '光復路ファッション通り'],
  'BIFF 광장': ['BIFF 광장', 'BIFF Square', 'BIFF広場'],
  '청사포': ['청사포', 'Cheongsapo Village', '青沙浦'],
  '국제시장 먹자골목': ['국제시장 먹자골목', 'Gukje Market Food Alley', '国際市場グルメ横丁'],
  '전포카페거리': ['전포카페거리', 'Jeonpo Cafe Street', '田浦カフェ通り'],
  '해운대해수욕장': ['해운대해수욕장', 'Haeundae Beach', '海雲台海水浴場'],
  '이기대 (부산 국가지질공원)': ['이기대', 'Igidae Coastal Park', '二妓台'],
  '벡스코(BEXCO)': ['벡스코 (BEXCO)', 'BEXCO', 'BEXCO'],
  '부산 송도해수욕장': ['송도해수욕장', 'Songdo Beach (Busan)', '松島海水浴場'],
  '국제시장': ['국제시장', 'Gukje Market', '国際市場'],
  '태종대 (부산 국가지질공원)': ['태종대', 'Taejongdae', '太宗台'],
  '송정해수욕장': ['송정해수욕장', 'Songjeong Beach', '松亭海水浴場'],
  '해운대 동백섬': ['동백섬', 'Dongbaekseom Island', '冬柏島'],
  '부산 자갈치시장': ['자갈치시장', 'Jagalchi Fish Market', 'チャガルチ市場'],
  '부산 송도해상케이블카': ['송도해상케이블카', 'Songdo Marine Cable Car', '松島海上ケーブルカー'],
  '해동 용궁사(부산)': ['해동용궁사', 'Haedong Yonggungsa Temple', '海東龍宮寺'],
  '롯데월드 어드벤처 부산': ['롯데월드 어드벤처 부산', 'Lotte World Adventure Busan', 'ロッテワールド アドベンチャー釜山'],
  'SEA LIFE 부산아쿠아리움': ['SEA LIFE 부산아쿠아리움', 'SEA LIFE Busan Aquarium', 'SEA LIFE 釜山アクアリウム'],
  '마린시티': ['마린시티', 'Marine City', 'マリンシティ'],
  '광안리해수욕장': ['광안리해수욕장', 'Gwangalli Beach', '広安里海水浴場'],
  '더베이101': ['더베이101', 'The Bay 101', 'ザ・ベイ101'],
  '부산 해운대시장': ['해운대시장', 'Haeundae Market', '海雲台市場'],
  '온천천시민공원': ['온천천시민공원', 'Oncheoncheon Citizens Park', '温泉川市民公園'],
  '청사포 다릿돌전망대': ['청사포 다릿돌전망대', 'Cheongsapo Daritdol Skywalk', '青沙浦タリットル展望台'],
  '범어사(부산)': ['범어사', 'Beomeosa Temple', '梵魚寺'],
  '부산 기장시장': ['기장시장', 'Gijang Market', '機張市場'],
  '영도 흰여울해안터널': ['흰여울해안터널', 'Huinnyeoul Coastal Tunnel', 'ヒニョウル海岸トンネル'],
  '부산시민공원': ['부산시민공원', 'Busan Citizens Park', '釜山市民公園'],
  '다대포해수욕장': ['다대포해수욕장', 'Dadaepo Beach', '多大浦海水浴場'],
  '부산박물관': ['부산박물관', 'Busan Museum', '釜山博物館'],
  '오륙도 스카이워크': ['오륙도 스카이워크', 'Oryukdo Skywalk', '五六島スカイウォーク'],
  '일광해수욕장': ['일광해수욕장', 'Ilgwang Beach', '日光海水浴場'],
  '오륙도 (부산 국가지질공원)': ['오륙도', 'Oryukdo Islets', '五六島'],
  '국립해양박물관': ['국립해양박물관', 'National Maritime Museum of Korea', '国立海洋博物館'],
  '아홉산숲': ['아홉산숲', 'Ahopsan Forest', 'アホプサンの森'],
  '금정산성': ['금정산성', 'Geumjeongsanseong Fortress', '金井山城'],
};

// Places the geocoder could not resolve: approximate coordinates, flagged "manual" for review.
const MANUAL_COORDS = {
  '광복로문화패션거리': { lat: 35.0989, lng: 129.0307 },
  '국제시장 먹자골목': { lat: 35.1016, lng: 129.0277 },
  '전포카페거리': { lat: 35.1556, lng: 129.0644 },
  'SEA LIFE 부산아쿠아리움': { lat: 35.1590, lng: 129.1611 },
  '마린시티': { lat: 35.1563, lng: 129.1440 },
  '더베이101': { lat: 35.1565, lng: 129.1521 },
  '청사포 다릿돌전망대': { lat: 35.1609, lng: 129.1985 },
  '중문·색달 해변': { lat: 33.2446, lng: 126.4115 },
  '오설록 티뮤지엄': { lat: 33.3059, lng: 126.2894 },
  '우도 산호해변(서빈백사)': { lat: 33.5044, lng: 126.9425 },
  '월정리해변(월정리해수욕장)': { lat: 33.5560, lng: 126.7958 },
  '표선 해비치 해변': { lat: 33.3264, lng: 126.8367 },
  '우도 등대': { lat: 33.4946, lng: 126.9667 },
};

const GU = {
  제주시: ['Jeju-si', '済州市'], 서귀포시: ['Seogwipo-si', '西帰浦市'],
  중구: ['Jung-gu', '中区'], 서구: ['Seo-gu', '西区'], 영도구: ['Yeongdo-gu', '影島区'], 부산진구: ['Busanjin-gu', '釜山鎮区'],
  남구: ['Nam-gu', '南区'], 해운대구: ['Haeundae-gu', '海雲台区'], 수영구: ['Suyeong-gu', '水営区'], 사하구: ['Saha-gu', '沙下区'],
  금정구: ['Geumjeong-gu', '金井区'], 연제구: ['Yeonje-gu', '蓮堤区'], 기장군: ['Gijang-gun', '機張郡'],
};
const SIGNGU = {
  제주시: 50110, 서귀포시: 50130, 중구: 26110, 서구: 26140, 영도구: 26200, 부산진구: 26230, 남구: 26290, 해운대구: 26350,
  사하구: 26380, 금정구: 26410, 연제구: 26470, 수영구: 26500, 기장군: 26710,
};
const BOUNDS = { jeju: [33.1, 33.6, 126.1, 127.0], busan: [34.9, 35.4, 128.7, 129.35] };

function kind(ko) {
  if (/해수욕장|해변|해안|포구|섬|우도|오륙도|청사포/.test(ko)) return ['nature', '🏖️'];
  if (/시장|먹자/.test(ko)) return ['food', '🛍️'];
  if (/폭포/.test(ko)) return ['nature', '💦'];
  if (/산|오름|봉|숲|비자림|공원|힐/.test(ko)) return ['nature', '⛰️'];
  if (/사$|용궁사|범어사|산성|마을/.test(ko)) return ['palace', '🛕'];
  if (/전망대|스카이워크|케이블카|터널|마린시티|더베이/.test(ko)) return ['view', '🌉'];
  if (/박물관|뮤지엄|아쿠아리움|벡스코|어드벤처|에코랜드|테마파크|관광단지/.test(ko)) return ['attraction', '🎡'];
  return ['shopping', '📍'];
}

const norm = (s) => String(s).replace(/\(.*?\)|\[.*?\]/g, '').replace(/[\s·・,]/g, '').toLowerCase();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const km = (a, b, c, d) => {
  const R = 6371, x = ((c - a) * Math.PI) / 180, y = ((d - b) * Math.PI) / 180;
  const h = Math.sin(x / 2) ** 2 + Math.cos((a * Math.PI) / 180) * Math.cos((c * Math.PI) / 180) * Math.sin(y / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

// Shortlist
const csv = readFileSync('docs/review/phase2-jeju-busan-candidates.csv', 'utf8').replace(/^\uFEFF/, '').trim().split(/\r?\n/);
const head = csv[0].split(',');
const parse = (l) => l.match(/("([^"]|"")*"|[^,]*)(,|$)/g).slice(0, head.length).map((c) => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'));
const short = csv.slice(1).map((l) => Object.fromEntries(parse(l).map((v, i) => [head[i], v]))).filter((r) => r.publish === 'Y');

// Busan attractions (ko + official en/ja)
async function attractions(op) {
  const all = [];
  for (let page = 1; page <= 3; page++) {
    const q = new URLSearchParams({ ServiceKey: KEY, pageNo: String(page), numOfRows: '200', resultType: 'json' });
    const d = await (await fetch(`https://apis.data.go.kr/6260000/AttractionService/${op}?${q}`)).json();
    const items = d[op]?.item ?? [];
    all.push(...items);
    if (items.length < 200) break;
  }
  return all;
}
const [busKo, busEn, busJa] = await Promise.all(['getAttractionKr', 'getAttractionEn', 'getAttractionJa'].map(attractions));
const bySeq = (list) => new Map(list.map((x) => [x.UC_SEQ, x]));
const enSeq = bySeq(busEn), jaSeq = bySeq(busJa);

// Jeju safety cameras (deduplicated by video link, invalid coordinates dropped)
const cam = await (await fetch(`https://api.odcloud.kr/api/15150508/v1/uddi:3d5f189d-3dda-4037-ab46-cc2e6a8c066b?page=1&perPage=200&serviceKey=${KEY}`)).json();
const cameras = [...new Map(
  (cam.data || [])
    .filter((c) => c['사용여부'] === 'y' && Number(c['경도']) < 130)
    .map((c) => [c['카메라영상연결경로'], { name: c['안전관광카메라설치위치'], lat: Number(c['위도']), lng: Number(c['경도']), url: c['카메라영상연결경로'] }])
).values()];

async function geocode(name, city) {
  const q = `${name.replace(/\(.*?\)|\[.*?\]/g, '').trim()}, ${city === 'jeju' ? '제주특별자치도' : '부산광역시'}`;
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=3&accept-language=ko&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'CheckEastPoint/1.0 (data build; www.checkeastpoint.com)' } });
  await sleep(1100); // Nominatim policy: max 1 request per second
  const hits = (await res.json()) || [];
  const [s, n, w, e] = BOUNDS[city];
  const hit = hits.find((h) => +h.lat > s && +h.lat < n && +h.lon > w && +h.lon < e);
  return hit ? { lat: +(+hit.lat).toFixed(6), lng: +(+hit.lon).toFixed(6), label: hit.display_name } : null;
}

const spots = [];
const review = [];
let id = 1001;
for (const r of short) {
  const names = NAMES[r.place];
  if (!names) throw new Error(`no draft name for ${r.place}`);
  const [ko, en, ja] = names;
  let coord = null, coordSource = '', official = null;
  if (r.city === 'busan') {
    official = busKo.find((a) => norm(a.MAIN_TITLE) === norm(r.place) || norm(a.MAIN_TITLE) === norm(ko));
    if (official) {
      coord = { lat: +official.LAT, lng: +official.LNG };
      coordSource = 'busan-api';
    }
  }
  if (!coord && MANUAL_COORDS[r.place]) {
    coord = MANUAL_COORDS[r.place];
    coordSource = 'manual';
  }
  if (!coord) {
    coord = (await geocode(ko, r.city)) || (await geocode(r.place, r.city));
    coordSource = coord ? 'osm' : 'missing';
  }
  const [category, emoji] = kind(ko);
  const camera =
    r.city === 'jeju' && coord
      ? cameras.map((c) => ({ ...c, d: km(coord.lat, coord.lng, c.lat, c.lng) })).filter((c) => c.d <= 3).sort((a, b) => a.d - b.d)[0]
      : undefined;
  const spot = {
    id: id++,
    city: r.city,
    ktoName: r.place,
    signguCd: SIGNGU[r.district],
    name: { ko, en, ja },
    area: { ko: r.district, en: `${GU[r.district][0]}, ${r.city === 'jeju' ? 'Jeju' : 'Busan'}`, ja: `${r.city === 'jeju' ? '済州' : '釜山'} ${GU[r.district][1]}` },
    category,
    emoji,
    lat: coord?.lat ?? null,
    lng: coord?.lng ?? null,
    station: r.station ? { name: r.station.replace('역역', '역'), exit: r.exit } : undefined,
    camera: camera ? { name: camera.name, url: camera.url } : undefined,
    popularity: Math.round(Number(r.avg_30d)),
  };
  spots.push(spot);
  review.push({
    id: spot.id, city: r.city, district: r.district, kto_name: r.place, name_ko: ko, name_en: en, name_ja: ja,
    official_en: official ? enSeq.get(official.UC_SEQ)?.PLACE ?? '' : '', official_ja: official ? jaSeq.get(official.UC_SEQ)?.PLACE ?? '' : '',
    lat: spot.lat ?? '', lng: spot.lng ?? '', coord_source: coordSource,
    needs_check: coordSource === 'busan-api' ? '' : '좌표 확인 필요', station: spot.station?.name ?? '', exit: spot.station?.exit ?? '',
    camera: spot.camera?.name ?? '', status: 'draft',
  });
}

const missing = spots.filter((s) => s.lat === null);
const out = [
  "import { ForecastSpot } from '@/types';",
  '',
  '// Generated by scripts/build-forecast-spots.mjs from the reviewed Jeju/Busan shortlist.',
  '// Names are drafts; coordinates marked "osm" in docs/review/phase3-jeju-busan-spots.csv need checking.',
  `export const FORECAST_SPOTS: ForecastSpot[] = ${JSON.stringify(spots.filter((s) => s.lat !== null), null, 2)};`,
  '',
].join('\n');
writeFileSync('src/data/spots/forecastSpots.ts', out);
const cols = Object.keys(review[0]);
const esc = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
writeFileSync('docs/review/phase3-jeju-busan-spots.csv', '﻿' + [cols.join(','), ...review.map((x) => cols.map((c) => esc(x[c])).join(','))].join('\n') + '\n');
console.log(JSON.stringify({
  spots: spots.length,
  byCoordSource: review.reduce((a, x) => ((a[x.coord_source] = (a[x.coord_source] || 0) + 1), a), {}),
  missing: missing.map((m) => m.ktoName),
  jejuWithCamera: spots.filter((s) => s.camera).length,
  busanWithStation: spots.filter((s) => s.station).length,
  cameras: cameras.length,
}));
