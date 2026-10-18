// 초1·2 전용 그림 도우미 (fig.ts 의 Svg 위에 만듦)
import { Svg } from '../../core/fig';
import type { Rng } from '../../core/rng';

const f2 = (x: number) => Math.round(x * 100) / 100;

// ───────────── 바둑돌·구슬 ─────────────

export interface DotGroup {
  n: number;
  filled?: boolean; // 색칠한 것
  crossed?: number; // 뒤에서부터 / 표시할 개수
  perRow?: number;
}

/** 여러 묶음의 동그라미를 가로로 나란히 (각 묶음은 perRow 개씩 줄 바꿈) */
export function dotGroups(groups: DotGroup[], o: { r?: number; gap?: number; label?: string[] } = {}): string {
  const rad = o.r ?? 10;
  const cell = rad * 2 + 6;
  const gap = o.gap ?? 26;
  const dims = groups.map((g) => {
    const per = g.perRow ?? 5;
    const cols = Math.min(per, Math.max(1, g.n));
    const rows = Math.max(1, Math.ceil(g.n / per));
    return { cols, rows, per };
  });
  const hasLabel = !!o.label;
  const w = dims.reduce((a, d) => a + d.cols * cell, 0) + gap * (groups.length - 1) + 16;
  const h = Math.max(...dims.map((d) => d.rows)) * cell + 16 + (hasLabel ? 20 : 0);
  const s = new Svg(Math.max(w, 60), h);
  let x0 = 8;
  groups.forEach((g, gi) => {
    const d = dims[gi];
    if (groups.length > 1) s.rect(x0 - 4, 4, d.cols * cell + 8, d.rows * cell + 8, { cls: 'grid' });
    for (let i = 0; i < g.n; i++) {
      const cx = x0 + (i % d.per) * cell + cell / 2;
      const cy = 8 + Math.floor(i / d.per) * cell + cell / 2;
      s.circle(cx, cy, rad, { cls: g.filled ? 'acc' : undefined, fill: g.filled });
      if (g.crossed && i >= g.n - g.crossed) s.line(cx - rad, cy + rad, cx + rad, cy - rad, { cls: 'acc2', width: 2.5 });
    }
    if (hasLabel && o.label![gi]) s.text(x0 + (d.cols * cell) / 2, h - 10, o.label![gi], { size: 13 });
    x0 += d.cols * cell + gap;
  });
  return s.toString();
}

/** 섞여 있는 두 종류(색칠·빈) 동그라미를 한 줄에 */
export function mixedDots(pattern: boolean[], o: { perRow?: number } = {}): string {
  const per = o.perRow ?? 10;
  const cell = 26;
  const rows = Math.ceil(pattern.length / per);
  const s = new Svg(Math.min(per, pattern.length) * cell + 12, rows * cell + 12);
  pattern.forEach((f, i) => {
    s.circle(6 + (i % per) * cell + cell / 2, 6 + Math.floor(i / per) * cell + cell / 2, 10, { cls: f ? 'acc' : undefined, fill: f });
  });
  return s.toString();
}

/** 10칸 상자 (2×5) 여러 개. n 개 채움, extra 개는 주황 */
export function tenFrames(n: number, o: { extra?: number; frames?: number } = {}): string {
  const total = n + (o.extra ?? 0);
  const frames = o.frames ?? Math.max(1, Math.ceil(total / 10));
  const c = 26;
  const s = new Svg(frames * (5 * c + 16) + 4, 2 * c + 12);
  for (let f = 0; f < frames; f++) {
    const x0 = 6 + f * (5 * c + 16);
    for (let i = 0; i < 10; i++) {
      const x = x0 + (i % 5) * c;
      const y = 6 + Math.floor(i / 5) * c;
      s.rect(x, y, c, c);
      const k = f * 10 + i;
      if (k < n) s.circle(x + c / 2, y + c / 2, 9, { cls: 'acc', fill: true });
      else if (k < total) s.circle(x + c / 2, y + c / 2, 9, { cls: 'acc2', fill: true });
    }
  }
  return s.toString();
}

// ───────────── 수 모형 ─────────────

