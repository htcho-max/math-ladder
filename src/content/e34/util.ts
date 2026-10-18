// e34 (초3·초4) 공용 도우미: 이름, 조사, 분수 TeX, 그림
import type { Rng } from '../../core/rng';
import { Svg } from '../../core/fig';
import { comma } from '../../core/tex';
import { round } from '../../core/nt';

// 받침 없는 이름만 (조사 '는/가' 를 바로 붙일 수 있게)
export const NAMES = ['민수', '지호', '수아', '준우', '시우', '지아', '현우', '유나', '서희', '예서', '태오', '세라', '주희', '나래', '도하', '채아'];
export const pickName = (r: Rng) => r.pick(NAMES);
export const pick2Names = (r: Rng) => r.sample(NAMES, 2) as [string, string];

// ───────── 조사 ─────────
const D_BAT = [true, true, false, true, false, false, true, true, true, false];
const D_RIEUL = [false, true, false, false, false, false, false, true, true, false];

function finalOf(w: string | number): { b: boolean; l: boolean } {
  const s = typeof w === 'number' ? String(round(w)) : w.trim();
  const ch = s[s.length - 1] ?? '';
  if (/[0-9]/.test(ch)) {
    const d = +ch;
    if (d === 0) return { b: true, l: false };
    return { b: D_BAT[d], l: D_RIEUL[d] };
  }
  const code = ch.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    const f = (code - 0xac00) % 28;
    return { b: f !== 0, l: f === 8 };
  }
  if (/(kg|g|t)$/.test(s)) return { b: true, l: false };
  return { b: false, l: false };
}

type Pair = '이/가' | '은/는' | '을/를' | '와/과' | '으로/로' | '이에요/예요' | '이/' | '아/야';
/** 조사만: josa('민수','이/가') = '가' */
export function josa(w: string | number, pair: Pair): string {
  const [a, b] = pair.split('/');
  const f = finalOf(w);
  if (pair === '으로/로') return f.b && !f.l ? a : b;
  if (pair === '와/과') return f.b ? '과' : '와';
  return f.b ? a : b;
}
/** 단어+조사 */
export const J = (w: string, pair: Pair) => w + josa(w, pair);
/** 수식 숫자+조사: N(345,'을/를') = '$345$를' */
export const N = (n: number, pair: Pair) => `$${comma(n)}$${josa(n, pair)}`;
/** 이름 + 이 (받침 있으면 '지훈이') */
export const nm = (name: string) => name + josa(name, '이/');

// ───────── TeX ─────────
/** 약분하지 않는 분수 TeX */
export const fr = (a: number, b: number) => `\\frac{${a}}{${b}}`;
/** 약분하지 않는 대분수 TeX (가분수 a/b 를 대분수로) */
export function mx(a: number, b: number): string {
  const w = Math.floor(a / b);
  const rem = a % b;
  if (rem === 0) return String(w);
  if (w === 0) return fr(rem, b);
  return `${w}${fr(rem, b)}`;
}
export const c = (n: number) => comma(n);
export const d = (n: number) => comma(round(n, 6));

// ───────── 그림 ─────────
type P = [number, number];
const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]];
const len = (a: P) => Math.hypot(a[0], a[1]);
const unit = (a: P): P => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l];
};
const deg = (v: P) => (Math.atan2(-v[1], v[0]) * 180) / Math.PI;

export interface PolyOpts {
  w?: number;
  h?: number;
  sides?: (string | null | undefined)[];
  angles?: (string | null | undefined)[];
  verts?: string[];
  right?: boolean[];
  ticks?: number[];
  fill?: boolean;
  extra?: (s: Svg, P: P[]) => void;
}

