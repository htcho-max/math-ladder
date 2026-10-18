// 그림(SVG) 도우미. 색은 테마를 따르도록 currentColor + 클래스 사용:
//   cls 'acc'  = 강조 선(파랑), 'acc2' = 두 번째 강조(주황), 'soft' = 연한 채움, 'grid' = 격자선
// 모든 좌표는 SVG 픽셀(위가 y=0). 수학 좌표 그래프는 Plane 을 쓸 것.
import { round } from './nt';

import { hashStr } from './rng';
type Attrs = Record<string, string | number | undefined>;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const at = (a: Attrs) =>
  Object.entries(a)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}="${typeof v === 'number' ? round(v, 2) : esc(String(v))}"`)
    .join(' ');

export class Svg {
  private els: string[] = [];
  constructor(
    public w: number,
    public h: number,
  ) {}
  raw(s: string): this {
    this.els.push(s);
    return this;
  }
  line(x1: number, y1: number, x2: number, y2: number, o: { cls?: string; dash?: boolean; width?: number; arrow?: boolean } = {}): this {
    return this.raw(
      `<line ${at({ x1, y1, x2, y2, class: o.cls, 'stroke-dasharray': o.dash ? '4 3' : undefined, style: o.width ? `stroke-width:${o.width}px` : undefined, 'marker-end': o.arrow ? 'url(#arr)' : undefined })}/>`,
    );
  }
  /** 다각형(closed=true) 또는 꺾은선 */
  poly(pts: [number, number][], o: { cls?: string; closed?: boolean; fill?: boolean; dash?: boolean } = {}): this {
    const p = pts.map(([x, y]) => `${round(x, 2)},${round(y, 2)}`).join(' ');
    const tag = o.closed === false ? 'polyline' : 'polygon';
    const cls = [o.cls, o.fill ? 'soft' : undefined].filter(Boolean).join(' ') || undefined;
    return this.raw(`<${tag} ${at({ points: p, class: cls, 'stroke-dasharray': o.dash ? '4 3' : undefined })}/>`);
  }
  rect(x: number, y: number, w: number, h: number, o: { cls?: string; fill?: boolean } = {}): this {
    const cls = [o.cls, o.fill ? 'soft' : undefined].filter(Boolean).join(' ') || undefined;
    return this.raw(`<rect ${at({ x, y, width: w, height: h, class: cls })}/>`);
  }
  circle(cx: number, cy: number, r: number, o: { cls?: string; fill?: boolean; dot?: boolean; dash?: boolean } = {}): this {
    const cls = [o.cls, o.fill ? 'soft' : undefined, o.dot ? 'dot' : undefined].filter(Boolean).join(' ') || undefined;
    return this.raw(`<circle ${at({ cx, cy, r, class: cls, 'stroke-dasharray': o.dash ? '4 3' : undefined })}/>`);
  }
  /** 점 (채운 작은 원) */
  dot(x: number, y: number, o: { cls?: string; r?: number } = {}): this {
    return this.circle(x, y, o.r ?? 3.5, { cls: o.cls, dot: true });
  }
  /** 글자. anchor: 'start'|'middle'|'end' */
  text(x: number, y: number, s: string, o: { anchor?: 'start' | 'middle' | 'end'; size?: number; cls?: string; italic?: boolean } = {}): this {
    return this.raw(
      `<text ${at({ x, y, 'text-anchor': o.anchor ?? 'middle', 'dominant-baseline': 'middle', 'font-size': o.size ?? 14, class: o.cls, 'font-style': o.italic ? 'italic' : undefined })}>${esc(s)}</text>`,
    );
  }
  /** 원호/부채꼴 각 표시: 중심 (cx,cy), 반지름 r, 각도(도, 수학 방향 반시계, 0=오른쪽) a1→a2 */
  arc(cx: number, cy: number, r: number, a1: number, a2: number, o: { cls?: string; sector?: boolean } = {}): this {
    const rad = (d: number) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(rad(a1));
    const y1 = cy - r * Math.sin(rad(a1));
    const x2 = cx + r * Math.cos(rad(a2));
    const y2 = cy - r * Math.sin(rad(a2));
    let sweep = a2 - a1;
    while (sweep < 0) sweep += 360;
    const large = sweep > 180 ? 1 : 0;
    const d = o.sector
      ? `M${round(cx, 2)},${round(cy, 2)} L${round(x1, 2)},${round(y1, 2)} A${r},${r} 0 ${large} 0 ${round(x2, 2)},${round(y2, 2)} Z`
      : `M${round(x1, 2)},${round(y1, 2)} A${r},${r} 0 ${large} 0 ${round(x2, 2)},${round(y2, 2)}`;
    const cls = [o.cls, o.sector ? 'soft' : 'nofill'].filter(Boolean).join(' ');
    return this.raw(`<path d="${d}" class="${cls}"/>`);
  }
  /** 직각 표시: 꼭짓점 (x,y), 두 변 방향 단위벡터 u, v */
  rightAngle(x: number, y: number, u: [number, number], v: [number, number], s = 10): this {
    const p1: [number, number] = [x + u[0] * s, y + u[1] * s];
    const p2: [number, number] = [x + u[0] * s + v[0] * s, y + u[1] * s + v[1] * s];
    const p3: [number, number] = [x + v[0] * s, y + v[1] * s];
    return this.poly([p1, p2, p3], { closed: false });
  }
  path(d: string, o: { cls?: string; fill?: boolean } = {}): this {
    const cls = [o.cls, o.fill ? 'soft' : 'nofill'].filter(Boolean).join(' ');
    return this.raw(`<path d="${d}" class="${cls}"/>`);
  }
  toString(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}" width="${this.w}" height="${this.h}" class="fig"><defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="arrowhead"/></marker></defs>${this.els.join('')}</svg>`;
  }
}

