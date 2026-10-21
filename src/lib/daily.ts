// 오늘의 학습: 하루 목표만큼의 문제를 한 묶음으로 (오답 복습 → 추천 단원 → 약한 유형)
import { CONTENT } from '../content';
import { skillCat, type Cat } from '../content/meta';
import { UNIT_BY_ID, prereqChain, unitsOf } from '../core/curriculum';
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
  /** 짜는 규칙 버전 — 바뀌면 남은 문제를 새 규칙으로 다시 짬 */
  ver?: number;
}

const PLAN_VER = 2;

/** 약한 유형: 풀어 본 적 있고 점수 70 미만, 오래되고 낮은 순 (추천 단원 제외).
 *  지금 학년 것을 먼저, 다른 학년은 지금 학년 단원의 선수 단원(2단계 안)만 */
function weakSkills(d: ProfileData, exclude: string, course: string): { unitId: string; skillId: string; mine: boolean }[] {
  const mineUnits = new Set(unitsOf(course).map((u) => u.id));
  const near = new Set(unitsOf(course).flatMap((u) => prereqChain(u.id, 2).map((x) => x.id)));
  const out: { unitId: string; skillId: string; w: number; mine: boolean }[] = [];
  for (const [k, st] of Object.entries(d.skills)) {
    const [unitId, skillId] = k.split('/');
    if (unitId === exclude || !CONTENT[unitId]?.skills.some((s) => s.id === skillId)) continue;
    const mine = mineUnits.has(unitId);
    if (!mine && !near.has(unitId)) continue;
    if (st.n > 0 && st.score < 70) out.push({ unitId, skillId, mine, w: st.score + (Date.now() - st.last) / -864e5 });
  }
  return out.sort((a, b) => Number(b.mine) - Number(a.mine) || a.w - b.w);
}

export function buildDaily(d: ProfileData, day = dayKey()): DailyPlan {
  const goal = rwOf(d).goal;
  const r = new Rng(hashStr(day + getState().active));
  const course = activeProfile().course;
  const rec = recommend(d, course);
  const recUnit = rec?.unit.id;
  // 선수 단원으로 돌아가라는 추천이면 새 문제의 1/3 만 선수 단원, 나머지는 원래 단원
  const detour = rec?.reason === 'prereq' && rec.target ? rec.target.id : undefined;
  const mineUnits = new Set(unitsOf(course).map((u) => u.id));
  // 오답 복습: 지금 학년 것을 먼저, 다른 학년 오답은 2개까지
  const dueAll = dueWrong(d);
  const dueMine = dueAll.filter((w) => mineUnits.has(w.unitId));
  const due = [...dueMine, ...dueAll.filter((w) => !mineUnits.has(w.unitId)).slice(0, 2)];
  const nReview = Math.min(5, due.length, Math.floor(goal * 0.3));
  const weakAll = weakSkills(d, recUnit ?? '', course);
  // 다른 학년 약한 유형은 약한 유형 칸의 1/3 까지
  const weak = weakAll;
  const otherCap = Math.max(1, Math.round((goal * 0.35) / 3));
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
  const nDetour = detour ? Math.ceil(nNew / 3) : nNew;
  for (let i = 0; i < nNew; i++) items.push({ kind: 'new', unitId: i < nDetour ? recUnit! : detour! });
  const pool = weak.slice(0, Math.max(3, nWeak));
  let weakAdded = 0,
    other = 0;
  for (let i = 0; weakAdded < nWeak && pool.length && i < nWeak * 3; i++) {
    const w = pool[i % pool.length];
    if (!w.mine) {
      if (other >= otherCap) continue;
      other++;
    }
    items.push({ kind: 'weak', unitId: w.unitId, skillId: w.skillId });
    weakAdded++;
  }
  // 약한 유형이 모자라면 새 문제로 채움
  for (let i = weakAdded; i < nWeak && recUnit; i++) items.push({ kind: 'new', unitId: detour ?? recUnit });
  // 아무것도 없으면(처음 시작 + 추천 없음) 내 학년 첫 단원
  if (!items.length) {
    const first = Object.keys(CONTENT).find((u) => UNIT_BY_ID[u]?.course === activeProfile().course) ?? 'e1a-1';
    for (let i = 0; i < goal; i++) items.push({ kind: 'new', unitId: first });
  }
  // 약한 유형은 새 문제 사이사이에 섞기 (복습은 맨 앞)
  const head = items.filter((x) => x.kind === 'review');
  const rest = r.shuffle(items.filter((x) => x.kind !== 'review'));
  return { day, items: [...head, ...rest], idx: 0, correct: 0, course: activeProfile().course, ver: PLAN_VER };
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
  if (p.done || (p.course === course && p.ver === PLAN_VER)) return p;
  const fresh = buildDaily(getState().data, p.day);
  const kept = p.items.slice(0, p.idx);
  const keptKeys = new Set(kept.flatMap((x) => (x.kind === 'review' ? [x.key] : [])));
  const restN = Math.max(0, p.items.length - p.idx);
  const rest = fresh.items.filter((x) => !(x.kind === 'review' && keptKeys.has(x.key))).slice(0, restN);
  const q: DailyPlan = { ...p, items: [...kept, ...rest], course, ver: PLAN_VER };
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

export function dailySkillPick(d: ProfileData, unitId: string, prev?: string, want?: Cat): string {
  const c = CONTENT[unitId];
  const pool = want ? c.skills.filter((s) => skillCat(unitId, s.id) === want) : [];
  const list = pool.length ? pool : c.skills;
  const ranked = list
    .filter((s) => s.id !== prev || list.length === 1)
    .map((s) => ({ id: s.id, w: skillScore(d, unitId, s.id) + Math.random() * 45 }))
    .sort((a, b) => a.w - b.w);
  return ranked[0].id;
}

export { skillKey };
