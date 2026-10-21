// 중2-2 문장제(활용) 유형 추가분 — m2b.ts 의 단원별 skills 뒤에 이어 붙임
import type { Skill } from '../../core/types';
import { F } from '../../core/frac';
import { round } from '../../core/nt';
import { sqrtTex, dec, comma } from '../../core/tex';
import { Svg } from '../../core/fig';
import { NAMES, ga, neun, nm, mc, geo, triples, meet } from './util';

const deg = (x: number) => `${x}^\\circ`;
const ov = (s: string) => `\\overline{${s}}`;
const ang = (s: string) => `\\angle ${s}`;
/** 수 + 단위 (TeX 안) */
const u = (v: number | string, unit: string) => `${typeof v === 'number' ? dec(v) : v}\\,\\text{${unit}}`;
/** k·π (k 는 분수 가능) */
function piTex(k: F): string {
  if (k.n === 0) return '0';
  const s = k.n < 0 ? '-' : '';
  const a = Math.abs(k.n);
  if (k.d === 1) return `${s}${a === 1 ? '' : a}\\pi`;
  return `${s}\\frac{${a}}{${k.d}}\\pi`;
}
/** S − kπ */
const minusPi = (S: F, k: F) => `${S.tex()}-${piTex(k)}`;

const TRI = triples(30);
const TRI60 = triples(60);

