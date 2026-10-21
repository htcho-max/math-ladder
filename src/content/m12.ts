// 중1-1, 중1-2, 중2-1 콘텐츠
// ※ 이 파일 앞부분(m1a-1 소인수분해)은 모든 콘텐츠 작성자가 참고하는 "작성 예시"이기도 함
import type { ContentMap, Level, ProblemDraft } from '../core/types';
import type { Rng } from '../core/rng';
import { factorize, gcd, lcm, isPrime } from '../core/nt';
import { makeChoices, numChoices } from '../core/tex';
import { m1a } from './m12/m1a';
import { m1b } from './m12/m1b';
import { m1b2 } from './m12/m1b2';
import { m2a } from './m12/m2a';
import { m2a2 } from './m12/m2a2';
import { withJosaFix } from './m12/josa';
import { word1 } from './m12/word1';
import { word2 } from './m12/word2';
import { hard1 } from './m12/hard1';
import { hard2 } from './m12/hard2';

/** 소인수분해 TeX: 2^{3}\times 3\times 5 */
const factTex = (n: number) =>
  factorize(n)
    .map(([p, e]) => (e === 1 ? `${p}` : `${p}^{${e}}`))
    .join(' \\times ');

/** 레벨별로 '소인수 거듭제곱 곱' 모양의 수 만들기 */
function composite(r: Rng, level: Level): number {
  const primes = level === 1 ? [2, 3, 5] : level === 2 ? [2, 3, 5, 7] : [2, 3, 5, 7, 11];
  const maxE = level === 1 ? 2 : 3;
  for (;;) {
    const ps = r.sample(primes, r.int(2, level === 3 ? 3 : 2));
    const n = ps.reduce((acc, p) => acc * p ** r.int(1, maxE), 1);
    if (n >= 12 && n <= (level === 1 ? 100 : level === 2 ? 400 : 2000)) return n;
  }
}

