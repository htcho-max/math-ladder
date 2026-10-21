// h2 심화·최상위 유형 공용 도우미 (hard-*.ts 전용)
import type { AnswerSpec, Skill } from '../../core/types';
import { F } from '../../core/frac';
import { termsTex } from '../../core/tex';
import { answerText } from '../../core/check';

export type Hard = Record<string, { skills: Skill[]; top: Skill[] }>;

export const fr = (n: number, d = 1) => new F(n, d);
/** 수·분수 → TeX */
export const T = (x: F | number) => F.of(x).tex();
/** 정답(수). 분수면 분수로 표시 */
export function ans(x: F | number, unit?: string): AnswerSpec {
  const f = F.of(x);
  return {
    type: 'num',
    value: f.value,
    ...(f.d !== 1 ? { display: 'frac' as const } : {}),
    ...(unit ? { unit } : {}),
  };
}
/** 이름 붙은 칸 여러 개 */
export function fld(...p: [string, F | number][]): AnswerSpec {
  return {
    type: 'fields',
    fields: p.map(([label, v]) => {
      const f = F.of(v);
      return {
        label,
        value: f.value,
        ...(f.d !== 1 ? { display: 'frac' as const } : {}),
      };
    }),
  };
}
/** 항 나열 (계수 0 항 생략): tt([3,'x'],[-1,'y'],[5,'']) = 3x-y+5 */
export const tt = (...t: [F | number, string][]) => termsTex(t.map(([c, v]) => ({ c, v })));
/** 음수면 괄호 */
export const pr = (n: number | F) => {
  const s = T(n);
  return s.startsWith('-') ? `(${s})` : s;
};
/** 부호 붙은 상수 (0 이면 빈 문자열) */
export const cst = (n: number | F) => {
  const f = F.of(n);
  return f.n === 0 ? '' : f.n > 0 ? `+${f.tex()}` : f.tex();
};
/** 완전제곱수면 제곱근, 아니면 -1 */
export const isq = (n: number) => {
  if (n < 0) return -1;
  const s = Math.round(Math.sqrt(n));
  return s * s === n ? s : -1;
};
/** 피타고라스 수 (a, b, c) */
export const TRI: [number, number, number][] = [
  [3, 4, 5],
  [4, 3, 5],
  [6, 8, 10],
  [8, 6, 10],
  [5, 12, 13],
  [12, 5, 13],
];
/** 구간별 함수 */
export const cases = (rows: [string, string][]) => `\\begin{cases}${rows.map(([a, b]) => `${a} & (${b})`).join('\\\\ ')}\\end{cases}`;
/** 받침 있는지 (한글 마지막 글자) */
export const hasB = (w: string) => {
  const c = w.charCodeAt(w.length - 1);
  return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 !== 0;
};
/** 숫자 끝자리 받침 (0,1,3,6,7,8 → 받침 있음: 영·일·삼·육·칠·팔) */
export const numB = (n: number) => {
  const s = String(Math.abs(n));
  if (/0$/.test(s) && !/^0$/.test(s)) {
    // 10 십, 100 백, 1000 천, 10000 만 — 십·백·천 받침? 십(ㅂ)·백(ㄱ)·천(ㄴ)·만(ㄴ) 모두 받침
    return true;
  }
  return [0, 1, 3, 6, 7, 8].includes(Number(s[s.length - 1]));
};
/** 숫자 뒤 은/는, 이/가, 을/를, 과/와 */
export const nj = (n: number, b: string, nb: string) => (numB(n) ? b : nb);

// ───────────── 수식 뒤 조사 자동 교정 ─────────────
const DIGIT: Record<string, 'B' | 'L' | 'N'> = {
  '0': 'B',
  '1': 'L',
  '2': 'N',
  '3': 'B',
  '4': 'N',
  '5': 'N',
  '6': 'B',
  '7': 'L',
  '8': 'L',
  '9': 'N',
};
/** 수식이 마지막으로 읽히는 소리의 받침: B(받침), L(ㄹ 받침), N(받침 없음), ?(모름) */
function texSound(tex: string): 'B' | 'L' | 'N' | '?' {
  let s = tex.trim();
  if (/\^\{\\circ\}$/.test(s) || /\\%$/.test(s)) return 'N'; // 도, 퍼센트
  if (/\^\{[^{}]*\}$/.test(s) || /\^\d$/.test(s)) return 'B'; // 제곱
  const fm = s.match(/\\frac\{([^{}]*)\}\{[^{}]*\}$/);
  if (fm) s = fm[1]; // b분의 a → a 로 끝남
  if (/\\(pi|infty)$/.test(s)) return 'N';
  if (/\\varnothing$/.test(s)) return 'B'; // 공집합
  s = s.replace(/\\[a-zA-Z]+/g, ' ').replace(/[{}()[\]\s^_|$\\']+$/g, '');
  const ch = s.replace(/[^0-9A-Za-z]+$/g, '').slice(-1);
  if (/[0-9]/.test(ch)) return DIGIT[ch];
  if (/[lmnr]/i.test(ch)) return /[lr]/i.test(ch) ? 'L' : 'B';
  if (/[A-Za-z]/.test(ch)) return 'N';
  return '?';
}
const JOSA: Record<string, [string, string, boolean]> = {
  은: ['은', '는', false],
  는: ['은', '는', false],
  이: ['이', '가', false],
  가: ['이', '가', false],
  을: ['을', '를', false],
  를: ['을', '를', false],
  과: ['과', '와', false],
  와: ['과', '와', false],
  으로: ['으로', '로', true],
  로: ['으로', '로', true],
};
/** '$수식$ 조사' 의 조사를 수식의 마지막 소리에 맞게 고침 */
export function fixJosaText(text: string): string {
  return text.replace(/\$([^$]+)\$( ?)(으로|은|는|이|가|을|를|과|와|로)(?=[\s,.)?]|$)/g, (all, tex: string, sp: string, j: string) => {
    const k = texSound(tex);
    if (k === '?') return all;
    const [b, nb, rieul] = JOSA[j];
    const useB = rieul ? k === 'B' : k !== 'N';
    return `$${tex}$${sp}${useB ? b : nb}`;
  });
}
/** 유형 묶음의 모든 생성기 결과(q, steps, hint)에 조사 교정 적용 */
export function withJosa(H: Hard, ideas: Record<string, string> = {}): Hard {
  const wrap = (s: Skill, isTop: boolean): Skill => ({
    ...s,
    gen(r, level) {
      const d = s.gen(r, level);
      let steps = d.steps;
      // 최상위 유형: 풀이가 짧으면 핵심 발상과 결론 줄을 붙여 5줄 이상으로
      if (isTop && steps.length < 5 && ideas[s.id]) steps = [`핵심: ${ideas[s.id]}`, ...steps];
      if (isTop && steps.length < 5) steps = [...steps, `따라서 답은 ${answerText(d.answer)}`];
      return {
        ...d,
        q: fixJosaText(d.q),
        steps: steps.map(fixJosaText),
        ...(d.hint ? { hint: fixJosaText(d.hint) } : {}),
      };
    },
  });
  const out: Hard = {};
  for (const [u, h] of Object.entries(H))
    out[u] = {
      skills: h.skills.map((s) => wrap(s, false)),
      top: h.top.map((s) => wrap(s, true)),
    };
  return out;
}
