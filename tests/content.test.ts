// 모든 문제 생성기 전수 검사.  특정 파일만: GROUP=e12 npx vitest run tests/content.test.ts
import { describe, expect, it } from 'vitest';
import katex from 'katex';
import { CONTENT, GROUPS } from '../src/content';
import { UNITS } from '../src/core/curriculum';
import { Rng, hashStr } from '../src/core/rng';
import { splitMath } from '../src/core/mathtext';
import type { Level, ProblemDraft } from '../src/core/types';
import { polish } from '../src/core/polish';
import { toChoice } from '../src/core/tochoice';
import type { Problem } from '../src/core/types';

const SEEDS = Number(process.env.SEEDS ?? 60);
const only = process.env.GROUP;
const STRICT = process.env.STRICT !== '0'; // 단원 콘텐츠 누락도 실패로

const BAD = /NaN|undefined|Infinity|\[object|null(?![a-z])/;

function texOk(text: string, where: string) {
  for (const seg of splitMath(text)) {
    if (seg.t === 'text') {
      if (seg.s.includes('\\frac') || seg.s.includes('^{')) throw new Error(`${where}: $ 밖에 TeX 명령이 있음 → "${text}"`);
      continue;
    }
    try {
      katex.renderToString(seg.s, { throwOnError: true, displayMode: seg.t === 'display', strict: 'ignore' });
    } catch (e) {
      throw new Error(`${where}: KaTeX 오류 "${seg.s}" — ${(e as Error).message}`);
    }
  }
  if (BAD.test(text)) throw new Error(`${where}: 이상한 값 → "${text}"`);
}

function validate(d: ProblemDraft, where: string) {
  expect(typeof d.q, where).toBe('string');
  expect(d.q.trim().length, where + ' q 비어 있음').toBeGreaterThan(0);
  texOk(d.q, where + ' q');
  expect(Array.isArray(d.steps) && d.steps.length > 0, where + ' steps 없음').toBe(true);
  d.steps.forEach((s, i) => texOk(s, `${where} steps[${i}]`));
  if (d.hint) texOk(d.hint, where + ' hint');
  if (d.fig) {
    expect(d.fig.startsWith('<svg'), where + ' fig').toBe(true);
    if (/NaN|undefined|Infinity/.test(d.fig)) throw new Error(`${where}: fig 에 NaN/undefined`);
  }
  if (d.table) {
    expect(d.table.length >= 2, where + ' table 행').toBe(true);
    d.table.flat().forEach((c) => texOk(String(c), where + ' table'));
  }
  const a = d.answer;
  switch (a.type) {
    case 'num':
      expect(Number.isFinite(a.value), where + ' 정답 값').toBe(true);
      break;
    case 'fields':
      expect(a.fields.length, where).toBeGreaterThan(0);
      a.fields.forEach((f) => {
        expect(Number.isFinite(f.value), where + ' fields 값').toBe(true);
        expect(f.label.length > 0, where + ' label').toBe(true);
      });
      break;
    case 'set':
      expect(a.values.length, where).toBeGreaterThan(0);
      a.values.forEach((v) => expect(Number.isFinite(v), where + ' set 값').toBe(true));
      break;
    case 'choice': {
      expect(a.choices.length >= 2 && a.choices.length <= 6, where + ` 보기 수 ${a.choices.length}`).toBe(true);
      expect(new Set(a.choices).size, where + ' 보기 중복: ' + a.choices.join(' | ')).toBe(a.choices.length);
      expect(a.index >= 0 && a.index < a.choices.length, where + ' index').toBe(true);
      a.choices.forEach((c, i) => {
        expect(String(c).trim().length > 0, where + ' 빈 보기').toBe(true);
        texOk(c, `${where} choice[${i}]`);
      });
      break;
    }
    default:
      throw new Error(where + ' 알 수 없는 answer.type');
  }
}

for (const [group, courses] of Object.entries(GROUPS)) {
  if (only && only !== group) continue;
  describe(group, () => {
    const units = UNITS.filter((u) => courses.includes(u.course));
    for (const u of units) {
      it(`${u.id} ${u.title}`, () => {
        const c = CONTENT[u.id];
        if (!c) {
          if (STRICT) throw new Error(`${u.id} 콘텐츠 없음`);
          return;
        }
        expect(c.concepts.length, `${u.id} 개념 카드 2개 이상`).toBeGreaterThanOrEqual(2);
        c.concepts.forEach((k, i) => {
          texOk(k.title, `${u.id} concept[${i}].title`);
          texOk(k.body, `${u.id} concept[${i}].body`);
          if (k.example) {
            texOk(k.example.q, `${u.id} concept[${i}].example.q`);
            texOk(k.example.a, `${u.id} concept[${i}].example.a`);
          }
        });
        expect(c.skills.length, `${u.id} 유형 3개 이상`).toBeGreaterThanOrEqual(3);
        const ids = c.skills.map((s) => s.id);
        expect(new Set(ids).size, `${u.id} skill id 중복`).toBe(ids.length);
        for (const sk of c.skills) {
          expect(/^[a-z0-9-]+$/.test(sk.id), `${u.id} skill id 형식 ${sk.id}`).toBe(true);
          for (const level of [1, 2, 3] as Level[]) {
            const qs = new Set<string>();
            for (let seed = 1; seed <= SEEDS; seed++) {
              const where = `${u.id}/${sk.id} L${level} seed${seed}`;
              const mk = () => polish(sk.gen(new Rng(seed ^ hashStr(`${u.id}/${sk.id}`)), level), u.id);
              let d: ProblemDraft;
              try {
                d = mk();
              } catch (e) {
                throw new Error(`${where}: 생성 중 예외 ${(e as Error).stack}`);
              }
              validate(d, where);
              if (d.answer.type !== 'choice') {
                const c = toChoice({ ...d, key: `${u.id}/${sk.id}/${level}/${seed}`, unitId: u.id, skillId: sk.id, level, seed } as Problem);
                validate(c, where + ' (객관식 변환)');
                if (c.answer.type === 'choice') {
                  expect(c.answer.choices.length, where + ' 객관식 보기 수').toBeGreaterThanOrEqual(4);
                  if (u.id.startsWith('e') && !JSON.stringify(d.answer).includes('-')) {
                    expect(c.answer.choices.some((x) => /\$-/.test(x)), where + ' 초등 음수 보기: ' + c.answer.choices.join(' | ')).toBe(false);
                  }
                }
              }
              expect(JSON.stringify(mk()), where + ' 같은 시드인데 다른 문제 (Math.random 사용?)').toBe(JSON.stringify(d));
              qs.add(d.q + JSON.stringify(d.answer) + (d.fig ?? '') + JSON.stringify(d.table ?? ''));
            }
            expect(qs.size, `${u.id}/${sk.id} L${level}: ${SEEDS}개 시드에서 서로 다른 문제가 ${qs.size}개뿐`).toBeGreaterThanOrEqual(Math.min(4, SEEDS));
          }
        }
      });
    }
  });
}
