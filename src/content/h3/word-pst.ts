// 확률과 통계 활용(문장제) 유형 — pst.ts 의 각 단원 skills 뒤에 덧붙임
import type { Skill } from '../../core/types';
import { F } from '../../core/frac';
import { nCr, nPr, round } from '../../core/nt';
import { comma, dec } from '../../core/tex';
import { NAMES, Ctex, Ptex, ZTAB, zKey, zTable, dAns, fAns, fChoices } from './util';

const fr = (n: number, d: number) => new F(n, d);
const T = (f: F) => f.tex();
const binomP = (n: number, k: number, p: F) => new F(nCr(n, k)).mul(p.pow(k)).mul(new F(1).sub(p).pow(n - k));
/** 받침 유무로 조사 고르기 */
const josa = (w: string, b: string, nb: string) => ((w.charCodeAt(w.length - 1) - 0xac00) % 28 ? b : nb);
const pct = (f: F) => dec(round(f.value * 100, 4));

/** 이항분포 정규근사 상황 (n, p, 평균, 표준편차) */
type Ctx = { n: number; p: F; m: number; s: number };
const APPROX: Ctx[] = [
  { n: 100, p: fr(4, 5), m: 80, s: 4 },
  { n: 400, p: fr(4, 5), m: 320, s: 8 },
  { n: 625, p: fr(4, 5), m: 500, s: 10 },
  { n: 100, p: fr(9, 10), m: 90, s: 3 },
  { n: 400, p: fr(9, 10), m: 360, s: 6 },
  { n: 900, p: fr(9, 10), m: 810, s: 9 },
  { n: 100, p: fr(1, 10), m: 10, s: 3 },
  { n: 400, p: fr(1, 10), m: 40, s: 6 },
  { n: 900, p: fr(1, 10), m: 90, s: 9 },
  { n: 100, p: fr(1, 5), m: 20, s: 4 },
  { n: 400, p: fr(1, 5), m: 80, s: 8 },
  { n: 100, p: fr(1, 2), m: 50, s: 5 },
  { n: 400, p: fr(1, 2), m: 200, s: 10 },
  { n: 900, p: fr(1, 2), m: 450, s: 15 },
];
function approxIntro(c: Ctx): string {
  const P = pct(c.p);
  if (c.p.value >= 0.8) return `발아율이 $${P}\\%$ 인 씨앗 $${c.n}$ 개를 심을 때 싹이 트는 씨앗의 수를 $X$ 라 하자.`;
  if (c.p.value <= 0.2) return `불량률이 $${P}\\%$ 인 공정에서 생산한 제품 $${c.n}$ 개 중 불량품의 수를 $X$ 라 하자.`;
  return `어느 도시 시민의 $50\\%$ 가 찬성하는 정책에 대해 시민 $${c.n}$ 명을 임의로 뽑아 조사할 때 찬성하는 사람의 수를 $X$ 라 하자.`;
}

