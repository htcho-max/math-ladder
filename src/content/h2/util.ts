// h2 그룹(공통수학2·대수·미적분Ⅰ) 공용 도우미
import type { Level } from '../../core/types';
import type { Rng } from '../../core/rng';
import { F } from '../../core/frac';
import { makeChoices, numTex, poly, sqrtTex, termsTex } from '../../core/tex';

export type Num = number | F;

/** 레벨별 값 고르기 */
export const L = <T>(level: Level, a: T, b: T, c: T): T => (level === 1 ? a : level === 2 ? b : c);

/** 수 → TeX (분수면 \frac) */
export const nt = (x: Num): string => (x instanceof F ? x.tex() : numTex(x, 'frac'));

/** 좌표 (a, b) */
export const pt = (x: Num, y: Num): string => `(${nt(x)}, ${nt(y)})`;

/** TeX 문자열 배열 → $…$ 보기 */
export function tch(r: Rng, correct: string, wrongs: string[], count = 5, fill?: (i: number) => string) {
  return makeChoices(
    r,
    `$${correct}$`,
    wrongs.map((w) => `$${w}$`),
    count,
    fill ? (i) => `$${fill(i)}$` : undefined,
  );
}

/** 글자 보기 (수식 없음) */
export function wch(r: Rng, correct: string, wrongs: string[], count = 5) {
  return makeChoices(r, correct, wrongs, count);
}

/** 집합 표기 {1, 2, 3} / 공집합 */
export const setTex = (a: number[]): string => (a.length === 0 ? '\\varnothing' : `\\{${[...a].sort((x, y) => x - y).join(', ')}\\}`);

/** 직선 ax+by+c=0 */
export function lineTex(a: Num, b: Num, c: Num): string {
  const parts: string[] = [];
  const add = (k: F, v: string) => {
    if (k.n === 0) return;
    const neg = k.n < 0;
    const ab = neg ? k.neg() : k;
    const body = v === '' ? ab.tex() : ab.eq(1) ? v : ab.tex() + v;
    parts.push(parts.length === 0 ? (neg ? '-' : '') + body : (neg ? '-' : '+') + body);
  };
  add(F.of(a), 'x');
  add(F.of(b), 'y');
  add(F.of(c), '');
  return (parts.join('') || '0') + '=0';
}

/** y = mx + n */
export const yEq = (m: Num, n: Num): string => `y=${poly([m, n])}`;

/** (x-a)^2 꼴: sqTerm('x', 3) = '(x-3)^{2}', a=0 → 'x^{2}' */
export function sqTerm(v: string, a: number): string {
  if (a === 0) return `${v}^{2}`;
  return `(${v}${a > 0 ? '-' : '+'}${Math.abs(a)})^{2}`;
}

/** 원 (x-a)^2+(y-b)^2=r2 */
export const circleTex = (a: number, b: number, r2: number): string => `${sqTerm('x', a)}+${sqTerm('y', b)}=${r2}`;

/** x-a 꼴 (괄호 없이) */
export const xm = (v: string, a: Num): string => poly([1, F.of(a).neg()], v);

// ───────────── 다항식 (계수: 높은 차수부터) ─────────────
export type P = F[];
export const P = (...c: Num[]): P => c.map((x) => F.of(x));

export function pTrim(p: P): P {
  let i = 0;
  while (i < p.length - 1 && p[i].n === 0) i++;
  return p.slice(i);
}
export function pEval(p: P, x: Num): F {
  let s = new F(0);
  for (const c of p) s = s.mul(x).add(c);
  return s;
}
export function pAdd(a: P, b: P): P {
  const n = Math.max(a.length, b.length);
  const A = [...Array(n - a.length).fill(new F(0)), ...a];
  const B = [...Array(n - b.length).fill(new F(0)), ...b];
  return pTrim(A.map((x, i) => x.add(B[i])));
}
export const pScale = (a: P, k: Num): P => pTrim(a.map((x) => x.mul(k)));
export const pSub = (a: P, b: P): P => pAdd(a, pScale(b, -1));
export function pMul(a: P, b: P): P {
  const out: F[] = Array(a.length + b.length - 1).fill(new F(0));
  a.forEach((x, i) => b.forEach((y, j) => (out[i + j] = out[i + j].add(x.mul(y)))));
  return pTrim(out);
}
/** 근으로 다항식: lead·Π(x-r) */
export const pRoots = (lead: Num, roots: Num[]): P => roots.reduce<P>((acc, r) => pMul(acc, P(1, F.of(r).neg())), P(lead));
export function pDer(p: P): P {
  const d = p.length - 1;
  if (d === 0) return P(0);
  return pTrim(p.slice(0, -1).map((c, i) => c.mul(d - i)));
}
/** 부정적분 (적분상수 0) */
export function pInt(p: P): P {
  const d = p.length - 1;
  return [...p.map((c, i) => c.div(d - i + 1)), new F(0)];
}
export const pDef = (p: P, a: Num, b: Num): F => {
  const I = pInt(p);
  return pEval(I, b).sub(pEval(I, a));
};
export const pt2 = (p: P, v = 'x'): string => poly(p, v);
export const pfn = (p: P) => (x: number) => p.reduce((s, c) => s * x + c.value, 0);

