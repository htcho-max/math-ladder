// 초2 문장제(이야기 문제) 유형 — 단원별 skills 끝에 덧붙임 (e2a.ts / e2b.ts 에서 합침)
import type { ProblemDraft, Skill } from '../../core/types';
import type { Rng } from '../../core/rng';
import { makeChoices } from '../../core/tex';
import { range } from '../../core/nt';
import { J, jo, names, textChoices, THINGS } from './util';
import { oGraph } from './draw';
import { ORDS } from './words1';

const t = (h: number, m: number) => (m === 0 ? `$${h}$시` : `$${h}$시 $${m}$분`);
const won = (x: number) => `$${x}$원`;
/** 같은 수 여러 번 더하기 식: [6,6] → 6+6=12, [5] → 5 */
const sumEq = (xs: number[]) => (xs.length === 1 ? `${xs[0]}` : `${xs.join('+')}=${xs.reduce((a, b) => a + b, 0)}`);

function nameChoices(r: Rng, correct: string, all: string[]) {
  return textChoices(r, correct, all.filter((x) => x !== correct), Math.min(4, all.length));
}

/** 조건을 만족할 때까지 다시 뽑기 (시드 고정이라 결정적) */
function until<T>(gen: () => T, ok: (v: T) => boolean): T {
  let v = gen();
  for (let i = 0; i < 500 && !ok(v); i++) v = gen();
  return v;
}

const SNACKS = ['과자', '음료수', '아이스크림', '빵', '젤리', '초콜릿'];

// ───────────────────────── e2a-1 세 자리 수
const e2a1: Skill[] = [
  {
    id: 'money-story',
    title: '돈 이야기 (세 자리 수)',
    gen(r, level): ProblemDraft {
      const ps = names(r, 2);
      if (level === 1) {
        const a = r.int(1, 9);
        const b = r.int(0, 9);
        const ctx = r.pick([`${ps[0]}의 저금통을 열어 보니`, `${ps[0]}의 지갑에는`, `엄마께서 ${ps[0]}에게 용돈으로`]);
        const tail = ctx.startsWith('엄마') ? '주셨어요. 받은 용돈은' : ctx.includes('저금통') ? '나왔어요. 저금통에서 나온 돈은' : '있어요. 지갑에 있는 돈은';
        return {
          q: `${ctx} $100$원짜리 동전 $${a}$개${b ? `와 $10$원짜리 동전 $${b}$개` : ''}${ctx.startsWith('엄마') ? '를' : '가'} ${tail} 모두 얼마인가요?`,
          answer: { type: 'num', value: 100 * a + 10 * b, unit: '원' },
          steps: [`$100$원짜리 $${a}$개 → ${won(100 * a)}`, b ? `$10$원짜리 $${b}$개 → ${won(10 * b)}` : '$10$원짜리는 없어요.', `모두 ${won(100 * a + 10 * b)}`],
        };
      }
      if (level === 2) {
        const a = r.int(1, 7);
        const b = r.int(11, 19);
        const v = 100 * a + 10 * b;
        const snack = r.pick(SNACKS);
        return {
          q: `${ps[0]}는 $100$원짜리 동전 $${a}$개와 $10$원짜리 동전 $${b}$개를 가지고 ${J(snack, '을')} 사러 갔어요. ${ps[0]}가 가진 돈은 모두 얼마인가요?`,
          answer: { type: 'num', value: v, unit: '원' },
          steps: [`$10$원짜리 $10$개는 $100$원이에요. $10$원짜리 $${b}$개 → ${won(10 * b)}`, `$100$원짜리 $${a}$개 → ${won(100 * a)}`, `${won(100 * a)}과 ${won(10 * b)} → ${won(v)}`],
          hint: '10원짜리 10개는 100원짜리 1개와 같아요.',
        };
      }
      const [A, B] = until(
        () => [
          [r.int(2, 6), r.int(11, 19)],
          [r.int(3, 7), r.int(0, 9)],
        ],
        ([x, y]) => {
          const va = 100 * x[0] + 10 * x[1];
          const vb = 100 * y[0] + 10 * y[1];
          return va !== vb && Math.abs(va - vb) < 150;
        },
      );
      const va = 100 * A[0] + 10 * A[1];
      const vb = 100 * B[0] + 10 * B[1];
      const most = r.chance(0.5);
      const ans = (va > vb) === most ? ps[0] : ps[1];
      return {
        q: `${ps[0]}는 $100$원짜리 동전 $${A[0]}$개와 $10$원짜리 동전 $${A[1]}$개, ${ps[1]}는 $100$원짜리 동전 $${B[0]}$개와 $10$원짜리 동전 $${B[1]}$개를 가지고 있어요. 돈을 더 ${most ? '많이' : '적게'} 가진 사람은 누구인가요?`,
        answer: nameChoices(r, ans, ps),
        steps: [`${ps[0]}: ${won(100 * A[0])}과 ${won(10 * A[1])} → ${won(va)}`, `${ps[1]}: ${won(vb)}`, `$${Math.max(va, vb)}>${Math.min(va, vb)}$ → ${ans}`],
        hint: '동전의 개수가 아니라 금액을 비교해요.',
      };
    },
  },
  {
    id: 'count-story',
    title: '묶음·뛰어 세기 이야기',
    gen(r, level): ProblemDraft {
      const [p] = names(r, 1);
      if (level === 1) {
        const [thing, u] = r.pick([
          ['색종이', '장'],
          ['스티커', '장'],
          ['구슬', '개'],
          ['클립', '개'],
        ] as [string, string][]);
        const pack = u === '장' ? '묶음' : '상자';
        const a = r.int(1, 9);
        const b = r.int(0, 9);
        const c = r.int(0, 9);
        return {
          q: `문구점에 ${J(thing, '이')} $100$${u}씩 $${a}$${pack}${b ? `, $10$${u}씩 $${b}$${pack}` : ''}${c ? ',' : ''} ${c ? `낱개로 $${c}$${u} ` : ''}있어요. 문구점에 있는 ${J(thing, '은')} 모두 몇 ${u}인가요?`,
          answer: { type: 'num', value: 100 * a + 10 * b + c, unit: u },
          steps: [`백의 자리 $${a}$, 십의 자리 $${b}$, 일의 자리 $${c}$`, `$${100 * a + 10 * b + c}$${u}`],
        };
      }
      const d = r.pick([10, 100]);
      if (level === 2) {
        const k = r.int(3, 6);
        const s = d === 10 ? r.int(10, 80) * 10 : r.int(1, 9 - k) * 100 + r.int(0, 9) * 10;
        const e = s + d * k;
        return {
          q: `${p}의 저금통에는 ${won(s)}이 들어 있어요. 내일부터 날마다 ${won(d)}씩 넣는다면 $${k}$일 뒤에 저금통에 있는 돈은 얼마인가요?`,
          answer: { type: 'num', value: e, unit: '원' },
          steps: [`$${d}$씩 $${k}$번 뛰어 세어요.`, `${range(0, k).map((i) => `$${s + d * i}$`).join(' → ')}`, `${won(e)}`],
        };
      }
      const k = r.int(3, 7);
      const s = d === 10 ? r.int(10, 85) * 10 : r.int(1, 9 - k) * 100 + r.int(0, 9) * 10;
      const e = s + d * k;
      return {
        q: `${p}는 날마다 ${won(d)}씩 저금통에 넣었더니 $${k}$일 뒤에 저금통에 있는 돈이 ${won(e)}이 되었어요. 처음 저금통에 있던 돈은 얼마인가요?`,
        answer: { type: 'num', value: s, unit: '원' },
        steps: [`거꾸로 $${d}$씩 $${k}$번 뛰어 세어요.`, `${range(0, k).map((i) => `$${e - d * i}$`).join(' → ')}`, `처음에는 ${won(s)}`],
        hint: '거꾸로 뛰어 세어 보세요.',
      };
    },
  },
];