/** 다각형 그림 (pts 는 수학 좌표, y 위쪽). 변 길이·각·꼭짓점 이름 표시 */
export function polyFig(pts: P[], o: PolyOpts = {}): string {
  const w = o.w ?? 240;
  const h = o.h ?? 180;
  const pad = o.sides?.some(Boolean) ? 40 : 32;
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const minx = Math.min(...xs),
    maxx = Math.max(...xs),
    miny = Math.min(...ys),
    maxy = Math.max(...ys);
  const sc = Math.min((w - 2 * pad) / (maxx - minx || 1), (h - 2 * pad) / (maxy - miny || 1));
  const ox = (w - (maxx - minx) * sc) / 2;
  const oy = (h - (maxy - miny) * sc) / 2;
  const Pp: P[] = pts.map(([x, y]) => [ox + (x - minx) * sc, h - oy - (y - miny) * sc]);
  const s = new Svg(w, h);
  s.poly(Pp, { cls: 'acc', fill: o.fill });
  const n = Pp.length;
  const cx = Pp.reduce((a, p) => a + p[0], 0) / n;
  const cy = Pp.reduce((a, p) => a + p[1], 0) / n;
  for (let i = 0; i < n; i++) {
    const A = Pp[i],
      B = Pp[(i + 1) % n];
    const mid: P = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
    const dv = unit(sub(B, A));
    let nv: P = [dv[1], -dv[0]];
    if (nv[0] * (mid[0] - cx) + nv[1] * (mid[1] - cy) < 0) nv = [-nv[0], -nv[1]];
    const lab = o.sides?.[i];
    if (lab) {
      // 세로에 가까운 변의 길이 글자는 변에 겹치지 않도록 바깥쪽으로 정렬
      if (Math.abs(nv[0]) > 0.8) s.text(mid[0] + nv[0] * 7, mid[1] + nv[1] * 7, lab, { size: 13, anchor: nv[0] > 0 ? 'start' : 'end' });
      else s.text(mid[0] + nv[0] * 14, mid[1] + nv[1] * 14, lab, { size: 13 });
    }
    const t = o.ticks?.[i] ?? 0;
    for (let k = 0; k < t; k++) {
      const off = (k - (t - 1) / 2) * 4;
      const q: P = [mid[0] + dv[0] * off, mid[1] + dv[1] * off];
      s.line(q[0] - nv[0] * 5, q[1] - nv[1] * 5, q[0] + nv[0] * 5, q[1] + nv[1] * 5, { cls: 'acc2' });
    }
  }
  for (let i = 0; i < n; i++) {
    const V = Pp[i];
    const u = unit(sub(Pp[(i + n - 1) % n], V));
    const v = unit(sub(Pp[(i + 1) % n], V));
    const bis = unit([u[0] + v[0], u[1] + v[1]]);
    if (o.right?.[i]) s.rightAngle(V[0], V[1], u, v, 10);
    const lab = o.angles?.[i];
    if (lab) {
      if (!o.right?.[i]) {
        let a1 = deg(u),
          a2 = deg(v);
        if ((((a2 - a1) % 360) + 360) % 360 > 180) [a1, a2] = [a2, a1];
        s.arc(V[0], V[1], 15, a1, a2, { cls: 'acc2' });
      }
      s.text(V[0] + bis[0] * 30, V[1] + bis[1] * 30, lab, { size: 12 });
    }
    const vl = o.verts?.[i];
    if (vl) s.text(V[0] - bis[0] * 13, V[1] - bis[1] * 13, vl, { size: 13 });
  }
  o.extra?.(s, Pp);
  return s.toString();
}

/** 각 하나 그림. deg: 각의 크기, rot: 첫 변 방향(도) */
export function angleFig(degv: number, o: { rot?: number; label?: string; w?: number; h?: number } = {}): string {
  const w = o.w ?? 200;
  const h = o.h ?? 140;
  const rot = o.rot ?? 0;
  const L = 80;
  const rad = (a: number) => (a * Math.PI) / 180;
  const e1: P = [L * Math.cos(rad(rot)), -L * Math.sin(rad(rot))];
  const e2: P = [L * Math.cos(rad(rot + degv)), -L * Math.sin(rad(rot + degv))];
  const xs = [0, e1[0], e2[0]],
    ys = [0, e1[1], e2[1]];
  const ox = w / 2 - (Math.min(...xs) + Math.max(...xs)) / 2;
  const oy = h / 2 - (Math.min(...ys) + Math.max(...ys)) / 2;
  const s = new Svg(w, h);
  s.line(ox, oy, ox + e1[0], oy + e1[1], { cls: 'acc' });
  s.line(ox, oy, ox + e2[0], oy + e2[1], { cls: 'acc' });
  s.dot(ox, oy);
  if (degv === 90) {
    s.rightAngle(ox, oy, unit(e1), unit(e2), 12);
  } else {
    s.arc(ox, oy, 18, rot, rot + degv, { cls: 'acc2' });
  }
  if (o.label) {
    const b = unit([unit(e1)[0] + unit(e2)[0], unit(e1)[1] + unit(e2)[1]]);
    s.text(ox + b[0] * 36, oy + b[1] * 36, o.label, { size: 13 });
  }
  return s.toString();
}

