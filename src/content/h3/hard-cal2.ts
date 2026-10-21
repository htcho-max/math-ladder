// 미적분Ⅱ 심화·최상위 유형 — cal2.ts 의 각 단원 skills / top 뒤에 덧붙임
import { F } from '../../core/frac';
import { makeChoices, poly, sqrtTex } from '../../core/tex';
import { Pl, ans, cst, fr, pDef, pEval, pr, T, tt, type Hard, withJosa } from './hard-util';

const pn = (c: (number | F)[], v = 'n') => poly(c, v);
/** k e^{j} TeX */
const eT = (k: number, j: number) => {
  const kk = k === 1 ? '' : k === -1 ? '-' : `${k}`;
  if (j === 0) return `${k}`;
  if (j === 1) return `${kk}e`;
  return `${kk}e^{${j}}`;
};
/** 로그 밑 TeX 와 log_b 2 의 값 */
const BASES: [string, F][] = [
  ['2', fr(1)],
  ['4', fr(1, 2)],
  ['8', fr(1, 3)],
  ['\\frac{1}{2}', fr(-1)],
  ['\\frac{1}{4}', fr(-1, 2)],
  ['\\sqrt{2}', fr(2)],
];
const R_LIST = [fr(1, 2), fr(1, 3), fr(2, 3), fr(-1, 2), fr(-1, 3), fr(1, 4), fr(3, 4), fr(-2, 3)];

