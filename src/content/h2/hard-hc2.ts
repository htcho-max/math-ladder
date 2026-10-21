// 공통수학2 심화·최상위 유형 — hc2.ts 의 각 단원 skills / top 뒤에 덧붙임
import { nCr } from '../../core/nt';
import { poly } from '../../core/tex';
import { TRI, ans, cst, fld, fr, isq, pr, T, tt, type Hard, withJosa } from './hard-util';

/** 뒤에 붙일 항들 ('0' 이면 빈 문자열, 아니면 부호 붙임) */
const tail = (e: string) => (e === '0' ? '' : e.startsWith('-') ? e : '+' + e);
/** (v-a) 꼴, a=0 이면 v */
const sh = (v: string, a: number) => (a === 0 ? v : `(${v}${cst(-a)})`);
const P2 = (x: number, y: number) => `(${x}, ${y})`;
/** (x-a)^2 */
const sq = (v: string, a: number) => (a === 0 ? `${v}^{2}` : `(${v}${a > 0 ? '-' : '+'}${Math.abs(a)})^{2}`);
/** 원의 일반형 */
const circGen = (a: number, b: number, r2: number) => `x^{2}+y^{2}${tail(tt([-2 * a, 'x'], [-2 * b, 'y'], [a * a + b * b - r2, '']))}=0`;
/** y = mx + n */
const yEq = (m: number, n: number) => `y=${poly([m, n])}`;
/** 직선 ax+by+c=0 */
const line = (a: number, b: number, c: number) => `${tt([a, 'x'], [b, 'y'], [c, ''])}=0`;
const setTex = (a: number[]) => (a.length ? `\\{${a.join(', ')}\\}` : '\\varnothing');

/** 점 P 를 지나고 기울기가 m 인 직선 가족 mx - y - pm + q = 0 */
const famTex = (p: number, q: number) => `mx-y${tail(tt([-p, 'm'], [q, '']))}=0`;

/** 원 위 점과 직선 거리 자연수 개수 */
function countDist(d: number, rad: number, tmax: number) {
  const parts: [number, number][] = [];
  let tot = 0;
  const onLine = (e: number) => (e < rad ? 2 : e === rad ? 1 : 0);
  for (let t = 1; t <= tmax; t++) {
    const c = onLine(Math.abs(d - t)) + onLine(d + t);
    if (c > 0) parts.push([t, c]);
    tot += c;
  }
  return { tot, parts };
}

/** 일대일대응 표에서 거듭 합성 */
function cyclesOf(f: number[]): number[][] {
  const n = f.length;
  const seen = new Array(n + 1).fill(false);
  const out: number[][] = [];
  for (let i = 1; i <= n; i++) {
    if (seen[i]) continue;
    const c: number[] = [];
    let x = i;
    while (!seen[x]) {
      seen[x] = true;
      c.push(x);
      x = f[x - 1];
    }
    out.push(c);
  }
  return out;
}

