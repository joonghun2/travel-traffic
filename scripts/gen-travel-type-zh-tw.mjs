// Adds Traditional Chinese (zh-tw) to the travel type test JSON files: every object with a
// 'zh-cn' value gets 'zh-tw' from OpenCC cn -> twp plus the overrides in gen-zh-tw.mjs.
// usage: node scripts/gen-travel-type-zh-tw.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import * as OpenCC from 'opencc-js';

const convert = OpenCC.Converter({ from: 'cn', to: 'twp' });
const OVERRIDES = [
  ['質量', '品質'],
  ['公交', '公車'],
  ['網紅', '網美'],
  ['打卡', '打卡'],
];
const tw = (s) => OVERRIDES.reduce((t, [a, b]) => t.split(a).join(b), convert(s));

const walk = (node) => {
  if (Array.isArray(node)) return node.forEach(walk);
  if (!node || typeof node !== 'object') return;
  if ('zh-cn' in node) {
    const v = node['zh-cn'];
    node['zh-tw'] = Array.isArray(v) ? v.map(tw) : tw(v);
  }
  Object.values(node).forEach(walk);
};

for (const f of ['questions', 'types', 'picks', 'ui']) {
  const path = `src/data/travel-type/${f}.json`;
  const data = JSON.parse(readFileSync(path, 'utf8'));
  walk(data);
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
  console.log('zh-tw added:', path);
}
