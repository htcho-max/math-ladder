// m12 기하 그림 도우미 (SVG 픽셀 좌표, 각도는 수학 방향: 0=오른쪽, 반시계 +)
import { Svg } from '../../core/fig';

export type P2 = [number, number];
export const rad = (d: number) => (d * Math.PI) / 180;
/** p 에서 수학각 deg 방향으로 len 만큼 */
export const go = (p: P2, deg: number, len: number): P2 => [p[0] + len * Math.cos(rad(deg)), p[1] - len * Math.sin(rad(deg))];
/** p→q 방향의 수학각 (도) */
export const dirOf = (p: P2, q: P2) => (Math.atan2(-(q[1] - p[1]), q[0] - p[0]) * 180) / Math.PI;

/** 각 표시(호 + 라벨). a1→a2 반시계 */
export function angleMark(s: Svg, p: P2, a1: number, a2: number, label?: string, o: { r?: number; cls?: string; lr?: number } = {}) {
  const r = o.r ?? 20;
  let b = a2;
  while (b < a1) b += 360;
  s.arc(p[0], p[1], r, a1, b, { cls: o.cls ?? 'acc' });
  if (label) {
    const q = go(p, (a1 + b) / 2, o.lr ?? r + 15);
    s.text(q[0], q[1], label, { size: 13, cls: o.cls ?? 'acc' });
  }
}

/** 꼭짓점 라벨: 도형 중심에서 바깥쪽으로 */
export function vLabels(s: Svg, pts: P2[], names: string[], d = 13) {
  const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length;
  const cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  pts.forEach((p, i) => {
    const dx = p[0] - cx;
    const dy = p[1] - cy;
    const L = Math.hypot(dx, dy) || 1;
    s.text(p[0] + (dx / L) * d, p[1] + (dy / L) * d, names[i], { size: 14, italic: false });
  });
}

/** 세 각이 A, B, C 인 삼각형 꼭짓점 [A, B, C] (BC 수평, A 위쪽), 상자 (x0,y0,w,h) 안에 맞춤 */
export function triPts(A: number, B: number, C: number, x0: number, y0: number, w: number, h: number): [P2, P2, P2] {
  const ab = Math.sin(rad(C)) / Math.sin(rad(A));
  const a: P2 = [ab * Math.cos(rad(B)), ab * Math.sin(rad(B))];
  const xs = [a[0], 0, 1];
  const ys = [a[1], 0, 0];
  const minx = Math.min(...xs);
  const maxx = Math.max(...xs);
  const maxy = Math.max(...ys);
  const k = Math.min(w / (maxx - minx), h / maxy);
  const ox = x0 + (w - (maxx - minx) * k) / 2;
  const T = (x: number, y: number): P2 => [ox + (x - minx) * k, y0 + h - y * k];
  return [T(a[0], a[1]), T(0, 0), T(1, 0)];
}

// ───────── 3차원 (입체 위치 관계) ─────────
export type V3 = [number, number, number];
const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross3 = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot3 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len3 = (a: V3) => Math.hypot(a[0], a[1], a[2]);

export type Rel = 'parallel' | 'meet' | 'skew' | 'same';
/** 두 모서리(직선)의 위치 관계 */
export function edgeRel(p1: V3, q1: V3, p2: V3, q2: V3): Rel {
  const d1 = sub3(q1, p1);
  const d2 = sub3(q2, p2);
  const c = cross3(d1, d2);
  if (len3(c) < 1e-9) {
    return len3(cross3(d1, sub3(p2, p1))) < 1e-9 ? 'same' : 'parallel';
  }
  return Math.abs(dot3(c, sub3(p2, p1))) < 1e-9 ? 'meet' : 'skew';
}
/** 모서리와 면(세 점)의 관계: 'in' | 'parallel' | 'perp' | 'meet' */
export function edgeFace(p: V3, q: V3, f: V3[]): 'in' | 'parallel' | 'perp' | 'meet' {
  const n = cross3(sub3(f[1], f[0]), sub3(f[2], f[0]));
  const d = sub3(q, p);
  if (Math.abs(dot3(d, n)) < 1e-9) return Math.abs(dot3(sub3(p, f[0]), n)) < 1e-9 ? 'in' : 'parallel';
  if (len3(cross3(d, n)) < 1e-9) return 'perp';
  return 'meet';
}

/** 사투영: 3차원 → SVG */
export function proj(v: V3, ox: number, oy: number, k: number): P2 {
  return [ox + k * (v[0] + 0.5 * v[1] * Math.cos(rad(35))), oy - k * (v[2] + 0.5 * v[1] * Math.sin(rad(35)))];
}
