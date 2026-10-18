// m3h1 그룹 공용 도우미 (중2-2 ~ 공통수학1)
import type { Rng } from '../../core/rng';
import { makeChoices } from '../../core/tex';
import { F } from '../../core/frac';
import { gcd, simplifySqrt, round } from '../../core/nt';
import { Svg } from '../../core/fig';
import { termsTex, linTex, poly } from '../../core/tex';

export const NAMES = ['민수', '서연', '지호', '하은', '도윤', '수아', '준서', '지우', '예준', '채원', '시우', '윤서'];

/** TeX 보기(‘$’ 없이 넘긴 식) → 객관식. fill 도 TeX 를 돌려줌 */
export function mc(r: Rng, correct: string, wrongs: string[], fill?: (i: number) => string, count = 5) {
  return makeChoices(
    r,
    `$${correct}$`,
    wrongs.map((w) => `$${w}$`),
    count,
    fill ? (i) => `$${fill(i)}$` : undefined,
  );
}

/** 일반 문장 보기 */
export function tc(r: Rng, correct: string, wrongs: string[], count = 5) {
  return makeChoices(r, correct, wrongs, count);
}

/** 다항식 곱 (계수 높은 차수부터) */
export function pmul(a: number[], b: number[]): number[] {
  const out = new Array(a.length + b.length - 1).fill(0);
  a.forEach((x, i) => b.forEach((y, j) => (out[i + j] += x * y)));
  return out;
}
export function padd(a: number[], b: number[]): number[] {
  const n = Math.max(a.length, b.length);
  const A = [...new Array(n - a.length).fill(0), ...a];
  const B = [...new Array(n - b.length).fill(0), ...b];
  return A.map((x, i) => x + B[i]);
}
export function pscale(a: number[], k: number): number[] {
  return a.map((x) => x * k);
}
/** 다항식 값 */
export function peval(a: number[], x: number): number {
  return a.reduce((acc, c) => acc * x + c, 0);
}
/** 앞쪽 0 제거 */
export function ptrim(a: number[]): number[] {
  let i = 0;
  while (i < a.length - 1 && a[i] === 0) i++;
  return a.slice(i);
}
/** 다항식 나눗셈 (정수 계수 몫이 나오는 경우를 가정, 최고차 계수로 나눔) */
export function pdiv(a: number[], b: number[]): { q: number[]; r: number[] } {
  const A = a.slice();
  const q: number[] = [];
  const db = b.length - 1;
  for (let i = 0; i + db < A.length; i++) {
    const c = A[i] / b[0];
    q.push(c);
    for (let j = 0; j < b.length; j++) A[i + j] -= c * b[j];
  }
  const r = ptrim(A.slice(A.length - db).map((x) => round(x)));
  return { q: q.map((x) => round(x)), r: db === 0 ? [0] : r };
}

/** 괄호 친 일차식: (x-3), 상수항 0 이면 x 또는 2x */
export function fac(a: number, b: number, v = 'x'): string {
  if (b === 0) return a === 1 ? v : a === -1 ? `-${v}` : `${a}${v}`;
  return `(${linTex(a, b, v)})`;
}

/** p + q√r */
export function surd(p: number | F, q: number | F, r: number): string {
  if (r === 1) return F.of(p).add(q).tex();
  return termsTex([
    { c: p, v: '' },
    { c: q, v: `\\sqrt{${r}}` },
  ]);
}

/** (nb ± √D)/den 를 간단히 한 TeX (D>0) */
export function rootsTex(nb: number, D: number, den: number): string {
  const [s, t] = simplifySqrt(D);
  if (t === 1) {
    const x1 = new F(nb + s, den),
      x2 = new F(nb - s, den);
    return `${x1.tex()},\\ ${x2.tex()}`;
  }
  let g = gcd(gcd(Math.abs(nb), s), Math.abs(den));
  if (g === 0) g = 1;
  let p = nb / g;
  const q = s / g;
  let d = den / g;
  if (d < 0) {
    p = -p;
    d = -d;
  }
  const qs = q === 1 ? `\\sqrt{${t}}` : `${q}\\sqrt{${t}}`;
  const num = p === 0 ? `\\pm${qs}` : `${p}\\pm${qs}`;
  return d === 1 ? num : `\\frac{${num}}{${d}}`;
}

/** 근의 공식 결과 TeX: ax²+bx+c=0 (D>0, 완전제곱 아님) → \frac{p \pm q\sqrt{t}}{d} */
export function quadRootsTex(a: number, b: number, c: number): string {
  return rootsTex(-b, b * b - 4 * a * c, 2 * a);
}

/** 1/x 꼴 분수 TeX */
export const fr = (n: number, d: number) => new F(n, d).tex();

