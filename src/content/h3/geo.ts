// 기하 (geo-1 ~ geo-5)
import type { ContentMap, ProblemDraft } from '../../core/types';
import { F } from '../../core/frac';
import { Plane, Svg, regularPolygon } from '../../core/fig';
import { simplifySqrt, gcd } from '../../core/nt';
import { makeChoices, sqrtTex, linTex, poly, termsTex } from '../../core/tex';
import { fAns, fChoices, texChoices, TRIPLES, QUADS, coef, shiftSq, deg, stableFig, ro } from './util';

const fr = (n: number, d = 1) => new F(n, d);
const T = (f: F) => f.tex();
const sgn = (v: number) => (v >= 0 ? `+${v}` : `${v}`);
const pr = (n: number) => (n < 0 ? `(${n})` : `${n}`);
const vec = (...c: (number | string)[]) => `(${c.join(', ')})`;

/** |dot| / √P 를 정리한 TeX (예: \frac{\sqrt{6}}{3}) */
function cosTex(dot: number, P: number): string {
  if (dot === 0) return '0';
  const [o, i] = simplifySqrt(P);
  const c = new F(Math.abs(dot), o * i); // |dot|·√i / (o·i)
  const s = dot < 0 ? '-' : '';
  if (i === 1) return s + new F(Math.abs(dot), o).tex();
  const num = c.n === 1 ? `\\sqrt{${i}}` : `${c.n}\\sqrt{${i}}`;
  return c.d === 1 ? `${s}${num}` : `${s}\\frac{${num}}{${c.d}}`;
}

/** k·√n (k 는 F) */
function fSqrt(k: F, n: number): string {
  const [o, i] = simplifySqrt(n);
  const c = k.mul(o);
  if (i === 1) return c.tex();
  if (c.isInt()) return `${c.n === 1 ? '' : c.n === -1 ? '-' : c.n}\\sqrt{${i}}`;
  const s = c.n < 0 ? '-' : '';
  const a = Math.abs(c.n);
  return `${s}\\frac{${a === 1 ? '' : a}\\sqrt{${i}}}{${c.d}}`;
}

// ───────── 이차곡선 그림
function conicFig(
  kind: 'ellipse' | 'hyper' | 'parab',
  a: number,
  b: number,
  o: { h?: number; k?: number; pts?: [number, number, string][]; foci?: [number, number][]; vertical?: boolean } = {},
): string {
  const h = o.h ?? 0,
    k = o.k ?? 0;
  let R: number;
  if (kind === 'parab') R = Math.max(4, Math.abs(a) * 3 + 1);
  else if (kind === 'ellipse') R = Math.max(a, b) + 1.5;
  else R = Math.sqrt(a * a + b * b) + 2;
  for (const [x, y] of [...(o.pts ?? []), ...(o.foci ?? [])]) R = Math.max(R, Math.abs(x - h) * 1.15 + 1, Math.abs(y - k) * 1.15 + 1);
  const xr: [number, number] = [h - R, h + R];
  const yr: [number, number] = [k - R, k + R];
  const step = R > 12 ? 4 : R > 7 ? 2 : 1;
  const P = new Plane(Math.min(xr[0], -1), Math.max(xr[1], 1), Math.min(yr[0], -1), Math.max(yr[1], 1), { w: 240, h: 240, grid: false, step });
  if (kind === 'ellipse') {
    const f = (s: number) => (x: number) => {
      const t = 1 - ((x - h) / a) ** 2;
      return t < 0 ? NaN : k + s * b * Math.sqrt(Math.max(0, t));
    };
    P.fn(f(1), { a: h - a, b: h + a }).fn(f(-1), { a: h - a, b: h + a });
  } else if (kind === 'hyper') {
    const f = (s: number) => (x: number) => {
      const t = ((x - h) / a) ** 2 - 1;
      return t < 0 ? NaN : k + s * b * Math.sqrt(Math.max(0, t));
    };
    P.fn(f(1), { a: xr[0], b: h - a }).fn(f(-1), { a: xr[0], b: h - a }).fn(f(1), { a: h + a, b: xr[1] }).fn(f(-1), { a: h + a, b: xr[1] });
    P.fn((x) => k + (b / a) * (x - h), { cls: 'grid', dash: true }).fn((x) => k - (b / a) * (x - h), { cls: 'grid', dash: true });
  } else {
    // y² = 4a x (a = p)
    const p = a;
    const f = (s: number) => (x: number) => {
      const t = (x - h) / p;
      return t < 0 ? NaN : k + s * 2 * Math.abs(p) * Math.sqrt(Math.max(0, t));
    };
    const lo = p > 0 ? h : xr[0];
    const hi = p > 0 ? xr[1] : h;
    P.fn(f(1), { a: lo, b: hi }).fn(f(-1), { a: lo, b: hi });
  }
  for (const [x, y] of o.foci ?? []) P.point(x, y, undefined, { cls: 'acc2' });
  for (const [x, y, l] of o.pts ?? []) P.point(x, y, l);
  return stableFig(P.toString());
}

// 정수 조합 미리 계산: a²m²+b² (타원), a²m²-b² (쌍곡선) 이 제곱수
const ELL_TAN: [number, number, number, number][] = [];
const HYP_TAN: [number, number, number, number][] = [];
for (let a = 1; a <= 6; a++)
  for (let b = 1; b <= 6; b++)
    for (let m = 1; m <= 4; m++) {
      if (a === b) continue;
      const e = a * a * m * m + b * b;
      const se = Math.round(Math.sqrt(e));
      if (se * se === e) ELL_TAN.push([a, b, m, se]);
      const hh = a * a * m * m - b * b;
      const sh = Math.round(Math.sqrt(Math.max(0, hh)));
      if (hh > 0 && sh * sh === hh) HYP_TAN.push([a, b, m, sh]);
    }

/** x²/A ± y²/B = 1 TeX */
/** 분모가 1 이면 분수 대신 x²·y² 로 (x²/1 처럼 쓰지 않음) */
const conicEq = (A: number | string, B: number | string, minus = false) =>
  `${String(A) === '1' ? 'x^{2}' : `\\frac{x^{2}}{${A}}`}${minus ? '-' : '+'}${String(B) === '1' ? 'y^{2}' : `\\frac{y^{2}}{${B}}`}=1`;

// ───────── 입체 (정육면체·삼각기둥·사각뿔)
type V3 = [number, number, number];
interface Solid {
  name: string;
  verts: Record<string, V3>;
  edges: string[];
  hidden: string[];
}
const CUBE: Solid = {
  name: '정육면체 ABCD-EFGH',
  verts: { A: [0, 0, 0], B: [1, 0, 0], C: [1, 1, 0], D: [0, 1, 0], E: [0, 0, 1], F: [1, 0, 1], G: [1, 1, 1], H: [0, 1, 1] },
  edges: ['AB', 'BC', 'CD', 'DA', 'EF', 'FG', 'GH', 'HE', 'AE', 'BF', 'CG', 'DH'],
  hidden: ['CD', 'DA', 'DH'],
};
const PRISM: Solid = {
  name: '삼각기둥 ABC-DEF',
  verts: { A: [0, 0, 0], B: [1, 0, 0], C: [0.25, 1, 0], D: [0, 0, 1], E: [1, 0, 1], F: [0.25, 1, 1] },
  edges: ['AB', 'BC', 'CA', 'DE', 'EF', 'FD', 'AD', 'BE', 'CF'],
  hidden: ['BC', 'CA', 'CF'],
};
const PYRAMID: Solid = {
  name: '사각뿔 O-ABCD',
  verts: { O: [0.5, 0.5, 1.1], A: [0, 0, 0], B: [1, 0, 0], C: [1, 1, 0], D: [0, 1, 0] },
  edges: ['AB', 'BC', 'CD', 'DA', 'OA', 'OB', 'OC', 'OD'],
  hidden: ['CD', 'DA', 'OD'],
};
function solidFig(s: Solid, hi: string[] = []): string {
  const svg = new Svg(220, 200);
  const X = (v: V3) => 45 + 110 * v[0] + 50 * v[1];
  const Y = (v: V3) => 170 - 110 * v[2] - 40 * v[1];
  for (const e of s.edges) {
    const p = s.verts[e[0]],
      q = s.verts[e[1]];
    svg.line(X(p), Y(p), X(q), Y(q), { dash: s.hidden.includes(e) });
  }
  for (const e of hi) {
    const p = s.verts[e[0]],
      q = s.verts[e[1]];
    svg.line(X(p), Y(p), X(q), Y(q), { cls: 'acc', width: 2.5 });
  }
  const c: V3 = [0.5, 0.5, 0.5];
  for (const [n, v] of Object.entries(s.verts)) {
    const dx = X(v) - X(c),
      dy = Y(v) - Y(c);
    const L = Math.hypot(dx, dy) || 1;
    svg.text(X(v) + (dx / L) * 12, Y(v) + (dy / L) * 12, n, { size: 13 });
  }
  return svg.toString();
}
const sub3 = (p: V3, q: V3): V3 => [q[0] - p[0], q[1] - p[1], q[2] - p[2]];
const cross0 = (u: V3, v: V3) => Math.abs(u[1] * v[2] - u[2] * v[1]) + Math.abs(u[2] * v[0] - u[0] * v[2]) + Math.abs(u[0] * v[1] - u[1] * v[0]) < 1e-9;

