import { describe, expect, it } from 'vitest';
import { parseNum, judge, answerText } from '../src/core/check';
import { polishTex } from '../src/core/polish';
import { F } from '../src/core/frac';
import { poly, numTex } from '../src/core/tex';
import { UNITS, UNIT_BY_ID, prereqChain } from '../src/core/curriculum';
import { makeProblem, problemFromKey } from '../src/core/problem';
import { CONTENT } from '../src/content';

describe('입력 해석', () => {
  it('여러 형식의 수', () => {
    expect(parseNum('3')?.value).toBe(3);
    expect(parseNum('-2.5')?.value).toBe(-2.5);
    expect(parseNum('−5')?.value).toBe(-5);
    expect(parseNum('3/4')?.value).toBe(0.75);
    expect(parseNum('-3/4')?.value).toBe(-0.75);
    expect(parseNum('2 1/3')?.frac).toEqual([7, 3]);
    expect(parseNum('2와 1/3')?.frac).toEqual([7, 3]);
    expect(parseNum('1,200')?.value).toBe(1200);
    expect(parseNum('.5')?.value).toBe(0.5);
    expect(parseNum('abc')).toBeNull();
    expect(parseNum('1/0')).toBeNull();
  });
  it('채점', () => {
    expect(judge({ type: 'num', value: 0.5 }, '1/2').ok).toBe(true);
    expect(judge({ type: 'num', value: 0.5, requireReduced: true }, '2/4').ok).toBe(false);
    expect(judge({ type: 'num', value: 0.5, requireReduced: true }, '0.5').ok).toBe(true);
    expect(judge({ type: 'num', value: 1 / 3 }, '0.333').ok).toBe(false);
    expect(judge({ type: 'set', values: [2, -3] }, '-3, 2').ok).toBe(true);
    expect(judge({ type: 'set', values: [2, -3] }, '2').ok).toBe(false);
    expect(judge({ type: 'set', values: [2, 2] }, '2').ok).toBe(true);
    expect(judge({ type: 'fields', fields: [{ label: '몫', value: 4 }, { label: '나머지', value: 1 }] }, ['4', '1']).ok).toBe(true);
    expect(judge({ type: 'choice', choices: ['a', 'b'], index: 1 }, 1).ok).toBe(true);
  });
  it('정답 표시', () => {
    expect(answerText({ type: 'num', value: 0.75 }, 'hc1-1')).toBe('$\\frac{3}{4}$');
    expect(answerText({ type: 'num', value: 0.75 }, 'e4b-3')).toBe('$0.75$');
    expect(answerText({ type: 'num', value: 2.5 }, 'm3b-3')).toBe('$2.5$');
    expect(answerText({ type: 'num', value: 0.4772 }, 'pst-6')).toBe('$0.4772$');
  });
});

describe('표기 도우미', () => {
  it('분수·다항식', () => {
    expect(new F(6, -8).tex()).toBe('-\\frac{3}{4}');
    expect(new F(7, 3).mixedTex()).toBe('2\\frac{1}{3}');
    expect(poly([1, -3, 2])).toBe('x^{2}-3x+2');
    expect(poly([-1, 0, 1])).toBe('-x^{2}+1');
    expect(numTex(12345)).toBe('12{,}345');
    expect(numTex(1 / 3)).toBe('\\frac{1}{3}');
  });
  it('polish', () => {
    expect(polishTex('-1x+1y=3')).toBe('-x+y=3');
    expect(polishTex('8+-1')).toBe('8-1');
    expect(polishTex('1\\frac{1}{2}')).toBe('1\\frac{1}{2}');
    expect(polishTex('x=10x+0.1x')).toBe('x=10x+0.1x');
  });
});

describe('교육과정·문제 키', () => {
  it('선수 단원이 모두 존재하고 순환이 없음', () => {
    for (const u of UNITS) for (const p of u.prereq) expect(UNIT_BY_ID[p], `${u.id} → ${p}`).toBeTruthy();
    for (const u of UNITS) expect(prereqChain(u.id, 50).some((x) => x.id === u.id)).toBe(false);
  });
  it('모든 단원에 콘텐츠', () => {
    for (const u of UNITS) expect(CONTENT[u.id], u.id).toBeTruthy();
  });
  it('키로 같은 문제 재생성', () => {
    const p = makeProblem('m1a-1', 'factorize', 2, 12345);
    expect(problemFromKey(p.key)?.q).toBe(p.q);
    expect(problemFromKey('nope/x/1/1')).toBeNull();
  });
});

import { levelInfo, levelNeed, starsFor, BADGES } from '../src/lib/reward';
describe('보상', () => {
  it('레벨 곡선', () => {
    expect(levelInfo(0).level).toBe(1);
    expect(levelInfo(99).level).toBe(1);
    expect(levelInfo(100).level).toBe(2);
    expect(levelInfo(100 + 150).level).toBe(3);
    expect(levelNeed(3)).toBe(200);
    expect(levelInfo(100000).title).toBe('수학 전설');
  });
  it('별', () => {
    expect([null, 0, 49, 50, 79, 80, 94, 95, 100].map(starsFor)).toEqual([0, 0, 0, 1, 1, 2, 2, 3, 3]);
  });
  it('배지 id 유일', () => {
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
  });
});

