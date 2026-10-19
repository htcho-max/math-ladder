// 전역 저장소: 프로필·설정·학습 기록 (localStorage)
import { useSyncExternalStore } from 'react';

const P = 'math-ladder.v1';

export interface Profile {
  id: string;
  name: string;
  course: string; // 학년 = 과정 id
}

export interface Settings {
  geminiKey: string;
  geminiModel: string;
  theme: 'auto' | 'light' | 'dark';
  /** 선수 단원 잠금 모드: 선수 단원 별 1개 이상이어야 연습 가능 */
  lockMode?: boolean;
  /** 문제 읽어 주기 버튼: auto(초등 1~4학년) / on / off */
  tts?: 'auto' | 'on' | 'off';
  /** 축하 효과(색종이) */
  effects?: boolean;
  /** 문제 형식: 섞기(기본) / 주관식 위주 / 객관식 위주 */
  choiceMode?: 'mix' | 'open' | 'choice';
}

export const CHOICE_RATIO = { mix: 0.5, open: 0, choice: 0.8 } as const;
/** 연습에서 객관식이 차지할 목표 비율 */
export function choiceRatio(): number {
  return CHOICE_RATIO[getState().settings.choiceMode ?? 'mix'];
}

export interface SkillStat {
  score: number;
  n: number;
  c: number;
  last: number;
}

export interface WrongItem {
  key: string;
  unitId: string;
  skillId: string;
  box: number; // 0~4
  due: number; // ms
  added: number;
  lastWrong: number;
  wrongCount: number;
  graduated?: boolean;
  /** 쌍둥이 문제로 극복한 시각 */
  overcome?: number;
}

export interface ExamItemRec {
  key: string;
  asChoice: boolean;
  answer: unknown;
  ok: boolean;
  points: number;
}

export interface ExamRecord {
  id: string;
  date: number;
  kind: ExamKind;
  title: string;
  score: number;
  correct: number;
  count: number;
  durationSec: number;
  units: Record<string, { n: number; c: number }>;
  items: ExamItemRec[];
  essays?: EssayItem[];
  /** 수준 진단으로 인증된 단원 */
  certified?: string[];
}

export type ExamKind = 'unit' | 'mid' | 'final' | 'custom' | 'diag';

export interface EssayItem {
  q: string;
  answer: string;
  rubric: string;
  mine?: string;
  self?: 'ok' | 'part' | 'no';
}

/** 동기 부여 기록 (reward.ts) */
export interface Quest {
  id: string;
  kind: 'solve' | 'correct' | 'combo' | 'hard' | 'review' | 'new-unit' | 'star' | 'exam';
  target: number;
  progress: number;
  done: boolean;
}
export interface RewardData {
  xp: number;
  freezes: number;
  frozen: Record<string, true>;
  badges: Record<string, number>;
  quests?: { day: string; list: Quest[]; bonus?: boolean };
  goal: number;
  goalDays: Record<string, true>;
  questDays: Record<string, true>;
  maxCombo: number;
  hardCorrect: number;
  stars: Record<string, number>;
  streakRewarded: number;
  rootStar?: boolean;
  /** 쌍둥이 문제로 오답 극복한 횟수 */
  overcome?: number;
  /** 진단 평가로 인증된 단원 */
  certified?: Record<string, number>;
}

export interface ProfileData {
  skills: Record<string, SkillStat>; // `${unitId}/${skillId}`
  days: Record<string, { n: number; c: number }>; // YYYY-MM-DD
  wrong: Record<string, WrongItem>;
  rw?: RewardData;
  exams: ExamRecord[];
}

export interface State {
  profiles: Profile[];
  active: string;
  settings: Settings;
  data: ProfileData;
  storageError: string | null;
}

const emptyData = (): ProfileData => ({ skills: {}, days: {}, wrong: {}, exams: [] });
const defaultSettings: Settings = { geminiKey: '', geminiModel: 'gemini-2.5-flash-lite', theme: 'auto', choiceMode: 'mix', effects: true, lockMode: false, tts: 'auto' };

function read<T>(k: string): T | null {
  try {
    const s = localStorage.getItem(k);
    return s ? (JSON.parse(s) as T) : null;
  } catch {
    return null;
  }
}

