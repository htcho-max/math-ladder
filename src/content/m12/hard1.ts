// 중1 심화·최상위 유형 추가분 — m12.ts 에서 각 단원 skills 뒤에 붙이고 top 으로 넣는다
import type { ProblemDraft, Skill } from '../../core/types';
import type { Rng } from '../../core/rng';
import { F } from '../../core/frac';
import { divisors, factorize, gcd, lcm } from '../../core/nt';
import { linTex, makeChoices } from '../../core/tex';
import { Svg } from '../../core/fig';
import { NAMES, fp } from './util';

export type HardSet = { skills: Skill[]; top: Skill[] };

export const DEG = '^{\\circ}';
/** 분수 TeX */
export const fx = (n: number, d = 1) => new F(n, d).tex();
export const factTex = (n: number) =>
  factorize(n)
    .map(([p, e]) => (e === 1 ? `${p}` : `${p}^{${e}}`))
    .join(' \\times ');
/** 안전한 반복 생성: ok 가 값을 돌려줄 때까지 (최대 2000번) */
export function retry(f: () => ProblemDraft | null, fallback: () => ProblemDraft): ProblemDraft {
  for (let i = 0; i < 2000; i++) {
    const v = f();
    if (v !== null) return v;
  }
  return fallback();
}
const lt = (a: number, b: number) => linTex(a, b);
const nd = (n: number) => divisors(n).length;

/** 자연수 n 의 곱 분해 (인수 ≥2, 내림차순) */
function mparts(n: number, max = n): number[][] {
  if (n === 1) return [[]];
  const out: number[][] = [];
  for (let f = Math.min(n, max); f >= 2; f--) if (n % f === 0) for (const rest of mparts(n / f, f)) out.push([f, ...rest]);
  return out;
}

// ═══════════════════ m1a-1 소인수분해 ═══════════════════
const m1a1: HardSet = {
  skills: [
    {
      id: 'square-make',
      title: '제곱인 수 만들기',
      gen(r, level): ProblemDraft {
        return retry(
          () => {
            const primes = level === 1 ? [2, 3, 5] : [2, 3, 5, 7];
            const ps = r.sample(primes, r.int(1, level === 1 ? 2 : 3)).sort((a, b) => a - b);
            const s = ps.reduce((a, p) => a * p, 1);
            const k = r.int(2, level === 1 ? 4 : 6);
            const n = s * k * k;
            if (n < 12 || n > (level === 1 ? 200 : level === 2 ? 900 : 2000)) return null;
            const odd = `지수가 홀수인 소인수: ${ps.map((p) => `$${p}$`).join(', ')}`;
            if (level === 1) {
              return {
                q: `$${n}$ 에 가장 작은 자연수 $a$ 를 곱하여 어떤 자연수의 제곱이 되게 하려고 합니다. $a$ 의 값을 구하세요.`,
                answer: { type: 'num', value: s },
                steps: [`$${n} = ${factTex(n)}$`, `제곱인 수는 모든 소인수의 지수가 짝수입니다.`, odd, ps.length > 1 ? `$a = ${ps.join(' \\times ')} = ${s}$` : `$a = ${s}$`],
                hint: '먼저 소인수분해하고 지수를 살펴보세요.',
              };
            }
            if (level === 2) {
              return {
                q: `$${n}$ 에 가장 작은 자연수 $a$ 를 곱하면 자연수 $b$ 의 제곱이 됩니다. $a$, $b$ 의 값을 구하세요.`,
                answer: { type: 'fields', fields: [{ label: 'a', value: s }, { label: 'b', value: s * k }] },
                steps: [`$${n} = ${factTex(n)}$`, odd, `$a = ${s}$ 이고 $${n} \\times ${s} = ${n * s} = ${factTex(n * s)} = ${s * k}^{2}$`, `따라서 $a = ${s}$, $b = ${s * k}$`],
              };
            }
            if (r.chance(0.5)) {
              const N = r.pick([100, 200, 300, 500]);
              const ts: number[] = [];
              for (let t = 1; s * t * t <= N; t++) ts.push(s * t * t);
              if (ts.length < 2) return null;
              return {
                q: `$${n} \\times a$ 가 어떤 자연수의 제곱이 되도록 하는 $${N}$ 이하의 자연수 $a$ 는 모두 몇 개인지 구하세요.`,
                answer: { type: 'num', value: ts.length, unit: '개' },
                steps: [
                  `$${n} = ${factTex(n)}$ 이므로 ${odd}`,
                  `$a$ 는 $${s} \\times$ (자연수의 제곱) 꼴이어야 합니다.`,
                  `$${N}$ 이하: ${ts.map((x) => `$${x}$`).join(', ')}`,
                  `답: $${ts.length}$ 개`,
                ],
                hint: '가장 작은 a 를 찾은 뒤, 거기에 제곱인 수를 곱해도 된다는 점을 생각하세요.',
              };
            }
            const ts = divisors(k).map((t) => s * t * t);
            if (ts.length < 2) return null;
            return {
              q: `$\\frac{${n}}{a}$ 가 어떤 자연수의 제곱이 되도록 하는 자연수 $a$ 는 모두 몇 개인지 구하세요.`,
              answer: { type: 'num', value: ts.length, unit: '개' },
              steps: [
                `$${n} = ${factTex(n)}$ 이므로 ${odd}`,
                `$a$ 로 나누어 지수가 모두 짝수가 되려면 $a = ${s} \\times$ (제곱인 수) 이고, $\\frac{${n}}{a}$ 도 제곱인 수여야 합니다.`,
                `$\\frac{${n}}{${s}} = ${k * k} = ${k}^{2}$ 이므로 $a = ${s} \\times t^{2}$ ($t$ 는 $${k}$ 의 약수)`,
                `$a$: ${ts.map((x) => `$${x}$`).join(', ')}`,
                `답: $${ts.length}$ 개`,
              ],
            };
          },
          () => ({ q: '$12$ 에 가장 작은 자연수 $a$ 를 곱하여 어떤 자연수의 제곱이 되게 할 때 $a$ 의 값을 구하세요.', answer: { type: 'num', value: 3 }, steps: ['$12 = 2^{2} \\times 3$', '$a = 3$'] }),
        );
      },
    },
  ],
  top: [
    {
      id: 'min-with-divisors',
      title: '약수의 개수가 주어진 가장 작은 수',
      gen(r): ProblemDraft {
        const K = r.pick([6, 8, 9, 10, 12, 15, 16, 18, 20]);
        const odd = r.chance(0.35);
        const P = odd ? [3, 5, 7, 11, 13] : [2, 3, 5, 7, 11];
        const pats = mparts(K);
        const val = (pt: number[]) => pt.reduce((a, f, i) => a * P[i] ** (f - 1), 1);
        const tex = (pt: number[]) => pt.map((f, i) => (f - 1 === 1 ? `${P[i]}` : `${P[i]}^{${f - 1}}`)).join(' \\times ');
        const letters = ['a', 'b', 'c', 'd', 'e'];
        const form = (pt: number[]) => pt.map((f, i) => (f - 1 === 1 ? letters[i] : `${letters[i]}^{${f - 1}}`)).join('');
        const best = pats.reduce((b, p) => (val(p) < val(b) ? p : b), pats[0]);
        const ans = val(best);
        const what = odd ? '홀수' : '자연수';
        return {
          q: `약수의 개수가 $${K}$ 개인 ${what} 중에서 가장 작은 수를 구하세요.`,
          answer: { type: 'num', value: ans },
          steps: [
            `$${odd ? '3^{p} \\times 5^{q} \\times \\cdots' : '2^{p} \\times 3^{q} \\times \\cdots'}$ 꼴의 약수의 개수는 $(p+1)(q+1)\\cdots$ 이므로, $${K}$ 을 $2$ 이상인 수의 곱으로 나타내 봅니다.`,
            `$${K} = ${pats.slice(1).map((p) => p.join(' \\times ')).join(' = ')}$ (또는 $${K}$ 그대로)`,
            `가능한 꼴($a$, $b$, $c$, $\\ldots$ 는 서로 다른 소수): ${pats.map((p) => `$${form(p)}$`).join(', ')}`,
            odd ? '홀수이므로 소인수 $2$ 는 쓸 수 없고, 지수가 큰 쪽에 작은 소수를 넣어야 수가 작아집니다.' : '지수가 큰 쪽에 작은 소수를 넣어야 수가 작아집니다.',
            ...pats.map((p) => `$${tex(p)} = ${val(p)}$`).reduce<string[]>((acc, s, i) => {
              if (i % 2 === 0) acc.push(s);
              else acc[acc.length - 1] += `, ${s}`;
              return acc;
            }, []),
            `이 중 가장 작은 수: $${ans}$`,
          ],
          hint: '약수의 개수 공식 (지수+1)의 곱을 거꾸로 이용하세요.',
        };
      },
    },
    {
      id: 'gcd-lcm-pairs',
      title: '최대공약수·최소공배수로 두 수 찾기',
      gen(r): ProblemDraft {
        return retry(
          () => {
            const G = r.int(2, 12);
            const ps = r.sample([2, 3, 5, 7], r.chance(0.6) ? 2 : 3);
            const pw = ps.map((p) => p ** r.int(1, p === 2 ? 3 : p === 3 ? 2 : 1));
            const Q = pw.reduce((a, b) => a * b, 1);
            if (Q > 420 || Q < 6) return null;
            const pairs: [number, number][] = [];
            for (let a = 1; a * a < Q; a++) if (Q % a === 0 && gcd(a, Q / a) === 1) pairs.push([a, Q / a]);
            const L = G * Q;
            const minS = Math.min(...pairs.map(([a, b]) => G * (a + b)));
            return {
              q: `두 자연수 $A$, $B$ ($A < B$) 의 최대공약수가 $${G}$, 최소공배수가 $${L}$ 입니다. 이를 만족하는 $A$, $B$ 의 순서쌍 $(A, B)$ 의 개수와 $A + B$ 의 최솟값을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: '순서쌍의 개수', value: pairs.length, unit: '개' }, { label: 'A + B 의 최솟값', value: minS }] },
              steps: [
                `$A = ${G}a$, $B = ${G}b$ ($a$, $b$ 는 서로소, $a < b$) 로 놓습니다.`,
                `최소공배수는 $${G}ab = ${L}$ 이므로 $ab = ${Q} = ${factTex(Q)}$`,
                `$a$, $b$ 가 서로소이므로 같은 소인수의 거듭제곱은 한쪽에 모두 들어가야 합니다.`,
                `$(a, b)$: ${pairs.map(([a, b]) => `$(${a}, ${b})$`).join(', ')}`,
                `$(A, B)$: ${pairs.map(([a, b]) => `$(${G * a}, ${G * b})$`).join(', ')} → $${pairs.length}$ 개`,
                `$A + B$ 의 최솟값: $${minS}$`,
              ],
              hint: '두 수를 최대공약수 × (서로소인 수) 로 나타내 보세요.',
            };
          },
          () => ({ q: '두 자연수의 최대공약수가 $2$, 최소공배수가 $12$ 일 때 두 수의 합의 최솟값을 구하세요.', answer: { type: 'num', value: 10 }, steps: ['$A = 2a$, $B = 2b$, $ab = 6$', '$(a, b) = (1, 6), (2, 3)$', '$4 + 6 = 10$'] }),
        );
      },
    },
  ],
};

// ═══════════════════ m1a-2 정수와 유리수 ═══════════════════
const m1a2: HardSet = {
  skills: [
    {
      id: 'abs-case',
      title: '절댓값이 주어진 두 수 (경우 나누기)',
      gen(r, level): ProblemDraft {
        const p = r.int(1, level === 3 ? 15 : 9);
        let q = r.int(1, level === 3 ? 15 : 9);
        if (q === p) q = p === 9 ? 8 : p + 1;
        const combos: [number, number][] = [
          [p, q],
          [p, -q],
          [-p, q],
          [-p, -q],
        ];
        const cases = `$a = ${p}$ 또는 $a = -${p}$, $b = ${q}$ 또는 $b = -${q}$`;
        if (level === 1) {
          const k = r.int(0, 2);
          const [ex, word, f] = [
            ['a + b', '최댓값', (a: number, b: number) => a + b],
            ['a - b', '최솟값', (a: number, b: number) => a - b],
            ['a - b', '최댓값', (a: number, b: number) => a - b],
          ][k] as [string, string, (a: number, b: number) => number];
          const vs = combos.map(([a, b]) => f(a, b));
          const v = k === 1 ? Math.min(...vs) : Math.max(...vs);
          const at = combos.find(([a, b]) => f(a, b) === v)!;
          return {
            q: `두 정수 $a$, $b$ 에 대하여 $|a| = ${p}$, $|b| = ${q}$ 일 때, $${ex}$ 의 ${word}을 구하세요.`,
            answer: { type: 'num', value: v },
            steps: [cases, `$a = ${at[0]}$, $b = ${at[1]}$ 일 때 $${ex}$ 가 ${k === 1 ? '가장 작습니다' : '가장 큽니다'}.`, `${word}: $${v}$`],
          };
        }
        if (level === 2) {
          const vals = [...new Set(combos.map(([a, b]) => a - b))];
          return {
            q: `두 정수 $a$, $b$ 에 대하여 $|a| = ${p}$, $|b| = ${q}$ 일 때, $a - b$ 의 값이 될 수 있는 수를 모두 구하세요.`,
            answer: { type: 'set', values: vals },
            steps: [cases, ...combos.map(([a, b]) => `$a = ${a}$, $b = ${b}$: $a - b = ${a - b}$`).slice(0, 4), `답: $${vals.join(', ')}$`],
          };
        }
        const sumPos = r.chance(0.5);
        const exprs: [string, (a: number, b: number) => number][] = [
          ['a - b', (a, b) => a - b],
          ['2a + b', (a, b) => 2 * a + b],
          ['a - 2b', (a, b) => a - 2 * b],
          ['b - a', (a, b) => b - a],
        ];
        const [et, ef] = r.pick(exprs);
        const ok = combos.filter(([a, b]) => a * b < 0 && (sumPos ? a + b > 0 : a + b < 0));
        const [a, b] = ok[0];
        const big = p > q ? 'a' : 'b';
        return {
          q: `두 정수 $a$, $b$ 에 대하여 $|a| = ${p}$, $|b| = ${q}$ 이고 $a \\times b < 0$, $a + b ${sumPos ? '>' : '<'} 0$ 일 때, $${et}$ 의 값을 구하세요.`,
          answer: { type: 'num', value: ef(a, b) },
          steps: [
            `$a \\times b < 0$ 이므로 $a$, $b$ 의 부호는 서로 다릅니다.`,
            `부호가 다른 두 수의 합의 부호는 절댓값이 큰 수의 부호를 따릅니다. 절댓값이 큰 수는 $${big}$ 입니다.`,
            `$a + b ${sumPos ? '>' : '<'} 0$ 이므로 $${big}$ 는 ${sumPos ? '양수' : '음수'} → $a = ${a}$, $b = ${b}$`,
            `$${et} = ${ef(a, b)}$`,
          ],
          hint: '먼저 a, b 의 부호를 정해 보세요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'abs-sum-min',
      title: '절댓값의 합의 최솟값',
      gen(r): ProblemDraft {
        const four = r.chance(0.5);
        const cs = r.sample([-9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], four ? 4 : 3).sort((a, b) => a - b);
        if (four && cs[2] - cs[1] < 2) cs[2] = cs[1] + 2 + r.int(0, 2);
        if (four && cs[3] <= cs[2]) cs[3] = cs[2] + r.int(1, 4);
        const f = (x: number) => cs.reduce((s, c) => s + Math.abs(x - c), 0);
        let mn = Infinity;
        const at: number[] = [];
        for (let x = -60; x <= 60; x++) {
          const v = f(x);
          if (v < mn) {
            mn = v;
            at.length = 0;
          }
          if (v === mn) at.push(x);
        }
        const shown = r.shuffle(cs);
        const expr = shown.map((c) => `|${lt(1, -c)}|`).join(' + ');
        if (!four) {
          return {
            q: `정수 $x$ 에 대하여 $${expr}$ 의 값이 가장 작을 때, 그 최솟값과 그때의 $x$ 의 값을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: '최솟값', value: mn }, { label: 'x', value: at[0] }] },
            steps: [
              `$|x - c|$ 는 수직선에서 $x$ 를 나타내는 점과 $c$ 를 나타내는 점 사이의 거리입니다.`,
              `세 점 $${cs.join('$, $')}$ 까지의 거리의 합을 생각합니다.`,
              `양 끝 두 점 $${cs[0]}$, $${cs[2]}$ 까지 거리의 합은 $x$ 가 그 사이에 있으면 항상 $${cs[2] - cs[0]}$ 으로 가장 작습니다.`,
              `가운데 점 $${cs[1]}$ 까지의 거리는 $x = ${cs[1]}$ 일 때 $0$ 으로 가장 작습니다.`,
              `따라서 $x = ${cs[1]}$ 일 때 최솟값 $${cs[2] - cs[0]} + 0 = ${mn}$`,
            ],
            hint: '절댓값을 수직선 위의 거리로 생각해 보세요.',
          };
        }
        return {
          q: `$${expr}$ 의 값이 가장 작게 되도록 하는 정수 $x$ 의 개수와 그 최솟값을 구하세요.`,
          answer: { type: 'fields', fields: [{ label: '최솟값', value: mn }, { label: '정수 x 의 개수', value: at.length, unit: '개' }] },
          steps: [
            `$|x - c|$ 는 수직선에서 $x$ 와 $c$ 사이의 거리이므로, 네 점 $${cs.join('$, $')}$ 까지의 거리의 합을 생각합니다.`,
            `바깥쪽 두 점 $${cs[0]}$, $${cs[3]}$ 까지 거리의 합은 $${cs[0]} \\le x \\le ${cs[3]}$ 일 때 $${cs[3] - cs[0]}$ 으로 가장 작습니다.`,
            `안쪽 두 점 $${cs[1]}$, $${cs[2]}$ 까지 거리의 합은 $${cs[1]} \\le x \\le ${cs[2]}$ 일 때 $${cs[2] - cs[1]}$ 으로 가장 작습니다.`,
            `두 조건을 함께 만족하는 범위: $${cs[1]} \\le x \\le ${cs[2]}$`,
            `최솟값: $${cs[3] - cs[0]} + ${cs[2] - cs[1]} = ${mn}$`,
            `이 범위의 정수: $${cs[1]}$ 부터 $${cs[2]}$ 까지 $${at.length}$ 개`,
          ],
          hint: '바깥 두 점, 안쪽 두 점으로 짝지어 보세요.',
        };
      },
    },
    {
      id: 'frac-between',
      title: '두 유리수 사이의 기약분수 개수',
      gen(r): ProblemDraft {
        return retry(
          () => {
            const b = r.int(2, 7);
            const a = r.int(1, 2 * b + 3);
            const d = r.int(2, 7);
            const c = r.int(1, 2 * d + 3);
            if (a % b === 0 || c % d === 0) return null;
            const D = r.pick([6, 8, 9, 10, 12, 14, 15]);
            const L = new F(-a, b);
            const R = new F(c, d);
            const lo = L.mul(D);
            const hi = R.mul(D);
            const all: number[] = [];
            for (let k = Math.ceil(lo.value - 1); k <= Math.floor(hi.value + 1); k++) if (lo.value < k && k < hi.value) all.push(k);
            const ks = all.filter((k) => gcd(Math.abs(k), D) === 1);
            if (ks.length < 4 || ks.length > 30) return null;
            const neg = ks.filter((k) => k < 0);
            const pos = ks.filter((k) => k > 0);
            const pr = factorize(D).map(([p]) => p);
            return {
              q: `두 유리수 $${L.tex()}$ 와 $${R.tex()}$ 사이에 있는 수 중에서 분모가 $${D}$ 인 기약분수로 나타낼 수 있는 수는 모두 몇 개인지 구하세요.`,
              answer: { type: 'num', value: ks.length, unit: '개' },
              steps: [
                `구하는 수를 $\\frac{k}{${D}}$ ($k$ 는 정수) 라 하면 $${L.tex()} < \\frac{k}{${D}} < ${R.tex()}$`,
                `각 변에 $${D}$ 를 곱하면 $${lo.tex()} < k < ${hi.tex()}$ 이므로 $k = ${all[0]}, \\ldots, ${all[all.length - 1]}$ ($${all.length}$ 개)`,
                `기약분수이려면 $k$ 와 $${D}$ 가 서로소, 즉 $k$ 가 ${pr.map((p) => `$${p}$`).join(', ')} 의 배수가 아니어야 합니다. ($k = 0$ 도 제외)`,
                neg.length ? `음수 쪽: ${neg.map((k) => `$${k}$`).join(', ')} → $${neg.length}$ 개` : '음수 쪽: 없음',
                pos.length ? `양수 쪽: ${pos.map((k) => `$${k}$`).join(', ')} → $${pos.length}$ 개` : '양수 쪽: 없음',
                `답: $${neg.length} + ${pos.length} = ${ks.length}$ 개`,
              ],
              hint: '분모를 통분해 분자의 범위를 먼저 구하세요.',
            };
          },
          () => ({ q: '$-\\frac{1}{2}$ 과 $\\frac{1}{2}$ 사이에 있는 분모가 $6$ 인 기약분수의 개수를 구하세요.', answer: { type: 'num', value: 2, unit: '개' }, steps: ['$-3 < k < 3$', '$k = -1, 1$'] }),
        );
      },
    },
  ],
};

