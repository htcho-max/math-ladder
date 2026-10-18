// 초1-1: 9까지의 수 / 여러 가지 모양 / 덧셈과 뺄셈 / 비교하기 / 50까지의 수
import type { ContentMap, ProblemDraft } from '../../core/types';
import { makeChoices } from '../../core/tex';
import { range } from '../../core/nt';
import { J, N, jo, names, native, nativeCount, sino, intChoices, textChoices, lv, THINGS, ensureEach } from './util';
import {
  dotGroups,
  mixedDots,
  tenFrames,
  bundles,
  solidsRow,
  SOLID_NAME,
  type Solid,
  pencils,
  seesaw,
  cups,
  gridShapes,
  polyomino,
  barsOnGrid,
  hstack,
} from './draw';

const NAT_NUM = ['영', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉'];
const SINO_NUM = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
const ORD = ['', '첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째'];

const SOLID_OBJ: Record<Solid, string[]> = {
  box: ['선물 상자', '주사위', '휴지 상자', '책', '벽돌', '우유갑', '냉장고', '지우개'],
  cyl: ['음료수 캔', '딱풀', '두루마리 휴지', '북', '통조림', '연필꽂이(동그란 통)', '김밥 한 줄', '케이크 상자(둥근 통)'],
  ball: ['축구공', '구슬', '수박', '야구공', '농구공', '지구본', '방울', '배구공'],
};
const SOLIDS: Solid[] = ['box', 'cyl', 'ball'];

export const e1a: ContentMap = {
  // ───────────────────────── 9까지의 수
  'e1a-1': {
    concepts: [
      {
        title: '1부터 5까지 세기',
        body: '물건을 하나씩 짚으며 세어요.\n- $1$ 하나(일), $2$ 둘(이), $3$ 셋(삼), $4$ 넷(사), $5$ 다섯(오)\n- 수는 두 가지로 읽을 수 있어요. "사과 **세** 개", "**삼** 번 버스"처럼요.',
        example: { q: '●●● 는 몇 개일까요?', a: '하나, 둘, 셋 → $3$개예요.' },
      },
      {
        title: '6부터 9까지 세기',
        body: '- $6$ 여섯(육), $7$ 일곱(칠), $8$ 여덟(팔), $9$ 아홉(구)\n- 다섯까지 센 다음 이어서 여섯, 일곱 … 하고 세면 쉬워요.',
      },
      {
        title: '몇째와 순서',
        body: '순서를 말할 때는 **첫째, 둘째, 셋째 …** 라고 해요.\n- 수를 순서대로 쓰면 $1, 2, 3, 4, 5, 6, 7, 8, 9$ 예요.\n- 거꾸로 쓰면 $9, 8, 7, \\dots, 1$ 이에요.\n- 앞에서 몇째인지, 뒤에서 몇째인지 잘 보고 세어요.',
      },
      {
        title: '1만큼 더 큰 수, 1만큼 더 작은 수, 0',
        body: '- 바로 **뒤의 수**가 $1$만큼 더 큰 수예요. $5$ 다음은 $6$.\n- 바로 **앞의 수**가 $1$만큼 더 작은 수예요. $5$ 앞은 $4$.\n- 아무것도 없는 것은 $0$(영)이라고 써요. $1$보다 $1$만큼 더 작은 수가 $0$이에요.',
      },
      {
        title: '수의 크기 비교',
        body: '하나씩 짝 지어 보면 남는 쪽이 더 많아요.\n- 수를 순서대로 놓았을 때 **뒤에 있는 수가 더 커요**.\n- "$7$은 $4$보다 큽니다", "$4$는 $7$보다 작습니다" 라고 말해요.',
        example: { q: '$6$과 $8$ 중 더 큰 수는?', a: '$8$이 $6$보다 뒤에 오니까 $8$이 더 커요.' },
      },
    ],
    skills: [
      {
        id: 'count',
        title: '세어 보기',
        gen(r, level): ProblemDraft {
          if (level < 3) {
            const n = level === 1 ? r.int(1, 5) : r.int(5, 9);
            const per = r.pick([5, 3, 4]);
            return {
              q: '동그라미는 모두 몇 개인가요?',
              fig: dotGroups([{ n, perRow: per }]),
              answer: { type: 'num', value: n, unit: '개' },
              steps: [`하나씩 짚으며 세어요: ${NAT_NUM.slice(1, n + 1).join(', ')}`, `모두 $${n}$개예요.`],
              hint: '센 것에는 표시를 하며 세어 보세요.',
            };
          }
          const total = r.int(6, 9);
          const k = r.int(2, total - 2);
          const pat = r.shuffle([...Array(k).fill(true), ...Array(total - k).fill(false)]) as boolean[];
          const askFilled = r.chance(0.5);
          const ans = askFilled ? k : total - k;
          return {
            q: `${askFilled ? '색칠한' : '색칠하지 않은'} 동그라미는 몇 개인가요?`,
            fig: mixedDots(pat, { perRow: 5 }),
            answer: { type: 'num', value: ans, unit: '개' },
            steps: [`${askFilled ? '색칠한' : '색칠하지 않은'} 것만 골라 하나씩 세어요.`, `${NAT_NUM.slice(1, ans + 1).join(', ')} → $${ans}$개`],
          };
        },
      },
      {
        id: 'read',
        title: '수 읽기',
        gen(r, level) {
          const n = r.int(1, 9);
          if (level === 1) {
            const c = `${NAT_NUM[n]}, ${SINO_NUM[n]}`;
            const others = range(1, 9).filter((x) => x !== n);
            const wr = r.sample(others, 3).map((x) => `${NAT_NUM[x]}, ${SINO_NUM[x]}`);
            return {
              q: `수 $${n}$을(를) 바르게 읽은 것을 고르세요.`.replace('을(를)', jo(n, '을')),
              answer: textChoices(r, c, wr),
              steps: [`$${n}$은 '${NAT_NUM[n]}' 또는 '${SINO_NUM[n]}'이라고 읽어요.`],
            };
          }
          if (level === 2) {
            const word = r.chance(0.5) ? NAT_NUM[n] : SINO_NUM[n];
            return {
              q: `'${word}'를 수로 나타내면 무엇인가요?`.replace(`'${word}'를`, `'${word}'${jo(word, '을')}`),
              answer: intChoices(r, n, [n + 1, n - 1, n + 2], { min: 1, max: 9 }),
              steps: [`'${word}'는 $${n}$이에요.`.replace(`'${word}'는`, `'${word}'${jo(word, '은')}`).replace(`$${n}$이에요`, `$${n}$${jo(n, '이에요')}`)],
            };
          }
          let m = r.int(1, 9);
          if (m === n) m = n === 9 ? 8 : n + 1;
          const same = r.sample([`$${n}$`, NAT_NUM[n], SINO_NUM[n], `${nativeCount(n)} 개`], 3);
          const odd = r.pick([NAT_NUM[m], SINO_NUM[m]]);
          return {
            q: '나타내는 수가 **다른** 하나를 고르세요.',
            answer: makeChoices(r, odd, same),
            steps: [`${same.join(', ')} → 모두 $${n}$을 나타내요.`, `'${odd}' → $${m}$을 나타내요.`],
          };
        },
      },
      {
        id: 'order',
        title: '수의 순서와 몇째',
        gen(r, level) {
          if (level === 1) {
            const st = r.int(1, 5);
            const seq = range(st, st + 4);
            const hole = r.int(1, 4);
            return {
              q: `수의 순서대로 빈칸에 알맞은 수를 쓰세요.\n$$${seq.map((x, i) => (i === hole ? '\\square' : x)).join(',\\ ')}$$`,
              answer: { type: 'num', value: seq[hole] },
              steps: [`$1$씩 커지는 순서예요.`, `$${seq[hole - 1]}$ 다음 수는 $${seq[hole]}$이에요.`],
            };
          }
          if (level === 2) {
            const st = r.int(5, 9);
            const seq = range(st - 4, st).reverse();
            const hole = r.int(1, 4);
            return {
              q: `수의 순서를 거꾸로 하여 썼어요. 빈칸에 알맞은 수를 쓰세요.\n$$${seq.map((x, i) => (i === hole ? '\\square' : x)).join(',\\ ')}$$`,
              answer: { type: 'num', value: seq[hole] },
              steps: [`$1$씩 작아지는 순서예요.`, `$${seq[hole - 1]}$ 바로 앞의 수는 $${seq[hole]}$이에요.`],
            };
          }
          const [who] = names(r, 1);
          const total = r.int(5, 9);
          const front = r.int(2, total - 1);
          const back = total - front + 1;
          return {
            q: `어린이 ${nativeCount(total)} 명이 한 줄로 서 있어요. ${who}는 앞에서 ${ORD[front]}에 서 있어요. ${who}는 뒤에서 몇째인가요?`.replace(`${who}는 앞`, `${J(who, '은')} 앞`).replace(`${who}는 뒤`, `${J(who, '은')} 뒤`),
            answer: { type: 'num', value: back, unit: '째' },
            fig: dotGroups([{ n: total, perRow: 9 }]),
            steps: [`앞에서 ${ORD[front]}까지 ${nativeCount(front)} 명, 그 뒤로 $${total - front}$명이 더 있어요.`, `뒤에서부터 세면 ${who}는 ${ORD[back]}예요.`],
            hint: '그림에서 앞에서부터 세어 표시한 다음, 뒤에서부터 다시 세어 보세요.',
          };
        },
      },
      {
        id: 'one-more-less',
        title: '1만큼 더 큰 수, 더 작은 수',
        gen(r, level) {
          if (level === 1) {
            const more = r.chance(0.5);
            const n = more ? r.int(1, 8) : r.int(2, 9);
            const ans = more ? n + 1 : n - 1;
            return {
              q: `$${n}$보다 $1$만큼 더 ${more ? '큰' : '작은'} 수는 무엇인가요?`,
              answer: { type: 'num', value: ans },
              steps: [`$${n}$의 바로 ${more ? '뒤' : '앞'}의 수를 찾아요.`, `$${n}$보다 $1$만큼 더 ${more ? '큰' : '작은'} 수는 $${ans}$이에요.`],
            };
          }
          if (level === 2) {
            const n = r.int(1, 9);
            const kinds = r.chance(0.3) ? 'zero' : r.pick(['more', 'less']);
            if (kinds === 'zero') {
              return {
                q: '접시에 쿠키가 $1$개 있었는데 $1$개를 먹었어요. 접시에 남은 쿠키는 몇 개인가요?',
                answer: intChoices(r, 0, [1, 2, 3], { min: 0, max: 9 }),
                steps: ['$1$보다 $1$만큼 더 작은 수는 $0$이에요.', '아무것도 없으니 $0$개예요.'],
              };
            }
            const more = kinds === 'more' && n < 9;
            const m = more ? n : Math.max(1, n);
            const ans = more ? m + 1 : m - 1;
            return {
              q: `$1$만큼 더 ${more ? '큰' : '작은'} 수를 고르세요: $${m}$`,
              answer: intChoices(r, ans, [more ? m - 1 : m + 1, m, ans + (more ? 1 : -1)], { min: 0, max: 9 }),
              steps: [`$${m}$의 바로 ${more ? '뒤' : '앞'}의 수가 답이에요.`, `$${ans}$`],
            };
          }
          const more = r.chance(0.5);
          const ans = more ? r.int(1, 8) : r.int(1, 8);
          const given = more ? ans + 1 : ans - 1 >= 0 ? ans - 1 : 0;
          const realAns = more ? ans : given + 1;
          return {
            q: `어떤 수보다 $1$만큼 더 ${more ? '큰' : '작은'} 수는 $${given}$입니다. 어떤 수는 무엇인가요?`,
            answer: { type: 'num', value: realAns },
            steps: [
              more ? `어떤 수의 바로 뒤의 수가 $${given}$이에요.` : `어떤 수의 바로 앞의 수가 $${given}$이에요.`,
              more ? `그러니까 어떤 수는 $${given}$의 바로 앞의 수인 $${realAns}$이에요.` : `그러니까 어떤 수는 $${given}$의 바로 뒤의 수인 $${realAns}$이에요.`,
            ],
            hint: '거꾸로 생각해 보세요.',
          };
        },
      },
      {
        id: 'compare',
        title: '수의 크기 비교',
        gen(r, level) {
          if (level === 1) {
            const [a, b] = r.sample(range(1, 9), 2);
            const big = r.chance(0.5);
            const ans = big ? Math.max(a, b) : Math.min(a, b);
            return {
              q: `$${a}$와(과) $${b}$ 중에서 더 ${big ? '큰' : '작은'} 수는 무엇인가요?`.replace('와(과)', jo(a, '과')),
              fig: dotGroups([{ n: a }, { n: b }]),
              answer: textChoices(r, `$${ans}$`, [`$${a + b - ans}$`]),
              steps: [`그림에서 하나씩 짝 지어 보면 $${Math.max(a, b)}$쪽이 남아요.`, `더 ${big ? '큰' : '작은'} 수는 $${ans}$이에요.`],
            };
          }
          if (level === 2) {
            const xs = r.sample(range(1, 9), 3);
            const big = r.chance(0.5);
            const ans = big ? Math.max(...xs) : Math.min(...xs);
            return {
              q: `가장 ${big ? '큰' : '작은'} 수를 고르세요: $${xs.join(',\\ ')}$`,
              answer: makeChoices(r, `$${ans}$`, xs.filter((x) => x !== ans).map((x) => `$${x}$`)),
              steps: [`수를 순서대로 놓으면 $${[...xs].sort((p, q) => p - q).join(', ')}$`, `가장 ${big ? '큰 수는 맨 뒤' : '작은 수는 맨 앞'}의 $${ans}$이에요.`],
            };
          }
          const a = r.int(1, 5);
          const b = r.int(a + 2, 9);
          const ans = b - a - 1;
          return {
            q: `$${a}$보다 크고 $${b}$보다 작은 수는 모두 몇 개인가요?`,
            answer: { type: 'num', value: ans, unit: '개' },
            steps: [`$${a}$와 $${b}$ 사이의 수: $${range(a + 1, b - 1).join(', ')}$`, `모두 $${ans}$개예요. ($${a}$와 $${b}$는 들어가지 않아요.)`],
            hint: `$${a}$과 $${b}$ 자신은 세지 않아요.`,
          };
        },
      },
    ],
  },

  // ───────────────────────── 여러 가지 모양
  'e1a-2': {
    concepts: [
      {
        title: '상자 모양',
        body: '선물 상자, 주사위, 휴지 상자처럼 생긴 모양이에요.\n- **평평한 부분**만 있고 뾰족한 부분이 있어요.\n- 잘 **쌓을 수 있지만** 잘 굴러가지 않아요.',
      },
      {
        title: '둥근기둥 모양',
        body: '음료수 캔, 두루마리 휴지처럼 생긴 모양이에요.\n- **평평한 부분과 둥근 부분**이 모두 있어요.\n- 세우면 쌓을 수 있고, 눕히면 **한 방향으로 굴러가요**.',
      },
      {
        title: '공 모양',
        body: '축구공, 구슬, 수박처럼 생긴 모양이에요.\n- **둥근 부분**만 있어요.\n- **여러 방향으로 잘 굴러가고**, 쌓을 수 없어요.',
      },
      {
        title: '모양으로 만들기',
        body: '상자·둥근기둥·공 모양을 이용해 여러 가지 물건을 만들 수 있어요.\n- 만든 모양에서 각 모양이 몇 개 쓰였는지 하나씩 표시하며 세어요.',
        example: { q: '로봇을 만드는 데 상자 모양 $3$개, 공 모양 $1$개를 썼어요. 모두 몇 개를 썼나요?', a: '$3$개와 $1$개를 합하면 $4$개예요.' },
      },
    ],
    skills: [
      {
        id: 'name-solid',
        title: '어떤 모양일까요?',
        gen(r, level) {
          const kind = r.pick(SOLIDS);
          const v = r.int(0, 2);
          if (level === 3) {
            // 같은 모양 고르기
            const items: { kind: Solid; v: number }[] = r.shuffle([kind, ...r.sample(SOLIDS.filter((k) => k !== kind), 2)]).map((k) => ({ kind: k, v: r.int(0, 2) }));
            const ansIdx = items.findIndex((x) => x.kind === kind);
            const labels = ['가', '나', '다'];
            const obj = r.pick(SOLID_OBJ[kind]);
            return {
              q: `'${obj}'와(과) 같은 모양을 그림에서 찾아 고르세요.`.replace('와(과)', jo(obj, '과')),
              fig: solidsRow(items, { labels }),
              answer: makeChoices(r, labels[ansIdx], labels.filter((_, i) => i !== ansIdx)),
              steps: [`${J(obj, '은')} ${SOLID_NAME[kind]}이에요.`, `그림에서 ${SOLID_NAME[kind]}은 ${labels[ansIdx]}예요.`],
            };
          }
          const z = level === 1 ? 70 : r.pick([50, 60, 70]);
          return {
            q: '그림은 어떤 모양인가요?',
            fig: solidsRow([{ kind, v: level === 1 ? v % 2 : v }], { z }),
            answer: makeChoices(r, SOLID_NAME[kind], SOLIDS.filter((k) => k !== kind).map((k) => SOLID_NAME[k])),
            steps: [
              kind === 'box' ? '평평한 부분만 있고 뾰족한 부분이 있어요.' : kind === 'cyl' ? '평평한 부분과 둥근 부분이 함께 있어요.' : '둥근 부분만 있어요.',
              `그래서 ${SOLID_NAME[kind]}이에요.`,
            ],
          };
        },
      },
      {
        id: 'count-solid',
        title: '같은 모양 세기',
        gen(r, level) {
          const n = lv(level, 5, 7, 9);
          const items = Array.from({ length: n }, () => ({ kind: r.pick(SOLIDS), v: r.int(0, 2) }));
          ensureEach(items, SOLIDS); // 각 모양 최소 1개
          const cnt = (k: Solid) => items.filter((x) => x.kind === k).length;
          if (level < 3) {
            const k = r.pick(SOLIDS);
            return {
              q: `${SOLID_NAME[k]}은 모두 몇 개인가요?`,
              fig: solidsRow(items, { z: 46, perRow: level === 1 ? 5 : 4 }),
              answer: { type: 'num', value: cnt(k), unit: '개' },
              steps: [`${SOLID_NAME[k]}에 하나씩 표시하며 세어요.`, `모두 $${cnt(k)}$개예요.`],
            };
          }
          let [k1, k2] = r.sample(SOLIDS, 2);
          if (cnt(k1) === cnt(k2)) {
            const k3 = SOLIDS.find((k) => k !== k1 && k !== k2)!;
            const idx = items.findIndex((x) => x.kind === k3);
            if (cnt(k3) > 1) items[idx].kind = k1;
            else items[items.findIndex((x) => x.kind === k2)].kind = k1;
          }
          if (cnt(k1) < cnt(k2)) [k1, k2] = [k2, k1];
          return {
            q: `${SOLID_NAME[k1]}은 ${SOLID_NAME[k2]}보다 몇 개 더 많은가요?`,
            fig: solidsRow(items, { z: 44, perRow: 5 }),
            answer: { type: 'num', value: cnt(k1) - cnt(k2), unit: '개' },
            steps: [`${SOLID_NAME[k1]}: $${cnt(k1)}$개, ${SOLID_NAME[k2]}: $${cnt(k2)}$개`, `$${cnt(k1)}-${cnt(k2)}=${cnt(k1) - cnt(k2)}$ (개)`],
          };
        },
      },
      {
        id: 'feature',
        title: '모양의 특징',
        gen(r, level) {
          const pool: [string, Solid][][] = [
            [
              ['둥근 부분만 있는 모양', 'ball'],
              ['평평한 부분만 있는 모양', 'box'],
              ['평평한 부분과 둥근 부분이 모두 있는 모양', 'cyl'],
            ],
            [
              ['여러 방향으로 잘 굴러가는 모양', 'ball'],
              ['잘 쌓을 수 있고 잘 굴러가지 않는 모양', 'box'],
              ['눕히면 한 방향으로만 굴러가는 모양', 'cyl'],
              ['뾰족한 부분이 있는 모양', 'box'],
            ],
            [
              ['세우면 쌓을 수 있고 눕히면 굴러가는 모양', 'cyl'],
              ['어느 쪽으로 놓아도 쌓을 수 없는 모양', 'ball'],
              ['어느 방향으로 놓아도 잘 굴러가지 않는 모양', 'box'],
              ['위에서 보면 동그랗고 옆에서 보면 네모난 모양', 'cyl'],
              ['어느 쪽에서 보아도 동그란 모양', 'ball'],
            ],
          ];
          const [desc, k] = r.pick(pool[level - 1]);
          return {
            q: `${desc}은 어느 것인가요?`,
            answer: makeChoices(r, SOLID_NAME[k], SOLIDS.filter((x) => x !== k).map((x) => SOLID_NAME[x])),
            steps: [
              '상자 모양: 평평한 부분만 → 잘 쌓이고 잘 안 굴러가요.',
              '둥근기둥 모양: 평평+둥근 부분 → 세우면 쌓이고 눕히면 굴러가요.',
              '공 모양: 둥근 부분만 → 여러 방향으로 굴러가요.',
              `답: ${SOLID_NAME[k]}`,
            ],
          };
        },
      },
      {
        id: 'objects',
        title: '물건을 모양별로',
        gen(r, level) {
          const k = r.pick(SOLIDS);
          if (level === 1) {
            const obj = r.pick(SOLID_OBJ[k]);
            return {
              q: `'${obj}'는 어떤 모양인가요?`.replace(`'${obj}'는`, `'${obj}'${jo(obj, '은')}`),
              answer: makeChoices(r, SOLID_NAME[k], SOLIDS.filter((x) => x !== k).map((x) => SOLID_NAME[x])),
              steps: [`${J(obj, '은')} ${SOLID_NAME[k]}이에요.`],
            };
          }
          if (level === 2) {
            const right = r.pick(SOLID_OBJ[k]);
            const wrongs = r.sample(SOLIDS.filter((x) => x !== k).flatMap((x) => SOLID_OBJ[x]), 3);
            return {
              q: `다음 중 ${SOLID_NAME[k]}인 물건을 고르세요.`,
              answer: makeChoices(r, right, wrongs),
              steps: [`${right}: ${SOLID_NAME[k]}`, ...wrongs.map((w) => `${w}: ${SOLID_NAME[SOLIDS.find((x) => SOLID_OBJ[x].includes(w))!]}`)],
            };
          }
          const others = r.sample(SOLID_OBJ[k], 3);
          const k2 = r.pick(SOLIDS.filter((x) => x !== k));
          const odd = r.pick(SOLID_OBJ[k2]);
          return {
            q: '모양이 **다른** 하나를 고르세요.',
            answer: makeChoices(r, odd, others),
            steps: [`${others.join(', ')}: ${SOLID_NAME[k]}`, `${odd}: ${SOLID_NAME[k2]}`],
          };
        },
      },
      {
        id: 'build',
        title: '만든 모양 살펴보기',
        gen(r, level) {
          const n = lv(level, 5, 7, 9);
          const items = Array.from({ length: n }, () => ({ kind: r.pick(SOLIDS), v: r.int(0, 1) }));
          ensureEach(items, SOLIDS); // 각 모양 최소 1개
          const cnt = (k: Solid) => items.filter((x) => x.kind === k).length;
          const thing = r.pick(['기차', '로봇', '성', '자동차', '탑']);
          if (level === 3) {
            const counts = SOLIDS.map(cnt);
            const max = Math.max(...counts);
            if (counts.filter((c) => c === max).length > 1) {
              // 가장 많은 모양이 하나가 되도록 하나 바꾸기
              const idx = items.findIndex((x) => x.kind !== SOLIDS[counts.indexOf(max)]);
              items[idx].kind = SOLIDS[counts.indexOf(max)];
            }
            const c2 = SOLIDS.map(cnt);
            const best = SOLIDS[c2.indexOf(Math.max(...c2))];
            return {
              q: `여러 가지 모양으로 ${J(thing, '을')} 만들었어요. 가장 많이 사용한 모양은 무엇인가요?`,
              fig: solidsRow(items, { z: 42, perRow: 5 }),
              answer: makeChoices(r, SOLID_NAME[best], SOLIDS.filter((x) => x !== best).map((x) => SOLID_NAME[x])),
              steps: [SOLIDS.map((k) => `${SOLID_NAME[k]} $${cnt(k)}$개`).join(', '), `가장 많은 것은 ${SOLID_NAME[best]}이에요.`],
            };
          }
          const k = r.pick(SOLIDS);
          const ask2 = level === 2;
          const k2 = r.pick(SOLIDS.filter((x) => x !== k));
          const ans = ask2 ? cnt(k) + cnt(k2) : cnt(k);
          return {
            q: ask2
              ? `여러 가지 모양으로 ${J(thing, '을')} 만들었어요. ${SOLID_NAME[k]}과 ${SOLID_NAME[k2]}을 모두 몇 개 사용했나요?`
              : `여러 가지 모양으로 ${J(thing, '을')} 만들었어요. ${SOLID_NAME[k]}을 몇 개 사용했나요?`,
            fig: solidsRow(items, { z: 42, perRow: 5 }),
            answer: { type: 'num', value: ans, unit: '개' },
            steps: ask2
              ? [`${SOLID_NAME[k]} $${cnt(k)}$개, ${SOLID_NAME[k2]} $${cnt(k2)}$개`, `모두 $${cnt(k)}+${cnt(k2)}=${ans}$ (개)`]
              : [`${SOLID_NAME[k]}에 표시하며 세어요.`, `$${ans}$개`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 덧셈과 뺄셈 (9 이하)
  'e1a-3': {
    concepts: [
      {
        title: '모으기와 가르기',
        body: '두 수를 한데 모으는 것을 **모으기**, 한 수를 두 수로 나누는 것을 **가르기**라고 해요.\n- $2$와 $3$을 모으면 $5$\n- $5$는 $1$과 $4$, $2$와 $3$ … 으로 가를 수 있어요.',
      },
      {
        title: '덧셈',
        body: '모두 몇 개인지 알아볼 때 덧셈을 해요.\n$$3+2=5$$\n"$3$ 더하기 $2$는 $5$와 같습니다", "$3$과 $2$의 **합**은 $5$입니다" 라고 읽어요.\n- 더하는 두 수의 순서를 바꾸어도 합은 같아요.',
        example: { q: '사과 $4$개와 $3$개를 합하면?', a: '$4+3=7$, $7$개' },
      },
      {
        title: '뺄셈',
        body: '남은 것이 몇 개인지, 몇 개 더 많은지 알아볼 때 뺄셈을 해요.\n$$6-2=4$$\n"$6$ 빼기 $2$는 $4$와 같습니다", "$6$과 $2$의 **차**는 $4$입니다" 라고 읽어요.',
      },
      {
        title: '0이 있는 덧셈과 뺄셈',
        body: '- 어떤 수에 $0$을 더하거나 빼도 그대로예요. $5+0=5$, $5-0=5$\n- 같은 수끼리 빼면 $0$이에요. $4-4=0$',
      },
      {
        title: '덧셈과 뺄셈의 관계',
        body: '가르기와 모으기를 생각하면 덧셈과 뺄셈은 서로 거꾸로예요.\n- $2+5=7$ 이면 $7-5=2$, $7-2=5$',
      },
    ],
    skills: [
      {
        id: 'gather-split',
        title: '모으기와 가르기',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(1, 5);
            const b = r.int(1, 9 - a);
            return {
              q: `$${a}$와(과) $${b}$를(을) 모으면 얼마가 되나요?`.replace('와(과)', jo(a, '과')).replace('를(을)', jo(b, '을')),
              fig: dotGroups([{ n: a }, { n: b, filled: true }]),
              answer: { type: 'num', value: a + b },
              steps: [`두 묶음의 동그라미를 한데 모아 처음부터 세어요.`, `$${a}$와 $${b}$를 모으면 $${a + b}$`],
            };
          }
          if (level === 2) {
            const t = r.int(3, 9);
            const a = r.int(1, t - 1);
            return {
              q: `$${t}$는 $${a}$와(과) 어떤 수로 가를 수 있어요. 어떤 수는 무엇인가요?`.replace('와(과)', jo(a, '과')).replace(`$${t}$는`, N(t, '은')),
              fig: dotGroups([{ n: t, perRow: 5 }]),
              answer: { type: 'num', value: t - a },
              steps: [`$${t}$개 중 $${a}$개를 덜어 내고 남은 것을 세어요.`, `$${t}$는 $${a}$와 $${t - a}$로 가를 수 있어요.`],
            };
          }
          const t = r.int(5, 9);
          const goods = r.sample(range(1, t - 1), 3).map((a) => `$${a}$와 $${t - a}$`);
          const a = r.int(1, t - 2);
          const bad = `$${a}$와 $${t - a + r.pick([1, -1].filter((d) => t - a + d > 0 && t - a + d <= 9))}$`;
          return {
            q: `$${t}$를 두 수로 바르게 가르지 **못한** 것을 고르세요.`.replace(`$${t}$를`, N(t, '을')),
            answer: makeChoices(r, bad, goods),
            steps: [`두 수를 다시 모았을 때 $${t}$가 되어야 해요.`, `${bad}를 모으면 $${t}$가 아니에요.`],
          };
        },
      },
      {
        id: 'add',
        title: '덧셈하기',
        gen(r, level) {
          if (level === 3) {
            const c = r.int(3, 9);
            const a = r.int(1, c - 1);
            const front = r.chance(0.5);
            return {
              q: `빈칸에 알맞은 수를 쓰세요.\n$$${front ? `\\square+${a}` : `${a}+\\square`}=${c}$$`,
              answer: { type: 'num', value: c - a },
              steps: [`$${a}$에 얼마를 더하면 $${c}$가 될지 생각해요.`, `$${c}-${a}=${c - a}$ 이므로 빈칸은 $${c - a}$`],
              hint: `$${c}$를 $${a}$와 어떤 수로 갈라 보세요.`,
            };
          }
          const a = level === 1 ? r.int(1, 5) : r.int(0, 8);
          const b = level === 1 ? r.int(1, 9 - a) : r.int(a === 0 ? 1 : 0, 9 - a);
          return {
            q: `계산해 보세요.\n$$${a}+${b}=\\square$$`,
            fig: level === 1 ? dotGroups([{ n: a }, { n: b, filled: true }]) : undefined,
            answer: { type: 'num', value: a + b },
            steps: b === 0 || a === 0 ? ['$0$을 더하면 그대로예요.', `$${a}+${b}=${a + b}$`] : [`$${a}$에서 $${b}$만큼 이어 세어요: ${range(a + 1, a + b).join(', ')}`, `$${a}+${b}=${a + b}$`],
          };
        },
      },
      {
        id: 'sub',
        title: '뺄셈하기',
        gen(r, level) {
          if (level === 3) {
            const a = r.int(4, 9);
            const b = r.int(1, a - 1);
            const kind = r.int(0, 1);
            const q = kind === 0 ? `${a}-\\square=${a - b}` : `\\square-${b}=${a - b}`;
            const ans = kind === 0 ? b : a;
            return {
              q: `빈칸에 알맞은 수를 쓰세요.\n$$${q}$$`,
              answer: { type: 'num', value: ans },
              steps: kind === 0 ? [`$${a}$에서 얼마를 빼면 $${a - b}$가 남을까요?`, `$${a}-${a - b}=${b}$ 이므로 빈칸은 $${b}$`] : [`어떤 수에서 $${b}$를 뺐더니 $${a - b}$가 남았어요.`, `$${a - b}+${b}=${a}$ 이므로 빈칸은 $${a}$`],
            };
          }
          const a = level === 1 ? r.int(2, 9) : r.int(1, 9);
          const b = level === 1 ? r.int(1, a - 1) : r.int(0, a);
          return {
            q: `계산해 보세요.\n$$${a}-${b}=\\square$$`,
            fig: level === 1 ? dotGroups([{ n: a, crossed: b, perRow: 5 }]) : undefined,
            answer: { type: 'num', value: a - b },
            steps: b === 0 ? ['$0$을 빼면 그대로예요.', `$${a}-0=${a}$`] : a === b ? ['같은 수를 빼면 $0$이에요.', `$${a}-${b}=0$`] : [`$${a}$개 중 $${b}$개를 지우고 남은 것을 세어요.`, `$${a}-${b}=${a - b}$`],
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
            const a = r.int(1, 5);
            const b = r.int(1, 9 - a);
            return {
              q: `${J(p1, '은')} ${thing} $${a}$${u}, ${J(p2, '은')} ${thing} $${b}$${u}를 가지고 있어요. 두 사람이 가진 ${J(thing, '은')} 모두 몇 ${u}인가요?`.replace(`$${b}$${u}를`, `$${b}$${u}${jo(u, '을')}`),
              answer: { type: 'num', value: a + b, unit: u },
              steps: ['모두 몇 개인지 구하니까 덧셈을 해요.', `$${a}+${b}=${a + b}$ (${u})`],
            };
          }
          if (level === 2) {
            const a = r.int(3, 9);
            const b = r.int(1, a - 1);
            const kind = r.int(0, 1);
            if (kind === 0) {
              return {
                q: `${J(p1, '은')} ${thing} $${a}$${u} 중에서 $${b}$${u}를 동생에게 주었어요. 남은 ${J(thing, '은')} 몇 ${u}인가요?`.replace(`$${b}$${u}를`, `$${b}$${u}${jo(u, '을')}`),
                answer: { type: 'num', value: a - b, unit: u },
                steps: ['남은 것을 구하니까 뺄셈을 해요.', `$${a}-${b}=${a - b}$ (${u})`],
              };
            }
            return {
              q: `${J(p1, '은')} ${thing} $${a}$${u}, ${J(p2, '은')} $${b}$${u}를 가지고 있어요. ${J(p1, '은')} ${p2}보다 몇 ${u} 더 많이 가지고 있나요?`.replace(`$${b}$${u}를`, `$${b}$${u}${jo(u, '을')}`),
              answer: { type: 'num', value: a - b, unit: u },
              steps: ['몇 개 더 많은지 구하니까 뺄셈을 해요.', `$${a}-${b}=${a - b}$ (${u})`],
            };
          }
          const a = r.int(3, 7);
          const b = r.int(1, a - 1);
          const c = r.int(1, 9 - (a - b));
          return {
            q: `${J(p1, '은')} ${thing} $${a}$${u}를 가지고 있었어요. ${p2}에게 $${b}$${u}를 주고, 엄마께 $${c}$${u}를 더 받았어요. 지금 ${p1}가 가진 ${J(thing, '은')} 몇 ${u}인가요?`
              .replace(`$${a}$${u}를`, `$${a}$${u}${jo(u, '을')}`)
              .replace(`$${b}$${u}를`, `$${b}$${u}${jo(u, '을')}`)
              .replace(`$${c}$${u}를`, `$${c}$${u}${jo(u, '을')}`)
              .replace(`${p1}가 가진`, `${J(p1, '이')} 가진`),
            answer: { type: 'num', value: a - b + c, unit: u },
            steps: [`준 것은 빼요: $${a}-${b}=${a - b}$`, `받은 것은 더해요: $${a - b}+${c}=${a - b + c}$ (${u})`],
          };
        },
      },
      {
        id: 'choose-sign',
        title: '알맞은 식 고르기',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(2, 8);
            const b = r.int(1, Math.min(a - 1, 9 - a));
            const plus = r.chance(0.5);
            const c = plus ? a + b : a - b;
            return {
              q: `$\\square$ 안에 $+$ 와 $-$ 중 알맞은 것을 고르세요.\n$$${a}\\ \\square\\ ${b}=${c}$$`,
              answer: makeChoices(r, plus ? '$+$' : '$-$', [plus ? '$-$' : '$+$']),
              steps: [`$${a}+${b}=${a + b}$, $${a}-${b}=${a - b}$`, `$${c}$이 되려면 ${plus ? '$+$' : '$-$'}`],
            };
          }
          if (level === 2) {
            let exprs: { t: string; v: number }[] = [];
            for (let guard = 0; guard < 50; guard++) {
              exprs = [];
              while (exprs.length < 4) {
                const plus = r.chance(0.5);
                const a = r.int(1, 8);
                const b = plus ? r.int(1, 9 - a) : r.int(0, a);
                const t = `$${a}${plus ? '+' : '-'}${b}$`;
                if (!exprs.some((e) => e.t === t)) exprs.push({ t, v: plus ? a + b : a - b });
              }
              const max = Math.max(...exprs.map((e) => e.v));
              if (exprs.filter((e) => e.v === max).length === 1) break;
            }
            const best = exprs.reduce((p, q) => (q.v > p.v ? q : p));
            return {
              q: '계산 결과가 가장 큰 것을 고르세요.',
              answer: makeChoices(r, best.t, exprs.filter((e) => e !== best).map((e) => e.t)),
              steps: [exprs.map((e) => `${e.t.slice(0, -1)}=${e.v}$`).join(', '), `가장 큰 것은 ${best.t}`],
            };
          }
          const target = r.int(3, 9);
          const pool = r.shuffle([
            ...range(0, target).map((a) => `$${a}+${target - a}$`),
            ...range(target + 1, 9).map((a) => `$${a}-${a - target}$`),
          ]);
          const same = pool.slice(0, 3);
          const off = target < 9 && r.chance(0.5) ? target + 1 : target - 1;
          let odd: string;
          if (off >= 9 || r.chance(0.5)) {
            const a = r.int(Math.max(0, off - 9), off);
            odd = `$${a}+${off - a}$`;
          } else {
            const x = r.int(off + 1, 9);
            odd = `$${x}-${x - off}$`;
          }
          return {
            q: '계산 결과가 **다른** 하나를 고르세요.',
            answer: makeChoices(r, odd, same),
            steps: [`${same.map((e) => `${e.slice(0, -1)}=${target}$`).join(', ')}`, `${odd.slice(0, -1)}=${off}$ 이므로 계산 결과가 다른 하나예요.`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 비교하기
  'e1a-4': {
    concepts: [
      {
        title: '길이 비교',
        body: '한쪽 끝을 맞추고 다른 쪽 끝을 보아요.\n- 두 개를 비교할 때: "**더 길다**", "**더 짧다**"\n- 세 개를 비교할 때: "**가장 길다**", "**가장 짧다**"\n- 키는 "더 크다/더 작다", 높이는 "더 높다/더 낮다"라고 해요.',
      },
      {
        title: '무게 비교',
        body: '손으로 들어 보거나 시소·저울에 올려 비교해요.\n- 시소에서 **아래로 내려간 쪽이 더 무거워요**.\n- "더 무겁다", "더 가볍다", "가장 무겁다", "가장 가볍다"',
      },
      {
        title: '넓이 비교',
        body: '겹쳐 보았을 때 남는 쪽이 더 넓어요.\n- 모눈 위에 있으면 **칸 수**를 세어 비교해요. 칸이 많을수록 더 넓어요.\n- "더 넓다", "더 좁다"',
      },
      {
        title: '담을 수 있는 양 비교',
        body: '그릇이 클수록 더 많이 담을 수 있어요.\n- 같은 그릇이면 **물의 높이**가 높을수록 물이 더 많아요.\n- 같은 컵으로 부은 횟수가 많을수록 더 많이 담겨요.\n- "더 많다", "더 적다"',
      },
    ],
    skills: [
      {
        id: 'length',
        title: '길이 비교하기',
        gen(r, level) {
          const labels = ['가', '나', '다'];
          const n = level === 1 ? 2 : 3;
          const lens = r.sample(range(3, 10), n);
          const longest = r.chance(0.5);
          const target = longest ? Math.max(...lens) : Math.min(...lens);
          const idx = lens.indexOf(target);
          if (level < 3) {
            const word = n === 2 ? (longest ? '더 긴' : '더 짧은') : longest ? '가장 긴' : '가장 짧은';
            return {
              q: `${word} 것을 고르세요.`,
              fig: pencils(lens, labels.slice(0, n)),
              answer: makeChoices(r, labels[idx], labels.slice(0, n).filter((_, i) => i !== idx)),
              steps: ['왼쪽 끝이 맞추어져 있으니 오른쪽 끝을 비교해요.', `오른쪽 끝이 가장 ${longest ? '많이 나온' : '적게 나온'} 것은 ${labels[idx]}예요.`],
            };
          }
          // 왼쪽 끝이 다른 막대: 모눈 칸 수 세기
          const offs = lens.map(() => r.int(0, 3));
          const cells = r.sample(range(3, 9), 3);
          const t2 = longest ? Math.max(...cells) : Math.min(...cells);
          const i2 = cells.indexOf(t2);
          return {
            q: `한 칸의 길이가 모두 같아요. ${longest ? '가장 긴' : '가장 짧은'} 막대는 몇 칸인가요?`,
            fig: barsOnGrid(cells.map((c, i) => ({ start: offs[i], len: c, label: labels[i] })), 12),
            answer: { type: 'num', value: t2, unit: '칸' },
            steps: [`막대마다 칸 수를 세어요: ${cells.map((c, i) => `${labels[i]} $${c}$칸`).join(', ')}`, `${longest ? '가장 긴' : '가장 짧은'} 것은 ${labels[i2]}, $${t2}$칸이에요.`],
            hint: '끝이 맞추어져 있지 않을 때는 칸 수로 비교해요.',
          };
        },
      },
      {
        id: 'weight',
        title: '무게 비교하기',
        gen(r, level) {
          if (level === 1) {
            const [a, b] = names(r, 2);
            const h = r.pick(['L', 'R'] as const);
            const heavy = h === 'L' ? a : b;
            const askHeavy = r.chance(0.5);
            const ans = askHeavy ? heavy : heavy === a ? b : a;
            return {
              q: `${J(a, '과')} ${J(b, '이')} 시소를 탔어요. 더 ${askHeavy ? '무거운' : '가벼운'} 사람은 누구인가요?`,
              fig: seesaw(a, b, h),
              answer: makeChoices(r, ans, [ans === a ? b : a]),
              steps: ['시소는 무거운 쪽이 아래로 내려가요.', `아래로 내려간 쪽은 ${heavy} → 더 ${askHeavy ? '무거운' : '가벼운'} 사람은 ${ans}`],
            };
          }
          if (level === 2) {
            const pairs: [string, string][] = [
              ['코끼리', '강아지'],
              ['냉장고', '의자'],
              ['자동차', '자전거'],
              ['수박', '귤'],
              ['책가방', '연필'],
              ['소', '고양이'],
              ['피아노', '리코더'],
              ['사전', '공책 한 장'],
            ];
            const [hv, lt] = r.pick(pairs);
            const askHeavy = r.chance(0.5);
            const order = r.shuffle([hv, lt]);
            const ans = askHeavy ? hv : lt;
            return {
              q: `${J(order[0], '과')} ${order[1]} 중 더 ${askHeavy ? '무거운' : '가벼운'} 것은 무엇인가요?`,
              answer: makeChoices(r, ans, [ans === hv ? lt : hv]),
              steps: ['두 물건을 들어 본다고 생각해요.', `${J(hv, '이')} ${lt}보다 더 무거워요. 답: ${ans}`],
            };
          }
          const [a, b, c] = names(r, 3); // a > b > c
          const pairs = r.shuffle([
            [a, b],
            [b, c],
          ] as [string, string][]);
          const mk = ([hv, lt]: [string, string]) => (r.chance(0.5) ? seesaw(hv, lt, 'L') : seesaw(lt, hv, 'R'));
          const askHeavy = r.chance(0.5);
          const ans = askHeavy ? a : c;
          return {
            q: `세 사람이 둘씩 시소를 탔어요. ${r.shuffle([a, b, c]).join(', ')} 중 **가장 ${askHeavy ? '무거운' : '가벼운'}** 사람은 누구인가요?`,
            fig: hstack([mk(pairs[0]), mk(pairs[1])]),
            answer: makeChoices(r, ans, [a, b, c].filter((x) => x !== ans)),
            steps: [`${J(a, '은')} ${b}보다 무거워요.`, `${J(b, '은')} ${c}보다 무거워요.`, `가장 무거운 사람은 ${a}, 가장 가벼운 사람은 ${c} → 답: ${ans}`],
          };
        },
      },
      {
        id: 'area',
        title: '넓이 비교하기',
        gen(r, level) {
          const labels = ['가', '나', '다'];
          const n = level === 3 ? 3 : 2;
          let sizes: number[];
          do sizes = Array.from({ length: n }, () => r.int(lv(level, 3, 4, 4), 9));
          while (new Set(sizes).size < n);
          const shapes = sizes.map((sz, i) => ({ cells: level === 1 ? rectCells(sz, r) : polyomino(r, sz, 4, 4), label: labels[i] }));
          const wide = r.chance(0.5);
          const target = wide ? Math.max(...sizes) : Math.min(...sizes);
          const idx = sizes.indexOf(target);
          if (level === 3) {
            const diff = Math.max(...sizes) - Math.min(...sizes);
            return {
              q: '가장 넓은 것은 가장 좁은 것보다 몇 칸 더 넓은가요?',
              fig: gridShapes(shapes, 4, 4),
              answer: { type: 'num', value: diff, unit: '칸' },
              steps: [`칸 수: ${sizes.map((s, i) => `${labels[i]} $${s}$칸`).join(', ')}`, `$${Math.max(...sizes)}-${Math.min(...sizes)}=${diff}$ (칸)`],
            };
          }
          return {
            q: `더 ${wide ? '넓은' : '좁은'} 것을 고르세요.`,
            fig: gridShapes(shapes, 4, 4),
            answer: makeChoices(r, labels[idx], labels.slice(0, n).filter((_, i) => i !== idx)),
            steps: [`칸 수를 세어요: ${sizes.map((s, i) => `${labels[i]} $${s}$칸`).join(', ')}`, `칸이 ${wide ? '더 많은' : '더 적은'} ${labels[idx]}가 더 ${wide ? '넓어요' : '좁아요'}.`],
          };
        },
      },
      {
        id: 'capacity',
        title: '담을 수 있는 양 비교하기',
        gen(r, level) {
          const labels = ['가', '나', '다'];
          if (level === 1) {
            const ws = r.sample([30, 40, 50, 60], 3);
            const hs = r.sample([40, 55, 70], 3);
            // 크기 순서가 확실하도록 너비·높이 모두 같은 순서
            ws.sort((a, b) => a - b);
            hs.sort((a, b) => a - b);
            const order = r.shuffle([0, 1, 2]);
            const items = order.map((k) => ({ w: ws[k], h: hs[k] }));
            const most = r.chance(0.5);
            const idx = order.indexOf(most ? 2 : 0);
            return {
              q: `담을 수 있는 양이 가장 ${most ? '많은' : '적은'} 그릇을 고르세요.`,
              fig: cups(items, labels),
              answer: makeChoices(r, labels[idx], labels.filter((_, i) => i !== idx)),
              steps: ['그릇이 클수록 더 많이 담을 수 있어요.', `가장 ${most ? '큰' : '작은'} 그릇은 ${labels[idx]}예요.`],
            };
          }
          if (level === 2) {
            const lv3 = r.sample([0.25, 0.45, 0.65, 0.85], 3);
            const items = lv3.map((wv) => ({ w: 44, h: 70, water: wv }));
            const most = r.chance(0.5);
            const target = most ? Math.max(...lv3) : Math.min(...lv3);
            const idx = lv3.indexOf(target);
            return {
              q: `똑같은 그릇에 물을 담았어요. 물이 가장 ${most ? '많이' : '적게'} 담긴 그릇을 고르세요.`,
              fig: cups(items, labels),
              answer: makeChoices(r, labels[idx], labels.filter((_, i) => i !== idx)),
              steps: ['그릇의 모양과 크기가 같으면 물의 높이를 비교해요.', `물의 높이가 가장 ${most ? '높은' : '낮은'} 것은 ${labels[idx]}예요.`],
            };
          }
          const [p1, p2] = names(r, 2);
          const a = r.int(3, 8);
          let b = r.int(3, 8);
          if (b === a) b = a + 1;
          const cupWord = r.pick(['컵', '바가지', '그릇']);
          const kind = r.int(0, 1);
          if (kind === 0) {
            // 같은 컵, 다른 물통: 많이 부은 쪽이 더 많이 담김
            const more = a > b ? p1 : p2;
            return {
              q: `${J(p1, '은')} 물통에, ${J(p2, '은')} 주전자에 물을 가득 담았어요. 똑같은 ${cupWord}로 덜어 냈더니 물통은 $${a}$번, 주전자는 $${b}$번 덜어 낼 수 있었어요. 물을 더 많이 담은 사람은 누구인가요?`,
              answer: makeChoices(r, more, [more === p1 ? p2 : p1]),
              steps: [`같은 ${cupWord}이면 덜어 낸 횟수가 많을수록 물이 많아요.`, `$${Math.max(a, b)}$번 덜어 낸 ${more}가 더 많이 담았어요.`.replace(`${more}가`, J(more, '이'))],
            };
          }
          // 같은 물통, 다른 컵: 적게 부은 컵이 더 큼
          const big = a < b ? p1 : p2;
          return {
            q: `똑같은 물통에 물을 가득 채우려고 해요. ${J(p1, '은')} 자기 컵으로 $${a}$번, ${J(p2, '은')} 자기 컵으로 $${b}$번 부었더니 가득 찼어요. 누구의 컵이 더 큰가요?`,
            answer: makeChoices(r, big, [big === p1 ? p2 : p1]),
            steps: ['물통의 크기가 같으면 적은 횟수로 채운 컵이 더 커요.', `$${Math.min(a, b)}$번 부은 ${big}의 컵이 더 커요.`],
          };
        },
      },
      {
        id: 'words',
        title: '비교하는 말',
        gen(r, level) {
          const facts: [string, string, string, string][] = [
            // 큰 것, 작은 것, 큰 쪽 말, 작은 쪽 말
            ['기린', '토끼', '키가 더 크다', '키가 더 작다'],
            ['아파트', '우리 집 의자', '더 높다', '더 낮다'],
            ['코끼리', '생쥐', '더 무겁다', '더 가볍다'],
            ['운동장', '책상 위', '더 넓다', '더 좁다'],
            ['욕조', '컵', '더 많이 담을 수 있다', '더 적게 담을 수 있다'],
            ['기차', '자전거', '더 길다', '더 짧다'],
            ['수박', '포도 한 알', '더 무겁다', '더 가볍다'],
            ['칠판', '공책', '더 넓다', '더 좁다'],
          ];
          const [big, small, bw, sw] = r.pick(facts);
          if (level === 3) {
            const triples: [string, string, string, string][] = [
              ['코끼리', '강아지', '개미', '무거운'],
              ['기린', '어린이', '병아리', '키가 큰'],
              ['운동장', '교실', '책상', '넓은'],
              ['욕조', '양동이', '컵', '많이 담을 수 있는'],
              ['기차', '버스', '자전거', '긴'],
            ];
            const [x, y, z, adj] = r.pick(triples);
            const askMost = r.chance(0.5);
            const opp: Record<string, string> = { 무거운: '가벼운', '키가 큰': '키가 작은', 넓은: '좁은', '많이 담을 수 있는': '적게 담을 수 있는', 긴: '짧은' };
            const ans = askMost ? x : z;
            return {
              q: `${r.shuffle([x, y, z]).join(', ')} 중에서 **가장 ${askMost ? adj : opp[adj]}** 것은 무엇인가요?`,
              answer: makeChoices(r, ans, [x, y, z].filter((w) => w !== ans)),
              steps: [`셋을 비교할 때는 '가장'을 써요.`, `가장 ${adj} 것부터 늘어놓으면 ${x}, ${y}, ${z} 순서예요.`, `가장 ${askMost ? adj : opp[adj]} 것은 ${ans}`],
            };
          }
          const askBig = r.chance(0.5);
          const subj = askBig ? big : small;
          const other = askBig ? small : big;
          const right = askBig ? bw : sw;
          const wrong = askBig ? sw : bw;
          if (level === 1) {
            return {
              q: `알맞은 말을 고르세요.\n${J(subj, '은')} ${other}보다 (     ).`,
              answer: makeChoices(r, right, [wrong]),
              steps: [`${J(subj, '과')} ${J(other, '을')} 비교해 보아요.`, `${J(subj, '은')} ${other}보다 ${right}.`],
            };
          }
          const allWords = ['더 길다', '더 무겁다', '더 넓다', '더 높다', '더 많이 담을 수 있다', '키가 더 크다', '더 짧다', '더 가볍다', '더 좁다', '더 낮다'];
          return {
            q: `알맞은 말을 고르세요.\n${J(subj, '은')} ${other}보다 (     ).`,
            answer: makeChoices(r, right, [wrong, ...r.sample(allWords.filter((w) => w !== right && w !== wrong && !(w.includes(right.split(' ').pop()!))), 2)]),
            steps: [`무엇을 비교하는지 먼저 생각해요.`, `${J(subj, '은')} ${other}보다 ${right}.`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 50까지의 수
  'e1a-5': {
    concepts: [
      {
        title: '10 알아보기',
        body: '$9$보다 $1$만큼 더 큰 수를 $10$이라고 해요. **십** 또는 **열**이라고 읽어요.\n- $10$은 $1$과 $9$, $2$와 $8$, $3$과 $7$, $4$와 $6$, $5$와 $5$로 가를 수 있어요.',
      },
      {
        title: '십몇 알아보기',
        body: '$10$개씩 묶음 $1$개와 낱개 몇 개를 **십몇**이라고 해요.\n- $10$개씩 묶음 $1$개와 낱개 $4$개 → $14$ (십사, 열넷)\n- $11$ 십일·열하나, $12$ 십이·열둘, … , $19$ 십구·열아홉',
      },
      {
        title: '몇십 알아보기',
        body: '$10$개씩 묶음이 $2$개면 $20$(이십, 스물), $3$개면 $30$(삼십, 서른), $4$개면 $40$(사십, 마흔), $5$개면 $50$(오십, 쉰)이에요.',
      },
      {
        title: '50까지의 수',
        body: '$10$개씩 묶음 $3$개와 낱개 $6$개는 $36$이에요. 삼십육 또는 서른여섯이라고 읽어요.\n- 앞의 숫자는 $10$개씩 묶음의 수, 뒤의 숫자는 낱개의 수예요.',
      },
      {
        title: '수의 순서와 크기',
        body: '- $10$개씩 묶음의 수가 큰 쪽이 더 커요. $41 > 39$\n- 묶음의 수가 같으면 **낱개의 수**가 큰 쪽이 더 커요. $27 > 24$',
        example: { q: '$32$와 $28$ 중 더 큰 수는?', a: '$10$개씩 묶음이 $3$개인 $32$가 더 커요.' },
      },
    ],
    skills: [
      {
        id: 'make-ten',
        title: '10 모으기와 가르기',
        gen(r, level) {
          const a = r.int(1, 9);
          if (level === 1) {
            return {
              q: `$${a}$와(과) 몇을 모으면 $10$이 되나요?`.replace('와(과)', jo(a, '과')),
              fig: tenFrames(a, { frames: 1 }),
              answer: { type: 'num', value: 10 - a },
              steps: ['$10$칸 상자에서 빈칸을 세어요.', `빈칸이 $${10 - a}$칸이므로 $${a}$와 $${10 - a}$를 모으면 $10$`],
            };
          }
          if (level === 2) {
            return {
              q: `$10$은 $${a}$와(과) 어떤 수로 가를 수 있어요. 어떤 수는 무엇인가요?`.replace('와(과)', jo(a, '과')),
              answer: intChoices(r, 10 - a, [11 - a, 9 - a, a], { min: 1, max: 10 }),
              steps: [`$${a}$에 얼마를 더하면 $10$이 될까요?`, `$${a}$와 $${10 - a}$를 모으면 $10$`],
            };
          }
          const [p1, p2] = names(r, 2);
          const [thing, u] = r.pick(THINGS);
          return {
            q: `${J(p1, '과')} ${J(p2, '이')} ${thing} $10$${u}를 나누어 가졌어요. ${J(p1, '이')} $${a}$${u}를 가졌다면 ${J(p2, '은')} 몇 ${u}를 가졌나요?`
              .replace(`$10$${u}를`, `$10$${u}${jo(u, '을')}`)
              .replace(`$${a}$${u}를`, `$${a}$${u}${jo(u, '을')}`)
              .replace(`몇 ${u}를`, `몇 ${u}${jo(u, '을')}`),
            answer: { type: 'num', value: 10 - a, unit: u },
            steps: [`$10$을 $${a}$와 어떤 수로 가르는 문제예요.`, `$10$은 $${a}$와 $${10 - a}$ → $${10 - a}$${u}`],
          };
        },
      },
      {
        id: 'bundles',
        title: '묶음과 낱개',
        gen(r, level) {
          if (level === 3) {
            const t = r.int(1, 3);
            const o = r.int(10, 19);
            const n = t * 10 + o;
            return {
              q: `$10$개씩 묶음 $${t}$개와 낱개 $${o}$개는 모두 얼마인가요?`,
              answer: { type: 'num', value: n },
              steps: [`낱개 $${o}$개는 $10$개씩 묶음 $1$개와 낱개 $${o - 10}$개예요.`, `$10$개씩 묶음 $${t + 1}$개와 낱개 $${o - 10}$개 → $${n}$`],
              hint: '낱개가 10개보다 많으면 10개를 한 묶음으로 바꾸어요.',
            };
          }
          const t = level === 1 ? 1 : r.int(2, 4);
          const o = level === 1 ? r.int(1, 9) : r.int(0, 9);
          const n = t * 10 + o;
          const reverse = level === 2 && r.chance(0.4);
          if (reverse) {
            return {
              q: `$${n}$은(는) $10$개씩 묶음 몇 개와 낱개 몇 개인가요?`.replace('은(는)', jo(n, '은')),
              answer: { type: 'fields', fields: [{ label: '10개씩 묶음', value: t, unit: '개' }, { label: '낱개', value: o, unit: '개' }] },
              steps: [`$${n}$에서 앞의 숫자 $${t}$는 $10$개씩 묶음의 수, 뒤의 숫자 $${o}$는 낱개의 수예요.`],
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
        title: '수 읽기',
        gen(r, level) {
          const n = level === 1 ? r.int(11, 19) : r.int(20, 50);
          const nn = (x: number) => `${sino(x)}, ${native(x)}`;
          if (level === 1 || level === 2) {
            const wr = [n + 1, n - 1, n + 10, n - 10, (n % 10) * 10 + Math.floor(n / 10)].filter((x) => x >= 10 && x <= 50 && x !== n && x % 10 !== 0);
            const toWord = r.chance(0.5);
            if (toWord) {
              return {
                q: `$${n}$을(를) 바르게 읽은 것을 고르세요.`.replace('을(를)', jo(n, '을')),
                answer: makeChoices(r, nn(n), [...new Set(wr)].map(nn)),
                steps: [`$${n}$은 '${sino(n)}' 또는 '${native(n)}'이라고 읽어요.`.replace(`$${n}$은`, N(n, '은'))],
              };
            }
            const word = r.chance(0.5) ? sino(n) : native(n);
            return {
              q: `'${word}'을(를) 수로 나타낸 것을 고르세요.`.replace('을(를)', jo(word, '을')),
              answer: intChoices(r, n, wr, { min: 10, max: 50 }),
              steps: [`'${word}'은(는) $${n}$이에요.`.replace('은(는)', jo(word, '은'))],
            };
          }
          let m = r.int(20, 50);
          if (m === n) m = n === 50 ? 49 : n + 1;
          const same = [`$${n}$`, sino(n), native(n), `10개씩 묶음 ${Math.floor(n / 10)}개와 낱개 ${n % 10}개`];
          const odd = r.pick([sino(m), native(m)]);
          return {
            q: '나타내는 수가 **다른** 하나를 고르세요.',
            answer: makeChoices(r, odd, r.sample(same, 3)),
            steps: [`'${odd}'만 $${m}$이고 나머지는 모두 $${n}$이에요.`],
          };
        },
      },
      {
        id: 'order',
        title: '수의 순서',
        gen(r, level) {
          if (level === 3) {
            const a = r.int(10, 40);
            const b = r.int(a + 3, Math.min(50, a + 10));
            return {
              q: `$${a}$와 $${b}$ 사이에 있는 수는 모두 몇 개인가요?`,
              answer: { type: 'num', value: b - a - 1, unit: '개' },
              steps: [`$${a + 1}$부터 $${b - 1}$까지의 수를 세어요.`, `$${range(a + 1, b - 1).join(', ')}$ → $${b - a - 1}$개`],
              hint: '양 끝의 수는 세지 않아요.',
            };
          }
          const up = level === 1;
          const st = up ? r.int(10, 45) : r.int(15, 50);
          const seq = range(0, 4).map((i) => (up ? st + i : st - i));
          const hole = r.int(1, 4);
          return {
            q: `수의 순서${up ? '대로' : '를 거꾸로 하여'} 썼어요. 빈칸에 알맞은 수를 쓰세요.\n$$${seq.map((x, i) => (i === hole ? '\\square' : x)).join(',\\ ')}$$`,
            answer: { type: 'num', value: seq[hole] },
            steps: [`$1$씩 ${up ? '커지는' : '작아지는'} 순서예요.`, `$${seq[hole - 1]}$ 다음에 오는 수는 $${seq[hole]}$`],
          };
        },
      },
      {
        id: 'compare',
        title: '수의 크기 비교',
        gen(r, level) {
          if (level === 3) {
            const cards = r.sample([1, 2, 3, 4], 3);
            const big = r.chance(0.5);
            const all: number[] = [];
            for (const a of cards) for (const b of cards) if (a !== b) all.push(a * 10 + b);
            const ans = big ? Math.max(...all) : Math.min(...all);
            const s = [...cards].sort((a, b) => (big ? b - a : a - b));
            return {
              q: `수 카드 $${cards.join('$, $')}$ 중에서 $2$장을 골라 몇십몇을 만들려고 해요. 만들 수 있는 가장 ${big ? '큰' : '작은'} 수는 무엇인가요?`,
              answer: { type: 'num', value: ans },
              steps: [`$10$개씩 묶음의 수(앞자리)에 가장 ${big ? '큰' : '작은'} 수 $${s[0]}$를 놓아요.`, `낱개의 수(뒷자리)에 그다음 ${big ? '큰' : '작은'} 수 $${s[1]}$를 놓으면 $${ans}$`],
            };
          }
          let a: number, b: number;
          if (level === 1) {
            a = r.int(1, 4) * 10 + r.int(0, 9);
            do b = r.int(1, 4) * 10 + r.int(0, 9);
            while (Math.floor(a / 10) === Math.floor(b / 10));
          } else {
            const t = r.int(1, 4);
            a = t * 10 + r.int(0, 9);
            do b = t * 10 + r.int(0, 9);
            while (b === a);
          }
          const big = r.chance(0.5);
          const ans = big ? Math.max(a, b) : Math.min(a, b);
          return {
            q: `$${a}$와(과) $${b}$ 중 더 ${big ? '큰' : '작은'} 수는 무엇인가요?`.replace('와(과)', jo(a, '과')),
            answer: makeChoices(r, `$${ans}$`, [`$${a + b - ans}$`]),
            steps:
              level === 1
                ? [`$10$개씩 묶음의 수를 비교해요: $${Math.floor(a / 10)}$와 $${Math.floor(b / 10)}$`, `더 ${big ? '큰' : '작은'} 수는 $${ans}$`]
                : [`$10$개씩 묶음의 수가 같으니 낱개의 수를 비교해요: $${a % 10}$와 $${b % 10}$`, `더 ${big ? '큰' : '작은'} 수는 $${ans}$`],
          };
        },
      },
    ],
  },
};

/** 넓이 비교용 직사각형 칸 (sz 를 넘지 않게 a×b) */
function rectCells(sz: number, r: { pick<T>(a: readonly T[]): T }): [number, number][] {
  const opts: [number, number][] = [];
  for (let w = 1; w <= 4; w++) for (let h = 1; h <= 4; h++) if (w * h === sz) opts.push([w, h]);
  if (!opts.length) {
    // 직사각형이 안 되면 줄로 채우기
    const cells: [number, number][] = [];
    for (let i = 0; i < sz; i++) cells.push([i % 4, Math.floor(i / 4)]);
    return cells;
  }
  const [w, h] = r.pick(opts);
  const cells: [number, number][] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) cells.push([x, y]);
  return cells;
}
