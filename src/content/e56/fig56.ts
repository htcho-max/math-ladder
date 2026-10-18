// 초5·6 도형 그림 도우미 (SVG)
import { Svg } from '../../core/fig';
import { round } from '../../core/nt';

export type P = [number, number];

/** 수학 좌표(위가 +y) 점들을 W×H 안에 맞추는 변환 */
export function fit(pts: P[], W: number, H: number, pad = 28, padX = pad): { map: (p: P) => P; s: number } {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const minx = Math.min(...xs),
    maxx = Math.max(...xs),
    miny = Math.min(...ys),
    maxy = Math.max(...ys);
  const w = maxx - minx || 1,
    h = maxy - miny || 1;
  const s = Math.min((W - 2 * padX) / w, (H - 2 * pad) / h);
  const ox = (W - w * s) / 2,
    oy = (H + h * s) / 2;
  return { map: (p) => [ox + (p[0] - minx) * s, oy - (p[1] - miny) * s], s };
}

const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]];
const len = (a: P) => Math.hypot(a[0], a[1]);
const unit = (a: P): P => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l];
};

export interface ShapeOpts {
  W?: number;
  H?: number;
  /** 변 i (pts[i]→pts[i+1]) 옆 글자 */
  sides?: (string | null | undefined)[];
  /** 꼭짓점 이름 */
  verts?: string[];
  /** 점선(높이·대각선 등): 수학 좌표 a→b, 글자, 직각 표시(b 에서) */
  dashed?: { a: P; b: P; label?: string; right?: boolean; side?: 1 | -1; labelSide?: 1 | -1 }[];
  /** 꼭짓점 i 안쪽 각 글자 */
  angles?: { i: number; text: string }[];
  /** 꼭짓점 i 에 직각 표시 */
  rightAt?: number[];
  fill?: boolean;
  /** 대칭축 등 추가 선 (수학 좌표) */
  extraLines?: { a: P; b: P; cls?: string; dash?: boolean }[];
  dots?: { p: P; label?: string }[];
}

