// 대수 (alg-1 ~ alg-7)
import type { ContentMap, ProblemDraft } from '../../core/types';
import { F } from '../../core/frac';
import { divisors, gcd, simplifySqrt, range } from '../../core/nt';
import { poly, sqrtTex, termsTex } from '../../core/tex';
import { L, NAMES, cv, deg, josa, texJosa, piTex, radTex, radian, tch, wch } from './util';
import { ALG_WORD } from './word-alg';
import { ALG_HARD } from './hard-alg';

// ───────────── 삼각함수 특수각 ─────────────
const S2 = Math.SQRT2 / 2,
  S3 = Math.sqrt(3) / 2;
const TRIG_VALUES: [string, number][] = [
  ['0', 0],
  ['\\frac{1}{2}', 0.5],
  ['\\frac{\\sqrt{2}}{2}', S2],
  ['\\frac{\\sqrt{3}}{2}', S3],
  ['1', 1],
  ['\\sqrt{3}', Math.sqrt(3)],
  ['\\frac{\\sqrt{3}}{3}', Math.sqrt(3) / 3],
].flatMap(([t, v]) => (v === 0 ? [[t, v]] : [[t, v], ['-' + t, -v]])) as [string, number][];

type TF = 'sin' | 'cos' | 'tan';
function trigNum(fn: TF, d: number): number {
  const x = (d * Math.PI) / 180;
  return fn === 'sin' ? Math.sin(x) : fn === 'cos' ? Math.cos(x) : Math.tan(x);
}
/** 특수각 값 TeX (tan 90° 등 정의 안 되면 null) */
function trigTex(fn: TF, d: number): string | null {
  const v = trigNum(fn, d);
  if (!Number.isFinite(v) || Math.abs(v) > 1e6) return null;
  const hit = TRIG_VALUES.find(([, w]) => Math.abs(w - v) < 1e-9);
  return hit ? hit[0] : null;
}
const SPECIAL = range(0, 23)
  .map((i) => i * 15)
  .filter((d) => d % 30 === 0 || d % 45 === 0);

/** 사인값: [유리계수, 근호안] */
const SINV: Record<number, [F, number]> = {
  30: [new F(1, 2), 1],
  45: [new F(1, 2), 2],
  60: [new F(1, 2), 3],
  90: [new F(1), 1],
  120: [new F(1, 2), 3],
  135: [new F(1, 2), 2],
  150: [new F(1, 2), 1],
};
const sinTex = (A: number) => {
  const [c, i] = SINV[A];
  return radTex(c, i);
};

/** 계수 c 곱하기 √i 를 TeX 로 (i 는 정리) */
function surd(c: F, n: number): string {
  const [o, i] = simplifySqrt(n);
  return radTex(c.mul(o), i);
}

const sig = (lo: number | string, hi: number | string, body: string) => `\\sum_{k=${lo}}^{${hi}}${body}`;
const sumK = (n: number) => (n * (n + 1)) / 2;
const sumK2 = (n: number) => (n * (n + 1) * (2 * n + 1)) / 6;
const sumK3 = (n: number) => sumK(n) ** 2;

const QUAD = ['제1사분면', '제2사분면', '제3사분면', '제4사분면'];
const QRANGE = ['0<\\theta<\\frac{\\pi}{2}', '\\frac{\\pi}{2}<\\theta<\\pi', '\\pi<\\theta<\\frac{3}{2}\\pi', '\\frac{3}{2}\\pi<\\theta<2\\pi'];

function powTex(b: number, e: number): string {
  return e >= 0 ? String(b ** e) : `\\frac{1}{${b ** -e}}`;
}

