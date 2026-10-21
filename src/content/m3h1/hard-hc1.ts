// 공통수학1 심화 유형(skills 뒤에 이어 붙임)과 최상위 유형(top)
import type { Skill } from '../../core/types';
import type { Rng } from '../../core/rng';
import { F } from '../../core/frac';
import { nCr, nPr, factorize, factorial } from '../../core/nt';
import { poly, termsTex, comma } from '../../core/tex';
import { mc, tc, pmul, pdiv, fac, geo } from './util';
import { jo, mm, mtex, sq } from './hard-util';

type P2 = [number, number];
const fr = (n: number, d = 1) => new F(n, d);
const P = (c: number[], v = 'x') => poly(c, v);
const sgn = (n: number) => (n === 0 ? '' : n > 0 ? `+${n}` : `${n}`);
const cx = (a: number, b: number) =>
  termsTex([
    { c: a, v: '' },
    { c: b, v: 'i' },
  ]);
const C = (n: number, k: number) => (k < 0 || k > n ? 0 : nCr(n, k));
/** 괄호 앞 계수: 1 → '' / '+', -1 → '-' */
const k1 = (n: number, plus = false) => (n === 1 ? (plus ? '+' : '') : n === -1 ? '-' : plus ? sgn(n) : String(n));
/** '으로/로' */
const ro = (t: string) => jo(t, '으로', '로', true);
const ftex = (fs: [number, number][]) => fs.map(([p, e]) => (e === 1 ? `${p}` : `${p}^{${e}}`)).join('\\times');

