// 오늘의 학습: 하루 목표만큼의 문제를 한 묶음으로 (오답 복습 → 추천 단원 → 약한 유형)
import { CONTENT } from '../content';
import { UNIT_BY_ID } from '../core/curriculum';
import { hashStr, Rng } from '../core/rng';
import { dueWrong, recommend, skillKey, skillScore } from './mastery';
import { rwOf } from './reward';
import { activeProfile, dayKey, getState, readProfileKey, writeProfileKey, type ProfileData } from './store';

export type DailyItem =
  | { kind: 'review'; key: string; unitId: string }
  | { kind: 'new'; unitId: string }
  | { kind: 'weak'; unitId: string; skillId: string };

export interface DailyPlan {
  day: string;
  items: DailyItem[];
  /** 끝낸 문항 수 (쌍둥이 문제는 세지 않음) */
  idx: number;
  correct: number;
  done?: boolean;
  /** 만들 때의 학년(과정). 학년이 바뀌면 남은 문제를 새 학년으로 다시 짬 */
  course?: string;
}

/** 약한 유형: 풀어 본 적 있고 점수 70 미만, 오래된 순 (추천 단원 제외) */
function weakSkills(d: ProfileData, exclude: string): { unitId: string; skillId: string }[] {
  const out: { unitId: string; skillId: string; w: number }[] = [];
  for (const [k, st] of Object.entries(d.skills)) {
    const [unitId, skillId] = k.split('/');
    if (unitId === exclude || !CONTENT[unitId]?.skills.some((s) => s.id === skillId)) continue;
    if (st.n > 0 && st.score < 70) out.push({ unitId, skillId, w: st.score + (Date.now() - st.last) / -864e5 });
  }
  return out.sort((a, b) => a.w - b.w);
}

export function buildDaily(d: ProfileData, day = dayKey()): DailyPlan {
  const goal = rwOf(d).goal;
  const r = new Rng(hashStr(day + getState().active));
  const rec = recommend(d, activeProfile().course);
  const recUnit = rec?.unit.id;
  const due = dueWrong(d);
  const nReview = Math.min(5, due.length, Math.floor(goal * 0.3));
  const weak = weakSkills(d, recUnit ?? '');
  let nNew = Math.round((goal - nReview) * 0.65);
  let nWeak = goal - nReview - nNew;
  if (weak.length === 0) {
    nNew += nWeak;
    nWeak = 0;
  }
  if (!recUnit) {
    nWeak += nNew;
    nNew = 0;
  }
  const items: DailyItem[] = [];
  for (const w of due.slice(0, nReview)) items.push({ kind: 'review', key: w.key, unitId: w.unitId });
  for (let i = 0; i < nNew; i++) items.push({ kind: 'new', unitId: recUnit! });
  const pool = weak.slice(0, Math.max(3, nWeak));
  for (let i = 0; i < nWeak && pool.length; i++) {
    const w = pool[i % pool.length];
    items.push({ kind: 'weak', unitId: w.unitId, skillId: w.skillId });
  }
  // 아무것도 없으면(처음 시작 + 추천 없음) 내 학년 첫 단원
  if (!items.length) {
    const first = Object.keys(CONTENT).find((u) => UNIT_BY_ID[u]?.course === activeProfile().course) ?? 'e1a-1';
    for (let i = 0; i < goal; i++) items.push({ kind: 'new', unitId: first });
  }
  // 약한 유형은 새 문제 사이사이에 섞기 (복습은 맨 앞)
  const head = items.filter((x) => x.kind === 'review');
  const rest = r.shuffle(items.filter((x) => x.kind !== 'review'));
  return { day, items: [...head, ...rest], idx: 0, correct: 0, course: activeProfile().course };
}

/** 오늘 계획 (없거나 날이 바뀌었으면 새로) — 저장된 것을 그대로 돌려줌 */
export function todayDaily(create = true): DailyPlan | null {
  const day = dayKey();
  const saved = readProfileKey<DailyPlan>('daily');
  if (saved && saved.day === day) return syncCourse(saved);
  if (!create) return null;
  const p = buildDaily(getState().data, day);
  writeProfileKey('daily', p);
  return p;
}

/** 학년이 바뀌었으면: 이미 푼 문제는 두고, 남은 문제만 새 학년 기준으로 다시 만듦 */
function syncCourse(p: DailyPlan): DailyPlan {
  const course = activeProfile().course;
  if (p.done || p.course === course) return p;
  if (p.course === undefined && p.idx > 0) {
    // 예전 버전에서 만든 진행 중 계획: 학년을 알 수 없으니 그대로 두고 표시만
    const q = { ...p, course };
    writeProfileKey('daily', q);
    return q;
  }
  const fresh = buildDaily(getState().data, p.day);
  const kept = p.items.slice(0, p.idx);
  const keptKeys = new Set(kept.flatMap((x) => (x.kind === 'review' ? [x.key] : [])));
  const restN = Math.max(0, p.items.length - p.idx);
  const rest = fresh.items.filter((x) => !(x.kind === 'review' && keptKeys.has(x.key))).slice(0, restN);
  const q: DailyPlan = { ...p, items: [...kept, ...rest], course };
  writeProfileKey('daily', q);
  return q;
}

export function saveDaily(p: DailyPlan): void {
  writeProfileKey('daily', p);
}

/** 화면 표시용: 저장된 오늘 계획이 있으면 진행도, 없으면 목표 수만 */
export function dailyStatus(d: ProfileData): { total: number; idx: number; done: boolean } {
  const day = dayKey();
  const saved = readProfileKey<DailyPlan>('daily');
  const done = !!rwOf(d).dailyDone?.[day];
  if (saved && saved.day === day) {
    const p = syncCourse(saved);
    return { total: p.items.length, idx: p.idx, done: done || !!p.done };
  }
  return { total: rwOf(d).goal, idx: 0, done };
}

export function dailySkillPick(d: ProfileData, unitId: string, prev?: string): string {
  const c = CONTENT[unitId];
  const ranked = c.skills
    .filter((s) => s.id !== prev || c.skills.length === 1)
    .map((s) => ({ id: s.id, w: skillScore(d, unitId, s.id) + Math.random() * 45 }))
    .sort((a, b) => a.w - b.w);
  return ranked[0].id;
}

export { skillKey };
