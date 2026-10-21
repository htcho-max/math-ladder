// 기하 심화·최상위 유형 — geo.ts 의 각 단원 skills / top 뒤에 덧붙임
import { F } from '../../core/frac';
import { sqrtTex } from '../../core/tex';
import { ans, cst, fld, fr, isq, pr, ro, T, tt, type Hard, withJosa } from './hard-util';

const P2 = (x: number | F, y: number | F) => `(${T(x)}, ${T(y)})`;
const P3 = (x: number, y: number, z: number) => `(${x}, ${y}, ${z})`;
const ell = (A: number, B: number) => `\\frac{x^{2}}{${A}}+\\frac{y^{2}}{${B}}=1`;
const hyp = (A: number, B: number) => `\\frac{x^{2}}{${A}}-\\frac{y^{2}}{${B}}=1`;
const sqx = (v: string, a: number) => (a === 0 ? `${v}^{2}` : `(${v}${cst(-a)})^{2}`);
const ov = (s: string) => `\\overrightarrow{${s}}`;
const k1 = (k: number) => (k === 1 ? '' : `${k}`);
/** y 좌표가 √3 의 배수인 수 TeX */
const r3 = (f: F) => {
  if (f.n === 0) return '0';
  const s = f.n < 0 ? '-' : '';
  const n = Math.abs(f.n);
  return f.d === 1 ? `${s}${n === 1 ? '' : n}\\sqrt{3}` : `${s}\\frac{${n === 1 ? '' : n}\\sqrt{3}}{${f.d}}`;
};
type V2 = [F, F];
const sub = (a: V2, b: V2): V2 => [a[0].sub(b[0]), a[1].sub(b[1])];
const add = (a: V2, b: V2): V2 => [a[0].add(b[0]), a[1].add(b[1])];
const scl = (a: V2, k: number): V2 => [a[0].mul(k), a[1].mul(k)];