export const HC1_HARD: Record<string, Skill[]> = {
  // ───────── 다항식의 연산 ─────────
  'hc1-1': [
    {
      id: 'three-var-sym',
      title: '세 문자의 대칭식의 값',
      gen(r, level) {
        const a = r.int(-4, 5),
          b = r.int(-4, 5),
          c = r.int(-4, 5);
        const s = a + b + c,
          q = a * b + b * c + c * a,
          u = a * b * c,
          t = a * a + b * b + c * c;
        if (level === 1) {
          return {
            q: `$a+b+c=${s}$, $ab+bc+ca=${q}$ 일 때, $a^2+b^2+c^2$ 의 값을 구하세요.`,
            answer: { type: 'num', value: t },
            steps: ['$(a+b+c)^2=a^2+b^2+c^2+2(ab+bc+ca)$', `$a^2+b^2+c^2=${s < 0 ? `(${s})` : s}^2-2\\times(${q})=${t}$`],
          };
        }
        if (level === 2) {
          return {
            q: `$a+b+c=${s}$, $ab+bc+ca=${q}$, $abc=${u}$ 일 때, $(a+b)(b+c)(c+a)$ 의 값을 구하세요.`,
            answer: { type: 'num', value: s * q - u },
            steps: [
              '$(a+b)(b+c)(c+a)=(a+b+c)(ab+bc+ca)-abc$',
              `(확인: $a+b=${s}-c$ 등으로 놓고 전개해도 같다)`,
              `$=${s}\\times(${q})-(${u})=${s * q - u}$`,
            ],
          };
        }
        const v = s * (t - q) + 3 * u;
        return {
          q: `$a+b+c=${s}$, $a^2+b^2+c^2=${t}$, $abc=${u}$ 일 때, $a^3+b^3+c^3$ 의 값을 구하세요.`,
          answer: { type: 'num', value: v },
          steps: [
            `$(a+b+c)^2=a^2+b^2+c^2+2(ab+bc+ca)$ 에서 $ab+bc+ca=\\frac{${s * s}-${t}}{2}=${q}$`,
            '$a^3+b^3+c^3-3abc=(a+b+c)(a^2+b^2+c^2-ab-bc-ca)$',
            `$a^3+b^3+c^3=${s < 0 ? `(${s})` : s}\\times(${t}${sgn(-q)})+3\\times(${u})=${v}$`,
          ],
        };
      },
    },
  ],

  // ───────── 항등식과 나머지정리 ─────────
  'hc1-2': [
    {
      id: 'remainder-tricks',
      title: '나머지정리의 응용',
      gen(r, level) {
        if (level === 1) {
          const a = r.nonzero(-4, 4),
            R = r.nonzero(-9, 9);
          if (r.chance(0.5)) {
            const m = r.pick([2, 3]),
              c = r.int(-2, 2);
            const n = a - m * c;
            return {
              q: `다항식 $P(x)$ 를 $${P([1, -a])}$ ${ro(P([1, -a]))} 나눈 나머지가 $${R}$ 일 때, $P(${termsTex([{ c: m, v: 'x' }, { c: n, v: '' }])})$ ${jo(termsTex([{ c: m, v: 'x' }, { c: n, v: '' }]), '을', '를')} $${P([1, -c])}$ ${ro(P([1, -c]))} 나눈 나머지를 구하세요.`,
              answer: { type: 'num', value: R },
              steps: [`나머지정리: $P(${termsTex([{ c: m, v: 'x' }, { c: n, v: '' }])})$ ${jo(termsTex([{ c: m, v: 'x' }, { c: n, v: '' }]), '을', '를')} $${P([1, -c])}$ ${ro(P([1, -c]))} 나눈 나머지는 $x=${c}$ ${jo(String(c), '을', '를')} 대입한 값`, `$P(${m}\\times(${c})${sgn(n)})=P(${a})$`, `$P(x)$ 를 $${P([1, -a])}$ ${ro(P([1, -a]))} 나눈 나머지가 $${R}$ 이므로 $P(${a})=${R}$`],
            };
          }
          const k = r.int(1, 5);
          return {
            q: `다항식 $P(x)$ 를 $${P([1, -a])}$ ${ro(P([1, -a]))} 나눈 나머지가 $${R}$ 일 때, $(x^2+${k})P(x)$ 를 $${P([1, -a])}$ ${ro(P([1, -a]))} 나눈 나머지를 구하세요.`,
            answer: { type: 'num', value: (a * a + k) * R },
            steps: [`$P(${a})=${R}$`, `구하는 나머지는 $x=${a}$ ${jo(String(a), '을', '를')} 대입한 값: $(${a * a}+${k})\\times P(${a})$`, `$=${a * a + k}\\times(${R})=${(a * a + k) * R}$`],
          };
        }
        if (level === 2) {
          const a = r.int(-3, 1),
            b = a + r.int(1, 4);
          const p = r.nonzero(-5, 5),
            q = r.int(-6, 6);
          const askB = r.chance(0.5);
          const t = askB ? b : a;
          const val = t * (p * t + q);
          return {
            q: `다항식 $P(x)$ 를 $${fac(1, -a)}${fac(1, -b)}$ ${ro(P([1, -b]))} 나눈 나머지가 $${termsTex([{ c: p, v: 'x' }, { c: q, v: '' }])}$ 일 때, $xP(x)$ 를 $${P([1, -t])}$ ${ro(P([1, -t]))} 나눈 나머지를 구하세요.`,
            answer: { type: 'num', value: val },
            steps: [`$P(x)=${fac(1, -a)}${fac(1, -b)}Q(x)+${termsTex([{ c: p, v: 'x' }, { c: q, v: '' }])}$`, `$x=${t}$ ${jo(String(t), '을', '를')} 넣으면 $P(${t})=${p}\\times(${t})${sgn(q)}=${p * t + q}$`, `$xP(x)$ 를 $${P([1, -t])}$ ${ro(P([1, -t]))} 나눈 나머지는 $${t}\\times P(${t})=${val}$`],
          };
        }
        const [a, b] = r.pick<[number, number]>([
          [1, 2],
          [-1, 1],
          [1, -2],
          [0, 2],
          [-1, 2],
          [0, -1],
        ]);
        const n = r.int(5, 9);
        const Rr = (b ** n - a ** n) / (b - a),
          S = (b * a ** n - a * b ** n) / (b - a);
        return {
          q: `$x^{${n}}$ 을 $${P(pmul([1, -a], [1, -b]))}$ ${ro(P(pmul([1, -a], [1, -b])))} 나눈 나머지를 $px+q$ 라 할 때, 상수 $p$, $q$ 의 값을 구하세요.`,
          answer: { type: 'fields', fields: [{ label: 'p', value: Rr }, { label: 'q', value: S }] },
          steps: [
            `$${P(pmul([1, -a], [1, -b]))}=${fac(1, -a)}${fac(1, -b)}$ 이므로 $x^{${n}}=${fac(1, -a)}${fac(1, -b)}Q(x)+px+q$`,
            `$x=${a}$ 대입: $${a ** n}=${termsTex([{ c: a, v: 'p' }, { c: 1, v: 'q' }])}$`,
            `$x=${b}$ 대입: $${b ** n}=${termsTex([{ c: b, v: 'p' }, { c: 1, v: 'q' }])}$`,
            `연립하면 $p=${Rr}$, $q=${S}$`,
          ],
        };
      },
    },
  ],

  // ───────── 인수분해 ─────────
  'hc1-3': [
    {
      id: 'factor-triangle',
      title: '인수분해로 삼각형의 모양 알아보기',
      gen(r, level) {
        type T = { e: string; f: string[]; ans: string };
        const iso = (p: string, q: string) => `$${p}=${q}$ 인 이등변삼각형`;
        const right = (z: string) => `빗변의 길이가 $${z}$ 인 직각삼각형`;
        const L1: T[] = [
          { e: 'X^2-Y^2+XZ-YZ=0', f: ['$(X+Y)(X-Y)+Z(X-Y)=0$', '$(X-Y)(X+Y+Z)=0$', '$X+Y+Z>0$ 이므로 $X-Y=0$'], ans: iso('X', 'Y') },
          { e: 'X^3+X^2Z-XY^2-Y^2Z=0', f: ['$X^2(X+Z)-Y^2(X+Z)=0$', '$(X+Z)(X+Y)(X-Y)=0$', '$X+Z>0$, $X+Y>0$ 이므로 $X-Y=0$'], ans: iso('X', 'Y') },
        ];
        const L2: T[] = [
          { e: 'X^3+X^2Y+XY^2+Y^3-XZ^2-YZ^2=0', f: ['$X^2(X+Y)+Y^2(X+Y)-Z^2(X+Y)=0$', '$(X+Y)(X^2+Y^2-Z^2)=0$', '$X+Y>0$ 이므로 $X^2+Y^2=Z^2$'], ans: right('Z') },
          { e: 'X^3-X^2Y-XZ^2+YZ^2=0', f: ['$X^2(X-Y)-Z^2(X-Y)=0$', '$(X-Y)(X+Z)(X-Z)=0$', '$X+Z>0$ 이므로 $X=Y$ 또는 $X=Z$'], ans: '$X=Y$ 또는 $X=Z$ 인 이등변삼각형' },
        ];
        const L3: T[] = [
          { e: 'X^4-Y^4-X^2Z^2+Y^2Z^2=0', f: ['$(X^2-Y^2)(X^2+Y^2)-Z^2(X^2-Y^2)=0$', '$(X+Y)(X-Y)(X^2+Y^2-Z^2)=0$', '$X+Y>0$ 이므로 $X=Y$ 또는 $X^2+Y^2=Z^2$'], ans: `${iso('X', 'Y')} 또는 ${right('Z')}` },
          { e: 'X^3+Y^3+Z^3=3XYZ', f: ['$X^3+Y^3+Z^3-3XYZ=(X+Y+Z)(X^2+Y^2+Z^2-XY-YZ-ZX)=0$', '$X+Y+Z>0$ 이므로 $\\frac{1}{2}\\{(X-Y)^2+(Y-Z)^2+(Z-X)^2\\}=0$', '$X-Y=0$, $Y-Z=0$, $Z-X=0$ 에서 $X=Y=Z$'], ans: '정삼각형' },
          { e: 'X^2(Y-Z)+Y^2(Z-X)+Z^2(X-Y)=0', f: ['$X$ 에 대하여 정리: $(Y-Z)X^2-(Y^2-Z^2)X+YZ(Y-Z)=0$', '$(Y-Z)\\{X^2-(Y+Z)X+YZ\\}=(Y-Z)(X-Y)(X-Z)=0$', '$X=Y$ 또는 $Y=Z$ 또는 $Z=X$'], ans: '세 변 중 어느 두 변의 길이가 같은 이등변삼각형' },
        ];
        const t = r.pick(level === 1 ? L1 : level === 2 ? L2 : L3);
        const [X, Y, Z] = r.shuffle(['a', 'b', 'c']);
        const sub = (s: string) => s.replace(/[XYZ]/g, (m) => (m === 'X' ? X : m === 'Y' ? Y : Z));
        const pool = [iso('X', 'Y'), iso('Y', 'Z'), iso('X', 'Z'), right('X'), right('Y'), right('Z'), '정삼각형', `${iso('X', 'Y')} 또는 ${right('Z')}`, '$X=Y$ 이고 빗변의 길이가 $Z$ 인 직각이등변삼각형', '$X=Y$ 또는 $X=Z$ 인 이등변삼각형', '세 변 중 어느 두 변의 길이가 같은 이등변삼각형'];
        return {
          q: `세 변의 길이가 $a$, $b$, $c$ 인 삼각형이 $${sub(t.e)}$ ${jo(sub(t.e), '을', '를')} 만족할 때, 이 삼각형은 어떤 삼각형인가?`,
          answer: tc(r, sub(t.ans), pool.filter((x) => x !== t.ans).map(sub)),
          steps: [...t.f.map(sub), `따라서 ${sub(t.ans)}`],
        };
      },
    },
  ],

  // ───────── 복소수와 이차방정식 ─────────
  'hc1-4': [
    {
      id: 'vieta-cond',
      title: '근의 조건으로 상수 구하기 (근과 계수의 관계)',
      gen(r, level) {
        if (level === 1) {
          const m = r.pick([2, 3]),
            al = r.int(1, 4);
          const c = m * al * al;
          return {
            q: `이차방정식 $x^2+kx+${c}=0$ 의 한 근이 다른 근의 $${m}$ 배일 때, 실수 $k$ 의 값을 모두 구하세요.`,
            answer: { type: 'set', values: [(m + 1) * al, -(m + 1) * al] },
            steps: [`두 근을 $\\beta$, $${m}\\beta$ 라 하면 두 근의 곱: $${m}\\beta^2=${c}$, $\\beta=\\pm${al}$`, `두 근의 합: $${m + 1}\\beta=-k$`, `$\\beta=${al}$ 이면 $k=${-(m + 1) * al}$, $\\beta=-${al}$ 이면 $k=${(m + 1) * al}$`],
          };
        }
        if (level === 2) {
          let r1 = 0,
            r2 = 0;
          do {
            r1 = r.int(-6, 9);
            r2 = r.int(-6, 9);
          } while (r1 <= r2 || r1 + r2 <= 0 || r1 * r2 === 0);
          const d = r1 - r2,
            c = r1 * r2,
            k = r1 + r2;
          return {
            q: `이차방정식 $x^2-kx${sgn(c)}=0$ 의 두 근의 차가 $${d}$ 일 때, 양수 $k$ 의 값을 구하세요.`,
            answer: { type: 'num', value: k },
            steps: [`두 근을 $\\alpha$, $\\beta$ 라 하면 $\\alpha+\\beta=k$, $\\alpha\\beta=${c}$`, `$(\\alpha-\\beta)^2=(\\alpha+\\beta)^2-4\\alpha\\beta=k^2${sgn(-4 * c)}=${d * d}$`, `$k^2=${k * k}$, $k>0$ 이므로 $k=${k}$`],
          };
        }
        for (;;) {
          const cc = r.int(-3, 3),
            dd = r.int(-8, 8);
          const k1 = r.int(-6, 8);
          const k2 = 2 * cc - k1;
          if (k1 === k2) continue;
          const T = k1 * k1 - 2 * cc * k1 - 2 * dd;
          if (T <= 0) continue;
          const D = (k: number) => k * k - 4 * (cc * k + dd);
          const ok = [k1, k2].filter((k) => D(k) >= 0);
          if (ok.length !== 1) continue;
          if (cc * k1 + dd === 0 || cc * k2 + dd === 0) continue;
          const good = ok[0],
            bad = good === k1 ? k2 : k1;
          const Ptex = termsTex([
            { c: cc, v: 'k' },
            { c: dd, v: '' },
          ]);
          return {
            q: `$x$ 에 대한 이차방정식 $x^2-kx+${cc === 0 ? Ptex : `(${Ptex})`}=0$ 이 두 실근 $\\alpha$, $\\beta$ 를 갖고 $\\alpha^2+\\beta^2=${T}$ 일 때, 실수 $k$ 의 값을 구하세요.`,
            answer: { type: 'num', value: good },
            steps: [
              `$\\alpha+\\beta=k$, $\\alpha\\beta=${Ptex}$`,
              `$\\alpha^2+\\beta^2=(\\alpha+\\beta)^2-2\\alpha\\beta=${poly([1, -2 * cc, -2 * dd], 'k')}=${T}$`,
              `$${poly([1, -2 * cc, -2 * dd - T], 'k')}=0$, $${fac(1, -k1, 'k')}${fac(1, -k2, 'k')}=0$ 에서 $k=${Math.min(k1, k2)}$ 또는 $k=${Math.max(k1, k2)}$`,
              `실근 조건: 판별식 $D=k^2-4(${Ptex})\\ge0$`,
              `$k=${bad}$ 이면 $D=${D(bad)}<0$ (부적합), $k=${good}$ 이면 $D=${D(good)}\\ge0$`,
              `따라서 $k=${good}$`,
            ],
          };
        }
      },
    },
  ],

  // ───────── 이차방정식과 이차함수 ─────────
  'hc1-5': [
    {
      id: 'range-minmax-param',
      title: '범위가 주어진 최대·최소로 상수 구하기',
      gen(r, level) {
        if (level === 1) {
          const p = r.nonzero(-2, 3);
          let s = 0,
            t = 0;
          do {
            s = p - r.int(1, 3);
            t = p + r.int(1, 3);
          } while (t - p === p - s);
          const far = t - p > p - s ? t : s;
          const M = r.int(-5, 12);
          const k = M - (far - p) ** 2 + p * p;
          const mn = k - p * p;
          return {
            q: `$${s}\\le x\\le ${t}$ 에서 이차함수 $y=${P([1, -2 * p, 0])}+k$ 의 최댓값이 $${M}$ 일 때, 최솟값을 구하세요.`,
            answer: { type: 'num', value: mn },
            steps: [`$y=${fac(1, -p)}^2+k-${p * p}$, 꼭짓점의 $x$ 좌표 $${p}$ ${jo(String(p), '은', '는')} 범위 안`, `축에서 더 먼 $x=${far}$ 에서 최댓값: $${(far - p) ** 2}+k-${p * p}=${M}$, $k=${k}$`, `최솟값은 꼭짓점에서 $k-${p * p}=${mn}$`],
          };
        }
        if (level === 2) {
          const p = r.int(-3, 2);
          const s = p + r.int(1, 2),
            t = s + r.int(1, 3);
          const M = r.int(-4, 10);
          // y = -(x-p)^2 + p^2 + k, 범위에서 감소
          const k = M + (s - p) ** 2 - p * p;
          const mn = -((t - p) ** 2) + p * p + k;
          return {
            q: `$${s}\\le x\\le ${t}$ 에서 이차함수 $y=-x^2${sgn(2 * p)}${p === 0 ? '' : 'x'}+k$ 의 최댓값이 $${M}$ 일 때, 최솟값을 구하세요.`,
            answer: { type: 'num', value: mn },
            steps: [
              `$y=-${p === 0 ? 'x^2' : `${fac(1, -p)}^2`}+k${sgn(p * p)}$, 꼭짓점의 $x$ 좌표 $${p}$ ${jo(String(p), '은', '는')} 범위의 왼쪽 밖`,
              `범위에서 $x$ 가 커질수록 $y$ 가 작아지므로 $x=${s}$ 에서 최대, $x=${t}$ 에서 최소`,
              `$-${(s - p) ** 2}${p === 0 ? '' : `+${p * p}`}+k=${M}$ 에서 $k=${k}$`,
              `최솟값 $=-${(t - p) ** 2}${p === 0 ? '' : `+${p * p}`}+${k < 0 ? `(${k})` : k}=${mn}$`,
            ],
          };
        }
        for (;;) {
          const L = r.int(2, 4);
          const a0 = r.int(1, 7);
          const b = r.int(-3, 12);
          const m = a0 <= L ? b - a0 * a0 : L * L - 2 * a0 * L + b;
          if (m === b) continue;
          const sols: number[] = [];
          const notes: string[] = [];
          const d = b - m;
          if (d > 0 && Math.sqrt(d) < L) {
            sols.push(Math.sqrt(d));
            notes.push(`(ii) $0<a<${L}$: 최솟값 $${b}-a^2=${m}$, $a^2=${d}$, $a=${Number.isInteger(Math.sqrt(d)) ? Math.sqrt(d) : `\\sqrt{${d}}`}$ (범위에 맞음)`);
          } else notes.push(`(ii) $0<a<${L}$: 최솟값 $${b}-a^2=${m}$ 에서 $a^2=${d}$ 인데, 이를 만족하는 $a$ 가 범위에 없음`);
          const a3 = fr(L * L + b - m, 2 * L);
          if (a3.value >= L) {
            sols.push(a3.value);
            notes.push(`(iii) $a\\ge${L}$: 최솟값 $f(${L})=${L * L}-${2 * L}a+${b < 0 ? `(${b})` : b}=${m}$, $a=${a3.tex()}$ (범위에 맞음)`);
          } else notes.push(`(iii) $a\\ge${L}$: 최솟값 $f(${L})=${L * L}-${2 * L}a+${b < 0 ? `(${b})` : b}=${m}$ 에서 $a=${a3.tex()}<${L}$ (부적합)`);
          if (sols.length !== 1 || Math.abs(sols[0] - a0) > 1e-9) continue;
          return {
            q: `$0\\le x\\le ${L}$ 에서 이차함수 $f(x)=x^2-2ax${sgn(b)}$ 의 최솟값이 $${m}$ 일 때, 상수 $a$ 의 값을 구하세요.`,
            answer: { type: 'num', value: a0 },
            steps: [`$f(x)=(x-a)^2${sgn(b)}-a^2$, 축은 $x=a$`, `(i) $a\\le0$: 최솟값 $f(0)=${b}\\ne${m}$ (부적합)`, ...notes, `따라서 $a=${a0}$`],
          };
        }
      },
    },
  ],

  // ───────── 여러 가지 방정식과 부등식 ─────────
  'hc1-6': [
    {
      id: 'ineq-always',
      title: '이차부등식이 항상 성립할 조건',
      gen(r, level) {
        if (level === 1) {
          const c = r.int(2, 30);
          let K = 0;
          while ((K + 1) ** 2 < 4 * c) K++;
          return {
            q: `모든 실수 $x$ 에 대하여 이차부등식 $x^2+kx+${c}>0$ 이 성립하도록 하는 정수 $k$ 의 개수를 구하세요.`,
            answer: { type: 'num', value: 2 * K + 1, unit: '개' },
            steps: [`$x^2$ 의 계수가 양수이므로 판별식 $D<0$ 이면 항상 성립`, `$D=k^2-${4 * c}<0$, $k^2<${4 * c}$`, `정수 $k$ 는 $-${K}\\le k\\le ${K}$, 모두 $${2 * K + 1}$ 개`],
          };
        }
        if (level === 2) {
          const m = r.pick([1, 2]);
          const c = r.int(2, 20);
          const bound = fr(c, m * m);
          const cnt = Math.ceil(bound.value);
          return {
            q: `모든 실수 $x$ 에 대하여 부등식 $kx^2${m === 1 ? '-2' : '-4'}kx+${c}>0$ 이 성립하도록 하는 정수 $k$ 의 개수를 구하세요.`,
            answer: { type: 'num', value: cnt, unit: '개' },
            steps: [
              `(i) $k=0$ 이면 $${c}>0$ 이므로 항상 성립`,
              '(ii) $k<0$ 이면 그래프가 위로 볼록하여 항상 성립할 수 없다.',
              `(iii) $k>0$ 이면 $\\frac{D}{4}=${m === 1 ? 'k^2' : '4k^2'}-${c}k<0$, $k(${m === 1 ? 'k' : '4k'}-${c})<0$, $0<k<${bound.tex()}$`,
              `$0\\le k<${bound.tex()}$ 인 정수 $k$ 는 $${cnt}$ 개`,
            ],
          };
        }
        for (;;) {
          const k1 = r.int(-5, 3),
            k2 = k1 + r.int(1, 8);
          if ((k1 + k2) % 2 === 0) continue;
          const p = (k1 + k2 - 1) / 2;
          const q = p * p - k1 * k2;
          return {
            q: `모든 실수 $x$ 에 대하여 이차부등식 $x^2-2(k${sgn(-p)})x+k${sgn(q)}\\ge0$ 이 성립하도록 하는 정수 $k$ 의 개수를 구하세요.`,
            answer: { type: 'num', value: k2 - k1 + 1, unit: '개' },
            steps: [`$x^2$ 의 계수가 양수이므로 $\\frac{D}{4}\\le0$ 이면 항상 성립`, `$\\frac{D}{4}=(k${sgn(-p)})^2-(k${sgn(q)})=${poly([1, -(2 * p + 1), p * p - q], 'k')}\\le0$`, `$${fac(1, -k1, 'k')}${fac(1, -k2, 'k')}\\le0$, $${k1}\\le k\\le ${k2}$`, `정수 $k$ 는 $${k2 - k1 + 1}$ 개`],
          };
        }
      },
    },
  ],

  // ───────── 경우의 수 ─────────
  'hc1-7': [
    {
      id: 'comb-complement',
      title: '여사건을 이용한 경우의 수',
      gen(r, level) {
        if (level === 1) {
          const k = r.int(2, 4);
          const a = r.int(k, 7),
            b = r.int(2, 6);
          const v = C(a + b, k) - C(a, k);
          return {
            q: `남학생 $${a}$ 명, 여학생 $${b}$ 명 중에서 대표 $${k}$ 명을 뽑을 때, 여학생이 적어도 $1$ 명 포함되는 경우의 수를 구하세요.`,
            answer: { type: 'num', value: v, unit: '가지' },
            steps: [`전체: $${'{}'}_{${a + b}}\\mathrm{C}_{${k}}=${C(a + b, k)}$`, `여학생이 한 명도 없는 경우(남학생만): $${'{}'}_{${a}}\\mathrm{C}_{${k}}=${C(a, k)}$`, `$${C(a + b, k)}-${C(a, k)}=${v}$`],
          };
        }
        if (level === 2) {
          const k = r.int(3, 4);
          const a = r.int(2, 7),
            b = r.int(2, 7);
          const v = C(a + b, k) - C(a, k) - C(b, k);
          return {
            q: `남학생 $${a}$ 명, 여학생 $${b}$ 명 중에서 $${k}$ 명을 뽑을 때, 남학생과 여학생이 각각 적어도 $1$ 명씩 포함되는 경우의 수를 구하세요.`,
            answer: { type: 'num', value: v, unit: '가지' },
            steps: [`전체: $${'{}'}_{${a + b}}\\mathrm{C}_{${k}}=${C(a + b, k)}$`, `남학생만 뽑는 경우 $${C(a, k)}$, 여학생만 뽑는 경우 $${C(b, k)}$`, `$${C(a + b, k)}-${C(a, k)}-${C(b, k)}=${v}$`],
          };
        }
        const k = r.int(3, 4);
        const a = r.int(2, 5),
          b = r.int(1, 4);
        const n = a + b;
        const all = nPr(n, k),
          bad = nPr(a, 2) * nPr(n - 2, k - 2);
        return {
          q: `남학생 $${a}$ 명, 여학생 $${b}$ 명 중에서 $${k}$ 명을 뽑아 한 줄로 세울 때, 양 끝 중 적어도 한쪽에 여학생이 서는 경우의 수를 구하세요.`,
          answer: { type: 'num', value: all - bad, unit: '가지' },
          steps: [
            `전체: $${n}$ 명 중 $${k}$ 명을 뽑아 일렬로 세우는 경우 $${'{}'}_{${n}}\\mathrm{P}_{${k}}=${all}$`,
            `여사건: 양 끝 모두 남학생 — 양 끝에 남학생 $2$ 명을 세우는 $${'{}'}_{${a}}\\mathrm{P}_{2}=${nPr(a, 2)}$ 가지`,
            `가운데 $${k - 2}$ 자리에 나머지 $${n - 2}$ 명 중에서 세우는 $${'{}'}_{${n - 2}}\\mathrm{P}_{${k - 2}}=${nPr(n - 2, k - 2)}$ 가지`,
            `$${all}-${nPr(a, 2)}\\times${nPr(n - 2, k - 2)}=${all - bad}$`,
          ],
        };
      },
    },
  ],

  // ───────── 행렬 ─────────
  'hc1-8': [
    {
      id: 'matrix-pattern',
      title: '행렬의 거듭제곱 규칙 찾기',
      gen(r, level) {
        if (level === 1) {
          const s = r.pick([1, -1]);
          const n = r.int(3, 6);
          const A = [
            [s, s],
            [s, s],
          ];
          const total = 4 * s * (2 * s) ** (n - 1);
          return {
            q: `행렬 $A=${mtex(A)}$ 에 대하여 $A^{${n}}$ 의 모든 성분의 합을 구하세요.`,
            answer: { type: 'num', value: total },
            steps: [`$A^2=${mtex(mm(A, A))}=${2 * s}A$`, `$A^3=${2 * s}A^2=(${2 * s})^2A$, … 이므로 $A^{${n}}=(${2 * s})^{${n - 1}}A$`, `$A$ 의 성분의 합은 $${4 * s}$ 이므로 $(${2 * s})^{${n - 1}}\\times(${4 * s})=${total}$`],
          };
        }
        if (level === 2) {
          const k = r.nonzero(-2, 3),
            n = r.int(5, 10);
          return {
            q: `행렬 $A=${mtex([
              [1, k],
              [0, 1],
            ])}$ 에 대하여 $A+A^2+A^3+\\cdots+A^{${n}}$ 의 $(1,2)$ 성분을 구하세요.`,
            answer: { type: 'num', value: (k * n * (n + 1)) / 2 },
            steps: [`$A^2=${mtex([
              [1, 2 * k],
              [0, 1],
            ])}$, $A^3=${mtex([
              [1, 3 * k],
              [0, 1],
            ])}$, … 이므로 $A^m$ 의 $(1,2)$ 성분은 $${k === 1 ? '' : k === -1 ? '-' : k}m$`, `구하는 값은 $${k === 1 ? '' : k === -1 ? '-' : k}(1+2+\\cdots+${n})=${k === 1 ? '' : k === -1 ? '-' : `${k}\\times`}${(n * (n + 1)) / 2}=${(k * n * (n + 1)) / 2}$`],
          };
        }
        const a = r.nonzero(-3, 3),
          n = r.int(4, 7);
        const low = r.chance(0.5);
        const A = low
          ? [
              [1, 0],
              [a, 2],
            ]
          : [
              [2, a],
              [0, 1],
            ];
        let M = A;
        for (let i = 1; i < n; i++) M = mm(M, A);
        const A2 = mm(A, A),
          A3 = mm(A2, A);
        const pos = low ? '(2,1)' : '(1,2)';
        const val = low ? M[1][0] : M[0][1];
        return {
          q: `행렬 $A=${mtex(A)}$ 에 대하여 $A^{${n}}$ 의 $${pos}$ 성분을 구하세요.`,
          answer: { type: 'num', value: val },
          steps: [`$A^2=${mtex(A2)}$, $A^3=${mtex(A3)}$`, `$${pos}$ 성분이 $${a}\\times1$, $${a}\\times3$, $${a}\\times7$, … 로 $${a}(2^m-1)$ 꼴`, `$A^{${n}}$ 의 $${pos}$ 성분은 $${a}\\times(2^{${n}}-1)=${val}$`],
        };
      },
    },
  ],
};