/** 그림그래프: units 는 큰 단위부터 [100, 10] 등. unitName: '상자' */
export function picGraph(labels: string[], values: number[], units: number[], o: { unitName?: string; head?: string } = {}): string {
  const radius = [10, 6, 3.5];
  const counts = values.map((v) => {
    let rem = v;
    return units.map((u) => {
      const k = Math.floor(round(rem / u, 6));
      rem = round(rem - k * u, 6);
      return k;
    });
  });
  const maxIcons = Math.max(...counts.map((cs) => cs.reduce((a, b) => a + b, 0)));
  const rowH = 30;
  const left = 70;
  const w = Math.max(250, left + maxIcons * 23 + 20);
  const h = 30 + labels.length * rowH + 34;
  const s = new Svg(w, h);
  s.text(left / 2, 14, o.head ?? '이름', { size: 12, cls: 'muted' });
  s.line(4, 26, w - 4, 26);
  labels.forEach((lab, i) => {
    const y = 26 + i * rowH + rowH / 2;
    s.text(left / 2, y, lab, { size: 13 });
    let x = left + 12;
    counts[i].forEach((k, j) => {
      for (let t = 0; t < k; t++) {
        s.circle(x, y, radius[j], { cls: 'acc', fill: true });
        x += radius[j] * 2 + 5;
      }
    });
    s.line(4, 26 + (i + 1) * rowH, w - 4, 26 + (i + 1) * rowH, { cls: 'grid' });
  });
  s.line(left, 26 - 22, left, 26 + labels.length * rowH, { cls: 'grid' });
  // 범례
  let x = 14;
  const ly = h - 14;
  units.forEach((u, j) => {
    s.circle(x + radius[0] - radius[j], ly, radius[j], { cls: 'acc', fill: true });
    const t = `${comma(u, false)}${o.unitName ?? ''}`;
    s.text(x + radius[0] * 2 + 4, ly, t, { size: 12, anchor: 'start' });
    x += radius[0] * 2 + 14 + t.length * 8;
  });
  return s.toString();
}

/** 점(●) 배열 그림: rows × cols, 묶음 표시 groupCols 마다 세로 점선 */
export function dotsFig(total: number, perRow: number, o: { groupBy?: number } = {}): string {
  const rows = Math.ceil(total / perRow);
  const gap = 20;
  const w = Math.max(160, perRow * gap + 24);
  const h = rows * gap + 20;
  const s = new Svg(w, h);
  for (let i = 0; i < total; i++) {
    const r0 = Math.floor(i / perRow),
      c0 = i % perRow;
    s.dot(16 + c0 * gap, 14 + r0 * gap, { cls: 'acc', r: 5 });
  }
  if (o.groupBy) {
    // 묶음마다 테두리 (perRow 는 groupBy 의 배수라서 묶음이 줄을 넘지 않음)
    const gb = o.groupBy;
    for (let g = 0; g * gb < total; g++) {
      const i0 = g * gb;
      const r0 = Math.floor(i0 / perRow),
        c0 = i0 % perRow;
      const cnt = Math.min(gb, total - i0);
      s.rect(16 + c0 * gap - 9, 14 + r0 * gap - 9, (cnt - 1) * gap + 18, 18, { cls: 'grid' });
    }
  }
  return s.toString();
}

/** 분수 그림: 원(부채꼴 n등분) 또는 막대(n등분), 앞 k칸 색칠 */
export function fracFig(n: number, k: number, kind: 'circle' | 'bar' | 'grid' = 'bar'): string {
  if (kind === 'circle') {
    const s = new Svg(140, 140);
    const R = 60;
    for (let i = 0; i < k; i++) s.arc(70, 70, R, 90 - (360 / n) * (i + 1), 90 - (360 / n) * i, { sector: true, cls: 'acc' });
    s.circle(70, 70, R);
    for (let i = 0; i < n; i++) {
      const a = ((90 - (360 / n) * i) * Math.PI) / 180;
      s.line(70, 70, 70 + R * Math.cos(a), 70 - R * Math.sin(a));
    }
    return s.toString();
  }
  if (kind === 'grid' && n % 2 === 0 && n >= 4) {
    const cols = n / 2;
    const cw = Math.min(40, 240 / cols);
    const s = new Svg(cols * cw + 20, 2 * 36 + 20);
    for (let i = 0; i < n; i++) {
      const r0 = Math.floor(i / cols),
        c0 = i % cols;
      s.rect(10 + c0 * cw, 10 + r0 * 36, cw, 36, { fill: i < k, cls: i < k ? 'acc' : undefined });
    }
    return s.toString();
  }
  const cw = Math.min(40, 260 / n);
  const s = new Svg(n * cw + 20, 60);
  for (let i = 0; i < n; i++) s.rect(10 + i * cw, 12, cw, 36, { fill: i < k, cls: i < k ? 'acc' : undefined });
  return s.toString();
}

