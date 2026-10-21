// 동기 부여: 경험치·레벨·연속 학습(얼음)·오늘의 목표·퀘스트·배지·별
import { CONTENT } from '../content';
import { COURSE_BY_ID, UNITS, UNIT_BY_ID, unitsOf } from '../core/curriculum';
import { hashStr, Rng } from '../core/rng';
import type { Problem } from '../core/types';
import { activeProfile, dayKey, getState, updateData, type ProfileData, type Quest, type RewardData } from './store';
import { dueWrong, unitAttempted, unitMastery } from './mastery';

const DAY = 86400000;

// ───────── 기본값 ─────────
export function rwOf(d: ProfileData): RewardData {
  const r = d.rw;
  if (r) return r;
  // 예전 기록이 있으면 경험치를 대략 채워 줌
  let xp = 0;
  for (const v of Object.values(d.days)) xp += v.c * 12 + (v.n - v.c) * 2;
  return { xp, curve: 2, freezes: 1, frozen: {}, badges: {}, goal: 20, goalDays: {}, questDays: {}, maxCombo: 0, hardCorrect: 0, stars: {}, streakRewarded: 0 };
}

// ───────── 레벨 ─────────
/** 레벨 n → n+1 에 필요한 XP: 200, 400, 600, … (v0.8.2 부터. 하루 오늘의 학습 ≈ 400~600 XP)
 *  Lv3 ≈ 1~2일, Lv5 ≈ 4~5일, Lv10 ≈ 3주, Lv20 ≈ 3달 */
export function levelNeed(n: number): number {
  return 200 * n;
}
/** 예전 곡선 (100, 150, 200, …) — 옮기기용 */
function oldNeed(n: number): number {
  return 100 + 50 * (n - 1);
}
export const XP_CURVE = 2;

/** 예전 곡선의 XP 를 새 곡선으로: 지금 레벨과 다음 레벨까지 진행 비율은 그대로 */
export function convertXp(oldXp: number): number {
  let level = 1,
    rest = oldXp;
  while (rest >= oldNeed(level)) rest -= oldNeed(level++);
  let xp = 0;
  for (let i = 1; i < level; i++) xp += levelNeed(i);
  return Math.round(xp + (rest / oldNeed(level)) * levelNeed(level));
}
export const TITLES: { from: number; name: string; ic: string }[] = [
  { from: 1, name: '수학 새싹', ic: '🌱' },
  { from: 5, name: '숫자 탐험가', ic: '🧭' },
  { from: 10, name: '계산 기사', ic: '🛡️' },
  { from: 15, name: '도형 마법사', ic: '🔮' },
  { from: 20, name: '방정식 해결사', ic: '🗝️' },
  { from: 30, name: '함수 항해사', ic: '⛵' },
  { from: 40, name: '미적분 개척자', ic: '🚀' },
  { from: 50, name: '수학 전설', ic: '👑' },
];
export function levelInfo(xp: number) {
  let level = 1;
  let rest = xp;
  while (rest >= levelNeed(level)) {
    rest -= levelNeed(level);
    level++;
  }
  const t = [...TITLES].reverse().find((x) => level >= x.from)!;
  return { level, into: rest, need: levelNeed(level), title: t.name, icon: t.ic };
}

// ───────── 별 ─────────
export function starsFor(m: number | null): number {
  if (m === null) return 0;
  return m >= 95 ? 3 : m >= 80 ? 2 : m >= 50 ? 1 : 0;
}
export function unitStars(d: ProfileData, unitId: string): number {
  return starsFor(unitMastery(d, unitId));
}
export function courseStars(d: ProfileData, courseId: string): { got: number; max: number } {
  const us = unitsOf(courseId).filter((u) => CONTENT[u.id]);
  return { got: us.reduce((a, u) => a + unitStars(d, u.id), 0), max: us.length * 3 };
}

// ───────── 연속 학습 + 얼음 ─────────
export function isActiveDay(d: ProfileData, key: string): boolean {
  return !!d.days[key]?.n || !!d.rw?.frozen[key];
}
export function streakDays(d: ProfileData): number {
  let n = 0;
  let t = Date.now();
  if (!isActiveDay(d, dayKey(t))) t -= DAY;
  while (isActiveDay(d, dayKey(t))) {
    n++;
    t -= DAY;
  }
  return n;
}

