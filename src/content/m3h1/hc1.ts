// 공통수학1: 다항식, 나머지정리, 인수분해, 복소수와 이차방정식, 이차함수, 여러 가지 방정식·부등식, 경우의 수, 행렬
import type { ContentMap } from '../../core/types';
import type { Rng } from '../../core/rng';
import { numChoices, poly, termsTex, linTex } from '../../core/tex';
import { F } from '../../core/frac';
import { nCr, nPr, factorial, factorize, gcd } from '../../core/nt';
import { NAMES, mc, tc, pmul, padd, pscale, peval, pdiv, fac, mat, neun } from './util';

/** 꼭짓점 꼴 a(x-p)^2+q */
const vtx = (a: number, p: number, q: number) => `${a === 1 ? '' : a === -1 ? '-' : a}${p === 0 ? 'x^2' : `${fac(1, -p)}^2`}${q === 0 ? '' : q > 0 ? '+' + q : q}`;
const cx = (a: number | F, b: number | F) =>
  termsTex([
    { c: a, v: '' },
    { c: b, v: 'i' },
  ]);
const P = (c: number[], v = 'x') => poly(c, v);
const roots3 = (r: Rng, lo: number, hi: number, distinct = true): number[] => {
  for (;;) {
    const xs = [r.int(lo, hi), r.int(lo, hi), r.int(lo, hi)];
    if (!distinct || new Set(xs).size === 3) return xs;
  }
};
const fromRoots = (rs: number[], k = 1) => rs.reduce((acc, x) => pmul(acc, [1, -x]), [k]);
const sameP = (p: number[], q: number[]) => p.length === q.length && p.every((x, i) => x === q[i]);
/** 식 보기: 전개가 정답과 같은 오답 제거 */
function exprChoices(r: Rng, right: { t: string; p: number[] }, wrongs: { t: string; p: number[] }[]) {
  const seen = [right.p];
  const ok: string[] = [];
  for (const w of wrongs) {
    if (seen.some((s) => sameP(s, w.p))) continue;
    seen.push(w.p);
    ok.push(w.t);
  }
  return mc(r, right.t, ok);
}
const M2 = (m: (number | string)[][]) => mat(m);
const matFields = (m: number[][]) => m.flatMap((row, i) => row.map((v, j) => ({ label: `(${i + 1},${j + 1}) 성분`, value: v })));
const mmul = (A: number[][], B: number[][]) => A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)));

