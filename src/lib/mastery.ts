// 숙련도·오답노트·추천
import { CONTENT } from '../content';
import { UNITS, UNIT_BY_ID, unitsOf, COURSES } from '../core/curriculum';
import type { Level, Problem, UnitDef } from '../core/types';
import { dayKey, startOfDay, updateData, type ProfileData, type SkillStat, type WrongItem } from './store';

export const BOX_DAYS = [0, 1, 3, 7, 14];
const DAY = 86400000;

export function skillKey(unitId: string, skillId: string) {
  return `${unitId}/${skillId}`;
}

export function skillScore(d: ProfileData, unitId: string, skillId: string): number {
  return d.skills[skillKey(unitId, skillId)]?.score ?? 0;
}

/** 단원 숙련도 0~100 (콘텐츠 없으면 null) */
export function unitMastery(d: ProfileData, unitId: string): number | null {
  const c = CONTENT[unitId];
  if (!c || !c.skills.length) return null;
  const sum = c.skills.reduce((a, s) => a + skillScore(d, unitId, s.id), 0);
  return Math.round(sum / c.skills.length);
}

export function unitAttempted(d: ProfileData, unitId: string): boolean {
  const c = CONTENT[unitId];
  return !!c?.skills.some((s) => (d.skills[skillKey(unitId, s.id)]?.n ?? 0) > 0);
}

export function courseMastery(d: ProfileData, courseId: string): { avg: number; done: number; total: number } {
  const us = unitsOf(courseId);
  let sum = 0,
    n = 0,
    done = 0;
  for (const u of us) {
    const m = unitMastery(d, u.id);
    if (m === null) continue;
    sum += m;
    n++;
    if (m >= 80) done++;
  }
  return { avg: n ? Math.round(sum / n) : 0, done, total: n };
}

export function startLevel(score: number): Level {
  return score < 40 ? 1 : score < 75 ? 2 : 3;
}

function nextScore(s: SkillStat | undefined, ok: boolean, level: Level): SkillStat {
  const cur = s ?? { score: 0, n: 0, c: 0, last: 0 };
  let score = cur.score;
  if (ok) {
    const target = [60, 85, 100][level - 1];
    if (target > score) score += (target - score) * 0.35;
  } else score -= score * 0.2;
  return { score: Math.round(score * 10) / 10, n: cur.n + 1, c: cur.c + (ok ? 1 : 0), last: Date.now() };
}

/**
 * 답 기록. reviewOf: 오답노트 복습이면 원래 문제 키 (다시 풀기는 자기 key, 비슷한 문제는 원래 key)
 */
export function recordAnswer(p: Problem, ok: boolean, reviewOf?: string): void {
  updateData((d) => {
    const k = skillKey(p.unitId, p.skillId);
    const day = dayKey();
    const dd = d.days[day] ?? { n: 0, c: 0 };
    const wrong = { ...d.wrong };
    const now = Date.now();
    const target = reviewOf ?? p.key;
    const existing = wrong[target];
    if (!ok) {
      wrong[target] = {
        key: target,
        unitId: p.unitId,
        skillId: p.skillId,
        box: 0,
        due: now,
        added: existing?.added ?? now,
        lastWrong: now,
        wrongCount: (existing?.wrongCount ?? 0) + 1,
      };
    } else if (existing && (reviewOf || existing.key === p.key)) {
      if (existing.graduated) {
        /* 이미 졸업 */
      } else if (existing.box >= 4) wrong[target] = { ...existing, graduated: true };
      else {
        const box = existing.box + 1;
        wrong[target] = { ...existing, box, due: startOfDay(now) + BOX_DAYS[box] * DAY };
      }
    }
    return {
      ...d,
      skills: { ...d.skills, [k]: nextScore(d.skills[k], ok, p.level) },
      days: { ...d.days, [day]: { n: dd.n + 1, c: dd.c + (ok ? 1 : 0) } },
      wrong,
    };
  });
}

export function dueWrong(d: ProfileData, now = Date.now()): WrongItem[] {
  return Object.values(d.wrong)
    .filter((w) => !w.graduated && w.due <= now && CONTENT[w.unitId])
    .sort((a, b) => a.due - b.due);
}

export function streak(d: ProfileData): number {
  let n = 0;
  let t = Date.now();
  if (!d.days[dayKey(t)]?.n) t -= DAY; // 오늘 아직 안 했으면 어제부터
  while (d.days[dayKey(t)]?.n) {
    n++;
    t -= DAY;
  }
  return n;
}

export interface Recommendation {
  unit: UnitDef;
  reason: 'continue' | 'prereq' | 'start';
  target?: UnitDef; // prereq 일 때 원래 목표 단원
}

/** 내 학년 과정에서 다음에 할 단원 추천 */
export function recommend(d: ProfileData, courseId: string): Recommendation | null {
  const course = COURSES.find((c) => c.id === courseId);
  const order = course?.order ?? 0;
  const candidates = [...unitsOf(courseId), ...UNITS.filter((u) => (COURSES.find((c) => c.id === u.course)?.order ?? 0) > order)];
  for (const u of candidates) {
    const m = unitMastery(d, u.id);
    if (m === null || m >= 80) continue;
    for (const pid of u.prereq) {
      const pm = unitMastery(d, pid);
      if (pm !== null && unitAttempted(d, pid) && pm < 50) return { unit: UNIT_BY_ID[pid], reason: 'prereq', target: u };
    }
    return { unit: u, reason: unitAttempted(d, u.id) ? 'continue' : 'start' };
  }
  return null;
}