// ───────── 이벤트 (화면 알림) ─────────
export type RewardEvent =
  | { kind: 'level'; level: number; title: string; icon: string }
  | { kind: 'badge'; badge: string }
  | { kind: 'quest'; text: string }
  | { kind: 'quests-all' }
  | { kind: 'star'; unitId: string; stars: number }
  | { kind: 'goal'; goal: number }
  | { kind: 'freeze-used'; days: number }
  | { kind: 'freeze-got' }
  | { kind: 'streak'; days: number }
  | { kind: 'daily'; count: number };

let queue: (RewardEvent & { id: number })[] = [];
let seq = 0;
const subs = new Set<() => void>();
function push(e: RewardEvent) {
  queue = [...queue, { ...e, id: ++seq }];
  subs.forEach((f) => f());
}
export function subscribeEvents(f: () => void) {
  subs.add(f);
  return () => {
    subs.delete(f);
  };
}
export function eventQueue() {
  return queue;
}
export function popEvent(id: number) {
  queue = queue.filter((e) => e.id !== id);
  subs.forEach((f) => f());
}

// ───────── 퀘스트 ─────────
export function questText(q: Quest): string {
  switch (q.kind) {
    case 'solve':
      return `문제 ${q.target}개 풀기`;
    case 'correct':
      return `정답 ${q.target}개 맞히기`;
    case 'combo':
      return `${q.target}문제 연속 정답`;
    case 'hard':
      return `심화 문제 ${q.target}개 맞히기`;
    case 'review':
      return `오답노트 ${q.target}문제 복습`;
    case 'new-unit':
      return '새 단원 하나 시작하기';
    case 'star':
      return '단원 별 1개 얻기';
    case 'exam':
      return '시험 한 번 보기';
  }
}

function makeQuests(d: ProfileData, day: string): Quest[] {
  const rw = rwOf(d);
  const r = new Rng(hashStr(day + getState().active));
  const due = dueWrong(d).length;
  const pool: Quest['kind'][] = ['correct', 'combo', 'hard', 'new-unit', 'star', 'exam'];
  if (due > 0) pool.push('review', 'review'); // 복습할 게 있으면 자주
  const picks = new Set<Quest['kind']>();
  while (picks.size < 2) picks.add(r.pick(pool));
  const target = (k: Quest['kind']): number =>
    k === 'correct' ? Math.max(5, Math.round(rw.goal * 0.6)) : k === 'combo' ? r.pick([3, 5, 5, 7]) : k === 'hard' ? 3 : k === 'review' ? Math.min(3, due) : 1;
  return [
    { id: 'q0', kind: 'solve', target: rw.goal, progress: 0, done: false },
    ...[...picks].map((k, i) => ({ id: `q${i + 1}`, kind: k, target: target(k), progress: 0, done: false })),
  ];
}

/** 오늘의 퀘스트 (날이 바뀌었으면 새로 만듦 — 저장은 하지 않음) */
export function todayQuests(d: ProfileData): Quest[] {
  const day = dayKey();
  const q = d.rw?.quests;
  return q && q.day === day ? q.list : makeQuests(d, day);
}