export const M2B_WORD: Record<string, Skill[]> = {
  // ───────── 삼각형의 성질 ─────────
  'm2b-1': [
    {
      id: 'circum-word',
      title: '외심의 활용',
      gen(r, level) {
        if (level === 1) {
          const [a, b, c] = r.pick(TRI);
          const k = r.int(1, 3);
          const R = round((c * k) / 2);
          return {
            q: `$${ang('C')}=90^\\circ$ 인 직각삼각형 모양의 공원 $ABC$ 에서 $${ov('BC')}=${u(a * k, 'm')}$, $${ov('CA')}=${u(b * k, 'm')}$ 이다. 세 꼭짓점 $A$, $B$, $C$ 에 있는 출입구까지의 거리가 모두 같은 지점에 안내소를 세우려고 할 때, 안내소에서 각 출입구까지의 거리는 몇 m 인가요?`,
            answer: { type: 'num', value: R, unit: 'm', display: 'dec' },
            steps: [
              '세 꼭짓점에서 같은 거리에 있는 점은 외심이고, 직각삼각형의 외심은 빗변의 중점입니다.',
              `빗변 $${ov('AB')}=\\sqrt{${a * k}^2+${b * k}^2}=${c * k}\\,(\\text{m})$`,
              `거리 $=\\frac{1}{2}\\times${c * k}=${dec(R)}\\,(\\text{m})$`,
            ],
          };
        }
        if (level === 2) {
          if (r.chance(0.5)) {
            const x = r.int(10, 45);
            const y = r.int(10, 75 - x);
            const z = 90 - x - y;
            return {
              q: `세 마을 $A$, $B$, $C$ 에서 같은 거리에 있는 지점 $O$ 에 정수장을 지으려고 한다. 세 마을을 꼭짓점으로 하는 예각삼각형 $ABC$ 에서 $${ang('OAB')}=${deg(x)}$, $${ang('OBC')}=${deg(y)}$ 일 때, $${ang('OCA')}$ 의 크기를 구하세요.`,
              answer: { type: 'num', value: z, unit: '°' },
              steps: [
                `$O$ 는 세 꼭짓점에서 같은 거리에 있으므로 $\\triangle ABC$ 의 외심입니다.`,
                `외심의 성질: $${ang('OAB')}+${ang('OBC')}+${ang('OCA')}=90^\\circ$`,
                `$${ang('OCA')}=90^\\circ-${deg(x)}-${deg(y)}=${deg(z)}$`,
              ],
            };
          }
          const A = r.int(35, 80);
          return {
            q: `세 집 $A$, $B$, $C$ 에서 같은 거리에 있는 지점 $O$ 에 우물을 파려고 한다. 세 집을 꼭짓점으로 하는 예각삼각형 $ABC$ 에서 $${ang('BAC')}=${deg(A)}$ 일 때, $${ang('BOC')}$ 의 크기를 구하세요.`,
            answer: { type: 'num', value: 2 * A, unit: '°' },
            steps: [`$O$ 는 $\\triangle ABC$ 의 외심이므로 $${ang('BOC')}=2${ang('A')}$`, `$${ang('BOC')}=2\\times${deg(A)}=${deg(2 * A)}$`],
          };
        }
        const [a, b, c] = r.pick(TRI);
        const askLen = r.chance(0.4);
        const area = new F(c * c, 4);
        const right = askLen ? piTex(new F(c)) : piTex(area);
        const wrongs = askLen
          ? [piTex(new F(2 * c)), piTex(new F(c, 2)), piTex(new F(a + b)), piTex(area)]
          : [piTex(new F(c * c)), piTex(new F(c * c, 2)), piTex(new F(c)), piTex(new F(a * b, 2)), piTex(new F(c * c, 8))];
        return {
          q: `$${ang('C')}=90^\\circ$ 인 직각삼각형 모양의 땅 $ABC$ 에서 $${ov('BC')}=${u(a, 'm')}$, $${ov('CA')}=${u(b, 'm')}$ 이다. 세 꼭짓점 $A$, $B$, $C$ 를 모두 지나는 원 모양의 산책로를 만들 때, ${askLen ? '산책로의 길이(원의 둘레)' : '산책로로 둘러싸인 부분의 넓이'}는?`,
          answer: mc(r, right, wrongs),
          steps: [
            '세 꼭짓점을 지나는 원은 외접원이고, 직각삼각형의 외심은 빗변의 중점입니다.',
            `빗변 $=\\sqrt{${a}^2+${b}^2}=${c}$ 이므로 반지름은 $${new F(c, 2).tex()}\\,\\text{m}$`,
            askLen ? `둘레 $=2\\pi\\times${new F(c, 2).tex()}=${right}\\,(\\text{m})$` : `넓이 $=\\pi\\times\\left(${new F(c, 2).tex()}\\right)^2=${right}\\,(\\text{m}^2)$`,
          ],
        };
      },
    },
    {
      id: 'incircle-word',
      title: '내심의 활용',
      gen(r, level) {
        if (level === 1) {
          const [a0, b0, c0] = r.pick(TRI);
          const k = r.int(1, 3);
          const [a, b, c] = [a0 * k, b0 * k, c0 * k];
          const rr = (a * b) / (a + b + c);
          return {
            q: `세 변의 길이가 $${u(a, 'm')}$, $${u(b, 'm')}$, $${u(c, 'm')}$ 인 직각삼각형 모양의 땅에 세 변에 모두 접하는 원 모양의 연못을 만들려고 한다. 연못의 반지름의 길이를 구하세요.`,
            answer: { type: 'num', value: rr, unit: 'm' },
            steps: [
              '세 변에 모두 접하는 원은 내접원입니다. 반지름을 $r$ 이라 하면',
              `(넓이) $=\\frac{1}{2}\\times${a}\\times${b}=${(a * b) / 2}$, 또 (넓이) $=\\frac{1}{2}r(${a}+${b}+${c})=${(a + b + c) / 2}r$`,
              `$${(a + b + c) / 2}r=${(a * b) / 2}$ 이므로 $r=${rr}\\,(\\text{m})$`,
            ],
          };
        }
        if (level === 2) {
          const HER: [number, number, number, number][] = [
            [13, 14, 15, 84],
            [5, 5, 6, 12],
            [10, 10, 12, 48],
            [7, 15, 20, 42],
            [9, 10, 17, 36],
            [6, 25, 29, 60],
            [10, 17, 21, 84],
            [11, 13, 20, 66],
          ];
          const [x, y, z, S0] = r.pick(HER);
          const k = r.int(1, 3);
          const sides = r.shuffle([x * k, y * k, z * k]);
          const S = S0 * k * k;
          const P = (x + y + z) * k;
          const rr = round((2 * S) / P);
          return {
            q: `세 변의 길이가 각각 $${u(sides[0], 'm')}$, $${u(sides[1], 'm')}$, $${u(sides[2], 'm')}$ 이고 넓이가 $${S}\\,\\text{m}^2$ 인 삼각형 모양의 공원이 있다. 공원의 세 변(산책로)까지의 거리가 모두 같은 지점에 분수대를 만들 때, 분수대에서 각 산책로까지의 거리를 구하세요.`,
            answer: { type: 'num', value: rr, unit: 'm', display: 'dec' },
            steps: [
              '세 변까지의 거리가 같은 점은 내심이고, 그 거리는 내접원의 반지름 $r$ 입니다.',
              `$${S}=\\frac{1}{2}r(${sides.join('+')})=${P / 2}r$`,
              `$r=${S}\\div${P / 2}=${dec(rr)}\\,(\\text{m})$`,
            ],
          };
        }
        const [a, b, c] = r.pick(TRI);
        const rr = (a + b - c) / 2;
        const S = new F(a * b, 2);
        const right = minusPi(S, new F(rr * rr));
        return {
          q: `세 변의 길이가 $${u(a, 'm')}$, $${u(b, 'm')}$, $${u(c, 'm')}$ 인 직각삼각형 모양의 땅에 세 변에 모두 접하는 원 모양의 화단을 만들고, 나머지 부분에는 잔디를 심으려고 한다. 잔디를 심을 부분의 넓이는?`,
          answer: mc(r, right, [
            minusPi(new F(a * b), new F(rr * rr)),
            minusPi(S, new F(2 * rr)),
            minusPi(S, new F(4 * rr * rr)),
            minusPi(S, new F(c * c, 4)),
            minusPi(S, new F(rr)),
          ]),
          steps: [
            `내접원의 반지름을 $r$ 이라 하면 $\\frac{1}{2}\\times${a}\\times${b}=\\frac{1}{2}r(${a}+${b}+${c})$`,
            `$${(a * b) / 2}=${(a + b + c) / 2}r$ 이므로 $r=${rr}$`,
            `잔디 넓이 $=${S.tex()}-\\pi\\times${rr}^2=${right}\\,(\\text{m}^2)$`,
          ],
        };
      },
    },
  ],

  // ───────── 사각형의 성질 ─────────
  'm2b-2': [
    {
      id: 'para-word',
      title: '평행사변형의 활용',
      gen(r, level) {
        if (level === 1) {
          const x = r.int(5, 30),
            d = r.int(1, 10);
          const P = 2 * (2 * x + d);
          const name = r.pick(NAMES);
          return {
            q: `${neun(name)} 둘레의 길이가 $${u(P, 'm')}$ 인 평행사변형 $ABCD$ 모양의 화단을 만들었다. $${ov('AD')}$ 가 $${ov('AB')}$ 보다 $${u(d, 'm')}$ 더 길 때, $${ov('AD')}$ 의 길이를 구하세요.`,
            answer: { type: 'num', value: x + d, unit: 'm' },
            steps: [
              `$${ov('AB')}=x\\,\\text{m}$ 라 하면 $${ov('AD')}=(x+${d})\\,\\text{m}$, 평행사변형은 두 쌍의 대변의 길이가 같으므로`,
              `$2\\{x+(x+${d})\\}=${P}$, $2x+${d}=${P / 2}$, $x=${x}$`,
              `$${ov('AD')}=${x}+${d}=${x + d}\\,(\\text{m})$`,
            ],
          };
        }
        if (level === 2) {
          const PAIRS: [number, number][] = [
            [1, 2],
            [1, 3],
            [1, 4],
            [2, 3],
            [1, 5],
            [4, 5],
            [3, 7],
            [5, 7],
            [1, 8],
            [7, 11],
            [2, 7],
            [4, 11],
          ];
          const [m, n] = r.pick(PAIRS);
          const A = (180 * m) / (m + n),
            B = 180 - A;
          const askC = r.chance(0.5);
          return {
            q: `평행사변형 $ABCD$ 모양의 땅에서 $${ang('A')}$ 와 $${ang('B')}$ 의 크기의 비가 $${m}:${n}$ 일 때, $${askC ? ang('C') : ang('D')}$ 의 크기를 구하세요.`,
            answer: { type: 'num', value: askC ? A : B, unit: '°' },
            steps: [
              `평행사변형에서 이웃한 두 각의 합은 $180^\\circ$ 이므로 $${ang('A')}=180^\\circ\\times\\frac{${m}}{${m + n}}=${deg(A)}$, $${ang('B')}=${deg(B)}$`,
              `대각의 크기는 같으므로 $${askC ? `${ang('C')}=${ang('A')}=${deg(A)}` : `${ang('D')}=${ang('B')}=${deg(B)}`}$`,
            ],
          };
        }
        const a = r.int(4, 15),
          e = r.int(2, 10);
        const b = a + e;
        const A: [number, number] = [a / 2, (a * Math.sqrt(3)) / 2];
        const fig = geo(
          { A, B: [0, 0], C: [b, 0], D: [A[0] + b, A[1]], E: [a, 0] },
          { segs: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], ['A', 'E']], w: 260, h: 170 },
        );
        if (r.chance(0.5)) {
          return {
            q: `평행사변형 $ABCD$ 모양의 공원에서 $${ang('A')}$ 의 이등분선을 따라 길을 내었더니 변 $BC$ 와 점 $E$ 에서 만났다. $${ov('AB')}=${u(a, 'm')}$, $${ov('AD')}=${u(b, 'm')}$ 일 때, $${ov('EC')}$ 의 길이를 구하세요.`,
            fig,
            answer: { type: 'num', value: e, unit: 'm' },
            steps: [
              `$${ov('AD')}\\parallel${ov('BC')}$ 이므로 $${ang('DAE')}=${ang('AEB')}$ (엇각), 또 $${ang('BAE')}=${ang('DAE')}$`,
              `$\\triangle ABE$ 는 $${ang('BAE')}=${ang('BEA')}$ 인 이등변삼각형이므로 $${ov('BE')}=${ov('AB')}=${a}$`,
              `$${ov('EC')}=${ov('BC')}-${ov('BE')}=${b}-${a}=${e}\\,(\\text{m})$`,
            ],
          };
        }
        return {
          q: `평행사변형 $ABCD$ 모양의 공원에서 $${ang('A')}$ 의 이등분선을 따라 길을 내었더니 변 $BC$ 와 점 $E$ 에서 만났다. $${ov('AB')}=${u(a, 'm')}$, $${ov('EC')}=${u(e, 'm')}$ 일 때, 공원의 둘레의 길이를 구하세요.`,
          fig,
          answer: { type: 'num', value: 2 * (a + b), unit: 'm' },
          steps: [
            `$${ang('DAE')}=${ang('AEB')}$ (엇각) 이고 $${ang('BAE')}=${ang('DAE')}$ 이므로 $\\triangle ABE$ 는 이등변삼각형, $${ov('BE')}=${a}$`,
            `$${ov('BC')}=${a}+${e}=${b}$`,
            `둘레 $=2\\times(${a}+${b})=${2 * (a + b)}\\,(\\text{m})$`,
          ],
        };
      },
    },
    {
      id: 'quad-area-word',
      title: '사각형의 넓이 활용',
      gen(r, level) {
        if (level === 1) {
          const w = r.int(6, 30),
            h = r.int(4, 20);
          const para = r.chance(0.5);
          const [n1, n2] = r.sample(NAMES, 2);
          return {
            q: `${para ? `밑변의 길이가 $${u(w, 'm')}$, 높이가 $${u(h, 'm')}$ 인 평행사변형` : `가로 $${u(w, 'm')}$, 세로 $${u(h, 'm')}$ 인 직사각형`} 모양의 밭을 두 대각선의 교점을 지나는 직선으로 나누어 ${nm(n1)}와 ${ga(n2)} 나누어 가지려고 한다. 한 사람이 갖는 밭의 넓이를 구하세요.`,
            answer: { type: 'num', value: round((w * h) / 2), unit: 'm²', display: 'dec' },
            steps: [
              `${para ? '평행사변형' : '직사각형'}의 두 대각선의 교점을 지나는 직선은 넓이를 이등분합니다.`,
              `전체 넓이 $=${w}\\times${h}=${w * h}\\,(\\text{m}^2)$`,
              `한 사람 몫 $=${w * h}\\div2=${dec((w * h) / 2)}\\,(\\text{m}^2)$`,
            ],
          };
        }
        if (level === 2) {
          const S = r.int(10, 60) * 4;
          const x = r.int(Math.ceil(S / 10), Math.floor(S / 2 - S / 10));
          const [p1, p2] = r.pick([
            ['PAB', 'PCD'],
            ['PCD', 'PAB'],
            ['PAD', 'PBC'],
            ['PBC', 'PAD'],
          ]);
          return {
            q: `넓이가 $${S}\\,\\text{m}^2$ 인 평행사변형 $ABCD$ 모양의 공원 안의 한 점 $P$ 에 매점이 있고, 매점에서 네 꼭짓점까지 곧은 길이 나 있다. $\\triangle ${p1}$ 의 넓이가 $${x}\\,\\text{m}^2$ 일 때, $\\triangle ${p2}$ 의 넓이를 구하세요.`,
            answer: { type: 'num', value: S / 2 - x, unit: 'm²' },
            steps: [
              `평행사변형 내부의 한 점 $P$ 에 대하여 $\\triangle ${p1}+\\triangle ${p2}=\\frac{1}{2}\\square ABCD$`,
              `$${x}+\\triangle ${p2}=${S / 2}$`,
              `$\\triangle ${p2}=${S / 2 - x}\\,(\\text{m}^2)$`,
            ],
          };
        }
        const m = r.int(1, 3);
        let n = r.int(m + 1, 5);
        if (n % m === 0 && m > 1) n = m + 1;
        const t = r.int(1, 5);
        const sAOD = m * m * t,
          sAB = m * n * t,
          sBOC = n * n * t;
        const s = 2;
        const B: [number, number] = [0, 0],
          C: [number, number] = [n * s, 0],
          A: [number, number] = [n * 0.6, 4],
          D: [number, number] = [n * 0.6 + m * s, 4];
        const O = meet(A, C, B, D);
        const fig = geo({ A, B, C, D, O }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], ['A', 'C'], ['B', 'D']], w: 250, h: 160 });
        const askBOC = r.chance(0.4);
        return {
          q: `$${ov('AD')}\\parallel${ov('BC')}$ 인 사다리꼴 $ABCD$ 모양의 밭에 두 대각선을 따라 길을 내었고, 두 길의 교점을 $O$ 라 하자. $${ov('AD')}:${ov('BC')}=${m}:${n}$ 이고 $\\triangle AOD$ 의 넓이가 $${sAOD}\\,\\text{m}^2$ 일 때, ${askBOC ? '$\\triangle OBC$' : '$\\triangle ABO$'} 의 넓이를 구하세요.`,
          fig,
          answer: { type: 'num', value: askBOC ? sBOC : sAB, unit: 'm²' },
          steps: [
            `$\\triangle AOD\\sim\\triangle COB$ (AA 닮음) 이고 닮음비는 $${m}:${n}$ 이므로 $${ov('AO')}:${ov('OC')}=${m}:${n}$`,
            askBOC
              ? `넓이의 비는 $${m}^2:${n}^2$ 이므로 $\\triangle OBC=${sAOD}\\times\\frac{${n * n}}{${m * m}}=${sBOC}\\,(\\text{m}^2)$`
              : `높이가 같은 $\\triangle AOD$, $\\triangle DOC$ 의 넓이의 비는 $${m}:${n}$ 이므로 $\\triangle DOC=${sAOD}\\times\\frac{${n}}{${m}}=${sAB}$`,
            ...(askBOC ? [] : [`$\\triangle ABD=\\triangle ACD$ (밑변 $AD$, 높이 같음) 이므로 $\\triangle ABO=\\triangle DOC=${sAB}\\,(\\text{m}^2)$`]),
          ],
        };
      },
    },
  ],

  // ───────── 도형의 닮음 ─────────
  'm2b-3': [
    {
      id: 'shadow',
      title: '닮음을 이용한 높이·거리',
      gen(r, level) {
        if (level === 1) {
          const h0 = r.pick([1, 1.2, 1.5, 2]);
          const s0 = r.pick([0.8, 1, 1.5, 2, 2.5, 3].filter((x) => x !== h0));
          const k = r.int(2, 8);
          const S = round(s0 * k),
            H = round(h0 * k);
          const name = r.pick(NAMES);
          return {
            q: `${ga(name)} 길이가 $${u(h0, 'm')}$ 인 막대를 땅에 수직으로 세웠더니 그림자의 길이가 $${u(s0, 'm')}$ 였다. 같은 시각에 나무의 그림자의 길이가 $${u(S, 'm')}$ 일 때, 나무의 높이를 구하세요.`,
            answer: { type: 'num', value: H, unit: 'm', display: 'dec' },
            steps: [
              '막대와 그림자, 나무와 그림자가 만드는 두 직각삼각형은 닮음 (AA 닮음) 입니다.',
              `(나무의 높이) $:${dec(S)}=${dec(h0)}:${dec(s0)}$`,
              `$${dec(s0)}\\times$(나무의 높이)$=${dec(h0)}\\times${dec(S)}$ 이므로 (나무의 높이) $=${dec(round(h0 * S))}\\div${dec(s0)}=${dec(H)}\\,(\\text{m})$`,
            ],
          };
        }
        if (level === 2) {
          const p = r.int(2, 6),
            q = p + r.int(1, 4);
          const t = r.int(2, 8),
            uu = r.int(1, 3);
          const AB = p * t,
            BD = (q - p) * t,
            BC = p * uu,
            DE = q * uu;
          const fig = geo(
            { A: [0, 0], B: [0, -AB], D: [0, -AB - BD], C: [BC, -AB], E: [DE, -AB - BD] },
            { segs: [['A', 'D'], ['A', 'E'], ['B', 'C'], ['D', 'E']], sides: [['B', 'D', `${BD}m`], ['B', 'C', `${BC}m`], ['D', 'E', `${DE}m`]], w: 200, h: 220 },
          );
          return {
            q: `강 건너편의 나무 $A$ 와 강가의 지점 $B$ 사이의 거리를 구하려고 한다. 그림과 같이 세 점 $A$, $B$, $D$ 와 세 점 $A$, $C$, $E$ 가 각각 한 직선 위에 있고 $${ov('BC')}\\parallel${ov('DE')}$ 이다. $${ov('BD')}=${u(BD, 'm')}$, $${ov('BC')}=${u(BC, 'm')}$, $${ov('DE')}=${u(DE, 'm')}$ 일 때, $${ov('AB')}$ 의 길이를 구하세요.`,
            fig,
            answer: { type: 'num', value: AB, unit: 'm' },
            steps: [
              `$${ov('BC')}\\parallel${ov('DE')}$ 이므로 $\\triangle ABC\\sim\\triangle ADE$ (AA 닮음)`,
              `$${ov('AB')}=x$ 라 하면 $x:(x+${BD})=${BC}:${DE}$, $${DE}x=${BC}x+${BC * BD}$`,
              DE - BC === 1 ? `$x=${AB}\\,(\\text{m})$` : `$${DE - BC}x=${BC * BD}$, $x=${AB}\\,(\\text{m})$`,
            ],
          };
        }
        const h = r.pick([1.5, 1.6, 1.8]);
        const m = r.int(2, 4);
        const H = round(h * m);
        const s = r.pick([1, 1.5, 2, 2.5, 3]);
        const d = round(s * (m - 1));
        const name = r.pick(NAMES);
        const sv = new Svg(260, 150);
        const sc = 200 / (d + s);
        const L = 230 - (d + s) * sc;
        sv.line(10, 130, 250, 130);
        sv.line(L, 130, L, 130 - Math.min(110, H * 20), { width: 2 });
        sv.line(L + d * sc, 130, L + d * sc, 130 - Math.min(110, H * 20) / m, { width: 2, cls: 'acc' });
        sv.line(L, 130 - Math.min(110, H * 20), L + (d + s) * sc, 130, { dash: true });
        sv.text(L + (d * sc) / 2, 142, `${dec(d)}m`, { size: 11 });
        sv.text(L + d * sc + (s * sc) / 2, 142, '그림자', { size: 11, cls: 'acc2' });
        if (r.chance(0.5)) {
          return {
            q: `높이가 $${u(H, 'm')}$ 인 가로등에서 $${u(d, 'm')}$ 떨어진 곳에 키가 $${u(h, 'm')}$ 인 ${ga(name)} 서 있다. 가로등 불빛에 의해 생기는 ${nmName(name)} 그림자의 길이를 구하세요.`,
            fig: sv.toString(),
            answer: { type: 'num', value: s, unit: 'm', display: 'dec' },
            steps: [
              `그림자의 길이를 $x\\,\\text{m}$ 라 하면 사람과 그림자, 가로등과 (거리$+$그림자) 가 만드는 두 직각삼각형은 닮음`,
              `$${dec(h)}:${dec(H)}=x:(x+${dec(d)})$, $${dec(H)}x=${dec(h)}x+${dec(round(h * d))}$`,
              `$${dec(round(H - h))}x=${dec(round(h * d))}$, $x=${dec(s)}\\,(\\text{m})$`,
            ],
          };
        }
        return {
          q: `키가 $${u(h, 'm')}$ 인 ${ga(name)} 가로등에서 $${u(d, 'm')}$ 떨어진 곳에 서 있을 때, 가로등 불빛에 의해 생기는 그림자의 길이가 $${u(s, 'm')}$ 였다. 가로등의 높이를 구하세요.`,
          fig: sv.toString(),
          answer: { type: 'num', value: H, unit: 'm', display: 'dec' },
          steps: [
            `가로등의 높이를 $x\\,\\text{m}$ 라 하면 두 직각삼각형이 닮음이므로 $${dec(h)}:x=${dec(s)}:(${dec(d)}+${dec(s)})$`,
            `$${dec(s)}x=${dec(h)}\\times${dec(round(d + s))}$`,
            `$x=${dec(H)}\\,(\\text{m})$`,
          ],
        };
      },
    },
    {
      id: 'scale-word',
      title: '축척과 넓이·부피의 비 활용',
      gen(r, level) {
        if (level === 1) {
          const n = r.pick([5000, 10000, 20000, 25000, 50000]);
          const a = r.pick([2, 3, 4, 5, 6, 8, 10, 1.5, 2.5, 3.5, 4.5, 12]);
          const km = round((a * n) / 100000);
          const N = comma(n);
          const AN = comma(a * n);
          if (r.chance(0.5)) {
            return {
              q: `축척이 $1:${N}$ 인 지도에서 두 지점 사이의 거리가 $${u(a, 'cm')}$ 일 때, 실제 거리는 몇 km 인가요?`,
              answer: { type: 'num', value: km, unit: 'km', display: 'dec' },
              steps: [`실제 거리 $=${dec(a)}\\times${N}=${AN}\\,(\\text{cm})$`, `$1\\,\\text{km}=100{,}000\\,\\text{cm}$ 이므로 $${dec(km)}\\,\\text{km}$`],
            };
          }
          return {
            q: `실제 거리가 $${u(km, 'km')}$ 인 두 지점은 축척이 $1:${N}$ 인 지도에서 몇 cm 떨어져 있나요?`,
            answer: { type: 'num', value: a, unit: 'cm', display: 'dec' },
            steps: [`$${dec(km)}\\,\\text{km}=${AN}\\,\\text{cm}$`, `지도에서의 거리 $=${AN}\\div${N}=${dec(a)}\\,(\\text{cm})$`],
          };
        }
        if (level === 2) {
          const PAIRS: [number, number][] = [
            [1, 2],
            [2, 3],
            [1, 3],
            [3, 4],
            [2, 5],
            [3, 5],
          ];
          const [m, n] = r.pick(PAIRS);
          const t = r.int(1, 6);
          if (r.chance(0.5)) {
            const a = m * m * t * 10;
            return {
              q: `서로 닮은 두 직육면체 모양 상자의 닮음비가 $${m}:${n}$ 이다. 작은 상자의 겉면을 모두 칠하는 데 페인트 $${u(a, 'mL')}$ 가 들었다면, 큰 상자의 겉면을 모두 칠하는 데 필요한 페인트의 양을 구하세요.`,
              answer: { type: 'num', value: n * n * t * 10, unit: 'mL' },
              steps: [`겉넓이의 비는 $${m}^2:${n}^2=${m * m}:${n * n}$`, `$${a}\\times\\frac{${n * n}}{${m * m}}=${n * n * t * 10}\\,(\\text{mL})$`],
            };
          }
          const a = m * m * m * t * 50;
          return {
            q: `서로 닮은 두 원기둥 모양 물통의 밑면의 반지름이 각각 $${u(m * 5, 'cm')}$, $${u(n * 5, 'cm')}$ 이다. 작은 물통에 물이 가득 담기면 $${u(a, 'mL')}$ 일 때, 큰 물통에 가득 담기는 물의 양을 구하세요.`,
            answer: { type: 'num', value: n * n * n * t * 50, unit: 'mL' },
            steps: [`닮음비는 $${m * 5}:${n * 5}=${m}:${n}$ 이므로 부피의 비는 $${m}^3:${n}^3=${m ** 3}:${n ** 3}$`, `$${a}\\times\\frac{${n ** 3}}{${m ** 3}}=${n ** 3 * t * 50}\\,(\\text{mL})$`],
          };
        }
        const PAIRS: [number, number][] = [
          [1, 2],
          [2, 3],
          [1, 3],
          [3, 4],
          [2, 5],
          [3, 5],
        ];
        const [m, n] = r.pick(PAIRS);
        const t = r.int(1, 5) * (m === 1 ? 10 : 2);
        const a = m ** 3 * t,
          full = n ** 3 * t;
        const askMore = r.chance(0.6);
        return {
          q: `원뿔 모양의 그릇에 물을 부어 그릇 높이의 $${new F(m, n).tex()}$ 까지 채웠더니 물의 부피가 $${u(a, 'mL')}$ 였다. (단, 그릇의 꼭짓점이 아래쪽에 있다.) ${askMore ? '그릇을 가득 채우려면 물을 몇 mL 더 부어야 하나요?' : '그릇에 가득 담기는 물의 양은 몇 mL 인가요?'}`,
          answer: { type: 'num', value: askMore ? full - a : full, unit: 'mL' },
          steps: [
            `물이 채워진 부분과 그릇은 닮은 원뿔이고 닮음비는 $${m}:${n}$`,
            `부피의 비는 $${m ** 3}:${n ** 3}$ 이므로 그릇 전체의 부피 $=${a}\\times\\frac{${n ** 3}}{${m ** 3}}=${full}\\,(\\text{mL})$`,
            ...(askMore ? [`더 부어야 할 양 $=${full}-${a}=${full - a}\\,(\\text{mL})$`] : []),
          ],
        };
      },
    },
  ],

  // ───────── 피타고라스 정리 ─────────
  'm2b-4': [
    {
      id: 'ladder',
      title: '피타고라스 정리의 실생활 활용',
      gen(r, level) {
        if (level === 1) {
          const L: [number, number, number][] = [
            [0.7, 2.4, 2.5],
            [1.5, 2, 2.5],
            [1.2, 1.6, 2],
            [1, 2.4, 2.6],
            [1.8, 2.4, 3],
            [0.9, 1.2, 1.5],
            [3, 4, 5],
            [2.1, 2.8, 3.5],
            [1.5, 3.6, 3.9],
            [0.8, 1.5, 1.7],
          ];
          const [a, b, c] = r.pick(L);
          const askH = r.chance(0.6);
          const name = r.pick(NAMES);
          return {
            q: askH
              ? `${neun(name)} 길이가 $${u(c, 'm')}$ 인 사다리를 벽에 기대어 세웠다. 사다리의 아래쪽 끝이 벽에서 $${u(a, 'm')}$ 떨어져 있을 때, 사다리의 위쪽 끝은 땅에서 몇 m 높이에 있나요?`
              : `${neun(name)} 길이가 $${u(c, 'm')}$ 인 사다리를 벽에 기대어 세웠더니 사다리의 위쪽 끝이 땅에서 $${u(b, 'm')}$ 높이에 닿았다. 사다리의 아래쪽 끝은 벽에서 몇 m 떨어져 있나요?`,
            answer: { type: 'num', value: askH ? b : a, unit: 'm', display: 'dec' },
            steps: [
              '벽, 땅, 사다리는 사다리를 빗변으로 하는 직각삼각형을 이룹니다.',
              askH ? `높이 $=\\sqrt{${dec(c)}^2-${dec(a)}^2}=\\sqrt{${dec(round(c * c - a * a))}}$` : `거리 $=\\sqrt{${dec(c)}^2-${dec(b)}^2}=\\sqrt{${dec(round(c * c - b * b))}}$`,
              `$=${dec(askH ? b : a)}\\,(\\text{m})$`,
            ],
          };
        }
        if (level === 2) {
          const SETS: Record<number, number[]> = { 25: [7, 24, 15, 20], 50: [14, 48, 30, 40], 65: [16, 63, 25, 60, 33, 56, 39, 52] };
          const c = r.pick([25, 50, 65]);
          const hs = r.sample(SETS[c], 2).sort((x, y) => y - x);
          const [b1, b2] = hs;
          const a1 = Math.round(Math.sqrt(c * c - b1 * b1)),
            a2 = Math.round(Math.sqrt(c * c - b2 * b2));
          const f = (x: number) => dec(x / 10);
          return {
            q: `길이가 $${u(f(c), 'm')}$ 인 사다리가 벽에 기대어 있고, 사다리의 위쪽 끝은 땅에서 $${u(f(b1), 'm')}$ 높이에 있다. 사다리의 위쪽 끝이 벽을 따라 $${u(f(b1 - b2), 'm')}$ 미끄러져 내려왔을 때, 사다리의 아래쪽 끝은 처음보다 벽에서 몇 m 더 멀어졌나요?`,
            answer: { type: 'num', value: round((a2 - a1) / 10), unit: 'm', display: 'dec' },
            steps: [
              `처음 아래쪽 끝과 벽 사이의 거리: $\\sqrt{${f(c)}^2-${f(b1)}^2}=${f(a1)}\\,(\\text{m})$`,
              `미끄러진 뒤 높이는 $${f(b2)}\\,\\text{m}$ 이므로 거리: $\\sqrt{${f(c)}^2-${f(b2)}^2}=${f(a2)}\\,(\\text{m})$`,
              `$${f(a2)}-${f(a1)}=${f(a2 - a1)}\\,(\\text{m})$`,
            ],
          };
        }
        const [a, b, c] = r.pick(TRI);
        if (r.chance(0.5)) {
          const swap = r.chance(0.5);
          const x = swap ? b : a,
            d = swap ? a : b;
          const H = x + c;
          return {
            q: `높이가 $${u(H, 'm')}$ 인 나무가 바람에 부러져서 나무의 꼭대기가 밑동으로부터 $${u(d, 'm')}$ 떨어진 땅에 닿았다. 나무가 부러진 곳은 땅에서 몇 m 높이인가요? (단, 나무는 땅에 수직으로 서 있었다.)`,
            answer: { type: 'num', value: x, unit: 'm' },
            steps: [
              `부러진 곳의 높이를 $x\\,\\text{m}$ 라 하면 부러진 윗부분의 길이는 $(${H}-x)\\,\\text{m}$ 이고, 이것이 직각삼각형의 빗변입니다.`,
              `$x^2+${d}^2=(${H}-x)^2$, $x^2+${d * d}=${H * H}-${2 * H}x+x^2$`,
              `$${2 * H}x=${H * H - d * d}$, $x=${x}$ (이때 윗부분 $${c}\\,\\text{m}$ 로 조건에 맞음)`,
            ],
          };
        }
        const h2 = r.int(2, 10),
          h1 = h2 + a;
        return {
          q: `높이가 각각 $${u(h1, 'm')}$, $${u(h2, 'm')}$ 인 두 전봇대가 $${u(b, 'm')}$ 떨어져 땅에 수직으로 서 있다. 두 전봇대의 꼭대기를 전선으로 팽팽하게 연결할 때, 전선의 길이를 구하세요.`,
          answer: { type: 'num', value: c, unit: 'm' },
          steps: [`두 꼭대기의 높이 차는 $${h1}-${h2}=${a}\\,(\\text{m})$`, `전선의 길이 $=\\sqrt{${b}^2+${a}^2}=\\sqrt{${c * c}}$`, `$=${c}\\,(\\text{m})$`],
        };
      },
    },
    {
      id: 'shortest-path',
      title: '입체도형의 겉면 위의 최단 거리',
      gen(r, level) {
        if (level === 1) {
          const [p, q, s] = r.pick(TRI60.filter((t) => t[2] <= 40));
          const along = r.chance(0.5) ? p : q;
          const c = along === p ? q : p;
          const a = r.int(1, along - 1),
            b = along - a;
          return {
            q: `가로 $${u(a, 'cm')}$, 세로 $${u(b, 'cm')}$, 높이 $${u(c, 'cm')}$ 인 직육면체 모양의 상자가 있다. 개미가 밑면의 한 꼭짓점 $A$ 에서 출발하여 앞면과 옆면을 지나 윗면의 맞은편 꼭짓점 $G$ 까지 겉면을 따라 갈 때, 가장 짧은 거리를 구하세요. (단, 앞면의 가로는 $${u(a, 'cm')}$, 옆면의 가로는 $${u(b, 'cm')}$ 이다.)`,
            answer: { type: 'num', value: s, unit: 'cm' },
            steps: [
              `앞면과 옆면을 펼치면 가로 $${a}+${b}=${along}$, 세로 $${c}$ 인 직사각형이 되고, 최단 경로는 그 대각선입니다.`,
              `$\\sqrt{${along}^2+${c}^2}=\\sqrt{${s * s}}=${s}\\,(\\text{cm})$`,
            ],
          };
        }
        if (level === 2) {
          const twice = r.chance(0.35);
          const cand = TRI60.filter((t) => t[2] <= 60 && (!twice || t[0] % 2 === 0 || t[1] % 2 === 0));
          const [p, q, s] = r.pick(cand);
          let around: number, h: number;
          if (twice) {
            around = p % 2 === 0 ? p : q;
            h = around === p ? q : p;
          } else {
            around = r.chance(0.5) ? p : q;
            h = around === p ? q : p;
          }
          const P = twice ? around / 2 : around;
          return {
            q: `밑면의 둘레의 길이가 $${u(P, 'cm')}$ 이고 높이가 $${u(h, 'cm')}$ 인 원기둥이 있다. 옆면의 아래쪽 한 점 $A$ 에서 출발하여 실을 옆면을 따라 ${twice ? '두 바퀴' : '한 바퀴'} 감아 점 $A$ 의 바로 위에 있는 윗면의 점 $B$ 까지 연결할 때, 실의 길이의 최솟값을 구하세요.`,
            answer: { type: 'num', value: s, unit: 'cm' },
            steps: [
              `옆면의 전개도는 가로 $${P}$, 세로 $${h}$ 인 직사각형${twice ? '이고, 두 바퀴 감으면 이 직사각형 두 개를 이어 붙인 가로 $' + around + '$ 인 직사각형의 대각선이 됩니다.' : '이고, 최단 경로는 그 대각선입니다.'}`,
              `$\\sqrt{${around}^2+${h}^2}=\\sqrt{${s * s}}=${s}\\,(\\text{cm})$`,
            ],
          };
        }
        const dims = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3).sort((x, y) => x - y);
        const [a, b, c] = dims;
        const c1 = (a + b) ** 2 + c * c,
          c2 = (a + c) ** 2 + b * b,
          c3 = (b + c) ** 2 + a * a;
        const shown = r.shuffle(dims);
        return {
          q: `가로, 세로, 높이가 각각 $${u(shown[0], 'cm')}$, $${u(shown[1], 'cm')}$, $${u(shown[2], 'cm')}$ 인 직육면체의 한 꼭짓점에서 출발하여 겉면을 따라 가장 멀리 떨어진 꼭짓점까지 가는 최단 거리는?`,
          answer: mc(r, sqrtTex(c1), [sqrtTex(c2), sqrtTex(c3), sqrtTex(a * a + b * b + c * c), `${a + b + c}`]),
          steps: [
            '두 면을 지나는 경로를 펼치면 직사각형의 대각선이 되며, 어느 두 모서리를 이어 붙이느냐에 따라 세 가지가 있습니다.',
            `$\\sqrt{(${a}+${b})^2+${c}^2}=\\sqrt{${c1}}$, $\\sqrt{(${a}+${c})^2+${b}^2}=\\sqrt{${c2}}$, $\\sqrt{(${b}+${c})^2+${a}^2}=\\sqrt{${c3}}$`,
            `가장 짧은 것은 $${sqrtTex(c1) === `\\sqrt{${c1}}` ? '' : `\\sqrt{${c1}}=`}${sqrtTex(c1)}\\,(\\text{cm})$ (가장 긴 모서리를 따로 두고 짧은 두 모서리를 이어 붙인 경우)`,
          ],
        };
      },
    },
  ],
};

/** 이름 + 의 */
function nmName(name: string): string {
  const c = name.charCodeAt(name.length - 1);
  return (c - 0xac00) % 28 !== 0 ? `${name}이의` : `${name}의`;
}