export const geo: ContentMap = {
  // ───────────────────────── geo-1 이차곡선
  'geo-1': {
    concepts: [
      {
        title: '포물선',
        body: '평면 위의 한 점 F(초점)와 그 점을 지나지 않는 직선(준선)에 이르는 거리가 같은 점의 자취.\n$$y^{2}=4px \\;:\\; \\text{초점 } (p, 0),\\ \\text{준선 } x=-p$$\n- $x^{2}=4py$: 초점 $(0, p)$, 준선 $y=-p$\n- 포물선 위의 점에서 초점까지 거리 = 준선까지 거리',
        example: { q: '$y^{2}=8x$ 의 초점과 준선', a: '$4p=8$, $p=2$: 초점 $(2,0)$, 준선 $x=-2$' },
      },
      {
        title: '타원',
        body: '두 초점 F, F$' + "'" + '$ 까지 거리의 합이 일정($2a$)한 점의 자취.\n$$\\frac{x^{2}}{a^{2}}+\\frac{y^{2}}{b^{2}}=1\\ (a>b>0)$$\n- 초점 $(\\pm c, 0)$, $c^{2}=a^{2}-b^{2}$\n- 장축의 길이 $2a$, 단축의 길이 $2b$\n- $b>a$ 이면 초점이 $y$축 위: $c^{2}=b^{2}-a^{2}$',
      },
      {
        title: '쌍곡선',
        body: '두 초점까지 거리의 차가 일정($2a$)한 점의 자취.\n$$\\frac{x^{2}}{a^{2}}-\\frac{y^{2}}{b^{2}}=1$$\n- 초점 $(\\pm c, 0)$, $c^{2}=a^{2}+b^{2}$, 주축의 길이 $2a$\n- 점근선 $y=\\pm\\frac{b}{a}x$',
      },
      {
        title: '이차곡선의 평행이동',
        body: '$x$ 대신 $x-m$, $y$ 대신 $y-n$ 을 넣으면 $x$축 방향으로 $m$, $y$축 방향으로 $n$ 만큼 평행이동 (공통수학2 도형의 이동).\n- $Ax^{2}+By^{2}+Cx+Dy+E=0$ 꼴은 완전제곱식으로 고쳐 중심·꼭짓점을 찾아요.',
      },
    ],
    skills: [
      {
        id: 'parabola',
        title: '포물선의 초점과 준선',
        gen(r, level) {
          const p = r.nonzero(-4, 4);
          if (level === 1) {
            const vert = r.chance(0.4);
            return {
              q: `포물선 $${vert ? `x^{2}=${4 * p}y` : `y^{2}=${4 * p}x`}$ 의 초점의 좌표를 $(${vert ? '0, b' : 'a, 0'})$, 준선의 방정식을 $${vert ? 'y' : 'x'}=k$ 라 할 때 ${vert ? '$b$' : '$a$'}, $k$ 를 구하세요.`,
              fig: vert ? undefined : conicFig('parab', p, 0, { foci: [[p, 0]] }),
              answer: { type: 'fields', fields: [{ label: vert ? 'b' : 'a', value: p }, { label: 'k', value: -p }] },
              steps: [`$4p = ${4 * p}$ 에서 $p = ${p}$`, `초점 $${vert ? `(0, ${p})` : `(${p}, 0)`}$, 준선 $${vert ? 'y' : 'x'}=${-p}$`],
            };
          }
          if (level === 2) {
            const h = r.int(-3, 3),
              k = r.int(-3, 3);
            return {
              q: `포물선 $${shiftSq('y', k)}=${4 * p}${h === 0 ? 'x' : `(x${h > 0 ? '-' : '+'}${Math.abs(h)})`}$ 의 초점의 좌표를 구하세요.`,
              fig: conicFig('parab', p, 0, { h, k, foci: [[h + p, k]] }),
              answer: { type: 'fields', fields: [{ label: 'x', value: h + p }, { label: 'y', value: k }] },
              steps: [`$y^{2}=${4 * p}x$ (초점 $(${p}, 0)$) 를 $x$축 방향으로 $${h}$, $y$축 방향으로 $${k}$ 만큼 평행이동한 것`, `초점: $(${p}+${pr(h)}, 0+${pr(k)}) = (${h + p}, ${k})$`],
            };
          }
          const pp = Math.abs(p);
          const m = r.nonzero(-3, 3);
          const x0 = pp * m * m,
            y0 = 2 * pp * m;
          return {
            q: `포물선 $y^{2}=${4 * pp}x$ 위의 점 P 의 $y$ 좌표가 $${y0}$ 일 때, 점 P 와 초점 F 사이의 거리를 구하세요.`,
            fig: conicFig('parab', pp, 0, { foci: [[pp, 0]], pts: [[x0, y0, 'P']] }),
            answer: { type: 'num', value: x0 + pp },
            steps: [`$${y0 * y0} = ${4 * pp}x$ 에서 $x = ${x0}$`, `PF = (P 에서 준선 $x=${-pp}$ 까지의 거리) $= ${x0}+${pp}$`, `$= ${x0 + pp}$`],
            hint: '포물선의 정의: 초점까지 거리 = 준선까지 거리',
          };
        },
      },
      {
        id: 'ellipse',
        title: '타원의 초점과 축',
        gen(r, level) {
          const [t1, t2, cc] = r.pick(TRIPLES.slice(0, 6));
          const [b0, c] = r.chance(0.5) ? [t1, t2] : [t2, t1];
          const a = cc;
          const b = b0;
          if (level === 1) {
            const vert = r.chance(0.4);
            return {
              q: `타원 $${vert ? conicEq(b * b, a * a) : conicEq(a * a, b * b)}$ 의 두 초점의 좌표가 ${vert ? '$(0, c)$, $(0, -c)$' : '$(c, 0)$, $(-c, 0)$'} 일 때, 양수 $c$ 의 값을 구하세요.`,
              fig: vert ? undefined : conicFig('ellipse', a, b, { foci: [[c, 0], [-c, 0]] }),
              answer: { type: 'num', value: c },
              steps: [`$c^{2} = ${a * a}-${b * b} = ${c * c}$`, `$c = ${c}$`],
            };
          }
          if (level === 2) {
            const A = r.int(2, 6);
            let B = r.int(1, 5);
            if (B === A) B = A - 1;
            const L = Math.max(A, B),
              S = Math.min(A, B);
            return {
              q: `타원 $${B * B}x^{2}+${A * A}y^{2}=${A * A * B * B}$ 의 장축의 길이와 단축의 길이를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: '장축', value: 2 * L }, { label: '단축', value: 2 * S }] },
              steps: [`양변을 $${A * A * B * B}$ 로 나누면 $${conicEq(A * A, B * B)}$`, `장축 $2\\times${L} = ${2 * L}$, 단축 $2\\times${S} = ${2 * S}$`],
            };
          }
          return {
            q: `두 초점이 F, F' 인 타원 $${conicEq(a * a, b * b)}$ 위의 점 P (단, P 는 $x$축 위에 있지 않음)에 대하여 삼각형 PF'F 의 둘레의 길이를 구하세요.`,
            fig: conicFig('ellipse', a, b, { foci: [[c, 0], [-c, 0]], pts: [[a * 0.6, b * 0.8, 'P']] }),
            answer: { type: 'num', value: 2 * a + 2 * c },
            steps: [`타원의 정의: $\\overline{PF}+\\overline{PF'} = 2a = ${2 * a}$`, `$c^{2} = ${a * a}-${b * b}$ 에서 $c=${c}$, $\\overline{FF'} = ${2 * c}$`, `둘레 $= ${2 * a}+${2 * c} = ${2 * a + 2 * c}$`],
          };
        },
      },
      {
        id: 'hyperbola',
        title: '쌍곡선의 초점과 점근선',
        gen(r, level) {
          const [t1, t2, c] = r.pick(TRIPLES.slice(0, 6));
          const [a, b] = r.chance(0.5) ? [t1, t2] : [t2, t1];
          if (level === 1) {
            return {
              q: `쌍곡선 $${conicEq(a * a, b * b, true)}$ 의 두 초점의 좌표가 $(c, 0)$, $(-c, 0)$ 일 때, 양수 $c$ 의 값을 구하세요.`,
              fig: conicFig('hyper', a, b, { foci: [[c, 0], [-c, 0]] }),
              answer: { type: 'num', value: c },
              steps: [`$c^{2} = a^{2}+b^{2} = ${a * a}+${b * b} = ${c * c}$`, `$c = ${c}$`],
            };
          }
          if (level === 2) {
            const A = r.int(1, 6),
              B = r.int(1, 6);
            if (A === B) return this.gen(r, level);
            const right = `y=\\pm ${T(fr(B, A)) === '1' ? '' : T(fr(B, A))}x`;
            const opts = [fr(A, B), fr(B * B, A * A), fr(A * A, B * B), fr(B, 2 * A)].map((f) => `y=\\pm ${f.eq(1) ? '' : T(f)}x`);
            return {
              q: `쌍곡선 $${conicEq(A * A, B * B, true)}$ 의 점근선의 방정식은?`,
              answer: texChoices(r, right, opts.filter((o) => o !== right)),
              steps: [`$\\frac{x^{2}}{a^{2}}-\\frac{y^{2}}{b^{2}}=1$ 의 점근선은 $y=\\pm\\frac{b}{a}x$`, `$a=${A}$, $b=${B}$ → $${right}$`],
            };
          }
          // 오른쪽 가지 위의 점은 PF ≥ c-a (꼭짓점에서 등호) → 제1사분면의 점이려면 PF > c-a
          const d = c - a + r.int(1, 8);
          return {
            q: `두 초점이 F$(${c}, 0)$, F'$(${-c}, 0)$ 인 쌍곡선 $${conicEq(a * a, b * b, true)}$ 위의 제1사분면의 점 P 에 대하여 $\\overline{PF} = ${d}$ 일 때, $\\overline{PF'}$ 의 길이를 구하세요.`,
            fig: conicFig('hyper', a, b, { foci: [[c, 0], [-c, 0]] }),
            answer: { type: 'num', value: d + 2 * a },
            steps: [`쌍곡선의 정의: $|\\overline{PF'}-\\overline{PF}| = 2a = ${2 * a}$`, `P 가 오른쪽 가지 위에 있으므로 $\\overline{PF'}>\\overline{PF}$`, `$\\overline{PF'} = ${d}+${2 * a} = ${d + 2 * a}$`],
          };
        },
      },
      {
        id: 'equation',
        title: '조건으로 이차곡선의 방정식 구하기',
        gen(r, level) {
          if (level === 1) {
            const p = r.nonzero(-4, 4);
            const right = `y^{2}=${4 * p}x`;
            return {
              q: `초점이 $(${p}, 0)$ 이고 준선이 $x=${-p}$ 인 포물선의 방정식은?`,
              answer: texChoices(r, right, [`y^{2}=${-4 * p}x`, `y^{2}=${2 * p}x`, `x^{2}=${4 * p}y`, `y^{2}=${p === 1 ? '' : p === -1 ? '-' : p}x`, `y^{2}=${8 * p}x`]),
              steps: [`$y^{2}=4px$ 꼴, $p=${p}$`, `$${right}$`],
            };
          }
          const [t1, t2, h] = r.pick(TRIPLES.slice(0, 6));
          const [x, y] = r.chance(0.5) ? [t1, t2] : [t2, t1];
          if (level === 2) {
            // 타원: c = x, b = y, a = h
            const c = x,
              b = y,
              a = h;
            const right = conicEq(a * a, b * b);
            return {
              q: `두 초점 F$(${c}, 0)$, F'$(${-c}, 0)$ 으로부터의 거리의 합이 $${2 * a}$ 인 점의 자취의 방정식은?`,
              answer: texChoices(r, right, [conicEq(a * a, c * c), conicEq(b * b, a * a), conicEq(a * a, b * b, true), conicEq(4 * a * a, b * b), conicEq(a * a, a * a + c * c)]),
              steps: [`타원, $2a = ${2 * a}$ → $a = ${a}$`, `$b^{2} = a^{2}-c^{2} = ${a * a}-${c * c} = ${b * b}$`, `$${right}$`],
            };
          }
          // 쌍곡선: c = h, a = x, b = y
          const a = x,
            b = y,
            c = h;
          const right = conicEq(a * a, b * b, true);
          return {
            q: `두 초점 F$(${c}, 0)$, F'$(${-c}, 0)$ 으로부터의 거리의 차가 $${2 * a}$ 인 점의 자취의 방정식은?`,
            answer: texChoices(r, right, [conicEq(a * a, c * c, true), conicEq(a * a, b * b), conicEq(b * b, a * a, true), conicEq(4 * a * a, b * b, true), conicEq(a * a, c * c + a * a, true)]),
            steps: [`쌍곡선, $2a = ${2 * a}$ → $a = ${a}$`, `$b^{2} = c^{2}-a^{2} = ${c * c}-${a * a} = ${b * b}$`, `$${right}$`],
          };
        },
      },
      {
        id: 'center',
        title: '이차곡선의 평행이동',
        gen(r, level) {
          const h = r.nonzero(-3, 3),
            k = r.nonzero(-3, 3);
          if (level <= 2) {
            let a = r.int(2, 5),
              b = r.int(1, 4);
            if (a === b) a++;
            const A = b * b,
              B = a * a;
            // b²(x-h)² + a²(y-k)² = a²b²
            const D = -2 * A * h,
              E = -2 * B * k,
              G = A * h * h + B * k * k - A * B;
            const eq = `${A === 1 ? '' : A}x^{2}+${B}y^{2}${sgn(D)}x${sgn(E)}y${G === 0 ? '' : sgn(G)}=0`;
            if (level === 1) {
              return {
                q: `타원 $\\frac{${shiftSq('x', h)}}{${a * a}}+\\frac{${shiftSq('y', k)}}{${b * b}}=1$ 의 중심의 좌표를 구하세요.`,
                fig: conicFig('ellipse', a, b, { h, k, pts: [[h, k, '']] }),
                answer: { type: 'fields', fields: [{ label: 'x', value: h }, { label: 'y', value: k }] },
                steps: [`타원 $${conicEq(a * a, b * b)}$ 을 $x$축 방향으로 $${h}$, $y$축 방향으로 $${k}$ 만큼 평행이동한 것`, `중심 $(${h}, ${k})$`],
              };
            }
            return {
              q: `방정식 $${eq}$ 이 나타내는 타원의 중심의 좌표를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'x', value: h }, { label: 'y', value: k }] },
              steps: [`완전제곱식으로: $${A === 1 ? '' : A}${shiftSq('x', h)}+${B}${shiftSq('y', k)}=${A * B}$`, `$\\frac{${shiftSq('x', h)}}{${a * a}}+\\frac{${shiftSq('y', k)}}{${b * b}}=1$ → 중심 $(${h}, ${k})$`],
            };
          }
          const [t1, t2, cc] = r.pick(TRIPLES.slice(0, 4));
          const [b, c] = r.chance(0.5) ? [t1, t2] : [t2, t1];
          const a = cc;
          return {
            q: `타원 $\\frac{${shiftSq('x', h)}}{${a * a}}+\\frac{${shiftSq('y', k)}}{${b * b}}=1$ 의 두 초점 중 $x$ 좌표가 큰 초점의 좌표를 구하세요.`,
            fig: conicFig('ellipse', a, b, { h, k, foci: [[h + c, k], [h - c, k]] }),
            answer: { type: 'fields', fields: [{ label: 'x', value: h + c }, { label: 'y', value: k }] },
            steps: [`평행이동 전 타원의 초점: $c^{2} = ${a * a}-${b * b} = ${c * c}$, $(\\pm${c}, 0)$`, `$x$축 방향 $${h}$, $y$축 방향 $${k}$ 이동: $(${h + c}, ${k})$, $(${h - c}, ${k})$`, `답: $(${h + c}, ${k})$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── geo-2 이차곡선과 직선
  'geo-2': {
    concepts: [
      {
        title: '이차곡선과 직선의 위치 관계',
        body: '직선의 방정식을 이차곡선에 대입해 얻은 이차방정식의 판별식 $D$ 로 판단해요.\n- $D>0$: 서로 다른 두 점에서 만남\n- $D=0$: 한 점에서 만남(접함)\n- $D<0$: 만나지 않음\n- 공통수학2의 원과 직선의 위치 관계와 같은 방법이에요.',
      },
      {
        title: '곡선 위의 점에서의 접선',
        body: '점 $(x_1, y_1)$ 에서의 접선:\n- 포물선 $y^{2}=4px$: $y_1y = 2p(x+x_1)$\n- 타원 $\\frac{x^{2}}{a^{2}}+\\frac{y^{2}}{b^{2}}=1$: $\\frac{x_1x}{a^{2}}+\\frac{y_1y}{b^{2}}=1$\n- 쌍곡선 $\\frac{x^{2}}{a^{2}}-\\frac{y^{2}}{b^{2}}=1$: $\\frac{x_1x}{a^{2}}-\\frac{y_1y}{b^{2}}=1$',
      },
      {
        title: '기울기가 주어진 접선',
        body: '기울기가 $m$ 인 접선:\n- 포물선 $y^{2}=4px$: $y=mx+\\frac{p}{m}$\n- 타원: $y=mx\\pm\\sqrt{a^{2}m^{2}+b^{2}}$\n- 쌍곡선: $y=mx\\pm\\sqrt{a^{2}m^{2}-b^{2}}$ ($a^{2}m^{2}>b^{2}$)',
        example: { q: '$y^{2}=8x$ 에 접하고 기울기가 $2$ 인 직선', a: '$p=2$: $y=2x+1$' },
      },
    ],
    skills: [
      {
        id: 'position',
        title: '이차곡선과 직선의 위치 관계',
        gen(r, level) {
          if (level <= 2) {
            let a = r.int(1, 4),
              b = r.int(1, 4);
            if (a === b) a++;
            const m = r.nonzero(-3, 3);
            const N = a * a * m * m + b * b;
            const sq = Math.round(Math.sqrt(N)) ** 2 === N;
            const mode = r.pick(sq ? ['lt', 'eq', 'gt'] : ['lt', 'gt']);
            const s = Math.sqrt(N);
            const k = mode === 'eq' ? Math.round(s) * r.sign() : mode === 'lt' ? r.int(-Math.floor(s - 1e-9), Math.floor(s - 1e-9)) : (Math.floor(s) + r.int(1, 3)) * r.sign();
            const cnt = mode === 'lt' ? 2 : mode === 'eq' ? 1 : 0;
            if (level === 1)
              return {
                q: `타원 $${conicEq(a * a, b * b)}$ 과 직선 $y=${linTex(m, k)}$ 의 교점의 개수는?`,
                answer: makeChoices(r, `${cnt}개`, ['0개', '1개', '2개', '3개'].filter((x) => x !== `${cnt}개`), 4),
                steps: [`기울기 $m$ 인 접선의 $y$절편은 $\\pm\\sqrt{a^{2}m^{2}+b^{2}} = \\pm\\sqrt{${N}}$`, `$${pr(k)}^{2} = ${k * k}$ 와 $${N}$ 비교: ${mode === 'lt' ? '작으므로 두 점에서 만남' : mode === 'eq' ? '같으므로 접함' : '크므로 만나지 않음'}`, `교점 $${cnt}$개`],
              };
            const p = r.int(1, 4);
            const mm = r.nonzero(-3, 3);
            const kk = r.int(-4, 4);
            // y²=4px, y=mx+k → D/4 ∝ p(p - mk)
            const v = p - mm * kk;
            const c2 = v > 0 ? 2 : v === 0 ? 1 : 0;
            return {
              q: `포물선 $y^{2}=${4 * p}x$ 와 직선 $y=${linTex(mm, kk)}$ 의 교점의 개수는?`,
              answer: makeChoices(r, `${c2}개`, ['0개', '1개', '2개', '3개'].filter((x) => x !== `${c2}개`), 4),
              steps: [`대입: $(${linTex(mm, kk)})^{2}=${4 * p}x$ → $${poly([mm * mm, 2 * mm * kk - 4 * p, kk * kk])}=0$`, `$\\frac{D}{4} = (${mm * kk}-${2 * p})^{2}-${mm * mm * kk * kk} = ${4 * p * v}$`, `$D${v > 0 ? '>' : v === 0 ? '=' : '<'}0$ 이므로 교점 $${c2}$개`],
            };
          }
          let a = r.int(1, 5),
            b = r.int(1, 5);
          if (a === b) a++;
          const m = r.nonzero(-2, 2);
          const N = a * a * m * m + b * b;
          const f = Math.floor(Math.sqrt(N) - 1e-9);
          const cnt = 2 * f + 1;
          return {
            q: `타원 $${conicEq(a * a, b * b)}$ 과 직선 $y=${coef(m)}x+k$ 가 서로 다른 두 점에서 만나도록 하는 정수 $k$ 의 개수를 구하세요.`,
            answer: { type: 'num', value: cnt, unit: '개' },
            steps: [`대입하여 정리한 이차방정식의 판별식 $>0$ 조건: $k^{2}<a^{2}m^{2}+b^{2} = ${N}$`, `$-\\sqrt{${N}}<k<\\sqrt{${N}}$, $${f}<\\sqrt{${N}}${f + 1 === Math.sqrt(N) ? '=' : '<'}${f + 1}$`, `정수 $k$: $-${f}$ 부터 $${f}$ 까지 $${cnt}$개`],
          };
        },
      },
      {
        id: 'tangent-point',
        title: '곡선 위의 점에서의 접선',
        gen(r, level) {
          const out = (m: F, n: F, q: string, steps: string[]): ProblemDraft => ({
            q: q + ' 접선의 방정식을 $y=mx+n$ 이라 할 때, $m$, $n$ 의 값을 구하세요.',
            answer: { type: 'fields', fields: [{ label: 'm', value: m.value }, { label: 'n', value: n.value }] },
            steps,
          });
          if (level === 1) {
            const p = r.int(1, 3),
              t = r.nonzero(-3, 3);
            const x1 = p * t * t,
              y1 = 2 * p * t;
            return out(fr(1, t), fr(p * t), `포물선 $y^{2}=${4 * p}x$ 위의 점 $(${x1}, ${y1})$ 에서의`, [`$y_1y = 2p(x+x_1)$: $${y1}y = ${2 * p}(x+${x1})$`, `$y = ${linTex(fr(1, t), p * t)}$`, `$m = ${T(fr(1, t))}$, $n = ${p * t}$`]);
          }
          const p = r.int(1, 4),
            q = r.int(1, 4);
          const x1 = r.nonzero(-3, 3),
            y1 = r.nonzero(-3, 3);
          if (level === 2) {
            const N = p * x1 * x1 + q * y1 * y1;
            const m = fr(-p * x1, q * y1),
              n = fr(N, q * y1);
            return out(m, n, `타원 $${p === 1 ? '' : p}x^{2}+${q === 1 ? '' : q}y^{2}=${N}$ 위의 점 $(${x1}, ${y1})$ 에서의`, [`접선: $${p * x1}x${sgn(q * y1)}y=${N}$`, `$y = ${linTex(m, n)}$`, `$m = ${T(m)}$, $n = ${T(n)}$`]);
          }
          let X = Math.abs(x1) + 1;
          if (p * X * X - q * y1 * y1 <= 0) X = Math.ceil(Math.sqrt((q * y1 * y1) / p)) + 1;
          const xx = X * (x1 < 0 ? -1 : 1);
          const N = p * xx * xx - q * y1 * y1;
          const m = fr(p * xx, q * y1),
            n = fr(-N, q * y1);
          return out(m, n, `쌍곡선 $${p === 1 ? '' : p}x^{2}-${q === 1 ? '' : q}y^{2}=${N}$ 위의 점 $(${xx}, ${y1})$ 에서의`, [`접선: $${p * xx}x${sgn(-q * y1)}y=${N}$`, `$y = ${linTex(m, n)}$`, `$m = ${T(m)}$, $n = ${T(n)}$`]);
        },
      },
      {
        id: 'slope-tangent',
        title: '기울기가 주어진 접선',
        gen(r, level) {
          if (level === 1) {
            const p = r.nonzero(-4, 4),
              m = r.nonzero(-4, 4);
            const n = fr(p, m);
            return {
              q: `포물선 $y^{2}=${4 * p}x$ 에 접하고 기울기가 $${m}$ 인 직선의 $y$절편을 구하세요.`,
              answer: fAns(n),
              steps: [`$y^{2}=4px$ 에 접하고 기울기 $m$ 인 직선: $y=mx+\\frac{p}{m}$`, `$p=${p}$, $m=${m}$: $y$절편 $\\frac{${p}}{${m}} = ${T(n)}$`],
            };
          }
          if (level === 2) {
            const [a, b, m, s] = r.pick(ELL_TAN);
            const mm = m * r.sign();
            return {
              q: `타원 $${conicEq(a * a, b * b)}$ 에 접하고 기울기가 $${mm}$ 인 두 직선 중 $y$절편이 양수인 직선의 $y$절편은?`,
              answer: texChoices(r, String(s), [sqrtTex(a * a * m * m - b * b > 0 ? a * a * m * m - b * b : a * a * m * m + 2 * b * b), String(a * m + b), sqrtTex(a * a + b * b * m * m), String(s * s), sqrtTex(a * a * m + b * b)].filter((w) => w !== String(s))),
              steps: [`$y=mx\\pm\\sqrt{a^{2}m^{2}+b^{2}}$`, `$\\sqrt{${a * a}\\times${m * m}+${b * b}} = \\sqrt{${s * s}} = ${s}$`],
            };
          }
          const [a, b, m, s] = r.pick(HYP_TAN);
          const mm = m * r.sign();
          return {
            q: `쌍곡선 $${conicEq(a * a, b * b, true)}$ 에 접하고 기울기가 $${mm}$ 인 두 직선 중 $y$절편이 음수인 직선의 $y$절편을 구하세요.`,
            answer: { type: 'num', value: -s },
            steps: [`$y=mx\\pm\\sqrt{a^{2}m^{2}-b^{2}}$ ($a^{2}m^{2}>b^{2}$)`, `$\\sqrt{${a * a}\\times${m * m}-${b * b}} = \\sqrt{${s * s}} = ${s}$`, `$y=${coef(mm)}x-${s}$ 이므로 $y$절편 $${-s}$`],
          };
        },
      },
      {
        id: 'external',
        title: '곡선 밖의 점에서 그은 접선',
        gen(r, level) {
          if (level <= 2) {
            const p = r.int(1, 3);
            const x0 = -r.int(1, 4),
              y0 = r.int(-4, 4);
            const prod = fr(p, x0),
              sum = fr(y0, x0);
            const ask = level === 1 ? 'prod' : 'sum';
            const ans = ask === 'prod' ? prod : sum;
            return {
              q: `점 $(${x0}, ${y0})$ 에서 포물선 $y^{2}=${4 * p}x$ 에 그은 두 접선의 기울기의 ${ask === 'prod' ? '곱' : '합'}을 구하세요.`,
              answer: fAns(ans),
              steps: [`접선 $y=mx+\\frac{${p}}{m}$ 이 점 $(${x0}, ${y0})$ 을 지나므로 $${y0} = ${x0}m+\\frac{${p}}{m}$`, `$${x0}m^{2}${sgn(-y0)}m+${p} = 0$`, `근과 계수의 관계: 기울기의 ${ask === 'prod' ? `곱 $\\frac{${p}}{${x0}}$` : `합 $\\frac{${y0}}{${x0}}$`} $= ${T(ans)}$`.replace(`$\\frac{${y0}}{${x0}}$`, `$\\frac{${y0}}{${x0}}$`)],
            };
          }
          let a = r.int(1, 4),
            b = r.int(1, 4);
          if (a === b) a++;
          let x0 = r.int(-5, 5),
            y0 = r.int(-5, 5);
          if (x0 * x0 === a * a) x0 += x0 >= 0 ? 1 : -1;
          if ((x0 * x0) / (a * a) + (y0 * y0) / (b * b) <= 1) y0 = y0 >= 0 ? b + 1 + r.int(0, 2) : -(b + 1 + r.int(0, 2));
          if (x0 * x0 === a * a) x0 += 1;
          const ans = fr(y0 * y0 - b * b, x0 * x0 - a * a);
          return {
            q: `점 $(${x0}, ${y0})$ 에서 타원 $${conicEq(a * a, b * b)}$ 에 그은 두 접선의 기울기의 곱을 구하세요.`,
            answer: fAns(ans),
            steps: [`접선 $y = mx+n$, $n^{2} = ${a * a}m^{2}+${b * b}$, 점을 지나므로 $n = ${y0}${sgn(-x0)}m$`, `$(${y0}${sgn(-x0)}m)^{2} = ${a * a}m^{2}+${b * b}$ → $${x0 * x0 - a * a}m^{2}${sgn(-2 * x0 * y0)}m+${y0 * y0 - b * b}=0$`.replace('+-', '-'), `기울기의 곱 $= \\frac{${y0 * y0 - b * b}}{${x0 * x0 - a * a}} = ${T(ans)}$`],
          };
        },
      },
      {
        id: 'tangent-area',
        title: '접선과 좌표축이 만드는 삼각형',
        gen(r, level) {
          if (level === 1) {
            const p = r.int(1, 3),
              t = r.int(1, 3);
            const area = fr(p * p * t * t * t, 2);
            return {
              q: `포물선 $y^{2}=${4 * p}x$ 위의 점 $(${p * t * t}, ${2 * p * t})$ 에서의 접선과 $x$축, $y$축으로 둘러싸인 삼각형의 넓이를 구하세요.`,
              answer: fAns(area),
              steps: [`접선: $${2 * p * t}y = ${2 * p}(x+${p * t * t})$, 즉 $y = ${linTex(fr(1, t), p * t)}$`, `$x$절편 $${-p * t * t}$, $y$절편 $${p * t}$`, `넓이 $\\frac12\\times${p * t * t}\\times${p * t} = ${T(fr(p * p * t * t * t, 2))}$`],
            };
          }
          const p = r.int(1, 4);
          let q = r.int(1, 4);
          if (q === p) q = p + 1; // p=q 이면 원
          const x1 = r.int(1, 3),
            y1 = r.int(1, 3);
          const N = p * x1 * x1 + q * y1 * y1;
          const xi = fr(N, p * x1),
            yi = fr(N, q * y1);
          const area = xi.mul(yi).div(2);
          return {
            q: `타원 $${p === 1 ? '' : p}x^{2}+${q === 1 ? '' : q}y^{2}=${N}$ 위의 점 $(${x1}, ${y1})$ 에서의 접선과 $x$축, $y$축으로 둘러싸인 삼각형의 넓이${level === 2 ? '를 구하세요.' : '는?'}`,
            answer: level === 2 ? fAns(area) : fChoices(r, area, [xi.mul(yi), xi.add(yi), area.mul(fr(1, 2)), fr(N, 2)]),
            steps: [`접선: $${p * x1}x+${q * y1}y=${N}$`, `$x$절편 $${T(xi)}$, $y$절편 $${T(yi)}$`, `넓이 $\\frac12\\times${T(xi)}\\times${T(yi)} = ${T(area)}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── geo-3 벡터의 연산
  'geo-3': {
    concepts: [
      {
        title: '벡터의 뜻',
        body: '크기와 방향을 함께 가지는 양을 **벡터**라 해요. 점 A 에서 B 로 향하는 벡터 $\\overrightarrow{AB}$, 크기 $|\\overrightarrow{AB}|$.\n- 크기와 방향이 같으면 같은 벡터 (위치는 상관없음)\n- 크기 0 인 영벡터 $\\vec{0}$, 크기가 같고 방향이 반대인 $-\\vec{a}$\n- 크기가 1 인 벡터: 단위벡터',
      },
      {
        title: '벡터의 덧셈·뺄셈·실수배',
        body: '- 덧셈: 삼각형법칙 $\\overrightarrow{AB}+\\overrightarrow{BC} = \\overrightarrow{AC}$, 평행사변형법칙\n- 뺄셈: $\\overrightarrow{OB}-\\overrightarrow{OA} = \\overrightarrow{AB}$\n- 실수배 $k\\vec a$: 크기 $|k||\\vec a|$, $k>0$ 이면 같은 방향\n- 평행: $\\vec b = k\\vec a$ ($k\\ne0$)',
      },
      {
        title: '위치벡터',
        body: '기준점 O 에 대하여 $\\overrightarrow{OA} = \\vec a$ 를 점 A 의 위치벡터라 해요.\n- 선분 AB 를 $m:n$ 으로 내분하는 점: $\\frac{m\\vec b+n\\vec a}{m+n}$\n- 삼각형 ABC 의 무게중심: $\\frac{\\vec a+\\vec b+\\vec c}{3}$\n- 공통수학2의 내분점 공식과 같은 모양이에요.',
      },
      {
        title: '벡터의 성분',
        body: '$\\vec a = (a_1, a_2)$, $\\vec b = (b_1, b_2)$ 일 때\n- $\\vec a\\pm\\vec b = (a_1\\pm b_1, a_2\\pm b_2)$, $k\\vec a = (ka_1, ka_2)$\n- $|\\vec a| = \\sqrt{a_1^{2}+a_2^{2}}$\n- A$(x_1,y_1)$, B$(x_2,y_2)$: $\\overrightarrow{AB} = (x_2-x_1, y_2-y_1)$',
        example: { q: '$\\vec a=(1,2)$, $\\vec b=(3,-1)$ 일 때 $2\\vec a-\\vec b$', a: '$(2-3, 4+1) = (-1, 5)$' },
      },
    ],
    skills: [
      {
        id: 'components',
        title: '벡터의 성분 계산',
        gen(r, level) {
          const a = [r.int(-5, 5), r.int(-5, 5)],
            b = [r.int(-5, 5), r.int(-5, 5)];
          if (level === 1) {
            const p = r.nonzero(-3, 3),
              q = r.nonzero(-3, 3);
            const res = [p * a[0] + q * b[0], p * a[1] + q * b[1]];
            const ex = `${coef(p)}\\vec{a}${q > 0 ? '+' : '-'}${coef(Math.abs(q))}\\vec{b}`;
            return {
              q: `두 벡터 $\\vec a = ${vec(...a)}$, $\\vec b = ${vec(...b)}$ 에 대하여 $${ex} = (x, y)$ 일 때 $x$, $y$ 를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'x', value: res[0] }, { label: 'y', value: res[1] }] },
              steps: [`$${coef(p)}\\vec a = ${vec(p * a[0], p * a[1])}$, $${coef(q)}\\vec b = ${vec(q * b[0], q * b[1])}$`, `합: $${vec(...res)}$`],
            };
          }
          if (level === 2) {
            const A = [r.int(-4, 4), r.int(-4, 4)],
              B = [r.int(-4, 4), r.int(-4, 4)],
              C = [r.int(-4, 4), r.int(-4, 4)];
            const AB = [B[0] - A[0], B[1] - A[1]],
              AC = [C[0] - A[0], C[1] - A[1]];
            const res = [2 * AB[0] - AC[0], 2 * AB[1] - AC[1]];
            return {
              q: `세 점 A$${vec(...A)}$, B$${vec(...B)}$, C$${vec(...C)}$ 에 대하여 $2\\overrightarrow{AB}-\\overrightarrow{AC} = (x, y)$ 일 때 $x$, $y$ 를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'x', value: res[0] }, { label: 'y', value: res[1] }] },
              steps: [`$\\overrightarrow{AB} = ${vec(...AB)}$, $\\overrightarrow{AC} = ${vec(...AC)}$`, `$2\\overrightarrow{AB}-\\overrightarrow{AC} = ${vec(...res)}$`],
            };
          }
          if (a[0] * b[1] - a[1] * b[0] === 0) return this.gen(r, level);
          const x = r.nonzero(-3, 3),
            y = r.nonzero(-3, 3);
          const c = [x * a[0] + y * b[0], x * a[1] + y * b[1]];
          return {
            q: `세 벡터 $\\vec a = ${vec(...a)}$, $\\vec b = ${vec(...b)}$, $\\vec c = ${vec(...c)}$ 에 대하여 $\\vec c = m\\vec a+n\\vec b$ 를 만족시키는 실수 $m$, $n$ 을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'm', value: x }, { label: 'n', value: y }] },
            steps: [`$${vec(...c)} = (${termsTex([{ c: a[0], v: 'm' }, { c: b[0], v: 'n' }])}, ${termsTex([{ c: a[1], v: 'm' }, { c: b[1], v: 'n' }])})$`, `연립하면 $m = ${x}$, $n = ${y}$`],
          };
        },
      },
      {
        id: 'magnitude',
        title: '벡터의 크기',
        gen(r, level) {
          if (level === 1) {
            const [p, q, h] = r.pick(TRIPLES.slice(0, 5));
            const A = [r.int(-4, 4), r.int(-4, 4)];
            const [dx, dy] = r.chance(0.5) ? [p * r.sign(), q * r.sign()] : [q * r.sign(), p * r.sign()];
            const B = [A[0] + dx, A[1] + dy];
            return {
              q: `두 점 A$${vec(...A)}$, B$${vec(...B)}$ 에 대하여 $|\\overrightarrow{AB}|$ 를 구하세요.`,
              answer: { type: 'num', value: h },
              steps: [`$\\overrightarrow{AB} = ${vec(dx, dy)}$`, `$|\\overrightarrow{AB}| = \\sqrt{${dx * dx}+${dy * dy}} = ${h}$`],
            };
          }
          const a = [r.int(-4, 4), r.int(-4, 4)],
            b = [r.int(-4, 4), r.int(-4, 4)];
          if (level === 2) {
            const p = r.nonzero(-3, 3),
              q = r.nonzero(-3, 3);
            const v = [p * a[0] + q * b[0], p * a[1] + q * b[1]];
            const N = v[0] ** 2 + v[1] ** 2;
            if (N === 0) return this.gen(r, level);
            const ex = `${coef(p)}\\vec{a}${q > 0 ? '+' : '-'}${coef(Math.abs(q))}\\vec{b}`;
            const right = sqrtTex(N);
            const wrongs = [sqrtTex(Math.abs(v[0]) + Math.abs(v[1]) || 2), sqrtTex(N + 2), String(Math.abs(v[0]) + Math.abs(v[1])), sqrtTex(Math.max(1, N - 2)), String(N)].filter((w) => w !== right);
            return {
              q: `두 벡터 $\\vec a = ${vec(...a)}$, $\\vec b = ${vec(...b)}$ 에 대하여 $|${ex}|$ 의 값은?`,
              answer: texChoices(r, right, wrongs),
              steps: [`$${ex} = ${vec(...v)}$`, `$\\sqrt{${v[0] ** 2}+${v[1] ** 2}} = ${right}$`],
            };
          }
          // |a + k b| = √M 인 k
          const bb = b[0] ** 2 + b[1] ** 2;
          if (bb === 0) return this.gen(r, level);
          const k0 = r.int(-3, 3);
          const M = (a[0] + k0 * b[0]) ** 2 + (a[1] + k0 * b[1]) ** 2;
          const ab = a[0] * b[0] + a[1] * b[1];
          const k1 = fr(-2 * ab, bb).sub(k0);
          return {
            q: `두 벡터 $\\vec a = ${vec(...a)}$, $\\vec b = ${vec(...b)}$ 에 대하여 $|\\vec a+k\\vec b| = ${sqrtTex(M)}$ 을 만족시키는 실수 $k$ 의 값을 모두 구하세요.`,
            answer: { type: 'set', values: k1.eq(k0) ? [k0] : [k0, k1.value] },
            steps: [`$\\vec a+k\\vec b = (${linTex(b[0], a[0], 'k')}, ${linTex(b[1], a[1], 'k')})$`, `$(${linTex(b[0], a[0], 'k')})^{2}+(${linTex(b[1], a[1], 'k')})^{2} = ${M}$ → $${poly([bb, 2 * ab, a[0] ** 2 + a[1] ** 2 - M], 'k')} = 0$`, `$k = ${k0}$${k1.eq(k0) ? ' (중근)' : ` 또는 $k = ${T(k1)}$`}`],
          };
        },
      },
      {
        id: 'parallel',
        title: '벡터의 평행',
        gen(r, level) {
          if (level === 1) {
            const b1 = r.nonzero(-4, 4),
              b2 = r.nonzero(-6, 6),
              a1 = r.nonzero(-6, 6);
            const k = fr(a1 * b2, b1);
            return {
              q: `두 벡터 $\\vec a = (${a1}, k)$, $\\vec b = ${vec(b1, b2)}$ 가 서로 평행할 때, $k$ 의 값을 구하세요.`,
              answer: fAns(k),
              steps: [`$\\vec a = t\\vec b$ 로 놓으면 $${a1} = ${b1}t$, $k = ${b2}t$`, `$t = ${T(fr(a1, b1))}$, $k = ${T(k)}$`],
            };
          }
          const a = [r.int(-4, 4), r.int(-4, 4)],
            b = [r.nonzero(-4, 4), r.int(-4, 4)],
            c = [r.nonzero(-4, 4), r.nonzero(-4, 4)];
          if (level === 2) {
            const den = b[0] * c[1] - b[1] * c[0];
            // 영벡터·이미 평행인 a (t=0 이 답) 나 a∥b (a+tb 가 영벡터가 될 수 있음) 는 제외
            if (den === 0 || a[0] * c[1] - a[1] * c[0] === 0 || a[0] * b[1] - a[1] * b[0] === 0) return this.gen(r, level);
            const t = fr(a[1] * c[0] - a[0] * c[1], den);
            return {
              q: `세 벡터 $\\vec a = ${vec(...a)}$, $\\vec b = ${vec(...b)}$, $\\vec c = ${vec(...c)}$ 에 대하여 $\\vec a+t\\vec b$ 와 $\\vec c$ 가 평행할 때, 실수 $t$ 의 값은?`,
              answer: fChoices(r, t, [t.neg(), t.add(1), t.mul(2), fr(den, a[1] * c[0] - a[0] * c[1] || 1)]),
              steps: [`$\\vec a+t\\vec b = (${linTex(b[0], a[0], 't')}, ${linTex(b[1], a[1], 't')})$`, `평행 조건: $(${linTex(b[0], a[0], 't')})\\times${pr(c[1])} = (${linTex(b[1], a[1], 't')})\\times${pr(c[0])}$`, `$t = ${T(t)}$`],
            };
          }
          const A = [r.int(-3, 3), r.int(-3, 3)];
          const d = [r.nonzero(-3, 3), r.nonzero(-3, 3)];
          const B = [A[0] + d[0], A[1] + d[1]];
          const s = r.pick([-3, -2, -1, 2, 3]); // s=1 이면 C 가 B 와 같은 점
          const C = [A[0] + s * d[0], A[1] + s * d[1]];
          return {
            q: `세 점 A$${vec(...A)}$, B$${vec(...B)}$, C$(k, ${C[1]})$ 가 한 직선 위에 있을 때, $k$ 의 값을 구하세요.`,
            answer: { type: 'num', value: C[0] },
            steps: [`$\\overrightarrow{AC} = t\\overrightarrow{AB}$: $(k-${pr(A[0])}, ${C[1] - A[1]}) = t${vec(...d)}$`, `$t = ${s}$`, `$k = ${A[0]}+${pr(s * d[0])} = ${C[0]}$`],
          };
        },
      },
      {
        id: 'division',
        title: '위치벡터와 내분점·무게중심',
        gen(r, level) {
          if (level === 1) {
            const m = r.int(1, 3);
            const n = gcd(m, r.int(1, 3)) > 1 ? 1 : r.int(1, 3);
            if (gcd(m, n) > 1) return this.gen(r, level);
            const A = [r.int(-4, 4), r.int(-4, 4)];
            const d = [r.int(-2, 2), r.int(-2, 2)];
            if (d[0] === 0 && d[1] === 0) d[0] = 1;
            const B = [A[0] + (m + n) * d[0], A[1] + (m + n) * d[1]];
            const P = [A[0] + m * d[0], A[1] + m * d[1]];
            return {
              q: `두 점 A, B 의 위치벡터가 $\\vec a = ${vec(...A)}$, $\\vec b = ${vec(...B)}$ 일 때, 선분 AB 를 $${m}:${n}$ ${ro(n)} 내분하는 점 P 의 위치벡터 $\\vec p = (x, y)$ 를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'x', value: P[0] }, { label: 'y', value: P[1] }] },
              steps: [`$\\vec p = \\frac{${m}\\vec b+${n}\\vec a}{${m + n}}$`, `$= \\left(\\frac{${m * B[0] + n * A[0]}}{${m + n}}, \\frac{${m * B[1] + n * A[1]}}{${m + n}}\\right) = ${vec(...P)}$`],
            };
          }
          if (level === 2) {
            const A = [r.int(-5, 5), r.int(-5, 5)],
              B = [r.int(-5, 5), r.int(-5, 5)];
            const G = [r.int(-3, 3), r.int(-3, 3)];
            const C = [3 * G[0] - A[0] - B[0], 3 * G[1] - A[1] - B[1]];
            return {
              q: `세 점 A$${vec(...A)}$, B$${vec(...B)}$, C$${vec(...C)}$ 를 꼭짓점으로 하는 삼각형 ABC 의 무게중심 G 의 좌표를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'x', value: G[0] }, { label: 'y', value: G[1] }] },
              steps: [`$\\vec g = \\frac{\\vec a+\\vec b+\\vec c}{3}$`, `$= \\left(\\frac{${A[0] + B[0] + C[0]}}{3}, \\frac{${A[1] + B[1] + C[1]}}{3}\\right) = ${vec(...G)}$`],
            };
          }
          const A = [r.int(-4, 4), r.int(-4, 4)],
            B = [r.int(-4, 4), r.int(-4, 4)],
            C = [r.int(-4, 4), r.int(-4, 4)];
          if ((B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]) === 0) return this.gen(r, level);
          const D = [A[0] + C[0] - B[0], A[1] + C[1] - B[1]];
          return {
            q: `세 점 A$${vec(...A)}$, B$${vec(...B)}$, C$${vec(...C)}$ 에 대하여 사각형 ABCD 가 평행사변형이 되도록 하는 점 D 의 좌표를 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'x', value: D[0] }, { label: 'y', value: D[1] }] },
            steps: [`평행사변형이면 $\\overrightarrow{AD} = \\overrightarrow{BC}$, 즉 $\\vec d = \\vec a+\\vec c-\\vec b$`, `$\\vec d = ${vec(...D)}$`],
          };
        },
      },
      {
        id: 'express',
        title: '도형에서 벡터 나타내기',
        gen(r, level) {
          if (level === 1) {
            // 정육각형 ABCDEF, AB = a, AF = b
            const cand: [string, string][] = [
              ['AD', '2\\vec{a}+2\\vec{b}'],
              ['AC', '2\\vec{a}+\\vec{b}'],
              ['AE', '\\vec{a}+2\\vec{b}'],
              ['BF', '-\\vec{a}+\\vec{b}'],
              ['BD', '\\vec{a}+2\\vec{b}'],
              ['FC', '2\\vec{a}'],
              ['AO', '\\vec{a}+\\vec{b}'],
            ];
            const [name, right] = r.pick(cand);
            const pool = ['2\\vec{a}+2\\vec{b}', '2\\vec{a}+\\vec{b}', '\\vec{a}+2\\vec{b}', '-\\vec{a}+\\vec{b}', '2\\vec{a}', '\\vec{a}+\\vec{b}', '\\vec{a}-\\vec{b}', '2\\vec{b}', '\\vec{a}+3\\vec{b}'];
            const pts = regularPolygon(6, 110, 95, 75, 180);
            const s = new Svg(220, 190);
            s.poly(pts);
            const lab = ['A', 'B', 'C', 'D', 'E', 'F'];
            // A 왼쪽, 시계 반대 방향으로 B(왼쪽 아래)…: regularPolygon 은 y 아래 방향이므로 순서대로 배치
            pts.forEach(([x, y], i) => s.text(110 + (x - 110) * 1.18, 95 + (y - 95) * 1.18, lab[i], { size: 13 }));
            s.dot(110, 95).text(118, 88, 'O', { size: 12 });
            s.line(pts[0][0], pts[0][1], pts[1][0], pts[1][1], { cls: 'acc', width: 2.5, arrow: true });
            s.line(pts[0][0], pts[0][1], pts[5][0], pts[5][1], { cls: 'acc2', width: 2.5, arrow: true });
            return {
              q: `그림과 같이 중심이 O 인 정육각형 ABCDEF 에서 $\\overrightarrow{AB} = \\vec a$, $\\overrightarrow{AF} = \\vec b$ 일 때, $\\overrightarrow{${name}}$ 를 $\\vec a$, $\\vec b$ 로 나타낸 것은?`,
              fig: s.toString(),
              answer: texChoices(r, right, pool.filter((p) => p !== right)),
              steps: [`사각형 ABOF 는 마름모이므로 $\\overrightarrow{AO} = \\vec a+\\vec b$, 또 $\\overrightarrow{BC} = \\overrightarrow{FE} = \\overrightarrow{AO}$, $\\overrightarrow{CD} = \\vec b$`, `$\\overrightarrow{${name}} = ${right}$`],
            };
          }
          // 삼각형 ABC, AB = a, AC = b, BC 를 m:n 으로 내분하는 점 P
          const m = level === 2 ? 1 : r.int(1, 4);
          const n = level === 2 ? 1 : r.int(1, 4);
          if (level === 3 && gcd(m, n) > 1) return this.gen(r, level);
          const g = gcd(m, n);
          const mm = m / g,
            nn = n / g;
          const S = mm + nn;
          const ab = (p: number, q: number, den: number) => {
            const P = fr(p, den),
              Q = fr(q, den);
            const term = (f: F, v: string) => (f.eq(0) ? '' : f.eq(1) ? v : f.eq(-1) ? `-${v}` : `${f.tex()}${v}`);
            const t1 = term(P, '\\vec{a}'),
              t2 = term(Q, '\\vec{b}');
            if (!t1) return t2 || '\\vec{0}';
            if (!t2) return t1;
            return t1 + (t2.startsWith('-') ? t2 : '+' + t2);
          };
          const right = ab(nn, mm, S);
          const wrongs = [ab(mm, nn, S), ab(nn, mm, S + 1), ab(1, 1, 1), ab(-nn, mm, S), ab(nn, -mm, S), ab(1, 1, 2), ab(1, 1, 3)].filter((w) => w !== right);
          const what = level === 2 ? `변 BC 의 중점 M 에 대하여 $\\overrightarrow{AM}$` : `변 BC 를 $${m}:${n}$ ${ro(n)} 내분하는 점 P 에 대하여 $\\overrightarrow{AP}$`;
          return {
            q: `삼각형 ABC 에서 $\\overrightarrow{AB} = \\vec a$, $\\overrightarrow{AC} = \\vec b$ 라 하자. ${what} 를 $\\vec a$, $\\vec b$ 로 나타낸 것은?`,
            answer: texChoices(r, right, wrongs),
            steps: [`내분점의 위치벡터 (A 기준): $\\frac{${m}\\overrightarrow{AC}+${n}\\overrightarrow{AB}}{${m + n}}$`, `$= ${right}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── geo-4 벡터의 내적
  'geo-4': {
    concepts: [
      {
        title: '벡터의 내적',
        body: '두 벡터 $\\vec a$, $\\vec b$ 가 이루는 각이 $\\theta$ ($0\\le\\theta\\le\\pi$) 일 때\n$$\\vec a\\cdot\\vec b = |\\vec a||\\vec b|\\cos\\theta$$\n- 성분: $\\vec a\\cdot\\vec b = a_1b_1+a_2b_2$\n- $\\vec a\\cdot\\vec a = |\\vec a|^{2}$\n- 교환·분배법칙이 성립해요.',
        example: { q: '$|\\vec a|=2$, $|\\vec b|=3$, $\\theta=60^{\\circ}$', a: '$\\vec a\\cdot\\vec b = 2\\cdot3\\cdot\\frac12 = 3$' },
      },
      {
        title: '두 벡터가 이루는 각과 수직',
        body: '$$\\cos\\theta = \\frac{\\vec a\\cdot\\vec b}{|\\vec a||\\vec b|}$$\n- $\\vec a\\perp\\vec b \\iff \\vec a\\cdot\\vec b = 0$\n- $\\vec a\\parallel\\vec b \\iff \\vec a\\cdot\\vec b = \\pm|\\vec a||\\vec b|$',
      },
      {
        title: '직선의 벡터방정식',
        body: '점 A$(x_1, y_1)$ 을 지나고 방향벡터가 $\\vec u = (u_1, u_2)$ 인 직선:\n$$\\vec p = \\vec a+t\\vec u,\\quad \\frac{x-x_1}{u_1} = \\frac{y-y_1}{u_2}$$\n- 법선벡터 $\\vec n = (a, b)$ 에 수직: $a(x-x_1)+b(y-y_1)=0$\n- 두 직선이 이루는 각: 방향벡터가 이루는 각 (예각으로 $\\cos\\theta = \\frac{|\\vec u\\cdot\\vec v|}{|\\vec u||\\vec v|}$)',
      },
      {
        title: '원의 벡터방정식',
        body: '- 중심 C, 반지름 $r$: $|\\vec p-\\vec c| = r$\n- 두 점 A, B 를 지름의 양 끝으로 하는 원: $(\\vec p-\\vec a)\\cdot(\\vec p-\\vec b) = 0$',
      },
    ],
    skills: [
      {
        id: 'dot-comp',
        title: '성분으로 내적 계산',
        gen(r, level) {
          const a = [r.int(-5, 5), r.int(-5, 5)],
            b = [r.int(-5, 5), r.int(-5, 5)];
          if (a[0] + b[0] === 0 && a[1] + b[1] === 0) return this.gen(r, level);
          const dot = (u: number[], v: number[]) => u[0] * v[0] + u[1] * v[1];
          if (level === 1) {
            return {
              q: `두 벡터 $\\vec a = ${vec(...a)}$, $\\vec b = ${vec(...b)}$ 의 내적 $\\vec a\\cdot\\vec b$ 를 구하세요.`,
              answer: { type: 'num', value: dot(a, b) },
              steps: [`$${a[0]}\\times${pr(b[0])}+${pr(a[1])}\\times${pr(b[1])} = ${dot(a, b)}$`],
            };
          }
          if (level === 2) {
            const u = [a[0] + b[0], a[1] + b[1]],
              v = [a[0] - 2 * b[0], a[1] - 2 * b[1]];
            const ans = dot(u, v);
            return {
              q: `두 벡터 $\\vec a = ${vec(...a)}$, $\\vec b = ${vec(...b)}$ 에 대하여 $(\\vec a+\\vec b)\\cdot(\\vec a-2\\vec b)$ 의 값은?`,
              answer: makeChoices(r, `$${ans}$`, [dot(a, a) - 2 * dot(b, b), dot(a, a) + dot(a, b) - 2 * dot(b, b), dot(u, u), ans + 2 * dot(a, b), -ans].filter((x) => x !== ans).map((x) => `$${x}$`), 5, (i) => `$${ans + i + 1}$`),
              steps: [`$\\vec a+\\vec b = ${vec(...u)}$, $\\vec a-2\\vec b = ${vec(...v)}$`, `내적: $${u[0]}\\times${pr(v[0])}+${pr(u[1])}\\times${pr(v[1])} = ${ans}$`],
            };
          }
          const p = r.int(1, 6),
            q = r.int(1, 6);
          const d = r.int(-p * q + 1, p * q - 1);
          const S = p * p + q * q + 2 * d; // |a+b|²
          const ans = fr(d);
          return {
            q: `두 벡터 $\\vec a$, $\\vec b$ 에 대하여 $|\\vec a| = ${p}$, $|\\vec b| = ${q}$, $|\\vec a+\\vec b| = ${sqrtTex(S)}$ 일 때, $\\vec a\\cdot\\vec b$ 의 값을 구하세요.`,
            answer: fAns(ans),
            steps: [`$|\\vec a+\\vec b|^{2} = |\\vec a|^{2}+2\\vec a\\cdot\\vec b+|\\vec b|^{2}$`, `$${S} = ${p * p}+2\\vec a\\cdot\\vec b+${q * q}$`, `$\\vec a\\cdot\\vec b = ${d}$`],
          };
        },
      },
      {
        id: 'dot-angle',
        title: '크기와 각으로 내적 계산',
        gen(r, level) {
          const p = r.int(1, 6),
            q = r.int(1, 6);
          const th = r.pick([60, 120, 90, 0, 180]);
          const cos = { 0: fr(1), 60: fr(1, 2), 90: fr(0), 120: fr(-1, 2), 180: fr(-1) }[th]!;
          const D = cos.mul(p * q);
          if (level === 1) {
            return {
              q: `$|\\vec a| = ${p}$, $|\\vec b| = ${q}$ 이고 두 벡터 $\\vec a$, $\\vec b$ 가 이루는 각의 크기가 $${deg(th)}$ 일 때, $\\vec a\\cdot\\vec b$ 를 구하세요.`,
              answer: fAns(D),
              steps: [`$\\vec a\\cdot\\vec b = ${p}\\times${q}\\times\\cos${deg(th)} = ${p * q}\\times\\left(${cos.tex()}\\right)$`, `$= ${T(D)}$`],
            };
          }
          if (level === 2) {
            const minus = r.chance(0.5);
            const N = fr(p * p + q * q).add(D.mul(minus ? -2 : 2));
            if (!N.isInt() || N.n <= 0) return this.gen(r, level);
            const right = sqrtTex(N.n);
            const alt = fr(p * p + q * q).add(D.mul(minus ? 2 : -2));
            const wrongs = [sqrtTex(p * p + q * q), alt.isInt() && alt.n > 0 ? sqrtTex(alt.n) : String(p + q), String(minus ? Math.abs(p - q) || p + q : p + q), sqrtTex(N.n + 1), sqrtTex(Math.max(1, N.n - 1))].filter((w) => w !== right);
            return {
              q: `$|\\vec a| = ${p}$, $|\\vec b| = ${q}$ 이고 두 벡터가 이루는 각의 크기가 $${deg(th)}$ 일 때, $|\\vec a${minus ? '-' : '+'}\\vec b|$ 의 값은?`,
              answer: texChoices(r, right, wrongs),
              steps: [`$\\vec a\\cdot\\vec b = ${T(D)}$`, `$|\\vec a${minus ? '-' : '+'}\\vec b|^{2} = ${p * p}${minus ? '-' : '+'}2\\times\\left(${T(D)}\\right)+${q * q} = ${N.n}$`, `$|\\vec a${minus ? '-' : '+'}\\vec b| = ${right}$`],
            };
          }
          const ans = fr(2 * p * p - 3 * q * q).add(D.mul(5));
          return {
            q: `$|\\vec a| = ${p}$, $|\\vec b| = ${q}$ 이고 두 벡터가 이루는 각의 크기가 $${deg(th)}$ 일 때, $(2\\vec a-\\vec b)\\cdot(\\vec a+3\\vec b)$ 의 값을 구하세요.`,
            answer: fAns(ans),
            steps: [`전개: $2|\\vec a|^{2}+5\\vec a\\cdot\\vec b-3|\\vec b|^{2}$`, `$\\vec a\\cdot\\vec b = ${T(D)}$`, `$${2 * p * p}+5\\times\\left(${T(D)}\\right)-${3 * q * q} = ${T(ans)}$`],
          };
        },
      },
      {
        id: 'angle',
        title: '두 벡터가 이루는 각',
        gen(r, level) {
          const opts = [30, 45, 60, 90, 120, 135, 150];
          const choice = (th: number) => makeChoices(r, `$${deg(th)}$`, opts.filter((o) => o !== th).map((o) => `$${deg(o)}$`), 5);
          if (level <= 2) {
            const p = r.nonzero(-3, 3),
              q = r.nonzero(-3, 3),
              k = r.int(1, 2);
            const th = level === 1 ? r.pick([90, 45]) : r.pick([45, 135, 90]);
            const b = th === 90 ? [-q * k, p * k] : th === 45 ? [k * (p - q), k * (p + q)] : [k * (-p - q), k * (p - q)];
            const a = [p, q];
            const dot = a[0] * b[0] + a[1] * b[1];
            const na = p * p + q * q,
              nb = b[0] ** 2 + b[1] ** 2;
            return {
              q: `두 벡터 $\\vec a = ${vec(...a)}$, $\\vec b = ${vec(...b)}$ 가 이루는 각의 크기는?`,
              answer: choice(th),
              steps: [`$\\vec a\\cdot\\vec b = ${dot}$, $|\\vec a| = ${sqrtTex(na)}$, $|\\vec b| = ${sqrtTex(nb)}$`, `$\\cos\\theta = \\frac{${dot}}{${sqrtTex(na)}\\times${sqrtTex(nb)}} = ${cosTex(dot, na * nb)}$`, `$\\theta = ${deg(th)}$`],
            };
          }
          const p = r.int(1, 6),
            q = r.int(1, 6);
          const th = r.pick([60, 90, 120]);
          const d = th === 60 ? fr(p * q, 2) : th === 90 ? fr(0) : fr(-p * q, 2);
          const S = fr(p * p + q * q).sub(d.mul(2));
          return {
            q: `$|\\vec a| = ${p}$, $|\\vec b| = ${q}$, $|\\vec a-\\vec b| = ${sqrtTex(S.n)}$ 일 때, 두 벡터 $\\vec a$, $\\vec b$ 가 이루는 각의 크기는?`,
            answer: choice(th),
            steps: [`$|\\vec a-\\vec b|^{2} = |\\vec a|^{2}-2\\vec a\\cdot\\vec b+|\\vec b|^{2}$ 에서 $${S.n} = ${p * p + q * q}-2\\vec a\\cdot\\vec b$`, `$\\vec a\\cdot\\vec b = ${T(d)}$`, `$\\cos\\theta = \\frac{${T(d)}}{${p * q}} = ${T(d.div(p * q))}$, $\\theta = ${deg(th)}$`],
          };
        },
      },
      {
        id: 'perpendicular',
        title: '벡터의 수직 조건',
        gen(r, level) {
          if (level === 1) {
            const a1 = r.nonzero(-5, 5),
              b1 = r.nonzero(-5, 5),
              b2 = r.nonzero(-5, 5);
            const k = fr(-a1 * b1, b2);
            return {
              q: `두 벡터 $\\vec a = (${a1}, k)$, $\\vec b = ${vec(b1, b2)}$ 가 서로 수직일 때, $k$ 의 값을 구하세요.`,
              answer: fAns(k),
              steps: [`$\\vec a\\cdot\\vec b = ${a1}\\times${pr(b1)}+${pr(b2)}k = 0$`, `$k = ${T(k)}$`],
            };
          }
          if (level === 2) {
            const a = [r.int(-5, 5), r.int(-5, 5)],
              b = [r.nonzero(-4, 4), r.int(-4, 4)];
            const ab = a[0] * b[0] + a[1] * b[1],
              bb = b[0] ** 2 + b[1] ** 2;
            const t = fr(-ab, bb);
            return {
              q: `두 벡터 $\\vec a = ${vec(...a)}$, $\\vec b = ${vec(...b)}$ 에 대하여 $\\vec a+t\\vec b$ 와 $\\vec b$ 가 서로 수직일 때, 실수 $t$ 의 값은?`,
              answer: fChoices(r, t, [t.neg(), fr(-bb, ab || 1), fr(-ab, a[0] ** 2 + a[1] ** 2 || 1), t.add(1)]),
              steps: [`$(\\vec a+t\\vec b)\\cdot\\vec b = \\vec a\\cdot\\vec b+t|\\vec b|^{2} = 0$`, `$${ab}+${bb}t = 0$, $t = ${T(t)}$`],
            };
          }
          const p = r.int(1, 5),
            q = r.int(1, 5);
          const th = r.pick([60, 120, 90]);
          const d = th === 60 ? fr(p * q, 2) : th === 90 ? fr(0) : fr(-p * q, 2);
          const den = fr(q * q).sub(d);
          if (den.eq(0)) return this.gen(r, level);
          const k = fr(p * p).sub(d).div(den);
          return {
            q: `$|\\vec a| = ${p}$, $|\\vec b| = ${q}$ 이고 두 벡터가 이루는 각의 크기가 $${deg(th)}$ 일 때, $\\vec a+k\\vec b$ 와 $\\vec a-\\vec b$ 가 서로 수직이 되도록 하는 실수 $k$ 의 값을 구하세요.`,
            answer: fAns(k),
            steps: [`$\\vec a\\cdot\\vec b = ${T(d)}$`, `$(\\vec a+k\\vec b)\\cdot(\\vec a-\\vec b) = |\\vec a|^{2}-\\vec a\\cdot\\vec b+k(\\vec a\\cdot\\vec b-|\\vec b|^{2}) = 0$`, `$${T(fr(p * p).sub(d))}+k\\left(${T(d.sub(q * q))}\\right) = 0$ → $k = ${T(k)}$`],
          };
        },
      },
      {
        id: 'line-angle',
        title: '직선의 방정식과 두 직선이 이루는 각',
        gen(r, level) {
          const x1 = r.int(-4, 4),
            y1 = r.int(-4, 4),
            x2 = r.int(-4, 4),
            y2 = r.int(-4, 4);
          const frm = (x0: number, y0: number, u1: number | string, u2: number | string) => `\\frac{${linTex(1, -x0)}}{${u1}} = \\frac{${linTex(1, -y0, 'y')}}{${u2}}`;
          if (level <= 2) {
            const u1 = r.nonzero(-4, 4),
              u2 = r.nonzero(-4, 4),
              v1 = r.nonzero(-4, 4);
            const k = level === 1 ? fr(-u1 * v1, u2) : fr(v1 * u2, u1);
            if (k.eq(0)) return this.gen(r, level);
            return {
              q: `두 직선 $${frm(x1, y1, u1, u2)}$, $${frm(x2, y2, v1, 'k')}$ 가 서로 ${level === 1 ? '수직' : '평행'}일 때, 상수 $k$ 의 값을 구하세요.`,
              answer: fAns(k),
              steps: [`방향벡터 $\\vec u = ${vec(u1, u2)}$, $\\vec v = (${v1}, k)$`, level === 1 ? `$\\vec u\\cdot\\vec v = ${u1 * v1}${u2 > 0 ? '+' : ''}${u2}k = 0$` : `$\\vec v = t\\vec u$: $\\frac{${v1}}{${u1}} = \\frac{k}{${u2}}$`, `$k = ${T(k)}$`],
            };
          }
          const NV: [number, number][] = [
            [3, 4],
            [4, 3],
            [4, -3],
            [5, 12],
            [12, 5],
            [12, -5],
            [1, 0],
            [0, 1],
            [3, -4],
            [6, 8],
            [8, -15],
          ];
          const u = r.pick(NV);
          let v = r.pick(NV);
          // 평행(외적 0)이거나 수직(내적 0)이면 '예각'이 아니므로 다시 고름
          const ok = (w: [number, number]) => u[0] * w[1] - u[1] * w[0] !== 0 && u[0] * w[0] + u[1] * w[1] !== 0;
          for (let i = 0; i < 30 && !ok(v); i++) v = r.pick(NV);
          if (!ok(v)) v = NV.find(ok)!;
          const nu = Math.hypot(...u),
            nv = Math.hypot(...v);
          const ans = fr(Math.abs(u[0] * v[0] + u[1] * v[1]), Math.round(nu * nv));
          const lineTex = (x0: number, y0: number, w: [number, number]) => (w[0] === 0 ? `x=${x0}` : w[1] === 0 ? `y=${y0}` : frm(x0, y0, w[0], w[1]));
          return {
            q: `두 직선 $${lineTex(x1, y1, u)}$, $${lineTex(x2, y2, v)}$ 가 이루는 예각의 크기를 $\\theta$ 라 할 때, $\\cos\\theta$ 의 값을 구하세요.`,
            answer: fAns(ans),
            steps: [`방향벡터 $\\vec u = ${vec(...u)}$, $\\vec v = ${vec(...v)}$`, `$\\cos\\theta = \\frac{|\\vec u\\cdot\\vec v|}{|\\vec u||\\vec v|} = \\frac{${Math.abs(u[0] * v[0] + u[1] * v[1])}}{${nu}\\times${nv}} = ${T(ans)}$`],
          };
        },
      },
      {
        id: 'circle-eq',
        title: '원의 벡터방정식',
        gen(r, level) {
          if (level === 1) {
            const c = [r.int(-5, 5), r.int(-5, 5)],
              rad = r.int(1, 6);
            return {
              q: `점 C 의 위치벡터를 $\\vec c = ${vec(...c)}$ 라 할 때, 벡터방정식 $|\\vec p-\\vec c| = ${rad}$ 가 나타내는 도형은 원입니다. 이 원의 중심의 좌표 $(a, b)$ 와 반지름의 길이 $r$ 를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'a', value: c[0] }, { label: 'b', value: c[1] }, { label: 'r', value: rad }] },
              steps: [`$|\\vec p-\\vec c| = ${rad}$: 점 P 와 C 사이의 거리가 항상 $${rad}$`, `중심 $${vec(...c)}$, 반지름 $${rad}$`],
            };
          }
          const A = [r.int(-5, 5), r.int(-5, 5)];
          const d = [2 * r.int(-3, 3), 2 * r.int(-3, 3)];
          if (d[0] === 0 && d[1] === 0) d[0] = 2;
          const B = [A[0] + d[0], A[1] + d[1]];
          const M = [A[0] + d[0] / 2, A[1] + d[1] / 2];
          const R2 = (d[0] / 2) ** 2 + (d[1] / 2) ** 2;
          const head = `두 점 A, B 의 위치벡터가 각각 $\\vec a = ${vec(...A)}$, $\\vec b = ${vec(...B)}$ 일 때, 벡터방정식 $(\\vec p-\\vec a)\\cdot(\\vec p-\\vec b) = 0$ 이 나타내는 원의`;
          if (level === 2)
            return {
              q: `${head} 중심의 좌표를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'x', value: M[0] }, { label: 'y', value: M[1] }] },
              steps: [`$\\overrightarrow{AP}\\perp\\overrightarrow{BP}$ 이므로 선분 AB 를 지름으로 하는 원`, `중심은 AB 의 중점 $${vec(...M)}$`],
            };
          const right = sqrtTex(R2);
          return {
            q: `${head} 반지름의 길이는?`,
            answer: texChoices(r, right, [sqrtTex(4 * R2), sqrtTex(2 * R2), String(R2), sqrtTex(R2 + 1), sqrtTex(R2 + 4)].filter((w) => w !== right)),
            steps: [`선분 AB 를 지름으로 하는 원`, `$|\\overrightarrow{AB}| = \\sqrt{${d[0] ** 2}+${d[1] ** 2}} = ${sqrtTex(4 * R2)}$`, `반지름 $= ${right}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── geo-5 공간도형과 공간좌표
  'geo-5': {
    concepts: [
      {
        title: '직선과 평면의 위치 관계',
        body: '- 두 직선: 한 점에서 만남, 평행, **꼬인 위치**(만나지도 평행하지도 않음)\n- 직선과 평면: 포함, 한 점에서 만남, 평행\n- 두 평면: 만남(교선), 평행\n- 직선 $l$ 이 평면 위의 서로 만나는 두 직선과 수직이면 $l\\perp$ 평면',
      },
      {
        title: '삼수선의 정리와 이면각',
        body: '평면 $\\alpha$ 밖의 점 P, $\\alpha$ 위의 점 O 와 직선 $l$ 에 대하여 $\\overline{PO}\\perp\\alpha$, $\\overline{OH}\\perp l$ 이면 $\\overline{PH}\\perp l$.\n- 두 평면이 이루는 각(이면각)은 교선에 수직인 두 반직선이 이루는 각으로 재요.',
      },
      {
        title: '정사영',
        body: '도형의 각 점에서 평면에 내린 수선의 발이 만드는 도형이 정사영이에요. 이루는 각이 $\\theta$ 일 때\n- 선분: $l' + "'" + ' = l\\cos\\theta$\n- 넓이: $S' + "'" + ' = S\\cos\\theta$',
        example: { q: '넓이 $10$ 인 삼각형과 평면이 $60^{\\circ}$', a: '$10\\times\\frac12 = 5$' },
      },
      {
        title: '공간좌표',
        body: 'A$(x_1,y_1,z_1)$, B$(x_2,y_2,z_2)$ 에 대하여\n- $\\overline{AB} = \\sqrt{(x_2-x_1)^{2}+(y_2-y_1)^{2}+(z_2-z_1)^{2}}$\n- $m:n$ 내분점 $\\left(\\frac{mx_2+nx_1}{m+n}, \\frac{my_2+ny_1}{m+n}, \\frac{mz_2+nz_1}{m+n}\\right)$\n- 구의 방정식 $(x-a)^{2}+(y-b)^{2}+(z-c)^{2}=r^{2}$\n- 평면좌표의 공식에 $z$ 좌표만 더한 모양이에요.',
      },
    ],
    skills: [
      {
        id: 'solid-lines',
        title: '입체도형에서 직선의 위치 관계',
        gen(r, level) {
          if (level === 1) {
            const s = r.pick([CUBE, PRISM, PYRAMID]);
            const e = r.pick(s.edges);
            const kind = r.pick(s === PYRAMID ? ['skew', 'meet'] : ['skew', 'parallel', 'meet']);
            const P = s.verts[e[0]],
              Q = s.verts[e[1]];
            const u = sub3(P, Q);
            const list = s.edges.filter((f) => {
              if (f === e) return false;
              const share = f.includes(e[0]) || f.includes(e[1]);
              const par = cross0(u, sub3(s.verts[f[0]], s.verts[f[1]]));
              if (kind === 'meet') return share;
              if (kind === 'parallel') return par && !share;
              return !share && !par;
            });
            const nm = { skew: '꼬인 위치에 있는', parallel: '평행한', meet: '한 점에서 만나는' }[kind];
            return {
              q: `그림의 ${s.name} 에서 모서리 ${e} 와 ${nm} 모서리의 개수를 구하세요.`,
              fig: solidFig(s, [e]),
              answer: { type: 'num', value: list.length, unit: '개' },
              steps: [`${nm} 모서리: ${list.length ? list.join(', ') : '없음'}`, `$${list.length}$개`],
            };
          }
          // 정육면체에서 두 직선이 이루는 각 (모서리·면의 대각선 / L3 대각선 cos)
          const V = CUBE.verts;
          const names = Object.keys(V);
          const segOK = (s: string) => {
            const d = sub3(V[s[0]], V[s[1]]);
            const nz = d.filter((x) => x !== 0).length;
            return level === 2 ? nz <= 2 : true;
          };
          const all: string[] = [];
          for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) if (segOK(names[i] + names[j])) all.push(names[i] + names[j]);
          for (let tries = 0; tries < 200; tries++) {
            const s1 = r.pick(all),
              s2 = r.pick(all);
            const u = sub3(V[s1[0]], V[s1[1]]),
              v = sub3(V[s2[0]], V[s2[1]]);
            if (cross0(u, v)) continue;
            const dot = Math.abs(u[0] * v[0] + u[1] * v[1] + u[2] * v[2]);
            const nu = u[0] ** 2 + u[1] ** 2 + u[2] ** 2,
              nv = v[0] ** 2 + v[1] ** 2 + v[2] ** 2;
            if (level === 3 && nu < 3 && nv < 3) continue; // L3: 대각선 하나 이상
            const c2 = (dot * dot) / (nu * nv);
            if (level === 2) {
              const th = c2 === 0 ? 90 : Math.abs(c2 - 0.5) < 1e-9 ? 45 : Math.abs(c2 - 0.25) < 1e-9 ? 60 : -1;
              if (th < 0) continue;
              return {
                q: `그림의 정육면체 ABCD-EFGH 에서 두 직선 ${s1}, ${s2} 가 이루는 각의 크기는? (예각 또는 직각)`,
                fig: solidFig(CUBE, [s1, s2]),
                answer: makeChoices(r, `$${deg(th)}$`, [30, 45, 60, 90].filter((x) => x !== th).map((x) => `$${deg(x)}$`), 4),
                steps: [`한 모서리 길이를 1 로 두고 방향을 비교합니다. (평행이동하여 한 점에서 만나게 하기)`, `방향벡터 ${vec(...u)}, ${vec(...v)}: $\\cos\\theta = \\frac{${dot}}{${sqrtTex(nu)}\\times${sqrtTex(nv)}} = ${cosTex(dot, nu * nv)}$`, `$\\theta = ${deg(th)}$`],
              };
            }
            const right = cosTex(dot, nu * nv);
            const pool = ['0', '\\frac{1}{2}', '\\frac{\\sqrt{2}}{2}', '\\frac{\\sqrt{3}}{3}', '\\frac{\\sqrt{6}}{3}', '\\frac{1}{3}', '\\frac{\\sqrt{3}}{2}', '\\frac{\\sqrt{6}}{6}'];
            return {
              q: `그림의 정육면체 ABCD-EFGH 에서 두 직선 ${s1}, ${s2} 가 이루는 각의 크기를 $\\theta$ 라 할 때, $\\cos\\theta$ 의 값은? (단, $0^{\\circ}<\\theta\\le90^{\\circ}$)`,
              fig: solidFig(CUBE, [s1, s2]),
              answer: texChoices(r, right, pool.filter((p) => p !== right)),
              steps: [`A 를 원점, 모서리 길이를 1 로 하는 좌표를 잡으면 방향벡터 ${vec(...u)}, ${vec(...v)}`, `$\\cos\\theta = \\frac{${dot}}{${sqrtTex(nu)}\\times${sqrtTex(nv)}} = ${right}$`],
            };
          }
          return this.gen(r, 1);
        },
      },
      {
        id: 'distance3',
        title: '공간에서 두 점 사이의 거리',
        gen(r, level) {
          const A = [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)];
          if (level === 1) {
            const qd = r.pick(QUADS);
            const perm = r.shuffle([qd[0], qd[1], qd[2]]).map((v) => v * r.sign());
            const B = A.map((a, i) => a + perm[i]);
            return {
              q: `좌표공간의 두 점 A$${vec(...A)}$, B$${vec(...B)}$ 사이의 거리를 구하세요.`,
              answer: { type: 'num', value: qd[3] },
              steps: [`$\\sqrt{${perm.map((d) => `${pr(d)}^{2}`).join('+')}}$`, `$= \\sqrt{${qd[3] ** 2}} = ${qd[3]}$`],
            };
          }
          if (level === 2) {
            const d = [r.int(-4, 4), r.int(-4, 4), r.nonzero(-4, 4)];
            const B = A.map((a, i) => a + d[i]);
            const N = d[0] ** 2 + d[1] ** 2 + d[2] ** 2;
            const right = sqrtTex(N);
            return {
              q: `좌표공간의 두 점 A$${vec(...A)}$, B$${vec(...B)}$ 에 대하여 선분 AB 의 길이는?`,
              answer: texChoices(r, right, [sqrtTex(d[0] ** 2 + d[1] ** 2 || 1), sqrtTex(N + 2), String(Math.abs(d[0]) + Math.abs(d[1]) + Math.abs(d[2])), sqrtTex(Math.max(1, N - 3)), String(N)].filter((w) => w !== right)),
              steps: [`$\\sqrt{${d[0] ** 2}+${d[1] ** 2}+${d[2] ** 2}} = ${right}$`],
            };
          }
          const B = [A[0] + r.nonzero(-4, 4), r.int(-4, 4), r.int(-4, 4)];
          const nA = A[0] ** 2 + A[1] ** 2 + A[2] ** 2,
            nB = B[0] ** 2 + B[1] ** 2 + B[2] ** 2;
          const x = fr(nB - nA, 2 * (B[0] - A[0]));
          return {
            q: `두 점 A$${vec(...A)}$, B$${vec(...B)}$ 에서 같은 거리에 있는 $x$축 위의 점 P 의 $x$ 좌표를 구하세요.`,
            answer: fAns(x),
            steps: [`P$(x, 0, 0)$: $\\overline{PA}^{2} = \\overline{PB}^{2}$`, `$(x-${pr(A[0])})^{2}+${A[1] ** 2 + A[2] ** 2} = (x-${pr(B[0])})^{2}+${B[1] ** 2 + B[2] ** 2}$`, `$${2 * (B[0] - A[0])}x = ${nB - nA}$, $x = ${T(x)}$`],
          };
        },
      },
      {
        id: 'division3',
        title: '공간에서 내분점·무게중심',
        gen(r, level) {
          if (level === 1) {
            const m = r.int(1, 3),
              n = r.int(1, 3);
            if (gcd(m, n) > 1) return this.gen(r, level);
            const A = [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)];
            const d = [r.int(-2, 2), r.int(-2, 2), r.nonzero(-2, 2)];
            const B = A.map((a, i) => a + (m + n) * d[i]);
            const P = A.map((a, i) => a + m * d[i]);
            return {
              q: `두 점 A$${vec(...A)}$, B$${vec(...B)}$ 에 대하여 선분 AB 를 $${m}:${n}$ ${ro(n)} 내분하는 점의 좌표를 구하세요.`,
              answer: { type: 'fields', fields: ['x', 'y', 'z'].map((l, i) => ({ label: l, value: P[i] })) },
              steps: [`$\\left(\\frac{${m}\\cdot${pr(B[0])}+${n}\\cdot${pr(A[0])}}{${m + n}}, \\ldots\\right)$`, `$= ${vec(...P)}$`],
            };
          }
          if (level === 2) {
            const A = [r.int(-5, 5), r.int(-5, 5), r.int(-5, 5)],
              B = [r.int(-5, 5), r.int(-5, 5), r.int(-5, 5)];
            const G = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)];
            const C = G.map((g, i) => 3 * g - A[i] - B[i]);
            return {
              q: `세 점 A$${vec(...A)}$, B$${vec(...B)}$, C$${vec(...C)}$ 를 꼭짓점으로 하는 삼각형 ABC 의 무게중심의 좌표를 구하세요.`,
              answer: { type: 'fields', fields: ['x', 'y', 'z'].map((l, i) => ({ label: l, value: G[i] })) },
              steps: [`각 좌표의 평균: $\\left(\\frac{${A[0] + B[0] + C[0]}}{3}, \\frac{${A[1] + B[1] + C[1]}}{3}, \\frac{${A[2] + B[2] + C[2]}}{3}\\right)$`, `$= ${vec(...G)}$`],
            };
          }
          const Pp = [r.int(-4, 4), r.int(-4, 4)];
          const d = [r.int(-2, 2), r.int(-2, 2), r.nonzero(-3, 3)];
          const m = r.int(1, 3),
            n = r.int(1, 3);
          if (gcd(m, n) > 1) return this.gen(r, level);
          const A = [Pp[0] - m * d[0], Pp[1] - m * d[1], -m * d[2]];
          const B = [Pp[0] + n * d[0], Pp[1] + n * d[1], n * d[2]];
          return {
            q: `두 점 A$${vec(...A)}$, B$${vec(...B)}$ 를 잇는 선분 AB 가 $xy$평면과 만나는 점의 좌표를 $(a, b, 0)$ 이라 할 때, $a$, $b$ 를 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'a', value: Pp[0] }, { label: 'b', value: Pp[1] }] },
            steps: [`$z$ 좌표가 $${A[2]}$, $${B[2]}$ 이므로 $xy$평면은 선분 AB 를 $${Math.abs(A[2])}:${Math.abs(B[2])} = ${m}:${n}$ ${ro(n)} 내분`, `내분점: $\\left(\\frac{${m}\\cdot${pr(B[0])}+${n}\\cdot${pr(A[0])}}{${m + n}}, \\frac{${m}\\cdot${pr(B[1])}+${n}\\cdot${pr(A[1])}}{${m + n}}, 0\\right) = (${Pp[0]}, ${Pp[1]}, 0)$`],
          };
        },
      },
      {
        id: 'projection',
        title: '정사영',
        gen(r, level) {
          const th = r.pick([30, 45, 60]);
          const cosK: Record<number, [F, number]> = { 30: [fr(1, 2), 3], 45: [fr(1, 2), 2], 60: [fr(1, 2), 1] };
          const [ck, rt] = cosK[th];
          if (level <= 2) {
            const L = r.int(2, 12);
            const right = fSqrt(ck.mul(L), rt);
            const others = [30, 45, 60].filter((t) => t !== th).map((t) => fSqrt(cosK[t][0].mul(L), cosK[t][1]));
            const what = level === 1 ? `길이가 $${L}$ 인 선분 AB` : `넓이가 $${L}$ 인 삼각형`;
            return {
              q: `${what}${level === 1 ? '와' : '과'} 평면 $\\alpha$ 가 이루는 각의 크기가 $${deg(th)}$ 일 때, 평면 $\\alpha$ 위로의 정사영의 ${level === 1 ? '길이' : '넓이'}는?`,
              answer: texChoices(r, right, [...others, fSqrt(F.of(L), 1), fSqrt(fr(L, 4), rt), fSqrt(F.of(L), rt)].filter((w) => w !== right)),
              steps: [`정사영의 ${level === 1 ? '길이' : '넓이'} $= ${L}\\cos${deg(th)}$`, `$\\cos${deg(th)} = ${fSqrt(ck, rt)}$ 이므로 $${right}$`],
            };
          }
          const d = [r.int(-4, 4), r.int(-4, 4), r.nonzero(-4, 4)];
          if (d[0] === 0 && d[1] === 0) d[0] = 1;
          const A = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)];
          const B = A.map((a, i) => a + d[i]);
          const N = d[0] ** 2 + d[1] ** 2;
          const right = sqrtTex(N);
          return {
            q: `좌표공간의 두 점 A$${vec(...A)}$, B$${vec(...B)}$ 에 대하여 선분 AB 의 $xy$평면 위로의 정사영의 길이는?`,
            answer: texChoices(r, right, [...new Set([sqrtTex(N + d[2] ** 2), sqrtTex(d[1] ** 2 + d[2] ** 2 || 1), sqrtTex(d[0] ** 2 + d[2] ** 2 || 2), String(Math.abs(d[0]) + Math.abs(d[1])), sqrtTex(N + 1), sqrtTex(N + 4), sqrtTex(4 * N), String(N + 1)])].filter((w) => w !== right)),
            steps: [`A, B 의 $xy$평면 위로의 정사영: A'$(${A[0]}, ${A[1]}, 0)$, B'$(${B[0]}, ${B[1]}, 0)$`, `$\\overline{A'B'} = \\sqrt{${d[0] ** 2}+${d[1] ** 2}} = ${right}$`],
          };
        },
      },
      {
        id: 'sphere',
        title: '구의 방정식',
        gen(r, level) {
          const c = [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)];
          const rad = r.int(1, 6);
          const fields = () => ({ type: 'fields' as const, fields: [{ label: 'a', value: c[0] }, { label: 'b', value: c[1] }, { label: 'c', value: c[2] }, { label: 'r', value: rad }] });
          if (level === 1) {
            return {
              q: `구 $${shiftSq('x', c[0])}+${shiftSq('y', c[1])}+${shiftSq('z', c[2])}=${rad * rad}$ 의 중심의 좌표 $(a, b, c)$ 와 반지름의 길이 $r$ 를 구하세요.`,
              answer: fields(),
              steps: [`표준형 $(x-a)^{2}+(y-b)^{2}+(z-c)^{2}=r^{2}$ 과 비교`, `중심 $${vec(...c)}$, 반지름 $${rad}$`],
            };
          }
          if (level === 2) {
            const D = c[0] ** 2 + c[1] ** 2 + c[2] ** 2 - rad * rad;
            const lin = (k: number, v: string) => (k === 0 ? '' : `${k > 0 ? '+' : '-'}${coef(Math.abs(k))}${v}`);
            return {
              q: `구 $x^{2}+y^{2}+z^{2}${lin(-2 * c[0], 'x')}${lin(-2 * c[1], 'y')}${lin(-2 * c[2], 'z')}${D === 0 ? '' : sgn(D)}=0$ 의 중심의 좌표 $(a, b, c)$ 와 반지름의 길이 $r$ 를 구하세요.`,
              answer: fields(),
              steps: [`완전제곱식으로: $${shiftSq('x', c[0])}+${shiftSq('y', c[1])}+${shiftSq('z', c[2])}=${rad * rad}$`, `중심 $${vec(...c)}$, 반지름 $${rad}$`],
            };
          }
          const [t1, t2, h] = r.pick(TRIPLES.slice(0, 5));
          const [s, cz] = r.chance(0.5) ? [t1, t2] : [t2, t1];
          const cc = [c[0], c[1], cz * r.sign()];
          return {
            q: `구 $${shiftSq('x', cc[0])}+${shiftSq('y', cc[1])}+${shiftSq('z', cc[2])}=${h * h}$ 와 $xy$평면이 만나서 생기는 원의 반지름의 길이를 구하세요.`,
            answer: { type: 'num', value: s },
            steps: [`구의 중심에서 $xy$평면까지의 거리 $= |${cc[2]}| = ${cz}$`, `원의 반지름 $= \\sqrt{${h}^{2}-${cz}^{2}} = ${s}$`],
          };
        },
      },
    ],
  },
};
void fChoices;
