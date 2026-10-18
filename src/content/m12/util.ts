// m12 그룹 공용 도우미
import type { Rng } from '../../core/rng';
import { hashStr } from '../../core/rng';
import { F } from '../../core/frac';
import { makeChoices, termsTex } from '../../core/tex';

export const NAMES = ['민수', '지호', '수아', '시우', '유나', '준서', '하나', '서아', '지우', '도하', '태오', '소희', '은채', '예나'];

/** '$…$' 로 감싸기 */
export const m = (s: string | number) => `$${s}$`;

/** TeX 보기(정답·오답 모두 $ 없이) → 객관식 */
export function texChoices(r: Rng, correct: string, wrongs: string[], count = 5) {
  return makeChoices(r, m(correct), wrongs.map(m), count);
}

/** 일반 글자 보기 → 객관식 */
export function textChoices(r: Rng, correct: string, wrongs: string[], count = 5) {
  return makeChoices(r, correct, wrongs, count);
}

/** F/수 → TeX */
export const ft = (x: F | number) => F.of(x).tex();

/** 음수면 괄호: (-3), \left(-\frac{1}{2}\right) */
export function fp(x: F | number): string {
  const f = F.of(x);
  const t = f.tex();
  if (f.n >= 0) return t;
  return f.d === 1 ? `(${t})` : `\\left(${t}\\right)`;
}

/** 부호를 붙인 괄호 수: (+3), (-5), \left(+\frac{1}{2}\right) */
export function sp(x: F | number): string {
  const f = F.of(x);
  const t = (f.n >= 0 ? '+' : '') + f.tex();
  return f.d === 1 ? `(${t})` : `\\left(${t}\\right)`;
}

/** 계수 × π: 3\pi, \frac{8}{3}\pi, \pi */
export function piTex(c: F | number): string {
  const f = F.of(c);
  if (f.n === 0) return '0';
  if (f.eq(1)) return '\\pi';
  if (f.eq(-1)) return '-\\pi';
  return f.tex() + '\\pi';
}

/** 단항식: mono(-3, [['x',2],['y',1]]) = '-3x^{2}y' */
export function mono(c: F | number, vars: [string, number][]): string {
  const v = vars
    .filter(([, e]) => e !== 0)
    .map(([s, e]) => (e === 1 ? s : `${s}^{${e}}`))
    .join('');
  return termsTex([{ c, v }]);
}

/** 두 미지수 일차식 ax+by+c */
export function lin2(a: F | number, b: F | number, c: F | number = 0, x = 'x', y = 'y'): string {
  return termsTex([
    { c: a, v: x },
    { c: b, v: y },
    { c, v: '' },
  ]);
}

/** 상수항 앞 부호 문자열: +3, -3, (0이면 빈 문자열) */
export function cst(n: F | number): string {
  const f = F.of(n);
  if (f.n === 0) return '';
  return (f.n > 0 ? '+' : '') + f.tex();
}

/** 정수 배열의 합 */
export const sum = (a: number[]) => a.reduce((s, x) => s + x, 0);

/** 레벨별 값 고르기 */
export function lv<T>(level: number, a: T, b: T, c: T): T {
  return level === 1 ? a : level === 2 ? b : c;
}

/**
 * 그림 문자열 확정: core Plane.fn 이 전역 카운터로 clipPath id(pc1, pc2 …)를 만들어
 * 같은 시드라도 호출할 때마다 id 가 달라지므로, 내용 해시 기반 id 로 바꿔 결정적으로 만든다.
 */
export function fig(x: { toString(): string }): string {
  const s = x.toString();
  const ids: string[] = [];
  s.replace(/id="(pc\d+)"/g, (_m, id: string) => {
    ids.push(id);
    return '';
  });
  if (ids.length === 0) return s;
  const h = hashStr(s.replace(/pc\d+/g, 'pc')).toString(36);
  let out = s;
  ids.forEach((id, i) => {
    out = out.split(`"${id}"`).join(`"m12${h}-${i}"`).split(`#${id})`).join(`#m12${h}-${i})`);
  });
  return out;
}

/** 조사 붙이기. pair 는 '받침 있을 때/없을 때' 순서: '을/를', '이/가', '은/는', '과/와' */
export function jo(w: string, pair: '을/를' | '이/가' | '은/는' | '과/와'): string {
  const c = w.charCodeAt(w.length - 1) - 0xac00;
  const has = c >= 0 && c < 11172 && c % 28 !== 0;
  const [a, b] = pair.split('/');
  return w + (has ? a : b);
}