// ───────────────────────── e2a-2 여러 가지 도형
const POLY: [string, number][] = [
  ['삼각형', 3],
  ['사각형', 4],
  ['오각형', 5],
  ['육각형', 6],
];

const e2a2: Skill[] = [
  {
    id: 'sticks-story',
    title: '변·꼭짓점 세기 이야기',
    gen(r, level): ProblemDraft {
      const [p] = names(r, 1);
      const verts = r.chance(0.4);
      const what = verts ? '점토 구슬' : '수수깡';
      const lead = verts ? `${p}는 수수깡으로 도형을 따로따로 만들고, 꼭짓점마다 점토 구슬을 하나씩 붙였어요.` : `${p}는 수수깡 한 개를 변 하나로 하여 도형을 따로따로 만들었어요.`;
      const part = verts ? '꼭짓점' : '변';
      if (level < 3) {
        const shapes = r.sample(POLY, 2);
        const cnt = level === 1 ? [1, 1] : [r.int(1, 3), r.int(1, 3)];
        const terms: number[] = [];
        shapes.forEach(([, n], i) => {
          for (let k = 0; k < cnt[i]; k++) terms.push(n);
        });
        const tot = terms.reduce((a, b) => a + b, 0);
        return {
          q: `${lead} ${shapes.map(([nm], i) => `${nm} $${cnt[i]}$개`).join('와 ')}를 만들었다면 사용한 ${J(what, '은')} 모두 몇 개인가요?`,
          answer: { type: 'num', value: tot, unit: '개' },
          steps: [shapes.map(([nm, n]) => `${nm}의 ${part}: $${n}$개`).join(', '), `$${terms.join('+')}=${tot}$ (개)`],
        };
      }
      if (r.chance(0.5)) {
        const a = r.int(1, 3);
        const b = r.int(1, 3);
        const need = 4 * a + 3 * b;
        const n = need + r.int(1, 9);
        return {
          q: `${p}는 수수깡 $${n}$개를 가지고 있어요. 수수깡 한 개를 변 하나로 하여 사각형 $${a}$개와 삼각형 $${b}$개를 따로따로 만들었어요. 남은 수수깡은 몇 개인가요?`,
          answer: { type: 'num', value: n - need, unit: '개' },
          steps: [`사용한 수수깡: $${[...Array(a).fill(4), ...Array(b).fill(3)].join('+')}=${need}$ (개)`, `남은 수수깡: $${n}-${need}=${n - need}$ (개)`],
          hint: '먼저 사용한 수수깡의 수를 구하세요.',
        };
      }
      const [s1, s2] = r.sample(POLY, 2);
      const a = r.int(2, 3);
      const b = r.int(1, 3);
      const x = s1[1] * a;
      const y = s2[1] * b;
      if (x === y) {
        return {
          q: `${s1[0]} $${a}$개의 꼭짓점의 수와 ${s2[0]} $${b}$개의 변의 수를 더하면 모두 몇 개인가요?`,
          answer: { type: 'num', value: x + y, unit: '개' },
          steps: [`${s1[0]} $${a}$개의 꼭짓점: $${sumEq(Array(a).fill(s1[1]))}$`, `${s2[0]} $${b}$개의 변: $${sumEq(Array(b).fill(s2[1]))}$`, `$${x}+${y}=${x + y}$ (개)`],
        };
      }
      const [big, small] = x > y ? [[s1, a, x], [s2, b, y]] as const : [[s2, b, y], [s1, a, x]] as const;
      return {
        q: `${p}는 ${s1[0]} $${a}$개와 ${s2[0]} $${b}$개를 그렸어요. ${big[0][0]} $${big[1]}$개의 꼭짓점은 ${small[0][0]} $${small[1]}$개의 꼭짓점보다 몇 개 더 많은가요?`,
        answer: { type: 'num', value: big[2] - small[2], unit: '개' },
        steps: [`${big[0][0]} $${big[1]}$개: $${sumEq(Array(big[1]).fill(big[0][1]))}$ (개)`, `${small[0][0]} $${small[1]}$개: $${sumEq(Array(small[1]).fill(small[0][1]))}$ (개)`, `$${big[2]}-${small[2]}=${big[2] - small[2]}$ (개)`],
      };
    },
  },
  {
    id: 'cube-story',
    title: '쌓기나무 이야기',
    gen(r, level): ProblemDraft {
      const ps = names(r, 2);
      if (level === 1) {
        const a = r.int(3, 6);
        const b = r.int(1, a - 1);
        return {
          q: `${ps[0]}는 쌓기나무로 1층에 $${a}$개를 놓고, 그 위 2층에 $${b}$개를 쌓았어요. ${ps[0]}가 사용한 쌓기나무는 모두 몇 개인가요?`,
          answer: { type: 'num', value: a + b, unit: '개' },
          steps: ['층별로 센 수를 더해요.', `$${a}+${b}=${a + b}$ (개)`],
        };
      }
      if (level === 2) {
        const a = r.int(4, 7);
        const b = r.int(2, a - 1);
        const c = r.int(1, b - 1);
        const used = a + b + c;
        const n = used + r.int(2, 9);
        return {
          q: `${ps[0]}는 쌓기나무 $${n}$개를 가지고 1층에 $${a}$개, 2층에 $${b}$개, 3층에 $${c}$개를 쌓았어요. 남은 쌓기나무는 몇 개인가요?`,
          answer: { type: 'num', value: n - used, unit: '개' },
          steps: [`사용한 쌓기나무: $${a}+${b}+${c}=${used}$ (개)`, `남은 쌓기나무: $${n}-${used}=${n - used}$ (개)`],
        };
      }
      const A = [r.int(3, 6)];
      A.push(r.int(1, A[0] - 1));
      const B = [r.int(4, 7)];
      B.push(r.int(2, B[0] - 1));
      B.push(r.int(1, B[1] - 1));
      const sa = A[0] + A[1];
      const sb = B[0] + B[1] + B[2];
      if (sa === sb) B[0] += 1;
      const sb2 = B[0] + B[1] + B[2];
      const [hi, lo, vh, vl] = sb2 > sa ? [ps[1], ps[0], sb2, sa] : [ps[0], ps[1], sa, sb2];
      return {
        q: `${ps[0]}는 1층에 $${A[0]}$개, 2층에 $${A[1]}$개를 쌓았고, ${ps[1]}는 1층에 $${B[0]}$개, 2층에 $${B[1]}$개, 3층에 $${B[2]}$개를 쌓았어요. ${hi}는 ${lo}보다 쌓기나무를 몇 개 더 많이 사용했나요?`,
        answer: { type: 'num', value: vh - vl, unit: '개' },
        steps: [`${ps[0]}: $${A[0]}+${A[1]}=${sa}$ (개)`, `${ps[1]}: $${B[0]}+${B[1]}+${B[2]}=${sb2}$ (개)`, `$${vh}-${vl}=${vh - vl}$ (개)`],
      };
    },
  },
];

