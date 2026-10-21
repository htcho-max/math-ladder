// 초3·초4 (e3a, e3b, e4a, e4b) 콘텐츠 — 과정별 파일을 합쳐 내보냄
import type { ContentMap, ProblemDraft, Skill } from '../core/types';
import { fixJosa } from './e34/util';
import { content as e3a } from './e34/e3a';
import { content as e3b } from './e34/e3b';
import { content as e4a } from './e34/e4a';
import { content as e4b } from './e34/e4b';
import { WORDS3 } from './e34/words3';
import { WORDS4 } from './e34/words4';

/** 생성된 문제의 '숫자+조사'를 읽기에 맞게 교정 */
function fixDraft(d: ProblemDraft): ProblemDraft {
  const a = d.answer;
  // '네 반의 모은 빈 병' → '네 반이 모은 빈 병' 처럼 어색한 '의'를 고침
  const fx = (t: string) => fixJosa(t).replace(/반의 모은 /g, '반이 모은 ');
  return {
    ...d,
    q: fx(d.q),
    steps: d.steps.map(fx),
    ...(d.hint ? { hint: fx(d.hint) } : {}),
    answer: a.type === 'choice' ? { ...a, choices: a.choices.map(fx) } : a,
  };
}

/** 문장제 추가 유형 (단원 id → 유형들). 기존 유형 뒤에 붙임 (기존 id 는 그대로) */
const EXTRA: Record<string, Skill[]> = { ...WORDS3, ...WORDS4 };

function wrap(...maps: ContentMap[]): ContentMap {
  const out: ContentMap = {};
  for (const m of maps)
    for (const [id, u] of Object.entries(m))
      out[id] = { concepts: u.concepts, skills: [...u.skills, ...(EXTRA[id] ?? [])].map((s) => ({ ...s, gen: (r, l) => fixDraft(s.gen(r, l)) })) };
  return out;
}

export const content: ContentMap = wrap(e3a, e3b, e4a, e4b);