/** 백 모형(판)·십 모형(막대)·일 모형(낱개) */
export function baseTen(h: number, t: number, o: number): string {
  const u = 6; // 한 칸
  const parts: number[] = [];
  const wH = h ? h * (10 * u + 8) : 0;
  const wT = t ? t * (u + 6) : 0;
  const wO = o ? Math.ceil(o / 5) * (u + 6) : 0;
  parts.push(wH, wT, wO);
  const w = parts.reduce((a, b) => a + b, 0) + 20 * parts.filter((p) => p > 0).length + 10;
  const s = new Svg(Math.max(w, 80), 10 * u + 20);
  let x = 10;
  const y0 = 10;
  for (let i = 0; i < h; i++) {
    s.rect(x, y0, 10 * u, 10 * u, { cls: 'acc', fill: true });
    for (let k = 1; k < 10; k++) {
      s.line(x + k * u, y0, x + k * u, y0 + 10 * u, { width: 0.5 });
      s.line(x, y0 + k * u, x + 10 * u, y0 + k * u, { width: 0.5 });
    }
    x += 10 * u + 8;
  }
  if (h) x += 12;
  for (let i = 0; i < t; i++) {
    s.rect(x, y0, u, 10 * u, { cls: 'acc', fill: true });
    for (let k = 1; k < 10; k++) s.line(x, y0 + k * u, x + u, y0 + k * u, { width: 0.5 });
    x += u + 6;
  }
  if (t) x += 12;
  for (let i = 0; i < o; i++) {
    const cx = x + Math.floor(i / 5) * (u + 6);
    const cy = y0 + 10 * u - (i % 5) * (u + 6) - u;
    s.rect(cx, cy, u, u, { cls: 'acc', fill: true });
  }
  return s.toString();
}

/** 10개씩 묶음(막대 안 10알)과 낱개 구슬 */
export function bundles(t: number, o: number): string {
  const r = 4;
  const bw = 2 * r + 6;
  const bh = 10 * (2 * r + 2) + 6;
  const w = t * (bw + 8) + (o ? 16 + Math.ceil(o / 5) * (2 * r + 6) : 0) + 16;
  const s = new Svg(Math.max(w, 60), bh + 16);
  let x = 8;
  for (let i = 0; i < t; i++) {
    s.rect(x, 8, bw, bh, { cls: 'grid' });
    for (let k = 0; k < 10; k++) s.circle(x + bw / 2, 8 + 3 + r + k * (2 * r + 2), r, { cls: 'acc', fill: true });
    x += bw + 8;
  }
  x += 12;
  for (let i = 0; i < o; i++) {
    const cx = x + Math.floor(i / 5) * (2 * r + 6) + r;
    const cy = 8 + bh - 3 - r - (i % 5) * (2 * r + 6);
    s.circle(cx, cy, r, { cls: 'acc', fill: true });
  }
  return s.toString();
}

/** 1000·100·10·1 이 적힌 수 카드 묶음 (줄마다 한 종류) */
export function placeCards(counts: [number, number, number, number]): string {
  const vals = [1000, 100, 10, 1];
  const rows = vals.map((v, i) => ({ v, n: counts[i] })).filter((x) => x.n > 0);
  const cw = 40;
  const ch = 24;
  const maxN = Math.max(...rows.map((x) => x.n));
  const s = new Svg(Math.max(160, maxN * (cw + 6) + 16), rows.length * (ch + 10) + 12);
  rows.forEach((row, ri) => {
    for (let i = 0; i < row.n; i++) {
      const x = 8 + i * (cw + 6);
      const y = 8 + ri * (ch + 10);
      s.rect(x, y, cw, ch, { cls: row.v >= 100 ? 'acc' : 'acc2', fill: true });
      s.text(x + cw / 2, y + ch / 2 + 1, String(row.v), { size: row.v === 1000 ? 12 : 13 });
    }
  });
  return s.toString();
}

// ───────────── 입체 모양 ─────────────

export type Solid = 'box' | 'cyl' | 'ball';
export const SOLID_NAME: Record<Solid, string> = { box: '상자 모양', cyl: '둥근기둥 모양', ball: '공 모양' };

