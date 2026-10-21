// 중2-2, 중3-1, 중3-2, 공통수학1 콘텐츠 (단원별 파일은 ./m3h1/ 폴더)
import type { ContentMap, Skill } from '../core/types';
import { m2b } from './m3h1/m2b';
import { m3a } from './m3h1/m3a';
import { m3b } from './m3h1/m3b';
import { hc1 } from './m3h1/hc1';
import { M2B_WORD } from './m3h1/word-m2b';
import { M3A_WORD } from './m3h1/word-m3a';
import { M3B_WORD } from './m3h1/word-m3b';
import { HC1_WORD } from './m3h1/word-hc1';

/** 단원별 문장제(활용) 유형을 기존 유형 뒤에 이어 붙임 */
function withWord(base: ContentMap, extra: Record<string, Skill[]>): ContentMap {
  const out: ContentMap = {};
  for (const [id, u] of Object.entries(base)) out[id] = extra[id] ? { ...u, skills: [...u.skills, ...extra[id]] } : u;
  return out;
}

export const content: ContentMap = {
  ...withWord(m2b, M2B_WORD),
  ...withWord(m3a, M3A_WORD),
  ...withWord(m3b, M3B_WORD),
  ...withWord(hc1, HC1_WORD),
};
