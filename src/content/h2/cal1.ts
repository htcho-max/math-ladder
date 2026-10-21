// 미적분Ⅰ (cal1-1 ~ cal1-7)
import type { ContentMap, ProblemDraft } from '../../core/types';
import type { Rng } from '../../core/rng';
import { F } from '../../core/frac';
import { poly, termsTex } from '../../core/tex';
import { Plane } from '../../core/fig';
import { P, absInt, cv, figOut, pDef, pDer, pEval, pInt, pMul, pRoots, pSub, pfn, pt, tch, wch, xm } from './util';
import type { P as Poly } from './util';
import { CAL1_WORD } from './word-cal1';
import { CAL1_HARD } from './hard-cal1';

const pp = (p: Poly, v = 'x') => poly(p, v);
const fv = (p: Poly, x: number) => pEval(p, x);
/** 계수가 정수인 임의 다항식 (최고차 계수 0 아님) */
function rPoly(r: Rng, deg: number, lim = 5): Poly {
  const c: number[] = [r.nonzero(-3, 3)];
  for (let i = 0; i < deg; i++) c.push(r.int(-lim, lim));
  return P(...c);
}
const cases = (rows: [string, string][]) => `\\begin{cases}${rows.map(([a, b]) => `${a} & (${b})`).join('\\\\ ')}\\end{cases}`;
/** 부호 붙은 항: kc(3,'x')='+3x', kc(-1,'x')='-x', kc(0,'x')='' (계수 0 이면 항 자체를 생략) */
const kc = (k: number, s: string) => (k === 0 ? '' : (k > 0 ? '+' : '-') + (Math.abs(k) === 1 && s !== '' ? '' : Math.abs(k)) + s);

/** 2x^3-3(α+β)x^2+6αβx+c 의 부호 s 배 (도함수 6s(x-α)(x-β)) */
function cubicWith(s: 1 | -1, al: number, be: number, c: number): Poly {
  return P(2 * s, -3 * (al + be) * s, 6 * al * be * s, c);
}

/** 영역 채우기용 다각형: y=f(x), y=g(x) 사이, x∈[a,b] */
function fillBetween(pl: Plane, f: (x: number) => number, g: (x: number) => number, a: number, b: number) {
  const pts: [number, number][] = [];
  const N = 60;
  for (let i = 0; i <= N; i++) {
    const x = a + ((b - a) * i) / N;
    pts.push([x, f(x)]);
  }
  for (let i = N; i >= 0; i--) {
    const x = a + ((b - a) * i) / N;
    pts.push([x, g(x)]);
  }
  pl.polygon(pts, { fill: true, cls: 'soft' });
}

function rangeOf(fs: ((x: number) => number)[], a: number, b: number): [number, number] {
  let lo = 0,
    hi = 0;
  for (const f of fs)
    for (let i = 0; i <= 100; i++) {
      const y = f(a + ((b - a) * i) / 100);
      lo = Math.min(lo, y);
      hi = Math.max(hi, y);
    }
  return [lo, hi];
}

function areaFig(fs: ((x: number) => number)[], a: number, b: number, fillF: (x: number) => number, fillG: (x: number) => number): string {
  const x0 = Math.min(0, a) - 1,
    x1 = Math.max(0, b) + 1;
  const [lo, hi] = rangeOf(fs, a, b);
  const pad = Math.max(1, (hi - lo) * 0.15);
  const span = Math.max(x1 - x0, hi - lo + 2 * pad);
  const step = span > 24 ? 5 : span > 12 ? 2 : 1;
  const pl = new Plane(x0, x1, Math.min(-1, lo - pad), Math.max(1, hi + pad), { w: 260, h: 220, step });
  fillBetween(pl, fillF, fillG, a, b);
  fs.forEach((f, i) => pl.fn(f, { cls: i ? 'acc2' : 'acc' }));
  return figOut(pl);
}

