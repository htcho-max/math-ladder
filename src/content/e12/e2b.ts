// 초2-2: 네 자리 수 / 곱셈구구 / 길이 재기 / 시각과 시간 / 표와 그래프 / 규칙 찾기
import type { ContentMap } from '../../core/types';
import type { Rng } from '../../core/rng';
import { makeChoices } from '../../core/tex';
import { range } from '../../core/nt';
import { clock } from '../../core/fig';
import { names, sino, intChoices, lv, J } from './util';
import { placeCards, oGraph, arrowRow, cubeStages } from './draw';

const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** 달력 표 (첫 행 요일) */
function calendar(startDow: number, days: number): string[][] {
  const rows: string[][] = [DOW.slice()];
  let row: string[] = Array(startDow).fill('');
  for (let d = 1; d <= days; d++) {
    row.push(String(d));
    if (row.length === 7) {
      rows.push(row);
      row = [];
    }
  }
  if (row.length) rows.push([...row, ...Array(7 - row.length).fill('')]);
  return rows;
}

/** 시각 글 (오전/오후 선택) */
const hm = (h: number, m: number) => (m === 0 ? `${h}시` : `${h}시 ${m}분`);

function fourDigit(r: Rng, zeros: boolean): number {
  const ds = [r.int(1, 9), r.int(0, 9), r.int(0, 9), r.int(0, 9)];
  if (!zeros) for (let i = 1; i < 4; i++) if (ds[i] === 0) ds[i] = r.int(1, 9);
  if (zeros && !ds.slice(1).includes(0)) ds[r.int(1, 3)] = 0;
  return ds[0] * 1000 + ds[1] * 100 + ds[2] * 10 + ds[3];
}