/** 다각형 그림 + 변 길이·꼭짓점·높이 표시 */
export function shapeFig(pts: P[], o: ShapeOpts = {}): string {
  const W = o.W ?? 260,
    H = o.H ?? 180;
  const extra: P[] = [...pts];
  (o.dashed ?? []).forEach((d) => extra.push(d.a, d.b));
  (o.extraLines ?? []).forEach((d) => extra.push(d.a, d.b));
  const { map } = fit(extra, W, H, 26, 48);
  const s = new Svg(W, H);
  const sp = pts.map(map);
  s.poly(sp, { cls: 'acc', fill: o.fill !== false });
  // 방향(수학 좌표 부호 넓이)
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    area += x1 * y2 - x2 * y1;
  }
  const ccw = area > 0;
  (o.extraLines ?? []).forEach((d) => s.line(...map(d.a), ...map(d.b), { cls: d.cls, dash: d.dash }));
  (o.sides ?? []).forEach((t, i) => {
    if (!t) return;
    const a = pts[i],
      b = pts[(i + 1) % pts.length];
    const [dx, dy] = unit(sub(b, a));
    let n: P = [dy, -dx]; // CCW 이면 바깥쪽
    if (!ccw) n = [-dy, dx];
    const m = map([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
    // 수학 좌표 법선 → SVG (y 반전)
    const off = 14 + (Math.abs(n[0]) > 0.6 ? t.length * 2.5 : 0);
    s.text(m[0] + n[0] * off, m[1] - n[1] * off, t, { size: 13 });
  });
  (o.dashed ?? []).forEach((d) => {
    const A = map(d.a),
      B = map(d.b);
    s.line(A[0], A[1], B[0], B[1], { dash: true, cls: 'acc2' });
    if (d.right) {
      const u = unit(sub(A, B));
      // 밑변 방향: 점 B 에서 수직
      const v: P = [u[1], -u[0]];
      const vv: P = d.side === -1 ? [-v[0], -v[1]] : v;
      s.rightAngle(B[0], B[1], u, vv, 8);
    }
    if (d.label) {
      const mx = (A[0] + B[0]) / 2,
        my = (A[1] + B[1]) / 2;
      const u = unit(sub(B, A));
      const n: P = [-u[1], u[0]];
      const off = 8 + d.label.length * 3.2;
      const sd = -(d.labelSide ?? 1);
      s.text(mx + n[0] * off * sd, my + n[1] * off * sd, d.label, { size: 13, cls: 'acc2' });
    }
  });
  const cx = sp.reduce((a, p) => a + p[0], 0) / sp.length;
  const cy = sp.reduce((a, p) => a + p[1], 0) / sp.length;
  (o.verts ?? []).forEach((t, i) => {
    const [x, y] = sp[i];
    const u = unit([x - cx, y - cy]);
    s.text(x + u[0] * 12, y + u[1] * 12, t, { size: 13 });
  });
  (o.angles ?? []).forEach(({ i, text }) => {
    const v = sp[i];
    const a = unit(sub(sp[(i + sp.length - 1) % sp.length], v));
    const b = unit(sub(sp[(i + 1) % sp.length], v));
    let bis = unit([a[0] + b[0], a[1] + b[1]]);
    if (len([a[0] + b[0], a[1] + b[1]]) < 1e-6) bis = [-a[1], a[0]];
    s.text(v[0] + bis[0] * 24, v[1] + bis[1] * 24, text, { size: 12, cls: 'acc2' });
  });
  (o.rightAt ?? []).forEach((i) => {
    const v = sp[i];
    const a = unit(sub(sp[(i + sp.length - 1) % sp.length], v));
    const b = unit(sub(sp[(i + 1) % sp.length], v));
    s.rightAngle(v[0], v[1], a, b, 9);
  });
  (o.dots ?? []).forEach((d) => {
    const p = map(d.p);
    s.dot(p[0], p[1]);
    if (d.label) s.text(p[0] + 10, p[1] - 9, d.label, { size: 13 });
  });
  return s.toString();
}

/** 직육면체 겨냥도 (가로 a, 세로(깊이) b, 높이 c). 보이지 않는 모서리는 점선 */
export function cuboidFig(a: number, b: number, c: number, o: { labels?: (string | null)[]; names?: boolean; W?: number; H?: number } = {}): string {
  const W = o.W ?? 240,
    H = o.H ?? 180;
  const k = 0.5,
    cs = Math.SQRT1_2;
  const P3 = (x: number, y: number, z: number): P => [x + y * k * cs, z + y * k * cs];
  const V: Record<string, [number, number, number]> = {
    ㄱ: [0, b, c],
    ㄴ: [a, b, c],
    ㄷ: [a, 0, c],
    ㄹ: [0, 0, c],
    ㅁ: [0, b, 0],
    ㅂ: [a, b, 0],
    ㅅ: [a, 0, 0],
    ㅇ: [0, 0, 0],
  };
  const pts2 = Object.values(V).map(([x, y, z]) => P3(x, y, z));
  const { map } = fit(pts2, W, H, 26, 46);
  const m = (n: string) => map(P3(...V[n]));
  const s = new Svg(W, H);
  const edges = ['ㄱㄴ', 'ㄴㄷ', 'ㄷㄹ', 'ㄹㄱ', 'ㅂㅅ', 'ㅅㅇ', 'ㄴㅂ', 'ㄷㅅ', 'ㄹㅇ', 'ㅁㄱ', 'ㅁㅂ', 'ㅁㅇ'];
  s.poly([m('ㄹ'), m('ㄷ'), m('ㅅ'), m('ㅇ')], { cls: 'acc', fill: true });
  for (const e of edges) {
    const [p, q] = [m(e[0]), m(e[1])];
    s.line(p[0], p[1], q[0], q[1], { cls: 'acc', dash: e.includes('ㅁ') });
  }
  const L = o.labels ?? [];
  if (L[0]) {
    const p = m('ㅇ'),
      q = m('ㅅ');
    s.text((p[0] + q[0]) / 2, p[1] + 14, L[0], { size: 13 });
  }
  if (L[1]) {
    const p = m('ㅅ'),
      q = m('ㅂ');
    s.text((p[0] + q[0]) / 2 + 16, (p[1] + q[1]) / 2 + 6, L[1], { size: 13, anchor: 'start' });
  }
  if (L[2]) {
    const p = m('ㅇ'),
      q = m('ㄹ');
    s.text(p[0] - 8, (p[1] + q[1]) / 2, L[2], { size: 13, anchor: 'end' });
  }
  if (o.names) {
    const ctr = map(P3(a / 2, b / 2, c / 2));
    for (const n of Object.keys(V)) {
      const p = m(n);
      const u = unit(sub(p, ctr));
      s.text(p[0] + u[0] * 12, p[1] + u[1] * 12, n, { size: 12 });
    }
  }
  return s.toString();
}

/** 정육면체·직육면체 전개도: 칸(열,행) 목록 + 칸 글자. cell 크기(단위) w×h 배열 지원 */
export function gridNetFig(cells: P[], labels: string[], o: { size?: number } = {}): string {
  const sz = o.size ?? 34;
  const maxc = Math.max(...cells.map((c) => c[0])) + 1;
  const maxr = Math.max(...cells.map((c) => c[1])) + 1;
  const s = new Svg(maxc * sz + 20, maxr * sz + 20);
  cells.forEach(([c, r], i) => {
    s.rect(10 + c * sz, 10 + r * sz, sz, sz, { cls: 'acc', fill: true });
    s.text(10 + c * sz + sz / 2, 10 + r * sz + sz / 2, labels[i], { size: 14 });
  });
  return s.toString();
}

/** 직사각형들의 전개도 (단위 좌표 x,y,w,h; 위가 y=0 인 화면 좌표) */
export function rectNetFig(rects: { x: number; y: number; w: number; h: number }[], marks: { x: number; y: number; text: string; dx?: number; dy?: number; anchor?: 'start' | 'middle' | 'end' }[], W = 260, H = 220): string {
  const maxx = Math.max(...rects.map((r) => r.x + r.w));
  const maxy = Math.max(...rects.map((r) => r.y + r.h));
  const sc = Math.min((W - 50) / maxx, (H - 40) / maxy);
  const ox = (W - maxx * sc) / 2,
    oy = (H - maxy * sc) / 2;
  const s = new Svg(W, H);
  rects.forEach((r) => s.rect(ox + r.x * sc, oy + r.y * sc, r.w * sc, r.h * sc, { cls: 'acc', fill: true }));
  marks.forEach((m) => s.text(ox + m.x * sc + (m.dx ?? 0), oy + m.y * sc + (m.dy ?? 0), m.text, { size: 12, anchor: m.anchor }));
  return s.toString();
}

/** 각기둥·각뿔 겨냥도 (밑면 정n각형) */
export function prismFig(n: number, o: { pyramid?: boolean; sideLabel?: string; hLabel?: string; W?: number; H?: number } = {}): string {
  const W = o.W ?? 200,
    H = o.H ?? 190;
  const s = new Svg(W, H);
  const R = 62,
    cx = W / 2,
    sq = 0.36;
  const base = H - 40,
    top = 40;
  const rot = 90 + 180 / n + 17; // 앞쪽(아래)에 변이 오도록, 살짝 돌려서 입체감
  const th = Array.from({ length: n }, (_, i) => ((rot + (360 * i) / n) * Math.PI) / 180);
  const bp: P[] = th.map((t) => [cx + R * Math.cos(t), base + R * sq * Math.sin(t)]);
  const tp: P[] = th.map((t) => [cx + R * Math.cos(t), top + R * sq * Math.sin(t)]);
  const xs = bp.map((p) => p[0]);
  const minx = Math.min(...xs),
    maxx = Math.max(...xs);
  const back = (i: number) => Math.sin(th[i]) < -1e-6 && Math.abs(bp[i][0] - minx) > 1e-6 && Math.abs(bp[i][0] - maxx) > 1e-6;
  // 바닥 변
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const mid = Math.sin(th[i]) + Math.sin(th[j]);
    s.line(bp[i][0], bp[i][1], bp[j][0], bp[j][1], { cls: 'acc', dash: mid < -1e-6 });
  }
  const apex: P = [cx, top - 10];
  for (let i = 0; i < n; i++) {
    if (o.pyramid) s.line(bp[i][0], bp[i][1], apex[0], apex[1], { cls: 'acc', dash: back(i) });
    else {
      s.line(bp[i][0], bp[i][1], tp[i][0], tp[i][1], { cls: 'acc', dash: back(i) });
      const j = (i + 1) % n;
      s.line(tp[i][0], tp[i][1], tp[j][0], tp[j][1], { cls: 'acc' });
    }
  }
  // 앞쪽 변 (가장 아래 변) 글자
  if (o.sideLabel) {
    let bi = 0,
      by = -1e9;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const y = (bp[i][1] + bp[j][1]) / 2;
      if (y > by) {
        by = y;
        bi = i;
      }
    }
    const j = (bi + 1) % n;
    s.text((bp[bi][0] + bp[j][0]) / 2, by + 14, o.sideLabel, { size: 13 });
  }
  if (o.hLabel && !o.pyramid) {
    let ri = 0;
    for (let i = 0; i < n; i++) if (bp[i][0] > bp[ri][0] || (bp[i][0] === bp[ri][0] && bp[i][1] > bp[ri][1])) ri = i;
    s.text(bp[ri][0] + 8, (bp[ri][1] + tp[ri][1]) / 2, o.hLabel, { size: 13, anchor: 'start' });
  }
  if (o.hLabel && o.pyramid) {
    s.line(apex[0], apex[1], cx, base, { dash: true, cls: 'acc2' });
    s.text(cx + 6, (apex[1] + base) / 2, o.hLabel, { size: 13, anchor: 'start', cls: 'acc2' });
  }
  return s.toString();
}