let storageError: string | null = null;
function write(k: string, v: unknown): boolean {
  try {
    localStorage.setItem(k, JSON.stringify(v));
    if (storageError) {
      storageError = null;
    }
    return true;
  } catch (e) {
    const name = (e as DOMException)?.name ?? '';
    storageError = /Quota/i.test(name) ? '저장 공간이 가득 찼어요. 설정에서 백업 후 오래된 기록을 지워 주세요.' : '기록을 저장하지 못했어요 (브라우저 저장소를 쓸 수 없음).';
    return false;
  }
}

export const newId = () => Math.random().toString(36).slice(2, 10);

function load(): State {
  const pf = read<{ profiles: Profile[]; active: string }>(`${P}.profiles`);
  let profiles = pf?.profiles ?? [];
  if (!profiles.length) profiles = [{ id: newId(), name: '학생', course: 'e1a' }];
  const active = profiles.some((p) => p.id === pf?.active) ? pf!.active : profiles[0].id;
  const settings = { ...defaultSettings, ...(read<Settings>(`${P}.settings`) ?? {}) };
  const data = { ...emptyData(), ...(read<ProfileData>(`${P}.${active}.data`) ?? {}) };
  return { profiles, active, settings, data, storageError: null };
}

let state: State = load();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getState(): State {
  return state;
}

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => sel(state),
  );
}

function saveProfiles() {
  write(`${P}.profiles`, { profiles: state.profiles, active: state.active });
}

export function updateData(fn: (d: ProfileData) => ProfileData): void {
  const data = fn(state.data);
  write(`${P}.${state.active}.data`, data);
  state = { ...state, data, storageError };
  emit();
}

export function updateSettings(patch: Partial<Settings>): void {
  const settings = { ...state.settings, ...patch };
  write(`${P}.settings`, settings);
  state = { ...state, settings, storageError };
  emit();
}

export function activeProfile(s: State = state): Profile {
  return s.profiles.find((p) => p.id === s.active) ?? s.profiles[0];
}

export function updateProfile(id: string, patch: Partial<Profile>): void {
  state = { ...state, profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)) };
  saveProfiles();
  state = { ...state, storageError };
  emit();
}

export function addProfile(name: string, course: string): void {
  const p = { id: newId(), name, course };
  state = { ...state, profiles: [...state.profiles, p] };
  saveProfiles();
  switchProfile(p.id);
}

export function switchProfile(id: string): void {
  const data = { ...emptyData(), ...(read<ProfileData>(`${P}.${id}.data`) ?? {}) };
  state = { ...state, active: id, data };
  saveProfiles();
  state = { ...state, storageError };
  emit();
}

export function deleteProfile(id: string): void {
  if (state.profiles.length <= 1) return;
  try {
    localStorage.removeItem(`${P}.${id}.data`);
    localStorage.removeItem(`${P}.${id}.exam`);
  } catch {
    /* 무시 */
  }
  const profiles = state.profiles.filter((p) => p.id !== id);
  state = { ...state, profiles };
  if (state.active === id) switchProfile(profiles[0].id);
  else {
    saveProfiles();
    emit();
  }
}

export function resetData(): void {
  updateData(() => emptyData());
}

/** 진행 중 시험 (프로필별) */
export function readProfileKey<T>(k: string): T | null {
  return read<T>(`${P}.${state.active}.${k}`);
}
export function writeProfileKey(k: string, v: unknown): void {
  if (v === null) {
    try {
      localStorage.removeItem(`${P}.${state.active}.${k}`);
    } catch {
      /* 무시 */
    }
    return;
  }
  write(`${P}.${state.active}.${k}`, v);
  if (storageError !== state.storageError) {
    state = { ...state, storageError };
    emit();
  }
}

// ───────── 백업 ─────────
export function exportBackup(): string {
  const all: Record<string, unknown> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (k.startsWith(P)) all[k] = JSON.parse(localStorage.getItem(k)!);
    }
  } catch {
    /* 무시 */
  }
  return JSON.stringify({ app: 'math-ladder', version: 1, exportedAt: new Date().toISOString(), data: all }, null, 1);
}

export function importBackup(text: string): void {
  const obj = JSON.parse(text);
  if (obj?.app !== 'math-ladder' || typeof obj.data !== 'object') throw new Error('수학 사다리 백업 파일이 아니에요');
  for (const [k, v] of Object.entries(obj.data as Record<string, unknown>)) {
    if (k.startsWith(P)) localStorage.setItem(k, JSON.stringify(v));
  }
  state = load();
  emit();
}

// ───────── 날짜 ─────────
export function dayKey(t = Date.now()): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function startOfDay(t = Date.now()): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
