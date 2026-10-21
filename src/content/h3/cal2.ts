// 미적분Ⅱ (cal2-1 ~ cal2-7)
import type { ContentMap, ProblemDraft } from '../../core/types';
import type { Rng } from '../../core/rng';
import { F } from '../../core/frac';
import { Plane } from '../../core/fig';
import { round } from '../../core/nt';
import { makeChoices, numChoices, poly, linTex } from '../../core/tex';
import { fAns, fChoices, texChoices, TRIPLES, coef, stableFig } from './util';
import { CAL2_WORD } from './word-cal2';
import { CAL2_HARD } from './hard-cal2';

const fr = (n: number, d = 1) => new F(n, d);
const T = (f: F) => f.tex();
const sgn = (v: number) => (v >= 0 ? `+${v}` : `${v}`);
/** 계수 × 거듭제곱: cm(3, '5^{n}') = '3\\cdot 5^{n}', cm(-1, …) = '-…' */
const cm = (a: number, base: string) => (a === 1 ? base : a === -1 ? `-${base}` : `${a}\\cdot ${base}`);
/** 1+ax 꼴: onePlus(-2) = '1-2x' */
const onePlus = (a: number, v = 'x') => `1${a > 0 ? '+' : ''}${linTex(a, 0, v)}`;
/** n/d 와 약분 결과 */
const ratio = (n: number, d: number) => {
  const f = fr(n, d);
  return f.n === n && f.d === d ? `\\frac{${n}}{${d}}` : `\\frac{${n}}{${d}} = ${T(f)}`;
};
/** ax+b 를 괄호 없이: 'ax+b' */
const lin = (a: number, b: number, v = 'x') => linTex(a, b, v);
/** F 계수 × 기호: 3e, \frac{1}{2}e … (계수 1 이면 기호만) */
const ct = (c: F, sym: string) => (c.eq(1) ? sym : c.eq(-1) ? `-${sym}` : `${c.tex()}${sym}`);
/** e 의 거듭제곱 */
const ePow = (k: F | number) => {
  const f = F.of(k);
  if (f.eq(0)) return '1';
  if (f.eq(1)) return 'e';
  return `e^{${f.tex()}}`;
};

/** 수열 템플릿 (수렴 여부) */
function seqTemplates(r: Rng): { tex: string; conv: boolean }[] {
  const p = r.int(1, 3);
  const q = p + r.int(1, 3);
  const a = r.int(1, 5),
    c = r.int(1, 5),
    b = r.int(-5, 5),
    d = r.int(1, 5);
  // 공비는 기약분수로 (6/3 → 2, 3/6 → 1/2)
  const sm = fr(p, q).tex();
  const bg = fr(q, p);
  const qp = bg.tex();
  return [
    { tex: `\\left(${sm}\\right)^{n}`, conv: true },
    { tex: `\\left(-${sm}\\right)^{n}`, conv: true },
    { tex: `\\frac{${lin(a, b, 'n')}}{${lin(c, d, 'n')}}`, conv: true },
    { tex: `\\frac{(-1)^{n}}{n}`, conv: true },
    { tex: `\\sqrt{n^{2}+${a}n}-n`, conv: true },
    { tex: `\\frac{${q}^{n}}{${q}^{n}+1}`, conv: true },
    { tex: bg.isInt() ? `${bg.n}^{n}` : `\\left(${qp}\\right)^{n}`, conv: false },
    { tex: `\\left(-${qp}\\right)^{n}`, conv: false },
    { tex: `(-1)^{n}`, conv: false },
    { tex: `\\frac{n^{2}}{${lin(c, d, 'n')}}`, conv: false },
    { tex: `\\sqrt{n+${a}}`, conv: false },
    { tex: `\\frac{(-1)^{n}n}{n+${d}}`, conv: false },
    { tex: `\\sqrt{n^{2}+${a}n}-\\sqrt{n}`, conv: false },
  ];
}