export const alg: ContentMap = {
  // ───────────────────────── alg-1 지수와 로그
  'alg-1': {
    concepts: [
      {
        title: '거듭제곱근',
        body: '$x^{n}=a$ 를 만족시키는 $x$ 를 $a$ 의 $n$ 제곱근이라 합니다. 실수인 것은\n- $n$ 이 홀수: 오직 하나 $\\sqrt[n]{a}$\n- $n$ 이 짝수: $a>0$ 이면 $\\pm\\sqrt[n]{a}$ 두 개, $a=0$ 이면 $0$, $a<0$ 이면 없음\n- 성질: $\\sqrt[n]{a}\\sqrt[n]{b}=\\sqrt[n]{ab}$, $\\sqrt[m]{\\sqrt[n]{a}}=\\sqrt[mn]{a}$',
      },
      {
        title: '지수의 확장',
        body: '중학교의 지수법칙을 정수·유리수·실수 지수로 넓힙니다 ($a>0$).\n- $a^{0}=1$, $a^{-n}=\\frac{1}{a^{n}}$, $a^{\\frac{m}{n}}=\\sqrt[n]{a^{m}}$\n- $a^{x}a^{y}=a^{x+y}$, $(a^{x})^{y}=a^{xy}$, $(ab)^{x}=a^{x}b^{x}$',
        example: { q: '$8^{\\frac{2}{3}}$ 의 값은?', a: '$(2^{3})^{\\frac{2}{3}}=2^{2}=4$' },
      },
      {
        title: '로그의 뜻',
        body: '$a>0, a\\ne1, N>0$ 일 때 $a^{x}=N\\iff x=\\log_{a}N$ ($a$: 밑, $N$: 진수).\n- $\\log_{a}1=0$, $\\log_{a}a=1$',
      },
      {
        title: '로그의 성질',
        body: '- $\\log_{a}MN=\\log_{a}M+\\log_{a}N$, $\\log_{a}\\frac{M}{N}=\\log_{a}M-\\log_{a}N$\n- $\\log_{a}M^{k}=k\\log_{a}M$, $\\log_{a^{m}}b^{n}=\\frac{n}{m}\\log_{a}b$\n- 밑변환: $\\log_{a}b=\\frac{\\log_{c}b}{\\log_{c}a}$, 특히 $\\log_{a}b\\times\\log_{b}c=\\log_{a}c$',
      },
      {
        title: '상용로그',
        body: '밑이 $10$ 인 로그 $\\log N$.\n- $\\log(a\\times10^{n})=n+\\log a$ ($1\\le a<10$)\n- $N$ 이 $k$ 자리 정수 $\\iff k-1\\le\\log N<k$',
        example: { q: '$\\log 2=0.3010$ 일 때 $2^{10}$ 은 몇 자리 수?', a: '$10\\log2=3.010$ 이므로 4자리' },
      },
    ],
    skills: [
      {
        id: 'nth-root',
        title: '거듭제곱근 계산',
        gen(r, level): ProblemDraft {
          if (level === 1) {
            const n = r.pick([3, 4, 5, 3]);
            const b = n % 2 ? r.nonzero(-4, 4) * (r.chance(0.5) ? 1 : 1) : r.int(2, 4);
            const bb = n === 5 ? (b > 0 ? 2 : -2) * (Math.abs(b) > 2 ? 1 : 1) : b;
            return {
              q: `$\\sqrt[${n}]{${bb ** n}}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: bb },
              steps: [`$${bb ** n}=${bb < 0 ? `(${bb})` : bb}^{${n}}$ 이므로 $\\sqrt[${n}]{${bb ** n}}=${bb}$`],
            };
          }
          if (level === 2) {
            const t = r.int(2, 4);
            if (r.chance(0.5)) {
              const n = r.pick([3, 4]);
              const N = t ** n;
              const ds = divisors(N).filter((d) => d > 1 && d < N && !Number.isInteger(Math.round(d ** (1 / n) * 1e9) / 1e9));
              const a = r.pick(ds.length ? ds : [t]);
              const c = N / a;
              return {
                q: `$\\sqrt[${n}]{${a}}\\times\\sqrt[${n}]{${c}}$ 의 값을 구하세요.`,
                answer: { type: 'num', value: t },
                steps: [`$\\sqrt[${n}]{${a}}\\times\\sqrt[${n}]{${c}}=\\sqrt[${n}]{${N}}=\\sqrt[${n}]{${t}^{${n}}}=${t}$`],
              };
            }
            const [m, n] = r.pick([
              [2, 3],
              [3, 2],
              [2, 2],
            ]);
            const N = t ** (m * n);
            if (N > 5000) {
              return {
                q: `$\\sqrt{\\sqrt[3]{64}}$ 의 값을 구하세요.`,
                answer: { type: 'num', value: 2 },
                steps: [`$\\sqrt{\\sqrt[3]{64}}=\\sqrt[6]{2^{6}}=2$`],
              };
            }
            const outer = m === 2 ? '\\sqrt' : `\\sqrt[${m}]`;
            const inner = n === 2 ? '\\sqrt' : `\\sqrt[${n}]`;
            return {
              q: `$${outer}{${inner}{${N}}}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: t },
              steps: [`$${outer}{${inner}{a}}=\\sqrt[${m * n}]{a}$`, `$\\sqrt[${m * n}]{${N}}=\\sqrt[${m * n}]{${t}^{${m * n}}}=${t}$`],
            };
          }
          const cnt = (a: number, n: number) => (n % 2 ? 1 : a > 0 ? 2 : a === 0 ? 1 : 0);
          const items = r.sample(
            [
              [r.int(2, 30), 2],
              [-r.int(2, 30), 2],
              [-r.int(2, 30), 3],
              [r.int(2, 30), 4],
              [-r.int(2, 30), 4],
              [r.int(2, 30), 5],
              [-r.int(2, 30), 6],
            ] as [number, number][],
            3,
          );
          const total = items.reduce((s, [a, n]) => s + cnt(a, n), 0);
          return {
            q: `다음 각각에서 실수인 것의 개수를 구하여 모두 더한 값을 구하세요.\n${items.map(([a, n]) => `$${a}$ 의 ${n === 2 ? '제곱근' : n + '제곱근'}`).join(', ')}`,
            answer: { type: 'num', value: total },
            steps: [...items.map(([a, n]) => `$${a}$ 의 $${n}$ 제곱근 중 실수: $${cnt(a, n)}$ 개 (${n % 2 ? '홀수 제곱근은 1개' : a > 0 ? '짝수, 양수 → 2개' : '짝수, 음수 → 없음'})`), `합: $${total}$`],
          };
        },
      },
      {
        id: 'exponent-calc',
        title: '지수법칙 계산',
        gen(r, level) {
          if (level === 1) {
            const b = r.pick([2, 3, 5]);
            const e = b === 5 ? r.int(-2, 2) : r.int(-2, 4);
            const p = r.int(-4, 6);
            const s = r.int(-3, 4);
            const q = e - p + s;
            const v = new F(b).pow(e);
            return {
              q: `$${b}^{${p}}\\times ${b}^{${q}}\\div ${b}^{${s}}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v.value, display: 'frac' },
              steps: [`지수끼리 계산: $${b}^{${p}+${q < 0 ? `(${q})` : q}-${s < 0 ? `(${s})` : s}}=${b}^{${e}}$`, `$=${v.tex()}$`],
            };
          }
          if (level === 2) {
            const b = r.pick([2, 3]);
            const k1 = r.int(2, 3),
              k2 = r.int(2, 3);
            let m1 = r.nonzero(-3, 3),
              m2 = r.nonzero(-3, 3);
            if (b === 3 && Math.abs(m1 + m2) > 3) m2 = -m2;
            if (m1 % k1 === 0) m1 = m1 > 0 ? m1 - 1 || 1 : m1 + 1 || -1;
            const e1 = new F(m1, k1),
              e2 = new F(m2, k2);
            const tot = m1 + m2;
            const v = new F(b).pow(tot);
            return {
              q: `$${b ** k1}^{${e1.tex()}}\\times ${b ** k2}^{${e2.tex()}}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v.value, display: 'frac' },
              steps: [`$${b ** k1}=${b}^{${k1}}$, $${b ** k2}=${b}^{${k2}}$`, `$${b}^{${k1}\\times ${e1.tex()}}\\times ${b}^{${k2}\\times ${e2.tex()}}=${b}^{${m1}}\\times ${b}^{${m2}}=${b}^{${tot}}$`, `$=${v.tex()}$`],
            };
          }
          const k = r.int(2, 6);
          const kind = r.int(0, 2);
          if (kind === 0) {
            return {
              q: `$x>0$ 이고 $x^{\\frac{1}{2}}+x^{-\\frac{1}{2}}=${k}$ 일 때, $x+x^{-1}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: k * k - 2 },
              steps: [`양변을 제곱: $x+2+x^{-1}=${k * k}$`, `$x+x^{-1}=${k * k - 2}$`],
            };
          }
          if (kind === 1) {
            return {
              q: `$x>0$ 이고 $x^{\\frac{1}{2}}-x^{-\\frac{1}{2}}=${k}$ 일 때, $x+x^{-1}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: k * k + 2 },
              steps: [`양변을 제곱: $x-2+x^{-1}=${k * k}$`, `$x+x^{-1}=${k * k + 2}$`],
            };
          }
          const m = k + 1;
          return {
            q: `$x>0$ 이고 $x+x^{-1}=${m * m - 2}$ 일 때, $x^{\\frac{1}{2}}+x^{-\\frac{1}{2}}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: m },
            steps: [`$(x^{\\frac{1}{2}}+x^{-\\frac{1}{2}})^{2}=x+2+x^{-1}=${m * m}$`, `양수이므로 $x^{\\frac{1}{2}}+x^{-\\frac{1}{2}}=${m}$`],
          };
        },
      },
      {
        id: 'log-calc',
        title: '로그의 값 계산',
        gen(r, level) {
          if (level === 1) {
            const b = r.pick([2, 3, 5, 10]);
            const k = b === 2 ? r.int(-3, 6) : b === 10 ? r.int(-3, 4) : r.int(-2, 4);
            return {
              q: `$\\log_{${b}}${powTex(b, k)}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: k },
              steps: [`$${powTex(b, k)}=${b}^{${k}}$`, `$\\log_{${b}}${b}^{${k}}=${k}$`],
            };
          }
          if (level === 2) {
            const b = r.pick([2, 3, 2]);
            const k = r.int(1, 4);
            const z = r.pick([3, 5, 6, 7, 2, 10].filter((x) => x !== b));
            const N = b ** k * z;
            const ds = divisors(N).filter((d) => d > 1 && d < N && d !== z && N / d !== z && d !== b && N / d !== b);
            const x = r.pick(ds.length ? ds : divisors(N).filter((d) => d > 1 && d < N));
            const y = N / x;
            return {
              q: `$\\log_{${b}}${x}+\\log_{${b}}${y}-\\log_{${b}}${z}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: k },
              steps: [`$\\log_{${b}}\\frac{${x}\\times ${y}}{${z}}=\\log_{${b}}${b ** k}$`, `$=${k}$`],
            };
          }
          if (r.chance(0.5)) {
            const b = r.pick([2, 3]);
            const m = r.int(2, 3),
              n = r.nonzero(-4, 5);
            const sqrtBase = r.chance(0.3);
            const base = sqrtBase ? `\\sqrt{${b}}` : String(b ** m);
            const mm = sqrtBase ? new F(1, 2) : new F(m);
            const v = new F(n).div(mm);
            return {
              q: `$\\log_{${base}}${powTex(b, n)}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v.value, display: 'frac' },
              steps: [`밑 $${base}=${b}^{${mm.tex()}}$, 진수 $${powTex(b, n)}=${b}^{${n}}$`, `$\\log_{a^{m}}b^{n}=\\frac{n}{m}\\log_{a}b$ 이므로 $\\frac{${n}}{${mm.tex()}}=${v.tex()}$`],
            };
          }
          const [p, q] = r.sample([2, 3, 5, 7], 2);
          const k = r.int(2, 4);
          return {
            q: `$\\log_{${p}}${q}\\times\\log_{${q}}${p ** k}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: k },
            steps: [`밑변환: $\\frac{\\log ${q}}{\\log ${p}}\\times\\frac{\\log ${p ** k}}{\\log ${q}}=\\frac{${k}\\log ${p}}{\\log ${p}}$`, `$=${k}$`],
          };
        },
      },
      {
        id: 'log-letters',
        title: '로그를 문자로 나타내기',
        gen(r, level) {
          const lt = (ca: number, cb: number, c0: number) => termsTex([{ c: ca, v: 'a' }, { c: cb, v: 'b' }, { c: c0, v: '' }]);
          if (level < 3) {
            let i: number, j: number, k: number;
            do {
              i = r.int(0, 3);
              j = r.int(0, 2);
              k = level === 2 ? r.int(0, 2) : 0;
            } while (2 ** i * 3 ** j * 5 ** k < 4 || (level === 2 && k === 0));
            const N = 2 ** i * 3 ** j * 5 ** k;
            const right = lt(i - k, j, k);
            return {
              q: `$\\log 2=a$, $\\log 3=b$ 일 때, $\\log ${N}$ ${texJosa(String(N), '을', '를')} $a, b$ 로 나타낸 것은?`,
              answer: tch(r, right, [lt(j, i - k, k), lt(i + k, j, k), lt(i - k, j, -k), lt(i, j, 0), lt(i - k, j + 1, k), lt(i - k, j, k + 1), lt(j - k, i, k)].filter((w) => w !== '0')),
              steps: [
                `$${N}=${[i ? `2^{${i}}` : '', j ? `3^{${j}}` : '', k ? `5^{${k}}` : ''].filter(Boolean).join('\\times ')}$${k ? ', $\\log 5=\\log\\frac{10}{2}=1-a$' : ''}`,
                `$\\log ${N}=${right}$`,
              ],
            };
          }
          let p: number, q: number, i: number, j: number;
          do {
            p = r.int(0, 2);
            q = r.int(0, 2);
            i = r.int(0, 3);
            j = r.int(0, 2);
          } while (p + q === 0 || i + j === 0 || (p === i && q === j) || i * q === j * p);
          const B = 2 ** p * 3 ** q,
            N = 2 ** i * 3 ** j;
          const fr = (x: string, y: string) => `\\frac{${x}}{${y}}`;
          const right = fr(lt(i, j, 0), lt(p, q, 0));
          return {
            q: `$\\log 2=a$, $\\log 3=b$ 일 때, $\\log_{${B}}${N}$ ${texJosa(String(N), '을', '를')} $a, b$ 로 나타낸 것은?`,
            answer: tch(r, right, [fr(lt(p, q, 0), lt(i, j, 0)), lt(i - p, j - q, 0), fr(lt(j, i, 0), lt(q, p, 0)), fr(lt(i, j, 0), lt(p, q, 1)), `(${lt(i, j, 0)})(${lt(p, q, 0)})`]),
            steps: [`밑변환: $\\log_{${B}}${N}=\\frac{\\log ${N}}{\\log ${B}}$`, `$\\log ${N}=${lt(i, j, 0)}$, $\\log ${B}=${lt(p, q, 0)}$`, `$${right}$`],
          };
        },
      },
      {
        id: 'common-log',
        title: '상용로그의 활용',
        gen(r, level) {
          if (level === 1) {
            let i: number, j: number;
            do {
              i = r.int(0, 2);
              j = r.int(0, 1);
            } while (i + j === 0);
            const n = r.int(-2, 3);
            const a = 2 ** i * 3 ** j;
            const units = i * 3010 + j * 4771 + n * 10000;
            const val = units / 10000;
            const N = n >= 0 ? String(a * 10 ** n) : String(a / 10 ** -n);
            return {
              q: `$\\log 2=0.3010$, $\\log 3=0.4771$ 일 때, $\\log ${N}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: val, display: 'dec' },
              steps: [`$${N}=${a}\\times10^{${n}}$`, `$\\log ${N}=${n}+\\log ${a}=${n}+${(i * 3010 + j * 4771) / 10000}=${val}$`],
            };
          }
          const pick = () => {
            for (;;) {
              const b = r.pick([2, 3, 6]);
              const lg = b === 2 ? 3010 : b === 3 ? 4771 : 7781;
              const n = r.int(10, 60);
              const approx = (n * lg) / 10000;
              const real = n * Math.log10(b);
              if (Math.floor(approx) === Math.floor(real) && Math.abs(approx - Math.round(approx)) > 0.002) return { b, lg, n, approx };
            }
          };
          const { b, lg, n, approx } = pick();
          const lgT = `\\log ${b}=${(lg / 10000).toFixed(4)}`;
          const given = b === 6 ? '$\\log 2=0.3010$, $\\log 3=0.4771$' : `$${lgT}$`;
          if (level === 2) {
            return {
              q: `${given} 일 때, $${b}^{${n}}$ 은 몇 자리 정수인가요?`,
              answer: { type: 'num', value: Math.floor(approx) + 1, unit: '자리' },
              steps: [...(b === 6 ? [`$\\log 6=\\log2+\\log3=0.7781$`] : []), `$\\log ${b}^{${n}}=${n}\\times${(lg / 10000).toFixed(4)}=${approx}$`, `$${Math.floor(approx)}\\le\\log ${b}^{${n}}<${Math.floor(approx) + 1}$ 이므로 $${Math.floor(approx) + 1}$ 자리`],
            };
          }
          const pos = Math.floor(approx) + 1;
          return {
            q: `${given} 일 때, $\\left(\\frac{1}{${b}}\\right)^{${n}}$ 은 소수점 아래 몇째 자리에서 처음으로 $0$ 이 아닌 숫자가 나타나나요?`,
            answer: { type: 'num', value: pos, unit: '째 자리' },
            steps: [...(b === 6 ? [`$\\log 6=0.7781$`] : []), `$\\log\\left(\\frac{1}{${b}}\\right)^{${n}}=-${approx}=-${pos}+${(pos - approx).toFixed(4).replace(/0+$/, '')}$`, `정수 부분이 $-${pos}$ 이므로 소수점 아래 $${pos}$ 째 자리`],
          };
        },
      },
    ],
  },

  // ───────────────────────── alg-2 지수함수와 로그함수
  'alg-2': {
    concepts: [
      {
        title: '지수함수 $y=a^{x}$',
        body: '$a>0, a\\ne1$ 일 때\n- 정의역: 실수 전체, 치역: $\\{y\\mid y>0\\}$\n- 점 $(0, 1)$ 을 지나고 점근선은 $x$ 축 ($y=0$)\n- $a>1$ 이면 증가, $0<a<1$ 이면 감소\n- $y=a^{x-m}+n$: 평행이동, 점근선 $y=n$',
      },
      {
        title: '로그함수 $y=\\log_{a}x$',
        body: '지수함수 $y=a^{x}$ 의 **역함수** (그래프는 $y=x$ 대칭).\n- 정의역: $\\{x\\mid x>0\\}$, 치역: 실수 전체\n- 점 $(1, 0)$ 을 지나고 점근선은 $y$ 축 ($x=0$)\n- $y=\\log_{a}(x-m)+n$: 점근선 $x=m$',
      },
      {
        title: '지수방정식과 부등식',
        body: '- 밑을 같게: $a^{f(x)}=a^{g(x)}\\iff f(x)=g(x)$\n- $a^{x}=t\\,(t>0)$ 로 치환하면 이차방정식\n- 부등식: $a>1$ 이면 부등호 그대로, $0<a<1$ 이면 **부등호 방향이 바뀜**',
        example: { q: '$4^{x}=8^{x-1}$ 의 해는?', a: '$2^{2x}=2^{3x-3}$ → $x=3$' },
      },
      {
        title: '로그방정식과 부등식',
        body: '- $\\log_{a}f(x)=\\log_{a}g(x)\\iff f(x)=g(x)$ (단, 진수 $>0$)\n- 반드시 **진수 조건**을 확인해 해를 걸러냄\n- $\\log_{a}x=t$ 로 치환하기도 함',
      },
    ],
    skills: [
      {
        id: 'exp-equation',
        title: '지수방정식',
        gen(r, level) {
          if (level === 1) {
            const b = r.pick([2, 3, 5]);
            const m = b === 5 ? r.int(1, 4) : r.int(1, 6);
            const c = r.int(-4, 4);
            return {
              q: `방정식 $${b}^{${poly([1, c])}}=${b ** m}$ 의 해를 구하세요.`,
              answer: { type: 'num', value: m - c },
              steps: [`$${b ** m}=${b}^{${m}}$ 이므로 $${poly([1, c])}=${m}$`, `$x=${m - c}$`],
            };
          }
          if (level === 2) {
            for (;;) {
              const b = r.pick([2, 3]);
              const [p, q] = r.sample(b === 2 ? [1, 2, 3] : [1, 2], 2);
              const x = r.int(-3, 5),
                c1 = r.int(-3, 3);
              const t = p * (x + c1);
              if (t % q !== 0) continue;
              const c2 = t / q - x;
              const B1 = b ** p,
                B2 = b ** q;
              return {
                q: `방정식 $${B1}^{${poly([1, c1])}}=${B2}^{${poly([1, c2])}}$ 의 해를 구하세요.`,
                answer: { type: 'num', value: x },
                steps: [`밑을 $${b}$ 로: $${b}^{${p === 1 ? '' : p}(${poly([1, c1])})}=${b}^{${q === 1 ? '' : q}(${poly([1, c2])})}$`, `$${poly([p, p * c1])}=${poly([q, q * c2])}$`, `$x=${x}$`],
              };
            }
          }
          const b = r.pick([2, 3]);
          const m1 = r.int(0, b === 2 ? 3 : 2);
          const t1 = b ** m1;
          const coef = (c: number) => (c === 0 ? '' : c === 1 ? '+' : c === -1 ? '-' : `${c > 0 ? '+' : '-'}${Math.abs(c)}\\cdot `);
          if (r.chance(0.4)) {
            const k = r.int(1, 6);
            // (t - t1)(t + k) = t^2 + (k - t1) t - k t1
            const c = k - t1;
            const eq = `${b * b}^{x}${coef(c)}${c === 0 ? '' : `${b}^{x}`}-${k * t1}=0`;
            return {
              q: `방정식 $${eq}$ 의 해를 모두 구하세요.`,
              answer: { type: 'set', values: [m1] },
              steps: [`$${b}^{x}=t\\,(t>0)$ 로 놓으면 $${poly([1, c, -k * t1], 't')}=0$`, `$(${poly([1, -t1], 't')})(${poly([1, k], 't')})=0$, $t>0$ 이므로 $t=${t1}$`, `$${b}^{x}=${t1}$, $x=${m1}$`],
            };
          }
          let m2 = r.int(0, b === 2 ? 4 : 3);
          if (m2 === m1) m2 = m1 + 1;
          const t2 = b ** m2;
          const c = -(t1 + t2);
          return {
            q: `방정식 $${b * b}^{x}${coef(c)}${b}^{x}+${t1 * t2}=0$ 의 해를 모두 구하세요.`,
            answer: { type: 'set', values: [m1, m2] },
            steps: [`$${b}^{x}=t\\,(t>0)$ 로 놓으면 $${poly([1, c, t1 * t2], 't')}=0$`, `$(t-${t1})(t-${t2})=0$, $t=${t1}$ 또는 $t=${t2}$`, `$x=${m1}$ 또는 $x=${m2}$`],
          };
        },
      },
      {
        id: 'log-equation',
        title: '로그방정식',
        gen(r, level) {
          if (level === 1) {
            const b = r.pick([2, 3, 5]);
            const k = b === 5 ? r.int(0, 3) : r.int(0, 5);
            const c = r.int(-5, 5);
            return {
              q: `방정식 $\\log_{${b}}${c === 0 ? 'x' : `(${poly([1, c])})`}=${k}$ 의 해를 구하세요.`,
              answer: { type: 'num', value: b ** k - c },
              steps: [`$${poly([1, c])}=${b}^{${k}}=${b ** k}$`, `$x=${b ** k - c}$ (진수 $${b ** k}>0$ 확인)`],
            };
          }
          if (level === 2) {
            for (;;) {
              const b = r.pick([2, 3]);
              const k = r.int(2, b === 2 ? 5 : 3);
              const P = b ** k;
              const rr = r.pick(divisors(P).filter((d) => d * d > P));
              const c = rr - P / rr;
              if (c <= 0) continue;
              return {
                q: `방정식 $\\log_{${b}}x+\\log_{${b}}(x-${c})=${k}$ 의 해를 구하세요.`,
                answer: { type: 'num', value: rr },
                steps: [`진수 조건: $x>${c}$`, `$\\log_{${b}}x(x-${c})=${k}$ → $x^{2}-${c}x-${P}=0$`, `$(x-${rr})(x+${P / rr})=0$, 진수 조건에서 $x=${rr}$`],
                hint: '진수 조건을 먼저 확인하세요.',
              };
            }
          }
          const b = r.pick([2, 3]);
          const [m1, m2] = r.sample([-2, -1, 1, 2, 3, 0], 2);
          const v = (m: number) => new F(b).pow(m).value;
          return {
            q: `방정식 $(\\log_{${b}}x)^{2}${termsTex([{ c: -(m1 + m2), v: `\\log_{${b}}x` }, { c: m1 * m2, v: '' }]).replace(/^(?!-)/, '+').replace(/^\+0$/, '')}=0$ 의 해를 모두 구하세요.`.replace('+\\log', '+\\log'),
            answer: { type: 'set', values: [v(m1), v(m2)] },
            steps: [`$\\log_{${b}}x=t$ 로 놓으면 $${poly([1, -(m1 + m2), m1 * m2], 't')}=0$`, `$t=${m1}$ 또는 $t=${m2}$`, `$x=${b}^{${m1}}=${new F(b).pow(m1).tex()}$ 또는 $x=${b}^{${m2}}=${new F(b).pow(m2).tex()}$`],
          };
        },
      },
      {
        id: 'exp-log-inequality',
        title: '지수·로그부등식',
        gen(r, level) {
          if (level === 1) {
            const b = r.pick([2, 3]);
            const k = b === 2 ? r.int(2, 7) : r.int(2, 5);
            const strict = r.chance(0.5);
            const cnt = strict ? k - 1 : k;
            return {
              q: `부등식 $${b}^{x}${strict ? '<' : '\\le'}${b ** k}$ 을 만족시키는 자연수 $x$ 의 개수를 구하세요.`,
              answer: { type: 'num', value: cnt, unit: '개' },
              steps: [`$${b}^{x}${strict ? '<' : '\\le'}${b}^{${k}}$, 밑 $${b}>1$ 이므로 $x${strict ? '<' : '\\le'}${k}$`, `자연수 $x$: $${cnt}$ 개`],
            };
          }
          if (level === 2) {
            const b = r.pick([2, 3]);
            const k = r.int(1, b === 2 ? 5 : 3),
              c = r.int(0, 4);
            return {
              q: `부등식 $\\left(\\frac{1}{${b}}\\right)^{${poly([1, -c])}}\\ge\\frac{1}{${b ** k}}$ 을 만족시키는 자연수 $x$ 의 개수를 구하세요.`,
              answer: { type: 'num', value: k + c, unit: '개' },
              steps: [`$\\left(\\frac{1}{${b}}\\right)^{${poly([1, -c])}}\\ge\\left(\\frac{1}{${b}}\\right)^{${k}}$`, `밑이 $1$ 보다 작으므로 부등호 방향이 바뀜: $${poly([1, -c])}\\le ${k}$${c === 0 ? '' : `, $x\\le ${k + c}$`}`, `자연수 $x$: $${k + c}$ 개`],
            };
          }
          const b = r.pick([2, 3]);
          const k = r.int(1, b === 2 ? 4 : 2),
            a = r.int(-3, 5);
          const strict = r.chance(0.5);
          const flip = r.chance(0.5);
          const cnt = b ** k - (strict ? 1 : 0);
          const lhs = flip ? `\\log_{\\frac{1}{${b}}}(${poly([1, -a])})${strict ? '>' : '\\ge'}-${k}` : `\\log_{${b}}(${poly([1, -a])})${strict ? '<' : '\\le'}${k}`;
          return {
            q: `부등식 $${lhs}$ 를 만족시키는 정수 $x$ 의 개수를 구하세요.`,
            answer: { type: 'num', value: cnt, unit: '개' },
            steps: [`진수 조건: $x>${a}$`, flip ? `밑이 $1$ 보다 작으므로 $${poly([1, -a])}${strict ? '<' : '\\le'}\\left(\\frac{1}{${b}}\\right)^{-${k}}=${b ** k}$` : `$${poly([1, -a])}${strict ? '<' : '\\le'}${b}^{${k}}=${b ** k}$`, `$${a}<x${strict ? '<' : '\\le'}${a + b ** k}$ → 정수 $${cnt}$ 개`],
            hint: '진수 조건을 잊지 마세요.',
          };
        },
      },
      {
        id: 'graph-property',
        title: '지수·로그함수의 그래프',
        gen(r, level) {
          const b = r.pick([2, 3]);
          const p = r.int(-4, 4),
            q = r.int(-4, 4);
          const isLog = r.chance(0.5);
          const ex = (v: string) => `${b}^{${poly([1, -p], v)}}${q === 0 ? '' : (q > 0 ? '+' : '') + q}`;
          const lg = (v: string) => `\\log_{${b}}${p === 0 ? v : `(${poly([1, -p], v)})`}${q === 0 ? '' : (q > 0 ? '+' : '') + q}`;
          if (level === 1) {
            return {
              q: `함수 $y=${isLog ? lg('x') : ex('x')}$ 의 그래프의 점근선의 방정식이 $${isLog ? 'x' : 'y'}=k$ 일 때, $k$ 의 값을 구하세요.`,
              answer: { type: 'num', value: isLog ? p : q },
              steps: [isLog ? (p === 0 ? `$x$ 축 방향으로는 평행이동하지 않았으므로 $y=\\log_{${b}}x$ 의 점근선 $x=0$ 이 그대로 점근선` : `$y=\\log_{${b}}x$ 의 점근선 $x=0$ 을 $x$ 축 방향으로 $${p}$ 만큼 평행이동`) : q === 0 ? `$y$ 축 방향으로는 평행이동하지 않았으므로 $y=${b}^{x}$ 의 점근선 $y=0$ 이 그대로 점근선` : `$y=${b}^{x}$ 의 점근선 $y=0$ 을 $y$ 축 방향으로 $${q}$ 만큼 평행이동`, `점근선: $${isLog ? 'x' : 'y'}=${isLog ? p : q}$`],
            };
          }
          if (level === 2) {
            const m = r.int(0, 3);
            if (isLog) {
              const x0 = p + b ** m,
                y0 = m + q;
              return {
                q: `함수 $y=\\log_{${b}}${p === 0 ? 'x' : `(${poly([1, -p])})`}+k$ 의 그래프가 점 $(${x0}, ${y0})$ 을 지날 때, 상수 $k$ 의 값을 구하세요.`,
                answer: { type: 'num', value: q },
                steps: [`$${y0}=\\log_{${b}}${b ** m}+k=${m}+k$`, `$k=${q}$`],
              };
            }
            const x0 = p + m,
              y0 = b ** m + q;
            return {
              q: `함수 $y=${b}^{${poly([1, -p])}}+k$ 의 그래프가 점 $(${x0}, ${y0})$ 을 지날 때, 상수 $k$ 의 값을 구하세요.`,
              answer: { type: 'num', value: q },
              steps: [`$${y0}=${b}^{${m}}+k=${b ** m}+k$`, `$k=${q}$`],
            };
          }
          const dec = r.chance(0.5);
          const e1 = r.int(0, 2),
            e2 = e1 + r.int(1, 2);
          if (isLog) {
            const base = dec ? `\\frac{1}{${b}}` : String(b);
            const m = p + b ** e1,
              n = p + b ** e2;
            const v1 = (dec ? -e1 : e1) + q,
              v2 = (dec ? -e2 : e2) + q;
            return {
              q: `$${m}\\le x\\le ${n}$ 에서 함수 $y=\\log_{${base}}${p === 0 ? 'x' : `(${poly([1, -p])})`}${q === 0 ? '' : (q > 0 ? '+' : '') + q}$ 의 최댓값과 최솟값을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: '최댓값', value: Math.max(v1, v2) }, { label: '최솟값', value: Math.min(v1, v2) }] },
              steps: [`밑이 $${dec ? '1 보다 작으므로 감소' : '1 보다 크므로 증가'}$`.replace('$1 보다 작으므로 감소$', '1 보다 작으므로 감소함수').replace('$1 보다 크므로 증가$', '1 보다 크므로 증가함수'), `$x=${m}$ 일 때 $${v1}$, $x=${n}$ 일 때 $${v2}$`],
            };
          }
          const base = dec ? `\\left(\\frac{1}{${b}}\\right)` : String(b);
          const s = dec ? -1 : 1;
          const m = p + s * e1,
            n = p + s * e2;
          const lo = Math.min(m, n),
            hi = Math.max(m, n);
          const v = (x: number) => new F(b).pow(s * (x - p)).value + q;
          return {
            q: `$${lo}\\le x\\le ${hi}$ 에서 함수 $y=${base}^{${poly([1, -p])}}${q === 0 ? '' : (q > 0 ? '+' : '') + q}$ 의 최댓값과 최솟값을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: '최댓값', value: Math.max(v(lo), v(hi)) }, { label: '최솟값', value: Math.min(v(lo), v(hi)) }] },
            steps: [`밑이 ${dec ? '1 보다 작으므로 감소함수' : '1 보다 크므로 증가함수'}`, `$x=${lo}$ 일 때 $${v(lo)}$, $x=${hi}$ 일 때 $${v(hi)}$`],
          };
        },
      },
      {
        id: 'compare-size',
        title: '거듭제곱·로그의 대소 비교',
        gen(r, level) {
          const pool = L(level, [new F(1, 2), new F(1), new F(3, 2), new F(2), new F(-1), new F(5, 2), new F(0)], [new F(1, 3), new F(2, 3), new F(1, 2), new F(3, 4), new F(5, 6), new F(4, 3), new F(1)], [new F(1, 3), new F(2, 5), new F(1, 2), new F(3, 4), new F(-1, 2), new F(5, 6), new F(4, 3), new F(-2, 3)]);
          const es = r.sample(pool, 3);
          const forms = (e: F, k: number): string => {
            switch (k % 4) {
              case 0:
                return `2^{${e.tex()}}`;
              case 1:
                return `4^{${e.div(2).tex()}}`;
              case 2:
                if (e.d === 1) return `\\sqrt{2^{${2 * e.n}}}`;
                return `\\sqrt${e.d === 2 ? '' : `[${e.d}]`}{${e.n > 0 ? 2 ** e.n : `\\frac{1}{${2 ** -e.n}}`}}`;
              default:
                return `\\left(\\frac{1}{2}\\right)^{${e.neg().tex()}}`;
            }
          };
          const ks = r.sample([0, 1, 2, 3], 3);
          const names = ['A', 'B', 'C'];
          const texs = es.map((e, i) => forms(e, level === 1 ? [0, 1, 3][ks[i] % 3] : ks[i]));
          const order = [0, 1, 2].sort((x, y) => es[x].cmp(es[y]));
          const ord = (o: number[]) => `$${o.map((i) => names[i]).join('<')}$`;
          const perms = [
            [0, 1, 2],
            [0, 2, 1],
            [1, 0, 2],
            [1, 2, 0],
            [2, 0, 1],
            [2, 1, 0],
          ];
          return {
            q: `세 수 $A=${texs[0]}$, $B=${texs[1]}$, $C=${texs[2]}$ 의 대소 관계로 옳은 것은?`,
            answer: wch(r, ord(order), perms.map(ord)),
            steps: [`모두 밑이 $2$ 인 거듭제곱으로: ${es.map((e, i) => `$${names[i]}=2^{${e.tex()}}$`).join(', ')}`, `$y=2^{x}$ 는 증가함수이므로 지수가 클수록 큼`, ord(order)],
          };
        },
      },
    ],
  },

  // ───────────────────────── alg-3 삼각함수
  'alg-3': {
    concepts: [
      {
        title: '일반각과 호도법',
        body: '동경 $OP$ 가 나타내는 각은 $360^{\\circ}\\times n+\\alpha^{\\circ}$ ($n$ 은 정수) — 일반각.\n- 호도법: 반지름과 호의 길이가 같은 중심각을 $1$ 라디안. $180^{\\circ}=\\pi$\n- $1^{\\circ}=\\frac{\\pi}{180}$, $1\\text{ 라디안}=\\frac{180^{\\circ}}{\\pi}$',
      },
      {
        title: '부채꼴의 호의 길이와 넓이',
        body: '반지름 $r$, 중심각 $\\theta$ (라디안) 이면\n$$l=r\\theta,\\quad S=\\frac{1}{2}r^{2}\\theta=\\frac{1}{2}rl$$\n중학교의 $2\\pi r\\times\\frac{x}{360}$ 을 간단히 한 꼴입니다.',
      },
      {
        title: '삼각함수의 뜻',
        body: '원점 중심, 반지름 $r$ 인 원 위의 점 $P(x, y)$ 와 동경 $OP$ 가 나타내는 각 $\\theta$ 에 대하여\n$$\\sin\\theta=\\frac{y}{r},\\ \\cos\\theta=\\frac{x}{r},\\ \\tan\\theta=\\frac{y}{x}$$\n- 부호: 제1사분면 모두 $+$, 제2사분면 $\\sin$ 만 $+$, 제3사분면 $\\tan$ 만 $+$, 제4사분면 $\\cos$ 만 $+$\n- $\\sin^{2}\\theta+\\cos^{2}\\theta=1$, $\\tan\\theta=\\frac{\\sin\\theta}{\\cos\\theta}$',
      },
      {
        title: '삼각함수의 그래프',
        body: '- $y=a\\sin(bx+c)+d$, $y=a\\cos(bx+c)+d$: 최댓값 $|a|+d$, 최솟값 $-|a|+d$, 주기 $\\frac{2\\pi}{|b|}$\n- $y=a\\tan(bx+c)+d$: 최대·최소 없음, 주기 $\\frac{\\pi}{|b|}$\n- 성질: $\\sin(-x)=-\\sin x$, $\\cos(-x)=\\cos x$, $\\sin(\\pi-x)=\\sin x$, $\\cos(\\pi+x)=-\\cos x$ …',
      },
      {
        title: '삼각방정식',
        body: '$\\sin x=k$ 의 해는 $y=\\sin x$ 의 그래프와 직선 $y=k$ 의 교점의 $x$ 좌표입니다.\n- 먼저 특수각 하나를 찾고, 그래프의 대칭성으로 나머지 해를 찾음\n- 예: $0\\le x<2\\pi$ 에서 $\\sin x=\\frac{1}{2}$ 의 해는 $\\frac{\\pi}{6}, \\frac{5\\pi}{6}$',
      },
    ],
    skills: [
      {
        id: 'radian',
        title: '호도법과 일반각',
        gen(r, level) {
          if (level === 1) {
            const d = r.pick(SPECIAL.filter((x) => x > 0).concat([360, 300, 210]));
            const alt = [d + 30, d - 30, 180 - d, d * 2, d + 45, d - 45].filter((x) => x > 0 && x !== d);
            return {
              q: `$${deg(d)}$ 를 호도법으로 나타낸 것은?`,
              answer: tch(r, radian(d), [...alt.map(radian), `${d}\\pi`.replace(/^1\\pi/, '\\pi')]),
              steps: [`$1^{\\circ}=\\frac{\\pi}{180}$ 이므로 $${d}\\times\\frac{\\pi}{180}=${radian(d)}$`],
            };
          }
          if (level === 2) {
            const q = r.pick([2, 3, 4, 6, 5, 12]);
            let p = r.int(1, 2 * q);
            if (p === q) p += 1;
            const k = new F(p, q);
            const dval = (180 * p) / q;
            return {
              q: `$${piTex(k)}$ 를 육십분법으로 나타내면 몇 도인가요?`,
              answer: { type: 'num', value: dval, unit: '°' },
              steps: [`$\\pi=180^{\\circ}$ 이므로 $${piTex(k)}=${k.tex()}\\times180^{\\circ}=${deg(dval)}$`],
            };
          }
          const a = r.int(0, 35) * 10 + r.pick([0, 5]);
          const n = r.pick([-3, -2, -1, 2, 3, 4]);
          const t = 360 * n + a;
          return {
            q: `$${deg(t)}$ 를 $360^{\\circ}\\times n+\\alpha^{\\circ}$ ($n$ 은 정수, $0\\le\\alpha<360$) 꼴로 나타낼 때, $\\alpha$ 의 값을 구하세요.`,
            answer: { type: 'num', value: a, unit: '°' },
            steps: [`$${deg(t)}=360^{\\circ}\\times${n < 0 ? `(${n})` : n}+${deg(a)}$`, `$\\alpha=${a}$`],
          };
        },
      },
      {
        id: 'sector',
        title: '부채꼴의 호의 길이와 넓이',
        gen(r, level) {
          if (level === 3) {
            const c = 4 * r.int(2, 10);
            const rad = c / 4;
            return {
              q: `둘레의 길이가 $${c}$ 인 부채꼴 중에서 넓이가 최대인 것의 넓이를 구하세요.`,
              answer: { type: 'num', value: (c * c) / 16 },
              steps: [`반지름 $r$, 호의 길이 $l=${c}-2r$`, `$S=\\frac{1}{2}r(${c}-2r)=-r^{2}+${c / 2}r=-(r-${rad})^{2}+${rad * rad}$`, `$r=${rad}$ 일 때 최댓값 $${rad * rad}$`],
            };
          }
          const rr = r.int(2, 12);
          const th = r.pick([new F(1, 6), new F(1, 4), new F(1, 3), new F(1, 2), new F(2, 3), new F(3, 4), new F(5, 6), new F(5, 4), new F(4, 3)]);
          if (level === 1) {
            const l = th.mul(rr);
            return {
              q: `반지름의 길이가 $${rr}$ 이고 중심각의 크기가 $${piTex(th)}$ 인 부채꼴의 호의 길이는?`,
              answer: tch(r, piTex(l), [piTex(l.mul(2)), piTex(th.mul(rr * rr)), piTex(th.mul(rr * rr).div(2)), piTex(l.div(2)), piTex(l.add(1))]),
              steps: [`$l=r\\theta=${rr}\\times${piTex(th)}=${piTex(l)}$`],
            };
          }
          if (r.chance(0.5)) {
            const S = th.mul(rr * rr).div(2);
            return {
              q: `반지름의 길이가 $${rr}$ 이고 중심각의 크기가 $${piTex(th)}$ 인 부채꼴의 넓이는?`,
              answer: tch(r, piTex(S), [piTex(S.mul(2)), piTex(th.mul(rr)), piTex(th.mul(rr).div(2)), piTex(S.div(2)), piTex(S.add(1))]),
              steps: [`$S=\\frac{1}{2}r^{2}\\theta=\\frac{1}{2}\\times${rr * rr}\\times${piTex(th)}=${piTex(S)}$`],
            };
          }
          const l = r.int(2, 15);
          return {
            q: `반지름의 길이가 $${rr}$, 호의 길이가 $${l}$ 인 부채꼴의 넓이를 구하세요.`,
            answer: { type: 'num', value: (rr * l) / 2, display: 'frac' },
            steps: [`$S=\\frac{1}{2}rl=\\frac{1}{2}\\times${rr}\\times${l}=${new F(rr * l, 2).tex()}$`],
          };
        },
      },
      {
        id: 'special-values',
        title: '특수각의 삼각함숫값',
        gen(r, level) {
          for (;;) {
            const fn = r.pick(['sin', 'cos', 'tan'] as TF[]);
            const base = level === 1 ? r.pick([30, 45, 60, 0, 90]) : r.pick(SPECIAL.filter((d) => d % 90 !== 0 || r.chance(0.2)));
            const shift = level === 3 ? r.pick([-2, -1, 1, 2]) * 360 : 0;
            const d = base + shift;
            const t = trigTex(fn, d);
            if (t === null) continue;
            const others = TRIG_VALUES.map(([x]) => x).filter((x) => x !== t);
            const neg = t.startsWith('-') ? t.slice(1) : t === '0' ? '1' : '-' + t;
            return {
              q: `$\\${fn}\\left(${radian(d)}\\right)$ 의 값은?`,
              answer: tch(r, t, [neg, ...r.sample(others, 6)]),
              steps: [
                ...(shift !== 0 ? [`$${radian(d)}=${radian(base)}${shift > 0 ? '+' : '-'}${piTex(new F(Math.abs(shift), 180))}$ 이고 주기가 $2\\pi$ 이므로 $\\${fn}\\left(${radian(base)}\\right)$ 과 같음`] : []),
                `$${radian(base)}$ 는 $${deg(base)}$, ${base % 90 === 0 ? '좌표축 위의 각' : QUAD[Math.floor(base / 90)] + '의 각'}`,
                `$\\${fn}\\left(${radian(d)}\\right)=${t}$`,
              ],
            };
          }
        },
      },
      {
        id: 'trig-relation',
        title: '삼각함수 사이의 관계',
        gen(r, level) {
          if (level < 3) {
            const [a, b, c] = r.pick([
              [3, 4, 5],
              [4, 3, 5],
              [5, 12, 13],
              [12, 5, 13],
              [8, 15, 17],
              [15, 8, 17],
            ]);
            const quad = r.int(1, 3);
            const sS = quad <= 1 ? 1 : -1; // sin 부호
            const cS = quad === 0 || quad === 3 ? 1 : -1;
            const sinv = new F(sS * a, c),
              cosv = new F(cS * b, c),
              tanv = sinv.div(cosv);
            const giveSin = r.chance(0.5);
            const given = giveSin ? `\\sin\\theta=${sinv.tex()}` : `\\cos\\theta=${cosv.tex()}`;
            const askTan = level === 2;
            const ans = askTan ? tanv : giveSin ? cosv : sinv;
            return {
              q: `$${QRANGE[quad]}$ 이고 $${given}$ 일 때, $${askTan ? '\\tan\\theta' : giveSin ? '\\cos\\theta' : '\\sin\\theta'}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: ans.value, display: 'frac' },
              steps: [
                `$\\sin^{2}\\theta+\\cos^{2}\\theta=1$ 에서 $${giveSin ? '\\cos' : '\\sin'}^{2}\\theta=1-${(giveSin ? sinv : cosv).mul(giveSin ? sinv : cosv).tex()}=${(giveSin ? cosv : sinv).mul(giveSin ? cosv : sinv).tex()}$`,
                `${QUAD[quad]}이므로 $${giveSin ? '\\cos\\theta' : '\\sin\\theta'}=${(giveSin ? cosv : sinv).tex()}$`,
                ...(askTan ? [`$\\tan\\theta=\\frac{\\sin\\theta}{\\cos\\theta}=${tanv.tex()}$`] : []),
              ],
            };
          }
          const k = r.pick([new F(1, 2), new F(1, 3), new F(2, 3), new F(1, 5), new F(-1, 2), new F(3, 4), new F(-1, 3), new F(4, 3)]);
          const sc = k.mul(k).sub(1).div(2);
          const cube = r.chance(0.5);
          const ans = cube ? k.mul(new F(1).sub(sc)) : sc;
          return {
            q: `$\\sin\\theta+\\cos\\theta=${k.tex()}$ 일 때, $${cube ? '\\sin^{3}\\theta+\\cos^{3}\\theta' : '\\sin\\theta\\cos\\theta'}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: ans.value, display: 'frac' },
            steps: [
              `양변을 제곱: $1+2\\sin\\theta\\cos\\theta=${k.mul(k).tex()}$`,
              `$\\sin\\theta\\cos\\theta=${sc.tex()}$`,
              ...(cube ? [`$\\sin^{3}\\theta+\\cos^{3}\\theta=(\\sin\\theta+\\cos\\theta)(1-\\sin\\theta\\cos\\theta)=${k.tex()}\\times${new F(1).sub(sc).tex()}=${ans.tex()}$`] : []),
            ],
          };
        },
      },
      {
        id: 'period-maxmin',
        title: '삼각함수의 최대·최소와 주기',
        gen(r, level) {
          const fn = r.pick(['\\sin', '\\cos']);
          const bs = [new F(1), new F(2), new F(3), new F(4), new F(1, 2), new F(1, 3)];
          if (level === 1) {
            const a = r.nonzero(-5, 5),
              b = r.pick([1, 2, 3]),
              d = r.int(-4, 4);
            return {
              q: `함수 $y=${a === 1 ? '' : a === -1 ? '-' : a}${fn} ${b === 1 ? '' : b}x${d === 0 ? '' : (d > 0 ? '+' : '') + d}$ 의 최댓값과 최솟값을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: '최댓값', value: Math.abs(a) + d }, { label: '최솟값', value: -Math.abs(a) + d }] },
              steps: [`$-1\\le${fn} ${b === 1 ? '' : b}x\\le1$ 이므로 $-${Math.abs(a)}\\le ${a}${fn} ${b === 1 ? '' : b}x\\le ${Math.abs(a)}$`, `최댓값 $${Math.abs(a)}+${d < 0 ? `(${d})` : d}=${Math.abs(a) + d}$, 최솟값 $${-Math.abs(a) + d}$`],
            };
          }
          if (level === 2) {
            const isTan = r.chance(0.3);
            const b = r.pick(bs);
            const f = isTan ? '\\tan' : fn;
            const P = (isTan ? new F(1) : new F(2)).div(b);
            const bt = b.eq(1) ? '' : b.isInt() ? String(b.n) : b.tex();
            const a = r.nonzero(-3, 3);
            const c = r.int(-3, 3);
            return {
              q: `함수 $y=${a === 1 ? '' : a === -1 ? '-' : a}${f} ${bt}x${c === 0 ? '' : (c > 0 ? '+' : '') + c}$ 의 주기는?`,
              answer: tch(r, piTex(P), [piTex(P.mul(2)), piTex(P.div(2)), piTex(b.mul(2)), piTex(b), piTex(P.mul(Math.abs(a)))]),
              steps: [`$y=${f} bx$ 의 주기는 $\\frac{${isTan ? '\\pi' : '2\\pi'}}{|b|}$`, `$\\frac{${isTan ? '\\pi' : '2\\pi'}}{${b.tex()}}=${piTex(P)}$`],
            };
          }
          const b = r.pick(bs.slice(0, 5));
          const a = r.int(1, 5),
            c = r.int(-4, 4);
          const P = new F(2).div(b);
          const ans = b.add(a + c);
          return {
            q: `함수 $y=a\\cos bx+c$ ($a>0$, $b>0$) 의 최댓값이 $${a + c}$, 최솟값이 $${c - a}$, 주기가 $${piTex(P)}$ 일 때, $a+b+c$ 의 값을 구하세요.`,
            answer: { type: 'num', value: ans.value, display: 'frac' },
            steps: [`$a+c=${a + c}$, $-a+c=${c - a}$ 에서 $a=${a}$, $c=${c}$`, `$\\frac{2\\pi}{b}=${piTex(P)}$ 에서 $b=${b.tex()}$`, `$a+b+c=${ans.tex()}$`],
          };
        },
      },
      {
        id: 'trig-equation',
        title: '삼각방정식',
        gen(r, level) {
          const ALL = range(0, 23).map((i) => i * 15).filter((d) => d % 30 === 0 || d % 45 === 0);
          if (level === 3) {
            for (;;) {
              const fn = r.pick(['sin', 'cos'] as TF[]);
              const roots = r.sample([new F(1, 2), new F(-1, 2), new F(1), new F(-1), new F(0)], 2);
              // 2(s - r1)(s - r2) = 2s^2 - 2(r1+r2)s + 2 r1 r2
              const B = roots[0].add(roots[1]).mul(-2),
                C = roots[0].mul(roots[1]).mul(2);
              if (!B.isInt() || !C.isInt()) continue;
              const sols = ALL.filter((d) => roots.some((rt) => Math.abs(trigNum(fn, d) - rt.value) < 1e-9));
              const v = `\\${fn} x`;
              const eq = `${termsTex([{ c: 2, v: `${v.replace(' x', '')}^{2}x` }, { c: B, v }, { c: C, v: '' }])}=0`;
              return {
                q: `$0\\le x<2\\pi$ 에서 방정식 $${eq}$ 의 서로 다른 실근의 개수를 구하세요.`,
                answer: { type: 'num', value: sols.length, unit: '개' },
                steps: [`$${v}=t$ 로 놓으면 $${poly([2, B, C], 't')}=0$, $t=${roots[0].tex()}$ 또는 $t=${roots[1].tex()}$`, `각각의 해: ${sols.map((d) => `$${radian(d)}$`).join(', ')}`, `모두 $${sols.length}$ 개`],
              };
            }
          }
          for (;;) {
            const fn = r.pick(['sin', 'cos', 'tan'] as TF[]);
            const d0 = r.pick(ALL);
            const t = trigTex(fn, d0);
            if (t === null || t === '0' || t === '1' || t === '-1') continue;
            const sols = ALL.filter((d) => trigTex(fn, d) === t);
            const ask = r.int(0, 2);
            const sum = sols.reduce((s, d) => s.add(new F(d, 180)), new F(0));
            const ans = ask === 0 ? sum : new F(ask === 1 ? sols[0] : sols[sols.length - 1], 180);
            const what = ['모든 해의 합', '가장 작은 해', '가장 큰 해'][ask];
            let eq = `\\${fn} x=${t}`;
            if (level === 2) {
              const m = t.match(/^(-?)\\frac\{(.+)\}\{(\d)\}$/);
              if (m) eq = `${m[3]}\\${fn} x${m[1] === '-' ? '+' : '-'}${m[2]}=0`;
              else eq = `\\${fn} x${t.startsWith('-') ? '+' + t.slice(1) : '-' + t}=0`;
            }
            const wr = [ans.add(new F(1, 2)), ans.sub(new F(1, 3)), ans.add(new F(1, 6)), ans.add(1), ans.mul(2), sum.sub(new F(1, 2))].filter((x) => x.n > 0);
            return {
              q: `$0\\le x<2\\pi$ 에서 방정식 $${eq}$ 의 ${what}${josa(what, '은', '는')}?`,
              answer: tch(r, piTex(ans), wr.map(piTex)),
              steps: [...(level === 2 && eq.includes('=0') ? [`$\\${fn} x=${t}$`] : []), `해: ${sols.map((d) => `$${radian(d)}$`).join(', ')}`, `${what}: $${piTex(ans)}$`],
              hint: `$y=\\${fn} x$ 의 그래프와 직선 $y=${t}$ 의 교점을 생각하세요.`,
            };
          }
        },
      },
    ],
  },

  // ───────────────────────── alg-4 사인법칙과 코사인법칙
  'alg-4': {
    concepts: [
      {
        title: '사인법칙',
        body: '삼각형 $ABC$ 의 외접원의 반지름을 $R$ 이라 하면\n$$\\frac{a}{\\sin A}=\\frac{b}{\\sin B}=\\frac{c}{\\sin C}=2R$$\n- $a:b:c=\\sin A:\\sin B:\\sin C$\n- 한 변과 두 각을 알 때, 또는 외접원이 나올 때 사용',
      },
      {
        title: '코사인법칙',
        body: '$$a^{2}=b^{2}+c^{2}-2bc\\cos A$$\n- 두 변과 끼인각을 알 때 나머지 변\n- $\\cos A=\\frac{b^{2}+c^{2}-a^{2}}{2bc}$: 세 변을 알 때 각\n- $A=90^{\\circ}$ 이면 피타고라스 정리 (중학교) 가 됨',
        example: { q: '$b=3, c=5, A=120^{\\circ}$ 일 때 $a$?', a: '$a^{2}=9+25+15=49$, $a=7$' },
      },
      {
        title: '삼각형의 모양',
        body: '가장 긴 변을 $a$ 라 할 때\n- $a^{2}<b^{2}+c^{2}$: 예각삼각형, $a^{2}=b^{2}+c^{2}$: 직각삼각형, $a^{2}>b^{2}+c^{2}$: 둔각삼각형',
      },
      {
        title: '삼각형의 넓이',
        body: '$$S=\\frac{1}{2}bc\\sin A=\\frac{1}{2}ca\\sin B=\\frac{1}{2}ab\\sin C$$\n- 세 변만 알면: 코사인법칙으로 $\\cos A$ → $\\sin A=\\sqrt{1-\\cos^{2}A}$ → 넓이',
      },
    ],
    skills: [
      {
        id: 'sine-law',
        title: '사인법칙',
        gen(r, level) {
          if (level === 1) {
            const A = r.pick([30, 150, 90]);
            const a = 2 * r.int(1, 8);
            const R = A === 90 ? a / 2 : a;
            return {
              q: `삼각형 $ABC$ 에서 $a=${a}$, $A=${deg(A)}$ 일 때, 외접원의 반지름의 길이 $R$ 을 구하세요.`,
              answer: { type: 'num', value: R },
              steps: [`사인법칙: $\\frac{a}{\\sin A}=2R$`, `$2R=\\frac{${a}}{${sinTex(A)}}=${2 * R}$`, `$R=${R}$`],
            };
          }
          if (level === 2) {
            for (;;) {
              const [A, B] = r.sample([30, 45, 60, 90, 120, 135, 150], 2);
              if (A + B >= 180) continue;
              const b = r.int(2, 12);
              const val = (x: number, y: number, s: number) => {
                const [cx, ix] = SINV[x],
                  [cy, iy] = SINV[y];
                return surd(cx.div(cy).div(iy).mul(s), ix * iy);
              };
              const right = val(A, B, b);
              return {
                q: `삼각형 $ABC$ 에서 $b=${b}$, $A=${deg(A)}$, $B=${deg(B)}$ 일 때, $a$ 의 값은?`,
                answer: tch(r, right, [val(B, A, b), surd(SINV[A][0].mul(b), SINV[A][1]), val(A, B, 2 * b), val(A, B, b).startsWith('\\frac') ? surd(new F(b), SINV[A][1] * SINV[B][1] === 1 ? 2 : SINV[A][1] * SINV[B][1]) : surd(new F(b, 2), SINV[A][1] * SINV[B][1] === 1 ? 3 : SINV[A][1] * SINV[B][1])]),
                steps: [`$\\frac{a}{\\sin A}=\\frac{b}{\\sin B}$ 이므로 $a=\\frac{b\\sin A}{\\sin B}$`, `$a=\\frac{${b}\\times ${sinTex(A)}}{${sinTex(B)}}=${right}$`],
              };
            }
          }
          for (;;) {
            const p = r.int(2, 8),
              q = r.int(2, 8),
              s = r.int(2, 9);
            const big = Math.max(p, q, s);
            if (p + q + s - big <= big || (p === q && q === s) || gcd(gcd(p, q), s) !== 1) continue;
            const others = [p, q, s].filter((_, i, arr) => i !== arr.indexOf(big));
            const cosv = new F(others[0] ** 2 + others[1] ** 2 - big * big, 2 * others[0] * others[1]);
            return {
              q: `삼각형 $ABC$ 에서 $\\sin A:\\sin B:\\sin C=${p}:${q}:${s}$ 일 때, 가장 큰 각의 크기를 $\\theta$ 라 하면 $\\cos\\theta$ 의 값을 구하세요.`,
              answer: { type: 'num', value: cosv.value, display: 'frac' },
              steps: [`사인법칙에서 $a:b:c=${p}:${q}:${s}$, $a=${p}k, b=${q}k, c=${s}k$`, `가장 긴 변 $${big}k$ 의 대각이 가장 큰 각`, `$\\cos\\theta=\\frac{${others[0] ** 2}+${others[1] ** 2}-${big * big}}{2\\times${others[0]}\\times${others[1]}}=${cosv.tex()}$`],
            };
          }
        },
      },
      {
        id: 'cosine-side',
        title: '코사인법칙으로 변·각 구하기',
        gen(r, level) {
          const LIST: [number, number, number, number][] = [
            [3, 8, 60, 7],
            [5, 8, 60, 7],
            [8, 15, 60, 13],
            [7, 15, 60, 13],
            [5, 21, 60, 19],
            [3, 5, 120, 7],
            [7, 8, 120, 13],
            [5, 16, 120, 19],
            [6, 10, 120, 14],
            [3, 4, 90, 5],
            [6, 8, 90, 10],
          ];
          const [b0, c0, A, a0] = r.pick(LIST);
          const k = level === 1 ? 1 : r.pick([1, 2]);
          const [b, c, a] = [b0 * k, c0 * k, a0 * k];
          if (level === 1) {
            return {
              q: `삼각형 $ABC$ 에서 $b=${b}$, $c=${c}$, $A=${deg(A)}$ 일 때, $a$ 의 값을 구하세요.`,
              answer: { type: 'num', value: a },
              steps: [`$a^{2}=${b}^{2}+${c}^{2}-2\\times${b}\\times${c}\\times\\cos${deg(A)}$`, `$=${b * b}+${c * c}${A === 60 ? `-${b * c}` : A === 120 ? `+${b * c}` : ''}=${a * a}$`, `$a=${a}$`],
            };
          }
          if (level === 2) {
            const bb = r.int(2, 9),
              cc = r.int(2, 9),
              AA = r.pick([60, 120]);
            const a2 = bb * bb + cc * cc + (AA === 60 ? -bb * cc : bb * cc);
            return {
              q: `삼각형 $ABC$ 에서 $b=${bb}$, $c=${cc}$, $A=${deg(AA)}$ 일 때, $a$ 의 값은?`,
              answer: tch(r, sqrtTex(a2), [sqrtTex(bb * bb + cc * cc + (AA === 60 ? bb * cc : -bb * cc)), sqrtTex(bb * bb + cc * cc), sqrtTex(a2 + bb * cc), sqrtTex(Math.abs(a2 - 1) || 2)]),
              steps: [`$a^{2}=${bb * bb}+${cc * cc}-2\\times${bb}\\times${cc}\\times\\left(${AA === 60 ? '\\frac{1}{2}' : '-\\frac{1}{2}'}\\right)=${a2}$`, `$a=${sqrtTex(a2)}$`],
            };
          }
          return {
            q: `세 변의 길이가 $a=${a}$, $b=${b}$, $c=${c}$ 인 삼각형 $ABC$ 에서 $A$ 의 크기를 구하세요.`,
            answer: { type: 'num', value: A, unit: '°' },
            steps: [`$\\cos A=\\frac{${b * b}+${c * c}-${a * a}}{2\\times${b}\\times${c}}=${new F(b * b + c * c - a * a, 2 * b * c).tex()}$`, `$A=${deg(A)}$`],
          };
        },
      },
      {
        id: 'triangle-shape',
        title: '세 변으로 각과 모양 판단',
        gen(r, level) {
          if (level === 1) {
            for (;;) {
              const a = r.int(2, 9),
                b = r.int(2, 9),
                c = r.int(2, 9);
              if (a >= b + c || b >= a + c || c >= a + b) continue;
              const cosA = new F(b * b + c * c - a * a, 2 * b * c);
              return {
                q: `삼각형 $ABC$ 에서 $a=${a}$, $b=${b}$, $c=${c}$ 일 때, $\\cos A$ 의 값을 구하세요.`,
                answer: { type: 'num', value: cosA.value, display: 'frac' },
                steps: [`$\\cos A=\\frac{b^{2}+c^{2}-a^{2}}{2bc}=\\frac{${b * b}+${c * c}-${a * a}}{${2 * b * c}}=${cosA.tex()}$`],
              };
            }
          }
          if (level === 2) {
            for (;;) {
              const s = [r.int(2, 13), r.int(2, 13), r.int(2, 13)].sort((x, y) => x - y);
              if (s[2] >= s[0] + s[1]) continue;
              const d = s[0] ** 2 + s[1] ** 2 - s[2] ** 2;
              if (d === 0 && !r.chance(0.6)) continue;
              const kinds = ['예각삼각형', '직각삼각형', '둔각삼각형'];
              const k = d > 0 ? 0 : d === 0 ? 1 : 2;
              return {
                q: `세 변의 길이가 $${s[1]}$, $${s[2]}$, $${s[0]}$ 인 삼각형은 어떤 삼각형인가요?`,
                answer: wch(r, kinds[k], kinds.filter((_, i) => i !== k), 3),
                steps: [`가장 긴 변 $${s[2]}$: $${s[2]}^{2}=${s[2] ** 2}$, 나머지 두 변의 제곱의 합 $${s[0] ** 2 + s[1] ** 2}$`, `$${s[2] ** 2}${d > 0 ? '<' : d === 0 ? '=' : '>'}${s[0] ** 2 + s[1] ** 2}$ 이므로 ${kinds[k]}`],
              };
            }
          }
          for (;;) {
            const p = r.int(4, 12),
              q = r.int(4, 12),
              s = r.int(4, 12);
            if ((p + q + s) % 2 || (p === q && q === s) || gcd(gcd(p, q), s) > 2) continue;
            const h = (p + q + s) / 2;
            const a = h - q,
              b = h - s,
              c = h - p;
            if (a <= 0 || b <= 0 || c <= 0 || a >= b + c || b >= a + c || c >= a + b) continue;
            const cosA = new F(b * b + c * c - a * a, 2 * b * c);
            return {
              q: `삼각형 $ABC$ 에서 $(a+b):(b+c):(c+a)=${p}:${q}:${s}$ 일 때, $\\cos A$ 의 값을 구하세요.`,
              answer: { type: 'num', value: cosA.value, display: 'frac' },
              steps: [`$a+b=${p}k$, $b+c=${q}k$, $c+a=${s}k$ 를 모두 더하면 $a+b+c=${h}k$`, `$a=${a}k$, $b=${b}k$, $c=${c}k$`, `$\\cos A=\\frac{${b * b}+${c * c}-${a * a}}{2\\times${b}\\times${c}}=${cosA.tex()}$`],
            };
          }
        },
      },
      {
        id: 'triangle-area',
        title: '삼각형의 넓이',
        gen(r, level) {
          if (level === 1) {
            const A = r.pick([30, 150, 90]);
            const b = r.int(2, 12),
              c = r.int(2, 12);
            const S = new F(b * c, A === 90 ? 2 : 4);
            return {
              q: `삼각형 $ABC$ 에서 $b=${b}$, $c=${c}$, $A=${deg(A)}$ 일 때, 넓이를 구하세요.`,
              answer: { type: 'num', value: S.value, display: 'frac' },
              steps: [`$S=\\frac{1}{2}bc\\sin A=\\frac{1}{2}\\times${b}\\times${c}\\times${sinTex(A)}=${S.tex()}$`],
            };
          }
          if (level === 2) {
            const A = r.pick([45, 60, 120, 135]);
            const b = r.int(2, 10),
              c = r.int(2, 10);
            const [co, ii] = SINV[A];
            const S = co.mul(b * c).div(2);
            return {
              q: `삼각형 $ABC$ 에서 $b=${b}$, $c=${c}$, $A=${deg(A)}$ 일 때, 넓이는?`,
              answer: tch(r, radTex(S, ii), [radTex(S.mul(2), ii), radTex(S, ii === 2 ? 3 : 2), S.tex(), radTex(S.div(2), ii)]),
              steps: [`$S=\\frac{1}{2}\\times${b}\\times${c}\\times${sinTex(A)}=${radTex(S, ii)}$`],
            };
          }
          const T: [number, number, number][] = [
            [5, 5, 6],
            [5, 5, 8],
            [13, 14, 15],
            [10, 10, 12],
            [13, 13, 10],
            [7, 15, 20],
            [9, 10, 17],
            [5, 12, 13],
            [13, 20, 21],
            [10, 13, 13],
            [6, 25, 29],
          ];
          const [x, y, z] = r.shuffle(r.pick(T));
          const cosA = new F(y * y + z * z - x * x, 2 * y * z);
          const sin2 = new F(1).sub(cosA.mul(cosA));
          const sinA = F.fromNumber(Math.sqrt(sin2.value), 100000);
          const S = sinA.mul(y * z).div(2);
          return {
            q: `세 변의 길이가 $a=${x}$, $b=${y}$, $c=${z}$ 인 삼각형 $ABC$ 의 넓이를 구하세요.`,
            answer: { type: 'num', value: S.value, display: 'frac' },
            steps: [`$\\cos A=\\frac{${y * y}+${z * z}-${x * x}}{2\\times${y}\\times${z}}=${cosA.tex()}$`, `$\\sin A=\\sqrt{1-\\left(${cosA.tex()}\\right)^{2}}=${sinA.tex()}$`, `$S=\\frac{1}{2}\\times${y}\\times${z}\\times${sinA.tex()}=${S.tex()}$`],
          };
        },
      },
      {
        id: 'law-word',
        title: '사인·코사인법칙의 활용',
        gen(r, level) {
          const LIST: [number, number, number, number][] = [
            [3, 8, 60, 7],
            [5, 8, 60, 7],
            [8, 15, 60, 13],
            [7, 15, 60, 13],
            [3, 5, 120, 7],
            [7, 8, 120, 13],
            [5, 16, 120, 19],
            [5, 21, 60, 19],
          ];
          const [b0, a0, C, c0] = r.pick(LIST);
          const k = level === 1 ? r.pick([10, 20]) : r.pick([10, 20, 30, 50]);
          const [a, b, c] = [a0 * k, b0 * k, c0 * k];
          const who = r.pick(NAMES);
          const place = r.pick(['호수', '연못', '언덕', '건물']);
          const q0 = `${place}의 양쪽에 있는 두 지점 $A$, $B$ 사이의 거리를 구하기 위해 ${who}${josa(who, '이가', '가')} 지점 $C$ 에서 측량했더니 $\\overline{CA}=${b}\\text{ m}$, $\\overline{CB}=${a}\\text{ m}$, $\\angle ACB=${deg(C)}$ 였습니다.`;
          if (level < 3) {
            return {
              q: `${q0} 두 지점 $A$, $B$ 사이의 거리는 몇 m 인가요?`,
              answer: { type: 'num', value: c, unit: 'm' },
              steps: [`$\\overline{AB}^{2}=${b}^{2}+${a}^{2}-2\\times${b}\\times${a}\\times\\cos${deg(C)}$`, `$=${b * b + a * a}${C === 60 ? `-${a * b}` : `+${a * b}`}=${c * c}$`, `$\\overline{AB}=${c}$ m`],
            };
          }
          const R = surd(new F(c, 3), 3);
          return {
            q: `${q0} 세 지점 $A$, $B$, $C$ 를 지나는 원의 반지름의 길이는?`,
            answer: tch(r, R + '\\text{ m}', [surd(new F(c, 6), 3) + '\\text{ m}', surd(new F(2 * c, 3), 3) + '\\text{ m}', `${c}\\text{ m}`, surd(new F(c, 2), 3) + '\\text{ m}', surd(new F(c, 2), 2) + '\\text{ m}']),
            steps: [`코사인법칙으로 $\\overline{AB}=${c}$ m`, `사인법칙: $2R=\\frac{${c}}{\\sin${deg(C)}}=\\frac{${c}}{\\frac{\\sqrt{3}}{2}}$`, `$R=\\frac{${c}}{\\sqrt{3}}=${R}$ (m)`],
          };
        },
      },
    ],
  },

  // ───────────────────────── alg-5 등차수열과 등비수열
  'alg-5': {
    concepts: [
      {
        title: '등차수열',
        body: '첫째항 $a$ 에 차례로 일정한 수 $d$ (공차) 를 더해 만든 수열.\n$$a_n=a+(n-1)d$$\n- 등차중항: $a, b, c$ 가 등차수열이면 $2b=a+c$',
      },
      {
        title: '등차수열의 합',
        body: '$$S_n=\\frac{n\\{2a+(n-1)d\\}}{2}=\\frac{n(a+l)}{2}$$ ($l$ 은 끝항)\n- 초등학교의 "1부터 100까지 합" (가우스) 과 같은 원리',
        example: { q: '$1+3+5+\\cdots+19$ 는?', a: '$n=10$, $\\frac{10(1+19)}{2}=100$' },
      },
      {
        title: '등비수열',
        body: '첫째항 $a$ 에 차례로 일정한 수 $r$ (공비) 을 곱해 만든 수열.\n$$a_n=ar^{n-1}$$\n- 등비중항: $a, b, c$ 가 등비수열이면 $b^{2}=ac$',
      },
      {
        title: '등비수열의 합',
        body: '$$S_n=\\frac{a(r^{n}-1)}{r-1}=\\frac{a(1-r^{n})}{1-r}\\quad(r\\ne1),\\qquad S_n=na\\quad(r=1)$$',
      },
      {
        title: '수열의 합과 일반항',
        body: '$S_n=a_1+a_2+\\cdots+a_n$ 일 때\n$$a_1=S_1,\\quad a_n=S_n-S_{n-1}\\ (n\\ge2)$$',
      },
    ],
    skills: [
      {
        id: 'arith-term',
        title: '등차수열의 일반항',
        gen(r, level) {
          const a = r.int(-10, 20),
            d = r.nonzero(-5, 6);
          const an = (n: number) => a + (n - 1) * d;
          if (level === 1) {
            const n = r.int(5, 20);
            return {
              q: `첫째항이 $${a}$, 공차가 $${d}$ 인 등차수열의 제$${n}$항을 구하세요.`,
              answer: { type: 'num', value: an(n) },
              steps: [`$a_{${n}}=${a}+(${n}-1)\\times${d < 0 ? `(${d})` : d}=${an(n)}$`],
            };
          }
          if (level === 2) {
            const p = r.int(2, 5),
              q = p + r.int(2, 5),
              n = r.int(10, 20);
            return {
              q: `등차수열 $\\{a_n\\}$ 에서 $a_{${p}}=${an(p)}$, $a_{${q}}=${an(q)}$ 일 때, $a_{${n}}$ 을 구하세요.`,
              answer: { type: 'num', value: an(n) },
              steps: [`$a_{${q}}-a_{${p}}=${q - p}d=${an(q) - an(p)}$, $d=${d}$`, `$a_1=a_{${p}}-${p - 1}d=${a}$`, `$a_{${n}}=${a}+${n - 1}\\times${d < 0 ? `(${d})` : d}=${an(n)}$`],
            };
          }
          const A = r.int(15, 60),
            D = -r.int(2, 7);
          const p = r.int(2, 4),
            q = p + r.int(2, 4);
          const bn = (n: number) => A + (n - 1) * D;
          const first = Math.floor(A / -D) + 2;
          return {
            q: `등차수열 $\\{a_n\\}$ 에서 $a_{${p}}=${bn(p)}$, $a_{${q}}=${bn(q)}$ 일 때, 처음으로 음수가 되는 항은 제몇 항인가요?`,
            answer: { type: 'num', value: first, unit: '항' },
            steps: [`$d=\\frac{${bn(q)}-${paren(bn(p))}}{${q - p}}=${D}$, $a_1=${A}$`, `$a_n=${A}${D}(n-1)<0$ 에서 $n>${new F(A, -D).add(1).tex()}$`, `처음으로 음수가 되는 항: 제$${first}$항 ($a_{${first}}=${bn(first)}$)`],
          };
        },
      },
      {
        id: 'arith-sum',
        title: '등차수열의 합',
        gen(r, level) {
          const a = r.int(-10, 15),
            d = r.nonzero(-4, 6),
            n = r.int(6, 20);
          const S = (n * (2 * a + (n - 1) * d)) / 2;
          if (level === 1) {
            return {
              q: `첫째항이 $${a}$, 공차가 $${d}$ 인 등차수열의 첫째항부터 제$${n}$항까지의 합을 구하세요.`,
              answer: { type: 'num', value: S },
              steps: [`$S_{${n}}=\\frac{${n}\\{2\\times${paren(a)}+${n - 1}\\times${paren(d)}\\}}{2}=${S}$`],
            };
          }
          if (level === 2) {
            const A = r.int(1, 9),
              D = r.int(2, 6),
              N = r.int(8, 25);
            const l = A + (N - 1) * D;
            return {
              q: `다음 합을 구하세요.\n$$${A}+${A + D}+${A + 2 * D}+\\cdots+${l}$$`,
              answer: { type: 'num', value: (N * (A + l)) / 2 },
              steps: [`첫째항 $${A}$, 공차 $${D}$, $${l}=${A}+(n-1)\\times${D}$ 에서 $n=${N}$`, `$S=\\frac{${N}(${A}+${l})}{2}=${(N * (A + l)) / 2}$`],
            };
          }
          const A = r.int(20, 60),
            D = -r.int(2, 6);
          let m = 0,
            best = 0,
            s = 0;
          for (let k = 1; k <= 100; k++) {
            s += A + (k - 1) * D;
            if (s > best) {
              best = s;
              m = k;
            }
          }
          const lastPos = Math.floor(A / -D) + 1;
          return {
            q: `첫째항이 $${A}$, 공차가 $${D}$ 인 등차수열의 첫째항부터 제$n$항까지의 합 $S_n$ 의 최댓값을 구하세요.`,
            answer: { type: 'num', value: best },
            steps: [`$a_n=${A}${D}(n-1)\\ge0$ 인 $n$ 은 $n\\le ${lastPos}$`, `양수(또는 0)인 항까지 더할 때 최대: $S_{${m}}=${best}$`],
            hint: '음수가 되기 직전의 항까지 더하면 최대입니다.',
          };
        },
      },
      {
        id: 'geo-term',
        title: '등비수열의 일반항',
        gen(r, level) {
          if (level === 1) {
            const a = r.nonzero(-5, 5),
              rr = r.pick([2, 3, -2, -3]),
              n = r.int(4, 7);
            return {
              q: `첫째항이 $${a}$, 공비가 $${rr}$ 인 등비수열의 제$${n}$항을 구하세요.`,
              answer: { type: 'num', value: a * rr ** (n - 1) },
              steps: [`$a_{${n}}=${a}\\times(${rr})^{${n - 1}}=${a * rr ** (n - 1)}$`],
            };
          }
          if (level === 2) {
            const a = r.int(1, 5),
              rr = r.pick([2, 3, -2]);
            const p = r.int(1, 2),
              q = p + 3,
              n = r.int(6, 8);
            const an = (k: number) => a * rr ** (k - 1);
            return {
              q: `등비수열 $\\{a_n\\}$ 에서 $a_{${p}}=${an(p)}$, $a_{${q}}=${an(q)}$ 일 때, $a_{${n}}$ 을 구하세요. (단, 공비는 실수)`,
              answer: { type: 'num', value: an(n) },
              steps: [`$\\frac{a_{${q}}}{a_{${p}}}=r^{3}=${an(q) / an(p)}$, $r=${rr}$`, `$a_1=${a}$`, `$a_{${n}}=${a}\\times(${rr})^{${n - 1}}=${an(n)}$`],
            };
          }
          const a = r.int(1, 4),
            rr = r.pick([2, 3]);
          const an = (k: number) => a * rr ** (k - 1);
          if (r.chance(0.5)) {
            const m = r.int(3, 5),
              h = r.int(1, 2);
            return {
              q: `모든 항이 양수인 등비수열 $\\{a_n\\}$ 에서 $a_{${m - h}}\\times a_{${m + h}}=${an(m) ** 2}$ 일 때, $a_{${m}}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: an(m) },
              steps: [`$a_{${m - h}}a_{${m + h}}=(a_{${m}})^{2}$ (등비중항)`, `$a_{${m}}=\\sqrt{${an(m) ** 2}}=${an(m)}$`],
            };
          }
          return {
            q: `모든 항이 양수인 등비수열 $\\{a_n\\}$ 에서 $a_1a_2a_3=${an(2) ** 3}$, $a_4=${an(4)}$ 일 때, 공비를 구하세요.`,
            answer: { type: 'num', value: rr },
            steps: [`$a_1a_2a_3=(a_2)^{3}=${an(2) ** 3}$ 이므로 $a_2=${an(2)}$`, `$r^{2}=\\frac{a_4}{a_2}=${rr * rr}$, $r=${rr}$`],
          };
        },
      },
      {
        id: 'geo-sum',
        title: '등비수열의 합',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(1, 5),
              rr = r.pick([2, 3]),
              n = r.int(4, 8);
            const S = (a * (rr ** n - 1)) / (rr - 1);
            return {
              q: `첫째항이 $${a}$, 공비가 $${rr}$ 인 등비수열의 첫째항부터 제$${n}$항까지의 합을 구하세요.`,
              answer: { type: 'num', value: S },
              steps: [`$S_{${n}}=\\frac{${a}(${rr}^{${n}}-1)}{${rr}-1}=${S}$`],
            };
          }
          if (level === 2) {
            const rr = r.pick([new F(-2), new F(1, 2), new F(-3), new F(1, 3)]);
            const a = rr.d === 1 ? r.int(1, 4) : rr.d ** r.int(3, 4);
            const n = r.int(4, 6);
            const S = new F(a).mul(new F(1).sub(rr.pow(n))).div(new F(1).sub(rr));
            return {
              q: `첫째항이 $${a}$, 공비가 $${rr.tex()}$ 인 등비수열의 첫째항부터 제$${n}$항까지의 합을 구하세요.`,
              answer: { type: 'num', value: S.value, display: 'frac' },
              steps: [`$S_{${n}}=\\frac{${a}\\{1-(${rr.tex()})^{${n}}\\}}{1-(${rr.tex()})}$`, `$=${S.tex()}$`],
            };
          }
          const a = r.int(1, 4),
            rr = r.pick([2, 3, -2, new F(1, 2) as unknown as number]);
          const R = F.of(rr as number | F);
          const S = (n: number) => new F(a).mul(new F(1).sub(R.pow(n))).div(new F(1).sub(R));
          const p = S(3),
            q = S(6),
            ans = S(9);
          return {
            q: `등비수열 $\\{a_n\\}$ 의 첫째항부터 제$n$항까지의 합을 $S_n$ 이라 하자. $S_3=${p.tex()}$, $S_6=${q.tex()}$ 일 때, $S_9$ 의 값을 구하세요.`,
            answer: { type: 'num', value: ans.value, display: 'frac' },
            steps: [`$S_6-S_3=r^{3}S_3$ 이므로 $r^{3}=\\frac{${q.tex()}-${p.tex()}}{${p.tex()}}=${R.pow(3).tex()}$`, `$S_9=S_3(1+r^{3}+r^{6})=${p.tex()}\\times(1+${R.pow(3).tex()}+${R.pow(6).tex()})$`.replace('+-', '-'), `$=${ans.tex()}$`],
          };
        },
      },
      {
        id: 'means',
        title: '등차중항·등비중항',
        gen(r, level) {
          if (level === 1) {
            if (r.chance(0.5)) {
              const a = r.int(-10, 20);
              let b = r.int(-10, 30);
              if ((a + b) % 2) b += 1;
              if (b === a) b += 4;
              return {
                q: `세 수 $${a}$, $x$, $${b}$ ${texJosa(String(b), '이', '가')} 이 순서대로 등차수열을 이룰 때, $x$ 의 값을 구하세요.`,
                answer: { type: 'num', value: (a + b) / 2 },
                steps: [`등차중항: $2x=${a}+${paren(b)}$`, `$x=${(a + b) / 2}$`],
              };
            }
            const u = r.int(1, 4),
              s = r.int(1, 3);
            let v = r.int(1, 5);
            if (v === u) v = u + 1;
            const a = s * u * u,
              b = s * v * v;
            return {
              q: `세 양수 $${a}$, $x$, $${b}$ ${texJosa(String(b), '이', '가')} 이 순서대로 등비수열을 이룰 때, $x$ 의 값을 구하세요.`,
              answer: { type: 'num', value: s * u * v },
              steps: [`등비중항: $x^{2}=${a}\\times${b}=${a * b}$`, `$x>0$ 이므로 $x=${s * u * v}$`],
            };
          }
          if (level === 2) {
            for (;;) {
              const m = r.int(1, 3),
                n = r.int(1, 3),
                x0 = r.int(-3, 6);
              const k = 2 * m - 1 - n;
              if (k === 0) continue;
              const c1 = r.int(-5, 5),
                c2 = r.int(-5, 5);
              const c3 = k * x0 + 2 * c2 - c1;
              const t1 = poly([1, c1]),
                t2 = poly([m, c2]),
                t3 = poly([n, c3]);
              return {
                q: `세 수 $${t1}$, $${t2}$, $${t3}$ ${texJosa(t3, '이', '가')} 이 순서대로 등차수열을 이룰 때, $x$ 의 값을 구하세요.`,
                answer: { type: 'num', value: x0 },
                steps: [`$2(${t2})=(${t1})+(${t3})$`, `$${poly([2 * m, 2 * c2])}=${poly([1 + n, c1 + c3])}$`, `$x=${x0}$`],
              };
            }
          }
          if (r.chance(0.5)) {
            const a = r.int(1, 5),
              rr = r.pick([2, 3, -2]);
            return {
              q: `네 수 $${a}$, $x$, $y$, $${a * rr ** 3}$ ${texJosa(String(a * rr ** 3), '이', '가')} 이 순서대로 등비수열을 이룰 때, $x+y$ 의 값을 구하세요. (단, 공비는 실수)`,
              answer: { type: 'num', value: a * rr + a * rr * rr },
              steps: [`$${a}r^{3}=${a * rr ** 3}$, $r=${rr}$`, `$x=${a * rr}$, $y=${a * rr * rr}$, $x+y=${a * rr + a * rr * rr}$`],
            };
          }
          const a = r.int(-5, 10),
            d = r.nonzero(-4, 6),
            k = r.int(3, 6);
          const b = a + (k + 1) * d;
          return {
            q: `두 수 $${a}$ ${texJosa(String(a), '과', '와')} $${b}$ 사이에 $${k}$ 개의 수를 넣어 전체가 등차수열이 되게 할 때, 넣은 $${k}$ 개의 수의 합을 구하세요.`,
            answer: { type: 'num', value: (k * (2 * a + (k + 1) * d)) / 2 },
            steps: [`전체 $${k + 2}$ 개 항, $${b}=${a}+${k + 1}d$ 에서 $d=${d}$`, `넣은 수의 합 $=\\frac{${k}(${a + d}+${paren(b - d)})}{2}=${(k * (2 * a + (k + 1) * d)) / 2}$`],
          };
        },
      },
      {
        id: 'sum-to-term',
        title: '수열의 합과 일반항',
        gen(r, level) {
          const p = r.nonzero(-3, 4),
            q = r.int(-6, 6);
          const c = level === 3 ? r.nonzero(-5, 5) : 0;
          const S = (n: number) => p * n * n + q * n + c;
          const Sn = `${termsTex([{ c: p, v: 'n^{2}' }, { c: q, v: 'n' }, { c, v: '' }])}`;
          const k = r.int(4, 12);
          if (level === 1) {
            return {
              q: `수열 $\\{a_n\\}$ 의 첫째항부터 제$n$항까지의 합 $S_n=${Sn}$ 일 때, $a_{${k}}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: S(k) - S(k - 1) },
              steps: [`$a_{${k}}=S_{${k}}-S_{${k - 1}}=${S(k)}-${paren(S(k - 1))}=${S(k) - S(k - 1)}$`],
            };
          }
          if (level === 2) {
            const m = k + r.int(1, 6);
            return {
              q: `수열 $\\{a_n\\}$ 의 첫째항부터 제$n$항까지의 합 $S_n=${Sn}$ 일 때, $a_{${k}}+a_{${m}}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: S(k) - S(k - 1) + S(m) - S(m - 1) },
              steps: [`$a_n=S_n-S_{n-1}=${poly([2 * p, q - p], 'n')}\\ (n\\ge2)$`, `$a_{${k}}=${S(k) - S(k - 1)}$, $a_{${m}}=${S(m) - S(m - 1)}$`, `합: $${S(k) - S(k - 1) + S(m) - S(m - 1)}$`],
            };
          }
          return {
            q: `수열 $\\{a_n\\}$ 의 첫째항부터 제$n$항까지의 합 $S_n=${Sn}$ 일 때, $a_1+a_{${k}}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: S(1) + S(k) - S(k - 1) },
            steps: [`$a_1=S_1=${S(1)}$ (상수항이 있으므로 $a_1$ 은 따로!)`, `$n\\ge2$ 일 때 $a_n=S_n-S_{n-1}=${poly([2 * p, q - p], 'n')}$, $a_{${k}}=${S(k) - S(k - 1)}$`, `$a_1+a_{${k}}=${S(1) + S(k) - S(k - 1)}$`],
            hint: '$a_1=S_1$ 은 따로 구하세요.',
          };
        },
      },
    ],
  },

  // ───────────────────────── alg-6 수열의 합
  'alg-6': {
    concepts: [
      {
        title: '합의 기호 $\\Sigma$',
        body: '$$\\sum_{k=1}^{n}a_k=a_1+a_2+\\cdots+a_n$$\n- 성질: $\\sum(a_k\\pm b_k)=\\sum a_k\\pm\\sum b_k$, $\\sum ca_k=c\\sum a_k$, $\\sum_{k=1}^{n}c=cn$\n- 주의: $\\sum a_kb_k\\ne\\sum a_k\\sum b_k$',
      },
      {
        title: '자연수의 거듭제곱의 합',
        body: '$$\\sum_{k=1}^{n}k=\\frac{n(n+1)}{2},\\quad\\sum_{k=1}^{n}k^{2}=\\frac{n(n+1)(2n+1)}{6},\\quad\\sum_{k=1}^{n}k^{3}=\\left\\{\\frac{n(n+1)}{2}\\right\\}^{2}$$',
        example: { q: '$\\sum_{k=1}^{10}(2k+1)$ 은?', a: '$2\\times55+10=120$' },
      },
      {
        title: '분수 꼴 수열의 합 (소거)',
        body: '$$\\frac{1}{k(k+1)}=\\frac{1}{k}-\\frac{1}{k+1}$$\n앞뒤 항이 지워져 첫 항과 끝 항만 남습니다.\n- 일반적으로 $\\frac{1}{AB}=\\frac{1}{B-A}\\left(\\frac{1}{A}-\\frac{1}{B}\\right)$\n- $\\frac{1}{\\sqrt{k+1}+\\sqrt{k}}=\\sqrt{k+1}-\\sqrt{k}$ (유리화)',
      },
      {
        title: '$\\Sigma$ 의 시작이 1이 아닐 때',
        body: '$$\\sum_{k=m}^{n}a_k=\\sum_{k=1}^{n}a_k-\\sum_{k=1}^{m-1}a_k$$',
      },
    ],
    skills: [
      {
        id: 'sigma-poly',
        title: '$\\Sigma$ 계산 (다항식)',
        gen(r, level) {
          const n = r.int(5, 15);
          if (level === 1) {
            const a = r.nonzero(-4, 5),
              b = r.int(-6, 6);
            const v = a * sumK(n) + b * n;
            return {
              q: `$${sig(1, n, b === 0 ? poly([a, b], 'k') : `(${poly([a, b], 'k')})`)}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v },
              steps: [`$${a}\\sum k${b === 0 ? '' : `+${paren(b)}\\times${n}`}$`, `$=${a}\\times${sumK(n)}${b === 0 ? '' : `+${paren(b * n)}`}=${v}$`],
            };
          }
          if (level === 2) {
            const a = r.int(-3, 3),
              b = r.int(-3, 3);
            const v = sumK2(n) + (a + b) * sumK(n) + a * b * n;
            const f1 = poly([1, a], 'k'),
              f2 = poly([1, b], 'k');
            const body = a === 0 && b === 0 ? 'k^{2}' : a === 0 ? `k(${f2})` : b === 0 ? `k(${f1})` : `(${f1})(${f2})`;
            return {
              q: `$${sig(1, n, body)}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v },
              steps: [`전개: $${poly([1, a + b, a * b], 'k')}$`, `$\\sum k^{2}=${sumK2(n)}$, $\\sum k=${sumK(n)}$`, `$${sumK2(n)}+${paren((a + b) * sumK(n))}+${paren(a * b * n)}=${v}$`],
            };
          }
          if (r.chance(0.5)) {
            const m = r.int(3, 6),
              N = r.int(10, 15);
            const a = r.int(1, 3),
              b = r.int(-5, 5);
            const T = (x: number) => a * sumK2(x) + b * x;
            const v = T(N) - T(m - 1);
            return {
              q: `$${sig(m, N, b === 0 ? poly([a, 0, b], 'k') : `(${poly([a, 0, b], 'k')})`)}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v },
              steps: [`$\\sum_{k=${m}}^{${N}}=\\sum_{k=1}^{${N}}-\\sum_{k=1}^{${m - 1}}$`, `$${T(N)}-${paren(T(m - 1))}=${v}$`],
            };
          }
          const N = r.int(4, 10);
          return {
            q: `$${sig(1, N, `k^{3}`)}-${sig(1, N, `k^{2}`)}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: sumK3(N) - sumK2(N) },
            steps: [`$\\sum k^{3}=\\left(\\frac{${N}\\times${N + 1}}{2}\\right)^{2}=${sumK3(N)}$`, `$\\sum k^{2}=\\frac{${N}\\times${N + 1}\\times${2 * N + 1}}{6}=${sumK2(N)}$`, `$${sumK3(N) - sumK2(N)}$`],
          };
        },
      },
      {
        id: 'sigma-property',
        title: '$\\Sigma$ 의 성질',
        gen(r, level) {
          const n = r.int(5, 20);
          if (level === 1) {
            const P = r.int(-10, 30),
              Q = r.int(-10, 30),
              al = r.nonzero(-3, 4),
              be = r.nonzero(-3, 3),
              ga = r.int(-3, 3);
            const v = al * P + be * Q + ga * n;
            return {
              q: `$${sig(1, n, 'a_k')}=${P}$, $${sig(1, n, 'b_k')}=${Q}$ 일 때, $${sig(1, n, `(${termsTex([{ c: al, v: 'a_k' }, { c: be, v: 'b_k' }, { c: ga, v: '' }])})`)}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v },
              steps: [`$${cv(al, '\\sum a_k')}${be > 0 ? '+' : ''}${cv(be, '\\sum b_k')}${ga === 0 ? '' : `+${paren(ga)}\\times${n}`}$`, `$=${al * P}+${paren(be * Q)}${ga === 0 ? '' : `+${paren(ga * n)}`}=${v}$`],
            };
          }
          if (level === 2) {
            const P = r.int(-10, 20),
              Q = r.int(10, 80),
              c = r.nonzero(-3, 3);
            const v = Q + 2 * c * P + c * c * n;
            return {
              q: `$${sig(1, n, 'a_k')}=${P}$, $${sig(1, n, 'a_k^{2}')}=${Q}$ 일 때, $${sig(1, n, `(${poly([1, c], 'a_k')})^{2}`)}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v },
              steps: [`$(a_k${c > 0 ? '+' : ''}${c})^{2}=a_k^{2}${2 * c > 0 ? '+' : ''}${2 * c}a_k+${c * c}$`, `$${Q}+${paren(2 * c)}\\times${paren(P)}+${c * c}\\times${n}=${v}$`],
            };
          }
          const A = r.int(-10, 30),
            B = r.int(-10, 30);
          const P = A + B,
            Q = A - B;
          const al = r.nonzero(-3, 3),
            be = r.nonzero(-3, 3);
          return {
            q: `$${sig(1, n, '(a_k+b_k)')}=${P}$, $${sig(1, n, '(a_k-b_k)')}=${Q}$ 일 때, $${sig(1, n, `(${termsTex([{ c: al, v: 'a_k' }, { c: be, v: 'b_k' }])})`)}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: al * A + be * B },
            steps: [`두 식을 더하고 빼면 $\\sum a_k=${A}$, $\\sum b_k=${B}$`, `$${al}\\times${paren(A)}+${paren(be)}\\times${paren(B)}=${al * A + be * B}$`],
          };
        },
      },
      {
        id: 'telescoping',
        title: '분수 꼴 수열의 합',
        gen(r, level) {
          const n = r.int(5, 30);
          if (level === 1) {
            return {
              q: `$${sig(1, n, '\\frac{1}{k(k+1)}')}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: n / (n + 1), display: 'frac' },
              steps: [`$\\frac{1}{k(k+1)}=\\frac{1}{k}-\\frac{1}{k+1}$`, `$\\left(1-\\frac{1}{2}\\right)+\\left(\\frac{1}{2}-\\frac{1}{3}\\right)+\\cdots=1-\\frac{1}{${n + 1}}=${new F(n, n + 1).tex()}$`],
            };
          }
          if (level === 2) {
            if (r.chance(0.5)) {
              return {
                q: `$${sig(1, n, '\\frac{1}{(2k-1)(2k+1)}')}$ 의 값을 구하세요.`,
                answer: { type: 'num', value: n / (2 * n + 1), display: 'frac' },
                steps: [`$\\frac{1}{(2k-1)(2k+1)}=\\frac{1}{2}\\left(\\frac{1}{2k-1}-\\frac{1}{2k+1}\\right)$`, `$\\frac{1}{2}\\left(1-\\frac{1}{${2 * n + 1}}\\right)=${new F(n, 2 * n + 1).tex()}$`],
              };
            }
            const v = new F(1, 2).mul(new F(3, 2).sub(new F(1, n + 1)).sub(new F(1, n + 2)));
            return {
              q: `$${sig(1, n, '\\frac{1}{k(k+2)}')}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v.value, display: 'frac' },
              steps: [`$\\frac{1}{k(k+2)}=\\frac{1}{2}\\left(\\frac{1}{k}-\\frac{1}{k+2}\\right)$`, `남는 항: $\\frac{1}{2}\\left(1+\\frac{1}{2}-\\frac{1}{${n + 1}}-\\frac{1}{${n + 2}}\\right)$`, `$=${v.tex()}$`],
            };
          }
          if (r.chance(0.5)) {
            const m = r.int(3, 12);
            const N = m * m - 1;
            return {
              q: `$${sig(1, N, '\\frac{1}{\\sqrt{k+1}+\\sqrt{k}}')}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: m - 1 },
              steps: [`유리화: $\\frac{1}{\\sqrt{k+1}+\\sqrt{k}}=\\sqrt{k+1}-\\sqrt{k}$`, `$(\\sqrt{2}-1)+(\\sqrt{3}-\\sqrt{2})+\\cdots=\\sqrt{${N + 1}}-1=${m - 1}$`],
            };
          }
          const e = r.int(3, 7);
          const N = 2 ** e - 1;
          return {
            q: `$${sig(1, N, '\\log_{2}\\frac{k+1}{k}')}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: e },
            steps: [`$\\log_{2}\\left(\\frac{2}{1}\\times\\frac{3}{2}\\times\\cdots\\times\\frac{${N + 1}}{${N}}\\right)$`, `$=\\log_{2}${N + 1}=${e}$`],
          };
        },
      },
      {
        id: 'sigma-geometric',
        title: '$\\Sigma$ 와 등비수열',
        gen(r, level) {
          const n = r.int(3, 8);
          if (level === 1) {
            const c = r.int(1, 5),
              rr = r.pick([2, 3]);
            const v = (c * (rr ** n - 1)) / (rr - 1);
            return {
              q: `$${sig(1, n, `${c === 1 ? '' : c + '\\times '}${rr}^{k-1}`)}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v },
              steps: [`첫째항 $${c}$, 공비 $${rr}$, 항 $${n}$ 개인 등비수열의 합`, `$\\frac{${c}(${rr}^{${n}}-1)}{${rr}-1}=${v}$`],
            };
          }
          if (level === 2) {
            const a = r.nonzero(-3, 3);
            const v = 2 ** (n + 1) - 2 + a * sumK(n);
            return {
              q: `$${sig(1, n, `(2^{k}${a > 0 ? '+' : ''}${cv(a, 'k')})`)}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v },
              steps: [`$\\sum 2^{k}=\\frac{2(2^{${n}}-1)}{2-1}=${2 ** (n + 1) - 2}$`, `$${a}\\sum k=${a * sumK(n)}$`, `합: $${v}$`],
            };
          }
          const c = r.int(1, 3);
          const m = r.int(3, 6);
          const v = (c * c * (4 ** m - 1)) / 3;
          return {
            q: `수열 $\\{a_n\\}$ 의 첫째항부터 제$n$항까지의 합이 $S_n=${c === 1 ? '2^{n}-1' : `${c}(2^{n}-1)`}$ 일 때, $${sig(1, m, 'a_k^{2}')}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: v },
            steps: [`$a_n=S_n-S_{n-1}=${c === 1 ? '' : c + '\\times '}2^{n-1}$ ($a_1=S_1=${c}$ 도 성립)`, `$a_k^{2}=${c * c === 1 ? '' : c * c + '\\times '}4^{k-1}$`, `$\\frac{${c * c}(4^{${m}}-1)}{3}=${v}$`],
          };
        },
      },
      {
        id: 'sigma-expression',
        title: '합을 $\\Sigma$ 로 나타내기',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(1, 9),
              d = r.int(2, 5),
              m = r.int(8, 20);
            const l = a + (m - 1) * d;
            const body = (dd: number, cc: number) => `(${poly([dd, cc], 'k')})`;
            const right = sig(1, m, body(d, a - d));
            return {
              q: `다음 합을 $\\Sigma$ 를 사용하여 바르게 나타낸 것은?\n$$${a}+${a + d}+${a + 2 * d}+\\cdots+${l}$$`,
              answer: tch(r, right, [sig(1, m - 1, body(d, a - d)), sig(1, m + 1, body(d, a - d)), sig(1, m, body(d, a)), sig(1, m, body(a, d)), sig(1, l, body(d, a - d))]),
              steps: [`일반항 $a_k=${a}+(k-1)\\times${d}=${poly([d, a - d], 'k')}$`, `$${l}=${poly([d, a - d], 'k')}$ 에서 $k=${m}$`, `$${right}$`],
            };
          }
          if (level === 2) {
            const p = r.int(1, 3),
              m = r.int(8, 20);
            const right = sig(1, m, `k(k+${p})`);
            return {
              q: `다음 합을 $\\Sigma$ 를 사용하여 바르게 나타낸 것은?\n$$1\\times${1 + p}+2\\times${2 + p}+3\\times${3 + p}+\\cdots+${m}\\times${m + p}$$`,
              answer: tch(r, right, [sig(1, m, `k(k+${p + 1})`), sig(1, m + p, `k(k+${p})`), sig(1, m - 1, `k(k+${p})`), sig(1, m, `(k+${p})^{2}`), sig(1, m, `k^{2}+${p}`)]),
              steps: [`제$k$항은 $k\\times(k+${p})$`, `마지막 항이 $k=${m}$ 이므로 $${right}$`],
            };
          }
          const c = r.int(2, 5),
            rr = r.pick([2, 3]),
            m = r.int(5, 10);
          const right = sig(1, m, `${c}\\times${rr}^{k-1}`);
          return {
            q: `다음 합을 $\\Sigma$ 를 사용하여 바르게 나타낸 것은?\n$$${c}+${c * rr}+${c * rr * rr}+\\cdots+${c}\\times${rr}^{${m - 1}}$$`,
            answer: tch(r, right, [sig(1, m, `${c}\\times${rr}^{k}`), sig(1, m - 1, `${c}\\times${rr}^{k-1}`), sig(1, m + 1, `${c}\\times${rr}^{k-1}`), sig(1, m, `${rr}\\times${c}^{k-1}`), sig(0, m, `${c}\\times${rr}^{k}`)]),
            steps: [`첫째항 $${c}$, 공비 $${rr}$ 인 등비수열: 제$k$항 $${c}\\times${rr}^{k-1}$`, `마지막 항이 제$${m}$항이므로 $${right}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── alg-7 수학적 귀납법
  'alg-7': {
    concepts: [
      {
        title: '수열의 귀납적 정의',
        body: '첫째항과 이웃한 항 사이의 관계식으로 수열을 정의하는 것.\n- 예: $a_1=1$, $a_{n+1}=2a_n+1$ ($n=1, 2, 3, \\cdots$)\n- $n$ 에 $1, 2, 3, \\cdots$ 을 차례로 대입해 항을 구함',
      },
      {
        title: '등차·등비수열의 귀납적 정의',
        body: '- $a_{n+1}-a_n=d$ 또는 $2a_{n+1}=a_n+a_{n+2}$: 등차수열\n- $a_{n+1}=ra_n$ 또는 $a_{n+1}^{2}=a_na_{n+2}$: 등비수열\n- $a_{n+1}=a_n+f(n)$: $a_n=a_1+\\sum_{k=1}^{n-1}f(k)$',
      },
      {
        title: '수학적 귀납법',
        body: '자연수 $n$ 에 대한 명제 $p(n)$ 이 모든 자연수에서 성립함을 보이려면\n- (i) $n=1$ 일 때 성립\n- (ii) $n=k$ 일 때 성립한다고 가정하면 $n=k+1$ 일 때도 성립\n두 가지를 보이면 됩니다 (도미노처럼 연쇄적으로 성립).',
        example: { q: '$1+3+\\cdots+(2n-1)=n^{2}$ 에서 $n=k+1$ 일 때 좌변은?', a: '$k^{2}+(2k+1)=(k+1)^{2}$' },
      },
    ],
    skills: [
      {
        id: 'recursive-term',
        title: '귀납적으로 정의된 수열의 항',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(-5, 10);
            if (r.chance(0.5)) {
              const d = r.nonzero(-4, 6),
                k = r.int(8, 25);
              return {
                q: `$a_1=${a}$, $a_{n+1}=a_n${d > 0 ? '+' : ''}${d}$ ($n=1, 2, 3, \\cdots$) 로 정의된 수열 $\\{a_n\\}$ 에서 $a_{${k}}$ 의 값을 구하세요.`,
                answer: { type: 'num', value: a + (k - 1) * d },
                steps: [`첫째항 $${a}$, 공차 $${d}$ 인 등차수열`, `$a_{${k}}=${a}+${k - 1}\\times${paren(d)}=${a + (k - 1) * d}$`],
              };
            }
            const a1 = r.nonzero(-3, 5),
              rr = r.pick([2, 3, -2]),
              k = r.int(4, 7);
            return {
              q: `$a_1=${a1}$, $a_{n+1}=${rr}a_n$ ($n=1, 2, 3, \\cdots$) 로 정의된 수열 $\\{a_n\\}$ 에서 $a_{${k}}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: a1 * rr ** (k - 1) },
              steps: [`첫째항 $${a1}$, 공비 $${rr}$ 인 등비수열`, `$a_{${k}}=${a1}\\times(${rr})^{${k - 1}}=${a1 * rr ** (k - 1)}$`],
            };
          }
          if (level === 2) {
            const a1 = r.int(-3, 5);
            const k = r.int(4, 6);
            const seq = [a1];
            let rule: string;
            if (r.chance(0.5)) {
              const p = r.pick([2, 3, -2]),
                q = r.nonzero(-3, 3);
              rule = `a_{n+1}=${poly([p, q], 'a_n')}`;
              for (let i = 1; i < k; i++) seq.push(p * seq[i - 1] + q);
            } else {
              const c = r.int(1, 3),
                e = r.int(-2, 2);
              rule = `a_{n+1}=a_n+${e === 0 ? poly([c, e], 'n') : `(${poly([c, e], 'n')})`}`;
              for (let i = 1; i < k; i++) seq.push(seq[i - 1] + c * i + e);
            }
            return {
              q: `$a_1=${a1}$, $${rule}$ ($n=1, 2, 3, \\cdots$) 로 정의된 수열 $\\{a_n\\}$ 에서 $a_{${k}}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: seq[k - 1] },
              steps: [`$n=1, 2, \\cdots$ 를 차례로 대입`, seq.map((v, i) => `$a_{${i + 1}}=${v}$`).join(', ')],
            };
          }
          const a1 = r.int(3, 30);
          const c = r.pick([1, 3, 5]);
          const k = r.int(6, 10);
          const seq = [a1];
          for (let i = 1; i < k; i++) seq.push(seq[i - 1] % 2 === 0 ? seq[i - 1] / 2 : seq[i - 1] + c);
          return {
            q: `수열 $\\{a_n\\}$ 이 $a_1=${a1}$ 이고 모든 자연수 $n$ 에 대하여\n$$a_{n+1}=\\begin{cases}\\frac{a_n}{2} & (a_n\\text{이 짝수})\\\\ a_n+${c} & (a_n\\text{이 홀수})\\end{cases}$$\n를 만족시킬 때, $a_{${k}}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: seq[k - 1] },
            steps: [`차례로 구하면`, seq.map((v, i) => `$a_{${i + 1}}=${v}$`).join(', ')],
          };
        },
      },
      {
        id: 'recursive-type',
        title: '귀납적 정의와 수열의 종류',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(-5, 10),
              d = r.nonzero(-4, 6),
              k = r.int(8, 20);
            return {
              q: `$a_1=${a}$, $a_2=${a + d}$ 이고 $2a_{n+1}=a_n+a_{n+2}$ ($n=1, 2, 3, \\cdots$) 를 만족시키는 수열 $\\{a_n\\}$ 에서 $a_{${k}}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: a + (k - 1) * d },
              steps: [`$2a_{n+1}=a_n+a_{n+2}$ 이므로 등차수열, 공차 $${d}$`, `$a_{${k}}=${a}+${k - 1}\\times${paren(d)}=${a + (k - 1) * d}$`],
            };
          }
          if (level === 2) {
            const a = r.int(1, 5),
              rr = r.pick([2, 3]),
              k = r.int(5, 8);
            return {
              q: `모든 항이 양수인 수열 $\\{a_n\\}$ 이 $a_1=${a}$, $a_2=${a * rr}$ 이고 $a_{n+1}^{2}=a_na_{n+2}$ 를 만족시킬 때, $a_{${k}}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: a * rr ** (k - 1) },
              steps: [`$a_{n+1}^{2}=a_na_{n+2}$ 이므로 등비수열, 공비 $${rr}$`, `$a_{${k}}=${a}\\times${rr}^{${k - 1}}=${a * rr ** (k - 1)}$`],
            };
          }
          const a1 = r.int(-5, 5),
            k = r.int(8, 20);
          if (r.chance(0.5)) {
            const c = r.int(-3, 3);
            const v = a1 + (k - 1) * k + c * (k - 1);
            return {
              q: `$a_1=${a1}$, $a_{n+1}=a_n+${poly([2, c], 'n').replace(/^(.*)$/, '($1)')}$ ($n=1, 2, 3, \\cdots$) 로 정의된 수열에서 $a_{${k}}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v },
              steps: [`$a_{${k}}=a_1+\\sum_{i=1}^{${k - 1}}(${poly([2, c], 'i')})$`, `$=${a1}+2\\times${sumK(k - 1)}+${paren(c * (k - 1))}=${v}$`],
            };
          }
          const kk = r.int(5, 10);
          const v = a1 + 2 ** kk - 2;
          return {
            q: `$a_1=${a1}$, $a_{n+1}=a_n+2^{n}$ ($n=1, 2, 3, \\cdots$) 로 정의된 수열에서 $a_{${kk}}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: v },
            steps: [`$a_{${kk}}=a_1+\\sum_{i=1}^{${kk - 1}}2^{i}=${a1}+(2^{${kk}}-2)$`, `$=${v}$`],
          };
        },
      },
      {
        id: 'periodic',
        title: '규칙이 반복되는 수열',
        gen(r, level) {
          const p = r.nonzero(-6, 6);
          let q = r.nonzero(-6, 6);
          if (q === p) q += 1;
          const per = [p, q, q - p, -p, -q, p - q];
          const def = `a_1=${p}$, $a_2=${q}$, $a_{n+2}=a_{n+1}-a_n`;
          if (level === 1) {
            const k = r.int(4, 6);
            return {
              q: `$${def}$ ($n=1, 2, 3, \\cdots$) 로 정의된 수열에서 $a_{${k}}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: per[k - 1] },
              steps: [per.slice(0, k).map((v, i) => `$a_{${i + 1}}=${v}$`).join(', ')],
            };
          }
          if (level === 2) {
            if (r.chance(0.5)) {
              const a = r.pick([2, 3, -1, -2, 4]);
              const s = [new F(a)];
              for (let i = 1; i < 3; i++) s.push(new F(1).div(new F(1).sub(s[i - 1])));
              const k = r.int(20, 60);
              const v = s[(k - 1) % 3];
              return {
                q: `$a_1=${a}$, $a_{n+1}=\\frac{1}{1-a_n}$ ($n=1, 2, 3, \\cdots$) 로 정의된 수열에서 $a_{${k}}$ 의 값을 구하세요.`,
                answer: { type: 'num', value: v.value, display: 'frac' },
                steps: [`$a_1=${s[0].tex()}$, $a_2=${s[1].tex()}$, $a_3=${s[2].tex()}$, $a_4=${s[0].tex()}$ → 주기 3`, `$${k}=3\\times${Math.floor((k - 1) / 3)}+${((k - 1) % 3) + 1}$ 이므로 $a_{${k}}=a_{${((k - 1) % 3) + 1}}=${v.tex()}$`],
              };
            }
            const k = r.int(20, 100);
            return {
              q: `$${def}$ ($n=1, 2, 3, \\cdots$) 로 정의된 수열에서 $a_{${k}}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: per[(k - 1) % 6] },
              steps: [per.map((v, i) => `$a_{${i + 1}}=${v}$`).join(', ') + `, $a_7=${p}$ → 주기 6`, `$${k}=6\\times${Math.floor((k - 1) / 6)}+${((k - 1) % 6) + 1}$ 이므로 $a_{${k}}=a_{${((k - 1) % 6) + 1}}=${per[(k - 1) % 6]}$`],
            };
          }
          const K = r.int(20, 100);
          const rem = K % 6;
          const v = per.slice(0, rem).reduce((s, x) => s + x, 0);
          return {
            q: `$${def}$ ($n=1, 2, 3, \\cdots$) 로 정의된 수열에서 $${sig(1, K, 'a_k')}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: v },
            steps: [per.map((v2, i) => `$a_{${i + 1}}=${v2}$`).join(', ') + ' → 주기 6, 한 주기의 합 $0$', rem === 0 ? `$${K}=6\\times${K / 6}$ 이므로 합은 $0$` : `$${K}=6\\times${Math.floor(K / 6)}+${rem}$ 이므로 합은 $a_1+\\cdots+a_{${rem}}=${v}$`],
          };
        },
      },
      {
        id: 'induction-blank',
        title: '수학적 귀납법의 빈칸',
        gen(r, level) {
          const T: { stmt: string; prev: string; blank: string; wrongs: string[]; result: string; rw: string[] }[] = [
            { stmt: '1+3+5+\\cdots+(2n-1)=n^{2}', prev: 'k^{2}', blank: '2k+1', wrongs: ['2k-1', '2k+3', 'k+1', '2k'], result: '(k+1)^{2}', rw: ['k^{2}+1', '(k+2)^{2}', 'k(k+1)', '(2k+1)^{2}'] },
            { stmt: '1+2+3+\\cdots+n=\\frac{n(n+1)}{2}', prev: '\\frac{k(k+1)}{2}', blank: 'k+1', wrongs: ['k', 'k+2', '2k+1', 'k(k+1)'], result: '\\frac{(k+1)(k+2)}{2}', rw: ['\\frac{k(k+1)}{2}', '\\frac{(k+1)^{2}}{2}', '\\frac{(k+2)(k+3)}{2}', '\\frac{k(k+2)}{2}'] },
            { stmt: '1+2+2^{2}+\\cdots+2^{n-1}=2^{n}-1', prev: '2^{k}-1', blank: '2^{k}', wrongs: ['2^{k-1}', '2^{k+1}', '2k', 'k^{2}'], result: '2^{k+1}-1', rw: ['2^{k}-1', '2^{k+1}', '2^{k+1}+1', '2^{k}+1'] },
            { stmt: '1^{2}+2^{2}+\\cdots+n^{2}=\\frac{n(n+1)(2n+1)}{6}', prev: '\\frac{k(k+1)(2k+1)}{6}', blank: '(k+1)^{2}', wrongs: ['k^{2}', 'k+1', '2k+1', '(k+2)^{2}'], result: '\\frac{(k+1)(k+2)(2k+3)}{6}', rw: ['\\frac{k(k+1)(2k+1)}{6}', '\\frac{(k+1)(k+2)(2k+1)}{6}', '\\frac{(k+1)^{2}(2k+3)}{6}', '\\frac{(k+2)(k+3)(2k+5)}{6}'] },
            { stmt: '1\\cdot2+2\\cdot3+\\cdots+n(n+1)=\\frac{n(n+1)(n+2)}{3}', prev: '\\frac{k(k+1)(k+2)}{3}', blank: '(k+1)(k+2)', wrongs: ['k(k+1)', '(k+2)(k+3)', '(k+1)^{2}', 'k+1'], result: '\\frac{(k+1)(k+2)(k+3)}{3}', rw: ['\\frac{k(k+1)(k+2)}{3}', '\\frac{(k+1)^{2}(k+2)}{3}', '\\frac{(k+2)(k+3)(k+4)}{3}', '\\frac{(k+1)(k+2)}{3}'] },
            { stmt: '1^{3}+2^{3}+\\cdots+n^{3}=\\left\\{\\frac{n(n+1)}{2}\\right\\}^{2}', prev: '\\left\\{\\frac{k(k+1)}{2}\\right\\}^{2}', blank: '(k+1)^{3}', wrongs: ['k^{3}', '(k+1)^{2}', '3k+1', '(k+2)^{3}'], result: '\\left\\{\\frac{(k+1)(k+2)}{2}\\right\\}^{2}', rw: ['\\left\\{\\frac{k(k+1)}{2}\\right\\}^{2}', '\\left\\{\\frac{(k+1)^{2}}{2}\\right\\}^{2}', '\\frac{(k+1)(k+2)}{2}', '\\left\\{\\frac{(k+2)(k+3)}{2}\\right\\}^{2}'] },
          ];
          const t = r.pick(L(level, T.slice(0, 3), T.slice(3), T));
          const intro = `다음은 모든 자연수 $n$ 에 대하여 $${t.stmt}$ 가 성립함을 수학적 귀납법으로 증명한 것의 일부입니다.\n$n=k$ 일 때 성립한다고 가정하면, 양변에 (가) 를 더하여`;
          if (level < 3) {
            return {
              q: `${intro}\n$$${t.prev}+(\\text{가})$$\n가 $n=k+1$ 일 때의 우변과 같음을 보입니다. (가) 에 알맞은 식은?`,
              answer: tch(r, t.blank, t.wrongs),
              steps: [`$n=k+1$ 일 때 좌변에 새로 더해지는 항은 제$(k+1)$항`, `(가) $=${t.blank}$`],
            };
          }
          return {
            q: `${intro} 정리하면 $${t.prev}+${t.blank.startsWith('(') || !t.blank.includes('+') ? t.blank : `(${t.blank})`}=(\\text{나})$ 가 됩니다. (나) 에 알맞은 식은?`,
            answer: tch(r, t.result, t.rw),
            steps: [`(나) 는 원래 식의 우변에 $n=k+1$ 을 대입한 것과 같아야 함`, `(나) $=${t.result}$`],
          };
        },
      },
    ],
  },
};

function paren(n: number): string {
  return n < 0 ? `(${n})` : String(n);
}

// 활용(문장제) 유형 덧붙이기
for (const [u, sk] of Object.entries(ALG_WORD)) alg[u].skills.push(...sk);
for (const [u, h] of Object.entries(ALG_HARD)) {
  alg[u].skills.push(...h.skills);
  alg[u].top = [...(alg[u].top ?? []), ...h.top];
}