// ═════════════════════════ 최상위 유형 ═════════════════════════

function divisionChain(r: Rng) {
  if (r.chance(0.5)) {
    const a = r.nonzero(-3, 3);
    let b = r.nonzero(-3, 3);
    if (b === a) b = -a;
    const r1 = r.int(-6, 6),
      r2 = r.nonzero(-5, 5);
    return {
      q: `다항식 $P(x)$ 를 $${P([1, -a])}$ ${ro(P([1, -a]))} 나눈 몫이 $Q(x)$, 나머지가 $${r1}$ 이고, $Q(x)$ 를 $${P([1, -b])}$ ${ro(P([1, -b]))} 나눈 나머지가 $${r2}$ 이다. $P(x)$ 를 $${fac(1, -a)}${fac(1, -b)}$ ${ro(P([1, -b]))} 나눈 나머지를 $px+q$ 라 할 때, $p$, $q$ 의 값을 구하세요.`,
      answer: { type: 'fields' as const, fields: [{ label: 'p', value: r2 }, { label: 'q', value: r1 - a * r2 }] },
      steps: [
        `$P(x)=(${P([1, -a])})Q(x)${sgn(r1)}$`,
        `$Q(x)$ 를 $${P([1, -b])}$ ${ro(P([1, -b]))} 나눈 몫을 $Q'(x)$ 라 하면 $Q(x)=(${P([1, -b])})Q'(x)${sgn(r2)}$`,
        `대입: $P(x)=${fac(1, -a)}${fac(1, -b)}Q'(x)${k1(r2, true)}(${P([1, -a])})${sgn(r1)}$`,
        `$${k1(r2)}(${P([1, -a])})${sgn(r1)}$ ${jo(`${P([1, -a])}${sgn(r1)}`, '은', '는')} 일차 이하이므로 이것이 나머지`,
        `나머지 $=${termsTex([{ c: r2, v: 'x' }, { c: r1 - a * r2, v: '' }])}$, 곧 $p=${r2}$, $q=${r1 - a * r2}$`,
      ],
    };
  }
  const c = r.int(1, 4),
    b = r.nonzero(-3, 3);
  const p = r.nonzero(-4, 4),
    q = r.int(-5, 5),
    rr = r.nonzero(-4, 4);
  const rem = [rr, p, rr * c + q];
  return {
    q: `다항식 $P(x)$ 를 $x^2+${c}$ ${ro(String(c))} 나눈 몫이 $Q(x)$, 나머지가 $${termsTex([{ c: p, v: 'x' }, { c: q, v: '' }])}$ 이고, $Q(x)$ 를 $${P([1, -b])}$ ${ro(P([1, -b]))} 나눈 나머지가 $${rr}$ 이다. $P(x)$ 를 $(x^2+${c})(${P([1, -b])})$ ${ro(P([1, -b]))} 나눈 나머지를 $ux^2+vx+w$ 라 할 때, $u$, $v$, $w$ 의 값을 구하세요.`,
    answer: { type: 'fields' as const, fields: [{ label: 'u', value: rem[0] }, { label: 'v', value: rem[1] }, { label: 'w', value: rem[2] }] },
    steps: [
      `$P(x)=(x^2+${c})Q(x)+${termsTex([{ c: p, v: 'x' }, { c: q, v: '' }])}$`,
      `$Q(x)=(${P([1, -b])})Q'(x)${sgn(rr)}$`,
      `대입: $P(x)=(x^2+${c})(${P([1, -b])})Q'(x)${k1(rr, true)}(x^2+${c})+${termsTex([{ c: p, v: 'x' }, { c: q, v: '' }])}$`,
      '뒤의 식은 이차 이하이므로 나머지가 된다.',
      `나머지 $=${P(rem)}$, 곧 $u=${rem[0]}$, $v=${rem[1]}$, $w=${rem[2]}$`,
    ],
  };
}