/** 타원(앞쪽 실선, 뒤쪽 점선 선택) */
function ellipse(s: Svg, cx: number, cy: number, rx: number, ry: number, backDash: boolean): void {
  const f = (v: number) => round(v, 2);
  s.raw(`<path d="M${f(cx - rx)},${f(cy)} A${f(rx)},${f(ry)} 0 0 0 ${f(cx + rx)},${f(cy)}" class="acc nofill"/>`);
  s.raw(`<path d="M${f(cx - rx)},${f(cy)} A${f(rx)},${f(ry)} 0 0 1 ${f(cx + rx)},${f(cy)}" class="acc nofill"${backDash ? ' stroke-dasharray="4 3"' : ''}/>`);
}

/** 원기둥 겨냥도 */
export function cylinderFig(o: { rLabel?: string; hLabel?: string; dLabel?: string } = {}): string {
  const W = 200,
    H = 190;
  const s = new Svg(W, H);
  const cx = 100,
    rx = 56,
    ry = 16,
    yt = 40,
    yb = 150;
  ellipse(s, cx, yt, rx, ry, false);
  ellipse(s, cx, yb, rx, ry, true);
  s.line(cx - rx, yt, cx - rx, yb, { cls: 'acc' });
  s.line(cx + rx, yt, cx + rx, yb, { cls: 'acc' });
  if (o.rLabel) {
    s.dot(cx, yt, { r: 2.5 });
    s.line(cx, yt, cx + rx, yt, { cls: 'acc2' });
    s.text(cx + rx / 2, yt - 9, o.rLabel, { size: 13, cls: 'acc2' });
  }
  if (o.dLabel) {
    s.line(cx - rx, yb, cx + rx, yb, { cls: 'acc2', dash: true });
    s.text(cx, yb + 28, o.dLabel, { size: 13, cls: 'acc2' });
  }
  if (o.hLabel) s.text(cx + rx + 8, (yt + yb) / 2, o.hLabel, { size: 13, anchor: 'start' });
  return s.toString();
}

