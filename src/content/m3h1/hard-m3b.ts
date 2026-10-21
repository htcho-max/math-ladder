// 중3-2 심화 유형(skills 뒤에 이어 붙임)과 최상위 유형(top)
import type { Skill } from '../../core/types';
import type { Rng } from '../../core/rng';
import { F } from '../../core/frac';
import { numTex, termsTex } from '../../core/tex';
import { mc, geo, onCircle, meet, triples } from './util';
import { jo, deg, ov, ang, r3, r3add, r3sub, r3inv, r3s, ks } from './hard-util';
import type { R3 } from './hard-util';

type P2 = [number, number];
const fr = (n: number, d = 1) => new F(n, d);
const Z = fr(0);
const COT: Record<number, R3> = { 30: [Z, fr(1)], 45: [fr(1), Z], 60: [Z, fr(1, 3)] };
const TAN: Record<number, R3> = { 30: [Z, fr(1, 3)], 45: [fr(1), Z], 60: [Z, fr(1)] };
const TANTEX: Record<number, string> = { 30: '\\frac{\\sqrt{3}}{3}', 45: '1', 60: '\\sqrt{3}' };
const r3t = (a: R3) => r3(a[0], a[1]);
/** 계수 × h 꼴: (1+\sqrt{3})h, \sqrt{3}h, h */
function coefH(c: R3, v = 'h'): string {
  const t = r3t(c);
  if (t === '1') return v;
  if (t === '-1') return `-${v}`;
  if (c[0].n !== 0 && c[1].n !== 0 && !t.startsWith('\\frac')) return `(${t})${v}`;
  return `${t}${v}`;
}
/** 분수로 보여 준 뒤 값: 약분되거나 소수로 나타나면 '=값' */
function tail(v: F, shownDen?: number): string {
  const t = numTex(v.value);
  return shownDen === v.d && t === v.tex() ? '' : `=${t}`;
}
const sgn = (n: number) => (n === 0 ? '' : n > 0 ? `+${n}` : `${n}`);