function surdReduce(r: Rng) {
  for (;;) {
    const a = r.int(1, 3),
      b = r.pick([2, 3, 5, 6, 7]);
    const D = [1, -2 * a, a * a - b];
    const Pc = [r.pick([1, 2]), r.int(-6, 6), r.int(-6, 6), r.int(-8, 8)];
    const { q, r: rem } = pdiv(Pc, D);
    const R = rem.length === 2 ? rem : [0, rem[0] ?? 0];
    if (R[0] === 0) continue;
    const [p, q0] = R;
    const rt = `\\sqrt{${b}}`;
    const ans = termsTex([
      { c: p * a + q0, v: '' },
      { c: p, v: rt },
    ]);
    const w = (x: number, y: number) =>
      termsTex([
        { c: x, v: '' },
        { c: y, v: rt },
      ]);
    return {
      q: `$x=${a}+\\sqrt{${b}}$ 일 때, $${P(Pc)}$ 의 값은?`,
      answer: mc(r, ans, [w(p * a + q0, -p), w(q0, p), w(p * a + q0 + p, p), w(-p * a + q0, p), w(p * a - q0, p)]),
      steps: [
        `$x-${a}=\\sqrt{${b}}$ 의 양변을 제곱: $${P([1, -2 * a, a * a])}=${b}$, 곧 $${P(D)}=0$`,
        `$${P(Pc)}$ ${jo(P(Pc), '을', '를')} $${P(D)}$ ${ro(P(D))} 나누면 몫 $${P(q)}$, 나머지 $${P(R)}$`,
        `$${P(Pc)}=(${P(D)})(${P(q)})+${P(R)}$`,
        `$${P(D)}=0$ 이므로 주어진 식의 값은 $${P(R)}$ 에 $x=${a}+\\sqrt{${b}}$ ${jo(String(b), '을', '를')} 넣은 값`,
        `$${p === 1 ? '' : p === -1 ? '-' : p}(${a}+\\sqrt{${b}})${sgn(q0)}=${ans}$`,
      ],
    };
  }
}

function remainderCubic(r: Rng) {
  for (;;) {
    const a = r.int(-3, 2),
      b = a + r.int(1, 3);
    const c = r.int(-3, 4);
    if (c === a || c === b) continue;
    const p = r.int(-4, 4),
      q = r.int(-5, 5),
      al = r.nonzero(-2, 2);
    const k = al * (c - a) * (c - b) + p * c + q;
    const R = [al, p - al * (a + b), q + al * a * b];
    return {
      q: `다항식 $P(x)$ 를 $${fac(1, -a)}${fac(1, -b)}$ ${ro(P([1, -b]))} 나눈 나머지는 $${termsTex([{ c: p, v: 'x' }, { c: q, v: '' }])}$, $${P([1, -c])}$ ${ro(P([1, -c]))} 나눈 나머지는 $${k}$ 이다. $P(x)$ 를 $${fac(1, -a)}${fac(1, -b)}${fac(1, -c)}$ ${ro(P([1, -c]))} 나눈 나머지를 $R(x)=ux^2+vx+w$ 라 할 때, $u$, $v$, $w$ 의 값을 구하세요.`,
      answer: { type: 'fields' as const, fields: [{ label: 'u', value: R[0] }, { label: 'v', value: R[1] }, { label: 'w', value: R[2] }] },
      steps: [
        `$P(x)=${fac(1, -a)}${fac(1, -b)}${fac(1, -c)}Q(x)+R(x)$ ($R(x)$ 는 이차 이하)`,
        `$P(x)$ 를 $${fac(1, -a)}${fac(1, -b)}$ ${ro(P([1, -b]))} 나눈 나머지는 $R(x)$ 를 $${fac(1, -a)}${fac(1, -b)}$ ${ro(P([1, -b]))} 나눈 나머지와 같다.`,
        `따라서 $R(x)=k${fac(1, -a)}${fac(1, -b)}+${termsTex([{ c: p, v: 'x' }, { c: q, v: '' }])}$ 로 놓을 수 있다.`,
        `$P(${c})=R(${c})=${k}$ 에서 $k\\times(${c - a})\\times(${c - b})${sgn(p * c + q)}=${k}$, $k=${al}$`,
        `$R(x)=${k1(al)}(${P(pmul([1, -a], [1, -b]))})+${termsTex([{ c: p, v: 'x' }, { c: q, v: '' }])}=${P(R)}$`,
        `$u=${R[0]}$, $v=${R[1]}$, $w=${R[2]}$`,
      ],
    };
  }
}

