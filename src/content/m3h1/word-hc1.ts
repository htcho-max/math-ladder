// 공통수학1 문장제(활용) 유형 추가분 — hc1.ts 의 단원별 skills 뒤에 이어 붙임
import type { Skill } from '../../core/types';
import { F } from '../../core/frac';
import { round } from '../../core/nt';
import { sqrtTex, poly, dec, comma } from '../../core/tex';
import { NAMES, mc, tc, pmul, mat, triples, neun, isSq } from './util';
import { texJosa } from '../h2/util';

const u = (v: number | string, unit: string) => `${typeof v === 'number' ? dec(v) : v}\\,\\text{${unit}}`;
const won = (n: number) => `${comma(n)}`;
const TRI = triples(40);
const expand3 = (p: number, q: number, s: number) => pmul(pmul([1, p], [1, q]), [1, s]);

/** 단항식 TeX: 계수 + 문자(알파벳 순) */
function mono(c: number, pw: Record<string, number>): string {
  const body = Object.keys(pw)
    .sort()
    .map((k) => (pw[k] === 1 ? k : `${k}^${pw[k]}`))
    .join('');
  const a = Math.abs(c);
  return (c < 0 ? '-' : '+') + (a === 1 ? '' : a) + body;
}
const joinTerms = (ts: string[]) => ts.join('').replace(/^\+/, '');
/** 받침에 따라 조사 붙이기: jo('연필', '과', '와') = '연필과' */
function jo(w: string, withB: string, noB: string): string {
  const c = w.charCodeAt(w.length - 1);
  return w + (c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 !== 0 ? withB : noB);
}