export const M3B_HARD: Record<string, Skill[]> = {
  // ───────── 삼각비 ─────────
  'm3b-1': [
    {
      id: 'trig-two-angles',
      title: '삼각비를 두 번 이용하여 높이 구하기',
      gen(r, level) {
        if (level <= 2) {
          const [B, C] = r.pick<[number, number]>([
            [45, 30],
            [45, 60],
            [30, 60],
            [60, 45],
            [30, 45],
          ]);
          const sum = r3add(COT[B], COT[C]);
          if (level === 1) {
            const h = r.int(2, 10);
            const bc = r3s(h, sum);
            const wrong = [r3s(h, r3add(TAN[B], TAN[C])), r3s(h, r3sub(COT[B], COT[C])), r3s(2 * h, sum), r3s(h, r3sub(COT[C], COT[B]))].map(r3t);
            return {
              q: `$\\triangle ABC$ 에서 $${ang('B')}=${deg(B)}$, $${ang('C')}=${deg(C)}$ 이고, 꼭짓점 $A$ 에서 $${ov('BC')}$ 에 내린 수선의 발을 $H$ 라 하면 $${ov('AH')}=${h}$ 이다. $${ov('BC')}$ 의 길이는?`,
              answer: mc(r, r3t(bc), wrong, (i) => r3t(r3s(h + i + 1, sum))),
              steps: [
                `$\\triangle ABH$ 에서 $\\tan${deg(B)}=\\frac{${ov('AH')}}{${ov('BH')}}$ 이므로 $${ov('BH')}=\\frac{${h}}{${TANTEX[B]}}=${r3t(r3s(h, COT[B]))}$`,
                `$\\triangle ACH$ 에서 $${ov('CH')}=\\frac{${h}}{${TANTEX[C]}}=${r3t(r3s(h, COT[C]))}$`,
                `$${ov('BC')}=${ov('BH')}+${ov('CH')}=${r3t(bc)}$`,
              ],
            };
          }
          const a = 2 * r.int(1, 6);
          const h = r3s(a, r3inv(sum));
          const wrong = [r3s(a, sum), r3s(a, r3inv(r3add(TAN[B], TAN[C]))), r3s(a / 2, r3inv(sum)), r3s(2 * a, r3inv(sum))].map(r3t);
          return {
            q: `$\\triangle ABC$ 에서 $${ang('B')}=${deg(B)}$, $${ang('C')}=${deg(C)}$, $${ov('BC')}=${a}$ 이다. 꼭짓점 $A$ 에서 $${ov('BC')}$ 에 내린 수선의 길이는?`,
            answer: mc(r, r3t(h), wrong, (i) => r3t(r3s(a + 2 * i + 2, r3inv(sum)))),
            steps: [
              `수선의 발을 $H$, $${ov('AH')}=h$ 라 하면 $${ov('BH')}=\\frac{h}{\\tan${deg(B)}}=${coefH(COT[B])}$, $${ov('CH')}=\\frac{h}{\\tan${deg(C)}}=${coefH(COT[C])}$`,
              `$${ov('BH')}+${ov('CH')}=${coefH(sum)}=${a}$`,
              `$h=\\frac{${a}}{${r3t(sum)}}=${r3t(h)}$ (분모를 유리화)`,
            ],
          };
        }
        const [B, C] = r.pick<[number, number]>([
          [30, 45],
          [30, 60],
          [45, 60],
        ]);
        const a = 2 * r.int(1, 6);
        const dif = r3sub(COT[B], COT[C]);
        const h = r3s(a, r3inv(dif));
        const wrong = [r3s(a, r3inv(r3add(COT[B], COT[C]))), r3s(a, dif), r3s(a / 2, r3inv(dif)), r3s(2 * a, r3inv(dif))].map(r3t);
        return {
          q: `$\\triangle ABC$ 에서 $${ang('B')}=${deg(B)}$ 이고, 변 $BC$ 의 연장선 위의 점 $D$ 에 대하여 $${ang('ACD')}=${deg(C)}$ 이다. $${ov('BC')}=${a}$ 일 때, 꼭짓점 $A$ 에서 직선 $BC$ 에 내린 수선의 길이는?`,
          answer: mc(r, r3t(h), wrong, (i) => r3t(r3s(a + 2 * i + 2, r3inv(dif)))),
          steps: [
            `꼭짓점 $A$ 에서 $BC$ 의 연장선에 내린 수선의 발을 $H$, $${ov('AH')}=h$ 라 하자. ($H$ 는 점 $C$ 의 바깥쪽)`,
            `$\\triangle ABH$ 에서 $${ov('BH')}=\\frac{h}{\\tan${deg(B)}}=${coefH(COT[B])}$`,
            `$\\triangle ACH$ 에서 $${ang('ACH')}=${deg(C)}$ 이므로 $${ov('CH')}=\\frac{h}{\\tan${deg(C)}}=${coefH(COT[C])}$`,
            `$${ov('BC')}=${ov('BH')}-${ov('CH')}=${coefH(dif)}=${a}$`,
            `$h=\\frac{${a}}{${r3t(dif)}}=${r3t(h)}$`,
          ],
        };
      },
    },
  ],

  // ───────── 원의 성질 ─────────
  'm3b-2': [
    {
      id: 'tangent-inscribed',
      title: '접선과 원주각을 함께 쓰기',
      gen(r, level) {
        const p = level === 3 ? 2 * r.int(20, 70) : 2 * r.int(15, 70);
        const th = 90 - p / 2;
        const A = onCircle(th),
          B = onCircle(-th);
        const P: P2 = [1 / Math.cos((th * Math.PI) / 180), 0];
        const minor = level === 3;
        const C = minor ? onCircle(0) : onCircle(180);
        const pts: Record<string, P2> = { O: [0, 0], A, B, P, ...(level >= 2 ? { C } : {}) };
        const segs: [string, string][] = [
          ['P', 'A'],
          ['P', 'B'],
        ];
        if (level === 1) segs.push(['O', 'A'], ['O', 'B']);
        else segs.push(['C', 'A'], ['C', 'B']);
        const fig = geo(pts, { w: 300, h: 200, segs, circles: [{ c: 'O', r: 1 }], dots: ['O'], right: level === 1 ? [['A', 'O', 'P'], ['B', 'O', 'P']] : [] });
        const head = `그림과 같이 원 $O$ 밖의 한 점 $P$ 에서 원에 그은 두 접선의 접점을 각각 $A$, $B$ 라 하자.`;
        if (level === 1) {
          return {
            q: `${head} $${ang('APB')}=${deg(p)}$ 일 때, $${ang('AOB')}$ 의 크기를 구하세요.`,
            fig,
            answer: { type: 'num', value: 180 - p, unit: '°' },
            steps: [`접선은 접점을 지나는 반지름에 수직: $${ang('OAP')}=${ang('OBP')}=90^\\circ$`, `사각형 $AOBP$ 의 내각의 합은 $360^\\circ$`, `$${ang('AOB')}=360^\\circ-90^\\circ-90^\\circ-${deg(p)}=${deg(180 - p)}$`],
          };
        }
        if (level === 2) {
          return {
            q: `${head} $${ang('APB')}=${deg(p)}$ 이고 점 $C$ 가 큰 호 $AB$ 위에 있을 때, $${ang('ACB')}$ 의 크기를 구하세요.`,
            fig,
            answer: { type: 'num', value: (180 - p) / 2, unit: '°' },
            steps: [`$${ang('OAP')}=${ang('OBP')}=90^\\circ$ 이므로 $${ang('AOB')}=180^\\circ-${deg(p)}=${deg(180 - p)}$`, `$${ang('ACB')}$ 는 작은 호 $AB$ 에 대한 원주각이므로 중심각의 $\\frac{1}{2}$`, `$${ang('ACB')}=\\frac{1}{2}\\times${deg(180 - p)}=${deg((180 - p) / 2)}$`],
          };
        }
        const q = 90 + p / 2;
        if (r.chance(0.5)) {
          return {
            q: `${head} $${ang('APB')}=${deg(p)}$ 이고 점 $C$ 가 작은 호 $AB$ 위에 있을 때, $${ang('ACB')}$ 의 크기를 구하세요.`,
            fig,
            answer: { type: 'num', value: q, unit: '°' },
            steps: [
              `$${ang('AOB')}=180^\\circ-${deg(p)}=${deg(180 - p)}$ (사각형 $AOBP$)`,
              `큰 호 $AB$ 위에 점 $E$ 를 잡으면 $${ang('AEB')}=\\frac{1}{2}\\times${deg(180 - p)}=${deg((180 - p) / 2)}$`,
              `$AEBC$ 는 원에 내접하는 사각형이므로 $${ang('ACB')}=180^\\circ-${deg((180 - p) / 2)}=${deg(q)}$`,
            ],
          };
        }
        return {
          q: `${head} 작은 호 $AB$ 위의 점 $C$ 에 대하여 $${ang('ACB')}=${deg(q)}$ 일 때, $${ang('APB')}$ 의 크기를 구하세요.`,
          fig,
          answer: { type: 'num', value: p, unit: '°' },
          steps: [
            `큰 호 $AB$ 위에 점 $E$ 를 잡으면 $AEBC$ 는 원에 내접하는 사각형: $${ang('AEB')}=180^\\circ-${deg(q)}=${deg(180 - q)}$`,
            `중심각 $${ang('AOB')}=2\\times${deg(180 - q)}=${deg(2 * (180 - q))}$`,
            `$${ang('OAP')}=${ang('OBP')}=90^\\circ$ 이므로 $${ang('APB')}=180^\\circ-${deg(2 * (180 - q))}=${deg(p)}$`,
          ],
        };
      },
    },
  ],

  // ───────── 통계 ─────────
  'm3b-3': [
    {
      id: 'stat-combine',
      title: '두 집단을 합친 평균과 분산',
      gen(r, level) {
        if (level === 1) {
          for (;;) {
            const n1 = r.int(3, 20),
              n2 = r.int(3, 20);
            const m1 = r.int(50, 90),
              m2 = r.int(50, 90);
            if (m1 === m2 || (n1 * m1 + n2 * m2) % (n1 + n2) !== 0) continue;
            const M = (n1 * m1 + n2 * m2) / (n1 + n2);
            return {
              q: `A 모둠 $${n1}$ 명의 수학 점수의 평균은 $${m1}$ 점, B 모둠 $${n2}$ 명의 수학 점수의 평균은 $${m2}$ 점이다. 두 모둠 전체 $${n1 + n2}$ 명의 수학 점수의 평균을 구하세요.`,
              answer: { type: 'num', value: M, unit: '점' },
              steps: [`A 모둠의 점수의 합 $${n1}\\times${m1}=${n1 * m1}$, B 모둠의 점수의 합 $${n2}\\times${m2}=${n2 * m2}$`, `전체 평균 $=\\frac{${n1 * m1}+${n2 * m2}}{${n1 + n2}}=${M}$ (점)`],
            };
          }
        }
        if (level === 2) {
          for (;;) {
            const n1 = r.int(3, 15),
              n2 = r.int(3, 15);
            const v1 = r.int(2, 20),
              v2 = r.int(2, 20);
            if (v1 === v2 || (n1 * v1 + n2 * v2) % (n1 + n2) !== 0) continue;
            const m = r.int(60, 85);
            const V = (n1 * v1 + n2 * v2) / (n1 + n2);
            return {
              q: `A 모둠 $${n1}$ 명과 B 모둠 $${n2}$ 명의 수학 점수의 평균은 모두 $${m}$ 점이고, 분산은 각각 $${v1}$, $${v2}$ 이다. 두 모둠 전체 $${n1 + n2}$ 명의 수학 점수의 분산을 구하세요.`,
              answer: { type: 'num', value: V },
              steps: [`두 모둠의 평균이 같으므로 전체 평균도 $${m}$ 점이고, 각 학생의 편차는 그대로`, `(편차)$^2$ 의 합: A 모둠 $${n1}\\times${v1}=${n1 * v1}$, B 모둠 $${n2}\\times${v2}=${n2 * v2}$`, `전체 분산 $=\\frac{${n1 * v1}+${n2 * v2}}{${n1 + n2}}=${V}$`],
            };
          }
        }
        for (;;) {
          const n1 = r.int(2, 10),
            n2 = r.int(2, 10);
          const m1 = r.int(4, 12),
            m2 = r.int(4, 12);
          const v1 = r.int(1, 9),
            v2 = r.int(1, 9);
          const N = n1 + n2;
          if (m1 === m2 || (n1 * m1 + n2 * m2) % N !== 0) continue;
          const M = (n1 * m1 + n2 * m2) / N;
          const Q1 = n1 * (v1 + m1 * m1),
            Q2 = n2 * (v2 + m2 * m2);
          const V = fr(Q1 + Q2, N).sub(M * M);
          if (!V.isInt()) continue;
          return {
            q: `변량 $${n1}$ 개의 평균이 $${m1}$, 분산이 $${v1}$ 이고, 다른 변량 $${n2}$ 개의 평균이 $${m2}$, 분산이 $${v2}$ 이다. 이 $${N}$ 개의 변량 전체의 분산을 구하세요.`,
            answer: { type: 'num', value: V.value },
            steps: [
              `전체 평균 $=\\frac{${n1}\\times${m1}+${n2}\\times${m2}}{${N}}=${M}$`,
              '(분산) $=$ (변량의 제곱의 평균) $-$ (평균)$^2$ 이므로 (변량의 제곱의 합) $=$ (개수) $\\times$ {(분산) $+$ (평균)$^2$}',
              `첫째 묶음: $${n1}\\times(${v1}+${m1 * m1})=${Q1}$, 둘째 묶음: $${n2}\\times(${v2}+${m2 * m2})=${Q2}$`,
              `전체 분산 $=\\frac{${Q1}+${Q2}}{${N}}-${M}^2=${fr(Q1 + Q2, N).tex()}-${M * M}=${V.tex()}$`,
            ],
          };
        }
      },
    },
  ],
};

