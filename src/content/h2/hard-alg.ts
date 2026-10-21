// 대수 심화·최상위 유형 — alg.ts 의 각 단원 skills / top 뒤에 덧붙임
import { F } from '../../core/frac';
import { gcd } from '../../core/nt';
import { poly } from '../../core/tex';
import { ans, cst, fld, fr, pr, T, tt, type Hard, withJosa } from './hard-util';

const KN = ['', '', '', '세', '네', '다섯', '여섯', '일곱'];
/** n제곱근 이름: 2 → 제곱근, 3 → 세제곱근, 8 → 8제곱근 */
const rootName = (n: number) => (n === 2 ? '제곱근' : n <= 7 ? `${KN[n]}제곱근` : `$${n}$제곱근`);
/** x^n = c 의 실근 개수 */
const realRoots = (n: number, c: number) => (n % 2 === 1 ? 1 : c > 0 ? 2 : c === 0 ? 1 : 0);
const lg = (b: number | string) => `\\log_{${b}}`;

/** 원에 내접하는 사각형 후보: [a, d, b, c, A(도)] — AB=a, DA=d, BC=b, CD=c */
const CYCLIC: [number, number, number, number, number][] = [];
for (let a = 1; a <= 9; a++)
  for (let d = a; d <= 9; d++)
    for (let b = 1; b <= 9; b++)
      for (let c = b; c <= 9; c++) {
        if (a * a + a * d + d * d === b * b - b * c + c * c && b !== c) CYCLIC.push([a, d, b, c, 120]);
        if (a * a - a * d + d * d === b * b + b * c + c * c && a !== d) CYCLIC.push([a, d, b, c, 60]);
      }

/** 헤론 삼각형 [a, b, c, 넓이] */
const HERON: [number, number, number, number][] = [
  [5, 5, 6, 12],
  [5, 5, 8, 12],
  [13, 14, 15, 84],
  [9, 10, 17, 36],
  [7, 15, 20, 42],
  [11, 13, 20, 66],
  [13, 20, 21, 126],
  [10, 17, 21, 84],
  [10, 13, 13, 60],
];

/** 홀짝 규칙 수열의 다음 항 */
const nextPar = (x: number, p: number) => (x % 2 === 0 ? x / 2 : x + p);