export const HC1_WORD: Record<string, Skill[]> = {
  // ───────── 다항식의 연산 ─────────
  'hc1-1': [
    {
      id: 'poly-word',
      title: '곱셈 공식의 변형 활용',
      gen(r, level) {
        if (level === 1) {
          const [a0, b0, c0] = r.pick(TRI);
          const k = r.int(1, 2);
          const [a, b, c] = [a0 * k, b0 * k, c0 * k];
          return {
            q: `둘레의 길이가 $${u(2 * (a + b), 'cm')}$ 이고 넓이가 $${a * b}\\,\\text{cm}^2$ 인 직사각형의 대각선의 길이를 구하세요.`,
            answer: { type: 'num', value: c, unit: 'cm' },
            steps: [
              `가로를 $x$, 세로를 $y$ 라 하면 $2(x+y)=${2 * (a + b)}$ 에서 $x+y=${a + b}$, $xy=${a * b}$`,
              `$x^2+y^2=(x+y)^2-2xy=${(a + b) ** 2}-${2 * a * b}=${c * c}$`,
              `대각선의 길이 $=\\sqrt{x^2+y^2}=\\sqrt{${c * c}}=${c}\\,(\\text{cm})$`,
            ],
          };
        }
        if (level === 2) {
          const a = r.int(1, 9),
            b = r.int(1, 9),
            c = r.int(1, 9);
          const s1 = a + b + c,
            s2 = a * b + b * c + c * a;
          const d2 = s1 * s1 - 2 * s2;
          return {
            q: `모든 모서리의 길이의 합이 $${u(4 * s1, 'cm')}$ 이고 겉넓이가 $${2 * s2}\\,\\text{cm}^2$ 인 직육면체의 대각선의 길이는?`,
            answer: mc(r, `${sqrtTex(d2)}\\,\\text{cm}`, [sqrtTex(s1 * s1 - s2), sqrtTex(s1 * s1 + 2 * s2), `${s1}`, sqrtTex(2 * s2), sqrtTex(d2 + 4)].map((x) => `${x}\\,\\text{cm}`)),
            steps: [
              `가로, 세로, 높이를 $a$, $b$, $c$ 라 하면 $4(a+b+c)=${4 * s1}$, $2(ab+bc+ca)=${2 * s2}$`,
              `$a+b+c=${s1}$, $ab+bc+ca=${s2}$`,
              `$a^2+b^2+c^2=(a+b+c)^2-2(ab+bc+ca)=${s1 * s1}-${2 * s2}=${d2}$`,
              `대각선의 길이 $=\\sqrt{a^2+b^2+c^2}=${sqrtTex(d2)}\\,(\\text{cm})$`,
            ],
          };
        }
        const [a0, b0, c0] = r.pick(TRI);
        const k = r.int(1, 3);
        const [a, b, c] = [a0 * k, b0 * k, c0 * k];
        const S = (a * b) / 2;
        return {
          q: `빗변의 길이가 $${u(c, 'cm')}$ 이고 넓이가 $${S}\\,\\text{cm}^2$ 인 직각삼각형의 둘레의 길이를 구하세요.`,
          answer: { type: 'num', value: a + b + c, unit: 'cm' },
          steps: [
            `나머지 두 변을 $x$, $y$ 라 하면 $x^2+y^2=${c * c}$, $\\frac{1}{2}xy=${S}$ 에서 $xy=${a * b}$`,
            `$(x+y)^2=x^2+y^2+2xy=${c * c}+${2 * a * b}=${(a + b) ** 2}$, $x+y>0$ 이므로 $x+y=${a + b}$`,
            `둘레 $=${a + b}+${c}=${a + b + c}\\,(\\text{cm})$`,
          ],
        };
      },
    },
  ],

  // ───────── 인수분해 ─────────
  'hc1-3': [
    {
      id: 'factor-word',
      title: '인수분해의 활용',
      gen(r, level) {
        if (level === 1 || level === 3) {
          const [p, q, s] = r.sample([1, 2, 3, 4, 5, 6], 3);
          const V = expand3(p, q, s);
          if (level === 1) {
            const others = [1, 2, 3, 4, 5, 6, 7].filter((z) => z !== s);
            return {
              q: `부피가 $(${poly(V)})\\,\\text{cm}^3$ 인 직육면체 모양 상자의 가로의 길이가 $(x+${p})\\,\\text{cm}$, 세로의 길이가 $(x+${q})\\,\\text{cm}$ 일 때, 높이는?`,
              answer: mc(r, `(x+${s})\\,\\text{cm}`, [...r.sample(others, 3).map((z) => `(x+${z})\\,\\text{cm}`), `(x-${s})\\,\\text{cm}`, `(x+${p + q})\\,\\text{cm}`]),
              steps: [
                `$(x+${p})(x+${q})=${poly(pmul([1, p], [1, q]))}$`,
                `$${poly(V)}$ ${texJosa(String(V[V.length - 1]), '을', '를')} $${poly(pmul([1, p], [1, q]))}$ ${texJosa(String(p * q), '으로', '로', true)} 나누면 몫이 $x+${s}$ (또는 $P(-${p})=0$ 임을 이용해 인수정리로 인수분해할 수도 있음)`,
                `높이는 $(x+${s})\\,\\text{cm}$`,
              ],
            };
          }
          const T = 12,
            C = 4 * (p + q + s);
          return {
            q: `부피가 $(${poly(V)})\\,\\text{cm}^3$ 인 직육면체의 가로, 세로, 높이가 모두 $x$ 의 계수가 $1$ 이고 상수항이 자연수인 일차식으로 나타내어질 때, 이 직육면체의 모든 모서리의 길이의 합은? (단, $x>0$)`,
            answer: mc(r, `(${poly([T, C])})\\,\\text{cm}`, [poly([3, p + q + s]), poly([12, p + q + s]), poly([4, 4 * (p + q + s)]), poly([12, 2 * (p + q + s)]), poly([6, 2 * (p + q + s)])].map((x) => `(${x})\\,\\text{cm}`)),
            steps: [
              `$P(x)=${poly(V)}$ 에서 $P(-${Math.min(p, q, s)})=0$ 이므로 인수정리에 의해 $P(x)$ 의 인수 중 하나가 $x+${Math.min(p, q, s)}$ 입니다.`,
              `조립제법으로 나누어 인수분해하면 $P(x)=(x+${[p, q, s].sort((x1, y1) => x1 - y1).join(')(x+')})$`,
              `모서리의 합 $=4\\{(x+${p})+(x+${q})+(x+${s})\\}=${poly([T, C])}\\,(\\text{cm})$`,
            ],
          };
        }
        // level 2: 삼각형의 모양 결정
        const [X, Y, Z] = r.shuffle(['a', 'b', 'c']);
        const kind = r.int(0, 3);
        let terms: string[] = [];
        let fact = '';
        let right = '';
        const iso = (m: string, n: string) => {
          const [s1, s2] = [m, n].sort();
          return `$${s1}=${s2}$ 인 이등변삼각형`;
        };
        const rt = (h: string) => `빗변의 길이가 $${h}$ 인 직각삼각형`;
        if (kind === 0) {
          terms = [mono(1, { [X]: 3 }), mono(-1, { [X]: 2, [Y]: 1 }), mono(1, { [X]: 1, [Z]: 2 }), mono(-1, { [Y]: 1, [Z]: 2 })];
          fact = `${X}^2(${X}-${Y})+${Z}^2(${X}-${Y})=(${X}-${Y})(${X}^2+${Z}^2)`;
          right = iso(X, Y);
        } else if (kind === 1) {
          terms = [mono(1, { [X]: 2 }), mono(-1, { [Y]: 2 }), mono(1, { [X]: 1, [Z]: 1 }), mono(-1, { [Y]: 1, [Z]: 1 })];
          fact = `(${X}+${Y})(${X}-${Y})+${Z}(${X}-${Y})=(${X}-${Y})(${X}+${Y}+${Z})`;
          right = iso(X, Y);
        } else if (kind === 2) {
          terms = [mono(1, { [X]: 2, [Z]: 1 }), mono(1, { [Y]: 2, [Z]: 1 }), mono(-1, { [Z]: 3 })];
          fact = `${Z}(${X}^2+${Y}^2-${Z}^2)`;
          right = rt(Z);
        } else {
          terms = [mono(1, { [X]: 3 }), mono(1, { [X]: 2, [Y]: 1 }), mono(-1, { [X]: 1, [Z]: 2 }), mono(-1, { [Y]: 1, [Z]: 2 })];
          fact = `${X}^2(${X}+${Y})-${Z}^2(${X}+${Y})=(${X}+${Y})(${X}+${Z})(${X}-${Z})`;
          right = iso(X, Z);
        }
        const expr = joinTerms(r.shuffle(terms));
        const pool = [iso('a', 'b'), iso('b', 'c'), iso('a', 'c'), rt('a'), rt('b'), rt('c'), '정삼각형'];
        const reason =
          kind === 2
            ? `$${Z}>0$ 이므로 $${X}^2+${Y}^2=${Z}^2$ 이고, 빗변이 $${Z}$ 인 직각삼각형`
            : kind === 0
              ? `$${X}^2+${Z}^2>0$ 이므로 $${X}-${Y}=0$, 즉 $${X}=${Y}$`
              : kind === 1
                ? `$${X}+${Y}+${Z}>0$ 이므로 $${X}-${Y}=0$, 즉 $${X}=${Y}$`
                : `$${X}+${Y}>0$, $${X}+${Z}>0$ 이므로 $${X}-${Z}=0$, 즉 $${X}=${Z}$`;
        return {
          q: `세 변의 길이가 $a$, $b$, $c$ 인 삼각형에서 $${expr}=0$ 이 성립할 때, 이 삼각형은 어떤 삼각형인가?`,
          answer: tc(r, right, pool.filter((x) => x !== right)),
          steps: [`좌변을 인수분해하면 $${fact}=0$`, reason, `따라서 ${right}`],
        };
      },
    },
  ],

  // ───────── 복소수와 이차방정식 ─────────
  'hc1-4': [
    {
      id: 'vieta-word',
      title: '근과 계수의 관계 활용',
      gen(r, level) {
        if (level === 1) {
          const [al, be] = r.sample([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 2);
          return {
            q: `직사각형의 가로와 세로의 길이가 이차방정식 $${poly([1, -(al + be), al * be])}=0$ 의 두 근일 때, 이 직사각형의 둘레의 길이와 넓이를 구하세요.`,
            answer: { type: 'fields', fields: [{ label: '둘레', value: 2 * (al + be) }, { label: '넓이', value: al * be }] },
            steps: [`두 근을 $\\alpha$, $\\beta$ 라 하면 $\\alpha+\\beta=${al + be}$, $\\alpha\\beta=${al * be}$`, `둘레 $=2(\\alpha+\\beta)=${2 * (al + be)}$, 넓이 $=\\alpha\\beta=${al * be}$`],
          };
        }
        if (level === 2) {
          let s = 0,
            p = 0;
          for (;;) {
            s = r.int(4, 16);
            p = r.int(2, Math.floor((s * s) / 4));
            if (s * s > 4 * p && !isSq(s * s - 4 * p) && isSq(s * s - 2 * p) === false) break;
          }
          const d2 = s * s - 2 * p;
          return {
            q: `직사각형의 가로와 세로의 길이가 이차방정식 $${poly([1, -s, p])}=0$ 의 두 근일 때, 이 직사각형의 대각선의 길이는?`,
            answer: mc(r, sqrtTex(d2), [sqrtTex(s * s - p), sqrtTex(s * s + 2 * p), sqrtTex(s * s - 4 * p), `${s}`, sqrtTex(2 * p)]),
            steps: [`두 근을 $\\alpha$, $\\beta$ 라 하면 $\\alpha+\\beta=${s}$, $\\alpha\\beta=${p}$`, `$\\alpha^2+\\beta^2=(\\alpha+\\beta)^2-2\\alpha\\beta=${s * s}-${2 * p}=${d2}$`, `대각선 $=\\sqrt{\\alpha^2+\\beta^2}=${sqrtTex(d2)}$`],
          };
        }
        let s = 0,
          p = 0;
        for (;;) {
          s = r.int(3, 12);
          p = r.int(1, Math.floor((s * s) / 4));
          if (s * s > 4 * p && !isSq(s * s - 4 * p)) break;
        }
        const k = r.int(1, 4);
        const B = s + 2 * k,
          Cc = p + k * s + k * k;
        const eq = (b: number, c: number) => `${poly([1, -b, c])}=0`;
        return {
          q: `가로와 세로의 길이가 이차방정식 $${eq(s, p)}$ 의 두 근인 직사각형이 있다. 가로와 세로의 길이를 각각 $${k}$ 만큼씩 늘인 직사각형의 가로와 세로의 길이를 두 근으로 하고 $x^2$ 의 계수가 $1$ 인 이차방정식은?`,
          answer: mc(r, eq(B, Cc), [eq(s + k, p + k), eq(B, p + k * k), eq(B, p + 2 * k * s + k * k), eq(s + k, Cc), `${poly([1, B, Cc])}=0`]),
          steps: [
            `두 근을 $\\alpha$, $\\beta$ 라 하면 $\\alpha+\\beta=${s}$, $\\alpha\\beta=${p}$`,
            `새 두 근의 합 $(\\alpha+${k})+(\\beta+${k})=${s}+${2 * k}=${B}$`,
            `곱 $(\\alpha+${k})(\\beta+${k})=\\alpha\\beta+${k}(\\alpha+\\beta)+${k * k}=${Cc}$`,
            `구하는 방정식: $${eq(B, Cc)}$`,
          ],
        };
      },
    },
  ],

  // ───────── 이차방정식과 이차함수 ─────────
  'hc1-5': [
    {
      id: 'fence-word',
      title: '울타리·이익의 최대 활용',
      gen(r, level) {
        if (level === 1) {
          const k = r.int(5, 20);
          const L = 4 * k;
          const name = r.pick(NAMES);
          return {
            q: `${neun(name)} 길이가 $${u(L, 'm')}$ 인 철망으로 한쪽 면이 담장인 직사각형 모양의 닭장을 만들려고 한다. 담장 쪽에는 철망을 치지 않을 때, 닭장의 넓이의 최댓값을 구하세요. (단, 담장은 충분히 길다.)`,
            answer: { type: 'num', value: 2 * k * k, unit: 'm²' },
            steps: [
              `담장에 수직인 변의 길이를 $x\\,\\text{m}$ 라 하면 담장과 평행한 변은 $(${L}-2x)\\,\\text{m}$ $(0<x<${L / 2})$`,
              `넓이 $y=x(${L}-2x)=-2x^2+${L}x=-2(x-${k})^2+${2 * k * k}$`,
              `$x=${k}$ 일 때 최댓값 $${2 * k * k}\\,\\text{m}^2$`,
            ],
          };
        }
        if (level === 2) {
          const xs = r.int(1, 10);
          const m = r.pick([5, 10, 20]);
          const g0 = r.int(1, 10) * 100;
          const c = r.int(5, 30) * 100;
          const n0 = m * (2 * xs + g0 / 100);
          const price = c + g0 + 100 * xs;
          const profit = (g0 + 100 * xs) * (n0 - m * xs);
          return {
            q: `원가가 $${won(c)}$ 원인 물건을 한 개에 $${won(c + g0)}$ 원에 팔면 하루에 $${n0}$ 개가 팔린다. 가격을 $100$ 원 올릴 때마다 하루 판매량이 $${m}$ 개씩 줄어든다고 할 때, 하루 이익이 최대가 되는 가격과 그때의 이익을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: '가격', value: price, unit: '원' }, { label: '최대 이익', value: profit, unit: '원' }] },
            steps: [
              `가격을 $100x$ 원 올리면 한 개당 이익은 $(${g0}+100x)$ 원, 판매량은 $(${n0}-${m}x)$ 개`,
              `하루 이익 $y=(${g0}+100x)(${n0}-${m}x)=${-100 * m}x^2+${100 * n0 - m * g0}x+${g0 * n0}$`,
              `$y=${-100 * m}(x-${xs})^2+${comma(profit)}$ 이므로 $x=${xs}$ 일 때 최대`,
              `가격 $${won(c + g0)}+${100 * xs}=${won(price)}$ 원, 최대 이익 $${comma(profit)}$ 원`,
            ],
          };
        }
        const L = r.int(10, 40) * 2;
        let W = r.int(2, L / 2 - 1);
        if ((L - W) % 2 === 1) W -= 1;
        if (W < 2) W = 2;
        const x = (L - W) / 2;
        const A = x * W;
        const top = L / 4;
        return {
          q: `길이가 $${u(L, 'm')}$ 인 철망으로 길이가 $${u(W, 'm')}$ 인 벽을 한쪽 면으로 하는 직사각형 모양의 텃밭을 만들려고 한다. 벽 쪽에는 철망을 치지 않고, 벽과 평행한 변은 벽의 길이를 넘을 수 없을 때, 텃밭의 넓이의 최댓값을 구하세요.`,
          answer: { type: 'num', value: A, unit: 'm²' },
          steps: [
            `벽에 수직인 변을 $x\\,\\text{m}$ 라 하면 벽과 평행한 변은 $(${L}-2x)\\,\\text{m}$ 이고 $0<${L}-2x\\le${W}$ 에서 $${dec(x)}\\le x<${L / 2}$`,
            `넓이 $y=x(${L}-2x)=-2\\left(x-${dec(top)}\\right)^2+${dec((L * L) / 8)}$`,
            `꼭짓점 $x=${dec(top)}$ ${texJosa(dec(top), '은', '는')} 범위 밖이고, 범위에서 $x$ 가 클수록 $y$ 가 작아지므로 $x=${dec(x)}$ 일 때 최대`,
            `최댓값 $=${dec(x)}\\times${W}=${A}\\,(\\text{m}^2)$`,
          ],
        };
      },
    },
  ],

  // ───────── 여러 가지 방정식과 부등식 ─────────
  'hc1-6': [
    {
      id: 'quad-ineq-word',
      title: '이차부등식의 활용',
      gen(r, level) {
        if (level === 1) {
          const t1 = r.int(1, 3),
            t2 = t1 + r.int(1, 5);
          const v = 5 * (t1 + t2),
            H = 5 * t1 * t2;
          return {
            q: `지면에서 똑바로 위로 쏘아 올린 공의 $t$ 초 후의 높이가 $(${v}t-5t^2)\\,\\text{m}$ 이다. 공의 높이가 $${u(H, 'm')}$ 이상인 시간은 몇 초 동안인가요?`,
            answer: { type: 'num', value: t2 - t1, unit: '초' },
            steps: [`$${v}t-5t^2\\ge${H}$, $5t^2-${v}t+${H}\\le0$, $t^2-${t1 + t2}t+${t1 * t2}\\le0$`, `$(t-${t1})(t-${t2})\\le0$ 에서 $${t1}\\le t\\le${t2}$`, `$${t2}-${t1}=${t2 - t1}$ (초) 동안`],
          };
        }
        if (level === 2) {
          const r1 = r.int(2, 12),
            r2 = r1 + r.int(2, 10);
          const L = r1 + r2,
            S = r1 * r2;
          return {
            q: `둘레의 길이가 $${u(2 * L, 'm')}$ 인 직사각형 모양의 화단을 만들려고 한다. 화단의 넓이가 $${S}\\,\\text{m}^2$ 이상이 되도록 할 때, 가로의 길이 $x\\,\\text{m}$ 의 범위가 $p\\le x\\le q$ 이다. $p$, $q$ 의 값을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'p', value: r1 }, { label: 'q', value: r2 }] },
            steps: [`세로의 길이는 $(${L}-x)\\,\\text{m}$ 이고 $0<x<${L}$`, `$x(${L}-x)\\ge${S}$, $x^2-${L}x+${S}\\le0$, $(x-${r1})(x-${r2})\\le0$`, `$${r1}\\le x\\le${r2}$ (범위 $0<x<${L}$ 안에 있음) 이므로 $p=${r1}$, $q=${r2}$`],
          };
        }
        const xs = r.int(3, 10);
        const d = r.int(1, xs);
        const m = r.pick([5, 10, 20]);
        const p0 = r.int(5, 30) * 100;
        const n0 = m * (2 * xs + p0 / 100);
        const r1 = xs - d,
          r2 = xs + d;
        const R0 = (p0 + 100 * r1) * (n0 - m * r1);
        return {
          q: `한 개에 $${won(p0)}$ 원인 물건을 하루에 $${n0}$ 개씩 판다. 가격을 $100$ 원 올릴 때마다 판매량이 $${m}$ 개씩 줄어든다고 할 때, 하루 판매 금액이 $${comma(R0)}$ 원 이상이 되도록 하는 가격의 최솟값과 최댓값을 구하세요. (단, 가격은 내리지 않는다.)`,
          answer: { type: 'fields', fields: [{ label: '최솟값', value: p0 + 100 * r1, unit: '원' }, { label: '최댓값', value: p0 + 100 * r2, unit: '원' }] },
          steps: [
            `가격을 $100x$ 원 올리면 $(x\\ge0)$ 판매 금액은 $(${p0}+100x)(${n0}-${m}x)$ 원`,
            `$(${p0}+100x)(${n0}-${m}x)\\ge${comma(R0)}$ 을 정리하면 $${-100 * m}x^2+${100 * n0 - m * p0}x${p0 * n0 - R0 === 0 ? '' : `+${p0 * n0 - R0}`}\\ge0$`,
            `양변을 $${-100 * m}$ 으로 나누면 $${poly([1, -(r1 + r2), r1 * r2])}\\le0$, $${r1 === 0 ? 'x' : `(x-${r1})`}(x-${r2})\\le0$, $${r1}\\le x\\le${r2}$`,
            `가격은 $${won(p0 + 100 * r1)}$ 원 이상 $${won(p0 + 100 * r2)}$ 원 이하`,
          ],
        };
      },
    },
    {
      id: 'system-word',
      title: '연립방정식·연립부등식의 활용',
      gen(r, level) {
        if (level === 1) {
          const a = r.int(5, 15) * 100;
          const b = a + r.int(2, 8) * 100;
          const N = r.int(10, 20);
          const g = b - a;
          const ymin = r.int(1, Math.floor(N / 2)),
            ymax = r.int(ymin + 1, N - 1);
          const L = a * N + g * ymin - r.int(0, g / 100 - 1) * 100;
          const U = a * N + g * ymax + r.int(0, g / 100 - 1) * 100;
          const [f1, f2] = r.pick([
            ['사과', '배'],
            ['연필', '볼펜'],
            ['도넛', '케이크'],
            ['공책', '스케치북'],
          ]);
          const name = r.pick(NAMES);
          const lo = new F(L - a * N, g),
            hi = new F(U - a * N, g);
          return {
            q: `${neun(name)} 한 개에 $${won(a)}$ 원인 ${jo(f1, '과', '와')} 한 개에 $${won(b)}$ 원인 ${jo(f2, '을', '를')} 합하여 $${N}$ 개 사려고 한다. 전체 금액이 $${comma(L)}$ 원 이상 $${comma(U)}$ 원 이하가 되게 할 때, ${jo(f2, '은', '는')} 최소 몇 개, 최대 몇 개 살 수 있나요?`,
            answer: { type: 'fields', fields: [{ label: '최소', value: ymin, unit: '개' }, { label: '최대', value: ymax, unit: '개' }] },
            steps: [
              `${jo(f2, '을', '를')} $x$ 개 사면 ${jo(f1, '은', '는')} $(${N}-x)$ 개이므로 $${comma(L)}\\le${a}(${N}-x)+${b}x\\le${comma(U)}$`,
              `$${comma(L - a * N)}\\le${g}x\\le${comma(U - a * N)}$, $${lo.tex()}\\le x\\le${hi.tex()}$`,
              `$x$ 는 자연수이므로 최소 $${ymin}$ 개, 최대 $${ymax}$ 개`,
            ],
          };
        }
        if (level === 2) {
          const [a0, b0, c0] = r.pick(TRI);
          const k = r.int(1, 2);
          const [a, b, c] = [a0 * k, b0 * k, c0 * k];
          return {
            q: `둘레의 길이가 $${u(2 * (a + b), 'cm')}$ 이고 대각선의 길이가 $${u(c, 'cm')}$ 인 직사각형이 있다. 가로의 길이가 세로의 길이보다 길 때, 가로와 세로의 길이를 구하세요.`,
            answer: { type: 'fields', fields: [{ label: '가로', value: b, unit: 'cm' }, { label: '세로', value: a, unit: 'cm' }] },
            steps: [
              `가로 $x$, 세로 $y$ 라 하면 $x+y=${a + b}$, $x^2+y^2=${c * c}$`,
              `$y=${a + b}-x$ 를 대입하면 $x^2+(${a + b}-x)^2=${c * c}$, $x^2-${a + b}x+${a * b}=0$`,
              `$(x-${a})(x-${b})=0$, $x>y$ 이므로 $x=${b}$, $y=${a}$`,
            ],
          };
        }
        let A = 0,
          B = 0;
        A = r.int(2, 9);
        B = r.int(1, A - 1);
        const S = A * A + B * B,
          T = 11 * (A + B);
        return {
          q: `두 자리 자연수가 있다. 각 자리의 숫자의 제곱의 합은 $${S}$ 이고, 이 수와 십의 자리 숫자와 일의 자리 숫자를 바꾼 수의 합은 $${T}$ 이다. 십의 자리 숫자가 일의 자리 숫자보다 클 때, 처음 수를 구하세요.`,
          answer: { type: 'num', value: 10 * A + B },
          steps: [
            `십의 자리 숫자를 $x$, 일의 자리 숫자를 $y$ 라 하면 $x^2+y^2=${S}$, $(10x+y)+(10y+x)=${T}$ 에서 $x+y=${A + B}$`,
            `$y=${A + B}-x$ 를 대입: $x^2+(${A + B}-x)^2=${S}$, $x^2-${A + B}x+${A * B}=0$`,
            `$(x-${A})(x-${B})=0$, $x>y$ 이므로 $x=${A}$, $y=${B}$`,
            `처음 수는 $${10 * A + B}$`,
          ],
        };
      },
    },
  ],

  // ───────── 행렬 ─────────
  'hc1-8': [
    {
      id: 'matrix-table',
      title: '행렬로 나타낸 판매표',
      gen(r, level) {
        const [i1, i2] = r.pick([
          ['빵', '우유'],
          ['연필', '공책'],
          ['김밥', '라면'],
          ['장미', '튤립'],
        ]);
        const A = [
          [r.int(5, 40), r.int(5, 40)],
          [r.int(5, 40), r.int(5, 40)],
        ];
        const tbl = (M: number[][], title = '판매량(개)') => [[title, i1, i2], ['가게 P', `$${M[0][0]}$`, `$${M[0][1]}$`], ['가게 Q', `$${M[1][0]}$`, `$${M[1][1]}$`]];
        if (level === 1) {
          const i = r.int(0, 1),
            j = r.int(0, 1);
          return {
            q: `다음은 두 가게 P, Q 의 하루 판매량을 나타낸 표이다. 이 표를 가게 P, Q 를 차례로 제 $1$ 행, 제 $2$ 행으로, ${i1}, ${jo(i2, '을', '를')} 차례로 제 $1$ 열, 제 $2$ 열로 하는 행렬 $A$ 로 나타낼 때, 행렬 $A$ 의 $(${i + 1},${j + 1})$ 성분을 구하세요.`,
            table: tbl(A),
            answer: { type: 'num', value: A[i][j], unit: '개' },
            steps: [`$(${i + 1},${j + 1})$ 성분은 제 $${i + 1}$ 행(가게 ${i === 0 ? 'P' : 'Q'}), 제 $${j + 1}$ 열(${j === 0 ? i1 : i2})의 값`, `$${A[i][j]}$`],
          };
        }
        const p = [[r.int(5, 30) * 100], [r.int(5, 30) * 100]];
        if (level === 2) {
          const C = [[A[0][0] * p[0][0] + A[0][1] * p[1][0]], [A[1][0] * p[0][0] + A[1][1] * p[1][0]]];
          return {
            q: `두 가게 P, Q 의 하루 판매량이 다음 표와 같고, ${jo(i1, '과', '와')} ${i2}의 가격은 각각 $${won(p[0][0])}$ 원, $${won(p[1][0])}$ 원이다. 판매량을 행렬 $A=${mat(A)}$, 가격을 행렬 $B=${mat(p)}$ 로 나타낼 때, $AB$ 의 각 성분(가게별 하루 판매 금액)을 구하세요.`,
            table: tbl(A),
            answer: { type: 'fields', fields: [{ label: '(1,1) 성분', value: C[0][0], unit: '원' }, { label: '(2,1) 성분', value: C[1][0], unit: '원' }] },
            steps: [
              `$AB=${mat(A)}${mat(p)}$`,
              `$(1,1)$ 성분: $${A[0][0]}\\times${p[0][0]}+${A[0][1]}\\times${p[1][0]}=${comma(C[0][0])}$ (가게 P 의 판매 금액)`,
              `$(2,1)$ 성분: $${A[1][0]}\\times${p[0][0]}+${A[1][1]}\\times${p[1][0]}=${comma(C[1][0])}$ (가게 Q 의 판매 금액)`,
            ],
          };
        }
        const Bm = [
          [r.int(5, 40), r.int(5, 40)],
          [r.int(5, 40), r.int(5, 40)],
        ];
        const S = A.map((row, i) => row.map((v, j) => v + Bm[i][j]));
        const C = [S[0][0] * p[0][0] + S[0][1] * p[1][0], S[1][0] * p[0][0] + S[1][1] * p[1][0]];
        return {
          q: `두 가게 P, Q 의 3월 판매량을 행렬 $A=${mat(A)}$, 4월 판매량을 행렬 $B=${mat(Bm)}$ 로 나타내었다. (행은 가게 P, Q, 열은 ${i1}, ${i2}) ${jo(i1, '과', '와')} ${i2}의 가격이 각각 $${won(p[0][0])}$ 원, $${won(p[1][0])}$ 원으로 변함이 없을 때, 가격을 행렬 $C=${mat(p)}$ 로 나타내어 $(A+B)C$ 를 계산하여 각 가게의 두 달 동안의 판매 금액을 구하세요.`,
          answer: { type: 'fields', fields: [{ label: '가게 P', value: C[0], unit: '원' }, { label: '가게 Q', value: C[1], unit: '원' }] },
          steps: [`$A+B=${mat(S)}$`, `$(A+B)C=${mat(S)}${mat(p)}$`, `가게 P: $${S[0][0]}\\times${p[0][0]}+${S[0][1]}\\times${p[1][0]}=${comma(C[0])}$ 원, 가게 Q: $${S[1][0]}\\times${p[0][0]}+${S[1][1]}\\times${p[1][0]}=${comma(C[1])}$ 원`],
        };
      },
    },
    {
      id: 'matrix-weight',
      title: '행렬을 이용한 점수·가격 계산',
      gen(r, level) {
        const [n1, n2] = r.sample(NAMES, 2);
        if (level === 1) {
          const A = [
            [r.int(10, 50) * 100, r.int(10, 50) * 100],
            [r.int(10, 50) * 100, r.int(10, 50) * 100],
          ];
          const k = r.pick([1.1, 1.2, 0.9, 0.8]);
          const i = r.int(0, 1),
            j = r.int(0, 1);
          const v = round(A[i][j] * k);
          return {
            q: `두 가게의 상품 가격을 행렬 $A=${mat(A)}$ 로 나타내었다. (행은 가게, 열은 상품, 단위는 원) 모든 가격을 $${Math.round(Math.abs(k - 1) * 100)}\\,\\%$ ${k > 1 ? '올린' : '내린'} 가격을 행렬 $${dec(k)}A$ 로 나타낼 때, $(${i + 1},${j + 1})$ 성분을 구하세요.`,
            answer: { type: 'num', value: v, unit: '원' },
            steps: [`$${dec(k)}A$ 는 $A$ 의 모든 성분에 $${dec(k)}$ ${texJosa(dec(k), '을', '를')} 곱한 행렬`, `$(${i + 1},${j + 1})$ 성분 $=${dec(k)}\\times${A[i][j]}=${comma(v)}$`],
          };
        }
        const A = [
          [r.int(50, 100), r.int(50, 100)],
          [r.int(50, 100), r.int(50, 100)],
        ];
        if (level === 2) {
          const [w1, w2] = r.pick([
            [0.4, 0.6],
            [0.3, 0.7],
            [0.5, 0.5],
            [0.6, 0.4],
            [0.2, 0.8],
          ]);
          const C = A.map((row) => round(row[0] * w1 + row[1] * w2, 4));
          return {
            q: `${nmJ(n1)} ${nmJ2(n2)} 중간고사와 기말고사 수학 점수를 행렬 $A=${mat(A)}$ 로 나타내었다. (제 $1$ 행은 ${n1}, 제 $2$ 행은 ${n2}, 제 $1$ 열은 중간고사, 제 $2$ 열은 기말고사) 중간고사를 $${Math.round(w1 * 100)}\\,\\%$, 기말고사를 $${Math.round(w2 * 100)}\\,\\%$ 반영하여 성적을 낼 때, $A${mat([[dec(w1)], [dec(w2)]])}$ 의 각 성분을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: '(1,1) 성분', value: C[0], display: 'dec' }, { label: '(2,1) 성분', value: C[1], display: 'dec' }] },
            steps: [`$(1,1)$ 성분: $${A[0][0]}\\times${dec(w1)}+${A[0][1]}\\times${dec(w2)}=${dec(C[0])}$ (${nmP(n1)} 성적)`, `$(2,1)$ 성분: $${A[1][0]}\\times${dec(w1)}+${A[1][1]}\\times${dec(w2)}=${dec(C[1])}$ (${nmP(n2)} 성적)`],
          };
        }
        const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
        if (det === 0) return this.gen(r, level);
        const p = r.int(2, 8) / 10,
          q = r.int(2, 8) / 10;
        const s1 = round(A[0][0] * p + A[0][1] * q, 4),
          s2 = round(A[1][0] * p + A[1][1] * q, 4);
        return {
          q: `${nmJ(n1)} ${nmJ2(n2)} 수행평가와 지필평가 점수를 행렬 $A=${mat(A)}$ 로 나타내었다. (행은 ${n1}, ${n2}, 열은 수행평가, 지필평가) 수행평가 점수에 $a$, 지필평가 점수에 $b$ 를 곱하여 더한 값을 최종 점수로 할 때, $A${mat([['a'], ['b']])}=${mat([[dec(s1)], [dec(s2)]])}$ 이었다. $a$, $b$ 의 값을 구하세요.`,
          answer: { type: 'fields', fields: [{ label: 'a', value: p, display: 'dec' }, { label: 'b', value: q, display: 'dec' }] },
          steps: [
            `행렬의 곱을 계산하면 $${A[0][0]}a+${A[0][1]}b=${dec(s1)}$, $${A[1][0]}a+${A[1][1]}b=${dec(s2)}$`,
            `(첫째 식)$\\times${A[1][0]}-$(둘째 식)$\\times${A[0][0]}$ 에서 $${A[0][1] * A[1][0] - A[1][1] * A[0][0]}b=${dec(round(s1 * A[1][0] - s2 * A[0][0], 4))}$`,
            `$a=${dec(p)}$, $b=${dec(q)}$`,
          ],
        };
      },
    },
  ],
};

/** 이름 + 와/과 : 서연이와 / 민수와 */
function nmJ(name: string): string {
  const c = name.charCodeAt(name.length - 1);
  return (c - 0xac00) % 28 !== 0 ? `${name}이와` : `${name}와`;
}
/** 이름 + 의 */
function nmJ2(name: string): string {
  const c = name.charCodeAt(name.length - 1);
  return (c - 0xac00) % 28 !== 0 ? `${name}이의` : `${name}의`;
}
const nmP = nmJ2;
