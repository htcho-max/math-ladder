// 생성된 문제의 수식 표기 다듬기 (중·고등): 1x → x, 8+-1 → 8-1, 3--2 → 3+2, +0m 제거
import type { ProblemDraft } from './types';
import { splitMath } from './mathtext';

const PRE = String.raw`(^|[=+\-(,{<>\s]|\\cdot|\\ge|\\le|\\times)`;
const COEF1 = new RegExp(PRE + String.raw`1(?=(?:[a-zA-Z](?![a-zA-Z])|\\(?:pi|sin|cos|tan|log|ln)\b|e\^))`, 'g');
const ZERO_TERM = /([+-])\s*0(?:[a-zA-Z](?![a-zA-Z])(?:\^\{?\d+\}?)?)(?![\d.(])/g;

export function polishTex(tex: string): string {
  let s = tex;
  s = s.replace(/\\(sin|cos|tan)\s*1(?=[a-zA-Z](?![a-zA-Z]))/g, '\\$1 ');
  for (let i = 0; i < 2; i++) s = s.replace(COEF1, '$1');
  s = s.replace(/\+\s*-(?=\s*[\d\w\\(])/g, '-');
  s = s.replace(/(?<![<\-])-\s*-(?=\s*[\d\w\\(])/g, '+');
  s = s.replace(ZERO_TERM, '');
  return s;
}

export function polishText(src: string): string {
  return splitMath(src)
    .map((g) => (g.t === 'text' ? g.s : g.t === 'inline' ? `$${polishTex(g.s)}$` : `$$${polishTex(g.s)}$$`))
    .join('');
}

/** 초등(e…) 단원은 손대지 않음 (7+0 같은 문제가 의도된 것) */
export function polish(d: ProblemDraft, unitId: string): ProblemDraft {
  if (unitId.startsWith('e')) return d;
  const a = d.answer;
  return {
    ...d,
    q: polishText(d.q),
    steps: d.steps.map(polishText),
    hint: d.hint ? polishText(d.hint) : d.hint,
    table: d.table?.map((row) => row.map((c) => polishText(String(c)))),
    answer: a.type === 'choice' ? { ...a, choices: a.choices.map(polishText) } : a,
  };
}
