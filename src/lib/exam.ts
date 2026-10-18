// 시험 만들기·채점
import { CONTENT } from '../content';
import { COURSE_BY_ID, UNIT_BY_ID, prereqChain, unitsOf, UNITS } from '../core/curriculum';
import { judge, type UserAnswer } from '../core/check';
import { problemFromKey } from '../core/problem';
import { Rng, randomSeed } from '../core/rng';
import { numChoices } from '../core/tex';
import { autoDisplay } from '../core/check';
import type { AnswerSpec, Level, Problem } from '../core/types';
import type { EssayItem, ExamKind } from './store';

export type Mix = 'basic' | 'standard' | 'hard';
export const MIX: Record<Mix, { name: string; p: [number, number, number] }> = {
  basic: { name: '기본', p: [0.6, 0.3, 0.1] },
  standard: { name: '표준', p: [0.3, 0.5, 0.2] },
  hard: { name: '심화', p: [0.1, 0.4, 0.5] },
};
export const POINTS: Record<Level, number> = { 1: 3, 2: 4, 3: 5 };

export interface ExamItem {
  key: string;
  asChoice: boolean;
}

export interface ExamState {
  id: string;
  kind: ExamKind;
  title: string;
  units: string[];
  items: ExamItem[];
  answers: (UserAnswer | undefined)[];
  startedAt: number;
  timeLimitMin: number; // 0 = 없음
  essays?: EssayItem[];
  courseId?: string;
}

/** 시험용 문제: num → 5지선다 변환 포함 */
export function examProblem(it: ExamItem): Problem | null {
  const p = problemFromKey(it.key);
  if (!p) return null;
  if (it.asChoice && p.answer.type === 'num') {
    const a = p.answer;
    const ch = numChoices(new Rng(p.seed + 7), a.value, [], 5, a.display ?? autoDisplay(a.value, p.unitId));
    const choices = a.unit ? ch.choices.map((c) => `${c} ${a.unit}`) : ch.choices;
    const answer: AnswerSpec = { type: 'choice', choices, index: ch.index };
    return { ...p, answer };
  }
  return p;
}

function pickLevel(r: Rng, mix: Mix): Level {
  const [a, b] = MIX[mix].p;
  const x = r.next();
  return x < a ? 1 : x < a + b ? 2 : 3;
}

export function buildExam(opts: { kind: ExamKind; title: string; units: string[]; count: number; mix: Mix; timeLimitMin: number; courseId?: string }): ExamState {
  const r = new Rng(randomSeed());
  const units = opts.units.filter((u) => CONTENT[u]?.skills.length);
  const items: (ExamItem & { order: number; level: Level })[] = [];
  if (units.length) {
    const unitOrder = r.shuffle(units);
    const skillPtr: Record<string, number> = {};
    const skillLists: Record<string, string[]> = Object.fromEntries(units.map((u) => [u, r.shuffle(CONTENT[u].skills.map((s) => s.id))]));
    for (let i = 0; i < opts.count; i++) {
      const u = unitOrder[i % unitOrder.length];
      const list = skillLists[u];
      const sk = list[(skillPtr[u] = (skillPtr[u] ?? -1) + 1) % list.length];
      const level: Level = opts.kind === 'diag' ? 2 : pickLevel(r, opts.mix);
      const seed = randomSeed();
      const key = `${u}/${sk}/${level}/${seed}`;
      const p = problemFromKey(key);
      if (!p) continue;
      const asChoice = p.answer.type === 'num' && r.chance(0.4);
      items.push({ key, asChoice, order: units.indexOf(u) * 10 + level, level });
    }
  }
  items.sort((a, b) => a.order - b.order);
  return {
    id: Math.random().toString(36).slice(2, 10),
    kind: opts.kind,
    title: opts.title,
    units,
    items: items.map(({ key, asChoice }) => ({ key, asChoice })),
    answers: items.map(() => undefined),
    startedAt: Date.now(),
    timeLimitMin: opts.timeLimitMin,
    courseId: opts.courseId,
  };
}

/** 수준 진단: 과정의 선수 단원 체인 (다른 과정만), 최대 20개 */
export function diagUnits(courseId: string): string[] {
  const own = new Set(unitsOf(courseId).map((u) => u.id));
  const set = new Map<string, number>();
  for (const u of unitsOf(courseId)) {
    for (const p of prereqChain(u.id, 3)) if (!own.has(p.id)) set.set(p.id, UNITS.indexOf(p));
  }
  const all = [...set.entries()].sort((a, b) => a[1] - b[1]).map(([id]) => id);
  // 문제가 있는 단원이 20개를 넘으면 고르게 20개만 (없는 단원은 화면에 '준비 중'으로만 보임)
  const ready = all.filter((id) => CONTENT[id]?.skills.length);
  if (ready.length <= 20) return all;
  const step = ready.length / 20;
  return Array.from({ length: 20 }, (_, i) => ready[Math.floor(i * step)]);
}

export interface ExamResult {
  score: number;
  correct: number;
  count: number;
  per: { problem: Problem; ok: boolean; note?: string; points: number }[];
  units: Record<string, { n: number; c: number }>;
}

export function gradeExam(ex: ExamState): ExamResult {
  const per: ExamResult['per'] = [];
  const units: Record<string, { n: number; c: number }> = {};
  let earned = 0,
    total = 0,
    correct = 0;
  ex.items.forEach((it, i) => {
    const p = examProblem(it);
    if (!p) return;
    const v = judge(p.answer, ex.answers[i]);
    const pts = POINTS[p.level];
    total += pts;
    if (v.ok) {
      earned += pts;
      correct++;
    }
    const u = (units[p.unitId] ??= { n: 0, c: 0 });
    u.n++;
    if (v.ok) u.c++;
    per.push({ problem: p, ok: v.ok, note: v.note, points: pts });
  });
  return { score: total ? Math.round((100 * earned) / total) : 0, correct, count: per.length, per, units };
}

export function examTitle(kind: ExamKind, courseId?: string, unitId?: string): string {
  const c = courseId ? COURSE_BY_ID[courseId]?.title : '';
  switch (kind) {
    case 'unit':
      return unitId ? `${COURSE_BY_ID[UNIT_BY_ID[unitId].course].title} ${UNIT_BY_ID[unitId].title} 단원평가` : '단원평가';
    case 'mid':
      return `${c} 중간고사 대비`;
    case 'final':
      return `${c} 기말고사 대비`;
    case 'diag':
      return `${c} 수준 진단`;
    default:
      return '범위 선택 시험';
  }
}