export const cal1: ContentMap = {
  // ───────────────────────── cal1-1 함수의 극한
  'cal1-1': {
    concepts: [
      {
        title: '함수의 극한',
        body: '$x$ 가 $a$ 가 아니면서 $a$ 에 한없이 가까워질 때 $f(x)$ 가 $L$ 에 한없이 가까워지면\n$$\\lim_{x\\to a}f(x)=L$$\n- $f(a)$ 의 값과 무관 ($x=a$ 에서 정의되지 않아도 됨)\n- 한없이 커지면 $\\lim f(x)=\\infty$ (발산)',
      },
      {
        title: '좌극한과 우극한',
        body: '- 우극한 $\\lim_{x\\to a+}f(x)$: $x>a$ 쪽에서 접근\n- 좌극한 $\\lim_{x\\to a-}f(x)$: $x<a$ 쪽에서 접근\n- $\\lim_{x\\to a}f(x)$ 가 존재 $\\iff$ 좌극한 $=$ 우극한',
      },
      {
        title: '극한의 계산',
        body: '- 다항함수: 그냥 대입\n- $\\frac{0}{0}$ 꼴: 인수분해 후 약분, 또는 근호가 있으면 유리화\n- $\\frac{\\infty}{\\infty}$ 꼴: 분모의 최고차항으로 분자·분모를 나눔 (차수가 같으면 최고차항 계수의 비)\n- $\\infty-\\infty$ 꼴: 유리화',
        example: { q: '$\\lim_{x\\to2}\\frac{x^{2}-4}{x-2}$', a: '$\\lim_{x\\to2}(x+2)=4$' },
      },
      {
        title: '미정계수의 결정',
        body: '$\\lim_{x\\to a}\\frac{f(x)}{g(x)}=L$ (수렴) 이고 $\\lim g(x)=0$ 이면 $\\lim f(x)=0$ 이어야 합니다.\n- 분모 $\\to0$ 이면 분자 $\\to0$ → 미정계수 사이의 관계식이 생김',
      },
    ],
    skills: [
      {
        id: 'limit-poly',
        title: '다항·유리함수의 극한',
        gen(r, level): ProblemDraft {
          const a = r.int(-4, 4);
          if (level === 1) {
            const f = rPoly(r, r.pick([2, 3]), 4);
            return {
              q: `$\\lim_{x\\to${a}}(${pp(f)})$ 의 값을 구하세요.`,
              answer: { type: 'num', value: fv(f, a).value },
              steps: [`다항함수는 $x=${a}$ 를 그대로 대입: $${fv(f, a).tex()}$`],
            };
          }
          if (level === 2) {
            let b = r.nonzero(-5, 5);
            if (b === a) b = b === 5 ? -5 : b + 1;
            const num = pRoots(1, [a, b]);
            if (r.chance(0.5) || a === 0) {
              return {
                q: `$\\lim_{x\\to${a}}\\frac{${pp(num)}}{${xm('x', a)}}$ 의 값을 구하세요.`,
                answer: { type: 'num', value: a - b },
                steps: [`$\\frac{0}{0}$ 꼴: $\\frac{(${xm('x', a)})(${xm('x', b)})}{${xm('x', a)}}=${xm('x', b)}$`, `$x\\to${a}$: $${a}-${b < 0 ? `(${b})` : b}=${a - b}$`],
              };
            }
            const v = new F(a - b, 2 * a);
            return {
              q: `$\\lim_{x\\to${a}}\\frac{${pp(num)}}{x^{2}-${a * a}}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v.value, display: 'frac' },
              steps: [`$\\frac{(${xm('x', a)})(${xm('x', b)})}{(${xm('x', a)})(${xm('x', -a)})}=\\frac{${xm('x', b)}}{${xm('x', -a)}}$`, `$x\\to${a}$: $\\frac{${a - b}}{${2 * a}}=${v.tex()}$`],
            };
          }
          let c = r.nonzero(-4, 4);
          if (c === a) c = c > 0 ? c - 5 : c + 5;
          const q = rPoly(r, 2, 4);
          const num = pMul(P(1, -a), q),
            den = pRoots(1, [a, c]);
          const v = fv(q, a).div(a - c);
          return {
            q: `$\\lim_{x\\to${a}}\\frac{${pp(num)}}{${pp(den)}}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: v.value, display: 'frac' },
            steps: [`분자·분모 모두 $x=${a}$ 에서 $0$ → $${xm('x', a)}$ 를 인수로 가짐`, `$\\frac{(${xm('x', a)})(${pp(q)})}{(${xm('x', a)})(${xm('x', c)})}=\\frac{${pp(q)}}{${xm('x', c)}}$`, `$x=${a}$ 대입: $\\frac{${fv(q, a).tex()}}{${a - c}}=${v.tex()}$`],
          };
        },
      },
      {
        id: 'limit-infinity',
        title: '$x\\to\\infty$ 일 때의 극한',
        gen(r, level) {
          if (level === 1) {
            const n = rPoly(r, 2, 6),
              d = rPoly(r, 2, 6);
            const lowNum = r.chance(0.3);
            const N = lowNum ? n.slice(1) : n;
            const v = lowNum ? new F(0) : n[0].div(d[0]);
            return {
              q: `$\\lim_{x\\to\\infty}\\frac{${pp(N)}}{${pp(d)}}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v.value, display: 'frac' },
              steps: [`분자·분모를 $x^{2}$ 으로 나누면 $x\\to\\infty$ 일 때 $\\frac{1}{x}\\to0$`, lowNum ? `분자의 차수가 더 낮으므로 극한값은 $0$` : `최고차항 계수의 비: $\\frac{${n[0].tex()}}{${d[0].tex()}}=${v.tex()}$`],
            };
          }
          if (level === 2) {
            const p = r.int(1, 4),
              b = r.int(-6, 6),
              q = r.nonzero(-4, 4),
              c = r.int(-5, 5);
            const neg = r.chance(0.4);
            const v = new F(neg ? -p : p, q);
            return {
              q: `$\\lim_{x\\to${neg ? '-' : ''}\\infty}\\frac{\\sqrt{${pp(P(p * p, b, 0))}}}{${pp(P(q, c))}}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v.value, display: 'frac' },
              steps: [
                neg ? `$x<0$ 이므로 $\\sqrt{x^{2}}=-x$: 분자·분모를 $-x$ 로 나눔` : `분자·분모를 $x$ 로 나눔 ($x>0$ 이면 $\\sqrt{x^{2}}=x$)`,
                `$\\frac{\\sqrt{${p * p}${b === 0 ? '' : b > 0 ? `+\\frac{${b}}{x}` : `-\\frac{${-b}}{x}`}}}{${neg ? '-' : ''}(${q}${c === 0 ? '' : c > 0 ? `+\\frac{${c}}{x}` : `-\\frac{${-c}}{x}`})}\\to${v.tex()}$`,
              ],
              hint: neg ? '$x\\to-\\infty$ 이면 $x<0$ 입니다.' : undefined,
            };
          }
          const a = r.nonzero(-8, 8);
          let b = r.int(-8, 8);
          if (b === a) b += 1;
          const two = r.chance(0.5);
          const v = new F(two ? a - b : a, 2);
          const expr = two ? `\\sqrt{${pp(P(1, a, 0))}}-\\sqrt{${pp(P(1, b, 0))}}` : `\\sqrt{${pp(P(1, a, 0))}}-x`;
          return {
            q: `$\\lim_{x\\to\\infty}(${expr})$ 의 값을 구하세요.`,
            answer: { type: 'num', value: v.value, display: 'frac' },
            steps: [
              `$\\infty-\\infty$ 꼴 → 유리화: $\\frac{${two ? `(${pp(P(1, a, 0))})-(${pp(P(1, b, 0))})` : `(${pp(P(1, a, 0))})-x^{2}`}}{${two ? `\\sqrt{${pp(P(1, a, 0))}}+\\sqrt{${pp(P(1, b, 0))}}` : `\\sqrt{${pp(P(1, a, 0))}}+x`}}$`,
              `분자 $${cv(two ? a - b : a, 'x')}$, 분자·분모를 $x$ 로 나누면 $\\frac{${two ? a - b : a}}{1+1}=${v.tex()}$`,
            ],
          };
        },
      },
      {
        id: 'one-sided',
        title: '그래프와 좌극한·우극한',
        gen(r, level) {
          for (;;) {
            const c = r.int(-1, 2);
            const m1 = r.int(-2, 2),
              m2 = r.int(-2, 2);
            const Lv = r.int(-3, 3),
              Rv = r.int(-3, 3);
            if (Lv === Rv) continue;
            const n1 = Lv - m1 * c,
              n2 = Rv - m2 * c;
            const f1 = (x: number) => m1 * x + n1,
              f2 = (x: number) => m2 * x + n2;
            if (Math.abs(f1(-4)) > 5 || Math.abs(f2(4)) > 5) continue;
            const pl = new Plane(-4, 4, -5, 5, { w: 240, h: 260 });
            pl.fn(f1, { b: c });
            pl.fn(f2, { a: c });
            pl.point(c, Lv, undefined, { open: true });
            pl.point(c, Rv);
            const fig = figOut(pl);
            const fdef = `y=f(x)`;
            if (level === 1) {
              return {
                q: `함수 $${fdef}$ 의 그래프가 그림과 같을 때, $\\lim_{x\\to${c}-}f(x)+\\lim_{x\\to${c}+}f(x)$ 의 값을 구하세요.`,
                fig,
                answer: { type: 'num', value: Lv + Rv },
                steps: [`왼쪽에서 다가가면 $${Lv}$, 오른쪽에서 다가가면 $${Rv}$`, `$${Lv}+${Rv < 0 ? `(${Rv})` : Rv}=${Lv + Rv}$`],
              };
            }
            if (level === 2) {
              const d = c + r.pick([-2, 2]);
              const fd = d < c ? f1(d) : f2(d);
              return {
                q: `함수 $${fdef}$ 의 그래프가 그림과 같을 때, $\\lim_{x\\to${c}-}f(x)+f(${c})+\\lim_{x\\to${d}}f(x)$ 의 값을 구하세요.`,
                fig,
                answer: { type: 'num', value: Lv + Rv + fd },
                steps: [`$\\lim_{x\\to${c}-}f(x)=${Lv}$, $f(${c})=${Rv}$ (색칠된 점)`, `$x=${d}$ 에서는 연속이므로 $\\lim_{x\\to${d}}f(x)=${fd}$`, `합: $${Lv + Rv + fd}$`],
              };
            }
            return {
              q: `함수 $${fdef}$ 의 그래프가 그림과 같을 때, $\\lim_{x\\to${-c}+}f(-x)+\\lim_{x\\to${c}+}f(x)$ 의 값을 구하세요.`,
              fig,
              answer: { type: 'num', value: Lv + Rv },
              steps: [`$-x=t$ 로 놓으면 $x\\to${-c}+$ 일 때 $t\\to${c}-$`, `$\\lim_{t\\to${c}-}f(t)=${Lv}$, $\\lim_{x\\to${c}+}f(x)=${Rv}$`, `합: $${Lv + Rv}$`],
              hint: '$-x$ 가 어느 쪽에서 다가가는지 생각하세요.',
            };
          }
        },
      },
      {
        id: 'undetermined',
        title: '극한과 미정계수',
        gen(r, level) {
          const a = r.nonzero(-4, 4);
          if (level < 3) {
            let b = r.int(-5, 5);
            if (b === a) b -= 1;
            const p = -(a + b),
              q = a * b;
            if (level === 1) {
              return {
                q: `$\\lim_{x\\to${a}}\\frac{x^{2}+ax+b}{${xm('x', a)}}=${a - b}$ 일 때, 상수 $a$, $b$ 의 값을 구하세요.`,
                answer: { type: 'fields', fields: [{ label: 'a', value: p }, { label: 'b', value: q }] },
                steps: [`분모 $\\to0$ 이므로 분자 $\\to0$: $${a * a}+${a < 0 ? `(${a})` : a}a+b=0$`, `분자 $=(${xm('x', a)})(x-k)$ 꼴, 극한값 $${a}-k=${a - b}$ 에서 $k=${b}$`, `$x^{2}+ax+b=${pp(P(1, p, q))}$ 이므로 $a=${p}$, $b=${q}$`],
              };
            }
            const v = new F(a - b, 2 * a);
            return {
              q: `$\\lim_{x\\to${a}}\\frac{x^{2}+ax+b}{x^{2}-${a * a}}=${v.tex()}$ 일 때, 상수 $a$, $b$ 의 값을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'a', value: p }, { label: 'b', value: q }] },
              steps: [`분모 $\\to0$ 이므로 분자는 $${xm('x', a)}$ 를 인수로 가짐: 분자 $=(${xm('x', a)})(x-k)$`, `$\\frac{x-k}{${xm('x', -a)}}\\to\\frac{${a}-k}{${2 * a}}=${v.tex()}$ 에서 $k=${b}$`, `$a=${p}$, $b=${q}$`],
            };
          }
          const c = r.int(1, 4);
          const A = r.int(-3, 6);
          const b = c * c - A;
          return {
            q: `$\\lim_{x\\to${A}}\\frac{\\sqrt{x+a}-b}{${xm('x', A)}}=\\frac{1}{${2 * c}}$ 일 때, 상수 $a$, $b$ 에 대하여 $a+b$ 의 값을 구하세요. (단, $b>0$)`,
            answer: { type: 'num', value: b + c },
            steps: [`분모 $\\to0$ 이므로 $\\sqrt{${A}+a}=b$`, `유리화하면 극한값은 $\\frac{1}{\\sqrt{${A}+a}+b}=\\frac{1}{2b}=\\frac{1}{${2 * c}}$, $b=${c}$`, `$${A}+a=${c * c}$, $a=${b}$ → $a+b=${b + c}$`],
          };
        },
      },
      {
        id: 'rationalize',
        title: '무리식의 극한',
        gen(r, level) {
          const c = r.int(1, 5);
          const a = r.int(-3, 8);
          const b = c * c - a;
          const rt = `\\sqrt{${pp(P(1, b))}}`;
          if (level === 1) {
            const v = new F(1, 2 * c);
            return {
              q: `$\\lim_{x\\to${a}}\\frac{${rt}-${c}}{${xm('x', a)}}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v.value, display: 'frac' },
              steps: [`분자·분모에 $${rt}+${c}$ 를 곱하면 $\\frac{${xm('x', a)}}{(${xm('x', a)})(${rt}+${c})}$`, `$=\\frac{1}{${rt}+${c}}\\to\\frac{1}{${2 * c}}$`],
            };
          }
          if (level === 2) {
            if (r.chance(0.5) || a === 0) {
              return {
                q: `$\\lim_{x\\to${a}}\\frac{${xm('x', a)}}{${rt}-${c}}$ 의 값을 구하세요.`,
                answer: { type: 'num', value: 2 * c },
                steps: [`분자·분모에 $${rt}+${c}$ 를 곱하면 $\\frac{(${xm('x', a)})(${rt}+${c})}{${xm('x', a)}}$`, `$=${rt}+${c}\\to${2 * c}$`],
              };
            }
            const v = new F(1, 4 * a * c);
            return {
              q: `$\\lim_{x\\to${a}}\\frac{${rt}-${c}}{x^{2}-${a * a}}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v.value, display: 'frac' },
              steps: [`유리화: $\\frac{${xm('x', a)}}{(${xm('x', a)})(${xm('x', -a)})(${rt}+${c})}$`, `$=\\frac{1}{(${xm('x', -a)})(${rt}+${c})}\\to\\frac{1}{${2 * a}\\times${2 * c}}=${v.tex()}$`],
            };
          }
          const m = r.int(1, 5);
          const A = m * m;
          const v = new F(1, m);
          return {
            q: `$\\lim_{x\\to0}\\frac{\\sqrt{${A}+x}-\\sqrt{${A}-x}}{x}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: v.value, display: 'frac' },
            steps: [`유리화: $\\frac{(${A}+x)-(${A}-x)}{x(\\sqrt{${A}+x}+\\sqrt{${A}-x})}=\\frac{2}{\\sqrt{${A}+x}+\\sqrt{${A}-x}}$`, `$x\\to0$: $\\frac{2}{${2 * m}}=${v.tex()}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── cal1-2 함수의 연속
  'cal1-2': {
    concepts: [
      {
        title: '연속의 뜻',
        body: '함수 $f(x)$ 가 $x=a$ 에서 연속이려면 세 조건을 모두 만족해야 합니다.\n- (i) $f(a)$ 가 정의됨\n- (ii) $\\lim_{x\\to a}f(x)$ 가 존재\n- (iii) $\\lim_{x\\to a}f(x)=f(a)$\n하나라도 아니면 **불연속**.',
      },
      {
        title: '연속함수의 성질',
        body: '$f, g$ 가 $x=a$ 에서 연속이면 $f\\pm g$, $fg$, $\\frac{f}{g}\\,(g(a)\\ne0)$ 도 연속.\n- 다항함수는 실수 전체에서 연속\n- 유리함수는 분모가 $0$ 이 아닌 곳에서 연속',
      },
      {
        title: '최대·최소 정리',
        body: '$f(x)$ 가 **닫힌구간** $[a, b]$ 에서 연속이면 이 구간에서 반드시 최댓값과 최솟값을 가집니다.',
      },
      {
        title: '사잇값 정리',
        body: '$f(x)$ 가 $[a, b]$ 에서 연속이고 $f(a)\\ne f(b)$ 이면 $f(a)$ 와 $f(b)$ 사이의 모든 값 $k$ 에 대하여 $f(c)=k$ 인 $c$ 가 $(a, b)$ 에 존재.\n- 특히 $f(a)f(b)<0$ 이면 방정식 $f(x)=0$ 은 $(a, b)$ 에서 적어도 하나의 실근을 가짐',
        example: { q: '$x^{3}+x-1=0$ 은 어느 구간에 실근이 있나?', a: '$f(0)=-1<0$, $f(1)=1>0$ 이므로 $(0, 1)$' },
      },
    ],
    skills: [
      {
        id: 'piecewise-continuous',
        title: '연속이 되도록 상수 정하기',
        gen(r, level) {
          if (level === 1) {
            const a = r.nonzero(-4, 4);
            let b = r.nonzero(-5, 5);
            if (b === a) b = -b;
            return {
              q: `함수 $f(x)=${cases([[`\\frac{${pp(pRoots(1, [a, b]))}}{${xm('x', a)}}`, `x\\ne${a}`], ['k', `x=${a}`]])}$ 가 $x=${a}$ 에서 연속일 때, 상수 $k$ 의 값을 구하세요.`,
              answer: { type: 'num', value: a - b },
              steps: [`$\\lim_{x\\to${a}}\\frac{(${xm('x', a)})(${xm('x', b)})}{${xm('x', a)}}=\\lim_{x\\to${a}}(${xm('x', b)})=${a - b}$`, `연속이려면 $f(${a})=k=${a - b}$`],
            };
          }
          if (level === 2) {
            const c = r.pick([-2, 1, 2, 3]),
              a = r.int(-5, 5),
              m = r.nonzero(-3, 3),
              s = r.int(-4, 4);
            const t = a * (c + 1) - m * c + c * c + s;
            const lf = `x^{2}+ax${s === 0 ? '' : (s > 0 ? '+' : '') + s}`;
            const rf = `${cv(m, 'x')}-a${t === 0 ? '' : (t > 0 ? '+' : '') + t}`;
            return {
              q: `함수 $f(x)=${cases([[lf, `x<${c}`], [rf, `x\\ge${c}`]])}$ 가 실수 전체에서 연속일 때, 상수 $a$ 의 값을 구하세요.`,
              answer: { type: 'num', value: a },
              steps: [`$x=${c}$ 에서 좌극한 = 함숫값: $${c * c}+${c < 0 ? `(${c})` : c}a${kc(s, '')}=${m * c}-a${kc(t, '')}$`, `$${cv(c + 1, 'a')}=${m * c + t - c * c - s}$`, `$a=${a}$`],
            };
          }
          const c1 = r.int(-3, -1),
            c2 = r.int(1, 3);
          const g = P(1, r.int(-3, 3), r.int(-3, 3));
          const m = r.nonzero(-3, 3);
          const a = fv(g, c1).value - c1,
            b = fv(g, c2).value - m * c2;
          return {
            q: `함수 $f(x)=${cases([[`x+a`, `x<${c1}`], [pp(g), `${c1}\\le x<${c2}`], [`${cv(m, 'x')}+b`, `x\\ge${c2}`]])}$ 가 실수 전체에서 연속일 때, 상수 $a$, $b$ 에 대하여 $a+b$ 의 값을 구하세요.`,
            answer: { type: 'num', value: a + b },
            steps: [`$x=${c1}$ 에서 연속: $${c1}+a=${fv(g, c1).tex()}$, $a=${a}$`, `$x=${c2}$ 에서 연속: $${m * c2}+b=${fv(g, c2).tex()}$, $b=${b}$`, `$a+b=${a + b}$`],
          };
        },
      },
      {
        id: 'discontinuity-count',
        title: '그래프에서 불연속점 찾기',
        gen(r, level) {
          const ks = [-2, -1, 0, 1, 2];
          const yl: number[] = [],
            yr: number[] = [];
          let prev = r.int(-2, 2);
          for (let i = 0; i < 6; i++) {
            yl.push(prev);
            yr.push(Math.max(-3, Math.min(3, prev + r.int(-2, 2))));
            prev = yr[i];
          }
          // 각 내부 정수점의 유형: 0 연속, 1 점프, 2 제거가능(극한 존재, 함숫값 다름)
          const types = ks.map(() => (level === 1 ? r.pick([0, 1, 1]) : r.pick([0, 1, 2])));
          const fvals: number[] = [];
          ks.forEach((k, i) => {
            const leftLim = yr[i];
            if (types[i] === 1) {
              let jump = r.nonzero(-2, 2);
              if (Math.abs(leftLim + jump) > 3) jump = -jump;
              yl[i + 1] = leftLim + jump;
              fvals.push(r.chance(0.5) ? yl[i + 1] : leftLim);
            } else if (types[i] === 2) {
              yl[i + 1] = leftLim;
              let fvv = leftLim + r.nonzero(-2, 2);
              if (Math.abs(fvv) > 3) fvv = leftLim - Math.sign(fvv - leftLim) * 1;
              fvals.push(fvv);
            } else {
              yl[i + 1] = leftLim;
              fvals.push(leftLim);
            }
            void k;
          });
          // yl 이 바뀌었으니 yr 도 이어서 재조정 (구간 안 기울기 유지)
          for (let i = 1; i < 6; i++) yr[i] = Math.max(-3, Math.min(3, yr[i]));
          const pl = new Plane(-3, 3, -4, 4, { w: 260, h: 240 });
          for (let i = 0; i < 6; i++) pl.seg(-3 + i, yl[i], -2 + i, yr[i], { cls: 'acc' });
          // 경계 처리
          ks.forEach((k, i) => {
            const lft = yr[i],
              rgt = yl[i + 1],
              v = fvals[i];
            if (lft === rgt && rgt === v) return;
            if (lft !== v) pl.point(k, lft, undefined, { open: true });
            if (rgt !== v && rgt !== lft) pl.point(k, rgt, undefined, { open: true });
            if (rgt !== v && rgt === lft) {
              /* 이미 표시 */
            }
            pl.point(k, v);
          });
          pl.point(-3, yl[0]);
          pl.point(3, yr[5]);
          const fig = figOut(pl);
          const disc = ks.filter((_, i) => !(yr[i] === yl[i + 1] && yl[i + 1] === fvals[i])).length;
          const noLim = ks.filter((_, i) => yr[i] !== yl[i + 1]).length;
          if (level < 3) {
            return {
              q: `$-3\\le x\\le3$ 에서 정의된 함수 $y=f(x)$ 의 그래프가 그림과 같습니다. 열린구간 $(-3, 3)$ 에서 $f(x)$ 가 불연속인 $x$ 의 개수를 구하세요.`,
              fig,
              answer: { type: 'num', value: disc, unit: '개' },
              steps: [
                ...ks.map((k, i) => `$x=${k}$: 좌극한 $${yr[i]}$, 우극한 $${yl[i + 1]}$, $f(${k})=${fvals[i]}$ → ${yr[i] === yl[i + 1] && yl[i + 1] === fvals[i] ? '연속' : '불연속'}`),
                `불연속인 점: $${disc}$ 개`,
              ],
            };
          }
          return {
            q: `$-3\\le x\\le3$ 에서 정의된 함수 $y=f(x)$ 의 그래프가 그림과 같습니다. 열린구간 $(-3, 3)$ 에서 $\\lim_{x\\to a}f(x)$ 가 존재하지 않는 $a$ 의 개수를 $m$, $f(x)$ 가 불연속인 $x$ 의 개수를 $n$ 이라 할 때, $m+n$ 의 값을 구하세요.`,
            fig,
            answer: { type: 'num', value: noLim + disc },
            steps: [
              ...ks.map((k, i) => `$x=${k}$: 좌극한 $${yr[i]}$, 우극한 $${yl[i + 1]}$, $f(${k})=${fvals[i]}$`),
              `극한이 없는 점(좌극한 ≠ 우극한): $m=${noLim}$, 불연속인 점: $n=${disc}$`,
              `$m+n=${noLim + disc}$`,
            ],
          };
        },
      },
      {
        id: 'ivt',
        title: '사잇값 정리',
        gen(r, level) {
          const p = r.int(1, 4);
          if (level === 3) {
            const k = r.int(-2, 2);
            const cnt = 3 * k * k + 3 * k + p;
            return {
              q: `방정식 $x^{3}${kc(p, 'x')}+a=0$ 이 열린구간 $(${k}, ${k + 1})$ 에서 적어도 하나의 실근을 갖도록 하는 정수 $a$ 의 개수를 구하세요.`,
              answer: { type: 'num', value: cnt, unit: '개' },
              steps: [
                `$f(x)=x^{3}+${p === 1 ? '' : p}x+a$ 는 연속이고 증가함수`,
                `사잇값 정리: $f(${k})f(${k + 1})<0$ → $(${k ** 3 + p * k}+a)(${(k + 1) ** 3 + p * (k + 1)}+a)<0$`,
                `$${-((k + 1) ** 3 + p * (k + 1))}<a<${-(k ** 3 + p * k)}$ → 정수 $${cnt}$ 개`,
              ],
            };
          }
          const k = r.int(-3, 2);
          const lo = -((k + 1) ** 3 + p * (k + 1)) + 1,
            hi = -(k ** 3 + p * k) - 1;
          const q = r.int(lo, hi);
          const f = P(1, 0, p, q);
          const iv = (j: number) => `$(${j}, ${j + 1})$`;
          const xs = [-3, -2, -1, 0, 1, 2, 3];
          return {
            q: level === 1 ? `함수 $f(x)=${pp(f)}$ 에 대하여 표를 보고, 방정식 $f(x)=0$ 의 실근이 존재하는 구간을 고르세요.` : `방정식 $${pp(f)}=0$ 의 실근이 존재하는 구간은?`,
            table: level === 1 ? [['$x$', ...xs.map((x) => `$${x}$`)], ['$f(x)$', ...xs.map((x) => `$${fv(f, x).tex()}$`)]] : undefined,
            answer: wch(r, iv(k), [-3, -2, -1, 0, 1, 2].filter((j) => j !== k).map(iv)),
            steps: [`$f(${k})=${fv(f, k).tex()}<0$, $f(${k + 1})=${fv(f, k + 1).tex()}>0$`, `$f$ 는 연속이므로 사잇값 정리에 의해 ${iv(k)} 에 실근이 존재`],
          };
        },
      },
      {
        id: 'continuity-product',
        title: '연속함수의 성질 활용',
        gen(r, level) {
          const c = r.nonzero(-3, 3);
          const m1 = r.int(-2, 2),
            Lv = r.int(-4, 4);
          let Rv = r.int(-4, 4);
          if (Rv === Lv || Rv === -Lv) Rv = Lv + (Lv >= 0 ? 1 : -1) * r.int(1, 2) + (Lv === 0 ? 1 : 0);
          if (Rv === -Lv) Rv += 1;
          const m2 = r.int(-2, 2);
          const n1 = Lv - m1 * c,
            n2 = Rv - m2 * c;
          const f = cases([
            [pp(P(m1, n1)), `x<${c}`],
            [pp(P(m2, n2)), `x\\ge${c}`],
          ]);
          if (level === 1) {
            return {
              q: `함수 $f(x)=${f}$ 와 $g(x)=x+k$ 에 대하여 $f(x)g(x)$ 가 실수 전체에서 연속일 때, 상수 $k$ 의 값을 구하세요.`,
              answer: { type: 'num', value: -c },
              steps: [`$f$ 는 $x=${c}$ 에서 좌극한 $${Lv}$, 함숫값 $${Rv}$ 로 불연속`, `$x=${c}$ 에서 $${Lv}g(${c})=${Rv}g(${c})$ 이어야 하므로 $g(${c})=0$`, `$${c}+k=0$, $k=${-c}$`],
            };
          }
          if (level === 2) {
            const u = r.nonzero(-3, 3);
            const t = c * u;
            const k = -c - u;
            return {
              q: `함수 $f(x)=${f}$ 와 $g(x)=x^{2}+kx${kc(t, '')}$ 에 대하여 $f(x)g(x)$ 가 실수 전체에서 연속일 때, 상수 $k$ 의 값을 구하세요.`,
              answer: { type: 'num', value: k },
              steps: [`$f$ 가 $x=${c}$ 에서 불연속이므로 $g(${c})=0$ 이어야 함`, `$${c * c}+${c < 0 ? `(${c})` : c}k${kc(t, '')}=0$`, `$k=${k}$`],
            };
          }
          // (f(x))^2 연속: L^2 = R^2, L ≠ R → L = -R
          const Rq = r.nonzero(-4, 4);
          const a = -Rq - m1 * c;
          return {
            q: `함수 $f(x)=${cases([[`${m1 === 0 ? '' : cv(m1, 'x') + '+'}a`, `x<${c}`], [pp(P(m2, Rq - m2 * c)), `x\\ge${c}`]])}$ 에 대하여 $f(x)$ 는 $x=${c}$ 에서 불연속이고 $\\{f(x)\\}^{2}$ 은 실수 전체에서 연속일 때, 상수 $a$ 의 값을 구하세요.`,
            answer: { type: 'num', value: a },
            steps: [`$x=${c}$ 에서 좌극한 $${m1 * c}+a$, 함숫값 $${Rq}$`, `$\\{f(x)\\}^{2}$ 연속: $(${m1 * c}+a)^{2}=${Rq * Rq}$, $f$ 불연속이므로 $${m1 * c}+a=${-Rq}$`, `$a=${a}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── cal1-3 미분계수와 도함수
  'cal1-3': {
    concepts: [
      {
        title: '평균변화율',
        body: '$x$ 가 $a$ 에서 $b$ 까지 변할 때\n$$\\frac{\\Delta y}{\\Delta x}=\\frac{f(b)-f(a)}{b-a}$$\n두 점을 잇는 직선(할선)의 기울기 — 중학교 일차함수의 기울기와 같은 개념입니다.',
      },
      {
        title: '미분계수',
        body: '$$f\'(a)=\\lim_{h\\to0}\\frac{f(a+h)-f(a)}{h}=\\lim_{x\\to a}\\frac{f(x)-f(a)}{x-a}$$\n- 곡선 $y=f(x)$ 위의 점 $(a, f(a))$ 에서의 **접선의 기울기**\n- 미분가능하면 연속 (역은 성립하지 않음, 예: $y=|x|$)',
      },
      {
        title: '도함수와 미분법',
        body: '- $(x^{n})\'=nx^{n-1}$, $(c)\'=0$\n- $\\{cf(x)\\}\'=cf\'(x)$, $\\{f(x)\\pm g(x)\\}\'=f\'(x)\\pm g\'(x)$\n- 곱의 미분: $\\{f(x)g(x)\\}\'=f\'(x)g(x)+f(x)g\'(x)$',
        example: { q: '$f(x)=x^{3}-2x^{2}+5$ 의 도함수는?', a: '$f\'(x)=3x^{2}-4x$' },
      },
      {
        title: '극한의 변형',
        body: '- $\\lim_{h\\to0}\\frac{f(a+ph)-f(a)}{h}=pf\'(a)$\n- $\\lim_{h\\to0}\\frac{f(a+ph)-f(a-qh)}{h}=(p+q)f\'(a)$\n- 미분가능한 구간별 함수: 경계에서 **연속** + **좌·우 미분계수 일치**',
      },
    ],
    skills: [
      {
        id: 'avg-rate',
        title: '평균변화율',
        gen(r, level) {
          if (level < 3) {
            const f = rPoly(r, level === 1 ? 2 : 3, 4);
            const a = r.int(-3, 2),
              b = a + r.int(1, 4);
            const v = fv(f, b).sub(fv(f, a)).div(b - a);
            return {
              q: `함수 $f(x)=${pp(f)}$ 에서 $x$ 의 값이 $${a}$ 에서 $${b}$ 까지 변할 때의 평균변화율을 구하세요.`,
              answer: { type: 'num', value: v.value, display: 'frac' },
              steps: [`$f(${a})=${fv(f, a).tex()}$, $f(${b})=${fv(f, b).tex()}$`, `$\\frac{${fv(f, b).tex()}-${fv(f, a).n < 0 ? `(${fv(f, a).tex()})` : fv(f, a).tex()}}{${b}-${a < 0 ? `(${a})` : a}}=${v.tex()}$`],
            };
          }
          const p = r.nonzero(-3, 3),
            q = r.int(-5, 5),
            s = r.int(-5, 5);
          const f = P(p, q, s);
          const a = r.int(-3, 2),
            c = a + r.int(1, 3);
          const k = 2 * c - a;
          return {
            q: `함수 $f(x)=${pp(f)}$ 에서 $x$ 의 값이 $${a}$ 에서 $k$ 까지 변할 때의 평균변화율이 $x=${c}$ 에서의 미분계수와 같을 때, 상수 $k$ 의 값을 구하세요. (단, $k>${a}$)`,
            answer: { type: 'num', value: k },
            steps: [`평균변화율 $\\frac{f(k)-f(${a})}{${xm('k', a)}}=${p === 1 ? '' : p === -1 ? '-' : p}(${xm('k', -a)})${kc(q, '')}$`, `$f'(x)=${pp(pDer(f))}$, $f'(${c})=${fv(pDer(f), c).tex()}$`, `$${p === 1 ? '' : p === -1 ? '-' : p}(${xm('k', -a)})${kc(q, '')}=${fv(pDer(f), c).tex()}$ 에서 $k=${k}$`],
          };
        },
      },
      {
        id: 'derivative-value',
        title: '미분계수 구하기',
        gen(r, level) {
          const a = r.int(-3, 3);
          if (level < 3) {
            const f = rPoly(r, level === 1 ? 2 : 3, 5);
            const d = pDer(f);
            return {
              q: `함수 $f(x)=${pp(f)}$ 에 대하여 $f'(${a})$ 의 값을 구하세요.`,
              answer: { type: 'num', value: fv(d, a).value },
              steps: [`$f'(x)=${pp(d)}$`, `$f'(${a})=${fv(d, a).tex()}$`],
            };
          }
          const g = P(r.nonzero(-2, 3), 0, r.int(-4, 4)),
            h = P(r.nonzero(-2, 2), r.int(-4, 4));
          const f = pMul(g, h);
          const d = pDer(f);
          return {
            q: `함수 $f(x)=(${pp(g)})(${pp(h)})$ 에 대하여 $f'(${a})$ 의 값을 구하세요.`,
            answer: { type: 'num', value: fv(d, a).value },
            steps: [`곱의 미분: $f'(x)=(${pp(pDer(g))})(${pp(h)})+(${pp(g)})\\times${pDer(h)[0].n < 0 ? `(${pp(pDer(h))})` : pp(pDer(h))}$`, `$f'(${a})=${fv(pDer(g), a).tex()}\\times${fv(h, a).n < 0 ? `(${fv(h, a).tex()})` : fv(h, a).tex()}+${fv(g, a).n < 0 ? `(${fv(g, a).tex()})` : fv(g, a).tex()}\\times${pDer(h)[0].n < 0 ? `(${pDer(h)[0].tex()})` : pDer(h)[0].tex()}=${fv(d, a).tex()}$`],
          };
        },
      },
      {
        id: 'limit-form',
        title: '미분계수의 정의와 극한',
        gen(r, level) {
          const a = r.int(-3, 3);
          const f = rPoly(r, 2, 5);
          const d = fv(pDer(f), a);
          if (level === 1) {
            return {
              q: `함수 $f(x)=${pp(f)}$ 에 대하여 $\\lim_{h\\to0}\\frac{f(${a}+h)-f(${a})}{h}$ 의 값을 구하세요.`.replace('f(0+h)', 'f(h)'),
              answer: { type: 'num', value: d.value },
              steps: [`주어진 극한은 $f'(${a})$`, `$f'(x)=${pp(pDer(f))}$, $f'(${a})=${d.tex()}$`],
            };
          }
          if (level === 2) {
            const k = r.nonzero(-6, 6);
            const p = r.int(1, 4),
              q = r.int(0, 3);
            const v = k * (p + q);
            const arg = (sg: string, k2: number) => (a === 0 ? `${sg === '-' ? '-' : ''}${k2 === 1 ? '' : k2}h` : `${a}${sg}${k2 === 1 ? '' : k2}h`);
            const top = q === 0 ? `f(${arg('+', p)})-f(${a})` : `f(${arg('+', p)})-f(${arg('-', q)})`;
            return {
              q: `미분가능한 함수 $f(x)$ 에 대하여 $f'(${a})=${k}$ 일 때, $\\lim_{h\\to0}\\frac{${top}}{h}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v },
              steps: q === 0 ? [`$${p}\\times\\lim_{h\\to0}\\frac{f(${arg('+', p)})-f(${a})}{${p === 1 ? '' : p}h}=${p === 1 ? '' : p}f'(${a})$`, `$=${p}\\times${k < 0 ? `(${k})` : k}=${v}$`] : [`$\\frac{f(${arg('+', p)})-f(${a})}{h}+\\frac{f(${a})-f(${arg('-', q)})}{h}$ 로 나누면 $${p === 1 ? '' : p}f'(${a})+${q === 1 ? '' : q}f'(${a})$`, `$=${p + q}\\times${k < 0 ? `(${k})` : k}=${v}$`],
            };
          }
          const A = r.nonzero(-3, 3);
          const dA = fv(pDer(f), A);
          if (r.chance(0.5)) {
            const v = dA.div(2 * A);
            return {
              q: `함수 $f(x)=${pp(f)}$ 에 대하여 $\\lim_{x\\to${A}}\\frac{f(x)-f(${A})}{x^{2}-${A * A}}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v.value, display: 'frac' },
              steps: [`$\\frac{f(x)-f(${A})}{x-${A < 0 ? `(${A})` : A}}\\times\\frac{1}{${xm('x', -A)}}\\to f'(${A})\\times\\frac{1}{${2 * A}}$`, `$f'(${A})=${dA.tex()}$ 이므로 $${v.tex()}$`],
            };
          }
          const fA = fv(f, A);
          const v = fA.sub(dA.mul(A));
          return {
            q: `함수 $f(x)=${pp(f)}$ 에 대하여 $\\lim_{x\\to${A}}\\frac{xf(${A})${A < 0 ? '+' : '-'}${Math.abs(A) === 1 ? '' : Math.abs(A)}f(x)}{${xm('x', A)}}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: v.value, display: 'frac' },
            steps: [`분자 $=(x-${A < 0 ? `(${A})` : A})f(${A})-${A < 0 ? `(${A})` : A}\\{f(x)-f(${A})\\}$`, `극한값 $=f(${A})-${A < 0 ? `(${A})` : A}f'(${A})=${fA.tex()}-${A < 0 ? `(${A})` : A}\\times${dA.n < 0 ? `(${dA.tex()})` : dA.tex()}=${v.tex()}$`],
          };
        },
      },
      {
        id: 'derivative-formula',
        title: '도함수 구하기',
        gen(r, level) {
          if (level < 3) {
            const f = rPoly(r, level === 1 ? 2 : 3, 6);
            const d = pDer(f);
            const n = f.length;
            const wr = [
              pp(f.slice(0, -1)),
              pp([...d, f[n - 1]]),
              pp(d.map((c, i) => (i === 0 ? c : c.neg()))),
              pp(f.slice(0, -1).map((c, i) => c.mul(n - 2 - i || 1))),
              pp(d.map((c, i) => (i === d.length - 1 ? c.add(1) : c))),
            ];
            return {
              q: `함수 $f(x)=${pp(f)}$ 의 도함수는?`,
              answer: tch(r, `f'(x)=${pp(d)}`, wr.map((w) => `f'(x)=${w}`)),
              steps: [`$(x^{n})'=nx^{n-1}$, 상수의 미분은 $0$`, `$f'(x)=${pp(d)}$`],
            };
          }
          const g = P(r.nonzero(-3, 3), r.nonzero(-4, 4)),
            h = P(r.nonzero(-2, 2), 0, r.nonzero(-4, 4));
          const d = pDer(pMul(g, h));
          return {
            q: `함수 $f(x)=(${pp(g)})(${pp(h)})$ 의 도함수는?`,
            answer: tch(r, `f'(x)=${pp(d)}`, [pp(pMul(pDer(g), pDer(h))), pp(pMul(pDer(g), h)), pp(pMul(g, pDer(h))), pp(pDer(pMul(g, P(h[0], 0, h[2].neg()))))].map((w) => `f'(x)=${w}`)),
            steps: [`곱의 미분: $f'(x)=${g[0].tex()}(${pp(h)})+(${pp(g)})(${pp(pDer(h))})$`, `전개하여 정리하면 $f'(x)=${pp(d)}$`],
          };
        },
      },
      {
        id: 'differentiable-piecewise',
        title: '미분가능할 조건',
        gen(r, level) {
          const t = r.nonzero(-3, 3);
          if (level === 1) {
            return {
              q: `함수 $f(x)=${cases([['x^{2}', `x<${t}`], ['ax+b', `x\\ge${t}`]])}$ 가 $x=${t}$ 에서 미분가능할 때, 상수 $a$, $b$ 의 값을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'a', value: 2 * t }, { label: 'b', value: -t * t }] },
              steps: [`미분계수 일치: $2\\times${t < 0 ? `(${t})` : t}=a$, $a=${2 * t}$`, `연속: $${t * t}=${2 * t}\\times${t < 0 ? `(${t})` : t}+b$, $b=${-t * t}$`],
            };
          }
          if (level === 2) {
            const a = r.nonzero(-3, 3),
              m = r.int(-5, 5);
            const n = -a * t * t,
              b = m - 2 * a * t;
            return {
              q: `함수 $f(x)=${cases([['ax^{2}+bx', `x<${t}`], [pp(P(m, n)), `x\\ge${t}`]])}$ 가 $x=${t}$ 에서 미분가능할 때, 상수 $a$, $b$ 의 값을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'a', value: a }, { label: 'b', value: b }] },
              steps: [`연속: $${cv(t * t, 'a')}${t > 0 ? '+' : ''}${cv(t, 'b')}=${m * t + n}$`, `미분계수: $${cv(2 * t, 'a')}+b=${m}$`, `연립하면 $a=${a}$, $b=${b}$`],
            };
          }
          const c = r.int(-4, 4);
          const a = 3 * t * t - 2 * t;
          const b = t * t * t + c - t * t - a * t;
          return {
            q: `함수 $f(x)=${cases([['x^{2}+ax+b', `x<${t}`], [`x^{3}${kc(c, '')}`, `x\\ge${t}`]])}$ 가 실수 전체에서 미분가능할 때, 상수 $a$, $b$ 에 대하여 $a+b$ 의 값을 구하세요.`,
            answer: { type: 'num', value: a + b },
            steps: [`미분계수: $2\\times${t < 0 ? `(${t})` : t}+a=3\\times${t * t}$, $a=${a}$`, `연속: $${t * t}+${a}\\times${t < 0 ? `(${t})` : t}+b=${t ** 3 + c}$, $b=${b}$`, `$a+b=${a + b}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── cal1-4 도함수의 활용
  'cal1-4': {
    concepts: [
      {
        title: '접선의 방정식',
        body: '곡선 $y=f(x)$ 위의 점 $(a, f(a))$ 에서의 접선:\n$$y-f(a)=f\'(a)(x-a)$$\n- 기울기가 주어지면 $f\'(t)=m$ 인 접점 $t$ 를 먼저 구함\n- 곡선 밖의 점에서 그은 접선: 접점을 $(t, f(t))$ 로 놓고 그 점을 대입',
      },
      {
        title: '함수의 증가와 감소',
        body: '어떤 구간에서 $f\'(x)>0$ 이면 증가, $f\'(x)<0$ 이면 감소.\n- 실수 전체에서 증가 (삼차함수) $\\iff f\'(x)\\ge0$ 항상 $\\iff$ $f\'(x)=0$ 의 판별식 $D\\le0$',
      },
      {
        title: '극대와 극소',
        body: '$f\'(a)=0$ 이고 $x=a$ 의 좌우에서 $f\'$ 의 부호가\n- $+$ 에서 $-$ 로: 극대, $-$ 에서 $+$ 로: 극소\n증감표를 그려 판단합니다.',
        example: { q: '$f(x)=x^{3}-3x$ 의 극댓값은?', a: '$f\'(x)=3(x+1)(x-1)$, $x=-1$ 에서 극대, $f(-1)=2$' },
      },
      {
        title: '최대·최소와 방정식',
        body: '- 닫힌구간의 최대·최소: 극값과 양 끝 값을 비교\n- 방정식 $f(x)=k$ 의 실근의 개수 = $y=f(x)$ 와 $y=k$ 의 교점 수',
      },
      {
        title: '속도와 가속도',
        body: '수직선 위를 움직이는 점의 위치가 $x(t)$ 이면\n- 속도 $v=x\'(t)$, 가속도 $a=v\'(t)$\n- 운동 방향이 바뀌는 순간: $v=0$ 이고 부호가 바뀜',
      },
    ],
    skills: [
      {
        id: 'tangent',
        title: '접선의 방정식',
        gen(r, level) {
          if (level === 1) {
            const f = rPoly(r, r.pick([2, 3]), 4);
            const a = r.int(-2, 2);
            const m = fv(pDer(f), a),
              n = fv(f, a).sub(m.mul(a));
            return {
              q: `곡선 $y=${pp(f)}$ 위의 점 $${pt(a, fv(f, a))}$ 에서의 접선의 방정식을 $y=mx+n$ 이라 할 때, $m$, $n$ 의 값을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'm', value: m.value }, { label: 'n', value: n.value }] },
              steps: [`$y'=${pp(pDer(f))}$, 기울기 $m=${m.tex()}$`, `$y-${fv(f, a).n < 0 ? `(${fv(f, a).tex()})` : fv(f, a).tex()}=${m.tex()}(x-${a < 0 ? `(${a})` : a})$`, `$y=${pp([m, n])}$`],
            };
          }
          if (level === 2) {
            const p = r.int(-4, 4),
              q = r.int(-4, 4),
              x0 = r.int(-3, 3);
            const m = 2 * x0 + p;
            const n = x0 * x0 + p * x0 + q - m * x0;
            return {
              q: `곡선 $y=${pp(P(1, p, q))}$ 에 접하고 기울기가 $${m}$ 인 직선의 $y$ 절편을 구하세요.`,
              answer: { type: 'num', value: n },
              steps: [`$y'=${pp(P(2, p))}=${m}$ 에서 접점의 $x$ 좌표 $${x0}$`, `접점 $${pt(x0, x0 * x0 + p * x0 + q)}$`, `$y=${m}(x-${x0 < 0 ? `(${x0})` : x0})+${x0 * x0 + p * x0 + q < 0 ? `(${x0 * x0 + p * x0 + q})` : x0 * x0 + p * x0 + q}$ 의 $y$ 절편 $${n}$`],
            };
          }
          if (r.chance(0.5)) {
            const p = r.int(-3, 5),
              t = r.int(1, 3);
            const c = p - t * t;
            return {
              q: `점 $(0, ${c})$ 에서 곡선 $y=x^{2}${kc(p, '')}$ 에 그은 두 접선의 기울기의 곱을 구하세요.`,
              answer: { type: 'num', value: -4 * t * t },
              steps: [`접점 $(s, s^{2}${kc(p, '')})$ 에서의 접선: $y=2sx-s^{2}${kc(p, '')}$`, `$(0, ${c})$ 대입: $${c}=-s^{2}${kc(p, '')}$, $s=\\pm${t}$`, `기울기 $\\pm${2 * t}$, 곱 $${-4 * t * t}$`],
            };
          }
          const b = r.int(-3, 3),
            c = r.int(-4, 4),
            d = r.int(-4, 4),
            a = r.nonzero(-2, 2);
          const f = P(1, b, c, d);
          const xo = -2 * a - b;
          return {
            q: `곡선 $y=${pp(f)}$ 위의 점 $${pt(a, fv(f, a))}$ 에서의 접선이 이 곡선과 다시 만나는 점의 $x$ 좌표를 구하세요.`,
            answer: { type: 'num', value: xo },
            steps: [`접선을 $y=g(x)$ 라 하면 $f(x)-g(x)=(${xm('x', a)})^{2}(x-k)$`, `$x^{2}$ 의 계수 비교: $-2\\times${a < 0 ? `(${a})` : a}-k=${b}$`, `$k=${xo}$`],
          };
        },
      },
      {
        id: 'extremum',
        title: '극대와 극소',
        gen(r, level) {
          let al = r.int(-3, 2),
            be = al + r.int(1, 3);
          if (level === 1) {
            const c = r.int(-5, 5);
            const s = r.sign();
            const f = cubicWith(s, al, be, c);
            return {
              q: `함수 $f(x)=${pp(f)}$ 가 극값을 갖는 $x$ 의 값을 모두 구하세요.`,
              answer: { type: 'set', values: [al, be] },
              steps: [`$f'(x)=${pp(pDer(f))}=${6 * s}(${xm('x', al)})(${xm('x', be)})$`, `$f'(x)=0$ 의 좌우에서 부호가 바뀌므로 $x=${al}$, $x=${be}$ 에서 극값`],
            };
          }
          if (level === 2) {
            const c = r.int(-5, 5);
            const s = r.sign();
            const f = cubicWith(s, al, be, c);
            const [mx, mn] = s > 0 ? [fv(f, al), fv(f, be)] : [fv(f, be), fv(f, al)];
            const ask = r.int(0, 2);
            const v = ask === 0 ? mx : ask === 1 ? mn : mx.sub(mn);
            const what = ['극댓값', '극솟값', '(극댓값)-(극솟값)'][ask];
            return {
              q: `함수 $f(x)=${pp(f)}$ 의 ${what}을 구하세요.`,
              answer: { type: 'num', value: v.value },
              steps: [`$f'(x)=${6 * s}(${xm('x', al)})(${xm('x', be)})$`, `${s > 0 ? `$x=${al}$ 에서 극대, $x=${be}$ 에서 극소` : `$x=${al}$ 에서 극소, $x=${be}$ 에서 극대`}`, `극댓값 $${mx.tex()}$, 극솟값 $${mn.tex()}$`],
            };
          }
          if (al === be) be += 1;
          const M = r.int(-5, 10);
          const base = cubicWith(1, al, be, 0);
          const c = M - fv(base, al).value;
          const f = cubicWith(1, al, be, c);
          return {
            q: `함수 $f(x)=2x^{3}+ax^{2}+bx+c$ 가 $x=${al}$ 에서 극댓값 $${M}$ 을 갖고, $x=${be}$ 에서 극솟값을 가질 때, 극솟값을 구하세요.`,
            answer: { type: 'num', value: fv(f, be).value },
            steps: [`$f'(x)=6x^{2}+2ax+b=6(${xm('x', al)})(${xm('x', be)})$ 에서 $a=${f[1].tex()}$, $b=${f[2].tex()}$`, `$f(${al})=${M}$ 에서 $c=${c}$`, `극솟값 $f(${be})=${fv(f, be).tex()}$`],
          };
        },
      },
      {
        id: 'monotonic',
        title: '증가·감소',
        gen(r, level) {
          if (level < 3) {
            let al: number, be: number, f: Poly;
            const s = level === 1 ? 1 : r.sign();
            if (level === 1) {
              const k = r.int(1, 4);
              al = -k;
              be = k;
              f = P(1, 0, -3 * k * k, r.int(-5, 5));
            } else {
              al = r.int(-3, 2);
              be = al + r.int(1, 4);
              f = cubicWith(s as 1 | -1, al, be, r.int(-5, 5));
            }
            const askDec = s > 0;
            const iv = (a: number, b: number) => `$${a}\\le x\\le ${b}$`;
            const out = (a: number, b: number) => `$x\\le ${a}$ 또는 $x\\ge ${b}$`;
            return {
              q: `함수 $f(x)=${pp(f)}$ 가 ${askDec ? '감소' : '증가'}하는 구간은?`,
              answer: wch(r, iv(al, be), [out(al, be), iv(al - 1, be + 1), ...(be > 0 && al !== 0 ? [iv(0, be)] : []), iv(al, be + 1), iv(-be, -al), iv(al - 1, be)].filter((w) => w !== iv(al, be))),
              steps: [`$f'(x)=${pp(pDer(f))}$`, `$f'(x)${s > 0 ? '\\le' : '\\ge'}0$ 인 구간: $${al}\\le x\\le ${be}$`],
            };
          }
          const m = r.int(1, 3);
          const b = 3 * m * m;
          const neg = r.chance(0.4);
          const f = neg ? `-x^{3}+ax^{2}-${b}x${kc(r.int(-5, 5), '')}` : `x^{3}+ax^{2}+${b}x${kc(r.int(-5, 5), '')}`;
          return {
            q: `함수 $f(x)=${f}$ 가 실수 전체에서 ${neg ? '감소' : '증가'}하도록 하는 정수 $a$ 의 개수를 구하세요.`,
            answer: { type: 'num', value: 6 * m + 1, unit: '개' },
            steps: [`$f'(x)=${neg ? '-3x^{2}+2ax-' + b : '3x^{2}+2ax+' + b}$ 가 항상 ${neg ? '$\\le0$' : '$\\ge0$'}`, `$\\frac{D}{4}=a^{2}-${3 * b}\\le0$, $-${3 * m}\\le a\\le ${3 * m}$`, `정수 $a$: $${6 * m + 1}$ 개`],
          };
        },
      },
      {
        id: 'max-min',
        title: '닫힌구간에서 최대·최소',
        gen(r, level) {
          if (level === 1) {
            const p = r.int(-3, 3) * 2,
              q = r.int(-5, 5);
            const f = P(1, p, q);
            const v = -p / 2;
            const m = v - r.int(1, 3),
              n = v + r.int(1, 4);
            const vals = [m, n, v].map((x) => fv(f, x).value);
            return {
              q: `$${m}\\le x\\le ${n}$ 에서 함수 $f(x)=${pp(f)}$ 의 최댓값과 최솟값을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: '최댓값', value: Math.max(...vals) }, { label: '최솟값', value: Math.min(...vals) }] },
              steps: [`$f'(x)=${pp(pDer(f))}=0$ 에서 $x=${v}$`, `$f(${m})=${vals[0]}$, $f(${v})=${vals[2]}$, $f(${n})=${vals[1]}$`, `최댓값 $${Math.max(...vals)}$, 최솟값 $${Math.min(...vals)}$`],
            };
          }
          const al = r.int(-2, 1),
            be = al + r.int(1, 2);
          const s = level === 2 ? 1 : r.sign();
          const f = cubicWith(s as 1 | -1, al, be, r.int(-4, 4));
          const m = al - r.int(1, 2),
            n = be + r.int(level === 2 ? 0 : 1, 2);
          const xs = [m, al, be, n].filter((x, i, arr) => arr.indexOf(x) === i);
          const vals = xs.map((x) => fv(f, x).value);
          return {
            q: `$${m}\\le x\\le ${n}$ 에서 함수 $f(x)=${pp(f)}$ 의 최댓값과 최솟값을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: '최댓값', value: Math.max(...vals) }, { label: '최솟값', value: Math.min(...vals) }] },
            steps: [`$f'(x)=${6 * s}(${xm('x', al)})(${xm('x', be)})$`, xs.map((x, i) => `$f(${x})=${vals[i]}$`).join(', '), `최댓값 $${Math.max(...vals)}$, 최솟값 $${Math.min(...vals)}$`],
            hint: '극값과 양 끝 값을 모두 비교하세요.',
          };
        },
      },
      {
        id: 'root-count',
        title: '방정식의 실근의 개수',
        gen(r, level) {
          const al = r.int(-2, 1),
            be = al + (level === 3 ? 2 : r.int(1, 2));
          const f = cubicWith(1, al, be, 0);
          const M = fv(f, al).value,
            m = fv(f, be).value;
          if (level === 1) {
            const k = r.pick([M + r.int(1, 3), m - r.int(1, 3), M, m, Math.floor((M + m) / 2) === M ? m : Math.floor((M + m) / 2)]);
            const n = k > M || k < m ? 1 : k === M || k === m ? 2 : 3;
            return {
              q: `방정식 $${pp(f)}=${k}$ 의 서로 다른 실근의 개수를 구하세요.`,
              answer: { type: 'num', value: n, unit: '개' },
              steps: [`$f(x)=${pp(f)}$ 라 하면 극댓값 $f(${al})=${M}$, 극솟값 $f(${be})=${m}$`, `$y=f(x)$ 와 $y=${k}$ 의 교점: $${n}$ 개`],
            };
          }
          if (level === 2) {
            return {
              q: `방정식 $${pp(f)}-k=0$ 이 서로 다른 두 실근을 갖도록 하는 실수 $k$ 의 값을 모두 구하세요.`,
              answer: { type: 'set', values: [M, m] },
              steps: [`$${pp(f)}=k$ 로 놓고 $y=f(x)$ 와 $y=k$ 의 교점이 2개`, `직선이 극대점 또는 극소점을 지날 때: $k=${M}$ 또는 $k=${m}$`],
            };
          }
          const c = r.int(-5, 5);
          const g = cubicWith(1, al, be, c);
          return {
            q: `방정식 $${pp(g)}=k$ 가 서로 다른 세 실근을 갖도록 하는 정수 $k$ 의 개수를 구하세요.`,
            answer: { type: 'num', value: M - m - 1, unit: '개' },
            steps: [`극댓값 $${M + c}$, 극솟값 $${m + c}$`, `$${m + c}<k<${M + c}$ 인 정수: $${M - m - 1}$ 개`],
          };
        },
      },
      {
        id: 'velocity',
        title: '속도와 가속도',
        gen(r, level) {
          const p = r.int(1, 4);
          let q = p + 2 * r.int(1, 2);
          if (q === p) q += 2;
          const x = P(1, (-3 * (p + q)) / 2, 3 * p * q, 0);
          const v = pDer(x),
            ac = pDer(v);
          const xt = `x(t)=${pp(x, 't')}`;
          if (level === 1) {
            const t0 = r.int(1, 6);
            const askA = r.chance(0.4);
            return {
              q: `수직선 위를 움직이는 점 P 의 시각 $t$ 에서의 위치가 $${xt}$ 일 때, $t=${t0}$ 에서 점 P 의 ${askA ? '가속도' : '속도'}를 구하세요.`,
              answer: { type: 'num', value: (askA ? fv(ac, t0) : fv(v, t0)).value },
              steps: [`$v(t)=${pp(v, 't')}$${askA ? `, $a(t)=${pp(ac, 't')}$` : ''}`, `$t=${t0}$: $${(askA ? fv(ac, t0) : fv(v, t0)).tex()}$`],
            };
          }
          if (level === 2) {
            return {
              q: `수직선 위를 움직이는 점 P 의 시각 $t\\,(t>0)$ 에서의 위치가 $${xt}$ 일 때, 점 P 가 운동 방향을 바꾸는 시각을 모두 구하세요.`,
              answer: { type: 'set', values: [p, q] },
              steps: [`$v(t)=${pp(v, 't')}=3(t-${p})(t-${q})$`, `$v$ 의 부호가 바뀌는 시각: $t=${p}$, $t=${q}$`],
            };
          }
          return {
            q: `수직선 위를 움직이는 점 P 의 시각 $t\\,(t\\ge0)$ 에서의 위치가 $${xt}$ 일 때, 점 P 가 처음으로 운동 방향을 바꾸는 순간의 위치와 그때의 가속도를 구하세요.`,
            answer: { type: 'fields', fields: [{ label: '위치', value: fv(x, p).value }, { label: '가속도', value: fv(ac, p).value }] },
            steps: [`$v(t)=3(t-${p})(t-${q})$, 처음으로 방향을 바꾸는 시각 $t=${p}$`, `위치 $x(${p})=${fv(x, p).tex()}$`, `가속도 $a(${p})=${pp(ac, 't').replace('t', `\\times${p}`)}=${fv(ac, p).tex()}$`.replace(/=6\\times/, '=6\\times')],
          };
        },
      },
    ],
  },

  // ───────────────────────── cal1-5 부정적분
  'cal1-5': {
    concepts: [
      {
        title: '부정적분의 뜻',
        body: '$F\'(x)=f(x)$ 일 때 $F(x)$ 를 $f(x)$ 의 부정적분 (원시함수) 이라 하고\n$$\\int f(x)\\,dx=F(x)+C\\quad(C\\text{는 적분상수})$$\n미분의 거꾸로 과정입니다.',
      },
      {
        title: '부정적분의 계산',
        body: '- $\\int x^{n}dx=\\frac{1}{n+1}x^{n+1}+C\\ (n\\ne-1)$, $\\int k\\,dx=kx+C$\n- $\\int\\{f(x)\\pm g(x)\\}dx=\\int f(x)dx\\pm\\int g(x)dx$\n- 곱으로 된 식은 **먼저 전개**',
        example: { q: '$\\int(3x^{2}-4x+1)dx$', a: '$x^{3}-2x^{2}+x+C$' },
      },
      {
        title: '미분과 적분의 관계',
        body: '- $\\frac{d}{dx}\\int f(x)dx=f(x)$\n- $\\int\\left\\{\\frac{d}{dx}f(x)\\right\\}dx=f(x)+C$\n- 함숫값 하나 (곡선이 지나는 점) 가 주어지면 $C$ 가 정해집니다.',
      },
    ],
    skills: [
      {
        id: 'antiderivative',
        title: '부정적분 구하기',
        gen(r, level) {
          let f: Poly;
          let show: string;
          if (level === 1) {
            f = P(3 * r.nonzero(-2, 2), 2 * r.int(-3, 3), r.int(-5, 5));
            show = pp(f);
          } else if (level === 2) {
            f = P(r.nonzero(-4, 4), r.int(-3, 3), r.int(-3, 3), r.int(-5, 5));
            show = pp(f);
          } else {
            const g = P(r.nonzero(-2, 3), r.nonzero(-3, 3)),
              h = P(r.nonzero(-2, 2), r.nonzero(-3, 3));
            f = pMul(g, h);
            show = `(${pp(g)})(${pp(h)})`;
          }
          const F0 = pInt(f);
          const W = [pDer(f), [...f, new F(0)].map((c, i, arr) => (i < arr.length - 1 ? c : c)), pInt(f).map((c, i) => (i === 0 ? c.mul(2) : c)), pInt(f).map((c, i, arr) => (i === arr.length - 2 ? c.neg() : c))];
          const wrongs = W.map((w) => `${pp(w as Poly)}+C`);
          return {
            q: `$\\int${level === 3 ? show : `(${show})`}\\,dx$ 는? (단, $C$ 는 적분상수)`,
            answer: tch(r, `${pp(F0)}+C`, wrongs, 5, (i) => `${pp(F0.map((c, j) => (j === i % F0.length ? c.add(1) : c)))}+C`),
            steps: [...(level === 3 ? [`전개: $${pp(f)}$`] : []), `$\\int x^{n}dx=\\frac{1}{n+1}x^{n+1}+C$ 를 항마다 적용`, `$${pp(F0)}+C$`],
          };
        },
      },
      {
        id: 'antiderivative-condition',
        title: '조건으로 적분상수 정하기',
        gen(r, level) {
          if (level < 3) {
            const fp = level === 1 ? P(2 * r.nonzero(-3, 3), r.int(-5, 5)) : P(3 * r.nonzero(-2, 2), 2 * r.int(-3, 3), r.int(-5, 5));
            const a0 = r.int(-2, 2),
              b0 = r.int(-6, 6);
            let k = r.int(-3, 3);
            if (k === a0) k = a0 + (a0 < 2 ? 1 : -1); // 주어진 점과 묻는 점이 같으면 문제가 안 됨
            const I = pInt(fp);
            const C = new F(b0).sub(fv(I, a0));
            const val = fv(I, k).add(C);
            return {
              q: `함수 $f(x)$ 에 대하여 $f'(x)=${pp(fp)}$ 이고 $f(${a0})=${b0}$ 일 때, $f(${k})$ 의 값을 구하세요.`,
              answer: { type: 'num', value: val.value, display: 'frac' },
              steps: [`$f(x)=\\int(${pp(fp)})dx=${pp(I)}+C$`, `$f(${a0})=${fv(I, a0).tex()}+C=${b0}$, $C=${C.tex()}$`, `$f(${k})=${val.tex()}$`],
            };
          }
          const k = r.int(1, 2),
            M = r.int(-5, 10);
          return {
            q: `함수 $f(x)$ 에 대하여 $f'(x)=3x^{2}-${3 * k * k}$ 이고 $f(x)$ 의 극댓값이 $${M}$ 일 때, 극솟값을 구하세요.`,
            answer: { type: 'num', value: M - 4 * k ** 3 },
            steps: [`$f(x)=x^{3}-${3 * k * k}x+C$, $f'(x)=3(x+${k})(x-${k})$`, `$x=-${k}$ 에서 극대: $${2 * k ** 3}+C=${M}$, $C=${M - 2 * k ** 3}$`, `극솟값 $f(${k})=${-2 * k ** 3}+${M - 2 * k ** 3 < 0 ? `(${M - 2 * k ** 3})` : M - 2 * k ** 3}=${M - 4 * k ** 3}$`],
          };
        },
      },
      {
        id: 'curve-slope',
        title: '접선의 기울기로 곡선 구하기',
        gen(r, level) {
          if (level < 3) {
            const slope = level === 1 ? P(2 * r.nonzero(-2, 2), r.int(-5, 5)) : P(3, 2 * r.int(-3, 3), r.int(-4, 4));
            const I = pInt(slope);
            const a = r.int(-2, 2),
              b = r.int(-6, 6),
              k = r.int(-3, 3);
            const C = new F(b).sub(fv(I, a));
            const val = fv(I, k).add(C);
            return {
              q: `곡선 $y=f(x)$ 위의 임의의 점 $(x, f(x))$ 에서의 접선의 기울기가 $${pp(slope)}$ 이고, 이 곡선이 점 $${pt(a, b)}$ 를 지날 때, $f(${k})$ 의 값을 구하세요.`,
              answer: { type: 'num', value: val.value, display: 'frac' },
              steps: [`$f'(x)=${pp(slope)}$ 이므로 $f(x)=${pp(I)}+C$`, `$f(${a})=${b}$ 에서 $C=${C.tex()}$`, `$f(${k})=${val.tex()}$`],
            };
          }
          const a = r.int(-4, 4),
            b = r.int(-5, 5),
            m = r.int(1, 3);
          const c = m + a + b;
          const k = r.int(2, 3);
          const val = m * k * k + a * k + b;
          return {
            q: `함수 $f(x)$ 에 대하여 $f'(x)=${2 * m}x+a$ ($a$ 는 상수) 이고 곡선 $y=f(x)$ 가 두 점 $(0, ${b})$, $(1, ${c})$ 를 지날 때, $f(${k})$ 의 값을 구하세요.`,
            answer: { type: 'num', value: val },
            steps: [`$f(x)=${m === 1 ? '' : m}x^{2}+ax+C$`, `$f(0)=C=${b}$, $f(1)=${m}+a+${b < 0 ? `(${b})` : b}=${c}$ 에서 $a=${a}$`, `$f(${k})=${val}$`],
          };
        },
      },
      {
        id: 'diff-int-relation',
        title: '미분과 적분의 관계',
        gen(r, level) {
          const g = rPoly(r, r.pick([2, 3]), 4);
          if (level === 1) {
            const a = r.int(-3, 3);
            return {
              q: `$\\frac{d}{dx}\\int(${pp(g)})\\,dx$ 를 $h(x)$ 라 할 때, $h(${a})$ 의 값을 구하세요.`,
              answer: { type: 'num', value: fv(g, a).value },
              steps: [`$\\frac{d}{dx}\\int f(x)dx=f(x)$ 이므로 $h(x)=${pp(g)}$`, `$h(${a})=${fv(g, a).tex()}$`],
            };
          }
          if (level === 2) {
            const c = r.int(-5, 5),
              k = r.nonzero(-3, 3);
            const val = fv(g, k).sub(fv(g, 0)).add(c);
            return {
              q: `함수 $f(x)=\\int\\left\\{\\frac{d}{dx}(${pp(g)})\\right\\}dx$ 에 대하여 $f(0)=${c}$ 일 때, $f(${k})$ 의 값을 구하세요.`,
              answer: { type: 'num', value: val.value },
              steps: [`$f(x)=${pp(g)}+C$`, `$f(0)=${fv(g, 0).tex()}+C=${c}$, $C=${new F(c).sub(fv(g, 0)).tex()}$`, `$f(${k})=${val.tex()}$`],
            };
          }
          const p = r.nonzero(-2, 2),
            q = r.int(-3, 3),
            c = r.int(-5, 5),
            k = r.nonzero(-3, 3);
          // ∫ f dx = x f(x) - p x^3 + q x^2  →  f' = 3p x - 2q
          const fc = P(new F(3 * p, 2), -2 * q, c);
          const val = fv(fc, k);
          return {
            q: `다항함수 $f(x)$ 가 $\\int f(x)\\,dx=xf(x)${kc(-p, 'x^{3}').replace(/^([+-])1x/, '$1x')}${q === 0 ? '' : kc(q, 'x^{2}').replace(/^([+-])1x/, '$1x')}$ 을 만족시키고 $f(0)=${c}$ 일 때, $f(${k})$ 의 값을 구하세요.`,
            answer: { type: 'num', value: val.value, display: 'frac' },
            steps: [`양변을 미분: $f(x)=f(x)+xf'(x)${kc(-3 * p, 'x^{2}')}${q === 0 ? '' : kc(2 * q, 'x')}$`, `$f'(x)=${pp(P(3 * p, -2 * q))}$, $f(x)=${pp(fc.slice(0, 2).concat([new F(0)]))}+C$`, `$f(0)=${c}$ 이므로 $f(${k})=${val.tex()}$`],
          };
        },
      },
      {
        id: 'integral-coefficient',
        title: '부정적분과 미정계수',
        gen(r, level) {
          const a = r.int(-4, 4),
            b = r.int(-5, 5);
          // ∫ f dx = x^3 + a x^2 + b x + C → f = 3x^2 + 2a x + b
          const f = P(3, 2 * a, b);
          if (level === 1) {
            const k = r.int(-3, 3);
            return {
              q: `$\\int f(x)\\,dx=${pp(P(1, a, b, 0))}+C$ 일 때, $f(${k})$ 의 값을 구하세요.`,
              answer: { type: 'num', value: fv(f, k).value },
              steps: [`양변을 미분: $f(x)=${pp(f)}$`, `$f(${k})=${fv(f, k).tex()}$`],
            };
          }
          if (level === 2) {
            const p = fv(f, 1),
              q = fv(pDer(f), 1);
            return {
              q: `$\\int f(x)\\,dx=x^{3}+ax^{2}+bx+C$ 이고 $f(1)=${p.tex()}$, $f'(1)=${q.tex()}$ 일 때, 상수 $a$, $b$ 의 값을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'a', value: a }, { label: 'b', value: b }] },
              steps: [`$f(x)=3x^{2}+2ax+b$, $f'(x)=6x+2a$`, `$f'(1)=6+2a=${q.tex()}$, $a=${a}$`, `$f(1)=3+${2 * a < 0 ? `(${2 * a})` : 2 * a}+b=${p.tex()}$, $b=${b}$`],
            };
          }
          const k = r.nonzero(-3, 3);
          const g = rPoly(r, 2, 4);
          const h = rPoly(r, 2, 4);
          const c = r.int(-5, 5);
          const C = new F(c).sub(fv(g, 0)).sub(fv(h, 0));
          const val = fv(g, k).add(fv(h, k)).add(C);
          return {
            q: `함수 $F(x)=\\int\\left\\{\\frac{d}{dx}(${pp(g)})\\right\\}dx+\\frac{d}{dx}\\int(${pp(h)})\\,dx$ 에 대하여 $F(0)=${c}$ 일 때, $F(${k})$ 의 값을 구하세요.`,
            answer: { type: 'num', value: val.value },
            steps: [`$F(x)=(${pp(g)})+C+(${pp(h)})$`, `$F(0)=${fv(g, 0).add(fv(h, 0)).tex()}+C=${c}$, $C=${C.tex()}$`, `$F(${k})=${val.tex()}$`],
            hint: '미분한 것을 적분하면 적분상수가 생기고, 적분한 것을 미분하면 원래 함수입니다.',
          };
        },
      },
    ],
  },

  // ───────────────────────── cal1-6 정적분
  'cal1-6': {
    concepts: [
      {
        title: '정적분의 뜻',
        body: '$f(x)$ 의 한 부정적분을 $F(x)$ 라 하면\n$$\\int_{a}^{b}f(x)\\,dx=\\Big[F(x)\\Big]_{a}^{b}=F(b)-F(a)$$\n- 적분상수는 계산에서 지워지므로 생략',
      },
      {
        title: '정적분의 성질',
        body: '- $\\int_{a}^{a}f(x)dx=0$, $\\int_{b}^{a}f(x)dx=-\\int_{a}^{b}f(x)dx$\n- $\\int_{a}^{c}f(x)dx+\\int_{c}^{b}f(x)dx=\\int_{a}^{b}f(x)dx$\n- 대칭구간: $\\int_{-a}^{a}x^{\\text{짝수}}dx=2\\int_{0}^{a}x^{\\text{짝수}}dx$, $\\int_{-a}^{a}x^{\\text{홀수}}dx=0$\n- 절댓값·구간별 함수: 구간을 나누어 계산',
      },
      {
        title: '정적분으로 정의된 함수',
        body: '$$\\frac{d}{dx}\\int_{a}^{x}f(t)\\,dt=f(x)$$\n- $x=a$ 를 대입하면 $\\int_{a}^{a}f(t)dt=0$\n- $\\int_{0}^{1}f(t)dt$ 는 **상수** $k$ 로 놓고 풉니다.',
        example: { q: '$\\int_{1}^{x}f(t)dt=x^{2}+ax$ 일 때 $a$?', a: '$x=1$ 대입: $0=1+a$, $a=-1$' },
      },
      {
        title: '정적분과 극한',
        body: '$F\'=f$ 이면\n$$\\lim_{h\\to0}\\frac{1}{h}\\int_{a}^{a+h}f(t)dt=\\lim_{h\\to0}\\frac{F(a+h)-F(a)}{h}=F\'(a)=f(a)$$',
      },
    ],
    skills: [
      {
        id: 'definite',
        title: '정적분 계산',
        gen(r, level) {
          if (level < 3) {
            const f = rPoly(r, level === 1 ? 2 : 3, 5);
            const a = r.int(-2, 1),
              b = a + r.int(1, 3);
            const v = pDef(f, a, b);
            const I = pInt(f);
            return {
              q: `$\\int_{${a}}^{${b}}(${pp(f)})\\,dx$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v.value, display: 'frac' },
              steps: [`$\\Big[${pp(I)}\\Big]_{${a}}^{${b}}$`, `$=${fv(I, b).tex()}-${fv(I, a).n < 0 ? `(${fv(I, a).tex()})` : fv(I, a).tex()}=${v.tex()}$`],
            };
          }
          const A = r.int(1, 3);
          const f = P(r.nonzero(-3, 3), r.int(-4, 4), r.int(-4, 4), r.int(-5, 5));
          const v = pDef(f, -A, A);
          const even = P(f[1], 0, f[3]);
          return {
            q: `$\\int_{-${A}}^{${A}}(${pp(f)})\\,dx$ 의 값을 구하세요.`,
            answer: { type: 'num', value: v.value, display: 'frac' },
            steps: [`대칭구간에서 홀수 차수 항의 적분은 $0$`, `$2\\int_{0}^{${A}}(${pp(even)})\\,dx=2\\Big[${pp(pInt(even))}\\Big]_{0}^{${A}}$`, `$=${v.tex()}$`],
            hint: '$\\int_{-a}^{a}$ 에서는 홀수 차수 항이 사라집니다.',
          };
        },
      },
      {
        id: 'abs-piecewise',
        title: '절댓값·구간별 함수의 정적분',
        gen(r, level) {
          if (level === 1) {
            const c = r.int(1, 4),
              b = c + r.int(1, 4);
            const v = new F(c * c + (b - c) * (b - c), 2);
            return {
              q: `$\\int_{0}^{${b}}|x-${c}|\\,dx$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v.value, display: 'frac' },
              steps: [`$\\int_{0}^{${c}}(${c}-x)dx+\\int_{${c}}^{${b}}(x-${c})dx$`, `$=\\frac{${c * c}}{2}+\\frac{${(b - c) ** 2}}{2}=${v.tex()}$`],
            };
          }
          if (level === 2) {
            const c = r.int(0, 2);
            const g1 = P(r.nonzero(-2, 2), r.int(-3, 3));
            const g2c = P(1, r.int(-3, 3), 0);
            const g2 = P(g2c[0], g2c[1], fv(g1, c).sub(fv(g2c, c)));
            const a = c - r.int(1, 2),
              b = c + r.int(1, 2);
            const v = pDef(g1, a, c).add(pDef(g2, c, b));
            return {
              q: `함수 $f(x)=${cases([[pp(g1), `x<${c}`], [pp(g2), `x\\ge${c}`]])}$ 에 대하여 $\\int_{${a}}^{${b}}f(x)\\,dx$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v.value, display: 'frac' },
              steps: [`$\\int_{${a}}^{${c}}(${pp(g1)})dx+\\int_{${c}}^{${b}}(${pp(g2)})dx$`, `$=${pDef(g1, a, c).tex()}+${pDef(g2, c, b).n < 0 ? `(${pDef(g2, c, b).tex()})` : pDef(g2, c, b).tex()}=${v.tex()}$`],
            };
          }
          const r1 = r.int(-1, 1),
            r2 = r1 + r.int(1, 3);
          const f = pRoots(1, [r1, r2]);
          const a = r1 - r.int(0, 1),
            b = r2 + r.int(1, 2);
          const v = absInt(f, a, b, [r1, r2]);
          return {
            q: `$\\int_{${a}}^{${b}}|${pp(f)}|\\,dx$ 의 값을 구하세요.`,
            answer: { type: 'num', value: v.value, display: 'frac' },
            steps: [`$${pp(f)}=(${xm('x', r1)})(${xm('x', r2)})$ 는 $${r1}<x<${r2}$ 에서 음수`, `구간을 나누어 부호를 바꾸어 적분`, `$=${v.tex()}$`],
          };
        },
      },
      {
        id: 'integral-function',
        title: '정적분으로 정의된 함수',
        gen(r, level) {
          if (level === 1) {
            const g = rPoly(r, 2, 5);
            const a = r.int(-2, 2),
              k = r.int(-3, 3);
            return {
              q: `함수 $f(x)=\\int_{${a}}^{x}(${pp(g, 't')})\\,dt$ 에 대하여 $f'(${k})$ 의 값을 구하세요.`,
              answer: { type: 'num', value: fv(g, k).value },
              steps: [`$f'(x)=${pp(g)}$`, `$f'(${k})=${fv(g, k).tex()}$`],
            };
          }
          if (level === 2) {
            const a = r.pick([1, -1, 2]),
              p = r.int(-3, 3),
              d = r.int(-4, 4);
            const k = new F(-(a ** 3) - p * a * a - d, a);
            if (!k.isInt()) return this.gen(r, level);
            const f = P(3, 2 * p, k);
            const m = r.int(-3, 3);
            return {
              q: `다항함수 $f(x)$ 가 모든 실수 $x$ 에 대하여 $\\int_{${a}}^{x}f(t)\\,dt=x^{3}${kc(p, 'x^{2}')}+ax${kc(d, '')}$ 를 만족시킬 때, $f(${m})$ 의 값을 구하세요. (단, $a$ 는 상수)`,
              answer: { type: 'num', value: fv(f, m).value },
              steps: [`$x=${a}$ 대입: $0=${a ** 3}${kc(p * a * a, '')}${a > 0 ? '+' : ''}${cv(a, 'a')}${kc(d, '')}$, $a=${k.tex()}$`, `양변을 미분: $f(x)=${pp(f)}$`, `$f(${m})=${fv(f, m).tex()}$`],
            };
          }
          const a = r.nonzero(-3, 3),
            b = r.int(-4, 4),
            c = r.pick([2, 3, -1, -2, 4]);
          const k = new F(a, 3).add(new F(b, 2)).div(1 - c);
          const m = r.int(-2, 2);
          const val = new F(a * m * m + b * m).add(k.mul(c));
          return {
            q: `함수 $f(x)=${pp(P(a, b, 0))}${c > 0 ? '+' : '-'}${Math.abs(c) === 1 ? '' : Math.abs(c)}\\int_{0}^{1}f(t)\\,dt$ 에 대하여 $f(${m})$ 의 값을 구하세요.`,
            answer: { type: 'num', value: val.value, display: 'frac' },
            steps: [`$\\int_{0}^{1}f(t)dt=k$ (상수) 로 놓으면 $f(x)=${pp(P(a, b, 0))}${c > 0 ? '+' : '-'}${Math.abs(c) === 1 ? '' : Math.abs(c)}k$`, `$k=\\int_{0}^{1}(${pp(P(a, b, 0), 't')}${c > 0 ? '+' : '-'}${Math.abs(c) === 1 ? '' : Math.abs(c)}k)dt=${new F(a, 3).add(new F(b, 2)).tex()}${c > 0 ? '+' : '-'}${Math.abs(c) === 1 ? '' : Math.abs(c)}k$, $k=${k.tex()}$`, `$f(${m})=${val.tex()}$`],
          };
        },
      },
      {
        id: 'limit-integral',
        title: '정적분과 극한',
        gen(r, level) {
          const f = rPoly(r, 2, 5);
          const a = r.nonzero(-3, 3);
          if (level === 1) {
            return {
              q: `$\\lim_{h\\to0}\\frac{1}{h}\\int_{${a}}^{${a}+h}(${pp(f, 't')})\\,dt$ 의 값을 구하세요.`,
              answer: { type: 'num', value: fv(f, a).value },
              steps: [`$F'(t)=${pp(f, 't')}$ 라 하면 $\\lim_{h\\to0}\\frac{F(${a}+h)-F(${a})}{h}=F'(${a})$`, `$=${fv(f, a).tex()}$`],
            };
          }
          if (level === 2) {
            const two = r.chance(0.5);
            return {
              q: two ? `$\\lim_{h\\to0}\\frac{1}{h}\\int_{${a}-h}^{${a}+h}(${pp(f, 't')})\\,dt$ 의 값을 구하세요.` : `$\\lim_{x\\to${a}}\\frac{1}{${xm('x', a)}}\\int_{${a}}^{x}(${pp(f, 't')})\\,dt$ 의 값을 구하세요.`,
              answer: { type: 'num', value: (two ? fv(f, a).mul(2) : fv(f, a)).value },
              steps: two ? [`$\\frac{F(${a}+h)-F(${a}-h)}{h}\\to2F'(${a})=2f(${a})$`, `$=2\\times${fv(f, a).n < 0 ? `(${fv(f, a).tex()})` : fv(f, a).tex()}=${fv(f, a).mul(2).tex()}$`] : [`$\\frac{F(x)-F(${a})}{x-${a < 0 ? `(${a})` : a}}\\to F'(${a})=f(${a})$`, `$=${fv(f, a).tex()}$`],
            };
          }
          const v = fv(f, a).div(2 * a);
          return {
            q: `$\\lim_{x\\to${a}}\\frac{1}{x^{2}-${a * a}}\\int_{${a}}^{x}(${pp(f, 't')})\\,dt$ 의 값을 구하세요.`,
            answer: { type: 'num', value: v.value, display: 'frac' },
            steps: [`$\\frac{F(x)-F(${a})}{x-${a < 0 ? `(${a})` : a}}\\times\\frac{1}{${xm('x', -a)}}\\to f(${a})\\times\\frac{1}{${2 * a}}$`, `$f(${a})=${fv(f, a).tex()}$ 이므로 $${v.tex()}$`],
          };
        },
      },
      {
        id: 'integral-property',
        title: '정적분의 성질',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(-2, 1),
              b = a + r.int(1, 3),
              c = b + r.int(1, 3);
            const p = r.int(-10, 10),
              q = r.int(-10, 10);
            if (r.chance(0.5)) {
              return {
                q: `$\\int_{${a}}^{${b}}f(x)dx=${p}$, $\\int_{${b}}^{${c}}f(x)dx=${q}$ 일 때, $\\int_{${a}}^{${c}}f(x)dx$ 의 값을 구하세요.`,
                answer: { type: 'num', value: p + q },
                steps: [`$\\int_{${a}}^{${c}}=\\int_{${a}}^{${b}}+\\int_{${b}}^{${c}}=${p}+${q < 0 ? `(${q})` : q}=${p + q}$`],
              };
            }
            return {
              q: `$\\int_{${a}}^{${c}}f(x)dx=${p}$, $\\int_{${b}}^{${c}}f(x)dx=${q}$ 일 때, $\\int_{${a}}^{${b}}f(x)dx$ 의 값을 구하세요.`,
              answer: { type: 'num', value: p - q },
              steps: [`$\\int_{${a}}^{${b}}=\\int_{${a}}^{${c}}-\\int_{${b}}^{${c}}=${p}-${q < 0 ? `(${q})` : q}=${p - q}$`],
            };
          }
          if (level === 2) {
            const a = r.int(-2, 1),
              b = a + r.int(1, 4);
            const Pv = r.int(-8, 8),
              Q = r.int(-8, 8),
              al = r.nonzero(-3, 3),
              be = r.nonzero(-3, 3),
              ga = r.int(-3, 3);
            const v = al * Pv + be * Q + ga * (b - a);
            return {
              q: `$\\int_{${a}}^{${b}}f(x)dx=${Pv}$, $\\int_{${a}}^{${b}}g(x)dx=${Q}$ 일 때, $\\int_{${a}}^{${b}}\\{${termsTex([{ c: al, v: 'f(x)' }, { c: be, v: 'g(x)' }, { c: ga, v: '' }])}\\}dx$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v },
              steps: [`$${al}\\times${Pv < 0 ? `(${Pv})` : Pv}+${be < 0 ? `(${be})` : be}\\times${Q < 0 ? `(${Q})` : Q}${ga === 0 ? '' : `+${ga < 0 ? `(${ga})` : ga}\\times${b - a}`}=${v}$`],
            };
          }
          const a = r.int(-2, 1),
            b = a + r.int(1, 3);
          const s = r.int(1, 3);
          const g1 = pMul(P(1, s), P(1, s)),
            g2 = pMul(P(1, -s), P(1, -s));
          const diff = pSub(g1, g2);
          const v = pDef(diff, a, b);
          return {
            q: `$\\int_{${a}}^{${b}}(x+${s})^{2}\\,dx+\\int_{${b}}^{${a}}(x-${s})^{2}\\,dx$ 의 값을 구하세요.`,
            answer: { type: 'num', value: v.value, display: 'frac' },
            steps: [`$\\int_{${b}}^{${a}}=-\\int_{${a}}^{${b}}$ 이므로 $\\int_{${a}}^{${b}}\\{(x+${s})^{2}-(x-${s})^{2}\\}dx$`, `$=\\int_{${a}}^{${b}}${4 * s}x\\,dx=\\Big[${2 * s}x^{2}\\Big]_{${a}}^{${b}}=${v.tex()}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── cal1-7 정적분의 활용
  'cal1-7': {
    concepts: [
      {
        title: '곡선과 $x$ 축 사이의 넓이',
        body: '$$S=\\int_{a}^{b}|f(x)|\\,dx$$\n- $f(x)<0$ 인 구간은 부호를 바꾸어 더함 (구간을 나눔)\n- 공식: $y=a(x-\\alpha)(x-\\beta)$ 와 $x$ 축으로 둘러싸인 넓이 $=\\frac{|a|(\\beta-\\alpha)^{3}}{6}$',
      },
      {
        title: '두 곡선 사이의 넓이',
        body: '$$S=\\int_{a}^{b}|f(x)-g(x)|\\,dx$$\n- 먼저 교점의 $x$ 좌표를 구해 적분 구간을 정함\n- (위 곡선) $-$ (아래 곡선) 을 적분',
        example: { q: '$y=x^{2}$ 과 $y=x$ 로 둘러싸인 넓이?', a: '$\\int_{0}^{1}(x-x^{2})dx=\\frac{1}{6}$' },
      },
      {
        title: '속도와 거리',
        body: '수직선 위를 움직이는 점의 속도가 $v(t)$, 시각 $t=a$ 에서의 위치가 $x_0$ 이면\n- 시각 $t$ 에서의 위치: $x_0+\\int_{a}^{t}v(s)\\,ds$\n- $t=a$ 에서 $t=b$ 까지 위치의 변화량: $\\int_{a}^{b}v(t)\\,dt$\n- 움직인 거리: $\\int_{a}^{b}|v(t)|\\,dt$',
      },
    ],
    skills: [
      {
        id: 'area-axis',
        title: '곡선과 $x$ 축 사이의 넓이',
        gen(r, level) {
          if (level === 1) {
            const k = r.sign();
            const al = r.int(-3, 1),
              be = al + r.int(1, 4);
            const f = pRoots(k, [al, be]);
            const S = new F((be - al) ** 3, 6);
            return {
              q: `곡선 $y=${pp(f)}$ 와 $x$ 축으로 둘러싸인 부분의 넓이를 구하세요.`,
              fig: areaFig([pfn(f)], al, be, pfn(f), () => 0),
              answer: { type: 'num', value: S.value, display: 'frac' },
              steps: [`$x$ 축과의 교점: $x=${al}$, $x=${be}$`, `$S=\\int_{${al}}^{${be}}|${pp(f)}|\\,dx=\\frac{(${be}-${al < 0 ? `(${al})` : al})^{3}}{6}=${S.tex()}$`],
            };
          }
          if (level === 2) {
            const r1 = r.int(-2, 1),
              r2 = r1 + r.int(1, 3);
            const f = pRoots(1, [r1, r2]);
            const a = r1 + (r.chance(0.5) ? 0 : -1),
              b = r2 + r.int(1, 2);
            const lo = Math.max(a, r1);
            const S = absInt(f, lo, b, [r1, r2]);
            return {
              q: `곡선 $y=${pp(f)}$ 와 $x$ 축 및 두 직선 $x=${lo}$, $x=${b}$ 로 둘러싸인 부분의 넓이를 구하세요.`,
              fig: areaFig([pfn(f)], lo, b, pfn(f), () => 0),
              answer: { type: 'num', value: S.value, display: 'frac' },
              steps: [`$y=(${xm('x', r1)})(${xm('x', r2)})$ 는 $${r1}<x<${r2}$ 에서 음수, $x>${r2}$ 에서 양수`, `$S=-\\int_{${lo}}^{${r2}}f(x)dx+\\int_{${r2}}^{${b}}f(x)dx=${absInt(f, lo, r2, []).tex()}+${absInt(f, r2, b, []).tex()}$`, `$=${S.tex()}$`],
            };
          }
          const [p, q] = r.sample([-3, -2, -1, 1, 2, 3], 2).sort((x, y) => x - y);
          const roots = [0, p, q].sort((x, y) => x - y);
          const f = pRoots(1, roots);
          const S = absInt(f, roots[0], roots[2], [roots[1]]);
          return {
            q: `곡선 $y=${pp(f)}$ 와 $x$ 축으로 둘러싸인 부분의 넓이를 구하세요.`,
            fig: areaFig([pfn(f)], roots[0], roots[2], pfn(f), () => 0),
            answer: { type: 'num', value: S.value, display: 'frac' },
            steps: [`$y=${roots.map((t) => (t === 0 ? 'x' : `(${xm('x', t)})`)).join('')}$, 교점 $x=${roots.join(', ')}$`, `$\\int_{${roots[0]}}^{${roots[1]}}|y|dx=${absInt(f, roots[0], roots[1], []).tex()}$, $\\int_{${roots[1]}}^{${roots[2]}}|y|dx=${absInt(f, roots[1], roots[2], []).tex()}$`, `$S=${S.tex()}$`],
          };
        },
      },
      {
        id: 'area-curves',
        title: '두 곡선 사이의 넓이',
        gen(r, level) {
          const al = r.int(-3, 1),
            be = al + r.int(1, 3);
          const p = r.int(-3, 3),
            q = r.int(-3, 3);
          if (level === 1) {
            const curve = P(1, p, q);
            const line = P(p + al + be, q - al * be);
            const S = new F((be - al) ** 3, 6);
            return {
              q: `곡선 $y=${pp(curve)}$ 과 직선 $y=${pp(line)}$ 으로 둘러싸인 부분의 넓이를 구하세요.`,
              fig: areaFig([pfn(curve), pfn(line)], al, be, pfn(line), pfn(curve)),
              answer: { type: 'num', value: S.value, display: 'frac' },
              steps: [`교점: $${pp(curve)}=${pp(line)}$ → $(${xm('x', al)})(${xm('x', be)})=0$`, `$S=\\int_{${al}}^{${be}}\\{(${pp(line)})-(${pp(curve)})\\}dx=\\frac{(${be - al})^{3}}{6}=${S.tex()}$`],
            };
          }
          if (level === 2) {
            const f1 = P(1, p, q);
            const f2 = pSub(f1, pRoots(2, [al, be]));
            const S = new F((be - al) ** 3, 3);
            return {
              q: `두 곡선 $y=${pp(f1)}$, $y=${pp(f2)}$ 로 둘러싸인 부분의 넓이를 구하세요.`,
              fig: areaFig([pfn(f1), pfn(f2)], al, be, pfn(f2), pfn(f1)),
              answer: { type: 'num', value: S.value, display: 'frac' },
              steps: [`$(${pp(f2)})-(${pp(f1)})=${pp(pRoots(-2, [al, be]))}$, 교점 $x=${al}, ${be}$`, `$S=\\int_{${al}}^{${be}}${pp(pRoots(-2, [al, be])).startsWith('-') ? `(${pp(pRoots(-2, [al, be]))})` : pp(pRoots(-2, [al, be]))}dx=\\frac{2(${be - al})^{3}}{6}=${S.tex()}$`],
            };
          }
          const k = r.int(1, 2);
          const roots = [-k + r.int(-1, 0), r.int(-0, 0), k + r.int(0, 1)].sort((x, y) => x - y);
          const diff = pRoots(1, roots);
          const c = r.int(-3, 3),
            d = r.int(-3, 3);
          const curve = P(1, diff[1], c, d);
          const line = pSub(curve, diff);
          const S = absInt(diff, roots[0], roots[2], [roots[1]]);
          return {
            q: `곡선 $y=${pp(curve)}$ 과 직선 $y=${pp(line)}$ 로 둘러싸인 부분의 넓이를 구하세요.`,
            fig: areaFig([pfn(curve), pfn(line)], roots[0], roots[2], pfn(curve), pfn(line)),
            answer: { type: 'num', value: S.value, display: 'frac' },
            steps: [`(곡선) $-$ (직선) $=${pp(diff)}=${roots.map((t) => (t === 0 ? 'x' : `(${xm('x', t)})`)).join('')}$`, `교점 $x=${roots.join(', ')}$, 구간마다 위아래가 바뀜`, `$S=${absInt(diff, roots[0], roots[1], []).tex()}+${absInt(diff, roots[1], roots[2], []).tex()}=${S.tex()}$`],
          };
        },
      },
      {
        id: 'velocity-distance',
        title: '속도와 거리',
        gen(r, level) {
          const x0 = r.int(-5, 5);
          if (level === 1) {
            const a = r.int(1, 4),
              b = r.int(0, 5),
              T = r.int(1, 4);
            const v = P(a, b);
            const pos = pDef(v, 0, T).add(x0);
            return {
              q: `수직선 위를 움직이는 점 P 의 시각 $t$ 에서의 속도가 $v(t)=${pp(v, 't')}$ 이고 $t=0$ 일 때의 위치가 $${x0}$ 입니다. $t=${T}$ 일 때 점 P 의 위치를 구하세요.`,
              answer: { type: 'num', value: pos.value, display: 'frac' },
              steps: [`위치 $=${x0}+\\int_{0}^{${T}}(${pp(v, 't')})dt$`, `$=${x0}+${pDef(v, 0, T).tex()}=${pos.tex()}$`],
            };
          }
          if (level === 2) {
            const a = r.int(1, 4),
              t0 = r.int(1, 3),
              T = t0 + r.int(1, 3);
            const v = P(-a, a * t0);
            const dist = absInt(v, 0, T, [t0]);
            const disp = pDef(v, 0, T);
            const askDisp = r.chance(0.3);
            return {
              q: `수직선 위를 움직이는 점 P 의 시각 $t$ 에서의 속도가 $v(t)=${pp(v, 't')}$ 일 때, $t=0$ 에서 $t=${T}$ 까지 ${askDisp ? '점 P 의 위치의 변화량을' : '점 P 가 움직인 거리를'} 구하세요.`,
              answer: { type: 'num', value: (askDisp ? disp : dist).value, display: 'frac' },
              steps: askDisp ? [`$\\int_{0}^{${T}}(${pp(v, 't')})dt=${disp.tex()}$`] : [`$v(t)=0$ 인 $t=${t0}$ 에서 운동 방향이 바뀜`, `$\\int_{0}^{${t0}}v\\,dt+\\int_{${t0}}^{${T}}(-v)\\,dt=${absInt(v, 0, t0, []).tex()}+${absInt(v, t0, T, []).tex()}$`, `$=${dist.tex()}$`],
            };
          }
          const p = r.int(1, 2),
            q = p + r.int(1, 2),
            T = q + r.int(1, 2);
          const v = pRoots(1, [p, q]);
          const dist = absInt(v, 0, T, [p, q]);
          return {
            q: `수직선 위를 움직이는 점 P 의 시각 $t$ 에서의 속도가 $v(t)=${pp(v, 't')}$ 일 때, $t=0$ 에서 $t=${T}$ 까지 점 P 가 움직인 거리를 구하세요.`,
            answer: { type: 'num', value: dist.value, display: 'frac' },
            steps: [`$v(t)=(t-${p})(t-${q})$: $${p}<t<${q}$ 에서 $v<0$`, `$\\int_{0}^{${p}}v\\,dt=${absInt(v, 0, p, []).tex()}$, $\\int_{${p}}^{${q}}|v|dt=${absInt(v, p, q, []).tex()}$, $\\int_{${q}}^{${T}}v\\,dt=${absInt(v, q, T, []).tex()}$`, `거리 $=${dist.tex()}$`],
            hint: '거리는 $|v(t)|$ 를 적분합니다.',
          };
        },
      },
      {
        id: 'area-parameter',
        title: '넓이로 미지수 구하기',
        gen(r, level) {
          const k = r.int(1, 6);
          if (level === 1) {
            const S = new F(k ** 3, 6);
            return {
              q: `곡선 $y=x^{2}-kx\\,(k>0)$ 와 $x$ 축으로 둘러싸인 부분의 넓이가 $${S.tex()}$ 일 때, 상수 $k$ 의 값을 구하세요.`,
              answer: { type: 'num', value: k },
              steps: [`교점 $x=0, k$, 넓이 $=\\frac{k^{3}}{6}$`, `$\\frac{k^{3}}{6}=${S.tex()}$, $k^{3}=${k ** 3}$, $k=${k}$`],
            };
          }
          if (level === 2) {
            const a = r.int(1, 3);
            const S = new F(a * k ** 3, 6);
            return {
              q: `곡선 $y=${a === 1 ? '' : a}x^{2}$ 과 직선 $y=${a === 1 ? '' : a}kx\\,(k>0)$ 로 둘러싸인 부분의 넓이가 $${S.tex()}$ 일 때, 상수 $k$ 의 값을 구하세요.`,
              answer: { type: 'num', value: k },
              steps: [`교점 $x=0, k$, 넓이 $=\\int_{0}^{k}${a === 1 ? '' : a}(kx-x^{2})dx=\\frac{${a === 1 ? '' : a}k^{3}}{6}$`, `$k^{3}=${k ** 3}$, $k=${k}$`],
            };
          }
          const kk = r.int(1, 4);
          if (r.chance(0.5)) {
            const S = new F(4 * kk ** 3, 3);
            return {
              q: `곡선 $y=x^{2}-k^{2}\\,(k>0)$ 과 $x$ 축으로 둘러싸인 부분의 넓이가 $${S.tex()}$ 일 때, 상수 $k$ 의 값을 구하세요.`,
              answer: { type: 'num', value: kk },
              steps: [`교점 $x=\\pm k$, 넓이 $=\\frac{(2k)^{3}}{6}=\\frac{4k^{3}}{3}$`, `$k^{3}=${kk ** 3}$, $k=${kk}$`],
            };
          }
          const S = new F(kk ** 4, 2);
          return {
            q: `곡선 $y=x^{3}-k^{2}x\\,(k>0)$ 와 $x$ 축으로 둘러싸인 부분의 넓이가 $${S.tex()}$ 일 때, 상수 $k$ 의 값을 구하세요.`,
            answer: { type: 'num', value: kk },
            steps: [`교점 $x=-k, 0, k$, 원점 대칭이므로 넓이 $=2\\int_{0}^{k}(k^{2}x-x^{3})dx=2\\times\\frac{k^{4}}{4}=\\frac{k^{4}}{2}$`, `$k^{4}=${kk ** 4}$, $k=${kk}$`],
          };
        },
      },
    ],
  },
};

// 활용(문장제) 유형 덧붙이기
for (const [u, sk] of Object.entries(CAL1_WORD)) cal1[u].skills.push(...sk);
for (const [u, h] of Object.entries(CAL1_HARD)) {
  cal1[u].skills.push(...h.skills);
  cal1[u].top = [...(cal1[u].top ?? []), ...h.top];
}