// ───────────────────────── e2a-3 덧셈과 뺄셈
const e2a3: Skill[] = [
  {
    id: 'unknown-story',
    title: '모르는 수를 □로 놓는 이야기',
    gen(r, level): ProblemDraft {
      const [p1, p2] = names(r, 2);
      if (level === 1) {
        const [a, b] = until(
          () => [r.int(15, 69), r.int(6, 29)],
          ([x, y]) => (x % 10) + (y % 10) >= 10 && x + y <= 99,
        );
        const s = a + b;
        const ctx = r.pick([
          [`${p1}는 구슬을 몇 개 가지고 있었는데, ${p2}에게 $${b}$개를 더 받았더니 $${s}$개가 되었어요. 처음에 가지고 있던 구슬은 몇 개인가요?`, '개'],
          [`버스에 사람이 몇 명 타고 있었는데, 정류장에서 $${b}$명이 더 타서 $${s}$명이 되었어요. 처음에 타고 있던 사람은 몇 명인가요?`, '명'],
          [`연못에 개구리가 몇 마리 있었는데 $${b}$마리가 더 와서 $${s}$마리가 되었어요. 처음에 있던 개구리는 몇 마리인가요?`, '마리'],
        ]);
        return {
          q: ctx[0],
          answer: { type: 'num', value: a, unit: ctx[1] },
          steps: [`처음 수를 $\\square$로 놓으면 $\\square+${b}=${s}$`, `$\\square=${s}-${b}=${a}$ (${ctx[1]})`],
          hint: '모르는 수를 □로 놓고 식을 세워 보세요.',
        };
      }
      if (level === 2) {
        const kind = r.int(0, 1);
        if (kind === 0) {
          const [a, c] = until(
            () => [r.int(31, 95), r.int(8, 49)],
            ([x, y]) => x > y + 5 && x % 10 < y % 10,
          );
          const ctx = r.pick([
            [`주차장에 자동차가 $${a}$대 있었는데, 몇 대가 나가서 $${c}$대가 남았어요. 나간 자동차는 몇 대인가요?`, '대'],
            [`${p1}는 색종이 $${a}$장 중에서 몇 장을 사용했더니 $${c}$장이 남았어요. 사용한 색종이는 몇 장인가요?`, '장'],
          ]);
          return {
            q: ctx[0],
            answer: { type: 'num', value: a - c, unit: ctx[1] },
            steps: [`$${a}-\\square=${c}$`, `$\\square=${a}-${c}=${a - c}$ (${ctx[1]})`],
          };
        }
        const [b, c] = until(
          () => [r.int(12, 48), r.int(9, 45)],
          ([x, y]) => (x % 10) + (y % 10) >= 10 && x + y <= 99,
        );
        const [thing, u] = r.pick(THINGS.filter(([nm]) => ['사탕', '쿠키', '귤', '젤리', '사과'].includes(nm)));
        return {
          q: `${p1}는 ${thing}를 몇 ${u} 가지고 있었어요. 그중 $${b}$${u}${jo(u, '를')} 친구들과 나누어 먹었더니 $${c}$${u}${jo(u, '가')} 남았어요. 처음에 가지고 있던 ${J(thing, '은')} 몇 ${u}인가요?`,
          answer: { type: 'num', value: b + c, unit: u },
          steps: [`$\\square-${b}=${c}$`, `$\\square=${c}+${b}=${b + c}$ (${u})`],
          hint: '뺄셈식을 덧셈식으로 바꾸어 생각해요.',
        };
      }
      const [tt, a, b] = until(
        () => [r.int(60, 99), r.int(15, 39), r.int(12, 39)],
        ([x, y, z]) => (y % 10) + (z % 10) >= 10 && x - y - z >= 5,
      );
      const s = a + b;
      const ctx = r.pick([
        [`${p1}는 $${tt}$쪽짜리 동화책을 어제 $${a}$쪽, 오늘 $${b}$쪽 읽었어요. 남은 쪽은 몇 쪽인가요?`, '쪽'],
        [`과일 가게에 사과가 $${tt}$개 있었어요. 오전에 $${a}$개, 오후에 $${b}$개를 팔았다면 남은 사과는 몇 개인가요?`, '개'],
        [`줄넘기를 $${tt}$번 하기로 했어요. ${p2}가 아침에 $${a}$번, 점심에 $${b}$번 넘었다면 몇 번을 더 넘어야 하나요?`, '번'],
      ]);
      return {
        q: ctx[0],
        answer: { type: 'num', value: tt - s, unit: ctx[1] },
        steps: [`지금까지 한 것: $${a}+${b}=${s}$`, `남은 것: $${tt}-${s}=${tt - s}$ (${ctx[1]})`],
        hint: '먼저 두 번에 한 것을 더해 보세요.',
      };
    },
  },
];

