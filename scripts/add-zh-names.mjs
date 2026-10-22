// Phase 4: add Simplified/Traditional Chinese names (and district names) to every spot.
//   - Seoul official 79: drafts from docs/review/phase1-seoul-spots.csv
//   - Seoul original 52 + Jeju/Busan 75: drafts below (zh-cn); zh-tw via OpenCC cn->twp
//   - Busan: official Chinese names from the Busan attraction API (getAttractionZhs/Zht)
//     when the Korean name matches exactly
// Writes zh fields into the spot data files and docs/review/phase4-zh-names.csv.
// usage: node --env-file=.env.local scripts/add-zh-names.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import * as OpenCC from 'opencc-js';

const KEY = process.env.DATA_GO_KR_SERVICE_KEY;
const cn2tw = OpenCC.Converter({ from: 'cn', to: 'twp' });
const jp2cn = OpenCC.Converter({ from: 'jp', to: 'cn' });
const jp2tw = OpenCC.Converter({ from: 'jp', to: 'twp' });

const SEOUL_52 = {
  1: '弘大步行街与街头表演区', 2: '明洞购物街与明洞圣堂', 3: '景福宫与光化门广场', 4: '圣水洞练武场街与咖啡街', 5: '北村韩屋村',
  6: '江南站主街与Kakao Friends', 7: '汝矣岛汉江公园与水光广场', 8: '东大门设计广场（DDP）', 9: 'N首尔塔与南山公园',
  10: '蚕室乐天世界购物中心与石村湖', 11: '益善洞韩屋村与西巡逻路', 12: '广藏市场美食街', 13: 'COEX商场星空图书馆',
  14: '盘浦汉江公园月光彩虹喷泉', 15: '仁寺洞Ssamziegil与Anyoung Insadong', 16: '梨泰院世界美食街', 17: '狎鸥亭罗德奥街与岛山公园',
  18: '延南洞京义线林荫道', 19: '西村与通仁市场（铜钱便当）', 20: '德寿宫与德寿宫石墙路', 21: '南大门市场与炖带鱼胡同',
  22: '首尔林公园与昆虫植物园', 23: '青瓦台', 24: '国立中央博物馆与镜池', 25: '鹭得岛复合文化空间', 26: '奥林匹克公园与孤独树',
  27: '望远洞望理团路与望远市场', 28: '大学路与马罗尼埃公园', 29: '新村延世路与梨花女子大学街', 30: '龙山I\'PARK商场与龙理团路',
  31: '乙支路明太鱼干胡同与印刷胡同', 32: '昌德宫与后苑（秘苑）', 33: '宗庙（世界文化遗产）', 34: '南山谷韩屋村与传统庭园',
  35: '新沙洞林荫道', 36: '清溪川广场与亲水步道', 37: '首尔植物园（温室与热带庭园）', 38: '乐天世界探险公园与魔幻岛',
  39: '首尔大公园与国立现代美术馆果川馆', 40: '北汉山国立公园与白云台', 41: '仁王山汉阳都城步道与虎岩', 42: '纛岛汉江公园与尺蠖展望台',
  43: '望远汉江公园与首尔舰公园', 44: '儿童大公园与动物园', 45: '峨嵯山日出广场与高句丽堡垒', 46: '蚕室松理团路与百济古坟群',
  47: '文来洞文来艺术村与铁工厂街', 48: '昌庆宫与大温室', 49: '清潭洞名品街与K-STAR ROAD', 50: '庆熙宫与首尔历史博物馆',
  51: '首尔路7017与文化站首尔284', 52: '宣陵与靖陵（世界文化遗产王陵）',
};

