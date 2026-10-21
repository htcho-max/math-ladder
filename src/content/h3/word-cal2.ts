// 미적분Ⅱ 활용(문장제) 유형 — cal2.ts 의 각 단원 skills 뒤에 덧붙임
import type { Skill } from '../../core/types';
import { F } from '../../core/frac';
import { NAMES, TRIPLES, fAns, texChoices } from './util';

const fr = (n: number, d = 1) => new F(n, d);
const T = (f: F) => f.tex();
/** c·sym (c: 분수) → TeX: 3\ln 2, \frac{3\sqrt{3}}{4} */
function cs(c: F, sym: string): string {
  if (c.n === 0) return '0';
  const neg = c.n < 0 ? '-' : '';
  const a = Math.abs(c.n);
  if (c.d === 1) return `${neg}${a === 1 ? '' : a}${sym}`;
  return `${neg}\\frac{${a === 1 ? '' : a}${sym}}{${c.d}}`;
}

export const CAL2_WORD: Record<string, Skill[]> = {
  'cal2-2': [
    {
      id: 'series-word',
      title: '등비급수의 활용 (누적량·확률)',
      gen(r, level) {
        if (level === 1) {
          const rho = r.pick([fr(1, 2), fr(1, 3), fr(1, 4), fr(1, 5), fr(2, 5), fr(3, 5)]);
          const D = r.pick([20, 30, 40, 60, 80, 100, 120]);
          const S = fr(D).div(fr(1).sub(rho));
          return {
            q: `어떤 사람이 매일 같은 시각에 약을 $${D}\\text{ mg}$ 씩 복용합니다. 몸속의 약 성분은 하루가 지나면 그 양의 $${T(rho)}$ 만 남습니다. 이렇게 한없이 계속 복용할 때, 복용 직후 몸속의 약 성분의 양은 몇 mg 에 한없이 가까워지나요?`,
            answer: fAns(S, 'mg'),
            steps: [`$n$ 번째 복용 직후의 양: $${D}+${D}\\times${T(rho)}+${D}\\times\\left(${T(rho)}\\right)^{2}+\\cdots+${D}\\times\\left(${T(rho)}\\right)^{n-1}$`, `공비 $${T(rho)}$ 인 등비급수로 수렴: $\\frac{${D}}{1-${T(rho)}}=${T(S)}$ (mg)`],
          };
        }
        const [a, b] = r.sample(NAMES, 2);
        const [p, how] = r.pick([
          [fr(1, 6), '주사위 한 개를 던져 $6$ 의 눈이 나오면'],
          [fr(1, 2), '동전 한 개를 던져 앞면이 나오면'],
          [fr(1, 3), '주사위 한 개를 던져 $3$ 의 배수의 눈이 나오면'],
          [fr(1, 4), '동전 두 개를 던져 모두 앞면이 나오면'],
        ] as [F, string][]);
        const q = fr(1).sub(p);
        if (level === 2) {
          const first = r.chance(0.5);
          const den = fr(1).sub(q.pow(2));
          const ans = (first ? p : q.mul(p)).div(den);
          return {
            q: `${a}와 ${b}가 ${a}부터 번갈아 가며 ${how} 이기는 놀이를 합니다. 누군가 이길 때까지 계속할 때, ${first ? a : b}가 이길 확률을 구하세요.`,
            answer: fAns(ans),
            steps: [
              `${first ? a : b}가 ${first ? '1, 3, 5, …' : '2, 4, 6, …'} 번째 시도에서 이길 확률: $${first ? T(p) : `${T(q)}\\times${T(p)}`}$, 그 뒤로는 두 사람 모두 실패할 때마다 $\\left(${T(q)}\\right)^{2}$ 배`,
              `$\\frac{${T(first ? p : q.mul(p))}}{1-\\left(${T(q)}\\right)^{2}}=\\frac{${T(first ? p : q.mul(p))}}{${T(den)}}=${T(ans)}$`,
            ],
          };
        }
        const [c] = r.sample(NAMES.filter((x) => x !== a && x !== b), 1);
        const pp = r.pick([fr(1, 2), fr(1, 3), fr(1, 6)]);
        const qq = fr(1).sub(pp);
        const how2 = pp.eq(fr(1, 2)) ? '동전 한 개를 던져 앞면이 나오면' : pp.eq(fr(1, 3)) ? '주사위 한 개를 던져 $3$ 의 배수의 눈이 나오면' : '주사위 한 개를 던져 $6$ 의 눈이 나오면';
        const k = r.int(0, 2);
        const who = [a, b, c][k];
        const num = qq.pow(k).mul(pp);
        const den = fr(1).sub(qq.pow(3));
        const ans = num.div(den);
        return {
          q: `${a}, ${b}, ${c} 세 사람이 이 순서대로 돌아가며 ${how2} 이기는 놀이를 합니다. 누군가 이길 때까지 계속할 때, ${who}가 이길 확률을 구하세요.`,
          answer: fAns(ans),
          steps: [
            `${who}가 처음 차례에 이길 확률: $${k === 0 ? T(pp) : k === 1 ? `${T(qq)}\\times${T(pp)}=${T(num)}` : `\\left(${T(qq)}\\right)^{2}\\times${T(pp)}=${T(num)}`}$`,
            `한 바퀴 모두 실패할 때마다 $\\left(${T(qq)}\\right)^{3}=${T(qq.pow(3))}$ 배 → 공비 $${T(qq.pow(3))}$ 인 등비급수`,
            `$\\frac{${T(num)}}{1-${T(qq.pow(3))}}=${T(ans)}$`,
          ],
        };
      },
    },
  ],

  'cal2-3': [
    {
      id: 'growth-word',
      title: '지수·로그함수의 미분 활용',
      gen(r, level) {
        if (level === 1) {
          const a = r.pick([100, 200, 300, 500]);
          const b = r.int(2, 3),
            c = r.int(1, 3);
          const right = `${a * b}e^{${b * c}}`;
          return {
            q: `어떤 세균의 $t$ 시간 후의 수가 $N(t)=${a}e^{${b}t}$ 일 때, $t=${c}$ 에서 세균 수의 순간변화율은?`,
            answer: texChoices(r, right, [`${a}e^{${b * c}}`, `${a * b * c}e^{${b * c}}`, `${a * b}${b * c - 1 === 1 ? 'e' : `e^{${b * c - 1}}`}`, `${a * b * b}e^{${b * c}}`, `${a * b}${c === 1 ? 'e' : `e^{${c}}`}`]),
            steps: [`$N'(t)=${a}e^{${b}t}\\times${b}=${a * b}e^{${b}t}$`, `$N'(${c})=${right}$`],
          };
        }
        if (level === 2) {
          const k = r.int(1, 2),
            Th = r.pick([5, 10, 20]),
            j = r.int(1, 6);
          const M0 = 2 ** k * Th * j;
          const right = cs(fr(-j), '\\ln 2');
          return {
            q: `반감기가 $${Th}$ 년인 방사성 물질 $${M0}\\text{ g}$ 의 $t$ 년 후의 양은 $M(t)=${M0}\\left(\\frac{1}{2}\\right)^{\\frac{t}{${Th}}}$ 입니다. $t=${k * Th}$ 에서 $M(t)$ 의 순간변화율은? (단위: g/년)`,
            answer: texChoices(r, right, [cs(fr(-j * Th), '\\ln 2'), cs(fr(-j * 2 ** k), '\\ln 2'), cs(fr(j), '\\ln 2'), `-\\frac{${j}}{\\ln 2}`, cs(fr(-j, 2), '\\ln 2')]),
            steps: [
              `$M'(t)=${M0}\\left(\\frac{1}{2}\\right)^{\\frac{t}{${Th}}}\\times\\frac{1}{${Th}}\\ln\\frac{1}{2}=-\\frac{${M0}\\ln 2}{${Th}}\\left(\\frac{1}{2}\\right)^{\\frac{t}{${Th}}}$`,
              `$t=${k * Th}$: $\\left(\\frac{1}{2}\\right)^{${k}}=\\frac{1}{${2 ** k}}$ → $M'(${k * Th})=-\\frac{${M0}}{${Th}\\times${2 ** k}}\\ln 2=${right}$`,
            ],
          };
        }
        const [a, j] = r.pick([
          [5, 2],
          [5, 4],
          [5, 6],
          [5, 8],
          [10, 2],
          [10, 3],
          [10, 4],
          [20, 2],
        ] as [number, number][]);
        const B = 2 * a * j;
        const A = r.pick([20, 25]);
        const right = cs(fr(-j), '\\ln 2');
        return {
          q: `뜨거운 물을 실온에 두었더니 $t$ 분 후의 온도가 $f(t)=${A}+${B}e^{-kt}\\,({}^{\\circ}\\mathrm{C})$ 였고, $${a}$ 분 후의 온도는 $${A + B / 2}\\,{}^{\\circ}\\mathrm{C}$ 였습니다. $t=${a}$ 에서 온도의 순간변화율은? (단, $k$ 는 양의 상수, 단위: ${'${}^{\\circ}\\mathrm{C}$'}/분)`,
          answer: texChoices(r, right, [cs(fr(-2 * j), '\\ln 2'), cs(fr(-j * a), '\\ln 2'), cs(fr(j), '\\ln 2'), `-\\frac{${j}}{\\ln 2}`, cs(fr(-B, a), '')]),
          steps: [
            `$f(${a})=${A}+${B}e^{-${a}k}=${A + B / 2}$ → $e^{-${a}k}=\\frac{1}{2}$, $k=\\frac{\\ln 2}{${a}}$`,
            `$f'(t)=-${B}ke^{-kt}$`,
            `$f'(${a})=-${B}\\times\\frac{\\ln 2}{${a}}\\times\\frac{1}{2}=${right}$`,
          ],
        };
      },
    },
  ],

  'cal2-4': [
    {
      id: 'related-rates',
      title: '시각에 대한 변화율 (활용)',
      gen(r, level) {
        if (level === 1) {
          const c = r.int(1, 5),
            R = r.int(2, 12);
          const k = 2 * R * c;
          const right = `${k}\\pi`;
          return {
            q: `잔잔한 호수에 생긴 원 모양의 물결의 반지름이 매초 $${c}\\text{ cm}$ 씩 늘어납니다. 반지름이 $${R}\\text{ cm}$ 가 되는 순간, 원의 넓이의 변화율은? (단위: $\\text{cm}^{2}/\\text{s}$)`,
            answer: texChoices(r, right, [`${R * c}\\pi`, `${R * R * c}\\pi`, `${2 * R}\\pi`, `${4 * R * c}\\pi`, `${k}`], 5, (i) => `${k + 2 * (i + 1)}\\pi`),
            steps: [`$S=\\pi r^{2}$ 을 시각 $t$ 에 대하여 미분: $\\frac{dS}{dt}=2\\pi r\\frac{dr}{dt}$`, `$=2\\pi\\times${R}\\times${c}=${right}$`],
          };
        }
        if (level === 2) {
          const kk = r.pick([16, 32, 36, 48, 64, 100]),
            R = r.int(1, 5);
          const ans = fr(kk, 4 * R * R);
          return {
            q: `구 모양의 풍선에 공기를 넣어 부피가 매초 $${kk}\\pi\\text{ cm}^{3}$ 씩 늘어나고 있습니다. 반지름이 $${R}\\text{ cm}$ 가 되는 순간, 반지름이 늘어나는 속도는 몇 cm/s 인가요?`,
            answer: fAns(ans, 'cm/s'),
            steps: [`$V=\\frac{4}{3}\\pi r^{3}$ → $\\frac{dV}{dt}=4\\pi r^{2}\\frac{dr}{dt}$`, `$${kk}\\pi=4\\pi\\times${R * R}\\times\\frac{dr}{dt}$`, `$\\frac{dr}{dt}=\\frac{${kk}}{${4 * R * R}}=${T(ans)}$ (cm/s)`],
          };
        }
        const [x, y, L] = r.pick(TRIPLES.slice(0, 5).flatMap(([p, q, h]) => [[p, q, h], [q, p, h]] as [number, number, number][]));
        const v = r.int(1, 3);
        const ans = fr(x * v, y);
        return {
          q: `길이가 $${L}\\text{ m}$ 인 사다리가 수직인 벽에 기대어 있습니다. 사다리의 아래 끝이 벽에서 매초 $${v}\\text{ m}$ 의 속도로 멀어질 때, 아래 끝이 벽에서 $${x}\\text{ m}$ 떨어진 순간 사다리의 위 끝이 미끄러져 내려가는 속력은 몇 m/s 인가요?`,
          answer: fAns(ans, 'm/s'),
          steps: [`아래 끝까지 거리 $x$, 위 끝의 높이 $y$: $x^{2}+y^{2}=${L * L}$`, `$t$ 에 대하여 미분: $2x\\frac{dx}{dt}+2y\\frac{dy}{dt}=0$`, `$x=${x}$ 일 때 $y=${y}$: $${x}\\times${v}+${y}\\frac{dy}{dt}=0$ → $\\frac{dy}{dt}=-${T(ans)}$, 속력 $${T(ans)}$`],
        };
      },
    },
  ],

  'cal2-5': [
    {
      id: 'optimize-trans',
      title: '최대·최소의 활용 (삼각·지수함수)',
      gen(r, level) {
        if (level === 1) {
          const R = r.int(2, 10);
          return {
            q: `반지름의 길이가 $${R}$ 인 반원에 내접하는 직사각형이 있습니다 (한 변은 지름 위에 있음). 중심과 직사각형의 위쪽 꼭짓점을 이은 선분이 지름과 이루는 각을 $\\theta$ 라 할 때, 직사각형의 넓이의 최댓값을 구하세요.`,
            answer: { type: 'num', value: R * R },
            steps: [`가로 $2\\times${R}\\cos\\theta$, 세로 $${R}\\sin\\theta$ → $S(\\theta)=${2 * R * R}\\sin\\theta\\cos\\theta=${R * R}\\sin2\\theta$`, `$S'(\\theta)=${2 * R * R}\\cos2\\theta=0$ → $\\theta=\\frac{\\pi}{4}$ $\\left(0<\\theta<\\frac{\\pi}{2}\\right)$`, `최댓값 $S\\left(\\frac{\\pi}{4}\\right)=${R * R}$`],
          };
        }
        if (level === 2) {
          const a = 2 * r.int(1, 4);
          const right = cs(fr(3 * a * a, 4), '\\sqrt{3}');
          return {
            q: `폭이 $${3 * a}\\text{ cm}$ 인 철판의 양쪽을 $${a}\\text{ cm}$ 씩 같은 각도로 접어 올려 단면이 등변사다리꼴인 물받이를 만듭니다. 접어 올린 면이 수평면과 이루는 각을 $\\theta\\,\\left(0<\\theta<\\frac{\\pi}{2}\\right)$ 라 할 때, 단면의 넓이의 최댓값은?`,
            answer: texChoices(r, right, [cs(fr(a * a, 1), '\\sqrt{3}'), cs(fr(a * a, 4), '\\sqrt{3}'), cs(fr(a * a, 2), '\\sqrt{3}'), T(fr(3 * a * a, 2)), String(a * a)]),
            steps: [
              `높이 $${a}\\sin\\theta$, 윗변 $${a}+2\\times${a}\\cos\\theta$ → $S(\\theta)=\\frac{${a}+(${a}+${2 * a}\\cos\\theta)}{2}\\times${a}\\sin\\theta=${a * a}\\sin\\theta(1+\\cos\\theta)$`,
              `$S'(\\theta)=${a * a}(\\cos\\theta+\\cos2\\theta)=${a * a}(2\\cos\\theta-1)(\\cos\\theta+1)=0$ → $\\cos\\theta=\\frac{1}{2}$, $\\theta=\\frac{\\pi}{3}$`,
              `$S\\left(\\frac{\\pi}{3}\\right)=${a * a}\\times\\frac{\\sqrt{3}}{2}\\times\\frac{3}{2}=${right}$`,
            ],
          };
        }
        const a = r.pick([10, 20, 50, 100]),
          b = r.int(2, 5);
        const right = `\\frac{${a * b}}{e}`;
        return {
          q: `어느 상품의 가격이 $x$ 만 원일 때 판매량은 $${a}e^{-\\frac{x}{${b}}}$ 개로 예상됩니다. 판매 금액 $f(x)=${a}xe^{-\\frac{x}{${b}}}$ (만 원)의 최댓값은?`,
          answer: texChoices(r, right, [`${a * b}e`, `\\frac{${a}}{e}`, `\\frac{${a * b}}{e^{2}}`, `${a * b}`, `\\frac{${a * b * b}}{e}`]),
          steps: [`$f'(x)=${a}e^{-\\frac{x}{${b}}}\\left(1-\\frac{x}{${b}}\\right)$`, `$x=${b}$ 에서 $f'$ 의 부호가 $+$ 에서 $-$ 로 → 최대`, `$f(${b})=${a * b}e^{-1}=${right}$ (만 원)`],
        };
      },
    },
    {
      id: 'motion-curve',
      title: '평면 운동의 활용 (던진 물체·회전)',
      gen(r, level) {
        if (level === 1) {
          const u = r.int(3, 20),
            k = r.int(1, 4);
          return {
            q: `지면에서 비스듬히 던진 공의 $t$ 초 후의 위치가 $x=${u}t$, $y=${10 * k}t-5t^{2}$ (m) 입니다. 공이 가장 높이 올라간 시각과 그때 공의 속력을 구하세요.`,
            answer: {
              type: 'fields',
              fields: [
                { label: '시각', value: k, unit: '초' },
                { label: '속력', value: u, unit: 'm/s' },
              ],
            },
            steps: [`속도 $\\left(\\frac{dx}{dt}, \\frac{dy}{dt}\\right)=(${u}, ${10 * k}-10t)$`, `최고점에서 $\\frac{dy}{dt}=0$ → $t=${k}$`, `그때 속도 $(${u}, 0)$, 속력 $${u}$`],
          };
        }
        if (level === 2) {
          const [p, q, h] = r.pick([
            [15, 20, 25],
            [20, 15, 25],
            [6, 8, 10],
            [8, 6, 10],
            [12, 5, 13],
            [5, 12, 13],
            [24, 10, 26],
            [10, 24, 26],
          ] as [number, number, number][]);
          const land = fr(q, 5);
          return {
            q: `지면에서 비스듬히 던진 공의 $t$ 초 후의 위치가 $x=${p}t$, $y=${q}t-5t^{2}$ (m) 입니다. 공이 지면에 떨어지는 순간의 속력을 구하세요.`,
            answer: { type: 'num', value: h, unit: 'm/s' },
            steps: [`$y=0$: $t(${q}-5t)=0$, $t>0$ 이므로 $t=${T(land)}$`, `속도 $(${p}, ${q}-10t)$ → $t=${T(land)}$ 에서 $(${p}, ${-q})$`, `속력 $\\sqrt{${p}^{2}+${q}^{2}}=${h}$`],
          };
        }
        const R = r.int(1, 6),
          w = r.int(2, 4);
        return {
          q: `좌표평면 위를 움직이는 점 P 의 시각 $t$ 에서의 위치가 $x=${R}\\cos${w}t$, $y=${R}\\sin${w}t$ 입니다. 점 P 의 속력과 가속도의 크기를 구하세요.`.replace(/=1\\(cos|sin)/g, '=\\$1'),
          answer: {
            type: 'fields',
            fields: [
              { label: '속력', value: R * w },
              { label: '가속도의 크기', value: R * w * w },
            ],
          },
          steps: [
            `속도 $(${-R * w}\\sin${w}t, ${R * w}\\cos${w}t)$ → 속력 $\\sqrt{${R * R * w * w}(\\sin^{2}${w}t+\\cos^{2}${w}t)}=${R * w}$`,
            `가속도 $(${-R * w * w}\\cos${w}t, ${-R * w * w}\\sin${w}t)$ → 크기 $${R * w * w}$`,
          ],
        };
      },
    },
  ],

  'cal2-6': [
    {
      id: 'integral-word',
      title: '여러 가지 적분의 활용 (누적량)',
      gen(r, level) {
        if (level === 1) {
          const a = r.int(2, 10),
            k = r.int(2, 6);
          return {
            q: `물탱크에 물을 넣기 시작한 지 $t$ 분 후 물이 들어오는 속도가 $${a}e^{t}$ (L/분) 입니다. $t=0$ 에서 $t=\\ln${k}$ 까지 들어온 물의 양은 몇 L 인가요?`,
            answer: { type: 'num', value: a * (k - 1), unit: 'L' },
            steps: [`$\\int_{0}^{\\ln${k}}${a}e^{t}dt=\\left[${a}e^{t}\\right]_{0}^{\\ln${k}}$`, `$=${a}(${k}-1)=${a * (k - 1)}$ (L)`],
          };
        }
        if (level === 2) {
          const a = r.int(2, 10),
            k = r.int(1, 3);
          const upper = k === 1 ? 'e-1' : `e^{${k}}-1`;
          return {
            q: `어느 앱을 출시한 지 $t$ 개월 후의 가입자 수의 증가 속도가 $\\frac{${a}}{t+1}$ (만 명/개월) 입니다. 출시 후 $t=${upper}$ 개월이 될 때까지 늘어난 가입자는 몇 만 명인가요?`,
            answer: { type: 'num', value: a * k, unit: '만 명' },
            steps: [`$\\int_{0}^{${upper}}\\frac{${a}}{t+1}dt=\\left[${a}\\ln(t+1)\\right]_{0}^{${upper}}$`, `$=${a}\\ln ${k === 1 ? 'e' : `e^{${k}}`}=${a * k}$ (만 명)`],
          };
        }
        const a = r.int(1, 9);
        const two = r.chance(0.5);
        const c = (n: number) => (n === 1 ? '' : String(n));
        const right = two ? `${a}-\\frac{${3 * a}}{e^{2}}` : `${a}-\\frac{${2 * a}}{e}`;
        const wr = two
          ? [`${a}-\\frac{${2 * a}}{e^{2}}`, `${a}+\\frac{${3 * a}}{e^{2}}`, `\\frac{${3 * a}}{e^{2}}`, `${2 * a}-\\frac{${3 * a}}{e^{2}}`, `${a}-\\frac{${a}}{e^{2}}`]
          : [`${a}-\\frac{${a}}{e}`, `${a}+\\frac{${2 * a}}{e}`, `\\frac{${2 * a}}{e}`, `${2 * a}-\\frac{${a}}{e}`, `\\frac{${a}}{e}`];
        const T2 = two ? 2 : 1;
        return {
          q: `어떤 약을 복용한 지 $t$ 시간 후 혈액으로 흡수되는 속도가 $${c(a)}te^{-t}$ (mg/시간) 입니다. 복용 후 $${T2}$ 시간 동안 흡수된 약의 양은?`,
          answer: texChoices(r, right, wr),
          steps: [
            `부분적분: $\\int te^{-t}dt=-te^{-t}-e^{-t}+C=-(t+1)e^{-t}+C$`,
            `$\\int_{0}^{${T2}}${c(a)}te^{-t}dt=${c(a)}\\left[-(t+1)e^{-t}\\right]_{0}^{${T2}}=${a === 1 ? '' : `${a}`}${a === 1 ? '' : '\\left('}1-${T2 + 1}e^{-${T2}}${a === 1 ? '' : '\\right)'}$`,
            `$=${right}$ (mg)`,
          ],
        };
      },
    },
  ],

  'cal2-7': [
    {
      id: 'volume-word',
      title: '부피의 활용 (그릇·입체)',
      gen(r, level) {
        if (level === 1) {
          const a = r.int(2, 10),
            h = r.int(2, 10);
          const V = fr(a * h * h, 2);
          return {
            q: `어떤 그릇에 물을 부을 때, 바닥에서 높이가 $x\\text{ cm}$ 인 곳의 수면의 넓이가 $${a}x\\text{ cm}^{2}$ 입니다. 물의 높이가 $${h}\\text{ cm}$ 가 될 때까지 부은 물의 부피를 구하세요.`,
            answer: fAns(V, 'cm³'),
            steps: [`$V=\\int_{0}^{${h}}${a}x\\,dx=\\left[${fr(a, 2).eq(1) ? '' : T(fr(a, 2))}x^{2}\\right]_{0}^{${h}}$`, `$=${T(V)}$ (cm³)`],
          };
        }
        if (level === 2) {
          const m = r.int(1, 4),
            a = r.pick([3, 6, 9]);
          const h = m * m;
          const V = fr(2 * a * m ** 3, 3);
          return {
            q: `어떤 그릇에 물을 부을 때, 바닥에서 높이가 $x\\text{ cm}$ 인 곳의 수면의 넓이가 $${a}\\sqrt{x}\\text{ cm}^{2}$ 입니다. 물의 높이가 $${h}\\text{ cm}$ 가 될 때까지 부은 물의 부피를 구하세요.`,
            answer: fAns(V, 'cm³'),
            steps: [`$V=\\int_{0}^{${h}}${a}x^{\\frac{1}{2}}dx=\\left[${T(fr(2 * a, 3))}x^{\\frac{3}{2}}\\right]_{0}^{${h}}$`, `$=${T(fr(2 * a, 3))}\\times${m ** 3}=${T(V)}$ (cm³)`],
          };
        }
        const R = r.int(1, 6);
        if (r.chance(0.5)) {
          const V = fr(16 * R ** 3, 3);
          return {
            q: `밑면이 반지름의 길이가 $${R}$ 인 원 $x^{2}+y^{2}=${R * R}$ 인 입체가 있습니다. 이 입체를 $x$ 축에 수직인 평면으로 자른 단면이 모두 정사각형일 때, 입체의 부피를 구하세요.`,
            answer: fAns(V),
            steps: [`$x$ 에서 단면의 한 변 $2\\sqrt{${R * R}-x^{2}}$, 넓이 $S(x)=4(${R * R}-x^{2})$`, `$V=\\int_{-${R}}^{${R}}4(${R * R}-x^{2})dx=8\\left[${R * R}x-\\frac{x^{3}}{3}\\right]_{0}^{${R}}$`, `$=${T(V)}$`],
          };
        }
        const right = cs(fr(4 * R ** 3, 3), '\\sqrt{3}');
        return {
          q: `밑면이 반지름의 길이가 $${R}$ 인 원 $x^{2}+y^{2}=${R * R}$ 인 입체가 있습니다. 이 입체를 $x$ 축에 수직인 평면으로 자른 단면이 모두 정삼각형일 때, 입체의 부피는?`,
          answer: texChoices(r, right, [cs(fr(16 * R ** 3, 3), ''), cs(fr(2 * R ** 3, 3), '\\sqrt{3}'), cs(fr(8 * R ** 3, 3), '\\sqrt{3}'), cs(fr(R ** 3, 3), '\\sqrt{3}'), cs(fr(4 * R ** 3, 3), '')]),
          steps: [`$x$ 에서 단면은 한 변이 $2\\sqrt{${R * R}-x^{2}}$ 인 정삼각형: $S(x)=\\frac{\\sqrt{3}}{4}\\times4(${R * R}-x^{2})=\\sqrt{3}(${R * R}-x^{2})$`, `$V=\\int_{-${R}}^{${R}}\\sqrt{3}(${R * R}-x^{2})dx=\\sqrt{3}\\times${T(fr(4 * R ** 3, 3))}$`, `$=${right}$`],
        };
      },
    },
    {
      id: 'motion-word',
      title: '속도로 위치·거리 구하기 (여러 함수)',
      gen(r, level) {
        if (level === 1) {
          const a = r.int(1, 6),
            k = r.int(1, 4);
          const up = k === 1 ? '\\frac{\\pi}{2}' : k === 2 ? '\\pi' : k === 3 ? '\\frac{3}{2}\\pi' : '2\\pi';
          return {
            q: `수직선 위를 움직이는 점 P 의 시각 $t$ 에서의 속도가 $v(t)=${a === 1 ? '' : a}\\cos t$ 일 때, $t=0$ 에서 $t=${up}$ 까지 점 P 가 움직인 거리를 구하세요.`,
            answer: { type: 'num', value: a * k },
            steps: [`$\\cos t$ 는 $\\frac{\\pi}{2}$ 마다 부호가 바뀌고, 각 구간에서 $\\int|\\cos t|dt=1$`, `거리 $=\\int_{0}^{${up}}|${a === 1 ? '' : a}\\cos t|dt=${a}\\times${k}=${a * k}$`],
          };
        }
        if (level === 2) {
          const a = 2 * r.int(1, 4),
            x0 = r.int(-5, 5);
          const j = r.int(0, 3);
          const up = ['\\frac{\\pi}{3}', '\\frac{\\pi}{2}', '\\frac{2}{3}\\pi', '\\pi'][j];
          const cv = [fr(1, 2), fr(0), fr(-1, 2), fr(-1)][j];
          const pos = fr(x0).add(fr(a).mul(fr(1).sub(cv)));
          return {
            q: `수직선 위를 움직이는 점 P 의 시각 $t$ 에서의 속도가 $v(t)=${a}\\sin t$ 이고, $t=0$ 일 때 점 P 의 위치가 $${x0}$ 입니다. $t=${up}$ 일 때 점 P 의 위치를 구하세요.`,
            answer: fAns(pos),
            steps: [`위치 $=${x0}+\\int_{0}^{${up}}${a}\\sin t\\,dt=${x0}+${a}\\left[-\\cos t\\right]_{0}^{${up}}$`, `$=${x0}+${a}\\left(1-\\cos${up}\\right)=${x0}+${a}\\times${T(fr(1).sub(cv))}=${T(pos)}$`],
          };
        }
        const k = r.int(2, 6),
          c = r.int(1, 3);
        const ce = c === 1 ? '' : String(c);
        return {
          q: `수직선 위를 움직이는 점 P 의 시각 $t$ 에서의 속도가 $v(t)=${c === 1 ? `e^{t}-${k}` : `${c}(e^{t}-${k})`}$ 일 때, $t=0$ 에서 $t=2\\ln${k}$ 까지 점 P 가 움직인 거리를 구하세요.`,
          answer: { type: 'num', value: c * (k - 1) ** 2 },
          steps: [
            `$v(t)=0$ 인 $t=\\ln${k}$ 에서 부호가 바뀜 ($0<t<\\ln${k}$ 에서 $v<0$)`,
            `$\\int_{0}^{\\ln${k}}${ce}(${k}-e^{t})dt=${ce}(${k}\\ln${k}-${k - 1})$, $\\int_{\\ln${k}}^{2\\ln${k}}${ce}(e^{t}-${k})dt=${ce}(${k * k - k}-${k}\\ln${k})$`.replace(/\(\)/g, ''),
            `거리 $=${ce}(${k * k}-${2 * k}+1)=${c * (k - 1) ** 2}$`,
          ],
        };
      },
    },
  ],
};
