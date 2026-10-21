// 중3-1 문장제(활용) 유형 추가분 — m3a.ts 의 단원별 skills 뒤에 이어 붙임
import type { Skill } from '../../core/types';
import { F } from '../../core/frac';
import { round, simplifySqrt } from '../../core/nt';
import { sqrtTex, poly, termsTex, dec, comma } from '../../core/tex';
import { Svg } from '../../core/fig';
import { NAMES, ga, neun, mc, fac, isSq } from './util';
import { texJosa } from '../h2/util';

const u = (v: number | string, unit: string) => `${typeof v === 'number' ? dec(v) : v}\\,\\text{${unit}}`;
/** (num/den)·√rad 를 간단히: \frac{a\sqrt{n}}{d} */
function ks(num: number, rad: number, den = 1): string {
  const [o, i] = simplifySqrt(rad);
  const f = new F(num * o, den);
  if (i === 1) return f.tex();
  const s = f.n < 0 ? '-' : '';
  const a = Math.abs(f.n);
  const body = a === 1 ? `\\sqrt{${i}}` : `${a}\\sqrt{${i}}`;
  return f.d === 1 ? `${s}${body}` : `${s}\\frac{${body}}{${f.d}}`;
}
/** 근호 안 정리 전 그대로: √n */
const rawSqrt = (n: number) => `\\sqrt{${n}}`;
const SQF = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15];
const SQF2 = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19, 21, 22, 23, 26, 29, 30, 31, 33, 34, 35, 37, 38, 39];