// ═════════════════════════ 최상위 유형 ═════════════════════════

function bisectorTrig(r: Rng) {
  const A = r.pick([60, 90, 120]);
  let b = 0,
    c = 0;
  do {
    b = r.int(2, 12);
    c = r.int(2, 12);
  } while (b === c);
  const half = A / 2;
  const SIN: Record<number, string> = { 30: '\\frac{1}{2}', 45: '\\frac{\\sqrt{2}}{2}', 60: '\\frac{\\sqrt{3}}{2}', 90: '1' };
  const sinA = A === 120 ? SIN[60] : SIN[A];
  const head = `$\\triangle ABC$ 에서 $${ov('AB')}=${c}$, $${ov('AC')}=${b}$, $${ang('A')}=${deg(A)}$ 이다. $${ang('A')}$ 의 이등분선이 $${ov('BC')}$ 와 만나는 점을 $D$ 라 할 때, $${ov('AD')}$ 의 길이`;
  const steps = [
    `$${ov('AD')}=x$ 라 하면 $\\triangle ABC=\\triangle ABD+\\triangle ADC$`,
    `$\\frac{1}{2}\\times${c}\\times${b}\\times\\sin${deg(A)}=\\frac{1}{2}\\times${c}\\times x\\times\\sin${deg(half)}+\\frac{1}{2}\\times${b}\\times x\\times\\sin${deg(half)}$`,
    A === 120 ? `$\\sin120^\\circ=\\sin(180^\\circ-60^\\circ)=\\sin60^\\circ=${sinA}$, $\\sin60^\\circ=${SIN[60]}$` : `$\\sin${deg(A)}=${sinA}$, $\\sin${deg(half)}=${SIN[half]}$`,
    `$${b * c}\\times${sinA}=${b + c}x\\times${SIN[half]}$`,
  ];
  if (A === 120) {
    const v = fr(b * c, b + c);
    return { q: `${head}를 구하세요.`, answer: { type: 'num' as const, value: v.value, display: 'frac' as const }, steps: [...steps, v.d === b + c ? `$x=${v.tex()}$` : `$x=\\frac{${b * c}}{${b + c}}=${v.tex()}$`] };
  }
  const rad = A === 60 ? 3 : 2;
  const ans = ks(b * c, rad, b + c);
  return {
    q: `${head}는?`,
    answer: mc(r, ans, [ks(b * c, rad, 2 * (b + c)), fr(b * c, b + c).tex(), ks(2 * b * c, rad, b + c), ks(b * c, 5 - rad, b + c)]),
    steps: [...steps, `$x=${ans}$`],
  };
}