// ───────── 격자 도형 (평면도형의 이동) ─────────
export type Cells = [number, number][]; // [행, 열]

export function norm(cs: Cells): Cells {
  const mr = Math.min(...cs.map((x) => x[0]));
  const mc = Math.min(...cs.map((x) => x[1]));
  return cs.map(([a, b]) => [a - mr, b - mc] as [number, number]).sort((p, q) => p[0] - q[0] || p[1] - q[1]);
}
export const cellKey = (cs: Cells) => JSON.stringify(norm(cs));
export const flipH = (cs: Cells): Cells => norm(cs.map(([a, b]) => [a, -b]));
export const flipV = (cs: Cells): Cells => norm(cs.map(([a, b]) => [-a, b]));
/** 시계 방향 90° */
export const rotCW = (cs: Cells): Cells => norm(cs.map(([a, b]) => [b, -a]));
export const rotN = (cs: Cells, k: number): Cells => {
  let x = norm(cs);
  for (let i = 0; i < ((k % 4) + 4) % 4; i++) x = rotCW(x);
  return x;
};

/** 대칭이 전혀 없는 격자 도형 (size×size 안, cells 칸) */
export function asymShape(r: Rng, size: number, cells: number): Cells {
  for (let t = 0; t < 500; t++) {
    const set = new Set<string>(['0,0']);
    const list: Cells = [[0, 0]];
    while (list.length < cells) {
      const [a, b] = r.pick(list);
      const [da, db] = r.pick([
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
      ] as [number, number][]);
      const k = `${a + da},${b + db}`;
      if (!set.has(k)) {
        set.add(k);
        list.push([a + da, b + db]);
      }
    }
    const sh = norm(list);
    const maxR = Math.max(...sh.map((x) => x[0]));
    const maxC = Math.max(...sh.map((x) => x[1]));
    if (maxR >= size || maxC >= size) continue;
    const base = cellKey(sh);
    const all = [rotN(sh, 1), rotN(sh, 2), rotN(sh, 3), flipH(sh), flipV(sh), rotCW(flipH(sh)), rotCW(flipV(sh))].map(cellKey);
    if (all.some((k) => k === base)) continue;
    if (new Set(all).size !== all.length) continue;
    return sh;
  }
  return norm([
    [0, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [2, 2],
  ]).slice(0, cells) as Cells;
}

/** 격자 위 도형 여러 개를 나란히 그림: items = [{cells, label}] */
export function cellsFig(items: { cells: Cells; label?: string; mark?: boolean }[], size: number, o: { cs?: number } = {}): string {
  const cs = o.cs ?? 13;
  const box = size * cs;
  const gap = 18;
  const w = items.length * (box + gap) + 10;
  const h = box + 34;
  const s = new Svg(w, h);
  items.forEach((it, i) => {
    const x0 = 10 + i * (box + gap);
    const y0 = 8;
    for (let a = 0; a <= size; a++) {
      s.line(x0, y0 + a * cs, x0 + box, y0 + a * cs, { cls: 'grid' });
      s.line(x0 + a * cs, y0, x0 + a * cs, y0 + box, { cls: 'grid' });
    }
    const sh = norm(it.cells);
    const mr = Math.max(...sh.map((q) => q[0])) + 1;
    const mc = Math.max(...sh.map((q) => q[1])) + 1;
    const offR = Math.floor((size - mr) / 2);
    const offC = Math.floor((size - mc) / 2);
    for (const [a, b] of sh) s.rect(x0 + (b + offC) * cs, y0 + (a + offR) * cs, cs, cs, { cls: it.mark ? 'acc2' : 'acc', fill: true });
    if (it.label) s.text(x0 + box / 2, y0 + box + 14, it.label, { size: 13 });
  });
  return s.toString();
}

// ───────── 수식 뒤 조사 자동 교정 ─────────
const JOSA_RE = /\$([^$]+)\$( ?)(을|를|은|는|와|과|이|가|으로|로)(?![가-힣])/g;
const PAIR: Record<string, Pair> = { 을: '을/를', 를: '을/를', 은: '은/는', 는: '은/는', 와: '와/과', 과: '와/과', 이: '이/가', 가: '이/가', 으로: '으로/로', 로: '으로/로' };
/** 수식을 소리 내어 읽을 때 마지막 말 (조사 결정용). 모르면 null */
function readingTail(expr: string): string | null {
  const e = expr.replace(/\\[;,!: ]|\\quad|\s+/g, '').replace(/\)+$/, '');
  let m: RegExpMatchArray | null;
  if ((m = e.match(/\\frac\{(\d+)\}\{\d+\}$/))) return m[1]; // b분의 a → a 로 끝남
  if (/\^\{?\\circ\}?$/.test(e)) return '도';
  if ((m = e.match(/\\boxed\{(\d)\}$/))) return m[1];
  if (/\\square$/.test(e)) return '모'; // 네모
  if ((m = e.match(/(\d)\}?$/))) return m[1];
  return null;
}
/** '$261$를' → '$261$을', '$264+321$ 를' → '$264+321$을' 처럼 읽기에 맞게 조사를 고친다 */
export function fixJosa(s: string): string {
  return s.replace(JOSA_RE, (all, body: string, _sp: string, p: string) => {
    const t = readingTail(body);
    if (t === null) return all;
    return `$${body}$${josa(t, PAIR[p])}`;
  });
}

