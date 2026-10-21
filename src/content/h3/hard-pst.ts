// 확률과 통계 심화·최상위 유형 — pst.ts 의 각 단원 skills / top 뒤에 덧붙임
import { F } from '../../core/frac';
import { factorial, nCr, nPr } from '../../core/nt';
import { dec } from '../../core/tex';
import { Ctex, Htex, Ptex, ZTAB, ans, cst, dAns, fr, hasB, pr, T, zTable, type Hard, withJosa } from './hard-util';

/** 중복조합 nHr */
const H = (n: number, r: number) => (r < 0 ? 0 : r === 0 ? 1 : nCr(n + r - 1, r));
/** p/q (기약) → p+q */
const pq = (f: F) => f.n + f.d;
const pqStep = (f: F) => `$${T(f)}$ 이므로 $p+q=${f.d}+${f.n}=${pq(f)}$`;
/** 순열 생성 */
function perms(n: number): number[][] {
  const out: number[][] = [];
  const a = Array.from({ length: n }, (_, i) => i);
  const rec = (k: number) => {
    if (k === n) {
      out.push(a.slice());
      return;
    }
    for (let i = k; i < n; i++) {
      [a[k], a[i]] = [a[i], a[k]];
      rec(k + 1);
      [a[k], a[i]] = [a[i], a[k]];
    }
  };
  rec(0);
  return out;
}
const PERM_CACHE: Record<number, number[][]> = {};
const permsC = (n: number) => (PERM_CACHE[n] ??= perms(n));
/** 함수 X→Y 전부 (n 개 원소, 값 1..m) */
function allFuncs(n: number, m: number): number[][] {
  const out: number[][] = [];
  const cur: number[] = [];
  const rec = () => {
    if (cur.length === n) {
      out.push(cur.slice());
      return;
    }
    for (let v = 1; v <= m; v++) {
      cur.push(v);
      rec();
      cur.pop();
    }
  };
  rec();
  return out;
}
const zv = (k: string) => ZTAB[k];
const zk = (z: number) => z.toFixed(1);
/** P(Z ≤ z) (표의 z) */
const Phi = (z: number) => (z >= 0 ? 0.5 + zv(zk(z)) : 0.5 - zv(zk(-z)));
const rnd = (x: number) => Math.round(x * 1e8) / 1e8;