function polyInterp(r: Rng) {
  if (r.chance(0.55)) {
    const L = r.pick([1, 2, -1]);
    const c = r.nonzero(-4, 4),
      d = r.int(-5, 5);
    const xs = r.pick([
      [1, 2, 3],
      [0, 1, 2],
      [-1, 0, 1],
    ]);
    const m = r.pick([4, 5, -2, -3].filter((x) => !xs.includes(x)));
    const prod = xs.reduce((s, x) => s * (m - x), 1);
    const val = L * prod + c * m + d;
    const facs = xs.map((x) => fac(1, -x)).join('');
    return {
      q: `최고차항의 계수가 $${L}$ 인 삼차다항식 $P(x)$ 가 ${xs.map((x) => `$P(${x})=${c * x + d}$`).join(', ')} ${jo(String(c * xs[2] + d), '을', '를')} 만족할 때, $P(${m})$ 의 값을 구하세요.`,
      answer: { type: 'num' as const, value: val },
      steps: [
        `주어진 값은 모두 $${termsTex([{ c, v: 'x' }, { c: d, v: '' }])}$ 에 $x$ 를 넣은 값과 같다.`,
        `$Q(x)=P(x)-(${termsTex([{ c, v: 'x' }, { c: d, v: '' }])})$ 라 하면 $Q(${xs[0]})=Q(${xs[1]})=Q(${xs[2]})=0$`,
        `$Q(x)$ 는 최고차항의 계수가 $${L}$ 인 삼차식이므로 $Q(x)=${L === 1 ? '' : L === -1 ? '-' : L}${facs}$`,
        `$P(x)=${L === 1 ? '' : L === -1 ? '-' : L}${facs}+${termsTex([{ c, v: 'x' }, { c: d, v: '' }])}$`,
        `$P(${m})=${L}\\times(${prod})${sgn(c * m + d)}=${val}$`,
      ],
    };
  }
  const n = r.pick([3, 4]);
  const m = r.pick([n + 1, n + 2]);
  const Cc = fr(-1, (n % 2 === 0 ? 1 : -1) * factorial(n)); // Q(0) = C(-1)^n n! = -1
  const prod = Array.from({ length: n }, (_, i) => m - (i + 1)).reduce((s, x) => s * x, 1);
  const val = Cc.mul(prod).add(1).div(m);
  const roots = Array.from({ length: n }, (_, i) => fac(1, -(i + 1))).join('');
  return {
    q: `${n === 3 ? '이' : '삼'}차다항식 $P(x)$ 가 ${Array.from({ length: n }, (_, i) => `$P(${i + 1})=${fr(1, i + 1).tex()}$`).join(', ')} 을 만족할 때, $P(${m})$ 의 값을 구하세요.`,
    answer: { type: 'num' as const, value: val.value, display: 'frac' as const },
    steps: [
      `$Q(x)=xP(x)-1$ 이라 하면 $Q(x)$ 는 ${n === 3 ? '삼' : '사'}차식이고 $${Array.from({ length: n }, (_, i) => `Q(${i + 1})`).join('=')}=0$`,
      `$Q(x)=k${roots}$ 로 놓을 수 있다.`,
      `$x=0$ 을 넣으면 $Q(0)=-1$ 이므로 $k\\times(${(n % 2 === 0 ? 1 : -1) * factorial(n)})=-1$, $k=${Cc.tex()}$`,
      `$Q(${m})=${m}P(${m})-1=${Cc.tex()}\\times${prod}=${Cc.mul(prod).tex()}$`,
      `$P(${m})=\\frac{1${Cc.mul(prod).n < 0 ? '' : '+'}${Cc.mul(prod).tex()}}{${m}}=${val.tex()}$`,
    ],
  };
}

function cubicIdentity(r: Rng) {
  if (r.chance(0.5)) {
    const p = r.nonzero(-4, 5),
      q = r.nonzero(-4, 5),
      s = r.nonzero(-6, 8);
    const half = p * p + p * q + q * q;
    return {
      q: `$a-b=${p}$, $b-c=${q}$, $a+b+c=${s}$ 일 때, $a^3+b^3+c^3-3abc$ 의 값을 구하세요.`,
      answer: { type: 'num' as const, value: s * half },
      steps: [
        '$a^3+b^3+c^3-3abc=(a+b+c)(a^2+b^2+c^2-ab-bc-ca)$',
        '$a^2+b^2+c^2-ab-bc-ca=\\frac{1}{2}\\{(a-b)^2+(b-c)^2+(c-a)^2\\}$',
        `$c-a=-\\{(a-b)+(b-c)\\}=${-(p + q)}$`,
        `$\\frac{1}{2}\\{${p * p}+${q * q}+${(p + q) ** 2}\\}=${half}$`,
        `따라서 $${s < 0 ? `(${s})` : s}\\times${half}=${s * half}$`,
      ],
    };
  }
  const s = r.nonzero(-5, 6);
  let t = r.int(-6, 8);
  while (s * s < 3 * t) t--;
  const v = s * (s * s - 3 * t);
  return {
    q: `$a+b+c=${s}$, $ab+bc+ca=${t}$ 일 때, $a^3+b^3+c^3-3abc$ 의 값을 구하세요.`,
    answer: { type: 'num' as const, value: v },
    steps: [
      '$a^3+b^3+c^3-3abc=(a+b+c)(a^2+b^2+c^2-ab-bc-ca)$',
      `$a^2+b^2+c^2=(a+b+c)^2-2(ab+bc+ca)=${s * s}${sgn(-2 * t)}=${s * s - 2 * t}$`,
      `$a^2+b^2+c^2-(ab+bc+ca)=${s * s - 2 * t}${sgn(-t)}=${s * s - 3 * t}$`,
      `따라서 값은 $${s < 0 ? `(${s})` : s}\\times${s * s - 3 * t < 0 ? `(${s * s - 3 * t})` : s * s - 3 * t}=${v}$`,
      `(참고: $(a+b+c)^3-3(a+b+c)(ab+bc+ca)$ 로 계산해도 같다)`,
    ],
  };
}

function factorPrime(r: Rng) {
  const A = r.chance(0.55);
  const n = A ? r.int(4, 20) : 2 * r.int(1, 7) + 1;
  const f1 = A ? n * n + n + 1 : n * n + 2 * n + 2,
    f2 = A ? n * n - n + 1 : n * n - 2 * n + 2;
  const N = f1 * f2;
  const primes = [...new Set([...factorize(f1), ...factorize(f2)].map(([p]) => p))].sort((x, y) => x - y);
  const askMax = r.chance(0.5);
  const ans = askMax ? primes[primes.length - 1] : primes.reduce((x, y) => x + y, 0);
  return {
    q: `$${comma(N)}=${n}^4${A ? `+${n}^2+1` : '+4'}$ 이다. 인수분해를 이용하여 $${comma(N)}$ 의 ${askMax ? '가장 큰 소인수를' : '서로 다른 소인수를 모두 더한 값을'} 구하세요.`,
    answer: { type: 'num' as const, value: ans },
    steps: [
      A ? '$x^4+x^2+1=(x^4+2x^2+1)-x^2=(x^2+1)^2-x^2$' : '$x^4+4=(x^4+4x^2+4)-4x^2=(x^2+2)^2-(2x)^2$',
      A ? '$=(x^2+x+1)(x^2-x+1)$' : '$=(x^2+2x+2)(x^2-2x+2)$',
      `$x=${n}$ ${jo(String(n), '을', '를')} 넣으면 $${comma(N)}=${f1}\\times${f2}$`,
      [f1, f2].map((f) => (factorize(f).length === 1 && factorize(f)[0][1] === 1 ? `$${f}$ ${jo(String(f), '은', '는')} 소수` : `$${f}=${ftex(factorize(f))}$`)).join(', '),
      `서로 다른 소인수: ${primes.map((p) => `$${p}$`).join(', ')}`,
      askMax ? `가장 큰 소인수는 $${ans}$` : `합은 $${primes.join('+')}=${ans}$`,
    ],
  };
}