// ───────────────────────── e2a-4 길이 재기
const e2a4: Skill[] = [
  {
    id: 'unit-story',
    title: '길이 이야기 (단위 길이·이어 붙이기)',
    gen(r, level): ProblemDraft {
      const [p] = names(r, 1);
      if (level === 1) {
        const [tool, len] = r.pick([
          ['클립', 3],
          ['지우개', 4],
          ['면봉', 7],
          ['크레파스', 8],
          ['풀', 6],
        ] as [string, number][]);
        const k = r.int(2, 4);
        const obj = r.pick(['연필', '필통', '책', '숟가락']);
        return {
          q: `${tool}의 길이는 $${len}$ cm예요. ${p}가 ${obj}의 길이를 ${J(tool, '으로')} 재었더니 ${tool} $${k}$개의 길이와 같았어요. ${obj}의 길이는 몇 cm인가요?`,
          answer: { type: 'num', value: len * k, unit: 'cm' },
          steps: [`${tool} $${k}$개의 길이는 $${len}$ cm를 $${k}$번 더한 것과 같아요.`, `$${Array(k).fill(len).join('+')}=${len * k}$ (cm)`],
        };
      }
      if (level === 2) {
        if (r.chance(0.5)) {
          const a = r.int(11, 16);
          const b = r.int(2, 9);
          const what = r.pick(['책상의 긴 쪽', '창문의 짧은 쪽', '의자의 높이']);
          return {
            q: `${p}의 한 뼘은 $${a}$ cm예요. ${J(what, '을')} 재었더니 $2$뼘과 $${b}$ cm였어요. ${J(what, '은')} 몇 cm인가요?`,
            answer: { type: 'num', value: 2 * a + b, unit: 'cm' },
            steps: [`$2$뼘: $${a}+${a}=${2 * a}$ (cm)`, `$${2 * a}+${b}=${2 * a + b}$ (cm)`],
          };
        }
        // 어림값은 실제 길이 가까이 (±1~6 cm)
        const real = r.int(12, 30);
        const off = () => r.pick([-1, 1]) * r.int(1, 6);
        const guess = real + off();
        const ps = names(r, 2);
        const g2 = until(() => real + off(), (x) => Math.abs(x - real) !== Math.abs(guess - real));
        const better = Math.abs(guess - real) < Math.abs(g2 - real) ? ps[0] : ps[1];
        return {
          q: `길이가 $${real}$ cm인 리본을 보고 ${J(ps[0], '은')} 약 $${guess}$ cm, ${J(ps[1], '은')} 약 $${g2}$ cm라고 어림했어요. 실제 길이에 더 가깝게 어림한 사람은 누구인가요?`,
          answer: nameChoices(r, better, ps),
          steps: [`${ps[0]}: 실제 길이와 $${Math.abs(guess - real)}$ cm 차이`, `${ps[1]}: 실제 길이와 $${Math.abs(g2 - real)}$ cm 차이`, `차이가 더 작은 ${better}가 더 가깝게 어림했어요.`],
        };
      }
      const a = r.int(12, 30);
      const c = r.chance(0.5) ? a : r.int(10, 30);
      const b = r.int(2, 6);
      const tot = a + c - b;
      return {
        q: a === c
          ? `길이가 $${a}$ cm인 색 테이프 $2$장을 $${b}$ cm만큼 겹쳐서 길게 이어 붙였어요. 이어 붙인 색 테이프 전체의 길이는 몇 cm인가요?`
          : `길이가 $${a}$ cm인 색 테이프와 $${c}$ cm인 색 테이프를 $${b}$ cm만큼 겹쳐서 길게 이어 붙였어요. 이어 붙인 색 테이프 전체의 길이는 몇 cm인가요?`,
        answer: { type: 'num', value: tot, unit: 'cm' },
        steps: [`두 장의 길이를 더해요: $${a}+${c}=${a + c}$ (cm)`, `겹친 부분은 두 번 세었으니 빼요: $${a + c}-${b}=${tot}$ (cm)`],
        hint: '겹친 부분은 한 번만 세어야 해요.',
      };
    },
  },
];

// ───────────────────────── e2a-5 분류하기
const SURVEY: { topic: string; items: string[] }[] = [
  { topic: '좋아하는 운동', items: ['축구', '피구', '줄넘기', '달리기', '수영'] },
  { topic: '좋아하는 과일', items: ['사과', '딸기', '포도', '수박', '귤'] },
  { topic: '좋아하는 계절', items: ['봄', '여름', '가을', '겨울'] },
  { topic: '좋아하는 간식', items: ['떡볶이', '피자', '김밥', '도넛', '과자'] },
  { topic: '키우고 싶은 동물', items: ['강아지', '고양이', '토끼', '햄스터', '물고기'] },
];

const e2a5: Skill[] = [
  {
    id: 'survey-story',
    title: '조사 결과 이야기',
    gen(r, level): ProblemDraft {
      const [p] = names(r, 1);
      const sv = r.pick(SURVEY);
      const k = level === 1 ? 3 : 4;
      const items = r.sample(sv.items, Math.min(k, sv.items.length));
      const cnt = until(
        () => items.map(() => r.int(2, 9)),
        (c) => new Set(c).size === c.length,
      );
      const desc = items.map((x, i) => `${x} $${cnt[i]}$명`).join(', ');
      const lead = `${p}네 반 친구들이 ${J(sv.topic, '을')} 조사했어요.`;
      if (level === 1) {
        const [i, j] = r.sample(range(0, items.length - 1), 2);
        return {
          q: `${lead} ${desc}이었어요. ${J(items[i], '와')} ${J(items[j], '을')} 고른 친구는 모두 몇 명인가요?`,
          answer: { type: 'num', value: cnt[i] + cnt[j], unit: '명' },
          steps: [`${items[i]} $${cnt[i]}$명, ${items[j]} $${cnt[j]}$명`, `$${cnt[i]}+${cnt[j]}=${cnt[i] + cnt[j]}$ (명)`],
        };
      }
      const mx = Math.max(...cnt);
      const mn = Math.min(...cnt);
      if (level === 2) {
        return {
          q: `${lead} ${desc}이었어요. 가장 많은 친구가 고른 것은 가장 적은 친구가 고른 것보다 몇 명 더 많은가요?`,
          answer: { type: 'num', value: mx - mn, unit: '명' },
          steps: [`가장 많은 것: ${items[cnt.indexOf(mx)]} $${mx}$명, 가장 적은 것: ${items[cnt.indexOf(mn)]} $${mn}$명`, `$${mx}-${mn}=${mx - mn}$ (명)`],
        };
      }
      const hide = r.int(0, items.length - 1);
      const tot = cnt.reduce((a, b) => a + b, 0);
      const known = items.map((x, i) => (i === hide ? null : `${x} $${cnt[i]}$명`)).filter(Boolean).join(', ');
      const cmp = until(() => r.int(0, items.length - 1), (j) => j !== hide);
      const more = cnt[hide] > cnt[cmp];
      return {
        q: `${p}네 반 친구 $${tot}$명이 ${J(sv.topic, '을')} 하나씩 골랐어요. ${known}이고, 나머지는 모두 ${J(items[hide], '을')} 골랐어요. ${J(items[hide], '을')} 고른 친구는 ${J(items[cmp], '을')} 고른 친구보다 몇 명 더 ${more ? '많은가요' : '적은가요'}?`,
        answer: { type: 'num', value: Math.abs(cnt[hide] - cnt[cmp]), unit: '명' },
        steps: [`${J(items[hide], '을')} 고른 친구: $${tot}-${cnt.filter((_, i) => i !== hide).join('-')}=${cnt[hide]}$ (명)`, `${items[cmp]}: $${cnt[cmp]}$명`, `$${Math.max(cnt[hide], cnt[cmp])}-${Math.min(cnt[hide], cnt[cmp])}=${Math.abs(cnt[hide] - cnt[cmp])}$ (명)`],
        hint: `먼저 ${J(items[hide], '을')} 고른 친구 수를 구하세요.`,
      };
    },
  },
  {
    id: 'sort-story',
    title: '두 가지 기준으로 분류한 이야기',
    gen(r, level): ProblemDraft {
      const ctx = r.pick([
        { obj: '단추', u: '개', A: ['빨간', '파란'], B: ['구멍이 $2$개인', '구멍이 $4$개인'], Bn: ['구멍 $2$개', '구멍 $4$개'], An: ['빨간색', '파란색'] },
        { obj: '카드', u: '장', A: ['노란', '초록색'], B: ['삼각형 모양인', '사각형 모양인'], Bn: ['삼각형', '사각형'], An: ['노란색', '초록색'] },
        { obj: '블록', u: '개', A: ['큰', '작은'], B: ['빨간색인', '파란색인'], Bn: ['빨간색', '파란색'], An: ['큰 것', '작은 것'] },
      ]);
      const c = [
        [r.int(2, 9), r.int(2, 9)],
        [r.int(2, 9), r.int(2, 9)],
      ];
      const table = [[`${ctx.obj}`, ...ctx.Bn], ...ctx.An.map((a, i) => [a, ...c[i].map((x) => `$${x}$`)])];
      const desc = ctx.A.map((a, i) => `${a} ${J(ctx.obj, '은')} ${ctx.B[0]} 것이 $${c[i][0]}$${ctx.u}, ${ctx.B[1]} 것이 $${c[i][1]}$${ctx.u}`).join('이고, ');
      if (level === 1) {
        const i = r.int(0, 1);
        const v = c[i][0] + c[i][1];
        return {
          q: `상자 안의 ${J(ctx.obj, '을')} 살펴보았어요. ${J(desc, '이에요')}. ${ctx.A[i]} ${J(ctx.obj, '은')} 모두 몇 ${ctx.u}인가요?`,
          answer: { type: 'num', value: v, unit: ctx.u },
          steps: [`${ctx.A[i]} ${ctx.obj}: $${c[i][0]}$${ctx.u}, $${c[i][1]}$${ctx.u}`, `$${c[i][0]}+${c[i][1]}=${v}$ (${ctx.u})`],
        };
      }
      if (level === 2) {
        const j = r.int(0, 1);
        const v = c[0][j] + c[1][j];
        return {
          q: `${J(ctx.obj, '을')} 두 가지 기준으로 분류하여 세었어요. ${ctx.B[j]} ${J(ctx.obj, '은')} 모두 몇 ${ctx.u}인가요?`,
          table,
          answer: { type: 'num', value: v, unit: ctx.u },
          steps: [`${ctx.Bn[j]} 칸의 수를 모두 더해요.`, `$${c[0][j]}+${c[1][j]}=${v}$ (${ctx.u})`],
          hint: '표에서 한 줄(세로)을 따라 더해 보세요.',
        };
      }
      const tot = c[0][0] + c[0][1] + c[1][0] + c[1][1];
      const ra = c[0][0] + c[0][1];
      return {
        q: `${ctx.obj} $${tot}$${ctx.u}${jo(ctx.u, '를')} 분류했어요. ${ctx.A[0]} ${J(ctx.obj, '은')} $${ra}$${ctx.u}이고, ${ctx.A[1]} ${ctx.obj} 중에서 ${ctx.B[0]} ${J(ctx.obj, '은')} $${c[1][0]}$${J(ctx.u, '이에요')}. ${ctx.A[1]} ${ctx.obj} 중에서 ${ctx.B[1]} ${J(ctx.obj, '은')} 몇 ${ctx.u}인가요?`,
        answer: { type: 'num', value: c[1][1], unit: ctx.u },
        steps: [`${ctx.A[1]} ${ctx.obj}: $${tot}-${ra}=${c[1][0] + c[1][1]}$ (${ctx.u})`, `그중 ${ctx.B[1]} 것: $${c[1][0] + c[1][1]}-${c[1][0]}=${c[1][1]}$ (${ctx.u})`],
        hint: `먼저 ${ctx.A[1]} ${ctx.obj}의 수를 구하세요.`,
      };
    },
  },
];