/** 원뿔 겨냥도 */
export function coneFig(o: { rLabel?: string; hLabel?: string; lLabel?: string; dLabel?: string } = {}): string {
  const W = 200,
    H = 190;
  const s = new Svg(W, H);
  const cx = 100,
    rx = 58,
    ry = 16,
    yb = 150,
    ya = 30;
  ellipse(s, cx, yb, rx, ry, true);
  s.line(cx - rx, yb, cx, ya, { cls: 'acc' });
  s.line(cx + rx, yb, cx, ya, { cls: 'acc' });
  s.dot(cx, ya, { r: 2.5 });
  if (o.hLabel) {
    s.line(cx, ya, cx, yb, { dash: true, cls: 'acc2' });
    s.rightAngle(cx, yb, [0, -1], [1, 0], 7);
    s.text(cx - 6, (ya + yb) / 2 + 10, o.hLabel, { size: 13, anchor: 'end', cls: 'acc2' });
  }
  if (o.rLabel) {
    s.line(cx, yb, cx + rx, yb, { cls: 'acc2' });
    s.text(cx + rx / 2, yb + 12, o.rLabel, { size: 13, cls: 'acc2' });
  }
  if (o.dLabel) {
    s.line(cx - rx, yb, cx + rx, yb, { cls: 'acc2', dash: true });
    s.text(cx, yb + 28, o.dLabel, { size: 13, cls: 'acc2' });
  }
  if (o.lLabel) s.text(cx + rx / 2 + 12, (ya + yb) / 2 - 4, o.lLabel, { size: 13, anchor: 'start' });
  return s.toString();
}