export const GEO_HARD: Hard = withJosa(
  {
    // ───────── 이차곡선
    'geo-1': {
      skills: [
        {
          id: 'focal-triangle',
          title: '초점과 곡선 위의 점이 만드는 삼각형',
          gen(r, level) {
            if (level === 1) {
              const [a, b, c] = r.pick([
                [5, 4, 3],
                [5, 3, 4],
                [13, 12, 5],
                [13, 5, 12],
                [10, 8, 6],
                [10, 6, 8],
                [17, 15, 8],
                [17, 8, 15],
              ] as [number, number, number][]);
              return {
                q: `타원 $${ell(a * a, b * b)}$ 의 두 초점을 $F$, $F'$ 이라 하자. 타원 위의 점 $P$ (단, $P$ 는 $x$ 축 위에 있지 않음) 에 대하여 삼각형 $PFF'$ 의 둘레의 길이를 구하세요.`,
                answer: ans(2 * a + 2 * c),
                steps: [`$a=${a}$, $b=${b}$, $c=\\sqrt{${a * a}-${b * b}}=${c}$`, `타원의 정의: $\\overline{PF}+\\overline{PF'}=2a=${2 * a}$, $\\overline{FF'}=2c=${2 * c}$`, `둘레 $=${2 * a}+${2 * c}=${2 * a + 2 * c}$`],
              };
            }
            if (level === 2) {
              const [a, b, c] = r.pick([
                [3, 4, 5],
                [4, 3, 5],
                [5, 12, 13],
                [12, 5, 13],
                [6, 8, 10],
                [8, 6, 10],
              ] as [number, number, number][]);
              const d = r.int(c - a + 1, c - a + 10);
              return {
                q: `쌍곡선 $${hyp(a * a, b * b)}$ 의 두 초점을 $F(${c}, 0)$, $F'(-${c}, 0)$ 이라 하자. 쌍곡선 위의 제1사분면의 점 $P$ 에 대하여 $\\overline{PF}=${d}$ 일 때, $\\overline{PF'}$ 의 값을 구하세요.`,
                answer: ans(d + 2 * a),
                steps: [`$a=${a}$ 이고 쌍곡선의 정의에서 $|\\overline{PF'}-\\overline{PF}|=2a=${2 * a}$`, `$P$ 는 오른쪽 가지 위에 있어 $F$ 에 더 가까우므로 $\\overline{PF'}=\\overline{PF}+${2 * a}=${d + 2 * a}$`],
              };
            }
            const isE = r.chance(0.5);
            const [a, b] = isE
              ? r.pick([
                  [5, 3],
                  [13, 5],
                  [10, 6],
                  [17, 8],
                  [25, 7],
                ] as [number, number][])
              : r.pick([
                  [3, 4],
                  [4, 3],
                  [5, 12],
                  [12, 5],
                  [6, 8],
                  [2, 3],
                ] as [number, number][]);
            const eq = isE ? ell(a * a, b * b) : hyp(a * a, b * b);
            return {
              q: `${isE ? '타원' : '쌍곡선'} $${eq}$ 의 두 초점을 $F$, $F'$ 이라 하자. 이 곡선 위의 점 $P$ 에 대하여 $\\angle FPF'=90^{\\circ}$ 일 때, 삼각형 $PFF'$ 의 넓이를 구하세요.`,
              answer: ans(b * b),
              steps: [
                `$\\overline{PF}=m$, $\\overline{PF'}=n$ 이라 하면 ${isE ? `$m+n=${2 * a}$` : `$|m-n|=${2 * a}$`}`,
                `피타고라스: $m^{2}+n^{2}=\\overline{FF'}^{2}=4c^{2}=4(${a * a}${isE ? '-' : '+'}${b * b})$`,
                isE ? `$(m+n)^{2}-(m^{2}+n^{2})=2mn=${4 * a * a}-4c^{2}=4\\times${b * b}$` : `$(m^{2}+n^{2})-(m-n)^{2}=2mn=4c^{2}-${4 * a * a}=4\\times${b * b}$`,
                `넓이 $=\\frac{1}{2}mn=${b * b}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-shared-foci-area',
          title: '초점을 공유하는 타원과 쌍곡선',
          gen(r) {
            const opts: [number, number, number, number][] = [];
            for (const c2 of [9, 16, 25, 36, 49])
              for (let C = 1; C < c2; C++)
                for (let B = 1; B <= 40; B++) {
                  const D = c2 - C;
                  if (isq(B * D) > 0) opts.push([B + c2, B, C, D]);
                }
            const [A, B, C, D] = r.pick(opts);
            const c2 = A - B;
            const S = isq(B * D);
            const cosF = fr(A + C - 2 * c2, A - C);
            return {
              q: `타원 $${ell(A, B)}$ 과 쌍곡선 $${hyp(C, D)}$ 의 두 초점은 $F$, $F'$ 으로 같다. 두 곡선이 제1사분면에서 만나는 점을 $P$ 라 할 때, 삼각형 $PFF'$ 의 넓이를 구하세요.`,
              answer: ans(S),
              steps: [
                `초점: $c^{2}=${A}-${B}=${C}+${D}=${c2}$`,
                `$\\overline{PF}+\\overline{PF'}=2\\sqrt{${A}}$, $|\\overline{PF}-\\overline{PF'}|=2\\sqrt{${C}}$`,
                `$\\overline{PF}\\times\\overline{PF'}=\\frac{4\\times${A}-4\\times${C}}{4}=${A - C}$, $\\overline{PF}^{2}+\\overline{PF'}^{2}=\\frac{4\\times${A}+4\\times${C}}{2}=${2 * (A + C)}$`,
                `코사인법칙: $${4 * c2}=${2 * (A + C)}-2\\times${A - C}\\cos\\theta$ → $\\cos\\theta=${T(cosF)}$`,
                `$\\sin\\theta=\\sqrt{1-\\left(${T(cosF)}\\right)^{2}}=${T(fr(2 * S, A - C))}$`,
                `넓이 $=\\frac{1}{2}\\times${A - C}\\times${T(fr(2 * S, A - C))}=${S}$`,
              ],
            };
          },
        },
        {
          id: 'top-parabola-focal-chord',
          title: '포물선의 초점을 지나는 현',
          gen(r) {
            const p = r.pick([1, 2, 3, 4, 6]);
            const divs: number[] = [];
            for (let d = 1; d <= p * p; d++) if ((p * p) % d === 0 && d <= 3 * p) divs.push(d);
            const d = r.pick(divs);
            const m = p + d;
            const BF = p + (p * p) / d;
            const vert = r.chance(0.4);
            const eq = vert ? `x^{2}=${4 * p}y` : `y^{2}=${4 * p}x`;
            const u = vert ? 'y' : 'x';
            return {
              q: `포물선 $${eq}$ 의 초점 $F$ 를 지나는 직선이 포물선과 만나는 두 점을 $A$, $B$ 라 하자. $\\overline{AF}=${m}$ 일 때, $\\overline{AB}$ 의 값을 구하세요.`,
              answer: ans(m + BF),
              steps: [
                `초점 $F${vert ? P2(0, p) : P2(p, 0)}$, 준선 $${u}=-${p}$`,
                `포물선의 정의: $\\overline{AF}=${u}_A+${p}=${m}$ → $${u}_A=${d}$`,
                vert
                  ? `직선 $y=tx+${p}$ 를 대입: $x^{2}-${4 * p}tx-${4 * p * p}=0$ → $x_Ax_B=-${4 * p * p}$, $y_Ay_B=\\frac{(x_Ax_B)^{2}}{${16 * p * p}}=${p * p}$`
                  : `직선 $x=ty+${p}$ 를 대입: $y^{2}-${4 * p}ty-${4 * p * p}=0$ → $y_Ay_B=-${4 * p * p}$, $x_Ax_B=\\frac{(y_Ay_B)^{2}}{${16 * p * p}}=${p * p}$`,
                `$${u}_B=\\frac{${p * p}}{${d}}=${(p * p) / d}$ → $\\overline{BF}=${(p * p) / d}+${p}=${BF}$`,
                `$\\overline{AB}=${m}+${BF}=${m + BF}$`,
              ],
            };
          },
        },
      ],
    },

    // ───────── 이차곡선과 직선
    'geo-2': {
      skills: [
        {
          id: 'chord-midpoint',
          title: '현의 중점과 기울기',
          gen(r, level) {
            for (;;) {
              if (level === 1) {
                const p = r.int(1, 4),
                  h = r.int(1, 6),
                  k = r.nonzero(-5, 5);
                if (k * k >= 4 * p * h) continue;
                const m = fr(2 * p, k);
                return {
                  q: `포물선 $y^{2}=${4 * p}x$ 의 현의 중점이 $M${P2(h, k)}$ 일 때, 이 현의 기울기를 구하세요.`,
                  answer: ans(m),
                  steps: [
                    `현의 양 끝 $(x_1, y_1)$, $(x_2, y_2)$: $y_1^{2}=${4 * p}x_1$, $y_2^{2}=${4 * p}x_2$`,
                    `빼면 $(y_1+y_2)(y_1-y_2)=${4 * p}(x_1-x_2)$, $y_1+y_2=${2 * k}$`,
                    `기울기 $\\frac{y_1-y_2}{x_1-x_2}=\\frac{${4 * p}}{${2 * k}}=${T(m)}$`,
                  ],
                };
              }
              const a = r.int(2, 5),
                b = r.int(1, 4);
              if (a === b) continue;
              const h = r.nonzero(-3, 3),
                k = r.nonzero(-3, 3);
              if (level === 2) {
                if (
                  fr(h * h, a * a)
                    .add(fr(k * k, b * b))
                    .cmp(1) >= 0
                )
                  continue;
                const m = fr(-b * b * h, a * a * k);
                return {
                  q: `타원 $${ell(a * a, b * b)}$ 의 현의 중점이 $M${P2(h, k)}$ 일 때, 이 현의 기울기를 구하세요.`,
                  answer: ans(m),
                  steps: [
                    `양 끝 $(x_1, y_1)$, $(x_2, y_2)$ 를 대입한 두 식을 빼면 $\\frac{(x_1+x_2)(x_1-x_2)}{${a * a}}+\\frac{(y_1+y_2)(y_1-y_2)}{${b * b}}=0$`,
                    `$x_1+x_2=${2 * h}$, $y_1+y_2=${2 * k}$ 이므로 $\\frac{${2 * h}}{${a * a}}+\\frac{${2 * k}}{${b * b}}m=0$`,
                    `$m=${T(m)}$ ($M$ 이 타원 내부라 이런 현이 있어요)`,
                  ],
                };
              }
              const m = fr(b * b * h, a * a * k);
              // 존재 확인: b^2 - a^2 m^2 ≠ 0, 판별식 > 0
              const cc = fr(k).sub(m.mul(h));
              const A2 = fr(b * b).sub(m.mul(m).mul(a * a));
              if (A2.n === 0) continue;
              const D4 = m
                .mul(m)
                .mul(a ** 4)
                .mul(cc.mul(cc))
                .add(
                  A2.mul(
                    cc
                      .mul(cc)
                      .mul(a * a)
                      .add(a * a * b * b),
                  ),
                );
              if (D4.n <= 0) continue;
              const n = cc;
              return {
                q: `쌍곡선 $${hyp(a * a, b * b)}$ 의 현의 중점이 $M${P2(h, k)}$ 일 때, 이 현을 포함하는 직선의 $y$ 절편을 구하세요.`,
                answer: ans(n),
                steps: [
                  `두 식을 빼면 $\\frac{(x_1+x_2)(x_1-x_2)}{${a * a}}-\\frac{(y_1+y_2)(y_1-y_2)}{${b * b}}=0$`,
                  `$\\frac{${2 * h}}{${a * a}}-\\frac{${2 * k}}{${b * b}}m=0$ → $m=${T(m)}$`,
                  `직선 $y=${T(m)}(x${cst(-h)})${cst(k)}$ (대입하면 실제로 두 점에서 만나요)`,
                  `$y$ 절편 $${k}-${pr(m)}\\times${pr(h)}=${T(n)}$`,
                ],
              };
            }
          },
        },
      ],
      top: [
        {
          id: 'top-perp-tangents-point',
          title: '서로 수직인 두 접선을 그을 수 있는 점',
          gen(r) {
            for (;;) {
              const isE = r.chance(0.6);
              const a = r.int(2, 6),
                b = r.int(1, 5);
              if (!isE && a <= b) continue;
              const R2 = isE ? a * a + b * b : a * a - b * b;
              const s = r.int(0, Math.floor(Math.sqrt(R2 - 1)));
              if (s === a) continue;
              const t2 = R2 - s * s;
              if (t2 <= 0) continue;
              if (!isE) {
                const t = Math.sqrt(t2);
                const A = s * s - a * a,
                  B = -2 * s * t,
                  C = t2 + b * b;
                const disc = B * B - 4 * A * C;
                if (disc <= 0) continue;
                const ms = [(-B + Math.sqrt(disc)) / (2 * A), (-B - Math.sqrt(disc)) / (2 * A)];
                if (!ms.every((m) => Math.abs(m) > b / a + 1e-9)) continue;
              }
              const eq = isE ? ell(a * a, b * b) : hyp(a * a, b * b);
              const tan = isE ? `y=mx\\pm\\sqrt{${a * a}m^{2}+${b * b}}` : `y=mx\\pm\\sqrt{${a * a}m^{2}-${b * b}}`;
              return {
                q: `점 $P(${s}, t)$ $(t>0)$ 에서 ${isE ? '타원' : '쌍곡선'} $${eq}$ 에 그은 두 접선이 서로 수직일 때, $t^{2}$ 의 값을 구하세요.`,
                answer: ans(t2),
                steps: [
                  `기울기가 $m$ 인 접선: $${tan}$`,
                  `$P$ 를 지나므로 $${s === 0 ? 't^{2}' : `(t-${s === 1 ? '' : s}m)^{2}`}=${a * a}m^{2}${isE ? '+' : '-'}${b * b}$`,
                  `$m$ 에 대해 정리: $${tt([s * s - a * a, 'm^{2}'], [-2 * s, 'tm'])}+(t^{2}${isE ? '-' : '+'}${b * b})=0$`,
                  `두 접선이 수직 ⇔ 두 근의 곱 $=-1$: $\\frac{t^{2}${isE ? '-' : '+'}${b * b}}{${s * s - a * a}}=-1$`,
                  `$t^{2}=${a * a}${isE ? '+' : '-'}${b * b}-${s * s}=${t2}$`,
                ],
              };
            }
          },
        },
        {
          id: 'top-tangent-axes-min',
          title: '타원의 접선과 좌표축이 만드는 최솟값',
          gen(r) {
            const a = r.int(2, 8);
            let b = r.int(1, 7);
            if (b === a) b = a + 1;
            const area = r.chance(0.5);
            return {
              q: `타원 $${ell(a * a, b * b)}$ 위의 제1사분면의 점 $P$ 에서의 접선이 $x$ 축, $y$ 축과 만나는 점을 각각 $A$, $B$ 라 할 때, ${area ? '삼각형 $OAB$ 의 넓이' : '선분 $AB$ 의 길이'}의 최솟값을 구하세요. (단, $O$ 는 원점)`,
              answer: ans(area ? a * b : a + b),
              steps: [
                `$P(x_1, y_1)$ 에서의 접선 $\\frac{x_1x}{${a * a}}+\\frac{y_1y}{${b * b}}=1$ → $A\\left(\\frac{${a * a}}{x_1}, 0\\right)$, $B\\left(0, \\frac{${b * b}}{y_1}\\right)$`,
                ...(area
                  ? [
                      `넓이 $=\\frac{${a * a * b * b}}{2x_1y_1}$`,
                      `산술·기하평균: $1=\\frac{x_1^{2}}{${a * a}}+\\frac{y_1^{2}}{${b * b}}\\ge\\frac{2x_1y_1}{${a * b}}$ → $x_1y_1\\le\\frac{${a * b}}{2}$`,
                      `넓이 $\\ge\\frac{${a * a * b * b}}{${a * b}}=${a * b}$ (등호: $\\frac{x_1}{${a}}=\\frac{y_1}{${b}}=\\frac{1}{\\sqrt{2}}$)`,
                    ]
                  : [
                      `$\\overline{AB}^{2}=\\frac{${a ** 4}}{x_1^{2}}+\\frac{${b ** 4}}{y_1^{2}}=\\left(\\frac{${a ** 4}}{x_1^{2}}+\\frac{${b ** 4}}{y_1^{2}}\\right)\\left(\\frac{x_1^{2}}{${a * a}}+\\frac{y_1^{2}}{${b * b}}\\right)$`,
                      `$=${a * a}+${b * b}+\\frac{${a ** 4}y_1^{2}}{${b * b}x_1^{2}}+\\frac{${b ** 4}x_1^{2}}{${a * a}y_1^{2}}\\ge${a * a}+${b * b}+2\\times${a * b}=${(a + b) ** 2}$`,
                      `$\\overline{AB}\\ge${a + b}$ (등호: $\\frac{y_1^{2}}{x_1^{2}}=\\frac{${b ** 3}}{${a ** 3}}$)`,
                    ]),
              ],
            };
          },
        },
      ],
    },

    // ───────── 벡터의 연산
    'geo-3': {
      skills: [
        {
          id: 'vector-area-ratio',
          title: '벡터 등식으로 넓이의 비 구하기',
          gen(r, level) {
            const names = ['PBC', 'PCA', 'PAB'];
            if (level <= 2) {
              const w = [r.int(1, level === 1 ? 3 : 5), r.int(1, level === 1 ? 3 : 5), r.int(1, level === 1 ? 3 : 5)];
              const S = w[0] + w[1] + w[2];
              const u = r.int(1, 4);
              const Ta = S * u;
              const i = r.int(0, 2);
              return {
                q: `넓이가 $${Ta}$ 인 삼각형 $ABC$ 와 점 $P$ 가 $${tt([w[0], ov('PA')], [w[1], ov('PB')], [w[2], ov('PC')])}=\\vec{0}$ 을 만족시킬 때, 삼각형 $${names[i]}$ 의 넓이를 구하세요.`,
                answer: ans(w[i] * u),
                steps: [
                  `위치벡터로: $${k1(w[0])}(\\vec a-\\vec p)+${k1(w[1])}(\\vec b-\\vec p)+${k1(w[2])}(\\vec c-\\vec p)=\\vec0$ → $\\vec p=\\frac{${tt([w[0], '\\vec a'], [w[1], '\\vec b'], [w[2], '\\vec c'])}}{${S}}$`,
                  `$P$ 는 삼각형 내부의 점이고 $\\triangle PBC:\\triangle PCA:\\triangle PAB=${w[0]}:${w[1]}:${w[2]}$`,
                  `$\\triangle ${names[i]}=${Ta}\\times\\frac{${w[i]}}{${S}}=${w[i] * u}$`,
                ],
              };
            }
            for (;;) {
              const al = r.int(1, 4),
                be = r.int(1, 4),
                ga = r.int(1, 4);
              const k = r.nonzero(-3, 3);
              const w = [al + k, be - k, ga];
              if (w[0] <= 0 || w[1] <= 0) continue;
              const S = al + be + ga;
              const u = r.int(1, 3);
              const Ta = S * u;
              const i = r.int(0, 2);
              return {
                q: `넓이가 $${Ta}$ 인 삼각형 $ABC$ 와 점 $P$ 가 $${tt([al, ov('PA')], [be, ov('PB')], [ga, ov('PC')])}=${k === 1 ? '' : k === -1 ? '-' : k}${ov('AB')}$ 를 만족시킬 때, 삼각형 $${names[i]}$ 의 넓이를 구하세요.`,
                answer: ans(w[i] * u),
                steps: [
                  `위치벡터로: $${tt([al, '\\vec a'], [be, '\\vec b'], [ga, '\\vec c'])}-${S}\\vec p=${k === 1 ? '' : k === -1 ? '-' : k}(\\vec b-\\vec a)$`,
                  `$\\vec p=\\frac{${tt([w[0], '\\vec a'], [w[1], '\\vec b'], [w[2], '\\vec c'])}}{${S}}$ (계수가 모두 양수 → 삼각형 내부)`,
                  `$\\triangle PBC:\\triangle PCA:\\triangle PAB=${w[0]}:${w[1]}:${w[2]}$`,
                  `$\\triangle ${names[i]}=${Ta}\\times\\frac{${w[i]}}{${S}}=${w[i] * u}$`,
                ],
              };
            }
          },
        },
      ],
      top: [
        {
          id: 'top-weighted-vector-circle',
          title: '원 위의 점과 벡터의 합의 크기',
          gen(r) {
            const al = r.int(1, 3),
              be = r.int(1, 3);
            const S = al + be;
            const g = al === be ? al : 1;
            const c1 = r.int(-3, 3),
              c2 = r.int(-3, 3);
            const [x, y, d] = r.pick([
              [3, 4, 5],
              [4, 3, 5],
              [6, 8, 10],
              [5, 12, 13],
            ] as [number, number, number][]);
            const sx = r.sign(),
              sy = r.sign();
            const Q = [c1 + sx * x, c2 + sy * y];
            let rad = r.int(1, 9);
            if (rad === d) rad++;
            const w = [r.nonzero(-2, 2), r.int(-2, 2)];
            const A = [Q[0] + be * w[0], Q[1] + be * w[1]],
              B = [Q[0] - al * w[0], Q[1] - al * w[1]];
            const mx = S * (d + rad),
              mn = S * Math.abs(d - rad);
            const lhs = tt([al, ov('PA')], [be, ov('PB')]);
            return {
              q: `좌표평면 위의 두 점 $A${P2(A[0], A[1])}$, $B${P2(B[0], B[1])}$ 와 원 $${sqx('x', c1)}+${sqx('y', c2)}=${rad * rad}$ 위의 점 $P$ 에 대하여 $|${lhs}|$ 의 최댓값을 $M$, 최솟값을 $m$ 이라 할 때, $M$, $m$ 의 값을 구하세요.`,
              answer: fld(['M', mx], ['m', mn]),
              steps: [
                `$${lhs}=${al === 1 ? '' : al}(\\vec a-\\vec p)+${be === 1 ? '' : be}(\\vec b-\\vec p)=${S}\\left(\\frac{${tt([al, '\\vec a'], [be, '\\vec b'])}}{${S}}-\\vec p\\right)=${S}${ov('PQ')}$`,
                `$Q$ 는 $AB$ 를 $${be / g}:${al / g}$ ${ro(al / g)} 내분하는 점: $Q${P2(Q[0], Q[1])}$`,
                `원의 중심 $C${P2(c1, c2)}$, 반지름 $${rad}$, $\\overline{CQ}=${d}$`,
                `$\\overline{PQ}$ 의 최댓값 $${d}+${rad}=${d + rad}$, 최솟값 $|${d}-${rad}|=${Math.abs(d - rad)}$`,
                `$M=${S}\\times${d + rad}=${mx}$, $m=${S}\\times${Math.abs(d - rad)}=${mn}$`,
              ],
            };
          },
        },
        {
          id: 'top-vector-region-area',
          title: '벡터로 나타낸 점이 나타내는 영역의 넓이',
          gen(r) {
            for (;;) {
              const a1 = r.int(-3, 4),
                a2 = r.int(-3, 4),
                b1 = r.int(-3, 4),
                b2 = r.int(-3, 4);
              const det = Math.abs(a1 * b2 - a2 * b1);
              if (det === 0) continue;
              const kind = r.int(0, 2);
              const head = `좌표평면에서 $${ov('OA')}=${P2(a1, a2)}$, $${ov('OB')}=${P2(b1, b2)}$ 이고 $${ov('OP')}=s${ov('OA')}+t${ov('OB')}$ 일 때,`;
              const base = `$${ov('OA')}$, $${ov('OB')}$ 로 만든 평행사변형의 넓이 $|${a1}\\times${pr(b2)}-${pr(a2)}\\times${pr(b1)}|=${det}$`;
              if (kind === 0) {
                const k = r.int(2, 4);
                const v = fr(k * k * det, 2);
                if (v.d !== 1) continue;
                return {
                  q: `${head} $s\\ge0$, $t\\ge0$, $s+t\\le${k}$ 를 만족시키는 점 $P$ 가 나타내는 영역의 넓이를 구하세요.`,
                  answer: ans(v),
                  steps: [base, `$s+t\\le1$ 이면 삼각형 $OAB$ (넓이 $${T(fr(det, 2))}$)`, `$s+t\\le${k}$ 는 이 삼각형을 $${k}$ 배로 닮음 확대한 것 → 넓이 $${k * k}$ 배`, `$${T(fr(det, 2))}\\times${k * k}=${T(v)}$`],
                };
              }
              if (kind === 1) {
                const m = r.int(1, 3),
                  n = r.int(2, 4);
                return {
                  q: `${head} $0\\le s\\le${m}$, $0\\le t\\le${n}$ 을 만족시키는 점 $P$ 가 나타내는 영역의 넓이를 구하세요.`,
                  answer: ans(m * n * det),
                  steps: [base, `영역은 $${m}${ov('OA')}$, $${n}${ov('OB')}$ 로 만든 평행사변형`, `넓이 $${m}\\times${n}\\times${det}=${m * n * det}$`],
                };
              }
              const c = r.pick([1, 2]),
                lo = r.int(1, 2),
                hi = r.int(lo + 1, 4);
              const v = fr((hi * hi - lo * lo) * det, 2 * c);
              if (v.d !== 1) continue;
              const cs = c === 1 ? 't' : '2t';
              return {
                q: `${head} $s\\ge0$, $t\\ge0$, $${lo}\\le s+${cs}\\le${hi}$ 를 만족시키는 점 $P$ 가 나타내는 영역의 넓이를 구하세요.`,
                answer: ans(v),
                steps: [
                  base,
                  `$s+${cs}\\le k$ $(s, t\\ge0)$ 는 $O$, $k${ov('OA')}$, $\\frac{k}{${c}}${ov('OB')}$ 를 꼭짓점으로 하는 삼각형: 넓이 $\\frac{1}{2}\\times k\\times\\frac{k}{${c}}\\times${det}$`.replace(
                    '\\frac{k}{1}',
                    'k',
                  ),
                  `$k=${hi}$ 일 때 $${T(fr(hi * hi * det, 2 * c))}$, $k=${lo}$ 일 때 $${T(fr(lo * lo * det, 2 * c))}$`,
                  `차: $${T(v)}$`,
                ],
              };
            }
          },
        },
      ],
    },

    // ───────── 벡터의 내적
    'geo-4': {
      skills: [
        {
          id: 'dot-in-figure',
          title: '도형에서 좌표로 내적 구하기',
          gen(r, level) {
            const sq = level === 1 || (level === 3 && r.chance(0.5));
            const pts: Record<string, V2> = {};
            let fac = 1,
              desc = '';
            if (sq) {
              const a = r.pick([2, 4, 6]);
              const h = fr(a, 2);
              Object.assign(pts, {
                A: [fr(0), fr(0)],
                B: [fr(a), fr(0)],
                C: [fr(a), fr(a)],
                D: [fr(0), fr(a)],
                M: [fr(a), h],
                N: [h, fr(a)],
              });
              desc = `한 변의 길이가 $${a}$ 인 정사각형 $ABCD$ 에서 변 $BC$, $CD$ 의 중점을 각각 $M$, $N$ 이라 하자.`;
            } else {
              const s = r.int(1, 3);
              fac = 3;
              Object.assign(pts, {
                A: [fr(0), fr(0)],
                B: [fr(2 * s), fr(0)],
                C: [fr(s), fr(s)],
                M: [fr(3 * s, 2), fr(s, 2)],
                N: [fr(s, 2), fr(s, 2)],
                G: [fr(s), fr(s, 3)],
              });
              desc = `한 변의 길이가 $${2 * s}$ 인 정삼각형 $ABC$ 에서 변 $BC$, $CA$ 의 중점을 각각 $M$, $N$, 무게중심을 $G$ 라 하자.`;
            }
            const vec = (nm: string): V2 => sub(pts[nm[1]], pts[nm[0]]);
            const dot = (u: V2, v: V2) => u[0].mul(v[0]).add(u[1].mul(v[1]).mul(fac));
            const comp = (u: V2) => (fac === 1 ? P2(u[0], u[1]) : `(${T(u[0])}, ${r3(u[1])})`);
            const pool = sq ? ['AB', 'AC', 'AD', 'AM', 'AN', 'BD', 'BN', 'DM', 'MN'] : ['AB', 'AC', 'BC', 'AM', 'BN', 'AG', 'CM', 'GM'];
            const coordLine = sq ? `$A(0, 0)$, $B(${T(pts.B[0])}, 0)$, $D(0, ${T(pts.D[1])})$ 로 좌표를 잡아요.` : `$A(0, 0)$, $B(${T(pts.B[0])}, 0)$, $C(${T(pts.C[0])}, ${r3(pts.C[1])})$ 로 좌표를 잡아요.`;
            if (level <= 2) {
              const [u, v] = r.sample(pool, 2);
              const val = dot(vec(u), vec(v));
              return {
                q: `${desc} $${ov(u)}\\cdot${ov(v)}$ 의 값을 구하세요.`,
                answer: ans(val),
                steps: [coordLine, `$${ov(u)}=${comp(vec(u))}$, $${ov(v)}=${comp(vec(v))}$`, `내적 $=${T(val)}$`],
              };
            }
            const [x1, x2, y] = r.sample(pool, 3);
            const k = r.pick([2, -1, 3, -2]);
            const U = add(vec(x1), scl(vec(x2), k));
            const val = dot(U, vec(y));
            const lhs = `(${ov(x1)}${k > 0 ? '+' : '-'}${Math.abs(k) === 1 ? '' : Math.abs(k)}${ov(x2)})`;
            return {
              q: `${desc} $${lhs}\\cdot${ov(y)}$ 의 값을 구하세요.`,
              answer: ans(val),
              steps: [coordLine, `$${ov(x1)}=${comp(vec(x1))}$, $${ov(x2)}=${comp(vec(x2))}$, $${ov(y)}=${comp(vec(y))}$`, `$${lhs.slice(1, -1)}=${comp(U)}$`, `내적 $=${T(val)}$`],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-dot-circle-maxmin',
          title: '원 위의 점에서 두 점을 향한 벡터의 내적 최대·최소',
          gen(r) {
            const c1 = r.int(-3, 3),
              c2 = r.int(-3, 3);
            const [x, y, d] = r.pick([
              [3, 4, 5],
              [4, 3, 5],
              [6, 8, 10],
              [5, 12, 13],
            ] as [number, number, number][]);
            const M = [c1 + x * r.sign(), c2 + y * r.sign()];
            let rad = r.int(1, 8);
            if (rad === d) rad++;
            const w = [r.nonzero(-4, 4), r.int(-4, 4)];
            const w2 = w[0] * w[0] + w[1] * w[1];
            const A = [M[0] + w[0], M[1] + w[1]],
              B = [M[0] - w[0], M[1] - w[1]];
            const mx = (d + rad) ** 2 - w2,
              mn = (d - rad) ** 2 - w2;
            return {
              q: `좌표평면 위의 두 점 $A${P2(A[0], A[1])}$, $B${P2(B[0], B[1])}$ 와 원 $${sqx('x', c1)}+${sqx('y', c2)}=${rad * rad}$ 위를 움직이는 점 $P$ 에 대하여 $${ov('PA')}\\cdot${ov('PB')}$ 의 최댓값과 최솟값을 구하세요.`,
              answer: fld(['최댓값', mx], ['최솟값', mn]),
              steps: [
                `선분 $AB$ 의 중점 $M${P2(M[0], M[1])}$, $${ov('MA')}=-${ov('MB')}$`,
                `$${ov('PA')}\\cdot${ov('PB')}=(${ov('PM')}+${ov('MA')})\\cdot(${ov('PM')}-${ov('MA')})=|${ov('PM')}|^{2}-|${ov('MA')}|^{2}=|${ov('PM')}|^{2}-${w2}$`,
                `원의 중심 $C${P2(c1, c2)}$, $\\overline{CM}=${d}$, 반지름 $${rad}$ → $\\overline{PM}$ 은 $${Math.abs(d - rad)}$ 이상 $${d + rad}$ 이하`,
                `최댓값 $${d + rad}^{2}-${w2}=${mx}$, 최솟값 $${Math.abs(d - rad)}^{2}-${w2}=${mn}$`,
              ],
            };
          },
        },
        {
          id: 'top-dot-line-min',
          title: '내적의 최솟값 (중점과 거리)',
          gen(r) {
            if (r.chance(0.5)) {
              const [na, nb, nn] = r.pick([
                [3, 4, 5],
                [4, 3, 5],
                [3, -4, 5],
                [5, 12, 13],
              ] as [number, number, number][]);
              const M = [r.int(-3, 3), r.int(-3, 3)];
              const d0 = r.int(1, 6);
              const c = d0 * nn * r.sign() - na * M[0] - nb * M[1];
              const w = [r.nonzero(-3, 3), r.int(-3, 3)];
              const w2 = w[0] ** 2 + w[1] ** 2;
              const A = [M[0] + w[0], M[1] + w[1]],
                B = [M[0] - w[0], M[1] - w[1]];
              return {
                q: `좌표평면 위의 두 점 $A${P2(A[0], A[1])}$, $B${P2(B[0], B[1])}$ 와 직선 $${tt([na, 'x'], [nb, 'y'], [c, ''])}=0$ 위를 움직이는 점 $P$ 에 대하여 $${ov('PA')}\\cdot${ov('PB')}$ 의 최솟값을 구하세요.`,
                answer: ans(d0 * d0 - w2),
                steps: [
                  `$AB$ 의 중점 $M${P2(M[0], M[1])}$: $${ov('PA')}\\cdot${ov('PB')}=|${ov('PM')}|^{2}-|${ov('MA')}|^{2}=|${ov('PM')}|^{2}-${w2}$`,
                  `$|${ov('PM')}|$ 의 최솟값은 $M$ 과 직선 사이 거리: $\\frac{|${na}\\times${pr(M[0])}+${pr(nb)}\\times${pr(M[1])}${cst(c)}|}{${nn}}=${d0}$`,
                  `최솟값 $${d0}^{2}-${w2}=${d0 * d0 - w2}$`,
                ],
              };
            }
            for (;;) {
              const A = [r.int(-4, 4), r.int(-4, 4)],
                B = [r.int(-4, 4), r.int(-4, 4)],
                C = [r.int(-4, 4), r.int(-4, 4)];
              const M2 = [A[0] + B[0], A[1] + B[1]]; // 2M
              const mc = [2 * C[0] - M2[0], 2 * C[1] - M2[1]]; // 2(C - M)
              const l2 = mc[0] ** 2 + mc[1] ** 2; // 4|MC|^2
              if (l2 === 0 || l2 % 8 !== 0) continue;
              if ((B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]) === 0) continue;
              const v = -l2 / 8;
              return {
                q: `좌표평면 위의 세 점 $A${P2(A[0], A[1])}$, $B${P2(B[0], B[1])}$, $C${P2(C[0], C[1])}$ 과 평면 위의 점 $P$ 에 대하여 $(${ov('PA')}+${ov('PB')})\\cdot${ov('PC')}$ 의 최솟값을 구하세요.`,
                answer: ans(v),
                steps: [
                  `$AB$ 의 중점 $M${P2(fr(M2[0], 2), fr(M2[1], 2))}$: $${ov('PA')}+${ov('PB')}=2${ov('PM')}$`,
                  `$MC$ 의 중점을 $N$ 이라 하면 $${ov('PM')}\\cdot${ov('PC')}=|${ov('PN')}|^{2}-\\frac{1}{4}\\overline{MC}^{2}$`,
                  `$\\overline{MC}^{2}=${T(fr(l2, 4))}$`,
                  `$P=N$ 일 때 최소: $2\\times\\left(-\\frac{1}{4}\\times${T(fr(l2, 4))}\\right)=${v}$`,
                ],
              };
            }
          },
        },
      ],
    },

    // ───────── 공간도형과 공간좌표
    'geo-5': {
      skills: [
        {
          id: 'projection-area',
          title: '정사영의 넓이',
          gen(r, level) {
            if (level === 1) {
              const c = r.pick([fr(1, 2), fr(1, 3), fr(2, 3), fr(3, 5), fr(4, 5)]);
              const S = c.d * r.int(2, 9);
              const v = c.mul(S);
              return {
                q: `넓이가 $${S}$ 인 평면 $\\alpha$ 위의 도형을 평면 $\\beta$ 위로 정사영한 도형의 넓이를 구하세요. (단, 두 평면 $\\alpha$, $\\beta$ 가 이루는 예각의 크기 $\\theta$ 는 $\\cos\\theta=${T(c)}$)`,
                answer: ans(v),
                steps: [`정사영의 넓이 $=S\\cos\\theta$`, `$${S}\\times${T(c)}=${T(v)}$`],
              };
            }
            if (level === 2) {
              for (;;) {
                const P = [0, 1, 2].map(() => [r.int(-3, 4), r.int(-3, 4), r.int(-3, 4)]);
                const [A, B, C] = P;
                const cr = (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]);
                if (cr === 0) continue;
                const v = fr(Math.abs(cr), 2);
                return {
                  q: `좌표공간의 세 점 $A${P3(A[0], A[1], A[2])}$, $B${P3(B[0], B[1], B[2])}$, $C${P3(C[0], C[1], C[2])}$ 에 대하여 삼각형 $ABC$ 의 $xy$ 평면 위로의 정사영의 넓이를 구하세요.`,
                  answer: ans(v),
                  steps: [
                    `$xy$ 평면 위로의 정사영은 $z$ 좌표를 $0$ 으로: $A'${P2(A[0], A[1])}$, $B'${P2(B[0], B[1])}$, $C'${P2(C[0], C[1])}$`,
                    `넓이 $=\\frac{1}{2}|(${B[0]}-${pr(A[0])})(${C[1]}-${pr(A[1])})-(${B[1]}-${pr(A[1])})(${C[0]}-${pr(A[0])})|=${T(v)}$`,
                  ],
                };
              }
            }
            const a = r.int(1, 6),
              b = r.int(1, 6),
              c = r.int(1, 6);
            const S2 = fr(a * a * b * b + b * b * c * c + c * c * a * a, 4);
            const ab2 = a * a + b * b;
            return {
              q: `좌표공간의 세 점 $A(${a}, 0, 0)$, $B(0, ${b}, 0)$, $C(0, 0, ${c})$ 에 대하여 삼각형 $ABC$ 의 넓이를 $S$ 라 할 때, $S^{2}$ 의 값을 구하세요.`,
              answer: ans(S2),
              steps: [
                `원점 $O$ 에서 $AB$ 에 내린 수선의 발 $H$: $\\overline{OH}=\\frac{${a}\\times${b}}{\\sqrt{${ab2}}}$`,
                `$\\overline{OC}\\perp$ ($xy$ 평면), $\\overline{OH}\\perp\\overline{AB}$ 이므로 삼수선의 정리에 의해 $\\overline{CH}\\perp\\overline{AB}$`,
                `$\\overline{CH}^{2}=${c * c}+\\frac{${a * a * b * b}}{${ab2}}$`,
                `$S^{2}=\\frac{1}{4}\\overline{AB}^{2}\\,\\overline{CH}^{2}=\\frac{1}{4}(${ab2}\\times${c * c}+${a * a * b * b})=${T(S2)}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-sphere-sections',
          title: '좌표평면이 자르는 구의 단면',
          gen(r) {
            const a = r.int(3, 9),
              b = r.int(1, a - 1),
              c = r.int(1, a - 1);
            const P = a * a - c * c,
              Q = a * a - b * b,
              N = a * a + b * b + c * c;
            return {
              q: `중심의 좌표가 모두 양수인 구 $S$ 가 $yz$ 평면에 접하고, $xy$ 평면과 만나서 생기는 원의 넓이가 $${P}\\pi$, $zx$ 평면과 만나서 생기는 원의 넓이가 $${Q}\\pi$ 이다. 원점과 구의 중심 사이의 거리가 $${sqrtTex(N)}$ 일 때, 구 $S$ 의 반지름의 길이를 구하세요.`,
              answer: ans(a),
              steps: [
                `중심 $(p, q, s)$, 반지름 $r$: $yz$ 평면에 접하므로 $r=p$`,
                `$xy$ 평면과의 단면: 반지름의 제곱 $r^{2}-s^{2}=${P}$, $zx$ 평면: $r^{2}-q^{2}=${Q}$`,
                `$p^{2}+q^{2}+s^{2}=${N}$ → $r^{2}+(r^{2}-${Q})+(r^{2}-${P})=${N}$`,
                `$3r^{2}=${N + P + Q}$ → $r^{2}=${a * a}$, $r=${a}$`,
              ],
            };
          },
        },
        {
          id: 'top-three-perp',
          title: '삼수선의 정리로 넓이·높이 구하기',
          gen(r) {
            const [d, k, hyp] = r.pick([
              [5, 12, 13],
              [15, 8, 17],
              [15, 20, 25],
              [20, 15, 25],
              [10, 24, 26],
            ] as [number, number, number][]);
            const A = [r.int(-3, 3), r.int(-3, 3)];
            let mm = r.int(1, 3);
            if ((5 * mm * hyp) % 2 === 1) mm = 2;
            const B = [A[0] + 4 * mm, A[1] - 3 * mm];
            const AB = 5 * mm;
            const sgn = r.sign(),
              u = r.int(-2, 2);
            const s = (d / 5) * sgn;
            const H = [A[0] + 4 * u + 3 * s, A[1] - 3 * u + 4 * s];
            const area = (AB * hyp) / 2;
            const askK = r.chance(0.5);
            return {
              q: askK
                ? `좌표공간에서 $xy$ 평면 위의 두 점 $A(${A[0]}, ${A[1]}, 0)$, $B(${B[0]}, ${B[1]}, 0)$ 과 점 $P(${H[0]}, ${H[1]}, k)$ $(k>0)$ 에 대하여 삼각형 $PAB$ 의 넓이가 $${area}$ 일 때, $k$ 의 값을 구하세요.`
                : `좌표공간에서 $xy$ 평면 위의 두 점 $A(${A[0]}, ${A[1]}, 0)$, $B(${B[0]}, ${B[1]}, 0)$ 과 점 $P(${H[0]}, ${H[1]}, ${k})$ 에 대하여 삼각형 $PAB$ 의 넓이를 구하세요.`,
              answer: ans(askK ? k : area),
              steps: [
                `$P$ 에서 $xy$ 평면에 내린 수선의 발 $H(${H[0]}, ${H[1]}, 0)$, $H$ 에서 직선 $AB$ 에 내린 수선의 발 $Q$`,
                `삼수선의 정리: $\\overline{PH}\\perp$ (평면), $\\overline{HQ}\\perp\\overline{AB}$ 이면 $\\overline{PQ}\\perp\\overline{AB}$`,
                `$xy$ 평면에서 직선 $AB$: $${tt([3, 'x'], [4, 'y'], [-(3 * A[0] + 4 * A[1]), ''])}=0$, $\\overline{HQ}=\\frac{|${3 * H[0] + 4 * H[1] - 3 * A[0] - 4 * A[1]}|}{5}=${d}$, $\\overline{AB}=${AB}$`,
                askK
                  ? `넓이 $=\\frac{1}{2}\\times${AB}\\times\\overline{PQ}=${area}$ → $\\overline{PQ}=${hyp}$, $k=\\sqrt{${hyp}^{2}-${d}^{2}}=${k}$`
                  : `$\\overline{PQ}=\\sqrt{${d}^{2}+${k}^{2}}=${hyp}$, 넓이 $=\\frac{1}{2}\\times${AB}\\times${hyp}=${area}$`,
              ],
            };
          },
        },
      ],
    },
  },
  {
    'top-tangent-axes-min': '접점의 좌표로 절편을 나타내고, 타원의 방정식을 조건으로 산술·기하평균 쓰기',
    'top-vector-region-area': '$s$, $t$ 의 범위가 만드는 영역이 기본 삼각형·평행사변형의 몇 배인지 보기',
    'top-dot-circle-maxmin': '두 점의 중점 $M$ 을 쓰면 $\\overrightarrow{PA}\\cdot\\overrightarrow{PB}=|\\overrightarrow{PM}|^{2}-|\\overrightarrow{MA}|^{2}$ 로 거리 문제가 돼요',
    'top-dot-line-min': '중점을 이용해 내적을 (거리의 제곱)$-$(상수) 꼴로 바꾸기',
    'top-sphere-sections': '구와 좌표평면의 단면은 (반지름)$^{2}-$(중심과 평면 사이 거리)$^{2}$ 이 반지름의 제곱인 원',
    'top-three-perp': '평면 위 직선까지의 거리는 삼수선의 정리로 수선의 발을 이어 피타고라스 정리로 구해요',
  },
);