import { hintSteps } from '../src/lib/hints';
import { texToSpeech } from '../src/ui/Speak';
import { answerText as at2 } from '../src/core/check';
describe('힌트·읽어 주기', () => {
  it('3단계 힌트는 정답 줄(마지막 풀이)을 보여 주지 않음', () => {
    for (const [u, s] of [['m1a-1', 'gcd-lcm'], ['e3a-3', 'div-fact'], ['cal1-6', 'definite']] as const) {
      for (let seed = 1; seed < 20; seed++) {
        const p = makeProblem(u, CONTENT[u].skills.find((x) => x.id === s)?.id ?? CONTENT[u].skills[0].id, 2, seed);
        const hs = hintSteps(p);
        expect(hs.length).toBeGreaterThanOrEqual(1);
        expect(hs.length).toBeLessThanOrEqual(3);
        if (p.steps.length > 1) expect(hs.join('\n')).not.toContain(p.steps[p.steps.length - 1]);
        void at2;
      }
    }
  });
  it('수식 읽기', () => {
    expect(texToSpeech('45+17=\\square')).toBe('45 더하기 17 는 네모');
    expect(texToSpeech('2\\frac{1}{3}')).toBe('2와 3분의 1');
    expect(texToSpeech('-5-(-3)')).toBe('마이너스 5 빼기 ( 마이너스 3)');
  });
});

import { certifyUnits, rewardAnswer, rwOf, unitStars } from '../src/lib/reward';
import { getState } from '../src/lib/store';
describe('인증·쌍둥이 (메모리 저장소)', () => {
  it('진단 인증 → 별 1개', () => {
    const done = certifyUnits(['e1a-1', 'e1a-3']);
    expect(done.sort()).toEqual(['e1a-1', 'e1a-3']);
    const d = getState().data;
    expect(unitStars(d, 'e1a-1')).toBe(1);
    expect(Object.keys(rwOf(d).certified ?? {})).toContain('e1a-3');
    expect(rwOf(d).badges.certified).toBeTruthy();
  });
  it('쌍둥이 정답 → 극복 +30', () => {
    const before = rwOf(getState().data);
    const p = makeProblem('m1a-1', 'factorize', 1, 5);
    const x = rewardAnswer(p, true, { combo: 1, review: false, newUnit: false, twin: true });
    const after = rwOf(getState().data);
    expect(after.overcome).toBe((before.overcome ?? 0) + 1);
    expect(x).toBeGreaterThanOrEqual(40);
    expect(after.badges.clinic1).toBeTruthy();
  });
  it('힌트 쓰면 정답 XP 감소', () => {
    const p = makeProblem('m1a-1', 'factorize', 3, 6);
    const a = rewardAnswer(p, true, { combo: 0, review: false, newUnit: false, hints: 0 });
    const b = rewardAnswer(p, true, { combo: 0, review: false, newUnit: false, hints: 3 });
    expect(b).toBeLessThan(a);
  });
});