/** 2×2 등 행렬 TeX */
export function mat(m: (number | string)[][]): string {
  return `\\begin{pmatrix} ${m.map((row) => row.join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;
}

/** x^2 등 단항 계수 → TeX 다항식 (변수 두 개용) */
export function poly2(terms: { c: number; v: string }[]): string {
  return termsTex(terms);
}
export { poly };

// ───────────── 그림: 점·선분 자동 배치 ─────────────
type P = [number, number];
export interface GeoOpts {
  w?: number;
  h?: number;
  segs?: [string, string][];
  dashed?: [string, string][];
  /** 꼭짓점 이름 표시 (기본: 모든 점) */
  hide?: string[];
  /** 변 위 글자: [점1, 점2, 글자] */
  sides?: [string, string, string][];
  /** 각 글자: [꼭짓점, 이웃점1, 이웃점2, 글자] — 각의 이등분 방향 안쪽에 */
  angles?: [string, string, string, string][];
  /** 직각 표시: [꼭짓점, 이웃점1, 이웃점2] */
  right?: [string, string, string][];
  circles?: { c: string; r: number }[];
  polys?: string[][];
  dots?: string[];
}

/** 수학 좌표의 점들을 그림 크기에 맞춰 그리기 (y 위쪽 +) */
export function geo(pts: Record<string, P>, o: GeoOpts = {}): string {
  const w = o.w ?? 260;
  const h = o.h ?? 200;
  const xs: number[] = [];
  const ys: number[] = [];
  for (const k in pts) {
    xs.push(pts[k][0]);
    ys.push(pts[k][1]);
  }
  for (const c of o.circles ?? []) {
    const [cx, cy] = pts[c.c];
    xs.push(cx - c.r, cx + c.r);
    ys.push(cy - c.r, cy + c.r);
  }
  const minX = Math.min(...xs),
    maxX = Math.max(...xs),
    minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const pad = 26;
  const sc = Math.min((w - 2 * pad) / (maxX - minX || 1), (h - 2 * pad) / (maxY - minY || 1));
  const ox = (w - (maxX - minX) * sc) / 2;
  const oy = (h - (maxY - minY) * sc) / 2;
  const T = (p: P): P => [ox + (p[0] - minX) * sc, h - oy - (p[1] - minY) * sc];
  const S: Record<string, P> = {};
  for (const k in pts) S[k] = T(pts[k]);
  const cen: P = [0, 0];
  const keys = Object.keys(S);
  keys.forEach((k) => {
    cen[0] += S[k][0] / keys.length;
    cen[1] += S[k][1] / keys.length;
  });
  const s = new Svg(w, h);
  for (const c of o.circles ?? []) s.circle(S[c.c][0], S[c.c][1], c.r * sc);
  for (const pg of o.polys ?? []) s.poly(pg.map((k) => S[k]), { fill: true, cls: 'acc' });
  for (const [a, b] of o.segs ?? []) s.line(S[a][0], S[a][1], S[b][0], S[b][1]);
  for (const [a, b] of o.dashed ?? []) s.line(S[a][0], S[a][1], S[b][0], S[b][1], { dash: true });
  const unit = (a: P, b: P): P => {
    const dx = b[0] - a[0],
      dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    return [dx / l, dy / l];
  };
  for (const [v, a, b] of o.right ?? []) s.rightAngle(S[v][0], S[v][1], unit(S[v], S[a]), unit(S[v], S[b]), 9);
  for (const [v, a, b, t] of o.angles ?? []) {
    const u1 = unit(S[v], S[a]);
    const u2 = unit(S[v], S[b]);
    const bis = unit([0, 0], [u1[0] + u2[0], u1[1] + u2[1]]);
    s.text(S[v][0] + bis[0] * 24, S[v][1] + bis[1] * 24, t, { size: 11, cls: 'acc2' });
  }
  for (const [a, b, t] of o.sides ?? []) {
    const m: P = [(S[a][0] + S[b][0]) / 2, (S[a][1] + S[b][1]) / 2];
    const u = unit(S[a], S[b]);
    let n: P = [-u[1], u[0]];
    if ((m[0] - cen[0]) * n[0] + (m[1] - cen[1]) * n[1] < 0) n = [-n[0], -n[1]];
    s.text(m[0] + n[0] * 12, m[1] + n[1] * 12, t, { size: 12, cls: 'acc' });
  }
  for (const k of o.dots ?? []) s.dot(S[k][0], S[k][1], { r: 2.5 });
  const hide = new Set(o.hide ?? []);
  for (const k of keys) {
    if (hide.has(k)) continue;
    let u = unit(cen, S[k]);
    if (Math.hypot(S[k][0] - cen[0], S[k][1] - cen[1]) < 1) u = [0, -1];
    s.text(S[k][0] + u[0] * 13, S[k][1] + u[1] * 13, k, { size: 13, italic: true });
  }
  return s.toString();
}

/** 각도(도) 로 원 위의 점 */
export function onCircle(deg: number, r = 1, c: P = [0, 0]): P {
  const t = (deg * Math.PI) / 180;
  return [c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)];
}

/** 밑변 BC 위에 두 밑각으로 삼각형 꼭짓점 (B=(0,0), C=(base,0)) */
export function triByAngles(angB: number, angC: number, base = 10): Record<'A' | 'B' | 'C', P> {
  const tb = Math.tan((angB * Math.PI) / 180);
  const tcn = Math.tan((angC * Math.PI) / 180);
  const x = (base * tcn) / (tb + tcn);
  return { A: [x, x * tb], B: [0, 0], C: [base, 0] };
}

/** 세 변 길이로 삼각형 (B=(0,0), C=(a,0)), a=BC, b=CA, c=AB */
export function triBySides(a: number, b: number, c: number): Record<'A' | 'B' | 'C', P> {
  const x = (a * a + c * c - b * b) / (2 * a);
  const y = Math.sqrt(Math.max(0, c * c - x * x));
  return { A: [x, y], B: [0, 0], C: [a, 0] };
}

/** 정수 피타고라스 수 (a<b<c, c ≤ max) */
export function triples(max: number): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (let a = 1; a <= max; a++)
    for (let b = a + 1; b <= max; b++) {
      const c = Math.round(Math.sqrt(a * a + b * b));
      if (c <= max && c * c === a * a + b * b) out.push([a, b, c]);
    }
  return out;
}

/** 완전제곱수인가 */
export const isSq = (n: number) => n >= 0 && Math.round(Math.sqrt(n)) ** 2 === n;

/** 두 직선 (p1→p2), (p3→p4) 의 교점 */
export function meet(p1: P, p2: P, p3: P, p4: P): P {
  const d1: P = [p2[0] - p1[0], p2[1] - p1[1]];
  const d2: P = [p4[0] - p3[0], p4[1] - p3[1]];
  const den = d1[0] * d2[1] - d1[1] * d2[0] || 1e-9;
  const t = ((p3[0] - p1[0]) * d2[1] - (p3[1] - p1[1]) * d2[0]) / den;
  return [p1[0] + t * d1[0], p1[1] + t * d1[1]];
}
/** 내분점 p + t(q-p) */
export function lerp(p: P, q: P, t: number): P {
  return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
}
/** 외심 */
export function circum(A: P, B: P, C: P): P {
  const d = 2 * (A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1]));
  const a2 = A[0] ** 2 + A[1] ** 2,
    b2 = B[0] ** 2 + B[1] ** 2,
    c2 = C[0] ** 2 + C[1] ** 2;
  return [(a2 * (B[1] - C[1]) + b2 * (C[1] - A[1]) + c2 * (A[1] - B[1])) / d, (a2 * (C[0] - B[0]) + b2 * (A[0] - C[0]) + c2 * (B[0] - A[0])) / d];
}
/** 내심과 내접원 반지름 */
export function incircle(A: P, B: P, C: P): { I: P; r: number } {
  const a = Math.hypot(B[0] - C[0], B[1] - C[1]);
  const b = Math.hypot(A[0] - C[0], A[1] - C[1]);
  const c = Math.hypot(A[0] - B[0], A[1] - B[1]);
  const p = a + b + c;
  const I: P = [(a * A[0] + b * B[0] + c * C[0]) / p, (a * A[1] + b * B[1] + c * C[1]) / p];
  const S = Math.abs((B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1])) / 2;
  return { I, r: (2 * S) / p };
}
/** 점 P 에서 직선 AB 에 내린 수선의 발 */
export function foot(Pt: P, A: P, B: P): P {
  const d: P = [B[0] - A[0], B[1] - A[1]];
  const t = ((Pt[0] - A[0]) * d[0] + (Pt[1] - A[1]) * d[1]) / (d[0] ** 2 + d[1] ** 2);
  return [A[0] + t * d[0], A[1] + t * d[1]];
}

const batchim = (s: string) => {
  const c = s.charCodeAt(s.length - 1);
  return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 !== 0;
};
/** 이름 + 주격 조사: 서연이가 / 민수가 */
export const ga = (name: string) => (batchim(name) ? `${name}이가` : `${name}가`);
/** 이름 + 보조사: 서연이는 / 민수는 */
export const neun = (name: string) => (batchim(name) ? `${name}이는` : `${name}는`);
/** 이름 부르기형: 서연이 / 민수 (뒤에 '의', '네' 등) */
export const nm = (name: string) => (batchim(name) ? `${name}이` : name);

/**
 * Plane.toString() 은 전역 카운터로 clipPath id 를 만들어 같은 시드에서도 문자열이 달라짐 (core 문제).
 * 내용 해시로 id 를 바꿔 결정적으로 만든다.
 */
export function figStr(pl: { toString(): string }): string {
  const s = pl.toString();
  const base = s.replace(/pc\d+/g, 'pc');
  let h = 2166136261;
  for (let i = 0; i < base.length; i++) {
    h ^= base.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const id = 'q' + (h >>> 0).toString(36);
  let k = 0;
  const map = new Map<string, string>();
  return s.replace(/pc\d+/g, (m) => {
    if (!map.has(m)) map.set(m, `${id}_${k++}`);
    return map.get(m)!;
  });
}