function ellipse(s: Svg, cx: number, cy: number, rx: number, ry: number, cls = '', dash = false) {
  s.raw(`<ellipse cx="${f2(cx)}" cy="${f2(cy)}" rx="${f2(rx)}" ry="${f2(ry)}" class="${cls}"${dash ? ' stroke-dasharray="4 3"' : ''}/>`);
}

/** 입체 하나를 (cx, cy) 중심, 크기 z 로. variant 로 비율 바꾸기 (0~2) */
export function drawSolid(s: Svg, kind: Solid, cx: number, cy: number, z: number, variant = 0) {
  if (kind === 'box') {
    const w = z * [0.7, 0.9, 0.55][variant % 3];
    const h = z * [0.55, 0.45, 0.75][variant % 3];
    const d = z * 0.25;
    const x = cx - (w + d) / 2;
    const y = cy - (h - d) / 2;
    s.poly([[x, y], [x + d, y - d], [x + w + d, y - d], [x + w, y]], { cls: 'acc', fill: true });
    s.poly([[x + w, y], [x + w + d, y - d], [x + w + d, y + h - d], [x + w, y + h]], { cls: 'acc', fill: true });
    s.rect(x, y, w, h, { cls: 'acc bgfill' });
  } else if (kind === 'cyl') {
    const lying = variant === 2;
    if (!lying) {
      const rx = z * [0.45, 0.35, 0.5][variant % 3];
      const h = z * [0.9, 1.2, 0.9][variant % 3];
      const ry = rx * 0.32;
      const top = cy - h / 2;
      s.raw(
        `<path d="M${f2(cx - rx)},${f2(top)} L${f2(cx - rx)},${f2(top + h)} A${f2(rx)},${f2(ry)} 0 0 0 ${f2(cx + rx)},${f2(top + h)} L${f2(cx + rx)},${f2(top)}" class="acc soft"/>`,
      );
      ellipse(s, cx, top, rx, ry, 'acc bgfill');
    } else {
      const ry = z * 0.3;
      const w = z * 0.85;
      const rx = ry * 0.32;
      const left = cx - w / 2;
      s.raw(
        `<path d="M${f2(left)},${f2(cy - ry)} L${f2(left + w)},${f2(cy - ry)} A${f2(rx)},${f2(ry)} 0 0 1 ${f2(left + w)},${f2(cy + ry)} L${f2(left)},${f2(cy + ry)}" class="acc soft"/>`,
      );
      ellipse(s, left, cy, rx, ry, 'acc bgfill');
    }
  } else {
    const rr = z * [0.45, 0.4, 0.5][variant % 3];
    s.circle(cx, cy, rr, { cls: 'acc', fill: true });
    s.path(`M${f2(cx - rr)},${f2(cy)} A${f2(rr)},${f2(rr * 0.3)} 0 0 0 ${f2(cx + rr)},${f2(cy)}`, { cls: 'acc' });
    s.circle(cx - rr * 0.35, cy - rr * 0.4, rr * 0.12, { cls: 'bgfill' });
  }
}

/** 입체 여러 개를 줄지어 (번호 붙이기 선택) */
export function solidsRow(items: { kind: Solid; v?: number }[], o: { labels?: string[]; perRow?: number; z?: number } = {}): string {
  const per = o.perRow ?? 5;
  const z = o.z ?? 56;
  const cell = z + 18;
  const rows = Math.ceil(items.length / per);
  const cols = Math.min(per, items.length);
  const lab = o.labels ? 26 : 0;
  const s = new Svg(cols * cell + 10, rows * (cell + lab) + 6);
  items.forEach((it, i) => {
    const cx = 5 + (i % per) * cell + cell / 2;
    const cy = 3 + Math.floor(i / per) * (cell + lab) + cell / 2 + 4;
    drawSolid(s, it.kind, cx, cy, z, it.v ?? 0);
    if (o.labels) s.text(cx, cy + cell / 2 + 14, o.labels[i], { size: 13 }); // 키 큰 둥근기둥과 겹치지 않게
  });
  return s.toString();
}