const FORECAST = {
  '카멜리아힐': '山茶花之丘', '중문관광단지': '中文旅游区', '용두암': '龙头岩', '서귀포매일올레시장': '西归浦每日偶来市场', '새별오름': '晓星岳',
  '성산일출봉 [유네스코 세계자연유산]': '城山日出峰', '성읍민속마을': '城邑民俗村', '주상절리대(대포동지삿개)': '柱状节理带（大浦洞）',
  '천지연 걸매생태공원': '杰梅生态公园', '동문재래시장': '东门传统市场', '섭지코지': '涉地可支', '함덕 서우봉 해변 (함덕해수욕장)': '咸德海水浴场',
  '중문·색달 해변': '中文·穑达海滩', '에코랜드테마파크': '生态乐园主题公园', '오설록 티뮤지엄': 'O\'sulloc茶博物馆',
  '한라산 (제주도 국가지질공원)': '汉拿山', '천지연폭포 (제주도 국가지질공원)': '天地渊瀑布', '우도 산호해변(서빈백사)': '牛岛珊瑚海滩（西滨白沙）',
  '소정방폭포': '小正房瀑布', '우도(해양도립공원)': '牛岛', '정방폭포': '正房瀑布', '송악산': '松岳山', '비자림': '榧子林',
  '월정리해변(월정리해수욕장)': '月汀里海滩', '표선 해비치 해변': '表善海碧滩', '우도 등대': '牛岛灯塔', '협재해수욕장': '挟才海水浴场',
  '산방산(제주)': '山房山', '곽지해수욕장 (곽지과물해변)': '郭支海水浴场', '세화해변': '细花海滩', '이호테우해변': '梨湖木马海滩',
  '쇠소깍': '牛沼河口', '용머리해안': '龙头海岸', '한림공원': '翰林公园', '휴애리자연생활공원': '休爱里自然生活公园',
  '만장굴 (제주도 국가지질공원)': '万丈窟', '금오름': '金岳', '김녕성세기해변 (김녕해수욕장)': '金宁城世纪海滩',
  '용두산공원': '龙头山公园', '광복로문화패션거리': '光复路时尚街', 'BIFF 광장': 'BIFF广场', '청사포': '青沙浦', '국제시장 먹자골목': '国际市场美食街',
  '전포카페거리': '田浦咖啡街', '해운대해수욕장': '海云台海水浴场', '이기대 (부산 국가지질공원)': '二妓台', '벡스코(BEXCO)': 'BEXCO会展中心',
  '부산 송도해수욕장': '松岛海水浴场', '국제시장': '国际市场', '태종대 (부산 국가지질공원)': '太宗台', '송정해수욕장': '松亭海水浴场',
  '해운대 동백섬': '冬柏岛', '부산 자갈치시장': '札嘎其市场', '부산 송도해상케이블카': '松岛海上缆车', '해동 용궁사(부산)': '海东龙宫寺',
  '롯데월드 어드벤처 부산': '釜山乐天世界探险公园', 'SEA LIFE 부산아쿠아리움': 'SEA LIFE釜山水族馆', '마린시티': '海洋城',
  '광안리해수욕장': '广安里海水浴场', '더베이101': 'The Bay 101', '부산 해운대시장': '海云台市场', '온천천시민공원': '温泉川市民公园',
  '청사포 다릿돌전망대': '青沙浦踏石展望台', '범어사(부산)': '梵鱼寺', '부산 기장시장': '机张市场', '영도 흰여울해안터널': '白浅滩海岸隧道',
  '부산시민공원': '釜山市民公园', '다대포해수욕장': '多大浦海水浴场', '부산박물관': '釜山博物馆', '오륙도 스카이워크': '五六岛天空步道',
  '일광해수욕장': '日光海水浴场', '오륙도 (부산 국가지질공원)': '五六岛', '국립해양박물관': '国立海洋博物馆', '아홉산숲': '九峰山林',
  '금정산성': '金井山城',
};

const review = [];
const areaZh = (ja) => {
  const base = ja.replace('ソウル ', '首尔 ').replace('済州 ', '济州 ');
  return [jp2cn(base), jp2tw(base.replace('首尔', '首爾').replace('济州', '濟州'))];
};

// --- Busan official Chinese names
const norm = (s) => String(s).replace(/\(.*?\)|\[.*?\]/g, '').replace(/[\s·・,]/g, '').toLowerCase();
async function busan(op) {
  const out = [];
  for (let page = 1; page <= 3 && KEY; page++) {
    const q = new URLSearchParams({ ServiceKey: KEY, pageNo: String(page), numOfRows: '200', resultType: 'json' });
    const d = await (await fetch(`https://apis.data.go.kr/6260000/AttractionService/${op}?${q}`)).json();
    const items = d[op]?.item ?? [];
    out.push(...items);
    if (items.length < 200) break;
  }
  return out;
}
const [bKo, bZhs, bZht] = await Promise.all(['getAttractionKr', 'getAttractionZhs', 'getAttractionZht'].map(busan));
const zhs = new Map(bZhs.map((x) => [x.UC_SEQ, x.PLACE])), zht = new Map(bZht.map((x) => [x.UC_SEQ, x.PLACE]));

