// 확률과 통계 (pst-1 ~ pst-7)
import type { ContentMap, ProblemDraft } from '../../core/types';
import { F } from '../../core/frac';
import { Svg, Plane } from '../../core/fig';
import { factorial, nCr, nPr, round } from '../../core/nt';
import { makeChoices, numChoices, dec } from '../../core/tex';
import { NAMES, Ctex, PItex, Htex, fAns, dAns, fChoices, ZTAB, zTable, zKey, stableFig } from './util';
import { PST_WORD } from './word-pst';
import { PST_HARD } from './hard-pst';

const fr = (n: number, d: number) => new F(n, d);
const T = (f: F) => f.tex();
/** n/d 를 쓰고, 약분되면 '= 기약분수' 를 붙임 */
const ratio = (n: number, d: number) => {
  const f = fr(n, d);
  return f.n === n && f.d === d ? `\\frac{${n}}{${d}}` : `\\frac{${n}}{${d}} = ${T(f)}`;
};

/** 최단 경로 격자 그림 (가로 m칸, 세로 n칸), P 를 지나는 점 표시 */
function gridFig(m: number, n: number, P?: [number, number]): string {
  const c = Math.min(40, Math.floor(240 / Math.max(m, n)));
  const s = new Svg(m * c + 50, n * c + 44);
  const X = (i: number) => 25 + i * c;
  const Y = (j: number) => 20 + (n - j) * c;
  for (let i = 0; i <= m; i++) s.line(X(i), Y(0), X(i), Y(n));
  for (let j = 0; j <= n; j++) s.line(X(0), Y(j), X(m), Y(j));
  s.dot(X(0), Y(0), { cls: 'acc' }).text(X(0) - 10, Y(0) + 12, 'A', { size: 13 });
  s.dot(X(m), Y(n), { cls: 'acc' }).text(X(m) + 10, Y(n) - 10, 'B', { size: 13 });
  if (P) s.dot(X(P[0]), Y(P[1]), { cls: 'acc2', r: 4.5 }).text(X(P[0]) + 10, Y(P[1]) - 10, 'P', { size: 13 });
  return s.toString();
}

/** 확률분포표 */
const distTable = (xs: (number | string)[], ps: string[], v = 'X'): string[][] => [
  [`$${v}$`, ...xs.map((x) => `$${x}$`), '합계'],
  [`$P(${v}=x)$`, ...ps.map((p) => `$${p}$`), '$1$'],
];

/** 확률 p 를 분수 F 로 하는 간단 사건들 (주사위) */
const DIE_EVENTS: { name: string; p: F }[] = [
  { name: '1의 눈이 나오는', p: fr(1, 6) },
  { name: '3의 배수의 눈이 나오는', p: fr(1, 3) },
  { name: '짝수의 눈이 나오는', p: fr(1, 2) },
  { name: '5 이상의 눈이 나오는', p: fr(1, 3) },
  { name: '4 이하의 눈이 나오는', p: fr(2, 3) },
];

function binomP(n: number, k: number, p: F): F {
  return p.pow(k).mul(F.of(1).sub(p).pow(n - k)).mul(nCr(n, k));
}