// ───────────── 평면 모양 ─────────────

export type Flat = 'sq' | 'tri' | 'cir';
export const FLAT_NAME: Record<Flat, string> = { sq: '■ 모양', tri: '▲ 모양', cir: '● 모양' };

/** ■▲● 하나 그리기. variant 로 모양 바꾸기 */
export function drawFlat(s: Svg, kind: Flat, cx: number, cy: number, z: number, variant = 0, cls = 'acc') {
  const v = variant % 4;
  if (kind === 'sq') {
    const w = z * [0.8, 1, 0.6, 0.8][v];
    const h = z * [0.8, 0.6, 0.85, 0.5][v];
    if (v === 3) {
      const pts: [number, number][] = [[cx, cy - h * 0.9], [cx + w * 0.6, cy], [cx, cy + h * 0.9], [cx - w * 0.6, cy]];
      s.poly(pts, { cls, fill: true }); // 돌려 놓은 네모
    } else s.rect(cx - w / 2, cy - h / 2, w, h, { cls, fill: true });
  } else if (kind === 'tri') {
    const w = z * [0.9, 1, 0.7, 0.9][v];
    const h = z * [0.8, 0.6, 0.85, 0.8][v];
    const pts: [number, number][][] = [
      [[cx, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]],
      [[cx - w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]],
      [[cx - w / 3, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]],
      [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx, cy + h / 2]],
    ];
    s.poly(pts[v], { cls, fill: true });
  } else {
    const rr = z * [0.4, 0.45, 0.32, 0.38][v];
    s.circle(cx, cy, rr, { cls, fill: true });
  }
}

export function flatsRow(items: { kind: Flat; v?: number }[], o: { labels?: string[]; perRow?: number; z?: number } = {}): string {
  const per = o.perRow ?? 6;
  const z = o.z ?? 44;
  const cell = z + 14;
  const rows = Math.ceil(items.length / per);
  const cols = Math.min(per, items.length);
  const lab = o.labels ? 16 : 0;
  const s = new Svg(cols * cell + 10, rows * (cell + lab) + 6);
  items.forEach((it, i) => {
    const cx = 5 + (i % per) * cell + cell / 2;
    const cy = 3 + Math.floor(i / per) * (cell + lab) + cell / 2;
    drawFlat(s, it.kind, cx, cy, z, it.v ?? 0);
    if (o.labels) s.text(cx, cy + cell / 2 + 4, o.labels[i], { size: 13 });
  });
  return s.toString();
}

/** 다각형 (꼭짓점 n 개, 약간 찌그러뜨린) 꼭짓점 좌표 */
export function irregularPoly(r: Rng, n: number, cx: number, cy: number, rad: number): [number, number][] {
  const rot = r.int(0, 359);
  return Array.from({ length: n }, (_, i) => {
    const a = ((rot + (360 * i) / n + r.int(-12, 12)) * Math.PI) / 180;
    const rr = rad * (0.78 + r.next() * 0.22);
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)] as [number, number];
  });
}

/** 도형 카드 여러 개: n=0 은 원, 그 밖에는 n각형 */
export function polysRow(r: Rng, ns: number[], o: { labels?: string[]; perRow?: number; z?: number } = {}): string {
  const per = o.perRow ?? 5;
  const z = o.z ?? 54;
  const cell = z + 14;
  const rows = Math.ceil(ns.length / per);
  const cols = Math.min(per, ns.length);
  const lab = o.labels ? 16 : 0;
  const s = new Svg(cols * cell + 10, rows * (cell + lab) + 6);
  ns.forEach((n, i) => {
    const cx = 5 + (i % per) * cell + cell / 2;
    const cy = 3 + Math.floor(i / per) * (cell + lab) + cell / 2;
    if (n === 0) s.circle(cx, cy, z * (0.32 + r.next() * 0.12), { cls: 'acc', fill: true });
    else s.poly(irregularPoly(r, n, cx, cy, z * 0.46), { cls: 'acc', fill: true });
    if (o.labels) s.text(cx, cy + cell / 2 + 4, o.labels[i], { size: 13 });
  });
  return s.toString();
}

