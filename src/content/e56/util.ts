// 초5·6 공통 도우미 (이름, 조사, 분수·소수 정답)
import type { AnswerSpec } from '../../core/types';
import type { Rng } from '../../core/rng';
import { F } from '../../core/frac';
import { gcd, round } from '../../core/nt';
import { comma } from '../../core/tex';

export const NAMES = ['민수', '서연', '지호', '하은', '도윤', '수아', '준서', '지민', '예준', '채원', '현우', '유나', '시우', '다은', '건우', '소율', '태윤', '나연'];

export const pickName = (r: Rng) => r.pick(NAMES);
export const pickNames = (r: Rng, k: number) => r.sample(NAMES, k);

/** 받침 여부 (한글 끝 글자 / 숫자 끝자리 읽기) */
export function hasBatchim(word: string): boolean {
  const s = word.replace(/[$\s}]+$/g, '');
  const ch = s.charCodeAt(s.length - 1);
  if (ch >= 0xac00 && ch <= 0xd7a3) return (ch - 0xac00) % 28 !== 0;
  const last = s[s.length - 1];
  if (/[0-9]/.test(last)) return '013678'.includes(last);
  return false;
}
/** 조사 붙이기: josa('민수','은/는') = '민수는' */
export function josa(word: string, pair: '은/는' | '이/가' | '을/를' | '과/와' | '이에요/예요'): string {
  const [a, b] = pair.split('/');
  return word + (hasBatchim(word) ? a : b);
}
/** 조사만: jo('지민','이/가') = '이' */
export function jo(word: string, pair: '은/는' | '이/가' | '을/를' | '과/와'): string {
  const [a, b] = pair.split('/');
  return hasBatchim(word) ? a : b;
}

export const ft = (f: F) => f.tex();
export const mt = (f: F) => f.mixedTex();

/** 분수 정답 (대분수 표시, 기약분수 요구) */
export function fracAns(f: F, o: { mixed?: boolean; reduced?: boolean; unit?: string } = {}): AnswerSpec {
  return { type: 'num', value: f.value, display: o.mixed === false ? 'frac' : 'mixed', requireReduced: o.reduced ?? true, unit: o.unit };
}
/** 소수 정답 */
export function decAns(x: number, unit?: string): AnswerSpec {
  return { type: 'num', value: round(x, 8), display: 'dec', unit };
}
export function intAns(x: number, unit?: string): AnswerSpec {
  return { type: 'num', value: x, unit };
}

/** 소수 TeX (천 단위 쉼표 포함) */
export const dt = (x: number) => comma(round(x, 8));

/** 기약 진분수 n/d (d 범위) */
export function properFrac(r: Rng, dmin: number, dmax: number, reduced = true): F {
  for (;;) {
    const d = r.int(dmin, dmax);
    const n = r.int(1, d - 1);
    if (!reduced || gcd(n, d) === 1) return new F(n, d);
  }
}
/** 분수 a/b 를 약분 과정과 함께: '\frac{12}{18} = \frac{2}{3}' (약분 안 되면 그대로) */
export function reduceTex(n: number, d: number, mixed = true): string {
  const f = new F(n, d);
  const raw = `\\frac{${n}}{${d}}`;
  if (d === 1) return String(n);
  const fin = mixed ? f.mixedTex() : f.tex();
  return fin === raw ? raw : `${raw} = ${fin}`;
}
/** 대분수 → 가분수 TeX 과정 */
export function toImproperTex(f: F): string {
  if (f.d === 1 || f.n < f.d) return f.tex();
  return `${f.mixedTex()} = ${f.tex()}`;
}

/** 10^k */
export const p10 = (k: number) => 10 ** k;
/** 소수 a 의 소수점 아래 자릿수 */
export function places(x: number): number {
  const s = String(round(x, 8));
  return (s.split('.')[1] ?? '').length;
}
/** 정수 m 과 소수 자릿수 k 로 소수 만들기 (m=245,k=2 → 2.45) */
export const mkDec = (m: number, k: number) => round(m / p10(k), 8);

/** 수 + 조사: nj(24,'과/와') = '$24$ 와' */
export function nj(x: number | string, pair: '은/는' | '이/가' | '을/를' | '과/와'): string {
  const s = typeof x === 'number' ? String(round(x, 8)) : x;
  return `$${typeof x === 'number' ? comma(round(x, 8)) : x}$ ${jo(s, pair)}`;
}
/** 분수 + 조사 (읽을 때 마지막은 분자) */
export function fj(f: F, pair: '은/는' | '이/가' | '을/를' | '과/와', mixed = true): string {
  const last = f.d === 1 ? f.n : mixed ? f.n % f.d : f.n;
  return `$${mixed ? f.mixedTex() : f.tex()}$ ${jo(String(last), pair)}`;
}
/** 수 + '로/으로': ro(6) = '$6$ 으로', ro(7) = '$7$ 로' */
export function ro(x: number | string): string {
  const s = typeof x === 'number' ? String(round(x, 8)) : x;
  const last = s[s.length - 1];
  const lieul = '178'.includes(last);
  const bat = hasBatchim(s);
  return `$${typeof x === 'number' ? comma(round(x, 8)) : x}$ ${bat && !lieul ? '으로' : '로'}`;
}
/** 분수 + '로/으로' */
export function fro(f: F, mixed = false): string {
  const last = f.d === 1 ? f.n : mixed ? f.n % f.d : f.n;
  const t = ro(last);
  return `$${mixed ? f.mixedTex() : f.tex()}$ ${t.slice(t.lastIndexOf(' ') + 1)}`;
}