function tan15(r: Rng) {
  const th = r.pick([15, 22.5, 75, 67.5]);
  const k = r.int(1, 8);
  const three = th === 15 || th === 75;
  const R = three ? '\\sqrt{3}' : '\\sqrt{2}';
  const T = (a: number, b: number) => (a > 0 ? termsTex([{ c: a, v: '' }, { c: b, v: R }]) : termsTex([{ c: b, v: R }, { c: a, v: '' }]));
  let ans: string;
  const wr: string[] = [];
  const steps: string[] = [];
  const Dang = three ? 30 : 45;
  if (th === 15 || th === 22.5) {
    // ∠B = th, AC = k → BC = k / tan(th)
    const big = three ? 2 * k : k; // AD (2k 또는 √2 k), DC
    ans = three ? T(2 * k, k) : termsTex([{ c: k, v: R }, { c: k, v: '' }]);
    wr.push(three ? T(2 * k, -k) : termsTex([{ c: k, v: R }, { c: -k, v: '' }]), three ? T(k, k) : termsTex([{ c: k, v: R }]), three ? T(2 * k, 2 * k) : termsTex([{ c: 2 * k, v: R }, { c: k, v: '' }]), termsTex([{ c: k, v: '\\sqrt{3}' }, { c: k, v: '' }]));
    steps.push(
      `변 $BC$ 위에 $${ang('ADC')}=${deg(Dang)}$ 인 점 $D$ 를 잡자.`,
      `외각의 성질로 $${ang('BAD')}=${deg(Dang)}-${deg(th)}=${deg(th)}=${ang('B')}$ 이므로 $\\triangle ABD$ 는 $${ov('DA')}=${ov('DB')}$ 인 이등변삼각형`,
      three
        ? `$\\triangle ADC$ 에서 $${ov('AD')}=\\frac{${k}}{\\sin30^\\circ}=${big}$, $${ov('DC')}=\\frac{${k}}{\\tan30^\\circ}=${termsTex([{ c: k, v: R }])}$`
        : `$\\triangle ADC$ 는 직각이등변삼각형이므로 $${ov('DC')}=${k}$, $${ov('AD')}=${termsTex([{ c: k, v: R }])}$`,
      `$${ov('BC')}=${ov('BD')}+${ov('DC')}=${ov('AD')}+${ov('DC')}=${ans}$`,
      `(참고: $\\tan${deg(th)}=\\frac{${k}}{${ov('BC')}}=${three ? '2-\\sqrt{3}' : '\\sqrt{2}-1'}$)`,
    );
  } else {
    // ∠B = th → ∠A = 90 - th, AC = k, BC = k·tan(90-th)
    const a = 90 - th;
    ans = three ? T(2 * k, -k) : termsTex([{ c: k, v: R }, { c: -k, v: '' }]);
    wr.push(three ? T(2 * k, k) : termsTex([{ c: k, v: R }, { c: k, v: '' }]), three ? T(k, -k) : termsTex([{ c: 2 * k, v: R }, { c: -k, v: '' }]), three ? T(-k, k) : termsTex([{ c: k, v: R }, { c: -2 * k, v: '' }]), three ? termsTex([{ c: k, v: R }]) : String(k));
    steps.push(
      `$${ang('BAC')}=90^\\circ-${deg(th)}=${deg(a)}$, $${ov('BC')}=x$ 라 하자.`,
      `변 $AC$ 위에 $${ang('BDC')}=${deg(Dang)}$ 인 점 $D$ 를 잡으면 외각의 성질로 $${ang('ABD')}=${deg(Dang)}-${deg(a)}=${deg(a)}$, 곧 $${ov('DA')}=${ov('DB')}$`,
      three
        ? `$\\triangle BDC$ 에서 $${ov('BD')}=\\frac{x}{\\sin30^\\circ}=2x$, $${ov('DC')}=\\frac{x}{\\tan30^\\circ}=\\sqrt{3}x$`
        : `$\\triangle BDC$ 는 직각이등변삼각형이므로 $${ov('DC')}=x$, $${ov('BD')}=\\sqrt{2}x$`,
      `$${ov('AC')}=${ov('AD')}+${ov('DC')}=${three ? '(2+\\sqrt{3})x' : '(\\sqrt{2}+1)x'}=${k}$`,
      `$x=\\frac{${k}}{${three ? '2+\\sqrt{3}' : '\\sqrt{2}+1'}}=${ans}$ (분모를 유리화)`,
    );
  }
  return {
    q: `$${ang('C')}=90^\\circ$ 인 직각삼각형 $ABC$ 에서 $${ang('B')}=${deg(th)}$, $${ov('AC')}=${k}$ 일 때, $${ov('BC')}$ 의 길이는?`,
    answer: mc(r, ans, wr),
    steps,
  };
}