// ───────────── 쌓기나무 ─────────────

/** 한 줄로 쌓은 쌓기나무 (각 칸의 높이). 모든 나무가 보임 */
export function drawCubes(s: Svg, x0: number, base: number, heights: number[], u: number) {
  const d = u * 0.4;
  const top = (i: number) => base - heights[i] * u;
  // 1) 윗면
  heights.forEach((h, i) => {
    if (!h) return;
    const x = x0 + i * u;
    s.poly([[x, top(i)], [x + d, top(i) - d], [x + u + d, top(i) - d], [x + u, top(i)]], { cls: 'acc', fill: true });
  });
  // 2) 앞면
  heights.forEach((h, i) => {
    for (let k = 0; k < h; k++) s.rect(x0 + i * u, base - (k + 1) * u, u, u, { cls: 'acc bgfill' });
  });
  // 3) 오른쪽 옆면 (오른쪽 이웃보다 높은 부분만)
  heights.forEach((h, i) => {
    const nb = heights[i + 1] ?? 0;
    const x = x0 + (i + 1) * u;
    for (let k = nb; k < h; k++) {
      const yb = base - k * u;
      s.poly([[x, yb], [x, yb - u], [x + d, yb - u - d], [x + d, yb - d]], { cls: 'acc', fill: true });
    }
  });
}

export function cubesFig(heights: number[], u = 26): string {
  const maxH = Math.max(...heights);
  const s = new Svg(heights.length * u + u * 0.4 + 16, maxH * u + u * 0.4 + 14);
  drawCubes(s, 8, maxH * u + u * 0.4 + 6, heights, u);
  return s.toString();
}

/** 여러 단계의 쌓기나무를 나란히 (라벨: 첫째, 둘째 …) */
export function cubeStages(stages: number[][], labels: string[], u = 18): string {
  const maxH = Math.max(...stages.flat());
  const widths = stages.map((h) => h.length * u + u * 0.4);
  const s = new Svg(widths.reduce((a, b) => a + b, 0) + 22 * stages.length + 6, maxH * u + u * 0.4 + 34);
  let x = 10;
  const base = maxH * u + u * 0.4 + 8;
  stages.forEach((h, i) => {
    drawCubes(s, x, base, h, u);
    s.text(x + widths[i] / 2, base + 16, labels[i], { size: 12 });
    x += widths[i] + 22;
  });
  return s.toString();
}

// ───────────── 자 ─────────────

/**
 * 자와 그 위에 놓인 막대. start~end (cm, 소수 가능)
 * 눈금 0 ~ max cm
 */
export function rulerFig(max: number, start: number, end: number, o: { label?: string; mm?: boolean } = {}): string {
  const px = Math.min(28, Math.floor(300 / max));
  const w = max * px + 30;
  const s = new Svg(w, 92);
  const X = (c: number) => 15 + c * px;
  // 막대 (물건)
  s.rect(X(start), 10, (end - start) * px, 22, { cls: 'acc2', fill: true });
  if (o.label) s.text((X(start) + X(end)) / 2, 21, o.label, { size: 12 });
  // 자 몸통
  s.rect(5, 38, w - 10, 50, { cls: 'grid' });
  for (let c = 0; c <= max; c++) {
    s.line(X(c), 38, X(c), 54, { width: 1.2 });
    s.text(X(c), 68, String(c), { size: 11 });
    if (o.mm !== false && c < max) {
      for (let k = 1; k < 10; k++) s.line(X(c + k / 10), 38, X(c + k / 10), k === 5 ? 48 : 44, { width: 0.5 });
    }
  }
  s.text(w - 20, 80, 'cm', { size: 10, cls: 'muted' });
  return s.toString();
}

