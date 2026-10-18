// 중2-1 (뒤): 연립일차방정식 / 일차함수와 그래프 / 일차함수와 일차방정식
import type { ContentMap, ProblemDraft } from '../../core/types';
import type { Rng } from '../../core/rng';
import { F } from '../../core/frac';
import { dec, linTex, termsTex } from '../../core/tex';
import { Plane } from '../../core/fig';
import { NAMES, fig, fp, jo, lin2, texChoices, textChoices } from './util';

/** 연립방정식 TeX */
const sys = (e1: string, e2: string) => `\\begin{cases} ${e1} \\\\ ${e2} \\end{cases}`;
/** ax + by = c */
const eq = (a: number | F, b: number | F, c: number | F) => `${lin2(a, b)} = ${F.of(c).tex()}`;
/** y = ax + b */
const yeq = (a: number | F, b: number | F) => `y = ${linTex(a, b)}`;
const QUAD = ['제1사분면', '제2사분면', '제3사분면', '제4사분면'];

/** 해가 정수 (x0, y0) 인 연립방정식 계수 만들기 (행렬식 ≠ 0) */
function mkSys(r: Rng, x0: number, y0: number, lim = 5, alignY = false) {
  for (;;) {
    const a = r.nonzero(-lim, lim);
    const b = r.nonzero(-lim, lim);
    const c = r.nonzero(-lim, lim);
    const d = alignY ? -b : r.nonzero(-lim, lim);
    if (a * d - b * c === 0) continue;
    return { a, b, c, d, e: a * x0 + b * y0, f: c * x0 + d * y0 };
  }
}

const slopes = [new F(1), new F(2), new F(-1), new F(-2), new F(1, 2), new F(-1, 2), new F(2, 3), new F(-2, 3), new F(3, 2), new F(-3, 2), new F(3), new F(-3), new F(1, 3), new F(-1, 3)];

function lineFig(a: F, b: F, pts: [number, number, string][] = [], extra?: (P: Plane) => void): string {
  const P = new Plane(-6, 6, -6, 6, { w: 240, h: 240 });
  P.fn((x) => a.value * x + b.value);
  extra?.(P);
  for (const [x, y, l] of pts) P.point(x, y, l);
  return fig(P);
}

/** y=mx+n (m≠0, n≠0) 이 지나지 않는 사분면 */
function missQuad(m: number, n: number): string {
  if (m > 0) return n > 0 ? QUAD[3] : QUAD[1];
  return n > 0 ? QUAD[2] : QUAD[0];
}

