// 공통수학2 (hc2-1 ~ hc2-7)
import type { ContentMap, ProblemDraft } from '../../core/types';
import { F } from '../../core/frac';
import { gcd, divisors, isPrime, factorial, nPr, range } from '../../core/nt';
import { poly, sqrtTex, termsTex } from '../../core/tex';
import { Plane } from '../../core/fig';
import { L, cv, figOut, josa, texJosa, circleTex, lineTex, pt, setTex, sqTerm, tch, wch, xm, yEq } from './util';

const TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [4, 3, 5],
  [6, 8, 10],
  [8, 6, 10],
  [5, 12, 13],
  [12, 5, 13],
];

/** ax+by+c=0 정규화 (공약수 나누고 x 계수 양수) */
function normLine(a: number, b: number, c: number): [number, number, number] {
  const g = gcd(gcd(a, b), c) || 1;
  let s = 1;
  if (a < 0 || (a === 0 && b < 0)) s = -1;
  return [(s * a) / g, (s * b) / g, (s * c) / g];
}
const lt = (a: number, b: number, c: number) => lineTex(...normLine(a, b, c));

function genCircle(gen: boolean, a: number, b: number, r2: number): string {
  if (!gen) return circleTex(a, b, r2);
  return `${termsTex([
    { c: 1, v: 'x^{2}' },
    { c: 1, v: 'y^{2}' },
    { c: -2 * a, v: 'x' },
    { c: -2 * b, v: 'y' },
    { c: a * a + b * b - r2, v: '' },
  ])}=0`;
}

function pointsFig(pts: [number, number, string][]): string {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const m = Math.max(4, ...xs.map(Math.abs), ...ys.map(Math.abs)) + 1;
  const pl = new Plane(-m, m, -m, m, { w: 240, h: 240, step: m > 8 ? 2 : 1 });
  for (const [x, y, l] of pts) pl.point(x, y, l);
  return figOut(pl);
}

