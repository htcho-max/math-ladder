// 초2-1: 세 자리 수 / 여러 가지 도형 / 덧셈과 뺄셈 / 길이 재기 / 분류하기 / 곱셈
import type { ContentMap } from '../../core/types';
import { WORDS_2 } from './words2';
import type { Rng } from '../../core/rng';
import { makeChoices } from '../../core/tex';
import { range } from '../../core/nt';
import { Svg } from '../../core/fig';
import { names, sino, intChoices, lv, vert, THINGS, J } from './util';
import { baseTen, polysRow, cubesFig, rulerFig, gridPath, jumpLine, dotGroups, FLAT_NAME, type Flat } from './draw';

const POLY_NAME: Record<number, string> = { 0: '원', 3: '삼각형', 4: '사각형', 5: '오각형', 6: '육각형' };
const POLYS = [0, 3, 4, 5, 6];

/** 세 자리 수 읽기: 507 → 오백칠 */
const read3 = (n: number) => sino(n);

/** 받아올림 있는 두 자리 덧셈 */
function carryAdd(r: Rng, level: number): [number, number] {
  for (;;) {
    let a: number, b: number;
    if (level === 1) {
      a = r.int(1, 8) * 10 + r.int(2, 9);
      b = r.int(10 - (a % 10), 9);
    } else if (level === 2) {
      a = r.int(10, 79);
      b = r.int(10, 89 - a);
    } else {
      a = r.int(35, 89);
      b = r.int(Math.max(20, 101 - a), 89);
    }
    if ((a % 10) + (b % 10) >= 10 && (level === 3 ? a + b >= 100 : a + b < 100)) return [a, b];
  }
}
/** 받아내림 있는 뺄셈 */
function borrowSub(r: Rng, level: number): [number, number] {
  for (;;) {
    let a: number, b: number;
    if (level === 1) {
      a = r.int(2, 9) * 10 + r.int(0, 8);
      b = r.int((a % 10) + 1, 9);
    } else if (level === 2) {
      if (r.chance(0.4)) {
        a = r.int(3, 9) * 10;
        b = r.int(11, a - 1);
      } else {
        a = r.int(30, 98);
        b = r.int(11, a - 10);
      }
    } else {
      a = r.int(50, 98);
      b = r.int(19, a - 5);
    }
    if (b % 10 > a % 10 && b < a) return [a, b];
  }
}

