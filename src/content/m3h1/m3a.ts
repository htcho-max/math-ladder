// 중3-1: 제곱근과 실수, 근호 계산, 곱셈 공식·인수분해, 이차방정식, 이차함수
import type { ContentMap } from '../../core/types';
import type { Rng } from '../../core/rng';
import { numChoices, sqrtTex, poly, termsTex, linTex } from '../../core/tex';
import { F } from '../../core/frac';
import { gcd, simplifySqrt } from '../../core/nt';
import { Plane, Svg } from '../../core/fig';
import { NAMES, mc, tc, pmul, fac, surd, quadRootsTex, rootsTex, isSq, neun, figStr } from './util';

/** 완전제곱이 아닌 수 (제곱인수 없는) */
const SQF = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19, 21, 22, 23];
const isSqFree = (n: number) => simplifySqrt(n)[0] === 1 && n > 1;

/** k·√n 을 분수 계수와 함께: (num/den)√n → \frac{a\sqrt{n}}{d} */
function fracSurd(num: number, rad: number, den: number): string {
  const [o, i] = simplifySqrt(rad);
  const f = new F(num * o, den);
  const s = f.n < 0 ? '-' : '';
  const a = Math.abs(f.n);
  const body = i === 1 ? `${a}` : a === 1 ? `\\sqrt{${i}}` : `${a}\\sqrt{${i}}`;
  if (i === 1) return f.tex();
  return f.d === 1 ? `${s}${body}` : `${s}\\frac{${body}}{${f.d}}`;
}

/** 두 일차식 인수 [a,b] → 전개 계수 */
const expand = (fs: [number, number][], k = 1) => fs.reduce((acc, [a, b]) => pmul(acc, [a, b]), [k]);
const sameP = (p: number[], q: number[]) => p.length === q.length && p.every((x, i) => x === q[i]);

/** 인수분해 보기: 정답 인수와 오답 인수 후보에서 전개가 같은 것은 빼기 */
function factorChoices(r: Rng, k: number, right: [number, number][], wrongs: { k: number; f: [number, number][] }[], v = 'x') {
  const target = expand(right, k);
  const tex = (kk: number, f: [number, number][]) => (kk === 1 ? '' : kk === -1 ? '-' : `${kk}`) + f.map(([a, b]) => fac(a, b, v)).join('');
  const seen: number[][] = [target];
  const good: string[] = [];
  for (const w of wrongs) {
    const e = expand(w.f, w.k);
    if (seen.some((x) => sameP(x, e))) continue;
    seen.push(e);
    good.push(tex(w.k, w.f));
  }
  return mc(r, tex(k, right), good);
}

