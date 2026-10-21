// m3h1 심화·최상위 유형 공용 도우미 (hard-*.ts 에서만 사용)
import { F } from '../../core/frac';
import { lcm, simplifySqrt } from '../../core/nt';
import { termsTex } from '../../core/tex';

const hasB = (s: string) => {
  const c = s.charCodeAt(s.length - 1);
  return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 !== 0;
};
const isRieul = (s: string) => {
  const c = s.charCodeAt(s.length - 1);
  return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 === 8;
};

/**
 * 수식·낱말 뒤 조사 고르기. jo('8', '이', '가') = '이'(팔), jo('x', '을', '를') = '를'(엑스), jo('3', '으로', '로', true) = '으로'
 * rieul: '으로/로' 처럼 ㄹ 받침을 받침 없음으로 보는 조사면 true
 */
export function jo(tex: string, withB: string, without: string, rieul = false): string {
  const s = tex
    .replace(/\\(?:circ|degree)/g, '도')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[{}()[\]\s^_|$]+$/g, '')
    .replace(/[^0-9A-Za-z가-힣]+$/g, '');
  const ch = s.slice(-1);
  if (/[가-힣]/.test(ch)) {
    if (!hasB(ch)) return without;
    if (rieul && isRieul(ch)) return without;
    return withB;
  }
  const digit: Record<string, 'B' | 'L' | 'N'> = { '0': 'B', '1': 'L', '2': 'N', '3': 'B', '4': 'N', '5': 'N', '6': 'B', '7': 'L', '8': 'L', '9': 'N' };
  let k: 'B' | 'L' | 'N' = 'N';
  if (/[0-9]/.test(ch)) k = digit[ch];
  else if (/[lmnr]/i.test(ch)) k = /[lr]/i.test(ch) ? 'L' : 'B';
  if (k === 'N') return without;
  if (k === 'L' && rieul) return without;
  return withB;
}

export const deg = (x: number | string) => `${x}^\\circ`;
export const ov = (s: string) => `\\overline{${s}}`;
export const ang = (s: string) => `\\angle ${s}`;

/** p + q√3 (p, q 유리수) */
export type R3 = [F, F];
export function r3(p: F, q: F): string {
  const D = lcm(p.d, q.d);
  const Pn = (p.n * D) / p.d,
    Q = (q.n * D) / q.d;
  const t3 = { c: Q, v: '\\sqrt{3}' },
    t0 = { c: Pn, v: '' };
  const body = termsTex(Pn < 0 && Q > 0 ? [t3, t0] : [t0, t3]);
  if (D === 1) return body;
  if (Pn === 0 && Q < 0) return `-\\frac{${termsTex([{ c: -Q, v: '\\sqrt{3}' }])}}{${D}}`;
  if (Q === 0 && Pn < 0) return `-\\frac{${-Pn}}{${D}}`;
  return `\\frac{${body}}{${D}}`;
}
export const r3add = (a: R3, b: R3): R3 => [a[0].add(b[0]), a[1].add(b[1])];
export const r3sub = (a: R3, b: R3): R3 => [a[0].sub(b[0]), a[1].sub(b[1])];
export const r3mul = (a: R3, b: R3): R3 => [a[0].mul(b[0]).add(a[1].mul(b[1]).mul(3)), a[0].mul(b[1]).add(a[1].mul(b[0]))];
export function r3inv([p, q]: R3): R3 {
  const den = p.mul(p).sub(q.mul(q).mul(3));
  return [p.div(den), q.neg().div(den)];
}
export const r3s = (k: F | number, a: R3): R3 => [F.of(k).mul(a[0]), F.of(k).mul(a[1])];

/** (num/den)·√rad 를 간단히: \frac{a\sqrt{n}}{d} */
export function ks(num: number, rad: number, den = 1): string {
  const [o, i] = simplifySqrt(rad);
  const f = new F(num * o, den);
  if (f.n === 0) return '0';
  if (i === 1) return f.tex();
  const s = f.n < 0 ? '-' : '';
  const a = Math.abs(f.n);
  const body = a === 1 ? `\\sqrt{${i}}` : `${a}\\sqrt{${i}}`;
  return f.d === 1 ? `${s}${body}` : `${s}\\frac{${body}}{${f.d}}`;
}

/** 2×2 정수 행렬 곱 */
export const mm = (A: number[][], B: number[][]) => A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)));
export const mtex = (m: (number | string)[][]) => `\\begin{pmatrix} ${m.map((row) => row.join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;

/** 완전제곱수 */
export const sq = (n: number) => n >= 0 && Math.round(Math.sqrt(n)) ** 2 === n;
