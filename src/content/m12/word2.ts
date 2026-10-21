// 중2-1 활용(문장제) 유형 추가분 — m12.ts 에서 각 단원 skills 뒤에 붙인다
import type { ProblemDraft, Skill } from '../../core/types';
import type { Rng } from '../../core/rng';
import { F } from '../../core/frac';
import { dec } from '../../core/tex';
import { factorize, gcd, lcm } from '../../core/nt';
import { Plane } from '../../core/fig';
import { NAMES, fig, jo, mono, texChoices } from './util';
import { dotTex, expand } from './m2a';

const factTex = (n: number) =>
  factorize(n)
    .map(([p, e]) => (e === 1 ? `${p}` : `${p}^{${e}}`))
    .join(' \\times ');
const sys = (e1: string, e2: string) => `\\begin{cases} ${e1} \\\\ ${e2} \\end{cases}`;
const two = (r: Rng) => {
  const a = r.pick(NAMES);
  let b = r.pick(NAMES);
  while (b === a) b = r.pick(NAMES);
  return [a, b];
};
/** 분수 n/d 의 순환소수 TeX (짧은 것만) */
function decTex(n: number, d: number): string | null {
  const e = expand(n, d);
  if (e.rep.length === 0 || e.rep.length > 2 || e.pre.length > 2) return null;
  return dotTex(e.ip, e.pre, e.rep);
}
const onlyTwoFive = (d: number) => factorize(d).every(([p]) => p === 2 || p === 5);
/** 2, 5 이외 소인수의 곱 */
const badPart = (d: number) => factorize(d).filter(([p]) => p !== 2 && p !== 5).reduce((a, [p, e]) => a * p ** e, 1);
/** 단항식/다항식 항 TeX: [[계수, 변수부]] */
const polyT = (ts: [number, string][]) =>
  ts
    .filter(([c]) => c !== 0)
    .map(([c, v], i) => {
      const abs = Math.abs(c);
      const body = (abs === 1 && v ? '' : String(abs)) + v;
      return (c < 0 ? '-' : i === 0 ? '' : '+') + body;
    })
    .join(' ');