export const e2a: ContentMap = {
  // ───────────────────────── 세 자리 수
  'e2a-1': {
    concepts: [
      {
        title: '100과 몇백',
        body: '$99$보다 $1$만큼 더 큰 수, $90$보다 $10$만큼 더 큰 수를 $100$(백)이라고 해요.\n- $100$이 $3$개이면 $300$(삼백), $100$이 $7$개이면 $700$(칠백)이에요.\n- $10$이 $10$개이면 $100$이에요.',
      },
      {
        title: '세 자리 수',
        body: '$100$이 $2$개, $10$이 $4$개, $1$이 $6$개이면 $246$이에요. **이백사십육**이라고 읽어요.\n- $0$인 자리는 읽지 않아요. $507$ → 오백칠, $360$ → 삼백육십',
      },
      {
        title: '자릿값',
        body: '$246$에서\n- $2$는 **백의 자리** 숫자, $200$을 나타내요.\n- $4$는 **십의 자리** 숫자, $40$을 나타내요.\n- $6$은 **일의 자리** 숫자, $6$을 나타내요.\n$$246 = 200 + 40 + 6$$',
      },
      {
        title: '뛰어 세기',
        body: '- $100$씩 뛰어 세면 백의 자리 숫자가 $1$씩 커져요. $300, 400, 500$\n- $10$씩 뛰어 세면 십의 자리 숫자가 $1$씩 커져요. $520, 530, 540$\n- $1$씩 뛰어 세면 일의 자리 숫자가 $1$씩 커져요.\n- $999$보다 $1$만큼 더 큰 수는 $1000$(천)이에요.',
      },
      {
        title: '세 자리 수의 크기 비교',
        body: '**백의 자리부터** 차례로 비교해요.\n- $435 > 398$ (백의 자리 $4 > 3$)\n- $572 < 581$ (백의 자리가 같으면 십의 자리 $7 < 8$)',
      },
    ],
    skills: [
      {
        id: 'blocks',
        title: '수 모형으로 나타내기',
        gen(r, level) {
          if (level === 3) {
            const h = r.int(1, 7);
            const t = r.int(10, 19);
            const o = r.int(10, 19);
            const n = h * 100 + t * 10 + o;
            return {
              q: `$100$이 $${h}$개, $10$이 $${t}$개, $1$이 $${o}$개인 수는 얼마인가요?`,
              answer: { type: 'num', value: n },
              steps: [`$100$이 $${h}$개 → $${h * 100}$, $10$이 $${t}$개 → $${t * 10}$, $1$이 $${o}$개 → $${o}$`, `$${h * 100}+${t * 10}+${o}=${n}$`],
              hint: '10이 10개면 100이에요.',
            };
          }
          const h = r.int(1, level === 1 ? 4 : 6);
          const t = level === 1 ? r.int(1, 6) : r.int(0, 7);
          const o = level === 1 ? r.int(1, 6) : r.int(0, 7);
          const n = h * 100 + t * 10 + o;
          return {
            q: '수 모형이 나타내는 수는 얼마인가요?',
            fig: baseTen(h, t, o),
            answer: { type: 'num', value: n },
            steps: [`백 모형 $${h}$개, 십 모형 $${t}$개, 일 모형 $${o}$개`, `$${h * 100}+${t * 10}+${o}=${n}$`],
          };
        },
      },
      {
        id: 'place-value',
        title: '자릿값 알기',
        gen(r, level) {
          const digits = r.sample(range(1, 9), 3);
          const n = digits[0] * 100 + digits[1] * 10 + digits[2];
          const pos = r.int(0, 2);
          const d = digits[pos];
          const val = d * 10 ** (2 - pos);
          const posName = ['백', '십', '일'][pos];
          if (level === 1) {
            return {
              q: `$${n}$에서 숫자 $${d}$는 무엇을 나타내나요?`,
              answer: intChoices(r, val, [d, d * 10, d * 100]),
              steps: [`$${d}$는 ${posName}의 자리 숫자예요.`, `그래서 $${val}$을 나타내요.`],
            };
          }
          if (level === 2) {
            const a = r.int(1, 9);
            const b = r.int(0, 9);
            const c = r.int(0, 9);
            const m = a * 100 + b * 10 + c;
            return {
              q: `백의 자리 숫자가 $${a}$, 십의 자리 숫자가 $${b}$, 일의 자리 숫자가 $${c}$인 세 자리 수를 쓰세요.`,
              answer: { type: 'num', value: m },
              steps: [`$${a * 100}+${b * 10}+${c}=${m}$`],
            };
          }
          const dd = r.int(1, 9);
          const ps = r.shuffle([0, 1, 2, r.int(0, 2)]);
          const nums: number[] = [];
          for (const p of ps) {
            let x: number;
            do {
              const ds = [r.int(1, 9), r.int(0, 9), r.int(0, 9)].map((v) => (v === dd ? (v % 9) + 1 : v));
              ds[p] = dd;
              x = ds[0] * 100 + ds[1] * 10 + ds[2];
            } while (nums.includes(x));
            nums.push(x);
          }
          const valOf = (x: number) => {
            const s = String(x);
            const i = s.indexOf(String(dd));
            return dd * 10 ** (2 - i);
          };
          const best = nums.reduce((p, q) => (valOf(q) > valOf(p) ? q : p));
          const tieFree = nums.filter((x) => valOf(x) === valOf(best)).length === 1;
          const pick = tieFree ? best : nums.find((x) => String(x).indexOf(String(dd)) === 0)!;
          const others = nums.filter((x) => x !== pick && valOf(x) < valOf(pick));
          return {
            q: `숫자 $${dd}$가 나타내는 값이 가장 큰 수를 고르세요.`,
            answer: makeChoices(r, `$${pick}$`, others.map((x) => `$${x}$`), 4, (i) => {
              const ds = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((v) => v !== dd);
              return `$${ds[i % 8] * 100 + ds[(i + 3) % 8] * 10 + dd}$`;
            }),
            steps: [`숫자 $${dd}$가 백의 자리에 있으면 $${dd * 100}$, 십의 자리에 있으면 $${dd * 10}$, 일의 자리에 있으면 $${dd}$`, `$${pick}$에서 $${dd}$는 $${valOf(pick)}$을 나타내 가장 커요.`],
          };
        },
      },
      {
        id: 'read-write',
        title: '세 자리 수 읽고 쓰기',
        gen(r, level) {
          let n: number;
          if (level === 1) n = r.int(1, 9) * 100 + r.int(1, 9) * 10 + r.int(1, 9);
          else if (level === 2) n = r.int(1, 9) * 100 + (r.chance(0.5) ? r.int(1, 9) : r.int(1, 9) * 10);
          else n = r.int(1, 9) * 100 + r.pick([0, r.int(1, 9) * 10]) + r.pick([0, r.int(1, 9)]);
          if (level === 3 && n % 100 === 0) n += r.int(1, 9);
          const h = Math.floor(n / 100);
          const t = Math.floor(n / 10) % 10;
          const o = n % 10;
          if (r.chance(0.5)) {
            const wr = [h * 1000 + t * 10 + o, h * 10 + t * 10 + o, h * 100 + o * 10 + t, h * 10 + o, h * 100 + t + o * 10].filter((x) => x !== n && x > 0);
            return {
              q: `'${read3(n)}'을 수로 바르게 쓴 것을 고르세요.`,
              answer: intChoices(r, n, wr, { min: 1 }),
              steps: [`백의 자리 $${h}$, 십의 자리 $${t}$, 일의 자리 $${o}$`, `$${n}$ ${t === 0 ? '(읽지 않은 십의 자리에는 $0$을 써요)' : o === 0 ? '(읽지 않은 일의 자리에는 $0$을 써요)' : ''}`],
            };
          }
          const wr = [n + 1, n + 10, n + 100, n - 10 > 99 ? n - 10 : n + 20, h * 100 + o * 10 + t].filter((x) => x !== n && x < 1000).map(read3);
          return {
            q: `$${n}$을 바르게 읽은 것을 고르세요.`,
            answer: makeChoices(r, read3(n), wr),
            steps: [`$${n} = ${h * 100}+${t * 10}+${o}$`, `${read3(n)}`],
          };
        },
      },
      {
        id: 'skip-count',
        title: '뛰어 세기',
        gen(r, level) {
          const step = r.pick([1, 10, 100]);
          if (level === 3) {
            const k = r.int(2, 5);
            const st = r.int(1, 9) * 100 + r.int(0, 9) * 10 + r.int(0, 9);
            const st2 = Math.min(st, 999 - k * step);
            const end = st2 + k * step;
            return {
              q: `어떤 수에서 $${step}$씩 $${k}$번 뛰어 세었더니 $${end}$가 되었어요. 어떤 수는 얼마인가요?`,
              answer: { type: 'num', value: st2 },
              steps: [`거꾸로 $${step}$씩 $${k}$번 뛰어 세어요.`, `$${range(0, k).map((i) => end - i * step).join(' \\to ')}$`, `어떤 수는 $${st2}$`],
            };
          }
          if (level === 1) {
            const step1 = r.pick([10, 100]);
            const st = step1 === 100 ? r.int(1, 4) * 100 + r.int(0, 9) * 10 : r.int(1, 9) * 100 + r.int(0, 4) * 10;
            return {
              q: `$${step1}$씩 뛰어 세었어요. ? 에 알맞은 수를 쓰세요.`,
              fig: jumpLine(st, st + 4 * step1, st, step1, 4, { tick: step1, hideEnd: true }),
              answer: { type: 'num', value: st + 4 * step1 },
              steps: [`${step1 === 100 ? '백' : '십'}의 자리 숫자가 $1$씩 커져요.`, `$${range(0, 4).map((i) => st + i * step1).join(', ')}$`],
            };
          }
          const st = r.int(1, 8) * 100 + r.int(0, 9) * 10 + r.int(0, 9);
          const s0 = Math.min(st, 999 - 4 * step);
          const seq = range(0, 4).map((i) => s0 + i * step);
          const hole = r.int(1, 4);
          return {
            q: `규칙에 따라 뛰어 세었어요. 빈칸에 알맞은 수를 쓰세요.\n$$${seq.map((x, i) => (i === hole ? '\\square' : x)).join(',\\ ')}$$`,
            answer: { type: 'num', value: seq[hole] },
            steps: [`$${step}$씩 뛰어 세었어요.`, `빈칸은 $${seq[hole]}$`],
          };
        },
      },
      {
        id: 'compare',
        title: '크기 비교',
        gen(r, level) {
          if (level === 3) {
            const a = r.int(1, 9);
            const c = r.int(0, 9);
            const other = r.int(Math.max(100, a * 100), a * 100 + 99);
            const big = r.chance(0.5);
            const ok = range(0, 9).filter((d) => {
              const x = a * 100 + d * 10 + c;
              return big ? x > other : x < other;
            });
            if (ok.length === 0 || ok.length === 10) return this.gen(r, 2);
            return {
              q: `$0$부터 $9$까지의 숫자 중에서 $\\square$ 안에 들어갈 수 있는 숫자는 모두 몇 개인가요?\n$$${a}\\square ${c} ${big ? '>' : '<'} ${other}$$`,
              answer: { type: 'num', value: ok.length, unit: '개' },
              steps: [`백의 자리가 같으니 십의 자리부터 비교해요.`, `$\\square$ 에 들어갈 수 있는 숫자: $${ok.join(', ')}$ → $${ok.length}$개`],
              hint: '십의 자리가 같아지는 경우 일의 자리까지 비교해야 해요.',
            };
          }
          const a = r.int(100, 999);
          let b: number;
          if (level === 1) {
            do b = r.int(100, 999);
            while (Math.floor(b / 100) === Math.floor(a / 100));
          } else {
            do b = Math.floor(a / 100) * 100 + r.int(0, 99);
            while (b === a);
          }
          const sign = a > b ? '>' : '<';
          const ha = Math.floor(a / 100);
          const hb = Math.floor(b / 100);
          const ta = Math.floor(a / 10) % 10;
          const tb = Math.floor(b / 10) % 10;
          return {
            q: `두 수의 크기를 비교하여 $\\bigcirc$ 안에 알맞은 것을 고르세요.\n$$${a}\\ \\bigcirc\\ ${b}$$`,
            answer: makeChoices(r, `$${sign}$`, [`$${sign === '>' ? '<' : '>'}$`, '$=$']),
            steps: [ha !== hb ? `백의 자리 비교: $${ha}$와 $${hb}$` : ta !== tb ? `백의 자리가 같으니 십의 자리 비교: $${ta}$와 $${tb}$` : `백·십의 자리가 같으니 일의 자리 비교: $${a % 10}$와 $${b % 10}$`, `$${a} ${sign} ${b}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 여러 가지 도형
  'e2a-2': {
    concepts: [
      {
        title: '삼각형',
        body: '**곧은 선 $3$개**로 둘러싸인 도형을 삼각형이라고 해요.\n- 곧은 선을 **변**, 두 곧은 선이 만나는 점을 **꼭짓점**이라고 해요.\n- 삼각형은 변이 $3$개, 꼭짓점이 $3$개예요.\n- 1학년에서 본 ▲ 모양이 삼각형이에요.',
      },
      {
        title: '사각형',
        body: '**곧은 선 $4$개**로 둘러싸인 도형을 사각형이라고 해요.\n- 변이 $4$개, 꼭짓점이 $4$개예요.',
      },
      {
        title: '원',
        body: '동전이나 컵을 대고 그린 것처럼 동그란 모양의 도형을 **원**이라고 해요.\n- 원은 곧은 선이 없고, 꼭짓점도 없어요.\n- 어느 쪽에서 보아도 똑같이 동그래요. 길쭉한 것은 원이 아니에요.',
      },
      {
        title: '오각형과 육각형',
        body: '- 변과 꼭짓점이 $5$개 → **오각형**\n- 변과 꼭짓점이 $6$개 → **육각형**\n- 도형 이름의 숫자 = 변의 수 = 꼭짓점의 수',
      },
      {
        title: '쌓기나무',
        body: '쌓기나무로 모양을 만들 때는 위치를 "**오른쪽, 왼쪽, 앞, 뒤, 위, 아래**"로 말해요.\n- 쌓기나무의 개수는 층별로 나누어 빠짐없이 세어요.',
        example: { q: '1층에 $4$개, 2층에 $2$개를 쌓았어요. 모두 몇 개?', a: '$4+2=6$, $6$개' },
      },
    ],
    skills: [
      {
        id: 'name-shape',
        title: '도형의 이름',
        gen(r, level) {
          const pool = lv(level, [0, 3, 4], POLYS, POLYS);
          const n = r.pick(pool);
          if (level === 3) {
            const sides = r.int(3, 6);
            return {
              q: `변이 $${sides}$개, 꼭짓점이 $${sides}$개인 도형의 이름은 무엇인가요?`,
              answer: makeChoices(r, POLY_NAME[sides], POLYS.filter((x) => x !== sides).map((x) => POLY_NAME[x])),
              steps: [`변과 꼭짓점이 $${sides}$개이면 ${POLY_NAME[sides]}이에요.`],
            };
          }
          return {
            q: '도형의 이름은 무엇인가요?',
            fig: polysRow(r, [n], { z: 90 }),
            answer: makeChoices(r, POLY_NAME[n], pool.filter((x) => x !== n).map((x) => POLY_NAME[x]).concat(level === 1 ? ['오각형'] : [])),
            steps: n === 0 ? ['곧은 선이 없고 동그란 도형이에요.', '원이에요.'] : [`곧은 선(변)을 세면 $${n}$개예요.`, `${POLY_NAME[n]}이에요.`],
          };
        },
      },
      {
        id: 'parts',
        title: '변과 꼭짓점',
        gen(r, level) {
          if (level === 1) {
            const n = r.int(3, 6);
            const what = r.pick(['변', '꼭짓점']);
            return {
              q: `도형의 ${what}은 몇 개인가요?`,
              fig: polysRow(r, [n], { z: 90 }),
              answer: { type: 'num', value: n, unit: '개' },
              steps: [`${what === '변' ? '곧은 선' : '곧은 선이 만나는 점'}을 세어요.`, `$${n}$개`],
            };
          }
          if (level === 2) {
            const [a, b] = r.sample([3, 4, 5, 6], 2);
            const what = r.pick(['변', '꼭짓점']);
            return {
              q: `${POLY_NAME[a]}과 ${POLY_NAME[b]}의 ${what}은 모두 몇 개인가요?`,
              answer: { type: 'num', value: a + b, unit: '개' },
              steps: [`${POLY_NAME[a]}: $${a}$개, ${POLY_NAME[b]}: $${b}$개`, `$${a}+${b}=${a + b}$ (개)`],
            };
          }
          const ns = Array.from({ length: r.int(3, 5) }, () => r.pick(POLYS));
          if (!ns.some((x) => x === 0)) ns[0] = 0;
          const tot = ns.reduce((p, q) => p + q, 0);
          return {
            q: '그림에 있는 도형들의 꼭짓점은 모두 몇 개인가요?',
            fig: polysRow(r, ns, { z: 54 }),
            answer: { type: 'num', value: tot, unit: '개' },
            steps: [ns.map((x) => `${POLY_NAME[x]} $${x}$개`).join(', '), `$${ns.join('+')}=${tot}$ (개)`],
            hint: '원은 꼭짓점이 없어요.',
          };
        },
      },
      {
        id: 'count-shapes',
        title: '도형 찾아 세기',
        gen(r, level) {
          const n = lv(level, 5, 7, 9);
          const ns = Array.from({ length: n }, () => r.pick(level === 1 ? [0, 3, 4] : POLYS));
          const k = r.pick([...new Set(ns)]);
          if (level === 3) {
            const k2 = r.pick([3, 4, 5, 6].filter((x) => x !== k));
            const c1 = ns.filter((x) => x === k).length;
            const c2 = ns.filter((x) => x === k2).length;
            return {
              q: `${POLY_NAME[k]}과 ${POLY_NAME[k2]}은 모두 몇 개인가요?`,
              fig: polysRow(r, ns, { z: 48 }),
              answer: { type: 'num', value: c1 + c2, unit: '개' },
              steps: [`${POLY_NAME[k]} $${c1}$개, ${POLY_NAME[k2]} $${c2}$개`, `$${c1}+${c2}=${c1 + c2}$ (개)`],
            };
          }
          const c = ns.filter((x) => x === k).length;
          return {
            q: `${POLY_NAME[k]}은 모두 몇 개인가요?`,
            fig: polysRow(r, ns, { z: 50 }),
            answer: { type: 'num', value: c, unit: '개' },
            steps: [k === 0 ? '동그란 도형을 찾아요.' : `변이 $${k}$개인 도형을 찾아요.`, `$${c}$개`],
          };
        },
      },
      {
        id: 'cubes',
        title: '쌓기나무 개수',
        gen(r, level) {
          const cols = lv(level, r.int(2, 3), r.int(3, 4), r.int(4, 5));
          const maxH = lv(level, 2, 3, 3);
          const hs = Array.from({ length: cols }, () => r.int(1, maxH));
          const tot = hs.reduce((a, b) => a + b, 0);
          if (level === 3 && r.chance(0.5)) {
            const target = tot + r.int(2, 5);
            return {
              q: `쌓기나무로 만든 모양이에요. 쌓기나무 $${target}$개로 모양을 만들려면 몇 개가 더 필요한가요?`,
              fig: cubesFig(hs),
              answer: { type: 'num', value: target - tot, unit: '개' },
              steps: [`그림의 쌓기나무: $${hs.join('+')}=${tot}$ (개)`, `$${target}-${tot}=${target - tot}$ (개)`],
            };
          }
          return {
            q: '쌓기나무는 모두 몇 개인가요? (뒤에 숨은 쌓기나무는 없어요.)',
            fig: cubesFig(hs),
            answer: { type: 'num', value: tot, unit: '개' },
            steps: [`왼쪽부터 한 줄씩 세어요: $${hs.join('+')}$`, `$${tot}$개`],
          };
        },
      },
      {
        id: 'true-false',
        title: '도형의 성질',
        gen(r, level) {
          const T = [
            '삼각형은 꼭짓점이 $3$개예요.',
            '사각형은 변이 $4$개예요.',
            '원은 꼭짓점이 없어요.',
            '원은 곧은 선이 없어요.',
            '오각형은 변이 $5$개예요.',
            '육각형은 꼭짓점이 $6$개예요.',
            '삼각형과 사각형은 모두 곧은 선으로 둘러싸여 있어요.',
          ];
          const F = [
            '삼각형은 변이 $4$개예요.',
            '원은 꼭짓점이 $1$개예요.',
            '사각형은 꼭짓점이 $3$개예요.',
            '오각형은 꼭짓점이 $6$개예요.',
            '원에는 곧은 선이 $1$개 있어요.',
            '육각형은 변이 $5$개예요.',
            '길쭉하게 동그란 모양도 원이에요.',
          ];
          const wantTrue = level !== 1 ? r.chance(0.5) : true;
          if (wantTrue) {
            const right = r.pick(T);
            return {
              q: '도형에 대한 설명으로 **옳은** 것을 고르세요.',
              answer: makeChoices(r, right, r.sample(F, 3)),
              steps: [`${right}`, '나머지는 변·꼭짓점의 수가 틀렸거나 원의 성질과 맞지 않아요.'],
            };
          }
          const right = r.pick(F);
          return {
            q: '도형에 대한 설명으로 **옳지 않은** 것을 고르세요.',
            answer: makeChoices(r, right, r.sample(T, 3)),
            steps: [`'${right.replace(/\$/g, '')}'는 틀린 설명이에요.`, '삼각형 $3$, 사각형 $4$, 오각형 $5$, 육각형 $6$ (변·꼭짓점), 원은 곧은 선과 꼭짓점이 없어요.'],
          };
        },
      },
    ],
  },

  // ───────────────────────── 덧셈과 뺄셈
  'e2a-3': {
    concepts: [
      {
        title: '받아올림이 있는 덧셈',
        body: '일의 자리끼리 더해서 $10$이 넘으면 **십의 자리로 $1$을 받아올림**해요.\n$$27+15$$\n- 일의 자리: $7+5=12$ → $2$를 쓰고 $1$을 받아올림\n- 십의 자리: $1+2+1=4$ → $42$\n- 십의 자리끼리 더해서 $10$이 넘으면 백의 자리로 받아올림해요. $76+58=134$',
      },
      {
        title: '받아내림이 있는 뺄셈',
        body: '일의 자리끼리 뺄 수 없으면 **십의 자리에서 $10$을 받아내림**해요.\n$$52-27$$\n- 일의 자리: $12-7=5$\n- 십의 자리: $4-2=2$ → $25$',
      },
      {
        title: '여러 가지 방법으로 계산하기',
        body: '- $38+25 = 38+2+23 = 40+23 = 63$ (몇십을 만들어 더하기)\n- $52-27 = 52-22-5 = 30-5 = 25$\n- 편한 방법을 골라 계산해요.',
      },
      {
        title: '덧셈과 뺄셈의 관계, □ 구하기',
        body: '$18+\\square=45$ 는 $45-18=\\square$ 로 바꾸어 구할 수 있어요.\n- $\\square-15=30$ → $\\square=30+15$\n- 1학년의 "덧셈과 뺄셈의 관계"를 더 큰 수에서 써요.',
      },
      {
        title: '세 수의 계산',
        body: '세 수의 계산은 **앞에서부터 차례로** 해요.\n$$45+18-20 = 63-20 = 43$$',
      },
    ],
    skills: [
      {
        id: 'add-carry',
        title: '받아올림 있는 덧셈',
        gen(r, level) {
          const [a, b] = carryAdd(r, level);
          const s = a + b;
          const vertical = r.chance(0.5);
          return {
            q: vertical ? `계산해 보세요.\n$$${vert(a, b, '+')}$$` : `계산해 보세요.\n$$${a}+${b}=\\square$$`,
            answer: { type: 'num', value: s },
            steps: [
              `일의 자리: $${a % 10}+${b % 10}=${(a % 10) + (b % 10)}$ → $${s % 10}$을 쓰고 $1$을 받아올림`,
              `십의 자리: $1+${Math.floor(a / 10)}+${Math.floor(b / 10)}=${1 + Math.floor(a / 10) + Math.floor(b / 10)}$`,
              `답: $${s}$`,
            ],
          };
        },
      },
      {
        id: 'sub-borrow',
        title: '받아내림 있는 뺄셈',
        gen(r, level) {
          const [a, b] = borrowSub(r, level);
          const d = a - b;
          const vertical = r.chance(0.5);
          return {
            q: vertical ? `계산해 보세요.\n$$${vert(a, b, '-')}$$` : `계산해 보세요.\n$$${a}-${b}=\\square$$`,
            answer: { type: 'num', value: d },
            steps: [
              `일의 자리: $${a % 10}$에서 $${b % 10}$를 뺄 수 없으니 십의 자리에서 $10$을 받아내림 → $${(a % 10) + 10}-${b % 10}=${(a % 10) + 10 - (b % 10)}$`,
              `십의 자리: $${Math.floor(a / 10) - 1}-${Math.floor(b / 10)}=${Math.floor(a / 10) - 1 - Math.floor(b / 10)}$`,
              `답: $${d}$`,
            ],
          };
        },
      },
      {
        id: 'box',
        title: '□의 값 구하기',
        gen(r, level) {
          if (level === 3) {
            const x = r.int(25, 80);
            const k = r.int(12, Math.min(19, x - 5));
            const wrong = x - k;
            return {
              q: `어떤 수에 $${k}$를 더해야 할 것을 잘못하여 뺐더니 $${wrong}$가 되었어요. 바르게 계산하면 얼마인가요?`,
              answer: { type: 'num', value: x + k },
              steps: [`어떤 수를 $\\square$라 하면 $\\square-${k}=${wrong}$`, `$\\square=${wrong}+${k}=${x}$`, `바른 계산: $${x}+${k}=${x + k}$`],
              hint: '먼저 어떤 수를 구하세요.',
            };
          }
          const [a, b] = carryAdd(r, 2);
          const kind = level === 1 ? r.int(0, 1) : r.int(0, 3);
          const s = a + b;
          const forms = [
            { q: `${a}+\\square=${s}`, ans: b, st: `$\\square=${s}-${a}=${b}$` },
            { q: `\\square+${b}=${s}`, ans: a, st: `$\\square=${s}-${b}=${a}$` },
            { q: `${s}-\\square=${a}`, ans: b, st: `$\\square=${s}-${a}=${b}$` },
            { q: `\\square-${b}=${a}`, ans: s, st: `$\\square=${a}+${b}=${s}$` },
          ];
          const f = forms[kind];
          return {
            q: `$\\square$ 안에 알맞은 수를 쓰세요.\n$$${f.q}$$`,
            answer: { type: 'num', value: f.ans },
            steps: ['덧셈과 뺄셈의 관계를 이용해요.', f.st],
          };
        },
      },
      {
        id: 'three',
        title: '세 수의 계산',
        gen(r, level) {
          const a = r.int(15, lv(level, 40, 60, 70));
          const b = r.int(11, 29);
          const c = r.int(11, Math.min(29, a + b - 5));
          const ops = lv(level, ['+', '+'], r.pick([['+', '-'], ['-', '+']]), r.pick([['+', '-'], ['-', '+'], ['-', '-']]));
          let x = a;
          let y = b;
          if (ops[0] === '-' && y >= x) [x, y] = [y + 20, x];
          const first = ops[0] === '+' ? x + y : x - y;
          let z = c;
          if (ops[1] === '-' && z >= first) z = Math.max(1, first - r.int(3, 9));
          const res = ops[1] === '+' ? first + z : first - z;
          return {
            q: `계산해 보세요.\n$$${x}${ops[0]}${y}${ops[1]}${z}=\\square$$`,
            answer: { type: 'num', value: res },
            steps: [`앞에서부터: $${x}${ops[0]}${y}=${first}$`, `$${first}${ops[1]}${z}=${res}$`],
          };
        },
      },
      {
        id: 'word',
        title: '이야기 문제',
        gen(r, level) {
          const [p1, p2] = names(r, 2);
          const [thing, u] = r.pick(THINGS);
          if (level === 1) {
            const [a, b] = carryAdd(r, 2);
            return {
              q: `${p1}는 ${thing} $${a}$${u}를 가지고 있고, ${p2}는 $${b}$${u}를 가지고 있어요. 두 사람이 가진 ${thing}는 모두 몇 ${u}인가요?`,
              answer: { type: 'num', value: a + b, unit: u },
              steps: ['모두 몇인지 구하니까 덧셈이에요.', `$${a}+${b}=${a + b}$ (${u})`],
            };
          }
          if (level === 2) {
            const [a, b] = borrowSub(r, 2);
            return r.chance(0.5)
              ? {
                  q: `${thing} $${a}$${u} 중에서 $${b}$${u}를 친구들에게 나누어 주었어요. 남은 ${thing}는 몇 ${u}인가요?`,
                  answer: { type: 'num', value: a - b, unit: u },
                  steps: ['남은 것을 구하니까 뺄셈이에요.', `$${a}-${b}=${a - b}$ (${u})`],
                }
              : {
                  q: `${p1}는 줄넘기를 $${a}$번, ${p2}는 $${b}$번 넘었어요. ${p1}는 ${p2}보다 몇 번 더 많이 넘었나요?`,
                  answer: { type: 'num', value: a - b, unit: '번' },
                  steps: ['차이를 구하니까 뺄셈이에요.', `$${a}-${b}=${a - b}$ (번)`],
                };
          }
          const a = r.int(30, 60);
          const b = r.int(15, 39);
          const c = r.int(18, a + b - 10);
          return {
            q: `버스에 $${a}$명이 타고 있었어요. 이번 정류장에서 $${b}$명이 타고 $${c}$명이 내렸어요. 지금 버스에 타고 있는 사람은 몇 명인가요?`,
            answer: { type: 'num', value: a + b - c, unit: '명' },
            steps: [`탄 사람은 더해요: $${a}+${b}=${a + b}$`, `내린 사람은 빼요: $${a + b}-${c}=${a + b - c}$ (명)`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 길이 재기
  'e2a-4': {
    concepts: [
      {
        title: '여러 가지 단위로 재기',
        body: '뼘, 클립, 연필 등으로 길이를 잴 수 있어요.\n- 같은 길이라도 **단위가 길면 잰 횟수가 적고**, 단위가 짧으면 횟수가 많아요.\n- 사람마다 뼘의 길이가 달라서 정확하게 말하기 어려워요. 그래서 모두가 같이 쓰는 단위가 필요해요.',
      },
      {
        title: '1 cm',
        body: '자의 큰 눈금 한 칸의 길이를 **1 cm**(1 센티미터)라고 해요.\n- $1$ cm가 $5$번이면 $5$ cm예요.',
      },
      {
        title: '자로 길이 재기',
        body: '- 물건의 한쪽 끝을 자의 눈금 **0에 맞추고**, 다른 쪽 끝의 눈금을 읽어요.\n- 0이 아닌 눈금에 맞추었을 때는 **$1$ cm가 몇 번** 들어가는지 세요. ($3$부터 $8$까지 → $5$ cm)',
      },
      {
        title: '약 몇 cm',
        body: '끝이 눈금 사이에 있으면 **가까운 쪽 눈금**을 읽고 "약"을 붙여요.\n- $7$ cm에 더 가까우면 "약 $7$ cm"',
      },
      {
        title: '길이 어림하기',
        body: '자를 쓰지 않고 길이가 얼마쯤인지 생각해 보는 것을 **어림**이라고 해요.\n- 내 손가락 한 마디(약 $1$ cm), 한 뼘(약 $15$ cm) 등을 떠올리면 도움이 돼요.\n- 어림한 길이와 자로 잰 길이의 차이가 작을수록 잘 어림한 거예요.',
      },
    ],
    skills: [
      {
        id: 'ruler',
        title: '자로 길이 재기',
        gen(r, level) {
          const thing = r.pick(['연필', '지우개', '크레파스', '풀', '못', '색연필', '열쇠']);
          if (level === 1) {
            const len = r.int(2, 10);
            return {
              q: `${thing}의 길이는 몇 cm인가요?`,
              fig: rulerFig(11, 0, len, { label: thing }),
              answer: { type: 'num', value: len, unit: 'cm' },
              steps: [`한쪽 끝이 $0$에 맞추어져 있어요.`, `다른 쪽 끝의 눈금이 $${len}$이므로 $${len}$ cm`],
            };
          }
          if (level === 2) {
            const st = r.int(1, 4);
            const len = r.int(2, 7);
            return {
              q: `${thing}의 길이는 몇 cm인가요?`,
              fig: rulerFig(12, st, st + len, { label: thing }),
              answer: { type: 'num', value: len, unit: 'cm' },
              steps: [`눈금 $${st}$부터 $${st + len}$까지예요.`, `$1$ cm가 $${len}$번 → $${len}$ cm`],
              hint: '0이 아닌 곳에서 시작하면 1 cm가 몇 번인지 세어 보세요.',
            };
          }
          const st = r.int(0, 3);
          const len = r.int(3, 8);
          const off = r.pick([-0.3, -0.2, 0.2, 0.3]);
          return {
            q: `${thing}의 길이는 약 몇 cm인가요?`,
            fig: rulerFig(12, st, st + len + off, { label: thing }),
            answer: { type: 'num', value: len, unit: 'cm' },
            steps: [
              `${thing}의 끝이 눈금 $${st + len}$에 가까워요.`,
              st === 0 ? `약 $${len}$ cm` : `$${st}$부터 $${st + len}$까지 $1$ cm가 약 $${len}$번 → 약 $${len}$ cm`,
            ],
          };
        },
      },
      {
        id: 'units',
        title: '여러 가지 단위',
        gen(r, level) {
          const [p1, p2] = names(r, 2);
          if (level === 1) {
            const len = r.int(3, 8);
            const s = new Svg(len * 30 + 40, 70);
            s.rect(20, 10, len * 30, 18, { cls: 'acc', fill: true });
            for (let i = 0; i < len; i++) {
              s.rect(20 + i * 30 + 2, 38, 26, 12, { cls: 'acc2' });
            }
            s.text(20 + (len * 30) / 2, 62, '클립', { size: 11 });
            return {
              q: '막대의 길이는 클립으로 몇 번인가요?',
              fig: s.toString(),
              answer: { type: 'num', value: len, unit: '번' },
              steps: ['클립을 하나씩 세어요.', `$${len}$번`],
            };
          }
          if (level === 2) {
            const a = r.int(5, 9);
            let b = r.int(5, 9);
            if (b === a) b = a + 1;
            const longer = a < b ? p1 : p2;
            return {
              q: `같은 책상의 길이를 ${p1}는 뼘으로 $${a}$번, ${p2}는 뼘으로 $${b}$번 재었어요. 누구의 뼘이 더 긴가요?`,
              answer: makeChoices(r, longer, [longer === p1 ? p2 : p1]),
              steps: ['같은 길이를 잴 때 단위가 길수록 잰 횟수가 적어요.', `더 적게 잰 ${longer}의 뼘이 더 길어요.`],
            };
          }
          const clip = r.int(2, 4);
          const k = r.int(3, 6);
          const unitThing = r.pick(['클립', '지우개', '못']);
          return {
            q: `${unitThing}의 길이는 $${clip}$ cm예요. 연필의 길이가 ${unitThing}로 $${k}$번이라면 연필의 길이는 몇 cm인가요?`,
            answer: { type: 'num', value: clip * k, unit: 'cm' },
            steps: [`$${clip}$ cm가 $${k}$번이에요.`, `$${range(1, k).map(() => clip).join('+')}=${clip * k}$ (cm)`],
          };
        },
      },
      {
        id: 'grid-cm',
        title: '1 cm 모눈',
        gen(r, level) {
          if (level === 1) {
            const len = r.int(3, 9);
            return {
              q: '모눈 한 칸의 길이는 $1$ cm예요. 선의 길이는 몇 cm인가요?',
              fig: (() => {
                const x0 = r.int(0, 10 - len);
                return gridPath(10, 2, [{ pts: [[x0, 1], [x0 + len, 1]] }]);
              })(),
              answer: { type: 'num', value: len, unit: 'cm' },
              steps: [`$1$ cm가 몇 번인지 세어요.`, `$${len}$ cm`],
            };
          }
          // 꺾은선
          const segs = lv(level, 2, 3, 3);
          const pts: [number, number][] = [[0, 0]];
          let total = 0;
          let x = 0;
          let y = 0;
          for (let i = 0; i < segs; i++) {
            const horiz = i % 2 === 0;
            const l = r.int(1, 4);
            if (horiz) x += l;
            else y += l;
            total += l;
            pts.push([x, y]);
          }
          if (level === 2) {
            return {
              q: '모눈 한 칸의 길이는 $1$ cm예요. 굵은 선의 길이는 모두 몇 cm인가요?',
              fig: gridPath(Math.max(x, 4) + 1, Math.max(y, 3) + 1, [{ pts }]),
              answer: { type: 'num', value: total, unit: 'cm' },
              steps: [`선을 나누어 칸 수를 세요.`, `모두 $${total}$ cm`],
            };
          }
          const len2 = r.int(Math.max(2, total - 4), total + 4);
          const t2 = len2 === total ? total + 2 : len2;
          const longer = total > t2 ? '가' : '나';
          return {
            q: `모눈 한 칸의 길이는 $1$ cm예요. 가와 나 중 어느 선이 몇 cm 더 긴가요? 더 긴 선의 기호를 고르세요. (가는 꺾은선, 나는 곧은 선)`,
            fig: gridPath(Math.max(x, t2) + 1, y + 3, [
              { pts, label: '가' },
              { pts: [[0, y + 2], [t2, y + 2]], label: '나', cls: 'acc2' },
            ]),
            answer: makeChoices(r, `${longer}, $${Math.abs(total - t2)}$ cm`, [`${longer === '가' ? '나' : '가'}, $${Math.abs(total - t2)}$ cm`, `${longer}, $${Math.abs(total - t2) + 1}$ cm`, `${longer === '가' ? '나' : '가'}, $${Math.abs(total - t2) + 1}$ cm`]),
            steps: [`가: $${total}$ cm, 나: $${t2}$ cm`, `${longer}가 $${Math.abs(total - t2)}$ cm 더 길어요.`],
          };
        },
      },
      {
        id: 'estimate',
        title: '길이 어림하기',
        gen(r, level) {
          if (level === 1) {
            const facts: [string, number, number[]][] = [
              ['엄지손톱의 너비', 1, [10, 30, 50]],
              ['새 연필의 길이', 17, [1, 3, 90]],
              ['우리 교과서의 긴 쪽 길이', 26, [2, 5, 100]],
              ['크레파스 한 개의 길이', 8, [1, 30, 80]],
              ['클립 한 개의 길이', 3, [30, 50, 15]],
              ['지우개의 긴 쪽 길이', 5, [50, 1, 30]],
            ];
            const [what, ans, wr] = r.pick(facts);
            return {
              q: `${what}로 알맞은 것을 고르세요.`,
              answer: makeChoices(r, `약 $${ans}$ cm`, wr.map((w) => `약 $${w}$ cm`)),
              steps: ['$1$ cm는 손가락 한 마디 너비쯤이에요.', `${what}는 약 $${ans}$ cm예요.`],
            };
          }
          const real = r.int(15, 40);
          const ns = names(r, lv(level, 3, 3, 4));
          let est: number[];
          do est = ns.map(() => real + r.int(-6, 6));
          while (new Set(est.map((e) => Math.abs(e - real))).size !== est.length || est.some((e) => e === real));
          const diffs = est.map((e) => Math.abs(e - real));
          const best = diffs.indexOf(Math.min(...diffs));
          return {
            q: `길이가 $${real}$ cm인 끈을 어림했어요. 가장 가깝게 어림한 사람은 누구인가요?`,
            table: [['이름', ...ns], ['어림한 길이', ...est.map((e) => `약 $${e}$ cm`)]],
            answer: makeChoices(r, ns[best], ns.filter((_, i) => i !== best)),
            steps: [ns.map((n, i) => `${n}: $${diffs[i]}$ cm 차이`).join(', '), `차이가 가장 작은 ${ns[best]}가 가장 가깝게 어림했어요.`],
          };
        },
      },
      {
        id: 'compare',
        title: '길이 비교와 차',
        gen(r, level) {
          const things = r.sample(['빨간 끈', '파란 끈', '노란 끈', '초록 끈'], 3);
          if (level === 1) {
            const [a, b] = r.sample(range(4, 15), 2);
            return {
              q: `${things[0]}는 $${a}$ cm, ${things[1]}는 $${b}$ cm예요. 어느 끈이 더 긴가요?`,
              answer: makeChoices(r, a > b ? things[0] : things[1], [a > b ? things[1] : things[0]]),
              steps: [`$${Math.max(a, b)}$ cm가 $${Math.min(a, b)}$ cm보다 길어요.`],
            };
          }
          if (level === 2) {
            const [a, b] = r.sample(range(5, 30), 2);
            return {
              q: `${things[0]}는 $${a}$ cm, ${things[1]}는 $${b}$ cm예요. 두 끈의 길이의 차는 몇 cm인가요?`,
              answer: { type: 'num', value: Math.abs(a - b), unit: 'cm' },
              steps: ['긴 길이에서 짧은 길이를 빼요.', `$${Math.max(a, b)}-${Math.min(a, b)}=${Math.abs(a - b)}$ (cm)`],
            };
          }
          const a = r.int(12, 30);
          const b = r.int(8, 25);
          return {
            q: `$${a}$ cm인 끈과 $${b}$ cm인 끈을 겹치지 않게 이었어요. 이은 끈의 길이는 몇 cm인가요?`,
            answer: { type: 'num', value: a + b, unit: 'cm' },
            steps: ['두 길이를 더해요.', `$${a}+${b}=${a + b}$ (cm)`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 분류하기
  'e2a-5': {
    concepts: [
      {
        title: '분류는 기준이 분명해야 해요',
        body: '정해진 기준에 따라 나누는 것을 **분류**라고 해요.\n- "예쁜 것과 예쁘지 않은 것"처럼 사람마다 다르게 생각하는 기준은 알맞지 않아요.\n- 색깔, 모양, 크기, 다리의 수처럼 **누가 분류해도 결과가 같은** 기준을 써요.',
      },
      {
        title: '기준에 따라 분류하기',
        body: '같은 물건도 기준을 바꾸면 다르게 분류할 수 있어요.\n- 단추를 **색깔**에 따라, 또는 **구멍의 수**에 따라 분류할 수 있어요.',
      },
      {
        title: '분류하여 세어 보기',
        body: '분류한 다음 각각 몇 개인지 세어 **표**로 나타내면 한눈에 알 수 있어요.\n- 빠뜨리거나 두 번 세지 않도록 센 것에 표시(/, ✓)를 해요.',
      },
      {
        title: '분류한 결과 말하기',
        body: '분류하고 센 결과로 "가장 많은 것", "가장 적은 것"을 알 수 있어요.\n- 예: 가장 많이 팔린 맛 → 다음에 더 많이 준비하면 좋아요.',
      },
    ],
    skills: [
      {
        id: 'criterion',
        title: '분류 기준',
        gen(r, level) {
          if (level === 1) {
            const bad = r.pick(['예쁜 것과 예쁘지 않은 것', '좋아하는 것과 싫어하는 것', '멋있는 것과 멋없는 것', '귀여운 것과 귀엽지 않은 것']);
            const good = r.sample(['색깔', '모양', '크기', '다리의 수', '바퀴의 수', '구멍의 수'], 3);
            return {
              q: '분류 기준으로 알맞지 **않은** 것을 고르세요.',
              answer: makeChoices(r, bad, good),
              steps: ['사람마다 생각이 다른 기준은 분류 결과가 달라져요.', `'${bad}'는 분명한 기준이 아니에요.`],
            };
          }
          if (level === 2) {
            const sets: [string, string, string, string[]][] = [
              ['사과, 딸기, 체리', '바나나, 레몬, 참외', '색깔', ['모양', '크기', '맛']],
              ['자동차, 버스, 기차', '비행기, 헬리콥터', '다니는 곳(땅, 하늘)', ['색깔', '바퀴의 수', '크기']],
              ['강아지, 고양이, 소', '닭, 오리, 참새', '다리의 수', ['색깔', '사는 나라', '크기']],
              ['고래, 상어, 문어', '사자, 토끼, 곰', '사는 곳(바다, 땅)', ['다리의 수', '색깔', '귀의 모양']],
              ['자전거, 오토바이', '세발자전거', '바퀴의 수', ['색깔', '모양', '무게']],
            ];
            const [g1, g2, ans, wr] = r.pick(sets);
            return {
              q: `다음과 같이 분류했어요. 분류 기준으로 가장 알맞은 것은 무엇인가요?\n가: ${g1}\n나: ${g2}`,
              answer: makeChoices(r, ans, wr),
              steps: [`두 무리를 비교해 보면 '${ans}'에 따라 나뉘었어요.`],
            };
          }
          // 속성 표에서 세기
          const animals: [string, number, string][] = [
            ['닭', 2, '땅'],
            ['오리', 2, '물'],
            ['개구리', 4, '물'],
            ['강아지', 4, '땅'],
            ['참새', 2, '하늘'],
            ['고양이', 4, '땅'],
            ['거미', 8, '땅'],
            ['소', 4, '땅'],
            ['비둘기', 2, '하늘'],
            ['문어', 8, '물'],
          ];
          const pick = r.sample(animals, 7);
          const legs = r.pick([...new Set(pick.map((a) => a[1]))]);
          const cnt = pick.filter((a) => a[1] === legs).length;
          return {
            q: `다리의 수에 따라 분류하려고 해요. 다리가 $${legs}$개인 동물은 몇 마리인가요?\n${pick.map((a) => a[0]).join(', ')}`,
            answer: { type: 'num', value: cnt, unit: '마리' },
            steps: [pick.map((a) => `${a[0]} $${a[1]}$개`).join(', '), `다리가 $${legs}$개인 동물: ${pick.filter((a) => a[1] === legs).map((a) => a[0]).join(', ')} → $${cnt}$마리`],
          };
        },
      },
      {
        id: 'sort-count',
        title: '모양과 색으로 분류하기',
        gen(r, level) {
          const n = lv(level, 7, 9, 10);
          // 묻는 개수가 0이 되지 않도록: 세 모양과 색칠 여부가 모두 섞이게 (3단계는 6가지 조합 모두)
          let items: { kind: Flat; filled: boolean }[] = [];
          for (let t = 0; t < 300; t++) {
            items = Array.from({ length: n }, () => ({ kind: r.pick(['sq', 'tri', 'cir'] as Flat[]), filled: r.chance(0.5) }));
            const combos = new Set(items.map((x) => `${x.kind}${x.filled}`));
            const kinds = new Set(items.map((x) => x.kind));
            const fills = new Set(items.map((x) => x.filled));
            if (level === 3 ? combos.size === 6 : kinds.size === 3 && fills.size === 2) break;
          }
          // 그리기
          const z = 36;
          const cell = z + 12;
          const per = 5;
          const s = new Svg(per * cell + 10, Math.ceil(n / per) * cell + 6);
          items.forEach((it, i) => {
            const cx = 5 + (i % per) * cell + cell / 2;
            const cy = 3 + Math.floor(i / per) * cell + cell / 2;
            if (it.kind === 'sq') s.rect(cx - z * 0.4, cy - z * 0.4, z * 0.8, z * 0.8, { cls: it.filled ? 'acc' : undefined, fill: it.filled });
            else if (it.kind === 'tri') s.poly([[cx, cy - z * 0.42], [cx + z * 0.45, cy + z * 0.4], [cx - z * 0.45, cy + z * 0.4]], { cls: it.filled ? 'acc' : undefined, fill: it.filled });
            else s.circle(cx, cy, z * 0.4, { cls: it.filled ? 'acc' : undefined, fill: it.filled });
          });
          const fig = s.toString();
          if (level === 1) {
            const filled = r.chance(0.5);
            const c = items.filter((x) => x.filled === filled).length;
            return {
              q: `색칠${filled ? '한' : '하지 않은'} 것은 몇 개인가요?`,
              fig,
              answer: { type: 'num', value: c, unit: '개' },
              steps: ['색깔을 기준으로 분류해요.', `$${c}$개`],
            };
          }
          const k = r.pick(['sq', 'tri', 'cir'] as Flat[]);
          if (level === 2) {
            const c = items.filter((x) => x.kind === k).length;
            return {
              q: `모양을 기준으로 분류할 때 ${FLAT_NAME[k]}은 몇 개인가요?`,
              fig,
              answer: { type: 'num', value: c, unit: '개' },
              steps: ['색깔은 생각하지 않고 모양만 보아요.', `$${c}$개`],
            };
          }
          const filled = r.chance(0.5);
          const c = items.filter((x) => x.kind === k && x.filled === filled).length;
          return {
            q: `색칠${filled ? '한' : '하지 않은'} ${FLAT_NAME[k]}은 몇 개인가요?`,
            fig,
            answer: { type: 'num', value: c, unit: '개' },
            steps: [`먼저 ${FLAT_NAME[k]}을 찾고, 그중에서 색칠${filled ? '한' : '하지 않은'} 것을 세어요.`, `$${c}$개`],
          };
        },
      },
      {
        id: 'tally',
        title: '분류하여 세기',
        gen(r, level) {
          const cats = r.pick([
            ['딸기', '바나나', '포도', '사과'],
            ['빨간색', '파란색', '노란색', '초록색'],
            ['축구', '야구', '농구', '수영'],
            ['강아지', '고양이', '토끼', '햄스터'],
          ]);
          const k = lv(level, 3, 4, 4);
          const cs = cats.slice(0, k);
          const n = lv(level, 9, 12, 14);
          let data: string[];
          let counts: number[];
          for (;;) {
            data = Array.from({ length: n }, () => r.pick(cs));
            counts = cs.map((c) => data.filter((d) => d === c).length);
            const mx = Math.max(...counts);
            const mn = Math.min(...counts);
            if (counts.filter((c) => c === mx).length === 1 && counts.filter((c) => c === mn).length === 1 && mn > 0) break;
          }
          const theme = cats[0] === '딸기' ? '좋아하는 과일' : cats[0] === '빨간색' ? '좋아하는 색깔' : cats[0] === '축구' ? '좋아하는 운동' : '기르고 싶은 동물';
          const table = [['번호', ...range(1, Math.ceil(n / 2)).map(String)], ['답', ...data.slice(0, Math.ceil(n / 2))], ['번호', ...range(Math.ceil(n / 2) + 1, n).map(String)], ['답', ...data.slice(Math.ceil(n / 2))]];
          while (table[2].length < table[0].length) {
            table[2].push('');
            table[3].push('');
          }
          if (level === 1) {
            const c = r.pick(cs);
            const cnt = counts[cs.indexOf(c)];
            return {
              q: `우리 반 학생들의 ${theme}를 조사했어요. '${c}'를 고른 학생은 몇 명인가요?`,
              table,
              answer: { type: 'num', value: cnt, unit: '명' },
              steps: [`'${c}'에 표시하며 세어요.`, `$${cnt}$명`],
            };
          }
          if (level === 2) {
            const mx = cs[counts.indexOf(Math.max(...counts))];
            return {
              q: `우리 반 학생들의 ${theme}를 조사했어요. 가장 많은 학생이 고른 것은 무엇인가요?`,
              table,
              answer: makeChoices(r, mx, cs.filter((c) => c !== mx)),
              steps: [cs.map((c, i) => `${c} $${counts[i]}$명`).join(', '), `가장 많은 것은 ${mx}예요.`],
            };
          }
          const mx = Math.max(...counts);
          const mn = Math.min(...counts);
          return {
            q: `우리 반 학생들의 ${theme}를 조사했어요. 가장 많은 학생이 고른 것과 가장 적은 학생이 고른 것의 학생 수의 차는 몇 명인가요?`,
            table,
            answer: { type: 'num', value: mx - mn, unit: '명' },
            steps: [cs.map((c, i) => `${c} $${counts[i]}$명`).join(', '), `$${mx}-${mn}=${mx - mn}$ (명)`],
          };
        },
      },
      {
        id: 'group',
        title: '알맞게 분류하기',
        gen(r, level) {
          const groups: Record<string, string[]> = {
            '바다에 사는 동물': ['고래', '상어', '문어', '오징어', '해파리', '거북'],
            '땅에 사는 동물': ['사자', '토끼', '코끼리', '다람쥐', '곰', '기린'],
            '하늘을 나는 것': ['비행기', '헬리콥터', '참새', '독수리', '열기구', '나비'],
            '땅 위를 다니는 탈것': ['자동차', '버스', '자전거', '기차', '트럭', '오토바이'],
            과일: ['사과', '배', '포도', '복숭아', '수박', '귤'],
            채소: ['당근', '오이', '배추', '양파', '무', '시금치'],
            학용품: ['연필', '지우개', '공책', '자', '풀', '가위'],
          };
          const keys = Object.keys(groups);
          const g = r.pick(keys);
          const others = keys.filter((k) => k !== g);
          if (level === 1) {
            const right = r.pick(groups[g]);
            const wr = r.sample(others.flatMap((k) => groups[k]), 3);
            return {
              q: `다음 중 '${g}'로 분류할 수 있는 것을 고르세요.`,
              answer: makeChoices(r, right, wr),
              steps: [`${J(right, '은')} ${J(g, '이에요')}.`],
            };
          }
          const inG = r.sample(groups[g], 3);
          const oddKey = r.pick(others);
          const odd = r.pick(groups[oddKey]);
          if (level === 2) {
            return {
              q: `다음 중 '${g}'로 분류할 수 **없는** 것을 고르세요.`,
              answer: makeChoices(r, odd, inG),
              steps: [`${J(odd, '은')} '${oddKey}'예요.`],
            };
          }
          const mix = r.shuffle([...r.sample(groups[g], r.int(2, 4)), ...r.sample(groups[oddKey], r.int(2, 3))]);
          const cnt = mix.filter((x) => groups[g].includes(x)).length;
          return {
            q: `다음을 '${g}'와 '${oddKey}'로 분류했을 때 '${g}'는 몇 개인가요?\n${mix.join(', ')}`,
            answer: { type: 'num', value: cnt, unit: '개' },
            steps: [`${g}: ${mix.filter((x) => groups[g].includes(x)).join(', ')}`, `$${cnt}$개`],
          };
        },
      },
      {
        id: 'result',
        title: '분류한 결과 말하기',
        gen(r, level) {
          const flavors = r.sample(['초코', '딸기', '바닐라', '녹차', '망고'], lv(level, 3, 4, 4));
          let counts: number[];
          do counts = flavors.map(() => r.int(3, 15));
          while (new Set(counts).size !== counts.length);
          const table = [['맛', ...flavors, '합계'], ['팔린 개수(개)', ...counts.map(String), String(counts.reduce((a, b) => a + b, 0))]];
          const mxI = counts.indexOf(Math.max(...counts));
          const mnI = counts.indexOf(Math.min(...counts));
          if (level === 1) {
            const most = r.chance(0.5);
            const i = most ? mxI : mnI;
            return {
              q: `오늘 가게에서 팔린 아이스크림을 맛에 따라 분류하여 세었어요. 가장 ${most ? '많이' : '적게'} 팔린 맛은 무엇인가요?`,
              table,
              answer: makeChoices(r, flavors[i], flavors.filter((_, j) => j !== i)),
              steps: [`표에서 가장 ${most ? '큰' : '작은'} 수를 찾아요: $${counts[i]}$개`, `${flavors[i]} 맛`],
            };
          }
          if (level === 2) {
            return {
              q: '내일 아이스크림을 더 많이 준비하려고 해요. 어떤 맛을 가장 많이 준비하면 좋을까요?',
              table,
              answer: makeChoices(r, flavors[mxI], flavors.filter((_, j) => j !== mxI)),
              steps: [`가장 많이 팔린 맛은 ${flavors[mxI]}($${counts[mxI]}$개)예요.`, `그래서 ${flavors[mxI]} 맛을 가장 많이 준비하면 좋아요.`],
            };
          }
          const [i, j] = r.sample(range(0, flavors.length - 1), 2);
          return {
            q: `${flavors[i]} 맛과 ${flavors[j]} 맛을 합하면 모두 몇 개 팔렸나요?`,
            table: [table[0].slice(0, -1), table[1].slice(0, -1)],
            answer: { type: 'num', value: counts[i] + counts[j], unit: '개' },
            steps: [`${flavors[i]} $${counts[i]}$개, ${flavors[j]} $${counts[j]}$개`, `$${counts[i]}+${counts[j]}=${counts[i] + counts[j]}$ (개)`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 곱셈
  'e2a-6': {
    concepts: [
      {
        title: '여러 가지 방법으로 세기',
        body: '물건이 많을 때는 하나씩 세는 것보다 **뛰어 세기**나 **묶어 세기**가 편해요.\n- $2$씩 뛰어 세기: $2, 4, 6, 8, 10$\n- $5$씩 묶어 세기: $5, 10, 15, 20$',
      },
      {
        title: '몇의 몇 배',
        body: '$3$씩 $4$묶음은 $3$의 **$4$배**예요.\n- $3$의 $4$배는 $3+3+3+3=12$',
      },
      {
        title: '곱셈식',
        body: '$3$의 $4$배를 $3\\times 4$ 라고 써요. "$3$ **곱하기** $4$"라고 읽어요.\n$$3\\times 4=12$$\n"$3$ 곱하기 $4$는 $12$와 같습니다", "$3$과 $4$의 **곱**은 $12$입니다".',
      },
      {
        title: '곱셈식으로 나타내기',
        body: '같은 수를 여러 번 더하는 덧셈식은 곱셈식으로 간단히 나타낼 수 있어요.\n- $5+5+5+5+5+5 = 5\\times 6 = 30$\n- 1학년의 "묶어 세기"가 곱셈으로 이어져요.',
      },
    ],
    skills: [
      {
        id: 'groups',
        title: '묶어 세기',
        gen(r, level) {
          const a = r.int(2, lv(level, 5, 7, 9));
          const b = r.int(2, lv(level, 4, 5, 5));
          const fig = dotGroups(Array.from({ length: b }, () => ({ n: a, perRow: a <= 5 ? a : Math.ceil(a / 2) })), { r: 7, gap: 14 });
          if (level === 1) {
            return {
              q: '몇씩 몇 묶음인가요?',
              fig,
              answer: { type: 'fields', fields: [{ label: '몇씩', value: a }, { label: '몇 묶음', value: b }] },
              steps: [`한 묶음에 $${a}$개씩 있어요.`, `묶음이 $${b}$개 → $${a}$씩 $${b}$묶음`],
            };
          }
          if (level === 2) {
            return {
              q: '구슬은 모두 몇 개인가요? 묶어 세어 보세요.',
              fig,
              answer: { type: 'num', value: a * b, unit: '개' },
              steps: [`$${a}$씩 $${b}$묶음`, `$${range(1, b).map((i) => a * i).join(', ')}$ → $${a * b}$개`],
            };
          }
          const tot = a * b;
          const alt = [2, 3, 4, 5, 6].filter((d) => tot % d === 0 && d !== a && tot / d <= 9);
          const d = alt.length ? r.pick(alt) : b;
          return {
            q: `구슬 $${tot}$개를 $${d}$개씩 묶으면 몇 묶음이 되나요?`,
            answer: { type: 'num', value: tot / d, unit: '묶음' },
            steps: [`$${d}$씩 뛰어 세어 $${tot}$이 될 때까지 세요.`, `$${range(1, tot / d).map((i) => d * i).join(', ')}$ → $${tot / d}$묶음`],
          };
        },
      },
      {
        id: 'times',
        title: '몇의 몇 배',
        gen(r, level) {
          const a = r.int(2, 9);
          const b = r.int(2, lv(level, 4, 6, 9));
          if (level === 1) {
            const s = new Svg(Math.max(a * b * 14 + 40, 120), 76);
            s.text(14, 16, '가', { size: 12 });
            s.rect(28, 6, a * 14, 18, { cls: 'acc', fill: true });
            s.text(14, 50, '나', { size: 12 });
            for (let i = 0; i < b; i++) s.rect(28 + i * a * 14, 40, a * 14, 18, { cls: 'acc2', fill: true });
            return {
              q: `가 막대의 길이는 $${a}$ cm예요. 나 막대의 길이는 가 막대의 몇 배인가요?`,
              fig: s.toString(),
              answer: { type: 'num', value: b, unit: '배' },
              steps: [`나 막대에는 가 막대가 $${b}$번 들어가요.`, `$${b}$배`],
            };
          }
          if (level === 2) {
            return {
              q: `$${a}$의 $${b}$배는 얼마인가요?`,
              answer: { type: 'num', value: a * b },
              steps: [`$${a}$의 $${b}$배 $=${range(1, b).map(() => a).join('+')}$`, `$=${a * b}$`],
            };
          }
          const [p1, p2] = names(r, 2);
          return {
            q: `${p1}는 사탕을 $${a}$개 가지고 있고, ${p2}는 ${p1}의 $${b}$배만큼 가지고 있어요. ${p2}가 가진 사탕은 몇 개인가요?`,
            answer: { type: 'num', value: a * b, unit: '개' },
            steps: [`$${a}$의 $${b}$배 $= ${a}\\times ${b}$`, `$=${a * b}$ (개)`],
          };
        },
      },
      {
        id: 'add-to-mul',
        title: '덧셈식과 곱셈식',
        gen(r, level) {
          const a = r.int(2, 9);
          const b = r.int(3, lv(level, 5, 6, 7));
          const addTex = range(1, b).map(() => a).join('+');
          if (level === 1) {
            return {
              q: `덧셈식을 곱셈식으로 바르게 나타낸 것을 고르세요.\n$$${addTex}$$`,
              answer: makeChoices(r, `$${a}\\times ${b}$`, [`$${a}+${b}$`, `$${a}\\times ${a}$`, `$${a}\\times ${b + 1}$`, `$${b}\\times ${b}$`].filter((x) => x !== `$${a}\\times ${b}$`)),
              steps: [`$${a}$를 $${b}$번 더했어요.`, `$${a}$의 $${b}$배 → $${a}\\times ${b}$`],
            };
          }
          if (level === 2) {
            return {
              q: `빈칸에 알맞은 수를 쓰세요.\n$$${addTex}=${a}\\times\\square$$`,
              answer: { type: 'num', value: b },
              steps: [`$${a}$를 몇 번 더했는지 세어요.`, `$${b}$번 → $${a}\\times ${b}$`],
            };
          }
          return {
            q: `$${a}\\times ${b}$를 덧셈식으로 나타내어 계산하면 얼마인가요?`,
            answer: { type: 'num', value: a * b },
            steps: [`$${a}\\times ${b}=${addTex}$`, `$=${a * b}$`],
          };
        },
      },
      {
        id: 'word',
        title: '곱셈 이야기 문제',
        gen(r, level) {
          const ctx: [string, string, string][] = [
            ['한 봉지에 사탕이', '봉지', '사탕'],
            ['한 상자에 귤이', '상자', '귤'],
            ['자동차 한 대에 바퀴가', '대', '바퀴'],
            ['한 접시에 쿠키가', '접시', '쿠키'],
            ['꽃 한 송이에 꽃잎이', '송이', '꽃잎'],
          ];
          const [lead, unit, item] = r.pick(ctx);
          const a = lead.includes('바퀴') ? 4 : lead.includes('꽃잎') ? 5 : r.int(2, lv(level, 5, 9, 9));
          const b = r.int(2, lv(level, 5, 9, 9));
          if (level < 3) {
            return {
              q: `${lead} $${a}$개씩 있어요. $${b}$${unit}에 있는 ${item}는 모두 몇 개인가요?`,
              answer: { type: 'num', value: a * b, unit: '개' },
              steps: [`$${a}$씩 $${b}$묶음 → $${a}\\times ${b}$`, `$${a}\\times ${b}=${a * b}$ (개)`],
            };
          }
          const more = r.chance(0.5);
          const extra = r.int(1, more ? 9 : Math.min(9, a * b - 1)); // 음수가 나오지 않게
          return {
            q: `${lead} $${a}$개씩 있어요. $${b}$${unit}에 있는 ${item}보다 $${extra}$개 ${more ? '더 많은' : '더 적은'} 수는 얼마인가요?`,
            answer: { type: 'num', value: more ? a * b + extra : a * b - extra },
            steps: [`$${a}\\times ${b}=${a * b}$`, `$${a * b}${more ? '+' : '-'}${extra}=${more ? a * b + extra : a * b - extra}$`],
          };
        },
      },
      {
        id: 'skip-line',
        title: '뛰어 세기와 곱셈',
        gen(r, level) {
          const a = r.int(2, lv(level, 4, 5, 6));
          const b = r.int(3, lv(level, 4, 5, 6));
          const max = Math.ceil((a * b + a) / 5) * 5;
          if (level === 2) {
            return {
              q: `수직선에서 몇씩 뛰어 세었나요?`,
              fig: jumpLine(0, max, 0, a, b, { tick: 1 }),
              answer: { type: 'num', value: a },
              steps: [`한 번에 $${a}$칸씩 뛰었어요.`, `$${a}$씩 뛰어 세었어요.`],
            };
          }
          if (level === 3) {
            return {
              q: `수직선을 보고 알맞은 곱셈식을 고르세요.`,
              fig: jumpLine(0, max, 0, a, b, { tick: 1 }),
              answer: makeChoices(r, `$${a}\\times ${b}=${a * b}$`, [`$${a}+${b}=${a + b}$`, `$${a}\\times ${b + 1}=${a * (b + 1)}$`, `$${a + 1}\\times ${b}=${(a + 1) * b}$`]),
              steps: [`$${a}$씩 $${b}$번 뛰었어요.`, `$${a}\\times ${b}=${a * b}$`],
            };
          }
          return {
            q: `$${a}$씩 $${b}$번 뛰어 세었어요. ? 에 알맞은 수를 쓰세요.`,
            fig: jumpLine(0, max, 0, a, b, { tick: 1, hideEnd: true }),
            answer: { type: 'num', value: a * b },
            steps: [`$${range(1, b).map((i) => a * i).join(', ')}$`, `$${a}\\times ${b}=${a * b}$`],
          };
        },
      },
    ],
  },
};

// 문장제 유형 덧붙이기 (words*.ts)
for (const [id, sks] of Object.entries(WORDS_2)) if (e2a[id]) e2a[id].skills.push(...sks);
