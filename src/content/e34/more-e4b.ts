// e4b 심화 추가분 (v0.11): 단원마다 심화 유형 3개 + 최상위 2개
import type { AnswerSpec, Skill } from '../../core/types';
import { Svg, lineChart } from '../../core/fig';
import { J, josa, c, d as dd, fr, mx, nm, pick2Names, pickName, polyFig, polyFromAngles } from './util';
import { boxes, geoFig, perms, sum, until } from './hardutil';
import type { Pt } from './hardutil';

// ═════════════ 공용 도우미 ═════════════
/** 분모를 소수(素數)로만 써서 약분할 일이 생기지 않게 함 (초4는 약분을 배우지 않음) */
const PR = [7, 11, 13];
/** 분자 n / 분모 den → 자연수·진분수·대분수 TeX */
const fx = (n: number, den: number) => (n % den === 0 ? String(n / den) : n > den ? mx(n, den) : fr(n, den));
function fa(n: number, den: number, unit?: string): AnswerSpec {
  return {
    type: 'num',
    value: n / den,
    display: n % den === 0 ? 'int' : n > den ? 'mixed' : 'frac',
    ...(unit ? { unit } : {}),
  };
}
/** 천분의 일 단위 정수 → 소수 TeX */
const D = (milli: number) => dd(milli / 1000);
/** 천분의 일 단위 정수 → 그림 글자 */
const Dt = (milli: number) => String(Math.round(milli) / 1000);
const dAns = (milli: number, unit?: string): AnswerSpec => ({
  type: 'num',
  value: Math.round(milli) / 1000,
  display: 'dec',
  ...(unit ? { unit } : {}),
});
const DIG = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const num = (ds: number[]) => ds.reduce((a, b) => a * 10 + b, 0);
const deg = (x: number) => `${x}^{\\circ}`;
const rad = (x: number) => (x * Math.PI) / 180;
const tri = (n: number) => (n * (n + 1)) / 2;
const POLY: Record<number, string> = {
  3: '삼각형',
  4: '사각형',
  5: '오각형',
  6: '육각형',
  7: '칠각형',
  8: '팔각형',
  9: '구각형',
  10: '십각형',
  11: '십일각형',
  12: '십이각형',
  13: '십삼각형',
  14: '십사각형',
  15: '십오각형',
  16: '십육각형',
};
const KN = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ'];
/** 두 직선 p + t·d1, q + u·d2 의 교점 */
function inter(p: Pt, d1: Pt, q: Pt, d2: Pt): Pt {
  const det = d1[0] * -d2[1] - d1[1] * -d2[0];
  const t = ((q[0] - p[0]) * -d2[1] - (q[1] - p[1]) * -d2[0]) / det;
  return [p[0] + t * d1[0], p[1] + t * d1[1]];
}
const dir = (a: number): Pt => [Math.cos(rad(a)), Math.sin(rad(a))];

// ═════════════ e4b-1 분수의 덧셈과 뺄셈 ═════════════
const E4B1: Skill[] = [
  {
    id: 'frac-sum-cases',
    title: '합이 정해진 진분수 고르기 (경우의 수)',
    gen(r, level) {
      if (level === 1) {
        const den = r.pick(PR);
        const S = r.int(5, den - 1);
        const pairs: [number, number][] = [];
        for (let b = 1; b < S - b; b++) pairs.push([S - b, b]);
        return {
          q: `분모가 $${den}$인 두 진분수의 합이 $${fr(S, den)}$입니다. $$\\frac{\\square}{${den}}+\\frac{\\triangle}{${den}}=${fr(S, den)}$$ □ 안의 수가 △ 안의 수보다 클 때, (□, △)가 될 수 있는 경우는 모두 몇 가지인가요?`,
          answer: { type: 'num', value: pairs.length, unit: '가지' },
          steps: [
            `분모가 같으니 분자끼리 더해요: □ $+$ △ $=${S}$`,
            `△에 $1$, $2$, … 를 차례로 넣어 (□, △)를 쓰면 ${pairs.map(([a, b]) => `$(${a},${b})$`).join(', ')}`,
            `모두 $${pairs.length}$가지`,
          ],
          hint: '△에 1부터 차례로 넣어 보세요.',
        };
      }
      if (level === 2) {
        const den = r.pick(PR);
        const { S, pairs } = until(
          () => {
            const S = den + r.int(1, den - 3);
            const pairs: [number, number][] = [];
            for (let a = den - 1; a > S - a; a--) pairs.push([a, S - a]);
            return { S, pairs };
          },
          (x) => x.pairs.length >= 2,
        );
        return {
          q: `분모가 $${den}$인 서로 다른 두 진분수를 더했더니 $${mx(S, den)}$가 되었습니다. 더한 두 진분수를 고르는 방법은 모두 몇 가지인가요? (더하는 순서만 바꾼 것은 한 가지로 셉니다.)`,
          answer: { type: 'num', value: pairs.length, unit: '가지' },
          steps: [
            `$${mx(S, den)}=${fr(S, den)}$이므로 두 분자의 합은 $${S}$${josa(S, '이에요/예요')}.`,
            `진분수의 분자는 $${den - 1}$보다 클 수 없어요. 큰 분자를 $${den - 1}$부터 차례로 줄여 보면 ${pairs.map(([a, b]) => `$${fr(a, den)}+${fr(b, den)}$`).join(', ')}`,
            `모두 $${pairs.length}$가지`,
          ],
          hint: '대분수를 가분수로 바꾸어 분자의 합을 먼저 구해요.',
        };
      }
      const den = r.pick([7, 11]);
      const { S, tr } = until(
        () => {
          const S = r.int(6, 3 * den - 6);
          const tr: number[][] = [];
          for (let a = 1; a < den; a++) for (let b = a + 1; b < den; b++) for (let cc = b + 1; cc < den; cc++) if (a + b + cc === S) tr.push([a, b, cc]);
          return { S, tr };
        },
        (x) => x.tr.length >= 3 && x.tr.length <= 10,
      );
      const firsts = [...new Set(tr.map((t) => t[0]))];
      return {
        q: `분모가 $${den}$인 서로 다른 진분수 $3$개를 더했더니 $${fx(S, den)}$가 되었습니다. 이 세 진분수를 고르는 방법은 모두 몇 가지인가요? (고르는 순서는 생각하지 않습니다.)`,
        answer: { type: 'num', value: tr.length, unit: '가지' },
        steps: [
          `세 분자의 합은 $${S}$이고, 분자는 $1$부터 $${den - 1}$까지의 서로 다른 수예요. 분자를 작은 것부터 (가장 작은 수, 중간 수, 가장 큰 수)로 써요.`,
          ...firsts.map((f) => {
            const g = tr.filter((t) => t[0] === f);
            return `가장 작은 분자가 $${f}$일 때: ${g.map((t) => `$(${t.join(',')})$`).join(', ')} → $${g.length}$가지`;
          }),
          `모두 $${tr.length}$가지`,
        ],
        hint: '가장 작은 분자를 1, 2, 3, … 으로 정해 놓고 나머지 두 분자를 찾아요.',
      };
    },
  },
  {
    id: 'frac-reverse',
    title: '거꾸로 생각하여 처음 양 구하기 (분수)',
    gen(r, level) {
      const den = r.pick(PR);
      const ok = (n: number) => n % den !== 0;
      if (level === 1) {
        const subFirst = r.chance(0.5);
        const { x, A, B } = until(
          () => ({ x: r.int(den + 1, 4 * den), A: r.int(den + 1, 3 * den), B: r.int(den + 1, 3 * den) }),
          (v) => ok(v.x) && ok(v.A) && ok(v.B) && v.A !== v.B && ok(v.x + v.A - v.B) && v.x + v.A - v.B > den && (!subFirst || v.x - v.B > 0),
        );
        const R = x + A - B;
        if (!subFirst)
          return {
            q: `어떤 수에 $${mx(A, den)}$를 더한 다음 $${mx(B, den)}$를 뺐더니 $${mx(R, den)}$가 되었습니다. 어떤 수를 구하세요.`,
            answer: fa(x, den),
            steps: [
              `거꾸로 생각해요: $${mx(R, den)}$에 $${mx(B, den)}$를 더한 다음 $${mx(A, den)}$를 빼면 어떤 수가 나와요.`,
              `$${mx(R, den)}+${mx(B, den)}=${fx(R + B, den)}$`,
              `$${fx(R + B, den)}-${mx(A, den)}=${fx(x, den)}$`,
            ],
          };
        return {
          q: `어떤 수에서 $${mx(B, den)}$를 뺀 다음 $${mx(A, den)}$를 더했더니 $${mx(R, den)}$가 되었습니다. 어떤 수를 구하세요.`,
          answer: fa(x, den),
          steps: [
            `거꾸로 생각해요: $${mx(R, den)}$에서 $${mx(A, den)}$를 뺀 다음 $${mx(B, den)}$를 더하면 어떤 수가 나와요.`,
            `$${mx(R, den)}-${mx(A, den)}=${fx(R - A, den)}$`,
            `$${fx(R - A, den)}+${mx(B, den)}=${fx(x, den)}$`,
          ],
        };
      }
      if (level === 2) {
        const ctx = r.int(0, 2);
        const name = pickName(r);
        const { x, A, B, C } = until(
          () => ({ x: r.int(3 * den + 1, 6 * den), A: r.int(den + 1, 3 * den), B: r.int(den + 1, 3 * den), C: r.int(den + 1, 3 * den) }),
          (v) => new Set([v.A, v.B, v.C]).size === 3 && [v.x, v.A, v.B, v.C, v.x - v.A, v.x - v.A + v.B, v.x - v.A + v.B - v.C].every(ok) && v.x - v.A + v.B - v.C > 0 && v.x - v.A > 0,
        );
        const R = x - A + B - C;
        const m = (n: number) => mx(n, den);
        const u = ['L', 'm', 'kg'][ctx];
        const q = [
          `물통에 물이 들어 있었습니다. 아침에 $${m(A)}$ L를 쓰고, 낮에 $${m(B)}$ L를 더 채운 다음, 저녁에 $${m(C)}$ L를 썼더니 $${m(R)}$ L가 남았습니다. 처음 물통에 들어 있던 물은 몇 L인가요?`,
          `${nm(name)}는 리본을 가지고 있었습니다. 선물을 포장하는 데 $${m(A)}$ m를 쓰고, 친구에게서 $${m(B)}$ m를 받은 다음, 머리띠를 만드는 데 $${m(C)}$ m를 썼더니 $${m(R)}$ m가 남았습니다. 처음에 가지고 있던 리본은 몇 m인가요?`,
          `빵집에 밀가루가 있었습니다. 빵을 만드는 데 $${m(A)}$ kg을 쓰고, 새로 $${m(B)}$ kg을 사 온 다음, 과자를 만드는 데 $${m(C)}$ kg을 썼더니 $${m(R)}$ kg이 남았습니다. 처음에 있던 밀가루는 몇 kg인가요?`,
        ][ctx];
        return {
          q,
          answer: fa(x, den, u),
          steps: [
            '남은 양에서 거꾸로 거슬러 올라가요: 쓴 양은 더하고, 받은(채운) 양은 빼요.',
            `마지막에 쓰기 전: $${m(R)}+${m(C)}=${m(R + C)}$`,
            `중간에 받기(채우기) 전: $${m(R + C)}-${m(B)}=${m(x - A)}$`,
            `처음: $${m(x - A)}+${m(A)}=${fx(x, den)}$ (${u})`,
          ],
          hint: '맨 마지막 일부터 거꾸로 되돌려 보세요.',
        };
      }
      const [n1, n2] = pick2Names(r);
      const askDiff = r.chance(0.6);
      const { x1, x2, a, b } = until(
        () => ({ x1: r.int(2 * den + 1, 6 * den), x2: r.int(den + 1, 5 * den), a: r.int(den + 1, 2 * den), b: r.int(den + 1, 3 * den) }),
        (v) => [v.x1, v.x2, v.a, v.b, v.x1 - v.a, v.x2 + v.a, v.x2 + v.a - v.b, v.x1 - v.x2].every((t) => ok(Math.abs(t))) && v.x1 - v.a > 0 && v.x2 + v.a - v.b > 0 && v.x1 !== v.x2,
      );
      const p = x1 - a,
        q = x2 + a - b;
      const m = (n: number) => mx(n, den);
      const hi = Math.max(x1, x2),
        lo = Math.min(x1, x2);
      return {
        q: `${n1}와 ${n2}가 끈을 가지고 있었습니다. ${nm(n1)}가 ${n2}에게 끈 $${m(a)}$ m를 주었고, 그다음 ${nm(n2)}는 가지고 있던 끈 중에서 $${m(b)}$ m를 사용했습니다. 그랬더니 ${n1}의 끈은 $${m(p)}$ m, ${n2}의 끈은 $${m(q)}$ m가 되었습니다. ${askDiff ? '처음에 두 사람이 가지고 있던 끈의 길이의 차는 몇 m인가요?' : `${nm(n2)}가 처음에 가지고 있던 끈은 몇 m인가요?`}`,
        answer: fa(askDiff ? hi - lo : x2, den, 'm'),
        steps: [
          `${n1}의 처음 끈: 준 만큼 다시 더해요 → $${m(p)}+${m(a)}=${m(x1)}$ (m)`,
          `${n2}의 끈: 사용하기 전 $${m(q)}+${m(b)}=${m(x2 + a)}$ (m)`,
          `${n2}의 처음 끈: 받은 만큼 빼요 → $${m(x2 + a)}-${m(a)}=${m(x2)}$ (m)`,
          ...(askDiff ? [`차: $${m(hi)}-${m(lo)}=${fx(hi - lo, den)}$ (m)`] : []),
        ],
        hint: '두 사람의 끈을 따로따로 거꾸로 되돌려 보세요.',
      };
    },
  },
  {
    id: 'frac-ineq',
    title: '분수의 크기 비교 — □ 안에 들어갈 수 있는 자연수',
    gen(r, level) {
      const den = r.pick(PR);
      if (level === 1) {
        const sub = r.chance(0.5);
        const { a, T } = until(
          () => ({ a: r.int(1, 2 * den - 2), T: r.int(4, 2 * den + 4) }),
          (v) => v.a % den !== 0 && v.T % den !== 0 && v.T - v.a - 1 >= 2 && v.T - v.a - 1 <= 12,
        );
        const cnt = T - a - 1;
        const eq = sub ? `${fx(T, den)}-\\frac{\\square}{${den}}>${fx(a, den)}` : `\\frac{\\square}{${den}}+${fx(a, den)}<${fx(T, den)}`;
        return {
          q: `□ 안에 들어갈 수 있는 자연수는 모두 몇 개인가요? $$${eq}$$`,
          answer: { type: 'num', value: cnt, unit: '개' },
          steps: [
            sub ? `분모가 같으니 분자끼리 비교해요: $${T}-$□ $>${a}$` : `분모가 같으니 분자끼리 비교해요: □ $+${a}<${T}$`,
            `□ $<${T - a}$이므로 □는 $1$부터 $${cnt}$까지`,
            `모두 $${cnt}$개`,
          ],
          hint: '대분수는 가분수로 바꾸어 분자끼리 비교해요.',
        };
      }
      if (level === 2) {
        const whole = r.chance(0.5);
        if (!whole) {
          // W □/den + a/den < T/den, □ 는 1~den-1
          const { W, a, T, list } = until(
            () => {
              const W = r.int(1, 3),
                a = r.int(den + 1, 3 * den),
                T = r.int((W + 1) * den + a - den + 2, (W + 1) * den + a - 2);
              const list: number[] = [];
              for (let s = 1; s < den; s++) if (W * den + s + a < T) list.push(s);
              return { W, a, T, list };
            },
            (v) => v.a % den !== 0 && v.T % den !== 0 && v.list.length >= 2 && v.list.length <= den - 2,
          );
          const top = list[list.length - 1];
          return {
            q: `□ 안에 들어갈 수 있는 자연수는 모두 몇 개인가요? $$${W}\\frac{\\square}{${den}}+${fx(a, den)}<${fx(T, den)}$$`,
            answer: { type: 'num', value: list.length, unit: '개' },
            steps: [
              `□는 대분수의 분자이므로 $1$부터 $${den - 1}$까지의 수예요.`,
              `$${W}\\frac{\\square}{${den}}=\\frac{${W * den}+\\square}{${den}}$이므로 분자끼리: $${W * den}+$□$+${a}<${T}$`,
              `□ $<${T - W * den - a}$ → □는 $1$부터 $${top}$까지`,
              `모두 $${list.length}$개`,
            ],
            hint: '대분수의 분자는 분모보다 작아야 해요.',
          };
        }
        // □ k/den + a/den < T/den, □ 는 자연수 부분
        const { k, a, T, list } = until(
          () => {
            const k = r.int(1, den - 1),
              a = r.int(den + 1, 3 * den),
              T = r.int(a + 3 * den, a + 7 * den);
            const list: number[] = [];
            for (let s = 1; s < 20; s++) if (s * den + k + a < T) list.push(s);
            return { k, a, T, list };
          },
          (v) => v.a % den !== 0 && v.T % den !== 0 && (v.T - v.a) % den !== 0 && v.list.length >= 2,
        );
        const top = list[list.length - 1];
        const rest = T - a;
        return {
          q: `□ 안에 들어갈 수 있는 자연수는 모두 몇 개인가요? $$\\square${fr(k, den)}+${fx(a, den)}<${fx(T, den)}$$`,
          answer: { type: 'num', value: list.length, unit: '개' },
          steps: [
            `$${fx(T, den)}-${fx(a, den)}=${fx(rest, den)}$이므로 $\\square${fr(k, den)}<${fx(rest, den)}$이어야 해요.`,
            `□ $=${top}$이면 $${top}${fr(k, den)}<${fx(rest, den)}$이지만, □ $=${top + 1}$이면 $${top + 1}${fr(k, den)}${(top + 1) * den + k === rest ? '=' : '>'}${fx(rest, den)}$가 되어 조건에 맞지 않아요.`,
            `□는 $1$부터 $${top}$까지 → 모두 $${list.length}$개`,
          ],
          hint: '자연수 부분이 클수록 큰 대분수예요.',
        };
      }
      const askSum = r.chance(0.5);
      const { lo, hi, a, b } = until(
        () => {
          const lo = r.int(3, 2 * den),
            cnt = r.int(2, 7);
          return { lo, hi: lo + cnt - 1, a: r.int(1, 2 * den), b: r.int(1, den - 1) };
        },
        (v) => v.a % den !== 0 && v.lo - 1 - v.b >= 1 && (v.hi + v.a + 1) % den !== 0 && (v.lo - 1 - v.b) % den !== 0,
      );
      const T1 = hi + a + 1,
        T2 = lo - 1 - b;
      const list = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
      return {
        q: `다음 두 식을 모두 만족하는 자연수 □${askSum ? '를 모두 더하면 얼마인가요?' : '는 모두 몇 개인가요?'}\n① $\\frac{\\square}{${den}}+${fx(a, den)}<${fx(T1, den)}$\n② $\\frac{\\square}{${den}}-${fr(b, den)}>${fx(T2, den)}$`,
        answer: askSum ? { type: 'num', value: sum(list) } : { type: 'num', value: list.length, unit: '개' },
        steps: [
          `①: 분자끼리 □ $+${a}<${T1}$ → □ $<${T1 - a}$`,
          `②: 분자끼리 □ $-${b}>${T2}$ → □ $>${T2 + b}$`,
          `두 조건을 모두 만족하는 □: ${list.map((v) => `$${v}$`).join(', ')}`,
          askSum ? `합: $${list.join('+')}=${sum(list)}$` : `모두 $${list.length}$개`,
        ],
        hint: '두 식을 따로 풀어 □의 범위를 구한 다음 겹치는 부분을 찾아요.',
      };
    },
  },
];