function parallelChords(r: Rng) {
  const legsOf = new Map<number, number[]>();
  for (const [a, b, c] of triples(60)) {
    if (!legsOf.has(c)) legsOf.set(c, []);
    legsOf.get(c)!.push(a, b);
  }
  const Rs = [...legsOf.keys()].filter((c) => new Set(legsOf.get(c)).size >= 2 && c <= 30);
  const R = r.pick(Rs);
  const legs = [...new Set(legsOf.get(R)!)];
  const [x1, x2] = r.sample(legs, 2);
  const h1 = Math.round(Math.sqrt(R * R - x1 * x1)),
    h2 = Math.round(Math.sqrt(R * R - x2 * x2));
  const opp = r.chance(0.5);
  let H1: number, H2: number, X: number, d: number, eqR: string, solve: string;
  if (opp) {
    [H1, H2, X] = [h1, h2, x1];
    d = x1 + x2;
    eqR = `${H2}^2+(${d}-x)^2`;
    solve = `$${H1 * H1}+x^2=${H2 * H2}+${d * d}-${2 * d}x+x^2$ 에서 $${2 * d}x=${H2 * H2 + d * d - H1 * H1}$, $x=${X}$`;
  } else {
    const [xa, xb] = x1 < x2 ? [x1, x2] : [x2, x1];
    H1 = Math.round(Math.sqrt(R * R - xa * xa));
    H2 = Math.round(Math.sqrt(R * R - xb * xb));
    X = xa;
    d = xb - xa;
    eqR = `${H2}^2+(x+${d})^2`;
    solve = `$${H1 * H1}+x^2=${H2 * H2}+x^2+${2 * d}x+${d * d}$ 에서 $${2 * d}x=${H1 * H1 - H2 * H2 - d * d}$, $x=${X}$`;
  }
  return {
    q: `원 $O$ 에서 길이가 $${2 * H1}$ 인 현 $AB$ 와 길이가 $${2 * H2}$ 인 현 $CD$ 가 서로 평행하고, 두 현 사이의 거리는 $${d}$ 이다. ${opp ? '원의 중심 $O$ 가 두 현 사이에 있을' : '두 현이 원의 중심 $O$ 에 대하여 같은 쪽에 있을'} 때, 원 $O$ 의 반지름의 길이를 구하세요.`,
    answer: { type: 'num' as const, value: R },
    steps: [
      `중심 $O$ 에서 두 현에 내린 수선의 발을 $M$, $N$ 이라 하면 수선은 현을 이등분: $${ov('AM')}=${H1}$, $${ov('CN')}=${H2}$`,
      opp ? `$${ov('OM')}=x$ 라 하면 $O$ 가 두 현 사이에 있으므로 $${ov('ON')}=${d}-x$` : `$${ov('OM')}=x$ 라 하면 (긴 현이 중심에 더 가깝다) $${ov('ON')}=x+${d}$`,
      `반지름을 $r$ 라 하면 $r^2=${H1}^2+x^2=${eqR}$`,
      solve,
      `$r^2=${H1}^2+${X}^2=${R * R}$, $r=${R}$`,
    ],
  };
}