/** 수학 좌표평면. x∈[x0,x1], y∈[y0,y1] 을 w×h 픽셀에 */
export class Plane {
  svg: Svg;
  private pad = 18;
  constructor(
    public x0: number,
    public x1: number,
    public y0: number,
    public y1: number,
    o: { w?: number; h?: number; grid?: boolean; labels?: boolean; step?: number } = {},
  ) {
    const w = o.w ?? 260;
    const h = o.h ?? 260;
    this.svg = new Svg(w, h);
    const step = o.step ?? 1;
    if (o.grid !== false) {
      for (let x = Math.ceil(x0 / step) * step; x <= x1; x += step) this.svg.line(this.X(x), this.Y(y0), this.X(x), this.Y(y1), { cls: 'grid' });
      for (let y = Math.ceil(y0 / step) * step; y <= y1; y += step) this.svg.line(this.X(x0), this.Y(y), this.X(x1), this.Y(y), { cls: 'grid' });
    }
    // 축
    if (y0 <= 0 && y1 >= 0) this.svg.line(this.X(x0), this.Y(0), this.X(x1) + 6, this.Y(0), { arrow: true });
    if (x0 <= 0 && x1 >= 0) this.svg.line(this.X(0), this.Y(y0), this.X(0), this.Y(y1) - 6, { arrow: true });
    this.svg.text(this.X(x1) + 4, this.Y(0) + 12, 'x', { size: 13, italic: true });
    this.svg.text(this.X(0) - 10, this.Y(y1) - 4, 'y', { size: 13, italic: true });
    this.svg.text(this.X(0) - 8, this.Y(0) + 10, 'O', { size: 12, italic: true });
    if (o.labels !== false) {
      const ls = step * Math.max(1, Math.round((x1 - x0) / step / 8));
      for (let x = Math.ceil(x0 / ls) * ls; x <= x1; x += ls) if (x !== 0) this.svg.text(this.X(x), this.Y(0) + 11, String(round(x)), { size: 10, cls: 'muted' });
      const lsy = step * Math.max(1, Math.round((y1 - y0) / step / 8));
      for (let y = Math.ceil(y0 / lsy) * lsy; y <= y1; y += lsy) if (y !== 0) this.svg.text(this.X(0) - 8, this.Y(y), String(round(y)), { size: 10, cls: 'muted', anchor: 'end' });
    }
  }
  X(x: number): number {
    return this.pad + ((x - this.x0) / (this.x1 - this.x0)) * (this.svg.w - 2 * this.pad);
  }
  Y(y: number): number {
    return this.svg.h - this.pad - ((y - this.y0) / (this.y1 - this.y0)) * (this.svg.h - 2 * this.pad);
  }
  /** 함수 그래프 (정의역 [a,b], 기본 전체). 불연속(점근선)은 값이 범위를 크게 벗어나면 끊음 */
  fn(f: (x: number) => number, o: { cls?: string; a?: number; b?: number; dash?: boolean } = {}): this {
    const a = o.a ?? this.x0;
    const b = o.b ?? this.x1;
    const N = 240;
    let d = '';
    let pen = false;
    const span = this.y1 - this.y0;
    for (let i = 0; i <= N; i++) {
      const x = a + ((b - a) * i) / N;
      const y = f(x);
      if (!Number.isFinite(y) || y < this.y0 - span || y > this.y1 + span) {
        pen = false;
        continue;
      }
      const yc = Math.max(this.y0 - span * 0.05, Math.min(this.y1 + span * 0.05, y));
      d += `${pen ? 'L' : 'M'}${round(this.X(x), 2)},${round(this.Y(yc), 2)} `;
      pen = true;
    }
    const cid = `pc${hashStr(d + this.x0 + ',' + this.x1 + ',' + this.y0 + ',' + this.y1 + this.svg.w).toString(36)}`;
    this.svg.raw(`<clipPath id="${cid}"><rect x="${this.X(this.x0)}" y="${this.Y(this.y1)}" width="${this.X(this.x1) - this.X(this.x0)}" height="${this.Y(this.y0) - this.Y(this.y1)}"/></clipPath>`);
    this.svg.raw(`<path d="${d.trim()}" class="${o.cls ?? 'acc'} nofill thick" clip-path="url(#${cid})"${o.dash ? ' stroke-dasharray="5 4"' : ''}/>`);
    return this;
  }
  point(x: number, y: number, label?: string, o: { cls?: string; dx?: number; dy?: number; open?: boolean } = {}): this {
    if (o.open) this.svg.circle(this.X(x), this.Y(y), 3.5, { cls: (o.cls ?? 'acc') + ' bgfill' });
    else this.svg.dot(this.X(x), this.Y(y), { cls: o.cls ?? 'acc' });
    if (label) this.svg.text(this.X(x) + (o.dx ?? 10), this.Y(y) + (o.dy ?? -10), label, { size: 12 });
    return this;
  }
  seg(x1: number, y1: number, x2: number, y2: number, o: { cls?: string; dash?: boolean } = {}): this {
    this.svg.line(this.X(x1), this.Y(y1), this.X(x2), this.Y(y2), o);
    return this;
  }
  polygon(pts: [number, number][], o: { cls?: string; fill?: boolean } = {}): this {
    this.svg.poly(pts.map(([x, y]) => [this.X(x), this.Y(y)] as [number, number]), { cls: o.cls ?? 'acc', fill: o.fill });
    return this;
  }
  label(x: number, y: number, s: string, o: { size?: number } = {}): this {
    this.svg.text(this.X(x), this.Y(y), s, { size: o.size ?? 12 });
    return this;
  }
  toString(): string {
    return this.svg.toString();
  }
}