// ───────── 배지 ─────────
interface Ctx {
  d: ProfileData;
  rw: RewardData;
  totalN: number;
  totalC: number;
  streak: number;
  level: number;
  starUnits: number[]; // [★1이상, ★2이상, ★3] 단원 수
  coursesDone: number;
  exams: number;
  best: number;
  graduated: number;
  strands: number;
}
export interface BadgeDef {
  id: string;
  ic: string;
  name: string;
  desc: string;
  group: string;
  test: (c: Ctx) => boolean;
}
export const BADGES: BadgeDef[] = [
  { id: 'first', ic: '🐣', name: '첫걸음', desc: '첫 문제 풀기', group: '문제 풀기', test: (c) => c.totalN >= 1 },
  { id: 'solve100', ic: '✏️', name: '백 문제', desc: '문제 100개 풀기', group: '문제 풀기', test: (c) => c.totalN >= 100 },
  { id: 'solve500', ic: '📚', name: '오백 문제', desc: '문제 500개 풀기', group: '문제 풀기', test: (c) => c.totalN >= 500 },
  { id: 'solve1000', ic: '🏔️', name: '천 문제', desc: '문제 1,000개 풀기', group: '문제 풀기', test: (c) => c.totalN >= 1000 },
  { id: 'solve3000', ic: '🌋', name: '삼천 문제', desc: '문제 3,000개 풀기', group: '문제 풀기', test: (c) => c.totalN >= 3000 },
  { id: 'hard50', ic: '🧗', name: '심화 등반가', desc: '심화 문제 50개 맞히기', group: '문제 풀기', test: (c) => c.rw.hardCorrect >= 50 },
  { id: 'combo10', ic: '🔥', name: '불꽃 10연속', desc: '10문제 연속 정답', group: '연속 정답', test: (c) => c.rw.maxCombo >= 10 },
  { id: 'combo20', ic: '⚡', name: '번개 20연속', desc: '20문제 연속 정답', group: '연속 정답', test: (c) => c.rw.maxCombo >= 20 },
  { id: 'combo30', ic: '🌟', name: '별빛 30연속', desc: '30문제 연속 정답', group: '연속 정답', test: (c) => c.rw.maxCombo >= 30 },
  { id: 'streak3', ic: '📅', name: '사흘 연속', desc: '3일 연속 학습', group: '꾸준함', test: (c) => c.streak >= 3 },
  { id: 'streak7', ic: '🗓️', name: '일주일 연속', desc: '7일 연속 학습', group: '꾸준함', test: (c) => c.streak >= 7 },
  { id: 'streak30', ic: '🏅', name: '한 달 연속', desc: '30일 연속 학습', group: '꾸준함', test: (c) => c.streak >= 30 },
  { id: 'streak100', ic: '💯', name: '백일 연속', desc: '100일 연속 학습', group: '꾸준함', test: (c) => c.streak >= 100 },
  { id: 'daily1', ic: '📗', name: '오늘의 학습 첫 완료', desc: '오늘의 학습을 처음 끝내기', group: '꾸준함', test: (c) => Object.keys(c.rw.dailyDone ?? {}).length >= 1 },
  { id: 'daily7', ic: '📚', name: '오늘의 학습 7일', desc: '오늘의 학습 7번 끝내기', group: '꾸준함', test: (c) => Object.keys(c.rw.dailyDone ?? {}).length >= 7 },
  { id: 'daily30', ic: '🏛️', name: '오늘의 학습 30일', desc: '오늘의 학습 30번 끝내기', group: '꾸준함', test: (c) => Object.keys(c.rw.dailyDone ?? {}).length >= 30 },
  { id: 'goal7', ic: '🎯', name: '목표 달인', desc: '하루 목표 7번 달성', group: '꾸준함', test: (c) => Object.keys(c.rw.goalDays).length >= 7 },
  { id: 'quests7', ic: '✅', name: '퀘스트 마스터', desc: '오늘의 퀘스트 모두 완료 7번', group: '꾸준함', test: (c) => Object.keys(c.rw.questDays).length >= 7 },
  { id: 'star1', ic: '⭐', name: '첫 별', desc: '단원 별 처음 얻기', group: '별과 단원', test: (c) => c.starUnits[0] >= 1 },
  { id: 'star3', ic: '🌠', name: '별 세 개', desc: '한 단원에서 별 3개', group: '별과 단원', test: (c) => c.starUnits[2] >= 1 },
  { id: 'units10', ic: '🪜', name: '열 계단', desc: '별 2개 이상 단원 10개', group: '별과 단원', test: (c) => c.starUnits[1] >= 10 },
  { id: 'units30', ic: '🏯', name: '서른 계단', desc: '별 2개 이상 단원 30개', group: '별과 단원', test: (c) => c.starUnits[1] >= 30 },
  { id: 'course1', ic: '🏆', name: '과정 정복', desc: '한 과정의 모든 단원 별 2개 이상', group: '별과 단원', test: (c) => c.coursesDone >= 1 },
  { id: 'course5', ic: '👑', name: '다섯 과정 정복', desc: '과정 5개 정복', group: '별과 단원', test: (c) => c.coursesDone >= 5 },
  { id: 'root', ic: '🌳', name: '뿌리 찾기', desc: '내 학년보다 앞 과정 단원에서 별 얻기', group: '별과 단원', test: (c) => !!c.rw.rootStar },
  { id: 'strands5', ic: '🌈', name: '다섯 갈래 탐험', desc: '다섯 갈래(영역)를 모두 공부하기', group: '별과 단원', test: (c) => c.strands >= 5 },
  { id: 'exam1', ic: '📝', name: '첫 시험', desc: '시험 한 번 보기', group: '시험', test: (c) => c.exams >= 1 },
  { id: 'exam90', ic: '🎖️', name: '90점 돌파', desc: '시험 90점 이상', group: '시험', test: (c) => c.best >= 90 },
  { id: 'exam100', ic: '💎', name: '만점', desc: '시험 100점', group: '시험', test: (c) => c.best >= 100 },
  { id: 'clinic1', ic: '🦸', name: '첫 극복', desc: '틀린 문제를 쌍둥이 문제로 극복하기', group: '오답 복습', test: (c) => (c.rw.overcome ?? 0) >= 1 },
  { id: 'clinic20', ic: '💪', name: '오답 극복왕', desc: '쌍둥이 문제로 오답 20번 극복', group: '오답 복습', test: (c) => (c.rw.overcome ?? 0) >= 20 },
  { id: 'certified', ic: '🎓', name: '실력 인증', desc: '수준 진단으로 이전 단원 인증받기', group: '별과 단원', test: (c) => Object.keys(c.rw.certified ?? {}).length >= 1 },
  { id: 'review10', ic: '🩹', name: '오답 졸업 10', desc: '오답노트 10문제 졸업', group: '오답 복습', test: (c) => c.graduated >= 10 },
  { id: 'review50', ic: '🧠', name: '오답 졸업 50', desc: '오답노트 50문제 졸업', group: '오답 복습', test: (c) => c.graduated >= 50 },
  { id: 'lvl5', ic: '🧭', name: '레벨 5', desc: '레벨 5 달성', group: '레벨', test: (c) => c.level >= 5 },
  { id: 'lvl10', ic: '🛡️', name: '레벨 10', desc: '레벨 10 달성', group: '레벨', test: (c) => c.level >= 10 },
  { id: 'lvl20', ic: '🗝️', name: '레벨 20', desc: '레벨 20 달성', group: '레벨', test: (c) => c.level >= 20 },
  { id: 'lvl30', ic: '⛵', name: '레벨 30', desc: '레벨 30 달성', group: '레벨', test: (c) => c.level >= 30 },
];
export const BADGE_BY_ID = Object.fromEntries(BADGES.map((b) => [b.id, b]));

