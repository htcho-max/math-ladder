// 중2-2: 삼각형의 성질, 사각형의 성질, 도형의 닮음, 피타고라스 정리, 확률
import type { ContentMap, ProblemDraft } from '../../core/types';
import type { Rng } from '../../core/rng';
import { numChoices, termsTex, sqrtTex } from '../../core/tex';
import { F } from '../../core/frac';
import { nCr, nPr, factorial, gcd } from '../../core/nt';
import { NAMES, ga, neun, nm, mc, tc, geo, triByAngles, triBySides, triples, meet, lerp, circum, incircle, foot, onCircle } from './util';

const deg = (x: number) => `${x}^\\circ`;
const ov = (s: string) => `\\overline{${s}}`;
const ang = (s: string) => `\\angle ${s}`;
/** 음수만 괄호 */
const pn = (x: number) => (x < 0 ? `(${x})` : `${x}`);

const TRIPLES = triples(60);
const PRIM: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [20, 21, 29],
  [9, 40, 41],
];
function triple(r: Rng, max: number): [number, number, number] {
  const c = TRIPLES.filter((t) => t[2] <= max);
  return r.pick(c);
}

/** 이등변삼각형 그림 (꼭지각 a) */
function isoFig(a: number, extra?: { D?: [number, number]; seg?: [string, string][] }, labels: [string, string, string, string][] = []) {
  const b = (180 - a) / 2;
  const t = triByAngles(b, b, 10);
  const pts: Record<string, [number, number]> = { ...t };
  if (extra?.D) pts.D = extra.D;
  return geo(pts, {
    segs: [['A', 'B'], ['B', 'C'], ['C', 'A'], ...(extra?.seg ?? [])],
    angles: labels,
    w: 240,
    h: 190,
  });
}

