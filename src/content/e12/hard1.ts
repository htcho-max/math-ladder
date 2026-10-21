// 초1 심화 유형(skills 끝에 덧붙임)과 최상위 유형(top) — e1a.ts / e1b.ts 에서 합침
import type { ProblemDraft, Skill } from '../../core/types';
import { makeChoices } from '../../core/tex';
import { Svg } from '../../core/fig';
import { J, N, jo, names, textChoices, lv, THINGS } from './util';
import { ORDS } from './words1';

export interface HardSet {
  skills: Skill[];
  top: Skill[];
}

/** 조건을 만족할 때까지 다시 뽑기 (시드 고정이라 결정적) */
export function until<T>(gen: () => T, ok: (v: T) => boolean, tries = 800): T {
  let v = gen();
  for (let i = 0; i < tries && !ok(v); i++) v = gen();
  return v;
}

/** 수 목록을 $a$, $b$, … 로 (너무 길면 줄여서) */
export function numList(xs: number[], max = 10): string {
  if (xs.length <= max) return xs.map((x) => `$${x}$`).join(', ');
  return `$${xs[0]}$, $${xs[1]}$, $${xs[2]}$, …, $${xs[xs.length - 1]}$ ($${xs.length}$개)`;
}

/** 수 카드 목록 '$1$, $3$, $5$' */
export const cardList = (cs: number[]) => cs.map((c) => `$${c}$`).join(', ');