// ═══════════════════ m1a-3 문자의 사용과 식의 계산 ═══════════════════
const m1a3: HardSet = {
  skills: [
    {
      id: 'wrong-calc',
      title: '잘못 계산한 식 바로잡기',
      gen(r, level): ProblemDraft {
        const fl = (a: number, b: number) => [
          { label: 'x 의 계수', value: a },
          { label: '상수항', value: b },
        ];
        const a1 = r.nonzero(-6, 6);
        const b1 = r.nonzero(-9, 9);
        let xa = r.nonzero(-7, 7);
        const xb = r.nonzero(-9, 9);
        if (level <= 2) {
          if (xa === a1) xa = a1 + 1 === 0 ? a1 + 2 : a1 + 1;
          const A = lt(a1, b1);
          const B = lt(xa - a1, xb - b1);
          if (level === 1) {
            return {
              q: `어떤 일차식에 $${A}$ 를 더해야 할 것을 잘못하여 뺐더니 $${B}$ 가 되었습니다. 어떤 일차식을 $ax + b$ 라 할 때, $a$, $b$ 의 값을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'a', value: xa }, { label: 'b', value: xb }] },
              steps: [`어떤 일차식을 $X$ 라 하면 $X - (${A}) = ${B}$`, `$X = ${B} + (${A}) = ${lt(xa, xb)}$`, `$a = ${xa}$, $b = ${xb}$`],
            };
          }
          const ca = xa + a1;
          const cb = xb + b1;
          if (ca === 0) return this.gen(r, level);
          return {
            q: `어떤 일차식에 $${A}$ 를 더해야 할 것을 잘못하여 뺐더니 $${B}$ 가 되었습니다. 바르게 계산한 식의 $x$ 의 계수와 상수항을 구하세요.`,
            answer: { type: 'fields', fields: fl(ca, cb) },
            steps: [`어떤 일차식을 $X$ 라 하면 $X - (${A}) = ${B}$ 이므로 $X = ${lt(xa, xb)}$`, `바르게 계산하면 $(${lt(xa, xb)}) + (${A}) = ${lt(ca, cb)}$`, `$x$ 의 계수 $${ca}$, 상수항 $${cb}$`],
            hint: '먼저 어떤 식을 구한 뒤 바르게 다시 계산하세요.',
          };
        }
        const k = r.pick([2, 3, -2, -3]);
        const p = r.nonzero(-4, 4);
        const q = r.nonzero(-5, 5);
        const Bx = xa + k * p;
        const Bc = xb + k * q;
        const cx = xa - k * p;
        const cc = xb - k * q;
        if (Bx === 0 || cx === 0) return this.gen(r, level);
        const KA = `${k}(${lt(p, q)})`;
        return {
          q: `어떤 다항식에서 $${KA}$ 를 빼야 할 것을 잘못하여 더했더니 $${lt(Bx, Bc)}$ 가 되었습니다. 바르게 계산한 식의 $x$ 의 계수와 상수항을 구하세요.`,
          answer: { type: 'fields', fields: fl(cx, cc) },
          steps: [
            `$${KA} = ${lt(k * p, k * q)}$`,
            `어떤 다항식을 $X$ 라 하면 $X + (${lt(k * p, k * q)}) = ${lt(Bx, Bc)}$`,
            `$X = (${lt(Bx, Bc)}) - (${lt(k * p, k * q)}) = ${lt(xa, xb)}$`,
            `바르게 계산하면 $(${lt(xa, xb)}) - (${lt(k * p, k * q)}) = ${lt(cx, cc)}$`,
            `$x$ 의 계수 $${cx}$, 상수항 $${cc}$`,
          ],
          hint: '분배법칙으로 괄호를 먼저 풀어 두세요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'matchstick-grid',
      title: '성냥개비 격자 규칙을 식으로',
      gen(r): ProblemDraft {
        const rows = r.int(2, 4);
        const n = r.int(12, 45);
        const M = (2 * rows + 1) * n + rows;
        const s = new Svg(300, 30 + 14 * rows + 22);
        let x0 = 12;
        for (let k = 1; k <= 3; k++) {
          const y0 = 12;
          for (let i = 0; i <= rows; i++) s.line(x0, y0 + 14 * i, x0 + 14 * k, y0 + 14 * i, { cls: 'acc' });
          for (let j = 0; j <= k; j++) s.line(x0 + 14 * j, y0, x0 + 14 * j, y0 + 14 * rows, { cls: 'acc' });
          s.text(x0 + 7 * k, y0 + 14 * rows + 16, ['첫 번째', '두 번째', '세 번째'][k - 1], { size: 12 });
          x0 += 14 * k + 40;
        }
        const ask = r.chance(0.5);
        const intro = `그림과 같이 성냥개비로 세로 $${rows}$ 칸, 가로 $1$ 칸, $2$ 칸, $3$ 칸, $\\ldots$ 인 정사각형 격자 모양을 차례로 만들고 있습니다.`;
        return {
          q: ask
            ? `${intro} $${n}$ 번째 모양을 만드는 데 필요한 성냥개비는 몇 개인지 구하세요.`
            : `${intro} 성냥개비 $${M}$ 개를 남김없이 사용하여 만든 모양은 몇 번째 모양인지 구하세요.`,
          fig: s.toString(),
          answer: ask ? { type: 'num', value: M, unit: '개' } : { type: 'num', value: n, unit: '번째' },
          steps: [
            `$n$ 번째 모양은 세로 $${rows}$ 칸, 가로 $n$ 칸입니다.`,
            `가로로 놓인 성냥개비: $${rows + 1}$ 줄 $\\times$ $n$ 개 $= ${rows + 1}n$ 개`,
            `세로로 놓인 성냥개비: $(n + 1)$ 줄 $\\times$ $${rows}$ 개 $= ${rows}(n + 1)$ 개`,
            `합: $${rows + 1}n + ${rows}(n + 1) = ${linTex(2 * rows + 1, rows, 'n')}$ (확인: $n = 1$ 이면 $${3 * rows + 1}$ 개)`,
            ask
              ? `$n = ${n}$ 을 대입: $${2 * rows + 1} \\times ${n} + ${rows} = ${M}$`
              : `$${linTex(2 * rows + 1, rows, 'n')} = ${M}$ 에서 $${2 * rows + 1}n = ${M - rows}$, $n = ${n}$`,
            ask ? `답: $${M}$ 개` : `답: $${n}$ 번째`,
          ],
          hint: '가로 방향과 세로 방향 성냥개비를 따로 세어 보세요.',
        };
      },
    },
    {
      id: 'ratio-expr',
      title: '비례식을 이용한 식의 값',
      gen(r): ProblemDraft {
        return retry(
          () => {
            const [xr, yr, zr] = r.sample([1, 2, 3, 4, 5, 6, 7], 3);
            const co = () => [r.nonzero(-3, 3), r.nonzero(-3, 3), r.nonzero(-3, 3)];
            const nu = co();
            const de = co();
            const N = nu[0] * xr + nu[1] * yr + nu[2] * zr;
            const Dn = de[0] * xr + de[1] * yr + de[2] * zr;
            if (N === 0 || Dn === 0 || Math.abs(N) === Math.abs(Dn)) return null;
            const v = new F(N, Dn);
            const exT = (c: number[]) => `${linTex(c[0], 0)}${c[1] > 0 ? '+' : '-'}${Math.abs(c[1]) === 1 ? '' : Math.abs(c[1])}y${c[2] > 0 ? '+' : '-'}${Math.abs(c[2]) === 1 ? '' : Math.abs(c[2])}z`;
            const E = `\\frac{${exT(nu)}}{${exT(de)}}`;
            const pair = r.chance(0.5);
            if (!pair) {
              return {
                q: `$x : y : z = ${xr} : ${yr} : ${zr}$ 일 때, $${E}$ 의 값을 구하세요. (단, $xyz \\ne 0$)`,
                answer: { type: 'num', value: v.value, display: 'frac' },
                steps: [
                  `$x = ${xr}k$, $y = ${yr}k$, $z = ${zr}k$ ($k \\ne 0$) 로 놓습니다.`,
                  `분자: $${nu[0]} \\times ${xr}k + ${fp(nu[1])} \\times ${yr}k + ${fp(nu[2])} \\times ${zr}k = ${N}k$`,
                  `분모: $${de[0]} \\times ${xr}k + ${fp(de[1])} \\times ${yr}k + ${fp(de[2])} \\times ${zr}k = ${Dn}k$`,
                  `$k \\ne 0$ 이므로 약분하면 $\\frac{${N}k}{${Dn}k} = ${v.tex()}$`,
                  `답: $${v.tex()}$`,
                ],
              };
            }
            const u = xr + yr;
            const w = yr + zr;
            const t = zr + xr;
            return {
              q: `$(x + y) : (y + z) : (z + x) = ${u} : ${w} : ${t}$ 일 때, $${E}$ 의 값을 구하세요. (단, $xyz \\ne 0$)`,
              answer: { type: 'num', value: v.value, display: 'frac' },
              steps: [
                `$x + y = ${u}k$, $y + z = ${w}k$, $z + x = ${t}k$ ($k \\ne 0$) 로 놓습니다.`,
                `세 식을 모두 더하면 $2(x + y + z) = ${u + w + t}k$ 이므로 $x + y + z = ${(u + w + t) / 2}k$`,
                `$z = ${(u + w + t) / 2}k - ${u}k = ${zr}k$, $x = ${(u + w + t) / 2}k - ${w}k = ${xr}k$, $y = ${(u + w + t) / 2}k - ${t}k = ${yr}k$`,
                `분자 $= ${N}k$, 분모 $= ${Dn}k$`,
                `$k \\ne 0$ 이므로 값은 $${v.tex()}$`,
              ],
              hint: '세 식을 모두 더해 보세요.',
            };
          },
          () => ({ q: '$x : y = 1 : 2$ 일 때 $\\frac{x+y}{y}$ 의 값을 구하세요.', answer: { type: 'num', value: 1.5, display: 'frac' }, steps: ['$x = k$, $y = 2k$', '$\\frac{3k}{2k} = \\frac{3}{2}$'] }),
        );
      },
    },
  ],
};

// ═══════════════════ m1a-4 일차방정식 ═══════════════════
const m1a4: HardSet = {
  skills: [
    {
      id: 'sol-natural',
      title: '해가 자연수가 되는 조건',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const N = r.pick([12, 16, 18, 20, 24, 28, 30, 36]);
          const ds = divisors(N);
          return {
            q: `$x$ 에 대한 일차방정식 $ax = ${N}$ 의 해가 자연수가 되도록 하는 자연수 $a$ 는 모두 몇 개인지 구하세요.`,
            answer: { type: 'num', value: ds.length, unit: '개' },
            steps: [`$x = \\frac{${N}}{a}$ 가 자연수이려면 $a$ 는 $${N}$ 의 약수여야 합니다.`, `$a$: ${ds.map((d) => `$${d}$`).join(', ')}`, `답: $${ds.length}$ 개`],
          };
        }
        if (level === 2) {
          const q = r.int(1, 5);
          const c1 = r.int(1, 9);
          const N = r.pick([6, 8, 10, 12, 15, 16, 18, 20]);
          const c2 = c1 + N;
          const as = divisors(N).map((d) => d + q);
          return {
            q: `$x$ 에 대한 일차방정식 $ax + ${c1} = ${q === 1 ? '' : q}x + ${c2}$ 의 해가 자연수가 되도록 하는 자연수 $a$ 의 값을 모두 더하면 얼마인지 구하세요.`,
            answer: { type: 'num', value: as.reduce((s, x) => s + x, 0) },
            steps: [
              `이항하여 정리하면 $(a - ${q})x = ${N}$, $x = \\frac{${N}}{a - ${q}}$`,
              `$x$ 가 자연수이려면 $a - ${q}$ 는 $${N}$ 의 양의 약수: $${divisors(N).join(', ')}$`,
              `$a$: ${as.map((a) => `$${a}$`).join(', ')}`,
              `합: $${as.reduce((s, x) => s + x, 0)}$`,
            ],
          };
        }
        return retry(
          () => {
            const m = r.int(1, 4);
            const q = r.int(2, 5);
            const c = r.nonzero(-12, 12);
            const T = q * m + c;
            if (T === 0) return null;
            const as: [number, number][] = [];
            for (let a = 1; a <= 200; a++) {
              if (a === q) continue;
              const xv = new F(a * m + c, a - q);
              if (xv.isInt() && xv.n >= 1) as.push([a, xv.n]);
            }
            if (as.length < 2 || as.length > 9) return null;
            const ds = divisors(Math.abs(T));
            const sumA = as.reduce((s, [a]) => s + a, 0);
            return {
              q: `$x$ 에 대한 일차방정식 $a(x - ${m}) = ${q}x ${c > 0 ? '+' : '-'} ${Math.abs(c)}$ 의 해가 자연수가 되도록 하는 자연수 $a$ 의 값을 모두 더하면 얼마인지 구하세요.`,
              answer: { type: 'num', value: sumA },
              steps: [
                `정리하면 $(a - ${q})x = ${m === 1 ? '' : m}a ${c > 0 ? '+' : '-'} ${Math.abs(c)}$`,
                `$x = \\frac{${m === 1 ? '' : m}a ${c > 0 ? '+' : '-'} ${Math.abs(c)}}{a - ${q}} = ${m} + \\frac{${T}}{a - ${q}}$`,
                `$a - ${q}$ 는 $${T}$ 의 약수(음수 포함): $\\pm ${ds.join(', \\pm ')}$`,
                `이 중 $a$ 가 자연수이고 $x$ 가 자연수인 경우: ${as.map(([a, xv]) => `$a = ${a}$ ($x = ${xv}$)`).join(', ')}`,
                `합: $${sumA}$`,
              ],
              hint: '분자를 분모로 나누어 (정수) + (분수) 꼴로 바꿔 보세요.',
            };
          },
          () => ({ q: '$x$ 에 대한 방정식 $ax = 6$ 의 해가 자연수가 되는 자연수 $a$ 의 개수를 구하세요.', answer: { type: 'num', value: 4, unit: '개' }, steps: ['$a$ 는 $6$ 의 약수: $1, 2, 3, 6$'] }),
        );
      },
    },
  ],
  top: [
    {
      id: 'sol-multiple',
      title: '두 방정식의 해 사이의 관계',
      gen(r): ProblemDraft {
        return retry(
          () => {
            const p = r.int(2, 6);
            let q = r.int(2, 6);
            if (q === p) q = p + 1;
            const xB = r.nonzero(-6, 6);
            const u = r.nonzero(-5, 5);
            const v = r.nonzero(-5, 5);
            const wn = q * (xB + u) - p * (xB - v);
            if (wn % (p * q) !== 0) return null;
            const w = wn / (p * q);
            const k = r.pick([2, 3, -1, -2]);
            const xA = k * xB;
            const s = r.int(-4, 6);
            const mm = r.int(1, 4);
            if (s === mm) return null;
            const t = r.int(-9, 9);
            const num = (s - mm) * xA - t;
            if (num % (1 + mm) !== 0) return null;
            const a = num / (1 + mm);
            if (a === 0 || Math.abs(a) > 30) return null;

            const E2 = `\\frac{${lt(1, u)}}{${p}} - \\frac{${lt(1, -v)}}{${q}} = ${w}`;
            const E1 = `${s === 0 ? '' : `${linTex(s, 0)} `}${s === 0 ? '-a' : '- a'} = ${mm === 1 ? '' : mm}(x + a)${t === 0 ? '' : ` ${t > 0 ? '+' : '-'} ${Math.abs(t)}`}`;
            return {
              q:
                k === -1
                  ? `$x$ 에 대한 두 일차방정식 $${E1}$, $${E2}$ 의 해의 절댓값은 같고 부호는 서로 반대일 때, 상수 $a$ 의 값을 구하세요.`
                  : `$x$ 에 대한 일차방정식 $${E1}$ 의 해가 일차방정식 $${E2}$ 의 해의 $${k}$ 배일 때, 상수 $a$ 의 값을 구하세요.`,
              answer: { type: 'num', value: a },
              steps: [
                `두 번째 방정식의 양변에 $${p * q}$ 를 곱하면 $${q}(${lt(1, u)}) - ${p}(${lt(1, -v)}) = ${p * q * w}$`,
                Math.abs(q - p) === 1 && q - p === 1
                  ? `$${lt(q - p, q * u + p * v)} = ${p * q * w}$ 이므로 $x = ${xB}$`
                  : `$${lt(q - p, q * u + p * v)} = ${p * q * w}$, $${q - p === -1 ? '-' : q - p}x = ${p * q * w - q * u - p * v}$ 이므로 $x = ${xB}$`,
                `첫 번째 방정식의 해는 $${fp(k)} \\times ${fp(xB)} = ${xA}$`,
                `$x = ${xA}$ 를 첫 번째 방정식에 대입: $${s} \\times ${fp(xA)} - a = ${mm === 1 ? '' : `${mm} \\times `}(${xA} + a)${t === 0 ? '' : ` ${t > 0 ? '+' : '-'} ${Math.abs(t)}`}$`,
                `$${s * xA} - a = ${mm * xA + t} + ${mm === 1 ? '' : mm}a$ 에서 $${1 + mm}a = ${num}$`,
                `답: $a = ${a}$`,
              ],
              hint: '상수가 없는 방정식의 해부터 구하세요.',
            };
          },
          () => ({ q: '$x$ 에 대한 방정식 $2x - a = 4$ 의 해가 $x = 3$ 일 때 $a$ 의 값을 구하세요.', answer: { type: 'num', value: 2 }, steps: ['$6 - a = 4$', '$a = 2$'] }),
        );
      },
    },
    {
      id: 'salt-replace',
      title: '퍼내고 물 붓고 섞는 농도 문제',
      gen(r): ProblemDraft {
        return retry(
          () => {
            const A = r.pick([200, 300, 400, 500, 600]);
            const p = r.pick([6, 8, 10, 12, 15]);
            const B = r.pick([100, 200, 300]);
            const q = r.pick([2, 3, 4, 5]);
            const y = r.int(1, Math.floor((A * 0.7) / 10)) * 10;
            const salt100 = (A - y) * p + B * q;
            if (salt100 % (A + B) !== 0) return null;
            const z = salt100 / (A + B);
            if (z <= 0 || z >= p) return null;
            return {
              q: `$${p}$ % 의 소금물 $${A}$ g 에서 소금물을 몇 g 퍼내고, 퍼낸 만큼 물을 부었습니다. 여기에 $${q}$ % 의 소금물 $${B}$ g 을 섞었더니 $${z}$ % 의 소금물이 되었습니다. 처음에 퍼낸 소금물은 몇 g 인지 구하세요.`,
              answer: { type: 'num', value: y, unit: 'g' },
              steps: [
                `퍼낸 소금물을 $x$ g 이라 하면, 물을 부어도 소금의 양은 그대로이므로 남은 소금은 $\\frac{${p}}{100}(${A} - x)$ g`,
                `물을 부은 뒤 소금물의 양은 다시 $${A}$ g 입니다.`,
                `섞은 뒤: 소금물 $${A} + ${B} = ${A + B}$ g, 소금 $\\frac{${p}}{100}(${A} - x) + \\frac{${q}}{100} \\times ${B}$ g`,
                `$\\frac{${p}}{100}(${A} - x) + ${(q * B) / 100} = \\frac{${z}}{100} \\times ${A + B}$`,
                `양변에 $100$ 을 곱하면 $${p}(${A} - x) + ${q * B} = ${z * (A + B)}$, $${p}x = ${p * A + q * B - z * (A + B)}$`,
                `답: $x = ${y}$ g`,
              ],
              hint: '물을 부어도 소금의 양은 변하지 않아요.',
            };
          },
          () => ({ q: '$10$ % 의 소금물 $200$ g 에 들어 있는 소금은 몇 g 인지 구하세요.', answer: { type: 'num', value: 20, unit: 'g' }, steps: ['$200 \\times \\frac{10}{100} = 20$'] }),
        );
      },
    },
  ],
};

// ═══════════════════ m1a-5 좌표평면과 그래프 ═══════════════════
const QN = ['제1사분면', '제2사분면', '제3사분면', '제4사분면'];
const quad = (sx: number, sy: number) => (sx > 0 ? (sy > 0 ? 0 : 3) : sy > 0 ? 1 : 2);
const m1a5: HardSet = {
  skills: [
    {
      id: 'inverse-lattice',
      title: '반비례 그래프 위의 정수 좌표 점',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const a = r.pick([6, 8, 10, 12, 15, 16, 18, 20]);
          const ds = divisors(a);
          return {
            q: `반비례 $y = \\frac{${a}}{x}$ 의 그래프 위의 점 중에서 $x$ 좌표와 $y$ 좌표가 모두 자연수인 점은 몇 개인지 구하세요.`,
            answer: { type: 'num', value: ds.length, unit: '개' },
            steps: [`$xy = ${a}$ 이므로 $x$ 는 $${a}$ 의 약수입니다.`, `점: ${ds.map((d) => `$(${d}, ${a / d})$`).join(', ')}`, `답: $${ds.length}$ 개`],
          };
        }
        if (level === 2 || r.chance(0.3)) {
          const p = r.nonzero(-6, 6);
          const q = r.nonzero(-6, 6);
          const a = p * q;
          if (Math.abs(a) < 4) return this.gen(r, level);
          const ds = divisors(Math.abs(a));
          return {
            q: `반비례 $y = \\frac{a}{x}$ 의 그래프가 점 $(${p}, ${q})$ 를 지날 때, 이 그래프 위의 점 중에서 $x$ 좌표와 $y$ 좌표가 모두 정수인 점은 몇 개인지 구하세요.`,
            answer: { type: 'num', value: 2 * ds.length, unit: '개' },
            steps: [
              `$${q} = \\frac{a}{${p}}$ 이므로 $a = ${a}$`,
              `$xy = ${a}$ 이므로 $x$ 는 $${Math.abs(a)}$ 의 약수이거나 그 음수입니다.`,
              `$${Math.abs(a)}$ 의 약수: $${ds.join(', ')}$ ($${ds.length}$ 개) → 양수·음수 각각 $${ds.length}$ 개`,
              `답: $${2 * ds.length}$ 개`,
            ],
          };
        }
        const [d, a] = r.pick([
          [4, 6],
          [6, 12],
          [8, 24],
          [10, 48],
          [12, 60],
        ] as [number, number][]);
        return {
          q: `$a$ 는 자연수이고, 반비례 $y = \\frac{a}{x}$ 의 그래프 위의 점 중에서 $x$ 좌표와 $y$ 좌표가 모두 정수인 점이 $${2 * d}$ 개입니다. 이러한 $a$ 중 가장 작은 수를 구하세요.`,
          answer: { type: 'num', value: a },
          steps: [
            `$xy = a$ 이므로 $x$ 는 $a$ 의 약수 또는 그 음수입니다.`,
            `정수 좌표인 점이 $${2 * d}$ 개이려면 $a$ 의 약수가 $${d}$ 개여야 합니다.`,
            `약수가 $${d}$ 개인 가장 작은 자연수: $${a} = ${factTex(a)}$ (약수 $${nd(a)}$ 개)`,
            `답: $${a}$`,
          ],
        };
      },
    },
  ],
  top: [
    {
      id: 'inverse-triangle',
      title: '정비례·반비례 그래프와 삼각형의 넓이',
      gen(r): ProblemDraft {
        return retry(
          () => {
            const a = r.int(1, 4);
            const p = r.int(1, 4);
            const q = a * p;
            const b = p * q;
            const ss = divisors(b).filter((s) => s !== q && s !== b / p && b / s !== p);
            if (ss.length === 0) return null;
            const s = r.pick(ss);
            const xQ = b / s;
            const area = new F(Math.abs((q + s) * (xQ - p)), 2);
            return {
              q: `정비례 $y = ${a === 1 ? '' : a}x$ 의 그래프와 반비례 $y = \\frac{b}{x}$ 의 그래프가 $x$ 좌표가 $${p}$ 인 점 P 에서 만납니다. 반비례 $y = \\frac{b}{x}$ 의 그래프 위의 점 Q 의 $y$ 좌표가 $${s}$ 일 때, 원점 O 와 두 점 P, Q 를 꼭짓점으로 하는 삼각형 OPQ 의 넓이를 구하세요. (단, $b$ 는 상수)`,
              answer: { type: 'num', value: area.value, display: area.isInt() ? 'int' : 'dec' },
              steps: [
                `P 는 $y = ${a === 1 ? '' : a}x$ 위의 점이므로 P$(${p}, ${q})$`,
                `P 는 $y = \\frac{b}{x}$ 위의 점이므로 $b = ${p} \\times ${q} = ${b}$`,
                `Q 의 $x$ 좌표: $\\frac{${b}}{${s}} = ${xQ}$ → Q$(${xQ}, ${s})$`,
                `P, Q 에서 $x$ 축에 수선 PH, QK 를 그으면 삼각형 OPH 와 삼각형 OQK 의 넓이는 모두 $\\frac{${b}}{2}$ 로 같습니다.`,
                `따라서 (삼각형 OPQ) = (사다리꼴 PHKQ) 이고, 두 점 P, Q 의 $x$ 좌표의 차는 $${Math.abs(xQ - p)}$`,
                `넓이: $\\frac{1}{2} \\times (${q} + ${s}) \\times ${Math.abs(xQ - p)} = ${area.tex()}$`,
              ],
              hint: '반비례 그래프 위의 점에서 축에 수선을 그어 만든 직각삼각형의 넓이는 항상 같아요.',
            };
          },
          () => ({ q: '반비례 $y = \\frac{6}{x}$ 위의 점 $(2, 3)$ 에서 $x$ 축에 내린 수선과 원점이 만드는 직각삼각형의 넓이를 구하세요.', answer: { type: 'num', value: 3 }, steps: ['$\\frac{1}{2} \\times 2 \\times 3 = 3$'] }),
        );
      },
    },
    {
      id: 'quadrant-sign',
      title: '부호를 추론하여 사분면 찾기',
      gen(r): ProblemDraft {
        type C = [string, number, number, string];
        const conds: C[] = [
          ['$ab < 0$, $a - b > 0$ 일', 1, -1, '$ab < 0$ 이므로 $a$, $b$ 는 부호가 다르고, $a > b$ 이므로 $a > 0$, $b < 0$'],
          ['$ab < 0$, $a < b$ 일', -1, 1, '$ab < 0$ 이므로 $a$, $b$ 는 부호가 다르고, $a < b$ 이므로 $a < 0$, $b > 0$'],
          ['$ab > 0$, $a + b < 0$ 일', -1, -1, '$ab > 0$ 이므로 부호가 같고, $a + b < 0$ 이므로 $a < 0$, $b < 0$'],
          ['$\\frac{a}{b} > 0$, $a + b > 0$ 일', 1, 1, '$\\frac{a}{b} > 0$ 이므로 부호가 같고, $a + b > 0$ 이므로 $a > 0$, $b > 0$'],
          ['점 $(-a, ab)$ 가 제3사분면 위에 있을', 1, -1, '$-a < 0$ 이므로 $a > 0$, $ab < 0$ 이므로 $b < 0$'],
          ['점 $(a, -b)$ 가 제2사분면 위에 있을', -1, -1, '$a < 0$, $-b > 0$ 이므로 $b < 0$'],
          ['점 $(\\frac{b}{a}, b)$ 가 제4사분면 위에 있을', -1, -1, '$b < 0$ 이고 $\\frac{b}{a} > 0$ 이므로 $a < 0$'],
        ];
        const [ct, sa, sb, why] = r.pick(conds);
        type Cm = [string, (a: number, b: number) => number];
        const comps: Cm[] = [
          ['a - b', (a, b) => (a !== b ? a - b : 0)],
          ['b - a', (a, b) => (a !== b ? b - a : 0)],
          ['ab', (a, b) => a * b],
          ['-ab', (a, b) => -a * b],
          ['\\frac{a}{b}', (a, b) => a * b],
          ['a + b', (a, b) => (a === b ? a + b : 0)],
          ['-a', (a) => -a],
          ['b', (_a, b) => b],
          ['a^{2}', () => 1],
          ['-b^{3}', (_a, b) => -b],
        ];
        // 부호만 따짐 (a, b 에 부호값 ±1 대입. 결정되지 않는 것은 0)
        const sg = (f: Cm) => Math.sign(f[1](sa, sb));
        const okc = comps.filter((c) => sg(c) !== 0);
        const mk = () => {
          const [X, Y] = r.sample(okc, 2);
          return { t: `(${X[0]}, ${Y[0]})`, q: quad(sg(X), sg(Y)), X, Y };
        };
        const P1 = mk();
        let P2 = mk();
        for (let i = 0; i < 20 && P2.t === P1.t; i++) P2 = mk();
        const right = `${QN[P1.q]}, ${QN[P2.q]}`;
        const wr: string[] = [];
        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (i !== P1.q || j !== P2.q) wr.push(`${QN[i]}, ${QN[j]}`);
        const sgT = (v: number) => (v > 0 ? '+' : '-');
        return {
          q: `두 수 $a$, $b$ 에 대하여 ${ct} 때, 다음 두 점 P, Q 가 속하는 사분면을 차례로 바르게 짝 지은 것은? (단, $a \\ne 0$, $b \\ne 0$)\n\nP$${P1.t}$, Q$${P2.t}$`,
          answer: makeChoices(r, right, r.shuffle(wr)),
          steps: [
            why,
            `$a$ 의 부호: $${sgT(sa)}$, $b$ 의 부호: $${sgT(sb)}$`,
            `P: $${P1.X[0]}$ 의 부호 $${sgT(sg(P1.X))}$, $${P1.Y[0]}$ 의 부호 $${sgT(sg(P1.Y))}$ → ${QN[P1.q]}`,
            `Q: $${P2.X[0]}$ 의 부호 $${sgT(sg(P2.X))}$, $${P2.Y[0]}$ 의 부호 $${sgT(sg(P2.Y))}$ → ${QN[P2.q]}`,
            `답: ${right}`,
          ],
          hint: '먼저 a, b 각각의 부호를 정하세요.',
        };
      },
    },
  ],
};

// ═══════════════════ m1b-1 기본 도형 ═══════════════════
/** 1/11 분 단위 시각 → 'h시 m분' */
function clockTxt(T11: number): string {
  const tot = new F(T11, 11);
  const h = Math.floor(tot.value / 60);
  const mf = tot.sub(h * 60);
  const hh = h % 12 === 0 ? 12 : h % 12;
  const ap = h < 12 ? '오전' : '오후';
  return `${ap} ${hh}시 $${mf.isInt() ? mf.n : mf.mixedTex()}$ 분`;
}
const m1b1: HardSet = {
  skills: [
    {
      id: 'vertical-pairs',
      title: '여러 직선이 만날 때 맞꼭지각의 쌍',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const n = r.int(3, 6);
          return {
            q: `서로 다른 $${n}$ 개의 직선이 한 점에서 만날 때 생기는 맞꼭지각은 모두 몇 쌍인지 구하세요.`,
            answer: { type: 'num', value: n * (n - 1), unit: '쌍' },
            steps: [`두 직선이 한 점에서 만나면 맞꼭지각이 $2$ 쌍 생깁니다.`, `직선 $${n}$ 개 중 두 개를 고르는 방법: $\\frac{${n} \\times ${n - 1}}{2} = ${(n * (n - 1)) / 2}$ 가지`, `맞꼭지각: $${(n * (n - 1)) / 2} \\times 2 = ${n * (n - 1)}$ 쌍`],
          };
        }
        if (level === 2) {
          const n = r.int(4, 9);
          return {
            q: `서로 다른 몇 개의 직선이 한 점에서 만날 때 생기는 맞꼭지각이 모두 $${n * (n - 1)}$ 쌍입니다. 직선은 몇 개인지 구하세요.`,
            answer: { type: 'num', value: n, unit: '개' },
            steps: [`직선이 $n$ 개이면 두 직선을 고르는 방법은 $\\frac{n(n-1)}{2}$ 가지이고, 그때마다 맞꼭지각이 $2$ 쌍 생기므로 $n(n-1)$ 쌍`, `$n(n-1) = ${n * (n - 1)} = ${n} \\times ${n - 1}$`, `답: $${n}$ 개`],
          };
        }
        const n = r.int(4, 8);
        const m = r.pick([0, 2, 3]);
        const I = (n * (n - 1)) / 2 - (m * (m - 1)) / 2;
        return {
          q: `평면 위에 서로 다른 $${n}$ 개의 직선이 있습니다. ${m ? `이 중 $${m}$ 개만 서로 평행하고, ` : '어느 두 직선도 평행하지 않고, '}어느 세 직선도 한 점에서 만나지 않습니다. 교점의 개수와 이때 생기는 맞꼭지각의 쌍의 개수를 구하세요.`,
          answer: { type: 'fields', fields: [{ label: '교점', value: I, unit: '개' }, { label: '맞꼭지각', value: 2 * I, unit: '쌍' }] },
          steps: [
            `두 직선마다 교점이 하나씩 생기므로, 직선 두 개를 고르는 방법 $\\frac{${n} \\times ${n - 1}}{2} = ${(n * (n - 1)) / 2}$ 가지를 셉니다.`,
            m ? `평행한 $${m}$ 개 중 두 직선은 만나지 않으므로 $\\frac{${m} \\times ${m - 1}}{2} = ${(m * (m - 1)) / 2}$ 가지를 뺍니다 → 교점 $${I}$ 개` : `교점: $${I}$ 개`,
            `세 직선이 한 점에서 만나지 않으므로 각 교점에서는 두 직선만 만나고, 맞꼭지각이 $2$ 쌍씩 생깁니다.`,
            `맞꼭지각: $${I} \\times 2 = ${2 * I}$ 쌍`,
          ],
        };
      },
    },
  ],
  top: [
    {
      id: 'clock-count',
      title: '시곗바늘이 특정한 각을 이루는 횟수',
      gen(r): ProblemDraft {
        const th = r.pick([0, 90, 180, 90]);
        const h1 = r.int(1, 10);
        const h2 = r.int(13, 23);
        const lo = h1 * 60 * 11;
        const hi = h2 * 60 * 11;
        const ts = new Set<number>();
        for (let k = -2; k <= 30; k++) {
          for (const T of th === 90 ? [720 * k + 180, 720 * k - 180] : [720 * k + 2 * th]) if (T >= lo && T <= hi) ts.add(T);
        }
        const arr = [...ts].sort((a, b) => a - b);
        const what = th === 0 ? '겹치는' : th === 90 ? '직각을 이루는' : '일직선을 이루는(서로 반대 방향을 가리키는)';
        const term = th === 90 ? ' \\pm 90' : th === 180 ? ' + 180' : '';
        const hTxt = (h: number) => (h < 12 ? `오전 ${h}시` : h === 12 ? '낮 12시' : `오후 ${h - 12}시`);
        return {
          q: `하루 중 ${hTxt(h1)}부터 ${hTxt(h2)}까지 시계의 시침과 분침이 ${what} 경우는 모두 몇 번인지 구하세요. (단, 처음과 마지막 시각도 포함합니다.)`,
          answer: { type: 'num', value: arr.length, unit: '번' },
          steps: [
            `분침은 1분에 $6${DEG}$, 시침은 1분에 $0.5${DEG}$ 움직이므로 분침이 1분에 $5.5${DEG}$ 씩 더 갑니다.`,
            `0시부터 $t$ 분 후 분침이 시침보다 앞선 각은 $5.5t${DEG}$ 이므로 $5.5t = 360k${term}$ ($k$ 는 정수) 일 때 ${th === 0 ? '두 바늘이 겹칩니다' : th === 90 ? '직각을 이룹니다' : '일직선을 이룹니다'}.`,
            `$t = \\frac{2(360k${term})}{11}$ 이므로 ${th === 90 ? '$\\frac{720}{11}$ 분마다 두 번씩' : '$\\frac{720}{11}$ 분마다 한 번씩'} 일어납니다. (12시간에 ${th === 90 ? '$22$' : '$11$'} 번)`,
            `구간 안에서 처음: ${clockTxt(arr[0])}, 마지막: ${clockTxt(arr[arr.length - 1])}`,
            `${hTxt(h1)}부터 ${hTxt(h2)}까지 이런 시각을 차례로 세면 모두 $${arr.length}$ 번`,
          ],
          hint: '분침이 시침을 한 바퀴 따라잡는 데 걸리는 시간을 먼저 구하세요.',
        };
      },
    },
    {
      id: 'segment-ratio',
      title: '선분의 내분과 중점으로 길이 구하기',
      gen(r): ProblemDraft {
        return retry(
          () => {
            const [p, q] = r.pick([
              [1, 2],
              [2, 1],
              [1, 3],
              [3, 1],
              [2, 3],
              [3, 2],
              [3, 4],
              [1, 4],
            ]);
            const [s, t] = r.pick([
              [1, 1],
              [1, 2],
              [2, 1],
              [3, 1],
              [1, 3],
              [2, 3],
              [3, 2],
            ]);
            const fc = new F(p, p + q);
            const fd = new F(s, s + t);
            if (fc.eq(fd)) return null;
            const base = lcm(lcm(p + q, s + t), 2);
            const L = base * r.int(1, 4);
            const C = fc.mul(L).value;
            const D = fd.mul(L).value;
            const CD = Math.abs(C - D);
            if (CD < 2 || L > 120) return null;
            const MN = new F(D + L - C, 2);
            const ratio = (a: number, b: number) => (a === b ? 'D 는 선분 AB 의 중점' : `$\\overline{AD} : \\overline{DB} = ${a} : ${b}$`);
            return {
              q: `선분 AB 위에 두 점 C, D 가 있습니다. $\\overline{AC} : \\overline{CB} = ${p} : ${q}$ 이고 ${ratio(s, t)}입니다. 점 M 은 선분 AC 의 중점, 점 N 은 선분 DB 의 중점이고 $\\overline{CD} = ${CD}$ cm 일 때, $\\overline{MN}$ 의 길이를 구하세요.`,
              answer: { type: 'num', value: MN.value, unit: 'cm' },
              steps: [
                `$\\overline{AB} = x$ cm 라 하면 $\\overline{AC} = \\frac{${p}}{${p + q}}x$, $\\overline{AD} = \\frac{${s}}{${s + t}}x$`,
                `$\\overline{CD} = |\\frac{${p}}{${p + q}}x - \\frac{${s}}{${s + t}}x| = ${fc.sub(fd).value > 0 ? fc.sub(fd).tex() : fd.sub(fc).tex()}x = ${CD}$ 이므로 $x = ${L}$`,
                `$\\overline{AC} = ${C}$, $\\overline{AD} = ${D}$ 이므로 A 에서 M 까지 $${new F(C, 2).tex()}$ cm`,
                `$\\overline{DB} = ${L - D}$ 이므로 A 에서 N 까지 $${D} + ${new F(L - D, 2).tex()} = ${new F(D + L, 2).tex()}$ cm`,
                `$\\overline{MN} = ${new F(D + L, 2).tex()} - ${new F(C, 2).tex()} = ${MN.tex()}$ cm`,
              ],
              hint: '점 A 로부터의 거리로 모든 점의 위치를 나타내 보세요.',
            };
          },
          () => ({ q: '길이가 $10$ cm 인 선분 AB 의 중점을 M 이라 할 때 $\\overline{AM}$ 의 길이를 구하세요.', answer: { type: 'num', value: 5, unit: 'cm' }, steps: ['$10 \\div 2 = 5$'] }),
        );
      },
    },
  ],
};

// ═══════════════════ m1b-2 작도와 합동 ═══════════════════
const m1b2: HardSet = {
  skills: [
    {
      id: 'fixed-side-count',
      title: '둘레와 한 변이 정해진 삼각형의 개수',
      gen(r, level): ProblemDraft {
        return retry(
          () => {
            const P = level === 1 ? r.int(10, 16) : r.int(15, 30);
            const c = r.int(3, Math.floor((P - 1) / 2));
            const S = P - c;
            const longest = level === 3 && r.chance(0.6);
            const ts: [number, number][] = [];
            for (let a = 1; 2 * a <= S; a++) {
              const b = S - a;
              if (2 * b >= P || 2 * c >= P) continue;
              if (longest && b > c) continue;
              ts.push([a, b]);
            }
            if (ts.length < 2 || ts.length > 9) return null;
            return {
              q: longest
                ? `세 변의 길이가 모두 자연수(cm)이고 둘레의 길이가 $${P}$ cm, 가장 긴 변의 길이가 $${c}$ cm 인 삼각형은 모두 몇 개인지 구하세요. (단, 합동인 삼각형은 한 개로 셉니다.)`
                : `세 변의 길이가 모두 자연수(cm)이고 둘레의 길이가 $${P}$ cm 인 삼각형 중에서 한 변의 길이가 $${c}$ cm 인 삼각형은 모두 몇 개인지 구하세요. (단, 합동인 삼각형은 한 개로 셉니다.)`,
              answer: { type: 'num', value: ts.length, unit: '개' },
              steps: [
                `나머지 두 변을 $a$, $b$ ($a \\le b$) 라 하면 $a + b = ${S}$`,
                `(가장 긴 변) < (나머지 두 변의 합) 이므로 각 변은 둘레의 절반 $${new F(P, 2).tex()}$ 보다 짧아야 합니다.`,
                longest ? `또 $b \\le ${c}$ 이어야 합니다.` : `따라서 $b < ${new F(P, 2).tex()}$`,
                `가능한 세 변: ${ts.map(([a, b]) => `$(${[a, b, c].sort((x, y) => x - y).join(', ')})$`).join(', ')}`,
                `답: $${ts.length}$ 개`,
              ],
              hint: '세 변 모두 둘레의 절반보다 짧아야 해요.',
            };
          },
          () => ({ q: '둘레가 $12$ cm, 한 변이 $5$ cm 인 정삼각형이 아닌 이등변삼각형의 나머지 한 변을 구하세요.', answer: { type: 'num', value: 2, unit: 'cm' }, steps: ['$5, 5, 2$'] }),
        );
      },
    },
  ],
  top: [
    {
      id: 'consecutive-sticks',
      title: '연속한 길이의 막대로 만드는 삼각형',
      gen(r): ProblemDraft {
        const a0 = r.pick([1, 1, 2, 3]);
        const n = r.int(a0 + 5, a0 + 10);
        const per: [number, number][] = [];
        let tot = 0;
        for (let c = a0 + 2; c <= n; c++) {
          let k = 0;
          for (let a = a0; a < c; a++) for (let b = a + 1; b < c; b++) if (a + b > c) k++;
          per.push([c, k]);
          tot += k;
        }
        const shown = per.filter(([, k]) => k > 0);
        return {
          q: `길이가 $${a0}$ cm, $${a0 + 1}$ cm, $${a0 + 2}$ cm, $\\ldots$, $${n}$ cm 인 막대가 한 개씩 있습니다. 이 중 서로 다른 막대 $3$ 개를 골라 삼각형을 만들 때, 만들 수 있는 서로 다른 삼각형은 모두 몇 개인지 구하세요.`,
          answer: { type: 'num', value: tot, unit: '개' },
          steps: [
            `세 막대를 $a < b < c$ 라 하면 삼각형이 될 조건은 $a + b > c$ 하나입니다.`,
            `가장 긴 막대 $c$ 를 정하고 $b$ 를 $c - 1$ 부터 줄여 가며 가능한 $a$ 를 셉니다.`,
            `$c$ 와 $b$ 가 정해지면 $a$ 는 $c - b < a < b$ 인 정수${a0 > 1 ? ` (단, $a \\ge ${a0}$)` : ''}이므로 개수를 바로 셀 수 있습니다.`,
            shown.map(([c, k]) => `$c = ${c}$: $${k}$ 개`).join(', '),
            `합: $${shown.map(([, k]) => k).join(' + ')} = ${tot}$ 개`,
          ],
          hint: '가장 긴 막대를 먼저 정하세요.',
        };
      },
    },
    {
      id: 'equilateral-rotation',
      title: '두 정삼각형으로 만든 합동과 각',
      gen(r): ProblemDraft {
        const th = r.int(15, 45);
        const v2 = r.chance(0.5);
        // 그림: AB = u, BC = w, ∠BDC = th 가 되게
        const ratio = Math.sin((th * Math.PI) / 180) / Math.sin(((60 - th) * Math.PI) / 180);
        const u = 220 / (1 + ratio);
        const w = 220 - u;
        const y0 = 160;
        const A: [number, number] = [30, y0];
        const B: [number, number] = [30 + u, y0];
        const C: [number, number] = [250, y0];
        const D: [number, number] = [30 + u / 2, y0 - (u * Math.sqrt(3)) / 2];
        const E: [number, number] = [30 + u + w / 2, y0 - (w * Math.sqrt(3)) / 2];
        const s = new Svg(280, 190);
        s.line(A[0], A[1], C[0], C[1]);
        s.poly([A, B, D], { cls: 'acc' });
        s.poly([B, C, E], { cls: 'acc' });
        s.line(A[0], A[1], E[0], E[1], { cls: 'acc2' });
        s.line(D[0], D[1], C[0], C[1], { cls: 'acc2' });
        const lab = (p: [number, number], t: string, dx: number, dy: number) => s.text(p[0] + dx, p[1] + dy, t, { size: 14 });
        lab(A, 'A', -10, 6);
        lab(B, 'B', 0, 14);
        lab(C, 'C', 10, 6);
        lab(D, 'D', -8, -8);
        lab(E, 'E', 8, -8);
        const giv = v2 ? `$\\angle AEB = ${60 - th}${DEG}$` : `$\\angle BDC = ${th}${DEG}$`;
        const f1 = v2 ? { label: '∠ADC', value: 60 + th, unit: '°' } : { label: '∠AEB', value: 60 - th, unit: '°' };
        return {
          q: `그림과 같이 선분 AC 위의 점 B 에 대하여 $\\overline{AB}$, $\\overline{BC}$ 를 각각 한 변으로 하는 정삼각형 ABD, BCE 를 선분 AC 의 같은 쪽에 그렸습니다. 선분 AE 와 선분 DC 의 교점을 P 라 하고 ${giv} 일 때, ${v2 ? '$\\angle ADC$' : '$\\angle AEB$'} 와 $\\angle APC$ 의 크기를 각각 구하세요.`,
          fig: s.toString(),
          answer: { type: 'fields', fields: [f1, { label: '∠APC', value: 120, unit: '°' }] },
          steps: [
            `$\\angle DBE = 180${DEG} - 60${DEG} - 60${DEG} = 60${DEG}$ 이므로 $\\angle ABE = \\angle DBC = 120${DEG}$`,
            `$\\overline{AB} = \\overline{DB}$, $\\overline{BE} = \\overline{BC}$ 이므로 $\\triangle ABE \\equiv \\triangle DBC$ (SAS 합동)`,
            `대응각: $\\angle BAE = \\angle BDC$, $\\angle AEB = \\angle DCB$`,
            `$\\triangle DBC$ 에서 $\\angle BDC + \\angle DCB = 180${DEG} - 120${DEG} = 60${DEG}$`,
            v2
              ? `$\\angle BDC = \\angle BAE = 60${DEG} - ${60 - th}${DEG} = ${th}${DEG}$ 이므로 $\\angle ADC = 60${DEG} + ${th}${DEG} = ${60 + th}${DEG}$`
              : `$\\angle AEB = \\angle DCB = 60${DEG} - ${th}${DEG} = ${60 - th}${DEG}$`,
            `$\\triangle APC$ 에서 $\\angle PAC + \\angle PCA = \\angle BDC + \\angle DCB = 60${DEG}$ 이므로 $\\angle APC = 120${DEG}$`,
          ],
          hint: '한 점 B 를 중심으로 겹쳐지는 두 삼각형을 찾아보세요.',
        };
      },
    },
  ],
};

// ═══════════════════ m1b-3 평면도형의 성질 ═══════════════════
const KN: Record<number, string> = { 3: '삼', 4: '사', 5: '오', 6: '육', 7: '칠', 8: '팔', 9: '구', 10: '십', 11: '십일', 12: '십이', 15: '십오', 18: '십팔', 20: '이십' };
const m1b3: HardSet = {
  skills: [
    {
      id: 'star-angle',
      title: '별 모양 도형의 각',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          return retry(
            () => {
              const an = Array.from({ length: 4 }, () => r.int(20, 50));
              const x = 180 - an.reduce((s, v) => s + v, 0);
              if (x < 15 || x > 60) return null;
              return {
                q: `별 모양(오각별) 도형에서 다섯 꼭짓점의 각의 크기가 각각 $${an.join(`${DEG}$, $`)}${DEG}$, $\\angle x$ 입니다. $\\angle x$ 의 크기를 구하세요.`,
                answer: { type: 'num', value: x, unit: '°' },
                steps: [`삼각형의 한 외각은 이웃하지 않는 두 내각의 합과 같으므로, 별의 다섯 꼭짓점의 각은 한 삼각형의 세 내각으로 모입니다.`, `따라서 다섯 각의 합은 $180${DEG}$`, `$\\angle x = 180${DEG} - (${an.join(' + ')})${DEG} = ${x}${DEG}$`],
              };
            },
            () => ({ q: '오각별 다섯 꼭짓점의 각의 합을 구하세요.', answer: { type: 'num', value: 180, unit: '°' }, steps: ['$180°$'] }),
          );
        }
        if (level === 2) {
          const n = r.pick([5, 6, 8, 9, 10, 12]);
          const e = 360 / n;
          return {
            q: `정${KN[n]}각형의 각 변을 연장하여 별 모양 도형을 만들었습니다. 별의 한 꼭짓점의 각의 크기를 구하세요.`,
            answer: { type: 'num', value: 180 - 2 * e, unit: '°' },
            steps: [`정${KN[n]}각형의 한 외각의 크기는 $\\frac{360${DEG}}{${n}} = ${e}${DEG}$`, `별의 한 꼭짓점에 생기는 삼각형의 두 밑각은 정${KN[n]}각형의 외각과 크기가 같습니다(맞꼭지각).`, `한 꼭짓점의 각: $180${DEG} - 2 \\times ${e}${DEG} = ${180 - 2 * e}${DEG}$`],
          };
        }
        const n = r.int(5, 12);
        const S = 180 * (n - 4);
        const dg = (n * (n - 3)) / 2;
        return {
          q: `어떤 볼록 다각형의 각 변을 연장하여 별 모양 도형을 만들었더니, 별의 꼭짓점의 각의 크기의 합이 $${S}${DEG}$ 였습니다. 처음 다각형의 대각선의 개수를 구하세요.`,
          answer: { type: 'num', value: dg, unit: '개' },
          steps: [
            `처음 다각형을 $n$ 각형이라 하면, 별의 꼭짓점마다 생기는 삼각형 $n$ 개의 내각의 합은 $180${DEG} \\times n$`,
            `각 삼각형의 두 밑각은 다각형의 외각과 같으므로, 밑각의 합은 외각의 합의 $2$ 배인 $720${DEG}$`,
            `꼭짓점의 각의 합: $180${DEG} \\times n - 720${DEG} = ${S}${DEG}$ 이므로 $n = ${n}$`,
            `대각선의 개수: $\\frac{${n} \\times (${n} - 3)}{2} = ${dg}$`,
          ],
          hint: '다각형의 외각의 합은 항상 360° 예요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'regular-int-angle',
      title: '내각의 크기가 조건을 만족하는 정다각형',
      gen(r): ProblemDraft {
        const m = r.pick([1, 1, 2, 3, 4, 5, 6, 10]);
        const lo = r.pick([3, 3, 4, 5, 6, 8, 10]);
        const hi = r.pick([30, 50, 100, 200, 400]);
        const ns = divisors(360 / m).filter((n) => n >= lo && n <= hi);
        const cond = m === 1 ? '자연수' : `$${m}$ 의 배수인 자연수`;
        return {
          q: `한 내각의 크기를 도(°) 단위로 나타낸 값이 ${cond}인 정다각형 중에서 꼭짓점이 $${lo}$ 개 이상 $${hi}$ 개 이하인 것은 모두 몇 가지인지 구하세요.`,
          answer: { type: 'num', value: ns.length, unit: '가지' },
          steps: [
            `정$n$각형의 한 외각은 $\\frac{360${DEG}}{n}$, 한 내각은 $180${DEG} - \\frac{360${DEG}}{n}$`,
            m === 1 ? `$180$ 은 자연수이므로 한 내각이 자연수이려면 $\\frac{360}{n}$ 이 자연수, 즉 $n$ 이 $360$ 의 약수여야 합니다.` : `$180$ 은 $${m}$ 의 배수이므로 한 내각이 $${m}$ 의 배수이려면 $\\frac{360}{n}$ 이 $${m}$ 의 배수, 즉 $n$ 이 $${360 / m}$ 의 약수여야 합니다.`,
            `$${360 / m} = ${factTex(360 / m)}$ 의 약수는 $${nd(360 / m)}$ 개`,
            `이 중 $${lo}$ 이상 $${hi}$ 이하: ${ns.map((x) => `$${x}$`).join(', ') || '없음'}`,
            `답: $${ns.length}$ 가지`,
          ],
          hint: '내각 대신 외각으로 생각하면 쉬워요.',
        };
      },
    },
    {
      id: 'regular-diag-angle',
      title: '정다각형의 대각선이 이루는 각',
      gen(r): ProblemDraft {
        const n = r.pick([5, 6, 9, 10, 12, 15, 18]);
        const I = 180 - 360 / n;
        const b = 180 / n;
        const k = r.int(0, 2);
        const nm = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, Math.min(n, 6));
        const poly = `${nm}${n > 6 ? '\\cdots' : ''}`;
        const ask = ['\\angle BPC', '\\angle APB', '\\angle ACD'][k];
        const val = [180 - 360 / n, 360 / n, I - b][k];
        return {
          q: `정${KN[n]}각형 $${poly}$ 에서 ${k === 2 ? '대각선 AC 를 그었을 때,' : '두 대각선 AC 와 BD 의 교점을 P 라 할 때,'} $${ask}$ 의 크기를 구하세요.`,
          answer: { type: 'num', value: val, unit: '°' },
          steps: [
            `정${KN[n]}각형의 한 내각: $180${DEG} - \\frac{360${DEG}}{${n}} = ${I}${DEG}$`,
            `$\\triangle ABC$ 는 $\\overline{BA} = \\overline{BC}$ 인 이등변삼각형이므로 $\\angle BAC = \\angle BCA = \\frac{180${DEG} - ${I}${DEG}}{2} = ${b}${DEG}$`,
            k === 2
              ? `$\\angle ACD = \\angle BCD - \\angle BCA = ${I}${DEG} - ${b}${DEG} = ${val}${DEG}$`
              : `같은 방법으로 $\\triangle BCD$ 에서 $\\angle CBD = ${b}${DEG}$`,
            ...(k === 2
              ? [`(참고) 같은 방법으로 한 꼭짓점에서 그은 대각선들은 내각을 $${b}${DEG}$ 씩 나눕니다.`]
              : [`$\\triangle PBC$ 에서 $\\angle BPC = 180${DEG} - ${b}${DEG} - ${b}${DEG} = ${180 - 2 * b}${DEG}$`, ...(k === 1 ? [`$\\angle APB = 180${DEG} - ${180 - 2 * b}${DEG} = ${360 / n}${DEG}$`] : [])]),
            `답: $${val}${DEG}$`,
          ],
          hint: '정다각형의 두 변과 대각선이 만드는 이등변삼각형을 찾으세요.',
        };
      },
    },
  ],
};

// ═══════════════════ m1b-4 입체도형의 성질 ═══════════════════
const m1b4: HardSet = {
  skills: [
    {
      id: 'cone-net',
      title: '원뿔의 전개도',
      gen(r, level): ProblemDraft {
        return retry(
          () => {
            const l = r.int(3, 15);
            const rr = r.int(1, l - 1);
            if ((360 * rr) % l !== 0) return null;
            const th = (360 * rr) / l;
            if (level === 1) {
              return {
                q: `밑면의 반지름의 길이가 $${rr}$ cm, 모선의 길이가 $${l}$ cm 인 원뿔의 전개도에서 옆면인 부채꼴의 중심각의 크기를 구하세요.`,
                answer: { type: 'num', value: th, unit: '°' },
                steps: [`부채꼴의 호의 길이 = 밑면의 둘레 = $2\\pi \\times ${rr} = ${2 * rr}\\pi$`, `$2\\pi \\times ${l} \\times \\frac{x}{360} = ${2 * rr}\\pi$`, `$x = 360 \\times \\frac{${rr}}{${l}} = ${th}$`],
                hint: '옆면 부채꼴의 호의 길이는 밑면의 둘레와 같아요.',
              };
            }
            if (level === 2) {
              return {
                q: `원뿔의 전개도에서 옆면인 부채꼴의 반지름의 길이가 $${l}$ cm, 중심각의 크기가 $${th}${DEG}$ 일 때, 원뿔의 밑면의 반지름의 길이를 구하세요.`,
                answer: { type: 'num', value: rr, unit: 'cm' },
                steps: [`부채꼴의 호의 길이: $2\\pi \\times ${l} \\times \\frac{${th}}{360} = ${2 * rr}\\pi$`, `이것이 밑면의 둘레 $2\\pi r$ 와 같으므로 $r = ${rr}$`],
              };
            }
            const S = rr * rr + rr * l;
            return {
              q: `원뿔의 전개도에서 옆면인 부채꼴의 중심각의 크기가 $${th}${DEG}$ 이고, 이 원뿔의 겉넓이가 $${S}\\pi$ cm$^2$ 입니다. 원뿔의 모선의 길이를 구하세요.`,
              answer: { type: 'num', value: l, unit: 'cm' },
              steps: [
                `밑면의 반지름을 $r$, 모선을 $l$ 이라 하면 $2\\pi l \\times \\frac{${th}}{360} = 2\\pi r$ 이므로 $r = ${new F(th, 360).tex()}l$, 즉 $l = ${new F(360, th).tex()}r$`,
                `옆넓이는 $\\pi r l$ (부채꼴 넓이 $= \\frac{1}{2} \\times$ 반지름 $\\times$ 호의 길이)`,
                `겉넓이: $\\pi r^2 + \\pi r l = \\pi r^2 + ${new F(360, th).tex()}\\pi r^2 = ${new F(360 + th, th).tex()}\\pi r^2 = ${S}\\pi$`,
                `$r^2 = ${rr * rr}$ 이므로 $r = ${rr}$`,
                `$l = ${new F(360, th).tex()} \\times ${rr} = ${l}$ cm`,
              ],
              hint: '중심각으로 반지름과 모선의 비를 먼저 구하세요.',
            };
          },
          () => ({ q: '밑면의 반지름 $1$ cm, 모선 $4$ cm 인 원뿔 전개도의 중심각을 구하세요.', answer: { type: 'num', value: 90, unit: '°' }, steps: ['$360 \\times \\frac{1}{4} = 90$'] }),
        );
      },
    },
  ],
  top: [
    {
      id: 'cube-paint',
      title: '색칠한 직육면체 자르기',
      gen(r): ProblemDraft {
        const cube = r.chance(0.4);
        const a = r.int(3, 7);
        const b = cube ? a : r.int(3, 7);
        const c = cube ? a : r.int(3, 6);
        const noBottom = r.chance(0.5);
        const k = r.int(noBottom ? 0 : 0, 3);
        const paint = (x: number, y: number, z: number) => (x === 0 ? 1 : 0) + (x === a - 1 ? 1 : 0) + (y === 0 ? 1 : 0) + (y === b - 1 ? 1 : 0) + (z === c - 1 ? 1 : 0) + (!noBottom && z === 0 ? 1 : 0);
        const layer = (z: number) => {
          const cnt = [0, 0, 0, 0, 0, 0, 0];
          for (let x = 0; x < a; x++) for (let y = 0; y < b; y++) cnt[paint(x, y, z)]++;
          return cnt;
        };
        const top = layer(c - 1);
        const mid = layer(1);
        const bot = layer(0);
        const tot = top[k] + bot[k] + (c - 2) * mid[k];
        const name = cube ? `한 모서리의 길이가 $${a}$ cm 인 정육면체` : `가로 $${a}$ cm, 세로 $${b}$ cm, 높이 $${c}$ cm 인 직육면체`;
        const what = k === 0 ? '어느 면도 색칠되지 않은' : `$${k}$ 개의 면만 색칠된`;
        return {
          q: `${name}의 ${noBottom ? '밑면을 뺀 나머지 겉면' : '겉면 전체'}에 색을 칠한 뒤, 한 모서리의 길이가 $1$ cm 인 정육면체로 모두 잘랐습니다. 이때 ${what} 정육면체는 모두 몇 개인지 구하세요.`,
          answer: { type: 'num', value: tot, unit: '개' },
          steps: [
            `작은 정육면체를 높이에 따라 $${c}$ 개 층으로 나누어 셉니다. 한 층은 $${a} \\times ${b}$ 개입니다.`,
            `맨 위층: 윗면이 칠해지므로 ${what} 것은 $${top[k]}$ 개`,
            noBottom ? `맨 아래층: 밑면은 칠하지 않았으므로 옆면만 봅니다 → $${bot[k]}$ 개` : `맨 아래층: 맨 위층과 같이 $${bot[k]}$ 개`,
            `가운데 $${c - 2}$ 개 층: 옆면만 칠해지므로 층마다 $${mid[k]}$ 개 → $${(c - 2) * mid[k]}$ 개`,
            `한 층에서 옆면이 칠해지는 개수: 모퉁이 $4$ 개는 $2$ 면, 나머지 테두리 $${2 * (a - 2) + 2 * (b - 2)}$ 개는 $1$ 면, 안쪽 $${(a - 2) * (b - 2)}$ 개는 $0$ 면`,
            `합: $${top[k]} + ${bot[k]} + ${(c - 2) * mid[k]} = ${tot}$ 개`,
          ],
          hint: '층별로 나누어 세면 실수가 줄어요.',
        };
      },
    },
    {
      id: 'truncate-solid',
      title: '꼭짓점을 잘라 낸 다면체',
      gen(r): ProblemDraft {
        const n = r.int(4, 8);
        const solids: [string, number, number, number][] = [
          ['정사면체', 4, 6, 4],
          ['정육면체', 8, 12, 6],
          ['정팔면체', 6, 12, 8],
          ['정십이면체', 20, 30, 12],
          ['정이십면체', 12, 30, 20],
          [`${KN[n]}각기둥`, 2 * n, 3 * n, n + 2],
          [`${KN[n]}각뿔`, n + 1, 2 * n, n + 1],
        ];
        const [nm, V, E, Fc] = r.pick(solids);
        return {
          q: `${nm}의 모든 꼭짓점 부근을 작은 각뿔 모양으로 잘라 내어 새로운 다면체를 만들었습니다. 이때 자르는 면끼리는 서로 만나지 않습니다. 새로 만든 다면체의 꼭짓점, 모서리, 면의 개수를 각각 구하세요.`,
          answer: {
            type: 'fields',
            fields: [
              { label: '꼭짓점', value: 2 * E, unit: '개' },
              { label: '모서리', value: 3 * E, unit: '개' },
              { label: '면', value: Fc + V, unit: '개' },
            ],
          },
          steps: [
            `${nm}: 꼭짓점 $${V}$ 개, 모서리 $${E}$ 개, 면 $${Fc}$ 개`,
            `한 꼭짓점에 모서리가 $d$ 개 모여 있으면, 그 꼭짓점을 자를 때 새 면 $1$ 개, 새 모서리 $d$ 개가 생기고 꼭짓점 $1$ 개가 $d$ 개로 바뀝니다.`,
            `모든 꼭짓점에 모인 모서리 수의 합은 모서리 하나가 두 번씩 세어져 $2 \\times ${E} = ${2 * E}$`,
            `꼭짓점: $${V} - ${V} + ${2 * E} = ${2 * E}$ 개`,
            `모서리: $${E} + ${2 * E} = ${3 * E}$ 개, 면: $${Fc} + ${V} = ${Fc + V}$ 개`,
            `확인: $${2 * E} - ${3 * E} + ${Fc + V} = 2$`,
          ],
          hint: '한 꼭짓점을 자르면 무엇이 몇 개 늘어나는지 먼저 생각하세요.',
        };
      },
    },
  ],
};

// ═══════════════════ m1b-5 자료의 정리와 해석 ═══════════════════
const m1b5: HardSet = {
  skills: [
    {
      id: 'mean-group',
      title: '평균의 역추론 (추가·수정·두 집단)',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const n = r.int(4, 9);
          const m = r.int(60, 85);
          const d = r.nonzero(-3, 3);
          const x = (n + 1) * (m + d) - n * m;
          if (x <= 0 || x > 100) return this.gen(r, level);
          const nm = r.pick(NAMES);
          return {
            q: `학생 $${n}$ 명의 수학 점수의 평균이 $${m}$ 점입니다. 여기에 ${nm}의 점수를 더했더니 평균이 $${m + d}$ 점이 되었습니다. ${nm}의 점수를 구하세요.`,
            answer: { type: 'num', value: x, unit: '점' },
            steps: [`처음 총점: $${n} \\times ${m} = ${n * m}$`, `나중 총점: $${n + 1} \\times ${m + d} = ${(n + 1) * (m + d)}$`, `${nm}의 점수: $${(n + 1) * (m + d)} - ${n * m} = ${x}$ 점`],
          };
        }
        if (level === 2) {
          const n = r.pick([4, 5, 8, 10]);
          const m = r.int(20, 60);
          const a = r.int(10, 90);
          const k = r.nonzero(-4, 4);
          const b = a - k * n;
          if (b <= 0 || b === a) return this.gen(r, level);
          return {
            q: `변량 $${n}$ 개의 평균을 구하는데, 변량 하나를 $${a}$ 대신 $${b}$ 로 잘못 보고 계산하여 평균이 $${m}$ 이 되었습니다. 바른 평균을 구하세요.`,
            answer: { type: 'num', value: m + k },
            steps: [`잘못 구한 총합: $${n} \\times ${m} = ${n * m}$`, `바른 총합: $${n * m} - ${b} + ${a} = ${n * m - b + a}$`, `바른 평균: $${n * m - b + a} \\div ${n} = ${m + k}$`],
          };
        }
        return retry(
          () => {
            const x = r.int(10, 30);
            const y = r.int(10, 30);
            const a = r.int(60, 90);
            const b = r.int(55, 90);
            if (a === b) return null;
            const T = x * a + y * b;
            if (T % (x + y) !== 0) return null;
            const c = T / (x + y);
            if (c === a || c === b) return null;
            return {
              q: `어느 학교 A 반과 B 반의 학생 수는 합하여 $${x + y}$ 명입니다. 수학 점수의 평균이 A 반은 $${a}$ 점, B 반은 $${b}$ 점이고 두 반 전체의 평균은 $${c}$ 점일 때, 각 반의 학생 수를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'A 반', value: x, unit: '명' }, { label: 'B 반', value: y, unit: '명' }] },
              steps: [
                `A 반 학생 수를 $x$ 명이라 하면 B 반은 $(${x + y} - x)$ 명`,
                `총점끼리 같아야 하므로 $${a}x + ${b}(${x + y} - x) = ${c} \\times ${x + y}$`,
                `$${a - b}x = ${c * (x + y) - b * (x + y)}$, $x = ${x}$`,
                `A 반 $${x}$ 명, B 반 $${y}$ 명`,
              ],
              hint: '(평균) × (학생 수) = (총점) 을 이용하세요.',
            };
          },
          () => ({ q: '$3$ 명의 평균이 $70$ 점일 때 총점을 구하세요.', answer: { type: 'num', value: 210, unit: '점' }, steps: ['$3 \\times 70 = 210$'] }),
        );
      },
    },
  ],
  top: [
    {
      id: 'median-mean',
      title: '중앙값과 평균이 같아지는 변량',
      gen(r): ProblemDraft {
        return retry(
          () => {
            const bs = r.sample(Array.from({ length: 30 }, (_, i) => i + 1), 4).sort((a, b) => a - b);
            const S = bs.reduce((s, v) => s + v, 0);
            const med = (x: number) => [...bs, x].sort((p, q) => p - q)[2];
            const sols: number[] = [];
            for (let x = 1; x <= 300; x++) if (5 * med(x) === S + x) sols.push(x);
            if (sols.length < 1 || sols.length > 3) return null;
            const [b1, b2] = [bs[1], bs[2]];
            const c1 = 5 * b1 - S;
            const c3 = 5 * b2 - S;
            const mid = new F(S, 4);
            return {
              q: `다섯 개의 변량 $${r.shuffle([...bs.map(String), 'x']).join(', ')}$ 의 중앙값과 평균이 같을 때, 자연수 $x$ 의 값을 모두 구하세요.`,
              answer: { type: 'set', values: sols },
              steps: [
                `$x$ 를 뺀 네 변량을 크기순으로 쓰면 $${bs.join(', ')}$ 이고, $x$ 가 어디에 들어가는지에 따라 중앙값이 $${b1}$, $x$, $${b2}$ 중 하나가 됩니다. 평균은 $\\frac{${S} + x}{5}$`,
                `① $x \\le ${b1}$: 중앙값 $${b1}$ → $${S} + x = ${5 * b1}$, $x = ${c1}$ ${c1 >= 1 && c1 <= b1 ? '(조건에 맞음)' : '(조건에 맞지 않음)'}`,
                `② $${b1} \\le x \\le ${b2}$: 중앙값 $x$ → $${S} + x = 5x$, $x = ${mid.tex()}$ ${mid.isInt() && mid.value >= b1 && mid.value <= b2 ? '(조건에 맞음)' : '(조건에 맞지 않음)'}`,
                `③ $x \\ge ${b2}$: 중앙값 $${b2}$ → $${S} + x = ${5 * b2}$, $x = ${c3}$ ${c3 >= b2 ? '(조건에 맞음)' : '(조건에 맞지 않음)'}`,
                `답: $x = ${sols.join(', ')}$`,
              ],
              hint: 'x 가 놓이는 위치에 따라 경우를 나누세요.',
            };
          },
          () => ({ q: '$2, 4, 6, 8, x$ 의 평균이 $6$ 일 때 $x$ 를 구하세요.', answer: { type: 'num', value: 10 }, steps: ['$20 + x = 30$'] }),
        );
      },
    },
    {
      id: 'relative-ratio',
      title: '두 집단의 상대도수의 비',
      gen(r): ProblemDraft {
        return retry(
          () => {
            const [m, n] = [r.int(1, 7), r.int(1, 7)];
            const [p, q] = [r.int(1, 7), r.int(1, 7)];
            if (gcd(m, n) !== 1 || gcd(p, q) !== 1 || (m === n && p === q) || m === n) return null;
            const inv = r.chance(0.5);
            let A: number, B: number;
            if (!inv) {
              A = p * n;
              B = q * m;
            } else {
              A = p * m;
              B = q * n;
            }
            const g = gcd(A, B);
            A /= g;
            B /= g;
            if (A === B) return null;
            return {
              q: inv
                ? `A 중학교와 B 중학교의 전체 학생 수의 비는 $${m} : ${n}$ 이고, 두 학교에서 통학 시간이 $20$ 분 이상 $30$ 분 미만인 계급의 상대도수의 비는 $${p} : ${q}$ 입니다. 이 계급의 두 학교 학생 수의 비를 가장 간단한 자연수의 비 $a : b$ 로 나타낼 때, $a$, $b$ 의 값을 구하세요.`
                : `A 중학교와 B 중학교의 전체 학생 수의 비는 $${m} : ${n}$ 이고, 두 학교에서 통학 시간이 $20$ 분 이상 $30$ 분 미만인 학생 수의 비는 $${p} : ${q}$ 입니다. 이 계급의 두 학교의 상대도수의 비를 가장 간단한 자연수의 비 $a : b$ 로 나타낼 때, $a$, $b$ 의 값을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'a', value: A }, { label: 'b', value: B }] },
              steps: inv
                ? [
                    `두 학교의 전체 학생 수를 $${m}k$, $${n}k$, 상대도수를 $${p}t$, $${q}t$ 라 합니다.`,
                    `(도수) = (상대도수) $\\times$ (전체 도수) 이므로 도수는 $${p}t \\times ${m}k$, $${q}t \\times ${n}k$`,
                    `도수의 비: $${p * m} : ${q * n}$`,
                    `가장 간단한 비: $${A} : ${B}$`,
                    `$a = ${A}$, $b = ${B}$`,
                  ]
                : [
                    `두 학교의 전체 학생 수를 $${m}k$, $${n}k$, 그 계급의 학생 수를 $${p}t$, $${q}t$ 라 합니다.`,
                    `(상대도수) = (계급의 도수) $\\div$ (전체 도수)`,
                    `상대도수의 비: $\\frac{${p}t}{${m}k} : \\frac{${q}t}{${n}k} = ${new F(p, m).tex()} : ${new F(q, n).tex()}$`,
                    `양쪽에 $${m * n}$ 을 곱하면 $${p * n} : ${q * m}$ → 가장 간단한 비 $${A} : ${B}$`,
                    `$a = ${A}$, $b = ${B}$`,
                  ],
              hint: '전체 도수와 계급의 도수를 비례상수 k, t 로 나타내 보세요.',
            };
          },
          () => ({ q: '전체 도수가 $20$, 어떤 계급의 도수가 $5$ 일 때 상대도수를 구하세요.', answer: { type: 'num', value: 0.25 }, steps: ['$5 \\div 20 = 0.25$'] }),
        );
      },
    },
  ],
};

export const hard1: Record<string, HardSet> = {
  'm1a-1': m1a1,
  'm1a-2': m1a2,
  'm1a-3': m1a3,
  'm1a-4': m1a4,
  'm1a-5': m1a5,
  'm1b-1': m1b1,
  'm1b-2': m1b2,
  'm1b-3': m1b3,
  'm1b-4': m1b4,
  'm1b-5': m1b5,
};

export type { Rng };