function complexCycle(r: Rng) {
  const v = r.int(0, 2);
  if (v === 0) {
    const plus = r.chance(0.5);
    const z = plus ? [0, 1] : [0, -1];
    const N = r.int(10, 60);
    let re = 0,
      im = 0,
      pr = 1,
      pi = 0;
    for (let k = 1; k <= N; k++) {
      [pr, pi] = [pr * z[0] - pi * z[1], pr * z[1] + pi * z[0]];
      re += pr;
      im += pi;
    }
    const rem = N % 4;
    return {
      q: `$z=\\frac{${plus ? '1+i' : '1-i'}}{${plus ? '1-i' : '1+i'}}$ 일 때, $z+z^2+z^3+\\cdots+z^{${N}}=a+bi$ 를 만족하는 실수 $a$, $b$ 의 값을 구하세요.`,
      answer: { type: 'fields' as const, fields: [{ label: 'a', value: re }, { label: 'b', value: im }] },
      steps: [
        `$z=\\frac{(${plus ? '1+i' : '1-i'})^2}{(1-i)(1+i)}=\\frac{${plus ? '2i' : '-2i'}}{2}=${plus ? 'i' : '-i'}$`,
        `$z^2=-1$, $z^3=${plus ? '-i' : 'i'}$, $z^4=1$ 이므로 $z+z^2+z^3+z^4=0$`,
        `네 항씩 묶으면 합이 $0$ 이고, $${N}=4\\times${Math.floor(N / 4)}+${rem}$`,
        rem === 0 ? '남는 항이 없으므로 합은 $0$' : `남는 항: ${['z', 'z^2', 'z^3'].slice(0, rem).map((t) => `$${t}$`).join(', ')} 의 합 $=${cx(re, im)}$`,
        `$a=${re}$, $b=${im}$`,
      ],
    };
  }
  if (v === 1) {
    const N = r.int(30, 100);
    const kind = r.int(0, 3);
    const lab = ['실수', '음의 실수', '양의 실수', '순허수'][kind];
    const test = [(n: number) => n % 4 === 0, (n: number) => n % 8 === 4, (n: number) => n % 8 === 0, (n: number) => n % 4 === 2][kind];
    let cnt = 0;
    for (let n = 1; n <= N; n++) if (test(n)) cnt++;
    const cond = ['$n$ 이 $4$ 의 배수', '$n=8k+4$ 꼴', '$n$ 이 $8$ 의 배수', '$n=4k+2$ 꼴'][kind];
    return {
      q: `$${N}$ 이하의 자연수 $n$ 중에서 $(1+i)^n$ 이 ${lab}가 되도록 하는 $n$ 의 개수를 구하세요.`,
      answer: { type: 'num' as const, value: cnt, unit: '개' },
      steps: [
        '$(1+i)^2=2i$, $(1+i)^4=(2i)^2=-4$, $(1+i)^8=16$',
        '$n$ 이 홀수이면 $(1+i)^n$ 은 $(\\text{실수})\\times(1+i)$ 또는 $(\\text{실수})\\times i(1+i)$ 꼴이라 실수도 순허수도 아니다.',
        '$n=4k$ 이면 $(1+i)^n=(-4)^k$ (실수), $n=4k+2$ 이면 $(1+i)^n=(-4)^k\\times2i$ (순허수)',
        kind === 1 || kind === 2 ? `$(-4)^k$ 는 $k$ 가 ${kind === 1 ? '홀수일 때 음수' : '짝수일 때 양수'}이므로 조건은 ${cond}` : `조건은 ${cond}`,
        `$1\\le n\\le ${N}$ 에서 세면 $${cnt}$ 개`,
      ],
    };
  }
  const N = r.int(8, 40);
  let re = 0,
    im = 0;
  const pw = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ];
  for (let k = 1; k <= N; k++) {
    const [a, b] = pw[k % 4];
    re += k * a;
    im += k * b;
  }
  const q = Math.floor(N / 4),
    rem = N % 4;
  const tail: string[] = [];
  for (let k = 4 * q + 1; k <= N; k++) tail.push(cx(k * pw[k % 4][0], k * pw[k % 4][1]));
  return {
    q: `$i+2i^2+3i^3+4i^4+\\cdots+${N}i^{${N}}=a+bi$ 를 만족하는 실수 $a$, $b$ 의 값을 구하세요. (단, $i=\\sqrt{-1}$)`,
    answer: { type: 'fields' as const, fields: [{ label: 'a', value: re }, { label: 'b', value: im }] },
    steps: [
      '$i^{4k+1}=i$, $i^{4k+2}=-1$, $i^{4k+3}=-i$, $i^{4k+4}=1$',
      '연속한 네 항을 묶으면 $(4k+1)i-(4k+2)-(4k+3)i+(4k+4)=2-2i$',
      `$${N}=4\\times${q}+${rem}$ 이므로 묶음 $${q}$ 개의 합은 $${q}(2-2i)=${cx(2 * q, -2 * q)}$`,
      rem === 0 ? '남는 항은 없다.' : `남는 항: $${tail.join(',\\ ')}$`,
      `합 $=${cx(re, im)}$, 곧 $a=${re}$, $b=${im}$`,
    ],
  };
}

function vietaReduce(r: Rng) {
  for (;;) {
    const p = r.int(-5, 6),
      q = r.nonzero(-6, 6);
    const k = r.int(-6, 6),
      m = r.int(-6, 8);
    const A = p + k,
      B = m - q;
    if (A === 0 || B === 0) continue;
    const val = A * A * q + A * B * p + B * B;
    const f = (v: string) => termsTex([{ c: 1, v: `${v}^2` }, { c: k, v }, { c: m, v: '' }]);
    const lin = (v: string) => termsTex([{ c: A, v }, { c: B, v: '' }]);
    return {
      q: `이차방정식 $${P([1, -p, q])}=0$ 의 두 근을 $\\alpha$, $\\beta$ 라 할 때, $(${f('\\alpha')})(${f('\\beta')})$ 의 값을 구하세요.`,
      answer: { type: 'num' as const, value: val },
      steps: [
        `$\\alpha$ 는 근이므로 $\\alpha^2${p === 0 ? '' : p === 1 ? '-' : p === -1 ? '+' : sgn(-p)}${p === 0 ? '' : '\\alpha'}${sgn(q)}=0$, 곧 $\\alpha^2=${termsTex([{ c: p, v: '\\alpha' }, { c: -q, v: '' }])}$ ($\\beta$ 도 같다)`,
        `$${f('\\alpha')}=${lin('\\alpha')}$, $${f('\\beta')}=${lin('\\beta')}$`,
        `근과 계수의 관계: $\\alpha+\\beta=${p}$, $\\alpha\\beta=${q}$`,
        `$(${lin('\\alpha')})(${lin('\\beta')})=${A * A === 1 ? '' : A * A}\\alpha\\beta${sgn(A * B)}(\\alpha+\\beta)+${B * B}$`,
        `$=${A * A}\\times(${q})${sgn(A * B)}\\times(${p})+${B * B}=${val}$`,
      ],
    };
  }
}

function tangentChord(r: Rng) {
  for (;;) {
    const t = r.nonzero(-4, 4),
      m = r.nonzero(-3, 3),
      n = r.int(-6, 10);
    const d2 = 4 * t * m + m * m + 4 * n;
    if (d2 <= 0 || !sq(d2)) continue;
    const d = Math.round(Math.sqrt(d2));
    return {
      q: `이차함수 $y=x^2+ax+b$ 의 그래프가 $x$ 축에 접하고, 직선 $y=${termsTex([{ c: m, v: 'x' }, { c: n, v: '' }])}$ ${jo(termsTex([{ c: m, v: 'x' }, { c: n, v: '' }]), '과', '와')} 서로 다른 두 점에서 만난다. 두 교점의 $x$ 좌표의 차가 $${d}$ 일 때, 상수 $a$, $b$ 의 값을 구하세요.`,
      answer: { type: 'fields' as const, fields: [{ label: 'a', value: -2 * t }, { label: 'b', value: t * t }] },
      steps: [
        '$x$ 축에 접하므로 꼭짓점이 $x$ 축 위: $y=(x-p)^2$ 꼴, 곧 $a=-2p$, $b=p^2$',
        `교점의 $x$ 좌표는 $(x-p)^2=${termsTex([{ c: m, v: 'x' }, { c: n, v: '' }])}$, 곧 $x^2-(2p${sgn(m)})x+p^2${sgn(-n)}=0$ 의 두 근 $x_1$, $x_2$`,
        `$(x_1-x_2)^2=(x_1+x_2)^2-4x_1x_2=(2p${sgn(m)})^2-4(p^2${sgn(-n)})=${termsTex([{ c: 4 * m, v: 'p' }, { c: m * m + 4 * n, v: '' }])}$`,
        `$${termsTex([{ c: 4 * m, v: 'p' }, { c: m * m + 4 * n, v: '' }])}=${d}^2$ 에서 $p=${t}$`,
        `$a=${-2 * t}$, $b=${t * t}$`,
      ],
    };
  }
}

function maxminSub(r: Rng) {
  if (r.chance(0.5)) {
    const c = r.pick([2, 3]),
      j = r.int(1, 3);
    const s = (1 + c) * j;
    const x0 = c * j;
    const mn = (c * s * s) / (1 + c),
      mx = c * s * s;
    return {
      q: `$x\\ge0$, $y\\ge0$ 이고 $x+y=${s}$ 일 때, $x^2+${c}y^2$ 의 최댓값과 최솟값을 구하세요.`,
      answer: { type: 'fields' as const, fields: [{ label: '최댓값', value: mx }, { label: '최솟값', value: mn }] },
      steps: [
        `$y=${s}-x$ 이고 $y\\ge0$ 이므로 $0\\le x\\le ${s}$`,
        `$x^2+${c}(${s}-x)^2=${P([1 + c, -2 * c * s, c * s * s])}=${1 + c}(x-${x0})^2+${mn}$`,
        `$x=${x0}$ ${jo(String(x0), '은', '는')} 범위 안이므로 최솟값은 $${mn}$`,
        `끝값: $x=0$ 일 때 $${c * s * s}$, $x=${s}$ 일 때 $${s * s}$`,
        `최댓값 $${mx}$, 최솟값 $${mn}$`,
      ],
    };
  }
  for (;;) {
    const p = r.int(1, 3),
      a = 2 * r.int(-5, 5),
      b = r.int(-5, 10);
    const t0 = -a / 2;
    const inside = t0 >= -p * p;
    const mn = inside ? b - (a * a) / 4 : p ** 4 - a * p * p + b;
    const u = `x^2-${2 * p}x`;
    return {
      q: `함수 $y=(${u})^2${a === 0 ? '' : `${sgn(a)}(${u})`}${sgn(b)}$ 의 최솟값을 구하세요.`,
      answer: { type: 'num' as const, value: mn },
      steps: [
        `$${u}=t$ 로 치환하면 $t=(x-${p})^2-${p * p}\\ge-${p * p}$`,
        `$y=${P([1, a, b], 't')}${a === 0 ? '' : `=(t${sgn(a / 2)})^2${sgn(b - (a * a) / 4)}`}$ ($t\\ge-${p * p}$)`,
        inside ? `꼭짓점 $t=${t0}$ ${jo(String(t0), '은', '는')} 범위 $t\\ge-${p * p}$ 안에 있으므로 $t=${t0}$ 에서 최소` : `꼭짓점 $t=${t0}$ ${jo(String(t0), '은', '는')} 범위 밖이고, $t\\ge-${p * p}$ 에서 $y$ 는 증가하므로 $t=-${p * p}$ 에서 최소`,
        inside ? `최솟값 $${mn}$` : `최솟값 $=${p ** 4}${sgn(-a * p * p)}${sgn(b)}=${mn}$`,
        `(확인: $t=${inside ? t0 : -p * p}$ ${jo(String(inside ? t0 : -p * p), '이', '가')} 되는 실수 $x$ 가 존재한다)`,
      ],
    };
  }
}

