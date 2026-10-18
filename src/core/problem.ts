// 문제 만들기 (키 ↔ 문제)
import { CONTENT } from '../content';
import { Rng, hashStr } from './rng';
import type { Level, Problem, Skill } from './types';
import { polish } from './polish';

export function getSkill(unitId: string, skillId: string): Skill | undefined {
  return CONTENT[unitId]?.skills.find((s) => s.id === skillId);
}

export function makeProblem(unitId: string, skillId: string, level: Level, seed: number): Problem {
  const sk = getSkill(unitId, skillId);
  if (!sk) throw new Error(`없는 유형: ${unitId}/${skillId}`);
  const r = new Rng(seed ^ hashStr(`${unitId}/${skillId}`));
  const d = polish(sk.gen(r, level), unitId);
  return { ...d, key: `${unitId}/${skillId}/${level}/${seed}`, unitId, skillId, level, seed };
}

export function problemFromKey(key: string): Problem | null {
  const [unitId, skillId, lv, sd] = key.split('/');
  try {
    return makeProblem(unitId, skillId, Number(lv) as Level, Number(sd));
  } catch {
    return null;
  }
}

export function hasContent(unitId: string): boolean {
  return (CONTENT[unitId]?.skills.length ?? 0) > 0;
}