/** 1 cm 모눈 위의 선(꺾은선) — pts 는 모눈 좌표 */
export function gridPath(cols: number, rows: number, paths: { pts: [number, number][]; label?: string; cls?: string }[]): string {
  const u = 22;
  const m = paths.some((p) => p.label) ? 24 : 10; // 이름표(가, 나)가 잘리지 않게 여백
  const s = new Svg(cols * u + m + 10, rows * u + m + 10);
  for (let i = 0; i <= cols; i++) s.line(m + i * u, m, m + i * u, m + rows * u, { cls: 'grid' });
  for (let j = 0; j <= rows; j++) s.line(m, m + j * u, m + cols * u, m + j * u, { cls: 'grid' });
  for (const p of paths) {
    s.poly(p.pts.map(([x, y]) => [m + x * u, m + y * u] as [number, number]), { closed: false, cls: (p.cls ?? 'acc') + ' thick' });
    if (p.label) {
      const [x, y] = p.pts[0];
      s.text(m + x * u - 11, m + y * u - 10, p.label, { size: 13 });
    }
  }
  return s.toString();
}

/** 모눈 위 칸 모양들 (넓이 비교) */
export function gridShapes(shapes: { cells: [number, number][]; label: string }[], cols: number, rows: number): string {
  const u = 20;
  const blockW = cols * u + 20;
  const s = new Svg(shapes.length * blockW + 10, rows * u + 36);
  shapes.forEach((sh, k) => {
    const x0 = 10 + k * blockW;
    for (let i = 0; i <= cols; i++) s.line(x0 + i * u, 8, x0 + i * u, 8 + rows * u, { cls: 'grid' });
    for (let j = 0; j <= rows; j++) s.line(x0, 8 + j * u, x0 + cols * u, 8 + j * u, { cls: 'grid' });
    for (const [cx, cy] of sh.cells) s.rect(x0 + cx * u, 8 + cy * u, u, u, { cls: 'acc', fill: true });
    s.text(x0 + (cols * u) / 2, rows * u + 24, sh.label, { size: 13 });
  });
  return s.toString();
}

/** 모눈 위 가로 막대들 (위아래로 쌓음) */
export function barsOnGrid(bars: { start: number; len: number; label: string }[], cols: number): string {
  const u = 20;
  const s = new Svg(cols * u + 40, bars.length * (u + 10) + 10);
  bars.forEach((b, k) => {
    const y = 8 + k * (u + 10);
    s.text(12, y + u / 2, b.label, { size: 13 });
    for (let i = 0; i < cols; i++) s.rect(28 + i * u, y, u, u, { cls: 'grid' });
    for (let i = 0; i < b.len; i++) s.rect(28 + (b.start + i) * u, y, u, u, { cls: 'acc', fill: true });
  });
  return s.toString();
}

/** 무작위로 이어 붙인 칸 n 개 (cols×rows 안) */
export function polyomino(r: Rng, n: number, cols: number, rows: number): [number, number][] {
  for (;;) {
    const cells: [number, number][] = [[r.int(0, cols - 1), r.int(0, rows - 1)]];
    const has = (x: number, y: number) => cells.some(([a, b]) => a === x && b === y);
    let guard = 0;
    while (cells.length < n && guard++ < 400) {
      const [x, y] = r.pick(cells);
      const [dx, dy] = r.pick([[1, 0], [-1, 0], [0, 1], [0, -1]] as const);
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < cols && ny < rows && !has(nx, ny)) cells.push([nx, ny]);
    }
    if (cells.length === n) return cells;
  }
}

// ───────────── 비교하기 ─────────────

/** 왼쪽 끝을 맞춘 연필(막대)들 */
export function pencils(lengths: number[], labels: string[], o: { aligned?: boolean; offsets?: number[] } = {}): string {
  const u = 22;
  const maxEnd = Math.max(...lengths.map((l, i) => l + (o.offsets?.[i] ?? 0)));
  const s = new Svg(maxEnd * u + 60, lengths.length * 34 + 12);
  lengths.forEach((l, i) => {
    const y = 10 + i * 34;
    const x = 34 + (o.offsets?.[i] ?? 0) * u;
    const body = l * u - 14;
    s.text(14, y + 10, labels[i], { size: 13 });
    s.rect(x, y, body, 20, { cls: i % 2 ? 'acc2' : 'acc', fill: true });
    s.poly([[x + body, y], [x + body + 14, y + 10], [x + body, y + 20]], { cls: 'acc', fill: false });
  });
  return s.toString();
}