export const CAL2_HARD: Hard = withJosa(
  {
    // ───────── 수열의 극한
    'cal2-1': {
      skills: [
        {
          id: 'squeeze-limit',
          title: '부등식으로 주어진 수열의 극한',
          gen(r, level) {
            const p = r.int(2, 5);
            if (level === 1) {
              const u = r.int(-4, 0),
                v = r.int(1, 4),
                c = r.int(1, 5);
              return {
                q: `수열 $\\{a_n\\}$ 이 모든 자연수 $n$ 에 대하여 $${pn([p, u])}<a_n<${pn([p, v])}$ 을 만족시킬 때, $\\lim_{n\\to\\infty}\\frac{a_n}{n+${c}}$ 의 값을 구하세요.`,
                answer: ans(p),
                steps: [`각 변을 $n+${c}$ $(>0)$ 로 나누면 $\\frac{${pn([p, u])}}{n+${c}}<\\frac{a_n}{n+${c}}<\\frac{${pn([p, v])}}{n+${c}}$`, `양 끝의 극한이 모두 $${p}$ 이므로 수열의 극한의 대소 관계에 의해 $${p}$`],
              };
            }
            const u = r.int(1, 5),
              v = r.int(1, 4);
            const lo = pn([p, 0, u]),
              hi = pn([p, v, 0]);
            if (level === 2) {
              return {
                q: `수열 $\\{a_n\\}$ 이 모든 자연수 $n$ 에 대하여 $${lo}<na_n<${hi}$ 을 만족시킬 때, $\\lim_{n\\to\\infty}\\frac{(a_n)^{2}}{n^{2}+1}$ 의 값을 구하세요.`,
                answer: ans(p * p),
                steps: [
                  `각 변을 $n^{2}$ 으로 나누면 $${p}+\\frac{${u}}{n^{2}}<\\frac{a_n}{n}<${p}+\\frac{${v}}{n}$ → $\\lim_{n\\to\\infty}\\frac{a_n}{n}=${p}$`,
                  `$\\frac{(a_n)^{2}}{n^{2}+1}=\\left(\\frac{a_n}{n}\\right)^{2}\\times\\frac{n^{2}}{n^{2}+1}\\to${p}^{2}\\times1=${p * p}$`,
                ],
              };
            }
            const q = r.nonzero(-3, 3),
              rr = r.int(-4, 4);
            let s = r.int(-3, 3);
            if (p + s === 0) s++;
            const val = fr(q * p + rr, p + s);
            return {
              q: `수열 $\\{a_n\\}$ 이 모든 자연수 $n$ 에 대하여 $${lo}<na_n<${hi}$ 을 만족시킬 때, $\\lim_{n\\to\\infty}\\frac{${tt([q, 'a_n'], [rr, 'n'])}}{${tt([1, 'a_n'], [s, 'n'])}}$ 의 값을 구하세요.`,
              answer: ans(val),
              steps: [
                `각 변을 $n^{2}$ 으로 나누면 $${p}+\\frac{${u}}{n^{2}}<\\frac{a_n}{n}<${p}+\\frac{${v}}{n}$ → $\\lim_{n\\to\\infty}\\frac{a_n}{n}=${p}$`,
                `분모·분자를 $n$ 으로 나누면 $\\frac{${tt([q, '\\frac{a_n}{n}'], [rr, ''])}}{${tt([1, '\\frac{a_n}{n}'], [s, ''])}}\\to${fr(q * p + rr, p + s).d === 1 && p + s !== 1 ? `\\frac{${q * p + rr}}{${p + s}}=` : ''}${T(val)}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-limit-defined-function',
          title: '극한으로 정의된 함수의 연속',
          gen(r) {
            const p = 2 * r.nonzero(-3, 3),
              c = 4 * r.nonzero(-2, 2);
            const a = -c,
              b = p;
            const v = fr(2 * p)
              .add(fr(3 * c, 4))
              .add(fr(p, 2));
            return {
              q: `함수 $$f(x)=\\lim_{n\\to\\infty}\\frac{${p}x^{2n+1}+ax^{2}+bx${cst(c)}}{x^{2n}+1}$$ 이 실수 전체의 집합에서 연속일 때, $f(2)+f\\left(\\frac{1}{2}\\right)$ 의 값을 구하세요. (단, $a$, $b$ 는 상수)`,
              answer: ans(v),
              steps: [
                `$|x|>1$: 분모·분자를 $x^{2n}$ 으로 나누면 $f(x)=${p}x$, $|x|<1$: $x^{2n}\\to0$ 이므로 $f(x)=ax^{2}+bx${cst(c)}$`,
                `$f(1)=\\frac{${p}+a+b${cst(c)}}{2}$, $f(-1)=\\frac{${-p}+a-b${cst(c)}}{2}$`,
                `$x=1$ 에서 연속: $a+b${cst(c)}=${p}$, $x=-1$ 에서 연속: $a-b${cst(c)}=${-p}$`,
                `$a=${a}$, $b=${b}$`,
                `$f(2)=${2 * p}$, $f\\left(\\frac{1}{2}\\right)=\\frac{a}{4}+\\frac{b}{2}${cst(c)}=${T(fr(a, 4).add(fr(b, 2)).add(c))}$ → 합 $${T(v)}$`,
              ],
            };
          },
        },
        {
          id: 'top-geo-converge-count',
          title: '두 등비수열이 모두 수렴하는 정수의 개수',
          gen(r) {
            for (;;) {
              const a = r.int(-3, 4),
                b = r.int(2, 5);
              const c = r.int(-4, 4),
                d = r.pick([4, 6, 8, 10, 12]);
              const S1: number[] = [],
                S2: number[] = [];
              for (let x = -40; x <= 40; x++) {
                if (-b < x - a && x - a <= b) S1.push(x);
                const v = x * x - c * x;
                if (-d < v && v <= d) S2.push(x);
              }
              const both = S1.filter((x) => S2.includes(x));
              if (both.length < 2 || both.length === S1.length) continue;
              const r1 = `\\frac{${poly([1, -a])}}{${b}}`,
                r2 = `\\frac{${poly([1, -c, 0])}}{${d}}`;
              return {
                q: `두 수열 $\\left\\{\\left(${r1}\\right)^{n}\\right\\}$, $\\left\\{\\left(${r2}\\right)^{n}\\right\\}$ 이 모두 수렴하도록 하는 정수 $x$ 의 개수를 구하세요.`,
                answer: ans(both.length),
                steps: [
                  `등비수열 $\\{r^{n}\\}$ 이 수렴 ⇔ $-1<r\\le1$`,
                  `$-1<${r1}\\le1$ → $${a - b}<x\\le${a + b}$: 정수 $${S1.join(', ')}$`,
                  `$-1<${r2}\\le1$ → $-${d}<${poly([1, -c, 0])}\\le${d}$: 정수 $${S2.join(', ')}$`,
                  `공통인 정수: $${both.join(', ')}$ → $${both.length}$ 개`,
                ],
              };
            }
          },
        },
      ],
    },

    // ───────── 급수
    'cal2-2': {
      skills: [
        {
          id: 'geo-series-cond',
          title: '조건으로 등비급수의 공비 찾기',
          gen(r, level) {
            const rr = r.pick(R_LIST);
            const a = r.nonzero(-6, 6);
            const one = fr(1);
            const S = fr(a).div(one.sub(rr));
            if (level === 1) {
              return {
                q: `첫째항이 $${a}$ 인 등비수열 $\\{a_n\\}$ 에 대하여 $\\sum_{n=1}^{\\infty}a_n=${T(S)}$ 일 때, 공비 $r$ 의 값을 구하세요.`,
                answer: ans(rr),
                steps: [`$\\frac{${a}}{1-r}=${T(S)}$ → $1-r=${T(one.sub(rr))}$`, `$r=${T(rr)}$ ($-1<r<1$ 이므로 수렴 조건 만족)`],
              };
            }
            if (level === 2) {
              const O = fr(a).div(one.sub(rr.mul(rr)));
              const a2 = rr.mul(a);
              return {
                q: `등비수열 $\\{a_n\\}$ 에 대하여 $\\sum_{n=1}^{\\infty}a_n=${T(S)}$, $\\sum_{n=1}^{\\infty}a_{2n-1}=${T(O)}$ 일 때, $a_2$ 의 값을 구하세요.`,
                answer: ans(a2),
                steps: [
                  `첫째항 $a$, 공비 $r$: $\\frac{a}{1-r}=${T(S)}$, $\\frac{a}{1-r^{2}}=${T(O)}$ (홀수 번째 항은 공비 $r^{2}$)`,
                  `나누면 $\\frac{1-r^{2}}{1-r}=1+r=\\frac{${T(S)}}{${T(O)}}=${T(S.div(O))}$ → $r=${T(rr)}$`,
                  `$a=${T(S)}\\times(1-r)=${a}$`,
                  `$a_2=ar=${T(a2)}$`,
                ],
              };
            }
            const Tq = fr(a * a).div(one.sub(rr.mul(rr)));
            const a3 = rr.mul(rr).mul(a);
            return {
              q: `등비수열 $\\{a_n\\}$ 에 대하여 $\\sum_{n=1}^{\\infty}a_n=${T(S)}$, $\\sum_{n=1}^{\\infty}(a_n)^{2}=${T(Tq)}$ 일 때, $a_3$ 의 값을 구하세요.`,
              answer: ans(a3),
              steps: [
                `$\\frac{a}{1-r}=${T(S)}$, $\\{(a_n)^{2}\\}$ 은 첫째항 $a^{2}$, 공비 $r^{2}$ → $\\frac{a^{2}}{1-r^{2}}=${T(Tq)}$`,
                `둘째 식 ÷ (첫째 식)$^{2}$: $\\frac{1-r}{1+r}=\\frac{${T(Tq)}}{${T(S.mul(S))}}=${T(Tq.div(S.mul(S)))}$ → $r=${T(rr)}$`,
                `$a=${T(S)}(1-r)=${a}$`,
                `$a_3=ar^{2}=${T(a3)}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-log-product-series',
          title: '로그 급수와 곱의 망원',
          gen(r) {
            const [bTex, L] = r.pick(BASES);
            const c = r.pick([1, 2, 3, 6]);
            const half = r.chance(0.5);
            const v = half ? L.neg().mul(c) : L.mul(c);
            const cc = c === 1 ? '' : `${c}`;
            const term = half ? `${cc}\\log_{${bTex}}\\left(1-\\frac{1}{n^{2}}\\right)` : `${cc}\\log_{${bTex}}\\frac{(n+1)^{2}}{n(n+2)}`;
            return {
              q: `$\\sum_{n=${half ? 2 : 1}}^{\\infty}${term}$ 의 값을 구하세요.`,
              answer: ans(v),
              steps: half
                ? [
                    `$1-\\frac{1}{k^{2}}=\\frac{(k-1)(k+1)}{k\\times k}$`,
                    `부분합 $S_N=${cc}\\log_{${bTex}}\\prod_{k=2}^{N}\\frac{(k-1)(k+1)}{k^{2}}=${cc}\\log_{${bTex}}\\left(\\frac{1}{N}\\times\\frac{N+1}{2}\\right)$`,
                    `$\\frac{N+1}{2N}\\to\\frac{1}{2}$ 이므로 합은 $${cc}\\log_{${bTex}}\\frac{1}{2}$`,
                    `$\\log_{${bTex}}2=${T(L)}$ 이므로 값은 $${T(v)}$`,
                  ]
                : [
                    `$\\frac{(k+1)^{2}}{k(k+2)}=\\frac{k+1}{k}\\times\\frac{k+1}{k+2}$`,
                    `부분합 $S_N=${cc}\\log_{${bTex}}\\left(\\frac{N+1}{1}\\times\\frac{2}{N+2}\\right)$`,
                    `$\\frac{2(N+1)}{N+2}\\to2$ 이므로 합은 $${cc}\\log_{${bTex}}2$`,
                    `$\\log_{${bTex}}2=${T(L)}$ 이므로 값은 $${T(v)}$`,
                  ],
            };
          },
        },
        {
          id: 'top-series-sq-sum',
          title: '등비급수의 합 사이의 관계',
          gen(r) {
            const rr = r.pick(R_LIST);
            const a = r.nonzero(-6, 6);
            const one = fr(1);
            const S = fr(a).div(one.sub(rr));
            const Tq = fr(a * a).div(one.sub(rr.mul(rr)));
            if (r.chance(0.5)) {
              const D = fr(a).div(one.add(rr));
              return {
                q: `등비수열 $\\{a_n\\}$ 에 대하여 $\\sum_{n=1}^{\\infty}a_n=${T(S)}$, $\\sum_{n=1}^{\\infty}(a_{2n-1}-a_{2n})=${T(D)}$ 일 때, $\\sum_{n=1}^{\\infty}(a_n)^{2}$ 의 값을 구하세요.`,
                answer: ans(Tq),
                steps: [
                  `첫째항 $a$, 공비 $r$: $\\sum a_n=\\frac{a}{1-r}$`,
                  `$a_{2n-1}-a_{2n}=ar^{2n-2}(1-r)$ 이므로 $\\sum(a_{2n-1}-a_{2n})=\\frac{a(1-r)}{1-r^{2}}=\\frac{a}{1+r}$`,
                  `$\\sum(a_n)^{2}=\\frac{a^{2}}{1-r^{2}}=\\frac{a}{1-r}\\times\\frac{a}{1+r}$`,
                  `$=${T(S)}\\times${pr(D)}=${T(Tq)}$ (실제로 $a=${a}$, $r=${T(rr)}$)`,
                ],
              };
            }
            const P = rr.mul(Tq);
            return {
              q: `등비수열 $\\{a_n\\}$ 에 대하여 $\\sum_{n=1}^{\\infty}a_n=${T(S)}$, $\\sum_{n=1}^{\\infty}(a_n)^{2}=${T(Tq)}$ 일 때, $\\sum_{n=1}^{\\infty}a_na_{n+1}$ 의 값을 구하세요.`,
              answer: ans(P),
              steps: [
                `$\\frac{a}{1-r}=${T(S)}$, $\\frac{a^{2}}{1-r^{2}}=${T(Tq)}$`,
                `$\\frac{a^{2}}{1-r^{2}}\\div\\left(\\frac{a}{1-r}\\right)^{2}=\\frac{1-r}{1+r}=${T(Tq.div(S.mul(S)))}$ → $r=${T(rr)}$`,
                `$\\{a_na_{n+1}\\}$ 은 첫째항 $a^{2}r$, 공비 $r^{2}$ → 합은 $r\\times\\frac{a^{2}}{1-r^{2}}$`,
                `$${T(rr)}\\times${pr(Tq)}=${T(P)}$`,
              ],
            };
          },
        },
      ],
    },

    // ───────── 여러 가지 함수의 미분
    'cal2-3': {
      skills: [
        {
          id: 'lim-undetermined-exp',
          title: '지수·로그 극한에서 미정계수 정하기',
          gen(r, level) {
            const p = r.int(1, 6);
            if (level === 1) {
              const q = r.int(1, 6);
              const v = fr(p, q);
              return {
                q: `$\\lim_{x\\to0}\\frac{e^{${p === 1 ? '' : p}x}-1}{\\sin ${q === 1 ? '' : q}x}$ 의 값을 구하세요.`,
                answer: ans(v),
                steps: [`$\\frac{e^{${p}x}-1}{${p}x}\\times\\frac{${q}x}{\\sin ${q}x}\\times${T(v)}$ 로 바꾸면`, `$1\\times1\\times${T(v)}=${T(v)}$`],
              };
            }
            if (level === 2) {
              return {
                q: `$\\lim_{x\\to0}\\frac{e^{${p === 1 ? '' : p}x}+a}{x}=b$ 일 때, 상수 $a$, $b$ 에 대하여 $a+b$ 의 값을 구하세요.`,
                answer: ans(p - 1),
                steps: [`$x\\to0$ 일 때 분모 $\\to0$ 이므로 분자 $\\to0$: $1+a=0$, $a=-1$`, `$b=\\lim_{x\\to0}\\frac{e^{${p}x}-1}{x}=${p}$`, `$a+b=${p - 1}$`],
              };
            }
            const q = r.int(1, 6),
              k = r.nonzero(-4, 4);
            // a = Lq/p 가 정수가 되게 L = kp/q
            const L = fr(k * p, q);
            const a = k;
            return {
              q: `$\\lim_{x\\to0}\\frac{ae^{${p === 1 ? '' : p}x}+b}{\\ln(1+${q === 1 ? '' : q}x)}=${T(L)}$ 일 때, 상수 $a$, $b$ 에 대하여 $a-b$ 의 값을 구하세요.`,
              answer: ans(2 * a),
              steps: [
                `분모 $\\to0$ 이므로 분자 $\\to0$: $a+b=0$, $b=-a$`,
                `$\\frac{a(e^{${p}x}-1)}{\\ln(1+${q}x)}=a\\times\\frac{e^{${p}x}-1}{${p}x}\\times\\frac{${q}x}{\\ln(1+${q}x)}\\times${T(fr(p, q))}\\to${q === 1 ? `${p}a` : `\\frac{${p}a}{${q}}`}$`,
                `$${q === 1 ? `${p}a` : `\\frac{${p}a}{${q}}`}=${T(L)}$ → $a=${a}$, $b=${-a}$`,
                `$a-b=${2 * a}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-geometry-trig-limit',
          title: '도형의 넓이와 삼각함수의 극한',
          gen(r) {
            const rad = r.pick([2, 4, 6]);
            const kind = r.int(0, 3);
            const head = `반지름의 길이가 $${rad}$ 인 원의 중심을 $O$, 원 위의 한 점을 $A$ 라 하자. 원 위의 점 $P$ 에 대하여 $\\angle AOP=\\theta$ $\\left(0<\\theta<\\frac{\\pi}{2}\\right)$ 이고, 점 $P$ 에서 선분 $OA$ 에 내린 수선의 발을 $H$, 점 $A$ 에서의 접선과 직선 $OP$ 의 교점을 $Q$ 라 하자.`;
            const base = [`$\\overline{PH}=${rad}\\sin\\theta$, $\\overline{OH}=${rad}\\cos\\theta$, $\\overline{HA}=${rad}(1-\\cos\\theta)$, $\\overline{AQ}=${rad}\\tan\\theta$`];
            const lim1 = `$\\lim_{\\theta\\to0+}\\frac{1-\\cos\\theta}{\\theta^{2}}=\\frac{1}{2}$, $\\lim_{\\theta\\to0+}\\frac{\\sin\\theta}{\\theta}=\\lim_{\\theta\\to0+}\\frac{\\tan\\theta}{\\theta}=1$`;
            if (kind === 0) {
              const v = fr(rad * rad, 4);
              return {
                q: `${head} 삼각형 $PHA$ 의 넓이를 $S(\\theta)$ 라 할 때, $\\lim_{\\theta\\to0+}\\frac{S(\\theta)}{\\theta^{3}}$ 의 값을 구하세요.`,
                answer: ans(v),
                steps: [
                  ...base,
                  `$S(\\theta)=\\frac{1}{2}\\times${rad}\\sin\\theta\\times${rad}(1-\\cos\\theta)=${(rad * rad) / 2}\\sin\\theta(1-\\cos\\theta)$`,
                  lim1,
                  `$\\frac{S(\\theta)}{\\theta^{3}}=${(rad * rad) / 2}\\times\\frac{\\sin\\theta}{\\theta}\\times\\frac{1-\\cos\\theta}{\\theta^{2}}\\to${(rad * rad) / 2}\\times\\frac{1}{2}=${T(v)}$`,
                ],
              };
            }
            if (kind === 1) {
              const v = fr(rad * rad, 4);
              return {
                q: `${head} 삼각형 $APQ$ 의 넓이를 $S(\\theta)$ 라 할 때, $\\lim_{\\theta\\to0+}\\frac{S(\\theta)}{\\theta^{3}}$ 의 값을 구하세요.`,
                answer: ans(v),
                steps: [
                  ...base,
                  `밑변 $\\overline{AQ}$, 높이는 $P$ 와 직선 $AQ$ 사이 거리 $\\overline{HA}$: $S(\\theta)=\\frac{1}{2}\\times${rad}\\tan\\theta\\times${rad}(1-\\cos\\theta)$`,
                  lim1,
                  `$\\frac{S(\\theta)}{\\theta^{3}}=${(rad * rad) / 2}\\times\\frac{\\tan\\theta}{\\theta}\\times\\frac{1-\\cos\\theta}{\\theta^{2}}\\to${T(v)}$`,
                ],
              };
            }
            if (kind === 2) {
              const v = fr(rad * rad, 2);
              return {
                q: `${head} 사각형 $HAQP$ 의 넓이를 $S(\\theta)$ 라 할 때, $\\lim_{\\theta\\to0+}\\frac{S(\\theta)}{\\theta^{3}}$ 의 값을 구하세요.`,
                answer: ans(v),
                steps: [
                  ...base,
                  `$\\overline{PH}\\parallel\\overline{AQ}$ 인 사다리꼴: $S(\\theta)=\\frac{1}{2}(${rad}\\sin\\theta+${rad}\\tan\\theta)\\times${rad}(1-\\cos\\theta)$`,
                  lim1,
                  `$\\frac{S(\\theta)}{\\theta^{3}}=${(rad * rad) / 2}\\left(\\frac{\\sin\\theta}{\\theta}+\\frac{\\tan\\theta}{\\theta}\\right)\\frac{1-\\cos\\theta}{\\theta^{2}}\\to${(rad * rad) / 2}\\times2\\times\\frac{1}{2}=${T(v)}$`,
                ],
              };
            }
            const v = fr(rad, 2);
            return {
              q: `${head} $\\lim_{\\theta\\to0+}\\frac{\\overline{AQ}-\\overline{PH}}{\\theta^{3}}$ 의 값을 구하세요.`,
              answer: ans(v),
              steps: [
                ...base,
                `$\\overline{AQ}-\\overline{PH}=${rad}(\\tan\\theta-\\sin\\theta)=${rad}\\tan\\theta(1-\\cos\\theta)$`,
                lim1,
                `$\\frac{${rad}\\tan\\theta(1-\\cos\\theta)}{\\theta^{3}}\\to${rad}\\times1\\times\\frac{1}{2}=${T(v)}$`,
              ],
            };
          },
        },
        {
          id: 'top-tangent-angle',
          title: '두 곡선의 접선이 이루는 각 (덧셈정리)',
          gen(r) {
            for (;;) {
              const b = r.pick([fr(1, 2), fr(1), fr(2), fr(3), fr(1, 3)]);
              const t = r.pick([fr(1), fr(2), fr(3), fr(1, 2), fr(1, 3)]);
              const c1 = t.sub(b).div(b.mul(t).add(1));
              const c2 = b.mul(t).eq(1) ? null : t.add(b).div(b.mul(t).sub(1));
              const pos = [c1, c2].filter((x): x is F => !!x && x.n > 0);
              if (pos.length !== 1) continue;
              const a = pos[0];
              if (a.mul(b).eq(1)) continue;
              const bTex = b.d === 1 ? (b.n === 1 ? '' : `${b.n}`) : T(b);
              return {
                q: `두 곡선 $y=e^{ax}$, $y=1-\\ln(1+${bTex}x)$ 가 점 $(0, 1)$ 에서 만나고, 이 점에서 그은 두 곡선의 접선이 이루는 예각의 크기를 $\\theta$ 라 하자. $\\tan\\theta=${T(t)}$ 일 때, 양수 $a$ 의 값을 구하세요.`,
                answer: ans(a),
                steps: [
                  `$y=e^{ax}$ 의 $x=0$ 에서 기울기 $a$, $y=1-\\ln(1+${bTex}x)$ 의 기울기 $-\\frac{${T(b)}}{1+${T(b)}x}$ → $x=0$ 에서 $${T(b.neg())}$`,
                  `두 직선이 $x$ 축과 이루는 각을 $\\alpha$, $\\beta$ 라 하면 $\\tan\\theta=\\left|\\frac{a-(${T(b.neg())})}{1+a\\times(${T(b.neg())})}\\right|=\\left|\\frac{a+${T(b)}}{1-${T(b)}a}\\right|$`,
                  `$\\frac{a+${T(b)}}{1-${T(b)}a}=${T(t)}$ → $a=${T(c1)}$`,
                  c2 ? `$\\frac{a+${T(b)}}{1-${T(b)}a}=-${T(t)}$ → $a=${T(c2)}$` : `$\\frac{a+${T(b)}}{1-${T(b)}a}=-${T(t)}$ 는 해가 없어요.`,
                  `양수인 것은 $a=${T(a)}$`,
                ],
              };
            }
          },
        },
      ],
    },

    // ───────── 여러 가지 미분법
    'cal2-4': {
      skills: [
        {
          id: 'inverse-cond',
          title: '역함수의 미분과 조건',
          gen(r, level) {
            const p = r.int(1, 4),
              q = r.int(-4, 4);
            const f = Pl(1, 0, p, q);
            const ftex = poly([1, 0, p, q]);
            if (level <= 2) {
              const t = level === 1 ? r.pick([0, 1]) : r.pick([-2, -1, 2]);
              const c = pEval(f, t);
              const d = 3 * t * t + p;
              return {
                q: `함수 $f(x)=${ftex}$ 의 역함수를 $g(x)$ 라 할 때, $g'(${T(c)})$ 의 값을 구하세요.`,
                answer: ans(fr(1, d)),
                steps: [
                  `$f'(x)=3x^{2}+${p}>0$ 이므로 $f$ 는 증가함수이고 역함수가 있어요.`,
                  `$f(t)=${T(c)}$ 인 $t$: $t=${t}$ (증가함수라 하나뿐) → $g(${T(c)})=${t}$`,
                  `$g'(${T(c)})=\\frac{1}{f'(${t})}=\\frac{1}{${d}}$`,
                ],
              };
            }
            const t = r.int(-2, 2);
            const a = r.int(t === 0 ? 1 : 0, 4);
            const k = 3 * t * t + a;
            const b = r.int(-4, 4);
            const g = Pl(1, 0, a, b);
            const c = pEval(g, t);
            const m = r.pick([2, 3, -1]);
            return {
              q: `함수 $f(x)=x^{3}+ax+b$ 의 역함수 $g(x)$ 가 $g(${T(c)})=${t}$, $g'(${T(c)})=\\frac{1}{${k}}$ 을 만족시킬 때, $f(${m})$ 의 값을 구하세요. (단, $a\\ge0$)`,
              answer: ans(pEval(g, m)),
              steps: [
                `$g(${T(c)})=${t}$ → $f(${t})=${T(c)}$`,
                `$g'(${T(c)})=\\frac{1}{f'(${t})}$ → $f'(${t})=3\\times${pr(t)}^{2}+a=${k}$, $a=${a}$`,
                `$f(${t})=${pr(t)}^{3}+${a}\\times${pr(t)}+b=${T(c)}$ → $b=${b}$`,
                `$f(x)=${poly([1, 0, a, b])}$, $f(${m})=${T(pEval(g, m))}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-inverse-composite',
          title: '역함수를 두 번 합성한 함수의 미분계수',
          gen(r) {
            for (;;) {
              const p = r.int(1, 3),
                q = r.int(-3, 3),
                t = r.pick([-1, 0, 1]);
              const u = t ** 3 + p * t + q;
              if (Math.abs(u) > 3 || u === t) continue;
              const c = u ** 3 + p * u + q;
              const k = (3 * t * t + p) * (3 * u * u + p);
              const ftex = poly([1, 0, p, q]);
              const limForm = r.chance(0.5);
              return {
                q: limForm
                  ? `함수 $f(x)=${ftex}$ 의 역함수를 $g(x)$ 라 하자. $\\lim_{x\\to${c}}\\frac{g(g(x))${cst(-t)}}{${poly([1, -c])}}=\\frac{1}{k}$ 일 때, $k$ 의 값을 구하세요.`
                  : `함수 $f(x)=${ftex}$ 의 역함수를 $g(x)$ 라 하자. $(g\\circ g)'(${c})=\\frac{1}{k}$ 일 때, $k$ 의 값을 구하세요.`,
                answer: ans(k),
                steps: [
                  `$f'(x)=3x^{2}+${p}>0$ → $f$ 는 증가함수, 역함수 $g$ 존재`,
                  `$f(${t})=${u}$, $f(${u})=${c}$ 이므로 $g(${c})=${u}$, $g(${u})=${t}$`,
                  limForm ? `$g(g(${c}))=${t}$ 이므로 주어진 극한은 $(g\\circ g)'(${c})$` : `$(g\\circ g)'(${c})=g'(g(${c}))\\times g'(${c})=g'(${u})\\times g'(${c})$`,
                  `$g'(${u})=\\frac{1}{f'(${t})}=\\frac{1}{${3 * t * t + p}}$, $g'(${c})=\\frac{1}{f'(${u})}=\\frac{1}{${3 * u * u + p}}$`,
                  `$(g\\circ g)'(${c})=\\frac{1}{${3 * t * t + p}\\times${3 * u * u + p}}$ → $k=${k}$`,
                ],
              };
            }
          },
        },
        {
          id: 'top-implicit-tangent-dist',
          title: '음함수의 접선이 평행할 때 두 접선 사이 거리',
          gen(r) {
            const a = r.pick([1, -1]);
            const slope = r.pick([1, -1]);
            const den = slope === 1 ? 2 - a : 2 + a;
            const s2 = r.int(1, 6);
            const c = den * s2;
            const curve = `x^{2}${a > 0 ? '+' : '-'}xy+y^{2}=${c}`;
            const d2 = 8 * s2;
            const askProd = r.chance(0.4);
            return {
              q: `곡선 $${curve}$ 위의 점에서 그은 접선 중 기울기가 $${slope}$ 인 두 접선${askProd ? '의 $y$ 절편의 곱' : ' 사이의 거리를 $d$ 라 할 때, $d^{2}$ 의 값'}을 구하세요.`,
              answer: ans(askProd ? -4 * s2 : d2),
              steps: [
                `음함수 미분: $2x${a > 0 ? '+' : '-'}y${a > 0 ? '+' : '-'}x\\frac{dy}{dx}+2y\\frac{dy}{dx}=0$ → $\\frac{dy}{dx}=-\\frac{2x${a > 0 ? '+' : '-'}y}{${a > 0 ? '' : '-'}x+2y}$`,
                `$\\frac{dy}{dx}=${slope}$ 에서 ${slope === 1 ? `$(2${a > 0 ? '+' : '-'}1)(x+y)=0$ → $y=-x$` : `$(2${a > 0 ? '-' : '+'}1)(x-y)=0$ → $y=x$`}`,
                `곡선에 대입: $${den}x^{2}=${c}$ → $x=\\pm${sqrtTex(s2)}$, 접점 ${slope === 1 ? `$(${sqrtTex(s2)}, -${sqrtTex(s2)})$, $(-${sqrtTex(s2)}, ${sqrtTex(s2)})$` : `$(${sqrtTex(s2)}, ${sqrtTex(s2)})$, $(-${sqrtTex(s2)}, -${sqrtTex(s2)})$`}`,
                `접선 $y=${slope === 1 ? 'x' : '-x'}+k$ 에서 $k=${slope === 1 ? 'y-x' : 'y+x'}=\\pm${sqrtTex(4 * s2)}$`,
                askProd ? `$y$ 절편의 곱 $=-4\\times${s2}=${-4 * s2}$` : `두 평행선 사이 거리 $d=\\frac{${sqrtTex(16 * s2)}}{\\sqrt{2}}$ → $d^{2}=\\frac{16\\times${s2}}{2}=${d2}$`,
              ],
            };
          },
        },
      ],
    },

    // ───────── 도함수의 활용
    'cal2-5': {
      skills: [
        {
          id: 'exp-poly-extreme',
          title: '(이차식)×eˣ 꼴의 극값 조건',
          gen(r, level) {
            if (level === 1) {
              const b = 2 * r.int(-3, 3);
              const amin = (b * b) / 4 + 1;
              const bx = b + 2 === 0 ? '' : `${tt([b + 2, 'x'])}`.replace(/^(?!-)/, '+');
              const ab = b === 0 ? 'a' : `(a${cst(b)})`;
              return {
                q: `함수 $f(x)=(${tt([1, 'x^{2}'], [b, 'x'])}+a)e^{x}$ 가 극값을 갖지 않도록 하는 실수 $a$ 의 최솟값을 구하세요.`,
                answer: ans(amin),
                steps: [
                  `$f'(x)=\\{x^{2}${bx}+${ab}\\}e^{x}$ (곱의 미분)`,
                  `$e^{x}>0$ 이므로 $x^{2}${bx}+a${cst(b)}$ 의 부호가 바뀌지 않으면 극값이 없어요: $D\\le0$`,
                  `$D=${b + 2 === 0 ? '' : (b + 2) ** 2}-4${ab}\\le0$ → $a\\ge${amin}$`,
                ],
              };
            }
            if (level === 2) {
              const p = r.int(-4, 1),
                q = r.int(p + 1, p + 4);
              const a = -(p + q) - 2,
                b = p * q - a;
              return {
                q: `함수 $f(x)=(x^{2}+ax+b)e^{x}$ 가 $x=${p}$, $x=${q}$ 에서 극값을 가질 때, 상수 $b$ 의 값을 구하세요.`,
                answer: ans(b),
                steps: [`$f'(x)=\\{x^{2}+(a+2)x+(a+b)\\}e^{x}$`, `$x^{2}+(a+2)x+(a+b)=0$ 의 두 근이 $${p}$, $${q}$`, `$a+2=${-(p + q)}$, $a+b=${p * q}$ → $a=${a}$, $b=${b}$`],
              };
            }
            const m = r.int(-2, 4);
            const right = eT(4, m - 2);
            const wrongs = [eT(4, m), eT(2, m - 2), eT(4, m + 2), eT(1, m - 2), eT(8, m - 2), eT(4, 2 - m)].filter((w) => w !== right);
            return {
              q: `함수 $f(x)=(x^{2}+ax+b)e^{x}$ 가 $x=${m}$ 에서 극솟값 $0$ 을 가질 때, $f(x)$ 의 극댓값은? (단, $a$, $b$ 는 상수)`,
              answer: makeChoices(
                r,
                `$${right}$`,
                wrongs.map((w) => `$${w}$`),
                5,
              ),
              steps: [
                `$f(${m})=0$, $e^{x}>0$ 이므로 $x=${m}$ 은 $x^{2}+ax+b=0$ 의 근이고, $f'(${m})=0$ 에서 중근 → $f(x)=${m === 0 ? 'x' : `(x${cst(-m)})`}^{2}e^{x}$`,
                `$f'(x)=${m === 0 ? 'x' : `(x${cst(-m)})`}${m === 2 ? 'x' : `(x${cst(-m + 2)})`}e^{x}$`,
                `$x=${m - 2}$ 에서 극대, $x=${m}$ 에서 극소`,
                `극댓값 $f(${m - 2})=(-2)^{2}e^{${m - 2}}=${right}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-root-count-exp',
          title: '지수함수가 곱해진 함수와 수평선의 교점 개수',
          gen(r) {
            const rr = r.int(1, 3);
            const c = rr * (rr + 2);
            const neg = r.chance(0.5);
            const M = `${2 * rr + 4}e^{-${rr + 2}}`,
              mVal = 2 * rr * Math.exp(rr);
            const mTex = `-${2 * rr}e${rr === 1 ? '' : `^{${rr}}`}`;
            const fl = Math.floor(mVal);
            const fx = `(x^{2}-${c})e^{${neg ? '-x' : 'x'}}`;
            const askA = r.chance(0.5);
            const N = r.int(3, 10);
            let sum = 0;
            for (let t = -N; t <= N; t++) sum += t > 0 ? 1 : t === 0 ? 2 : -t < mVal ? 2 : 0;
            const xmax = neg ? rr + 2 : -(rr + 2),
              xmin = neg ? -rr : rr;
            return {
              q: `함수 $f(x)=${fx}$ 의 그래프와 직선 $y=t$ 가 만나는 점의 개수를 $g(t)$ 라 할 때, ${askA ? '$g(t)=2$ 를 만족시키는 정수 $t$ 의 개수를' : `$\\sum_{t=-${N}}^{${N}}g(t)$ 의 값을`} 구하세요. (단, $${rr === 1 ? 'e' : `e^{${rr}}`}=${['', '2.72', '7.39', '20.09'][rr]}$ 로 계산한다.)`,
              answer: ans(askA ? 1 + fl : sum),
              steps: [
                `$f'(x)=${neg ? '-' : ''}(x^{2}${neg ? '-' : '+'}2x-${c})e^{${neg ? '-x' : 'x'}}$ → $f'(x)=0$ 에서 $x=${xmax}$, $${xmin}$`,
                `극댓값 $f(${xmax})=${M}$ $(0$ 과 $1$ 사이$)$, 극솟값 $f(${xmin})=${mTex}\\approx${-Math.round(mVal * 10) / 10}$`,
                `$x\\to${neg ? '\\infty' : '-\\infty'}$ 일 때 $f(x)\\to0$ (양수 쪽), 반대쪽으로는 $\\infty$, 영점은 $x=\\pm\\sqrt{${c}}$`,
                `$g(t)$: $t>${M}$ 이면 1, $t=${M}$ 이면 2, $0<t<${M}$ 이면 3, $t=0$ 이면 2, $${mTex}<t<0$ 이면 2, $t=${mTex}$ 이면 1, 그보다 작으면 0`,
                askA
                  ? `$g(t)=2$ 인 정수: $t=0$ 과 $${-fl}\\le t\\le-1$ → $1+${fl}=${1 + fl}$ 개`
                  : `정수 $t\\ge1$ 은 1개씩 $${N}$, $t=0$ 은 2, $-${N}\\le t\\le-1$ 중 $t>${mTex}$ 인 것 $${Math.min(N, fl)}$ 개는 2씩 → $${N}+2+${2 * Math.min(N, fl)}=${sum}$`,
              ],
            };
          },
        },
        {
          id: 'top-tangent-count-exp',
          title: '곡선 밖의 점에서 그은 접선의 개수 (지수함수)',
          gen(r) {
            const a = r.int(-3, 3);
            const ft = `y=${a === 0 ? 'x' : `(x${cst(-a)})`}e^{x}`;
            const askSum = r.chance(0.5);
            const N = r.int(Math.max(4, a + 1, 4 - a), 9);
            let s = 0;
            for (let p = -N; p <= N; p++) {
              const D = (p - a) * (p - a + 4);
              s += D > 0 ? 2 : D === 0 ? 1 : 0;
            }
            return {
              q: askSum
                ? `점 $(p, 0)$ 에서 곡선 $${ft}$ 에 그을 수 있는 접선의 개수를 $h(p)$ 라 할 때, $\\sum_{p=-${N}}^{${N}}h(p)$ 의 값을 구하세요.`
                : `점 $(p, 0)$ 에서 곡선 $${ft}$ 에 그을 수 있는 접선이 오직 하나뿐이도록 하는 모든 실수 $p$ 의 값의 합을 구하세요.`,
              answer: ans(askSum ? s : 2 * a - 4),
              steps: [
                `접점 $(t, ${a === 0 ? 't' : `(t${cst(-a)})`}e^{t})$, 기울기 $${a === 1 ? 't' : `(t${cst(1 - a)})`}e^{t}$ → 접선 $y=${a === 1 ? 't' : `(t${cst(1 - a)})`}e^{t}(x-t)+${a === 0 ? 't' : `(t${cst(-a)})`}e^{t}$`,
                `$(p, 0)$ 대입 후 $e^{t}$ 로 나누면 $t^{2}-(p${cst(a)})t${a - 1 === 0 ? cst(a) : `+(${tt([a - 1, 'p'], [a, ''])})`}=0$`,
                `서로 다른 실근 $t$ 의 개수 = 접선의 개수 (변곡점이 하나뿐이라 한 직선이 두 점에서 접하지 않아요)`,
                `$D=(p${cst(-a)})(p${cst(4 - a)})$: $D>0$ 이면 2개, $D=0$ 이면 1개, $D<0$ 이면 0개`,
                askSum ? `$p=${a}, ${a - 4}$ 에서 1개, $${a - 4}<p<${a}$ 인 정수 3개는 0개, 나머지 $${2 * N + 1 - 5}$ 개는 2개씩 → $${s}$` : `$D=0$: $p=${a}$ 또는 $p=${a - 4}$ → 합 $${2 * a - 4}$`,
              ],
            };
          },
        },
      ],
    },

    // ───────── 여러 가지 적분법
    'cal2-6': {
      skills: [
        {
          id: 'inverse-integral',
          title: '역함수의 정적분',
          gen(r, level) {
            const p = r.int(1, 3),
              q = r.int(-3, 3);
            const f = Pl(1, 0, p, q);
            const ftex = poly([1, 0, p, q]);
            let a = 0,
              b = 1;
            if (level >= 2) {
              [a, b] = r.sample([-1, 0, 1, 2], 2).sort((x, y) => x - y);
            }
            const fa = pEval(f, a),
              fb = pEval(f, b);
            const I = pDef(f, a, b);
            const v = fb.mul(b).sub(fa.mul(a)).sub(I);
            const lim = level === 3 ? [T(fa), T(fb)] : [`f(${a})`, `f(${b})`];
            return {
              q: `함수 $f(x)=${ftex}$ 의 역함수를 $g(x)$ 라 할 때, $\\int_{${lim[0]}}^{${lim[1]}}g(x)\\,dx$ 의 값을 구하세요.`,
              answer: ans(v),
              steps: [
                ...(level === 3 ? [`$f$ 는 증가함수이고 $f(${a})=${T(fa)}$, $f(${b})=${T(fb)}$`] : []),
                `$x=f(t)$ 로 치환하면 $dx=f'(t)dt$, $g(f(t))=t$: $\\int_{${a}}^{${b}}tf'(t)\\,dt$`,
                `부분적분: $[tf(t)]_{${a}}^{${b}}-\\int_{${a}}^{${b}}f(t)\\,dt$`,
                `$=${pr(b)}\\times${pr(fb)}-${pr(a)}\\times${pr(fa)}-${pr(I)}=${T(v)}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-int-equation-const',
          title: '정적분으로 정의된 함수와 부분적분',
          gen(r) {
            const kind = r.int(0, 2);
            for (;;) {
              const a = r.nonzero(-6, 6);
              if (kind === 0) {
                const b = r.pick([1, -2, 4, 3]);
                const K = fr(2 * a, 2 - b);
                if (K.d !== 1) continue;
                const v = K.mul(b).add(a);
                return {
                  q: `함수 $f(x)$ 가 모든 실수 $x$ 에 대하여 $$f(x)=${a === 1 ? '' : a === -1 ? '-' : a}e^{x}${b > 0 ? '+' : '-'}${Math.abs(b) === 1 ? '' : Math.abs(b)}\\int_{0}^{1}tf(t)\\,dt$$ 를 만족시킬 때, $f(0)$ 의 값을 구하세요.`,
                  answer: ans(v),
                  steps: [
                    `$\\int_{0}^{1}tf(t)\\,dt=K$ (상수) 로 놓으면 $f(x)=${a}e^{x}${cst(b)}K$`,
                    `$K=\\int_{0}^{1}t(${a}e^{t}${cst(b)}K)\\,dt=${a === 1 ? '' : a === -1 ? '-' : a}\\int_{0}^{1}te^{t}\\,dt${cst(b)}K\\int_{0}^{1}t\\,dt$`,
                    `부분적분: $\\int_{0}^{1}te^{t}\\,dt=[te^{t}-e^{t}]_{0}^{1}=1$, $\\int_{0}^{1}t\\,dt=\\frac{1}{2}$`,
                    `$K=${a}+${T(fr(b, 2))}K$ → $K=${T(K)}$`,
                    `$f(0)=${a}${cst(b)}\\times${pr(K)}=${T(v)}$`,
                  ],
                };
              }
              const b = r.pick([2, -1, 3, -3]);
              const K = fr(a, 2 * (1 - b));
              if (K.d !== 1) continue;
              const v = K.mul(b).add(a);
              const cosK = kind === 1;
              return {
                q: cosK
                  ? `함수 $f(x)$ 가 모든 실수 $x$ 에 대하여 $$f(x)=${a === 1 ? '' : a === -1 ? '-' : a}\\cos x${b > 0 ? '+' : '-'}${Math.abs(b) === 1 ? '' : Math.abs(b)}\\int_{0}^{\\frac{\\pi}{2}}f(t)\\sin t\\,dt$$ 를 만족시킬 때, $f(0)$ 의 값을 구하세요.`
                  : `$x>0$ 에서 정의된 함수 $f(x)$ 가 $$f(x)=${a === 1 ? '' : a === -1 ? '-' : a}\\ln x${b > 0 ? '+' : '-'}${Math.abs(b) === 1 ? '' : Math.abs(b)}\\int_{1}^{e}\\frac{f(t)}{t}\\,dt$$ 를 만족시킬 때, $f(e)$ 의 값을 구하세요.`,
                answer: ans(v),
                steps: [
                  `정적분 부분을 $K$ (상수) 로 놓으면 $f(x)=${a}${cosK ? '\\cos x' : '\\ln x'}${cst(b)}K$`,
                  cosK ? `$K=${a}\\int_{0}^{\\frac{\\pi}{2}}\\cos t\\sin t\\,dt${cst(b)}K\\int_{0}^{\\frac{\\pi}{2}}\\sin t\\,dt$` : `$K=${a}\\int_{1}^{e}\\frac{\\ln t}{t}\\,dt${cst(b)}K\\int_{1}^{e}\\frac{1}{t}\\,dt$`,
                  cosK
                    ? `$\\int_{0}^{\\frac{\\pi}{2}}\\sin t\\cos t\\,dt=\\left[\\frac{\\sin^{2}t}{2}\\right]_{0}^{\\frac{\\pi}{2}}=\\frac{1}{2}$, $\\int_{0}^{\\frac{\\pi}{2}}\\sin t\\,dt=1$`
                    : `$\\ln t=s$ 로 치환: $\\int_{1}^{e}\\frac{\\ln t}{t}\\,dt=\\int_{0}^{1}s\\,ds=\\frac{1}{2}$, $\\int_{1}^{e}\\frac{1}{t}\\,dt=1$`,
                  `$K=${T(fr(a, 2))}${cst(b)}K$ → $K=${T(K)}$`,
                  `$${cosK ? 'f(0)' : 'f(e)'}=${a}${cst(b)}\\times${pr(K)}=${T(v)}$`,
                ],
              };
            }
          },
        },
        {
          id: 'top-int-by-parts-cond',
          title: '조건만으로 계산하는 부분적분',
          gen(r) {
            const kind = r.int(0, 2);
            if (kind === 0) {
              const p = r.int(-5, 8),
                q = r.int(-5, 5),
                R = r.int(-5, 8);
              const k = r.int(1, 3),
                m = r.int(-2, 3);
              const v = (k + m) * p - m * q - k * R;
              return {
                q: `미분가능한 함수 $f(x)$ 의 도함수 $f'(x)$ 가 연속이고 $f(0)=${q}$, $f(1)=${p}$, $\\int_{0}^{1}f(x)\\,dx=${R}$ 일 때, $\\int_{0}^{1}(${poly([k, m])})f'(x)\\,dx$ 의 값을 구하세요.`,
                answer: ans(v),
                steps: [
                  `부분적분: $\\int_{0}^{1}(${poly([k, m])})f'(x)\\,dx=\\left[(${poly([k, m])})f(x)\\right]_{0}^{1}-\\int_{0}^{1}${k === 1 ? '' : k}f(x)\\,dx$`,
                  `$=${k + m}f(1)-${pr(m)}f(0)-${k}\\times${pr(R)}$`,
                  `$=${k + m}\\times${pr(p)}-${pr(m)}\\times${pr(q)}-${k * R}=${v}$`,
                ],
              };
            }
            if (kind === 1) {
              const A = r.int(-5, 9),
                B = r.int(-5, 9);
              return {
                q: `연속함수 $f(x)$ 에 대하여 $g(x)=\\int_{0}^{x}f(t)\\,dt$ 라 하자. $\\int_{0}^{1}f(x)\\,dx=${A}$, $\\int_{0}^{1}xf(x)\\,dx=${B}$ 일 때, $\\int_{0}^{1}g(x)\\,dx$ 의 값을 구하세요.`,
                answer: ans(A - B),
                steps: [`$g'(x)=f(x)$, $g(1)=${A}$`, `부분적분: $\\int_{0}^{1}g(x)\\,dx=[xg(x)]_{0}^{1}-\\int_{0}^{1}xg'(x)\\,dx=g(1)-\\int_{0}^{1}xf(x)\\,dx$`, `$=${A}-${pr(B)}=${A - B}$`],
              };
            }
            const p = r.int(-5, 8),
              R = r.int(-5, 8);
            return {
              q: `$x>0$ 에서 미분가능한 함수 $f(x)$ 의 도함수가 연속이고 $f(e)=${p}$, $\\int_{1}^{e}\\frac{f(x)}{x}\\,dx=${R}$ 일 때, $\\int_{1}^{e}f'(x)\\ln x\\,dx$ 의 값을 구하세요.`,
              answer: ans(p - R),
              steps: [`부분적분: $\\int_{1}^{e}f'(x)\\ln x\\,dx=[f(x)\\ln x]_{1}^{e}-\\int_{1}^{e}\\frac{f(x)}{x}\\,dx$`, `$[f(x)\\ln x]_{1}^{e}=f(e)\\times1-f(1)\\times0=${p}$`, `$${p}-${pr(R)}=${p - R}$`],
            };
          },
        },
      ],
    },

    // ───────── 정적분의 활용
    'cal2-7': {
      skills: [
        {
          id: 'area-exp',
          title: '지수함수의 그래프로 둘러싸인 넓이',
          gen(r, level) {
            if (level === 1) {
              const k = r.int(2, 9);
              return {
                q: `곡선 $y=e^{x}$ 과 $x$ 축, $y$ 축 및 직선 $x=\\ln ${k}$ 로 둘러싸인 부분의 넓이를 구하세요.`,
                answer: ans(k - 1),
                steps: [`넓이 $=\\int_{0}^{\\ln ${k}}e^{x}\\,dx=[e^{x}]_{0}^{\\ln ${k}}=${k}-1=${k - 1}$`],
              };
            }
            if (level === 2) {
              const k = r.int(2, 9);
              const v = fr((k - 1) ** 2, k);
              return {
                q: `두 곡선 $y=e^{x}$, $y=e^{-x}$ 과 직선 $x=\\ln ${k}$ 로 둘러싸인 부분의 넓이를 구하세요.`,
                answer: ans(v),
                steps: [`두 곡선은 $x=0$ 에서 만나고 $x>0$ 에서 $e^{x}>e^{-x}$`, `넓이 $=\\int_{0}^{\\ln ${k}}(e^{x}-e^{-x})\\,dx=[e^{x}+e^{-x}]_{0}^{\\ln ${k}}=${k}+\\frac{1}{${k}}-2=${T(v)}$`],
              };
            }
            const a = r.int(2, 8);
            const v = fr((a - 1) ** 2, 2);
            return {
              q: `두 곡선 $y=e^{2x}$, $y=${a}e^{x}$ 과 $y$ 축으로 둘러싸인 부분의 넓이를 구하세요.`,
              answer: ans(v),
              steps: [
                `교점: $e^{2x}=${a}e^{x}$ → $e^{x}=${a}$, $x=\\ln ${a}$`,
                `$0<x<\\ln ${a}$ 에서 $${a}e^{x}>e^{2x}$`,
                `넓이 $=\\int_{0}^{\\ln ${a}}(${a}e^{x}-e^{2x})\\,dx=\\left[${a}e^{x}-\\frac{1}{2}e^{2x}\\right]_{0}^{\\ln ${a}}$`,
                `$=\\left(${a * a}-\\frac{${a * a}}{2}\\right)-\\left(${a}-\\frac{1}{2}\\right)=${T(v)}$`,
              ],
            };
          },
        },
      ],
      top: [
        {
          id: 'top-area-sin-cos-split',
          title: '곡선이 넓이를 주어진 비로 나눌 조건',
          gen(r) {
            const [j, tau] = r.pick([
              [2, fr(2, 3)],
              [3, fr(1, 2)],
              [4, fr(2, 5)],
              [5, fr(1, 3)],
              [7, fr(1, 4)],
              [9, fr(1, 5)],
            ] as [number, F][]);
            const A = r.int(1, 4);
            const kap = tau.mul(fr(2).sub(tau)).div(fr(2).mul(fr(1).sub(tau)));
            const k = kap.mul(A);
            const Atex = A === 1 ? '' : `${A}`;
            return {
              q: `곡선 $y=${Atex}\\sin x$ $(0\\le x\\le\\pi)$ 와 $x$ 축으로 둘러싸인 부분이 곡선 $y=k\\cos x$ $(k>0)$ 에 의해 넓이의 비가 $1:${j}$ 인 두 부분으로 나누어질 때, $k=\\frac{q}{p}$ 이다. $p+q$ 의 값을 구하세요. (단, $p$, $q$ 는 서로소인 자연수)`,
              answer: ans(k.n + k.d),
              steps: [
                `전체 넓이 $\\int_{0}^{\\pi}${Atex}\\sin x\\,dx=${2 * A}$, 작은 부분(곡선 $y=k\\cos x$ 아래)은 $${2 * A}\\times\\frac{1}{${j + 1}}=${T(fr(2 * A, j + 1))}$`,
                `두 곡선의 교점 $x=\\alpha$: $\\tan\\alpha=\\frac{k}{${A}}$, 이때 $\\cos\\alpha=\\frac{${A}}{\\sqrt{${A * A}+k^{2}}}$, $\\sin\\alpha=\\frac{k}{\\sqrt{${A * A}+k^{2}}}$`,
                `작은 부분 $=\\int_{0}^{\\alpha}${Atex}\\sin x\\,dx+\\int_{\\alpha}^{\\frac{\\pi}{2}}k\\cos x\\,dx=${Atex}(1-\\cos\\alpha)+k(1-\\sin\\alpha)=${A}+k-\\sqrt{${A * A}+k^{2}}$`,
                `$${A}+k-\\sqrt{${A * A}+k^{2}}=${T(fr(2 * A, j + 1))}$ → $\\sqrt{${A * A}+k^{2}}=k+${T(fr(A).sub(fr(2 * A, j + 1)))}$`,
                `양변을 제곱해 풀면 $k=${T(k)}$`,
                `$p+q=${k.d}+${k.n}=${k.n + k.d}$`,
              ],
            };
          },
        },
        {
          id: 'top-curve-length',
          title: '평면 위를 움직이는 점이 움직인 거리',
          gen(r) {
            const x0 = r.int(-3, 3),
              y0 = r.int(-3, 3);
            if (r.chance(0.5)) {
              const [T2, s] = r.pick([
                [3, 2],
                [8, 3],
                [15, 4],
                [24, 5],
              ] as [number, number][]);
              const a = r.pick([3, 6]);
              const len = ((2 * a) / 3) * (s ** 3 - 1);
              const Ttex = sqrtTex(T2);
              const xs = `${a}t^{2}${cst(x0)}`,
                ys = `${(2 * a) / 3}t^{3}${cst(y0)}`;
              return {
                q: `좌표평면 위를 움직이는 점 $P$ 의 시각 $t$ $(t\\ge0)$ 에서의 위치 $(x, y)$ 가 $x=${xs}$, $y=${ys}$ 일 때, 시각 $t=0$ 에서 $t=${Ttex}$ 까지 점 $P$ 가 움직인 거리를 구하세요.`,
                answer: ans(len),
                steps: [
                  `$\\frac{dx}{dt}=${2 * a}t$, $\\frac{dy}{dt}=${2 * a}t^{2}$`,
                  `속력 $\\sqrt{${4 * a * a}t^{2}+${4 * a * a}t^{4}}=${2 * a}t\\sqrt{1+t^{2}}$ $(t\\ge0)$`,
                  `거리 $=\\int_{0}^{${Ttex}}${2 * a}t\\sqrt{1+t^{2}}\\,dt$, $1+t^{2}=u$ 로 치환: $${a}\\int_{1}^{${1 + T2}}\\sqrt{u}\\,du$`,
                  `$=${a}\\times\\frac{2}{3}\\left[u^{\\frac{3}{2}}\\right]_{1}^{${1 + T2}}=${(2 * a) / 3}(${s ** 3}-1)=${len}$`,
                ],
              };
            }
            const k = r.pick([3, 6]),
              Tt = r.pick([3, 6]);
            const len = k * (Tt ** 3 / 3 + Tt);
            const xs = `${k / 3 === 1 ? '' : k / 3}t^{3}-${k}t${cst(x0)}`,
              ys = `${k}t^{2}${cst(y0)}`;
            return {
              q: `좌표평면 위를 움직이는 점 $P$ 의 시각 $t$ $(t\\ge0)$ 에서의 위치 $(x, y)$ 가 $x=${xs}$, $y=${ys}$ 일 때, 시각 $t=0$ 에서 $t=${Tt}$ 까지 점 $P$ 가 움직인 거리를 구하세요.`,
              answer: ans(len),
              steps: [
                `$\\frac{dx}{dt}=${k}(t^{2}-1)$, $\\frac{dy}{dt}=${2 * k}t$`,
                `속력 $${k}\\sqrt{(t^{2}-1)^{2}+4t^{2}}=${k}\\sqrt{(t^{2}+1)^{2}}=${k}(t^{2}+1)$`,
                `거리 $=\\int_{0}^{${Tt}}${k}(t^{2}+1)\\,dt=${k}\\left[\\frac{t^{3}}{3}+t\\right]_{0}^{${Tt}}=${len}$`,
              ],
            };
          },
        },
      ],
    },
  },
  {
    'top-geo-converge-count': '등비수열 $\\{r^{n}\\}$ 의 수렴 조건 $-1<r\\le1$ 을 두 공비에 각각 적용하기',
    'top-log-product-series': '로그의 합을 곱의 로그로 바꾸면 곱이 연쇄적으로 약분돼요',
    'top-series-sq-sum': '주어진 급수들을 첫째항 $a$, 공비 $r$ 의 식으로 나타내 서로의 관계를 찾기',
    'top-geometry-trig-limit': '길이를 $\\theta$ 의 삼각함수로 나타낸 뒤 $\\frac{\\sin\\theta}{\\theta}$, $\\frac{1-\\cos\\theta}{\\theta^{2}}$ 꼴로 맞추기',
    'top-int-by-parts-cond': '함수식을 몰라도 부분적분으로 주어진 값들만의 식으로 바꿀 수 있어요',
    'top-curve-length': '움직인 거리는 속력 $\\sqrt{\\left(\\frac{dx}{dt}\\right)^{2}+\\left(\\frac{dy}{dt}\\right)^{2}}$ 의 정적분이고, 근호 안이 완전제곱이나 치환하기 좋은 꼴이 돼요',
  },
);