/** 구 겨냥도 */
export function sphereFig(o: { rLabel?: string; dLabel?: string } = {}): string {
  const s = new Svg(180, 170);
  const cx = 90,
    cy = 85,
    R = 64;
  s.circle(cx, cy, R, { cls: 'acc', fill: true });
  ellipse(s, cx, cy, R, 16, true);
  s.dot(cx, cy, { r: 2.5 });
  if (o.rLabel) {
    s.line(cx, cy, cx + R, cy, { cls: 'acc2' });
    s.text(cx + R / 2, cy - 10, o.rLabel, { size: 13, cls: 'acc2' });
  }
  if (o.dLabel) {
    s.line(cx - R, cy, cx + R, cy, { cls: 'acc2' });
    s.text(cx, cy - 10, o.dLabel, { size: 13, cls: 'acc2' });
  }
  return s.toString();
}

/** 원 (반지름 또는 지름 표시) */
export function circleFig(o: { rLabel?: string; dLabel?: string; size?: number } = {}): string {
  const sz = o.size ?? 170;
  const s = new Svg(sz, sz);
  const c = sz / 2,
    R = c - 16;
  s.circle(c, c, R, { cls: 'acc', fill: true });
  s.dot(c, c, { r: 2.5 });
  s.text(c - 2, c + 12, 'ㅇ', { size: 11 });
  if (o.rLabel) {
    s.line(c, c, c + R * Math.cos(-0.5), c + R * Math.sin(-0.5), { cls: 'acc2' });
    s.text(c + (R / 2) * Math.cos(-0.5) + 4, c + (R / 2) * Math.sin(-0.5) - 10, o.rLabel, { size: 13, cls: 'acc2' });
  }
  if (o.dLabel) {
    s.line(c - R, c, c + R, c, { cls: 'acc2' });
    s.text(c + R / 2, c - 10, o.dLabel, { size: 13, cls: 'acc2' });
  }
  return s.toString();
}

/** 쌓기나무 (heights[행][열], 행 0 = 맨 뒤). 오른쪽 위에서 본 빗각 그림 */
export function cubesFig(heights: number[][], sz = 26, withTop = false): string {
  const R = heights.length,
    C = heights[0].length;
  const maxH = Math.max(...heights.flat());
  const dx = sz * 0.5,
    dy = sz * 0.5;
  const W0 = C * sz + R * dx + 24;
  const tz = 22;
  const W = withTop ? W0 + C * tz + 40 : W0;
  const Hh = Math.max(maxH * sz + R * dy + 24, withTop ? R * tz + 40 : 0);
  const s = new Svg(Math.round(W), Math.round(Hh));
  if (withTop) {
    const tx = W0 + 20,
      ty = 14;
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (heights[r][c]) s.rect(tx + c * tz, ty + r * tz, tz, tz, { cls: 'acc', fill: true });
    s.text(tx + (C * tz) / 2, ty + R * tz + 12, '위에서 본 모양', { size: 10, cls: 'muted' });
  }
  const ox = 12,
    oy = Hh - 12;
  for (let r = 0; r < R; r++) {
    const d = R - 1 - r; // 앞에서부터의 깊이
    for (let k = 0; k < maxH; k++) {
      for (let c = 0; c < C; c++) {
        if (heights[r][c] <= k) continue;
        const x = ox + c * sz + d * dx;
        const y = oy - k * sz - d * dy;
        const front: P[] = [
          [x, y],
          [x + sz, y],
          [x + sz, y - sz],
          [x, y - sz],
        ];
        const topf: P[] = [
          [x, y - sz],
          [x + sz, y - sz],
          [x + sz + dx, y - sz - dy],
          [x + dx, y - sz - dy],
        ];
        const right: P[] = [
          [x + sz, y],
          [x + sz + dx, y - dy],
          [x + sz + dx, y - sz - dy],
          [x + sz, y - sz],
        ];
        s.poly(front, { cls: 'acc bgfill' });
        s.poly(topf, { cls: 'acc bgfill' });
        s.poly(topf, { cls: 'acc', fill: true });
        s.poly(right, { cls: 'acc bgfill' });
      }
    }
  }
  return s.toString();
}

