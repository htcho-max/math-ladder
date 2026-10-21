// 초2 심화 유형(skills 끝에 덧붙임)과 최상위 유형(top) — e2a.ts / e2b.ts 에서 합침
import type { ProblemDraft } from '../../core/types';
import type { Rng } from '../../core/rng';
import { makeChoices } from '../../core/tex';
import { Svg } from '../../core/fig';
import { J, N, jo, names, textChoices, lv, THINGS } from './util';
import { ORDS } from './words1';
import { type HardSet, until, numList, cardList, range } from './hard1';

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const digitsOf = (n: number) => String(n).split('').map(Number);

/** 수 카드로 만들 수 있는 k자리 수 (맨 앞 0 제외, 카드 한 번씩) */
function makeNums(cs: number[], k: number): number[] {
  const out = new Set<number>();
  const rec = (used: boolean[], cur: number[]) => {
    if (cur.length === k) {
      if (cur[0] !== 0) out.add(Number(cur.join('')));
      return;
    }
    cs.forEach((c, i) => {
      if (used[i]) return;
      used[i] = true;
      cur.push(c);
      rec(used, cur);
      cur.pop();
      used[i] = false;
    });
  };
  rec(
    cs.map(() => false),
    [],
  );
  return [...out].sort((a, b) => a - b);
}

/** 자릿수 단서로 하나로 정해지는 수 (풀이 순서대로 단서를 만듦) */
function digitPuzzle(r: Rng, nd: 3 | 4): { n: number; clues: string[]; steps: string[] } {
  const PN = nd === 3 ? ['백의 자리', '십의 자리', '일의 자리'] : ['천의 자리', '백의 자리', '십의 자리', '일의 자리'];
  return until(
    () => {
      const d = range(1, nd).map(() => r.int(0, 9));
      if (d[0] === 0) d[0] = r.int(1, 9);
      const order = r.shuffle(range(0, nd - 1));
      const clues: string[] = [];
      const steps: string[] = [];
      let ok = true;
      const known: number[] = [];
      order.forEach((p, idx) => {
        const v = d[p];
        if (idx === 0) {
          // 범위 + 짝수/홀수 로 하나
          if (v >= 2 && v <= 7 && r.chance(0.6)) {
            const par = v % 2 === 0 ? '짝수' : '홀수';
            clues.push(`${PN[p]} 숫자는 $${v - 2}$보다 크고 $${v + 2}$보다 작은 ${par}예요.`);
            steps.push(`${PN[p]}: $${v - 2}$과 $${v + 2}$ 사이의 수 $${v - 1}$, $${v}$, $${v + 1}$ 중 ${par}는 $${v}$`.replace(`$${v - 2}$과`, `${N(v - 2, '과')}`));
          } else if (v >= 1 && v <= 8) {
            clues.push(`${PN[p]} 숫자는 $${v - 1}$보다 크고 $${v + 1}$보다 작아요.`.replace('보다보다', '보다'));
            steps.push(`${PN[p]}: $${v - 1}$보다 크고 $${v + 1}$보다 작은 숫자는 $${v}$`);
          } else {
            clues.push(`${PN[p]} 숫자는 ${N(v, '이에요')}.`.replace(/\$(\d)\$(이에요|예요)/, (_m, x) => `$${x}$${jo(Number(x), '이에요')}`));
            steps.push(`${PN[p]}: $${v}$`);
          }
        } else if (idx < nd - 1) {
          const q = r.pick(known);
          const diff = v - d[q];
          if (diff === 0) {
            clues.push(`${PN[p]} 숫자는 ${PN[q]} 숫자와 같아요.`);
            steps.push(`${PN[p]}: ${PN[q]}와 같으니 $${v}$`);
          } else {
            clues.push(`${PN[p]} 숫자는 ${PN[q]} 숫자보다 $${Math.abs(diff)}$만큼 더 ${diff > 0 ? '커요' : '작아요'}.`);
            steps.push(`${PN[p]}: $${d[q]}${diff > 0 ? '+' : '-'}${Math.abs(diff)}=${v}$`);
          }
        } else {
          const s = sum(d);
          if (s < 2) ok = false;
          clues.push(`각 자리 숫자를 모두 더하면 $${s}$${jo(s, '이에요')}.`);
          const others = known.map((q) => d[q]);
          steps.push(`${PN[p]}: $${s}-${others.join('-')}=${v}$`);
        }
        known.push(p);
      });
      const n = Number(d.join(''));
      return { n, clues, steps, ok };
    },
    (x) => x.ok,
  );
}

const PN4 = ['천', '백', '십', '일'];

// ───────────────────────── e2a-1 세 자리 수
const e2a1: HardSet = {
  skills: [
    {
      id: 'card-3digit',
      title: '수 카드로 세 자리 수 만들기',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const cs = r.sample(range(1, 9), 3);
          const big = r.chance(0.5);
          const s = [...cs].sort((a, b) => (big ? b - a : a - b));
          const v = Number(s.join(''));
          return {
            q: `수 카드 ${cardList(cs)}${jo(cs[2], '을')} 한 번씩 모두 사용하여 세 자리 수를 만들려고 해요. 만들 수 있는 가장 ${big ? '큰' : '작은'} 수는 무엇인가요?`,
            answer: { type: 'num', value: v },
            steps: [`백의 자리부터 ${big ? '큰' : '작은'} 수를 차례로 놓아요.`, `${big ? '큰' : '작은'} 수부터: ${cardList(s)}`, `가장 ${big ? '큰' : '작은'} 수는 $${v}$`],
          };
        }
        if (level === 2) {
          const cs = r.shuffle([0, ...r.sample(range(1, 9), 3)]);
          const all = makeNums(cs, 3);
          const small = r.chance(0.5);
          const v = small ? all[0] : all[all.length - 2];
          return {
            q: `수 카드 ${cardList(cs)} 중에서 세 장을 골라 한 번씩만 사용하여 세 자리 수를 만들려고 해요. 만들 수 있는 ${small ? '가장 작은 수' : '수 중에서 둘째로 큰 수'}는 무엇인가요?`,
            answer: { type: 'num', value: v },
            steps: small
              ? [`$0$은 백의 자리에 올 수 없어요.`, `백의 자리: $0$이 아닌 가장 작은 수 $${digitsOf(v)[0]}$`, `십의 자리, 일의 자리: 남은 수 중 작은 수부터 → $${v}$`]
              : [`가장 큰 수: $${all[all.length - 1]}$`, `백의 자리와 십의 자리는 그대로 두고, 일의 자리만 남은 카드의 수로 바꾸면 $${v}$`, `둘째로 큰 수는 $${v}$`],
            hint: small ? '0은 맨 앞에 올 수 없어요.' : '가장 큰 수를 먼저 만들어 보세요.',
          };
        }
        const [cs, lo, hi] = until(
          () => {
            const cs = r.sample(range(0, 9), 4);
            const lo = r.int(1, 7) * 100;
            return [cs, lo, lo + r.int(2, 3) * 100] as [number[], number, number];
          },
          ([cs, lo, hi]) => {
            const k = makeNums(cs, 3).filter((n) => n > lo && n < hi).length;
            return hi <= 1000 && k >= 3 && k <= 12;
          },
        );
        const ok = makeNums(cs, 3).filter((n) => n > lo && n < hi);
        const hs = [...new Set(ok.map((n) => Math.floor(n / 100)))];
        return {
          q: `수 카드 ${cardList(cs)} 중에서 세 장을 골라 한 번씩만 사용하여 세 자리 수를 만들려고 해요. 만들 수 있는 수 중에서 $${lo}$보다 크고 $${hi}$보다 작은 수는 모두 몇 개인가요?`.replace(
            '보다보다',
            '보다',
          ),
          answer: { type: 'num', value: ok.length, unit: '개' },
          steps: [
            `백의 자리 숫자가 ${hs.map((h) => `$${h}$`).join(', ')}인 수만 생각하면 돼요.`.replace(/\$(\d)\$인 수/, (_m, x) => `$${x}$인 수`),
            ...hs.map((h) => {
              const g = ok.filter((n) => Math.floor(n / 100) === h);
              return `백의 자리가 $${h}$: ${numList(g)} → $${g.length}$개`;
            }),
            `모두 $${ok.length}$개`,
          ],
          hint: '백의 자리 숫자를 먼저 정하고 나머지 자리를 차례로 바꾸어 보세요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'top-clue-3digit',
      title: '조건을 모두 만족하는 세 자리 수',
      gen(r): ProblemDraft {
        const { n, clues, steps } = digitPuzzle(r, 3);
        return {
          q: `다음을 모두 만족하는 세 자리 수는 무엇인가요?\n${r
            .shuffle(clues)
            .map((c) => `- ${c}`)
            .join('\n')}`,
          answer: { type: 'num', value: n },
          steps: ['바로 알 수 있는 자리부터 차례로 구해요.', ...steps, `세 자리 수는 $${n}$`],
          hint: '다른 자리와 관계없이 바로 정해지는 자리부터 찾아보세요.',
        };
      },
    },
    {
      id: 'top-money-ways',
      title: '동전으로 금액을 만드는 방법의 수',
      gen(r): ProblemDraft {
        const [p] = names(r, 1);
        const [T, c1, c2, c3, ways] = until(
          () => {
            const T = r.int(15, 45) * 10;
            const c1 = r.int(1, 4);
            const c2 = r.int(1, 4);
            const c3 = r.int(5, 15);
            const ways: number[][] = [];
            for (let x = 0; x <= c1; x++)
              for (let y = 0; y <= c2; y++) {
                const rest = T - 100 * x - 50 * y;
                if (rest >= 0 && rest % 10 === 0 && rest / 10 <= c3) ways.push([x, y, rest / 10]);
              }
            return [T, c1, c2, c3, ways] as [number, number, number, number, number[][]];
          },
          ([, , , , w]) => w.length >= 3 && w.length <= 5,
        );
        return {
          q: `${J(p, '는')} $100$원짜리 동전 $${c1}$개, $50$원짜리 동전 $${c2}$개, $10$원짜리 동전 $${c3}$개를 가지고 있어요. 이 동전으로 $${T}$원을 만드는 방법은 모두 몇 가지인가요? (쓰지 않는 동전이 있어도 돼요.)`,
          answer: { type: 'num', value: ways.length, unit: '가지' },
          steps: [
            `큰 동전부터 개수를 정하고, 남은 금액을 작은 동전으로 채울 수 있는지 살펴봐요.`,
            ...ways.map(([x, y, z]) => `$100$원 $${x}$개, $50$원 $${y}$개, $10$원 $${z}$개 → $${100 * x}+${50 * y}+${10 * z}=${T}$`),
            `$10$원짜리가 $${c3}$개보다 많이 필요한 방법은 안 돼요.`,
            `모두 $${ways.length}$가지`,
          ],
          hint: '100원짜리를 몇 개 쓸지부터 정해 보세요.',
        };
      },
    },
  ],
};

// ───────────────────────── e2a-2 여러 가지 도형
const POLY = ['', '', '', '삼각형', '사각형', '오각형', '육각형'];
function stripFig(k: number, rows: number): string {
  const w = 40;
  const h = 34;
  const s = new Svg(k * w + 12, rows * h + 12);
  s.rect(6, 6, k * w, rows * h, { cls: 'acc' });
  for (let i = 1; i < k; i++) s.line(6 + i * w, 6, 6 + i * w, 6 + rows * h, { cls: 'acc' });
  for (let j = 1; j < rows; j++) s.line(6, 6 + j * h, 6 + k * w, 6 + j * h, { cls: 'acc' });
  return s.toString();
}
function fanFig(k: number): string {
  const w = 40;
  const W = k * w;
  const s = new Svg(W + 12, 112);
  const ax = 6 + W / 2;
  const pts: [number, number][] = [
    [ax, 6],
    [6, 104],
    [6 + W, 104],
  ];
  s.poly(pts, { cls: 'acc', closed: true });
  for (let i = 1; i < k; i++) s.line(ax, 6, 6 + i * w, 104, { cls: 'acc' });
  return s.toString();
}