export const pst: ContentMap = {
  // ───────────────────────── pst-1 여러 가지 순열과 조합
  'pst-1': {
    concepts: [
      {
        title: '원순열',
        body: '서로 다른 $n$개를 원형으로 배열하는 것을 **원순열**이라 해요. 회전해서 겹치는 배열은 같은 것으로 봅니다.\n$$\\frac{n!}{n} = (n-1)!$$\n- 공통수학1의 순열 $n!$ 에서 회전으로 같아지는 $n$가지를 하나로 묶은 것이에요.\n- 다각형 모양 탁자는 회전해도 자리가 구별되는 경우가 있어 $(n-1)!$ 에 그만큼 곱해요.',
        example: { q: '5명이 원탁에 둘러앉는 경우의 수는?', a: '$(5-1)! = 24$' },
      },
      {
        title: '중복순열',
        body: '서로 다른 $n$개에서 **중복을 허락하여** $r$개를 택해 일렬로 배열하는 경우의 수:\n$$' + PItex('n', 'r') + ' = n^{r}$$\n- $r$이 $n$보다 커도 돼요.\n- 함수 $f: X\\to Y$ ($n(X)=r$, $n(Y)=n$) 의 개수도 $n^{r}$ 이에요.',
        example: { q: '숫자 $1, 2, 3$ 으로 만들 수 있는 네 자리 자연수의 개수 (중복 허용)', a: '$' + PItex(3, 4) + ' = 3^{4} = 81$' },
      },
      {
        title: '같은 것이 있는 순열',
        body: '$n$개 중 같은 것이 각각 $p$개, $q$개, …, $r$개 있을 때 일렬로 배열하는 경우의 수:\n$$\\frac{n!}{p!\\,q!\\,\\cdots\\,r!}\\quad(p+q+\\cdots+r=n)$$\n- 격자에서 **최단 경로**의 수: 오른쪽 $m$번, 위쪽 $n$번 → $\\dfrac{(m+n)!}{m!\\,n!}$',
      },
      {
        title: '중복조합',
        body: '서로 다른 $n$개에서 **중복을 허락하여** $r$개를 택하는 조합의 수:\n$$' + Htex('n', 'r') + ' = ' + Ctex('n+r-1', 'r') + '$$\n- 방정식 $x+y+z=r$ 의 음이 아닌 정수해의 개수 $= ' + Htex(3, 'r') + '$\n- 양의 정수해는 미리 1씩 나누어 주고 남은 것을 중복조합으로 세요.',
        example: { q: '$x+y+z=5$ 의 음이 아닌 정수해의 개수', a: '$' + Htex(3, 5) + ' = ' + Ctex(7, 5) + ' = 21$' },
      },
    ],
    skills: [
      {
        id: 'circular',
        title: '원순열',
        gen(r, level): ProblemDraft {
          if (level === 1) {
            const n = r.int(4, 8);
            const ans = factorial(n - 1);
            const what = r.pick(['원탁에 둘러앉는', '원 모양으로 손을 잡고 둘러서는']);
            return {
              q: `${n}명의 학생이 ${what} 경우의 수를 구하세요.`,
              answer: { type: 'num', value: ans, unit: '가지' },
              steps: [`서로 다른 $n$개의 원순열의 수는 $(n-1)!$ 입니다.`, `$(${n}-1)! = ${n - 1}! = ${ans}$`],
              hint: '회전하여 같아지는 배열은 한 가지로 봅니다.',
            };
          }
          if (level === 2) {
            const n = r.int(5, 8);
            const [a, b] = r.sample(NAMES, 2);
            const ans = factorial(n - 2) * 2;
            return {
              q: `${a}, ${b}를 포함한 ${n}명이 원탁에 둘러앉을 때, ${a}와 ${b}가 서로 이웃하여 앉는 경우의 수를 구하세요.`,
              answer: { type: 'num', value: ans, unit: '가지' },
              steps: [
                `${a}와 ${b}를 한 사람으로 묶으면 $${n - 1}$명의 원순열: $(${n - 1}-1)! = ${factorial(n - 2)}$`,
                `묶음 안에서 두 사람이 자리를 바꾸는 경우 $2! = 2$`,
                `$${factorial(n - 2)} \\times 2 = ${ans}$`,
              ],
              hint: '이웃하는 두 사람을 하나로 묶어 생각하세요.',
            };
          }
          const v = r.int(0, 2);
          if (v === 0) {
            const n = r.int(5, 8);
            const [a, b] = r.sample(NAMES, 2);
            const all = factorial(n - 1);
            const adj = factorial(n - 2) * 2;
            return {
              q: `${a}, ${b}를 포함한 ${n}명이 원탁에 둘러앉을 때, ${a}와 ${b}가 서로 **이웃하지 않게** 앉는 경우의 수를 구하세요.`,
              answer: { type: 'num', value: all - adj, unit: '가지' },
              steps: [`전체: $(${n}-1)! = ${all}$`, `이웃하는 경우: $(${n - 2})! \\times 2 = ${adj}$`, `$${all} - ${adj} = ${all - adj}$`],
            };
          }
          if (v === 1) {
            const m = r.int(3, 5);
            const ans = factorial(m - 1) * factorial(m);
            return {
              q: `남학생 ${m}명과 여학생 ${m}명이 원탁에 둘러앉을 때, 남학생과 여학생이 **교대로** 앉는 경우의 수를 구하세요.`,
              answer: { type: 'num', value: ans, unit: '가지' },
              steps: [`남학생 ${m}명을 먼저 원탁에 앉히면 $(${m}-1)! = ${factorial(m - 1)}$`, `남학생 사이사이 ${m}개의 자리에 여학생을 앉히면 $${m}! = ${factorial(m)}$`, `$${factorial(m - 1)} \\times ${factorial(m)} = ${ans}$`],
            };
          }
          const [sides, per] = r.pick([
            [4, 2],
            [3, 2],
            [3, 3],
          ] as [number, number][]);
          const n = sides * per;
          const ans = factorial(n - 1) * per;
          const shape = sides === 4 ? '정사각형' : '정삼각형';
          return {
            q: `${shape} 모양의 탁자의 각 변에 ${per}명씩, 모두 ${n}명이 둘러앉는 경우의 수를 구하세요. (회전하여 일치하는 것은 같은 것으로 봅니다.)`,
            answer: { type: 'num', value: ans, unit: '가지' },
            steps: [
              `원순열의 수: $(${n}-1)! = ${factorial(n - 1)}$`,
              `${shape} 탁자는 원순열 한 가지마다 회전시켜 서로 다른 배열이 ${per}가지씩 생깁니다.`,
              `$${factorial(n - 1)} \\times ${per} = ${ans}$`,
            ],
            hint: '원탁이라면 몇 가지인지 먼저 구하세요.',
          };
        },
      },
      {
        id: 'rep-perm',
        title: '중복순열',
        gen(r, level) {
          if (level === 1) {
            const n = r.int(2, 5);
            const k = r.int(2, 4);
            const ans = n ** k;
            return {
              q: `$${PItex(n, k)}$ 의 값은?`,
              answer: numChoices(r, ans, [nPr(n, k), nCr(n, k), k ** n, n * k, n ** (k - 1)]),
              steps: [`$${PItex(n, k)} = ${n}^{${k}} = ${ans}$`],
              hint: '$' + PItex('n', 'r') + ' = n^{r}$',
            };
          }
          if (level === 2) {
            if (r.chance(0.5)) {
              const n = r.int(2, 5);
              const k = r.int(3, 5);
              const name = r.pick(NAMES);
              return {
                q: `${name}가 서로 다른 편지 ${k}통을 우체통 ${n}개에 넣는 경우의 수를 구하세요. (한 우체통에 여러 통을 넣어도 됩니다.)`,
                answer: { type: 'num', value: n ** k, unit: '가지' },
                steps: [`편지 한 통마다 우체통을 ${n}가지로 고를 수 있습니다.`, `$${PItex(n, k)} = ${n}^{${k}} = ${n ** k}$`],
              };
            }
            const m = r.int(3, 4);
            const n = r.int(2, 4);
            return {
              q: `두 집합 $X=\\{${Array.from({ length: m }, (_, i) => i + 1).join(',')}\\}$, $Y=\\{${['a', 'b', 'c', 'd'].slice(0, n).join(',')}\\}$ 에 대하여 $X$ 에서 $Y$ 로의 함수의 개수를 구하세요.`,
              answer: { type: 'num', value: n ** m, unit: '개' },
              steps: [`$X$ 의 원소 ${m}개가 각각 $Y$ 의 원소 ${n}개 중 하나에 대응합니다.`, `$${PItex(n, m)} = ${n}^{${m}} = ${n ** m}$`],
            };
          }
          const k = r.int(3, 5);
          const len = r.int(3, 4);
          const digits = Array.from({ length: k + 1 }, (_, i) => i);
          const odd = r.chance(0.5);
          const lastCnt = digits.filter((d) => (odd ? d % 2 === 1 : d % 2 === 0)).length;
          const ans = k * (k + 1) ** (len - 2) * lastCnt;
          return {
            q: `숫자 $${digits.join(', ')}$ 중에서 중복을 허락하여 만들 수 있는 ${len}자리 자연수 중 **${odd ? '홀수' : '짝수'}**의 개수를 구하세요.`,
            answer: { type: 'num', value: ans, unit: '개' },
            steps: [
              `맨 앞자리: $0$ 을 제외한 $${k}$가지`,
              `일의 자리: ${odd ? '홀수' : '짝수'}인 숫자 $${lastCnt}$가지`,
              `가운데 ${len - 2}자리: $${PItex(k + 1, len - 2)} = ${(k + 1) ** (len - 2)}$`,
              `$${k} \\times ${(k + 1) ** (len - 2)} \\times ${lastCnt} = ${ans}$`,
            ],
            hint: '맨 앞자리에는 0이 올 수 없어요.',
          };
        },
      },
      {
        id: 'same-perm',
        title: '같은 것이 있는 순열·최단 경로',
        gen(r, level) {
          if (level === 1) {
            const word = r.pick(['banana', 'apple', 'letter', 'tomato', 'school', 'coffee', 'google', 'success', 'cheese', 'pepper']);
            const cnt: Record<string, number> = {};
            for (const ch of word) cnt[ch] = (cnt[ch] ?? 0) + 1;
            const reps = Object.entries(cnt).filter(([, c]) => c > 1);
            const den = reps.reduce((a, [, c]) => a * factorial(c), 1);
            const ans = factorial(word.length) / den;
            return {
              q: `영어 단어 ${word} 의 ${word.length}개 문자를 모두 일렬로 나열하는 경우의 수를 구하세요.`,
              answer: { type: 'num', value: ans, unit: '가지' },
              steps: [
                `같은 문자: ${reps.map(([ch, c]) => `${ch} ${c}개`).join(', ')}`,
                `$\\frac{${word.length}!}{${reps.map(([, c]) => `${c}!`).join('\\,')}} = \\frac{${factorial(word.length)}}{${den}} = ${ans}$`,
              ],
              hint: '같은 문자끼리는 자리를 바꿔도 같은 배열이에요.',
            };
          }
          const m = r.int(3, 5);
          const n = r.int(2, 4);
          if (level === 2) {
            const ans = nCr(m + n, m);
            return {
              q: `그림과 같은 도로망에서 A 지점에서 B 지점까지 최단 거리로 가는 경우의 수를 구하세요.`,
              fig: gridFig(m, n),
              answer: { type: 'num', value: ans, unit: '가지' },
              steps: [`오른쪽으로 $${m}$번(→), 위쪽으로 $${n}$번(↑) 가야 합니다.`, `→ ${m}개, ↑ ${n}개를 나열하는 경우: $\\frac{${m + n}!}{${m}!\\,${n}!} = ${ans}$`],
            };
          }
          const p = r.int(1, m - 1);
          const q = r.int(1, n - 1);
          const a1 = nCr(p + q, p);
          const a2 = nCr(m - p + n - q, m - p);
          const avoid = r.chance(0.4);
          const all = nCr(m + n, m);
          const ans = avoid ? all - a1 * a2 : a1 * a2;
          return {
            q: `그림과 같은 도로망에서 A 지점에서 B 지점까지 최단 거리로 갈 때, P 지점을 ${avoid ? '**지나지 않는**' : '반드시 지나는'} 경우의 수를 구하세요.`,
            fig: gridFig(m, n, [p, q]),
            answer: { type: 'num', value: ans, unit: '가지' },
            steps: [
              `A → P: $\\frac{${p + q}!}{${p}!\\,${q}!} = ${a1}$`,
              `P → B: $\\frac{${m - p + n - q}!}{${m - p}!\\,${n - q}!} = ${a2}$`,
              avoid ? `전체 $\\frac{${m + n}!}{${m}!\\,${n}!} = ${all}$ 에서 빼면 $${all} - ${a1}\\times${a2} = ${ans}$` : `$${a1} \\times ${a2} = ${ans}$`,
            ],
          };
        },
      },
      {
        id: 'rep-comb',
        title: '중복조합',
        gen(r, level) {
          if (level === 1) {
            const n = r.int(2, 5);
            const k = r.int(2, 5);
            const ans = nCr(n + k - 1, k);
            const what = r.pick(['사과, 배, 감, 귤, 포도', '빨강, 파랑, 노랑, 초록, 보라']).split(', ').slice(0, n);
            return {
              q: `${what.join(', ')} ${n}종류에서 중복을 허락하여 ${k}개를 택하는 경우의 수를 구하세요. (같은 종류끼리는 구별하지 않습니다.)`,
              answer: { type: 'num', value: ans, unit: '가지' },
              steps: [`$${Htex(n, k)} = ${Ctex(n + k - 1, k)} = ${ans}$`],
              hint: '$' + Htex('n', 'r') + ' = ' + Ctex('n+r-1', 'r') + '$',
            };
          }
          if (level === 2) {
            const vars = r.pick([3, 4]);
            const N = r.int(4, 9);
            const names = ['x', 'y', 'z', 'w'].slice(0, vars);
            const pos = r.chance(0.5);
            const eq = `${names.join('+')}=${N}`;
            if (pos) {
              const ans = nCr(N - 1, vars - 1);
              return {
                q: `방정식 $${eq}$ 를 만족시키는 **양의 정수** $${names.join(', ')}$ 의 순서쌍의 개수를 구하세요.`,
                answer: { type: 'num', value: ans, unit: '개' },
                steps: [
                  `${names.map((v) => `$${v}=${v}'+1$`).join(', ')} 로 놓으면 $${names.map((v) => v + "'").join('+')}=${N - vars}$ (음이 아닌 정수)`,
                  `$${Htex(vars, N - vars)} = ${Ctex(N - 1, N - vars)} = ${ans}$`,
                ],
              };
            }
            const ans = nCr(N + vars - 1, N);
            return {
              q: `방정식 $${eq}$ 를 만족시키는 **음이 아닌 정수** $${names.join(', ')}$ 의 순서쌍의 개수를 구하세요.`,
              answer: { type: 'num', value: ans, unit: '개' },
              steps: [`${vars}개의 문자에서 중복을 허락하여 ${N}개를 택하는 것과 같습니다.`, `$${Htex(vars, N)} = ${Ctex(N + vars - 1, N)} = ${ans}$`],
            };
          }
          const v = r.int(0, 2);
          if (v === 0) {
            const n = r.int(4, 8);
            const ans = nCr(n + 2, n);
            return {
              q: `$(a+b+c)^{${n}}$ 의 전개식에서 서로 다른 항의 개수를 구하세요.`,
              answer: { type: 'num', value: ans, unit: '개' },
              steps: [`각 항은 $a^{p}b^{q}c^{r}$ $(p+q+r=${n})$ 꼴입니다.`, `$${Htex(3, n)} = ${Ctex(n + 2, n)} = ${ans}$`],
            };
          }
          if (v === 1) {
            const a = r.int(1, 2);
            const b = r.int(1, 3);
            const N = r.int(a + b + 3, a + b + 8);
            const rest = N - a - b;
            const ans = nCr(rest + 2, 2);
            return {
              q: `방정식 $x+y+z=${N}$ 을 만족시키는 정수 $x, y, z$ 중에서 $x\\ge ${a}$, $y\\ge ${b}$, $z\\ge 0$ 인 순서쌍 $(x, y, z)$ 의 개수를 구하세요.`,
              answer: { type: 'num', value: ans, unit: '개' },
              steps: [`$x=x'+${a}$, $y=y'+${b}$ 로 놓으면 $x'+y'+z=${rest}$ (음이 아닌 정수)`, `$${Htex(3, rest)} = ${Ctex(rest + 2, rest)} = ${ans}$`],
            };
          }
          const N = r.int(3, 7);
          const ans = nCr(N + 3, 3);
          return {
            q: `부등식 $x+y+z\\le ${N}$ 을 만족시키는 음이 아닌 정수 $x, y, z$ 의 순서쌍의 개수를 구하세요.`,
            answer: { type: 'num', value: ans, unit: '개' },
            steps: [`새 변수 $w\\ge0$ 을 넣어 $x+y+z+w=${N}$ 으로 바꿉니다.`, `$${Htex(4, N)} = ${Ctex(N + 3, N)} = ${ans}$`],
            hint: '남는 양을 나타내는 변수를 하나 더 만들어 보세요.',
          };
        },
      },
      {
        id: 'symbol-value',
        title: '기호의 값과 방정식',
        gen(r, level) {
          if (level === 1) {
            const n = r.int(2, 6);
            const k = r.int(2, 5);
            const val = nCr(n + k - 1, k);
            const right = Ctex(n + k - 1, k);
            const cand: [number, number][] = [
              [n + k, k],
              [n + k - 1, k - 1],
              [n + k - 2, k],
              [n, k],
              [n + k, k - 1],
              [n + k + 1, k],
            ];
            const wrongs = cand.filter(([a, b]) => b <= a && nCr(a, b) !== val).map(([a, b]) => Ctex(a, b));
            return {
              q: `$${Htex(n, k)}$ 와 값이 같은 것은?`,
              answer: makeChoices(r, `$${right}$`, wrongs.map((w) => `$${w}$`), 4),
              steps: [`$${Htex('n', 'r')} = ${Ctex('n+r-1', 'r')}$ 이므로`, `$${Htex(n, k)} = ${right} = ${val}$`],
            };
          }
          if (level === 2) {
            const a = r.int(2, 4);
            const b = r.int(2, 3);
            const c = r.int(2, 4);
            const d = r.int(2, 4);
            const ans = a ** b + nCr(c + d - 1, d);
            return {
              q: `$${PItex(a, b)} + ${Htex(c, d)}$ 의 값은?`,
              answer: numChoices(r, ans, [nPr(a, b) + nCr(c, d), a ** b + nCr(c + d, d), b ** a + nCr(c + d - 1, d), nPr(a, b) + nCr(c + d - 1, d)]),
              steps: [`$${PItex(a, b)} = ${a}^{${b}} = ${a ** b}$`, `$${Htex(c, d)} = ${Ctex(c + d - 1, d)} = ${nCr(c + d - 1, d)}$`, `합: $${ans}$`],
            };
          }
          const n = r.int(3, 9);
          const val = nCr(n + 1, 2);
          return {
            q: `$${Htex('n', 2)} = ${val}$ 을 만족시키는 자연수 $n$ 의 값은?`,
            answer: numChoices(r, n, [n + 1, n - 1, n + 2, n - 2]),
            steps: [`$${Htex('n', 2)} = ${Ctex('n+1', 2)} = \\frac{(n+1)n}{2}$`, `$\\frac{(n+1)n}{2} = ${val}$ 에서 $n(n+1) = ${2 * val}$`, `$n = ${n}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── pst-2 이항정리
  'pst-2': {
    concepts: [
      {
        title: '이항정리',
        body: '$$(a+b)^{n} = ' + Ctex('n', 0) + 'a^{n} + ' + Ctex('n', 1) + 'a^{n-1}b + \\cdots + ' + Ctex('n', 'r') + 'a^{n-r}b^{r} + \\cdots + ' + Ctex('n', 'n') + 'b^{n}$$\n- 일반항: $' + Ctex('n', 'r') + 'a^{n-r}b^{r}$\n- $' + Ctex('n', 'r') + '$ 을 **이항계수**라고 해요. ($n$개의 괄호 중 $b$ 를 고를 괄호 $r$개를 택하는 수)',
        example: { q: '$(x+2)^{5}$ 에서 $x^{3}$ 의 계수', a: '$' + Ctex(5, 2) + '\\cdot 2^{2} = 40$' },
      },
      {
        title: '파스칼의 삼각형',
        body: '이항계수를 삼각형 모양으로 늘어놓으면 이웃한 두 수의 합이 아래 수가 돼요.\n$$' + Ctex('n-1', 'r-1') + ' + ' + Ctex('n-1', 'r') + ' = ' + Ctex('n', 'r') + '$$\n- 좌우 대칭: $' + Ctex('n', 'r') + ' = ' + Ctex('n', 'n-r') + '$',
      },
      {
        title: '이항계수의 성질',
        body: '$(1+x)^{n}$ 에 $x=1$, $x=-1$ 을 대입하면\n- $' + Ctex('n', 0) + '+' + Ctex('n', 1) + '+\\cdots+' + Ctex('n', 'n') + ' = 2^{n}$\n- $' + Ctex('n', 0) + '-' + Ctex('n', 1) + '+' + Ctex('n', 2) + '-\\cdots = 0$\n- $' + Ctex('n', 0) + '+' + Ctex('n', 2) + '+\\cdots = ' + Ctex('n', 1) + '+' + Ctex('n', 3) + '+\\cdots = 2^{n-1}$',
      },
      {
        title: '전개식의 특정한 항',
        body: '일반항을 쓰고 $x$ 의 지수를 원하는 값과 같게 놓아 $r$ 을 구해요.\n- $\\left(x+\\frac{a}{x}\\right)^{n}$ 의 일반항: $' + Ctex('n', 'r') + 'a^{r}x^{n-2r}$ → 상수항은 $n-2r=0$',
      },
    ],
    skills: [
      {
        id: 'coef',
        title: '전개식의 계수',
        gen(r, level) {
          if (level <= 2) {
            const n = level === 1 ? r.int(3, 6) : r.int(4, 7);
            const a = level === 1 ? 1 : r.pick([1, 2, 3]);
            const b = level === 1 ? r.int(1, 3) : r.nonzero(-3, 3);
            const k = r.int(1, n - 1);
            const rr = n - k; // b 의 지수
            const ans = nCr(n, rr) * a ** k * b ** rr;
            const base = `(${a === 1 ? '' : a}x${b > 0 ? '+' : ''}${b})^{${n}}`;
            const xk = k === 1 ? 'x' : `x^{${k}}`;
            const steps = [
              `일반항: $${Ctex(n, 'r')}(${a === 1 ? '' : a}x)^{${n}-r}(${b})^{r}$`,
              `$${xk}$ 이려면 $${n}-r=${k}$, $r=${rr}$`,
              `$${Ctex(n, rr)}\\cdot ${a === 1 ? '' : `${a}^{${k}}\\cdot`}(${b})^{${rr}} = ${ans}$`,
            ];
            if (level === 1)
              return {
                q: `$${base}$ 의 전개식에서 $${xk}$ 의 계수를 구하세요.`,
                answer: { type: 'num', value: ans },
                steps,
              };
            return {
              q: `$${base}$ 의 전개식에서 $${xk}$ 의 계수는?`,
              answer: numChoices(r, ans, [nCr(n, rr) * b ** rr, nCr(n, k) * a ** rr * b ** k, -ans, nCr(n, rr) * a ** k * Math.abs(b) ** rr]),
              steps,
            };
          }
          // (x^p + a/x)^n 의 상수항 또는 x^k 계수
          const p = r.pick([1, 2]);
          const a = r.nonzero(-3, 3);
          const n = p === 1 ? r.pick([4, 6, 8]) : r.pick([3, 6]);
          // 일반항 C(n,r) x^{p(n-r)} a^r x^{-r} → 지수 pn - (p+1) r
          const rr = (p * n) / (p + 1);
          const ans = nCr(n, rr) * a ** rr;
          const xp = p === 1 ? 'x' : 'x^{2}';
          return {
            q: `$\\left(${xp}${a > 0 ? '+' : '-'}\\frac{${Math.abs(a)}}{x}\\right)^{${n}}$ 의 전개식에서 상수항을 구하세요.`,
            answer: { type: 'num', value: ans },
            steps: [
              `일반항: $${Ctex(n, 'r')}(${xp})^{${n}-r}\\left(\\frac{${a}}{x}\\right)^{r} = ${Ctex(n, 'r')}(${a})^{r}x^{${p * n}-${p + 1}r}$`,
              `$${p * n}-${p + 1}r = 0$ 에서 $r=${rr}$`,
              `$${Ctex(n, rr)}\\cdot(${a})^{${rr}} = ${ans}$`,
            ],
            hint: 'x 의 지수가 0 이 되는 r 을 찾으세요.',
          };
        },
      },
      {
        id: 'coef-product',
        title: '두 식의 곱의 전개식',
        gen(r, level) {
          const n = level === 1 ? r.int(3, 5) : r.int(4, 7);
          const c = level === 1 ? r.int(1, 3) : r.nonzero(-4, 4);
          const k = r.int(2, Math.min(n, 4));
          if (level <= 2) {
            // (x + c)(1 + x)^n 의 x^k 계수 = C(n,k-1) + c C(n,k)
            const ans = nCr(n, k - 1) + c * nCr(n, k);
            return {
              q: `$(x${c > 0 ? '+' : ''}${c})(1+x)^{${n}}$ 의 전개식에서 $x^{${k}}$ 의 계수를 구하세요.`,
              answer: { type: 'num', value: ans },
              steps: [
                `$x \\times$ ($(1+x)^{${n}}$ 의 $${k - 1 === 1 ? 'x' : `x^{${k - 1}}`}$ 항) $\\to$ $${Ctex(n, k - 1)} = ${nCr(n, k - 1)}$`,
                `$${c} \\times$ ($x^{${k}}$ 항) $\\to$ $${c}\\cdot${Ctex(n, k)} = ${c * nCr(n, k)}$`,
                `합: $${ans}$`,
              ],
            };
          }
          // (1+x)^m (1+ax)^? 대신 (1 + x)^n + (1+x)^{n+1} + ... 의 계수 → 하키스틱
          const a = r.int(2, 3);
          const b = a + r.int(2, 4);
          const kk = r.int(2, 3);
          let sum = 0;
          for (let m = a; m <= b; m++) sum += nCr(m, kk);
          const ans = sum;
          return {
            q: `$(1+x)^{${a}}+(1+x)^{${a + 1}}+\\cdots+(1+x)^{${b}}$ 의 전개식에서 $x^{${kk}}$ 의 계수를 구하세요.`,
            answer: { type: 'num', value: ans },
            steps: [
              `계수의 합: $${Ctex(a, kk)}+${Ctex(a + 1, kk)}+\\cdots+${Ctex(b, kk)}$`,
              `$${Ctex('m', 'r')} = ${Ctex('m+1', 'r+1')} - ${Ctex('m', 'r+1')}$ 를 이용하면 $${Ctex(b + 1, kk + 1)} - ${Ctex(a, kk + 1)}$`,
              `$${nCr(b + 1, kk + 1)} - ${nCr(a, kk + 1)} = ${ans}$`,
            ],
            hint: '파스칼의 삼각형 성질을 거꾸로 이용하세요.',
          };
        },
      },
      {
        id: 'binom-sum',
        title: '이항계수의 합',
        gen(r, level) {
          if (level === 1) {
            const n = r.int(4, 10);
            return {
              q: `$${Ctex(n, 0)}+${Ctex(n, 1)}+${Ctex(n, 2)}+\\cdots+${Ctex(n, n)}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: 2 ** n },
              steps: [`$(1+x)^{${n}}$ 에 $x=1$ 을 대입하면 합은 $2^{${n}}$`, `$2^{${n}} = ${2 ** n}$`],
            };
          }
          if (level === 2) {
            const n = r.int(5, 11);
            const v = r.int(0, 2);
            if (v === 0)
              return {
                q: `$${Ctex(n, 1)}+${Ctex(n, 2)}+\\cdots+${Ctex(n, n)}$ 의 값을 구하세요.`,
                answer: { type: 'num', value: 2 ** n - 1 },
                steps: [`전체 합 $2^{${n}}$ 에서 $${Ctex(n, 0)}=1$ 을 뺍니다.`, `$${2 ** n} - 1 = ${2 ** n - 1}$`],
              };
            const odd = v === 1;
            return {
              q: `$${odd ? `${Ctex(n, 1)}+${Ctex(n, 3)}+${Ctex(n, 5)}` : `${Ctex(n, 0)}+${Ctex(n, 2)}+${Ctex(n, 4)}`}+\\cdots$ 의 값을 구하세요.`,
              answer: { type: 'num', value: 2 ** (n - 1) },
              steps: [`$x=1$: 전체 합 $=2^{${n}}$, $x=-1$: 짝수 번째 합 $-$ 홀수 번째 합 $=0$`, `따라서 각각 $2^{${n - 1}} = ${2 ** (n - 1)}$`],
            };
          }
          if (r.chance(0.5)) {
            const n = r.int(3, 6);
            const a = r.pick([2, 3]);
            return {
              q: `$${Ctex(n, 0)}+${Ctex(n, 1)}\\cdot${a}+${Ctex(n, 2)}\\cdot${a}^{2}+\\cdots+${Ctex(n, n)}\\cdot${a}^{${n}}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: (1 + a) ** n },
              steps: [`$(1+x)^{${n}} = \\sum ${Ctex(n, 'r')}x^{r}$ 에 $x=${a}$ 를 대입`, `$(1+${a})^{${n}} = ${(1 + a) ** n}$`],
            };
          }
          const N = r.pick([100, 200, 500, 1000, 2000]);
          let n = 1;
          while (2 ** n - 1 <= N) n++;
          return {
            q: `$${Ctex('n', 1)}+${Ctex('n', 2)}+\\cdots+${Ctex('n', 'n')} > ${N}$ 을 만족시키는 자연수 $n$ 의 최솟값을 구하세요.`,
            answer: { type: 'num', value: n },
            steps: [`좌변 $= 2^{n}-1$`, `$2^{${n - 1}}-1 = ${2 ** (n - 1) - 1} \\le ${N}$, $2^{${n}}-1 = ${2 ** n - 1} > ${N}$`, `최솟값 $n = ${n}$`],
          };
        },
      },
      {
        id: 'pascal',
        title: '파스칼의 삼각형',
        gen(r, level) {
          if (level === 1) {
            const n = r.int(4, 9);
            const k = r.int(1, n - 2);
            const right = Ctex(n + 1, k + 1);
            return {
              q: `$${Ctex(n, k)}+${Ctex(n, k + 1)}$ 과 같은 것은?`,
              answer: makeChoices(
                r,
                `$${right}$`,
                ([[n, k + 2], [n + 1, k], [2 * n, 2 * k + 1], [n + 1, k + 2], [n + 2, k + 1], [n, k]] as [number, number][])
                  .filter(([a, b]) => b <= a && nCr(a, b) !== nCr(n + 1, k + 1))
                  .map(([a, b]) => `$${Ctex(a, b)}$`),
              ),
              steps: [`$${Ctex('n', 'r')}+${Ctex('n', 'r+1')} = ${Ctex('n+1', 'r+1')}$`, `따라서 $${right}$`],
            };
          }
          const k = r.int(2, 3);
          const n = r.int(k + 3, k + 7);
          const start = level === 2 ? k : k + 1;
          let s = 0;
          for (let m = start; m <= n; m++) s += nCr(m, k);
          return {
            q: `$${Ctex(start, k)}+${Ctex(start + 1, k)}+\\cdots+${Ctex(n, k)}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: s },
            steps:
              level === 2
                ? [`$${Ctex(k, k)} = ${Ctex(k + 1, k + 1)}$ 로 바꾸고 파스칼의 삼각형 성질을 차례로 적용하면`, `$${Ctex(n + 1, k + 1)} = ${s}$`]
                : [`$${Ctex(k, k)}$ 을 더하고 빼면 $(${Ctex(k, k)}+${Ctex(k + 1, k)}+\\cdots+${Ctex(n, k)}) - ${Ctex(k, k)}$`, `$= ${Ctex(n + 1, k + 1)} - 1 = ${nCr(n + 1, k + 1)} - 1 = ${s}$`],
            hint: '$' + Ctex('r', 'r') + ' = ' + Ctex('r+1', 'r+1') + '$ 로 바꾸어 이웃한 두 항씩 합쳐 보세요.',
          };
        },
      },
      {
        id: 'find-param',
        title: '계수로 미지수 구하기',
        gen(r, level) {
          if (level <= 2) {
            const n = r.int(4, 8);
            const a = r.int(2, level === 1 ? 3 : 5);
            const k = level === 1 ? 2 : r.int(2, 3);
            const val = nCr(n, k) * a ** k;
            return {
              q: `$(1+ax)^{${n}}$ 의 전개식에서 $x^{${k}}$ 의 계수가 $${val}$ 일 때, 양수 $a$ 의 값을 구하세요.`,
              answer: { type: 'num', value: a },
              steps: [`$x^{${k}}$ 의 계수: $${Ctex(n, k)}a^{${k}} = ${nCr(n, k)}a^{${k}}$`, `$${nCr(n, k)}a^{${k}} = ${val}$ 에서 $a^{${k}} = ${a ** k}$`, `$a = ${a}$`],
            };
          }
          const n = r.pick([4, 6, 8]);
          const a = r.int(1, 4);
          const rr = n / 2;
          const val = nCr(n, rr) * a ** rr;
          return {
            q: `$\\left(x+\\frac{a}{x}\\right)^{${n}}$ 의 전개식에서 상수항이 $${val}$ 일 때, 양수 $a$ 의 값을 구하세요.`,
            answer: { type: 'num', value: a },
            steps: [`일반항 $${Ctex(n, 'r')}a^{r}x^{${n}-2r}$ 에서 상수항은 $r=${rr}$`, `$${Ctex(n, rr)}a^{${rr}} = ${val}$ 에서 $a^{${rr}} = ${a ** rr}$`, `$a=${a}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── pst-3 확률의 뜻과 활용
  'pst-3': {
    concepts: [
      {
        title: '시행과 사건',
        body: '같은 조건에서 반복할 수 있고 결과가 우연에 의해 정해지는 실험·관찰을 **시행**, 일어날 수 있는 모든 결과의 집합을 **표본공간** $S$, 그 부분집합을 **사건**이라 해요.\n- $A\\cap B=\\varnothing$ 이면 $A$, $B$ 는 서로 **배반사건**\n- $A$ 가 일어나지 않는 사건이 **여사건** $A^{C}$',
      },
      {
        title: '수학적 확률',
        body: '표본공간의 각 결과가 일어날 가능성이 같을 때\n$$P(A) = \\frac{n(A)}{n(S)}$$\n- $0\\le P(A)\\le 1$, $P(S)=1$, $P(\\varnothing)=0$\n- 순열·조합으로 경우의 수를 세어 확률을 구해요. (중2 확률의 확장)',
        example: { q: '두 주사위를 던져 눈의 합이 7일 확률', a: '$\\frac{6}{36} = \\frac{1}{6}$' },
      },
      {
        title: '확률의 덧셈정리',
        body: '$$P(A\\cup B) = P(A)+P(B)-P(A\\cap B)$$\n- 배반사건이면 $P(A\\cup B) = P(A)+P(B)$',
      },
      {
        title: '여사건의 확률',
        body: '$$P(A^{C}) = 1-P(A)$$\n- "적어도 하나", "~이 아닌" 같은 조건은 여사건으로 구하면 쉬워요.',
        example: { q: '동전 3개를 던질 때 적어도 하나는 앞면일 확률', a: '$1-\\frac{1}{8} = \\frac{7}{8}$' },
      },
    ],
    skills: [
      {
        id: 'dice',
        title: '주사위의 확률',
        gen(r, level) {
          let cond: (a: number, b: number) => boolean;
          let desc: string;
          if (level === 1) {
            const k = r.int(3, 11);
            cond = (a, b) => a + b === k;
            desc = `나오는 눈의 수의 합이 $${k}$`;
          } else if (level === 2) {
            const v = r.int(0, 2);
            if (v === 0) {
              const m = r.pick([3, 4, 5]);
              cond = (a, b) => (a + b) % m === 0;
              desc = `나오는 눈의 수의 합이 $${m}$ 의 배수`;
            } else if (v === 1) {
              const k = r.int(1, 4);
              cond = (a, b) => Math.abs(a - b) === k;
              desc = `나오는 눈의 수의 차가 $${k}$`;
            } else {
              const m = r.pick([3, 4, 6]);
              cond = (a, b) => (a * b) % m === 0;
              desc = `나오는 눈의 수의 곱이 $${m}$ 의 배수`;
            }
          } else {
            const k = r.int(4, 9);
            let cnt = 0;
            for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) for (let c = 1; c <= 6; c++) if (a + b + c === k) cnt++;
            const p = fr(cnt, 216);
            return {
              q: `주사위 한 개를 세 번 던질 때, 나오는 눈의 수의 합이 $${k}$ 일 확률을 구하세요.`,
              answer: fAns(p),
              steps: [
                `전체 경우의 수: $6^{3} = 216$`,
                `$a+b+c=${k}$ ($1\\le a,b,c\\le6$) 인 경우: $a=a'+1$ 등으로 놓으면 $a'+b'+c'=${k - 3}$ 의 음이 아닌 정수해 $${Htex(3, k - 3)} = ${cnt}$ 가지 ${k - 3 > 5 ? '(6 초과인 경우 제외)' : ''}`,
                `확률: $${ratio(cnt, 216)}$`,
              ],
            };
          }
          let cnt = 0;
          const list: string[] = [];
          for (let a = 1; a <= 6; a++)
            for (let b = 1; b <= 6; b++)
              if (cond(a, b)) {
                cnt++;
                list.push(`(${a},${b})`);
              }
          const p = fr(cnt, 36);
          return {
            q: `서로 다른 두 개의 주사위를 동시에 던질 때, ${desc}일 확률을 구하세요.`,
            answer: fAns(p),
            steps: [`전체 경우의 수: $6\\times6=36$`, `조건을 만족하는 경우: ${cnt <= 8 ? `$${list.join(', ')}$ 의 ` : ''}$${cnt}$가지`, `확률: $${ratio(cnt, 36)}$`],
          };
        },
      },
      {
        id: 'draw',
        title: '공 꺼내기 (조합 이용)',
        gen(r, level) {
          if (level <= 2) {
            const a = r.int(2, 6);
            const b = r.int(2, 6);
            const k = level === 1 ? 2 : 3;
            const j = r.int(Math.max(0, k - b) || (level === 1 ? 1 : 0), Math.min(k, a));
            const num = nCr(a, j) * nCr(b, k - j);
            const den = nCr(a + b, k);
            const p = fr(num, den);
            return {
              q: `흰 공 ${a}개, 검은 공 ${b}개가 들어 있는 주머니에서 임의로 ${k}개의 공을 동시에 꺼낼 때, ${j === 0 ? '흰 공이 하나도 나오지 않을' : `흰 공이 ${j}개 나올`} 확률을 구하세요.`,
              answer: fAns(p),
              steps: [`전체: $${Ctex(a + b, k)} = ${den}$`, `흰 공 ${j}개, 검은 공 ${k - j}개: $${Ctex(a, j)}\\times${Ctex(b, k - j)} = ${num}$`, `확률: $\\frac{${num}}{${den}} = ${T(p)}$`],
            };
          }
          const [a, b, c] = [r.int(2, 4), r.int(2, 4), r.int(2, 4)];
          const den = nCr(a + b + c, 3);
          const diff = r.chance(0.5);
          const num = diff ? a * b * c : nCr(a, 3) + nCr(b, 3) + nCr(c, 3);
          const p = fr(num, den);
          return {
            q: `빨간 공 ${a}개, 파란 공 ${b}개, 노란 공 ${c}개가 들어 있는 주머니에서 임의로 3개의 공을 동시에 꺼낼 때, ${diff ? '세 공의 색이 모두 다를' : '세 공의 색이 모두 같을'} 확률은?`,
            answer: fChoices(r, p, [fr(num, (a + b + c) ** 3), fr(num, nPr(a + b + c, 3)), F.of(1).sub(p), fr(num + 1, den), fr(diff ? 6 * num : num, den * 2)]),
            steps: [
              `전체: $${Ctex(a + b + c, 3)} = ${den}$`,
              diff ? `색마다 하나씩: $${a}\\times${b}\\times${c} = ${num}$` : `$${Ctex(a, 3)}+${Ctex(b, 3)}+${Ctex(c, 3)} = ${num}$`,
              `확률: $\\frac{${num}}{${den}} = ${T(p)}$`,
            ],
          };
        },
      },
      {
        id: 'add-rule',
        title: '확률의 덧셈정리',
        gen(r, level) {
          const d = r.pick([6, 8, 10, 12]);
          const x = r.int(level === 3 ? 1 : 1, Math.floor(d / 4));
          const a = x + r.int(1, Math.floor(d / 3));
          const b = x + r.int(1, Math.floor(d / 3));
          const u = a + b - x; // ≤ d ?
          if (u > d) return this.gen(r, level);
          const PA = fr(a, d),
            PB = fr(b, d),
            PX = fr(x, d),
            PU = fr(u, d);
          if (level === 1) {
            return {
              q: `두 사건 $A$, $B$ 에 대하여 $P(A)=${T(PA)}$, $P(B)=${T(PB)}$, $P(A\\cap B)=${T(PX)}$ 일 때, $P(A\\cup B)$ 는?`,
              answer: fChoices(r, PU, [PA.add(PB), PA.add(PB).add(PX), PA.mul(PB), F.of(1).sub(PU)]),
              steps: [`$P(A\\cup B) = P(A)+P(B)-P(A\\cap B)$`, `$= ${T(PA)}+${T(PB)}-${T(PX)} = ${T(PU)}$`],
            };
          }
          if (level === 2) {
            return {
              q: `두 사건 $A$, $B$ 에 대하여 $P(A)=${T(PA)}$, $P(B^{C})=${T(F.of(1).sub(PB))}$, $P(A\\cup B)=${T(PU)}$ 일 때, $P(A\\cap B)$ 를 구하세요.`,
              answer: fAns(PX),
              steps: [`$P(B) = 1-P(B^{C}) = ${T(PB)}$`, `$P(A\\cap B) = P(A)+P(B)-P(A\\cup B) = ${T(PA)}+${T(PB)}-${T(PU)} = ${T(PX)}$`],
            };
          }
          const E = F.of(1).sub(PU);
          const AnotB = PA.sub(PX);
          return {
            q: `두 사건 $A$, $B$ 에 대하여 $P(A)=${T(PA)}$, $P(B)=${T(PB)}$, $P(A^{C}\\cap B^{C})=${T(E)}$ 일 때, $P(A\\cap B^{C})$ 를 구하세요.`,
            answer: fAns(AnotB),
            steps: [
              `드모르간 법칙: $P(A^{C}\\cap B^{C}) = P((A\\cup B)^{C}) = 1-P(A\\cup B)$ → $P(A\\cup B) = ${T(PU)}$`,
              `$P(A\\cap B) = ${T(PA)}+${T(PB)}-${T(PU)} = ${T(PX)}$`,
              `$P(A\\cap B^{C}) = P(A)-P(A\\cap B) = ${T(AnotB)}$`,
            ],
            hint: '$A^{C}\\cap B^{C} = (A\\cup B)^{C}$',
          };
        },
      },
      {
        id: 'complement',
        title: '여사건의 확률',
        gen(r, level) {
          if (level === 1) {
            const n = r.int(2, 6);
            const p = F.of(1).sub(fr(1, 2 ** n));
            return {
              q: `동전 ${n}개를 동시에 던질 때, 적어도 한 개는 앞면이 나올 확률을 구하세요.`,
              answer: fAns(p),
              steps: [`여사건: 모두 뒷면 → $\\left(\\frac{1}{2}\\right)^{${n}} = \\frac{1}{${2 ** n}}$`, `$1-\\frac{1}{${2 ** n}} = ${T(p)}$`],
            };
          }
          if (level === 2) {
            const a = r.int(2, 5);
            const b = r.int(3, 6);
            const k = r.int(2, 3);
            const q = fr(nCr(b, k), nCr(a + b, k));
            const p = F.of(1).sub(q);
            return {
              q: `흰 공 ${a}개, 검은 공 ${b}개가 들어 있는 주머니에서 임의로 ${k}개의 공을 동시에 꺼낼 때, 흰 공이 적어도 한 개 나올 확률을 구하세요.`,
              answer: fAns(p),
              steps: [`여사건: 모두 검은 공 → $\\frac{${Ctex(b, k)}}{${Ctex(a + b, k)}} = \\frac{${nCr(b, k)}}{${nCr(a + b, k)}}$`, `$1-${T(q)} = ${T(p)}$`],
            };
          }
          if (r.chance(0.5)) {
            const n = r.int(4, 7);
            const [x, y] = r.sample(NAMES, 2);
            const p = F.of(1).sub(fr(2, n));
            return {
              q: `${x}, ${y}를 포함한 ${n}명이 일렬로 설 때, ${x}와 ${y}가 서로 이웃하지 않을 확률은?`,
              answer: fChoices(r, p, [fr(2, n), fr(1, n), F.of(1).sub(fr(1, n)), F.of(1).sub(fr(2, n * (n - 1)))]),
              steps: [`이웃할 확률: $\\frac{${n - 1}!\\times2!}{${n}!} = \\frac{2}{${n}}$`, `$1-\\frac{2}{${n}} = ${T(p)}$`],
            };
          }
          const N = r.int(7, 10);
          const k = r.int(2, 3);
          const odd = Math.ceil(N / 2);
          const even = Math.floor(N / 2);
          const q = fr(nCr(odd, k), nCr(N, k));
          const p = F.of(1).sub(q);
          return {
            q: `$1$ 부터 $${N}$ 까지의 자연수가 하나씩 적힌 카드 ${N}장 중에서 임의로 ${k}장을 동시에 뽑을 때, 짝수가 적힌 카드가 적어도 한 장 나올 확률은?`,
            answer: fChoices(r, p, [q, fr(nCr(even, k), nCr(N, k)), F.of(1).sub(fr(nCr(even, k), nCr(N, k))), fr(even, N)]),
            steps: [`홀수 카드 ${odd}장, 짝수 카드 ${even}장`, `여사건(모두 홀수): $\\frac{${Ctex(odd, k)}}{${Ctex(N, k)}} = ${T(q)}$`, `$1-${T(q)} = ${T(p)}$`],
          };
        },
      },
      {
        id: 'arrange',
        title: '순열을 이용한 확률',
        gen(r, level) {
          const n = r.int(4, 7);
          const [x, y] = r.sample(NAMES, 2);
          if (level === 1) {
            if (r.chance(0.5)) {
              const p = fr(2, n * (n - 1));
              return {
                q: `${x}, ${y}를 포함한 ${n}명이 일렬로 설 때, ${x}와 ${y}가 양 끝에 설 확률은?`,
                answer: fChoices(r, p, [fr(1, n * (n - 1)), fr(2, n), fr(1, n), fr(2, n - 1)]),
                steps: [`양 끝에 두 사람: $2!$, 나머지 $${n - 2}!$`, `$\\frac{2\\times${n - 2}!}{${n}!} = ${T(p)}$`],
              };
            }
            const p = fr(1, n);
            return {
              q: `${x}를 포함한 ${n}명이 일렬로 설 때, ${x}가 맨 앞에 설 확률은?`,
              answer: fChoices(r, p, [fr(1, n - 1), fr(1, factorial(n)), fr(2, n), fr(n - 1, n)]),
              steps: [`$\\frac{${n - 1}!}{${n}!} = \\frac{1}{${n}}$`],
            };
          }
          if (level === 2) {
            const p = fr(2, n);
            return {
              q: `${x}, ${y}를 포함한 ${n}명이 일렬로 설 때, ${x}와 ${y}가 서로 이웃할 확률은?`,
              answer: fChoices(r, p, [fr(1, n), fr(2, n * (n - 1)), fr(1, n - 1), F.of(1).sub(p)]),
              steps: [`두 사람을 묶으면 $${n - 1}!$, 묶음 안 $2!$`, `$\\frac{${n - 1}!\\times2}{${n}!} = \\frac{2}{${n}} = ${T(p)}$`],
            };
          }
          const m = r.int(2, 4);
          const w = r.int(2, 3);
          if (r.chance(0.5)) {
            const p = fr(factorial(m + 1) * factorial(w), factorial(m + w));
            return {
              q: `남학생 ${m}명, 여학생 ${w}명이 일렬로 설 때, 여학생끼리 모두 이웃하여 설 확률은?`,
              answer: fChoices(r, p, [fr(factorial(m) * factorial(w), factorial(m + w)), fr(factorial(m + 1), factorial(m + w)), fr(w, m + w), fr(factorial(m + 1) * factorial(w), factorial(m + w + 1))]),
              steps: [`여학생 ${w}명을 한 묶음으로: $(${m}+1)! \\times ${w}! = ${factorial(m + 1) * factorial(w)}$`, `전체 $${m + w}! = ${factorial(m + w)}$`, `확률: $${T(p)}$`],
            };
          }
          const k = r.int(3, 4);
          const p = fr(2 * factorial(k) * factorial(k), factorial(2 * k));
          return {
            q: `남학생 ${k}명, 여학생 ${k}명이 일렬로 설 때, 남학생과 여학생이 교대로 설 확률은?`,
            answer: fChoices(r, p, [fr(factorial(k) * factorial(k), factorial(2 * k)), fr(1, 2 * k), fr(2, nCr(2 * k, k) * 2), fr(4 * factorial(k) * factorial(k), factorial(2 * k))]),
            steps: [`남녀남녀… 또는 여남여남… 2가지, 각각 $${k}!\\times${k}!$`, `$\\frac{2\\times${k}!\\times${k}!}{${2 * k}!} = ${T(p)}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── pst-4 조건부확률
  'pst-4': {
    concepts: [
      {
        title: '조건부확률',
        body: '사건 $A$ 가 일어났을 때 사건 $B$ 가 일어날 확률:\n$$P(B\\mid A) = \\frac{P(A\\cap B)}{P(A)}\\quad (P(A)>0)$$\n- 표본공간을 $A$ 로 줄여서 생각하는 것과 같아요: $\\frac{n(A\\cap B)}{n(A)}$',
        example: { q: '$P(A)=\\frac{1}{2}$, $P(A\\cap B)=\\frac{1}{5}$ 일 때 $P(B\\mid A)$', a: '$\\frac{1/5}{1/2} = \\frac{2}{5}$' },
      },
      {
        title: '확률의 곱셈정리',
        body: '$$P(A\\cap B) = P(A)P(B\\mid A) = P(B)P(A\\mid B)$$\n- 비복원 추출에서 "첫째 ~, 둘째 ~" 확률을 차례로 곱해요.\n- 여러 경로로 일어나는 사건은 경로별 확률을 더해요(전확률).',
      },
      {
        title: '사건의 독립',
        body: '$P(B\\mid A) = P(B)$ 이면 $A$, $B$ 는 서로 **독립**이에요.\n$$A, B \\text{ 독립} \\iff P(A\\cap B) = P(A)P(B)$$\n- 독립이면 $A$ 와 $B^{C}$, $A^{C}$ 와 $B^{C}$ 도 독립\n- 배반(동시에 못 일어남)과 독립은 다른 개념이에요.',
      },
      {
        title: '독립시행의 확률',
        body: '같은 시행을 독립적으로 $n$번 반복할 때, 확률이 $p$ 인 사건이 $r$번 일어날 확률:\n$$' + Ctex('n', 'r') + 'p^{r}(1-p)^{n-r}$$',
        example: { q: '동전 4번 던져 앞면이 2번', a: '$' + Ctex(4, 2) + '\\left(\\frac{1}{2}\\right)^{4} = \\frac{3}{8}$' },
      },
    ],
    skills: [
      {
        id: 'cond-table',
        title: '표에서 조건부확률',
        gen(r, level) {
          const topic = r.pick([
            { g: ['남학생', '여학생'], c: ['찬성', '반대'], what: '어느 학급 학생들의 수학여행 장소 투표 결과' },
            { g: ['1학년', '2학년'], c: ['안경 씀', '안경 안 씀'], what: '어느 동아리 학생들의 안경 착용 조사 결과' },
            { g: ['남학생', '여학생'], c: ['버스', '도보'], what: '어느 반 학생들의 통학 방법 조사 결과' },
          ]);
          const a = r.int(4, 15),
            b = r.int(4, 15),
            c = r.int(4, 15),
            d = r.int(4, 15);
          const table = [
            ['구분', topic.c[0], topic.c[1], '합계'],
            [topic.g[0], `$${a}$`, `$${b}$`, `$${a + b}$`],
            [topic.g[1], `$${c}$`, `$${d}$`, `$${c + d}$`],
          ];
          if (level === 1) {
            const p = fr(c, a + c);
            return {
              q: `다음은 ${topic.what}입니다. 임의로 택한 한 명이 '${topic.c[0]}'일 때, 이 학생이 ${topic.g[1]}일 확률을 구하세요.`,
              table,
              answer: fAns(p),
              steps: [`'${topic.c[0]}' 인 학생: $${a}+${c} = ${a + c}$명`, `그중 ${topic.g[1]}: $${c}$명`, `$${ratio(c, a + c)}$`],
            };
          }
          if (level === 2) {
            const p = fr(b, a + b);
            const tot = a + b + c + d;
            return {
              q: `다음은 ${topic.what}입니다. 임의로 택한 한 명이 ${topic.g[0]}일 때, 이 학생이 '${topic.c[1]}'일 확률은?`,
              table,
              answer: fChoices(r, p, [fr(b, tot), fr(b, b + d), fr(a, a + b), fr(a + b, tot)]),
              steps: [`${topic.g[0]}: $${a + b}$명, 그중 '${topic.c[1]}': $${b}$명`, `$P = \\frac{${b}}{${a + b}} = ${T(p)}$`],
            };
          }
          // 미지수 x
          const x = r.int(3, 15);
          const p = fr(x, a + x);
          return {
            q: `다음은 ${topic.what}입니다. 임의로 택한 한 명이 '${topic.c[0]}'일 때 이 학생이 ${topic.g[1]}일 확률이 $${T(p)}$ 입니다. $x$ 의 값을 구하세요.`,
            table: [
              ['구분', topic.c[0], topic.c[1]],
              [topic.g[0], `$${a}$`, `$${b}$`],
              [topic.g[1], '$x$', `$${d}$`],
            ],
            answer: { type: 'num', value: x },
            steps: [`$P = \\frac{x}{${a}+x} = ${T(p)}$`, `$${p.d}x = ${p.n}(${a}+x)$ → $${p.d - p.n}x = ${p.n * a}$`, `$x = ${x}$`],
          };
        },
      },
      {
        id: 'cond-formula',
        title: '조건부확률 계산',
        gen(r, level) {
          const d = r.pick([10, 12, 20]);
          const x = r.int(1, d / 5);
          const a = x + r.int(1, d / 4);
          const b = x + r.int(1, d / 4);
          const PA = fr(a, d),
            PB = fr(b, d),
            PX = fr(x, d);
          if (level === 1) {
            const p = PX.div(PA);
            return {
              q: `두 사건 $A$, $B$ 에 대하여 $P(A)=${T(PA)}$, $P(A\\cap B)=${T(PX)}$ 일 때, $P(B\\mid A)$ 를 구하세요.`,
              answer: fAns(p),
              steps: [`$P(B\\mid A) = \\frac{P(A\\cap B)}{P(A)} = \\frac{${T(PX)}}{${T(PA)}} = ${T(p)}$`],
            };
          }
          if (level === 2) {
            const cond = PX.div(PB);
            const U = PA.add(PB).sub(PX);
            return {
              q: `두 사건 $A$, $B$ 에 대하여 $P(B)=${T(PB)}$, $P(A\\mid B)=${T(cond)}$, $P(A)=${T(PA)}$ 일 때, $P(A\\cup B)$ 는?`,
              answer: fChoices(r, U, [PA.add(PB), PA.add(PB).sub(cond), PX, F.of(1).sub(U), PA.add(cond)]),
              steps: [`$P(A\\cap B) = P(B)P(A\\mid B) = ${T(PB)}\\times${T(cond)} = ${T(PX)}$`, `$P(A\\cup B) = ${T(PA)}+${T(PB)}-${T(PX)} = ${T(U)}$`],
            };
          }
          const U = PA.add(PB).sub(PX);
          if (U.cmp(1) >= 0) return this.gen(r, level);
          const p = PA.sub(PX).div(F.of(1).sub(PB));
          return {
            q: `두 사건 $A$, $B$ 에 대하여 $P(A)=${T(PA)}$, $P(B)=${T(PB)}$, $P(A\\cup B)=${T(U)}$ 일 때, $P(A\\mid B^{C})$ 를 구하세요.`,
            answer: fAns(p),
            steps: [
              `$P(A\\cap B) = ${T(PA)}+${T(PB)}-${T(U)} = ${T(PX)}$`,
              `$P(A\\cap B^{C}) = P(A)-P(A\\cap B) = ${T(PA.sub(PX))}$, $P(B^{C}) = ${T(F.of(1).sub(PB))}$`,
              `$P(A\\mid B^{C}) = \\frac{${T(PA.sub(PX))}}{${T(F.of(1).sub(PB))}} = ${T(p)}$`,
            ],
          };
        },
      },
      {
        id: 'multiply',
        title: '곱셈정리와 전확률',
        gen(r, level) {
          const a = r.int(2, 6);
          const b = r.int(2, 6);
          const n = a + b;
          if (level === 1) {
            const p = fr(a * (a - 1), n * (n - 1));
            return {
              q: `흰 공 ${a}개, 검은 공 ${b}개가 들어 있는 주머니에서 공을 한 개씩 두 번 꺼낼 때(꺼낸 공은 다시 넣지 않음), 두 번 모두 흰 공일 확률을 구하세요.`,
              answer: fAns(p),
              steps: [`첫째 흰 공: $\\frac{${a}}{${n}}$, 그때 둘째도 흰 공: $\\frac{${a - 1}}{${n - 1}}$`, `$\\frac{${a}}{${n}}\\times\\frac{${a - 1}}{${n - 1}} = ${T(p)}$`],
            };
          }
          if (level === 2) {
            const p = fr(a, n);
            return {
              q: `흰 공 ${a}개, 검은 공 ${b}개가 들어 있는 주머니에서 공을 한 개씩 두 번 꺼낼 때(꺼낸 공은 다시 넣지 않음), 두 번째 꺼낸 공이 흰 공일 확률은?`,
              answer: fChoices(r, p, [fr(a - 1, n - 1), fr(a * (a - 1), n * (n - 1)), fr(a, n - 1), fr(b, n)]),
              steps: [
                `(흰, 흰): $\\frac{${a}}{${n}}\\cdot\\frac{${a - 1}}{${n - 1}}$, (검, 흰): $\\frac{${b}}{${n}}\\cdot\\frac{${a}}{${n - 1}}$`,
                `합: $\\frac{${a * (a - 1) + a * b}}{${n * (n - 1)}} = ${T(p)}$`,
              ],
            };
          }
          // 베이즈
          const k = r.pick([2, 3, 4]);
          const pA = fr(k, 6);
          const a1 = r.int(1, 5),
            b1 = r.int(1, 5),
            a2 = r.int(1, 5),
            b2 = r.int(1, 5);
          const wA = pA.mul(fr(a1, a1 + b1));
          const wB = F.of(1).sub(pA).mul(fr(a2, a2 + b2));
          const p = wA.div(wA.add(wB));
          return {
            q: `주사위를 던져 ${k} 이하의 눈이 나오면 주머니 A에서, 그렇지 않으면 주머니 B에서 공을 한 개 꺼냅니다. A에는 흰 공 ${a1}개·검은 공 ${b1}개, B에는 흰 공 ${a2}개·검은 공 ${b2}개가 들어 있습니다. 꺼낸 공이 흰 공일 때, 그 공이 주머니 A에서 나왔을 확률을 구하세요.`,
            answer: fAns(p),
            steps: [
              `A에서 흰 공: $${T(pA)}\\times\\frac{${a1}}{${a1 + b1}} = ${T(wA)}$`,
              `B에서 흰 공: $${T(F.of(1).sub(pA))}\\times\\frac{${a2}}{${a2 + b2}} = ${T(wB)}$`,
              `$P(A\\mid \\text{흰}) = \\frac{${T(wA)}}{${T(wA)}+${T(wB)}} = ${T(p)}$`,
            ],
            hint: '흰 공이 나오는 두 경로의 확률을 각각 구하세요.',
          };
        },
      },
      {
        id: 'independent',
        title: '사건의 독립',
        gen(r, level) {
          const PA = fr(r.int(1, 4), 5);
          const PB = fr(r.int(1, 3), r.pick([3, 4]));
          const X = PA.mul(PB);
          const U = PA.add(PB).sub(X);
          if (level === 1) {
            return {
              q: `두 사건 $A$, $B$ 가 서로 독립이고 $P(A)=${T(PA)}$, $P(B)=${T(PB)}$ 일 때, $P(A\\cap B)$ 를 구하세요.`,
              answer: fAns(X),
              steps: [`독립이므로 $P(A\\cap B) = P(A)P(B) = ${T(PA)}\\times${T(PB)} = ${T(X)}$`],
            };
          }
          if (level === 2) {
            return {
              q: `두 사건 $A$, $B$ 가 서로 독립이고 $P(A)=${T(PA)}$, $P(B)=${T(PB)}$ 일 때, $P(A\\cup B)$ 는?`,
              answer: fChoices(r, U, [PA.add(PB), X, F.of(1).sub(X), PA.add(PB).sub(fr(1, 10))]),
              steps: [`$P(A\\cap B) = ${T(PA)}\\times${T(PB)} = ${T(X)}$`, `$P(A\\cup B) = ${T(PA)}+${T(PB)}-${T(X)} = ${T(U)}$`],
            };
          }
          return {
            q: `두 사건 $A$, $B$ 가 서로 독립이고 $P(A)=${T(PA)}$, $P(A\\cup B)=${T(U)}$ 일 때, $P(B)$ 를 구하세요.`,
            answer: fAns(PB),
            steps: [`$P(B)=p$ 라 하면 $P(A\\cup B) = ${T(PA)}+p-${T(PA)}p$`, `$${T(U)} = ${T(PA)}+${T(F.of(1).sub(PA))}p$`, `$p = ${T(PB)}$`],
          };
        },
      },
      {
        id: 'bernoulli',
        title: '독립시행의 확률',
        gen(r, level) {
          if (level === 1) {
            const n = r.int(3, 6);
            const k = r.int(1, n - 1);
            const p = fr(nCr(n, k), 2 ** n);
            return {
              q: `동전 한 개를 ${n}번 던질 때, 앞면이 정확히 ${k}번 나올 확률을 구하세요.`,
              answer: fAns(p),
              steps: [`$${Ctex(n, k)}\\left(\\frac{1}{2}\\right)^{${k}}\\left(\\frac{1}{2}\\right)^{${n - k}} = ${ratio(nCr(n, k), 2 ** n)}$`],
            };
          }
          const ev = r.pick(DIE_EVENTS);
          const q = F.of(1).sub(ev.p);
          const n = r.int(3, 5);
          if (level === 2) {
            const k = r.int(1, n - 1);
            const p = binomP(n, k, ev.p);
            return {
              q: `주사위 한 개를 ${n}번 던질 때, ${ev.name} 횟수가 ${k}번일 확률은?`,
              answer: fChoices(r, p, [ev.p.pow(k).mul(q.pow(n - k)), binomP(n, n - k, ev.p), ev.p.pow(k), fr(k, n)]),
              steps: [`한 번 던질 때 확률 $p = ${T(ev.p)}$`, `$${Ctex(n, k)}\\left(${T(ev.p)}\\right)^{${k}}\\left(${T(q)}\\right)^{${n - k}} = ${T(p)}$`],
            };
          }
          const atLeast = r.int(1, 2);
          let s = new F(0);
          for (let k = 0; k < atLeast; k++) s = s.add(binomP(n, k, ev.p));
          const p = F.of(1).sub(s);
          return {
            q: `주사위 한 개를 ${n}번 던질 때, ${ev.name} 횟수가 ${atLeast}번 이상일 확률을 구하세요.`,
            answer: fAns(p),
            steps: [
              `여사건: ${atLeast === 1 ? '한 번도 안 나옴' : '0번 또는 1번'}`,
              atLeast === 1 ? `$\\left(${T(q)}\\right)^{${n}} = ${T(s)}$` : `$\\left(${T(q)}\\right)^{${n}} + ${Ctex(n, 1)}\\left(${T(ev.p)}\\right)\\left(${T(q)}\\right)^{${n - 1}} = ${T(s)}$`,
              `$1-${T(s)} = ${T(p)}$`,
            ],
          };
        },
      },
    ],
  },

  // ───────────────────────── pst-5 확률분포
  'pst-5': {
    concepts: [
      {
        title: '이산확률변수와 확률분포',
        body: '시행 결과에 따라 값이 정해지는 변수를 **확률변수**, 값이 셀 수 있을 만큼 떨어져 있으면 **이산확률변수**예요.\n- 확률질량함수 $P(X=x_i)=p_i$: $0\\le p_i\\le1$, $\\sum p_i = 1$\n- 표로 나타낸 것을 확률분포표라 해요.',
      },
      {
        title: '기댓값·분산·표준편차',
        body: '$$E(X) = \\sum x_ip_i,\\qquad V(X) = E(X^{2})-\\{E(X)\\}^{2},\\qquad \\sigma(X)=\\sqrt{V(X)}$$\n- 중3 자료의 평균·분산을 확률로 가중한 것이에요.',
        example: { q: '$X$ 가 $0,1,2$ 를 각각 확률 $\\frac14,\\frac12,\\frac14$ 로 가질 때 $E(X)$', a: '$0+\\frac12+\\frac12 = 1$' },
      },
      {
        title: '$aX+b$ 의 평균과 분산',
        body: '$$E(aX+b)=aE(X)+b,\\quad V(aX+b)=a^{2}V(X),\\quad \\sigma(aX+b)=|a|\\sigma(X)$$\n- 더하는 수 $b$ 는 흩어진 정도에 영향을 주지 않아요.',
      },
      {
        title: '이항분포',
        body: '확률이 $p$ 인 독립시행을 $n$번 할 때 일어난 횟수 $X$ 는 이항분포 $B(n, p)$ 를 따라요.\n$$P(X=r) = ' + Ctex('n', 'r') + 'p^{r}q^{n-r}\\ (q=1-p)$$\n$$E(X)=np,\\qquad V(X)=npq$$',
        example: { q: '$X\\sim B\\left(30, \\frac{1}{3}\\right)$ 의 평균과 분산', a: '$E=10$, $V=30\\cdot\\frac13\\cdot\\frac23 = \\frac{20}{3}$' },
      },
    ],
    skills: [
      {
        id: 'pmf-unknown',
        title: '확률질량함수의 미정계수',
        gen(r, level) {
          const m = r.int(3, 4);
          const xs = Array.from({ length: m }, (_, i) => i + 1);
          if (level <= 2) {
            const form = r.int(0, 2);
            const w = (x: number) => (form === 0 ? x : form === 1 ? x + 1 : x * x);
            const formTex = form === 0 ? 'kx' : form === 1 ? 'k(x+1)' : 'kx^{2}';
            const S = xs.reduce((s, x) => s + w(x), 0);
            const k = fr(1, S);
            if (level === 1)
              return {
                q: `확률변수 $X$ 의 확률질량함수가 $P(X=x) = ${formTex}$ $(x=${xs.join(', ')})$ 일 때, 상수 $k$ 의 값을 구하세요.`,
                answer: fAns(k),
                steps: [`확률의 합은 1: $k(${xs.map(w).join('+')}) = ${S}k = 1$`, `$k = ${T(k)}$`],
              };
            const t = r.int(2, m);
            const num = xs.filter((x) => x >= t).reduce((s, x) => s + w(x), 0);
            const p = fr(num, S);
            return {
              q: `확률변수 $X$ 의 확률질량함수가 $P(X=x) = ${formTex}$ $(x=${xs.join(', ')})$ 일 때, $P(X\\ge ${t})$ 는?`,
              answer: fChoices(r, p, [F.of(1).sub(p), fr(w(t), S), fr(num, S + 1), fr(m - t + 1, m)]),
              steps: [`$${S}k=1$ 에서 $k=${T(k)}$`, `$P(X\\ge${t}) = ${T(k)}(${xs.filter((x) => x >= t).map(w).join('+')}) = ${T(p)}$`],
            };
          }
          // k/(x(x+1))
          const k = fr(m + 1, m);
          const t = r.int(1, m - 1);
          const p = k.mul(F.of(1).sub(fr(1, t + 1)));
          return {
            q: `확률변수 $X$ 의 확률질량함수가 $P(X=x) = \\frac{k}{x(x+1)}$ $(x=${xs.join(', ')})$ 일 때, $P(X\\le ${t})$ 를 구하세요.`,
            answer: fAns(p),
            steps: [
              `$\\frac{1}{x(x+1)} = \\frac{1}{x}-\\frac{1}{x+1}$ 이므로 합은 $k\\left(1-\\frac{1}{${m + 1}}\\right) = 1$ → $k = ${T(k)}$`,
              `$P(X\\le${t}) = ${T(k)}\\left(1-\\frac{1}{${t + 1}}\\right) = ${T(p)}$`,
            ],
          };
        },
      },
      {
        id: 'expect-var',
        title: '기댓값과 분산',
        gen(r, level) {
          if (level <= 2) {
            const d = r.pick([6, 8, 10]);
            const m = r.int(3, 4);
            const start = r.int(0, 2);
            const xs = Array.from({ length: m }, (_, i) => start + i * r.pick([1, 1, 2]));
            const uniq = [...new Set(xs)].sort((a, b) => a - b);
            // 정수 가중치 합 d
            const ws = uniq.map(() => 1);
            let rest = d - uniq.length;
            while (rest > 0) {
              ws[r.int(0, uniq.length - 1)]++;
              rest--;
            }
            const ps = ws.map((w) => fr(w, d));
            const E = uniq.reduce((s, x, i) => s.add(ps[i].mul(x)), new F(0));
            const E2 = uniq.reduce((s, x, i) => s.add(ps[i].mul(x * x)), new F(0));
            const V = E2.sub(E.mul(E));
            const table = distTable(uniq, ps.map(T));
            if (level === 1)
              return {
                q: `확률변수 $X$ 의 확률분포가 다음 표와 같을 때, $E(X)$ 를 구하세요.`,
                table,
                answer: fAns(E),
                steps: [`$E(X) = ${uniq.map((x, i) => `${x}\\cdot${T(ps[i])}`).join('+')}$`, `$= ${T(E)}$`],
              };
            return {
              q: `확률변수 $X$ 의 확률분포가 다음 표와 같을 때, $V(X)$ 를 구하세요.`,
              table,
              answer: fAns(V),
              steps: [`$E(X) = ${T(E)}$`, `$E(X^{2}) = ${uniq.map((x, i) => `${x * x}\\cdot${T(ps[i])}`).join('+')} = ${T(E2)}$`, `$V(X) = ${T(E2)}-\\left(${T(E)}\\right)^{2} = ${T(V)}$`],
            };
          }
          // P(0)=p0 알려짐, P(1)=a, P(2)=b, E(X) 주어짐 → V(X)
          const d = r.pick([5, 8, 10]);
          const w0 = r.int(1, d - 2);
          const w2 = r.int(1, d - w0 - 1);
          const w1 = d - w0 - w2;
          const p0 = fr(w0, d),
            p1 = fr(w1, d),
            p2 = fr(w2, d);
          const E = p1.add(p2.mul(2));
          const E2 = p1.add(p2.mul(4));
          const V = E2.sub(E.mul(E));
          return {
            q: `확률변수 $X$ 의 확률분포가 다음 표와 같고 $E(X) = ${T(E)}$ 일 때, $V(X)$ 를 구하세요.`,
            table: distTable([0, 1, 2], [T(p0), 'a', 'b']),
            answer: fAns(V),
            steps: [`$${T(p0)}+a+b=1$, $a+2b=${T(E)}$`, `$b = ${T(E)}-${T(F.of(1).sub(p0))} = ${T(p2)}$, $a = ${T(p1)}$`, `$E(X^{2}) = a+4b = ${T(E2)}$`, `$V(X) = ${T(E2)}-\\left(${T(E)}\\right)^{2} = ${T(V)}$`],
          };
        },
      },
      {
        id: 'linear',
        title: '$aX+b$ 의 평균·분산',
        gen(r, level) {
          const m = r.int(-3, 8);
          const s = r.int(1, 5);
          const a = r.nonzero(-4, 5);
          const b = r.int(-6, 6);
          const Y = `${a === 1 ? '' : a === -1 ? '-' : a}X${b === 0 ? '' : b > 0 ? '+' + b : b}`;
          if (level === 1) {
            return {
              q: `확률변수 $X$ 에 대하여 $E(X)=${m}$, $V(X)=${s * s}$ 일 때, $E(${Y})$ 와 $V(${Y})$ 를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: `E(${Y})`, value: a * m + b }, { label: `V(${Y})`, value: a * a * s * s }] },
              steps: [`$E(${Y}) = ${a}\\times${m < 0 ? `(${m})` : m}${b === 0 ? '' : b > 0 ? '+' + b : b} = ${a * m + b}$`, `$V(${Y}) = (${a})^{2}\\times${s * s} = ${a * a * s * s}$`],
            };
          }
          if (level === 2) {
            return {
              q: `확률변수 $X$ 의 평균이 $${m}$, 표준편차가 $${s}$ 일 때, 확률변수 $${Y}$ 의 표준편차는?`,
              answer: numChoices(r, Math.abs(a) * s, [a * s, a * a * s, Math.abs(a) * s + b, a * a * s * s, Math.abs(a * s + b)].filter((v) => v !== Math.abs(a) * s)),
              steps: [`$\\sigma(aX+b) = |a|\\sigma(X)$`, `$|${a}|\\times${s} = ${Math.abs(a) * s}$`],
            };
          }
          const ex2 = s * s + m * m;
          return {
            q: `확률변수 $X$ 에 대하여 $E(X)=${m}$, $E(X^{2})=${ex2}$ 일 때, $V(${Y})$ 를 구하세요.`,
            answer: { type: 'num', value: a * a * s * s },
            steps: [`$V(X) = E(X^{2})-\\{E(X)\\}^{2} = ${ex2}-${m * m} = ${s * s}$`, `$V(${Y}) = ${a * a}\\times${s * s} = ${a * a * s * s}$`],
          };
        },
      },
      {
        id: 'binom-mean',
        title: '이항분포의 평균·분산',
        gen(r, level) {
          const p = r.pick([fr(1, 2), fr(1, 3), fr(2, 3), fr(1, 4), fr(3, 4), fr(1, 5), fr(2, 5), fr(1, 6)]);
          const n = p.d * r.int(level === 1 ? 2 : 3, level === 1 ? 10 : 20);
          const q = F.of(1).sub(p);
          const E = p.mul(n);
          const V = E.mul(q);
          if (level === 1)
            return {
              q: `확률변수 $X$ 가 이항분포 $B\\left(${n}, ${T(p)}\\right)$ 를 따를 때, $E(X)$ 와 $V(X)$ 를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'E(X)', value: E.value }, { label: 'V(X)', value: V.value }] },
              steps: [`$E(X) = np = ${n}\\times${T(p)} = ${T(E)}$`, `$V(X) = npq = ${T(E)}\\times${T(q)} = ${T(V)}$`],
            };
          if (level === 2)
            return {
              q: `이항분포 $B(n, p)$ 를 따르는 확률변수 $X$ 의 평균이 $${T(E)}$, 분산이 $${T(V)}$ 일 때, $n$ 의 값을 구하세요.`,
              answer: { type: 'num', value: n },
              steps: [`$np = ${T(E)}$, $npq = ${T(V)}$`, `$q = \\frac{${T(V)}}{${T(E)}} = ${T(q)}$, $p = ${T(p)}$`, `$n = ${T(E)}\\div${T(p)} = ${n}$`],
            };
          const E2 = V.add(E.mul(E));
          const ev = r.pick(DIE_EVENTS);
          const nn = ev.p.d * r.int(2, 8);
          const E_ = ev.p.mul(nn);
          const V_ = E_.mul(F.of(1).sub(ev.p));
          const E2_ = V_.add(E_.mul(E_));
          void E2;
          return {
            q: `주사위 한 개를 ${nn}번 던질 때, ${ev.name} 횟수를 확률변수 $X$ 라 하자. $E(X^{2})$ 의 값을 구하세요.`,
            answer: fAns(E2_),
            steps: [`$X\\sim B\\left(${nn}, ${T(ev.p)}\\right)$`, `$E(X) = ${T(E_)}$, $V(X) = ${T(V_)}$`, `$E(X^{2}) = V(X)+\\{E(X)\\}^{2} = ${T(V_)}+${T(E_.mul(E_))} = ${T(E2_)}$`],
          };
        },
      },
      {
        id: 'binom-prob',
        title: '이항분포의 확률',
        gen(r, level) {
          const p = r.pick([fr(1, 2), fr(1, 3), fr(2, 3), fr(1, 4)]);
          const n = r.int(3, level === 1 ? 4 : 6);
          const q = F.of(1).sub(p);
          if (level === 2) {
            const ans = binomP(n, n - 1, p).add(binomP(n, n, p));
            return {
              q: `확률변수 $X$ 가 이항분포 $B\\left(${n}, ${T(p)}\\right)$ 를 따를 때, $P(X\\ge ${n - 1})$ 을 구하세요.`,
              answer: fAns(ans),
              steps: [`$P(X=${n - 1})+P(X=${n}) = ${Ctex(n, n - 1)}\\left(${T(p)}\\right)^{${n - 1}}\\left(${T(q)}\\right)+\\left(${T(p)}\\right)^{${n}}$`, `$= ${T(binomP(n, n - 1, p))}+${T(binomP(n, n, p))} = ${T(ans)}$`],
            };
          }
          if (level === 1) {
            const k = r.int(1, n);
            const ans = binomP(n, k, p);
            return {
              q: `확률변수 $X$ 가 이항분포 $B\\left(${n}, ${T(p)}\\right)$ 를 따를 때, $P(X=${k})$ 는?`,
              answer: fChoices(r, ans, [p.pow(k).mul(q.pow(n - k)), binomP(n, k, q), p.pow(k), binomP(n, k === n ? 0 : k + 1, p)]),
              steps: [`$P(X=${k}) = ${Ctex(n, k)}\\left(${T(p)}\\right)^{${k}}\\left(${T(q)}\\right)^{${n - k}} = ${T(ans)}$`],
            };
          }
          const E = p.mul(n);
          const ans = binomP(n, 0, p).add(binomP(n, 1, p));
          return {
            q: `이항분포 $B\\left(${n}, p\\right)$ 를 따르는 확률변수 $X$ 의 평균이 $${T(E)}$ 일 때, $P(X\\le 1)$ 을 구하세요.`,
            answer: fAns(ans),
            steps: [`$${n}p = ${T(E)}$ → $p = ${T(p)}$`, `$P(X=0)+P(X=1) = \\left(${T(q)}\\right)^{${n}} + ${n}\\left(${T(p)}\\right)\\left(${T(q)}\\right)^{${n - 1}}$`, `$= ${T(ans)}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── pst-6 정규분포
  'pst-6': {
    concepts: [
      {
        title: '연속확률변수와 확률밀도함수',
        body: '어떤 구간의 모든 실수 값을 가지는 확률변수를 **연속확률변수**라 해요. 확률밀도함수 $f(x)$ 는\n- $f(x)\\ge0$, 그래프와 $x$축 사이 넓이 전체가 $1$\n- $P(a\\le X\\le b)$ = $x=a$ 부터 $x=b$ 까지 그래프 아래 넓이\n- 한 점의 확률은 $0$ 이라 $P(a\\le X\\le b) = P(a<X<b)$',
      },
      {
        title: '정규분포',
        body: '평균 $m$, 표준편차 $\\sigma$ 인 정규분포 $N(m, \\sigma^{2})$ 의 그래프는\n- 직선 $x=m$ 에 대하여 대칭인 종 모양\n- $\\sigma$ 가 클수록 낮고 넓게 퍼지고, 작을수록 높고 뾰족해요.',
      },
      {
        title: '표준화',
        body: '$X\\sim N(m,\\sigma^{2})$ 이면 $Z = \\frac{X-m}{\\sigma}$ 는 **표준정규분포** $N(0, 1)$ 을 따라요.\n$$P(a\\le X\\le b) = P\\left(\\frac{a-m}{\\sigma}\\le Z\\le \\frac{b-m}{\\sigma}\\right)$$\n- 표준정규분포표는 $P(0\\le Z\\le z)$ 를 알려 주고, 나머지는 대칭과 $P(Z\\ge0)=0.5$ 로 구해요.',
        example: { q: '$P(Z\\ge 1) $ ($P(0\\le Z\\le1)=0.3413$)', a: '$0.5-0.3413 = 0.1587$' },
      },
      {
        title: '이항분포와 정규분포',
        body: '$X\\sim B(n,p)$ 에서 $n$ 이 충분히 크면 $X$ 는 근사적으로 $N(np, npq)$ 를 따라요.',
      },
    ],
    skills: [
      {
        id: 'pdf',
        title: '확률밀도함수',
        gen(r, level) {
          const k = r.int(2, 6);
          const fig = (f: (x: number) => number, top: number) => stableFig(new Plane(-0.5, k + 0.8, -0.1 * top, top * 1.25, { w: 240, h: 170, grid: false, step: 1 }).fn(f, { a: 0, b: k }).seg(k, 0, k, f(k), { dash: true }).toString());
          if (level === 1) {
            const a = fr(2, k * k);
            return {
              q: `연속확률변수 $X$ 가 갖는 값의 범위는 $0\\le X\\le ${k}$ 이고, 확률밀도함수가 $f(x) = ax$ 일 때 상수 $a$ 의 값을 구하세요.`,
              fig: fig((x) => (2 / (k * k)) * x, 2 / k),
              answer: fAns(a),
              steps: [`넓이 = 1: $\\frac{1}{2}\\times${k}\\times${k}a = 1$`, `$a = ${T(a)}$`],
            };
          }
          if (level === 2) {
            const t = r.int(1, k - 1);
            const p = fr(t * t, k * k);
            return {
              q: `연속확률변수 $X$ 의 확률밀도함수가 $f(x) = ${T(fr(2, k * k))}x$ $(0\\le x\\le ${k})$ 일 때, $P(0\\le X\\le ${t})$ 를 구하세요.`,
              fig: fig((x) => (2 / (k * k)) * x, 2 / k),
              answer: fAns(p),
              steps: [`삼각형 넓이: $\\frac{1}{2}\\times${t}\\times f(${t}) = \\frac12\\times${t}\\times${T(fr(2 * t, k * k))}$`, `$= ${T(p)}$`],
            };
          }
          const t = r.int(1, k - 1);
          const a = fr(2, k * k);
          const p = fr((k - t) * (k - t), k * k);
          return {
            q: `연속확률변수 $X$ 의 확률밀도함수가 $f(x) = a(${k}-x)$ $(0\\le x\\le ${k})$ 일 때, $P(X\\ge ${t})$ 는?`,
            fig: fig((x) => (2 / (k * k)) * (k - x), 2 / k),
            answer: fChoices(r, p, [F.of(1).sub(p), fr(k - t, k), fr(t * t, k * k), fr((k - t) * (k - t), 2 * k * k)]),
            steps: [`$\\frac12\\times${k}\\times${k}a = 1$ → $a = ${T(a)}$`, `$P(X\\ge${t})$ = 밑변 $${k - t}$, 높이 $f(${t}) = ${T(a.mul(k - t))}$ 인 삼각형`, `$\\frac12\\times${k - t}\\times${T(a.mul(k - t))} = ${T(p)}$`],
          };
        },
      },
      {
        id: 'standardize',
        title: '표준화하여 확률 구하기',
        gen(r, level) {
          const m = r.pick([50, 60, 70, 100, 170, 300]);
          const s = r.pick([2, 4, 5, 10]);
          const z1 = r.pick([0.5, 1, 1.5, 2, 2.5]);
          const p1 = ZTAB[zKey(z1)];
          const X = (z: number) => round(m + z * s);
          if (level === 1) {
            return {
              q: `확률변수 $X$ 가 정규분포 $N(${m}, ${s}^{2})$ 을 따를 때, 아래 표준정규분포표를 이용하여 $P(${m}\\le X\\le ${X(z1)})$ 을 구하세요.`,
              table: zTable(),
              answer: dAns(p1),
              steps: [`$Z = \\frac{X-${m}}{${s}}$`, `$P(0\\le Z\\le ${zKey(z1)}) = ${p1}$`],
            };
          }
          if (level === 2) {
            if (r.chance(0.5)) {
              const ans = round(0.5 - p1, 4);
              const up = r.chance(0.5);
              return {
                q: `확률변수 $X$ 가 정규분포 $N(${m}, ${s}^{2})$ 을 따를 때, 표준정규분포표를 이용하여 $P(X${up ? '\\ge' : '\\le'} ${X(up ? z1 : -z1)})$ 을 구하세요.`,
                table: zTable(),
                answer: dAns(ans),
                steps: [`$P(X${up ? '\\ge' : '\\le'}${X(up ? z1 : -z1)}) = P(Z${up ? '\\ge' : '\\le'} ${up ? '' : '-'}${zKey(z1)})$`, `$= 0.5-${p1} = ${dec(ans)}$`],
              };
            }
            const z2 = r.pick([0.5, 1, 1.5, 2]);
            const p2 = ZTAB[zKey(z2)];
            const ans = round(p1 + p2, 4);
            return {
              q: `확률변수 $X$ 가 정규분포 $N(${m}, ${s}^{2})$ 을 따를 때, 표준정규분포표를 이용하여 $P(${X(-z2)}\\le X\\le ${X(z1)})$ 을 구하세요.`,
              table: zTable(),
              answer: dAns(ans),
              steps: [`$= P(-${zKey(z2)}\\le Z\\le ${zKey(z1)})$`, `$= P(0\\le Z\\le ${zKey(z2)}) + P(0\\le Z\\le ${zKey(z1)}) = ${p2}+${p1} = ${dec(ans)}$`],
            };
          }
          const ctx = r.pick([
            { who: '어느 과수원에서 수확한 사과', unit: 'g', what: '무게', top: '무게는', sub: '무게가', cnt: '개', m: 300, s: 20 },
            { who: '어느 지역 고등학생', unit: 'cm', what: '키', top: '키는', sub: '키가', cnt: '명', m: 170, s: 6 },
            { who: '어느 공장에서 생산한 건전지', unit: '시간', what: '수명', top: '수명은', sub: '수명이', cnt: '개', m: 50, s: 4 },
            { who: '어느 회사 직원', unit: '분', what: '출근 시간', top: '출근 시간은', sub: '출근 시간이', cnt: '명', m: 40, s: 8 },
          ]);
          const z2 = r.pick([0.5, 1, 1.5, 2]);
          const p2 = ZTAB[zKey(z2)];
          const lo = ctx.m + z2 * ctx.s;
          const hi = ctx.m + z1 * ctx.s;
          if (z1 > z2) {
            const ans = round(p1 - p2, 4);
            return {
              q: `${ctx.who}의 ${ctx.top} 평균 $${ctx.m}$ ${ctx.unit}, 표준편차 $${ctx.s}$ ${ctx.unit} 인 정규분포를 따릅니다. 임의로 ${ctx.cnt === '명' ? '한 명을' : '하나를'} 택할 때 ${ctx.sub} $${lo}$ ${ctx.unit} 이상 $${hi}$ ${ctx.unit} 이하일 확률을 표준정규분포표를 이용하여 구하세요.`,
              table: zTable(),
              answer: dAns(ans),
              steps: [`$Z = \\frac{X-${ctx.m}}{${ctx.s}}$ 로 표준화: $P(${zKey(z2)}\\le Z\\le ${zKey(z1)})$`, `$= ${p1}-${p2} = ${dec(ans)}$`],
            };
          }
          const N = 10000;
          const ans = round(N * (0.5 - p2));
          return {
            q: `${ctx.who} $${N / 1000}{,}000$ ${ctx.cnt}의 ${ctx.top} 평균 $${ctx.m}$ ${ctx.unit}, 표준편차 $${ctx.s}$ ${ctx.unit} 인 정규분포를 따릅니다. ${ctx.sub} $${lo}$ ${ctx.unit} 이상인 것은 약 몇 ${ctx.cnt}인지 표준정규분포표를 이용하여 구하세요.`,
            table: zTable(),
            answer: { type: 'num', value: ans, unit: ctx.cnt },
            steps: [`$P(X\\ge${lo}) = P(Z\\ge${zKey(z2)}) = 0.5-${p2} = ${dec(round(0.5 - p2, 4))}$`, `$${N}\\times${dec(round(0.5 - p2, 4))} = ${ans}$`],
          };
        },
      },
      {
        id: 'symmetry',
        title: '정규분포 곡선의 대칭성',
        gen(r, level) {
          const m = r.int(10, 80);
          const s = r.int(2, 6);
          const k = r.int(2, 12);
          if (level === 1) {
            return {
              q: `확률변수 $X$ 가 정규분포 $N(m, ${s}^{2})$ 을 따르고 $P(X\\le ${m - k}) = P(X\\ge ${m + k})$ 일 때, $m$ 의 값을 구하세요.`,
              answer: { type: 'num', value: m },
              steps: [`정규분포 곡선은 직선 $x=m$ 에 대하여 대칭`, `$m = \\frac{${m - k}+${m + k}}{2} = ${m}$`],
            };
          }
          if (level === 2) {
            const p = r.pick([0.1, 0.15, 0.2, 0.3, 0.35]);
            const ans = round(1 - 2 * p, 4);
            return {
              q: `확률변수 $X$ 가 정규분포 $N(${m}, ${s}^{2})$ 을 따르고 $P(X\\le ${m - k}) = ${p}$ 일 때, $P(${m - k}\\le X\\le ${m + k})$ 는?`,
              answer: numChoices(r, ans, [round(1 - p, 4), round(0.5 - p, 4), round(2 * p, 4), round(1 - 3 * p, 4)], 5, 'dec'),
              steps: [`대칭성: $P(X\\ge ${m + k}) = P(X\\le ${m - k}) = ${p}$`, `$1-2\\times${p} = ${dec(ans)}$`],
            };
          }
          const m2 = r.int(10, 80);
          const s2 = r.int(2, 6);
          const z = r.int(1, 3);
          const c1 = m + z * s;
          const c2 = m2 - z * s2;
          return {
            q: `두 확률변수 $X$, $Y$ 가 각각 정규분포 $N(${m}, ${s}^{2})$, $N(${m2}, ${s2}^{2})$ 을 따르고 $P(X\\ge ${c1}) = P(Y\\le a)$ 일 때, 상수 $a$ 의 값을 구하세요.`,
            answer: { type: 'num', value: c2 },
            steps: [`$P(X\\ge${c1}) = P\\left(Z\\ge \\frac{${c1}-${m}}{${s}}\\right) = P(Z\\ge ${z})$`, `$P(Y\\le a) = P\\left(Z\\le\\frac{a-${m2}}{${s2}}\\right)$, 대칭이므로 $\\frac{a-${m2}}{${s2}} = -${z}$`, `$a = ${c2}$`],
          };
        },
      },
      {
        id: 'normal-approx',
        title: '이항분포의 정규근사',
        gen(r, level) {
          const [n, p, m, s] = r.pick([
            [100, fr(1, 2), 50, 5],
            [400, fr(1, 2), 200, 10],
            [180, fr(1, 6), 30, 5],
            [288, fr(1, 3), 96, 8],
            [450, fr(1, 3), 150, 10],
            [192, fr(1, 4), 48, 6],
            [720, fr(1, 6), 120, 10],
          ] as [number, F, number, number][]);
          const ctx = p.eq(fr(1, 2)) ? '동전 한 개를' : p.eq(fr(1, 6)) ? '주사위 한 개를' : '';
          const evt = p.eq(fr(1, 2)) ? '앞면이 나오는' : p.eq(fr(1, 6)) ? '6의 눈이 나오는' : '';
          const intro = ctx ? `${ctx} $${n}$ 번 던질 때 ${evt} 횟수를 $X$ 라 하자.` : `확률변수 $X$ 가 이항분포 $B\\left(${n}, ${T(p)}\\right)$ 를 따른다.`;
          if (level === 1) {
            return {
              q: `${intro} $X$ 의 평균과 표준편차를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: '평균', value: m }, { label: '표준편차', value: s }] },
              steps: [`$E(X) = ${n}\\times${T(p)} = ${m}$`, `$V(X) = ${m}\\times${T(F.of(1).sub(p))} = ${s * s}$, $\\sigma(X) = ${s}$`],
            };
          }
          const z1 = r.pick([1, 1.5, 2, 2.5]);
          const p1 = ZTAB[zKey(z1)];
          if (level === 2) {
            const ans = round(0.5 - p1, 4);
            return {
              q: `${intro} $P(X\\ge ${m + z1 * s})$ 의 값을 표준정규분포표를 이용하여 구하세요. (정규분포로 근사)`,
              table: zTable(),
              answer: dAns(ans),
              steps: [`$X$ 는 근사적으로 $N(${m}, ${s}^{2})$`, `$P(X\\ge${m + z1 * s}) = P(Z\\ge${zKey(z1)}) = 0.5-${p1} = ${dec(ans)}$`],
            };
          }
          const z2 = r.pick([0.5, 1, 1.5, 2]);
          const p2 = ZTAB[zKey(z2)];
          const ans = round(p1 + p2, 4);
          return {
            q: `${intro} $P(${m - z2 * s}\\le X\\le ${m + z1 * s})$ 의 값을 표준정규분포표를 이용하여 구하세요. (정규분포로 근사)`,
            table: zTable(),
            answer: dAns(ans),
            steps: [`$E(X) = ${m}$, $\\sigma(X) = ${s}$ → 근사적으로 $N(${m}, ${s}^{2})$`, `$P(-${zKey(z2)}\\le Z\\le ${zKey(z1)}) = ${p2}+${p1} = ${dec(ans)}$`],
          };
        },
      },
      {
        id: 'inverse',
        title: '확률로 값 구하기',
        gen(r, level) {
          const z = r.pick([0.5, 1, 1.5, 2, 2.5]);
          const p = ZTAB[zKey(z)];
          const tail = round(0.5 - p, 4);
          if (level === 1) {
            return {
              q: `확률변수 $Z$ 가 표준정규분포를 따를 때, $P(Z\\ge k) = ${dec(tail)}$ 을 만족시키는 상수 $k$ 의 값을 표준정규분포표를 이용하여 구하세요.`,
              table: zTable(),
              answer: dAns(z),
              steps: [`$P(Z\\ge k) = 0.5-P(0\\le Z\\le k) = ${dec(tail)}$`, `$P(0\\le Z\\le k) = ${p}$ → $k = ${zKey(z)}$`],
            };
          }
          const m = r.pick([40, 50, 60, 75, 100]);
          const s = r.pick([2, 4, 5, 8, 10]);
          if (level === 2) {
            const k = m + z * s;
            return {
              q: `확률변수 $X$ 가 정규분포 $N(${m}, ${s}^{2})$ 을 따르고 $P(X\\ge k) = ${dec(tail)}$ 일 때, 상수 $k$ 의 값을 표준정규분포표를 이용하여 구하세요.`,
              table: zTable(),
              answer: { type: 'num', value: k },
              steps: [`$P\\left(Z\\ge\\frac{k-${m}}{${s}}\\right) = ${dec(tail)}$ → $\\frac{k-${m}}{${s}} = ${zKey(z)}$`, `$k = ${m}+${zKey(z)}\\times${s} = ${k}$`],
            };
          }
          const c = m + z * s;
          const below = round(0.5 + p, 4);
          return {
            q: `확률변수 $X$ 가 정규분포 $N(${m}, \\sigma^{2})$ 을 따르고 $P(X\\le ${c}) = ${dec(below)}$ 일 때, 양수 $\\sigma$ 의 값을 표준정규분포표를 이용하여 구하세요.`,
            table: zTable(),
            answer: { type: 'num', value: s },
            steps: [`$P(X\\le${c}) = 0.5+P\\left(0\\le Z\\le\\frac{${c - m}}{\\sigma}\\right) = ${dec(below)}$`, `$P\\left(0\\le Z\\le \\frac{${c - m}}{\\sigma}\\right) = ${p}$ → $\\frac{${c - m}}{\\sigma} = ${zKey(z)}$`, `$\\sigma = ${s}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── pst-7 통계적 추정
  'pst-7': {
    concepts: [
      {
        title: '모집단과 표본',
        body: '조사 대상 전체가 **모집단**, 그 일부가 **표본**이에요. 모집단의 각 대상이 같은 확률로 뽑히게 추출하는 것을 **임의추출**이라 해요.\n- 모평균 $m$, 모분산 $\\sigma^{2}$, 모표준편차 $\\sigma$\n- 복원추출/비복원추출 (이 단원은 주로 복원추출)',
      },
      {
        title: '표본평균의 분포',
        body: '모평균 $m$, 모분산 $\\sigma^{2}$ 인 모집단에서 크기 $n$ 인 표본을 임의추출할 때 표본평균 $\\overline{X}$ 는\n$$E(\\overline{X}) = m,\\quad V(\\overline{X}) = \\frac{\\sigma^{2}}{n},\\quad \\sigma(\\overline{X}) = \\frac{\\sigma}{\\sqrt{n}}$$\n- 모집단이 정규분포 $N(m,\\sigma^{2})$ 이면 $\\overline{X}\\sim N\\left(m, \\frac{\\sigma^{2}}{n}\\right)$\n- $n$ 이 크면 모집단 분포와 관계없이 근사적으로 정규분포 (중심극한정리)',
      },
      {
        title: '모평균의 추정',
        body: '모표준편차가 $\\sigma$ 인 정규분포에서 크기 $n$ 인 표본의 평균이 $\\overline{x}$ 일 때 모평균 $m$ 의 신뢰구간:\n- 신뢰도 95%: $\\overline{x}-1.96\\frac{\\sigma}{\\sqrt{n}}\\le m\\le \\overline{x}+1.96\\frac{\\sigma}{\\sqrt{n}}$\n- 신뢰도 99%: $1.96$ 대신 $2.58$\n- ($P(|Z|\\le1.96)=0.95$, $P(|Z|\\le 2.58)=0.99$)',
      },
      {
        title: '신뢰구간의 길이',
        body: '$$\\text{길이} = 2k\\frac{\\sigma}{\\sqrt{n}}\\quad(k=1.96 \\text{ 또는 } 2.58)$$\n- 표본의 크기 $n$ 이 커질수록 짧아지고, 신뢰도가 높을수록 길어져요.\n- 길이를 $\\frac{1}{2}$ 로 하려면 $n$ 을 $4$배로.',
      },
    ],
    skills: [
      {
        id: 'sample-mean',
        title: '표본평균의 평균·분산',
        gen(r, level) {
          if (level <= 2) {
            const m = r.int(10, 80);
            const k = r.int(2, 6);
            const n = k * k;
            const s = k * r.int(1, 4);
            if (level === 1) {
              const nn = r.pick([4, 5, 8, 10, 16, 25]);
              const sig = r.int(2, 10);
              const V = fr(sig * sig, nn);
              return {
                q: `모평균이 $${m}$, 모표준편차가 $${sig}$ 인 모집단에서 크기가 $${nn}$ 인 표본을 임의추출할 때, 표본평균 $\\overline{X}$ 의 평균과 분산을 구하세요.`,
                answer: { type: 'fields', fields: [{ label: 'E(X̄)', value: m }, { label: 'V(X̄)', value: V.value }] },
                steps: [`$E(\\overline{X}) = m = ${m}$`, `$V(\\overline{X}) = \\frac{\\sigma^{2}}{n} = \\frac{${sig * sig}}{${nn}} = ${T(V)}$`],
              };
            }
            return {
              q: `모평균이 $${m}$, 모분산이 $${s * s}$ 인 모집단에서 크기가 $${n}$ 인 표본을 임의추출할 때, 표본평균 $\\overline{X}$ 의 표준편차는?`,
              answer: numChoices(r, s / k, [(s * s) / n, s, s / n, (s * s) / k].filter((v) => v !== s / k), 5),
              steps: [`$\\sigma(\\overline{X}) = \\frac{\\sigma}{\\sqrt{n}} = \\frac{${s}}{\\sqrt{${n}}} = \\frac{${s}}{${k}} = ${dec(s / k)}$`],
            };
          }
          const xs = [1, 2, 3];
          const d = r.pick([4, 5, 6]);
          const w1 = r.int(1, d - 2);
          const w2 = r.int(1, d - w1 - 1);
          const ws = [w1, w2, d - w1 - w2];
          const ps = ws.map((w) => fr(w, d));
          const E = xs.reduce((s, x, i) => s.add(ps[i].mul(x)), new F(0));
          const E2 = xs.reduce((s, x, i) => s.add(ps[i].mul(x * x)), new F(0));
          const V = E2.sub(E.mul(E));
          const n = r.pick([2, 3, 4, 5]);
          const VX = V.div(n);
          return {
            q: `모집단의 확률분포가 다음 표와 같다. 이 모집단에서 크기가 $${n}$ 인 표본을 임의추출할 때, 표본평균 $\\overline{X}$ 의 분산 $V(\\overline{X})$ 를 구하세요.`,
            table: distTable(xs, ps.map(T)),
            answer: fAns(VX),
            steps: [`$E(X) = ${T(E)}$, $E(X^{2}) = ${T(E2)}$`, `$V(X) = ${T(E2)}-\\left(${T(E)}\\right)^{2} = ${T(V)}$`, `$V(\\overline{X}) = \\frac{${T(V)}}{${n}} = ${T(VX)}$`],
          };
        },
      },
      {
        id: 'xbar-prob',
        title: '표본평균의 확률',
        gen(r, level) {
          const m = r.pick([50, 60, 100, 200, 500]);
          const k = r.pick([2, 3, 4, 5, 6, 10]);
          const n = k * k;
          const se = r.int(1, 4);
          const s = se * k;
          const z1 = r.pick([0.5, 1, 1.5, 2, 2.5]);
          const p1 = ZTAB[zKey(z1)];
          const head = `정규분포 $N(${m}, ${s}^{2})$ 을 따르는 모집단에서 크기가 $${n}$ 인 표본을 임의추출하여 구한 표본평균을 $\\overline{X}$ 라 할 때,`;
          if (level === 1) {
            const ans = round(0.5 + p1, 4);
            return {
              q: `${head} $P(\\overline{X}\\le ${m + z1 * se})$ 을 표준정규분포표를 이용하여 구하세요.`,
              table: zTable(),
              answer: dAns(ans),
              steps: [`$\\overline{X}\\sim N\\left(${m}, \\left(\\frac{${s}}{${k}}\\right)^{2}\\right) = N(${m}, ${se}^{2})$`, `$P(Z\\le ${zKey(z1)}) = 0.5+${p1} = ${dec(ans)}$`],
            };
          }
          if (level === 2) {
            const ans = round(0.5 - p1, 4);
            return {
              q: `${head} $P(\\overline{X}\\ge ${m + z1 * se})$ 을 표준정규분포표를 이용하여 구하세요.`,
              table: zTable(),
              answer: dAns(ans),
              steps: [`$\\sigma(\\overline{X}) = \\frac{${s}}{\\sqrt{${n}}} = ${se}$`, `$P\\left(Z\\ge\\frac{${z1 * se}}{${se}}\\right) = P(Z\\ge${zKey(z1)}) = 0.5-${p1} = ${dec(ans)}$`],
            };
          }
          const z2 = r.pick([0.5, 1, 1.5, 2]);
          const p2 = ZTAB[zKey(z2)];
          const ans = round(p1 + p2, 4);
          return {
            q: `${head} $P(${m - z2 * se}\\le \\overline{X}\\le ${m + z1 * se})$ 을 표준정규분포표를 이용하여 구하세요.`,
            table: zTable(),
            answer: dAns(ans),
            steps: [`$\\sigma(\\overline{X}) = ${se}$`, `$P(-${zKey(z2)}\\le Z\\le ${zKey(z1)}) = ${p2}+${p1} = ${dec(ans)}$`],
          };
        },
      },
      {
        id: 'ci',
        title: '모평균의 신뢰구간',
        gen(r, level) {
          const k = r.pick([2, 3, 4, 5, 6, 8, 10]);
          const n = k * k;
          const se = r.int(1, 3);
          const s = se * k;
          const xbar = r.int(20, 200);
          const c = level === 3 && r.chance(0.5) ? 2.58 : 1.96;
          const half = round(c * se, 4);
          if (level <= 2) {
            const conf = level === 1 ? 1.96 : 2.58;
            const h = round(conf * se, 4);
            return {
              q: `모표준편차가 $${s}$ 인 정규분포를 따르는 모집단에서 크기가 $${n}$ 인 표본을 임의추출하여 구한 표본평균이 $${xbar}$ ${xbar % 10 === 0 || [1, 3, 6, 7, 8].includes(xbar % 10) ? '이었다' : '였다'}. 모평균 $m$ 에 대한 신뢰도 ${conf === 1.96 ? 95 : 99}% 의 신뢰구간 $a\\le m\\le b$ 를 구하세요. (단, $P(|Z|\\le 1.96)=0.95$, $P(|Z|\\le 2.58)=0.99$)`,
              answer: { type: 'fields', fields: [{ label: 'a', value: round(xbar - h, 4) }, { label: 'b', value: round(xbar + h, 4) }] },
              steps: [`$\\frac{\\sigma}{\\sqrt{n}} = \\frac{${s}}{${k}} = ${se}$`, `$${conf}\\times${se} = ${dec(h)}$`, `$${dec(round(xbar - h, 4))}\\le m\\le ${dec(round(xbar + h, 4))}$`],
            };
          }
          // 신뢰구간에서 n 구하기
          const a = round(xbar - half, 4);
          const b = round(xbar + half, 4);
          return {
            q: `모표준편차가 $${s}$ 인 정규분포를 따르는 모집단에서 크기가 $n$ 인 표본을 임의추출하여 모평균 $m$ 을 신뢰도 ${c === 1.96 ? 95 : 99}% 로 추정한 신뢰구간이 $${dec(a)}\\le m\\le ${dec(b)}$ 이었다. $n$ 의 값을 구하세요. (단, $P(|Z|\\le 1.96)=0.95$, $P(|Z|\\le 2.58)=0.99$)`,
            answer: { type: 'num', value: n },
            steps: [`구간의 길이의 절반: $\\frac{${dec(b)}-${dec(a)}}{2} = ${dec(half)}$`, `$${c}\\times\\frac{${s}}{\\sqrt{n}} = ${dec(half)}$ → $\\frac{${s}}{\\sqrt n} = ${se}$`, `$\\sqrt n = ${k}$, $n = ${n}$`],
          };
        },
      },
      {
        id: 'ci-length',
        title: '신뢰구간의 길이',
        gen(r, level) {
          const k = r.pick([2, 4, 5, 7, 10]);
          const n = k * k;
          const se = r.int(1, 3);
          const s = se * k;
          if (level === 1) {
            const L = round(2 * 1.96 * se, 4);
            return {
              q: `모표준편차가 $${s}$ 인 정규분포를 따르는 모집단에서 크기가 $${n}$ 인 표본을 임의추출하여 모평균을 신뢰도 95% 로 추정할 때, 신뢰구간의 길이를 구하세요. (단, $P(|Z|\\le 1.96)=0.95$)`,
              answer: dAns(L),
              steps: [`길이 $= 2\\times1.96\\times\\frac{${s}}{\\sqrt{${n}}} = 3.92\\times${se} = ${dec(L)}$`],
            };
          }
          if (level === 2) {
            const sig = r.pick([5, 10, 15, 20]);
            const L = r.pick([1.96, 3.92, 2.45, 4.9]);
            // n ≥ (2·1.96·σ / L)^2
            const need = round(((2 * 1.96 * sig) / L) ** 2, 6);
            const nmin = Math.ceil(need - 1e-9);
            return {
              q: `모표준편차가 $${sig}$ 인 정규분포를 따르는 모집단에서 크기가 $n$ 인 표본을 임의추출하여 모평균을 신뢰도 95% 로 추정할 때, 신뢰구간의 길이가 $${L}$ 이하가 되도록 하는 $n$ 의 최솟값을 구하세요. (단, $P(|Z|\\le 1.96)=0.95$)`,
              answer: { type: 'num', value: nmin },
              steps: [`$2\\times1.96\\times\\frac{${sig}}{\\sqrt n}\\le ${L}$`, `$\\sqrt n\\ge \\frac{${dec(round(3.92 * sig, 4))}}{${L}} = ${dec(round((3.92 * sig) / L, 6))}$`, `$n\\ge ${dec(need)}$ → 최솟값 $${nmin}$`],
            };
          }
          const t = r.pick([2, 3, 4]);
          const ratio = fr(1, t);
          const v = r.chance(0.5);
          if (v)
            return {
              q: `같은 모집단에서 같은 신뢰도로 모평균을 추정할 때, 표본의 크기를 $${t * t}$ 배로 하면 신뢰구간의 길이는 몇 배가 되는가?`,
              answer: fChoices(r, ratio, [fr(1, t * t), F.of(t), F.of(t * t), fr(1, 2 * t)]),
              steps: [`길이 $\\propto \\frac{1}{\\sqrt n}$`, `$\\frac{1}{\\sqrt{${t * t}}} = ${T(ratio)}$ 배`],
            };
          const L95 = round(2 * 1.96 * se, 4);
          const L99 = round(2 * 2.58 * se, 4);
          return {
            q: `모표준편차가 $${s}$ 인 정규분포를 따르는 모집단에서 크기가 $${n}$ 인 표본으로 모평균을 추정할 때, 신뢰도 99% 의 신뢰구간의 길이와 신뢰도 95% 의 신뢰구간의 길이의 차를 구하세요. (단, $P(|Z|\\le 1.96)=0.95$, $P(|Z|\\le 2.58)=0.99$)`,
            answer: dAns(round(L99 - L95, 4)),
            steps: [`$\\frac{\\sigma}{\\sqrt n} = ${se}$`, `99%: $2\\times2.58\\times${se} = ${dec(L99)}$, 95%: $2\\times1.96\\times${se} = ${dec(L95)}$`, `차: $${dec(round(L99 - L95, 4))}$`],
          };
        },
      },
      {
        id: 'concept',
        title: '추정의 개념',
        gen(r, level) {
          const n = r.pick([4, 9, 16, 25]);
          const trues = [
            '$E(\\overline{X})$ 는 모평균 $m$ 과 같다.',
            `$V(\\overline{X}) = \\frac{\\sigma^{2}}{${n}}$ 이다.`,
            '표본의 크기가 커지면 신뢰구간의 길이는 짧아진다.',
            '신뢰도를 높이면 신뢰구간의 길이는 길어진다.',
            '모집단이 정규분포를 따르면 $\\overline{X}$ 도 정규분포를 따른다.',
          ];
          const falses = [
            `$V(\\overline{X}) = \\frac{\\sigma^{2}}{${Math.sqrt(n)}}$ 이다.`,
            '표본의 크기가 커지면 신뢰구간의 길이는 길어진다.',
            '신뢰도를 높이면 신뢰구간의 길이는 짧아진다.',
            '$\\sigma(\\overline{X}) = \\frac{\\sigma}{n}$ 이다.',
            '$E(\\overline{X})$ 는 표본의 크기 $n$ 에 따라 달라진다.',
            '신뢰도 95% 의 신뢰구간은 모평균을 항상 포함한다.',
          ];
          const pickFalse = level >= 2;
          const ans = pickFalse ? r.pick(falses) : r.pick(trues);
          const others = pickFalse ? r.sample(trues, 4) : r.sample(falses, 4);
          return {
            q: `모평균 $m$, 모표준편차 $\\sigma$ 인 모집단에서 크기가 $${n}$ 인 표본을 임의추출한 표본평균을 $\\overline{X}$ 라 할 때, 다음 중 ${pickFalse ? '**옳지 않은**' : '옳은'} 것은?`,
            answer: makeChoices(r, ans, others),
            steps: [`$E(\\overline{X}) = m$, $V(\\overline{X}) = \\frac{\\sigma^{2}}{n}$, $\\sigma(\\overline{X}) = \\frac{\\sigma}{\\sqrt n}$`, '신뢰구간의 길이 $2k\\frac{\\sigma}{\\sqrt n}$ 는 $n$ 이 클수록 짧고, 신뢰도($k$)가 높을수록 깁니다.', `따라서 ${pickFalse ? '옳지 않은' : '옳은'} 것은 "${ans}"`],
          };
        },
      },
    ],
  },
};

// 활용(문장제) 유형 덧붙이기
for (const [u, sk] of Object.entries(PST_WORD)) pst[u].skills.push(...sk);
for (const [u, h] of Object.entries(PST_HARD)) {
  pst[u].skills.push(...h.skills);
  pst[u].top = [...(pst[u].top ?? []), ...h.top];
}