function ctxOf(d: ProfileData, rw: RewardData): Ctx {
  let totalN = 0,
    totalC = 0;
  for (const v of Object.values(d.days)) {
    totalN += v.n;
    totalC += v.c;
  }
  const starUnits = [0, 0, 0];
  const strands = new Set<string>();
  for (const u of UNITS) {
    const s = unitStars(d, u.id);
    for (let i = 0; i < s; i++) starUnits[i]++;
    if (unitAttempted(d, u.id)) strands.add(u.strand);
  }
  const courses = new Set(UNITS.map((u) => u.course));
  let coursesDone = 0;
  for (const c of courses) {
    const us = unitsOf(c).filter((u) => CONTENT[u.id]);
    if (us.length && us.every((u) => unitStars(d, u.id) >= 2)) coursesDone++;
  }
  return {
    d,
    rw,
    totalN,
    totalC,
    streak: streakDays({ ...d, rw }),
    level: levelInfo(rw.xp).level,
    starUnits,
    coursesDone,
    exams: d.exams.length,
    best: d.exams.reduce((a, e) => Math.max(a, e.score), 0),
    graduated: Object.values(d.wrong).filter((w) => w.graduated).length,
    strands: strands.size,
  };
}

// ───────── 핵심: 보상 적용 ─────────
interface Gain {
  xp?: number;
  correct?: boolean;
  answered?: boolean;
  hard?: boolean;
  review?: boolean;
  combo?: number;
  newUnit?: boolean;
  exam?: boolean;
  twin?: boolean;
  daily?: boolean;
}