// ───────────────────────── e2a-6 곱셈
const e2a6: Skill[] = [
  {
    id: 'times-story',
    title: '몇의 몇 배 이야기',
    gen(r, level): ProblemDraft {
      const [p1, p2] = names(r, 2);
      const [thing, u] = r.pick(THINGS);
      const a = r.int(2, 5);
      const b = r.int(2, 5);
      if (level === 1) {
        return {
          q: `${p1}는 ${thing} $${a}$${u}${jo(u, '를')} 가지고 있고, ${p2}는 ${p1}의 $${b}$배만큼 가지고 있어요. ${p2}가 가진 ${J(thing, '은')} 몇 ${u}인가요?`,
          answer: { type: 'num', value: a * b, unit: u },
          steps: [`$${a}$의 $${b}$배 → $${a}\\times ${b}$`, `$${Array(b).fill(a).join('+')}=${a * b}$ (${u})`],
        };
      }
      if (level === 2) {
        const ctx = r.pick([
          [`${p1}의 나이는 $${a}$살이고, 삼촌의 나이는 $${a * b}$살이에요. 삼촌의 나이는 ${p1} 나이의 몇 배인가요?`],
          [`빨간 끈은 $${a}$ cm이고, 파란 끈은 $${a * b}$ cm예요. 파란 끈의 길이는 빨간 끈의 몇 배인가요?`],
          [`${p1}는 ${thing}를 $${a}$${u}, ${p2}는 $${a * b}$${u} 가지고 있어요. ${p2}가 가진 ${J(thing, '은')} ${p1}가 가진 것의 몇 배인가요?`],
        ]);
        return {
          q: ctx[0],
          answer: { type: 'num', value: b, unit: '배' },
          steps: [`$${a}$씩 몇 번 더하면 $${a * b}$가 되는지 알아봐요.`, `$${Array(b).fill(a).join('+')}=${a * b}$ → $${a}\\times ${b}=${a * b}$`, `$${b}$배`],
        };
      }
      return {
        q: `${p1}는 ${thing} $${a}$${u}${jo(u, '를')} 가지고 있어요. ${p2}는 ${p1}의 $${b}$배만큼 가지고 있어요. 두 사람이 가진 ${J(thing, '은')} 모두 몇 ${u}인가요?`,
        answer: { type: 'num', value: a + a * b, unit: u },
        steps: [`${p2}: $${a}\\times ${b}=${a * b}$ (${u})`, `두 사람: $${a}+${a * b}=${a + a * b}$ (${u})`],
        hint: `먼저 ${p2}가 가진 수를 구하세요.`,
      };
    },
  },
];

