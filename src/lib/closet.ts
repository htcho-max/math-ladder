// 셈이 꾸미기: 레벨·배지로 아이템 해금
import { BADGE_BY_ID, levelInfo, rwOf } from './reward';
import { updateData, type ProfileData } from './store';

export type Slot = 'color' | 'hat' | 'face' | 'hand' | 'fx';
export interface Outfit {
  color?: string;
  hat?: string;
  face?: string;
  hand?: string;
  fx?: string;
  /** 기본 표정 (홈 화면·문제 풀기 전) */
  mood?: 'happy' | 'cheer' | 'think' | 'sleepy';
}
export interface Item {
  id: string;
  slot: Slot;
  name: string;
  /** 해금 조건: 레벨 또는 배지 (둘 다 없으면 처음부터) */
  level?: number;
  badge?: string;
  /** 색 아이템의 실제 색 (gradient 는 'rainbow') */
  fill?: string;
}

export const SLOT_NAME: Record<Slot, string> = { color: '몸 색', hat: '모자', face: '얼굴', hand: '손', fx: '효과' };

export const ITEMS: Item[] = [
  { id: 'default', slot: 'color', name: '기본' },
  { id: 'sky', slot: 'color', name: '하늘', level: 2, fill: '#4fb3ff' },
  { id: 'berry', slot: 'color', name: '딸기', level: 3, fill: '#ff6b8b' },
  { id: 'mint', slot: 'color', name: '민트', level: 5, fill: '#2ec4a6' },
  { id: 'lemon', slot: 'color', name: '레몬', level: 7, fill: '#ffc93c' },
  { id: 'grape', slot: 'color', name: '포도', level: 9, fill: '#9b6bff' },
  { id: 'choco', slot: 'color', name: '초코', level: 12, fill: '#a0704f' },
  { id: 'gold', slot: 'color', name: '황금', badge: 'course1', fill: '#e8b100' },
  { id: 'rainbow', slot: 'color', name: '무지개', level: 25, fill: 'rainbow' },

  { id: 'none', slot: 'hat', name: '없음' },
  { id: 'ribbon', slot: 'hat', name: '리본', level: 2 },
  { id: 'cap', slot: 'hat', name: '야구모자', level: 4 },
  { id: 'catears', slot: 'hat', name: '고양이 귀', level: 6 },
  { id: 'santa', slot: 'hat', name: '산타 모자', level: 8 },
  { id: 'crown', slot: 'hat', name: '왕관', level: 10 },
  { id: 'headphones', slot: 'hat', name: '헤드폰', level: 12 },
  { id: 'wizard', slot: 'hat', name: '마법사 모자', level: 15 },
  { id: 'flower', slot: 'hat', name: '꽃', badge: 'streak7' },
  { id: 'grad', slot: 'hat', name: '학사모', badge: 'certified' },

  { id: 'none', slot: 'face', name: '없음' },
  { id: 'glasses', slot: 'face', name: '동그란 안경', level: 3 },
  { id: 'sunglasses', slot: 'face', name: '선글라스', level: 7 },
  { id: 'mustache', slot: 'face', name: '콧수염', level: 9 },
  { id: 'hearts', slot: 'face', name: '하트 볼', badge: 'combo10' },
  { id: 'stareyes', slot: 'face', name: '별 눈', badge: 'exam100' },

  { id: 'none', slot: 'hand', name: '없음' },
  { id: 'pencil', slot: 'hand', name: '연필' },
  { id: 'ruler', slot: 'hand', name: '자', level: 5 },
  { id: 'protractor', slot: 'hand', name: '각도기', level: 8 },
  { id: 'compass', slot: 'hand', name: '컴퍼스', level: 11 },
  { id: 'calculator', slot: 'hand', name: '계산기', level: 13 },
  { id: 'trophy', slot: 'hand', name: '트로피', badge: 'exam90' },
  { id: 'flag', slot: 'hand', name: '깃발', badge: 'course1' },

  { id: 'none', slot: 'fx', name: '없음' },
  { id: 'sparkle', slot: 'fx', name: '반짝반짝', level: 14 },
  { id: 'notes', slot: 'fx', name: '수학 기호', level: 18 },
  { id: 'fire', slot: 'fx', name: '불꽃', badge: 'streak30' },
];

export function itemOf(slot: Slot, id: string | undefined): Item | undefined {
  return ITEMS.find((i) => i.slot === slot && i.id === id);
}

export function isUnlocked(it: Item, d: ProfileData): boolean {
  const rw = rwOf(d);
  if (it.level && levelInfo(rw.xp).level < it.level) return false;
  if (it.badge && !rw.badges[it.badge]) return false;
  return true;
}

export function unlockText(it: Item): string {
  if (it.level) return `Lv.${it.level}`;
  if (it.badge) return `배지 「${BADGE_BY_ID[it.badge]?.name ?? it.badge}」`;
  return '';
}

/** 정확히 이 레벨에서 새로 열리는 아이템 */
export function itemsAtLevel(level: number): Item[] {
  return ITEMS.filter((i) => i.level === level);
}

export function outfitOf(d: ProfileData): Outfit {
  return rwOf(d).outfit ?? {};
}

export function wear(slot: Slot, id: string): void {
  updateData((d) => {
    const rw = rwOf(d);
    return { ...d, rw: { ...rw, outfit: { ...(rw.outfit ?? {}), [slot]: id } } };
  });
}

export function setMood(mood: NonNullable<Outfit['mood']>): void {
  updateData((d) => {
    const rw = rwOf(d);
    return { ...d, rw: { ...rw, outfit: { ...(rw.outfit ?? {}), mood } } };
  });
}

export function unlockedCount(d: ProfileData): { got: number; total: number } {
  const real = ITEMS.filter((i) => i.id !== 'none' && i.id !== 'default');
  return { got: real.filter((i) => isUnlocked(i, d)).length, total: real.length };
}