export function range(a: number, b: number): number[] {
  const out: number[] = [];
  for (let i = a; i <= b; i++) out.push(i);
  return out;
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

// ───────────────────────── e1a-1 9까지의 수
const e1a1: HardSet = {
  skills: [
    {
      id: 'card-order',
      title: '수 카드를 순서대로 늘어놓기',
      gen(r, level): ProblemDraft {
        const n = lv(level, 3, 5, 6);
        const cards = r.sample(range(1, 9), n);
        const big = level === 1 ? r.chance(0.5) : r.chance(0.5);
        const sorted = [...cards].sort((a, b) => (big ? b - a : a - b));
        const k = level === 1 ? 2 : r.int(2, n - 1);
        const v = sorted[k - 1];
        const head = `수 카드 ${cardList(cards)}${jo(cards[n - 1], '이')} 있어요. 이 카드를 ${big ? '큰' : '작은'} 수부터 차례로 늘어놓으려고 해요.`;
        const order = `${big ? '큰' : '작은'} 수부터: ${cardList(sorted)}`;
        if (level < 3) {
          return {
            q: `${head} ${ORDS[k]}에 놓이는 카드의 수는 무엇인가요?`,
            answer: { type: 'num', value: v },
            steps: [order, `${ORDS[k]}에 놓이는 수는 $${v}$`],
          };
        }
        const up = v === 9 ? false : v === 1 ? true : r.chance(0.5);
        const ans = up ? v + 1 : v - 1;
        return {
          q: `${head} ${ORDS[k]}에 놓이는 카드의 수보다 $1$만큼 더 ${up ? '큰' : '작은'} 수는 무엇인가요?`,
          answer: { type: 'num', value: ans },
          steps: [order, `${ORDS[k]}에 놓이는 수는 $${v}$`, `$${v}$보다 $1$만큼 더 ${up ? '큰' : '작은'} 수는 $${ans}$`],
          hint: '먼저 카드를 차례로 늘어놓아 보세요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'top-line-both',
      title: '앞뒤에서 몇째인지로 줄 선 사람 수 구하기',
      gen(r): ProblemDraft {
        const [p1, p2] = names(r, 2);
        const kind = r.int(0, 2);
        if (kind === 0) {
          const [a, b, c] = until(
            () => [r.int(2, 4), r.int(2, 4), r.int(1, 3)],
            ([a, b, c]) => a + b + c <= 9,
          );
          const tot = a + b + c;
          const pic = `${'○ '.repeat(a - 1)}① ${'○ '.repeat(c)}② ${'○ '.repeat(b - 1)}`.trim();
          return {
            q: `친구들이 한 줄로 서 있어요. ${J(p1, '는')} 앞에서 ${ORDS[a]}, ${J(p2, '는')} 뒤에서 ${ORDS[b]}에 서 있고, ${J(p1, '와')} ${p2} 사이에는 $${c}$명이 서 있어요. ${J(p1, '가')} ${p2}보다 앞에 있다면 줄을 선 사람은 모두 몇 명인가요?`,
            answer: { type: 'num', value: tot, unit: '명' },
            steps: [
              `${J(p1, '을')} ①, ${J(p2, '를')} ②로 놓고 앞에서부터 ○로 그려 보아요.`,
              `${p1} 앞에는 $${a - 1}$명이 있어요.`,
              `${J(p1, '와')} ${p2} 사이에 $${c}$명, ${p2} 뒤에는 $${b - 1}$명이 있어요.`,
              `앞에서부터: ${pic}`,
              `하나씩 세면 모두 $${tot}$명이에요.`,
            ],
            hint: '사람을 ○로 그려서 세어 보세요.',
          };
        }
        if (kind === 1) {
          const [a, b, tot] = until(
            () => [r.int(2, 4), r.int(2, 4), r.int(7, 9)],
            ([a, b, t]) => t - a - b >= 1,
          );
          const c = tot - a - b;
          const pic = `${'○ '.repeat(a - 1)}① ${'○ '.repeat(c)}② ${'○ '.repeat(b - 1)}`.trim();
          return {
            q: `$${tot}$명이 한 줄로 서 있어요. ${J(p1, '는')} 앞에서 ${ORDS[a]}, ${J(p2, '는')} 뒤에서 ${ORDS[b]}에 서 있어요. ${J(p1, '와')} ${p2} 사이에 서 있는 사람은 몇 명인가요?`,
            answer: { type: 'num', value: c, unit: '명' },
            steps: [`○ $${tot}$개를 한 줄로 그려요.`, `앞에서 ${ORDS[a]} ○가 ${p1}(①)예요.`, `뒤에서 ${ORDS[b]} ○가 ${p2}(②)예요.`, `앞에서부터: ${pic}`, `①과 ② 사이의 ○는 $${c}$개 → $${c}$명`],
            hint: '전체 사람 수만큼 ○를 그려 보세요.',
          };
        }
        const [a, b, c] = until(
          () => [r.int(2, 5), r.int(2, 4), r.int(2, 5)],
          ([a, b, c]) => {
            const tot = a + b;
            const pos2 = tot - c + 1;
            return tot <= 9 && pos2 - a - 1 >= 1;
          },
        );
        const tot = a + b;
        const pos2 = tot - c + 1;
        const between = pos2 - a - 1;
        const pic = `${'○ '.repeat(a - 1)}① ${'○ '.repeat(between)}② ${'○ '.repeat(c - 1)}`.trim();
        return {
          q: `친구들이 한 줄로 서 있어요. ${J(p1, '는')} 앞에서 ${ORDS[a]}에 서 있고, ${p1} 뒤에는 $${b}$명이 서 있어요. ${J(p2, '는')} 뒤에서 ${ORDS[c]}에 서 있어요. ${J(p1, '와')} ${p2} 사이에 서 있는 사람은 몇 명인가요?`,
          answer: { type: 'num', value: between, unit: '명' },
          steps: [
            `${p1} 앞에 $${a - 1}$명, ${p1}, ${p1} 뒤에 $${b}$명 → 모두 $${tot}$명이에요.`,
            `○ $${tot}$개를 그리고 앞에서 ${ORDS[a]}를 ①(${p1})로 표시해요.`,
            `뒤에서 ${ORDS[c]}를 ②(${p2})로 표시해요.`,
            `앞에서부터: ${pic}`,
            `①과 ② 사이의 ○는 $${between}$개 → $${between}$명`,
          ],
          hint: '먼저 줄을 선 사람이 모두 몇 명인지 구해 보세요.',
        };
      },
    },
    {
      id: 'top-clue-digit',
      title: '조건을 모두 만족하는 수 찾기',
      gen(r): ProblemDraft {
        // 아래쪽 경계 L, 위쪽 경계 U 사이 수 중 target 하나만 남도록 '아니에요' 단서를 붙임
        const [L, U, t] = until(
          () => {
            const L = r.int(0, 6);
            const U = L + r.int(3, 4);
            return [L, U, r.int(L + 1, U - 1)];
          },
          ([, U]) => U <= 9,
        );
        const clues: { text: string; ok: (v: number) => boolean }[] = [];
        if (L >= 1 && r.chance(0.5))
          clues.push({
            text: `$${L - 1}$보다 $1$만큼 더 큰 수보다 커요.`,
            ok: (v) => v > L,
          });
        else clues.push({ text: `$${L}$보다 커요.`, ok: (v) => v > L });
        if (U <= 8 && r.chance(0.5))
          clues.push({
            text: `$${U + 1}$보다 $1$만큼 더 작은 수보다 작아요.`,
            ok: (v) => v < U,
          });
        else clues.push({ text: `$${U}$보다 작아요.`, ok: (v) => v < U });
        for (let x = L + 1; x < U; x++) if (x !== t) clues.push({ text: `${N(x, '이')} 아니에요.`, ok: (v) => v !== x });
        const shown = r.shuffle(clues);
        const steps: string[] = [];
        let cand = range(0, 9);
        for (const c of shown) {
          cand = cand.filter(c.ok);
          steps.push(`'${c.text.replace(/\.$/, '')}' → 남는 수: ${numList(cand)}`);
        }
        steps.push(`모든 조건을 만족하는 수는 $${t}$`);
        return {
          q: `$0$부터 $9$까지의 수 중에서 다음을 모두 만족하는 수는 무엇인가요?\n${shown.map((c) => `- ${c.text}`).join('\n')}`,
          answer: { type: 'num', value: t },
          steps: [`$0$부터 $9$까지의 수에서 조건에 맞지 않는 수를 하나씩 지워요.`, ...steps],
          hint: '조건 하나씩 차례로 맞지 않는 수를 지워 보세요.',
        };
      },
    },
  ],
};

// ───────────────────────── e1a-2 여러 가지 모양
const SOL = ['상자 모양', '둥근기둥 모양', '공 모양'];
const e1a2: HardSet = {
  skills: [
    {
      id: 'left-shapes',
      title: '쓰고 남은 모양 알아보기',
      gen(r, level): ProblemDraft {
        const [p] = names(r, 1);
        const what = r.pick(['로봇', '기차', '성', '자동차']);
        if (level === 1) {
          const k = r.int(0, 2);
          const a = r.int(4, 9);
          const x = r.int(1, a - 1);
          return {
            q: `${J(p, '는')} ${SOL[k]} $${a}$개를 가지고 있었어요. 그중 $${x}$개를 사용해서 ${J(what, '을')} 만들었어요. 남은 ${SOL[k]}은 몇 개인가요?`,
            answer: { type: 'num', value: a - x, unit: '개' },
            steps: [`가지고 있던 $${a}$개에서 사용한 $${x}$개를 빼요.`, `$${a}-${x}=${a - x}$ → $${a - x}$개`],
          };
        }
        if (level === 2) {
          const ks = r.sample([0, 1, 2], 2).sort();
          const [a, b, x, y] = until(
            () => [r.int(3, 7), r.int(3, 7), r.int(1, 5), r.int(1, 5)],
            ([a, b, x, y]) => x < a && y < b && a - x + b - y <= 9,
          );
          const ra = a - x;
          const rb = b - y;
          return {
            q: `${J(p, '는')} ${SOL[ks[0]]} $${a}$개와 ${SOL[ks[1]]} $${b}$개를 가지고 있었어요. ${J(what, '을')} 만드는 데 ${SOL[ks[0]]} $${x}$개와 ${SOL[ks[1]]} $${y}$개를 사용했어요. 남은 모양은 모두 몇 개인가요?`,
            answer: { type: 'num', value: ra + rb, unit: '개' },
            steps: [`남은 ${SOL[ks[0]]}: $${a}-${x}=${ra}$ (개)`, `남은 ${SOL[ks[1]]}: $${b}-${y}=${rb}$ (개)`, `모두 $${ra}+${rb}=${ra + rb}$ → $${ra + rb}$개`],
            hint: '모양마다 남은 개수를 먼저 구해요.',
          };
        }
        const [have, used] = until(
          () => {
            const h = [r.int(3, 7), r.int(3, 7), r.int(3, 7)];
            return [h, h.map((v) => r.int(1, v - 1))];
          },
          ([h, u]) => sum(h) - sum(u) <= 9 && h.every((v, i) => v - u[i] >= 1),
        );
        const left = have.map((v, i) => v - used[i]);
        const flat = r.chance(0.5); // 평평한 부분이 있는 모양(상자·둥근기둥) / 둥근 부분이 있는 모양(둥근기둥·공)
        const ids = flat ? [0, 1] : [1, 2];
        const ans = left[ids[0]] + left[ids[1]];
        return {
          q: `${J(p, '는')} 상자 모양 $${have[0]}$개, 둥근기둥 모양 $${have[1]}$개, 공 모양 $${have[2]}$개를 가지고 있었어요. ${J(what, '을')} 만드는 데 상자 모양 $${used[0]}$개, 둥근기둥 모양 $${used[1]}$개, 공 모양 $${used[2]}$개를 사용했어요. 남은 모양 중에서 ${flat ? '평평한' : '둥근'} 부분이 있는 모양은 모두 몇 개인가요?`,
          answer: { type: 'num', value: ans, unit: '개' },
          steps: [
            `남은 모양: 상자 모양 $${left[0]}$개, 둥근기둥 모양 $${left[1]}$개, 공 모양 $${left[2]}$개`,
            flat ? '평평한 부분이 있는 모양은 상자 모양과 둥근기둥 모양이에요.' : '둥근 부분이 있는 모양은 둥근기둥 모양과 공 모양이에요.',
            `$${left[ids[0]]}+${left[ids[1]]}=${ans}$ → $${ans}$개`,
          ],
          hint: '먼저 모양마다 몇 개가 남았는지 구해요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'top-shape-relation',
      title: '관계를 보고 모양의 개수 구하기',
      gen(r): ProblemDraft {
        const what = r.pick(['로봇', '기차', '성', '우주선']);
        const [p] = names(r, 1);
        // c[0] 상자, c[1] 둥근기둥, c[2] 공
        const ref = r.int(0, 2);
        const others = [0, 1, 2].filter((i) => i !== ref);
        const [base, d1, d2, s1, s2] = until(
          () => [r.int(1, 3), r.int(1, 3), r.int(1, 3), r.sign(), r.sign()],
          ([b, d1, d2, s1, s2]) => {
            const v1 = b + s1 * d1;
            const v2 = b + s2 * d2;
            return v1 >= 1 && v2 >= 1 && v1 !== v2 && b + v1 + v2 <= 9;
          },
        );
        const cnt = [0, 0, 0];
        cnt[ref] = base;
        cnt[others[0]] = base + s1 * d1;
        cnt[others[1]] = base + s2 * d2;
        const tot = sum(cnt);
        const ask = r.pick(others);
        const rel = (i: number, d: number, s: number) => `${SOL[i]}은 ${SOL[ref]}보다 $${d}$개 더 ${s > 0 ? '많고' : '적고'}`;
        const steps: string[] = [];
        for (let g = 1; g <= base; g++) {
          const a = g + s1 * d1;
          const b = g + s2 * d2;
          if (a < 1 || b < 1) {
            steps.push(`${SOL[ref]}이 $${g}$개라면 다른 모양이 $0$개 이하가 되어 안 돼요.`);
            continue;
          }
          const t = g + a + b;
          steps.push(`${SOL[ref]}이 $${g}$개라면 ${SOL[others[0]]} $${a}$개, ${SOL[others[1]]} $${b}$개 → 모두 $${t}$개 ${t === tot ? '(맞아요)' : '(아니에요)'}`);
        }
        return {
          q: `${J(p, '는')} 상자 모양, 둥근기둥 모양, 공 모양을 모두 $${tot}$개 사용하여 ${J(what, '을')} 만들었어요. ${rel(others[0], d1, s1)}, ${rel(others[1], d2, s2).replace(/고$/, '아요')}. ${p}가 사용한 ${SOL[ask]}은 몇 개인가요?`
            .replace('많아요', '많아요')
            .replace('적아요', '적어요'),
          answer: { type: 'num', value: cnt[ask], unit: '개' },
          steps: [`${SOL[ref]}의 수를 $1$개부터 차례로 정해 보며 모두 $${tot}$개가 되는지 확인해요.`, ...steps, `${SOL[ref]} $${base}$개일 때 맞으므로 ${SOL[ask]}은 $${cnt[ask]}$개예요.`],
          hint: `${SOL[ref]}이 $1$개, $2$개, … 일 때를 차례로 생각해 보세요.`,
        };
      },
    },
    {
      id: 'top-who-has',
      title: '단서로 누가 어떤 모양을 가졌는지 알아내기',
      gen(r): ProblemDraft {
        const ps = names(r, 3);
        const NOT: Record<number, string[]> = {
          2: ['평평한 부분이 있어요', '쌓을 수 있어요'],
          0: ['뾰족한 부분이 없어요', '둥근 부분이 있어요'],
        };
        const perms = [
          [0, 1, 2],
          [0, 2, 1],
          [1, 0, 2],
          [1, 2, 0],
          [2, 0, 1],
          [2, 1, 0],
        ];
        type C = { i: number; e: number; text: string };
        const [P, clues] = until(
          () => {
            const P = r.pick(perms);
            const pool: C[] = [];
            for (let i = 0; i < 3; i++)
              for (const e of [0, 2])
                if (P[i] !== e)
                  pool.push({
                    i,
                    e,
                    text: `${ps[i]}의 물건은 ${r.pick(NOT[e])}.`,
                  });
            return [P, r.sample(pool, 3)] as [number[], C[]];
          },
          ([, cs]) => perms.filter((q) => cs.every((c) => q[c.i] !== c.e)).length === 1,
        );
        // 풀이 설명: 사람별 가능한 모양을 줄여 나감
        const poss = [0, 1, 2].map(() => new Set([0, 1, 2]));
        const steps: string[] = [];
        for (const c of clues) {
          poss[c.i].delete(c.e);
          steps.push(`'${c.text.replace(/\.$/, '')}' → ${ps[c.i]}${jo(ps[c.i], '은')} ${SOL[c.e]}이 아니에요.`);
        }
        const fixed = new Set<number>();
        for (let round = 0; round < 4 && fixed.size < 3; round++) {
          for (let i = 0; i < 3; i++) {
            if (fixed.has(i)) continue;
            if (poss[i].size === 1) {
              const s = [...poss[i]][0];
              fixed.add(i);
              steps.push(`${ps[i]}${jo(ps[i], '은')} ${SOL[s]}일 수밖에 없어요.`);
              for (let j = 0; j < 3; j++) if (j !== i) poss[j].delete(s);
            }
          }
          for (let s = 0; s < 3; s++) {
            const who = [0, 1, 2].filter((i) => poss[i].has(s));
            if (who.length === 1 && !fixed.has(who[0])) {
              const i = who[0];
              poss[i] = new Set([s]);
              fixed.add(i);
              steps.push(`${SOL[s]}을 가질 수 있는 사람은 ${ps[i]}뿐이에요.`);
              for (let j = 0; j < 3; j++) if (j !== i) poss[j].delete(s);
            }
          }
        }
        const fmt = (q: number[]) => ps.map((nm, i) => `${nm}: ${SOL[q[i]]}`).join(', ');
        const correct = fmt(P);
        const wrongs = perms.filter((q) => q.join() !== P.join()).map(fmt);
        return {
          q: `${ps.join(', ')} 세 사람이 상자 모양, 둥근기둥 모양, 공 모양 물건을 하나씩 가지고 있어요. 세 사람의 물건은 모두 다른 모양이에요.\n${clues.map((c) => `- ${c.text}`).join('\n')}\n세 사람이 가진 물건의 모양을 바르게 짝 지은 것은 무엇인가요?`,
          answer: makeChoices(r, correct, wrongs, 4),
          steps: [...steps, `따라서 ${correct}`],
          hint: '한 사람씩 될 수 없는 모양을 지워 보세요.',
        };
      },
    },
  ],
};

// ───────────────────────── e1a-3 덧셈과 뺄셈
const e1a3: HardSet = {
  skills: [
    {
      id: 'card-sum-max',
      title: '수 카드로 가장 큰 합·가장 작은 차 만들기',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const cs = until(
            () => r.sample(range(1, 7), 3),
            (c) => {
              const s = [...c].sort((a, b) => b - a);
              return s[0] + s[1] <= 9;
            },
          );
          const s = [...cs].sort((a, b) => b - a);
          return {
            q: `수 카드 ${cardList(cs)} 중에서 두 장을 골라 덧셈식을 만들려고 해요. 합이 가장 클 때의 합은 얼마인가요?`,
            answer: { type: 'num', value: s[0] + s[1] },
            steps: [`합이 가장 크려면 가장 큰 수와 둘째로 큰 수를 더해요.`, `$${s[0]}+${s[1]}=${s[0] + s[1]}$`],
          };
        }
        if (level === 2) {
          const cs = r.sample(range(0, 9), 4);
          const s = [...cs].sort((a, b) => b - a);
          return {
            q: `수 카드 ${cardList(cs)} 중에서 두 장을 골라 큰 수에서 작은 수를 빼는 뺄셈식을 만들려고 해요. 차가 가장 클 때의 차는 얼마인가요?`,
            answer: { type: 'num', value: s[0] - s[3] },
            steps: [`차가 가장 크려면 가장 큰 수에서 가장 작은 수를 빼요.`, `가장 큰 수 $${s[0]}$, 가장 작은 수 $${s[3]}$`, `$${s[0]}-${s[3]}=${s[0] - s[3]}$`],
          };
        }
        const cs = until(
          () => r.sample(range(0, 8), 5),
          (c) => {
            const s = [...c].sort((a, b) => b - a);
            return s[0] + s[1] <= 9;
          },
        );
        const s = [...cs].sort((a, b) => b - a);
        let md = 99;
        let pair: [number, number] = [0, 0];
        for (let i = 0; i + 1 < s.length; i++)
          if (s[i] - s[i + 1] < md) {
            md = s[i] - s[i + 1];
            pair = [s[i], s[i + 1]];
          }
        return {
          q: `수 카드 ${cardList(cs)} 중에서 두 장을 골라 덧셈식과 뺄셈식을 만들려고 해요. 만들 수 있는 가장 큰 합과 가장 작은 차를 각각 구하세요. (뺄셈식은 큰 수에서 작은 수를 빼요.)`,
          answer: {
            type: 'fields',
            fields: [
              { label: '가장 큰 합', value: s[0] + s[1] },
              { label: '가장 작은 차', value: md },
            ],
          },
          steps: [`큰 수부터 늘어놓으면 ${cardList(s)}`, `가장 큰 합: 가장 큰 두 수 $${s[0]}+${s[1]}=${s[0] + s[1]}$`, `가장 작은 차: 크기가 가장 가까운 두 수 $${pair[0]}-${pair[1]}=${md}$`],
          hint: '차가 가장 작으려면 두 수의 크기가 가장 가까워야 해요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'top-shape-value',
      title: '같은 모양에 같은 수 넣기',
      gen(r): ProblemDraft {
        const [A, B, C] = r.shuffle(['▲', '■', '●']);
        const [a, b, c, op2, op3] = until(
          () => [r.int(1, 4), r.int(1, 9), r.int(0, 9), r.pick(['+', '-']), r.pick(['+', '-', 'r'])] as [number, number, number, string, string],
          ([a, b, c, o2, o3]) => {
            if (a === b || b === c || a === c) return false;
            const e2 = o2 === '+' ? a + b : b - a;
            const e3 = o3 === '+' ? b + c : o3 === '-' ? b - c : c - b;
            return e2 >= 0 && e2 <= 9 && e3 >= 0 && e3 <= 9 && (o2 === '+' || b > a);
          },
        );
        const e1 = 2 * a;
        const e2 = op2 === '+' ? a + b : b - a;
        const e3 = op3 === '+' ? b + c : op3 === '-' ? b - c : c - b;
        const l2 = op2 === '+' ? `${A} + ${B}` : `${B} − ${A}`;
        const l3 = op3 === '+' ? `${B} + ${C}` : op3 === '-' ? `${B} − ${C}` : `${C} − ${B}`;
        const s2 = op2 === '+' ? `$${a}+${b}=${e2}$` : `$${b}-${a}=${e2}$`;
        const s3 = op3 === '+' ? `$${b}+${c}=${e3}$` : op3 === '-' ? `$${b}-${c}=${e3}$` : `$${c}-${b}=${e3}$`;
        return {
          q: `같은 모양에는 같은 수가 들어가요. ${C}에 알맞은 수는 무엇인가요?\n${A} + ${A} = $${e1}$\n${l2} = $${e2}$\n${l3} = $${e3}$`,
          answer: { type: 'num', value: c },
          steps: [
            `첫째 식: 같은 수 두 개를 더해 $${e1}$이 되는 수를 찾아요.`,
            `$${a}+${a}=${e1}$ 이므로 ${A} $=${a}$`,
            `둘째 식에 ${A} $=${a}$를 넣으면 ${s2} → ${B} $=${b}$`,
            `셋째 식에 ${B} $=${b}$를 넣으면 ${s3} → ${C} $=${c}$`,
            `${C}에 알맞은 수는 $${c}$`,
          ],
          hint: '모양이 하나만 나오는 식부터 풀어 보세요.',
        };
      },
    },
    {
      id: 'top-equal-sums',
      title: '합이 같아지도록 수 카드 짝 짓기',
      gen(r): ProblemDraft {
        const six = r.chance(0.5);
        const [s, cs] = until(
          () => {
            const s = r.int(six ? 7 : 5, 9);
            const pairs = range(0, Math.floor((s - 1) / 2)).map((x) => [x, s - x]);
            const pick = r.sample(pairs, six ? 3 : 2);
            return [s, r.shuffle(pick.flat())] as [number, number[]];
          },
          ([, c]) => !c.includes(0) || r.chance(0.3),
        );
        const x = r.pick(cs);
        const sorted = [...cs].sort((a, b) => a - b);
        const pairs: string[] = [];
        for (let i = 0; i < sorted.length / 2; i++) pairs.push(`$${sorted[i]}+${sorted[sorted.length - 1 - i]}=${s}$`);
        return {
          q: `수 카드 ${cardList(cs)}${jo(cs[cs.length - 1], '이')} 있어요. 두 장씩 짝을 지어 짝 지은 두 수의 합이 모두 같게 하려고 해요. ${N(x, '와')} 짝이 되는 카드의 수는 무엇인가요?`,
          answer: { type: 'num', value: s - x },
          steps: [
            `작은 수부터 늘어놓으면 ${cardList(sorted)}`,
            `가장 작은 수는 가장 큰 수와 짝을 지어야 합이 같아질 수 있어요. (작은 수끼리 짝을 지으면 합이 너무 작아요.)`,
            `가장 작은 수와 가장 큰 수의 합: $${sorted[0]}+${sorted[sorted.length - 1]}=${s}$`,
            `나머지도 합이 $${s}$가 되게 짝 지어요: ${pairs.join(', ')}`,
            `${N(x, '와')} 짝이 되는 수는 $${s - x}$`,
          ],
          hint: '가장 작은 수는 어떤 수와 짝을 지어야 할까요?',
        };
      },
    },
  ],
};

// ───────────────────────── e1a-4 비교하기
const e1a4: HardSet = {
  skills: [
    {
      id: 'weigh-marbles',
      title: '구슬로 무게 비교하기',
      gen(r, level): ProblemDraft {
        const [x, y] = r.sample(['사과', '귤', '배', '감', '복숭아', '참외'], 2);
        if (level < 3) {
          const [a, b] = until(
            () => [r.int(2, 9), r.int(2, 9)],
            ([a, b]) => a !== b,
          );
          const lead = `양팔 저울로 무게를 재었어요. ${x} $1$개는 똑같은 구슬 $${a}$개와 무게가 같고, ${y} $1$개는 같은 구슬 $${b}$개와 무게가 같아요.`;
          if (level === 1) {
            const heavy = a > b ? x : y;
            return {
              q: `${lead} ${x}와 ${y} 중에서 더 무거운 것은 무엇인가요?`.replace(`${x}와`, J(x, '와')),
              answer: textChoices(r, heavy, [a > b ? y : x], 2),
              steps: [`구슬이 많을수록 더 무거워요.`, `$${Math.max(a, b)}$개 > $${Math.min(a, b)}$개 → ${heavy}`],
            };
          }
          const hi = a > b ? x : y;
          const lo = a > b ? y : x;
          return {
            q: `${lead} ${J(hi, '은')} ${lo}보다 구슬 몇 개만큼 더 무거운가요?`,
            answer: { type: 'num', value: Math.abs(a - b), unit: '개' },
            steps: [`${hi}: 구슬 $${Math.max(a, b)}$개, ${lo}: 구슬 $${Math.min(a, b)}$개`, `$${Math.max(a, b)}-${Math.min(a, b)}=${Math.abs(a - b)}$ → 구슬 $${Math.abs(a - b)}$개만큼 더 무거워요.`],
          };
        }
        const a = r.int(2, 4);
        if (r.chance(0.5)) {
          return {
            q: `양팔 저울로 무게를 재었어요. ${x} $1$개는 똑같은 구슬 $${a}$개와 무게가 같고, ${y} $1$개는 ${x} $2$개와 무게가 같아요. ${y} $1$개는 구슬 몇 개와 무게가 같나요?`,
            answer: { type: 'num', value: 2 * a, unit: '개' },
            steps: [`${y} $1$개 = ${x} $2$개`, `${x} $1$개 = 구슬 $${a}$개이므로 ${x} $2$개 = 구슬 $${a}+${a}=${2 * a}$개`, `${y} $1$개는 구슬 $${2 * a}$개와 무게가 같아요.`],
            hint: `${x} $2$개는 구슬 몇 개일까요?`,
          };
        }
        return {
          q: `양팔 저울로 무게를 재었어요. ${x} $1$개는 똑같은 구슬 $${a}$개와 무게가 같고, ${y} $1$개는 ${x} $2$개와 무게가 같아요. ${J(y, '은')} ${x}보다 구슬 몇 개만큼 더 무거운가요?`,
          answer: { type: 'num', value: a, unit: '개' },
          steps: [`${x} $1$개 = 구슬 $${a}$개`, `${y} $1$개 = ${x} $2$개 = 구슬 $${a}+${a}=${2 * a}$개`, `$${2 * a}-${a}=${a}$ → 구슬 $${a}$개만큼 더 무거워요.`],
          hint: `${y}는 구슬 몇 개와 무게가 같은지 먼저 구해요.`,
        };
      },
    },
  ],
  top: [
    {
      id: 'top-order-four',
      title: '단서로 네 명의 순서 정하기',
      gen(r): ProblemDraft {
        const ps = names(r, 4); // ps[0] 이 가장 큼(무거움)
        const tall = r.chance(0.5);
        const big = tall ? '키가 커요' : '더 무거워요';
        const small = tall ? '키가 작아요' : '더 가벼워요';
        const cl = (hi: string, lo: string) => (r.chance(0.5) ? `${J(hi, '는')} ${lo}보다 ${big}.` : `${J(lo, '는')} ${hi}보다 ${small}.`);
        const clues = [cl(ps[0], ps[1]), cl(ps[1], ps[2]), cl(ps[2], ps[3])];
        if (r.chance(0.5)) clues.push(cl(ps[0], ps[2]));
        const shown = r.shuffle(clues);
        const fromBig = r.chance(0.5);
        const k = r.int(2, 3);
        const ans = fromBig ? ps[k - 1] : ps[4 - k];
        return {
          q: `${r.shuffle(ps).join(', ')} 네 사람의 ${tall ? '키' : '몸무게'}를 비교했어요.\n${shown.map((c) => `- ${c}`).join('\n')}\n${tall ? `키가 ${ORDS[k]}로 ${fromBig ? '큰' : '작은'}` : `${ORDS[k]}로 ${fromBig ? '무거운' : '가벼운'}`} 사람은 누구인가요?`,
          answer: textChoices(
            r,
            ans,
            ps.filter((p) => p !== ans),
            4,
          ),
          steps: [
            `단서를 ${tall ? '키가 큰' : '무거운'} 쪽 → ${tall ? '작은' : '가벼운'} 쪽으로 바꾸어 써요.`,
            `${ps[0]} → ${ps[1]}, ${ps[1]} → ${ps[2]}, ${ps[2]} → ${ps[3]}`,
            `이어 보면 ${tall ? '키가 큰' : '무거운'} 사람부터 ${ps.join(', ')}`,
            fromBig ? `${ORDS[k]}로 ${tall ? '큰' : '무거운'} 사람은 앞에서 ${ORDS[k]}인 ${ans}` : `${ORDS[k]}로 ${tall ? '작은' : '가벼운'} 사람은 뒤에서 ${ORDS[k]}인 ${ans}`,
            `답: ${ans}`,
          ],
          hint: '두 사람씩 비교한 것을 이어서 한 줄로 세워 보세요.',
        };
      },
    },
    {
      id: 'top-cup-convert',
      title: '컵 크기를 바꾸어 부은 횟수 구하기',
      gen(r): ProblemDraft {
        const [p] = names(r, 1);
        const a = r.int(2, 3);
        const kind = r.int(0, 2);
        const lead = `큰 컵으로 물을 $1$번 부은 양은 작은 컵으로 $${a}$번 부은 양과 같아요.`;
        const rep = (k: number) => Array(k).fill(`$${a}$번`).join(', ');
        if (kind === 0) {
          const b = a === 2 ? r.int(2, 4) : r.int(2, 3);
          return {
            q: `${lead} ${J(p, '는')} 빈 물통에 큰 컵으로 물을 $${b}$번 부어 가득 채웠어요. 이 물통을 작은 컵으로만 가득 채우려면 물을 몇 번 부어야 하나요?`,
            answer: { type: 'num', value: a * b, unit: '번' },
            steps: [`큰 컵 $1$번 = 작은 컵 $${a}$번`, `큰 컵 $${b}$번 = 작은 컵 ${rep(b)}`, `작은 컵으로 부은 횟수를 하나씩 세면 $${a * b}$번`, `작은 컵으로 $${a * b}$번 부어야 해요.`],
            hint: '큰 컵 1번을 작은 컵 몇 번으로 바꿀 수 있는지 생각해요.',
          };
        }
        if (kind === 1) {
          const b = a === 2 ? r.int(3, 4) : 3;
          const k = r.int(1, b - 1);
          const c = a * k;
          return {
            q: `${lead} 큰 컵으로 $${b}$번 부으면 가득 차는 빈 물통에 ${J(p, '가')} 작은 컵으로 물을 $${c}$번 부었어요. 물통을 가득 채우려면 큰 컵으로 몇 번 더 부어야 하나요?`,
            answer: { type: 'num', value: b - k, unit: '번' },
            steps: [
              `작은 컵 $${a}$번 = 큰 컵 $1$번`,
              `작은 컵 $${c}$번을 $${a}$번씩 묶으면 ${rep(k)} → 큰 컵 $${k}$번만큼 부은 셈이에요.`,
              `가득 채우려면 큰 컵 $${b}$번이 필요해요.`,
              `$${b}-${k}=${b - k}$ → 큰 컵으로 $${b - k}$번 더`,
            ],
            hint: '작은 컵으로 부은 양을 큰 컵으로 바꾸어 생각해요.',
          };
        }
        const [x, y] = until(
          () => [r.int(1, 3), r.int(1, 3)],
          ([x, y]) => a * x + y <= 9,
        );
        return {
          q: `${lead} ${J(p, '는')} 빈 물통에 큰 컵으로 $${x}$번, 작은 컵으로 $${y}$번 물을 부었더니 가득 찼어요. 이 물통을 작은 컵으로만 가득 채우려면 물을 몇 번 부어야 하나요?`,
          answer: { type: 'num', value: a * x + y, unit: '번' },
          steps: [
            `큰 컵 $1$번 = 작은 컵 $${a}$번`,
            `큰 컵 $${x}$번 = 작은 컵 ${rep(x)} → $${a * x}$번`,
            `여기에 작은 컵 $${y}$번을 더해요.`,
            `$${a * x}+${y}=${a * x + y}$ → 작은 컵으로 $${a * x + y}$번`,
          ],
          hint: '큰 컵으로 부은 것을 작은 컵 횟수로 바꾸어 보세요.',
        };
      },
    },
  ],
};

// ───────────────────────── e1a-5 50까지의 수
function twoDigits(cs: number[]): number[] {
  const out = new Set<number>();
  for (const a of cs) for (const b of cs) if (a !== b && a !== 0) out.add(10 * a + b);
  return [...out].sort((x, y) => x - y);
}

const e1a5: HardSet = {
  skills: [
    {
      id: 'card-two-digit',
      title: '수 카드로 몇십몇 만들기',
      gen(r, level): ProblemDraft {
        const lead = (cs: number[]) => `수 카드 ${cardList(cs)} 중에서 두 장을 골라 한 번씩만 사용하여 몇십몇을 만들려고 해요.`;
        if (level === 1) {
          const cs = r.sample([1, 2, 3, 4], 3);
          const s = [...cs].sort((a, b) => b - a);
          return {
            q: `${lead(cs)} 만들 수 있는 가장 큰 수는 무엇인가요?`,
            answer: { type: 'num', value: 10 * s[0] + s[1] },
            steps: [`가장 큰 수 $${s[0]}$을 $10$개씩 묶음의 수로, 둘째로 큰 수 $${s[1]}$을 낱개의 수로 놓아요.`, `가장 큰 수는 $${10 * s[0] + s[1]}$`],
          };
        }
        if (level === 2) {
          const cs = r.shuffle([0, ...r.sample([1, 2, 3, 4], 3)]);
          const nz = cs.filter((c) => c).sort((a, b) => a - b);
          return {
            q: `${lead(cs)} 만들 수 있는 가장 작은 수는 무엇인가요?`,
            answer: { type: 'num', value: 10 * nz[0] },
            steps: [`$0$은 $10$개씩 묶음의 수가 될 수 없어요.`, `$10$개씩 묶음의 수: $0$이 아닌 가장 작은 수 $${nz[0]}$`, `낱개의 수: 가장 작은 수 $0$`, `가장 작은 수는 $${10 * nz[0]}$`],
            hint: '0은 앞자리에 올 수 없어요.',
          };
        }
        const [cs, lo, hi] = until(
          () => {
            const cs = r.sample([0, 1, 2, 3, 4], 4);
            const lo = r.int(10, 30);
            return [cs, lo, lo + r.int(8, 18)] as [number[], number, number];
          },
          ([cs, lo, hi]) => {
            const k = twoDigits(cs).filter((n) => n > lo && n < hi).length;
            return hi <= 50 && k >= 2 && k <= 6;
          },
        );
        const all = twoDigits(cs);
        const ok = all.filter((n) => n > lo && n < hi);
        return {
          q: `${lead(cs)} 만들 수 있는 수 중에서 $${lo}$보다 크고 $${hi}$보다 작은 수는 모두 몇 개인가요?`.replace(`$${lo}$보다보다`, `$${lo}$보다`),
          answer: { type: 'num', value: ok.length, unit: '개' },
          steps: [
            `만들 수 있는 수를 작은 수부터 모두 써요: ${numList(all, 12)}`,
            `$${lo}$보다 크고 $${hi}$보다 작은 수: ${numList(ok)}`.replace(`$${lo}$보다보다`, `$${lo}$보다`),
            `모두 $${ok.length}$개`,
          ],
          hint: '10개씩 묶음의 수가 될 카드를 하나씩 정해 빠짐없이 써 보세요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'top-digit-relation',
      title: '묶음과 낱개의 관계로 수 찾기',
      gen(r): ProblemDraft {
        const kind = r.int(0, 2);
        if (kind === 0) {
          const [t, o] = until(
            () => [r.int(1, 4), r.int(0, 9)],
            ([t, o]) => t !== o && t + o <= 12 && Math.abs(t - o) >= 1,
          );
          const s = t + o;
          const d = Math.abs(t - o);
          const onesBig = o > t;
          const pairs = range(1, 4)
            .filter((x) => s - x >= 0 && s - x <= 9)
            .map((x) => [x, s - x]);
          return {
            q: `$50$보다 작은 어떤 수를 $10$개씩 묶음과 낱개로 나타냈어요. $10$개씩 묶음의 수와 낱개의 수를 더하면 $${s}$${jo(s, '이') === '이' ? '이고' : '고'}, ${onesBig ? '낱개의 수가 $10$개씩 묶음의 수보다' : '$10$개씩 묶음의 수가 낱개의 수보다'} $${d}$만큼 더 커요. 어떤 수는 무엇인가요?`,
            answer: { type: 'num', value: 10 * t + o },
            steps: [
              `$50$보다 작으니 $10$개씩 묶음의 수는 $1$, $2$, $3$, $4$ 중 하나예요.`,
              `더해서 $${s}$이 되는 (묶음, 낱개): ${pairs.map(([a, b]) => `($${a}$, $${b}$)`).join(', ')}`,
              `이 중 ${onesBig ? '낱개' : '묶음'}의 수가 $${d}$만큼 더 큰 것은 ($${t}$, $${o}$)`,
              `$10$개씩 묶음 $${t}$개와 낱개 $${o}$개 → $${10 * t + o}$`,
              `어떤 수는 $${10 * t + o}$`,
            ],
            hint: '더해서 그 수가 되는 두 수를 모두 써 보세요.',
          };
        }
        const [lo, hi] = until(
          () => {
            const lo = r.int(10, 30);
            return [lo, lo + r.int(10, 19)];
          },
          ([lo, hi]) => hi <= 50 && Math.floor((lo + 1) / 10) !== Math.floor((hi - 1) / 10),
        );
        const inside = range(lo + 1, hi - 1);
        if (kind === 1) {
          const big = r.chance(0.5);
          const ok = inside.filter((n) => (big ? n % 10 > Math.floor(n / 10) : n % 10 < Math.floor(n / 10)));
          const tens = [...new Set(inside.map((n) => Math.floor(n / 10)))];
          return {
            q: `$${lo}$보다 크고 $${hi}$보다 작은 수 중에서 낱개의 수가 $10$개씩 묶음의 수보다 ${big ? '큰' : '작은'} 수는 모두 몇 개인가요?`.replace('보다보다', '보다'),
            answer: { type: 'num', value: ok.length, unit: '개' },
            steps: [
              `$${lo + 1}$부터 $${hi - 1}$까지의 수를 $10$개씩 묶음의 수로 나누어 살펴봐요.`,
              ...tens.map((t) => {
                const g = ok.filter((n) => Math.floor(n / 10) === t);
                return `묶음이 $${t}$인 수: ${g.length ? numList(g) : '없어요'} → $${g.length}$개`;
              }),
              `모두 $${ok.length}$개`,
            ],
            hint: '10개씩 묶음의 수가 같은 수끼리 나누어 세어 보세요.',
          };
        }
        const sd = until(
          () => r.int(4, 11),
          (v) => range(1, 4).filter((t) => v - t >= 0 && v - t <= 9).length >= 3,
        );
        const ok = range(1, 4)
          .filter((t) => sd - t >= 0 && sd - t <= 9)
          .map((t) => 10 * t + (sd - t));
        return {
          q: `$50$보다 작은 몇십몇 중에서 $10$개씩 묶음의 수와 낱개의 수를 더하면 $${sd}$${jo(sd, '이')} 되는 수는 모두 몇 개인가요?`,
          answer: { type: 'num', value: ok.length, unit: '개' },
          steps: [
            `$50$보다 작은 몇십몇의 $10$개씩 묶음의 수는 $1$, $2$, $3$, $4$ 중 하나예요.`,
            ...range(1, 4).map((t) => (sd - t <= 9 ? `묶음이 $${t}$이면 낱개는 $${sd}-${t}=${sd - t}$ → $${10 * t + sd - t}$` : `묶음이 $${t}$이면 낱개가 $${sd - t}$이어야 하는데, 낱개의 수는 $9$까지라서 안 돼요.`)),
            `모두 $${ok.length}$개`,
          ],
          hint: '10개씩 묶음의 수를 1부터 차례로 정해 보세요.',
        };
      },
    },
    {
      id: 'top-middle-number',
      title: '두 수의 한가운데에 있는 수',
      gen(r): ProblemDraft {
        const [a, b] = until(
          () => {
            const a = r.int(5, 40);
            return [a, a + 2 * r.int(2, 6)];
          },
          ([, b]) => b <= 50,
        );
        const m = (a + b) / 2;
        const k = m - a;
        const meet: string[] = [];
        for (let i = 0; i <= k; i++) meet.push(i === k ? `$${m}$` : `($${a + i}$, $${b - i}$)`);
        if (r.chance(0.5)) {
          return {
            q: `$${a}$부터 $${b}$까지의 수를 작은 수부터 차례로 썼어요. 쓴 수 중에서 한가운데에 있는 수는 무엇인가요?`,
            answer: { type: 'num', value: m },
            steps: [
              `양쪽 끝에서 하나씩 짝을 지어 안쪽으로 들어가요.`,
              meet.join(' → '),
              `짝이 없이 하나 남은 수가 한가운데 수예요.`,
              `$${a}$에서 $${m}$까지 $${k}$만큼, $${m}$에서 $${b}$까지도 $${k}$만큼 차이 나요.`,
              `한가운데 수는 $${m}$`,
            ],
            hint: '양쪽 끝의 수부터 하나씩 지워 보세요.',
          };
        }
        const lowGiven = r.chance(0.5);
        return {
          q: `${lowGiven ? `$${a}$부터 어떤 수까지` : `어떤 수부터 $${b}$까지`}의 수를 작은 수부터 차례로 썼더니, 쓴 수 중에서 한가운데에 있는 수가 $${m}$${jo(m, '이') === '이' ? '이었어요' : '였어요'}. 어떤 수는 무엇인가요?`,
          answer: { type: 'num', value: lowGiven ? b : a },
          steps: [
            `한가운데 수는 양 끝의 수에서 똑같이 떨어져 있어요.`,
            lowGiven ? `$${a}$에서 $${m}$까지 세어 보면 $${k}$만큼 커져요.` : `$${m}$에서 $${b}$까지 세어 보면 $${k}$만큼 커져요.`,
            lowGiven ? `$${m}$에서 $${k}$만큼 더 큰 수를 찾아요.` : `$${m}$에서 $${k}$만큼 더 작은 수를 찾아요.`,
            lowGiven ? `$${m}$부터 $${k}$번 하나씩 세면 $${b}$` : `$${m}$부터 $${k}$번 거꾸로 하나씩 세면 $${a}$`,
            `어떤 수는 $${lowGiven ? b : a}$`,
          ],
          hint: '한가운데 수에서 아는 끝의 수까지 얼마나 떨어져 있는지 세어 보세요.',
        };
      },
    },
  ],
};

// ───────────────────────── e1b-1 100까지의 수
const e1b1: HardSet = {
  skills: [
    {
      id: 'card-even-odd',
      title: '수 카드로 짝수·홀수 만들기',
      gen(r, level): ProblemDraft {
        const even = r.chance(0.5);
        const par = even ? '짝수' : '홀수';
        const isP = (d: number) => (d % 2 === 0) === even;
        const n = level === 1 ? 3 : 4;
        const cs = until(
          () => r.sample(range(1, 9), n),
          (c) => c.filter(isP).length >= 1 && c.filter((d) => !isP(d)).length >= 1,
        );
        const all = twoDigits(cs).filter((x) => isP(x % 10));
        const lead = `수 카드 ${cardList(cs)} 중에서 두 장을 골라 한 번씩만 사용하여 몇십몇을 만들려고 해요.`;
        if (level < 3) {
          const big = level === 1;
          const ans = big ? all[all.length - 1] : all[0];
          const ones = ans % 10;
          return {
            q: `${lead} 만들 수 있는 ${par} 중에서 가장 ${big ? '큰' : '작은'} 수는 무엇인가요?`,
            answer: { type: 'num', value: ans },
            steps: [
              `${par}는 낱개의 수가 ${even ? '$2$, $4$, $6$, $8$' : '$1$, $3$, $5$, $7$, $9$'} 중 하나예요.`,
              `낱개 자리에 올 수 있는 카드: ${cardList(cs.filter(isP))}`,
              big
                ? `가장 큰 수가 되려면 앞자리를 가장 크게: 낱개 $${ones}$, 앞자리 $${Math.floor(ans / 10)}$`
                : `가장 작은 수가 되려면 앞자리를 가장 작게: 낱개 $${ones}$, 앞자리 $${Math.floor(ans / 10)}$`,
              `답: $${ans}$`,
            ],
            hint: '낱개의 수가 짝수인지 홀수인지만 보면 돼요.',
          };
        }
        const pc = cs.filter(isP);
        return {
          q: `${lead} 만들 수 있는 수 중에서 ${par}는 모두 몇 개인가요?`,
          answer: { type: 'num', value: all.length, unit: '개' },
          steps: [pc.length === 1 ? `${par}가 되려면 낱개 자리에 ${N(pc[0], '이')} 와야 해요.` : `${par}가 되려면 낱개 자리에 ${cardList(pc)} 중 하나가 와야 해요.`, ...pc.map((d) => `낱개가 $${d}$일 때: ${numList(all.filter((x) => x % 10 === d))}`), `모두 $${all.length}$개`],
          hint: '낱개 자리에 올 카드를 먼저 정해 보세요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'top-clue-2digit',
      title: '조건을 모두 만족하는 두 자리 수 찾기',
      gen(r): ProblemDraft {
        type C = { text: string; ok: (n: number) => boolean };
        const T = (n: number) => Math.floor(n / 10);
        const O = (n: number) => n % 10;
        const [clues, t] = until(
          () => {
            const t = r.int(12, 98);
            const lo = t - r.int(3, 15);
            const hi = t + r.int(3, 15);
            const pool: C[] = [];
            pool.push({
              text: `$${lo}$보다 크고 $${hi}$보다 작은 수예요.`.replace('보다보다', '보다'),
              ok: (n) => n > lo && n < hi,
            });
            pool.push(t % 2 === 0 ? { text: '짝수예요.', ok: (n) => n % 2 === 0 } : { text: '홀수예요.', ok: (n) => n % 2 === 1 });
            if (T(t) > O(t))
              pool.push({
                text: '$10$개씩 묶음의 수가 낱개의 수보다 커요.',
                ok: (n) => T(n) > O(n),
              });
            if (T(t) < O(t))
              pool.push({
                text: '낱개의 수가 $10$개씩 묶음의 수보다 커요.',
                ok: (n) => O(n) > T(n),
              });
            pool.push({
              text: `$10$개씩 묶음의 수와 낱개의 수를 더하면 $${T(t) + O(t)}$이에요.`.replace(/(\d+)\$이에요/, (_m, d) => `${d}$${jo(Number(d), '이에요')}`),
              ok: (n) => T(n) + O(n) === T(t) + O(t),
            });
            if (O(t) !== T(t) && r.chance(0.5)) {
              const d = Math.abs(T(t) - O(t));
              pool.push({
                text: `$10$개씩 묶음의 수와 낱개의 수의 차는 $${d}$이에요.`.replace(/(\d+)\$이에요/, (_m, x) => `${x}$${jo(Number(x), '이에요')}`),
                ok: (n) => Math.abs(T(n) - O(n)) === d,
              });
            }
            const cs = [pool[0], ...r.sample(pool.slice(1), 2)];
            return [cs, t] as [C[], number];
          },
          ([cs, t]) => {
            const dom = range(10, 99);
            const sol = dom.filter((n) => cs.every((c) => c.ok(n)));
            if (sol.length !== 1 || sol[0] !== t) return false;
            return cs.every((_c, i) => dom.filter((n) => cs.every((c, j) => j === i || c.ok(n))).length > 1);
          },
        );
        const shown = r.shuffle(clues);
        let cand = range(10, 99);
        const steps: string[] = [];
        // 풀이는 범위 조건부터
        for (const c of clues) {
          cand = cand.filter(c.ok);
          steps.push(`'${c.text.replace(/\.$/, '')}' → ${numList(cand)}`);
        }
        return {
          q: `다음을 모두 만족하는 두 자리 수는 무엇인가요?\n${shown.map((c) => `- ${c.text}`).join('\n')}`,
          answer: { type: 'num', value: t },
          steps: ['범위를 정하는 조건부터 차례로 맞지 않는 수를 지워요.', ...steps, `답: $${t}$`],
          hint: '먼저 범위 안의 수를 모두 쓰고 하나씩 지워 보세요.',
        };
      },
    },
    {
      id: 'top-digit-count',
      title: '수를 쓸 때 숫자가 몇 번 나오는지 세기',
      gen(r): ProblemDraft {
        const [n, d] = until(
          () => [r.int(30, 99), r.int(1, 9)],
          ([n, d]) => 10 * d <= n,
        );
        const ones = range(1, n).filter((x) => x % 10 === d);
        const tens = range(1, n).filter((x) => Math.floor(x / 10) === d);
        const dd = 11 * d;
        const total = ones.length + tens.length;
        return {
          q: `$1$부터 $${n}$까지의 수를 차례로 쓰려고 해요. 숫자 $${d}$는 모두 몇 번 쓰게 되나요?`,
          answer: { type: 'num', value: total, unit: '번' },
          steps: [
            `낱개 자리와 $10$개씩 묶음 자리로 나누어 세어요.`,
            `낱개 자리에 $${d}$: ${numList(ones)} → $${ones.length}$번`,
            `묶음 자리에 $${d}$: ${numList(tens)} → $${tens.length}$번`,
            dd <= n ? `$${dd}$에는 숫자 $${d}$가 두 번 들어 있어서 두 번 다 세었어요.` : `두 자리에 모두 $${d}$가 있는 $${dd}$는 $${n}$보다 커서 쓰지 않아요.`,
            `모두 $${ones.length}+${tens.length}=${total}$ → $${total}$번`,
          ],
          hint: `$${dd}$처럼 숫자 $${d}$가 두 번 나오는 수를 조심하세요.`,
        };
      },
    },
  ],
};

// ───────────────────────── e1b-2 덧셈과 뺄셈(1) (받아올림 없는 두 자리 수)
const noCarry = (a: number, b: number) => (a % 10) + (b % 10) <= 9 && a + b <= 99;
const noBorrow = (a: number, b: number) => a % 10 >= b % 10 && a >= b;

const e1b2: HardSet = {
  skills: [
    {
      id: 'wrong-calc',
      title: '잘못 계산한 어떤 수',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const [x, a] = until(
            () => [r.int(10, 79), r.int(10, 40)],
            ([x, a]) => noCarry(x, a),
          );
          return {
            q: `어떤 수에 ${N(a, '을')} 더했더니 $${x + a}$이 되었어요. 어떤 수는 무엇인가요?`.replace(/\$(\d+)\$이 되었/, (_m, v) => `$${v}$${jo(Number(v), '이')} 되었`),
            answer: { type: 'num', value: x },
            steps: [`어떤 수 $+${a}=${x + a}$`, `거꾸로 빼면: $${x + a}-${a}=${x}$`, `어떤 수는 $${x}$`],
          };
        }
        const addRight = r.chance(0.5); // 바른 계산이 덧셈
        const [x, a] = until(
          () => [r.int(20, 89), r.int(10, 50)],
          ([x, a]) => noCarry(x, a) && noBorrow(x, a) && x - a >= 1,
        );
        const w = addRight ? x - a : x + a; // 잘못한 결과
        const right = addRight ? x + a : x - a;
        const wrongOp = addRight ? '뺐더니' : '더했더니';
        const rightOp = addRight ? '더해야' : '빼야';
        const q0 = `어떤 수에${addRight ? '' : '서'} ${N(a, '을')} ${rightOp} 할 것을 잘못하여 ${wrongOp} $${w}$${jo(w, '이')} 되었어요.`.replace('어떤 수에 ', '어떤 수에 ');
        const find = addRight ? `$${w}+${a}=${x}$` : `$${w}-${a}=${x}$`;
        if (level === 2) {
          return {
            q: `${q0} 어떤 수는 무엇인가요?`,
            answer: { type: 'num', value: x },
            steps: [addRight ? `잘못한 계산: 어떤 수 $-${a}=${w}$` : `잘못한 계산: 어떤 수 $+${a}=${w}$`, `거꾸로 계산하면 ${find}`, `어떤 수는 $${x}$`],
            hint: '잘못 계산한 식을 먼저 써 보세요.',
          };
        }
        return {
          q: `${q0} 바르게 계산하면 얼마인가요?`,
          answer: { type: 'num', value: right },
          steps: [
            addRight ? `잘못한 계산: 어떤 수 $-${a}=${w}$` : `잘못한 계산: 어떤 수 $+${a}=${w}$`,
            `어떤 수: ${find}`,
            addRight ? `바른 계산: $${x}+${a}=${right}$` : `바른 계산: $${x}-${a}=${right}$`,
            `바르게 계산하면 $${right}$`,
          ],
          hint: '먼저 어떤 수를 구한 다음 바르게 계산해요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'top-digit-symbol',
      title: '같은 모양에 같은 숫자 넣기 (두 자리 수 덧셈)',
      gen(r): ProblemDraft {
        const [S, T] = r.pick([
          ['★', '▲'],
          ['●', '■'],
          ['▲', '●'],
        ]);
        if (r.chance(0.5)) {
          const [a, b] = until(
            () => [r.int(1, 8), r.int(1, 8)],
            ([a, b]) => a !== b && a + b <= 9,
          );
          const s = a + b;
          const bigA = a > b;
          const d = Math.abs(a - b);
          const pairs = range(1, s - 1).map((x) => `(${x}, ${s - x})`);
          return {
            q: `같은 모양에는 같은 숫자가 들어가요. ${S}${T}는 두 자리 수예요.\n${S}${T} + ${T}${S} = $${11 * s}$\n${bigA ? S : T}는 ${bigA ? T : S}보다 $${d}$만큼 더 큰 숫자예요.\n두 자리 수 ${S}${T}는 무엇인가요?`,
            answer: { type: 'num', value: 10 * a + b },
            steps: [
              `낱개 자리: ${T} + ${S}, $10$개씩 묶음 자리: ${S} + ${T} → 두 자리 모두 같은 두 숫자를 더해요.`,
              `$${11 * s}$이니 ${S} + ${T} $= ${s}$ 이에요.`.replace(`$${11 * s}$이니`, `$${11 * s}$${jo(11 * s, '이')}니`).replace(` 이에요`, jo(s, '이에요')),
              `더해서 $${s}$이 되는 두 숫자 (${S}, ${T}): ${pairs.map((p) => `$${p}$`).join(', ')}`.replace(`$${s}$이 되는`, `$${s}$${jo(s, '이')} 되는`),
              `이 중 ${bigA ? S : T}가 $${d}$만큼 더 큰 것: ${S} $=${a}$, ${T} $=${b}$`,
              `${S}${T}는 $${10 * a + b}$`,
            ],
            hint: '두 수의 낱개 자리끼리, 묶음 자리끼리 무엇을 더하는지 보세요.',
          };
        }
        const [a, b] = until(
          () => [r.int(1, 4), r.int(0, 4)],
          ([a, b]) => a !== b,
        );
        const v = 10 * a + b;
        const res = 2 * v;
        return {
          q: `같은 모양에는 같은 숫자가 들어가요. ${S}${T}는 두 자리 수예요.\n${S}${T} + ${S}${T} = $${res}$\n두 자리 수 ${S}${T}는 무엇인가요?`,
          answer: { type: 'num', value: v },
          steps: [
            `받아올림이 없으니 낱개 자리끼리, $10$개씩 묶음 자리끼리 생각해요.`,
            `낱개 자리: ${T} + ${T} $= ${2 * b}$ → 같은 수 두 개의 합이 $${2 * b}$이니 ${T} $= ${b}$`.replace(`$${2 * b}$이니`, `$${2 * b}$${jo(2 * b, '이')}니`),
            `묶음 자리: ${S} + ${S} $= ${2 * a}$ → ${S} $= ${a}$`,
            `확인: $${v}+${v}=${res}$`,
            `${S}${T}는 $${v}$`,
          ],
          hint: '같은 수를 두 번 더한 것이에요.',
        };
      },
    },
    {
      id: 'top-chain-reverse',
      title: '거꾸로 따져 처음 수 구하기',
      gen(r): ProblemDraft {
        const ps = names(r, 4);
        const [thing, u] = r.pick(THINGS.filter(([, u]) => u === '개' || u === '장'));
        // v[0]..v[3], 관계 i: ps[i] 는 ps[i+1] 보다 d[i] 많/적
        const [v, d, s] = until(
          () => {
            const v0 = r.int(20, 80);
            const d = [r.int(11, 35), r.int(11, 35), r.int(11, 35)];
            const s = [r.sign(), r.sign(), r.sign()];
            const v = [v0];
            for (let i = 0; i < 3; i++) v.push(v[i] - s[i] * d[i]);
            return [v, d, s] as [number[], number[], number[]];
          },
          ([v, d, s]) => {
            if (!v.every((x) => x >= 10 && x <= 99)) return false;
            for (let i = 0; i < 3; i++) {
              // 거꾸로: v[i] 를 v[3] 쪽부터 구함 → v[i] = v[i+1] + s*d
              const ok = s[i] > 0 ? noCarry(v[i + 1], d[i]) : noBorrow(v[i + 1], d[i]);
              if (!ok) return false;
            }
            return true;
          },
        );
        const rel = (i: number) => `${J(ps[i], '는')} ${ps[i + 1]}보다 ${thing}${jo(thing, '을')} $${d[i]}$${u} 더 ${s[i] > 0 ? '많이' : '적게'} 가지고 있어요.`;
        const steps: string[] = [`${J(ps[3], '가')} 가진 수부터 거꾸로 구해요.`];
        for (let i = 2; i >= 0; i--) {
          steps.push(`${ps[i]}: ${ps[i + 1]}보다 $${d[i]}$${u} ${s[i] > 0 ? '많으니' : '적으니'} $${v[i + 1]}${s[i] > 0 ? '+' : '-'}${d[i]}=${v[i]}$ (${u})`);
        }
        steps.push(`${J(ps[0], '가')} 가진 ${J(thing, '은')} $${v[0]}$${u}`);
        return {
          q: `${rel(0)} ${rel(1)} ${rel(2)} ${J(ps[3], '가')} 가진 ${J(thing, '이')} $${v[3]}$${u}${jo(u, '이') === '이' ? '이라면' : '라면'} ${J(ps[0], '가')} 가진 ${J(thing, '은')} 몇 ${u}인가요?`,
          answer: { type: 'num', value: v[0], unit: u },
          steps,
          hint: `${ps[3]}부터 한 사람씩 거꾸로 구해 보세요.`,
        };
      },
    },
  ],
};

// ───────────────────────── e1b-3 모양과 시각
const tm = (h: number, m: number) => (m === 0 ? `$${h}$시` : `$${h}$시 $${m}$분`);

const e1b3: HardSet = {
  skills: [
    {
      id: 'clock-count',
      title: '두 시각 사이의 시각 세기',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const a = r.int(1, 10);
          return {
            q: `$${a}$시보다 늦고 $${a + 2}$시보다 이른 시각 중에서 긴바늘이 $12$를 가리키는 시각은 몇 시인가요?`,
            answer: { type: 'num', value: a + 1, unit: '시' },
            steps: [`긴바늘이 $12$를 가리키면 '몇 시'예요.`, `$${a}$시와 $${a + 2}$시 사이의 '몇 시'는 $${a + 1}$시`],
          };
        }
        if (level === 2) {
          const a = r.int(1, 7);
          const b = a + r.int(2, 4);
          const list = range(a + 1, b).map((h) => tm(h, 0));
          return {
            q: `$${a}$시 $30$분과 $${b}$시 $30$분 사이에 긴바늘이 $12$를 가리키는 때는 모두 몇 번인가요?`,
            answer: { type: 'num', value: b - a, unit: '번' },
            steps: [`긴바늘이 $12$를 가리키는 때는 '몇 시'일 때예요.`, `$${a}$시 $30$분 뒤부터 $${b}$시 $30$분 전까지: ${list.join(', ')}`, `모두 $${b - a}$번`],
          };
        }
        const a = r.int(1, 8);
        const b = a + r.int(1, 3);
        const list: string[] = [];
        for (let h = a; h <= b; h++) {
          list.push(tm(h, 0));
          list.push(tm(h, 30));
        }
        return {
          q: `$${a}$시부터 $${b}$시 $30$분까지 긴바늘이 $12$나 $6$을 가리키는 때는 모두 몇 번인가요? ($${a}$시와 $${b}$시 $30$분도 넣어서 세어요.)`,
          answer: { type: 'num', value: list.length, unit: '번' },
          steps: [`긴바늘이 $12$이면 '몇 시', $6$이면 '몇 시 $30$분'이에요.`, `차례로 쓰면: ${list.join(', ')}`, `모두 $${list.length}$번`],
          hint: '몇 시와 몇 시 30분을 차례로 모두 써 보세요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'top-clock-pattern',
      title: '규칙에 따라 바뀌는 시각 찾기',
      gen(r): ProblemDraft {
        const [start, step, k] = until(
          () => [r.int(2, 22), r.pick([1, 2, -1, 4]), r.int(6, 9)],
          ([s, st, k]) => {
            const last = s + st * (k - 1);
            return last >= 2 && last <= 25 && s >= 2 && s <= 25 && !(st === 4 && k > 6) && !(st === 2 && s % 2 === 1 && r.chance(0.5));
          },
        );
        // 반 시간 단위: x → (floor(x/2)) 시, x 홀수면 30분. 2 → 1시
        const T = (x: number) => {
          const h = Math.floor(x / 2);
          return tm(h, x % 2 ? 30 : 0);
        };
        const seq = range(0, k - 1).map((i) => start + step * i);
        const ans = T(seq[k - 1]);
        const wrong = [seq[k - 1] + 1, seq[k - 1] - 1, seq[k - 1] + 2, seq[k - 1] - 2, seq[k - 2], seq[k - 1] + step].filter((x) => x >= 2 && x <= 25 && x !== seq[k - 1]).map(T);
        const desc = step === 1 ? '$30$분씩 늦어지는' : step === -1 ? '$30$분씩 빨라지는' : step === 2 ? '$1$시간씩 늦어지는' : '$2$시간씩 늦어지는';
        return {
          q: `규칙에 따라 시각을 늘어놓았어요.\n${seq.slice(0, 4).map(T).join(', ')}, …\n같은 규칙으로 이어 갈 때 ${ORDS[k]} 시각은 무엇인가요?`,
          answer: makeChoices(r, ans, wrong, 4),
          steps: [
            `첫째와 둘째 시각을 비교하면 ${desc} 규칙이에요.`,
            step === 1 || step === -1 ? `시계의 긴바늘이 $12$와 $6$을 번갈아 가리켜요.` : `긴바늘은 늘 같은 곳을 가리키고, 짧은바늘만 움직여요.`,
            `이어 쓰면: ${seq.map(T).join(', ')}`,
            `${ORDS[k]} 시각은 ${ans}`,
            `답: ${ans}`,
          ],
          hint: '시각이 어떻게 바뀌는지 두 개씩 비교해 보세요.',
        };
      },
    },
    {
      id: 'top-corner-reverse',
      title: '뾰족한 곳의 수로 모양 개수 구하기',
      gen(r): ProblemDraft {
        const [p] = names(r, 1);
        const what = r.pick(['로봇', '집', '꽃', '기차', '물고기']);
        const withCircle = r.chance(0.5);
        const [x, y, c] = until(
          () => [r.int(1, 4), r.int(1, 4), withCircle ? r.int(1, 3) : 0],
          ([x, y, c]) => x !== y && x + y + c <= 8 && 4 * x + 3 * y <= 25,
        );
        const K = 4 * x + 3 * y;
        const n = x + y;
        const askSq = r.chance(0.5);
        const tries: string[] = [];
        for (let s = 0; s <= n; s++) {
          const t = n - s;
          const k = 4 * s + 3 * t;
          if (Math.abs(s - x) <= 1) tries.push(`■ $${s}$개, ▲ $${t}$개 → 뾰족한 곳 $${k}$군데 ${k === K ? '(맞아요)' : ''}`.trim());
        }
        const q = withCircle
          ? `${J(p, '는')} ■ 모양, ▲ 모양, ● 모양을 모두 $${n + c}$개 붙여서 ${J(what, '을')} 꾸몄어요. ● 모양은 $${c}$개이고, 사용한 모양들의 뾰족한 곳은 모두 $${K}$군데예요. ${askSq ? '■' : '▲'} 모양은 몇 개 사용했나요?`
          : `${J(p, '는')} ■ 모양과 ▲ 모양을 모두 $${n}$개 붙여서 ${J(what, '을')} 꾸몄어요. 사용한 모양들의 뾰족한 곳은 모두 $${K}$군데예요. ${askSq ? '■' : '▲'} 모양은 몇 개 사용했나요?`;
        return {
          q,
          answer: { type: 'num', value: askSq ? x : y, unit: '개' },
          steps: [
            `■ 모양은 뾰족한 곳이 $4$군데, ▲ 모양은 $3$군데, ● 모양은 없어요.`,
            withCircle ? `● $${c}$개를 빼면 ■와 ▲는 모두 $${n + c}-${c}=${n}$개예요.` : `■와 ▲는 모두 $${n}$개예요.`,
            `■의 개수를 바꾸어 가며 뾰족한 곳을 세어 봐요.`,
            ...tries,
            `■ $${x}$개, ▲ $${y}$개 → ${askSq ? '■' : '▲'} 모양은 $${askSq ? x : y}$개`,
          ],
          hint: '■가 1개 늘고 ▲가 1개 줄면 뾰족한 곳은 1군데 늘어나요.',
        };
      },
    },
  ],
};

// ───────────────────────── e1b-4 덧셈과 뺄셈(2) (세 수, 10)
function crossFig(center: string): string {
  const u = 36;
  const s = new Svg(3 * u + 8, 3 * u + 8);
  const cells: [number, number][] = [
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [1, 2],
  ];
  for (const [cx, cy] of cells) {
    s.rect(4 + cx * u, 4 + cy * u, u, u);
    if (cx === 1 && cy === 1)
      s.text(4 + u * 1.5, 4 + u * 1.5 + 6, center, {
        anchor: 'middle',
        size: 18,
      });
  }
  return s.toString();
}

const e1b4: HardSet = {
  skills: [
    {
      id: 'reverse-three',
      title: '거꾸로 생각하여 처음 수 구하기',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const a = r.int(1, 9);
          return {
            q: `어떤 수에 ${N(a, '을')} 더했더니 $10$이 되었어요. 어떤 수는 무엇인가요?`,
            answer: { type: 'num', value: 10 - a },
            steps: [`어떤 수 $+${a}=10$`, `$${a}$와 더해서 $10$이 되는 수: $10-${a}=${10 - a}$`.replace(`$${a}$와`, `${N(a, '와')}`)],
          };
        }
        if (level === 2) {
          const [x, a, b] = until(
            () => [r.int(2, 10), r.int(1, 8), r.int(1, 8)],
            ([x, a, b]) => x - a >= 0 && x - a + b <= 10,
          );
          const c = x - a + b;
          return {
            q: `어떤 수에서 ${N(a, '을')} 빼고 ${N(b, '를')} 더했더니 ${N(c, '이')} 되었어요. 어떤 수는 무엇인가요?`,
            answer: { type: 'num', value: x },
            steps: [`어떤 수 $-${a}+${b}=${c}$`, `거꾸로: 더한 ${N(b, '를')} 빼요 → $${c}-${b}=${c - b}$`, `뺀 ${N(a, '을')} 더해요 → $${c - b}+${a}=${x}$`, `어떤 수는 $${x}$`],
            hint: '마지막에 한 계산부터 거꾸로 해요.',
          };
        }
        const [x, a, b, c] = until(
          () => [r.int(3, 10), r.int(1, 6), r.int(1, 6), r.int(1, 6)],
          ([x, a, b, c]) => x - a >= 0 && x - a + b <= 10 && x - a + b - c >= 1,
        );
        const d = x - a + b - c;
        const veh = r.pick(['버스', '마을버스', '기차 한 칸']);
        const stop = veh === '기차 한 칸' ? '역' : '정류장';
        return {
          q: `${veh}에 몇 명이 타고 있었어요. 첫째 ${stop}에서 $${a}$명이 내리고 $${b}$명이 탔어요. 둘째 ${stop}에서 $${c}$명이 내렸더니 $${d}$명이 남았어요. 처음에 ${veh}에 타고 있던 사람은 몇 명인가요?`.replace(
            `${veh}에에`,
            `${veh}에`,
          ),
          answer: { type: 'num', value: x, unit: '명' },
          steps: [
            `남은 $${d}$명에서 거꾸로 생각해요.`,
            `둘째 ${stop}에서 내리기 전: $${d}+${c}=${d + c}$ (명)`,
            `첫째 ${stop}에서 타기 전: $${d + c}-${b}=${d + c - b}$ (명)`,
            `첫째 ${stop}에서 내리기 전: $${d + c - b}+${a}=${x}$ (명)`,
            `처음에 $${x}$명이 타고 있었어요.`,
          ],
          hint: `마지막 ${stop}부터 거꾸로 생각해 보세요.`,
        };
      },
    },
  ],
  top: [
    {
      id: 'top-three-sum-ways',
      title: '세 수의 합이 되는 방법 모두 찾기',
      gen(r): ProblemDraft {
        const max = r.pick([6, 7]);
        const n = r.int(8, 12);
        const ways: number[][] = [];
        for (let a = 1; a <= max; a++) for (let b = a + 1; b <= max; b++) for (let c = b + 1; c <= max; c++) if (a + b + c === n) ways.push([a, b, c]);
        const ctx = r.chance(0.5);
        const byA = range(1, max).filter((a) => ways.some((w) => w[0] === a));
        return {
          q: ctx
            ? `$1$부터 $${max}$까지의 수 카드가 한 장씩 있어요. 이 중에서 세 장을 골라 세 수의 합이 $${n}$이 되게 하려고 해요. 고를 수 있는 방법은 모두 몇 가지인가요? (고른 카드가 같으면 같은 방법이에요.)`.replace(
                `$${n}$이 되게`,
                `$${n}$${jo(n, '이')} 되게`,
              )
            : `구슬 $${n}$개를 세 상자에 나누어 담으려고 해요. 세 상자에 담는 구슬의 수가 모두 다르고, 한 상자에 $1$개 이상 $${max}$개 이하로 담아요. 세 상자에 담을 구슬의 수를 고르는 방법은 모두 몇 가지인가요? (상자의 순서는 생각하지 않아요.)`,
          answer: { type: 'num', value: ways.length, unit: '가지' },
          steps: [
            `가장 작은 수부터 정하고, 나머지 두 수를 작은 수부터 차례로 찾아요.`,
            ...byA.map(
              (a) =>
                `가장 작은 수가 $${a}$일 때: ${ways
                  .filter((w) => w[0] === a)
                  .map((w) => `$${w.join('+')}$`)
                  .join(', ')}`,
            ),
            `모두 $${ways.length}$가지`,
          ],
          hint: '세 수를 작은 수부터 늘어놓아 빠짐없이 찾아보세요.',
        };
      },
    },
    {
      id: 'top-cross-sum',
      title: '가로줄과 세로줄의 합이 같게 수 넣기',
      gen(r): ProblemDraft {
        const lo = r.pick([0, 1]);
        const set = range(lo, lo + 4);
        const centers = set.filter((c) => (sum(set) - c) % 2 === 0);
        const c = r.pick(centers);
        const rest = set.filter((x) => x !== c);
        const half = (sum(set) - c) / 2;
        const line = c + half;
        const pairText = `$${rest[0]}+${rest[3]}=${rest[1]}+${rest[2]}=${half}$`;
        const lead = `그림의 다섯 칸에 $${lo}$부터 $${lo + 4}$까지의 수를 한 번씩 써넣어 가로줄 세 수의 합과 세로줄 세 수의 합이 같게 하려고 해요.`;
        if (r.chance(0.5)) {
          return {
            q: `${lead} 가운데 칸에 ${N(c, '을')} 써넣었다면, 한 줄에 있는 세 수의 합은 얼마인가요?`,
            fig: crossFig(String(c)),
            answer: { type: 'num', value: line },
            steps: [
              `가운데 수 $${c}$는 가로줄과 세로줄에 모두 들어가요.`,
              `남은 수 ${cardList(rest)}를 두 줄에 두 개씩 나누어, 두 수의 합이 같게 해야 해요.`.replace(`${cardList(rest)}를`, `${cardList(rest)}${jo(rest[3], '를')}`),
              `가장 작은 수와 가장 큰 수, 나머지 두 수를 짝 지으면 ${pairText}`,
              `한 줄의 합: $${c}+${half}=${line}$`,
              `답: $${line}$`,
            ],
            hint: '가운데 수를 뺀 네 수를 합이 같은 두 쌍으로 나누어 보세요.',
          };
        }
        const tries = set.map((x) => {
          const rs = set.filter((y) => y !== x);
          const ok = rs[0] + rs[3] === rs[1] + rs[2];
          return ok
            ? `가운데가 $${x}$: 남은 수를 $${rs[0]}+${rs[3]}=${rs[1]}+${rs[2]}=${rs[0] + rs[3]}$로 나누면 한 줄의 합은 $${x + rs[0] + rs[3]}$`
            : `가운데가 $${x}$: 남은 네 수를 합이 같은 두 쌍으로 나눌 수 없어요.`;
        });
        return {
          q: `${lead} 한 줄에 있는 세 수의 합이 ${N(line, '이')} 되게 하려면 가운데 칸에 어떤 수를 써넣어야 하나요?`,
          fig: crossFig('?'),
          answer: { type: 'num', value: c },
          steps: [`가운데 수를 하나씩 넣어 보고, 남은 네 수를 합이 같은 두 쌍으로 나눌 수 있는지 살펴봐요.`, ...tries, `한 줄의 합이 $${line}$인 것은 가운데가 $${c}$일 때예요.`],
          hint: '가운데 수를 하나씩 넣어 보세요.',
        };
      },
    },
  ],
};

// ───────────────────────── e1b-5 규칙 찾기
const e1b5: HardSet = {
  skills: [
    {
      id: 'pattern-blank',
      title: '규칙을 찾아 빈칸의 수 구하기',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const [a, d] = [r.int(1, 30), r.int(2, 5)];
          const seq = range(0, 4).map((i) => a + d * i);
          const hole = r.int(1, 3);
          const shown = seq.map((v, i) => (i === hole ? '㉠' : `$${v}$`));
          return {
            q: `규칙에 따라 수를 늘어놓았어요. ㉠에 알맞은 수는 무엇인가요?\n${shown.join(', ')}`,
            answer: { type: 'num', value: seq[hole] },
            steps: [`$${d}$씩 커지는 규칙이에요.`, `㉠ $= ${seq[hole - 1]}+${d}=${seq[hole]}$`],
          };
        }
        if (level === 2) {
          const down = r.chance(0.5);
          const d = r.int(2, 10);
          const a = down ? r.int(5 * d + 1, 99) : r.int(1, 99 - 5 * d);
          const seq = range(0, 5).map((i) => (down ? a - d * i : a + d * i));
          return {
            q: `규칙에 따라 수를 늘어놓았어요. ㉡에 알맞은 수는 무엇인가요?\n${seq
              .slice(0, 4)
              .map((v) => `$${v}$`)
              .join(', ')}, ㉠, ㉡`,
            answer: { type: 'num', value: seq[5] },
            steps: [`$${d}$씩 ${down ? '작아지는' : '커지는'} 규칙이에요.`, `㉠ $= ${seq[4]}$`, `㉡ $= ${seq[4]}${down ? '-' : '+'}${d}=${seq[5]}$`],
          };
        }
        const [s, a, b] = until(
          () => [r.int(1, 20), r.int(3, 9), r.int(1, 5)],
          ([s, a, b]) => a > b && s + 4 * a - 3 * b <= 60,
        );
        const seq = [s];
        for (let i = 1; i < 7; i++) seq.push(seq[i - 1] + (i % 2 ? a : -b));
        return {
          q: `규칙에 따라 수를 늘어놓았어요. ㉡에 알맞은 수는 무엇인가요?\n${seq
            .slice(0, 5)
            .map((v) => `$${v}$`)
            .join(', ')}, ㉠, ㉡`,
          answer: { type: 'num', value: seq[6] },
          steps: [
            `이웃한 두 수를 비교하면 $${a}$ 커지고, $${b}$ 작아지는 것을 되풀이해요.`,
            `다섯째 $${seq[4]}$ 다음은 $${a}$ 커질 차례: ㉠ $= ${seq[4]}+${a}=${seq[5]}$`,
            `그다음은 $${b}$ 작아질 차례: ㉡ $= ${seq[5]}-${b}=${seq[6]}$`,
          ],
          hint: '커졌다 작아졌다 하는 규칙을 찾아보세요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'top-nth-of-kind',
      title: '몇 번째로 나오는 모양의 자리 찾기',
      gen(r): ProblemDraft {
        const shapes = r.sample(['●', '▲', '■', '★', '◆'], 3);
        const unit = until(
          () => [shapes[0], ...r.shuffle([shapes[1], shapes[1], shapes[2]]).slice(0, r.int(2, 3))],
          (u) => u.includes(shapes[1]) && u.length >= 3,
        );
        const L = unit.length;
        const tgt = r.pick([...new Set(unit)]);
        const per = unit.filter((x) => x === tgt).length;
        const posIn = unit.map((x, i) => (x === tgt ? i + 1 : 0)).filter((x) => x);
        const [k] = until(
          () => [r.int(per + 1, 12)],
          ([k]) => {
            const g = Math.floor((k - 1) / per);
            return g * L + posIn[(k - 1) % per] <= 30 && g >= 1;
          },
        );
        const g = Math.floor((k - 1) / per);
        const pos = g * L + posIn[(k - 1) % per];
        const shown = [...unit, ...unit, ...unit].join(' ');
        const askOther = r.chance(0.5);
        if (!askOther) {
          return {
            q: `규칙에 따라 모양을 늘어놓았어요.\n${shown} …\n${tgt} 모양이 ${ORDS[k] ?? `$${k}$째`}로 나오는 것은 처음부터 몇째인가요?`.replace(`${ORDS[k]}로`, `${ORDS[k]}${'로'}`),
            answer: { type: 'num', value: pos, unit: '째' },
            steps: [
              `${unit.join(' ')} 가 되풀이돼요. 한 묶음에 $${L}$개, 그중 ${tgt}는 $${per}$개예요.`,
              `묶음마다 ${tgt}의 개수를 이어 세면: ${range(1, g + 1)
                .map((i) => `$${i * per}$`)
                .join(', ')} …`,
              `${tgt}가 $${k}$번째로 나오는 것은 ${ORDS[g + 1]} 묶음 안에서 ${ORDS[((k - 1) % per) + 1]} ${tgt}예요.`,
              `앞의 묶음 $${g}$개에 모양이 $${g * L}$개, 그다음 ${ORDS[posIn[(k - 1) % per]]} 자리`,
              `처음부터 $${pos}$째`,
            ],
            hint: '한 묶음 안에 그 모양이 몇 개 있는지 먼저 세어 보세요.',
          };
        }
        const oth = r.pick([...new Set(unit)].filter((x) => x !== tgt));
        const cntO = range(0, pos - 1).filter((i) => unit[i % L] === oth).length;
        return {
          q: `규칙에 따라 모양을 늘어놓았어요.\n${shown} …\n${tgt} 모양이 $${k}$번째로 나올 때까지 놓은 ${oth} 모양은 모두 몇 개인가요?`,
          answer: { type: 'num', value: cntO, unit: '개' },
          steps: [
            `${unit.join(' ')} 가 되풀이돼요. 한 묶음에 ${tgt}는 $${per}$개, ${oth}는 $${unit.filter((x) => x === oth).length}$개예요.`,
            `${tgt}가 $${k}$번째로 나오는 것은 처음부터 $${pos}$째예요.`,
            `처음부터 $${pos}$째까지는 한 묶음($${L}$개)이 $${Math.floor(pos / L)}$번 되풀이되고 $${pos % L}$개가 더 놓여요.`,
            `묶음마다 ${oth}가 $${unit.filter((x) => x === oth).length}$개씩 → $${Math.floor(pos / L)}$묶음에서 $${Math.floor(pos / L) * unit.filter((x) => x === oth).length}$개`,
            `더 놓인 $${pos % L}$개(${unit.slice(0, pos % L).join(' ') || '없음'})에서 $${unit.slice(0, pos % L).filter((x) => x === oth).length}$개`,
            `모두 $${cntO}$개`,
            `답: $${cntO}$개`,
          ],
          hint: '먼저 그 모양이 몇째에 나오는지 찾아보세요.',
        };
      },
    },
    {
      id: 'top-growing-diff',
      title: '커지는 수가 점점 커지는 규칙',
      gen(r): ProblemDraft {
        const [a, d, inc] = until(
          () => [r.int(1, 10), r.int(1, 3), r.pick([1, 1, 2])],
          ([a, d, inc]) => a + 7 * d + 21 * inc <= 100,
        );
        const seq = [a];
        const diffs: number[] = [];
        for (let i = 1; i < 10; i++) {
          const df = d + (i - 1) * inc;
          diffs.push(df);
          seq.push(seq[i - 1] + df);
        }
        const show = seq
          .slice(0, 4)
          .map((v) => `$${v}$`)
          .join(', ');
        if (r.chance(0.5)) {
          const k = 8;
          return {
            q: `규칙에 따라 수를 늘어놓았어요.\n${show}, …\n같은 규칙으로 이어 갈 때 ${ORDS[k]} 수는 무엇인가요?`,
            answer: { type: 'num', value: seq[k - 1] },
            steps: [
              `이웃한 두 수의 차를 구하면 ${diffs
                .slice(0, 3)
                .map((x) => `$${x}$`)
                .join(', ')} → 커지는 수가 $${inc}$씩 커져요.`,
              `커지는 수를 이어 쓰면 ${diffs
                .slice(0, k - 1)
                .map((x) => `$${x}$`)
                .join(', ')}`,
              `수를 이어 쓰면 ${seq
                .slice(0, k)
                .map((v) => `$${v}$`)
                .join(', ')}`,
              `${ORDS[k]} 수는 $${seq[k - 1]}$`,
              `답: $${seq[k - 1]}$`,
            ],
            hint: '이웃한 두 수의 차가 어떻게 변하는지 보세요.',
          };
        }
        const goal = until(
          () => r.int(30, 80),
          (g) => seq.findIndex((v) => v > g) >= 4 && seq.some((v) => v > g),
        );
        const idx = seq.findIndex((v) => v > goal);
        return {
          q: `규칙에 따라 수를 늘어놓았어요.\n${show}, …\n같은 규칙으로 이어 갈 때 처음으로 $${goal}$보다 큰 수가 나오는 것은 몇째인가요?`.replace('보다보다', '보다'),
          answer: { type: 'num', value: idx + 1, unit: '째' },
          steps: [
            `이웃한 두 수의 차: ${diffs
              .slice(0, 3)
              .map((x) => `$${x}$`)
              .join(', ')} → 커지는 수가 $${inc}$씩 커져요.`,
            `이어 쓰면 ${seq
              .slice(0, idx + 1)
              .map((v) => `$${v}$`)
              .join(', ')}`,
            `${ORDS[idx]} 수 $${seq[idx - 1]}$${jo(seq[idx - 1], '은')} $${goal}$보다 크지 않고, ${ORDS[idx + 1]} 수 $${seq[idx]}$${jo(seq[idx], '은')} $${goal}$보다 커요.`,
            `답: ${ORDS[idx + 1]}`,
          ],
          hint: '이웃한 두 수의 차를 먼저 구해 보세요.',
        };
      },
    },
  ],
};

// ───────────────────────── e1b-6 덧셈과 뺄셈(3) (받아올림·받아내림)
const e1b6: HardSet = {
  skills: [
    {
      id: 'box-range',
      title: '□ 안에 들어갈 수 있는 수 찾기',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const [a, c] = until(
            () => [r.int(3, 9), r.int(11, 16)],
            ([a, c]) => c - a + 1 >= 2 && c - a + 1 <= 9,
          );
          const ans = c - a + 1;
          return {
            q: `$${a}+\\square>${c}$ 에서 $\\square$ 안에 들어갈 수 있는 한 자리 수 중에서 가장 작은 수는 무엇인가요?`,
            answer: { type: 'num', value: ans },
            steps: [`$${a}+${c - a}=${c}$ 이므로 $\\square$는 $${c - a}$보다 커야 해요.`, `$${a}+${ans}=${a + ans}>${c}$ → 가장 작은 수는 $${ans}$`],
          };
        }
        if (level === 2) {
          const [c, k] = until(
            () => [r.int(11, 18), r.int(3, 9)],
            ([c, k]) => c - k >= 2 && c - k <= 8,
          );
          const lowB = c - k; // □ > c-k
          const cnt = 9 - lowB;
          return {
            q: `$${c}-\\square<${k}$ 에서 $\\square$ 안에 들어갈 수 있는 한 자리 수는 모두 몇 개인가요?`,
            answer: { type: 'num', value: cnt, unit: '개' },
            steps: [`$${c}-${lowB}=${k}$ 이므로 $\\square$가 $${lowB}$보다 커야 차가 $${k}$보다 작아져요.`, `들어갈 수 있는 수: ${numList(range(lowB + 1, 9))}`, `모두 $${cnt}$개`],
            hint: '빼는 수가 커질수록 차는 작아져요.',
          };
        }
        const [a, c, d, e] = until(
          () => [r.int(3, 9), r.int(10, 16), r.int(11, 18), r.int(2, 9)],
          ([a, c, d, e]) => {
            const lo = c - a; // □ > lo
            const hi = d - e; // □ < hi
            return lo >= 1 && hi <= 10 && hi - lo - 1 >= 1 && hi - lo - 1 <= 5 && d - 9 < e;
          },
        );
        const lo = c - a;
        const hi = d - e;
        const ok = range(lo + 1, hi - 1);
        return {
          q: `다음 두 식의 $\\square$ 안에 똑같이 들어갈 수 있는 한 자리 수는 모두 몇 개인가요?\n$$${a}+\\square>${c},\\qquad ${d}-\\square>${e}$$`,
          answer: { type: 'num', value: ok.length, unit: '개' },
          steps: [
            `$${a}+${lo}=${c}$ 이므로 첫째 식은 $\\square$가 $${lo}$보다 커야 해요.`,
            `$${d}-${hi}=${e}$ 이므로 둘째 식은 $\\square$가 $${hi}$보다 작아야 해요.`,
            `두 식을 모두 만족하는 수: ${numList(ok)}`,
            `모두 $${ok.length}$개`,
          ],
          hint: '먼저 □에 들어갈 수가 같아지는 경계의 수를 찾아보세요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'top-pair-count',
      title: '합이 얼마보다 큰 두 수 고르기',
      gen(r): ProblemDraft {
        const [cs, n] = until(
          () => [r.sample(range(1, 9), 6).sort((a, b) => a - b), r.int(10, 15)] as [number[], number],
          ([cs, n]) => {
            let k = 0;
            for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) if (cs[i] + cs[j] > n) k++;
            return k >= 3 && k <= 9;
          },
        );
        const by: string[] = [];
        let tot = 0;
        for (let i = 5; i >= 0; i--) {
          const part = cs.slice(0, i).filter((x) => x + cs[i] > n);
          if (part.length) by.push(`$${cs[i]}$와 짝: ${part.map((x) => `$${cs[i]}+${x}=${cs[i] + x}$`).join(', ')} → $${part.length}$가지`.replace(`$${cs[i]}$와`, `${N(cs[i], '와')}`));
          tot += part.length;
        }
        return {
          q: `수 카드 ${cardList(r.shuffle(cs))} 중에서 두 장을 골라 더하려고 해요. 두 수의 합이 $${n}$보다 큰 경우는 모두 몇 가지인가요? (고른 두 장이 같으면 같은 경우예요.)`.replace(
            '보다보다',
            '보다',
          ),
          answer: { type: 'num', value: tot, unit: '가지' },
          steps: [`큰 수부터 하나씩 정하고, 그보다 작은 수 중에서 짝이 될 수 있는 수를 찾아요.`, ...by, `모두 $${tot}$가지`],
          hint: '가장 큰 수부터 짝을 지어 보세요. 같은 두 장을 두 번 세지 않게 조심해요.',
        };
      },
    },
    {
      id: 'top-make-equal',
      title: '주고받아 똑같이 만들기',
      gen(r): ProblemDraft {
        const [p1, p2] = names(r, 2);
        const [thing, u] = r.pick(THINGS.filter(([, u]) => u === '개' || u === '장'));
        if (r.chance(0.5)) {
          const [a, b] = until(
            () => [r.int(9, 18), r.int(2, 9)],
            ([a, b]) => (a - b) % 2 === 0 && a - b >= 4 && a - b <= 12,
          );
          const d = a - b;
          const x = d / 2;
          const chain = range(0, x).map((i) => `$${d - 2 * i}$`);
          return {
            q: `${J(p1, '는')} ${thing} $${a}$${u}, ${J(p2, '는')} $${b}$${u}${jo(u, '를')} 가지고 있어요. ${J(p1, '가')} ${p2}에게 ${thing} 몇 ${u}${jo(u, '를')} 주면 두 사람이 가진 ${thing}의 수가 같아지나요?`,
            answer: { type: 'num', value: x, unit: u },
            steps: [
              `처음 두 사람의 차: $${a}-${b}=${d}$`,
              `${J(p1, '가')} $1$${u} 주면 ${p1}는 $1$${u} 줄고 ${p2}는 $1$${u} 늘어서 차가 $2$씩 줄어요.`,
              `차: ${chain.join(' → ')}`,
              `$${x}$${u}${jo(u, '을')} 주면 두 사람 모두 $${a - x}$${u}`,
              `답: $${x}$${u}`,
            ],
            hint: '하나를 주면 차이는 2만큼 줄어요.',
          };
        }
        const [x, e] = until(
          () => [r.int(3, 8), r.pick([0, 2, 4])],
          ([x, e]) => 2 * x - e >= 2,
        );
        const d0 = 2 * x - e;
        return {
          q: `${J(p1, '는')} ${p2}보다 ${thing}${jo(thing, '을')} 더 많이 가지고 있었어요. ${J(p1, '가')} ${p2}에게 ${thing} $${x}$${u}${jo(u, '를')} 주었더니 ${e === 0 ? '두 사람이 가진 수가 같아졌어요' : `${J(p2, '가')} ${p1}보다 $${e}$${u} 더 많아졌어요`}. 처음에 ${J(p1, '는')} ${p2}보다 ${thing}${jo(thing, '을')} 몇 ${u} 더 많이 가지고 있었나요?`,
          answer: { type: 'num', value: d0, unit: u },
          steps: [
            `$1$${u}씩 줄 때마다 두 사람의 차는 $2$씩 줄어들어요.`,
            `$${x}$${u}${jo(u, '을')} 주면 차가 $2$씩 $${x}$번 줄어 모두 $${range(1, x)
              .map(() => '2')
              .join('+')}=${2 * x}$만큼 줄어요.`,
            e === 0
              ? `준 뒤에 차가 $0$이 되었으니 처음 차는 $${2 * x}$`
              : `준 뒤에는 ${p2}가 $${e}$${u} 더 많으니, ${p1}가 더 많던 차 $${2 * x - e}$${u}가 $${2 * x}$만큼 줄어 거꾸로 $${e}$${u}가 되었어요.`,
            e === 0 ? `확인: 차 $${d0}$에서 $2$씩 $${x}$번 줄면 $0$` : `확인: $${d0}+${e}=${2 * x}$`,
            `답: $${d0}$${u}`,
          ],
          hint: '1개를 줄 때마다 두 사람의 차가 얼마나 줄어드는지 생각해 보세요.',
        };
      },
    },
  ],
};

export const HARD_1: Record<string, HardSet> = {
  'e1a-1': e1a1,
  'e1a-2': e1a2,
  'e1a-3': e1a3,
  'e1a-4': e1a4,
  'e1a-5': e1a5,
  'e1b-1': e1b1,
  'e1b-2': e1b2,
  'e1b-3': e1b3,
  'e1b-4': e1b4,
  'e1b-5': e1b5,
  'e1b-6': e1b6,
};
