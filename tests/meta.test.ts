// 유형 분류·흔한 실수 검사.  특정 그룹만: GROUP=e12 npx vitest run tests/meta.test.ts
import { describe, expect, it } from 'vitest';
import katex from 'katex';
import { CONTENT, GROUPS } from '../src/content';
import { META_ALL } from '../src/content/meta';
import { UNITS } from '../src/core/curriculum';
import { splitMath } from '../src/core/mathtext';

const only = process.env.GROUP;

function texOk(text: string, where: string) {
  for (const seg of splitMath(text)) {
    if (seg.t === 'text') {
      if (/\\frac|\^\{|\\times/.test(seg.s)) throw new Error(`${where}: $ 밖에 TeX → "${text}"`);
      continue;
    }
    try {
      katex.renderToString(seg.s, { throwOnError: true, strict: 'ignore' });
    } catch (e) {
      throw new Error(`${where}: KaTeX 오류 "${seg.s}" — ${(e as Error).message}`);
    }
  }
}

for (const [group, courses] of Object.entries(GROUPS)) {
  if (only && only !== group) continue;
  describe(group, () => {
    for (const u of UNITS.filter((x) => courses.includes(x.course))) {
      it(`${u.id} ${u.title}`, () => {
        const m = META_ALL[u.id];
        expect(m, `${u.id} 메타 없음`).toBeTruthy();
        expect(m.pitfalls.length >= 2 && m.pitfalls.length <= 3, `${u.id} 흔한 실수 2~3개`).toBe(true);
        m.pitfalls.forEach((t, i) => {
          texOk(t, `${u.id} pitfalls[${i}]`);
          expect(t.length, `${u.id} pitfalls[${i}] 길이`).toBeLessThanOrEqual(160);
        });
        const ids = CONTENT[u.id].skills.map((s) => s.id);
        expect(Object.keys(m.cats).sort(), `${u.id} cats 는 모든 유형을 정확히 덮어야 함`).toEqual([...ids].sort());
        for (const v of Object.values(m.cats)) expect(['calc', 'concept', 'word']).toContain(v);
      });
    }
  });
}