const TOP_E4B1: Skill[] = [
  {
    id: 'top-tape-overlap',
    title: '겹쳐 이은 색 테이프의 장수와 겹친 길이 (분수)',
    gen(r) {
      const den = r.pick(PR);
      const kind = r.pick(['n', 'n', 'ring', 'over'] as const);
      const A = until(
        () => r.int(den + 1, 3 * den),
        (v) => v % den !== 0,
      );
      const B = r.int(1, Math.max(1, Math.min(den - 1, Math.floor(A / 3))));
      const n = r.int(6, 15);
      const f = (v: number) => fx(v, den);
      if (kind === 'n') {
        const L = n * A - (n - 1) * B;
        return {
          q: `길이가 $${mx(A, den)}$ m인 색 테이프 여러 장을 $${fr(B, den)}$ m씩 겹치게 한 줄로 이어 붙였더니 전체 길이가 $${f(L)}$ m가 되었습니다. 이어 붙인 색 테이프는 모두 몇 장인가요?`,
          answer: { type: 'num', value: n, unit: '장' },
          steps: [
            `색 테이프 $1$장의 길이는 $${mx(A, den)}=${fr(A, den)}$ (m)예요.`,
            `한 장을 더 이을 때마다 겹친 만큼 덜 늘어나서 전체 길이는 $${f(A)}-${fr(B, den)}=${f(A - B)}$ (m)씩 늘어나요.`,
            `첫 장을 빼고 늘어난 길이: $${f(L)}-${f(A)}=${f(L - A)}$ (m)`,
            `$${f(L - A)}$는 $${fr(1, den)}$이 $${L - A}$개, $${f(A - B)}$는 $${fr(1, den)}$이 $${A - B}$개예요.`,
            `$${L - A}\\div${A - B}=${n - 1}$ → 첫 장 뒤에 $${n - 1}$장을 더 이었어요.`,
            `모두 $${n - 1}+1=${n}$ (장)`,
          ],
          hint: '첫 장을 뺀 나머지 장은 한 장마다 얼마씩 길이를 늘리는지 생각해 보세요.',
        };
      }
      if (kind === 'ring') {
        const L = n * (A - B);
        return {
          q: `길이가 $${mx(A, den)}$ m인 색 테이프 여러 장을 $${fr(B, den)}$ m씩 겹치게 이어 붙여 둥근 고리 모양을 만들었더니 고리의 둘레가 $${f(L)}$ m가 되었습니다. 이어 붙인 색 테이프는 모두 몇 장인가요?`,
          answer: { type: 'num', value: n, unit: '장' },
          steps: [
            '고리 모양으로 이으면 마지막 장이 첫 장과도 겹쳐요. 그래서 겹친 곳의 수가 장수와 같아요.',
            `한 장마다 겹친 부분을 뺀 $${f(A)}-${fr(B, den)}=${f(A - B)}$ (m)씩 둘레가 돼요.`,
            `둘레 $${f(L)}$는 $${fr(1, den)}$이 $${L}$개, $${f(A - B)}$는 $${fr(1, den)}$이 $${A - B}$개예요.`,
            `$${L}\\div${A - B}=${n}$`,
            `한 줄로 이을 때와 달리 겹친 곳이 한 군데 더 많다는 점에 주의해요.`,
            `답: $${n}$장`,
          ],
          hint: '고리 모양에서 겹친 곳은 몇 군데인지 세어 보세요.',
        };
      }
      const L = n * A - (n - 1) * B;
      return {
        q: `길이가 $${mx(A, den)}$ m인 색 테이프 $${n}$장을 같은 길이만큼씩 겹치게 한 줄로 이어 붙였더니 전체 길이가 $${f(L)}$ m가 되었습니다. 몇 m씩 겹치게 이어 붙였나요?`,
        answer: fa(B, den, 'm'),
        steps: [
          `겹치지 않게 이었다면 $${mx(A, den)}$를 $${n}$번 더한 $${f(n * A)}$ (m)가 돼요.`,
          `실제 길이와의 차 $${f(n * A)}-${f(L)}=${f(n * A - L)}$ (m)가 겹친 부분의 길이를 모두 더한 것이에요.`,
          `$${n}$장을 한 줄로 이으면 겹친 곳은 $${n - 1}$군데예요.`,
          `$${f(n * A - L)}$는 $${fr(1, den)}$이 $${n * A - L}$개 → $${n * A - L}\\div${n - 1}=${B}$`,
          `한 군데에 $${fr(B, den)}$ m씩 겹쳤어요.`,
        ],
        hint: '겹치지 않았을 때의 길이와 비교해 보세요.',
      };
    },
  },
  {
    id: 'top-frac-op-reverse',
    title: '약속 기호로 거꾸로 계산하기 (분수)',
    gen(r) {
      const den = r.pick(PR);
      const type = r.int(1, 3);
      const ok = (n: number) => n % den !== 0;
      const f2 = (p: number, q: number, K: number) => (type === 1 ? p + q - K : type === 2 ? p - q + K : 2 * p - q);
      const { x, A, B, K, m, R } = until(
        () => {
          const x = r.int(den + 1, 4 * den),
            A = r.int(den + 1, 3 * den),
            B = r.int(den + 1, 3 * den),
            K = r.int(den + 1, 2 * den);
          const m = f2(x, A, K);
          const R = f2(m, B, K);
          return { x, A, B, K, m, R };
        },
        (v) =>
          [v.x, v.A, v.B, v.K, v.m, v.R].every(ok) &&
          v.m > 0 &&
          v.R > 0 &&
          (type !== 2 || (v.x > v.A && v.m > v.B)) &&
          (type !== 1 || (v.x + v.A > v.K && v.m + v.B > v.K)) &&
          (type !== 3 || (2 * v.x > v.A && 2 * v.m > v.B)),
      );
      const M = (n: number) => mx(n, den);
      const rule = type === 1 ? `\\text{가}+\\text{나}-${M(K)}` : type === 2 ? `\\text{가}-\\text{나}+${M(K)}` : `\\text{가}+\\text{가}-\\text{나}`;
      const s2 =
        type === 1
          ? `약속대로 쓰면 ◇ $+${M(B)}-${M(K)}=${M(R)}$ → ◇ $=${M(R)}+${M(K)}-${M(B)}=${fx(m, den)}$`
          : type === 2
            ? `약속대로 쓰면 ◇ $-${M(B)}+${M(K)}=${M(R)}$ → ◇ $=${M(R)}+${M(B)}-${M(K)}=${fx(m, den)}$`
            : `약속대로 쓰면 ◇ $+$ ◇ $-${M(B)}=${M(R)}$ → ◇ $+$ ◇ $=${M(R)}+${M(B)}=${fx(R + B, den)}$ → 분자를 반으로 나누면 ◇ $=${fx(m, den)}$`;
      const s4 =
        type === 1
          ? `□ $+${M(A)}-${M(K)}=${fx(m, den)}$ → □ $=${fx(m, den)}+${M(K)}-${M(A)}=${fx(x, den)}$`
          : type === 2
            ? `□ $-${M(A)}+${M(K)}=${fx(m, den)}$ → □ $=${fx(m, den)}+${M(A)}-${M(K)}=${fx(x, den)}$`
            : `□ $+$ □ $-${M(A)}=${fx(m, den)}$ → □ $+$ □ $=${fx(m + A, den)}$ → □ $=${fx(x, den)}$`;
      return {
        q: `두 수 가, 나에 대하여 약속 기호 ★을 다음과 같이 정합니다. $$\\text{가}\\star\\text{나}=${rule}$$ $(\\square\\star${M(A)})\\star${M(B)}=${M(R)}$일 때, □ 안에 알맞은 수를 구하세요.`,
        answer: fa(x, den),
        steps: [
          `($\\square\\star${M(A)}$)의 값을 ◇라 하면 ◇ $\\star\\,${M(B)}=${M(R)}$가 돼요.`,
          s2,
          `이제 $\\square\\star${M(A)}=${fx(m, den)}$를 풀어요.`,
          s4,
          `확인: $${fx(x, den)}\\star${M(A)}=${fx(m, den)}$, $${fx(m, den)}\\star${M(B)}=${M(R)}$ (맞아요)`,
          `답: $${fx(x, den)}$`,
        ],
        hint: '괄호 안을 한 덩어리로 보고 바깥쪽부터 거꾸로 풀어요.',
      };
    },
  },
];

// ═════════════ e4b-2 삼각형 ═════════════
const triUp = (n: number, k: number) => (k <= n ? ((n - k + 1) * (n - k + 2)) / 2 : 0);
const triDown = (n: number, k: number) => {
  const m = n - 2 * k + 1;
  return m >= 1 ? (m * (m + 1)) / 2 : 0;
};
const triTotal = (n: number) => sum(Array.from({ length: n }, (_, i) => triUp(n, i + 1) + triDown(n, i + 1)));
/** 작은 정삼각형 n줄로 만든 큰 정삼각형 */
function triGridFig(n: number, W = 220, H = 180): string {
  const pad = 14;
  const side = Math.min((W - 2 * pad) / n, (H - 2 * pad) / (n * 0.866));
  const h = (side * Math.sqrt(3)) / 2;
  const cx = W / 2,
    top = (H - n * h) / 2;
  const s = new Svg(W, H);
  for (let rr = 0; rr < n; rr++)
    for (let j = 0; j <= rr; j++) {
      const x = cx + (j - rr / 2) * side,
        y = top + rr * h;
      s.poly(
        [
          [x, y],
          [x - side / 2, y + h],
          [x + side / 2, y + h],
        ],
        { cls: 'acc' },
      );
    }
  return s.toString();
}

const E4B2: Skill[] = [
  {
    id: 'eq-grid-count',
    title: '정삼각형 모눈에서 크고 작은 정삼각형 세기',
    gen(r, level) {
      const n = level === 1 ? r.pick([2, 3]) : level === 2 ? r.pick([3, 4]) : r.pick([4, 5]);
      type Ask = 'small' | 'total' | 'up' | 'down' | 'size2' | 'big';
      const ask: Ask = r.pick((level === 1 ? ['small', 'total', 'up'] : level === 2 ? ['total', 'up', 'down', 'size2'] : ['total', 'down', 'big']) as Ask[]);
      const rows = Array.from({ length: n }, (_, i) => ({ k: i + 1, u: triUp(n, i + 1), dn: triDown(n, i + 1) }));
      const val: Record<Ask, number> = {
        small: n * n,
        total: sum(rows.map((x) => x.u + x.dn)),
        up: sum(rows.map((x) => x.u)),
        down: sum(rows.map((x) => x.dn)),
        size2: rows[1].u + rows[1].dn,
        big: sum(rows.slice(1).map((x) => x.u + x.dn)),
      };
      const askT: Record<Ask, string> = {
        small: '가장 작은 정삼각형은 모두 몇 개인가요?',
        total: '그림에서 찾을 수 있는 크고 작은 정삼각형은 모두 몇 개인가요?',
        up: '그림에서 찾을 수 있는 크고 작은 정삼각형 중에서 꼭짓점 하나가 위쪽을 향하는 것(큰 정삼각형 포함)은 모두 몇 개인가요?',
        down: '그림에서 찾을 수 있는 크고 작은 정삼각형 중에서 꼭짓점 하나가 아래쪽을 향하는 것은 모두 몇 개인가요?',
        size2: '가장 작은 정삼각형 $4$개로 이루어진 정삼각형은 모두 몇 개인가요?',
        big: '가장 작은 정삼각형 여러 개로 이루어진 정삼각형(가장 작은 정삼각형 하나짜리는 빼고)은 모두 몇 개인가요?',
      };
      let steps: string[];
      if (ask === 'small') {
        const odd = Array.from({ length: n }, (_, i) => 2 * i + 1);
        steps = [`위에서부터 한 줄에 ${odd.map((v) => `$${v}$`).join(', ')}개씩 있어요.`, `$${odd.join('+')}=${n * n}$ (개)`];
      } else {
        const use = ask === 'size2' ? rows.slice(1, 2) : ask === 'big' ? rows.slice(1) : rows;
        steps = use.map((x) =>
          ask === 'up'
            ? `작은 정삼각형 $${x.k * x.k}$개짜리: 위쪽을 향한 것 $${x.u}$개`
            : ask === 'down'
              ? `작은 정삼각형 $${x.k * x.k}$개짜리: 아래쪽을 향한 것 $${x.dn}$개`
              : `작은 정삼각형 $${x.k * x.k}$개짜리: 위쪽을 향한 것 $${x.u}$개${x.dn ? `, 아래쪽을 향한 것 $${x.dn}$개` : ' (아래쪽을 향한 것은 없어요)'}`,
        );
        if (ask === 'down') steps = steps.filter((_, i) => use[i].dn > 0);
        steps.push(`모두 $${val[ask]}$개`);
      }
      return {
        q: `그림은 크기가 같은 작은 정삼각형을 이어 붙여 큰 정삼각형을 만든 것입니다. ${askT[ask]}`,
        fig: triGridFig(n),
        answer: { type: 'num', value: val[ask], unit: '개' },
        steps,
        hint: '작은 정삼각형 1개짜리, 4개짜리, 9개짜리, … 로 크기를 나누고, 위로 향한 것과 아래로 향한 것을 따로 세요.',
      };
    },
  },
  {
    id: 'fold-equilateral',
    title: '정삼각형 모양 종이를 접었을 때의 각',
    gen(r, level) {
      const S3 = Math.sqrt(3);
      const A: Pt = [0.5, S3 / 2],
        B: Pt = [0, 0],
        C: Pt = [1, 0];
      const geo = (x: number) => {
        const m = Math.sin(rad(120 - x)) / (Math.sin(rad(60)) + Math.sin(rad(120 - x)));
        const M: Pt = [A[0] * m, A[1] * m];
        const bd = ((1 - m) * Math.sin(rad(x))) / Math.sin(rad(60));
        const Dp: Pt = [bd, 0];
        const AD: Pt = [A[0] - Dp[0], A[1] - Dp[1]];
        const CA: Pt = [C[0] - A[0], C[1] - A[1]];
        const s = -(AD[0] ** 2 + AD[1] ** 2) / (2 * (AD[0] * CA[0] + AD[1] * CA[1]));
        const F: Pt = [A[0] + s * CA[0], A[1] + s * CA[1]];
        return { M, Dp, F, ok: bd > 0.15 && bd < 0.85 && s > 0.12 && s < 0.88 && m > 0.12 && m < 0.88 };
      };
      const { x, g } = until(
        () => {
          const x = r.int(20, 50) * 2;
          return { x, g: geo(x) };
        },
        (v) => v.x !== 60 && v.g.ok,
      );
      type Ask = 'ㅁㄹㄴ' | 'ㄷㄹㅂ' | 'ㄹㅂㄷ' | 'ㄱㅁㅂ' | 'ㄱㅂㅁ';
      const ask: Ask = level === 1 ? 'ㅁㄹㄴ' : level === 2 ? r.pick(['ㄷㄹㅂ', 'ㄹㅂㄷ'] as Ask[]) : r.pick(['ㄱㅁㅂ', 'ㄱㅂㅁ'] as Ask[]);
      const AM: Record<Ask, { at: string; a: string; b: string }> = {
        ㅁㄹㄴ: { at: 'ㄹ', a: 'ㅁ', b: 'ㄴ' },
        ㄷㄹㅂ: { at: 'ㄹ', a: 'ㄷ', b: 'ㅂ' },
        ㄹㅂㄷ: { at: 'ㅂ', a: 'ㄹ', b: 'ㄷ' },
        ㄱㅁㅂ: { at: 'ㅁ', a: 'ㄱ', b: 'ㅂ' },
        ㄱㅂㅁ: { at: 'ㅂ', a: 'ㄱ', b: 'ㅁ' },
      };
      const ans: Record<Ask, number> = { ㅁㄹㄴ: 120 - x, ㄷㄹㅂ: x, ㄹㅂㄷ: 120 - x, ㄱㅁㅂ: (180 - x) / 2, ㄱㅂㅁ: (60 + x) / 2 };
      const fig = geoFig({
        P: { ㄱ: A, ㄴ: B, ㄷ: C, ㅁ: g.M, ㅂ: g.F, ㄹ: g.Dp },
        polys: [
          ['ㅁ', 'ㄴ', 'ㄷ', 'ㅂ'],
          ['ㅁ', 'ㄹ', 'ㅂ'],
        ],
        segs: [
          { a: 'ㅁ', b: 'ㄱ', dash: true },
          { a: 'ㄱ', b: 'ㅂ', dash: true },
        ],
        angles: [
          { at: 'ㅁ', a: 'ㄴ', b: 'ㄹ', text: `${x}°` },
          { ...AM[ask], text: '?' },
        ],
        labelDir: { ㄱ: [0, 1], ㄴ: [-1, -0.6], ㄷ: [1, -0.6], ㄹ: [0, -1], ㅁ: [-1, 0.5], ㅂ: [1, 0.5] },
        w: 250,
        h: 210,
      });
      const s1 = [`정삼각형의 한 각은 $60^{\\circ}$이므로 각 ㅁㄴㄹ $=60^{\\circ}$`, `삼각형 ㅁㄴㄹ에서 각 ㅁㄹㄴ $=180^{\\circ}-60^{\\circ}-${deg(x)}=${deg(120 - x)}$`];
      const s2 = [`접은 각은 크기가 같으므로 각 ㅁㄹㅂ $=$ 각 ㅁㄱㅂ $=60^{\\circ}$`, `ㄴ, ㄹ, ㄷ은 한 직선 위에 있으므로 각 ㄷㄹㅂ $=180^{\\circ}-${deg(120 - x)}-60^{\\circ}=${deg(x)}$`];
      const s3 = [`삼각형 ㄹㄷㅂ에서 각 ㄹㅂㄷ $=180^{\\circ}-60^{\\circ}-${deg(x)}=${deg(120 - x)}$`];
      const steps =
        ask === 'ㅁㄹㄴ'
          ? s1
          : ask === 'ㄷㄹㅂ'
            ? [...s1, ...s2]
            : ask === 'ㄹㅂㄷ'
              ? [...s1, ...s2, ...s3]
              : ask === 'ㄱㅁㅂ'
                ? [
                    `ㄱ, ㅁ, ㄴ은 한 직선 위에 있으므로 각 ㄱㅁㄹ $=180^{\\circ}-${deg(x)}=${deg(180 - x)}$`,
                    '접은 선 ㅁㅂ은 각 ㄱㅁㄹ을 똑같이 둘로 나눠요 (각 ㄱㅁㅂ $=$ 각 ㄹㅁㅂ).',
                    `각 ㄱㅁㅂ $=${deg(180 - x)}\\div2=${deg((180 - x) / 2)}$`,
                  ]
                : [
                    `각 ㅁㄹㄴ $=180^{\\circ}-60^{\\circ}-${deg(x)}=${deg(120 - x)}$, 각 ㅁㄹㅂ $=60^{\\circ}$ (접은 각) → 각 ㄷㄹㅂ $=${deg(x)}$`,
                    ...s3,
                    `ㄱ, ㅂ, ㄷ은 한 직선 위에 있으므로 각 ㄱㅂㄹ $=180^{\\circ}-${deg(120 - x)}=${deg(60 + x)}$`,
                    `접었으므로 각 ㄱㅂㅁ $=$ 각 ㄹㅂㅁ $=${deg(60 + x)}\\div2=${deg((60 + x) / 2)}$`,
                  ];
      return {
        q: `정삼각형 모양의 종이 ㄱㄴㄷ을 꼭짓점 ㄱ이 변 ㄴㄷ 위의 점 ㄹ에 닿도록 선분 ㅁㅂ을 따라 접었습니다. 각 ㄴㅁㄹ이 $${deg(x)}$일 때, 각 ${ask}은 몇 도인가요?`,
        fig,
        answer: { type: 'num', value: ans[ask], unit: '°' },
        steps,
        hint: '접은 부분은 접기 전과 모양과 크기가 같아요. 각 ㅁㄹㅂ은 원래 각 ㄱ이었어요.',
      };
    },
  },
  {
    id: 'iso-angle-count',
    title: '조건에 맞는 삼각형의 세 각 정하기 (가짓수)',
    gen(r, level) {
      if (level <= 2) {
        type T = 'acute' | 'obtuse' | 'all';
        const { s, type, list } = until(
          () => {
            const s = level === 1 ? r.pick([10, 15, 20, 30]) : r.pick([5, 10, 12, 15]);
            const type: T = r.pick((level === 1 ? ['acute', 'obtuse'] : ['acute', 'obtuse', 'all']) as T[]);
            const list: number[] = [];
            for (let b = s; 2 * b < 180; b += s) {
              const ap = 180 - 2 * b;
              if (type === 'all' || (type === 'acute' && ap < 90) || (type === 'obtuse' && ap > 90)) list.push(b);
            }
            return { s, type, list };
          },
          (v) => v.list.length >= 1,
        );
        const name = type === 'acute' ? '예각삼각형인 이등변삼각형' : type === 'obtuse' ? '둔각삼각형인 이등변삼각형' : '이등변삼각형';
        const maxb = Math.floor(179 / 2 / s) * s;
        return {
          q: `세 각의 크기가 모두 $${deg(s)}$의 배수인 ${name}을 그리려고 합니다. 세 각의 크기를 정하는 방법은 모두 몇 가지인가요? (정삼각형도 이등변삼각형입니다.)`,
          answer: { type: 'num', value: list.length, unit: '가지' },
          steps: [
            `크기가 같은 두 각을 각각 □°라 하면 나머지 한 각은 $180^{\\circ}-$□°$-$□°예요.`,
            `□는 ${maxb / s <= 4 ? Array.from({ length: maxb / s }, (_, i) => `$${(i + 1) * s}$`).join(', ') : `$${s}$, $${2 * s}$, …, $${maxb}$`} 중 하나예요 (두 각의 합이 $180^{\\circ}$보다 작아야 해요).`,
            ...(type === 'acute' ? ['예각삼각형이려면 나머지 한 각도 $90^{\\circ}$보다 작아야 하므로 □는 $45$보다 커야 해요.'] : type === 'obtuse' ? ['둔각삼각형이려면 나머지 한 각이 $90^{\\circ}$보다 커야 하므로 □는 $45$보다 작아야 해요.'] : []),
            `가능한 세 각: ${list.map((b) => `$(${b},${b},${180 - 2 * b})$`).join(', ')}`,
            `모두 $${list.length}$가지`,
          ],
          hint: '크기가 같은 두 각을 먼저 정하면 나머지 한 각이 정해져요.',
        };
      }
      type T3 = 'acute' | 'obtuse' | 'right';
      const { s, type, list } = until(
        () => {
          const s = r.pick([10, 12, 15, 20]);
          const type: T3 = r.pick(['acute', 'obtuse', 'right'] as T3[]);
          const U = 180 / s;
          const list: number[][] = [];
          for (let a = 1; a < U; a++)
            for (let b = a + 1; b < U; b++) {
              const cc = U - a - b;
              if (cc <= b) continue;
              const big = cc * s;
              if ((type === 'acute' && big < 90) || (type === 'obtuse' && big > 90) || (type === 'right' && big === 90)) list.push([a * s, b * s, big]);
            }
          return { s, type, list };
        },
        (v) => v.list.length >= 1 && v.list.length <= 10,
      );
      const name = { acute: '예각삼각형', obtuse: '둔각삼각형', right: '직각삼각형' }[type];
      const bigs = [...new Set(list.map((t) => t[2]))].sort((a, b) => a - b);
      return {
        q: `세 각의 크기가 모두 $${deg(s)}$의 배수이고 세 각의 크기가 모두 다른 ${name}을 그리려고 합니다. 세 각의 크기를 정하는 방법은 모두 몇 가지인가요?`,
        answer: { type: 'num', value: list.length, unit: '가지' },
        steps: [
          `가장 큰 각을 먼저 정해요. ${type === 'acute' ? '예각삼각형은 가장 큰 각이 $90^{\\circ}$보다 작아요.' : type === 'obtuse' ? '둔각삼각형은 가장 큰 각이 $90^{\\circ}$보다 커요.' : '직각삼각형은 가장 큰 각이 $90^{\\circ}$예요.'}`,
          ...bigs.map((bg) => {
            const g = list.filter((t) => t[2] === bg);
            return `가장 큰 각이 $${deg(bg)}$일 때 나머지 두 각의 합은 $${deg(180 - bg)}$: ${g.map((t) => `$(${t[0]},${t[1]})$`).join(', ')}`;
          }),
          `모두 $${list.length}$가지`,
        ],
        hint: '세 각의 합은 180°예요. 가장 큰 각부터 정해 보세요.',
      };
    },
  },
];