// --- 1) Seoul original 52 (hand-written TS with single-quoted objects)
{
  const p = 'src/data/spots/seoul.ts';
  let s = readFileSync(p, 'utf8');
  for (const [id, cn] of Object.entries(SEOUL_52)) {
    const re = new RegExp(`(id: ${id},[\\s\\S]*?name: \\{ ko: '[^']*', en: '[^']*', ja: '[^']*')( \\})`);
    if (!re.test(s)) throw new Error(`seoul id ${id} name not found`);
    const tw = cn2tw(cn);
    s = s.replace(re, (_, a, b) => `${a}, 'zh-cn': ${JSON.stringify(cn).replace(/"/g, "'")}, 'zh-tw': ${JSON.stringify(tw).replace(/"/g, "'")}${b}`);
    review.push({ source: 'seoul-52', id, ko: s.match(new RegExp(`id: ${id},[\\s\\S]*?name: \\{ ko: '([^']*)'`))[1], zh_cn: cn, zh_tw: tw, origin: 'draft' });
  }
  writeFileSync(p, s);
}

// --- 2) Seoul official 79 (generated TS, double-quoted)
{
  const csv = readFileSync('docs/review/phase1-seoul-spots.csv', 'utf8').replace(/^﻿/, '').trim().split(/\r?\n/);
  const head = csv[0].split(',');
  const parse = (l) => l.match(/("([^"]|"")*"|[^,]*)(,|$)/g).slice(0, head.length).map((c) => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'));
  const rows = csv.slice(1).map((l) => Object.fromEntries(parse(l).map((v, i) => [head[i], v])));
  const p = 'src/data/spots/seoulOfficial.ts';
  let s = readFileSync(p, 'utf8');
  for (const r of rows) {
    const cn = r['name_zh_cn (phase 4)'], tw = r['name_zh_tw (phase 4)'];
    const re = new RegExp(`(id: ${r.id},[\\s\\S]*?name: \\{ ko: "[^"]*", en: "[^"]*", ja: "[^"]*")( \\},\\n    area: \\{ ko: "[^"]*", en: "[^"]*", ja: "([^"]*)")( \\})`);
    const m = s.match(re);
    if (!m) throw new Error(`official id ${r.id} not found`);
    const [acn, atw] = areaZh(m[3]);
    s = s.replace(re, (_, a, b, _ja, c) => `${a}, "zh-cn": ${JSON.stringify(cn)}, "zh-tw": ${JSON.stringify(tw)}${b}, "zh-cn": ${JSON.stringify(acn)}, "zh-tw": ${JSON.stringify(atw)}${c}`);
    review.push({ source: 'seoul-official', id: r.id, ko: r.name_ko, zh_cn: cn, zh_tw: tw, origin: 'draft' });
  }
  writeFileSync(p, s);
}

// --- 3) Jeju/Busan forecast spots (JSON inside TS)
{
  const p = 'src/data/spots/forecastSpots.ts';
  const s = readFileSync(p, 'utf8');
  const start = s.indexOf('= [') + 2, end = s.lastIndexOf(']') + 1;
  const spots = JSON.parse(s.slice(start, end));
  for (const sp of spots) {
    let cn = FORECAST[sp.ktoName], tw, origin = 'draft';
    if (!cn) throw new Error(`no zh draft for ${sp.ktoName}`);
    tw = cn2tw(cn);
    if (sp.city === 'busan') {
      const off = bKo.find((a) => norm(a.MAIN_TITLE) === norm(sp.ktoName) || norm(a.MAIN_TITLE) === norm(sp.name.ko));
      if (off && zhs.get(off.UC_SEQ) && zht.get(off.UC_SEQ)) {
        cn = zhs.get(off.UC_SEQ).trim();
        tw = zht.get(off.UC_SEQ).trim();
        origin = 'busan-official';
      }
    }
    sp.name['zh-cn'] = cn;
    sp.name['zh-tw'] = tw;
    const [acn, atw] = areaZh(sp.area.ja);
    sp.area['zh-cn'] = acn;
    sp.area['zh-tw'] = atw;
    review.push({ source: sp.city, id: sp.id, ko: sp.name.ko, zh_cn: cn, zh_tw: tw, origin });
  }
  writeFileSync(p, s.slice(0, start) + JSON.stringify(spots, null, 2) + s.slice(end));
}

const cols = ['source', 'id', 'ko', 'zh_cn', 'zh_tw', 'origin'];
const esc = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
writeFileSync('docs/review/phase4-zh-names.csv', '﻿' + [cols.join(','), ...review.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n') + '\n');
console.log(JSON.stringify({ total: review.length, byOrigin: review.reduce((a, r) => ((a[r.origin] = (a[r.origin] || 0) + 1), a), {}) }));