// ───────────── 자주 쓰는 그림 ─────────────

/** 아날로그 시계 */
export function clock(h: number, m: number, size = 140): string {
  const s = new Svg(size, size);
  const c = size / 2;
  const R = c - 6;
  s.circle(c, c, R);
  for (let i = 1; i <= 12; i++) {
    const a = ((90 - i * 30) * Math.PI) / 180;
    s.text(c + (R - 14) * Math.cos(a), c - (R - 14) * Math.sin(a), String(i), { size: 12 });
  }
  for (let i = 0; i < 60; i++) {
    const a = ((90 - i * 6) * Math.PI) / 180;
    const l = i % 5 === 0 ? 6 : 3;
    s.line(c + R * Math.cos(a), c - R * Math.sin(a), c + (R - l) * Math.cos(a), c - (R - l) * Math.sin(a), { width: i % 5 === 0 ? 1.5 : 0.8 });
  }
  const ha = ((90 - ((h % 12) + m / 60) * 30) * Math.PI) / 180;
  const ma = ((90 - m * 6) * Math.PI) / 180;
  s.line(c, c, c + R * 0.5 * Math.cos(ha), c - R * 0.5 * Math.sin(ha), { width: 4, cls: 'acc2' });
  s.line(c, c, c + R * 0.78 * Math.cos(ma), c - R * 0.78 * Math.sin(ma), { width: 2.5, cls: 'acc' });
  s.dot(c, c, { r: 3 });
  return s.toString();
}