function secantAngles(r: Rng) {
  let p = 0,
    q = 0;
  do {
    q = r.int(60, 150);
    p = r.int(24, q - 20);
  } while ((p + q) % 2 !== 0);
  const x = (p + q) / 2,
    y = (q - p) / 2;
  const B = onCircle(-y),
    C = onCircle(y),
    A = onCircle(-y - (180 - q)),
    D = onCircle(y + (180 - q));
  const P = meet(A, B, D, C);
  const Q = meet(A, C, B, D);
  const fig = geo(
    { A, B, C, D, P, Q, O: [0, 0] },
    {
      w: 320,
      h: 210,
      circles: [{ c: 'O', r: 1 }],
      segs: [
        ['A', 'P'],
        ['D', 'P'],
        ['A', 'C'],
        ['B', 'D'],
      ],
      hide: ['O'],
    },
  );
  const askX = r.chance(0.5);
  return {
    q: `그림과 같이 원 위의 네 점 $A$, $B$, $C$, $D$ 에 대하여 두 직선 $AB$, $DC$ 의 교점을 $P$, 두 현 $AC$, $BD$ 의 교점을 $Q$ 라 하자. $${ang('APD')}=${deg(p)}$, $${ang('AQD')}=${deg(q)}$ 일 때, $${askX ? ang('ACD') : ang('BDC')}$ 의 크기를 구하세요.`,
    fig,
    answer: { type: 'num' as const, value: askX ? x : y, unit: '°' },
    steps: [
      `호 $AD$ 에 대한 원주각: $${ang('ABD')}=${ang('ACD')}=x^\\circ$, 호 $BC$ 에 대한 원주각: $${ang('BAC')}=${ang('BDC')}=y^\\circ$ 라 하자.`,
      `$\\triangle ABQ$ 에서 $${ang('AQD')}$ 는 외각이므로 $x+y=${q}$`,
      `$\\triangle PBD$ 에서 $${ang('PBD')}=180^\\circ-x^\\circ$, $${ang('PDB')}=y^\\circ$ 이므로 $${ang('P')}=180^\\circ-(180^\\circ-x^\\circ)-y^\\circ$, 곧 $x-y=${p}$`,
      `두 식을 연립하면 $x=${x}$, $y=${y}$`,
      `$${askX ? ang('ACD') : ang('BDC')}=${deg(askX ? x : y)}$`,
    ],
  };
}