/** 위에서 본 모양에 쌓은 개수 적기 (행 0 = 뒤, 화면 위) */
export function topViewFig(heights: number[][], sz = 30, showNums = true): string {
  const R = heights.length,
    C = heights[0].length;
  const s = new Svg(C * sz + 60, R * sz + 30);
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++) {
      if (!heights[r][c]) continue;
      s.rect(10 + c * sz, 10 + r * sz, sz, sz, { cls: 'acc', fill: true });
      if (showNums) s.text(10 + c * sz + sz / 2, 10 + r * sz + sz / 2, String(heights[r][c]), { size: 14 });
    }
  s.text(10 + (C * sz) / 2, R * sz + 22, '앞', { size: 12, cls: 'muted' });
  return s.toString();
}

/** 띠그래프 */
export function bandFig(labels: string[], pct: number[], o: { hide?: number } = {}): string {
  const W = 320,
    H = 80;
  const s = new Svg(W, H);
  const x0 = 10,
    w = W - 20,
    y = 20,
    h = 34;
  let acc = 0;
  labels.forEach((l, i) => {
    const x = x0 + (acc / 100) * w;
    const ww = (pct[i] / 100) * w;
    s.rect(x, y, ww, h, { cls: i % 2 ? 'acc2' : 'acc', fill: true });
    s.text(x + ww / 2, y + h / 2 - 7, l, { size: 11 });
    s.text(x + ww / 2, y + h / 2 + 8, o.hide === i ? '?' : `${pct[i]}%`, { size: 11 });
    acc += pct[i];
  });
  for (let t = 0; t <= 100; t += 10) {
    s.line(x0 + (t / 100) * w, y + h + 2, x0 + (t / 100) * w, y + h + (t % 50 === 0 ? 9 : 5));
    if (t % 50 === 0) s.text(x0 + (t / 100) * w, y + h + 17, String(t), { size: 9, cls: 'muted' });
  }
  return s.toString();
}

/** 원그래프 */
export function pieFig(labels: string[], pct: number[], o: { hide?: number } = {}): string {
  const s = new Svg(220, 200);
  const cx = 110,
    cy = 100,
    R = 82;
  let acc = 0;
  labels.forEach((l, i) => {
    const a1 = 90 - (acc / 100) * 360;
    const a2 = 90 - ((acc + pct[i]) / 100) * 360;
    // 시계 방향으로 a1 → a2 이므로 arc 는 a2 → a1
    s.arc(cx, cy, R, a2, a1, { cls: i % 2 ? 'acc2' : 'acc', sector: true });
    const mid = ((90 - ((acc + pct[i] / 2) / 100) * 360) * Math.PI) / 180;
    s.text(cx + R * 0.6 * Math.cos(mid), cy - R * 0.6 * Math.sin(mid) - 7, l, { size: 11 });
    s.text(cx + R * 0.6 * Math.cos(mid), cy - R * 0.6 * Math.sin(mid) + 8, o.hide === i ? '?' : `${pct[i]}%`, { size: 11 });
    acc += pct[i];
  });
  s.circle(cx, cy, R, { cls: 'acc' });
  return s.toString();
}