const raw: ContentMap = {
  'm1a-1': {
    concepts: [
      {
        title: '소수와 합성수',
        body: '1보다 큰 자연수 중에서 **1과 자기 자신만을 약수로 가지는 수**를 소수라고 해요. 약수가 3개 이상인 수는 합성수예요.\n- 1은 소수도 합성수도 아니에요.\n- 2는 짝수인 유일한 소수예요.',
        example: { q: '15는 소수일까요?', a: '15의 약수는 1, 3, 5, 15 이므로 합성수예요.' },
      },
      {
        title: '거듭제곱',
        body: '같은 수를 여러 번 곱한 것을 거듭제곱으로 나타내요. $2\\times2\\times2 = 2^{3}$ 에서 2를 **밑**, 3을 **지수**라고 해요.',
      },
      {
        title: '소인수분해',
        body: '자연수를 소수들만의 곱으로 나타내는 것을 소인수분해라고 해요. 작은 소수부터 차례로 나누어요.\n$$60 = 2^{2}\\times 3\\times 5$$',
        example: { q: '72를 소인수분해하세요.', a: '$72 = 2^{3}\\times 3^{2}$' },
      },
      {
        title: '최대공약수와 최소공배수',
        body: '소인수분해한 뒤\n- 최대공약수: 공통인 소인수를 **지수가 작은 쪽**으로 곱해요.\n- 최소공배수: 모든 소인수를 **지수가 큰 쪽**으로 곱해요.',
      },
    ],
    skills: [
      {
        id: 'prime',
        title: '소수 찾기',
        gen(r, level): ProblemDraft {
          const max = level === 1 ? 30 : level === 2 ? 60 : 100;
          const all = Array.from({ length: max - 1 }, (_, i) => i + 2);
          const ps = all.filter(isPrime);
          const cs = all.filter((n) => !isPrime(n) && n % 2 === 1); // 헷갈리는 홀수 합성수
          const ans = r.pick(ps);
          const wrongs = r.sample(cs.length >= 4 ? cs : all.filter((n) => !isPrime(n)), 4);
          return {
            q: '다음 중 **소수**인 것은?',
            answer: makeChoices(r, `$${ans}$`, wrongs.map((w) => `$${w}$`)),
            steps: [
              `$${ans}$ 의 약수는 $1$ 과 $${ans}$ 뿐이므로 소수입니다.`,
              ...wrongs.slice(0, 2).map((w) => `$${w} = ${factTex(w)}$ 이므로 합성수입니다.`),
            ],
            hint: '약수가 1과 자기 자신뿐인 수를 찾으세요.',
          };
        },
      },
      {
        id: 'factorize',
        title: '소인수분해하기',
        gen(r, level) {
          const n = composite(r, level);
          const f = factorize(n);
          const right = factTex(n);
          // 그럴듯한 오답: 지수 하나 틀리기, 소인수 하나 바꾸기
          const wrongs: string[] = [];
          for (let i = 0; i < f.length; i++) {
            const g = f.map((x) => [...x] as [number, number]);
            g[i][1] += 1;
            wrongs.push(g.map(([p, e]) => (e === 1 ? `${p}` : `${p}^{${e}}`)).join(' \\times '));
            if (f[i][1] > 1) {
              const h = f.map((x) => [...x] as [number, number]);
              h[i][1] -= 1;
              wrongs.push(h.map(([p, e]) => (e === 1 ? `${p}` : `${p}^{${e}}`)).join(' \\times '));
            }
          }
          wrongs.push([`${f[0][0] * 2}${f[0][1] > 1 ? `^{${f[0][1]}}` : ''}`, ...f.slice(1).map(([p]) => `${p}`)].join(' \\times '));
          const steps: string[] = [];
          let m = n;
          for (const [p, e] of f) {
            for (let k = 0; k < e; k++) {
              steps.push(`$${m} \\div ${p} = ${m / p}$`);
              m /= p;
            }
          }
          steps.push(`따라서 $${n} = ${right}$`);
          return {
            q: `$${n}$ 을 소인수분해한 것은?`,
            answer: makeChoices(r, `$${right}$`, wrongs.map((w) => `$${w}$`)),
            steps,
          };
        },
      },
      {
        id: 'divisor-count',
        title: '약수의 개수',
        gen(r, level) {
          const n = composite(r, level);
          const f = factorize(n);
          const cnt = f.reduce((a, [, e]) => a * (e + 1), 1);
          return {
            q: `$${n}$ 의 약수의 개수를 구하세요.`,
            answer: { type: 'num', value: cnt, unit: '개' },
            steps: [
              `$${n} = ${factTex(n)}$`,
              `약수의 개수는 각 지수에 1을 더해 곱합니다: $${f.map(([, e]) => `(${e}+1)`).join('\\times')} = ${cnt}$`,
            ],
            hint: '먼저 소인수분해하세요.',
          };
        },
      },
      {
        id: 'gcd-lcm',
        title: '최대공약수와 최소공배수',
        gen(r, level) {
          let a = composite(r, level);
          let b = composite(r, level);
          for (let i = 0; (a === b || gcd(a, b) === 1) && i < 50; i++) b = composite(r, level);
          if (a > b) [a, b] = [b, a];
          const g = gcd(a, b);
          const l = lcm(a, b);
          if (r.chance(0.5)) {
            return {
              q: `두 수 $${a}$, $${b}$ 의 최대공약수와 최소공배수를 구하세요.`,
              answer: {
                type: 'fields',
                fields: [
                  { label: '최대공약수', value: g },
                  { label: '최소공배수', value: l },
                ],
              },
              steps: [
                `$${a} = ${factTex(a)}$, $${b} = ${factTex(b)}$`,
                `최대공약수: 공통 소인수의 작은 지수 → $${g === 1 ? '1' : factTex(g)} = ${g}$`,
                `최소공배수: 모든 소인수의 큰 지수 → $${factTex(l)} = ${l}$`,
              ],
            };
          }
          return {
            q: `두 수 $${factTex(a)}$, $${factTex(b)}$ 의 최대공약수는?`,
            answer: numChoices(r, g, [g * 2, l, g / 2, a, b].filter((x) => Number.isInteger(x))),
            steps: [`공통인 소인수를 지수가 작은 쪽으로 곱하면 $${factTex(g)} = ${g}$`],
          };
        },
      },
    ],
  },
  ...m1a,
  ...m1b,
  ...m1b2,
  ...m2a,
  ...m2a2,
};

// 활용(문장제) 유형 추가분을 각 단원 유형 목록 뒤에 붙임
for (const [id, sks] of Object.entries({ ...word1, ...word2 })) raw[id].skills.push(...sks);
// 심화 유형은 skills 뒤에, 최상위 유형은 top 으로
for (const [id, h] of Object.entries({ ...hard1, ...hard2 })) {
  raw[id].skills.push(...h.skills);
  raw[id].top = [...(raw[id].top ?? []), ...h.top];
}

/** 수식 뒤 조사(을/를, 이/가 …)를 자동 교정해서 내보냄 */
export const content: ContentMap = withJosaFix(raw);