/** 내각(도)이 주어진 볼록다각형의 꼭짓점 (수학 좌표, 반시계). 그림의 각이 실제 각과 같게 그려진다 */
export function polyFromAngles(r: Rng, angles: number[]): [number, number][] {
  const n = angles.length;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dirs: number[] = [];
  let dd = 0;
  for (let i = 0; i < n; i++) {
    dirs.push(dd);
    dd += 180 - angles[(i + 1) % n];
  }
  let best: [number, number][] | null = null;
  for (let t = 0; t < 300; t++) {
    const lens = Array.from({ length: n - 2 }, () => 0.7 + r.next() * 0.7);
    let sx = 0,
      sy = 0;
    lens.forEach((L, i) => {
      sx += L * Math.cos(rad(dirs[i]));
      sy += L * Math.sin(rad(dirs[i]));
    });
    const u = [Math.cos(rad(dirs[n - 2])), Math.sin(rad(dirs[n - 2]))];
    const v = [Math.cos(rad(dirs[n - 1])), Math.sin(rad(dirs[n - 1]))];
    const det = u[0] * v[1] - u[1] * v[0];
    if (Math.abs(det) < 1e-9) continue;
    const w = [-sx, -sy];
    const cL = (w[0] * v[1] - w[1] * v[0]) / det;
    const dL = (u[0] * w[1] - u[1] * w[0]) / det;
    if (cL <= 0.05 || dL <= 0.05) continue;
    const all = [...lens, cL, dL];
    const pts: [number, number][] = [[0, 0]];
    for (let i = 0; i < n - 1; i++) {
      const [px, py] = pts[i];
      pts.push([px + all[i] * Math.cos(rad(dirs[i])), py + all[i] * Math.sin(rad(dirs[i]))]);
    }
    best = pts;
    if (Math.max(...all) / Math.min(...all) < 3) return pts;
  }
  return best ?? regularPts(n);
}
function regularPts(n: number): [number, number][] {
  return Array.from({ length: n }, (_, i) => [Math.cos((2 * Math.PI * i) / n), Math.sin((2 * Math.PI * i) / n)] as [number, number]);
}

/** 수를 한글로 읽기: 35207 → '삼만 오천이백칠' */
export function korNum(n: number): string {
  const D = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  const P = ['', '십', '백', '천'];
  const G = ['', '만', '억', '조'];
  if (n === 0) return '영';
  const groups: string[] = [];
  let g = 0;
  let m = n;
  while (m > 0) {
    const part = m % 10000;
    m = Math.floor(m / 10000);
    if (part) {
      let s = '';
      const ds = String(part).padStart(4, '0').split('').map(Number);
      ds.forEach((dg, i) => {
        if (!dg) return;
        const p = 3 - i;
        s += (dg === 1 && p > 0 ? '' : D[dg]) + P[p];
      });
      if (g > 0 && part === 1) s = g === 1 ? '' : '일';
      groups.unshift(s + G[g]);
    }
    g++;
  }
  return groups.join(' ');
}