function cubicComplexRoot(r: Rng) {
  for (;;) {
    const u = r.int(-3, 3),
      v = r.int(1, 3),
      rr = r.nonzero(-4, 4);
    const nrm = u * u + v * v;
    const c = -rr * nrm;
    const a = -(2 * u + rr),
      b = nrm + 2 * u * rr;
    if (u === 0 && v === 1) continue;
    return {
      q: `삼차방정식 $x^3+ax^2+bx${sgn(c)}=0$ 의 한 근이 $${cx(u, v)}$ 일 때, 실수 $a$, $b$ 의 값을 구하세요.`,
      answer: { type: 'fields' as const, fields: [{ label: 'a', value: a }, { label: 'b', value: b }] },
      steps: [
        `계수가 모두 실수이므로 켤레복소수 $${cx(u, -v)}$ 도 근`,
        `두 근의 합 $${2 * u}$, 곱 $${nrm}$ 이므로 두 근을 갖는 이차식은 $${P([1, -2 * u, nrm])}$`,
        `나머지 한 근을 $\\gamma$ 라 하면 $x^3+ax^2+bx${sgn(c)}=(${P([1, -2 * u, nrm])})(x-\\gamma)$`,
        `상수항 비교: $-${nrm}\\gamma=${c}$, $\\gamma=${rr}$`,
        `전개: $(${P([1, -2 * u, nrm])})(${P([1, -rr])})=${P([1, a, b, c])}$`,
        `$a=${a}$, $b=${b}$`,
      ],
    };
  }
}

function systemIneqCount(r: Rng) {
  for (;;) {
    const p = r.int(-3, 3),
      q = p + r.int(3, 7);
    const t = p - r.int(1, 3);
    if (t === 0) continue;
    const m = r.int(1, q - p);
    const al = q - m;
    const S2 = `x^2-(a${sgn(t)})x${t > 0 ? '+' : '-'}${Math.abs(t) === 1 ? '' : Math.abs(t)}a>0`;
    const ints: number[] = [];
    for (let x = al + 1; x <= q; x++) ints.push(x);
    return {
      q: `$x$ 에 대한 연립부등식 $\\begin{cases} ${P([1, -(p + q), p * q])}\\le0 \\\\ ${S2} \\end{cases}$ 를 만족하는 정수 $x$ 가 $${m}$ 개일 때, 실수 $a$ 의 값의 범위는 $\\alpha\\le a<\\beta$ 이다. $\\alpha$, $\\beta$ 의 값을 구하세요. (단, $a>${t}$)`,
      answer: { type: 'fields' as const, fields: [{ label: 'α', value: al }, { label: 'β', value: al + 1 }] },
      steps: [
        `$${fac(1, -p)}${fac(1, -q)}\\le0$ 에서 $${p}\\le x\\le ${q}$`,
        `$(x${sgn(-t)})(x-a)>0$ 이고 $a>${t}$ 이므로 $x<${t}$ 또는 $x>a$`,
        `$${t}<${p}$ 이므로 공통부분은 $${p}\\le x\\le ${q}$ 이면서 $x>a$ 인 부분`,
        `정수해가 $${m}$ 개이려면 정수해는 ${ints.map((x) => `$${x}$`).join(', ')} 이어야 한다.`,
        `$${al}$ ${jo(String(al), '은', '는')} 해가 아니고 $${al + 1}$ ${jo(String(al + 1), '은', '는')} 해이므로 $${al}\\le a<${al + 1}$`,
        `$\\alpha=${al}$, $\\beta=${al + 1}$`,
      ],
    };
  }
}

function gridPath(r: Rng) {
  for (;;) {
    const m = r.int(4, 6),
      n = r.int(3, 4);
    const P1 = r.int(1, m - 1),
      P2 = r.int(1, n - 1);
    const Q1 = r.int(P1, m),
      Q2 = r.int(P2, n);
    if ((Q1 === P1 && Q2 === P2) || (Q1 === m && Q2 === n)) continue;
    const path = (x1: number, y1: number, x2: number, y2: number) => C(x2 - x1 + y2 - y1, x2 - x1);
    const v = r.int(0, 2);
    const tot = path(0, 0, m, n);
    const AP = path(0, 0, P1, P2),
      PB = path(P1, P2, m, n),
      AQ = path(0, 0, Q1, Q2),
      QB = path(Q1, Q2, m, n),
      PQ = path(P1, P2, Q1, Q2);
    const pts: Record<string, P2> = {};
    const segs: [string, string][] = [];
    const hide: string[] = [];
    for (let i = 0; i <= m; i++)
      for (let j = 0; j <= n; j++) {
        const k = `g${i}_${j}`;
        pts[k] = [i, j];
        hide.push(k);
        if (i < m) segs.push([k, `g${i + 1}_${j}`]);
        if (j < n) segs.push([k, `g${i}_${j + 1}`]);
      }
    pts.A = [0, 0];
    pts.B = [m, n];
    if (v !== 1) pts.P = [P1, P2];
    if (v !== 0) pts.Q = [Q1, Q2];
    const fig = geo(pts, { w: 280, h: 200, segs, hide, dots: v === 0 ? ['P'] : v === 1 ? ['Q'] : ['P', 'Q'] });
    const head = '그림과 같은 바둑판 모양의 길이 있다. 점 $A$ 에서 점 $B$ 까지 최단 거리로 갈 때,';
    const s0 = `오른쪽으로 한 칸 가는 것을 →, 위쪽으로 한 칸 가는 것을 ↑ 라 하면, 가로 $a$ 칸·세로 $b$ 칸을 가는 최단 경로의 수는 $${'{}'}_{a+b}\\mathrm{C}_{a}$`;
    if (v === 0) {
      return {
        q: `${head} 점 $P$ 를 반드시 지나는 경우의 수를 구하세요.`,
        fig,
        answer: { type: 'num' as const, value: AP * PB, unit: '가지' },
        steps: [s0, `$A\\to P$: 가로 $${P1}$, 세로 $${P2}$ 칸 → $${AP}$ 가지`, `$P\\to B$: 가로 $${m - P1}$, 세로 $${n - P2}$ 칸 → $${PB}$ 가지`, '곱의 법칙으로 곱한다.', `$${AP}\\times${PB}=${AP * PB}$`],
      };
    }
    if (v === 1) {
      return {
        q: `${head} 점 $Q$ 를 지나지 않는 경우의 수를 구하세요.`,
        fig,
        answer: { type: 'num' as const, value: tot - AQ * QB, unit: '가지' },
        steps: [s0, `전체: $${'{}'}_{${m + n}}\\mathrm{C}_{${m}}=${tot}$`, `$Q$ 를 지나는 경우: $${AQ}\\times${QB}=${AQ * QB}$`, '여사건을 이용해 뺀다.', `$${tot}-${AQ * QB}=${tot - AQ * QB}$`],
      };
    }
    return {
      q: `${head} 점 $P$ 는 반드시 지나고 점 $Q$ 는 지나지 않는 경우의 수를 구하세요.`,
      fig,
      answer: { type: 'num' as const, value: AP * (PB - PQ * QB), unit: '가지' },
      steps: [
        s0,
        `$A\\to P$: $${AP}$ 가지`,
        `$P\\to B$ 전체: $${PB}$ 가지, 그중 $Q$ 를 지나는 것: $P\\to Q$ $${PQ}$ 가지 $\\times$ $Q\\to B$ $${QB}$ 가지 $=${PQ * QB}$`,
        `$P\\to B$ 에서 $Q$ 를 피하는 경로: $${PB}-${PQ * QB}=${PB - PQ * QB}$`,
        `$${AP}\\times${PB - PQ * QB}=${AP * (PB - PQ * QB)}$`,
      ],
    };
  }
}

function coloring(r: Rng) {
  const lay = r.int(0, 2);
  const k = r.pick([4, 5]);
  const names = lay === 0 ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E'];
  const edges: [number, number][] = lay === 0 ? [[0, 1], [0, 2], [0, 3], [1, 2], [2, 3]] : lay === 1 ? [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [2, 3], [3, 4], [4, 1]] : [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [2, 3], [3, 4]];
  // 직접 세기 (검산)
  const n = names.length;
  let cnt = 0;
  const col = new Array(n).fill(0);
  const rec = (i: number) => {
    if (i === n) {
      cnt++;
      return;
    }
    for (let c = 0; c < k; c++) {
      if (edges.some(([a, b]) => (a === i && b < i && col[b] === c) || (b === i && a < i && col[a] === c))) continue;
      col[i] = c;
      rec(i + 1);
    }
  };
  rec(0);
  const adjTxt = lay === 0 ? 'A 는 B, C, D 와 모두 이웃하고, B 와 C, C 와 D 가 각각 이웃한다' : lay === 1 ? 'A 는 나머지 네 영역과 모두 이웃하고, B 와 C, C 와 D, D 와 E, E 와 B 가 각각 이웃한다' : 'A 는 나머지 네 영역과 모두 이웃하고, B 와 C, C 와 D, D 와 E 가 각각 이웃한다';
  let steps: string[];
  if (lay === 0) {
    steps = [`A 에 칠할 수 있는 색: $${k}$ 가지`, `B: A 와 다른 색 $${k - 1}$ 가지`, `C: A, B 와 다른 색 $${k - 2}$ 가지`, `D: A, C 와 다른 색 $${k - 2}$ 가지 (B 와는 같아도 된다)`, `$${k}\\times${k - 1}\\times${k - 2}\\times${k - 2}=${cnt}$`];
  } else if (lay === 2) {
    steps = [`A: $${k}$ 가지, B: $${k - 1}$ 가지`, `C: A, B 와 다른 색 $${k - 2}$ 가지`, `D: A, C 와 다른 색 $${k - 2}$ 가지`, `E: A, D 와 다른 색 $${k - 2}$ 가지`, `$${k}\\times${k - 1}\\times${k - 2}^3=${cnt}$`];
  } else {
    const same = k * (k - 1) * (k - 2) * (k - 2),
      diff = k * (k - 1) * (k - 2) * (k - 3) * (k - 3);
    steps = [
      `A: $${k}$ 가지. B, C, D, E 는 A 와 다른 $${k - 1}$ 가지 색 중에서 칠한다.`,
      'B 와 D 는 이웃하지 않으므로 같은 색인 경우와 다른 색인 경우로 나눈다.',
      `(i) B, D 같은 색: B $${k - 1}$, D $1$, C $${k - 2}$, E $${k - 2}$ → $${k}\\times${k - 1}\\times${k - 2}\\times${k - 2}=${same}$`,
      `(ii) B, D 다른 색: B $${k - 1}$, D $${k - 2}$, C $${k - 3}$, E $${k - 3}$ → $${k}\\times${k - 1}\\times${k - 2}\\times${k - 3}\\times${k - 3}=${diff}$`,
      `합의 법칙: $${same}+${diff}=${cnt}$`,
    ];
  }
  return {
    q: `${names.length === 4 ? '네' : '다섯'} 영역 ${names.join(', ')} 가 있다. ${adjTxt} (그 밖의 영역끼리는 이웃하지 않는다). 서로 다른 $${k}$ 가지 색의 전부 또는 일부를 사용하여 이웃한 영역은 서로 다른 색이 되도록 칠하는 방법의 수를 구하세요. (단, 한 영역에는 한 가지 색만 칠하고, 같은 색을 여러 번 사용할 수 있다.)`,
    answer: { type: 'num' as const, value: cnt, unit: '가지' },
    steps,
  };
}