// ───────────────────────── e2b-1 네 자리 수
const e2b1: Skill[] = [
  {
    id: 'money-story',
    title: '돈 이야기 (네 자리 수)',
    gen(r, level): ProblemDraft {
      const ps = names(r, 3);
      if (level === 1) {
        const a = r.int(1, 9);
        const b = r.int(0, 9);
        const c = r.int(0, 9);
        const v = 1000 * a + 100 * b + 10 * c;
        const parts = [`$1000$원짜리 지폐 $${a}$장`, b ? `$100$원짜리 동전 $${b}$개` : '', c ? `$10$원짜리 동전 $${c}$개` : ''].filter(Boolean);
        return {
          q: `${ps[0]}의 지갑에 ${parts.join(', ')}가 있어요. ${ps[0]}가 가진 돈은 모두 얼마인가요?`,
          answer: { type: 'num', value: v, unit: '원' },
          steps: [`천의 자리 $${a}$, 백의 자리 $${b}$, 십의 자리 $${c}$, 일의 자리 $0$`, `${won(v)}`],
        };
      }
      if (level === 2) {
        const a = r.int(1, 7);
        const b = r.int(11, 19);
        const c = r.int(0, 9);
        const v = 1000 * a + 100 * b + 10 * c;
        const toy = r.pick(['장난감', '필통', '공책', '색연필']);
        return {
          q: `${ps[0]}는 $1000$원짜리 지폐 $${a}$장, $100$원짜리 동전 $${b}$개${c ? `, $10$원짜리 동전 $${c}$개` : ''}를 모아 ${J(toy, '을')} 사려고 해요. ${ps[0]}가 모은 돈은 모두 얼마인가요?`,
          answer: { type: 'num', value: v, unit: '원' },
          steps: [`$100$원짜리 $10$개는 $1000$원이에요. $100$원짜리 $${b}$개 → ${won(100 * b)}`, `$1000$원짜리 $${a}$장 → ${won(1000 * a)}`, `모두 ${won(v)}`],
          hint: '100원짜리 10개는 1000원과 같아요.',
        };
      }
      const people = until(
        () =>
          ps.map((_, i) =>
            i === 0 ? [r.int(2, 5), r.int(11, 19), r.int(1, 9)] : [r.int(2, 6), r.int(0, 9), r.int(1, 9)],
          ),
        (pp) => {
          const vs = pp.map(([a, b, c]) => 1000 * a + 100 * b + 10 * c);
          return new Set(vs).size === 3;
        },
      );
      const vs = people.map(([a, b, c]) => 1000 * a + 100 * b + 10 * c);
      const most = r.chance(0.5);
      const target = most ? Math.max(...vs) : Math.min(...vs);
      const ans = ps[vs.indexOf(target)];
      return {
        q: `세 친구가 모은 돈이에요.\n${ps.map((p, i) => `${p}: $1000$원짜리 $${people[i][0]}$장, $100$원짜리 $${people[i][1]}$개, $10$원짜리 $${people[i][2]}$개`).join('\n')}\n돈을 가장 ${most ? '많이' : '적게'} 모은 사람은 누구인가요?`,
        answer: nameChoices(r, ans, ps),
        steps: [ps.map((p, i) => `${p} ${won(vs[i])}`).join(', '), `가장 ${most ? '많은' : '적은'} 돈은 ${won(target)}이니 ${J(ans, '이에요')}.`],
        hint: '100원짜리가 10개보다 많으면 1000원으로 바꾸어 생각해요.',
      };
    },
  },
  {
    id: 'skip-story',
    title: '뛰어 세기 이야기 (네 자리 수)',
    gen(r, level): ProblemDraft {
      const [p] = names(r, 1);
      if (level === 1) {
        const s = r.int(1, 5) * 1000 + r.int(0, 9) * 100;
        const k = r.int(2, 4);
        return {
          q: `${p}의 통장에는 ${won(s)}이 있어요. 다음 달부터 한 달에 $1000$원씩 저금한다면 $${k}$달 뒤에는 얼마가 되나요?`,
          answer: { type: 'num', value: s + 1000 * k, unit: '원' },
          steps: [`$1000$씩 $${k}$번 뛰어 세어요.`, `${range(0, k).map((i) => `$${s + 1000 * i}$`).join(' → ')}`],
        };
      }
      if (level === 2) {
        const k = r.int(3, 6);
        const s = r.int(1, 8) * 1000 + r.int(10 - k + 1, 9) * 100 + r.int(0, 9) * 10;
        const down = r.chance(0.4);
        if (down) {
          const s2 = r.int(2, 9) * 1000 + r.int(0, k - 2) * 100 + r.int(0, 9) * 10;
          return {
            q: `${p}의 저금통에 ${won(s2)}이 있어요. 날마다 $100$원씩 꺼내 쓴다면 $${k}$일 뒤 저금통에 남은 돈은 얼마인가요?`,
            answer: { type: 'num', value: s2 - 100 * k, unit: '원' },
            steps: [`$100$씩 거꾸로 $${k}$번 뛰어 세어요.`, `${range(0, k).map((i) => `$${s2 - 100 * i}$`).join(' → ')}`],
          };
        }
        return {
          q: `${p}네 학교 도서관에는 책이 $${s}$권 있어요. 한 달에 $100$권씩 새 책이 들어온다면 $${k}$달 뒤에 책은 몇 권이 되나요?`,
          answer: { type: 'num', value: s + 100 * k, unit: '권' },
          steps: [`$100$씩 $${k}$번 뛰어 세어요. 백의 자리가 $9$를 넘으면 천의 자리가 $1$ 커져요.`, `${range(0, k).map((i) => `$${s + 100 * i}$`).join(' → ')}`],
        };
      }
      const d = r.pick([10, 100, 1000]);
      const k = r.int(3, 7);
      const s = d === 1000 ? r.int(1, 9 - k) * 1000 + r.int(1, 9) * 100 : d === 100 ? r.int(1, 8) * 1000 + r.int(3, 9) * 100 + r.int(1, 9) * 10 : r.int(1, 8) * 1000 + r.int(0, 9) * 100 + r.int(4, 9) * 10;
      const goal = s + d * k;
      const ctx = r.pick([
        [`${p}의 저금통에는 ${won(s)}이 있어요. 날마다 ${won(d)}씩 넣는다면 저금통의 돈이 ${won(goal)}이 되는 것은 며칠 뒤인가요?`, '일'],
        d === 1000
          ? [`${p}네 마을 도서관에는 책이 $${s}$권 있어요. 해마다 $1000$권씩 새 책을 산다면 책이 $${goal}$권이 되는 것은 몇 년 뒤인가요?`, '년']
          : [`줄넘기 대회에서 지금까지 넘은 횟수의 합계가 $${s}$번이에요. 한 사람이 $${d}$번씩 넘는다면 몇 명이 더 넘어야 합계가 $${goal}$번이 되나요?`, '명'],
      ]);
      return {
        q: ctx[0],
        answer: { type: 'num', value: k, unit: ctx[1] },
        steps: [`$${s}$부터 $${d}$씩 뛰어 세어요.`, `${range(0, k).map((i) => `$${s + d * i}$`).join(' → ')}`, `$${k}$번 뛰어 세었으니 $${k}$${ctx[1]}`],
        hint: `${d}씩 뛰어 세면 어느 자리 숫자가 바뀌는지 보세요.`,
      };
    },
  },
];

