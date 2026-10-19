// 유형 분류(연산/개념/문장제)와 단원별 "흔한 실수"
// 데이터는 meta/*.ts 에 그룹별로, 없으면 문제 문장으로 추정
import { CONTENT } from '.';
import { makeProblem } from '../core/problem';
import type { Level } from '../core/types';
import { META as M_E12 } from './meta/e12';
import { META as M_E34 } from './meta/e34';
import { META as M_E56 } from './meta/e56';
import { META as M_M12 } from './meta/m12';
import { META as M_M3H1 } from './meta/m3h1';
import { META as M_H2 } from './meta/h2';
import { META as M_H3 } from './meta/h3';

export type Cat = 'calc' | 'concept' | 'word';
export const CAT_NAME: Record<Cat, string> = { calc: '연산', concept: '개념', word: '문장제' };

export interface UnitMeta {
  /** 흔한 실수 2~3개 ($…$ 가능). 한 줄은 "실수 → 바른 생각" 꼴 */
  pitfalls: string[];
  /** 유형 id → 분류 */
  cats: Record<string, Cat>;
}
export type MetaMap = Record<string, UnitMeta>;

const ALL: MetaMap = { ...M_E12, ...M_E34, ...M_E56, ...M_M12, ...M_M3H1, ...M_H2, ...M_H3 };

const guessCache = new Map<string, Cat>();
/** 메타가 없을 때 추정: 사람 이름·물건이 나오는 긴 문장 → 문장제, '옳은/옳지 않은/것은' 객관식 → 개념 */
function guess(unitId: string, skillId: string): Cat {
  const k = `${unitId}/${skillId}`;
  const hit = guessCache.get(k);
  if (hit) return hit;
  let word = 0,
    concept = 0;
  for (const lv of [1, 2, 3] as Level[]) {
    try {
      const p = makeProblem(unitId, skillId, lv, 7);
      const text = p.q.replace(/\$[^$]*\$/g, '');
      if (/옳은|옳지 않은|것은\?|모두 고르|참인|거짓|뜻|성질|이름/.test(text)) concept++;
      else if (text.length > 45 && /[가-힣]{2,}(이|가|는|은)\s/.test(text)) word++;
    } catch {
      /* 무시 */
    }
  }
  const c: Cat = concept >= 2 ? 'concept' : word >= 2 ? 'word' : 'calc';
  guessCache.set(k, c);
  return c;
}

export function skillCat(unitId: string, skillId: string): Cat {
  return ALL[unitId]?.cats[skillId] ?? guess(unitId, skillId);
}

export function unitCats(unitId: string): Record<Cat, string[]> {
  const out: Record<Cat, string[]> = { calc: [], concept: [], word: [] };
  for (const s of CONTENT[unitId]?.skills ?? []) out[skillCat(unitId, s.id)].push(s.id);
  return out;
}

export function pitfalls(unitId: string): string[] {
  return ALL[unitId]?.pitfalls ?? [];
}

export const META_ALL = ALL;