import { ITEMS, isUnlocked, itemsAtLevel } from '../src/lib/closet';
import { BADGE_BY_ID } from '../src/lib/reward';
describe('꾸미기', () => {
  it('아이템 id 는 칸마다 유일하고, 배지 조건은 실제 배지', () => {
    const keys = ITEMS.map((i) => `${i.slot}/${i.id}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const i of ITEMS) if (i.badge) expect(BADGE_BY_ID[i.badge], i.id).toBeTruthy();
  });
  it('레벨 해금', () => {
    const d = { skills: {}, days: {}, wrong: {}, exams: [], rw: { xp: 0, freezes: 0, frozen: {}, badges: {}, goal: 20, goalDays: {}, questDays: {}, maxCombo: 0, hardCorrect: 0, stars: {}, streakRewarded: 0 } };
    const crown = ITEMS.find((i) => i.id === 'crown')!;
    expect(isUnlocked(crown, d)).toBe(false);
    expect(isUnlocked(ITEMS.find((i) => i.id === 'pencil')!, d)).toBe(true);
    expect(itemsAtLevel(10).map((i) => i.id)).toContain('crown');
  });
});

import { wear, outfitOf } from '../src/lib/closet';
describe('꾸미기 입기', () => {
  it('입은 아이템이 저장됨', () => {
    wear('hat', 'ribbon');
    wear('color', 'sky');
    expect(outfitOf(getState().data)).toMatchObject({ hat: 'ribbon', color: 'sky' });
  });
});

import { buildDaily } from '../src/lib/daily';
describe('오늘의 학습 묶음', () => {
  const base = { skills: {}, days: {}, wrong: {}, exams: [] } as import('../src/lib/store').ProfileData;
  it('처음이면 하루 목표만큼 추천 단원 새 문제', () => {
    const p = buildDaily(base, '2026-10-19');
    expect(p.items.length).toBe(20);
    expect(p.items.every((x) => x.kind === 'new')).toBe(true);
  });
  it('오답 복습이 앞에, 약한 유형이 섞여 총 목표 수', () => {
    const now = Date.now();
    const d = {
      ...base,
      skills: { ['e1a-2/' + CONTENT['e1a-2'].skills[0].id]: { score: 30, n: 5, c: 2, last: now - 864e5 } },
      wrong: Object.fromEntries(
        [1, 2, 3].map((i) => {
          const key = `e1a-3/${CONTENT['e1a-3'].skills[0].id}/1/${i}`;
          return [key, { key, unitId: 'e1a-3', skillId: CONTENT['e1a-3'].skills[0].id, box: 0, due: now - 1000, added: now, lastWrong: now, wrongCount: 1 }];
        }),
      ),
      rw: { xp: 0, freezes: 0, frozen: {}, badges: {}, goal: 10, goalDays: {}, questDays: {}, maxCombo: 0, hardCorrect: 0, stars: {}, streakRewarded: 0 },
    } as import('../src/lib/store').ProfileData;
    const p = buildDaily(d, '2026-10-19');
    expect(p.items.length).toBe(10);
    expect(p.items.slice(0, 3).every((x) => x.kind === 'review')).toBe(true);
    expect(p.items.some((x) => x.kind === 'weak')).toBe(true);
    expect(p.items.some((x) => x.kind === 'new')).toBe(true);
  });
});

import { checkPin, checkRecovery, hasPin, isUnlocked as pinOpen, lockNow, removePin, setPin, makeRec, matches } from '../src/lib/pin';
describe('부모 PIN', () => {
  it('소금 해시: 같은 PIN 도 해시가 다르고, 맞는 PIN 만 통과', async () => {
    const a = await makeRec('1234');
    const b = await makeRec('1234');
    expect(a.hash).not.toBe(b.hash);
    expect(a.hash).not.toContain('1234');
    expect(await matches(a, '1234')).toBe(true);
    expect(await matches(a, '1235')).toBe(false);
  });
  it('설정·잠금·풀기·복구', async () => {
    removePin();
    expect(pinOpen()).toBe(true);
    await setPin('2580', { q: '병원?', a: '서울 대학 병원' });
    expect(hasPin()).toBe(true);
    lockNow();
    expect(pinOpen()).toBe(false);
    expect(await checkPin('0000')).toBe(false);
    expect(pinOpen()).toBe(false);
    expect(await checkPin('2580')).toBe(true);
    expect(pinOpen()).toBe(true);
    expect(await checkRecovery('서울대학병원')).toBe(true);
    expect(await checkRecovery('부산')).toBe(false);
    removePin();
    expect(hasPin()).toBe(false);
  });
});

import { todayDaily, saveDaily } from '../src/lib/daily';
import { activeProfile, updateProfile } from '../src/lib/store';
import { UNIT_BY_ID as UB } from '../src/core/curriculum';
describe('오늘의 학습 — 학년 바꾸기', () => {
  it('시작 전이면 새 학년 문제로, 푼 문제는 그대로 두고 남은 것만 새 학년으로', () => {
    const mem: Record<string, string> = {};
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: (k: string) => mem[k] ?? null,
      setItem: (k: string, v: string) => void (mem[k] = v),
      removeItem: (k: string) => void delete mem[k],
      key: (i: number) => Object.keys(mem)[i] ?? null,
      get length() { return Object.keys(mem).length; },
    };
    const id = activeProfile().id;
    updateProfile(id, { course: 'e2a' });
    saveDaily(null as never);
    const a = todayDaily()!;
    expect(a.course).toBe('e2a');
    updateProfile(id, { course: 'm1a' });
    const b = todayDaily()!;
    expect(b.course).toBe('m1a');
    const news = b.items.filter((x) => x.kind === 'new');
    expect(news.length).toBeGreaterThan(0);
    expect(news.every((x) => UB[x.unitId].course === 'm1a' || UB[x.unitId].course.startsWith('e'))).toBe(true);
    expect(news.some((x) => UB[x.unitId].course === 'm1a')).toBe(true);
    // 3문제 풀고 학년 바꾸기
    saveDaily({ ...b, idx: 3 });
    updateProfile(id, { course: 'h1a' in UB ? 'h1a' : 'm2a' });
    const c = todayDaily()!;
    expect(c.items.slice(0, 3)).toEqual(b.items.slice(0, 3));
    expect(c.items.length).toBe(b.items.length);
    expect(c.idx).toBe(3);
    expect(c.course).toBe(activeProfile().course);
  });
});