function sticksFig(): string {
  const s = new Svg(300, 120);
  const side = 26,
    h = (side * Math.sqrt(3)) / 2;
  const draw = (n: number, cx: number, label: string) => {
    const top = 100 - n * h;
    for (let rr = 0; rr < n; rr++)
      for (let j = 0; j <= rr; j++) {
        const x = cx + (j - rr / 2) * side,
          y = top + rr * h;
        s.poly(
          [
            [x, y],
            [x - side / 2, y + h],
            [x + side / 2, y + h],
          ],
          { cls: 'acc' },
        );
      }
    s.text(cx, 113, label, { size: 12 });
  };
  draw(1, 40, '1층');
  draw(2, 120, '2층');
  draw(3, 225, '3층');
  return s.toString();
}

const TOP_E4B2: Skill[] = [
  {
    id: 'top-eq-sticks',
    title: '성냥개비로 만든 정삼각형 모양과 삼각형의 수',
    gen(r) {
      const k = r.int(3, 6);
      const st = (j: number) => (3 * j * (j + 1)) / 2;
      const extra = r.int(1, 3 * (k + 1) - 1);
      const M = st(k) + extra;
      const rows = Array.from({ length: k }, (_, i) => ({ sz: (i + 1) * (i + 1), n: triUp(k, i + 1) + triDown(k, i + 1) }));
      const total = triTotal(k);
      return {
        q: `성냥개비로 그림과 같이 작은 정삼각형을 이어 붙여 $1$층, $2$층, $3$층, … 모양의 큰 정삼각형을 만들고 있습니다. 성냥개비 $${M}$개로 될 수 있는 대로 큰 모양을 하나 만들 때, 남는 성냥개비는 몇 개이고, 그 모양에서 찾을 수 있는 크고 작은 정삼각형은 모두 몇 개인가요?`,
        fig: sticksFig(),
        answer: {
          type: 'fields',
          fields: [
            { label: '남는 성냥개비', value: extra, unit: '개' },
            { label: '크고 작은 정삼각형', value: total, unit: '개' },
          ],
        },
        steps: [
          '위쪽을 향한 작은 정삼각형들은 서로 변을 나누어 갖지 않고, 모든 성냥개비는 이 삼각형들 중 꼭 하나의 변이에요.',
          '□층 모양에는 위쪽을 향한 작은 정삼각형이 $1+2+\\cdots+$□개 있으므로 성냥개비는 그 수의 $3$배예요.',
          `필요한 성냥개비: ${Array.from({ length: k + 1 }, (_, i) => `${i + 1}층 $${st(i + 1)}$개`).join(', ')}`,
          `$${st(k)}<${M}<${st(k + 1)}$이므로 $${k}$층 모양을 만들고 $${M}-${st(k)}=${extra}$ (개)가 남아요.`,
          `${k}층 모양의 정삼각형: ${rows.map((x) => `작은 삼각형 ${x.sz}개짜리 $${x.n}$개`).join(', ')}`,
          `크고 작은 정삼각형은 모두 $${rows.map((x) => x.n).join('+')}=${total}$ (개)`,
        ],
        hint: '성냥개비 하나하나가 위쪽을 향한 작은 정삼각형 중 어느 것의 변인지 생각해 보세요.',
      };
    },
  },
  {
    id: 'top-iso-bisector',
    title: '이등변삼각형의 각을 똑같이 나눈 선이 만드는 각',
    gen(r) {
      const v = r.pick(['in', 'side', 'rev', 'ext'] as const);
      const b = r.int(18, 38) * 2; // 밑각 (짝수)
      const a = 180 - 2 * b;
      const B: Pt = [0, 0],
        C: Pt = [2, 0],
        A: Pt = [1, Math.tan(rad(b))];
      const base = `삼각형 ㄱㄴㄷ은 변 ㄱㄴ과 변 ㄱㄷ의 길이가 같은 이등변삼각형입니다.`;
      if (v === 'in' || v === 'rev') {
        const I: Pt = [1, Math.tan(rad(b / 2))];
        const t = 180 - b;
        const fig = geoFig({
          P: { ㄱ: A, ㄴ: B, ㄷ: C, ㄹ: I },
          polys: [['ㄱ', 'ㄴ', 'ㄷ']],
          segs: [
            { a: 'ㄴ', b: 'ㄹ' },
            { a: 'ㄷ', b: 'ㄹ' },
          ],
          angles:
            v === 'in'
              ? [
                  { at: 'ㄱ', a: 'ㄴ', b: 'ㄷ', text: `${a}°` },
                  { at: 'ㄹ', a: 'ㄴ', b: 'ㄷ', text: '?' },
                ]
              : [
                  { at: 'ㄹ', a: 'ㄴ', b: 'ㄷ', text: `${t}°` },
                  { at: 'ㄱ', a: 'ㄴ', b: 'ㄷ', text: '?' },
                ],
          labelDir: { ㄹ: [0, 1] },
          w: 240,
          h: 200,
        });
        const q0 = `${base} 각 ㄱㄴㄷ과 각 ㄱㄷㄴ을 각각 똑같이 둘로 나누는 선분을 그었더니 두 선분이 점 ㄹ에서 만났습니다.`;
        if (v === 'in')
          return {
            q: `${q0} 각 ㄴㄱㄷ이 $${deg(a)}$일 때, 각 ㄴㄹㄷ은 몇 도인가요?`,
            fig,
            answer: { type: 'num', value: t, unit: '°' },
            steps: [
              `이등변삼각형의 두 밑각은 같아요: 각 ㄱㄴㄷ $=$ 각 ㄱㄷㄴ $=(180^{\\circ}-${deg(a)})\\div2=${deg(b)}$`,
              `각 ㄹㄴㄷ $=${deg(b)}\\div2=${deg(b / 2)}$`,
              `각 ㄹㄷㄴ $=${deg(b)}\\div2=${deg(b / 2)}$`,
              `삼각형 ㄹㄴㄷ에서 각 ㄴㄹㄷ $=180^{\\circ}-${deg(b / 2)}-${deg(b / 2)}=${deg(t)}$`,
              `(꼭지각 $${deg(a)}$의 절반 $${deg(a / 2)}$에 $90^{\\circ}$를 더한 것과 같아요.)`,
            ],
            hint: '먼저 두 밑각의 크기를 구해요.',
          };
        return {
          q: `${q0} 각 ㄴㄹㄷ이 $${deg(t)}$일 때, 각 ㄴㄱㄷ은 몇 도인가요?`,
          fig,
          answer: { type: 'num', value: a, unit: '°' },
          steps: [
            `삼각형 ㄹㄴㄷ에서 각 ㄹㄴㄷ $+$ 각 ㄹㄷㄴ $=180^{\\circ}-${deg(t)}=${deg(180 - t)}$`,
            `두 밑각이 같으니 그 절반끼리도 같아요: 각 ㄹㄴㄷ $=$ 각 ㄹㄷㄴ $=${deg(180 - t)}\\div2=${deg(b / 2)}$`,
            `밑각 각 ㄱㄴㄷ $=${deg(b / 2)}+${deg(b / 2)}=${deg(b)}$, 각 ㄱㄷㄴ도 $${deg(b)}$`,
            `각 ㄴㄱㄷ $=180^{\\circ}-${deg(b)}-${deg(b)}=${deg(a)}$`,
            `답: $${deg(a)}$`,
          ],
          hint: '각 ㄴㄹㄷ이 있는 삼각형 ㄹㄴㄷ부터 살펴보세요.',
        };
      }
      if (v === 'side') {
        const Dp = inter(B, dir(b / 2), A, [C[0] - A[0], C[1] - A[1]]);
        const askA = r.chance(0.5);
        const lower = 180 - b / 2 - b;
        const fig = geoFig({
          P: { ㄱ: A, ㄴ: B, ㄷ: C, ㄹ: Dp },
          polys: [['ㄱ', 'ㄴ', 'ㄷ']],
          segs: [{ a: 'ㄴ', b: 'ㄹ' }],
          angles: [
            { at: 'ㄱ', a: 'ㄴ', b: 'ㄷ', text: `${a}°` },
            askA ? { at: 'ㄹ', a: 'ㄱ', b: 'ㄴ', text: '?' } : { at: 'ㄹ', a: 'ㄴ', b: 'ㄷ', text: '?' },
          ],
          w: 240,
          h: 200,
        });
        return {
          q: `${base} 각 ㄱㄴㄷ을 똑같이 둘로 나누는 선분이 변 ㄱㄷ과 만나는 점을 ㄹ이라 합니다. 각 ㄴㄱㄷ이 $${deg(a)}$일 때, 각 ${askA ? 'ㄱㄹㄴ' : 'ㄴㄹㄷ'}은 몇 도인가요?`,
          fig,
          answer: { type: 'num', value: askA ? 180 - lower : lower, unit: '°' },
          steps: [
            `밑각: 각 ㄱㄴㄷ $=$ 각 ㄱㄷㄴ $=(180^{\\circ}-${deg(a)})\\div2=${deg(b)}$`,
            `각 ㄹㄴㄷ $=${deg(b)}\\div2=${deg(b / 2)}$`,
            `삼각형 ㄹㄴㄷ에서 각 ㄴㄹㄷ $=180^{\\circ}-${deg(b / 2)}-${deg(b)}=${deg(lower)}$`,
            ...(askA ? [`ㄱ, ㄹ, ㄷ은 한 직선 위에 있으므로 각 ㄱㄹㄴ $=180^{\\circ}-${deg(lower)}=${deg(180 - lower)}$`] : []),
            `(확인: 삼각형 ㄱㄴㄹ에서 $${deg(a)}+${deg(b / 2)}+${deg(180 - lower)}=180^{\\circ}$)`,
            `답: $${deg(askA ? 180 - lower : lower)}$`,
          ],
          hint: '각을 똑같이 둘로 나누면 반씩이 돼요.',
        };
      }
      // 바깥쪽 각의 이등분선
      const E: Pt = [3.2, 0];
      const Mp = inter(B, dir(b / 2), C, dir((180 - b) / 2));
      const fig = geoFig({
        P: { ㄱ: A, ㄴ: B, ㄷ: C, ㄹ: E, ㅁ: Mp },
        polys: [['ㄱ', 'ㄴ', 'ㄷ']],
        segs: [
          { a: 'ㄷ', b: 'ㄹ' },
          { a: 'ㄴ', b: 'ㅁ', dash: true },
          { a: 'ㄷ', b: 'ㅁ', dash: true },
        ],
        angles: [
          { at: 'ㄴ', a: 'ㄱ', b: 'ㄷ', text: `${b}°` },
          { at: 'ㅁ', a: 'ㄴ', b: 'ㄷ', text: '?' },
        ],
        labelDir: { ㄴ: [-1, -0.4], ㄷ: [0, -1], ㄹ: [1, -0.4] },
        w: 260,
        h: 210,
      });
      const ext = 180 - b;
      const bcm = b + ext / 2;
      const ans = 90 - b;
      return {
        q: `${base} 변 ㄴㄷ을 늘인 직선 위에 점 ㄹ을 잡았습니다. 각 ㄱㄴㄷ을 똑같이 둘로 나누는 선과 각 ㄱㄷㄹ을 똑같이 둘로 나누는 선이 점 ㅁ에서 만납니다. 각 ㄱㄴㄷ이 $${deg(b)}$일 때, 각 ㄴㅁㄷ은 몇 도인가요?`,
        fig,
        answer: { type: 'num', value: ans, unit: '°' },
        steps: [
          `각 ㅁㄴㄷ $=${deg(b)}\\div2=${deg(b / 2)}$`,
          `밑각이 같으니 각 ㄱㄷㄴ $=${deg(b)}$, 각 ㄱㄷㄹ $=180^{\\circ}-${deg(b)}=${deg(ext)}$`,
          `각 ㄱㄷㅁ $=${deg(ext)}\\div2=${deg(ext / 2)}$`,
          `각 ㄴㄷㅁ $=${deg(b)}+${deg(ext / 2)}=${deg(bcm)}$`,
          `삼각형 ㅁㄴㄷ에서 각 ㄴㅁㄷ $=180^{\\circ}-${deg(b / 2)}-${deg(bcm)}=${deg(ans)}$`,
          `(꼭지각 각 ㄴㄱㄷ $=${deg(a)}$의 절반과 같아요.)`,
        ],
        hint: '각 ㄴㄷㅁ을 각 ㄱㄷㄴ과 각 ㄱㄷㅁ으로 나누어 구해요.',
      };
    },
  },
];

// ═════════════ e4b-3 소수의 덧셈과 뺄셈 ═════════════
function nlFig(N: number, labels: Record<number, string>, marks: Record<number, string>): string {
  const W = 300,
    H = 96,
    x0 = 22,
    x1 = 278,
    y = 54;
  const s = new Svg(W, H);
  s.line(x0 - 10, y, x1 + 10, y, { cls: 'acc' });
  for (let i = 0; i <= N; i++) {
    const x = x0 + (i * (x1 - x0)) / N;
    s.line(x, y - 6, x, y + 6, { cls: 'acc' });
    if (labels[i]) s.text(x, y + 22, labels[i], { size: 12 });
    if (marks[i]) {
      s.text(x, y - 36, marks[i], { size: 13 });
      s.line(x, y - 27, x, y - 10, { arrow: true });
    }
  }
  return s.toString();
}

