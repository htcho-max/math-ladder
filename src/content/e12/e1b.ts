// 초1-2: 100까지의 수 / 덧셈과 뺄셈(1) / 모양과 시각 / 덧셈과 뺄셈(2) / 규칙 찾기 / 덧셈과 뺄셈(3)
import type { ContentMap, Level } from '../../core/types';
import { WORDS_1 } from './words1';
import { HARD_1 } from './hard1';
import type { Rng } from '../../core/rng';
import { makeChoices } from '../../core/tex';
import { range } from '../../core/nt';
import { clock } from '../../core/fig';
import { names, native, sino, intChoices, lv, vert, THINGS, ensureEach } from './util';
import { bundles, baseTen, dotGroups, tenFrames, flatsRow, FLAT_NAME, type Flat, patternRow } from './draw';

const FLATS: Flat[] = ['sq', 'tri', 'cir'];
const CORNERS: Record<Flat, number> = { sq: 4, tri: 3, cir: 0 };

/** 받아올림 없는 두 수 */
function noCarryAdd(r: Rng, level: Level): [number, number] {
  for (;;) {
    let a: number, b: number;
    if (level === 1) {
      a = r.int(1, 8) * 10 + r.int(1, 8);
      b = r.int(1, 9 - (a % 10));
    } else if (level === 2) {
      if (r.chance(0.3)) {
        a = r.int(1, 8) * 10;
        b = r.int(1, 9 - a / 10) * 10;
      } else {
        a = r.int(1, 7) * 10 + r.int(0, 8);
        b = r.int(1, 8 - Math.floor(a / 10)) * 10 + r.int(0, 9 - (a % 10));
      }
    } else {
      a = r.int(2, 7) * 10 + r.int(1, 8);
      b = r.int(1, 9 - Math.floor(a / 10)) * 10 + r.int(1, 9 - (a % 10));
    }
    if ((a % 10) + (b % 10) <= 9 && a + b <= 99 && b > 0) return [a, b];
  }
}
/** 받아내림 없는 두 수 a-b */
function noBorrowSub(r: Rng, level: Level): [number, number] {
  for (;;) {
    let a: number, b: number;
    if (level === 1) {
      a = r.int(2, 9) * 10 + r.int(1, 9);
      b = r.int(1, a % 10);
    } else if (level === 2) {
      if (r.chance(0.3)) {
        a = r.int(3, 9) * 10;
        b = r.int(1, a / 10 - 1) * 10;
      } else {
        a = r.int(3, 9) * 10 + r.int(1, 9);
        b = r.int(1, Math.floor(a / 10) - 1) * 10 + r.int(0, a % 10);
      }
    } else {
      a = r.int(4, 9) * 10 + r.int(2, 9);
      b = r.int(1, Math.floor(a / 10) - 1) * 10 + r.int(1, a % 10);
    }
    if (b % 10 <= a % 10 && b < a) return [a, b];
  }
}