export const m2a2: ContentMap = {
  // ═══════════════ m2a-4 연립일차방정식 ═══════════════
  'm2a-4': {
    concepts: [
      {
        title: '미지수가 2개인 일차방정식',
        body: '$ax + by + c = 0$ ($a \\ne 0$, $b \\ne 0$) 꼴의 방정식. 이 방정식을 참이 되게 하는 순서쌍 $(x, y)$ 가 **해**예요.\n해는 보통 무수히 많지만, "$x$, $y$ 가 자연수" 처럼 조건이 있으면 개수가 정해져요.\n예: $x + 2y = 7$ 의 자연수 해는 $(5, 1), (3, 2), (1, 3)$',
      },
      {
        title: '연립방정식과 그 해',
        body: '미지수가 2개인 일차방정식 두 개를 한 쌍으로 묶은 것을 **연립일차방정식**이라 해요.\n두 방정식을 **동시에** 만족하는 $(x, y)$ 가 연립방정식의 해예요.\n해가 주어지면 두 방정식에 각각 대입해서 상수를 구할 수 있어요.',
      },
      {
        title: '가감법',
        body: '두 방정식을 변끼리 더하거나 빼서 한 미지수를 없애는 방법.\n$$\\begin{cases} 2x + y = 7 \\\\ x - y = 2 \\end{cases} \\Rightarrow 3x = 9,\\ x = 3,\\ y = 1$$\n계수의 절댓값이 다르면 적당한 수를 곱해서 맞춰요.',
      },
      {
        title: '대입법',
        body: '한 방정식을 $y = (x \\text{의 식})$ 또는 $x = (y \\text{의 식})$ 으로 바꾸어 다른 방정식에 대입하는 방법.\n복잡한 연립방정식은 먼저 정리해요: 괄호는 풀고, 소수·분수 계수는 10의 거듭제곱이나 최소공배수를 곱해 정수로.\n$A = B = C$ 꼴은 $\\begin{cases} A = B \\\\ A = C \\end{cases}$ 처럼 둘로 나눠요.',
      },
      {
        title: '해가 특수한 연립방정식과 활용',
        body: '$\\begin{cases} ax + by = c \\\\ a\'x + b\'y = c\' \\end{cases}$ 에서\n- $\\frac{a}{a\'} = \\frac{b}{b\'} = \\frac{c}{c\'}$ → **해가 무수히 많다**\n- $\\frac{a}{a\'} = \\frac{b}{b\'} \\ne \\frac{c}{c\'}$ → **해가 없다**\n**활용**: 미지수 2개를 정하고, 조건 2개로 방정식 2개를 세워요 (개수·가격, 다리 수, 자릿수, 증가·감소, 거리·속력).',
      },
    ],
    skills: [
      {
        id: 'solution',
        title: '미지수가 2개인 일차방정식의 해',
        gen(r, level) {
          if (level === 1) {
            const [a, b] = [r.nonzero(-5, 5), r.nonzero(-5, 5)];
            const [x0, y0] = [r.int(-5, 5), r.int(-6, 6)];
            const c = a * x0 + b * y0;
            return {
              q: `순서쌍 $(${x0}, k)$ 가 일차방정식 $${eq(a, b, c)}$ 의 해일 때, $k$ 의 값을 구하세요.`,
              answer: { type: 'num', value: y0 },
              steps: [`$x = ${x0}$, $y = k$ 를 대입: $${a} \\times ${fp(x0)} ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}k = ${c}$`, `$${termsTex([{ c: b, v: 'k' }])} = ${c - a * x0}$, $k = ${y0}$`],
            };
          }
          if (level === 2) {
            for (;;) {
              const [a, b] = [r.int(1, 5), r.int(1, 5)];
              const c = r.int(8, 30);
              const sols: string[] = [];
              for (let x = 1; a * x < c; x++) if ((c - a * x) % b === 0) sols.push(`(${x}, ${(c - a * x) / b})`);
              if (sols.length < 1 || sols.length > 8) continue;
              return {
                q: `$x$, $y$ 가 자연수일 때, 일차방정식 $${eq(a, b, c)}$ 의 해의 개수를 구하세요.`,
                answer: { type: 'num', value: sols.length, unit: '개' },
                steps: [`$x = 1, 2, 3, \\ldots$ 을 차례로 대입하여 $y$ 가 자연수인 경우를 찾습니다.`, `$${sols.join(', ')}$`, `$${sols.length}$ 개`],
              };
            }
          }
          const [a, b] = [r.nonzero(-4, 4), r.nonzero(-4, 4)];
          const [p, q] = [r.int(-4, 4), r.int(-4, 4)];
          const t = r.nonzero(-2, 2);
          const c = a * p + b * q;
          if (c === 0) return this.gen(r, level);
          const [rr, s] = [p + b * t, q - a * t];
          return {
            q: `두 순서쌍 $(${p}, ${q})$, $(${rr}, ${s})$ 가 모두 일차방정식 $ax + by = ${c}$ 의 해일 때, 상수 $a$, $b$ 의 값을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'a', value: a }, { label: 'b', value: b }] },
            steps: [`대입하면 $${sys(eq(p, q, c).replace(/x/, 'a').replace(/y/, 'b'), eq(rr, s, c).replace(/x/, 'a').replace(/y/, 'b'))}$`, `연립하여 풀면 $a = ${a}$, $b = ${b}$`],
          };
        },
      },
      {
        id: 'solve',
        title: '연립방정식의 풀이',
        gen(r, level) {
          const x0 = r.int(-6, 6);
          const y0 = r.int(-6, 6);
          const ans = { type: 'fields' as const, fields: [{ label: 'x', value: x0 }, { label: 'y', value: y0 }] };
          if (level === 1) {
            if (r.chance(0.5)) {
              const s = mkSys(r, x0, y0, 5, true);
              return {
                q: `다음 연립방정식을 푸세요.\n$$${sys(eq(s.a, s.b, s.e), eq(s.c, s.d, s.f))}$$`,
                answer: ans,
                steps: [`두 식을 더하면 $y$ 가 없어집니다: $${termsTex([{ c: s.a + s.c, v: 'x' }])} = ${s.e + s.f}$`, `$x = ${x0}$`, `대입하면 $y = ${y0}$`],
                hint: '$y$ 의 계수의 부호가 반대예요.',
              };
            }
            const m = r.nonzero(-4, 4);
            const n = y0 - m * x0;
            const [a, b] = [r.nonzero(-5, 5), r.nonzero(-5, 5)];
            if (a + b * m === 0) return this.gen(r, level);
            const c = a * x0 + b * y0;
            return {
              q: `다음 연립방정식을 푸세요.\n$$${sys(yeq(m, n), eq(a, b, c))}$$`,
              answer: ans,
              steps: [`첫째 식을 둘째 식에 대입: $${a === 1 ? '' : a === -1 ? '-' : a}x ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}(${linTex(m, n)}) = ${c}$`, a + b * m === 1 ? `$x = ${x0}$` : `$${termsTex([{ c: a + b * m, v: 'x' }])} = ${c - b * n}$, $x = ${x0}$`, `대입하면 $y = ${m} \\times ${fp(x0)} ${n === 0 ? '' : (n > 0 ? '+ ' : '- ') + Math.abs(n)} = ${y0}$`],
            };
          }
          if (level === 2) {
            const s = mkSys(r, x0, y0, 6);
            return {
              q: `다음 연립방정식을 푸세요.\n$$${sys(eq(s.a, s.b, s.e), eq(s.c, s.d, s.f))}$$`,
              answer: ans,
              steps: [`$y$ 의 계수를 맞추어 빼면 $${termsTex([{ c: s.a * s.d - s.b * s.c, v: 'x' }])} = ${s.e * s.d - s.b * s.f}$`, `$x = ${x0}$`, `대입하면 $y = ${y0}$`],
              hint: '한 미지수의 계수의 절댓값을 같게 만드세요.',
            };
          }
          const t = r.int(0, 2);
          if (t === 0) {
            // 소수 계수
            const s = mkSys(r, x0, y0, 9);
            const D = (n: number) => dec(n / 10);
            return {
              q: `다음 연립방정식을 푸세요.\n$$${sys(`${D(s.a)}x ${s.b < 0 ? '-' : '+'} ${D(Math.abs(s.b))}y = ${D(s.e)}`, eq(s.c, s.d, s.f))}$$`,
              answer: ans,
              steps: [`첫째 식의 양변에 $10$ 을 곱하면 $${eq(s.a, s.b, s.e)}$`, `연립하여 풀면 $x = ${x0}$, $y = ${y0}$`],
              hint: '소수 계수는 10을 곱해 정수로 만드세요.',
            };
          }
          if (t === 1) {
            // 분수 계수
            const [p, q] = r.pick([
              [2, 3],
              [3, 4],
              [2, 5],
              [3, 2],
              [4, 3],
              [6, 4],
            ]);
            const c1 = new F(x0, p).add(new F(y0, q));
            const s = mkSys(r, x0, y0, 5);
            const L = (p * q) / gcdN(p, q);
            return {
              q: `다음 연립방정식을 푸세요.\n$$${sys(`\\frac{x}{${p}} + \\frac{y}{${q}} = ${c1.tex()}`, eq(s.c, s.d, s.f))}$$`,
              answer: ans,
              steps: [`첫째 식의 양변에 $${L}$ 를 곱하면 $${eq(L / p, L / q, c1.mul(L))}$`, `연립하여 풀면 $x = ${x0}$, $y = ${y0}$`],
              hint: '분모의 최소공배수를 곱하세요.',
            };
          }
          // A = B = C 꼴
          const [a, b, c, d] = [r.nonzero(-4, 4), r.nonzero(-4, 4), r.nonzero(-4, 4), r.nonzero(-4, 4)];
          if (a * d - b * c === 0) return this.gen(r, level);
          const K = r.int(-9, 9);
          const e1 = a * x0 + b * y0 - K;
          const e2 = c * x0 + d * y0 - K;
          const A = termsTex([
            { c: a, v: 'x' },
            { c: b, v: 'y' },
            { c: -e1, v: '' },
          ]);
          const B = termsTex([
            { c: c, v: 'x' },
            { c: d, v: 'y' },
            { c: -e2, v: '' },
          ]);
          return {
            q: `다음 방정식을 푸세요.\n$$${A} = ${B} = ${K}$$`,
            answer: ans,
            steps: [`$${sys(`${A} = ${K}`, `${B} = ${K}`)}$ 으로 나누어 풉니다.`, `$${sys(eq(a, b, K + e1), eq(c, d, K + e2))}$`, `$x = ${x0}$, $y = ${y0}$`],
            hint: '$A = B = C$ 는 $A = C$, $B = C$ 로 나누세요.',
          };
        },
      },
      {
        id: 'param',
        title: '해가 주어진 연립방정식',
        gen(r, level) {
          const p = r.nonzero(-4, 4);
          const q = r.nonzero(-4, 4);
          if (level === 1) {
            const a = r.nonzero(-5, 5);
            const [b, c, d] = [r.nonzero(-4, 4), r.nonzero(-4, 4), r.nonzero(-4, 4)];
            const e1 = a * p + b * q;
            const e2 = c * p + d * q;
            return {
              q: `연립방정식 $${sys(`ax ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}y = ${e1}`, eq(c, d, e2))}$ 의 해가 $x = ${p}$, $y = ${q}$ 일 때, 상수 $a$ 의 값을 구하세요.`,
              answer: { type: 'num', value: a },
              steps: [`$x = ${p}$, $y = ${q}$ 를 첫째 식에 대입: $${termsTex([{ c: p, v: 'a' }])} ${b * q < 0 ? '-' : '+'} ${Math.abs(b * q)} = ${e1}$`, p === 1 ? `$a = ${a}$` : `$${termsTex([{ c: p, v: 'a' }])} = ${e1 - b * q}$, $a = ${a}$`],
            };
          }
          if (level === 2) {
            if (p * p === q * q) return this.gen(r, level);
            for (;;) {
              const a = r.nonzero(-5, 5);
              const b = r.nonzero(-5, 5);
              if (a === b) continue;
              const e1 = a * p + b * q;
              const e2 = b * p + a * q;
              return {
                q: `연립방정식 $${sys(`ax + by = ${e1}`, `bx + ay = ${e2}`)}$ 의 해가 $x = ${p}$, $y = ${q}$ 일 때, 상수 $a$, $b$ 의 값을 구하세요.`,
                answer: { type: 'fields', fields: [{ label: 'a', value: a }, { label: 'b', value: b }] },
                steps: [`대입하면 $${sys(`${termsTex([{ c: p, v: 'a' }, { c: q, v: 'b' }])} = ${e1}`, `${termsTex([{ c: p, v: 'b' }, { c: q, v: 'a' }])} = ${e2}`)}$`, `$a$, $b$ 에 대한 연립방정식을 풀면 $a = ${a}$, $b = ${b}$`],
                hint: '해를 대입하면 $a$, $b$ 에 대한 연립방정식이 돼요.',
              };
            }
          }
          for (;;) {
            const [c1, d1, c2, d2] = [r.nonzero(-3, 3), r.nonzero(-3, 3), r.nonzero(-3, 3), r.nonzero(-3, 3)];
            if (c1 * d2 - d1 * c2 === 0) continue;
            const a = r.nonzero(-4, 4);
            const b = r.nonzero(-4, 4);
            const k1 = r.nonzero(-3, 3);
            const k2 = r.nonzero(-3, 3);
            const E1 = `ax ${k1 < 0 ? '-' : '+'} ${Math.abs(k1) === 1 ? '' : Math.abs(k1)}y = ${a * p + k1 * q}`;
            const E2 = eq(c1, d1, c1 * p + d1 * q);
            const E3 = `${k2 === 1 ? '' : k2 === -1 ? '-' : k2}x + by = ${k2 * p + b * q}`;
            const E4 = eq(c2, d2, c2 * p + d2 * q);
            return {
              q: `두 연립방정식 $${sys(E1, E2)}$, $${sys(E3, E4)}$ 의 해가 같을 때, 상수 $a$, $b$ 의 값을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'a', value: a }, { label: 'b', value: b }] },
              steps: [`상수가 없는 두 식을 연립: $${sys(E2, E4)}$ → $x = ${p}$, $y = ${q}$`, `$${E1}$ 에 대입하면 $a = ${a}$`, `$${E3}$ 에 대입하면 $b = ${b}$`],
              hint: '미지수가 없는 두 방정식끼리 먼저 푸세요.',
            };
          }
        },
      },
      {
        id: 'special',
        title: '해가 특수한 연립방정식',
        gen(r, level): ProblemDraft {
          const [a1, b1] = [r.nonzero(-4, 4), r.nonzero(-4, 4)];
          const c1 = r.nonzero(-6, 6);
          const k = r.pick([2, 3, -2, -3, 4]);
          if (level === 1) {
            const none = sys(eq(a1, b1, c1), eq(k * a1, k * b1, k * c1 + r.nonzero(-3, 3)));
            const inf = sys(eq(a1, b1, c1), eq(k * a1, k * b1, k * c1));
            const uniq = () => {
              const s = mkSys(r, r.int(-3, 3), r.int(-3, 3), 4);
              return sys(eq(s.a, s.b, s.e), eq(s.c, s.d, s.f));
            };
            const wantNone = r.chance(0.5);
            const ans = wantNone ? none : inf;
            return {
              q: `다음 연립방정식 중 해가 ${wantNone ? '**없는**' : '**무수히 많은**'} 것은?`,
              answer: texChoices(r, ans, [wantNone ? inf : none, uniq(), uniq(), uniq()]),
              steps: [`$${ans}$`, wantNone ? `둘째 식은 첫째 식의 $x$, $y$ 계수에 각각 $${k}$ 를 곱한 것과 같지만 상수항은 다르므로 해가 없습니다.` : `둘째 식은 첫째 식의 양변에 $${k}$ 를 곱한 것과 같으므로 해가 무수히 많습니다.`],
              hint: '두 식의 계수의 비를 비교하세요.',
            };
          }
          if (level === 2) {
            const wantNone = r.chance(0.5);
            const c2 = wantNone ? k * c1 + r.nonzero(-3, 3) : k * c1;
            return {
              q: `연립방정식 $${sys(eq(a1, b1, c1), `ax ${k * b1 < 0 ? '-' : '+'} ${Math.abs(k * b1) === 1 ? '' : Math.abs(k * b1)}y = ${c2}`)}$ 의 해가 ${wantNone ? '없을' : '무수히 많을'} 때, 상수 $a$ 의 값을 구하세요.`,
              answer: { type: 'num', value: k * a1 },
              steps: [`$y$ 의 계수의 비: ${b1 === 1 ? `$${new F(1, k).tex()}$` : `$\\frac{${b1}}{${k * b1}} = ${new F(1, k).tex()}$`}`, wantNone ? `해가 없으려면 $\\frac{${a1}}{a} = ${new F(1, k).tex()}$ (상수항의 비 $\\frac{${c1}}{${c2}}$ 와는 다름)` : `해가 무수히 많으려면 $\\frac{${a1}}{a} = ${new F(1, k).tex()}$ (상수항의 비도 $\\frac{${c1}}{${c2}} = ${new F(1, k).tex()}$)`, `$a = ${k * a1}$`],
            };
          }
          const kk = r.pick([2, 3, -2, -3]);
          const A1 = r.pick([6, -6]);
          const B2 = r.pick([2, -2, 4]);
          const C1 = r.nonzero(-6, 6);
          // ax + B2 y = C1, A1 x + by = kk C1  →  a = A1/kk, b = B2*kk
          return {
            q: `연립방정식 $${sys(`ax ${B2 < 0 ? '-' : '+'} ${Math.abs(B2)}y = ${C1}`, `${A1}x + by = ${kk * C1}`)}$ 의 해가 무수히 많을 때, 상수 $a$, $b$ 의 값을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'a', value: A1 / kk }, { label: 'b', value: B2 * kk }] },
            steps: [`상수항의 비: $\\frac{${C1}}{${kk * C1}} = ${new F(1, kk).tex()}$`, `$\\frac{a}{${A1}} = \\frac{${B2}}{b} = ${new F(1, kk).tex()}$`, `$a = ${A1 / kk}$, $b = ${B2 * kk}$`],
          };
        },
      },
      {
        id: 'word',
        title: '연립방정식의 활용',
        gen(r, level) {
          const name = r.pick(NAMES);
          if (level === 1) {
            const [pa, pb] = r.sample([500, 600, 700, 800, 1000, 1200, 1500], 2).sort((x, y) => x - y);
            const [x, y] = [r.int(2, 12), r.int(2, 12)];
            const [A, B] = r.pick([
              ['사과', '배'],
              ['연필', '볼펜'],
              ['초콜릿', '사탕 봉지'],
              ['어린이 입장권', '어른 입장권'],
            ]);
            const askB = r.chance(0.5);
            return {
              q: `${name}는 한 개에 $${pa}$ 원인 ${jo(A, '과/와')} 한 개에 $${pb}$ 원인 ${jo(B, '을/를')} 합하여 $${x + y}$ 개 사고 $${pa * x + pb * y}$ 원을 냈습니다. ${jo(askB ? B : A, '은/는')} 몇 개 샀는지 구하세요.`,
              answer: { type: 'num', value: askB ? y : x, unit: '개' },
              steps: [`${jo(A, '을/를')} $x$ 개, ${jo(B, '을/를')} $y$ 개라 하면 $${sys(`x + y = ${x + y}`, `${pa}x + ${pb}y = ${pa * x + pb * y}`)}$`, `풀면 $x = ${x}$, $y = ${y}$`, `${askB ? B : A}: $${askB ? y : x}$ 개`],
            };
          }
          if (level === 2) {
            if (r.chance(0.5)) {
              const [c, t] = [r.int(3, 20), r.int(3, 20)];
              return {
                q: `닭과 토끼가 모두 $${c + t}$ 마리 있고, 다리 수의 합은 $${2 * c + 4 * t}$ 개입니다. 토끼는 몇 마리인지 구하세요.`,
                answer: { type: 'num', value: t, unit: '마리' },
                steps: [`닭 $x$ 마리, 토끼 $y$ 마리라 하면 $${sys(`x + y = ${c + t}`, `2x + 4y = ${2 * c + 4 * t}`)}$`, `둘째 식 − 첫째 식 × 2: $2y = ${2 * t}$`, `$y = ${t}$`],
              };
            }
            const a = r.int(1, 8);
            const b = r.int(a + 1, 9);
            return {
              q: `두 자리 자연수가 있습니다. 각 자리의 숫자의 합은 $${a + b}$ 이고, 십의 자리 숫자와 일의 자리 숫자를 바꾼 수는 처음 수보다 $${9 * (b - a)}$ 만큼 큽니다. 처음 수를 구하세요.`,
              answer: { type: 'num', value: 10 * a + b },
              steps: [`십의 자리 숫자를 $x$, 일의 자리 숫자를 $y$ 라 하면 $${sys(`x + y = ${a + b}`, `(10y + x) - (10x + y) = ${9 * (b - a)}`)}$`, `둘째 식: $y - x = ${b - a}$`, `$x = ${a}$, $y = ${b}$ 이므로 처음 수는 $${10 * a + b}$`],
            };
          }
          if (r.chance(0.5)) {
            for (;;) {
              const m = r.int(10, 30) * 20;
              const w = r.int(10, 30) * 20;
              const p = r.pick([5, 10, 15, 20]);
              const q = r.pick([5, 10, 15]);
              const d = (m * p) / 100 - (w * q) / 100;
              if (d === 0) continue;
              const mNew = m + (m * p) / 100;
              return {
                q: `어느 중학교의 작년 학생 수는 $${m + w}$ 명이었습니다. 올해는 작년보다 남학생이 $${p}$% 늘고 여학생이 $${q}$% 줄어서 전체 학생 수가 $${Math.abs(d)}$ 명 ${d > 0 ? '늘었' : '줄었'}습니다. 올해 남학생 수를 구하세요.`,
                answer: { type: 'num', value: mNew, unit: '명' },
                steps: [`작년 남학생 $x$ 명, 여학생 $y$ 명이라 하면 $${sys(`x + y = ${m + w}`, `\\frac{${p}}{100}x - \\frac{${q}}{100}y = ${d}`)}$`, `풀면 $x = ${m}$, $y = ${w}$`, `올해 남학생: $${m} + ${(m * p) / 100} = ${mNew}$ 명`],
                hint: '작년 학생 수를 미지수로 놓으세요.',
              };
            }
          }
          for (;;) {
            const a = r.int(2, 5);
            const b = a + r.int(2, 8);
            const x = a * r.int(1, 4);
            const y = b * r.int(1, 3);
            const t = x / a + y / b;
            return {
              q: `${name}는 $${x + y}$ km 떨어진 곳을 가는데, 처음에는 시속 $${a}$ km 로 걷다가 도중에 시속 $${b}$ km 로 달려서 모두 $${t}$ 시간이 걸렸습니다. 걸어간 거리를 구하세요.`,
              answer: { type: 'num', value: x, unit: 'km' },
              steps: [`걸어간 거리 $x$ km, 달린 거리 $y$ km 라 하면 $${sys(`x + y = ${x + y}`, `\\frac{x}{${a}} + \\frac{y}{${b}} = ${t}`)}$`, `둘째 식에 $${(a * b) / gcdN(a, b)}$ 를 곱하면 $${eq(b / gcdN(a, b), a / gcdN(a, b), (t * a * b) / gcdN(a, b))}$`, `풀면 $x = ${x}$, $y = ${y}$`],
            };
          }
        },
      },
    ],
  },

  // ═══════════════ m2a-5 일차함수와 그래프 ═══════════════
  'm2a-5': {
    concepts: [
      {
        title: '함수와 함숫값',
        body: '$x$ 의 값이 정해지면 $y$ 의 값이 **오직 하나씩** 정해질 때, $y$ 는 $x$ 의 **함수**라 하고 $y = f(x)$ 로 나타내요.\n$f(a)$ 는 $x = a$ 일 때의 함숫값이에요.\n예: $f(x) = 2x - 1$ 이면 $f(3) = 5$\n중1 의 정비례 $y = ax$, 반비례 $y = \\frac{a}{x}$ 도 함수예요.',
      },
      {
        title: '일차함수와 평행이동',
        body: '$y = ax + b$ ($a \\ne 0$) 꼴로 나타나는 함수를 **일차함수**라 해요.\n$y = ax + b$ 의 그래프는 $y = ax$ 의 그래프를 **$y$축의 방향으로 $b$ 만큼 평행이동**한 직선이에요.\n$y = ax + b$ 를 $y$축 방향으로 $k$ 만큼 평행이동 → $y = ax + b + k$',
      },
      {
        title: '절편과 기울기',
        body: '- **$x$절편**: 그래프가 $x$축과 만나는 점의 $x$좌표 ($y = 0$ 을 대입) → $-\\frac{b}{a}$\n- **$y$절편**: 그래프가 $y$축과 만나는 점의 $y$좌표 → $b$\n- **기울기**: $\\dfrac{(y \\text{의 값의 증가량})}{(x \\text{의 값의 증가량})} = a$\n두 점 $(x_1, y_1)$, $(x_2, y_2)$ 를 지나면 기울기는 $\\dfrac{y_2 - y_1}{x_2 - x_1}$',
      },
      {
        title: '일차함수 그래프의 성질',
        body: '$y = ax + b$ 에서\n- $a > 0$: 오른쪽 위로 향하는 직선 ($x$ 가 증가하면 $y$ 도 증가)\n- $a < 0$: 오른쪽 아래로 향하는 직선\n- $b > 0$: $y$축과 양의 부분에서, $b < 0$: 음의 부분에서 만나요.\n- $|a|$ 가 클수록 $y$축에 가까워요.\n- 기울기가 같고 $y$절편이 다르면 **평행**, 둘 다 같으면 **일치**',
      },
      {
        title: '일차함수의 식 구하기',
        body: '- 기울기 $a$ 와 $y$절편 $b$ → $y = ax + b$\n- 기울기 $a$ 와 한 점 $(p, q)$ → $y = ax + b$ 에 대입해 $b$ 구하기\n- 두 점 → 먼저 기울기를 구하고, 한 점을 대입\n- $x$절편 $m$, $y$절편 $n$ → 두 점 $(m, 0)$, $(0, n)$ 을 지나므로 기울기 $-\\frac{n}{m}$',
      },
    ],
    skills: [
      {
        id: 'value',
        title: '함숫값',
        gen(r, level) {
          const a = r.nonzero(-5, 5);
          const b = r.int(-9, 9);
          const f = (x: number) => a * x + b;
          if (level === 1) {
            const p = r.int(-5, 5);
            const q = r.int(-5, 5);
            if (r.chance(0.5))
              return {
                q: `일차함수 $f(x) = ${linTex(a, b)}$ 에 대하여 $f(${p})$ 의 값을 구하세요.`,
                answer: { type: 'num', value: f(p) },
                steps: [`$f(${p}) = ${a} \\times ${fp(p)} ${b === 0 ? '' : (b > 0 ? '+ ' : '- ') + Math.abs(b)} = ${f(p)}$`],
              };
            return {
              q: `일차함수 $f(x) = ${linTex(a, b)}$ 에 대하여 $f(${p}) + f(${q})$ 의 값을 구하세요.`,
              answer: { type: 'num', value: f(p) + f(q) },
              steps: [`$f(${p}) = ${f(p)}$, $f(${q}) = ${f(q)}$`, `$f(${p}) + f(${q}) = ${f(p) + f(q)}$`],
            };
          }
          if (level === 2) {
            const p = r.nonzero(-4, 4);
            let s = r.int(-5, 5);
            if (s === p) s = p === 5 ? -5 : p + 1; // 이미 주어진 함숫값을 다시 묻지 않게
            return {
              q: `일차함수 $f(x) = ax${b === 0 ? '' : ` ${b < 0 ? '-' : '+'} ${Math.abs(b)}`}$ 에 대하여 $f(${p}) = ${f(p)}$ 일 때, $f(${s})$ 의 값을 구하세요.`,
              answer: { type: 'num', value: f(s) },
              steps: [`$f(${p}) = ${p}a ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${f(p)}$ 에서 $a = ${a}$`, `$f(${s}) = ${a} \\times ${fp(s)} ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${f(s)}$`],
            };
          }
          const p = r.int(-4, 4);
          let q = r.int(-4, 4);
          if (q === p) q = p + 2;
          let s = r.int(-6, 6);
          while (s === p || s === q) s = s >= 6 ? -6 : s + 1; // 주어진 함숫값을 다시 묻지 않게
          return {
            q: `일차함수 $f(x) = ax + b$ 에 대하여 $f(${p}) = ${f(p)}$, $f(${q}) = ${f(q)}$ 일 때, $f(${s})$ 의 값을 구하세요.`,
            answer: { type: 'num', value: f(s) },
            steps: [`$${sys(`${p === 0 ? '' : (p === 1 ? '' : p === -1 ? '-' : p) + 'a + '}b = ${f(p)}`, `${q === 0 ? '' : (q === 1 ? '' : q === -1 ? '-' : q) + 'a + '}b = ${f(q)}`)}$`.replace(/\+ b/g, '+ b'), `연립하여 풀면 $a = ${a}$, $b = ${b}$`, `$f(${s}) = ${f(s)}$`],
          };
        },
      },
      {
        id: 'intercept',
        title: '기울기와 절편',
        gen(r, level) {
          if (level === 1) {
            const a = r.pick(slopes);
            const b = new F(r.int(-8, 8), r.pick([1, 1, 2]));
            return {
              q: `일차함수 $${yeq(a, b)}$ 의 그래프의 기울기와 $y$절편을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: '기울기', value: a.value, display: 'frac' as const }, { label: 'y절편', value: b.value, display: 'frac' as const }] },
              steps: [`$y = ax + b$ 에서 기울기는 $a$, $y$절편은 $b$`, `기울기 $${a.tex()}$, $y$절편 $${b.tex()}$`],
            };
          }
          const a = r.pick(slopes);
          const p = r.nonzero(-5, 5) * a.d;
          const b = a.mul(-p);
          if (Math.abs(b.value) > 12 || Math.abs(p) > 8) return this.gen(r, level);
          if (level === 2) {
            return {
              q: `일차함수 $${yeq(a, b)}$ 의 그래프의 $x$절편을 구하세요.`,
              answer: { type: 'num', value: p },
              steps: [`$y = 0$ 을 대입: $0 = ${linTex(a, b)}$`, `$x = ${p}$`],
            };
          }
          const area = new F(Math.abs(p * b.n), 2 * b.d);
          const show = Math.abs(p) <= 6 && Math.abs(b.value) <= 6;
          return {
            q: `일차함수 $${yeq(a, b)}$ 의 그래프와 $x$축, $y$축으로 둘러싸인 삼각형의 넓이를 구하세요.`,
            fig: show ? lineFig(a, b, [], (P) => P.polygon([[0, 0], [p, 0], [0, b.value]], { fill: true })) : undefined,
            answer: { type: 'num', value: area.value, display: 'frac' },
            steps: [`$x$절편: $${p}$, $y$절편: $${b.tex()}$`, `넓이: $\\frac{1}{2} \\times ${Math.abs(p)} \\times ${b.n < 0 ? b.neg().tex() : b.tex()} = ${area.tex()}$`],
          };
        },
      },
      {
        id: 'slope',
        title: '기울기 구하기',
        gen(r, level) {
          if (level === 1) {
            const [x1, y1] = [r.int(-5, 5), r.int(-5, 5)];
            let x2 = r.int(-5, 5);
            if (x2 === x1) x2 = x1 + r.pick([1, 2, 3]);
            const y2 = r.int(-6, 6);
            const m = new F(y2 - y1, x2 - x1);
            if (m.n === 0) return this.gen(r, level);
            return {
              q: `두 점 $(${x1}, ${y1})$, $(${x2}, ${y2})$ 를 지나는 일차함수의 그래프의 기울기를 구하세요.`,
              answer: { type: 'num', value: m.value, display: 'frac' },
              steps: [`$\\frac{${y2} - ${fp(y1)}}{${x2} - ${fp(x1)}} = \\frac{${y2 - y1}}{${x2 - x1}} = ${m.tex()}$`],
            };
          }
          if (level === 2) {
            const dx = r.int(2, 6);
            const dy = r.nonzero(-12, 12);
            const m = new F(dy, dx);
            if (r.chance(0.5)) {
              return {
                q: `일차함수 $y = f(x)$ 에서 $x$ 의 값이 $${dx}$ 만큼 증가할 때 $y$ 의 값은 $${Math.abs(dy)}$ 만큼 ${dy > 0 ? '증가' : '감소'}합니다. 이 그래프의 기울기를 구하세요.`,
                answer: { type: 'num', value: m.value, display: 'frac' },
                steps: [`기울기 $= \\frac{(y \\text{의 증가량})}{(x \\text{의 증가량})} = \\frac{${dy}}{${dx}} = ${m.tex()}$`],
              };
            }
            const k = r.int(2, 4) * dx;
            return {
              q: `일차함수 $y = ${linTex(m, r.int(-5, 5))}$ 에서 $x$ 의 값이 $${k}$ 만큼 증가할 때, $y$ 의 값의 증가량을 구하세요.`,
              answer: { type: 'num', value: m.mul(k).value },
              steps: [`(y의 증가량) = (기울기) × (x의 증가량)`.replace('(y의 증가량) = (기울기) × (x의 증가량)', '($y$ 의 증가량) = (기울기) × ($x$ 의 증가량)'), `$${m.tex()} \\times ${k} = ${m.mul(k).tex()}$`],
            };
          }
          const m = r.pick(slopes.filter((s) => s.d <= 2));
          const x1 = r.int(-4, 2);
          const y1 = r.int(-4, 4);
          const dx1 = m.d * r.int(1, 2);
          const dx2 = m.d * r.int(1, 2) + dx1;
          const [x2, y2] = [x1 + dx1, y1 + m.mul(dx1).value];
          const [x3, y3] = [x1 + dx2, y1 + m.mul(dx2).value];
          return {
            q: `세 점 $(${x1}, ${y1})$, $(${x2}, k)$, $(${x3}, ${y3})$ 가 한 직선 위에 있을 때, $k$ 의 값을 구하세요.`,
            answer: { type: 'num', value: y2 },
            steps: [`두 점 $(${x1}, ${y1})$, $(${x3}, ${y3})$ 를 지나는 직선의 기울기: $\\frac{${y3 - y1}}{${x3 - x1}} = ${m.tex()}$`, `$(${x1}, ${y1})$, $(${x2}, k)$ 의 기울기도 같아야 하므로 $\\frac{k - ${fp(y1)}}{${x2 - x1}} = ${m.tex()}$`, `$k = ${y2}$`],
            hint: '어느 두 점을 골라도 기울기가 같아요.',
          };
        },
      },
      {
        id: 'translate',
        title: '평행이동',
        gen(r, level) {
          const a = r.pick(slopes.filter((s) => s.d === 1));
          const b = r.int(-6, 6);
          const k = r.nonzero(-6, 6);
          if (level === 1) {
            const ans = yeq(a, b + k);
            return {
              q: `일차함수 $${yeq(a, b)}$ 의 그래프를 $y$축의 방향으로 $${k}$ 만큼 평행이동한 그래프의 식은?`,
              answer: texChoices(r, ans, [yeq(a, b - k), yeq(a.add(k), b), yeq(a, k), yeq(a.neg(), b + k), yeq(new F(k), b)].filter((w) => w !== ans)),
              steps: [`$y$축 방향으로 $${k}$ 만큼 평행이동하면 $y$절편에 $${k}$ 를 더합니다.`, `$${ans}$`],
            };
          }
          const p = r.int(-4, 4);
          const q = a.value * p + b + k;
          if (level === 2) {
            return {
              q: `일차함수 $${yeq(a, b)}$ 의 그래프를 $y$축의 방향으로 $m$ 만큼 평행이동하면 점 $(${p}, ${q})$ 를 지납니다. $m$ 의 값을 구하세요.`,
              answer: { type: 'num', value: k },
              steps: [`평행이동한 그래프: $y = ${linTex(a, b)} + m$`, `$(${p}, ${q})$ 대입: $${q} = ${a.value * p + b} + m$`, `$m = ${k}$`],
            };
          }
          const xi = r.nonzero(-5, 5);
          const need = -a.value * xi; // 새 y절편
          const m = need - b;
          if (m === 0) return this.gen(r, level);
          return {
            q: `일차함수 $${yeq(a, b)}$ 의 그래프를 $y$축의 방향으로 $m$ 만큼 평행이동한 그래프의 $x$절편이 $${xi}$ 일 때, $m$ 의 값을 구하세요.`,
            answer: { type: 'num', value: m },
            steps: [`평행이동한 그래프: $y = ${linTex(a, b)} + m$`, `$x$절편이 $${xi}$ 이므로 점 $(${xi}, 0)$ 을 지납니다: $0 = ${a.value * xi + b} + m$`, `$m = ${m}$`],
          };
        },
      },
      {
        id: 'graph',
        title: '그래프의 성질',
        gen(r, level): ProblemDraft {
          if (level === 1) {
            const a = r.pick(slopes.filter((s) => s.d <= 2 && Math.abs(s.n) <= 3));
            const b = r.int(-4, 4);
            const px = a.d * (r.chance(0.5) ? 1 : 2) * (b > 0 ? 1 : r.sign());
            const py = a.mul(px).add(b).value;
            if (Math.abs(py) > 6 || px === 0) return this.gen(r, level);
            return {
              q: '그림과 같은 일차함수의 그래프의 기울기와 $y$절편을 구하세요.',
              fig: lineFig(a, new F(b), [
                [0, b, ''],
                [px, py, ''],
              ]),
              answer: { type: 'fields', fields: [{ label: '기울기', value: a.value, display: 'frac' as const }, { label: 'y절편', value: b }] },
              steps: [`$y$축과 만나는 점 $(0, ${b})$ → $y$절편 $${b}$`, `$(0, ${b})$ 에서 $(${px}, ${py})$ 까지 $x$ 는 $${px}$, $y$ 는 $${py - b}$ 만큼 변하므로 기울기 $= \\frac{${py - b}}{${px}} = ${a.tex()}$`],
            };
          }
          if (level === 2) {
            const a = r.nonzero(-4, 4);
            const b = r.nonzero(-6, 6);
            const p = -b / a;
            const T = [`기울기는 $${a}$ 이다.`, `$y$절편은 $${b}$ 이다.`, `오른쪽 ${a > 0 ? '위' : '아래'}로 향하는 직선이다.`, `$x$ 의 값이 $1$ 만큼 증가할 때 $y$ 의 값은 $${Math.abs(a)}$ 만큼 ${a > 0 ? '증가' : '감소'}한다.`, `${missQuad(a, b)}을 지나지 않는다.`, `$${yeq(a, b + r.nonzero(-3, 3))}$ 의 그래프와 평행하다.`, `점 $(1, ${a + b})$ 를 지난다.`];
            const Fs = [`기울기는 $${-a}$ 이다.`, `$y$절편은 $${-b}$ 이다.`, `오른쪽 ${a > 0 ? '아래' : '위'}로 향하는 직선이다.`, `$x$절편은 $${Number.isInteger(p) ? -p : new F(b, a).tex()}$ 이다.`, `${QUAD.filter((q) => q !== missQuad(a, b))[r.int(0, 2)]}을 지나지 않는다.`, `$${yeq(-a, b)}$ 의 그래프와 평행하다.`, `점 $(1, ${a - b})$ 를 지난다.`];
            const wantFalse = r.chance(0.7);
            const ans = r.pick(wantFalse ? Fs : T);
            return {
              q: `일차함수 $${yeq(a, b)}$ 의 그래프에 대한 설명으로 ${wantFalse ? '**옳지 않은**' : '**옳은**'} 것은?`,
              answer: textChoices(r, ans, r.sample(wantFalse ? T : Fs, 4)),
              steps: [`기울기 $${a}$, $y$절편 $${b}$, $x$절편 $${new F(-b, a).tex()}$`, `${wantFalse ? '옳지 않은' : '옳은'} 것: ${ans}`],
            };
          }
          const sa = r.sign();
          const sb = r.sign();
          const forms = [
            { t: 'y = bx - a', m: sb, n: -sa },
            { t: 'y = ax + b', m: sa, n: sb },
            { t: 'y = -ax + b', m: -sa, n: sb },
            { t: 'y = abx - b', m: sa * sb, n: -sb },
            { t: 'y = \\frac{b}{a}x + a', m: sa * sb, n: sa },
          ];
          const f = r.pick(forms);
          const ans = missQuad(f.m, f.n);
          return {
            q: `$a ${sa > 0 ? '>' : '<'} 0$, $b ${sb > 0 ? '>' : '<'} 0$ 일 때, 일차함수 $${f.t}$ 의 그래프가 지나지 않는 사분면은?`,
            answer: textChoices(
              r,
              ans,
              QUAD.filter((q) => q !== ans),
              4,
            ),
            steps: [`(기울기) ${f.m > 0 ? '> 0' : '< 0'}, ($y$절편) ${f.n > 0 ? '> 0' : '< 0'}`, `오른쪽 ${f.m > 0 ? '위' : '아래'}로 향하고 $y$축의 ${f.n > 0 ? '양' : '음'}의 부분을 지나므로 ${ans}을 지나지 않습니다.`],
            hint: '기울기와 $y$절편의 부호로 그래프 모양을 그려 보세요.',
          };
        },
      },
      {
        id: 'equation',
        title: '일차함수의 식 구하기',
        gen(r, level) {
          const a = r.pick(slopes.filter((s) => s.d <= 3));
          const b = r.int(-6, 6);
          const ans = { type: 'fields' as const, fields: [{ label: 'a', value: a.value, display: 'frac' as const }, { label: 'b', value: b }] };
          const head = '그래프가 다음 조건을 만족하는 일차함수의 식을 $y = ax + b$ 라 할 때, $a$, $b$ 의 값을 구하세요.\n';
          if (level === 1) {
            const p = a.d * r.int(-2, 2);
            const q = a.mul(p).add(b).value;
            return {
              q: `${head}기울기가 $${a.tex()}$ 이고 점 $(${p}, ${q})$ 를 지난다.`,
              answer: ans,
              steps: [`$y = ${linTex(a, 0).replace(/^0$/, '')} + b$ 에 $(${p}, ${q})$ 대입`, `$${q} = ${a.mul(p).tex()} + b$, $b = ${b}$`],
            };
          }
          if (level === 2) {
            const p1 = a.d * r.int(-2, 1);
            const p2 = p1 + a.d * r.int(1, 2);
            const [q1, q2] = [a.mul(p1).add(b).value, a.mul(p2).add(b).value];
            return {
              q: `${head}두 점 $(${p1}, ${q1})$, $(${p2}, ${q2})$ 를 지난다.`,
              answer: ans,
              steps: [`기울기: $\\frac{${q2} - ${fp(q1)}}{${p2} - ${fp(p1)}} = ${a.tex()}$`, `$(${p1}, ${q1})$ 대입: $${q1} = ${a.mul(p1).tex()} + b$, $b = ${b}$`],
            };
          }
          if (r.chance(0.5)) {
            const xi = new F(-b).div(a);
            if (b === 0 || !xi.isInt()) return this.gen(r, level);
            return {
              q: `${head}$x$절편이 $${xi.tex()}$, $y$절편이 $${b}$ 이다.`,
              answer: ans,
              steps: [`두 점 $(${xi.tex()}, 0)$, $(0, ${b})$ 를 지나므로 기울기 $= \\frac{${b} - 0}{0 - ${fp(xi)}} = ${a.tex()}$`, `$y$절편 $b = ${b}$`],
            };
          }
          const c = r.int(-6, 6);
          const p = a.d * r.int(-2, 2);
          const q = a.mul(p).add(b).value;
          return {
            q: `${head}일차함수 $${yeq(a, c === b ? c + 1 : c)}$ 의 그래프와 평행하고 점 $(${p}, ${q})$ 를 지난다.`,
            answer: ans,
            steps: [`평행하므로 기울기가 같습니다: $a = ${a.tex()}$`, `$(${p}, ${q})$ 대입: $${q} = ${a.mul(p).tex()} + b$, $b = ${b}$`],
          };
        },
      },
    ],
  },

  // ═══════════════ m2a-6 일차함수와 일차방정식 ═══════════════
  'm2a-6': {
    concepts: [
      {
        title: '일차방정식의 그래프',
        body: '미지수가 2개인 일차방정식 $ax + by + c = 0$ ($b \\ne 0$) 의 해를 좌표평면에 나타내면 직선이 돼요.\n$y$ 에 대해 풀면 $y = -\\frac{a}{b}x - \\frac{c}{b}$ → 일차함수의 그래프와 같아요.\n기울기 $-\\frac{a}{b}$, $y$절편 $-\\frac{c}{b}$',
      },
      {
        title: '좌표축에 평행한 직선',
        body: '- $x = p$ ($p \\ne 0$): 점 $(p, 0)$ 을 지나고 **$y$축에 평행**한 직선 (함수가 아니에요!)\n- $y = q$ ($q \\ne 0$): 점 $(0, q)$ 를 지나고 **$x$축에 평행**한 직선\n- $x = 0$ 은 $y$축, $y = 0$ 은 $x$축\n"$x$좌표가 같은 두 점을 지나는 직선" → $x = p$ 꼴',
      },
      {
        title: '연립방정식의 해와 그래프',
        body: '연립방정식의 해는 두 일차방정식의 그래프의 **교점의 좌표**예요.\n$$\\begin{cases} x + y = 4 \\\\ x - y = 2 \\end{cases} \\Rightarrow \\text{교점 } (3, 1)$$\n교점의 좌표를 알면 각 방정식에 대입해 미지수 상수를 구할 수 있어요.',
      },
      {
        title: '해의 개수와 두 직선의 위치 관계',
        body: '- 한 점에서 만난다 → 해가 **한 쌍**\n- 평행하다 (기울기 같고 $y$절편 다름) → 해가 **없다**\n- 일치한다 (기울기, $y$절편 모두 같음) → 해가 **무수히 많다**\n$\\frac{a}{a\'} = \\frac{b}{b\'} \\ne \\frac{c}{c\'}$ 이면 평행, $= \\frac{c}{c\'}$ 이면 일치',
      },
      {
        title: '일차함수의 활용',
        body: '1. 두 변수 $x$, $y$ 정하기\n2. 관계를 $y = ax + b$ 로 나타내기 (처음 값 = $b$, 단위당 변화량 = $a$)\n3. 주어진 값을 대입하여 답 구하기\n예: 처음 온도 $20$°C 인 물이 1분마다 $5$°C 씩 오르면 $y = 5x + 20$',
      },
    ],
    skills: [
      {
        id: 'eq-graph',
        title: '일차방정식의 그래프',
        gen(r, level) {
          if (level === 1) {
            for (;;) {
              const [a, b, c] = [r.nonzero(-6, 6), r.nonzero(-4, 4), r.int(-12, 12)];
              const m = new F(-a, b);
              const n = new F(-c, b);
              if (n.d > 2) continue;
              return {
                q: `일차방정식 $${termsTex([{ c: a, v: 'x' }, { c: b, v: 'y' }, { c, v: '' }])} = 0$ 의 그래프의 기울기와 $y$절편을 구하세요.`,
                answer: { type: 'fields', fields: [{ label: '기울기', value: m.value, display: 'frac' as const }, { label: 'y절편', value: n.value, display: 'frac' as const }] },
                steps: [`$y$ 에 대하여 풀면 $${yeq(m, n)}$`, `기울기 $${m.tex()}$, $y$절편 $${n.tex()}$`],
              };
            }
          }
          if (level === 2) {
            for (;;) {
              const m = r.pick(slopes.filter((s) => s.d <= 2));
              const n = r.nonzero(-5, 5);
              const c = r.nonzero(-12, 12);
              // ax + by + c = 0 → y = -a/b x - c/b ; n = -c/b → b = -c/n ; a = -m b
              const b = new F(-c, n);
              const a = m.neg().mul(b);
              if (!b.isInt() || !a.isInt()) continue;
              return {
                q: `일차방정식 $ax + by ${c < 0 ? '-' : '+'} ${Math.abs(c)} = 0$ 의 그래프의 기울기가 $${m.tex()}$, $y$절편이 $${n}$ 일 때, 상수 $a$, $b$ 의 값을 구하세요.`,
                answer: { type: 'fields', fields: [{ label: 'a', value: a.value, display: 'frac' as const }, { label: 'b', value: b.value, display: 'frac' as const }] },
                steps: [`$y = -\\frac{a}{b}x ${c < 0 ? '+' : '-'} \\frac{${Math.abs(c)}}{b}$`, `$y$절편: $${c < 0 ? '' : '-'}\\frac{${Math.abs(c)}}{b} = ${n}$ 에서 $b = ${b.tex()}$`, `기울기: $-\\frac{a}{${fp(b)}} = ${m.tex()}$ 에서 $a = ${a.tex()}$`],
              };
            }
          }
          const a = r.nonzero(-4, 4);
          const b = r.int(-6, 6);
          const [p, q] = [r.int(-4, 4), r.int(-4, 4)];
          if (p === q) return this.gen(r, level);
          return {
            q: `일차방정식 $ax - y + b = 0$ 의 그래프가 두 점 $(${p}, ${a * p + b})$, $(${q}, ${a * q + b})$ 를 지날 때, $a + b$ 의 값을 구하세요.`,
            answer: { type: 'num', value: a + b },
            steps: [`$y = ax + b$ 이고 두 점을 지나므로 기울기 $a = \\frac{${a * q + b} - ${fp(a * p + b)}}{${q} - ${fp(p)}} = ${a}$`, `$(${p}, ${a * p + b})$ 대입: $b = ${b}$`, `$a + b = ${a + b}$`],
          };
        },
      },
      {
        id: 'axis-line',
        title: '좌표축에 평행한 직선',
        gen(r, level) {
          if (level === 1) {
            const [p, q] = [r.nonzero(-6, 6), r.nonzero(-6, 6)];
            const yAxis = r.chance(0.5);
            const ans = yAxis ? `x = ${p}` : `y = ${q}`;
            return {
              q: `점 $(${p}, ${q})$ 를 지나고 ${yAxis ? '$y$축' : '$x$축'}에 평행한 직선의 방정식은?`,
              answer: texChoices(r, ans, [`x = ${q}`, `y = ${p}`, yAxis ? `y = ${q}` : `x = ${p}`, `y = ${linTex(new F(q, p), 0)}`, yAxis ? `x = ${-p}` : `y = ${-q}`].filter((w) => w !== ans)),
              steps: [yAxis ? '$y$축에 평행한 직선 위의 점들은 $x$좌표가 모두 같습니다.' : '$x$축에 평행한 직선 위의 점들은 $y$좌표가 모두 같습니다.', `$${ans}$`],
            };
          }
          if (level === 2) {
            const a = r.int(-6, 6);
            const [k1, c1, k2, c2] = [r.int(1, 3), r.int(-5, 5), r.int(1, 3) + 3, 0];
            // 두 점 (k1 a + c1, ...) (k2 a + c2', ...) 의 x좌표가 같음
            const c2b = (k1 - k2) * a + c1 + c2;
            return {
              q: `두 점 $(${linTex(k1, c1).replace('x', 'a')}, ${r.int(-5, 5)})$, $(${linTex(k2, c2b).replace('x', 'a')}, ${r.int(6, 9)})$ 를 지나는 직선이 $y$축에 평행할 때, $a$ 의 값을 구하세요.`,
              answer: { type: 'num', value: a },
              steps: ['$y$축에 평행하면 두 점의 $x$좌표가 같습니다.', `$${linTex(k1, c1).replace('x', 'a')} = ${linTex(k2, c2b).replace('x', 'a')}$`, `$a = ${a}$`],
            };
          }
          const [x1, x2] = [r.int(-5, 0), r.int(1, 5)];
          const [y1, y2] = [r.int(-5, 0), r.int(1, 5)];
          if (x1 === 0 && y1 === 0) return this.gen(r, level);
          const P = new Plane(-6, 6, -6, 6, { w: 240, h: 240 });
          P.polygon(
            [
              [x1, y1],
              [x2, y1],
              [x2, y2],
              [x1, y2],
            ],
            { fill: true },
          );
          const area = (x2 - x1) * (y2 - y1);
          return {
            q: `네 직선 $x = ${x1}$, $x = ${x2}$, $y = ${y1}$, $y = ${y2}$ 로 둘러싸인 도형의 넓이를 구하세요.`.replace('x = 0', 'x = 0').replace('y = 0', 'y = 0'),
            fig: fig(P),
            answer: { type: 'num', value: area },
            steps: [`가로: $${x2} - ${fp(x1)} = ${x2 - x1}$, 세로: $${y2} - ${fp(y1)} = ${y2 - y1}$`, `넓이: $${x2 - x1} \\times ${y2 - y1} = ${area}$`],
          };
        },
      },
      {
        id: 'intersect',
        title: '두 직선의 교점',
        gen(r, level) {
          const [x0, y0] = [r.int(-4, 4), r.int(-4, 4)];
          if (level === 1) {
            const s = mkSys(r, x0, y0, 4);
            const P = new Plane(-6, 6, -6, 6, { w: 240, h: 240 });
            P.fn((x) => (s.e - s.a * x) / s.b).fn((x) => (s.f - s.c * x) / s.d, { cls: 'acc2' });
            return {
              q: `그림은 두 일차방정식 $${eq(s.a, s.b, s.e)}$, $${eq(s.c, s.d, s.f)}$ 의 그래프입니다. 두 그래프의 교점의 좌표를 구하세요.`,
              fig: fig(P),
              answer: { type: 'fields', fields: [{ label: 'x', value: x0 }, { label: 'y', value: y0 }] },
              steps: ['교점의 좌표는 연립방정식의 해입니다.', `$${sys(eq(s.a, s.b, s.e), eq(s.c, s.d, s.f))}$ 를 풀면 $x = ${x0}$, $y = ${y0}$`],
            };
          }
          if (level === 2) {
            for (;;) {
              const a = r.nonzero(-4, 4);
              const b = r.nonzero(-4, 4);
              const k1 = r.nonzero(-3, 3);
              const k2 = r.nonzero(-3, 3);
              if (x0 === 0 || y0 === 0) return this.gen(r, level);
              const c1 = a * x0 + k1 * y0;
              const c2 = k2 * x0 + b * y0;
              const P = new Plane(-6, 6, -6, 6, { w: 240, h: 240 });
              P.fn((x) => (c1 - a * x) / k1).fn((x) => (c2 - k2 * x) / b, { cls: 'acc2' }).point(x0, y0, `(${x0}, ${y0})`);
              return {
                q: `두 일차방정식 $ax ${k1 < 0 ? '-' : '+'} ${Math.abs(k1) === 1 ? '' : Math.abs(k1)}y = ${c1}$, $${k2 === 1 ? '' : k2 === -1 ? '-' : k2}x + by = ${c2}$ 의 그래프가 그림과 같이 점 $(${x0}, ${y0})$ 에서 만날 때, 상수 $a$, $b$ 의 값을 구하세요.`,
                fig: fig(P),
                answer: { type: 'fields', fields: [{ label: 'a', value: a }, { label: 'b', value: b }] },
                steps: [`교점 $(${x0}, ${y0})$ 를 두 식에 각각 대입합니다.`, `$${x0}a ${k1 * y0 < 0 ? '-' : '+'} ${Math.abs(k1 * y0)} = ${c1}$ 에서 $a = ${a}$`, `$${k2 * x0} ${y0 < 0 ? '-' : '+'} ${Math.abs(y0) === 1 ? '' : Math.abs(y0)}b = ${c2}$ 에서 $b = ${b}$`],
              };
            }
          }
          const s = mkSys(r, x0, y0, 4);
          const k = r.nonzero(-3, 3);
          if (x0 === 0) return this.gen(r, level);
          const a = r.nonzero(-5, 5);
          const c3 = a * x0 + k * y0;
          return {
            q: `세 일차방정식 $${eq(s.a, s.b, s.e)}$, $${eq(s.c, s.d, s.f)}$, $ax ${k < 0 ? '-' : '+'} ${Math.abs(k) === 1 ? '' : Math.abs(k)}y = ${c3}$ 의 그래프가 한 점에서 만날 때, 상수 $a$ 의 값을 구하세요.`,
            answer: { type: 'num', value: a },
            steps: [`처음 두 식을 연립하면 교점 $(${x0}, ${y0})$`, `세 번째 직선도 이 점을 지나므로 $${x0}a ${k * y0 < 0 ? '-' : '+'} ${Math.abs(k * y0)} = ${c3}$`, `$a = ${a}$`],
            hint: '상수가 없는 두 직선의 교점을 먼저 구하세요.',
          };
        },
      },
      {
        id: 'position',
        title: '해의 개수와 그래프의 위치 관계',
        gen(r, level) {
          const [a1, b1] = [r.nonzero(-4, 4), r.nonzero(-4, 4)];
          const c1 = r.nonzero(-6, 6);
          const k = r.pick([2, 3, -2, -1, 4]);
          if (level === 1) {
            const kind = r.int(0, 2);
            const OPTS = ['한 점에서 만난다', '평행하다', '일치한다'];
            let e2: string;
            if (kind === 0) {
              const s = mkSys(r, r.int(-3, 3), r.int(-3, 3), 4);
              e2 = eq(s.c, s.d, s.c * 0 + s.f);
              const e1 = eq(s.a, s.b, s.e);
              return {
                q: `두 일차방정식 $${e1}$, $${e2}$ 의 그래프의 위치 관계는?`,
                answer: textChoices(r, OPTS[0], OPTS.slice(1, 3), 3),
                steps: [`기울기가 각각 $${new F(-s.a, s.b).tex()}$, $${new F(-s.c, s.d).tex()}$ 로 다릅니다.`, '한 점에서 만납니다. (연립방정식의 해가 한 쌍)'],
              };
            }
            const c2 = kind === 1 ? k * c1 + r.nonzero(-3, 3) : k * c1;
            e2 = eq(k * a1, k * b1, c2);
            return {
              q: `두 일차방정식 $${eq(a1, b1, c1)}$, $${e2}$ 의 그래프의 위치 관계는?`,
              answer: textChoices(r, OPTS[kind], [OPTS[0], OPTS[3 - kind]], 3),
              steps: [`둘째 식의 $x$, $y$ 계수는 첫째 식의 $${k}$ 배`, kind === 1 ? '상수항은 그렇지 않으므로 기울기는 같고 $y$절편이 달라 평행합니다. (해가 없음)' : '상수항도 $' + k + '$ 배이므로 두 직선은 일치합니다. (해가 무수히 많음)'],
            };
          }
          if (level === 2) {
            const c2 = k * c1 + r.nonzero(-3, 3);
            return {
              q: `두 일차방정식 $${eq(a1, b1, c1)}$, $${k * a1 === 1 ? '' : k * a1 === -1 ? '-' : k * a1}x + ay = ${c2}$ 의 그래프가 서로 평행할 때, 상수 $a$ 의 값을 구하세요.`,
              answer: { type: 'num', value: k * b1 },
              steps: [`평행하려면 $\\frac{${a1}}{${k * a1}} = \\frac{${b1}}{a} \\ne \\frac{${c1}}{${c2}}$`, `$a = ${k * b1}$`],
              hint: '평행하면 연립방정식의 해가 없어요.',
            };
          }
          const p = r.pick([2, 3, -2]);
          const A2 = r.pick([4, 6, -6]);
          const C1 = r.nonzero(-5, 5);
          // ax - 2y = C1,  A2 x + by = p C1 → a = A2/p, b = -2p
          if (A2 % p !== 0) return this.gen(r, level);
          return {
            q: `두 일차방정식 $ax - 2y = ${C1}$, $${A2}x + by = ${p * C1}$ 의 그래프가 일치할 때, 상수 $a$, $b$ 의 값을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'a', value: A2 / p }, { label: 'b', value: -2 * p }] },
            steps: [`일치하려면 $\\frac{a}{${A2}} = \\frac{-2}{b} = ${C1 === 1 ? new F(1, p).tex() : `\\frac{${C1}}{${p * C1}} = ${new F(1, p).tex()}`}$`, `$a = ${A2 / p}$, $b = ${-2 * p}$`],
          };
        },
      },
      {
        id: 'area',
        title: '직선으로 둘러싸인 도형의 넓이',
        gen(r, level) {
          for (;;) {
            const x0 = r.int(-3, 3);
            const y0 = r.int(1, 5) * (level === 3 ? r.sign() : 1);
            const m1 = r.pick(slopes.filter((s) => s.d === 1 && s.n > 0));
            const m2 = r.pick(slopes.filter((s) => s.d === 1 && s.n < 0));
            const n1 = y0 - m1.value * x0;
            const n2 = y0 - m2.value * x0;
            const P = new Plane(-6, 6, -6, 6, { w: 240, h: 240 });
            P.fn((x) => m1.value * x + n1).fn((x) => m2.value * x + n2, { cls: 'acc2' });
            let tri: [number, number][];
            let area: F;
            let steps: string[];
            let where: string;
            if (level === 1) {
              // 두 직선과 y축
              if (n1 === n2) continue;
              tri = [
                [0, n1],
                [0, n2],
                [x0, y0],
              ];
              area = new F(Math.abs(n1 - n2) * Math.abs(x0), 2);
              where = '$y$축';
              steps = [`두 직선의 $y$절편: $${n1}$, $${n2}$ → 밑변 $${Math.abs(n1 - n2)}$`, `교점 $(${x0}, ${y0})$ → 높이 $${Math.abs(x0)}$`, `넓이: $\\frac{1}{2} \\times ${Math.abs(n1 - n2)} \\times ${Math.abs(x0)} = ${area.tex()}$`];
              if (x0 === 0) continue;
            } else {
              const xi1 = new F(-n1).div(m1);
              const xi2 = new F(-n2).div(m2);
              if (!xi1.isInt() || !xi2.isInt() || xi1.eq(xi2)) continue;
              if (Math.abs(xi1.value) > 6 || Math.abs(xi2.value) > 6) continue;
              tri = [
                [xi1.value, 0],
                [xi2.value, 0],
                [x0, y0],
              ];
              const base = Math.abs(xi1.value - xi2.value);
              area = new F(base * Math.abs(y0), 2);
              where = '$x$축';
              steps = [`두 직선의 $x$절편: $${xi1.tex()}$, $${xi2.tex()}$ → 밑변 $${base}$`, `두 직선의 교점: $(${x0}, ${y0})$ → 높이 $${Math.abs(y0)}$`, `넓이: $\\frac{1}{2} \\times ${base} \\times ${Math.abs(y0)} = ${area.tex()}$`];
            }
            if (Math.abs(n1) > 6 || Math.abs(n2) > 6) continue;
            P.polygon(tri, { fill: true });
            return {
              q: `두 일차함수 $${yeq(m1, n1)}$, $${yeq(m2, n2)}$ 의 그래프와 ${where}으로 둘러싸인 삼각형의 넓이를 구하세요.`,
              fig: fig(P),
              answer: { type: 'num', value: area.value, display: 'frac' },
              steps: [`두 식을 연립하면 교점 $(${x0}, ${y0})$`, ...steps],
            };
          }
        },
      },
      {
        id: 'apply',
        title: '일차함수의 활용',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(2, 8);
            const b = r.int(10, 30);
            const t = r.int(3, 10);
            return {
              q: `처음 온도가 $${b}$°C 인 물을 데우면 1분마다 온도가 $${a}$°C 씩 올라갑니다. $x$ 분 후의 물의 온도를 $y$°C 라 할 때, $${t}$ 분 후의 물의 온도를 구하세요.`,
              answer: { type: 'num', value: a * t + b, unit: '°C' },
              steps: [`$y = ${a}x + ${b}$`, `$x = ${t}$ 일 때 $y = ${a * t + b}$`],
            };
          }
          if (level === 2) {
            const c = r.pick([0.2, 0.25, 0.5, 0.4]);
            const L = r.int(15, 30);
            const t = r.int(4, 30);
            const rest = L - c * t;
            if (rest <= 0 || Math.abs(rest * 10 - Math.round(rest * 10)) > 1e-9) return this.gen(r, level);
            return {
              q: `길이가 $${L}$ cm 인 양초에 불을 붙이면 1분마다 $${dec(c)}$ cm 씩 짧아집니다. 양초의 길이가 $${dec(rest)}$ cm 가 되는 것은 불을 붙인 지 몇 분 후인지 구하세요.`,
              answer: { type: 'num', value: t, unit: '분 후' },
              steps: [`$x$ 분 후의 길이를 $y$ cm 라 하면 $y = ${L} - ${dec(c)}x$`, `$${dec(rest)} = ${L} - ${dec(c)}x$`, `$x = ${t}$`],
            };
          }
          const a = r.nonzero(-5, 5) * r.pick([1, 2]);
          const b = r.int(20, 80);
          const [x1, x2] = [r.int(1, 4), r.int(5, 9)];
          const t = r.int(10, 20);
          const what = a > 0 ? { s: '물통에 들어 있는 물의 양', u: 'L', x: '분' } : { s: '물탱크에 남은 물의 양', u: 'L', x: '분' };
          if (a * t + b < 0) return this.gen(r, level);
          return {
            q: `다음은 일정한 빠르기로 물을 ${a > 0 ? '넣는' : '빼는'} ${what.s.includes('남은') ? '물탱크' : '물통'}에서 시간 $x$ ${what.x}과 ${what.s} $y$ ${what.u} 사이의 관계를 나타낸 표입니다. $y$ 가 $x$ 의 일차함수일 때, $${t}$ 분 후 ${what.s}을 구하세요.`,
            table: [
              ['$x$ (분)', String(x1), String(x2)],
              ['$y$ (L)', String(a * x1 + b), String(a * x2 + b)],
            ],
            answer: { type: 'num', value: a * t + b, unit: 'L' },
            steps: [`기울기: $\\frac{${a * x2 + b} - ${a * x1 + b}}{${x2} - ${x1}} = ${a}$`, `$y = ${a}x + b$ 에 $(${x1}, ${a * x1 + b})$ 대입: $b = ${b}$`, `$x = ${t}$ 일 때 $y = ${a * t + b}$`],
          };
        },
      },
    ],
  },
};

function gcdN(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return Math.abs(a);
}
