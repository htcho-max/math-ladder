// 중2-1 심화·최상위 유형 추가분 — m12.ts 에서 각 단원 skills 뒤에 붙이고 top 으로 넣는다
import type { ProblemDraft } from '../../core/types';
import { F } from '../../core/frac';
import { factorize, gcd } from '../../core/nt';
import { linTex, termsTex } from '../../core/tex';
import { NAMES, fp, lin2, texChoices } from './util';
import { dotTex } from './m2a';
import { factTex, retry, type HardSet } from './hard1';

const sys = (e1: string, e2: string, e3?: string) => `\\begin{cases} ${e1} \\\\ ${e2}${e3 ? ` \\\\ ${e3}` : ''} \\end{cases}`;
const badPart = (d: number) => factorize(d).filter(([p]) => p !== 2 && p !== 5).reduce((a, [p, e]) => a * p ** e, 1);

// ═══════════════════ m2a-1 유리수와 순환소수 ═══════════════════
const m2a1: HardSet = {
  skills: [
    {
      id: 'between-finite',
      title: '범위 안에서 유한소수가 되는 분수의 개수',
      gen(r, level): ProblemDraft {
        return retry(
          () => {
            const D =
              level === 1 ? r.pick([12, 14, 15, 18, 24, 28, 30, 35, 36, 45]) : level === 2 ? r.pick([24, 28, 36, 42, 44, 48, 56, 60, 72]) : r.pick([42, 66, 84, 105, 126, 132, 140, 154, 168, 210]);
            const B = badPart(D);
            if (B === 1) return null;
            let L = new F(0);
            let R = new F(1);
            if (level >= 2) {
              const b = r.int(2, 9);
              const a = r.int(1, b - 1);
              const d = r.int(2, 9);
              const c = r.int(1, level === 3 ? 2 * d : d - 1);
              L = new F(a, b);
              R = new F(c, d);
              if (L.cmp(R) >= 0 || gcd(a, b) !== 1 || gcd(c, d) !== 1 || c % d === 0) return null;
            }
            const lo = L.mul(D);
            const hi = R.mul(D);
            const ks: number[] = [];
            for (let k = 1; k < hi.value + 1; k++) if (lo.value < k && k < hi.value && k % B === 0 && k % D !== 0) ks.push(k);
            if (ks.length < 2 || ks.length > 12) return null;
            const range = level === 1 ? '$0$ 보다 크고 $1$ 보다 작은 분수' : `$${L.tex()}$ 보다 크고 $${R.tex()}$ 보다 작은 분수`;
            return {
              q: `분모가 $${D}$ 인 분수 중에서 ${range} $\\frac{k}{${D}}$ ($k$ 는 자연수) 를 소수로 나타낼 때, 유한소수가 되는 것은 모두 몇 개인지 구하세요.`,
              answer: { type: 'num', value: ks.length, unit: '개' },
              steps: [
                `$${D} = ${factTex(D)}$`,
                `유한소수가 되려면 기약분수의 분모에 $2$, $5$ 이외의 소인수가 없어야 하므로 $k$ 는 $${B}$ 의 배수여야 합니다.`,
                level === 1 ? `$0 < k < ${D}$` : `$${L.tex()} < \\frac{k}{${D}} < ${R.tex()}$ 에서 $${lo.tex()} < k < ${hi.tex()}$`,
                `$${B}$ 의 배수: ${ks.map((k) => `$${k}$`).join(', ')}${hi.value > D ? ` (단, $k = ${D}$ 이면 $\\frac{${D}}{${D}} = 1$ 로 정수이므로 제외)` : ''}`,
                `답: $${ks.length}$ 개`,
              ],
              hint: '분모를 소인수분해하여 없애야 할 소인수를 찾으세요.',
            };
          },
          () => ({ q: '$\\frac{k}{6}$ ($0 < k < 6$) 중 유한소수가 되는 것의 개수를 구하세요.', answer: { type: 'num', value: 1, unit: '개' }, steps: ['$k = 3$'] }),
        );
      },
    },
  ],
  top: [
    {
      id: 'rep-digit-sum',
      title: '순환소수의 자릿수 합',
      gen(r): ProblemDraft {
        return retry(
          () => {
            const variantB = r.chance(0.45);
            const dg = () => r.int(variantB ? 1 : 0, 9);
            const preLen = r.int(0, 2);
            const repLen = r.int(2, 4);
            const pre = Array.from({ length: preLen }, dg).join('');
            const rep = Array.from({ length: repLen }, dg).join('');
            // 순환마디가 더 짧아지지 않도록
            for (let L = 1; L < repLen; L++) if (repLen % L === 0 && rep === rep.slice(0, L).repeat(repLen / L)) return null;
            if (preLen > 0 && pre[preLen - 1] === rep[repLen - 1]) return null;
            const digit = (i: number) => Number(i <= preLen ? pre[i - 1] : rep[(i - preLen - 1) % repLen]);
            const n = r.int(20, 80);
            let S = 0;
            for (let i = 1; i <= n; i++) S += digit(i);
            const preSum = [...pre].reduce((s, c) => s + Number(c), 0);
            const repSum = [...rep].reduce((s, c) => s + Number(c), 0);
            const m = n - preLen;
            const qn = Math.floor(m / repLen);
            const rem = m % repLen;
            const part = [...rep.slice(0, rem)].reduce((s, c) => s + Number(c), 0);
            const x = dotTex(0, pre, rep);
            return {
              q: variantB
                ? `순환소수 $${x}$ 의 소수점 아래 첫째 자리 숫자부터 차례로 더해 갈 때, 합이 처음으로 $${S}$ 이 되는 것은 소수점 아래 몇째 자리 숫자까지 더했을 때인지 구하세요.`
                : `순환소수 $${x}$ 의 소수점 아래 첫째 자리부터 $${n}$ 째 자리까지의 숫자의 합을 구하세요.`,
              answer: variantB ? { type: 'num', value: n, unit: '째 자리' } : { type: 'num', value: S },
              steps: [
                preLen ? `순환하지 않는 부분 $${pre}$ (${preLen}자리, 합 $${preSum}$), 순환마디 $${rep}$ (${repLen}자리, 합 $${repSum}$)` : `순환마디 $${rep}$ 는 $${repLen}$ 자리이고 숫자의 합은 $${repSum}$`,
                variantB
                  ? `${preLen ? `$${S} - ${preSum} = ${S - preSum}$` : `$${S}$`} 을 순환마디의 합 $${repSum}$ 으로 나누면 몫 $${qn}$, 나머지 $${S - preSum - qn * repSum}$`
                  : `순환마디가 시작된 뒤 $${m}$ 자리 $= ${repLen} \\times ${qn} + ${rem}$`,
                variantB ? (rem ? `순환마디를 $${qn}$ 번 반복한 뒤 남은 $${part}$ 은 순환마디의 앞 $${rem}$ 자리 숫자의 합입니다. (숫자가 모두 $0$ 이 아니므로 합은 계속 커집니다.)` : `나머지가 $0$ 이므로 순환마디를 정확히 $${qn}$ 번 더한 곳입니다. (숫자가 모두 $0$ 이 아니므로 합은 계속 커집니다.)`) : `순환마디 $${qn}$ 번의 합 $${repSum} \\times ${qn} = ${repSum * qn}$${rem ? `, 남은 $${rem}$ 자리 $${rep.slice(0, rem)}$ 의 합 $${part}$` : ''}`,
                variantB ? `자리 수: $${preLen ? `${preLen} + ` : ''}${repLen} \\times ${qn} + ${rem} = ${n}$` : `합: $${preLen ? `${preSum} + ` : ''}${repSum * qn}${rem ? ` + ${part}` : ''} = ${S}$`,
                variantB ? `답: 소수점 아래 $${n}$ 째 자리` : `답: $${S}$`,
              ],
              hint: '순환마디가 몇 번 반복되는지 먼저 세어 보세요.',
            };
          },
          () => ({ q: '$0.\\dot{1}\\dot{2}$ 의 소수점 아래 첫째부터 넷째 자리까지 숫자의 합을 구하세요.', answer: { type: 'num', value: 6 }, steps: ['$1 + 2 + 1 + 2 = 6$'] }),
        );
      },
    },
    {
      id: 'rep-swap',
      title: '자리를 바꾼 두 순환소수',
      gen(r): ProblemDraft {
        return retry(
          () => {
            const a = r.int(1, 9);
            const b = r.int(1, 9);
            if (a <= b) return null;
            const s = a + b;
            const d = a - b;
            const sumTex = s < 9 ? `0.\\dot{${s}}` : s === 9 ? '1' : `1.\\dot{${s - 9}}`;
            const nine = String(9 * d).padStart(2, '0');
            const difTex = `0.\\dot{${nine[0]}}\\dot{${nine[1]}}`;
            const ab = `0.\\dot{a}\\dot{b}`;
            const ba = `0.\\dot{b}\\dot{a}`;
            const ans = new F(10 * a + b, 99);
            const useSum = r.chance(0.5);
            return {
              q: useSum
                ? `서로 다른 한 자리 자연수 $a$, $b$ 에 대하여 $${ab} + ${ba} = ${sumTex}$ 이고 $a - b = ${d}$ 일 때, $${ab}$ 를 기약분수로 나타내세요.`
                : `서로 다른 한 자리 자연수 $a$, $b$ 에 대하여 $${ab} - ${ba} = ${difTex}$ 이고 $a + b = ${s}$ 일 때, $${ab}$ 를 기약분수로 나타내세요.`,
              answer: { type: 'num', value: ans.value, display: 'frac', requireReduced: true },
              steps: [
                `$${ab} = \\frac{10a + b}{99}$, $${ba} = \\frac{10b + a}{99}$`,
                useSum
                  ? `두 수의 합: $\\frac{11(a + b)}{99} = \\frac{a + b}{9}$`
                  : `두 수의 차: $\\frac{9(a - b)}{99} = \\frac{a - b}{11}$`,
                useSum ? `$${sumTex} = \\frac{${s}}{9}$ 이므로 $a + b = ${s}$` : `$${difTex} = \\frac{${9 * d}}{99} = \\frac{${d}}{11}$ 이므로 $a - b = ${d}$`,
                `$a + b = ${s}$, $a - b = ${d}$ 에서 $a = ${a}$, $b = ${b}$`,
                `$0.\\dot{${a}}\\dot{${b}} = \\frac{${10 * a + b}}{99}${ans.d !== 99 ? ` = ${ans.tex()}` : ''}$`,
              ],
              hint: '두 순환소수를 모두 분수로 바꾸어 더하거나 빼 보세요.',
            };
          },
          () => ({ q: '$0.\\dot{1}\\dot{2}$ 를 기약분수로 나타내세요.', answer: { type: 'num', value: 4 / 33, display: 'frac', requireReduced: true }, steps: ['$\\frac{12}{99} = \\frac{4}{33}$'] }),
        );
      },
    },
  ],
};