export const hc1: ContentMap = {
  // ───────────────────────── 다항식의 연산 ─────────────────────────
  'hc1-1': {
    concepts: [
      {
        title: '다항식의 덧셈과 뺄셈',
        body: '다항식은 보통 한 문자에 대해 **내림차순**으로 정리한다. 동류항끼리 모아 계산하며, 교환·결합법칙이 성립한다.\n- $A-B$ 는 $B$ 의 각 항의 부호를 바꾸어 더한다.\n- 중3의 동류항 계산을 확장한 것이다.',
      },
      {
        title: '곱셈 공식',
        body: '- $(a+b)^3=a^3+3a^2b+3ab^2+b^3$\n- $(a+b)(a^2-ab+b^2)=a^3+b^3$, $(a-b)(a^2+ab+b^2)=a^3-b^3$\n- $(a+b+c)^2=a^2+b^2+c^2+2ab+2bc+2ca$\n- $(x^2+x+1)(x^2-x+1)=x^4+x^2+1$',
      },
      {
        title: '곱셈 공식의 변형',
        body: '- $a^2+b^2=(a+b)^2-2ab$\n- $a^3+b^3=(a+b)^3-3ab(a+b)$\n- $x^2+\\frac{1}{x^2}=\\left(x+\\frac{1}{x}\\right)^2-2$, $x^3+\\frac{1}{x^3}=\\left(x+\\frac{1}{x}\\right)^3-3\\left(x+\\frac{1}{x}\\right)$',
        example: { q: '$a+b=3$, $ab=1$ 일 때 $a^3+b^3$', a: '$27-3\\times1\\times3=18$' },
      },
      {
        title: '다항식의 나눗셈',
        body: '$A$ 를 $B$ 로 나눈 몫을 $Q$, 나머지를 $R$ 이라 하면\n$$A=BQ+R\\quad(R\\text{ 의 차수}<B\\text{ 의 차수})$$\n일차식으로 나누면 나머지는 상수, 이차식으로 나누면 나머지는 일차 이하.',
      },
    ],
    skills: [
      {
        id: 'add-sub',
        title: '다항식의 덧셈과 뺄셈',
        gen(r, level) {
          const rnd = () => [r.int(1, 4) * r.sign(), r.int(-6, 6), r.int(-8, 8)];
          const A = rnd(),
            B = rnd();
          if (level === 3) {
            const X = rnd();
            const Bq = padd(A, pscale(X, -2));
            return {
              q: `두 다항식 $A=${P(A)}$, $B=${P(Bq)}$ 에 대하여 $A-2X=B$ 를 만족하는 다항식 $X$ 는?`,
              answer: exprChoices(r, { t: P(X), p: X }, [
                { t: P(pscale(X, -1)), p: pscale(X, -1) },
                { t: P(padd(A, Bq)), p: padd(A, Bq) },
                { t: P(padd(A, pscale(Bq, -1))), p: padd(A, pscale(Bq, -1)) },
                { t: P([X[0], -X[1], X[2]]), p: [X[0], -X[1], X[2]] },
                { t: P([X[0], X[1], -X[2]]), p: [X[0], X[1], -X[2]] },
              ]),
              steps: ['$2X=A-B$ 이므로 $X=\\frac{1}{2}(A-B)$', `$A-B=${P(padd(A, pscale(Bq, -1)))}$`, `$X=${P(X)}$`],
            };
          }
          const p = level === 1 ? 1 : r.int(2, 3),
            q = level === 1 ? r.sign() : -r.int(2, 3);
          const res = padd(pscale(A, p), pscale(B, q));
          const expr = level === 1 ? `A${q > 0 ? '+' : '-'}B` : `${p}A${q}B`;
          return {
            q: `두 다항식 $A=${P(A)}$, $B=${P(B)}$ 에 대하여 $${expr}$ 를 계산하면?`,
            answer: exprChoices(r, { t: P(res), p: res }, [
              { t: P(padd(pscale(A, p), pscale(B, -q))), p: padd(pscale(A, p), pscale(B, -q)) },
              { t: P(padd(pscale(A, p), [B[0] * q, -B[1] * q, -B[2] * q])), p: padd(pscale(A, p), [B[0] * q, -B[1] * q, -B[2] * q]) },
              { t: P(padd(A, pscale(B, q))), p: padd(A, pscale(B, q)) },
              { t: P(padd(res, [0, 0, 2])), p: padd(res, [0, 0, 2]) },
              { t: P(padd(res, [0, 1, 0])), p: padd(res, [0, 1, 0]) },
            ]),
            steps: [`$${expr}=${p === 1 ? '' : p}(${P(A)})${q > 0 ? '+' : '-'}${Math.abs(q) === 1 ? '' : Math.abs(q)}(${P(B)})$`, `동류항끼리 정리하면 $${P(res)}$`],
          };
        },
      },
      {
        id: 'mul-coef',
        title: '전개식의 계수',
        gen(r, level) {
          if (level === 1) {
            const a = r.nonzero(-5, 5),
              b = r.nonzero(-6, 6),
              c = r.nonzero(-5, 5);
            const prod = pmul([1, a, b], [1, c]);
            return {
              q: `$(${P([1, a, b])})(${P([1, c])})$ 의 전개식에서 $x$ 의 계수를 구하세요.`,
              answer: { type: 'num', value: prod[2] },
              steps: [`$x$ 항이 나오는 곱: $${termsTex([{ c: a, v: 'x' }])}\\times${c < 0 ? `(${c})` : c}$ 와 $${b < 0 ? `(${b})` : b}\\times x$`, `$${a * c}+${b < 0 ? `(${b})` : b}=${prod[2]}$`],
            };
          }
          if (level === 2) {
            const a = r.nonzero(-4, 4),
              b = r.nonzero(-5, 5),
              c = r.nonzero(-4, 4),
              d = r.nonzero(-5, 5);
            const prod = pmul([1, a, b], [1, c, d]);
            return {
              q: `$(${P([1, a, b])})(${P([1, c, d])})$ 의 전개식에서 $x^2$ 의 계수는?`,
              answer: numChoices(r, prod[2], [a * c, b + d, a * c - b - d, prod[1], prod[3]]),
              steps: [`$x^2$ 항: $x^2\\times${d < 0 ? `(${d})` : d}$, $(${termsTex([{ c: a, v: 'x' }])})\\times(${termsTex([{ c: c, v: 'x' }])})$, $${b < 0 ? `(${b})` : b}\\times x^2$`, `$${d}+${a * c < 0 ? `(${a * c})` : a * c}+${b < 0 ? `(${b})` : b}=${prod[2]}$`],
            };
          }
          const c = r.nonzero(-4, 4),
            b = r.nonzero(-5, 5),
            a = r.nonzero(-6, 6);
          const k = a + c; // x² 계수 of (x²+ax+b)(x+c)
          const xk = a * c + b;
          return {
            q: `$(x^2+ax${b > 0 ? '+' : ''}${b})(${P([1, c])})$ 의 전개식에서 $x^2$ 의 계수가 $${k}$ 일 때, 상수 $a$ 의 값과 $x$ 의 계수를 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'a', value: a }, { label: 'x 의 계수', value: xk }] },
            steps: [`$x^2$ 의 계수: $${c}+a=${k}$ 에서 $a=${a}$`, `$x$ 의 계수: $a\\times${c < 0 ? `(${c})` : c}+${b < 0 ? `(${b})` : b}=${xk}$`],
          };
        },
      },
      {
        id: 'formula-value',
        title: '곱셈 공식의 변형',
        gen(r, level) {
          // x, y 가 실수가 되도록: x+y=s, xy=p 이면 s²-4p ≥ 0 (x-y=s 이면 s²+4p ≥ 0)
          const minus = level === 2 && r.chance(0.5);
          let s = 0,
            p = 0;
          do {
            s = r.nonzero(-6, 6);
            p = r.nonzero(-6, 6);
          } while (minus ? s * s + 4 * p < 0 : s * s - 4 * p < 0);
          if (level === 1) {
            return {
              q: `$x+y=${s}$, $xy=${p}$ 일 때, $x^2+y^2$ 의 값을 구하세요.`,
              answer: { type: 'num', value: s * s - 2 * p },
              steps: ['$x^2+y^2=(x+y)^2-2xy$', `$=${s * s}-2\\times(${p})=${s * s - 2 * p}$`],
            };
          }
          if (level === 2) {
            const v = s ** 3 - 3 * p * s;
            if (minus) {
              const vm = s ** 3 + 3 * p * s; // x-y = s, xy = p → x³-y³ = s³+3ps
              return {
                q: `$x-y=${s}$, $xy=${p}$ 일 때, $x^3-y^3$ 의 값은?`,
                answer: numChoices(r, vm, [s ** 3 - 3 * p * s, s ** 3, s ** 3 + p * s, s * s + 2 * p]),
                steps: ['$x^3-y^3=(x-y)^3+3xy(x-y)$', `$=${s ** 3}+3\\times(${p})\\times(${s})=${vm}$`],
              };
            }
            return {
              q: `$x+y=${s}$, $xy=${p}$ 일 때, $x^3+y^3$ 의 값은?`,
              answer: numChoices(r, v, [s ** 3 + 3 * p * s, s ** 3, s ** 3 - p * s, s * s - 2 * p]),
              steps: ['$x^3+y^3=(x+y)^3-3xy(x+y)$', `$=${s ** 3}-3\\times(${p})\\times(${s})=${v}$`],
            };
          }
          const k = r.int(2, 6) * r.sign();
          if (r.chance(0.5)) {
            return {
              q: `$x+\\frac{1}{x}=${k}$ 일 때, $x^3+\\frac{1}{x^3}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: k ** 3 - 3 * k },
              steps: ['$x^3+\\frac{1}{x^3}=\\left(x+\\frac{1}{x}\\right)^3-3\\left(x+\\frac{1}{x}\\right)$', `$=${k ** 3}-3\\times(${k})=${k ** 3 - 3 * k}$`],
            };
          }
          return {
            q: `$x-\\frac{1}{x}=${k}$ 일 때, $x^2+\\frac{1}{x^2}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: k * k + 2 },
            steps: ['$x^2+\\frac{1}{x^2}=\\left(x-\\frac{1}{x}\\right)^2+2$', `$=${k * k}+2=${k * k + 2}$`],
          };
        },
      },
      {
        id: 'division',
        title: '다항식의 나눗셈',
        gen(r, level) {
          if (level === 1) {
            const a = r.nonzero(-3, 3);
            const Q = [r.int(1, 3), r.int(-5, 5), r.int(-5, 5)];
            const R = r.int(-9, 9);
            const A = padd(pmul(Q, [1, -a]), [R]);
            const show = (q: number[], rr: number) => `\\text{몫: }${P(q)},\\ \\text{나머지: }${rr}`;
            return {
              q: `다항식 $${P(A)}$ 를 $${P([1, -a])}$ 로 나눈 몫과 나머지는?`,
              answer: mc(r, show(Q, R), [show(Q, -R), show(pdiv(A, [1, a]).q, peval(A, -a)), show([Q[0], Q[1], Q[2] + 1], R - a), show([Q[0], -Q[1], Q[2]], R), show(Q, R + 2)]),
              steps: [`직접 나누거나 조립제법을 이용합니다.`, `$${P(A)}=(${P([1, -a])})(${P(Q)})${R === 0 ? '' : R > 0 ? '+' + R : R}$`, `몫 $${P(Q)}$, 나머지 $${R}$`],
            };
          }
          const B = [1, r.int(-3, 3), r.nonzero(-4, 4)];
          const Q = [r.int(1, 2), r.int(-4, 4)];
          const R = [r.nonzero(-6, 6), r.int(-7, 7)];
          const A = padd(pmul(B, Q), R);
          if (level === 2) {
            return {
              q: `다항식 $${P(A)}$ 를 $${P(B)}$ 로 나눈 나머지를 $ax+b$ 라 할 때, $a$, $b$ 의 값을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'a', value: R[0] }, { label: 'b', value: R[1] }] },
              steps: [`나누면 몫은 $${P(Q)}$`, `$${P(A)}=(${P(B)})(${P(Q)})${R[1] === 0 && Math.abs(R[0]) === 1 ? (R[0] > 0 ? '+x' : '-x') : `+(${P(R)})`}$`, `$a=${R[0]}$, $b=${R[1]}$`],
            };
          }
          return {
            q: `다항식 $P(x)$ 를 $${P(B)}$ 로 나눈 몫이 $${P(Q)}$, 나머지가 $${P(R)}$ 일 때, $P(x)$ 의 $x$ 의 계수와 상수항을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'x 의 계수', value: A[2] }, { label: '상수항', value: A[3] }] },
            steps: [`$P(x)=(${P(B)})(${P(Q)})+(${P(R)})$`, `$=${P(A)}$`, `$x$ 의 계수 $${A[2]}$, 상수항 $${A[3]}$`],
          };
        },
      },
      {
        id: 'expand3',
        title: '세제곱 곱셈 공식',
        gen(r, level) {
          const a = r.nonzero(-5, 5);
          if (level === 1) {
            const right = [1, 3 * a, 3 * a * a, a ** 3];
            return {
              q: `$(${P([1, a])})^3$ 을 전개하면?`,
              answer: exprChoices(r, { t: P(right), p: right }, [
                { t: P([1, 0, 0, a ** 3]), p: [1, 0, 0, a ** 3] },
                { t: P([1, a, a * a, a ** 3]), p: [1, a, a * a, a ** 3] },
                { t: P([1, 3 * a, 3 * a * a, -(a ** 3)]), p: [1, 3 * a, 3 * a * a, -(a ** 3)] },
                { t: P([1, -3 * a, 3 * a * a, a ** 3]), p: [1, -3 * a, 3 * a * a, a ** 3] },
                { t: P([1, 3 * a, 3 * a, a ** 3]), p: [1, 3 * a, 3 * a, a ** 3] },
              ]),
              steps: ['$(a+b)^3=a^3+3a^2b+3ab^2+b^3$', `$=${P(right)}$`],
            };
          }
          if (level === 2) {
            const k = r.int(1, 3);
            const right = [k ** 3, 0, 0, a ** 3];
            const fac1 = P([k, a]);
            const fac2 = P([k * k, -k * a, a * a]);
            return {
              q: `$(${fac1})(${fac2})$ 를 전개하면?`,
              answer: exprChoices(r, { t: P(right), p: right }, [
                { t: P([k ** 3, 0, 0, -(a ** 3)]), p: [k ** 3, 0, 0, -(a ** 3)] },
                { t: P([k ** 3, 3 * k * k * a, 3 * k * a * a, a ** 3]), p: [k ** 3, 3 * k * k * a, 3 * k * a * a, a ** 3] },
                { t: P([k ** 3, -2 * k * k * a, 0, a ** 3]), p: [k ** 3, -2 * k * k * a, 0, a ** 3] },
                { t: P([k, 0, 0, a ** 3]), p: [k, 0, 0, a ** 3] },
                { t: P([k ** 3, 0, 0, a * a]), p: [k ** 3, 0, 0, a * a] },
              ]),
              steps: [`$(A+B)(A^2-AB+B^2)=A^3+B^3$ 꼴 ($A=${k === 1 ? '' : k}x$, $B=${a}$)`, `$=${P(right)}$`],
            };
          }
          const p = r.int(1, 3),
            q = r.nonzero(-3, 3);
          const right = [1, 0, 2 * q - p * p, 0, q * q];
          return {
            q: `$(${P([1, p, q])})(${P([1, -p, q])})$ 를 전개하면?`,
            answer: exprChoices(r, { t: P(right), p: right }, [
              { t: P([1, 0, 2 * q + p * p, 0, q * q]), p: [1, 0, 2 * q + p * p, 0, q * q] },
              { t: P([1, 0, -p * p, 0, q * q]), p: [1, 0, -p * p, 0, q * q] },
              { t: P([1, 0, 2 * q - p * p, 0, -q * q]), p: [1, 0, 2 * q - p * p, 0, -q * q] },
              { t: P([1, 2 * p, 2 * q - p * p, 0, q * q]), p: [1, 2 * p, 2 * q - p * p, 0, q * q] },
              { t: P([1, 0, q - p * p, 0, q * q]), p: [1, 0, q - p * p, 0, q * q] },
            ]),
            steps: [`$x^2${q > 0 ? '+' : ''}${q}=A$ 로 놓으면 $(A+${p === 1 ? '' : p}x)(A-${p === 1 ? '' : p}x)=A^2-${p * p === 1 ? '' : p * p}x^2$`, `$=(x^2${q > 0 ? '+' : ''}${q})^2-${p * p === 1 ? '' : p * p}x^2=${P(right)}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 항등식과 나머지정리 ─────────────────────────
  'hc1-2': {
    concepts: [
      {
        title: '항등식',
        body: '문자에 어떤 값을 대입해도 항상 성립하는 등식. $ax^2+bx+c=0$ 이 $x$ 에 대한 항등식이면 $a=b=c=0$\n- $ax^2+bx+c=a\'x^2+b\'x+c\'$ 가 항등식 $\\iff a=a\',\\ b=b\',\\ c=c\'$\n- 미정계수법: **계수비교법**(같은 차수의 계수 비교), **수치대입법**(편한 값을 대입)',
      },
      {
        title: '나머지정리',
        body: '다항식 $P(x)$ 를 $x-a$ 로 나눈 나머지는 $P(a)$\n- $ax+b$ 로 나눈 나머지는 $P\\left(-\\frac{b}{a}\\right)$\n- $P(x)=(x-a)Q(x)+R$ 에 $x=a$ 를 대입하면 $R=P(a)$',
        example: { q: '$x^3-2x+1$ 을 $x-2$ 로 나눈 나머지', a: '$P(2)=8-4+1=5$' },
      },
      {
        title: '인수정리',
        body: '$P(a)=0$ 이면 $P(x)$ 는 $x-a$ 로 나누어떨어진다 ($x-a$ 가 인수). 역도 성립.',
      },
      {
        title: '조립제법',
        body: '$x-a$ 로 나눌 때 계수만 써서 몫과 나머지를 빠르게 구하는 방법. 계수를 차례로 쓰고, 내려 쓴 수에 $a$ 를 곱해 다음 계수에 더하기를 반복한다. 마지막 수가 나머지, 앞의 수들이 몫의 계수.\n- 빠진 차수의 계수는 $0$ 으로 써야 한다.',
      },
    ],
    skills: [
      {
        id: 'identity',
        title: '항등식과 미정계수',
        gen(r, level) {
          if (level === 1) {
            const p = r.int(-6, 6),
              q = r.int(-6, 6);
            return {
              q: `등식 $(a${p > 0 ? '-' + p : p < 0 ? '+' + -p : ''})x+(b${q > 0 ? '+' + q : q < 0 ? '-' + -q : ''})=0$ 이 $x$ 에 대한 항등식일 때, 상수 $a$, $b$ 의 값을 구하세요.`.replace('(a)', 'a').replace('(b)', 'b'),
              answer: { type: 'fields', fields: [{ label: 'a', value: p }, { label: 'b', value: -q }] },
              steps: ['항등식이면 각 계수가 $0$', `$a${p > 0 ? '-' + p : p < 0 ? '+' + -p : ''}=0$, $b${q > 0 ? '+' + q : q < 0 ? '-' + -q : ''}=0$`.replace('$a=0$', '$a=0$'), `$a=${p}$, $b=${-q}$`],
            };
          }
          if (level === 2) {
            const a = r.int(1, 3) * r.sign(),
              b = r.int(-5, 5),
              c = r.int(-6, 6);
            // a(x-1)^2 + b(x-1) + c
            const Pq = padd(padd(pscale([1, -2, 1], a), pscale([0, 1, -1], b)), [0, 0, c]);
            return {
              q: `등식 $${P(Pq)}=a(x-1)^2+b(x-1)+c$ 가 $x$ 에 대한 항등식일 때, 상수 $a$, $b$, $c$ 의 값을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'a', value: a }, { label: 'b', value: b }, { label: 'c', value: c }] },
              steps: [`$x=1$ 대입: $c=${peval(Pq, 1)}$`, `$x^2$ 의 계수 비교: $a=${a}$`, `$x=0$ 대입: $${Pq[2]}=a-b+c$ 에서 $b=${b}$`],
            };
          }
          const p = r.nonzero(-3, 3);
          const a = r.int(-4, 4),
            b = r.nonzero(-5, 5);
          const R = pmul([1, p], [1, a, b]);
          return {
            q: `등식 $(${P([1, p])})(x^2+ax+b)=${P(R)}$ 가 $x$ 에 대한 항등식일 때, 상수 $a$, $b$ 의 값을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'a', value: a }, { label: 'b', value: b }] },
            steps: [`좌변을 전개하면 $x^3+(a${p > 0 ? '+' : ''}${p})x^2+(${p === 1 ? '' : p === -1 ? '-' : p}a+b)x${p > 0 ? '+' : '-'}${Math.abs(p) === 1 ? '' : Math.abs(p)}b$`, `상수항 비교: $${termsTex([{ c: p, v: 'b' }])}=${R[3]}$ 에서 $b=${b}$`, `$x^2$ 의 계수 비교: $a+${p < 0 ? `(${p})` : p}=${R[1]}$ 에서 $a=${a}$`],
          };
        },
      },
      {
        id: 'remainder',
        title: '나머지정리',
        gen(r, level) {
          const A = [r.int(1, 3), r.int(-4, 4), r.int(-5, 5), r.int(-6, 6)];
          if (level === 1) {
            const a = r.nonzero(-3, 3);
            return {
              q: `다항식 $P(x)=${P(A)}$ 를 $${P([1, -a])}$ 로 나눈 나머지를 구하세요.`,
              answer: { type: 'num', value: peval(A, a) },
              steps: [`나머지정리에 의해 나머지는 $P(${a})$`, `$P(${a})=${peval(A, a)}$`],
            };
          }
          if (level === 2) {
            const d = r.pick([2, 3]),
              n = r.nonzero(-2, 2);
            if (gcd(d, Math.abs(n)) !== 1) return this.gen(r, level);
            const x = new F(n, d);
            const v = F.of(A[0]).mul(x.pow(3)).add(F.of(A[1]).mul(x.pow(2))).add(F.of(A[2]).mul(x)).add(A[3]);
            return {
              q: `다항식 $P(x)=${P(A)}$ 를 $${P([d, -n])}$ 로 나눈 나머지는?`,
              answer: numChoices(r, v.value, [peval(A, n), peval(A, -n), v.neg().value, peval(A, d), v.value + 1].filter((t) => Number.isFinite(t)), 5, 'frac'),
              steps: [`$${P([d, -n])}=0$ 이 되는 $x=${x.tex()}$ 를 대입`, `나머지 $=P\\left(${x.tex()}\\right)=${v.tex()}$`],
            };
          }
          const r1 = r.int(-6, 6),
            r2 = r.int(-6, 6);
          const a = r.int(-2, 1),
            b = a + r.int(1, 3);
          // R(x) = px + q, R(a)=r1, R(b)=r2
          const p = new F(r2 - r1, b - a);
          const q = F.of(r1).sub(p.mul(a));
          if (!p.isInt()) return this.gen(r, level);
          return {
            q: `다항식 $P(x)$ 를 $${P([1, -a])}$ 로 나눈 나머지가 $${r1}$, $${P([1, -b])}$ 로 나눈 나머지가 $${r2}$ 일 때, $P(x)$ 를 $(${P([1, -a])})(${P([1, -b])})$ 로 나눈 나머지를 $px+q$ 라 하자. $p$, $q$ 의 값을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'p', value: p.value }, { label: 'q', value: q.value }] },
            steps: [`$P(x)=(${P([1, -a])})(${P([1, -b])})Q(x)+px+q$`, `$P(${a})=${termsTex([{ c: a, v: 'p' }, { c: 1, v: 'q' }])}=${r1}$, $P(${b})=${termsTex([{ c: b, v: 'p' }, { c: 1, v: 'q' }])}=${r2}$`, `연립하면 $p=${p.tex()}$, $q=${q.tex()}$`],
          };
        },
      },
      {
        id: 'factor-thm',
        title: '인수정리',
        gen(r, level) {
          if (level === 1) {
            const a = r.nonzero(-3, 3);
            const c1 = r.int(1, 2),
              c3 = r.int(-6, 6);
            const k = -(c1 * a ** 3 + -4 * a + c3) / (a * a);
            if (!Number.isInteger(k)) return this.gen(r, level);
            const A = [c1, k, -4, c3];
            return {
              q: `다항식 $${termsTex([{ c: c1, v: 'x^{3}' }, { c: 1, v: 'kx^{2}' }, { c: -4, v: 'x' }, { c: c3, v: '' }])}$ 이 $${P([1, -a])}$ 로 나누어떨어질 때, 상수 $k$ 의 값을 구하세요.`,
              answer: { type: 'num', value: k },
              steps: [`인수정리: $P(${a})=0$`, `$${termsTex([{ c: a * a, v: 'k' }, { c: c1 * a ** 3 - 4 * a + c3, v: '' }])}=0$`, `$k=${k}$ (확인: $P(x)=${P(A)}$)`],
            };
          }
          if (level === 2) {
            const a = r.nonzero(-3, 3);
            const rem = r.int(-8, 8);
            const b = r.int(-4, 4),
              c = r.int(-6, 6);
            // x^3 + b x^2 + kx + c, P(a) = rem
            const k = (rem - (a ** 3 + b * a * a + c)) / a;
            if (!Number.isInteger(k)) return this.gen(r, level);
            return {
              q: `다항식 $P(x)=${termsTex([{ c: 1, v: 'x^{3}' }, { c: b, v: 'x^{2}' }, { c: 1, v: 'kx' }, { c: c, v: '' }])}$ 를 $${P([1, -a])}$ 로 나눈 나머지가 $${rem}$ 일 때, 상수 $k$ 의 값은?`,
              answer: numChoices(r, k, [-k, k + 1, k - 2, (rem + a ** 3 + b * a * a + c) / a].filter((t) => Number.isInteger(t))),
              steps: [`$P(${a})=${rem}$`, `$${termsTex([{ c: a, v: 'k' }, { c: a ** 3 + b * a * a + c, v: '' }])}=${rem}$`, `$k=${k}$`],
            };
          }
          const p = r.nonzero(-3, 3);
          let q = r.nonzero(-3, 3);
          if (q === p) q = -p;
          const s = r.nonzero(-4, 4);
          const A = fromRoots([p, q, s]);
          return {
            q: `다항식 $${termsTex([{ c: 1, v: 'x^{3}' }, { c: A[1], v: 'x^{2}' }, { c: 1, v: 'ax' }, { c: 1, v: 'b' }])}$ 가 $(${P([1, -p])})(${P([1, -q])})$ 로 나누어떨어질 때, 상수 $a$, $b$ 의 값을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'a', value: A[2] }, { label: 'b', value: A[3] }] },
            steps: [`$P(${p})=0$, $P(${q})=0$ 을 연립합니다.`, `(또는) $P(x)=(${P([1, -p])})(${P([1, -q])})(x+c)$ 로 놓고 $x^2$ 의 계수를 비교하면 $c=${-s}$`, `$P(x)=${P(A)}$ 이므로 $a=${A[2]}$, $b=${A[3]}$`],
          };
        },
      },
      {
        id: 'synthetic',
        title: '조립제법',
        gen(r, level) {
          let a: number, Q: number[], R: number, A: number[], div: number[];
          if (level === 3) {
            const n = r.nonzero(-3, 3);
            Q = [r.int(1, 3), r.int(-4, 4), r.int(-5, 5)];
            R = r.int(-6, 6);
            div = [2, -n];
            A = padd(pmul(Q, div), [R]);
            a = n;
            const Q2 = Q.map((c) => c * 2);
            return {
              q: `조립제법을 이용하여 다항식 $${P(A)}$ 를 $${P(div)}$ 로 나누었을 때의 몫을 $ax^2+bx+c$, 나머지를 $R$ 이라 하자. $a$, $b$, $c$, $R$ 의 값을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'a', value: Q[0] }, { label: 'b', value: Q[1] }, { label: 'c', value: Q[2] }, { label: 'R', value: R }] },
              steps: [
                `$x=${new F(n, 2).tex()}$ 로 조립제법을 하면 몫 $${P(Q2)}$, 나머지 $${R}$ ($${linTex(1, new F(-n, 2))}$ 로 나눈 결과)`,
                `$${P(A)}=\\left(${linTex(1, new F(-n, 2))}\\right)(${P(Q2)})${R >= 0 ? '+' : ''}${R}=(${P(div)})(${P(Q)})${R >= 0 ? '+' : ''}${R}$`,
                `몫은 $2$ 로 나눈 $${P(Q)}$: $a=${Q[0]}$, $b=${Q[1]}$, $c=${Q[2]}$, $R=${R}$`,
              ],
            };
          }
          a = level === 1 ? r.int(1, 3) : r.int(-3, -1);
          Q = [r.int(1, 3), r.int(-5, 5), r.int(-5, 5)];
          R = r.int(-9, 9);
          A = padd(pmul(Q, [1, -a]), [R]);
          if (level === 2 && A[2] !== 0) {
            // 빠진 차수 만들기: x 항 0
            Q = [Q[0], Q[1], Q[1] * a];
            A = padd(pmul(Q, [1, -a]), [R]);
          }
          const row2 = [0, Q[0] * a, Q[1] * a, Q[2] * a];
          return {
            q: `조립제법을 이용하여 다항식 $${P(A)}$ 를 $${P([1, -a])}$ 로 나눈 몫을 $ax^2+bx+c$, 나머지를 $R$ 이라 하자. $a$, $b$, $c$, $R$ 의 값을 구하세요.`,
            table: [
              [`$${a}$`, ...A.map((c) => `$${c}$`)],
              ['', '', ...row2.slice(1).map((c) => `$${c}$`)],
              ['', ...Q.map((c) => `$${c}$`), `$${R}$`],
            ],
            answer: { type: 'fields', fields: [{ label: 'a', value: Q[0] }, { label: 'b', value: Q[1] }, { label: 'c', value: Q[2] }, { label: 'R', value: R }] },
            steps: [`계수 $${A.join(',\\ ')}$ ${level === 2 ? '(빠진 차수는 $0$)' : ''}를 쓰고 $${a}$ 를 곱해 더해 나갑니다.`, `마지막 줄: $${Q.join(',\\ ')}\\ |\\ ${R}$`, `$a=${Q[0]}$, $b=${Q[1]}$, $c=${Q[2]}$, $R=${R}$`],
            hint: '표의 셋째 줄이 결과예요. 마지막 수가 나머지입니다.',
          };
        },
      },
      {
        id: 'coef-sum',
        title: '항등식과 계수의 합',
        gen(r, level) {
          const base = [1, r.int(-3, 3), r.nonzero(-3, 3)];
          const n = level === 3 ? r.int(3, 5) : r.int(2, level === 1 ? 3 : 5);
          let pw = [1];
          for (let i = 0; i < n; i++) pw = pmul(pw, base);
          const deg = 2 * n;
          const at1 = peval(pw, 1),
            atm1 = peval(pw, -1);
          if (level === 1) {
            return {
              q: `$(${P(base)})^{${n}}=a_0+a_1x+a_2x^2+\\cdots+a_{${deg}}x^{${deg}}$ 이 $x$ 에 대한 항등식일 때, $a_0+a_1+a_2+\\cdots+a_{${deg}}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: at1 },
              steps: ['양변에 $x=1$ 을 대입합니다.', `$(${peval(base, 1)})^{${n}}=${at1}$`],
            };
          }
          if (level === 2) {
            return {
              q: `$(${P(base)})^{${n}}=a_0+a_1x+a_2x^2+\\cdots+a_{${deg}}x^{${deg}}$ 이 $x$ 에 대한 항등식일 때, $a_0-a_1+a_2-a_3+\\cdots+a_{${deg}}$ 의 값은?`,
              answer: numChoices(r, atm1, [at1, -atm1, (at1 + atm1) / 2, pw[deg]]),
              steps: ['양변에 $x=-1$ 을 대입합니다.', `$(${peval(base, -1)})^{${n}}=${atm1}$`],
            };
          }
          return {
            q: `$(${P(base)})^{${n}}=a_0+a_1x+a_2x^2+\\cdots+a_{${deg}}x^{${deg}}$ 이 $x$ 에 대한 항등식일 때, $a_0+a_2+a_4+\\cdots+a_{${deg}}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: (at1 + atm1) / 2 },
            steps: [`$x=1$: $a_0+a_1+\\cdots+a_{${deg}}=${at1}$`, `$x=-1$: $a_0-a_1+\\cdots+a_{${deg}}=${atm1}$`, `두 식을 더해 $2$ 로 나누면 $${(at1 + atm1) / 2}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 인수분해 ─────────────────────────
  'hc1-3': {
    concepts: [
      {
        title: '인수분해 공식',
        body: '- $a^3+3a^2b+3ab^2+b^3=(a+b)^3$\n- $a^3+b^3=(a+b)(a^2-ab+b^2)$, $a^3-b^3=(a-b)(a^2+ab+b^2)$\n- $a^2+b^2+c^2+2ab+2bc+2ca=(a+b+c)^2$\n중3의 인수분해 공식에 세제곱 공식을 더한 것이다.',
      },
      {
        title: '치환을 이용한 인수분해',
        body: '공통부분을 한 문자로 바꾸어 인수분해한다.\n- $(x^2+x)^2-8(x^2+x)+12$ 에서 $x^2+x=t$ → $(t-2)(t-6)$\n- 복이차식 $x^4+ax^2+b$: $x^2=t$ 로 치환하거나 $A^2-B^2$ 꼴로 만든다.',
      },
      {
        title: '인수정리를 이용한 인수분해',
        body: '삼차 이상의 다항식 $P(x)$ 는 $P(a)=0$ 인 $a$ 를 (상수항의 약수)/(최고차항 계수의 약수) 중에서 찾아 $x-a$ 로 묶고, 몫은 조립제법으로 구한다.',
        example: { q: '$x^3-6x^2+11x-6$', a: '$P(1)=0$ 이므로 $(x-1)(x^2-5x+6)=(x-1)(x-2)(x-3)$' },
      },
      {
        title: '여러 문자를 포함한 식',
        body: '- 차수가 가장 낮은 문자에 대해 내림차순으로 정리한다.\n- 적당히 묶어 $A^2-B^2$ 꼴을 만든다: $a^2-b^2+2bc-c^2=a^2-(b-c)^2$',
      },
    ],
    skills: [
      {
        id: 'cube',
        title: '세제곱 인수분해 공식',
        gen(r, level) {
          const k = level === 1 ? 1 : r.int(1, 3);
          const a = r.int(1, 4);
          if (level <= 2) {
            const plus = r.chance(0.5);
            const s = plus ? 1 : -1;
            if ((k === 1 && level === 2) || gcd(k, a) > 1) return this.gen(r, level);
            const A = [k ** 3, 0, 0, s * a ** 3];
            const l = P([k, s * a]);
            const qd = P([k * k, -s * k * a, a * a]);
            const right = `(${l})(${qd})`;
            return {
              q: `$${P(A)}$ 을 인수분해하면?`,
              answer: mc(r, right, [`(${P([k, -s * a])})(${P([k * k, s * k * a, a * a])})`, `(${l})(${P([k * k, s * k * a, a * a])})`, `(${l})^3`, `(${l})(${P([k * k, -s * 2 * k * a, a * a])})`, `(${P([k, s * a])})(${P([k, -s * a])})^2`]),
              steps: [`$${P(A)}=(${k === 1 ? 'x' : `${k}x`})^3${plus ? '+' : '-'}${a}^3$`, `$a^3${plus ? '+' : '-'}b^3=(a${plus ? '+' : '-'}b)(a^2${plus ? '-' : '+'}ab+b^2)$ 이므로 $${right}$`],
            };
          }
          const kk = r.int(1, 2);
          // (2x+2)^3 처럼 공통인수가 남지 않게 kk=2 이면 상수항을 홀수로
          const s = r.sign() * (kk === 2 && a % 2 === 0 ? a - 1 : a);
          const A = [kk ** 3, 3 * kk * kk * s, 3 * kk * s * s, s ** 3];
          const right = `(${P([kk, s])})^3`;
          return {
            q: `$${P(A)}$ 을 인수분해하면?`,
            answer: mc(r, right, [`(${P([kk, -s])})^3`, `(${P([kk, s])})^2(${P([kk, -s])})`, `(${P([kk, s])})(${P([kk * kk, -kk * s, s * s])})`, `(${P([kk, 3 * s])})^3`, `(${P([kk, s])})(${P([kk, -s])})^2`]),
            steps: ['$a^3+3a^2b+3ab^2+b^3=(a+b)^3$ 꼴인지 확인합니다.', `$=${right}$`],
          };
        },
      },
      {
        id: 'substitution',
        title: '치환을 이용한 인수분해',
        gen(r, level) {
          if (level === 1) {
            const c = r.nonzero(-3, 3),
              p = r.nonzero(-5, 5);
            let q = r.nonzero(-5, 5);
            if (q === p || q === -p) q = p > 0 ? p + 1 : p - 1;
            const t = `(${P([1, c])})`;
            const right = c + p === 0 || c + q === 0 ? `x(${P([1, c + p + c + q])})` : `(${P([1, c + p])})(${P([1, c + q])})`;
            return {
              q: `$${t}^2${p + q === 0 ? '' : (p + q > 0 ? '+' : '') + (Math.abs(p + q) === 1 ? (p + q > 0 ? '' : '-') : p + q) + t}${p * q > 0 ? '+' : ''}${p * q}$ 를 인수분해하면?`,
              answer: mc(r, right, [`(${P([1, c - p])})(${P([1, c - q])})`, `(${P([1, p])})(${P([1, q])})`, `(${P([1, c + p])})(${P([1, c - q])})`, `(${P([1, c * p])})(${P([1, c * q])})`].map((w) => w.replace(/^\(([^()]+)\)\(x\)$/, 'x($1)').replace(/^\(x\)\(([^()]+)\)$/, 'x($1)').replace(/\(x\)/g, 'x'))),
              steps: [`$${P([1, c])}=t$ 로 놓으면 $${P([1, p + q, p * q], 't')}=(${P([1, p], 't')})(${P([1, q], 't')})$`, `$t=${P([1, c])}$ 를 대입: $${right}$`],
            };
          }
          if (level === 2) {
            const ks = r.sample([1, 2, 3], 2).sort();
            const m1 = ks[0] * (ks[0] + 1),
              m2 = ks[1] * (ks[1] + 1);
            const fs = [
              [1, ks[0] + 1],
              [1, -ks[0]],
              [1, ks[1] + 1],
              [1, -ks[1]],
            ].sort((u, v) => v[1] - u[1]);
            const right = fs.map(([a, b]) => fac(a, b)).join('');
            return {
              q: `$(x^2+x)^2-${m1 + m2}(x^2+x)+${m1 * m2}$ 를 인수분해하면?`,
              answer: mc(r, right, [`(x^2+x-${m1})(x^2+x-${m2})`, fs.map(([a, b]) => fac(a, -b)).join(''), `(x^2+x+${m1})(x^2+x+${m2})`, `${fac(1, ks[0] + 1)}${fac(1, -ks[0])}(x^2+x+${m2})`]),
              steps: [`$x^2+x=t$ 로 놓으면 $t^2-${m1 + m2}t+${m1 * m2}=(t-${m1})(t-${m2})$`, `$(x^2+x-${m1})(x^2+x-${m2})$`, `각각 인수분해하면 $${right}$`],
            };
          }
          for (;;) {
            const m = r.nonzero(-4, 4) * (r.chance(0.7) ? 1 : 1),
              n = r.int(1, 4);
            const mid = 2 * m - n * n;
            if (mid === 0 || m * m === 0) continue;
            // t 로 치환해도 인수분해되면 다른 풀이도 가능하지만 결과는 같음 — 정수 계수 범위에서 더 쪼개지지 않게
            const disc = n * n - 4 * m;
            if (disc >= 0 && Number.isInteger(Math.sqrt(disc))) continue;
            const right = `(${P([1, n, m])})(${P([1, -n, m])})`;
            return {
              q: `$${P([1, 0, mid, 0, m * m])}$ 을 인수분해하면?`,
              answer: mc(r, right, [`(${P([1, 0, m])})^2`, `(${P([1, n, -m])})(${P([1, -n, -m])})`, `(${P([1, 2 * n, m])})(${P([1, -2 * n, m])})`, `(${P([1, n, m])})^2`, `(${P([1, 0, m + n])})(${P([1, 0, m - n])})`]),
              steps: [`$${P([1, 0, mid, 0, m * m])}=(x^2${m > 0 ? '+' : ''}${m})^2-${n * n === 1 ? '' : n * n}x^2$`, `$=(x^2${m > 0 ? '+' : ''}${m})^2-(${n === 1 ? '' : n}x)^2$`, `$=${right}$`],
              hint: '$A^2-B^2$ 꼴을 만들어 보세요.',
            };
          }
        },
      },
      {
        id: 'factor-cubic',
        title: '인수정리로 인수분해',
        gen(r, level) {
          if (level <= 2) {
            const rs = roots3(r, level === 1 ? -3 : -4, level === 1 ? 3 : 5);
            const A = fromRoots(rs);
            const srt = [...rs].sort((u, v) => v - u);
            const join3 = (c: number[]) => {
              const f = c.map((x) => fac(1, -x));
              return [...f.filter((t) => t === 'x'), ...f.filter((t) => t !== 'x')].join('');
            };
            const right = join3(srt);
            const cands: number[][] = [srt.map((x) => -x), [-srt[0], srt[1], srt[2]], [srt[0], -srt[1], srt[2]], [srt[0], srt[1], -srt[2]], [srt[0] + 1, srt[1], srt[2] - 1]];
            const wr = cands.filter((c) => !sameP(fromRoots(c), A)).map((c) => join3(c));
            const B2 = [1, srt[1] + srt[2], srt[1] * srt[2]];
            if (!sameP(pmul([1, -srt[0]], B2), A)) wr.push(`${fac(1, -srt[0])}(${P(B2)})`);
            return {
              q: `$${P(A)}$ 을 인수분해하면?`,
              answer: mc(r, right, wr),
              steps: [`$P(${rs[0]})=0$ 이므로 $${fac(1, -rs[0])}$ ${rs[0] === 0 ? '가' : '이'} 인수`, `조립제법으로 몫을 구하면 $${P(fromRoots(rs.slice(1)))}$`, `$=${right}$`],
            };
          }
          for (;;) {
            const a = r.nonzero(-3, 3);
            const p = r.int(-3, 3),
              q = r.int(1, 6);
            if (p * p - 4 * q >= 0) continue;
            const A = pmul([1, -a], [1, p, q]);
            const right = `${fac(1, -a)}(${P([1, p, q])})`;
            return {
              q: `$${P(A)}$ 을 인수분해하면? (계수는 정수 범위)`,
              answer: mc(r, right, [`${fac(1, a)}(${P([1, p, q])})`, `${fac(1, -a)}(${P([1, -p, q])})`, `${fac(1, a)}(${P([1, -p, q])})`, `${fac(1, -a)}(${P([1, p, -q])})`]),
              steps: [`$P(${a})=0$ 이므로 $${fac(1, -a)}$ 이 인수`, `조립제법으로 몫 $${P([1, p, q])}$ (더 이상 정수 범위에서 인수분해되지 않음)`, `$=${right}$`],
            };
          }
        },
      },
      {
        id: 'multi-var',
        title: '여러 문자를 포함한 식',
        gen(r, level) {
          if (level === 1) {
            const k = r.int(1, 5);
            const right = `(x-y)(x+y${k === 0 ? '' : '+' + k})`;
            return {
              q: `$x^2-y^2+${k === 1 ? '' : k}x-${k === 1 ? '' : k}y$ 를 인수분해하면?`,
              answer: mc(r, right, [`(x+y)(x-y+${k})`, `(x-y)(x+y-${k})`, `(x-y)(x-y+${k})`, `(x+y)(x+y+${k})`]),
              steps: [`$(x^2-y^2)+${k === 1 ? '' : k}(x-y)=(x-y)(x+y)+${k === 1 ? '' : k}(x-y)$`, `$=${right}$`],
            };
          }
          if (level === 2) {
            const p = r.int(1, 3),
              q = r.int(1, 4);
            const yy = p === 1 ? 'y' : `${p}y`;
            const zz = q === 1 ? 'z' : `${q}z`;
            const right = `(x+${yy}+${zz})(x+${yy}-${zz})`;
            return {
              q: `$${termsTex([{ c: 1, v: 'x^{2}' }, { c: 2 * p, v: 'xy' }, { c: p * p, v: 'y^{2}' }, { c: -q * q, v: 'z^{2}' }])}$ 을 인수분해하면?`,
              answer: mc(r, right, [`(x+${yy}+${zz})^2`, `(x-${yy}+${zz})(x-${yy}-${zz})`, `(x+${yy}+${zz})(x-${yy}-${zz})`, `(x+${zz}+${yy})(x+${zz}-${yy})`]),
              steps: [`$=(x+${yy})^2-(${zz})^2$`, `$=${right}$`],
            };
          }
          const k = r.int(1, 4);
          const right = `(a+b-${k === 1 ? '' : k}c)(a-b+${k === 1 ? '' : k}c)`;
          return {
            q: `$${termsTex([{ c: 1, v: 'a^{2}' }, { c: -1, v: 'b^{2}' }, { c: 2 * k, v: 'bc' }, { c: -k * k, v: 'c^{2}' }])}$ 을 인수분해하면?`,
            answer: mc(r, right, [`(a+b+${k === 1 ? '' : k}c)(a-b-${k === 1 ? '' : k}c)`, `(a-b-${k === 1 ? '' : k}c)^2`, `(a+b-${k === 1 ? '' : k}c)^2`, `(a-b+${k === 1 ? '' : k}c)(a+b+${k === 1 ? '' : k}c)`]),
            steps: [`$=a^2-(b^2-${2 * k}bc+${k * k === 1 ? '' : k * k}c^2)=a^2-(b-${k === 1 ? '' : k}c)^2$`, `$=${right}$`],
          };
        },
      },
      {
        id: 'evaluate',
        title: '인수분해를 이용한 계산',
        gen(r, level) {
          if (level === 1) {
            const n = r.pick([9, 11, 19, 21, 99, 101, 49, 51]);
            return {
              q: `인수분해를 이용하여 $\\frac{${n}^3+1}{${n}^2-${n}+1}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: n + 1 },
              steps: [`$${n}^3+1=(${n}+1)(${n}^2-${n}+1)$`, `$=${n + 1}$`],
            };
          }
          if (level === 2) {
            const n = r.pick([10, 20, 100, 30]);
            const d = r.int(1, 3);
            const a = n + d,
              b = n - d;
            const v = a ** 3 - b ** 3;
            return {
              q: `$\\frac{${a}^3-${b}^3}{${a}^2+${a}\\times${b}+${b}^2}$ 의 값은?`,
              answer: numChoices(r, a - b, [a + b, a * b, 2 * d + 1, a - b + 2]),
              steps: [`$${a}^3-${b}^3=(${a}-${b})(${a}^2+${a}\\times${b}+${b}^2)$`, `$=${a}-${b}=${a - b}$ (참고: 분자는 $${v}$)`],
            };
          }
          const s = r.pick([2, 3, 5]),
            c = r.int(1, 3) * r.sign();
          // x = c + √s → (x - c)^3 = s√s
          const A = [1, -3 * c, 3 * c * c, -(c ** 3)];
          const k = r.int(-5, 5);
          return {
            q: `$x=${c}+\\sqrt{${s}}$ 일 때, $${P(padd(A, [k]))}$ 의 값은?`,
            answer: mc(r, `${s}\\sqrt{${s}}${k === 0 ? '' : k > 0 ? '+' + k : k}`, [`${s}\\sqrt{${s}}`, `${s + k}`, `\\sqrt{${s}}${k === 0 ? '' : k > 0 ? '+' + k : k}`, `${3 * s}\\sqrt{${s}}${k === 0 ? '' : k > 0 ? '+' + k : k}`, `${s * s + k}`]),
            steps: [`$${P(A)}=${fac(1, -c)}^3$`, `$x${c > 0 ? '-' : '+'}${Math.abs(c)}=\\sqrt{${s}}$ 이므로 $(\\sqrt{${s}})^3=${s}\\sqrt{${s}}$`, `값은 $${s}\\sqrt{${s}}${k === 0 ? '' : k > 0 ? '+' + k : k}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 복소수와 이차방정식 ─────────────────────────
  'hc1-4': {
    concepts: [
      {
        title: '복소수',
        body: '제곱하여 $-1$ 이 되는 수를 $i$ 라 한다 ($i^2=-1$). $a+bi$ ($a$, $b$ 는 실수) 꼴의 수를 **복소수**, $a$ 를 실수부분, $b$ 를 허수부분이라 한다.\n- $a+bi=c+di \\iff a=c,\\ b=d$\n- 켤레복소수: $\\overline{a+bi}=a-bi$\n- $a>0$ 일 때 $\\sqrt{-a}=\\sqrt{a}\\,i$',
      },
      {
        title: '복소수의 연산',
        body: '$i$ 를 문자처럼 계산하고 $i^2=-1$ 로 바꾼다.\n- $(a+bi)(c+di)=(ac-bd)+(ad+bc)i$\n- 나눗셈: 분모의 켤레복소수를 분자·분모에 곱한다.\n- $i^4=1$ 이므로 $i^n$ 은 $i,-1,-i,1$ 이 반복된다.',
        example: { q: '$(2+i)(3-i)$', a: '$6-2i+3i-i^2=7+i$' },
      },
      {
        title: '판별식',
        body: '계수가 실수인 $ax^2+bx+c=0$ 에서 $D=b^2-4ac$ 일 때\n- $D>0$: 서로 다른 두 실근\n- $D=0$: 중근\n- $D<0$: 서로 다른 두 허근\n($b=2b\'$ 이면 $\\frac{D}{4}=b\'^2-ac$)',
      },
      {
        title: '근과 계수의 관계',
        body: '$ax^2+bx+c=0$ 의 두 근을 $\\alpha$, $\\beta$ 라 하면\n$$\\alpha+\\beta=-\\frac{b}{a},\\qquad \\alpha\\beta=\\frac{c}{a}$$\n- 두 수를 근으로 하는 이차방정식: $x^2-(\\alpha+\\beta)x+\\alpha\\beta=0$\n- 계수가 실수이면 $p+qi$ 가 근일 때 $p-qi$ 도 근이다.',
      },
    ],
    skills: [
      {
        id: 'complex-arith',
        title: '복소수의 사칙연산',
        gen(r, level) {
          const a = r.int(-5, 5),
            b = r.nonzero(-5, 5),
            c = r.int(-4, 4),
            d = r.nonzero(-4, 4);
          const fields = (re: number, im: number) => ({ type: 'fields' as const, fields: [{ label: '실수부분', value: re }, { label: '허수부분', value: im }] });
          if (level === 1) {
            if (r.chance(0.4)) {
              const sg = r.sign();
              return {
                q: `$(${cx(a, b)})${sg > 0 ? '+' : '-'}(${cx(c, d)})$ 를 $x+yi$ 꼴로 나타낼 때, 실수부분과 허수부분을 구하세요.`,
                answer: fields(a + sg * c, b + sg * d),
                steps: ['실수부분끼리, 허수부분끼리 계산합니다.', `$(${a}${sg > 0 ? '+' : '-'}${c < 0 ? `(${c})` : c})+(${b}${sg > 0 ? '+' : '-'}${d < 0 ? `(${d})` : d})i=${cx(a + sg * c, b + sg * d)}$`],
              };
            }
            return {
              q: `$(${cx(a, b)})(${cx(c, d)})$ 를 $x+yi$ 꼴로 나타낼 때, 실수부분과 허수부분을 구하세요.`,
              answer: fields(a * c - b * d, a * d + b * c),
              steps: [`$=${termsTex([{ c: a * c, v: '' }, { c: a * d, v: 'i' }, { c: b * c, v: 'i' }, { c: b * d, v: 'i^2' }])}$`, `$i^2=-1$ 이므로 $${cx(a * c - b * d, a * d + b * c)}$`],
            };
          }
          if (level === 2) {
            // z = u * w, ask z / w = u
            const u = [r.int(-4, 4), r.nonzero(-4, 4)];
            const w = [r.nonzero(-3, 3), r.nonzero(-3, 3)];
            const z = [u[0] * w[0] - u[1] * w[1], u[0] * w[1] + u[1] * w[0]];
            const n2 = w[0] ** 2 + w[1] ** 2;
            return {
              q: `$\\frac{${cx(z[0], z[1])}}{${cx(w[0], w[1])}}$ 을 $x+yi$ 꼴로 나타낼 때, 실수부분과 허수부분을 구하세요.`,
              answer: fields(u[0], u[1]),
              steps: [`분자·분모에 $${cx(w[0], -w[1])}$ 을 곱합니다.`, `분모: $${w[0] < 0 ? `(${w[0]})` : w[0]}^2+${w[1] < 0 ? `(${w[1]})` : w[1]}^2=${n2}$, 분자: $${cx(u[0] * n2, u[1] * n2)}$`, `$=${cx(u[0], u[1])}$`],
            };
          }
          if (r.chance(0.5)) {
            const n = r.int(5, 40);
            let re = 0,
              im = 0;
            const cyc = [
              [0, 1],
              [-1, 0],
              [0, -1],
              [1, 0],
            ];
            for (let k = 1; k <= n; k++) {
              re += cyc[(k - 1) % 4][0];
              im += cyc[(k - 1) % 4][1];
            }
            return {
              q: `$i+i^2+i^3+\\cdots+i^{${n}}$ 을 $x+yi$ 꼴로 나타낼 때, 실수부분과 허수부분을 구하세요.`,
              answer: fields(re, im),
              steps: ['$i+i^2+i^3+i^4=i-1-i+1=0$ 이므로 연속한 네 항의 합은 $0$', `$${n}=4\\times${Math.floor(n / 4)}+${n % 4}$ 이므로 남는 항: ${n % 4 === 0 ? '없음' : `$${['i', 'i+i^2', 'i+i^2+i^3'][(n % 4) - 1]}$`}`, `$=${cx(re, im)}$`],
            };
          }
          const n = r.int(2, 6) * 2;
          // (1+i)^n = (2i)^(n/2)
          const m = n / 2;
          const mag = 2 ** m;
          const ph = [
            [1, 0],
            [0, 1],
            [-1, 0],
            [0, -1],
          ][m % 4];
          const sg = r.sign();
          return {
            q: `$(1${sg > 0 ? '+' : '-'}i)^{${n}}$ 을 $x+yi$ 꼴로 나타낼 때, 실수부분과 허수부분을 구하세요.`,
            answer: fields(mag * ph[0], sg * mag * ph[1]),
            steps: [`$(1${sg > 0 ? '+' : '-'}i)^2=1${sg > 0 ? '+' : '-'}2i+i^2=${sg > 0 ? '' : '-'}2i$`, `$(1${sg > 0 ? '+' : '-'}i)^{${n}}=(${sg > 0 ? '' : '-'}2i)^{${m}}=${cx(mag * ph[0], sg * mag * ph[1])}$`],
          };
        },
      },
      {
        id: 'complex-eq',
        title: '복소수가 서로 같을 조건',
        gen(r, level) {
          const x = r.int(-6, 6),
            y = r.int(-6, 6);
          if (level === 1) {
            return {
              q: `등식 $(x+y)+(x-y)i=${cx(x + y, x - y)}$ 를 만족하는 실수 $x$, $y$ 의 값을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'x', value: x }, { label: 'y', value: y }] },
              steps: [`실수부분: $x+y=${x + y}$, 허수부분: $x-y=${x - y}$`, `연립하면 $x=${x}$, $y=${y}$`],
            };
          }
          if (level === 2) {
            const p = r.int(1, 3),
              q = r.nonzero(-3, 3),
              s = r.int(1, 3),
              t = r.nonzero(-3, 3);
            if (p * t - q * s === 0) return this.gen(r, level);
            const re = p * x + s * y,
              im = q * x + t * y;
            return {
              q: `등식 $(${cx(p, q)})x+(${cx(s, t)})y=${cx(re, im)}$ 를 만족하는 실수 $x$, $y$ 의 값을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'x', value: x }, { label: 'y', value: y }] },
              steps: [`좌변 $=(${termsTex([{ c: p, v: 'x' }, { c: s, v: 'y' }])})+(${termsTex([{ c: q, v: 'x' }, { c: t, v: 'y' }])})i$`, `$${termsTex([{ c: p, v: 'x' }, { c: s, v: 'y' }])}=${re}$, $${termsTex([{ c: q, v: 'x' }, { c: t, v: 'y' }])}=${im}$`, `연립하면 $x=${x}$, $y=${y}$`],
            };
          }
          const a = r.int(-5, 5),
            b = r.nonzero(-5, 5);
          const k = r.int(2, 3);
          const sgn = r.sign();
          // k z + sgn * conj(z) = (k+sgn)a + (k - sgn) b i
          const re = (k + sgn) * a,
            im = (k - sgn) * b;
          return {
            q: `복소수 $z$ 와 그 켤레복소수 $\\bar{z}$ 에 대하여 $${k}z${sgn > 0 ? '+' : '-'}\\bar{z}=${cx(re, im)}$ 일 때, $z=a+bi$ 의 $a$, $b$ 를 구하세요. ($a$, $b$ 는 실수)`,
            answer: { type: 'fields', fields: [{ label: 'a', value: a }, { label: 'b', value: b }] },
            steps: [`$z=a+bi$, $\\bar{z}=a-bi$ 를 대입: $${k}(a+bi)${sgn > 0 ? '+' : '-'}(a-bi)=${termsTex([{ c: k + sgn, v: 'a' }, { c: k - sgn, v: 'bi' }])}$`, `$${termsTex([{ c: k + sgn, v: 'a' }])}=${re}$, $${termsTex([{ c: k - sgn, v: 'b' }])}=${im}$`, `$a=${a}$, $b=${b}$`],
          };
        },
      },
      {
        id: 'discriminant',
        title: '판별식',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(1, 3),
              b = r.int(-6, 6),
              c = r.int(-5, 6);
            const D = b * b - 4 * a * c;
            const kind = D > 0 ? '서로 다른 두 실근' : D === 0 ? '중근' : '서로 다른 두 허근';
            return {
              q: `이차방정식 $${P([a, b, c])}=0$ 의 근을 판별하면?`,
              answer: tc(r, kind, ['서로 다른 두 실근', '중근', '서로 다른 두 허근', '실근 하나와 허근 하나'].filter((x) => x !== kind), 4),
              steps: [`$D=${b * b}-4\\times${a}\\times(${c})=${D}$`, `$D${D > 0 ? '>' : D === 0 ? '=' : '<'}0$ 이므로 ${kind}`],
            };
          }
          const k1 = r.int(-5, 2),
            k2 = k1 + r.int(2, 7);
          const al = k1 + k2,
            be = -k1 * k2;
          // x² + 2kx + (al k + be) = 0, D/4 = k² - al k - be = (k-k1)(k-k2)
          const cT = termsTex([{ c: al, v: 'k' }, { c: be, v: '' }]);
          const eq = `x^2+2kx${cT.startsWith('-') ? '' : '+'}${cT}=0`;
          if (level === 2) {
            return {
              q: `이차방정식 $${eq}$ 이 중근을 갖도록 하는 실수 $k$ 의 값을 모두 구하세요.`,
              answer: { type: 'set', values: [k1, k2] },
              steps: [`$\\frac{D}{4}=k^2-(${cT})=0$`, `$${P([1, -al, -be], 'k')}=0$, $(k${k1 > 0 ? '-' + k1 : k1 < 0 ? '+' + -k1 : ''})(k${k2 > 0 ? '-' + k2 : k2 < 0 ? '+' + -k2 : ''})=0$`.replace('(k)', 'k'), `$k=${k1}$ 또는 $k=${k2}$`],
            };
          }
          const cnt = k2 - k1 - 1;
          return {
            q: `이차방정식 $${eq}$ 이 서로 다른 두 허근을 갖도록 하는 정수 $k$ 의 개수를 구하세요.`,
            answer: { type: 'num', value: cnt, unit: '개' },
            steps: [`$\\frac{D}{4}=${P([1, -al, -be], 'k')}<0$`, `$(k${k1 > 0 ? '-' + k1 : k1 < 0 ? '+' + -k1 : ''})(k${k2 > 0 ? '-' + k2 : k2 < 0 ? '+' + -k2 : ''})<0$ 에서 $${k1}<k<${k2}$`.replace('(k)', 'k'), `정수 $k$ 는 $${cnt}$ 개`],
          };
        },
      },
      {
        id: 'vieta',
        title: '근과 계수의 관계',
        gen(r, level) {
          const a = level === 1 ? 1 : r.int(1, 3);
          const b = r.int(-7, 7),
            c = r.nonzero(-6, 6);
          const S = new F(-b, a),
            Pp = new F(c, a);
          const opts = level === 1 ? ['sum2', 'inv'] : level === 2 ? ['sum2', 'inv', 'diff2'] : ['cube', 'ratio', 'sq1'];
          const ask = r.pick(opts);
          let v: F, expr: string, step: string;
          switch (ask) {
            case 'sum2':
              v = S.mul(S).sub(Pp.mul(2));
              expr = '\\alpha^2+\\beta^2';
              step = `$(\\alpha+\\beta)^2-2\\alpha\\beta=${S.mul(S).tex()}-2\\times\\left(${Pp.tex()}\\right)=${v.tex()}$`;
              break;
            case 'inv':
              v = S.div(Pp);
              expr = '\\frac{1}{\\alpha}+\\frac{1}{\\beta}';
              step = `$\\frac{\\alpha+\\beta}{\\alpha\\beta}=${v.tex()}$`;
              break;
            case 'diff2':
              v = S.mul(S).sub(Pp.mul(4));
              expr = '(\\alpha-\\beta)^2';
              step = `$(\\alpha+\\beta)^2-4\\alpha\\beta=${v.tex()}$`;
              break;
            case 'cube':
              v = S.pow(3).sub(Pp.mul(S).mul(3));
              expr = '\\alpha^3+\\beta^3';
              step = `$(\\alpha+\\beta)^3-3\\alpha\\beta(\\alpha+\\beta)=${v.tex()}$`;
              break;
            case 'sq1':
              // (α²+1)(β²+1) = (αβ)² + (α²+β²) + 1
              v = Pp.mul(Pp).add(S.mul(S).sub(Pp.mul(2))).add(1);
              expr = '(\\alpha^2+1)(\\beta^2+1)';
              step = `$(\\alpha\\beta)^2+(\\alpha^2+\\beta^2)+1=${Pp.mul(Pp).tex()}+${S.mul(S).sub(Pp.mul(2)).tex()}+1=${v.tex()}$`;
              break;
            default:
              v = S.mul(S).sub(Pp.mul(2)).div(Pp);
              expr = '\\frac{\\beta}{\\alpha}+\\frac{\\alpha}{\\beta}';
              step = `$\\frac{\\alpha^2+\\beta^2}{\\alpha\\beta}=\\frac{${S.mul(S).sub(Pp.mul(2)).tex()}}{${Pp.tex()}}=${v.tex()}$`;
          }
          return {
            q: `이차방정식 $${P([a, b, c])}=0$ 의 두 근을 $\\alpha$, $\\beta$ 라 할 때, $${expr}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: v.value, display: 'frac' },
            steps: [`근과 계수의 관계: $\\alpha+\\beta=${S.tex()}$, $\\alpha\\beta=${Pp.tex()}$`, step],
          };
        },
      },
      {
        id: 'make-eq',
        title: '이차방정식 만들기',
        gen(r, level) {
          if (level === 1) {
            const p = r.int(-7, 7),
              q = r.int(-7, 7);
            const right = [1, -(p + q), p * q];
            return {
              q: `두 수 $${p}$, $${q}$ 를 근으로 하고 $x^2$ 의 계수가 $1$ 인 이차방정식은?`,
              answer: exprChoices(r, { t: `${P(right)}=0`, p: right }, [
                { t: `${P([1, p + q, p * q])}=0`, p: [1, p + q, p * q] },
                { t: `${P([1, -(p + q), -p * q])}=0`, p: [1, -(p + q), -p * q] },
                { t: `${P([1, p * q, p + q])}=0`, p: [1, p * q, p + q] },
                { t: `${P([1, p + q, -p * q])}=0`, p: [1, p + q, -p * q] },
                { t: `${P([1, -(p + q), p * q + 1])}=0`, p: [1, -(p + q), p * q + 1] },
                { t: `${P([1, -(p + q) + 1, p * q])}=0`, p: [1, -(p + q) + 1, p * q] },
                { t: `${P([1, -(p + q) - 1, p * q - 1])}=0`, p: [1, -(p + q) - 1, p * q - 1] },
              ]),
              steps: [`$x^2-(\\text{두 근의 합})x+(\\text{두 근의 곱})=0$`, `합 $${p + q}$, 곱 $${p * q}$ → $${P(right)}=0$`],
            };
          }
          if (level === 2) {
            const b = r.int(-5, 5),
              c = r.nonzero(-5, 5);
            const k = r.pick([1, 2, -1]);
            const S = -b,
              Pr = c;
            let nS: number, nP: number, desc: string;
            if (k === 2) {
              nS = 2 * S;
              nP = 4 * Pr;
              desc = '2\\alpha,\\ 2\\beta';
            } else {
              nS = S + 2 * k;
              nP = Pr + k * S + k * k;
              desc = `\\alpha${k > 0 ? '+' : '-'}1,\\ \\beta${k > 0 ? '+' : '-'}1`;
            }
            const right = [1, -nS, nP];
            return {
              q: `이차방정식 $${P([1, b, c])}=0$ 의 두 근을 $\\alpha$, $\\beta$ 라 할 때, $${desc}$ 를 두 근으로 하고 $x^2$ 의 계수가 $1$ 인 이차방정식은?`,
              answer: exprChoices(r, { t: `${P(right)}=0`, p: right }, [
                { t: `${P([1, nS, nP])}=0`, p: [1, nS, nP] },
                { t: `${P([1, -nS, -nP])}=0`, p: [1, -nS, -nP] },
                { t: `${P([1, -S, Pr])}=0`, p: [1, -S, Pr] },
                { t: `${P([1, -nS, nP + 1])}=0`, p: [1, -nS, nP + 1] },
                { t: `${P([1, -nS - 1, nP])}=0`, p: [1, -nS - 1, nP] },
              ]),
              steps: [`$\\alpha+\\beta=${S}$, $\\alpha\\beta=${Pr}$`, `새 두 근의 합 $=${nS}$, 곱 $=${nP}$`, `$${P(right)}=0$`],
            };
          }
          const p = r.int(-4, 4),
            q = r.int(1, 4);
          return {
            q: `계수가 실수인 이차방정식 $x^2+ax+b=0$ 의 한 근이 $${cx(p, q)}$ 일 때, 실수 $a$, $b$ 의 값을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'a', value: -2 * p }, { label: 'b', value: p * p + q * q }] },
            steps: [`계수가 실수이므로 다른 한 근은 $${cx(p, -q)}$`, `두 근의 합 $${2 * p}=-a$, 곱 $(${cx(p, q)})(${cx(p, -q)})=${p === 0 ? '' : `${p * p}+`}${q * q}=b$`, `$a=${-2 * p}$, $b=${p * p + q * q}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 이차방정식과 이차함수 ─────────────────────────
  'hc1-5': {
    concepts: [
      {
        title: '이차함수의 그래프와 $x$ 축',
        body: '$y=ax^2+bx+c$ 의 그래프와 $x$ 축의 교점의 $x$ 좌표는 $ax^2+bx+c=0$ 의 실근.\n- $D>0$: 서로 다른 두 점에서 만난다\n- $D=0$: 한 점에서 만난다 (접한다)\n- $D<0$: 만나지 않는다',
      },
      {
        title: '이차함수의 그래프와 직선',
        body: '$y=ax^2+bx+c$ 와 $y=mx+n$ 의 교점의 $x$ 좌표는 $ax^2+(b-m)x+(c-n)=0$ 의 실근. 이 방정식의 판별식 $D$ 로 위치 관계(두 점 / 접함 / 만나지 않음)를 판단한다.',
      },
      {
        title: '이차함수의 최대·최소',
        body: '$y=a(x-p)^2+q$ 에서\n- $a>0$ 이면 $x=p$ 에서 최솟값 $q$ (최댓값 없음), $a<0$ 이면 최댓값 $q$\n- 범위 $\\alpha\\le x\\le\\beta$ 가 주어지면 꼭짓점의 $x$ 좌표가 범위 안에 있는지 확인하고, 양 끝값과 꼭짓점에서의 값을 비교한다.',
        example: { q: '$-1\\le x\\le 2$ 에서 $y=(x-1)^2+2$ 의 최댓값·최솟값', a: '$x=-1$ 에서 최댓값 $6$, $x=1$ 에서 최솟값 $2$' },
      },
      {
        title: '최대·최소의 활용',
        body: '변수를 정하고 넓이·이익·높이 등을 이차함수로 나타낸 뒤, 완전제곱식으로 고쳐 최대·최소를 구한다. 변수의 범위(길이 $>0$ 등)에 주의!',
      },
    ],
    skills: [
      {
        id: 'x-axis',
        title: '그래프와 x축의 위치 관계',
        gen(r, level) {
          if (level === 1) {
            const p = r.int(-6, 6),
              q = r.int(-6, 6);
            if (p === q) return this.gen(r, level);
            return {
              q: `이차함수 $y=${P([1, -(p + q), p * q])}$ 의 그래프가 $x$ 축과 만나는 점의 $x$ 좌표를 모두 구하세요.`,
              answer: { type: 'set', values: [p, q] },
              steps: [`$${P([1, -(p + q), p * q])}=0$`, `$${fac(1, -p)}${fac(1, -q)}=0$, $x=${p}$ 또는 $x=${q}$`],
            };
          }
          if (level === 2) {
            const a = r.pick([1, -1, 2, -2]),
              b = r.int(-6, 6),
              c = r.int(-6, 6);
            const D = b * b - 4 * a * c;
            const kind = D > 0 ? '서로 다른 두 점에서 만난다' : D === 0 ? '한 점에서 만난다 (접한다)' : '만나지 않는다';
            return {
              q: `이차함수 $y=${P([a, b, c])}$ 의 그래프와 $x$ 축의 위치 관계로 옳은 것은?`,
              answer: tc(r, kind, ['서로 다른 두 점에서 만난다', '한 점에서 만난다 (접한다)', '만나지 않는다'].filter((x) => x !== kind), 3),
              steps: [`$D=${b * b}-4\\times${a < 0 ? `(${a})` : a}\\times${c < 0 ? `(${c})` : c}=${D}$`, `$D${D > 0 ? '>' : D === 0 ? '=' : '<'}0$ 이므로 ${kind}`],
            };
          }
          const p = r.nonzero(-5, 5);
          const ask = r.pick(['max', 'touch']);
          if (ask === 'touch') {
            return {
              q: `이차함수 $y=${P([1, -2 * p, 0])}+k$ 의 그래프가 $x$ 축에 접할 때, 상수 $k$ 의 값과 접점의 $x$ 좌표를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'k', value: p * p }, { label: '접점의 x 좌표', value: p }] },
              steps: [`$\\frac{D}{4}=${p * p}-k=0$ 에서 $k=${p * p}$`, `$y=${fac(1, -p)}^2$ 이므로 접점의 $x$ 좌표는 $${p}$`],
            };
          }
          return {
            q: `이차함수 $y=${P([1, -2 * p, 0])}+k$ 의 그래프가 $x$ 축과 서로 다른 두 점에서 만나도록 하는 정수 $k$ 의 최댓값을 구하세요.`,
            answer: { type: 'num', value: p * p - 1 },
            steps: [`$\\frac{D}{4}=${p * p}-k>0$`, `$k<${p * p}$ 이므로 정수 $k$ 의 최댓값은 $${p * p - 1}$`],
          };
        },
      },
      {
        id: 'line',
        title: '그래프와 직선의 위치 관계',
        gen(r, level) {
          if (level === 1) {
            const p = r.int(-4, 4),
              q = r.int(-4, 4);
            if (p === q) return this.gen(r, level);
            const m = r.int(-3, 3),
              n = r.int(-5, 5);
            // x² + bx + c - (mx + n) = (x-p)(x-q)
            const b = m - (p + q),
              c = n + p * q;
            return {
              q: `이차함수 $y=${P([1, b, c])}$ 의 그래프와 직선 $y=${linTex(m, n) === '0' ? '0' : linTex(m, n)}$ 이 만나는 점의 $x$ 좌표를 모두 구하세요.`,
              answer: { type: 'set', values: [p, q] },
              steps: [`$${P([1, b, c])}=${linTex(m, n)}$`, `$${P([1, b - m, c - n])}=0$, $${fac(1, -p)}${fac(1, -q)}=0$`, `$x=${p}$ 또는 $x=${q}$`],
            };
          }
          if (level === 2) {
            const c = r.int(-4, 6),
              t = r.nonzero(-4, 4);
            const n = c - t * t;
            return {
              q: `이차함수 $y=x^2${c === 0 ? '' : (c > 0 ? '+' : '') + c}$ 의 그래프와 직선 $y=${2 * t}x+n$ 이 접할 때, 상수 $n$ 의 값은?`,
              answer: numChoices(r, n, [c + t * t, -n, c - 2 * t, n + 1].filter((v) => v !== n)),
              steps: [`$x^2${c === 0 ? '' : (c > 0 ? '+' : '') + c}=${2 * t}x+n$ 에서 $${P([1, -2 * t, 0])}+(${linTex(-1, c, 'n')})=0$`, `접하므로 $\\frac{D}{4}=${t * t}-(${linTex(-1, c, 'n')})=0$`, `$n=${n}$`],
            };
          }
          const b = r.int(-4, 4),
            c = r.int(-3, 6),
            m = r.int(-3, 3);
          const bound = F.of(c).sub(new F((b - m) ** 2, 4));
          // k > bound 를 만족하는 최소 정수 (bound 가 정수이면 bound+1)
          const maxK = Math.floor(bound.value);
          return {
            q: `이차함수 $y=${P([1, b, c])}$ 의 그래프와 직선 $y=${m === 0 ? '' : linTex(m, 0)}${m === 0 ? 'k' : '+k'}$ 이 서로 다른 두 점에서 만나도록 하는 정수 $k$ 의 최솟값을 구하세요.`,
            answer: { type: 'num', value: maxK + 1 },
            steps: [`$${P([1, b - m, c])}-k=0$ 의 $D>0$`, `$${(b - m) ** 2}-4(${linTex(-1, c, 'k')})>0$, $k>${bound.tex()}$`, `정수 $k$ 의 최솟값은 $${maxK + 1}$`],
          };
        },
      },
      {
        id: 'max-min',
        title: '이차함수의 최대·최소',
        gen(r, level) {
          const a = r.pick([1, -1, 2, -2]);
          const p = r.int(-3, 3),
            q = r.int(-6, 6);
          const Pq = [a, -2 * a * p, a * p * p + q];
          const f = (x: number) => a * (x - p) ** 2 + q;
          if (level === 1) {
            return {
              q: `이차함수 $y=${P(Pq)}$ 의 ${a > 0 ? '최솟값' : '최댓값'}을 구하세요.`,
              answer: { type: 'num', value: q },
              steps: [`$y=${vtx(a, p, q)}$`, `$x=${p}$ 에서 ${a > 0 ? '최솟값' : '최댓값'} $${q}$`],
            };
          }
          let s: number, t: number;
          if (level === 2) {
            s = p - r.int(1, 3);
            t = p + r.int(1, 3);
          } else {
            s = r.chance(0.5) ? p + r.int(1, 2) : p - r.int(4, 6); // 꼭짓점이 범위 밖(끝점 포함 X)
            t = s + r.int(2, 3);
          }
          const vals = [f(s), f(t)];
          if (p >= s && p <= t) vals.push(q);
          const mx = Math.max(...vals),
            mn = Math.min(...vals);
          return {
            q: `$${s}\\le x\\le ${t}$ 에서 이차함수 $y=${P(Pq)}$ 의 최댓값과 최솟값을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: '최댓값', value: mx }, { label: '최솟값', value: mn }] },
            steps: [`$y=${vtx(a, p, q)}$, 꼭짓점의 $x$ 좌표 $${p}$ 는 범위 ${p >= s && p <= t ? '안' : '밖'}`, `$x=${s}$ 일 때 $${f(s)}$, $x=${t}$ 일 때 $${f(t)}$${p >= s && p <= t ? `, $x=${p}$ 일 때 $${q}$` : ''}`, `최댓값 $${mx}$, 최솟값 $${mn}$`],
          };
        },
      },
      {
        id: 'applied',
        title: '최대·최소의 활용',
        gen(r, level) {
          if (level === 1) {
            const L = r.int(5, 30) * 2;
            const name = r.pick(NAMES);
            return {
              q: `${neun(name)} 길이가 $${2 * L}\\,\\text{m}$ 인 끈으로 직사각형을 만들려고 한다. 직사각형의 넓이의 최댓값을 구하세요.`,
              answer: { type: 'num', value: (L / 2) ** 2, unit: 'm²' },
              steps: [`가로를 $x$ 라 하면 세로는 $${L}-x$, 넓이 $y=x(${L}-x)=-(x-${L / 2})^2+${(L / 2) ** 2}$`, `$x=${L / 2}$ 일 때 최댓값 $${(L / 2) ** 2}\\,\\text{m}^2$`],
            };
          }
          if (level === 2) {
            const p0 = r.int(5, 20) * 100;
            const n0 = r.int(10, 40) * 10;
            const m = r.pick([5, 10, 20]);
            const dx = 100;
            // 매출 = (p0 + 100x)(n0 - m x) → 꼭짓점 x* = (n0/m - p0/100)/2
            const xs = (n0 / m - p0 / dx) / 2;
            if (!Number.isInteger(xs) || xs <= 0) return this.gen(r, level);
            return {
              q: `어느 가게에서 한 개에 $${p0}$ 원인 물건을 하루에 $${n0}$ 개씩 판다. 가격을 $100$ 원씩 올릴 때마다 판매량이 $${m}$ 개씩 줄어든다고 할 때, 하루 판매 금액이 최대가 되는 물건의 가격을 구하세요.`,
              answer: { type: 'num', value: p0 + 100 * xs, unit: '원' },
              steps: [`$100x$ 원 올리면 판매 금액 $y=(${p0}+100x)(${n0}-${m}x)$`, `$=${-100 * m}x^2+${100 * n0 - p0 * m}x+${p0 * n0}$, 축은 $x=${xs}$`, `가격 $=${p0}+100\\times${xs}=${p0 + 100 * xs}$ 원`],
            };
          }
          const t = r.int(1, 4);
          const v = 10 * t;
          const h0 = r.int(0, 30);
          const H = 5 * t * t + h0;
          return {
            q: `지면으로부터 $${h0}\\,\\text{m}$ 높이에서 위로 던진 공의 $t$ 초 후의 높이가 $h=-5t^2+${v}t${h0 ? '+' + h0 : ''}\\,(\\text{m})$ 일 때, 공이 가장 높이 올라갔을 때의 높이와 그때의 시각을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: '최고 높이', value: H, unit: 'm' }, { label: '시각', value: t, unit: '초' }] },
            steps: [`$h=-5(t^2-${2 * t}t)${h0 ? '+' + h0 : ''}=-5(t-${t})^2+${H}$`, `$t=${t}$ 일 때 최고 높이 $${H}\\,\\text{m}$`],
          };
        },
      },
      {
        id: 'intercepts',
        title: 'x 절편과 근과 계수의 관계',
        gen(r, level) {
          if (level === 1) {
            const p = r.int(-6, 5),
              d = r.int(1, 8);
            const q = p + d;
            return {
              q: `이차함수 $y=${P([1, -(p + q), p * q])}$ 의 그래프가 $x$ 축과 만나는 두 점 사이의 거리를 구하세요.`,
              answer: { type: 'num', value: d },
              steps: [`$${fac(1, -p)}${fac(1, -q)}=0$ 에서 $x=${p}$, $${q}$`, `거리 $=${q}-(${p})=${d}$`],
            };
          }
          if (level === 2) {
            const p = r.nonzero(-4, 4),
              h = r.int(1, 5);
            const k = p * p - h * h;
            return {
              q: `이차함수 $y=${P([1, -2 * p, 0])}+k$ 의 그래프가 $x$ 축과 만나는 두 점 사이의 거리가 $${2 * h}$ 일 때, 상수 $k$ 의 값은?`,
              answer: numChoices(r, k, [p * p + h * h, p * p - 2 * h, -k, k + 1].filter((v) => v !== k)),
              steps: [`두 근을 $\\alpha$, $\\beta$ 라 하면 $\\alpha+\\beta=${2 * p}$, $\\alpha\\beta=k$`, `$(\\alpha-\\beta)^2=(\\alpha+\\beta)^2-4\\alpha\\beta=${4 * p * p}-4k=${4 * h * h}$`, `$k=${k}$`],
            };
          }
          const p = r.int(-3, 3),
            s = r.int(1, 4);
          const q = s * s;
          const area = s * q;
          return {
            q: `이차함수 $y=${P([-1, 2 * p, q - p * p])}$ 의 그래프의 꼭짓점을 $A$, 그래프가 $x$ 축과 만나는 두 점을 $B$, $C$ 라 할 때, $\\triangle ABC$ 의 넓이를 구하세요.`,
            answer: { type: 'num', value: area },
            steps: [`$y=-${fac(1, -p)}^2+${q}$ 이므로 꼭짓점 $A(${p},\\ ${q})$`, `$${fac(1, -p)}^2=${q}$ 에서 $x=${p - s}$, $${p + s}$ → $\\overline{BC}=${2 * s}$`, `넓이 $=\\frac{1}{2}\\times${2 * s}\\times${q}=${area}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 여러 가지 방정식과 부등식 ─────────────────────────
  'hc1-6': {
    concepts: [
      {
        title: '삼차방정식과 사차방정식',
        body: '- 인수정리와 조립제법으로 인수분해하여 푼다.\n- 복이차방정식 $x^4+ax^2+b=0$ 은 $x^2=t$ 로 치환.\n- $x^3=1$ 의 한 허근 $\\omega$: $\\omega^3=1$, $\\omega^2+\\omega+1=0$, $\\bar{\\omega}=\\omega^2$',
      },
      {
        title: '연립이차방정식',
        body: '- 일차식이 있으면 한 문자에 대해 풀어 이차식에 대입한다.\n- 두 식이 모두 이차이면 인수분해되는 식을 찾아 일차식 두 개로 나눈다.\n- $x+y$, $xy$ 가 주어지면 $x$, $y$ 는 $t^2-(x+y)t+xy=0$ 의 두 근.',
      },
      {
        title: '연립일차부등식과 절댓값',
        body: '각 부등식의 해를 수직선에 나타내 **공통부분**을 구한다. $A<B<C$ 꼴은 $A<B$, $B<C$ 로 나누어 푼다.\n- $|x|<a\\iff -a<x<a$, $|x|>a\\iff x<-a$ 또는 $x>a$ ($a>0$)',
      },
      {
        title: '이차부등식',
        body: '$\\alpha<\\beta$ 이고 $a>0$ 일 때\n- $a(x-\\alpha)(x-\\beta)<0 \\iff \\alpha<x<\\beta$\n- $a(x-\\alpha)(x-\\beta)>0 \\iff x<\\alpha$ 또는 $x>\\beta$\n이차함수의 그래프가 $x$ 축보다 아래(위)에 있는 $x$ 의 범위로 이해한다.',
        example: { q: '$x^2-x-6\\le0$', a: '$(x+2)(x-3)\\le0$, $-2\\le x\\le3$' },
      },
    ],
    skills: [
      {
        id: 'higher-eq',
        title: '삼차·사차방정식',
        gen(r, level) {
          if (level === 1) {
            const rs = roots3(r, -4, 4);
            return {
              q: `삼차방정식 $${P(fromRoots(rs))}=0$ 의 해를 구하세요.`,
              answer: { type: 'set', values: rs },
              steps: [`$x=${rs[0]}$ 을 대입하면 $0$ 이므로 $${fac(1, -rs[0])}$ ${rs[0] === 0 ? '가' : '이'} 인수`, `조립제법: $${fac(1, -rs[0])}(${P(fromRoots(rs.slice(1)))})=0$`, `$x=${[...rs].sort((u, v) => u - v).join(',\\ ')}$`],
            };
          }
          if (level === 2) {
            const a = r.int(1, 4);
            let b = r.int(1, 5);
            if (b === a) b = a + 1;
            const A = [1, 0, -(a * a + b * b), 0, a * a * b * b];
            return {
              q: `사차방정식 $${P(A)}=0$ 의 해를 구하세요.`,
              answer: { type: 'set', values: [a, -a, b, -b] },
              steps: [`$x^2=t$ 로 놓으면 $t^2-${a * a + b * b}t+${a * a * b * b}=0$, $(t-${a * a})(t-${b * b})=0$`, `$x^2=${a * a}$ 또는 $x^2=${b * b}$`, `$x=\\pm${a}$, $x=\\pm${b}$`],
            };
          }
          for (;;) {
            const a = r.nonzero(-3, 3);
            const p = r.int(-4, 4),
              q = r.int(-5, 6);
            if (p * p - 4 * q >= 0) continue;
            const A = pmul([1, -a], [1, p, q]);
            return {
              q: `삼차방정식 $${P(A)}=0$ 의 한 실근을 $\\gamma$, 두 허근을 $\\alpha$, $\\beta$ 라 할 때, $\\gamma$ 와 $\\alpha+\\beta$, $\\alpha\\beta$ 의 값을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'γ', value: a }, { label: 'α+β', value: -p }, { label: 'αβ', value: q }] },
              steps: [`$x=${a}$ 을 대입하면 $0$ 이므로 $\\gamma=${a}$`, `$${fac(1, -a)}(${P([1, p, q])})=0$, 이차방정식 $${P([1, p, q])}=0$ 의 판별식 $${p * p - 4 * q}<0$`, `근과 계수의 관계: $\\alpha+\\beta=${-p}$, $\\alpha\\beta=${q}$`],
            };
          }
        },
      },
      {
        id: 'system-quad',
        title: '연립이차방정식',
        gen(r, level) {
          if (level === 1) {
            const x = r.int(-5, 8),
              y = r.int(-6, 7);
            if (x <= y) return this.gen(r, level);
            return {
              q: `연립방정식 $\\begin{cases} x+y=${x + y} \\\\ xy=${x * y} \\end{cases}$ 의 해 중 $x>y$ 인 것을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'x', value: x }, { label: 'y', value: y }] },
              steps: [`$x$, $y$ 는 $${P([1, -(x + y), x * y], 't')}=0$ 의 두 근`, `$${fac(1, -x, 't')}${fac(1, -y, 't')}=0$ 이고 $x>y$ 이므로 $x=${x}$, $y=${y}$`],
            };
          }
          if (level === 2) {
            const x = r.int(2, 9),
              y = r.int(1, 8);
            if (x === y) return this.gen(r, level);
            const d = x - y,
              S = x * x + y * y;
            return {
              q: `연립방정식 $\\begin{cases} x-y=${d} \\\\ x^2+y^2=${S} \\end{cases}$ 의 해 중 $x>0$, $y>0$ 인 것을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'x', value: x }, { label: 'y', value: y }] },
              steps: [`$x=y${d >= 0 ? '+' : ''}${d}$ 를 대입: $(y${d >= 0 ? '+' : ''}${d})^2+y^2=${S}$`, `$2y^2${2 * d >= 0 ? '+' : ''}${2 * d}y${d * d - S >= 0 ? '+' : ''}${d * d - S}=0$, $y=${y}$ 또는 $y=${-x}$`, `$y>0$ 이므로 $y=${y}$, $x=${x}$`],
            };
          }
          for (;;) {
            const m = r.int(2, 4),
              k = r.int(1, 4);
            const S = (m * m + 1) * k * k;
            if (Number.isInteger(Math.sqrt(S / 2))) continue;
            return {
              q: `연립방정식 $\\begin{cases} x^2-${m + 1}xy+${m}y^2=0 \\\\ x^2+y^2=${S} \\end{cases}$ 을 만족하는 자연수 $x$, $y$ 를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'x', value: m * k }, { label: 'y', value: k }] },
              steps: [`첫째 식: $(x-y)(x-${m}y)=0$ 이므로 $x=y$ 또는 $x=${m}y$`, `$x=y$ 이면 $2y^2=${S}$ → 자연수 해 없음`, `$x=${m}y$ 이면 $${m * m + 1}y^2=${S}$, $y=${k}$, $x=${m * k}$`],
            };
          }
        },
      },
      {
        id: 'linear-ineq',
        title: '연립일차부등식',
        gen(r, level) {
          if (level === 1) {
            const lo = r.int(-4, 3),
              hi = lo + r.int(2, 6);
            const a = r.int(2, 3),
              b = r.int(-5, 5);
            // a x + b > a lo + b → x > lo ; x + c ≤ hi + c
            const c = r.int(-4, 6);
            const cnt = hi - lo;
            return {
              q: `연립부등식 $\\begin{cases} ${linTex(a, b)}>${a * lo + b} \\\\ ${linTex(1, c)}\\le ${hi + c} \\end{cases}$ 을 만족하는 정수 $x$ 의 개수를 구하세요.`,
              answer: { type: 'num', value: cnt, unit: '개' },
              steps: [`첫째: $${a}x>${a * lo}$ → $x>${lo}$, 둘째: $x\\le ${hi}$`, `$${lo}<x\\le ${hi}$`, `정수 $x$ 는 $${cnt}$ 개`],
            };
          }
          if (level === 2) {
            const lo = r.int(-5, 2),
              hi = lo + r.int(2, 6);
            // x + p < 2x + q ≤ x + s  → p - q < x ≤ s - q
            const q = r.int(-4, 4);
            const p = lo + q,
              s = hi + q;
            return {
              q: `부등식 $${linTex(1, p)}<${linTex(2, q)}\\le ${linTex(1, s)}$ 의 해가 $a<x\\le b$ 일 때, $a$, $b$ 의 값을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'a', value: lo }, { label: 'b', value: hi }] },
              steps: [`$${linTex(1, p)}<${linTex(2, q)}$ → $x>${lo}$`, `$${linTex(2, q)}\\le ${linTex(1, s)}$ → $x\\le ${hi}$`, `$${lo}<x\\le${hi}$`],
            };
          }
          const p = r.int(-5, 5),
            q = r.int(2, 9);
          const k = r.pick([1, 2]);
          let cnt = 0;
          const lo = (p - q) / k,
            hi = (p + q) / k;
          for (let x = Math.floor(lo) - 1; x <= Math.ceil(hi) + 1; x++) if (k * x - p < q && k * x - p > -q) cnt++;
          return {
            q: `부등식 $|${linTex(k, -p)}|<${q}$ 을 만족하는 정수 $x$ 의 개수를 구하세요.`,
            answer: { type: 'num', value: cnt, unit: '개' },
            steps: [`$-${q}<${linTex(k, -p)}<${q}$`, `$${new F(p - q, k).tex()}<x<${new F(p + q, k).tex()}$`, `정수 $x$ 의 개수: $${cnt}$`],
          };
        },
      },
      {
        id: 'quad-ineq',
        title: '이차부등식',
        gen(r, level) {
          const p = r.int(-5, 3),
            q = p + r.int(1, 7);
          if (level === 1) {
            const strict = r.chance(0.5);
            const cnt = strict ? q - p - 1 : q - p + 1;
            return {
              q: `이차부등식 $${P([1, -(p + q), p * q])}${strict ? '<' : '\\le '}0$ 을 만족하는 정수 $x$ 의 개수를 구하세요.`,
              answer: { type: 'num', value: cnt, unit: '개' },
              steps: [`$${fac(1, -p)}${fac(1, -q)}${strict ? '<' : '\\le '}0$`, `$${p}${strict ? '<' : '\\le '}x${strict ? '<' : '\\le '}${q}$`, `정수 $x$ 는 $${cnt}$ 개`],
            };
          }
          if (level === 2) {
            const ge = r.chance(0.5);
            const right = ge ? `x\\le ${p}\\ \\text{또는}\\ x\\ge ${q}` : `x<${p}\\ \\text{또는}\\ x>${q}`;
            return {
              q: `이차부등식 $${P([1, -(p + q), p * q])}${ge ? '\\ge' : '>'}0$ 의 해는?`,
              answer: mc(r, right, [ge ? `${p}\\le x\\le ${q}` : `${p}<x<${q}`, ge ? `x\\le ${-q}\\ \\text{또는}\\ x\\ge ${-p}` : `x<${-q}\\ \\text{또는}\\ x>${-p}`, ge ? `${-q}\\le x\\le ${-p}` : `${-q}<x<${-p}`, ge ? `x<${p}\\ \\text{또는}\\ x>${q}` : `x\\le ${p}\\ \\text{또는}\\ x\\ge ${q}`]),
              steps: [`$${fac(1, -p)}${fac(1, -q)}${ge ? '\\ge' : '>'}0$`, `그래프가 $x$ 축 위쪽에 있는 범위: $${right}$`],
            };
          }
          const a = r.int(1, 3);
          return {
            q: `이차부등식 $${a === 1 ? '' : a}x^2+bx+c<0$ 의 해가 $${p}<x<${q}$ 일 때, 상수 $b$, $c$ 의 값을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'b', value: -a * (p + q) }, { label: 'c', value: a * p * q }] },
            steps: [`해가 $${p}<x<${q}$ 이고 $x^2$ 의 계수가 $${a}$ 이므로 $${a === 1 ? '' : a}${fac(1, -p)}${fac(1, -q)}<0$`, `전개: $${P([a, -a * (p + q), a * p * q])}<0$`, `$b=${-a * (p + q)}$, $c=${a * p * q}$`],
          };
        },
      },
      {
        id: 'omega',
        title: '방정식 x³=1 의 허근 ω',
        gen(r, level) {
          const w = (n: number) => ((n % 3) + 3) % 3; // ω^n → 지수 mod 3
          const val = (e: number) => (e === 0 ? '1' : e === 1 ? '\\omega' : '\\omega^2');
          if (level === 1) {
            const a = 3 * r.int(1, 10) + 1,
              b = 3 * r.int(1, 10) + 2;
            const c = r.int(1, 5);
            return {
              q: `방정식 $x^3=1$ 의 한 허근을 $\\omega$ 라 할 때, $\\omega^{${a}}+\\omega^{${b}}+${c}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: c - 1 },
              steps: ['$\\omega^3=1$, $\\omega^2+\\omega+1=0$', `$\\omega^{${a}}=\\omega$, $\\omega^{${b}}=\\omega^2$`, `$\\omega+\\omega^2+${c}=-1+${c}=${c - 1}$`],
            };
          }
          if (level === 2) {
            const n = r.int(2, 30);
            const e = w(n);
            const v = e === 0 ? 2 : -1;
            return {
              q: `방정식 $x^3=1$ 의 한 허근을 $\\omega$ 라 할 때, $\\omega^{${n}}+\\frac{1}{\\omega^{${n}}}$ 의 값은?`,
              answer: numChoices(r, v, [v === 2 ? -1 : 2, 0, 1, -2]),
              steps: [`$\\omega^{${n}}=${val(e)}$`, e === 0 ? '$1+1=2$' : `$\\frac{1}{${val(e)}}=${val(w(-e))}$ 이므로 $\\omega+\\omega^2=-1$`],
            };
          }
          const n = r.int(1, 8) * 3;
          // (1+ω)^n = (-ω²)^n = (-1)^n ω^{2n} = (-1)^n (n multiple of 3)
          const v = n % 2 === 0 ? 1 : -1;
          const m = r.int(1, 5);
          return {
            q: `방정식 $x^3=1$ 의 한 허근을 $\\omega$ 라 할 때, $(1+\\omega)^{${n}}+${m}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: v + m },
            steps: ['$1+\\omega=-\\omega^2$', `$(1+\\omega)^{${n}}=(-1)^{${n}}\\omega^{${2 * n}}=${v}$ ($\\omega^3=1$)`, `$${v}+${m}=${v + m}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 경우의 수 ─────────────────────────
  'hc1-7': {
    concepts: [
      {
        title: '합의 법칙과 곱의 법칙',
        body: '- 두 사건이 동시에 일어나지 않을 때 경우의 수는 $m+n$ (합의 법칙)\n- 잇달아 일어날 때 $m\\times n$ (곱의 법칙)\n- $N=p^aq^b r^c$ 의 약수의 개수: $(a+1)(b+1)(c+1)$\n중2의 경우의 수를 일반화한 것이다.',
      },
      {
        title: '순열',
        body: '서로 다른 $n$ 개에서 $r$ 개를 택해 **일렬로 나열**하는 경우의 수\n$${}_n\\mathrm{P}_r=n(n-1)\\cdots(n-r+1)=\\frac{n!}{(n-r)!}$$\n$0!=1$, ${}_n\\mathrm{P}_0=1$\n- 이웃하는 것은 한 묶음으로, 이웃하지 않는 것은 나머지를 먼저 세우고 사이사이에.',
        example: { q: '${}_5\\mathrm{P}_2$', a: '$5\\times4=20$' },
      },
      {
        title: '조합',
        body: '서로 다른 $n$ 개에서 순서를 생각하지 않고 $r$ 개를 **택하는** 경우의 수\n$${}_n\\mathrm{C}_r=\\frac{{}_n\\mathrm{P}_r}{r!}=\\frac{n!}{r!(n-r)!}$$\n- ${}_n\\mathrm{C}_r={}_n\\mathrm{C}_{n-r}$, ${}_n\\mathrm{C}_r={}_{n-1}\\mathrm{C}_{r-1}+{}_{n-1}\\mathrm{C}_r$',
      },
      {
        title: '조합의 활용',
        body: '- 특정한 것을 포함: 미리 뽑고 나머지에서 택한다.\n- 도형: $n$ 개의 점(세 점이 일직선 위에 있지 않음)으로 만드는 직선 ${}_n\\mathrm{C}_2$, 삼각형 ${}_n\\mathrm{C}_3$\n- 일직선 위의 점이 있으면 그 경우를 빼 준다.',
      },
    ],
    skills: [
      {
        id: 'sum-product',
        title: '합의 법칙과 곱의 법칙',
        gen(r, level) {
          if (level === 1) {
            const ex = [r.int(1, 3), r.int(1, 2), r.int(0, 2)];
            const N = 2 ** ex[0] * 3 ** ex[1] * 5 ** ex[2];
            const cnt = (ex[0] + 1) * (ex[1] + 1) * (ex[2] + 1);
            const f = factorize(N);
            return {
              q: `$${N}$ 의 약수의 개수를 구하세요.`,
              answer: { type: 'num', value: cnt, unit: '개' },
              steps: [`$${N}=${f.map(([p, e]) => (e === 1 ? `${p}` : `${p}^{${e}}`)).join('\\times')}$`, `약수의 개수: $${f.map(([, e]) => `(${e}+1)`).join('\\times')}=${cnt}$`],
            };
          }
          if (level === 2) {
            const p = r.int(2, 4),
              q = r.int(2, 4),
              s = r.int(1, 3);
            const [A, B, C] = r.pick([
              ['집', '서점', '학교'],
              ['A 마을', 'B 마을', 'C 마을'],
              ['도서관', '공원', '박물관'],
            ]);
            return {
              q: `${A}에서 ${B}까지 가는 길이 $${p}$ 가지, ${B}에서 ${C}까지 가는 길이 $${q}$ 가지, ${A}에서 ${C}${(C.charCodeAt(C.length - 1) - 0xac00) % 28 === 0 || (C.charCodeAt(C.length - 1) - 0xac00) % 28 === 8 ? '로' : '으로'} 바로 가는 길이 $${s}$ 가지 있다. ${A}에서 ${C}까지 가는 방법의 수는? (같은 지점을 두 번 지나지 않음)`,
              answer: numChoices(r, p * q + s, [p * q, p + q + s, p * q * s, (p + s) * q]),
              steps: [`${B}을 거쳐 가는 방법: $${p}\\times${q}=${p * q}$ (곱의 법칙)`, `바로 가는 방법 $${s}$ 가지를 더하면 $${p * q + s}$ (합의 법칙)`],
            };
          }
          const a = r.int(1, 3),
            b = r.int(1, 4),
            c = r.int(1, 5);
          return {
            q: `$500$ 원짜리 동전 $${a}$ 개, $100$ 원짜리 동전 $${b}$ 개, $10$ 원짜리 동전 $${c}$ 개의 일부 또는 전부를 사용하여 지불하는 방법의 수를 구하세요. (단, $0$ 원을 지불하는 것은 제외)`,
            answer: { type: 'num', value: (a + 1) * (b + 1) * (c + 1) - 1, unit: '가지' },
            steps: [`각 동전을 $0$ 개부터 쓸 수 있으므로 $${a + 1}\\times${b + 1}\\times${c + 1}=${(a + 1) * (b + 1) * (c + 1)}$`, `$0$ 원인 경우 $1$ 가지를 빼면 $${(a + 1) * (b + 1) * (c + 1) - 1}$`],
          };
        },
      },
      {
        id: 'permutation',
        title: '순열',
        gen(r, level) {
          if (level === 1) {
            const n = r.int(4, 9),
              k = r.int(2, 3);
            return {
              q: `$${'{}'}_{${n}}\\mathrm{P}_{${k}}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: nPr(n, k) },
              steps: [`$${'{}'}_{${n}}\\mathrm{P}_{${k}}=${Array.from({ length: k }, (_, i) => n - i).join('\\times')}$`, `$=${nPr(n, k)}$`],
            };
          }
          if (level === 2) {
            const n = r.int(4, 7),
              k = r.int(2, 3);
            if (k >= n) return this.gen(r, level);
            const v = factorial(n - k + 1) * factorial(k);
            return {
              q: `$${n}$ 명의 학생이 한 줄로 설 때, 특정한 $${k}$ 명이 서로 이웃하여 서는 경우의 수는?`,
              answer: numChoices(r, v, [factorial(n - k + 1), factorial(n) - v, factorial(n), factorial(n - k) * factorial(k)]),
              steps: [`이웃하는 $${k}$ 명을 한 묶음으로 보면 $${n - k + 1}!=${factorial(n - k + 1)}$`, `묶음 안에서 자리를 바꾸는 $${k}!=${factorial(k)}$`, `$${factorial(n - k + 1)}\\times${factorial(k)}=${v}$`],
            };
          }
          const m = r.int(2, 4),
            f = r.int(2, Math.min(3, m + 1));
          const v = factorial(m) * nPr(m + 1, f);
          return {
            q: `남학생 $${m}$ 명과 여학생 $${f}$ 명이 한 줄로 설 때, 여학생끼리는 서로 이웃하지 않게 서는 경우의 수를 구하세요.`,
            answer: { type: 'num', value: v, unit: '가지' },
            steps: [`남학생을 먼저 세우는 방법 $${m}!=${factorial(m)}$`, `남학생 사이사이와 양 끝 $${m + 1}$ 곳 중 $${f}$ 곳에 여학생을 세우는 방법 $${'{}'}_{${m + 1}}\\mathrm{P}_{${f}}=${nPr(m + 1, f)}$`, `$${factorial(m)}\\times${nPr(m + 1, f)}=${v}$`],
          };
        },
      },
      {
        id: 'combination',
        title: '조합',
        gen(r, level) {
          if (level === 1) {
            const n = r.int(5, 10),
              k = r.int(2, 4);
            if (r.chance(0.5)) {
              return {
                q: `$${'{}'}_{${n}}\\mathrm{C}_{${k}}$ 의 값을 구하세요.`,
                answer: { type: 'num', value: nCr(n, k) },
                steps: [`$${'{}'}_{${n}}\\mathrm{C}_{${k}}=\\frac{${Array.from({ length: k }, (_, i) => n - i).join('\\times')}}{${k}!}$`, `$=${nCr(n, k)}$`],
              };
            }
            return {
              q: `$${n}$ 명의 후보 중에서 대표 $${k}$ 명을 뽑는 경우의 수를 구하세요.`,
              answer: { type: 'num', value: nCr(n, k), unit: '가지' },
              steps: [`순서를 생각하지 않으므로 $${'{}'}_{${n}}\\mathrm{C}_{${k}}$`, `$=${nCr(n, k)}$`],
            };
          }
          if (level === 2) {
            if (r.chance(0.5)) {
              const a = r.int(3, 6),
                b = r.int(3, 6),
                p = r.int(1, 2),
                q = r.int(1, 3);
              return {
                q: `남학생 $${a}$ 명, 여학생 $${b}$ 명 중에서 남학생 $${p}$ 명, 여학생 $${q}$ 명을 뽑는 경우의 수는?`,
                answer: numChoices(r, nCr(a, p) * nCr(b, q), [nCr(a, p) + nCr(b, q), nCr(a + b, p + q), nPr(a, p) * nPr(b, q)]),
                steps: [`$${'{}'}_{${a}}\\mathrm{C}_{${p}}\\times${'{}'}_{${b}}\\mathrm{C}_{${q}}=${nCr(a, p)}\\times${nCr(b, q)}$`, `$=${nCr(a, p) * nCr(b, q)}$`],
              };
            }
            const n = r.int(6, 10),
              k = r.int(3, 4);
            return {
              q: `$${n}$ 명 중에서 $${k}$ 명을 뽑을 때, 특정한 $1$ 명이 반드시 포함되는 경우의 수는?`,
              answer: numChoices(r, nCr(n - 1, k - 1), [nCr(n, k), nCr(n - 1, k), nCr(n, k - 1), nPr(n - 1, k - 1)]),
              steps: ['특정한 $1$ 명을 먼저 뽑고', `나머지 $${n - 1}$ 명 중 $${k - 1}$ 명: $${'{}'}_{${n - 1}}\\mathrm{C}_{${k - 1}}=${nCr(n - 1, k - 1)}$`],
            };
          }
          const n = r.int(7, 10),
            k = r.int(3, 5);
          const v = nCr(n, 3) - nCr(k, 3);
          return {
            q: `평면 위에 $${n}$ 개의 점이 있고, 이 중 $${k}$ 개만 한 직선 위에 있고 나머지는 어느 세 점도 한 직선 위에 있지 않다. 이 점들 중 세 점을 꼭짓점으로 하는 삼각형의 개수를 구하세요.`,
            answer: { type: 'num', value: v, unit: '개' },
            steps: [`세 점을 택하는 경우 $${'{}'}_{${n}}\\mathrm{C}_3=${nCr(n, 3)}$`, `한 직선 위의 $${k}$ 개에서 세 점을 택하면 삼각형이 안 됨: $${'{}'}_{${k}}\\mathrm{C}_3=${nCr(k, 3)}$`, `$${nCr(n, 3)}-${nCr(k, 3)}=${v}$`],
          };
        },
      },
      {
        id: 'digits',
        title: '숫자 카드로 수 만들기',
        gen(r, level) {
          const n = r.int(3, 7); // 0 ~ n
          const total = n * n * (n - 1); // 세 자리 수: n개 숫자 1~n 과 0
          if (level === 1) {
            const m = r.int(4, 8),
              k = r.int(2, 3);
            return {
              q: `$1$ 부터 $${m}$ 까지의 숫자가 각각 적힌 $${m}$ 장의 카드 중 $${k}$ 장을 뽑아 만들 수 있는 ${k === 2 ? '두' : '세'} 자리 자연수의 개수를 구하세요.`,
              answer: { type: 'num', value: nPr(m, k), unit: '개' },
              steps: [`서로 다른 $${m}$ 개에서 $${k}$ 개를 택해 나열: $${'{}'}_{${m}}\\mathrm{P}_${k}$`, `$=${nPr(m, k)}$`],
            };
          }
          if (level === 2) {
            return {
              q: `$0$ 부터 $${n}$ 까지의 숫자가 각각 적힌 $${n + 1}$ 장의 카드 중 $3$ 장을 뽑아 만들 수 있는 세 자리 자연수의 개수는?`,
              answer: numChoices(r, total, [nPr(n + 1, 3), nPr(n, 3), (n + 1) ** 3, n * nPr(n, 2) + 1]),
              steps: [`백의 자리: $0$ 제외 $${n}$ 가지`, `나머지 두 자리: 남은 $${n}$ 장에서 $2$ 장 나열 $${'{}'}_{${n}}\\mathrm{P}_2=${nPr(n, 2)}$`, `$${n}\\times${nPr(n, 2)}=${total}$`],
            };
          }
          // 0~n 에서 세 자리 짝수 / 홀수
          const odd = r.chance(0.4);
          let cnt = 0;
          for (let a = 1; a <= n; a++) for (let b = 0; b <= n; b++) for (let c = 0; c <= n; c++) if (a !== b && b !== c && a !== c && c % 2 === (odd ? 1 : 0)) cnt++;
          const evens = Math.floor(n / 2) + 1;
          const odds = n + 1 - evens;
          return {
            q: `$0$ 부터 $${n}$ 까지의 숫자가 각각 적힌 $${n + 1}$ 장의 카드 중 $3$ 장을 뽑아 만들 수 있는 세 자리 자연수 중 ${odd ? '홀수' : '짝수'}의 개수를 구하세요.`,
            answer: { type: 'num', value: cnt, unit: '개' },
            steps: odd
              ? [`일의 자리에 홀수 $${odds}$ 가지`, `백의 자리: $0$ 과 일의 자리 숫자를 뺀 $${n - 1}$ 가지, 십의 자리: 남은 $${n - 1}$ 가지`, `$${odds}\\times${n - 1}\\times${n - 1}=${cnt}$`]
              : [`일의 자리가 $0$ 인 경우: $${'{}'}_{${n}}\\mathrm{P}_2=${nPr(n, 2)}$`, `일의 자리가 $0$ 이 아닌 짝수(${evens - 1} 가지)인 경우: 백의 자리 $${n - 1}$ 가지, 십의 자리 $${n - 1}$ 가지 → $${evens - 1}\\times${n - 1}\\times${n - 1}=${(evens - 1) * (n - 1) * (n - 1)}$`, `합: $${cnt}$`],
          };
        },
      },
      {
        id: 'npr-eq',
        title: '순열과 조합의 방정식',
        gen(r, level) {
          const n = r.int(4, 12);
          if (level === 1) {
            return {
              q: `$${'{}'}_{n}\\mathrm{P}_2=${nPr(n, 2)}$ 을 만족하는 자연수 $n$ 의 값을 구하세요.`,
              answer: { type: 'num', value: n },
              steps: [`$n(n-1)=${nPr(n, 2)}$`, `$${n}\\times${n - 1}=${nPr(n, 2)}$ 이므로 $n=${n}$`],
            };
          }
          if (level === 2) {
            return {
              q: `$${'{}'}_{n}\\mathrm{C}_2=${nCr(n, 2)}$ 을 만족하는 자연수 $n$ 의 값은?`,
              answer: numChoices(r, n, [n + 1, n - 1, nCr(n, 2) / 2, 2 * n].filter((v) => Number.isInteger(v))),
              steps: [`$\\frac{n(n-1)}{2}=${nCr(n, 2)}$, $n(n-1)=${n * (n - 1)}$`, `$n=${n}$`],
            };
          }
          const a = r.int(1, 4),
            b = a + r.int(1, 4);
          return {
            q: `$${'{}'}_{n}\\mathrm{C}_{${a}}={}_{n}\\mathrm{C}_{${b}}$ 를 만족하는 자연수 $n$ 의 값을 구하세요.`,
            answer: { type: 'num', value: a + b },
            steps: [`${'$'}{}_n\\mathrm{C}_r={}_n\\mathrm{C}_{n-r}$ 이고 $${a}\\ne${b}$ 이므로 $${a}=n-${b}$`, `$n=${a + b}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 행렬 ─────────────────────────
  'hc1-8': {
    concepts: [
      {
        title: '행렬의 뜻',
        body: '수를 직사각형 모양으로 배열하여 괄호로 묶은 것. 가로줄을 **행**, 세로줄을 **열**이라 하고, $m$ 개의 행과 $n$ 개의 열로 된 행렬을 $m\\times n$ 행렬이라 한다.\n- 제 $i$ 행 제 $j$ 열의 성분을 $(i,j)$ 성분 $a_{ij}$ 라 한다.\n- 두 행렬이 같으려면 꼴이 같고 대응하는 성분이 모두 같아야 한다.',
      },
      {
        title: '행렬의 덧셈·뺄셈·실수배',
        body: '같은 꼴의 행렬끼리 같은 위치의 성분을 더하거나 뺀다. 실수배 $kA$ 는 모든 성분에 $k$ 를 곱한다.\n$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}+\\begin{pmatrix} p & q \\\\ r & s \\end{pmatrix}=\\begin{pmatrix} a+p & b+q \\\\ c+r & d+s \\end{pmatrix}$$',
      },
      {
        title: '행렬의 곱셈',
        body: '$A$ 의 열의 개수와 $B$ 의 행의 개수가 같을 때 $AB$ 의 $(i,j)$ 성분은 $A$ 의 제 $i$ 행과 $B$ 의 제 $j$ 열의 성분을 차례로 곱해 더한 값.\n$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}\\begin{pmatrix} p & q \\\\ r & s \\end{pmatrix}=\\begin{pmatrix} ap+br & aq+bs \\\\ cp+dr & cq+ds \\end{pmatrix}$$\n- 일반적으로 $AB\\ne BA$ (교환법칙 불성립)',
        example: { q: '$\\begin{pmatrix} 1 & 2 \\\\ 0 & 1 \\end{pmatrix}\\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}$', a: '$\\begin{pmatrix} 11 \\\\ 4 \\end{pmatrix}$' },
      },
      {
        title: '단위행렬과 거듭제곱',
        body: '$E=\\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}$ 는 $AE=EA=A$ 를 만족한다. $A^2=AA$, $A^3=A^2A$\n- $\\begin{pmatrix} 1 & a \\\\ 0 & 1 \\end{pmatrix}^n=\\begin{pmatrix} 1 & na \\\\ 0 & 1 \\end{pmatrix}$',
      },
    ],
    skills: [
      {
        id: 'element',
        title: '행렬의 성분',
        gen(r, level) {
          const rules: [string, (i: number, j: number) => number][] = [
            ['i+j', (i, j) => i + j],
            ['2i-j', (i, j) => 2 * i - j],
            ['i-2j', (i, j) => i - 2 * j],
            ['ij', (i, j) => i * j],
            ['i^2-j', (i, j) => i * i - j],
            ['3i-2j', (i, j) => 3 * i - 2 * j],
          ];
          const [t, f] = r.pick(rules);
          const c = r.int(-2, 3);
          const g = (i: number, j: number) => f(i, j) + c;
          const tex = c === 0 ? t : `${t}${c > 0 ? '+' : ''}${c}`;
          if (level === 1) {
            const A = [
              [g(1, 1), g(1, 2)],
              [g(2, 1), g(2, 2)],
            ];
            return {
              q: `$2\\times2$ 행렬 $A$ 의 $(i,j)$ 성분 $a_{ij}$ 가 $a_{ij}=${tex}$ 일 때, 행렬 $A$ 의 각 성분을 구하세요.`,
              answer: { type: 'fields', fields: matFields(A) },
              steps: [`$a_{11}=${g(1, 1)}$, $a_{12}=${g(1, 2)}$, $a_{21}=${g(2, 1)}$, $a_{22}=${g(2, 2)}$`, `$A=${M2(A)}$`],
            };
          }
          if (level === 2) {
            let s = 0;
            for (let i = 1; i <= 2; i++) for (let j = 1; j <= 3; j++) s += g(i, j);
            return {
              q: `$2\\times3$ 행렬 $A$ 의 $(i,j)$ 성분 $a_{ij}$ 가 $a_{ij}=${tex}$ 일 때, 행렬 $A$ 의 모든 성분의 합은?`,
              answer: numChoices(r, s, [s + 3, s - 2, s * 2, g(2, 3) * 3]),
              steps: [`$A=${M2([[g(1, 1), g(1, 2), g(1, 3)], [g(2, 1), g(2, 2), g(2, 3)]])}$`, `모든 성분의 합 $=${s}$`],
            };
          }
          const k = r.int(1, 4);
          const alt = r.chance(0.5);
          const h = (i: number, j: number) => (i >= j ? (alt ? 2 * i - j : i + j) + k : i * j - k);
          const A = [1, 2, 3].map((i) => [1, 2, 3].map((j) => h(i, j)));
          const tr = A[0][0] + A[1][1] + A[2][2];
          const s = A.flat().reduce((u, v) => u + v, 0);
          return {
            q: `$3\\times3$ 행렬 $A$ 의 $(i,j)$ 성분 $a_{ij}$ 가 $a_{ij}=\\begin{cases} ${alt ? '2i-j' : 'i+j'}+${k} & (i\\ge j) \\\\ ij-${k} & (i<j) \\end{cases}$ 일 때, $a_{11}+a_{22}+a_{33}$ 과 모든 성분의 합을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'a₁₁+a₂₂+a₃₃', value: tr }, { label: '모든 성분의 합', value: s }] },
            steps: [`$A=${M2(A)}$`, `$a_{11}+a_{22}+a_{33}=${tr}$`, `모든 성분의 합 $=${s}$`],
          };
        },
      },
      {
        id: 'add-scalar',
        title: '행렬의 덧셈·뺄셈·실수배',
        gen(r, level) {
          const rm = () => [
            [r.int(-5, 5), r.int(-5, 5)],
            [r.int(-5, 5), r.int(-5, 5)],
          ];
          const A = rm(),
            B = rm();
          if (level === 3) {
            // 2X - A = B  → X = (A+B)/2, 정수 되게 B 조정
            const X = rm();
            const Bq = X.map((row, i) => row.map((v, j) => 2 * v - A[i][j]));
            return {
              q: `두 행렬 $A=${M2(A)}$, $B=${M2(Bq)}$ 에 대하여 $2X-A=B$ 를 만족하는 행렬 $X$ 의 각 성분을 구하세요.`,
              answer: { type: 'fields', fields: matFields(X) },
              steps: ['$2X=A+B$, $X=\\frac{1}{2}(A+B)$', `$A+B=${M2(A.map((row, i) => row.map((v, j) => v + Bq[i][j])))}$`, `$X=${M2(X)}$`],
            };
          }
          const p = level === 1 ? 1 : r.int(2, 3),
            q = level === 1 ? r.sign() : -r.int(1, 3);
          const C = A.map((row, i) => row.map((v, j) => p * v + q * B[i][j]));
          const expr = level === 1 ? `A${q > 0 ? '+' : '-'}B` : `${p}A${q === -1 ? '-' : q}B`;
          return {
            q: `두 행렬 $A=${M2(A)}$, $B=${M2(B)}$ 에 대하여 $${expr}$ 의 각 성분을 구하세요.`,
            answer: { type: 'fields', fields: matFields(C) },
            steps: ['같은 위치의 성분끼리 계산합니다.', `$${expr}=${M2(C)}$`],
          };
        },
      },
      {
        id: 'equality',
        title: '행렬이 서로 같을 조건',
        gen(r, level) {
          const x = r.int(-5, 6),
            y = r.int(-5, 6);
          if (level === 1) {
            const a = r.int(-4, 4),
              b = r.int(-4, 4);
            return {
              q: `$${M2([[`x${a >= 0 ? '+' : ''}${a}`, 3], [-1, `2y${b >= 0 ? '+' : ''}${b}`]])}=${M2([[x + a, 3], [-1, 2 * y + b]])}$ 일 때, $x$, $y$ 의 값을 구하세요.`.replace(/\+0/g, ''),
              answer: { type: 'fields', fields: [{ label: 'x', value: x }, { label: 'y', value: y }] },
              steps: ['대응하는 성분이 같아야 합니다.', `$x${a >= 0 ? '+' : ''}${a}=${x + a}$, $2y${b >= 0 ? '+' : ''}${b}=${2 * y + b}$`.replace(/\+0/g, ''), `$x=${x}$, $y=${y}$`],
            };
          }
          const p = r.int(1, 3),
            q = r.nonzero(-3, 3),
            s = r.int(1, 3),
            t = r.nonzero(-3, 3);
          if (p * t - q * s === 0) return this.gen(r, level);
          const e1 = termsTex([{ c: p, v: 'x' }, { c: q, v: 'y' }]),
            e2 = termsTex([{ c: s, v: 'x' }, { c: t, v: 'y' }]);
          if (level === 2) {
            return {
              q: `$${M2([[e1, 0], [2, e2]])}=${M2([[p * x + q * y, 0], [2, s * x + t * y]])}$ 일 때, $x$, $y$ 의 값을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'x', value: x }, { label: 'y', value: y }] },
              steps: [`$${e1}=${p * x + q * y}$, $${e2}=${s * x + t * y}$`, `연립하면 $x=${x}$, $y=${y}$`],
            };
          }
          const A = [
            [1, x],
            [y, 2],
          ];
          const Bm = [
            [r.int(-3, 3), r.int(-3, 3)],
            [r.int(-3, 3), r.int(-3, 3)],
          ];
          const C = mmul(A, Bm);
          if (Bm[1][0] === 0 && Bm[1][1] === 0) return this.gen(r, level);
          if (Bm[0][0] * Bm[1][1] - Bm[0][1] * Bm[1][0] === 0) return this.gen(r, level);
          return {
            q: `$${M2([[1, 'x'], ['y', 2]])}${M2(Bm)}=${M2(C)}$ 일 때, $x$, $y$ 의 값을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'x', value: x }, { label: 'y', value: y }] },
            steps: [`좌변 $=${M2([[termsTex([{ c: Bm[1][0], v: 'x' }, { c: Bm[0][0], v: '' }]), termsTex([{ c: Bm[1][1], v: 'x' }, { c: Bm[0][1], v: '' }])], [termsTex([{ c: Bm[0][0], v: 'y' }, { c: 2 * Bm[1][0], v: '' }]), termsTex([{ c: Bm[0][1], v: 'y' }, { c: 2 * Bm[1][1], v: '' }])]])}$`, '대응하는 성분을 비교하여 풉니다.', `$x=${x}$, $y=${y}$`],
          };
        },
      },
      {
        id: 'multiply',
        title: '행렬의 곱셈',
        gen(r, level) {
          const A = [
            [r.int(-3, 4), r.int(-3, 4)],
            [r.int(-3, 4), r.int(-3, 4)],
          ];
          if (level === 1) {
            const v = [[r.int(-4, 4)], [r.int(-4, 4)]];
            const C = mmul(A, v);
            return {
              q: `$${M2(A)}${M2(v)}$ 를 계산하여 각 성분을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: '(1,1) 성분', value: C[0][0] }, { label: '(2,1) 성분', value: C[1][0] }] },
              steps: [`$(1,1)$ 성분: $${A[0][0]}\\times${v[0][0] < 0 ? `(${v[0][0]})` : v[0][0]}+${A[0][1] < 0 ? `(${A[0][1]})` : A[0][1]}\\times${v[1][0] < 0 ? `(${v[1][0]})` : v[1][0]}=${C[0][0]}$`, `$(2,1)$ 성분: $${A[1][0]}\\times${v[0][0] < 0 ? `(${v[0][0]})` : v[0][0]}+${A[1][1] < 0 ? `(${A[1][1]})` : A[1][1]}\\times${v[1][0] < 0 ? `(${v[1][0]})` : v[1][0]}=${C[1][0]}$`],
            };
          }
          const B = [
            [r.int(-3, 4), r.int(-3, 4)],
            [r.int(-3, 4), r.int(-3, 4)],
          ];
          if (level === 2) {
            const C = mmul(A, B);
            return {
              q: `두 행렬 $A=${M2(A)}$, $B=${M2(B)}$ 에 대하여 $AB$ 의 각 성분을 구하세요.`,
              answer: { type: 'fields', fields: matFields(C) },
              steps: ['$AB$ 의 $(i,j)$ 성분 = $A$ 의 제 $i$ 행 · $B$ 의 제 $j$ 열', `$AB=${M2(C)}$`],
            };
          }
          const A2 = mmul(A, A);
          const k = r.int(1, 3);
          const C = A2.map((row, i) => row.map((v, j) => v - k * A[i][j]));
          return {
            q: `행렬 $A=${M2(A)}$ 에 대하여 $A^2-${k === 1 ? '' : k}A$ 의 각 성분을 구하세요.`,
            answer: { type: 'fields', fields: matFields(C) },
            steps: [`$A^2=${M2(A)}${M2(A)}=${M2(A2)}$`, `$${k === 1 ? '' : k}A=${M2(A.map((row) => row.map((v) => k * v)))}$`, `$A^2-${k === 1 ? '' : k}A=${M2(C)}$`],
          };
        },
      },
      {
        id: 'power',
        title: '행렬의 거듭제곱',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(-3, 4),
              b = r.int(-3, 3),
              c = r.int(-3, 3),
              d = r.int(-3, 4);
            const A = [
              [a, b],
              [c, d],
            ];
            return {
              q: `행렬 $A=${M2(A)}$ 에 대하여 $A^2$ 의 각 성분을 구하세요.`,
              answer: { type: 'fields', fields: matFields(mmul(A, A)) },
              steps: [`$A^2=AA=${M2(A)}${M2(A)}$`, `$=${M2(mmul(A, A))}$`],
            };
          }
          if (level === 2) {
            const a = r.nonzero(-4, 4),
              n = r.int(3, 20);
            const lower = r.chance(0.5);
            const A = lower ? [[1, 0], [a, 1]] : [[1, a], [0, 1]];
            const An = lower ? [[1, 0], [n * a, 1]] : [[1, n * a], [0, 1]];
            return {
              q: `행렬 $A=${M2(A)}$ 에 대하여 $A^{${n}}$ 의 각 성분을 구하세요.`,
              answer: { type: 'fields', fields: matFields(An) },
              steps: [`$A^2=${M2(lower ? [[1, 0], [2 * a, 1]] : [[1, 2 * a], [0, 1]])}$, $A^3=${M2(lower ? [[1, 0], [3 * a, 1]] : [[1, 3 * a], [0, 1]])}$, …`, `$A^{n}=${M2(lower ? [[1, 0], [termsTex([{ c: a, v: 'n' }]), 1]] : [[1, termsTex([{ c: a, v: 'n' }])], [0, 1]])}$ 이므로 $A^{${n}}=${M2(An)}$`],
            };
          }
          const a = r.int(-3, 4),
            b = r.nonzero(-3, 3),
            c = r.nonzero(-3, 3),
            d = r.int(-3, 4);
          const p = a + d,
            q = -(a * d - b * c);
          return {
            q: `행렬 $A=${M2([[a, b], [c, d]])}$ 와 단위행렬 $E$ 에 대하여 $A^2=pA+qE$ 를 만족하는 실수 $p$, $q$ 의 값을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'p', value: p }, { label: 'q', value: q }] },
            steps: [`$A^2=${M2(mmul([[a, b], [c, d]], [[a, b], [c, d]]))}$`, `$(1,2)$ 성분 비교: $${b * p}=${termsTex([{ c: b, v: 'p' }])}$ 에서 $p=${p}$`, `$(1,1)$ 성분 비교: $${a * a + b * c}=${termsTex([{ c: a, v: 'p' }, { c: 1, v: 'q' }])}$ 에서 $q=${q}$`],
          };
        },
      },
    ],
  },
};