/** 보상 처리 공통: 데이터 갱신 + 이벤트 */
function apply(g: Gain, starUnitId?: string): number {
  let gained = 0;
  updateData((d0) => {
    const rw: RewardData = { ...rwOf(d0), frozen: { ...rwOf(d0).frozen }, badges: { ...rwOf(d0).badges }, stars: { ...rwOf(d0).stars }, goalDays: { ...rwOf(d0).goalDays }, questDays: { ...rwOf(d0).questDays } };
    const d: ProfileData = { ...d0, rw };
    const before = levelInfo(rw.xp);
    let xp = g.xp ?? 0;
    const day = dayKey();

    if (g.combo !== undefined) {
      rw.maxCombo = Math.max(rw.maxCombo, g.combo);
      if (g.combo > 0 && g.combo % 5 === 0) xp += 10; // 5연속마다 보너스
    }
    if (g.hard) rw.hardCorrect++;
    if (g.daily && !rw.dailyDone?.[dayKey()]) {
      rw.dailyDone = { ...(rw.dailyDone ?? {}), [dayKey()]: true };
      xp += 100;
      push({ kind: 'daily', count: Object.keys(rw.dailyDone).length });
    }
    if (g.twin) {
      rw.overcome = (rw.overcome ?? 0) + 1;
      xp += 30;
    }

    // 별
    if (starUnitId) {
      const now = unitStars(d, starUnitId);
      const had = rw.stars[starUnitId] ?? 0;
      if (now > had) {
        rw.stars[starUnitId] = now;
        xp += 50 * (now - had);
        push({ kind: 'star', unitId: starUnitId, stars: now });
        const u = UNIT_BY_ID[starUnitId];
        const mine = COURSE_BY_ID[activeProfile().course];
        if (u && mine && COURSE_BY_ID[u.course].order < mine.order) rw.rootStar = true;
        g = { ...g, star: true } as Gain & { star: boolean };
      }
    }

    // 하루 목표
    const today = d.days[day]?.n ?? 0;
    if (today >= rw.goal && !rw.goalDays[day]) {
      rw.goalDays[day] = true;
      xp += 50;
      push({ kind: 'goal', goal: rw.goal });
    }

    // 퀘스트
    const qs = (rw.quests && rw.quests.day === day ? rw.quests.list : makeQuests(d0, day)).map((q) => ({ ...q }));
    for (const q of qs) {
      if (q.done) continue;
      if (q.kind === 'solve') q.progress = today;
      else if (q.kind === 'correct' && g.correct) q.progress++;
      else if (q.kind === 'combo' && g.combo !== undefined) q.progress = Math.max(q.progress, g.combo);
      else if (q.kind === 'hard' && g.hard) q.progress++;
      else if (q.kind === 'review' && g.review && g.answered) q.progress++;
      else if (q.kind === 'new-unit' && g.newUnit) q.progress++;
      else if (q.kind === 'star' && (g as { star?: boolean }).star) q.progress++;
      else if (q.kind === 'exam' && g.exam) q.progress++;
      if (q.progress >= q.target) {
        q.progress = q.target;
        q.done = true;
        xp += 30;
        push({ kind: 'quest', text: questText(q) });
      }
    }
    const bonus = rw.quests?.day === day ? rw.quests.bonus : false;
    rw.quests = { day, list: qs, bonus };
    if (!bonus && qs.every((q) => q.done)) {
      rw.quests.bonus = true;
      rw.questDays[day] = true;
      xp += 50;
      push({ kind: 'quests-all' });
    }

    // 연속 학습 보상: 7일마다 얼음 1개 (최대 2)
    const st = streakDays(d);
    if (st > rw.streakRewarded && st % 7 === 0 && st > 0) {
      rw.streakRewarded = st;
      push({ kind: 'streak', days: st });
      if (rw.freezes < 2) {
        rw.freezes++;
        push({ kind: 'freeze-got' });
      }
    }

    rw.xp += xp;
    gained = xp;
    const after = levelInfo(rw.xp);
    if (after.level > before.level) push({ kind: 'level', level: after.level, title: after.title, icon: after.icon });

    // 배지
    const c = ctxOf(d, rw);
    for (const b of BADGES) {
      if (!rw.badges[b.id] && b.test(c)) {
        rw.badges[b.id] = Date.now();
        push({ kind: 'badge', badge: b.id });
      }
    }
    return d;
  });
  return gained;
}