export const cal2: ContentMap = {
  // ───────────────────────── cal2-1 수열의 극한
  'cal2-1': {
    concepts: [
      {
        title: '수열의 수렴과 발산',
        body: '$n$ 이 한없이 커질 때 $a_n$ 이 일정한 값 $\\alpha$ 에 한없이 가까워지면 **수렴**한다고 하고 $\\lim_{n\\to\\infty}a_n = \\alpha$ 로 써요.\n- 수렴하지 않으면 **발산**: 양의 무한대, 음의 무한대, 진동\n- 수학Ⅰ의 수열, 미적분Ⅰ의 함수의 극한과 같은 생각이에요.',
      },
      {
        title: '수열의 극한에 대한 성질',
        body: '$\\lim a_n=\\alpha$, $\\lim b_n=\\beta$ 이면\n- $\\lim(a_n\\pm b_n) = \\alpha\\pm\\beta$, $\\lim ka_n = k\\alpha$\n- $\\lim a_nb_n = \\alpha\\beta$, $\\lim\\frac{a_n}{b_n} = \\frac{\\alpha}{\\beta}$ ($\\beta\\ne0$)\n- $a_n\\le c_n\\le b_n$ 이고 $\\alpha=\\beta$ 이면 $\\lim c_n = \\alpha$',
      },
      {
        title: '$\\frac{\\infty}{\\infty}$ 꼴과 $\\infty-\\infty$ 꼴',
        body: '- $\\frac{\\infty}{\\infty}$: 분모의 최고차항으로 분자·분모를 나눠요. 차수가 같으면 최고차항 계수의 비.\n- $\\infty-\\infty$ (근호): 유리화해요. $\\sqrt{n^{2}+an}-n = \\frac{an}{\\sqrt{n^{2}+an}+n}\\to\\frac{a}{2}$',
        example: { q: '$\\lim\\frac{3n^{2}+1}{2n^{2}-n}$', a: '$\\frac{3}{2}$' },
      },
      {
        title: '등비수열의 극한',
        body: '$$\\lim_{n\\to\\infty}r^{n} = \\begin{cases}\\infty & (r>1)\\\\ 1 & (r=1)\\\\ 0 & (-1<r<1)\\\\ \\text{진동} & (r\\le-1)\\end{cases}$$\n- $\\{r^{n}\\}$ 이 수렴할 조건: $-1<r\\le1$\n- 밑이 다른 지수식은 가장 큰 밑의 거듭제곱으로 나눠요.',
      },
    ],
    skills: [
      {
        id: 'rational',
        title: '분수 꼴의 극한',
        gen(r, level) {
          if (level === 1) {
            const a = r.nonzero(-6, 6),
              b = r.int(-5, 5),
              c = r.int(1, 6),
              d = r.int(-5, 5);
            const ans = fr(a, c);
            return {
              q: `$\\lim_{n\\to\\infty}\\frac{${lin(a, b, 'n')}}{${lin(c, d, 'n')}}$ 의 값을 구하세요.`,
              answer: fAns(ans),
              steps: [`분자·분모를 $n$ 으로 나누면 $\\frac{${a}${b ? `${b > 0 ? '+' : '-'}\\frac{${Math.abs(b)}}{n}` : ''}}{${c}${d ? `${d > 0 ? '+' : '-'}\\frac{${Math.abs(d)}}{n}` : ''}}$`, `$n\\to\\infty$ 이면 $${ratio(a, c)}$`],
            };
          }
          if (level === 2) {
            const zero = r.chance(0.3);
            const a = r.nonzero(-5, 5),
              b = r.int(-5, 5),
              c = r.int(-5, 5);
            const d = r.int(1, 5),
              e = r.int(-5, 5),
              f = r.nonzero(-5, 5);
            const num = zero ? poly([a, b], 'n') : poly([a, b, c], 'n');
            const ans = zero ? fr(0) : fr(a, d);
            return {
              q: `$\\lim_{n\\to\\infty}\\frac{${num}}{${poly([d, e, f], 'n')}}$ 의 값은?`,
              answer: fChoices(r, ans, [fr(a, f), fr(a), zero ? fr(a, d) : fr(c, f), fr(d, a === 0 ? 1 : a)]),
              steps: [`분자·분모를 $n^{2}$ 으로 나눕니다.`, zero ? `분자의 차수가 더 낮으므로 극한값은 $0$` : `최고차항의 계수의 비: $\\frac{${a}}{${d}} = ${T(ans)}$`],
            };
          }
          const a = r.int(1, 4);
          const b = r.int(1, 6);
          const c = r.int(-3, 3);
          const d = r.int(1, 5);
          const e = r.int(-4, 4);
          const ans = fr(a + c, d);
          return {
            q: `$\\lim_{n\\to\\infty}\\frac{\\sqrt{${a * a}n^{2}+${b}n}${c === 0 ? '' : c > 0 ? `+${coef(c)}n` : `-${coef(-c)}n`}}{${lin(d, e, 'n')}}$ 의 값을 구하세요.`,
            answer: fAns(ans),
            steps: [`분자·분모를 $n$ 으로 나누면 분자 $\\to\\sqrt{${a * a}}${c === 0 ? '' : sgn(c)} = ${a + c}$, 분모 $\\to ${d}$`, `극한값: $\\frac{${a + c}}{${d}} = ${T(ans)}$`],
          };
        },
      },
      {
        id: 'sqrt-diff',
        title: '$\\infty-\\infty$ 꼴의 극한',
        gen(r, level) {
          if (level === 1) {
            const b = r.nonzero(-8, 8);
            const ans = fr(b, 2);
            return {
              q: `$\\lim_{n\\to\\infty}\\left(\\sqrt{n^{2}${sgn(b)}n}-n\\right)$ 의 값을 구하세요.`,
              answer: fAns(ans),
              steps: [`유리화: $\\frac{${b}n}{\\sqrt{n^{2}${sgn(b)}n}+n}$`, `분자·분모를 $n$ 으로 나누면 $\\frac{${b}}{1+1} = ${T(ans)}$`],
            };
          }
          if (level === 2) {
            const a = r.int(-6, 8),
              b = r.int(-6, 8);
            if (a === b) return this.gen(r, level);
            const ans = fr(a - b, 2);
            const sq = (k: number) => (k === 0 ? 'n' : `\\sqrt{n^{2}${k > 0 ? `+${k}n` : `${k}n`}}`);
            return {
              q: `$\\lim_{n\\to\\infty}\\left(${sq(a)}-${sq(b)}\\right)$ 의 값은?`,
              answer: fChoices(r, ans, [fr(a - b), fr(a + b, 2), fr(b - a, 2), fr(0)]),
              steps: [`유리화: $\\frac{${a - b}n}{${sq(a)}+${sq(b)}}$`, `$\\frac{${a - b}}{2} = ${T(ans)}$`],
            };
          }
          const k = r.int(2, 4);
          const a = r.nonzero(-9, 9);
          const recip = r.chance(0.5);
          const val = fr(a, 2 * k);
          const ans = recip ? val.inv() : val;
          return {
            q: recip
              ? `$\\lim_{n\\to\\infty}\\frac{1}{\\sqrt{${k * k}n^{2}${sgn(a)}n}-${k}n}$ 의 값을 구하세요.`
              : `$\\lim_{n\\to\\infty}\\left(\\sqrt{${k * k}n^{2}${sgn(a)}n}-${k}n\\right)$ 의 값을 구하세요.`,
            answer: fAns(ans),
            steps: [
              recip ? `분모를 유리화하면 $\\frac{\\sqrt{${k * k}n^{2}${sgn(a)}n}+${k}n}{${a}n}$` : `유리화: $\\frac{${a}n}{\\sqrt{${k * k}n^{2}${sgn(a)}n}+${k}n}$`,
              `분자·분모를 $n$ 으로 나누면 $${recip ? `\\frac{${k}+${k}}{${a}}` : `\\frac{${a}}{${k}+${k}}`} = ${T(ans)}$`,
            ],
          };
        },
      },
      {
        id: 'geometric',
        title: '등비수열의 극한',
        gen(r, level) {
          if (level === 1) {
            const p = r.int(2, 5);
            const a = r.nonzero(-5, 5),
              b = r.int(-5, 5),
              c = r.int(1, 5);
            return {
              q: `$\\lim_{n\\to\\infty}\\frac{${cm(a, `${p}^{n}`)}${b === 0 ? '' : sgn(b)}}{${p}^{n}+${c}}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: a },
              steps: [`분자·분모를 $${p}^{n}$ 으로 나누면 $\\frac{${a}${b === 0 ? '' : `${b > 0 ? '+' : '-'}${coef(Math.abs(b))}\\left(\\frac{1}{${p}}\\right)^{n}`}}{1+${coef(c)}\\left(\\frac{1}{${p}}\\right)^{n}}$`, `$\\left(\\frac{1}{${p}}\\right)^{n}\\to0$ 이므로 $${a}$`],
            };
          }
          if (level === 2) {
            const p = r.int(3, 6);
            const q = r.int(2, p - 1);
            const a = r.int(1, 4);
            const ans = a * p;
            return {
              q: `$\\lim_{n\\to\\infty}\\frac{${cm(a, `${p}^{n+1}`)}+${q}^{n}}{${p}^{n}+${q}^{n+1}}$ 의 값은?`,
              answer: numChoices(r, ans, [a, p, a * p * p, a * q, a + p, ans + q].filter((v) => v !== ans)),
              steps: [`분자·분모를 $${p}^{n}$ 으로 나누면 $\\frac{${a * p}+\\left(\\frac{${q}}{${p}}\\right)^{n}}{1+${q}\\left(\\frac{${q}}{${p}}\\right)^{n}}$`, `$\\left(\\frac{${q}}{${p}}\\right)^{n}\\to0$ 이므로 $${ans}$`],
            };
          }
          const k = r.int(2, 6);
          const c = r.int(-4, 4);
          return {
            q: `수열 $\\left\\{\\left(\\frac{${c === 0 ? 'x' : lin(1, -c)}}{${k}}\\right)^{n}\\right\\}$ 이 수렴하도록 하는 정수 $x$ 의 개수를 구하세요.`,
            answer: { type: 'num', value: 2 * k, unit: '개' },
            steps: [`수렴 조건: $-1<\\frac{${c === 0 ? 'x' : lin(1, -c)}}{${k}}\\le1$`, `$${c - k}<x\\le${c + k}$`, `정수 $x$: $${c - k + 1}, \\ldots, ${c + k}$ 의 $${2 * k}$개`],
            hint: '$\\{r^{n}\\}$ 이 수렴할 조건은 $-1<r\\le1$',
          };
        },
      },
      {
        id: 'converge',
        title: '수렴·발산 판정',
        gen(r, level) {
          const ts = seqTemplates(r);
          const conv = ts.filter((t) => t.conv);
          const div = ts.filter((t) => !t.conv);
          const askConv = level !== 2;
          const pool = level === 1 ? [0, 2, 3] : [0, 1, 2, 3, 4, 5];
          const right = askConv ? r.pick(conv.filter((_, i) => pool.includes(i))) : r.pick(div);
          const wrongs = r.sample(askConv ? div : conv, 4);
          return {
            q: `다음 수열 $\\{a_n\\}$ 중 ${askConv ? '**수렴하는**' : '**발산하는**'} 것은? (보기는 $a_n$)`,
            answer: texChoices(r, right.tex, wrongs.map((w) => w.tex)),
            steps: [`등비수열은 공비가 $-1<r\\le1$ 일 때만 수렴, 분수식은 차수 비교, 근호는 유리화로 판정합니다.`, `${askConv ? '수렴하는' : '발산하는'} 것: $${right.tex}$`],
          };
        },
      },
      {
        id: 'limit-prop',
        title: '극한의 성질 활용',
        gen(r, level) {
          if (level === 1) {
            const al = r.int(-5, 5),
              be = r.int(-5, 5),
              p = r.nonzero(-4, 4),
              q = r.nonzero(-4, 4);
            return {
              q: `$\\lim_{n\\to\\infty}a_n = ${al}$, $\\lim_{n\\to\\infty}b_n = ${be}$ 일 때, $\\lim_{n\\to\\infty}(${coef(p)}a_n${q > 0 ? '+' : '-'}${coef(Math.abs(q))}b_n)$ 의 값을 구하세요.`,
              answer: { type: 'num', value: p * al + q * be },
              steps: [`$${p}\\times${paren(al)}${q > 0 ? '+' : '-'}${Math.abs(q)}\\times${paren(be)} = ${p * al + q * be}$`],
            };
          }
          if (level === 2) {
            const al = r.int(1, 5),
              be = r.nonzero(-4, 4);
            const ans = fr(al * be + 1, al + be * be);
            return {
              q: `$\\lim_{n\\to\\infty}a_n = ${al}$, $\\lim_{n\\to\\infty}b_n = ${be}$ 일 때, $\\lim_{n\\to\\infty}\\frac{a_nb_n+1}{a_n+b_n^{2}}$ 의 값은?`,
              answer: fChoices(r, ans, [fr(al * be, al + be * be), fr(al * be + 1, al + be || 9), fr(al + be, al * be + 1 || 9), fr(al * be + 1, al * al + be || 7)]),
              steps: [`극한의 성질에 따라 각각 대입: $\\frac{${al}\\times${paren(be)}+1}{${al}+${paren(be)}^{2}} = ${T(ans)}$`],
            };
          }
          const k = r.int(2, 5),
            c = r.int(-3, 3),
            L = r.nonzero(-12, 12),
            m = r.int(1, 6),
            d = r.int(-4, 4);
          const ans = fr(m * L, k);
          return {
            q: `수열 $\\{a_n\\}$ 에 대하여 $\\lim_{n\\to\\infty}(${lin(k, c, 'n')})a_n = ${L}$ 일 때, $\\lim_{n\\to\\infty}(${lin(m, d, 'n')})a_n$ 의 값을 구하세요.`,
            answer: fAns(ans),
            steps: [`$(${lin(m, d, 'n')})a_n = (${lin(k, c, 'n')})a_n\\times\\frac{${lin(m, d, 'n')}}{${lin(k, c, 'n')}}$`, `$\\lim\\frac{${lin(m, d, 'n')}}{${lin(k, c, 'n')}} = \\frac{${m}}{${k}}$`, `$${L}\\times\\frac{${m}}{${k}} = ${T(ans)}$`],
            hint: '구하는 식을 주어진 식으로 나타내 보세요.',
          };
        },
      },
    ],
  },

  // ───────────────────────── cal2-2 급수
  'cal2-2': {
    concepts: [
      {
        title: '급수의 합',
        body: '수열 $\\{a_n\\}$ 의 각 항을 차례로 더한 $\\sum_{n=1}^{\\infty}a_n$ 을 **급수**라 해요. 부분합 $S_n = \\sum_{k=1}^{n}a_k$ 가 $S$ 로 수렴하면 급수의 합은 $S$.\n- 부분분수: $\\frac{1}{n(n+k)} = \\frac{1}{k}\\left(\\frac1n-\\frac{1}{n+k}\\right)$ 로 쪼개 소거해요.',
        example: { q: '$\\sum_{n=1}^{\\infty}\\frac{1}{n(n+1)}$', a: '$S_n = 1-\\frac{1}{n+1}\\to 1$' },
      },
      {
        title: '급수와 수열의 극한',
        body: '$\\sum a_n$ 이 수렴하면 $\\lim_{n\\to\\infty}a_n = 0$.\n- 역은 성립하지 않아요. (예: $a_n=\\frac1n$)\n- 대우: $\\lim a_n\\ne0$ 이면 급수는 발산',
      },
      {
        title: '등비급수',
        body: '$$\\sum_{n=1}^{\\infty}ar^{n-1} = \\frac{a}{1-r}\\quad(|r|<1)$$\n- $a\\ne0$ 일 때 $|r|\\ge1$ 이면 발산\n- 수렴 조건: $a=0$ 또는 $-1<r<1$ (등비수열의 수렴 조건과 다름에 주의)',
      },
      {
        title: '등비급수의 활용',
        body: '- 순환소수: $0.\\dot{a}\\dot{b} = \\frac{ab}{100}+\\frac{ab}{100^{2}}+\\cdots = \\frac{ab}{99}$\n- 닮은 도형이 끝없이 이어질 때 넓이·길이의 합: 첫째항과 닮음비(공비)를 찾아요. 넓이의 공비는 닮음비의 제곱.',
      },
    ],
    skills: [
      {
        id: 'telescope',
        title: '부분분수로 급수의 합',
        gen(r, level) {
          if (level === 1) {
            const c = r.int(1, 9);
            return {
              q: `$\\sum_{n=1}^{\\infty}\\frac{${c}}{n(n+1)}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: c },
              steps: [`$\\frac{${c}}{n(n+1)} = ${c}\\left(\\frac1n-\\frac{1}{n+1}\\right)$`, `$S_n = ${c}\\left(1-\\frac{1}{n+1}\\right)\\to ${c}$`],
            };
          }
          if (level === 2) {
            if (r.chance(0.5)) {
              const c = r.int(1, 8);
              const ans = fr(3 * c, 4);
              return {
                q: `$\\sum_{n=1}^{\\infty}\\frac{${c}}{n(n+2)}$ 의 값을 구하세요.`,
                answer: fAns(ans),
                steps: [`$\\frac{${c}}{n(n+2)} = \\frac{${c}}{2}\\left(\\frac1n-\\frac1{n+2}\\right)$`, `남는 항: $\\frac{${c}}{2}\\left(1+\\frac12\\right) = ${T(ans)}$`],
              };
            }
            const c = r.int(1, 8);
            const ans = fr(c, 2);
            return {
              q: `$\\sum_{n=1}^{\\infty}\\frac{${c}}{(2n-1)(2n+1)}$ 의 값을 구하세요.`,
              answer: fAns(ans),
              steps: [`$\\frac{${c}}{(2n-1)(2n+1)} = \\frac{${c}}{2}\\left(\\frac{1}{2n-1}-\\frac{1}{2n+1}\\right)$`, `$S_n = \\frac{${c}}{2}\\left(1-\\frac{1}{2n+1}\\right)\\to ${T(ans)}$`],
            };
          }
          const a = r.int(1, 3);
          const k = r.int(1, 3);
          let s = fr(0);
          for (let j = 1; j <= k; j++) s = s.add(fr(1, a + j));
          const ans = s.div(k);
          return {
            q: `$\\sum_{n=1}^{\\infty}\\frac{1}{(n+${a})(n+${a + k})}$ 의 값을 구하세요.`,
            answer: fAns(ans),
            steps: [`$\\frac{1}{(n+${a})(n+${a + k})} = ${k === 1 ? '' : `\\frac{1}{${k}}`}\\left(\\frac{1}{n+${a}}-\\frac{1}{n+${a + k}}\\right)$`, `소거 후 남는 항: $${k === 1 ? '' : `\\frac{1}{${k}}`}\\left(${Array.from({ length: k }, (_, j) => `\\frac{1}{${a + j + 1}}`).join('+')}\\right)$`, `$= ${T(ans)}$`],
          };
        },
      },
      {
        id: 'geo-series',
        title: '등비급수의 합',
        gen(r, level) {
          if (level === 1) {
            const q = r.int(2, 6);
            const p = r.nonzero(-(q - 1), q - 1);
            const ratio = fr(p, q);
            const a = r.nonzero(-6, 9);
            const ans = fr(a).div(F.of(1).sub(ratio));
            return {
              q: `등비급수 $\\sum_{n=1}^{\\infty}${a === 1 ? '' : a === -1 ? '-' : a}\\left(${T(ratio)}\\right)^{n-1}$ 의 합을 구하세요.`,
              answer: fAns(ans),
              steps: [`첫째항 $${a}$, 공비 $${T(ratio)}$ ($|r|<1$ 이므로 수렴)`, `$\\frac{${a}}{1-\\left(${T(ratio)}\\right)} = ${T(ans)}$`],
            };
          }
          if (level === 2) {
            const m = r.int(4, 7);
            const p = r.int(2, m - 1);
            let q = r.int(2, m - 1);
            if (q === p) q = p === 2 ? 3 : 2;
            const ans = fr(p, m - p).add(fr(q, m - q));
            return {
              q: `$\\sum_{n=1}^{\\infty}\\frac{${p}^{n}+${q}^{n}}{${m}^{n}}$ 의 값은?`,
              answer: fChoices(r, ans, [fr(p, m).add(fr(q, m)), fr(m, m - p).add(fr(m, m - q)), fr(p + q, m - p - q > 0 ? m - p - q : m), fr(p * q, m - p)]),
              steps: [
                `$\\sum\\left(\\frac{${p}}{${m}}\\right)^{n}+\\sum\\left(\\frac{${q}}{${m}}\\right)^{n}$`,
                `$\\frac{${p}/${m}}{1-${p}/${m}}+\\frac{${q}/${m}}{1-${q}/${m}} = ${T(fr(p, m - p))}+${T(fr(q, m - q))} = ${T(ans)}$`.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}'),
              ],
            };
          }
          const k = r.int(2, 5);
          const c = r.int(-3, 4);
          return {
            q: `급수 $\\sum_{n=1}^{\\infty}\\left(\\frac{${c === 0 ? 'x' : lin(1, -c)}}{${k}}\\right)^{n}$ 이 수렴하도록 하는 정수 $x$ 의 개수를 구하세요.`,
            answer: { type: 'num', value: 2 * k - 1, unit: '개' },
            steps: [`첫째항과 공비가 모두 $r=\\frac{${c === 0 ? 'x' : lin(1, -c)}}{${k}}$`, `수렴 조건 $r=0$ 또는 $-1<r<1$: $${c - k}<x<${c + k}$`, `정수 $x$ 의 개수: $${2 * k - 1}$`],
            hint: '등비급수의 수렴 조건은 $-1<r<1$ (등호 없음)',
          };
        },
      },
      {
        id: 'term-limit',
        title: '급수와 일반항의 극한',
        gen(r, level) {
          const p = r.nonzero(-5, 6),
            q = r.int(-5, 5);
          const term = `\\frac{${lin(p, q, 'n')}}{n+1}`;
          if (level === 1) {
            return {
              q: `급수 $\\sum_{n=1}^{\\infty}\\left(a_n-${term}\\right)$ 이 수렴할 때, $\\lim_{n\\to\\infty}a_n$ 의 값을 구하세요.`,
              answer: { type: 'num', value: p },
              steps: [`급수가 수렴하므로 $\\lim\\left(a_n-${term}\\right) = 0$`, `$\\lim a_n = \\lim${term} = ${p}$`],
            };
          }
          if (level === 2) {
            const s = r.int(1, 4),
              t = r.int(1, 5),
              u = r.int(-4, 4);
            if (p + t === 0) return this.gen(r, level);
            const ans = fr(s * p + u, p + t);
            return {
              q: `급수 $\\sum_{n=1}^{\\infty}\\left(a_n-${term}\\right)$ 이 수렴할 때, $\\lim_{n\\to\\infty}\\frac{${lin(s, u, 'a_n')}}{a_n+${t}}$ 의 값은?`,
              answer: fChoices(r, ans, [fr(s, 1), fr(s * q + u, q + t === 0 ? 1 : q + t), fr(u, t), fr(s * p, p + t)]),
              steps: [`$\\lim a_n = ${p}$`, `$\\frac{${s}\\times${paren(p)}${sgn(u)}}{${paren(p)}+${t}} = ${T(ans)}$`],
            };
          }
          const k = r.int(2, 5),
            c = r.int(-3, 3);
          const ans = fr(p, k);
          return {
            q: `급수 $\\sum_{n=1}^{\\infty}\\left(\\frac{a_n}{n}${p > 0 ? '-' : '+'}${Math.abs(p)}\\right)$ 이 수렴할 때, $\\lim_{n\\to\\infty}\\frac{a_n}{${lin(k, c, 'n')}}$ 의 값을 구하세요.`,
            answer: fAns(ans),
            steps: [`$\\lim\\left(\\frac{a_n}{n}-${paren(p)}\\right) = 0$ 이므로 $\\lim\\frac{a_n}{n} = ${p}$`, `$\\frac{a_n}{${lin(k, c, 'n')}} = \\frac{a_n}{n}\\cdot\\frac{n}{${lin(k, c, 'n')}}\\to ${p}\\times\\frac{1}{${k}} = ${T(ans)}$`],
          };
        },
      },
      {
        id: 'recurring',
        title: '순환소수와 등비급수',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(1, 8);
            const ans = fr(a, 9);
            return {
              q: `순환소수 $0.\\dot{${a}}$ 를 등비급수로 나타내어 분수로 구하세요.`,
              answer: fAns(ans),
              steps: [`$0.\\dot{${a}} = \\frac{${a}}{10}+\\frac{${a}}{10^{2}}+\\cdots$`, `첫째항 $\\frac{${a}}{10}$, 공비 $\\frac{1}{10}$: $\\frac{${a}/10}{1-1/10} = ${T(ans)}$`.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}')],
            };
          }
          if (level === 2) {
            const a = r.int(0, 9),
              b = r.int(1, 9);
            if (a === b) return this.gen(r, level);
            const ans = fr(10 * a + b, 99);
            return {
              q: `순환소수 $0.\\dot{${a}}\\dot{${b}}$ 를 분수로 나타낸 것은?`,
              answer: fChoices(r, ans, [fr(10 * a + b, 100), fr(10 * a + b, 90), fr(10 * a + b - a, 90), fr(10 * a + b, 999)]),
              steps: [`$0.\\dot{${a}}\\dot{${b}} = \\frac{${10 * a + b}}{100}+\\frac{${10 * a + b}}{100^{2}}+\\cdots$`, `$\\frac{\\frac{${10 * a + b}}{100}}{1-\\frac{1}{100}} = \\frac{${10 * a + b}}{99} = ${T(ans)}$`],
            };
          }
          const a = r.int(1, 9),
            b = r.int(1, 9); // b=0 이면 0.5000… 처럼 순환소수가 아님
          if (a === b) return this.gen(r, level);
          const ans = fr(10 * a + b - a, 90);
          return {
            q: `순환소수 $0.${a}\\dot{${b}}$ 를 등비급수를 이용하여 분수로 나타내세요.`,
            answer: fAns(ans),
            steps: [`$0.${a}\\dot{${b}} = \\frac{${a}}{10}+\\left(\\frac{${b}}{100}+\\frac{${b}}{1000}+\\cdots\\right)$`, `$= \\frac{${a}}{10}+\\frac{${b}/100}{1-1/10} = \\frac{${a}}{10}+\\frac{${b}}{90}$`.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}'), `$= ${T(ans)}$`],
          };
        },
      },
      {
        id: 'figure',
        title: '등비급수의 활용 (도형·운동)',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(2, 10);
            return {
              q: `한 변의 길이가 $${a}$ 인 정사각형의 각 변의 중점을 이어 새 정사각형을 만드는 과정을 끝없이 반복할 때, 처음 정사각형을 포함한 모든 정사각형의 넓이의 합을 구하세요.`,
              answer: { type: 'num', value: 2 * a * a },
              steps: [`새 정사각형의 넓이는 이전의 $\\frac{1}{2}$ 배 (공비 $\\frac12$)`, `첫째항 $${a * a}$: $\\frac{${a * a}}{1-\\frac12} = ${2 * a * a}$`],
            };
          }
          if (level === 2) {
            const h = r.pick([10, 12, 15, 20, 30]);
            const q = r.int(3, 5);
            const p = r.int(1, q - 1);
            const ratio = fr(p, q);
            const ans = fr(h).mul(F.of(1).add(ratio)).div(F.of(1).sub(ratio));
            return {
              q: `높이 $${h}$ m 에서 떨어뜨린 공이 땅에 닿을 때마다 직전 높이의 $${T(ratio)}$ 만큼 튀어 오릅니다. 공이 멈출 때까지 움직인 거리의 총합을 구하세요.`,
              answer: fAns(ans, 'm'),
              steps: [`처음 $${h}$ m 내려온 뒤, 올라갔다 내려오는 거리 $2\\times${h}\\times${T(ratio)}$, $2\\times${h}\\times\\left(${T(ratio)}\\right)^{2}$, …`, `$${h}+\\frac{2\\times${h}\\times${T(ratio)}}{1-${T(ratio)}} = ${T(ans)}$`],
            };
          }
          const a = r.int(2, 8);
          const c = fr(a * a, 3);
          const right = ct(c, '\\sqrt{3}');
          return {
            q: `한 변의 길이가 $${a}$ 인 정삼각형의 각 변의 중점을 이어 만든 정삼각형에서 다시 같은 과정을 끝없이 반복할 때, 처음 정삼각형을 포함한 모든 정삼각형의 넓이의 합은?`,
            answer: texChoices(r, right, [ct(fr(a * a, 4), '\\sqrt{3}'), ct(fr(a * a, 2), '\\sqrt{3}'), ct(fr(a * a, 6), '\\sqrt{3}'), ct(fr(4 * a * a, 3), '\\sqrt{3}'), T(fr(a * a, 3))]),
            steps: [`처음 넓이 $\\frac{\\sqrt3}{4}\\times${a * a} = ${ct(fr(a * a, 4), '\\sqrt{3}')}$`, `닮음비 $\\frac12$ 이므로 넓이의 공비는 $\\frac14$`, `$\\frac{${ct(fr(a * a, 4), '\\sqrt{3}')}}{1-\\frac14} = ${right}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── cal2-3 여러 가지 함수의 미분
  'cal2-3': {
    concepts: [
      {
        title: '무리수 $e$ 와 지수·로그함수의 극한',
        body: '$$\\lim_{x\\to0}(1+x)^{\\frac1x} = \\lim_{x\\to\\infty}\\left(1+\\frac1x\\right)^{x} = e\\ (=2.718\\cdots)$$\n- $\\ln x = \\log_{e}x$ (자연로그)\n- $\\lim_{x\\to0}\\frac{e^{x}-1}{x} = 1$, $\\lim_{x\\to0}\\frac{\\ln(1+x)}{x} = 1$',
      },
      {
        title: '지수·로그함수의 도함수',
        body: '- $(e^{x})' + "'" + ' = e^{x}$, $(a^{x})' + "'" + ' = a^{x}\\ln a$\n- $(\\ln x)' + "'" + ' = \\frac{1}{x}$, $(\\log_{a}x)' + "'" + ' = \\frac{1}{x\\ln a}$\n- 미적분Ⅰ의 곱의 미분법 $(fg)' + "'" + ' = f' + "'" + 'g+fg' + "'" + '$ 도 함께 써요.',
      },
      {
        title: '삼각함수의 덧셈정리',
        body: '- $\\sin(\\alpha\\pm\\beta) = \\sin\\alpha\\cos\\beta\\pm\\cos\\alpha\\sin\\beta$\n- $\\cos(\\alpha\\pm\\beta) = \\cos\\alpha\\cos\\beta\\mp\\sin\\alpha\\sin\\beta$\n- $\\tan(\\alpha\\pm\\beta) = \\frac{\\tan\\alpha\\pm\\tan\\beta}{1\\mp\\tan\\alpha\\tan\\beta}$\n- $\\csc\\theta = \\frac{1}{\\sin\\theta}$, $\\sec\\theta = \\frac1{\\cos\\theta}$, $\\cot\\theta = \\frac{1}{\\tan\\theta}$',
      },
      {
        title: '삼각함수의 극한과 도함수',
        body: '$$\\lim_{x\\to0}\\frac{\\sin x}{x} = 1\\quad(x \\text{는 라디안})$$\n- $\\lim_{x\\to0}\\frac{\\tan x}{x} = 1$, $\\lim_{x\\to0}\\frac{1-\\cos x}{x^{2}} = \\frac12$\n- $(\\sin x)' + "'" + ' = \\cos x$, $(\\cos x)' + "'" + ' = -\\sin x$',
        example: { q: '$\\lim_{x\\to0}\\frac{\\sin 3x}{2x}$', a: '$\\frac{\\sin3x}{3x}\\cdot\\frac32\\to\\frac32$' },
      },
    ],
    skills: [
      {
        id: 'lim-e',
        title: '$e$ 의 정의를 이용한 극한',
        gen(r, level) {
          const a = r.nonzero(-4, 4);
          const b = r.int(2, 5);
          let ex: F, q: string, steps: string[];
          if (level === 1) {
            ex = fr(a);
            q = `\\lim_{x\\to0}(${onePlus(a)})^{\\frac{1}{x}}`;
            steps = [`$${linTex(a, 0)} = t$ 로 놓으면 $\\left\\{(1+t)^{\\frac1t}\\right\\}^{${a}}$`, `$= ${ePow(ex)}$`];
          } else if (level === 2) {
            ex = fr(a * b);
            q = `\\lim_{x\\to\\infty}\\left(1${a > 0 ? '+' : '-'}\\frac{${Math.abs(a)}}{x}\\right)^{${b}x}`;
            steps = [`$\\frac{${a}}{x} = t$ 로 놓으면 $x\\to\\infty$ 일 때 $t\\to0$, $${b}x = \\frac{${a * b}}{t}$`, `$\\left\\{(1+t)^{\\frac1t}\\right\\}^{${a * b}} \\to ${ePow(ex)}$`];
          } else {
            ex = fr(a, b);
            q = `\\lim_{x\\to0}(${onePlus(a)})^{\\frac{1}{${b}x}}`;
            steps = [`$(${onePlus(a)})^{\\frac{1}{${b}x}} = \\left\\{(${onePlus(a)})^{\\frac{1}{${linTex(a, 0)}}}\\right\\}^{${T(fr(a, b))}}$`, `$= ${ePow(ex)}$`];
          }
          const wrongs = [ePow(fr(b, a)), ePow(ex.neg()), ePow(fr(a + b)), ePow(fr(a)), ePow(fr(a * b)), ePow(fr(a, b)), '1'].filter((w) => w !== ePow(ex));
          return {
            q: `$${q}$ 의 값은?`,
            answer: texChoices(r, ePow(ex), wrongs),
            steps,
          };
        },
      },
      {
        id: 'lim-explog',
        title: '지수·로그함수의 극한',
        gen(r, level) {
          const a = r.nonzero(-5, 6);
          const b = r.nonzero(-4, 5);
          const P = (f: F) => (f.n < 0 ? `\\left(${T(f)}\\right)` : T(f));
          if (level === 1) {
            const ex = r.chance(0.5);
            const ans = fr(a, b);
            return {
              q: ex ? `$\\lim_{x\\to0}\\frac{e^{${linTex(a, 0)}}-1}{${linTex(b, 0)}}$ 의 값을 구하세요.` : `$\\lim_{x\\to0}\\frac{\\ln(${onePlus(a)})}{${linTex(b, 0)}}$ 의 값을 구하세요.`,
              answer: fAns(ans),
              steps: [ex ? `$\\frac{e^{${linTex(a, 0)}}-1}{${linTex(a, 0)}}\\cdot${P(ans)}$` : `$\\frac{\\ln(${onePlus(a)})}{${linTex(a, 0)}}\\cdot${P(ans)}$`, `$\\to 1\\times${P(ans)} = ${T(ans)}$`],
            };
          }
          if (level === 2) {
            const ans = fr(a, b);
            return {
              q: `$\\lim_{x\\to0}\\frac{\\ln(${onePlus(a)})}{e^{${linTex(b, 0)}}-1}$ 의 값은?`,
              answer: fChoices(r, ans, [fr(b, a), fr(a * b), fr(-a, b), fr(a + 1, b)]),
              steps: [`$\\frac{\\ln(${onePlus(a)})}{${linTex(a, 0)}}\\cdot\\frac{${linTex(b, 0)}}{e^{${linTex(b, 0)}}-1}\\cdot${P(ans)}$`, `$\\to ${T(ans)}$`],
            };
          }
          let c = r.nonzero(-4, 5);
          if (c === a) c = a + 1;
          const d = r.int(1, 4);
          const ans = fr(a - c, d);
          return {
            q: `$\\lim_{x\\to0}\\frac{e^{${linTex(a, 0)}}-e^{${linTex(c, 0)}}}{${linTex(d, 0)}}$ 의 값을 구하세요.`,
            answer: fAns(ans),
            steps: [`$\\frac{(e^{${linTex(a, 0)}}-1)-(e^{${linTex(c, 0)}}-1)}{${linTex(d, 0)}}$`, `$\\to\\frac{${a}-${paren(c)}}{${d}} = ${T(ans)}$`],
            hint: '분자에 1을 빼고 더해 보세요.',
          };
        },
      },
      {
        id: 'lim-trig',
        title: '삼각함수의 극한',
        gen(r, level) {
          const a = r.int(1, 7);
          let b = r.int(1, 6);
          if (b === a) b = a === 1 ? 2 : a - 1;
          if (level === 1) {
            const ans = fr(a, b);
            return {
              q: `$\\lim_{x\\to0}\\frac{\\sin ${coef(a)}x}{${coef(b)}x}$ 의 값을 구하세요.`,
              answer: fAns(ans),
              steps: [`$\\frac{\\sin${a}x}{${a}x}\\cdot\\frac{${a}}{${b}}\\to\\frac{${a}}{${b}} = ${T(ans)}$`],
            };
          }
          if (level === 2) {
            const ans = fr(a, b);
            return {
              q: `$\\lim_{x\\to0}\\frac{\\tan ${coef(a)}x}{\\sin ${coef(b)}x}$ 의 값은?`,
              answer: fChoices(r, ans, [fr(b, a), fr(a * b), fr(1), fr(a, b * b)]),
              steps: [`$\\frac{\\tan${a}x}{${a}x}\\cdot\\frac{${b}x}{\\sin${b}x}\\cdot\\frac{${a}}{${b}}$`, `$\\to\\frac{${a}}{${b}} = ${T(ans)}$`],
            };
          }
          const ans = fr(a * a, 2 * b);
          return {
            q: `$\\lim_{x\\to0}\\frac{1-\\cos ${coef(a)}x}{${coef(b)}x^{2}}$ 의 값을 구하세요.`,
            answer: fAns(ans),
            steps: [`분자·분모에 $1+\\cos${a}x$ 를 곱하면 $\\frac{\\sin^{2}${a}x}{${b}x^{2}(1+\\cos${a}x)}$`, `$= \\left(\\frac{\\sin${a}x}{${a}x}\\right)^{2}\\cdot\\frac{${a * a}}{${b}(1+\\cos${a}x)}\\to\\frac{${a * a}}{${2 * b}} = ${T(ans)}$`],
          };
        },
      },
      {
        id: 'deriv-value',
        title: '미분계수 구하기',
        gen(r, level) {
          const a = r.nonzero(-5, 5),
            b = r.nonzero(-5, 5);
          if (level === 1) {
            if (r.chance(0.5))
              return {
                q: `함수 $f(x) = (${lin(a, b)})e^{x}$ 에 대하여 $f'(0)$ 의 값을 구하세요.`,
                answer: { type: 'num', value: a + b },
                steps: [`$f'(x) = ${a}e^{x}+(${lin(a, b)})e^{x} = (${lin(a, a + b)})e^{x}$`, `$f'(0) = ${a + b}$`],
              };
            return {
              q: `함수 $f(x) = ${coef(a)}\\ln x${b > 0 ? '+' : '-'}${coef(Math.abs(b))}x^{2}$ 에 대하여 $f'(1)$ 의 값을 구하세요.`,
              answer: { type: 'num', value: a + 2 * b },
              steps: [`$f'(x) = \\frac{${a}}{x}${sgn(2 * b)}x$`, `$f'(1) = ${a}${sgn(2 * b)} = ${a + 2 * b}$`],
            };
          }
          if (level === 2) {
            const v = r.int(0, 1);
            if (v === 0)
              return {
                q: `함수 $f(x) = (${poly([a, 0, b])})\\ln x$ 에 대하여 $f'(1)$ 의 값을 구하세요.`,
                answer: { type: 'num', value: a + b },
                steps: [`$f'(x) = ${2 * a}x\\ln x+\\frac{${poly([a, 0, b])}}{x}$`, `$\\ln1=0$ 이므로 $f'(1) = ${a}${sgn(b)} = ${a + b}$`],
              };
            const at = r.pick([0, 1, 2]);
            const xs = ['0', '\\frac{\\pi}{2}', '\\pi'][at];
            const val = [a, -b, -a][at];
            return {
              q: `함수 $f(x) = ${coef(a)}\\sin x${b > 0 ? '+' : '-'}${coef(Math.abs(b))}\\cos x$ 에 대하여 $f'\\left(${xs}\\right)$ 의 값을 구하세요.`,
              answer: { type: 'num', value: val },
              steps: [`$f'(x) = ${coef(a)}\\cos x${-b > 0 ? '+' : '-'}${coef(Math.abs(b))}\\sin x$`, `$f'\\left(${xs}\\right) = ${val}$`],
            };
          }
          if (r.chance(0.5)) {
            const k = r.int(0, 3);
            const c = r.int(-3, 4);
            return {
              q: `함수 $f(x) = x\\ln x${c === 0 ? '' : c > 0 ? `-${coef(c)}x` : `+${coef(-c)}x`}$ 에 대하여 $f'(${k === 0 ? '1' : k === 1 ? 'e' : `e^{${k}}`})$ 의 값을 구하세요.`,
              answer: { type: 'num', value: k + 1 - c },
              steps: [`$f'(x) = \\ln x+1${c === 0 ? '' : sgn(-c)}$`, `$\\ln ${k === 0 ? '1' : k === 1 ? 'e' : `e^{${k}}`} = ${k}$ 이므로 $f' = ${k}+1${c === 0 ? '' : sgn(-c)} = ${k + 1 - c}$`],
            };
          }
          return {
            q: `함수 $f(x) = e^{x}(${coef(a)}\\sin x${b > 0 ? '+' : '-'}${coef(Math.abs(b))}\\cos x)$ 에 대하여 $f'(0)$ 의 값을 구하세요.`,
            answer: { type: 'num', value: a + b },
            steps: [`$f'(x) = e^{x}(${a}\\sin x${sgn(b)}\\cos x)+e^{x}(${a}\\cos x${sgn(-b)}\\sin x)$`, `$f'(0) = ${b}+${paren(a)} = ${a + b}$`],
          };
        },
      },
      {
        id: 'trig-add',
        title: '삼각함수의 덧셈정리',
        gen(r, level) {
          if (level === 1) {
            const [a1, b1, c1] = r.pick(TRIPLES.slice(0, 5));
            const [a2, b2, c2] = r.pick(TRIPLES.slice(0, 5));
            const sA = fr(a1, c1),
              cA = fr(b1, c1),
              sB = fr(b2, c2),
              cB = fr(a2, c2);
            const kind = r.int(0, 3);
            const name = ['\\sin(\\alpha+\\beta)', '\\sin(\\alpha-\\beta)', '\\cos(\\alpha+\\beta)', '\\cos(\\alpha-\\beta)'][kind];
            const ans = [sA.mul(cB).add(cA.mul(sB)), sA.mul(cB).sub(cA.mul(sB)), cA.mul(cB).sub(sA.mul(sB)), cA.mul(cB).add(sA.mul(sB))][kind];
            return {
              q: `$0<\\alpha<\\frac{\\pi}{2}$, $0<\\beta<\\frac{\\pi}{2}$ 이고 $\\sin\\alpha = ${T(sA)}$, $\\cos\\beta = ${T(cB)}$ 일 때, $${name}$ 의 값을 구하세요.`,
              answer: fAns(ans),
              steps: [`$\\cos\\alpha = \\sqrt{1-\\sin^{2}\\alpha} = ${T(cA)}$, $\\sin\\beta = ${T(sB)}$`, `덧셈정리에 대입하면 $${name} = ${T(ans)}$`],
            };
          }
          if (level === 2) {
            const p = fr(r.nonzero(-4, 4), r.pick([1, 2, 3]));
            const q = fr(r.nonzero(-4, 4), r.pick([1, 2, 3]));
            const den = F.of(1).sub(p.mul(q));
            if (den.eq(0)) return this.gen(r, level);
            const ans = p.add(q).div(den);
            return {
              q: `$\\tan\\alpha = ${T(p)}$, $\\tan\\beta = ${T(q)}$ 일 때, $\\tan(\\alpha+\\beta)$ 의 값은?`,
              answer: fChoices(r, ans, [p.add(q), p.add(q).div(F.of(1).add(p.mul(q)).eq(0) ? fr(2) : F.of(1).add(p.mul(q))), p.sub(q).div(den), p.mul(q)]),
              steps: [`$\\tan(\\alpha+\\beta) = \\frac{\\tan\\alpha+\\tan\\beta}{1-\\tan\\alpha\\tan\\beta} = \\frac{${T(p.add(q))}}{${T(den)}}$`, `$= ${T(ans)}$`],
            };
          }
          let m1 = r.nonzero(-4, 4),
            m2 = r.nonzero(-4, 4);
          if (m1 === m2) m2 = m1 + 1 === 0 ? 2 : m1 + 1;
          if (1 + m1 * m2 === 0) m1 = m1 + (m1 > 0 ? 1 : -1);
          const ans = fr(Math.abs(m1 - m2), Math.abs(1 + m1 * m2));
          return {
            q: `두 직선 $y=${coef(m1)}x$, $y=${coef(m2)}x$ 가 이루는 예각의 크기를 $\\theta$ 라 할 때, $\\tan\\theta$ 의 값을 구하세요.`,
            answer: fAns(ans),
            steps: [`두 직선이 $x$축의 양의 방향과 이루는 각을 $\\alpha$, $\\beta$ 라 하면 $\\tan\\alpha = ${m1}$, $\\tan\\beta = ${m2}$`, `$\\tan\\theta = \\left|\\frac{${m1}-${paren(m2)}}{1+${paren(m1)}\\cdot${paren(m2)}}\\right| = ${T(ans)}$`],
          };
        },
      },
      {
        id: 'deriv-formula',
        title: '도함수 고르기',
        gen(r, level) {
          const a = r.pick([2, 3, 5, 10]);
          const items =
            level === 1
              ? [
                  { f: `${a}^{x}`, d: `${a}^{x}\\ln ${a}`, w: [`x\\cdot${a}^{x-1}`, `\\frac{${a}^{x}}{\\ln ${a}}`, `${a}^{x}`, `${a}^{x-1}\\ln ${a}`] },
                  { f: `\\log_{${a}}x`, d: `\\frac{1}{x\\ln ${a}}`, w: [`\\frac{1}{x}`, `\\frac{\\ln ${a}}{x}`, `\\frac{1}{${a}x}`, `\\frac{x}{\\ln ${a}}`] },
                  { f: `e^{x}+\\ln x`, d: `e^{x}+\\frac{1}{x}`, w: [`e^{x}-\\frac{1}{x}`, `xe^{x-1}+\\frac1x`, `e^{x}+\\ln x`, `e^{x}+x`] },
                ]
              : level === 2
                ? [
                    { f: `xe^{x}`, d: `(x+1)e^{x}`, w: [`e^{x}`, `xe^{x}`, `(x-1)e^{x}`, `x^{2}e^{x-1}`] },
                    { f: `x\\ln x`, d: `\\ln x+1`, w: [`\\frac{1}{x}`, `\\ln x`, `\\ln x-1`, `x\\ln x+1`] },
                    { f: `x^{2}e^{x}`, d: `(x^{2}+2x)e^{x}`, w: [`2xe^{x}`, `x^{2}e^{x}`, `(x^{2}-2x)e^{x}`, `(2x+1)e^{x}`] },
                  ]
                : [
                    { f: `\\sin x\\cos x`, d: `\\cos^{2}x-\\sin^{2}x`, w: [`-\\sin x\\cos x`, `\\cos^{2}x+\\sin^{2}x`, `\\sin^{2}x-\\cos^{2}x`, `2\\sin x\\cos x`] },
                    { f: `e^{x}\\cos x`, d: `e^{x}(\\cos x-\\sin x)`, w: [`e^{x}(\\cos x+\\sin x)`, `-e^{x}\\sin x`, `e^{x}\\sin x`, `e^{x}(\\sin x-\\cos x)`] },
                    { f: `${a}^{x}\\ln x`, d: `${a}^{x}\\left(\\ln ${a}\\ln x+\\frac{1}{x}\\right)`, w: [`${a}^{x}\\left(\\ln x+\\frac1x\\right)`, `\\frac{${a}^{x}\\ln ${a}}{x}`, `${a}^{x}\\left(\\frac{\\ln x}{\\ln ${a}}+\\frac1x\\right)`, `x${a}^{x-1}\\ln x+\\frac{${a}^{x}}{x}`] },
                  ];
          const it = r.pick(items);
          return {
            q: `함수 $f(x) = ${it.f}$ 의 도함수 $f'(x)$ 는?`,
            answer: texChoices(r, it.d, it.w),
            steps: [`$(e^{x})' = e^{x}$, $(a^{x})' = a^{x}\\ln a$, $(\\ln x)' = \\frac1x$, $(\\log_{a}x)' = \\frac{1}{x\\ln a}$, 곱의 미분법 $(fg)' = f'g+fg'$`, `$f'(x) = ${it.d}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── cal2-4 여러 가지 미분법
  'cal2-4': {
    concepts: [
      {
        title: '몫의 미분법',
        body: '$$\\left\\{\\frac{f(x)}{g(x)}\\right\\}' + "'" + ' = \\frac{f' + "'" + '(x)g(x)-f(x)g' + "'" + '(x)}{\\{g(x)\\}^{2}}$$\n- $(\\tan x)' + "'" + ' = \\sec^{2}x$, $(\\sec x)' + "'" + ' = \\sec x\\tan x$\n- $(\\csc x)' + "'" + ' = -\\csc x\\cot x$, $(\\cot x)' + "'" + ' = -\\csc^{2}x$\n- $(x^{n})' + "'" + ' = nx^{n-1}$ 이 정수 $n$ 전체로 확장돼요.',
      },
      {
        title: '합성함수의 미분법',
        body: '$y=f(u)$, $u=g(x)$ 이면\n$$\\frac{dy}{dx} = \\frac{dy}{du}\\cdot\\frac{du}{dx},\\quad \\{f(g(x))\\}' + "'" + ' = f' + "'" + '(g(x))g' + "'" + '(x)$$\n- $\\{\\ln|f(x)|\\}' + "'" + ' = \\frac{f' + "'" + '(x)}{f(x)}$, $(x^{r})' + "'" + ' = rx^{r-1}$ ($r$ 실수)',
        example: { q: '$y=(2x+1)^{5}$ 의 도함수', a: '$5(2x+1)^{4}\\cdot2 = 10(2x+1)^{4}$' },
      },
      {
        title: '매개변수·음함수로 나타낸 함수의 미분',
        body: '- 매개변수 $x=f(t)$, $y=g(t)$: $\\frac{dy}{dx} = \\frac{g' + "'" + '(t)}{f' + "'" + '(t)}$\n- 음함수 $F(x,y)=0$: $y$ 를 $x$ 의 함수로 보고 양변을 $x$ 로 미분한 뒤 $\\frac{dy}{dx}$ 를 구해요.',
      },
      {
        title: '역함수의 미분법과 이계도함수',
        body: '- $g$ 가 $f$ 의 역함수이고 $f(a)=b$ 이면 $g' + "'" + '(b) = \\frac{1}{f' + "'" + '(a)}$\n- $f' + "'" + '(x)$ 의 도함수를 **이계도함수** $f' + "''" + '(x)$ 라 해요. ($\\frac{d^{2}y}{dx^{2}}$)',
      },
    ],
    skills: [
      {
        id: 'quotient',
        title: '몫의 미분법',
        gen(r, level) {
          if (level === 1) {
            const a = r.nonzero(-4, 5),
              b = r.int(-5, 5),
              c = r.int(1, 3),
              d = r.int(-4, 5);
            const k = r.int(-2, 3);
            if (a * d - b * c === 0 || c * k + d === 0) return this.gen(r, level);
            const ans = fr(a * d - b * c, (c * k + d) ** 2);
            return {
              q: `함수 $f(x) = \\frac{${lin(a, b)}}{${lin(c, d)}}$ 에 대하여 $f'(${k})$ 의 값을 구하세요.`,
              answer: fAns(ans),
              steps: [`$f'(x) = \\frac{${a}(${lin(c, d)})-${paren(c)}(${lin(a, b)})}{(${lin(c, d)})^{2}} = \\frac{${a * d - b * c}}{(${lin(c, d)})^{2}}$`, `$f'(${k}) = ${ratio(a * d - b * c, (c * k + d) ** 2)}$`],
            };
          }
          if (level === 2) {
            const a = r.int(-5, 5),
              b = r.nonzero(-3, 3),
              k = r.int(-2, 3);
            if (k + b === 0) return this.gen(r, level);
            const num = k * k + 2 * b * k - a;
            const ans = fr(num, (k + b) ** 2);
            return {
              q: `함수 $f(x) = \\frac{${poly([1, 0, a])}}{${lin(1, b)}}$ 에 대하여 $f'(${k})$ 의 값은?`,
              answer: fChoices(r, ans, [fr(2 * k, 1), fr(k * k + a, (k + b) ** 2), fr(num, k + b), fr(-num, (k + b) ** 2)]),
              steps: [`$f'(x) = \\frac{2x(${lin(1, b)})-(${poly([1, 0, a])})}{(${lin(1, b)})^{2}} = \\frac{${poly([1, 2 * b, -a])}}{(${lin(1, b)})^{2}}$`, `$f'(${k}) = ${ratio(num, (k + b) ** 2)}$`],
            };
          }
          if (r.chance(0.5)) {
            const a = r.nonzero(-4, 4),
              b = r.int(1, 5),
              k = r.int(-2, 3);
            const ans = fr(a * (b - k * k), (k * k + b) ** 2);
            return {
              q: `함수 $f(x) = \\frac{${coef(a)}x}{x^{2}+${b}}$ 에 대하여 $f'(${k})$ 의 값을 구하세요.`,
              answer: fAns(ans),
              steps: [`$f'(x) = \\frac{${a}(x^{2}+${b})-${a}x\\cdot2x}{(x^{2}+${b})^{2}} = \\frac{${a}(${b}-x^{2})}{(x^{2}+${b})^{2}}$`, `$f'(${k}) = ${T(ans)}$`],
            };
          }
          const at = r.pick([0, 1]);
          const ans = at === 0 ? fr(1, 2) : fr(1);
          return {
            q: `함수 $f(x) = \\frac{\\sin x}{1+\\cos x}$ 에 대하여 $f'\\left(${at === 0 ? '0' : '\\frac{\\pi}{2}'}\\right)$ 의 값을 구하세요.`,
            answer: fAns(ans),
            steps: [`$f'(x) = \\frac{\\cos x(1+\\cos x)+\\sin^{2}x}{(1+\\cos x)^{2}} = \\frac{1+\\cos x}{(1+\\cos x)^{2}} = \\frac{1}{1+\\cos x}$`, `$f'\\left(${at === 0 ? '0' : '\\frac{\\pi}{2}'}\\right) = ${T(ans)}$`],
          };
        },
      },
      {
        id: 'chain',
        title: '합성함수의 미분법',
        gen(r, level) {
          if (level === 1) {
            const a = r.nonzero(-3, 3),
              b = r.int(-3, 3),
              n = r.int(2, 5),
              k = r.int(-1, 2);
            const ans = n * a * (a * k + b) ** (n - 1);
            return {
              q: `함수 $f(x) = (${lin(a, b)})^{${n}}$ 에 대하여 $f'(${k})$ 의 값을 구하세요.`,
              answer: { type: 'num', value: ans },
              steps: [`$f'(x) = ${n}(${lin(a, b)})^{${n - 1}}\\cdot${paren(a)}$`, `$f'(${k}) = ${n}\\times${paren(a * k + b)}^{${n - 1}}\\times${paren(a)} = ${ans}$`],
            };
          }
          if (level === 2) {
            if (r.chance(0.5)) {
              const a = r.int(1, 6),
                k = r.int(-3, 3);
              const ans = fr(2 * k, k * k + a);
              return {
                q: `함수 $f(x) = \\ln(x^{2}+${a})$ 에 대하여 $f'(${k})$ 의 값은?`,
                answer: fChoices(r, ans, [fr(1, k * k + a), fr(2 * k), fr(k, k * k + a), fr(2, k * k + a)]),
                steps: [`$f'(x) = \\frac{2x}{x^{2}+${a}}$`, `$f'(${k}) = \\frac{${2 * k}}{${k * k + a}} = ${T(ans)}$`],
              };
            }
            const b = r.nonzero(-5, 5);
            return {
              q: `함수 $f(x) = e^{${poly([1, b, 0])}}$ 에 대하여 $f'(${-b})$ 의 값은?`,
              answer: numChoices(r, -b, [b, 0, 1, -2 * b, b * b]),
              steps: [`$f'(x) = (${lin(2, b)})e^{${poly([1, b, 0])}}$`, `$x=${-b}$ 에서 지수는 $0$, $2x+${paren(b)}$ 는 $${-b}$ → $f'(${-b}) = ${-b}$`],
            };
          }
          if (r.chance(0.5)) {
            const a = r.int(1, 5),
              k = r.int(0, 4),
              s = r.int(1, 5);
            const b = s * s - a * k;
            const ans = fr(a, 2 * s);
            return {
              q: `함수 $f(x) = \\sqrt{${lin(a, b)}}$ 에 대하여 $f'(${k})$ 의 값을 구하세요.`,
              answer: fAns(ans),
              steps: [`$f'(x) = \\frac{${a}}{2\\sqrt{${lin(a, b)}}}$`, `$f'(${k}) = \\frac{${a}}{2\\sqrt{${s * s}}} = ${T(ans)}$`],
            };
          }
          const g1 = r.int(-3, 4),
            gp = r.nonzero(-4, 4),
            fp = r.nonzero(-5, 5),
            x0 = r.int(-2, 3);
          return {
            q: `미분가능한 두 함수 $f(x)$, $g(x)$ 에 대하여 $g(${x0}) = ${g1}$, $g'(${x0}) = ${gp}$, $f'(${g1}) = ${fp}$ 이다. $h(x) = f(g(x))$ 일 때, $h'(${x0})$ 의 값을 구하세요.`,
            answer: { type: 'num', value: fp * gp },
            steps: [`$h'(x) = f'(g(x))g'(x)$`, `$h'(${x0}) = f'(${g1})\\times g'(${x0}) = ${fp}\\times${paren(gp)} = ${fp * gp}$`],
          };
        },
      },
      {
        id: 'parametric',
        title: '매개변수로 나타낸 함수의 미분',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(-4, 4),
              b = r.int(-5, 5),
              k = r.int(-3, 3);
            return {
              q: `매개변수 $t$ 로 나타낸 함수 $x = ${lin(1, a, 't')}$, $y = ${poly([1, b, 0], 't')}$ 에서 $t=${k}$ 일 때 $\\frac{dy}{dx}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: 2 * k + b },
              steps: [`$\\frac{dx}{dt} = 1$, $\\frac{dy}{dt} = ${lin(2, b, 't')}$`, `$\\frac{dy}{dx} = ${lin(2, b, 't')}$, $t=${k}$ 대입: $${2 * k + b}$`],
            };
          }
          if (level === 2) {
            const a = r.int(-4, 4),
              b = r.int(-5, 5),
              k = r.nonzero(-3, 3);
            if (2 * k + a === 0) return this.gen(r, level);
            const ans = fr(3 * k * k + b, 2 * k + a);
            return {
              q: `매개변수 $t$ 로 나타낸 함수 $x = ${poly([1, a, 0], 't')}$, $y = ${poly([1, 0, b, 0], 't')}$ 에서 $t=${k}$ 일 때 $\\frac{dy}{dx}$ 의 값은?`,
              answer: fChoices(r, ans, [fr(2 * k + a, 3 * k * k + b || 5), fr(3 * k * k + b), fr(3 * k * k, 2 * k), fr(3 * k * k + b, 2 * k)]),
              steps: [`$\\frac{dx}{dt} = ${lin(2, a, 't')}$, $\\frac{dy}{dt} = ${poly([3, 0, b], 't')}$`, `$\\frac{dy}{dx} = \\frac{${3 * k * k + b}}{${2 * k + a}} = ${T(ans)}$`],
            };
          }
          if (r.chance(0.5)) {
            const a = r.int(1, 5),
              b = r.int(1, 5);
            const ans = fr(-b, a);
            return {
              q: `매개변수 $t$ 로 나타낸 곡선 $x = ${coef(a)}\\cos t$, $y = ${coef(b)}\\sin t$ 위의 $t=\\frac{\\pi}{4}$ 인 점에서의 접선의 기울기를 구하세요.`,
              answer: fAns(ans),
              steps: [`$\\frac{dx}{dt} = -${coef(a)}\\sin t$, $\\frac{dy}{dt} = ${coef(b)}\\cos t$`, `$\\frac{dy}{dx} = -\\frac{${coef(b)}\\cos t}{${coef(a)}\\sin t}$, $t=\\frac{\\pi}{4}$ 에서 $${T(ans)}$`],
            };
          }
          const a = r.int(-4, 4),
            k = r.int(1, 4);
          return {
            q: `매개변수 $t$ $(t>0)$ 로 나타낸 함수 $x = \\ln t$, $y = ${poly([1, a, 0], 't')}$ 에서 $t=${k}$ 일 때 $\\frac{dy}{dx}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: k * (2 * k + a) },
            steps: [`$\\frac{dx}{dt} = \\frac1t$, $\\frac{dy}{dt} = ${lin(2, a, 't')}$`, `$\\frac{dy}{dx} = t(${lin(2, a, 't')})$, $t=${k}$: $${k * (2 * k + a)}$`],
          };
        },
      },
      {
        id: 'implicit',
        title: '음함수의 미분',
        gen(r, level) {
          if (level === 1) {
            const [a, b, c] = r.pick(TRIPLES.slice(0, 5));
            const [p, q] = r.chance(0.5) ? [a * r.sign(), b * r.sign()] : [b * r.sign(), a * r.sign()];
            const ans = fr(-p, q);
            return {
              q: `원 $x^{2}+y^{2}=${c * c}$ 위의 점 $(${p}, ${q})$ 에서의 접선의 기울기를 음함수의 미분법으로 구하세요.`,
              answer: fAns(ans),
              steps: [`양변을 $x$ 로 미분: $2x+2y\\frac{dy}{dx} = 0$`, `$\\frac{dy}{dx} = -\\frac{x}{y} = -\\frac{${p}}{${q}} = ${T(ans)}$`],
            };
          }
          if (level === 2) {
            const a = r.nonzero(-3, 3),
              x0 = r.nonzero(-3, 3),
              y0 = r.nonzero(-3, 3);
            const den = a * x0 + 2 * y0;
            if (den === 0) return this.gen(r, level);
            const c = x0 * x0 + a * x0 * y0 + y0 * y0;
            const ans = fr(-(2 * x0 + a * y0), den);
            return {
              q: `곡선 $x^{2}${a > 0 ? '+' : '-'}${coef(Math.abs(a))}xy+y^{2}=${c}$ 위의 점 $(${x0}, ${y0})$ 에서 $\\frac{dy}{dx}$ 의 값은?`,
              answer: fChoices(r, ans, [fr(-x0, y0), fr(2 * x0 + a * y0, den), fr(-(2 * x0 + a * x0), a * y0 + 2 * y0 || 1), fr(-(2 * x0), a * x0 + 2 * y0)]),
              steps: [`$2x${sgn(a)}y${sgn(a)}x\\frac{dy}{dx}+2y\\frac{dy}{dx} = 0$`, `$\\frac{dy}{dx} = -\\frac{2x${sgn(a)}y}{${a}x+2y}$`, `$(${x0}, ${y0})$ 대입: $${T(ans)}$`],
            };
          }
          const a = r.int(1, 3),
            x0 = r.nonzero(-3, 3),
            y0 = r.nonzero(-2, 2);
          const c = x0 * x0 * y0 + a * y0 ** 3;
          const ans = fr(-2 * x0 * y0, x0 * x0 + 3 * a * y0 * y0);
          return {
            q: `곡선 $x^{2}y+${coef(a)}y^{3}=${c}$ 위의 점 $(${x0}, ${y0})$ 에서의 접선의 기울기를 구하세요.`,
            answer: fAns(ans),
            steps: [`양변을 $x$ 로 미분: $2xy+x^{2}\\frac{dy}{dx}+${3 * a}y^{2}\\frac{dy}{dx} = 0$`, `$\\frac{dy}{dx} = -\\frac{2xy}{x^{2}+${3 * a}y^{2}}$`, `대입: $-\\frac{${2 * x0 * y0}}{${x0 * x0 + 3 * a * y0 * y0}} = ${T(ans)}$`],
          };
        },
      },
      {
        id: 'inverse',
        title: '역함수의 미분법',
        gen(r, level) {
          if (level <= 2) {
            const a = r.int(1, 5),
              b = r.int(-5, 5);
            const k = level === 1 ? r.int(0, 1) : r.int(-2, 2);
            const c = k ** 3 + a * k + b;
            const ans = fr(1, 3 * k * k + a);
            const body = {
              q: `함수 $f(x) = ${poly([1, 0, a, b])}$ 의 역함수를 $g(x)$ 라 할 때, $g'(${c})$ 의 값${level === 1 ? '을 구하세요.' : '은?'}`,
              steps: [`$f(${k}) = ${c}$ 이므로 $g(${c}) = ${k}$`, `$f'(x) = 3x^{2}+${a}$, $f'(${k}) = ${3 * k * k + a}$`, `$g'(${c}) = \\frac{1}{f'(${k})} = ${T(ans)}$`],
            };
            return level === 1 ? { ...body, answer: fAns(ans) } : { ...body, answer: fChoices(r, ans, [fr(3 * k * k + a), fr(1, 3 * c * c + a), fr(-1, 3 * k * k + a), fr(1, 3 * k * k || 2)]) };
          }
          const a = r.int(1, 6);
          return {
            q: `함수 $f(x) = e^{x}+${coef(a)}x$ 의 역함수를 $g(x)$ 라 할 때, $g'(1)$ 의 값을 구하세요.`,
            answer: fAns(fr(1, 1 + a)),
            steps: [`$f(0) = 1$ 이므로 $g(1) = 0$`, `$f'(x) = e^{x}+${a}$, $f'(0) = ${1 + a}$`, `$g'(1) = \\frac{1}{${1 + a}}$`],
          };
        },
      },
      {
        id: 'second',
        title: '이계도함수',
        gen(r, level) {
          if (level === 1) {
            const a = r.nonzero(-3, 4),
              b = r.nonzero(-5, 5);
            return {
              q: `함수 $f(x) = ${coef(a)}x^{3}${b > 0 ? '+' : '-'}${coef(Math.abs(b))}\\ln x$ 에 대하여 $f''(1)$ 의 값을 구하세요.`,
              answer: { type: 'num', value: 6 * a - b },
              steps: [`$f'(x) = ${6 * a / 2}x^{2}${b > 0 ? '+' : '-'}\\frac{${Math.abs(b)}}{x}$`, `$f''(x) = ${6 * a}x${b > 0 ? '-' : '+'}\\frac{${Math.abs(b)}}{x^{2}}$`, `$f''(1) = ${6 * a}${sgn(-b)} = ${6 * a - b}$`],
            };
          }
          if (level === 2) {
            const a = r.nonzero(-3, 3),
              b = r.int(-4, 4);
            return {
              q: `함수 $f(x) = e^{${coef(a)}x}(${lin(1, b)})$ 에 대하여 $f''(0)$ 의 값을 구하세요.`,
              answer: { type: 'num', value: a * a * b + 2 * a },
              steps: [`$f'(x) = e^{${linTex(a, 0)}}\\{${a}(${lin(1, b)})+1\\}$`, `$f''(x) = e^{${linTex(a, 0)}}\\{${a * a}(${lin(1, b)})${sgn(2 * a)}\\}$`, `$f''(0) = ${a * a}\\times${paren(b)}+${paren(2 * a)} = ${a * a * b + 2 * a}$`],
            };
          }
          const r1 = r.int(-4, 4);
          let r2 = r.int(-4, 4);
          if (r2 === r1) r2 = r1 + 1;
          const s = r1 + r2,
            p = r1 * r2;
          return {
            q: `함수 $f(x) = e^{kx}$ 가 모든 실수 $x$ 에 대하여 $f''(x)${s === 0 ? '' : s > 0 ? `-${coef(s)}f'(x)` : `+${coef(-s)}f'(x)`}${p === 0 ? '' : p > 0 ? `+${p}f(x)` : `${p}f(x)`} = 0$ 을 만족시킬 때, 상수 $k$ 의 값을 모두 구하세요.`,
            answer: { type: 'set', values: [r1, r2] },
            steps: [`$f'(x) = ke^{kx}$, $f''(x) = k^{2}e^{kx}$`, `$e^{kx}(${poly([1, -s, p], 'k')}) = 0$, $e^{kx}>0$`, `$k = ${Math.min(r1, r2)}$ 또는 $k = ${Math.max(r1, r2)}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── cal2-5 도함수의 활용
  'cal2-5': {
    concepts: [
      {
        title: '접선의 방정식',
        body: '곡선 $y=f(x)$ 위의 점 $(a, f(a))$ 에서의 접선:\n$$y-f(a) = f' + "'" + '(a)(x-a)$$\n- 미적분Ⅰ과 같지만, 지수·로그·삼각함수와 매개변수·음함수 곡선에도 써요.',
      },
      {
        title: '극대·극소',
        body: "- $f'(a)=0$ 이고 그 좌우에서 $f'$ 의 부호가 양→음이면 극대, 음→양이면 극소\n- 이계도함수 판정: $f'(a)=0$, $f''(a)<0$ 이면 극대, $f''(a)>0$ 이면 극소",
      },
      {
        title: '오목·볼록과 변곡점',
        body: "- 어떤 구간에서 $f''(x)>0$ 이면 곡선은 **아래로 볼록**, $f''(x)<0$ 이면 **위로 볼록**\n- $f''(a)=0$ 이고 그 좌우에서 $f''$ 의 부호가 바뀌면 점 $(a, f(a))$ 가 **변곡점**",
        example: { q: '$y=x^{3}-3x^{2}$ 의 변곡점', a: "$y''=6x-6=0$, $x=1$ → $(1, -2)$" },
      },
      {
        title: '평면 위의 운동',
        body: "점 P 의 위치가 $(x, y) = (f(t), g(t))$ 일 때\n- 속도 $\\left(\\frac{dx}{dt}, \\frac{dy}{dt}\\right)$, 속력 $\\sqrt{\\left(\\frac{dx}{dt}\\right)^{2}+\\left(\\frac{dy}{dt}\\right)^{2}}$\n- 가속도 $\\left(\\frac{d^{2}x}{dt^{2}}, \\frac{d^{2}y}{dt^{2}}\\right)$, 그 크기도 같은 방법으로",
      },
    ],
    skills: [
      {
        id: 'tangent',
        title: '접선의 방정식',
        gen(r, level) {
          const ans = (m: F, n: F, steps: string[], q: string): ProblemDraft => ({
            q: q + ' 접선의 방정식을 $y=mx+n$ 이라 할 때 $m$, $n$ 을 구하세요.',
            answer: { type: 'fields', fields: [{ label: 'm', value: m.value }, { label: 'n', value: n.value }] },
            steps,
          });
          if (level === 1) {
            const a = r.nonzero(-4, 4),
              b = r.int(-4, 4);
            return ans(fr(a + b), fr(a), [`$f(0) = ${a}$`, `$y' = ${coef(a)}e^{x}${b === 0 ? '' : sgn(b)}$, $x=0$ 에서 기울기 $${a + b}$`, `$y = ${lin(a + b, a)}$`], `곡선 $y=${coef(a)}e^{x}${b === 0 ? '' : b > 0 ? `+${coef(b)}x` : `-${coef(-b)}x`}$ 위의 점 $(0, ${a})$ 에서의`);
          }
          if (level === 2) {
            const a = r.int(1, 4),
              x0 = r.int(-3, 3);
            const b = 1 - a * x0;
            return ans(fr(a), fr(-a * x0), [`$x=${x0}$ 일 때 $y=\\ln1 = 0$`, `$y' = \\frac{${a}}{${lin(a, b)}}$, $x=${x0}$ 에서 기울기 $${a}$`, `$y = ${a}(x${x0 === 0 ? '' : sgn(-x0)}) = ${lin(a, -a * x0)}$`], `곡선 $y=\\ln(${lin(a, b)})$ 위의 점 $(${x0}, 0)$ 에서의`);
          }
          const a = r.int(-3, 3),
            b = r.int(-4, 4),
            k = r.nonzero(-2, 3);
          const x0 = k * k + a,
            y0 = k ** 3 + b * k;
          const m = fr(3 * k * k + b, 2 * k);
          const n = fr(y0).sub(m.mul(x0));
          return ans(m, n, [`$t=${k}$ 일 때 점 $(${x0}, ${y0})$`, `$\\frac{dy}{dx} = \\frac{3t^{2}${b === 0 ? '' : sgn(b)}}{2t}$, $t=${k}$ 에서 $${T(m)}$`, `$y = ${T(m)}(x-${paren(x0)})+${paren(y0)}$ → $n = ${T(n)}$`], `매개변수 $t$ 로 나타낸 곡선 $x = ${poly([1, 0, a], 't')}$, $y = ${poly([1, 0, b, 0], 't')}$ 위의 $t=${k}$ 인 점에서의`);
        },
      },
      {
        id: 'extremum',
        title: '극대·극소',
        gen(r, level) {
          const p = r.int(-4, 2);
          const q = p + r.int(1, 4);
          const a = -(p + q) - 2;
          const b = p * q - a;
          const f = `(${poly([1, a, b])})e^{x}`;
          if (level === 1) {
            const askMax = r.chance(0.5);
            return {
              q: `함수 $f(x) = ${f}$ 가 ${askMax ? '극대' : '극소'}가 되는 $x$ 의 값을 구하세요.`,
              answer: { type: 'num', value: askMax ? p : q },
              steps: [`$f'(x) = (${poly([1, a + 2, a + b])})e^{x} = ${p === 0 ? 'x' : `(${lin(1, -p)})`}${q === 0 ? 'x' : `(${lin(1, -q)})`}e^{x}$`, `$f'$ 의 부호: $x<${p}$ 에서 $+$, $${p}<x<${q}$ 에서 $-$, $x>${q}$ 에서 $+$`, `극대 $x=${p}$, 극소 $x=${q}$`],
            };
          }
          if (level === 2) {
            const c = r.int(-2, 4);
            const right = c - 1 === 0 ? '-1' : `-${ePow(c - 1)}`;
            return {
              q: `함수 $f(x) = ${c === 0 ? 'x' : `(${lin(1, -c)})`}e^{x}$ 의 극솟값은?`,
              answer: texChoices(r, right, [ePow(c - 1), `-${ePow(c)}`, `-${ePow(c + 1)}`, `${c - 1}`, c === 1 ? '-e' : '-1'].filter((w) => w !== right)),
              steps: [`$f'(x) = e^{x}+${c === 0 ? 'x' : `(${lin(1, -c)})`}e^{x} = (${lin(1, 1 - c)})e^{x}$`, `$x=${c - 1}$ 에서 극소`, `$f(${c - 1}) = (-1)e^{${c - 1}} = ${right}$`],
            };
          }
          return {
            q: `함수 $f(x) = (x^{2}+ax+b)e^{x}$ 가 $x=${p}$ 에서 극대, $x=${q}$ 에서 극소일 때, 상수 $a$, $b$ 에 대하여 $a+b$ 의 값을 구하세요.`,
            answer: { type: 'num', value: a + b },
            steps: [`$f'(x) = \\{x^{2}+(a+2)x+a+b\\}e^{x}$`, `$x^{2}+(a+2)x+a+b = (x-${paren(p)})(x-${paren(q)})$`, `$a+2 = ${-(p + q)}$, $a+b = ${p * q}$ → $a = ${a}$, $b = ${b}$`, `$a+b = ${a + b}$`],
          };
        },
      },
      {
        id: 'inflection',
        title: '오목·볼록과 변곡점',
        gen(r, level) {
          if (level === 1) {
            const h = r.int(-3, 3);
            const a = -3 * h;
            const b = r.int(-6, 6),
              c = r.int(-5, 5);
            const y = h ** 3 + a * h * h + b * h + c;
            return {
              q: `곡선 $y = ${poly([1, a, b, c])}$ 의 변곡점의 좌표를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'x', value: h }, { label: 'y', value: y }] },
              steps: [`$y' = ${poly([3, 2 * a, b])}$, $y'' = ${poly([6, 2 * a])}$`, `$y''=0$ 에서 $x=${h}$, 좌우에서 부호가 바뀜`, `변곡점 $(${h}, ${y})$`],
            };
          }
          if (level === 2) {
            const b = r.int(-4, 4);
            const ans = -b - 2;
            const xe = (k: number) => (k === 0 ? 'x' : `(${lin(1, k)})`);
            return {
              q: `곡선 $y = ${xe(b)}e^{x}$ 의 변곡점의 $x$ 좌표는?`,
              answer: numChoices(r, ans, [-b - 1, -b, -b + 1, -b - 3]),
              steps: [`$y' = ${xe(b + 1)}e^{x}$, $y'' = ${xe(b + 2)}e^{x}$`, `$y''=0$ 에서 $x=${ans}$ (좌우 부호 변화)`],
            };
          }
          if (r.chance(0.5)) {
            const c = r.int(1, 4);
            return {
              q: `함수 $f(x) = ${coef(c)}x^{2}+k\\sin x$ 의 그래프가 변곡점을 갖지 않도록 하는 정수 $k$ 의 개수를 구하세요.`,
              answer: { type: 'num', value: 4 * c + 1, unit: '개' },
              steps: [`$f''(x) = ${2 * c}-k\\sin x$`, `변곡점이 없으려면 $f''(x)$ 의 부호가 바뀌지 않아야 하므로 $|k|\\le${2 * c}$`, `정수 $k$: $-${2 * c}$ 부터 $${2 * c}$ 까지 $${4 * c + 1}$개`],
              hint: '$-1\\le\\sin x\\le1$ 을 이용하세요.',
            };
          }
          const a = r.int(1, 6);
          return {
            q: `곡선 $y = \\ln(x^{2}+${a * a})$ 의 두 변곡점 사이의 거리를 구하세요.`,
            answer: { type: 'num', value: 2 * a },
            steps: [`$y' = \\frac{2x}{x^{2}+${a * a}}$, $y'' = \\frac{2(${a * a}-x^{2})}{(x^{2}+${a * a})^{2}}$`, `$y''=0$: $x=\\pm${a}$ (부호 변화), 두 점의 $y$ 좌표는 같음`, `거리 $= ${2 * a}$`],
          };
        },
      },
      {
        id: 'motion',
        title: '평면 위의 운동',
        gen(r, level) {
          const [u0, v0, w] = r.pick(TRIPLES.slice(0, 5));
          const [u, v] = r.chance(0.5) ? [u0, v0] : [v0, u0];
          const k = r.int(1, 3);
          if (level === 1) {
            const al = u - 2 * k;
            return {
              q: `좌표평면 위를 움직이는 점 P 의 시각 $t$ 에서의 위치가 $x = ${poly([1, al, 0], 't')}$, $y = ${v}t$ 일 때, $t=${k}$ 에서 점 P 의 속력을 구하세요.`,
              answer: { type: 'num', value: w },
              steps: [`속도: $\\left(${lin(2, al, 't')}, ${v}\\right)$, $t=${k}$ 에서 $(${u}, ${v})$`, `속력 $\\sqrt{${u}^{2}+${v}^{2}} = ${w}$`],
            };
          }
          if (level === 2) {
            const al = u - 2 * k,
              ga = v - k * k;
            return {
              q: `좌표평면 위를 움직이는 점 P 의 시각 $t$ 에서의 위치가 $x = ${poly([1, al, 0], 't')}$, $y = \\frac{1}{3}t^{3}${ga === 0 ? '' : ga > 0 ? `+${coef(ga)}t` : `-${coef(-ga)}t`}$ 일 때, $t=${k}$ 에서 점 P 의 속력은?`,
              answer: numChoices(r, w, [u + v, w * w, Math.abs(u - v), u * u + v * v - w]),
              steps: [`$\\frac{dx}{dt} = ${lin(2, al, 't')}$, $\\frac{dy}{dt} = t^{2}${ga === 0 ? '' : sgn(ga)}$`, `$t=${k}$: $(${u}, ${v})$`, `속력 $= \\sqrt{${u * u}+${v * v}} = ${w}$`],
            };
          }
          const [U, V, W] = r.pick([
            [6, 8, 10],
            [10, 24, 26],
            [16, 12, 20],
            [12, 16, 20],
            [8, 6, 10],
            [24, 10, 26],
          ] as [number, number, number][]);
          const kk = r.int(1, 2);
          const al = (U - 6 * kk) / 2;
          const be = V / 2;
          return {
            q: `좌표평면 위를 움직이는 점 P 의 시각 $t$ 에서의 위치가 $x = ${poly([1, al, 0, 0], 't')}$, $y = ${coef(be)}t^{2}$ 일 때, $t=${kk}$ 에서 점 P 의 가속도의 크기를 구하세요.`,
            answer: { type: 'num', value: W },
            steps: [`속도 $(${poly([3, 2 * al, 0], 't')}, ${2 * be}t)$, 가속도 $(${lin(6, 2 * al, 't')}, ${2 * be})$`, `$t=${kk}$: $(${U}, ${V})$`, `크기 $\\sqrt{${U * U}+${V * V}} = ${W}$`],
          };
        },
      },
      {
        id: 'maxmin',
        title: '최댓값·최솟값',
        gen(r, level) {
          const a = r.int(2, 6);
          const lnA = `\\ln ${a}`;
          let q: string, right: string, wrongs: string[], steps: string[];
          if (level === 1) {
            q = `함수 $f(x) = xe^{-\\frac{x}{${a}}}$ 의 최댓값은?`;
            right = `\\frac{${a}}{e}`;
            wrongs = [`${a}e`, `\\frac{1}{e}`, `\\frac{${a}}{e^{2}}`, `\\frac{e}{${a}}`, `${a}`];
            steps = [`$f'(x) = e^{-\\frac{x}{${a}}}\\left(1-\\frac{x}{${a}}\\right)$`, `$x=${a}$ 에서 증가→감소, 최대`, `$f(${a}) = ${a}e^{-1} = ${right}$`];
          } else if (level === 2) {
            if (r.chance(0.5)) {
              q = `$x>0$ 에서 함수 $f(x) = ${a}\\ln x-x$ 의 최댓값은?`;
              right = `${a}${lnA}-${a}`;
              wrongs = [`${a}${lnA}+${a}`, `${lnA}-${a}`, `${a}-${a}${lnA}`, `${a}${lnA}`, `-1`];
              steps = [`$f'(x) = \\frac{${a}}{x}-1 = 0$ 에서 $x=${a}$`, `$x=${a}$ 의 좌우에서 $f'$ 가 양→음이므로 최대`, `$f(${a}) = ${right}$`];
            } else {
              q = `$x>0$ 에서 함수 $f(x) = x-${a}\\ln x$ 의 최솟값은?`;
              right = `${a}-${a}${lnA}`;
              wrongs = [`${a}+${a}${lnA}`, `${a}${lnA}-${a}`, `1-${lnA}`, `${a}-${lnA}`, `1`];
              steps = [`$f'(x) = 1-\\frac{${a}}{x} = 0$ 에서 $x=${a}$`, `좌우에서 $f'$ 가 음→양이므로 최소`, `$f(${a}) = ${right}$`];
            }
          } else {
            q = `함수 $f(x) = e^{x}-${a}x$ 의 최솟값은?`;
            right = `${a}-${a}${lnA}`;
            wrongs = [`${a}+${a}${lnA}`, `${a}${lnA}`, `${a}${lnA}-${a}`, `e-${a}`, `${a}-${lnA}`];
            steps = [`$f'(x) = e^{x}-${a} = 0$ 에서 $x = ${lnA}$`, `좌우에서 $f'$ 가 음→양이므로 최소`, `$f(${lnA}) = ${a}-${a}${lnA}$`];
          }
          return { q, answer: texChoices(r, right, wrongs), steps };
        },
      },
    ],
  },

  // ───────────────────────── cal2-6 여러 가지 적분법
  'cal2-6': {
    concepts: [
      {
        title: '여러 가지 함수의 부정적분',
        body: '- $\\int\\frac{1}{x}dx = \\ln|x|+C$\n- $\\int e^{x}dx = e^{x}+C$, $\\int a^{x}dx = \\frac{a^{x}}{\\ln a}+C$\n- $\\int\\sin x\\,dx = -\\cos x+C$, $\\int\\cos x\\,dx = \\sin x+C$\n- $\\int\\sec^{2}x\\,dx = \\tan x+C$, $\\int\\csc^{2}x\\,dx = -\\cot x+C$',
      },
      {
        title: '치환적분법',
        body: '$g(x)=t$ 로 놓으면 $g' + "'" + '(x)dx = dt$\n$$\\int f(g(x))g' + "'" + '(x)\\,dx = \\int f(t)\\,dt$$\n- $\\int\\frac{f' + "'" + '(x)}{f(x)}dx = \\ln|f(x)|+C$\n- 정적분에서는 적분 구간도 $t$ 의 값으로 바꿔요.',
        example: { q: '$\\int_{0}^{1}2x(x^{2}+1)^{2}dx$', a: '$t=x^{2}+1$: $\\int_{1}^{2}t^{2}dt = \\frac{7}{3}$' },
      },
      {
        title: '부분적분법',
        body: '$$\\int f(x)g' + "'" + '(x)\\,dx = f(x)g(x)-\\int f' + "'" + '(x)g(x)\\,dx$$\n- 곱의 미분법을 거꾸로 쓴 것이에요.\n- 미분할 쪽 $f$ 를 고르는 순서: 로그 → 다항식 → 삼각·지수',
      },
    ],
    skills: [
      {
        id: 'antideriv',
        title: '여러 가지 함수의 부정적분',
        gen(r, level) {
          const a = r.int(2, 5),
            b = r.int(2, 5);
          const items =
            level === 1
              ? [
                  { f: `${a}e^{x}+\\frac{${b}}{x}`, d: `${a}e^{x}+${b}\\ln|x|+C`, w: [`${a}e^{x}-\\frac{${b}}{x^{2}}+C`, `${a}xe^{x}+${b}\\ln|x|+C`, `${a}e^{x}+${b % 2 === 0 ? (b === 2 ? '' : b / 2) : `\\frac{${b}}{2}`}x^{2}+C`, `${a}e^{x}+${b}x\\ln|x|+C`] },
                  { f: `${a}^{x}`, d: `\\frac{${a}^{x}}{\\ln ${a}}+C`, w: [`${a}^{x}\\ln ${a}+C`, `\\frac{${a}^{x+1}}{x+1}+C`, `${a}^{x}+C`, `x\\cdot${a}^{x-1}+C`] },
                ]
              : level === 2
                ? [
                    { f: `${a}\\sin x+${b}\\cos x`, d: `-${a}\\cos x+${b}\\sin x+C`, w: [`${a}\\cos x-${b}\\sin x+C`, `${a}\\cos x+${b}\\sin x+C`, `-${a}\\cos x-${b}\\sin x+C`, `${a}\\sin x+${b}\\cos x+C`] },
                    { f: `${a}\\sec^{2}x`, d: `${a}\\tan x+C`, w: [`${a}\\sec x\\tan x+C`, `-${a}\\tan x+C`, `${a}\\sec x+C`, `\\frac{${a}}{3}\\sec^{3}x+C`] },
                  ]
                : [
                    { f: `\\tan^{2}x`, d: `\\tan x-x+C`, w: [`\\tan x+x+C`, `\\frac{1}{3}\\tan^{3}x+C`, `\\sec^{2}x-x+C`, `\\sec x\\tan x+C`] },
                    { f: `\\frac{x+${a}}{x}`, d: `x+${a}\\ln|x|+C`, w: [`1-\\frac{${a}}{x^{2}}+C`, `x+\\frac{${a}}{x}+C`, `\\frac{x^{2}}{2}+${a}x+C`, `x\\ln|x|+${a}+C`] },
                    { f: `(e^{x}+1)^{2}`, d: `\\frac{1}{2}e^{2x}+2e^{x}+x+C`, w: [`\\frac13(e^{x}+1)^{3}+C`, `e^{2x}+2e^{x}+x+C`, `\\frac12e^{2x}+e^{x}+x+C`, `2(e^{x}+1)e^{x}+C`] },
                  ];
          const it = r.pick(items);
          return {
            q: `$\\int\\left(${it.f}\\right)dx$ 는? (단, $C$ 는 적분상수)`,
            answer: texChoices(r, it.d, it.w),
            steps: [`기본 공식: $\\int e^{x}dx = e^{x}+C$, $\\int\\frac1xdx = \\ln|x|+C$, $\\int a^{x}dx = \\frac{a^{x}}{\\ln a}+C$, $\\int\\sec^{2}x\\,dx = \\tan x+C$`, `$= ${it.d}$`],
          };
        },
      },
      {
        id: 'definite-basic',
        title: '여러 가지 함수의 정적분',
        gen(r, level) {
          if (level === 1) {
            if (r.chance(0.5)) {
              const a = r.int(1, 6),
                k = r.int(1, 4);
              return {
                q: `$\\int_{1}^{${k === 1 ? 'e' : `e^{${k}}`}}\\frac{${a}}{x}dx$ 의 값을 구하세요.`,
                answer: { type: 'num', value: a * k },
                steps: [`$\\left[${a === 1 ? '' : a}\\ln x\\right]_{1}^{${k === 1 ? 'e' : `e^{${k}}`}} = ${a === 1 ? `${k}-0` : `${a}(${k}-0)`} = ${a * k}$`],
              };
            }
            const k = r.int(2, 9);
            return {
              q: `$\\int_{0}^{\\ln ${k}}e^{x}dx$ 의 값을 구하세요.`,
              answer: { type: 'num', value: k - 1 },
              steps: [`$\\left[e^{x}\\right]_{0}^{\\ln${k}} = ${k}-1 = ${k - 1}$`],
            };
          }
          if (level === 2) {
            const a = r.nonzero(-4, 6),
              b = r.nonzero(-4, 6);
            if (r.chance(0.5))
              return {
                q: `$\\int_{0}^{\\frac{\\pi}{2}}(${coef(a)}\\cos x${b >= 0 ? '+' : '-'}${coef(Math.abs(b))}\\sin x)dx$ 의 값을 구하세요.`,
                answer: { type: 'num', value: a + b },
                steps: [`$\\left[${a}\\sin x${sgn(-b)}\\cos x\\right]_{0}^{\\frac{\\pi}{2}}$`, `$= ${a}-(${-b}) = ${a + b}$`],
              };
            const c = r.int(1, 6);
            return {
              q: `$\\int_{0}^{\\pi}${c === 1 ? '' : c}\\sin x\\,dx$ 의 값을 구하세요.`,
              answer: { type: 'num', value: 2 * c },
              steps: [`$\\left[-${c === 1 ? '' : c}\\cos x\\right]_{0}^{\\pi} = ${c}-(-${c}) = ${2 * c}$`],
            };
          }
          const k = r.int(2, 6);
          if (r.chance(0.5)) {
            const ans = fr(k * k - 1, k);
            return {
              q: `$\\int_{0}^{\\ln ${k}}(e^{x}+e^{-x})dx$ 의 값을 구하세요.`,
              answer: fAns(ans),
              steps: [`$\\left[e^{x}-e^{-x}\\right]_{0}^{\\ln${k}} = \\left(${k}-\\frac{1}{${k}}\\right)-(1-1)$`, `$= ${T(ans)}$`],
            };
          }
          const ans = fr(k * k - 1, 2);
          return {
            q: `$\\int_{0}^{\\ln ${k}}e^{2x}dx$ 의 값을 구하세요.`,
            answer: fAns(ans),
            steps: [`$\\left[\\frac{1}{2}e^{2x}\\right]_{0}^{\\ln${k}} = \\frac{1}{2}(${k * k}-1) = ${T(ans)}$`],
          };
        },
      },
      {
        id: 'substitution',
        title: '치환적분법',
        gen(r, level) {
          if (level === 1) {
            const n = r.int(1, 4);
            const ans = fr(2 ** (n + 1) - 1, n + 1);
            return {
              q: `$\\int_{0}^{1}2x(x^{2}+1)^{${n}}dx$ 의 값을 구하세요.`,
              answer: fAns(ans),
              steps: [`$x^{2}+1 = t$ 로 놓으면 $2x\\,dx = dt$, $x:0\\to1$ 일 때 $t:1\\to2$`, `$\\int_{1}^{2}t^{${n}}dt = \\left[\\frac{t^{${n + 1}}}{${n + 1}}\\right]_{1}^{2} = ${T(ans)}$`],
            };
          }
          if (level === 2) {
            const [a0, b0, c] = r.pick(TRIPLES.slice(0, 5));
            const [a, b] = r.chance(0.5) ? [a0, b0] : [b0, a0];
            const ans = fr(c ** 3 - b ** 3, 3);
            return {
              q: `$\\int_{0}^{${a}}x\\sqrt{x^{2}+${b * b}}\\,dx$ 의 값을 구하세요.`,
              answer: fAns(ans),
              steps: [`$x^{2}+${b * b} = t$ 로 놓으면 $x\\,dx = \\frac12dt$, $t:${b * b}\\to${c * c}$`, `$\\frac12\\int_{${b * b}}^{${c * c}}\\sqrt t\\,dt = \\frac12\\cdot\\frac23\\left[t^{\\frac32}\\right]_{${b * b}}^{${c * c}} = \\frac13(${c ** 3}-${b ** 3})$`, `$= ${T(ans)}$`],
            };
          }
          const n = r.int(1, 4);
          if (r.chance(0.5)) {
            const k = r.int(1, 3);
            const ans = fr(k ** (n + 1), n + 1);
            return {
              q: `$\\int_{1}^{${k === 1 ? 'e' : `e^{${k}}`}}\\frac{(\\ln x)^{${n}}}{x}dx$ 의 값을 구하세요.`,
              answer: fAns(ans),
              steps: [`$\\ln x = t$ 로 놓으면 $\\frac1xdx = dt$, $t:0\\to${k}$`, `$\\int_{0}^{${k}}t^{${n}}dt = \\frac{${k}^{${n + 1}}}{${n + 1}} = ${T(ans)}$`],
            };
          }
          const c = r.int(1, 6);
          const ans = fr(c, n + 1);
          return {
            q: `$\\int_{0}^{\\frac{\\pi}{2}}${c === 1 ? '' : c}\\sin^{${n}}x\\cos x\\,dx$ 의 값을 구하세요.`,
            answer: fAns(ans),
            steps: [`$\\sin x = t$ 로 놓으면 $\\cos x\\,dx = dt$, $t:0\\to1$`, `$${c}\\int_{0}^{1}t^{${n}}dt = ${ratio(c, n + 1)}$`],
          };
        },
      },
      {
        id: 'log-type',
        title: '$\\frac{f\'(x)}{f(x)}$ 꼴의 적분',
        gen(r, level) {
          const lnT = (f: F) => (f.isInt() ? `\\ln ${f.n}` : `\\ln\\frac{${f.n}}{${f.d}}`);
          let ratio: F, q: string, steps: string[], wrongs: string[];
          if (level === 1) {
            const b = r.int(1, 5),
              k = r.int(1, 6);
            ratio = fr(k + b, b);
            q = `\\int_{0}^{${k}}\\frac{1}{x+${b}}dx`;
            steps = [`$\\left[\\ln|x+${b}|\\right]_{0}^{${k}} = \\ln${k + b}-\\ln${b}$`, `$= ${lnT(ratio)}$`];
            wrongs = [lnT(fr(k + b)), lnT(fr(k)), T(ratio), lnT(fr(b, k + b)), `\\frac{1}{${k + b}}-\\frac{1}{${b}}`];
          } else if (level === 2) {
            const a = r.int(0, 4),
              b = r.int(1, 5),
              p = r.int(0, 1),
              qq = p + r.int(1, 3);
            const f = (x: number) => x * x + a * x + b;
            ratio = fr(f(qq), f(p));
            q = `\\int_{${p}}^{${qq}}\\frac{${lin(2, a)}}{${poly([1, a, b])}}dx`;
            steps = [`분자가 분모의 도함수이므로 $\\left[\\ln(${poly([1, a, b])})\\right]_{${p}}^{${qq}}$`, `$= \\ln${f(qq)}-\\ln${f(p)} = ${lnT(ratio)}$`];
            wrongs = [lnT(fr(f(qq) - f(p))), T(ratio), lnT(fr(f(qq))), `2${lnT(ratio)}`, `\\frac12${lnT(ratio)}`];
          } else {
            const k = r.int(1, 3),
              p = r.int(1, 3),
              qq = p + r.int(1, 3);
            ratio = fr(qq * (p + k), p * (qq + k));
            q = `\\int_{${p}}^{${qq}}\\frac{${k}}{x(x+${k})}dx`;
            steps = [`$\\frac{${k}}{x(x+${k})} = \\frac1x-\\frac{1}{x+${k}}$`, `$\\left[\\ln\\frac{x}{x+${k}}\\right]_{${p}}^{${qq}} = \\ln\\frac{${qq}}{${qq + k}}-\\ln\\frac{${p}}{${p + k}}$`, `$= ${lnT(ratio)}$`];
            wrongs = [lnT(ratio.inv()), lnT(fr(qq, qq + k)), T(ratio), `${k === 1 ? 2 : k}${lnT(ratio)}`, lnT(fr(qq, p))]; // k=1 이면 '1\ln…' 이 정답과 같아 보임
          }
          return {
            q: `$${q}$ 의 값은?`,
            answer: texChoices(r, lnT(ratio), wrongs.filter((w) => w !== lnT(ratio))),
            steps,
          };
        },
      },
      {
        id: 'by-parts',
        title: '부분적분법',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(1, 9);
            if (r.chance(0.5))
              return {
                q: `$\\int_{0}^{1}${a === 1 ? '' : a}xe^{x}dx$ 의 값을 구하세요.`,
                answer: { type: 'num', value: a },
                steps: [`$\\int xe^{x}dx = xe^{x}-\\int e^{x}dx = (x-1)e^{x}+C$`, `$${a}\\left[(x-1)e^{x}\\right]_{0}^{1} = ${a}\\{0-(-1)\\} = ${a}$`],
              };
            return {
              q: `$\\int_{1}^{e}${a === 1 ? '' : a}\\ln x\\,dx$ 의 값을 구하세요.`,
              answer: { type: 'num', value: a },
              steps: [`$\\int\\ln x\\,dx = x\\ln x-\\int x\\cdot\\frac1xdx = x\\ln x-x+C$`, `$${a}\\left[x\\ln x-x\\right]_{1}^{e} = ${a}\\{(e-e)-(0-1)\\} = ${a}$`],
            };
          }
          if (level === 2) {
            const a = r.nonzero(-4, 5),
              b = r.nonzero(-4, 5);
            if (a === b) return this.gen(r, level);
            // ∫0^1 (ax+b)e^x dx = be + a - b
            const E = (c1: number, c0: number) => termsTexLocal(c1, c0);
            const right = E(b, a - b);
            return {
              q: `$\\int_{0}^{1}(${lin(a, b)})e^{x}dx$ 의 값은?`,
              answer: texChoices(r, right, [E(a + b, -b), E(b, b - a), E(a + b, -a), E(a, b - a), E(b, a)].filter((w) => w !== right)),
              steps: [`$\\int(${lin(a, b)})e^{x}dx = (${lin(a, b)})e^{x}-\\int${paren(a)}e^{x}dx = (${lin(a, b - a)})e^{x}+C$`, `$\\left[(${lin(a, b - a)})e^{x}\\right]_{0}^{1} = ${b}e-${paren(b - a)}$`, `$= ${right}$`],
            };
          }
          const a = r.int(1, 8);
          const v = r.int(0, 2);
          if (v === 0) {
            const right = `${a === 1 ? '' : a}\\pi`;
            return {
              q: `$\\int_{0}^{\\pi}${a === 1 ? '' : a}x\\sin x\\,dx$ 의 값은?`,
              answer: texChoices(r, right, [`${2 * a}\\pi`, `${a}`, `${a === 1 ? '' : a}\\pi-${2 * a}`, `-${a === 1 ? '' : a}\\pi`, `\\frac{${a}\\pi}{2}`]),
              steps: [`$\\int x\\sin x\\,dx = -x\\cos x+\\int\\cos x\\,dx = -x\\cos x+\\sin x+C$`, `$${a}\\left[-x\\cos x+\\sin x\\right]_{0}^{\\pi} = ${a}\\times\\pi = ${right}$`],
            };
          }
          if (v === 1) {
            const c = fr(a, 2);
            const right = `${ct(c, '\\pi')}-${a}`;
            return {
              q: `$\\int_{0}^{\\frac{\\pi}{2}}${a === 1 ? '' : a}x\\cos x\\,dx$ 의 값은?`,
              answer: texChoices(r, right, [`${ct(c, '\\pi')}+${a}`, `${ct(c, '\\pi')}`, `${ct(F.of(a), '\\pi')}-${a}`, `${a}-${ct(c, '\\pi')}`, `${ct(c, '\\pi')}-${2 * a}`]),
              steps: [`$\\int x\\cos x\\,dx = x\\sin x-\\int\\sin x\\,dx = x\\sin x+\\cos x+C$`, `$${a}\\left[x\\sin x+\\cos x\\right]_{0}^{\\frac{\\pi}{2}} = ${a}\\left(\\frac{\\pi}{2}-1\\right) = ${right}$`],
            };
          }
          const c = fr(a, 4);
          const wrap = (s: string) => (c.eq(1) ? s : `${c.tex()}(${s})`);
          const right = wrap('e^{2}+1');
          return {
            q: `$\\int_{1}^{e}${a === 1 ? '' : a}x\\ln x\\,dx$ 의 값은?`,
            answer: texChoices(r, right, [wrap('e^{2}-1'), wrap('e^{2}+2'), wrap('2e^{2}+1'), `${ct(fr(a, 2), 'e^{2}')}`, wrap('e+1')].filter((w) => w !== right)),
            steps: [`$\\int x\\ln x\\,dx = \\frac{x^{2}}{2}\\ln x-\\int\\frac{x}{2}dx = \\frac{x^{2}}{2}\\ln x-\\frac{x^{2}}{4}+C$`, `$\\left[\\cdots\\right]_{1}^{e} = \\frac{e^{2}}{2}-\\frac{e^{2}}{4}+\\frac14 = \\frac{e^{2}+1}{4}$`, `$${a}\\times\\frac{e^{2}+1}{4} = ${right}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── cal2-7 정적분의 활용
  'cal2-7': {
    concepts: [
      {
        title: '구분구적법과 정적분',
        body: '구간을 $n$등분한 직사각형 넓이의 합의 극한이 정적분이에요.\n$$\\lim_{n\\to\\infty}\\sum_{k=1}^{n}f\\left(a+\\frac{(b-a)k}{n}\\right)\\frac{b-a}{n} = \\int_{a}^{b}f(x)dx$$\n- $\\frac{k}{n}\\to x$, $\\frac1n\\to dx$ 로 바꾼다고 생각하면 편해요.',
        example: { q: '$\\lim\\sum_{k=1}^{n}\\frac1n\\left(\\frac kn\\right)^{2}$', a: '$\\int_{0}^{1}x^{2}dx = \\frac13$' },
      },
      {
        title: '넓이',
        body: '- 곡선 $y=f(x)$ 와 $x$축, $x=a$, $x=b$ 사이: $\\int_{a}^{b}|f(x)|dx$\n- 두 곡선 사이: $\\int_{a}^{b}|f(x)-g(x)|dx$\n- 지수·로그·삼각함수 곡선에도 똑같이 써요.',
      },
      {
        title: '입체도형의 부피',
        body: '$x$ 좌표가 $x$ 인 점을 지나고 $x$축에 수직인 평면으로 자른 단면의 넓이가 $S(x)$ 이면\n$$V = \\int_{a}^{b}S(x)\\,dx$$',
      },
      {
        title: '속도와 거리',
        body: "- 직선 위: 이동 거리 $\\int_{a}^{b}|v(t)|dt$\n- 평면 위 $(x(t), y(t))$: 이동 거리 $\\int_{a}^{b}\\sqrt{\\left(\\frac{dx}{dt}\\right)^{2}+\\left(\\frac{dy}{dt}\\right)^{2}}dt$\n- 곡선 $y=f(x)$ 의 길이: $\\int_{a}^{b}\\sqrt{1+\\{f'(x)\\}^{2}}dx$",
      },
    ],
    skills: [
      {
        id: 'riemann',
        title: '구분구적법',
        gen(r, level) {
          if (level === 1) {
            const p = r.int(1, 4),
              c = r.int(1, 6);
            const ans = fr(c, p + 1);
            return {
              q: `$\\lim_{n\\to\\infty}\\sum_{k=1}^{n}\\frac{${c}}{n}${p === 1 ? '\\cdot\\frac{k}{n}' : `\\left(\\frac{k}{n}\\right)^{${p}}`}$ 의 값을 구하세요.`,
              answer: fAns(ans),
              steps: [`$\\frac kn\\to x$, $\\frac1n\\to dx$: $\\int_{0}^{1}${c === 1 ? '' : c}${p === 1 ? 'x' : `x^{${p}}`}dx$`, `$= ${ratio(c, p + 1)}$`],
            };
          }
          if (level === 2) {
            const a = r.int(1, 3);
            const p = r.int(2, 3);
            const ans = fr((1 + a) ** (p + 1) - 1, p + 1);
            return {
              q: `$\\lim_{n\\to\\infty}\\sum_{k=1}^{n}\\frac{${a}}{n}\\left(1+\\frac{${a}k}{n}\\right)^{${p}}$ 의 값을 구하세요.`,
              answer: fAns(ans),
              steps: [`$1+\\frac{${a}k}{n}\\to x$, $\\frac{${a}}{n}\\to dx$, $x: 1\\to${1 + a}$`, `$\\int_{1}^{${1 + a}}x^{${p}}dx = \\frac{${(1 + a) ** (p + 1)}-1}{${p + 1}} = ${T(ans)}$`],
            };
          }
          const b = r.int(2, 3),
            p = r.int(2, 3),
            a = r.int(0, 1);
          const ans = fr((a + b) ** (p + 1) - a ** (p + 1), b * (p + 1));
          return {
            q: `$\\lim_{n\\to\\infty}\\sum_{k=1}^{n}\\frac{1}{n}\\left(${a === 0 ? '' : `${a}+`}\\frac{${b}k}{n}\\right)^{${p}}$ 의 값을 구하세요.`,
            answer: fAns(ans),
            steps: [`$\\frac1n = \\frac{1}{${b}}\\cdot\\frac{${b}}{n}$ 이므로 $\\frac{1}{${b}}\\int_{${a}}^{${a + b}}x^{${p}}dx$`, `$= \\frac{1}{${b}}\\cdot\\frac{${(a + b) ** (p + 1)}-${a ** (p + 1)}}{${p + 1}} = ${T(ans)}$`],
          };
        },
      },
      {
        id: 'riemann-form',
        title: '급수를 정적분으로 나타내기',
        gen(r, level) {
          const a = r.int(0, 3),
            b = r.int(2, 5);
          const inner = `${a === 0 ? '' : `${a}+`}\\frac{${b}k}{n}`;
          const I = (lo: number, hi: number, c = '') => `${c}\\int_{${lo}}^{${hi}}f(x)dx`;
          if (level <= 2) {
            const right = level === 1 ? I(a, a + b) : I(a, a + b, `\\frac{1}{${b}}`);
            const wrongs = [...new Set([I(0, b), I(a, b), I(0, a + b), level === 1 ? I(a, a + b, `\\frac{1}{${b}}`) : I(a, a + b), I(a, a + b, `${b}`), I(a + 1, a + b + 1), I(a, a + 2 * b)])].filter((w) => w !== right);
            return {
              q: `연속함수 $f(x)$ 에 대하여 $\\lim_{n\\to\\infty}\\sum_{k=1}^{n}f\\left(${inner}\\right)\\frac{${level === 1 ? b : 1}}{n}$ 과 같은 것은?`,
              answer: texChoices(r, right, wrongs),
              steps: [`$${inner}\\to x$ 로 놓으면 $k=0$ 일 때 $${a}$, $k=n$ 일 때 $${a + b}$`, level === 1 ? `$\\frac{${b}}{n}\\to dx$` : `$\\frac1n = \\frac{1}{${b}}\\cdot\\frac{${b}}{n}\\to\\frac{1}{${b}}dx$`, `$${right}$`],
            };
          }
          let c = r.int(2, 4);
          if (c === b) c = b + 1; // c=b 이면 '1∫' 과 '∫' 가 같은 값이 되어 정답이 둘
          const right = I(0, b, `\\frac{${c}}{${b}}`).replace(`\\frac{${c}}{${b}}`, T(fr(c, b)));
          const wrongs = [I(0, b, `${c}`), I(0, c), I(0, b, T(fr(b, c))), I(0, 1, `${c}`), I(0, b)].filter((w) => w !== right);
          return {
            q: `연속함수 $f(x)$ 에 대하여 $\\lim_{n\\to\\infty}\\sum_{k=1}^{n}\\frac{${c}}{n}f\\left(\\frac{${b}k}{n}\\right)$ 과 같은 것은?`,
            answer: texChoices(r, right, wrongs),
            steps: [`$\\frac{${b}k}{n}\\to x$ ($0\\to${b}$), $\\frac{${b}}{n}\\to dx$`, `$\\frac{${c}}{n} = \\frac{${c}}{${b}}\\cdot\\frac{${b}}{n}$`, `$${right}$`],
          };
        },
      },
      {
        id: 'area',
        title: '곡선으로 둘러싸인 넓이',
        gen(r, level) {
          if (level === 1) {
            if (r.chance(0.5)) {
              const k = r.int(2, 6);
              return {
                q: `곡선 $y=e^{x}$ 와 $x$축 및 두 직선 $x=0$, $x=\\ln ${k}$ 로 둘러싸인 부분의 넓이를 구하세요.`,
                fig: stableFig(new Plane(-0.6, Math.log(k) + 0.6, -0.8, k + 0.8, { w: 220, h: 220, grid: false, step: 1 }).fn(Math.exp).seg(Math.log(k), 0, Math.log(k), k, { dash: true }).toString()),
                answer: { type: 'num', value: k - 1 },
                steps: [`$\\int_{0}^{\\ln${k}}e^{x}dx = \\left[e^{x}\\right]_{0}^{\\ln${k}} = ${k}-1 = ${k - 1}$`],
              };
            }
            const a = r.int(1, 5),
              k = r.int(1, 3);
            return {
              q: `곡선 $y=\\frac{${a}}{x}$ 와 $x$축 및 두 직선 $x=1$, $x=${k === 1 ? 'e' : `e^{${k}}`}$ 로 둘러싸인 부분의 넓이를 구하세요.`,
              answer: { type: 'num', value: a * k },
              steps: [`$\\int_{1}^{${k === 1 ? 'e' : `e^{${k}}`}}\\frac{${a}}{x}dx = ${a}\\left[\\ln x\\right]_{1}^{${k === 1 ? 'e' : `e^{${k}}`}} = ${a * k}$`],
            };
          }
          if (level === 2) {
            const a = r.int(1, 4);
            const ans = fr(a ** 3, 6);
            return {
              q: `곡선 $y=\\sqrt{x}$ 와 직선 $y=${a === 1 ? 'x' : `\\frac{x}{${a}}`}$ 로 둘러싸인 부분의 넓이를 구하세요.`,
              fig: stableFig(new Plane(-0.5, a * a + 1, -0.5, a + 1, { w: 240, h: 180, grid: false, step: Math.max(1, Math.round(a / 2)) })
                .fn((x) => (x >= 0 ? Math.sqrt(x) : NaN), { a: 0 })
                .fn((x) => x / a, { cls: 'acc2' })
                .toString()),
              answer: fAns(ans),
              steps: [`교점: $\\sqrt x = \\frac{x}{${a}}$ 에서 $x=0$, $x=${a * a}$`, `$\\int_{0}^{${a * a}}\\left(\\sqrt x-\\frac{x}{${a}}\\right)dx = \\frac23\\cdot${a ** 3}-\\frac{${a ** 4}}{${2 * a}}$`, `$= ${T(ans)}$`],
            };
          }
          const k = r.int(2, 5);
          const c = fr(k * k - 1, 2);
          const right = `${c.tex()}-\\ln ${k}`;
          return {
            q: `곡선 $y=\\frac{1}{x}$ 와 직선 $y=x$ 및 직선 $x=${k}$ 로 둘러싸인 부분의 넓이는?`,
            fig: stableFig(new Plane(-0.5, k + 0.6, -0.5, k + 0.6, { w: 220, h: 220, grid: false, step: 1 })
              .fn((x) => (x > 0.1 ? 1 / x : NaN), { a: 0.15 })
              .fn((x) => x, { cls: 'acc2' })
              .seg(k, 0, k, k, { dash: true })
              .toString()),
            answer: texChoices(r, right, [`${c.tex()}+\\ln ${k}`, c.tex(), `${k * k - 1}-\\ln ${k}`, `${T(fr(k * k, 2))}-\\ln ${k}`, `\\ln ${k}-${c.tex()}`]),
            steps: [`교점 $x=1$, 구간 $[1, ${k}]$ 에서 $x\\ge\\frac1x$`, `$\\int_{1}^{${k}}\\left(x-\\frac1x\\right)dx = \\left[\\frac{x^{2}}{2}-\\ln x\\right]_{1}^{${k}}$`, `$= ${right}$`],
          };
        },
      },
      {
        id: 'volume',
        title: '입체도형의 부피',
        gen(r, level) {
          if (level === 1) {
            const k = r.int(1, 5),
              a = r.int(1, 4);
            const ans = fr(k * a * a, 2);
            return {
              q: `어떤 입체도형을 $x$축 위의 점 $(x, 0)$ $(0\\le x\\le ${a})$ 을 지나고 $x$축에 수직인 평면으로 자른 단면이 한 변의 길이가 $\\sqrt{${k === 1 ? '' : k}x}$ 인 정사각형일 때, 이 입체도형의 부피를 구하세요.`,
              answer: fAns(ans),
              steps: [`단면의 넓이 $S(x) = ${k === 1 ? '' : k}x$`, `$V = \\int_{0}^{${a}}${k === 1 ? '' : k}x\\,dx = ${T(ans)}$`],
            };
          }
          if (level === 2) {
            if (r.chance(0.5)) {
              const c = r.int(1, 5);
              return {
                q: `어떤 입체도형을 $x$축 위의 점 $(x, 0)$ $(0\\le x\\le \\pi)$ 을 지나고 $x$축에 수직인 평면으로 자른 단면의 넓이가 $${c === 1 ? '' : c}\\sin x$ 일 때, 이 입체도형의 부피를 구하세요.`,
                answer: { type: 'num', value: 2 * c },
                steps: [`$V = \\int_{0}^{\\pi}${c === 1 ? '' : c}\\sin x\\,dx = ${c === 1 ? '' : c}\\left[-\\cos x\\right]_{0}^{\\pi} = ${2 * c}$`],
              };
            }
            const k = r.int(2, 8);
            return {
              q: `어떤 입체도형을 $x$축 위의 점 $(x, 0)$ $(0\\le x\\le \\ln ${k})$ 을 지나고 $x$축에 수직인 평면으로 자른 단면이 한 변의 길이가 $\\sqrt{e^{x}}$ 인 정사각형일 때, 이 입체도형의 부피를 구하세요.`,
              answer: { type: 'num', value: k - 1 },
              steps: [`$S(x) = e^{x}$`, `$V = \\int_{0}^{\\ln${k}}e^{x}dx = ${k}-1 = ${k - 1}$`],
            };
          }
          const a = r.int(1, 6);
          const c = fr(a * a, 8);
          const right = ct(c, '\\sqrt{3}');
          return {
            q: `어떤 입체도형을 $x$축 위의 점 $(x, 0)$ $(0\\le x\\le ${a})$ 을 지나고 $x$축에 수직인 평면으로 자른 단면이 한 변의 길이가 $\\sqrt{x}$ 인 정삼각형일 때, 이 입체도형의 부피는?`,
            answer: texChoices(r, right, [ct(fr(a * a, 4), '\\sqrt{3}'), ct(fr(a * a, 2), '\\sqrt{3}'), ct(fr(a, 4), '\\sqrt{3}'), T(fr(a * a, 2)), ct(fr(a * a, 16), '\\sqrt{3}')].filter((w) => w !== right)),
            steps: [`$S(x) = \\frac{\\sqrt3}{4}(\\sqrt x)^{2} = \\frac{\\sqrt3}{4}x$`, `$V = \\frac{\\sqrt3}{4}\\int_{0}^{${a}}x\\,dx = \\frac{\\sqrt3}{4}\\cdot\\frac{${a * a}}{2} = ${right}$`],
          };
        },
      },
      {
        id: 'distance',
        title: '이동 거리와 곡선의 길이',
        gen(r, level) {
          if (level <= 2) {
            const a = level === 1 ? 1 : r.int(1, 3);
            const k1 = level === 1 ? 0 : r.int(0, 1);
            const k2 = k1 + r.int(1, level === 1 ? 4 : 2);
            const D = (k: number) => a * (3 * k + k ** 3);
            const ans = D(k2) - D(k1);
            return {
              q: `좌표평면 위를 움직이는 점 P 의 시각 $t$ 에서의 위치가 $x = ${3 * a}t^{2}$, $y = ${a === 1 ? '3t-t^{3}' : `${a}(3t-t^{3})`}$ 일 때, 시각 $t=${k1}$ 에서 $t=${k2}$ 까지 점 P 가 움직인 거리를 구하세요.`.replace('= 1(', '= ('),
              answer: { type: 'num', value: ans },
              steps: [
                `$\\frac{dx}{dt} = ${6 * a}t$, $\\frac{dy}{dt} = ${3 * a}(1-t^{2})$`,
                `속력 $= \\sqrt{${36 * a * a}t^{2}+${9 * a * a}(1-t^{2})^{2}} = ${3 * a}(1+t^{2})$`,
                `$\\int_{${k1}}^{${k2}}${3 * a}(1+t^{2})dt = ${a === 1 ? '' : a}\\left[3t+t^{3}\\right]_{${k1}}^{${k2}} = ${ans}$`,
              ],
            };
          }
          const a = r.pick([3, 8, 15, 24]);
          const s = Math.round(Math.sqrt(1 + a));
          const ans = fr(2 * (s ** 3 - 1), 3);
          return {
            q: `곡선 $y = \\frac{2}{3}x^{\\frac{3}{2}}$ 의 $x=0$ 에서 $x=${a}$ 까지의 길이를 구하세요.`,
            answer: fAns(ans),
            steps: [`$y' = x^{\\frac12}$, $\\sqrt{1+(y')^{2}} = \\sqrt{1+x}$`, `$\\int_{0}^{${a}}\\sqrt{1+x}\\,dx = \\frac23\\left[(1+x)^{\\frac32}\\right]_{0}^{${a}} = \\frac23(${s ** 3}-1)$`, `$= ${T(ans)}$`],
          };
        },
      },
    ],
  },
};

const paren = (n: number) => (n < 0 ? `(${n})` : `${n}`);
/** c1·e + c0 */
function termsTexLocal(c1: number, c0: number): string {
  const e = c1 === 1 ? 'e' : c1 === -1 ? '-e' : `${c1}e`;
  if (c1 === 0) return String(c0);
  return c0 === 0 ? e : `${e}${c0 > 0 ? '+' : ''}${c0}`;
}
void round;
void makeChoices;

// 활용(문장제) 유형 덧붙이기
for (const [u, sk] of Object.entries(CAL2_WORD)) cal2[u].skills.push(...sk);
for (const [u, h] of Object.entries(CAL2_HARD)) {
  cal2[u].skills.push(...h.skills);
  cal2[u].top = [...(cal2[u].top ?? []), ...h.top];
}