export const e2b: ContentMap = {
  // ───────────────────────── 네 자리 수
  'e2b-1': {
    concepts: [
      {
        title: '1000 알아보기',
        body: '$900$보다 $100$만큼 더 큰 수를 $1000$이라 쓰고 **천**이라고 읽어요.\n- $100$이 $10$개이면 $1000$이에요.\n- $990$보다 $10$, $999$보다 $1$만큼 더 큰 수도 $1000$이에요.',
      },
      {
        title: '몇천과 네 자리 수',
        body: '$1000$이 $3$개이면 $3000$(삼천)이에요.\n$1000$이 $2$개, $100$이 $5$개, $10$이 $8$개, $1$이 $3$개이면 $2583$이에요. **이천오백팔십삼**이라고 읽어요.\n- $0$인 자리는 읽지 않아요. $4060$ → 사천육십',
      },
      {
        title: '자릿값',
        body: '$2583$에서 $2$는 천의 자리 숫자로 $2000$, $5$는 백의 자리 숫자로 $500$, $8$은 십의 자리 숫자로 $80$, $3$은 일의 자리 숫자로 $3$을 나타내요.\n$$2583 = 2000+500+80+3$$',
      },
      {
        title: '뛰어 세기',
        body: '- $1000$씩: 천의 자리 숫자가 $1$씩 커져요.\n- $100$씩: 백의 자리 숫자가 $1$씩 커져요.\n- $10$씩, $1$씩도 같은 방법이에요. 2학년 1학기 세 자리 수의 뛰어 세기와 같아요.',
      },
      {
        title: '네 자리 수의 크기 비교',
        body: '**천의 자리부터** 차례로 비교해요. 높은 자리 숫자가 큰 수가 더 커요.\n- $5321 > 4987$\n- $3468 < 3472$ (천·백의 자리가 같아서 십의 자리 비교)',
      },
    ],
    skills: [
      {
        id: 'cards',
        title: '수 카드로 나타내기',
        gen(r, level) {
          if (level === 3) {
            const a = r.int(1, 6);
            const b = r.int(10, 15);
            const c = r.int(0, 9);
            const n = a * 1000 + b * 100 + c * 10;
            return {
              q: `$1000$이 $${a}$개, $100$이 $${b}$개, $10$이 $${c}$개인 수는 얼마인가요?`,
              answer: { type: 'num', value: n },
              steps: [`$100$이 $${b}$개 → $${b * 100}$ ($1000$이 $1$개, $100$이 $${b - 10}$개)`, `$${a * 1000}+${b * 100}+${c * 10}=${n}$`],
              hint: '100이 10개면 1000이에요.',
            };
          }
          const counts: [number, number, number, number] = [r.int(1, 5), r.int(level === 1 ? 1 : 0, 6), r.int(level === 1 ? 1 : 0, 6), r.int(level === 1 ? 1 : 0, 6)];
          const n = counts[0] * 1000 + counts[1] * 100 + counts[2] * 10 + counts[3];
          return {
            q: '수 카드가 나타내는 수는 얼마인가요?',
            fig: placeCards(counts),
            answer: { type: 'num', value: n },
            steps: [`$1000$이 $${counts[0]}$개, $100$이 $${counts[1]}$개, $10$이 $${counts[2]}$개, $1$이 $${counts[3]}$개`, `$${n}$`],
          };
        },
      },
      {
        id: 'place-value',
        title: '자릿값',
        gen(r, level) {
          const n = fourDigit(r, false);
          const ds = String(n).split('').map(Number);
          if (level === 1) {
            const pos = r.int(0, 3);
            const names4 = ['천', '백', '십', '일'];
            return {
              q: `$${n}$에서 ${names4[pos]}의 자리 숫자는 무엇이고, 얼마를 나타내나요?`,
              answer: { type: 'fields', fields: [{ label: '숫자', value: ds[pos] }, { label: '나타내는 값', value: ds[pos] * 10 ** (3 - pos) }] },
              steps: [`$${n}$의 ${names4[pos]}의 자리 숫자는 $${ds[pos]}$`, `$${ds[pos] * 10 ** (3 - pos)}$을 나타내요.`],
            };
          }
          if (level === 2) {
            return {
              q: `$${n}$을 각 자리 숫자가 나타내는 값의 합으로 바르게 나타낸 것을 고르세요.`,
              // 자리를 바꾼 오답이 (같은 숫자라서) 실제로는 맞는 식이 되면 빼기
              answer: makeChoices(
                r,
                `$${ds[0] * 1000}+${ds[1] * 100}+${ds[2] * 10}+${ds[3]}$`,
                (
                  [
                    [ds[0] * 100, ds[1] * 100, ds[2] * 10, ds[3]],
                    [ds[0] * 1000, ds[1] * 10, ds[2] * 100, ds[3]],
                    [ds[0], ds[1], ds[2], ds[3]],
                    [ds[0] * 1000, ds[1] * 100, ds[2], ds[3] * 10],
                    [ds[0] * 100, ds[1] * 1000, ds[2] * 10, ds[3]],
                  ] as number[][]
                )
                  .filter((t) => t.reduce((a, b) => a + b, 0) !== n)
                  .map((t) => `$${t.join('+')}$`),
              ),
              steps: [`천의 자리 $${ds[0]}$ → $${ds[0] * 1000}$, 백의 자리 $${ds[1]}$ → $${ds[1] * 100}$, 십의 자리 $${ds[2]}$ → $${ds[2] * 10}$, 일의 자리 $${ds[3]}$`],
            };
          }
          const d = r.int(1, 9);
          const nums: number[] = [];
          const vals: number[] = [];
          const poss = r.shuffle([0, 1, 2, 3]);
          for (const p of poss) {
            const xs = [r.int(1, 9), r.int(0, 9), r.int(0, 9), r.int(0, 9)].map((v, i) => (v === d ? (i === 0 ? (d % 9) + 1 : (d + 1) % 10) : v));
            xs[p] = d;
            nums.push(Number(xs.join('')));
            vals.push(d * 10 ** (3 - p));
          }
          const big = r.chance(0.5);
          const i = vals.indexOf(big ? Math.max(...vals) : Math.min(...vals));
          return {
            q: `숫자 $${d}$가 나타내는 값이 가장 ${big ? '큰' : '작은'} 수를 고르세요.`,
            answer: makeChoices(r, `$${nums[i]}$`, nums.filter((_, j) => j !== i).map((x) => `$${x}$`)),
            steps: [nums.map((x, j) => `$${x}$ → $${vals[j]}$`).join(', '), `가장 ${big ? '큰' : '작은'} 것은 $${nums[i]}$`],
          };
        },
      },
      {
        id: 'read-write',
        title: '네 자리 수 읽고 쓰기',
        gen(r, level) {
          const n = level === 1 ? fourDigit(r, false) : fourDigit(r, true);
          const ds = String(n).split('').map(Number);
          if (level === 3 || r.chance(0.5)) {
            const wr = [
              Number(`${ds[0]}000${ds[1]}${ds[2]}${ds[3]}`.slice(0, 7)),
              Number(String(n).replace(/0/g, '')),
              n + 1000,
              Number(`${ds[0]}${ds[2]}${ds[1]}${ds[3]}`),
              n + 10,
            ].filter((x) => x !== n && x > 0);
            return {
              q: `'${sino(n)}'을 수로 바르게 쓴 것을 고르세요.`,
              answer: intChoices(r, n, wr, { min: 1 }),
              steps: [`천 $${ds[0]}$, 백 $${ds[1]}$, 십 $${ds[2]}$, 일 $${ds[3]}$`, `$${n}$ ${ds.slice(1).includes(0) ? '(읽지 않은 자리에는 $0$을 써요)' : ''}`],
            };
          }
          const wr = [n + 1, n + 100, n + 1000 < 10000 ? n + 1000 : n - 1000, Number(`${ds[0]}${ds[2]}${ds[1]}${ds[3]}`)].filter((x) => x !== n && x < 10000).map(sino);
          return {
            q: `$${n}$을 바르게 읽은 것을 고르세요.`,
            answer: makeChoices(r, sino(n), wr),
            steps: [`$${n}=${ds[0] * 1000}+${ds[1] * 100}+${ds[2] * 10}+${ds[3]}$`, sino(n)],
          };
        },
      },
      {
        id: 'skip-count',
        title: '뛰어 세기',
        gen(r, level) {
          const step = r.pick([1000, 100, 10, 1]);
          if (level === 3) {
            const k = r.int(3, 5);
            const st = r.int(1000, 9999 - k * step);
            const end = st + k * step;
            return {
              q: `어떤 수에서 $${step}$씩 $${k}$번 뛰어 세었더니 $${end}$가 되었어요. 어떤 수는 얼마인가요?`,
              answer: { type: 'num', value: st },
              steps: [`거꾸로 $${step}$씩 $${k}$번 뛰어 세어요.`, `$${range(0, k).map((i) => end - i * step).join(' \\to ')}$`],
            };
          }
          const s = level === 1 ? r.pick([1000, 100]) : step;
          const st = r.int(1000, 9999 - 4 * s);
          const seq = range(0, 4).map((i) => st + i * s);
          const hole = level === 1 ? 4 : r.int(1, 4);
          return {
            q: `${level === 1 ? `$${s}$씩 뛰어 세었어요. ` : '규칙에 따라 뛰어 세었어요. '}빈칸에 알맞은 수를 쓰세요.\n$$${seq.map((x, i) => (i === hole ? '\\square' : x)).join(',\\ ')}$$`,
            answer: { type: 'num', value: seq[hole] },
            steps: [`$${s}$씩 뛰어 세면 ${s === 1000 ? '천' : s === 100 ? '백' : s === 10 ? '십' : '일'}의 자리 숫자가 $1$씩 커져요.`, `빈칸은 $${seq[hole]}$`],
          };
        },
      },
      {
        id: 'compare',
        title: '크기 비교',
        gen(r, level) {
          if (level === 3) {
            let cards = r.sample(range(0, 9), 4);
            if (!cards.includes(0) && r.chance(0.6)) cards[r.int(0, 3)] = 0;
            cards = [...new Set(cards)];
            while (cards.length < 4) cards.push(r.pick(range(1, 9).filter((x) => !cards.includes(x))));
            const big = r.chance(0.5);
            const sorted = [...cards].sort((a, b) => b - a);
            let ans: number;
            let why: string;
            if (big) {
              ans = Number(sorted.join(''));
              why = '큰 숫자부터 천의 자리에 차례로 놓아요.';
            } else {
              const asc = [...cards].sort((a, b) => a - b);
              if (asc[0] === 0) {
                const first = asc[1];
                const rest = asc.filter((_, i) => i !== 1);
                ans = Number([first, ...rest].join(''));
                why = '천의 자리에는 $0$을 놓을 수 없으니 $0$ 다음으로 작은 숫자를 놓고, 나머지는 작은 숫자부터 놓아요.';
              } else {
                ans = Number(asc.join(''));
                why = '작은 숫자부터 천의 자리에 차례로 놓아요.';
              }
            }
            return {
              q: `수 카드 $${cards.join('$, $')}$를 한 번씩 모두 사용하여 네 자리 수를 만들려고 해요. 가장 ${big ? '큰' : '작은'} 수는 무엇인가요?`,
              answer: { type: 'num', value: ans },
              steps: [why, `가장 ${big ? '큰' : '작은'} 수: $${ans}$`],
            };
          }
          const a = fourDigit(r, r.chance(0.3));
          let b: number;
          if (level === 1) {
            do b = fourDigit(r, false);
            while (Math.floor(b / 1000) === Math.floor(a / 1000));
          } else {
            do b = Math.floor(a / 100) * 100 + r.int(0, 99);
            while (b === a);
          }
          const sign = a > b ? '>' : '<';
          return {
            q: `두 수의 크기를 비교하여 $\\bigcirc$ 안에 알맞은 것을 고르세요.\n$$${a}\\ \\bigcirc\\ ${b}$$`,
            answer: makeChoices(r, `$${sign}$`, [`$${sign === '>' ? '<' : '>'}$`, '$=$']),
            steps: [level === 1 ? `천의 자리 숫자를 비교해요: $${Math.floor(a / 1000)}$와 $${Math.floor(b / 1000)}$` : '천·백의 자리가 같으니 십의 자리, 일의 자리 순서로 비교해요.', `$${a} ${sign} ${b}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 곱셈구구
  'e2b-2': {
    concepts: [
      {
        title: '2단, 5단 곱셈구구',
        body: '- $2$단: 곱이 $2$씩 커져요. $2, 4, 6, 8, 10, 12, 14, 16, 18$\n- $5$단: 곱이 $5$씩 커지고, 일의 자리가 $5$와 $0$이 번갈아 나와요.\n- 2학년 1학기 "묶어 세기"를 외워 두는 것이 곱셈구구예요.',
      },
      {
        title: '3단, 6단 / 4단, 8단',
        body: '- $3$단은 $3$씩, $6$단은 $6$씩 커져요. $6$단의 곱은 $3$단의 곱의 $2$배예요.\n- $4$단은 $4$씩, $8$단은 $8$씩 커져요. $8$단의 곱은 $4$단의 곱의 $2$배예요.',
      },
      {
        title: '7단, 9단',
        body: '- $7$단: $7, 14, 21, 28, 35, 42, 49, 56, 63$\n- $9$단: $9, 18, 27, 36, 45, 54, 63, 72, 81$ (십의 자리와 일의 자리 숫자의 합이 $9$)',
      },
      {
        title: '1단과 0의 곱',
        body: '- $1\\times$(어떤 수) $=$ (어떤 수). $1\\times 7=7$\n- $0\\times$(어떤 수) $=0$, (어떤 수)$\\times 0=0$\n- 예: 과녁의 $0$점에 $3$번 맞히면 $0\\times 3=0$(점)',
      },
      {
        title: '곱셈표',
        body: '- 곱하는 두 수의 순서를 바꾸어도 곱은 같아요. $3\\times 5=5\\times 3$\n- 곱셈표에서 $\\square$단의 수는 $\\square$씩 커져요.',
      },
    ],
    skills: [
      {
        id: 'fact',
        title: '곱셈구구 계산',
        gen(r, level) {
          const dan = r.pick(lv(level, [2, 5, 3], [4, 6, 8, 3], [7, 9, 6, 8]));
          const k = r.int(level === 3 ? 0 : 1, 9);
          const ans = dan * k;
          const swap = r.chance(0.3);
          return {
            q: `계산해 보세요.\n$$${swap ? `${k}\\times ${dan}` : `${dan}\\times ${k}`}=\\square$$`,
            answer: { type: 'num', value: ans },
            steps: k === 0 ? ['어떤 수와 $0$의 곱은 항상 $0$이에요.', `$${dan}\\times 0=0$`] : [`${dan}단: $${range(1, k).map((i) => dan * i).join(', ')}$`, `$${dan}\\times ${k}=${ans}$${swap ? ` (순서를 바꾸어도 곱은 같아요)` : ''}`],
          };
        },
      },
      {
        id: 'box',
        title: '□ 안에 알맞은 수',
        gen(r, level) {
          const dan = r.int(2, 9);
          const k = r.int(2, 9);
          if (level === 3) {
            const t = r.int(dan * 2 + 1, dan * 9 - 1);
            const ans = Math.floor(t / dan) + 1;
            return {
              q: `$\\square$ 안에 들어갈 수 있는 가장 작은 수를 구하세요.\n$$${dan}\\times\\square > ${t}$$`,
              answer: { type: 'num', value: ans },
              steps: [`${dan}단에서 $${t}$보다 큰 곱을 찾아요.`, `$${dan}\\times ${ans - 1}=${dan * (ans - 1)}$, $${dan}\\times ${ans}=${dan * ans}$`, `가장 작은 수는 $${ans}$`],
            };
          }
          const front = level === 2 && r.chance(0.5);
          return {
            q: `$\\square$ 안에 알맞은 수를 쓰세요.\n$$${front ? `\\square\\times ${k}` : `${dan}\\times\\square`}=${dan * k}$$`,
            answer: { type: 'num', value: front ? dan : k },
            steps: front ? [`$${k}$단에서 곱이 $${dan * k}$인 것을 찾아요.`, `$${dan}\\times ${k}=${dan * k}$`] : [`${dan}단에서 곱이 $${dan * k}$인 것을 찾아요.`, `$${dan}\\times ${k}=${dan * k}$`],
          };
        },
      },
      {
        id: 'word',
        title: '곱셈구구 이야기 문제',
        gen(r, level) {
          const ctx: [string, string, number | null][] = [
            ['문어 한 마리의 다리는 $8$개예요. 문어', '마리', 8],
            ['세발자전거 한 대의 바퀴는 $3$개예요. 세발자전거', '대', 3],
            ['자동차 한 대의 바퀴는 $4$개예요. 자동차', '대', 4],
            ['한 상자에 도넛이 $6$개씩 들어 있어요. 상자', '상자', 6],
            ['한 묶음에 연필이 $7$자루씩 있어요. 연필', '묶음', 7],
            ['한 봉지에 사탕이 $9$개씩 들어 있어요. 사탕', '봉지', 9],
          ];
          const [lead, u, per] = r.pick(ctx);
          const k = r.int(2, level === 1 ? 5 : 9);
          if (level < 3) {
            const pp = per ?? 2;
            const what = lead.includes('다리') ? '다리' : lead.includes('바퀴') ? '바퀴' : lead.includes('도넛') ? '도넛' : lead.includes('연필') ? '연필' : '사탕';
            return {
              q: `${lead.replace(/\. [^.]*$/, '.')} $${k}$${u}의 ${J(what, '은')} 모두 몇 ${what === '연필' ? '자루' : '개'}인가요?`,
              answer: { type: 'num', value: pp * k, unit: what === '연필' ? '자루' : '개' },
              steps: [`$${pp}$씩 $${k}$묶음 → $${pp}\\times ${k}$`, `$${pp}\\times ${k}=${pp * k}$`],
            };
          }
          const [p1] = names(r, 1);
          const a = r.int(3, 9);
          const b = r.int(2, 9);
          const c = r.int(2, 9);
          return {
            q: `${p1}는 한 줄에 $${a}$개씩 $${b}$줄로 놓인 초콜릿을 받고, 낱개로 $${c}$개를 더 받았어요. ${p1}가 받은 초콜릿은 모두 몇 개인가요?`,
            answer: { type: 'num', value: a * b + c, unit: '개' },
            steps: [`$${a}\\times ${b}=${a * b}$`, `$${a * b}+${c}=${a * b + c}$ (개)`],
          };
        },
      },
      {
        id: 'table',
        title: '곱셈표',
        gen(r, level) {
          if (level === 3) {
            const targets = [6, 8, 12, 16, 18, 24, 36];
            const t = r.pick(targets);
            const pairs: string[] = [];
            for (let a = 1; a <= 9; a++) for (let b = 1; b <= 9; b++) if (a * b === t) pairs.push(`$${a}\\times ${b}$`);
            return {
              q: `$1$단부터 $9$단까지의 곱셈표에서 곱이 $${t}$인 칸은 모두 몇 개인가요?`,
              answer: { type: 'num', value: pairs.length, unit: '개' },
              steps: [`곱이 $${t}$인 곱셈: ${pairs.join(', ')}`, `$${pairs.length}$개`],
              hint: '곱하는 두 수의 순서를 바꾼 것도 따로 세어요.',
            };
          }
          const rows = r.sample(range(2, 9), 3).sort((a, b) => a - b);
          const c0 = r.int(1, 5);
          const cols = range(c0, c0 + 4);
          const si = r.int(0, 2);
          const sj = r.int(0, 4);
          const table: string[][] = [['$\\times$', ...cols.map((c) => `$${c}$`)]];
          rows.forEach((rv, i) => table.push([`$${rv}$`, ...cols.map((c, j) => (i === si && j === sj ? '$\\bigstar$' : level === 2 && j !== 0 && (i + j) % 2 === 1 ? '' : `$${rv * c}$`))]));
          const ans = rows[si] * cols[sj];
          return {
            q: '곱셈표의 일부분이에요. ★에 알맞은 수를 쓰세요.',
            table,
            answer: { type: 'num', value: ans },
            steps: [`★은 $${rows[si]}$단의 $${cols[sj]}$번째 칸이에요.`, `$${rows[si]}\\times ${cols[sj]}=${ans}$`],
          };
        },
      },
      {
        id: 'compare',
        title: '곱의 크기 비교',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(2, 9);
            const b = r.pick(range(2, 9).filter((x) => x !== a)); // 두 수가 같으면 순서를 바꾼 식이 문제와 똑같아짐
            return {
              q: `곱이 같은 것을 고르세요.\n$$${a}\\times ${b}$$`,
              answer: makeChoices(r, `$${b}\\times ${a}$`, [`$${a}\\times ${b + 1}$`, `$${a + 1}\\times ${b}$`, `$${a}+${b}$`, `$${b}\\times ${b}$`].filter((x) => x !== `$${b}\\times ${a}$`)),
              steps: ['곱하는 두 수의 순서를 바꾸어도 곱은 같아요.', `$${a}\\times ${b}=${b}\\times ${a}=${a * b}$`],
            };
          }
          let es: { t: string; v: number }[] = [];
          for (let g = 0; g < 100; g++) {
            es = range(1, 4).map(() => {
              const a = r.int(2, 9);
              const b = r.int(2, 9);
              return { t: `$${a}\\times ${b}$`, v: a * b };
            });
            if (new Set(es.map((e) => e.v)).size === 4) break;
          }
          if (level === 2) {
            const big = r.chance(0.5);
            const best = es.reduce((p, q) => ((big ? q.v > p.v : q.v < p.v) ? q : p));
            return {
              q: `곱이 가장 ${big ? '큰' : '작은'} 것을 고르세요.`,
              answer: makeChoices(r, best.t, es.filter((e) => e !== best).map((e) => e.t)),
              steps: [es.map((e) => `${e.t.slice(0, -1)}=${e.v}$`).join(', '), `가장 ${big ? '큰' : '작은'} 것: ${best.t}`],
            };
          }
          // 곱이 다른 하나
          const a = r.int(2, 4);
          const b = r.pick([6, 8, 9]);
          const v = a * b;
          const same: string[] = [];
          for (let x = 1; x <= 9; x++) if (v % x === 0 && v / x <= 9) same.push(`$${x}\\times ${v / x}$`);
          const picks = r.sample(same, Math.min(3, same.length));
          let ox: number, oy: number;
          do {
            ox = r.int(2, 9);
            oy = r.int(2, 9);
          } while (Math.abs(ox * oy - v) > 4 || ox * oy === v);
          const odd = `$${ox}\\times ${oy}$`;
          return {
            q: '곱이 **다른** 하나를 고르세요.',
            answer: makeChoices(r, odd, picks),
            steps: [`${picks.map((p) => p.slice(0, -1) + `=${v}$`).join(', ')}`, `${odd.slice(0, -1)}=${ox * oy}$`],
          };
        },
      },
      {
        id: 'zero-one',
        title: '1단과 0의 곱',
        gen(r, level) {
          if (level === 1) {
            const n = r.int(2, 9);
            const kind = r.int(0, 3);
            const forms = [`1\\times ${n}`, `${n}\\times 1`, `0\\times ${n}`, `${n}\\times 0`];
            const ans = kind < 2 ? n : 0;
            return {
              q: `계산해 보세요.\n$$${forms[kind]}=\\square$$`,
              answer: { type: 'num', value: ans },
              steps: [kind < 2 ? '$1$과 어떤 수의 곱은 항상 어떤 수예요.' : '$0$과 어떤 수의 곱은 항상 $0$이에요.', `$${forms[kind]}=${ans}$`],
            };
          }
          const [p] = names(r, 1);
          const scores = level === 2 ? [0, 1, 2] : [0, 1, 3];
          const hits = scores.map(() => r.int(0, 5));
          if (!hits.some((h) => h > 0)) hits[1] = 2;
          const tot = scores.reduce((a, s, i) => a + s * hits[i], 0);
          return {
            q: `${p}가 공 던지기를 했어요. 표를 보고 ${p}가 얻은 점수는 모두 몇 점인지 구하세요.`,
            table: [['점수', ...scores.map((s) => `$${s}$점`)], ['맞힌 횟수', ...hits.map((h) => `$${h}$번`)]],
            answer: { type: 'num', value: tot, unit: '점' },
            steps: [...scores.map((s, i) => `$${s}\\times ${hits[i]}=${s * hits[i]}$`).slice(0, 3), `$${scores.map((s, i) => s * hits[i]).join('+')}=${tot}$ (점)`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 길이 재기 (m)
  'e2b-3': {
    concepts: [
      {
        title: '1 m',
        body: '$100$ cm를 **1 m**(1 미터)라고 해요.\n$$1\\text{ m} = 100\\text{ cm}$$\n- 2학년 1학기에 배운 cm보다 긴 길이를 잴 때 m를 써요.',
      },
      {
        title: '몇 m 몇 cm',
        body: '$130$ cm는 $1$ m보다 $30$ cm 더 길어요. **1 m 30 cm**라고 쓰고 "1 미터 30 센티미터"라고 읽어요.\n- $1$ m $30$ cm $= 130$ cm\n- $2$ m $5$ cm $= 205$ cm (가운데 $0$에 주의!)',
      },
      {
        title: '줄자로 길이 재기',
        body: '긴 물건은 **줄자**로 재요. 한쪽 끝을 줄자의 $0$에 맞추고 다른 쪽 끝의 눈금을 읽어요.',
      },
      {
        title: '길이의 합과 차',
        body: 'm는 m끼리, cm는 cm끼리 계산해요.\n- $1$ m $20$ cm $+ 2$ m $35$ cm $= 3$ m $55$ cm\n- $3$ m $70$ cm $- 1$ m $40$ cm $= 2$ m $30$ cm\n- cm끼리 더해서 $100$이 넘으면 $1$ m로 바꾸어요.',
      },
      {
        title: '길이 어림하기',
        body: '내 몸의 일부로 $1$ m를 어림할 수 있어요.\n- 양팔을 벌린 길이, 몇 걸음 등이 약 $1$ m예요.\n- 교실 문의 높이는 약 $2$ m, 칠판 긴 쪽은 약 $4$ m예요.',
      },
    ],
    skills: [
      {
        id: 'convert',
        title: 'm와 cm 바꾸기',
        gen(r, level) {
          const m = r.int(1, 9);
          const cm = level === 3 ? r.int(1, 9) : r.int(10, 99);
          const tot = m * 100 + cm;
          if (level === 2) {
            return {
              q: `$${tot}$ cm는 몇 m 몇 cm인가요?`,
              answer: { type: 'fields', fields: [{ label: 'm', value: m }, { label: 'cm', value: cm }] },
              steps: [`$${tot}$ cm $= ${m * 100}$ cm $+ ${cm}$ cm`, `$= ${m}$ m $${cm}$ cm`],
            };
          }
          return {
            q: `$${m}$ m $${cm}$ cm는 몇 cm인가요?`,
            answer: level === 3 ? intChoices(r, tot, [m * 100 + cm * 10, m * 10 + cm, m * 1000 + cm], { min: 1 }) : { type: 'num', value: tot, unit: 'cm' },
            steps: [`$${m}$ m $= ${m * 100}$ cm`, `$${m * 100}+${cm}=${tot}$ (cm)`],
            hint: level === 3 ? '1 m = 100 cm 이므로 cm 자리가 한 자리 수이면 0을 채워야 해요.' : undefined,
          };
        },
      },
      {
        id: 'add',
        title: '길이의 합',
        gen(r, level) {
          const m1 = r.int(1, 5);
          const m2 = r.int(1, 4);
          let c1 = r.int(10, 60);
          let c2 = r.int(10, 39);
          if (level === 3) {
            c1 = r.int(50, 90);
            c2 = r.int(110 - c1, 95);
          }
          const tc = c1 + c2;
          const carry = tc >= 100 ? 1 : 0;
          const ansM = m1 + m2 + carry;
          const ansC = tc - carry * 100;
          if (level === 1) {
            return {
              q: `계산해 보세요.\n$$${m1}\\text{ m } ${c1}\\text{ cm} + ${m2}\\text{ m } ${c2}\\text{ cm}$$`,
              answer: { type: 'fields', fields: [{ label: 'm', value: ansM }, { label: 'cm', value: ansC }] },
              steps: [`cm끼리: $${c1}+${c2}=${tc}$`, `m끼리: $${m1}+${m2}=${m1 + m2}$`, `$${ansM}$ m $${ansC}$ cm`],
            };
          }
          const what = r.pick(['리본', '끈', '색 테이프']);
          return {
            q: `길이가 $${m1}$ m $${c1}$ cm인 ${what}와 $${m2}$ m $${c2}$ cm인 ${what}를 겹치지 않게 이었어요. 이은 ${what}의 길이는 몇 m 몇 cm인가요?`,
            answer: { type: 'fields', fields: [{ label: 'm', value: ansM }, { label: 'cm', value: ansC }] },
            steps: carry
              ? [`cm끼리: $${c1}+${c2}=${tc}$ → $100$ cm $=1$ m로 바꾸면 $1$ m $${ansC}$ cm`, `m끼리: $${m1}+${m2}+1=${ansM}$`, `$${ansM}$ m $${ansC}$ cm`]
              : [`cm끼리: $${c1}+${c2}=${tc}$`, `m끼리: $${m1}+${m2}=${m1 + m2}$`, `$${ansM}$ m $${ansC}$ cm`],
          };
        },
      },
      {
        id: 'sub',
        title: '길이의 차',
        gen(r, level) {
          const m1 = r.int(3, 9);
          const m2 = r.int(1, level === 3 ? m1 - 2 : m1 - 1);
          let c1 = r.int(30, 99);
          let c2 = r.int(10, c1);
          if (level === 3) {
            c1 = r.int(10, 50);
            c2 = r.int(c1 + 1, 95);
          }
          const borrow = c2 > c1 ? 1 : 0;
          const ansM = m1 - m2 - borrow;
          const ansC = c1 + borrow * 100 - c2;
          if (level === 1) {
            return {
              q: `계산해 보세요.\n$$${m1}\\text{ m } ${c1}\\text{ cm} - ${m2}\\text{ m } ${c2}\\text{ cm}$$`,
              answer: { type: 'fields', fields: [{ label: 'm', value: ansM }, { label: 'cm', value: ansC }] },
              steps: [`cm끼리: $${c1}-${c2}=${ansC}$`, `m끼리: $${m1}-${m2}=${ansM}$`, `$${ansM}$ m $${ansC}$ cm`],
            };
          }
          const [p1, p2] = names(r, 2);
          return {
            q: `${p1}의 리본은 $${m1}$ m $${c1}$ cm, ${p2}의 리본은 $${m2}$ m $${c2}$ cm예요. ${p1}의 리본은 ${p2}의 리본보다 몇 m 몇 cm 더 긴가요?`,
            answer: { type: 'fields', fields: [{ label: 'm', value: ansM }, { label: 'cm', value: ansC }] },
            steps: borrow
              ? [`cm끼리 뺄 수 없으니 $1$ m를 $100$ cm로 바꾸어요: $${m1 - 1}$ m $${c1 + 100}$ cm`, `cm: $${c1 + 100}-${c2}=${ansC}$, m: $${m1 - 1}-${m2}=${ansM}$`, `$${ansM}$ m $${ansC}$ cm`]
              : [`cm끼리: $${c1}-${c2}=${ansC}$`, `m끼리: $${m1}-${m2}=${ansM}$`, `$${ansM}$ m $${ansC}$ cm`],
          };
        },
      },
      {
        id: 'estimate',
        title: '알맞은 단위와 어림',
        gen(r, level) {
          if (level === 1) {
            const items: [string, string][] = [
              ['교실 문의 높이', 'm'],
              ['칠판의 긴 쪽 길이', 'm'],
              ['버스의 길이', 'm'],
              ['수영장의 길이', 'm'],
              ['연필의 길이', 'cm'],
              ['공책의 짧은 쪽 길이', 'cm'],
              ['숟가락의 길이', 'cm'],
              ['운동화의 길이', 'cm'],
            ];
            const [what, u] = r.pick(items);
            return {
              q: `${what}를 잴 때 알맞은 단위는 무엇인가요?`,
              answer: makeChoices(r, u, [u === 'm' ? 'cm' : 'm']),
              steps: [u === 'm' ? '$1$ m보다 긴 것은 m로 나타내는 것이 편해요.' : '$1$ m보다 짧은 것은 cm로 나타내요.', `답: ${u}`],
            };
          }
          if (level === 2) {
            const facts: [string, string, string[]][] = [
              ['교실 문의 높이', '약 $2$ m', ['약 $2$ cm', '약 $20$ m', '약 $20$ cm']],
              ['어른 양팔을 벌린 길이', '약 $1$ m $60$ cm', ['약 $16$ cm', '약 $16$ m', '약 $160$ m']],
              ['버스의 길이', '약 $10$ m', ['약 $10$ cm', '약 $100$ m', '약 $1$ m']],
              ['2학년 어린이의 키', '약 $1$ m $25$ cm', ['약 $12$ cm', '약 $12$ m', '약 $125$ m']],
              ['교실 칠판의 긴 쪽 길이', '약 $4$ m', ['약 $4$ cm', '약 $40$ m', '약 $40$ cm']],
            ];
            const [what, ans, wr] = r.pick(facts);
            return {
              q: `${what}로 알맞은 것을 고르세요.`,
              answer: makeChoices(r, ans, wr),
              steps: ['$1$ m는 $100$ cm, 양팔을 벌린 길이가 약 $1$ m예요.', `${what}는 ${ans}예요.`],
            };
          }
          const [p] = names(r, 1);
          const arm = r.pick([1, 1, 2]);
          const k = r.int(3, 9);
          const unit = arm === 1 ? '양팔을 벌린 길이' : '두 걸음';
          return {
            q: `${p}의 ${unit}는 약 $1$ m예요. ${p}가 ${unit}로 복도의 길이를 재었더니 약 $${k}$번이었어요. 복도의 길이는 약 몇 m인가요?`,
            answer: { type: 'num', value: k, unit: 'm' },
            steps: [`$1$ m가 약 $${k}$번이에요.`, `약 $${k}$ m`],
          };
        },
      },
      {
        id: 'compare',
        title: '길이 비교',
        gen(r, level) {
          if (level === 1) {
            const m = r.int(1, 5);
            const c = r.int(10, 90);
            const tot = m * 100 + c;
            const other = tot + r.pick([-12, -5, 5, 12, 30]);
            const sign = tot > other ? '>' : '<';
            return {
              q: `길이를 비교하여 $\\bigcirc$ 안에 알맞은 것을 고르세요.\n$$${m}\\text{ m } ${c}\\text{ cm}\\ \\bigcirc\\ ${other}\\text{ cm}$$`,
              answer: makeChoices(r, `$${sign}$`, [`$${sign === '>' ? '<' : '>'}$`, '$=$']),
              steps: [`$${m}$ m $${c}$ cm $= ${tot}$ cm`, `$${tot} ${sign} ${other}$`],
            };
          }
          const m = r.int(1, 4);
          const vals = r.sample([m * 100 + 5, m * 100 + 50, m * 100 + 15, (m + 1) * 100 + 2, m * 100 + 95], 4);
          const show = vals.map((v, i) => (i % 2 === 0 ? `$${Math.floor(v / 100)}$ m $${v % 100}$ cm` : `$${v}$ cm`));
          const big = level === 3 ? r.chance(0.5) : true;
          const target = big ? Math.max(...vals) : Math.min(...vals);
          const idx = vals.indexOf(target);
          return {
            q: `가장 ${big ? '긴' : '짧은'} 길이를 고르세요.`,
            answer: makeChoices(r, show[idx], show.filter((_, i) => i !== idx)),
            steps: [`모두 cm로 바꾸어 비교해요: ${vals.map((v) => `$${v}$`).join(', ')} (cm)`, `가장 ${big ? '긴' : '짧은'} 것은 $${target}$ cm → ${show[idx]}`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 시각과 시간
  'e2b-4': {
    concepts: [
      {
        title: '몇 시 몇 분 (5분 단위)',
        body: '시계의 긴바늘이 가리키는 숫자가 $1$이면 $5$분, $2$이면 $10$분, $3$이면 $15$분 … 을 나타내요.\n- 숫자 한 칸 = $5$분\n- 짧은바늘은 지나온 숫자를 읽어요.',
        example: { q: '짧은바늘이 4와 5 사이, 긴바늘이 7', a: '4시 35분' },
      },
      {
        title: '몇 시 몇 분 (1분 단위)',
        body: '긴바늘이 가리키는 작은 눈금 한 칸은 $1$분이에요.\n- 긴바늘이 $8$에서 작은 눈금 $2$칸 더 간 곳 → $40+2=42$분\n- 1학년의 "몇 시, 몇 시 30분"을 넓힌 거예요.',
      },
      {
        title: '몇 시 몇 분 전',
        body: '$2$시 $50$분은 $3$시가 되려면 $10$분이 더 있어야 해요. 그래서 **3시 10분 전**이라고도 해요.',
      },
      {
        title: '1시간 = 60분',
        body: '긴바늘이 시계를 **한 바퀴** 도는 데 걸리는 시간은 $60$분, 곧 **1시간**이에요.\n- $1$시간 $20$분 $= 80$분\n- $100$분 $= 1$시간 $40$분',
      },
      {
        title: '하루의 시간과 달력',
        body: '- 전날 밤 $12$시부터 낮 $12$시까지 **오전**, 낮 $12$시부터 밤 $12$시까지 **오후**예요.\n- **하루 = 24시간** (짧은바늘이 두 바퀴)\n- $1$주일 $=7$일, $1$년 $=12$개월\n- 날수: $31$일(1·3·5·7·8·10·12월), $30$일(4·6·9·11월), 2월은 $28$일 또는 $29$일',
      },
    ],
    skills: [
      {
        id: 'read-clock',
        title: '시각 읽기',
        gen(r, level) {
          const h = r.int(1, 12);
          if (level === 3) {
            const m = r.pick([40, 45, 50, 55]);
            const nx = (h % 12) + 1;
            const right = `${nx}시 ${60 - m}분 전`;
            return {
              q: '시계가 나타내는 시각을 "몇 시 몇 분 전"으로 바르게 나타낸 것을 고르세요.',
              fig: clock(h, m),
              answer: makeChoices(r, right, [`${h}시 ${60 - m}분 전`, `${nx}시 ${m}분 전`, `${h}시 ${m}분 전`, `${nx}시 ${m / 5}분 전`]),
              steps: [`시계는 $${h}$시 $${m}$분이에요.`, `$${nx}$시가 되려면 $${60 - m}$분이 더 있어야 하므로 ${right}`],
            };
          }
          const m = level === 1 ? r.int(1, 11) * 5 : r.pick(range(1, 59).filter((x) => x % 5 !== 0));
          return {
            q: '시계가 나타내는 시각은 몇 시 몇 분인가요?',
            fig: clock(h, m),
            answer: { type: 'fields', fields: [{ label: '시', value: h }, { label: '분', value: m }] },
            steps:
              level === 1
                ? [`짧은바늘이 $${h}$와 $${(h % 12) + 1}$ 사이 → $${h}$시`, `긴바늘이 $${m / 5}$ → $5\\times ${m / 5}=${m}$분`]
                : [`짧은바늘이 $${h}$와 $${(h % 12) + 1}$ 사이 → $${h}$시`, `긴바늘이 $${Math.floor(m / 5) === 0 ? 12 : Math.floor(m / 5)}$에서 작은 눈금 $${m % 5}$칸 더 → $${Math.floor(m / 5) * 5}+${m % 5}=${m}$분`],
          };
        },
      },
      {
        id: 'hour-min',
        title: '시간과 분',
        gen(r, level) {
          const h = r.int(1, 3);
          const m = r.int(1, 11) * 5;
          if (level === 1) {
            return {
              q: `$${h}$시간 $${m}$분은 몇 분인가요?`,
              answer: { type: 'num', value: h * 60 + m, unit: '분' },
              steps: [`$${h}$시간 $= ${h * 60}$분`, `$${h * 60}+${m}=${h * 60 + m}$ (분)`],
            };
          }
          if (level === 2) {
            const tot = h * 60 + m;
            return {
              q: `$${tot}$분은 몇 시간 몇 분인가요?`,
              answer: { type: 'fields', fields: [{ label: '시간', value: h }, { label: '분', value: m }] },
              steps: [`$${tot}$분 $= ${h * 60}$분 $+ ${m}$분`, `$= ${h}$시간 $${m}$분`],
            };
          }
          const a = r.int(60, 100);
          const bh = 1;
          const bm = r.int(1, 50);
          const b = bh * 60 + bm;
          const longer = a > b ? 'a' : 'b';
          const [p1, p2] = names(r, 2);
          if (a === b) return this.gen(r, 2);
          return {
            q: `${p1}는 $${a}$분 동안, ${p2}는 $1$시간 $${bm}$분 동안 책을 읽었어요. 누가 몇 분 더 오래 읽었나요? 더 오래 읽은 사람을 고르세요.`,
            answer: makeChoices(r, `${longer === 'a' ? p1 : p2}, $${Math.abs(a - b)}$분`, [
              `${longer === 'a' ? p2 : p1}, $${Math.abs(a - b)}$분`,
              `${longer === 'a' ? p1 : p2}, $${Math.abs(a - b) + 10}$분`,
              `${longer === 'a' ? p2 : p1}, $${Math.abs(a - (bh * 100 + bm))}$분`,
            ]),
            steps: [`$1$시간 $${bm}$분 $= ${b}$분`, `$${Math.max(a, b)}-${Math.min(a, b)}=${Math.abs(a - b)}$ → ${longer === 'a' ? p1 : p2}가 $${Math.abs(a - b)}$분 더 오래 읽었어요.`],
          };
        },
      },
      {
        id: 'elapsed',
        title: '걸린 시간',
        gen(r, level) {
          if (level === 1) {
            const s = r.int(1, 8);
            const d = r.int(1, 4);
            return {
              q: `$${s}$시에 시작하여 $${s + d}$시에 끝났어요. 걸린 시간은 몇 시간인가요?`,
              fig: clock(s, 0),
              answer: { type: 'num', value: d, unit: '시간' },
              steps: [`짧은바늘이 $${s}$에서 $${s + d}$까지 움직였어요.`, `$${d}$시간`],
            };
          }
          if (level === 2) {
            const sh = r.int(1, 10);
            const sm = r.int(0, 5) * 10;
            const d = r.int(2, 9) * 10;
            const t = sh * 60 + sm + d;
            const eh = Math.floor(t / 60);
            const em = t % 60;
            return {
              q: `${hm(sh, sm)}부터 $${d}$분 동안 숙제를 했어요. 숙제를 끝낸 시각은 몇 시 몇 분인가요?`,
              answer: { type: 'fields', fields: [{ label: '시', value: eh }, { label: '분', value: em }] },
              steps:
                sm + d >= 60
                  ? [
                      `$${sm}+${d}=${sm + d}$(분)이고 $60$분 $=1$시간이므로 $${sm + d}$분 $=${Math.floor((sm + d) / 60)}$시간 $${(sm + d) % 60}$분`,
                      `$${sh}$시에서 $${Math.floor((sm + d) / 60)}$시간 뒤, $${(sm + d) % 60}$분 → ${hm(eh, em)}`,
                    ]
                  : [`$${sm}+${d}=${sm + d}$ (분)`, `${hm(eh, em)}`],
            };
          }
          const sh = r.int(8, 11);
          const eh = r.int(1, 5);
          const d = 12 - sh + eh;
          return {
            q: `오전 $${sh}$시에 놀이공원에 들어가서 오후 $${eh}$시에 나왔어요. 놀이공원에 있었던 시간은 몇 시간인가요?`,
            answer: { type: 'num', value: d, unit: '시간' },
            steps: [`오전 $${sh}$시 → 낮 $12$시: $${12 - sh}$시간`, `낮 $12$시 → 오후 $${eh}$시: $${eh}$시간`, `$${12 - sh}+${eh}=${d}$ (시간)`],
          };
        },
      },
      {
        id: 'day',
        title: '하루와 오전·오후',
        gen(r, level) {
          if (level === 1) {
            const kind = r.int(0, 1);
            if (kind === 0) {
              const d = r.int(1, 3);
              const hh = r.int(1, 12);
              return {
                q: `$${d}$일 $${hh}$시간은 몇 시간인가요?`,
                answer: { type: 'num', value: d * 24 + hh, unit: '시간' },
                steps: [d === 1 ? `$1$일 $=24$시간` : `$1$일 $=24$시간이므로 $${d}$일 $=${d * 24}$시간`, `$${d * 24}+${hh}=${d * 24 + hh}$ (시간)`],
              };
            }
            const w = r.int(1, 4);
            const dd = r.int(1, 6);
            return {
              q: `$${w}$주일 $${dd}$일은 며칠인가요?`,
              answer: { type: 'num', value: w * 7 + dd, unit: '일' },
              steps: [`$1$주일 $=7$일이므로 $${w}$주일 $=${w * 7}$일`, `$${w * 7}+${dd}=${w * 7 + dd}$ (일)`],
            };
          }
          if (level === 2) {
            const d = r.int(1, 3);
            const hh = r.int(1, 23);
            const tot = d * 24 + hh;
            return {
              q: `$${tot}$시간은 며칠 몇 시간인가요?`,
              answer: { type: 'fields', fields: [{ label: '일', value: d }, { label: '시간', value: hh }] },
              steps: [`$24$시간 $=1$일`, `$${tot}=${d * 24}+${hh}$ → $${d}$일 $${hh}$시간`],
            };
          }
          const acts: [string, number, boolean][] = [
            ['아침 식사를 하는', 8, true],
            ['학교에 가는', 9, true],
            ['점심을 먹는', 1, false], // 12시는 오전/오후 구분이 헷갈리므로 피함
            ['학원에 가는', 3, false],
            ['저녁을 먹는', 7, false],
            ['잠자리에 드는', 9, false],
            ['아침에 일어나는', 7, true],
          ];
          const [act, h, am] = r.pick(acts);
          const [p] = names(r, 1);
          const right = `${am ? '오전' : '오후'} $${h}$시`;
          return {
            q: `${p}가 ${act} 시각으로 알맞은 것을 고르세요.`,
            answer: makeChoices(r, right, [`${am ? '오후' : '오전'} $${h}$시`]),
            steps: ['전날 밤 12시부터 낮 12시까지는 오전, 낮 12시부터 밤 12시까지는 오후예요.', `${act} 시각은 ${right}예요.`],
          };
        },
      },
      {
        id: 'calendar',
        title: '달력 보기',
        gen(r, level) {
          const month = r.int(1, 12);
          const days = MONTH_DAYS[month - 1];
          const start = r.int(0, 6);
          if (level === 1) {
            const kind = r.int(0, 1);
            if (kind === 0) {
              const m2 = r.int(1, 12);
              return {
                q: `${m2}월은 며칠까지 있나요? (2월은 28일까지 있는 해라고 생각해요.)`,
                answer: { type: 'num', value: MONTH_DAYS[m2 - 1], unit: '일' },
                steps: ['$31$일: 1·3·5·7·8·10·12월, $30$일: 4·6·9·11월, 2월: $28$일(또는 $29$일)', `${m2}월은 $${MONTH_DAYS[m2 - 1]}$일까지 있어요.`],
              };
            }
            const y = r.int(1, 3);
            const mm = r.int(1, 11);
            return {
              q: `$${y}$년 $${mm}$개월은 몇 개월인가요?`,
              answer: { type: 'num', value: y * 12 + mm, unit: '개월' },
              steps: [`$1$년 $=12$개월이므로 $${y}$년 $=${y * 12}$개월`, `$${y * 12}+${mm}=${y * 12 + mm}$ (개월)`],
            };
          }
          const cal = calendar(start, days);
          if (level === 2) {
            const dow = r.int(0, 6);
            const nth = r.int(2, 4);
            const first = ((dow - start + 7) % 7) + 1;
            const ans = first + (nth - 1) * 7;
            const ord = ['', '첫째', '둘째', '셋째', '넷째'][nth];
            return {
              q: `어느 해 ${month}월의 달력이에요. 이 달의 ${ord} ${DOW[dow]}요일은 며칠인가요?`,
              table: cal,
              answer: { type: 'num', value: ans, unit: '일' },
              steps: [`첫째 ${DOW[dow]}요일은 $${first}$일이에요.`, `같은 요일은 $7$일마다 돌아와요: $${range(0, nth - 1).map((i) => first + i * 7).join(', ')}$ → $${ans}$일`],
            };
          }
          const d1 = r.int(1, 9);
          const d2 = d1 + r.int(2, 3) * 7 + r.int(1, 6);
          const dow1 = (start + d1 - 1) % 7;
          const dow2 = (start + d2 - 1) % 7;
          return {
            q: `어느 달의 ${d1}일은 ${DOW[dow1]}요일이에요. 같은 달 ${d2}일은 무슨 요일인가요?`,
            answer: makeChoices(r, `${DOW[dow2]}요일`, DOW.filter((_, i) => i !== dow2).map((d) => `${d}요일`), 5),
            steps: [`같은 요일은 $7$일마다 돌아와요.`, `${d1}일, ${range(1, Math.floor((d2 - d1) / 7)).map((i) => d1 + i * 7).join('일, ')}일은 ${DOW[dow1]}요일`, `${d2}일은 ${DOW[dow2]}요일`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 표와 그래프
  'e2b-5': {
    concepts: [
      {
        title: '자료를 분류하여 표로 나타내기',
        body: '조사한 자료를 종류별로 세어 **표**로 나타내요.\n- 빠뜨리거나 겹쳐 세지 않게 센 자료에 표시를 해요.\n- **합계**는 조사한 전체 수예요. 2학년 1학기 "분류하기"에서 이어져요.',
      },
      {
        title: '○ 그래프로 나타내기',
        body: '1. 가로와 세로에 무엇을 쓸지 정해요.\n2. 가로·세로 칸을 몇 칸으로 할지 정해요. (가장 큰 수만큼은 있어야 해요)\n3. 자료의 수만큼 ○를 **아래에서 위로**(또는 왼쪽에서 오른쪽으로) **빈칸 없이** 하나씩 그려요.\n4. 그래프의 제목을 써요.',
      },
      {
        title: '표와 그래프의 좋은 점',
        body: '- **표**: 각 자료의 수와 전체 수(합계)를 알기 쉬워요.\n- **그래프**: 가장 많은 것과 가장 적은 것을 **한눈에** 알기 쉬워요.',
      },
      {
        title: '표와 그래프의 내용 알기',
        body: '표와 그래프를 보고 "가장 많이 좋아하는 것", "두 가지의 차" 등을 알아내고 다음 할 일을 정할 수 있어요.',
      },
    ],
    skills: [
      {
        id: 'make-table',
        title: '표로 나타내기',
        gen(r, level) {
          const theme = r.pick([
            { t: '좋아하는 계절', c: ['봄', '여름', '가을', '겨울'] },
            { t: '좋아하는 간식', c: ['과자', '빵', '떡', '과일'] },
            { t: '좋아하는 동물', c: ['강아지', '고양이', '토끼', '햄스터'] },
          ]);
          const ns = names(r, lv(level, 8, 10, 12));
          let data: string[];
          let counts: number[];
          do {
            data = ns.map(() => r.pick(theme.c));
            counts = theme.c.map((c) => data.filter((d) => d === c).length);
          } while (counts.some((c) => c === 0));
          const table = [['이름', ...ns.slice(0, Math.ceil(ns.length / 2))], [theme.t, ...data.slice(0, Math.ceil(ns.length / 2))], ['이름', ...ns.slice(Math.ceil(ns.length / 2))], [theme.t, ...data.slice(Math.ceil(ns.length / 2))]];
          if (level === 1) {
            const i = r.int(0, 3);
            return {
              q: `우리 모둠 친구들의 ${theme.t}을 조사했어요. '${theme.c[i]}'를 좋아하는 친구는 몇 명인가요?`,
              table,
              answer: { type: 'num', value: counts[i], unit: '명' },
              steps: [`'${theme.c[i]}'에 표시하며 세어요.`, `$${counts[i]}$명`],
            };
          }
          if (level === 2) {
            return {
              q: `조사한 자료를 표로 나타내려고 해요. 표의 합계에 알맞은 수는 얼마인가요?`,
              table,
              answer: { type: 'num', value: ns.length, unit: '명' },
              steps: [`합계는 조사한 전체 사람 수예요.`, `$${counts.join('+')}=${ns.length}$ (명)`],
            };
          }
          const [i, j] = r.sample([0, 1, 2, 3], 2);
          return {
            q: `'${theme.c[i]}'를 좋아하는 친구와 '${theme.c[j]}'를 좋아하는 친구는 모두 몇 명인가요?`,
            table,
            answer: { type: 'num', value: counts[i] + counts[j], unit: '명' },
            steps: [`${theme.c[i]} $${counts[i]}$명, ${theme.c[j]} $${counts[j]}$명`, `$${counts[i]}+${counts[j]}=${counts[i] + counts[j]}$ (명)`],
          };
        },
      },
      {
        id: 'table-blank',
        title: '표의 빈칸 채우기',
        gen(r, level) {
          const cats = r.pick([
            ['빨강', '노랑', '파랑', '초록'],
            ['축구', '피구', '줄넘기', '달리기'],
            ['김밥', '피자', '떡볶이', '라면'],
          ]);
          const counts = cats.map(() => (level === 2 ? r.int(5, 15) : r.int(2, 9)));
          const total = counts.reduce((a, b) => a + b, 0);
          const hole = r.int(0, 3);
          if (level < 3) {
            return {
              q: level === 1 ? '표의 빈칸에 알맞은 수를 쓰세요.' : `우리 반 학생 $${total}$명이 좋아하는 것을 조사했어요. 표의 빈칸에 알맞은 수를 쓰세요.`,
              table: [['종류', ...cats, '합계'], ['학생 수(명)', ...counts.map((c, i) => (i === hole ? '' : `$${c}$`)), `$${total}$`]],
              answer: { type: 'num', value: counts[hole], unit: '명' },
              steps: [`합계 $${total}$에서 나머지를 빼요.`, `$${total}-${counts.filter((_, i) => i !== hole).join('-')}=${counts[hole]}$ (명)`],
            };
          }
          // 조건으로 두 칸 구하기
          const [a, b] = r.sample([0, 1, 2, 3], 2);
          let ca = counts[a];
          const cb = counts[b];
          const diff = r.int(1, 4);
          ca = cb + diff;
          counts[a] = ca;
          const tot2 = counts.reduce((x, y) => x + y, 0);
          return {
            q: `'${cats[a]}'를 좋아하는 학생은 '${cats[b]}'를 좋아하는 학생보다 $${diff}$명 더 많아요. '${cats[a]}'를 좋아하는 학생은 몇 명인가요?`,
            table: [['종류', ...cats, '합계'], ['학생 수(명)', ...counts.map((c, i) => (i === a || i === b ? '' : `$${c}$`)), `$${tot2}$`]],
            answer: { type: 'num', value: ca, unit: '명' },
            steps: [
              `두 칸의 합: $${tot2}-${counts.filter((_, i) => i !== a && i !== b).join('-')}=${ca + cb}$`,
              `${cats[a]}이 $${diff}$명 더 많으므로 ${cats[b]} $=(${ca + cb}-${diff})$의 반 $=${cb}$, ${cats[a]} $=${cb}+${diff}=${ca}$`,
            ],
            hint: '두 빈칸의 합을 먼저 구해 보세요.',
          };
        },
      },
      {
        id: 'graph-read',
        title: '○ 그래프 읽기',
        gen(r, level) {
          const cats = r.pick([
            ['사과', '배', '포도', '귤'],
            ['봄', '여름', '가을', '겨울'],
            ['우유', '주스', '물', '탄산수'],
          ]);
          const k = lv(level, 3, 4, 4);
          const cs = cats.slice(0, k);
          let counts: number[];
          do counts = cs.map(() => r.int(1, 6));
          while (new Set(counts).size !== k);
          const fig = oGraph(cs, counts, { max: 6, unit: '명' });
          if (level === 1) {
            const most = r.chance(0.5);
            const i = counts.indexOf(most ? Math.max(...counts) : Math.min(...counts));
            return {
              q: `학생들이 좋아하는 것을 조사하여 ○ 그래프로 나타냈어요. 가장 ${most ? '많은' : '적은'} 학생이 좋아하는 것은 무엇인가요?`,
              fig,
              answer: makeChoices(r, cs[i], cs.filter((_, j) => j !== i)),
              steps: [`○가 가장 ${most ? '높이 쌓인' : '적게 쌓인'} 것을 찾아요.`, `${cs[i]} ($${counts[i]}$명)`],
            };
          }
          if (level === 2) {
            const i = r.int(0, k - 1);
            return {
              q: `○ 그래프를 보고 '${cs[i]}'를 좋아하는 학생은 몇 명인지 구하세요.`,
              fig,
              answer: { type: 'num', value: counts[i], unit: '명' },
              steps: [`${cs[i]}의 ○를 세어요.`, `$${counts[i]}$명`],
            };
          }
          const [i, j] = r.sample(range(0, k - 1), 2);
          const hi = counts[i] > counts[j] ? i : j;
          const lo = hi === i ? j : i;
          return {
            q: `'${cs[hi]}'를 좋아하는 학생은 '${cs[lo]}'를 좋아하는 학생보다 몇 명 더 많은가요?`,
            fig,
            answer: { type: 'num', value: counts[hi] - counts[lo], unit: '명' },
            steps: [`${cs[hi]} $${counts[hi]}$명, ${cs[lo]} $${counts[lo]}$명`, `$${counts[hi]}-${counts[lo]}=${counts[hi] - counts[lo]}$ (명)`],
          };
        },
      },
      {
        id: 'table-vs-graph',
        title: '표와 그래프의 특징',
        gen(r, level) {
          if (level === 1) {
            const askGraph = r.chance(0.5);
            return {
              q: askGraph ? '가장 많은 것과 가장 적은 것을 한눈에 알아보기 쉬운 것은 무엇인가요?' : '조사한 자료의 전체 수(합계)를 알아보기 쉬운 것은 무엇인가요?',
              answer: makeChoices(r, askGraph ? '그래프' : '표', [askGraph ? '표' : '그래프']),
              steps: ['표: 각각의 수와 합계를 알기 쉬워요.', '그래프: 많고 적음을 한눈에 비교하기 쉬워요.'],
            };
          }
          const T = [
            '○ 그래프에서 ○는 아래에서 위로 빈칸 없이 그려요.',
            '표에서는 조사한 전체 수를 알 수 있어요.',
            '그래프에서는 가장 많은 것을 한눈에 알 수 있어요.',
            '그래프의 세로 칸 수는 가장 큰 수만큼은 있어야 해요.',
            '자료를 조사할 때는 겹치거나 빠뜨리지 않게 표시하며 세요.',
          ];
          const F = [
            '○ 그래프에서 ○는 위에서 아래로 띄엄띄엄 그려요.',
            '그래프에서는 누가 무엇을 좋아하는지 이름을 알 수 있어요.',
            '표에서는 많고 적음을 그래프보다 한눈에 알기 쉬워요.',
            '그래프의 세로 칸 수는 가장 작은 수만큼만 있으면 돼요.',
          ];
          if (level === 2) {
            const right = r.pick(F);
            return {
              q: '표와 그래프에 대한 설명으로 **옳지 않은** 것을 고르세요.',
              answer: makeChoices(r, right, r.sample(T, 3)),
              steps: [`'${right}' 는 틀린 설명이에요.`, '표는 수와 합계, 그래프는 많고 적음을 한눈에 보기 좋아요.'],
            };
          }
          const counts = range(1, 4).map(() => r.int(2, 9));
          const max = Math.max(...counts);
          return {
            q: `다음 표를 ○ 그래프로 나타내려고 해요. 세로 칸은 적어도 몇 칸이 있어야 하나요?`,
            table: [['종류', '가', '나', '다', '라'], ['수', ...counts.map((c) => `$${c}$`)]],
            answer: { type: 'num', value: max, unit: '칸' },
            steps: ['가장 큰 수만큼 ○를 그릴 수 있어야 해요.', `가장 큰 수는 $${max}$ → $${max}$칸`],
          };
        },
      },
      {
        id: 'graph-check',
        title: '표와 그래프 비교하기',
        gen(r, level) {
          const cats = r.pick([
            ['장미', '튤립', '국화', '해바라기'],
            ['빨강', '노랑', '파랑', '초록'],
          ]);
          const counts = cats.map(() => r.int(1, 6));
          if (level === 1) {
            const i = r.int(0, 3);
            return {
              q: `표를 ○ 그래프로 나타낼 때 ${cats[i]}에는 ○를 몇 개 그려야 하나요?`,
              table: [['종류', ...cats], ['학생 수(명)', ...counts.map((c) => `$${c}$`)]],
              answer: { type: 'num', value: counts[i], unit: '개' },
              steps: ['학생 수만큼 ○를 그려요.', `$${counts[i]}$개`],
            };
          }
          const wrongI = r.int(0, 3);
          const g = counts.slice();
          g[wrongI] = counts[wrongI] + (counts[wrongI] >= 6 ? -1 : counts[wrongI] <= 1 ? 1 : r.pick([1, -1]));
          if (level === 2) {
            return {
              q: '표를 보고 ○ 그래프를 그렸는데 한 곳을 잘못 그렸어요. 잘못 그린 것을 고르세요.',
              table: [['종류', ...cats], ['학생 수(명)', ...counts.map((c) => `$${c}$`)]],
              fig: oGraph(cats, g, { max: 7 }),
              answer: makeChoices(r, cats[wrongI], cats.filter((_, i) => i !== wrongI)),
              steps: [`표의 ${cats[wrongI]}는 $${counts[wrongI]}$명인데 그래프에는 ○가 $${g[wrongI]}$개예요.`, `잘못 그린 것: ${cats[wrongI]}`],
            };
          }
          const total = counts.reduce((a, b) => a + b, 0);
          const hide = r.int(0, 3);
          return {
            q: `조사한 학생은 모두 $${total}$명이에요. 그래프에서 ○를 그리지 않은 ${cats[hide]}에는 ○를 몇 개 그려야 하나요?`,
            fig: oGraph(cats, counts.map((c, i) => (i === hide ? 0 : c)), { max: 7 }),
            answer: { type: 'num', value: counts[hide], unit: '개' },
            steps: [`그려진 ○: $${counts.filter((_, i) => i !== hide).join('+')}=${total - counts[hide]}$`, `$${total}-${total - counts[hide]}=${counts[hide]}$ (개)`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 규칙 찾기
  'e2b-6': {
    concepts: [
      {
        title: '무늬에서 규칙 찾기',
        body: '모양과 색깔이 **반복**되거나, 모양이 **시계 방향으로 돌아가는** 규칙이 있어요.\n- 반복되는 부분을 찾아 묶어 보면 다음에 올 것을 알 수 있어요.\n- 1학년 "규칙 찾기"에서 더 나아가 방향과 돌리기 규칙도 찾아요.',
      },
      {
        title: '쌓은 모양에서 규칙 찾기',
        body: '쌓기나무가 몇 개씩 늘어나는지 살펴요.\n- $1$개, $3$개, $5$개 … → $2$개씩 늘어나요.\n- 계단 모양: $1$, $3$, $6$, $10$ … → $2$개, $3$개, $4$개씩 늘어나요.',
      },
      {
        title: '덧셈표의 규칙',
        body: '- 오른쪽으로 갈수록(아래로 갈수록) $1$씩 커져요.\n- ↘ 방향으로는 $2$씩 커져요.\n- ↙ 방향으로는 같은 수가 있어요.',
      },
      {
        title: '곱셈표의 규칙',
        body: '- $\\square$단의 수는 $\\square$씩 커져요.\n- $5$단의 일의 자리 숫자는 $5$, $0$이 반복돼요.\n- 짝수단($2, 4, 6, 8$단)의 곱은 모두 짝수예요.\n- 점선을 따라 접으면 만나는 수가 같아요. ($3\\times 4=4\\times 3$)',
      },
      {
        title: '생활에서 규칙 찾기',
        body: '- 달력: 같은 요일의 날짜는 **$7$씩** 커져요.\n- 버스 시간표, 엘리베이터 버튼, 극장 좌석 번호에도 규칙이 있어요.',
      },
    ],
    skills: [
      {
        id: 'rotate',
        title: '돌아가는 무늬',
        gen(r, level) {
          const DIRN = ['위쪽', '오른쪽', '아래쪽', '왼쪽'];
          if (level === 1) {
            const [a, b] = r.sample([0, 1, 2, 3], 2);
            const shown = r.int(4, 6);
            const seq = range(0, shown).map((i) => (i % 2 === 0 ? a : b));
            const ans = seq[shown];
            return {
              q: '규칙에 따라 ? 에 들어갈 삼각형은 어느 쪽을 가리키나요?',
              fig: arrowRow([...seq.slice(0, shown), null]),
              answer: makeChoices(r, DIRN[ans], DIRN.filter((_, i) => i !== ans)),
              steps: [`'${DIRN[a]}, ${DIRN[b]}'가 반복돼요.`, `? 에는 ${DIRN[ans]}`],
            };
          }
          const cw = r.chance(0.5);
          const st = r.int(0, 3);
          const dirAt = (i: number) => (((st + (cw ? i : -i)) % 4) + 4) % 4;
          if (level === 2) {
            const shown = r.int(4, 6);
            const seq = range(0, shown - 1).map(dirAt);
            const ans = dirAt(shown);
            return {
              q: '규칙에 따라 ? 에 들어갈 삼각형은 어느 쪽을 가리키나요?',
              fig: arrowRow([...seq, null]),
              answer: makeChoices(r, DIRN[ans], DIRN.filter((_, i) => i !== ans)),
              steps: [`삼각형이 ${cw ? '시계 방향' : '시계 반대 방향'}으로 한 칸씩 돌아가요.`, `? 에는 ${DIRN[ans]}`],
            };
          }
          const pos = r.int(10, 20);
          const ans = dirAt(pos - 1);
          return {
            q: `규칙에 따라 삼각형을 늘어놓았어요. ${pos}째 삼각형은 어느 쪽을 가리키나요?`,
            fig: arrowRow(range(0, 5).map(dirAt)),
            answer: makeChoices(r, DIRN[ans], DIRN.filter((_, i) => i !== ans)),
            steps: [`${cw ? '시계 방향' : '시계 반대 방향'}으로 돌며 $4$개마다 같은 방향이 반복돼요.`, `${pos}째는 ${((pos - 1) % 4) + 1}째와 같아요 → ${DIRN[ans]}`],
          };
        },
      },
      {
        id: 'stack',
        title: '쌓은 모양의 규칙',
        gen(r, level) {
          if (level === 1) {
            const h = r.int(1, 2);
            const st = r.int(1, 2);
            const stages = [0, 1, 2].map((i) => Array(st + i).fill(h));
            const next = (st + 3) * h;
            return {
              q: '규칙에 따라 쌓기나무를 쌓았어요. 다음에 올 모양에 필요한 쌓기나무는 몇 개인가요?',
              fig: cubeStages(stages, ['첫째', '둘째', '셋째']),
              answer: { type: 'num', value: next, unit: '개' },
              steps: [`쌓기나무가 $${st * h}$개, $${(st + 1) * h}$개, $${(st + 2) * h}$개 … $${h}$개씩 늘어나요.`, `넷째: $${(st + 2) * h}+${h}=${next}$ (개)`],
            };
          }
          const kind = r.pick(level === 2 ? (['stair', 'pyramid', 'ell'] as const) : (['stair', 'pyramid'] as const));
          const shape = (n: number) => (kind === 'stair' ? range(1, n) : kind === 'ell' ? [n, ...Array(n - 1).fill(1)] : [...range(1, n), ...range(1, n - 1).reverse()]);
          const total = (n: number) => (kind === 'stair' ? (n * (n + 1)) / 2 : kind === 'ell' ? 2 * n - 1 : n * n);
          const n = level === 2 ? r.int(4, 5) : r.int(5, 7);
          const ord = ['', '', '', '', '넷째', '다섯째', '여섯째', '일곱째'][n];
          const t3 = [1, 2, 3].map(total);
          return {
            q: `규칙에 따라 쌓기나무를 쌓았어요. ${ord} 모양에 필요한 쌓기나무는 몇 개인가요?`,
            fig: cubeStages([1, 2, 3].map(shape), ['첫째', '둘째', '셋째']),
            answer: { type: 'num', value: total(n), unit: '개' },
            steps:
              kind === 'ell'
                ? [`$${t3.join('$개, $')}$개 … $2$개씩 늘어나요. (위로 $1$개, 옆으로 $1$개)`, `${ord}: $${n}+${n - 1}=${total(n)}$ (개)`]
                : kind === 'stair'
                ? [`$${t3.join('$개, $')}$개 … 늘어나는 수가 $2, 3, 4, \\dots$ 로 $1$씩 커져요.`, `${ord}: $${range(1, n).join('+')}=${total(n)}$ (개)`]
                : [`$${t3.join('$개, $')}$개 … 늘어나는 수가 $3, 5, 7, \\dots$ 로 $2$씩 커져요.`, `${ord}: $${range(1, n).map((k) => 2 * k - 1).join('+')}=${total(n)}$ (개)`],
          };
        },
      },
      {
        id: 'add-table',
        title: '덧셈표의 규칙',
        gen(r, level) {
          const r0 = r.int(1, 5);
          const c0 = r.int(1, 5);
          const rows = range(r0, r0 + 3);
          const cols = range(c0, c0 + 3);
          const si = r.int(1, 3);
          const sj = r.int(1, 3);
          const table: string[][] = [['$+$', ...cols.map((c) => `$${c}$`)]];
          rows.forEach((rv, i) => table.push([`$${rv}$`, ...cols.map((c, j) => (i === si && j === sj ? '$\\bigstar$' : `$${rv + c}$`))]));
          if (level === 1) {
            return {
              q: '덧셈표의 일부분이에요. ★에 알맞은 수를 쓰세요.',
              table,
              answer: { type: 'num', value: rows[si] + cols[sj] },
              steps: [`★은 $${rows[si]}+${cols[sj]}$이에요.`, `$${rows[si] + cols[sj]}$`],
            };
          }
          if (level === 2) {
            const dirs: [string, number][] = [
              ['오른쪽(→)으로', 1],
              ['아래쪽(↓)으로', 1],
              ['↘ 방향으로', 2],
              ['↙ 방향으로', 0],
            ];
            const [d, ans] = r.pick(dirs);
            return {
              q: `덧셈표에서 ${d} 한 칸씩 갈 때 수는 몇씩 커지나요? (같으면 $0$을 쓰세요.)`,
              table: table.map((row) => row.map((c) => (c === '$\\bigstar$' ? `$${rows[si] + cols[sj]}$` : c))),
              answer: { type: 'num', value: ans },
              steps: [ans === 0 ? '↙ 방향으로는 같은 수가 놓여 있어요.' : ans === 2 ? '↘ 방향으로 가면 더하는 두 수가 모두 $1$씩 커지므로 $2$씩 커져요.' : '더하는 수 하나가 $1$씩 커지므로 합도 $1$씩 커져요.', `답: $${ans}$`],
            };
          }
          const v = r.int(6, 12);
          const cnt = range(1, 9).filter((a) => v - a >= 1 && v - a <= 9).length;
          return {
            q: `$1$부터 $9$까지의 수로 만든 덧셈표에서 합이 $${v}$인 칸은 모두 몇 개인가요?`,
            answer: { type: 'num', value: cnt, unit: '개' },
            steps: [`합이 $${v}$인 칸은 ↙ 방향으로 한 줄에 놓여 있어요.`, `$${range(1, 9).filter((a) => v - a >= 1 && v - a <= 9).map((a) => `${a}+${v - a}`).join(', ')}$ → $${cnt}$개`],
          };
        },
      },
      {
        id: 'mul-table',
        title: '곱셈표의 규칙',
        gen(r, level) {
          if (level === 1) {
            const dan = r.int(2, 9);
            const st = r.int(1, 5);
            const seq = range(st, st + 3).map((k) => dan * k);
            return {
              q: `곱셈표의 한 줄이에요. 규칙에 따라 빈칸에 알맞은 수를 쓰세요.\n$$${seq.join(',\\ ')},\\ \\square$$`,
              answer: { type: 'num', value: dan * (st + 4) },
              steps: [`$${dan}$씩 커지는 ${dan}단이에요.`, `$${seq[3]}+${dan}=${dan * (st + 4)}$`],
            };
          }
          if (level === 2) {
            const facts: [string, string, string[]][] = [
              ['$5$단 곱의 일의 자리 숫자', '$5$와 $0$이 반복돼요.', ['$1$씩 커져요.', '모두 $5$예요.', '$2$와 $5$가 반복돼요.']],
              ['$2$단의 곱', '모두 짝수예요.', ['모두 홀수예요.', '$3$씩 커져요.', '짝수와 홀수가 번갈아 나와요.']],
              ['$9$단 곱의 십의 자리 숫자와 일의 자리 숫자의 합', '항상 $9$예요.', ['항상 $10$이에요.', '$1$씩 커져요.', '항상 $0$이에요.']],
              ['$3\\times 7$과 $7\\times 3$의 곱', '서로 같아요.', ['$3\\times 7$이 더 커요.', '$7\\times 3$이 더 커요.', '$4$만큼 차이가 나요.']],
            ];
            const [what, ans, wr] = r.pick(facts);
            return {
              q: `곱셈표에서 ${what}에 대한 설명으로 알맞은 것을 고르세요.`,
              answer: makeChoices(r, ans, wr),
              steps: [`곱셈표를 살펴보면 ${J(what, '은')} ${ans}`],
            };
          }
          const dan = r.pick([4, 6, 8, 3, 7]);
          const even = r.chance(0.5);
          const vals = range(1, 9).map((k) => dan * k);
          const cnt = vals.filter((v) => (v % 2 === 0) === even).length;
          return {
            q: `$${dan}$단 곱셈구구의 곱 중에서 ${even ? '짝수' : '홀수'}는 모두 몇 개인가요? ($${dan}\\times 1$부터 $${dan}\\times 9$까지)`,
            answer: { type: 'num', value: cnt, unit: '개' },
            steps: [`$${dan}$단: $${vals.join(', ')}$`, cnt ? `${even ? '짝수' : '홀수'}: $${vals.filter((v) => (v % 2 === 0) === even).join(', ')}$ → $${cnt}$개` : `${even ? '짝수' : '홀수'}가 하나도 없어요 → $0$개`],
          };
        },
      },
      {
        id: 'life',
        title: '생활 속 규칙',
        gen(r, level) {
          if (level === 1) {
            const start = r.int(0, 6);
            const d = r.int(1, 7);
            const w = r.int(1, 3);
            return {
              q: `달력에서 ${d}일과 같은 요일인 날 중에서 ${d}일보다 $${w}$주일 뒤의 날은 며칠인가요?`,
              table: calendar(start, 30),
              answer: { type: 'num', value: d + 7 * w, unit: '일' },
              steps: ['같은 요일은 $7$일마다 돌아와요.', `$${d}+${range(1, w).map(() => 7).join('+')}=${d + 7 * w}$ (일)`],
            };
          }
          if (level === 2) {
            const gap = r.pick([10, 15, 20]);
            const fh = r.int(7, 9);
            const fm = r.pick([0, 10, 20]);
            const k = r.int(3, 4);
            const t = fh * 60 + fm + gap * (k - 1);
            return {
              q: `버스가 ${hm(fh, fm)}에 첫 번째로 출발하고, $${gap}$분마다 출발해요. ${['', '', '', '세', '네'][k]} 번째 버스는 몇 시 몇 분에 출발하나요?`,
              answer: { type: 'fields', fields: [{ label: '시', value: Math.floor(t / 60) }, { label: '분', value: t % 60 }] },
              steps: [`$${gap}$분씩 더해요: ${range(0, k - 1).map((i) => hm(Math.floor((fh * 60 + fm + gap * i) / 60), (fh * 60 + fm + gap * i) % 60)).join(' → ')}`, `${hm(Math.floor(t / 60), t % 60)}`],
            };
          }
          // 좌석 번호: 한 줄에 n 자리
          const per = r.pick([6, 8, 10]);
          const row = r.int(3, 6);
          const seat = r.int(1, per);
          const rowName = '가나다라마바'[row - 1];
          const ORDS = ['', '첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째', '열째'];
          return {
            q: `공연장 좌석은 한 줄에 $${per}$자리씩 있고, 가열 $1$번부터 차례로 번호가 이어져요. (가열: $1$~$${per}$번, 나열: $${per + 1}$~$${2 * per}$번 …) ${rowName}열 ${ORDS[seat]} 자리는 몇 번인가요?`,
            answer: { type: 'num', value: (row - 1) * per + seat, unit: '번' },
            steps: [`한 줄 뒤로 갈 때마다 번호가 $${per}$씩 커져요.`, `${rowName}열 첫째 자리: $${(row - 1) * per + 1}$번`, `${rowName}열 ${ORDS[seat]}: $${(row - 1) * per}+${seat}=${(row - 1) * per + seat}$ (번)`],
          };
        },
      },
    ],
  },
};