/** 구간 [a,b] 에서 |p| 적분 (splits: 구간 안의 근들) */
export function absInt(p: P, a: number, b: number, roots: number[]): F {
  const cuts = [a, ...roots.filter((x) => x > a && x < b).sort((x, y) => x - y), b];
  let s = new F(0);
  for (let i = 0; i + 1 < cuts.length; i++) {
    const v = pDef(p, cuts[i], cuts[i + 1]);
    s = s.add(v.n < 0 ? v.neg() : v);
  }
  return s;
}

/** a√b 를 TeX 로 (coef 가 F 가능) */
export function radTex(coef: Num, inner: number): string {
  const c = F.of(coef);
  if (inner === 1) return c.tex();
  const i = inner;
  if (c.isInt()) return sqrtTex(i, c.n);
  const neg = c.n < 0;
  const num = Math.abs(c.n);
  return `${neg ? '-' : ''}\\frac{${num === 1 ? '' : num}\\sqrt{${i}}}{${c.d}}`;
}

/** 이름들 */
export const NAMES = ['민수', '서연', '지호', '하은', '도윤', '수아', '준서', '지민', '예준', '채원'];

export const deg = (d: number) => `${d}^{\\circ}`;

/** 각(도) → 라디안 TeX: 150 → \frac{5}{6}\pi */
export function radian(d: number): string {
  const f = new F(d, 180);
  if (f.n === 0) return '0';
  const neg = f.n < 0;
  const a = Math.abs(f.n);
  const s = neg ? '-' : '';
  if (f.d === 1) return `${s}${a === 1 ? '' : a}\\pi`;
  return `${s}\\frac{${a === 1 ? '' : a}\\pi}{${f.d}}`;
}

/** k·π (k: F) TeX */
export function piTex(k: F): string {
  if (k.n === 0) return '0';
  const neg = k.n < 0;
  const a = Math.abs(k.n);
  const s = neg ? '-' : '';
  if (k.d === 1) return `${s}${a === 1 ? '' : a}\\pi`;
  return `${s}\\frac{${a === 1 ? '' : a}\\pi}{${k.d}}`;
}

/**
 * Plane.fn 은 전역 카운터(clipSeq)로 clipPath id 를 만들어 같은 시드라도 fig 문자열이 달라짐 (core 문제).
 * 그림 내용의 해시로 id 를 다시 붙여 결정적으로 만든다.
 */
export function figOut(svg: { toString(): string }): string {
  const s = svg.toString();
  const base = s.replace(/pc\d+/g, 'pc');
  let h = 2166136261;
  for (let i = 0; i < base.length; i++) {
    h ^= base.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const tag = (h >>> 0).toString(36);
  const map = new Map<string, string>();
  return s.replace(/pc\d+/g, (m) => {
    if (!map.has(m)) map.set(m, `h2c${tag}${map.size}`);
    return map.get(m)!;
  });
}

/** 받침 유무로 조사 고르기: josa('영어', '을', '를') = '를' */
export function josa(word: string, withB: string, without: string): string {
  const c = word.charCodeAt(word.length - 1);
  if (c < 0xac00 || c > 0xd7a3) return withB;
  return (c - 0xac00) % 28 ? withB : without;
}

/**
 * 수식(TeX)·숫자 뒤 조사: 마지막으로 읽히는 글자(숫자/영문자)의 받침으로 고름.
 * texJosa('8', '이', '가') = '이'(팔), texJosa('x+3', '을', '를') = '을'(삼), texJosa('2x', '은', '는') = '는'(엑스)
 * rieul: '으로/로' 처럼 ㄹ 받침을 받침 없음으로 보는 조사면 true
 */
export function texJosa(tex: string, withB: string, without: string, rieul = false): string {
  const s = tex.replace(/\\[a-zA-Z]+/g, ' ').replace(/[{}()\[\]\s^_|$]+$/g, '');
  const ch = s.replace(/[^0-9A-Za-z]+$/g, '').slice(-1);
  // 숫자: 영(ㅇ) 일(ㄹ) 이 삼(ㅁ) 사 오 육(ㄱ) 칠(ㄹ) 팔(ㄹ) 구 / 끝자리 0 은 십·백·천·만 (모두 받침)
  const digit: Record<string, 'B' | 'L' | 'N'> = { '0': 'B', '1': 'L', '2': 'N', '3': 'B', '4': 'N', '5': 'N', '6': 'B', '7': 'L', '8': 'L', '9': 'N' };
  // 영문자: 엘·엠·엔·알 만 받침
  let k: 'B' | 'L' | 'N';
  if (/[0-9]/.test(ch)) k = digit[ch];
  else if (/[lmnr]/i.test(ch)) k = /[lr]/i.test(ch) ? 'L' : 'B';
  else if (/[A-Za-z]/.test(ch)) k = 'N';
  else return josa(tex, withB, without);
  if (k === 'N') return without;
  if (k === 'L' && rieul) return without;
  return withB;
}

/** 계수·문자 곱: cv(1,'a')='a', cv(-1,'a')='-a', cv(3,'a')='3a' */
export const cv = (k: Num, v: string): string => termsTex([{ c: k, v }]);
