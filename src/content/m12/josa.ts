// 수식 뒤 조사 자동 교정 (e56·m12 그룹 공용)
// "$45$ 을" → "$45$ 를", "$(-3, 1)$ 와" → "$(-3, 1)$ 과", "$30$ 로" → "$30$ 으로" 처럼
// $…$ 바로 뒤에 한 칸 띄고 붙은 조사를 수식의 마지막 읽는 소리에 맞게 고친다.
import type { ContentMap, ProblemDraft } from '../../core/types';

/** 수식 TeX 의 마지막 소리: [받침 있음, ㄹ 받침] (알 수 없으면 null) */
export function lastSound(tex: string): [boolean, boolean] | null {
  let s = tex.trim();
  for (;;) {
    const before = s;
    s = s
      .replace(/\{,\}/g, '')
      .replace(/\\right[)\]|.]$/, '')
      .replace(/\\[,;:! ]$/, '')
      .replace(/\\quad$/, '')
      .replace(/\s+$/, '')
      .replace(/[)\]|]$/, '');
    if (s === before) break;
  }
  if (!s) return null;
  // 각도 ° (^{\circ}) 는 '도' (받침 없음) — 거듭제곱보다 먼저 확인
  if (/(?:°|\^\{\\circ\}|\^\\circ)$/.test(s)) return [false, false];
  // 거듭제곱: '제곱' (받침 ㅂ)
  if (/\^\{[^{}]*\}$/.test(s) || /\^[0-9a-z]$/.test(s)) return [true, false];
  // 분수: 'b 분의 a' → 분자로 끝남
  const fr = s.match(/\\[dt]?frac\{((?:[^{}]|\{[^{}]*\})*)\}\{((?:[^{}]|\{[^{}]*\})*)\}$/);
  if (fr) return lastSound(fr[1]);
  // \sqrt{..}, \overline{..}, \dot{..}, 아래첨자 등은 안쪽 마지막 글자로
  const wrap = s.match(/(?:\\(?:sqrt|overline|dot|mathrm|boldsymbol|bar|vec)|_)\{((?:[^{}]|\{[^{}]*\})*)\}$/);
  if (wrap) return lastSound(wrap[1]);
  if (/_[0-9a-z]$/i.test(s)) return lastSound(s.slice(-1));
  const txt = s.match(/\\text\{([^{}]*)\}$/);
  if (txt) return lastSound(txt[1]);
  if (/\\(?:pi|square|alpha|beta|theta|infty|triangle)$/.test(s)) return [false, false];
  if (/\\(?:cdots|ldots|dots)$/.test(s)) return null;
  if (/(?:°|\\circ|\\%|%)$/.test(s)) return [false, false];
  if (/\\[a-zA-Z]+$/.test(s)) return null;
  const ch = s[s.length - 1];
  if (/[0-9]/.test(ch)) return ['0136780'.includes(ch), '178'.includes(ch)];
  if (/[A-Za-z]/.test(ch)) {
    const L = ch.toLowerCase();
    return ['lmnr'.includes(L), 'lr'.includes(L)];
  }
  const c = ch.charCodeAt(0) - 0xac00;
  if (c >= 0 && c < 11172) return [c % 28 !== 0, c % 28 === 8];
  return null;
}

const PAIR: Record<string, [string, string]> = {
  을: ['을', '를'],
  를: ['을', '를'],
  이: ['이', '가'],
  가: ['이', '가'],
  은: ['은', '는'],
  는: ['은', '는'],
  과: ['과', '와'],
  와: ['과', '와'],
};

/** 문자열 안의 '$수식$ 조사' 를 모두 교정 */
export function fixJosa(text: string): string {
  return text.replace(/\$([^$]+)\$ (을|를|이|가|은|는|과|와|으로|로)(?=[\s,.?!)]|$)/g, (all, tex: string, p: string) => {
    const ls = lastSound(tex);
    if (!ls) return all;
    let q: string;
    if (p === '로' || p === '으로') q = ls[0] && !ls[1] ? '으로' : '로';
    else q = ls[0] ? PAIR[p][0] : PAIR[p][1];
    return `$${tex}$ ${q}`;
  }).replace(/\$([^$]+)\$ (과|와)(?=는 |도 )/g, (all, tex: string) => {
    const ls = lastSound(tex);
    if (!ls) return all;
    return `$${tex}$ ${ls[0] ? '과' : '와'}`;
  }).replace(/\$([^$]+)\$ (이라|라)(?= 하)/g, (all, tex: string) => {
    const ls = lastSound(tex);
    if (!ls) return all;
    return `$${tex}$ ${ls[0] ? '이라' : '라'}`;
  });
}

function fixDraft(d: ProblemDraft): ProblemDraft {
  const out: ProblemDraft = { ...d, q: fixJosa(d.q), steps: d.steps.map(fixJosa) };
  if (d.hint) out.hint = fixJosa(d.hint);
  if (d.answer.type === 'choice') out.answer = { ...d.answer, choices: d.answer.choices.map(fixJosa) };
  return out;
}

/** 콘텐츠의 모든 문제 생성기 출력(문제·풀이·힌트·보기)에 조사 교정을 적용 */
export function withJosaFix(map: ContentMap): ContentMap {
  const out: ContentMap = {};
  for (const [id, u] of Object.entries(map)) {
    out[id] = {
      concepts: u.concepts,
      skills: u.skills.map((sk) => ({ ...sk, gen: (r, level) => fixDraft(sk.gen(r, level)) })),
    };
    if (u.top) out[id].top = u.top.map((sk) => ({ ...sk, gen: (r, level) => fixDraft(sk.gen(r, level)) }));
  }
  return out;
}
