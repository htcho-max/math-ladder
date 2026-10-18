// 주관식(num / set / fields) 문제를 5지선다 객관식으로 바꾸기.
// 오답 보기는 학생이 흔히 하는 실수 모양(±1, 자릿값 10배, 부호, 역수, 분자·분모 하나 틀림)으로 만든다.
import type { AnswerSpec, Problem } from './types';
import { Rng, hashStr } from './rng';
import { F, approxFrac } from './frac';
import { round } from './nt';
import { makeChoices, numTex } from './tex';
import { autoDisplay } from './check';

type Disp = 'int' | 'dec' | 'frac' | 'mixed' | undefined;

/** 그럴듯한 오답 수 후보 */
export function numWrongs(v: number, r: Rng, allowNeg: boolean, fracMode = false, max = Infinity): number[] {
  const out: number[] = [];
  const x = round(v);
  if (Number.isInteger(x)) {
    const big = Math.abs(x) >= 20;
    out.push(x + 1, x - 1, x + 2, x - 2);
    if (big) out.push(x + 10, x - 10, x + 3);
    else out.push(x + 3, x * 2);
    if (x !== 0) out.push(-x);
  } else {
    const fr = approxFrac(x, 1000);
    const places = (String(x).split('.')[1] ?? '').length;
    if (!fracMode && places <= 3) {
      const u = 10 ** -places;
      out.push(round(x * 10), round(x / 10), round(x + u), round(x - u), round(x + 10 * u), round(x - 10 * u));
    }
    if (fr && (fracMode || places > 3)) {
      const [n, d] = fr;
      const f = new F(n, d);
      if (n !== 0) out.push(f.inv().value);
      out.push(new F(n + 1, d).value, new F(n - 1, d).value, new F(n, d + 1).value);
      if (d > 2) out.push(new F(n, d - 1).value);
      out.push(f.add(1).value, f.sub(1).value, f.mul(2).value);
    }
    out.push(-x);
  }
  return r
    .shuffle(out)
    .map((w) => round(w))
    .filter((w) => Number.isFinite(w) && w !== x && (allowNeg || w >= 0) && w <= max);
}

function texOf(v: number, d: Disp, unitId: string): string {
  return numTex(v, d ?? autoDisplay(v, unitId));
}

function fallbackFill(v: number, allowNeg: boolean) {
  return (i: number) => {
    const k = i + 4;
    const w = i % 2 === 0 || !allowNeg ? v + k : v - k;
    return round(w);
  };
}

/** 문제를 객관식으로. 이미 객관식이거나 바꿀 수 없으면 그대로 */
export function toChoice(p: Problem): Problem {
  const a = p.answer;
  if (a.type === 'choice') return p;
  const r = new Rng(p.seed ^ hashStr('choice:' + p.key));
  const elem = p.unitId.startsWith('e');
  let answer: AnswerSpec | null = null;

  if (a.type === 'num') {
    const prob = /확률/.test(p.q) && a.value >= 0 && a.value <= 1;
    // 양수가 당연한 양(개수·길이·확률 등)에는 음수 보기를 만들지 않음
    const allowNeg = a.value < 0 || (!elem && !a.unit && !prob && !/몇|개수|넓이|길이|부피|거리|둘레|시간|나이/.test(p.q));
    const d = a.display as Disp;
    const fracMode = d === 'frac' || d === 'mixed' || (!d && autoDisplay(a.value, p.unitId) === 'frac');
    const unit = a.unit ? ` ${a.unit}` : '';
    const t = (v: number) => `$${texOf(v, d, p.unitId)}$${unit}`;
    const fill = fallbackFill(a.value, allowNeg);
    answer = makeChoices(r, t(a.value), numWrongs(a.value, r, allowNeg, fracMode, prob ? 1 : Infinity).map(t), 5, (i) => t(fill(i)));
  } else if (a.type === 'set') {
    const vals = [...new Set(a.values.map((v) => round(v)))].sort((x, y) => x - y);
    const t = (vs: number[]) => `$${[...vs].sort((x, y) => x - y).map((v) => texOf(v, undefined, p.unitId)).join(',\\ ')}$`;
    const wrongs: string[] = [t(vals.map((v) => -v))];
    vals.forEach((v, i) => {
      for (const w of numWrongs(v, r, true).slice(0, 3)) {
        const c = vals.slice();
        c[i] = w;
        if (new Set(c).size === c.length) wrongs.push(t(c));
      }
    });
    if (vals.length > 1) vals.forEach((v) => wrongs.push(t([v])));
    answer = makeChoices(r, t(vals), wrongs, 5, (i) => t(vals.map((v) => v + i + 3)));
  } else if (a.type === 'fields') {
    const allowNeg = !elem || a.fields.some((f) => f.value < 0);
    const t = (vs: number[]) =>
      a.fields
        .map((f, i) => {
          const v = texOf(vs[i], f.display as Disp, p.unitId);
          // 라벨이 문자 하나(x, a …)면 $x=-8$ 꼴로
          if (/^\$?[a-zA-Z]\$?$/.test(f.label.trim())) return `$${f.label.replace(/\$/g, '').trim()}=${v}$`;
          return `${f.label} $${v}$${f.unit ? ' ' + f.unit : ''}`;
        })
        .join(', ');
    const base = a.fields.map((f) => round(f.value));
    const wrongs: string[] = [];
    if (base.length === 2 && base[0] !== base[1]) wrongs.push(t([base[1], base[0]]));
    base.forEach((v, i) => {
      for (const w of numWrongs(v, r, allowNeg).slice(0, 3)) {
        const c = base.slice();
        c[i] = w;
        wrongs.push(t(c));
      }
    });
    answer = makeChoices(r, t(base), wrongs, 5, (i) => t(base.map((v) => v + i + 2)));
  }
  if (!answer || answer.choices.length < 4) return p;
  return { ...p, answer, key: p.key.endsWith('/c') ? p.key : p.key + '/c' };
}
