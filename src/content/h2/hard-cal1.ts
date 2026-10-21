// 미적분Ⅰ 심화·최상위 유형 — cal1.ts 의 각 단원 skills / top 뒤에 덧붙임
import { poly } from '../../core/tex';
import { P, pDef, pEval, pInt, pMul } from './util';
import type { P as Poly } from './util';
import { ans, cases, cst, fld, fr, pr, T, tt, type Hard, withJosa } from './hard-util';

const pp = (p: Poly, v = 'x') => poly(p, v);
/** (x-a) 꼴 (괄호 포함), a=0 이면 x */
const xa = (a: number, v = 'x') => (a === 0 ? v : `(${v}${cst(-a)})`);
const sgnStr = (v: number) => (v > 0 ? '+' : v < 0 ? '-' : '0');

export const CAL1_HARD: Hard = withJosa(
  {
    // ───────── 함수의 극한
    'cal1-1': {
      skills: [
        {
          id: 'poly-from-limits',
          title: '극한 조건으로 다항함수 결정하기',
          gen(r, level) {
            const c = r.int(1, 3);
            const k = r.pick([2, 3, -1, -2]);
            if (level === 1) {
              const b = r.nonzero(-5, 5);
              const f = P(c, b, 0);
              return {
                q: `이차함수 $f(x)$ 가 $\\lim_{x\\to\\infty}\\frac{f(x)}{x^{2}}=${c}$, $\\lim_{x\\to0}\\frac{f(x)}{x}=${b}$ 를 만족시킬 때, $f(${k})$ 의 값을 구하세요.`,
                answer: ans(pEval(f, k)),
                steps: [
                  `$\\lim_{x\\to\\infty}\\frac{f(x)}{x^{2}}=${c}$ → 최고차항은 $${c}x^{2}$`,
                  `$x\\to0$ 일 때 분모 $\\to0$ 인데 극한값이 있으므로 $f(0)=0$ → $f(x)=${c}x^{2}+px$`,
                  `$\\frac{f(x)}{x}=${c}x+p\\to p=${b}$`,
                  `$f(x)=${pp(f)}$, $f(${k})=${T(pEval(f, k))}$`,
                ],
              };
            }
            const a = r.nonzero(-4, 4),
              b = r.nonzero(-5, 5);
            if (level === 2) {
              const f = P(c, a, b, 0);
              return {
                q: `다항함수 $f(x)$ 가 $\\lim_{x\\to\\infty}\\frac{f(x)-${c === 1 ? '' : c}x^{3}}{x^{2}}=${a}$, $\\lim_{x\\to0}\\frac{f(x)}{x}=${b}$ 를 만족시킬 때, $f(${k})$ 의 값을 구하세요.`,
                answer: ans(pEval(f, k)),
                steps: [
                  `첫째 조건: $f(x)-${c === 1 ? '' : c}x^{3}$ 은 최고차항이 $${a}x^{2}$ 인 이차식 → $f(x)=${tt([c, 'x^{3}'], [a, 'x^{2}'])}+px+q$`,
                  `둘째 조건: 분모 $\\to0$ 이므로 $f(0)=q=0$, $\\frac{f(x)}{x}=${tt([c, 'x^{2}'], [a, 'x'])}+p\\to p=${b}$`,
                  `$f(x)=${pp(f)}$, $f(${k})=${T(pEval(f, k))}$`,
                ],
              };
            }
            const s = b - 2 * c - a;
            const f = pMul(P(1, -1), P(c, c + a, s));
            return {
              q: `다항함수 $f(x)$ 가 $\\lim_{x\\to\\infty}\\frac{f(x)-${c === 1 ? '' : c}x^{3}}{x^{2}}=${a}$, $\\lim_{x\\to1}\\frac{f(x)}{x-1}=${b}$ 를 만족시킬 때, $f(${k})$ 의 값을 구하세요.`,
              answer: ans(pEval(f, k)),
              steps: [
                `첫째 조건: $f(x)=${tt([c, 'x^{3}'], [a, 'x^{2}'])}+px+q$ 꼴`,
                `둘째 조건: 분모 $\\to0$ 이므로 $f(1)=0$ → $f(x)=(x-1)(${tt([c, 'x^{2}'], [c + a, 'x'])}+s)$ ($x^{3}$, $x^{2}$ 의 계수가 맞도록)`,
                `$\\lim_{x\\to1}\\frac{f(x)}{x-1}=${c}+${pr(c + a)}+s=${b}$ → $s=${s}$`,
                `$f(x)=(x-1)(${pp(P(c, c + a, s))})$, $f(${k})=${T(pEval(f, k))}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-cubic-two-limits',
          title: '두 극한값으로 삼차함수 결정하기',
          gen(r) {
            const al = r.int(-3, 2),
              be = r.int(al + 1, al + 4);
            const c = r.nonzero(-3, 3),
              e = r.int(-5, 5);
            const Pv = (al - be) * (c * al + e),
              Qv = (be - al) * (c * be + e);
            let k = r.int(-3, 4);
            while (k === al || k === be) k++;
            const fk = (k - al) * (k - be) * (c * k + e);
            return {
              q: `삼차함수 $f(x)$ 가 $\\lim_{x\\to${al}}\\frac{f(x)}{${pp(P(1, -al))}}=${Pv}$, $\\lim_{x\\to${be}}\\frac{f(x)}{${pp(P(1, -be))}}=${Qv}$ 를 만족시킬 때, $f(${k})$ 의 값을 구하세요.`,
              answer: ans(fk),
              steps: [
                `두 극한에서 분모 $\\to0$ 이므로 $f(${al})=0$, $f(${be})=0$`,
                `$f(x)=${xa(al)}${xa(be)}(px+q)$ $(p\\ne0)$ 로 놓아요.`,
                `$\\lim_{x\\to${al}}\\frac{f(x)}{${pp(P(1, -al))}}=(${al}-${pr(be)})(${al}p+q)=${Pv}$ → $${al === 0 ? 'q' : `${pr(al)}p+q`}=${c * al + e}$`.replace('(0p+q)', '(q)'),
                `$\\lim_{x\\to${be}}\\frac{f(x)}{${pp(P(1, -be))}}=(${be}-${pr(al)})(${be}p+q)=${Qv}$ → $${be === 0 ? 'q' : `${pr(be)}p+q`}=${c * be + e}$`.replace('(0p+q)', '(q)'),
                `연립하면 $p=${c}$, $q=${e}$`,
                `$f(${k})=(${k}-${pr(al)})(${k}-${pr(be)})(${c * k + e})=${fk}$`,
              ],
            };
          },
        },
        {
          id: 'top-sqrt-limit-param',
          title: '무리식의 극한에서 미정계수 정하기',
          gen(r) {
            const k = r.int(1, 4),
              v = r.nonzero(-5, 5);
            const neg = r.chance(0.5);
            const a = k * k;
            const b = neg ? -2 * k * v : 2 * k * v;
            const kx = k === 1 ? 'x' : `${k}x`;
            return {
              q: neg
                ? `$\\lim_{x\\to-\\infty}\\left(\\sqrt{ax^{2}+bx}+${kx}\\right)=${v}$ 일 때, 상수 $a$, $b$ 에 대하여 $a+b$ 의 값을 구하세요. (단, $a>0$)`
                : `$\\lim_{x\\to\\infty}\\left(\\sqrt{ax^{2}+bx}-${kx}\\right)=${v}$ 일 때, 상수 $a$, $b$ 에 대하여 $a+b$ 의 값을 구하세요. (단, $a>0$)`,
              answer: ans(a + b),
              steps: [
                ...(neg ? [`$x=-t$ 로 놓으면 $t\\to\\infty$ 이고 식은 $\\sqrt{at^{2}-bt}-${k === 1 ? '' : k}t$`] : []),
                `$a\\ne${k * k}$ 이면 $\\sqrt{a}\\ne${k}$ 라서 ${neg ? '$t$' : '$x$'} 의 일차 항이 남아 발산해요. 따라서 $a=${a}$`,
                `유리화: $\\frac{${neg ? '-bt' : 'bx'}}{\\sqrt{${a}${neg ? 't' : 'x'}^{2}${neg ? '-bt' : '+bx'}}+${k === 1 ? '' : k}${neg ? 't' : 'x'}}\\to\\frac{${neg ? '-b' : 'b'}}{${2 * k}}$`,
                `$\\frac{${neg ? '-b' : 'b'}}{${2 * k}}=${v}$ → $b=${b}$`,
                `$a+b=${a}+${pr(b)}=${a + b}$`,
              ],
            };
          },
        },
      ],
    },

    // ───────── 함수의 연속
    'cal1-2': {
      skills: [
        {
          id: 'composite-continuity',
          title: '합성함수가 연속이 될 조건',
          gen(r, level) {
            const c = r.int(-2, 2);
            if (level === 1) {
              const u = r.int(-3, 3);
              let w = r.int(-3, 3);
              if (c + u === w - c) w++;
              const L = c + u,
                R = w - c;
              const f = cases([
                [pp(P(1, u)), `x<${c}`],
                [pp(P(-1, w)), `x\\ge${c}`],
              ]);
              return {
                q: `함수 $f(x)=${f}$ 와 $g(x)=x^{2}+px+3$ 에 대하여 함수 $(g\\circ f)(x)$ 가 실수 전체의 집합에서 연속일 때, 상수 $p$ 의 값을 구하세요.`,
                answer: ans(-(L + R)),
                steps: [
                  `$x=${c}$ 에서만 확인하면 돼요. $\\lim_{x\\to${c}-}f(x)=${L}$, $\\lim_{x\\to${c}+}f(x)=f(${c})=${R}$`,
                  `$g\\circ f$ 가 연속 ⇔ $g(${L})=g(${R})$`,
                  `$${L * L}+${pr(L)}p+3=${R * R}+${pr(R)}p+3$ 에서 $(${L}-${pr(R)})(${L}+${pr(R)}+p)=0$`,
                  `$${L}\\ne${R}$ 이므로 $p=${-(L + R)}$`,
                ],
              };
            }
            if (level === 2) {
              const w = r.int(-3, 3);
              const R = w - c;
              let pv = r.int(-4, 4);
              if (pv === -2 * R) pv = pv === 4 ? -4 : pv + 1;
              const a1 = w - 2 * c,
                a2 = -pv - R - c;
              const f = cases([
                [`x+a`, `x<${c}`],
                [pp(P(-1, w)), `x\\ge${c}`],
              ]);
              return {
                q: `함수 $f(x)=${f}$ 와 $g(x)=${pp(P(1, pv, 0))}$ 에 대하여 함수 $(g\\circ f)(x)$ 가 실수 전체의 집합에서 연속이 되도록 하는 모든 실수 $a$ 의 값의 합을 구하세요.`,
                answer: ans(a1 + a2),
                steps: [
                  `$\\lim_{x\\to${c}-}f(x)=${c}+a$, $f(${c})=${R}$ 이고 $g(${c}+a)=g(${R})$ 이어야 해요.`,
                  `$g(s)=g(t)$ ⇔ $(s-t)(s+t${cst(pv)})=0$ ⇔ $s=t$ 또는 $s+t=${-pv}$`,
                  `(i) $${c}+a=${R}$ ($f$ 자체가 연속): $a=${a1}$`,
                  `(ii) $${c}+a+${pr(R)}=${-pv}$: $a=${a2}$`,
                  `합: $${a1}+${pr(a2)}=${a1 + a2}$`,
                ],
              };
            }
            const c1 = r.int(-3, -1),
              c2 = r.int(1, 3);
            const m = r.int(-3, 3);
            let w = r.int(-3, 4);
            if (m === w - c2) w++;
            const R2 = w - c2;
            const p = -(m + R2);
            const a1 = m - c1,
              a2 = R2 - c1;
            const f = cases([
              [`x+a`, `x<${c1}`],
              [`${m}`, `${c1}\\le x<${c2}`],
              [pp(P(-1, w)), `x\\ge${c2}`],
            ]);
            return {
              q: `함수 $f(x)=${f}$ 와 $g(x)=x^{2}+px+1$ 에 대하여 함수 $(g\\circ f)(x)$ 가 실수 전체의 집합에서 연속일 때, 상수 $p$ 의 값과 가능한 모든 실수 $a$ 의 값의 합을 구하세요.`,
              answer: fld(['p', p], ['a 의 합', a1 + a2]),
              steps: [
                `$g(s)=g(t)$ ⇔ $s=t$ 또는 $s+t=-p$`,
                `$x=${c2}$: 좌극한 $${m}$, $f(${c2})=${R2}$, $${m}\\ne${R2}$ 이므로 $${m}+${pr(R2)}=-p$ → $p=${p}$`,
                `$x=${c1}$: 좌극한 $${c1}+a$, $f(${c1})=${m}$`,
                `(i) $${c1}+a=${m}$ → $a=${a1}$, (ii) $${c1}+a+${pr(m)}=${-p}$ → $a=${a2}$`,
                `$a$ 의 합: $${a1 + a2}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-line-count-jump',
          title: '교점의 개수 함수의 불연속과 연속이 되는 곱',
          gen(r) {
            if (r.chance(0.5)) {
              const al = r.int(-4, 2);
              const half = r.int(1, 3);
              const be = al + 2 * half;
              const h = half * half;
              const pq = pp(P(1, -(al + be), al * be));
              const v = -h;
              return {
                q: `실수 $t$ 에 대하여 직선 $y=t$ 와 함수 $y=|${pq}|$ 의 그래프가 만나는 점의 개수를 $g(t)$ 라 하자. 함수 $(t^{2}+at+b)g(t)$ 가 실수 전체의 집합에서 연속일 때, 상수 $a$, $b$ 에 대하여 $a+b$ 의 값을 구하세요.`,
                answer: ans(v),
                steps: [
                  `$${pq}=(x${cst(-al)})(x${cst(-be)})$ 이므로 $y=|${pq}|$ 는 $x=${(al + be) / 2}$ 에서 높이 $${h}$ 인 봉우리가 있는 W 모양`,
                  `$g(t)$: $t<0$ 일 때 $0$, $t=0$ 일 때 $2$, $0<t<${h}$ 일 때 $4$, $t=${h}$ 일 때 $3$, $t>${h}$ 일 때 $2$`,
                  `$g(t)$ 는 $t=0$, $t=${h}$ 에서만 불연속이고, 그 점에서 좌·우극한이 달라요.`,
                  `$h(t)g(t)$ 가 $t_0$ 에서 연속이려면 $h(t_0)\\times(\\text{좌극한}-\\text{우극한})=0$ → $h(t_0)=0$`,
                  `$t^{2}+at+b=t(t-${h})$ → $a=${-h}$, $b=0$`,
                  `$a+b=${v}$`,
                ],
              };
            }
            const p = r.int(1, 3),
              q = r.int(-3, 6);
            const m = q - p * p;
            const a = -(m + q),
              b = m * q;
            return {
              q: `실수 $t$ 에 대하여 직선 $y=t$ 와 함수 $y=x^{2}-${2 * p}|x|${cst(q)}$ 의 그래프가 만나는 점의 개수를 $g(t)$ 라 하자. 함수 $(t^{2}+at+b)g(t)$ 가 실수 전체의 집합에서 연속일 때, 상수 $a$, $b$ 에 대하여 $a+b$ 의 값을 구하세요.`,
              answer: ans(a + b),
              steps: [
                `$y$ 축에 대칭이고 $x\\ge0$ 에서 $y=(x-${p})^{2}${cst(m)}$: 꼭짓점 $(\\pm${p}, ${m})$, $y$ 절편 $${q}$ 인 W 모양`,
                `$g(t)$: $t<${m}$ 일 때 $0$, $t=${m}$ 일 때 $2$, $${m}<t<${q}$ 일 때 $4$, $t=${q}$ 일 때 $3$, $t>${q}$ 일 때 $2$`,
                `불연속점은 $t=${m}$, $t=${q}$ (좌·우극한이 서로 달라요)`,
                `곱이 연속이려면 그 두 점에서 $t^{2}+at+b=0$ → $t^{2}+at+b=(t${cst(-m)})(t${cst(-q)})$`,
                `$a=${a}$, $b=${b}$, $a+b=${a + b}$`,
              ],
            };
          },
        },
        {
          id: 'top-ivt-min-roots',
          title: '사잇값 정리로 실근의 최소 개수',
          gen(r) {
            const kind = r.chance(0.5);
            for (;;) {
              const f = Array.from({ length: 7 }, () => r.int(-6, 9));
              if (kind) {
                const al = r.int(-2, 2),
                  be = r.int(-3, 3);
                const g = f.map((v, k) => v - (al * k + be));
                if (g.some((x) => x === 0)) continue;
                let ch = 0;
                for (let k = 0; k < 6; k++) if (g[k] * g[k + 1] < 0) ch++;
                if (ch < 2) continue;
                const line = pp(P(al, be));
                return {
                  q: `실수 전체의 집합에서 연속인 함수 $f(x)$ 에 대하여 $f(0), f(1), \\cdots, f(6)$ 의 값이 다음 표와 같다. 방정식 $f(x)=${line}$ 은 열린구간 $(0, 6)$ 에서 적어도 몇 개의 실근을 갖는지 구하세요.`,
                  table: [
                    ['$x$', ...f.map((_, k) => `$${k}$`)],
                    ['$f(x)$', ...f.map((v) => `$${v}$`)],
                  ],
                  answer: ans(ch),
                  steps: [
                    `$h(x)=f(x)-(${line})$ 로 놓으면 $h$ 도 연속`,
                    `$h(0), \\cdots, h(6)$: $${g.join(', ')}$`,
                    `부호: $${g.map(sgnStr).join(', ')}$`,
                    `이웃한 두 값의 부호가 바뀌는 구간마다 사잇값 정리로 실근이 적어도 하나: $${ch}$ 개`,
                  ],
                };
              }
              const h = f.slice(0, 6).map((v, k) => f[k + 1] - v);
              if (h.some((x) => x === 0)) continue;
              let ch = 0;
              for (let k = 0; k < 5; k++) if (h[k] * h[k + 1] < 0) ch++;
              if (ch < 2) continue;
              return {
                q: `실수 전체의 집합에서 연속인 함수 $f(x)$ 에 대하여 $f(0), f(1), \\cdots, f(6)$ 의 값이 다음 표와 같다. 방정식 $f(x)=f(x+1)$ 은 열린구간 $(0, 5)$ 에서 적어도 몇 개의 실근을 갖는지 구하세요.`,
                table: [
                  ['$x$', ...f.map((_, k) => `$${k}$`)],
                  ['$f(x)$', ...f.map((v) => `$${v}$`)],
                ],
                answer: ans(ch),
                steps: [`$h(x)=f(x+1)-f(x)$ 로 놓으면 $h$ 는 연속`, `$h(0), \\cdots, h(5)$: $${h.join(', ')}$`, `부호: $${h.map(sgnStr).join(', ')}$`, `부호가 바뀌는 구간마다 실근이 적어도 하나: $${ch}$ 개`],
              };
            }
          },
        },
      ],
    },

    // ───────── 미분계수와 도함수
    'cal1-3': {
      skills: [
        {
          id: 'derivative-remainder',
          title: '미분을 이용한 나머지 정리',
          gen(r, level) {
            if (level === 1) {
              const k = r.nonzero(-3, 3);
              const a = -3 * k * k,
                b = 2 * k ** 3;
              return {
                q: `다항식 $x^{3}+ax+b$ 가 $${xa(k)}^{2}$ 으로 나누어떨어질 때, 상수 $a$, $b$ 의 값을 구하세요.`,
                answer: fld(['a', a], ['b', b]),
                steps: [
                  `$f(x)=x^{3}+ax+b=${xa(k)}^{2}Q(x)$ 이면 $f(${k})=0$, $f'(${k})=0$ (미분하면 $${xa(k)}$ 가 남음)`,
                  `$f'(${k})=3\\times${pr(k)}^{2}+a=0$ → $a=${a}$`,
                  `$f(${k})=${pr(k)}^{3}+${pr(a)}\\times${pr(k)}+b=0$ → $b=${b}$`,
                ],
              };
            }
            if (level === 2) {
              const n = r.int(4, 10);
              const plus = r.chance(0.5);
              const sgn = n % 2 === 0 ? 1 : -1; // (-1)^n
              const a = plus ? n * sgn : -n;
              const b = plus ? a - sgn : n - 1;
              const root = plus ? -1 : 1;
              return {
                q: `다항식 $x^{${n}}+ax+b$ 가 $(x${plus ? '+' : '-'}1)^{2}$ 으로 나누어떨어질 때, 상수 $a$, $b$ 의 값을 구하세요.`,
                answer: fld(['a', a], ['b', b]),
                steps: [
                  `$f(x)=x^{${n}}+ax+b$ 라 하면 $f(${root})=0$, $f'(${root})=0$`,
                  `$f'(x)=${n}x^{${n - 1}}+a$ → $f'(${root})=${n * root ** (n - 1)}+a=0$, $a=${a}$`,
                  `$f(${root})=${root ** n}${plus ? '-a' : '+a'}+b=0$ → $b=${b}$`,
                ],
              };
            }
            const k = r.pick([1, -1, 2]);
            const n = k === 2 ? r.int(3, 5) : r.int(4, 7);
            const c = r.nonzero(-3, 3);
            const fk = k ** n + c * k * k,
              dk = n * k ** (n - 1) + 2 * c * k;
            const p = dk,
              q = fk - k * dk;
            return {
              q: `다항식 $${tt([1, `x^{${n}}`], [c, 'x^{2}'])}$ 을 $${xa(k)}^{2}$ 으로 나누었을 때의 나머지를 $px+q$ 라 할 때, $p$, $q$ 의 값을 구하세요.`,
              answer: fld(['p', p], ['q', q]),
              steps: [
                `$f(x)=${xa(k)}^{2}Q(x)+px+q$ 로 놓아요.`,
                `$x=${k}$ 대입: $f(${k})=${k}p+q$, 미분 후 대입: $f'(${k})=p$`,
                `$f(${k})=${fk}$, $f'(x)=${tt([n, `x^{${n - 1}}`], [2 * c, 'x'])}$ 이므로 $f'(${k})=${dk}$`,
                `$p=${p}$, $q=${fk}-${pr(k)}\\times${pr(dk)}=${q}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-abs-differentiable',
          title: '절댓값 함수의 곱이 미분가능할 조건',
          gen(r) {
            if (r.chance(0.5)) {
              const r1 = r.int(-3, 2),
                r2 = r.int(r1 + 1, r1 + 4);
              let k = r.int(-3, 5);
              while (k === r1 || k === r2) k++;
              const v = (k - r1) * (k - r2);
              const hk = Math.abs(v) * v;
              const pq = pp(P(1, -(r1 + r2), r1 * r2));
              return {
                q: `함수 $h(x)=|${pq}|(x^{2}+ax+b)$ 가 실수 전체의 집합에서 미분가능할 때, $h(${k})$ 의 값을 구하세요. (단, $a$, $b$ 는 상수)`,
                answer: ans(hk),
                steps: [
                  `$${pq}=${xa(r1)}${xa(r2)}$ 의 부호가 바뀌는 $x=${r1}$, $x=${r2}$ 에서만 확인하면 돼요.`,
                  `$q(x)=x^{2}+ax+b$ 라 하면 $x=${r1}$ 에서 우미분계수와 좌미분계수는 $\\pm|${r1}-${pr(r2)}|\\,q(${r1})$`,
                  `둘이 같으려면 $q(${r1})=0$, 마찬가지로 $q(${r2})=0$`,
                  `$q(x)=${xa(r1)}${xa(r2)}$ → $h(x)=|${pq}|(${pq})$`,
                  `$h(${k})=|${v}|\\times${pr(v)}=${hk}$`,
                ],
              };
            }
            const p = r.int(-3, 3);
            const s = r.int(-4, 4);
            let q0 = r.int(-3, 4);
            while (q0 === p || q0 === s) q0++;
            const V = Math.abs(q0 - p) * (q0 - p) * (q0 - s);
            const a = -(p + s),
              b = p * s;
            return {
              q: `함수 $g(x)=|${pp(P(1, -p))}|(x^{2}+ax+b)$ 가 실수 전체의 집합에서 미분가능하고 $g(${q0})=${V}$ 일 때, $a+b$ 의 값을 구하세요. (단, $a$, $b$ 는 상수)`,
              answer: ans(a + b),
              steps: [
                `$f(x)=x^{2}+ax+b$ 라 하면 $x=${p}$ 에서 좌·우미분계수는 $\\mp f(${p})$, $\\pm f(${p})$`,
                `미분가능하려면 $f(${p})=0$ → $f(x)=${xa(p)}(x-s)$`,
                `$g(${q0})=|${q0}-${pr(p)}|\\times(${q0}-${pr(p)})\\times(${q0}-s)=${V}$`,
                `$${Math.abs(q0 - p) * (q0 - p)}(${q0}-s)=${V}$ → $s=${s}$`,
                `$f(x)=${pp(P(1, a, b))}$ → $a+b=${a + b}$`,
              ],
            };
          },
        },
        {
          id: 'top-functional-derivative',
          title: '함수방정식으로 도함수 구하기',
          gen(r) {
            const cubic = r.chance(0.4);
            const be = r.nonzero(-5, 5);
            const k = r.nonzero(-4, 4);
            const m = r.int(2, 4);
            if (!cubic) {
              const al = 2 * r.nonzero(-3, 3);
              const f = P(al / 2, k, -be);
              return {
                q: `미분가능한 함수 $f(x)$ 가 모든 실수 $x$, $y$ 에 대하여 $f(x+y)=f(x)+f(y)${cst(al)}xy${cst(be)}$ 를 만족시키고 $\\lim_{x\\to0}\\frac{f(x)${cst(be)}}{x}=${k}$ 일 때, $f(${m})$ 의 값을 구하세요.`,
                answer: ans(pEval(f, m)),
                steps: [
                  `$x=y=0$: $f(0)=2f(0)${cst(be)}$ → $f(0)=${-be}$`,
                  `조건은 $\\lim_{x\\to0}\\frac{f(x)-f(0)}{x}=f'(0)=${k}$`,
                  `$f'(x)=\\lim_{h\\to0}\\frac{f(x+h)-f(x)}{h}=\\lim_{h\\to0}\\frac{f(h)${cst(al)}xh${cst(be)}}{h}=f'(0)${cst(al)}x$`,
                  `$f'(x)=${pp(P(al, k))}$ → $f(x)=${pp(f)}$ ($f(0)=${-be}$)`,
                  `$f(${m})=${T(pEval(f, m))}$`,
                ],
              };
            }
            const al = 3 * r.nonzero(-2, 2);
            const f = P(al / 3, 0, k, -be);
            return {
              q: `미분가능한 함수 $f(x)$ 가 모든 실수 $x$, $y$ 에 대하여 $f(x+y)=f(x)+f(y)${cst(al)}xy(x+y)${cst(be)}$ 를 만족시키고 $\\lim_{x\\to0}\\frac{f(x)${cst(be)}}{x}=${k}$ 일 때, $f(${m})$ 의 값을 구하세요.`,
              answer: ans(pEval(f, m)),
              steps: [
                `$x=y=0$: $f(0)=${-be}$, 조건은 $f'(0)=${k}$`,
                `$f(x+h)-f(x)=f(h)${cst(al)}xh(x+h)${cst(be)}=f(h)-f(0)${cst(al)}x^{2}h${cst(al)}xh^{2}$`,
                `$h$ 로 나누고 $h\\to0$: $f'(x)=f'(0)${cst(al)}x^{2}=${pp(P(al, 0, k))}$`,
                `$f(x)=${pp(f)}$ ($f(0)=${-be}$)`,
                `$f(${m})=${T(pEval(f, m))}$`,
              ],
            };
          },
        },
      ],
    },

    // ───────── 도함수의 활용
    'cal1-4': {
      skills: [
        {
          id: 'cubic-extreme-diff',
          title: '극댓값과 극솟값의 차',
          gen(r, level) {
            if (level === 1) {
              const a = r.int(1, 3),
                k = r.int(-5, 5);
              return {
                q: `함수 $f(x)=x^{3}-${3 * a}x^{2}${cst(k)}$ 의 극댓값과 극솟값의 차를 구하세요.`,
                answer: ans(4 * a ** 3),
                steps: [`$f'(x)=3x^{2}-${6 * a}x=3x(x-${2 * a})$`, `극댓값 $f(0)=${k}$, 극솟값 $f(${2 * a})=${8 * a ** 3 - 12 * a ** 3 + k}$`, `차: $${4 * a ** 3}$`],
              };
            }
            if (level === 2) {
              const al = r.int(-3, 1),
                be = r.int(al + 1, al + 4);
              const s = r.sign(),
                c = r.int(-5, 5);
              const f = P(2 * s, -3 * (al + be) * s, 6 * al * be * s, c);
              const fa = pEval(f, al),
                fb = pEval(f, be);
              const mx = s > 0 ? fa : fb,
                mn = s > 0 ? fb : fa;
              return {
                q: `함수 $f(x)=${pp(f)}$ 의 극댓값과 극솟값의 차를 구하세요.`,
                answer: ans(mx.sub(mn)),
                steps: [
                  `$f'(x)=${6 * s}${al === 0 || be === 0 ? 'x' : ''}${al !== 0 ? `(x${cst(-al)})` : ''}${be !== 0 ? `(x${cst(-be)})` : ''}$`,
                  `극댓값 $f(${s > 0 ? al : be})=${T(mx)}$, 극솟값 $f(${s > 0 ? be : al})=${T(mn)}$`,
                  `차: $${T(mx.sub(mn))}$ (공식: $(${be}-${pr(al)})^{3}=${(be - al) ** 3}$)`,
                ],
              };
            }
            const a = r.int(1, 3),
              b = r.int(-6, 6);
            const k = r.int(-2, 3);
            const f = P(1, 0, -3 * a * a, b);
            return {
              q: `함수 $f(x)=x^{3}-3a^{2}x+b$ $(a>0)$ 의 극댓값과 극솟값의 차가 $${4 * a ** 3}$ 이고 극댓값이 $${2 * a ** 3 + b}$ 일 때, $f(${k})$ 의 값을 구하세요.`,
              answer: ans(pEval(f, k)),
              steps: [
                `$f'(x)=3(x+a)(x-a)$ → 극댓값 $f(-a)=2a^{3}+b$, 극솟값 $f(a)=-2a^{3}+b$`,
                `차: $4a^{3}=${4 * a ** 3}$ → $a=${a}$`,
                `$2\\times${a ** 3}+b=${2 * a ** 3 + b}$ → $b=${b}$`,
                `$f(x)=${pp(f)}$, $f(${k})=${T(pEval(f, k))}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-tangent-count-cubic',
          title: '곡선 밖의 점에서 그은 접선의 개수',
          gen(r) {
            const s = r.sign();
            const m = r.int(-3, 3);
            const p = r.pick([2, 3, -2, -3]);
            const curve = pp(P(s, 0, m, 0));
            const p3 = p ** 3;
            const lo = Math.min(0, p3),
              hi = Math.max(0, p3);
            const three = r.chance(0.5);
            const qs2 = [m * p, m * p + s * p3];
            const v = three ? Math.abs(p3) - 1 : qs2[0] + qs2[1];
            return {
              q: three
                ? `점 $(${p}, q)$ 에서 곡선 $y=${curve}$ 에 서로 다른 세 개의 접선을 그을 수 있도록 하는 정수 $q$ 의 개수를 구하세요.`
                : `점 $(${p}, q)$ 에서 곡선 $y=${curve}$ 에 그을 수 있는 접선이 정확히 두 개가 되도록 하는 모든 실수 $q$ 의 값의 합을 구하세요.`,
              answer: ans(v),
              steps: [
                `접점 $(t, ${pp(P(s, 0, m, 0), 't')})$ 에서의 접선: $y=(${pp(P(3 * s, 0, m), 't')})(x-t)+(${pp(P(s, 0, m, 0), 't')})$`,
                `$(${p}, q)$ 대입 후 정리: $2t^{3}${cst(-3 * p)}t^{2}${s > 0 ? '+' : '-'}(q${cst(-m * p)})=0$ — 서로 다른 실근 $t$ 의 개수가 접선의 개수`,
                `$k(t)=2t^{3}${cst(-3 * p)}t^{2}$ 이라 하면 $k'(t)=6t(t${cst(-p)})$, 극값 $k(0)=0$, $k(${p})=${-p3}$`,
                `$w=${s > 0 ? '' : '-'}(q${cst(-m * p)})$ 라 하면 방정식은 $k(t)=-w$: 직선 $y=-w$ 와 $y=k(t)$ 의 교점 수`,
                three
                  ? `세 근: $${Math.min(0, -p3)}<-w<${Math.max(0, -p3)}$, 즉 $${lo}<w<${hi}$ → 정수 $q$ 는 $${Math.abs(p3) - 1}$ 개`
                  : `두 근(접할 때): $w=0$ 또는 $w=${p3}$ → $q=${qs2[0]}$ 또는 $q=${qs2[1]}$, 합 $${v}$`,
              ],
            };
          },
        },
        {
          id: 'top-quartic-no-max',
          title: '사차함수가 극댓값을 가질 조건',
          gen(r) {
            const c = r.pick([1, -1, 2, -2]);
            const M = r.int(5, 15);
            const d = r.int(-5, 5);
            const want = r.chance(0.5);
            let cnt = 0;
            for (let a = -M; a <= M; a++) {
              const has = 9 * c * c - 4 * a > 0 && a !== 0;
              if (has === want) cnt++;
            }
            const lim = fr(9 * c * c, 4);
            return {
              q: `$-${M}\\le a\\le ${M}$ 인 정수 $a$ 에 대하여 함수 $f(x)=x^{4}${cst(4 * c)}x^{3}+2ax^{2}${cst(d)}$ 가 극댓값을 ${want ? '갖도록' : '갖지 않도록'} 하는 $a$ 의 개수를 구하세요.`,
              answer: ans(cnt),
              steps: [
                `$f'(x)=4x^{3}${tt([12 * c, 'x^{2}']).replace(/^(?!-)/, '+')}+4ax=4x(x^{2}${tt([3 * c, 'x']).replace(/^(?!-)/, '+')}+a)$`,
                `최고차항이 양수인 사차함수는 $f'(x)=0$ 이 서로 다른 세 실근을 가질 때만 극댓값을 가져요.`,
                `$x^{2}${tt([3 * c, 'x']).replace(/^(?!-)/, '+')}+a=0$ 이 $0$ 이 아닌 서로 다른 두 실근: $D=${9 * c * c}-4a>0$, $a\\ne0$`,
                `$a<${T(lim)}$ 이고 $a\\ne0$ ($a=0$ 이면 $f'(x)=4x^{2}(x${cst(3 * c)})$ 로 극댓값이 없어요)`,
                want ? `$-${M}\\le a\\le ${Math.min(M, Math.ceil(lim.value) - 1)}$, $a\\ne0$ → $${cnt}$ 개` : `극댓값이 없는 $a$: $a=0$ 또는 $a\\ge${Math.ceil(lim.value)}$ → $${cnt}$ 개`,
              ],
            };
          },
        },
      ],
    },

    // ───────── 부정적분
    'cal1-5': {
      skills: [
        {
          id: 'piecewise-antideriv',
          title: '구간별 도함수에서 함수 복원하기',
          gen(r, level) {
            if (level <= 2) {
              const k = r.pick([2, 4, 6]);
              const a = level === 1 ? 0 : r.int(1, 3);
              const C = r.int(-5, 5);
              const u = r.int(1, 3);
              const h = k / 2;
              if (level === 1) {
                const v = r.int(1, 3);
                const val = h * u * u + C - h * v * v + C;
                return {
                  q: `함수 $f(x)$ 가 $f'(x)=${k}|x|$, $f(0)=${C}$ 를 만족시킬 때, $f(${u})+f(${-v})$ 의 값을 구하세요.`,
                  answer: ans(val),
                  steps: [
                    `$x\\ge0$: $f(x)=${h === 1 ? '' : h}x^{2}+C_1$, $x<0$: $f(x)=-${h === 1 ? '' : h}x^{2}+C_2$`,
                    `$f$ 는 미분가능하므로 연속: $C_1=C_2=f(0)=${C}$`,
                    `$f(${u})=${h * u * u + C}$, $f(${-v})=${-h * v * v + C}$`,
                    `합: $${val}$`,
                  ],
                };
              }
              // f'(x) = k|x-a|, f(0) = C0, a>0
              const C0 = C;
              const Cc = C0 + h * a * a; // x<a: -h(x-a)^2 + Cc
              const val = h * u * u + Cc;
              return {
                q: `함수 $f(x)$ 가 $f'(x)=${k}|x-${a}|$, $f(0)=${C0}$ 을 만족시킬 때, $f(${a + u})$ 의 값을 구하세요.`,
                answer: ans(val),
                steps: [
                  `$x\\ge${a}$: $f(x)=${h === 1 ? '' : h}(x-${a})^{2}+C_1$, $x<${a}$: $f(x)=-${h === 1 ? '' : h}(x-${a})^{2}+C_2$`,
                  `연속이므로 $C_1=C_2=C$`,
                  `$f(0)=-${h * a * a}+C=${C0}$ → $C=${Cc}$`,
                  `$f(${a + u})=${h}\\times${u * u}+${pr(Cc)}=${val}$`,
                ],
              };
            }
            const a = r.pick([0, 1, -1]);
            const u = r.nonzero(-2, 2),
              v = r.int(-3, 3),
              w = r.nonzero(-2, 2),
              z = r.int(-2, 2);
            const p1 = P(2 * u, v),
              p2 = P(3 * w, 2 * z, 0);
            const F1 = pInt(p1),
              F2 = pInt(p2);
            const x0 = a - r.int(1, 2),
              x1 = a + r.int(1, 2);
            const y0 = r.int(-5, 5);
            const C1 = fr(y0).sub(pEval(F1, x0));
            const C2 = pEval(F1, a).add(C1).sub(pEval(F2, a));
            const ans1 = pEval(F2, x1).add(C2);
            return {
              q: `실수 전체의 집합에서 연속인 함수 $f(x)$ 가 $x\\ne${a}$ 인 모든 $x$ 에 대하여 $$f'(x)=${cases([
                [pp(p1), `x<${a}`],
                [pp(p2), `x>${a}`],
              ])}$$ 이고 $f(${x0})=${y0}$ 일 때, $f(${x1})$ 의 값을 구하세요.`,
              answer: ans(ans1),
              steps: [
                `$x<${a}$: $f(x)=${pp(F1)}+C_1$, $x>${a}$: $f(x)=${pp(F2)}+C_2$`,
                `$f(${x0})=${T(pEval(F1, x0))}+C_1=${y0}$ → $C_1=${T(C1)}$`,
                `$x=${a}$ 에서 연속: $${T(pEval(F1, a))}+${pr(C1)}=${T(pEval(F2, a))}+C_2$ → $C_2=${T(C2)}$`,
                `$f(${x1})=${T(pEval(F2, x1))}+${pr(C2)}=${T(ans1)}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-xf-minus-f',
          title: "$xf'(x)-f(x)$ 가 주어진 다항함수",
          gen(r) {
            const u = r.nonzero(-3, 3),
              v = r.nonzero(-4, 4),
              w = r.nonzero(-5, 5);
            const Tv = r.int(-5, 5);
            const C = Tv - u - v + w;
            const f = P(u, v, C, -w);
            const k = r.pick([2, 3, -1, -2]);
            return {
              q: `다항함수 $f(x)$ 가 모든 실수 $x$ 에 대하여 $xf'(x)-f(x)=${pp(P(2 * u, v, 0, w))}$ 를 만족시키고 $f(1)=${Tv}$ 일 때, $f(${k})$ 의 값을 구하세요.`,
              answer: ans(pEval(f, k)),
              steps: [
                `$f(x)$ 의 최고차항을 $px^{n}$ 이라 하면 $xf'(x)-f(x)$ 의 최고차항은 $(n-1)px^{n}$ 이므로 $n=3$`,
                `$f(x)=ax^{3}+bx^{2}+cx+d$ 로 놓으면 $xf'(x)-f(x)=2ax^{3}+bx^{2}-d$ ($x$ 의 계수는 $0$)`,
                `계수 비교: $2a=${2 * u}$, $b=${v}$, $-d=${w}$ → $f(x)=${tt([u, 'x^{3}'], [v, 'x^{2}'])}+cx${cst(-w)}$`,
                `$f(1)=${u + v - w}+c=${Tv}$ → $c=${C}$`,
                `$f(${k})=${T(pEval(f, k))}$`,
              ],
            };
          },
        },
        {
          id: 'top-antideriv-xf',
          title: '부정적분과 함수가 섞인 등식',
          gen(r) {
            const k = r.pick([2, 3, -1, -2]);
            if (r.chance(0.5)) {
              const al = 2 * r.nonzero(-2, 2),
                be = r.nonzero(-3, 3);
              const Tv = r.int(-5, 5);
              const C = fr(Tv)
                .add(fr(3 * al, 2))
                .add(2 * be);
              const f = [fr(-3 * al, 2), fr(-2 * be), C];
              return {
                q: `함수 $f(x)$ 의 한 부정적분 $F(x)$ 가 모든 실수 $x$ 에 대하여 $F(x)=xf(x)${tt([al, 'x^{3}'], [be, 'x^{2}']).replace(/^(?!-)/, '+')}$ 을 만족시키고 $f(1)=${Tv}$ 일 때, $f(${k})$ 의 값을 구하세요.`,
                answer: ans(pEval(f, k)),
                steps: [
                  `양변을 미분: $f(x)=f(x)+xf'(x)${tt([3 * al, 'x^{2}'], [2 * be, 'x']).replace(/^(?!-)/, '+')}$`,
                  `$xf'(x)=${tt([-3 * al, 'x^{2}'], [-2 * be, 'x'])}$ → $f'(x)=${pp(P(-3 * al, -2 * be))}$`,
                  `$f(x)=${tt([fr(-3 * al, 2), 'x^{2}'], [-2 * be, 'x'])}+C$`,
                  `$f(1)=${T(fr(-3 * al, 2).add(-2 * be))}+C=${Tv}$ → $C=${T(C)}$`,
                  `$f(${k})=${T(pEval(f, k))}$`,
                ],
              };
            }
            const u = r.pick([6, -6]);
            const v = 2 * r.int(-2, 2);
            const C = r.int(-5, 5);
            const g = [fr(-u, 3), fr(-(v - u), 2), fr(v), fr(0)];
            const f = [fr(u, 2), fr(v), fr(C)];
            return {
              q: `함수 $f(x)$ 의 한 부정적분 $F(x)$ 가 모든 실수 $x$ 에 대하여 $F(x)=(x-1)f(x)${pp(g).replace(/^(?!-)/, '+')}$ 를 만족시키고 $f(0)=${C}$ 일 때, $f(${k})$ 의 값을 구하세요.`,
              answer: ans(pEval(f, k)),
              steps: [
                `양변을 미분: $f(x)=f(x)+(x-1)f'(x)${pp(P(-u, -(v - u), v)).replace(/^(?!-)/, '+')}$`,
                `$(x-1)f'(x)=${pp(P(u, v - u, -v))}=(x-1)(${pp(P(u, v))})$`,
                `$f'(x)=${pp(P(u, v))}$ → $f(x)=${tt([u / 2, 'x^{2}'], [v, 'x'])}+C$`,
                `$f(0)=C=${C}$`,
                `$f(${k})=${T(pEval(f, k))}$`,
              ],
            };
          },
        },
      ],
    },

    // ───────── 정적분
    'cal1-6': {
      skills: [
        {
          id: 'odd-even-periodic',
          title: '대칭성과 주기성을 이용한 정적분',
          gen(r, level) {
            if (level === 1) {
              const a = r.int(1, 3);
              const c3 = r.nonzero(-4, 4),
                c2 = 3 * r.nonzero(-2, 2),
                c1 = r.nonzero(-5, 5),
                c0 = r.int(-4, 4);
              const v = pDef(P(c2, 0, c0), -a, a);
              return {
                q: `$\\int_{-${a}}^{${a}}(${pp(P(c3, c2, c1, c0))})\\,dx$ 의 값을 구하세요.`,
                answer: ans(v),
                steps: [
                  `홀수차 항 $${tt([c3, 'x^{3}'], [c1, 'x'])}$ 은 $-${a}$ 부터 $${a}$ 까지 적분하면 $0$`,
                  `짝수차 항만: $2\\int_{0}^{${a}}(${pp(P(c2, 0, c0))})\\,dx=2\\left[${tt([c2 / 3, 'x^{3}'], [c0, 'x'])}\\right]_{0}^{${a}}=${T(v)}$`,
                ],
              };
            }
            if (level === 2) {
              const a = r.int(1, 4),
                Pv = r.nonzero(-6, 9),
                k = r.nonzero(-4, 4),
                mm = r.nonzero(-3, 3);
              return {
                q: `연속함수 $f(x)$ 가 모든 실수 $x$ 에 대하여 $f(-x)=f(x)$ 이고 $\\int_{0}^{${a}}f(x)\\,dx=${Pv}$ 일 때, $\\int_{-${a}}^{${a}}(${tt([1, 'x^{3}'], [k, 'x'], [mm, ''])})f(x)\\,dx$ 의 값을 구하세요.`,
                answer: ans(2 * mm * Pv),
                steps: [`$f$ 가 우함수이므로 $x^{3}f(x)$, $xf(x)$ 는 기함수 → 적분값 $0$`, `남는 것: $${mm === 1 ? '' : mm === -1 ? '-' : mm}\\int_{-${a}}^{${a}}f(x)\\,dx=${pr(mm)}\\times2\\times${pr(Pv)}=${2 * mm * Pv}$`],
              };
            }
            const p = r.pick([2, 3]);
            const k = p === 2 ? r.pick([3, -3, 6]) : r.pick([2, -2, 4]);
            const c = r.int(-3, 5);
            const n = r.int(2, 6);
            const q0 = r.pick([1, -1, 2, -2]);
            const g = P(k, -k * p, c);
            const one = pDef(g, 0, p);
            return {
              q: `함수 $f(x)$ 가 $0\\le x\\le ${p}$ 에서 $f(x)=${pp(g)}$ 이고, 모든 실수 $x$ 에 대하여 $f(x+${p})=f(x)$ 를 만족시킬 때, $\\int_{${q0}}^{${q0 + n * p}}f(x)\\,dx$ 의 값을 구하세요.`,
              answer: ans(one.mul(n)),
              steps: [
                `$f(0)=f(${p})=${c}$ 이므로 $f$ 는 연속이고 주기가 $${p}$`,
                `주기함수는 길이가 주기인 어느 구간에서 적분해도 값이 같아요: $\\int_{a}^{a+${p}}f(x)\\,dx=\\int_{0}^{${p}}f(x)\\,dx$`,
                `$\\int_{0}^{${p}}(${pp(g)})\\,dx=${T(one)}$`,
                `구간 길이 $${n * p}=${p}\\times${n}$ 이므로 $${n}\\times${pr(one)}=${T(one.mul(n))}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-xf-integral-eq',
          title: '정적분을 포함한 등식으로 함수 결정하기',
          gen(r) {
            const k = r.pick([2, 3, -1, -2]);
            if (r.chance(0.5)) {
              const p = 2 * r.nonzero(-2, 2),
                q = r.nonzero(-4, 4);
              const C = -p / 2 - q;
              const f = P((3 * p) / 2, 2 * q, C);
              return {
                q: `다항함수 $f(x)$ 가 모든 실수 $x$ 에 대하여 $$xf(x)=${tt([p, 'x^{3}'], [q, 'x^{2}'])}+\\int_{1}^{x}f(t)\\,dt$$ 를 만족시킬 때, $f(${k})$ 의 값을 구하세요.`,
                answer: ans(pEval(f, k)),
                steps: [
                  `양변을 미분: $f(x)+xf'(x)=${tt([3 * p, 'x^{2}'], [2 * q, 'x'])}+f(x)$`,
                  `$f'(x)=${pp(P(3 * p, 2 * q))}$ → $f(x)=${tt([(3 * p) / 2, 'x^{2}'], [2 * q, 'x'])}+C$`,
                  `$x=1$ 대입: $f(1)=${p + q}+0$ → $${(3 * p) / 2 + 2 * q}+C=${p + q}$, $C=${C}$`,
                  `$f(${k})=${T(pEval(f, k))}$`,
                ],
              };
            }
            const a = r.nonzero(-3, 3),
              b = r.nonzero(-4, 4);
            const f = P(12, 6 * a, 2 * b);
            return {
              q: `연속함수 $f(x)$ 가 모든 실수 $x$ 에 대하여 $$\\int_{0}^{x}(x-t)f(t)\\,dt=${tt([1, 'x^{4}'], [a, 'x^{3}'], [b, 'x^{2}'])}$$ 을 만족시킬 때, $f(${k})$ 의 값을 구하세요.`,
              answer: ans(pEval(f, k)),
              steps: [
                `좌변 $=x\\int_{0}^{x}f(t)\\,dt-\\int_{0}^{x}tf(t)\\,dt$`,
                `미분: $\\int_{0}^{x}f(t)\\,dt+xf(x)-xf(x)=\\int_{0}^{x}f(t)\\,dt=${tt([4, 'x^{3}'], [3 * a, 'x^{2}'], [2 * b, 'x'])}$`,
                `한 번 더 미분: $f(x)=${pp(f)}$`,
                `$f(${k})=${T(pEval(f, k))}$`,
              ],
            };
          },
        },
        {
          id: 'top-integral-func-roots',
          title: '정적분으로 정의된 함수와 방정식의 실근',
          gen(r) {
            const al = r.int(-3, 1),
              be = al + r.pick([3, 6]);
            const s = r.sign();
            const c = r.int(al - 1, be + 1);
            const g = P(s, -s * (al + be), s * al * be);
            const Ga = pDef(g, c, al),
              Gb = pDef(g, c, be);
            const lo = Ga.cmp(Gb) < 0 ? Ga : Gb,
              hi = Ga.cmp(Gb) < 0 ? Gb : Ga;
            let cnt = 0;
            for (let k = Math.ceil(lo.value) - 1; k <= Math.floor(hi.value) + 1; k++) if (lo.cmp(k) < 0 && hi.cmp(k) > 0) cnt++;
            return {
              q: `함수 $g(x)=\\int_{${c}}^{x}(${pp(g, 't')})\\,dt$ 에 대하여 방정식 $g(x)=k$ 가 서로 다른 세 실근을 갖도록 하는 정수 $k$ 의 개수를 구하세요.`,
              answer: ans(cnt),
              steps: [
                `$g'(x)=${pp(g)}=${s < 0 ? '-' : ''}${xa(al)}${xa(be)}$`,
                `$g$ 는 ${s > 0 ? `$x=${al}$ 에서 극대, $x=${be}$ 에서 극소` : `$x=${al}$ 에서 극소, $x=${be}$ 에서 극대`}인 삼차함수`,
                `$g(${al})=\\int_{${c}}^{${al}}(${pp(g, 't')})\\,dt=${T(Ga)}$, $g(${be})=${T(Gb)}$`,
                `세 실근 ⇔ $${T(lo)}<k<${T(hi)}$`,
                `정수 $k$ 는 $${cnt}$ 개`,
              ],
            };
          },
        },
      ],
    },

    // ───────── 정적분의 활용
    'cal1-7': {
      skills: [
        {
          id: 'tangent-area',
          title: '곡선과 접선으로 둘러싸인 넓이',
          gen(r, level) {
            if (level === 1) {
              const c = r.int(1, 3),
                e = r.int(-3, 3),
                a = r.nonzero(-3, 3);
              const area = fr(c * Math.abs(a) ** 3, 3);
              const tl = P(2 * c * a, -c * a * a + e);
              return {
                q: `곡선 $y=${pp(P(c, 0, e))}$ 위의 점 $(${a}, ${c * a * a + e})$ 에서의 접선과 이 곡선 및 $y$ 축으로 둘러싸인 부분의 넓이를 구하세요.`,
                answer: ans(area),
                steps: [
                  `접선: $y=${pp(tl)}$`,
                  `(곡선)$-$(접선)$=${c === 1 ? '' : c}${xa(a)}^{2}\\ge0$`,
                  `넓이 $=\\int_{${Math.min(0, a)}}^{${Math.max(0, a)}}${c === 1 ? '' : c}${xa(a)}^{2}\\,dx=\\frac{${c}\\times${Math.abs(a) ** 3}}{3}=${T(area)}$`,
                ],
              };
            }
            if (level === 2) {
              const c = r.int(1, 3),
                p = r.int(-3, 3),
                q = r.int(-3, 3);
              const al = r.int(-3, 1),
                be = al + r.int(1, 4);
              const m = c * (al + be) + p,
                n = q - c * al * be;
              const area = pDef(P(-c, c * (al + be), -c * al * be), al, be);
              return {
                q: `곡선 $y=${pp(P(c, p, q))}$ 와 직선 $y=${pp(P(m, n))}$ 로 둘러싸인 부분의 넓이를 구하세요.`,
                answer: ans(area),
                steps: [
                  `교점: $${pp(P(c, p - m, q - n))}=0$ → $${c === 1 ? '' : c}${xa(al)}${xa(be)}=0$, $x=${al}, ${be}$`,
                  `넓이 $=\\int_{${al}}^{${be}}\\{(${pp(P(m, n))})-(${pp(P(c, p, q))})\\}dx=\\frac{${c}(${be}-${pr(al)})^{3}}{6}=${T(area)}$`,
                ],
              };
            }
            const c = r.nonzero(-2, 2),
              e = r.int(-3, 3),
              a = r.nonzero(-2, 2);
            const f = P(c, 0, e, 0);
            const fa = pEval(f, a),
              d = 3 * c * a * a + e;
            const tl = P(d, fa.sub(d * a));
            const diff = P(c, 0, e - d, fa.neg().add(d * a));
            const lo = Math.min(a, -2 * a),
              hi = Math.max(a, -2 * a);
            let area = pDef(diff, lo, hi);
            if (area.n < 0) area = area.neg();
            return {
              q: `곡선 $y=${pp(f)}$ 위의 점 $(${a}, ${T(fa)})$ 에서의 접선과 이 곡선으로 둘러싸인 부분의 넓이를 구하세요.`,
              answer: ans(area),
              steps: [
                `접선: $y=${pp(tl)}$`,
                `(곡선)$-$(접선)$=${pp(diff)}=${c === 1 ? '' : c === -1 ? '-' : c}${xa(a)}^{2}${xa(-2 * a)}$ ($x^{2}$ 항이 없어 세 근의 합이 $0$ → 다른 교점 $x=${-2 * a}$)`,
                `넓이 $=\\left|\\int_{${lo}}^{${hi}}(${pp(diff)})\\,dx\\right|=${T(area)}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-equal-areas',
          title: '넓이가 같거나 비가 주어진 조건',
          gen(r) {
            if (r.chance(0.5)) {
              const p = 2 * r.int(1, 3);
              const S = p ** 4 / 2;
              return {
                q: `곡선 $y=x(x-${p})(x-k)$ $(k>${p})$ 와 $x$ 축으로 둘러싸인 두 부분의 넓이가 서로 같을 때, 상수 $k$ 의 값과 두 부분의 넓이의 합 $S$ 를 구하세요.`,
                answer: fld(['k', 2 * p], ['S', S]),
                steps: [
                  `$0<x<${p}$ 에서 $y>0$, $${p}<x<k$ 에서 $y<0$ 이므로 두 넓이가 같다 ⇔ $\\int_{0}^{k}x(x-${p})(x-k)\\,dx=0$`,
                  `$\\int_{0}^{k}\\{x^{3}-(k+${p})x^{2}+${p}kx\\}dx=\\frac{k^{4}}{4}-\\frac{(k+${p})k^{3}}{3}+\\frac{${p}k^{3}}{2}=\\frac{k^{3}(${2 * p}-k)}{12}$`,
                  `$k=${2 * p}$`,
                  `한 부분: $\\int_{0}^{${p}}x(x-${p})(x-${2 * p})\\,dx=\\frac{${p}^{4}}{4}=${p ** 4 / 4}$`,
                  `$S=2\\times${p ** 4 / 4}=${S}$`,
                ],
              };
            }
            const c = r.int(1, 4),
              n = r.pick([2, 3]);
            const m = (n - 1) * c;
            return {
              q: `곡선 $y=${pp(P(1, -c, 0))}$ 와 직선 $y=mx$ $(m>0)$ 로 둘러싸인 부분의 넓이가 곡선 $y=${pp(P(1, -c, 0))}$ 와 $x$ 축으로 둘러싸인 부분의 넓이의 $${n ** 3}$ 배일 때, 상수 $m$ 의 값을 구하세요.`,
              answer: ans(m),
              steps: [
                `곡선과 $x$ 축: 교점 $0$, $${c}$ → 넓이 $\\frac{${c}^{3}}{6}$`,
                `곡선과 직선: $x^{2}-(${c}+m)x=0$ → 교점 $0$, $${c}+m$ → 넓이 $\\frac{(${c}+m)^{3}}{6}$`,
                `$\\frac{(${c}+m)^{3}}{6}=${n ** 3}\\times\\frac{${c ** 3}}{6}$ → $(${c}+m)^{3}=${(n * c) ** 3}$`,
                `$${c}+m=${n * c}$ → $m=${m}$`,
              ],
            };
          },
        },
        {
          id: 'top-motion-return',
          title: '다시 만나는 시각과 움직인 거리',
          gen(r) {
            if (r.chance(0.5)) {
              const k = r.pick([3, 6]),
                a = r.int(1, 5);
              const dist = (k * a ** 3) / 3;
              const v = P(k, -k * a, 0);
              return {
                q: `원점을 출발하여 수직선 위를 움직이는 점 $P$ 의 시각 $t$ $(t\\ge0)$ 에서의 속도가 $v(t)=${pp(v, 't')}$ 이다. 점 $P$ 가 출발한 후 처음으로 다시 원점으로 돌아올 때까지 움직인 거리를 구하세요.`,
                answer: ans(dist),
                steps: [
                  `위치 $x(t)=\\int_{0}^{t}v(s)\\,ds=${pp(pInt(v), 't')}=${T(fr(k, 6))}t^{2}(2t-${3 * a})$`,
                  `$x(t)=0$ $(t>0)$ → $t=${T(fr(3 * a, 2))}$`,
                  `$0<t<${a}$ 에서 $v<0$, $t>${a}$ 에서 $v>0$ (방향이 $t=${a}$ 에서 바뀜)`,
                  `$x(${a})=${T(pEval(pInt(v), a))}$ 이므로 갔다가 돌아온 거리: $2\\times${T(pEval(pInt(v), a).neg())}=${dist}$`,
                ],
              };
            }
            const S = r.pick([3, 6]);
            const mm = r.int(1, S - 1),
              nn = S - mm;
            const mx = (4 * S ** 3) / 27;
            return {
              q: `원점에서 동시에 출발하여 수직선 위를 움직이는 두 점 $P$, $Q$ 의 시각 $t$ $(t\\ge0)$ 에서의 속도가 각각 $v_P(t)=${pp(P(3, -2 * mm, 0), 't')}$, $v_Q(t)=${pp(P(2 * nn, 0), 't')}$ 이다. 출발한 후 두 점이 다시 만날 때까지 두 점 사이의 거리의 최댓값을 구하세요.`,
              answer: ans(mx),
              steps: [
                `$x_P(t)=${pp(P(1, -mm, 0, 0), 't')}$, $x_Q(t)=${pp(P(nn, 0, 0), 't')}$`,
                `$x_P-x_Q=t^{3}-${S}t^{2}=t^{2}(t-${S})$ → 다시 만나는 시각 $t=${S}$`,
                `$0<t<${S}$ 에서 거리 $d(t)=${S}t^{2}-t^{3}$, $d'(t)=${2 * S}t-3t^{2}=0$ → $t=${(2 * S) / 3}$`,
                `최댓값 $d(${(2 * S) / 3})=${S}\\times${((2 * S) / 3) ** 2}-${((2 * S) / 3) ** 3}=${mx}$`,
              ],
            };
          },
        },
      ],
    },
  },
  {
    'top-sqrt-limit-param': '$\\infty-\\infty$ 꼴이 수렴하려면 최고차항이 먼저 상쇄되어야 해요',
    'top-ivt-min-roots': '연속함수의 값의 부호가 바뀌는 구간마다 사잇값 정리로 근이 적어도 하나',
    'top-xf-integral-eq': '정적분이 포함된 등식은 양변을 미분해 $f$ 의 식을 얻고, 적분 구간의 끝을 대입해 상수를 정해요',
    'top-equal-areas': '넓이 조건을 정적분의 식으로 바꾸어 미정계수에 대한 방정식으로 풀기',
    'top-motion-return': '위치는 속도의 정적분, 움직인 거리는 속력의 정적분 — 방향이 바뀌는 시각에서 나누기',
  },
);