export const m3a: ContentMap = {
  // ───────────────────────── 제곱근과 실수 ─────────────────────────
  'm3a-1': {
    concepts: [
      {
        title: '제곱근',
        body: '어떤 수 $x$ 를 제곱하여 $a$ 가 될 때, $x$ 를 $a$ 의 **제곱근**이라 한다. ($x^2=a$)\n- 양수 $a$ 의 제곱근은 $\\pm\\sqrt{a}$ 두 개, $0$ 의 제곱근은 $0$, 음수의 제곱근은 없다.\n- $\\sqrt{a}$ 는 "제곱근 $a$", $a$ 의 양의 제곱근이다.',
        example: { q: '$16$ 의 제곱근과 제곱근 $16$ 은?', a: '$16$ 의 제곱근은 $\\pm4$, 제곱근 $16$ 은 $\\sqrt{16}=4$' },
      },
      {
        title: '제곱근의 성질',
        body: '$a>0$ 일 때\n- $(\\sqrt{a})^2=a$, $(-\\sqrt{a})^2=a$, $\\sqrt{a^2}=a$, $\\sqrt{(-a)^2}=a$\n- 일반적으로 $\\sqrt{A^2}=|A|$ : $A\\ge0$ 이면 $A$, $A<0$ 이면 $-A$',
      },
      {
        title: '제곱근의 대소 관계',
        body: '$a>0$, $b>0$ 일 때 $a<b$ 이면 $\\sqrt{a}<\\sqrt{b}$\n- 자연수와 비교할 때는 자연수를 근호 안으로: $3=\\sqrt{9}$ 이므로 $\\sqrt{8}<3$',
      },
      {
        title: '무리수와 실수',
        body: '순환하지 않는 무한소수를 **무리수**라 한다. ($\\sqrt{2}$, $\\pi$ …) 유리수와 무리수를 통틀어 **실수**라 한다.\n- 근호 안이 완전제곱수이면 유리수: $\\sqrt{25}=5$\n- 모든 실수는 수직선 위의 점에 하나씩 대응한다. 한 변이 $1$ 인 정사각형의 대각선의 길이는 $\\sqrt{2}$',
      },
    ],
    skills: [
      {
        id: 'sqrt-basic',
        title: '제곱근의 뜻과 성질',
        gen(r, level) {
          if (level === 1) {
            const k = r.int(2, 15);
            if (r.chance(0.5)) {
              return {
                q: `$${k * k}$ 의 제곱근을 모두 구하세요.`,
                answer: { type: 'set', values: [k, -k] },
                steps: [`$${k}^2=${k * k}$, $(-${k})^2=${k * k}$`, `$${k * k}$ 의 제곱근은 $\\pm${k}$`],
                hint: '양수의 제곱근은 두 개예요.',
              };
            }
            const n = r.pick(SQF);
            return {
              q: `다음 중 $${n}$ 의 제곱근을 바르게 나타낸 것은?`,
              answer: mc(r, `\\pm\\sqrt{${n}}`, [`\\sqrt{${n}}`, `-\\sqrt{${n}}`, `\\pm${n}`, `\\pm\\sqrt{${n * n}}`, `${n}^2`]),
              steps: [`제곱해서 $${n}$ 이 되는 수는 $\\sqrt{${n}}$ 과 $-\\sqrt{${n}}$`, `따라서 $\\pm\\sqrt{${n}}$`],
            };
          }
          if (level === 2) {
            const a = r.int(2, 12),
              b = r.int(2, 9),
              c = r.int(2, 15);
            const s1 = r.sign();
            const val = a - b * s1 + c;
            return {
              q: `$\\sqrt{${a * a}}${s1 > 0 ? '-' : '+'}\\sqrt{(-${b})^2}+(-\\sqrt{${c}})^2$ 을 계산하세요.`,
              answer: { type: 'num', value: val },
              steps: [`$\\sqrt{${a * a}}=${a}$, $\\sqrt{(-${b})^2}=${b}$, $(-\\sqrt{${c}})^2=${c}$`, `$${a}${s1 > 0 ? '-' : '+'}${b}+${c}=${val}$`],
            };
          }
          const p = r.int(-5, 2),
            q = p + r.int(2, 6);
          const lp = linTex(1, -p, 'a'),
            lq = linTex(1, -q, 'a');
          const A = `\\sqrt{${p === 0 ? 'a^2' : `(${lp})^2`}}`;
          const B = `\\sqrt{${q === 0 ? 'a^2' : `(${lq})^2`}}`;
          const right = `${q - p}`;
          return {
            q: `$${p}<a<${q}$ 일 때, $${A}+${B}$ 를 간단히 하면?`,
            answer: mc(r, right, [`${p - q}`, termsTex([{ c: 2, v: 'a' }, { c: -(p + q), v: '' }]), termsTex([{ c: -2, v: 'a' }, { c: p + q, v: '' }]), termsTex([{ c: 2, v: 'a' }, { c: p + q, v: '' }]), `${p === 0 ? q - p + 1 : q + p}`]),
            steps: [`$${lp}>0$ 이므로 $${A}=${lp}$`, `$${lq}<0$ 이므로 $${B}=-(${lq})=${linTex(-1, q, 'a')}$`, `$(${lp})+(${linTex(-1, q, 'a')})=${right}$`],
          };
        },
      },
      {
        id: 'compare',
        title: '실수의 대소 관계',
        gen(r, level) {
          if (level <= 2) {
            const vals: { v: number; t: string }[] = [];
            const seen = new Set<number>();
            while (vals.length < 5) {
              const kind = r.int(0, 2);
              let v: number, t: string;
              if (kind === 0) {
                const n = r.int(1, 5);
                v = n;
                t = `${n}`;
              } else {
                const n = r.pick([...SQF, 8, 12, 18, 20, 24]);
                v = Math.sqrt(n);
                t = `\\sqrt{${n}}`;
                if (n > 25) continue;
              }
              if (level === 2 && r.chance(0.5)) {
                v = -v;
                t = '-' + t;
              }
              const key = Math.round(v * 1e6);
              if (seen.has(key)) continue;
              seen.add(key);
              vals.push({ v, t });
            }
            const big = level === 1;
            const best = vals.reduce((a, b) => (big ? (b.v > a.v ? b : a) : b.v < a.v ? b : a));
            return {
              q: `다음 중 가장 ${big ? '큰' : '작은'} 수는?`,
              answer: mc(r, best.t, vals.filter((x) => x !== best).map((x) => x.t)),
              steps: ['자연수는 근호 안으로 넣어 비교합니다 (예: $3=\\sqrt{9}$).', `가장 ${big ? '큰' : '작은'} 수는 $${best.t}$`],
            };
          }
          const a = r.int(1, 5),
            b = a + r.int(1, 3);
          const cnt = b * b - a * a - 1;
          return {
            q: `$${a}<\\sqrt{x}<${b}$ 를 만족하는 자연수 $x$ 의 개수를 구하세요.`,
            answer: { type: 'num', value: cnt, unit: '개' },
            steps: [`각 변을 제곱하면 $${a * a}<x<${b * b}$`, `자연수 $x$ 는 $${a * a + 1}$ 부터 $${b * b - 1}$ 까지 $${cnt}$ 개`],
          };
        },
      },
      {
        id: 'irrational',
        title: '무리수 찾기',
        gen(r, level) {
          const ir = () => r.pick([`\\sqrt{${r.pick(SQF)}}`, '\\pi', `-\\sqrt{${r.pick(SQF)}}`, `${r.int(1, 5)}+\\sqrt{${r.pick([2, 3, 5])}}`]);
          const ra = () => {
            const k = r.int(1, 9);
            let d = r.int(2, 7);
            if (d === k) d++;
            return r.pick([`\\sqrt{${k * k}}`, `-\\sqrt{${k * k}}`, `0.\\dot{${k}}`, `\\frac{${k}}{${d}}`, `\\sqrt{\\frac{${k * k}}{${d * d}}}`, `${k}.${r.int(1, 9)}`, `\\sqrt{0.${k * k < 10 ? '0' + k * k : k * k}}`]);
          };
          if (level === 1) {
            const right = ir();
            const ws: string[] = [];
            for (let i = 0; i < 12; i++) ws.push(ra());
            return {
              q: '다음 중 **무리수**인 것은?',
              answer: mc(r, right, ws),
              steps: ['근호 안이 완전제곱수인 수, 분수, 순환소수는 모두 유리수입니다.', `$${right}$ 는 순환하지 않는 무한소수이므로 무리수`],
            };
          }
          if (level === 2) {
            const n = r.int(1, 4);
            const list = r.shuffle([...Array.from({ length: n }, ir), ...Array.from({ length: 6 - n }, ra)]);
            const uniq = [...new Set(list)];
            const count = uniq.filter((t) => t.includes('pi') || /\\sqrt\{(2|3|5|6|7|10|11|13|14|15|17|19|21|22|23)\}/.test(t)).length;
            return {
              q: `다음 수 중 무리수의 개수를 구하세요.\n$$${uniq.join(',\\quad ')}$$`,
              answer: { type: 'num', value: count, unit: '개' },
              steps: ['완전제곱수의 제곱근, 분수, 순환소수는 유리수입니다.', `무리수: ${uniq.filter((t) => t.includes('pi') || /\\sqrt\{(2|3|5|6|7|10|11|13|14|15|17|19|21|22|23)\}/.test(t)).map((t) => `$${t}$`).join(', ')} → $${count}$ 개`],
            };
          }
          const T = [
            '모든 실수는 수직선 위의 점으로 나타낼 수 있다.',
            '무리수는 순환하지 않는 무한소수이다.',
            '서로 다른 두 실수 사이에는 무수히 많은 무리수가 있다.',
            '유리수와 무리수를 통틀어 실수라 한다.',
            '근호 안의 수가 완전제곱수이면 그 수는 유리수이다.',
          ];
          const W = [
            '무한소수는 모두 무리수이다.',
            '근호를 사용하여 나타낸 수는 모두 무리수이다.',
            '수직선은 유리수에 대응하는 점들로 완전히 메울 수 있다.',
            '두 무리수의 합은 항상 무리수이다.',
            '$\\sqrt{2}$ 와 $\\sqrt{3}$ 사이에는 유리수가 없다.',
            '$0$ 은 유리수가 아니다.',
          ];
          const c = r.pick(T);
          return { q: '다음 중 옳은 것은?', answer: tc(r, c, r.sample(W, 4)), steps: [c, '예: $\\sqrt{4}=2$ 는 근호가 있지만 유리수, $\\sqrt{2}+(-\\sqrt{2})=0$ 은 유리수입니다.'] };
        },
      },
      {
        id: 'natural-sqrt',
        title: '제곱근이 자연수가 되는 조건',
        gen(r, level) {
          const s = r.pick([2, 3, 5, 6, 7, 10, 15, 14, 21]);
          const m = r.int(2, level === 1 ? 4 : 6);
          const k = s * m * m;
          if (level === 1) {
            return {
              q: `$\\sqrt{${k}x}$ 가 자연수가 되도록 하는 가장 작은 자연수 $x$ 의 값을 구하세요.`,
              answer: { type: 'num', value: s },
              steps: [`$${k}=${m * m}\\times${s}=${m}^2\\times${s}$`, `$${k}x$ 가 제곱수가 되려면 $x=${s}$ (이때 $\\sqrt{${k * s}}=${m * s}$)`],
              hint: '소인수분해해서 지수가 모두 짝수가 되게 하세요.',
            };
          }
          if (level === 2) {
            return {
              q: `$\\sqrt{\\frac{${k}}{x}}$ 가 자연수가 되도록 하는 가장 작은 자연수 $x$ 의 값은?`,
              answer: numChoices(r, s, [k, m, m * m, s * m, 1].filter((v) => v !== s)),
              steps: [`$${k}=${m}^2\\times${s}$`, `$\\frac{${k}}{x}$ 가 제곱수가 되려면 $x$ 는 $${s}$ 의 배수이면서 $${k}$ 의 약수`, `가장 작은 $x=${s}$ (이때 $\\sqrt{${m * m}}=${m}$)`],
            };
          }
          const N = r.int(20, 90);
          const sq: number[] = [];
          for (let i = 1; i * i < N; i++) sq.push(i * i);
          if (r.chance(0.5)) {
            return {
              q: `$\\sqrt{${N}-x}$ 가 자연수가 되도록 하는 자연수 $x$ 의 개수를 구하세요.`,
              answer: { type: 'num', value: sq.length, unit: '개' },
              steps: [`$${N}-x$ 는 $${N}$ 보다 작은 제곱수: $${sq.join(',')}$`, `$x$ 의 개수는 $${sq.length}$ 개`],
            };
          }
          const big = sq[sq.length - 1];
          return {
            q: `$\\sqrt{${N}-x}$ 가 자연수가 되도록 하는 가장 작은 자연수 $x$ 의 값을 구하세요.`,
            answer: { type: 'num', value: N - big },
            steps: [`$x$ 가 가장 작으려면 $${N}-x$ 가 $${N}$ 보다 작은 가장 큰 제곱수 $${big}$ 이어야 합니다.`, `$x=${N}-${big}=${N - big}$`],
          };
        },
      },
      {
        id: 'number-line',
        title: '수직선 위의 무리수',
        gen(r, level) {
          const a = level === 3 ? r.nonzero(-2, 2) : r.int(-2, 2);
          const w = level === 1 ? 1 : level === 2 ? r.pick([1, 2]) : r.pick([2, 3]);
          const rad = 1 + w * w;
          const dir = level === 3 ? -1 : r.sign();
          const pl = new Plane(a - 3.5, a + 3.5, -0.6, 2.4, { w: 300, h: 130, step: 1 });
          const x2 = a + dir * w;
          pl.polygon([
            [a, 0],
            [x2, 0],
            [x2, 1],
            [a, 1],
          ]);
          pl.seg(a, 0, x2, 1, { cls: 'acc2' });
          const R = Math.sqrt(rad);
          const ang = (Math.atan2(1, w) * 180) / Math.PI;
          const px = pl.X(1) - pl.X(0);
          if (dir > 0) pl.svg.arc(pl.X(a), pl.Y(0), R * px, 0, ang, { cls: 'acc2' });
          else pl.svg.arc(pl.X(a), pl.Y(0), R * px, 180 - ang, 180, { cls: 'acc2' });
          pl.point(a + dir * R, 0, 'P', { dy: 12 });
          const right = surd(a, dir, rad);
          return {
            q: `그림과 같이 수직선 위에 가로 $${w}$, 세로 $1$ 인 직사각형을 그리고, 수 $${a}$ 에 대응하는 점을 중심으로 대각선을 반지름으로 하는 원을 그려 수직선과 만나는 점을 $P$ 라 하자. 점 $P$ 에 대응하는 수는?`,
            fig: figStr(pl),
            answer: mc(r, right, [surd(a, -dir, rad), surd(a + dir, dir, rad), `${dir < 0 ? '-' : ''}\\sqrt{${rad}}`, surd(a, dir, rad + 1), surd(-a, dir, rad), surd(a, dir * 2, rad)]),
            steps: [`대각선의 길이 $=\\sqrt{${w}^2+1^2}=\\sqrt{${rad}}$`, `점 $P$ 는 $${a}$ 에서 ${dir > 0 ? '오른쪽' : '왼쪽'}으로 $\\sqrt{${rad}}$ 만큼 떨어져 있으므로 $${right}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 근호를 포함한 식의 계산 ─────────────────────────
  'm3a-2': {
    concepts: [
      {
        title: '제곱근의 곱셈과 나눗셈',
        body: '$a>0$, $b>0$ 일 때\n- $\\sqrt{a}\\times\\sqrt{b}=\\sqrt{ab}$, $\\ m\\sqrt{a}\\times n\\sqrt{b}=mn\\sqrt{ab}$\n- $\\sqrt{a}\\div\\sqrt{b}=\\sqrt{\\frac{a}{b}}$\n- $\\sqrt{a^2b}=a\\sqrt{b}$ : 근호 안의 제곱인수는 밖으로 꺼낸다.',
        example: { q: '$\\sqrt{72}$ 를 $a\\sqrt{b}$ 꼴로', a: '$\\sqrt{36\\times2}=6\\sqrt{2}$' },
      },
      {
        title: '분모의 유리화',
        body: '분모에 근호가 있으면 분자·분모에 같은 수를 곱해 분모를 유리수로 만든다.\n$$\\frac{a}{\\sqrt{b}}=\\frac{a\\sqrt{b}}{b},\\qquad \\frac{1}{\\sqrt{a}-\\sqrt{b}}=\\frac{\\sqrt{a}+\\sqrt{b}}{a-b}$$',
      },
      {
        title: '제곱근의 덧셈과 뺄셈',
        body: '근호 안이 같은 것끼리 동류항처럼 계산한다: $m\\sqrt{a}+n\\sqrt{a}=(m+n)\\sqrt{a}$\n- 먼저 $\\sqrt{a^2b}=a\\sqrt{b}$ 로 간단히 하면 동류항이 보인다: $\\sqrt{8}+\\sqrt{2}=3\\sqrt{2}$\n- $\\sqrt{a}+\\sqrt{b}\\ne\\sqrt{a+b}$ 에 주의!',
      },
      {
        title: '근호가 있는 식의 혼합 계산',
        body: '분배법칙과 곱셈 공식을 그대로 쓸 수 있다.\n$(\\sqrt{a}+\\sqrt{b})^2=a+b+2\\sqrt{ab}$, $(\\sqrt{a}+\\sqrt{b})(\\sqrt{a}-\\sqrt{b})=a-b$',
      },
    ],
    skills: [
      {
        id: 'mul-div',
        title: '제곱근의 곱셈과 나눗셈',
        gen(r, level) {
          if (level === 1) {
            const a = r.pick(SQF.slice(0, 8));
            const k = r.int(2, 5);
            const b = a * k * k;
            if (r.chance(0.5)) {
              const ans = sqrtTex(a * b);
              return {
                q: `$\\sqrt{${a}}\\times\\sqrt{${b}}$ 를 계산하면?`,
                answer: mc(r, ans, [`\\sqrt{${a + b}}`, `${a * k}\\sqrt{${a}}`, `${k}\\sqrt{${a}}`, `${a * b}`, `${k * a * a}`].filter((x) => x !== ans)),
                steps: [`$\\sqrt{${a}}\\times\\sqrt{${b}}=\\sqrt{${a * b}}$`, `$=\\sqrt{${a * k}^2}=${ans}$`],
              };
            }
            const c = r.pick(SQF.filter((x) => x !== a && gcd(x, a) === 1).slice(0, 6));
            const ans = `\\sqrt{${a}}`;
            return {
              q: `$\\sqrt{${a * c * k * k}}\\div\\sqrt{${c * k * k}}$ 를 계산하면?`,
              answer: mc(r, ans, [sqrtTex(a * c), `${k}\\sqrt{${a}}`, sqrtTex(a * c * k * k - c * k * k), `${k * k}\\sqrt{${a}}`, sqrtTex(a + c)].filter((x) => x !== ans)),
              steps: [`$\\sqrt{${a * c * k * k}}\\div\\sqrt{${c * k * k}}=\\sqrt{\\frac{${a * c * k * k}}{${c * k * k}}}$`, `$=\\sqrt{${a}}$`],
            };
          }
          if (level === 2) {
            const p = r.int(2, 5),
              q = r.int(2, 5);
            const b = r.pick([2, 3, 5, 6]);
            const d = b * r.pick([2, 3, 6, 5]);
            const ans = sqrtTex(b * d, p * q);
            return {
              q: `$${p}\\sqrt{${b}}\\times${q}\\sqrt{${d}}$ 를 계산하면?`,
              answer: mc(r, ans, [sqrtTex(b * d, p + q), `${p * q}\\sqrt{${b * d}}`, sqrtTex(b * d, p * q * 2), sqrtTex(b + d, p * q), `${p * q * b * d}`].filter((x) => x !== ans)),
              steps: [`$${p}\\times${q}\\times\\sqrt{${b}\\times${d}}=${p * q}\\sqrt{${b * d}}$`, `$=${ans}$`],
            };
          }
          const a = r.pick([2, 3, 5, 6]);
          const b = r.pick([2, 3, 6, 10, 15]);
          const c = r.pick([2, 3, 5].filter((x) => (a * b) % x === 0));
          if (!c) return this.gen(r, level);
          const p = r.int(2, 6),
            q = r.int(1, 4),
            s = r.pick([1, 2, 3].filter((x) => (p * q) % x === 0));
          const ans = sqrtTex((a * b) / c, (p * q) / s);
          return {
            q: `$${p}\\sqrt{${a}}\\times${q === 1 ? '' : q}\\sqrt{${b}}\\div${s === 1 ? '' : s}\\sqrt{${c}}$ 를 계산하면?`,
            answer: mc(r, ans, [sqrtTex(a * b * c, (p * q) / s), sqrtTex((a * b) / c, p * q * s), sqrtTex((a * b) / c, (p * q) / s + 1), sqrtTex(a * b, p * q)].filter((x) => x !== ans)),
            steps: [`$=\\frac{${p}\\times${q}}{${s}}\\sqrt{\\frac{${a}\\times${b}}{${c}}}=${(p * q) / s}\\sqrt{${(a * b) / c}}$`, `$=${ans}$`],
          };
        },
      },
      {
        id: 'simplify',
        title: '근호 안의 제곱인수 빼내기',
        gen(r, level) {
          const s = r.pick(SQF.slice(0, 10));
          const k = r.int(2, level === 1 ? 6 : 9);
          const n = s * k * k;
          if (level === 1) {
            return {
              q: `$\\sqrt{${n}}$ 을 $a\\sqrt{b}$ 꼴로 나타내면? (단, $b$ 는 가장 작은 자연수)`,
              answer: mc(r, `${k}\\sqrt{${s}}`, [`${s}\\sqrt{${k}}`, `${k * k}\\sqrt{${s}}`, `${k}\\sqrt{${s * k}}`, `${k + 1}\\sqrt{${s}}`, `${s}\\sqrt{${k * k}}`]),
              steps: [`$${n}=${k * k}\\times${s}=${k}^2\\times${s}$`, `$\\sqrt{${n}}=${k}\\sqrt{${s}}$`],
            };
          }
          if (level === 2) {
            return {
              q: `$${k}\\sqrt{${s}}=\\sqrt{x}$ 일 때, $x$ 의 값을 구하세요.`,
              answer: { type: 'num', value: n },
              steps: [`$${k}\\sqrt{${s}}=\\sqrt{${k}^2\\times${s}}$`, `$x=${k * k}\\times${s}=${n}$`],
            };
          }
          const d = r.pick([3, 4, 5, 7, 10].filter((x) => x !== k));
          const ans = fracSurd(k, s, d);
          return {
            q: `$\\sqrt{\\frac{${n}}{${d * d}}}$ 를 간단히 하면?`,
            answer: mc(r, ans, [fracSurd(k, s, d * d), fracSurd(k * k, s, d), fracSurd(1, s * k, d), fracSurd(k, s * d, d)].filter((x) => x !== ans)),
            steps: [`$\\sqrt{\\frac{${n}}{${d * d}}}=\\frac{\\sqrt{${n}}}{\\sqrt{${d * d}}}=\\frac{${k}\\sqrt{${s}}}{${d}}$`, `$=${ans}$`],
          };
        },
      },
      {
        id: 'rationalize',
        title: '분모의 유리화',
        gen(r, level) {
          if (level === 1) {
            const b = r.pick(SQF.slice(0, 9));
            const a = r.int(1, 12);
            const ans = fracSurd(a, b, b);
            return {
              q: `$\\frac{${a}}{\\sqrt{${b}}}$ 의 분모를 유리화하면?`,
              answer: mc(r, ans, [fracSurd(a, b, 1), fracSurd(1, b, a), `\\frac{${a}}{${b}}`, fracSurd(a, b, b * b), fracSurd(b, b, a)].filter((x) => x !== ans)),
              steps: [`분자·분모에 $\\sqrt{${b}}$ 를 곱하면 $\\frac{${a}\\sqrt{${b}}}{${b}}$`, `$=${ans}$`],
            };
          }
          if (level === 2) {
            const b = r.pick([2, 3, 5, 6, 7]);
            const c = r.int(2, 4);
            const a = r.int(1, 6) * b;
            const ans = fracSurd(a, b, c * b);
            return {
              q: `$\\frac{${a}}{${c}\\sqrt{${b}}}$ 의 분모를 유리화하면?`,
              answer: mc(r, ans, [fracSurd(a, b, c), fracSurd(a, b, b), fracSurd(a * c, b, b), fracSurd(a, 1, c * b), fracSurd(a, b, c * c * b)].filter((x) => x !== ans)),
              steps: [`분자·분모에 $\\sqrt{${b}}$ 를 곱하면 $\\frac{${a}\\sqrt{${b}}}{${c}\\times${b}}$`, `$=${ans}$`],
            };
          }
          for (;;) {
            const a = r.int(3, 15),
              b = r.int(2, a - 1);
            if (!isSqFree(a) || (!isSqFree(b) && b !== 1) || a - b > 6) continue;
            const d = a - b;
            const k = r.int(1, 3);
            const c = d * k;
            const sb = b === 1 ? '1' : `\\sqrt{${b}}`;
            const plus = r.chance(0.5);
            const ans = termsTex([
              { c: k, v: `\\sqrt{${a}}` },
              b === 1 ? { c: plus ? -k : k, v: '' } : { c: plus ? -k : k, v: `\\sqrt{${b}}` },
            ]);
            const wrong1 = termsTex([
              { c: k, v: `\\sqrt{${a}}` },
              b === 1 ? { c: plus ? k : -k, v: '' } : { c: plus ? k : -k, v: `\\sqrt{${b}}` },
            ]);
            const wrong2 = termsTex([
              { c: c, v: `\\sqrt{${a}}` },
              b === 1 ? { c: plus ? -c : c, v: '' } : { c: plus ? -c : c, v: `\\sqrt{${b}}` },
            ]);
            return {
              q: `$\\frac{${c}}{\\sqrt{${a}}${plus ? '+' : '-'}${sb}}$ 의 분모를 유리화하면?`,
              answer: mc(r, ans, [wrong1, wrong2, `\\frac{${ans}}{${a + b}}`, sqrtTex(a - b, k)].filter((x) => x !== ans)),
              steps: [`분자·분모에 $\\sqrt{${a}}${plus ? '-' : '+'}${sb}$ 를 곱합니다.`, `분모: $(\\sqrt{${a}})^2-${b === 1 ? '1^2' : `(\\sqrt{${b}})^2`}=${d}$`, `$\\frac{${c}(\\sqrt{${a}}${plus ? '-' : '+'}${sb})}{${d}}=${ans}$`],
            };
          }
        },
      },
      {
        id: 'add-sub',
        title: '제곱근의 덧셈과 뺄셈',
        gen(r, level) {
          const s = r.pick([2, 3, 5, 6, 7]);
          if (level === 1) {
            const a = r.int(1, 9),
              b = r.int(1, 9),
              c = r.int(1, 9);
            const k = a + b - c;
            if (k === 0) return this.gen(r, level);
            const t = (n: number) => (n === 1 ? '' : `${n}`);
            return {
              q: `$${t(a)}\\sqrt{${s}}+${t(b)}\\sqrt{${s}}-${t(c)}\\sqrt{${s}}$ 를 계산하면?`,
              answer: mc(r, sqrtTex(s, k), [sqrtTex(s, a + b + c), sqrtTex(s, a - b - c), sqrtTex(s * 3, k), sqrtTex(s, k + 1), `${k}`].filter((x) => x !== sqrtTex(s, k))),
              steps: ['근호 안이 같으므로 계수끼리 계산합니다.', `$(${a}+${b}-${c})\\sqrt{${s}}=${sqrtTex(s, k)}$`],
            };
          }
          const u = r.int(1, 4),
            v = r.int(2, 5),
            w = r.int(1, 4);
          const pa = r.int(1, 3),
            pb = r.sign() * r.int(1, 2);
          const k = pa * u + pb * v - w;
          const terms = `${pa === 1 ? '' : pa}\\sqrt{${s * u * u}}${pb > 0 ? '+' : '-'}${Math.abs(pb) === 1 ? '' : Math.abs(pb)}\\sqrt{${s * v * v}}-\\sqrt{${s * w * w}}`;
          if (level === 2) {
            if (k === 0) return this.gen(r, level);
            return {
              q: `$${terms}$ 를 계산하면?`,
              answer: mc(r, sqrtTex(s, k), [sqrtTex(s, pa * u + pb * v + w), sqrtTex(s * (u + v + w), 1), sqrtTex(s, -k), sqrtTex(s, k + 1), sqrtTex(s * u * u + s * v * v - s * w * w)].filter((x) => x !== sqrtTex(s, k))),
              steps: [`$\\sqrt{${s * u * u}}=${sqrtTex(s * u * u)}$, $\\sqrt{${s * v * v}}=${sqrtTex(s * v * v)}$, $\\sqrt{${s * w * w}}=${sqrtTex(s * w * w)}$`, `$(${pa * u}${pb * v >= 0 ? '+' : ''}${pb * v}-${w})\\sqrt{${s}}=${sqrtTex(s, k)}$`],
            };
          }
          // L3: 분모 유리화 포함, 계수 구하기
          const m = r.int(1, 4) * s;
          const k3 = pa * u + m / s - w;
          return {
            q: `$${pa === 1 ? '' : pa}\\sqrt{${s * u * u}}+\\frac{${m}}{\\sqrt{${s}}}-\\sqrt{${s * w * w}}=k\\sqrt{${s}}$ 일 때, 유리수 $k$ 의 값을 구하세요.`,
            answer: { type: 'num', value: k3 },
            steps: [`$\\frac{${m}}{\\sqrt{${s}}}=\\frac{${m}\\sqrt{${s}}}{${s}}=${sqrtTex(s, m / s)}$`, `$${sqrtTex(s * u * u, pa)}+${sqrtTex(s, m / s)}-${sqrtTex(s * w * w)}=(${pa * u}+${m / s}-${w})\\sqrt{${s}}$`, `$k=${k3}$`],
          };
        },
      },
      {
        id: 'mixed',
        title: '근호를 포함한 식의 혼합 계산',
        gen(r, level) {
          if (level === 1) {
            const a = r.pick([2, 3, 5]);
            const k = r.int(2, 4);
            const c = r.pick([3, 5, 7, 2].filter((x) => x !== a));
            // √a(√(a k²) + √c) = a k + √(ac)
            const ans = surd(a * k, 1, a * c);
            return {
              q: `$\\sqrt{${a}}(\\sqrt{${a * k * k}}+\\sqrt{${c}})$ 를 계산하면?`,
              answer: mc(r, ans, [surd(k, 1, a * c), surd(a * k, a, c), `\\sqrt{${a * a * k * k + a * c}}`, surd(a * k * k, 1, a * c), surd(a * k, 1, a + c)].filter((x) => x !== ans)),
              steps: [`$\\sqrt{${a}}\\times\\sqrt{${a * k * k}}=\\sqrt{${a * a * k * k}}=${a * k}$`, `$\\sqrt{${a}}\\times\\sqrt{${c}}=\\sqrt{${a * c}}$`, `$=${ans}$`],
            };
          }
          if (level === 2) {
            const a = r.pick([2, 3, 5, 6, 7]);
            const b = r.int(1, 4);
            if (r.chance(0.5)) {
              // (√a + b)²
              const sg = r.sign();
              const ans = surd(a + b * b, 2 * b * sg, a);
              return {
                q: `$(\\sqrt{${a}}${sg > 0 ? '+' : '-'}${b})^2$ 을 계산하면?`,
                answer: mc(r, ans, [`${a + b * b}`, surd(a + b * b, b * sg, a), surd(a - b * b, 2 * b * sg, a), surd(a + b * b, -2 * b * sg, a), surd(a + 2 * b, 2 * b * sg, a)].filter((x) => x !== ans)),
                steps: [`$(\\sqrt{${a}})^2${sg > 0 ? '+' : '-'}2\\times${b}\\times\\sqrt{${a}}+${b}^2$`, `$=${ans}$`],
              };
            }
            const c = r.pick([2, 3, 5, 7].filter((x) => x !== a));
            const ans = `${a - c}`;
            return {
              q: `$(\\sqrt{${a}}+\\sqrt{${c}})(\\sqrt{${a}}-\\sqrt{${c}})$ 를 계산하면?`,
              answer: mc(r, ans, [`${a + c}`, `${c - a}`, surd(a - c, 2, a * c), `\\sqrt{${Math.abs(a - c) + 1}}`, `${a * c}`].filter((x) => x !== ans)),
              steps: ['$(A+B)(A-B)=A^2-B^2$', `$=${a}-${c}=${a - c}$`],
            };
          }
          const p = r.int(1, 5) * r.sign(),
            q = r.pick([2, 3, 5, 6, 7]);
          const c = r.int(-6, 6);
          const val = q - p * p + c;
          return {
            q: `$x=${surd(p, 1, q)}$ 일 때, $${poly([1, -2 * p, c])}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: val },
            steps: [`$x${p > 0 ? '-' : '+'}${Math.abs(p)}=\\sqrt{${q}}$ 의 양변을 제곱하면 $${poly([1, -2 * p, p * p])}=${q}$`, `$${poly([1, -2 * p, 0])}=${q - p * p}$`, ...(c === 0 ? [] : [`$${poly([1, -2 * p, c])}=${q - p * p}${c > 0 ? '+' + c : c}=${val}$`])],
            hint: '$x$ 에서 유리수 부분을 넘기고 제곱해 보세요.',
          };
        },
      },
    ],
  },

  // ───────────────────────── 다항식의 곱셈과 인수분해 ─────────────────────────
  'm3a-3': {
    concepts: [
      {
        title: '곱셈 공식',
        body: '- $(a+b)^2=a^2+2ab+b^2$, $(a-b)^2=a^2-2ab+b^2$\n- $(a+b)(a-b)=a^2-b^2$\n- $(x+a)(x+b)=x^2+(a+b)x+ab$\n- $(ax+b)(cx+d)=acx^2+(ad+bc)x+bd$\n중2의 분배법칙을 정리한 것이에요.',
      },
      {
        title: '인수분해',
        body: '하나의 다항식을 두 개 이상의 다항식의 곱으로 나타내는 것. 곱셈 공식을 거꾸로 쓴다.\n- 공통인수로 묶기: $ma+mb=m(a+b)$\n- $a^2\\pm2ab+b^2=(a\\pm b)^2$, $a^2-b^2=(a+b)(a-b)$\n- $x^2+(a+b)x+ab=(x+a)(x+b)$: 곱이 상수항, 합이 $x$ 의 계수인 두 수 찾기',
        example: { q: '$x^2-x-12$ 를 인수분해', a: '곱이 $-12$, 합이 $-1$ 인 두 수 $-4$, $3$ → $(x-4)(x+3)$' },
      },
      {
        title: '완전제곱식',
        body: '$(x+a)^2$ 처럼 다항식의 제곱으로 된 식. $x^2+bx+c$ 가 완전제곱식이 되려면 $c=\\left(\\frac{b}{2}\\right)^2$',
      },
      {
        title: '인수분해 공식의 활용',
        body: '수의 계산을 쉽게: $51^2-49^2=(51+49)(51-49)=200$\n식의 값: $x+y$, $xy$ 를 알면 $x^2+y^2=(x+y)^2-2xy$',
      },
    ],
    skills: [
      {
        id: 'expand',
        title: '곱셈 공식으로 전개하기',
        gen(r, level) {
          if (level === 1) {
            const a = r.nonzero(-9, 9),
              b = r.nonzero(-9, 9);
            const right = poly([1, a + b, a * b]);
            return {
              q: `$${fac(1, a)}${fac(1, b)}$ 를 전개하면?`,
              answer: mc(r, right, [poly([1, a - b, a * b]), poly([1, a + b, -a * b]), poly([1, a * b, a + b]), poly([1, 0, a * b]), poly([1, -(a + b), a * b])].filter((x) => x !== right)),
              steps: ['$(x+a)(x+b)=x^2+(a+b)x+ab$', `$=x^2+(${a}${b >= 0 ? '+' : ''}${b})x+(${a})\\times(${b})=${right}$`],
            };
          }
          if (level === 2) {
            const a = r.int(1, 4),
              c = r.int(1, 4),
              b = r.nonzero(-7, 7),
              d = r.nonzero(-7, 7);
            if (a === 1 && c === 1) return this.gen(r, level);
            const right = poly([a * c, a * d + b * c, b * d]);
            return {
              q: `$${fac(a, b)}${fac(c, d)}$ 를 전개하면?`,
              answer: mc(r, right, [poly([a * c, a * b + c * d, b * d]), poly([a * c, a * d - b * c, b * d]), poly([a * c, 0, b * d]), poly([a * c, a * d + b * c, -b * d]), poly([a + c, a * d + b * c, b * d])].filter((x) => x !== right)),
              steps: ['$(ax+b)(cx+d)=acx^2+(ad+bc)x+bd$', `$=${a * c}x^2+(${a * d}${b * c >= 0 ? '+' : ''}${b * c})x${b * d >= 0 ? '+' : ''}${b * d}=${right}$`],
            };
          }
          const a = r.int(1, 5),
            b = r.nonzero(-5, 5);
          const kind = r.pick(['sq', 'diff']);
          const T = (x2: number, xy: number, y2: number) =>
            termsTex([
              { c: x2, v: 'x^{2}' },
              { c: xy, v: 'xy' },
              { c: y2, v: 'y^{2}' },
            ]);
          const lin = termsTex([
            { c: a, v: 'x' },
            { c: b, v: 'y' },
          ]);
          if (kind === 'sq') {
            const right = T(a * a, 2 * a * b, b * b);
            return {
              q: `$(${lin})^2$ 을 전개하면?`,
              answer: mc(r, right, [T(a * a, 0, b * b), T(a * a, a * b, b * b), T(a * a, -2 * a * b, b * b), T(a * a, 2 * a * b, -b * b), T(a, 2 * a * b, b)].filter((x) => x !== right)),
              steps: ['$(A+B)^2=A^2+2AB+B^2$', `$=${a === 1 ? 'x^2' : `(${a}x)^2`}+2\\times(${termsTex([{ c: a, v: 'x' }])})\\times(${termsTex([{ c: b, v: 'y' }])})+(${termsTex([{ c: b, v: 'y' }])})^2=${right}$`],
            };
          }
          const lin2 = termsTex([
            { c: a, v: 'x' },
            { c: -b, v: 'y' },
          ]);
          const right = T(a * a, 0, -b * b);
          return {
            q: `$(${lin})(${lin2})$ 를 전개하면?`,
            answer: mc(r, right, [T(a * a, 0, b * b), T(a * a, -2 * a * b, -b * b), T(a, 0, -b), T(a * a, 2 * a * b, b * b), T(-a * a, 0, b * b)].filter((x) => x !== right)),
            steps: ['$(A+B)(A-B)=A^2-B^2$', `$=${right}$`],
          };
        },
      },
      {
        id: 'coef',
        title: '전개식의 계수',
        gen(r, level) {
          if (level <= 2) {
            const a = level === 1 ? 1 : r.int(2, 5),
              c = level === 1 ? 1 : r.int(1, 4),
              b = r.nonzero(-9, 9),
              d = r.nonzero(-9, 9);
            const k = a * d + b * c;
            return {
              q: `$${fac(a, b)}${fac(c, d)}$ 를 전개한 식에서 $x$ 의 계수를 구하세요.`,
              answer: { type: 'num', value: k },
              steps: [`$x$ 의 계수 $=${a}\\times(${d})+(${b})\\times${c}$`, `$=${k}$`],
            };
          }
          const p = r.int(2, 4),
            q = r.nonzero(-6, 6),
            a = r.nonzero(-8, 8);
          const k = p * q + a;
          return {
            q: `$(${p}x+a)${fac(1, q)}$ 를 전개한 식에서 $x$ 의 계수가 $${k}$ 일 때, 상수 $a$ 의 값과 전개식의 상수항을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'a', value: a }, { label: '상수항', value: a * q }] },
            steps: [`$x$ 의 계수: $${p}\\times(${q})+a=${k}$`, `$a=${a}$`, `상수항 $=a\\times(${q})=${a * q}$`],
          };
        },
      },
      {
        id: 'factor',
        title: '인수분해하기',
        gen(r, level) {
          if (level === 1) {
            let a = r.nonzero(-9, 9),
              b = r.nonzero(-9, 9);
            if (a === b) b = -b === a ? b + 1 : -b;
            if (b === 0) b = 2;
            return {
              q: `$${poly([1, a + b, a * b])}$ 를 인수분해하면?`,
              answer: factorChoices(r, 1, [[1, a], [1, b]], [
                { k: 1, f: [[1, -a], [1, -b]] },
                { k: 1, f: [[1, a], [1, -b]] },
                { k: 1, f: [[1, -a], [1, b]] },
                { k: 1, f: [[1, a * b], [1, 1]] },
                { k: 1, f: [[1, a + b], [1, 1]] },
              ]),
              steps: [`곱이 $${a * b}$, 합이 $${a + b}$ 인 두 수: $${a}$, $${b}$`, `$=${fac(1, a)}${fac(1, b)}$`],
            };
          }
          if (level === 2) {
            const p = r.int(1, 3),
              q = r.int(2, 3),
              a = r.nonzero(-6, 6),
              b = r.nonzero(-6, 6);
            if (gcd(p, a) !== 1 || gcd(q, b) !== 1) return this.gen(r, level);
            const P = expand([
              [p, a],
              [q, b],
            ]);
            return {
              q: `$${poly(P)}$ 를 인수분해하면?`,
              answer: factorChoices(r, 1, [[p, a], [q, b]], [
                { k: 1, f: [[p, b], [q, a]] },
                { k: 1, f: [[p, -a], [q, -b]] },
                { k: 1, f: [[p, -a], [q, b]] },
                { k: 1, f: [[p, a], [q, -b]] },
                { k: 1, f: [[q, a], [p, b]] },
                { k: 1, f: [[p * q, a], [1, b]] },
              ]),
              steps: [`$${P[0]}=${p}\\times${q}$, $${P[2]}=(${a})\\times(${b})$ 로 놓고 대각선 곱의 합이 $${P[1]}$ 이 되는 것을 찾습니다.`, `$${p}\\times(${b})+(${a})\\times${q}=${P[1]}$`, `$=${fac(p, a)}${fac(q, b)}$`],
            };
          }
          const k = r.int(2, 5);
          const a = r.int(1, 7);
          if (r.chance(0.5)) {
            return {
              q: `$${poly([k, 0, -k * a * a])}$ 을 인수분해하면?`,
              answer: factorChoices(r, k, [[1, a], [1, -a]], [
                { k: k, f: [[1, -a], [1, -a]] },
                { k: 1, f: [[k, a], [1, -a]] },
                { k: k, f: [[1, a], [1, a]] },
                { k: 1, f: [[1, k * a], [1, -k * a]] },
                { k: k, f: [[1, a * a], [1, -1]] },
              ]),
              steps: [`공통인수 $${k}$ 로 묶으면 $${k}(${poly([1, 0, -a * a])})$`, `$=${k}${fac(1, a)}${fac(1, -a)}$`],
            };
          }
          const s = r.sign();
          return {
            q: `$${poly([k, 2 * k * a * s, k * a * a])}$ 을 인수분해하면?`,
            answer: mc(r, `${k}${fac(1, s * a)}^2`, [`${k}${fac(1, -s * a)}^2`, `${k}${fac(1, a)}${fac(1, -a)}`, `${fac(k, s * a)}^2`, `${k}${fac(1, 2 * s * a)}^2`, `${fac(1, s * k * a)}^2`]),
            steps: [`공통인수 $${k}$ 로 묶으면 $${k}(${poly([1, 2 * a * s, a * a])})$`, `$=${k}${fac(1, s * a)}^2$`],
          };
        },
      },
      {
        id: 'perfect-square',
        title: '완전제곱식 만들기',
        gen(r, level) {
          if (level === 1) {
            const a = r.nonzero(-9, 9);
            return {
              q: `$x^2${2 * a > 0 ? '+' : ''}${2 * a}x+\\square$ 가 완전제곱식이 되도록 $\\square$ 에 알맞은 수를 구하세요.`,
              answer: { type: 'num', value: a * a },
              steps: [`$\\square=\\left(\\frac{${2 * a}}{2}\\right)^2$`, `$=${a * a}$`],
            };
          }
          if (level === 2) {
            const a = r.int(2, 10);
            return {
              q: `$x^2+kx+${a * a}$ 이 완전제곱식이 되도록 하는 상수 $k$ 의 값을 모두 구하세요.`,
              answer: { type: 'set', values: [2 * a, -2 * a] },
              steps: [`$${a * a}=(\\pm${a})^2$ 이므로 $x^2+kx+${a * a}=(x\\pm${a})^2$`, `$k=\\pm${2 * a}$`],
            };
          }
          const p = r.int(2, 5),
            q = r.int(1, 7);
          if (gcd(p, q) !== 1) return this.gen(r, level);
          if (r.chance(0.5)) {
            return {
              q: `$${p * p}x^2+kx+${q * q}$ 이 완전제곱식이 되도록 하는 상수 $k$ 의 값을 모두 구하세요.`,
              answer: { type: 'set', values: [2 * p * q, -2 * p * q] },
              steps: [`$${p * p}x^2=(${p}x)^2$, $${q * q}=(${q})^2$`, `$(${p}x\\pm${q})^2$ 이므로 $k=\\pm2\\times${p}\\times${q}=\\pm${2 * p * q}$`],
            };
          }
          const s = r.sign();
          return {
            q: `$${p * p}x^2${s > 0 ? '+' : '-'}${2 * p * q}x+k$ 가 완전제곱식이 되도록 하는 상수 $k$ 의 값을 구하세요.`,
            answer: { type: 'num', value: q * q },
            steps: [`$${p * p}x^2${s > 0 ? '+' : '-'}${2 * p * q}x=(${p}x)^2${s > 0 ? '+' : '-'}2\\times${p}x\\times${q}$`, `$k=${q}^2=${q * q}$`],
          };
        },
      },
      {
        id: 'calc-trick',
        title: '인수분해 공식의 활용',
        gen(r, level) {
          if (level === 1) {
            const m = r.pick([50, 100, 30, 70]);
            const d = r.int(1, 9);
            const a = m + d,
              b = m - d;
            return {
              q: `인수분해 공식을 이용하여 $${a}^2-${b}^2$ 을 계산하세요.`,
              answer: { type: 'num', value: a * a - b * b },
              steps: [`$${a}^2-${b}^2=(${a}+${b})(${a}-${b})$`, `$=${a + b}\\times${a - b}=${a * a - b * b}$`],
            };
          }
          if (level === 2) {
            const m = r.pick([100, 200, 50, 1000]);
            const d = r.int(1, 4);
            if (r.chance(0.5)) {
              return {
                q: `$${m + d}\\times${m - d}$ 을 곱셈 공식을 이용하여 계산하면?`,
                answer: numChoices(r, m * m - d * d, [m * m + d * d, m * m - d, m * m - 2 * d, m * m]),
                steps: [`$(${m}+${d})(${m}-${d})=${m}^2-${d}^2$`, `$=${m * m}-${d * d}=${m * m - d * d}$`],
              };
            }
            const s = r.sign();
            const n = m + s * d;
            return {
              q: `$${n}^2$ 을 곱셈 공식을 이용하여 계산하면?`,
              answer: numChoices(r, n * n, [m * m + d * d, m * m + s * 2 * m * d, m * m - s * 2 * m * d + d * d, n * n + 10]),
              steps: [`$(${m}${s > 0 ? '+' : '-'}${d})^2=${m}^2${s > 0 ? '+' : '-'}2\\times${m}\\times${d}+${d}^2$`, `$=${n * n}$`],
            };
          }
          const m = r.pick([2, 3, 5, 6, 7]),
            n = r.int(1, 3);
          if (n * n === m) return this.gen(r, level);
          const ask = r.pick(['sum2', 'diff2', 'mix']);
          const S2 = 4 * m,
            P = m - n * n;
          const val = ask === 'sum2' ? S2 - 2 * P : ask === 'diff2' ? 4 * n * n : S2 - 3 * P;
          const expr = ask === 'sum2' ? 'x^2+y^2' : ask === 'diff2' ? '(x-y)^2' : 'x^2-xy+y^2';
          return {
            q: `$x=\\sqrt{${m}}+${n}$, $y=\\sqrt{${m}}-${n}$ 일 때, $${expr}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: val },
            steps: [`$x+y=2\\sqrt{${m}}$, $x-y=${2 * n}$, $xy=${m}-${n * n}=${P}$`, ask === 'sum2' ? `$x^2+y^2=(x+y)^2-2xy=${S2}-2\\times(${P})$` : ask === 'diff2' ? `$(x-y)^2=${2 * n}^2$` : `$x^2-xy+y^2=(x+y)^2-3xy=${S2}-3\\times(${P})$`, `$=${val}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 이차방정식 ─────────────────────────
  'm3a-4': {
    concepts: [
      {
        title: '이차방정식과 그 해',
        body: '$ax^2+bx+c=0$ ($a\\ne0$) 꼴의 방정식. 이 식을 참이 되게 하는 $x$ 의 값을 해(근)라 한다.\n- 인수분해: $AB=0$ 이면 $A=0$ 또는 $B=0$\n- 두 근이 같으면 **중근**: $(x-a)^2=0$ 의 해 $x=a$',
        example: { q: '$x^2-5x+6=0$', a: '$(x-2)(x-3)=0$, $x=2$ 또는 $x=3$' },
      },
      {
        title: '제곱근을 이용한 풀이',
        body: '- $x^2=q$ ($q\\ge0$) 이면 $x=\\pm\\sqrt{q}$\n- $(x-p)^2=q$ 이면 $x=p\\pm\\sqrt{q}$\n- 인수분해가 안 되면 완전제곱식 $(x-p)^2=q$ 꼴로 고쳐서 푼다.',
      },
      {
        title: '근의 공식',
        body: '$ax^2+bx+c=0$ 의 해는\n$$x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}\\ (b^2-4ac\\ge0)$$\n$b=2b\'$ (짝수)이면 $x=\\frac{-b\'\\pm\\sqrt{b\'^2-ac}}{a}$\n- 근의 개수: $b^2-4ac>0$ 이면 2개, $=0$ 이면 1개(중근), $<0$ 이면 0개',
      },
      {
        title: '이차방정식의 활용',
        body: '① 미지수 정하기 → ② 방정식 세우기 → ③ 풀기 → ④ **문제의 뜻에 맞는 해만** 고르기 (길이·개수는 양수, 자연수 등)',
      },
    ],
    skills: [
      {
        id: 'factor-solve',
        title: '인수분해로 풀기',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(-9, 9);
            const b = r.chance(0.15) ? a : r.int(-9, 9);
            const P = [1, -(a + b), a * b];
            return {
              q: `이차방정식 $${poly(P)}=0$ 의 해를 구하세요.`,
              answer: { type: 'set', values: a === b ? [a] : [a, b] },
              steps: [`$${a === b ? `${fac(1, -a)}^2` : fac(1, -a) + fac(1, -b)}=0$`, a === b ? `$x=${a}$ (중근)` : `$x=${a}$ 또는 $x=${b}$`],
            };
          }
          if (level === 2) {
            const p = r.int(2, 3),
              a = r.nonzero(-7, 7),
              b = r.int(-6, 6);
            if (a % p === 0) return this.gen(r, level);
            const P = expand([
              [p, -a],
              [1, -b],
            ]);
            return {
              q: `이차방정식 $${poly(P)}=0$ 의 해를 구하세요.`,
              answer: { type: 'set', values: [a / p, b] },
              steps: [`$${fac(p, -a)}${fac(1, -b)}=0$`, `$x=${new F(a, p).tex()}$ 또는 $x=${b}$`],
            };
          }
          const r1 = r.int(-8, 8),
            r2 = r.int(-8, 8);
          if (r1 === r2) return this.gen(r, level);
          const m = r.nonzero(-5, 5);
          const n = m + r1 + r2;
          const k = -r1 * r2;
          return {
            q: `이차방정식 $x${fac(1, m)}=${termsTex([{ c: n, v: 'x' }, { c: k, v: '' }])}$ 의 해를 구하세요.`,
            answer: { type: 'set', values: [r1, r2] },
            steps: [`전개하여 정리하면 $${poly([1, m - n, -k])}=0$`, `$${fac(1, -r1)}${fac(1, -r2)}=0$`, `$x=${r1}$ 또는 $x=${r2}$`],
          };
        },
      },
      {
        id: 'sqrt-solve',
        title: '제곱근을 이용한 풀이',
        gen(r, level) {
          if (level === 1) {
            const p = r.int(-6, 6),
              q = r.int(1, 7);
            const a = r.int(1, 3);
            return {
              q: `이차방정식 $${a === 1 ? '' : a}${p === 0 ? 'x^2' : `${fac(1, -p)}^2`}=${a * q * q}$ 의 해를 구하세요.`,
              answer: { type: 'set', values: [p + q, p - q] },
              steps: [a === 1 ? `$${p === 0 ? 'x' : fac(1, -p)}=\\pm${q}$` : `양변을 $${a}$ 로 나누면 $${p === 0 ? 'x^2' : `${fac(1, -p)}^2`}=${q * q}$, $${p === 0 ? 'x' : fac(1, -p)}=\\pm${q}$`, `$x=${p + q}$ 또는 $x=${p - q}$`],
            };
          }
          const p = r.nonzero(-6, 6);
          const q = r.pick([2, 3, 5, 6, 7, 8, 12, 18, 20]);
          const ans = p === 0 ? `\\pm${sqrtTex(q)}` : `${p}\\pm${sqrtTex(q)}`;
          const wrongs = [`${-p}\\pm${sqrtTex(q)}`, `${p}\\pm${q}`, `${p}\\pm\\sqrt{${q * 2}}`, `\\pm${sqrtTex(q + p * p)}`, `${p}+${sqrtTex(q)}`];
          if (level === 2) {
            return {
              q: `이차방정식 $${fac(1, -p)}^2=${q}$ 의 해는?`,
              answer: mc(r, `x=${ans}`, wrongs.map((w) => `x=${w}`)),
              steps: [`$${linTex(1, -p)}=\\pm\\sqrt{${q}}${isSqFree(q) ? '' : `=\\pm${sqrtTex(q)}`}$`, `$x=${ans}$`],
            };
          }
          const c = p * p - q;
          return {
            q: `이차방정식 $${poly([1, -2 * p, c])}=0$ 을 완전제곱식을 이용하여 풀면?`,
            answer: mc(r, `x=${ans}`, wrongs.map((w) => `x=${w}`)),
            steps: [`상수항을 넘기고 양변에 $${p * p}$ 을 더하면 $${poly([1, -2 * p, p * p])}=${q}$`, `$${fac(1, -p)}^2=${q}$`, `$x=${ans}$`],
          };
        },
      },
      {
        id: 'formula',
        title: '근의 공식',
        gen(r, level) {
          for (;;) {
            const a = level === 1 ? 1 : r.int(1, 3);
            const b = r.int(-9, 9),
              c = r.nonzero(-9, 9);
            const D = b * b - 4 * a * c;
            if (D <= 0 || isSq(D)) continue;
            if (level === 1 && b % 2 === 0) continue;
            const right = quadRootsTex(a, b, c);
            const D2 = b * b + 4 * a * c;
            const wr = [quadRootsTex(a, -b, c), rootsTex(-b, D, a), rootsTex(b, D, a), D2 > 0 ? rootsTex(-b, D2, 2 * a) : rootsTex(-b, D + 4, 2 * a), rootsTex(-b, D, 4 * a)];
            if (level === 3) {
              const k = r.pick([2, 3, 4, 6]);
              const disp = r.chance(0.5)
                ? `${termsTex([{ c: new F(a, k), v: 'x^{2}' }, { c: new F(b, k), v: 'x' }, { c: new F(c, k), v: '' }])}=0`
                : `${termsTex([{ c: a, v: 'x^{2}' }, { c: b, v: 'x' }])}=${-c}`.replace('=-', '=-');
              return {
                q: `이차방정식 $${disp}$ 의 해는?`,
                answer: mc(r, `x=${right}`, wr.map((w) => `x=${w}`)),
                steps: [`정리하면 $${poly([a, b, c])}=0$`, `근의 공식: $x=\\frac{${-b}\\pm\\sqrt{${b * b}-4\\times${a}\\times(${c})}}{2\\times${a}}=\\frac{${-b}\\pm\\sqrt{${D}}}{${2 * a}}$`, `$=${right}$`],
              };
            }
            return {
              q: `이차방정식 $${poly([a, b, c])}=0$ 의 해는?`,
              answer: mc(r, `x=${right}`, wr.map((w) => `x=${w}`)),
              steps: [`$b^2-4ac=${b * b}-4\\times${a}\\times(${c})=${D}$`, `$x=\\frac{${-b}\\pm\\sqrt{${D}}}{${2 * a}}=${right}$`],
            };
          }
        },
      },
      {
        id: 'discriminant',
        title: '근의 개수와 한 근이 주어진 경우',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(1, 3),
              b = r.int(-8, 8),
              c = r.int(-6, 6);
            const D = b * b - 4 * a * c;
            const kind = D > 0 ? '서로 다른 두 근' : D === 0 ? '중근 (한 개)' : '근이 없다';
            return {
              q: `이차방정식 $${poly([a, b, c])}=0$ 의 근에 대한 설명으로 옳은 것은?`,
              answer: tc(r, kind, ['서로 다른 두 근', '중근 (한 개)', '근이 없다', '서로 다른 세 근'].filter((x) => x !== kind), 4),
              steps: [`$b^2-4ac=${b * b}-4\\times${a}\\times(${c})=${D}$`, `$${D}${D > 0 ? '>' : D === 0 ? '=' : '<'}0$ 이므로 ${kind}`],
            };
          }
          if (level === 2) {
            if (r.chance(0.5)) {
              const a = r.nonzero(-8, 8);
              return {
                q: `이차방정식 $${poly([1, -2 * a, 0])}+k=0$ 이 중근을 가질 때, 상수 $k$ 의 값과 그 중근을 구하세요.`,
                answer: { type: 'fields', fields: [{ label: 'k', value: a * a }, { label: '중근', value: a }] },
                steps: [`중근을 가지려면 좌변이 완전제곱식: $k=\\left(\\frac{${-2 * a}}{2}\\right)^2=${a * a}$`, `$${fac(1, -a)}^2=0$ 이므로 중근 $x=${a}$`],
              };
            }
            const c = r.int(2, 9);
            return {
              q: `이차방정식 $x^2+kx+${c * c}=0$ 이 중근을 갖도록 하는 상수 $k$ 의 값을 모두 구하세요.`,
              answer: { type: 'set', values: [2 * c, -2 * c] },
              steps: [`$k^2-4\\times${c * c}=0$`, `$k^2=${4 * c * c}$, $k=\\pm${2 * c}$`],
            };
          }
          const r1 = r.nonzero(-7, 7),
            r2 = r.nonzero(-7, 7);
          if (r1 === r2) return this.gen(r, level);
          const c = r1 * r2;
          const k = -(r1 + r2);
          return {
            q: `이차방정식 $x^2+kx${c >= 0 ? '+' : ''}${c}=0$ 의 한 근이 $${r1}$ 일 때, 상수 $k$ 의 값과 다른 한 근을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'k', value: k }, { label: '다른 한 근', value: r2 }] },
            steps: [`$x=${r1}$ 을 대입: $${termsTex([{ c: r1, v: 'k' }, { c: r1 * r1 + c, v: '' }])}=0$ 에서 $k=${k}$`, `$${poly([1, k, c])}=0$, $${fac(1, -r1)}${fac(1, -r2)}=0$`, `다른 한 근은 $x=${r2}$`],
          };
        },
      },
      {
        id: 'word',
        title: '이차방정식의 활용',
        gen(r, level) {
          if (level === 1) {
            const n = r.int(3, 20);
            const odd = r.chance(0.5);
            if (odd) {
              const m = 2 * r.int(1, 10) + 1;
              return {
                q: `연속하는 두 홀수의 곱이 $${m * (m + 2)}$ 일 때, 두 홀수 중 작은 수를 구하세요. (단, 두 수는 자연수)`,
                answer: { type: 'num', value: m },
                steps: [`작은 수를 $x$ 라 하면 $x(x+2)=${m * (m + 2)}$`, `$${poly([1, 2, -m * (m + 2)])}=0$, $(x-${m})(x+${m + 2})=0$`, `$x$ 는 자연수이므로 $x=${m}$`],
              };
            }
            return {
              q: `연속하는 두 자연수의 곱이 $${n * (n + 1)}$ 일 때, 두 수 중 작은 수를 구하세요.`,
              answer: { type: 'num', value: n },
              steps: [`작은 수를 $x$ 라 하면 $x(x+1)=${n * (n + 1)}$`, `$(x-${n})(x+${n + 1})=0$`, `$x$ 는 자연수이므로 $x=${n}$`],
            };
          }
          if (level === 2) {
            const w = r.int(3, 15),
              d = r.int(1, 8);
            const name = r.pick(NAMES);
            return {
              q: `${neun(name)} 가로의 길이가 세로의 길이보다 $${d}\\,\\text{m}$ 더 긴 직사각형 모양의 텃밭을 만들려고 한다. 텃밭의 넓이가 $${w * (w + d)}\\,\\text{m}^2$ 일 때, 세로의 길이를 구하세요.`,
              answer: { type: 'num', value: w, unit: 'm' },
              steps: [`세로를 $x\\,\\text{m}$ 라 하면 $x(x+${d})=${w * (w + d)}$`, `$${poly([1, d, -w * (w + d)])}=0$, $(x-${w})(x+${w + d})=0$`, `$x>0$ 이므로 $x=${w}$`],
            };
          }
          if (r.chance(0.5)) {
            const t1 = r.int(1, 3),
              t2 = t1 + r.int(1, 4);
            const v = 5 * (t1 + t2),
              H = 5 * t1 * t2;
            return {
              q: `지면에서 초속 $${v}\\,\\text{m}$ 로 똑바로 위로 쏘아 올린 공의 $t$ 초 후의 높이는 $(${v}t-5t^2)\\,\\text{m}$ 이다. 공의 높이가 처음으로 $${H}\\,\\text{m}$ 가 되는 것은 몇 초 후인지 구하세요.`,
              answer: { type: 'num', value: t1, unit: '초' },
              steps: [`$${v}t-5t^2=${H}$, $t^2-${t1 + t2}t+${t1 * t2}=0$`, `$(t-${t1})(t-${t2})=0$, $t=${t1}$ 또는 $t=${t2}$`, `처음으로 도달하는 것은 $${t1}$ 초 후`],
            };
          }
          const x = r.int(1, 4);
          const a = r.int(x + 6, 20),
            b = r.int(x + 4, 16);
          const S = (a - x) * (b - x);
          return {
            q: `가로 $${a}\\,\\text{m}$, 세로 $${b}\\,\\text{m}$ 인 직사각형 땅에 그림처럼 폭이 일정한 길을 가로, 세로로 하나씩 내었더니 길을 뺀 땅의 넓이가 $${S}\\,\\text{m}^2$ 가 되었다. 길의 폭을 구하세요.`,
            fig: (() => {
              const W = 240,
                H = Math.round((240 * b) / a);
              const sc = (W - 20) / a;
              const s = new Svg(W, H + 20);
              const x0 = a * 0.35,
                y0 = b * 0.4;
              s.rect(10, 10, a * sc, b * sc, { fill: true, cls: 'acc' });
              s.rect(10 + x0 * sc, 10, x * sc, b * sc, { cls: 'acc2' });
              s.rect(10, 10 + y0 * sc, a * sc, x * sc, { cls: 'acc2' });
              return s.toString();
            })(),
            answer: { type: 'num', value: x, unit: 'm' },
            steps: [`길을 한쪽으로 모으면 남은 땅은 가로 $(${a}-x)$, 세로 $(${b}-x)$ 인 직사각형`, `$(${a}-x)(${b}-x)=${S}$, $${poly([1, -(a + b), a * b - S])}=0$`, `$(x-${x})(x-${a + b - x})=0$ 에서 $0<x<${b}$ 이므로 $x=${x}$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 이차함수와 그래프 ─────────────────────────
  'm3a-5': {
    concepts: [
      {
        title: '이차함수 $y=ax^2$',
        body: '$y=ax^2+bx+c$ ($a\\ne0$) 꼴을 이차함수라 한다. $y=ax^2$ 의 그래프는\n- 원점이 꼭짓점, $y$ 축이 축인 포물선\n- $a>0$ 이면 아래로 볼록, $a<0$ 이면 위로 볼록\n- $|a|$ 가 클수록 폭이 좁다.',
      },
      {
        title: '$y=a(x-p)^2+q$ 의 그래프',
        body: '$y=ax^2$ 의 그래프를 $x$ 축 방향으로 $p$, $y$ 축 방향으로 $q$ 만큼 평행이동한 것.\n- 꼭짓점 $(p,\\ q)$, 축의 방정식 $x=p$\n- 중2의 일차함수 평행이동과 같은 원리예요.',
        example: { q: '$y=2(x-1)^2+3$ 의 꼭짓점은?', a: '$(1,\\ 3)$' },
      },
      {
        title: '$y=ax^2+bx+c$ 의 그래프',
        body: '완전제곱식으로 고쳐 $y=a(x-p)^2+q$ 꼴로 만든다.\n$$y=a\\left(x+\\frac{b}{2a}\\right)^2-\\frac{b^2-4ac}{4a}$$\n- $y$ 절편은 $c$\n- $a$ 의 부호: 볼록 방향, $ab>0$ 이면 축이 $y$ 축 왼쪽, $ab<0$ 이면 오른쪽, $c$ 의 부호: $y$ 절편 위치',
      },
      {
        title: '이차함수의 식 구하기',
        body: '- 꼭짓점 $(p,q)$ 와 다른 한 점 → $y=a(x-p)^2+q$ 에 대입\n- 축 $x=p$ 와 두 점 → $y=a(x-p)^2+q$ 에 두 점 대입\n- 세 점 → $y=ax^2+bx+c$ 에 대입하여 연립',
      },
    ],
    skills: [
      {
        id: 'vertex',
        title: '꼭짓점과 축',
        gen(r, level) {
          const a = r.pick([1, 2, 3, -1, -2, -3, 1, -1]);
          const p = r.int(-5, 5),
            q = r.int(-7, 7);
          if (level === 1) {
            return {
              q: `이차함수 $y=${a === 1 ? '' : a === -1 ? '-' : a}${p === 0 ? 'x^2' : `${fac(1, -p)}^2`}${q === 0 ? '' : q > 0 ? '+' + q : q}$ 의 그래프의 꼭짓점의 좌표를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'x 좌표', value: p }, { label: 'y 좌표', value: q }] },
              steps: [`$y=a(x-p)^2+q$ 의 꼭짓점은 $(p,\\ q)$`, `꼭짓점 $(${p},\\ ${q})$`],
            };
          }
          const P = [a, -2 * a * p, a * p * p + q];
          if (level === 2) {
            return {
              q: `이차함수 $y=${poly(P)}$ 의 그래프의 꼭짓점의 좌표를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'x 좌표', value: p }, { label: 'y 좌표', value: q }] },
              steps: [`$y=${a === 1 ? '' : a === -1 ? '-' : a}(${poly([1, -2 * p, 0])})${a * p * p + q >= 0 ? '+' : ''}${a * p * p + q}$`, `$=${a === 1 ? '' : a === -1 ? '-' : a}${p === 0 ? 'x^2' : `${fac(1, -p)}^2`}${q === 0 ? '' : q > 0 ? '+' + q : q}$`, `꼭짓점 $(${p},\\ ${q})$`],
            };
          }
          const A = 1;
          const PP = [A, -2 * p, p * p + q];
          return {
            q: `이차함수 $y=x^2+ax+b$ 의 그래프의 꼭짓점의 좌표가 $(${p},\\ ${q})$ 일 때, 상수 $a$, $b$ 의 값을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'a', value: PP[1] }, { label: 'b', value: PP[2] }] },
            steps: [`$y=${p === 0 ? 'x^2' : `${fac(1, -p)}^2`}${q === 0 ? '' : q > 0 ? '+' + q : q}$`, `전개하면 $y=${poly(PP)}$`, `$a=${PP[1]}$, $b=${PP[2]}$`],
          };
        },
      },
      {
        id: 'graph-choice',
        title: '그래프 보고 식 고르기',
        gen(r, level) {
          const a = level === 1 ? r.pick([1, -1]) : r.pick([1, -1, 2, -2]);
          const p = r.nonzero(-3, 3),
            q = level === 1 ? r.int(-3, 3) : r.nonzero(-3, 3);
          const f = (A: number, P: number, Q: number) => `y=${A === 1 ? '' : A === -1 ? '-' : A}${P === 0 ? 'x^2' : `${fac(1, -P)}^2`}${Q === 0 ? '' : Q > 0 ? '+' + Q : Q}`;
          const pl = new Plane(-6, 6, -6, 6, { w: 240, h: 240 });
          pl.fn((x) => a * (x - p) ** 2 + q);
          pl.point(p, q, `(${p}, ${q})`, { dy: a > 0 ? 14 : -12 });
          if (level === 3) pl.point(p + 1, q + a, undefined, { cls: 'acc2' });
          const wr = [f(a, -p, q), f(a, p, -q), f(-a, p, q), f(a, -p, -q), f(-a, -p, q)];
          if (level === 3) wr.push(f(2 * a, p, q), f(a / Math.abs(a), p, q));
          if (level === 3) {
            return {
              q: `그림은 꼭짓점이 $(${p},\\ ${q})$ 이고 점 $(${p + 1},\\ ${q + a})$ 를 지나는 포물선이다. 이 그래프의 식은?`,
              fig: figStr(pl),
              answer: mc(r, f(a, p, q), wr.filter((w) => w !== f(a, p, q))),
              steps: [`꼭짓점이 $(${p},\\ ${q})$ 이므로 $y=a${fac(1, -p)}^2${q > 0 ? '+' + q : q}$`, `점 $(${p + 1},\\ ${q + a})$ 대입: $${q + a}=a+${paren(q)}$, $a=${a}$`, `$${f(a, p, q)}$`],
            };
          }
          return {
            q: `다음 그림과 같은 포물선을 그래프로 하는 이차함수의 식은? (꼭짓점이 표시되어 있고, 그래프는 $y=${a === 1 ? '' : a === -1 ? '-' : a}x^2$ 의 그래프를 평행이동한 것이다.)`,
            fig: figStr(pl),
            answer: mc(r, f(a, p, q), wr),
            steps: [`꼭짓점 $(${p},\\ ${q})$, ${a > 0 ? '아래로' : '위로'} 볼록`, `$${f(a, p, q)}$`],
          };
        },
      },
      {
        id: 'translate',
        title: '평행이동',
        gen(r, level) {
          const a = r.pick([1, 2, 3, -1, -2, -3]);
          const A = a === 1 ? '' : a === -1 ? '-' : `${a}`;
          const m = r.nonzero(-5, 5),
            n = r.nonzero(-6, 6);
          const f = (P: number, Q: number) => `y=${A}${P === 0 ? 'x^2' : `${fac(1, -P)}^2`}${Q === 0 ? '' : Q > 0 ? '+' + Q : Q}`;
          if (level === 1) {
            return {
              q: `이차함수 $y=${A}x^2$ 의 그래프를 $x$ 축의 방향으로 $${m}$ 만큼, $y$ 축의 방향으로 $${n}$ 만큼 평행이동한 그래프의 식은?`,
              answer: mc(r, f(m, n), [f(-m, n), f(m, -n), f(-m, -n), f(n, m), `y=${A}x^2${n > 0 ? '+' : ''}${n}`]),
              steps: [`$x$ 대신 $x-(${m})$, $y$ 축 방향으로 $${n}$`, `$${f(m, n)}$`],
            };
          }
          if (level === 2) {
            const s = r.int(-3, 3);
            const t = a * (s - m) ** 2 + n;
            return {
              q: `이차함수 $y=${A}x^2$ 의 그래프를 $x$ 축의 방향으로 $${m}$ 만큼, $y$ 축의 방향으로 $k$ 만큼 평행이동한 그래프가 점 $(${s},\\ ${t})$ 를 지날 때, 상수 $k$ 의 값을 구하세요.`,
              answer: { type: 'num', value: n },
              steps: [`$y=${A}${fac(1, -m)}^2+k$`, `$${t}=${a}\\times(${s - m})^2+k=${a * (s - m) ** 2}+k$`, `$k=${n}$`],
            };
          }
          const p = r.int(-3, 3),
            q = r.int(-4, 4);
          const P1 = [a, -2 * a * p, a * p * p + q];
          const P2 = [a, -2 * a * (p + m), a * (p + m) ** 2 + q + n];
          return {
            q: `이차함수 $y=${poly(P1)}$ 의 그래프를 $x$ 축의 방향으로 $m$ 만큼, $y$ 축의 방향으로 $n$ 만큼 평행이동하였더니 $y=${poly(P2)}$ 의 그래프가 되었다. $m$, $n$ 의 값을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'm', value: m }, { label: 'n', value: n }] },
            steps: [`$y=${poly(P1)}$ 의 꼭짓점: $(${p},\\ ${q})$`, `$y=${poly(P2)}$ 의 꼭짓점: $(${p + m},\\ ${q + n})$`, `$m=${p + m}-(${p})=${m}$, $n=${q + n}-(${q})=${n}$`],
          };
        },
      },
      {
        id: 'find-eq',
        title: '이차함수의 식 구하기',
        gen(r, level) {
          const a = r.pick([1, 2, 3, -1, -2, -3]);
          const p = r.int(-4, 4),
            q = r.int(-6, 6);
          if (level === 1) {
            const d = r.nonzero(-2, 2);
            const x0 = p + d,
              y0 = a * d * d + q;
            return {
              q: `꼭짓점의 좌표가 $(${p},\\ ${q})$ 이고 점 $(${x0},\\ ${y0})$ 을 지나는 포물선을 그래프로 하는 이차함수 $y=a(x-p)^2+q$ 에서 $a$ 의 값을 구하세요.`,
              answer: { type: 'num', value: a },
              steps: [`$y=a${p === 0 ? 'x^2' : `${fac(1, -p)}^2`}${q === 0 ? '' : q > 0 ? '+' + q : q}$ 에 $(${x0},\\ ${y0})$ 대입`, `$${y0}=${termsTex([{ c: d * d, v: 'a' }, { c: q, v: '' }])}$`, `$a=${a}$`],
            };
          }
          if (level === 2) {
            const d1 = r.nonzero(-3, 3);
            let d2 = r.nonzero(-3, 3);
            if (Math.abs(d1) === Math.abs(d2)) d2 = Math.abs(d1) === 3 ? 1 : Math.sign(d2) * (Math.abs(d1) + 1);
            const pts = [
              [p + d1, a * d1 * d1 + q],
              [p + d2, a * d2 * d2 + q],
            ];
            return {
              q: `축의 방정식이 $x=${p}$ 이고 두 점 $(${pts[0][0]},\\ ${pts[0][1]})$, $(${pts[1][0]},\\ ${pts[1][1]})$ 을 지나는 포물선을 그래프로 하는 이차함수 $y=a${p === 0 ? 'x^2' : `${fac(1, -p)}^2`}+q$ 에서 $a$, $q$ 의 값을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'a', value: a }, { label: 'q', value: q }] },
              steps: [`두 점을 대입: $${pts[0][1]}=${termsTex([{ c: d1 * d1, v: 'a' }, { c: 1, v: 'q' }])}$, $${pts[1][1]}=${termsTex([{ c: d2 * d2, v: 'a' }, { c: 1, v: 'q' }])}$`, `빼면 $${pts[0][1] - pts[1][1]}=${termsTex([{ c: d1 * d1 - d2 * d2, v: 'a' }])}$, $a=${a}$`, `$q=${q}$`],
            };
          }
          const b = r.int(-5, 5),
            c = r.int(-6, 6);
          const xs = r.sample([-2, -1, 0, 1, 2, 3], 3).sort((u, v) => u - v);
          const ys = xs.map((x) => a * x * x + b * x + c);
          return {
            q: `세 점 ${xs.map((x, i) => `$(${x},\\ ${ys[i]})$`).join(', ')} 을 지나는 포물선을 그래프로 하는 이차함수 $y=ax^2+bx+c$ 에서 $a$, $b$, $c$ 의 값을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'a', value: a }, { label: 'b', value: b }, { label: 'c', value: c }] },
            steps: [...xs.map((x, i) => `$${ys[i]}=${termsTex([{ c: x * x, v: 'a' }, { c: x, v: 'b' }, { c: 1, v: 'c' }])}$`), `연립하여 풀면 $a=${a}$, $b=${b}$, $c=${c}$`],
          };
        },
      },
      {
        id: 'property',
        title: '그래프의 성질',
        gen(r, level) {
          if (level <= 2) {
            const a = r.pick([1, 2, 3, -1, -2, -3, 1 / 2, -1 / 2]);
            const p = r.nonzero(-4, 4),
              q = r.nonzero(-5, 5);
            const A = a === 1 ? '' : a === -1 ? '-' : a === 0.5 ? '\\frac{1}{2}' : a === -0.5 ? '-\\frac{1}{2}' : `${a}`;
            const up = a > 0;
            const T = [
              `꼭짓점의 좌표는 $(${p},\\ ${q})$ 이다.`,
              `축의 방정식은 $x=${p}$ 이다.`,
              `${up ? '아래로' : '위로'} 볼록한 포물선이다.`,
              `$x>${p}$ 일 때, $x$ 의 값이 증가하면 $y$ 의 값은 ${up ? '증가' : '감소'}한다.`,
              `$y=${A}x^2$ 의 그래프를 평행이동한 것이다.`,
            ];
            const W = [
              `꼭짓점의 좌표는 $(${-p},\\ ${q})$ 이다.`,
              `축의 방정식은 $x=${-p}$ 이다.`,
              `${up ? '위로' : '아래로'} 볼록한 포물선이다.`,
              `$x>${p}$ 일 때, $x$ 의 값이 증가하면 $y$ 의 값은 ${up ? '감소' : '증가'}한다.`,
              `$y=${a > 0 ? '-' : ''}${A.replace('-', '')}x^2$ 의 그래프를 평행이동한 것이다.`,
              `꼭짓점의 좌표는 $(${p},\\ ${-q})$ 이다.`,
            ];
            const fx = `y=${A}${fac(1, -p)}^2${q > 0 ? '+' + q : q}`;
            if (level === 1) {
              const c = r.pick(T);
              return { q: `이차함수 $${fx}$ 의 그래프에 대한 설명으로 옳은 것은?`, answer: tc(r, c, r.sample(W, 4)), steps: [`꼭짓점 $(${p},\\ ${q})$, 축 $x=${p}$, $a${up ? '>' : '<'}0$ 이므로 ${up ? '아래로' : '위로'} 볼록`, c] };
            }
            const c = r.pick(W);
            return { q: `이차함수 $${fx}$ 의 그래프에 대한 설명으로 옳지 **않은** 것은?`, answer: tc(r, c, r.sample(T, 4)), steps: [`꼭짓점 $(${p},\\ ${q})$, 축 $x=${p}$, $a${up ? '>' : '<'}0$ 이므로 ${up ? '아래로' : '위로'} 볼록`, `따라서 '${c}' 는 옳지 않습니다.`] };
          }
          const a = r.pick([1, -1, 2, -2]);
          const p = r.nonzero(-3, 3);
          const q = r.int(-4, 4);
          const c = a * p * p + q;
          if (c === 0) return this.gen(r, level);
          const b = -2 * a * p;
          const pl = new Plane(-6, 6, -6, 6, { w: 230, h: 230, labels: false });
          pl.fn((x) => a * (x - p) ** 2 + q);
          const sg = (v: number) => (v > 0 ? '>' : '<');
          const combo = (x: number, y: number, z: number) => `$a${sg(x)}0,\\ b${sg(y)}0,\\ c${sg(z)}0$`;
          const right = combo(a, b, c);
          const all: string[] = [];
          for (const x of [1, -1]) for (const y of [1, -1]) for (const z of [1, -1]) all.push(combo(x, y, z));
          return {
            q: '이차함수 $y=ax^2+bx+c$ 의 그래프가 그림과 같을 때, 상수 $a$, $b$, $c$ 의 부호로 옳은 것은?',
            fig: figStr(pl),
            answer: tc(r, right, all.filter((x) => x !== right)),
            steps: [`${a > 0 ? '아래로' : '위로'} 볼록이므로 $a${sg(a)}0$`, `축이 $y$ 축의 ${p < 0 ? '왼쪽' : '오른쪽'}에 있으므로 $a$, $b$ 는 ${p < 0 ? '같은' : '다른'} 부호: $b${sg(b)}0$`, `$y$ 절편이 ${c > 0 ? '양수' : '음수'}이므로 $c${sg(c)}0$`],
          };
        },
      },
    ],
  },
};

function paren(n: number): string {
  return n < 0 ? `(${n})` : `${n}`;
}
