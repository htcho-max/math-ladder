// 문제 만들기 (키 ↔ 문제)
import { CONTENT } from '../content';
import { Rng, hashStr } from './rng';
import type { GenLevel, Level, Problem, Skill } from './types';
import { polish } from './polish';
import { toChoice } from './tochoice';

export function getSkill(unitId: string, skillId: string): Skill | undefined {
  const c = CONTENT[unitId];
  return c?.skills.find((s) => s.id === skillId) ?? c?.top?.find((s) => s.id === skillId);
}

/** asChoice: 주관식 문제를 5지선다로 바꿔 냄 (키 끝에 '/c') */
export function makeProblem(unitId: string, skillId: string, level: Level, seed: number, asChoice = false): Problem {
  const sk = getSkill(unitId, skillId);
  if (!sk) throw new Error(`없는 유형: ${unitId}/${skillId}`);
  const r = new Rng(seed ^ hashStr(`${unitId}/${skillId}`));
  const d = polish(sk.gen(r, Math.min(level, 3) as GenLevel), unitId);
  const p: Problem = { ...d, key: `${unitId}/${skillId}/${level}/${seed}`, unitId, skillId, level, seed };
  return asChoice ? toChoice(p) : p;
}

export function problemFromKey(key: string): Problem | null {
  const [unitId, skillId, lv, sd, c] = key.split('/');
  try {
    return makeProblem(unitId, skillId, Number(lv) as Level, Number(sd), c === 'c');
  } catch {
    return null;
  }
}

export function hasContent(unitId: string): boolean {
  return (CONTENT[unitId]?.skills.length ?? 0) > 0;
}

const nativeRate = new Map<string, number>();
/** 단원 생성기가 원래 객관식으로 내는 비율 (표본으로 추정, 캐시) */
export function nativeChoiceRate(unitId: string): number {
  let v = nativeRate.get(unitId);
  if (v === undefined) {
    let n = 0,
      c = 0;
    for (const sk of CONTENT[unitId]?.skills ?? []) {
      for (const lv of [1, 2, 3] as Level[]) {
        for (let sd = 1; sd <= 2; sd++) {
          try {
            n++;
            if (makeProblem(unitId, sk.id, lv, sd * 104729).answer.type === 'choice') c++;
          } catch {
            /* 무시 */
          }
        }
      }
    }
    v = n ? c / n : 0;
    nativeRate.set(unitId, v);
  }
  return v;
}

/**
 * 이번 문제를 객관식으로 바꿀지 (시드로 결정).
 * target = 단원 전체에서 객관식이 차지했으면 하는 비율. 원래 객관식 비율을 빼고 나머지만 바꾼다.
 */
export function pickChoice(seed: number, target: number, unitId: string): boolean {
  if (target <= 0) return false;
  const base = nativeChoiceRate(unitId);
  const p = base >= target ? 0 : (target - base) / (1 - base);
  return ((seed * 2654435761) >>> 0) / 4294967296 < p;
}