const E4B3: Skill[] = [
  {
    id: 'dec-cards',
    title: '수 카드로 만든 소수의 합과 차',
    gen(r, level) {
      if (level === 1) {
        const cs = r.sample(DIG, 3);
        const ds = [...cs].sort((a, b) => b - a);
        const big = num(ds) * 10,
          small = num([...ds].reverse()) * 10;
        const isSum = r.chance(0.5);
        const v = isSum ? big + small : big - small;
        return {
          q: `수 카드 $${boxes(cs)}$를 한 번씩 모두 사용하여 소수 두 자리 수 $\\square.\\square\\square$를 만들려고 합니다. 만들 수 있는 가장 큰 수와 가장 작은 수의 ${isSum ? '합을' : '차를'} 구하세요.`,
          answer: dAns(v),
          steps: [`가장 큰 수: 높은 자리부터 큰 수를 놓아요 → $${D(big)}$`, `가장 작은 수: 높은 자리부터 작은 수를 놓아요 → $${D(small)}$`, `$${D(big)}${isSum ? '+' : '-'}${D(small)}=${D(v)}$`],
        };
      }
      if (level === 2) {
        const cs = r.sample(DIG, 4);
        const ds = [...cs].sort((a, b) => b - a);
        const asc = [...ds].reverse();
        const mxv = num(ds),
          mnv = num(asc);
        const mx2 = num([ds[0], ds[1], ds[3], ds[2]]),
          mn2 = num([asc[0], asc[1], asc[3], asc[2]]);
        const ask = r.pick(['max-min', 'max-2min', '2max+min'] as const);
        const [X, Y, op] = ask === 'max-min' ? [mxv, mnv, '-'] : ask === 'max-2min' ? [mxv, mn2, '-'] : [mx2, mnv, '+'];
        const v = op === '-' ? X - Y : X + Y;
        const what = ask === 'max-min' ? '가장 큰 수와 가장 작은 수의 차' : ask === 'max-2min' ? '가장 큰 수와 둘째로 작은 수의 차' : '둘째로 큰 수와 가장 작은 수의 합';
        return {
          q: `수 카드 $${boxes(cs)}$를 한 번씩 모두 사용하여 소수 세 자리 수 $\\square.\\square\\square\\square$를 만들려고 합니다. 만들 수 있는 수 중에서 ${J(what, '을/를')} 구하세요.`,
          answer: dAns(v),
          steps: [
            `가장 큰 수 $${D(mxv)}$, 둘째로 큰 수는 끝의 두 자리를 바꾼 $${D(mx2)}$`,
            `가장 작은 수 $${D(mnv)}$, 둘째로 작은 수는 끝의 두 자리를 바꾼 $${D(mn2)}$`,
            `$${D(X)}${op}${D(Y)}=${D(v)}$`,
          ],
          hint: '둘째로 큰 수는 가장 큰 수에서 가장 낮은 두 자리 숫자만 바꾼 수예요.',
        };
      }
      const cs = r.sample(DIG, 6);
      const ask = r.pick(['maxsum', 'minsum', 'mindiff'] as const);
      let best = ask === 'maxsum' ? -1 : Infinity,
        ex: number[] = [];
      for (const p of perms(cs, 6)) {
        const X = num(p.slice(0, 3)),
          Y = num(p.slice(3));
        if (ask === 'mindiff') {
          if (X > Y && X - Y < best) {
            best = X - Y;
            ex = p;
          }
        } else {
          const v = X + Y;
          if ((ask === 'maxsum' && v > best) || (ask === 'minsum' && v < best)) {
            best = v;
            ex = p;
          }
        }
      }
      const X = num(ex.slice(0, 3)) * 10,
        Y = num(ex.slice(3)) * 10;
      const what = ask === 'maxsum' ? '두 수의 합이 가장 클 때의 합' : ask === 'minsum' ? '두 수의 합이 가장 작을 때의 합' : '두 수의 차가 가장 작을 때의 차';
      return {
        q: `수 카드 $${boxes(cs)}$를 한 번씩 모두 사용하여 소수 두 자리 수 $\\square.\\square\\square$를 $2$개 만들려고 합니다. ${J(what, '을/를')} 구하세요.`,
        answer: dAns(best * 10),
        steps:
          ask === 'mindiff'
            ? [
                '차를 작게 하려면 먼저 두 수의 일의 자리 숫자의 차를 가장 작게 해요.',
                '그다음 큰 수의 소수 부분은 될 수 있는 대로 작게, 작은 수의 소수 부분은 될 수 있는 대로 크게 만들어요.',
                `이렇게 찾은 두 수: $${D(X)}$와 $${D(Y)}$`,
                `$${D(X)}-${D(Y)}=${D(best * 10)}$`,
              ]
            : [
                ask === 'maxsum'
                  ? '합을 크게 하려면 가장 큰 두 수를 일의 자리에, 그다음 두 수를 소수 첫째 자리에, 남은 두 수를 소수 둘째 자리에 놓아요.'
                  : '합을 작게 하려면 가장 작은 두 수를 일의 자리에, 그다음 두 수를 소수 첫째 자리에, 남은 두 수를 소수 둘째 자리에 놓아요.',
                `예: $${D(X)}+${D(Y)}=${D(best * 10)}$`,
                `답: $${D(best * 10)}$`,
              ],
        hint: '높은 자리의 숫자가 합과 차에 가장 큰 영향을 줘요.',
      };
    },
  },
  {
    id: 'dec-clue',
    title: '조건을 보고 소수 알아내기',
    gen(r, level) {
      if (level === 1) {
        const g = until(
          () => {
            const u = r.int(1, 8);
            const k2 = r.int(0, 2),
              p = r.int(1, 5);
            const t = k2 === 0 ? u + p : k2 === 1 ? u - p : r.int(0, 9);
            const k3 = r.int(0, 2),
              q = r.int(1, 5);
            const h = k3 === 0 ? t + q : k3 === 1 ? t - q : u + t;
            return { u, k2, p, t, k3, q, h };
          },
          (v) => v.t >= 0 && v.t <= 9 && v.h >= 1 && v.h <= 9,
        );
        const c2 = g.k2 === 0 ? `소수 첫째 자리 숫자는 일의 자리 숫자보다 $${g.p}$ 큽니다.` : g.k2 === 1 ? `소수 첫째 자리 숫자는 일의 자리 숫자보다 $${g.p}$ 작습니다.` : `소수 첫째 자리 숫자는 $${g.t}$입니다.`;
        const c3 =
          g.k3 === 0
            ? `소수 둘째 자리 숫자는 소수 첫째 자리 숫자보다 $${g.q}$ 큽니다.`
            : g.k3 === 1
              ? `소수 둘째 자리 숫자는 소수 첫째 자리 숫자보다 $${g.q}$ 작습니다.`
              : '소수 둘째 자리 숫자는 일의 자리 숫자와 소수 첫째 자리 숫자의 합과 같습니다.';
        const v = 1000 * g.u + 100 * g.t + 10 * g.h;
        return {
          q: `다음 조건을 모두 만족하는 소수 두 자리 수를 구하세요.\n① $${g.u}$보다 크고 $${g.u + 1}$보다 작습니다.\n② ${c2}\n③ ${c3}`,
          answer: dAns(v),
          steps: [`①에서 일의 자리 숫자는 $${g.u}$`, `②에서 소수 첫째 자리 숫자는 $${g.t}$`, `③에서 소수 둘째 자리 숫자는 $${g.h}$ → $${D(v)}$`],
        };
      }
      if (level === 2) {
        const POOL: { t: string; f: (x: number[]) => boolean }[] = [
          { t: '소수 둘째 자리 숫자는 홀수입니다.', f: (x) => x[2] % 2 === 1 },
          { t: '소수 둘째 자리 숫자는 짝수입니다.', f: (x) => x[2] % 2 === 0 },
          { t: '소수 둘째 자리 숫자는 소수 첫째 자리 숫자보다 큽니다.', f: (x) => x[2] > x[1] },
          { t: '소수 둘째 자리 숫자는 소수 첫째 자리 숫자보다 작습니다.', f: (x) => x[2] < x[1] },
          ...[1, 2, 3, 4].map((k) => ({ t: `$${k}$보다 큰 수입니다.`, f: (x: number[]) => x[0] >= k })),
          ...[1, 2, 3, 4].map((k) => ({ t: `$${k}$보다 작은 수입니다.`, f: (x: number[]) => x[0] < k })),
        ];
        const g = until(
          () => {
            const m = r.pick([2, 3, 4]);
            const u = r.int(1, Math.floor(9 / m));
            const h = r.int(1, 9);
            const S = u + m * u + h;
            const cands: number[][] = [];
            for (let uu = 0; m * uu <= 9; uu++) {
              const hh = S - uu - m * uu;
              if (hh >= 1 && hh <= 9) cands.push([uu, m * uu, hh]);
            }
            const tgt = [u, m * u, h];
            const okc = POOL.filter((p) => p.f(tgt) && cands.filter((x) => p.f(x)).length === 1);
            return { m, S, cands, tgt, clue: okc.length ? r.pick(okc) : null };
          },
          (v) => v.cands.length >= 2 && v.clue !== null,
        );
        const v = 1000 * g.tgt[0] + 100 * g.tgt[1] + 10 * g.tgt[2];
        const pairs = [];
        for (let uu = 0; g.m * uu <= 9; uu++) pairs.push(`$(${uu},${g.m * uu})$`);
        return {
          q: `다음 조건을 모두 만족하는 소수 두 자리 수를 구하세요.\n① 소수 첫째 자리 숫자는 일의 자리 숫자의 $${g.m}$배입니다.\n② 일의 자리 숫자, 소수 첫째 자리 숫자, 소수 둘째 자리 숫자를 모두 더하면 $${g.S}$입니다.\n③ ${g.clue!.t}`,
          answer: dAns(v),
          steps: [
            `①에서 (일의 자리, 소수 첫째 자리) 숫자는 ${pairs.join(', ')}`,
            `②에서 소수 둘째 자리 숫자를 구하면 (소수 둘째 자리 숫자는 $1$~$9$) 가능한 수는 ${g.cands.map((x) => `$${D(1000 * x[0] + 100 * x[1] + 10 * x[2])}$`).join(', ')}`,
            `③을 만족하는 수는 $${D(v)}$`,
          ],
          hint: '①을 만족하는 경우를 먼저 모두 써 보세요.',
        };
      }
      type Rel = 'eq13' | 'dbl' | 'dec';
      const g = until(
        () => {
          const u = r.int(1, 8);
          const rel: Rel = r.pick(['eq13', 'dbl', 'dec'] as Rel[]);
          const S = r.int(u + 6, u + 22);
          const list: number[][] = [];
          for (let t = 0; t <= 9; t++)
            for (let h = 0; h <= 9; h++)
              for (let w = 1; w <= 9; w++) {
                if (u + t + h + w !== S) continue;
                if (rel === 'eq13' && t !== w) continue;
                if (rel === 'dbl' && h !== 2 * t) continue;
                if (rel === 'dec' && !(t > h && h > w)) continue;
                list.push([t, h, w]);
              }
          return { u, rel, S, list };
        },
        (v) => v.list.length >= 2 && v.list.length <= 8,
      );
      const relT = {
        eq13: '소수 첫째 자리 숫자와 소수 셋째 자리 숫자는 같습니다.',
        dbl: '소수 둘째 자리 숫자는 소수 첫째 자리 숫자의 $2$배입니다.',
        dec: '소수 첫째 자리 숫자는 소수 둘째 자리 숫자보다 크고, 소수 둘째 자리 숫자는 소수 셋째 자리 숫자보다 큽니다.',
      }[g.rel];
      const vals = g.list.map((x) => 1000 * g.u + 100 * x[0] + 10 * x[1] + x[2]);
      return {
        q: `다음 조건을 모두 만족하는 소수 세 자리 수는 모두 몇 개인가요?\n① $${g.u}$보다 크고 $${g.u + 1}$보다 작습니다.\n② ${relT}\n③ 일의 자리 숫자와 소수 첫째, 둘째, 셋째 자리 숫자를 모두 더하면 $${g.S}$입니다.`,
        answer: { type: 'num', value: g.list.length, unit: '개' },
        steps: [
          `①에서 일의 자리 숫자는 $${g.u}$${josa(g.u, '이에요/예요')}.`,
          `③에서 소수 부분의 세 숫자의 합은 $${g.S}-${g.u}=${g.S - g.u}$ (소수 셋째 자리 숫자는 $0$이 아니에요)`,
          `②도 만족하는 수: ${vals.map((v) => `$${D(v)}$`).join(', ')}`,
          `모두 $${g.list.length}$개`,
        ],
        hint: '일의 자리 숫자부터 정하고, 남은 세 숫자의 합을 생각해요.',
      };
    },
  },
  {
    id: 'dec-number-line',
    title: '수직선의 눈금 한 칸의 크기로 소수 구하기',
    gen(r, level) {
      if (level === 1) {
        const thou = r.chance(0.5);
        const st = thou ? 1 : 10;
        const A = thou ? until(() => r.int(101, 999), (v) => v % 10 !== 0) * 10 : until(() => r.int(1, 99), (v) => v % 10 !== 0) * 100;
        const k = r.int(1, 9);
        const v = A + k * st;
        return {
          q: '수직선에서 ㉠이 나타내는 소수를 구하세요.',
          fig: nlFig(10, { 0: Dt(A), 10: Dt(A + 10 * st) }, { [k]: '㉠' }),
          answer: dAns(v),
          steps: [`$${D(A)}$와 $${D(A + 10 * st)}$ 사이가 $10$칸으로 나뉘어 있으니 한 칸은 $${D(st)}$`, `㉠은 $${D(A)}$에서 $${k}$칸 → $${D(A)}+${D(k * st)}=${D(v)}$`],
        };
      }
      const scale = r.pick([1, 10]);
      const st = r.int(2, 5) * scale;
      if (level === 2) {
        const N = r.int(4, 8);
        const A = until(
          () => r.int(10, 900) * scale + r.int(0, 5) * 1000,
          (v) => v % (scale * 10) !== 0,
        );
        const B = A + N * st;
        const k = r.int(1, N - 1);
        const v = A + k * st;
        return {
          q: `수직선에서 $${D(A)}$와 $${D(B)}$ 사이를 똑같이 $${N}$칸으로 나누었습니다. ㉠이 나타내는 소수를 구하세요.`,
          fig: nlFig(N, { 0: Dt(A), [N]: Dt(B) }, { [k]: '㉠' }),
          answer: dAns(v),
          steps: [
            `두 수의 차: $${D(B)}-${D(A)}=${D(B - A)}$`,
            `$${D(B - A)}$는 $${D(scale)}$이 $${(B - A) / scale}$개 → $${(B - A) / scale}\\div${N}=${st / scale}$이므로 한 칸은 $${D(st)}$`,
            `㉠은 $${D(A)}$에서 $${k}$칸 → $${D(st)}$이 $${k}$개이면 $${D(k * st)}$`,
            `㉠ $=${D(A)}+${D(k * st)}=${D(v)}$`,
          ],
          hint: '먼저 눈금 한 칸의 크기를 구해요.',
        };
      }
      const N = r.int(8, 12);
      const two = r.chance(0.5);
      const { A, i, j, k, k2 } = until(
        () => {
          const i = r.int(1, N - 3),
            j = r.int(i + 2, N - 1);
          const k = r.int(0, N),
            k2 = r.int(0, N);
          return { A: r.int(1, 600) * scale + r.int(0, 5) * 1000, i, j, k, k2 };
        },
        (v) => v.k !== v.i && v.k !== v.j && (!two || (v.k2 !== v.i && v.k2 !== v.j && v.k2 !== v.k)) && v.A + v.i * st > 0,
      );
      const val = (t: number) => A + t * st;
      const vi = val(i),
        vj = val(j);
      const marks: Record<number, string> = { [k]: '㉠' };
      if (two) marks[k2] = '㉡';
      const fromI = (t: number, name: string) => `${name}은 $${D(vi)}$에서 ${t > i ? '오른쪽' : '왼쪽'}으로 $${Math.abs(t - i)}$칸 → $${D(vi)}${t > i ? '+' : '-'}${D(Math.abs(t - i) * st)}=${D(val(t))}$`;
      return {
        q: `수직선에서 눈금 사이의 간격은 모두 같습니다. ${two ? '㉠과 ㉡이 나타내는 두 소수의 합을 구하세요.' : '㉠이 나타내는 소수를 구하세요.'}`,
        fig: nlFig(N, { [i]: Dt(vi), [j]: Dt(vj) }, marks),
        answer: dAns(two ? val(k) + val(k2) : val(k)),
        steps: [
          `$${D(vj)}-${D(vi)}=${D(vj - vi)}$가 $${j - i}$칸이에요.`,
          `$${D(vj - vi)}$는 $${D(scale)}$이 $${(vj - vi) / scale}$개 → $${(vj - vi) / scale}\\div${j - i}=${st / scale}$이므로 한 칸은 $${D(st)}$`,
          fromI(k, '㉠'),
          ...(two ? [fromI(k2, '㉡'), `합: $${D(val(k))}+${D(val(k2))}=${D(val(k) + val(k2))}$`] : []),
        ],
        hint: '수가 적힌 두 눈금 사이가 몇 칸인지 세어 한 칸의 크기를 구해요.',
      };
    },
  },
];

const TOP_E4B3: Skill[] = [
  {
    id: 'top-dec-shift',
    title: '소수점을 옮긴 수와의 합·차로 처음 수 구하기',
    gen(r) {
      const v = r.int(1, 4);
      const X = until(
        () => (v === 2 ? r.int(1001, 9999) : v === 3 ? r.int(11, 999) : r.int(101, 999)),
        (t) => t % 10 !== 0,
      );
      // 작은 수(1묶음, 천분의 일 단위) = X, 처음 수 = X*10 (v=1,4) / X (v=2, 큰 수 = 10X) / X*100 (v=3)
      const parts = v === 1 ? 11 : v === 3 ? 101 : 9;
      const big = v === 3 ? 100 : 10;
      const S = parts * X;
      const orig = v === 2 ? X : big * X;
      const q =
        v === 1
          ? `어떤 소수 두 자리 수와, 이 수의 소수점을 왼쪽으로 한 자리 옮긴 수를 더했더니 $${D(S)}$가 되었습니다. 처음 소수 두 자리 수를 구하세요.`
          : v === 2
            ? `어떤 소수 세 자리 수의 소수점을 오른쪽으로 한 자리 옮긴 수에서 처음 수를 뺐더니 $${D(S)}$가 되었습니다. 처음 소수 세 자리 수를 구하세요.`
            : v === 3
              ? `어떤 소수 한 자리 수와, 이 수의 소수점을 왼쪽으로 두 자리 옮긴 수를 더했더니 $${D(S)}$가 되었습니다. 처음 소수 한 자리 수를 구하세요.`
              : `어떤 소수 두 자리 수에서, 이 수의 소수점을 왼쪽으로 한 자리 옮긴 수를 뺐더니 $${D(S)}$가 되었습니다. 처음 소수 두 자리 수를 구하세요.`;
      const rel = v === 3 ? '$100$배' : '$10$배';
      return {
        q,
        answer: dAns(orig),
        steps: [
          v === 2 ? '소수점을 오른쪽으로 한 자리 옮긴 수는 처음 수의 $10$배예요.' : `소수점을 왼쪽으로 ${v === 3 ? '두' : '한'} 자리 옮긴 수는 처음 수의 $${v === 3 ? fr(1, 100) : fr(1, 10)}$이에요.`,
          `두 수 중 작은 수를 $1$묶음이라 하면 큰 수는 ${rel}이니 ${v === 3 ? '$100$' : '$10$'}묶음이에요.`,
          `${v === 2 || v === 4 ? '차는' : '합은'} $${parts}$묶음이고, 그 값이 $${D(S)}$${josa(S % 10, '이에요/예요')}.`,
          `$${D(S)}$는 $0.001$이 $${S}$개 → $${S}\\div${parts}=${X}$이므로 $1$묶음은 $${D(X)}$`,
          v === 2 ? `처음 수는 작은 수이므로 $${D(X)}$` : `처음 수는 큰 수(${rel})이므로 $${D(big * X)}$`,
          `확인: ${v === 2 ? `$${D(10 * X)}-${D(X)}=${D(S)}$` : v === 4 ? `$${D(10 * X)}-${D(X)}=${D(S)}$` : `$${D(big * X)}+${D(X)}=${D(S)}$`}`,
        ],
        hint: '소수점을 한 자리 옮기면 10배 또는 1/10이 돼요. 작은 수를 한 묶음으로 생각해 보세요.',
      };
    },
  },
  {
    id: 'top-dec-container',
    title: '덜어 낸 무게로 빈 그릇의 무게 구하기',
    gen(r) {
      const v = r.pick(['ball', 'half', 'third'] as const);
      if (v === 'ball') {
        const th = r.pick([
          { o: '통조림', lo: 20, hi: 45 },
          { o: '사과', lo: 18, hi: 35 },
          { o: '배', lo: 40, hi: 70 },
          { o: '감자', lo: 12, hi: 30 },
        ]);
        const b = until(
          () => r.int(30, 250),
          (t) => t % 10 !== 0,
        );
        const w = until(
          () => r.int(th.lo, th.hi),
          (t) => t % 10 !== 0,
        );
        const n = r.int(5, 9),
          m = r.int(2, n - 2);
        const W1 = (b + n * w) * 10,
          W2 = (b + (n - m) * w) * 10;
        return {
          q: `무게가 같은 ${th.o} $${n}$개를 상자에 담아 무게를 재었더니 $${D(W1)}$ kg이었습니다. 여기서 ${th.o} $${m}$개를 꺼낸 다음 다시 재었더니 $${D(W2)}$ kg이었습니다. 빈 상자의 무게는 몇 kg인가요?`,
          answer: dAns(b * 10, 'kg'),
          steps: [
            `꺼낸 ${th.o} $${m}$개의 무게: $${D(W1)}-${D(W2)}=${D(m * w * 10)}$ (kg)`,
            `$${D(m * w * 10)}$는 $0.01$이 $${m * w}$개 → $${m * w}\\div${m}=${w}$이므로 ${th.o} $1$개는 $${D(w * 10)}$ kg`,
            `${th.o} $${n}$개의 무게: $0.01$이 $${w}\\times${n}=${n * w}$개 → $${D(n * w * 10)}$ kg`,
            `빈 상자: $${D(W1)}-${D(n * w * 10)}=${D(b * 10)}$ (kg)`,
            `답: $${D(b * 10)}$ kg`,
          ],
          hint: '두 번 잰 무게의 차는 꺼낸 것들의 무게예요.',
        };
      }
      const b = until(
        () => r.int(150, 900),
        (t) => t % 10 !== 0,
      );
      const k = v === 'half' ? 2 : 3;
      const wt = until(
        () => r.int(400, 1600) * k,
        (t) => t % 10 !== 0 && (t / k) % 10 !== 0,
      );
      const A = b + wt,
        B = b + wt - wt / k;
      const drink = A - B;
      const cont = r.pick(['병', '주전자', '물통']);
      return {
        q: `물을 가득 채운 ${cont}의 무게가 $${D(A)}$ kg입니다. 이 물의 ${v === 'half' ? '절반' : '$\\frac{1}{3}$'}만큼을 마신 뒤 다시 재었더니 $${D(B)}$ kg이었습니다. 빈 ${cont}의 무게는 몇 kg인가요?`,
        answer: dAns(b, 'kg'),
        steps: [
          `마신 물의 무게: $${D(A)}-${D(B)}=${D(drink)}$ (kg)`,
          `마신 물은 전체 물의 ${v === 'half' ? '절반' : '$\\frac{1}{3}$'}이에요.`,
          `전체 물의 무게: $${Array(k).fill(D(drink)).join('+')}=${D(wt)}$ (kg)`,
          `빈 ${cont}: $${D(A)}-${D(wt)}=${D(b)}$ (kg)`,
          `답: $${D(b)}$ kg`,
        ],
        hint: '두 번 잰 무게의 차가 마신 물의 무게예요.',
      };
    },
  },
];