// ───────────────────────── e2b-4 시각과 시간
const e2b4: Skill[] = [
  {
    id: 'schedule-story',
    title: '하루 일과 시간 이야기',
    gen(r, level): ProblemDraft {
      const [p] = names(r, 1);
      if (level === 1) {
        const kind = r.int(0, 2);
        if (kind === 0) {
          const m = r.int(1, 11) * 5;
          const [act, actA] = r.pick([
            ['책을 읽었어요', '책을 읽은'],
            ['자전거를 탔어요', '자전거를 탄'],
            ['수영을 했어요', '수영을 한'],
            ['그림을 그렸어요', '그림을 그린'],
          ] as [string, string][]);
          return {
            q: `${p}는 $1$시간 $${m}$분 동안 ${act}. ${p}가 ${actA} 시간은 몇 분인가요?`,
            answer: { type: 'num', value: 60 + m, unit: '분' },
            steps: ['$1$시간 $=60$분', `$1$시간 $${m}$분 $=60$분$+${m}$분$=${60 + m}$분`],
          };
        }
        if (kind === 1) {
          const w = r.int(1, 4);
          return {
            q: `${p}는 방학에 $${w}$주일 동안 할머니 댁에 있었어요. 할머니 댁에 있었던 날은 모두 며칠인가요?`,
            answer: { type: 'num', value: 7 * w, unit: '일' },
            steps: ['$1$주일 $=7$일', `$${w}$주일 $=7\\times ${w}=${7 * w}$일`],
          };
        }
        const h = r.int(1, 12);
        return {
          q: `${p}네 가족은 $1$일 $${h}$시간 동안 캠핑을 했어요. 캠핑을 한 시간은 모두 몇 시간인가요?`,
          answer: { type: 'num', value: 24 + h, unit: '시간' },
          steps: ['$1$일 $=24$시간', `$24+${h}=${24 + h}$ (시간)`],
        };
      }
      if (level === 2) {
        const [sh, sm, d] = until(
          () => [r.int(1, 10), r.int(1, 11) * 5, r.int(3, 11) * 5],
          ([, m, dd]) => m + dd > 60 && m + dd < 120,
        );
        const tot = sh * 60 + sm + d;
        const eh = Math.floor(tot / 60);
        const em = tot % 60;
        const act = r.pick(['축구 경기', '피아노 연습', '미술 수업', '영화']);
        return {
          q: `${J(act, '이')} ${t(sh, sm)}에 시작해서 ${t(eh, em)}에 끝났어요. ${J(act, '은')} 몇 분 동안 했나요?`,
          answer: { type: 'num', value: d, unit: '분' },
          steps: [`${t(sh, sm)} → ${t(eh, 0)}: $${60 - sm}$분`, `${t(eh, 0)} → ${t(eh, em)}: $${em}$분`, `$${60 - sm}+${em}=${d}$ (분)`],
          hint: '먼저 다음 정각까지 몇 분인지 생각해 보세요.',
        };
      }
      const [sh, sm, d1, d2] = until(
        () => [r.int(1, 8), r.int(0, 11) * 5, r.int(3, 9) * 5, r.int(1, 11) * 5],
        ([, m, a, b]) => m + a + b >= 60 && m + a + 60 + b < 240,
      );
      const arrive = sh * 60 + sm + d1;
      const end = arrive + 60 + d2;
      const place = r.pick(['도서관', '수영장', '박물관', '놀이공원']);
      return {
        q: `${p}는 ${t(sh, sm)}에 집에서 출발하여 $${d1}$분 뒤에 ${place}에 도착했어요. ${place}에서 $1$시간 $${d2}$분 동안 있다가 나왔다면, ${place}에서 나온 시각은 몇 시 몇 분인가요?`,
        answer: { type: 'fields', fields: [{ label: '시', value: Math.floor(end / 60) }, { label: '분', value: end % 60 }] },
        steps: [`도착한 시각: ${t(sh, sm)}에서 $${d1}$분 뒤 → ${t(Math.floor(arrive / 60), arrive % 60)}`, `$1$시간 뒤: ${t(Math.floor(arrive / 60) + 1, arrive % 60)}`, `다시 $${d2}$분 뒤: ${t(Math.floor(end / 60), end % 60)}`],
        hint: '먼저 도착한 시각을 구하세요.',
      };
    },
  },
];

// ───────────────────────── e2b-5 표와 그래프
const e2b5: Skill[] = [
  {
    id: 'table-story',
    title: '표를 보고 푸는 이야기',
    gen(r, level): ProblemDraft {
      const [p] = names(r, 1);
      const sv = r.pick(SURVEY);
      const items = r.sample(sv.items, 4);
      const cnt = until(
        () => items.map(() => r.int(2, 9)),
        (c) => new Set(c).size === 4,
      );
      const tot = cnt.reduce((a, b) => a + b, 0);
      const head = [sv.topic.replace('좋아하는 ', '').replace('키우고 싶은 ', ''), ...items, '합계'];
      const lead = `${p}네 반 학생들이 ${J(sv.topic, '을')} 조사하여 표로 나타냈어요.`;
      if (level === 1) {
        const [i, j] = r.sample(range(0, 3), 2);
        const [hi, lo] = cnt[i] > cnt[j] ? [i, j] : [j, i];
        return {
          q: `${lead} ${J(items[hi], '을')} 고른 학생은 ${J(items[lo], '을')} 고른 학생보다 몇 명 더 많은가요?`,
          table: [head, ['학생 수(명)', ...cnt.map((c) => `$${c}$`), `$${tot}$`]],
          answer: { type: 'num', value: cnt[hi] - cnt[lo], unit: '명' },
          steps: [`${items[hi]} $${cnt[hi]}$명, ${items[lo]} $${cnt[lo]}$명`, `$${cnt[hi]}-${cnt[lo]}=${cnt[hi] - cnt[lo]}$ (명)`],
        };
      }
      if (level === 2) {
        const hide = r.int(0, 3);
        const mx = Math.max(...cnt);
        const mn = Math.min(...cnt);
        return {
          q: `${lead} 표의 일부가 찢어져 보이지 않아요. 가장 많은 학생이 고른 것은 가장 적은 학생이 고른 것보다 몇 명 더 많은가요?`,
          table: [head, ['학생 수(명)', ...cnt.map((c, i) => (i === hide ? '$\\square$' : `$${c}$`)), `$${tot}$`]],
          answer: { type: 'num', value: mx - mn, unit: '명' },
          steps: [`${items[hide]}: $${tot}-${cnt.filter((_, i) => i !== hide).join('-')}=${cnt[hide]}$ (명)`, `가장 많은 것 ${items[cnt.indexOf(mx)]} $${mx}$명, 가장 적은 것 ${items[cnt.indexOf(mn)]} $${mn}$명`, `$${mx}-${mn}=${mx - mn}$ (명)`],
          hint: '먼저 보이지 않는 칸의 수를 합계로 구하세요.',
        };
      }
      // 두 칸이 비고, 조건으로 구하기
      const [i, j] = until(
        () => r.sample(range(0, 3), 2),
        ([x, y]) => cnt[x] > cnt[y],
      );
      const d = cnt[i] - cnt[j];
      const rest = tot - cnt[i] - cnt[j];
      return {
        q: `${lead} 표의 ㉠, ㉡ 칸이 비어 있어요. ${J(items[i], '을')} 고른 학생은 ${J(items[j], '을')} 고른 학생보다 $${d}$명 더 많아요. ${J(items[i], '을')} 고른 학생은 몇 명인가요?`,
        table: [head, ['학생 수(명)', ...cnt.map((c, k) => (k === i ? '㉠' : k === j ? '㉡' : `$${c}$`)), `$${tot}$`]],
        answer: { type: 'num', value: cnt[i], unit: '명' },
        steps: [
          `${J(items[i], '와')} ${items[j]}의 합: $${tot}-${cnt.filter((_, k) => k !== i && k !== j).join('-')}=${cnt[i] + cnt[j]}$ (명)`,
          `합이 $${cnt[i] + cnt[j]}$이고 차가 $${d}$인 두 수를 찾아요: $${cnt[i]}+${cnt[j]}=${cnt[i] + cnt[j]}$, $${cnt[i]}-${cnt[j]}=${d}$`,
          `${items[i]}: $${cnt[i]}$명`,
        ],
        hint: `먼저 빈 두 칸의 합을 구하세요. (다른 칸의 합은 $${rest}$명)`,
      };
    },
  },
  {
    id: 'graph-story',
    title: '○ 그래프를 보고 푸는 이야기',
    gen(r, level): ProblemDraft {
      const [p] = names(r, 1);
      const sv = r.pick(SURVEY);
      const items = r.sample(sv.items, 4);
      const cnt = until(
        () => items.map(() => r.int(1, 7)),
        (c) => new Set(c).size >= 3 && c.some((x) => x >= 4),
      );
      const lead = `${p}네 모둠 친구들이 ${J(sv.topic, '을')} 조사하여 ○ 그래프로 나타냈어요.`;
      if (level === 1) {
        const [i, j] = until(
          () => r.sample(range(0, 3), 2),
          ([x, y]) => cnt[x] > cnt[y],
        );
        return {
          q: `${lead} ${J(items[i], '을')} 고른 친구는 ${J(items[j], '을')} 고른 친구보다 몇 명 더 많은가요?`,
          fig: oGraph(items, cnt, { max: 7, unit: '명' }),
          answer: { type: 'num', value: cnt[i] - cnt[j], unit: '명' },
          steps: [`○의 수를 세어요: ${items[i]} $${cnt[i]}$명, ${items[j]} $${cnt[j]}$명`, `$${cnt[i]}-${cnt[j]}=${cnt[i] - cnt[j]}$ (명)`],
        };
      }
      const tot = cnt.reduce((a, b) => a + b, 0);
      if (level === 2) {
        return {
          q: `${lead} 조사한 친구는 모두 몇 명인가요?`,
          fig: oGraph(items, cnt, { max: 7, unit: '명' }),
          answer: { type: 'num', value: tot, unit: '명' },
          steps: [`각각의 ○ 수: ${items.map((x, i) => `${x} $${cnt[i]}$`).join(', ')}`, `$${cnt.join('+')}=${tot}$ (명)`],
        };
      }
      const hide = r.int(0, 3);
      const cmp = until(
        () => r.int(0, 3),
        (j) => j !== hide && cnt[j] !== cnt[hide],
      );
      const more = cnt[hide] > cnt[cmp];
      return {
        q: `${lead} 그런데 ${items[hide]} 칸의 ○가 지워졌어요. 조사한 친구가 모두 $${tot}$명일 때, ${J(items[hide], '을')} 고른 친구는 ${J(items[cmp], '을')} 고른 친구보다 몇 명 더 ${more ? '많은가요' : '적은가요'}?`,
        fig: oGraph(items, cnt.map((c, i) => (i === hide ? 0 : c)), { max: 7, unit: '명' }),
        answer: { type: 'num', value: Math.abs(cnt[hide] - cnt[cmp]), unit: '명' },
        steps: [`${items[hide]}: $${tot}-${cnt.filter((_, i) => i !== hide).join('-')}=${cnt[hide]}$ (명)`, `${items[cmp]}: $${cnt[cmp]}$명`, `$${Math.max(cnt[hide], cnt[cmp])}-${Math.min(cnt[hide], cnt[cmp])}=${Math.abs(cnt[hide] - cnt[cmp])}$ (명)`],
        hint: '먼저 지워진 칸의 친구 수를 구하세요.',
      };
    },
  },
];