export const PST_HARD: Hard = withJosa(
  {
    // ───────── 여러 가지 순열과 조합
    'pst-1': {
      skills: [
        {
          id: 'eq-solutions-bounds',
          title: '조건이 있는 방정식의 해의 개수',
          gen(r, level) {
            if (level === 1) {
              const n = r.int(5, 12);
              return {
                q: `방정식 $x+y+z=${n}$ 을 만족시키는 음이 아닌 정수 $x$, $y$, $z$ 의 순서쌍 $(x, y, z)$ 의 개수를 구하세요.`,
                answer: ans(H(3, n)),
                steps: [`$x$, $y$, $z$ 세 문자에서 중복을 허락해 $${n}$ 개를 고르는 것과 같아요.`, `$${Htex(3, n)}=${Ctex(n + 2, n)}=${H(3, n)}$`],
              };
            }
            if (level === 2) {
              const a = r.int(1, 3),
                b = r.int(1, 3),
                c = r.int(0, 2);
              const n = a + b + c + r.int(3, 8);
              const m = n - a - b - c;
              return {
                q: `방정식 $x+y+z=${n}$ 을 만족시키는 정수 $x$, $y$, $z$ 중 $x\\ge${a}$, $y\\ge${b}$, $z\\ge${c}$ 인 순서쌍 $(x, y, z)$ 의 개수를 구하세요.`,
                answer: ans(H(3, m)),
                steps: [`$x=x'+${a}$, $y=y'+${b}$${c ? `, $z=z'+${c}$` : `, $z=z'$`} 로 놓으면 $x'+y'+z'=${m}$ ($x'$, $y'$, $z'\\ge0$)`, `$${Htex(3, m)}=${Ctex(m + 2, m)}=${H(3, m)}$`],
              };
            }
            const n = r.int(8, 14),
              u = r.int(2, 5),
              v = r.int(2, 5);
            let bf = 0;
            for (let x = 0; x <= u; x++) for (let y = 0; y <= v; y++) if (n - x - y >= 0) bf++;
            const t = H(3, n),
              A = H(3, n - u - 1),
              B = H(3, n - v - 1),
              AB = H(3, n - u - v - 2);
            if (t - A - B + AB !== bf) throw new Error('포함배제 불일치');
            return {
              q: `방정식 $x+y+z=${n}$ 을 만족시키는 음이 아닌 정수 $x$, $y$, $z$ 중 $x\\le${u}$, $y\\le${v}$ 인 순서쌍 $(x, y, z)$ 의 개수를 구하세요.`,
              answer: ans(bf),
              steps: [
                `전체: $${Htex(3, n)}=${t}$`,
                `$x\\ge${u + 1}$ 인 것: $x=x'+${u + 1}$ → $${Htex(3, n - u - 1)}=${A}$`,
                `$y\\ge${v + 1}$ 인 것: $${Htex(3, n - v - 1)}=${B}$`,
                `둘 다: ${n - u - v - 2 >= 0 ? `$${Htex(3, n - u - v - 2)}=${AB}$` : '불가능 ($0$ 개)'}`,
                `$${t}-${A}-${B}+${AB}=${bf}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-monotone-functions',
          title: '대소 조건이 있는 함수의 개수',
          gen(r) {
            const n = r.int(4, 5),
              m = r.int(5, 7);
            const kind = r.int(0, 2);
            const fs = allFuncs(n, m).filter((f) => f.every((v, i) => i === 0 || f[i - 1] <= v));
            const X = `X=\\{${Array.from({ length: n }, (_, i) => i + 1).join(', ')}\\}`,
              Y = `Y=\\{${Array.from({ length: m }, (_, i) => i + 1).join(', ')}\\}`;
            const mono = `f(1)\\le f(2)\\le\\cdots\\le f(${n})`;
            if (kind === 0) {
              const j = r.int(2, n - 1),
                v = r.int(2, m - 1);
              const cnt = fs.filter((f) => f[j - 1] === v).length;
              const left = H(v, j - 1),
                right = H(m - v + 1, n - j);
              if (left * right !== cnt) throw new Error('개수 불일치');
              return {
                q: `두 집합 $${X}$, $${Y}$ 에 대하여 함수 $f:X\\to Y$ 중에서 $${mono}$ 이고 $f(${j})=${v}$ 인 함수 $f$ 의 개수를 구하세요.`,
                answer: ans(cnt),
                steps: [
                  `$${j === 2 ? 'f(1)' : `f(1), \\cdots, f(${j - 1})`}$ 은 $1$ 이상 $${v}$ 이하에서 중복을 허락해 고른 뒤 크기순: $${Htex(v, j - 1)}=${left}$`,
                  `$${j + 1 === n ? `f(${n})` : `f(${j + 1}), \\cdots, f(${n})`}$ 은 $${v}$ 이상 $${m}$ 이하 ($${m - v + 1}$ 개)에서: $${Htex(m - v + 1, n - j)}=${right}$`,
                  `곱의 법칙: $${left}\\times${right}=${cnt}$`,
                ],
              };
            }
            if (kind === 1) {
              const d = r.int(1, 3);
              const cnt = fs.filter((f) => f[n - 1] - f[0] <= d).length;
              const parts: string[] = [];
              let s = 0;
              for (let e = 0; e <= d; e++) {
                const c = (m - e) * H(e + 1, n - 2);
                s += c;
                parts.push(`$e=${e}$: $${m - e}\\times${Htex(e + 1, n - 2)}=${c}$`);
              }
              if (s !== cnt) throw new Error('개수 불일치');
              return {
                q: `두 집합 $${X}$, $${Y}$ 에 대하여 함수 $f:X\\to Y$ 중에서 $${mono}$ 이고 $f(${n})-f(1)\\le${d}$ 인 함수 $f$ 의 개수를 구하세요.`,
                answer: ans(cnt),
                steps: [
                  `$f(${n})-f(1)=e$ 로 놓으면 $(f(1), f(${n}))$ 의 쌍은 $${m}-e$ 가지`,
                  `가운데 $${n - 2}$ 개는 $f(1)$ 이상 $f(${n})$ 이하 ($e+1$ 개)에서 중복을 허락해 크기순: $${Htex('e+1', n - 2)}$`,
                  ...parts,
                  `합: $${cnt}$`,
                ],
              };
            }
            const cnt = fs.filter((f) => f[1] !== f[2]).length;
            const all = H(m, n),
              same = H(m, n - 1);
            if (all - same !== cnt) throw new Error('개수 불일치');
            return {
              q: `두 집합 $${X}$, $${Y}$ 에 대하여 함수 $f:X\\to Y$ 중에서 $${mono}$ 이고 $f(2)\\ne f(3)$ 인 함수 $f$ 의 개수를 구하세요.`,
              answer: ans(cnt),
              steps: [
                `$${mono}$ 인 함수: $Y$ 에서 중복을 허락해 $${n}$ 개를 골라 크기순으로 → $${Htex(m, n)}=${all}$`,
                `그중 $f(2)=f(3)$ 인 것은 두 값을 하나로 보면 $${n - 1}$ 개를 고르는 것: $${Htex(m, n - 1)}=${same}$`,
                `$${all}-${same}=${cnt}$`,
              ],
            };
          },
        },
        {
          id: 'top-circular-condition',
          title: '조건이 있는 원순열',
          gen(r) {
            const kind = r.int(0, 2);
            const count = (n: number, ok: (seat: number[]) => boolean) => {
              let c = 0;
              for (const p of permsC(n - 1)) {
                const seat = [0, ...p.map((x) => x + 1)];
                if (ok(seat)) c++;
              }
              return c;
            };
            if (kind === 0) {
              const w = r.int(2, 3),
                m = r.int(w, 5);
              const n = m + w;
              const isG = (x: number) => x >= m;
              const c = count(n, (s) => s.every((x, i) => !(isG(x) && isG(s[(i + 1) % n]))));
              const f = factorial(m - 1) * nPr(m, w);
              if (c !== f) throw new Error('원순열 불일치');
              return {
                q: `남학생 $${m}$ 명과 여학생 $${w}$ 명이 원탁에 일정한 간격으로 둘러앉을 때, 여학생끼리는 서로 이웃하지 않도록 앉는 경우의 수를 구하세요.`,
                answer: ans(c),
                steps: [
                  `남학생 $${m}$ 명을 먼저 원형으로: $(${m}-1)!=${factorial(m - 1)}$`,
                  `남학생 사이 $${m}$ 자리 중 $${w}$ 곳에 여학생을 한 명씩: $${Ptex(m, w)}=${nPr(m, w)}$`,
                  `$${factorial(m - 1)}\\times${nPr(m, w)}=${c}$`,
                ],
              };
            }
            if (kind === 1) {
              const n = r.int(5, 7);
              const A = 0,
                B = 1,
                C = 2;
              const adj = (s: number[], a: number, b: number) => {
                const i = s.indexOf(a),
                  j = s.indexOf(b);
                return (i - j + n) % n === 1 || (j - i + n) % n === 1;
              };
              const c = count(n, (s) => adj(s, A, B) && !adj(s, A, C));
              const f = 2 * factorial(n - 2) - 2 * factorial(n - 3);
              if (c !== f) throw new Error('원순열 불일치');
              return {
                q: `$A$, $B$, $C$ 를 포함한 $${n}$ 명이 원탁에 일정한 간격으로 둘러앉을 때, $A$ 와 $B$ 는 이웃하고 $A$ 와 $C$ 는 이웃하지 않도록 앉는 경우의 수를 구하세요.`,
                answer: ans(c),
                steps: [
                  `$A$, $B$ 를 한 묶음으로: $(${n - 1}-1)!\\times2=${2 * factorial(n - 2)}$`,
                  `그중 $C$ 도 $A$ 와 이웃하는 경우: $C$-$A$-$B$ 또는 $B$-$A$-$C$ 묶음 → $(${n - 2}-1)!\\times2=${2 * factorial(n - 3)}$`,
                  `$${2 * factorial(n - 2)}-${2 * factorial(n - 3)}=${c}$`,
                ],
              };
            }
            const n = r.pick([6, 8]);
            const k = n / 2;
            const c = count(n, (s) => {
              const pos = (x: number) => s.indexOf(x);
              const opp = (pos(0) - pos(1) + n) % n === k;
              const d = (pos(2) - pos(3) + n) % n;
              return opp && (d === 1 || d === n - 1);
            });
            const f = 2 * (k - 2) * 2 * factorial(n - 4);
            if (c !== f) throw new Error('원순열 불일치');
            return {
              q: `$A$, $B$, $C$, $D$ 를 포함한 $${n}$ 명이 원탁에 일정한 간격으로 둘러앉을 때, $A$ 와 $B$ 는 서로 마주 보고 $C$ 와 $D$ 는 이웃하도록 앉는 경우의 수를 구하세요.`,
              answer: ans(c),
              steps: [
                `$A$ 의 자리를 고정하면 (원순열) $B$ 는 맞은편 1자리`,
                `남은 $${n - 2}$ 자리는 양쪽에 $${k - 1}$ 자리씩 이어진 두 줄 → 이웃한 두 자리의 쌍은 $2\\times${k - 2}=${2 * (k - 2)}$ 가지`,
                `$C$, $D$ 의 순서 $2$ 가지, 나머지 $${n - 4}$ 명은 $${n - 4}!=${factorial(n - 4)}$`,
                `$${2 * (k - 2)}\\times2\\times${factorial(n - 4)}=${c}$`,
              ],
            };
          },
        },
      ],
    },

    // ───────── 이항정리
    'pst-2': {
      skills: [
        {
          id: 'binom-sum-identities',
          title: '이항계수의 합의 활용',
          gen(r, level) {
            if (level === 1) {
              const n = r.int(5, 10);
              const last = n % 2 === 1 ? n : n - 1;
              return {
                q: `$${last <= 7 ? Array.from({ length: (last + 1) / 2 }, (_, i) => Ctex(n, 2 * i + 1)).join('+') : `${Ctex(n, 1)}+${Ctex(n, 3)}+${Ctex(n, 5)}+\\cdots+${Ctex(n, last)}`}$ 의 값을 구하세요.`,
                answer: ans(2 ** (n - 1)),
                steps: [`$(1+1)^{${n}}$ 과 $(1-1)^{${n}}$ 을 전개해 빼면 홀수 번째 항만 2배로 남아요.`, `$2(${Ctex(n, 1)}+${Ctex(n, 3)}+\\cdots)=2^{${n}}-0$`, `값: $2^{${n - 1}}=${2 ** (n - 1)}$`],
              };
            }
            if (level === 2) {
              const N = r.int(100, 5000);
              let n = 1;
              while (2 ** n - 1 <= N) n++;
              return {
                q: `$${Ctex('n', 1)}+${Ctex('n', 2)}+${Ctex('n', 3)}+\\cdots+${Ctex('n', 'n')}>${N}$ 을 만족시키는 자연수 $n$ 의 최솟값을 구하세요.`,
                answer: ans(n),
                steps: [
                  `$${Ctex('n', 0)}+${Ctex('n', 1)}+\\cdots+${Ctex('n', 'n')}=2^{n}$ 이므로 좌변은 $2^{n}-1$`,
                  `$2^{n}-1>${N}$ → $2^{n}>${N + 1}$`,
                  `$2^{${n - 1}}=${2 ** (n - 1)}$, $2^{${n}}=${2 ** n}$ 이므로 최솟값 $${n}$`,
                ],
              };
            }
            const a = r.pick([2, 3, 4]);
            const n = r.int(3, a === 4 ? 5 : 7);
            const V = (1 + a) ** n;
            return {
              q: `$${Ctex('n', 0)}+${Ctex('n', 1)}\\times${a}+${Ctex('n', 2)}\\times${a}^{2}+\\cdots+${Ctex('n', 'n')}\\times${a}^{n}=${V}$ 일 때, 자연수 $n$ 의 값을 구하세요.`,
              answer: ans(n),
              steps: [`이항정리: $(1+x)^{n}=\\sum_{k=0}^{n}${Ctex('n', 'k')}x^{k}$`, `$x=${a}$ 를 넣으면 좌변은 $(1+${a})^{n}=${1 + a}^{n}$`, `$${1 + a}^{n}=${V}=${1 + a}^{${n}}$ → $n=${n}$`],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-binom-remainder',
          title: '이항정리로 큰 수의 나머지 구하기',
          gen(r) {
            const [b, m, sgn] = r.pick([
              [11, 10, 1],
              [21, 10, 1],
              [31, 10, 1],
              [9, 10, -1],
              [19, 10, -1],
              [8, 7, 1],
              [6, 5, 1],
              [7, 6, 1],
              [17, 16, 1],
              [5, 4, 1],
              [13, 12, 1],
            ] as [number, number, number][]);
            const M = m * m;
            const a = (b - sgn) / m;
            const n = r.int(10, 99);
            let x = 1n;
            for (let i = 0; i < n; i++) x = (x * BigInt(b)) % BigInt(M);
            const rem = Number(x);
            const lead = sgn > 0 ? 1 : n % 2 === 0 ? 1 : -1; // (±1)^n
            const lin = sgn > 0 ? n * a * m : n * a * m * (n % 2 === 0 ? -1 : 1); // n·(am)·(±1)^{n-1}
            const raw = lead + lin;
            const am = a === 1 ? `${m}` : `${a}\\times${m}`;
            return {
              q: `$${b}^{${n}}$ 을 $${M}$ ${[0, 3, 6].includes(M % 10) ? '으로' : '로'} 나눈 나머지를 구하세요.`,
              answer: ans(rem),
              steps: [
                `$${b}=${am}${sgn > 0 ? '+1' : '-1'}$ 이므로 $${b}^{${n}}=(${am}${sgn > 0 ? '+1' : '-1'})^{${n}}$ 을 이항정리로 전개해요.`,
                `$(${am})^{k}$ $(k\\ge2)$ 가 들어간 항은 모두 $${m}^{2}=${M}$ 의 배수`,
                `남는 항: $${sgn > 0 ? '1' : `(-1)^{${n}}`}+${Ctex(n, 1)}\\times${am}${sgn > 0 ? '' : `\\times(-1)^{${n - 1}}`}=${lead}${cst(lin)}=${raw}$`,
                `$${raw}$ 을 $${M}$ 의 배수만큼 조정하면 나머지는 $${rem}$`,
              ],
            };
          },
        },
        {
          id: 'top-binom-series-coef',
          title: '여러 이항식의 합에서 계수 구하기',
          gen(r) {
            const N = r.int(6, 12),
              rr = r.int(2, 4);
            const two = r.chance(0.4);
            const base = nCr(N + 1, rr + 1);
            const v = two ? 2 ** rr * base : base;
            const bx = two ? '1+2x' : '1+x';
            return {
              q: `다항식 $(${bx})+(${bx})^{2}+(${bx})^{3}+\\cdots+(${bx})^{${N}}$ 의 전개식에서 $x^{${rr}}$ 의 계수를 구하세요.`,
              answer: ans(v),
              steps: [
                `$(${bx})^{k}$ 에서 $x^{${rr}}$ 의 계수는 $${Ctex('k', rr)}${two ? `\\times2^{${rr}}` : ''}$ ($k<${rr}$ 이면 $0$)`,
                `구하는 계수 $=${two ? `2^{${rr}}` : ''}(${Ctex(rr, rr)}+${Ctex(rr + 1, rr)}+\\cdots+${Ctex(N, rr)})$`,
                `$${Ctex(rr, rr)}=${Ctex(rr + 1, rr + 1)}$ 으로 바꾸고 $${Ctex('k', rr + 1)}+${Ctex('k', rr)}=${Ctex('k+1', rr + 1)}$ 을 차례로 쓰면`,
                `$${Ctex(rr, rr)}+\\cdots+${Ctex(N, rr)}=${Ctex(N + 1, rr + 1)}=${base}$`,
                two ? `$2^{${rr}}\\times${base}=${v}$` : `계수: $${v}$`,
              ],
            };
          },
        },
      ],
    },

    // ───────── 확률의 뜻과 활용
    'pst-3': {
      skills: [
        {
          id: 'prob-function',
          title: '임의로 고른 함수의 확률',
          gen(r, level) {
            if (level === 1) {
              const n = r.int(2, 3),
                m = r.int(n + 1, 5);
              const p = fr(nPr(m, n), m ** n);
              return {
                q: `두 집합 $X=\\{${Array.from({ length: n }, (_, i) => i + 1).join(', ')}\\}$, $Y=\\{${Array.from({ length: m }, (_, i) => i + 1).join(', ')}\\}$ 에 대하여 $X$ 에서 $Y$ 로의 함수 중에서 임의로 하나를 고를 때, 그 함수가 일대일함수일 확률을 구하세요.`,
                answer: ans(p),
                steps: [`전체 함수: $${m}^{${n}}=${m ** n}$`, `일대일함수: $${Ptex(m, n)}=${nPr(m, n)}$`, `확률: $${T(p)}$`],
              };
            }
            if (level === 2) {
              const n = 3,
                m = r.int(4, 6);
              const strict = r.chance(0.5);
              const c = strict ? nCr(m, n) : H(m, n);
              const p = fr(c, m ** n);
              return {
                q: `두 집합 $X=\\{1, 2, 3\\}$, $Y=\\{${Array.from({ length: m }, (_, i) => i + 1).join(', ')}\\}$ 에 대하여 $X$ 에서 $Y$ 로의 함수 중에서 임의로 하나를 고를 때, $f(1)${strict ? '<' : '\\le '}f(2)${strict ? '<' : '\\le '}f(3)$ 일 확률을 구하세요.`,
                answer: ans(p),
                steps: [`전체: $${m}^{3}=${m ** 3}$`, strict ? `서로 다른 세 값을 골라 작은 것부터: $${Ctex(m, 3)}=${c}$` : `중복을 허락해 세 값을 골라 작은 것부터: $${Htex(m, 3)}=${c}$`, `확률: $${T(p)}$`],
              };
            }
            const [n, m] = r.pick([
              [3, 2],
              [4, 2],
              [4, 3],
              [5, 2],
              [5, 3],
            ] as [number, number][]);
            let onto = 0;
            const terms: string[] = [];
            for (let j = 0; j <= m; j++) {
              const t = nCr(m, j) * (m - j) ** n;
              onto += (j % 2 === 0 ? 1 : -1) * t;
              terms.push(`${j === 0 ? '' : j % 2 ? '-' : '+'}${Ctex(m, j)}\\times${m - j}^{${n}}`);
            }
            const p = fr(onto, m ** n);
            return {
              q: `두 집합 $X=\\{${Array.from({ length: n }, (_, i) => i + 1).join(', ')}\\}$, $Y=\\{${Array.from({ length: m }, (_, i) => i + 1).join(', ')}\\}$ 에 대하여 $X$ 에서 $Y$ 로의 함수 중에서 임의로 하나를 고를 때, 치역과 공역이 같을 확률을 구하세요.`,
              answer: ans(p),
              steps: [`전체: $${m}^{${n}}=${m ** n}$`, `치역에서 빠지는 원소가 있는 경우를 포함배제로 빼요.`, `치역 $=Y$ 인 함수: $${terms.join('')}=${onto}$`, `확률: $\\frac{${onto}}{${m ** n}}=${T(p)}$`],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-prob-no-adjacent',
          title: '같은 문자끼리 이웃하지 않을 확률',
          gen(r) {
            const [d, s] = r.pick([
              [3, 0],
              [2, 1],
              [2, 2],
              [1, 3],
              [3, 1],
              [2, 3],
            ] as [number, number][]);
            const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
            const word: string[] = [];
            for (let i = 0; i < d; i++) word.push(letters[i], letters[i]);
            for (let i = 0; i < s; i++) word.push(letters[d + i]);
            const n = word.length;
            let good = 0;
            const all = permsC(n);
            for (const p of all) {
              let ok = true;
              for (let i = 0; i + 1 < n; i++)
                if (word[p[i]] === word[p[i + 1]]) {
                  ok = false;
                  break;
                }
              if (ok) good++;
            }
            const prob = fr(good, all.length);
            const tot = factorial(n) / 2 ** d;
            const terms: string[] = [];
            let ie = 0;
            for (let j = 0; j <= d; j++) {
              const Nj = (nCr(d, j) * factorial(n - j)) / 2 ** (d - j);
              ie += (j % 2 ? -1 : 1) * Nj;
              terms.push(`${j === 0 ? '' : j % 2 ? '-' : '+'}${Nj}`);
            }
            if (fr(ie, tot).eq(prob) === false) throw new Error('포함배제 불일치');
            const show = word.join(', ');
            return {
              q: `${d + s} 종류의 문자 ${show} 를 모두 한 번씩 사용하여 일렬로 임의로 나열할 때, 같은 문자끼리는 서로 이웃하지 않을 확률이 $\\frac{q}{p}$ 이다. $p+q$ 의 값을 구하세요. (단, $p$, $q$ 는 서로소인 자연수)`,
              answer: ans(pq(prob)),
              steps: [
                `전체 (같은 것이 있는 순열): $\\frac{${n}!}{${d === 1 ? '2!' : `(2!)^{${d}}`}}=${tot}$`,
                `특정 문자 $j$ 종류가 각각 붙어 있는 경우는 그 둘을 한 덩어리로 보아 $\\frac{(${n}-j)!}{(2!)^{${d}-j}}$ 가지, 고르는 방법 $${Ctex(d, 'j')}$`,
                `포함배제: $${terms.join('')}=${ie}$`,
                `확률 $\\frac{${ie}}{${tot}}=${T(prob)}$`,
                pqStep(prob),
              ],
            };
          },
        },
        {
          id: 'top-prob-dice',
          title: '여러 번 던진 주사위의 확률 (여사건·포함배제)',
          gen(r) {
            const n = r.int(2, 4);
            const kind = r.int(0, 2);
            const outs = allFuncs(n, 6);
            let ok: (o: number[]) => boolean, steps: string[];
            const total = 6 ** n;
            if (kind === 0) {
              const k = r.int(3, 6);
              ok = (o) => Math.max(...o) === k;
              steps = [`최댓값이 $${k}$ 이하: $${k}^{${n}}$, $${k - 1}$ 이하: $${k - 1}^{${n}}$`, `최댓값이 정확히 $${k}$: $${k}^{${n}}-${k - 1}^{${n}}=${k ** n - (k - 1) ** n}$`];
              const prob = fr(k ** n - (k - 1) ** n, total);
              return {
                q: `한 개의 주사위를 $${n}$ 번 던질 때, 나온 눈의 수의 최댓값이 $${k}$ 일 확률이 $\\frac{q}{p}$ 이다. $p+q$ 의 값을 구하세요. (단, $p$, $q$ 는 서로소인 자연수)`,
                answer: ans(pq(prob)),
                steps: [...steps, `확률 $\\frac{${k ** n - (k - 1) ** n}}{${total}}=${T(prob)}$`, pqStep(prob)],
              };
            }
            if (kind === 1) {
              ok = (o) => o.reduce((a, b) => a * b, 1) % 4 === 0;
              const bad = 3 ** n + n * 2 * 3 ** (n - 1);
              const prob = fr(total - bad, total);
              if (outs.filter(ok).length !== total - bad) throw new Error('주사위 불일치');
              return {
                q: `한 개의 주사위를 $${n}$ 번 던져 나온 눈의 수를 모두 곱한 값이 $4$ 의 배수일 확률이 $\\frac{q}{p}$ 이다. $p+q$ 의 값을 구하세요. (단, $p$, $q$ 는 서로소인 자연수)`,
                answer: ans(pq(prob)),
                steps: [
                  `여사건: 곱이 $4$ 의 배수가 아님 ⇔ $4$ 가 한 번도 없고, $2$ 나 $6$ 이 많아야 한 번`,
                  `모두 홀수: $3^{${n}}=${3 ** n}$`,
                  `$2$ 또는 $6$ 이 정확히 한 번, 나머지 홀수: $${n}\\times2\\times3^{${n - 1}}=${n * 2 * 3 ** (n - 1)}$`,
                  `확률 $1-\\frac{${bad}}{${total}}=${T(prob)}$`,
                  pqStep(prob),
                ],
              };
            }
            ok = (o) => o.includes(1) && o.includes(6);
            const cnt = total - 2 * 5 ** n + 4 ** n;
            if (outs.filter(ok).length !== cnt) throw new Error('주사위 불일치');
            const prob = fr(cnt, total);
            return {
              q: `한 개의 주사위를 $${n}$ 번 던질 때, $1$ 의 눈과 $6$ 의 눈이 각각 적어도 한 번씩 나올 확률이 $\\frac{q}{p}$ 이다. $p+q$ 의 값을 구하세요. (단, $p$, $q$ 는 서로소인 자연수)`,
              answer: ans(pq(prob)),
              steps: [
                `여사건: '$1$ 이 안 나옴' 또는 '$6$ 이 안 나옴'`,
                `$1$ 이 안 나옴: $5^{${n}}$, $6$ 이 안 나옴: $5^{${n}}$, 둘 다 안 나옴: $4^{${n}}$`,
                `구하는 경우: $${total}-(2\\times${5 ** n}-${4 ** n})=${cnt}$`,
                `확률 $${T(prob)}$`,
                pqStep(prob),
              ],
            };
          },
        },
      ],
    },

    // ───────── 조건부확률
    'pst-4': {
      skills: [
        {
          id: 'transfer-bayes',
          title: '공을 옮긴 뒤 꺼내는 확률 (전확률·조건부)',
          gen(r, level) {
            const r1 = r.int(level === 3 ? 2 : 1, 5),
              w1 = r.int(1, 5),
              r2 = r.int(1, 5),
              w2 = r.int(1, 5);
            const n1 = r1 + w1,
              n2 = r2 + w2;
            const head = `주머니 $A$ 에는 빨간 공 $${r1}$ 개, 흰 공 $${w1}$ 개가, 주머니 $B$ 에는 빨간 공 $${r2}$ 개, 흰 공 $${w2}$ 개가 들어 있다.`;
            if (level <= 2) {
              const pR = fr(r1, n1).mul(fr(r2 + 1, n2 + 1)),
                pW = fr(w1, n1).mul(fr(r2, n2 + 1));
              const tot = pR.add(pW);
              const s = [
                `옮긴 공이 빨강: $\\frac{${r1}}{${n1}}\\times\\frac{${r2 + 1}}{${n2 + 1}}=${T(pR)}$`,
                `옮긴 공이 흰색: $\\frac{${w1}}{${n1}}\\times\\frac{${r2}}{${n2 + 1}}=${T(pW)}$`,
                `$B$ 에서 빨간 공일 확률: $${T(tot)}$`,
              ];
              if (level === 1)
                return {
                  q: `${head} 주머니 $A$ 에서 공 1개를 임의로 꺼내 주머니 $B$ 에 넣은 뒤, 주머니 $B$ 에서 공 1개를 임의로 꺼낼 때, 그 공이 빨간 공일 확률을 구하세요.`,
                  answer: ans(tot),
                  steps: s,
                };
              const c = pR.div(tot);
              return {
                q: `${head} 주머니 $A$ 에서 공 1개를 임의로 꺼내 주머니 $B$ 에 넣은 뒤, 주머니 $B$ 에서 공 1개를 임의로 꺼냈더니 빨간 공이었다. 이때 주머니 $A$ 에서 옮긴 공이 빨간 공이었을 확률을 구하세요.`,
                answer: ans(c),
                steps: [...s, `조건부확률: $\\frac{${T(pR)}}{${T(tot)}}=${T(c)}$`],
              };
            }
            const all = nCr(n1, 2);
            const cases: [string, F, number][] = [
              ['빨강 2개', fr(nCr(r1, 2), all), 2],
              ['빨강 1개, 흰색 1개', fr(r1 * w1, all), 1],
              ['흰색 2개', fr(nCr(w1, 2), all), 0],
            ];
            const parts = cases.map(([, p, k]) => p.mul(fr(r2 + k, n2 + 2)));
            const tot = parts.reduce((a, b) => a.add(b), fr(0));
            const c = parts[0].div(tot);
            return {
              q: `${head} 주머니 $A$ 에서 공 2개를 동시에 꺼내 주머니 $B$ 에 넣은 뒤, 주머니 $B$ 에서 공 1개를 임의로 꺼냈더니 빨간 공이었다. 이때 주머니 $A$ 에서 옮긴 공이 모두 빨간 공이었을 확률을 구하세요.`,
              answer: ans(c),
              steps: [
                ...cases.map(([nm, p, k], i) => `옮긴 공이 ${nm}: $${T(p)}\\times\\frac{${r2 + k}}{${n2 + 2}}=${T(parts[i])}$`),
                `$B$ 에서 빨간 공일 확률: $${T(tot)}$`,
                `구하는 확률: $\\frac{${T(parts[0])}}{${T(tot)}}=${T(c)}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-cond-table',
          title: '조건부확률로 분할표 완성하기',
          gen(r) {
            for (;;) {
              const M = 5 * r.int(4, 12),
                W = 5 * r.int(4, 12);
              const x = r.int(2, M - 2),
                y = r.int(2, W - 2);
              if (r.chance(0.5)) {
                const pB = fr(W - y, W),
                  pMA = fr(x, x + y);
                const ansF = fr(x, M);
                if (ansF.d === 1) continue;
                return {
                  q: `어느 학교 학생 $${M + W}$ 명 (남학생 $${M}$ 명, 여학생 $${W}$ 명) 은 모두 두 체험 활동 $A$, $B$ 중 하나를 선택했다. 이 학교 여학생 중 임의로 뽑은 한 명이 $B$ 를 선택했을 확률은 $${T(pB)}$ 이고, $A$ 를 선택한 학생 중 임의로 뽑은 한 명이 남학생일 확률은 $${T(pMA)}$ 이다. 남학생 중 임의로 뽑은 한 명이 $A$ 를 선택했을 확률이 $\\frac{q}{p}$ 일 때, $p+q$ 의 값을 구하세요. (단, $p$, $q$ 는 서로소인 자연수)`,
                  answer: ans(pq(ansF)),
                  steps: [
                    `$A$ 를 선택한 남학생 수 $x$, 여학생 수 $y$ 로 표를 만들어요.`,
                    `여학생 중 $B$: $\\frac{${W}-y}{${W}}=${T(pB)}$ → $y=${y}$`,
                    `$A$ 중 남학생: $\\frac{x}{x+${y}}=${T(pMA)}$ → $x=${x}$`,
                    `남학생 중 $A$: $\\frac{${x}}{${M}}=${T(ansF)}$`,
                    pqStep(ansF),
                  ],
                };
              }
              const nA = x + y;
              const a1 = fr(x, M),
                b1 = fr(x, nA);
              const ansF = fr(W - y, W);
              if (ansF.d === 1 || a1.d === 1) continue;
              return {
                q: `어느 학교 학생 $${M + W}$ 명은 모두 두 체험 활동 $A$, $B$ 중 하나를 선택했고, $A$ 를 선택한 학생은 $${nA}$ 명이다. 남학생 중 임의로 뽑은 한 명이 $A$ 를 선택했을 확률은 $${T(a1)}$ 이고, $A$ 를 선택한 학생 중 임의로 뽑은 한 명이 남학생일 확률은 $${T(b1)}$ 이다. 여학생 중 임의로 뽑은 한 명이 $B$ 를 선택했을 확률이 $\\frac{q}{p}$ 일 때, $p+q$ 의 값을 구하세요. (단, $p$, $q$ 는 서로소인 자연수)`,
                answer: ans(pq(ansF)),
                steps: [
                  `$A$ 를 선택한 남학생 수: $${nA}\\times${T(b1)}=${x}$`,
                  `남학생 수: $\\frac{${x}}{M}=${T(a1)}$ → $M=${M}$, 여학생 $${M + W}-${M}=${W}$ 명`,
                  `$A$ 를 선택한 여학생 $${nA}-${x}=${y}$, $B$ 를 선택한 여학생 $${W - y}$`,
                  `여학생 중 $B$: $\\frac{${W - y}}{${W}}=${T(ansF)}$`,
                  pqStep(ansF),
                ],
              };
            }
          },
        },
        {
          id: 'top-cond-dice-coin',
          title: '시행 결과로 원인을 추정하는 조건부확률',
          gen(r) {
            const ev = r.pick([
              ['3의 배수', fr(1, 3)],
              ['짝수', fr(1, 2)],
              ['6의 약수', fr(2, 3)],
              ['5 이상', fr(1, 3)],
              ['소수', fr(1, 2)],
            ] as [string, F][]);
            const ga = hasB(ev[0]) ? '이' : '가',
              was = hasB(ev[0]) ? '이었을' : '였을';
            const n1 = r.int(2, 5);
            let n2 = r.int(2, 5);
            if (n2 === n1) n2 = n1 === 5 ? 2 : n1 + 1;
            const k = r.int(1, Math.min(n1, n2));
            const pa = ev[1].mul(fr(nCr(n1, k), 2 ** n1)),
              pb = fr(1)
                .sub(ev[1])
                .mul(fr(nCr(n2, k), 2 ** n2));
            const c = pa.div(pa.add(pb));
            return {
              q: `한 개의 주사위를 던져 나온 눈의 수가 ${ev[0]}이면 동전을 $${n1}$ 번 던지고, ${ev[0]}${ga} 아니면 동전을 $${n2}$ 번 던진다. 이 시행에서 동전의 앞면이 정확히 $${k}$ 번 나왔을 때, 주사위의 눈의 수가 ${ev[0]}${was} 확률이 $\\frac{q}{p}$ 이다. $p+q$ 의 값을 구하세요. (단, $p$, $q$ 는 서로소인 자연수)`,
              answer: ans(pq(c)),
              steps: [
                `주사위가 ${ev[0]}일 확률 $${T(ev[1])}$`,
                `${ev[0]}이고 앞면 $${k}$ 번: $${T(ev[1])}\\times${Ctex(n1, k)}\\left(\\frac{1}{2}\\right)^{${n1}}=${T(pa)}$`,
                `${ev[0]}${ga} 아니고 앞면 $${k}$ 번: $${T(fr(1).sub(ev[1]))}\\times${Ctex(n2, k)}\\left(\\frac{1}{2}\\right)^{${n2}}=${T(pb)}$`,
                `구하는 확률: $\\frac{${T(pa)}}{${T(pa)}+${T(pb)}}=${T(c)}$`,
                pqStep(c),
              ],
            };
          },
        },
      ],
    },

    // ───────── 확률분포
    'pst-5': {
      skills: [
        {
          id: 'var-from-conditions',
          title: '조건으로 분산 구하기',
          gen(r, level) {
            if (level === 1) {
              const mu = r.int(-3, 6),
                v = r.int(1, 9),
                a = r.nonzero(-4, 4),
                b = r.int(-5, 5);
              return {
                q: `확률변수 $X$ 에 대하여 $E(X)=${mu}$, $E(X^{2})=${v + mu * mu}$ 일 때, $V(${a === 1 ? '' : a === -1 ? '-' : a}X${cst(b)})$ 의 값을 구하세요.`,
                answer: ans(a * a * v),
                steps: [`$V(X)=E(X^{2})-\\{E(X)\\}^{2}=${v + mu * mu}-${mu * mu}=${v}$`, `$V(aX+b)=a^{2}V(X)=${a * a}\\times${v}=${a * a * v}$`],
              };
            }
            if (level === 2) {
              const mu = r.int(-3, 6),
                v = r.int(1, 9),
                c = r.pick([2, 3]),
                d = r.nonzero(-3, 3);
              return {
                q: `확률변수 $X$ 에 대하여 $E(${c}X${cst(d)})=${c * mu + d}$, $V(${c}X${cst(d)})=${c * c * v}$ 일 때, $E(X^{2})$ 의 값을 구하세요.`,
                answer: ans(v + mu * mu),
                steps: [`$${c}E(X)${cst(d)}=${c * mu + d}$ → $E(X)=${mu}$`, `$${c * c}V(X)=${c * c * v}$ → $V(X)=${v}$`, `$E(X^{2})=V(X)+\\{E(X)\\}^{2}=${v}+${mu * mu}=${v + mu * mu}$`],
              };
            }
            const D = r.pick([6, 8, 10]);
            const i = r.int(1, D - 2),
              j = r.int(1, D - i - 1),
              k = D - i - j;
            const xs = r.sample([0, 1, 2, 3, 4, 5], 3).sort((a, b) => a - b);
            const [x1, x2, x3] = xs;
            const pa = fr(i, D),
              pb = fr(j, D),
              pc = fr(k, D);
            const E = pa.mul(x1).add(pb.mul(x2)).add(pc.mul(x3));
            const E2 = pa
              .mul(x1 * x1)
              .add(pb.mul(x2 * x2))
              .add(pc.mul(x3 * x3));
            const V = E2.sub(E.mul(E));
            return {
              q: `확률변수 $X$ 의 확률분포가 다음 표와 같고 $E(X)=${T(E)}$ 일 때, $V(X)$ 의 값을 구하세요.`,
              table: [
                ['$X$', `$${x1}$`, `$${x2}$`, `$${x3}$`, '합계'],
                ['$P(X=x)$', '$a$', '$b$', `$${T(pc)}$`, '$1$'],
              ],
              answer: ans(V),
              steps: [
                `$a+b=1-${T(pc)}=${T(fr(1).sub(pc))}$`,
                `$E(X)=${x1}a+${x2}b+${x3}\\times${T(pc)}=${T(E)}$ → $${x1 === 0 ? '' : `${x1}a+`}${x2}b=${T(E.sub(pc.mul(x3)))}$`,
                `연립하면 $a=${T(pa)}$, $b=${T(pb)}$`,
                `$E(X^{2})=${T(E2)}$`,
                `$V(X)=${T(E2)}-\\left(${T(E)}\\right)^{2}=${T(V)}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-binom-from-moments',
          title: '평균·분산 조건으로 이항분포의 시행 횟수 찾기',
          gen(r) {
            const p = r.pick([fr(1, 2), fr(1, 3), fr(2, 3), fr(1, 4), fr(3, 4), fr(1, 5), fr(2, 5), fr(3, 5), fr(4, 5)]);
            const n = p.d * r.int(2, 12);
            const mu = p.mul(n),
              V = mu.mul(fr(1).sub(p));
            const c = r.pick([2, 3]),
              d = r.nonzero(-4, 4);
            const A = V.mul(c * c),
              B = V.add(mu.mul(mu));
            return {
              q: `확률변수 $X$ 가 이항분포 $B(n, p)$ 를 따르고 $V(${c}X${cst(d)})=${T(A)}$, $E(X^{2})=${T(B)}$ 일 때, $n$ 의 값을 구하세요.`,
              answer: ans(n),
              steps: [
                `$V(${c}X${cst(d)})=${c * c}V(X)$ → $V(X)=${T(V)}$`,
                `$E(X^{2})=V(X)+\\{E(X)\\}^{2}$ → $\\{E(X)\\}^{2}=${T(B)}-${pr(V)}=${T(mu.mul(mu))}$, $E(X)=np=${T(mu)}$ ($np>0$)`,
                `$V(X)=np(1-p)=${T(mu)}(1-p)=${T(V)}$ → $1-p=${T(fr(1).sub(p))}$, $p=${T(p)}$`,
                `$n=\\frac{${T(mu)}}{${T(p)}}=${n}$`,
              ],
            };
          },
        },
        {
          id: 'top-pmf-linear',
          title: '규칙이 있는 확률질량함수의 평균·분산',
          gen(r) {
            const n = r.int(3, 8);
            const inc = r.chance(0.5);
            const w = (k: number) => (inc ? k : n + 1 - k);
            const Sw = (n * (n + 1)) / 2;
            let E = fr(0),
              E2 = fr(0);
            for (let k = 1; k <= n; k++) {
              E = E.add(fr(w(k) * k, Sw));
              E2 = E2.add(fr(w(k) * k * k, Sw));
            }
            const V = E2.sub(E.mul(E));
            const askV = r.chance(0.5);
            const b = r.nonzero(-5, 5);
            const v = askV ? V.mul(36) : E.mul(3).add(b);
            const pm = inc ? 'ck' : `c(${n + 1}-k)`;
            return {
              q: `확률변수 $X$ 가 가지는 값이 $${n === 3 ? '1, 2, 3' : `1, 2, \\cdots, ${n}`}$ 이고 $P(X=k)=${pm}$ $(k=${n === 3 ? '1, 2, 3' : `1, 2, \\cdots, ${n}`})$ 일 때, ${askV ? `$V(6X${cst(b)})$` : `$E(3X${cst(b)})$`} 의 값을 구하세요. (단, $c$ 는 상수)`,
              answer: ans(v),
              steps: [
                `확률의 합: $c\\times(${n === 3 ? '1+2+3' : `1+2+\\cdots+${n}`})=${Sw}c=1$ → $c=\\frac{1}{${Sw}}$`,
                `$E(X)=\\frac{1}{${Sw}}\\sum_{k=1}^{${n}}${inc ? 'k^{2}' : `k(${n + 1}-k)`}=${T(E)}$`,
                ...(askV
                  ? [`$E(X^{2})=\\frac{1}{${Sw}}\\sum_{k=1}^{${n}}${inc ? 'k^{3}' : `k^{2}(${n + 1}-k)`}=${T(E2)}$`, `$V(X)=${T(E2)}-\\left(${T(E)}\\right)^{2}=${T(V)}$`, `$V(6X${cst(b)})=36V(X)=${T(v)}$`]
                  : [`$E(3X${cst(b)})=3\\times${T(E)}${cst(b)}=${T(v)}$`]),
              ],
            };
          },
        },
      ],
    },

    // ───────── 정규분포
    'pst-6': {
      skills: [
        {
          id: 'normal-two-equal',
          title: '정규분포의 대칭과 두 분포 비교',
          gen(r, level) {
            if (level === 1) {
              const m = r.int(20, 80),
                h = r.int(2, 12),
                s = r.int(2, 8);
              return {
                q: `확률변수 $X$ 가 정규분포 $N(m, ${s}^{2})$ 을 따르고 $P(X\\le ${m - h})=P(X\\ge ${m + h})$ 일 때, $m$ 의 값을 구하세요.`,
                answer: ans(m),
                steps: [`정규분포 곡선은 $x=m$ 에 대칭이므로 두 점 $${m - h}$, $${m + h}$ 의 중점이 $m$`, `$m=\\frac{${m - h}+${m + h}}{2}=${m}$`],
              };
            }
            const z = level === 2 ? r.nonzero(-3, 3) * 0.5 : r.pick([0.5, 1, 1.5, 2, -0.5, -1, -1.5, -2]);
            const s1 = 2 * r.int(1, 5),
              s2 = 2 * r.int(1, 5);
            const m1 = r.int(30, 70);
            const k = m1 + z * s1,
              m2 = k + z * s2;
            const base = [
              `$P(X\\le k)=P\\left(Z\\le\\frac{k-${m1}}{${s1}}\\right)$, $P(Y\\ge k)=P\\left(Z\\ge\\frac{k-${m2}}{${s2}}\\right)=P\\left(Z\\le\\frac{${m2}-k}{${s2}}\\right)$`,
              `$\\frac{k-${m1}}{${s1}}=\\frac{${m2}-k}{${s2}}$ → $k=${k}$`,
            ];
            const head = `두 확률변수 $X$, $Y$ 가 각각 정규분포 $N(${m1}, ${s1}^{2})$, $N(${m2}, ${s2}^{2})$ 을 따르고 $P(X\\le k)=P(Y\\ge k)$ 이다.`;
            if (level === 2)
              return {
                q: `${head} 상수 $k$ 의 값을 구하세요.`,
                answer: ans(k),
                steps: base,
              };
            const P = rnd(Phi(z));
            return {
              q: `${head} 아래 표준정규분포표를 이용하여 $P(X\\le k)$ 의 값을 구하세요.`,
              table: zTable(),
              answer: dAns(P),
              steps: [...base, `$\\frac{${k}-${m1}}{${s1}}=${dec(z)}$ 이므로 $P(X\\le k)=P(Z\\le ${dec(z)})=${z > 0 ? `0.5+${zv(zk(z))}` : `0.5-${zv(zk(-z))}`}=${P}$`],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-normal-pdf-ineq',
          title: '확률밀도함수의 대소로 평균 결정하기',
          gen(r) {
            const m = r.int(10, 60);
            const loS = r.chance(0.5) ? 2 * m - 1 : 2 * m - 2,
              hiS = r.chance(0.5) ? 2 * m + 1 : 2 * m + 2;
            const a = r.int(m - 15, m - 5),
              b = loS - a;
            const c = r.int(m - 14, m - 3),
              d = hiS - c;
            const s = 2 * r.int(1, 5);
            const z1 = r.pick([0.5, 1, 1.5, 2]),
              z2 = r.pick([0.5, 1, 1.5, 2, 2.5]);
            const lo = m - z1 * s,
              hi = m + z2 * s;
            const P = rnd(zv(zk(z1)) + zv(zk(z2)));
            return {
              q: `확률변수 $X$ 가 정규분포 $N(m, ${s}^{2})$ 을 따르고, $X$ 의 확률밀도함수 $f(x)$ 가 $f(${a})<f(${b})$, $f(${c})>f(${d})$ 를 만족시킨다. $m$ 이 자연수일 때, 아래 표준정규분포표를 이용하여 $P(${lo}\\le X\\le ${hi})$ 의 값을 구하세요.`,
              table: zTable(),
              answer: dAns(P),
              steps: [
                `$f(x)$ 는 $x=m$ 에 대칭이고 $m$ 에서 멀수록 작아요.`,
                `$f(${a})<f(${b})$ → $${b}$ 가 $m$ 에 더 가까움 → $m>\\frac{${a}+${b}}{2}=${dec(loS / 2)}$`,
                `$f(${c})>f(${d})$ → $m<\\frac{${c}+${d}}{2}=${dec(hiS / 2)}$`,
                `$${dec(loS / 2)}<m<${dec(hiS / 2)}$ 인 자연수는 $m=${m}$`,
                `$P(${lo}\\le X\\le ${hi})=P(${dec(-z1)}\\le Z\\le ${dec(z2)})=${zv(zk(z1))}+${zv(zk(z2))}=${P}$`,
              ],
            };
          },
        },
        {
          id: 'top-normal-max-interval',
          title: '구간 확률이 최대가 되는 위치와 표준편차',
          gen(r) {
            const m = r.int(20, 80),
              hw = r.int(1, 5);
            const s = 2 * r.int(1, 6);
            const z = r.pick([1, 1.5, 2, 2.5]);
            const del = z * s;
            const tail = rnd(0.5 - zv(zk(z)));
            const z1 = r.pick([0.5, 1, 1.5, 2]),
              z2 = r.pick([0.5, 1, 1.5, 2, 2.5, 3]);
            const lo = m - z1 * s,
              hi = m + z2 * s;
            const P = rnd(zv(zk(z1)) + zv(zk(z2)));
            return {
              q: `확률변수 $X$ 가 정규분포 $N(m, \\sigma^{2})$ 을 따른다. 실수 $k$ 에 대하여 $g(k)=P(k-${hw}\\le X\\le k+${hw})$ 는 $k=${m}$ 일 때 최대이고, $P(X\\ge ${m + del})=${tail}$ 이다. 아래 표준정규분포표를 이용하여 $P(${lo}\\le X\\le ${hi})$ 의 값을 구하세요.`,
              table: zTable(),
              answer: dAns(P),
              steps: [
                `길이가 일정한 구간의 확률은 구간의 중점이 평균일 때 최대 → $m=${m}$`,
                `$P(X\\ge ${m + del})=P\\left(Z\\ge\\frac{${del}}{\\sigma}\\right)=${tail}=0.5-${zv(zk(z))}$ → $\\frac{${del}}{\\sigma}=${dec(z)}$`,
                `$\\sigma=${s}$`,
                `$P(${lo}\\le X\\le ${hi})=P(${dec(-z1)}\\le Z\\le ${dec(z2)})=${zv(zk(z1))}+${zv(zk(z2))}=${P}$`,
              ],
            };
          },
        },
      ],
    },

    // ───────── 통계적 추정
    'pst-7': {
      skills: [
        {
          id: 'xbar-min-n',
          title: '표본평균의 확률 조건으로 표본의 크기 정하기',
          gen(r, level) {
            const m = r.int(30, 90);
            if (level === 1) {
              const k = r.int(2, 6),
                sS = 2 * r.int(1, 4);
              const z = r.pick([0.5, 1, 1.5, 2, 2.5]);
              const sig = sS * k,
                c = z * sS;
              const P = rnd(2 * zv(zk(z)));
              return {
                q: `정규분포 $N(${m}, ${sig}^{2})$ 을 따르는 모집단에서 크기가 $${k * k}$ 인 표본을 임의추출하여 구한 표본평균을 $\\overline{X}$ 라 할 때, 아래 표준정규분포표를 이용하여 $P(|\\overline{X}-${m}|\\le ${dec(c)})$ 의 값을 구하세요.`,
                table: zTable(),
                answer: dAns(P),
                steps: [`$\\overline{X}\\sim N\\left(${m}, \\frac{${sig}^{2}}{${k * k}}\\right)=N(${m}, ${sS}^{2})$`, `$P(|\\overline{X}-${m}|\\le ${dec(c)})=P(|Z|\\le ${dec(z)})=2\\times${zv(zk(z))}=${P}$`],
              };
            }
            const z = r.pick([1, 1.5, 2, 2.5]);
            const sig = r.int(3, 20),
              c = r.int(1, Math.max(1, Math.floor(sig / 2)));
            // n ≥ (zσ/c)^2
            const z10 = Math.round(z * 10);
            const num = (z10 * sig) ** 2,
              den = 100 * c * c;
            const n = Math.ceil(num / den);
            const bound = fr(num, den);
            if (level === 2) {
              const P = rnd(2 * zv(zk(z)));
              return {
                q: `정규분포 $N(${m}, ${sig}^{2})$ 을 따르는 모집단에서 크기가 $n$ 인 표본을 임의추출하여 구한 표본평균을 $\\overline{X}$ 라 하자. $P(|\\overline{X}-${m}|\\le ${c})\\ge ${P}$ 가 되도록 하는 자연수 $n$ 의 최솟값을 아래 표준정규분포표를 이용하여 구하세요.`,
                table: zTable(),
                answer: ans(n),
                steps: [
                  `$P(|\\overline{X}-${m}|\\le ${c})=P\\left(|Z|\\le\\frac{${c === 1 ? '' : c}\\sqrt{n}}{${sig}}\\right)\\ge${P}=P(|Z|\\le ${dec(z)})$`,
                  `$\\frac{${c === 1 ? '' : c}\\sqrt{n}}{${sig}}\\ge ${dec(z)}$ → $n\\ge\\left(${c === 1 ? `${dec(z)}\\times${sig}` : `\\frac{${dec(z)}\\times${sig}}{${c}}`}\\right)^{2}=${bound.d === 1 ? bound.n : dec(bound.value)}$`,
                  `최솟값 $${n}$`,
                ],
              };
            }
            const tail = rnd(0.5 - zv(zk(z)));
            return {
              q: `정규분포 $N(${m}, ${sig}^{2})$ 을 따르는 모집단에서 크기가 $n$ 인 표본을 임의추출하여 구한 표본평균을 $\\overline{X}$ 라 하자. $P(\\overline{X}\\ge ${m + c})\\le ${tail}$ 이 되도록 하는 자연수 $n$ 의 최솟값을 아래 표준정규분포표를 이용하여 구하세요.`,
              table: zTable(),
              answer: ans(n),
              steps: [
                `$P(\\overline{X}\\ge ${m + c})=P\\left(Z\\ge\\frac{${c === 1 ? '' : c}\\sqrt{n}}{${sig}}\\right)\\le ${tail}=P(Z\\ge ${dec(z)})$`,
                `$\\frac{${c === 1 ? '' : c}\\sqrt{n}}{${sig}}\\ge ${dec(z)}$ → $n\\ge\\left(${c === 1 ? `${dec(z)}\\times${sig}` : `\\frac{${dec(z)}\\times${sig}}{${c}}`}\\right)^{2}=${bound.d === 1 ? bound.n : dec(bound.value)}$`,
                `최솟값 $${n}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-xbar-two-eq',
          title: '모집단과 표본평균의 확률이 같을 조건',
          gen(r) {
            const m = r.int(30, 80),
              rt = r.int(2, 5),
              u = r.int(1, 4),
              w = r.int(1, 4);
            const sig = r.int(2, 10);
            const d = m + u,
              c = m - rt * u,
              f = m - w,
              e = m + rt * w;
            return {
              q: `정규분포 $N(m, ${sig}^{2})$ 을 따르는 모집단의 확률변수를 $X$, 이 모집단에서 크기가 $n$ 인 표본을 임의추출하여 구한 표본평균을 $\\overline{X}$ 라 하자. $P(X\\le ${c})=P(\\overline{X}\\ge ${d})$, $P(X\\ge ${e})=P(\\overline{X}\\le ${f})$ 일 때, $m+n$ 의 값을 구하세요.`,
              answer: ans(m + rt * rt),
              steps: [
                `$\\overline{X}\\sim N\\left(m, \\frac{${sig}^{2}}{n}\\right)$, $\\sqrt{n}=t$ 라 하자.`,
                `첫째: $\\frac{${c}-m}{${sig}}=-\\frac{(${d}-m)t}{${sig}}$ → $m-${c}=t(${d}-m)$`,
                `둘째: $\\frac{${e}-m}{${sig}}=\\frac{(m-${f})t}{${sig}}$ → $${e}-m=t(m-${f})$`,
                `두 식을 나누면 $\\frac{m-${c}}{${d}-m}=\\frac{${e}-m}{m-${f}}$ → $(m-${c})(m-${f})=(${e}-m)(${d}-m)$ → $${d + e - c - f}m=${d * e - c * f}$, $m=${m}$`,
                `$t=\\frac{${m}-${c}}{${d}-${m}}=${rt}$, $n=${rt * rt}$`,
                `$m+n=${m + rt * rt}$`,
              ],
            };
          },
        },
        {
          id: 'top-ci-shift',
          title: '두 신뢰구간의 관계로 표본평균 구하기',
          gen(r) {
            const [s, k] = r.pick([
              [50, 3],
              [100, 2],
              [100, 3],
              [100, 6],
              [150, 3],
              [200, 2],
              [200, 3],
              [200, 4],
            ] as [number, number][]);
            const n1 = r.pick([16, 25, 36, 49, 64]);
            const x1 = r.int(100, 300) * 10;
            const a = x1 - 1.96 * s,
              b = x1 + 1.96 * s;
            const x2 = a + (2.58 * s) / k;
            return {
              q: `어느 회사에서 생산하는 전구의 수명은 정규분포 $N(m, \\sigma^{2})$ 을 따른다. 이 전구 $${n1}$ 개를 임의추출하여 구한 표본평균으로 모평균 $m$ 을 신뢰도 $95\\%$ 로 추정한 신뢰구간이 $${dec(a)}\\le m\\le ${dec(b)}$ 이었다. 다시 이 전구 $${n1 * k * k}$ 개를 임의추출하여 구한 표본평균 $\\overline{x}$ 로 모평균 $m$ 을 신뢰도 $99\\%$ 로 추정한 신뢰구간이 $c\\le m\\le d$ 일 때, $c=${dec(a)}$ 이었다. $\\overline{x}$ 의 값을 구하세요. (단, 수명의 단위는 시간이고, $P(|Z|\\le1.96)=0.95$, $P(|Z|\\le2.58)=0.99$ 로 계산한다.)`,
              answer: ans(Math.round(x2)),
              steps: [
                `첫 신뢰구간의 길이 $2\\times1.96\\times\\frac{\\sigma}{\\sqrt{${n1}}}=${dec(b - a)}$ → $\\frac{\\sigma}{\\sqrt{${n1}}}=${s}$`,
                `둘째 표본의 크기는 $${n1}\\times${k * k}$ 이므로 $\\frac{\\sigma}{\\sqrt{${n1 * k * k}}}=\\frac{${s}}{${k}}$`,
                `$c=\\overline{x}-2.58\\times\\frac{${s}}{${k}}=\\overline{x}-${dec((2.58 * s) / k)}$`,
                `$\\overline{x}=${dec(a)}+${dec((2.58 * s) / k)}=${Math.round(x2)}$`,
              ],
            };
          },
        },
      ],
    },
  },
  {
    'top-monotone-functions': '크기 순서가 정해진 함수는 함숫값을 중복을 허락해 고르는 것(중복조합)과 같아요',
    'top-circular-condition': '원순열은 한 사람을 고정해 일렬로 바꾸고, 조건은 묶음·여사건으로 처리해요',
    'top-binom-remainder': '밑을 (나누는 수의 제곱근의 배수)$\\pm1$ 로 쓰고 이항정리로 전개하면 앞의 두 항만 남아요',
    'top-prob-dice': '직접 세기 어려운 사건은 여사건이나 포함배제로 세기',
    'top-binom-from-moments': '$E(X^{2})=V(X)+\\{E(X)\\}^{2}$ 로 평균을 먼저 구하고 $np$, $np(1-p)$ 를 연립',
    'top-pmf-linear': '확률의 합이 $1$ 임을 이용해 상수를 정한 뒤 $\\Sigma$ 공식으로 평균·분산 계산',
    'top-normal-max-interval': '길이가 일정한 구간의 확률이 최대인 위치가 평균이고, 꼬리 확률로 표준편차를 정해요',
    'top-ci-shift': '신뢰구간의 길이에서 $\\frac{\\sigma}{\\sqrt{n}}$ 을 구하고, 표본의 크기가 바뀌면 그 값이 어떻게 변하는지 보기',
  },
);
