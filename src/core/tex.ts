// 수식(TeX) 표기 도우미 + 객관식 보기 도우미
import type { Rng } from './rng';
import { F, approxFrac } from './frac';
import { round, simplifySqrt } from './nt';

/** 천 단위 쉼표: 12345 → '12,345' (TeX 안에서는 {,} 로) */
export function comma(n: number, inTex = true): string {
  const neg = n < 0;
  const [i, d] = String(Math.abs(round(n))).split('.');
  const s = i.replace(/\B(?=(\d{3})+(?!\d))/g, inTex ? '{,}' : ',');
  return (neg ? '-' : '') + s + (d ? '.' + d : '');
}

/** 부동소수 오차 없는 소수 문자열: dec(0.1+0.2) = '0.3' */
export function dec(n: number, places = 10): string {
  return String(round(n, places));
}

/** 음수면 괄호: paren(-3) = '(-3)' */
export function paren(n: number | string): string {
  const s = String(n);
  return s.startsWith('-') ? `(${s})` : s;
}

/** 부호 붙이기: signed(3) = '+3', signed(-3) = '-3', signed(0) = '+0' */
export function signed(n: number | string): string {
  const s = String(n);
  return s.startsWith('-') ? s : '+' + s;
}

/** 분수 TeX (자동 약분). frac(6, -8) = '-\frac{3}{4}' */
export function frac(n: number, d: number): string {
  return new F(n, d).tex();
}

/** 숫자 → TeX. 정수 그대로, 유한소수는 소수, 그 밖엔 분수 */
export function numTex(x: number, display?: 'int' | 'dec' | 'frac' | 'mixed'): string {
  const v = round(x);
  if (Number.isInteger(v)) return Math.abs(v) >= 10000 ? comma(v) : String(v);
  if (display === 'dec') return dec(v);
  const fr = approxFrac(v, 100000);
  if (display === 'frac' || display === 'mixed') {
    if (fr) {
      const f = new F(fr[0], fr[1]);
      return display === 'mixed' ? f.mixedTex() : f.tex();
    }
    return dec(v);
  }
  // 자동: 소수점 이하 4자리 이내 유한소수면 소수, 아니면 분수
  const s = dec(v);
  const places = (s.split('.')[1] ?? '').length;
  if (places <= 4) return s;
  if (fr) return new F(fr[0], fr[1]).tex();
  return dec(v, 4);
}

/** 근호: sqrtTex(72) = '6\sqrt{2}', sqrtTex(16) = '4' */
export function sqrtTex(n: number, coef = 1): string {
  if (n === 0) return '0';
  const [o, i] = simplifySqrt(n);
  const c = coef * o;
  if (i === 1) return String(c);
  if (c === 1) return `\\sqrt{${i}}`;
  if (c === -1) return `-\\sqrt{${i}}`;
  return `${c}\\sqrt{${i}}`;
}

/**
 * 다항식 TeX. 계수는 높은 차수부터.
 * poly([1,-3,2]) = 'x^{2}-3x+2', poly([2,0,-1],'t') = '2t^{2}-1'
 * 계수에 F 도 가능.
 */
export function poly(coeffs: (number | F)[], v = 'x'): string {
  const deg = coeffs.length - 1;
  const terms: { c: F; p: number }[] = [];
  coeffs.forEach((c, i) => {
    const f = F.of(c);
    if (f.n !== 0) terms.push({ c: f, p: deg - i });
  });
  return termsTex(terms.map((t) => ({ c: t.c, v: t.p === 0 ? '' : t.p === 1 ? v : `${v}^{${t.p}}` })));
}

/**
 * 일반 항 나열: termsTex([{c:3,v:'x'},{c:-2,v:'y'},{c:5,v:''}]) = '3x-2y+5'
 * 계수 1/-1 은 생략, 0 항은 빠짐. 모두 0이면 '0'
 */
export function termsTex(terms: { c: number | F; v: string }[]): string {
  let out = '';
  for (const t of terms) {
    const c = F.of(t.c);
    if (c.n === 0) continue;
    const neg = c.n < 0;
    const a = neg ? c.neg() : c;
    let body: string;
    if (t.v === '') body = a.tex();
    else if (a.eq(1)) body = t.v;
    else body = a.tex() + t.v;
    if (out === '') out = (neg ? '-' : '') + body;
    else out += (neg ? '-' : '+') + body;
  }
  return out === '' ? '0' : out;
}

/** 일차식 ax+b 를 (x-p) 꼴 등에 쓰는 부호 처리: linTex(1,-3)='x-3' */
export function linTex(a: number | F, b: number | F, v = 'x'): string {
  return termsTex([
    { c: a, v },
    { c: b, v: '' },
  ]);
}

// ───────────── 객관식 보기 ─────────────

/**
 * 정답과 오답 후보(TeX 문자열)로 보기 만들기. 중복 제거 후 섞어서 count 개.
 * 후보가 모자라면 fill() 로 더 만든다.
 */
export function makeChoices(
  r: Rng,
  correct: string,
  wrongs: string[],
  count = 5,
  fill?: (i: number) => string,
): { type: 'choice'; choices: string[]; index: number } {
  const seen = new Set([correct]);
  const pool: string[] = [];
  for (const w of r.shuffle(wrongs)) {
    if (!seen.has(w)) {
      seen.add(w);
      pool.push(w);
    }
  }
  let i = 0;
  while (pool.length < count - 1 && fill && i < 200) {
    const w = fill(i++);
    if (!seen.has(w)) {
      seen.add(w);
      pool.push(w);
    }
  }
  const choices = r.shuffle([correct, ...pool.slice(0, count - 1)]);
  return { type: 'choice', choices, index: choices.indexOf(correct) };
}

/** 숫자 정답용 보기: 그럴듯한 오답(가까운 수) 자동 생성. 보기는 '$…$' 로 감싸짐 */
export function numChoices(
  r: Rng,
  correct: number,
  wrongs: number[] = [],
  count = 5,
  display?: 'int' | 'dec' | 'frac' | 'mixed',
): { type: 'choice'; choices: string[]; index: number } {
  const t = (x: number) => `$${numTex(x, display)}$`;
  const step = Number.isInteger(correct) ? Math.max(1, Math.round(Math.abs(correct) / 10)) : Math.abs(correct) / 4 || 0.5;
  return makeChoices(
    r,
    t(correct),
    wrongs.filter((w) => Number.isFinite(w) && round(w) !== round(correct)).map(t),
    count,
    (i) => {
      const k = Math.floor(i / 2) + 1;
      let s = i % 2 === 0 ? 1 : -1;
      // 정답이 0 이상이면 음수 오답은 만들지 않음 (초등 범위 보호)
      if (correct >= 0 && correct - k * step * 3 < 0) s = 1;
      const v = round(correct + s * k * step * r.int(1, 3));
      return t(correct >= 0 && v < 0 ? round(correct + k * step) : v);
    },
  );
}
