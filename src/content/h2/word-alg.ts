// 대수 활용(문장제) 유형 — alg.ts 의 각 단원 skills 뒤에 덧붙임
import type { Skill } from '../../core/types';
import { F } from '../../core/frac';
import { round } from '../../core/nt';
import { comma, dec } from '../../core/tex';
import { NAMES, josa } from './util';

/** 상용로그 근삿값 (log 2 = 0.3010, log 3 = 0.4771 로 계산) */
const LOGV: Record<number, number> = { 1: 0, 2: 0.301, 3: 0.4771, 4: 0.602, 5: 0.699, 6: 0.7781, 8: 0.903, 9: 0.9542 };
const LOGHOW: Record<number, string> = {
  1: '$\\log1=0$',
  2: '$\\log2=0.3010$',
  3: '$\\log3=0.4771$',
  4: '$\\log4=2\\log2=0.6020$',
  5: '$\\log5=1-\\log2=0.6990$',
  6: '$\\log6=\\log2+\\log3=0.7781$',
  8: '$\\log8=3\\log2=0.9030$',
  9: '$\\log9=2\\log3=0.9542$',
};
const GIVEN = '(단, $\\log2=0.3010$, $\\log3=0.4771$ 로 계산)';
const d4 = (x: number) => dec(round(x, 4));
/** 소수 4자리 고정 (0.3010) */
const f4 = (x: number) => x.toFixed(4);
/** 수 문자열 뒤 '(으)로': 끝 숫자 0·3·6 이면 '으로' */
const ro = (s: string) => (/[036]$/.test(s) ? '으로' : '로');

/** 복리·감소 문제: [설명, 배율 TeX, log 값(4자리), 목표, 목표 TeX, log 목표, 성장?] */
type Comp = { rate: number; base: string; lg: number; given: string; grow: boolean };
const COMPS: Comp[] = [
  { rate: 5, base: '1.05', lg: 0.0212, given: '$\\log1.05=0.0212$', grow: true },
  { rate: 6, base: '1.06', lg: 0.0253, given: '$\\log1.06=0.0253$', grow: true },
  { rate: 8, base: '1.08', lg: 0.0334, given: '$\\log1.08=0.0334$', grow: true },
  { rate: 10, base: '1.1', lg: 0.0414, given: '$\\log1.1=0.0414$', grow: true },
  { rate: 20, base: '1.2', lg: 0.0792, given: '$\\log1.2=0.0792$', grow: true },
  { rate: 20, base: '0.8', lg: -0.097, given: '$\\log2=0.3010$', grow: false },
  { rate: 10, base: '0.9', lg: -0.0458, given: '$\\log3=0.4771$', grow: false },
];
type CompCase = { c: Comp; target: number; tLg: number; n: number };
const COMP_CASES: CompCase[] = [];
for (const c of COMPS) {
  const targets: [number, number][] = c.grow
    ? [
        [2, 0.301],
        [3, 0.4771],
      ]
    : [
        [1 / 2, -0.301],
        [1 / 10, -1],
      ];
  for (const [target, tLg] of targets) {
    const n = Math.ceil(round(tLg / c.lg, 8));
    const real = Number(c.base);
    // 실제 값과 근삿값의 답이 같은 경우만 사용
    const ok = c.grow ? real ** n >= target && real ** (n - 1) < target : real ** n <= target && real ** (n - 1) > target;
    if (ok) COMP_CASES.push({ c, target, tLg, n });
  }
}