export const e1b: ContentMap = {
  // ───────────────────────── 100까지의 수
  'e1b-1': {
    concepts: [
      {
        title: '몇십 알아보기',
        body: '$10$개씩 묶음이 $6$개면 $60$(육십, 예순), $7$개면 $70$(칠십, 일흔), $8$개면 $80$(팔십, 여든), $9$개면 $90$(구십, 아흔)이에요.\n- 50까지의 수에서 배운 $20, 30, 40, 50$과 같은 방법이에요.',
      },
      {
        title: '99까지의 수',
        body: '$10$개씩 묶음 $7$개와 낱개 $5$개는 $75$예요. 칠십오 또는 일흔다섯이라고 읽어요.',
        example: { q: '$10$개씩 묶음 $8$개와 낱개 $3$개는?', a: '$83$ (팔십삼, 여든셋)' },
      },
      {
        title: '100 알아보기',
        body: '$99$보다 $1$만큼 더 큰 수를 $100$이라고 해요. **백**이라고 읽어요.\n- $90$보다 $10$만큼 더 큰 수도 $100$이에요.',
      },
      {
        title: '수의 순서와 크기 비교',
        body: '- $10$개씩 묶음의 수를 먼저 비교해요. $72 > 68$\n- 묶음의 수가 같으면 낱개의 수를 비교해요. $85 < 89$\n- $>$, $<$ 는 벌어진 쪽에 큰 수가 와요.',
      },
      {
        title: '짝수와 홀수',
        body: '둘씩 짝을 지을 때 남는 것이 없는 수를 **짝수**, 하나가 남는 수를 **홀수**라고 해요.\n- 짝수: $2, 4, 6, 8, 10, \\dots$ (낱개의 수가 $0, 2, 4, 6, 8$)\n- 홀수: $1, 3, 5, 7, 9, \\dots$ (낱개의 수가 $1, 3, 5, 7, 9$)',
      },
    ],
    skills: [
      {
        id: 'bundles',
        title: '묶음과 낱개',
        gen(r, level) {
          if (level === 3) {
            const t = r.int(5, 8);
            const o = r.int(11, 19);
            const n = t * 10 + o;
            return {
              q: `$10$개씩 묶음 $${t}$개와 낱개 $${o}$개는 모두 얼마인가요?`,
              answer: { type: 'num', value: n },
              steps: [`낱개 $${o}$개 = $10$개씩 묶음 $1$개와 낱개 $${o - 10}$개`, `$10$개씩 묶음 $${t + 1}$개와 낱개 $${o - 10}$개 → $${n}$`],
              hint: '낱개 10개는 묶음 1개로 바꿀 수 있어요.',
            };
          }
          const t = r.int(5, 9);
          const o = level === 1 ? 0 : r.int(1, 9);
          const n = t * 10 + o;
          if (level === 2 && r.chance(0.4)) {
            return {
              q: `$${n}$은 $10$개씩 묶음 몇 개와 낱개 몇 개인가요?`,
              answer: { type: 'fields', fields: [{ label: '10개씩 묶음', value: t, unit: '개' }, { label: '낱개', value: o, unit: '개' }] },
              steps: [`$${n}$의 앞의 숫자 $${t}$는 $10$개씩 묶음의 수, 뒤의 숫자 $${o}$는 낱개의 수예요.`],
            };
          }
          return {
            q: '구슬은 모두 몇 개인가요? (한 줄은 $10$개씩 묶음이에요.)',
            fig: bundles(t, o),
            answer: { type: 'num', value: n, unit: '개' },
            steps: [`$10$개씩 묶음 $${t}$개, 낱개 $${o}$개`, `$${n}$개`],
          };
        },
      },
      {
        id: 'read',
        title: '수 읽고 쓰기',
        gen(r, level) {
          const n = level === 1 ? r.int(6, 9) * 10 : r.int(51, 99);
          const nn = (x: number) => `${sino(x)}, ${native(x)}`;
          const wr = [n + 1, n - 1, n + 10, n - 10, (n % 10) * 10 + Math.floor(n / 10)].filter((x) => x > 50 && x < 100 && x !== n);
          if (level === 1) {
            const toWord = r.chance(0.5);
            const w10 = [60, 70, 80, 90].filter((x) => x !== n);
            if (toWord) return { q: `$${n}$을 바르게 읽은 것을 고르세요.`, answer: makeChoices(r, nn(n), w10.map(nn)), steps: [`$${n}$은 '${sino(n)}' 또는 '${native(n)}'이라고 읽어요.`] };
            const word = native(n);
            return { q: `'${word}'을 수로 나타내면 무엇인가요?`, answer: intChoices(r, n, w10, { min: 10, max: 100, step: 10 }), steps: [`'${word}'은 $10$개씩 묶음 $${n / 10}$개, $${n}$이에요.`] };
          }
          if (level === 2) {
            if (r.chance(0.5)) return { q: `$${n}$을 바르게 읽은 것을 고르세요.`, answer: makeChoices(r, nn(n), [...new Set(wr)].map(nn)), steps: [`$${n}$은 '${sino(n)}' 또는 '${native(n)}'이라고 읽어요.`] };
            const word = r.chance(0.5) ? sino(n) : native(n);
            return { q: `'${word}'을 수로 쓰세요.`, answer: { type: 'num', value: n }, steps: [`'${word}' → $${n}$`] };
          }
          let m = r.int(51, 99);
          if (m === n) m = n - 1;
          const same = [`$${n}$`, sino(n), native(n), `10개씩 묶음 ${Math.floor(n / 10)}개와 낱개 ${n % 10}개`];
          const odd = r.pick([sino(m), native(m)]);
          return {
            q: '나타내는 수가 **다른** 하나를 고르세요.',
            answer: makeChoices(r, odd, r.sample(same, 3)),
            steps: [`'${odd}'은 $${m}$이고, 나머지는 모두 $${n}$이에요.`],
          };
        },
      },
      {
        id: 'order',
        title: '수의 순서',
        gen(r, level) {
          if (level === 1) {
            const n = r.int(51, 98);
            const more = r.chance(0.5);
            return {
              q: `$${n}$보다 $1$만큼 더 ${more ? '큰' : '작은'} 수는 무엇인가요?`,
              answer: { type: 'num', value: more ? n + 1 : n - 1 },
              steps: [`$1$만큼 더 ${more ? '큰 수는 바로 뒤' : '작은 수는 바로 앞'}의 수예요.`, `$${more ? n + 1 : n - 1}$`],
            };
          }
          if (level === 2) {
            const st = r.int(55, 95);
            const up = r.chance(0.5);
            const seq = range(0, 4).map((i) => (up ? st + i : st - i)).filter((x) => x <= 100);
            while (seq.length < 5) seq.unshift(seq[0] - 1);
            const hole = r.int(1, 4);
            return {
              q: `수의 순서${up ? '대로' : '를 거꾸로 하여'} 썼어요. 빈칸에 알맞은 수를 쓰세요.\n$$${seq.map((x, i) => (i === hole ? '\\square' : x)).join(',\\ ')}$$`,
              answer: { type: 'num', value: seq[hole] },
              steps: [`$1$씩 ${up ? '커지는' : '작아지는'} 순서예요.`, `빈칸은 $${seq[hole]}$`],
            };
          }
          const kind = r.int(0, 1);
          if (kind === 0) {
            const a = r.int(55, 90);
            const b = r.int(a + 3, Math.min(100, a + 12));
            return {
              q: `$${a}$와 $${b}$ 사이에 있는 수는 모두 몇 개인가요?`,
              answer: { type: 'num', value: b - a - 1, unit: '개' },
              steps: [`$${a + 1}$부터 $${b - 1}$까지 세어요.`, `$${b - 1}-${a}=${b - a - 1}$ → $${b - a - 1}$개`],
              hint: '양 끝의 수는 세지 않아요.',
            };
          }
          const n = r.int(56, 99);
          return {
            q: `$${n}$보다 $1$만큼 더 큰 수와 $1$만큼 더 작은 수 사이에 있는 수는 무엇인가요?`,
            answer: { type: 'num', value: n },
            steps: [`$1$만큼 더 큰 수: $${n + 1}$, $1$만큼 더 작은 수: $${n - 1}$`, `그 사이의 수는 $${n}$`],
          };
        },
      },
      {
        id: 'compare',
        title: '수의 크기 비교',
        gen(r, level) {
          if (level === 3) {
            const t = r.int(5, 9);
            const d = r.int(2, 7);
            const big = r.chance(0.5);
            // t□ > td (□ 는 0~9)
            const ok = range(0, 9).filter((x) => (big ? x > d : x < d));
            return {
              q: `$0$부터 $9$까지의 숫자 중에서 $\\square$ 안에 들어갈 수 있는 숫자는 모두 몇 개인가요?\n$$${t}\\square ${big ? '>' : '<'} ${t}${d}$$`,
              answer: { type: 'num', value: ok.length, unit: '개' },
              steps: [`$10$개씩 묶음의 수가 $${t}$로 같으니 낱개의 수를 비교해요.`, `$\\square ${big ? '>' : '<'} ${d}$ 이어야 하므로 $${ok.join(', ')}$ → $${ok.length}$개`],
            };
          }
          const a = r.int(51, 99);
          let b = level === 1 ? r.int(51, 99) : Math.floor(a / 10) * 10 + r.int(0, 9);
          if (b === a) b = a === 99 ? 98 : a + 1;
          if (level === 1 && Math.floor(a / 10) === Math.floor(b / 10)) b = b >= 60 ? b - 10 : b + 10;
          const sign = a > b ? '>' : '<';
          return {
            q: `두 수의 크기를 비교하여 $\\bigcirc$ 안에 $>$, $<$ 를 알맞게 고르세요.\n$$${a}\\ \\bigcirc\\ ${b}$$`,
            answer: makeChoices(r, `$${sign}$`, [`$${sign === '>' ? '<' : '>'}$`]),
            steps: [
              Math.floor(a / 10) !== Math.floor(b / 10) ? `$10$개씩 묶음의 수를 비교해요: $${Math.floor(a / 10)}$와 $${Math.floor(b / 10)}$` : `묶음의 수가 같으니 낱개의 수를 비교해요: $${a % 10}$와 $${b % 10}$`,
              `$${a} ${sign} ${b}$`,
            ],
          };
        },
      },
      {
        id: 'even-odd',
        title: '짝수와 홀수',
        gen(r, level) {
          if (level === 1) {
            const n = r.int(3, 12);
            const even = n % 2 === 0;
            return {
              q: `동그라미를 둘씩 짝 지어 보세요. $${n}$은 짝수인가요, 홀수인가요?`,
              fig: dotGroups([{ n, perRow: 2 }], { r: 8 }),
              answer: makeChoices(r, even ? '짝수' : '홀수', [even ? '홀수' : '짝수']),
              steps: [`둘씩 짝 지으면 ${even ? '남는 것이 없어요' : '하나가 남아요'}.`, `그래서 $${n}$은 ${even ? '짝수' : '홀수'}예요.`],
            };
          }
          if (level === 2) {
            const even = r.chance(0.5);
            const pool = range(11, 99).filter((x) => (x % 2 === 0) === even);
            const other = range(11, 99).filter((x) => (x % 2 === 0) !== even);
            const ans = r.pick(pool);
            const wr = r.sample(other, 3);
            return {
              q: `다음 중 ${even ? '짝수' : '홀수'}를 고르세요.`,
              answer: makeChoices(r, `$${ans}$`, wr.map((w) => `$${w}$`)),
              steps: [`낱개의 수(일의 자리)를 보아요. ${even ? '짝수는 $0, 2, 4, 6, 8$' : '홀수는 $1, 3, 5, 7, 9$'}로 끝나요.`, `$${ans}$은 ${even ? '짝수' : '홀수'}예요.`],
            };
          }
          const t = r.int(1, 8) * 10;
          const even = r.chance(0.5);
          const nums = range(t + 1, t + 9).filter((x) => (x % 2 === 0) === even);
          return {
            q: `$${t}$과 $${t + 10}$ 사이에 있는 ${even ? '짝수' : '홀수'}는 모두 몇 개인가요?`,
            answer: { type: 'num', value: nums.length, unit: '개' },
            steps: [`$${t + 1}$부터 $${t + 9}$까지에서 ${even ? '짝수' : '홀수'}를 찾아요.`, `$${nums.join(', ')}$ → $${nums.length}$개`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 덧셈과 뺄셈(1)
  'e1b-2': {
    concepts: [
      {
        title: '(몇십몇)+(몇)',
        body: '낱개끼리 더하고, $10$개씩 묶음은 그대로 내려 써요.\n$$32+5=37$$\n- 세로로 쓸 때는 **같은 자리끼리** 줄을 맞추어요.',
      },
      {
        title: '(몇십)+(몇십), (몇십몇)+(몇십몇)',
        body: '- $30+40$: $10$개씩 묶음끼리 $3+4=7$ → $70$\n- $23+45$: 낱개끼리 $3+5=8$, 묶음끼리 $2+4=6$ → $68$',
        example: { q: '$41+36$', a: '낱개 $1+6=7$, 묶음 $4+3=7$ → $77$' },
      },
      {
        title: '(몇십몇)−(몇), (몇십몇)−(몇십몇)',
        body: '뺄셈도 낱개는 낱개끼리, 묶음은 묶음끼리 빼요.\n- $47-3=44$\n- $68-25$: 낱개 $8-5=3$, 묶음 $6-2=4$ → $43$',
      },
      {
        title: '덧셈과 뺄셈의 관계',
        body: '$34+21=55$ 이면 $55-21=34$, $55-34=21$ 이에요.\n- 뺄셈의 답이 맞는지 덧셈으로 확인할 수 있어요.',
      },
    ],
    skills: [
      {
        id: 'add',
        title: '덧셈하기',
        gen(r, level) {
          const [a, b] = noCarryAdd(r, level);
          if (level === 3) {
            const front = r.chance(0.5);
            return {
              q: `빈칸에 알맞은 수를 쓰세요.\n$$${front ? `\\square+${b}` : `${a}+\\square`}=${a + b}$$`,
              answer: { type: 'num', value: front ? a : b },
              steps: ['덧셈과 뺄셈의 관계를 이용해요.', `$${a + b}-${front ? b : a}=${front ? a : b}$`],
            };
          }
          return {
            q: `계산해 보세요.\n$$${a}+${b}=\\square$$`,
            fig: level === 1 ? baseTen(0, Math.floor(a / 10), a % 10) : undefined,
            answer: { type: 'num', value: a + b },
            steps: [`낱개끼리: $${a % 10}+${b % 10}=${(a % 10) + (b % 10)}$`, `묶음끼리: $${Math.floor(a / 10)}+${Math.floor(b / 10)}=${Math.floor(a / 10) + Math.floor(b / 10)}$`, `$${a}+${b}=${a + b}$`],
          };
        },
      },
      {
        id: 'sub',
        title: '뺄셈하기',
        gen(r, level) {
          const [a, b] = noBorrowSub(r, level);
          if (level === 3) {
            const kind = r.int(0, 1);
            return {
              q: `빈칸에 알맞은 수를 쓰세요.\n$$${kind === 0 ? `${a}-\\square` : `\\square-${b}`}=${a - b}$$`,
              answer: { type: 'num', value: kind === 0 ? b : a },
              steps: kind === 0 ? [`$${a}$에서 빈칸을 빼면 $${a - b}$`, `빈칸 $=${a}-${a - b}=${b}$`] : [`빈칸에서 $${b}$를 빼면 $${a - b}$`, `빈칸 $=${a - b}+${b}=${a}$`],
            };
          }
          return {
            q: `계산해 보세요.\n$$${a}-${b}=\\square$$`,
            answer: { type: 'num', value: a - b },
            steps: [`낱개끼리: $${a % 10}-${b % 10}=${(a % 10) - (b % 10)}$`, `묶음끼리: $${Math.floor(a / 10)}-${Math.floor(b / 10)}=${Math.floor(a / 10) - Math.floor(b / 10)}$`, `$${a}-${b}=${a - b}$`],
          };
        },
      },
      {
        id: 'vertical',
        title: '세로셈',
        gen(r, level) {
          const plus = r.chance(0.5);
          if (level === 3) {
            const [a, b] = plus ? noCarryAdd(r, 3) : noBorrowSub(r, 3);
            const c = plus ? a + b : a - b;
            const a1 = Math.floor(a / 10);
            const b0 = b % 10;
            const top = `${a1}\\boxed{\\text{가}}`;
            const mid = `\\boxed{\\text{나}}${b0}`;
            return {
              q: `세로셈에서 가, 나에 알맞은 숫자를 쓰세요.\n$$\\begin{array}{r} ${top} \\\\ ${plus ? '+' : '-'}\\;\\; ${mid} \\\\ \\hline ${c} \\end{array}$$`,
              answer: { type: 'fields', fields: [{ label: '가', value: a % 10 }, { label: '나', value: Math.floor(b / 10) }] },
              steps: plus
                ? [`낱개: 가 $+${b0}=${c % 10}$ → 가 $=${a % 10}$`, `묶음: $${a1}+$ 나 $=${Math.floor(c / 10)}$ → 나 $=${Math.floor(b / 10)}$`]
                : [`낱개: 가 $-${b0}=${c % 10}$ → 가 $=${a % 10}$`, `묶음: $${a1}-$ 나 $=${Math.floor(c / 10)}$ → 나 $=${Math.floor(b / 10)}$`],
            };
          }
          const [a, b] = plus ? noCarryAdd(r, level) : noBorrowSub(r, level);
          const c = plus ? a + b : a - b;
          return {
            q: `계산해 보세요.\n$$${vert(a, b, plus ? '+' : '-')}$$`,
            answer: { type: 'num', value: c },
            steps: [`낱개 자리부터 계산해요: $${a % 10}${plus ? '+' : '-'}${b % 10}=${c % 10}$`, `묶음 자리: $${Math.floor(a / 10)}${plus ? '+' : '-'}${Math.floor(b / 10)}=${Math.floor(c / 10)}$`, `답: $${c}$`],
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
            const [a, b] = noCarryAdd(r, 1);
            return {
              q: `${p1}는 ${thing} $${a}$${u}를 가지고 있어요. ${p2}에게 $${b}$${u}를 더 받았어요. ${p1}가 가진 ${thing}는 모두 몇 ${u}인가요?`,
              answer: { type: 'num', value: a + b, unit: u },
              steps: ['더 받았으니 덧셈을 해요.', `$${a}+${b}=${a + b}$ (${u})`],
            };
          }
          if (level === 2) {
            const [a, b] = noBorrowSub(r, 2);
            if (r.chance(0.5))
              return {
                q: `${p1}는 ${thing} $${a}$${u}, ${p2}는 $${b}$${u}를 가지고 있어요. ${p1}는 ${p2}보다 몇 ${u} 더 많이 가지고 있나요?`,
                answer: { type: 'num', value: a - b, unit: u },
                steps: ['몇 개 더 많은지 구하니까 뺄셈을 해요.', `$${a}-${b}=${a - b}$ (${u})`],
              };
            return {
              q: `가게에 ${thing} $${a}$${u}가 있었어요. 오늘 $${b}$${u}를 팔았어요. 남은 ${thing}는 몇 ${u}인가요?`,
              answer: { type: 'num', value: a - b, unit: u },
              steps: ['남은 것을 구하니까 뺄셈을 해요.', `$${a}-${b}=${a - b}$ (${u})`],
            };
          }
          // 두 번 계산
          const [a, b] = noCarryAdd(r, 2);
          const s = a + b;
          const c = r.int(1, Math.floor(s / 10)) * 10 + r.int(0, s % 10);
          return {
            q: `${p1}는 ${thing} $${a}$${u}를 가지고 있었는데 $${b}$${u}를 더 샀어요. 그중에서 $${c}$${u}를 ${p2}에게 주었어요. ${p1}에게 남은 ${thing}는 몇 ${u}인가요?`,
            answer: { type: 'num', value: s - c, unit: u },
            steps: [`산 것을 더해요: $${a}+${b}=${s}$`, `준 것을 빼요: $${s}-${c}=${s - c}$ (${u})`],
          };
        },
      },
      {
        id: 'compare-calc',
        title: '계산 결과 비교',
        gen(r, level) {
          const mk = (): { t: string; v: number } => {
            if (r.chance(0.5)) {
              const [a, b] = noCarryAdd(r, level === 1 ? 1 : 2);
              return { t: `${a}+${b}`, v: a + b };
            }
            const [a, b] = noBorrowSub(r, level === 1 ? 1 : 2);
            return { t: `${a}-${b}`, v: a - b };
          };
          if (level < 3) {
            let x = mk();
            let y = mk();
            if (level === 2 && r.chance(0.3)) {
              // 같은 값 만들기
              const [a, b] = noBorrowSub(r, 2);
              y = { t: `${a}-${b}`, v: a - b };
              const p = r.int(0, y.v);
              x = { t: `${p}+${y.v - p}`, v: y.v };
              if (p % 10 + ((y.v - p) % 10) > 9) x = { t: `${y.v}+0`, v: y.v };
            }
            const sign = x.v > y.v ? '>' : x.v < y.v ? '<' : '=';
            return {
              q: `계산 결과를 비교하여 $\\bigcirc$ 안에 $>$, $=$, $<$ 중 알맞은 것을 고르세요.\n$$${x.t}\\ \\bigcirc\\ ${y.t}$$`,
              answer: makeChoices(r, `$${sign}$`, ['$>$', '$=$', '$<$'].filter((z) => z !== `$${sign}$`)),
              steps: [`$${x.t}=${x.v}$, $${y.t}=${y.v}$`, `$${x.v} ${sign} ${y.v}$`],
            };
          }
          let es: { t: string; v: number }[] = [];
          for (let g = 0; g < 50; g++) {
            es = [mk(), mk(), mk(), mk()];
            const vs = es.map((e) => e.v);
            if (new Set(vs).size === 4 && new Set(es.map((e) => e.t)).size === 4) break;
          }
          const big = r.chance(0.5);
          const best = es.reduce((p, q) => ((big ? q.v > p.v : q.v < p.v) ? q : p));
          return {
            q: `계산 결과가 가장 ${big ? '큰' : '작은'} 것을 고르세요.`,
            answer: makeChoices(r, `$${best.t}$`, es.filter((e) => e !== best).map((e) => `$${e.t}$`)),
            steps: [es.map((e) => `$${e.t}=${e.v}$`).join(', '), `가장 ${big ? '큰' : '작은'} 것은 $${best.t}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 모양과 시각
  'e1b-3': {
    concepts: [
      {
        title: '■, ▲, ● 모양',
        body: '물건의 본을 뜨면 여러 가지 모양이 나와요.\n- **■ 모양**: 뾰족한 곳이 $4$군데, 곧은 선이 있어요. (공책, 액자)\n- **▲ 모양**: 뾰족한 곳이 $3$군데, 곧은 선이 있어요. (삼각김밥, 트라이앵글)\n- **● 모양**: 뾰족한 곳이 없고 둥글어요. (동전, 시계)',
      },
      {
        title: '모양으로 꾸미기',
        body: '■, ▲, ● 모양을 이용해 집, 로봇, 꽃 등을 꾸밀 수 있어요.\n- 사용한 모양을 셀 때는 하나씩 표시하며 빠짐없이 세어요.',
      },
      {
        title: '몇 시',
        body: '시계의 **긴바늘이 12**를 가리키면 "몇 시"예요.\n- 짧은바늘이 가리키는 숫자가 "몇"이에요.\n- 짧은바늘이 $3$, 긴바늘이 $12$ → **3시**',
      },
      {
        title: '몇 시 30분',
        body: '시계의 **긴바늘이 6**을 가리키면 "몇 시 30분"이에요.\n- 이때 짧은바늘은 두 숫자의 **가운데**에 있어요. 지나온 숫자를 읽어요.\n- 짧은바늘이 $4$와 $5$ 사이, 긴바늘이 $6$ → **4시 30분**',
        example: { q: '짧은바늘이 7과 8 사이, 긴바늘이 6이면?', a: '7시 30분' },
      },
    ],
    skills: [
      {
        id: 'name-flat',
        title: '어떤 모양일까요?',
        gen(r, level) {
          if (level === 3) {
            const objs: [string, Flat][] = [
              ['동전', 'cir'],
              ['시계', 'cir'],
              ['접시', 'cir'],
              ['공책', 'sq'],
              ['액자', 'sq'],
              ['칠판', 'sq'],
              ['삼각김밥', 'tri'],
              ['트라이앵글', 'tri'],
              ['삼각자', 'tri'],
              ['교통 표지판(양보)', 'tri'],
              ['손수건', 'sq'],
              ['단추', 'cir'],
            ];
            const k = r.pick(FLATS);
            const ans = r.pick(objs.filter((o) => o[1] === k))[0];
            const wr = r.sample(objs.filter((o) => o[1] !== k), 3).map((o) => o[0]);
            return {
              q: `종이에 대고 본을 뜨면 ${FLAT_NAME[k]}이 나오는 물건을 고르세요.`,
              answer: makeChoices(r, ans, wr),
              steps: [`${ans}의 본을 뜨면 ${FLAT_NAME[k]}이에요.`, ...wr.map((w) => `${w} → ${FLAT_NAME[objs.find((o) => o[0] === w)![1]]}`)],
            };
          }
          const k = r.pick(FLATS);
          const v = level === 1 ? 0 : r.int(1, 3);
          return {
            q: '그림은 어떤 모양인가요?',
            fig: flatsRow([{ kind: k, v }], { z: lv(level, 70, r.pick([50, 60, 70]), 60) }),
            answer: makeChoices(r, FLAT_NAME[k], FLATS.filter((x) => x !== k).map((x) => FLAT_NAME[x])),
            steps: [k === 'cir' ? '뾰족한 곳이 없고 둥글어요.' : `뾰족한 곳이 $${CORNERS[k]}$군데이고 곧은 선이 있어요.`, `${FLAT_NAME[k]}이에요.`],
          };
        },
      },
      {
        id: 'count-flat',
        title: '모양 세기',
        gen(r, level) {
          const n = lv(level, 6, 8, 10);
          const items = Array.from({ length: n }, () => ({ kind: r.pick(FLATS), v: r.int(0, 3) }));
          ensureEach(items, FLATS); // 각 모양 최소 1개
          const cnt = (k: Flat) => items.filter((x) => x.kind === k).length;
          if (level < 3) {
            const k = r.pick(FLATS);
            return {
              q: `${FLAT_NAME[k]}은 모두 몇 개인가요?`,
              fig: flatsRow(items, { z: 40, perRow: 5 }),
              answer: { type: 'num', value: cnt(k), unit: '개' },
              steps: [`${FLAT_NAME[k]}에 표시하며 세어요. 돌려 놓거나 크기가 달라도 같은 모양이에요.`, `$${cnt(k)}$개`],
            };
          }
          const counts = FLATS.map(cnt);
          const max = Math.max(...counts);
          if (counts.filter((c) => c === max).length > 1) {
            const bi = counts.indexOf(max);
            const j = items.findIndex((x) => x.kind !== FLATS[bi]);
            items[j].kind = FLATS[bi];
          }
          const c2 = FLATS.map(cnt);
          const best = FLATS[c2.indexOf(Math.max(...c2))];
          return {
            q: '가장 많은 모양은 무엇인가요?',
            fig: flatsRow(items, { z: 40, perRow: 5 }),
            answer: makeChoices(r, FLAT_NAME[best], FLATS.filter((x) => x !== best).map((x) => FLAT_NAME[x])),
            steps: [FLATS.map((k) => `${FLAT_NAME[k]} $${cnt(k)}$개`).join(', '), `가장 많은 것은 ${FLAT_NAME[best]}이에요.`],
          };
        },
      },
      {
        id: 'corner',
        title: '모양의 특징',
        gen(r, level) {
          if (level === 1) {
            const qs: [string, Flat][] = [
              ['뾰족한 곳이 $3$군데인 모양', 'tri'],
              ['뾰족한 곳이 $4$군데인 모양', 'sq'],
              ['뾰족한 곳이 없는 모양', 'cir'],
              ['곧은 선이 없는 모양', 'cir'],
            ];
            const [d, k] = r.pick(qs);
            return {
              q: `${d}은 어느 것인가요?`,
              answer: makeChoices(r, FLAT_NAME[k], FLATS.filter((x) => x !== k).map((x) => FLAT_NAME[x])),
              steps: ['■: 뾰족한 곳 $4$군데, ▲: $3$군데, ●: 없음', `답: ${FLAT_NAME[k]}`],
            };
          }
          if (level === 2) {
            const k = r.pick(['sq', 'tri'] as Flat[]);
            const n = r.int(2, 5);
            return {
              q: `${FLAT_NAME[k]} $${n}$개의 뾰족한 곳은 모두 몇 군데인가요?`,
              fig: flatsRow(Array.from({ length: n }, () => ({ kind: k, v: r.int(0, 3) })), { z: 40 }),
              answer: { type: 'num', value: n * CORNERS[k], unit: '군데' },
              steps: [`${FLAT_NAME[k]} 하나에 뾰족한 곳이 $${CORNERS[k]}$군데 있어요.`, `$${range(1, n).map(() => CORNERS[k]).join('+')}=${n * CORNERS[k]}$ (군데)`],
            };
          }
          const a = r.int(1, 3);
          const b = r.int(1, 3);
          const c = r.int(1, 3);
          const items = r.shuffle([...Array(a).fill('sq'), ...Array(b).fill('tri'), ...Array(c).fill('cir')] as Flat[]).map((k) => ({ kind: k, v: r.int(0, 3) }));
          const tot = 4 * a + 3 * b;
          return {
            q: '그림에 있는 모양들의 뾰족한 곳은 모두 몇 군데인가요?',
            fig: flatsRow(items, { z: 40, perRow: 5 }),
            answer: { type: 'num', value: tot, unit: '군데' },
            steps: [`■ $${a}$개: $${4 * a}$군데, ▲ $${b}$개: $${3 * b}$군데, ● $${c}$개: $0$군데`, `$${4 * a}+${3 * b}=${tot}$ (군데)`],
            hint: '● 모양은 뾰족한 곳이 없어요.',
          };
        },
      },
      {
        id: 'read-clock',
        title: '시각 읽기',
        gen(r, level) {
          const h = r.int(1, 12);
          if (level === 1) {
            return {
              q: '시계가 나타내는 시각은 몇 시인가요?',
              fig: clock(h, 0),
              answer: { type: 'num', value: h, unit: '시' },
              steps: ['긴바늘이 $12$를 가리키니 "몇 시"예요.', `짧은바늘이 $${h}$를 가리키니 $${h}$시예요.`],
            };
          }
          if (level === 2) {
            const half = r.chance(0.7);
            return {
              q: '시계가 나타내는 시각을 쓰세요.',
              fig: clock(h, half ? 30 : 0),
              answer: { type: 'fields', fields: [{ label: '시', value: h }, { label: '분', value: half ? 30 : 0 }] },
              steps: half ? ['긴바늘이 $6$을 가리키니 "몇 시 30분"이에요.', `짧은바늘이 $${h}$와 $${(h % 12) + 1}$ 사이에 있으니 $${h}$시 $30$분이에요.`] : ['긴바늘이 $12$ → 몇 시', `$${h}$시 $0$분 ($${h}$시)`],
              hint: '짧은바늘이 두 숫자 사이에 있으면 지나온 숫자를 읽어요.',
            };
          }
          const nx = (h % 12) + 1;
          const right = `${h}시 30분`;
          return {
            q: `짧은바늘이 $${h}$와 $${nx}$의 가운데, 긴바늘이 $6$을 가리키는 시각은 몇 시 몇 분인가요?`,
            answer: makeChoices(r, right, [`${nx}시 30분`, `${h}시 6분`, `6시 ${h}분`, `${nx}시`]),
            steps: ['긴바늘이 $6$을 가리키면 $30$분이에요.', `짧은바늘은 지나온 숫자 $${h}$를 읽어요 → ${right}`],
          };
        },
      },
      {
        id: 'clock-hands',
        title: '시계 바늘 알기',
        gen(r, level) {
          const h = r.int(1, 12);
          if (level === 1) {
            const half = r.chance(0.5);
            return {
              q: `$${h}$시${half ? ' $30$분' : ''}일 때 시계의 긴바늘은 어떤 숫자를 가리키나요?`,
              answer: { type: 'num', value: half ? 6 : 12 },
              steps: [half ? '몇 시 30분에는 긴바늘이 $6$을 가리켜요.' : '몇 시에는 긴바늘이 $12$를 가리켜요.', `답: $${half ? 6 : 12}$`],
            };
          }
          if (level === 2) {
            return {
              q: `$${h}$시일 때 시계의 짧은바늘은 어떤 숫자를 가리키나요?`,
              answer: { type: 'num', value: h },
              steps: ['몇 시에는 짧은바늘이 그 숫자를 가리켜요.', `$${h}$시 → $${h}$`],
            };
          }
          const nx = (h % 12) + 1;
          const pairs = (x: number) => `$${x}$와 $${(x % 12) + 1}$ 사이`;
          const wr = [pairs(nx), pairs(h === 1 ? 12 : h - 1), `$${h}$`, `$6$`].filter((w) => w !== pairs(h));
          return {
            q: `$${h}$시 $30$분일 때 짧은바늘은 어디를 가리키나요?`,
            answer: makeChoices(r, pairs(h), wr),
            steps: [`$${h}$시에 $${h}$를 가리키던 짧은바늘이 $30$분 동안 조금 움직여요.`, `$${h}$와 $${nx}$의 가운데를 가리켜요.`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 덧셈과 뺄셈(2)
  'e1b-4': {
    concepts: [
      {
        title: '세 수의 덧셈',
        body: '앞에서부터 차례로 두 수씩 계산해요.\n$$2+3+4 = 5+4 = 9$$',
      },
      {
        title: '세 수의 뺄셈',
        body: '뺄셈은 꼭 **앞에서부터** 차례로 계산해요.\n$$9-3-2 = 6-2 = 4$$',
      },
      {
        title: '10이 되는 더하기',
        body: '더해서 $10$이 되는 두 수: $1+9$, $2+8$, $3+7$, $4+6$, $5+5$\n- $10$칸 상자에서 빈칸을 세면 쉽게 알 수 있어요.',
        example: { q: '$7+\\square=10$', a: '$3$' },
      },
      {
        title: '10에서 빼기',
        body: '$10-3=7$, $10-6=4$ 처럼 $10$에서 빼는 것은 "10이 되는 더하기"를 거꾸로 생각해요.',
      },
      {
        title: '10을 만들어 더하기',
        body: '세 수 중 더해서 $10$이 되는 두 수를 먼저 더하면 쉬워요.\n$$6+4+5 = 10+5 = 15$$\n$$3+8+2 = 3+10 = 13$$',
      },
    ],
    skills: [
      {
        id: 'three',
        title: '세 수의 계산',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(1, 5);
            const b = r.int(1, 8 - a);
            const c = r.int(1, 9 - a - b);
            return {
              q: `계산해 보세요.\n$$${a}+${b}+${c}=\\square$$`,
              answer: { type: 'num', value: a + b + c },
              steps: [`앞의 두 수부터: $${a}+${b}=${a + b}$`, `$${a + b}+${c}=${a + b + c}$`],
            };
          }
          if (level === 2) {
            const a = r.int(5, 9);
            const b = r.int(1, a - 2);
            const c = r.int(1, a - b);
            return {
              q: `계산해 보세요.\n$$${a}-${b}-${c}=\\square$$`,
              answer: { type: 'num', value: a - b - c },
              steps: [`앞에서부터: $${a}-${b}=${a - b}$`, `$${a - b}-${c}=${a - b - c}$`],
            };
          }
          const a = r.int(2, 8);
          const b = r.int(1, 9 - a);
          const c = r.int(1, a + b);
          const plusFirst = r.chance(0.5);
          if (plusFirst)
            return {
              q: `계산해 보세요.\n$$${a}+${b}-${c}=\\square$$`,
              answer: { type: 'num', value: a + b - c },
              steps: [`앞에서부터: $${a}+${b}=${a + b}$`, `$${a + b}-${c}=${a + b - c}$`],
            };
          const x = a + b;
          const y = r.int(1, x - 1);
          const z = r.int(1, 9 - (x - y));
          return {
            q: `계산해 보세요.\n$$${x}-${y}+${z}=\\square$$`,
            answer: { type: 'num', value: x - y + z },
            steps: [`앞에서부터: $${x}-${y}=${x - y}$`, `$${x - y}+${z}=${x - y + z}$`],
          };
        },
      },
      {
        id: 'make-ten',
        title: '10이 되는 더하기',
        gen(r, level) {
          const a = r.int(1, 9);
          if (level === 1) {
            return {
              q: `빈칸에 알맞은 수를 쓰세요.\n$$${a}+\\square=10$$`,
              fig: tenFrames(a, { frames: 1 }),
              answer: { type: 'num', value: 10 - a },
              steps: ['$10$칸 상자의 빈칸을 세어요.', `빈칸 $${10 - a}$칸 → $${a}+${10 - a}=10$`],
            };
          }
          if (level === 2) {
            return {
              q: `빈칸에 알맞은 수를 쓰세요.\n$$\\square+${a}=10$$`,
              answer: intChoices(r, 10 - a, [a, 11 - a, 9 - a], { min: 1, max: 10 }),
              steps: [`$${a}$와 더해서 $10$이 되는 수를 찾아요.`, `$${10 - a}+${a}=10$`],
            };
          }
          const pairs = range(1, 9).map((x) => `$${x}$와 $${10 - x}$`);
          const right = r.pick(pairs);
          const wrongs = r.sample(range(1, 8), 3).map((x) => {
            const y = 10 - x + r.pick([1, -1]);
            return `$${x}$와 $${y}$`;
          });
          return {
            q: '두 수를 더해서 $10$이 되는 것을 고르세요.',
            answer: makeChoices(r, right, wrongs, 4),
            steps: ['$1+9$, $2+8$, $3+7$, $4+6$, $5+5$ 가 $10$이 돼요.', `답: ${right}`],
          };
        },
      },
      {
        id: 'ten-minus',
        title: '10에서 빼기',
        gen(r, level) {
          const a = r.int(1, 9);
          if (level === 1) {
            return {
              q: `계산해 보세요.\n$$10-${a}=\\square$$`,
              fig: dotGroups([{ n: 10, crossed: a, perRow: 5 }]),
              answer: { type: 'num', value: 10 - a },
              steps: [`$10$개 중 $${a}$개를 지우면 $${10 - a}$개가 남아요.`, `$10-${a}=${10 - a}$`],
            };
          }
          if (level === 2) {
            return {
              q: `빈칸에 알맞은 수를 쓰세요.\n$$10-\\square=${a}$$`,
              answer: { type: 'num', value: 10 - a },
              steps: [`$10$은 $${a}$와 $${10 - a}$로 가를 수 있어요.`, `$10-${10 - a}=${a}$`],
            };
          }
          const [p] = names(r, 1);
          const [thing, u] = r.pick(THINGS);
          const b = r.int(1, 9 - a);
          return {
            q: `${p}는 ${thing} $10$${u} 중에서 동생에게 $${a}$${u}, 친구에게 $${b}$${u}를 주었어요. 남은 ${thing}는 몇 ${u}인가요?`,
            answer: { type: 'num', value: 10 - a - b, unit: u },
            steps: [`$10-${a}=${10 - a}$`, `$${10 - a}-${b}=${10 - a - b}$ (${u})`],
          };
        },
      },
      {
        id: 'make-ten-add',
        title: '10을 만들어 더하기',
        gen(r, level) {
          const x = r.int(1, 9);
          const y = 10 - x;
          const c = r.int(1, 9);
          let terms: number[];
          let pairIdx: [number, number];
          if (level === 1) {
            terms = [x, y, c];
            pairIdx = [0, 1];
          } else if (level === 2) {
            terms = [c, x, y];
            pairIdx = [1, 2];
          } else {
            terms = [x, c, y];
            pairIdx = [0, 2];
          }
          const ans = 10 + c;
          return {
            q: `계산해 보세요.\n$$${terms.join('+')}=\\square$$`,
            answer: { type: 'num', value: ans },
            steps: [
              `더해서 $10$이 되는 두 수 $${terms[pairIdx[0]]}$과 $${terms[pairIdx[1]]}$를 먼저 더해요.`,
              `$${terms[pairIdx[0]]}+${terms[pairIdx[1]]}=10$`,
              `$10+${c}=${ans}$`,
            ],
            hint: level === 3 ? '떨어져 있어도 더해서 10이 되는 두 수를 찾아보세요.' : undefined,
          };
        },
      },
      {
        id: 'word',
        title: '이야기 문제',
        gen(r, level) {
          const [p1, p2, p3] = names(r, 3);
          const [thing, u] = r.pick(THINGS);
          if (level === 1) {
            const a = r.int(1, 5);
            const b = r.int(1, 8 - a);
            const c = r.int(1, 9 - a - b);
            return {
              q: `${p1}는 ${thing} $${a}$${u}, ${p2}는 $${b}$${u}, ${p3}는 $${c}$${u}를 가지고 있어요. 세 사람이 가진 ${thing}는 모두 몇 ${u}인가요?`,
              answer: { type: 'num', value: a + b + c, unit: u },
              steps: [`$${a}+${b}+${c}$`, `$=${a + b}+${c}=${a + b + c}$ (${u})`],
            };
          }
          if (level === 2) {
            const a = r.int(6, 9);
            const b = r.int(1, a - 2);
            const c = r.int(1, a - b - 1);
            return {
              q: `버스에 $${a}$명이 타고 있었어요. 첫 번째 정류장에서 $${b}$명이 내리고, 두 번째 정류장에서 $${c}$명이 내렸어요. 버스에 남은 사람은 몇 명인가요?`,
              answer: { type: 'num', value: a - b - c, unit: '명' },
              steps: [`$${a}-${b}=${a - b}$`, `$${a - b}-${c}=${a - b - c}$ (명)`],
            };
          }
          const x = r.int(1, 9);
          const c = r.int(1, 9);
          return {
            q: `${p1}는 ${thing}를 첫째 날 $${x}$${u}, 둘째 날 $${c}$${u}, 셋째 날 $${10 - x}$${u} 모았어요. 모두 몇 ${u}를 모았나요?`,
            answer: { type: 'num', value: 10 + c, unit: u },
            steps: [`더해서 $10$이 되는 $${x}$와 $${10 - x}$를 먼저 더해요: $${x}+${10 - x}=10$`, `$10+${c}=${10 + c}$ (${u})`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 규칙 찾기
  'e1b-5': {
    concepts: [
      {
        title: '규칙 찾기',
        body: '되풀이되는 부분을 찾으면 규칙이 보여요.\n- ■ ▲ ■ ▲ ■ ▲ → ■, ▲ 가 **반복**돼요.\n- 반복되는 묶음에 선을 그어 보면 쉬워요.',
      },
      {
        title: '규칙에 따라 이어 가기',
        body: '찾은 규칙대로 다음에 올 것을 정해요.\n- ● ● ▲ ● ● ▲ 다음에는 ● 가 와요.\n- 규칙은 모양뿐 아니라 색, 크기, 방향, 소리, 몸동작으로도 만들 수 있어요.',
      },
      {
        title: '수 배열의 규칙',
        body: '수가 몇씩 커지거나 작아지는지 살펴요.\n- $2, 4, 6, 8$ → $2$씩 커져요.\n- $50, 40, 30$ → $10$씩 작아져요.',
      },
      {
        title: '수 배열표의 규칙',
        body: '$1$부터 $100$까지의 수 배열표에서\n- **오른쪽**으로 한 칸 가면 $1$씩 커져요.\n- **아래쪽**으로 한 칸 가면 $10$씩 커져요.',
      },
      {
        title: '규칙을 여러 가지로 나타내기',
        body: '■ ▲ ▲ ■ ▲ ▲ 를 ■는 $1$, ▲는 $2$로 바꾸면 $1, 2, 2, 1, 2, 2$ 처럼 수로도 나타낼 수 있어요.',
      },
    ],
    skills: [
      {
        id: 'shape-next',
        title: '다음에 올 모양',
        gen(r, level) {
          const unitLen = lv(level, 2, 3, r.pick([3, 4]));
          let unit: Flat[];
          do unit = Array.from({ length: unitLen }, () => r.pick(FLATS));
          while (new Set(unit).size < 2 || (unitLen === 4 && unit[0] === unit[2] && unit[1] === unit[3]));
          const shown = level === 3 ? unitLen * 2 + r.int(1, unitLen - 1) : unitLen * 2 + r.int(0, unitLen - 1);
          const seq = range(0, shown).map((i) => unit[i % unitLen]);
          const ans = seq[shown];
          const items = [...seq.slice(0, shown), null];
          return {
            q: '규칙에 따라 ? 에 알맞은 모양을 고르세요.',
            fig: patternRow(items, { perRow: 12 }),
            answer: makeChoices(r, FLAT_NAME[ans], FLATS.filter((x) => x !== ans).map((x) => FLAT_NAME[x])),
            steps: [`${unit.map((k) => FLAT_NAME[k].replace(' 모양', '')).join(' ')} 순서로 반복돼요.`, `? 에는 ${FLAT_NAME[ans]}이 와요.`],
          };
        },
      },
      {
        id: 'word-pattern',
        title: '반복되는 규칙',
        gen(r, level) {
          const pool = ['사과', '배', '포도', '딸기', '귤', '감'];
          const unitLen = level === 1 ? 2 : 3;
          const [A, B, C] = r.sample(pool, 3);
          const unit: string[] = level === 1 ? [A, B] : r.pick([[A, B, C], [A, A, B], [A, B, B]]);
          if (level < 3) {
            const shown = unitLen * 2 + r.int(0, unitLen - 1);
            const seq = range(0, shown).map((i) => unit[i % unitLen]);
            const ans = seq[shown];
            return {
              q: `과일을 규칙에 따라 늘어놓았어요. 다음에 올 과일은 무엇인가요?\n${seq.slice(0, shown).join(', ')}, $\\square$`,
              answer: makeChoices(r, ans, [...new Set([...unit, r.pick(pool.filter((p) => !unit.includes(p)))])].filter((x) => x !== ans)),
              steps: [`'${unit.join(', ')}'가 반복돼요.`, `다음에는 ${ans}가 와요.`],
            };
          }
          const pos = r.int(10, 16);
          const ans = unit[(pos - 1) % unitLen];
          return {
            q: `과일을 규칙에 따라 늘어놓았어요. ${pos}째에 놓일 과일은 무엇인가요?\n${range(0, unitLen * 2 - 1).map((i) => unit[i % unitLen]).join(', ')}, …`,
            answer: makeChoices(r, ans, [...new Set(unit)].filter((x) => x !== ans).concat(r.pick(pool.filter((p) => !unit.includes(p))))),
            steps: [`'${unit.join(', ')}'가 반복돼요. (한 묶음에 $${unitLen}$개)`, `$${unitLen}$개씩 묶어 세면 ${pos}째는 묶음 안에서 ${(pos - 1) % unitLen + 1}째예요.`, `답: ${ans}`],
            hint: '반복되는 묶음에 선을 그으며 세어 보세요.',
          };
        },
      },
      {
        id: 'number-pattern',
        title: '수 배열의 규칙',
        gen(r, level) {
          if (level === 1) {
            const step = r.int(1, 3);
            const st = r.int(1, 20);
            const seq = range(0, 4).map((i) => st + i * step);
            return {
              q: `규칙에 따라 빈칸에 알맞은 수를 쓰세요.\n$$${seq.slice(0, 4).join(',\\ ')},\\ \\square$$`,
              answer: { type: 'num', value: seq[4] },
              steps: [`$${step}$씩 커지는 규칙이에요.`, `$${seq[3]}+${step}=${seq[4]}$`],
            };
          }
          if (level === 2) {
            const step = r.pick([2, 5, 10]);
            const down = r.chance(0.5);
            const st = down ? r.int(6 * step, Math.min(100, 6 * step + 30)) : r.int(1, 40);
            const seq = range(0, 5).map((i) => st + (down ? -1 : 1) * i * step);
            const hole = r.int(1, 5);
            return {
              q: `규칙에 따라 빈칸에 알맞은 수를 쓰세요.\n$$${seq.map((x, i) => (i === hole ? '\\square' : x)).join(',\\ ')}$$`,
              answer: { type: 'num', value: seq[hole] },
              steps: [`$${step}$씩 ${down ? '작아지는' : '커지는'} 규칙이에요.`, `빈칸은 $${seq[hole]}$`],
            };
          }
          if (r.chance(0.5)) {
            const [a, b] = r.sample(range(1, 9), 2);
            const unit = r.chance(0.5) ? [a, b] : [a, b, b];
            const seq = range(0, unit.length * 3 - 1).map((i) => unit[i % unit.length]);
            const pos = r.int(10, 15);
            return {
              q: `규칙에 따라 수를 늘어놓았어요. ${pos}째 수는 무엇인가요?\n$$${seq.join(',\\ ')},\\ \\dots$$`,
              answer: { type: 'num', value: unit[(pos - 1) % unit.length] },
              steps: [`$${unit.join(', ')}$가 반복돼요.`, `${pos}째는 반복 묶음 안에서 ${(pos - 1) % unit.length + 1}째 → $${unit[(pos - 1) % unit.length]}$`],
            };
          }
          const step = r.int(2, 5);
          const st = r.int(1, 15);
          const seq = range(0, 5).map((i) => st + i * step);
          return {
            q: `규칙에 따라 빈칸 가, 나에 알맞은 수를 쓰세요.\n$$${seq[0]},\ ${seq[1]},\ \\boxed{\\text{가}},\ ${seq[3]},\ \\boxed{\\text{나}}$$`,
            answer: { type: 'fields', fields: [{ label: '가', value: seq[2] }, { label: '나', value: seq[4] }] },
            steps: [`$${seq[1]}-${seq[0]}=${step}$ 이므로 $${step}$씩 커져요.`, `가 $=${seq[1]}+${step}=${seq[2]}$, 나 $=${seq[3]}+${step}=${seq[4]}$`],
          };
        },
      },
      {
        id: 'hundred-chart',
        title: '수 배열표',
        gen(r, level) {
          // 1~100 배열표의 일부 (4행 × 5열)
          const r0 = r.int(0, 6);
          const c0 = r.int(0, 5);
          const val = (i: number, j: number) => (r0 + i) * 10 + (c0 + j) + 1;
          const si = r.int(level === 1 ? 0 : 1, 3);
          const sj = r.int(1, 4);
          const table: string[][] = [];
          const hide = new Set<string>();
          hide.add(`${si},${sj}`);
          if (level === 3) {
            hide.add(`${si - 1},${sj}`);
            hide.add(`${si},${sj - 1}`);
          }
          for (let i = 0; i < 4; i++) {
            const row: string[] = [];
            for (let j = 0; j < 5; j++) row.push(i === si && j === sj ? '$\\bigstar$' : hide.has(`${i},${j}`) ? '' : `$${val(i, j)}$`);
            table.push(row);
          }
          const ans = val(si, sj);
          return {
            q: '수 배열표의 일부분이에요. ★에 알맞은 수를 쓰세요.',
            table,
            answer: { type: 'num', value: ans },
            steps:
              level === 1
                ? ['오른쪽으로 한 칸 가면 $1$씩 커져요.', `★ 왼쪽의 수 $${val(si, sj - 1)}$보다 $1$ 큰 수 → $${ans}$`]
                : level === 2
                  ? ['아래쪽으로 한 칸 가면 $10$씩 커져요.', `★ 위의 수 $${val(si - 1, sj)}$보다 $10$ 큰 수 → $${ans}$`]
                  : ['오른쪽으로 $1$씩, 아래쪽으로 $10$씩 커져요.', `★ 왼쪽 위 대각선의 수 $${val(si - 1, sj - 1)}$에서 $1$ 더하고 $10$ 더하면 $${ans}$`],
          };
        },
      },
      {
        id: 'repeat-count',
        title: '규칙에 따라 세기',
        gen(r, level) {
          const unitLen = lv(level, 2, 3, 3);
          let unit: Flat[];
          do unit = Array.from({ length: unitLen }, () => r.pick(FLATS));
          while (new Set(unit).size < 2);
          const total = level === 1 ? unitLen * r.int(3, 4) : level === 2 ? unitLen * r.int(3, 4) : unitLen * r.int(3, 4) + r.int(1, unitLen - 1);
          const k = r.pick([...new Set(unit)]);
          const cnt = range(0, total - 1).filter((i) => unit[i % unitLen] === k).length;
          return {
            q: `규칙에 따라 모양을 $${total}$개 늘어놓으려고 해요. ${FLAT_NAME[k]}은 모두 몇 개인가요?`,
            fig: patternRow(range(0, unitLen * 2 - 1).map((i) => unit[i % unitLen])),
            answer: { type: 'num', value: cnt, unit: '개' },
            steps: [
              `${unit.map((x) => FLAT_NAME[x].replace(' 모양', '')).join(' ')} 순서로 반복되고, 한 묶음에 ${FLAT_NAME[k]}이 $${unit.filter((x) => x === k).length}$개 있어요.`,
              `$${total}$개를 늘어놓으며 세면 ${FLAT_NAME[k]}은 $${cnt}$개예요.`,
            ],
            hint: '반복되는 묶음이 몇 번 들어가는지 생각해 보세요.',
          };
        },
      },
    ],
  },

  // ───────────────────────── 덧셈과 뺄셈(3)
  'e1b-6': {
    concepts: [
      {
        title: '10을 만들어 더하기',
        body: '$8+5$는 $5$를 $2$와 $3$으로 갈라서 $8$과 $2$로 $10$을 먼저 만들어요.\n$$8+5 = 8+2+3 = 10+3 = 13$$\n- 앞의 수를 갈라서 뒤의 수와 $10$을 만들어도 돼요.',
      },
      {
        title: '받아올림이 있는 (몇)+(몇)',
        body: '두 수의 합이 $10$보다 크면 $10$과 몇으로 나타내요.\n- $7+6=13$, $9+4=13$, $6+6=12$\n- 더하는 순서를 바꾸어도 합은 같아요. $4+9=9+4$',
      },
      {
        title: '10을 이용하여 빼기',
        body: '$13-5$ 계산하는 방법\n- 방법 1: $13-3-2 = 10-2 = 8$ (빼는 수를 갈라요)\n- 방법 2: $10-5+3 = 5+3 = 8$ ($13$을 $10$과 $3$으로 갈라요)',
      },
      {
        title: '덧셈표와 뺄셈표의 규칙',
        body: '- 더하는 수가 $1$씩 커지면 합도 $1$씩 커져요. $8+5=13$, $8+6=14$\n- 빼는 수가 $1$씩 커지면 차는 $1$씩 작아져요. $15-6=9$, $15-7=8$',
      },
    ],
    skills: [
      {
        id: 'add-carry',
        title: '받아올림 있는 덧셈',
        gen(r, level) {
          const a = r.int(2, 9);
          const b = r.int(11 - a, 9);
          if (level === 3) {
            const front = r.chance(0.5);
            return {
              q: `빈칸에 알맞은 수를 쓰세요.\n$$${front ? `\\square+${b}` : `${a}+\\square`}=${a + b}$$`,
              answer: { type: 'num', value: front ? a : b },
              steps: [`$${a + b}-${front ? b : a}$를 계산해요.`, `빈칸은 $${front ? a : b}$`],
            };
          }
          return {
            q: `계산해 보세요.\n$$${a}+${b}=\\square$$`,
            fig: level === 1 ? tenFrames(a, { extra: b, frames: 2 }) : undefined,
            answer: { type: 'num', value: a + b },
            steps: [`$${b}$를 $${10 - a}$와 $${b - (10 - a)}$로 갈라요.`, `$${a}+${10 - a}=10$`, `$10+${b - (10 - a)}=${a + b}$`],
          };
        },
      },
      {
        id: 'sub-borrow',
        title: '받아내림 있는 뺄셈',
        gen(r, level) {
          const a = r.int(11, 18);
          const b = r.int(Math.max((a % 10) + 1, a - 9), 9);
          if (level === 3) {
            const kind = r.int(0, 1);
            return {
              q: `빈칸에 알맞은 수를 쓰세요.\n$$${kind === 0 ? `${a}-\\square` : `\\square-${b}`}=${a - b}$$`,
              answer: { type: 'num', value: kind === 0 ? b : a },
              steps: kind === 0 ? [`$${a}-${a - b}=${b}$`, `빈칸은 $${b}$`] : [`$${a - b}+${b}=${a}$`, `빈칸은 $${a}$`],
            };
          }
          return {
            q: `계산해 보세요.\n$$${a}-${b}=\\square$$`,
            fig: level === 1 ? dotGroups([{ n: a, perRow: 10, crossed: b }], { r: 8 }) : undefined,
            answer: { type: 'num', value: a - b },
            steps: [`$${b}$를 $${a % 10}$와 $${b - (a % 10)}$로 갈라요.`, `$${a}-${a % 10}=10$`, `$10-${b - (a % 10)}=${a - b}$`],
          };
        },
      },
      {
        id: 'method',
        title: '10을 이용한 계산 방법',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(6, 9);
            const b = r.int(11 - a, 9);
            const k = 10 - a;
            return {
              q: `$${a}+${b}$를 $10$을 만들어 계산했어요. 빈칸에 알맞은 수를 쓰세요.\n$$${a}+${b}=${a}+${k}+\\square=10+\\square$$`,
              answer: { type: 'num', value: b - k },
              steps: [`$${b}$를 $${k}$와 $${b - k}$로 갈라요.`, `빈칸은 $${b - k}$`],
            };
          }
          const a = r.int(11, 18);
          const b = r.int(Math.max((a % 10) + 1, a - 9), 9);
          const o = a % 10;
          if (level === 2) {
            return {
              q: `$${a}-${b}$를 빼는 수를 갈라서 계산했어요. 빈칸에 알맞은 수를 쓰세요.\n$$${a}-${b}=${a}-${o}-\\square=10-\\square$$`,
              answer: { type: 'num', value: b - o },
              steps: [`$${b}$를 $${o}$와 $${b - o}$로 갈라요.`, `빈칸은 $${b - o}$`],
            };
          }
          return {
            q: `$${a}-${b}$를 $${a}$를 $10$과 $${o}$로 갈라서 계산했어요. 빈칸에 알맞은 수를 쓰세요.\n$$${a}-${b}=10-${b}+\\square=\\square$$\n(앞의 빈칸과 뒤의 빈칸을 차례로 쓰세요.)`,
            answer: { type: 'fields', fields: [{ label: '앞의 빈칸', value: o }, { label: '계산 결과', value: a - b }] },
            steps: [`$${a}$는 $10$과 $${o}$`, `$10-${b}=${10 - b}$, $${10 - b}+${o}=${a - b}$`],
          };
        },
      },
      {
        id: 'word',
        title: '이야기 문제',
        gen(r, level) {
          const [p1, p2] = names(r, 2);
          const [thing, u] = r.pick(THINGS);
          const a = r.int(3, 9);
          const b = r.int(11 - a, 9);
          if (level === 1) {
            return {
              q: `${p1}는 ${thing} $${a}$${u}, ${p2}는 $${b}$${u}를 가지고 있어요. 두 사람이 가진 ${thing}는 모두 몇 ${u}인가요?`,
              answer: { type: 'num', value: a + b, unit: u },
              steps: ['모두 몇 개인지 구하니까 덧셈이에요.', `$${a}+${b}=${a + b}$ (${u})`],
            };
          }
          const s = a + b;
          if (level === 2) {
            return {
              q: `${thing} $${s}$${u} 중에서 $${b}$${u}를 ${['사과', '사탕', '쿠키', '귤', '젤리'].includes(thing) ? '먹었어요' : '동생에게 주었어요'}. 남은 ${thing}는 몇 ${u}인가요?`,
              answer: { type: 'num', value: a, unit: u },
              steps: ['남은 것을 구하니까 뺄셈이에요.', `$${s}-${b}=${a}$ (${u})`],
            };
          }
          const c = r.int(Math.max(1, s - 9), Math.min(9, s - 1));
          return {
            q: `${p1}는 ${thing}를 $${a}$${u}, ${p2}는 $${b}$${u} 가지고 있어요. 두 사람이 가진 ${thing} 중에서 $${c}$${u}를 친구들에게 나누어 주었다면 남은 ${thing}는 몇 ${u}인가요?`,
            answer: { type: 'num', value: s - c, unit: u },
            steps: [`두 사람이 가진 것: $${a}+${b}=${s}$`, `나누어 주고 남은 것: $${s}-${c}=${s - c}$ (${u})`],
          };
        },
      },
      {
        id: 'table-pattern',
        title: '합과 차가 같은 식',
        gen(r, level) {
          const s = r.int(11, 17);
          if (level === 2) {
            const a = r.int(Math.max(2, s - 9), Math.min(8, s - 3));
            const up = r.chance(0.5);
            return {
              q: `덧셈표의 규칙을 생각하여 빈칸에 알맞은 수를 쓰세요.\n$$${a}+${s - a}=${s},\\quad ${a}+${s - a + (up ? 1 : -1)}=\\square$$`,
              answer: { type: 'num', value: s + (up ? 1 : -1) },
              steps: [`더하는 수가 $1$ ${up ? '커지면 합도 $1$ 커져요' : '작아지면 합도 $1$ 작아져요'}.`, `$${s}${up ? '+' : '-'}1=${s + (up ? 1 : -1)}$`],
            };
          }
          if (level === 1) {
            const a = r.int(Math.max(2, s - 9), Math.min(9, s - 2));
            const right = `$${a}+${s - a}$`;
            const wr: string[] = [];
            for (let g = 0; wr.length < 3 && g < 100; g++) {
              const x = r.int(2, 9);
              const y = r.int(2, 9);
              if (x + y !== s && x + y > 10 && !wr.includes(`$${x}+${y}$`)) wr.push(`$${x}+${y}$`);
            }
            return {
              q: `합이 $${s}$인 덧셈식을 고르세요.`,
              answer: makeChoices(r, right, wr),
              steps: ['각 덧셈식을 계산해 보아요.', `${right.slice(0, -1)}=${s}$`],
            };
          }
          const d = r.int(3, 8);
          const a0 = r.int(Math.max(11, 10 + d - 8), Math.min(18, d + 9));
          const right = `$${a0}-${a0 - d}$`;
          const wr: string[] = [];
          for (let g = 0; wr.length < 3 && g < 100; g++) {
            const x = r.int(11, 18);
            const y = r.int(Math.max(2, x - 9), 9);
            if (x - y !== d && !wr.includes(`$${x}-${y}$`)) wr.push(`$${x}-${y}$`);
          }
          return {
            q: `차가 $${d}$인 뺄셈식을 고르세요.`,
            answer: makeChoices(r, right, wr),
            steps: ['각 뺄셈식을 계산해 보아요.', `${right.slice(0, -1)}=${d}$`],
          };
        },
      },
    ],
  },
};

// 문장제 유형 덧붙이기 (words*.ts)
for (const [id, sks] of Object.entries(WORDS_1)) if (e1b[id]) e1b[id].skills.push(...sks);
// 심화·최상위 유형 덧붙이기 (hard*.ts)
for (const [id, h] of Object.entries(HARD_1))
  if (e1b[id]) {
    e1b[id].skills.push(...h.skills);
    e1b[id].top = [...(e1b[id].top ?? []), ...h.top];
  }