function statTwoUnknown(r: Rng) {
  for (;;) {
    const k = r.pick([3, 4]);
    const N = k + 2;
    const m = r.int(5, 15);
    const ds = Array.from({ length: k }, () => r.int(-4, 4));
    const X = r.int(-6, 6);
    const Y = -ds.reduce((a, b) => a + b, 0) - X;
    if (X === Y || Math.abs(Y) > 7 || m + X <= 0 || m + Y <= 0) continue;
    const known = ds.map((d) => m + d);
    const sd2 = ds.reduce((a, d) => a + d * d, 0);
    const Qd = X * X + Y * Y;
    const v = fr(sd2 + Qd, N);
    const S = N * m - known.reduce((a, b) => a + b, 0); // x + y
    const s = S - 2 * m; // X + Y
    const XY = X * Y;
    const xy = (m + X) * (m + Y);
    const askProd = r.chance(0.6);
    const ans = askProd ? xy : Math.abs(X - Y);
    const vt = numTex(v.value);
    return {
      q: `$${N}$ 개의 변량 $${known.join(',\\ ')},\\ x,\\ y$ 의 평균이 $${m}$ 이고 분산이 $${vt}$ 일 때, $${askProd ? 'xy' : '|x-y|'}$ 의 값을 구하세요.`,
      answer: { type: 'num' as const, value: ans },
      steps: [
        `평균이 $${m}$ 이므로 $${known.join('+')}+x+y=${N * m}$, $x+y=${S}$`,
        `$x-${m}=X$, $y-${m}=Y$ 로 놓으면 $X+Y=${S}-${2 * m}=${s}$`,
        `알고 있는 변량의 편차는 ${ds.map((d) => `$${d}$`).join(', ')} 이고 그 제곱의 합은 $${sd2}$`,
        `분산이 $${vt}$ 이므로 $${sd2}+X^2+Y^2=${N}\\times${vt}=${sd2 + Qd}$, $X^2+Y^2=${Qd}$`,
        askProd ? `$2XY=(X+Y)^2-(X^2+Y^2)=${s * s}-${Qd}=${2 * XY}$, $XY=${XY}$` : `$(X-Y)^2=2(X^2+Y^2)-(X+Y)^2=${2 * Qd}-${s * s}=${(X - Y) ** 2}$`,
        askProd ? `$xy=(X+${m})(Y+${m})=XY+${m}(X+Y)+${m * m}=${XY}${sgn(m * s)}+${m * m}=${xy}$` : `$|x-y|=|X-Y|=${Math.abs(X - Y)}$`,
      ],
    };
  }
}