const e2a2: HardSet = {
  skills: [
    {
      id: 'cut-corner',
      title: '꼭짓점을 잘라 낸 도형',
      gen(r, level): ProblemDraft {
        const note = '(자른 선은 다른 꼭짓점이나 다른 자른 선을 지나지 않아요.)';
        if (level === 1) {
          const n = r.int(3, 5);
          return {
            q: `${POLY[n]} 모양 종이의 꼭짓점 한 개를 가위로 곧게 잘라 냈어요. ${note} 남은 종이는 어떤 도형인가요?`,
            answer: textChoices(
              r,
              POLY[n + 1],
              [3, 4, 5, 6].filter((x) => x !== n + 1).map((x) => POLY[x]),
              4,
            ),
            steps: [`꼭짓점 하나를 자르면 그 꼭짓점은 없어지고 새 꼭짓점이 $2$개 생겨요.`, `꼭짓점이 $${n}$개에서 $${n + 1}$개가 돼요.`, `꼭짓점이 $${n + 1}$개인 도형은 ${POLY[n + 1]}`],
          };
        }
        if (level === 2) {
          const n = r.int(3, 6);
          const k = r.int(2, 3);
          return {
            q: `${POLY[n]} 모양 종이의 꼭짓점 $${k}$개를 가위로 하나씩 곧게 잘라 냈어요. ${note} 남은 종이의 꼭짓점은 몇 개인가요?`,
            answer: { type: 'num', value: n + k, unit: '개' },
            steps: [
              `꼭짓점 하나를 자를 때마다 꼭짓점이 $1$개씩 늘어요. (하나 없어지고 $2$개 생김)`,
              `$${n}+${k}=${n + k}$ → $${n + k}$개`,
              n + k <= 6 ? `남은 종이는 ${POLY[n + k]}${jo(POLY[n + k], '이에요')}.` : `남은 종이는 꼭짓점이 $${n + k}$개인 도형이에요.`,
            ],
            hint: '꼭짓점 하나를 자르면 꼭짓점이 몇 개 없어지고 몇 개 생기는지 생각해요.',
          };
        }
        const [n1, k1, n2, k2] = until(
          () => [r.int(3, 6), r.int(1, 3), r.int(3, 6), r.int(1, 3)],
          ([n1, k1, n2, k2]) => k1 <= n1 && k2 <= n2 && n1 !== n2 && n1 + k1 <= 8 && n2 + k2 <= 8,
        );
        const a = n1 + k1;
        const b = n2 + k2;
        return {
          q: `${POLY[n1]} 모양 종이의 꼭짓점 $${k1}$개와 ${POLY[n2]} 모양 종이의 꼭짓점 $${k2}$개를 각각 가위로 하나씩 곧게 잘라 냈어요. ${note} 남은 두 종이의 변의 수를 모두 더하면 몇 개인가요?`,
          answer: { type: 'num', value: a + b, unit: '개' },
          steps: [
            `꼭짓점 하나를 자를 때마다 변과 꼭짓점이 $1$개씩 늘어요.`,
            `${POLY[n1]}: 변 $${n1}$개 → $${n1}+${k1}=${a}$ (개)`,
            `${POLY[n2]}: 변 $${n2}$개 → $${n2}+${k2}=${b}$ (개)`,
            `모두 $${a}+${b}=${a + b}$ → $${a + b}$개`,
          ],
          hint: '도형에서 변의 수와 꼭짓점의 수는 같아요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'top-count-fig',
      title: '크고 작은 도형의 개수 세기',
      gen(r): ProblemDraft {
        const kind = r.int(0, 2);
        const k = kind === 2 ? r.int(2, 3) : r.int(3, 5);
        const tri = (m: number) => (m * (m + 1)) / 2;
        const sizes = range(1, k).map((s) => k - s + 1);
        if (kind < 2) {
          const nm = kind === 0 ? '사각형' : '삼각형';
          return {
            q: `그림에서 찾을 수 있는 크고 작은 ${nm}은 모두 몇 개인가요?`,
            fig: kind === 0 ? stripFig(k, 1) : fanFig(k),
            answer: { type: 'num', value: tri(k), unit: '개' },
            steps: [
              `가장 작은 ${nm}이 $${k}$개 있어요. 작은 ${nm} 몇 개로 이루어졌는지에 따라 나누어 세요.`,
              ...sizes.map((c, i) => `작은 ${nm} $${i + 1}$개짜리: $${c}$개`),
              `모두 $${sizes.join('+')}=${tri(k)}$ → $${tri(k)}$개`,
            ],
            hint: '작은 도형 1개짜리, 2개짜리, … 로 나누어 빠짐없이 세어 보세요.',
          };
        }
        const one = tri(k);
        return {
          q: `그림에서 찾을 수 있는 크고 작은 사각형은 모두 몇 개인가요?`,
          fig: stripFig(k, 2),
          answer: { type: 'num', value: 3 * one, unit: '개' },
          steps: [
            `위 칸만으로 된 사각형, 아래 칸만으로 된 사각형, 위아래 두 칸에 걸친 사각형으로 나누어 세요.`,
            `한 줄에서 찾을 수 있는 사각형: ${sizes.map((c, i) => `$${i + 1}$칸짜리 $${c}$개`).join(', ')} → $${one}$개`,
            `위 줄 $${one}$개, 아래 줄 $${one}$개`,
            `위아래 두 줄에 걸친 사각형도 한 줄처럼 $${one}$개`,
            `모두 $${one}+${one}+${one}=${3 * one}$ → $${3 * one}$개`,
          ],
          hint: '위 줄, 아래 줄, 두 줄에 걸친 것으로 나누어 세어 보세요.',
        };
      },
    },
    {
      id: 'top-poly-mix',
      title: '꼭짓점 수로 도형의 개수 알아내기',
      gen(r): ProblemDraft {
        const [p] = names(r, 1);
        type Rel = { text: string; ok: (c: number[]) => boolean };
        const [cnt, rel] = until(
          () => {
            const c = [r.int(1, 4), r.int(1, 4), r.int(1, 3)]; // 삼각형, 사각형, 오각형
            const i = r.int(0, 2);
            const j = (i + r.int(1, 2)) % 3;
            const d = c[i] - c[j];
            const nm = ['삼각형', '사각형', '오각형'];
            const rel: Rel =
              d === 0
                ? {
                    text: `${nm[i]}과 ${nm[j]}의 수는 같아요.`.replace(`${nm[i]}과`, J(nm[i], '과')),
                    ok: (x) => x[i] === x[j],
                  }
                : {
                    text: `${J(nm[i], '은')} ${nm[j]}보다 $${Math.abs(d)}$개 더 ${d > 0 ? '많아요' : '적어요'}.`,
                    ok: (x) => x[i] - x[j] === d,
                  };
            return [c, rel] as [number[], Rel];
          },
          ([c, rel]) => {
            const n = sum(c);
            const K = 3 * c[0] + 4 * c[1] + 5 * c[2];
            let k = 0;
            for (let a = 0; a <= n; a++)
              for (let b = 0; a + b <= n; b++) {
                const x = [a, b, n - a - b];
                if (x.every((v) => v >= 1) && 3 * a + 4 * b + 5 * x[2] === K && rel.ok(x)) k++;
              }
            return k === 1 && n <= 9;
          },
        );
        const n = sum(cnt);
        const K = 3 * cnt[0] + 4 * cnt[1] + 5 * cnt[2];
        const askI = r.int(0, 2);
        const nm = ['삼각형', '사각형', '오각형'];
        const tries: string[] = [];
        for (let a = 1; a <= n; a++)
          for (let b = 1; a + b < n; b++) {
            const x = [a, b, n - a - b];
            if (!rel.ok(x)) continue;
            const k = 3 * a + 4 * b + 5 * x[2];
            if (tries.length < 4 || k === K) tries.push(`삼각형 $${a}$개, 사각형 $${b}$개, 오각형 $${x[2]}$개 → 꼭짓점 $${k}$개${k === K ? ' (맞아요)' : ''}`);
          }
        const tr = tries.length > 5 ? [...tries.slice(0, 3), ...tries.filter((t) => t.includes('맞아요'))] : tries;
        return {
          q: `${J(p, '는')} 삼각형, 사각형, 오각형을 모두 $${n}$개 그렸어요. 그린 도형의 꼭짓점은 모두 $${K}$개이고, ${rel.text} ${p}가 그린 ${J(nm[askI], '은')} 몇 개인가요? (세 가지 도형을 모두 $1$개 이상 그렸어요.)`,
          answer: { type: 'num', value: cnt[askI], unit: '개' },
          steps: [
            `삼각형은 꼭짓점 $3$개, 사각형은 $4$개, 오각형은 $5$개예요.`,
            `'${rel.text.replace(/\.$/, '')}'를 지키면서 모두 $${n}$개가 되는 경우를 차례로 따져 봐요.`,
            ...[...new Set(tr)],
            `${J(nm[askI], '은')} $${cnt[askI]}$개`,
          ],
          hint: '관계를 지키는 경우를 표로 만들어 꼭짓점 수를 세어 보세요.',
        };
      },
    },
  ],
};

// ───────────────────────── e2a-3 덧셈과 뺄셈 (받아올림·받아내림)
const e2a3: HardSet = {
  skills: [
    {
      id: 'card-two-sum',
      title: '수 카드로 만든 두 수의 합과 차',
      gen(r, level): ProblemDraft {
        if (level < 3) {
          const cs = level === 1 ? r.sample(range(1, 9), 3) : r.sample(range(0, 9), 4);
          const all = makeNums(cs, 2);
          const B = all[all.length - 1];
          const S = all[0];
          const add = level === 1;
          return {
            q: `수 카드 ${cardList(cs)} 중에서 두 장을 골라 한 번씩만 사용하여 두 자리 수를 만들려고 해요. 만들 수 있는 가장 큰 수와 가장 작은 수의 ${add ? '합은' : '차는'} 얼마인가요?`,
            answer: { type: 'num', value: add ? B + S : B - S },
            steps: [
              `가장 큰 수: 큰 수부터 두 장 → $${B}$`,
              cs.includes(0) ? `가장 작은 수: $0$은 십의 자리에 올 수 없으니 → $${S}$` : `가장 작은 수: 작은 수부터 두 장 → $${S}$`,
              add ? `$${B}+${S}=${B + S}$` : `$${B}-${S}=${B - S}$`,
            ],
            hint: cs.includes(0) ? '0은 십의 자리에 올 수 없어요.' : undefined,
          };
        }
        const big = r.chance(0.5);
        const cs = big ? r.sample(range(1, 9), 4) : r.shuffle([0, ...r.sample(range(1, 9), 3)]);
        let best = big ? -1 : 999;
        let pair: [number, number] = [0, 0];
        const perm = (a: number[]): number[][] => (a.length <= 1 ? [a] : a.flatMap((x, i) => perm([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p])));
        for (const p of perm(cs)) {
          if (p[0] === 0 || p[2] === 0) continue;
          const x = 10 * p[0] + p[1];
          const y = 10 * p[2] + p[3];
          if (x < y) continue;
          if (big ? x + y > best : x + y < best) {
            best = x + y;
            pair = [x, y];
          }
        }
        const s = [...cs].sort((a, b) => b - a);
        return {
          q: `수 카드 ${cardList(cs)}${jo(cs[3], '을')} 한 번씩 모두 사용하여 두 자리 수를 $2$개 만들려고 해요. 두 수의 합이 가장 ${big ? '클' : '작을'} 때의 합은 얼마인가요?`,
          answer: { type: 'num', value: best },
          steps: big
            ? [`합이 크려면 십의 자리에 큰 수가 와야 해요.`, `십의 자리: $${s[0]}$, $${s[1]}$ / 일의 자리: $${s[2]}$, $${s[3]}$`, `예: $${pair[0]}+${pair[1]}=${best}$`, `가장 큰 합은 $${best}$`]
            : [
                `합이 작으려면 십의 자리에 작은 수가 와야 하지만 $0$은 십의 자리에 올 수 없어요.`,
                `십의 자리: $${Math.floor(pair[0] / 10)}$, $${Math.floor(pair[1] / 10)}$ / 일의 자리: 나머지 두 수`,
                `예: $${pair[0]}+${pair[1]}=${best}$`,
                `가장 작은 합은 $${best}$`,
              ],
          hint: '십의 자리 숫자가 합에 더 큰 영향을 줘요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'top-cryptarith',
      title: '덧셈식·뺄셈식의 가려진 숫자 알아내기',
      gen(r): ProblemDraft {
        if (r.chance(0.5)) {
          const [A, B] = until(
            () => [r.int(11, 89), r.int(11, 89)],
            ([A, B]) => (A % 10) + (B % 10) >= 10 && A % 10 !== 0 && Math.floor(B / 10) !== 0,
          );
          const S = A + B;
          const [a1, a0] = [Math.floor(A / 10), A % 10];
          const [b1, b0] = [Math.floor(B / 10), B % 10];
          const s0 = S % 10;
          const sTop = Math.floor(S / 10);
          return {
            q: `㉠과 ㉡에 알맞은 숫자를 각각 구하세요.\n$${a1}$㉠ + ㉡$${b0}$ = $${S}$`,
            answer: {
              type: 'fields',
              fields: [
                { label: '㉠', value: a0 },
                { label: '㉡', value: b1 },
              ],
            },
            steps: [
              `일의 자리: ㉠ $+${b0}$의 일의 자리 숫자가 $${s0}$이어야 해요.`.replace(`$${s0}$이어야`, `$${s0}$${jo(s0, '이')}어야`),
              `㉠ $+${b0}=${s0}$이 될 수 없으니 받아올림이 있어요: ㉠ $+${b0}=${10 + s0}$ → ㉠ $=${a0}$`.replace(`$=${s0}$이`, `$=${s0}$${jo(s0, '이')}`),
              `십의 자리: 받아올린 $1$과 함께 $${a1}+$ ㉡ $+1=${sTop}$`,
              `㉡ $=${sTop}-${a1}-1=${b1}$`,
              `확인: $${A}+${B}=${S}$`,
            ],
            hint: '일의 자리부터 생각하고, 받아올림이 있는지 살펴보세요.',
          };
        }
        const [A, B] = until(
          () => [r.int(30, 98), r.int(11, 79)],
          ([A, B]) => A - B >= 10 && A % 10 < B % 10,
        );
        const D = A - B;
        const [a1, a0] = [Math.floor(A / 10), A % 10];
        const [b1, b0] = [Math.floor(B / 10), B % 10];
        const [d1, d0] = [Math.floor(D / 10), D % 10];
        return {
          q: `㉠과 ㉡에 알맞은 숫자를 각각 구하세요.\n㉠$${a0}$ − $${b1}$㉡ = $${D}$`,
          answer: {
            type: 'fields',
            fields: [
              { label: '㉠', value: a1 },
              { label: '㉡', value: b0 },
            ],
          },
          steps: [
            `일의 자리: $${a0}-$ ㉡의 일의 자리가 $${d0}$이 되어야 해요.`.replace(`$${d0}$이 되어야`, `$${d0}$${jo(d0, '이')} 되어야`),
            `$${a0}$에서 바로 빼서 $${d0}$${jo(d0, '이')} 될 수 없으니 십의 자리에서 $10$을 받아내려요: $${10 + a0}-$ ㉡ $=${d0}$ → ㉡ $=${b0}$`,
            `십의 자리: 받아내려 주고 남은 ㉠ $-1$에서 $${b1}$${jo(b1, '을')} 빼면 $${d1}$`,
            `㉠ $-1=${d1}+${b1}=${d1 + b1}$ → ㉠ $=${a1}$`,
            `확인: $${A}-${B}=${D}$`,
          ],
          hint: '일의 자리에서 받아내림이 있었는지 먼저 살펴보세요.',
        };
      },
    },
    {
      id: 'top-swap-mistake',
      title: '숫자를 바꾸어 잘못 계산한 문제',
      gen(r): ProblemDraft {
        const add = r.chance(0.5);
        const [x, a] = until(
          () => [r.int(20, 99), r.int(12, 98)],
          ([x, a]) => {
            const a1 = Math.floor(a / 10);
            const a0 = a % 10;
            if (a0 === 0 || a1 === a0) return false;
            const ar = 10 * a0 + a1;
            if (add) return x + ar <= 198 && x + a <= 198 && x + ar >= 10;
            return x - ar >= 1 && x - a >= 1;
          },
        );
        const ar = 10 * (a % 10) + Math.floor(a / 10);
        const w = add ? x + ar : x - ar;
        const right = add ? x + a : x - a;
        const [p] = names(r, 1);
        return {
          q: `${J(p, '는')} 어떤 수에${add ? '' : '서'} ${N(a, '을')} ${add ? '더해야' : '빼야'} 할 것을 잘못하여 $${a}$의 십의 자리 숫자와 일의 자리 숫자를 바꾼 수를 ${add ? '더했더니' : '뺐더니'} ${N(w, '이')} 되었어요. 바르게 계산하면 얼마인가요?`.replace(
            `$${a}$의`,
            `$${a}$의`,
          ),
          answer: { type: 'num', value: right },
          steps: [
            `$${a}$의 두 숫자를 바꾼 수는 $${ar}$`,
            add ? `잘못한 계산: 어떤 수 $+${ar}=${w}$` : `잘못한 계산: 어떤 수 $-${ar}=${w}$`,
            add ? `어떤 수: $${w}-${ar}=${x}$` : `어떤 수: $${w}+${ar}=${x}$`,
            add ? `바른 계산: $${x}+${a}=${right}$` : `바른 계산: $${x}-${a}=${right}$`,
            `바르게 계산하면 $${right}$`,
          ],
          hint: '먼저 잘못 사용한 수가 무엇인지 쓰고, 어떤 수를 구해요.',
        };
      },
    },
  ],
};

// ───────────────────────── e2a-4 길이 재기
const TAPE = ['색 테이프', '종이띠', '리본'];
const e2a4: HardSet = {
  skills: [
    {
      id: 'tape-overlap',
      title: '겹쳐서 이어 붙인 길이',
      gen(r, level): ProblemDraft {
        const t = r.pick(TAPE);
        if (level === 1) {
          const [a, b, c] = until(
            () => [r.int(10, 30), r.int(10, 30), r.int(2, 6)],
            ([a, b]) => a !== b,
          );
          return {
            q: `길이가 $${a}$ cm, $${b}$ cm인 ${t} 두 장을 $${c}$ cm만큼 겹쳐서 길게 이어 붙였어요. 이어 붙인 ${t}의 전체 길이는 몇 cm인가요?`.replace(`${t}의`, `${t}의`),
            answer: { type: 'num', value: a + b - c, unit: 'cm' },
            steps: [`두 장의 길이를 더하면 $${a}+${b}=${a + b}$ (cm)`, `겹친 부분은 두 번 더해졌으니 한 번 빼요.`, `$${a + b}-${c}=${a + b - c}$ → $${a + b - c}$ cm`],
          };
        }
        if (level === 2) {
          const [a, b, c] = until(
            () => [r.int(15, 40), r.int(15, 40), r.int(3, 9)],
            ([a, b]) => a !== b,
          );
          const T = a + b - c;
          return {
            q: `길이가 $${a}$ cm, $${b}$ cm인 ${t} 두 장을 겹쳐서 길게 이어 붙였더니 전체 길이가 $${T}$ cm가 되었어요. 몇 cm만큼 겹쳐서 붙였나요?`,
            answer: { type: 'num', value: c, unit: 'cm' },
            steps: [`겹치지 않게 이으면 $${a}+${b}=${a + b}$ (cm)`, `겹친 만큼 짧아졌어요.`, `$${a + b}-${T}=${c}$ → $${c}$ cm`],
            hint: '겹치지 않게 이었을 때의 길이와 비교해요.',
          };
        }
        const [a, c] = [r.int(12, 30), r.int(2, 6)];
        const T = 3 * a - 2 * c;
        return {
          q: `길이가 $${a}$ cm인 ${t} $3$장을 $${c}$ cm씩 겹쳐서 한 줄로 길게 이어 붙였어요. 이어 붙인 ${t}의 전체 길이는 몇 cm인가요?`,
          answer: { type: 'num', value: T, unit: 'cm' },
          steps: [`$3$장의 길이: $${a}+${a}+${a}=${3 * a}$ (cm)`, `$3$장을 한 줄로 이으면 겹친 곳은 $2$군데예요.`, `겹친 길이: $${c}+${c}=${2 * c}$ (cm)`, `$${3 * a}-${2 * c}=${T}$ → $${T}$ cm`],
          hint: '3장을 이으면 겹치는 곳은 몇 군데인지 세어 보세요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'top-gaps',
      title: '간격을 두고 놓은 물건의 길이',
      gen(r): ProblemDraft {
        const kind = r.int(0, 2);
        if (kind < 2) {
          const [n, a, g] = until(
            () => [r.int(3, 5), r.int(3, 9), r.int(2, 6)],
            ([n, a, g]) => n * a + (n - 1) * g <= 80,
          );
          const T = n * a + (n - 1) * g;
          const blocks = Array(n).fill(a).join('+');
          const gaps = Array(n - 1)
            .fill(g)
            .join('+');
          const thing = r.pick(['나무 블록', '지우개', '상자']);
          if (kind === 0) {
            return {
              q: `길이가 $${a}$ cm인 ${thing} $${n}$개를 $${g}$ cm씩 사이를 띄어 한 줄로 늘어놓았어요. 첫째 ${thing}의 왼쪽 끝에서 마지막 ${thing}의 오른쪽 끝까지의 길이는 몇 cm인가요?`,
              answer: { type: 'num', value: T, unit: 'cm' },
              steps: [
                `${thing} $${n}$개를 한 줄로 놓으면 사이(간격)는 $${n - 1}$군데예요.`,
                `${thing} 길이의 합: $${blocks}=${n * a}$ (cm)`,
                `간격의 합: $${gaps}=${(n - 1) * g}$ (cm)`,
                `$${n * a}+${(n - 1) * g}=${T}$ → $${T}$ cm`,
                `답: $${T}$ cm`,
              ],
              hint: '물건이 4개이면 사이는 3군데예요.',
            };
          }
          return {
            q: `길이가 $${a}$ cm인 ${thing} $${n}$개를 똑같은 간격으로 한 줄로 늘어놓았더니, 첫째 ${thing}의 왼쪽 끝에서 마지막 ${thing}의 오른쪽 끝까지의 길이가 $${T}$ cm였어요. ${thing} 사이의 간격은 몇 cm인가요?`,
            answer: { type: 'num', value: g, unit: 'cm' },
            steps: [
              `${thing} 길이의 합: $${blocks}=${n * a}$ (cm)`,
              `간격의 합: $${T}-${n * a}=${(n - 1) * g}$ (cm)`,
              `${thing} $${n}$개 사이의 간격은 $${n - 1}$군데예요.`,
              `똑같은 수 $${n - 1}$개를 더해 $${(n - 1) * g}$${jo((n - 1) * g, '이')} 되는 수: $${gaps}=${(n - 1) * g}$`,
              `간격은 $${g}$ cm`,
            ],
            hint: '간격이 몇 군데인지 먼저 세어 보세요.',
          };
        }
        const [L, a] = until(
          () => [r.int(4, 10) * r.pick([2, 3, 4, 5]), r.pick([2, 3, 4, 5])],
          ([L, a]) => L % a === 0 && L / a >= 4 && L / a <= 9 && L <= 45,
        );
        const marks = range(0, L / a).map((i) => `$${i * a}$`);
        return {
          q: `길이가 $${L}$ cm인 막대에 왼쪽 끝부터 $${a}$ cm마다 점을 찍으려고 해요. 막대의 양쪽 끝에도 점을 찍는다면 점은 모두 몇 개 찍게 되나요?`,
          answer: { type: 'num', value: L / a + 1, unit: '개' },
          steps: [
            `왼쪽 끝에서부터 떨어진 길이로 점의 자리를 써요.`,
            `$${a}$씩 뛰어 세면: ${marks.join(', ')} (cm)`,
            `마지막 $${L}$ cm는 오른쪽 끝이에요.`,
            `쓴 수를 세면 $${L / a + 1}$개 → 점은 $${L / a + 1}$개`,
            `($${a}$ cm짜리 간격은 $${L / a}$군데이고, 점은 그보다 $1$개 더 많아요.)`,
          ],
          hint: '0 cm 자리(왼쪽 끝)에도 점을 찍는 것을 잊지 마세요.',
        };
      },
    },
    {
      id: 'top-two-sticks',
      title: '막대 여러 개로 잴 수 있는 길이',
      gen(r): ProblemDraft {
        const three = true;
        const sticks = until(
          () => r.sample(range(1, 9), three ? 3 : 2).sort((a, b) => a - b),
          (s) => s[s.length - 1] >= 3,
        );
        const vals = new Set<number>();
        const lines: string[] = [];
        const add = (label: string, xs: number[]) => {
          const fresh = xs.filter((x) => x > 0 && !vals.has(x));
          fresh.forEach((x) => vals.add(x));
          lines.push(`${label}: ${fresh.length ? fresh.map((x) => `$${x}$ cm`).join(', ') : '새로운 길이 없음'}`);
        };
        add('막대 하나', sticks);
        const pairs: [number, number][] = [];
        for (let i = 0; i < sticks.length; i++) for (let j = i + 1; j < sticks.length; j++) pairs.push([sticks[i], sticks[j]]);
        add(
          '두 개 이어 붙이기',
          pairs.map(([a, b]) => a + b),
        );
        add(
          '두 개의 차 (긴 막대 옆에 짧은 막대를 대어 남는 부분)',
          pairs.map(([a, b]) => b - a),
        );
        if (three) {
          const [a, b, c] = sticks;
          add(
            '세 개 사용 (이어 붙이거나 차 이용)',
            [a + b + c, b + c - a, a + c - b, Math.abs(a + b - c)].filter((x) => x > 0),
          );
        }
        const ans = vals.size;
        return {
          q: `길이가 ${sticks.map((s) => `$${s}$ cm`).join(', ')}인 막대가 한 개씩 있어요. 막대에는 눈금이 없고, 막대를 이어 붙이거나 나란히 놓아 길이의 차를 이용하여 길이를 잴 수 있어요. 잴 수 있는 길이는 모두 몇 가지인가요?`,
          answer: { type: 'num', value: ans, unit: '가지' },
          steps: [
            `쓰는 막대의 수와 방법에 따라 나누고, 이미 나온 길이는 빼고 세어요.`,
            ...lines,
            `잴 수 있는 길이: ${[...vals]
              .sort((a, b) => a - b)
              .map((x) => `$${x}$`)
              .join(', ')} (cm)`,
            `모두 $${ans}$가지`,
          ],
          hint: '두 막대의 길이의 차도 잴 수 있어요.',
        };
      },
    },
  ],
};

// ───────────────────────── e2a-5 분류하기
const LEG2 = ['닭', '오리', '참새', '타조', '펭귄', '비둘기'];
const LEG4 = ['강아지', '고양이', '소', '말', '토끼', '사자', '돼지'];
const LAND = ['버스', '기차', '자전거', '자동차', '트럭', '오토바이'];
const SEA = ['배', '요트', '잠수함', '유람선'];
const SKY = ['비행기', '헬리콥터', '열기구'];
const FLY = ['참새', '독수리', '비둘기', '까치', '나비', '잠자리'];
const NOFLY = ['펭귄', '타조', '강아지', '거북', '토끼', '다람쥐'];

const e2a5: HardSet = {
  skills: [
    {
      id: 'misplaced',
      title: '잘못 분류된 것 찾기',
      gen(r, level): ProblemDraft {
        type G = { label: string; items: string[] };
        let groups: G[];
        let crit: string;
        let wrong: string;
        let why: string;
        if (level === 1) {
          crit = '다리의 수';
          const a = r.sample(LEG2, 3);
          const b = r.sample(LEG4, 4);
          wrong = b[3];
          groups = [
            { label: '다리 $2$개', items: r.shuffle([...a, wrong]) },
            { label: '다리 $4$개', items: b.slice(0, 3) },
          ];
          why = `${J(wrong, '은')} 다리가 $4$개예요.`;
        } else if (level === 2) {
          crit = '다니는 곳';
          const g = [r.sample(LAND, 3), r.sample(SEA, 2), r.sample(SKY, 2)];
          const from = r.int(0, 2);
          const to = (from + r.int(1, 2)) % 3;
          wrong = g[from][0];
          const lbl = ['땅', '물', '하늘'];
          const gs = g.map((x) => x.slice());
          gs[from] = gs[from].slice(1);
          gs[to].push(wrong);
          groups = gs.map((items, i) => ({
            label: lbl[i],
            items: r.shuffle(items),
          }));
          why = `${J(wrong, '은')} ${lbl[from]}${from === 0 ? ' 위' : from === 1 ? ' 위' : ''}로 다녀요.`.replace('하늘로', '하늘로').replace('땅 위로', '땅 위로');
        } else {
          crit = '날 수 있는지';
          const f = r.sample(FLY, 3);
          const n = r.sample(NOFLY, 3);
          const toFly = r.chance(0.6);
          if (toFly) {
            const tricky: string[] = n.filter((x) => x === '펭귄' || x === '타조');
            wrong = tricky.length ? r.pick(tricky) : n[0];
            groups = [
              { label: '날 수 있는 동물', items: r.shuffle([...f, wrong]) },
              { label: '날 수 없는 동물', items: n.filter((x) => x !== wrong) },
            ];
            why = `${J(wrong, '은')} 날 수 없는 동물이에요.`;
          } else {
            wrong = f[0];
            groups = [
              { label: '날 수 있는 동물', items: f.slice(1) },
              { label: '날 수 없는 동물', items: r.shuffle([...n, wrong]) },
            ];
            why = `${J(wrong, '은')} 날 수 있는 동물이에요.`;
          }
        }
        const all = groups.flatMap((g) => g.items);
        return {
          q: `${J(crit, '을')} 기준으로 분류했어요.\n${groups.map((g) => `- ${g.label}: ${g.items.join(', ')}`).join('\n')}\n잘못 분류된 것은 무엇인가요?`.replace('날 수 있는지을', '날 수 있는지를'),
          answer: textChoices(
            r,
            wrong,
            all.filter((x) => x !== wrong),
            5,
          ),
          steps: [`칸마다 하나씩 기준에 맞는지 확인해요.`, why, `잘못 분류된 것은 ${wrong}`],
          hint: '하나씩 기준에 맞는지 살펴보세요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'top-venn',
      title: '두 기준으로 겹쳐 센 수 구하기',
      gen(r): ProblemDraft {
        const [A, B] = r.pick([
          ['강아지', '고양이'],
          ['축구', '피구'],
          ['수박', '딸기'],
          ['그림 그리기', '노래 부르기'],
        ]);
        const [N0, a, b, c] = until(
          () => [r.int(20, 30), r.int(6, 18), r.int(6, 18), r.int(2, 6)],
          ([N0, a, b, c]) => c < a && c < b && N0 - (a + b - c) >= 1,
        );
        const none = N0 - (a + b - c);
        const kind = r.int(0, 1);
        const lead = `${r.pick(['우리 반', '민지네 반', '준호네 반'])} 학생 $${N0}$명에게 ${J(A, '와')} ${J(B, '를')} 좋아하는지 물어보았어요.`;
        if (kind === 0) {
          return {
            q: `${lead} ${J(A, '를')} 좋아하는 학생은 $${a}$명, ${J(B, '를')} 좋아하는 학생은 $${b}$명이고, 둘 다 좋아하는 학생은 $${c}$명이에요. 둘 다 좋아하지 않는 학생은 몇 명인가요?`,
            answer: { type: 'num', value: none, unit: '명' },
            steps: [
              `$${a}+${b}=${a + b}$ 에는 둘 다 좋아하는 학생 $${c}$명이 두 번 들어 있어요.`,
              `${A}만 좋아하는 학생: $${a}-${c}=${a - c}$ (명)`,
              `${B}만 좋아하는 학생: $${b}-${c}=${b - c}$ (명)`,
              `하나라도 좋아하는 학생: $${a - c}+${b - c}+${c}=${a + b - c}$ (명)`,
              `둘 다 좋아하지 않는 학생: $${N0}-${a + b - c}=${none}$ (명)`,
            ],
            hint: '둘 다 좋아하는 학생을 두 번 세지 않게 조심해요.',
          };
        }
        return {
          q: `${lead} ${J(A, '를')} 좋아하는 학생은 $${a}$명, ${J(B, '를')} 좋아하는 학생은 $${b}$명이고, 둘 다 좋아하지 않는 학생은 $${none}$명이에요. ${J(A, '와')} ${J(B, '를')} 모두 좋아하는 학생은 몇 명인가요?`,
          answer: { type: 'num', value: c, unit: '명' },
          steps: [
            `하나라도 좋아하는 학생: $${N0}-${none}=${a + b - c}$ (명)`,
            `$${a}+${b}=${a + b}$${jo(a + b, '은')} 하나라도 좋아하는 학생 수보다 많아요.`,
            `더 많은 까닭은 둘 다 좋아하는 학생을 두 번 세었기 때문이에요.`,
            `$${a + b}-${a + b - c}=${c}$`,
            `둘 다 좋아하는 학생은 $${c}$명`,
          ],
          hint: '두 수를 더한 것이 실제 학생 수보다 왜 많은지 생각해 보세요.',
        };
      },
    },
    {
      id: 'top-sort-relation',
      title: '관계를 보고 분류한 수 구하기',
      gen(r): ProblemDraft {
        const S = ['봄', '여름', '가을', '겨울'];
        const [c, d1, s1, d2, s2] = until(
          () => [r.int(3, 9), r.int(1, 5), r.sign(), r.int(1, 5), r.sign()],
          ([c, d1, s1, d2, s2]) => {
            const v = [c, c + s1 * d1];
            v.push(v[1] + s2 * d2);
            if (!v.every((x) => x >= 1)) return false;
            // 겨울 수를 골라 가장 많은 계절·가장 적은 계절이 하나씩만 되게 할 수 있어야 함
            return [2, 3, 4, 5, 6, 7, 8, 9].some((w) => {
              const a = [...v, w];
              const mx = Math.max(...a),
                mn = Math.min(...a);
              return a.filter((x) => x === mx).length === 1 && a.filter((x) => x === mn).length === 1;
            });
          },
        );
        const v = [c, c + s1 * d1];
        v.push(v[1] + s2 * d2);
        const w = until(
          () => r.int(2, 9),
          (w) => {
            const a = [...v, w];
            const mx = Math.max(...a),
              mn = Math.min(...a);
            return a.filter((x) => x === mx).length === 1 && a.filter((x) => x === mn).length === 1;
          },
        );
        v.push(w);
        const tot = sum(v);
        const mx = Math.max(...v);
        const mn = Math.min(...v);
        return {
          q: `반 학생 $${tot}$명이 가장 좋아하는 계절을 하나씩 골랐어요. 봄을 고른 학생은 $${c}$명이고, 여름을 고른 학생은 봄보다 $${d1}$명 더 ${s1 > 0 ? '많고' : '적고'}, 가을을 고른 학생은 여름보다 $${d2}$명 더 ${s2 > 0 ? '많아요' : '적어요'}. 나머지 학생은 모두 겨울을 골랐어요. 가장 많은 학생이 고른 계절은 가장 적은 학생이 고른 계절보다 몇 명 더 많은가요?`,
          answer: { type: 'num', value: mx - mn, unit: '명' },
          steps: [
            `여름: $${c}${s1 > 0 ? '+' : '-'}${d1}=${v[1]}$ (명)`,
            `가을: $${v[1]}${s2 > 0 ? '+' : '-'}${d2}=${v[2]}$ (명)`,
            `겨울: $${tot}-${c}-${v[1]}-${v[2]}=${w}$ (명)`,
            `가장 많은 계절 ${S.filter((_s, i) => v[i] === mx).join(', ')} $${mx}$명, 가장 적은 계절 ${S.filter((_s, i) => v[i] === mn).join(', ')} $${mn}$명`,
            `$${mx}-${mn}=${mx - mn}$ → $${mx - mn}$명`,
          ],
          hint: '계절마다 고른 학생 수를 먼저 모두 구해요.',
        };
      },
    },
  ],
};

// ───────────────────────── e2a-6 곱셈
const e2a6: HardSet = {
  skills: [
    {
      id: 'group-ways',
      title: '남김없이 똑같이 묶는 방법',
      gen(r, level): ProblemDraft {
        const [thing, u] = r.pick(THINGS.filter(([, u]) => u === '개' || u === '장' || u === '자루'));
        if (level === 1) {
          const a = r.int(2, 5);
          const k = r.int(2, 6);
          return {
            q: `${thing} $${a * k}$${u}${jo(u, '를')} $${a}$${u}씩 묶으면 몇 묶음이 되나요?`,
            answer: { type: 'num', value: k, unit: '묶음' },
            steps: [
              `$${a}$씩 뛰어 세어요: ${range(1, k)
                .map((i) => `$${a * i}$`)
                .join(', ')}`,
              `$${k}$번 뛰어 세었으니 $${k}$묶음`,
            ],
          };
        }
        if (level === 2) {
          const [a, b, c] = until(
            () => [r.int(2, 6), r.int(2, 6), r.int(2, 6)],
            ([a, b, c]) => a !== c && (a * b) % c === 0 && (a * b) / c <= 9,
          );
          const n = a * b;
          return {
            q: `${thing}${jo(thing, '을')} $${a}$${u}씩 묶었더니 $${b}$묶음이 되었어요. 이 ${J(thing, '을')} 다시 $${c}$${u}씩 묶으면 몇 묶음이 되나요?`,
            answer: { type: 'num', value: n / c, unit: '묶음' },
            steps: [
              `${thing}의 수: $${a}$씩 $${b}$묶음 → $${a}\\times${b}=${n}$`,
              `$${c}$씩 뛰어 세기: ${range(1, n / c)
                .map((i) => `$${c * i}$`)
                .join(', ')}`,
              `$${n / c}$묶음`,
            ],
            hint: '먼저 모두 몇 개인지 구해요.',
          };
        }
        const n = r.pick([12, 16, 18, 20, 24]);
        const ds = range(2, n - 1).filter((d) => n % d === 0 && n / d >= 2);
        return {
          q: `${thing} $${n}$${u}${jo(u, '를')} 남김없이 똑같은 수씩 묶으려고 해요. 한 묶음에 $2$${u} 이상씩 묶고, 묶음도 $2$개 이상이 되게 하려면 묶는 방법은 모두 몇 가지인가요?`,
          answer: { type: 'num', value: ds.length, unit: '가지' },
          steps: [`한 묶음에 넣는 수를 $2$부터 차례로 생각해요.`, ...ds.map((d) => `$${d}$${u}씩 $${n / d}$묶음: $${d}\\times${n / d}=${n}$`), `모두 $${ds.length}$가지`],
          hint: '한 묶음에 2개, 3개, 4개, … 씩 묶어 남는 것이 없는지 확인해요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'top-legs',
      title: '다리·바퀴 수로 개수 알아내기',
      gen(r): ProblemDraft {
        const ctx = r.pick([
          {
            a: '닭',
            b: '토끼',
            pa: 2,
            pb: 4,
            part: '다리',
            u: '마리',
            unitPart: '개',
          },
          {
            a: '오리',
            b: '강아지',
            pa: 2,
            pb: 4,
            part: '다리',
            u: '마리',
            unitPart: '개',
          },
          {
            a: '자전거',
            b: '세발자전거',
            pa: 2,
            pb: 3,
            part: '바퀴',
            u: '대',
            unitPart: '개',
          },
        ]);
        const [x, y] = until(
          () => [r.int(1, 6), r.int(1, 6)],
          ([x, y]) => x !== y && x + y <= 9,
        );
        const n = x + y;
        const L = ctx.pa * x + ctx.pb * y;
        const askB = r.chance(0.5);
        const rows: string[] = [];
        for (let b = 1; b <= n - 1; b++) {
          const v = ctx.pa * (n - b) + ctx.pb * b;
          if (b >= y - 2 && b <= y + 1) rows.push(`${ctx.b} $${b}$${ctx.u}: $${ctx.pa}\\times${n - b}+${ctx.pb}\\times${b}=${v}$${v === L ? ' (맞아요)' : ''}`);
        }
        return {
          q: `${ctx.a}와 ${J(ctx.b, '가')} 모두 $${n}$${ctx.u} 있어요. ${ctx.part}의 수를 세어 보니 모두 $${L}$${ctx.unitPart}였어요. ${J(askB ? ctx.b : ctx.a, '는')} 몇 ${ctx.u}인가요?`.replace(
            `${ctx.a}와`,
            J(ctx.a, '와'),
          ),
          answer: { type: 'num', value: askB ? y : x, unit: ctx.u },
          steps: [
            `${J(ctx.a, '은')} ${ctx.part}가 $${ctx.pa}$개, ${J(ctx.b, '은')} $${ctx.pb}$개예요.`,
            `${ctx.a} 대신 ${J(ctx.b, '을')} $1$${ctx.u} 늘릴 때마다 ${ctx.part}는 $${ctx.pb - ctx.pa}$개씩 늘어나요. ${ctx.b}의 수를 바꾸어 가며 따져 봐요.`,
            ...rows,
            `${ctx.b} $${y}$${ctx.u}, ${ctx.a} $${x}$${ctx.u}일 때 ${ctx.part}가 $${L}$개`,
            `답: $${askB ? y : x}$${ctx.u}`,
          ],
          hint: `${ctx.b}가 한 ${ctx.u} 늘어날 때마다 ${ctx.part}는 몇 개씩 늘어나는지 보세요.`,
        };
      },
    },
    {
      id: 'top-regroup',
      title: '다르게 묶어 다시 세기',
      gen(r): ProblemDraft {
        const [p] = names(r, 1);
        const [thing, u] = r.pick(THINGS.filter(([, u]) => u === '개' || u === '장'));
        const [a, b, c, g, more] = until(
          () => [r.int(2, 6), r.int(2, 6), r.int(1, 5), r.int(2, 6), r.chance(0.5)] as [number, number, number, number, boolean],
          ([a, b, c, g, m]) => {
            const n = a * b + (m ? c : -c);
            return c < a && g !== a && n > 0 && n % g === 0 && n / g >= 2 && n / g <= 9;
          },
        );
        const n = a * b + (more ? c : -c);
        return {
          q: more
            ? `${J(p, '는')} ${thing}${jo(thing, '을')} $${a}$${u}씩 $${b}$묶음으로 묶었더니 $${c}$${u}${jo(u, '가')} 남았어요. 이 ${J(thing, '을')} 모두 $${g}$${u}씩 다시 묶으면 몇 묶음이 되나요?`
            : `${J(p, '는')} ${thing}${jo(thing, '을')} $${a}$${u}씩 $${b}$묶음으로 묶으려고 했는데 마지막 묶음에 $${c}$${u}${jo(u, '가')} 모자랐어요. 이 ${J(thing, '을')} 모두 $${g}$${u}씩 묶으면 몇 묶음이 되나요?`,
          answer: { type: 'num', value: n / g, unit: '묶음' },
          steps: [
            `$${a}$${u}씩 $${b}$묶음: $${a}\\times${b}=${a * b}$ (${u})`,
            more ? `남은 $${c}$${u}${jo(u, '를')} 더하면 $${a * b}+${c}=${n}$ (${u})` : `$${c}$${u} 모자라니 $${a * b}-${c}=${n}$ (${u})`,
            `$${g}$씩 뛰어 세기: ${range(1, n / g)
              .map((i) => `$${g * i}$`)
              .join(', ')}`,
            `$${g}$${u}씩 $${n / g}$묶음 → $${g}\\times${n / g}=${n}$`,
            `답: $${n / g}$묶음`,
          ],
          hint: '먼저 모두 몇 개인지 구해 보세요.',
        };
      },
    },
  ],
};

// ───────────────────────── e2b-1 네 자리 수
const e2b1: HardSet = {
  skills: [
    {
      id: 'box-digit',
      title: '□ 안에 들어갈 수 있는 숫자',
      gen(r, level): ProblemDraft {
        const fill = (t: number[], pos: number, d: number) => Number(t.map((x, i) => (i === pos ? d : x)).join(''));
        const tex = (t: number[], pos: number) => t.map((x, i) => (i === pos ? '\\square' : String(x))).join('');
        if (level < 3) {
          const [t, other, pos, gt] = until(
            () => {
              const pos = r.int(1, 2);
              const t = [r.int(1, 9), r.int(0, 9), r.int(0, 9), r.int(0, 9)];
              const other = [...t];
              other[pos] = r.int(1, 8);
              for (let i = pos + 1; i < 4; i++) other[i] = r.int(0, 9);
              return [t, other, pos, r.chance(0.5)] as [number[], number[], number, boolean];
            },
            ([t, o, pos, gt]) => {
              const O = Number(o.join(''));
              const tie = fill(t, pos, o[pos]);
              const tieOk = gt ? tie > O : tie < O;
              const k = range(0, 9).filter((d) => (gt ? fill(t, pos, d) > O : fill(t, pos, d) < O)).length;
              return (level === 1 ? !tieOk && tie !== O : tieOk) && k >= 2 && k <= 8;
            },
          );
          const O = Number(other.join(''));
          const ok = range(0, 9).filter((d) => (gt ? fill(t, pos, d) > O : fill(t, pos, d) < O));
          const kd = other[pos];
          const tie = fill(t, pos, kd);
          return {
            q: `$0$부터 $9$까지의 숫자 중에서 $\\square$ 안에 들어갈 수 있는 숫자는 모두 몇 개인가요?\n$$${tex(t, pos)} ${gt ? '>' : '<'} ${O}$$`,
            answer: { type: 'num', value: ok.length, unit: '개' },
            steps: [
              pos === 1 ? '천의 자리 숫자가 같으니 백의 자리를 비교해요.' : '천의 자리, 백의 자리 숫자가 같으니 십의 자리를 비교해요.',
              `$\\square$가 $${kd}$보다 ${gt ? '크면' : '작으면'} 항상 맞아요.`,
              `$\\square=${kd}$일 때: $${tie}${tie > O ? '>' : tie < O ? '<' : '='}${O}$ 이므로 ${(gt ? tie > O : tie < O) ? '들어갈 수 있어요' : '들어갈 수 없어요'}.`,
              `들어갈 수 있는 숫자: ${numList(ok)}`,
              `모두 $${ok.length}$개`,
            ],
            hint: '□에 같은 숫자가 들어갈 때를 꼭 따져 보세요.',
          };
        }
        const [t, lo, hi] = until(
          () => {
            const t = [r.int(1, 9), 0, r.int(0, 9), r.int(0, 9)];
            const lo = Number([t[0], r.int(0, 4), r.int(0, 9), r.int(0, 9)].join(''));
            const hi = Number([t[0], r.int(5, 9), r.int(0, 9), r.int(0, 9)].join(''));
            return [t, lo, hi] as [number[], number, number];
          },
          ([t, lo, hi]) => {
            const k = range(0, 9).filter((d) => fill(t, 1, d) > lo && fill(t, 1, d) < hi).length;
            return k >= 2 && k <= 7;
          },
        );
        const ok = range(0, 9).filter((d) => fill(t, 1, d) > lo && fill(t, 1, d) < hi);
        const lk = digitsOf(lo)[1];
        const hk = digitsOf(hi)[1];
        const tl = fill(t, 1, lk);
        const th = fill(t, 1, hk);
        return {
          q: `$0$부터 $9$까지의 숫자 중에서 $\\square$ 안에 공통으로 들어갈 수 있는 숫자는 모두 몇 개인가요?\n$$${lo} < ${tex(t, 1)} < ${hi}$$`,
          answer: { type: 'num', value: ok.length, unit: '개' },
          steps: [
            `천의 자리 숫자가 모두 같으니 백의 자리를 비교해요.`,
            `$\\square=${lk}$일 때: $${tl}$${tl > lo ? '은 $' + lo + '$보다 커요' : '은 $' + lo + '$보다 크지 않아요'}.`.replace(`$${tl}$은`, `$${tl}$${jo(tl, '은')}`),
            `$\\square=${hk}$일 때: $${th}$${th < hi ? '은 $' + hi + '$보다 작아요' : '은 $' + hi + '$보다 작지 않아요'}.`.replace(`$${th}$은`, `$${th}$${jo(th, '은')}`),
            `들어갈 수 있는 숫자: ${numList(ok)}`,
            `모두 $${ok.length}$개`,
          ],
          hint: '양쪽 끝의 숫자가 들어갈 때를 따로 따져 보세요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'top-clue-4digit',
      title: '조건을 모두 만족하는 네 자리 수',
      gen(r): ProblemDraft {
        const { n, clues, steps } = digitPuzzle(r, 4);
        return {
          q: `다음을 모두 만족하는 네 자리 수는 무엇인가요?\n${r
            .shuffle(clues)
            .map((c) => `- ${c}`)
            .join('\n')}`,
          answer: { type: 'num', value: n },
          steps: ['바로 알 수 있는 자리부터 차례로 구해요.', ...steps, `네 자리 수는 $${n}$`],
          hint: '다른 자리와 관계없이 바로 정해지는 자리부터 찾아보세요.',
        };
      },
    },
    {
      id: 'top-digit-sum-extreme',
      title: '각 자리 숫자의 합이 정해진 가장 큰 수·가장 작은 수',
      gen(r): ProblemDraft {
        const distinct = r.chance(0.5);
        const big = r.chance(0.5);
        const S = distinct ? r.int(8, 28) : r.int(6, 32);
        const all = range(1000, 9999).filter((n) => {
          const d = digitsOf(n);
          return sum(d) === S && (!distinct || new Set(d).size === 4);
        });
        const ans = big ? all[all.length - 1] : all[0];
        const d = digitsOf(ans);
        const steps: string[] = [];
        let rest = S;
        d.forEach((x, i) => {
          rest -= x;
          steps.push(`${PN4[i]}의 자리: ${big ? '될 수 있는 가장 큰' : '될 수 있는 가장 작은'} 숫자 $${x}$ (남은 자리의 합 $${rest}$)`);
        });
        return {
          q: `각 자리 숫자의 합이 $${S}$인 네 자리 수 중에서 ${distinct ? '네 숫자가 모두 다른 ' : ''}가장 ${big ? '큰' : '작은'} 수는 무엇인가요?`,
          answer: { type: 'num', value: ans },
          steps: [
            big ? '큰 수가 되려면 높은 자리부터 숫자를 될 수 있는 한 크게 놓아요.' : '작은 수가 되려면 높은 자리부터 숫자를 될 수 있는 한 작게 놓아요. (천의 자리는 $0$이 될 수 없어요.)',
            big ? '' : '단, 남은 자리로 나머지 합을 만들 수 있어야 해요. (한 자리에는 $9$까지만 올 수 있어요.)',
            distinct ? '네 숫자는 모두 달라야 해요.' : '',
            ...steps,
            `답: $${ans}$`,
          ].filter((s) => s),
          hint: big ? '천의 자리부터 9를 놓을 수 있는지 보세요.' : '일의 자리부터 9를 채워 보세요.',
        };
      },
    },
  ],
};

// ───────────────────────── e2b-2 곱셈구구
const e2b2: HardSet = {
  skills: [
    {
      id: 'card-product',
      title: '수 카드로 곱 만들기',
      gen(r, level): ProblemDraft {
        const n = lv(level, 4, 5, 5);
        const cs = r.sample(range(2, 9), n);
        const s = [...cs].sort((a, b) => b - a);
        const maxP = s[0] * s[1];
        const minP = s[n - 1] * s[n - 2];
        const lead = `수 카드 ${cardList(cs)} 중에서 두 장을 골라 두 수의 곱을 구하려고 해요.`;
        if (level === 1)
          return {
            q: `${lead} 곱이 가장 클 때의 곱은 얼마인가요?`,
            answer: { type: 'num', value: maxP },
            steps: [`곱이 가장 크려면 가장 큰 두 수를 곱해요.`, `$${s[0]}\\times${s[1]}=${maxP}$`],
          };
        if (level === 2)
          return {
            q: `${lead} 곱이 가장 작을 때의 곱은 얼마인가요?`,
            answer: { type: 'num', value: minP },
            steps: [`곱이 가장 작으려면 가장 작은 두 수를 곱해요.`, `$${s[n - 1]}\\times${s[n - 2]}=${minP}$`],
          };
        return {
          q: `${lead} 만들 수 있는 가장 큰 곱과 가장 작은 곱의 차는 얼마인가요?`,
          answer: { type: 'num', value: maxP - minP },
          steps: [`가장 큰 곱: $${s[0]}\\times${s[1]}=${maxP}$`, `가장 작은 곱: $${s[n - 1]}\\times${s[n - 2]}=${minP}$`, `$${maxP}-${minP}=${maxP - minP}$`],
          hint: '가장 큰 두 수와 가장 작은 두 수를 찾아보세요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'top-common-dan',
      title: '두 단의 곱셈구구에 모두 나오는 수',
      gen(r): ProblemDraft {
        const [a, b] = until(
          () => r.sample(range(2, 9), 2).sort((x, y) => x - y),
          ([a, b]) => {
            const A = range(1, 9).map((i) => a * i);
            return range(1, 9).filter((i) => A.includes(b * i)).length >= 2;
          },
        );
        const A = range(1, 9).map((i) => a * i);
        const B = range(1, 9).map((i) => b * i);
        const common = B.filter((x) => A.includes(x));
        if (r.chance(0.4)) {
          return {
            q: `$${a}$단 곱셈구구의 곱과 $${b}$단 곱셈구구의 곱에 모두 나오는 수는 몇 개인가요? (각 단은 $\\times1$부터 $\\times9$까지예요.)`,
            answer: { type: 'num', value: common.length, unit: '개' },
            steps: [
              `$${a}$단: ${numList(A)}`,
              `$${b}$단: ${numList(B)}`,
              `두 곳에 모두 있는 수: ${numList(common)}`,
              `모두 $${common.length}$개`,
              `두 단에 모두 나오는 수는 $${common[1] - common[0]}$씩 커지는 규칙이 있어요.`,
            ],
            hint: '두 단의 곱을 모두 써서 비교해 보세요.',
          };
        }
        const t = r.pick(common);
        const idx = common.indexOf(t);
        const lo = idx > 0 ? r.int(common[idx - 1], t - 1) : r.int(Math.max(1, t - 9), t - 1);
        const hi = idx < common.length - 1 ? r.int(t + 1, common[idx + 1]) : r.int(t + 1, t + 9);
        return {
          q: `어떤 수는 $${a}$단 곱셈구구에도 나오고 $${b}$단 곱셈구구에도 나와요. 또 $${lo}$보다 크고 $${hi}$보다 작아요. 어떤 수는 무엇인가요?`.replace('보다보다', '보다'),
          answer: { type: 'num', value: t },
          steps: [
            `$${a}$단: ${numList(A)}`,
            `$${b}$단: ${numList(B)}`,
            `두 단에 모두 나오는 수: ${numList(common)}`,
            `이 중 $${lo}$보다 크고 $${hi}$보다 작은 수는 $${t}$`.replace('보다보다', '보다'),
            `어떤 수는 $${t}$`,
          ],
          hint: '두 단의 곱을 모두 써서 같은 수를 찾아보세요.',
        };
      },
    },
    {
      id: 'top-product-sum',
      title: '곱과 합(차)으로 두 수 찾기',
      gen(r): ProblemDraft {
        const pairsOf = (p: number) =>
          range(1, 9)
            .filter((x) => p % x === 0 && p / x <= 9 && x <= p / x)
            .map((x) => [x, p / x]);
        const [x, y] = until(
          () => [r.int(1, 9), r.int(1, 9)],
          ([x, y]) => x < y && pairsOf(x * y).length >= 2,
        );
        const p = x * y;
        const useSum = r.chance(0.5);
        const ps = pairsOf(p);
        const askBig = r.chance(0.5);
        return {
          q: `$1$부터 $9$까지의 수 중에서 서로 다른 두 수를 골랐어요. 두 수를 곱하면 $${p}$이고, ${useSum ? `더하면 $${x + y}$` : `큰 수에서 작은 수를 빼면 $${y - x}$`}이에요. 두 수 중 ${askBig ? '큰' : '작은'} 수는 무엇인가요?`
            .replace(`$${p}$이고`, `$${p}$${jo(p, '이') === '이' ? '이고' : '고'}`)
            .replace(/\$(\d+)\$이에요/, (_m, v) => `$${v}$${jo(Number(v), '이에요')}`),
          answer: { type: 'num', value: askBig ? y : x },
          steps: [
            `곱셈구구에서 곱이 $${p}$인 두 수를 모두 찾아요.`,
            ps.map(([a, b]) => `$${a}\\times${b}=${p}$`).join(', '),
            useSum ? `각각의 합: ${ps.map(([a, b]) => `$${a}+${b}=${a + b}$`).join(', ')}` : `각각의 차: ${ps.map(([a, b]) => `$${b}-${a}=${b - a}$`).join(', ')}`,
            `${useSum ? `합이 $${x + y}$` : `차가 $${y - x}$`}인 것은 $${x}$와 $${y}$`.replace(`$${x}$와`, N(x, '와')),
            `${askBig ? '큰' : '작은'} 수는 $${askBig ? y : x}$`,
          ],
          hint: '곱이 같은 두 수를 곱셈구구에서 모두 찾아보세요.',
        };
      },
    },
  ],
};

// ───────────────────────── e2b-3 길이 재기 (m, cm)
const mcm = (cm: number) => (cm % 100 === 0 ? `$${cm / 100}$ m` : cm < 100 ? `$${cm}$ cm` : `$${Math.floor(cm / 100)}$ m $${cm % 100}$ cm`);
const mcmF = (cm: number) => ({
  type: 'fields' as const,
  fields: [
    { label: 'm', value: Math.floor(cm / 100) },
    { label: 'cm', value: cm % 100 },
  ],
});

const e2b3: HardSet = {
  skills: [
    {
      id: 'card-length',
      title: '수 카드로 길이 만들기 (m와 cm)',
      gen(r, level): ProblemDraft {
        const cs = r.sample(range(1, 9), 3);
        const s = [...cs].sort((a, b) => b - a);
        const L = 100 * s[0] + 10 * s[1] + s[2];
        const S = 100 * s[2] + 10 * s[1] + s[0];
        const lead = `수 카드 ${cardList(cs)}${jo(cs[2], '을')} 한 번씩 모두 사용하여 $\\square$ m $\\square\\square$ cm인 길이를 만들려고 해요.`;
        if (level === 1)
          return {
            q: `${lead} 만들 수 있는 가장 긴 길이는 몇 m 몇 cm인가요?`,
            answer: mcmF(L),
            steps: [`m 앞에 가장 큰 수 $${s[0]}$, cm에는 남은 수로 가장 큰 두 자리 수 $${10 * s[1] + s[2]}$`, `가장 긴 길이: ${mcm(L)}`],
          };
        if (level === 2)
          return {
            q: `${lead} 만들 수 있는 가장 짧은 길이는 몇 m 몇 cm인가요?`,
            answer: mcmF(S),
            steps: [`m 앞에 가장 작은 수 $${s[2]}$, cm에는 남은 수로 가장 작은 두 자리 수 $${10 * s[1] + s[0]}$`, `가장 짧은 길이: ${mcm(S)}`],
          };
        const tot = L + S;
        return {
          q: `${lead} 만들 수 있는 가장 긴 길이와 가장 짧은 길이의 합은 몇 m 몇 cm인가요?`,
          answer: mcmF(tot),
          steps: [
            `가장 긴 길이: ${mcm(L)}`,
            `가장 짧은 길이: ${mcm(S)}`,
            (L % 100) + (S % 100) >= 100
              ? `cm끼리: $${L % 100}+${S % 100}=${(L % 100) + (S % 100)}$ → $1$ m를 올리고 $${((L % 100) + (S % 100)) % 100}$ cm`
              : `cm끼리: $${L % 100}+${S % 100}=${(L % 100) + (S % 100)}$`,
            `m끼리: $${s[0]}+${s[2]}${(L % 100) + (S % 100) >= 100 ? '+1' : ''}=${Math.floor(tot / 100)}$`,
            `합: ${mcm(tot)}`,
          ],
          hint: 'm 앞의 숫자가 길이를 가장 크게 바꿔요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'top-line-points',
      title: '한 줄 위에 놓인 깃발 사이의 거리',
      gen(r): ProblemDraft {
        const [s1, s2, s3] = until(
          () => [r.int(11, 45) * 10 + r.int(0, 9), r.int(11, 45) * 10 + r.int(0, 9), r.int(11, 45) * 10 + r.int(0, 9)],
          ([a, b, c]) => a + b + c <= 999 && a % 100 !== 0 && b % 100 !== 0 && c % 100 !== 0,
        );
        const F = ['㉮', '㉯', '㉰', '㉱'];
        const AC = s1 + s2;
        const BD = s2 + s3;
        const AD = s1 + s2 + s3;
        const lead = `운동장에 깃발 ${F.join(', ')}가 이 순서대로 곧게 한 줄로 꽂혀 있어요.`;
        if (r.chance(0.5)) {
          return {
            q: `${lead} ㉮에서 ㉰까지는 ${mcm(AC)}, ㉯에서 ㉱까지는 ${mcm(BD)}, ㉮에서 ㉱까지는 ${mcm(AD)}예요. ㉯에서 ㉰까지의 거리는 몇 m 몇 cm인가요?`,
            answer: mcmF(s2),
            steps: [
              `㉮~㉰와 ㉯~㉱를 더하면 ㉮~㉱ 전체에 ㉯~㉰가 한 번 더 들어가요.`,
              `㉮~㉰ + ㉯~㉱ $=$ ${mcm(AC)} $+$ ${mcm(BD)} $=$ ${mcm(AC + BD)}`,
              `여기서 ㉮~㉱ ${mcm(AD)}를 빼면 ㉯~㉰만 남아요.`,
              `${mcm(AC + BD)} $-$ ${mcm(AD)} $=$ ${mcm(s2)}`,
              `㉯에서 ㉰까지: ${mcm(s2)}`,
            ],
            hint: '두 거리를 더하면 겹친 부분이 두 번 들어가요.',
          };
        }
        return {
          q: `${lead} ㉮에서 ㉰까지는 ${mcm(AC)}, ㉯에서 ㉱까지는 ${mcm(BD)}, ㉯에서 ㉰까지는 ${mcm(s2)}예요. ㉮에서 ㉱까지의 거리는 몇 m 몇 cm인가요?`,
          answer: mcmF(AD),
          steps: [
            `㉮~㉰와 ㉯~㉱를 더하면 겹친 ㉯~㉰가 두 번 들어가요.`,
            `㉮~㉰ + ㉯~㉱ $=$ ${mcm(AC)} $+$ ${mcm(BD)} $=$ ${mcm(AC + BD)}`,
            `두 번 들어간 ㉯~㉰ ${mcm(s2)}를 한 번 빼요.`,
            `${mcm(AC + BD)} $-$ ${mcm(s2)} $=$ ${mcm(AD)}`,
            `㉮에서 ㉱까지: ${mcm(AD)}`,
          ],
          hint: '겹쳐서 두 번 더해진 부분을 찾아보세요.',
        };
      },
    },
    {
      id: 'top-snail',
      title: '올라가고 미끄러지는 달팽이',
      gen(r): ProblemDraft {
        const [u, d, H, k] = until(
          () => {
            const u = r.int(5, 9) * 10;
            const d = r.int(2, 4) * 10 + r.pick([0, 5]);
            const H = r.int(15, 33) * 10;
            let k = 1;
            while ((k - 1) * (u - d) + u < H) k++;
            return [u, d, H, k];
          },
          ([u, d, H, k]) => d < u && k >= 3 && k <= 5 && H > u,
        );
        const lines: string[] = [];
        let h = 0;
        for (let i = 1; i <= k; i++) {
          const top = h + u;
          if (top >= H) {
            lines.push(`${ORDS[i]} 날 낮: ${h ? mcm(h) : '$0$ cm'} $+ ${u}$ cm → ${mcm(top)} → 꼭대기 도착!`);
            break;
          }
          h = top - d;
          lines.push(`${ORDS[i]} 날 낮: ${mcm(top)}, 밤: ${mcm(h)}`);
        }
        return {
          q: `높이가 ${mcm(H)}인 나무 기둥 아래에서 달팽이가 꼭대기까지 올라가려고 해요. 달팽이는 낮에 $${u}$ cm 올라가고, 밤에는 $${d}$ cm 미끄러져 내려와요. 달팽이가 처음으로 꼭대기에 닿는 것은 며칠째 되는 날인가요?`,
          answer: { type: 'num', value: k, unit: '일째' },
          steps: [`하루에 밤까지 지나면 $${u}-${d}=${u - d}$ (cm)씩 올라가지만, 낮에 꼭대기에 닿으면 미끄러지기 전에 도착한 거예요.`, ...lines, `$${k}$일째 되는 날`],
          hint: '날마다 낮과 밤의 높이를 차례로 써 보세요.',
        };
      },
    },
  ],
};

// ───────────────────────── e2b-4 시각과 시간
const hm = (h: number, m: number) => (m === 0 ? `$${h}$시` : `$${h}$시 $${m}$분`);
const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const MDAYS: Record<number, number> = {
  1: 31,
  3: 31,
  4: 30,
  5: 31,
  6: 30,
  7: 31,
  8: 31,
  9: 30,
  10: 31,
  11: 30,
};

const e2b4: HardSet = {
  skills: [
    {
      id: 'reverse-start',
      title: '끝난 시각으로 시작한 시각 구하기',
      gen(r, level): ProblemDraft {
        const [p] = names(r, 1);
        const act = r.pick(['책을 읽었', '숙제를 했', '피아노를 쳤', '그림을 그렸', '블록 놀이를 했']);
        if (level === 1) {
          const [e, a] = [r.int(4, 11), r.int(1, 3)];
          return {
            q: `${J(p, '는')} $${a}$시간 동안 ${act}더니 $${e}$시가 되었어요. ${J(p, '가')} 시작한 시각은 몇 시인가요?`,
            answer: { type: 'num', value: e - a, unit: '시' },
            steps: [`끝난 시각에서 $${a}$시간 거꾸로 가요.`, `$${e}$시 → $${e - a}$시`],
          };
        }
        const toMin = (h: number, m: number) => 60 * h + m;
        if (level === 2) {
          const [eh, em, d] = until(
            () => [r.int(3, 11), r.int(0, 11) * 5, r.int(4, 11) * 5],
            ([eh, em, d]) => toMin(eh, em) - d >= 60 && em < d,
          );
          const s = toMin(eh, em) - d;
          return {
            q: `${J(p, '는')} $${d}$분 동안 ${act}더니 ${hm(eh, em)}이 되었어요. ${J(p, '가')} 시작한 시각은 몇 시 몇 분인가요?`.replace(
              /(\$\d+\$분|\$\d+\$시)이 되었/,
              (_m, w) => `${w}${jo(w, '이')} 되었`,
            ),
            answer: {
              type: 'fields',
              fields: [
                { label: '시', value: Math.floor(s / 60) },
                { label: '분', value: s % 60 },
              ],
            },
            steps: [`${hm(eh, em)}에서 거꾸로 $${em}$분 가면 $${eh}$시`, `남은 $${d - em}$분을 더 거꾸로 가면 $${eh - 1}$시 $${60 - (d - em)}$분`, `시작한 시각: ${hm(Math.floor(s / 60), s % 60)}`],
            hint: '먼저 정각까지 거꾸로 가 보세요.',
          };
        }
        const act2 = r.pick(['줄넘기를 했', '청소를 했', '일기를 썼']);
        const [eh, em, a, b] = until(
          () => [r.int(4, 11), r.int(0, 11) * 5, r.int(3, 9) * 5, r.int(1, 9) * 5],
          ([eh, em, a, b]) => toMin(eh, em) - a - 60 - b >= 60,
        );
        const mid = toMin(eh, em) - (60 + b);
        const s = mid - a;
        return {
          q: `${J(p, '는')} 먼저 $${a}$분 동안 ${act}고, 바로 이어서 $1$시간 $${b}$분 동안 ${act2}더니 ${hm(eh, em)}이 되었어요. ${J(p, '가')} 처음 시작한 시각은 몇 시 몇 분인가요?`
            .replace('했고', '하고')
            .replace('쳤고', '치고')
            .replace('그렸고', '그리고')
            .replace('읽었고', '읽고')
            .replace(/(\$\d+\$분|\$\d+\$시)이 되었/, (_m, w) => `${w}${jo(w, '이')} 되었`),
          answer: {
            type: 'fields',
            fields: [
              { label: '시', value: Math.floor(s / 60) },
              { label: '분', value: s % 60 },
            ],
          },
          steps: [
            `끝난 시각부터 거꾸로 생각해요.`,
            `${hm(eh, em)}에서 $1$시간 전: ${hm(eh - 1, em)}`,
            `다시 $${b}$분 전: ${hm(Math.floor(mid / 60), mid % 60)} (두 번째 일을 시작한 시각)`,
            `다시 $${a}$분 전: ${hm(Math.floor(s / 60), s % 60)}`,
            `처음 시작한 시각: ${hm(Math.floor(s / 60), s % 60)}`,
          ],
          hint: '나중에 한 일부터 거꾸로 시간을 빼요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'top-month-weekday',
      title: '다음 달의 요일 알아보기',
      gen(r): ProblemDraft {
        const m = r.pick(Object.keys(MDAYS).map(Number));
        const D = MDAYS[m];
        const d1 = r.int(1, 28);
        const w1 = r.int(0, 6);
        const d2 = r.int(1, 28);
        const wl = (w1 + (D - d1)) % 7;
        const w2 = (wl + d2) % 7;
        const same = range(0, 5)
          .map((i) => d1 + 7 * i)
          .filter((x) => x <= D);
        const lastSame = same[same.length - 1];
        const first = (wl + 1) % 7;
        const same2 = range(0, 4)
          .map((i) => 1 + 7 * i)
          .filter((x) => x <= d2);
        const ans = `${DOW[w2]}요일`;
        return {
          q: `어느 해 ${m}월 ${d1}일은 ${DOW[w1]}요일이에요. 같은 해 ${m + 1}월 ${d2}일은 무슨 요일인가요?`,
          answer: makeChoices(
            r,
            ans,
            DOW.filter((_x, i) => i !== w2).map((x) => `${x}요일`),
            5,
          ),
          steps: [
            `${m}월은 ${D}일까지 있어요.`,
            `${m}월에서 ${d1}일과 같은 ${DOW[w1]}요일: ${same.map((x) => `${x}일`).join(', ')}`,
            `${lastSame}일이 ${DOW[w1]}요일이니 ${m}월 ${D}일은 ${DOW[wl]}요일`,
            `${m + 1}월 1일은 ${DOW[first]}요일이고, 같은 요일: ${same2.map((x) => `${x}일`).join(', ')}`,
            `${same2[same2.length - 1]}일부터 ${d2 - same2[same2.length - 1]}일 뒤 → ${m + 1}월 ${d2}일은 ${ans}`,
          ],
          hint: '7일마다 같은 요일이 돌아와요. 먼저 그달의 마지막 날 요일을 구해 보세요.',
        };
      },
    },
    {
      id: 'top-fast-clock',
      title: '빨라지거나 느려지는 시계',
      gen(r): ProblemDraft {
        const fast = r.chance(0.5);
        const [h0, n, k] = until(
          () => [r.int(7, 11), r.int(2, 9), r.int(1, 6)],
          ([, n, k]) => n * k <= 45 && n * k >= 4,
        );
        const h1 = h0 + n;
        const disp = h1 > 12 ? h1 - 12 : h1;
        const realT = h1 > 12 ? `오후 $${h1 - 12}$시` : h1 === 12 ? '낮 $12$시' : `오전 $${h1}$시`;
        const g = n * k;
        const sh = fast ? disp : disp === 1 ? 12 : disp - 1;
        const sm = fast ? g : 60 - g;
        return {
          q: `$1$시간에 $${k}$분씩 ${fast ? '빨라지는' : '느려지는'} 시계가 있어요. 이 시계를 오전 $${h0}$시에 정확히 맞추어 놓았어요. 같은 날 ${realT}에 이 시계가 가리키는 시각은 몇 시 몇 분인가요?`,
          answer: {
            type: 'fields',
            fields: [
              { label: '시', value: sh },
              { label: '분', value: sm },
            ],
          },
          steps: [
            `오전 $${h0}$시부터 ${realT}까지는 $${n}$시간이에요.`,
            `$1$시간에 $${k}$분씩이니 $${n}$시간 동안 $${k}\\times${n}=${g}$ (분) ${fast ? '빨라져요' : '느려져요'}.`,
            fast ? `${realT}보다 $${g}$분 빠른 시각을 가리켜요.` : `${realT}보다 $${g}$분 늦은(덜 간) 시각을 가리켜요.`,
            fast ? `$${disp}$시에서 $${g}$분 뒤 → ${hm(sh, sm)}` : `$${disp}$시에서 $${g}$분 전 → ${hm(sh, sm)}`,
            `시계가 가리키는 시각: ${hm(sh, sm)}`,
          ],
          hint: '먼저 몇 시간이 지났는지 구해요.',
        };
      },
    },
  ],
};

// ───────────────────────── e2b-5 표와 그래프
const FRUITS = ['사과', '포도', '딸기', '귤', '바나나', '수박', '복숭아'];
const e2b5: HardSet = {
  skills: [
    {
      id: 'blank-relation',
      title: '조건을 보고 표의 빈칸 채우기',
      gen(r, level): ProblemDraft {
        const items = r.sample(FRUITS, 4);
        const v = until(
          () => [r.int(2, 9), r.int(1, 9), r.int(1, 9), r.int(1, 9)],
          (x) => true && x[1] * 2 <= 18,
        );
        // items[0] = items[1] 의 2배
        v[0] = 2 * v[1];
        const tot = sum(v);
        const head = ['과일', ...items, '합계'];
        if (level === 1) {
          return {
            q: `반 학생들이 좋아하는 과일을 조사하여 표로 나타냈어요. ${J(items[0], '을')} 좋아하는 학생은 ${J(items[1], '를')} 좋아하는 학생의 $2$배예요. ㉠에 알맞은 수는 무엇인가요?`,
            table: [head.slice(0, 5), ['학생 수(명)', '㉠', String(v[1]), String(v[2]), String(v[3])]],
            answer: { type: 'num', value: v[0] },
            steps: [`${items[1]}: $${v[1]}$명`, `${items[0]}: $${v[1]}$의 $2$배 → $${v[1]}\\times2=${v[0]}$`, `㉠ $=${v[0]}$`],
          };
        }
        if (level === 2) {
          return {
            q: `반 학생들이 좋아하는 과일을 조사하여 표로 나타냈어요. ${J(items[0], '을')} 좋아하는 학생은 ${J(items[1], '를')} 좋아하는 학생의 $2$배예요. 조사한 학생은 모두 몇 명인가요?`,
            table: [head, ['학생 수(명)', '㉠', String(v[1]), String(v[2]), String(v[3]), '㉡']],
            answer: { type: 'num', value: tot, unit: '명' },
            steps: [`㉠ (${items[0]}): $${v[1]}\\times2=${v[0]}$`, `㉡ (합계): $${v.join('+')}=${tot}$`, `모두 $${tot}$명`],
            hint: '먼저 ㉠을 구해요.',
          };
        }
        const rest = v[0] + v[1];
        const tries = range(1, v[1]).map((b) => `${items[1]} $${b}$명이면 ${items[0]} $${2 * b}$명 → 합 $${3 * b}$${3 * b === rest ? ' (맞아요)' : ''}`);
        return {
          q: `반 학생들이 좋아하는 과일을 조사하여 표로 나타냈어요. ${J(items[0], '을')} 좋아하는 학생은 ${J(items[1], '를')} 좋아하는 학생의 $2$배예요. ${J(items[0], '을')} 좋아하는 학생은 몇 명인가요?`,
          table: [head, ['학생 수(명)', '㉠', '㉡', String(v[2]), String(v[3]), String(tot)]],
          answer: { type: 'num', value: v[0], unit: '명' },
          steps: [
            `㉠ $+$ ㉡ $=${tot}-${v[2]}-${v[3]}=${rest}$`,
            `㉠은 ㉡의 $2$배이니, ㉠ $+$ ㉡은 ㉡의 $3$배예요.`,
            ...(tries.length > 4 ? tries.slice(-3) : tries),
            `㉡ $=${v[1]}$, ㉠ $=${v[0]}$ → ${items[0]} $${v[0]}$명`,
          ],
          hint: '두 빈칸의 합을 먼저 구해 보세요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'top-two-tables',
      title: '두 반의 조사 결과를 합쳐 보기',
      gen(r): ProblemDraft {
        const items = r.sample(FRUITS, 4);
        const [A, B] = until(
          () => [range(1, 4).map(() => r.int(1, 9)), range(1, 4).map(() => r.int(1, 9))],
          ([A, B]) => {
            const s = A.map((x, i) => x + B[i]);
            const mx = Math.max(...s);
            return s.filter((x) => x === mx).length === 1;
          },
        );
        const [ia, ib] = [r.int(0, 3), r.int(0, 3)];
        const S = A.map((x, i) => x + B[i]);
        const mx = Math.max(...S);
        const top = items[S.indexOf(mx)];
        const rowA = ['1반', ...A.map((x, i) => (i === ia ? '㉠' : String(x))), String(sum(A))];
        const rowB = ['2반', ...B.map((x, i) => (i === ib ? '㉡' : String(x))), String(sum(B))];
        return {
          q: `1반과 2반 학생들이 좋아하는 과일을 조사하여 표로 나타냈어요. 두 반 학생을 합하여 생각할 때, 가장 많은 학생이 좋아하는 과일을 좋아하는 학생은 모두 몇 명인가요?`,
          table: [['반', ...items, '합계'], rowA, rowB],
          answer: { type: 'num', value: mx, unit: '명' },
          steps: [
            `㉠: $${sum(A)}-${A.filter((_x, i) => i !== ia).join('-')}=${A[ia]}$`,
            `㉡: $${sum(B)}-${B.filter((_x, i) => i !== ib).join('-')}=${B[ib]}$`,
            `두 반의 합: ${items.map((it, i) => `${it} $${S[i]}$명`).join(', ')}`,
            `가장 많은 것은 ${top} $${mx}$명`,
            `답: $${mx}$명`,
          ],
          hint: '먼저 합계를 이용해 빈칸을 채워요.',
        };
      },
    },
    {
      id: 'top-vote-remaining',
      title: '남은 사람이 투표한 뒤의 결과',
      gen(r): ProblemDraft {
        const items = r.sample(['피구', '축구', '줄넘기', '달리기', '술래잡기'], 3);
        const [a, b, c, k, kind] = until(
          () => [r.int(3, 9), r.int(4, 12), r.int(1, 6), r.int(4, 10), r.int(0, 1)],
          ([a, b, c, k, kind]) => {
            if (b <= a || c >= a) return false;
            if (kind === 0) return (b - a + k + 1) % 2 === 0 && (b - a + k + 1) / 2 <= k && (b - a + k + 1) / 2 >= 1;
            return b - a + 1 <= k && a + (b - a + 1) > c + k - (b - a + 1);
          },
        );
        const lead =
          `반 친구들이 하고 싶은 놀이에 투표하고 있어요. 지금까지 ${J(items[0], '은')} $${a}$표, ${J(items[1], '는')} $${b}$표, ${J(items[2], '은')} $${c}$표를 받았고, 아직 $${k}$명이 투표하지 않았어요.`
            .replace(`${J(items[1], '는')}`, `${items[1]}${jo(items[1], '는')}`)
            .replace(`${J(items[2], '은')}`, `${items[2]}${jo(items[2], '은')}`);
        if (kind === 0) {
          const x = (b - a + k + 1) / 2;
          const rows = range(Math.max(0, x - 2), Math.min(k, x + 1)).map((t) => `${items[0]} $${t}$명, ${items[1]} $${k - t}$명 → $${a + t}$표와 $${b + k - t}$표`);
          return {
            q: `${lead} 남은 $${k}$명이 모두 ${J(items[0], '와')} ${items[1]} 중 하나에 투표했더니, ${J(items[0], '이')} ${items[1]}보다 $1$표 더 많아졌어요. 남은 사람 중에서 ${items[0]}에 투표한 사람은 몇 명인가요?`,
            answer: { type: 'num', value: x, unit: '명' },
            steps: [`남은 $${k}$명을 두 놀이에 나누어 보며 표 수를 비교해요.`, ...rows, `${items[0]}가 $1$표 더 많은 것은 ${items[0]} $${x}$명일 때 ($${a + x}$표와 $${b + k - x}$표)`, `답: $${x}$명`],
            hint: '남은 사람 수를 나누는 경우를 표로 만들어 보세요.',
          };
        }
        const x = b - a + 1;
        return {
          q: `${lead} ${J(items[0], '이')} 혼자 가장 많은 표를 받으려면 남은 $${k}$명 중에서 적어도 몇 명이 ${items[0]}에 투표해야 하나요? (나머지 사람은 ${items[2]}에 투표해요.)`,
          answer: { type: 'num', value: x, unit: '명' },
          steps: [
            `지금 가장 많은 것은 ${items[1]} $${b}$표예요.`,
            `나머지가 ${items[2]}에 투표해도 ${items[2]}는 많아야 $${c + k}$표${c + k >= a + x ? '' : ''}예요.`,
            `${items[0]}가 ${items[1]}보다 많으려면 $${b + 1}$표 이상: $${a}+$ □ $\\ge ${b + 1}$ → □ $\\ge ${x}$`,
            `${items[0]} $${a + x}$표, ${items[2]} $${c + k - x}$표이니 ${items[0]}가 혼자 가장 많아요.`,
            `답: $${x}$명`,
          ],
          hint: '지금 가장 많은 표를 받은 놀이와 비교해 보세요.',
        };
      },
    },
  ],
};

// ───────────────────────── e2b-6 규칙 찾기
const e2b6: HardSet = {
  skills: [
    {
      id: 'seq-nth',
      title: '규칙을 찾아 몇째 수 구하기',
      gen(r, level): ProblemDraft {
        const [a, d] = [r.int(1, 20), r.int(2, 9)];
        const seq = range(0, 30).map((i) => a + d * i);
        const show = seq
          .slice(0, 4)
          .map((v) => `$${v}$`)
          .join(', ');
        if (level === 1)
          return {
            q: `규칙에 따라 수를 늘어놓았어요.\n${show}, …\n여섯째 수는 무엇인가요?`,
            answer: { type: 'num', value: seq[5] },
            steps: [
              `$${d}$씩 커지는 규칙이에요.`,
              `${seq
                .slice(0, 6)
                .map((v) => `$${v}$`)
                .join(', ')}`,
              `여섯째 수: $${seq[5]}$`,
            ],
          };
        if (level === 2)
          return {
            q: `규칙에 따라 수를 늘어놓았어요.\n${show}, …\n열째 수는 무엇인가요?`,
            answer: { type: 'num', value: seq[9] },
            steps: [`$${d}$씩 커지는 규칙이에요.`, `열째 수는 첫째 수에서 $${d}$씩 $9$번 커진 수예요.`, `$${d}\\times9=${9 * d}$, $${a}+${9 * d}=${seq[9]}$`],
            hint: '열째 수까지 몇 번 커지는지 세어 보세요.',
          };
        const goal = r.int(a + 5 * d, a + 9 * d);
        const idx = seq.findIndex((v) => v > goal);
        return {
          q: `규칙에 따라 수를 늘어놓았어요.\n${show}, …\n처음으로 $${goal}$보다 큰 수는 몇째 수인가요?`.replace('보다보다', '보다'),
          answer: { type: 'num', value: idx + 1, unit: '째' },
          steps: [
            `$${d}$씩 커지는 규칙이에요.`,
            `이어 쓰면 ${seq
              .slice(0, idx + 1)
              .map((v) => `$${v}$`)
              .join(', ')}`,
            `${ORDS[idx]} 수 $${seq[idx - 1]}$${jo(seq[idx - 1], '은')} $${goal}$보다 크지 않고, ${ORDS[idx + 1] ?? `$${idx + 1}$째`} 수 $${seq[idx]}$${jo(seq[idx], '은')} 커요.`,
            `답: $${idx + 1}$째`,
          ],
          hint: '규칙대로 수를 이어 써 보세요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'top-repeat-sum',
      title: '되풀이되는 수를 늘어놓고 더하기',
      gen(r): ProblemDraft {
        const L = r.int(3, 4);
        const unit = until(
          () => range(1, L).map(() => r.int(1, 5)),
          (u) => new Set(u).size >= 2,
        );
        const us = sum(unit);
        const [n] = until(
          () => [r.int(2 * L + 1, 30)],
          ([n]) => {
            const g = Math.floor(n / L);
            const rem = n % L;
            return g * us + sum(unit.slice(0, rem)) <= 100 && rem > 0;
          },
        );
        const g = Math.floor(n / L);
        const rem = n % L;
        const S = g * us + sum(unit.slice(0, rem));
        const seq = [...unit, ...unit].map((v) => `$${v}$`).join(', ');
        if (r.chance(0.5)) {
          return {
            q: `규칙에 따라 수를 늘어놓았어요.\n${seq}, …\n첫째 수부터 $${n}$째 수까지 모두 더하면 얼마인가요?`,
            answer: { type: 'num', value: S },
            steps: [
              `${unit.map((v) => `$${v}$`).join(', ')}가 되풀이돼요. 한 묶음은 $${L}$개, 묶음의 합은 $${unit.join('+')}=${us}$`,
              `$${L}\\times${g}=${L * g}$ 이므로 $${n}$째까지는 $${g}$묶음과 $${rem}$개가 더 있어요.`,
              `$${g}$묶음의 합: $${us}\\times${g}=${g * us}$`,
              `남은 $${rem}$개: ${unit
                .slice(0, rem)
                .map((v) => `$${v}$`)
                .join(', ')} → $${sum(unit.slice(0, rem))}$`,
              `모두 $${g * us}+${sum(unit.slice(0, rem))}=${S}$`,
            ],
            hint: '되풀이되는 묶음 하나의 합을 먼저 구해 보세요.',
          };
        }
        const tgt = r.pick([...new Set(unit)]);
        const per = unit.filter((x) => x === tgt).length;
        const cnt = g * per + unit.slice(0, rem).filter((x) => x === tgt).length;
        return {
          q: `규칙에 따라 수를 늘어놓았어요.\n${seq}, …\n첫째 수부터 $${n}$째 수까지 늘어놓을 때 수 $${tgt}$는 모두 몇 번 나오나요?`,
          answer: { type: 'num', value: cnt, unit: '번' },
          steps: [
            `${unit.map((v) => `$${v}$`).join(', ')}가 되풀이돼요. 한 묶음에 $${tgt}$는 $${per}$번 있어요.`,
            `$${L}\\times${g}=${L * g}$ 이므로 $${n}$째까지는 $${g}$묶음과 $${rem}$개가 더 있어요.`,
            `$${g}$묶음에서: $${per}\\times${g}=${g * per}$ (번)`,
            `남은 $${rem}$개 ${unit
              .slice(0, rem)
              .map((v) => `$${v}$`)
              .join(', ')}에서: $${unit.slice(0, rem).filter((x) => x === tgt).length}$번`,
            `모두 $${cnt}$번`,
          ],
          hint: '되풀이되는 묶음이 몇 개인지 곱셈구구로 찾아보세요.',
        };
      },
    },
    {
      id: 'top-sticks-squares',
      title: '막대로 이어 만든 모양의 규칙',
      gen(r): ProblemDraft {
        const sq = r.chance(0.5);
        const shape = sq ? '사각형' : '삼각형';
        const per = sq ? 3 : 2; // 하나 늘 때 늘어나는 막대 수
        const f = (k: number) => per * k + 1;
        const k = r.int(5, 9);
        const head = `똑같은 막대로 ${J(shape, '을')} 옆으로 이어 붙여 만들고 있어요. ${shape} $1$개에는 막대 $${f(1)}$개, $2$개에는 $${f(2)}$개, $3$개에는 $${f(3)}$개가 필요해요.`;
        if (r.chance(0.5)) {
          return {
            q: `${head} 같은 규칙으로 ${shape} $${k}$개를 이어 만들려면 막대는 모두 몇 개 필요한가요?`,
            answer: { type: 'num', value: f(k), unit: '개' },
            steps: [
              `막대 수: $${f(1)}$, $${f(2)}$, $${f(3)}$ → ${shape}이 하나 늘 때마다 막대가 $${per}$개씩 늘어요.`,
              `처음 막대 $1$개에 ${shape}마다 $${per}$개씩 붙인다고 생각할 수 있어요.`,
              `$${per}\\times${k}=${per * k}$`,
              `$1+${per * k}=${f(k)}$`,
              `막대 $${f(k)}$개`,
            ],
            hint: '도형이 하나 늘 때 막대가 몇 개 늘어나는지 보세요.',
          };
        }
        return {
          q: `${head} 같은 규칙으로 막대 $${f(k)}$개를 모두 사용하면 ${J(shape, '을')} 몇 개 이어 만들 수 있나요?`,
          answer: { type: 'num', value: k, unit: '개' },
          steps: [
            `${shape}이 하나 늘 때마다 막대가 $${per}$개씩 늘어요.`,
            `막대 수는 $1$과 ($${per}\\times$ ${shape} 수)의 합이에요.`,
            `$${f(k)}-1=${per * k}$`,
            `$${per}\\times${k}=${per * k}$ 이므로 ${shape}은 $${k}$개`,
            `답: $${k}$개`,
          ],
          hint: '처음 1개를 빼고 생각해 보세요.',
        };
      },
    },
  ],
};

export const HARD_2: Record<string, HardSet> = {
  'e2a-1': e2a1,
  'e2a-2': e2a2,
  'e2a-3': e2a3,
  'e2a-4': e2a4,
  'e2a-5': e2a5,
  'e2a-6': e2a6,
  'e2b-1': e2b1,
  'e2b-2': e2b2,
  'e2b-3': e2b3,
  'e2b-4': e2b4,
  'e2b-5': e2b5,
  'e2b-6': e2b6,
};
