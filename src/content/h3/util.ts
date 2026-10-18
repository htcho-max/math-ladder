// h3 그룹(확률과 통계 · 미적분Ⅱ · 기하) 공용 도우미
import type { AnswerSpec } from '../../core/types';
import type { Rng } from '../../core/rng';
import { F } from '../../core/frac';
import { makeChoices } from '../../core/tex';
import { round } from '../../core/nt';

export const NAMES = ['민수', '지호', '수아', '지우', '시우', '유나', '서아', '준호', '다희', '태오', '지나', '소희']; // 받침 없는 이름 (를·가·와·는)

/** 숫자 뒤 '(으)로': 끝자리 0·3·6 (영/십·삼·육) 만 '으로', ㄹ 받침(1·7·8)과 받침 없는 수는 '로' */
export const ro = (n: number): string => ([0, 3, 6].includes(Math.abs(n) % 10) ? '으로' : '로');

/** 순열·조합 기호 */
export const Ctex = (n: number | string, r: number | string) => `{}_{${n}}\\mathrm{C}_{${r}}`;
export const Ptex = (n: number | string, r: number | string) => `{}_{${n}}\\mathrm{P}_{${r}}`;
export const PItex = (n: number | string, r: number | string) => `{}_{${n}}\\mathrm{\\Pi}_{${r}}`;
export const Htex = (n: number | string, r: number | string) => `{}_{${n}}\\mathrm{H}_{${r}}`;

/** 분수 정답 (정확한 분수) */
export function fAns(f: F, unit?: string): AnswerSpec {
  return { type: 'num', value: f.value, display: f.isInt() ? 'int' : 'frac', ...(unit ? { unit } : {}) };
}

/** 소수 정답 (정규분포표 등) */
export function dAns(x: number, unit?: string): AnswerSpec {
  return { type: 'num', value: round(x, 8), display: 'dec', ...(unit ? { unit } : {}) };
}

/** 분수 객관식: 오답 F 들 + 자동 보충 */
export function fChoices(r: Rng, correct: F, wrongs: (F | null | undefined)[], count = 5) {
  const t = (f: F) => `$${f.tex()}$`;
  const ws = wrongs.filter((w): w is F => !!w && !w.eq(correct)).map(t);
  return makeChoices(r, t(correct), ws, count, (i) => {
    const k = Math.floor(i / 2) + 1;
    const d = correct.d === 1 ? 1 : correct.d;
    const f = i % 2 === 0 ? correct.add(new F(k, d)) : correct.sub(new F(k, d));
    return t(f.n === 0 ? correct.mul(new F(k + 1, k + 2)) : f);
  });
}

/** 문자열 보기 (TeX 조각) → '$…$' 로 감싸서 makeChoices */
export function texChoices(r: Rng, correct: string, wrongs: string[], count = 5, fill?: (i: number) => string) {
  const w = (s: string) => `$${s}$`;
  return makeChoices(r, w(correct), wrongs.map(w), count, fill ? (i) => w(fill(i)) : undefined);
}

/** 피타고라스 수 (a, b, c), a < b */
export const TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 15, 17],
  [9, 12, 15],
  [7, 24, 25],
  [12, 16, 20],
  [20, 21, 29],
];

/** 공간 피타고라스 수 (a, b, c, d) : a²+b²+c² = d² */
export const QUADS: [number, number, number, number][] = [
  [1, 2, 2, 3],
  [2, 3, 6, 7],
  [1, 4, 8, 9],
  [4, 4, 7, 9],
  [2, 6, 9, 11],
  [6, 6, 7, 11],
  [2, 4, 4, 6],
  [3, 4, 12, 13],
];

/** 표준정규분포표 P(0 ≤ Z ≤ z) */
export const ZTAB: Record<string, number> = {
  '0.5': 0.1915,
  '1.0': 0.3413,
  '1.5': 0.4332,
  '2.0': 0.4772,
  '2.5': 0.4938,
  '3.0': 0.4987,
};
export const ZKEYS = ['0.5', '1.0', '1.5', '2.0', '2.5', '3.0'];
export const zTable = (): string[][] => [['$z$', ...ZKEYS.map((k) => `$${k}$`)], ['$P(0\\le Z\\le z)$', ...ZKEYS.map((k) => `$${ZTAB[k]}$`)]];
/** z 값(수) → 표 열쇠 */
export const zKey = (z: number) => z.toFixed(1);

/** 부호 있는 항: (x-3), (x+2) */
export const shift = (v: string, h: number) => (h === 0 ? v : `(${v}${h > 0 ? '-' : '+'}${Math.abs(h)})`);
export const shiftSq = (v: string, h: number) => (h === 0 ? `${v}^{2}` : `(${v}${h > 0 ? '-' : '+'}${Math.abs(h)})^{2}`);

/** 정수 a 를 계수로: 1 → '', -1 → '-' */
export const coef = (a: number) => (a === 1 ? '' : a === -1 ? '-' : String(a));

/** 각도 문자열 */
export const deg = (d: number) => `${d}^{\\circ}`;

/**
 * Plane.fn 은 전역 카운터(clipSeq)로 clipPath id 를 만들어 같은 시드라도 그림 문자열이 달라짐.
 * id 를 그림 내용의 해시로 바꿔 결정적으로 만든다 (내용이 같으면 clip 영역도 같으므로 충돌 무해).
 */
export function stableFig(svg: string): string {
  const ids: string[] = [];
  const norm = svg.replace(/pc\d+/g, (m) => {
    let i = ids.indexOf(m);
    if (i < 0) i = ids.push(m) - 1;
    return `@@${i}@@`;
  });
  let h = 2166136261;
  for (let i = 0; i < norm.length; i++) {
    h ^= norm.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const tag = (h >>> 0).toString(36);
  return norm.replace(/@@(\d+)@@/g, (_, i) => `h3c${tag}${i}`);
}