export const M3A_WORD: Record<string, Skill[]> = {
  // ───────── 제곱근과 실수 ─────────
  'm3a-1': [
    {
      id: 'square-side',
      title: '넓이로 정사각형의 한 변 구하기',
      gen(r, level) {
        if (level === 1) {
          const k = r.int(4, 25);
          const askP = r.chance(0.4);
          const name = r.pick(NAMES);
          return {
            q: `${neun(name)} 넓이가 $${k * k}\\,\\text{m}^2$ 인 정사각형 모양의 텃밭을 가꾸고 있다. 이 텃밭의 ${askP ? '둘레의 길이' : '한 변의 길이'}를 구하세요.`,
            answer: { type: 'num', value: askP ? 4 * k : k, unit: 'm' },
            steps: [
              `한 변의 길이를 $x\\,\\text{m}$ 라 하면 $x^2=${k * k}$ 이고 $x>0$ 이므로 $x=\\sqrt{${k * k}}=${k}$`,
              ...(askP ? [`둘레 $=4\\times${k}=${4 * k}\\,(\\text{m})$`] : []),
            ],
          };
        }
        if (level === 2) {
          const s = r.pick(SQF2);
          const p = r.int(1, s - 1),
            q = s - p;
          return {
            q: `넓이가 각각 $${p}\\,\\text{cm}^2$, $${q}\\,\\text{cm}^2$ 인 두 정사각형의 넓이의 합과 넓이가 같은 정사각형을 만들려고 한다. 새 정사각형의 한 변의 길이는?`,
            answer: mc(r, rawSqrt(s), [`${rawSqrt(p)}+${rawSqrt(q)}`, `${s}`, rawSqrt(2 * s), new F(s, 2).tex()]),
            steps: [`새 정사각형의 넓이는 $${p}+${q}=${s}\\,(\\text{cm}^2)$`, `한 변의 길이를 $x$ 라 하면 $x^2=${s}$, $x>0$ 이므로 $x=\\sqrt{${s}}\\,\\text{cm}$`, `(주의: $\\sqrt{${p}}+\\sqrt{${q}}$ 와는 다릅니다.)`],
          };
        }
        let a = 0,
          b = 0;
        for (;;) {
          a = r.int(3, 20);
          b = r.int(2, 15);
          if (a !== b && !isSq(a * b)) break;
        }
        const k = Math.floor(Math.sqrt(a * b));
        return {
          q: `가로 $${u(a, 'm')}$, 세로 $${u(b, 'm')}$ 인 직사각형 모양의 땅과 넓이가 같은 정사각형 모양의 땅이 있다. 이 정사각형의 한 변의 길이를 $x\\,\\text{m}$ 라 할 때, $n<x<n+1$ 을 만족하는 자연수 $n$ 의 값을 구하세요.`,
          answer: { type: 'num', value: k },
          steps: [`$x^2=${a}\\times${b}=${a * b}$ 이고 $x>0$ 이므로 $x=\\sqrt{${a * b}}$`, `$${k}^2=${k * k}<${a * b}<${(k + 1) ** 2}=${k + 1}^2$ 이므로 $${k}<\\sqrt{${a * b}}<${k + 1}$`, `$n=${k}$`],
        };
      },
    },
    {
      id: 'sqrt-fall',
      title: '제곱근의 실생활 공식',
      gen(r, level) {
        const intro = '물체를 가만히 떨어뜨리면 $t$ 초 동안 떨어지는 거리는 $5t^2\\,\\text{m}$ 이다.';
        if (level === 1) {
          const k = r.int(1, 9);
          const h = 5 * k * k;
          const what = r.pick(['공을', '사과를', '돌멩이를', '물풍선을']);
          return {
            q: `${intro} 높이가 $${u(h, 'm')}$ 인 곳에서 ${what} 가만히 떨어뜨렸을 때, 땅에 닿을 때까지 걸리는 시간은 몇 초인가요? (단, 공기의 저항은 무시한다.)`,
            answer: { type: 'num', value: k, unit: '초' },
            steps: [`$5t^2=${h}$, $t^2=${k * k}$`, `$t>0$ 이므로 $t=\\sqrt{${k * k}}=${k}$ (초)`],
          };
        }
        if (level === 2) {
          const m = r.pick(SQF2);
          const h = 5 * m;
          return {
            q: `${intro} 높이가 $${u(h, 'm')}$ 인 다리 위에서 돌멩이를 가만히 떨어뜨렸을 때, 수면에 닿을 때까지 걸리는 시간은? (단, 공기의 저항은 무시한다.)`,
            answer: mc(r, `${rawSqrt(m)}\\text{ 초}`, [`${rawSqrt(h)}\\text{ 초}`, `${m}\\text{ 초}`, `${rawSqrt(m + 1)}\\text{ 초}`, `5${rawSqrt(m)}\\text{ 초}`, `${rawSqrt(m * 2)}\\text{ 초}`]),
            steps: [`$5t^2=${h}$, $t^2=${m}$`, `$t>0$ 이므로 $t=\\sqrt{${m}}$ (초)`],
          };
        }
        let m = 0;
        do m = r.int(6, 60);
        while (isSq(m));
        const h = 5 * m;
        const k = Math.floor(Math.sqrt(m));
        return {
          q: `${intro} 높이가 $${u(h, 'm')}$ 인 건물 옥상에서 공을 가만히 떨어뜨렸을 때 땅에 닿을 때까지 걸리는 시간을 $t$ 초라 하자. $n<t<n+1$ 을 만족하는 자연수 $n$ 의 값을 구하세요. (단, 공기의 저항은 무시한다.)`,
          answer: { type: 'num', value: k },
          steps: [`$5t^2=${h}$ 에서 $t^2=${m}$, $t>0$ 이므로 $t=\\sqrt{${m}}$`, `$${k * k}<${m}<${(k + 1) ** 2}$ 이므로 $${k}<\\sqrt{${m}}<${k + 1}$`, `$n=${k}$`],
        };
      },
    },
  ],

  // ───────── 근호를 포함한 식의 계산 ─────────
  'm3a-2': [
    {
      id: 'surd-area',
      title: '근호가 있는 넓이 구하기',
      gen(r, level) {
        if (level === 1) {
          let a = 0,
            b = 0;
          for (;;) {
            a = r.int(2, 15);
            b = r.int(2, 15);
            if (a !== b && !isSq(a * b) && !isSq(a) && !isSq(b)) break;
          }
          return {
            q: `가로의 길이가 $\\sqrt{${a}}\\,\\text{cm}$, 세로의 길이가 $\\sqrt{${b}}\\,\\text{cm}$ 인 직사각형 모양 카드의 넓이는?`,
            answer: mc(r, `${sqrtTex(a * b)}\\,\\text{cm}^2`, [`${sqrtTex(a + b)}\\,\\text{cm}^2`, `${a * b}\\,\\text{cm}^2`, `${sqrtTex(4 * a * b)}\\,\\text{cm}^2`, `${sqrtTex(a * b + 1)}\\,\\text{cm}^2`, `2(\\sqrt{${a}}+\\sqrt{${b}})\\,\\text{cm}^2`]),
            steps: [`넓이 $=\\sqrt{${a}}\\times\\sqrt{${b}}=\\sqrt{${a * b}}$`, `$=${sqrtTex(a * b)}\\,(\\text{cm}^2)$`],
          };
        }
        if (level === 2) {
          const [a, b] = r.sample(SQF, 2);
          const p = r.int(1, 3),
            q = r.int(2, 12);
          const right = ks(q, a * b, p * a);
          return {
            q: `넓이가 $${ks(q, b)}\\,\\text{m}^2$ 인 직사각형 모양 화단의 가로의 길이가 $${ks(p, a)}\\,\\text{m}$ 일 때, 세로의 길이는?`,
            answer: mc(r, `${right}\\,\\text{m}`, [`${ks(q, a * b, p)}\\,\\text{m}`, `${ks(q, b * a, p * b)}\\,\\text{m}`, `${ks(p, a * b, q * b)}\\,\\text{m}`, `${ks(q, b, p * a)}\\,\\text{m}`, `${ks(q * p, a * b)}\\,\\text{m}`].filter((x) => x !== `${right}\\,\\text{m}`)),
            steps: [`(세로) $=${ks(q, b)}\\div${ks(p, a)}=\\frac{${ks(q, b)}}{${ks(p, a)}}$`, `분모를 유리화: $\\frac{${ks(q, b)}\\times\\sqrt{${a}}}{${ks(p, a)}\\times\\sqrt{${a}}}=\\frac{${ks(q, a * b)}}{${p * a}}$`, `$=${right}\\,(\\text{m})$`],
          };
        }
        const [t, s] = r.sample(SQF, 2);
        const uu = r.int(1, 3),
          v = r.int(uu + 1, 5),
          h = r.int(1, 3);
        const right = ks((uu + v) * h, t * s, 2);
        return {
          q: `윗변의 길이가 $\\sqrt{${uu * uu * t}}\\,\\text{cm}$, 아랫변의 길이가 $\\sqrt{${v * v * t}}\\,\\text{cm}$, 높이가 $${ks(h, s)}\\,\\text{cm}$ 인 사다리꼴 모양 타일의 넓이는?`,
          answer: mc(r, `${right}\\,\\text{cm}^2`, [ks((uu + v) * h, t * s), ks((uu + v) * h, t + s, 2), ks(uu * v * h, t * s, 2), ks((uu + v) * h, t * s, 4), ks((v - uu) * h, t * s, 2)].map((x) => `${x}\\,\\text{cm}^2`)),
          steps: [
            `$\\sqrt{${uu * uu * t}}=${ks(uu, t)}$, $\\sqrt{${v * v * t}}=${ks(v, t)}$ 이므로 (윗변)$+$(아랫변) $=${ks(uu + v, t)}$`,
            `넓이 $=\\frac{1}{2}\\times${ks(uu + v, t)}\\times${ks(h, s)}=${ks((uu + v) * h, t * s, 2)}$`,
            `$=${right}\\,(\\text{cm}^2)$`,
          ],
        };
      },
    },
    {
      id: 'surd-perimeter',
      title: '근호가 있는 둘레·길이 구하기',
      gen(r, level) {
        const t = r.pick(SQF.slice(0, 7));
        if (level === 1) {
          const a = r.int(1, 4),
            b = r.int(a + 1, 6);
          const right = ks(2 * (a + b), t);
          return {
            q: `가로의 길이가 $\\sqrt{${b * b * t}}\\,\\text{cm}$, 세로의 길이가 $\\sqrt{${a * a * t}}\\,\\text{cm}$ 인 직사각형 모양 액자의 둘레의 길이는?`,
            answer: mc(r, `${right}\\,\\text{cm}`, [ks(a + b, t), `2\\sqrt{${(a * a + b * b) * t}}`, ks(4 * (a + b), t), ks(2 * (a + b), 2 * t), ks(2 * a * b, t)].map((x) => `${x}\\,\\text{cm}`)),
            steps: [`$\\sqrt{${b * b * t}}=${ks(b, t)}$, $\\sqrt{${a * a * t}}=${ks(a, t)}$`, `둘레 $=2(${ks(b, t)}+${ks(a, t)})=2\\times${ks(a + b, t)}$`, `$=${right}\\,(\\text{cm})$`],
          };
        }
        if (level === 2) {
          const y = r.int(1, 4),
            x = r.int(y + 1, 6);
          const right = ks(4 * x + 2 * y, t);
          const sv = new Svg(240, 140);
          const sc = 200 / (x + y);
          const top = Math.min(110, x * sc);
          const k = top / x;
          sv.rect(20, 125 - x * k, x * k, x * k, { fill: true, cls: 'acc' });
          sv.rect(20 + x * k, 125 - y * k, y * k, y * k, { fill: true, cls: 'acc2' });
          return {
            q: `넓이가 각각 $${x * x * t}\\,\\text{cm}^2$, $${y * y * t}\\,\\text{cm}^2$ 인 두 정사각형 모양의 색종이를 그림과 같이 나란히 붙였다. 붙여서 만든 도형의 둘레의 길이는?`,
            fig: sv.toString(),
            answer: mc(r, `${right}\\,\\text{cm}`, [ks(4 * (x + y), t), ks(2 * x + 4 * y, t), ks(2 * (x + y), t), ks(3 * (x + y), t), ks(4 * x + 2 * y, 2 * t)].map((z) => `${z}\\,\\text{cm}`)),
            steps: [
              `한 변의 길이는 $\\sqrt{${x * x * t}}=${ks(x, t)}$, $\\sqrt{${y * y * t}}=${ks(y, t)}$`,
              `둘레 $=4\\times${ks(x, t)}+2\\times${ks(y, t)}$ (큰 정사각형의 네 변과 작은 정사각형의 두 변, 나머지는 겹치거나 큰 변 위에 놓임)`,
              `$=${ks(4 * x, t)}+${ks(2 * y, t)}=${right}\\,(\\text{cm})$`,
            ],
          };
        }
        const s = r.pick(SQF.slice(0, 7).filter((z) => z !== t));
        const a = r.int(1, 3),
          b = r.int(a + 1, 4),
          w = r.int(1, 4);
        const T = (p: number, q: number) => termsTex([{ c: p, v: `\\sqrt{${t}}` }, { c: q, v: `\\sqrt{${s}}` }]);
        const right = T(4 * (a + b), 4 * w);
        return {
          q: `가로, 세로, 높이가 각각 $\\sqrt{${a * a * t}}\\,\\text{cm}$, $\\sqrt{${b * b * t}}\\,\\text{cm}$, $\\sqrt{${w * w * s}}\\,\\text{cm}$ 인 직육면체 모양의 철사 틀을 만들려고 한다. 필요한 철사의 길이(모든 모서리의 길이의 합)는?`,
          answer: mc(r, `(${right})\\,\\text{cm}`, [T(a + b, w), T(2 * (a + b), 2 * w), T(4 * (a + b), 2 * w), T(8 * (a + b), 4 * w), `${ks(4 * (a + b + w), t)}`].map((z) => `(${z})\\,\\text{cm}`)),
          steps: [
            `${[[a, t], [b, t], [w, s]].filter(([k]) => k > 1).map(([k, z]) => `$\\sqrt{${k * k * z}}=${ks(k, z)}$`).join(', ')}`,
            `직육면체의 모서리는 가로·세로·높이가 각각 $4$ 개씩이므로 $4(${ks(a, t)}+${ks(b, t)}+${ks(w, s)})$`,
            `$=${right}\\,(\\text{cm})$ (근호 안이 다른 $\\sqrt{${t}}$ ${texJosa(String(t), '과', '와')} $\\sqrt{${s}}$ ${texJosa(String(s), '은', '는')} 더할 수 없음)`,
          ],
        };
      },
    },
  ],

  // ───────── 곱셈 공식과 인수분해 ─────────
  'm3a-3': [
    {
      id: 'area-word',
      title: '곱셈 공식·인수분해의 도형 활용',
      gen(r, level) {
        if (level === 1) {
          const a = r.int(1, 9),
            b = r.nonzero(-6, 6);
          const B = b < 0 ? `(x${b})` : `(x+${b})`;
          return {
            q: `가로의 길이가 $(x+${a})\\,\\text{m}$, 세로의 길이가 $${B}\\,\\text{m}$ 인 직사각형 모양 텃밭의 넓이를 $x$ 에 대한 식으로 나타내면? ${b < 0 ? `(단, $x>${-b}$)` : ''}`.trim(),
            answer: mc(r, `(${poly([1, a + b, a * b])})\\,\\text{m}^2`, [poly([1, 0, a * b]), poly([1, a * b, a + b]), poly([1, -(a + b), a * b]), poly([1, a + b, a + b]), poly([1, a - b, -a * b])].map((x) => `(${x})\\,\\text{m}^2`)),
            steps: [`넓이 $=(x+${a})${B}$`, `$=x^2+(${a}${b < 0 ? b : '+' + b})x+${a}\\times${b < 0 ? `(${b})` : b}=${poly([1, a + b, a * b])}\\,(\\text{m}^2)$`],
          };
        }
        if (level === 2) {
          const a = r.int(1, 9);
          if (r.chance(0.5)) {
            return {
              q: `한 변의 길이가 $x\\,\\text{m}$ 인 정사각형 모양의 꽃밭이 있다. 가로의 길이는 $${u(a, 'm')}$ 늘이고 세로의 길이는 $${u(a, 'm')}$ 줄여서 직사각형 모양의 꽃밭을 만들면, 넓이는 처음보다 몇 $\\text{m}^2$ 줄어드나요? (단, $x>${a}$)`,
              answer: { type: 'num', value: a * a, unit: 'm²' },
              steps: [`새 꽃밭의 넓이 $=(x+${a})(x-${a})=x^2-${a * a}$`, `처음 넓이 $x^2$ 보다 $${a * a}\\,\\text{m}^2$ 줄어듭니다.`],
            };
          }
          const b = r.int(1, 9);
          if (a === b) return this.gen(r, level);
          return {
            q: `한 변의 길이가 $x\\,\\text{m}$ 인 정사각형 모양의 꽃밭에서 가로의 길이는 $${u(a, 'm')}$ 늘이고 세로의 길이는 $${u(b, 'm')}$ 줄여서 직사각형 모양의 꽃밭을 만들었다. 새 꽃밭의 넓이를 $x$ 에 대한 식으로 나타내면? (단, $x>${b}$)`,
            answer: mc(r, `(${poly([1, a - b, -a * b])})\\,\\text{m}^2`, [poly([1, 0, -a * b]), poly([1, b - a, -a * b]), poly([1, a + b, -a * b]), poly([1, a - b, a * b]), poly([1, 0, -(a * a)])].map((x) => `(${x})\\,\\text{m}^2`)),
            steps: [`새 꽃밭은 가로 $(x+${a})$, 세로 $(x-${b})$`, `넓이 $=(x+${a})(x-${b})=${poly([1, a - b, -a * b])}\\,(\\text{m}^2)$`],
          };
        }
        const a = r.int(1, 3),
          b = r.int(1, 3),
          p = r.int(1, 6),
          q = r.int(1, 6);
        const area = [a * b, a * q + b * p, p * q];
        const right = poly([2 * (a + b), 2 * (p + q)]);
        return {
          q: `넓이가 $(${poly(area)})\\,\\text{cm}^2$ 인 직사각형 모양의 종이의 세로의 길이가 $${fac(a, p)}\\,\\text{cm}$ 일 때, 이 종이의 둘레의 길이는?`,
          answer: mc(r, `(${right})\\,\\text{cm}`, [poly([a + b, p + q]), poly([2 * b, 2 * q]), poly([4 * b, 4 * q]), poly([2 * (a + b), 2 * Math.abs(p - q) + 1]), poly([2 * (a + b), p * q * 2])].map((x) => `(${x})\\,\\text{cm}`)),
          steps: [`$${poly(area)}=${fac(a, p)}${fac(b, q)}$ ${texJosa(String(q), '으로', '로', true)} 인수분해되므로 가로의 길이는 $${fac(b, q)}\\,\\text{cm}$`, `둘레 $=2\\{${fac(a, p)}+${fac(b, q)}\\}$`, `$=${right}\\,(\\text{cm})$`],
        };
      },
    },
  ],

  // ───────── 이차방정식 ─────────
  'm3a-4': [
    {
      id: 'word-advanced',
      title: '이차방정식 활용 (여러 가지 상황)',
      gen(r, level) {
        if (level === 1) {
          if (r.chance(0.5)) {
            const n = r.int(5, 20);
            const D = (n * (n - 3)) / 2;
            return {
              q: `대각선의 개수가 $${D}$ 인 다각형은 몇 각형인지 구하세요. ($n$ 각형의 대각선의 개수는 $\\frac{n(n-3)}{2}$ 이다.)`,
              answer: { type: 'num', value: n, unit: '각형' },
              steps: [`$\\frac{n(n-3)}{2}=${D}$, $n^2-3n-${2 * D}=0$`, `$(n-${n})(n+${n - 3})=0$ 에서 $n=${n}$ 또는 $n=${3 - n}$`, `$n$ 은 $3$ 이상의 자연수이므로 $n=${n}$, ${n}각형`],
            };
          }
          const n = r.int(5, 25);
          const H = (n * (n - 1)) / 2;
          return {
            q: `어느 모임에 참석한 사람들이 서로 한 번씩 빠짐없이 악수를 하였더니 악수를 모두 $${H}$ 번 하였다. 모임에 참석한 사람은 몇 명인지 구하세요.`,
            answer: { type: 'num', value: n, unit: '명' },
            steps: [`참석한 사람을 $n$ 명이라 하면 악수의 횟수는 $\\frac{n(n-1)}{2}=${H}$`, `$n^2-n-${2 * H}=0$, $(n-${n})(n+${n - 1})=0$`, `$n$ 은 자연수이므로 $n=${n}$ (명)`],
          };
        }
        if (level === 2) {
          const k = r.int(1, 9);
          const a = 1000 * k;
          if (r.chance(0.5)) {
            const x = r.pick([10, 20, 30, 50]);
            const b = (k * (100 + x) ** 2) / 10;
            return {
              q: `한 개에 $${comma(a)}$ 원인 물건의 가격을 $x\\,\\%$ 올리고, 얼마 뒤 다시 $x\\,\\%$ 올렸더니 $${comma(b)}$ 원이 되었다. $x$ 의 값을 구하세요.`,
              answer: { type: 'num', value: x },
              steps: [
                `$${comma(a)}\\left(1+\\frac{x}{100}\\right)^2=${comma(b)}$, $\\left(1+\\frac{x}{100}\\right)^2=${dec(b / a)}$`,
                `$1+\\frac{x}{100}=\\pm${dec((100 + x) / 100)}$ 이므로 $x=${x}$ 또는 $x=${-200 - x}$`,
                `$x>0$ 이므로 $x=${x}$`,
              ],
            };
          }
          const x = r.pick([10, 20, 30, 40, 50]);
          const b = a - (k * x * x) / 10;
          return {
            q: `한 개에 $${comma(a)}$ 원인 물건의 가격을 $x\\,\\%$ 내렸다가 다시 $x\\,\\%$ 올렸더니 $${comma(b)}$ 원이 되었다. $x$ 의 값을 구하세요.`,
            answer: { type: 'num', value: x },
            steps: [
              `$${comma(a)}\\left(1-\\frac{x}{100}\\right)\\left(1+\\frac{x}{100}\\right)=${comma(b)}$`,
              `$1-\\frac{x^2}{10000}=${dec(b / a)}$, $x^2=${x * x}$`,
              `$x>0$ 이므로 $x=${x}$`,
            ],
          };
        }
        const a = r.int(10, 30),
          x = r.int(1, 5);
        let b = r.int(10, 25);
        if (b === a) b = a === 25 ? 24 : a + 1;
        const T = (a + 2 * x) * (b + 2 * x);
        const K = x * (a + b + 2 * x);
        const name = r.pick(NAMES);
        return {
          q: `${ga(name)} 가로 $${u(a, 'cm')}$, 세로 $${u(b, 'cm')}$ 인 직사각형 모양의 사진 둘레에 폭이 일정한 테두리를 둘러 액자를 만들었더니 액자 전체의 넓이가 $${T}\\,\\text{cm}^2$ 가 되었다. 테두리의 폭은 몇 cm 인가요?`,
          answer: { type: 'num', value: x, unit: 'cm' },
          steps: [
            `테두리의 폭을 $x\\,\\text{cm}$ 라 하면 액자는 가로 $(${a}+2x)$, 세로 $(${b}+2x)$ 인 직사각형`,
            `$(${a}+2x)(${b}+2x)=${T}$, $4x^2+${2 * (a + b)}x-${4 * K / 2}=0$, $2x^2+${a + b}x-${K}=0$`,
            `$(x-${x})(2x+${a + b + 2 * x})=0$ 에서 $x=${x}$ 또는 $x=-${new F(a + b + 2 * x, 2).tex()}$`,
            `$x>0$ 이므로 $x=${x}\\,(\\text{cm})$`,
          ],
        };
      },
    },
  ],

  // ───────── 이차함수와 그래프 ─────────
  'm3a-5': [
    {
      id: 'vertex-word',
      title: '포물선의 꼭짓점 활용',
      gen(r, level) {
        if (level === 1) {
          const p = r.int(1, 4),
            q = r.int(4, 20) * 5;
          const what = r.pick(['쏘아 올린 공', '물로켓', '던진 공']);
          return {
            q: `${what}의 $x$ 초 후의 높이를 $y\\,\\text{m}$ 라 하면 $y=-5(x-${p})^2+${q}$ 인 관계가 있다. 가장 높이 올라갔을 때의 높이와 그때의 시각을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: '최고 높이', value: q, unit: 'm' }, { label: '시각', value: p, unit: '초 후' }] },
            steps: [`$y=-5(x-${p})^2+${q}$ 의 그래프는 위로 볼록하고 꼭짓점은 $(${p},\\ ${q})$`, `꼭짓점에서 가장 높으므로 $${p}$ 초 후 $${q}\\,\\text{m}$`],
          };
        }
        if (level === 2) {
          const p = r.int(1, 5),
            c = r.int(0, 20);
          const q = 5 * p * p + c;
          return {
            q: `${c ? `지면으로부터 $${u(c, 'm')}$ 높이에서` : '지면에서'} 위로 던진 공의 $x$ 초 후의 높이를 $y\\,\\text{m}$ 라 하면 $y=${poly([-5, 10 * p, c])}$ 이다. 공이 가장 높이 올라갔을 때의 높이와 그때의 시각을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: '최고 높이', value: q, unit: 'm' }, { label: '시각', value: p, unit: '초 후' }] },
            steps: [`$y=-5(x^2-${2 * p}x)${c ? '+' + c : ''}=-5(x-${p})^2+${5 * p * p}${c ? '+' + c : ''}$`, `$=-5(x-${p})^2+${q}$ 이므로 꼭짓점 $(${p},\\ ${q})$`, `$${p}$ 초 후 최고 높이 $${q}\\,\\text{m}$`],
          };
        }
        const s = r.pick([2, 4, 5, 8, 10]);
        const ms = [2, 3, 4, 5, 6, 8, 10, 12].filter((m) => (m * m) % s === 0 && (m * m) / s <= 40);
        const m = r.pick(ms);
        const h = (m * m) / s;
        const d = r.int(1, m - 1);
        const dep = round((d * d) / s);
        return {
          q: `포물선 모양인 다리 아치의 꼭대기를 원점, 수평 방향을 $x$ 축으로 하는 좌표평면을 잡으면 아치는 이차함수 $y=ax^2$ 의 그래프가 된다. 아치의 양 끝 사이의 폭이 $${u(2 * m, 'm')}$ 이고 양 끝은 꼭대기보다 $${u(h, 'm')}$ 아래에 있을 때, 꼭대기에서 수평 방향으로 $${u(d, 'm')}$ 떨어진 지점의 아치는 꼭대기보다 몇 m 아래에 있나요?`,
          answer: { type: 'num', value: dep, unit: 'm', display: 'dec' },
          steps: [`아치의 한쪽 끝은 점 $(${m},\\ -${h})$ 이므로 $-${h}=a\\times${m}^2$, $a=-${new F(1, s).tex()}$`, `$x=${d}$ 일 때 $y=-${new F(1, s).tex()}\\times${d}^2=-${dec(dep)}$`, `꼭대기보다 $${dec(dep)}\\,\\text{m}$ 아래`],
        };
      },
    },
    {
      id: 'model-word',
      title: '이차함수의 식 세우기',
      gen(r, level) {
        if (level === 1) {
          const ctx = r.pick([
            { a: 5, what: '공을 가만히 떨어뜨렸을 때 $x$ 초 동안 떨어진 거리', unit: 'm', t: '초' },
            { a: r.pick([2, 3, 4]), what: '빗면에서 구슬을 굴렸을 때 $x$ 초 동안 굴러간 거리', unit: 'm', t: '초' },
          ]);
          const x0 = r.int(1, 3),
            x1 = r.int(x0 + 1, 6);
          return {
            q: `${ctx.what}를 $y\\,\\text{${ctx.unit}}$ 라 하면 $y$ 는 $x$ 의 제곱에 정비례한다. $${x0}$ ${ctx.t} 동안 $${u(ctx.a * x0 * x0, ctx.unit)}$ 를 움직였다면, $${x1}$ ${ctx.t} 동안 움직인 거리는 몇 ${ctx.unit} 인가요?`,
            answer: { type: 'num', value: ctx.a * x1 * x1, unit: ctx.unit },
            steps: [`$y=ax^2$ 에 $x=${x0}$, $y=${ctx.a * x0 * x0}$ 대입: $a=${ctx.a}$`, `$y=${ctx.a}x^2$ 에 $x=${x1}$ 대입: $y=${ctx.a}\\times${x1 * x1}=${ctx.a * x1 * x1}$`],
          };
        }
        if (level === 2) {
          const v0 = r.pick([20, 30, 40, 50, 60]);
          const k = r.pick([2, 3, 0.5, 1.5]);
          const v1 = v0 * k;
          if (!Number.isInteger(v1) || v1 > 150) return this.gen(r, level);
          const d0 = r.int(1, 6) * 4;
          const d1 = round(d0 * k * k);
          return {
            q: `자동차의 제동 거리 $y\\,\\text{m}$ 는 속력 $x\\,\\text{km/h}$ 의 제곱에 정비례한다. 시속 $${v0}\\,\\text{km}$ 로 달릴 때 제동 거리가 $${u(d0, 'm')}$ 라면, 제동 거리가 $${u(d1, 'm')}$ 일 때 자동차의 속력은 시속 몇 km 인가요?`,
            answer: { type: 'num', value: v1, unit: 'km/h' },
            steps: [`$y=ax^2$ 에서 $${d0}=a\\times${v0}^2$, $a=${new F(d0, v0 * v0).tex()}$`, `$${dec(d1)}=${new F(d0, v0 * v0).tex()}x^2$, $x^2=${v1 * v1}$`, `$x>0$ 이므로 $x=${v1}$, 시속 $${v1}\\,\\text{km}$`],
          };
        }
        const s = r.int(0, 2),
          T = r.int(s + 2, s + 8);
        const c = 5 * s * T;
        const B = 5 * (T - s);
        const top = new F(T - s, 2);
        return {
          q: `${c ? `높이가 $${u(c, 'm')}$ 인 건물 옥상에서` : '지면에서'} 위로 던진 공의 $x$ 초 후의 높이를 $y\\,\\text{m}$ 라 하면 $y=${poly([-5, B, c])}$ 이다. 공이 가장 높이 올라가는 시각과 공이 땅에 떨어지는 시각을 구하세요.`,
          answer: { type: 'fields', fields: [{ label: '최고점 시각', value: top.value, unit: '초 후', display: 'dec' }, { label: '땅에 떨어지는 시각', value: T, unit: '초 후' }] },
          steps: [
            `$y=-5\\left(x-${top.tex()}\\right)^2+\\cdots$ 꼴이므로 축은 $x=${top.tex()}$, 즉 $${dec(top.value)}$ 초 후에 가장 높습니다.`,
            `땅에 떨어질 때 $y=0$: $${poly([-5, B, c])}=0$, $${poly([1, -(T - s), -s * T])}=0$`,
            `$(x-${T})${s ? `(x+${s})` : 'x'}=0$ 에서 $x>0$ 이므로 $x=${T}$ (초 후)`,
          ],
        };
      },
    },
  ],
};