// ═════════════ e4b-4 사각형 ═════════════
/** 평행사변형(가로 n칸, 세로 m칸) 모눈 그림 */
function paraGridFig(m: number, n: number, v: Pt): string {
  const P: Record<string, Pt> = {};
  for (let i = 0; i <= n; i++) for (let j = 0; j <= m; j++) P[`p${i}_${j}`] = [i + j * v[0], j * v[1]];
  const segs: { a: string; b: string }[] = [];
  for (let j = 0; j <= m; j++) segs.push({ a: `p0_${j}`, b: `p${n}_${j}` });
  for (let i = 0; i <= n; i++) segs.push({ a: `p${i}_0`, b: `p${i}_${m}` });
  return geoFig({ P, segs, labels: [], w: 260, h: 150 });
}
function fanFig(k: number, m: number): string {
  const Hh = 1.7;
  const P: Record<string, Pt> = { T: [0, Hh], L: [-1, 0], R: [1, 0] };
  const segs: { a: string; b: string }[] = [];
  for (let i = 1; i <= m; i++) {
    P[`b${i}`] = [-1 + (2 * i) / (m + 1), 0];
    segs.push({ a: 'T', b: `b${i}` });
  }
  for (let j = 1; j <= k; j++) {
    const y = (Hh * j) / (k + 1);
    const x = 1 - y / Hh;
    P[`l${j}`] = [-x, y];
    P[`r${j}`] = [x, y];
    segs.push({ a: `l${j}`, b: `r${j}` });
  }
  return geoFig({ P, polys: [['T', 'L', 'R']], segs, labels: [], w: 230, h: 190 });
}
function foldQuad(beta: number, x: number) {
  const H = 1,
    W = 1.7;
  const B: Pt = [0, 0],
    C: Pt = [W, 0],
    A: Pt = [H * Math.cos(rad(beta)), H * Math.sin(rad(beta))];
  const Dd: Pt = [A[0] + W, A[1]];
  const t = (H * Math.sin(rad(beta - x))) / Math.sin(rad(x));
  const M: Pt = [A[0] + t, A[1]];
  const L = Math.hypot(M[0], M[1]);
  const ux = M[0] / L,
    uy = M[1] / L;
  const dt = A[0] * ux + A[1] * uy;
  const F: Pt = [2 * dt * ux - A[0], 2 * dt * uy - A[1]];
  const cot = Math.cos(rad(beta)) / Math.sin(rad(beta));
  const rel = F[0] - F[1] * cot;
  const ok = t > 0.15 && t < W - 0.15 && F[1] > 0.08 && F[1] < A[1] - 0.08 && rel > 0.1 && rel < W - 0.1;
  return { A, B, C, D: Dd, M, F, ok };
}
function euclid(a: number, b: number) {
  const out: { a: number; b: number; s: number; q: number }[] = [];
  while (b > 0) {
    out.push({ a, b, s: b, q: Math.floor(a / b) });
    [a, b] = [b, a % b];
  }
  return out;
}

const E4B4: Skill[] = [
  {
    id: 'quad-count-grid',
    title: '크고 작은 평행사변형·사다리꼴 세기',
    gen(r, level) {
      if (level === 1) {
        const n = r.int(2, 5);
        const tot = tri(n);
        return {
          q: `그림은 크기가 같은 마름모 $${n}$개를 한 줄로 이어 붙여 만든 것입니다. 그림에서 찾을 수 있는 크고 작은 평행사변형은 모두 몇 개인가요?`,
          fig: paraGridFig(1, n, [0.5, Math.sqrt(3) / 2]),
          answer: { type: 'num', value: tot, unit: '개' },
          steps: [
            '마름모는 마주 보는 두 쌍의 변이 서로 평행하므로 평행사변형이에요.',
            n <= 4
              ? `마름모 ${Array.from({ length: n }, (_, i) => `$${i + 1}$개짜리 $${n - i}$개`).join(', ')}`
              : `마름모 $1$개짜리 $${n}$개, $2$개짜리 $${n - 1}$개, …, $${n}$개짜리 $1$개`,
            `$${Array.from({ length: n }, (_, i) => n - i).join('+')}=${tot}$ (개)`,
          ],
          hint: '마름모도 평행사변형이에요.',
        };
      }
      if (level === 2) {
        const [m, n] = r.pick([
          [2, 2],
          [2, 3],
          [2, 4],
          [3, 2],
          [3, 3],
        ] as [number, number][]);
        const T = tri(n);
        const tot = tri(m) * T;
        return {
          q: `그림은 크기가 같은 작은 평행사변형 $${m * n}$개를 이어 붙여 만든 큰 평행사변형입니다. 그림에서 찾을 수 있는 크고 작은 평행사변형은 모두 몇 개인가요?`,
          fig: paraGridFig(m, n, [0.45, 0.75]),
          answer: { type: 'num', value: tot, unit: '개' },
          steps: [
            `한 줄(높이 $1$칸)에서 가로로 ${n <= 3 ? Array.from({ length: n }, (_, i) => `$${i + 1}$칸`).join(', ') : `$1$칸, $2$칸, …, $${n}$칸`}짜리: $${Array.from({ length: n }, (_, i) => n - i).join('+')}=${T}$ (개)`,
            ...Array.from({ length: m }, (_, a) => `높이가 $${a + 1}$칸인 것: 한 높이마다 $${T}$개씩, 놓을 수 있는 높이 $${m - a}$가지 → $${T * (m - a)}$개`),
            `모두 $${Array.from({ length: m }, (_, a) => T * (m - a)).join('+')}=${tot}$ (개)`,
          ],
          hint: '높이가 1칸인 것, 2칸인 것, … 으로 나누어 세요.',
        };
      }
      const k = r.int(1, 3),
        m = r.int(1, 3);
      const trap = r.chance(0.6);
      const hc = tri(k),
        fc = tri(m + 1);
      const tot = trap ? hc * fc : (k + 1) * fc;
      return {
        q: `삼각형 안에 밑변과 평행한 선분 $${k}$개와, 위쪽 꼭짓점에서 밑변까지 선분 $${m}$개를 그었습니다. 그림에서 찾을 수 있는 크고 작은 ${trap ? '사다리꼴' : '삼각형'}은 모두 몇 개인가요?`,
        fig: fanFig(k, m),
        answer: { type: 'num', value: tot, unit: '개' },
        steps: trap
          ? [
              '사다리꼴은 서로 평행한 가로 선분 $2$개와, 위쪽 꼭짓점에서 내려온 선분 $2$개로 둘러싸여 있어요.',
              `가로 선분(밑변 포함) $${k + 1}$개 중 $2$개를 고르는 방법: $${Array.from({ length: k }, (_, i) => k - i).join('+')}=${hc}$ (가지)`,
              `꼭짓점에서 내려온 선분(양쪽 변 포함) $${m + 2}$개 중 $2$개를 고르는 방법: $${Array.from({ length: m + 1 }, (_, i) => m + 1 - i).join('+')}=${fc}$ (가지)`,
              `가로 선분 한 쌍마다 사다리꼴이 $${fc}$개씩 → $${fc}\\times${hc}=${tot}$ (개)`,
            ]
          : [
              '삼각형은 위쪽 꼭짓점과, 꼭짓점에서 내려온 선분 $2$개, 가로 선분 $1$개로 만들어져요.',
              `꼭짓점에서 내려온 선분(양쪽 변 포함) $${m + 2}$개 중 $2$개를 고르는 방법: $${Array.from({ length: m + 1 }, (_, i) => m + 1 - i).join('+')}=${fc}$ (가지)`,
              `가로 선분(밑변 포함)은 $${k + 1}$개 → 가로 선분 하나마다 삼각형이 $${fc}$개씩`,
              `$${fc}\\times${k + 1}=${tot}$ (개)`,
            ],
        hint: trap ? '사다리꼴의 네 변이 어떤 선분 위에 있는지 생각해 보세요.' : '삼각형의 세 변이 어떤 선분 위에 있는지 생각해 보세요.',
      };
    },
  },
  {
    id: 'quad-fold',
    title: '직사각형·평행사변형 종이를 접었을 때의 각',
    gen(r, level) {
      const para = level === 3;
      const { beta, x, g } = until(
        () => {
          const beta = para ? r.int(31, 59) * 2 : 90;
          const x = para ? r.int(Math.ceil(beta / 2) + 5, Math.min(beta - 6, 80)) : r.int(50, 72);
          return { beta, x, g: foldQuad(beta, x) };
        },
        (v) => v.g.ok && v.beta !== 90 === para,
      );
      type Ask = 'ㅂㄴㅁ' | 'ㅂㄴㄷ' | 'ㄹㅁㅂ' | 'rev';
      const ask: Ask = level === 1 ? 'ㅂㄴㅁ' : level === 2 ? r.pick(['ㅂㄴㄷ', 'ㄹㅁㅂ'] as Ask[]) : r.pick(['ㅂㄴㄷ', 'rev'] as Ask[]);
      const y = 2 * x - beta;
      const AMK: Record<Ask, { at: string; a: string; b: string }> = {
        ㅂㄴㅁ: { at: 'ㄴ', a: 'ㅂ', b: 'ㅁ' },
        ㅂㄴㄷ: { at: 'ㄴ', a: 'ㅂ', b: 'ㄷ' },
        ㄹㅁㅂ: { at: 'ㅁ', a: 'ㄹ', b: 'ㅂ' },
        rev: { at: 'ㅁ', a: 'ㄱ', b: 'ㄴ' },
      };
      const fm: Pt = [g.F[0] - g.M[0], g.F[1] - g.M[1]];
      const fig = geoFig({
        P: { ㄱ: g.A, ㄴ: g.B, ㄷ: g.C, ㄹ: g.D, ㅁ: g.M, ㅂ: g.F },
        polys: [
          ['ㅁ', 'ㄴ', 'ㄷ', 'ㄹ'],
          ['ㅁ', 'ㄴ', 'ㅂ'],
        ],
        segs: [
          { a: 'ㄱ', b: 'ㄴ', dash: true },
          { a: 'ㄱ', b: 'ㅁ', dash: true },
        ],
        angles: ask === 'rev' ? [{ at: 'ㄴ', a: 'ㅂ', b: 'ㄷ', text: `${y}°` }, { ...AMK.rev, text: '?' }] : [{ at: 'ㅁ', a: 'ㄱ', b: 'ㄴ', text: `${x}°` }, { ...AMK[ask], text: '?' }],
        labelDir: { ㄱ: [-1, 1], ㄴ: [-1, -1], ㄷ: [1, -1], ㄹ: [1, 1], ㅁ: [0, 1], ㅂ: fm },
        w: 270,
        h: 190,
      });
      if (!para) {
        const s1 = [`직사각형의 네 각은 모두 $90^{\\circ}$이므로 삼각형 ㄱㄴㅁ에서 각 ㄱㄴㅁ $=180^{\\circ}-90^{\\circ}-${deg(x)}=${deg(90 - x)}$`, `접은 부분은 크기가 같으므로 각 ㅂㄴㅁ $=$ 각 ㄱㄴㅁ $=${deg(90 - x)}$`];
        const ans = ask === 'ㅂㄴㅁ' ? 90 - x : ask === 'ㅂㄴㄷ' ? 2 * x - 90 : 180 - 2 * x;
        return {
          q: `직사각형 모양의 종이 ㄱㄴㄷㄹ을 선분 ㄴㅁ을 따라 접었더니 꼭짓점 ㄱ이 점 ㅂ에 닿았습니다. 각 ㄱㅁㄴ이 $${deg(x)}$일 때, 각 ${ask}은 몇 도인가요?`,
          fig,
          answer: { type: 'num', value: ans, unit: '°' },
          steps:
            ask === 'ㅂㄴㅁ'
              ? s1
              : ask === 'ㅂㄴㄷ'
                ? [...s1, `각 ㄱㄴㄷ $=90^{\\circ}$이므로 각 ㅂㄴㄷ $=90^{\\circ}-${deg(90 - x)}-${deg(90 - x)}=${deg(2 * x - 90)}$`]
                : [`접은 부분은 크기가 같으므로 각 ㅂㅁㄴ $=$ 각 ㄱㅁㄴ $=${deg(x)}$`, `ㄱ, ㅁ, ㄹ은 한 직선 위에 있으므로 각 ㄹㅁㅂ $=180^{\\circ}-${deg(x)}-${deg(x)}=${deg(180 - 2 * x)}$`],
          hint: '접은 부분은 접기 전과 모양과 크기가 같아요.',
        };
      }
      if (ask === 'rev')
        return {
          q: `평행사변형 모양의 종이 ㄱㄴㄷㄹ을 선분 ㄴㅁ을 따라 접었더니 꼭짓점 ㄱ이 점 ㅂ에 닿았습니다. 각 ㄱㄴㄷ이 $${deg(beta)}$이고 각 ㅂㄴㄷ이 $${deg(y)}$일 때, 각 ㄱㅁㄴ은 몇 도인가요?`,
          fig,
          answer: { type: 'num', value: x, unit: '°' },
          steps: [
            `각 ㄱㄴㅁ과 각 ㅂㄴㅁ은 접은 각이라 크기가 같고, 두 각의 합은 $${deg(beta)}-${deg(y)}=${deg(beta - y)}$`,
            `각 ㄱㄴㅁ $=${deg(beta - y)}\\div2=${deg((beta - y) / 2)}$`,
            `평행사변형의 이웃한 두 각의 합은 $180^{\\circ}$이므로 각 ㄴㄱㅁ $=180^{\\circ}-${deg(beta)}=${deg(180 - beta)}$`,
            `삼각형 ㄱㄴㅁ에서 각 ㄱㅁㄴ $=180^{\\circ}-${deg(180 - beta)}-${deg((beta - y) / 2)}=${deg(x)}$`,
          ],
          hint: '접은 두 각은 크기가 같아요.',
        };
      return {
        q: `평행사변형 모양의 종이 ㄱㄴㄷㄹ을 선분 ㄴㅁ을 따라 접었더니 꼭짓점 ㄱ이 점 ㅂ에 닿았습니다. 각 ㄱㄴㄷ이 $${deg(beta)}$이고 각 ㄱㅁㄴ이 $${deg(x)}$일 때, 각 ㅂㄴㄷ은 몇 도인가요?`,
        fig,
        answer: { type: 'num', value: y, unit: '°' },
        steps: [
          `평행사변형의 이웃한 두 각의 합은 $180^{\\circ}$이므로 각 ㄴㄱㅁ $=180^{\\circ}-${deg(beta)}=${deg(180 - beta)}$`,
          `삼각형 ㄱㄴㅁ에서 각 ㄱㄴㅁ $=180^{\\circ}-${deg(180 - beta)}-${deg(x)}=${deg(beta - x)}$`,
          `접었으므로 각 ㅂㄴㅁ $=${deg(beta - x)}$`,
          `각 ㅂㄴㄷ $=${deg(beta)}-${deg(beta - x)}-${deg(beta - x)}=${deg(y)}$`,
        ],
        hint: '평행사변형에서 이웃한 두 각의 합은 180°예요.',
      };
    },
  },
  {
    id: 'square-cut',
    title: '직사각형에서 가장 큰 정사각형 잘라 내기',
    gen(r, level) {
      if (level === 1) {
        const b = r.int(3, 9),
          k = r.int(2, 4),
          rr = r.int(1, b - 1);
        const a = k * b + rr;
        return {
          q: `가로가 $${a}$ cm, 세로가 $${b}$ cm인 직사각형 모양의 종이가 있습니다. 이 종이에서 한 변이 $${b}$ cm인 정사각형을 될 수 있는 대로 많이 잘라 냈습니다. 남은 직사각형의 네 변의 길이의 합은 몇 cm인가요?`,
          answer: { type: 'num', value: 2 * (rr + b), unit: 'cm' },
          steps: [
            `$${a}\\div${b}=${k}\\cdots${rr}$ → 정사각형 $${k}$개를 잘라 내고 가로 $${rr}$ cm가 남아요.`,
            `남은 직사각형: 가로 $${rr}$ cm, 세로 $${b}$ cm`,
            `$${rr}+${b}+${rr}+${b}=${2 * (rr + b)}$ (cm)`,
          ],
        };
      }
      const big = level === 2 ? 40 : 100;
      const { a, b, ev } = until(
        () => {
          const b = r.int(4, big - 5),
            a = r.int(b + 1, big);
          return { a, b, ev: euclid(a, b) };
        },
        (v) => v.ev.length >= (level === 2 ? 2 : 3) && v.ev.length <= (level === 2 ? 4 : 5) && sum(v.ev.map((e) => e.q)) <= (level === 2 ? 10 : 14),
      );
      const cnt = sum(ev.map((e) => e.q));
      const last = ev[ev.length - 1];
      const stageT = (e: (typeof ev)[number]) => `가로 $${e.a}$ cm, 세로 $${e.b}$ cm → 한 변이 $${e.s}$ cm인 정사각형 $${e.q}$개${e.a % e.b ? `, 남은 종이는 가로 $${e.b}$ cm, 세로 $${e.a % e.b}$ cm` : ''}`;
      const intro = `직사각형 모양의 종이에서 가장 큰 정사각형을 잘라 내고, 남은 종이에서 다시 가장 큰 정사각형을 잘라 내는 일을 남는 종이가 없을 때까지 계속합니다.`;
      if (level === 2)
        return {
          q: `가로가 $${a}$ cm, 세로가 $${b}$ cm인 ${intro} 잘라 낸 정사각형은 모두 몇 개인가요?`,
          answer: { type: 'num', value: cnt, unit: '개' },
          steps: [...ev.map(stageT), `모두 $${ev.map((e) => e.q).join('+')}=${cnt}$ (개)`],
          hint: '가장 큰 정사각형의 한 변은 짧은 변의 길이와 같아요.',
        };
      if (r.chance(0.5))
        return {
          q: `가로가 $${a}$ cm, 세로가 $${b}$ cm인 ${intro} 잘라 낸 정사각형은 모두 몇 개이고, 가장 작은 정사각형의 한 변은 몇 cm인가요?`,
          answer: {
            type: 'fields',
            fields: [
              { label: '정사각형의 수', value: cnt, unit: '개' },
              { label: '가장 작은 정사각형의 한 변', value: last.s, unit: 'cm' },
            ],
          },
          steps: [...ev.map(stageT), `정사각형은 모두 $${cnt}$개, 가장 작은 것의 한 변은 $${last.s}$ cm`],
          hint: '가장 큰 정사각형의 한 변은 짧은 변의 길이와 같아요.',
        };
      const rev = [...ev].reverse();
      return {
        q: `어떤 직사각형 모양의 종이에서 ${intro.replace('직사각형 모양의 종이에서 ', '')} 잘라 낸 정사각형은 차례로 ${ev.map((e) => `한 변이 $${e.s}$ cm인 것 $${e.q}$개`).join(', ')}였습니다. 처음 직사각형의 네 변의 길이의 합은 몇 cm인가요?`,
        answer: { type: 'num', value: 2 * (a + b), unit: 'cm' },
        steps: [
          `거꾸로 생각해요. 마지막 종이는 한 변이 $${last.s}$ cm인 정사각형 $${last.q}$개로 꼭 나누어졌으니 가로 $${last.a}$ cm, 세로 $${last.b}$ cm`,
          ...rev.slice(1).map((e) => `그 전 종이: 한 변이 $${e.s}$ cm인 정사각형 $${e.q}$개와 그 남은 종이를 합치면 가로 $${e.s}\\times${e.q}+${e.a % e.b}=${e.a}$ (cm), 세로 $${e.b}$ cm`),
          `처음 종이의 둘레: $(${a}+${b})\\times2=${2 * (a + b)}$ (cm)`,
        ],
        hint: '마지막에 잘라 낸 정사각형부터 거꾸로 붙여 보세요.',
      };
    },
  },
];

function rectFig(kind: 'strip' | 'pin', k: number, a: number, b: number): string {
  const s = new Svg(200, 180);
  if (kind === 'strip') {
    const S = 150,
      x0 = 25,
      y0 = 15;
    for (let i = 0; i < k; i++) s.rect(x0 + (i * S) / k, y0, S / k, S, { cls: 'acc', fill: i % 2 === 0 });
    return s.toString();
  }
  const S = 150,
    x0 = 25,
    y0 = 15,
    u = S / (a + b);
  const R = (x: number, y: number, w: number, h: number, f: boolean) => s.rect(x0 + x * u, y0 + y * u, w * u, h * u, { cls: 'acc', fill: f });
  R(0, 0, a, b, true);
  R(a, 0, b, a, false);
  R(b, a, a, b, true);
  R(0, b, b, a, false);
  return s.toString();
}