/** 시소: heavier 쪽이 아래로 */
export function seesaw(left: string, right: string, heavier: 'L' | 'R'): string {
  const s = new Svg(240, 110);
  const tilt = heavier === 'L' ? 18 : -18;
  const cx = 120;
  const cy = 72;
  s.poly([[cx, cy], [cx - 14, 100], [cx + 14, 100]], { cls: 'acc', fill: true });
  const lx = cx - 100;
  const rx = cx + 100;
  const ly = cy + tilt;
  const ry = cy - tilt;
  s.line(lx, ly, rx, ry, { width: 4 });
  s.rect(lx + 4, ly - 30, 52, 26, { cls: 'acc2', fill: true });
  s.text(lx + 30, ly - 17, left, { size: 13 });
  s.rect(rx - 56, ry - 30, 52, 26, { cls: 'acc2', fill: true });
  s.text(rx - 30, ry - 17, right, { size: 13 });
  return s.toString();
}

/** 그릇(컵) 여러 개: 크기 w,h 와 물 높이 water(0~1) */
export function cups(items: { w: number; h: number; water?: number }[], labels: string[]): string {
  const maxH = Math.max(...items.map((c) => c.h));
  const s = new Svg(items.reduce((a, c) => a + c.w + 24, 0) + 10, maxH + 40);
  let x = 14;
  const base = maxH + 10;
  items.forEach((c, i) => {
    if (c.water) s.rect(x, base - c.h * c.water, c.w, c.h * c.water, { cls: 'acc', fill: true });
    s.poly([[x, base - c.h], [x, base], [x + c.w, base], [x + c.w, base - c.h]], { closed: false });
    s.text(x + c.w / 2, base + 16, labels[i], { size: 13 });
    x += c.w + 24;
  });
  return s.toString();
}

// ───────────── 무늬·규칙 ─────────────

export type PatShape = Flat | 'star';
/** 모양 줄 (null 은 ? 칸) */
export function patternRow(items: (Flat | null)[], o: { z?: number; perRow?: number } = {}): string {
  const z = o.z ?? 30;
  const per = o.perRow ?? 10;
  const cell = z + 10;
  const rows = Math.ceil(items.length / per);
  const s = new Svg(Math.min(per, items.length) * cell + 10, rows * cell + 8);
  items.forEach((it, i) => {
    const cx = 5 + (i % per) * cell + cell / 2;
    const cy = 4 + Math.floor(i / per) * cell + cell / 2;
    if (it === null) {
      s.rect(cx - z / 2, cy - z / 2, z, z, { cls: 'acc2' });
      s.text(cx, cy + 1, '?', { size: 16 });
    } else drawFlat(s, it, cx, cy, z, 0);
  });
  return s.toString();
}

/** 방향 화살표(삼각형) 줄. dir: 0 위, 1 오른쪽, 2 아래, 3 왼쪽. null 은 ? */
export function arrowRow(dirs: (number | null)[]): string {
  const z = 30;
  const cell = z + 10;
  const s = new Svg(dirs.length * cell + 10, cell + 8);
  dirs.forEach((d, i) => {
    const cx = 5 + i * cell + cell / 2;
    const cy = 4 + cell / 2;
    s.rect(cx - z / 2, cy - z / 2, z, z, { cls: d === null ? 'acc2' : 'grid' });
    if (d === null) {
      s.text(cx, cy + 1, '?', { size: 16 });
      return;
    }
    const base: [number, number][] = [[0, -11], [10, 9], [-10, 9]];
    const rot = (d * Math.PI) / 2;
    const pts = base.map(([x, y]) => [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)] as [number, number]);
    s.poly(pts, { cls: 'acc', fill: true });
  });
  return s.toString();
}

// ───────────── 수직선 뛰어 세기 ─────────────