// ═══════════════════ m2a-2 식의 계산 ═══════════════════
type Mo = { c: number; x: number; y: number };
const vstr = (m: Mo) => (m.x ? (m.x === 1 ? 'x' : `x^{${m.x}}`) : '') + (m.y ? (m.y === 1 ? 'y' : `y^{${m.y}}`) : '');
const moT = (m: Mo) => termsTex([{ c: m.c, v: vstr(m) }]);
const poT = (ms: Mo[]) => termsTex(ms.map((m) => ({ c: m.c, v: vstr(m) })));
const mul = (a: Mo, b: Mo): Mo => ({ c: a.c * b.c, x: a.x + b.x, y: a.y + b.y });
const lastCycle: Record<number, number[]> = { 2: [2, 4, 8, 6], 3: [3, 9, 7, 1], 4: [4, 6], 7: [7, 9, 3, 1], 8: [8, 4, 2, 6], 9: [9, 1] };
const m2a2: HardSet = {
  skills: [
    {
      id: 'wrong-mono',
      title: '잘못 계산한 단항식·다항식',
      gen(r, level): ProblemDraft {
        const rm = (cMax: number, eMax: number): Mo => ({ c: r.nonzero(-cMax, cMax), x: r.int(1, eMax), y: r.int(0, eMax - 1) });
        if (level === 1) {
          const X = rm(5, 3);
          const A = rm(4, 3);
          const B = mul(X, A);
          const wr = [moT(mul(B, A)), moT({ ...X, c: -X.c }), moT({ ...X, x: X.x + 1 }), moT({ ...X, c: X.c * 2 }), moT({ ...X, y: X.y + 1 })];
          return {
            q: `어떤 단항식에 $${moT(A)}$ 를 곱했더니 $${moT(B)}$ 가 되었습니다. 어떤 단항식은?`,
            answer: texChoices(r, moT(X), wr),
            steps: [`어떤 단항식을 $X$ 라 하면 $X \\times ${fp(A.c) === String(A.c) ? moT(A) : `(${moT(A)})`} = ${moT(B)}$`, `$X = ${moT(B)} \\div ${A.c < 0 ? `(${moT(A)})` : moT(A)} = ${moT(X)}$`],
          };
        }
        if (level === 2) {
          const A = rm(3, 2);
          const C = rm(4, 3);
          const X = mul(C, A);
          const B = mul(X, A);
          const Ap = A.c < 0 ? `(${moT(A)})` : moT(A);
          const wr = [moT(X), moT(B), moT({ ...C, c: -C.c }), moT(mul(B, A)), moT({ ...C, x: C.x + 1 })];
          return {
            q: `어떤 단항식을 $${moT(A)}$ 로 나누어야 할 것을 잘못하여 곱했더니 $${moT(B)}$ 가 되었습니다. 바르게 계산한 결과는?`,
            answer: texChoices(r, moT(C), wr),
            steps: [`어떤 단항식을 $X$ 라 하면 $X \\times ${Ap} = ${moT(B)}$`, `$X = ${moT(B)} \\div ${Ap} = ${moT(X)}$`, `바르게 계산하면 $${moT(X)} \\div ${Ap} = ${moT(C)}$`],
            hint: '먼저 어떤 단항식을 구하세요.',
          };
        }
        const A: Mo = { c: r.nonzero(-3, 3), x: 1, y: r.int(0, 1) };
        const Q: Mo[] = [
          { c: r.nonzero(-6, 6), x: r.int(1, 3), y: r.int(0, 2) },
          { c: r.nonzero(-6, 6), x: r.int(0, 2), y: r.int(1, 2) },
        ];
        if (vstr(Q[0]) === vstr(Q[1])) return this.gen(r, level);
        const X = Q.map((t) => mul(t, A));
        const P = X.map((t) => mul(t, A));
        const Ap = A.c < 0 ? `(${moT(A)})` : moT(A);
        const wr = [poT(X), poT([Q[0], { ...Q[1], c: -Q[1].c }]), poT([{ ...Q[0], c: -Q[0].c }, Q[1]]), poT(P.map((t) => mul(t, A))), poT(Q.map((t) => ({ ...t, x: t.x + 1 })))];
        return {
          q: `어떤 다항식을 $${moT(A)}$ 로 나누어야 할 것을 잘못하여 곱했더니 $${poT(P)}$ 가 되었습니다. 바르게 계산한 결과는?`,
          answer: texChoices(r, poT(Q), wr),
          steps: [
            `어떤 다항식을 $X$ 라 하면 $X \\times ${Ap} = ${poT(P)}$`,
            `$X = (${poT(P)}) \\div ${Ap} = ${poT(X)}$`,
            `바르게 계산하면 $(${poT(X)}) \\div ${Ap} = ${poT(Q)}$`,
            `(다른 풀이) 처음 결과를 $${Ap}$ 로 두 번 나누어도 됩니다.`,
          ],
          hint: '다항식을 단항식으로 나눌 때는 각 항을 나눠요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'power-digits',
      title: '거듭제곱의 곱의 자릿수',
      gen(r): ProblemDraft {
        return retry(
          () => {
            const e = r.int(6, 16);
            const two = r.chance(0.5);
            const k = r.int(0, 4);
            const k2 = two ? k : 0;
            const k5 = two ? 0 : k;
            const mt = r.pick([3, 3, 7]);
            const b = r.int(k === 0 ? 1 : 0, 3);
            const M = 2 ** k2 * 5 ** k5 * mt ** b;
            if (M === 1 || M > 99999) return null;
            const a = e + k2;
            const c = e + k5;
            const Ms = String(M);
            const big = (BigInt(M) * 10n ** BigInt(e)).toString();
            const dsum = [...Ms].reduce((s, ch) => s + Number(ch), 0);
            const pw = (p: number | string, x: number) => (x === 0 ? '' : x === 1 ? `${p}` : `${p}^{${x}}`);
            const reps: string[] = [[pw(2, a), pw(mt, b), pw(5, c)].filter(Boolean).join(' \\times ')];
            if (a % 2 === 0) reps.push([pw(4, a / 2), pw(mt, b), pw(5, c)].filter(Boolean).join(' \\times '));
            if (b >= 1 && c >= b) reps.push([pw(2, a), pw(5 * mt, b), pw(5, c - b)].filter(Boolean).join(' \\times '));
            if (b >= 1 && a >= b) reps.push([pw(2 * mt, b), pw(2, a - b), pw(5, c)].filter(Boolean).join(' \\times '));
            const shown = r.pick(reps);
            return {
              q: `$${shown}$ 은 몇 자리 자연수인지 구하고, 각 자리의 숫자의 합을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: '자릿수', value: big.length, unit: '자리' }, { label: '각 자리 숫자의 합', value: dsum }] },
              steps: [
                shown === reps[0] ? `지수법칙을 이용해 $2$ 와 $5$ 의 개수를 비교합니다.` : `$${shown} = ${reps[0]}$`,
                `$2 \\times 5 = 10$ 이 되도록 짝을 지으면 $${[pw(2, k2), pw(5, k5), pw(mt, b)].filter(Boolean).join(' \\times ')} \\times (2 \\times 5)^{${e}}$`,
                `$= ${M} \\times 10^{${e}}$`,
                `$${M}$ 뒤에 $0$ 이 $${e}$ 개 붙으므로 $${Ms.length} + ${e} = ${big.length}$ 자리`,
                Ms.length > 1 ? `각 자리 숫자의 합은 $${M}$ 의 각 자리 숫자의 합: $${[...Ms].join(' + ')} = ${dsum}$` : `각 자리 숫자의 합: $${dsum}$`,
              ],
              hint: '2 와 5 를 짝지어 10 의 거듭제곱을 만들어 보세요.',
            };
          },
          () => ({ q: '$2^{3} \\times 5^{3}$ 은 몇 자리 수인지 구하세요.', answer: { type: 'num', value: 4, unit: '자리' }, steps: ['$10^{3} = 1000$'] }),
        );
      },
    },
    {
      id: 'last-digit',
      title: '거듭제곱의 일의 자리 숫자',
      gen(r): ProblemDraft {
        const [p, q] = r.sample([2, 3, 4, 7, 8, 9], 2);
        const n = r.int(50, 2030);
        const m = r.int(50, 2030);
        const prod = r.chance(0.4);
        const ld = (b: number, e: number) => {
          const cy = lastCycle[b];
          return cy[(e - 1) % cy.length];
        };
        const dp = ld(p, n);
        const dq = ld(q, m);
        const ans = prod ? (dp * dq) % 10 : (dp + dq) % 10;
        const line = (b: number, e: number) => {
          const cy = lastCycle[b];
          const rm = e % cy.length;
          return `$${b}$ 의 거듭제곱의 일의 자리는 $${cy.join(', ')}$ 이 반복(${cy.length}개씩)되고 $${e} = ${cy.length} \\times ${Math.floor(e / cy.length)} + ${rm}$ 이므로 $${b}^{${e}}$ 의 일의 자리는 $${ld(b, e)}$`;
        };
        return {
          q: `$${p}^{${n}} ${prod ? '\\times' : '+'} ${q}^{${m}}$ 의 일의 자리 숫자를 구하세요.`,
          answer: { type: 'num', value: ans },
          steps: [
            `일의 자리 숫자는 일의 자리끼리만 계산해서 정해집니다.`,
            line(p, n),
            line(q, m),
            `${prod ? `$${dp} \\times ${dq} = ${dp * dq}$` : `$${dp} + ${dq} = ${dp + dq}$`} 이므로 일의 자리 숫자는 $${ans}$`,
            `(나머지가 $0$ 이면 반복되는 숫자 중 마지막 숫자입니다.)`,
          ],
          hint: '지수를 1, 2, 3, … 으로 늘려 가며 일의 자리 숫자의 규칙을 찾아보세요.',
        };
      },
    },
  ],
};

// ═══════════════════ m2a-3 일차부등식 ═══════════════════
const m2a3: HardSet = {
  skills: [
    {
      id: 'param-count',
      title: '자연수 해의 개수로 상수 정하기',
      gen(r, level): ProblemDraft {
        const k = r.int(2, 6);
        if (level === 1) {
          const p = r.int(1, 9);
          return {
            q: `$x$ 에 대한 부등식 $x + ${p} \\le a$ 를 만족하는 자연수 $x$ 가 $${k}$ 개일 때, 정수 $a$ 의 값을 구하세요.`,
            answer: { type: 'num', value: k + p },
            steps: [`$x \\le a - ${p}$`, `자연수 해가 $1, 2, \\ldots, ${k}$ 의 $${k}$ 개이려면 $a - ${p} = ${k}$ ($a$ 는 정수)`, `$a = ${k + p}$`],
          };
        }
        if (level === 2) {
          const p = r.int(2, 4);
          const q = r.int(1, 9);
          const as: number[] = [];
          for (let a = -50; a <= 100; a++) {
            let cnt = 0;
            for (let x = 1; x <= 200; x++) if (p * x - a < q) cnt++;
            if (cnt === k) as.push(a);
          }
          return {
            q: `$x$ 에 대한 부등식 $${p}x - a < ${q}$ 를 만족하는 자연수 $x$ 가 $${k}$ 개일 때, 정수 $a$ 의 값을 모두 구하세요.`,
            answer: { type: 'set', values: as },
            steps: [
              `$${p}x < a + ${q}$, $x < \\frac{a + ${q}}{${p}}$`,
              `자연수 해가 $1, \\ldots, ${k}$ 이려면 $${k} < \\frac{a + ${q}}{${p}} \\le ${k + 1}$`,
              `$${p * k} < a + ${q} \\le ${p * (k + 1)}$, $${p * k - q} < a \\le ${p * (k + 1) - q}$`,
              `정수 $a$: $${as.join(', ')}$`,
            ],
            hint: '경계에 등호가 들어가는지 꼭 확인하세요.',
          };
        }
        const m = r.int(1, 4);
        const n = m + r.int(2, 4);
        const u = r.nonzero(-6, 6);
        const s = m * u;
        const as: number[] = [];
        for (let a = -100; a <= 100; a++) {
          let cnt = 0;
          for (let x = 1; x <= 300; x++) if (m * (x + u) >= n * x + a) cnt++;
          if (cnt === k) as.push(a);
        }
        const sum = as.reduce((t, v) => t + v, 0);
        const d = n - m;
        return {
          q: `$x$ 에 대한 부등식 $${m === 1 ? '' : m}(x ${u > 0 ? '+' : '-'} ${Math.abs(u)}) \\ge ${n}x + a$ 를 만족하는 자연수 $x$ 가 $${k}$ 개일 때, 정수 $a$ 의 값을 모두 더하면 얼마인지 구하세요.`,
          answer: { type: 'num', value: sum },
          steps: [
            `괄호를 풀면 $${lt2(m, s)} \\ge ${n}x + a$, $${-d}x \\ge a ${s < 0 ? '+' : '-'} ${Math.abs(s)}$`,
            `양변을 음수 $${-d}$ 로 나누면 부등호 방향이 바뀌어 $x \\le \\frac{${linTex(-1, s, 'a')}}{${d}}$`,
            `자연수 해가 $${k}$ 개이려면 $${k} \\le \\frac{${linTex(-1, s, 'a')}}{${d}} < ${k + 1}$`,
            `$${d * k} \\le ${linTex(-1, s, 'a')} < ${d * (k + 1)}$ 에서 $${s - d * (k + 1)} < a \\le ${s - d * k}$`,
            `정수 $a$: $${as.join(', ')}$ → 합 $${sum}$`,
          ],
          hint: '음수로 나누면 부등호의 방향이 바뀌어요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'same-solution',
      title: '해가 같은 두 부등식 (계수의 부호 판단)',
      gen(r): ProblemDraft {
        return retry(
          () => {
            const c = r.nonzero(-6, 6);
            const mm = r.int(-3, 5);
            const v = r.int(-3, 5);
            if (mm === v) return null;
            const u = r.nonzero(-5, 5);
            const w = (mm - v) * c + mm * u;
            const less = mm - v > 0; // ② 의 해가 x < c
            const p = r.int(-4, 5);
            const dd = less ? -r.int(1, 4) : r.int(1, 4); // a - p
            const Q = dd * c;
            const k1 = r.int(1, 9);
            const k2 = Q - k1;
            const a = p + dd;
            const E2 = `${mm === 1 ? linTex(1, u) : `${mm === -1 ? '-' : mm}(x ${u > 0 ? '+' : '-'} ${Math.abs(u)})`} < ${linTex(v, w)}`;
            if (mm === 0 || v === 0) return null;
            const E1 = `ax - ${k1} > ${linTex(p, k2)}`;
            if (p === 0) return null;
            return {
              q: `$x$ 에 대한 두 일차부등식 $${E1}$, $${E2}$ 의 해가 서로 같을 때, 상수 $a$ 의 값을 구하세요.`,
              answer: { type: 'num', value: a },
              steps: [
                `두 번째 부등식: $${linTex(mm, mm * u)} < ${linTex(v, w)}$, $${linTex(mm - v, 0)} < ${(mm - v) * c}$`,
                mm - v === 1 ? `따라서 해는 $x < ${c}$` : `양변을 $${mm - v}$ 로 나누면 해는 $x ${less ? '<' : '>'} ${c}$${less ? '' : ' (음수로 나누어 방향이 바뀜)'}`,
                `첫 번째 부등식을 정리하면 $(a ${p > 0 ? '-' : '+'} ${Math.abs(p)})x > ${Q}$`,
                less ? `해가 $x < ${c}$ 꼴이려면 부등호 방향이 바뀌어야 하므로 $a ${p > 0 ? '-' : '+'} ${Math.abs(p)} < 0$` : `해가 $x > ${c}$ 꼴이려면 $a ${p > 0 ? '-' : '+'} ${Math.abs(p)} > 0$`,
                `이때 해는 $x ${less ? '<' : '>'} \\frac{${Q}}{a ${p > 0 ? '-' : '+'} ${Math.abs(p)}}$ 이므로 $\\frac{${Q}}{a ${p > 0 ? '-' : '+'} ${Math.abs(p)}} = ${c}$`,
                `$a ${p > 0 ? '-' : '+'} ${Math.abs(p)} = ${dd}$ (조건에 맞음), $a = ${a}$`,
              ],
              hint: 'x 의 계수의 부호에 따라 부등호 방향이 어떻게 되는지 생각하세요.',
            };
          },
          () => ({ q: '부등식 $-2x > 4$ 의 해를 구할 때 $x$ 의 범위의 경계값을 구하세요.', answer: { type: 'num', value: -2 }, steps: ['$x < -2$'] }),
        );
      },
    },
    {
      id: 'share-range',
      title: '나누어 주기 (과부족과 부등식)',
      gen(r): ProblemDraft {
        return retry(
          () => {
            const a = r.int(2, 6);
            const c = a + r.int(1, 4);
            const b = r.int(3, 30);
            const ns: number[] = [];
            for (let n = 2; n <= 200; n++) {
              const T = a * n + b;
              const last = T - c * (n - 1);
              if (last >= 1 && last <= c - 1) ns.push(n);
            }
            if (ns.length !== 1) return null;
            const n = ns[0];
            const T = a * n + b;
            const [item, unit] = r.pick([
              ['귤', '개'],
              ['사탕', '개'],
              ['공책', '권'],
              ['연필', '자루'],
            ]);
            const lo = new F(b + 1, c - a);
            const hi = new F(b + c - 1, c - a);
            return {
              q: `학생들에게 ${item}을 나누어 주려고 합니다. 한 학생에게 $${a}$ ${unit}씩 주면 $${b}$ ${unit === '권' ? '권이' : `${unit}가`} 남고, $${c}$ ${unit}씩 주면 마지막 한 학생은 $1$ ${unit} 이상 $${c}$ ${unit} 미만을 받게 됩니다. 학생 수와 ${item}의 수를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: '학생 수', value: n, unit: '명' }, { label: `${item}`, value: T, unit }] },
              steps: [
                `학생 수를 $x$ 명이라 하면 ${item}은 $(${a}x + ${b})$ ${unit}`,
                `$${c}$ ${unit}씩 $(x - 1)$ 명에게 주고 남은 것이 마지막 학생 몫: $${a}x + ${b} - ${c}(x - 1) = ${linTex(a - c, b + c)}$`,
                `$1 \\le ${linTex(a - c, b + c)} \\le ${c - 1}$`,
                `정리하면 $${lo.tex()} \\le x \\le ${hi.tex()}$`,
                `이를 만족하는 자연수 $x = ${n}$`,
                `학생 $${n}$ 명, ${item} $${a} \\times ${n} + ${b} = ${T}$ ${unit}`,
              ],
              hint: '마지막 학생이 받는 개수를 x 의 식으로 나타내세요.',
            };
          },
          () => ({ q: '학생 $5$ 명에게 $3$ 개씩 주고 $2$ 개가 남았을 때 전체 개수를 구하세요.', answer: { type: 'num', value: 17, unit: '개' }, steps: ['$15 + 2 = 17$'] }),
        );
      },
    },
  ],
};
function lt2(m: number, s: number) {
  return linTex(m, s);
}

