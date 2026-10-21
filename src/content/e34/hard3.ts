// 초3 (e3a, e3b) 심화 유형(HARD3, 일반 skills 뒤에 붙임)과 최상위 유형(TOP3, UnitContent.top)
import type { Skill } from '../../core/types';
import { Svg } from '../../core/fig';
import { gcd } from '../../core/nt';
import { J, c, fr, mx, nm, pick2Names, pickName, picGraph } from './util';
import { ORD, boxes, fracOk, geoFig, perms, ray, sum, until } from './hardutil';
import type { Pt } from './hardutil';

const DIG = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const num = (ds: number[]) => ds.reduce((a, b) => a * 10 + b, 0);
const KO = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ'];
/** 분 → 'a시간 b분' 같은 시간 문장 */
const hm = (min: number) => (min >= 60 ? `$${Math.floor(min / 60)}$시간${min % 60 ? ` $${min % 60}$분` : ''}` : `$${min}$분`);
const ms = (sec: number) => (sec >= 60 ? `$${Math.floor(sec / 60)}$분${sec % 60 ? ` $${sec % 60}$초` : ''}` : `$${sec}$초`);
/** 하루 중 초 → '오전/오후 h시 m분 s초' */
function clockText(t: number, withSec = true): string {
  const h24 = Math.floor(t / 3600),
    m = Math.floor((t % 3600) / 60),
    s = t % 60;
  const ampm = h24 < 12 ? '오전' : '오후';
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${ampm} $${h}$시 $${m}$분${withSec ? ` $${s}$초` : ''}`;
}
const h12 = (t: number) => {
  const h = Math.floor(t / 3600) % 12;
  return h === 0 ? 12 : h;
};
const kgg = (g: number) => (g >= 1000 ? (g % 1000 ? `$${Math.floor(g / 1000)}$ kg $${g % 1000}$ g` : `$${g / 1000}$ kg`) : `$${g}$ g`);
const lml = (ml: number) => (ml >= 1000 ? (ml % 1000 ? `$${Math.floor(ml / 1000)}$ L $${ml % 1000}$ mL` : `$${ml / 1000}$ L`) : `$${ml}$ mL`);
const cmmm = (mm: number) => (mm % 10 ? `$${Math.floor(mm / 10)}$ cm $${mm % 10}$ mm` : `$${mm / 10}$ cm`);

// ═════════════════════════════ 심화 유형 ═════════════════════════════
export const HARD3: Record<string, Skill[]> = {
  // ───────── e3a-1 덧셈과 뺄셈
  'e3a-1': [
    {
      id: 'cards-sum-diff',
      title: '수 카드로 만든 세 자리 수의 합과 차',
      gen(r, level) {
        if (level === 1) {
          const cs = r.sample(DIG, 3);
          const big = num([...cs].sort((a, b) => b - a));
          const small = num([...cs].sort((a, b) => a - b));
          const add = r.chance(0.5);
          return {
            q: `수 카드 $${boxes(cs)}$을 한 번씩 모두 사용하여 세 자리 수를 만들려고 합니다. 만들 수 있는 가장 큰 수와 가장 작은 수의 ${add ? '합을' : '차를'} 구하세요.`,
            answer: { type: 'num', value: add ? big + small : big - small },
            steps: [
              `가장 큰 수: 큰 숫자부터 백, 십, 일의 자리에 놓아요 → $${big}$`,
              `가장 작은 수: 작은 숫자부터 놓아요 → $${small}$`,
              add ? `$${big}+${small}=${big + small}$` : `$${big}-${small}=${big - small}$`,
            ],
          };
        }
        if (level === 2) {
          const cs = r.chance(0.7) ? [0, ...r.sample(DIG, 3)] : r.sample(DIG, 4);
          const shown = r.shuffle(cs);
          const all = perms(cs, 3)
            .filter((p) => p[0] !== 0)
            .map(num);
          const big = Math.max(...all),
            small = Math.min(...all);
          return {
            q: `수 카드 $${boxes(shown)}$ 중에서 $3$장을 골라 한 번씩 사용하여 세 자리 수를 만들려고 합니다. 만들 수 있는 가장 큰 수와 가장 작은 수의 차를 구하세요.`,
            answer: { type: 'num', value: big - small },
            steps: [
              `가장 큰 수: 큰 숫자 $3$개를 큰 것부터 놓아요 → $${big}$`,
              cs.includes(0)
                ? `가장 작은 수: $0$은 백의 자리에 올 수 없으니 백의 자리에는 $0$이 아닌 가장 작은 숫자, 십의 자리에 $0$을 놓아요 → $${small}$`
                : `가장 작은 수: 작은 숫자 $3$개를 작은 것부터 놓아요 → $${small}$`,
              `$${big}-${small}=${big - small}$`,
            ],
            hint: '0은 백의 자리에 놓을 수 없어요.',
          };
        }
        const cs = r.chance(0.6) ? [0, ...r.sample(DIG, 5)] : r.sample(DIG, 6);
        const shown = r.shuffle(cs);
        const want = r.chance(0.5) ? 'max' : 'min';
        let best = want === 'max' ? -1 : Infinity;
        for (const p of perms(cs, 6)) {
          if (p[0] === 0 || p[3] === 0) continue;
          const v = num(p.slice(0, 3)) + num(p.slice(3));
          if (want === 'max' ? v > best : v < best) best = v;
        }
        const d = [...cs].sort((a, b) => (want === 'max' ? b - a : a - b));
        let H: number[], T: number[], O: number[];
        if (want === 'max') {
          H = [d[0], d[1]];
          T = [d[2], d[3]];
          O = [d[4], d[5]];
        } else {
          const nz = d.filter((x) => x !== 0);
          H = [nz[0], nz[1]];
          const rest = d.filter((x) => !H.includes(x));
          T = [rest[0], rest[1]];
          O = [rest[2], rest[3]];
        }
        const A = num([H[0], T[0], O[0]]),
          B = num([H[1], T[1], O[1]]);
        return {
          q: `수 카드 $${boxes(shown)}$을 한 번씩 모두 사용하여 세 자리 수 $2$개를 만들려고 합니다. 두 수의 합이 가장 ${want === 'max' ? '클' : '작을'} 때, 그 합은 얼마인가요?`,
          answer: { type: 'num', value: best },
          steps: [
            want === 'max' ? '합이 크려면 높은 자리에 큰 숫자가 와야 해요.' : `합이 작으려면 높은 자리에 작은 숫자가 와야 해요.${cs.includes(0) ? ' ($0$은 백의 자리에 올 수 없어요.)' : ''}`,
            `백의 자리: $${H[0]}$, $${H[1]}$ / 십의 자리: $${T[0]}$, $${T[1]}$ / 일의 자리: $${O[0]}$, $${O[1]}$`,
            `예를 들어 $${A}+${B}=${A + B}$`,
            `답: $${best}$`,
          ],
          hint: '같은 자리에 놓이는 두 숫자를 먼저 정해 보세요.',
        };
      },
    },
  ],

  // ───────── e3a-2 평면도형
  'e3a-2': [
    {
      id: 'rays-angles',
      title: '한 점에서 그은 반직선으로 생긴 크고 작은 각',
      gen(r, level) {
        const k = level === 1 ? r.int(3, 4) : level === 2 ? r.int(4, 6) : r.int(6, 8);
        const span = r.int(110, 160),
          start = r.int(10, 170 - span);
        const stepA = span / (k - 1);
        const angs = Array.from({ length: k }, (_, i) => Math.round(start + i * stepA + (i > 0 && i < k - 1 ? (r.next() - 0.5) * stepA * 0.5 : 0)));
        const P: Record<string, Pt> = { ㅇ: [0, 0] };
        const labelDir: Record<string, Pt> = { ㅇ: [0, -1] };
        const names = KO.slice(0, k).filter((x) => x !== 'ㅇ');
        while (names.length < k) names.push('ㅈ');
        angs.forEach((a, i) => {
          P[names[i]] = ray(180 - a);
          labelDir[names[i]] = ray(180 - a);
        });
        const fig = geoFig({
          P,
          segs: names.map((n) => ({ a: 'ㅇ', b: n })),
          labelDir,
          w: 260,
          h: 160,
        });
        const tot = (k * (k - 1)) / 2;
        const parts = Array.from({ length: k - 1 }, (_, i) => k - 1 - i);
        return {
          q: `그림과 같이 점 ㅇ에서 반직선 $${k}$개를 그었습니다. 그림에서 찾을 수 있는 크고 작은 각은 모두 몇 개인가요?`,
          fig,
          answer: { type: 'num', value: tot, unit: '개' },
          steps: [`가장 작은 각 $1$개로 된 각: $${k - 1}$개`, ...(k > 2 ? [`작은 각 $2$개, $3$개, … 를 합친 각도 모두 세어요.`] : []), `$${parts.join('+')}=${tot}$`, `답: $${tot}$개`],
          hint: '작은 각 1개짜리, 2개짜리, 3개짜리 … 로 나누어 빠짐없이 세어 보세요.',
        };
      },
    },
  ],

  // ───────── e3a-3 나눗셈
  'e3a-3': [
    {
      id: 'div-wrong',
      title: '잘못 계산한 나눗셈 바르게 하기',
      gen(r, level) {
        if (level === 1) {
          const a = r.int(2, 9),
            q = r.int(2, 9);
          const x = a * q;
          return {
            q: `어떤 수를 $${a}$로 나누어야 할 것을 잘못하여 $${a}$를 더했더니 $${x + a}$가 되었습니다. 바르게 계산한 몫은 얼마인가요?`,
            answer: { type: 'num', value: q },
            steps: [`어떤 수 $+${a}=${x + a}$ → 어떤 수 $=${x + a}-${a}=${x}$`, `바르게 계산: $${x}\\div${a}=${q}$`],
            hint: '먼저 어떤 수를 구해요.',
          };
        }
        if (level === 2) {
          const [a, b, q] = until(
            () => [r.int(2, 9), r.int(2, 9), r.int(2, 9)],
            ([a, b, q]) => a !== b && (b * q) % a === 0 && (b * q) / a <= 9 && (b * q) / a >= 1 && b * q !== a,
          );
          const x = b * q;
          return {
            q: `어떤 수를 $${a}$로 나누어야 할 것을 잘못하여 $${b}$로 나누었더니 몫이 $${q}$가 되었습니다. 바르게 계산한 몫은 얼마인가요?`,
            answer: { type: 'num', value: x / a },
            steps: [`어떤 수 $\\div${b}=${q}$ → 어떤 수 $=${b}\\times${q}=${x}$`, `바르게 계산: $${x}\\div${a}=${x / a}$`],
            hint: '나눗셈식을 곱셈식으로 바꾸어 어떤 수를 구해요.',
          };
        }
        const [a, cc, R] = until(
          () => [r.int(2, 9), r.int(1, 9), r.int(1, 6)],
          ([a, cc, R]) => (2 * cc) % a === 0 && R + (2 * cc) / a <= 9 && a * (R + (2 * cc) / a) - cc > cc,
        );
        const q = R + (2 * cc) / a;
        const x = a * q - cc;
        return {
          q: `어떤 수에서 $${cc}$를 뺀 다음 $${a}$로 나누어야 할 것을 잘못하여 $${cc}$를 더한 다음 $${a}$로 나누었더니 몫이 $${q}$가 되었습니다. 바르게 계산한 몫은 얼마인가요?`,
          answer: { type: 'num', value: R },
          steps: [
            `(어떤 수 $+${cc}$) $\\div${a}=${q}$ → 어떤 수 $+${cc}=${a}\\times${q}=${a * q}$`,
            `어떤 수 $=${a * q}-${cc}=${x}$`,
            `바르게 계산: $${x}-${cc}=${x - cc}$, $${x - cc}\\div${a}=${R}$`,
          ],
          hint: '잘못 계산한 순서를 거꾸로 거슬러 올라가 어떤 수를 먼저 구해요.',
        };
      },
    },
  ],

  // ───────── e3a-4 곱셈
  'e3a-4': [
    {
      id: 'guess-check',
      title: '모두 한쪽이라고 생각하여 풀기',
      gen(r, level) {
        if (level === 1) {
          const n = r.int(5, 9),
            t = r.int(1, n - 1);
          const W = 2 * (n - t) + 3 * t;
          return {
            q: `자전거 가게에 두발자전거와 세발자전거가 모두 $${n}$대 있습니다. 자전거 바퀴가 모두 $${W}$개라면 세발자전거는 몇 대인가요?`,
            answer: { type: 'num', value: t, unit: '대' },
            steps: [
              `모두 두발자전거라고 생각하면 바퀴는 $2\\times${n}=${2 * n}$개`,
              `실제보다 $${W}-${2 * n}=${W - 2 * n}$개 적어요.`,
              `세발자전거 $1$대마다 바퀴가 $1$개씩 더 많으니 세발자전거는 $${t}$대`,
            ],
            hint: '모두 두발자전거라고 생각해 보세요.',
          };
        }
        if (level === 2) {
          const n = r.int(10, 19),
            t = r.int(2, Math.min(9, n - 2));
          const L = 2 * (n - t) + 4 * t;
          const [a, b] = r.pick([
            ['닭', '돼지'],
            ['오리', '염소'],
          ]);
          return {
            q: `농장에 ${J(a, '와/과')} ${J(b, '이/가')} 모두 $${n}$마리 있습니다. 다리를 세어 보니 모두 $${L}$개였습니다. ${J(b, '은/는')} 몇 마리인가요?`,
            answer: { type: 'num', value: t, unit: '마리' },
            steps: [
              `모두 ${nm(a)}라고 생각하면 다리는 $${n}\\times2=${2 * n}$개`,
              `실제와의 차: $${L}-${2 * n}=${L - 2 * n}$개`,
              `${b} $1$마리는 ${a}보다 다리가 $2$개 많으니 $${L - 2 * n}\\div2=${t}$`,
              `답: $${t}$마리`,
            ],
            hint: `모두 ${nm(a)}라고 생각하고 다리 수의 차이를 보세요.`,
          };
        }
        const n = r.int(10, 19),
          t = r.int(2, Math.min(9, n - 2));
        const L = 6 * (n - t) + 8 * t;
        return {
          q: `관찰 상자에 다리가 $6$개인 사슴벌레와 다리가 $8$개인 거미가 모두 $${n}$마리 있습니다. 다리를 세어 보니 모두 $${L}$개였습니다. 거미는 몇 마리인가요?`,
          answer: { type: 'num', value: t, unit: '마리' },
          steps: [
            `모두 사슴벌레라고 생각하면 다리는 $${n}\\times6=${6 * n}$개`,
            `실제와의 차: $${L}-${6 * n}=${L - 6 * n}$개`,
            `거미 $1$마리는 사슴벌레보다 다리가 $2$개 많으니 $${L - 6 * n}\\div2=${t}$`,
            `확인: $${n - t}\\times6+${t}\\times8=${6 * (n - t)}+${8 * t}=${L}$`,
          ],
          hint: '모두 사슴벌레라고 생각하고 다리 수의 차이를 보세요.',
        };
      },
    },
  ],

  // ───────── e3a-5 길이와 시간
  'e3a-5': [
    {
      id: 'time-reverse',
      title: '끝난 시각으로 시작한 시각 구하기',
      gen(r, level) {
        if (level <= 2) {
          const start = (r.int(13, 17) * 60 + r.int(0, 59)) * 60;
          const d = level === 1 ? r.int(15, 55) : r.int(65, 115);
          const end = start + d * 60;
          const what = r.pick([
            { w: '영화가', v: '상영되어', s: '영화가 시작한' },
            { w: '축구 경기가', v: '진행되어', s: '경기가 시작한' },
            { w: '피아노 연주회가', v: '열려', s: '연주회가 시작한' },
          ]);
          const sh = h12(start),
            sm = Math.floor((start % 3600) / 60);
          return {
            q: `${what.w} ${hm(d)} 동안 ${what.v} ${clockText(end, false)}에 끝났습니다. ${what.s} 시각은 오후 몇 시 몇 분인가요?`,
            answer: {
              type: 'fields',
              fields: [
                { label: '시', value: sh },
                { label: '분', value: sm },
              ],
            },
            steps: [`(시작한 시각) $=$ (끝난 시각) $-$ (걸린 시간)`, `${clockText(end, false)} $-$ ${hm(d)}`, `$=$ ${clockText(start, false)}`],
            hint: '끝난 시각에서 걸린 시간을 거꾸로 빼요.',
          };
        }
        const ds = [r.int(5, 15) * 60 + r.int(10, 55), r.int(3, 8) * 60 + r.int(10, 55), r.int(10, 25) * 60 + r.int(10, 55)];
        const start = (r.int(7, 10) * 60 + r.int(0, 59)) * 60 + r.int(0, 59);
        const tot = sum(ds);
        const end = start + tot;
        const name = pickName(r);
        return {
          q: `${nm(name)}는 공원에서 걷기를 ${ms(ds[0])}, 쉬기를 ${ms(ds[1])}, 달리기를 ${ms(ds[2])} 동안 차례로 이어서 했더니 ${clockText(end)}에 끝났습니다. ${nm(name)}가 걷기를 시작한 시각은 오전 몇 시 몇 분 몇 초인가요?`,
          answer: {
            type: 'fields',
            fields: [
              { label: '시', value: h12(start) },
              { label: '분', value: Math.floor((start % 3600) / 60) },
              { label: '초', value: start % 60 },
            ],
          },
          steps: [
            `걸린 시간 모두: ${ms(ds[0])} $+$ ${ms(ds[1])} $+$ ${ms(ds[2])} $=$ ${ms(tot)}`,
            `(시작한 시각) $=$ ${clockText(end)} $-$ ${ms(tot)}`,
            `초끼리 모자라면 $1$분을 $60$초로, 분끼리 모자라면 $1$시간을 $60$분으로 바꾸어 빼요.`,
            `답: ${clockText(start)}`,
          ],
          hint: '먼저 걸린 시간을 모두 더한 뒤, 끝난 시각에서 빼요.',
        };
      },
    },
  ],

  // ───────── e3a-6 분수와 소수
  'e3a-6': [
    {
      id: 'dec-cards',
      title: '수 카드로 소수 만들기',
      gen(r, level) {
        const k = level === 1 ? 3 : level === 2 ? 4 : 4;
        const cs = level === 1 ? r.sample(DIG, 3) : r.chance(0.5) ? [0, ...r.sample(DIG, k - 1)] : r.sample(DIG, k);
        const shown = r.shuffle(cs);
        const all = perms(cs, 2)
          .filter((p) => p[1] !== 0)
          .map((p) => p[0] * 10 + p[1])
          .sort((a, b) => b - a);
        const D = (t: number) => `${Math.floor(t / 10)}.${t % 10}`;
        const qHead = `수 카드 $${boxes(shown)}$ 중에서 $2$장을 골라 한 번씩 사용하여 $\\square.\\square$ 모양의 소수를 만들려고 합니다.${cs.includes(0) ? ' (소수 첫째 자리에는 $0$을 놓지 않아요.)' : ''}`;
        if (level === 1) {
          const big = r.chance(0.5);
          const v = big ? all[0] : all[all.length - 1];
          return {
            q: `${qHead} 만들 수 있는 가장 ${big ? '큰' : '작은'} 소수를 구하세요.`,
            answer: { type: 'num', value: v / 10, display: 'dec' },
            steps: [big ? '자연수 부분에 가장 큰 숫자, 소수 첫째 자리에 둘째로 큰 숫자를 놓아요.' : '자연수 부분에 가장 작은 숫자, 소수 첫째 자리에 둘째로 작은 숫자를 놓아요.', `답: $${D(v)}$`],
          };
        }
        if (level === 2) {
          const k2 = r.int(2, 3);
          return {
            q: `${qHead} 만들 수 있는 소수 중에서 ${ORD[k2 - 1]}로 큰 소수를 구하세요.`,
            answer: { type: 'num', value: all[k2 - 1] / 10, display: 'dec' },
            steps: [
              `큰 소수부터 차례로 쓰면 ${all
                .slice(0, k2 + 1)
                .map((t) => `$${D(t)}$`)
                .join(', ')}, …`,
              `${ORD[k2 - 1]}로 큰 소수: $${D(all[k2 - 1])}$`,
            ],
            hint: '가장 큰 소수부터 차례로 써 보세요.',
          };
        }
        const [lo, hi] = until(
          () => {
            const a = r.int(5, 90);
            return [a, a + r.int(15, 45)];
          },
          ([lo, hi]) => {
            const n = all.filter((t) => t > lo && t < hi).length;
            return n >= 2 && n <= 6 && hi <= 99 && lo % 10 !== 0 && hi % 10 !== 0;
          },
        );
        const ok = all.filter((t) => t > lo && t < hi).sort((a, b) => a - b);
        return {
          q: `${qHead} 만들 수 있는 소수 중에서 $${D(lo)}$보다 크고 $${D(hi)}$보다 작은 소수는 모두 몇 개인가요?`,
          answer: { type: 'num', value: ok.length, unit: '개' },
          steps: [`자연수 부분이 될 수 있는 숫자부터 나누어 생각해요.`, `조건에 맞는 소수: ${ok.map((t) => `$${D(t)}$`).join(', ')}`, `답: $${ok.length}$개`],
          hint: '자연수 부분이 같으면 소수 첫째 자리 숫자를 비교해요.',
        };
      },
    },
  ],

  // ───────── e3b-1 곱셈
  'e3b-1': [
    {
      id: 'mul-closest',
      title: '곱이 어떤 수에 가장 가까운 수 찾기',
      gen(r, level) {
        if (level <= 2) {
          const [a, T, best] = until(
            () => {
              const a = level === 1 ? r.int(23, 89) : r.int(21, 48);
              const T = level === 1 ? r.int(15, 80) * 10 : r.int(80, 250) * 10;
              const lo = level === 1 ? 1 : 10,
                hi = level === 1 ? 9 : 99;
              let best = lo,
                bd = Infinity,
                tie = false;
              for (let x = lo; x <= hi; x++) {
                const dd = Math.abs(a * x - T);
                if (dd < bd) {
                  bd = dd;
                  best = x;
                  tie = false;
                } else if (dd === bd) tie = true;
              }
              return [a, tie ? -1 : T, best];
            },
            ([a, T, best]) => T > 0 && best > (level === 1 ? 1 : 10) && best < (level === 1 ? 9 : 99) && a * best !== T,
          );
          const lo = Math.floor(T / a),
            hi = lo + 1;
          return {
            q: `${level === 1 ? '한' : '두'} 자리 수 □ 중에서 $${a}\\times\\square$의 값이 $${c(T)}$에 가장 가까운 수를 구하세요.`,
            answer: { type: 'num', value: best },
            steps: [`$${a}\\times${lo}=${c(a * lo)}$, $${a}\\times${hi}=${c(a * hi)}$`, `$${c(T)}$과의 차: $${c(Math.abs(T - a * lo))}$, $${c(Math.abs(a * hi - T))}$`, `더 가까운 쪽은 $${best}$`],
            hint: `$${a}$에 어떤 수를 곱하면 $${c(T)}$ 근처가 되는지 어림해 보세요.`,
          };
        }
        const [a, L, U] = until(
          () => {
            const a = r.int(21, 69);
            const L = r.int(30, 150) * 10;
            return [a, L, L + r.int(20, 60) * 10];
          },
          ([a, L, U]) => {
            const n = Array.from({ length: 90 }, (_, i) => i + 10).filter((x) => a * x > L && a * x < U).length;
            return n >= 3 && n <= 15 && L % a !== 0 && U % a !== 0;
          },
        );
        const xs = Array.from({ length: 90 }, (_, i) => i + 10).filter((x) => a * x > L && a * x < U);
        const x0 = xs[0],
          x1 = xs[xs.length - 1];
        return {
          q: `□ 안에 들어갈 수 있는 두 자리 수는 모두 몇 개인가요? $$${c(L)}<${a}\\times\\square<${c(U)}$$`,
          answer: { type: 'num', value: xs.length, unit: '개' },
          steps: [
            `$${a}\\times${x0 - 1}=${c(a * (x0 - 1))}$, $${a}\\times${x0}=${c(a * x0)}$ → □는 $${x0}$부터`,
            `$${a}\\times${x1}=${c(a * x1)}$, $${a}\\times${x1 + 1}=${c(a * (x1 + 1))}$ → □는 $${x1}$까지`,
            `$${x0}$부터 $${x1}$까지: $${x1}-${x0}+1=${xs.length}$개`,
          ],
          hint: '경계에 가까운 곱을 몇 개 계산해 보세요.',
        };
      },
    },
  ],

  // ───────── e3b-2 나눗셈
  'e3b-2': [
    {
      id: 'rem-condition',
      title: '나머지 조건에 맞는 수 찾기',
      gen(r, level) {
        const d = r.int(3, 9),
          rem = r.int(1, d - 1);
        const list = (lo: number, hi: number) => Array.from({ length: hi - lo + 1 }, (_, i) => i + lo).filter((x) => x % d === rem);
        if (level === 1) {
          const big = r.chance(0.5);
          const xs = list(10, 99);
          const v = big ? xs[xs.length - 1] : xs[0];
          const q = Math.floor(v / d);
          return {
            q: `$${d}$로 나누었을 때 나머지가 $${rem}$인 두 자리 수 중에서 가장 ${big ? '큰' : '작은'} 수를 구하세요.`,
            answer: { type: 'num', value: v },
            steps: [
              `$${d}$로 나누어 나머지가 $${rem}$인 수는 $${d}\\times$(몫)$+${rem}$이에요.`,
              `${big ? `몫이 가장 클 때: $${d}\\times${q}+${rem}=${v}$ ($${d}\\times${q + 1}+${rem}=${d * (q + 1) + rem}$은 세 자리 수)` : `몫이 가장 작을 때: $${d}\\times${q}+${rem}=${v}$ ($${d}\\times${q - 1}+${rem}=${d * (q - 1) + rem}$은 한 자리 수)`}`,
              `답: $${v}$`,
            ],
          };
        }
        if (level === 2) {
          const xs = list(10, 99);
          const q0 = Math.floor(xs[0] / d),
            q1 = Math.floor(xs[xs.length - 1] / d);
          return {
            q: `$${d}$로 나누었을 때 나머지가 $${rem}$인 두 자리 수는 모두 몇 개인가요?`,
            answer: { type: 'num', value: xs.length, unit: '개' },
            steps: [
              `가장 작은 수: $${d}\\times${q0}+${rem}=${xs[0]}$`,
              `가장 큰 수: $${d}\\times${q1}+${rem}=${xs[xs.length - 1]}$`,
              `몫이 $${q0}$부터 $${q1}$까지이므로 $${q1}-${q0}+1=${xs.length}$개`,
            ],
            hint: '몫이 될 수 있는 수를 세어 보세요.',
          };
        }
        const xs = list(100, 999);
        const a = xs[0],
          b = xs[xs.length - 1];
        const ask = r.chance(0.5) ? 'sum' : 'diff';
        return {
          q: `$${d}$로 나누었을 때 나머지가 $${rem}$인 세 자리 수 중에서 가장 큰 수와 가장 작은 수의 ${ask === 'sum' ? '합을' : '차를'} 구하세요.`,
          answer: { type: 'num', value: ask === 'sum' ? a + b : b - a },
          steps: [
            `가장 작은 수: $100\\div${d}$의 몫은 $${Math.floor(100 / d)}$ → ${d * Math.floor(100 / d) + rem >= 100 ? `$${d}\\times${Math.floor(100 / d)}+${rem}=${a}$` : `$${d}\\times${Math.floor(100 / d) + 1}+${rem}=${a}$`}`,
            `가장 큰 수: $999\\div${d}$의 몫은 $${Math.floor(999 / d)}$ → ${d * Math.floor(999 / d) + rem <= 999 ? `$${d}\\times${Math.floor(999 / d)}+${rem}=${b}$` : `$${d}\\times${Math.floor(999 / d) - 1}+${rem}=${b}$`}`,
            ask === 'sum' ? `$${b}+${a}=${a + b}$` : `$${b}-${a}=${b - a}$`,
          ],
          hint: `$${d}\\times$(몫)$+${rem}$ 꼴의 수 중 세 자리 수의 처음과 끝을 찾아요.`,
        };
      },
    },
  ],

  // ───────── e3b-3 원
  'e3b-3': [
    {
      id: 'radius-chain',
      title: '반지름과 지름의 관계로 원의 크기 구하기',
      gen(r, level) {
        const [A, B, C] = r.pick([
          ['가', '나', '다'],
          ['ㄱ', 'ㄴ', 'ㄷ'],
        ]);
        if (level === 1) {
          const k = r.int(2, 5),
            rb = r.int(2, 9) * (k % 2 ? 2 : 1);
          const ra = (k * rb) / 2;
          return {
            q: `원 ${A}의 지름은 원 ${B}의 반지름의 $${k}$배입니다. 원 ${B}의 반지름이 $${rb}$ cm일 때, 원 ${A}의 반지름은 몇 cm인가요?`,
            answer: { type: 'num', value: ra, unit: 'cm' },
            steps: [`원 ${A}의 지름: $${rb}\\times${k}=${k * rb}$ (cm)`, `원 ${A}의 반지름: $${k * rb}\\div2=${ra}$ (cm)`],
            hint: '반지름은 지름의 반이에요.',
          };
        }
        if (level === 2) {
          const k = r.int(2, 4);
          const rc = r.int(2, 6) * (k % 2 ? 2 : 1);
          const rb = (k * rc) / 2;
          const ra = 2 * rb;
          return {
            q: `원 ${A}의 반지름은 원 ${B}의 지름과 같고, 원 ${B}의 지름은 원 ${C}의 반지름의 $${k}$배입니다. 원 ${C}의 반지름이 $${rc}$ cm일 때, 원 ${A}의 지름은 몇 cm인가요?`,
            answer: { type: 'num', value: 2 * ra, unit: 'cm' },
            steps: [`원 ${B}의 지름: $${rc}\\times${k}=${2 * rb}$ (cm)`, `원 ${A}의 반지름 $=$ 원 ${B}의 지름 $=${2 * rb}$ cm`, `원 ${A}의 지름: $${ra}\\times2=${2 * ra}$ (cm)`],
            hint: `원 ${C}부터 차례로 구해요.`,
          };
        }
        // 원 B 의 반지름을 □ 로: A 의 반지름 = B 의 지름 (2□), C 의 지름 = B 의 반지름의 k 배 (C 반지름 = k□/2)
        const k = r.pick([2, 4, 6]);
        const rb = r.int(2, 8);
        const dA = 4 * rb,
          dB = 2 * rb,
          dC = k * rb;
        const S = dA + dB + dC;
        return {
          q: `원 ${A}의 반지름은 원 ${B}의 지름과 같고, 원 ${C}의 지름은 원 ${B}의 반지름의 $${k}$배입니다. 세 원의 지름의 합이 $${S}$ cm일 때, 원 ${B}의 반지름은 몇 cm인가요?`,
          answer: { type: 'num', value: rb, unit: 'cm' },
          steps: [
            `원 ${B}의 반지름을 □ cm라 하면 원 ${B}의 지름은 □의 $2$배`,
            `원 ${A}의 반지름은 □의 $2$배 → 원 ${A}의 지름은 □의 $4$배`,
            `원 ${C}의 지름은 □의 $${k}$배`,
            `세 지름의 합은 □의 $${4 + 2 + k}$배 $=${S}$ → □ $=${S}\\div${6 + k}=${rb}$`,
          ],
          hint: `원 ${B}의 반지름을 기준으로 다른 길이를 나타내 보세요.`,
        };
      },
    },
  ],

  // ───────── e3b-4 분수
  'e3b-4': [
    {
      id: 'frac-reverse',
      title: '분수만큼의 양으로 전체 구하기',
      gen(r, level) {
        const name = pickName(r);
        const it = r.pick([
          { w: '사탕', u: '개' },
          { w: '구슬', u: '개' },
          { w: '색종이', u: '장' },
          { w: '딱지', u: '장' },
        ]);
        if (level === 1) {
          const a = r.int(2, 9),
            b = r.int(2, 9);
          return {
            q: `${nm(name)}가 가진 ${it.w}의 $${fr(1, a)}$은 $${b}$${it.u}입니다. ${nm(name)}가 가진 ${J(it.w, '은/는')} 모두 몇 ${it.u}인가요?`,
            answer: { type: 'num', value: a * b, unit: it.u },
            steps: [`전체를 똑같이 $${a}$묶음으로 나눈 것 중 $1$묶음이 $${b}$${it.u}`, `전체: $${b}\\times${a}=${a * b}$ (${it.u})`],
          };
        }
        if (level === 2) {
          const [a, k] = until(
            () => [r.int(3, 9), r.int(2, 8)],
            ([a, k]) => k < a && gcd(a, k) === 1,
          );
          const t = r.int(2, 9);
          return {
            q: `${nm(name)}가 가진 ${it.w}의 $${fr(k, a)}$는 $${k * t}$${it.u}입니다. ${nm(name)}가 가진 ${J(it.w, '은/는')} 모두 몇 ${it.u}인가요?`,
            answer: { type: 'num', value: a * t, unit: it.u },
            steps: [`$${fr(k, a)}$는 $${a}$묶음 중 $${k}$묶음 → $1$묶음은 $${k * t}\\div${k}=${t}$${it.u}`, `전체: $${t}\\times${a}=${a * t}$ (${it.u})`],
            hint: '먼저 한 묶음의 양을 구해요.',
          };
        }
        const [a, b, k, t] = until(
          () => [r.int(2, 5), r.int(3, 6), r.int(1, 4), r.int(1, 4)],
          ([, b, k]) => k < b && gcd(k, b) === 1,
        );
        const T = a * b * t;
        const r1 = T - T / a;
        const give2 = (r1 / b) * k;
        const left = r1 - give2;
        const other = pick2Names(r).find((x) => x !== name) ?? '친구';
        return {
          q: `${nm(name)}는 가지고 있던 ${it.w}의 $${fr(1, a)}$을 동생에게 주고, 남은 ${it.w}의 $${fr(k, b)}$를 ${other}에게 주었더니 $${left}$${J(it.u, '이/가')} 남았습니다. ${nm(name)}가 처음에 가지고 있던 ${J(it.w, '은/는')} 몇 ${it.u}인가요?`,
          answer: { type: 'num', value: T, unit: it.u },
          steps: [
            `${other}에게 주고 남은 $${left}$${J(it.u, '은/는')} (동생에게 주고 남은 양)의 $${fr(b - k, b)}$`,
            `동생에게 주고 남은 양: $${b - k > 1 ? `${left}\\div${b - k}\\times${b}` : `${left}\\times${b}`}=${r1}$ (${it.u})`,
            `$${r1}$${J(it.u, '은/는')} 처음 양의 $${fr(a - 1, a)}$ → 처음 양: $${a > 2 ? `${r1}\\div${a - 1}\\times${a}` : `${r1}\\times${a}`}=${T}$ (${it.u})`,
            `확인: $${T}$의 $${fr(1, a)}$은 $${T / a}$, 남은 $${r1}$의 $${fr(k, b)}$는 $${give2}$, $${r1}-${give2}=${left}$`,
          ],
          hint: '마지막에 남은 양부터 거꾸로 생각해요.',
        };
      },
    },
  ],

  // ───────── e3b-5 들이와 무게
  'e3b-5': [
    {
      id: 'container-weight',
      title: '빈 그릇의 무게 구하기',
      gen(r, level) {
        if (level === 1) {
          const bag = r.int(3, 9) * 100 + r.int(0, 9) * 10,
            book = r.int(25, 60) * 10,
            n = r.int(2, 5);
          const W = bag + n * book;
          return {
            q: `무게가 같은 책 $${n}$권을 넣은 가방의 무게는 ${kgg(W)}입니다. 책 한 권의 무게가 $${book}$ g이라면 빈 가방의 무게는 몇 g인가요?`,
            answer: { type: 'num', value: bag, unit: 'g' },
            steps: [`책 $${n}$권의 무게: $${book}\\times${n}=${c(n * book)}$ (g)`, `빈 가방: ${kgg(W)} $-$ ${kgg(n * book)} $=$ $${bag}$ g`],
          };
        }
        if (level === 2) {
          const [n1, n2] = until(
            () => [r.int(2, 5), r.int(5, 9)],
            ([a, b]) => b > a,
          );
          const ap = r.int(18, 35) * 10,
            bk = r.int(2, 8) * 100 + r.int(1, 9) * 10;
          const W1 = bk + n1 * ap,
            W2 = bk + n2 * ap;
          return {
            q: `바구니에 무게가 같은 사과를 $${n1}$개 담았더니 ${kgg(W1)}이었고, $${n2}$개 담았더니 ${kgg(W2)}이었습니다. 빈 바구니의 무게는 몇 g인가요?`,
            answer: { type: 'num', value: bk, unit: 'g' },
            steps: [
              `사과 $${n2 - n1}$개의 무게: ${kgg(W2)} $-$ ${kgg(W1)} $=$ $${c((n2 - n1) * ap)}$ g`,
              `사과 한 개: $${c((n2 - n1) * ap)}\\div${n2 - n1}=${ap}$ (g)`,
              `빈 바구니: $${c(W1)}-${ap}\\times${n1}=${c(W1)}-${c(n1 * ap)}=${bk}$ (g)`,
            ],
            hint: '두 무게의 차는 사과 몇 개의 무게일까요?',
          };
        }
        const bottle = r.int(2, 9) * 100 + r.int(1, 9) * 10;
        const water = r.int(6, 18) * 100; // 물의 무게(g), 짝수 백
        const W1 = bottle + water,
          W2 = bottle + water / 2;
        const ask = r.chance(0.5) ? 'bottle' : 'water';
        return {
          q: `물이 가득 들어 있는 병의 무게를 재었더니 ${kgg(W1)}이었습니다. 이 병에 든 물의 반을 마신 뒤 다시 재었더니 ${kgg(W2)}이었습니다. ${ask === 'bottle' ? '빈 병의 무게는 몇 g인가요?' : '병에 가득 들어 있던 물의 무게는 몇 g인가요?'}`,
          answer: {
            type: 'num',
            value: ask === 'bottle' ? bottle : water,
            unit: 'g',
          },
          steps: [
            `줄어든 무게 ${kgg(W1)} $-$ ${kgg(W2)} $=$ $${water / 2}$ g은 물의 반`,
            `가득 든 물: $${water / 2}\\times2=${c(water)}$ (g)`,
            ask === 'bottle' ? `빈 병: $${c(W1)}-${c(water)}=${bottle}$ (g)` : `답: $${c(water)}$ g`,
          ],
          hint: '마신 물의 무게는 두 무게의 차예요.',
        };
      },
    },
  ],

  // ───────── e3b-6 그림그래프
  'e3b-6': [
    {
      id: 'graph-ratio',
      title: '몇 배 조건으로 지워진 자료 구하기',
      gen(r, level) {
        const th = r.pick(GTH);
        const units = level === 1 ? [10, 1] : [100, 10];
        const mul = level === 1 ? 1 : 10;
        const labs = th.labels;
        const p = r.int(2, 3);
        const [i, j] = r.sample([0, 1, 2, 3], 2); // i 가 j 의 p 배
        const vals = until(
          () => labs.map(() => r.int(11, 45) * mul),
          (v) => new Set(v).size === 4 && v[j] * p <= 70 * mul,
        );
        const add = level === 3 ? r.int(1, 9) * mul : 0;
        vals[i] = vals[j] * p + add;
        const nm2 = (k: number) => labs[k] + th.suf;
        if (level === 1) {
          const shown = vals.map((v, k) => (k === i ? 0 : v));
          const tot = sum(vals);
          return {
            q: `${J(th.title, '을/를')} 나타낸 그림그래프인데 ${nm2(i)}의 그림이 지워졌습니다. ${J(th.of(nm2(i)), '은/는')} ${nm2(j)}의 $${p}$배입니다. ${th.all('네')} 몇 ${th.unit}인가요?`,
            fig: picGraph(
              labs.map((l) => l + th.suf),
              shown,
              units,
              { unitName: th.unit, head: th.head },
            ),
            answer: { type: 'num', value: tot, unit: th.unit },
            steps: [`${nm2(j)}: $${vals[j]}$${th.unit}`, `${nm2(i)}: $${vals[j]}\\times${p}=${vals[i]}$ (${th.unit})`, `모두: $${vals.join('+')}=${c(tot)}$ (${th.unit})`],
          };
        }
        const shown = vals.map((v, k) => (k === i || k === j ? 0 : v));
        const tot = sum(vals);
        const known = tot - vals[i] - vals[j];
        const cond = add ? `${J(th.of(nm2(i)), '은/는')} ${nm2(j)}의 $${p}$배보다 $${add}$${th.unit} 더 많습니다` : `${J(th.of(nm2(i)), '은/는')} ${nm2(j)}의 $${p}$배입니다`;
        return {
          q: `${J(th.title, '을/를')} 나타낸 그림그래프인데 ${J(nm2(i), '와/과')} ${nm2(j)}의 그림이 지워졌습니다. ${th.all('네')} $${c(tot)}$${th.unit}이고, ${cond}. ${J(th.of(nm2(i)), '은/는')} 몇 ${th.unit}인가요?`,
          fig: picGraph(
            labs.map((l) => l + th.suf),
            shown,
            units,
            { unitName: th.unit, head: th.head },
          ),
          answer: { type: 'num', value: vals[i], unit: th.unit },
          steps: [
            `그림이 남아 있는 두 곳의 합: $${c(known)}$${th.unit}`,
            `지워진 두 곳의 합: $${c(tot)}-${c(known)}=${c(tot - known)}$ (${th.unit})`,
            add
              ? `${J(nm2(j), '을/를')} □라 하면 □ $+$ □$\\times${p}+${add}=${c(tot - known)}$ → □의 $${p + 1}$배 $=${c(tot - known - add)}$`
              : `${J(nm2(j), '을/를')} □라 하면 □ $+$ □$\\times${p}=${c(tot - known)}$ → □의 $${p + 1}$배 $=${c(tot - known)}$`,
            `□ $=${c(tot - known - add)}\\div${p + 1}=${vals[j]}$`,
            `${nm2(i)}: $${vals[j]}\\times${p}${add ? `+${add}` : ''}=${vals[i]}$ (${th.unit})`,
          ],
          hint: '지워진 두 곳의 합을 먼저 구해요.',
        };
      },
    },
  ],
};

/** 그림그래프 주제 */
const GTH = [
  {
    title: '마을별 감자 수확량',
    labels: ['가', '나', '다', '라'],
    suf: ' 마을',
    head: '마을',
    unit: 'kg',
    of: (n: string) => `${n}의 감자 수확량`,
    all: (k: string) => `${k} 마을의 감자 수확량은 모두`,
  },
  {
    title: '목장별 우유 생산량',
    labels: ['푸른', '초록', '하늘', '별빛'],
    suf: ' 목장',
    head: '목장',
    unit: 'L',
    of: (n: string) => `${n}의 우유 생산량`,
    all: (k: string) => `${k} 목장의 우유 생산량은 모두`,
  },
  {
    title: '반별 모은 빈 병의 수',
    labels: ['1반', '2반', '3반', '4반'],
    suf: '',
    head: '반',
    unit: '개',
    of: (n: string) => `${J(n, '이/가')} 모은 빈 병의 수`,
    all: (k: string) => `${k} 반이 모은 빈 병은 모두`,
  },
  {
    title: '가게별 하루 동안 팔린 빵의 수',
    labels: ['해님', '달님', '별님', '구름'],
    suf: ' 가게',
    head: '가게',
    unit: '개',
    of: (n: string) => `${n}에서 팔린 빵의 수`,
    all: (k: string) => `${k} 가게에서 팔린 빵은 모두`,
  },
];

// ═════════════════════════════ 최상위 유형 ═════════════════════════════
export const TOP3: Record<string, Skill[]> = {
  // ───────── e3a-1
  'e3a-1': [
    {
      id: 'top-cards-min-diff',
      title: '수 카드로 차가 가장 작은 두 수 만들기',
      gen(r) {
        const cs = until(
          () => (r.chance(0.5) ? [0, ...r.sample(DIG, 5)] : r.sample(DIG, 6)),
          (cs) => cs.some((x) => x >= 1 && cs.includes(x + 1)),
        );
        let best = Infinity;
        for (const p of perms(cs, 6)) {
          if (p[0] === 0 || p[3] === 0) continue;
          const a = num(p.slice(0, 3)),
            b = num(p.slice(3));
          if (a > b && a - b < best) best = a - b;
        }
        const cands = cs
          .filter((h) => h >= 1 && cs.includes(h + 1))
          .sort((a, b) => a - b)
          .map((h) => {
            const rest = cs.filter((x) => x !== h && x !== h + 1).sort((a, b) => a - b);
            const big = num([h + 1, rest[0], rest[1]]);
            const small = num([h, rest[3], rest[2]]);
            return { h, big, small, d: big - small };
          });
        const win = cands.reduce((a, b) => (b.d < a.d ? b : a));
        return {
          q: `수 카드 $${boxes(r.shuffle(cs))}$을 한 번씩 모두 사용하여 세 자리 수 $2$개를 만들려고 합니다. 두 수의 차가 가장 작게 되도록 만들 때, 그 차는 얼마인가요?`,
          answer: { type: 'num', value: best },
          steps: [
            '차가 작으려면 두 수의 백의 자리 숫자의 차가 $1$이어야 해요.',
            '그리고 큰 수의 십·일의 자리는 가능한 한 작게, 작은 수의 십·일의 자리는 가능한 한 크게 만들어요.',
            ...cands.map((x) => `백의 자리가 $${x.h + 1}$, $${x.h}$일 때: $${x.big}-${x.small}=${x.d}$`),
            `가장 작은 차: $${win.big}-${win.small}=${best}$`,
          ],
          hint: '백의 자리 숫자가 1 차이 나는 두 카드를 먼저 고르세요.',
        };
      },
    },
    {
      id: 'top-digit-sum-range',
      title: '조건에 맞는 세 자리 수 중 가장 큰 수와 가장 작은 수',
      gen(r) {
        const conds = [
          { t: '', f: (_n: number) => true },
          { t: '홀수입니다.', f: (n: number) => n % 2 === 1 },
          { t: '짝수입니다.', f: (n: number) => n % 2 === 0 },
          {
            t: '백의 자리 숫자가 일의 자리 숫자보다 작습니다.',
            f: (n: number) => Math.floor(n / 100) < n % 10,
          },
        ];
        const [S, ci, ask] = until(
          () => [r.int(6, 22), r.int(0, 3), r.pick(['sum', 'diff'])] as [number, number, string],
          ([S, ci]) => {
            const xs = Array.from({ length: 900 }, (_, i) => i + 100).filter((n) => {
              const ds = String(n).split('').map(Number);
              return new Set(ds).size === 3 && sum(ds) === S && conds[ci].f(n);
            });
            return xs.length >= 4;
          },
        );
        const xs = Array.from({ length: 900 }, (_, i) => i + 100).filter((n) => {
          const ds = String(n).split('').map(Number);
          return new Set(ds).size === 3 && sum(ds) === S && conds[ci].f(n);
        });
        const mn = xs[0],
          mxv = xs[xs.length - 1];
        const ds = (n: number) => String(n).split('').join('+');
        return {
          q: `다음 조건을 모두 만족하는 세 자리 수 중에서 가장 큰 수와 가장 작은 수의 ${ask === 'sum' ? '합을' : '차를'} 구하세요.\n- 각 자리 숫자가 모두 다릅니다.\n- 각 자리 숫자의 합은 $${S}$입니다.${conds[ci].t ? `\n- ${conds[ci].t}` : ''}`,
          answer: { type: 'num', value: ask === 'sum' ? mn + mxv : mxv - mn },
          steps: [
            '가장 큰 수는 백의 자리부터 될 수 있는 가장 큰 숫자를 차례로 정해요.',
            `가장 큰 수: $${mxv}$ ($${ds(mxv)}=${S}$)`,
            '가장 작은 수는 백의 자리부터 될 수 있는 가장 작은 숫자를 차례로 정해요.',
            `가장 작은 수: $${mn}$ ($${ds(mn)}=${S}$)`,
            ...(ci > 0 ? [`두 수 모두 '${conds[ci].t.replace(/니다\.$/, '니다')}' 조건도 맞는지 확인해요.`] : []),
            ask === 'sum' ? `$${mxv}+${mn}=${mxv + mn}$` : `$${mxv}-${mn}=${mxv - mn}$`,
          ],
          hint: '백의 자리를 정한 뒤 남은 두 자리 숫자의 합이 얼마여야 하는지 생각해 보세요.',
        };
      },
    },
  ],

  // ───────── e3a-2
  'e3a-2': [
    {
      id: 'top-square-cut',
      title: '직사각형에서 가장 큰 정사각형을 거듭 잘라 내기',
      gen(r) {
        const [a, b] = until(
          () => [r.int(20, 60), r.int(6, 40)],
          ([a, b]) => {
            if (b >= a || a % b === 0) return false;
            let x = a,
              y = b,
              k = 0,
              cnt = 0;
            while (y > 0) {
              cnt += Math.floor(x / y);
              [x, y] = [y, x % y];
              k++;
            }
            return k >= 3 && k <= 4 && cnt >= 5 && cnt <= 12;
          },
        );
        const rows: string[] = [];
        let x = a,
          y = b,
          cnt = 0;
        while (y > 0) {
          const q = Math.floor(x / y);
          cnt += q;
          rows.push(`가로 $${x}$ cm, 세로 $${y}$ cm → 한 변이 $${y}$ cm인 정사각형 $${q}$개${x % y ? `, 남은 직사각형은 $${y}$ cm와 $${x % y}$ cm` : ', 남는 종이 없음'}`);
          [x, y] = [y, x % y];
        }
        const side = x;
        const ask = r.chance(0.6) ? 'count' : 'side';
        return {
          q: `가로가 $${a}$ cm, 세로가 $${b}$ cm인 직사각형 모양의 종이가 있습니다. 이 종이에서 가장 큰 정사각형을 잘라 내고, 남은 종이에서 다시 가장 큰 정사각형을 잘라 내는 일을 남는 종이가 없을 때까지 계속했습니다. ${ask === 'count' ? '잘라 낸 정사각형은 모두 몇 개인가요?' : '잘라 낸 정사각형 중 가장 작은 정사각형의 한 변은 몇 cm인가요?'}`,
          answer: ask === 'count' ? { type: 'num', value: cnt, unit: '개' } : { type: 'num', value: side, unit: 'cm' },
          steps: ['가장 큰 정사각형의 한 변은 직사각형의 짧은 변과 같아요.', ...rows, ask === 'count' ? `모두 $${cnt}$개` : `가장 작은 정사각형의 한 변: $${side}$ cm`],
          hint: '긴 변에서 짧은 변을 몇 번 뺄 수 있는지 생각해 보세요.',
        };
      },
    },
    {
      id: 'top-stair-perimeter',
      title: '계단 모양 도형의 네 변의 길이의 합',
      gen(r) {
        const n = r.int(3, 6);
        const sq = r.chance(0.5);
        const a = r.int(2, 9),
          b = sq
            ? a
            : until(
                () => r.int(2, 9),
                (x) => x !== a,
              );
        const W = n * a,
          H = n * b;
        const f = Math.min(1, 200 / (n * 26), 170 / ((n * 26 * b) / a));
        const cw = 26 * f,
          chh = ((26 * b) / a) * f;
        const s = new Svg(40 + n * cw, 30 + n * chh);
        for (let i = 0; i < n; i++)
          for (let j = 0; j < n - i; j++)
            s.rect(20 + j * cw, 15 + (n - 1 - i) * chh, cw, chh, {
              cls: 'acc',
              fill: i % 2 === 0,
            });
        const what = sq ? `한 변이 $${a}$ cm인 정사각형` : `가로가 $${a}$ cm, 세로가 $${b}$ cm인 직사각형`;
        return {
          q: `${what}을 그림과 같이 아래층부터 차례로 ${n === 3 ? '$3$개, $2$개, $1$개' : `$${n}$개, $${n - 1}$개, …, $1$개`}씩 계단 모양으로 겹치지 않게 붙였습니다. 만든 도형의 둘레는 몇 cm인가요?`,
          fig: s.toString(),
          answer: { type: 'num', value: 2 * (W + H), unit: 'cm' },
          steps: [
            '계단의 가로 선분들을 위로 밀어 올리면 맨 위 한 변이 되고, 세로 선분들을 오른쪽으로 밀면 오른쪽 한 변이 돼요.',
            `그래서 둘레는 가로 $${n}\\times${a}=${W}$ (cm), 세로 $${n}\\times${b}=${H}$ (cm)인 직사각형의 둘레와 같아요.`,
            `$${W}+${H}+${W}+${H}=${2 * (W + H)}$ (cm)`,
          ],
          hint: '계단의 선분을 옮기면 어떤 도형의 둘레와 같아질까요?',
        };
      },
    },
  ],

  // ───────── e3a-3
  'e3a-3': [
    {
      id: 'top-share-ways',
      title: '남김없이 똑같이 나누는 방법의 수',
      gen(r) {
        const N = r.pick([12, 16, 18, 24, 36, 20, 28, 30, 32, 40, 42, 45, 48, 54, 56, 63, 72, 27]);
        const pairs = [2, 3, 4, 5, 6, 7, 8, 9].filter((p) => N % p === 0 && N / p >= 2 && N / p <= 9).map((p) => [p, N / p]);
        const variant = r.chance(0.5) && pairs.some(([p, q]) => q > p) ? 'more' : 'all';
        const okp = variant === 'all' ? pairs : pairs.filter(([p, q]) => q > p);
        const it = r.pick([
          { w: '구슬', u: '개', box: '상자' },
          { w: '쿠키', u: '개', box: '봉지' },
          { w: '연필', u: '자루', box: '필통' },
        ]);
        return {
          q: `${it.w} $${N}$${it.u}를 ${it.box}에 남김없이 똑같이 나누어 담으려고 합니다. ${J(it.box, '은/는')} $2$개 이상 $9$개 이하로 쓰고, 한 ${it.box}에 담는 ${it.w}도 $2$${it.u} 이상 $9$${it.u} 이하가 되게 하려고 합니다. ${variant === 'all' ? `나누어 담는 방법은 모두 몇 가지인가요?` : `한 ${it.box}에 담는 ${it.w}의 수가 ${it.box}의 수보다 많은 방법은 모두 몇 가지인가요?`}`,
          answer: { type: 'num', value: okp.length, unit: '가지' },
          steps: [
            `(${it.box} 수)$\\times$(한 ${it.box}에 담는 수)$=${N}$ 이 되는 곱셈구구를 찾아요.`,
            ...pairs.map(([p, q]) => `$${p}\\times${q}=${N}$ → ${it.box} $${p}$개에 $${q}$${it.u}씩`),
            ...(variant === 'more' ? ['이 중 담는 수가 상자 수보다 많은 것만 골라요.'.replace('상자', it.box)] : []),
            `답: $${okp.length}$가지`,
          ],
          hint: `곱해서 $${N}$이 되는 두 한 자리 수를 모두 찾아보세요.`,
        };
      },
    },
    {
      id: 'top-shape-div',
      title: '나눗셈식으로 모양이 나타내는 수 찾기',
      gen(r) {
        const [p, q, cc] = until(
          () => [r.int(2, 5), r.int(2, 4), r.int(1, 3)],
          ([p, q, cc]) => q * cc <= 9 && p * q * cc <= 81 && p * q * cc >= 10,
        );
        const b = q * cc,
          a = p * b;
        const S = a + b + cc;
        const k = p * q + q + 1;
        return {
          q: `같은 모양은 같은 수를 나타냅니다. ★, ●, ▲가 나타내는 수를 각각 구하세요.\n- ★$\\div$●$=${p}$\n- ●$\\div$▲$=${q}$\n- ★$+$●$+$▲$=${S}$`,
          answer: {
            type: 'fields',
            fields: [
              { label: '★', value: a },
              { label: '●', value: b },
              { label: '▲', value: cc },
            ],
          },
          steps: [
            `●$\\div$▲$=${q}$ → ●는 ▲가 $${q}$개인 수`,
            `★$\\div$●$=${p}$ → ★는 ●가 $${p}$개, 곧 ▲가 $${p * q}$개인 수`,
            `★$+$●$+$▲는 ▲가 $${p * q}+${q}+1=${k}$개인 수 $=${S}$`,
            `▲ $=${S}\\div${k}=${cc}$ (▲$=1$이면 합이 $${k}$, ▲$=2$이면 $${2 * k}$, … 로 확인)`,
            `● $=${cc}\\times${q}=${b}$, ★ $=${b}\\times${p}=${a}$`,
          ],
          hint: '★와 ●를 모두 ▲ 몇 개로 나타내 보세요.',
        };
      },
    },
  ],

  // ───────── e3a-4
  'e3a-4': [
    {
      id: 'top-mul-puzzle',
      title: '곱셈식의 빈칸 추론하기',
      gen(r) {
        const [A, a0, b] = until(
          () => [r.int(1, 9), r.pick([1, 3, 7, 9]), r.int(2, 9)],
          ([A, a0, b]) => {
            const P = (10 * A + a0) * b;
            if (P < 100 || P > 999) return false;
            const P1 = Math.floor(P / 10) % 10,
              P0 = P % 10;
            let n = 0;
            for (let x = 1; x <= 9; x++) for (let y = 1; y <= 9; y++) for (let z = 1; z <= 9; z++) if ((10 * x + a0) * y === 100 * z + 10 * P1 + P0) n++;
            return n === 1;
          },
        );
        const a = 10 * A + a0,
          P = a * b;
        const P2 = Math.floor(P / 100),
          P1 = Math.floor(P / 10) % 10,
          P0 = P % 10;
        const carry = Math.floor((a0 * b) / 10);
        const tensC = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => (x * b + carry) % 10 === P1);
        return {
          q: `□, △, ○ 안에 알맞은 숫자를 구하세요. (모두 $1$부터 $9$까지의 숫자예요.) $$\\square ${a0}\\times\\triangle=\\bigcirc ${P1}${P0}$$`,
          answer: {
            type: 'fields',
            fields: [
              { label: '□', value: A },
              { label: '△', value: b },
              { label: '○', value: P2 },
            ],
          },
          steps: [
            `일의 자리: $${a0}\\times$△의 일의 자리 숫자가 $${P0}$ → △ $=${b}$ ($${a0}\\times${b}=${a0 * b}$)`,
            carry ? `십의 자리로 $${carry}$을 올려요.` : '십의 자리로 올리는 수는 없어요.',
            `십의 자리: □$\\times${b}${carry ? `+${carry}` : ''}$의 일의 자리 숫자가 $${P1}$ → □ 후보: ${tensC.map((x) => `$${x}$`).join(', ')}`,
            tensC.length > 1 ? `이 중 곱이 세 자리 수 $\\bigcirc${P1}${P0}$가 되는 것은 □ $=${A}$뿐이에요.` : `□ $=${A}$`,
            `$${a}\\times${b}=${P}$ → ○ $=${P2}$`,
          ],
          hint: '일의 자리 곱부터 생각해 보세요.',
        };
      },
    },
    {
      id: 'top-unit-digit',
      title: '같은 수를 여러 번 곱한 수의 일의 자리',
      gen(r) {
        const base = r.pick([2, 3, 7, 8, 4, 9, 13, 17, 12, 18]);
        const u = base % 10;
        const cyc: number[] = [];
        let x = u;
        while (!cyc.includes(x)) {
          cyc.push(x);
          x = (x * u) % 10;
        }
        const L = cyc.length;
        const n = L === 4 ? r.int(10, 36) : r.int(10, 18);
        const k = Math.floor(n / L),
          m = n % L;
        const ans = cyc[(n - 1) % L];
        return {
          q: `$${base}$을 $${n}$번 곱한 수 $(${base}\\times${base}\\times\\cdots\\times${base})$의 일의 자리 숫자는 무엇인가요?`,
          answer: { type: 'num', value: ans },
          steps: [
            `곱의 일의 자리 숫자는 곱하는 수들의 일의 자리 숫자${base >= 10 ? `($${u}$)` : ''}만으로 정해져요.`,
            `일의 자리 숫자만 차례로 곱하면: ${[...cyc, cyc[0]].map((d, i) => `$${i + 1}$번 → $${d}$`).join(', ')}`,
            `$${L}$번마다 같은 숫자가 되풀이돼요: ${cyc.map((d) => `$${d}$`).join(', ')}`,
            m === 0 ? `$${n}=${L}\\times${k}$ 이므로 $${n}$번은 $${L}$번째와 같아요.` : `$${n}=${L}\\times${k}+${m}$ 이므로 $${n}$번은 $${m}$번째와 같아요.`,
            `답: $${ans}$`,
          ],
          hint: '일의 자리 숫자만 곱해 보며 규칙을 찾아보세요.',
        };
      },
    },
  ],

  // ───────── e3a-5
  'e3a-5': [
    {
      id: 'top-slow-clock',
      title: '늦어지거나 빨라지는 시계',
      gen(r) {
        const h = r.int(1, 6);
        const n = 3 + h;
        const b = r.int(8, 40);
        const slow = r.chance(0.5);
        const dev = n * b;
        const real = (12 + h) * 3600;
        const shown = slow ? real - dev : real + dev;
        return {
          q: `한 시간에 $${b}$초씩 ${slow ? '늦어지는' : '빨라지는'} 시계가 있습니다. 이 시계를 오늘 오전 $9$시에 정확히 맞추었습니다. 같은 날 오후 $${h}$시에 이 시계가 가리키는 시각은 오후 몇 시 몇 분 몇 초인가요?`,
          answer: {
            type: 'fields',
            fields: [
              { label: '시', value: h12(shown) },
              { label: '분', value: Math.floor((shown % 3600) / 60) },
              { label: '초', value: shown % 60 },
            ],
          },
          steps: [
            `오전 $9$시부터 오후 $${h}$시까지: $3$시간 $+$ $${h}$시간 $=$ $${n}$시간`,
            `${slow ? '늦어지는' : '빨라지는'} 시간: $${b}\\times${n}=${dev}$ (초) $=$ ${ms(dev)}`,
            `오후 $${h}$시 ${slow ? '$-$' : '$+$'} ${ms(dev)}`,
            `답: ${clockText(shown)}`,
          ],
          hint: '먼저 몇 시간이 지났는지 구해요.',
        };
      },
    },
    {
      id: 'top-tape-overlap',
      title: '이어 붙인 색 테이프에서 겹친 길이 구하기',
      gen(r) {
        const n = r.int(3, 9);
        const L = r.int(10, 25) * 10 + r.int(1, 9); // mm
        const o = r.int(2, 9);
        const T = n * L - (n - 1) * o;
        const a = Math.floor(L / 10),
          b = L % 10;
        const tot = n * L;
        return {
          q: `길이가 $${a}$ cm $${b}$ mm인 색 테이프 $${n}$장을 같은 길이만큼씩 겹쳐서 한 줄로 길게 이어 붙였더니 전체 길이가 ${cmmm(T)}가 되었습니다. 색 테이프를 몇 mm씩 겹쳐서 붙였나요?`,
          answer: { type: 'num', value: o, unit: 'mm' },
          steps: [
            `테이프 $${n}$장의 길이의 합: $${a}\\times${n}=${a * n}$ (cm), $${b}\\times${n}=${b * n}$ (mm) → ${cmmm(tot)}`,
            `겹친 곳의 길이의 합: ${cmmm(tot)} $-$ ${cmmm(T)} $=$ $${tot - T}$ mm`,
            `$${n}$장을 이으면 겹친 곳은 $${n}-1=${n - 1}$군데`,
            `한 곳: $${tot - T}\\div${n - 1}=${o}$ (mm)`,
          ],
          hint: '겹친 곳은 테이프 수보다 1 적어요.',
        };
      },
    },
  ],

  // ───────── e3a-6
  'e3a-6': [
    {
      id: 'top-pizza-left',
      title: '나누어 먹고 남은 양을 분수·소수로 나타내기',
      gen(r) {
        const [n1, n2] = pick2Names(r);
        const n3 = '동생';
        const [n, a, rel, d, third] = until(
          () => [r.pick([8, 10, 12, 16]), r.int(1, 5), r.pick(['more', 'twice']), r.int(1, 3), r.pick(['half', 'half1'])] as [number, number, string, number, string],
          ([n, a, rel, d, third]) => {
            const b = rel === 'more' ? a + d : 2 * a;
            const rem = n - a - b;
            if (rem < 2 || rem % 2) return false;
            const left = third === 'half' ? rem / 2 : rem / 2 - 1;
            return left >= 1 && (n === 10 || gcd(left, n) === 1);
          },
        );
        const b = rel === 'more' ? a + d : 2 * a;
        const rem = n - a - b;
        const ate3 = third === 'half' ? rem / 2 : rem / 2 + 1;
        const left = rem - ate3;
        const decimal = n === 10;
        return {
          q: `피자 한 판을 똑같이 $${n}$조각으로 나누었습니다. ${nm(n1)}는 전체의 $${fr(a, n)}$을 먹었고, ${nm(n2)}는 ${rel === 'more' ? `${nm(n1)}보다 $${d}$조각 더 많이` : `${nm(n1)}가 먹은 양의 $2$배만큼`} 먹었습니다. 그다음 ${n3}이 남은 조각의 반${third === 'half' ? '을' : '보다 $1$조각 더 많이'} 먹었다면, 남은 피자는 전체의 얼마인지 ${decimal ? '소수로' : '분수로'} 나타내세요.`,
          answer: decimal ? { type: 'num', value: left / 10, display: 'dec' } : { type: 'num', value: left / n, display: 'frac' },
          steps: [
            `${n1}: $${fr(a, n)}$ → $${n}$조각 중 $${a}$조각`,
            `${n2}: ${rel === 'more' ? `$${a}+${d}=${b}$` : `$${a}\\times2=${b}$`} (조각)`,
            `두 사람이 먹고 남은 조각: $${n}-${a}-${b}=${rem}$ (조각)`,
            `${n3}이 먹은 조각: $${rem}$의 반은 $${rem / 2}$${third === 'half' ? '' : ` → $${rem / 2}+1=${ate3}$`} (조각)`,
            `남은 조각: $${rem}-${ate3}=${left}$ (조각)`,
            decimal ? `$10$조각 중 $${left}$조각 → $${fr(left, 10)}=0.${left}$` : `$${n}$조각 중 $${left}$조각 → $${fr(left, n)}$`,
          ],
          hint: '분수를 조각 수로 바꾸어 생각해요.',
        };
      },
    },
    {
      id: 'top-dec-riddle',
      title: '조건을 모두 만족하는 소수 찾기',
      gen(r) {
        type C = { t: string; f: (x: number) => boolean };
        const pool = (): C[] => {
          const lo = r.int(5, 60),
            hi = lo + r.int(12, 30);
          const s = r.int(5, 14);
          const par = r.chance(0.5);
          return [
            {
              t: `$0.1$이 $${lo}$개인 수보다 크고, $0.1$이 $${hi}$개인 수보다 작습니다.`,
              f: (x) => x > lo && x < hi,
            },
            {
              t: `소수 첫째 자리 숫자는 ${par ? '짝수' : '홀수'}입니다.`,
              f: (x) => (x % 10) % 2 === (par ? 0 : 1),
            },
            {
              t: `자연수 부분의 숫자와 소수 첫째 자리 숫자의 합은 $${s}$입니다.`,
              f: (x) => Math.floor(x / 10) + (x % 10) === s,
            },
            {
              t: '자연수 부분의 숫자는 소수 첫째 자리 숫자보다 큽니다.',
              f: (x) => Math.floor(x / 10) > x % 10,
            },
            {
              t: '자연수 부분의 숫자는 소수 첫째 자리 숫자보다 작습니다.',
              f: (x) => Math.floor(x / 10) < x % 10,
            },
          ];
        };
        const [cs, ans] = until(
          () => {
            const P = pool();
            const pickIdx = r.chance(0.5) ? [0, 1, 2] : [0, 2, r.pick([3, 4])];
            const cs = pickIdx.map((i) => P[i]);
            const xs = Array.from({ length: 100 }, (_, i) => i).filter((x) => x % 10 !== 0 && cs.every((c0) => c0.f(x)));
            // 첫 조건만으로는 여러 개, 모두 합치면 하나
            const after1 = Array.from({ length: 100 }, (_, i) => i).filter((x) => x % 10 !== 0 && cs[0].f(x)).length;
            return [cs, xs.length === 1 && after1 >= 5 ? xs[0] : -1] as [C[], number];
          },
          ([, a]) => a > 0,
        );
        const D = (t: number) => `${Math.floor(t / 10)}.${t % 10}`;
        const xs0 = Array.from({ length: 100 }, (_, i) => i).filter((x) => x % 10 !== 0 && cs[0].f(x));
        const xs1 = xs0.filter((x) => cs[1].f(x));
        return {
          q: `다음 조건을 모두 만족하는 소수 $\\square.\\square$를 구하세요. (소수 첫째 자리 숫자는 $0$이 아니에요.)\n${cs.map((c0) => '- ' + c0.t).join('\n')}`,
          answer: { type: 'num', value: ans / 10, display: 'dec' },
          steps: [
            `첫째 조건에 맞는 소수: $${D(xs0[0])}$부터 $${D(xs0[xs0.length - 1])}$까지 (소수 첫째 자리가 $0$인 것은 빼요)`,
            `둘째 조건까지 맞는 소수: ${xs1.map((x) => `$${D(x)}$`).join(', ')}`,
            `셋째 조건까지 맞는 소수는 $${D(ans)}$ 하나뿐이에요.`,
            `답: $${D(ans)}$`,
          ],
          hint: '0.1이 몇 개인 수인지로 범위를 먼저 정해요.',
        };
      },
    },
  ],

  // ───────── e3b-1
  'e3b-1': [
    {
      id: 'top-mul22-puzzle',
      title: '두 자리 수끼리의 곱셈식 빈칸 추론',
      gen(r) {
        const [a1, X, b1, Y, cands] = until(
          () => {
            const a1 = r.int(1, 9),
              X = r.int(1, 9),
              b1 = r.int(1, 9),
              Y = r.int(1, 9);
            const P = (10 * a1 + X) * (10 * b1 + Y);
            const cands: [number, number][] = [];
            let sols = 0;
            for (let x = 0; x <= 9; x++)
              for (let y = 0; y <= 9; y++) {
                if ((x * y) % 10 === P % 10) cands.push([x, y]);
                if ((10 * a1 + x) * (10 * b1 + y) === P) sols++;
              }
            return [a1, X, b1, Y, sols === 1 && cands.length >= 2 && cands.length <= 5 && P >= 1000 ? cands : []] as [number, number, number, number, [number, number][]];
          },
          (v) => v[4].length > 0,
        );
        const P = (10 * a1 + X) * (10 * b1 + Y);
        const lo = 10 * a1 * 10 * b1,
          hi = (10 * a1 + 9) * (10 * b1 + 9);
        return {
          q: `□와 △ 안에 알맞은 숫자를 구하세요. $$${a1}\\square\\times${b1}\\triangle=${c(P)}$$`,
          answer: {
            type: 'fields',
            fields: [
              { label: '□', value: X },
              { label: '△', value: Y },
            ],
          },
          steps: [
            `어림하기: $${a1}0\\times${b1}0=${c(lo)}$, $${a1}9\\times${b1}9=${c(hi)}$ 사이에 $${c(P)}$가 있어요.`,
            `일의 자리: □$\\times$△의 일의 자리 숫자가 $${P % 10}$이어야 해요.`,
            `이런 경우를 모두 곱해 보면: ${cands.map(([x, y]) => `$${a1}${x}\\times${b1}${y}=${c((10 * a1 + x) * (10 * b1 + y))}$`).join(', ')}`,
            `곱이 꼭 $${c(P)}$인 것은 □ $=${X}$, △ $=${Y}$`,
          ],
          hint: '곱의 일의 자리 숫자와 어림한 크기를 함께 생각해요.',
        };
      },
    },
    {
      id: 'top-mul-swap',
      title: '곱하는 수의 두 숫자를 바꾸어 잘못 곱한 경우',
      gen(r) {
        const [x, p, q] = until(
          () => [r.int(12, 49), r.int(1, 8), r.int(2, 9)],
          ([x, p, q]) => q > p && x * 9 * (q - p) <= 999 && x * 9 * (q - p) >= 100,
        );
        const m = 10 * p + q,
          m2 = 10 * q + p;
        const N = x * (m2 - m);
        return {
          q: `어떤 두 자리 수에 $${m}$을 곱해야 할 것을 잘못하여 $${m}$의 십의 자리 숫자와 일의 자리 숫자를 바꾼 수를 곱했더니, 바르게 계산한 값보다 $${N}$만큼 커졌습니다. 바르게 계산한 값은 얼마인가요?`,
          answer: { type: 'num', value: x * m },
          steps: [
            `바꾼 수는 $${m2}$, 두 곱하는 수의 차: $${m2}-${m}=${m2 - m}$`,
            `(어떤 수)$\\times${m2}$ $-$ (어떤 수)$\\times${m}$ $=$ (어떤 수)$\\times${m2 - m}$ $=${N}$`,
            q - p > 1 ? `$${m2 - m}=9\\times${q - p}$ 이므로 어떤 수 $=${N}\\div9\\div${q - p}=${x}$` : `어떤 수 $=${N}\\div9=${x}$`,
            `바르게 계산: $${x}\\times${m}=${c(x * m)}$`,
            `확인: $${x}\\times${m2}=${c(x * m2)}$, $${c(x * m2)}-${c(x * m)}=${N}$`,
          ],
          hint: '두 곱의 차는 (어떤 수)×(두 곱하는 수의 차)예요.',
        };
      },
    },
  ],

  // ───────── e3b-2
  'e3b-2': [
    {
      id: 'top-quot-eq-rem',
      title: '몫과 나머지가 같은 수',
      gen(r) {
        const d = r.int(4, 9);
        const ks = Array.from({ length: d - 1 }, (_, i) => i + 1);
        const xs = ks.map((k) => (d + 1) * k);
        const ask = r.pick(['max', 'sum', 'two']);
        const two = xs.filter((x) => x >= 10 && x <= 99);
        const ans = ask === 'max' ? xs[xs.length - 1] : ask === 'sum' ? sum(xs) : two.length;
        return {
          q: `어떤 자연수를 $${d}$로 나누었더니 몫과 나머지가 같았습니다. ${ask === 'max' ? '이런 수 중에서 가장 큰 수를 구하세요.' : ask === 'sum' ? '이런 수를 모두 더하면 얼마인가요?' : '이런 수 중에서 두 자리 수는 모두 몇 개인가요?'}`,
          answer: ask === 'two' ? { type: 'num', value: ans, unit: '개' } : { type: 'num', value: ans },
          steps: [
            `나머지는 나누는 수 $${d}$보다 작으니 $1$부터 $${d - 1}$까지 될 수 있어요. ($0$이면 몫도 $0$이라 자연수가 아니에요.)`,
            `몫과 나머지가 모두 □이면 그 수는 $${d}\\times$□$+$□ $=${d + 1}\\times$□`,
            `가능한 수: ${xs.map((x) => `$${x}$`).join(', ')}`,
            ask === 'max' ? `가장 큰 수: $${d + 1}\\times${d - 1}=${ans}$` : ask === 'sum' ? `합: $${xs.join('+')}=${ans}$` : `두 자리 수: ${two.map((x) => `$${x}$`).join(', ')} → $${ans}$개`,
          ],
          hint: '나머지가 될 수 있는 수부터 생각해 보세요.',
        };
      },
    },
    {
      id: 'top-bead-pattern',
      title: '규칙적으로 반복되는 것의 개수 세기',
      gen(r) {
        const th = r.pick([
          {
            thing: '구슬',
            act: '꿰었습니다',
            colors: ['빨간', '파란', '노란', '초록'],
            u: '개',
            unitw: '구슬',
          },
          {
            thing: '꽃',
            act: '심었습니다',
            colors: ['장미', '튤립', '국화', '백합'],
            u: '송이',
            unitw: '',
          },
        ]);
        const pat = until(
          () => Array.from({ length: r.int(4, 7) }, () => r.int(0, 2)),
          (p) => new Set(p).size === 3 && p.filter((x) => x === 0).length >= 2,
        );
        const word = (i: number) => (th.unitw ? `${th.colors[i]} ${th.unitw}` : th.colors[i]);
        const N = until(
          () => r.int(100, 300),
          (n) => n % pat.length !== 0,
        );
        const p = pat.length;
        const q = Math.floor(N / p),
          rem = N % p;
        const target = 0;
        const per = pat.filter((x) => x === target).length;
        const part = pat.slice(0, rem).filter((x) => x === target).length;
        const ans = q * per + part;
        return {
          q: `${th.thing === '구슬' ? '구슬을' : '꽃을 한 줄로'} ${pat.map(word).join(', ')} 순서로 되풀이하여 모두 $${N}$${th.u} ${th.act}. ${J(word(target), '은/는')} 모두 몇 ${th.u}인가요?`,
          answer: { type: 'num', value: ans, unit: th.u },
          steps: [
            `$${p}$${J(th.u, '이/가')} 한 묶음으로 되풀이되고, 한 묶음에 ${J(word(target), '은/는')} $${per}$${th.u}`,
            `$${N}\\div${p}=${q}$ … $${rem}$ → $${q}$묶음과 $${rem}$${th.u}`,
            `$${q}$묶음에 들어 있는 수: $${q}\\times${per}=${q * per}$ (${th.u})`,
            `남은 $${rem}$${th.u}(${pat.slice(0, rem).map(word).join(', ')}) 중: $${part}$${th.u}`,
            `모두 $${q * per}+${part}=${ans}$ (${th.u})`,
          ],
          hint: '한 묶음이 몇 개인지 찾고 나눗셈을 해 보세요.',
        };
      },
    },
  ],

  // ───────── e3b-3
  'e3b-3': [
    {
      id: 'top-growing-circles',
      title: '반지름이 일정하게 커지는 원 이어 그리기',
      gen(r) {
        const n = r.int(4, 6),
          a = r.int(1, 4),
          d = r.int(1, 3);
        const rs = Array.from({ length: n }, (_, i) => a + i * d);
        const L = 2 * sum(rs);
        const ask = r.pick(['len', 'center', 'first']);
        const P: Record<string, Pt> = {};
        let x = 0;
        rs.forEach((rr, i) => {
          x += rr;
          P[`c${i}`] = [x, 0];
          x += rr;
        });
        P['ㄱ'] = [0, 0];
        P['ㄴ'] = [x, 0];
        const fig = geoFig({
          P,
          circles: rs.map((rr, i) => ({ c: `c${i}`, r: rr })),
          segs: [{ a: 'ㄱ', b: 'ㄴ', cls: 'acc2' }],
          dots: rs.map((_, i) => `c${i}`),
          labels: ['ㄱ', 'ㄴ'],
          labelDir: { ㄱ: [-1, 0], ㄴ: [1, 0] },
          w: 300,
          h: 150,
        });
        const cen = L - rs[0] - rs[n - 1];
        if (ask === 'first')
          return {
            q: `반지름이 □ cm인 원부터 시작하여 반지름이 $${d}$ cm씩 커지는 원 $${n}$개를 그림과 같이 한 줄로 맞닿게 이어 그렸습니다. 선분 ㄱㄴ의 길이가 $${L}$ cm일 때, 가장 작은 원의 반지름은 몇 cm인가요?`,
            fig,
            answer: { type: 'num', value: a, unit: 'cm' },
            steps: [
              '선분 ㄱㄴ은 모든 원의 지름을 더한 것과 같아요 → 반지름의 합은 선분 ㄱㄴ의 반',
              `반지름의 합: $${L}\\div2=${L / 2}$ (cm)`,
              `가장 작은 원의 반지름을 □라 하면 반지름은 □, □$+${d}$, …, □$+${d * (n - 1)}$`,
              `□가 $${n}$개와 $${Array.from({ length: n }, (_, i) => i * d)
                .slice(1)
                .join('+')}=${(d * n * (n - 1)) / 2}$의 합이 $${L / 2}$`,
              `□의 $${n}$배 $=${L / 2}-${(d * n * (n - 1)) / 2}=${n * a}$ → □ $=${a}$`,
            ],
            hint: '선분 ㄱㄴ은 지름을 모두 더한 길이예요.',
          };
        return {
          q: `반지름이 $${a}$ cm인 원부터 시작하여 반지름이 $${d}$ cm씩 커지는 원 $${n}$개를 그림과 같이 한 줄로 맞닿게 이어 그렸습니다. ${ask === 'len' ? '선분 ㄱㄴ의 길이는 몇 cm인가요?' : '가장 작은 원의 중심에서 가장 큰 원의 중심까지의 거리는 몇 cm인가요?'}`,
          fig,
          answer: { type: 'num', value: ask === 'len' ? L : cen, unit: 'cm' },
          steps: [
            `반지름: ${rs.map((x) => `$${x}$`).join(', ')} (cm)`,
            `지름: ${rs.map((x) => `$${2 * x}$`).join(', ')} (cm)`,
            `선분 ㄱㄴ $=$ 지름의 합 $=${rs.map((x) => 2 * x).join('+')}=${L}$ (cm)`,
            ...(ask === 'center' ? [`양 끝 원의 반지름을 빼요: $${L}-${rs[0]}-${rs[n - 1]}=${cen}$ (cm)`] : []),
          ],
          hint: '맞닿은 원을 이은 길이는 지름의 합이에요.',
        };
      },
    },
    {
      id: 'top-three-radii',
      title: '세 원이 맞닿을 때 각각의 반지름 구하기',
      gen(r) {
        const [r1, r2, r3] = until(
          () => [r.int(2, 12), r.int(2, 12), r.int(2, 12)],
          (v) => new Set(v).size === 3,
        );
        const a = r1 + r2,
          b = r2 + r3,
          cc = r1 + r3;
        const [A, B, C] = ['가', '나', '다'];
        const ask = r.int(0, 2);
        const ans = [r1, r2, r3][ask];
        const tri: Pt[] = (() => {
          const x = (a * a + cc * cc - b * b) / (2 * a);
          const y = Math.sqrt(Math.max(0, cc * cc - x * x));
          return [
            [0, 0],
            [a, 0],
            [x, y],
          ];
        })();
        const fig = geoFig({
          P: { 가: tri[0], 나: tri[1], 다: tri[2] },
          circles: [
            { c: '가', r: r1 },
            { c: '나', r: r2 },
            { c: '다', r: r3 },
          ],
          polys: [['가', '나', '다']],
          dots: ['가', '나', '다'],
          w: 260,
          h: 220,
        });
        const half = (a + b + cc) / 2;
        const other = [b, cc, a][ask];
        return {
          q: `원 ${A}, ${B}, ${C}가 그림과 같이 서로 맞닿아 있습니다. 원의 중심을 이은 선분 ${A}${B}는 $${a}$ cm, 선분 ${B}${C}는 $${b}$ cm, 선분 ${A}${C}는 $${cc}$ cm일 때, 원 ${[A, B, C][ask]}의 반지름은 몇 cm인가요?`,
          fig,
          answer: { type: 'num', value: ans, unit: 'cm' },
          steps: [
            `맞닿은 두 원의 중심 사이 거리는 두 반지름의 합이에요.`,
            `(${A}의 반지름)$+$(${B}의 반지름)$=${a}$, (${B})$+$(${C})$=${b}$, (${A})$+$(${C})$=${cc}$`,
            `세 식을 모두 더하면 세 반지름의 합의 $2$배: $${a}+${b}+${cc}=${a + b + cc}$`,
            `세 반지름의 합: $${a + b + cc}\\div2=${half}$ (cm)`,
            `원 ${[A, B, C][ask]}의 반지름: $${half}-${other}=${ans}$ (cm)`,
          ],
          hint: '세 선분의 길이를 모두 더해 보세요.',
        };
      },
    },
  ],

  // ───────── e3b-4
  'e3b-4': [
    {
      id: 'top-frac-equal-parts',
      title: '분수만큼이 같은 두 양',
      gen(r) {
        const [a, b] = until(
          () => [r.int(2, 7), r.int(2, 7)],
          ([a, b]) => a !== b && a + b <= 9,
        );
        const k = r.int(3, 12);
        const [n1, n2] = pick2Names(r);
        const it = r.pick([
          { w: '구슬', u: '개' },
          { w: '딱지', u: '장' },
          { w: '스티커', u: '장' },
        ]);
        const useSum = r.chance(0.6);
        const total = useSum ? (a + b) * k : Math.abs(a - b) * k;
        const ask = r.chance(0.5) ? 1 : 2;
        const ans = ask === 1 ? a * k : b * k;
        return {
          q: `${n1}가 가진 ${it.w}의 $${fr(1, a)}$과 ${n2}가 가진 ${it.w}의 $${fr(1, b)}$이 같습니다. 두 사람이 가진 ${useSum ? `${J(it.w, '은/는')} 모두 $${total}$${it.u}` : `${it.w}의 수의 차는 $${total}$${it.u}`}입니다. ${ask === 1 ? n1 : n2}가 가진 ${J(it.w, '은/는')} 몇 ${it.u}인가요?`,
          answer: { type: 'num', value: ans, unit: it.u },
          steps: [
            `같은 양을 ■라 하면 ${n1}의 ${J(it.w, '은/는')} ■가 $${a}$개, ${n2}의 ${J(it.w, '은/는')} ■가 $${b}$개`,
            useSum ? `두 사람의 ${J(it.w, '은/는')} ■가 $${a}+${b}=${a + b}$개 → $${total}$${it.u}` : `두 사람의 차는 ■가 $${Math.abs(a - b)}$개 → $${total}$${it.u}`,
            `■ $=${total}\\div${useSum ? a + b : Math.abs(a - b)}=${k}$ (${it.u})`,
            `${ask === 1 ? n1 : n2}: $${k}\\times${ask === 1 ? a : b}=${ans}$ (${it.u})`,
            `확인: $${a * k}$의 $${fr(1, a)}$은 $${k}$, $${b * k}$의 $${fr(1, b)}$도 $${k}$`,
          ],
          hint: '같은 양을 한 묶음으로 생각해 보세요.',
        };
      },
    },
    {
      id: 'top-frac-sum-diff',
      title: '분모와 분자의 합과 차로 분수 구하기',
      gen(r) {
        const improper = r.chance(0.6);
        const [nu, de] = until(
          () => {
            const de = r.int(3, 13);
            return improper ? [de * r.int(1, 4) + r.int(1, de - 1), de] : [r.int(1, de - 1), de];
          },
          ([nu, de]) => (improper ? fracOk(nu, de) && nu % de !== 0 : gcd(nu, de) === 1) && nu + de <= 70 && nu !== de - 1,
        );
        const S = nu + de,
          D = Math.abs(nu - de);
        const big = Math.max(nu, de),
          small = Math.min(nu, de);
        return {
          q: `분모와 분자의 합이 $${S}$이고 차가 $${D}$인 ${improper ? '가분수가 있습니다. 이 분수를 대분수로 나타내세요.' : '진분수를 구하세요.'}`,
          answer: {
            type: 'num',
            value: nu / de,
            display: improper ? 'mixed' : 'frac',
          },
          steps: [
            improper ? '가분수는 분자가 분모보다 커요.' : '진분수는 분자가 분모보다 작아요.',
            `큰 수 $+$ 작은 수 $=${S}$, 큰 수 $-$ 작은 수 $=${D}$`,
            `두 식을 더하면 큰 수의 $2$배 $=${S}+${D}=${S + D}$ → 큰 수 $=${big}$`,
            `작은 수 $=${S}-${big}=${small}$`,
            improper ? `가분수 $${fr(nu, de)}=${mx(nu, de)}$` : `진분수 $${fr(nu, de)}$`,
          ],
          hint: '합과 차를 더하면 큰 수의 몇 배일까요?',
        };
      },
    },
  ],

  // ───────── e3b-5
  'e3b-5': [
    {
      id: 'top-pour-min',
      title: '두 그릇으로 물을 가장 적게 부어 담기',
      gen(r) {
        const [A, B, N, sols] = until(
          () => {
            const A = r.pick([200, 300, 400, 500, 600, 700, 800]);
            const B = r.pick([300, 500, 700, 900, 1100, 1300]);
            const N = r.int(20, 60) * 100;
            const sols: [number, number][] = [];
            for (let y = 0; y * B <= N; y++) if ((N - y * B) % A === 0) sols.push([(N - y * B) / A, y]);
            return [A, B, N, sols] as [number, number, number, [number, number][]];
          },
          ([A, B, , sols]) => {
            if (A >= B || gcd(A, B) !== 100 || sols.length < 2 || sols.length > 5) return false;
            const m = Math.min(...sols.map(([x, y]) => x + y));
            const bst = sols.find(([x, y]) => x + y === m)!;
            return sols.filter(([x, y]) => x + y === m).length === 1 && sols.every(([x]) => x <= 25) && bst[0] > 0 && bst[1] > 0;
          },
        );
        const best = sols.reduce((p, q) => (q[0] + q[1] < p[0] + p[1] ? q : p));
        return {
          q: `들이가 ${lml(A)}인 그릇 ㉮와 ${lml(B)}인 그릇 ㉯가 있습니다. 두 그릇에 물을 가득 채워 빈 수조에 붓기만 하여 수조에 물을 정확히 ${lml(N)} 담으려고 합니다. 물을 가장 적게 붓는다면 모두 몇 번 부어야 하나요?`,
          answer: { type: 'num', value: best[0] + best[1], unit: '번' },
          steps: [
            `${lml(N)} $=$ $${c(N)}$ mL`,
            `㉯로 붓는 횟수를 정하고 나머지를 ㉮로 채울 수 있는지 알아봐요.`,
            ...sols.map(([x, y]) => `㉯ $${y}$번($${c(y * B)}$ mL) $+$ ㉮ $${x}$번($${c(x * A)}$ mL) → $${x + y}$번`),
            `가장 적은 횟수: ㉮ $${best[0]}$번, ㉯ $${best[1]}$번 → $${best[0] + best[1]}$번`,
          ],
          hint: '들이가 큰 그릇을 많이 쓸수록 횟수가 줄어들어요. 남은 양이 ㉮로 딱 맞는지 확인하세요.',
        };
      },
    },
    {
      id: 'top-balance',
      title: '저울로 무게를 바꾸어 생각하기',
      gen(r) {
        const [a, b, cc, g] = until(
          () => [r.int(2, 4), r.int(3, 7), r.int(2, 4), r.int(7, 12) * 10],
          ([a, b, cc, g]) => a < b && (b * cc * g) % a === 0 && (b * cc * g) / a <= 2500 && (b * cc * g) / a >= 800,
        );
        const apple = cc * g,
          melon = (b * apple) / a;
        const ask = r.chance(0.5) ? 'melon' : 'mix';
        const k = r.int(2, 3);
        const mixW = melon + k * apple;
        return {
          q: `저울에 달아 보니 멜론 $${a}$개의 무게는 사과 $${b}$개의 무게와 같고, 사과 $1$개의 무게는 귤 $${cc}$개의 무게와 같았습니다. 귤 한 개의 무게가 $${g}$ g일 때, ${ask === 'melon' ? '멜론 한 개의 무게는 몇 g인가요?' : `멜론 $1$개와 사과 $${k}$개의 무게의 합은 몇 g인가요?`} (같은 과일끼리는 무게가 같아요.)`,
          answer: {
            type: 'num',
            value: ask === 'melon' ? melon : mixW,
            unit: 'g',
          },
          steps: [
            `사과 $1$개 $=$ 귤 $${cc}$개 → $${g}\\times${cc}=${apple}$ (g)`,
            `사과 $${b}$개: $${apple}\\times${b}=${c(b * apple)}$ (g)`,
            `멜론 $${a}$개 $=$ 사과 $${b}$개 $=${c(b * apple)}$ g → 멜론 $1$개: $${c(b * apple)}\\div${a}=${c(melon)}$ (g)`,
            ...(ask === 'mix' ? [`멜론 $1$개와 사과 $${k}$개: $${c(melon)}+${apple}\\times${k}=${c(mixW)}$ (g)`] : []),
          ],
          hint: '가장 가벼운 귤부터 차례로 무게를 구해요.',
        };
      },
    },
  ],

  // ───────── e3b-6
  'e3b-6': [
    {
      id: 'top-graph-multi',
      title: '여러 조건으로 지워진 그림그래프 완성하기',
      gen(r) {
        const th = r.pick(GTH);
        const labs = [...th.labels, th.labels === GTH[2].labels ? '5반' : '마'];
        if (th === GTH[1]) labs[4] = '은빛';
        if (th === GTH[3]) labs[4] = '바람';
        const nm2 = (k: number) => labs[k] + th.suf;
        const [ia, ib, ic] = r.sample([0, 1, 2, 3, 4], 3);
        const p = r.int(2, 3);
        const rel = r.pick(['A', 'B']); // C 는 A(또는 B) 보다 x 많거나 적음
        const sgn = r.pick([1, -1]);
        const [vals, x] = until(
          () => {
            const v = labs.map(() => r.int(12, 45) * 10);
            const x = r.int(3, 15) * 10;
            v[ia] = v[ib] * p;
            v[ic] = (rel === 'A' ? v[ia] : v[ib]) + sgn * x;
            return [v, x] as [number[], number];
          },
          ([v]) => v[ic] >= 50 && v[ia] <= 900 && new Set(v).size === 5,
        );
        const shown = vals.map((v, k) => ([ia, ib, ic].includes(k) ? 0 : v));
        const tot = sum(vals);
        const known = sum(shown);
        const coef = 1 + p + (rel === 'A' ? p : 1);
        const askI = r.pick([ia, ib, ic]);
        return {
          q: `${J(th.title, '을/를')} 나타낸 그림그래프인데 ${nm2(ia)}, ${nm2(ib)}, ${nm2(ic)}의 그림이 지워졌습니다. 다음을 보고 ${J(th.of(nm2(askI)), '을/를')} 구하세요.\n- ${th.all('다섯')} $${c(tot)}$${th.unit}입니다.\n- ${J(nm2(ia), '은/는')} ${nm2(ib)}의 $${p}$배입니다.\n- ${J(nm2(ic), '은/는')} ${nm2(rel === 'A' ? ia : ib)}보다 $${x}$${th.unit} ${sgn > 0 ? '더 많습니다' : '더 적습니다'}.`,
          fig: picGraph(
            labs.map((l) => l + th.suf),
            shown,
            [100, 10],
            { unitName: th.unit, head: th.head },
          ),
          answer: { type: 'num', value: vals[askI], unit: th.unit },
          steps: [
            `그림이 남은 두 곳: $${c(known)}$${th.unit} → 지워진 세 곳의 합: $${c(tot)}-${c(known)}=${c(tot - known)}$`,
            `${J(nm2(ib), '을/를')} □라 하면 ${J(nm2(ia), '은/는')} □가 $${p}$개, ${J(nm2(ic), '은/는')} □가 $${rel === 'A' ? p : 1}$개인 수보다 $${x}$ ${sgn > 0 ? '많아요' : '적어요'}.`,
            `세 곳의 합은 □가 $${coef}$개${sgn > 0 ? `와 $${x}$의 합` : `에서 $${x}$를 뺀 값`} $=${c(tot - known)}$`,
            `□의 $${coef}$배 $=${c(tot - known)}${sgn > 0 ? '-' : '+'}${x}=${c(tot - known - sgn * x)}$ → □ $=${vals[ib]}$`,
            `${nm2(ia)}: $${vals[ia]}$, ${nm2(ic)}: $${vals[ic]}$ (${th.unit})`,
            `답: $${vals[askI]}$${th.unit}`,
          ],
          hint: '지워진 세 곳을 모두 한 곳의 양으로 나타내 보세요.',
        };
      },
    },
    {
      id: 'top-graph-units',
      title: '그림 한 개가 나타내는 수 알아내기',
      gen(r) {
        const [U, u] = r.pick([
          [100, 10],
          [10, 1],
          [50, 10],
          [1000, 100],
        ]);
        const [a1, b1, a2, b2, a3, b3] = until(
          () => [r.int(2, 3), r.int(1, 4), 1, r.int(2, 6), r.int(1, 4), r.int(1, 6)],
          ([a1, b1, a2, b2]) => b2 * a1 > b1 && b2 * a1 - b1 <= 9 && a2 === 1,
        );
        const v1 = a1 * U + b1 * u,
          v2 = a2 * U + b2 * u,
          v3 = a3 * U + b3 * u;
        const th = r.pick([
          {
            what: '귤 수확량',
            row: ['가 마을', '나 마을', '다 마을'],
            unit: 'kg',
          },
          {
            what: '모은 헌 종이의 무게',
            row: ['1반', '2반', '3반'],
            unit: 'kg',
          },
          {
            what: '공책 판매량',
            row: ['가 문구점', '나 문구점', '다 문구점'],
            unit: '권',
          },
        ]);
        const s = new Svg(280, 120);
        const rowsA = [
          [a1, b1],
          [a2, b2],
          [a3, b3],
        ];
        rowsA.forEach(([A, B], i) => {
          const y = 22 + i * 34;
          s.text(40, y, th.row[i], { size: 12 });
          let x = 90;
          for (let t = 0; t < A; t++) {
            s.circle(x, y, 10, { cls: 'acc', fill: true });
            x += 25;
          }
          for (let t = 0; t < B; t++) {
            s.circle(x, y, 5, { cls: 'acc', fill: true });
            x += 15;
          }
          s.line(4, y + 17, 276, y + 17, { cls: 'grid' });
        });
        const diffSmall = a1 * b2 - b1;
        return {
          q: `큰 그림과 작은 그림으로 ${J(th.what, '을/를')} 나타낸 그림그래프인데, 그림이 나타내는 수가 적힌 부분이 찢어졌습니다. ${J(th.row[0], '은/는')} $${c(v1)}$${th.unit}, ${J(th.row[1], '은/는')} $${c(v2)}$${th.unit}입니다. ${th.row[2]}의 ${J(th.what, '은/는')} 몇 ${th.unit}인가요?`,
          fig: s.toString(),
          answer: { type: 'num', value: v3, unit: th.unit },
          steps: [
            `${th.row[0]}: 큰 그림 $${a1}$개, 작은 그림 $${b1}$개 $=${c(v1)}$`,
            `${th.row[1]}: 큰 그림 $1$개, 작은 그림 $${b2}$개 $=${c(v2)}$ → $${a1}$배 하면 큰 그림 $${a1}$개, 작은 그림 $${a1 * b2}$개 $=${c(a1 * v2)}$`,
            `두 경우를 비교하면 작은 그림 $${diffSmall}$개 $=${c(a1 * v2)}-${c(v1)}=${c(a1 * v2 - v1)}$ → 작은 그림 $1$개 $=${c(u)}$`,
            `큰 그림 $1$개 $=${c(v2)}-${c(b2 * u)}=${c(U)}$`,
            `${th.row[2]}: 큰 그림 $${a3}$개, 작은 그림 $${b3}$개 → $${c(a3 * U)}+${c(b3 * u)}=${c(v3)}$ (${th.unit})`,
          ],
          hint: '나 쪽을 몇 배 하여 큰 그림 수를 같게 만들어 보세요.',
        };
      },
    },
  ],
};