/** start 에서 step 씩 jumps 번 뛰는 수직선 (labelAll=false 면 시작·끝만 숫자) */
export function jumpLine(min: number, max: number, start: number, step: number, jumps: number, o: { tick?: number; hideEnd?: boolean } = {}): string {
  const w = 320;
  const s = new Svg(w, 80);
  const tick = o.tick ?? 1;
  const X = (x: number) => 16 + ((x - min) / (max - min)) * (w - 32);
  s.line(6, 52, w - 6, 52, { arrow: true });
  const n = Math.round((max - min) / tick);
  // 눈금이 많으면 5칸(또는 10칸)마다 수를 써서 0, 5, 10 … 처럼 읽기 쉽게
  const labelEvery = n <= 20 ? 1 : n <= 50 ? 5 : 10;
  for (let i = 0; i <= n; i++) {
    const x = min + i * tick;
    s.line(X(x), 47, X(x), 57);
    const isEnd = x === start + step * jumps;
    if (i % labelEvery === 0 && !(o.hideEnd && isEnd)) s.text(X(x), 70, String(x), { size: 10 });
  }
  for (let j = 0; j < jumps; j++) {
    const a = X(start + j * step);
    const b = X(start + (j + 1) * step);
    s.path(`M${f2(a)},48 Q${f2((a + b) / 2)},${f2(48 - Math.min(40, Math.abs(b - a) * 0.7))} ${f2(b)},48`, { cls: 'acc' });
  }
  if (o.hideEnd) s.text(X(start + step * jumps), 70, '?', { size: 13, cls: 'acc2' });
  return s.toString();
}

// ───────────── ○ 그래프 ─────────────

/** ○ 그래프 (아래에서 위로). 세로칸 max 개 */
export function oGraph(labels: string[], counts: number[], o: { max?: number; unit?: string; mark?: string } = {}): string {
  const max = o.max ?? Math.max(...counts);
  const cw = 46;
  const ch = 22;
  const left = 30;
  const s = new Svg(left + labels.length * cw + 12, max * ch + 40);
  const bottom = max * ch + 10;
  for (let j = 0; j <= max; j++) s.line(left, bottom - j * ch, left + labels.length * cw, bottom - j * ch, { cls: 'grid' });
  for (let i = 0; i <= labels.length; i++) s.line(left + i * cw, bottom, left + i * cw, bottom - max * ch, { cls: 'grid' });
  for (let j = 1; j <= max; j++) s.text(left - 8, bottom - j * ch + ch / 2, String(j), { size: 10, cls: 'muted', anchor: 'end' });
  labels.forEach((l, i) => {
    for (let k = 0; k < counts[i]; k++) {
      const cx = left + i * cw + cw / 2;
      const cy = bottom - k * ch - ch / 2;
      if (o.mark === 'x') {
        s.line(cx - 7, cy - 7, cx + 7, cy + 7, { cls: 'acc', width: 2 });
        s.line(cx - 7, cy + 7, cx + 7, cy - 7, { cls: 'acc', width: 2 });
      } else s.circle(cx, cy, 8, { cls: 'acc' });
    }
    s.text(left + i * cw + cw / 2, bottom + 15, l, { size: 12 });
  });
  if (o.unit) s.text(left - 6, bottom - max * ch - 4 > 6 ? bottom - max * ch - 4 : 8, `(${o.unit})`, { size: 9, cls: 'muted', anchor: 'end' });
  return s.toString();
}

/** SVG 여러 개를 가로로 이어 붙여 하나로 */
export function hstack(svgs: string[], gap = 12): string {
  const dims = svgs.map((sv) => {
    const m = sv.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    return m ? [Number(m[1]), Number(m[2])] : [100, 100];
  });
  const w = dims.reduce((a, d) => a + d[0], 0) + gap * (svgs.length - 1);
  const h = Math.max(...dims.map((d) => d[1]));
  let x = 0;
  const inner = svgs
    .map((sv, i) => {
      const body = sv.replace(/^<svg[^>]*>/, `<svg x="${x}" y="0" width="${dims[i][0]}" height="${dims[i][1]}" viewBox="0 0 ${dims[i][0]} ${dims[i][1]}">`);
      x += dims[i][0] + gap;
      return body;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="fig">${inner}</svg>`;
}