const TOP_E4B4: Skill[] = [
  {
    id: 'top-rect-rearrange',
    title: '같은 직사각형을 이어 붙인 도형의 둘레',
    gen(r) {
      if (r.chance(0.5)) {
        const k = r.int(3, 5),
          w = r.int(2, 9);
        const s = k * w;
        const row = r.chance(0.5);
        return {
          q: `크기가 같은 직사각형 $${k}$개를 그림과 같이 겹치지 않게 이어 붙였더니 네 변의 길이의 합이 $${4 * s}$ cm인 정사각형이 되었습니다. ${row ? `이 직사각형 $${k}$개를 짧은 변끼리 이어 붙여 한 줄로 길게 늘어놓으면, 만든 도형의 네 변의 길이의 합은 몇 cm인가요?` : '직사각형 한 개의 네 변의 길이의 합은 몇 cm인가요?'}`,
          fig: rectFig('strip', k, 0, 0),
          answer: { type: 'num', value: row ? 2 * (k * s + w) : 2 * (s + w), unit: 'cm' },
          steps: [
            `정사각형의 한 변: $${4 * s}\\div4=${s}$ (cm)`,
            `직사각형의 긴 변은 정사각형의 한 변과 같아요: $${s}$ cm`,
            `직사각형의 짧은 변 $${k}$개를 이으면 정사각형의 한 변이 되므로 짧은 변 $=${s}\\div${k}=${w}$ (cm)`,
            ...(row
              ? [`짧은 변끼리 이어 한 줄로 놓으면 가로 $${s}\\times${k}=${k * s}$ (cm), 세로 $${w}$ cm인 직사각형이 돼요.`, `둘레: $${k * s}+${w}+${k * s}+${w}=${2 * (k * s + w)}$ (cm)`]
              : [`직사각형 한 개의 둘레: $${s}+${w}+${s}+${w}=${2 * (s + w)}$ (cm)`, `답: $${2 * (s + w)}$ cm`]),
          ],
          hint: '정사각형의 한 변이 직사각형의 긴 변, 짧은 변과 어떤 관계인지 그림에서 찾아보세요.',
        };
      }
      const { a, b } = until(
        () => ({ a: r.int(4, 15), b: r.int(2, 12) }),
        (v) => v.a - v.b >= 2,
      );
      const long = r.chance(0.5);
      return {
        q: `크기가 같은 직사각형 $4$개를 그림과 같이 이어 붙였더니 가운데에 정사각형 모양의 빈 곳이 생겼습니다. 바깥쪽 큰 정사각형의 네 변의 길이의 합은 $${4 * (a + b)}$ cm이고, 가운데 빈 정사각형의 네 변의 길이의 합은 $${4 * (a - b)}$ cm입니다. 직사각형 한 개의 ${long ? '긴 변' : '짧은 변'}은 몇 cm인가요?`,
        fig: rectFig('pin', 4, a, b),
        answer: { type: 'num', value: long ? a : b, unit: 'cm' },
        steps: [
          `큰 정사각형의 한 변: $${4 * (a + b)}\\div4=${a + b}$ (cm) → (긴 변) $+$ (짧은 변) $=${a + b}$`,
          `빈 정사각형의 한 변: $${4 * (a - b)}\\div4=${a - b}$ (cm) → (긴 변) $-$ (짧은 변) $=${a - b}$`,
          `두 길이를 더하면 긴 변의 $2$배: $${a + b}+${a - b}=${2 * a}$`,
          `긴 변 $=${2 * a}\\div2=${a}$ (cm)`,
          `짧은 변 $=${a + b}-${a}=${b}$ (cm)`,
          `답: $${long ? a : b}$ cm`,
        ],
        hint: '큰 정사각형의 한 변과 빈 정사각형의 한 변을 직사각형의 긴 변과 짧은 변으로 나타내 보세요.',
      };
    },
  },
  {
    id: 'top-rhombus-equi-in',
    title: '마름모 안의 정삼각형으로 각 구하기',
    gen(r) {
      const beta = until(
        () => r.int(35, 55) * 2,
        () => true,
      );
      const sq = beta === 90;
      const ask = r.pick(['ㄴㅁㄷ', 'ㅁㄷㄴ', 'ㅁㄴㄷ'] as const);
      const B: Pt = [0, 0],
        C: Pt = [1, 0],
        A: Pt = dir(beta);
      const Dd: Pt = [A[0] + 1, A[1]];
      const M: Pt = [(A[0] + Dd[0]) / 2, A[1] - Math.sqrt(3) / 2];
      const nm2 = sq ? '정사각형' : '마름모';
      const apD = beta - 60,
        baseD = (240 - beta) / 2;
      const apA = 120 - beta,
        baseA = (60 + beta) / 2;
      const ans = ask === 'ㄴㅁㄷ' ? 150 : ask === 'ㅁㄷㄴ' ? (120 - beta) / 2 : (beta - 60) / 2;
      const AK = { ㄴㅁㄷ: { at: 'ㅁ', a: 'ㄴ', b: 'ㄷ' }, ㅁㄷㄴ: { at: 'ㄷ', a: 'ㅁ', b: 'ㄴ' }, ㅁㄴㄷ: { at: 'ㄴ', a: 'ㅁ', b: 'ㄷ' } }[ask];
      const fig = geoFig({
        P: { ㄱ: A, ㄴ: B, ㄷ: C, ㄹ: Dd, ㅁ: M },
        polys: [
          ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'],
          ['ㄱ', 'ㅁ', 'ㄹ'],
        ],
        segs: [
          { a: 'ㄴ', b: 'ㅁ' },
          { a: 'ㄷ', b: 'ㅁ' },
        ],
        angles: [...(sq ? [] : [{ at: 'ㄹ', a: 'ㄱ', b: 'ㄷ', text: `${beta}°` }]), { ...AK, text: '?' }],
        labelDir: { ㅁ: [0, -1] },
        w: 260,
        h: 200,
      });
      const steps = [
        `${nm2}의 네 변과 정삼각형의 세 변은 길이가 모두 같아요 (변 ㄱㄹ을 함께 써요).`,
        `삼각형 ㄹㅁㄷ: 변 ㄹㅁ $=$ 변 ㄹㄷ인 이등변삼각형, 각 ㅁㄹㄷ $=${deg(beta)}-60^{\\circ}=${deg(apD)}$ → 각 ㄹㅁㄷ $=$ 각 ㄹㄷㅁ $=(180^{\\circ}-${deg(apD)})\\div2=${deg(baseD)}$`,
        `각 ㄴㄱㄹ $=180^{\\circ}-${deg(beta)}=${deg(180 - beta)}$이므로 각 ㅁㄱㄴ $=${deg(180 - beta)}-60^{\\circ}=${deg(apA)}$`,
        `삼각형 ㄱㄴㅁ: 변 ㄱㅁ $=$ 변 ㄱㄴ인 이등변삼각형 → 각 ㄱㅁㄴ $=$ 각 ㄱㄴㅁ $=(180^{\\circ}-${deg(apA)})\\div2=${deg(baseA)}$`,
      ];
      if (ask === 'ㄴㅁㄷ')
        steps.push(`점 ㅁ 둘레의 각은 모두 $360^{\\circ}$: 각 ㄴㅁㄷ $=360^{\\circ}-60^{\\circ}-${deg(baseD)}-${deg(baseA)}=150^{\\circ}$`, `(${nm2}의 각이 얼마이든 늘 $150^{\\circ}$가 돼요.)`);
      else if (ask === 'ㅁㄷㄴ') steps.push(`각 ㄹㄷㄴ $=180^{\\circ}-${deg(beta)}=${deg(180 - beta)}$`, `각 ㅁㄷㄴ $=${deg(180 - beta)}-${deg(baseD)}=${deg(ans)}$`);
      else steps.push(`각 ㄱㄴㄷ $=$ 각 ㄱㄹㄷ $=${deg(beta)}$ (마주 보는 각)`, `각 ㅁㄴㄷ $=${deg(beta)}-${deg(baseA)}=${deg(ans)}$`);
      return {
        q: `${nm2} ㄱㄴㄷㄹ 안에 변 ㄱㄹ을 한 변으로 하는 정삼각형 ㄱㅁㄹ을 그리고, 점 ㅁ을 점 ㄴ, 점 ㄷ과 각각 이었습니다. ${sq ? '' : `각 ㄱㄹㄷ이 $${deg(beta)}$일 때, `}각 ${ask}은 몇 도인가요?`,
        fig,
        answer: { type: 'num', value: ans, unit: '°' },
        steps,
        hint: '길이가 같은 변을 찾아 이등변삼각형을 찾아보세요.',
      };
    },
  },
];

// ═════════════ e4b-5 꺾은선그래프 ═════════════
/** 세로축 아래쪽에 물결선(≈) — lineChart 좌표(left=40, bottom=170)에 맞춤 */
function addWave(svg: string): string {
  const mark =
    '<line x1="34" y1="172" x2="34" y2="174"/>' +
    '<path d="M27,176 q3,-3 6,0 t6,0" class="nofill"/>' +
    '<path d="M27,181 q3,-3 6,0 t6,0" class="nofill"/>' +
    '<line x1="34" y1="183" x2="34" y2="186"/>' +
    '<text x="30" y="193" text-anchor="end" dominant-baseline="middle" font-size="10" class="muted">0</text>';
  return svg.replace(/<\/svg>\s*$/, mark + '</svg>');
}
function chart(labels: string[], vals: number[], unit: string, tick: number): string {
  const lo = Math.max(0, Math.floor(Math.min(...vals) / tick) * tick - tick);
  const hi = Math.ceil(Math.max(...vals) / tick) * tick + tick;
  const raw = lineChart(labels, vals, { unit, min: lo, max: hi, step: tick });
  return lo > 0 ? addWave(raw) : raw;
}
const CLUE_TH = [
  { subj: '운동장의 기온', what: '기온', unit: '°C', labs: ['오전 10시', '오전 11시', '낮 12시', '오후 1시', '오후 2시'], lo: 5, hi: 25, dmax: 5, up: '높았', dn: '낮았', was: '였습니다', big: '높았던', small: '낮았던' },
  { subj: '도서관 방문자 수', what: '방문자 수', unit: '명', labs: ['월요일', '화요일', '수요일', '목요일', '금요일'], lo: 30, hi: 120, dmax: 20, up: '많았', dn: '적었', was: '이었습니다', big: '많았던', small: '적었던' },
  { subj: '빵 판매량', what: '판매량', unit: '개', labs: ['1주', '2주', '3주', '4주', '5주'], lo: 20, hi: 90, dmax: 15, up: '많았', dn: '적었', was: '였습니다', big: '많았던', small: '적었던' },
];

const E4B5: Skill[] = [
  {
    id: 'line-clue',
    title: '설명을 보고 꺾은선그래프의 값 알아내기',
    gen(r, level) {
      const th = r.pick(CLUE_TH);
      const n = level === 1 ? 4 : 5;
      const vals = until(
        () => {
          const v = [r.int(th.lo + th.dmax, th.hi - th.dmax)];
          for (let i = 1; i < n; i++) v.push(v[i - 1] + r.nonzero(-th.dmax, th.dmax));
          return v;
        },
        (v) => v.every((x) => x >= th.lo && x <= th.hi) && new Set(v).size === n && v.filter((x) => x === Math.max(...v)).length === 1 && v.filter((x) => x === Math.min(...v)).length === 1,
      );
      const d = vals.slice(1).map((v, i) => v - vals[i]);
      const clauses = d.map((x, i) => `${th.labs[i + 1]}에는 ${th.labs[i]}보다 $${Math.abs(x)}$${th.unit} ${x > 0 ? th.up : th.dn}${i === d.length - 1 ? '습니다' : '고'}`).join(', ');
      const W = J(th.what, '은/는');
      const intro = `${J(th.subj, '을/를')} 조사하여 꺾은선그래프로 나타내려고 합니다.`;
      if (level === 1)
        return {
          q: `${intro} ${th.labs[0]}의 ${W} $${vals[0]}$${th.unit}${th.was}. ${clauses}. ${th.labs[n - 1]}의 ${W} 몇 ${th.unit}인가요?`,
          answer: { type: 'num', value: vals[n - 1], unit: th.unit },
          steps: [
            ...d.map((x, i) => `${th.labs[i + 1]}: $${vals[i]}${x > 0 ? '+' : '-'}${Math.abs(x)}=${vals[i + 1]}$`),
            `답: $${vals[n - 1]}$${th.unit}`,
          ],
        };
      const mxv = Math.max(...vals),
        mnv = Math.min(...vals);
      if (level === 2)
        return {
          q: `${intro} ${th.labs[0]}의 ${W} $${vals[0]}$${th.unit}${th.was}. ${clauses}. ${J(th.what, '이/가')} 가장 ${th.big} 때와 가장 ${th.small} 때의 차는 몇 ${th.unit}인가요?`,
          answer: { type: 'num', value: mxv - mnv, unit: th.unit },
          steps: [
            `차례로 구하면 ${vals.map((v, i) => `${th.labs[i]} $${v}$`).join(', ')}`,
            `가장 ${th.big} 때 $${mxv}$${th.unit}, 가장 ${th.small} 때 $${mnv}$${th.unit}`,
            `차: $${mxv}-${mnv}=${mxv - mnv}$ (${th.unit})`,
          ],
          hint: '먼저 모든 때의 값을 차례로 구해요.',
        };
      const useMax = r.chance(0.5);
      const off = vals.map((v) => v - vals[0]);
      const key = useMax ? mxv : mnv;
      const ki = vals.indexOf(key);
      const ask = until(
        () => r.int(0, n - 1),
        (t) => t !== ki,
      );
      const offT = (o: number) => (o === 0 ? '□' : `□${o > 0 ? '+' : '-'}${Math.abs(o)}`);
      return {
        q: `${intro} ${clauses}. ${J(th.what, '이/가')} 가장 ${useMax ? th.big : th.small} 때의 ${W} $${key}$${th.unit}${th.was}. ${th.labs[ask]}의 ${W} 몇 ${th.unit}인가요?`,
        answer: { type: 'num', value: vals[ask], unit: th.unit },
        steps: [
          `${th.labs[0]}의 ${J(th.what, '을/를')} □라 하면 차례로 ${off.map((o, i) => `${th.labs[i]} ${offT(o)}`).join(', ')}`,
          `가장 ${useMax ? th.big : th.small} 때는 ${th.labs[ki]}(${offT(off[ki])})${josa(th.labs[ki], '이에요/예요')}.`,
          off[ki] === 0 ? `따라서 □ $=${vals[0]}$` : `${offT(off[ki])} $=${key}$ → □ $=${vals[0]}$`,
          `${th.labs[ask]}: ${offT(off[ask])} $=${vals[ask]}$ (${th.unit})`,
        ],
        hint: '처음 값을 □로 놓고 나머지를 □로 나타내 보세요.',
      };
    },
  },
  {
    id: 'line-vs-table',
    title: '꺾은선그래프와 표를 함께 읽기',
    gen(r, level) {
      const temp = r.chance(0.5);
      const th = temp
        ? { g: '가 마을', t: '나 마을', what: '기온', unit: '°C', labs: ['9시', '11시', '1시', '3시', '5시'], long: ['오전 9시', '오전 11시', '오후 1시', '오후 3시', '오후 5시'], tick: 2, lo: 4, hi: 13, head: '시각' }
        : { g: '가 가게', t: '나 가게', what: '빵 판매량', unit: '개', labs: ['월', '화', '수', '목', '금'], long: ['월요일', '화요일', '수요일', '목요일', '금요일'], tick: 5, lo: 5, hi: 16, head: '요일' };
      const crit = (gv: number[], tv: number[]) => {
        if (level === 1) return true;
        const dv = gv.map((x, i) => Math.abs(x - tv[i]));
        if (level === 2) return dv.filter((x) => x === Math.max(...dv)).length === 1;
        const base = temp ? dv : gv.map((x, i) => x + tv[i]);
        const ch = base.slice(1).map((x, i) => x - base[i]);
        const m = Math.max(...ch);
        return m > 0 && ch.filter((x) => x === m).length === 1;
      };
      const { gv, tv } = until(
        () => {
          let g0 = r.int(th.lo, th.hi);
          const gv = th.labs.map((_, i) => {
            if (i > 0) g0 = Math.min(th.hi, Math.max(th.lo, g0 + r.int(-2, 2)));
            return g0 * th.tick;
          });
          const off = r.nonzero(-4, 4);
          const tv = gv.map((x) => x + (temp ? off + r.int(-2, 2) : r.nonzero(-3 * th.tick, 3 * th.tick) + r.int(-2, 2)));
          return { gv, tv };
        },
        (v) => new Set(v.gv).size >= 4 && v.tv.every((x) => x > 0) && v.gv.every((x, i) => x !== v.tv[i]) && crit(v.gv, v.tv),
      );
      const fig = chart(th.labs, gv, th.unit, th.tick);
      const table = [[th.head, ...th.long], [`${th.t} ${th.what}(${th.unit})`, ...tv.map((x) => `$${x}$`)]];
      const intro = `${th.g}의 ${J(th.what, '은/는')} 꺾은선그래프로, ${th.t}의 ${J(th.what, '은/는')} 표로 나타냈습니다.`;
      const dv = gv.map((x, i) => Math.abs(x - tv[i]));
      if (level === 1) {
        const i = r.int(0, 4);
        return {
          q: `${intro} ${th.long[i]}에 두 ${temp ? '마을' : '가게'}의 ${th.what}의 차는 몇 ${th.unit}인가요?`,
          fig,
          table,
          answer: { type: 'num', value: dv[i], unit: th.unit },
          steps: [`그래프에서 ${th.g}: $${gv[i]}$${th.unit}, 표에서 ${th.t}: $${tv[i]}$${th.unit}`, `차: $${Math.max(gv[i], tv[i])}-${Math.min(gv[i], tv[i])}=${dv[i]}$ (${th.unit})`],
        };
      }
      if (level === 2) {
        const m = Math.max(...dv);
        const i = dv.indexOf(m);
        return {
          q: `${intro} 두 ${temp ? '마을' : '가게'}의 ${th.what}의 차가 가장 큰 때의 차는 몇 ${th.unit}인가요?`,
          fig,
          table,
          answer: { type: 'num', value: m, unit: th.unit },
          steps: [`그래프에서 읽은 ${th.g}: ${gv.map((x) => `$${x}$`).join(', ')}`, `때마다 차: ${dv.map((x, k) => `${th.long[k]} $${x}$`).join(', ')}`, `가장 큰 때는 ${th.long[i]}, 차는 $${m}$${th.unit}`],
          hint: '때마다 두 값의 차를 모두 구해 비교해요.',
        };
      }
      const base = temp ? dv : gv.map((x, i) => x + tv[i]);
      const ch = base.slice(1).map((x, i) => x - base[i]);
      const m = Math.max(...ch);
      const i = ch.indexOf(m);
      return {
        q: temp
          ? `${intro} 두 마을의 기온의 차가 바로 전 시각보다 가장 많이 커진 때는 바로 전보다 몇 °C 더 커졌나요?`
          : `${intro} 두 가게의 빵 판매량을 합한 것이 전날보다 가장 많이 늘어난 날은 전날보다 몇 개 늘었나요?`,
        fig,
        table,
        answer: { type: 'num', value: m, unit: th.unit },
        steps: [
          `그래프에서 읽은 ${th.g}: ${gv.map((x) => `$${x}$`).join(', ')}`,
          `${temp ? '두 마을의 기온의 차' : '두 가게의 판매량의 합'}: ${base.map((x, k) => `${th.long[k]} $${x}$`).join(', ')}`,
          `바로 전과 비교한 변화: ${ch.map((x, k) => `${th.long[k + 1]} $${x >= 0 ? '+' : '-'}${Math.abs(x)}$`).join(', ')}`,
          `가장 많이 늘어난 때는 ${th.long[i + 1]}, $${m}$${th.unit}`,
        ],
        hint: temp ? '먼저 때마다 두 마을의 기온의 차를 구해요.' : '먼저 날마다 두 가게의 판매량을 더해요.',
      };
    },
  },
  {
    id: 'line-grid-cells',
    title: '세로 눈금 칸 수와 물결선',
    gen(r, level) {
      // 값은 정수로 다루고 sc 로 나누어 보임 (sc=10: 소수 한 자리)
      const TH = [
        { subj: '학생 수', u: '명', wa: '과', ro: '으로', reul: '을', was: '이었습니다', sc: 1, t1s: [5, 10], t2s: [2, 5], lo: 100, hi: 400 },
        { subj: '키', u: 'cm', wa: '와', ro: '로', reul: '를', was: '였습니다', sc: 1, t1s: [5, 10], t2s: [1, 2, 5], lo: 100, hi: 160 },
        { subj: '체온', u: '°C', wa: '와', ro: '로', reul: '를', was: '였습니다', sc: 10, t1s: [5], t2s: [1, 2], lo: 355, hi: 395 },
      ];
      const th = r.pick(TH);
      const S = (v: number) => (th.sc === 1 ? String(v) : dd(v / th.sc));
      if (level === 1) {
        const t = r.pick(th.sc === 1 ? [2, 5, 10] : [1, 2]);
        const { A, B } = until(
          () => ({ A: r.int(th.lo / t, th.hi / t) * t, B: r.int(th.lo / t, th.hi / t) * t }),
          (v) => v.B - v.A >= 2 * t && (v.B - v.A) / t <= 15,
        );
        const cells = (B - A) / t;
        return {
          q: `${J(th.subj, '을/를')} 나타낸 꺾은선그래프의 세로 눈금 한 칸은 $${S(t)}$${th.u}입니다. $${S(A)}$${th.u}${th.wa} $${S(B)}$${th.u}${th.reul} 나타내는 두 점은 세로 눈금 몇 칸만큼 차이가 나나요?`,
          answer: { type: 'num', value: cells, unit: '칸' },
          steps: [`두 값의 차: $${S(B)}-${S(A)}=${S(B - A)}$ (${th.u})`, th.sc === 1 ? `한 칸이 $${t}$${th.u}이므로 $${B - A}\\div${t}=${cells}$ (칸)` : `$${S(B - A)}$는 $${S(t)}$가 $${cells}$개이므로 $${cells}$칸`],
        };
      }
      if (level === 2) {
        const t = r.pick(th.t2s);
        const s = r.int(th.lo / t, (th.lo + th.hi) / 2 / t) * t;
        const cells = r.int(3, 14);
        const v = s + cells * t;
        const fwd = r.chance(0.5);
        const intro = `${J(th.subj, '을/를')} 꺾은선그래프로 나타내려고 합니다. 물결선을 사용하여 세로 눈금을 $${S(s)}$${th.u}부터 시작하고, 세로 눈금 한 칸을 $${S(t)}$${th.u}${th.ro} 정했습니다.`;
        return fwd
          ? {
              q: `${intro} $${S(v)}$${J(th.u, '은/는')} $${S(s)}$${th.u}에서 몇 칸 위에 점을 찍어야 하나요?`,
              answer: { type: 'num', value: cells, unit: '칸' },
              steps: [`$${S(v)}-${S(s)}=${S(v - s)}$ (${th.u})`, th.sc === 1 ? `$${v - s}\\div${t}=${cells}$ → $${cells}$칸 위` : `$${S(v - s)}$는 $${S(t)}$가 $${cells}$개 → $${cells}$칸 위`],
              hint: '물결선 위의 첫 눈금이 0 대신 시작하는 값이에요.',
            }
          : {
              q: `${intro} $${S(s)}$${th.u}에서 $${cells}$칸 위에 찍힌 점은 몇 ${th.u}${th.reul} 나타내나요?`,
              answer: th.sc === 1 ? { type: 'num', value: v, unit: th.u } : { type: 'num', value: v / th.sc, unit: th.u, display: 'dec' },
              steps: [th.sc === 1 ? `$${cells}$칸은 $${t}\\times${cells}=${cells * t}$ (${th.u})` : `$${cells}$칸은 $${S(t)}$가 $${cells}$개 → $${S(cells * t)}$ (${th.u})`, `$${S(s)}+${S(cells * t)}=${S(v)}$ (${th.u})`],
              hint: '물결선 위의 첫 눈금이 0 대신 시작하는 값이에요.',
            };
      }
      const g = until(
        () => {
          const t1 = r.pick(th.t1s),
            t2 = r.pick(th.t2s);
          const m = r.int(2, 8);
          const L = r.int(th.lo / t2, (th.lo + th.hi) / 2 / t2) * t2;
          const s = L - r.int(1, 4) * t2;
          return { t1, t2, m, L, s };
        },
        (v) => v.t2 < v.t1 && (v.m * v.t1) % v.t2 === 0 && v.s > 0 && (v.L + v.m * v.t1 - v.s) / v.t2 <= 40,
      );
      const Hv = g.L + g.m * g.t1;
      const cells = (Hv - g.s) / g.t2;
      return {
        q: `${J(th.subj, '을/를')} 세로 눈금 한 칸이 $${S(g.t1)}$${th.u}인 꺾은선그래프로 나타냈더니, 가장 높은 점이 가장 낮은 점보다 $${g.m}$칸 위에 있었고 가장 낮은 값은 $${S(g.L)}$${th.u}${th.was}. 같은 자료를 물결선을 사용하여 $${S(g.s)}$${th.u}부터 시작하고 세로 눈금 한 칸을 $${S(g.t2)}$${th.u}${th.ro} 하여 다시 그리면, 가장 높은 점은 $${S(g.s)}$${th.u}에서 몇 칸 위에 찍히나요?`,
        answer: { type: 'num', value: cells, unit: '칸' },
        steps: [
          `가장 높은 값과 가장 낮은 값의 차: $${S(g.t1)}$${th.u}씩 $${g.m}$칸 → $${S(g.m * g.t1)}$${th.u}`,
          `가장 높은 값: $${S(g.L)}+${S(g.m * g.t1)}=${S(Hv)}$ (${th.u})`,
          `다시 그린 그래프에서 $${S(g.s)}$${th.u}부터의 차: $${S(Hv)}-${S(g.s)}=${S(Hv - g.s)}$ (${th.u})`,
          th.sc === 1 ? `한 칸이 $${g.t2}$${th.u}이므로 $${Hv - g.s}\\div${g.t2}=${cells}$ (칸)` : `$${S(Hv - g.s)}$는 $${S(g.t2)}$가 $${cells}$개 → $${cells}$칸`,
        ],
        hint: '먼저 가장 높은 값이 실제로 얼마인지 구해요.',
      };
    },
  },
];