export const PST_WORD: Record<string, Skill[]> = {
  'pst-3': [
    {
      id: 'prob-word',
      title: '확률의 활용',
      gen(r, level) {
        if (level === 1) {
          const n = r.int(8, 15),
            k = r.int(2, 4);
          const none = fr(nCr(n - k, 2), nCr(n, 2));
          const ans = new F(1).sub(none);
          return {
            q: `상자 안에 경품 추첨권 $${n}$ 장이 들어 있고, 그중 $${k}$ 장이 당첨권입니다. 이 상자에서 추첨권 $2$ 장을 동시에 꺼낼 때, 적어도 한 장이 당첨권일 확률을 구하세요.`,
            answer: fAns(ans),
            steps: [`여사건: 두 장 모두 당첨권이 아닐 확률 $\\frac{${Ctex(n - k, 2)}}{${Ctex(n, 2)}}=\\frac{${nCr(n - k, 2)}}{${nCr(n, 2)}}${none.d === nCr(n, 2) ? '' : `=${T(none)}`}$`, `$1-${T(none)}=${T(ans)}$`],
          };
        }
        if (level === 2) {
          const n = r.int(3, 4),
            m = r.int(n + 1, 6);
          const ans = fr(nPr(m, n), m ** n);
          return {
            q: `$1$ 층에서 엘리베이터에 탄 $${n}$ 명이 $2$ 층부터 $${m + 1}$ 층까지의 $${m}$ 개 층 중 한 층에서 각각 임의로 내립니다. $${n}$ 명이 모두 서로 다른 층에서 내릴 확률을 구하세요.`,
            answer: fAns(ans),
            steps: [`전체 경우: 각자 $${m}$ 개 층 중 하나 → $${m}^{${n}}=${m ** n}$`, `모두 다른 층: $${Ptex(m, n)}=${nPr(m, n)}$`, `$\\frac{${nPr(m, n)}}{${m ** n}}=${T(ans)}$`],
          };
        }
        const n = r.int(3, 5);
        if (r.chance(0.5)) {
          const ans = fr(3 * (2 ** n - 2), 3 ** n);
          return {
            q: `$${n}$ 명이 가위바위보를 한 번 할 때, 승부가 결정될(비기지 않을) 확률을 구하세요.`,
            answer: fAns(ans),
            steps: [`전체 경우 $3^{${n}}=${3 ** n}$`, `승부가 나려면 정확히 두 종류의 손 모양만 나와야 함: 두 종류 고르기 $3$ 가지 $\\times$ (그 두 종류로 낼 때 한 종류만 나오는 경우 제외) $2^{${n}}-2$`, `$\\frac{3\\times${2 ** n - 2}}{${3 ** n}}=${T(ans)}$`],
          };
        }
        const ans = fr(3 * n, 3 ** n);
        return {
          q: `$${n}$ 명이 가위바위보를 한 번 할 때, 단 한 명만 이길 확률을 구하세요.`,
          answer: fAns(ans),
          steps: [`전체 경우 $3^{${n}}=${3 ** n}$`, `이길 한 명 고르기 $${n}$ 가지, 그 사람이 낼 손 모양 $3$ 가지 (나머지는 모두 지는 손 모양으로 정해짐)`, `$\\frac{${n}\\times3}{${3 ** n}}=${T(ans)}$`],
        };
      },
    },
  ],

  'pst-4': [
    {
      id: 'bayes-word',
      title: '조건부확률의 활용 (검사·불량품)',
      gen(r, level) {
        if (level <= 2) {
          const p = r.pick([1, 2, 4, 5, 10, 20]);
          const a = r.pick([80, 90, 95, 98]);
          const b = r.pick([2, 4, 5, 10]);
          const pos = fr(p * a + (100 - p) * b, 10000);
          const head = `어느 지역 주민의 $${p}\\%$ 가 어떤 질병에 걸려 있습니다. 이 질병의 검사에서 질병에 걸린 사람은 $${a}\\%$ 의 확률로 양성, 걸리지 않은 사람은 $${b}\\%$ 의 확률로 양성 판정을 받습니다.`;
          const st = [`$P(\\text{질병}\\cap\\text{양성})=${dec(p / 100)}\\times${dec(a / 100)}=${dec(round((p * a) / 10000, 6))}$`, `$P(\\text{질병 아님}\\cap\\text{양성})=${dec((100 - p) / 100)}\\times${dec(b / 100)}=${dec(round(((100 - p) * b) / 10000, 6))}$`];
          if (level === 1) {
            return {
              q: `${head} 이 지역 주민 한 명을 임의로 택해 검사할 때, 양성 판정을 받을 확률을 구하세요.`,
              answer: fAns(pos),
              steps: [...st, `$P(\\text{양성})=${dec(round(pos.value, 6))}=${T(pos)}$`],
            };
          }
          const ans = fr(p * a, p * a + (100 - p) * b);
          return {
            q: `${head} 이 지역 주민 한 명을 임의로 택해 검사했더니 양성 판정을 받았을 때, 이 사람이 실제로 질병에 걸렸을 확률은?`,
            answer: fChoices(r, ans, [fr(a, 100), fr(p * a, 10000), fr(p, 100), fr((100 - p) * b, p * a + (100 - p) * b), pos]),
            steps: [...st, `$P(\\text{질병}\\mid\\text{양성})=\\frac{${dec(round((p * a) / 10000, 6))}}{${dec(round(pos.value, 6))}}=${T(ans)}$`],
          };
        }
        const shares = r.pick([
          [50, 30, 20],
          [40, 35, 25],
          [60, 40],
          [70, 30],
          [45, 55],
        ]);
        const defs = shares.map(() => r.int(1, 5));
        const names = ['A', 'B', 'C'].slice(0, shares.length);
        const k = r.int(0, shares.length - 1);
        const parts = shares.map((s, i) => s * defs[i]);
        const tot = parts.reduce((x, y) => x + y, 0);
        const ans = fr(parts[k], tot);
        return {
          q: `어느 회사는 ${names.map((n, i) => `공장 ${n} 에서 전체 제품의 $${shares[i]}\\%$`).join(', ')}를 생산하고, 각 공장의 불량률은 ${names.map((n, i) => `${n}: $${defs[i]}\\%$`).join(', ')} 입니다. 이 회사 제품 중 임의로 택한 하나가 불량품이었을 때, 이 제품이 공장 ${names[k]} 에서 생산되었을 확률을 구하세요.`,
          answer: fAns(ans),
          steps: [
            `불량품일 확률: $${shares.map((sh, i) => `${dec(sh / 100)}\\times${dec(defs[i] / 100)}`).join('+')}=${dec(round(tot / 10000, 6))}$`,
            `공장 ${names[k]} 이면서 불량: $${dec(round(parts[k] / 10000, 6))}$`,
            `$\\frac{${dec(round(parts[k] / 10000, 6))}}{${dec(round(tot / 10000, 6))}}=\\frac{${parts[k]}}{${tot}}=${T(ans)}$`,
          ],
        };
      },
    },
    {
      id: 'trial-word',
      title: '독립시행의 활용 (경기·이동)',
      gen(r, level) {
        const who = r.pick(NAMES);
        if (level <= 2) {
          const p = r.pick([fr(1, 2), fr(1, 3), fr(2, 3), fr(2, 5), fr(3, 5), fr(3, 4)]);
          const q = new F(1).sub(p);
          const game = r.pick(['탁구', '배드민턴', '바둑', '체스']);
          if (level === 1) {
            const ans = binomP(3, 2, p).add(p.pow(3));
            return {
              q: `${who}가 ${game} 한 판을 이길 확률은 $${T(p)}$ 입니다. 세 판을 할 때 ${who}가 두 판 이상 이길 확률을 구하세요. (각 판은 독립)`,
              answer: fAns(ans),
              steps: [`두 판 이김: $${Ctex(3, 2)}\\left(${T(p)}\\right)^{2}\\left(${T(q)}\\right)=${T(binomP(3, 2, p))}$`, `세 판 이김: $\\left(${T(p)}\\right)^{3}=${T(p.pow(3))}$`, `합: $${T(ans)}$`],
            };
          }
          if (r.chance(0.5)) {
            const ans = p.pow(3).add(binomP(3, 2, p).mul(p)).add(binomP(4, 2, p).mul(p));
            return {
              q: `${who}가 ${game} 한 판을 이길 확률은 $${T(p)}$ 입니다. 먼저 세 판을 이기면 우승하는 경기(5판 3선승제)에서 ${who}가 우승할 확률은? (비기는 경우는 없고, 각 판은 독립)`,
              answer: fChoices(r, ans, [p.pow(3), binomP(5, 3, p), binomP(5, 3, p).add(binomP(5, 4, p)), p.pow(3).add(binomP(3, 2, p).mul(p))]),
              steps: [
                `3판 만에: $\\left(${T(p)}\\right)^{3}=${T(p.pow(3))}$`,
                `4판 만에 (앞의 3판 중 2승): $${Ctex(3, 2)}\\left(${T(p)}\\right)^{2}\\left(${T(q)}\\right)\\times${T(p)}=${T(binomP(3, 2, p).mul(p))}$`,
                `5판 만에 (앞의 4판 중 2승): $${Ctex(4, 2)}\\left(${T(p)}\\right)^{2}\\left(${T(q)}\\right)^{2}\\times${T(p)}=${T(binomP(4, 2, p).mul(p))}$`,
                `합: $${T(ans)}$`,
              ],
            };
          }
          const ans = binomP(3, 2, p).mul(p);
          return {
            q: `${who}가 ${game} 한 판을 이길 확률은 $${T(p)}$ 입니다. 먼저 세 판을 이기면 우승하는 경기(5판 3선승제)에서 ${who}가 네 번째 판에서 우승을 확정할 확률은? (비기는 경우는 없고, 각 판은 독립)`,
            answer: fChoices(r, ans, [binomP(4, 3, p), p.pow(3).mul(q), binomP(3, 2, p), binomP(4, 3, p).mul(p)]),
            steps: [`앞의 세 판에서 2승 1패: $${Ctex(3, 2)}\\left(${T(p)}\\right)^{2}\\left(${T(q)}\\right)$`, `네 번째 판 승리: $\\times${T(p)}$`, `$=${T(ans)}$`],
          };
        }
        let a: number, b: number, n: number, h: number;
        a = r.int(1, 3);
        b = r.int(1, 2);
        if (a === b) a = b + 1;
        n = r.int(4, 7);
        h = r.int(1, n - 1);
        const k = a * h - b * (n - h);
        const coin = r.chance(0.5);
        const p = coin ? fr(1, 2) : fr(1, 3);
        const ans = binomP(n, h, p);
        return {
          q: `수직선의 원점에 점 P 가 있습니다. ${coin ? '동전 한 개를 던져 앞면이 나오면' : '주사위 한 개를 던져 3의 배수의 눈이 나오면'} 점 P 를 양의 방향으로 $${a}$ 만큼, ${coin ? '뒷면이 나오면' : '그 외의 눈이 나오면'} 음의 방향으로 $${b}$ 만큼 옮깁니다. 이 시행을 $${n}$ 번 반복한 뒤 점 P 의 좌표가 $${k}$ 일 확률을 구하세요.`,
          answer: fAns(ans),
          steps: [
            `${coin ? '앞면이' : '3의 배수의 눈이'} $x$ 번 나오면 좌표는 $${a === 1 ? '' : a}x-${b === 1 ? '' : b}(${n}-x)=${a + b}x-${b * n}$`,
            `$${a + b}x-${b * n}=${k}$ → $x=${h}$`,
            `$${Ctex(n, h)}\\left(${T(p)}\\right)^{${h}}\\left(${T(new F(1).sub(p))}\\right)^{${n - h}}=${T(ans)}$`,
          ],
        };
      },
    },
  ],

  'pst-5': [
    {
      id: 'expect-word',
      title: '기댓값의 활용 (게임·상금)',
      gen(r, level) {
        if (level === 1) {
          if (r.chance(0.5)) {
            const a = r.pick([600, 1200, 1800, 3000]),
              b = r.pick([300, 600, 900]);
            const E = (a + 2 * b) / 6;
            return {
              q: `주사위 한 개를 던져 $6$ 의 눈이 나오면 $${comma(a)}$ 원, $2$ 또는 $4$ 의 눈이 나오면 $${b}$ 원을 받고, 홀수의 눈이 나오면 받지 못하는 게임이 있습니다. 이 게임을 한 번 할 때 받는 금액의 기댓값을 구하세요.`,
              answer: { type: 'num', value: E, unit: '원' },
              steps: [`$${comma(a)}\\times\\frac{1}{6}+${b}\\times\\frac{2}{6}+0\\times\\frac{3}{6}$`, `$=${a / 6}+${b / 3}=${E}$ (원)`],
            };
          }
          const a = r.pick([400, 800, 1200, 2000]),
            b = r.pick([100, 200, 300, 500]);
          const E = a / 4 + b / 2;
          return {
            q: `동전 두 개를 동시에 던져 두 개 모두 앞면이면 $${comma(a)}$ 원, 한 개만 앞면이면 $${b}$ 원을 받고, 모두 뒷면이면 받지 못하는 게임이 있습니다. 이 게임을 한 번 할 때 받는 금액의 기댓값을 구하세요.`,
            answer: { type: 'num', value: E, unit: '원' },
            steps: [`$P(\\text{2개 앞면})=\\frac{1}{4}$, $P(\\text{1개 앞면})=\\frac{2}{4}$`, `$${comma(a)}\\times\\frac{1}{4}+${b}\\times\\frac{1}{2}=${E}$ (원)`],
          };
        }
        if (level === 2) {
          const c = r.pick([500, 1000, 1500, 2000]);
          const y = r.pick([600, 1200, 1800]);
          const x = 6 * c - y;
          return {
            q: `참가비 $${comma(c)}$ 원을 내고 주사위 두 개를 동시에 던져, 두 눈이 같으면 $x$ 원, 두 눈의 합이 $7$ 이면 $${comma(y)}$ 원을 받고, 그 밖의 경우에는 받지 못하는 게임이 있습니다. 받는 금액의 기댓값이 참가비와 같도록 하는 $x$ 의 값을 구하세요.`,
            answer: { type: 'num', value: x, unit: '원' },
            steps: [`두 눈이 같을 확률 $\\frac{6}{36}=\\frac{1}{6}$, 합이 $7$ 일 확률 $\\frac{6}{36}=\\frac{1}{6}$`, `$\\frac{1}{6}x+\\frac{1}{6}\\times${comma(y)}=${comma(c)}$`, `$x=${comma(6 * c)}-${comma(y)}=${comma(x)}$ (원)`],
          };
        }
        const w = r.int(2, 5),
          b = r.int(2, 5);
        const N = w + b;
        const tot = nCr(N, 3);
        const probs = [0, 1, 2, 3].map((k) => fr(nCr(w, k) * nCr(b, 3 - k), tot));
        const E = probs.reduce((s, p, k) => s.add(p.mul(k)), new F(0));
        const prize = r.pick([500, 1000, 2000]);
        const EY = E.mul(prize);
        return {
          q: `흰 공 $${w}$ 개와 검은 공 $${b}$ 개가 들어 있는 상자에서 공 $3$ 개를 동시에 꺼내, 꺼낸 흰 공 한 개마다 $${comma(prize)}$ 원을 받는 게임이 있습니다. 이 게임에서 받는 금액의 기댓값을 구하세요.`,
          answer: fAns(EY, '원'),
          steps: [
            `흰 공의 개수를 $X$ 라 하면 $P(X=k)=\\frac{${Ctex(w, 'k')}\\times${Ctex(b, '3-k')}}{${Ctex(N, 3)}}$`,
            `$E(X)=${[1, 2, 3].filter((k) => k <= w).map((k) => `${k}\\times${T(probs[k])}`).join('+')}=${T(E)}$`,
            `받는 금액 $${comma(prize)}X$ 의 기댓값: $${comma(prize)}\\times${T(E)}=${T(EY)}$ (원)`,
          ],
        };
      },
    },
    {
      id: 'binom-word',
      title: '이항분포의 활용',
      gen(r, level) {
        if (level === 1) {
          const P = r.pick([60, 70, 80, 90]);
          const n = r.pick([50, 100, 200, 300]);
          const E = (n * P) / 100,
            V = round((n * P * (100 - P)) / 10000, 4);
          return {
            q: `발아율이 $${P}\\%$ 인 씨앗 $${n}$ 개를 심을 때 싹이 트는 씨앗의 수를 $X$ 라 합니다. $X$ 의 평균과 분산을 구하세요.`,
            answer: {
              type: 'fields',
              fields: [
                { label: 'E(X)', value: E },
                { label: 'V(X)', value: V },
              ],
            },
            steps: [`$X$ 는 이항분포 $B\\left(${n}, ${T(fr(P, 100))}\\right)$ 를 따름`, `$E(X)=${n}\\times${dec(P / 100)}=${E}$`, `$V(X)=${n}\\times${dec(P / 100)}\\times${dec((100 - P) / 100)}=${dec(V)}$`],
          };
        }
        if (level === 2) {
          const [k, n, s] = r.pick([
            [5, 25, 2],
            [5, 100, 4],
            [4, 48, 3],
            [4, 192, 6],
          ] as [number, number, number][]);
          const a = r.int(2, 5);
          const E = n / k;
          return {
            q: `${k}지선다형 문제 $${n}$ 개에 모두 임의로 답을 고를 때, 맞힌 문제의 수를 $X$ 라 하고 한 문제당 $${a}$ 점씩 주어 점수를 $Y=${a}X$ 라 합니다. $Y$ 의 평균과 표준편차를 구하세요.`,
            answer: {
              type: 'fields',
              fields: [
                { label: 'E(Y)', value: a * E },
                { label: 'σ(Y)', value: a * s },
              ],
            },
            steps: [`$X$ 는 $B\\left(${n}, \\frac{1}{${k}}\\right)$: $E(X)=${E}$, $V(X)=${n}\\times\\frac{1}{${k}}\\times\\frac{${k - 1}}{${k}}=${s * s}$, $\\sigma(X)=${s}$`, `$E(Y)=${a}E(X)=${a * E}$`, `$\\sigma(Y)=${a}\\sigma(X)=${a * s}$`],
          };
        }
        const p = r.pick([fr(1, 10), fr(1, 5), fr(1, 4)]);
        const n = r.int(3, 5);
        const q = new F(1).sub(p);
        const ans = new F(1).sub(q.pow(n)).sub(binomP(n, 1, p));
        const decimal = p.d === 10 || p.d === 5;
        return {
          q: `불량률이 $${pct(p)}\\%$ 인 제품 중에서 임의로 $${n}$ 개를 택할 때, 불량품이 $2$ 개 이상 포함될 확률을 구하세요.`,
          answer: decimal ? dAns(ans.value) : fAns(ans),
          steps: [
            `불량품의 수 $X$ 는 $B\\left(${n}, ${T(p)}\\right)$`,
            `$P(X\\ge2)=1-P(X=0)-P(X=1)=1-\\left(${T(q)}\\right)^{${n}}-${Ctex(n, 1)}\\left(${T(p)}\\right)\\left(${T(q)}\\right)^{${n - 1}}$`,
            decimal ? `$=1-${dec(round(q.pow(n).value, 8))}-${dec(round(binomP(n, 1, p).value, 8))}=${dec(round(ans.value, 8))}$` : `$=1-${T(q.pow(n))}-${T(binomP(n, 1, p))}=${T(ans)}$`,
          ],
        };
      },
    },
  ],

  'pst-6': [
    {
      id: 'normal-word',
      title: '정규분포의 활용 (합격선·불량)',
      gen(r, level) {
        if (level === 1) {
          const z = r.pick([0.5, 1, 1.5, 2, 2.5]);
          const tail = round(0.5 - ZTAB[zKey(z)], 4);
          const m = r.pick([60, 65, 70, 72, 75]),
            s = r.pick([4, 6, 8, 10]);
          const cut = round(m + z * s, 4);
          return {
            q: `어느 시험의 점수는 평균 $${m}$ 점, 표준편차 $${s}$ 점인 정규분포를 따릅니다. 점수가 상위 $${dec(round(tail * 100, 4))}\\%$ 안에 드는 학생에게 상을 줄 때, 상을 받기 위한 최저 점수를 아래 표준정규분포표를 이용하여 구하세요.`,
            table: zTable(),
            answer: { type: 'num', value: cut, unit: '점' },
            steps: [`$P(X\\ge a)=${dec(tail)}$ → $P\\left(Z\\ge\\frac{a-${m}}{${s}}\\right)=0.5-${ZTAB[zKey(z)]}$`, `표에서 $P(0\\le Z\\le ${zKey(z)})=${ZTAB[zKey(z)]}$ 이므로 $\\frac{a-${m}}{${s}}=${zKey(z)}$`, `$a=${m}+${zKey(z)}\\times${s}=${dec(cut)}$ (점)`],
          };
        }
        if (level === 2) {
          const z = r.pick([1, 1.5, 2, 2.5]);
          const p1 = ZTAB[zKey(z)];
          const bad = round(1 - 2 * p1, 4);
          const [m, s, unit, what] = r.pick([
            [500, 4, 'g', '과자 한 봉지의 무게'],
            [100, 2, 'mm', '나사의 길이'],
            [250, 5, 'mL', '음료 한 병의 용량'],
            [50, 2, 'g', '달걀 한 개의 무게'],
          ] as [number, number, string, string][]);
          const d = round(z * s, 4);
          const N = 10000;
          return {
            q: `어느 공장에서 생산하는 ${what}${josa(what, '은', '는')} 평균 $${m}\\text{ ${unit}}$, 표준편차 $${s}\\text{ ${unit}}$ 인 정규분포를 따릅니다. $${dec(round(m - d, 4))}\\text{ ${unit}}$ 미만이거나 $${dec(round(m + d, 4))}\\text{ ${unit}}$ 초과이면 불량품으로 분류할 때, 이 공장의 제품 $${comma(N)}$ 개 중 불량품은 약 몇 개인지 표준정규분포표를 이용하여 구하세요.`,
            table: zTable(),
            answer: { type: 'num', value: round(N * bad), unit: '개' },
            steps: [`$P(|X-${m}|>${dec(d)})=P(|Z|>${zKey(z)})=1-2\\times${p1}=${dec(bad)}$`, `$${comma(N)}\\times${dec(bad)}=${round(N * bad)}$ (개)`],
          };
        }
        if (r.chance(0.5)) {
          const z = r.pick([1, 2, -1, 0.5, 1.5]);
          let s1: number, s2: number;
          do {
            s1 = r.pick([4, 6, 8, 10, 12]);
            s2 = r.pick([4, 6, 8, 10, 12]);
          } while (s1 === s2);
          const x = r.int(60, 85);
          const m1 = x - z * s1,
            m2 = x - z * s2;
          return {
            q: `A 반의 수학 점수는 정규분포 $N(${m1}, ${s1}^{2})$, B 반의 수학 점수는 정규분포 $N(${m2}, ${s2}^{2})$ 을 따릅니다. 두 반에서 점수가 $a$ 점 이상인 학생의 비율이 같을 때, $a$ 의 값을 구하세요.`,
            answer: { type: 'num', value: x },
            steps: [`$P(X_{A}\\ge a)=P\\left(Z\\ge\\frac{a-${m1}}{${s1}}\\right)$, $P(X_{B}\\ge a)=P\\left(Z\\ge\\frac{a-${m2}}{${s2}}\\right)$`, `비율이 같으므로 $\\frac{a-${m1}}{${s1}}=\\frac{a-${m2}}{${s2}}$`, `$${s2}(a-${m1})=${s1}(a-${m2})$ → $a=${x}$`],
          };
        }
        const z = r.pick([1, 1.5, 2, 2.5]);
        const tail = round(0.5 - ZTAB[zKey(z)], 4);
        const s = r.pick([2, 4, 6, 8, 10]);
        const m = r.pick([50, 60, 70, 80]);
        return {
          q: `어느 과수원에서 수확한 배의 무게는 평균 $${m * 10}\\text{ g}$ 인 정규분포를 따르고, 무게가 $${dec(round(m * 10 + z * s * 10, 4))}\\text{ g}$ 이상인 배의 비율은 $${dec(round(tail * 100, 4))}\\%$ 입니다. 배의 무게의 표준편차를 표준정규분포표를 이용하여 구하세요.`,
          table: zTable(),
          answer: { type: 'num', value: s * 10, unit: 'g' },
          steps: [`$P(X\\ge${dec(round(m * 10 + z * s * 10, 4))})=P\\left(Z\\ge\\frac{${dec(round(z * s * 10, 4))}}{\\sigma}\\right)=${dec(tail)}=0.5-${ZTAB[zKey(z)]}$`, `표에서 $\\frac{${dec(round(z * s * 10, 4))}}{\\sigma}=${zKey(z)}$`, `$\\sigma=${s * 10}$ (g)`],
        };
      },
    },
    {
      id: 'approx-word',
      title: '이항분포의 정규근사 활용',
      gen(r, level) {
        const c = r.pick(APPROX);
        const intro = approxIntro(c);
        if (level === 1) {
          return {
            q: `${intro} $X$ 의 평균과 표준편차를 구하세요.`,
            answer: {
              type: 'fields',
              fields: [
                { label: '평균', value: c.m },
                { label: '표준편차', value: c.s },
              ],
            },
            steps: [`$X$ 는 $B\\left(${c.n}, ${T(c.p)}\\right)$`, `$E(X)=${c.n}\\times${T(c.p)}=${c.m}$`, `$V(X)=${c.m}\\times${T(new F(1).sub(c.p))}=${c.s * c.s}$, $\\sigma(X)=${c.s}$`],
          };
        }
        const z = r.pick([1, 2, 2.5, 1.5].filter((v) => Number.isInteger(v * c.s)));
        const p1 = ZTAB[zKey(z)];
        if (level === 2) {
          const up = r.chance(0.5);
          const k = c.m + (up ? 1 : -1) * z * c.s;
          const ans = round(0.5 - p1, 4);
          return {
            q: `${intro} $P(X${up ? '\\ge' : '\\le'}${k})$ 의 값을 표준정규분포표를 이용하여 구하세요. (정규분포로 근사)`,
            table: zTable(),
            answer: dAns(ans),
            steps: [`$E(X)=${c.m}$, $\\sigma(X)=${c.s}$ → 근사적으로 $N(${c.m}, ${c.s}^{2})$`, `$P(X${up ? '\\ge' : '\\le'}${k})=P(Z${up ? '\\ge' : '\\le-'}${zKey(z)})=0.5-${p1}=${dec(ans)}$`],
          };
        }
        const c2 = r.pick(APPROX.filter((x) => x.p.value >= 0.5));
        const zz = r.pick([1, 2].filter((v) => Number.isInteger(v * c2.s)));
        const prob = round(0.5 + ZTAB[zKey(zz)], 4);
        const seats = c2.m + zz * c2.s;
        const pv = pct(c2.p);
        return {
          q: `어느 식당에 $${c2.n}$ 명이 예약했고, 예약한 사람이 실제로 오는 확률은 각각 $${pv}\\%$ 로 서로 독립입니다. 실제로 온 사람 수가 준비한 좌석 수 $k$ 이하일 확률이 $${prob}$ 이상이 되도록 하는 $k$ 의 최솟값을 표준정규분포표를 이용하여 구하세요. (정규분포로 근사)`,
          table: zTable(),
          answer: { type: 'num', value: seats, unit: '석' },
          steps: [
            `온 사람 수 $X\\sim B\\left(${c2.n}, ${T(c2.p)}\\right)$: $E(X)=${c2.m}$, $\\sigma(X)=${c2.s}$ → 근사적으로 $N(${c2.m}, ${c2.s}^{2})$`,
            `$P(X\\le k)=P\\left(Z\\le\\frac{k-${c2.m}}{${c2.s}}\\right)\\ge${prob}=0.5+${ZTAB[zKey(zz)]}$`,
            `$\\frac{k-${c2.m}}{${c2.s}}\\ge${zKey(zz)}$ → $k\\ge${seats}$, 최솟값 $${seats}$`,
          ],
        };
      },
    },
  ],

  'pst-7': [
    {
      id: 'estimate-word',
      title: '모평균 추정의 활용',
      gen(r, level) {
        const [what, unit, lo, hi] = r.pick([
          ['과수원에서 수확한 사과의 무게', 'g', 250, 350],
          ['어느 공장에서 생산한 배터리의 수명', '시간', 100, 300],
          ['어느 지역 고등학생의 하루 수면 시간', '분', 360, 480],
          ['어느 회사 택배의 배송 시간', '시간', 30, 60],
        ] as [string, string, number, number][]);
        const cond = '(단, $Z$ 가 표준정규분포를 따르는 확률변수일 때 $P(|Z|\\le1.96)=0.95$, $P(|Z|\\le2.58)=0.99$ 로 계산)';
        if (level === 1) {
          const k = r.pick([4, 5, 8, 10]);
          const n = k * k;
          const se = r.int(1, 4);
          const s = se * k;
          const xb = r.int(lo, hi);
          const conf = r.pick([1.96, 2.58]);
          const h = round(conf * se, 4);
          return {
            q: `${what}${josa(what, '은', '는')} 표준편차가 $${s}$ ${unit}인 정규분포를 따릅니다. 임의추출한 $${n}$ 개의 표본평균이 $${xb}$ ${unit}일 때, 모평균 $m$ 에 대한 신뢰도 $${conf === 1.96 ? 95 : 99}\\%$ 의 신뢰구간 $a\\le m\\le b$ 를 구하세요. ${cond}`,
            answer: {
              type: 'fields',
              fields: [
                { label: 'a', value: round(xb - h, 4), display: 'dec' },
                { label: 'b', value: round(xb + h, 4), display: 'dec' },
              ],
            },
            steps: [`$\\frac{\\sigma}{\\sqrt{n}}=\\frac{${s}}{${k}}=${se}$`, `$${conf}\\times${se}=${dec(h)}$`, `$${dec(round(xb - h, 4))}\\le m\\le${dec(round(xb + h, 4))}$`],
          };
        }
        if (level === 2) {
          const s = r.pick([4, 5, 6, 8, 10, 12, 15, 20]);
          const E = r.pick([1, 2, 2.5, 3, 4, 5].filter((e) => e < s));
          const need = round(((196 * s) / (100 * E)) ** 2, 6);
          const nmin = Math.ceil(need - 1e-9);
          return {
            q: `${what}${josa(what, '은', '는')} 표준편차가 $${s}$ ${unit}인 정규분포를 따릅니다. 표본을 임의추출하여 모평균을 신뢰도 $95\\%$ 로 추정할 때, 표본평균과 모평균의 차가 $${E}$ ${unit} 이하가 되게 하려면 표본의 크기는 최소 얼마여야 하나요? ${cond}`,
            answer: { type: 'num', value: nmin },
            steps: [`신뢰도 $95\\%$ 에서 $|\\overline{X}-m|\\le1.96\\frac{${s}}{\\sqrt{n}}$`, `$1.96\\times\\frac{${s}}{\\sqrt{n}}\\le${E}$ → $\\sqrt{n}\\ge\\frac{${dec(round(1.96 * s, 4))}}{${E}}=${dec(round((1.96 * s) / E, 6))}$`, `$n\\ge${dec(need)}$ → 최솟값 $${nmin}$`],
          };
        }
        const k = r.pick([4, 5, 8, 10]);
        const n = k * k;
        const se = r.int(1, 4);
        const s = se * k;
        const xb = r.int(lo, hi);
        const h = round(1.96 * se, 4);
        const a = round(xb - h, 4),
          b = round(xb + h, 4);
        return {
          q: `${what}${josa(what, '은', '는')} 정규분포를 따릅니다. 임의추출한 $${n}$ 개의 표본으로 모평균 $m$ 을 신뢰도 $95\\%$ 로 추정한 신뢰구간이 $${dec(a)}\\le m\\le${dec(b)}$ 였습니다. 표본평균과 모표준편차를 구하세요. ${cond}`,
          answer: {
            type: 'fields',
            fields: [
              { label: '표본평균', value: xb },
              { label: '모표준편차', value: s },
            ],
          },
          steps: [`표본평균은 구간의 가운데: $\\frac{${dec(a)}+${dec(b)}}{2}=${xb}$`, `구간 길이의 절반 $${dec(h)}=1.96\\times\\frac{\\sigma}{\\sqrt{${n}}}$ → $\\frac{\\sigma}{${k}}=${se}$`, `$\\sigma=${s}$`],
        };
      },
    },
  ],
};
