// 중3-1 심화 유형(skills 뒤에 이어 붙임)과 최상위 유형(top)
import type { Skill } from '../../core/types';
import type { Rng } from '../../core/rng';
import { F } from '../../core/frac';
import { simplifySqrt } from '../../core/nt';
import { sqrtTex, termsTex, poly, linTex } from '../../core/tex';
import { mc, fac, isSq } from './util';
import { jo, ks } from './hard-util';

const fr = (n: number, d = 1) => new F(n, d);
const SQF = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19, 21, 22, 23, 26, 29, 30];
const rt = (k: number) => (isSq(k) ? String(Math.round(Math.sqrt(k))) : `\\sqrt{${k}}`);
const sgn = (n: number) => (n === 0 ? '' : n > 0 ? `+${n}` : `${n}`);

/** √n − √m 을 간단히 한 TeX (n > m) */
function surdDiff(n: number, m: number): string {
  const [o1, i1] = simplifySqrt(n);
  const [o2, i2] = simplifySqrt(m);
  if (i1 === i2) return i1 === 1 ? String(o1 - o2) : ks(o1 - o2, i1);
  return `${sqrtTex(n)}-${sqrtTex(m)}`;
}

export const M3A_HARD: Record<string, Skill[]> = {
  // ───────── 제곱근과 실수 ─────────
  'm3a-1': [
    {
      id: 'floor-sqrt-sum',
      title: '√n 의 정수 부분과 그 합',
      gen(r, level) {
        if (level === 1) {
          let n = 0;
          do n = r.int(2, 99);
          while (isSq(n));
          const k = Math.floor(Math.sqrt(n));
          return {
            q: `$\\sqrt{${n}}$ 의 정수 부분을 구하세요.`,
            answer: { type: 'num', value: k },
            steps: [`$${k}^2=${k * k}<${n}<${(k + 1) ** 2}=${k + 1}^2$`, `$${k}<\\sqrt{${n}}<${k + 1}$ 이므로 정수 부분은 $${k}$`],
          };
        }
        if (level === 2) {
          const k = r.int(2, 9);
          return {
            q: `$\\sqrt{n}$ 의 정수 부분이 $${k}$ 인 자연수 $n$ 의 개수를 구하세요.`,
            answer: { type: 'num', value: 2 * k + 1, unit: '개' },
            steps: [`$${k}\\le\\sqrt{n}<${k + 1}$ 에서 각 변을 제곱하면 $${k * k}\\le n<${(k + 1) ** 2}$`, `$n=${k * k},\\ ${k * k + 1},\\ \\cdots,\\ ${(k + 1) ** 2 - 1}$`, `개수는 $${(k + 1) ** 2}-${k * k}=${2 * k + 1}$ (개)`],
          };
        }
        const N = r.int(10, 48);
        const K = Math.floor(Math.sqrt(N));
        const parts: string[] = [];
        let sum = 0;
        for (let k = 1; k <= K; k++) {
          const cnt = k < K ? 2 * k + 1 : N - k * k + 1;
          parts.push(`${k}\\times${cnt}`);
          sum += k * cnt;
        }
        return {
          q: `자연수 $n$ 에 대하여 $\\sqrt{n}$ 의 정수 부분을 $f(n)$ 이라 할 때, $f(1)+f(2)+f(3)+\\cdots+f(${N})$ 의 값을 구하세요.`,
          answer: { type: 'num', value: sum },
          steps: [
            '$f(n)=k$ 이면 $k^2\\le n<(k+1)^2$ 이므로 $f(n)=k$ 인 $n$ 은 $2k+1$ 개',
            `$f(n)=1$: $1\\sim3$ ($3$ 개), $f(n)=2$: $4\\sim8$ ($5$ 개), $\\cdots$`,
            `$f(n)=${K}$: $${K * K}\\sim${N}$ ($${N - K * K + 1}$ 개)`,
            `합은 $${parts.join('+')}=${sum}$`,
          ],
        };
      },
    },
  ],

  // ───────── 근호를 포함한 식의 계산 ─────────
  'm3a-2': [
    {
      id: 'surd-rational',
      title: '근호가 있는 식이 유리수가 될 조건',
      gen(r, level) {
        const s = r.pick([2, 3, 5, 6, 7]);
        if (level === 1) {
          const a = r.int(1, 5),
            b = r.int(1, 6);
          return {
            q: `$\\sqrt{${s}}(${a === 1 ? '' : a}\\sqrt{${s}}-k)+${b === 1 ? '' : b}\\sqrt{${s}}$ ${jo(String(s), '이', '가')} 유리수가 되도록 하는 유리수 $k$ 의 값을 구하세요.`,
            answer: { type: 'num', value: b },
            steps: [`전개하면 $${a * s}-k\\sqrt{${s}}+${b === 1 ? '' : b}\\sqrt{${s}}=${a * s}+(${b}-k)\\sqrt{${s}}$`, `유리수가 되려면 $\\sqrt{${s}}$ 의 계수가 $0$: $${b}-k=0$`, `$k=${b}$`],
          };
        }
        if (level === 2) {
          const d = r.int(1, 5),
            m = r.nonzero(-5, 5);
          const p = d * s;
          return {
            q: `$k(\\sqrt{${s}}${sgn(-m)})-\\frac{${p}}{\\sqrt{${s}}}$ ${jo(String(p), '이', '가')} 유리수가 되도록 유리수 $k$ 의 값을 정할 때, 이 식의 값을 구하세요.`,
            answer: { type: 'num', value: -d * m },
            steps: [`$\\frac{${p}}{\\sqrt{${s}}}=\\frac{${p}\\sqrt{${s}}}{${s}}=${d === 1 ? '' : d}\\sqrt{${s}}$`, `식 $=k\\sqrt{${s}}${m > 0 ? '-' : '+'}${Math.abs(m) === 1 ? '' : Math.abs(m)}k-${d === 1 ? '' : d}\\sqrt{${s}}=(k-${d})\\sqrt{${s}}${m > 0 ? '-' : '+'}${Math.abs(m) === 1 ? '' : Math.abs(m)}k$`, `유리수가 되려면 $k-${d}=0$, $k=${d}$`, `식의 값은 $${-m}\\times${d}=${-d * m}$`],
          };
        }
        let a = 0,
          b = 0,
          c = 0,
          k = 0;
        for (;;) {
          a = r.int(1, 4);
          b = r.int(1, 4);
          k = r.nonzero(-6, 6);
          if ((k * b) % a === 0) {
            c = (k * b) / a;
            if (c !== 0) break;
          }
        }
        const val = a * b * s - k * c;
        const A = a === 1 ? '' : String(a),
          B = b === 1 ? '' : String(b);
        return {
          q: `$(${A}\\sqrt{${s}}+k)(${B}\\sqrt{${s}}${sgn(-c)})$ ${jo(String(c === 0 ? s : Math.abs(c)), '이', '가')} 유리수가 되도록 하는 유리수 $k$ 의 값과 그때의 식의 값을 구하세요.`,
          answer: { type: 'fields', fields: [{ label: 'k', value: k }, { label: '식의 값', value: val }] },
          steps: [
            `전개: $${a * b * s}${sgn(-a * c)}\\sqrt{${s}}+${B}k\\sqrt{${s}}${c > 0 ? '-' : '+'}${Math.abs(c) === 1 ? '' : Math.abs(c)}k$`,
            `$=(${a * b * s}${c > 0 ? '-' : '+'}${Math.abs(c) === 1 ? '' : Math.abs(c)}k)+(${B}k${sgn(-a * c)})\\sqrt{${s}}$`,
            `유리수가 되려면 $${B}k${sgn(-a * c)}=0$, $k=${k}$`,
            `식의 값은 $${a * b * s}${sgn(-c * k)}=${val}$`,
          ],
        };
      },
    },
  ],

  // ───────── 다항식의 곱셈과 인수분해 ─────────
  'm3a-3': [
    {
      id: 'cond-value',
      title: '곱셈 공식의 변형으로 식의 값 구하기',
      gen(r, level) {
        if (level === 1) {
          const p = r.nonzero(-8, 8);
          let q = r.nonzero(-6, 6);
          // 실수 x, y 가 존재하도록 (x+y)^2-4xy >= 0
          while (p * p - 4 * q < 0) q = r.nonzero(-6, 6);
          const askSq = r.chance(0.5);
          return {
            q: `$x+y=${p}$, $xy=${q}$ 일 때, $${askSq ? 'x^2+y^2' : '(x-y)^2'}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: askSq ? p * p - 2 * q : p * p - 4 * q },
            steps: askSq
              ? ['$x^2+y^2=(x+y)^2-2xy$', `$=${p * p}-2\\times(${q})=${p * p - 2 * q}$`]
              : ['$(x-y)^2=(x+y)^2-4xy$', `$=${p * p}-4\\times(${q})=${p * p - 4 * q}$`],
          };
        }
        if (level === 2) {
          const p = r.int(2, 8);
          const v = r.int(0, 2);
          if (v === 2) {
            return {
              q: `$x+\\frac{1}{x}=${p}$ 일 때, $x^2+\\frac{1}{x^2}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: p * p - 2 },
              steps: ['$\\left(x+\\frac{1}{x}\\right)^2=x^2+2+\\frac{1}{x^2}$', `$x^2+\\frac{1}{x^2}=${p}^2-2=${p * p - 2}$`],
            };
          }
          let q = r.nonzero(-6, 8);
          // 실수 x, y 가 존재하도록 (x-y)^2+4xy >= 0
          while (p * p + 4 * q < 0) q = r.nonzero(-6, 8);
          return {
            q: `$x-y=${p}$, $xy=${q}$ 일 때, $${v === 0 ? 'x^2+y^2' : '(x+y)^2'}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: v === 0 ? p * p + 2 * q : p * p + 4 * q },
            steps: v === 0 ? ['$x^2+y^2=(x-y)^2+2xy$', `$=${p * p}+2\\times(${q})=${p * p + 2 * q}$`] : ['$(x+y)^2=(x-y)^2+4xy$', `$=${p * p}+4\\times(${q})=${p * p + 4 * q}$`],
          };
        }
        const d = r.pick([1, 1, 2]);
        const q = d === 1 ? r.int(1, 5) : r.int(1, 3);
        const s = q * q + d;
        const k = r.nonzero(-3, 3);
        const val = fr(4 * s, d * d).add(fr(k - 2, d));
        const xs = d === 1 ? `\\sqrt{${s}}+${q}` : `\\frac{\\sqrt{${s}}+${q}}{${d}}`;
        const ys = d === 1 ? `\\sqrt{${s}}-${q}` : `\\frac{\\sqrt{${s}}-${q}}{${d}}`;
        const sum = d === 1 ? `2\\sqrt{${s}}` : `\\sqrt{${s}}`;
        const E = termsTex([
          { c: 1, v: 'x^2' },
          { c: k, v: 'xy' },
          { c: 1, v: 'y^2' },
        ]);
        return {
          q: `$x=\\frac{1}{\\sqrt{${s}}-${q}}$, $y=\\frac{1}{\\sqrt{${s}}+${q}}$ 일 때, $${E}$ 의 값을 구하세요.`,
          answer: { type: 'num', value: val.value, display: 'frac' },
          steps: [
            `분모를 유리화하면 $x=${xs}$, $y=${ys}$`,
            `$x+y=${sum}$, $xy=\\frac{1}{${s}-${q * q}}=${fr(1, d).tex()}$`,
            `$x^2+y^2=(x+y)^2-2xy=${fr(4 * s, d * d).tex()}-${fr(2, d).tex()}=${fr(4 * s, d * d).sub(fr(2, d)).tex()}$`,
            `$${E}=(x^2+y^2)${k > 0 ? '+' : '-'}${Math.abs(k) === 1 ? '' : Math.abs(k)}xy=${fr(4 * s, d * d).sub(fr(2, d)).tex()}${k > 0 ? '+' : '-'}${fr(Math.abs(k), d).tex()}=${val.tex()}$`,
          ],
        };
      },
    },
  ],

  // ───────── 이차방정식 ─────────
  'm3a-4': [
    {
      id: 'root-cond',
      title: '근의 조건으로 상수 구하기',
      gen(r, level) {
        if (level === 1) {
          let r1 = 0,
            r2 = 0,
            u = 0;
          do {
            r1 = r.nonzero(-6, 6);
            r2 = r.nonzero(-6, 6);
            u = r.nonzero(-6, 6);
          } while (r1 >= r2 || u === r2);
          const big = r.chance(0.6);
          const t = big ? r2 : r1;
          if (u === t) return this.gen(r, level);
          const k = -(t + u),
            c = t * u;
          return {
            q: `이차방정식 $${poly([1, -(r1 + r2), r1 * r2])}=0$ 의 두 근 중 ${big ? '큰' : '작은'} 근이 이차방정식 $x^2+kx${sgn(c)}=0$ 의 한 근일 때, 상수 $k$ 의 값을 구하세요.`,
            answer: { type: 'num', value: k },
            steps: [`$${fac(1, -r1)}${fac(1, -r2)}=0$ 에서 $x=${r1}$ 또는 $x=${r2}$`, `${big ? '큰' : '작은'} 근은 $${t}$`, `$x=${t}$ ${jo(String(t), '을', '를')} 대입: $${t * t}${sgn(t)}k${sgn(c)}=0$`, `$k=${k}$`],
          };
        }
        if (level === 2) {
          const c = r.pick([-24, -20, -18, -12, -8, -6, 6, 8, 12, 18, 20, 24]);
          const pairs: [number, number][] = [];
          for (let a = -Math.abs(c); a <= Math.abs(c); a++) {
            if (a === 0 || c % a !== 0) continue;
            const b = c / a;
            if (a <= b) pairs.push([a, b]);
          }
          const ks = [...new Set(pairs.map(([a, b]) => -(a + b)))].sort((x, y) => x - y);
          return {
            q: `이차방정식 $x^2+kx${sgn(c)}=0$ 의 두 근이 모두 정수가 되도록 하는 정수 $k$ 는 모두 몇 개인지 구하세요.`,
            answer: { type: 'num', value: ks.length, unit: '개' },
            steps: [
              `두 정수근을 $\\alpha$, $\\beta$ 라 하면 $x^2+kx${sgn(c)}=(x-\\alpha)(x-\\beta)$`,
              `전개하여 비교하면 $\\alpha\\beta=${c}$, $k=-(\\alpha+\\beta)$`,
              `곱이 $${c}$ 인 정수 쌍: ${pairs.map(([a, b]) => `$(${a},\\,${b})$`).join(', ')}`,
              `$k$ 의 값: ${ks.map((x) => `$${x}$`).join(', ')} → $${ks.length}$ 개`,
            ],
          };
        }
        const a = r.nonzero(-4, 4),
          k = r.nonzero(-6, 6);
        const b = 2 * a * k + a * a;
        if (b === 0) return this.gen(r, level);
        return {
          q: `이차방정식 $x^2-2(k${sgn(a)})x+k^2${sgn(b)}=0$ 이 중근을 가질 때, 상수 $k$ 의 값과 그 중근을 구하세요.`,
          answer: { type: 'fields', fields: [{ label: 'k', value: k }, { label: '중근', value: k + a }] },
          steps: [
            `중근을 가지려면 좌변이 완전제곱식: 상수항 $=\\left(\\frac{x\\text{의 계수}}{2}\\right)^2$`,
            `$k^2${sgn(b)}=(k${sgn(a)})^2=k^2${sgn(2 * a)}k+${a * a}$`,
            `$${2 * a}k=${b - a * a}$, $k=${k}$`,
            `$(x-${k + a})^2=0$ 이 되어 중근은 $x=${k + a}$`,
          ],
        };
      },
    },
  ],

  // ───────── 이차함수와 그래프 ─────────
  'm3a-5': [
    {
      id: 'parabola-area',
      title: '포물선과 삼각형의 넓이',
      gen(r, level) {
        if (level === 1) {
          const a = r.pick([1, -1, 2, -2]);
          let r1 = 0,
            r2 = 0;
          do {
            r1 = r.nonzero(-5, 5);
            r2 = r.nonzero(-5, 5);
          } while (r1 >= r2);
          const c = a * r1 * r2;
          const area = fr((r2 - r1) * Math.abs(c), 2);
          return {
            q: `이차함수 $y=${poly([a, -a * (r1 + r2), c])}$ 의 그래프가 $x$ 축과 만나는 두 점을 $A$, $B$, $y$ 축과 만나는 점을 $C$ 라 할 때, $\\triangle ABC$ 의 넓이를 구하세요.`,
            answer: { type: 'num', value: area.value, display: 'frac' },
            steps: [`$y=0$: $${a === 1 ? '' : a === -1 ? '-' : a}${fac(1, -r1)}${fac(1, -r2)}=0$, $x=${r1}$ 또는 $x=${r2}$`, `$${'\\overline{AB}'}=${r2}-(${r1})=${r2 - r1}$`, `$x=0$ 일 때 $y=${c}$ 이므로 $C(0,\\,${c})$, 높이 $${Math.abs(c)}$`, `넓이 $=\\frac{1}{2}\\times${r2 - r1}\\times${Math.abs(c)}=${area.tex()}$`],
          };
        }
        if (level === 2) {
          const a = r.pick([1, -1, 2, -2]);
          const p = r.int(-4, 4),
            h = r.int(1, 4);
          const q = -a * h * h;
          const area = h * Math.abs(q);
          return {
            q: `이차함수 $y=${poly([a, -2 * a * p, a * p * p + q])}$ 의 그래프의 꼭짓점을 $V$, $x$ 축과 만나는 두 점을 $A$, $B$ 라 할 때, $\\triangle VAB$ 의 넓이를 구하세요.`,
            answer: { type: 'num', value: area },
            steps: [`$y=${a === 1 ? '' : a === -1 ? '-' : a}${p === 0 ? 'x^2' : `${fac(1, -p)}^2`}${sgn(q)}$ 이므로 $V(${p},\\,${q})$`, `$y=0$: $${p === 0 ? 'x^2' : `${fac(1, -p)}^2`}=${h * h}$, $x=${p - h}$ 또는 $x=${p + h}$`, `$${'\\overline{AB}'}=${2 * h}$, 높이 $${Math.abs(q)}$`, `넓이 $=\\frac{1}{2}\\times${2 * h}\\times${Math.abs(q)}=${area}$`],
          };
        }
        const up = r.chance(0.5);
        const p = r.nonzero(-4, 4),
          t = r.int(1, 5);
        const S = t ** 3;
        const k = up ? p * p - t * t : t * t - p * p;
        const vy = up ? -t * t : t * t;
        return {
          q: `이차함수 $y=${up ? '' : '-'}x^2${sgn(up ? -2 * p : 2 * p)}x+k$ 의 그래프의 꼭짓점을 $V$, $x$ 축과 만나는 두 점을 $A$, $B$ 라 하자. $\\triangle VAB$ 의 넓이가 $${S}$ 일 때, 상수 $k$ 의 값을 구하세요.`,
          answer: { type: 'num', value: k },
          steps: [
            `$y=${up ? '' : '-'}${fac(1, -p)}^2${up ? `+k-${p * p}` : `+k+${p * p}`}$ 이므로 꼭짓점의 $y$ 좌표는 $${up ? `k-${p * p}` : `k+${p * p}`}$`,
            `꼭짓점의 $y$ 좌표를 $${up ? '-t^2' : 't^2'}$ $(t>0)$ 이라 하면 $${fac(1, -p)}^2=t^2$, $x=${p}\\pm t$`,
            `$${'\\overline{AB}'}=2t$, 높이 $t^2$ 이므로 넓이 $=\\frac{1}{2}\\times2t\\times t^2=t^3$`,
            `$t^3=${S}$ 에서 $t=${t}$`,
            `$${up ? `k-${p * p}` : `k+${p * p}`}=${vy}$, $k=${k}$`,
          ],
        };
      },
    },
  ],
};

// ═════════════════════════ 최상위 유형 ═════════════════════════

function sqrtTwoCond(r: Rng) {
  for (;;) {
    const s = r.pick([2, 3, 5, 6, 7]),
      t = r.pick([1, 2, 3]);
    const c = s * t * t;
    const M = r.int(30, 200);
    const cands: number[] = [];
    for (let m = 1; s * m * m < M; m++) cands.push(s * m * m);
    const sols = cands.filter((n) => isSq(M - n));
    if (sols.length < 1 || sols.length > 3 || cands.length < 3 || cands.length > 9) continue;
    const sum = sols.reduce((a, b) => a + b, 0);
    return {
      q: `$\\sqrt{${c}n}$ 과 $\\sqrt{${M}-n}$ 이 모두 자연수가 되도록 하는 자연수 $n$ 의 값을 모두 더하면 얼마인지 구하세요.`,
      answer: { type: 'num' as const, value: sum },
      steps: [
        `${t > 1 ? `$${c}=${t}^2\\times${s}$ 이므로 ` : ''}$\\sqrt{${c}n}$ 이 자연수가 되려면 $${s}n$ 이 제곱수, 곧 $n=${s}\\times m^2$ ($m$ 은 자연수)`,
        `$\\sqrt{${M}-n}$ 이 자연수이려면 $n<${M}$ 이므로 $n$ 의 후보는 ${cands.map((x) => `$${x}$`).join(', ')}`,
        `각각 $${M}-n$ 을 구하면 ${cands.map((x) => `$${M - x}$`).join(', ')}`,
        `이 중 제곱수인 것은 ${sols.map((x) => `$${M - x}=${Math.round(Math.sqrt(M - x))}^2$`).join(', ')}`,
        `조건을 만족하는 $n$ 은 ${sols.map((x) => `$${x}$`).join(', ')}`,
        ...(sols.length > 1 ? [`합은 $${sols.join('+')}=${sum}$`] : []),
      ],
    };
  }
}

function sqrtAbs(r: Rng) {
  const cases = [
    { cond: 'ab<0,\\ a-b>0', sa: 1, sb: -1, why: '$ab<0$ 이므로 $a$, $b$ 의 부호가 다르고, $a-b>0$ 에서 $a>b$ 이므로 $a>0$, $b<0$' },
    { cond: 'ab<0,\\ a<b', sa: -1, sb: 1, why: '$ab<0$ 이므로 $a$, $b$ 의 부호가 다르고, $a<b$ 이므로 $a<0$, $b>0$' },
    { cond: 'ab>0,\\ a+b<0', sa: -1, sb: -1, why: '$ab>0$ 이므로 $a$, $b$ 의 부호가 같고, $a+b<0$ 이므로 $a<0$, $b<0$' },
    { cond: '\\frac{b}{a}<0,\\ a>b', sa: 1, sb: -1, why: '$\\frac{b}{a}<0$ 이므로 $a$, $b$ 의 부호가 다르고, $a>b$ 이므로 $a>0$, $b<0$' },
  ];
  const cs = r.pick(cases);
  type T = { al: number; be: number; e: number; sg: number };
  const terms: T[] = [];
  const seen = new Set<string>();
  while (terms.length < 3) {
    const al = r.int(-2, 2),
      be = r.int(-2, 2);
    if (al === 0 && be === 0) continue;
    const x = al * cs.sa,
      y = be * cs.sb;
    if (!((x >= 0 && y >= 0) || (x <= 0 && y <= 0))) continue;
    const neg = al < 0 || (al === 0 && be < 0);
    const key = neg ? `${-al},${-be}` : `${al},${be}`;
    if (seen.has(key)) continue;
    seen.add(key);
    terms.push({ al, be, e: terms.length === 0 ? 1 : r.sign(), sg: x > 0 || y > 0 ? 1 : -1 });
  }
  const L = (t: T) => termsTex([{ c: t.al, v: 'a' }, { c: t.be, v: 'b' }]);
  const rad = (t: T) => {
    const l = L(t);
    return l === 'a' || l === 'b' ? `\\sqrt{${l}^2}` : `\\sqrt{(${l})^2}`;
  };
  const expr = terms.map((t, i) => `${i === 0 ? '' : t.e > 0 ? '+' : '-'}${rad(t)}`).join('');
  const val = (flip: number) => {
    let A = 0,
      B = 0;
    terms.forEach((t, i) => {
      const s = t.sg * t.e * (i === flip ? -1 : 1);
      A += s * t.al;
      B += s * t.be;
    });
    return termsTex([{ c: A, v: 'a' }, { c: B, v: 'b' }]);
  };
  const right = val(-1);
  const allPos = (() => {
    let A = 0,
      B = 0;
    terms.forEach((t) => {
      A += t.e * t.al;
      B += t.e * t.be;
    });
    return termsTex([{ c: A, v: 'a' }, { c: B, v: 'b' }]);
  })();
  return {
    q: `$${cs.cond}$ 일 때, $${expr}$ 을 간단히 하면?`,
    answer: mc(r, right, [val(0), val(1), val(2), allPos], (i) => termsTex([{ c: i - 3, v: 'a' }, { c: 2 - (i % 3), v: 'b' }])),
    steps: [
      cs.why,
      ...terms.map((t) => {
        const l = L(t);
        const neg = termsTex([{ c: -t.al, v: 'a' }, { c: -t.be, v: 'b' }]);
        return `$${l}${t.sg > 0 ? '>' : '<'}0$ 이므로 $${rad(t)}=${t.sg > 0 ? l : neg}$`;
      }),
      `$\\sqrt{A^2}=|A|$ 를 이용해 모두 정리하면 $${right}$`,
    ],
  };
}

function telescoping(r: Rng) {
  if (r.chance(0.55)) {
    let m = 0,
      n = 0;
    if (r.chance(0.5)) {
      m = r.pick([1, 4, 9]);
      n = r.pick([16, 25, 36, 49, 64, 81, 100].filter((x) => x > m + 3));
    } else {
      m = r.pick([1, 2, 3, 5, 8]);
      n = r.int(m + 4, 60);
      if (isSq(n) && isSq(m)) return telescoping(r);
    }
    const sum = `\\frac{1}{${rt(m)}+${rt(m + 1)}}+\\frac{1}{${rt(m + 1)}+${rt(m + 2)}}+\\cdots+\\frac{1}{${rt(n - 1)}+${rt(n)}}`;
    const ansT = surdDiff(n, m);
    const integer = isSq(n) && isSq(m);
    const steps = [
      '각 항의 분모를 유리화: $\\frac{1}{\\sqrt{k}+\\sqrt{k+1}}=\\frac{\\sqrt{k+1}-\\sqrt{k}}{(k+1)-k}=\\sqrt{k+1}-\\sqrt{k}$',
      `주어진 식 $=(${rt(m + 1)}-${rt(m)})+(${rt(m + 2)}-${rt(m + 1)})+\\cdots+(${rt(n)}-${rt(n - 1)})$`,
      '앞 항의 빼는 수와 뒤 항의 더하는 수가 차례로 지워진다.',
      `$=${rt(n)}-${rt(m)}$`,
      `$=${ansT}$`,
    ];
    if (integer) return { q: `$${sum}$ 의 값을 구하세요.`, answer: { type: 'num' as const, value: Math.sqrt(n) - Math.sqrt(m) }, steps };
    return {
      q: `$${sum}$ 의 값은?`,
      answer: mc(r, ansT, [`${sqrtTex(n)}+${sqrtTex(m)}`, sqrtTex(n - m), surdDiff(n + 1, m), surdDiff(n, m + 1).startsWith('-') ? sqrtTex(n + m) : surdDiff(n, m + 1), `${sqrtTex(n)}-1`]),
      steps,
    };
  }
  const N = r.int(4, 40);
  const T = 2 * N + 1;
  const sum = `\\frac{1}{1+\\sqrt{3}}+\\frac{1}{\\sqrt{3}+\\sqrt{5}}+\\frac{1}{\\sqrt{5}+\\sqrt{7}}+\\cdots+\\frac{1}{${rt(T - 2)}+${rt(T)}}`;
  const steps = [
    '각 항의 분모를 유리화: $\\frac{1}{\\sqrt{k}+\\sqrt{k+2}}=\\frac{\\sqrt{k+2}-\\sqrt{k}}{(k+2)-k}=\\frac{\\sqrt{k+2}-\\sqrt{k}}{2}$',
    `주어진 식 $=\\frac{1}{2}\\{(\\sqrt{3}-1)+(\\sqrt{5}-\\sqrt{3})+\\cdots+(${rt(T)}-${rt(T - 2)})\\}$`,
    '중간 항이 차례로 지워진다.',
    `$=\\frac{1}{2}(${rt(T)}-1)$`,
  ];
  if (isSq(T)) {
    const v = (Math.sqrt(T) - 1) / 2;
    return { q: `$${sum}$ 의 값을 구하세요.`, answer: { type: 'num' as const, value: v }, steps: [...steps, `$=${v}$`] };
  }
  const [o, i] = simplifySqrt(T);
  const ansT = `\\frac{${o === 1 ? '' : o}\\sqrt{${i}}-1}{2}`;
  return {
    q: `$${sum}$ 의 값은?`,
    answer: mc(r, ansT, [`${sqrtTex(T)}-1`, `\\frac{${o === 1 ? '' : o}\\sqrt{${i}}+1}{2}`, `\\frac{${sqrtTex(T - 2)}-1}{2}`, `\\frac{${sqrtTex(T + 2)}-1}{2}`]),
    steps: [...steps, `$=${ansT}$`],
  };
}

function surdDecimal(r: Rng) {
  const t = r.chance(0.7) ? 1 : 2;
  const s = t === 1 ? r.pick(SQF) : r.pick([2, 3, 5, 6, 7, 10]);
  const qmax = Math.floor(Math.sqrt(s - 1));
  if (qmax < 1) return surdDecimal(r);
  const q = r.int(1, Math.min(qmax, 4));
  const p = t * (s - q * q);
  const T = t * t * s;
  const Fl = Math.floor(Math.sqrt(T));
  const a = Fl + t * q;
  const ts = t === 1 ? `\\sqrt{${s}}` : `${t}\\sqrt{${s}}`;
  return {
    q: `$\\frac{${p}}{\\sqrt{${s}}-${q}}$ 의 정수 부분을 $a$, 소수 부분을 $b$ 라 할 때, $a$ 의 값과 $b(b+${2 * Fl})$ 의 값을 구하세요.`,
    answer: { type: 'fields' as const, fields: [{ label: 'a', value: a }, { label: `b(b+${2 * Fl})`, value: T - Fl * Fl }] },
    steps: [
      `분모를 유리화: $\\frac{${p}(\\sqrt{${s}}+${q})}{(\\sqrt{${s}}-${q})(\\sqrt{${s}}+${q})}=\\frac{${p}(\\sqrt{${s}}+${q})}{${s - q * q}}=${ts}+${t * q}$`,
      `${t === 1 ? '' : `$${ts}=\\sqrt{${T}}$ 이고 `}$${Fl}^2=${Fl * Fl}<${T}<${(Fl + 1) ** 2}=${Fl + 1}^2$ 이므로 $${Fl}<${ts}<${Fl + 1}$`,
      `$${Fl + t * q}<${ts}+${t * q}<${Fl + t * q + 1}$ 이므로 $a=${a}$`,
      `$b=(${ts}+${t * q})-${a}=${ts}-${Fl}$`,
      `$b+${2 * Fl}=${ts}+${Fl}$ 이므로 $b(b+${2 * Fl})=(${ts}-${Fl})(${ts}+${Fl})$`,
      `$=${T}-${Fl * Fl}=${T - Fl * Fl}$`,
    ],
  };
}

function factorTrick(r: Rng) {
  if (r.chance(0.5)) {
    const b = r.int(2, 5),
      m = r.pick([3, 4]);
    const facs = Array.from({ length: m }, (_, i) => `(${b}${i === 0 ? '' : `^{${2 ** i}}`}+1)`).join('');
    const a = 2 ** m;
    const steps = [`주어진 식에 $(${b}-1)$ 을 곱하고 다시 $(${b}-1)$ 로 나누어 생각한다.`, `$(${b}-1)(${b}+1)=${b}^2-1$`];
    for (let i = 1; i < m; i++) steps.push(`$(${b}^{${2 ** i}}-1)(${b}^{${2 ** i}}+1)=${b}^{${2 ** (i + 1)}}-1$`);
    if (b === 2) {
      steps.push(`$2-1=1$ 이므로 주어진 식 $=2^{${a}}-1$`, `$a=${a}$`);
      return { q: `$${facs}=2^a-1$ 을 만족하는 자연수 $a$ 의 값을 구하세요.`, answer: { type: 'num' as const, value: a }, steps };
    }
    steps.push(`주어진 식 $=\\frac{${b}^{${a}}-1}{${b - 1}}$`, `$a=${a}$, $c=${b - 1}$ 이므로 $a+c=${a + b - 1}$`);
    return { q: `$${facs}=\\frac{${b}^a-1}{c}$ 을 만족하는 자연수 $a$, $c$ 에 대하여 $a+c$ 의 값을 구하세요. (단, $c$ 는 $${b}$ 보다 작은 자연수)`, answer: { type: 'num' as const, value: a + b - 1 }, steps };
  }
  const n = r.int(10, 40);
  const X = n * n + 3 * n;
  return {
    q: `$\\sqrt{${n}\\times${n + 1}\\times${n + 2}\\times${n + 3}+1}$ 의 값을 구하세요.`,
    answer: { type: 'num' as const, value: X + 1 },
    steps: [
      `$${n}=x$ 로 놓으면 $x(x+1)(x+2)(x+3)+1$`,
      '$\\{x(x+3)\\}\\{(x+1)(x+2)\\}+1=(x^2+3x)(x^2+3x+2)+1$',
      '$x^2+3x=X$ 로 치환: $X(X+2)+1=X^2+2X+1=(X+1)^2$',
      '따라서 $\\sqrt{x(x+1)(x+2)(x+3)+1}=x^2+3x+1$ ($x>0$)',
      `$x=${n}$ ${jo(String(n), '을', '를')} 대입: $${n * n}+${3 * n}+1=${X + 1}$`,
    ],
  };
}

function intPairs(r: Rng) {
  if (r.chance(0.5)) {
    for (;;) {
      const a = r.nonzero(-4, 4),
        b = r.nonzero(-4, 4);
      const c = r.int(-10, 30);
      const N = c + a * b;
      if (N <= 0) continue;
      const sols: [number, number][] = [];
      for (let x = 1; x <= 200; x++) {
        if (x + b === 0) continue;
        if (N % (x + b) !== 0) continue;
        const y = N / (x + b) - a;
        if (y >= 1) sols.push([x, y]);
      }
      if (sols.length < 2 || sols.length > 8) continue;
      const eq = `${termsTex([{ c: 1, v: 'xy' }, { c: a, v: 'x' }, { c: b, v: 'y' }])}=${c}`;
      return {
        q: `방정식 $${eq}$ ${jo(String(c), '을', '를')} 만족하는 자연수 $x$, $y$ 의 순서쌍 $(x,\\,y)$ 의 개수를 구하세요.`,
        answer: { type: 'num' as const, value: sols.length, unit: '개' },
        steps: [
          `양변에 $${a * b}$ ${jo(String(a * b), '을', '를')} 더하면 $${termsTex([{ c: 1, v: 'xy' }, { c: a, v: 'x' }, { c: b, v: 'y' }, { c: a * b, v: '' }])}=${N}$`,
          `좌변을 인수분해: $(x${sgn(b)})(y${sgn(a)})=${N}$`,
          `$x\\ge1$, $y\\ge1$ 이므로 $x${sgn(b)}\\ge${1 + b}$, $y${sgn(a)}\\ge${1 + a}$ 이고 곱이 $${N}$ 인 정수 쌍만 찾는다.`,
          `가능한 $(x,\\,y)$: ${sols.map(([x, y]) => `$(${x},\\,${y})$`).join(', ')}`,
          `모두 $${sols.length}$ 개`,
        ],
      };
    }
  }
  for (;;) {
    const N = r.int(15, 150);
    const sols: [number, number][] = [];
    const prs: string[] = [];
    for (let d = 1; d * d < N; d++) {
      if (N % d !== 0) continue;
      const e = N / d;
      if ((d + e) % 2 !== 0) continue;
      sols.push([(d + e) / 2, (e - d) / 2]);
      prs.push(`(${d},\\,${e})`);
    }
    if (sols.length < 2) continue;
    return {
      q: `$x^2-y^2=${N}$ ${jo(String(N), '을', '를')} 만족하는 자연수 $x$, $y$ 의 순서쌍 $(x,\\,y)$ 의 개수를 구하세요.`,
      answer: { type: 'num' as const, value: sols.length, unit: '개' },
      steps: [
        `$(x-y)(x+y)=${N}$`,
        '$x$, $y$ 가 자연수이므로 $0<x-y<x+y$ 이고, $(x+y)+(x-y)=2x$ 가 짝수이므로 두 수는 홀짝이 같다.',
        `조건에 맞는 $(x-y,\\ x+y)$: ${prs.map((p) => `$${p}$`).join(', ')}`,
        `각각 풀면 $(x,\\,y)=${sols.map(([x, y]) => `(${x},\\,${y})`).join(',\\ ')}$`,
        `모두 $${sols.length}$ 개`,
      ],
    };
  }
}

function intRootsParam(r: Rng) {
  const N = r.pick([6, 8, 10, 12, 15, 9, 16, -6, -8, -10, -12, -15, -4]);
  const c = N - 1;
  const pairs: [number, number][] = [];
  for (let d = -Math.abs(N); d <= Math.abs(N); d++) {
    if (d === 0 || N % d !== 0) continue;
    const e = N / d;
    if (d <= e) pairs.push([d, e]);
  }
  const ks = [...new Set(pairs.map(([d, e]) => 2 - (d + e)))].sort((x, y) => x - y);
  // 검산: 판별식으로 직접 확인
  const brute: number[] = [];
  for (let k = -200; k <= 200; k++) {
    const D = k * k - 4 * (k + c);
    if (D < 0 || !isSq(D)) continue;
    if ((k + Math.round(Math.sqrt(D))) % 2 === 0) brute.push(k);
  }
  if (brute.length !== ks.length) throw new Error('intRootsParam mismatch');
  return {
    q: `$x$ 에 대한 이차방정식 $x^2+kx+k${sgn(c)}=0$ 의 두 근이 모두 정수가 되도록 하는 정수 $k$ 의 개수와 $k$ 의 최댓값을 구하세요.`,
    answer: { type: 'fields' as const, fields: [{ label: 'k 의 개수', value: ks.length }, { label: 'k 의 최댓값', value: ks[ks.length - 1] }] },
    steps: [
      '두 정수근을 $\\alpha$, $\\beta$ ($\\alpha\\le\\beta$) 라 하면 $x^2+kx+k' + sgn(c) + '=(x-\\alpha)(x-\\beta)$',
      `계수를 비교하면 $\\alpha+\\beta=-k$, $\\alpha\\beta=k${sgn(c)}$`,
      `두 식을 더해 $k$ 를 없애면 $\\alpha\\beta+\\alpha+\\beta=${c}$, 곧 $(\\alpha+1)(\\beta+1)=${N}$`,
      `$(\\alpha+1,\\ \\beta+1)$ 은 곱이 $${N}$ 인 정수 쌍: ${pairs.map(([d, e]) => `$(${d},\\,${e})$`).join(', ')}`,
      `$k=-(\\alpha+\\beta)=2-\\{(\\alpha+1)+(\\beta+1)\\}$ 이므로 $k$ 의 값은 ${ks.map((x) => `$${x}$`).join(', ')}`,
      `개수는 $${ks.length}$, 최댓값은 $${ks[ks.length - 1]}$`,
    ],
  };
}

function rootReciprocal(r: Rng) {
  const plus = r.chance(0.65);
  const p = r.int(3, 8);
  const al = '\\alpha';
  const inv = (k: number) => (k === 1 ? `\\frac{1}{${al}}` : `\\frac{1}{${al}^${k}}`);
  const s2 = plus ? p * p - 2 : p * p + 2;
  const opts = plus ? [0, 1, 2, 3] : [0, 2];
  const v = r.pick(opts);
  const head = [
    `$${al}$ 는 근이므로 $${al}^2-${p}${al}${plus ? '+' : '-'}1=0$ 이고, 상수항이 $0$ 이 아니므로 $${al}\\ne0$`,
    `양변을 $${al}$ 로 나누면 $${al}-${p}${plus ? '+' : '-'}${inv(1)}=0$, 곧 $${al}${plus ? '+' : '-'}${inv(1)}=${p}$`,
    `$\\left(${al}${plus ? '+' : '-'}${inv(1)}\\right)^2=${al}^2${plus ? '+' : '-'}2+${inv(2)}$ 이므로 $${al}^2+${inv(2)}=${p}^2${plus ? '-' : '+'}2=${s2}$`,
  ];
  let expr: string, val: number;
  const steps = [...head];
  if (v === 0) {
    expr = `${al}^2+${inv(2)}`;
    val = s2;
  } else if (v === 1) {
    expr = `${al}^3+${inv(3)}`;
    val = p ** 3 - 3 * p;
    steps.push(`$\\left(${al}+${inv(1)}\\right)\\left(${al}^2+${inv(2)}\\right)=${al}^3+${inv(3)}+${al}+${inv(1)}$`, `$${p}\\times${s2}=${al}^3+${inv(3)}+${p}$ 이므로 $${al}^3+${inv(3)}=${p * s2}-${p}=${val}$`);
  } else if (v === 2) {
    expr = `${al}^4+${inv(4)}`;
    val = s2 * s2 - 2;
    steps.push(`$\\left(${al}^2+${inv(2)}\\right)^2=${al}^4+2+${inv(4)}$`, `$${al}^4+${inv(4)}=${s2}^2-2=${val}$`);
  } else {
    expr = `${al}^2+${al}+${inv(1)}+${inv(2)}`;
    val = s2 + p;
    steps.push(`$${expr}=\\left(${al}^2+${inv(2)}\\right)+\\left(${al}+${inv(1)}\\right)=${s2}+${p}=${val}$`);
  }
  return {
    q: `이차방정식 $x^2-${p}x${plus ? '+' : '-'}1=0$ 의 한 근을 $${al}$ 라 할 때, $${expr}$ 의 값을 구하세요.`,
    answer: { type: 'num' as const, value: val },
    steps,
  };
}

function parabolaRect(r: Rng) {
  const kk = r.pick([fr(1), fr(2), fr(1, 2)]);
  const square = r.chance(0.6);
  const t = kk.d === 2 ? 2 * r.int(1, 3) : r.int(1, 4);
  const h = square ? 2 * t : t;
  const c = kk.mul(t * t).add(h);
  const p = r.int(-3, 3);
  const sq = p === 0 ? 'x^2' : `${fac(1, -p)}^2`;
  const fx = termsTex([
    { c: kk.neg(), v: sq },
    { c, v: '' },
  ]);
  const area = 2 * t * h;
  const m = square ? 2 : 1;
  const pp = p === 0 ? 't' : `${p}+t`,
    pm = p === 0 ? '-t' : `${p}-t`;
  // k t^2 + m t - c = 0
  const eq = termsTex([
    { c: kk, v: 't^2' },
    { c: m, v: 't' },
    { c: c.neg(), v: '' },
  ]);
  return {
    q: `이차함수 $y=${fx}$ 의 그래프와 $x$ 축으로 둘러싸인 부분에 ${square ? '정사각형' : '가로의 길이가 세로의 길이의 $2$ 배인 직사각형'} $ABCD$ 가 있다. 두 꼭짓점 $A$, $D$ 는 그래프 위에, 두 꼭짓점 $B$, $C$ 는 $x$ 축 위에 있을 때, $\\square ABCD$ 의 넓이를 구하세요.`,
    answer: { type: 'num' as const, value: area },
    steps: [
      `그래프는 직선 $x=${p}$ 에 대하여 대칭이므로 $B(${pm},\\,0)$, $C(${pp},\\,0)$ ($t>0$) 로 놓으면 가로의 길이는 $2t$`,
      square ? `정사각형이므로 세로의 길이도 $2t$, 곧 $D(${pp},\\,2t)$` : `세로의 길이는 $t$, 곧 $D(${pp},\\,t)$`,
      `$D$ 가 그래프 위에 있으므로 $${square ? '2t' : 't'}=${termsTex([{ c: kk.neg(), v: 't^2' }, { c, v: '' }])}$`,
      `$${eq}=0$ 에서 $t>0$ 인 근은 $t=${t}$`,
      `가로 $${2 * t}$, 세로 $${h}$ 이므로 넓이는 $${2 * t}\\times${h}=${area}$`,
    ],
  };
}

function vertexOnLine(r: Rng) {
  for (;;) {
    const a1 = r.int(-5, 5),
      a2 = r.int(-5, 5);
    if (a1 >= a2) continue;
    const u = r.int(-2, 3);
    const m = 2 * u - (a1 + a2);
    if (Math.abs(m) > 4 || m === 0) continue;
    const n = r.int(-5, 5);
    const v = u * u + n - a1 * a2;
    const line = linTex(m, n);
    return {
      q: `이차함수 $y=x^2-2ax+b$ 의 그래프의 꼭짓점이 직선 $y=${line}$ 위에 있고, 그래프가 점 $(${u},\\,${v})$ ${jo(String(v), '을', '를')} 지날 때, 상수 $a$ 의 값을 모두 구하세요.`,
      answer: { type: 'set' as const, values: [a1, a2] },
      steps: [
        '$y=(x-a)^2+b-a^2$ 이므로 꼭짓점은 $(a,\\ b-a^2)$',
        `꼭짓점이 직선 위에 있으므로 $b-a^2=${linTex(m, n, 'a')}$, 곧 $b=${poly([1, m, n], 'a')}$`,
        `점 $(${u},\\,${v})$ ${jo(String(v), '을', '를')} 지나므로 $${u === 0 ? 'b' : `${u * u}${sgn(-2 * u)}a+b`}=${v}$`,
        `$b$ 를 대입하면 $${poly([1, m - 2 * u, u * u + n - v], 'a')}=0$`,
        `$${fac(1, -a1, 'a')}${fac(1, -a2, 'a')}=0$ 에서 $a=${a1}$ 또는 $a=${a2}$`,
      ],
    };
  }
}

export const M3A_TOP: Record<string, Skill[]> = {
  'm3a-1': [
    { id: 'top-sqrt-two-cond', title: '두 근호가 동시에 자연수가 되는 조건', gen: (r) => sqrtTwoCond(r) },
    { id: 'top-sqrt-abs', title: '부호 조건으로 근호 벗기기', gen: (r) => sqrtAbs(r) },
  ],
  'm3a-2': [
    { id: 'top-telescoping-surd', title: '분모의 유리화로 이어진 합 구하기', gen: (r) => telescoping(r) },
    { id: 'top-surd-decimal-part', title: '유리화한 수의 정수 부분과 소수 부분', gen: (r) => surdDecimal(r) },
  ],
  'm3a-3': [
    { id: 'top-factor-number-trick', title: '곱셈 공식·인수분해를 이용한 수의 계산', gen: (r) => factorTrick(r) },
    { id: 'top-factor-integer-pairs', title: '인수분해로 정수해의 개수 구하기', gen: (r) => intPairs(r) },
  ],
  'm3a-4': [
    { id: 'top-integer-roots-param', title: '두 근이 모두 정수가 되는 조건', gen: (r) => intRootsParam(r) },
    { id: 'top-root-reciprocal', title: '한 근을 이용한 식의 값 (양변을 근으로 나누기)', gen: (r) => rootReciprocal(r) },
  ],
  'm3a-5': [
    { id: 'top-parabola-rect', title: '포물선에 내접하는 정사각형·직사각형', gen: (r) => parabolaRect(r) },
    { id: 'top-vertex-on-line', title: '꼭짓점이 직선 위에 있을 조건', gen: (r) => vertexOnLine(r) },
  ],
};