const TOP_E4B5: Skill[] = [
  {
    id: 'top-growth-graph',
    title: '하루 동안 자란 길이 그래프로 키 구하기',
    gen(r) {
      const n = r.int(6, 7);
      const labs = Array.from({ length: n }, (_, i) => `${i + 1}일`);
      const ask = r.pick(['final', 'first', 'trap', 'between'] as const);
      const g = until(
        () => Array.from({ length: n }, () => r.int(1, 6)),
        (v) => {
          const m = Math.max(...v);
          const pk = v.indexOf(m);
          return new Set(v).size >= 4 && v.filter((x) => x === m).length === 1 && pk < n - 2;
        },
      );
      const h0 = r.int(5, 20);
      const H: number[] = [];
      g.reduce((acc, x) => {
        H.push(acc + x);
        return acc + x;
      }, h0);
      const fig = lineChart(labs, g, { unit: 'cm', min: 0, max: Math.max(...g) + 1, step: 1 });
      const intro = `강낭콩 싹이 하루 동안 자란 길이를 날마다 재어 나타낸 꺾은선그래프입니다. 관찰을 시작할 때 싹의 키는 $${h0}$ cm였습니다.`;
      const base = [
        `이 그래프의 세로 눈금은 싹의 키가 아니라 '그날 하루 동안 자란 길이'예요.`,
        `날마다 자란 길이: ${g.map((x, i) => `${i + 1}일째 $${x}$`).join(', ')} (cm)`,
        `날마다의 키 = 전날 키 + 그날 자란 길이: ${H.map((x, i) => `${i + 1}일째 $${x}$`).join(', ')} (cm)`,
      ];
      if (ask === 'final')
        return {
          q: `${intro} ${n}일째가 끝났을 때 싹의 키는 몇 cm인가요?`,
          fig,
          answer: { type: 'num', value: H[n - 1], unit: 'cm' },
          steps: [...base, `또는 한 번에: $${h0}+${g.join('+')}=${H[n - 1]}$`, `답: $${H[n - 1]}$ cm`],
          hint: '그래프의 값은 키가 아니라 자란 길이예요.',
        };
      if (ask === 'first') {
        const j = r.int(2, n - 1); // 0-based day index j (3일째 이상)
        const T = r.int(H[j - 1] + 1, H[j]);
        return {
          q: `${intro} 싹의 키가 처음으로 $${T}$ cm 이상이 된 것은 며칠째인가요?`,
          fig,
          answer: { type: 'num', value: j + 1, unit: '일째' },
          steps: [...base, `${j}일째에는 $${H[j - 1]}$ cm로 $${T}$ cm보다 작고, ${j + 1}일째에 $${H[j]}$ cm가 되어 처음으로 $${T}$ cm 이상이 돼요.`, `답: ${j + 1}일째`],
          hint: '그래프의 값을 차례로 더해 날마다의 키를 구해요.',
        };
      }
      if (ask === 'trap') {
        const pk = g.indexOf(Math.max(...g));
        return {
          q: `${intro} 지호는 "그래프가 가장 높은 ${pk + 1}일째에 싹의 키가 가장 컸어요."라고 말했습니다. 실제로 싹의 키가 가장 컸던 것은 며칠째가 끝났을 때이고, 그때의 키는 몇 cm인가요?`,
          fig,
          answer: {
            type: 'fields',
            fields: [
              { label: '며칠째', value: n, unit: '일째' },
              { label: '키', value: H[n - 1], unit: 'cm' },
            ],
          },
          steps: [
            ...base,
            `${pk + 1}일째는 하루 동안 가장 많이 자란 날일 뿐이에요.`,
            `싹은 날마다 조금씩이라도 자라므로 키는 마지막 날인 ${n}일째에 가장 커요.`,
            `답: ${n}일째, $${H[n - 1]}$ cm`,
          ],
          hint: '그래프의 값이 줄어들어도 싹은 계속 자라고 있어요.',
        };
      }
      const i = r.int(1, n - 3),
        j = r.int(i + 2, n);
      const diff = H[j - 1] - H[i - 1];
      return {
        q: `${intro} ${i}일째가 끝났을 때와 ${j}일째가 끝났을 때의 싹의 키의 차는 몇 cm인가요?`,
        fig,
        answer: { type: 'num', value: diff, unit: 'cm' },
        steps: [
          base[0],
          base[1],
          `${i}일째가 끝난 뒤 ${j}일째가 끝날 때까지는 ${Array.from({ length: j - i }, (_, k) => `${i + k + 1}일째`).join(', ')}에 자란 길이만큼 자라요.`,
          `$${g.slice(i, j).join('+')}=${diff}$ (cm)`,
          `(확인: ${i}일째 $${H[i - 1]}$ cm, ${j}일째 $${H[j - 1]}$ cm)`,
          `답: $${diff}$ cm`,
        ],
        hint: '두 날 사이에 자란 길이만 더하면 돼요.',
      };
    },
  },
  {
    id: 'top-line-revenue',
    title: '판매량 그래프와 가격표로 판매 금액 비교하기',
    gen(r) {
      const th = r.pick([
        { it: '아이스크림', labs: ['4월', '5월', '6월', '7월', '8월'] },
        { it: '우산', labs: ['5월', '6월', '7월', '8월', '9월'] },
        { it: '붕어빵', labs: ['10월', '11월', '12월', '1월', '2월'] },
      ]);
      const ask = r.pick(['max', 'diff'] as const);
      const { cnt, pr } = until(
        () => ({ cnt: th.labs.map(() => r.int(3, 9) * 10), pr: th.labs.map(() => r.int(5, 15) * 100) }),
        (v) => {
          const rev = v.cnt.map((x, i) => x * v.pr[i]);
          const mc = Math.max(...v.cnt),
            mr = Math.max(...rev);
          return v.cnt.filter((x) => x === mc).length === 1 && rev.filter((x) => x === mr).length === 1 && v.cnt.indexOf(mc) !== rev.indexOf(mr) && new Set(v.cnt).size >= 4;
        },
      );
      const rev = cnt.map((x, i) => x * pr[i]);
      const mr = Math.max(...rev),
        ir = rev.indexOf(mr);
      const ic = cnt.indexOf(Math.max(...cnt));
      const fig = lineChart(th.labs, cnt, { unit: '개', min: 0, max: 100, step: 10 });
      const table = [['월', ...th.labs], ['한 개의 값(원)', ...pr.map((p) => `$${c(p)}$`)]];
      const intro = `어느 가게에서 달마다 판 ${th.it}의 수를 나타낸 꺾은선그래프와, 달마다 ${th.it} 한 개의 값을 나타낸 표입니다.`;
      return {
        q:
          ask === 'max'
            ? `${intro} ${J(th.it, '을/를')} 판 금액이 가장 많은 달의 판매 금액은 얼마인가요?`
            : `${intro} ${J(th.it, '을/를')} 가장 많이 판 달의 판매 금액과, 판매 금액이 가장 많은 달의 판매 금액의 차는 얼마인가요?`,
        fig,
        table,
        answer: { type: 'num', value: ask === 'max' ? mr : mr - rev[ic], unit: '원' },
        steps: [
          `그래프에서 판 개수: ${cnt.map((x, i) => `${th.labs[i]} $${x}$개`).join(', ')}`,
          '판매 금액 $=$ (판 개수) $\\times$ (한 개의 값)',
          `${rev.map((x, i) => `${th.labs[i]} $${cnt[i]}\\times${c(pr[i])}=${c(x)}$`).join(', ')} (원)`,
          `판매 금액이 가장 많은 달: ${th.labs[ir]} ($${c(mr)}$원)`,
          `가장 많이 판 달(${th.labs[ic]})과 판매 금액이 가장 많은 달은 서로 달라요. 값이 달마다 다르기 때문이에요.`,
          ask === 'max' ? `답: $${c(mr)}$원` : `차: $${c(mr)}-${c(rev[ic])}=${c(mr - rev[ic])}$ (원)`,
        ],
        hint: '많이 판 달이 꼭 판매 금액도 많은 것은 아니에요.',
      };
    },
  },
];

// ═════════════ e4b-6 다각형 ═════════════
const IAN: Record<number, number> = { 3: 60, 4: 90, 5: 108, 6: 120, 8: 135, 10: 144, 12: 150 };
const REG = (n: number) => `정${POLY[n]}`;