export const m2b: ContentMap = {
  // ───────────────────────── 삼각형의 성질 ─────────────────────────
  'm2b-1': {
    concepts: [
      {
        title: '이등변삼각형의 성질',
        body: '두 변의 길이가 같은 삼각형을 **이등변삼각형**이라 한다. $\\overline{AB}=\\overline{AC}$ 일 때\n- 두 밑각의 크기가 같다: $\\angle B=\\angle C$\n- 꼭지각의 이등분선은 밑변을 수직이등분한다.\n- 역으로 두 내각의 크기가 같은 삼각형은 이등변삼각형이다.',
        example: { q: '$\\overline{AB}=\\overline{AC}$, $\\angle A=40^\\circ$ 일 때 $\\angle B$ 는?', a: '$(180^\\circ-40^\\circ)\\div 2=70^\\circ$' },
      },
      {
        title: '직각삼각형의 합동 조건',
        body: '두 직각삼각형은 다음 중 하나를 만족하면 합동이다. (중1의 SSS·SAS·ASA 합동에서 나온 조건)\n- **RHA 합동**: 빗변의 길이와 한 예각의 크기가 각각 같을 때\n- **RHS 합동**: 빗변의 길이와 다른 한 변의 길이가 각각 같을 때\n각의 이등분선 위의 한 점에서 두 변까지의 거리는 같다 (RHA).',
      },
      {
        title: '삼각형의 외심',
        body: '세 변의 **수직이등분선**의 교점 $O$ 를 외심이라 한다.\n- $\\overline{OA}=\\overline{OB}=\\overline{OC}$ (외접원의 반지름)\n- 직각삼각형의 외심은 빗변의 중점, 둔각삼각형의 외심은 삼각형의 외부에 있다.\n- $\\angle OAB+\\angle OBC+\\angle OCA=90^\\circ$, $\\angle BOC=2\\angle A$',
      },
      {
        title: '삼각형의 내심',
        body: '세 내각의 **이등분선**의 교점 $I$ 를 내심이라 한다.\n- 내심에서 세 변까지의 거리는 같다 (내접원의 반지름 $r$).\n- $\\angle IAB+\\angle IBC+\\angle ICA=90^\\circ$, $\\angle BIC=90^\\circ+\\frac{1}{2}\\angle A$\n- 넓이: $S=\\frac{1}{2}r(a+b+c)$',
        example: { q: '세 변이 $6,8,10$ 인 직각삼각형의 내접원의 반지름은?', a: '$24=\\frac{1}{2}r(6+8+10)$ 에서 $r=2$' },
      },
    ],
    skills: [
      {
        id: 'isosceles',
        title: '이등변삼각형의 각',
        gen(r, level): ProblemDraft {
          if (level === 1) {
            const a = r.int(10, 70) * 2;
            const b = (180 - a) / 2;
            return {
              q: `$${ov('AB')}=${ov('AC')}$ 인 이등변삼각형 $ABC$ 에서 $${ang('A')}=${deg(a)}$ 일 때, $${ang('B')}$ 의 크기를 구하세요.`,
              fig: isoFig(a, undefined, [['A', 'B', 'C', `${a}°`]]),
              answer: { type: 'num', value: b, unit: '°' },
              steps: [`두 밑각의 크기가 같으므로 $${ang('B')}=${ang('C')}$`, `$${ang('B')}=(180^\\circ-${deg(a)})\\div 2=${deg(b)}$`],
            };
          }
          if (level === 2) {
            if (r.chance(0.5)) {
              const b = r.int(25, 80);
              const a = 180 - 2 * b;
              return {
                q: `$${ov('AB')}=${ov('AC')}$ 인 이등변삼각형 $ABC$ 에서 $${ang('B')}=${deg(b)}$ 일 때, $${ang('A')}$ 의 크기는?`,
                answer: numChoices(r, a, [b, 180 - b, 90 - b, 2 * b]),
                steps: [`$${ang('C')}=${ang('B')}=${deg(b)}$`, `$${ang('A')}=180^\\circ-2\\times ${deg(b)}=${deg(a)}$`],
              };
            }
            const e = r.int(48, 82) * 2;
            const c = 180 - e;
            const a = 180 - 2 * c;
            return {
              q: `$${ov('AB')}=${ov('AC')}$ 인 이등변삼각형 $ABC$ 에서 $${ang('C')}$ 의 외각의 크기가 $${deg(e)}$ 일 때, $${ang('A')}$ 의 크기를 구하세요.`,
              answer: { type: 'num', value: a, unit: '°' },
              steps: [`$${ang('C')}=180^\\circ-${deg(e)}=${deg(c)}$`, `$${ang('B')}=${ang('C')}=${deg(c)}$ 이므로 $${ang('A')}=180^\\circ-2\\times${deg(c)}=${deg(a)}$`],
            };
          }
          const a = r.pick([20, 24, 28, 32, 36, 40, 44, 48, 52]);
          const b = (180 - a) / 2;
          const ans = b - a;
          const t = triByAngles(b, b, 10);
          const variant = r.chance(0.5);
          const theta = variant ? a : b - a; // ∠DBC
          const D = meet(t.B, [Math.cos((theta * Math.PI) / 180), Math.sin((theta * Math.PI) / 180)], t.A, t.C);
          const fig = geo({ ...t, D }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'A'], ['B', 'D']], angles: [['A', 'B', 'C', `${a}°`]] });
          if (variant) {
            return {
              q: `$${ov('AB')}=${ov('AC')}$ 인 이등변삼각형 $ABC$ 의 변 $AC$ 위에 $${ov('BC')}=${ov('BD')}$ 가 되도록 점 $D$ 를 잡았다. $${ang('A')}=${deg(a)}$ 일 때, $${ang('ABD')}$ 의 크기를 구하세요.`,
              fig,
              answer: { type: 'num', value: ans, unit: '°' },
              steps: [
                `$${ang('ABC')}=${ang('C')}=(180^\\circ-${deg(a)})\\div2=${deg(b)}$`,
                `$${ov('BC')}=${ov('BD')}$ 이므로 $${ang('BDC')}=${ang('C')}=${deg(b)}$, $${ang('DBC')}=180^\\circ-2\\times${deg(b)}=${deg(a)}$`,
                `$${ang('ABD')}=${deg(b)}-${deg(a)}=${deg(ans)}$`,
              ],
            };
          }
          return {
            q: `$${ov('AB')}=${ov('AC')}$ 인 이등변삼각형 $ABC$ 의 변 $AC$ 위에 $${ov('AD')}=${ov('BD')}$ 가 되도록 점 $D$ 를 잡았다. $${ang('A')}=${deg(a)}$ 일 때, $${ang('DBC')}$ 의 크기를 구하세요.`,
            fig,
            answer: { type: 'num', value: ans, unit: '°' },
            steps: [
              `$${ang('ABC')}=(180^\\circ-${deg(a)})\\div2=${deg(b)}$`,
              `$${ov('AD')}=${ov('BD')}$ 이므로 $${ang('ABD')}=${ang('A')}=${deg(a)}$`,
              `$${ang('DBC')}=${deg(b)}-${deg(a)}=${deg(ans)}$`,
            ],
          };
        },
      },
      {
        id: 'right-congruence',
        title: '직각삼각형의 합동',
        gen(r, level) {
          if (level === 1) {
            const h = r.int(5, 15);
            const rha = r.chance(0.5);
            const x = r.int(20, 70);
            const y = r.int(2, h - 1);
            const cond = rha ? `$${ang('B')}=${ang('E')}=${deg(x)}$` : `$${ov('BC')}=${ov('EF')}=${y}\\,\\text{cm}$`;
            const right = rha ? 'RHA 합동' : 'RHS 합동';
            return {
              q: `$${ang('C')}=${ang('F')}=90^\\circ$ 인 두 직각삼각형 $ABC$, $DEF$ 에서 $${ov('AB')}=${ov('DE')}=${h}\\,\\text{cm}$, ${cond} 일 때, 두 삼각형은 어떤 조건으로 합동인가요?`,
              answer: tc(r, right, [rha ? 'RHS 합동' : 'RHA 합동', 'SAS 합동', 'ASA 합동', 'SSS 합동']),
              steps: [`빗변 $${ov('AB')}=${ov('DE')}$ 이고, ${rha ? '한 예각의 크기' : '다른 한 변의 길이'}가 같으므로 ${right}입니다.`],
            };
          }
          if (level === 2) {
            const p = r.int(3, 12);
            const t = r.int(15, 40);
            const fig = (() => {
              const O: [number, number] = [0, 0];
              const X = onCircle(0, 10);
              const Y = onCircle(2 * t, 10);
              const Pp = onCircle(t, 7);
              const A = foot(Pp, O, X);
              const B = foot(Pp, O, Y);
              return geo({ O, X, Y, P: Pp, A, B }, { segs: [['O', 'X'], ['O', 'Y'], ['O', 'P'], ['P', 'A'], ['P', 'B']], right: [['A', 'O', 'P'], ['B', 'O', 'P']], hide: ['X', 'Y'], w: 240, h: 170 });
            })();
            return {
              q: `$${ang('XOY')}$ 의 이등분선 위의 점 $P$ 에서 두 변 $OX$, $OY$ 에 내린 수선의 발을 각각 $A$, $B$ 라 하자. $${ov('PA')}=${p}\\,\\text{cm}$, $${ang('AOP')}=${deg(t)}$ 일 때, $${ov('PB')}$ 의 길이와 $${ang('BPO')}$ 의 크기를 구하세요.`,
              fig,
              answer: { type: 'fields', fields: [{ label: 'PB', value: p, unit: 'cm' }, { label: '∠BPO', value: 90 - t, unit: '°' }] },
              steps: [`$\\triangle AOP\\equiv\\triangle BOP$ (RHA 합동) 이므로 $${ov('PB')}=${ov('PA')}=${p}\\,\\text{cm}$`, `$${ang('BOP')}=${deg(t)}$ 이므로 $${ang('BPO')}=90^\\circ-${deg(t)}=${deg(90 - t)}$`],
            };
          }
          // L3: ∠A 의 이등분선, 넓이
          // 실제로 존재하는 직각삼각형에서 계산 (CD = BC·AC/(AC+AB), 각의 이등분선 성질)
          const RT: [number, number, number][] = [
            [6, 8, 10],
            [12, 16, 20],
            [18, 24, 30],
            [24, 32, 40],
            [15, 36, 39],
            [60, 25, 65],
            [60, 32, 68],
          ];
          const [acL, bcL, abVal] = r.pick(RT);
          const cdVal = (bcL * acL) / (acL + abVal);
          const ar = (abVal * cdVal) / 2;
          const A: [number, number] = [0, acL];
          const C: [number, number] = [0, 0];
          const B: [number, number] = [bcL, 0];
          const D: [number, number] = [cdVal, 0];
          const E = foot(D, A, B);
          return {
            q: `$${ang('C')}=90^\\circ$ 인 직각삼각형 $ABC$ 에서 $${ang('A')}$ 의 이등분선이 $${ov('BC')}$ 와 만나는 점을 $D$ 라 하자. $${ov('AB')}=${abVal}\\,\\text{cm}$, $${ov('CD')}=${cdVal}\\,\\text{cm}$ 일 때, $\\triangle ABD$ 의 넓이를 구하세요.`,
            fig: geo({ A, B, C, D, E }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'A'], ['A', 'D']], dashed: [['D', 'E']], right: [['C', 'A', 'B'], ['E', 'D', 'B']], w: 240, h: 180 }),
            answer: { type: 'num', value: ar, unit: 'cm²' },
            steps: [
              `점 $D$ 에서 $${ov('AB')}$ 에 수선 $${ov('DE')}$ 를 그으면 $\\triangle ACD\\equiv\\triangle AED$ (RHA 합동)`,
              `$${ov('DE')}=${ov('CD')}=${cdVal}\\,\\text{cm}$`,
              `$\\triangle ABD=\\frac{1}{2}\\times${abVal}\\times${cdVal}=${ar}\\,(\\text{cm}^2)$`,
            ],
            hint: '각의 이등분선 위의 점에서 두 변까지의 거리는 같아요.',
          };
        },
      },
      {
        id: 'circumcenter',
        title: '삼각형의 외심',
        gen(r, level) {
          const B0 = r.int(50, 75);
          const C0 = r.int(50, 75);
          const t = triByAngles(B0, C0, 10);
          const O = circum(t.A, t.B, t.C);
          const R = Math.hypot(t.A[0] - O[0], t.A[1] - O[1]);
          const fig = (labels: [string, string, string, string][]) =>
            geo({ ...t, O }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'A'], ['O', 'A'], ['O', 'B'], ['O', 'C']], circles: [{ c: 'O', r: R }], angles: labels, dots: ['O'], w: 230, h: 220 });
          if (level === 1) {
            if (r.chance(0.5)) {
              const [a, b, c] = triple(r, 50);
              const A: [number, number] = [0, a];
              const Bp: [number, number] = [b, 0];
              const C: [number, number] = [0, 0];
              const M = lerp(A, Bp, 0.5);
              return {
                q: `$${ang('C')}=90^\\circ$ 인 직각삼각형 $ABC$ 에서 $${ov('AB')}=${c}\\,\\text{cm}$ 일 때, 외접원의 반지름의 길이를 구하세요.`,
                fig: geo({ A, B: Bp, C, O: M }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'A'], ['O', 'C']], right: [['C', 'A', 'B']], circles: [{ c: 'O', r: c / 2 }], dots: ['O'], w: 220, h: 200 }),
                answer: { type: 'num', value: c / 2, unit: 'cm' },
                steps: ['직각삼각형의 외심은 빗변의 중점입니다.', `반지름 $=${c}\\div2=${new F(c, 2).tex()}\\,\\text{cm}$`],
              };
            }
            const k = r.int(3, 15);
            return {
              q: `점 $O$ 가 $\\triangle ABC$ 의 외심이고 $${ov('OA')}=${k}\\,\\text{cm}$ 일 때, $${ov('OB')}+${ov('OC')}$ 의 값을 구하세요.`,
              fig: fig([]),
              answer: { type: 'num', value: 2 * k, unit: 'cm' },
              steps: [`외심에서 세 꼭짓점까지의 거리는 같으므로 $${ov('OA')}=${ov('OB')}=${ov('OC')}=${k}$`, `$${ov('OB')}+${ov('OC')}=${2 * k}\\,\\text{cm}$`],
            };
          }
          if (level === 2) {
            const x = r.int(12, 40);
            const y = r.int(12, 75 - x);
            const z = 90 - x - y;
            return {
              q: `점 $O$ 가 $\\triangle ABC$ 의 외심이고 $${ang('OAB')}=${deg(x)}$, $${ang('OBC')}=${deg(y)}$ 일 때, $${ang('OCA')}$ 의 크기를 구하세요.`,
              fig: fig([]),
              answer: { type: 'num', value: z, unit: '°' },
              steps: [`$${ang('OAB')}+${ang('OBC')}+${ang('OCA')}=90^\\circ$`, `$${ang('OCA')}=90^\\circ-${deg(x)}-${deg(y)}=${deg(z)}$`],
            };
          }
          if (r.chance(0.5)) {
            const y = r.int(15, 45);
            const a = 90 - y;
            return {
              q: `점 $O$ 가 $\\triangle ABC$ 의 외심이고 $${ang('OBC')}=${deg(y)}$ 일 때, $${ang('A')}$ 의 크기는? (단, 점 $O$ 는 $\\triangle ABC$ 의 내부에 있다.)`,
              fig: fig([]),
              answer: numChoices(r, a, [2 * y, 180 - 2 * y, 180 - y, y]),
              steps: [`$${ov('OB')}=${ov('OC')}$ 이므로 $${ang('OCB')}=${deg(y)}$, $${ang('BOC')}=180^\\circ-${2 * y}^\\circ=${deg(180 - 2 * y)}$`, `$${ang('A')}=\\frac{1}{2}${ang('BOC')}=${deg(a)}$`],
            };
          }
          const a = r.int(40, 80);
          const y = 90 - a;
          return {
            q: `점 $O$ 가 $\\triangle ABC$ 의 외심이고 $${ang('BAC')}=${deg(a)}$ 일 때, $${ang('OBC')}$ 의 크기를 구하세요.`,
            fig: fig([]),
            answer: { type: 'num', value: y, unit: '°' },
            steps: [`$${ang('BOC')}=2${ang('A')}=${deg(2 * a)}$`, `$\\triangle OBC$ 는 이등변삼각형이므로 $${ang('OBC')}=(180^\\circ-${deg(2 * a)})\\div2=${deg(y)}$`],
          };
        },
      },
      {
        id: 'incenter',
        title: '삼각형의 내심',
        gen(r, level) {
          const B0 = r.int(45, 80);
          const C0 = r.int(45, 80);
          const t = triByAngles(B0, C0, 10);
          const { I, r: rr } = incircle(t.A, t.B, t.C);
          const fig = geo({ ...t, I }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'A'], ['I', 'A'], ['I', 'B'], ['I', 'C']], circles: [{ c: 'I', r: rr }], dots: ['I'], w: 240, h: 200 });
          if (level === 1) {
            const a = r.int(15, 50) * 2;
            const ans = 90 + a / 2;
            return {
              q: `점 $I$ 가 $\\triangle ABC$ 의 내심이고 $${ang('A')}=${deg(a)}$ 일 때, $${ang('BIC')}$ 의 크기를 구하세요.`,
              fig,
              answer: { type: 'num', value: ans, unit: '°' },
              steps: [`$${ang('BIC')}=90^\\circ+\\frac{1}{2}${ang('A')}$`, `$=90^\\circ+${deg(a / 2)}=${deg(ans)}$`],
            };
          }
          if (level === 2) {
            if (r.chance(0.5)) {
              const x = r.int(12, 40);
              const y = r.int(12, 75 - x);
              const z = 90 - x - y;
              return {
                q: `점 $I$ 가 $\\triangle ABC$ 의 내심이고 $${ang('IAB')}=${deg(x)}$, $${ang('IBC')}=${deg(y)}$ 일 때, $${ang('ICA')}$ 의 크기는?`,
                fig,
                answer: numChoices(r, z, [90 - x, 180 - x - y, x + y, 2 * z]),
                steps: [`$${ang('IAB')}+${ang('IBC')}+${ang('ICA')}=90^\\circ$`, `$${ang('ICA')}=90^\\circ-${deg(x)}-${deg(y)}=${deg(z)}$`],
              };
            }
            const a = r.int(15, 55) * 2;
            const bic = 90 + a / 2;
            return {
              q: `점 $I$ 가 $\\triangle ABC$ 의 내심이고 $${ang('BIC')}=${deg(bic)}$ 일 때, $${ang('A')}$ 의 크기를 구하세요.`,
              fig,
              answer: { type: 'num', value: a, unit: '°' },
              steps: [`$90^\\circ+\\frac{1}{2}${ang('A')}=${deg(bic)}$`, `$\\frac{1}{2}${ang('A')}=${deg(bic - 90)}$ 이므로 $${ang('A')}=${deg(a)}$`],
            };
          }
          if (r.chance(0.5)) {
            const [a, b, c] = triple(r, 41);
            const rad = (a + b - c) / 2;
            const A: [number, number] = [0, a];
            const C: [number, number] = [0, 0];
            const Bp: [number, number] = [b, 0];
            const inc = incircle(A, Bp, C);
            return {
              q: `$${ang('C')}=90^\\circ$ 인 직각삼각형 $ABC$ 에서 $${ov('AC')}=${a}\\,\\text{cm}$, $${ov('BC')}=${b}\\,\\text{cm}$, $${ov('AB')}=${c}\\,\\text{cm}$ 일 때, 내접원의 반지름의 길이를 구하세요.`,
              fig: geo({ A, B: Bp, C, I: inc.I }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'A']], right: [['C', 'A', 'B']], circles: [{ c: 'I', r: inc.r }], dots: ['I'], w: 220, h: 200 }),
              answer: { type: 'num', value: rad, unit: 'cm' },
              steps: [
                `넓이 $=\\frac{1}{2}\\times${a}\\times${b}=${(a * b) / 2}$`,
                `$\\frac{1}{2}r(${a}+${b}+${c})=${(a * b) / 2}$ 에서 $${(a + b + c) / 2}r=${(a * b) / 2}$`,
                `$r=${new F(a * b, a + b + c).tex()}\\,\\text{cm}$`,
              ],
            };
          }
          // 둘레 ≥ 6√3·r 이어야 삼각형이 존재함 (정삼각형일 때 r 최대)
          const rad = r.int(1, 4);
          const lo = Math.ceil((3 * Math.sqrt(3) * rad) + 0.01);
          const per = r.int(lo, lo + 10) * 2;
          const S = (rad * per) / 2;
          return {
            q: `둘레의 길이가 $${per}\\,\\text{cm}$ 인 $\\triangle ABC$ 의 내접원의 반지름의 길이가 $${rad}\\,\\text{cm}$ 일 때, $\\triangle ABC$ 의 넓이를 구하세요.`,
            fig,
            answer: { type: 'num', value: S, unit: 'cm²' },
            steps: [`$S=\\frac{1}{2}r(a+b+c)$`, `$S=\\frac{1}{2}\\times${rad}\\times${per}=${S}\\,(\\text{cm}^2)$`],
          };
        },
      },
      {
        id: 'centers-concept',
        title: '외심과 내심의 성질',
        gen(r, level) {
          const T = [
            '외심에서 세 꼭짓점에 이르는 거리는 같다.',
            '내심에서 세 변에 이르는 거리는 같다.',
            '외심은 세 변의 수직이등분선의 교점이다.',
            '내심은 세 내각의 이등분선의 교점이다.',
            '직각삼각형의 외심은 빗변의 중점이다.',
            '둔각삼각형의 외심은 삼각형의 외부에 있다.',
            '정삼각형의 외심과 내심은 일치한다.',
            '이등변삼각형의 꼭지각의 이등분선은 밑변을 수직이등분한다.',
          ];
          const W = [
            '외심에서 세 변에 이르는 거리는 같다.',
            '내심에서 세 꼭짓점에 이르는 거리는 같다.',
            '외심은 세 내각의 이등분선의 교점이다.',
            '내심은 세 변의 수직이등분선의 교점이다.',
            '둔각삼각형의 외심은 삼각형의 내부에 있다.',
            '직각삼각형의 내심은 빗변의 중점이다.',
            '모든 삼각형의 외심은 삼각형의 내부에 있다.',
            '예각삼각형의 외심은 삼각형의 외부에 있다.',
          ];
          if (level === 1) {
            const c = r.pick(T);
            return { q: '다음 중 옳은 것은?', answer: tc(r, c, r.sample(W, 4)), steps: [c, '외심은 꼭짓점까지, 내심은 변까지의 거리가 같습니다.'] };
          }
          if (level === 2) {
            const c = r.pick(W);
            return { q: '다음 중 옳지 **않은** 것은?', answer: tc(r, c, r.sample(T, 4)), steps: [`'${c}' 는 틀린 설명입니다.`, '외심은 꼭짓점까지, 내심은 변까지의 거리가 같습니다.'] };
          }
          // 내접원과 접선의 길이
          let a = 0,
            b = 0,
            c = 0;
          for (let i = 0; i < 100; i++) {
            a = r.int(6, 16);
            b = r.int(6, 16);
            c = r.int(6, 16);
            if ((a + b + c) % 2 === 0 && a + b > c && b + c > a && c + a > b && new Set([a, b, c]).size === 3) break;
          }
          const s = (a + b + c) / 2;
          const t = triBySides(a, b, c);
          const inc = incircle(t.A, t.B, t.C);
          const D = foot(inc.I, t.A, t.B);
          const E = foot(inc.I, t.B, t.C);
          const Fp = foot(inc.I, t.C, t.A);
          return {
            q: `$\\triangle ABC$ 의 내접원이 세 변 $AB$, $BC$, $CA$ 와 만나는 점을 각각 $D$, $E$, $F$ 라 하자. $${ov('AB')}=${c}$, $${ov('BC')}=${a}$, $${ov('CA')}=${b}$ 일 때, $${ov('AD')}$ 의 길이를 구하세요.`,
            fig: geo({ ...t, I: inc.I, D, E, F: Fp }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'A']], circles: [{ c: 'I', r: inc.r }], dots: ['I', 'D', 'E', 'F'], w: 240, h: 200 }),
            answer: { type: 'num', value: s - a },
            steps: [
              `원 밖의 한 점에서 그은 두 접선의 길이는 같으므로 $${ov('AD')}=${ov('AF')}=x$ 라 하면 $${ov('BD')}=${ov('BE')}=${c}-x$, $${ov('CF')}=${ov('CE')}=${b}-x$`,
              `$${ov('BC')}=(${c}-x)+(${b}-x)=${a}$`,
              `$2x=${b + c - a}$, $x=${s - a}$`,
            ],
          };
        },
      },
    ],
  },

  // ───────────────────────── 사각형의 성질 ─────────────────────────
  'm2b-2': {
    concepts: [
      {
        title: '평행사변형의 성질',
        body: '두 쌍의 대변이 각각 평행한 사각형을 **평행사변형**이라 한다.\n- 두 쌍의 대변의 길이가 각각 같다.\n- 두 쌍의 대각의 크기가 각각 같다. (이웃한 두 각의 합은 $180^\\circ$)\n- 두 대각선은 서로를 이등분한다.',
      },
      {
        title: '평행사변형이 되는 조건',
        body: '다음 중 하나를 만족하면 평행사변형이다.\n- 두 쌍의 대변이 각각 평행 / 두 쌍의 대변의 길이가 각각 같다\n- 두 쌍의 대각의 크기가 각각 같다\n- 두 대각선이 서로를 이등분한다\n- **한 쌍의 대변이 평행하고 그 길이가 같다**',
      },
      {
        title: '여러 가지 사각형',
        body: '- 직사각형: 네 각이 직각, 두 대각선의 길이가 같고 서로 이등분\n- 마름모: 네 변의 길이가 같음, 두 대각선이 서로 수직이등분\n- 정사각형: 직사각형이면서 마름모\n- 등변사다리꼴: 밑각의 크기가 같은 사다리꼴, 두 대각선의 길이가 같음',
        example: { q: '평행사변형에서 두 대각선이 수직이면?', a: '마름모' },
      },
      {
        title: '평행선과 넓이',
        body: '$l\\parallel m$ 일 때 밑변이 같은 두 삼각형은 높이가 같으므로 넓이가 같다.\n- 사다리꼴 $ABCD$ ($\\overline{AD}\\parallel\\overline{BC}$) 에서 $\\triangle ABC=\\triangle DBC$, $\\triangle ABO=\\triangle DCO$\n- 높이가 같은 두 삼각형의 넓이의 비는 밑변의 길이의 비와 같다.',
      },
    ],
    skills: [
      {
        id: 'para-angle',
        title: '평행사변형의 각',
        gen(r, level) {
          const paraFig = (b: number, AB: number, AD: number, E?: number) => {
            const B: [number, number] = [0, 0];
            const C: [number, number] = [AD, 0];
            const A = onCircle(b, AB);
            const D: [number, number] = [A[0] + AD, A[1]];
            const pts: Record<string, [number, number]> = { A, B, C, D };
            const segs: [string, string][] = [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A']];
            if (E !== undefined) {
              pts.E = [E, 0];
              segs.push(['A', 'E']);
            }
            return geo(pts, { segs, w: 260, h: 160 });
          };
          if (level === 1) {
            const a = r.int(50, 130);
            if (a === 90) return this.gen(r, level);
            return {
              q: `평행사변형 $ABCD$ 에서 $${ang('A')}=${deg(a)}$ 일 때, $${ang('B')}$, $${ang('C')}$ 의 크기를 구하세요.`,
              fig: paraFig(180 - a, 5, 8),
              answer: { type: 'fields', fields: [{ label: '∠B', value: 180 - a, unit: '°' }, { label: '∠C', value: a, unit: '°' }] },
              steps: [`이웃한 두 각의 합은 $180^\\circ$: $${ang('B')}=180^\\circ-${deg(a)}=${deg(180 - a)}$`, `대각의 크기는 같으므로 $${ang('C')}=${ang('A')}=${deg(a)}$`],
            };
          }
          const ab = r.int(4, 10);
          const ad = ab + r.int(2, 7);
          const b = r.int(25, 40) * 2;
          const fig = paraFig(b, ab, ad, ab);
          if (level === 2) {
            return {
              q: `평행사변형 $ABCD$ 에서 $${ang('A')}$ 의 이등분선이 $${ov('BC')}$ 와 만나는 점을 $E$ 라 하자. $${ov('AB')}=${ab}\\,\\text{cm}$, $${ov('AD')}=${ad}\\,\\text{cm}$ 일 때, $${ov('EC')}$ 의 길이를 구하세요.`,
              fig,
              answer: { type: 'num', value: ad - ab, unit: 'cm' },
              steps: [
                `$${ang('BAE')}=${ang('DAE')}=${ang('AEB')}$ (엇각) 이므로 $\\triangle ABE$ 는 이등변삼각형`,
                `$${ov('BE')}=${ov('AB')}=${ab}$, $${ov('BC')}=${ov('AD')}=${ad}$`,
                `$${ov('EC')}=${ad}-${ab}=${ad - ab}\\,\\text{cm}$`,
              ],
            };
          }
          const A = 180 - b;
          return {
            q: `평행사변형 $ABCD$ 에서 $${ang('A')}$ 의 이등분선이 $${ov('BC')}$ 와 만나는 점을 $E$ 라 하자. $${ov('AB')}=${ab}\\,\\text{cm}$, $${ov('AD')}=${ad}\\,\\text{cm}$, $${ang('B')}=${deg(b)}$ 일 때, $${ov('EC')}$ 의 길이와 $${ang('AEC')}$ 의 크기를 구하세요.`,
            fig,
            answer: { type: 'fields', fields: [{ label: 'EC', value: ad - ab, unit: 'cm' }, { label: '∠AEC', value: 180 - A / 2, unit: '°' }] },
            steps: [
              `$${ang('A')}=180^\\circ-${deg(b)}=${deg(A)}$, $${ang('BAE')}=${ang('DAE')}=${deg(A / 2)}$`,
              `엇각이므로 $${ang('AEB')}=${ang('DAE')}=${deg(A / 2)}$ → $${ov('BE')}=${ov('AB')}=${ab}$, $${ov('EC')}=${ad - ab}\\,\\text{cm}$`,
              `$${ang('AEC')}=180^\\circ-${deg(A / 2)}=${deg(180 - A / 2)}$`,
            ],
          };
        },
      },
      {
        id: 'para-diag',
        title: '평행사변형의 대각선과 변',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(3, 12),
              b = r.int(3, 12);
            return {
              q: `평행사변형 $ABCD$ 의 두 대각선의 교점을 $O$ 라 하자. $${ov('OA')}=${a}\\,\\text{cm}$, $${ov('OB')}=${b}\\,\\text{cm}$ 일 때, $${ov('AC')}$, $${ov('BD')}$ 의 길이를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'AC', value: 2 * a, unit: 'cm' }, { label: 'BD', value: 2 * b, unit: 'cm' }] },
              steps: ['평행사변형의 두 대각선은 서로를 이등분합니다.', `$${ov('AC')}=2\\times${a}=${2 * a}$, $${ov('BD')}=2\\times${b}=${2 * b}$`],
            };
          }
          if (level === 2) {
            const x = r.int(2, 9);
            const p = r.int(2, 4),
              rr = 1;
            const q = r.int(-3, 5);
            const s = p * x + q - rr * x;
            const ao = termsTex([{ c: p, v: 'x' }, { c: q, v: '' }]);
            const co = termsTex([{ c: rr, v: 'x' }, { c: s, v: '' }]);
            const val = p * x + q;
            return {
              q: `평행사변형 $ABCD$ 의 두 대각선의 교점을 $O$ 라 하자. $${ov('AO')}=${ao}$, $${ov('CO')}=${co}$ 일 때, $x$ 의 값과 $${ov('AC')}$ 의 길이를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'x', value: x }, { label: 'AC', value: 2 * val }] },
              steps: [`$${ov('AO')}=${ov('CO')}$ 이므로 $${ao}=${co}$`, `$${termsTex([{ c: p - rr, v: 'x' }])}=${s - q}$${p - rr === 1 ? '' : `, $x=${x}$`}`, `$${ov('AC')}=2\\times${val}=${2 * val}$`],
            };
          }
          const x = r.int(2, 8),
            y = r.int(1, 6);
          const c1 = r.int(-3, 6);
          const k = r.int(1, 3);
          const ab = termsTex([{ c: 2, v: 'x' }, { c: c1, v: '' }]);
          const dc = termsTex([{ c: 1, v: 'x' }, { c: 1, v: 'y' }, { c: 2 * x + c1 - x - y, v: '' }]);
          const ad = termsTex([{ c: k + 1, v: 'y' }, { c: 1, v: '' }]);
          const bc = termsTex([{ c: 1, v: 'x' }, { c: (k + 1) * y + 1 - x, v: '' }]);
          const e1 = termsTex([{ c: 1, v: 'x' }, { c: -1, v: 'y' }]);
          const e2 = termsTex([{ c: -1, v: 'x' }, { c: k + 1, v: 'y' }]);
          return {
            q: `사각형 $ABCD$ 에서 $${ov('AB')}=${ab}$, $${ov('DC')}=${dc}$, $${ov('AD')}=${ad}$, $${ov('BC')}=${bc}$ 이다. 이 사각형이 평행사변형이 되도록 하는 $x$, $y$ 의 값을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'x', value: x }, { label: 'y', value: y }] },
            steps: [
              `두 쌍의 대변의 길이가 각각 같아야 하므로 $${ab}=${dc}$, $${ad}=${bc}$`,
              `정리하면 $${e1}=${x - y}$, $${e2}=${(k + 1) * y - x}$`,
              `두 식을 변끼리 더하면 $${termsTex([{ c: k, v: 'y' }])}=${k * y}$ 이므로 $y=${y}$, $x=${x}$`,
            ],
            hint: '평행사변형이 되려면 두 쌍의 대변의 길이가 각각 같아야 해요.',
          };
        },
      },
      {
        id: 'para-cond',
        title: '평행사변형이 되는 조건',
        gen(r, level) {
          const a = r.int(4, 12);
          let b = r.int(4, 12);
          if (b === a) b = a + 1;
          const x = r.int(55, 125);
          const p = r.int(3, 9);
          let q = r.int(3, 9);
          if (q === p) q = p + 2;
          const good = [
            `$${ov('AB')}=${ov('DC')}=${a},\\ ${ov('AD')}=${ov('BC')}=${b}$`,
            `$${ov('AB')}\\parallel${ov('DC')},\\ ${ov('AB')}=${ov('DC')}=${a}$`,
            `$${ang('A')}=${ang('C')}=${deg(x)},\\ ${ang('B')}=${ang('D')}=${deg(180 - x)}$`,
            `$${ov('OA')}=${ov('OC')}=${p},\\ ${ov('OB')}=${ov('OD')}=${q}$`,
          ];
          const bad = [
            `$${ov('AB')}=${ov('AD')}=${a},\\ ${ov('CB')}=${ov('CD')}=${b}$`,
            `$${ov('AB')}\\parallel${ov('DC')},\\ ${ov('AD')}=${ov('BC')}=${b}$`,
            `$${ang('A')}=${ang('B')}=${deg(x)},\\ ${ang('C')}=${ang('D')}=${deg(180 - x)}$`,
            `$${ov('OA')}=${ov('OB')}=${p},\\ ${ov('OC')}=${ov('OD')}=${q}$`,
            `$${ov('AB')}=${ov('DC')}=${a},\\ ${ov('AD')}\\parallel${ov('BC')}$`,
          ];
          if (level === 1) {
            const c = r.pick(good);
            return {
              q: '사각형 $ABCD$ 의 두 대각선의 교점을 $O$ 라 할 때, 다음 중 사각형 $ABCD$ 가 **평행사변형이 되는** 것은?',
              answer: tc(r, c, r.sample(bad, 4)),
              steps: ['평행사변형이 되는 조건: 두 쌍의 대변(대각)이 각각 같다, 대각선이 서로 이등분, 한 쌍의 대변이 평행하고 길이가 같다.', `${c} 는 이 조건을 만족합니다.`],
            };
          }
          if (level === 2) {
            const c = r.pick(bad);
            return {
              q: '사각형 $ABCD$ 의 두 대각선의 교점을 $O$ 라 할 때, 다음 중 사각형 $ABCD$ 가 평행사변형이 **되지 않는** 것은?',
              answer: tc(r, c, [...good, `$${ang('A')}+${ang('B')}=180^\\circ,\\ ${ang('B')}+${ang('C')}=180^\\circ$`]),
              steps: [`${c} 만으로는 평행사변형이라고 할 수 없습니다 (연꼴·사다리꼴 등 반례가 있음).`],
            };
          }
          const t = r.int(15, 40);
          const m = r.int(2, 4);
          const c0 = 2 * t + r.int(-10, 20);
          const B = 180 - (2 * t + c0);
          if (B <= 10 || B >= 170) return this.gen(r, level);
          const kB = m * t - B;
          const jD = B - t;
          return {
            q: `사각형 $ABCD$ 에서 $${ang('A')}=(${termsTex([{ c: 2, v: 'x' }, { c: c0, v: '' }])})^\\circ$, $${ang('B')}=(${termsTex([{ c: m, v: 'x' }, { c: -kB, v: '' }])})^\\circ$, $${ang('D')}=(${termsTex([{ c: 1, v: 'x' }, { c: jD, v: '' }])})^\\circ$ 이다. 이 사각형이 평행사변형이 되도록 하는 $x$ 의 값과 그때의 $${ang('C')}$ 의 크기를 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'x', value: t }, { label: '∠C', value: 2 * t + c0, unit: '°' }] },
            steps: [
              `대각의 크기가 같아야 하므로 $${ang('B')}=${ang('D')}$: $${termsTex([{ c: m, v: 'x' }, { c: -kB, v: '' }])}=${termsTex([{ c: 1, v: 'x' }, { c: jD, v: '' }])}$`,
              m - 1 === 1 ? `$x=${jD + kB}$` : `$${m - 1}x=${jD + kB}$, $x=${t}$`,
              `$${ang('C')}=${ang('A')}=2\\times${t}${c0 >= 0 ? '+' : ''}${c0}=${deg(2 * t + c0)}$ (이때 $${ang('A')}+${ang('B')}=180^\\circ$ 도 성립)`,
            ],
          };
        },
      },
      {
        id: 'special-quad',
        title: '여러 가지 사각형',
        gen(r, level) {
          if (level === 1) {
            const k = r.int(3, 12);
            const C: [string, string][] = [
              [`$${ov('AC')}=${ov('BD')}$`, '직사각형'],
              [`$${ang('A')}=90^\\circ$`, '직사각형'],
              [`$${ov('AB')}=${ov('BC')}=${k}\\,\\text{cm}$`, '마름모'],
              [`$${ov('AC')}\\perp${ov('BD')}$`, '마름모'],
              [`$${ov('AC')}=${ov('BD')}$, $${ov('AC')}\\perp${ov('BD')}$`, '정사각형'],
              [`$${ang('B')}=90^\\circ$, $${ov('AB')}=${ov('AD')}=${k}\\,\\text{cm}$`, '정사각형'],
            ];
            const [cond, ans] = r.pick(C);
            return {
              q: `평행사변형 $ABCD$ 가 ${cond} 를 만족하면 어떤 사각형이 되나요?`,
              answer: tc(r, ans, ['직사각형', '마름모', '정사각형', '등변사다리꼴', '사다리꼴'].filter((x) => x !== ans)),
              steps: ['직사각형: 한 각이 직각 또는 두 대각선의 길이가 같음', '마름모: 이웃한 두 변의 길이가 같음 또는 두 대각선이 수직', `따라서 ${ans}`],
            };
          }
          if (level === 2) {
            if (r.chance(0.5)) {
              const x = r.int(20, 70);
              return {
                q: `마름모 $ABCD$ 에서 $${ang('ABD')}=${deg(x)}$ 일 때, $${ang('BAD')}$ 의 크기를 구하세요.`,
                answer: { type: 'num', value: 180 - 2 * x, unit: '°' },
                steps: [`$\\triangle ABD$ 는 $${ov('AB')}=${ov('AD')}$ 인 이등변삼각형이므로 $${ang('ADB')}=${deg(x)}$`, `$${ang('BAD')}=180^\\circ-2\\times${deg(x)}=${deg(180 - 2 * x)}$`],
              };
            }
            const k = r.int(3, 15);
            const x = r.int(20, 70);
            return {
              q: `직사각형 $ABCD$ 의 두 대각선의 교점을 $O$ 라 하자. $${ov('OA')}=${k}\\,\\text{cm}$, $${ang('OAB')}=${deg(x)}$ 일 때, $${ov('BD')}$ 의 길이와 $${ang('AOB')}$ 의 크기를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'BD', value: 2 * k, unit: 'cm' }, { label: '∠AOB', value: 180 - 2 * x, unit: '°' }] },
              steps: [`직사각형의 두 대각선은 길이가 같고 서로 이등분하므로 $${ov('BD')}=${ov('AC')}=${2 * k}$`, `$${ov('OA')}=${ov('OB')}$ 이므로 $${ang('OBA')}=${deg(x)}$, $${ang('AOB')}=${deg(180 - 2 * x)}$`],
            };
          }
          const [p, q, s] = r.pick(PRIM.slice(0, 3));
          const k = r.int(1, 2);
          const d1 = 2 * p * k,
            d2 = 2 * q * k;
          return {
            q: `두 대각선의 길이가 각각 $${d1}\\,\\text{cm}$, $${d2}\\,\\text{cm}$ 인 마름모의 넓이와 둘레의 길이를 구하세요.`,
            fig: geo({ A: [0, q * k], B: [-p * k, 0], C: [0, -q * k], D: [p * k, 0], O: [0, 0] }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A']], dashed: [['A', 'C'], ['B', 'D']], right: [['O', 'A', 'D']], w: 200, h: 200 }),
            answer: { type: 'fields', fields: [{ label: '넓이', value: (d1 * d2) / 2, unit: 'cm²' }, { label: '둘레', value: 4 * s * k, unit: 'cm' }] },
            steps: [
              `넓이 $=\\frac{1}{2}\\times${d1}\\times${d2}=${(d1 * d2) / 2}$`,
              `대각선은 서로 수직이등분하므로 한 변은 두 변이 $${p * k}$, $${q * k}$ 인 직각삼각형의 빗변: $\\sqrt{${p * k}^2+${q * k}^2}=${s * k}$`,
              `둘레 $=4\\times${s * k}=${4 * s * k}\\,\\text{cm}$`,
            ],
          };
        },
      },
      {
        id: 'area-parallel',
        title: '평행선과 넓이',
        gen(r, level) {
          if (level === 1) {
            const S = r.int(10, 40) * 2;
            const s1 = r.int(3, S / 2 - 2);
            return {
              q: `넓이가 $${S}\\,\\text{cm}^2$ 인 평행사변형 $ABCD$ 의 내부에 한 점 $P$ 가 있다. $\\triangle PAB=${s1}\\,\\text{cm}^2$ 일 때, $\\triangle PCD$ 의 넓이를 구하세요.`,
              answer: { type: 'num', value: S / 2 - s1, unit: 'cm²' },
              steps: [`$\\triangle PAB+\\triangle PCD=\\frac{1}{2}\\square ABCD=${S / 2}$`, `$\\triangle PCD=${S / 2}-${s1}=${S / 2 - s1}\\,(\\text{cm}^2)$`],
            };
          }
          if (level === 2) {
            const s2 = r.int(6, 30);
            const s3 = r.int(3, 20);
            const s1 = s2 + s3;
            const A: [number, number] = [2, 4];
            const D: [number, number] = [6, 4];
            const B: [number, number] = [0, 0];
            const C: [number, number] = [9, 0];
            const O = meet(A, C, B, D);
            return {
              q: `$${ov('AD')}\\parallel${ov('BC')}$ 인 사다리꼴 $ABCD$ 의 두 대각선의 교점을 $O$ 라 하자. $\\triangle ABC=${s1}\\,\\text{cm}^2$, $\\triangle OBC=${s2}\\,\\text{cm}^2$ 일 때, $\\triangle DOC$ 의 넓이를 구하세요.`,
              fig: geo({ A, B, C, D, O }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], ['A', 'C'], ['B', 'D']], w: 240, h: 150 }),
              answer: { type: 'num', value: s3, unit: 'cm²' },
              steps: [`밑변 $BC$ 가 같고 높이가 같으므로 $\\triangle DBC=\\triangle ABC=${s1}$`, `$\\triangle DOC=\\triangle DBC-\\triangle OBC=${s1}-${s2}=${s3}\\,(\\text{cm}^2)$`],
            };
          }
          const m = r.int(1, 4),
            n = r.int(1, 4);
          const p = r.int(1, 3),
            q = r.int(1, 3);
          const S = (m + n) * (p + q) * r.int(1, 3) * 2;
          const abd = (S * m) / (m + n);
          const ebd = (abd * q) / (p + q);
          const A: [number, number] = [3, 6];
          const B: [number, number] = [0, 0];
          const C: [number, number] = [10, 0];
          const D = lerp(B, C, m / (m + n));
          const E = lerp(A, D, p / (p + q));
          return {
            q: `넓이가 $${S}\\,\\text{cm}^2$ 인 $\\triangle ABC$ 에서 $${ov('BD')}:${ov('DC')}=${m}:${n}$, $${ov('AE')}:${ov('ED')}=${p}:${q}$ 가 되도록 점 $D$, $E$ 를 각각 $${ov('BC')}$, $${ov('AD')}$ 위에 잡았다. $\\triangle EBD$ 의 넓이를 구하세요.`,
            fig: geo({ A, B, C, D, E }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'A'], ['A', 'D'], ['B', 'E']], w: 250, h: 170 }),
            answer: { type: 'num', value: ebd, unit: 'cm²' },
            steps: [
              `높이가 같은 삼각형의 넓이의 비는 밑변의 비: $\\triangle ABD=${S}\\times\\frac{${m}}{${m + n}}=${abd}$`,
              `$\\triangle EBD=\\triangle ABD\\times\\frac{${q}}{${p + q}}=${ebd}\\,(\\text{cm}^2)$`,
            ],
          };
        },
      },
    ],
  },

  // ───────────────────────── 도형의 닮음 ─────────────────────────
  'm2b-3': {
    concepts: [
      {
        title: '닮음과 닮음비',
        body: '한 도형을 일정한 비율로 확대·축소한 도형과 합동일 때 두 도형은 **닮음**($\\sim$)이다. 대응변의 길이의 비가 **닮음비**.\n- 닮음비가 $m:n$ 이면 넓이의 비는 $m^2:n^2$, 부피의 비는 $m^3:n^3$\n- 초6의 비와 비율이 쓰여요.',
      },
      {
        title: '삼각형의 닮음 조건',
        body: '- **SSS 닮음**: 세 쌍의 대응변의 길이의 비가 같다\n- **SAS 닮음**: 두 쌍의 대응변의 길이의 비가 같고 그 끼인각이 같다\n- **AA 닮음**: 두 쌍의 대응각의 크기가 같다\n직각삼각형 $ABC$ ($\\angle A=90^\\circ$) 에서 $\\overline{AH}\\perp\\overline{BC}$ 이면 $\\overline{AB}^2=\\overline{BH}\\times\\overline{BC}$, $\\overline{AH}^2=\\overline{BH}\\times\\overline{CH}$',
      },
      {
        title: '평행선과 선분의 길이의 비',
        body: '$\\triangle ABC$ 에서 $\\overline{DE}\\parallel\\overline{BC}$ 이면\n$$\\overline{AD}:\\overline{AB}=\\overline{AE}:\\overline{AC}=\\overline{DE}:\\overline{BC},\\quad \\overline{AD}:\\overline{DB}=\\overline{AE}:\\overline{EC}$$\n세 평행선이 두 직선과 만나서 생기는 선분의 길이의 비도 같다.',
      },
      {
        title: '삼각형의 중점연결정리',
        body: '$\\triangle ABC$ 에서 두 변 $AB$, $AC$ 의 중점을 $M$, $N$ 이라 하면\n$$\\overline{MN}\\parallel\\overline{BC},\\quad \\overline{MN}=\\frac{1}{2}\\overline{BC}$$',
      },
      {
        title: '삼각형의 무게중심',
        body: '세 중선의 교점 $G$ 를 무게중심이라 한다.\n- 무게중심은 각 중선을 꼭짓점으로부터 $2:1$ 로 나눈다.\n- 세 중선으로 나뉜 6개의 삼각형의 넓이는 모두 같다: 각각 $\\frac{1}{6}\\triangle ABC$',
        example: { q: '중선 $AD=12$ 일 때 $AG$ 는?', a: '$12\\times\\frac{2}{3}=8$' },
      },
    ],
    skills: [
      {
        id: 'sim-ratio',
        title: '닮음비와 넓이·부피의 비',
        gen(r, level) {
          let m = r.int(1, 5),
            n = r.int(2, 6);
          if (m === n) n++;
          const g = gcd(m, n);
          m /= g;
          n /= g;
          if (level === 1) {
            const k = r.int(1, 4);
            const a = m * k * r.int(1, 2);
            const b = r.int(2, 9) * m;
            const bb = (b / m) * n;
            const aa = (a / m) * n;
            return {
              q: `$\\triangle ABC\\sim\\triangle DEF$ 이고 $${ov('AB')}=${a}\\,\\text{cm}$, $${ov('DE')}=${aa}\\,\\text{cm}$, $${ov('BC')}=${b}\\,\\text{cm}$ 일 때, $${ov('EF')}$ 의 길이를 구하세요.`,
              answer: { type: 'num', value: bb, unit: 'cm' },
              steps: [`닮음비 $=${ov('AB')}:${ov('DE')}=${a}:${aa}=${m}:${n}$`, `$${b}:${ov('EF')}=${m}:${n}$ 이므로 $${ov('EF')}=${bb}\\,\\text{cm}$`],
            };
          }
          if (level === 2) {
            const s = r.int(1, 6) * m * m;
            const t = (s / (m * m)) * n * n;
            return {
              q: `닮음비가 $${m}:${n}$ 인 두 닮은 도형 $P$, $Q$ 가 있다. $P$ 의 넓이가 $${s}\\,\\text{cm}^2$ 일 때, $Q$ 의 넓이는?`,
              answer: numChoices(r, t, [(s / m) * n, (s / m ** 3) * n ** 3, s * n, t / 2]),
              steps: [`넓이의 비 $=${m}^2:${n}^2=${m * m}:${n * n}$`, `$${s}\\times\\frac{${n * n}}{${m * m}}=${t}\\,\\text{cm}^2$`],
            };
          }
          const v = r.int(1, 5) * m ** 3;
          const sa = m * m,
            sb = n * n;
          const w = (v / m ** 3) * n ** 3;
          return {
            q: `닮은 두 원기둥 $A$, $B$ 의 겉넓이의 비가 $${sa}:${sb}$ 이다. $A$ 의 부피가 $${v}\\pi\\,\\text{cm}^3$ 일 때, $B$ 의 부피를 구하세요. (단, 답은 $\\pi$ 의 계수만 쓰세요.)`,
            answer: { type: 'num', value: w },
            steps: [`겉넓이의 비 $${sa}:${sb}=${m}^2:${n}^2$ 이므로 닮음비 $${m}:${n}$`, `부피의 비 $${m ** 3}:${n ** 3}$`, `$B$ 의 부피 $=${v}\\times\\frac{${n ** 3}}{${m ** 3}}=${w}$ → $${w}\\pi\\,\\text{cm}^3$`],
          };
        },
      },
      {
        id: 'sim-triangle',
        title: '삼각형의 닮음 활용',
        gen(r, level) {
          if (level === 1) {
            const k = r.int(2, 4);
            const ad = r.int(2, 6);
            const ab = ad * k;
            const de = r.int(2, 7);
            const bc = de * k;
            const B: [number, number] = [0, 0],
              C: [number, number] = [10, 0],
              A: [number, number] = [3.5, 7];
            const D = lerp(A, B, 1 / k),
              E = lerp(A, C, 1 / k);
            return {
              q: `$\\triangle ABC$ 에서 $${ov('DE')}\\parallel${ov('BC')}$ 이고 $${ov('AD')}=${ad}$, $${ov('DB')}=${ab - ad}$, $${ov('DE')}=${de}$ 일 때, $${ov('BC')}$ 의 길이를 구하세요.`,
              fig: geo({ A, B, C, D, E }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'A'], ['D', 'E']], w: 220, h: 180 }),
              answer: { type: 'num', value: bc },
              steps: [`$\\triangle ADE\\sim\\triangle ABC$ (AA 닮음), 닮음비 $${ad}:${ab}=1:${k}$`, `$${ov('BC')}=${de}\\times${k}=${bc}$`],
            };
          }
          if (level === 2) {
            // ∠ADE = ∠C, △ADE ∼ △ACB: AD/AC = AE/AB
            for (;;) {
              const ac = r.int(6, 16),
                ab = r.int(6, 16);
              const ad = r.int(2, ac - 2);
              const ae = (ad * ab) / ac;
              if (!Number.isInteger(ae) || ae >= ac || ab === ac) continue;
              return {
                q: `$\\triangle ABC$ 의 변 $AB$ 위의 점 $D$, 변 $AC$ 위의 점 $E$ 에 대하여 $${ang('ADE')}=${ang('ACB')}$ 이다. $${ov('AB')}=${ab}$, $${ov('AC')}=${ac}$, $${ov('AD')}=${ad}$ 일 때, $${ov('AE')}$ 의 길이는?`,
                answer: numChoices(r, ae, [(ad * ac) / ab, ab - ad, ac - ad, ad + 1].filter((v) => v > 0)),
                steps: [`$${ang('A')}$ 는 공통, $${ang('ADE')}=${ang('ACB')}$ → $\\triangle ADE\\sim\\triangle ACB$ (AA 닮음)`, `$${ov('AD')}:${ov('AC')}=${ov('AE')}:${ov('AB')}$, $${ad}:${ac}=${ov('AE')}:${ab}$`, `$${ov('AE')}=${ae}$`],
              };
            }
          }
          const m = r.int(1, 3),
            n = r.int(1, 4),
            k = r.int(1, 3);
          const bh = k * m * m,
            ch = k * n * n;
          const ah = k * m * n;
          const askAB = r.chance(0.4) && Number.isInteger(Math.sqrt(bh * (bh + ch)));
          const B: [number, number] = [0, 0],
            C: [number, number] = [bh + ch, 0],
            H: [number, number] = [bh, 0],
            A: [number, number] = [bh, ah];
          const fig = geo({ A, B, C, H }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'A'], ['A', 'H']], right: [['H', 'A', 'C'], ['A', 'B', 'C']], w: 250, h: 160 });
          if (askAB) {
            const abv = Math.sqrt(bh * (bh + ch));
            return {
              q: `$${ang('A')}=90^\\circ$ 인 직각삼각형 $ABC$ 에서 $${ov('AH')}\\perp${ov('BC')}$ 이고 $${ov('BH')}=${bh}$, $${ov('CH')}=${ch}$ 일 때, $${ov('AB')}$ 의 길이를 구하세요.`,
              fig,
              answer: { type: 'num', value: abv },
              steps: [`$\\triangle ABC\\sim\\triangle HBA$ 이므로 $${ov('AB')}^2=${ov('BH')}\\times${ov('BC')}$`, `$=${bh}\\times${bh + ch}=${bh * (bh + ch)}$`, `$${ov('AB')}=${abv}$`],
            };
          }
          if (m === n) return this.gen(r, level);
          return {
            q: `$${ang('A')}=90^\\circ$ 인 직각삼각형 $ABC$ 에서 $${ov('AH')}\\perp${ov('BC')}$ 이고 $${ov('BH')}=${bh}$, $${ov('CH')}=${ch}$ 일 때, $${ov('AH')}$ 의 길이를 구하세요.`,
            fig,
            answer: { type: 'num', value: ah },
            steps: [`$\\triangle HBA\\sim\\triangle HAC$ (AA 닮음) 이므로 $${ov('AH')}^2=${ov('BH')}\\times${ov('CH')}$`, `$=${bh}\\times${ch}=${bh * ch}$`, `$${ov('AH')}=${ah}$`],
          };
        },
      },
      {
        id: 'parallel-ratio',
        title: '평행선과 선분의 길이의 비',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(2, 8),
              b = r.int(2, 8),
              k = r.int(2, 4);
            const c = a * k;
            const x = b * k;
            return {
              q: `세 직선 $l\\parallel m\\parallel n$ 이 두 직선과 만날 때, 한 직선 위의 선분의 길이가 차례로 $${a}$, $${b}$ 이고 다른 직선 위의 선분의 길이가 차례로 $${c}$, $x$ 이다. $x$ 의 값을 구하세요.`,
              fig: geo(
                { P1: [0, 6], P2: [1.5, 6 - 6 * (a / (a + b))], P3: [3, 0], Q1: [5, 6], Q2: [7, 6 - 6 * (a / (a + b))], Q3: [9, 0], L1: [-1, 6], R1: [10, 6], L2: [-1, 6 - 6 * (a / (a + b))], R2: [10, 6 - 6 * (a / (a + b))], L3: [-1, 0], R3: [10, 0] },
                { segs: [['P1', 'P3'], ['Q1', 'Q3'], ['L1', 'R1'], ['L2', 'R2'], ['L3', 'R3']], sides: [['P1', 'P2', String(a)], ['P2', 'P3', String(b)], ['Q1', 'Q2', String(c)], ['Q2', 'Q3', 'x']], hide: ['P1', 'P2', 'P3', 'Q1', 'Q2', 'Q3', 'L1', 'L2', 'L3', 'R1', 'R2', 'R3'], w: 240, h: 150 },
              ),
              answer: { type: 'num', value: x },
              steps: [`$${a}:${b}=${c}:x$`, `$${a}x=${b * c}$, $x=${x}$`],
            };
          }
          if (level === 2) {
            const m = r.int(1, 5),
              n = r.int(1, 5),
              k = r.int(1, 4);
            const ae = m * k,
              ec = n * k;
            const ad = m * r.int(1, 3);
            const db = (ad / m) * n;
            return {
              q: `$\\triangle ABC$ 에서 $${ov('DE')}\\parallel${ov('BC')}$ 이고 $${ov('AD')}=${ad}$, $${ov('DB')}=${db}$, $${ov('AE')}=${ae}$ 일 때, $${ov('EC')}$ 의 길이는?`,
              answer: numChoices(r, ec, [(ae * ad) / db, ae + db - ad, (ae * (ad + db)) / ad].filter((v) => v > 0)),
              steps: [`$${ov('AD')}:${ov('DB')}=${ov('AE')}:${ov('EC')}$`, `$${ad}:${db}=${ae}:${ov('EC')}$ 에서 $${ov('EC')}=${ec}$`],
            };
          }
          for (;;) {
            const m = r.int(1, 4),
              n = r.int(1, 4);
            if (gcd(m, n) !== 1) continue;
            const a = r.int(3, 12),
              b = r.int(a + 2, 24);
            const ef = new F(n * a + m * b, m + n);
            if (!ef.isInt()) continue;
            const A: [number, number] = [2, 5],
              D: [number, number] = [2 + a * 0.5, 5],
              B: [number, number] = [0, 0],
              C: [number, number] = [b * 0.5, 0];
            const E = lerp(A, B, m / (m + n)),
              Fp = lerp(D, C, m / (m + n));
            return {
              q: `$${ov('AD')}\\parallel${ov('EF')}\\parallel${ov('BC')}$ 인 사다리꼴 $ABCD$ 에서 $${ov('AE')}:${ov('EB')}=${m}:${n}$, $${ov('AD')}=${a}$, $${ov('BC')}=${b}$ 일 때, $${ov('EF')}$ 의 길이를 구하세요.`,
              fig: geo({ A, B, C, D, E, F: Fp }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], ['E', 'F']], dashed: [['A', 'C']], w: 250, h: 150 }),
              answer: { type: 'num', value: ef.value },
              steps: [
                `대각선 $AC$ 와 $${ov('EF')}$ 의 교점을 $G$ 라 하면 $${ov('EG')}=${b}\\times\\frac{${m}}{${m + n}}=${new F(b * m, m + n).tex()}$`,
                `$${ov('GF')}=${a}\\times\\frac{${n}}{${m + n}}=${new F(a * n, m + n).tex()}$`,
                `$${ov('EF')}=${ef.tex()}$`,
              ],
            };
          }
        },
      },
      {
        id: 'midpoint',
        title: '삼각형의 중점연결정리',
        gen(r, level) {
          if (level === 1) {
            const bc = r.int(3, 15) * 2;
            const A: [number, number] = [3, 6],
              B: [number, number] = [0, 0],
              C: [number, number] = [10, 0];
            return {
              q: `$\\triangle ABC$ 에서 두 변 $AB$, $AC$ 의 중점을 각각 $M$, $N$ 이라 하자. $${ov('BC')}=${bc}\\,\\text{cm}$ 일 때, $${ov('MN')}$ 의 길이를 구하세요.`,
              fig: geo({ A, B, C, M: lerp(A, B, 0.5), N: lerp(A, C, 0.5) }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'A'], ['M', 'N']], w: 220, h: 160 }),
              answer: { type: 'num', value: bc / 2, unit: 'cm' },
              steps: [`중점연결정리: $${ov('MN')}=\\frac{1}{2}${ov('BC')}$`, `$=${bc}\\div2=${bc / 2}\\,\\text{cm}$`],
            };
          }
          if (level === 2) {
            const a = r.int(4, 16),
              b = r.int(4, 16),
              c = r.int(4, 16);
            if (a + b <= c || b + c <= a || a + c <= b) return this.gen(r, level);
            const per = a + b + c;
            return {
              q: `세 변의 길이가 $${a}\\,\\text{cm}$, $${b}\\,\\text{cm}$, $${c}\\,\\text{cm}$ 인 삼각형의 각 변의 중점을 이어 만든 삼각형의 둘레의 길이는?`,
              answer: numChoices(r, per / 2, [per, per / 4, per * 2, per / 3]),
              steps: ['중점연결정리에 의해 새 삼각형의 각 변은 원래 대응하는 변의 $\\frac{1}{2}$', `둘레 $=\\frac{1}{2}(${a}+${b}+${c})=${new F(per, 2).tex()}\\,\\text{cm}$`],
            };
          }
          const a = r.int(2, 10) * 2,
            b = a + r.int(1, 6) * 2;
          const A: [number, number] = [2, 4],
            D: [number, number] = [2 + a * 0.4, 4],
            B: [number, number] = [0, 0],
            C: [number, number] = [b * 0.4, 0];
          const M = lerp(A, B, 0.5),
            N = lerp(D, C, 0.5);
          const P = meet(M, N, B, D),
            Q = meet(M, N, A, C);
          return {
            q: `$${ov('AD')}\\parallel${ov('BC')}$ 인 사다리꼴 $ABCD$ 에서 $${ov('AB')}$, $${ov('DC')}$ 의 중점을 각각 $M$, $N$ 이라 하고, $${ov('MN')}$ 이 두 대각선 $BD$, $AC$ 와 만나는 점을 각각 $P$, $Q$ 라 하자. $${ov('AD')}=${a}$, $${ov('BC')}=${b}$ 일 때, $${ov('MN')}$ 과 $${ov('PQ')}$ 의 길이를 구하세요.`,
            fig: geo({ A, B, C, D, M, N, P, Q }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], ['M', 'N'], ['A', 'C'], ['B', 'D']], w: 260, h: 160 }),
            answer: { type: 'fields', fields: [{ label: 'MN', value: (a + b) / 2 }, { label: 'PQ', value: (b - a) / 2 }] },
            steps: [
              `$\\triangle ABC$ 에서 $${ov('MQ')}=\\frac{1}{2}${ov('BC')}=${b / 2}$, $\\triangle ABD$ 에서 $${ov('MP')}=\\frac{1}{2}${ov('AD')}=${a / 2}$`,
              `$${ov('MN')}=\\frac{1}{2}(${a}+${b})=${(a + b) / 2}$`,
              `$${ov('PQ')}=${ov('MQ')}-${ov('MP')}=${b / 2}-${a / 2}=${(b - a) / 2}$`,
            ],
          };
        },
      },
      {
        id: 'centroid',
        title: '삼각형의 무게중심',
        gen(r, level) {
          const A: [number, number] = [3.5, 7],
            B: [number, number] = [0, 0],
            C: [number, number] = [10, 0];
          const D = lerp(B, C, 0.5);
          const G = lerp(A, D, 2 / 3);
          if (level === 1) {
            const k = r.int(2, 10);
            const ask = r.chance(0.5);
            return {
              q: `점 $G$ 는 $\\triangle ABC$ 의 무게중심이고 $${ov('AD')}$ 는 중선이다. $${ov('AD')}=${3 * k}\\,\\text{cm}$ 일 때, $${ask ? ov('AG') : ov('GD')}$ 의 길이를 구하세요.`,
              fig: geo({ A, B, C, D, G }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'A'], ['A', 'D']], dots: ['G'], w: 220, h: 170 }),
              answer: { type: 'num', value: ask ? 2 * k : k, unit: 'cm' },
              steps: [`무게중심은 중선을 $2:1$ 로 나눕니다.`, `$${ask ? ov('AG') : ov('GD')}=${3 * k}\\times\\frac{${ask ? 2 : 1}}{3}=${ask ? 2 * k : k}\\,\\text{cm}$`],
            };
          }
          if (level === 2) {
            const S = r.int(2, 15) * 6;
            const which = r.pick([
              ['\\triangle GBC', 3],
              ['\\triangle GBD', 6],
              ['\\square AEGF', 3],
            ] as [string, number][]);
            const E = lerp(A, B, 0.5),
              Fp = lerp(A, C, 0.5);
            return {
              q: `점 $G$ 는 $\\triangle ABC$ 의 무게중심이고 $D$, $E$, $F$ 는 각각 $${ov('BC')}$, $${ov('AB')}$, $${ov('AC')}$ 의 중점이다. $\\triangle ABC=${S}\\,\\text{cm}^2$ 일 때, $${which[0]}$ 의 넓이를 구하세요.`,
              fig: geo({ A, B, C, D, E, F: Fp, G }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'A'], ['A', 'D'], ['B', 'F'], ['C', 'E']], w: 230, h: 180 }),
              answer: { type: 'num', value: S / which[1], unit: 'cm²' },
              steps: ['세 중선으로 나뉜 6개의 삼각형의 넓이는 모두 같습니다.', `$${which[0]}=${S}\\times\\frac{1}{${which[1]}}=${S / which[1]}\\,(\\text{cm}^2)$`],
            };
          }
          const k = r.int(1, 6);
          const ad = 9 * k;
          const Gp = lerp(G, D, 2 / 3);
          return {
            q: `점 $G$ 는 $\\triangle ABC$ 의 무게중심이고 점 $G'$ 은 $\\triangle GBC$ 의 무게중심이다. 중선 $${ov('AD')}=${ad}\\,\\text{cm}$ 일 때, $${ov("GG'")}$ 의 길이를 구하세요.`,
            fig: geo({ A, B, C, D, G, "G'": Gp }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'A'], ['A', 'D'], ['G', 'B'], ['G', 'C']], dots: ['G', "G'"], w: 230, h: 180 }),
            answer: { type: 'num', value: 2 * k, unit: 'cm' },
            steps: [`$${ov('GD')}=${ad}\\times\\frac{1}{3}=${3 * k}$`, `$${ov('GD')}$ 는 $\\triangle GBC$ 의 중선이므로 $${ov("GG'")}=${3 * k}\\times\\frac{2}{3}=${2 * k}\\,\\text{cm}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 피타고라스 정리 ─────────────────────────
  'm2b-4': {
    concepts: [
      {
        title: '피타고라스 정리',
        body: '직각삼각형에서 직각을 낀 두 변의 길이를 $a$, $b$, 빗변의 길이를 $c$ 라 하면\n$$a^2+b^2=c^2$$\n- 세 자연수 $(3,4,5)$, $(5,12,13)$, $(8,15,17)$ 처럼 정리를 만족하는 수를 피타고라스 수라 한다.',
        example: { q: '두 변이 $6$, $8$ 인 직각삼각형의 빗변은?', a: '$6^2+8^2=100=10^2$ 이므로 $10$' },
      },
      {
        title: '직각삼각형이 되는 조건',
        body: '세 변의 길이가 $a$, $b$, $c$ ($c$ 가 가장 긴 변) 일 때\n- $c^2=a^2+b^2$ 이면 직각삼각형\n- $c^2<a^2+b^2$ 이면 예각삼각형\n- $c^2>a^2+b^2$ 이면 둔각삼각형',
      },
      {
        title: '피타고라스 정리의 활용',
        body: '- 직사각형의 대각선: $\\sqrt{a^2+b^2}$\n- 정사각형의 대각선: $\\sqrt{2}a$, 정삼각형의 높이: $\\frac{\\sqrt{3}}{2}a$\n- 좌표평면 위 두 점 사이의 거리: $\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$\n- 직육면체의 대각선: $\\sqrt{a^2+b^2+c^2}$',
      },
      {
        title: '직각삼각형과 정사각형의 넓이',
        body: '직각삼각형의 세 변을 각각 한 변으로 하는 정사각형을 그리면, 빗변 위 정사각형의 넓이는 나머지 두 정사각형의 넓이의 합과 같다.',
      },
    ],
    skills: [
      {
        id: 'find-side',
        title: '변의 길이 구하기',
        gen(r, level) {
          if (level <= 2) {
            const [a, b, c] = triple(r, level === 1 ? 30 : 60);
            const C: [number, number] = [0, 0],
              Bp: [number, number] = [b, 0],
              A: [number, number] = [0, a];
            if (level === 1) {
              return {
                q: `$${ang('C')}=90^\\circ$ 인 직각삼각형 $ABC$ 에서 $${ov('AC')}=${a}$, $${ov('BC')}=${b}$ 일 때, $${ov('AB')}$ 의 길이를 구하세요.`,
                fig: geo({ A, B: Bp, C }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'A']], right: [['C', 'A', 'B']], sides: [['A', 'C', String(a)], ['B', 'C', String(b)]], w: 220, h: 170 }),
                answer: { type: 'num', value: c },
                steps: [`$${ov('AB')}^2=${a}^2+${b}^2=${a * a + b * b}$`, `$${ov('AB')}>0$ 이므로 $${ov('AB')}=${c}$`],
              };
            }
            return {
              q: `$${ang('C')}=90^\\circ$ 인 직각삼각형 $ABC$ 에서 $${ov('AB')}=${c}$, $${ov('BC')}=${b}$ 일 때, $${ov('AC')}$ 의 길이를 구하세요.`,
              fig: geo({ A, B: Bp, C }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'A']], right: [['C', 'A', 'B']], sides: [['A', 'B', String(c)], ['B', 'C', String(b)]], w: 220, h: 170 }),
              answer: { type: 'num', value: a },
              steps: [`$${ov('AC')}^2=${c}^2-${b}^2=${c * c - b * b}$`, `$${ov('AC')}=${a}$`],
            };
          }
          // 공통 높이를 갖는 두 직각삼각형
          for (;;) {
            const t1 = r.pick(TRIPLES.filter((t) => t[2] <= 41));
            const h = r.pick([t1[0], t1[1]]);
            const others = TRIPLES.filter((t) => (t[0] === h || t[1] === h) && t !== t1 && t[2] <= 50);
            if (!others.length) continue;
            const t2 = r.pick(others);
            const x1 = t1[0] === h ? t1[1] : t1[0];
            const x2 = t2[0] === h ? t2[1] : t2[0];
            const A: [number, number] = [x1, h],
              B: [number, number] = [0, 0],
              C: [number, number] = [x1 + x2, 0],
              D: [number, number] = [x1, 0];
            return {
              q: `$\\triangle ABC$ 의 꼭짓점 $A$ 에서 $${ov('BC')}$ 에 내린 수선의 발을 $D$ 라 하자. $${ov('AB')}=${t1[2]}$, $${ov('AD')}=${h}$, $${ov('AC')}=${t2[2]}$ 일 때, $${ov('BC')}$ 의 길이를 구하세요.`,
              fig: geo({ A, B, C, D }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'A'], ['A', 'D']], right: [['D', 'A', 'C']], w: 250, h: 170 }),
              answer: { type: 'num', value: x1 + x2 },
              steps: [`$${ov('BD')}=\\sqrt{${t1[2]}^2-${h}^2}=${x1}$`, `$${ov('CD')}=\\sqrt{${t2[2]}^2-${h}^2}=${x2}$`, `$${ov('BC')}=${x1}+${x2}=${x1 + x2}$`],
            };
          }
        },
      },
      {
        id: 'right-check',
        title: '삼각형의 모양 판별',
        gen(r, level) {
          const [a, b, c] = triple(r, 41);
          const W = [
            [a, b, c + 1],
            [a + 1, b, c],
            [a, b + 1, c + 1],
            [a, b - 1, c],
            [a + 2, b + 1, c + 2],
          ].filter(([x, y, z]) => x + y > z && x > 0);
          const T = (t: number[]) => `$${t.join(',\\ ')}$`;
          if (level === 1) {
            return {
              q: '세 변의 길이가 다음과 같은 삼각형 중 **직각삼각형**인 것은?',
              answer: tc(r, T([a, b, c]), W.map(T)),
              steps: [`$${a}^2+${b}^2=${a * a + b * b}=${c}^2$ 이므로 직각삼각형입니다.`],
            };
          }
          if (level === 2) {
            const x = c;
            const ask = r.pick(['short', 'hyp']);
            if (ask === 'hyp') {
              return {
                q: `세 변의 길이가 $${a}$, $${b}$, $x$ 인 삼각형이 빗변의 길이가 $x$ 인 직각삼각형일 때, $x$ 의 값을 구하세요.`,
                answer: { type: 'num', value: x },
                steps: [`$x^2=${a}^2+${b}^2=${x * x}$`, `$x=${x}$`],
              };
            }
            return {
              q: `세 변의 길이가 $${a}$, $x$, $${c}$ 인 삼각형이 빗변의 길이가 $${c}$ 인 직각삼각형일 때, $x$ 의 값을 구하세요.`,
              answer: { type: 'num', value: b },
              steps: [`$x^2=${c}^2-${a}^2=${b * b}$`, `$x=${b}$`],
            };
          }
          for (;;) {
            const p = r.int(3, 12),
              q = r.int(p, 14),
              s = r.int(q, 18);
            if (p + q <= s) continue;
            const d = s * s - (p * p + q * q);
            const kind = d === 0 ? '직각삼각형' : d < 0 ? '예각삼각형' : '둔각삼각형';
            if (d === 0 && r.chance(0.5)) continue;
            return {
              q: `세 변의 길이가 $${p}$, $${q}$, $${s}$ 인 삼각형은 어떤 삼각형인가요?`,
              answer: tc(r, kind, ['예각삼각형', '직각삼각형', '둔각삼각형', '만들 수 없다'].filter((x) => x !== kind), 4),
              steps: [`가장 긴 변의 제곱: $${s}^2=${s * s}$, 나머지 두 변의 제곱의 합: $${p}^2+${q}^2=${p * p + q * q}$`, `$${s * s}${d === 0 ? '=' : d < 0 ? '<' : '>'}${p * p + q * q}$ 이므로 ${kind}`],
            };
          }
        },
      },
      {
        id: 'squares-area',
        title: '정사각형의 넓이와 피타고라스',
        gen(r, level) {
          const [a, b, c] = triple(r, level === 1 ? 20 : 41);
          if (level === 1) {
            return {
              q: `직각삼각형의 직각을 낀 두 변 위에 그린 정사각형의 넓이가 각각 $${a * a}\\,\\text{cm}^2$, $${b * b}\\,\\text{cm}^2$ 일 때, 빗변 위에 그린 정사각형의 넓이를 구하세요.`,
              answer: { type: 'num', value: c * c, unit: 'cm²' },
              steps: ['빗변 위 정사각형의 넓이 = 나머지 두 정사각형의 넓이의 합', `$${a * a}+${b * b}=${c * c}\\,(\\text{cm}^2)$`],
            };
          }
          if (level === 2) {
            return {
              q: `직각삼각형의 빗변 위에 그린 정사각형의 넓이가 $${c * c}\\,\\text{cm}^2$, 다른 한 변 위에 그린 정사각형의 넓이가 $${a * a}\\,\\text{cm}^2$ 일 때, 나머지 한 변의 길이는?`,
              answer: numChoices(r, b, [c - a, c * c - a * a, c + a, Math.round(Math.sqrt(c * c + a * a))]),
              steps: [`나머지 정사각형의 넓이 $=${c * c}-${a * a}=${b * b}$`, `한 변의 길이 $=${b}\\,\\text{cm}$`],
            };
          }
          // 정사각형 안의 정사각형 (변 a+b, 안쪽 정사각형 넓이)
          return {
            q: `한 변의 길이가 $${a + b}\\,\\text{cm}$ 인 정사각형 $ABCD$ 의 각 변 위에 꼭짓점으로부터 $${a}\\,\\text{cm}$ 인 점 $E$, $F$, $G$, $H$ 를 차례로 잡아 정사각형 $EFGH$ 를 만들었다. $\\square EFGH$ 의 넓이를 구하세요.`,
            fig: geo(
              { A: [0, a + b], B: [0, 0], C: [a + b, 0], D: [a + b, a + b], E: [0, b], F: [a, 0], G: [a + b, a], H: [b, a + b] },
              { segs: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A']], polys: [['E', 'F', 'G', 'H']], w: 200, h: 200 },
            ),
            answer: { type: 'num', value: c * c, unit: 'cm²' },
            steps: [`네 직각삼각형은 합동이고 두 변이 $${a}$, $${b}$`, `$${ov('EF')}^2=${a}^2+${b}^2=${c * c}$`, `$\\square EFGH=${c * c}\\,\\text{cm}^2$`],
          };
        },
      },
      {
        id: 'applied',
        title: '피타고라스 정리의 활용',
        gen(r, level) {
          if (level === 1) {
            const [a, b, c] = triple(r, 30);
            const name = r.pick(NAMES);
            return {
              q: `${neun(name)} 가로 $${b}\\,\\text{cm}$, 세로 $${a}\\,\\text{cm}$ 인 직사각형 모양의 액자를 샀다. 이 액자의 대각선의 길이를 구하세요.`,
              answer: { type: 'num', value: c, unit: 'cm' },
              steps: [`대각선 $=\\sqrt{${b}^2+${a}^2}=\\sqrt{${c * c}}$`, `$=${c}\\,\\text{cm}$`],
            };
          }
          if (level === 2) {
            const [a, b, c] = triple(r, 30);
            const x1 = r.int(-6, 4),
              y1 = r.int(-6, 4);
            const sx = r.sign(),
              sy = r.sign();
            const swap = r.chance(0.5);
            const dx = swap ? a : b,
              dy = swap ? b : a;
            const x2 = x1 + sx * dx,
              y2 = y1 + sy * dy;
            return {
              q: `좌표평면 위의 두 점 $A(${x1},\\,${y1})$, $B(${x2},\\,${y2})$ 사이의 거리를 구하세요.`,
              answer: { type: 'num', value: c },
              steps: [`$\\overline{AB}=\\sqrt{(${x2}-${pn(x1)})^2+(${y2}-${pn(y1)})^2}=\\sqrt{${dx}^2+${dy}^2}$`, `$=\\sqrt{${c * c}}=${c}$`],
            };
          }
          const BOX: [number, number, number, number][] = [
            [1, 2, 2, 3],
            [2, 3, 6, 7],
            [1, 4, 8, 9],
            [4, 4, 7, 9],
            [2, 6, 9, 11],
            [6, 6, 7, 11],
            [3, 4, 12, 13],
            [2, 10, 11, 15],
            [8, 9, 12, 17],
          ];
          const [p, q, s, d] = r.pick(BOX);
          const k = r.int(1, 3);
          const dims = r.shuffle([p * k, q * k, s * k]);
          return {
            q: `가로, 세로, 높이가 각각 $${dims[0]}\\,\\text{cm}$, $${dims[1]}\\,\\text{cm}$, $${dims[2]}\\,\\text{cm}$ 인 직육면체의 대각선의 길이를 구하세요.`,
            answer: { type: 'num', value: d * k, unit: 'cm' },
            steps: [`대각선 $=\\sqrt{${dims[0]}^2+${dims[1]}^2+${dims[2]}^2}$`, `$=\\sqrt{${(d * k) ** 2}}=${d * k}\\,\\text{cm}$`],
          };
        },
      },
      {
        id: 'sqrt-length',
        title: '근호로 나타내는 길이',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(2, 12);
            return {
              q: `한 변의 길이가 $${a}\\,\\text{cm}$ 인 정사각형의 대각선의 길이는?`,
              answer: mc(r, sqrtTex(2 * a * a), [sqrtTex(a * a), `${2 * a}`, sqrtTex(3 * a * a), sqrtTex(a * a * 2, 2), `${a}\\sqrt{3}`.replace(/^1\\/, '\\')]),
              steps: [`대각선 $=\\sqrt{${a}^2+${a}^2}=\\sqrt{${2 * a * a}}$`, `$=${sqrtTex(2 * a * a)}\\,\\text{cm}$`],
            };
          }
          if (level === 2) {
            const a = r.int(1, 8) * 2;
            const h = sqrtTex(3 * (a / 2) ** 2);
            const S = `${(a * a) / 4}\\sqrt{3}`;
            const askArea = r.chance(0.5);
            return {
              q: `한 변의 길이가 $${a}\\,\\text{cm}$ 인 정삼각형의 ${askArea ? '넓이' : '높이'}는?`,
              answer: askArea
                ? mc(r, S.replace(/^1\\/, '\\'), [h, `${(a * a) / 2}\\sqrt{3}`, `${(a * a) / 4}\\sqrt{2}`, `${a * a}\\sqrt{3}`].map((x) => x.replace(/^1\\/, '\\')))
                : mc(r, h, [sqrtTex(2 * (a / 2) ** 2), sqrtTex(3 * a * a), `${a / 2}`, sqrtTex(5 * (a / 2) ** 2)]),
              steps: askArea
                ? [`높이 $=\\frac{\\sqrt{3}}{2}\\times${a}=${h}$`, `넓이 $=\\frac{\\sqrt{3}}{4}\\times${a}^2=${S.replace(/^1\\/, '\\')}\\,\\text{cm}^2$`]
                : [`높이 $=\\sqrt{${a}^2-${a / 2}^2}=\\sqrt{${3 * (a / 2) ** 2}}$`, `$=${h}\\,\\text{cm}$`],
            };
          }
          let a = 0,
            b = 0;
          for (;;) {
            a = r.int(1, 9);
            b = r.int(1, 9);
            if (!Number.isInteger(Math.sqrt(a * a + b * b))) break;
          }
          const s = a * a + b * b;
          return {
            q: `좌표평면 위의 두 점 $A(${-a + 1},\\,2)$, $B(1,\\,${2 + b})$ 사이의 거리는?`,
            answer: mc(r, sqrtTex(s), [sqrtTex(a * a + b * b + 2 * a * b), `${a + b}`, sqrtTex(Math.abs(a * a - b * b) || 2), sqrtTex(s + 1)]),
            steps: [`$\\overline{AB}=\\sqrt{(1-${pn(-a + 1)})^2+(${2 + b}-2)^2}=\\sqrt{${a}^2+${b}^2}$`, `$=${sqrtTex(s)}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 확률 ─────────────────────────
  'm2b-5': {
    concepts: [
      {
        title: '경우의 수',
        body: '- **합의 법칙**: 두 사건 $A$, $B$ 가 동시에 일어나지 않을 때, $A$ 또는 $B$ 가 일어나는 경우의 수는 $m+n$\n- **곱의 법칙**: $A$ 가 일어나는 각각에 대해 $B$ 가 일어나는 경우의 수는 $m\\times n$\n- $n$ 명을 한 줄로 세우는 경우의 수: $n\\times(n-1)\\times\\cdots\\times1$\n- $n$ 명 중 대표 2명(자격이 같음): $\\frac{n(n-1)}{2}$',
      },
      {
        title: '확률의 뜻',
        body: '각 경우가 일어날 가능성이 같을 때, 사건 $A$ 가 일어날 확률은\n$$p=\\frac{(\\text{사건 }A\\text{ 가 일어나는 경우의 수})}{(\\text{모든 경우의 수})}$$\n초5의 가능성을 수로 나타낸 것이 확률이에요.',
        example: { q: '주사위 한 개를 던져 짝수가 나올 확률은?', a: '$\\frac{3}{6}=\\frac{1}{2}$' },
      },
      {
        title: '확률의 성질',
        body: '- $0\\le p\\le 1$, 반드시 일어나는 사건의 확률은 $1$, 절대 일어나지 않는 사건의 확률은 $0$\n- 사건 $A$ 가 일어나지 않을 확률: $1-p$\n- "적어도 하나" 는 $1-(\\text{모두 아닐 확률})$ 로 계산하면 편하다.',
      },
      {
        title: '확률의 계산',
        body: '- 동시에 일어나지 않는 두 사건: $P(A\\text{ 또는 }B)=p+q$\n- 서로 영향을 주지 않는 두 사건: $P(A\\text{ 그리고 }B)=p\\times q$\n- 꺼낸 것을 다시 넣지 않으면 두 번째의 전체 개수가 하나 줄어든다.',
      },
    ],
    skills: [
      {
        id: 'count',
        title: '경우의 수',
        gen(r, level) {
          if (level === 1) {
            if (r.chance(0.5)) {
              const s = r.int(3, 11);
              let cnt = 0;
              for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (i + j === s) cnt++;
              return {
                q: `서로 다른 두 개의 주사위를 동시에 던질 때, 나오는 눈의 수의 합이 $${s}$ 인 경우의 수를 구하세요.`,
                answer: { type: 'num', value: cnt, unit: '가지' },
                steps: [`합이 $${s}$ 인 순서쌍을 모두 찾습니다.`, `${Array.from({ length: 6 }, (_, i) => i + 1).filter((i) => s - i >= 1 && s - i <= 6).map((i) => `$(${i},${s - i})$`).join(', ')} → $${cnt}$ 가지`],
              };
            }
            const a = r.int(2, 6),
              b = r.int(2, 6);
            const [x, y] = r.pick([
              ['티셔츠', '바지'],
              ['빵', '음료'],
              ['자음 카드', '모음 카드'],
            ]);
            return {
              q: `${x} $${a}$ 종류와 ${y} $${b}$ 종류 중에서 각각 하나씩 골라 짝 짓는 경우의 수를 구하세요.`,
              answer: { type: 'num', value: a * b, unit: '가지' },
              steps: ['곱의 법칙', `$${a}\\times${b}=${a * b}$ (가지)`],
            };
          }
          if (level === 2) {
            const n = r.int(4, 7);
            if (r.chance(0.5)) {
              const k = r.pick([2, 3]);
              return {
                q: `$${n}$ 명의 학생 중에서 회장 $1$ 명, 부회장 $1$ 명${k === 3 ? ', 서기 $1$ 명' : ''}을 뽑는 경우의 수는?`,
                answer: numChoices(r, nPr(n, k), [nCr(n, k), n * k, n ** k, factorial(n)]),
                steps: [`회장 $${n}$ 가지, 부회장 $${n - 1}$ 가지${k === 3 ? `, 서기 $${n - 2}$ 가지` : ''}`, `$${Array.from({ length: k }, (_, i) => n - i).join('\\times')}=${nPr(n, k)}$`],
              };
            }
            return {
              q: `$${n}$ 명의 학생 중에서 대표 $2$ 명을 뽑는 경우의 수를 구하세요.`,
              answer: { type: 'num', value: nCr(n, 2), unit: '가지' },
              steps: [`순서를 생각하면 $${n}\\times${n - 1}=${n * (n - 1)}$`, `두 사람의 순서는 상관없으므로 $${n * (n - 1)}\\div2=${nCr(n, 2)}$`],
            };
          }
          const n = r.int(4, 6); // 0,1,...,n-1 카드
          const three = r.chance(0.5);
          const cnt = three ? (n - 1) * (n - 1) * (n - 2) : (n - 1) * (n - 1);
          return {
            q: `$0$ 부터 $${n - 1}$ 까지의 숫자가 각각 적힌 $${n}$ 장의 카드 중에서 ${three ? '3' : '2'} 장을 뽑아 만들 수 있는 ${three ? '세' : '두'} 자리 자연수의 개수를 구하세요.`,
            answer: { type: 'num', value: cnt, unit: '개' },
            steps: [
              `맨 앞자리에는 $0$ 이 올 수 없으므로 $${n - 1}$ 가지`,
              three ? `둘째 자리 $${n - 1}$ 가지 ($0$ 포함), 셋째 자리 $${n - 2}$ 가지` : `일의 자리는 앞자리 숫자를 뺀 $${n - 1}$ 가지 ($0$ 포함)`,
              `$${three ? `${n - 1}\\times${n - 1}\\times${n - 2}` : `${n - 1}\\times${n - 1}`}=${cnt}$`,
            ],
          };
        },
      },
      {
        id: 'basic-prob',
        title: '확률 구하기',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(1, 7),
              b = r.int(1, 7),
              c = r.int(0, 5);
            const t = a + b + c;
            const color = r.pick(['빨간', '파란']);
            const k = color === '빨간' ? a : b;
            return {
              q: `주머니 속에 빨간 공 $${a}$ 개, 파란 공 $${b}$ 개${c ? `, 흰 공 $${c}$ 개` : ''}가 들어 있다. 공 한 개를 꺼낼 때, ${color} 공이 나올 확률을 구하세요.`,
              answer: { type: 'num', value: k / t, display: 'frac' },
              steps: [`모든 경우의 수: $${t}$, ${color} 공: $${k}$`, `확률 $=${new F(k, t).tex()}$`],
            };
          }
          if (level === 2) {
            const kind = r.pick(['sum', 'mult', 'diff']);
            let cnt = 0;
            let cond = '';
            const s = r.int(4, 10),
              m = r.int(2, 5),
              d = r.int(1, 4);
            for (let i = 1; i <= 6; i++)
              for (let j = 1; j <= 6; j++) {
                if (kind === 'sum' && i + j === s) cnt++;
                if (kind === 'mult' && (i + j) % m === 0) cnt++;
                if (kind === 'diff' && Math.abs(i - j) === d) cnt++;
              }
            cond = kind === 'sum' ? `합이 $${s}$` : kind === 'mult' ? `합이 $${m}$ 의 배수` : `차가 $${d}$`;
            return {
              q: `서로 다른 두 개의 주사위를 동시에 던질 때, 나오는 눈의 수의 ${cond}일 확률은?`,
              answer: numChoices(r, cnt / 36, [cnt / 6, (cnt + 1) / 36, (cnt - 1) / 36, cnt / 12, 1 - cnt / 36].filter((x) => x > 0 && x < 1), 5, 'frac'),
              steps: [`모든 경우의 수 $6\\times6=36$`, `${cond}인 경우의 수 $${cnt}$`, `확률 $=${new F(cnt, 36).tex()}$`],
            };
          }
          const n = r.int(4, 6);
          const names = ['A', 'B', 'C', 'D', 'E', 'F'].slice(0, n);
          const [x, y] = r.sample(names, 2).sort();
          const adj = (2 * factorial(n - 1)) / factorial(n);
          if (r.chance(0.5)) {
            return {
              q: `$${names.join(',')}$ $${n}$ 명이 한 줄로 설 때, $${x}$ 와 $${y}$ 가 이웃하여 설 확률을 구하세요.`,
              answer: { type: 'num', value: adj, display: 'frac' },
              steps: [`모든 경우: $${n}!=${factorial(n)}$`, `$${x}$, $${y}$ 를 하나로 묶어 $${n - 1}!\\times2=${2 * factorial(n - 1)}$`, `확률 $=${new F(2 * factorial(n - 1), factorial(n)).tex()}$`],
            };
          }
          return {
            q: `$${names.join(',')}$ $${n}$ 명 중에서 대표 $2$ 명을 뽑을 때, $${x}$ 가 뽑힐 확률을 구하세요.`,
            answer: { type: 'num', value: (n - 1) / nCr(n, 2), display: 'frac' },
            steps: [`모든 경우: $\\frac{${n}\\times${n - 1}}{2}=${nCr(n, 2)}$`, `$${x}$ 를 포함하는 경우: 나머지 한 명을 고르는 $${n - 1}$ 가지`, `확률 $=${new F(n - 1, nCr(n, 2)).tex()}$`],
          };
        },
      },
      {
        id: 'complement',
        title: '여사건의 확률',
        gen(r, level) {
          if (level === 1) {
            const d = r.int(3, 12);
            const n = r.int(1, d - 1);
            const name = r.pick(NAMES);
            return {
              q: `${nm(name)}가 내일 지각할 확률이 $${new F(n, d).tex()}$ 일 때, 지각하지 않을 확률을 구하세요.`,
              answer: { type: 'num', value: 1 - n / d, display: 'frac' },
              steps: [`(지각하지 않을 확률) $=1-(\\text{지각할 확률})$`, `$=1-${new F(n, d).tex()}=${new F(d - n, d).tex()}$`],
            };
          }
          if (level === 2) {
            const n = r.int(2, 5);
            return {
              q: `동전 $${n}$ 개를 동시에 던질 때, 적어도 한 개는 앞면이 나올 확률은?`,
              answer: numChoices(r, 1 - 1 / 2 ** n, [1 / 2 ** n, 1 / 2, n / 2 ** n, 1 - n / 2 ** n, (2 ** n - 1) / 2 ** (n + 1), 1 - 1 / 2 ** (n + 1)].filter((x) => x > 0), 5, 'frac'),
              steps: [`모두 뒷면이 나올 확률 $=\\left(\\frac{1}{2}\\right)^{${n}}=${new F(1, 2 ** n).tex()}$`, `$1-${new F(1, 2 ** n).tex()}=${new F(2 ** n - 1, 2 ** n).tex()}$`],
            };
          }
          const a = r.int(2, 6),
            b = r.int(2, 6);
          const t = a + b;
          const both = (b * (b - 1)) / (t * (t - 1));
          return {
            q: `남학생 $${a}$ 명, 여학생 $${b}$ 명 중에서 대표 $2$ 명을 뽑을 때, 적어도 한 명은 남학생이 뽑힐 확률을 구하세요.`,
            answer: { type: 'num', value: 1 - both, display: 'frac' },
            steps: [`모든 경우: $${nCr(t, 2)}$, 모두 여학생: $${nCr(b, 2)}$`, `모두 여학생일 확률 $=${new F(nCr(b, 2), nCr(t, 2)).tex()}$`, `$1-${new F(nCr(b, 2), nCr(t, 2)).tex()}=${new F(nCr(t, 2) - nCr(b, 2), nCr(t, 2)).tex()}$`],
          };
        },
      },
      {
        id: 'and-or',
        title: '확률의 덧셈과 곱셈',
        gen(r, level) {
          if (level === 1) {
            const n = r.int(10, 20);
            const a = r.int(2, 5),
              b = r.int(6, 9);
            const ca = Math.floor(n / a),
              cb = Math.floor(n / b);
            if ((a * b) / gcd(a, b) <= n) return this.gen(r, level); // 공배수가 있으면 '동시에 일어나지 않음' 이 거짓
            return {
              q: `$1$ 부터 $${n}$ 까지의 자연수가 각각 적힌 카드 중에서 한 장을 뽑을 때, $${a}$ 의 배수 또는 $${b}$ 의 배수가 나올 확률을 구하세요.`,
              answer: { type: 'num', value: (ca + cb) / n, display: 'frac' },
              steps: [`$${a}$ 의 배수 $${ca}$ 개, $${b}$ 의 배수 $${cb}$ 개 (동시에 일어나지 않음)`, `$\\frac{${ca}}{${n}}+\\frac{${cb}}{${n}}=${new F(ca + cb, n).tex()}$`],
            };
          }
          if (level === 2) {
            const p = r.int(1, 9),
              q = r.int(1, 9);
            const [x, y] = r.sample(NAMES, 2);
            const both = (p * q) / 100;
            const ask = r.pick(['both', 'one']);
            const one = (p * (10 - q) + (10 - p) * q) / 100;
            return {
              q: `어떤 문제를 ${ga(x)} 맞힐 확률은 $${new F(p, 10).tex()}$, ${ga(y)} 맞힐 확률은 $${new F(q, 10).tex()}$ 이다. 두 사람이 이 문제를 풀 때, ${ask === 'both' ? '두 사람 모두 맞힐' : '한 사람만 맞힐'} 확률은?`,
              answer: numChoices(r, ask === 'both' ? both : one, [both, one, (p + q) / 20, 1 - both, (p * (10 - q)) / 100].filter((v) => v > 0 && v < 1), 5, 'frac'),
              steps:
                ask === 'both'
                  ? [`$${new F(p, 10).tex()}\\times${new F(q, 10).tex()}=${new F(p * q, 100).tex()}$`]
                  : [`${x}만 맞힘: $${new F(p, 10).tex()}\\times${new F(10 - q, 10).tex()}$, ${y}만 맞힘: $${new F(10 - p, 10).tex()}\\times${new F(q, 10).tex()}$`, `합: $${new F(p * (10 - q) + (10 - p) * q, 100).tex()}$`],
            };
          }
          const a = r.int(2, 6),
            b = r.int(2, 6);
          const t = a + b;
          const back = r.chance(0.5);
          const p = back ? (a * a) / (t * t) : (a * (a - 1)) / (t * (t - 1));
          return {
            q: `주머니에 당첨 제비 $${a}$ 개와 꽝 제비 $${b}$ 개가 들어 있다. 제비를 한 개 뽑아 확인하고 ${back ? '다시 넣은 후' : '다시 넣지 않고'} 한 개를 더 뽑을 때, 두 번 모두 당첨 제비일 확률을 구하세요.`,
            answer: { type: 'num', value: p, display: 'frac' },
            steps: back ? [`첫 번째 $\\frac{${a}}{${t}}$, 두 번째도 $\\frac{${a}}{${t}}$`, `$\\frac{${a}}{${t}}\\times\\frac{${a}}{${t}}=${new F(a * a, t * t).tex()}$`] : [`첫 번째 $\\frac{${a}}{${t}}$, 두 번째 $\\frac{${a - 1}}{${t - 1}}$`, `$\\frac{${a}}{${t}}\\times\\frac{${a - 1}}{${t - 1}}=${new F(a * (a - 1), t * (t - 1)).tex()}$`],
          };
        },
      },
    ],
  },
};