const PERIOD_MATS: number[][][] = [
  [
    [0, -1],
    [1, 0],
  ],
  [
    [0, 1],
    [-1, -1],
  ],
  [
    [1, -1],
    [1, 0],
  ],
  [
    [-1, 1],
    [-1, 0],
  ],
  [
    [1, 1],
    [-1, 0],
  ],
];

function matrixPeriod(r: Rng) {
  const A = r.pick(PERIOD_MATS);
  const E = [
    [1, 0],
    [0, 1],
  ];
  const pw: number[][][] = [A];
  while (!(pw[pw.length - 1][0][0] === 1 && pw[pw.length - 1][1][1] === 1 && pw[pw.length - 1][0][1] === 0 && pw[pw.length - 1][1][0] === 0)) pw.push(mm(pw[pw.length - 1], A));
  const T = pw.length; // A^T = E
  const negIdx = pw.findIndex((M) => M[0][0] === -1 && M[1][1] === -1 && M[0][1] === 0 && M[1][0] === 0);
  const shown = pw.slice(1, negIdx >= 0 ? negIdx + 1 : T - 1).map((M, i) => `$A^{${i + 2}}=${mtex(M)}$`);
  const key = negIdx >= 0 ? `$A^{${negIdx + 1}}=-E$ 이므로 $A^{${T}}=(-E)^2=E$` : `$A^{${T}}=${mtex(E)}=E$`;
  const v = r.int(0, 2);
  const N = r.int(v === 0 ? 50 : 10, v === 0 ? 100 : 40);
  const st = [...shown.slice(0, 3), key];
  if (v === 0) {
    const cnt = Math.floor(N / T);
    return {
      q: `행렬 $A=${mtex(A)}$ 에 대하여 $A^n=E$ 를 만족하는 $${N}$ 이하의 자연수 $n$ 의 개수를 구하세요. (단, $E$ 는 단위행렬)`,
      answer: { type: 'num' as const, value: cnt, unit: '개' },
      steps: [...st, `$A, A^2, \\cdots, A^{${T - 1}}$ 은 $E$ 가 아니므로 $A^n=E$ 가 되는 것은 $n$ 이 $${T}$ 의 배수일 때뿐`, `$${N}$ 이하의 $${T}$ 의 배수는 $${cnt}$ 개`],
    };
  }
  let S = [
    [0, 0],
    [0, 0],
  ];
  let M = E;
  for (let i = 1; i <= N; i++) {
    M = mm(M, A);
    S = S.map((row, a) => row.map((x, b) => x + M[a][b]));
  }
  let PS = [
    [0, 0],
    [0, 0],
  ];
  for (let i = 0; i < T; i++) PS = PS.map((row, a) => row.map((x, b) => x + pw[i][a][b]));
  const periodZero = PS.every((row) => row.every((x) => x === 0));
  const rem = N % T;
  if (v === 1) {
    const tot = S[0][0] + S[0][1] + S[1][0] + S[1][1];
    return {
      q: `행렬 $A=${mtex(A)}$ 에 대하여 $A+A^2+A^3+\\cdots+A^{${N}}$ 의 모든 성분의 합을 구하세요.`,
      answer: { type: 'num' as const, value: tot },
      steps: [
        ...st,
        `$A+A^2+\\cdots+A^{${T}}=${mtex(PS)}$${periodZero ? ' (영행렬)' : ''}`,
        `$${N}=${T}\\times${Math.floor(N / T)}+${rem}$ 이므로 ${periodZero ? `연속한 $${T}$ 개씩 묶은 합은 모두 영행렬이고, 남는 것은 ${rem === 0 ? '없다' : rem === 1 ? '$A$ 뿐이다' : `$A+\\cdots+A^{${rem}}$ 이다`}` : '주기마다 같은 합이 반복된다'}`,
        `$A+A^2+\\cdots+A^{${N}}=${mtex(S)}$`,
        `모든 성분의 합은 $${tot}$`,
      ],
    };
  }
  const RN = pw[(N - 1) % T];
  return {
    q: `행렬 $A=${mtex(A)}$ 에 대하여 $A^{${N}}$ 의 $(1,2)$ 성분을 구하세요.`,
    answer: { type: 'num' as const, value: RN[0][1] },
    steps: [...st, `$${N}=${T}\\times${Math.floor(N / T)}+${rem}$ 이므로 $A^{${N}}=${rem === 0 ? 'E' : rem === 1 ? 'A' : `A^{${rem}}`}=${mtex(RN)}$`, `$(1,2)$ 성분은 $${RN[0][1]}$`],
  };
}

function matrixCommute(r: Rng) {
  for (;;) {
    const a = r.int(-3, 4),
      b = r.nonzero(-3, 3),
      c = r.nonzero(-3, 3),
      d = r.int(-3, 4);
    if (a === d) continue;
    const al = r.pick([-2, -1, 1, 2, 3]);
    const m = al * b,
      qv = al * c;
    const y = r.int(-4, 5);
    const pv = y + al * (a - d);
    const A = [
      [a, b],
      [c, d],
    ];
    return {
      q: `두 행렬 $A=${mtex(A)}$, $B=${mtex([
        ['p', m],
        ['q', y],
      ])}$ 에 대하여 $(A+B)^2=A^2+2AB+B^2$ 이 성립할 때, $p$, $q$ 의 값을 구하세요.`,
      answer: { type: 'fields' as const, fields: [{ label: 'p', value: pv }, { label: 'q', value: qv }] },
      steps: [
        '$(A+B)^2=A^2+AB+BA+B^2$ 이므로 조건은 $AB=BA$',
        `$AB=${mtex([
          [termsTex([{ c: a, v: 'p' }, { c: b, v: 'q' }]), a * m + b * y],
          [termsTex([{ c: c, v: 'p' }, { c: d, v: 'q' }]), c * m + d * y],
        ])}$`,
        `$BA=${mtex([
          [termsTex([{ c: a, v: 'p' }, { c: c * m, v: '' }]), termsTex([{ c: b, v: 'p' }, { c: d * m, v: '' }])],
          [termsTex([{ c: a, v: 'q' }, { c: c * y, v: '' }]), termsTex([{ c: b, v: 'q' }, { c: d * y, v: '' }])],
        ])}$`,
        `$(1,2)$ 성분 비교: $${a * m + b * y}=${termsTex([{ c: b, v: 'p' }, { c: d * m, v: '' }])}$ 에서 $p=${pv}$`,
        `$(2,1)$ 성분 비교: $${termsTex([{ c: c, v: 'p' }, { c: d, v: 'q' }])}=${termsTex([{ c: a, v: 'q' }, { c: c * y, v: '' }])}$ 에 $p=${pv}$ ${jo(String(pv), '을', '를')} 넣으면 $q=${qv}$`,
        `(확인: $(1,1)$ 성분 $${b}q=${c * m}$ 도 성립)`,
      ],
    };
  }
}

export const HC1_TOP: Record<string, Skill[]> = {
  'hc1-1': [
    { id: 'top-division-chain', title: '몫을 다시 나눈 다항식의 나머지', gen: (r) => divisionChain(r) },
    { id: 'top-surd-reduce', title: '차수를 낮추어 식의 값 구하기', gen: (r) => surdReduce(r) },
  ],
  'hc1-2': [
    { id: 'top-remainder-cubic', title: '삼차식으로 나눈 나머지 구하기', gen: (r) => remainderCubic(r) },
    { id: 'top-poly-interp', title: '여러 값이 주어진 다항식 (새 다항식으로 놓기)', gen: (r) => polyInterp(r) },
  ],
  'hc1-3': [
    { id: 'top-cubic-identity', title: 'a³+b³+c³−3abc 의 인수분해 활용', gen: (r) => cubicIdentity(r) },
    { id: 'top-factor-prime', title: '인수분해로 큰 수의 소인수 찾기', gen: (r) => factorPrime(r) },
  ],
  'hc1-4': [
    { id: 'top-complex-cycle', title: '복소수의 거듭제곱의 규칙', gen: (r) => complexCycle(r) },
    { id: 'top-vieta-reduce', title: '근과 계수의 관계와 차수 낮추기', gen: (r) => vietaReduce(r) },
  ],
  'hc1-5': [
    { id: 'top-tangent-chord', title: 'x축에 접하는 조건과 교점 사이 거리', gen: (r) => tangentChord(r) },
    { id: 'top-maxmin-sub', title: '조건식·치환을 이용한 최대·최소', gen: (r) => maxminSub(r) },
  ],
  'hc1-6': [
    { id: 'top-cubic-complex-root', title: '허근이 주어진 삼차방정식', gen: (r) => cubicComplexRoot(r) },
    { id: 'top-system-ineq-count', title: '정수해의 개수로 상수의 범위 구하기', gen: (r) => systemIneqCount(r) },
  ],
  'hc1-7': [
    { id: 'top-grid-path', title: '조건이 있는 최단 경로의 수', gen: (r) => gridPath(r) },
    { id: 'top-coloring', title: '이웃한 영역을 다른 색으로 칠하기', gen: (r) => coloring(r) },
  ],
  'hc1-8': [
    { id: 'top-matrix-period', title: '거듭제곱이 단위행렬이 되는 행렬', gen: (r) => matrixPeriod(r) },
    { id: 'top-matrix-commute', title: '(A+B)²=A²+2AB+B² 이 성립할 조건', gen: (r) => matrixCommute(r) },
  ],
};