export const ALG_HARD: Hard = withJosa(
  {
    // ───────── 지수와 로그
    'alg-1': {
      skills: [
        {
          id: 'root-real-count',
          title: '거듭제곱근 중 실수의 개수',
          gen(r, level) {
            if (level === 1) {
              const n = r.int(2, 7),
                c = r.nonzero(-20, 20);
              return {
                q: `$${c}$ 의 ${rootName(n)} 중 실수인 것의 개수를 구하세요.`,
                answer: ans(realRoots(n, c)),
                steps: [
                  `$${c}$ 의 ${rootName(n)}은 방정식 $x^{${n}}=${c}$ 의 근이에요. 실근은 $y=x^{${n}}$ 과 $y=${c}$ 의 교점 수`,
                  n % 2 === 1 ? `$n$ 이 홀수이면 $y=x^{n}$ 은 증가함수라 교점은 항상 1개` : `$n$ 이 짝수이면 $y=x^{n}\\ge0$ 이고 $y$ 축 대칭: ${c > 0 ? '양수와는 2점' : '음수와는 만나지 않아요'}`,
                  `답: $${realRoots(n, c)}$`,
                ],
              };
            }
            if (level === 2) {
              const c = r.nonzero(-9, 9);
              const N = r.int(5, 12);
              let s = 0;
              for (let n = 2; n <= N; n++) s += realRoots(n, c);
              const ev = Math.floor(N / 2),
                od = N - 1 - ev;
              return {
                q: `$2\\le n\\le ${N}$ 인 자연수 $n$ 에 대하여 $${c}$ 의 $n$제곱근 중 실수인 것의 개수를 $f(n)$ 이라 할 때, $f(2)+f(3)+\\cdots+f(${N})$ 의 값을 구하세요.`,
                answer: ans(s),
                steps: [
                  `$n$ 이 홀수: $f(n)=1$, $n$ 이 짝수: ${c > 0 ? '양수이므로 $f(n)=2$' : '음수이므로 $f(n)=0$'}`,
                  `$2$ 부터 $${N}$ 까지 짝수 $${ev}$ 개, 홀수 $${od}$ 개`,
                  `합: $${ev}\\times${c > 0 ? 2 : 0}+${od}\\times1=${s}$`,
                ],
              };
            }
            const r1 = r.int(2, 8),
              r2 = r.int(r1 + 1, r1 + 6);
            const N = r.int(r2 + 1, r2 + 5);
            const parts: string[] = [];
            let s = 0;
            for (let n = 2; n <= N; n++) {
              const v = (n - r1) * (n - r2);
              const k = realRoots(n, v);
              s += k;
              parts.push(`f(${n})=${k}`);
            }
            return {
              q: `$2\\le n\\le ${N}$ 인 자연수 $n$ 에 대하여 $${poly([1, -(r1 + r2), r1 * r2], 'n')}$ 의 $n$제곱근 중 실수인 것의 개수를 $f(n)$ 이라 할 때, $f(2)+f(3)+\\cdots+f(${N})$ 의 값을 구하세요.`,
              answer: ans(s),
              steps: [
                `$${poly([1, -(r1 + r2), r1 * r2], 'n')}=(n-${r1})(n-${r2})$: $n<${r1}$ 또는 $n>${r2}$ 이면 양수, $${r1}<n<${r2}$ 이면 음수, $n=${r1}, ${r2}$ 이면 $0$`,
                `$n$ 홀수 → 항상 1개, $n$ 짝수 → 양수 2개, $0$ 이면 1개, 음수 0개`,
                `$${parts.join(', ')}$`,
                `합: $${s}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-log-pairs',
          title: '로그의 값이 정수·유리수가 되는 순서쌍',
          gen(r) {
            const N = r.int(20, 100);
            const rational = r.chance(0.5);
            const sq = Math.floor(Math.sqrt(N));
            if (!rational) {
              let tot = 0;
              const rows: string[] = [];
              for (let a = 2; a <= N; a++) {
                let k = 0,
                  v = a;
                while (v <= N) {
                  k++;
                  v *= a;
                }
                tot += k;
                if (a <= sq) rows.push(`$a=${a}$: $${k}$ 개`);
              }
              return {
                q: `$2$ 이상 $${N}$ 이하의 두 자연수 $a$, $b$ 에 대하여 $${lg('a')}b$ 의 값이 자연수가 되도록 하는 순서쌍 $(a, b)$ 의 개수를 구하세요.`,
                answer: ans(tot),
                steps: [
                  `$${lg('a')}b=k$ (자연수) ⇔ $b=a^{k}$. 각 $a$ 마다 $a^{k}\\le${N}$ 인 $k$ 의 개수를 세요.`,
                  rows.join(', '),
                  `$a\\ge${sq + 1}$ 이면 $a^{2}>${N}$ 이라 $b=a$ 한 가지씩: $${N - sq}$ 개`,
                  `합: $${tot}$`,
                ],
              };
            }
            // 유리수: 같은 '기본 밑'의 거듭제곱끼리
            const groups: number[][] = [];
            const used = new Set<number>();
            for (let c = 2; c <= N; c++) {
              if (used.has(c)) continue;
              const g: number[] = [];
              for (let v = c; v <= N; v *= c) {
                g.push(v);
                used.add(v);
              }
              groups.push(g);
            }
            const big = groups.filter((g) => g.length >= 2);
            const singles = groups.length - big.length;
            const tot = big.reduce((s, g) => s + g.length ** 2, 0) + singles;
            return {
              q: `$2$ 이상 $${N}$ 이하의 두 자연수 $a$, $b$ 에 대하여 $${lg('a')}b$ 의 값이 유리수가 되도록 하는 순서쌍 $(a, b)$ 의 개수를 구하세요.`,
              answer: ans(tot),
              steps: [
                `$${lg('a')}b=\\frac{q}{p}$ ⇔ $a^{q}=b^{p}$ ⇔ $a$, $b$ 가 같은 수 $c$ 의 거듭제곱 ($c$ 는 거듭제곱이 아닌 수)`,
                `$c$ 의 거듭제곱 묶음이 $L$ 개이면 그 안에서 순서쌍 $L^{2}$ 개`,
                big.map((g) => `$\\{${g.join(', ')}\\}$: $${g.length ** 2}$`).join(', '),
                `나머지 $${singles}$ 개의 수는 혼자 묶음이라 $(a, a)$ 만: $${singles}$ 개`,
                `합: $${tot}$`,
              ],
            };
          },
        },
        {
          id: 'top-root-natural',
          title: '거듭제곱근이 자연수가 되는 $n$',
          gen(r) {
            let A = 12,
              B = 12,
              N = 10,
              two = false;
            let ns: number[] = [];
            do {
              A = r.pick([12, 18, 24, 30, 36, 48, 60, 72]);
              two = r.chance(0.5);
              B = r.pick([12, 24, 36, 40, 48, 60, 72, 90]);
              N = r.int(10, 60);
              ns = [];
              for (let n = 2; n <= N; n++) if (A % n === 0 && (!two || B % (2 * n) === 0)) ns.push(n);
            } while (ns.length === 0);
            const askSum = r.chance(0.5);
            const v = askSum ? ns.reduce((s, x) => s + x, 0) : ns.length;
            const expr = two ? `\\sqrt[n]{2^{${A}}}\\times\\sqrt[2n]{3^{${B}}}` : `\\sqrt[n]{2^{${A}}}`;
            return {
              q: `$2\\le n\\le ${N}$ 인 자연수 $n$ 에 대하여 $${expr}$ 의 값이 자연수가 되도록 하는 ${askSum ? '모든 $n$ 의 값의 합을' : '$n$ 의 개수를'} 구하세요.`,
              answer: ans(v),
              steps: [
                two ? `$${expr}=2^{\\frac{${A}}{n}}\\times3^{\\frac{${B}}{2n}}$` : `$${expr}=2^{\\frac{${A}}{n}}$`,
                two ? `자연수가 되려면 두 지수가 모두 $0$ 이상의 정수: $n$ 은 $${A}$ 의 약수이고 $2n$ 은 $${B}$ 의 약수` : `자연수가 되려면 $\\frac{${A}}{n}$ 이 정수: $n$ 은 $${A}$ 의 약수`,
                two ? `$n$ 은 $${A}$ 와 $${B / 2}$ 의 공약수` : `$${A}$ 의 약수 중 $2$ 이상 $${N}$ 이하`,
                `$n=${ns.join(', ')}$`,
                askSum ? `합: $${v}$` : `개수: $${v}$`,
              ],
            };
          },
        },
      ],
    },

    // ───────── 지수함수와 로그함수
    'alg-2': {
      skills: [
        {
          id: 'exp-substitution-maxmin',
          title: '치환으로 지수·로그함수의 최대·최소',
          gen(r, level) {
            const b = r.int(-5, 10);
            if (level === 1) {
              const a = r.int(1, 5);
              return {
                q: `함수 $y=4^{x}-${2 * a}\\times2^{x}${cst(b)}$ 의 최솟값을 구하세요.`,
                answer: ans(b - a * a),
                steps: [`$2^{x}=t$ $(t>0)$ 로 놓으면 $y=t^{2}-${2 * a}t${cst(b)}=(t-${a})^{2}${cst(b - a * a)}$`, `$t=${a}>0$ 일 때 최소 (이때 $x=${lg(2)}${a}$)`, `최솟값 $${b - a * a}$`],
              };
            }
            if (level === 2) {
              const q = r.int(1, 3);
              const a = r.int(1, 2 ** q);
              const lo = fr(1, 2),
                hi = fr(2 ** q);
              const g = (t: F) =>
                t
                  .sub(a)
                  .mul(t.sub(a))
                  .add(b - a * a);
              const M = g(lo).cmp(g(hi)) >= 0 ? g(lo) : g(hi);
              const m = fr(b - a * a);
              return {
                q: `$-1\\le x\\le ${q}$ 에서 함수 $y=4^{x}-${2 * a}\\times2^{x}${cst(b)}$ 의 최댓값을 $M$, 최솟값을 $m$ 이라 할 때, $M+m$ 의 값을 구하세요.`,
                answer: ans(M.add(m)),
                steps: [
                  `$2^{x}=t$ 로 놓으면 $\\frac{1}{2}\\le t\\le ${2 ** q}$, $y=(t-${a})^{2}${cst(b - a * a)}$`,
                  `$t=${a}$ 에서 최소: $m=${b - a * a}$`,
                  `양 끝: $t=\\frac{1}{2}$ → $${T(g(lo))}$, $t=${2 ** q}$ → $${T(g(hi))}$ 이므로 $M=${T(M)}$`,
                  `$M+m=${T(M.add(m))}$`,
                ],
              };
            }
            const p = r.int(1, 2),
              q = r.int(2, 4);
            const a = r.int(1, q);
            const g = (t: number) => (t - a) ** 2 + b - a * a;
            const M = Math.max(g(-p), g(q)),
              m = b - a * a;
            return {
              q: `$\\frac{1}{${2 ** p}}\\le x\\le ${2 ** q}$ 에서 함수 $y=(${lg(2)}x)^{2}+${lg('\\frac{1}{2}')}x^{${2 * a}}${cst(b)}$ 의 최댓값을 $M$, 최솟값을 $m$ 이라 할 때, $M+m$ 의 값을 구하세요.`,
              answer: ans(M + m),
              steps: [
                `$${lg('\\frac{1}{2}')}x^{${2 * a}}=-${2 * a}${lg(2)}x$`,
                `$${lg(2)}x=t$ 로 놓으면 $-${p}\\le t\\le ${q}$, $y=t^{2}-${2 * a}t${cst(b)}=(t-${a})^{2}${cst(b - a * a)}$`,
                `$t=${a}$ (즉 $x=${2 ** a}$) 에서 최소: $m=${m}$`,
                `양 끝: $t=-${p}$ → $${g(-p)}$, $t=${q}$ → $${g(q)}$ 이므로 $M=${M}$`,
                `$M+m=${M + m}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-exp-log-lattice',
          title: '지수·로그함수의 그래프 사이의 격자점',
          gen(r) {
            const base = r.chance(0.6) ? 2 : 3;
            const n = base === 2 ? r.int(4, 7) : r.int(3, 5);
            let tot = 0;
            const rows: string[] = [];
            for (let x = 2; x <= n - 1; x++) {
              let fl = 0;
              while (base ** (fl + 1) <= x) fl++;
              const c = base ** x - 1 - fl;
              tot += c;
              rows.push(`$x=${x}$: $${fl + 1}\\le y\\le ${base ** x - 1}$ → $${c}$ 개`);
            }
            return {
              q: `두 곡선 $y=${base}^{x}$, $y=${lg(base)}x$ 와 두 직선 $x=1$, $x=${n}$ ${[3, 6].includes(n) ? '으로' : '로'} 둘러싸인 부분의 내부에 있는 점 중에서 $x$ 좌표와 $y$ 좌표가 모두 정수인 점의 개수를 구하세요. (단, 경계 위의 점은 제외)`,
              answer: ans(tot),
              steps: [
                `$x\\ge1$ 에서 $${base}^{x}>x>${lg(base)}x$ 이므로 영역은 $${lg(base)}x<y<${base}^{x}$, $1<x<${n}$`,
                `${n === 3 ? '$x=2$ 에서' : n === 4 ? '$x=2, 3$ 각각에서' : `$x=2, \\cdots, ${n - 1}$ 각각에서`} 정수 $y$ 의 개수를 세요. ($y>${lg(base)}x$ ⇔ $${base}^{y}>x$)`,
                ...rows,
                `합: $${tot}$`,
              ],
            };
          },
        },
        {
          id: 'top-symmetric-intersect',
          title: '역함수 관계인 두 곡선과 직선 $y=-x+k$',
          gen(r) {
            const base = r.chance(0.5) ? 2 : 3;
            const t = base === 2 ? r.int(2, 4) : r.int(1, 3);
            const v = base ** t - t;
            const k = t + base ** t;
            return {
              q: `직선 $y=-x+k$ 가 곡선 $y=${base}^{x}$ 과 만나는 점을 $A$, 곡선 $y=${lg(base)}x$ 와 만나는 점을 $B$ 라 하자. 점 $A$ 의 $x$ 좌표가 양수이고 $\\overline{AB}=${v}\\sqrt{2}$ 일 때, 상수 $k$ 의 값을 구하세요.`,
              answer: ans(k),
              steps: [
                `$y=${base}^{x}$ 와 $y=${lg(base)}x$ 는 역함수 관계라 직선 $y=x$ 에 대칭이고, 직선 $y=-x+k$ 도 $y=x$ 에 대칭이에요.`,
                `따라서 $A(t, ${base}^{t})$ 이면 $B(${base}^{t}, t)$`,
                `$\\overline{AB}=\\sqrt{2}\\,(${base}^{t}-t)=${v}\\sqrt{2}$ → $${base}^{t}-t=${v}$`,
                `$t>0$ 에서 $${base}^{t}-t$ 는 ${base === 2 ? '$t\\ge1$ 에서 증가하고 $0<t<1$ 에서는 $1$ 보다 작으므로' : '증가하므로'} 근은 $t=${t}$ 하나`,
                `$A(${t}, ${base ** t})$ 가 직선 위: $k=${t}+${base ** t}=${k}$`,
              ],
            };
          },
        },
      ],
    },

    // ───────── 삼각함수
    'alg-3': {
      skills: [
        {
          id: 'trig-quad-equation',
          title: '이차식 꼴의 삼각방정식과 해의 합',
          gen(r, level) {
            const SOL: Record<string, [number, number][]> = {
              '1/1': [[1, 2]],
              '-1/1': [[3, 2]],
              '0/1': [
                [0, 1],
                [1, 1],
              ],
              '1/2': [
                [1, 6],
                [5, 6],
              ],
              '-1/2': [
                [7, 6],
                [11, 6],
              ],
            };
            const valid: [number, number][] = [
              [1, 1],
              [-1, 1],
              [0, 1],
              [1, 2],
              [-1, 2],
            ];
            const invalid: [number, number][] = [
              [2, 1],
              [-2, 1],
              [3, 1],
              [3, 2],
              [-3, 2],
            ];
            let r1: [number, number], r2: [number, number];
            if (level === 1) {
              r1 = r.pick(valid);
              r2 = r.pick(invalid);
            } else {
              // 심화(3)에서는 sin x 의 일차항이 0 이 되는 시시한 식(예: -cos²x=0)을 피한다
              do [r1, r2] = r.sample(valid, 2);
              while (level === 3 && r1[1] * r2[0] + r2[1] * r1[0] === 0);
            }
            const A = r1[1] * r2[1],
              B = -(r1[1] * r2[0] + r2[1] * r1[0]),
              C = r1[0] * r2[0];
            const g = gcd(gcd(Math.abs(A), Math.abs(B)), Math.abs(C)) || 1;
            const [a, bb, c] = [A / g, B / g, C / g];
            const key = (x: [number, number]) => `${x[0]}/${x[1]}`;
            const sols = [r1, r2].flatMap((x) => SOL[key(x)] ?? []);
            const sum = sols.reduce((s, [n, d]) => s.add(fr(n, d)), fr(0));
            const eq = level === 3 ? `${tt([-a, '\\cos^{2}x'], [bb, '\\sin x'], [a + c, ''])}=0` : `${tt([a, '\\sin^{2}x'], [bb, '\\sin x'], [c, ''])}=0`;
            const piTex = (f: F) => (f.n === 0 ? '0' : f.eq(1) ? '\\pi' : f.d === 1 ? `${f.n}\\pi` : `\\frac{${f.n === 1 ? '' : f.n}\\pi}{${f.d}}`);
            const solTex = sols.map(([n, d]) => piTex(fr(n, d))).join(', ');
            return {
              q: `$0\\le x<2\\pi$ 일 때, 방정식 $${eq}$ 의 모든 해의 합이 $k\\pi$ 이다. $k$ 의 값을 구하세요.`,
              answer: ans(sum),
              steps: [
                ...(level === 3 ? [`$\\cos^{2}x=1-\\sin^{2}x$ 를 넣으면 $${tt([a, '\\sin^{2}x'], [bb, '\\sin x'], [c, ''])}=0$`] : []),
                `$\\sin x=t$ $(-1\\le t\\le1)$: $${tt([a, 't^{2}'], [bb, 't'], [c, ''])}=0$ → $t=${T(fr(...r1))}$ 또는 $t=${T(fr(...r2))}$`,
                ...[r1, r2].map((x) => (SOL[key(x)] ? `$\\sin x=${T(fr(...x))}$: $x=${SOL[key(x)].map(([n, d]) => piTex(fr(n, d))).join(', ')}$` : `$\\sin x=${T(fr(...x))}$ 인 $x$ 는 없어요 ($-1\\le\\sin x\\le1$)`)),
                `해: $${solTex}$ → 합 $${piTex(sum)}$`,
                `$k=${T(sum)}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-trig-abs-roots',
          title: '절댓값이 있는 삼각방정식의 실근의 개수',
          gen(r) {
            for (;;) {
              const p = r.int(2, 4),
                q = r.int(-4, 4),
                rr = r.int(1, 5),
                n = r.int(2, 4);
              const fn = r.chance(0.5) ? '\\sin' : '\\cos';
              const vals = [fr(rr - q, p), fr(-rr - q, p)];
              const cnt = (s: F) => (Math.abs(s.value) > 1 ? 0 : Math.abs(s.value) === 1 ? n : 2 * n);
              const tot = cnt(vals[0]) + cnt(vals[1]);
              if (tot === 0 || (cnt(vals[0]) > 0 && cnt(vals[1]) > 0 && r.chance(0.2))) continue;
              const desc = (s: F) => {
                const c = cnt(s);
                if (c === 0) return `$${fn} ${n}x=${T(s)}$: 범위 밖이라 해 없음`;
                if (c === n) return `$${fn} ${n}x=${T(s)}$: 한 주기에 1번씩 → $${n}$ 개`;
                return `$${fn} ${n}x=${T(s)}$: 한 주기에 2번씩 → $${2 * n}$ 개`;
              };
              return {
                q: `$0\\le x<2\\pi$ 일 때, 방정식 $|${p}${fn} ${n}x${cst(q)}|=${rr}$ 의 서로 다른 실근의 개수를 구하세요.`,
                answer: ans(tot),
                steps: [
                  `$${p}${fn} ${n}x${cst(q)}=${rr}$ 또는 $${p}${fn} ${n}x${cst(q)}=-${rr}$`,
                  `$${fn} ${n}x=${T(vals[0])}$ 또는 $${fn} ${n}x=${T(vals[1])}$`,
                  `$y=${fn} ${n}x$ 의 주기는 $${n === 2 ? '\\pi' : n === 4 ? '\\frac{\\pi}{2}' : `\\frac{2\\pi}{${n}}`}$ 이므로 $0\\le x<2\\pi$ 에 $${n}$ 주기가 들어가요.`,
                  desc(vals[0]),
                  desc(vals[1]),
                  `두 방정식의 해는 겹치지 않으므로 모두 $${tot}$ 개`,
                ],
              };
            }
          },
        },
        {
          id: 'top-trig-maxmin-param',
          title: '최댓값과 최솟값의 차로 미정계수 정하기',
          gen(r) {
            const a = r.pick([fr(1, 3), fr(2, 3), fr(1), fr(2), fr(3)]);
            const m = r.int(-6, 6);
            const b = a.mul(2).add(m);
            const big = a.cmp(1) >= 0;
            const D = big ? a.mul(4) : a.add(1).mul(a.add(1));
            const v = a.add(b);
            return {
              q: `양수 $a$ 와 상수 $b$ 에 대하여 함수 $f(x)=\\sin^{2}x+2a\\cos x+b$ 의 최댓값과 최솟값의 차가 $${T(D)}$ 이고 최솟값이 $${m}$ 일 때, $a+b$ 의 값을 구하세요.`,
              answer: ans(v),
              steps: [
                `$\\cos x=t$ $(-1\\le t\\le1)$ 로 놓으면 $f=-t^{2}+2at+b+1=-(t-a)^{2}+a^{2}+b+1$`,
                `$a>0$ 이므로 최솟값은 꼭짓점에서 먼 $t=-1$: $b-2a$`,
                `(i) $a\\ge1$: 최댓값은 $t=1$ 에서 $2a+b$ → 차 $4a\\ge4$`,
                `(ii) $0<a<1$: 최댓값은 $t=a$ 에서 $a^{2}+b+1$ → 차 $(a+1)^{2}<4$`,
                big ? `차가 $${T(D)}\\ge4$ 이므로 (i): $4a=${T(D)}$, $a=${T(a)}$` : `차가 $${T(D)}<4$ 이므로 (ii): $(a+1)^{2}=${T(D)}$, $a=${T(a)}$`,
                `최솟값 $b-2a=${m}$ → $b=${T(b)}$`,
                `$a+b=${T(v)}$`,
              ],
            };
          },
        },
      ],
    },

    // ───────── 사인법칙과 코사인법칙
    'alg-4': {
      skills: [
        {
          id: 'inradius-circumradius',
          title: '세 변으로 내접원·외접원의 반지름',
          gen(r, level) {
            if (level === 1) {
              const [a, b, c] = r.pick([
                [3, 4, 5],
                [5, 12, 13],
                [8, 15, 17],
                [7, 24, 25],
                [20, 21, 29],
              ] as [number, number, number][]);
              const k = r.int(1, 3);
              const [A, B, C] = [a * k, b * k, c * k];
              const S = (A * B) / 2,
                s = (A + B + C) / 2;
              return {
                q: `세 변의 길이가 $${A}$, $${B}$, $${C}$ 인 삼각형의 내접원의 반지름의 길이를 구하세요.`,
                answer: ans(fr(S, s)),
                steps: [`$${A}^{2}+${B}^{2}=${C}^{2}$ 이므로 직각삼각형, 넓이 $S=\\frac{1}{2}\\times${A}\\times${B}=${S}$`, `$S=\\frac{1}{2}r(a+b+c)$ → $${S}=\\frac{1}{2}r\\times${A + B + C}$`, `$r=${T(fr(S, s))}$`],
              };
            }
            const pool = level === 2 ? HERON.filter((h) => h[0] === h[1] || h[1] === h[2]) : HERON;
            const [a0, b0, c0, S0] = r.pick(pool);
            const k = level === 2 ? r.int(1, 2) : r.int(1, 3);
            const [a, b, c] = r.shuffle([a0 * k, b0 * k, c0 * k]);
            const S = S0 * k * k;
            const cosC = fr(a * a + b * b - c * c, 2 * a * b);
            const sinC = fr(2 * S, a * b);
            const common = [
              `코사인법칙: $\\cos C=\\frac{${a}^{2}+${b}^{2}-${c}^{2}}{2\\times${a}\\times${b}}=${T(cosC)}$`,
              `$\\sin C=\\sqrt{1-\\left(${T(cosC)}\\right)^{2}}=${T(sinC)}$`,
              `넓이 $S=\\frac{1}{2}\\times${a}\\times${b}\\times${T(sinC)}=${S}$`,
            ];
            if (level === 2) {
              const rr = fr(2 * S, a + b + c);
              return {
                q: `삼각형 $ABC$ 에서 $a=${a}$, $b=${b}$, $c=${c}$ 일 때, 내접원의 반지름의 길이를 구하세요.`,
                answer: ans(rr),
                steps: [...common, `$S=\\frac{1}{2}r(a+b+c)$ → $r=\\frac{2\\times${S}}{${a + b + c}}=${T(rr)}$`],
              };
            }
            const R = fr(c, 1).div(sinC.mul(2));
            return {
              q: `삼각형 $ABC$ 에서 $a=${a}$, $b=${b}$, $c=${c}$ 일 때, 외접원의 반지름의 길이 $R$ 를 구하세요.`,
              answer: ans(R),
              steps: [...common.slice(0, 2), `사인법칙: $\\frac{c}{\\sin C}=2R$ → $R=\\frac{${c}}{2\\times${T(sinC)}}=${T(R)}$`],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-cyclic-quad',
          title: '원에 내접하는 사각형의 대각선과 넓이',
          gen(r) {
            const [a, d, b, c, A] = r.pick(CYCLIC);
            const bd2 = A === 120 ? a * a + a * d + d * d : a * a - a * d + d * d;
            const k = fr(a * d + b * c, 4);
            const cosA = A === 120 ? fr(-1, 2) : fr(1, 2);
            return {
              q: `원에 내접하는 사각형 $ABCD$ 에서 $\\overline{AB}=${a}$, $\\overline{BC}=${b}$, $\\overline{CD}=${c}$, $\\overline{DA}=${d}$ 이다. $\\overline{BD}^{2}$ 의 값과 사각형 $ABCD$ 의 넓이 $k\\sqrt{3}$ 의 $k$ 의 값을 구하세요.`,
              answer: fld(['BD²', bd2], ['k', k]),
              steps: [
                `원에 내접하므로 $A+C=180^{\\circ}$, $\\cos C=-\\cos A$`,
                `$\\triangle ABD$: $\\overline{BD}^{2}=${a}^{2}+${d}^{2}-2\\times${a}\\times${d}\\cos A=${a * a + d * d}-${2 * a * d}\\cos A$`,
                `$\\triangle CBD$: $\\overline{BD}^{2}=${b}^{2}+${c}^{2}+2\\times${b}\\times${c}\\cos A=${b * b + c * c}+${2 * b * c}\\cos A$`,
                `두 식을 같게 놓으면 $${2 * a * d + 2 * b * c}\\cos A=${a * a + d * d - b * b - c * c}$ → $\\cos A=${T(cosA)}$, $A=${A}^{\\circ}$`,
                `$\\overline{BD}^{2}=${a * a + d * d}${cst(A === 120 ? a * d : -a * d)}=${bd2}$`,
                `넓이 $=\\frac{1}{2}\\times${a}\\times${d}\\sin A+\\frac{1}{2}\\times${b}\\times${c}\\sin C=\\frac{\\sqrt{3}}{4}(${a * d}+${b * c})$ → $k=${T(k)}$`,
              ],
            };
          },
        },
        {
          id: 'top-sine-ratio',
          title: '사인의 비와 넓이로 외접원 구하기',
          gen(r) {
            const [p, q, t, ang] = r.pick([
              [3, 5, 7, 120],
              [7, 8, 13, 120],
              [5, 16, 19, 120],
              [3, 8, 7, 60],
              [5, 8, 7, 60],
              [8, 15, 13, 60],
              [7, 15, 13, 60],
            ] as [number, number, number, number][]);
            const k = r.pick([3, 6]);
            const names = r.shuffle(['A', 'B', 'C']);
            const ratio: Record<string, number> = {
              [names[0]]: p,
              [names[1]]: q,
              [names[2]]: t,
            };
            const areaF = fr(p * q * k * k, 4);
            const areaTex = areaF.d === 1 ? `${areaF.n}\\sqrt{3}` : `\\frac{${areaF.n}\\sqrt{3}}{${areaF.d}}`;
            const R2 = (t * t * k * k) / 3;
            const lo = (x: string) => x.toLowerCase();
            return {
              q: `삼각형 $ABC$ 에서 $\\sin A:\\sin B:\\sin C=${ratio.A}:${ratio.B}:${ratio.C}$ 이고 넓이가 $${areaTex}$ 일 때, 외접원의 반지름의 길이를 $R$ 라 하자. $R^{2}$ 의 값을 구하세요.`,
              answer: ans(R2),
              steps: [
                `사인법칙: $a:b:c=\\sin A:\\sin B:\\sin C$ 이므로 $${lo(names[0])}=${p}k$, $${lo(names[1])}=${q}k$, $${lo(names[2])}=${t}k$ $(k>0)$`,
                `$\\cos ${names[2]}=\\frac{${p * p}+${q * q}-${t * t}}{2\\times${p}\\times${q}}=${ang === 120 ? '-\\frac{1}{2}' : '\\frac{1}{2}'}$ → $${names[2]}=${ang}^{\\circ}$`,
                `넓이 $=\\frac{1}{2}\\times${p}k\\times${q}k\\times\\frac{\\sqrt{3}}{2}=\\frac{${p * q}\\sqrt{3}}{4}k^{2}=${areaTex}$ → $k^{2}=${k * k}$, $k=${k}$`,
                `$${lo(names[2])}=${t * k}$, $\\frac{${t * k}}{\\sin ${ang}^{\\circ}}=2R$ → $R=\\frac{${t * k}}{\\sqrt{3}}$`,
                `$R^{2}=\\frac{${t * t * k * k}}{3}=${R2}$`,
              ],
            };
          },
        },
      ],
    },

    // ───────── 등차수열과 등비수열
    'alg-5': {
      skills: [
        {
          id: 'arith-max-sum',
          title: '등차수열의 합의 최댓값과 절댓값의 합',
          gen(r, level) {
            const D = r.int(2, 5);
            const j = r.int(3, 8),
              e = r.int(0, D - 1);
            const a1 = D * j + e;
            const term = (n: number) => a1 - (n - 1) * D;
            let pos = 0;
            while (term(pos + 1) > 0) pos++;
            let S = 0;
            for (let n = 1; n <= pos; n++) S += term(n);
            const zeroNote = term(pos + 1) === 0 ? ` ($a_{${pos + 1}}=0$ 이라 $S_{${pos}}=S_{${pos + 1}}$)` : '';
            const core = [
              `$a_n=${a1}-${D}(n-1)=${poly([-D, a1 + D], 'n')}$`,
              `$a_n>0$ ⇔ $n<${T(fr(a1 + D, D))}$ → 제$${pos}$항까지 양수`,
              `양수인 항까지 더할 때 최대: $S_{${pos}}=\\frac{${pos}(${a1}+${term(pos)})}{2}=${S}$${zeroNote}`,
            ];
            if (level === 1) {
              return {
                q: `첫째항이 $${a1}$, 공차가 $${-D}$ 인 등차수열의 첫째항부터 제$n$항까지의 합 $S_n$ 의 최댓값을 구하세요.`,
                answer: ans(S),
                steps: core,
              };
            }
            const p = r.int(2, 4),
              q = r.int(p + 2, p + 6);
            const given = `$a_{${p}}=${term(p)}$, $a_{${q}}=${term(q)}$`;
            const find = [`$a_{${q}}-a_{${p}}=${q - p}d=${term(q) - term(p)}$ → $d=${-D}$, $a_1=${term(p)}-${p - 1}\\times${pr(-D)}=${a1}$`];
            if (level === 2) {
              return {
                q: `등차수열 $\\{a_n\\}$ 에서 ${given} 일 때, 첫째항부터 제$n$항까지의 합 $S_n$ 의 최댓값을 구하세요.`,
                answer: ans(S),
                steps: [...find, ...core],
              };
            }
            const N = r.int(pos + 3, pos + 10);
            let neg = 0;
            for (let n = pos + 1; n <= N; n++) neg += term(n);
            const tot = S - neg;
            return {
              q: `등차수열 $\\{a_n\\}$ 에서 ${given} 일 때, $|a_1|+|a_2|+|a_3|+\\cdots+|a_{${N}}|$ 의 값을 구하세요.`,
              answer: ans(tot),
              steps: [
                ...find,
                core[0],
                core[1],
                `제$${pos}$항까지의 합 $${S}$, 제$${pos + 1}$항부터 제$${N}$항까지의 합 $\\frac{${N - pos}(${term(pos + 1)}${cst(term(N))})}{2}=${neg}$`,
                `절댓값의 합 $=${S}-(${neg})=${tot}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-arith-abs-equal',
          title: '$|a_p|=|a_q|$ 인 등차수열',
          gen(r) {
            const p = r.int(2, 6),
              q = r.int(p + 1, p + 7);
            const odd = (p + q) % 2 === 1;
            const d = odd ? 2 * r.int(1, 3) : r.int(1, 4);
            const c = fr(p + q, 2);
            const M = r.int(q, q + 5);
            let W = fr(0);
            for (let k = 1; k <= M; k++) {
              const v = fr(k).sub(c);
              W = W.add(v.n < 0 ? v.neg() : v);
            }
            const Tsum = W.mul(d);
            let rr = r.int(1, 20);
            while (rr === p || rr === q) rr++;
            const ar = c.neg().add(rr).mul(d);
            const a1 = fr(-(p + q - 2) * d, 2);
            return {
              q: `공차가 양수인 등차수열 $\\{a_n\\}$ 이 $|a_{${p}}|=|a_{${q}}|$, $\\sum_{k=1}^{${M}}|a_k|=${T(Tsum)}$ 을 만족시킬 때, $a_{${rr}}$ 의 값을 구하세요.`,
              answer: ans(ar),
              steps: [
                `공차가 $0$ 이 아니므로 $a_{${p}}\\ne a_{${q}}$, 따라서 $a_{${p}}=-a_{${q}}$`,
                `$a_{${p}}+a_{${q}}=2a_1+${p + q - 2}d=0$ → $a_1=-${T(fr(p + q - 2, 2))}d$, $a_n=d\\left(n-${T(c)}\\right)$`,
                `$\\sum_{k=1}^{${M}}|a_k|=d\\sum_{k=1}^{${M}}\\left|k-${T(c)}\\right|=${T(W)}d$`,
                `$${T(W)}d=${T(Tsum)}$ → $d=${d}$ (이때 $a_1=${T(a1)}$)`,
                `$a_{${rr}}=${d}\\left(${rr}-${T(c)}\\right)=${T(ar)}$`,
              ],
            };
          },
        },
        {
          id: 'top-geo-sum-ratio',
          title: '합의 비로 공비를 찾는 등비수열',
          gen(r) {
            const m = r.chance(0.5) ? 2 : 3;
            const rr = r.pick([2, 3, -2, -3]);
            const K = 1 + rr ** m;
            const a1 = r.nonzero(-4, 4);
            const V = a1 * (1 + rr);
            const ask = r.int(4, 5);
            const v = a1 * rr ** (ask - 1);
            const signNote = m === 2 ? (rr > 0 ? '공비가 양수인 ' : '공비가 음수인 ') : '';
            return {
              q: `${signNote}등비수열 $\\{a_n\\}$ 의 첫째항부터 제$n$항까지의 합을 $S_n$ 이라 하자. $S_{${2 * m}}=${K}S_{${m}}$, $a_1+a_2=${V}$ 일 때, $a_{${ask}}$ 의 값을 구하세요. (단, $S_{${m}}\\ne0$)`,
              answer: ans(v),
              steps: [
                `$S_{${2 * m}}=S_{${m}}+(a_{${m + 1}}+\\cdots+a_{${2 * m}})=S_{${m}}+r^{${m}}S_{${m}}=(1+r^{${m}})S_{${m}}$`,
                `$S_{${m}}\\ne0$ 이므로 $1+r^{${m}}=${K}$, $r^{${m}}=${rr ** m}$`,
                m === 2 ? `$r=\\pm${Math.abs(rr)}$ 중 조건에 맞는 $r=${rr}$` : `$r$ 는 실수이므로 $r=${rr}$`,
                `$a_1+a_2=a_1(1+r)=${1 + rr}a_1=${V}$ → $a_1=${a1}$`,
                `$a_{${ask}}=${a1}\\times${pr(rr)}^{${ask - 1}}=${v}$`,
              ],
            };
          },
        },
      ],
    },

    // ───────── 수열의 합
    'alg-6': {
      skills: [
        {
          id: 'group-seq',
          title: '군으로 묶어 푸는 수열',
          gen(r, level) {
            const desc = r.chance(0.5);
            const seqTex = desc ? '1, 2, 1, 3, 2, 1, 4, 3, 2, 1, 5, \\cdots' : '1, 1, 2, 1, 2, 3, 1, 2, 3, 4, 1, \\cdots';
            const N = level === 1 ? r.int(12, 30) : r.int(40, 120);
            let g = 0;
            while (((g + 1) * (g + 2)) / 2 < N) g++;
            // N 번째 항은 g+1 군의 (N - g(g+1)/2) 번째
            const pos = N - (g * (g + 1)) / 2;
            const grp = g + 1;
            const val = desc ? grp - pos + 1 : pos;
            const head = [
              `${desc ? '$(1), (2, 1), (3, 2, 1), \\cdots$' : '$(1), (1, 2), (1, 2, 3), \\cdots$'} 처럼 묶으면 제$k$군은 $k$ 개의 항`,
              `제$${g}$군까지의 항의 수 $\\frac{${g}\\times${g + 1}}{2}=${(g * (g + 1)) / 2}$ 이므로 제$${N}$항은 제$${grp}$군의 $${pos}$ 번째 항`,
            ];
            if (level <= 2) {
              return {
                q: `수열 $${seqTex}$ 의 제$${N}$항을 구하세요.`,
                answer: ans(val),
                steps: [...head, `제$${grp}$군: ${desc ? `$${grp}, ${grp - 1}, \\cdots$` : `$1, 2, \\cdots, ${grp}$`} → $${pos}$ 번째 항은 $${val}$`],
              };
            }
            const full = (g * (g + 1) * (g + 2)) / 6;
            let part = 0;
            for (let i = 1; i <= pos; i++) part += desc ? grp - i + 1 : i;
            return {
              q: `수열 $${seqTex}$ 의 첫째항부터 제$${N}$항까지의 합을 구하세요.`,
              answer: ans(full + part),
              steps: [
                ...head,
                `제$k$군의 합은 $\\frac{k(k+1)}{2}$ → 제$${g}$군까지: $\\sum_{k=1}^{${g}}\\frac{k(k+1)}{2}=\\frac{${g}\\times${g + 1}\\times${g + 2}}{6}=${full}$`,
                `제$${grp}$군의 앞 $${pos}$ 개 항의 합: $${part}$`,
                `합: $${full}+${part}=${full + part}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-log-telescope-count',
          title: '로그의 합이 자연수가 되는 항의 번호',
          gen(r) {
            const odd = r.chance(0.5);
            const b = odd ? r.pick([3, 5]) : r.pick([2, 3]);
            const N = r.int(30, 400);
            const ms: number[] = [];
            for (let j = 1; ; j++) {
              const m = odd ? (b ** j - 1) / 2 : b ** j - 1;
              if (m > N) break;
              ms.push(m);
            }
            const sum = ms.reduce((s, x) => s + x, 0);
            const term = odd ? `${lg(b)}\\frac{2k+1}{2k-1}` : `${lg(b)}\\frac{k+1}{k}`;
            return {
              q: `$${N}$ 이하의 자연수 $m$ 에 대하여 $\\sum_{k=1}^{m}${term}$ 의 값이 자연수가 되도록 하는 모든 $m$ 의 값의 합을 구하세요.`,
              answer: ans(sum),
              steps: [
                `로그의 합은 곱의 로그: $\\sum_{k=1}^{m}${term}=${lg(b)}\\left(${odd ? '\\frac{3}{1}\\times\\frac{5}{3}\\times\\cdots\\times\\frac{2m+1}{2m-1}' : '\\frac{2}{1}\\times\\frac{3}{2}\\times\\cdots\\times\\frac{m+1}{m}'}\\right)$`,
                `약분되어 $${lg(b)}(${odd ? '2m+1' : 'm+1'})$`,
                `자연수 $j$ 가 되려면 $${odd ? '2m+1' : 'm+1'}=${b}^{j}$ → $m=${odd ? `\\frac{${b}^{j}-1}{2}` : `${b}^{j}-1`}$`,
                `$m\\le${N}$: $m=${ms.join(', ')}$`,
                `합: $${sum}$`,
              ],
            };
          },
        },
        {
          id: 'top-sum-to-term-telescope',
          title: '합으로 주어진 수열과 부분분수',
          gen(r) {
            const c = r.chance(0.6) ? 1 : 2;
            const p = r.int(0, 5);
            const a1 = c + p,
              dd = 2 * c;
            const m = r.int(5, 30);
            const am1 = a1 + m * dd;
            const val = fr(m, a1 * am1);
            return {
              q: `수열 $\\{a_n\\}$ 의 첫째항부터 제$n$항까지의 합이 $S_n=${poly([c, p, 0], 'n')}$ 이다. $\\sum_{k=1}^{m}\\frac{1}{a_ka_{k+1}}=${T(val)}$ 을 만족시키는 자연수 $m$ 의 값을 구하세요.`,
              answer: ans(m),
              steps: [
                `$n\\ge2$ 일 때 $a_n=S_n-S_{n-1}=${poly([dd, p - c], 'n')}$, $a_1=S_1=${a1}$ 도 이 식에 맞아요.`,
                `공차 $${dd}$ 인 등차수열이므로 $\\frac{1}{a_ka_{k+1}}=\\frac{1}{${dd}}\\left(\\frac{1}{a_k}-\\frac{1}{a_{k+1}}\\right)$`,
                `$\\sum_{k=1}^{m}\\frac{1}{a_ka_{k+1}}=\\frac{1}{${dd}}\\left(\\frac{1}{${a1}}-\\frac{1}{${poly([dd, a1], 'm')}}\\right)=\\frac{m}{${a1 === 1 ? poly([dd, a1], 'm') : `${a1}(${poly([dd, a1], 'm')})`}}$`,
                `$\\frac{m}{${a1 === 1 ? poly([dd, a1], 'm') : `${a1}(${poly([dd, a1], 'm')})`}}=${T(val)}$ 을 풀면 (좌변은 $m$ 에 대해 증가) $m=${m}$`,
                `확인: $\\frac{${m}}{${a1 === 1 ? am1 : `${a1}\\times${am1}`}}=${T(val)}$`,
              ],
            };
          },
        },
      ],
    },

    // ───────── 수학적 귀납법
    'alg-7': {
      skills: [
        {
          id: 'recursive-parity',
          title: '홀짝에 따라 정의된 수열',
          gen(r, level) {
            const p = r.pick([1, 3, 5]);
            const a1 = r.int(level === 1 ? 5 : 10, level === 1 ? 30 : 60);
            const rule = `a_{n+1}=\\begin{cases}\\frac{a_n}{2} & (a_n\\text{ 이 짝수})\\\\ a_n+${p} & (a_n\\text{ 이 홀수})\\end{cases}`;
            const seq = [a1];
            for (let i = 0; i < 200; i++) seq.push(nextPar(seq[seq.length - 1], p));
            if (level === 1) {
              const K = r.int(4, 6);
              return {
                q: `수열 $\\{a_n\\}$ 이 $a_1=${a1}$ 이고 모든 자연수 $n$ 에 대하여 $$${rule}$$ 을 만족시킬 때, $a_{${K}}$ 의 값을 구하세요.`,
                answer: ans(seq[K - 1]),
                steps: [
                  `차례로 구하면 $${seq
                    .slice(0, K)
                    .map((v, i) => `a_{${i + 1}}=${v}`)
                    .join(', ')}$`,
                ],
              };
            }
            // 주기 찾기
            let s = 0,
              L = 0;
            outer: for (let i = 0; i < seq.length; i++)
              for (let j = i + 1; j < seq.length; j++)
                if (seq[j] === seq[i]) {
                  s = i;
                  L = j - i;
                  break outer;
                }
            const shown = seq.slice(0, s + L + 1);
            const N = r.int(30, 80);
            const list = `$${shown.map((v, i) => `a_{${i + 1}}=${v}`).join(', ')}$`;
            if (level === 2) {
              const idx = N - 1 < s ? N - 1 : s + ((N - 1 - s) % L);
              return {
                q: `수열 $\\{a_n\\}$ 이 $a_1=${a1}$ 이고 모든 자연수 $n$ 에 대하여 $$${rule}$$ 을 만족시킬 때, $a_{${N}}$ 의 값을 구하세요.`,
                answer: ans(seq[idx]),
                steps: [
                  list,
                  `$a_{${s + 1}}$ 부터 $${L}$ 개 항이 반복돼요: $${seq.slice(s, s + L).join(', ')}$`,
                  `$${N}-${s}=${N - s}=${L}\\times${Math.floor((N - s - 1) / L)}+${((N - s - 1) % L) + 1}$ → 반복 묶음의 $${((N - s - 1) % L) + 1}$ 번째`,
                  `$a_{${N}}=${seq[idx]}$`,
                ],
              };
            }
            let sum = 0;
            for (let i = 0; i < N; i++) sum += seq[i];
            const pre = seq.slice(0, s).reduce((x, y) => x + y, 0);
            const cyc = seq.slice(s, s + L).reduce((x, y) => x + y, 0);
            const full = Math.floor((N - s) / L),
              rem = (N - s) % L;
            const remSum = seq.slice(s, s + rem).reduce((x, y) => x + y, 0);
            return {
              q: `수열 $\\{a_n\\}$ 이 $a_1=${a1}$ 이고 모든 자연수 $n$ 에 대하여 $$${rule}$$ 을 만족시킬 때, $\\sum_{k=1}^{${N}}a_k$ 의 값을 구하세요.`,
              answer: ans(sum),
              steps: [
                list,
                `$a_{${s + 1}}$ 부터 $${seq.slice(s, s + L).join(', ')}$ 이 반복 (한 묶음의 합 $${cyc}$)`,
                `앞의 $${s}$ 개 항의 합 $${pre}$, 남은 $${N - s}$ 개 항은 $${L}$ 개씩 $${full}$ 묶음${rem ? ` + $${rem}$ 개 (합 $${remSum}$)` : ''}`,
                `$${pre}+${cyc}\\times${full}${rem ? `+${remSum}` : ''}=${sum}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-recursive-backward',
          title: '거꾸로 추적하는 귀납적 수열',
          gen(r) {
            const p = r.pick([1, 3, 5]);
            const K = r.int(4, 6);
            const v = r.int(1, 8);
            const rule = `a_{n+1}=\\begin{cases}\\frac{a_n}{2} & (a_n\\text{ 이 짝수})\\\\ a_n+${p} & (a_n\\text{ 이 홀수})\\end{cases}`;
            let cur = [v];
            const levels: string[] = [];
            for (let k = K - 1; k >= 1; k--) {
              const nx = new Set<number>();
              for (const x of cur) {
                nx.add(2 * x);
                if (x - p >= 1 && (x - p) % 2 === 1) nx.add(x - p);
              }
              cur = [...nx].sort((a, b) => a - b);
              levels.push(`$a_{${k}}$: $${cur.join(', ')}$`);
            }
            const sum = cur.reduce((a, b) => a + b, 0);
            return {
              q: `모든 항이 자연수인 수열 $\\{a_n\\}$ 이 모든 자연수 $n$ 에 대하여 $$${rule}$$ 을 만족시킨다. $a_{${K}}=${v}$ 가 되도록 하는 모든 $a_1$ 의 값의 합을 구하세요.`,
              answer: ans(sum),
              steps: [`$a_{n+1}=x$ 가 되는 $a_n$: 짝수 $2x$ 는 항상 가능, 홀수 $x-${p}$ 는 $x-${p}$ 가 양의 홀수일 때만 가능`, `$a_{${K}}=${v}$ 에서 거꾸로 한 단계씩 구해요.`, ...levels, `합: $${sum}$`],
            };
          },
        },
        {
          id: 'top-recursive-pair-sum',
          title: '이웃한 두 항의 합이 주어진 수열',
          gen(r) {
            const al = r.nonzero(-3, 4),
              be = r.int(-5, 5);
            const s = r.int(-5, 8);
            const f = poly([al, be], 'n');
            if (r.chance(0.5)) {
              const m = r.int(5, 15);
              const sum = s + al * m * (m + 1) + be * m;
              return {
                q: `수열 $\\{a_n\\}$ 이 $a_1=${s}$ 이고 모든 자연수 $n$ 에 대하여 $a_n+a_{n+1}=${f}$ 를 만족시킬 때, $\\sum_{k=1}^{${2 * m + 1}}a_k$ 의 값을 구하세요.`,
                answer: ans(sum),
                steps: [
                  `$a_1$ 을 따로 두고 $(a_2+a_3)+(a_4+a_5)+\\cdots+(a_{${2 * m}}+a_{${2 * m + 1}})$ 로 묶어요.`,
                  `$a_{2j}+a_{2j+1}=${al}\\times2j${cst(be)}=${poly([2 * al, be], 'j')}$`,
                  `$\\sum_{j=1}^{${m}}(${poly([2 * al, be], 'j')})=${2 * al}\\times\\frac{${m}\\times${m + 1}}{2}${cst(be * m)}=${al * m * (m + 1) + be * m}$`,
                  `합: $${s}+${pr(al * m * (m + 1) + be * m)}=${sum}$`,
                ],
              };
            }
            const N = r.int(20, 40);
            const a = [s];
            for (let n = 1; n < N; n++) a.push(al * n + be - a[n - 1]);
            const odd = N % 2 === 1;
            const j = odd ? (N - 1) / 2 : N / 2;
            const a2 = al + be - s;
            return {
              q: `수열 $\\{a_n\\}$ 이 $a_1=${s}$ 이고 모든 자연수 $n$ 에 대하여 $a_n+a_{n+1}=${f}$ 를 만족시킬 때, $a_{${N}}$ 의 값을 구하세요.`,
              answer: ans(a[N - 1]),
              steps: [
                `$a_{n+1}+a_{n+2}=${poly([al, al + be], 'n')}$ 에서 앞의 식을 빼면 $a_{n+2}-a_n=${al}$`,
                `홀수 번째 항, 짝수 번째 항이 각각 공차 $${al}$ 인 등차수열`,
                `$a_2=${al + be}-a_1=${a2}$`,
                odd ? `$a_{${N}}=a_1+${j}\\times${pr(al)}=${a[N - 1]}$` : `$a_{${N}}=a_2+${j - 1}\\times${pr(al)}=${a[N - 1]}$`,
              ],
            };
          },
        },
      ],
    },
  },
  {
    'top-log-pairs': '로그의 값이 정수·유리수가 되는 조건을 거듭제곱 관계로 바꿔 밑마다 세기',
    'top-exp-log-lattice': '각 정수 $x$ 에서 두 곡선 사이에 들어가는 정수 $y$ 를 직접 세기',
    'top-recursive-pair-sum': '이웃한 두 항의 합 조건에서 $a_{n+2}-a_n$ 이 일정함을 이끌어 내거나 두 항씩 묶기',
  },
);