/** 수직선. marks: 눈금 위 글자, points: 표시할 점 */
export function numberLine(
  min: number,
  max: number,
  o: { step?: number; labelEvery?: number; points?: { x: number; label?: string; open?: boolean }[]; hideLabels?: number[]; w?: number; range?: { a: number; b: number; aOpen?: boolean; bOpen?: boolean } } = {},
): string {
  const w = o.w ?? 320;
  const s = new Svg(w, 64);
  const step = o.step ?? 1;
  const X = (x: number) => 16 + ((x - min) / (max - min)) * (w - 32);
  s.line(6, 32, w - 6, 32, { arrow: true });
  const n = Math.round((max - min) / step);
  const le = o.labelEvery ?? 1;
  for (let i = 0; i <= n; i++) {
    const x = round(min + i * step);
    s.line(X(x), 26, X(x), 38);
    if (i % le === 0 && !(o.hideLabels ?? []).includes(x)) s.text(X(x), 52, String(x), { size: 11 });
  }
  if (o.range) {
    s.line(X(o.range.a), 32, X(o.range.b), 32, { cls: 'acc', width: 4 });
  }
  for (const p of o.points ?? []) {
    if (p.open) s.circle(X(p.x), 32, 4.5, { cls: 'acc bgfill' });
    else s.dot(X(p.x), 32, { cls: 'acc', r: 4.5 });
    if (p.label) s.text(X(p.x), 14, p.label, { size: 13, cls: 'acc' });
  }
  return s.toString();
}

/** 막대그래프 (세로) */
export function barChart(labels: string[], values: number[], o: { unit?: string; max?: number; step?: number; title?: string } = {}): string {
  const w = Math.max(240, 56 * labels.length + 60);
  const h = 200;
  const s = new Svg(w, h);
  const max = o.max ?? Math.ceil(Math.max(...values) * 1.15);
  const step = o.step ?? Math.max(1, Math.ceil(max / 5));
  const top = 20,
    bottom = h - 30,
    left = 40;
  const Y = (v: number) => bottom - (v / max) * (bottom - top);
  for (let v = 0; v <= max; v += step) {
    s.line(left, Y(v), w - 10, Y(v), { cls: 'grid' });
    s.text(left - 6, Y(v), String(v), { size: 10, anchor: 'end', cls: 'muted' });
  }
  const bw = Math.min(36, (w - left - 20) / labels.length - 12);
  labels.forEach((l, i) => {
    const cx = left + 16 + i * ((w - left - 20) / labels.length) + bw / 2;
    s.rect(cx - bw / 2, Y(values[i]), bw, bottom - Y(values[i]), { cls: 'acc', fill: true });
    s.text(cx, bottom + 14, l, { size: 11 });
  });
  s.line(left, bottom, w - 10, bottom);
  if (o.unit) s.text(left - 6, top - 10, `(${o.unit})`, { size: 10, anchor: 'end', cls: 'muted' });
  return s.toString();
}

/** 꺾은선그래프 */
export function lineChart(labels: string[], values: number[], o: { unit?: string; min?: number; max?: number; step?: number } = {}): string {
  const w = Math.max(260, 50 * labels.length + 60);
  const h = 200;
  const s = new Svg(w, h);
  const min = o.min ?? 0;
  const max = o.max ?? Math.ceil(Math.max(...values) * 1.1);
  const step = o.step ?? Math.max(1, Math.ceil((max - min) / 5));
  const top = 20,
    bottom = h - 30,
    left = 40;
  const Y = (v: number) => bottom - ((v - min) / (max - min)) * (bottom - top);
  for (let v = min; v <= max; v += step) {
    s.line(left, Y(v), w - 10, Y(v), { cls: 'grid' });
    s.text(left - 6, Y(v), String(round(v)), { size: 10, anchor: 'end', cls: 'muted' });
  }
  const X = (i: number) => left + 20 + i * ((w - left - 40) / Math.max(1, labels.length - 1));
  s.poly(
    values.map((v, i) => [X(i), Y(v)] as [number, number]),
    { closed: false, cls: 'acc thick' },
  );
  values.forEach((v, i) => {
    s.dot(X(i), Y(v), { cls: 'acc' });
    s.text(X(i), bottom + 14, labels[i], { size: 11 });
  });
  s.line(left, bottom, w - 10, bottom);
  if (o.unit) s.text(left - 6, top - 10, `(${o.unit})`, { size: 10, anchor: 'end', cls: 'muted' });
  return s.toString();
}

/** 정다각형 꼭짓점 (중심 cx,cy, 반지름 r, n각형) */
export function regularPolygon(n: number, cx: number, cy: number, r: number, rot = -90): [number, number][] {
  return Array.from({ length: n }, (_, i) => {
    const a = ((rot + (360 * i) / n) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number];
  });
}