export const word2: Record<string, Skill[]> = {
  // ═══════════ m2a-1 유리수와 순환소수 ═══════════
  'm2a-1': [
    {
      id: 'misread',
      title: '잘못 보고 나타낸 순환소수',
      gen(r, level): ProblemDraft {
        for (let guard = 0; guard < 500; guard++) {
          const d = r.pick([3, 6, 9, 11, 12, 15, 18, 22, 30, 33, 36, 45]);
          const n = r.int(1, 2 * d);
          if (gcd(n, d) !== 1 || n % d === 0) continue;
          const tTrue = decTex(n, d);
          if (!tTrue) continue;
          // 분모를 잘못 본 사람: n/d1 (분자는 맞음)
          const d1 = r.pick([3, 7, 9, 11, 33, 99, 90, 45, 18].filter((x) => x !== d && gcd(n, x) === 1 && x > n / 3));
          if (d1 === undefined) continue;
          const t1 = decTex(n, d1);
          // 분자를 잘못 본 사람: n2/d (분모는 맞음)
          const n2 = r.int(1, 2 * d);
          if (n2 === n || gcd(n2, d) !== 1 || n2 % d === 0) continue;
          const t2 = decTex(n2, d);
          if (!t1 || !t2 || onlyTwoFive(d1)) continue;
          const [p1, p2] = two(r);
          const f1 = new F(n, d1);
          const f2 = new F(n2, d);
          const intro = `어떤 기약분수를 소수로 나타내는데`;
          const s1 = `${jo(p1, '은/는')} 분모를 잘못 보아 $${t1}$ 로 나타내었고`;
          const s2 = `${jo(p2, '은/는')} 분자를 잘못 보아 $${t2}$ 로 나타내었습니다`;
          const conv = [`$${t1} = ${f1.tex()}$ → 분자를 바르게 보았으므로 처음 분자는 $${n}$`, `$${t2} = ${f2.tex()}$ → 분모를 바르게 보았으므로 처음 분모는 $${d}$`];
          if (level === 1) {
            return {
              q: `${intro} ${s2}. 처음 기약분수의 분모를 구하세요.`,
              answer: { type: 'num', value: d },
              steps: [conv[1], `답: $${d}$`],
              hint: '순환소수를 먼저 기약분수로 바꾸세요.',
            };
          }
          if (level === 2) {
            return {
              q: `${intro} ${s1}, ${s2}. 처음 기약분수를 구하세요.`,
              answer: { type: 'num', value: n / d, display: 'frac', requireReduced: true },
              steps: [...conv, `처음 기약분수: $${new F(n, d).tex()}$`],
            };
          }
          const wr = [t1, t2, decTex(d, n) ?? `0.\\dot{${(n % 9) + 1}}`, decTex(n2, d1) ?? '0.\\dot{1}\\dot{2}', decTex(n + 1, d) ?? '0.\\dot{3}', decTex(n, d * 3) ?? '0.0\\dot{7}'];
          return {
            q: `${intro} ${s1}, ${s2}. 처음 기약분수를 순환소수로 바르게 나타낸 것은?`,
            answer: texChoices(r, tTrue, wr),
            steps: [...conv, `처음 기약분수는 $${new F(n, d).tex()}$`, `$${new F(n, d).tex()} = ${tTrue}$`],
          };
        }
        return { q: '$0.\\dot{3}$ 을 기약분수로 나타낼 때 분모를 구하세요.', answer: { type: 'num', value: 3 }, steps: ['$0.\\dot{3} = \\frac{3}{9} = \\frac{1}{3}$'] };
      },
    },
    {
      id: 'finite-word',
      title: '유한소수가 되는 조건 (서술형)',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          for (;;) {
            const B = r.pick([3, 7, 9, 3, 7]);
            const den = B * 2 ** r.int(1, 3) * 5 ** r.int(0, 1);
            const n = r.int(1, 20);
            if (gcd(n, den) !== 1) continue;
            const vals = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x % B === 0);
            return {
              q: `분수 $\\frac{${n}}{${den}}$ 에 어떤 한 자리 자연수 $a$ 를 곱하여 소수로 나타내면 유한소수가 됩니다. $a$ 가 될 수 있는 수를 모두 구하세요.`,
              answer: { type: 'set', values: vals },
              steps: [`$${den} = ${factTex(den)}$`, `기약분수의 분모에 $2$, $5$ 이외의 소인수가 없어야 하므로 $a$ 는 $${B}$ 의 배수`, `한 자리 자연수: $${vals.join(', ')}$`],
            };
          }
        }
        if (level === 2) {
          for (;;) {
            const B = r.pick([3, 7, 11, 13, 21, 33]);
            const den = B * 2 ** r.int(1, 3) * 5 ** r.int(0, 2);
            if (den > 1500) continue;
            let x = 0;
            for (let k = B; k < 100; k += B) if (k >= 10 && den % k === 0) {
              x = k;
              break;
            }
            if (!x) continue;
            const y = den / x;
            return {
              q: `분수 $\\frac{x}{${den}}$ 을 소수로 나타내면 유한소수가 되고, 기약분수로 나타내면 $\\frac{1}{y}$ 입니다. $x$ 가 가장 작은 두 자리 자연수일 때, $x + y$ 의 값을 구하세요.`,
              answer: { type: 'num', value: x + y },
              steps: [
                `$${den} = ${factTex(den)}$ 이므로 유한소수가 되려면 $x$ 는 $${B}$ 의 배수`,
                `약분하여 $\\frac{1}{y}$ 이 되려면 $x$ 는 $${den}$ 의 약수이기도 해야 합니다.`,
                `$${B}$ 의 배수이면서 $${den}$ 의 약수인 가장 작은 두 자리 수: $x = ${x}$`,
                `$\\frac{${x}}{${den}} = \\frac{1}{${y}}$ 이므로 $y = ${y}$, $x + y = ${x + y}$`,
              ],
            };
          }
        }
        for (;;) {
          const B1 = r.pick([3, 7, 9, 11, 13]);
          const B2 = r.pick([3, 7, 9, 11, 13, 21]);
          const d1 = B1 * 2 ** r.int(0, 3) * 5 ** r.int(0, 1);
          const d2 = B2 * 2 ** r.int(0, 2) * 5 ** r.int(0, 2);
          const n1 = r.int(1, 15);
          const n2 = r.int(1, 15);
          if (gcd(n1, d1) !== 1 || gcd(n2, d2) !== 1 || d1 === d2) continue;
          const L = lcm(badPart(d1), badPart(d2));
          if (L >= 100) continue;
          const twoDigit = L < 10 && r.chance(0.7);
          const ans = twoDigit ? L * Math.ceil(10 / L) : L;
          const big = !twoDigit && r.chance(0.4);
          const ans2 = big ? L * Math.floor(99 / L) : ans;
          return {
            q: `두 분수 $\\frac{${n1}}{${d1}}$, $\\frac{${n2}}{${d2}}$ 에 각각 어떤 자연수 $a$ 를 곱하면 두 분수 모두 유한소수로 나타낼 수 있습니다. $a$ 가 될 수 있는 ${big ? '가장 큰 두 자리 자연수' : twoDigit ? '가장 작은 두 자리 자연수' : '가장 작은 자연수'}를 구하세요.`,
            answer: { type: 'num', value: ans2 },
            steps: [
              `${factTex(d1) === String(d1) ? `분모 $${d1}$ 은 소수` : `$${d1} = ${factTex(d1)}$`} → $a$ 는 $${badPart(d1)}$ 의 배수`,
              `${factTex(d2) === String(d2) ? `분모 $${d2}$ 는 소수` : `$${d2} = ${factTex(d2)}$`} → $a$ 는 $${badPart(d2)}$ 의 배수`,
              `따라서 $a$ 는 $${badPart(d1)}$ 과 $${badPart(d2)}$ 의 공배수, 즉 $${L}$ 의 배수`,
              `답: $${ans2}$`,
            ],
            hint: '두 분모를 소인수분해해서 2, 5 이외의 소인수를 찾으세요.',
          };
        }
      },
    },
  ],

  // ═══════════ m2a-2 식의 계산 ═══════════
  'm2a-2': [
    {
      id: 'shape-expr',
      title: '도형에서 식의 계산 활용',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const p = r.int(2, 6);
          const q = r.int(2, 6);
          const [i, j, k, l] = [r.int(1, 2), r.int(0, 2), r.int(1, 2), r.int(1, 2)];
          const wid = mono(p, [['a', i], ['b', j]]);
          const hgt = mono(q, [['a', k], ['b', l]]);
          const tri = r.chance(0.5);
          if (tri && (p * q) % 2 !== 0) return this.gen(r, level);
          const area = mono(tri ? (p * q) / 2 : p * q, [['a', i + k], ['b', j + l]]);
          return {
            q: tri
              ? `밑변의 길이가 $${wid}$ 이고 넓이가 $${area}$ 인 삼각형의 높이를 구하세요.`
              : `넓이가 $${area}$ 이고 가로의 길이가 $${wid}$ 인 직사각형의 세로의 길이를 구하세요.`,
            answer: texChoices(r, hgt, [mono(q, [['a', k + 1], ['b', l]]), mono(tri ? new F(q, 2) : p * q, [['a', k], ['b', l]]), mono(q, [['a', i + k], ['b', j + l]]), mono(2 * q, [['a', k], ['b', l]]), mono(q, [['a', k], ['b', l + 1]])]),
            steps: tri
              ? [`$\\frac{1}{2} \\times ${wid} \\times (\\text{높이}) = ${area}$`, `(높이) $= ${area} \\times 2 \\div ${wid} = ${hgt}$`]
              : [`(세로) $=$ (넓이) $\\div$ (가로)`, `$${area} \\div ${wid} = ${hgt}$`],
          };
        }
        if (level === 2) {
          const p = r.int(1, 4);
          const q = r.int(2, 5);
          const s = r.int(1, 4);
          const t = r.nonzero(-4, 4);
          const pq = p * q;
          const V = polyT([[pq * s, 'a^{2}b'], [pq * t, 'ab^{2}']]);
          const h = polyT([[s, 'a'], [t, 'b']]);
          const base = mono(pq, [['a', 1], ['b', 1]]);
          return {
            q: `밑면의 가로의 길이가 $${mono(p, [['a', 1]])}$, 세로의 길이가 $${mono(q, [['b', 1]])}$ 인 직육면체의 부피가 $${V}$ 일 때, 이 직육면체의 높이를 구하세요.`,
            answer: texChoices(r, h, [polyT([[pq * s, 'a'], [pq * t, 'b']]), polyT([[s, 'a'], [-t, 'b']]), polyT([[s, 'a^{2}'], [t, 'b^{2}']]), polyT([[t, 'a'], [s, 'b']]), polyT([[s, 'ab'], [t, 'ab']])]),
            steps: [`밑넓이: $${mono(p, [['a', 1]])} \\times ${mono(q, [['b', 1]])} = ${base}$`, `(높이) $= (${V}) \\div ${base}$`, `$= ${h}$`],
          };
        }
        const k = r.int(1, 3);
        const s = k === 3 ? r.int(1, 4) : 3 * r.int(1, 2);
        const t = k === 3 ? r.int(1, 4) : 3 * r.int(1, 2);
        const cA = (k * k * s) / 3;
        const cB = (k * k * t) / 3;
        const V = `${cA === 1 ? '' : cA}\\pi a^{3} + ${cB === 1 ? '' : cB}\\pi a^{2}b`;
        const h = polyT([[s, 'a'], [t, 'b']]);
        const rad = mono(k, [['a', 1]]);
        return {
          q: `밑면의 반지름의 길이가 $${rad}$ 인 원뿔의 부피가 $${V}$ 일 때, 이 원뿔의 높이를 구하세요.`,
          answer: texChoices(r, h, [polyT([[cA, 'a'], [cB, 'b']]), polyT([[3 * cA, 'a'], [3 * cB, 'b']]), polyT([[s, 'a^{2}'], [t, 'ab']]), polyT([[t, 'a'], [s, 'b']]), polyT([[s, 'a'], [-t, 'b']])]),
          steps: [
            `원뿔의 부피 $= \\frac{1}{3} \\times (\\text{밑넓이}) \\times (\\text{높이})$, 밑넓이 $= \\pi(${rad})^{2} = ${k * k === 1 ? '' : k * k}\\pi a^{2}$`,
            `높이를 $h$ 라 하면 $\\frac{1}{3} \\times ${k * k === 1 ? '' : k * k}\\pi a^{2} \\times h = ${V}$`,
            `$h = (${V}) \\times \\frac{3}{${k * k === 1 ? '' : k * k}\\pi a^{2}} = ${h}$`,
          ],
          hint: '원뿔의 부피에는 1/3 이 곱해져 있어요.',
        };
      },
    },
    {
      id: 'exp-word',
      title: '지수법칙의 활용',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          if (r.chance(0.5)) {
            const p = r.int(1, 9);
            const unit = r.pick(['MB', 'GB']);
            const ans = p + (unit === 'MB' ? 20 : 30);
            return {
              q: `컴퓨터 저장 용량의 단위 사이에는 $1\\text{ KB} = 2^{10}\\text{ B}$, $1\\text{ MB} = 2^{10}\\text{ KB}$, $1\\text{ GB} = 2^{10}\\text{ MB}$ 인 관계가 있습니다. $2^{${p}}\\text{ ${unit}}$ 는 $2^{\\square}\\text{ B}$ 일 때, $\\square$ 안에 알맞은 수를 구하세요.`,
              answer: { type: 'num', value: ans },
              steps: [unit === 'MB' ? `$1\\text{ MB} = 2^{10} \\times 2^{10}\\text{ B} = 2^{20}\\text{ B}$` : `$1\\text{ GB} = 2^{10} \\times 2^{10} \\times 2^{10}\\text{ B} = 2^{30}\\text{ B}$`, `$2^{${p}} \\times 2^{${unit === 'MB' ? 20 : 30}} = 2^{${ans}}$`, `답: $${ans}$`],
            };
          }
          const a = r.pick([10, 15, 20, 30]);
          const k = r.int(3, 12);
          return {
            q: `어떤 세균 한 마리는 $${a}$ 분마다 한 번씩 분열하여 $2$ 마리가 됩니다. 이 세균 한 마리가 $${a * k}$ 분 후에 $2^{\\square}$ 마리가 될 때, $\\square$ 안에 알맞은 수를 구하세요.`,
            answer: { type: 'num', value: k },
            steps: [`$${a * k}$ 분 동안 분열 횟수: $${a * k} \\div ${a} = ${k}$ 번`, `한 번 분열할 때마다 $2$ 배가 되므로 $\\underbrace{2 \\times \\cdots \\times 2}_{${k}} = 2^{${k}}$ 마리`, `답: $${k}$`],
          };
        }
        if (level === 2) {
          if (r.chance(0.5)) {
            const a = r.int(3, 6);
            const b = r.int(1, a - 1);
            return {
              q: `한 모서리의 길이가 $2^{${a}}$ cm 인 정육면체 모양의 상자에 한 모서리의 길이가 $2^{${b}}$ cm 인 정육면체 모양의 블록을 빈틈없이 채우려고 합니다. 필요한 블록은 $2^{\\square}$ 개일 때, $\\square$ 안에 알맞은 수를 구하세요.`,
              answer: { type: 'num', value: 3 * (a - b) },
              steps: [`한 모서리를 따라 $2^{${a}} \\div 2^{${b}} = 2^{${a - b}}$ 개씩 놓입니다.`, `$(2^{${a - b}})^{3} = 2^{${3 * (a - b)}}$ 개`, `답: $${3 * (a - b)}$`],
            };
          }
          const m0 = r.int(1, 6);
          const h = r.pick([1, 2, 3]);
          const t = h * r.int(2, 6);
          const e = m0 + (2 * t) / h;
          return {
            q: `어떤 미생물이 처음에 $2^{${m0}}$ 마리 있었고, $${h}$ 시간마다 수가 $4$ 배씩 늘어납니다. $${t}$ 시간 후 이 미생물의 수를 $2^{\\square}$ 마리로 나타낼 때, $\\square$ 안에 알맞은 수를 구하세요.`,
            answer: { type: 'num', value: e },
            steps: [`$${t}$ 시간 동안 $4$ 배씩 $${t / h}$ 번 늘어나므로 $2^{${m0}} \\times 4^{${t / h}}$`, `$4^{${t / h}} = (2^{2})^{${t / h}} = 2^{${(2 * t) / h}}$`, `$2^{${m0}} \\times 2^{${(2 * t) / h}} = 2^{${e}}$, 답: $${e}$`],
          };
        }
        if (r.chance(0.5)) {
          const c10 = r.pick([12, 15, 24, 36, 45, 60]);
          const n = r.int(6, 9);
          const sec = (c10 / 3) * 10 ** (n - 6);
          const c = dec(c10 / 10);
          const where = r.pick(['어느 행성', '어느 우주 탐사선', '어느 소행성']);
          return {
            q: `빛은 $1$ 초에 $3 \\times 10^{5}$ km 를 갑니다. 지구에서 ${where}까지의 거리가 $${c} \\times 10^{${n}}$ km 일 때, ${where}에서 출발한 빛이 지구에 도착하는 데 걸리는 시간은 몇 초인지 구하세요.`,
            answer: { type: 'num', value: sec, unit: '초' },
            steps: [`(시간) = (거리) ÷ (속력) $= (${c} \\times 10^{${n}}) \\div (3 \\times 10^{5})$`, `$= (${c} \\div 3) \\times 10^{${n} - 5} = ${dec(c10 / 30)} \\times 10^{${n - 5}}$`, `$= ${sec}$ (초)`],
          };
        }
        for (;;) {
          const p = r.int(1, 5);
          const q = r.int(1, 5);
          const h1 = r.pick([10, 15, 20, 30]);
          const h2 = r.pick([20, 30, 40, 60]);
          const T = lcm(h1, h2) * r.int(1, 3);
          if (T > 240) continue;
          const e = p + T / h1 - (q + (2 * T) / h2);
          if (e < 1) continue;
          return {
            q: `세균 A 는 처음에 $2^{${p}}$ 마리이고 $${h1}$ 분마다 $2$ 배가 되며, 세균 B 는 처음에 $2^{${q}}$ 마리이고 $${h2}$ 분마다 $4$ 배가 됩니다. $${T}$ 분 후 세균 A 의 수는 세균 B 의 수의 $2^{\\square}$ 배일 때, $\\square$ 안에 알맞은 수를 구하세요.`,
            answer: { type: 'num', value: e },
            steps: [
              `A: $2^{${p}} \\times 2^{${T / h1}} = 2^{${p + T / h1}}$ 마리`,
              `B: $2^{${q}} \\times 4^{${T / h2}} = 2^{${q}} \\times 2^{${(2 * T) / h2}} = 2^{${q + (2 * T) / h2}}$ 마리`,
              `$2^{${p + T / h1}} \\div 2^{${q + (2 * T) / h2}} = 2^{${e}}$, 답: $${e}$`,
            ],
          };
        }
      },
    },
  ],

  // ═══════════ m2a-3 일차부등식 ═══════════
  'm2a-3': [
    {
      id: 'word-plan',
      title: '일차부등식의 활용 (요금·저금·농도)',
      gen(r, level): ProblemDraft {
        const [p1, p2] = two(r);
        if (level === 1) {
          for (;;) {
            const a = r.int(10, 40) * 1000;
            const b = r.int(1, 20) * 1000;
            const p = r.int(1, 5) * 1000;
            const q = p + r.int(1, 4) * 1000;
            if (b >= a) continue;
            const bound = (a - b) / (q - p);
            const n = Math.floor(bound) + 1;
            return {
              q: `현재 ${p1}의 저금통에는 $${a}$ 원, ${p2}의 저금통에는 $${b}$ 원이 들어 있습니다. 다음 달부터 매달 ${jo(p1, '은/는')} $${p}$ 원씩, ${jo(p2, '은/는')} $${q}$ 원씩 저금한다면, ${p2}의 저금액이 ${p1}의 저금액보다 많아지는 것은 몇 달 후부터인지 구하세요.`,
              answer: { type: 'num', value: n, unit: '달 후' },
              steps: [`$x$ 달 후라 하면 $${b} + ${q}x > ${a} + ${p}x$`, `$${q - p}x > ${a - b}$, $x > ${new F(a - b, q - p).tex()}$`, `이를 만족하는 가장 작은 자연수는 $${n}$ → $${n}$ 달 후부터`],
            };
          }
        }
        if (level === 2) {
          for (;;) {
            const a = r.int(1, 10) * 1000;
            const b = a + r.int(2, 15) * 1000;
            const p = r.int(3, 10) * 10;
            const q = p - r.int(1, 5) * 10;
            if (q <= 0) continue;
            if ((b - a) / (p - q) > 500) continue; // 한 달 통화 시간이 지나치게 길지 않게
            const bound = (b - a) / (p - q);
            const n = Math.floor(bound) + 1;
            return {
              q: `휴대 전화 요금제 A 는 기본요금이 $${a}$ 원이고 통화 $1$ 분마다 $${p}$ 원이 추가되며, 요금제 B 는 기본요금이 $${b}$ 원이고 통화 $1$ 분마다 $${q}$ 원이 추가됩니다. 한 달 통화 시간이 몇 분 이상이면 요금제 B 를 선택하는 것이 더 저렴한지 구하세요. (단, 통화 시간은 분 단위의 자연수이다.)`,
              answer: { type: 'num', value: n, unit: '분' },
              steps: [`통화 시간을 $x$ 분이라 하면 $${b} + ${q}x < ${a} + ${p}x$`, `$${p - q}x > ${b - a}$, $x > ${new F(b - a, p - q).tex()}$`, `가장 작은 자연수: $${n}$ → $${n}$ 분 이상`, `확인: $${n}$ 분일 때 A $${a + p * n}$ 원, B $${b + q * n}$ 원`],
            };
          }
        }
        const t = r.int(0, 2);
        if (t === 0) {
          for (;;) {
            const a = r.int(6, 20);
            const b = r.int(2, a - 1);
            const M = r.int(1, 8) * 100;
            if ((M * (a - b)) % b !== 0) continue;
            const w = (M * (a - b)) / b;
            return {
              q: `$${a}$% 의 소금물 $${M}$ g 에 물을 더 넣어서 농도가 $${b}$% 이하인 소금물을 만들려고 합니다. 물을 최소 몇 g 넣어야 하는지 구하세요.`,
              answer: { type: 'num', value: w, unit: 'g' },
              steps: [`넣는 물을 $x$ g 이라 하면 소금의 양 $\\frac{${a}}{100} \\times ${M} = ${(a * M) / 100}$ g 은 변하지 않습니다.`, `$\\frac{${(a * M) / 100}}{${M} + x} \\times 100 \\le ${b}$ → $${a * M} \\le ${b}(${M} + x)$`, `$${b}x \\ge ${M * (a - b)}$, $x \\ge ${w}$ → 최소 $${w}$ g`],
              hint: '물을 넣어도 소금의 양은 그대로예요.',
            };
          }
        }
        if (t === 1) {
          for (;;) {
            const T = r.int(20, 60);
            const s = r.int(5, 15);
            const v = r.int(5, 10) * 10;
            if (T - s < 6 || ((T - s) * v) % 2 !== 0) continue;
            const x = ((T - s) * v) / 2;
            return {
              q: `${jo(p1, '은/는')} 기차역에서 기차가 출발하기 전까지 $${T}$ 분의 여유가 있어서 역 근처 상점에 다녀오려고 합니다. 상점에서 물건을 사는 데 $${s}$ 분이 걸리고 분속 $${v}$ m 로 걷는다면, 역에서 최대 몇 m 떨어진 상점까지 다녀올 수 있는지 구하세요.`,
              answer: { type: 'num', value: x, unit: 'm' },
              steps: [`상점까지의 거리를 $x$ m 라 하면 $\\frac{x}{${v}} + ${s} + \\frac{x}{${v}} \\le ${T}$`, `$\\frac{2x}{${v}} \\le ${T - s}$, $2x \\le ${(T - s) * v}$`, `$x \\le ${x}$ → 최대 $${x}$ m`],
            };
          }
        }
        for (;;) {
          const N = r.pick([20, 25, 30, 40, 50]);
          const pct = r.pick([10, 20, 25, 30, 40]);
          const price = r.int(2, 12) * 1000;
          const bound = (N * (100 - pct)) / 100;
          const n = Math.floor(bound) + 1;
          if (n >= N) continue;
          return {
            q: `어느 미술관의 입장료는 한 사람당 $${price}$ 원이고, $${N}$ 명 이상의 단체는 입장료의 $${pct}$% 를 할인해 줍니다. $${N}$ 명 미만인 단체가 입장할 때, 몇 명 이상이면 $${N}$ 명의 단체 입장권을 사는 것이 유리한지 구하세요.`,
            answer: { type: 'num', value: n, unit: '명' },
            steps: [
              `$x$ 명이 입장한다고 하면 $${price}x > ${price} \\times \\frac{${100 - pct}}{100} \\times ${N}$`,
              `$x > ${dec(bound)}$`,
              `$${dec(bound)}$ 보다 큰 가장 작은 자연수는 $${n}$ → $${n}$ 명 이상`,
            ],
            hint: '단체 입장권은 실제 인원이 아니라 정해진 인원만큼 값을 내요.',
          };
        }
      },
    },
  ],

  // ═══════════ m2a-4 연립일차방정식 ═══════════
  'm2a-4': [
    {
      id: 'word-mix',
      title: '연립방정식의 활용 (나이·농도·일·강물)',
      gen(r, level): ProblemDraft {
        const name = r.pick(NAMES);
        if (level === 1) {
          for (;;) {
            const y = r.int(8, 16);
            const k = r.int(2, 10);
            const m = r.pick([2, 3]);
            const x = m * (y + k) - k;
            if (x - y < 22 || x > 55) continue;
            const askMom = r.chance(0.5);
            const who = r.pick(['어머니', '아버지', '삼촌', '이모']);
            return {
              q: `현재 ${jo(who, '과/와')} ${name}의 나이의 합은 $${x + y}$ 세이고, $${k}$ 년 후에는 ${who}의 나이가 ${name}의 나이의 $${m}$ 배가 됩니다. 현재 ${askMom ? who : name}의 나이를 구하세요.`,
              answer: { type: 'num', value: askMom ? x : y, unit: '세' },
              steps: [
                `현재 ${who}의 나이를 $x$ 세, ${name}의 나이를 $y$ 세라 하면 $${sys(`x + y = ${x + y}`, `x + ${k} = ${m}(y + ${k})`)}$`,
                `둘째 식: $x - ${m}y = ${m * k - k}$`,
                `첫째 식에서 빼면 $${m + 1}y = ${x + y - (m * k - k)}$, $y = ${y}$, $x = ${x}$`,
                `확인: $${k}$ 년 후 $${x + k} = ${m} \\times ${y + k}$ ✓`,
              ],
            };
          }
        }
        if (level === 2) {
          if (r.chance(0.5)) {
            for (;;) {
              const a = r.int(2, 8);
              const b = r.int(a + 2, 15);
              const x = r.int(1, 8) * 50;
              const y = r.int(1, 8) * 50;
              const M = x + y;
              if ((a * x + b * y) % M !== 0) continue;
              const c = (a * x + b * y) / M;
              if (c === a || c === b) continue;
              return {
                q: `$${a}$% 의 소금물과 $${b}$% 의 소금물을 섞어서 $${c}$% 의 소금물 $${M}$ g 을 만들었습니다. $${a}$% 의 소금물은 몇 g 섞었는지 구하세요.`,
                answer: { type: 'num', value: x, unit: 'g' },
                steps: [
                  `$${a}$% 소금물을 $x$ g, $${b}$% 소금물을 $y$ g 이라 하면 $${sys(`x + y = ${M}`, `\\frac{${a}}{100}x + \\frac{${b}}{100}y = \\frac{${c}}{100} \\times ${M}`)}$`,
                  `둘째 식에 $100$ 을 곱하면 $${a}x + ${b}y = ${c * M}$`,
                  `풀면 $x = ${x}$, $y = ${y}$`,
                ],
                hint: '섞기 전후 소금의 양이 같아요.',
              };
            }
          }
          for (;;) {
            const A = r.int(5, 30) * 1000;
            const B = r.int(5, 30) * 1000;
            const p = r.pick([10, 20, 30]);
            const q = r.pick([10, 20, 25, 40]);
            if (A === B) continue;
            const T = A - (A * p) / 100 + B - (B * q) / 100;
            const [X, Y] = r.pick([
              ['운동화', '가방'],
              ['티셔츠', '바지'],
              ['책', '필통'],
            ]);
            return {
              q: `정가의 합이 $${A + B}$ 원인 ${jo(X, '과/와')} ${jo(Y, '을/를')} 샀습니다. ${jo(X, '은/는')} 정가의 $${p}$%, ${jo(Y, '은/는')} 정가의 $${q}$% 를 할인받아 모두 $${T}$ 원을 냈습니다. ${X}의 정가를 구하세요.`,
              answer: { type: 'num', value: A, unit: '원' },
              steps: [
                `${X}의 정가를 $x$ 원, ${Y}의 정가를 $y$ 원이라 하면 $${sys(`x + y = ${A + B}`, `\\frac{${100 - p}}{100}x + \\frac{${100 - q}}{100}y = ${T}`)}$`,
                `둘째 식에 $100$ 을 곱하면 $${100 - p}x + ${100 - q}y = ${T * 100}$`,
                `풀면 $x = ${A}$, $y = ${B}$`,
              ],
            };
          }
        }
        if (r.chance(0.5)) {
          for (;;) {
            const [P, Q] = r.shuffle(r.pick([[6, 3], [12, 4], [10, 15], [20, 30], [12, 6], [24, 12], [15, 10], [20, 5], [8, 24], [28, 21], [18, 9]]));
            const a = (P * Q) / (P + Q);
            const b = r.int(1, P - 1);
            const c = (1 - b / P) * Q;
            if (Math.abs(c - Math.round(c)) > 1e-9 || b === a || Math.round(c) === a || c <= 0) continue;
            const ci = Math.round(c);
            const [p1, p2] = two(r);
            return {
              q: `어떤 일을 ${jo(p1, '과/와')} ${jo(p2, '이/가')} 함께 하면 $${a}$ 일 만에 끝낼 수 있습니다. 이 일을 ${jo(p1, '이/가')} 혼자 $${b}$ 일 동안 한 후 나머지를 ${jo(p2, '이/가')} 혼자 $${ci}$ 일 동안 하여 끝냈습니다. 이 일을 ${jo(p1, '이/가')} 혼자 하면 며칠이 걸리는지 구하세요.`,
              answer: { type: 'num', value: P, unit: '일' },
              steps: [
                `전체 일의 양을 $1$, 하루에 ${jo(p1, '이/가')} 하는 양을 $x$, ${jo(p2, '이/가')} 하는 양을 $y$ 라 하면 $${sys(`${a}x + ${a}y = 1`, `${b}x + ${ci}y = 1`)}$`,
                `풀면 $x = \\frac{1}{${P}}$, $y = \\frac{1}{${Q}}$`,
                `${jo(p1, '이/가')} 혼자 하면 $${P}$ 일`,
              ],
              hint: '하루에 하는 일의 양을 미지수로 놓으세요.',
            };
          }
        }
        for (;;) {
          const v = r.int(6, 20);
          const w = r.int(1, 5);
          if (w >= v) continue;
          const A = v - w;
          const B = v + w;
          const D = lcm(A, B) * r.int(1, 2);
          if (D > 120) continue;
          const t1 = D / A;
          const t2 = D / B;
          return {
            q: `강을 따라 $${D}$ km 떨어진 두 지점을 배로 왕복하는데, 강을 거슬러 올라갈 때는 $${t1}$ 시간, 내려올 때는 $${t2}$ 시간이 걸렸습니다. 정지한 물에서의 배의 속력과 강물의 속력은 각각 시속 몇 km 인지 구하세요. (단, 배와 강물의 속력은 각각 일정하다.)`,
            answer: { type: 'fields', fields: [{ label: '배', value: v, unit: 'km/h' }, { label: '강물', value: w, unit: 'km/h' }] },
            steps: [
              `배의 속력을 시속 $x$ km, 강물의 속력을 시속 $y$ km 라 하면 $${sys(`${t1}(x - y) = ${D}`, `${t2}(x + y) = ${D}`)}$`,
              `$x - y = ${A}$, $x + y = ${B}$`,
              `더하면 $2x = ${A + B}$, $x = ${v}$, $y = ${w}$`,
            ],
            hint: '거슬러 올라갈 때는 (배) − (강물), 내려올 때는 (배) + (강물)의 속력이에요.',
          };
        }
      },
    },
  ],

  // ═══════════ m2a-5 일차함수와 그래프 ═══════════
  'm2a-5': [
    {
      id: 'change-word',
      title: '일차함수의 활용 (용수철·물·연료)',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const L = r.int(10, 30);
          const c = r.pick([0.5, 1, 2, 3]);
          const k = r.int(2, 12) * 2;
          const y = L + c * k;
          return {
            q: `길이가 $${L}$ cm 인 용수철에 추를 매달면 무게 $1$ g 마다 용수철의 길이가 $${dec(c)}$ cm 씩 늘어납니다. 무게가 $x$ g 인 추를 매달았을 때 용수철의 길이를 $y$ cm 라 할 때, $y$ 를 $x$ 의 식으로 나타내고 $${k}$ g 인 추를 매달았을 때 용수철의 길이를 구하세요.`,
            answer: { type: 'num', value: y, unit: 'cm' },
            steps: [`$y = ${dec(c) === '1' ? '' : dec(c)}x + ${L}$`, `$x = ${k}$ 를 대입: $y = ${dec(c)} \\times ${k} + ${L} = ${dec(y)}$`, `답: $${dec(y)}$ cm`],
          };
        }
        if (level === 2) {
          for (;;) {
            const V = r.int(10, 50) * 10;
            const c = r.int(2, 12);
            const t = r.int(5, 40);
            const R = V - c * t;
            if (R < 0) continue;
            const empty = R === 0 || r.chance(0.3);
            const tt = empty ? V / c : t;
            if (!Number.isInteger(tt)) continue;
            return {
              q: `물이 $${V}$ L 들어 있는 물탱크에서 $1$ 분에 $${c}$ L 씩 일정하게 물이 빠져나갑니다. 물이 빠지기 시작한 지 $x$ 분 후 남은 물의 양을 $y$ L 라 할 때, ${empty ? '물이 모두 빠져나가는 것은 몇 분 후인지' : `남은 물의 양이 $${R}$ L 가 되는 것은 몇 분 후인지`} 구하세요.`,
              answer: { type: 'num', value: tt, unit: '분 후' },
              steps: [`$y = ${V} - ${c}x$`, `$${empty ? 0 : R} = ${V} - ${c}x$`, `$${c}x = ${V - (empty ? 0 : R)}$, $x = ${tt}$`],
            };
          }
        }
        if (r.chance(0.5)) {
          for (;;) {
            const k = r.pick([8, 10, 12, 15, 20]);
            const y0 = r.int(35, 60);
            const x1 = k * r.int(2, 8);
            const x2 = x1 + k * r.int(2, 10);
            const y1 = y0 - x1 / k;
            const y2 = y0 - x2 / k;
            if (y2 <= 5) continue;
            return {
              q: `연료가 가득 든 자동차가 일정한 빠르기로 달릴 때, 달린 거리 $x$ km 와 남은 연료의 양 $y$ L 사이에는 일차함수의 관계가 있습니다. $${x1}$ km 를 달렸을 때 남은 연료가 $${y1}$ L, $${x2}$ km 를 달렸을 때 남은 연료가 $${y2}$ L 였다면, 처음 연료로 모두 몇 km 를 달릴 수 있는지 구하세요.`,
              answer: { type: 'num', value: y0 * k, unit: 'km' },
              steps: [
                `기울기: $\\frac{${y2} - ${y1}}{${x2} - ${x1}} = ${new F(-1, k).tex()}$ (1 km 에 $${new F(1, k).tex()}$ L 사용)`,
                `$y = ${new F(-1, k).tex()}x + b$ 에 $(${x1}, ${y1})$ 대입: $b = ${y0}$ (처음 연료 $${y0}$ L)`,
                `$y = 0$ 일 때 $${new F(1, k).tex()}x = ${y0}$, $x = ${y0 * k}$`,
                `답: $${y0 * k}$ km`,
              ],
              hint: '연료가 다 떨어진다는 것은 y = 0 이라는 뜻이에요.',
            };
          }
        }
        for (;;) {
          const L = r.int(10, 25);
          const c = r.pick([0.2, 0.25, 0.4, 0.5, 1, 2]);
          const w1 = r.int(1, 6) * 10;
          const w2 = w1 + r.int(1, 6) * 10;
          const x = r.int(8, 24) * 5;
          const target = L + c * x;
          if (x <= w2) continue;
          const y1 = L + c * w1;
          const y2 = L + c * w2;
          if (Math.abs(y1 * 100 - Math.round(y1 * 100)) > 1e-6 || Math.abs(y2 * 100 - Math.round(y2 * 100)) > 1e-6) continue;
          return {
            q: `어떤 용수철에 무게가 $${w1}$ g 인 추를 매달았더니 길이가 $${dec(y1)}$ cm, $${w2}$ g 인 추를 매달았더니 길이가 $${dec(y2)}$ cm 가 되었습니다. 추의 무게와 용수철의 길이 사이에 일차함수의 관계가 있을 때, 용수철의 길이가 $${dec(target)}$ cm 가 되려면 몇 g 인 추를 매달아야 하는지 구하세요.`,
            answer: { type: 'num', value: x, unit: 'g' },
            steps: [
              `추의 무게를 $x$ g, 길이를 $y$ cm 라 하면 기울기 $\\frac{${dec(y2)} - ${dec(y1)}}{${w2} - ${w1}} = ${dec(c)}$`,
              `$y = ${dec(c)}x + b$ 에 $(${w1}, ${dec(y1)})$ 대입: $b = ${L}$ (처음 길이)`,
              `$${dec(target)} = ${dec(c)}x + ${L}$, $x = ${x}$`,
            ],
          };
        }
      },
    },
    {
      id: 'fee-word',
      title: '일차함수의 활용 (요금)',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          if (r.chance(0.5)) {
            const a = r.int(10, 40) * 1000;
            const b = r.int(2, 10) * 500;
            const k = r.int(2, 15);
            return {
              q: `어느 통신사의 데이터 요금제는 기본요금 $${a}$ 원에 데이터 $1$ GB 를 사용할 때마다 $${b}$ 원이 추가됩니다. 한 달 동안 데이터를 $x$ GB 사용했을 때의 요금을 $y$ 원이라 할 때, 데이터를 $${k}$ GB 사용했을 때의 요금을 구하세요.`,
              answer: { type: 'num', value: a + b * k, unit: '원' },
              steps: [`$y = ${b}x + ${a}$`, `$x = ${k}$ 일 때 $y = ${b} \\times ${k} + ${a} = ${a + b * k}$`],
            };
          }
          const a = r.int(1, 5) * 1000;
          const b = r.int(2, 10) * 100;
          const n = r.int(2, 15);
          return {
            q: `어느 주차장의 요금은 처음 $30$ 분까지 $${a}$ 원이고, $30$ 분이 지나면 $10$ 분마다 $${b}$ 원씩 추가됩니다. $30$ 분을 넘긴 시간을 $10$ 분 단위로 $x$ 번이라 할 때 주차 요금을 $y$ 원이라 하면, $${30 + 10 * n}$ 분 동안 주차했을 때의 요금을 구하세요.`,
            answer: { type: 'num', value: a + b * n, unit: '원' },
            steps: [`$y = ${b}x + ${a}$`, `$${30 + 10 * n}$ 분은 $30$ 분보다 $${10 * n}$ 분 더 → $x = ${n}$`, `$y = ${b} \\times ${n} + ${a} = ${a + b * n}$ 원`],
          };
        }
        if (level === 2) {
          for (;;) {
            const a = r.pick([3800, 4000, 4500, 4800]);
            const c = r.pick([100, 125, 200, 250]);
            const d = r.pick([100, 150]);
            const n = r.int(4, 40);
            const km = 2 + (n * c) / 1000;
            if (Math.abs(km * 100 - Math.round(km * 100)) > 1e-6) continue;
            const Y = a + d * n;
            return {
              q: `어느 도시의 택시 요금은 처음 $2$ km 까지 $${a}$ 원이고, $2$ km 를 넘으면 $${c}$ m 를 달릴 때마다 $${d}$ 원씩 올라갑니다. 택시 요금이 $${Y}$ 원 나왔을 때, 택시를 타고 달린 거리는 몇 km 인지 구하세요. (단, 요금은 거리에 따라서만 정해진다.)`,
              answer: { type: 'num', value: km, unit: 'km', display: Number.isInteger(km) ? 'int' : 'dec' },
              steps: [
                `$2$ km 를 넘은 뒤 $${c}$ m 마다 올라간 횟수를 $x$ 번이라 하면 요금 $y = ${d}x + ${a}$`,
                `$${Y} = ${d}x + ${a}$, $x = ${n}$`,
                `추가로 달린 거리: $${c} \\times ${n} = ${c * n}$ m $= ${dec((c * n) / 1000)}$ km`,
                `전체 거리: $2 + ${dec((c * n) / 1000)} = ${dec(km)}$ km`,
              ],
            };
          }
        }
        for (;;) {
          const a = r.int(5, 20) * 1000;
          const p = r.int(5, 20) * 100;
          const b = a + r.int(2, 15) * 1000;
          const q = p - r.int(1, 8) * 100;
          if (q <= 0) continue;
          const X = (b - a) / (p - q);
          if (!Number.isInteger(X) || X < 2 || X > 40) continue;
          const [h1, h2] = [r.int(1, 4), r.int(5, 10)];
          return {
            q: `자전거 대여점 A 는 기본요금 $${a}$ 원에 $1$ 시간마다 $${p}$ 원을 받습니다. 대여점 B 의 대여 시간 $x$ 시간과 요금 $y$ 원 사이에는 일차함수의 관계가 있고, $${h1}$ 시간 대여하면 $${b + q * h1}$ 원, $${h2}$ 시간 대여하면 $${b + q * h2}$ 원입니다. 두 대여점의 요금이 같아지는 대여 시간과 그때의 요금을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: '대여 시간', value: X, unit: '시간' }, { label: '요금', value: a + p * X, unit: '원' }] },
            steps: [
              `A: $y = ${p}x + ${a}$`,
              `B: 기울기 $\\frac{${b + q * h2} - ${b + q * h1}}{${h2} - ${h1}} = ${q}$, $(${h1}, ${b + q * h1})$ 대입하면 $y = ${q}x + ${b}$`,
              `$${p}x + ${a} = ${q}x + ${b}$ → $${p - q}x = ${b - a}$, $x = ${X}$`,
              `요금: $${p} \\times ${X} + ${a} = ${a + p * X}$ 원`,
            ],
          };
        }
      },
    },
  ],

  // ═══════════ m2a-6 일차함수와 일차방정식의 관계 ═══════════
  'm2a-6': [
    {
      id: 'meet-graph',
      title: '두 그래프의 교점 활용',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          for (;;) {
            const a = r.int(5, 40) * 5;
            const b = a + r.int(4, 40) * 5;
            const p = r.int(1, 10);
            const q = r.int(1, 10);
            if ((b - a) % (p + q) !== 0) continue;
            const t = (b - a) / (p + q);
            if (b - q * t < 0 || t > 30) continue;
            return {
              q: `물이 $${a}$ L 들어 있는 물통 A 에는 $1$ 분에 $${p}$ L 씩 물을 넣고, 물이 $${b}$ L 들어 있는 물통 B 에서는 $1$ 분에 $${q}$ L 씩 물을 빼냅니다. 동시에 시작할 때, 두 물통의 물의 양이 같아지는 것은 몇 분 후이고 그때의 물의 양은 몇 L 인지 구하세요.`,
              answer: { type: 'fields', fields: [{ label: '시간', value: t, unit: '분 후' }, { label: '물의 양', value: a + p * t, unit: 'L' }] },
              steps: [`$x$ 분 후 물의 양을 $y$ L 라 하면 A: $y = ${p}x + ${a}$, B: $y = -${q}x + ${b}$`, `두 그래프의 교점: $${p}x + ${a} = -${q}x + ${b}$, $${p + q}x = ${b - a}$, $x = ${t}$`, `$y = ${p} \\times ${t} + ${a} = ${a + p * t}$`],
            };
          }
        }
        if (level === 2) {
          for (;;) {
            const mA = r.pick([1, 1.5, 2]);
            const mB = r.pick([0.5, 1]);
            const a = r.int(0, 3);
            const b = a + r.int(2, 6);
            if (mA <= mB) continue;
            const X = (b - a) / (mA - mB);
            if (!Number.isInteger(X) || X < 6 || X > 12) continue;
            const Y = a + mA * X;
            if (Y > 24 || !Number.isInteger(a + 4 * mA) || !Number.isInteger(b + 4 * mB)) continue;
            const ymax = Math.max(12, Math.ceil((b + 4 * mB + 2) / 2) * 2);
            const P = new Plane(0, 8, 0, ymax, { w: 240, h: 260, step: 1, labels: true });
            P.fn((x) => a + mA * x, { a: 0, b: 4 });
            P.fn((x) => b + mB * x, { a: 0, b: 4, cls: 'acc2' });
            P.point(0, a, `(0, ${a})`, { dx: 22, dy: 8 });
            P.point(4, a + 4 * mA, `A (4, ${a + 4 * mA})`, { dx: 0, dy: -12 });
            P.point(0, b, `(0, ${b})`, { dx: 22, dy: -6, cls: 'acc2' });
            P.point(4, b + 4 * mB, `B (4, ${b + 4 * mB})`, { dx: 2, dy: 14, cls: 'acc2' });
            return {
              q: `그림은 두 요금제 A, B 에서 한 달 데이터 사용량 $x$ GB 와 요금 $y$ 만 원 사이의 관계를 나타낸 직선의 일부입니다. 두 요금제의 요금이 같아지는 데이터 사용량은 몇 GB 인지 구하세요.`,
              fig: fig(P),
              answer: { type: 'num', value: X, unit: 'GB' },
              steps: [
                `A: 두 점 $(0, ${a})$, $(4, ${a + 4 * mA})$ 를 지나므로 $y = ${dec(mA) === '1' ? '' : dec(mA)}x${a ? ` + ${a}` : ''}$`,
                `B: 두 점 $(0, ${b})$, $(4, ${b + 4 * mB})$ 를 지나므로 $y = ${dec(mB) === '1' ? '' : dec(mB)}x + ${b}$`,
                `$${dec(mA)}x${a ? ` + ${a}` : ''} = ${dec(mB)}x + ${b}$ → $${dec(mA - mB)}x = ${b - a}$, $x = ${X}$`,
                `답: $${X}$ GB (이때 요금은 $${dec(Y)}$ 만 원)`,
              ],
              hint: '그래프에서 두 점을 읽어 각 직선의 식을 먼저 구하세요.',
            };
          }
        }
        for (;;) {
          const vA = r.int(4, 8) * 10;
          const vB = vA + r.int(2, 6) * 10;
          const k = r.int(3, 12);
          const D = r.int(1, 8) * 100;
          if ((vB * k) % (vB - vA) !== 0 || (D + vB * k) % (vB - vA) !== 0) continue;
          const tm = (vB * k) / (vB - vA);
          const td = (D + vB * k) / (vB - vA);
          if (td > 90) continue;
          const [p1, p2] = two(r);
          return {
            q: `${jo(p1, '이/가')} 집에서 출발하여 분속 $${vA}$ m 로 공원을 향해 걸어간 지 $${k}$ 분 후에 ${jo(p2, '이/가')} 같은 집에서 출발하여 같은 길을 분속 $${vB}$ m 로 뒤따라갔습니다. ${jo(p1, '이/가')} 출발한 지 $x$ 분 후 집에서부터의 거리를 $y$ m 라 할 때, ${jo(p2, '이/가')} ${jo(p1, '을/를')} 따라잡는 것은 ${jo(p1, '이/가')} 출발한 지 몇 분 후이고, 그 뒤 두 사람 사이의 거리가 $${D}$ m 가 되는 것은 ${jo(p1, '이/가')} 출발한 지 몇 분 후인지 구하세요. (단, 공원까지는 충분히 멀다.)`,
            answer: { type: 'fields', fields: [{ label: '따라잡는 때', value: tm, unit: '분 후' }, { label: `거리 ${D} m`, value: td, unit: '분 후' }] },
            steps: [
              `${p1}: $y = ${vA}x$, ${p2}: $y = ${vB}(x - ${k})$ (단, $x \\ge ${k}$)`,
              `따라잡을 때: $${vA}x = ${vB}(x - ${k})$ → $${vB - vA}x = ${vB * k}$, $x = ${tm}$`,
              `거리가 $${D}$ m 일 때 (${p2}가 앞섬): $${vB}(x - ${k}) - ${vA}x = ${D}$ → $${vB - vA}x = ${D + vB * k}$, $x = ${td}$`,
            ],
            hint: '두 직선의 교점이 만나는 때예요.',
          };
        }
      },
    },
  ],
};