// ═══════════════════ m2a-4 연립일차방정식 ═══════════════════
const m2a4: HardSet = {
  skills: [
    {
      id: 'misread-system',
      title: '계수를 잘못 보고 푼 연립방정식',
      gen(r, level): ProblemDraft {
        return retry(
          () => {
            const a = r.nonzero(-5, 5);
            const b = r.nonzero(-5, 5);
            const p = r.nonzero(-4, 4);
            const q = r.nonzero(-4, 4);
            if (a * b - p * q === 0) return null;
            const x0 = r.int(-5, 5);
            const y0 = r.int(-5, 5);
            const e1 = a * x0 + p * y0;
            const e2 = q * x0 + b * y0;
            const x1 = r.nonzero(-6, 6);
            const y1n = e2 - q * x1;
            if (y1n % b !== 0) return null;
            const y1 = y1n / b;
            if (y1 === 0 || Math.abs(y1) > 12 || (x1 === x0 && y1 === y0)) return null;
            const y2 = r.nonzero(-6, 6);
            const x2n = e1 - p * y2;
            if (x2n % a !== 0) return null;
            const x2 = x2n / a;
            if (x2 === 0 || Math.abs(x2) > 12 || (x2 === x0 && y2 === y0)) return null;
            const a2 = new F(e1 - p * y1, x1);
            const b2 = new F(e2 - q * x2, y2);
            if (a2.mul(b).sub(p * q).n === 0 || b2.mul(a).sub(p * q).n === 0) return null;
            const [P1, P2] = r.sample(NAMES, 2);
            const E1 = `ax ${p > 0 ? '+' : '-'} ${Math.abs(p) === 1 ? '' : Math.abs(p)}y = ${e1}`;
            const E2 = `${q === 1 ? '' : q === -1 ? '-' : q}x + by = ${e2}`;
            const S = sys(E1, E2);
            const t1 = `${P1}는 $a$ 를 잘못 보고 풀어서 $x = ${x1}$, $y = ${y1}$ 을 얻었고`;
            const t2 = `${P2}는 $b$ 를 잘못 보고 풀어서 $x = ${x2}$, $y = ${y2}$ 를 얻었습니다`;
            const sa = `${P2}는 $b$ 만 잘못 보았으므로 해가 첫 번째 식을 만족: $${a === 0 ? '' : 'a'} \\times ${fp(x2)} ${p > 0 ? '+' : '-'} ${Math.abs(p)} \\times ${fp(y2)} = ${e1}$ → $a = ${a}$`;
            const sb = `${P1}는 $a$ 만 잘못 보았으므로 해가 두 번째 식을 만족: $${q} \\times ${fp(x1)} + b \\times ${fp(y1)} = ${e2}$ → $b = ${b}$`;
            if (level === 1) {
              return {
                q: `연립방정식 $${S}$ 에서 ${P2}는 $b$ 를 잘못 보고 풀어서 $x = ${x2}$, $y = ${y2}$ 를 얻었습니다. 상수 $a$ 의 값을 구하세요.`,
                answer: { type: 'num', value: a },
                steps: [`$b$ 를 잘못 보아도 첫 번째 식은 바르게 보았으므로 $x = ${x2}$, $y = ${y2}$ 는 첫 번째 식의 해입니다.`, sa],
              };
            }
            if (level === 2) {
              return {
                q: `연립방정식 $${S}$ 를 푸는데 ${t1}, ${t2}. 상수 $a$, $b$ 의 값을 구하세요.`,
                answer: { type: 'fields', fields: [{ label: 'a', value: a }, { label: 'b', value: b }] },
                steps: [sa, sb, `$a = ${a}$, $b = ${b}$`],
                hint: '잘못 보지 않은 식에 그 사람이 얻은 해를 대입하세요.',
              };
            }
            return {
              q: `연립방정식 $${S}$ 를 푸는데 ${t1}, ${t2}. 처음 연립방정식의 해를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'x', value: x0 }, { label: 'y', value: y0 }] },
              steps: [sa, sb, `처음 연립방정식: $${sys(lin2(a, p) + ` = ${e1}`, lin2(q, b) + ` = ${e2}`)}$`, `풀면 $x = ${x0}$, $y = ${y0}$`],
              hint: '잘못 보지 않은 식에 그 사람이 얻은 해를 대입하세요.',
            };
          },
          () => ({ q: '$ax + y = 5$ 의 해가 $x = 2$, $y = 1$ 일 때 $a$ 를 구하세요.', answer: { type: 'num', value: 2 }, steps: ['$2a + 1 = 5$'] }),
        );
      },
    },
  ],
  top: [
    {
      id: 'natural-sol-param',
      title: '해가 모두 자연수가 되는 상수',
      gen(r): ProblemDraft {
        return retry(
          () => {
            const p1 = r.int(1, 3);
            const q1 = r.int(1, 3);
            const p2 = r.nonzero(-3, 3);
            const q2 = r.nonzero(-3, 3);
            const det = p1 * q2 - p2 * q1;
            if (det === 0 || Math.abs(det) === 1) return null;
            const c = r.int(-20, 30);
            if (gcd(gcd(Math.abs(p2), Math.abs(q2)), Math.abs(c)) !== 1) return null;
            const sols: [number, number, number][] = [];
            for (let a = 1; a <= 400; a++) {
              const x = new F(a * q2 - c * q1, det);
              const y = new F(p1 * c - p2 * a, det);
              if (x.isInt() && y.isInt() && x.n >= 1 && y.n >= 1) sols.push([a, x.n, y.n]);
            }
            if (sols.length < 2 || sols.length > 7 || sols[sols.length - 1][0] > 300) return null;
            const ask = r.pick(['count', 'sum', 'max'] as const);
            const ans = ask === 'count' ? sols.length : ask === 'sum' ? sols.reduce((s, v) => s + v[0], 0) : sols[sols.length - 1][0];
            const sg = det < 0 ? -1 : 1;
            const D = Math.abs(det);
            const xT = `\\frac{${linTex(sg * q2, -sg * c * q1, 'a')}}{${D}}`;
            const yT = `\\frac{${linTex(-sg * p2, sg * p1 * c, 'a')}}{${D}}`;
            const askT = ask === 'count' ? '자연수 $a$ 는 모두 몇 개인지' : ask === 'sum' ? '자연수 $a$ 의 값을 모두 더하면 얼마인지' : '자연수 $a$ 중 가장 큰 값을';
            return {
              q: `연립방정식 $${sys(lin2(p1, q1) + ' = a', lin2(p2, q2) + ` = ${c}`)}$ 의 해 $x$, $y$ 가 모두 자연수가 되도록 하는 ${askT} 구하세요.`,
              answer: { type: 'num', value: ans, unit: ask === 'count' ? '개' : undefined },
              steps: [
                `$a$ 를 상수로 보고 가감법으로 풀면 $x = ${xT}$, $y = ${yT}$`,
                `$x \\ge 1$, $y \\ge 1$ 에서 $a$ 의 범위가 정해집니다.`,
                `또 두 분자가 모두 $${D}$ 의 배수여야 합니다.`,
                `조건에 맞는 경우: ${sols.map(([a, x, y]) => `$a = ${a}$ ($x = ${x}$, $y = ${y}$)`).join(', ')}`,
                `답: $${ans}$`,
              ],
              hint: '먼저 x, y 를 a 에 대한 식으로 나타내세요.',
            };
          },
          () => ({ q: '연립방정식 $x + y = 5$, $x - y = 1$ 의 해에서 $x$ 를 구하세요.', answer: { type: 'num', value: 3 }, steps: ['$2x = 6$'] }),
        );
      },
    },
    {
      id: 'three-var',
      title: '미지수가 3개인 연립방정식',
      gen(r): ProblemDraft {
        const [x, y, z] = r.sample([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9], 3);
        const fields = { type: 'fields' as const, fields: [{ label: 'x', value: x }, { label: 'y', value: y }, { label: 'z', value: z }] };
        if (r.chance(0.5)) {
          const A = x + y;
          const B = y + z;
          const C = z + x;
          const S = (A + B + C) / 2;
          return {
            q: `연립방정식 $${sys(`x + y = ${A}`, `y + z = ${B}`, `z + x = ${C}`)}$ 의 해를 구하세요.`,
            answer: fields,
            steps: [`세 식을 모두 더하면 $2(x + y + z) = ${A + B + C}$`, `$x + y + z = ${S}$`, `$z = ${S} - (x + y) = ${S} - ${fp(A)} = ${z}$`, `$x = ${S} - (y + z) = ${S} - ${fp(B)} = ${x}$`, `$y = ${S} - (z + x) = ${S} - ${fp(C)} = ${y}$`],
            hint: '세 식을 모두 더해 보세요.',
          };
        }
        const A = x + 2 * y + 3 * z;
        const B = 2 * x + 3 * y + z;
        const C = 3 * x + y + 2 * z;
        const S = x + y + z;
        return {
          q: `연립방정식 $${sys(`x + 2y + 3z = ${A}`, `2x + 3y + z = ${B}`, `3x + y + 2z = ${C}`)}$ 의 해를 구하세요.`,
          answer: fields,
          steps: [
            `세 식을 모두 더하면 $6(x + y + z) = ${A + B + C}$ 이므로 $x + y + z = ${S}$`,
            `각 식에서 $x + y + z = ${S}$ 를 빼면 $${sys(`y + 2z = ${A - S}`, `x + 2y = ${B - S}`, `2x + z = ${C - S}`)}$`,
            `$x = ${B - S} - 2y$ 를 $2x + z = ${C - S}$ 에 대입: $z = ${C - S - 2 * (B - S)} + 4y$`,
            `$y + 2z = ${A - S}$ 에 대입: $9y = ${A - S - 2 * (C - S - 2 * (B - S))}$, $y = ${y}$`,
            `$x = ${B - S} - 2 \\times ${fp(y)} = ${x}$, $z = ${S} - ${fp(x)} - ${fp(y)} = ${z}$`,
          ],
          hint: '계수가 돌아가며 나타나면 세 식을 모두 더해 보세요.',
        };
      },
    },
  ],
};

// ═══════════════════ m2a-5 일차함수와 그래프 ═══════════════════
const m2a5: HardSet = {
  skills: [
    {
      id: 'range-ab',
      title: '함숫값의 범위로 일차함수 정하기',
      gen(r, level): ProblemDraft {
        const p = r.int(-4, 1);
        const q = p + r.int(2, 5);
        const a = level === 1 ? r.nonzero(-4, 4) : r.int(1, 4);
        const b = r.int(-6, 6);
        const yp = a * p + b;
        const yq = a * q + b;
        const lo = Math.min(yp, yq);
        const hi = Math.max(yp, yq);
        const f = `${linTex(a, b)}`;
        if (level === 1) {
          return {
            q: `$${p} \\le x \\le ${q}$ 일 때, 일차함수 $y = ${f}$ 의 함숫값 중 가장 작은 값과 가장 큰 값을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: '가장 작은 값', value: lo }, { label: '가장 큰 값', value: hi }] },
            steps: [`기울기가 ${a > 0 ? '양수이므로 $x$ 가 커지면 $y$ 도 커집니다' : '음수이므로 $x$ 가 커지면 $y$ 는 작아집니다'}.`, `$x = ${p}$ 일 때 $y = ${yp}$, $x = ${q}$ 일 때 $y = ${yq}$`, `가장 작은 값 $${lo}$, 가장 큰 값 $${hi}$`],
          };
        }
        if (level === 2) {
          return {
            q: `일차함수 $y = ax + b$ ($a > 0$) 에서 $x$ 의 값의 범위가 $${p} \\le x \\le ${q}$ 일 때 $y$ 의 값의 범위는 $${lo} \\le y \\le ${hi}$ 입니다. 상수 $a$, $b$ 의 값을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'a', value: a }, { label: 'b', value: b }] },
            steps: [`$a > 0$ 이므로 $x = ${p}$ 일 때 $y = ${lo}$, $x = ${q}$ 일 때 $y = ${hi}$`, `$${sys(`${fp(p)}a + b = ${lo}`, `${q}a + b = ${hi}`)}$`, `빼면 $${q - p}a = ${hi - lo}$, $a = ${a}$, $b = ${b}$`],
          };
        }
        const s1 = a + b;
        const a2 = -a;
        const b2 = hi - a2 * p;
        const s2 = a2 + b2;
        if (s1 === s2) return this.gen(r, level);
        return {
          q: `일차함수 $y = ax + b$ 에서 $x$ 의 값의 범위가 $${p} \\le x \\le ${q}$ 일 때 $y$ 의 값의 범위는 $${lo} \\le y \\le ${hi}$ 입니다. $a + b$ 의 값이 될 수 있는 수를 모두 구하세요. (단, $a$, $b$ 는 상수)`,
          answer: { type: 'set', values: [s1, s2] },
          steps: [
            `① $a > 0$ 일 때: $x = ${p}$ 에서 $y = ${lo}$, $x = ${q}$ 에서 $y = ${hi}$`,
            `$${q - p}a = ${hi - lo}$ 이므로 $a = ${a}$, $b = ${b}$ → $a + b = ${s1}$`,
            `② $a < 0$ 일 때: $x = ${p}$ 에서 $y = ${hi}$, $x = ${q}$ 에서 $y = ${lo}$`,
            `$${q - p}a = ${lo - hi}$ 이므로 $a = ${a2}$, $b = ${b2}$ → $a + b = ${s2}$`,
            `답: $${s1}$, $${s2}$`,
          ],
          hint: '기울기의 부호에 따라 두 경우로 나누세요.',
        };
      },
    },
  ],
  top: [
    {
      id: 'collinear-k',
      title: '세 점이 한 직선 위에 있을 조건',
      gen(r): ProblemDraft {
        return retry(
          () => {
            const s = r.nonzero(-3, 3);
            const t = r.int(-6, 6);
            const [x1, x2, x3] = r.sample([-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6], 3).sort((u, v) => u - v);
            const mm = r.pick([2, 3, -1, -2]);
            const k = s * x2 + t;
            const y1 = s * x1 + t;
            const c = s * x3 + t - mm * k;
            const coef = x3 - x2 - (mm - 1) * (x2 - x1);
            if (coef === 0 || k === 0) return null;
            const rhs = c * (x2 - x1) + y1 * (x3 - x2);
            if (rhs !== coef * k) return null;
            const Cy = linTex(mm, c, 'k');
            const xi = new F(-t, s);
            const askX = r.chance(0.5);
            return {
              q: `세 점 A$(${x1}, ${y1})$, B$(${x2}, k)$, C$(${x3}, ${Cy})$ 가 한 직선 위에 있을 때, 상수 $k$ 의 값과 이 직선의 ${askX ? '$x$ 절편' : '$y$ 절편'}을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'k', value: k }, { label: askX ? 'x 절편' : 'y 절편', value: askX ? xi.value : t, display: 'frac' }] },
              steps: [
                `세 점이 한 직선 위에 있으면 (AB 의 기울기) = (BC 의 기울기)`,
                `$\\frac{k - ${fp(y1)}}{${x2} - ${fp(x1)}} = \\frac{(${Cy}) - k}{${x3} - ${fp(x2)}}$`,
                `$${x3 - x2 === 1 ? '' : x3 - x2}(${linTex(1, -y1, 'k')}) = ${x2 - x1 === 1 ? '' : x2 - x1}(${linTex(mm - 1, c, 'k')})$ 에서 $${coef === 1 ? '' : coef === -1 ? '-' : coef}k = ${rhs}$, $k = ${k}$`,
                `기울기: $\\frac{${k} - ${fp(y1)}}{${x2 - x1}} = ${s}$ 이므로 $y = ${s === 1 ? '' : s === -1 ? '-' : s}x + b$ 에 A 를 대입하면 $b = ${t}$`,
                askX ? `직선 $y = ${linTex(s, t)}$ 의 $x$ 절편: $0 = ${linTex(s, t)}$ 에서 $x = ${xi.tex()}$` : `직선 $y = ${linTex(s, t)}$ 의 $y$ 절편: $${t}$`,
              ],
              hint: '어느 두 점을 골라도 기울기가 같아야 해요.',
            };
          },
          () => ({ q: '두 점 $(0, 1)$, $(1, 3)$ 을 지나는 직선의 기울기를 구하세요.', answer: { type: 'num', value: 2 }, steps: ['$\\frac{3 - 1}{1 - 0} = 2$'] }),
        );
      },
    },
    {
      id: 'moving-point',
      title: '움직이는 점과 넓이의 일차함수',
      gen(r): ProblemDraft {
        return retry(
          () => {
            const h = r.int(4, 12);
            const w = r.int(6, 20);
            const v = r.int(1, 3);
            const ratio = r.chance(0.5);
            const sq = `${h * w}`;
            if (!ratio) {
              const x0 = r.int(1, Math.floor((w - 1) / v));
              if (v * x0 >= w) return null;
              const S = new F(2 * h * w - h * v * x0, 2);
              return {
                q: `$\\overline{AB} = ${h}$ cm, $\\overline{BC} = ${w}$ cm 인 직사각형 ABCD 에서 점 P 가 꼭짓점 B 를 출발하여 변 BC 위를 따라 점 C 까지 매초 $${v}$ cm 의 속력으로 움직입니다. 사각형 APCD 의 넓이가 $${S.tex()}$ cm$^2$ 일 때는 점 P 가 출발한 지 몇 초 후인지 구하세요.`,
                answer: { type: 'num', value: x0, unit: '초' },
                steps: [
                  `$x$ 초 후 $\\overline{BP} = ${v === 1 ? '' : v}x$ cm`,
                  `(사각형 APCD) = (직사각형) $-$ $\\triangle ABP$ $= ${sq} - \\frac{1}{2} \\times ${h} \\times ${v === 1 ? '' : v}x$`,
                  `$y = ${linTex(new F(-h * v, 2), h * w)}$ ($0 \\le x \\le ${new F(w, v).tex()}$)`,
                  `$${S.tex()} = ${linTex(new F(-h * v, 2), h * w)}$ 에서 $${new F(h * v, 2).tex()}x = ${new F(h * w * 2 - 2 * S.value, 2).tex()}$`,
                  `$x = ${x0}$ 초`,
                ],
                hint: '전체 넓이에서 잘려 나간 삼각형을 빼세요.',
              };
            }
            const kk = r.int(2, 5);
            const x0 = new F(2 * w, v * (kk + 1));
            if (!x0.isInt() || x0.value * v >= w) return null;
            return {
              q: `$\\overline{AB} = ${h}$ cm, $\\overline{BC} = ${w}$ cm 인 직사각형 ABCD 에서 점 P 가 꼭짓점 B 를 출발하여 변 BC 위를 따라 점 C 까지 매초 $${v}$ cm 의 속력으로 움직입니다. 사각형 APCD 의 넓이가 삼각형 ABP 의 넓이의 $${kk}$ 배가 되는 것은 점 P 가 출발한 지 몇 초 후인지 구하세요.`,
              answer: { type: 'num', value: x0.value, unit: '초' },
              steps: [
                `$x$ 초 후 $\\overline{BP} = ${v === 1 ? '' : v}x$ cm`,
                `$\\triangle ABP = \\frac{1}{2} \\times ${h} \\times ${v === 1 ? '' : v}x = ${linTex(new F(h * v, 2), 0)}$`,
                `(사각형 APCD) $= ${sq} - ${linTex(new F(h * v, 2), 0)}$`,
                `$${sq} - ${linTex(new F(h * v, 2), 0)} = ${kk} \\times ${linTex(new F(h * v, 2), 0)}$ 에서 $${linTex(new F(h * v * (kk + 1), 2), 0)} = ${sq}$`,
                `$x = ${x0.tex()}$ 초 (이때 $\\overline{BP} = ${x0.value * v}$ cm $< ${w}$ cm 이므로 조건에 맞음)`,
              ],
              hint: '두 넓이를 각각 x 의 일차식으로 나타내세요.',
            };
          },
          () => ({ q: '가로 $4$ cm, 세로 $3$ cm 인 직사각형의 넓이를 구하세요.', answer: { type: 'num', value: 12 }, steps: ['$12$'] }),
        );
      },
    },
  ],
};