export const ALG_WORD: Record<string, Skill[]> = {
  'alg-1': [
    {
      id: 'log-formula',
      title: '지수·로그 공식의 활용',
      gen(r, level) {
        if (level === 1) {
          const a = r.pick([1, 2, 3, 4, 5, 6, 8, 9]);
          const k = r.int(3, 9);
          const pH = round(k - LOGV[a], 4);
          const what = r.pick(['어느 음료', '빗물', '어느 호수의 물', '어느 용액']);
          return {
            q: `수용액의 수소 이온 농도가 $x\\,\\mathrm{mol/L}$ 일 때 pH 는 $\\mathrm{pH}=-\\log x$ 입니다. ${what}의 수소 이온 농도가 $${a === 1 ? '' : `${a}\\times`}10^{-${k}}\\,\\mathrm{mol/L}$ 일 때, pH 를 구하세요. ${GIVEN}`,
            answer: { type: 'num', value: pH, display: 'dec' },
            steps: [`$\\mathrm{pH}=-\\log(${a === 1 ? '' : `${a}\\times`}10^{-${k}})=${k}${a === 1 ? '' : `-\\log${a}`}$`, ...(a === 1 ? [] : [LOGHOW[a]]), `$\\mathrm{pH}=${d4(pH)}$`],
          };
        }
        if (level === 2) {
          if (r.chance(0.5)) {
            const a = r.pick([2, 3, 4, 5, 6, 8]);
            const n = r.int(0, 3);
            const N = a * 10 ** n;
            const dB = round(10 * (n + LOGV[a]), 4);
            return {
              q: `소리의 세기가 $I$ 일 때 소리의 크기는 $L=10\\log\\frac{I}{I_{0}}$ (dB) 입니다 ($I_{0}$ 는 상수). 어떤 소리의 세기가 처음의 $${comma(N)}$ 배가 되면, 소리의 크기는 몇 dB 커지나요? ${GIVEN}`,
              answer: { type: 'num', value: dB, display: 'dec', unit: 'dB' },
              steps: [`커진 양 $=10\\log\\frac{${comma(N)}I}{I_{0}}-10\\log\\frac{I}{I_{0}}=10\\log${comma(N)}$`, `$\\log${comma(N)}=${n}+\\log${a}=${d4(n + LOGV[a])}$`, `$10\\times${d4(n + LOGV[a])}=${d4(dB)}$ (dB)`],
            };
          }
          const j = r.int(1, 5);
          const L1 = r.int(3, 6) * 10;
          return {
            q: `소리의 세기가 $I$ 일 때 소리의 크기는 $L=10\\log\\frac{I}{I_{0}}$ (dB) 입니다 ($I_{0}$ 는 상수). 크기가 $${L1 + 10 * j}$ dB 인 소리의 세기는 $${L1}$ dB 인 소리의 세기의 몇 배인가요?`,
            answer: { type: 'num', value: 10 ** j, unit: '배' },
            steps: [`$${L1 + 10 * j}-${L1}=10\\log\\frac{I_{1}}{I_{2}}$`, `$\\log\\frac{I_{1}}{I_{2}}=${j}$`, `$\\frac{I_{1}}{I_{2}}=10^{${j}}=${comma(10 ** j)}$ (배)`],
          };
        }
        const kind = r.int(0, 2);
        if (kind === 0) {
          const dM = r.pick([2, 4]);
          const M2 = r.int(dM === 2 ? 30 : 20, dM === 2 ? 60 : 45) / 10;
          const M1 = round(M2 + dM, 1);
          const e = 1.5 * dM;
          return {
            q: `규모가 $M$ 인 지진이 방출하는 에너지를 $E$ (J) 라 하면 $\\log E=4.8+1.5M$ 입니다. 규모 $${M1}$ 인 지진이 방출하는 에너지는 규모 $${M2}$ 인 지진이 방출하는 에너지의 몇 배인가요?`,
            answer: { type: 'num', value: 10 ** e, unit: '배' },
            steps: [`$\\log E_{1}-\\log E_{2}=1.5\\times(${M1}-${M2})=${e}$`, `$\\log\\frac{E_{1}}{E_{2}}=${e}$ → $\\frac{E_{1}}{E_{2}}=10^{${e}}=${comma(10 ** e)}$ (배)`],
          };
        }
        if (kind === 1) {
          const j = r.pick([3, 6]);
          const M2 = r.int(j === 3 ? 30 : 20, j === 3 ? 60 : 40) / 10;
          const dM = (2 * j) / 3;
          return {
            q: `규모가 $M$ 인 지진이 방출하는 에너지를 $E$ (J) 라 하면 $\\log E=4.8+1.5M$ 입니다. 어떤 지진이 방출한 에너지가 규모 $${M2}$ 인 지진이 방출한 에너지의 $10^{${j}}$ 배였을 때, 이 지진의 규모를 구하세요.`,
            answer: { type: 'num', value: round(M2 + dM, 1), display: 'dec' },
            steps: [`$\\log E_{1}-\\log E_{2}=1.5(M_{1}-${M2})$`, `$\\log10^{${j}}=${j}=1.5(M_{1}-${M2})$ → $M_{1}-${M2}=${dM}$`, `$M_{1}=${dec(round(M2 + dM, 1))}$`],
          };
        }
        const j = r.int(1, 4);
        const askMag = r.chance(0.5);
        return askMag
          ? {
              q: `두 별의 겉보기 등급을 $m_{1}$, $m_{2}$, 밝기를 $I_{1}$, $I_{2}$ 라 하면 $m_{1}-m_{2}=-2.5\\log\\frac{I_{1}}{I_{2}}$ 입니다. 별 A 의 밝기가 별 B 의 밝기의 $10^{${j}}$ 배일 때, 별 B 의 등급은 별 A 의 등급보다 얼마나 큰가요?`,
              answer: { type: 'num', value: 2.5 * j, display: 'dec' },
              steps: [`$m_{A}-m_{B}=-2.5\\log10^{${j}}=-${dec(2.5 * j)}$`, `$m_{B}-m_{A}=${dec(2.5 * j)}$`],
            }
          : {
              q: `두 별의 겉보기 등급을 $m_{1}$, $m_{2}$, 밝기를 $I_{1}$, $I_{2}$ 라 하면 $m_{1}-m_{2}=-2.5\\log\\frac{I_{1}}{I_{2}}$ 입니다. $1$ 등급인 별의 밝기는 $${1 + 5 * j}$ 등급인 별의 밝기의 몇 배인가요?`,
              answer: { type: 'num', value: 100 ** j, unit: '배' },
              steps: [`$1-${1 + 5 * j}=-2.5\\log\\frac{I_{1}}{I_{2}}$ → $\\log\\frac{I_{1}}{I_{2}}=\\frac{${5 * j}}{2.5}=${2 * j}$`, `$\\frac{I_{1}}{I_{2}}=10^{${2 * j}}=${comma(100 ** j)}$ (배)`],
            };
      },
    },
  ],

  'alg-2': [
    {
      id: 'exp-growth',
      title: '지수함수의 활용 (반감기·증식·복리)',
      gen(r, level) {
        if (level === 1) {
          const k = r.int(1, 4);
          if (r.chance(0.5)) {
            const T = r.pick([5, 8, 10, 20, 30]);
            const m = r.int(1, 10);
            const M0 = m * 2 ** k;
            const what = r.pick(['방사성 물질', '어떤 약물 성분', '방사성 동위원소']);
            return {
              q: `${what}${josa(what, '은', '는')} $${T}$ 년마다 그 양이 절반으로 줄어듭니다. 처음 양이 $${M0}\\text{ g}$ 일 때 $t$ 년 후의 양은 $M(t)=${M0}\\left(\\frac{1}{2}\\right)^{\\frac{t}{${T}}}$ 입니다. $${k * T}$ 년 후에 남은 양은 몇 g 인가요?`,
              answer: { type: 'num', value: m, unit: 'g' },
              steps: [`$M(${k * T})=${M0}\\left(\\frac{1}{2}\\right)^{\\frac{${k * T}}{${T}}}=${M0}\\times\\left(\\frac{1}{2}\\right)^{${k}}$`, `$=\\frac{${M0}}{${2 ** k}}=${m}$ (g)`],
            };
          }
          const h = r.pick([2, 3, 4, 5]);
          const a = r.pick([100, 200, 300, 500]);
          return {
            q: `어떤 세균은 $${h}$ 시간마다 그 수가 $2$ 배가 됩니다. 처음 세균 수가 $${a}$ 마리일 때 $t$ 시간 후의 세균 수는 $N(t)=${a}\\times2^{\\frac{t}{${h}}}$ 입니다. $${k * h}$ 시간 후의 세균 수를 구하세요.`,
            answer: { type: 'num', value: a * 2 ** k, unit: '마리' },
            steps: [`$N(${k * h})=${a}\\times2^{\\frac{${k * h}}{${h}}}=${a}\\times2^{${k}}$`, `$=${comma(a * 2 ** k)}$ (마리)`],
          };
        }
        if (level === 2) {
          if (r.chance(0.5)) {
            const T = r.pick([3, 5, 8, 10, 12]);
            const k = r.int(2, 6);
            return {
              q: `어떤 약물을 복용하면 혈액 속 약물의 양은 $t$ 시간 후 $M(t)=M_{0}\\left(\\frac{1}{2}\\right)^{\\frac{t}{${T}}}$ 이 됩니다 ($M_{0}$: 처음 양). 약물의 양이 처음 양의 $\\frac{1}{${2 ** k}}$ 이 되는 것은 복용하고 몇 시간 후인가요?`,
              answer: { type: 'num', value: k * T, unit: '시간' },
              steps: [`$M_{0}\\left(\\frac{1}{2}\\right)^{\\frac{t}{${T}}}=\\frac{1}{${2 ** k}}M_{0}$`, `$\\left(\\frac{1}{2}\\right)^{\\frac{t}{${T}}}=\\left(\\frac{1}{2}\\right)^{${k}}$ → $\\frac{t}{${T}}=${k}$`, `$t=${k * T}$ (시간)`],
            };
          }
          const h = r.pick([2, 3, 4, 5, 6]);
          const k = r.int(2, 4);
          return {
            q: `어떤 세포는 $t$ 시간 후 그 수가 $N(t)=N_{0}\\times3^{\\frac{t}{${h}}}$ 이 됩니다 ($N_{0}$: 처음 수). 세포 수가 처음의 $${3 ** k}$ 배가 되는 것은 몇 시간 후인가요?`,
            answer: { type: 'num', value: k * h, unit: '시간' },
            steps: [`$3^{\\frac{t}{${h}}}=${3 ** k}=3^{${k}}$`, `$\\frac{t}{${h}}=${k}$, $t=${k * h}$ (시간)`],
          };
        }
        const cs = r.pick(COMP_CASES);
        const { c, target, tLg, n } = cs;
        const ratioTex = target === 2 ? '2' : target === 3 ? '3' : target === 0.5 ? '\\frac{1}{2}' : '\\frac{1}{10}';
        if (c.grow) {
          const A = r.pick([100, 200, 500, 1000]);
          return {
            q: `원금 $${A}$ 만 원을 연이율 $${c.rate}\\%$ 의 복리로 예금할 때, 원리합계가 처음으로 원금의 $${target}$ 배 이상이 되는 것은 몇 년 후인가요? (단, ${c.given}, $\\log${target}=${f4(tLg)}$ ${ro(f4(tLg))} 계산)`,
            answer: { type: 'num', value: n, unit: '년' },
            steps: [`$n$ 년 후 원리합계: $${A}\\times${c.base}^{n}\\ge${target}\\times${A}$`, `양변에 상용로그: $n\\log${c.base}\\ge\\log${target}$ → $n\\ge\\frac{${f4(tLg)}}{${f4(c.lg)}}=${dec(round(tLg / c.lg, 3))}\\cdots$`, `처음으로 만족하는 $n=${n}$ (년 후)`],
          };
        }
        const filt = r.pick(['필터', '정수 장치']);
        const given = c.base === '0.8' ? '$\\log2=0.3010$' : target === 0.5 ? '$\\log2=0.3010$, $\\log3=0.4771$' : '$\\log3=0.4771$';
        return {
          q: `물을 ${filt}에 한 번 통과시킬 때마다 불순물의 $${c.rate}\\%$ 가 제거됩니다. 불순물의 양이 처음의 $${ratioTex}$ 이하가 되려면 최소 몇 번 통과시켜야 하나요? (단, ${given} ${ro(given.replace(/\$$/, ''))} 계산)`,
          answer: { type: 'num', value: n, unit: '번' },
          steps: [
            `$n$ 번 통과 후 남은 양: $${c.base}^{n}\\times(\\text{처음 양})$, 조건 $${c.base}^{n}\\le${ratioTex}$`,
            c.base === '0.8' ? `$\\log0.8=3\\log2-1=-0.0970$, $\\log${ratioTex}=${f4(tLg)}$` : `$\\log0.9=2\\log3-1=-0.0458$, $\\log${ratioTex}=${f4(tLg)}$`,
            `$n\\times(${f4(c.lg)})\\le${f4(tLg)}$ → $n\\ge${dec(round(tLg / c.lg, 3))}\\cdots$ (음수로 나누면 부등호 방향이 바뀜)`,
            `최소 $${n}$ 번`,
          ],
        };
      },
    },
  ],

  'alg-3': [
    {
      id: 'periodic-word',
      title: '삼각함수의 활용 (주기 현상)',
      gen(r, level) {
        const R = r.pick([10, 12, 16, 20, 24, 30, 40]);
        const c = R + r.int(2, 10);
        if (level === 1) {
          const p = r.pick([5, 6, 8, 10, 12, 15]);
          return {
            q: `대관람차에 탄 사람의 $t$ 분 후 지면으로부터의 높이가 $h(t)=${c}-${R}\\cos\\frac{\\pi}{${p}}t$ (m) 일 때, 이 사람이 올라가는 가장 높은 높이와 대관람차가 한 바퀴 도는 데 걸리는 시간을 구하세요.`,
            answer: {
              type: 'fields',
              fields: [
                { label: '최고 높이', value: c + R, unit: 'm' },
                { label: '한 바퀴', value: 2 * p, unit: '분' },
              ],
            },
            steps: [`$-1\\le\\cos\\frac{\\pi}{${p}}t\\le1$ 이므로 최댓값은 $\\cos=-1$ 일 때 $${c}+${R}=${c + R}$`, `주기 $\\frac{2\\pi}{\\frac{\\pi}{${p}}}=${2 * p}$ (분)`],
          };
        }
        if (level === 2) {
          if (r.chance(0.5)) {
            const p = r.pick([6, 9, 12, 15]);
            const j = r.int(1, 5);
            const cosv = [new F(1), new F(1, 2), new F(-1, 2), new F(-1), new F(-1, 2), new F(1, 2)][j];
            const h = new F(c).sub(cosv.mul(R));
            return {
              q: `대관람차에 탄 사람의 $t$ 분 후 지면으로부터의 높이가 $h(t)=${c}-${R}\\cos\\frac{\\pi}{${p}}t$ (m) 일 때, 탑승하고 $${(p * j) / 3}$ 분 후의 높이를 구하세요.`,
              answer: { type: 'num', value: h.value, unit: 'm' },
              steps: [`$\\frac{\\pi}{${p}}\\times${(p * j) / 3}=${['', '\\frac{\\pi}{3}', '\\frac{2}{3}\\pi', '\\pi', '\\frac{4}{3}\\pi', '\\frac{5}{3}\\pi'][j]}$, $\\cos${['', '\\frac{\\pi}{3}', '\\frac{2}{3}\\pi', '\\pi', '\\frac{4}{3}\\pi', '\\frac{5}{3}\\pi'][j]}=${cosv.tex()}$`, `$h=${c}-${R}\\times\\left(${cosv.tex()}\\right)=${h.tex()}$ (m)`],
            };
          }
          const D = r.int(5, 12);
          const A = r.pick([2, 4, 6]);
          const t = r.pick([1, 3, 5, 6, 7, 9, 11]);
          const sv = { 1: new F(1, 2), 3: new F(1), 5: new F(1, 2), 6: new F(0), 7: new F(-1, 2), 9: new F(-1), 11: new F(-1, 2) }[t]!;
          const ang = { 1: '\\frac{\\pi}{6}', 3: '\\frac{\\pi}{2}', 5: '\\frac{5}{6}\\pi', 6: '\\pi', 7: '\\frac{7}{6}\\pi', 9: '\\frac{3}{2}\\pi', 11: '\\frac{11}{6}\\pi' }[t]!;
          const h = sv.mul(A).add(D);
          return {
            q: `어느 항구의 바닷물 깊이는 밤 $12$ 시부터 $t$ 시간 후 $d(t)=${D}+${A}\\sin\\frac{\\pi}{6}t$ (m) 입니다. 밤 $12$ 시부터 $${t}$ 시간 후의 바닷물 깊이를 구하세요.`,
            answer: { type: 'num', value: h.value, unit: 'm' },
            steps: [`$\\frac{\\pi}{6}\\times${t}=${ang}$, $\\sin${ang}=${sv.tex()}$`, `$d(${t})=${D}+${A}\\times\\left(${sv.tex()}\\right)=${h.tex()}$ (m)`],
          };
        }
        const p = r.pick([6, 9, 12, 15]);
        const T = 2 * p;
        const kind = r.int(0, 2);
        const H = [new F(c).add(new F(R, 2)), new F(c), new F(c).sub(new F(R, 2))][kind];
        const frac = [new F(1, 3), new F(1, 2), new F(2, 3)][kind];
        const range = ['\\frac{2}{3}\\pi\\le\\theta\\le\\frac{4}{3}\\pi', '\\frac{\\pi}{2}\\le\\theta\\le\\frac{3}{2}\\pi', '\\frac{\\pi}{3}\\le\\theta\\le\\frac{5}{3}\\pi'][kind];
        const cosK = ['-\\frac{1}{2}', '0', '\\frac{1}{2}'][kind];
        const dur = frac.mul(T);
        return {
          q: `대관람차에 탄 사람의 $t$ 분 후 지면으로부터의 높이가 $h(t)=${c}-${R}\\cos\\frac{\\pi}{${p}}t$ (m) 입니다. 대관람차가 한 바퀴 도는 동안 이 사람의 높이가 $${H.tex()}\\text{ m}$ 이상인 시간은 몇 분인가요?`,
          answer: { type: 'num', value: dur.value, unit: '분' },
          steps: [
            `$\\theta=\\frac{\\pi}{${p}}t$ 로 놓으면 $${c}-${R}\\cos\\theta\\ge${H.tex()}$ → $\\cos\\theta\\le${cosK}$`,
            `$0\\le\\theta<2\\pi$ 에서 $${range}$ → 한 주기의 $${frac.tex()}$`,
            `한 바퀴 $${T}$ 분의 $${frac.tex()}$: $${dur.tex()}$ 분`,
          ],
          hint: '$\\cos\\theta$ 의 값의 범위를 단위원이나 그래프로 확인해 보세요.',
        };
      },
    },
  ],

  'alg-5': [
    {
      id: 'seq-word',
      title: '등차·등비수열의 활용',
      gen(r, level) {
        if (level === 1) {
          const a = r.int(10, 30),
            d = r.int(2, 4),
            n = r.int(10, 25);
          const place = r.pick(['공연장', '강당', '야외 극장']);
          if (r.chance(0.5)) {
            return {
              q: `어느 ${place}의 좌석은 첫째 줄에 $${a}$ 석이 있고, 뒷줄로 갈수록 한 줄에 $${d}$ 석씩 늘어납니다. $${n}$ 번째 줄의 좌석은 몇 석인가요?`,
              answer: { type: 'num', value: a + (n - 1) * d, unit: '석' },
              steps: [`첫째항 $${a}$, 공차 $${d}$ 인 등차수열`, `$a_{${n}}=${a}+(${n}-1)\\times${d}=${a + (n - 1) * d}$`],
            };
          }
          const S = (n * (2 * a + (n - 1) * d)) / 2;
          return {
            q: `어느 ${place}의 좌석은 첫째 줄에 $${a}$ 석이 있고, 뒷줄로 갈수록 한 줄에 $${d}$ 석씩 늘어나 모두 $${n}$ 줄입니다. 전체 좌석은 몇 석인가요?`,
            answer: { type: 'num', value: S, unit: '석' },
            steps: [`첫째항 $${a}$, 공차 $${d}$, 항수 $${n}$ 인 등차수열의 합`, `$S_{${n}}=\\frac{${n}\\{2\\times${a}+(${n}-1)\\times${d}\\}}{2}=${comma(S)}$`],
          };
        }
        if (level === 2) {
          const rr = r.pick([2, 3]);
          const a = r.pick([100, 200, 500, 1000]);
          const n = rr === 2 ? r.int(5, 10) : r.int(4, 7);
          const S = (a * (rr ** n - 1)) / (rr - 1);
          const who = r.pick(NAMES);
          return {
            q: `${who}${josa(who, '이는', '는')} 저금통에 첫째 날 $${a}$ 원을 넣고, 둘째 날부터는 전날 넣은 금액의 $${rr}$ 배를 넣기로 했습니다. $${n}$ 일 동안 저금통에 넣은 금액은 모두 몇 원인가요?`,
            answer: { type: 'num', value: S, unit: '원' },
            steps: [`첫째항 $${a}$, 공비 $${rr}$ 인 등비수열의 첫째항부터 제$${n}$항까지의 합`, `$S_{${n}}=\\frac{${a}(${rr}^{${n}}-1)}{${rr}-1}=${rr === 2 ? '' : '\\frac{'}${a}\\times${rr ** n - 1}${rr === 2 ? '' : '}{2}'}=${comma(S)}$`],
          };
        }
        const [pct, n, approx] = r.pick([
          [10, 10, '2.6'],
          [5, 10, '1.6'],
          [2, 10, '1.2'],
          [10, 5, '1.6'],
          [4, 10, '1.5'],
          [3, 10, '1.3'],
        ] as [number, number, string][]);
        const a = r.pick([10, 20, 50, 100]);
        const rate = new F(pct, 100);
        const R1 = new F(1).add(rate);
        const Rn = F.fromNumber(Number(approx));
        const begin = r.chance(0.5);
        const base = new F(a).mul(Rn.sub(1)).div(rate);
        const tot = begin ? base.mul(R1) : base;
        const b = dec(round(R1.value, 4));
        return {
          q: `매년 ${begin ? '초' : '말'}에 $${a}$ 만 원씩 연이율 $${pct}\\%$, 1년마다 복리로 $${n}$ 년 동안 적립할 때, $${n}$ 년째 말의 원리합계는 몇 만 원인가요? (단, $${b}^{${n}}=${approx}$ ${ro(approx)} 계산)`,
          answer: { type: 'num', value: tot.value, unit: '만 원' },
          steps: [
            begin
              ? `첫 해 초 적립금은 $${n}$ 년 동안 불어나 $${a}\\times${b}^{${n}}$, …, 마지막 해 초 적립금은 $${a}\\times${b}$`
              : `첫 해 말 적립금은 $${n - 1}$ 년 동안 불어나 $${a}\\times${b}^{${n - 1}}$, …, 마지막 해 말 적립금은 $${a}$`,
            begin ? `합: $\\frac{${a}\\times${b}(${b}^{${n}}-1)}{${b}-1}$` : `합: $\\frac{${a}(${b}^{${n}}-1)}{${b}-1}$`,
            `$=${begin ? `\\frac{${a}\\times${b}\\times${dec(round(Rn.value - 1, 4))}}{${dec(rate.value)}}` : `\\frac{${a}\\times${dec(round(Rn.value - 1, 4))}}{${dec(rate.value)}}`}=${dec(round(tot.value, 4))}$ (만 원)`,
          ],
        };
      },
    },
  ],

  'alg-6': [
    {
      id: 'sigma-word',
      title: '수열의 합의 활용 (규칙적으로 쌓기)',
      gen(r, level) {
        if (level === 1) {
          const a = r.int(1, 3),
            b = r.int(0, 4),
            n = r.int(8, 20);
          const S = (a * n * (n + 1)) / 2 + b * n;
          const thing = r.pick(['화분', '벽돌', '의자', '컵']);
          return {
            q: `${thing}${josa(thing, '을', '를')} 여러 줄로 놓는데, $k$ 번째 줄에는 $${a === 1 ? '' : a}k${b ? `+${b}` : ''}$ 개를 놓습니다. 첫째 줄부터 $${n}$ 번째 줄까지 놓은 ${thing}${josa(thing, '은', '는')} 모두 몇 개인가요?`,
            answer: { type: 'num', value: S, unit: '개' },
            steps: [`$\\sum_{k=1}^{${n}}${b ? '(' : ''}${a === 1 ? '' : a}k${b ? `+${b})` : ''}=${a === 1 ? '' : `${a}\\times`}\\frac{${n}\\times${n + 1}}{2}${b ? `+${b}\\times${n}` : ''}$`, `$=${S}$ (개)`],
          };
        }
        if (level === 2) {
          const n = r.int(5, 12);
          const s2 = (n * (n + 1) * (2 * n + 1)) / 6;
          if (r.chance(0.5)) {
            return {
              q: `정육면체 모양의 상자를 사각뿔 모양으로 쌓는데, 맨 위층에 $1$ 개, 그 아래층에 $2\\times2$ 개, 그 아래층에 $3\\times3$ 개, … 를 놓습니다. 모두 $${n}$ 층으로 쌓을 때 필요한 상자는 몇 개인가요?`,
              answer: { type: 'num', value: s2, unit: '개' },
              steps: [`위에서 $k$ 번째 층의 상자 수: $k^{2}$`, `$\\sum_{k=1}^{${n}}k^{2}=\\frac{${n}\\times${n + 1}\\times${2 * n + 1}}{6}=${s2}$`],
            };
          }
          const s = s2 + (n * (n + 1)) / 2;
          return {
            q: `블록을 쌓는데, 위에서 $k$ 번째 층에는 가로 $k+1$ 개, 세로 $k$ 개로 직사각형 모양이 되게 놓습니다. 모두 $${n}$ 층으로 쌓을 때 필요한 블록은 몇 개인가요?`,
            answer: { type: 'num', value: s, unit: '개' },
            steps: [`$k$ 번째 층: $k(k+1)=k^{2}+k$ 개`, `$\\sum_{k=1}^{${n}}(k^{2}+k)=${s2}+${(n * (n + 1)) / 2}=${s}$`],
          };
        }
        const n = r.int(5, 12);
        const tot = (n * (n + 1) * (n + 2)) / 6;
        const ask = r.chance(0.6);
        const intro = `구슬을 삼각뿔 모양으로 쌓습니다. 위에서 $k$ 번째 층에는 구슬을 $1+2+\\cdots+k$ 개 놓아 정삼각형 모양을 만듭니다.`;
        const st = [`$k$ 번째 층: $\\frac{k(k+1)}{2}$ 개`, `$n$ 층까지의 합 $\\sum_{k=1}^{n}\\frac{k(k+1)}{2}=\\frac{1}{2}\\left\\{\\frac{n(n+1)(2n+1)}{6}+\\frac{n(n+1)}{2}\\right\\}=\\frac{n(n+1)(n+2)}{6}$`];
        return ask
          ? {
              q: `${intro} 모두 $${n}$ 층으로 쌓을 때 필요한 구슬은 몇 개인가요?`,
              answer: { type: 'num', value: tot, unit: '개' },
              steps: [...st, `$n=${n}$: $\\frac{${n}\\times${n + 1}\\times${n + 2}}{6}=${tot}$`],
            }
          : {
              q: `${intro} 구슬 $${tot}$ 개를 남김없이 사용하여 쌓았다면 모두 몇 층인가요?`,
              answer: { type: 'num', value: n, unit: '층' },
              steps: [...st, `$\\frac{n(n+1)(n+2)}{6}=${tot}$ → $n(n+1)(n+2)=${6 * tot}=${n}\\times${n + 1}\\times${n + 2}$`, `$n=${n}$ (층)`],
            };
      },
    },
  ],

  'alg-7': [
    {
      id: 'recursive-word',
      title: '귀납적으로 정의된 수열의 활용',
      gen(r, level) {
        if (level === 1) {
          if (r.chance(0.5)) {
            const n = r.int(4, 8);
            const terms = Array.from({ length: n }, (_, i) => 2 ** (i + 1) - 1);
            return {
              q: `하노이의 탑에서 원판 $n$ 개를 모두 옮기는 최소 이동 횟수를 $a_{n}$ 이라 하면 $a_{1}=1$, $a_{n+1}=2a_{n}+1$ 입니다. 원판 $${n}$ 개를 모두 옮기는 최소 이동 횟수를 구하세요.`,
              answer: { type: 'num', value: terms[n - 1], unit: '번' },
              steps: [`$a_{1}=1$ 부터 차례로: ${terms.map((t, i) => `$a_{${i + 1}}=${t}$`).join(', ')}`, `$a_{${n}}=${terms[n - 1]}$`],
            };
          }
          const n = r.int(5, 10);
          const f = [1, 2];
          while (f.length < n) f.push(f[f.length - 1] + f[f.length - 2]);
          return {
            q: `계단을 한 번에 $1$ 칸 또는 $2$ 칸씩 오를 때, $n$ 칸을 오르는 방법의 수를 $a_{n}$ 이라 하면 $a_{1}=1$, $a_{2}=2$, $a_{n+2}=a_{n+1}+a_{n}$ 입니다. $${n}$ 칸을 오르는 방법의 수를 구하세요.`,
            answer: { type: 'num', value: f[n - 1], unit: '가지' },
            steps: [`마지막에 $1$ 칸 오르거나 $2$ 칸 오르는 경우로 나눠 $a_{n+2}=a_{n+1}+a_{n}$`, f.map((t, i) => `$a_{${i + 1}}=${t}$`).join(', ')],
          };
        }
        if (level === 2) {
          const D = 8 * r.int(1, 10);
          const k = r.int(2, 4);
          const half = new F(1, 2);
          const seq = [new F(D)];
          while (seq.length < k) seq.push(seq[seq.length - 1].mul(half).add(D));
          const med = r.chance(0.5);
          return {
            q: med
              ? `어떤 환자가 매일 아침 같은 시각에 약을 $${D}\\text{ mg}$ 씩 복용합니다. 몸속의 약 성분은 하루가 지나면 절반이 남습니다. $n$ 번째 복용 직후 몸속의 약 성분의 양을 $a_{n}$ (mg) 이라 할 때, $a_{1}=${D}$, $a_{n+1}=\\frac{1}{2}a_{n}+${D}$ 입니다. $${k}$ 번째 복용 직후 몸속의 약 성분은 몇 mg 인가요?`
              : `물탱크에 물 $${D}\\text{ L}$ 를 넣은 뒤, 매일 탱크 속 물의 절반을 사용하고 다시 $${D}\\text{ L}$ 를 채웁니다. $n$ 번째로 채운 직후의 물의 양을 $a_{n}$ (L) 이라 할 때, $a_{1}=${D}$, $a_{n+1}=\\frac{1}{2}a_{n}+${D}$ 입니다. $${k}$ 번째로 채운 직후의 물의 양은 몇 L 인가요?`,
            answer: { type: 'num', value: seq[k - 1].value, unit: med ? 'mg' : 'L' },
            steps: seq.slice(1).map((v, i) => `$a_{${i + 2}}=\\frac{1}{2}\\times${seq[i].tex()}+${D}=${v.tex()}$`),
          };
        }
        const n = r.int(5, 15);
        if (r.chance(0.5)) {
          const an = (n * n + n + 2) / 2;
          return {
            q: `평면 위에 어느 두 직선도 평행하지 않고 어느 세 직선도 한 점에서 만나지 않도록 $n$ 개의 직선을 그을 때, 평면이 나누어지는 부분의 개수를 $a_{n}$ 이라 합니다. $a_{${n}}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: an, unit: '개' },
            steps: [`$a_{1}=2$, $(n+1)$ 번째 직선은 기존 $n$ 개의 직선과 $n$ 개의 점에서 만나 $n+1$ 개의 부분으로 나뉘므로 $a_{n+1}=a_{n}+(n+1)$`, `$a_{n}=2+\\sum_{k=1}^{n-1}(k+1)=\\frac{n^{2}+n+2}{2}$`, `$a_{${n}}=\\frac{${n * n}+${n}+2}{2}=${an}$`],
          };
        }
        const an = n * n - n + 2;
        return {
          q: `평면 위에 어느 두 원도 서로 다른 두 점에서 만나고 어느 세 원도 한 점에서 만나지 않도록 $n$ 개의 원을 그릴 때, 평면이 나누어지는 부분의 개수를 $a_{n}$ 이라 합니다. $a_{${n}}$ 의 값을 구하세요.`,
          answer: { type: 'num', value: an, unit: '개' },
          steps: [`$a_{1}=2$, $(n+1)$ 번째 원은 기존 원들과 $2n$ 개의 점에서 만나 $2n$ 개의 호로 나뉘므로 $a_{n+1}=a_{n}+2n$`, `$a_{n}=2+\\sum_{k=1}^{n-1}2k=n^{2}-n+2$`, `$a_{${n}}=${n * n}-${n}+2=${an}$`],
        };
      },
    },
  ],
};