/** 연습 문제 하나 채점 후 (recordAnswer 다음에 호출). 반환: 이번에 얻은 XP */
/** 힌트를 단계별로 볼수록 정답 XP 가 줄어듦 */
export const HINT_XP = [1, 0.8, 0.6, 0.5];

export function rewardAnswer(p: Problem, ok: boolean, o: { combo: number; review: boolean; newUnit: boolean; hints?: number; twin?: boolean }): number {
  const base = ok ? Math.round([10, 15, 20][p.level - 1] * HINT_XP[Math.min(3, o.hints ?? 0)]) : 2;
  return apply({ xp: base, correct: ok, answered: true, hard: ok && p.level === 3 && !o.hints, review: o.review, combo: o.combo, newUnit: o.newUnit, twin: ok && o.twin }, p.unitId);
}

/** 수준 진단에서 맞힌 단원을 별 1개(숙련도 50) 상태로 인증 */
export function certifyUnits(unitIds: string[]): string[] {
  const done: string[] = [];
  updateData((d) => {
    const skills = { ...d.skills };
    const rw = rwOf(d);
    const certified = { ...(rw.certified ?? {}) };
    for (const u of unitIds) {
      const c = CONTENT[u];
      if (!c) continue;
      let changed = false;
      for (const sk of c.skills) {
        const k = `${u}/${sk.id}`;
        const cur = skills[k] ?? { score: 0, n: 0, c: 0, last: 0 };
        if (cur.score < 50) {
          skills[k] = { ...cur, score: 50, last: Date.now() };
          changed = true;
        }
      }
      if (changed || !certified[u]) {
        certified[u] = Date.now();
        done.push(u);
      }
    }
    return { ...d, skills, rw: { ...rw, certified } };
  });
  for (const u of done) apply({}, u);
  return done;
}

/** 시험 제출 후 */
export function rewardExam(score: number, unitIds: string[]): number {
  let total = apply({ xp: Math.round(score / 2) + 20, exam: true });
  for (const u of new Set(unitIds)) total += apply({}, u);
  return total;
}

/** 앱 시작 때: 빠진 날을 얼음으로 메우기 (어제까지 이어지던 연속 학습을 지켜 줌) */
/** 레벨 곡선이 바뀐 뒤 처음 열 때: 레벨은 그대로 두고 XP 만 새 곡선에 맞춤 (프로필마다 한 번) */
export function migrateXp(): void {
  const rw = getState().data.rw;
  if (!rw || (rw.curve ?? 1) >= XP_CURVE) return;
  updateData((d0) => {
    const r = rwOf(d0);
    return { ...d0, rw: { ...r, xp: convertXp(r.xp), curve: XP_CURVE } };
  });
}

export function applyFreezes(): void {
  const d = getState().data;
  const rw = rwOf(d);
  if (!rw.freezes) return;
  let t = Date.now() - DAY;
  const missing: string[] = [];
  for (let i = 0; i < 7 && !isActiveDay(d, dayKey(t)); i++) {
    missing.push(dayKey(t));
    t -= DAY;
  }
  if (!missing.length || missing.length > rw.freezes) return;
  if (!isActiveDay(d, dayKey(t))) return; // 그 전 날도 비어 있으면 지킬 연속 기록이 없음
  updateData((d0) => {
    const r = rwOf(d0);
    const frozen = { ...r.frozen };
    missing.forEach((k) => (frozen[k] = true));
    return { ...d0, rw: { ...r, frozen, freezes: r.freezes - missing.length } };
  });
  push({ kind: 'freeze-used', days: missing.length });
}

export function setGoal(goal: number): void {
  updateData((d) => ({ ...d, rw: { ...rwOf(d), goal } }));
}

/** 오늘의 학습을 끝냈을 때 (+100 XP, 도장) */
export function rewardDaily(): number {
  return apply({ daily: true });
}