// ═══════════════════ m2a-6 일차함수와 일차방정식의 관계 ═══════════════════
const m2a6: HardSet = {
  skills: [
    {
      id: 'segment-meet',
      title: '직선이 선분과 만나는 조건',
      gen(r, level): ProblemDraft {
        return retry(
          () => {
            const A: [number, number] = [r.int(1, 6), r.int(-3, 8)];
            const B: [number, number] = [r.int(1, 6), r.int(-3, 8)];
            if (A[0] === B[0] && A[1] === B[1]) return null;
            const fl = (u: F, w: F) => {
              const [lo, hi] = u.cmp(w) <= 0 ? [u, w] : [w, u];
              return { type: 'fields' as const, fields: [{ label: '최솟값', value: lo.value, display: 'frac' as const }, { label: '최댓값', value: hi.value, display: 'frac' as const }] };
            };
            const pts = `두 점 A$(${A[0]}, ${A[1]})$, B$(${B[0]}, ${B[1]})$`;
            if (level <= 2) {
              const b0 = level === 1 ? 0 : r.nonzero(-4, 4);
              const sA = new F(A[1] - b0, A[0]);
              const sB = new F(B[1] - b0, B[0]);
              if (sA.eq(sB)) return null;
              const ln = `y = ax${b0 === 0 ? '' : b0 > 0 ? ` + ${b0}` : ` - ${-b0}`}`;
              const [lo, hi] = sA.cmp(sB) <= 0 ? [sA, sB] : [sB, sA];
              return {
                q: `일차함수 $${ln}$ 의 그래프가 ${pts} 를 잇는 선분 AB 와 만나도록 하는 상수 $a$ 의 값 중 가장 작은 값과 가장 큰 값을 구하세요.`,
                answer: fl(sA, sB),
                steps: [
                  `직선 $${ln}$ 는 $a$ 에 관계없이 점 $(0, ${b0})$ 을 지납니다.`,
                  `점 A 를 지날 때: $${A[1]} = ${A[0]}a${b0 === 0 ? '' : b0 > 0 ? ` + ${b0}` : ` - ${-b0}`}$, $a = ${sA.tex()}$`,
                  `점 B 를 지날 때: $${B[1]} = ${B[0]}a${b0 === 0 ? '' : b0 > 0 ? ` + ${b0}` : ` - ${-b0}`}$, $a = ${sB.tex()}$`,
                  `직선을 점 $(0, ${b0})$ 을 중심으로 돌려 보면 선분과 만나는 범위는 $${lo.tex()} \\le a \\le ${hi.tex()}$`,
                ],
                hint: '직선이 늘 지나는 한 점을 찾고, 선분의 양 끝을 지날 때를 생각하세요.',
              };
            }
            const m = r.nonzero(-3, 3);
            const bA = new F(A[1] - m * A[0]);
            const bB = new F(B[1] - m * B[0]);
            if (bA.eq(bB)) return null;
            const [lo, hi] = bA.cmp(bB) <= 0 ? [bA, bB] : [bB, bA];
            const ln = `y = ${m === 1 ? '' : m === -1 ? '-' : m}x + b`;
            return {
              q: `일차함수 $${ln}$ 의 그래프가 ${pts} 를 잇는 선분 AB 와 만나도록 하는 상수 $b$ 의 값 중 가장 작은 값과 가장 큰 값을 구하세요.`,
              answer: fl(bA, bB),
              steps: [
                `$b$ 가 변하면 기울기가 $${m}$ 인 직선이 위아래로 평행이동합니다.`,
                `점 A 를 지날 때: $${A[1]} = ${m} \\times ${A[0]} + b$, $b = ${bA.tex()}$`,
                `점 B 를 지날 때: $${B[1]} = ${m} \\times ${B[0]} + b$, $b = ${bB.tex()}$`,
                `두 경우 사이에서 선분과 만나므로 $${lo.tex()} \\le b \\le ${hi.tex()}$`,
              ],
            };
          },
          () => ({ q: '직선 $y = ax$ 가 점 $(1, 2)$ 를 지날 때 $a$ 를 구하세요.', answer: { type: 'num', value: 2 }, steps: ['$a = 2$'] }),
        );
      },
    },
  ],
  top: [
    {
      id: 'no-triangle',
      title: '세 직선이 삼각형을 만들지 않는 조건',
      gen(r): ProblemDraft {
        return retry(
          () => {
            const m1 = r.nonzero(-3, 3);
            const m2 = r.nonzero(-3, 3);
            if (m1 === m2) return null;
            const px = r.nonzero(-4, 4);
            const py = r.int(-5, 5);
            const c1 = py - m1 * px;
            const c2 = py - m2 * px;
            const c3 = r.int(-6, 6);
            if ((py - c3) % px !== 0) return null;
            const a3 = (py - c3) / px;
            if (a3 === m1 || a3 === m2 || c3 === c1 || c3 === c2) return null;
            const L1 = `${lin2(m1, -1, c1)} = 0`;
            const L2 = `${lin2(m2, -1, c2)} = 0`;
            const L3 = `ax - y ${c3 === 0 ? '' : c3 > 0 ? `+ ${c3}` : `- ${-c3}`} = 0`;
            const vals = [m1, m2, a3].sort((u, v) => u - v);
            return {
              q: `세 직선 $${L1}$, $${L2}$, $${L3}$ 가 삼각형을 만들지 않도록 하는 상수 $a$ 의 값을 모두 구하세요.`,
              answer: { type: 'set', values: vals },
              steps: [
                `세 직선을 $y$ 에 대하여 풀면 $y = ${linTex(m1, c1)}$, $y = ${linTex(m2, c2)}$, $y = ax ${c3 === 0 ? '' : c3 > 0 ? `+ ${c3}` : `- ${-c3}`}$`,
                `세 직선이 삼각형을 만들지 않는 경우는 ① 두 직선이 평행할 때, ② 세 직선이 한 점에서 만날 때입니다.`,
                `① 세 번째 직선이 첫째 직선과 평행: $a = ${m1}$, 둘째 직선과 평행: $a = ${m2}$`,
                `② 앞의 두 직선의 교점: $${linTex(m1, c1)} = ${linTex(m2, c2)}$ 에서 $x = ${px}$, $y = ${py}$`,
                `세 번째 직선이 $(${px}, ${py})$ 를 지나면 $${py} = ${px}a ${c3 === 0 ? '' : c3 > 0 ? `+ ${c3}` : `- ${-c3}`}$, $a = ${a3}$`,
                `답: $a = ${vals.join(', ')}$`,
              ],
              hint: '평행한 경우와 한 점에서 만나는 경우를 모두 생각하세요.',
            };
          },
          () => ({ q: '두 직선 $y = 2x + 1$, $y = ax - 3$ 이 평행할 때 $a$ 를 구하세요.', answer: { type: 'num', value: 2 }, steps: ['기울기가 같아야 하므로 $a = 2$'] }),
        );
      },
    },
    {
      id: 'area-bisect',
      title: '삼각형의 넓이를 이등분하는 직선',
      gen(r): ProblemDraft {
        return retry(
          () => {
            const b1 = r.int(-6, 2);
            const p = b1 + r.int(1, 4);
            const c1 = p + r.int(1, 5);
            const m1 = r.int(1, 3);
            const q = m1 * (p - b1);
            if (q % (c1 - p) !== 0) return null;
            const m2 = -q / (c1 - p);
            const Mx = new F(b1 + c1, 2);
            if (Mx.eq(p)) return null;
            const slope = new F(q).div(new F(p).sub(Mx));
            const icpt = new F(q).sub(slope.mul(p));
            const L1 = `y = ${linTex(m1, -m1 * b1)}`;
            const L2 = `y = ${linTex(m2, -m2 * c1)}`;
            return {
              q: `두 직선 $${L1}$, $${L2}$ 와 $x$ 축으로 둘러싸인 삼각형이 있습니다. 두 직선의 교점을 지나면서 이 삼각형의 넓이를 이등분하는 직선의 방정식을 $y = mx + n$ 이라 할 때, 상수 $m$, $n$ 의 값을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'm', value: slope.value, display: 'frac' }, { label: 'n', value: icpt.value, display: 'frac' }] },
              steps: [
                `두 직선의 교점: $${linTex(m1, -m1 * b1)} = ${linTex(m2, -m2 * c1)}$ 에서 A$(${p}, ${q})$`,
                `$x$ 절편: B$(${b1}, 0)$, C$(${c1}, 0)$`,
                `꼭짓점 A 를 지나며 넓이를 이등분하려면 밑변 BC 를 이등분해야 하므로 BC 의 중점 M$(${Mx.tex()}, 0)$ 을 지나야 합니다. (높이가 같고 밑변이 같음)`,
                `기울기: $m = \\frac{${q} - 0}{${p} - ${Mx.value < 0 ? `\\left(${Mx.tex()}\\right)` : Mx.tex()}} = ${slope.tex()}$`,
                `A 를 대입: $${q} = ${slope.tex()} \\times ${fp(p)} + n$, $n = ${icpt.tex()}$`,
                `답: $m = ${slope.tex()}$, $n = ${icpt.tex()}$`,
              ],
              hint: '삼각형의 꼭짓점과 마주 보는 변의 중점을 이은 선분은 넓이를 이등분해요.',
            };
          },
          () => ({ q: '삼각형의 한 꼭짓점과 대변의 중점을 잇는 선분이 넓이를 몇 등분하는지 구하세요.', answer: { type: 'num', value: 2 }, steps: ['이등분'] }),
        );
      },
    },
  ],
};

export const hard2: Record<string, HardSet> = {
  'm2a-1': m2a1,
  'm2a-2': m2a2,
  'm2a-3': m2a3,
  'm2a-4': m2a4,
  'm2a-5': m2a5,
  'm2a-6': m2a6,
};