// ───────────────────────── e2b-6 규칙 찾기
const e2b6: Skill[] = [
  {
    id: 'grow-story',
    title: '늘어나는 규칙 이야기',
    gen(r, level): ProblemDraft {
      const [p] = names(r, 1);
      const ctx = r.pick([
        { what: '바둑돌', u: '개', verb: '놓았어요', must: '놓아야' },
        { what: '쌓기나무', u: '개', verb: '쌓았어요', must: '쌓아야' },
        { what: '성냥개비', u: '개', verb: '놓았어요', must: '놓아야' },
        { what: '꽃', u: '송이', verb: '심었어요', must: '심어야' },
      ]);
      const a = r.int(1, 5);
      const d = r.int(2, 4);
      const v = (k: number) => a + d * (k - 1);
      const lead = `${p}는 규칙에 따라 ${J(ctx.what, '을')} 첫째에 $${v(1)}$${ctx.u}, 둘째에 $${v(2)}$${ctx.u}, 셋째에 $${v(3)}$${ctx.u} ${ctx.verb}.`;
      if (level === 1) {
        const k = r.int(4, 6);
        return {
          q: `${lead} 같은 규칙으로 놓을 때 ${ORDS[k]}에는 ${J(ctx.what, '을')} 몇 ${ctx.u} ${ctx.must} 하나요?`,
          answer: { type: 'num', value: v(k), unit: ctx.u },
          steps: [`$${d}$${ctx.u}씩 늘어나는 규칙이에요.`, `${range(1, k).map((i) => `$${v(i)}$`).join(' → ')}`, `${ORDS[k]}: $${v(k)}$${ctx.u}`],
        };
      }
      if (level === 2) {
        const k = r.int(6, 10);
        return {
          q: `${lead} 같은 규칙으로 이어 갈 때, ${J(ctx.what, '이')} $${v(k)}$${ctx.u}인 것은 몇째인가요?`,
          answer: makeChoices(r, ORDS[k], [ORDS[k - 1], ORDS[k + 1], ORDS[k - 2], ORDS[Math.min(12, k + 2)]].filter((x) => x && x !== ORDS[k]), 4),
          steps: [`$${d}$${ctx.u}씩 늘어나는 규칙이에요.`, `${range(1, k).map((i) => `${ORDS[i]} $${v(i)}$`).join(', ')}`, `$${v(k)}$${ctx.u}${jo(ctx.u, '는')} ${J(ORDS[k], '이에요')}.`],
          hint: `$${d}$씩 뛰어 세어 보세요.`,
        };
      }
      const k = r.int(4, 5);
      const terms = range(1, k).map(v);
      const s = terms.reduce((x, y) => x + y, 0);
      return {
        q: `${lead} 같은 규칙으로 첫째부터 ${ORDS[k]}까지 모두 만들려면 ${J(ctx.what, '은')} 모두 몇 ${ctx.u} 필요한가요?`,
        answer: { type: 'num', value: s, unit: ctx.u },
        steps: [`$${d}$${ctx.u}씩 늘어나요: ${terms.map((x) => `$${x}$`).join(', ')}`, `$${terms.join('+')}=${s}$ (${ctx.u})`],
        hint: `먼저 ${k === 4 ? '넷째' : '넷째, 다섯째'}에 필요한 수를 구하세요.`,
      };
    },
  },
];

export const WORDS_2: Record<string, Skill[]> = {
  'e2a-1': e2a1,
  'e2a-2': e2a2,
  'e2a-3': e2a3,
  'e2a-4': e2a4,
  'e2a-5': e2a5,
  'e2a-6': e2a6,
  'e2b-1': e2b1,
  'e2b-4': e2b4,
  'e2b-5': e2b5,
  'e2b-6': e2b6,
};