export const HC2_HARD: Hard = withJosa(
  {
    // ───────── 평면좌표와 직선의 방정식
    'hc2-1': {
      skills: [
        {
          id: 'fixed-point-line',
          title: '정점을 지나는 직선과 기울기의 범위',
          gen(r, level) {
            const p = r.nonzero(-4, 4),
              q = r.nonzero(-4, 4);
            if (level === 1) {
              let a = r.nonzero(-3, 3),
                b = r.nonzero(-3, 3),
                d = r.nonzero(-3, 3),
                e = r.nonzero(-3, 3);
              if (a * e - b * d === 0) e = e + (e > 0 ? 1 : -1);
              const c1 = -(a * p + b * q),
                c2 = -(d * p + e * q);
              const L1 = tt([a, 'x'], [b, 'y'], [c1, '']);
              const L2 = tt([d, 'x'], [e, 'y'], [c2, '']);
              return {
                q: `직선 $(${L1})+k(${L2})=0$ 이 실수 $k$ 의 값에 관계없이 항상 지나는 점의 좌표를 구하세요.`,
                answer: fld(['x', p], ['y', q]),
                steps: [`$k$ 에 관계없이 성립하려면 $${L1}=0$, $${L2}=0$ 이 동시에 성립해야 해요.`, `두 식을 연립하면 $x=${p}$, $y=${q}$`, `따라서 항상 점 $${P2(p, q)}$ 를 지나요.`],
              };
            }
            if (level === 2) {
              const u = r.nonzero(-3, 3),
                s = r.int(-4, 4);
              const A = [p + u, q + s * u];
              return {
                q: `직선 $${famTex(p, q)}$ 이 점 $A${P2(A[0], A[1])}$ 를 지나도록 하는 실수 $m$ 의 값을 구하세요.`,
                answer: ans(s),
                steps: [
                  `식을 $m(x${cst(-p)})-(y${cst(-q)})=0$ 으로 묶으면 이 직선은 $m$ 에 관계없이 점 $P${P2(p, q)}$ 를 지나요.`,
                  `$m$ 은 두 점 $P$, $A$ 를 지나는 직선의 기울기예요.`,
                  `$m=\\frac{${A[1]}-${pr(q)}}{${A[0]}-${pr(p)}}=${s}$`,
                ],
              };
            }
            const s1 = r.int(-4, 2),
              s2 = r.int(s1 + 1, 4);
            const u1 = r.int(1, 3),
              u2 = r.int(1, 3);
            const A = [p + u1, q + s1 * u1],
              B = [p + u2, q + s2 * u2];
            return {
              q: `직선 $${famTex(p, q)}$ 이 두 점 $A${P2(A[0], A[1])}$, $B${P2(B[0], B[1])}$ 를 잇는 선분 $AB$ 와 만나도록 하는 실수 $m$ 의 값의 범위가 $\\alpha\\le m\\le\\beta$ 일 때, $\\alpha$, $\\beta$ 의 값을 구하세요.`,
              answer: fld(['α', s1], ['β', s2]),
              steps: [
                `$m(x${cst(-p)})-(y${cst(-q)})=0$ 이므로 직선은 $m$ 에 관계없이 점 $P${P2(p, q)}$ 를 지나고, 기울기가 $m$ 이에요.`,
                `두 점 $A$, $B$ 는 모두 직선 $x=${p}$ 의 오른쪽에 있으므로, $P$ 를 축으로 직선을 돌리면 기울기는 $PA$ 와 $PB$ 의 기울기 사이에서 연속적으로 변해요.`,
                `(직선 $PA$ 의 기울기)$=\\frac{${A[1]}-${pr(q)}}{${A[0]}-${pr(p)}}=${s1}$`,
                `(직선 $PB$ 의 기울기)$=\\frac{${B[1]}-${pr(q)}}{${B[0]}-${pr(p)}}=${s2}$`,
                `따라서 $${s1}\\le m\\le ${s2}$ 이고 $\\alpha=${s1}$, $\\beta=${s2}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-lines-no-triangle',
          title: '세 직선이 삼각형을 만들지 않을 조건',
          gen(r) {
            const m1 = r.int(-3, 3);
            let m2 = r.int(-3, 3);
            if (m2 === m1) m2 = m1 === 3 ? -2 : m1 + 1;
            const p1 = r.int(-3, 3),
              p2 = r.int(-3, 3);
            let s = r.int(-4, 4);
            while (s === m1 || s === m2) s = s + 1 > 4 ? -4 : s + 1;
            const u = r.nonzero(-2, 2);
            const a = p1 + u,
              b = p2 + s * u;
            const c1 = p2 - m1 * p1,
              c2 = p2 - m2 * p1;
            const L3 = `kx-y${tail(tt([-a, 'k'], [b, '']))}=0`;
            const sum = m1 + m2 + s;
            return {
              q: `세 직선 $${yEq(m1, c1)}$, $${yEq(m2, c2)}$, $${L3}$ 이 삼각형을 만들지 않도록 하는 모든 실수 $k$ 의 값의 합을 구하세요.`,
              answer: ans(sum),
              steps: [
                `세 직선이 삼각형을 만들지 않는 경우는 (i) 두 직선이 평행할 때, (ii) 세 직선이 한 점에서 만날 때예요.`,
                `셋째 직선은 $k${sh('x', a)}-${sh('y', b)}=0$ 이므로 $k$ 에 관계없이 점 $Q${P2(a, b)}$ 를 지나고 기울기가 $k$ 예요.`,
                `(i) 첫째 직선과 평행: $k=${m1}$, 둘째 직선과 평행: $k=${m2}$ ($Q$ 는 두 직선 위에 있지 않아 일치하지는 않아요)`,
                `(ii) 첫째·둘째 직선의 교점: $${poly([m1, c1])}=${poly([m2, c2])}$ 에서 $P${P2(p1, p2)}$`,
                `셋째 직선이 $P$ 를 지나면 $k=\\frac{${b}-${pr(p2)}}{${a}-${pr(p1)}}=${s}$`,
                `따라서 $k$ 의 값의 합은 $${m1}+${pr(m2)}+${pr(s)}=${sum}$`,
              ],
            };
          },
        },
        {
          id: 'top-distance-family',
          title: '정점을 지나는 직선과 점 사이 거리의 최대·개수',
          gen(r) {
            const [x0, y0, D] = r.pick([...TRI, [8, 15, 17], [15, 8, 17], [9, 12, 15], [12, 9, 15]] as [number, number, number][]);
            const dx = x0 * r.sign(),
              dy = y0 * r.sign();
            const p = r.nonzero(-4, 4),
              q = r.int(-4, 4);
            const A = [p + dx, q + dy];
            const famStr = `x+ky${tail(tt([-q, 'k'], [-p, '']))}=0`;
            const N = 2 * (D - 1) + 1 - 1;
            return {
              q: `점 $A${P2(A[0], A[1])}$ 와 직선 $${famStr}$ 사이의 거리를 $f(k)$ 라 하자. $f(k)$ 의 최댓값을 $M$, $f(k)$ 의 값이 자연수가 되도록 하는 실수 $k$ 의 개수를 $N$ 이라 할 때, $M$, $N$ 의 값을 구하세요.`,
              answer: fld(['M', D], ['N', N]),
              steps: [
                `$${sh('x', p)}+k${sh('y', q)}=0$ 이므로 직선은 $k$ 에 관계없이 점 $P${P2(p, q)}$ 를 지나요. 단, 직선 $y=${q}$ 는 이 꼴로 나타낼 수 없어요.`,
                `$\\overline{AP}=\\sqrt{${pr(dx)}^{2}+${pr(dy)}^{2}}=${D}$ 이고, $P$ 를 지나는 직선과 $A$ 사이 거리는 $\\overline{AP}$ 이하예요. 직선이 $AP$ 와 수직일 때 최대이므로 $M=${D}$ (이 직선은 $y=${q}$ 가 아니에요).`,
                `$P$ 를 지나는 모든 직선을 생각하면 거리 $d$ 가 $0<d<${D}$ 인 직선은 $AP$ 에 대칭으로 2개씩, $d=${D}$ 인 직선은 1개예요.`,
                `자연수 $d=1, 2, \\cdots, ${D - 1}$ 에서 $2\\times${D - 1}=${2 * (D - 1)}$ 개, $d=${D}$ 에서 1개 → 모두 $${2 * D - 1}$ 개`,
                `그런데 제외된 직선 $y=${q}$ 와 $A$ 사이 거리는 $|${A[1]}-${pr(q)}|=${Math.abs(dy)}$ 로 자연수이므로 1개를 빼야 해요.`,
                `따라서 $N=${2 * D - 1}-1=${N}$`,
              ],
            };
          },
        },
      ],
    },

    // ───────── 원의 방정식
    'hc2-2': {
      skills: [
        {
          id: 'chord-through-point',
          title: '정점을 지나는 직선이 만드는 현의 길이',
          gen(r, level) {
            const opts: [number, number, number, number][] = [];
            for (let rad = 3; rad <= 10; rad++)
              for (let dx = -rad; dx <= rad; dx++)
                for (let dy = -rad; dy <= rad; dy++) {
                  const d2 = dx * dx + dy * dy;
                  if (d2 === 0 || d2 >= rad * rad) continue;
                  const h = isq(rad * rad - d2);
                  if (h > 0 && (level < 3 || dy !== 0)) opts.push([rad, dx, dy, h]);
                }
            const [rad, dx, dy, h] = r.pick(opts);
            const a = r.int(-4, 4),
              b = r.int(-4, 4);
            const P = [a + dx, b + dy];
            const circ = level === 1 ? `${sq('x', a)}+${sq('y', b)}=${rad * rad}` : circGen(a, b, rad * rad);
            const base = [
              ...(level === 1 ? [] : [`$${sq('x', a)}+${sq('y', b)}=${rad * rad}$ 이므로 중심 $C${P2(a, b)}$, 반지름 $${rad}$`]),
              `중심과 점 $P$ 사이 거리: $\\overline{CP}=\\sqrt{${pr(dx)}^{2}+${pr(dy)}^{2}}=\\sqrt{${dx * dx + dy * dy}}$`,
              `현의 길이는 중심과 직선 사이 거리 $d$ 가 클수록 짧고, $d\\le\\overline{CP}$ 이므로 직선이 $CP$ 와 수직일 때 가장 짧아요.`,
              `최솟값 $=2\\sqrt{${rad * rad}-${dx * dx + dy * dy}}=2\\times${h}=${2 * h}$`,
            ];
            if (level < 3) {
              return {
                q: `원 $${circ}$ 과 점 $P${P2(P[0], P[1])}$ 를 지나는 직선이 만나서 생기는 현의 길이의 최솟값을 구하세요.`,
                answer: ans(2 * h),
                steps: level === 1 ? [`중심 $C${P2(a, b)}$, 반지름 $${rad}$`, ...base] : base,
              };
            }
            const m = fr(-dx, dy);
            return {
              q: `직선 $${famTex(P[0], P[1])}$ 과 원 $${circ}$ 이 만나서 생기는 현의 길이가 최소일 때, 현의 길이와 $m$ 의 값을 구하세요.`,
              answer: fld(['현의 길이', 2 * h], ['m', m]),
              steps: [
                `직선은 $m${sh('x', P[0])}-${sh('y', P[1])}=0$ 이므로 $m$ 에 관계없이 점 $P${P2(P[0], P[1])}$ 를 지나요.`,
                ...base,
                dx === 0 ? `직선 $CP$ 가 $y$ 축에 평행하므로 수직인 직선의 기울기 $m=0$` : `직선 $CP$ 의 기울기는 $${T(fr(dy, dx))}$ 이므로 수직인 직선의 기울기 $m=${T(m)}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-integer-chords',
          title: '현의 길이가 정수가 되는 직선의 개수',
          gen(r) {
            const rad = r.int(3, 8);
            let dx = 0,
              dy = 0;
            do {
              dx = r.int(-rad + 1, rad - 1);
              dy = r.int(-rad + 1, rad - 1);
            } while (dx * dx + dy * dy === 0 || dx * dx + dy * dy >= rad * rad);
            const d2 = dx * dx + dy * dy;
            const a = r.int(-3, 3),
              b = r.int(-3, 3);
            const P = [a + dx, b + dy];
            const low2 = 4 * (rad * rad - d2); // (최소 현)^2
            const lowInt = isq(low2);
            let inner = 0;
            for (let L = 1; L < 2 * rad; L++) if (L * L > low2) inner++;
            const N = 2 * inner + 1 + (lowInt > 0 ? 1 : 0);
            const lowTex = lowInt > 0 ? `${lowInt}` : `2\\sqrt{${rad * rad - d2}}`;
            const lowStart = lowInt > 0 ? lowInt + 1 : Math.floor(Math.sqrt(low2)) + 1;
            return {
              q: `점 $P${P2(P[0], P[1])}$ 를 지나는 직선이 원 $${circGen(a, b, rad * rad)}$ 과 만나서 생기는 현의 길이가 정수가 되도록 하는 직선의 개수를 구하세요.`,
              answer: ans(N),
              steps: [
                `원은 $${sq('x', a)}+${sq('y', b)}=${rad * rad}$ → 중심 $C${P2(a, b)}$, 반지름 $${rad}$, $\\overline{CP}^{2}=${d2}<${rad * rad}$ 이므로 $P$ 는 원의 내부`,
                `중심과 직선 사이 거리를 $d$ $(0\\le d\\le\\sqrt{${d2}})$ 라 하면 현의 길이는 $2\\sqrt{${rad * rad}-d^{2}}$`,
                `최솟값(직선 $\\perp CP$, 1개) $=2\\sqrt{${rad * rad - d2}}${lowInt > 0 ? `=${lowInt}` : ''}$, 최댓값(중심을 지남, 1개) $=${2 * rad}$`,
                `그 사이의 길이는 직선 $CP$ 에 대칭인 직선 2개씩 만들어요.`,
                `정수 길이: ${lowInt > 0 ? `$${lowInt}$ 에서 1개, ` : `($${lowTex}$ 는 정수가 아님) `}${inner > 0 ? `$${lowStart}$ 부터 $${2 * rad - 1}$ 까지 $${inner}$ 가지 × 2개, ` : '그 사이 정수 길이는 없고, '}$${2 * rad}$ 에서 1개`,
                `따라서 $${lowInt > 0 ? '1+' : ''}${2 * inner}+1=${N}$ 개`,
              ],
            };
          },
        },
        {
          id: 'top-circle-point-distance',
          title: '원 위의 점과 직선 사이 거리가 자연수인 점의 개수',
          gen(r) {
            const [na, nb, nn] = r.pick([
              [3, 4, 5],
              [4, 3, 5],
              [3, -4, 5],
              [5, 12, 13],
              [12, -5, 13],
            ] as [number, number, number][]);
            const rad = r.int(2, 6);
            const d = r.int(0, rad + 3);
            const a = r.int(-3, 3),
              b = r.int(-3, 3);
            const sgn = r.sign();
            const c = sgn * d * nn - na * a - nb * b;
            const { tot, parts } = countDist(d, rad, d + rad);
            return {
              q: `원 $${sq('x', a)}+${sq('y', b)}=${rad * rad}$ 위의 점 중에서 직선 $${line(na, nb, c)}$ 까지의 거리가 자연수인 점의 개수를 구하세요.`,
              answer: ans(tot),
              steps: [
                `중심 $C${P2(a, b)}$ 와 직선 사이 거리 $=\\frac{|${na}\\times${pr(a)}+${pr(nb)}\\times${pr(b)}${cst(c)}|}{${nn}}=${d}$, 반지름 $${rad}$`,
                `직선까지의 거리가 $t$ 인 점은 주어진 직선과 평행하고 거리가 $t$ 인 두 직선 위에 있어요. 두 직선과 중심 사이 거리는 $|${d}-t|$, $${d}+t$`,
                `중심과 거리가 $e$ 인 직선은 원과 $e<${rad}$ 이면 2점, $e=${rad}$ 이면 1점에서 만나요.`,
                `$t$ 는 $1\\le t\\le ${d + rad}$ 만 가능: ${parts.map(([t, k]) => `$t=${t}$ → ${k}개`).join(', ')}`,
                `따라서 모두 $${tot}$ 개`,
              ],
            };
          },
        },
      ],
    },

    // ───────── 도형의 이동
    'hc2-3': {
      skills: [
        {
          id: 'move-then-tangent',
          title: '이동한 원이 좌표축에 접할 조건',
          gen(r, level) {
            const a = r.int(-5, 5),
              b = r.int(-5, 5);
            const n = r.nonzero(-4, 4);
            if (level === 1) {
              const m = r.nonzero(-4, 4);
              return {
                q: `점 $${P2(a, b)}$ 를 $x$ 축의 방향으로 $${m}$ 만큼, $y$ 축의 방향으로 $${n}$ 만큼 평행이동한 뒤, 직선 $y=x$ 에 대하여 대칭이동한 점의 좌표를 구하세요.`,
                answer: fld(['x', b + n], ['y', a + m]),
                steps: [`평행이동: $${P2(a, b)}\\to${P2(a + m, b + n)}$`, `$y=x$ 대칭은 $x$, $y$ 좌표를 바꿔요: $${P2(b + n, a + m)}$`],
              };
            }
            const rad = r.int(1, 6);
            if (level === 2) {
              const m = r.nonzero(-4, 4);
              return {
                q: `원 $${sq('x', a)}+${sq('y', b)}=${rad * rad}$ 을 $x$ 축의 방향으로 $${m}$ 만큼, $y$ 축의 방향으로 $${n}$ 만큼 평행이동한 뒤, $x$ 축에 대하여 대칭이동한 원의 중심의 좌표를 구하세요.`,
                answer: fld(['x', a + m], ['y', -(b + n)]),
                steps: [`원의 이동은 중심만 따라가면 돼요. 중심 $${P2(a, b)}$`, `평행이동: $${P2(a + m, b + n)}$`, `$x$ 축 대칭: $y$ 좌표 부호가 바뀌어 $${P2(a + m, -(b + n))}$`],
              };
            }
            const yx = r.chance(0.5);
            const am = a === 0 ? 'm' : `${a}+m`;
            const prod = a * a - rad * rad;
            return {
              q: `원 $${sq('x', a)}+${sq('y', b)}=${rad * rad}$ 을 $x$ 축의 방향으로 $m$ 만큼, $y$ 축의 방향으로 $${n}$ 만큼 평행이동한 뒤, ${yx ? '직선 $y=x$ ' : '원점'}에 대하여 대칭이동한 원이 ${yx ? '$x$' : '$y$'} 축에 접할 때, 모든 실수 $m$ 의 값의 곱을 구하세요.`,
              answer: ans(prod),
              steps: [
                `평행이동한 원의 중심 $(${am}, ${b + n})$, 반지름 $${rad}$`,
                yx ? `$y=x$ 대칭: 중심 $(${b + n}, ${am})$` : `원점 대칭: 중심 $(${a === 0 ? '' : -a}-m, ${-(b + n)})$`,
                `${yx ? '$x$' : '$y$'} 축에 접하려면 중심의 ${yx ? '$y$' : '$x$'} 좌표의 절댓값이 반지름과 같아야 해요: $|${am}|=${rad}$`,
                `$m=${rad - a}$ 또는 $m=${-rad - a}$`,
                `곱: $${pr(rad - a)}\\times${pr(-rad - a)}=${prod}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-double-reflection',
          title: '두 번 꺾이는 최단 경로 (대칭이동 두 번)',
          gen(r) {
            const legs: [number, number, number][] = [];
            for (const [x, y, z] of [
              [3, 4, 5],
              [6, 8, 10],
              [5, 12, 13],
              [8, 15, 17],
              [9, 12, 15],
              [12, 16, 20],
            ] as [number, number, number][]) {
              legs.push([x, y, z], [y, x, z]);
            }
            const axes = r.chance(0.5);
            for (let tries = 0; ; tries++) {
              const [X, Y, Z] = r.pick(legs);
              if (axes) {
                // A(a1,a2), B(b1,b2) 제1사분면, P: x축, Q: y축. a1+b1=X, a2+b2=Y
                if (X < 2 || Y < 2) continue;
                const a1 = r.int(1, X - 1),
                  a2 = r.int(1, Y - 1);
                const b1 = X - a1,
                  b2 = Y - a2;
                if (!(a2 / Y < a1 / X)) continue; // x축을 먼저 만남
                return {
                  q: `좌표평면 위의 두 점 $A${P2(a1, a2)}$, $B${P2(b1, b2)}$ 와 $x$ 축 위의 점 $P$, $y$ 축 위의 점 $Q$ 에 대하여 $\\overline{AP}+\\overline{PQ}+\\overline{QB}$ 의 최솟값을 구하세요.`,
                  answer: ans(Z),
                  steps: [
                    `$A$ 를 $x$ 축에 대칭이동한 점 $A'${P2(a1, -a2)}$: $\\overline{AP}=\\overline{A'P}$`,
                    `$B$ 를 $y$ 축에 대칭이동한 점 $B'${P2(-b1, b2)}$: $\\overline{QB}=\\overline{QB'}$`,
                    `$\\overline{AP}+\\overline{PQ}+\\overline{QB}=\\overline{A'P}+\\overline{PQ}+\\overline{QB'}\\ge\\overline{A'B'}$`,
                    `선분 $A'B'$ 은 $x$ 축과 먼저, 그다음 $y$ 축과 만나므로 그 교점을 $P$, $Q$ 로 잡으면 등호가 성립해요.`,
                    `$\\overline{A'B'}=\\sqrt{(${a1}+${b1})^{2}+(${a2}+${b2})^{2}}=\\sqrt{${X * X}+${Y * Y}}=${Z}$`,
                  ],
                };
              }
              // P: x축, Q: 직선 x=c. A, B 는 y>0, x<c. A' = (a1,-a2), B' = (2c-b1, b2)
              const c = r.int(2, 6);
              const a1 = r.int(c - 6, c - 1),
                b1 = r.int(c - 6, c - 1);
              const dxx = 2 * c - b1 - a1;
              if (dxx !== X) {
                if (tries > 200) continue;
                continue;
              }
              const a2 = r.int(1, Y - 1);
              const b2 = Y - a2;
              const t1 = a2 / Y,
                t2 = (c - a1) / X;
              if (!(t1 < t2)) continue;
              return {
                q: `좌표평면 위의 두 점 $A${P2(a1, a2)}$, $B${P2(b1, b2)}$ 와 $x$ 축 위의 점 $P$, 직선 $x=${c}$ 위의 점 $Q$ 에 대하여 $\\overline{AP}+\\overline{PQ}+\\overline{QB}$ 의 최솟값을 구하세요.`,
                answer: ans(Z),
                steps: [
                  `$A$ 를 $x$ 축에 대칭이동한 점 $A'${P2(a1, -a2)}$: $\\overline{AP}=\\overline{A'P}$`,
                  `$B$ 를 직선 $x=${c}$ 에 대칭이동한 점 $B'${P2(2 * c - b1, b2)}$: $\\overline{QB}=\\overline{QB'}$`,
                  `$\\overline{AP}+\\overline{PQ}+\\overline{QB}=\\overline{A'P}+\\overline{PQ}+\\overline{QB'}\\ge\\overline{A'B'}$`,
                  `선분 $A'B'$ 은 $x$ 축과 먼저, 그다음 직선 $x=${c}$ 와 만나므로 그 교점을 $P$, $Q$ 로 잡으면 등호가 성립해요.`,
                  `$\\overline{A'B'}=\\sqrt{${X}^{2}+${Y}^{2}}=${Z}$`,
                ],
              };
            }
          },
        },
        {
          id: 'top-reflected-circles',
          title: '대칭이동한 두 원 위의 점 사이 거리의 최대·최소',
          gen(r) {
            const a = r.int(-4, 4),
              b = r.int(-4, 4);
            const pointSym = r.chance(0.6);
            let D: number, M: [number, number], desc: string, cen2: [number, number], how: string;
            if (pointSym) {
              const [x, y, z] = r.pick(TRI);
              const ux = x * r.sign(),
                uy = y * r.sign();
              M = [a + ux, b + uy];
              D = 2 * z;
              cen2 = [2 * M[0] - a, 2 * M[1] - b];
              desc = `점 $${P2(M[0], M[1])}$ 에 대하여 대칭이동한`;
              how = `점 $M${P2(M[0], M[1])}$ 대칭이므로 $M$ 은 두 중심의 중점: $C'${P2(cen2[0], cen2[1])}$, $\\overline{CC'}=2\\overline{CM}=2\\times${z}=${D}$`;
            } else {
              const k = a + r.sign() * r.int(2, 5);
              M = [k, 0];
              cen2 = [2 * k - a, b];
              D = Math.abs(cen2[0] - a);
              desc = `직선 $x=${M[0]}$ 에 대하여 대칭이동한`;
              how = `직선 $x=${M[0]}$ 대칭: $C'${P2(cen2[0], b)}$, $\\overline{CC'}=|${cen2[0]}-${pr(a)}|=${D}$`;
            }
            const rad = r.int(1, Math.max(1, Math.floor((D - 1) / 2)));
            return {
              q: `원 $C$: $${circGen(a, b, rad * rad)}$ 을 ${desc} 원을 $C'$ 이라 하자. 원 $C$ 위의 점 $P$ 와 원 $C'$ 위의 점 $Q$ 에 대하여 $\\overline{PQ}$ 의 최댓값과 최솟값을 구하세요.`,
              answer: fld(['최댓값', D + 2 * rad], ['최솟값', D - 2 * rad]),
              steps: [
                `$C$: $${sq('x', a)}+${sq('y', b)}=${rad * rad}$ → 중심 $${P2(a, b)}$, 반지름 $${rad}$`,
                `대칭이동해도 반지름은 그대로 $${rad}$`,
                how,
                `$${D}>${2 * rad}$ 이므로 두 원은 만나지 않아요.`,
                `두 중심을 지나는 직선 위에서 최대·최소: 최댓값 $${D}+${rad}+${rad}=${D + 2 * rad}$, 최솟값 $${D}-${2 * rad}=${D - 2 * rad}$`,
              ],
            };
          },
        },
      ],
    },

    // ───────── 집합
    'hc2-4': {
      skills: [
        {
          id: 'subset-condition-count',
          title: '조건을 만족시키는 부분집합의 개수',
          gen(r, level) {
            const n = r.int(5, 8);
            const U = Array.from({ length: n }, (_, i) => i + 1);
            const sh = r.shuffle(U);
            const ka = r.int(1, 2),
              kb = r.int(1, 2);
            const A = sh.slice(0, ka).sort((x, y) => x - y);
            const B = sh.slice(ka, ka + kb).sort((x, y) => x - y);
            const Utex = `U=\\{1, 2, \\cdots, ${n}\\}`;
            if (level === 1) {
              const v = 2 ** (n - ka - kb);
              return {
                q: `전체집합 $${Utex}$ 의 부분집합 $X$ 중에서 $${setTex(A)}\\subset X$ 이고 $X\\cap${setTex(B)}=\\varnothing$ 인 집합 $X$ 의 개수를 구하세요.`,
                answer: ans(v),
                steps: [`$${A.join(', ')}$ 은 반드시 포함, $${B.join(', ')}$ 은 반드시 제외`, `나머지 $${n - ka - kb}$ 개 원소는 넣거나 빼거나 자유: $2^{${n - ka - kb}}=${v}$`],
              };
            }
            if (level === 2) {
              const AA = sh.slice(0, ka + 2).sort((x, y) => x - y);
              const C = AA.slice(0, r.int(1, AA.length - 1));
              const v = 2 ** (n - AA.length);
              return {
                q: `전체집합 $${Utex}$ 의 부분집합 $X$ 중에서 $X\\cap${setTex(AA)}=${setTex(C)}$ 인 집합 $X$ 의 개수를 구하세요.`,
                answer: ans(v),
                steps: [
                  `$${setTex(AA)}$ 의 원소 중 $${C.join(', ')}$ 은 $X$ 에 들어가고, 나머지 $${AA.filter((x) => !C.includes(x)).join(', ')}$ 은 들어가면 안 돼요.`,
                  `$${setTex(AA)}$ 밖의 $${n - AA.length}$ 개 원소는 자유: $2^{${n - AA.length}}=${v}$`,
                ],
              };
            }
            const A2 = sh.slice(0, ka + 1).sort((x, y) => x - y);
            const B2 = sh.slice(ka + 1, ka + 1 + kb).sort((x, y) => x - y);
            const all = 2 ** (n - B2.length),
              none = 2 ** (n - A2.length - B2.length);
            return {
              q: `전체집합 $${Utex}$ 의 두 부분집합 $A=${setTex(A2)}$, $B=${setTex(B2)}$ 에 대하여 $X\\cap A\\ne\\varnothing$, $X\\cap B=\\varnothing$ 을 만족시키는 부분집합 $X$ 의 개수를 구하세요.`,
              answer: ans(all - none),
              steps: [
                `$X\\cap B=\\varnothing$ 인 $X$: $B$ 의 원소를 빼고 나머지 $${n - B2.length}$ 개로 만든 부분집합 → $2^{${n - B2.length}}=${all}$ 개`,
                `그중 $X\\cap A=\\varnothing$ 인 것: $A$, $B$ 의 원소를 모두 뺀 $${n - A2.length - B2.length}$ 개로 → $2^{${n - A2.length - B2.length}}=${none}$ 개`,
                `'적어도 하나'는 여사건으로: $${all}-${none}=${all - none}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-subset-both-meet',
          title: '두 집합과 모두 만나는 부분집합의 개수',
          gen(r) {
            const n = r.int(8, 12);
            const [p, q] = r.sample([2, 3, 4, 5], 2).sort((x, y) => x - y);
            const U = Array.from({ length: n }, (_, i) => i + 1);
            const A = U.filter((x) => x % p === 0),
              B = U.filter((x) => x % q === 0);
            const AB = U.filter((x) => x % p === 0 || x % q === 0);
            const useK = r.chance(0.5);
            const k = r.int(2, 4);
            const cnt = (m: number) => (useK ? nCr(m, k) : 2 ** m);
            const tot = cnt(n),
              na = cnt(n - A.length),
              nb = cnt(n - B.length),
              nab = cnt(n - AB.length);
            const v = tot - na - nb + nab;
            const f = (m: number) => (useK ? `{}_{${m}}\\mathrm{C}_{${k}}` : `2^{${m}}`);
            return {
              q: `전체집합 $U=\\{1, 2, 3, \\cdots, ${n}\\}$ 의 두 부분집합 $A$, $B$ 가 각각 $U$ 의 원소 중 $${p}$ 의 배수, $${q}$ 의 배수의 집합일 때, $X\\cap A\\ne\\varnothing$, $X\\cap B\\ne\\varnothing$${useK ? `, $n(X)=${k}$` : ''} 를 모두 만족시키는 $U$ 의 부분집합 $X$ 의 개수를 구하세요.`,
              answer: ans(v),
              steps: [
                `$A=${setTex(A)}$, $B=${setTex(B)}$, $A\\cup B=${setTex(AB)}$`,
                `여사건: '$X\\cap A=\\varnothing$ 또는 $X\\cap B=\\varnothing$' 을 전체에서 빼요.`,
                `전체 ${useK ? `(원소 ${k}개)` : ''}: $${f(n)}=${tot}$`,
                `$X\\cap A=\\varnothing$: $A$ 밖의 $${n - A.length}$ 개에서 → $${f(n - A.length)}=${na}$, $X\\cap B=\\varnothing$: $${f(n - B.length)}=${nb}$`,
                `둘 다: $A\\cup B$ 밖의 $${n - AB.length}$ 개에서 → $${f(n - AB.length)}=${nab}$`,
                `$${tot}-(${na}+${nb}-${nab})=${v}$`,
              ],
            };
          },
        },
        {
          id: 'top-set-pairs',
          title: '조건을 만족시키는 집합의 순서쌍 개수',
          gen(r) {
            const n = r.int(3, 6);
            const kind = r.int(0, 2);
            const Utex = `U=\\{1, 2, \\cdots, ${n}\\}`;
            if (kind === 0) {
              const k = r.int(1, n - 1);
              const v = nCr(n, k) * 2 ** (n - k);
              return {
                q: `전체집합 $${Utex}$ 의 두 부분집합 $A$, $B$ 에 대하여 $A\\cup B=U$, $n(A\\cap B)=${k}$ 를 만족시키는 순서쌍 $(A, B)$ 의 개수를 구하세요.`,
                answer: ans(v),
                steps: [
                  `각 원소는 'A 에만', 'B 에만', '둘 다' 중 한 곳에 들어가요 ($A\\cup B=U$ 이므로 어디에도 없는 경우는 없어요).`,
                  `'둘 다'에 들어갈 $${k}$ 개 고르기: $${'{}_{' + n + '}\\mathrm{C}_{' + k + '}'}=${nCr(n, k)}$`,
                  `나머지 $${n - k}$ 개는 'A 에만' 또는 'B 에만': $2^{${n - k}}=${2 ** (n - k)}$`,
                  `$${nCr(n, k)}\\times${2 ** (n - k)}=${v}$`,
                ],
              };
            }
            if (kind === 1) {
              const k = r.int(1, n);
              const v = nCr(n, k) * 2 ** k;
              return {
                q: `전체집합 $${Utex}$ 의 두 부분집합 $A$, $B$ 에 대하여 $A\\subset B$, $n(B)=${k}$ 를 만족시키는 순서쌍 $(A, B)$ 의 개수를 구하세요.`,
                answer: ans(v),
                steps: [`$B$ 고르기: $${'{}_{' + n + '}\\mathrm{C}_{' + k + '}'}=${nCr(n, k)}$`, `$A$ 는 $B$ 의 부분집합: $2^{${k}}=${2 ** k}$`, `$${nCr(n, k)}\\times${2 ** k}=${v}$`],
              };
            }
            const v = 2 * 3 ** (n - 1);
            return {
              q: `전체집합 $${Utex}$ 의 두 부분집합 $A$, $B$ 에 대하여 $A\\cap B=\\varnothing$, $1\\in A\\cup B$ 를 만족시키는 순서쌍 $(A, B)$ 의 개수를 구하세요.`,
              answer: ans(v),
              steps: [
                `$A\\cap B=\\varnothing$ 이면 각 원소는 'A 에만', 'B 에만', '어디에도 없음' 의 3가지`,
                `원소 $1$ 은 $A$ 또는 $B$ 에 있어야 하므로 2가지`,
                `나머지 $${n - 1}$ 개는 3가지씩: $3^{${n - 1}}=${3 ** (n - 1)}$`,
                `$2\\times${3 ** (n - 1)}=${v}$`,
              ],
            };
          },
        },
      ],
    },

    // ───────── 명제
    'hc2-5': {
      skills: [
        {
          id: 'forall-quadratic',
          title: "'모든'·'어떤'이 있는 명제가 참일 조건",
          gen(r, level) {
            if (level === 1) {
              const a = r.nonzero(-5, 5);
              return {
                q: `명제 '모든 실수 $x$ 에 대하여 $${tt([1, 'x^{2}'], [2 * a, 'x'])}+k\\ge0$ 이다.' 가 참이 되도록 하는 실수 $k$ 의 최솟값을 구하세요.`,
                answer: ans(a * a),
                steps: [`이차부등식이 모든 $x$ 에서 성립하려면 판별식 $\\frac{D}{4}\\le0$`, `$\\frac{D}{4}=${a * a}-k\\le0$`, `$k\\ge${a * a}$ 이므로 최솟값 $${a * a}$`],
              };
            }
            if (level === 2) {
              const r1 = r.int(-4, 3),
                r2 = r.int(r1 + 1, r1 + 6);
              const s = r1 + r2,
                t = r1 * r2;
              const expr = `x^{2}-2kx${tail(tt([s, 'k'], [-t, '']))}`;
              return {
                q: `명제 '모든 실수 $x$ 에 대하여 $${expr}\\ge0$ 이다.' 가 참이 되도록 하는 정수 $k$ 의 개수를 구하세요.`,
                answer: ans(r2 - r1 + 1),
                steps: [
                  `모든 $x$ 에서 성립하려면 $\\frac{D}{4}\\le0$`,
                  `$\\frac{D}{4}=k^{2}-(${tt([s, 'k'], [-t, ''])})=${poly([1, -s, t], 'k')}\\le0$`,
                  `$${r1 === 0 ? 'k' : `(k${cst(-r1)})`}${r2 === 0 ? 'k' : `(k${cst(-r2)})`}\\le0$ → $${r1}\\le k\\le ${r2}$`,
                  `정수 $k$ 는 $${r2 - r1 + 1}$ 개`,
                ],
              };
            }
            const c = r.int(3, 12);
            return {
              q: `명제 '어떤 실수 $x$ 에 대하여 $kx^{2}-2kx+${c}<0$ 이다.' 가 거짓이 되도록 하는 정수 $k$ 의 개수를 구하세요.`,
              answer: ans(c + 1),
              steps: [
                `주어진 명제가 거짓 ⇔ 부정 '모든 실수 $x$ 에 대하여 $kx^{2}-2kx+${c}\\ge0$' 이 참`,
                `(i) $k=0$: $${c}\\ge0$ 이므로 참`,
                `(ii) $k<0$: 위로 볼록한 이차함수라 $x$ 가 커지면 음수가 되므로 거짓`,
                `(iii) $k>0$: $\\frac{D}{4}=k^{2}-${c}k\\le0$ → $0<k\\le ${c}$`,
                `따라서 $0\\le k\\le ${c}$ 인 정수 $k$ 는 $${c + 1}$ 개`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-suff-nec-chain',
          title: '충분조건·필요조건을 동시에 만족시키는 상수',
          gen(r) {
            const al = r.int(-5, 3),
              be = r.int(al + 1, al + 6);
            const c = r.int(al - 1, be + 1);
            const kmin = Math.max(c - al, be - c, 1);
            const off = r.int(-2, 2);
            const e = c + off;
            const s = r.int(1, 4);
            const m = Math.abs(off) + kmin + s;
            const kmax = m - Math.abs(off);
            let sum = 0;
            for (let k = kmin; k <= kmax; k++) sum += k;
            const pq = poly([1, -(al + be), al * be]);
            const ck = (sg: number) => (c === 0 ? (sg < 0 ? '-k' : 'k') : `${c}${sg < 0 ? '-' : '+'}k`);
            const abs = (v: string, a: number) => (a === 0 ? `|${v}|` : `|${v}${a > 0 ? '-' : '+'}${Math.abs(a)}|`);
            return {
              q: `세 조건 $p$: $${pq}\\le0$, $q$: $${abs('x', c)}\\le k$, $r$: $${abs('x', e)}\\le ${m}$ 에 대하여 $p$ 는 $q$ 이기 위한 충분조건이고, $r$ 은 $q$ 이기 위한 필요조건이다. 이를 만족시키는 모든 자연수 $k$ 의 값의 합을 구하세요.`,
              answer: ans(sum),
              steps: [
                `진리집합 $P=\\{x\\mid ${al}\\le x\\le ${be}\\}$, $Q=\\{x\\mid ${ck(-1)}\\le x\\le ${ck(1)}\\}$, $R=\\{x\\mid ${e - m}\\le x\\le ${e + m}\\}$`,
                `$p\\Rightarrow q$, $q\\Rightarrow r$ 이므로 $P\\subset Q\\subset R$`,
                `$P\\subset Q$: $${ck(-1)}\\le ${al}$, $${be}\\le ${ck(1)}$ → $k\\ge ${Math.max(c - al, be - c)}$`,
                `$Q\\subset R$: $${e - m}\\le ${ck(-1)}$, $${ck(1)}\\le ${e + m}$ → $k\\le ${kmax}$`,
                `자연수 $k$: $${kmin}\\le k\\le ${kmax}$ → 합 $${sum}$`,
              ],
            };
          },
        },
        {
          id: 'top-amgm-twice',
          title: '산술평균과 기하평균으로 식의 최솟값',
          gen(r) {
            const kind = r.int(0, 1);
            if (kind === 0) {
              const u = r.int(1, 4),
                v = r.int(1, 4);
              const S2 = (u + v) * (u + v);
              const divs: number[] = [];
              for (let d = 1; d <= S2; d++) if (S2 % d === 0 && d <= 12) divs.push(d);
              const s = r.pick(divs);
              const mn = S2 / s;
              return {
                q: `양수 $x$, $y$ 가 $x+y=${s}$ 를 만족시킬 때, $\\frac{${u * u}}{x}+\\frac{${v * v}}{y}$ 의 최솟값을 구하세요.`,
                answer: ans(mn),
                steps: [
                  `$(x+y)\\left(\\frac{${u * u}}{x}+\\frac{${v * v}}{y}\\right)=${u * u}+${v * v}+\\frac{${u * u}y}{x}+\\frac{${v * v}x}{y}$`,
                  `산술·기하평균: $\\frac{${u * u}y}{x}+\\frac{${v * v}x}{y}\\ge2\\sqrt{${u * u * v * v}}=${2 * u * v}$`,
                  `따라서 $${s}\\left(\\frac{${u * u}}{x}+\\frac{${v * v}}{y}\\right)\\ge${u * u + v * v + 2 * u * v}$`,
                  `등호는 $${u}y=${v}x$ 일 때, 즉 $x=${T(fr(s * u, u + v))}$, $y=${T(fr(s * v, u + v))}$ 에서 성립`,
                  `최솟값 $\\frac{${S2}}{${s}}=${mn}$`,
                ],
              };
            }
            const g = r.int(1, 3),
              u = r.int(1, 3),
              v = r.int(1, 3);
            const a = g * u * u,
              b = g * v * v;
            const mn = a + b + 2 * g * u * v;
            return {
              q: `양수 $x$, $y$ 에 대하여 $\\left(x+\\frac{${a}}{y}\\right)\\left(y+\\frac{${b}}{x}\\right)$ 의 최솟값을 구하세요.`,
              answer: ans(mn),
              steps: [
                `전개: $xy+${b}+${a}+\\frac{${a * b}}{xy}$`,
                `$xy>0$ 이므로 $xy+\\frac{${a * b}}{xy}\\ge2\\sqrt{${a * b}}=${2 * g * u * v}$`,
                `등호는 $xy=${g * u * v}$ 일 때 성립 (예: $x=1$, $y=${g * u * v}$)`,
                `최솟값 $${a}+${b}+${2 * g * u * v}=${mn}$`,
                `주의: $x+\\frac{${a}}{y}\\ge2\\sqrt{\\frac{${a}x}{y}}$ 처럼 따로 쓰면 두 등호가 동시에 성립하지 않을 수 있어요.`,
              ],
            };
          },
        },
      ],
    },

    // ───────── 함수
    'hc2-6': {
      skills: [
        {
          id: 'inverse-intersection',
          title: '함수와 역함수의 그래프의 교점',
          gen(r, level) {
            if (level === 1) {
              const a = r.pick([2, 3, 4, -2, -3]);
              const k = r.nonzero(-3, 3);
              const b = k * (1 - a);
              return {
                q: `함수 $f(x)=${poly([a, b])}$ 의 그래프와 그 역함수 $y=f^{-1}(x)$ 의 그래프의 교점을 $(p, q)$ 라 할 때, $p+q$ 의 값을 구하세요.`,
                answer: ans(2 * k),
                steps: [
                  a > 0 ? `$f$ 는 증가함수이므로 교점은 직선 $y=x$ 위에 있어요.` : `$f^{-1}(x)=-\\frac{x${cst(-b)}}{${-a}}$ 와 $f(x)$ 를 같다고 놓고 풀면 교점은 $y=x$ 위에 있어요.`,
                  `$${poly([a, b])}=x$ → $x=${k}$`,
                  `$p=q=${k}$ 이므로 $p+q=${2 * k}$`,
                ],
              };
            }
            const p = r.int(-3, 4);
            if (level === 2) {
              const two = r.chance(0.6);
              const q = two ? p : p - 2;
              const xs = two ? [p, p + 1] : [p + 2];
              const sum = xs.reduce((s, x) => s + x, 0);
              return {
                q: `함수 $f(x)=${sq('x', p)}${cst(q)}$ $(x\\ge ${p})$ 의 그래프와 그 역함수의 그래프가 만나는 모든 점의 $x$ 좌표의 합을 구하세요.`,
                answer: ans(sum),
                steps: [
                  `$x\\ge${p}$ 에서 $f$ 는 증가함수이므로 두 그래프의 교점은 $y=x$ 위에 있어요.`,
                  `$${sq('x', p)}${cst(q)}=x$ 에서 $t=x${cst(-p)}$ $(t\\ge0)$ 로 놓으면 $t^{2}-t${cst(q - p)}=0$`,
                  two ? `$t(t-1)=0$ → $t=0, 1$ → $x=${p}, ${p + 1}$` : `$(t-2)(t+1)=0$, $t\\ge0$ 이므로 $t=2$ → $x=${p + 2}$`,
                  `합: $${sum}$`,
                ],
              };
            }
            const [n, u, v] = r.pick([
              [9, 3, 6],
              [16, 4, 12],
              [18, 6, 12],
              [25, 5, 20],
              [25, 10, 15],
              [4, 0, 4],
              [6, 0, 6],
              [9, 0, 9],
            ] as [number, number, number][]);
            const q = p + (u * v) / n;
            const d2 = 2 * (v - u) * (v - u);
            return {
              q: `함수 $f(x)=\\frac{1}{${n}}${sq('x', p)}${cst(q)}$ $(x\\ge ${p})$ 의 그래프와 그 역함수의 그래프가 서로 다른 두 점에서 만날 때, 두 교점 사이의 거리의 제곱을 구하세요.`,
              answer: ans(d2),
              steps: [
                `$x\\ge${p}$ 에서 $f$ 는 증가함수이므로 교점은 직선 $y=x$ 위에 있어요.`,
                `$\\frac{1}{${n}}${sq('x', p)}${cst(q)}=x$, $t=x${cst(-p)}$ 로 놓으면 $\\frac{t^{2}}{${n}}-t${cst((u * v) / n)}=0$`,
                `$t^{2}-${n}t${cst(u * v)}=0$ → $t=${u}, ${v}$ (모두 $0$ 이상)`,
                `교점 $(${p + u}, ${p + u})$, $(${p + v}, ${p + v})$`,
                `거리의 제곱 $=2\\times${v - u}^{2}=${d2}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-function-count-ff',
          title: '합성 조건을 만족시키는 함수의 개수',
          gen(r) {
            const kind = r.int(0, 2);
            const n = kind === 2 ? r.int(3, 6) : r.int(3, 5);
            // 완전탐색
            const all: number[][] = [];
            const rec = (cur: number[]) => {
              if (cur.length === n) {
                all.push(cur.slice());
                return;
              }
              for (let v = 1; v <= n; v++) {
                cur.push(v);
                rec(cur);
                cur.pop();
              }
            };
            if (n <= 5) rec([]);
            const ok = (f: number[]) => {
              const g = (x: number) => f[x - 1];
              if (kind === 0) return f.every((_, i) => g(g(i + 1)) === i + 1);
              if (kind === 1) return f.every((_, i) => g(g(i + 1)) === g(i + 1));
              return new Set(f).size === n && f.every((_, i) => g(g(g(i + 1))) === i + 1);
            };
            let cnt = 0;
            const terms: string[] = [];
            const fact = (m: number): number => (m <= 1 ? 1 : m * fact(m - 1));
            if (kind === 0) {
              for (let k = 0; 2 * k <= n; k++) {
                let df = 1;
                for (let j = 2 * k - 1; j > 0; j -= 2) df *= j;
                const c = nCr(n, 2 * k) * df;
                cnt += c;
                terms.push(`쌍 ${k}개: $${c}$`);
              }
            } else if (kind === 1) {
              for (let k = 1; k <= n; k++) {
                const c = nCr(n, k) * k ** (n - k);
                cnt += c;
                terms.push(`$n(S)=${k}$: $${'{}_{' + n + '}\\mathrm{C}_{' + k + '}'}\\times${k}^{${n - k}}=${c}$`);
              }
            } else {
              for (let j = 0; 3 * j <= n; j++) {
                const c = fact(n) / (fact(n - 3 * j) * 3 ** j * fact(j));
                cnt += c;
                terms.push(`순환 ${j}개: $${c}$`);
              }
            }
            if (n <= 5) {
              const bf = all.filter(ok).length;
              if (bf !== cnt) throw new Error('함수 개수 불일치');
            }
            const X = `X=\\{${Array.from({ length: n }, (_, i) => i + 1).join(', ')}\\}`;
            const cond =
              kind === 0 ? '모든 $x\\in X$ 에 대하여 $(f\\circ f)(x)=x$' : kind === 1 ? '모든 $x\\in X$ 에 대하여 $(f\\circ f)(x)=f(x)$' : '$f$ 가 일대일대응이고 모든 $x\\in X$ 에 대하여 $(f\\circ f\\circ f)(x)=x$';
            const idea =
              kind === 0
                ? `$f(a)=b$ 이면 $f(b)=a$ 이므로 각 원소는 자기 자신으로 가거나($f(a)=a$), 다른 원소와 서로 바꾸는 쌍을 이뤄요.`
                : kind === 1
                  ? `치역을 $S$ 라 하면 $y\\in S$ 일 때 $f(y)=y$ 여야 해요. $S$ 밖의 원소는 $S$ 의 아무 원소로나 보내면 돼요.`
                  : `$f$ 를 따라가면 $a\\to f(a)\\to f(f(a))\\to a$ 이므로 각 원소는 고정되거나 세 원소가 도는 순환을 이뤄요. 세 원소 순환 하나는 2가지 방향.`;
            return {
              q: `집합 $${X}$ 에 대하여 함수 $f:X\\to X$ 중에서 ${cond} 를 만족시키는 함수 $f$ 의 개수를 구하세요.`,
              answer: ans(cnt),
              steps: [idea, ...terms, `합: $${cnt}$`],
            };
          },
        },
        {
          id: 'top-perm-iterate',
          title: '일대일대응을 거듭 합성한 함숫값',
          gen(r) {
            const shapes = [
              [2, 4],
              [3, 3],
              [1, 2, 3],
              [1, 5],
              [2, 2, 2],
            ];
            const shape = r.pick(shapes);
            const els = r.shuffle([1, 2, 3, 4, 5, 6]);
            const f = new Array(6).fill(0);
            let idx = 0;
            for (const L of shape) {
              const c = els.slice(idx, idx + L);
              idx += L;
              c.forEach((x, i) => (f[x - 1] = c[(i + 1) % L]));
            }
            const N = r.int(50, 200),
              M = r.int(20, 120);
            const a = r.int(1, 6),
              b = r.int(1, 6);
            let x = a;
            for (let i = 0; i < N; i++) x = f[x - 1];
            const inv = new Array(6).fill(0);
            f.forEach((y, i) => (inv[y - 1] = i + 1));
            let y = b;
            for (let i = 0; i < M; i++) y = inv[y - 1];
            const cyc = cyclesOf(f);
            const cycOf = (z: number) => cyc.find((c) => c.includes(z))!;
            const ca = cycOf(a),
              cb = cycOf(b);
            return {
              q: `집합 $X=\\{1, 2, 3, 4, 5, 6\\}$ 에서 $X$ 로의 일대일대응 $f$ 가 다음 표와 같다. $f^{1}=f$, $f^{n+1}=f\\circ f^{n}$ 이고 $g=f^{-1}$, $g^{1}=g$, $g^{n+1}=g\\circ g^{n}$ 일 때, $f^{${N}}(${a})+g^{${M}}(${b})$ 의 값을 구하세요.`,
              table: [
                ['$x$', '$1$', '$2$', '$3$', '$4$', '$5$', '$6$'],
                ['$f(x)$', ...f.map((v) => `$${v}$`)],
              ],
              answer: ans(x + y),
              steps: [
                `$f$ 를 따라가면 순환으로 나뉘어요: ${cyc.map((c) => (c.length === 1 ? `$${c[0]}\\to${c[0]}$` : `$${[...c, c[0]].join('\\to')}$`)).join(', ')}`,
                `$${a}$ 은 길이 $${ca.length}$ 인 순환에 있으므로 $f^{${ca.length}}(${a})=${a}$`,
                N % ca.length === 0
                  ? `$${N}$ 은 $${ca.length}$ 의 배수이므로 $f^{${N}}(${a})=${x}$`
                  : `$${N}=${ca.length}\\times${Math.floor(N / ca.length)}+${N % ca.length}$ → $f^{${N}}(${a})=f^{${N % ca.length}}(${a})=${x}$`,
                `$g$ 는 순환을 거꾸로 따라가요. $${b}$ 이 있는 순환의 길이 $${cb.length}$`,
                M % cb.length === 0
                  ? `$${M}$ 은 $${cb.length}$ 의 배수이므로 $g^{${M}}(${b})=${y}$`
                  : `$${M}=${cb.length}\\times${Math.floor(M / cb.length)}+${M % cb.length}$ → $g^{${M}}(${b})=g^{${M % cb.length}}(${b})=${y}$`,
                `합: $${x}+${y}=${x + y}$`,
              ],
            };
          },
        },
      ],
    },

    // ───────── 유리함수와 무리함수
    'hc2-7': {
      skills: [
        {
          id: 'irrational-line-count',
          title: '무리함수의 그래프와 직선의 교점 개수',
          gen(r, level) {
            const m = r.int(1, 3);
            const a = r.int(-4, 4),
              b = r.int(-3, 3);
            const c = 2 * m;
            const fx = `y=${c}\\sqrt{${poly([1, -a])}}${cst(b)}`;
            const kk = a - b === 0 ? 'k' : `(k${cst(a - b)})`;
            const sub = [`$\\sqrt{${poly([1, -a])}}=t$ $(t\\ge0)$ 로 놓으면 $x=t^{2}${cst(a)}$, 곡선 위의 점은 $y=${c}t${cst(b)}$`, `직선에 대입: $${c}t${cst(b)}=t^{2}${cst(a)}+k$ → $t^{2}-${c}t+${kk}=0$`];
            if (level === 1) {
              const k = m * m + b - a;
              return {
                q: `곡선 $${fx}$ 와 직선 $y=x+k$ 가 접할 때, 실수 $k$ 의 값을 구하세요.`,
                answer: ans(k),
                steps: [...sub, `접하면 중근: $\\frac{D}{4}=${m * m}-${kk}=0$`, `$k=${k}$ (이때 $t=${m}\\ge0$)`],
              };
            }
            const lo = b - a,
              hi = b - a + m * m;
            const steps = [...sub, `서로 다른 두 실근 $t\\ge0$: $\\frac{D}{4}=${m * m}-${kk}>0$, 두 근의 합 $${c}>0$, 곱 $k${cst(a - b)}\\ge0$`, `$${lo}\\le k<${hi}$`];
            if (level === 2) {
              return {
                q: `곡선 $${fx}$ 와 직선 $y=x+k$ 가 서로 다른 두 점에서 만나도록 하는 실수 $k$ 의 값의 범위가 $\\alpha\\le k<\\beta$ 일 때, $\\alpha+\\beta$ 의 값을 구하세요.`,
                answer: ans(lo + hi),
                steps: [...steps, `$\\alpha+\\beta=${lo}+${pr(hi)}=${lo + hi}$`],
              };
            }
            return {
              q: `곡선 $${fx}$ 와 직선 $y=x+k$ 가 서로 다른 두 점에서 만나도록 하는 정수 $k$ 의 개수를 구하세요.`,
              answer: ans(m * m),
              steps: [...steps, `정수 $k$: $${m === 1 ? `${lo}` : m * m === 4 ? `${lo}, ${lo + 1}, ${lo + 2}, ${lo + 3}` : `${lo}, ${lo + 1}, \\cdots, ${hi - 1}`}$ → $${m * m}$ 개`],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-rational-lattice',
          title: '유리함수의 그래프 위의 격자점 개수',
          gen(r) {
            const k = r.nonzero(-36, 36);
            const ak = Math.abs(k) < 2 ? 12 * Math.sign(k) : k;
            const p = r.int(-4, 4),
              q = r.int(-4, 4);
            let quad = r.chance(0.4);
            const divs: number[] = [];
            for (let d = 1; d <= Math.abs(ak); d++) if (Math.abs(ak) % d === 0) divs.push(d, -d);
            const pts = divs.map((d) => [p + d, q + ak / d]);
            if (quad && !pts.some(([x, y]) => x > 0 && y > 0)) quad = false;
            const good = quad ? pts.filter(([x, y]) => x > 0 && y > 0) : pts;
            const num = poly([q, ak - q * p]);
            const den = poly([1, -p]);
            return {
              q: `함수 $y=\\frac{${num}}{${den}}$ 의 그래프 위의 점 중에서 $x$ 좌표와 $y$ 좌표가 모두 정수${quad ? '이고 제1사분면 위에 있는' : '인'} 점의 개수를 구하세요.`,
              answer: ans(good.length),
              steps: [
                `$y=\\frac{${num}}{${den}}=\\frac{${ak}}{${den}}${cst(q)}$`,
                `$y$ 가 정수 ⇔ $${den}$ 이 $${ak}$ 의 약수 (양·음 모두)`,
                `$${Math.abs(ak)}$ 의 양의 약수 $${divs.filter((d) => d > 0).length}$ 개 → $${den}$ 의 값은 $${divs.length}$ 가지`,
                ...(quad ? [`그중 $x>0$, $y>0$ 인 점: ${good.map(([x, y]) => `$(${x}, ${y})$`).join(', ')}`, `따라서 $${good.length}$ 개`] : [`각 값마다 격자점이 하나씩이므로 $${divs.length}$ 개`]),
              ],
            };
          },
        },
        {
          id: 'top-rational-line-miss',
          title: '유리함수의 그래프와 직선이 만나지 않을 조건',
          gen(r) {
            const k = r.int(1, 20);
            const p = r.int(-4, 4),
              q = r.int(-4, 4);
            const ss: number[] = [];
            for (let s = -20; s <= 20; s++) if (s * s < 4 * k) ss.push(s);
            const num = poly([q, k - q * p]);
            const den = poly([1, -p]);
            const lo = ss[0] + p + q,
              hi = ss[ss.length - 1] + p + q;
            return {
              q: `함수 $y=\\frac{${num}}{${den}}$ 의 그래프와 직선 $y=-x+n$ 이 만나지 않도록 하는 정수 $n$ 의 개수를 구하세요.`,
              answer: ans(ss.length),
              steps: [
                `$y=\\frac{${k}}{${den}}${cst(q)}$ 이므로 $X=x${cst(-p)}$, $Y=y${cst(-q)}$ 로 옮기면 $Y=\\frac{${k}}{X}$`,
                `직선은 $Y=-X+s$, $s=n${cst(-p - q)}$`,
                `$\\frac{${k}}{X}=-X+s$ → $X^{2}-sX+${k}=0$ ($X=0$ 은 근이 아니에요)`,
                `만나지 않으려면 $D=s^{2}-${4 * k}<0$ → $s^{2}<${4 * k}$`,
                `정수 $s$: $${ss[0]}\\le s\\le ${ss[ss.length - 1]}$ → $n=s${cst(p + q)}$ 는 $${lo}\\le n\\le ${hi}$`,
                `따라서 $${ss.length}$ 개`,
              ],
            };
          },
        },
      ],
    },
  },
  {
    'top-distance-family': '정점을 지나는 직선과 점 사이 거리는 두 점 사이 거리를 넘지 못하고, 식에서 빠지는 직선 하나를 놓치지 않기',
    'top-set-pairs': '각 원소가 들어갈 수 있는 곳(A 에만·B 에만·둘 다·어디에도 없음)을 정해 곱의 법칙으로 세기',
    'top-function-count-ff': '합성 조건이 원소들의 움직임(고정·맞바꿈·순환)에 어떤 구조를 주는지 먼저 파악하기',
    'top-rational-lattice': '유리함수를 $y=\\frac{k}{x-p}+q$ 꼴로 바꾸면 격자점은 $k$ 의 약수와 하나씩 대응해요',
  },
);