export const hc2: ContentMap = {
  // ───────────────────────── hc2-1 평면좌표와 직선의 방정식
  'hc2-1': {
    concepts: [
      {
        title: '두 점 사이의 거리',
        body: '두 점 $A(x_1, y_1)$, $B(x_2, y_2)$ 사이의 거리는 피타고라스 정리로 구합니다.\n$$\\overline{AB}=\\sqrt{(x_2-x_1)^{2}+(y_2-y_1)^{2}}$$\n- 원점과 점 $(x, y)$ 사이 거리는 $\\sqrt{x^{2}+y^{2}}$',
        example: { q: '$A(1, 2)$, $B(4, 6)$ 사이의 거리는?', a: '$\\sqrt{3^{2}+4^{2}}=5$' },
      },
      {
        title: '선분의 내분점과 무게중심',
        body: '선분 $AB$ 를 $m:n\\,(m>0, n>0)$ 으로 내분하는 점은\n$$P\\left(\\frac{mx_2+nx_1}{m+n}, \\frac{my_2+ny_1}{m+n}\\right)$$\n- 중점은 $m=n$ 인 경우: $\\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)$\n- 삼각형의 무게중심: 세 꼭짓점 좌표의 평균 $\\left(\\frac{x_1+x_2+x_3}{3}, \\frac{y_1+y_2+y_3}{3}\\right)$',
      },
      {
        title: '직선의 방정식',
        body: '- 기울기 $m$, 점 $(x_1, y_1)$ 을 지나는 직선: $y-y_1=m(x-x_1)$\n- 두 점을 지나는 직선: 기울기 $m=\\frac{y_2-y_1}{x_2-x_1}$ 을 먼저 구함\n- 일반형: $ax+by+c=0$ (중학교의 일차함수 $y=ax+b$ 를 확장)',
      },
      {
        title: '두 직선의 평행과 수직',
        body: '두 직선 $y=mx+n$, $y=m\'x+n\'$ 에 대하여\n- 평행: $m=m\'$, $n\\ne n\'$\n- 수직: $mm\'=-1$\n일반형 $ax+by+c=0$, $a\'x+b\'y+c\'=0$ 에서는 평행 $\\frac{a}{a\'}=\\frac{b}{b\'}\\ne\\frac{c}{c\'}$, 수직 $aa\'+bb\'=0$',
      },
      {
        title: '점과 직선 사이의 거리',
        body: '점 $(x_1, y_1)$ 과 직선 $ax+by+c=0$ 사이의 거리\n$$d=\\frac{|ax_1+by_1+c|}{\\sqrt{a^{2}+b^{2}}}$$',
        example: { q: '원점과 직선 $3x+4y-10=0$ 사이의 거리는?', a: '$\\frac{|-10|}{5}=2$' },
      },
    ],
    skills: [
      {
        id: 'distance',
        title: '두 점 사이의 거리',
        gen(r, level): ProblemDraft {
          if (level === 1) {
            const [dx, dy, d] = r.pick(TRIPLES);
            const x1 = r.int(-5, 5),
              y1 = r.int(-5, 5);
            const x2 = x1 + r.sign() * dx,
              y2 = y1 + r.sign() * dy;
            return {
              q: `두 점 $A${pt(x1, y1)}$, $B${pt(x2, y2)}$ 사이의 거리를 구하세요.`,
              fig: pointsFig([[x1, y1, 'A'], [x2, y2, 'B']]),
              answer: { type: 'num', value: d },
              steps: [`$\\overline{AB}=\\sqrt{(${x2}-${paren(x1)})^{2}+(${y2}-${paren(y1)})^{2}}=\\sqrt{${dx * dx}+${dy * dy}}$`, `$=\\sqrt{${d * d}}=${d}$`],
            };
          }
          if (level === 2) {
            let dx = r.int(1, 7),
              dy = r.int(1, 7);
            while (Number.isInteger(Math.sqrt(dx * dx + dy * dy))) dy = r.int(1, 7);
            const x1 = r.int(-6, 6),
              y1 = r.int(-6, 6);
            const x2 = x1 + r.sign() * dx,
              y2 = y1 + r.sign() * dy;
            const d2 = dx * dx + dy * dy;
            return {
              q: `두 점 $A${pt(x1, y1)}$, $B${pt(x2, y2)}$ 사이의 거리는?`,
              answer: tch(r, sqrtTex(d2), [sqrtTex(d2 + 2), sqrtTex(Math.abs(d2 - 2) || 3), String(dx + dy), sqrtTex(dx * dx + dy * dy + 2 * dx * dy), sqrtTex((x1 + x2) ** 2 + (y1 + y2) ** 2 || 7)]),
              steps: [`$x$ 좌표의 차 ${dx}, $y$ 좌표의 차 ${dy}`, `$\\overline{AB}=\\sqrt{${dx}^{2}+${dy}^{2}}=${sqrtTex(d2) === `\\sqrt{${d2}}` ? sqrtTex(d2) : `\\sqrt{${d2}}=${sqrtTex(d2)}`}$`],
            };
          }
          // L3: x축 위의 점 P 가 A, B 에서 같은 거리 — 답 a 가 정수가 되도록 P 를 먼저 정함
          let x1 = 0,
            x2 = 0,
            y1 = 1,
            y2 = 1;
          for (let tries = 0; tries < 200; tries++) {
            const a0 = r.int(-4, 4);
            x1 = r.int(-5, 5);
            y1 = r.nonzero(-5, 5);
            const D = (a0 - x1) ** 2 + y1 * y1;
            const cands: [number, number][] = [];
            for (let xx = -6; xx <= 6; xx++)
              for (let yy = -6; yy <= 6; yy++) if (yy !== 0 && xx !== x1 && (a0 - xx) ** 2 + yy * yy === D) cands.push([xx, yy]);
            if (cands.length) {
              [x2, y2] = r.pick(cands);
              break;
            }
          }
          const lhs = 2 * (x2 - x1);
          const rhs = x2 * x2 + y2 * y2 - x1 * x1 - y1 * y1;
          const a = new F(rhs, lhs);
          return {
            q: `두 점 $A${pt(x1, y1)}$, $B${pt(x2, y2)}$ 에서 같은 거리에 있는 $x$ 축 위의 점 $P(a, 0)$ 에 대하여 $a$ 의 값을 구하세요.`,
            answer: { type: 'num', value: a.value, display: 'frac' },
            steps: [
              `$\\overline{PA}^{2}=\\overline{PB}^{2}$ 이므로 $${sqTerm('a', x1)}+${y1 * y1}=${sqTerm('a', x2)}+${y2 * y2}$`,
              `$a^{2}$ 이 소거되어 $${lhs}a=${rhs}$`,
              `$a=${a.tex()}$`,
            ],
            hint: '거리의 제곱끼리 같다고 놓으세요.',
          };
        },
      },
      {
        id: 'internal-point',
        title: '내분점과 무게중심',
        gen(r, level) {
          if (level === 3) {
            const A = [r.int(-6, 6), r.int(-6, 6)],
              B = [r.int(-6, 6), r.int(-6, 6)],
              C = [r.int(-6, 6), r.int(-6, 6)];
            const G = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
            if (!Number.isInteger(G[0])) C[0] += 3 - ((((A[0] + B[0] + C[0]) % 3) + 3) % 3);
            if (!Number.isInteger(G[1])) C[1] += 3 - ((((A[1] + B[1] + C[1]) % 3) + 3) % 3);
            const g = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
            return {
              q: `삼각형 $ABC$ 에서 $A${pt(A[0], A[1])}$, $B${pt(B[0], B[1])}$ 이고 무게중심이 $G${pt(g[0], g[1])}$ 일 때, 꼭짓점 $C$ 의 좌표를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'x 좌표', value: C[0] }, { label: 'y 좌표', value: C[1] }] },
              steps: [
                `$C(a, b)$ 라 하면 $\\frac{${A[0]}+${paren(B[0])}+a}{3}=${g[0]}$, $\\frac{${A[1]}+${paren(B[1])}+b}{3}=${g[1]}$`,
                `$a=${3 * g[0]}-(${A[0] + B[0]})=${C[0]}$, $b=${3 * g[1]}-(${A[1] + B[1]})=${C[1]}$`,
              ],
            };
          }
          const [m, n] = level === 1 ? r.pick([[1, 1], [1, 2], [2, 1]] as const) : r.pick([[1, 3], [3, 1], [2, 3], [3, 2], [1, 4], [3, 4]] as const);
          let dx = r.int(-3, 3),
            dy = r.int(-3, 3);
          if (dx === 0 && dy === 0) dx = 2;
          const A = [r.int(-5, 5), r.int(-5, 5)];
          const B = [A[0] + (m + n) * dx, A[1] + (m + n) * dy];
          const P = [A[0] + m * dx, A[1] + m * dy];
          const what = m === n ? '의 중점' : `를 ${m}:${n}${n === 3 ? '으로' : '로'} 내분하는 점`;
          return {
            q: `두 점 $A${pt(A[0], A[1])}$, $B${pt(B[0], B[1])}$ 에 대하여 선분 $AB$ ${what} $P$ 의 좌표를 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'x 좌표', value: P[0] }, { label: 'y 좌표', value: P[1] }] },
            steps: [
              `$x=\\frac{${m}\\times ${paren(B[0])}+${n}\\times ${paren(A[0])}}{${m + n}}=${P[0]}$`,
              `$y=\\frac{${m}\\times ${paren(B[1])}+${n}\\times ${paren(A[1])}}{${m + n}}=${P[1]}$`,
            ],
            hint: m === n ? '좌표의 평균을 구하세요.' : '$\\frac{mx_2+nx_1}{m+n}$',
          };
        },
      },
      {
        id: 'line-equation',
        title: '직선의 방정식 구하기',
        gen(r, level) {
          if (level < 3) {
            const m = r.nonzero(-4, 4);
            const a = r.int(-4, 4),
              b = r.int(-6, 6);
            const n = b - m * a;
            let q: string;
            const steps: string[] = [];
            if (level === 1) {
              q = `기울기가 $${m}$ 이고 점 $${pt(a, b)}$ 를 지나는 직선의 방정식은?`;
            } else {
              const dx = r.int(1, 3);
              const a2 = a + dx,
                b2 = b + m * dx;
              q = `두 점 $${pt(a, b)}$, $${pt(a2, b2)}$ 를 지나는 직선의 방정식은?`;
              steps.push(`기울기 $=\\frac{${b2}-${paren(b)}}{${a2}-${paren(a)}}=${dx === 1 ? '' : `\\frac{${b2 - b}}{${dx}}=`}${m}$`);
            }
            steps.push(`$y-${paren(b)}=${m}(x-${paren(a)})$`, `$${yEq(m, n)}$`);
            return {
              q,
              answer: tch(r, yEq(m, n), [yEq(m, b + m * a), yEq(m, b), yEq(-m, b + m * a), yEq(m, a - m * b), yEq(-m, n), yEq(m, n + m), yEq(m, n - m), yEq(m, -n || n + 2)]),
              steps,
            };
          }
          let u = r.nonzero(-3, 3),
            v = r.nonzero(-3, 3);
          if (gcd(u, v) !== 1) v = v > 0 ? 1 : -1;
          const A = [r.int(-5, 5), r.int(-5, 5)];
          const B = [A[0] + 2 * u, A[1] + 2 * v];
          const M = [A[0] + u, A[1] + v];
          const right = lt(u, v, -(u * M[0] + v * M[1]));
          return {
            q: `두 점 $A${pt(A[0], A[1])}$, $B${pt(B[0], B[1])}$ 를 이은 선분의 수직이등분선의 방정식은?`,
            answer: tch(r, right, [
              lt(v, -u, -(v * M[0] - u * M[1])),
              lt(u, v, -(u * A[0] + v * A[1])),
              lt(u, v, u * M[0] + v * M[1]),
              lt(u, -v, -(u * M[0] - v * M[1])),
            ]),
            steps: [
              `중점 $M${pt(M[0], M[1])}$, 직선 $AB$ 의 기울기 $${new F(v, u).tex()}$`,
              `수직이등분선의 기울기는 $${new F(-u, v).tex()}$ 이고 $M$ 을 지납니다.`,
              `$y-${paren(M[1])}=${new F(-u, v).tex()}(x-${paren(M[0])})$ 정리하면 $${right}$`,
            ],
            hint: '중점을 지나고 $AB$ 에 수직인 직선입니다.',
          };
        },
      },
      {
        id: 'parallel-perp',
        title: '두 직선의 평행과 수직',
        gen(r, level) {
          if (level === 3) {
            const p = r.nonzero(-4, 4),
              q = r.nonzero(-4, 4),
              c = r.int(-6, 6);
            const x0 = r.int(-5, 5),
              y0 = r.int(-5, 5);
            const slope = new F(q, p);
            const yint = new F(y0).sub(slope.mul(x0));
            return {
              q: `점 $${pt(x0, y0)}$ 을 지나고 직선 $${lineTex(p, q, c)}$ 에 수직인 직선의 $y$ 절편을 구하세요.`,
              answer: { type: 'num', value: yint.value, display: 'frac' },
              steps: [
                `주어진 직선의 기울기는 $${new F(-p, q).tex()}$ 이므로 수직인 직선의 기울기는 $${slope.tex()}$`,
                `$y-${paren(y0)}=${slope.tex()}(x-${paren(x0)})$ 에 $x=0$ 대입`,
                `$y$ 절편 $=${yint.tex()}$`,
              ],
            };
          }
          const perp = r.chance(0.5);
          const p = r.nonzero(-3, 3);
          const q = r.nonzero(-3, 3);
          let b: number, a: number;
          const t = r.nonzero(-3, 3);
          if (perp) {
            b = p * t;
            a = -t * q;
          } else {
            b = q * t;
            a = t * p;
          }
          const c2 = r.int(-6, 6);
          let c1 = r.int(-6, 6);
          if (!perp && c1 === t * c2) c1 += 1;
          const big = level === 2 ? 2 : 1;
          const A = a * big,
            B = b * big;
          const C1 = c1 * big;
          return {
            q: `두 직선 $ax${B < 0 ? '-' : '+'}${Math.abs(B) === 1 ? '' : Math.abs(B)}y${C1 === 0 ? '' : (C1 < 0 ? '-' : '+') + Math.abs(C1)}=0$, $${lineTex(p, q, c2)}$ 가 서로 **${perp ? '수직' : '평행'}**일 때, 상수 $a$ 의 값을 구하세요.`,
            answer: { type: 'num', value: A },
            steps: perp
              ? [`수직 조건: $a\\times ${paren(p)}+${paren(B)}\\times ${paren(q)}=0$`, `$${cv(p, 'a')}=${-B * q}$ 이므로 $a=${A}$`]
              : [`평행 조건: $\\frac{a}{${p}}=\\frac{${B}}{${q}}$`, `$a=${A}$ (이때 두 직선은 일치하지 않음)`],
          };
        },
      },
      {
        id: 'point-line-distance',
        title: '점과 직선 사이의 거리',
        gen(r, level) {
          const [a0, b0, N] = r.pick(TRIPLES);
          const a = a0 * r.sign(),
            b = b0 * r.sign();
          if (level === 1) {
            const x0 = r.int(-4, 4),
              y0 = r.int(-4, 4);
            let c = r.int(-15, 15);
            if (a * x0 + b * y0 + c === 0) c += 3;
            const v = Math.abs(a * x0 + b * y0 + c);
            return {
              q: `점 $${pt(x0, y0)}$ 과 직선 $${lineTex(a, b, c)}$ 사이의 거리를 구하세요.`,
              answer: { type: 'num', value: v / N, display: 'frac' },
              steps: [`$d=\\frac{|${a}\\times ${paren(x0)}+${paren(b)}\\times ${paren(y0)}+${paren(c)}|}{\\sqrt{${a * a}+${b * b}}}$`, `$=${new F(v, N).d === N ? new F(v, N).tex() : `\\frac{${v}}{${N}}=${new F(v, N).tex()}`}$`],
            };
          }
          if (level === 2) {
            const c1 = r.int(-12, 12);
            let c2 = r.int(-12, 12);
            if (c1 === c2) c2 += 5;
            const k = r.pick([1, 2]);
            return {
              q: `평행한 두 직선 $${lineTex(a, b, c1)}$, $${lineTex(k * a, k * b, k * c2)}$ 사이의 거리를 구하세요.`,
              answer: { type: 'num', value: Math.abs(c1 - c2) / N, display: 'frac' },
              steps: [
                ...(k === 2 ? [`두 번째 식을 2로 나누면 $${lineTex(a, b, c2)}$`] : []),
                `첫 번째 직선 위의 한 점에서 두 번째 직선까지의 거리와 같으므로 $d=\\frac{|${c1}-${paren(c2)}|}{\\sqrt{${a * a}+${b * b}}}$`,
                `$=${new F(Math.abs(c1 - c2), N).tex()}$`,
              ],
            };
          }
          const x0 = r.int(-4, 4),
            y0 = r.int(-4, 4),
            d = r.int(1, 4);
          const s = a * x0 + b * y0;
          return {
            q: `점 $${pt(x0, y0)}$ 과 직선 $${termsTex([{ c: a, v: 'x' }, { c: b, v: 'y' }])}+k=0$ 사이의 거리가 $${d}$ 일 때, 상수 $k$ 의 값을 모두 구하세요.`,
            answer: { type: 'set', values: [-s + d * N, -s - d * N] },
            steps: [`$\\frac{|${s}+k|}{${N}}=${d}$`, `$${s}+k=\\pm ${d * N}$`, `$k=${-s + d * N}$ 또는 $k=${-s - d * N}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── hc2-2 원의 방정식
  'hc2-2': {
    concepts: [
      {
        title: '원의 방정식 (표준형)',
        body: '중심이 $(a, b)$, 반지름이 $r$ 인 원은 중심까지의 거리가 $r$ 인 점들의 모임이므로\n$$(x-a)^{2}+(y-b)^{2}=r^{2}$$\n- 중심이 원점이면 $x^{2}+y^{2}=r^{2}$',
      },
      {
        title: '원의 방정식 (일반형)',
        body: '$x^{2}+y^{2}+Ax+By+C=0$ 은 완전제곱식으로 고치면\n$$\\left(x+\\frac{A}{2}\\right)^{2}+\\left(y+\\frac{B}{2}\\right)^{2}=\\frac{A^{2}+B^{2}-4C}{4}$$\n- $A^{2}+B^{2}-4C>0$ 일 때 원을 나타냅니다.',
        example: { q: '$x^{2}+y^{2}-4x+6y+9=0$ 의 중심과 반지름은?', a: '$(x-2)^{2}+(y+3)^{2}=4$ → 중심 $(2,-3)$, 반지름 $2$' },
      },
      {
        title: '원과 직선의 위치 관계',
        body: '원의 중심과 직선 사이 거리 $d$, 반지름 $r$ 을 비교합니다 (판별식 $D$ 와 같은 결과).\n- $d<r$ ($D>0$): 서로 다른 두 점에서 만남\n- $d=r$ ($D=0$): 접함\n- $d>r$ ($D<0$): 만나지 않음',
      },
      {
        title: '원의 접선',
        body: '- 원 $x^{2}+y^{2}=r^{2}$ 위의 점 $(x_1, y_1)$ 에서의 접선: $x_1x+y_1y=r^{2}$\n- 원 $x^{2}+y^{2}=r^{2}$ 에 접하고 기울기가 $m$ 인 접선: $y=mx\\pm r\\sqrt{m^{2}+1}$\n- 현의 길이: 중심에서 현까지 거리 $d$ 이면 $2\\sqrt{r^{2}-d^{2}}$',
      },
    ],
    skills: [
      {
        id: 'center-radius',
        title: '중심과 반지름 구하기',
        gen(r, level) {
          const a = r.int(-5, 5),
            b = r.int(-5, 5),
            rad = r.int(1, 6);
          if (level === 3) {
            const k = a * a + b * b - rad * rad;
            return {
              q: `방정식 $${termsTex([{ c: 1, v: 'x^{2}' }, { c: 1, v: 'y^{2}' }, { c: -2 * a, v: 'x' }, { c: -2 * b, v: 'y' }])}+k=0$ 이 나타내는 도형이 반지름의 길이가 $${rad}$ 인 원일 때, 상수 $k$ 의 값을 구하세요.`,
              answer: { type: 'num', value: k },
              steps: [`$${sqTerm('x', a)}+${sqTerm('y', b)}=${a * a + b * b}-k$`, `$${a * a + b * b}-k=${rad * rad}$ 이므로 $k=${k}$`],
            };
          }
          const eq = genCircle(level === 2, a, b, rad * rad);
          return {
            q: `원 $${eq}$ 의 중심의 좌표와 반지름의 길이를 구하세요.`,
            answer: {
              type: 'fields',
              fields: [
                { label: '중심 x', value: a },
                { label: '중심 y', value: b },
                { label: '반지름', value: rad },
              ],
            },
            steps: [
              ...(level === 2 ? [`완전제곱식으로 고치면 $${circleTex(a, b, rad * rad)}$`] : []),
              `중심 $${pt(a, b)}$, 반지름 $\\sqrt{${rad * rad}}=${rad}$`,
            ],
            hint: level === 2 ? '$x$ 끼리, $y$ 끼리 묶어 완전제곱식을 만드세요.' : undefined,
          };
        },
      },
      {
        id: 'circle-equation',
        title: '조건에 맞는 원의 방정식',
        gen(r, level) {
          let a = r.int(-4, 4),
            b = r.int(-4, 4),
            r2: number;
          let q: string;
          const steps: string[] = [];
          if (level === 1) {
            const rad = r.int(2, 6);
            r2 = rad * rad;
            q = `중심이 $${pt(a, b)}$ 이고 반지름의 길이가 $${rad}$ 인 원의 방정식은?`;
          } else if (level === 2) {
            const px = a + r.nonzero(-4, 4),
              py = b + r.int(-4, 4);
            r2 = (px - a) ** 2 + (py - b) ** 2;
            q = `중심이 $${pt(a, b)}$ 이고 점 $${pt(px, py)}$ 를 지나는 원의 방정식은?`;
            steps.push(`반지름의 제곱 $=(${px}-${paren(a)})^{2}+(${py}-${paren(b)})^{2}=${r2}$`);
          } else if (r.chance(0.5)) {
            const ux = r.int(-4, 4),
              uy = r.int(-4, 4);
            const A = [a - ux, b - uy],
              B = [a + ux, b + uy];
            if (ux === 0 && uy === 0) {
              A[0] -= 2;
              B[0] += 2;
            }
            r2 = (B[0] - a) ** 2 + (B[1] - b) ** 2;
            q = `두 점 $A${pt(A[0], A[1])}$, $B${pt(B[0], B[1])}$ 를 지름의 양 끝으로 하는 원의 방정식은?`;
            steps.push(`중심은 $AB$ 의 중점 $${pt(a, b)}$`, `반지름의 제곱 $=${r2}$`);
          } else {
            if (a === 0) a = 3;
            if (b === 0) b = -2;
            const axis = r.pick(['x', 'y']);
            r2 = axis === 'x' ? b * b : a * a;
            q = `중심이 $${pt(a, b)}$ 이고 $${axis}$ 축에 접하는 원의 방정식은?`;
            steps.push(`$${axis}$ 축에 접하므로 반지름은 중심의 $${axis === 'x' ? 'y' : 'x'}$ 좌표의 절댓값 $${Math.sqrt(r2)}$`);
          }
          const right = circleTex(a, b, r2);
          steps.push(`$${right}$`);
          return {
            q,
            answer: tch(r, right, [circleTex(-a, -b, r2), circleTex(b, a, r2), circleTex(a, b, r2 + 1), circleTex(a, -b, r2), circleTex(-a, b, r2), Number.isInteger(Math.sqrt(r2)) && r2 > 1 ? circleTex(a, b, Math.sqrt(r2)) : circleTex(a, b, r2 * 2)]),
            steps,
          };
        },
      },
      {
        id: 'circle-line-position',
        title: '원과 직선의 위치 관계',
        gen(r, level) {
          const [A0, B0, N] = r.pick(TRIPLES);
          const A = A0 * r.sign(),
            B = B0 * r.sign();
          const a = level === 1 ? 0 : r.int(-3, 3),
            b = level === 1 ? 0 : r.int(-3, 3);
          const rad = r.int(2, 4);
          const circ = circleTex(a, b, rad * rad);
          const s = A * a + B * b;
          if (level === 3) {
            return {
              q: `직선 $${termsTex([{ c: A, v: 'x' }, { c: B, v: 'y' }])}+k=0$ 이 원 $${circ}$ 에 접할 때, 상수 $k$ 의 값을 모두 구하세요.`,
              answer: { type: 'set', values: [-s + rad * N, -s - rad * N] },
              steps: [`중심 $${pt(a, b)}$ 과 직선 사이 거리 = 반지름: $\\frac{|${s}+k|}{${N}}=${rad}$`, `$${s}+k=\\pm${rad * N}$`, `$k=${-s + rad * N}$ 또는 $k=${-s - rad * N}$`],
            };
          }
          const rel = r.int(0, 2); // 0 만남 1 접함 2 만나지 않음
          const D = rel === 0 ? (rad > 1 ? r.int(1, rad - 1) : 0) : rel === 1 ? rad : rad + r.int(1, 2);
          const sg = r.sign();
          const c = sg * D * N - s;
          const names = ['서로 다른 두 점에서 만난다', '한 점에서 만난다 (접한다)', '만나지 않는다'];
          const sym = ['<', '=', '>'][rel];
          return {
            q: `원 $${circ}$ 와 직선 $${lineTex(A, B, c)}$ 의 위치 관계로 옳은 것은?`,
            answer: wch(r, names[rel], names.filter((_, i) => i !== rel), 3),
            steps: [
              `중심 $${pt(a, b)}$ 과 직선 사이의 거리 $d=\\frac{|${s}+${paren(c)}|}{${N}}=${D}$`,
              `반지름 $${rad}$ 과 비교: $d${sym}r$`,
              `따라서 ${names[rel]}.`,
            ],
          };
        },
      },
      {
        id: 'tangent-line',
        title: '원의 접선',
        gen(r, level) {
          if (level === 3) {
            const m = r.nonzero(-3, 3),
              rad = r.int(1, 4);
            const right = `y=${poly([m, 0])}\\pm ${sqrtTex(m * m + 1, rad)}`;
            return {
              q: `원 $x^{2}+y^{2}=${rad * rad}$ 에 접하고 기울기가 $${m}$ 인 직선의 방정식은?`,
              answer: tch(r, right, [
                `y=${poly([m, 0])}\\pm ${sqrtTex(m * m + 1, rad * rad)}`,
                `y=${poly([m, 0])}\\pm ${sqrtTex(m * m + 1)}`,
                `y=${poly([m, 0])}\\pm ${rad * (m * m + 1)}`,
                `y=${poly([m, 0])}\\pm ${sqrtTex(m * m + rad * rad)}`,
                `y=${poly([-m, 0])}\\pm ${sqrtTex(m * m + 1, rad)}`,
              ]),
              steps: [`접선을 $y=${poly([m, 0])}+n$ 이라 하면 원점과의 거리가 $${rad}$`, `$\\frac{|n|}{\\sqrt{${m * m}+1}}=${rad}$, $n=\\pm ${sqrtTex(m * m + 1, rad)}$`],
            };
          }
          const pts: [number, number, number][] = [
            [3, 4, 25],
            [4, 3, 25],
            [1, 3, 10],
            [3, 1, 10],
            [2, 3, 13],
            [3, 2, 13],
            [1, 2, 5],
            [2, 1, 5],
            [1, 7, 50],
            [5, 5, 50],
            [1, 1, 2],
          ];
          const [x0, y0, r2] = r.pick(pts);
          const x1 = x0 * r.sign(),
            y1 = y0 * r.sign();
          const eq = (p: number, q: number, k: number) => `${termsTex([{ c: p, v: 'x' }, { c: q, v: 'y' }])}=${k}`;
          if (level === 1) {
            const rt = Math.sqrt(r2);
            return {
              q: `원 $x^{2}+y^{2}=${r2}$ 위의 점 $${pt(x1, y1)}$ 에서의 접선의 방정식은?`,
              answer: tch(r, eq(x1, y1, r2), [eq(x1, -y1, r2), eq(y1, x1, r2), eq(-x1, -y1, r2), Number.isInteger(rt) ? eq(x1, y1, rt) : eq(x1, y1, 2 * r2), eq(y1, -x1, r2)]),
              steps: [`원 $x^{2}+y^{2}=r^{2}$ 위의 점 $(x_1, y_1)$ 에서의 접선은 $x_1x+y_1y=r^{2}$`, `$${eq(x1, y1, r2)}$`],
            };
          }
          const yi = new F(r2, y1);
          return {
            q: `원 $x^{2}+y^{2}=${r2}$ 위의 점 $${pt(x1, y1)}$ 에서의 접선의 $y$ 절편을 구하세요.`,
            answer: { type: 'num', value: yi.value, display: 'frac' },
            steps: [`접선: $${eq(x1, y1, r2)}$`, `$x=0$ 을 대입하면 $${y1}y=${r2}$, $y=${yi.tex()}$`],
          };
        },
      },
      {
        id: 'chord-length',
        title: '현의 길이',
        gen(r, level) {
          const [A0, B0, N] = r.pick(TRIPLES);
          const A = A0 * r.sign(),
            B = B0 * r.sign();
          const [rad, d] = r.pick([
            [5, 3],
            [5, 4],
            [13, 5],
            [13, 12],
            [10, 6],
            [10, 8],
            [17, 8],
            [17, 15],
          ] as const);
          const a = level === 1 ? 0 : r.int(-4, 4),
            b = level === 1 ? 0 : r.int(-4, 4);
          const c = r.sign() * d * N - (A * a + B * b);
          const half = Math.sqrt(rad * rad - d * d);
          const circ = level === 3 ? genCircle(true, a, b, rad * rad) : a === 0 && b === 0 ? `x^{2}+y^{2}=${rad * rad}` : circleTex(a, b, rad * rad);
          return {
            q: `원 $${circ}$ 와 직선 $${lineTex(A, B, c)}$ 가 만나서 생기는 현의 길이를 구하세요.`,
            answer: { type: 'num', value: 2 * half },
            steps: [
              ...(level === 3 ? [`$${circleTex(a, b, rad * rad)}$: 중심 $${pt(a, b)}$, 반지름 $${rad}$`] : []),
              `중심과 직선 사이의 거리 $d=\\frac{|${A * a + B * b}+${paren(c)}|}{${N}}=${d}$`,
              `현의 길이 $=2\\sqrt{${rad}^{2}-${d}^{2}}=2\\times ${half}=${2 * half}$`,
            ],
            hint: '중심에서 현에 내린 수선은 현을 이등분합니다.',
          };
        },
      },
    ],
  },

  // ───────────────────────── hc2-3 도형의 이동
  'hc2-3': {
    concepts: [
      {
        title: '점의 평행이동',
        body: '점 $(x, y)$ 를 $x$ 축 방향으로 $m$, $y$ 축 방향으로 $n$ 만큼 평행이동하면\n$$(x, y)\\to(x+m, y+n)$$',
      },
      {
        title: '도형의 평행이동',
        body: '방정식 $f(x, y)=0$ 이 나타내는 도형을 $x$ 축 방향으로 $m$, $y$ 축 방향으로 $n$ 만큼 평행이동하면\n$$f(x-m, y-n)=0$$\n- 점은 **더하고**, 도형의 방정식에서는 $x, y$ 대신 **빼서** 대입합니다.',
        example: { q: '$y=x^{2}$ 을 $x$ 축 방향 2, $y$ 축 방향 3 평행이동하면?', a: '$y-3=(x-2)^{2}$' },
      },
      {
        title: '대칭이동',
        body: '- $x$ 축 대칭: $(x, y)\\to(x, -y)$, 도형은 $f(x, -y)=0$\n- $y$ 축 대칭: $(x, y)\\to(-x, y)$, 도형은 $f(-x, y)=0$\n- 원점 대칭: $(x, y)\\to(-x, -y)$, 도형은 $f(-x, -y)=0$\n- 직선 $y=x$ 대칭: $(x, y)\\to(y, x)$, 도형은 $f(y, x)=0$',
      },
      {
        title: '대칭이동의 활용 (최단 거리)',
        body: '직선 위의 점 $P$ 에 대하여 $\\overline{AP}+\\overline{PB}$ 의 최솟값은 $A$ 를 그 직선에 대칭이동한 점 $A\'$ 에 대하여 $\\overline{A\'B}$ 입니다.',
      },
    ],
    skills: [
      {
        id: 'point-translate',
        title: '점의 평행이동',
        gen(r, level) {
          const x = r.int(-6, 6),
            y = r.int(-6, 6),
            m = r.nonzero(-5, 5),
            n = r.nonzero(-5, 5);
          if (level === 1) {
            return {
              q: `점 $${pt(x, y)}$ 를 $x$ 축의 방향으로 $${m}$ 만큼, $y$ 축의 방향으로 $${n}$ 만큼 평행이동한 점의 좌표를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'x 좌표', value: x + m }, { label: 'y 좌표', value: y + n }] },
              steps: [`$(${x}+${paren(m)}, ${y}+${paren(n)})=${pt(x + m, y + n)}$`],
            };
          }
          if (level === 2) {
            const px = r.int(-5, 5),
              py = r.int(-5, 5);
            return {
              q: `평행이동 $(x, y)\\to(x+a, y+b)$ 에 의하여 점 $${pt(px, py)}$ 가 점 $${pt(px + m, py + n)}$ 로 옮겨질 때, 이 평행이동에 의하여 점 $${pt(x, y)}$ 가 옮겨지는 점의 좌표를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'x 좌표', value: x + m }, { label: 'y 좌표', value: y + n }] },
              steps: [`$a=${px + m}-${paren(px)}=${m}$, $b=${py + n}-${paren(py)}=${n}$`, `$${pt(x, y)}\\to${pt(x + m, y + n)}$`],
            };
          }
          return {
            q: `점 $${pt(x, y)}$ 를 $x$ 축의 방향으로 $${m}$ 만큼, $y$ 축의 방향으로 $${n}$ 만큼 평행이동한 후, 직선 $y=x$ 에 대하여 대칭이동한 점의 좌표를 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'x 좌표', value: y + n }, { label: 'y 좌표', value: x + m }] },
            steps: [`평행이동: $${pt(x + m, y + n)}$`, `$y=x$ 대칭: $x, y$ 를 바꾸어 $${pt(y + n, x + m)}$`],
          };
        },
      },
      {
        id: 'point-reflect',
        title: '점의 대칭이동',
        gen(r, level) {
          const x = r.nonzero(-6, 6),
            y = r.nonzero(-6, 6);
          const T: [string, (p: [number, number]) => [number, number]][] = [
            ['$x$ 축', ([a, b]) => [a, -b]],
            ['$y$ 축', ([a, b]) => [-a, b]],
            ['원점', ([a, b]) => [-a, -b]],
            ['직선 $y=x$', ([a, b]) => [b, a]],
            ['직선 $y=-x$', ([a, b]) => [-b, -a]],
          ];
          if (level === 3) {
            const P: [number, number] = [x, y];
            let Q = T[3][1](P);
            if (x === y) Q = [y, x + 1];
            const R = T[2][1](P);
            const area = new F(Math.abs((Q[0] - P[0]) * (R[1] - P[1]) - (Q[1] - P[1]) * (R[0] - P[0])), 2);
            const qx = x === y ? `직선 $y=x$ 에 대하여 대칭이동한 점을 $x$ 축 방향으로 $0$, $y$ 축 방향으로 $1$ 만큼 평행이동한 점` : '직선 $y=x$ 에 대하여 대칭이동한 점';
            return {
              q: `점 $P${pt(x, y)}$ 를 ${qx}을 $Q$, 원점에 대하여 대칭이동한 점을 $R$ 이라 할 때, 삼각형 $PQR$ 의 넓이를 구하세요.`,
              answer: { type: 'num', value: area.value, display: 'frac' },
              steps: [`$Q${pt(Q[0], Q[1])}$, $R${pt(R[0], R[1])}$`, `신발끈 공식(또는 밑변·높이)으로 넓이 $=\\frac{1}{2}|${(Q[0] - P[0])}\\times${paren(R[1] - P[1])}-${paren(Q[1] - P[1])}\\times${paren(R[0] - P[0])}|=${area.tex()}$`],
            };
          }
          if (level === 1) {
            const [name, f] = T[r.int(0, 3)];
            const [a, b] = f([x, y]);
            return {
              q: `점 $${pt(x, y)}$ 를 ${name}에 대하여 대칭이동한 점의 좌표를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'x 좌표', value: a }, { label: 'y 좌표', value: b }] },
              steps: [`${name} 대칭이동 → $${pt(a, b)}$`],
            };
          }
          const [i, j] = r.sample([0, 1, 2, 3, 4], 2);
          const p1 = T[i][1]([x, y]);
          const p2 = T[j][1](p1);
          return {
            q: `점 $${pt(x, y)}$ 를 ${T[i][0]}에 대하여 대칭이동한 후, 다시 ${T[j][0]}에 대하여 대칭이동한 점의 좌표를 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'x 좌표', value: p2[0] }, { label: 'y 좌표', value: p2[1] }] },
            steps: [`${T[i][0]} 대칭: $${pt(p1[0], p1[1])}$`, `${T[j][0]} 대칭: $${pt(p2[0], p2[1])}$`],
          };
        },
      },
      {
        id: 'figure-translate',
        title: '도형의 평행이동',
        gen(r, level) {
          const p = r.nonzero(-4, 4),
            q = r.nonzero(-4, 4);
          if (level === 1) {
            const m = r.nonzero(-3, 3),
              n = r.int(-5, 5);
            const nn = -m * p + n + q;
            return {
              q: `직선 $${yEq(m, n)}$ 을 $x$ 축의 방향으로 $${p}$ 만큼, $y$ 축의 방향으로 $${q}$ 만큼 평행이동한 직선의 방정식은?`,
              answer: tch(r, yEq(m, nn), [yEq(m, m * p + n + q), yEq(m, -m * p + n - q), yEq(m, m * p + n - q), yEq(m, n + q), yEq(-m, nn)]),
              steps: [`$x$ 대신 $${xm('x', p)}$, $y$ 대신 $${xm('y', q)}$ 대입: $${xm('y', q)}=${m}(${xm('x', p)})+${paren(n)}$`, `$${yEq(m, nn)}$`],
            };
          }
          if (level === 2) {
            const b = r.int(-4, 4),
              c = r.int(-4, 4);
            // y - q = (x-p)^2 + b(x-p) + c
            const nb = -2 * p + b,
              nc = p * p - b * p + c + q;
            const wrong = (pp: number, qq: number) => `y=${poly([1, -2 * pp + b, pp * pp - b * pp + c + qq])}`;
            return {
              q: `포물선 $y=${poly([1, b, c])}$ 을 $x$ 축의 방향으로 $${p}$ 만큼, $y$ 축의 방향으로 $${q}$ 만큼 평행이동한 포물선의 방정식은?`,
              answer: tch(r, `y=${poly([1, nb, nc])}`, [wrong(-p, q), wrong(p, -q), wrong(-p, -q), `y=${poly([1, b, c + q])}`]),
              steps: [`$${xm('y', q)}=(${xm('x', p)})^{2}${b === 0 ? '' : `${b > 0 ? '+' : '-'}${Math.abs(b) === 1 ? '' : Math.abs(b)}(${xm('x', p)})`}${c === 0 ? '' : (c > 0 ? '+' : '') + c}$`, `전개하면 $y=${poly([1, nb, nc])}$`],
            };
          }
          const a = r.nonzero(-4, 4),
            b = r.nonzero(-3, 3);
          const x0 = r.int(-4, 4),
            y0 = r.int(-4, 4);
          const k = -a * (x0 - p) - b * (y0 - q);
          return {
            q: `직선 $${termsTex([{ c: a, v: 'x' }, { c: b, v: 'y' }])}+k=0$ 을 $x$ 축의 방향으로 $${p}$ 만큼, $y$ 축의 방향으로 $${q}$ 만큼 평행이동한 직선이 점 $${pt(x0, y0)}$ 를 지날 때, 상수 $k$ 의 값을 구하세요.`,
            answer: { type: 'num', value: k },
            steps: [`이동한 직선: $${a}(${xm('x', p)})+${paren(b)}(${xm('y', q)})+k=0$`, `$${pt(x0, y0)}$ 대입: $${a * (x0 - p)}+${paren(b * (y0 - q))}+k=0$`, `$k=${k}$`],
          };
        },
      },
      {
        id: 'figure-reflect',
        title: '도형의 대칭이동과 최단 거리',
        gen(r, level) {
          if (level === 1) {
            const a = r.nonzero(-4, 4),
              b = r.nonzero(-4, 4),
              c = r.nonzero(-6, 6);
            const opts: [string, [number, number, number]][] = [
              ['$x$ 축', [a, -b, c]],
              ['$y$ 축', [-a, b, c]],
              ['원점', [-a, -b, c]],
              ['직선 $y=x$', [b, a, c]],
            ];
            const i = r.int(0, 3);
            const [name, L0] = opts[i];
            const right = lt(...L0);
            return {
              q: `직선 $${lineTex(a, b, c)}$ 을 ${name}에 대하여 대칭이동한 직선의 방정식은?`,
              answer: tch(r, right, [...opts.filter((_, j) => j !== i).map(([, l]) => lt(...l)), lt(a, b, -c)]),
              steps: [`${name} 대칭이동: ${['$y$ 대신 $-y$', '$x$ 대신 $-x$', '$x$ 대신 $-x$, $y$ 대신 $-y$', '$x$ 와 $y$ 를 서로 바꿈'][i]}`, `$${right}$`],
            };
          }
          if (level === 2) {
            const a = r.nonzero(-5, 5),
              b = r.nonzero(-5, 5),
              rr = r.int(1, 5);
            const T: [string, [number, number]][] = [
              ['$x$ 축', [a, -b]],
              ['$y$ 축', [-a, b]],
              ['원점', [-a, -b]],
              ['직선 $y=x$', [b, a]],
            ];
            const [name, c] = r.pick(T);
            return {
              q: `원 $${circleTex(a, b, rr * rr)}$ 을 ${name}에 대하여 대칭이동한 원의 중심의 좌표를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'x 좌표', value: c[0] }, { label: 'y 좌표', value: c[1] }] },
              steps: [`원의 대칭이동은 중심만 대칭이동하면 됩니다 (반지름은 그대로).`, `중심 $${pt(a, b)}\\to${pt(c[0], c[1])}$`],
            };
          }
          const [dx, sy, d] = r.pick([...TRIPLES, [8, 15, 17], [15, 8, 17]] as [number, number, number][]);
          const y1 = r.int(1, sy - 1),
            y2 = sy - y1;
          const x1 = r.int(-3, 2),
            x2 = x1 + dx;
          const onX = r.chance(0.5);
          const A: [number, number] = onX ? [x1, y1] : [y1, x1];
          const B: [number, number] = onX ? [x2, y2] : [y2, x2];
          const Ap: [number, number] = onX ? [A[0], -A[1]] : [-A[0], A[1]];
          return {
            q: `두 점 $A${pt(A[0], A[1])}$, $B${pt(B[0], B[1])}$ 와 $${onX ? 'x' : 'y'}$ 축 위의 점 $P$ 에 대하여 $\\overline{AP}+\\overline{PB}$ 의 최솟값을 구하세요.`,
            answer: { type: 'num', value: d },
            steps: [
              `$A$ 를 $${onX ? 'x' : 'y'}$ 축에 대칭이동한 점 $A'${pt(Ap[0], Ap[1])}$ 에 대하여 $\\overline{AP}=\\overline{A'P}$`,
              `$\\overline{AP}+\\overline{PB}\\ge\\overline{A'B}=\\sqrt{${dx}^{2}+${sy}^{2}}=${d}$`,
            ],
            hint: '한 점을 축에 대하여 대칭이동해 보세요.',
          };
        },
      },
    ],
  },

  // ───────────────────────── hc2-4 집합
  'hc2-4': {
    concepts: [
      {
        title: '집합과 원소',
        body: '기준이 분명해 대상을 정할 수 있는 모임을 **집합**, 그 대상을 **원소**라 합니다.\n- $a$ 가 집합 $A$ 의 원소: $a\\in A$, 아니면 $a\\notin A$\n- 원소나열법 $\\{1, 2, 3\\}$, 조건제시법 $\\{x\\mid x\\text{는 }3\\text{ 이하의 자연수}\\}$\n- 유한집합 $A$ 의 원소의 개수: $n(A)$, 공집합 $\\varnothing$ 은 $n(\\varnothing)=0$',
      },
      {
        title: '부분집합',
        body: '$A$ 의 모든 원소가 $B$ 의 원소이면 $A\\subset B$.\n- 모든 집합은 자기 자신과 $\\varnothing$ 을 부분집합으로 가짐\n- $n(A)=n$ 이면 부분집합의 개수 $2^{n}$, 진부분집합의 개수 $2^{n}-1$\n- 특정한 원소 $k$ 개를 반드시 포함(또는 제외)하는 부분집합: $2^{n-k}$',
        example: { q: '$\\{1, 2, 3, 4\\}$ 의 부분집합 중 1을 포함하는 것의 개수는?', a: '$2^{3}=8$' },
      },
      {
        title: '집합의 연산',
        body: '- 합집합 $A\\cup B$, 교집합 $A\\cap B$\n- 차집합 $A-B=A\\cap B^{C}$, 여집합 $A^{C}=U-A$\n- 드모르간 법칙: $(A\\cup B)^{C}=A^{C}\\cap B^{C}$, $(A\\cap B)^{C}=A^{C}\\cup B^{C}$',
      },
      {
        title: '유한집합의 원소의 개수',
        body: '$$n(A\\cup B)=n(A)+n(B)-n(A\\cap B)$$\n- $n(A-B)=n(A)-n(A\\cap B)$\n- $n(A^{C})=n(U)-n(A)$',
      },
    ],
    skills: [
      {
        id: 'subset-count',
        title: '부분집합의 개수',
        gen(r, level) {
          if (level === 1) {
            const n = r.int(2, 6);
            const els = r.sample(range(1, 12), n).sort((a, b) => a - b);
            const proper = r.chance(0.4);
            const v = 2 ** n - (proper ? 1 : 0);
            return {
              q: `집합 $A=${setTex(els)}$ 의 ${proper ? '진부분집합' : '부분집합'}의 개수를 구하세요.`,
              answer: { type: 'num', value: v, unit: '개' },
              steps: [`$n(A)=${n}$`, `${proper ? '진부분집합' : '부분집합'}의 개수 $=2^{${n}}${proper ? '-1' : ''}=${v}$`],
            };
          }
          if (level === 2) {
            const N = r.pick([12, 18, 20, 24, 28, 30, 36, 16, 8]);
            const ds = divisors(N);
            const n = ds.length;
            const inc = r.pick(ds.slice(1));
            return {
              q: `집합 $A=\\{x\\mid x\\text{는 }${N}\\text{의 약수}\\}$ 의 부분집합 중 $${inc}$ ${texJosa(String(inc), '을', '를')} 반드시 원소로 갖는 것의 개수를 구하세요.`,
              answer: { type: 'num', value: 2 ** (n - 1), unit: '개' },
              steps: [`$A=${setTex(ds)}$, $n(A)=${n}$`, `$${inc}$ ${texJosa(String(inc), '을', '를')} 뺀 나머지 ${n - 1}개로 만든 부분집합에 $${inc}$ ${texJosa(String(inc), '을', '를')} 넣으면 되므로 $2^{${n - 1}}=${2 ** (n - 1)}$`],
            };
          }
          const nb = r.int(5, 8);
          const B = r.sample(range(1, 10), nb).sort((a, b) => a - b);
          const na = r.int(1, 3);
          const A = r.sample(B, na).sort((a, b) => a - b);
          const ex = r.chance(0.5) ? r.pick(B.filter((x) => !A.includes(x))) : null;
          const free = nb - na - (ex !== null ? 1 : 0);
          return {
            q: `두 집합 $A=${setTex(A)}$, $B=${setTex(B)}$ 에 대하여 $A\\subset X\\subset B$ 를 만족시키는 집합 $X$ ${ex !== null ? `중 $${ex}\\notin X$ 인 것` : ''}의 개수를 구하세요.`,
            answer: { type: 'num', value: 2 ** free, unit: '개' },
            steps: [
              `$X$ 는 $${setTex(A)}$ 의 원소를 반드시 포함${ex !== null ? `하고 $${ex}$ ${texJosa(String(ex), '은', '는')} 포함하지 않는` : '하는'} $B$ 의 부분집합`,
              `자유롭게 고를 수 있는 원소는 $${nb}-${na}${ex !== null ? '-1' : ''}=${free}$ 개 → $2^{${free}}=${2 ** free}$`,
            ],
          };
        },
      },
      {
        id: 'set-operations',
        title: '집합의 연산',
        gen(r, level) {
          const U = range(1, level === 1 ? 8 : 10);
          const A = r.sample(U, r.int(3, 5)).sort((a, b) => a - b);
          let B = r.sample(U, r.int(3, 5)).sort((a, b) => a - b);
          if (!B.some((x) => A.includes(x))) B = [...B.slice(1), A[0]].sort((a, b) => a - b);
          // A 와 B 가 같은 집합이면 연산이 무의미 → B 의 원소 하나를 A 밖의 원소로 교체
          if (B.length === A.length && B.every((x) => A.includes(x))) {
            const out = U.filter((x) => !A.includes(x));
            B = [...B.slice(0, -1), r.pick(out)].sort((a, b) => a - b);
          }
          const inA = (x: number) => A.includes(x),
            inB = (x: number) => B.includes(x);
          const ops: [string, (x: number) => boolean][] = [
            ['A\\cup B', (x) => inA(x) || inB(x)],
            ['A\\cap B', (x) => inA(x) && inB(x)],
            ['A-B', (x) => inA(x) && !inB(x)],
            ['B-A', (x) => inB(x) && !inA(x)],
            ['A^{C}', (x) => !inA(x)],
            ['(A\\cup B)^{C}', (x) => !inA(x) && !inB(x)],
            ['A\\cap B^{C}', (x) => inA(x) && !inB(x)],
            ['(A-B)\\cup(B-A)', (x) => inA(x) !== inB(x)],
            ['A^{C}\\cap B', (x) => !inA(x) && inB(x)],
          ];
          const pool = L(level, [0, 1], [2, 3, 4], [5, 6, 7, 8]);
          const k = r.pick(pool);
          const res = (i: number) => setTex(U.filter(ops[i][1]));
          const right = res(k);
          return {
            q: `전체집합 $U=${setTex(U)}$ 의 두 부분집합 $A=${setTex(A)}$, $B=${setTex(B)}$ 에 대하여 집합 $${ops[k][0]}$ 를 바르게 나타낸 것은?`,
            answer: tch(r, right, ops.map((_, i) => res(i)), 5, (i) => setTex(r.sample(U, 2 + (i % 4)))),
            steps: [`$${ops[k][0]}=${right}$`, `(벤 다이어그램으로 확인하면 편리합니다)`],
          };
        },
      },
      {
        id: 'count-union',
        title: '원소의 개수 구하기',
        gen(r, level) {
          const x = r.int(2, 12),
            a = x + r.int(3, 15),
            b = x + r.int(3, 15);
          if (level === 1) {
            return {
              q: `두 집합 $A$, $B$ 에 대하여 $n(A)=${a}$, $n(B)=${b}$, $n(A\\cap B)=${x}$ 일 때, $n(A\\cup B)$ 를 구하세요.`,
              answer: { type: 'num', value: a + b - x },
              steps: [`$n(A\\cup B)=n(A)+n(B)-n(A\\cap B)=${a}+${b}-${x}=${a + b - x}$`],
            };
          }
          if (level === 2) {
            const askDiff = r.chance(0.5);
            return {
              q: `두 집합 $A$, $B$ 에 대하여 $n(A)=${a}$, $n(B)=${b}$, $n(A\\cup B)=${a + b - x}$ 일 때, $${askDiff ? 'n(A-B)' : 'n(A\\cap B)'}$ 를 구하세요.`,
              answer: { type: 'num', value: askDiff ? a - x : x },
              steps: [`$n(A\\cap B)=n(A)+n(B)-n(A\\cup B)=${a}+${b}-${a + b - x}=${x}$`, ...(askDiff ? [`$n(A-B)=n(A)-n(A\\cap B)=${a}-${x}=${a - x}$`] : [])],
            };
          }
          const none = r.int(1, 8);
          const N = a + b - x + none;
          const [s1, s2] = r.sample(['수학', '영어', '과학', '음악', '미술', '체육'], 2);
          const who = r.pick(['반 학생', '동아리 회원', '캠프 참가자']);
          return {
            q: `${who} $${N}$ 명 중 ${s1}${josa(s1, '을', '를')} 좋아하는 사람은 $${a}$ 명, ${s2}${josa(s2, '을', '를')} 좋아하는 사람은 $${b}$ 명이고, 둘 다 좋아하지 않는 사람은 $${none}$ 명입니다. ${s1}${josa(s1, '과', '와')} ${s2}${josa(s2, '을', '를')} 모두 좋아하는 사람은 몇 명인가요?`,
            answer: { type: 'num', value: x, unit: '명' },
            steps: [`$n(A\\cup B)=${N}-${none}=${N - none}$`, `$n(A\\cap B)=${a}+${b}-${N - none}=${x}$`],
          };
        },
      },
      {
        id: 'set-builder',
        title: '조건제시법과 원소의 개수',
        gen(r, level) {
          if (level === 1) {
            const N = r.pick([12, 18, 20, 24, 30, 36, 40, 45, 48, 60]);
            const ds = divisors(N);
            return {
              q: `집합 $A=\\{x\\mid x\\text{는 }${N}\\text{의 약수}\\}$ 에 대하여 $n(A)$ 를 구하세요.`,
              answer: { type: 'num', value: ds.length },
              steps: [`$A=${setTex(ds)}$`, `$n(A)=${ds.length}$`],
            };
          }
          if (level === 2) {
            if (r.chance(0.5)) {
              const k = r.int(10, 40);
              const ps = range(2, k).filter(isPrime);
              return {
                q: `집합 $A=\\{x\\mid x\\text{는 }${k}\\text{ 이하의 소수}\\}$ 에 대하여 $n(A)$ 를 구하세요.`,
                answer: { type: 'num', value: ps.length },
                steps: [`$A=${setTex(ps)}$`, `$n(A)=${ps.length}$`],
              };
            }
            const k = r.int(5, 40);
            const els = range(-7, 7).filter((x) => x * x < k);
            return {
              q: `집합 $A=\\{x\\mid x^{2}<${k},\\ x\\text{는 정수}\\}$ 에 대하여 $n(A)$ 를 구하세요.`,
              answer: { type: 'num', value: els.length },
              steps: [`$x^{2}<${k}$ 인 정수: $${setTex(els)}$`, `$n(A)=${els.length}$`],
            };
          }
          const A = r.sample(range(-2, 5), 3).sort((a, b) => a - b);
          const mode = r.pick(['+', '*']);
          const S = new Set<number>();
          A.forEach((x) => A.forEach((y) => S.add(mode === '+' ? x + y : x * y)));
          const els = [...S].sort((a, b) => a - b);
          return {
            q: `집합 $A=${setTex(A)}$ 에 대하여 $B=\\{x${mode === '+' ? '+' : '\\times '}y\\mid x\\in A,\\ y\\in A\\}$ 일 때, $n(B)$ 를 구하세요.`,
            answer: { type: 'num', value: els.length },
            steps: [`$x, y$ 에 $A$ 의 원소를 (같은 수도 허용해) 넣어 계산하면`, `$B=${setTex(els)}$`, `$n(B)=${els.length}$`],
            hint: '같은 원소를 두 번 고르는 경우도 포함하고, 중복된 값은 한 번만 셉니다.',
          };
        },
      },
    ],
  },

  // ───────────────────────── hc2-5 명제
  'hc2-5': {
    concepts: [
      {
        title: '명제와 조건, 진리집합',
        body: '참·거짓을 판별할 수 있는 문장이나 식을 **명제**, 변수에 따라 참·거짓이 달라지는 것을 **조건**이라 합니다.\n- 조건 $p$ 를 참이 되게 하는 원소의 집합 $P$ 를 진리집합이라 함\n- 명제 $p\\to q$ 가 참 $\\iff P\\subset Q$\n- 부정: "모든"↔"어떤", "그리고"↔"또는", $>$ ↔ $\\le$',
      },
      {
        title: '역, 이, 대우',
        body: '명제 $p\\to q$ 에 대하여\n- 역: $q\\to p$, 이: $\\sim p\\to\\sim q$, 대우: $\\sim q\\to\\sim p$\n- 명제와 그 **대우**는 참·거짓이 항상 같습니다 (역은 같지 않을 수 있음).',
      },
      {
        title: '필요조건과 충분조건',
        body: '$p\\Rightarrow q$ 일 때 $p$ 는 $q$ 이기 위한 **충분조건**, $q$ 는 $p$ 이기 위한 **필요조건**.\n- $p\\Leftrightarrow q$ 이면 필요충분조건\n- 진리집합으로: $P\\subset Q$ 이면 $p$ 는 충분조건, $P=Q$ 이면 필요충분조건',
        example: { q: '$p: x=1$, $q: x^{2}=1$ 일 때 $p$ 는 $q$ 이기 위한?', a: '$P=\\{1\\}\\subset Q=\\{-1, 1\\}$ 이므로 충분조건' },
      },
      {
        title: '절대부등식',
        body: '모든 실수(또는 양수)에서 성립하는 부등식.\n- 산술평균과 기하평균: $a>0, b>0$ 일 때 $\\frac{a+b}{2}\\ge\\sqrt{ab}$ (등호는 $a=b$)\n- 활용: $x>0$ 이면 $x+\\frac{k}{x}\\ge2\\sqrt{k}$',
      },
    ],
    skills: [
      {
        id: 'necessary-sufficient',
        title: '필요조건·충분조건 판별',
        gen(r, level) {
          const NAMES4 = ['충분조건이지만 필요조건은 아니다', '필요조건이지만 충분조건은 아니다', '필요충분조건이다', '필요조건도 충분조건도 아니다'];
          let p: string, q: string, rel: number, why: string;
          const t = level === 1 ? r.pick([0, 1]) : level === 2 ? r.pick([2, 3, 4]) : r.pick([4, 5, 6]);
          if (t === 0) {
            const a = r.nonzero(-6, 6);
            const swap = r.chance(0.5);
            p = `x=${a}`;
            q = `x^{2}=${a * a}`;
            rel = 0;
            why = `$x=${a}$ 이면 $x^{2}=${a * a}$ 이지만, $x^{2}=${a * a}$ 이면 $x=${-a}$ 일 수도 있음`;
            if (swap) {
              [p, q] = [q, p];
              rel = 1;
            }
          } else if (t === 1) {
            const a = r.int(-5, 5);
            let b = r.int(-5, 5);
            if (a === b) b += 2;
            p = `x>${a}`;
            q = `x>${b}`;
            rel = a > b ? 0 : 1;
            why = `진리집합 $P=\\{x\\mid x>${a}\\}$, $Q=\\{x\\mid x>${b}\\}$ 에서 ${a > b ? '$P\\subset Q$' : '$Q\\subset P$'}`;
          } else if (t === 2 || t === 3) {
            const a = r.int(-5, 2);
            let b = a + r.int(2, 5);
            const kind = t === 2 ? r.int(0, 2) : r.int(0, 3);
            if (kind === 3 && (b - a) % 2) b += 1;
            let c: number, d: number;
            if (kind === 0) {
              c = a - r.int(1, 2);
              d = b + r.int(0, 2);
            } else if (kind === 1) {
              c = a + 1;
              d = b - r.int(0, 1);
            } else if (kind === 2) {
              c = a + 1;
              d = b + r.int(1, 2);
            } else {
              c = a;
              d = b;
            }
            if (t === 3 && kind === 3 && (b - a) % 2 === 0) {
              const m = (a + b) / 2,
                h = (b - a) / 2;
              p = `|x${m > 0 ? '-' : '+'}${Math.abs(m)}|\\le ${h}`.replace('|x+0|', '|x|').replace('|x-0|', '|x|');
            } else p = `${a}\\le x\\le ${b}`;
            q = `${c}\\le x\\le ${d}`;
            const PinQ = c <= a && b <= d,
              QinP = a <= c && d <= b;
            rel = PinQ && QinP ? 2 : PinQ ? 0 : QinP ? 1 : 3;
            why = `$P=\\{x\\mid ${a}\\le x\\le ${b}\\}$, $Q=\\{x\\mid ${c}\\le x\\le ${d}\\}$ 의 포함 관계를 수직선에서 비교`;
          } else if (t === 4) {
            const a = r.nonzero(-5, 5);
            let b = r.nonzero(-5, 5);
            if (a === b) b = -a;
            p = `${poly([1, -(a + b), a * b])}=0`;
            q = `x=${a}`;
            rel = 1;
            why = `$P=\\{${Math.min(a, b)}, ${Math.max(a, b)}\\}$, $Q=\\{${a}\\}$ 이므로 $Q\\subset P$`;
            if (r.chance(0.5)) {
              [p, q] = [q, p];
              rel = 0;
              why = `$P=\\{${a}\\}$, $Q=\\{${Math.min(a, b)}, ${Math.max(a, b)}\\}$ 이므로 $P\\subset Q$`;
            }
          } else if (t === 5) {
            const k = r.int(0, 3);
            const defs: [string, string, number, string][] = [
              ['xy=0', 'x=0', 1, '$x=0$ 이면 $xy=0$ 이지만 $xy=0$ 이어도 $y=0, x\\ne0$ 일 수 있음'],
              ['x^{2}+y^{2}=0', 'x=0\\text{ 이고 }y=0', 2, '실수에서 $x^{2}+y^{2}=0\\iff x=y=0$'],
              ['x>0\\text{ 이고 }y>0', 'xy>0', 0, '둘 다 양수면 곱이 양수, 그러나 둘 다 음수여도 $xy>0$'],
              ['x+y>0', 'x>0\\text{ 이고 }y>0', 1, '둘 다 양수면 합이 양수이지만, 역은 $x=3, y=-1$ 같은 반례'],
            ];
            [p, q, rel, why] = defs[k];
            const c = r.int(1, 3);
            if (k === 1 && c > 1) {
              p = `x^{2}+${c}y^{2}=0`;
            }
            if (k === 2 && c > 1) q = `${c}xy>0`;
            if (k === 0 && c > 1) {
              p = `${c}xy=0`;
            }
            if (k === 3 && c > 1) p = `${c}x+${c}y>0`;
          } else {
            const a = r.int(1, 6);
            p = `|x|<${a}`;
            q = `x^{2}<${a * a}`;
            rel = 2;
            why = `$|x|<${a}\\iff -${a}<x<${a}\\iff x^{2}<${a * a}$`;
            if (r.chance(0.5)) {
              q = `x<${a}`;
              rel = 0;
              why = `$P=\\{x\\mid -${a}<x<${a}\\}\\subset Q=\\{x\\mid x<${a}\\}$`;
            }
          }
          return {
            q: `두 조건 $p: ${p}$, $q: ${q}$ 에 대하여 $p$ 는 $q$ 이기 위한 어떤 조건인가요? (단, ${/y/.test(p + q) ? '$x, y$' : '$x$'} 는 실수)`,
            answer: wch(r, NAMES4[rel], NAMES4.filter((_, i) => i !== rel), 4),
            steps: [why, `따라서 $p$ 는 $q$ 이기 위한 ${NAMES4[rel]}.`],
            hint: '진리집합의 포함 관계를 따져 보세요.',
          };
        },
      },
      {
        id: 'converse-contrapositive',
        title: '역·이·대우',
        gen(r, level) {
          const a = r.int(-5, 5),
            b = a - r.int(1, 4);
          const pairs: [string, string, string, string][] = [
            [`x=${a}`, `x\\ne ${a}`, `x^{2}=${a * a}`, `x^{2}\\ne ${a * a}`],
            [`x>${a}`, `x\\le ${a}`, `x>${b}`, `x\\le ${b}`],
            // 참인 명제가 되도록 양수 기준값 사용 (x≥-4 이면 x²≥16 은 거짓)
            [`x\\ge ${Math.abs(a) || 2}`, `x<${Math.abs(a) || 2}`, `x^{2}\\ge ${(Math.abs(a) || 2) ** 2}`, `x^{2}<${(Math.abs(a) || 2) ** 2}`],
            [`x=${a}\\text{ 이고 }y=${b}`, `x\\ne ${a}\\text{ 또는 }y\\ne ${b}`, `x+y=${a + b}`, `x+y\\ne ${a + b}`],
            [`xy=0`, `xy\\ne 0`, `x=0\\text{ 또는 }y=0`, `x\\ne 0\\text{ 이고 }y\\ne 0`],
          ];
          const [p, np, q, nq] = r.pick(level === 1 ? pairs.slice(0, 3) : pairs);
          const st = (x: string, y: string) => `'$${x}$ 이면 $${y}$ 이다.'`;
          const forms = { 역: st(q, p), 이: st(np, nq), 대우: st(nq, np) };
          const wrongs = [st(q, p), st(np, nq), st(nq, np), st(p, nq), st(nq, p), st(q, np)];
          if (level === 3) {
            const right = forms['대우'];
            return {
              q: `명제 ${st(p, q)} 가 참일 때, 다음 중 반드시 참인 명제는?`,
              answer: wch(r, right, wrongs.filter((w) => w !== right)),
              steps: [`명제와 그 대우는 참·거짓이 일치합니다.`, `대우: ${right}`],
            };
          }
          const kind = r.pick(['역', '이', '대우'] as const);
          const right = forms[kind];
          return {
            q: `명제 ${st(p, q)} 의 **${kind}**${josa(kind, '은', '는')}?`,
            answer: wch(r, right, wrongs.filter((w) => w !== right)),
            steps: [`$p\\to q$ 의 ${kind}: ${kind === '역' ? '$q\\to p$' : kind === '이' ? '$\\sim p\\to\\sim q$' : '$\\sim q\\to\\sim p$'}`, right],
          };
        },
      },
      {
        id: 'truth-set-range',
        title: '진리집합과 상수의 범위',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(-6, 6);
            const up = r.chance(0.5);
            return {
              q: up ? `명제 '$x>${a}$ 이면 $x>k$ 이다.' 가 참이 되도록 하는 실수 $k$ 의 최댓값을 구하세요.` : `명제 '$x<${a}$ 이면 $x<k$ 이다.' 가 참이 되도록 하는 실수 $k$ 의 최솟값을 구하세요.`,
              answer: { type: 'num', value: a },
              steps: [up ? `$\\{x\\mid x>${a}\\}\\subset\\{x\\mid x>k\\}$ 이어야 하므로 $k\\le ${a}$` : `$\\{x\\mid x<${a}\\}\\subset\\{x\\mid x<k\\}$ 이어야 하므로 $k\\ge ${a}$`, `${up ? '최댓값' : '최솟값'}은 $${a}$`],
            };
          }
          if (level === 2) {
            const m = r.int(-4, 4),
              h = r.int(1, 5);
            const up = r.chance(0.5);
            const abs = `|${xm('x', m)}|\\le ${h}`;
            return {
              q: up ? `두 조건 $p: ${abs}$, $q: x\\ge k$ 에 대하여 $p$ 가 $q$ 이기 위한 충분조건이 되도록 하는 실수 $k$ 의 최댓값을 구하세요.` : `두 조건 $p: ${abs}$, $q: x\\le k$ 에 대하여 $p$ 가 $q$ 이기 위한 충분조건이 되도록 하는 실수 $k$ 의 최솟값을 구하세요.`,
              answer: { type: 'num', value: up ? m - h : m + h },
              steps: [`$p: ${m - h}\\le x\\le ${m + h}$`, `$P\\subset Q$ 이어야 하므로 ${up ? `$k\\le ${m - h}$` : `$k\\ge ${m + h}$`}`, `답: $${up ? m - h : m + h}$`],
            };
          }
          const a = r.int(-4, 3),
            b = a + r.int(1, 4);
          const c = r.int(Math.ceil((b - a) / 2), b - a + 2);
          const lo = b - c,
            hi = a + c;
          const cnt = hi - lo + 1;
          return {
            q: `두 조건 $p: ${poly([1, -(a + b), a * b])}\\le 0$, $q: ${xm('k', c)}\\le x\\le k+${c}$ 에 대하여 $p$ 가 $q$ 이기 위한 충분조건이 되도록 하는 정수 $k$ 의 개수를 구하세요.`,
            answer: { type: 'num', value: cnt, unit: '개' },
            steps: [`$p: ${a}\\le x\\le ${b}$`, `$P\\subset Q$: $k-${c}\\le ${a}$ 이고 $${b}\\le k+${c}$`, `$${lo}\\le k\\le ${hi}$ → 정수 $${cnt}$ 개`],
          };
        },
      },
      {
        id: 'negation',
        title: '명제와 조건의 부정',
        gen(r, level) {
          const a = r.int(-5, 5),
            b = r.int(-5, 5),
            c = r.int(1, 9);
          const tpl = L(level, r.pick([2, 3]), r.pick([0, 1]), r.pick([0, 1, 2, 3]));
          let src: string, right: string, wrongs: string[];
          if (tpl === 0) {
            const f = poly([1, a, c]);
            src = `모든 실수 $x$ 에 대하여 $${f}>0$ 이다.`;
            right = `어떤 실수 $x$ 에 대하여 $${f}\\le 0$ 이다.`;
            wrongs = [`모든 실수 $x$ 에 대하여 $${f}\\le 0$ 이다.`, `어떤 실수 $x$ 에 대하여 $${f}>0$ 이다.`, `어떤 실수 $x$ 에 대하여 $${f}<0$ 이다.`, `모든 실수 $x$ 에 대하여 $${f}<0$ 이다.`];
          } else if (tpl === 1) {
            src = `어떤 실수 $x$ 에 대하여 $x^{2}=${a + 6}$ 이다.`;
            right = `모든 실수 $x$ 에 대하여 $x^{2}\\ne ${a + 6}$ 이다.`;
            wrongs = [`어떤 실수 $x$ 에 대하여 $x^{2}\\ne ${a + 6}$ 이다.`, `모든 실수 $x$ 에 대하여 $x^{2}=${a + 6}$ 이다.`, `모든 실수 $x$ 에 대하여 $x^{2}>${a + 6}$ 이다.`, `어떤 실수 $x$ 에 대하여 $x^{2}<${a + 6}$ 이다.`];
          } else if (tpl === 2) {
            src = `조건 '$x>${a}$ 이고 $y\\le ${b}$'`;
            right = `$x\\le ${a}$ 또는 $y>${b}$`;
            wrongs = [`$x\\le ${a}$ 이고 $y>${b}$`, `$x<${a}$ 또는 $y>${b}$`, `$x\\le ${a}$ 또는 $y\\ge ${b}$`, `$x>${a}$ 또는 $y\\le ${b}$`];
          } else {
            const b2 = a === b ? b + 1 : b;
            src = `조건 '$x=${a}$ 또는 $x=${b2}$'`;
            right = `$x\\ne ${a}$ 이고 $x\\ne ${b2}$`;
            wrongs = [`$x\\ne ${a}$ 또는 $x\\ne ${b2}$`, `$x=${a}$ 이고 $x=${b2}$`, `$x\\ne ${a}$ 이고 $x=${b2}$`, `$x=${a}$ 또는 $x\\ne ${b2}$`];
          }
          return {
            q: `다음의 부정으로 옳은 것은?\n${src}`,
            answer: wch(r, right, wrongs),
            steps: [`'모든' ↔ '어떤', '이고' ↔ '또는', 등호·부등호는 반대로 바꿉니다.`, `부정: ${right}`],
          };
        },
      },
      {
        id: 'am-gm',
        title: '산술평균과 기하평균',
        gen(r, level) {
          const s = r.int(1, 3),
            u = r.int(1, 3),
            v = r.int(1, 4);
          const a = s * u * u,
            b = s * v * v;
          if (level === 1) {
            return {
              q: `$x>0$ 일 때, $${a === 1 ? '' : a}x+\\frac{${b}}{x}$ 의 최솟값을 구하세요.`,
              answer: { type: 'num', value: 2 * s * u * v },
              steps: [`산술평균·기하평균: $${a === 1 ? '' : a}x+\\frac{${b}}{x}\\ge 2\\sqrt{${a}x\\times\\frac{${b}}{x}}=2\\sqrt{${a * b}}$`, `$=${2 * s * u * v}$ (등호는 $x=${new F(v, u).tex()}$)`],
            };
          }
          if (level === 2) {
            return {
              q: `양수 $x, y$ 에 대하여 $\\left(x+\\frac{${a}}{y}\\right)\\left(y+\\frac{${b}}{x}\\right)$ 의 최솟값을 구하세요.`,
              answer: { type: 'num', value: a + b + 2 * s * u * v },
              steps: [`전개: $xy+${b}+${a}+\\frac{${a * b}}{xy}$`, `$xy+\\frac{${a * b}}{xy}\\ge 2\\sqrt{${a * b}}=${2 * s * u * v}$`, `최솟값 $=${a + b}+${2 * s * u * v}=${a + b + 2 * s * u * v}$`],
            };
          }
          if (r.chance(0.5)) {
            const c = r.int(1, 5),
              t = r.int(1, 5);
            return {
              q: `$x>${c}$ 일 때, $x+\\frac{${t * t}}{x-${c}}$ 의 최솟값을 구하세요.`,
              answer: { type: 'num', value: 2 * t + c },
              steps: [`$x+\\frac{${t * t}}{x-${c}}=(x-${c})+\\frac{${t * t}}{x-${c}}+${c}$`, `$x-${c}>0$ 이므로 $\\ge 2\\sqrt{${t * t}}+${c}=${2 * t + c}$`],
            };
          }
          const p = r.int(1, 4),
            q = r.int(1, 4),
            S = r.int(4, 12);
          const mx = new F(S * S, 4 * p * q);
          return {
            q: `양수 $x, y$ 에 대하여 $${p === 1 ? '' : p}x+${q === 1 ? '' : q}y=${S}$ 일 때, $xy$ 의 최댓값을 구하세요.`,
            answer: { type: 'num', value: mx.value, display: 'frac' },
            steps: [`$${S}=${p === 1 ? '' : p}x+${q === 1 ? '' : q}y\\ge 2\\sqrt{${p * q}xy}$`, `$${S * S}\\ge ${4 * p * q}xy$ 이므로 $xy\\le ${mx.tex()}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── hc2-6 함수
  'hc2-6': {
    concepts: [
      {
        title: '함수의 뜻',
        body: '$X$ 의 각 원소에 $Y$ 의 원소가 **오직 하나씩** 대응할 때 $f: X\\to Y$ 를 함수라 합니다.\n- 정의역 $X$, 공역 $Y$, 치역 $\\{f(x)\\mid x\\in X\\}\\subset Y$\n- 일대일함수: $x_1\\ne x_2\\Rightarrow f(x_1)\\ne f(x_2)$\n- 일대일대응: 일대일함수이고 치역 = 공역',
      },
      {
        title: '합성함수',
        body: '$(g\\circ f)(x)=g(f(x))$ — $f$ 를 먼저, $g$ 를 나중에.\n- 일반적으로 $g\\circ f\\ne f\\circ g$ (교환법칙 ×)\n- 결합법칙은 성립: $h\\circ(g\\circ f)=(h\\circ g)\\circ f$',
        example: { q: '$f(x)=2x+1$, $g(x)=x^{2}$ 일 때 $(g\\circ f)(1)$?', a: '$g(f(1))=g(3)=9$' },
      },
      {
        title: '역함수',
        body: '일대일대응 $f$ 에 대하여 $y=f(x)\\iff x=f^{-1}(y)$.\n- 구하는 법: $y=f(x)$ 를 $x$ 에 대해 풀고 $x, y$ 를 바꿈\n- $(f^{-1}\\circ f)(x)=x$, $(f^{-1})^{-1}=f$, $(g\\circ f)^{-1}=f^{-1}\\circ g^{-1}$\n- $y=f(x)$ 와 $y=f^{-1}(x)$ 의 그래프는 직선 $y=x$ 에 대하여 대칭',
      },
      {
        title: '함수의 개수',
        body: '$n(X)=n$, $n(Y)=m$ 일 때\n- 함수: $m^{n}$ 개, 일대일함수: ${}_{m}\\mathrm{P}_{n}$ 개 ($m\\ge n$)\n- 일대일대응: $n!$ 개 ($m=n$), 상수함수: $m$ 개',
      },
    ],
    skills: [
      {
        id: 'composite-value',
        title: '합성함수의 함숫값',
        gen(r, level) {
          const a = r.nonzero(-4, 4),
            b = r.int(-5, 5);
          const f = poly([a, b]);
          if (level === 3) {
            const p = r.nonzero(-3, 3),
              q = r.int(-4, 4),
              m = r.nonzero(-4, 4),
              n = r.int(-5, 5);
            const k = r.int(-4, 4);
            return {
              q: `두 함수 $f(x)$, $g(x)=${poly([p, q])}$ 에 대하여 $(f\\circ g)(x)=${poly([m * p, m * q + n])}$ 이고 $f(x)$ 가 일차함수일 때, $f(${k})$ 의 값을 구하세요.`,
              answer: { type: 'num', value: m * k + n },
              steps: [`$f(x)=cx+d$ 라 하면 $f(g(x))=c(${poly([p, q])})+d=${cv(p, 'cx')}${q === 0 ? '' : (q > 0 ? '+' : '') + cv(q, 'c')}+d$`, `계수 비교: $c=${m}$, $d=${m * q + n}-${paren(q * m)}=${n}$`, `$f(${k})=${m}\\times${paren(k)}+${paren(n)}=${m * k + n}$`],
            };
          }
          const k = r.int(-3, 3);
          let g: (x: number) => number, gt: string;
          if (level === 1) {
            const c = r.nonzero(-3, 3),
              d = r.int(-5, 5);
            g = (x) => c * x + d;
            gt = poly([c, d]);
          } else {
            const p = r.int(-3, 3),
              q = r.int(-4, 4);
            g = (x) => x * x + p * x + q;
            gt = poly([1, p, q]);
          }
          const fv = (x: number) => a * x + b;
          const gof = r.chance(0.5);
          const inner = gof ? fv(k) : g(k);
          const val = gof ? g(inner) : fv(inner);
          return {
            q: `두 함수 $f(x)=${f}$, $g(x)=${gt}$ 에 대하여 $(${gof ? 'g\\circ f' : 'f\\circ g'})(${k})$ 의 값을 구하세요.`,
            answer: { type: 'num', value: val, ...(level === 2 ? {} : {}) },
            steps: [`$(${gof ? 'g\\circ f' : 'f\\circ g'})(${k})=${gof ? 'g(f' : 'f(g'}(${k}))$`, `$${gof ? 'f' : 'g'}(${k})=${inner}$`, `$${gof ? 'g' : 'f'}(${inner})=${val}$`],
          };
        },
      },
      {
        id: 'inverse-value',
        title: '역함수의 함숫값',
        gen(r, level) {
          const a = r.nonzero(-4, 4),
            b = r.int(-6, 6);
          const f = poly([a, b]);
          if (level === 1) {
            const t = r.int(-5, 5);
            const k = a * t + b;
            return {
              q: `함수 $f(x)=${f}$ 에 대하여 $f^{-1}(${k})$ 의 값을 구하세요.`,
              answer: { type: 'num', value: t },
              steps: [`$f^{-1}(${k})=t$ 라 하면 $f(t)=${k}$`, `$${poly([a, b], 't')}=${k}$, $t=${t}$`],
            };
          }
          const c = r.nonzero(-3, 3);
          const t = r.int(-4, 4);
          if (level === 2) {
            const k = r.int(-4, 4);
            const d = a * t + b - c * k;
            return {
              q: `두 함수 $f(x)=${f}$, $g(x)=${poly([c, d])}$ 에 대하여 $(f^{-1}\\circ g)(${k})$ 의 값을 구하세요.`,
              answer: { type: 'num', value: t },
              steps: [`$g(${k})=${a * t + b}$`, `$f^{-1}(${a * t + b})=s$ 라 하면 $f(s)=${a * t + b}$, $s=${t}$`],
            };
          }
          const k = r.int(-3, 3);
          const fk = a * k + b;
          const d = fk - c * t;
          return {
            q: `두 함수 $f(x)=${f}$, $g(x)=${poly([c, d])}$ 에 대하여 $(f\\circ(g\\circ f)^{-1}\\circ f)(${k})$ 의 값을 구하세요.`,
            answer: { type: 'num', value: t },
            steps: [`$(g\\circ f)^{-1}=f^{-1}\\circ g^{-1}$ 이므로 $f\\circ f^{-1}\\circ g^{-1}\\circ f=g^{-1}\\circ f$`, `$f(${k})=${fk}$`, `$g^{-1}(${fk})=s$ 이면 $${poly([c, d], 's')}=${fk}$, $s=${t}$`],
            hint: '$(g\\circ f)^{-1}=f^{-1}\\circ g^{-1}$',
          };
        },
      },
      {
        id: 'inverse-formula',
        title: '역함수 구하기',
        gen(r, level) {
          if (level < 3) {
            const a = level === 1 ? r.pick([2, 3, 4, -2, 1]) : r.pick([-3, -4, 5, 6, -5, 3]);
            let b = r.int(-8, 8);
            if (b === 0) b = 3;
            const inv = (p: number | F, q: number | F) => poly([p, q]);
            const right = inv(new F(1, a), new F(-b, a));
            return {
              q: `함수 $f(x)=${poly([a, b])}$ 의 역함수는?`,
              answer: tch(r, `f^{-1}(x)=${right}`, [
                `f^{-1}(x)=${inv(new F(1, a), new F(b, a))}`,
                `f^{-1}(x)=${inv(a, -b)}`,
                `f^{-1}(x)=${inv(new F(1, a), -b)}`,
                `f^{-1}(x)=${inv(new F(-1, a), new F(b, a))}`,
                `f^{-1}(x)=${inv(new F(-1, a), new F(-b, a))}`,
              ]),
              steps: [`$y=${poly([a, b])}$ 을 $x$ 에 대하여 풀면 $x=${poly([new F(1, a), new F(-b, a)], 'y')}$`, `$x, y$ 를 바꾸면 $y=${right}$`],
            };
          }
          const p = r.nonzero(-3, 3);
          let q = r.nonzero(-4, 4);
          if (q === p) q = -q;
          const fx = p === 0 ? `x^{2}${q === 0 ? '' : (q > 0 ? '+' : '') + q}` : `${sqTerm('x', p)}${q === 0 ? '' : (q > 0 ? '+' : '') + q}`;
          const rt = (s: number, t: number) => `\\sqrt{${xm('x', s)}}${t === 0 ? '' : (t > 0 ? '+' : '') + t}`;
          const dom = (s: number) => `\\;(x\\ge ${s})`;
          return {
            q: `함수 $f(x)=${fx}\\;(x\\ge ${p})$ 의 역함수는?`,
            answer: tch(r, `f^{-1}(x)=${rt(q, p)}${dom(q)}`, [`f^{-1}(x)=${rt(p, q)}${dom(p)}`, `f^{-1}(x)=${rt(-q, p)}${dom(-q)}`, `f^{-1}(x)=${rt(q, -p)}${dom(q)}`, `f^{-1}(x)=${rt(q, p)}${dom(p)}`]),
            steps: [`$y=${fx.replace(/x/g, 'x')}$ 에서 $${sqTerm('x', p)}=${xm('y', q)}$, $x\\ge ${p}$ 이므로 $x=${rt(q, p).replace(/x/g, 'y')}$`, `$x, y$ 를 바꾸면 $y=${rt(q, p)}$, 정의역은 $f$ 의 치역 $x\\ge ${q}$`],
          };
        },
      },
      {
        id: 'one-to-one',
        title: '일대일대응이 되는 조건',
        gen(r, level) {
          const neg = level === 3;
          const a = neg ? -r.int(1, 4) : r.int(1, 4);
          const b = r.int(-5, 5);
          const m = r.int(-3, 1),
            n = m + r.int(2, 4);
          const fm = a * m + b,
            fn = a * n + b;
          const [p, q] = neg ? [fn, fm] : [fm, fn];
          const askProd = level !== 1;
          return {
            q: `두 집합 $X=\\{x\\mid ${m}\\le x\\le ${n}\\}$, $Y=\\{y\\mid ${p}\\le y\\le ${q}\\}$ 에 대하여 $X$ 에서 $Y$ 로의 함수 $f(x)=ax+b$ 가 일대일대응이고 $a${neg ? '<' : '>'}0$ 일 때, $${askProd ? 'ab' : 'a+b'}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: askProd ? a * b : a + b },
            steps: [
              `$a${neg ? '<' : '>'}0$ 이므로 $f(${m})=${neg ? q : p}$, $f(${n})=${neg ? p : q}$`,
              `$${cv(m, 'a')}+b=${fm}$, $${cv(n, 'a')}+b=${fn}$ 를 풀면 $a=${a}$, $b=${b}$`,
              `$${askProd ? 'ab' : 'a+b'}=${askProd ? a * b : a + b}$`,
            ],
          };
        },
      },
      {
        id: 'function-count',
        title: '함수의 개수',
        gen(r, level) {
          if (level === 1) {
            const n = r.int(2, 4),
              m = r.int(2, 4);
            return {
              q: `$X=${setTex(range(1, n))}$, $Y=${setTex(range(1, m).map((x) => x * 10))}$ 일 때, $X$ 에서 $Y$ 로의 함수의 개수를 구하세요.`,
              answer: { type: 'num', value: m ** n, unit: '개' },
              steps: [`$X$ 의 각 원소마다 $Y$ 의 원소 $${m}$ 개 중 하나를 고르므로 $${m}^{${n}}=${m ** n}$`],
            };
          }
          if (level === 2) {
            const n = r.int(2, 4),
              m = n + r.int(0, 2);
            const one = m === n && r.chance(0.5);
            const v = one ? factorial(n) : nPr(m, n);
            return {
              q: `$X=${setTex(range(1, n))}$, $Y=${setTex(range(1, m).map((x) => x * 10))}$ 일 때, $X$ 에서 $Y$ 로의 ${one ? '일대일대응' : '일대일함수'}의 개수를 구하세요.`,
              answer: { type: 'num', value: v, unit: '개' },
              steps: [one ? `서로 다른 값을 모두 쓰도록 배정: $${n}!=${v}$` : `서로 다른 값을 차례로 배정: $${range(m - n + 1, m).reverse().join('\\times')}=${v}$`],
            };
          }
          const n = r.int(3, 5);
          const t = r.int(0, 2);
          const X = setTex(range(1, n));
          if (t === 0) {
            const v = factorial(n - 1);
            return {
              q: `집합 $X=${X}$ 에서 $X$ 로의 일대일대응 $f$ 중 $f(1)=1$ 인 것의 개수를 구하세요.`,
              answer: { type: 'num', value: v, unit: '개' },
              steps: [`$f(1)=1$ 로 고정, 나머지 $${n - 1}$ 개 원소의 일대일대응: $${n - 1}!=${v}$`],
            };
          }
          if (t === 1) {
            const v = factorial(n) - factorial(n - 1);
            return {
              q: `집합 $X=${X}$ 에서 $X$ 로의 일대일대응 $f$ 중 $f(1)\\ne 1$ 인 것의 개수를 구하세요.`,
              answer: { type: 'num', value: v, unit: '개' },
              steps: [`전체 $${n}!=${factorial(n)}$ 에서 $f(1)=1$ 인 $${n - 1}!=${factorial(n - 1)}$ 개를 빼면 $${v}$`],
            };
          }
          const v = n ** n - factorial(n);
          return {
            q: `집합 $X=${X}$ 에서 $X$ 로의 함수 중 일대일대응이 **아닌** 것의 개수를 구하세요.`,
            answer: { type: 'num', value: v, unit: '개' },
            steps: [`함수 $${n}^{${n}}=${n ** n}$, 일대일대응 $${n}!=${factorial(n)}$`, `$${n ** n}-${factorial(n)}=${v}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── hc2-7 유리함수와 무리함수
  'hc2-7': {
    concepts: [
      {
        title: '유리함수 $y=\\frac{k}{x-p}+q$',
        body: '$y=\\frac{k}{x}$ (반비례, 중1) 의 그래프를 $x$ 축 방향 $p$, $y$ 축 방향 $q$ 만큼 평행이동한 것.\n- 점근선: $x=p$, $y=q$\n- 정의역 $\\{x\\mid x\\ne p\\}$, 치역 $\\{y\\mid y\\ne q\\}$\n- 점 $(p, q)$ 에 대하여 대칭',
      },
      {
        title: '$y=\\frac{ax+b}{cx+d}$ 꼴',
        body: '분자를 분모로 나누어 $y=\\frac{k}{x-p}+q$ 꼴로 고칩니다.\n- 점근선: $x=-\\frac{d}{c}$, $y=\\frac{a}{c}$',
        example: { q: '$y=\\frac{2x+1}{x-1}$ 의 점근선은?', a: '$y=\\frac{3}{x-1}+2$ → $x=1$, $y=2$' },
      },
      {
        title: '무리함수 $y=\\sqrt{a(x-p)}+q$',
        body: '$y=\\sqrt{ax}$ 를 평행이동한 그래프. 근호 안이 $0$ 이상이어야 합니다.\n- $a>0$: 정의역 $x\\ge p$, $a<0$: 정의역 $x\\le p$\n- $y=\\sqrt{\\;}+q$ 이면 치역 $y\\ge q$, $y=-\\sqrt{\\;}+q$ 이면 $y\\le q$',
      },
      {
        title: '무리함수와 역함수',
        body: '$y=\\sqrt{x-p}+q$ 의 역함수는 $y=(x-q)^{2}+p\\;(x\\ge q)$ 입니다.\n- 그래프는 직선 $y=x$ 에 대하여 대칭',
      },
    ],
    skills: [
      {
        id: 'asymptote',
        title: '유리함수의 점근선',
        gen(r, level) {
          const p = r.int(-5, 5),
            q = r.int(-5, 5),
            k = r.nonzero(-6, 6);
          if (level === 3) {
            const x0 = p + r.nonzero(-3, 3);
            const y0 = r.int(-6, 6);
            const b = y0 * (x0 - p) - q * x0;
            return {
              q: `함수 $y=\\frac{ax+b}{x+c}$ 의 그래프의 점근선이 $x=${p}$, $y=${q}$ 이고 그래프가 점 $${pt(x0, y0)}$ 를 지날 때, $a+b+c$ 의 값을 구하세요.`,
              answer: { type: 'num', value: q + b - p },
              steps: [`점근선에서 $c=${-p}$, $a=${q}$`, `$${y0}=\\frac{${q}\\times${paren(x0)}+b}{${x0}${-p >= 0 ? '+' : ''}${-p}}$ 에서 $b=${b}$`, `$a+b+c=${q}+${paren(b)}+${paren(-p)}=${q + b - p}$`],
            };
          }
          const c = level === 1 ? 1 : r.pick([1, 2, 3]);
          const num = poly([c * q, c * (k - q * p)]);
          const den = poly([c, -c * p]);
          const show = level === 1 && r.chance(0.5) ? `\\frac{${k}}{${xm('x', p)}}${q === 0 ? '' : (q > 0 ? '+' : '') + q}` : `\\frac{${num}}{${den}}`;
          return {
            q: `함수 $y=${show}$ 의 그래프의 점근선의 방정식을 $x=m$, $y=n$ 이라 할 때, $m$, $n$ 의 값을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'm', value: p }, { label: 'n', value: q }] },
            steps: [`$y=\\frac{${k}}{${xm('x', p)}}${q === 0 ? '' : (q > 0 ? '+' : '') + q}$ 꼴로 변형`, `점근선: $x=${p}$, $y=${q}$`],
          };
        },
      },
      {
        id: 'rational-maxmin',
        title: '유리함수의 최대·최소',
        gen(r, level) {
          const K = r.pick([6, 12, 24, 8, 18]);
          const sgn = level === 1 ? 1 : r.sign();
          const k = sgn * K;
          const ds = divisors(K);
          const [u, v] = r.sample(ds, 2).sort((x, y) => x - y);
          const p = r.int(-4, 3),
            q = r.int(-5, 5);
          const m = p + u,
            n = p + v;
          const fm = k / u + q,
            fn = k / v + q;
          const show = level === 3 ? `\\frac{${poly([q, k - q * p])}}{${xm('x', p)}}` : `\\frac{${k}}{${xm('x', p)}}${q === 0 ? '' : (q > 0 ? '+' : '') + q}`;
          return {
            q: `$${m}\\le x\\le ${n}$ 에서 함수 $y=${show}$ 의 최댓값과 최솟값을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: '최댓값', value: Math.max(fm, fn) }, { label: '최솟값', value: Math.min(fm, fn) }] },
            steps: [
              ...(level === 3 ? [`$y=\\frac{${k}}{${xm('x', p)}}${q === 0 ? '' : (q > 0 ? '+' : '') + q}$`] : []),
              `$k=${k}${k > 0 ? '>' : '<'}0$ 이므로 $x>${p}$ 에서 ${k > 0 ? '감소' : '증가'}합니다.`,
              `$x=${m}$ 일 때 $${fm}$, $x=${n}$ 일 때 $${fn}$`,
              `최댓값 $${Math.max(fm, fn)}$, 최솟값 $${Math.min(fm, fn)}$`,
            ],
          };
        },
      },
      {
        id: 'irrational-domain-range',
        title: '무리함수의 정의역과 치역',
        gen(r, level) {
          const p = r.int(-5, 5);
          let q = r.int(-5, 5);
          if (q === p) q += 1;
          const aS = level === 1 ? 1 : r.sign();
          const sS = level === 1 ? 1 : r.sign();
          const a = aS * (level === 3 ? r.int(2, 3) : 1);
          const inner = poly([a, -a * p]);
          const f = `${sS < 0 ? '-' : ''}\\sqrt{${inner}}${q === 0 ? '' : (q > 0 ? '+' : '') + q}`;
          const desc = (ds: number, dv: number, rs: number, rv: number) => `정의역: $\\{x\\mid x${ds > 0 ? '\\ge' : '\\le'} ${dv}\\}$, 치역: $\\{y\\mid y${rs > 0 ? '\\ge' : '\\le'} ${rv}\\}$`;
          const right = desc(aS, p, sS, q);
          return {
            q: `함수 $y=${f}$ 의 정의역과 치역으로 옳은 것은?`,
            answer: wch(r, right, [desc(-aS, p, sS, q), desc(aS, p, -sS, q), desc(-aS, p, -sS, q), desc(aS, q, sS, p), desc(aS, -p, sS, q)]),
            steps: [`근호 안 $${inner}\\ge 0$ 에서 $x${aS > 0 ? '\\ge' : '\\le'} ${p}$`, `$${sS < 0 ? '-' : ''}\\sqrt{\\;}$ 은 $${sS < 0 ? '0 이하' : '0 이상'}$ 이므로 $y${sS > 0 ? '\\ge' : '\\le'} ${q}$`].map((s) => s.replace('$0 이하$', '0 이하').replace('$0 이상$', '0 이상')),
          };
        },
      },
      {
        id: 'irrational-value',
        title: '무리함수의 식과 함숫값',
        gen(r, level) {
          if (level === 1) {
            const a = r.pick([1, 2, 3, -1, -2]),
              x0 = r.int(-4, 6),
              s = r.int(1, 5),
              c = r.int(-5, 5);
            const b = s * s - a * x0;
            return {
              q: `함수 $f(x)=\\sqrt{${poly([a, b])}}${c === 0 ? '' : (c > 0 ? '+' : '') + c}$ 에 대하여 $f(${x0})$ 의 값을 구하세요.`,
              answer: { type: 'num', value: s + c },
              steps: [`$f(${x0})=\\sqrt{${b === 0 ? a * x0 : `${a * x0}+${paren(b)}`}}${c === 0 ? '' : (c > 0 ? '+' : '') + c}=\\sqrt{${s * s}}${c === 0 ? '' : (c > 0 ? '+' : '') + c}=${s + c}$`],
            };
          }
          if (level === 2) {
            const a = r.pick([1, 2, 3, 4, -1, -2, -3]),
              u = r.int(1, 3),
              m = r.nonzero(-3, 3),
              n = r.int(-3, 3);
            const x0 = m + a * u * u,
              y0 = n + Math.abs(a) * u;
            return {
              q: `함수 $y=\\sqrt{ax}$ 의 그래프를 $x$ 축의 방향으로 $${m}$ 만큼${n === 0 ? '' : `, $y$ 축의 방향으로 $${n}$ 만큼`} 평행이동한 그래프가 점 $${pt(x0, y0)}$ 를 지날 때, 상수 $a$ 의 값을 구하세요.`,
              answer: { type: 'num', value: a },
              steps: [`이동한 그래프: $y=\\sqrt{a(${xm('x', m)})}${n === 0 ? '' : (n > 0 ? '+' : '') + n}$`, `$${y0}=\\sqrt{a\\times${paren(x0 - m)}}${n === 0 ? '' : (n > 0 ? '+' : '') + n}$ → $\\sqrt{${cv(x0 - m, 'a')}}=${y0 - n}$`, `$${cv(x0 - m, 'a')}=${(y0 - n) ** 2}$, $a=${a}$`],
            };
          }
          const p = r.int(-4, 4),
            q = r.int(-4, 4),
            k = q + r.int(1, 4);
          const v = (k - q) ** 2 + p;
          return {
            q: `함수 $f(x)=\\sqrt{${xm('x', p)}}${q === 0 ? '' : (q > 0 ? '+' : '') + q}$ 의 역함수를 $g(x)$ 라 할 때, $g(${k})$ 의 값을 구하세요.`,
            answer: { type: 'num', value: v },
            steps: [`$g(${k})=t$ 이면 $f(t)=${k}$`, `$\\sqrt{${xm('t', p)}}=${k - q}$, $t=${(k - q) ** 2}+${paren(p)}=${v}$`],
          };
        },
      },
      {
        id: 'rational-graph',
        title: '그래프로 유리함수의 식 찾기',
        gen(r, level) {
          const p = r.int(-2, 2),
            q = r.int(-2, 2);
          const k = level === 1 ? r.nonzero(-3, 3) : r.pick([-4, -2, 2, 4, 6, -6]);
          let u = level === 1 ? r.sign() : r.pick(divisors(Math.abs(k)).filter((d) => d <= 3)) * r.sign();
          if (Math.abs(q + k / u) > 6) u = -u;
          if (Math.abs(q + k / u) > 6) u = u > 0 ? Math.abs(k) : -Math.abs(k);
          if (Math.abs(p + u) > 6 && Math.abs(q - k / u) <= 6) u = -u;
          const f = (x: number) => k / (x - p) + q;
          const px = p + u,
            py = q + k / u;
          const pl = new Plane(-7, 7, -7, 7, { w: 240, h: 240 });
          pl.seg(p, -7, p, 7, { cls: 'acc2', dash: true });
          pl.seg(-7, q, 7, q, { cls: 'acc2', dash: true });
          pl.fn(f);
          pl.point(px, py, `(${px}, ${py})`);
          const fig = figOut(pl);
          if (level === 3) {
            const b = k - q * p;
            return {
              q: `함수 $y=\\frac{ax+b}{x+c}$ 의 그래프가 그림과 같을 때 (점선은 점근선 $x=${p}$, $y=${q}$), $a+b+c$ 의 값을 구하세요.`,
              fig,
              answer: { type: 'num', value: q + b - p },
              steps: [`$y=\\frac{k}{${xm('x', p)}}${q === 0 ? '' : (q > 0 ? '+' : '') + q}$ 에 점 $${pt(px, py)}$ 대입: $k=${k}$`, `$y=\\frac{${poly([q, b])}}{${xm('x', p)}}$ 이므로 $a=${q}$, $b=${b}$, $c=${-p}$`, `$a+b+c=${q + b - p}$`],
            };
          }
          return {
            q: `그림은 함수 $y=\\frac{k}{x-p}+q$ 의 그래프이고 점선은 점근선 $x=${p}$, $y=${q}$ 입니다. $k+p+q$ 의 값을 구하세요.`,
            fig,
            answer: { type: 'num', value: k + p + q },
            steps: [`점근선에서 $p=${p}$, $q=${q}$`, `점 $${pt(px, py)}$ 대입: $${py}=\\frac{k}{${px - p}}${q === 0 ? '' : (q > 0 ? '+' : '') + q}$, $k=${k}$`, `$k+p+q=${k + p + q}$`],
          };
        },
      },
    ],
  },
};

function paren(n: number): string {
  return n < 0 ? `(${n})` : String(n);
}
