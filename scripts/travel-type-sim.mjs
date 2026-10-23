// Checks the travel type test balance: stat ranges, type distribution under random answers,
// and whether "pure" answer patterns land on the intended type.
// usage: node scripts/travel-type-sim.mjs
import { readFileSync } from 'node:fs';

const { questions } = JSON.parse(readFileSync('src/data/travel-type/questions.json', 'utf8'));
const STATS = ['SOC', 'EXP', 'SEN', 'ACT', 'PLN', 'CRW'];

// Per stat: reachable min/max and the mean under uniform random answers. The mean maps to 50,
// so a neutral answer pattern sits in the middle and each axis splits about evenly.
const range = Object.fromEntries(
  STATS.map((s) => {
    let lo = 0;
    let hi = 0;
    let mu = 0;
    for (const q of questions) {
      const ws = q.options.map((o) => o.w[s] ?? 0);
      lo += Math.min(...ws);
      hi += Math.max(...ws);
      mu += ws.reduce((a, b) => a + b, 0) / ws.length;
    }
    return [s, [lo, hi, mu]];
  })
);

export function score(answers) {
  const raw = Object.fromEntries(STATS.map((s) => [s, 0]));
  answers.forEach((a, i) => {
    for (const [s, w] of Object.entries(questions[i].options[a].w)) raw[s] += w;
  });
  return Object.fromEntries(
    STATS.map((s) => {
      const [lo, hi, mu] = range[s];
      const v = raw[s] >= mu ? 50 + (50 * (raw[s] - mu)) / (hi - mu) : 50 - (50 * (mu - raw[s])) / (mu - lo);
      return [s, Math.round(v)];
    })
  );
}

const typeOf = (st) => `${st.SOC >= 50 ? 'S' : 's'}${st.EXP >= 50 ? 'E' : 'e'}${st.ACT >= 50 ? 'A' : 'a'}`;
const NAMES = {
  sEa: '낭만 고독자', sEA: '고독한 탐험가', sea: '사색하는 산책자', seA: '버킷리스트 헌터',
  SEa: '다정한 로컬러', SEA: '골목 모험대장', Sea: '힐링 메이트', SeA: '에너자이저 리더',
};

console.log('stat ranges (raw min..max):', range);
const N = 200000;
const counts = {};
const statSum = Object.fromEntries(STATS.map((s) => [s, 0]));
for (let n = 0; n < N; n++) {
  const ans = questions.map((q) => Math.floor(Math.random() * q.options.length));
  const st = score(ans);
  const t = typeOf(st);
  counts[t] = (counts[t] ?? 0) + 1;
  STATS.forEach((s) => (statSum[s] += st[s]));
}
console.log('\nrandom answers, type share:');
for (const t of Object.keys(NAMES)) console.log(`  ${NAMES[t].padEnd(10, '　')} ${((100 * (counts[t] ?? 0)) / N).toFixed(1)}%`);
console.log('mean stat:', Object.fromEntries(STATS.map((s) => [s, Math.round(statSum[s] / N)])));

// Persona check: for each type, always pick the option that best matches its direction.
const dir = { S: 1, s: -1, E: 1, e: -1, A: 1, a: -1 };
console.log('\npersona check (best-matching option every time):');
for (const t of Object.keys(NAMES)) {
  const want = { SOC: dir[t[0]], EXP: dir[t[1]], ACT: dir[t[2]] };
  const ans = questions.map((q) =>
    q.options
      .map((o, i) => [i, Object.entries(want).reduce((acc, [s, d]) => acc + d * (o.w[s] ?? 0), 0)])
      .sort((a, b) => b[1] - a[1])[0][0]
  );
  const st = score(ans);
  console.log(`  ${NAMES[t].padEnd(10, '　')} -> ${NAMES[typeOf(st)]}  ${JSON.stringify(st)}`);
}