/** 그림그래프: 큰 그림(●)=big, 작은 그림(•)=1 단위 */
export function pictureFig(labels: string[], values: number[], big: number, small: number): string {
  const rowH = 30;
  const W = 300,
    H = labels.length * rowH + 46; // 마지막 줄과 범례(큰 그림·작은 그림)가 붙어 보이지 않게 간격을 둠
  const s = new Svg(W, H);
  s.line(10, labels.length * rowH + 20, W - 10, labels.length * rowH + 20, { cls: 'grid' });
  labels.forEach((l, i) => {
    const y = 14 + i * rowH + rowH / 2;
    s.text(36, y, l, { size: 12 });
    s.line(70, y - rowH / 2, 70, y + rowH / 2, { cls: 'grid' });
    const nb = Math.floor(values[i] / big);
    const ns = Math.round((values[i] - nb * big) / small);
    let x = 84;
    for (let k = 0; k < nb; k++, x += 22) s.circle(x, y, 9, { cls: 'acc', fill: true });
    for (let k = 0; k < ns; k++, x += 14) s.circle(x, y, 5, { cls: 'acc2', fill: true });
  });
  s.circle(84, H - 12, 9, { cls: 'acc', fill: true });
  s.text(98, H - 12, `${big}`, { size: 11, anchor: 'start' });
  s.circle(150, H - 12, 5, { cls: 'acc2', fill: true });
  s.text(160, H - 12, `${small}`, { size: 11, anchor: 'start' });
  return s.toString();
}

/** 여러 다각형을 한 그림에 (변 글자·꼭짓점·각 글자) */
export function multiShapeFig(
  shapes: { pts: P[]; sides?: (string | null | undefined)[]; verts?: string[]; angles?: { i: number; text: string }[]; dashed?: [P, P][]; dots?: { p: P; label?: string }[] }[],
  W = 300,
  H = 170,
): string {
  const all: P[] = shapes.flatMap((s) => s.pts);
  const { map } = fit(all, W, H, 26, 30);
  const s = new Svg(W, H);
  for (const sh of shapes) {
    const pts = sh.pts;
    const sp = pts.map(map);
    s.poly(sp, { cls: 'acc', fill: true });
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % pts.length];
      area += x1 * y2 - x2 * y1;
    }
    const ccw = area > 0;
    (sh.dashed ?? []).forEach(([a, b]) => s.line(...map(a), ...map(b), { dash: true, cls: 'acc2' }));
    (sh.sides ?? []).forEach((t, i) => {
      if (!t) return;
      const a = pts[i],
        b = pts[(i + 1) % pts.length];
      const [dx, dy] = unit(sub(b, a));
      const n: P = ccw ? [dy, -dx] : [-dy, dx];
      const m = map([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
      const off = 12 + Math.abs(n[0]) * t.length * 2.6;
      s.text(m[0] + n[0] * off, m[1] - n[1] * off, t, { size: 12 });
    });
    const cx = sp.reduce((a, p) => a + p[0], 0) / sp.length;
    const cy = sp.reduce((a, p) => a + p[1], 0) / sp.length;
    (sh.verts ?? []).forEach((t, i) => {
      const [x, y] = sp[i];
      const u = unit([x - cx, y - cy]);
      s.text(x + u[0] * 11, y + u[1] * 11, t, { size: 12 });
    });
    (sh.angles ?? []).forEach(({ i, text }) => {
      const v = sp[i];
      const a = unit(sub(sp[(i + sp.length - 1) % sp.length], v));
      const b = unit(sub(sp[(i + 1) % sp.length], v));
      const bis = unit([a[0] + b[0], a[1] + b[1]]);
      s.text(v[0] + bis[0] * 22, v[1] + bis[1] * 22, text, { size: 11, cls: 'acc2' });
    });
    (sh.dots ?? []).forEach((d) => {
      const p = map(d.p);
      s.dot(p[0], p[1], { r: 2.5 });
      if (d.label) s.text(p[0] + 9, p[1] - 8, d.label, { size: 12 });
    });
  }
  return s.toString();
}