function statCorrect(r: Rng) {
  const v = r.int(0, 2);
  if (v === 0) {
    const n = r.pick([5, 6, 8, 9, 10, 12]),
      k = r.int(1, 4);
    const m = r.int(5, 20),
      vv = r.int(2, 12);
    const ans = fr(n * vv, n + k);
    return {
      q: `변량 $${n}$ 개의 평균이 $${m}$, 분산이 $${vv}$ 이다. 여기에 값이 $${m}$ 인 변량 $${k}$ 개를 더 추가했을 때, 전체 $${n + k}$ 개의 변량의 분산을 구하세요.`,
      answer: { type: 'num' as const, value: ans.value },
      steps: [
        `추가한 변량이 모두 평균 $${m}$ ${jo(String(m), '과', '와')} 같으므로 전체 평균은 그대로 $${m}$`,
        `원래 (편차)$^2$ 의 합은 $${n}\\times${vv}=${n * vv}$`,
        `추가한 변량의 편차는 모두 $0$ 이므로 (편차)$^2$ 의 합은 그대로 $${n * vv}$`,
        `변량의 개수만 $${n + k}$ ${jo(String(n + k), '으로', '로', true)} 늘어난다.`,
        `분산 $=\\frac{${n * vv}}{${n + k}}${tail(ans, n + k)}$`,
      ],
    };
  }
  if (v === 1) {
    const n = r.pick([4, 6, 8, 10]),
      d = r.int(1, 6);
    const m = r.int(10, 30),
      vv = r.int(2, 10);
    const ans = fr(n * vv + 2 * d * d, n + 2);
    return {
      q: `변량 $${n}$ 개의 평균이 $${m}$, 분산이 $${vv}$ 이다. 여기에 두 변량 $${m - d}$, $${m + d}$ ${jo(String(m + d), '을', '를')} 추가했을 때, 전체 $${n + 2}$ 개의 변량의 분산을 구하세요.`,
      answer: { type: 'num' as const, value: ans.value },
      steps: [
        `추가한 두 변량의 합은 $${2 * m}$ 이므로 전체 평균은 그대로 $${m}$`,
        `원래 (편차)$^2$ 의 합은 $${n}\\times${vv}=${n * vv}$`,
        `추가한 두 변량의 편차는 $${-d}$, $${d}$ 이므로 (편차)$^2$ 의 합이 $${2 * d * d}$ 늘어난다.`,
        `전체 (편차)$^2$ 의 합은 $${n * vv + 2 * d * d}$`,
        `분산 $=\\frac{${n * vv + 2 * d * d}}{${n + 2}}${tail(ans, n + 2)}$`,
      ],
    };
  }
  for (;;) {
    const n = r.pick([5, 8, 10]);
    const m = r.int(10, 30),
      vv = r.int(4, 16);
    const da = r.int(-6, 6),
      db = r.int(-6, 6),
      ea = r.int(-6, 6);
    const eb = da + db - ea; // 합이 같게
    if (Math.abs(eb) > 6 || (ea === da && eb === db) || (ea === db && eb === da)) continue;
    const change = da * da + db * db - ea * ea - eb * eb;
    const newSum = n * vv + change;
    if (newSum <= 0) continue;
    const ans = fr(newSum, n);
    const [a, b, a2, b2] = [m + da, m + db, m + ea, m + eb];
    if (a <= 0 || b <= 0 || a2 <= 0 || b2 <= 0) continue;
    return {
      q: `변량 $${n}$ 개의 평균을 구했더니 $${m}$, 분산은 $${vv}$ 이었다. 그런데 두 변량 $${a}$, $${b}$ ${jo(String(b), '을', '를')} 각각 $${a2}$, $${b2}$ ${jo(String(b2), '으로', '로', true)} 잘못 보고 계산한 것이었다. 바르게 계산한 분산을 구하세요.`,
      answer: { type: 'num' as const, value: ans.value },
      steps: [
        `$${a}+${b}=${a2}+${b2}=${a + b}$ 이므로 바른 평균도 $${m}$`,
        `잘못 계산한 (편차)$^2$ 의 합: $${n}\\times${vv}=${n * vv}$`,
        `잘못 본 값의 편차 $${ea}$, $${eb}$ → (편차)$^2$ 의 합 $${ea * ea + eb * eb}$`,
        `바른 값의 편차 $${da}$, $${db}$ → (편차)$^2$ 의 합 $${da * da + db * db}$`,
        `바른 (편차)$^2$ 의 합 $=${n * vv}-${ea * ea + eb * eb}+${da * da + db * db}=${newSum}$`,
        `바른 분산 $=\\frac{${newSum}}{${n}}${tail(ans, n)}$`,
      ],
    };
  }
}

export const M3B_TOP: Record<string, Skill[]> = {
  'm3b-1': [
    { id: 'top-bisector-trig', title: '넓이로 각의 이등분선의 길이 구하기', gen: (r) => bisectorTrig(r) },
    { id: 'top-tan15', title: '보조선으로 15°·22.5° 의 삼각비 구하기', gen: (r) => tan15(r) },
  ],
  'm3b-2': [
    { id: 'top-parallel-chords', title: '평행한 두 현으로 반지름 구하기', gen: (r) => parallelChords(r) },
    { id: 'top-secant-angles', title: '원 밖·원 안의 교점이 만드는 각', gen: (r) => secantAngles(r) },
  ],
  'm3b-3': [
    { id: 'top-stat-two-unknown', title: '평균과 분산으로 모르는 두 변량 구하기', gen: (r) => statTwoUnknown(r) },
    { id: 'top-stat-correct', title: '변량 추가·잘못 본 변량과 분산', gen: (r) => statCorrect(r) },
  ],
};
