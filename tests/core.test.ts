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