const E4B6: Skill[] = [
  {
    id: 'poly-missing-angle',
    title: '다각형에서 모르는 각 구하기',
    gen(r, level) {
      const sumT = (n: number) => `${POLY[n]}은 한 꼭짓점에서 대각선을 그으면 삼각형 $${n - 2}$개로 나뉘므로 모든 각의 합은 $180^{\\circ}\\times${n - 2}=${deg((n - 2) * 180)}$`;
      if (level === 1 || (level === 2 && r.chance(0.5))) {
        const n = level === 1 ? 5 : 6;
        const S = (n - 2) * 180;
        const avg = S / n;
        const angles = until(
          () => {
            const a = Array.from({ length: n - 1 }, () => r.int(avg - 25, avg + 20));
            return [...a, S - sum(a)];
          },
          (a) => a[n - 1] >= avg - 30 && a[n - 1] <= Math.min(170, avg + 30),
        );
        const u = r.int(0, n - 1);
        const known = angles.filter((_, i) => i !== u);
        return {
          q: `그림과 같은 ${POLY[n]}에서 ㉠의 각도는 몇 도인가요?`,
          fig: polyFig(polyFromAngles(r, angles), { angles: angles.map((v, i) => (i === u ? '㉠' : `${v}°`)), w: 290, h: 240 }),
          answer: { type: 'num', value: angles[u], unit: '°' },
          steps: [sumT(n), `알고 있는 각의 합: $${known.join('+')}=${sum(known)}$ (°)`, `㉠ $=${deg(S)}-${deg(sum(known))}=${deg(angles[u])}$`],
          hint: '다각형을 삼각형으로 나누어 모든 각의 합을 구해요.',
        };
      }
      if (level === 2) {
        const angles = until(
          () => {
            const a = Array.from({ length: 3 }, () => r.int(90, 135));
            const x = (540 - sum(a)) / 2;
            return [...a, x, x];
          },
          (a) => Number.isInteger(a[3]) && a[3] >= 85 && a[3] <= 150,
        );
        const order = r.shuffle([0, 1, 2, 3, 4]);
        const arr = order.map((i) => angles[i]);
        const labs = order.map((i) => (i >= 3 ? '㉠' : `${angles[i]}°`));
        const known = angles.slice(0, 3);
        return {
          q: `그림과 같은 오각형에서 ㉠으로 표시한 두 각의 크기가 같습니다. ㉠의 각도는 몇 도인가요?`,
          fig: polyFig(polyFromAngles(r, arr), { angles: labs, w: 290, h: 240 }),
          answer: { type: 'num', value: angles[3], unit: '°' },
          steps: [sumT(5), `㉠ $+$ ㉠ $=540^{\\circ}-(${known.join('+')})^{\\circ}=${deg(2 * angles[3])}$`, `㉠ $=${deg(2 * angles[3])}\\div2=${deg(angles[3])}$`],
          hint: '먼저 오각형의 모든 각의 합을 구해요.',
        };
      }
      const n = r.pick([6, 7, 8]);
      const S = (n - 2) * 180;
      const avg = Math.round(S / n);
      const g = until(
        () => {
          const a = Array.from({ length: n }, () => r.int(avg - 22, Math.min(165, avg + 18)));
          const p = r.int(0, n - 1);
          let q = r.int(0, n - 1);
          while (q === p) q = r.int(0, n - 1);
          let e = r.int(0, n - 1);
          while (e === p || e === q) e = r.int(0, n - 1);
          const rest = S - sum(a.filter((_, i) => i !== p && i !== q));
          const x = rest / 2;
          a[p] = x;
          a[q] = x;
          return { a, p, q, e, x };
        },
        (v) => Number.isInteger(v.x) && v.x >= avg - 25 && v.x <= Math.min(168, avg + 25) && v.a[v.e] <= 165 && v.a[v.e] >= 95,
      );
      const ext = 180 - g.a[g.e];
      const pts = polyFromAngles(r, g.a);
      const labs = g.a.map((v, i) => (i === g.p || i === g.q ? '㉠' : i === g.e ? null : `${v}°`));
      const known = g.a.filter((_, i) => i !== g.p && i !== g.q && i !== g.e);
      const fig = polyFig(pts, {
        angles: labs,
        w: 310,
        h: 260,
        extra: (s, P) => {
          const V = P[g.e],
            Pv = P[(g.e - 1 + n) % n],
            Nx = P[(g.e + 1) % n];
          const L1 = Math.hypot(V[0] - Pv[0], V[1] - Pv[1]);
          const u: [number, number] = [(V[0] - Pv[0]) / L1, (V[1] - Pv[1]) / L1];
          const L2 = Math.hypot(Nx[0] - V[0], Nx[1] - V[1]);
          const w: [number, number] = [(Nx[0] - V[0]) / L2, (Nx[1] - V[1]) / L2];
          s.line(V[0], V[1], V[0] + u[0] * 30, V[1] + u[1] * 30, { cls: 'acc', dash: true });
          const dg = (v: [number, number]) => (Math.atan2(-v[1], v[0]) * 180) / Math.PI;
          let a1 = dg(u),
            a2 = dg(w);
          if ((((a2 - a1) % 360) + 360) % 360 > 180) [a1, a2] = [a2, a1];
          s.arc(V[0], V[1], 14, a1, a2, { cls: 'acc2' });
          const bx = u[0] + w[0],
            by = u[1] + w[1];
          const bl = Math.hypot(bx, by) || 1;
          s.text(V[0] + (bx / bl) * 28, V[1] + (by / bl) * 28, `${ext}°`, { size: 12 });
        },
      });
      return {
        q: `그림과 같은 ${POLY[n]}에서 ㉠으로 표시한 두 각의 크기가 같습니다. 점선은 변을 늘인 것입니다. ㉠의 각도는 몇 도인가요?`,
        fig,
        answer: { type: 'num', value: g.x, unit: '°' },
        steps: [
          sumT(n),
          `점선 쪽에 표시된 각이 $${deg(ext)}$이므로 그 꼭짓점의 안쪽 각은 $180^{\\circ}-${deg(ext)}=${deg(180 - ext)}$`,
          `알고 있는 안쪽 각의 합: $${[...known, 180 - ext].join('+')}=${sum(known) + 180 - ext}$ (°)`,
          `㉠ $+$ ㉠ $=${deg(S)}-${deg(sum(known) + 180 - ext)}=${deg(2 * g.x)}$ → ㉠ $=${deg(g.x)}$`,
        ],
        hint: '변을 늘인 직선과 변이 이루는 각과 안쪽 각의 합은 180°예요.',
      };
    },
  },
  {
    id: 'regular-diag-angle',
    title: '정다각형의 대각선이 만드는 각',
    gen(r, level) {
      const n = level === 3 ? r.pick([5, 6]) : r.pick([5, 6, 9, 10, 12]);
      const I = 180 - 360 / n;
      const base = 180 / n;
      const P: Record<string, Pt> = {};
      for (let i = 0; i < n; i++) P[KN[i]] = dir(90 + (360 * i) / n);
      const poly = [KN.slice(0, n)];
      const s0 = `${REG(n)}의 한 각: $180^{\\circ}\\times${n - 2}\\div${n}=${deg(I)}$`;
      if (level === 1) {
        return {
          q: `${REG(n)}에 대각선 ㄱㄷ을 그었습니다. 각 ㄴㄱㄷ은 몇 도인가요?`,
          fig: geoFig({ P, polys: poly, segs: [{ a: 'ㄱ', b: 'ㄷ' }], angles: [{ at: 'ㄱ', a: 'ㄴ', b: 'ㄷ', text: '?' }], w: 220, h: 210 }),
          answer: { type: 'num', value: base, unit: '°' },
          steps: [s0, '변 ㄴㄱ과 변 ㄴㄷ의 길이가 같으므로 삼각형 ㄱㄴㄷ은 이등변삼각형이에요.', `각 ㄴㄱㄷ $=(180^{\\circ}-${deg(I)})\\div2=${deg(base)}$`],
          hint: '정다각형은 변의 길이가 모두 같아요.',
        };
      }
      if (level === 2) {
        const vB = r.chance(0.5);
        return vB
          ? {
              q: `${REG(n)}에 대각선 ㄴㄹ을 그었습니다. 각 ㄱㄴㄹ은 몇 도인가요?`,
              fig: geoFig({ P, polys: poly, segs: [{ a: 'ㄴ', b: 'ㄹ' }], angles: [{ at: 'ㄴ', a: 'ㄱ', b: 'ㄹ', text: '?' }], w: 220, h: 210 }),
              answer: { type: 'num', value: I - base, unit: '°' },
              steps: [s0, `삼각형 ㄴㄷㄹ은 변 ㄷㄴ과 변 ㄷㄹ의 길이가 같은 이등변삼각형 → 각 ㄷㄴㄹ $=(180^{\\circ}-${deg(I)})\\div2=${deg(base)}$`, `각 ㄱㄴㄹ $=${deg(I)}-${deg(base)}=${deg(I - base)}$`],
              hint: '각 ㄱㄴㄷ을 두 각으로 나누어 생각해요.',
            }
          : {
              q: `${REG(n)}에 대각선 ㄱㄷ을 그었습니다. 각 ㄱㄷㄹ은 몇 도인가요?`,
              fig: geoFig({ P, polys: poly, segs: [{ a: 'ㄱ', b: 'ㄷ' }], angles: [{ at: 'ㄷ', a: 'ㄱ', b: 'ㄹ', text: '?' }], w: 220, h: 210 }),
              answer: { type: 'num', value: I - base, unit: '°' },
              steps: [s0, `삼각형 ㄱㄴㄷ은 이등변삼각형 → 각 ㄴㄷㄱ $=(180^{\\circ}-${deg(I)})\\div2=${deg(base)}$`, `각 ㄱㄷㄹ $=${deg(I)}-${deg(base)}=${deg(I - base)}$`],
              hint: '각 ㄴㄷㄹ을 두 각으로 나누어 생각해요.',
            };
      }
      const ask = r.pick(['ㄴㅍㄷ', 'ㄱㅍㄴ', 'ㄱㅍㄹ', 'ㄷㅍㄹ'] as const);
      const X = inter(P['ㄱ'], [P['ㄷ'][0] - P['ㄱ'][0], P['ㄷ'][1] - P['ㄱ'][1]], P['ㄴ'], [P['ㄹ'][0] - P['ㄴ'][0], P['ㄹ'][1] - P['ㄴ'][1]]);
      P['ㅍ'] = X;
      const big = ask === 'ㄴㅍㄷ' || ask === 'ㄱㅍㄹ';
      const AK = { ㄴㅍㄷ: { a: 'ㄴ', b: 'ㄷ' }, ㄱㅍㄴ: { a: 'ㄱ', b: 'ㄴ' }, ㄱㅍㄹ: { a: 'ㄱ', b: 'ㄹ' }, ㄷㅍㄹ: { a: 'ㄷ', b: 'ㄹ' } }[ask];
      const last =
        ask === 'ㄴㅍㄷ'
          ? []
          : ask === 'ㄱㅍㄴ'
            ? [`ㄱ, ㅍ, ㄷ은 한 직선 위에 있으므로 각 ㄱㅍㄴ $=180^{\\circ}-${deg(I)}=${deg(180 - I)}$`]
            : ask === 'ㄷㅍㄹ'
              ? [`ㄴ, ㅍ, ㄹ은 한 직선 위에 있으므로 각 ㄷㅍㄹ $=180^{\\circ}-${deg(I)}=${deg(180 - I)}$`]
              : [`ㄱ, ㅍ, ㄷ은 한 직선 위에 있으므로 각 ㄱㅍㄴ $=180^{\\circ}-${deg(I)}=${deg(180 - I)}$`, `ㄴ, ㅍ, ㄹ은 한 직선 위에 있으므로 각 ㄱㅍㄹ $=180^{\\circ}-${deg(180 - I)}=${deg(I)}$`];
      return {
        q: `${REG(n)}에 대각선 ㄱㄷ과 대각선 ㄴㄹ을 그었더니 두 대각선이 점 ㅍ에서 만났습니다. 각 ${ask}은 몇 도인가요?`,
        fig: geoFig({
          P,
          polys: poly,
          segs: [
            { a: 'ㄱ', b: 'ㄷ' },
            { a: 'ㄴ', b: 'ㄹ' },
          ],
          angles: [{ at: 'ㅍ', ...AK, text: '?' }],
          labelDir: { ㅍ: ask === 'ㄱㅍㄹ' ? [X[0], X[1]] : [-X[0], -X[1]] },
          w: 230,
          h: 220,
        }),
        answer: { type: 'num', value: big ? I : 180 - I, unit: '°' },
        steps: [
          s0,
          `삼각형 ㄱㄴㄷ은 이등변삼각형 → 각 ㄴㄷㄱ $=(180^{\\circ}-${deg(I)})\\div2=${deg(base)}$`,
          `삼각형 ㄴㄷㄹ도 이등변삼각형 → 각 ㄷㄴㄹ $=${deg(base)}$`,
          `삼각형 ㅍㄴㄷ에서 각 ㄴㅍㄷ $=180^{\\circ}-${deg(base)}-${deg(base)}=${deg(I)}$`,
          ...last,
        ],
        hint: '대각선이 만드는 이등변삼각형을 찾아보세요.',
      };
    },
  },
  {
    id: 'diag-total-reverse',
    title: '대각선의 수로 다각형 알아내기',
    gen(r, level) {
      const dg = (n: number) => (n * (n - 3)) / 2;
      if (level === 1) {
        const n = r.int(5, 11);
        return {
          q: `대각선이 모두 $${dg(n)}$개인 다각형은 몇 각형인가요? (숫자로 답하세요.)`,
          answer: { type: 'num', value: n, unit: '각형' },
          steps: ['□각형의 대각선 수 $=$ □ $\\times($□$-3)\\div2$', `차례로 구하면 ${Array.from({ length: n - 3 }, (_, i) => `${POLY[i + 4]} $${dg(i + 4)}$개`).join(', ')}`, `답: ${POLY[n]}`],
          hint: '사각형, 오각형, 육각형, … 의 대각선 수를 차례로 구해 보세요.',
        };
      }
      if (level === 2) {
        const v = r.chance(0.5);
        const n = v ? r.int(5, 12) : r.int(6, 12);
        const T = v ? (n * (n - 1)) / 2 : (n * (n - 5)) / 2;
        return {
          q: v
            ? `어떤 다각형의 변의 수와 대각선의 수를 더했더니 $${T}$입니다. 이 다각형은 몇 각형인가요? (숫자로 답하세요.)`
            : `어떤 다각형의 대각선의 수가 변의 수보다 $${T}$만큼 더 많습니다. 이 다각형은 몇 각형인가요? (숫자로 답하세요.)`,
          answer: { type: 'num', value: n, unit: '각형' },
          steps: v
            ? [
                '변과 대각선은 모두 두 꼭짓점을 잇는 선분이에요. 그래서 둘을 더하면 꼭짓점 두 개씩을 이은 선분의 수예요.',
                '꼭짓점이 □개이면 그 수는 □ $\\times($□$-1)\\div2$',
                `차례로 구하면 ${Array.from({ length: n - 3 }, (_, i) => `${i + 4}개 → $${((i + 4) * (i + 3)) / 2}$`).join(', ')}`,
                `답: ${POLY[n]}`,
              ]
            : [
                '□각형의 대각선 수 $=$ □ $\\times($□$-3)\\div2$, 변의 수 $=$ □',
                `차례로 (대각선 수 $-$ 변의 수)를 구하면 ${Array.from({ length: n - 5 }, (_, i) => `${POLY[i + 6]} $${dg(i + 6)}-${i + 6}=${((i + 6) * (i + 1)) / 2}$`).join(', ')}`,
                `답: ${POLY[n]}`,
              ],
          hint: '꼭짓점의 수를 하나씩 늘려 가며 표를 만들어 보세요.',
        };
      }
      const S = r.int(11, 17);
      const pairs: [number, number][] = [];
      for (let q = 3; S - q > q; q++) pairs.push([S - q, q]);
      const [p, q] = r.pick(pairs);
      const Dv = dg(p) - dg(q);
      const askP = r.chance(0.5);
      return {
        q: `두 다각형 ㉮와 ㉯가 있습니다. 두 다각형의 꼭짓점의 수를 더하면 $${S}$개이고, ㉮의 대각선은 ㉯의 대각선보다 $${Dv}$개 더 많습니다. ${askP ? '㉮는 몇 각형인가요? (숫자로 답하세요.)' : '㉮의 대각선은 모두 몇 개인가요?'}`,
        answer: askP ? { type: 'num', value: p, unit: '각형' } : { type: 'num', value: dg(p), unit: '개' },
        steps: [
          `꼭짓점의 수의 합이 $${S}$인 (㉮, ㉯): ${pairs.map(([a, b]) => `$(${a},${b})$`).join(', ')}`,
          `대각선 수의 차: ${pairs.map(([a, b]) => `$(${a},${b})$ → $${dg(a)}-${dg(b)}=${dg(a) - dg(b)}$`).join(', ')}`,
          `차가 $${Dv}$인 것은 ㉮가 ${POLY[p]}, ㉯가 ${POLY[q]}일 때예요.`,
          askP ? `답: ${POLY[p]}` : `㉮의 대각선: $${p}\\times${p - 3}\\div2=${dg(p)}$ (개)`,
        ],
        hint: '꼭짓점 수의 합이 같도록 두 다각형을 짝지어 표를 만들어 보세요.',
      };
    },
  },
];

/** 한 꼭짓점에 정다각형을 모으는 경우: 알려진 도형 + 정□각형 k개 */
const TILE_Q: { known: number[]; k: number; n: number }[] = (() => {
  const pool = [3, 4, 5, 6, 8, 10, 12];
  const out: { known: number[]; k: number; n: number }[] = [];
  const ms: number[][] = [];
  for (let i = 0; i < pool.length; i++) {
    ms.push([pool[i]]);
    for (let j = i; j < pool.length; j++) {
      ms.push([pool[i], pool[j]]);
      for (let l = j; l < pool.length; l++) ms.push([pool[i], pool[j], pool[l]]);
    }
  }
  for (const kn of ms) {
    const s = sum(kn.map((x) => IAN[x]));
    for (const k of [1, 2]) {
      const rest = 360 - s;
      if (rest <= 0 || rest % k) continue;
      const a = rest / k;
      const n = pool.find((x) => IAN[x] === a);
      if (n && !kn.includes(n) && kn.length + k >= 3) out.push({ known: kn, k, n });
    }
  }
  return out;
})();

const TOP_E4B6: Skill[] = [
  {
    id: 'top-handshake',
    title: '둥근 탁자에 둘러앉아 악수하기 (대각선의 수)',
    gen(r) {
      const v = r.pick(['nb', 'nb2', 'rev'] as const);
      if (v === 'nb2') {
        const n = r.int(8, 16);
        const T = (n * (n - 5)) / 2;
        return {
          q: `${n}명이 둥근 탁자에 같은 간격으로 둘러앉아 있습니다. 각자 자기 양옆에 앉은 사람, 그리고 그 사람들의 바로 옆에 앉은 사람과는 악수하지 않고, 나머지 사람과는 모두 한 번씩 악수를 하려고 합니다. 악수는 모두 몇 번 하게 되나요?`,
          answer: { type: 'num', value: T, unit: '번' },
          steps: [
            `사람들을 ${POLY[n] ?? `${n}각형`}의 꼭짓점이라고 생각하면 악수 한 번은 두 꼭짓점을 잇는 선분 하나예요.`,
            '한 사람이 악수하지 않는 사람은 자기 자신과 양쪽으로 두 명씩, 모두 $5$명이에요.',
            `한 사람은 $${n}-5=${n - 5}$명과 악수해요.`,
            `$${n}$명이 $${n - 5}$번씩이면 $${n}\\times${n - 5}=${n * (n - 5)}$번인데, 악수 한 번을 두 사람이 한 번씩 센 것이에요.`,
            `$${n * (n - 5)}\\div2=${T}$ (번)`,
          ],
          hint: '한 사람이 몇 명과 악수하는지 먼저 세어 보세요.',
        };
      }
      const n = r.int(7, 16);
      const T = (n * (n - 3)) / 2;
      if (v === 'nb')
        return {
          q: `${n}명이 둥근 탁자에 둘러앉아 있습니다. 바로 옆에 앉은 두 사람을 뺀 나머지 사람과는 모두 한 번씩 악수를 하려고 합니다. 악수는 모두 몇 번 하게 되나요?`,
          answer: { type: 'num', value: T, unit: '번' },
          steps: [
            `사람들을 ${POLY[n] ?? `${n}각형`}의 꼭짓점이라고 생각하면 악수 한 번은 두 꼭짓점을 잇는 선분 하나예요.`,
            '옆 사람과의 악수(변)는 하지 않으므로, 악수의 수는 대각선의 수와 같아요.',
            `한 사람은 자기와 양옆 사람을 뺀 $${n}-3=${n - 3}$명과 악수해요.`,
            `$${n}\\times${n - 3}=${n * (n - 3)}$번은 악수 한 번을 두 사람이 한 번씩 센 것이에요.`,
            `$${n * (n - 3)}\\div2=${T}$ (번)`,
          ],
          hint: '사람을 다각형의 꼭짓점으로 생각해 보세요.',
        };
      return {
        q: `몇 명이 둥근 탁자에 둘러앉아, 바로 옆에 앉은 두 사람을 뺀 나머지 사람과 모두 한 번씩 악수를 했더니 악수를 모두 $${T}$번 했습니다. 탁자에 둘러앉은 사람은 몇 명인가요?`,
        answer: { type: 'num', value: n, unit: '명' },
        steps: [
          '사람을 다각형의 꼭짓점으로 생각하면 악수의 수는 그 다각형의 대각선의 수와 같아요.',
          '□명이면 한 사람이 (□$-3$)명과 악수하므로 악수는 □ $\\times($□$-3)\\div2$번',
          `차례로 구하면 ${Array.from({ length: n - 4 }, (_, i) => `$${i + 5}$명 → $${((i + 5) * (i + 2)) / 2}$번`).join(', ')}`,
          `$${T}$번이 되는 것은 $${n}$명일 때예요.`,
          `답: $${n}$명`,
        ],
        hint: '사람 수를 하나씩 늘리며 악수의 수를 구해 보세요.',
      };
    },
  },
  {
    id: 'top-tile-vertex',
    title: '한 꼭짓점에 정다각형을 빈틈없이 모으기',
    gen(r) {
      const angT = (ns: number[]) => ns.map((x) => `${REG(x)} $${deg(IAN[x])}$`).join(', ');
      if (r.chance(0.5)) {
        const set = r.pick([
          [3, 4],
          [3, 6],
          [3, 4, 6],
          [4, 8],
          [3, 12],
          [3, 4, 12],
          [4, 6, 12],
          [5, 10],
          [3, 6, 12],
        ]);
        const combos: number[][] = [];
        const rec = (i: number, left: number, cur: number[]) => {
          if (i === set.length) {
            if (left === 0) combos.push([...cur]);
            return;
          }
          for (let k = 0; k * IAN[set[i]] <= left; k++) rec(i + 1, left - k * IAN[set[i]], [...cur, k]);
        };
        rec(0, 360, []);
        const ct = (cb: number[]) =>
          cb
            .map((k, i) => (k ? `${REG(set[i])} $${k}$개` : ''))
            .filter(Boolean)
            .join(' $+$ ');
        const names = set.map(REG);
        return {
          q: `한 변의 길이가 같은 ${set.length > 2 ? `${names.slice(0, -1).join(', ')}, ` : `${J(names[0], '와/과')} `}${J(names[names.length - 1], '이/가')} 많이 있습니다. 이 중에서 한 가지 또는 여러 가지를 골라 한 꼭짓점에 빈틈없이 겹치지 않게 모으려고 합니다. 도형마다 몇 개씩 쓸지 정하는 방법은 모두 몇 가지인가요? (놓는 순서는 생각하지 않습니다.)`,
          answer: { type: 'num', value: combos.length, unit: '가지' },
          steps: [
            '한 꼭짓점에 빈틈없이 모이려면 모인 각의 합이 $360^{\\circ}$가 되어야 해요.',
            `정다각형의 한 각: ${angT(set)}`,
            `한 각이 가장 큰 ${REG(set[set.length - 1])}의 개수를 $0$개, $1$개, … 로 정하고 나머지를 맞춰 봐요.`,
            ...[...new Set(combos.map((cb) => cb[set.length - 1]))]
              .sort((x, y) => x - y)
              .map((L) => `${REG(set[set.length - 1])} $${L}$개일 때: ${combos.filter((cb) => cb[set.length - 1] === L).map((cb) => `${ct(cb)} ($${cb.map((k, i) => (k ? `${IAN[set[i]]}\\times${k}` : '')).filter(Boolean).join('+')}=360$)`).join(', ')}`),
            `모두 $${combos.length}$가지`,
          ],
          hint: '한 각의 크기를 먼저 구하고, 합이 360°가 되는 개수의 조합을 찾아요.',
        };
      }
      const t = r.pick(TILE_Q);
      const cnt: Record<number, number> = {};
      for (const x of t.known) cnt[x] = (cnt[x] ?? 0) + 1;
      const kt = Object.entries(cnt)
        .map(([x, k]) => `${REG(+x)} $${k}$개`)
        .join(', ');
      const ks = sum(t.known.map((x) => IAN[x]));
      const a = (360 - ks) / t.k;
      return {
        q: `한 변의 길이가 같은 ${kt}와 정□각형 $${t.k}$개를 한 꼭짓점에 빈틈없이 겹치지 않게 모았습니다. □ 안에 알맞은 수를 구하세요.`,
        answer: { type: 'num', value: t.n },
        steps: [
          '정□각형의 한 각 $=180^{\\circ}\\times($□$-2)\\div$□',
          `알고 있는 도형의 한 각: ${angT([...new Set(t.known)])}`,
          ...(t.known.length > 1 ? [`알고 있는 도형의 각의 합: ${t.known.map((x) => `$${IAN[x]}$`).join(' $+$ ')} $=${deg(ks)}$`] : []),
          `남은 각: $360^{\\circ}-${deg(ks)}=${deg(360 - ks)}$${t.k === 2 ? ` → 한 개에 $${deg(360 - ks)}\\div2=${deg(a)}$` : ''}`,
          `정다각형의 한 각: 정삼각형 $60^{\\circ}$, 정사각형 $90^{\\circ}$, 정오각형 $108^{\\circ}$, 정육각형 $120^{\\circ}$, 정팔각형 $135^{\\circ}$, 정십각형 $144^{\\circ}$, 정십이각형 $150^{\\circ}$`,
          `한 각이 $${deg(a)}$인 것은 ${REG(t.n)} → □ $=${t.n}$`,
        ],
        hint: '한 점에 모인 각의 합은 360°예요.',
      };
    },
  },
];

/** 일반 skills 뒤에 붙는 심화 유형 (단원 id → 유형들) */
export const MORE_E4B: Record<string, Skill[]> = {
  'e4b-1': E4B1,
  'e4b-2': E4B2,
  'e4b-3': E4B3,
  'e4b-4': E4B4,
  'e4b-5': E4B5,
  'e4b-6': E4B6,
};
/** UnitContent.top 에 더해지는 최상위 유형 */
export const MORE_TOP_E4B: Record<string, Skill[]> = {
  'e4b-1': TOP_E4B1,
  'e4b-2': TOP_E4B2,
  'e4b-3': TOP_E4B3,
  'e4b-4': TOP_E4B4,
  'e4b-5': TOP_E4B5,
  'e4b-6': TOP_E4B6,
};
