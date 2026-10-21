// e34 심화·최상위 유형 공용 도우미 (hard3.ts, hard4.ts)
import { Svg } from '../../core/fig';
import { gcd } from '../../core/nt';

export function until<T>(gen: () => T, ok: (x: T) => boolean, tries = 800): T {
  let x = gen();
  for (let i = 0; i < tries && !ok(x); i++) x = gen();
  return x;
}
export const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
/** 순열 (k개) */
export function perms<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  const out: T[][] = [];
  arr.forEach((x, i) => {
    const rest = arr.slice(0, i).concat(arr.slice(i + 1));
    for (const p of perms(rest, k - 1)) out.push([x, ...p]);
  });
  return out;
}
/** 약분이 필요 없는 분수(또는 자연수)인지 */
export const fracOk = (n: number, den: number) => n > 0 && (n % den === 0 || gcd(n % den, den) === 1);
export const boxes = (ds: (number | string)[]) => ds.map((x) => `\\boxed{${x}}`).join('\\;');
export const ORD = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째', '열째'];

// ───────── 기하 그림 ─────────
export type Pt = [number, number];
export interface GeoSpec {
  /** 점 이름 → 수학 좌표 (y 위쪽) */
  P: Record<string, Pt>;
  polys?: string[][];
  segs?: { a: string; b: string; dash?: boolean; cls?: string }[];
  /** 이름을 표시할 점 (기본: 모든 점) */
  labels?: string[];
  /** 꼭짓점 at 에서 a, b 쪽 반직선 사이의 각 표시 */
  angles?: {
    at: string;
    a: string;
    b: string;
    text?: string;
    right?: boolean;
  }[];
  dots?: string[];
  circles?: { c: string; r: number; dash?: boolean }[];
  /** 글자 위치를 바깥쪽으로 밀 기준점 (기본: 전체 점의 무게중심) */
  center?: Pt;
  /** 점 이름 표시 방향을 직접 정함 (수학 좌표 방향 벡터) */
  labelDir?: Record<string, Pt>;
  w?: number;
  h?: number;
}
const nrm = (v: Pt): Pt => {
  const l = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / l, v[1] / l];
};
export function geoFig(g: GeoSpec): string {
  const w = g.w ?? 260,
    h = g.h ?? 190,
    pad = 30;
  const names = Object.keys(g.P);
  const xs: number[] = [],
    ys: number[] = [];
  for (const n of names) {
    xs.push(g.P[n][0]);
    ys.push(g.P[n][1]);
  }
  for (const c of g.circles ?? []) {
    const [cx, cy] = g.P[c.c];
    xs.push(cx - c.r, cx + c.r);
    ys.push(cy - c.r, cy + c.r);
  }
  const minx = Math.min(...xs),
    maxx = Math.max(...xs),
    miny = Math.min(...ys),
    maxy = Math.max(...ys);
  const sc = Math.min((w - 2 * pad) / (maxx - minx || 1), (h - 2 * pad) / (maxy - miny || 1));
  const ox = (w - (maxx - minx) * sc) / 2,
    oy = (h - (maxy - miny) * sc) / 2;
  const S = (p: Pt): Pt => [ox + (p[0] - minx) * sc, h - oy - (p[1] - miny) * sc];
  const Q: Record<string, Pt> = {};
  for (const n of names) Q[n] = S(g.P[n]);
  const s = new Svg(w, h);
  for (const c of g.circles ?? []) s.circle(Q[c.c][0], Q[c.c][1], c.r * sc, { cls: 'acc', dash: c.dash });
  for (const pg of g.polys ?? [])
    s.poly(
      pg.map((n) => Q[n]),
      { cls: 'acc' },
    );
  for (const sg of g.segs ?? [])
    s.line(Q[sg.a][0], Q[sg.a][1], Q[sg.b][0], Q[sg.b][1], {
      cls: sg.cls ?? 'acc',
      dash: sg.dash,
    });
  for (const d of g.dots ?? []) s.dot(Q[d][0], Q[d][1], { cls: 'acc' });
  const cen: Pt = g.center ? S(g.center) : [sum(names.map((n) => Q[n][0])) / names.length, sum(names.map((n) => Q[n][1])) / names.length];
  const deg = (v: Pt) => (Math.atan2(-v[1], v[0]) * 180) / Math.PI;
  for (const an of g.angles ?? []) {
    const V = Q[an.at];
    const u = nrm([Q[an.a][0] - V[0], Q[an.a][1] - V[1]]);
    const v = nrm([Q[an.b][0] - V[0], Q[an.b][1] - V[1]]);
    let bis = nrm([u[0] + v[0], u[1] + v[1]]);
    if (Math.abs(u[0] + v[0]) + Math.abs(u[1] + v[1]) < 1e-6) bis = [u[1], -u[0]];
    if (an.right) s.rightAngle(V[0], V[1], u, v, 10);
    else {
      let a1 = deg(u),
        a2 = deg(v);
      if ((((a2 - a1) % 360) + 360) % 360 > 180) [a1, a2] = [a2, a1];
      s.arc(V[0], V[1], 14, a1, a2, { cls: 'acc2' });
    }
    if (an.text) s.text(V[0] + bis[0] * 30, V[1] + bis[1] * 30, an.text, { size: 12 });
  }
  for (const n of g.labels ?? names) {
    const p = Q[n];
    let dv: Pt;
    if (g.labelDir?.[n]) dv = nrm([g.labelDir[n][0], -g.labelDir[n][1]]);
    else dv = nrm([p[0] - cen[0], p[1] - cen[1]]);
    s.text(p[0] + dv[0] * 13, p[1] + dv[1] * 13, n, { size: 13 });
  }
  return s.toString();
}
/** 원점에서 각도(도) 방향 길이 L 인 점 */
export const ray = (degv: number, L = 1, o: Pt = [0, 0]): Pt => [o[0] + L * Math.cos((degv * Math.PI) / 180), o[1] + L * Math.sin((degv * Math.PI) / 180)];
