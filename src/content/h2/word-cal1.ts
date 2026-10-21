// 미적분Ⅰ 활용(문장제) 유형 — cal1.ts 의 각 단원 skills 뒤에 덧붙임
import type { Skill } from '../../core/types';
import { F } from '../../core/frac';
import { poly } from '../../core/tex';
import { P, pDef, pEval, pInt, piTex, tch } from './util';

const pp = (p: F[], v = 't') => poly(p, v);
const sq = (n: number) => (n < 0 ? `(${n})` : `${n}`);

export const CAL1_WORD: Record<string, Skill[]> = {
  'cal1-3': [
    {
      id: 'rate-word',
      title: '변화율의 활용',
      gen(r, level) {
        if (level <= 2) {
          const v0 = r.pick([20, 25, 30, 35, 40]);
          const top = v0 / 5;
          const h = P(-5, v0, 0);
          const ht = `h(t)=${pp(h)}`;
          const intro = `지면에서 똑바로 위로 던진 공의 $t$ 초 후의 높이가 $${ht}$ (m) 입니다.`;
          if (level === 1) {
            const a = r.int(0, top - 2),
              b = r.int(a + 1, top - 1);
            const avg = v0 - 5 * (a + b);
            return {
              q: `${intro} $t=${a}$ 에서 $t=${b}$ 까지 공의 평균 속도를 구하세요.`,
              answer: { type: 'num', value: avg, unit: 'm/s' },
              steps: [`평균 속도 $=\\frac{h(${b})-h(${a})}{${b}-${a}}$`, `$h(${b})=${pEval(h, b).tex()}$, $h(${a})=${pEval(h, a).tex()}$`, `$\\frac{${pEval(h, b).sub(pEval(h, a)).tex()}}{${b - a}}=${avg}$ (m/s)`],
            };
          }
          const t0 = r.int(1, top - 1);
          const v = v0 - 10 * t0;
          return {
            q: `${intro} $t=${t0}$ 일 때 공의 순간 속도를 구하세요.`,
            answer: { type: 'num', value: v, unit: 'm/s' },
            steps: [`순간 속도는 $h'(t)=${pp(P(-10, v0))}$`, `$h'(${t0})=${v0}-${10 * t0}=${v}$ (m/s)${v < 0 ? ' — 음수이므로 공이 내려오는 중' : v === 0 ? ' — 최고점' : ''}`],
          };
        }
        if (r.chance(0.5)) {
          const a = r.int(2, 10),
            c = r.int(1, 4),
            t0 = r.int(1, 5);
          const side = a + c * t0;
          return {
            q: `한 변의 길이가 $${a}\\text{ cm}$ 인 정사각형의 각 변의 길이가 매초 $${c}\\text{ cm}$ 씩 늘어납니다. $${t0}$ 초 후 이 정사각형의 넓이의 순간변화율을 구하세요.`,
            answer: { type: 'num', value: 2 * c * side, unit: 'cm²/s' },
            steps: [`$t$ 초 후 한 변: $${a}+${c}t$, 넓이 $S(t)=(${pp(P(c, a))})^{2}$`, `$S'(t)=2(${pp(P(c, a))})\\times${c}$`, `$S'(${t0})=2\\times${side}\\times${c}=${2 * c * side}$ (cm²/s)`],
          };
        }
        const c = r.int(1, 5),
          t0 = r.int(1, 6);
        const k = 2 * c * c * t0;
        return {
          q: `잔잔한 호수에 돌을 던졌더니 원 모양의 물결이 생겨 반지름이 매초 $${c}\\text{ cm}$ 씩 늘어났습니다. 돌을 던지고 $${t0}$ 초 후 원의 넓이의 순간변화율은? (단위: $\\text{cm}^{2}/\\text{s}$)`,
          answer: tch(r, `${k}\\pi`, [`${k / 2}\\pi`, `${c * c * t0 * t0}\\pi`, `${2 * c * t0}\\pi`, `${k * 2}\\pi`, `${c * c}\\pi`], 5, (i) => `${k + 2 * (i + 1)}\\pi`),
          steps: [`$t$ 초 후 반지름 $${c}t$, 넓이 $S(t)=${c === 1 ? '\\pi t^{2}' : `\\pi(${c}t)^{2}=${c * c}\\pi t^{2}`}$`, `$S'(t)=${2 * c * c}\\pi t$`, `$S'(${t0})=${k}\\pi$`],
        };
      },
    },
  ],

  'cal1-4': [
    {
      id: 'optimize-word',
      title: '최대·최소의 활용 (넓이·부피)',
      gen(r, level) {
        if (level === 1) {
          const k = r.int(1, 5);
          const a = 6 * k;
          return {
            q: `한 변의 길이가 $${a}\\text{ cm}$ 인 정사각형 모양의 종이의 네 귀퉁이에서 한 변의 길이가 $x\\text{ cm}$ 인 정사각형을 잘라 내고, 남은 부분을 접어 뚜껑이 없는 직육면체 상자를 만들려고 합니다. 상자의 부피가 최대일 때 $x$ 의 값과 그때의 부피를 구하세요.`,
            answer: {
              type: 'fields',
              fields: [
                { label: 'x', value: k, unit: 'cm' },
                { label: '최대 부피', value: 16 * k ** 3, unit: 'cm³' },
              ],
            },
            steps: [
              `밑면의 한 변 $${a}-2x$, 높이 $x$ → $V(x)=x(${a}-2x)^{2}$ $(0<x<${a / 2})$`,
              `$V'(x)=(${a}-2x)^{2}-4x(${a}-2x)=(${a}-2x)(${a}-6x)$ → $x=${k}$ 에서 증가에서 감소로`,
              `$V(${k})=${k}\\times${4 * k}^{2}=${16 * k ** 3}$ (cm³)`,
            ],
          };
        }
        if (level === 2) {
          // 높이가 지나치게 크지 않게 (최고 높이 27 m 이하)
          const m = r.int(1, 3),
            b = m === 3 ? 1 : r.int(1, 2);
          const c = 3 * b * m * m;
          const curve = `y=${c}-${b === 1 ? '' : b}x^{2}`;
          const what = r.pick(['터널', '창고 출입구', '다리 아래 통로']);
          return {
            q: `어느 ${what}의 단면은 곡선 $${curve}$ 과 $x$ 축으로 둘러싸인 모양입니다 (단위: m). 이 단면 안에 한 변이 $x$ 축 위에 있는 직사각형 모양의 문을 만들 때, 문의 넓이의 최댓값을 구하세요.`,
            answer: { type: 'num', value: 4 * b * m ** 3, unit: 'm²' },
            steps: [
              `오른쪽 위 꼭짓점을 $(x, ${c}-${b === 1 ? '' : b}x^{2})$ 이라 하면 넓이 $S(x)=2x(${c}-${b === 1 ? '' : b}x^{2})=${pp(P(-2 * b, 0, 2 * c, 0), 'x')}$`,
              `$S'(x)=${pp(P(-6 * b, 0, 2 * c), 'x')}=0$ → $x=${m}$ (이때 극대이자 최대)`,
              `$S(${m})=2\\times${m}\\times${c - b * m * m}=${4 * b * m ** 3}$ (m²)`,
            ],
          };
        }
        const a = r.int(1, 3),
          b = r.int(1, 4);
        const V = new F(4 * a * a * b);
        return {
          q: `밑면의 반지름의 길이가 $${3 * a}$, 높이가 $${3 * b}$ 인 원뿔에 내접하는 원기둥이 있습니다 (원기둥의 밑면은 원뿔의 밑면 위에 있음). 원기둥의 부피의 최댓값은?`,
          answer: tch(r, piTex(V), [piTex(new F(27 * a * a * b, 8)), piTex(new F(9 * a * a * b)), piTex(new F(12 * a * a * b)), piTex(new F(8 * a * a * b)), piTex(new F(2 * a * a * b))]),
          steps: [
            `원기둥의 반지름 $x$, 높이 $h$: 닮음으로 $h=${3 * b}\\left(1-\\frac{x}{${3 * a}}\\right)$`,
            `$V(x)=\\pi x^{2}\\times${3 * b}\\left(1-\\frac{x}{${3 * a}}\\right)$, $V'(x)=0$ 에서 $x=${2 * a}$ (반지름의 $\\frac{2}{3}$)`,
            `$V(${2 * a})=\\pi\\times${4 * a * a}\\times${b}=${piTex(V)}$`,
          ],
        };
      },
    },
    {
      id: 'motion-word',
      title: '위로 던진 물체의 운동',
      gen(r, level) {
        if (level === 1) {
          const k = r.int(1, 4);
          const h0 = r.pick([0, 5, 10, 15, 20, 25, 30]);
          const h = P(-5, 10 * k, h0);
          return {
            q: `${h0 === 0 ? '지면에서' : `지면으로부터 높이가 $${h0}\\text{ m}$ 인 곳에서`} 똑바로 위로 던진 공의 $t$ 초 후의 높이가 $h(t)=${pp(h)}$ (m) 입니다. 공이 최고 높이에 도달하는 시각과 최고 높이를 구하세요.`,
            answer: {
              type: 'fields',
              fields: [
                { label: '시각', value: k, unit: '초' },
                { label: '최고 높이', value: h0 + 5 * k * k, unit: 'm' },
              ],
            },
            steps: [`속도 $v(t)=h'(t)=${pp(P(-10, 10 * k))}$`, `최고 높이에서 $v(t)=0$ → $t=${k}$`, `$h(${k})=${h0 + 5 * k * k}$ (m)`],
          };
        }
        if (level === 2) {
          const T = r.int(2, 6),
            s = r.int(0, T - 1);
          const h = P(-5, 5 * (T - s), 5 * T * s);
          return {
            q: `${s === 0 ? '지면에서' : `높이가 $${5 * T * s}\\text{ m}$ 인 건물 옥상에서`} 똑바로 위로 던진 공의 $t$ 초 후의 높이가 $h(t)=${pp(h)}$ (m) 입니다. 공이 지면에 떨어지는 순간의 속도를 구하세요.`,
            answer: { type: 'num', value: -5 * (T + s), unit: 'm/s' },
            steps: [`$h(t)=0$: $-5(t-${T})${s === 0 ? 't' : `(t+${s})`}=0$, $t>0$ 이므로 $t=${T}$`, `$v(t)=${pp(P(-10, 5 * (T - s)))}$`, `$v(${T})=${-10 * T}+${5 * (T - s)}=${-5 * (T + s)}$ (m/s, 아래 방향이라 음수)`],
          };
        }
        const t0 = r.int(1, 4);
        let s = r.int(0, 3);
        if (s === t0) s = 0;
        const alpha = -3 * s * t0;
        const beta = new F(3 * (t0 - s), 2);
        const xP = P(1, 0, alpha, 0),
          xQ = [beta, new F(0), new F(0)];
        const dist = new F(t0 * t0 * (t0 + 3 * s), 2);
        return {
          q: `원점에서 동시에 출발하여 수직선 위를 움직이는 두 점 P, Q 의 시각 $t$ 에서의 위치가 각각 $x_{P}(t)=${pp(xP)}$, $x_{Q}(t)=${pp(xQ)}$ 입니다. $t>0$ 에서 두 점의 속도가 같아지는 순간, 두 점 사이의 거리를 구하세요.`,
          answer: { type: 'num', value: dist.value, display: 'frac' },
          steps: [
            `$v_{P}(t)=${pp(P(3, 0, alpha))}$, $v_{Q}(t)=${pp([beta.mul(2), new F(0)])}$`,
            `$v_{P}=v_{Q}$: $3t^{2}${s - t0 === 0 ? '' : s - t0 > 0 ? `+${3 * (s - t0)}t` : `-${3 * (t0 - s)}t`}${alpha === 0 ? '' : alpha}=0$ → $3(t-${t0})${s === 0 ? 't' : `(t+${s})`}=0$, $t=${t0}$`,
            `$|x_{P}(${t0})-x_{Q}(${t0})|=\\left|${pEval(xP, t0).tex()}-${pEval(xQ, t0).n < 0 ? `\\left(${pEval(xQ, t0).tex()}\\right)` : pEval(xQ, t0).tex()}\\right|=${dist.tex()}$`,
          ],
        };
      },
    },
  ],

  'cal1-5': [
    {
      id: 'rate-to-amount',
      title: '변화율로 양 구하기',
      gen(r, level) {
        if (level === 1) {
          const a = r.pick([2, 4, 6]),
            b = r.int(1, 6),
            c = r.int(3, 20),
            T = r.int(2, 8);
          const H = [new F(a / 2), new F(b), new F(c)];
          const val = pEval(H, T);
          return {
            q: `어떤 식물의 $t$ 주 후의 키를 $h(t)$ (cm) 라 하면 키의 변화율은 $h'(t)=${pp(P(a, b))}$ 입니다. 처음 키가 $${c}\\text{ cm}$ 일 때, $${T}$ 주 후의 키를 구하세요.`,
            answer: { type: 'num', value: val.value, unit: 'cm' },
            steps: [`$h(t)=\\int(${pp(P(a, b))})dt=${pp(P(a / 2, b, 0))}+C$`, `$h(0)=${c}$ 이므로 $C=${c}$`, `$h(${T})=${val.tex()}$ (cm)`],
          };
        }
        if (level === 2) {
          const a = r.pick([2, 4, 6]),
            b = r.int(1, 10),
            C0 = r.int(5, 50) * 10;
          const m = r.int(1, 4),
            n = m + r.int(2, 8);
          const Cf = [new F(a / 2), new F(b), new F(C0)];
          const Cm = pEval(Cf, m),
            Cn = pEval(Cf, n);
          return {
            q: `어느 공장에서 제품 $x$ 개를 만드는 데 드는 비용을 $C(x)$ (만 원) 라 하면 $C'(x)=${pp(P(a, b), 'x')}$ 입니다. 제품 $${m}$ 개를 만드는 비용이 $${Cm.tex()}$ 만 원일 때, $${n}$ 개를 만드는 비용은 몇 만 원인가요?`,
            answer: { type: 'num', value: Cn.value, unit: '만 원' },
            steps: [`$C(x)=${pp(P(a / 2, b, 0), 'x')}+K$`, `$C(${m})=${pEval(P(a / 2, b, 0), m).tex()}+K=${Cm.tex()}$ → $K=${C0}$`, `$C(${n})=${pEval(P(a / 2, b, 0), n).tex()}+${C0}=${Cn.tex()}$ (만 원)`],
          };
        }
        const b = r.pick([2, 4, 6]),
          T = r.int(2, 8),
          V0 = r.int(1, 10) * 10;
        const a = b * T;
        const Vmax = V0 + (b * T * T) / 2;
        return {
          q: `물탱크의 $t$ 분 후의 물의 양을 $V(t)$ (L) 라 하면 $V'(t)=${pp(P(-b, a))}$ 입니다. 처음 물의 양이 $${V0}\\text{ L}$ 일 때, 물의 양이 최대가 되는 시각과 그때의 물의 양을 구하세요.`,
          answer: {
            type: 'fields',
            fields: [
              { label: '시각', value: T, unit: '분' },
              { label: '최대 양', value: Vmax, unit: 'L' },
            ],
          },
          steps: [`$V(t)=${pp(P(-b / 2, a, 0))}+${V0}$ ($V(0)=${V0}$)`, `$V'(t)=0$ 에서 $t=${T}$, 이 좌우에서 $V'$ 의 부호가 $+$ 에서 $-$ 로 → 최대`, `$V(${T})=${-(b / 2) * T * T}+${a * T}+${V0}=${Vmax}$ (L)`],
        };
      },
    },
  ],

  'cal1-6': [
    {
      id: 'accumulate-word',
      title: '정적분으로 누적량 구하기',
      gen(r, level) {
        if (level === 1) {
          const a = r.pick([2, 4, 6]),
            b = r.int(1, 10),
            T = r.int(2, 10);
          const tot = pDef(P(a, b), 0, T);
          return {
            q: `물탱크에 물을 넣기 시작하여 $t$ 분 후에 물이 들어오는 속도가 $r(t)=${pp(P(a, b))}$ (L/분) 입니다. 처음 $${T}$ 분 동안 들어온 물의 양은 몇 L 인가요?`,
            answer: { type: 'num', value: tot.value, unit: 'L' },
            steps: [`$\\int_{0}^{${T}}(${pp(P(a, b))})dt=\\left[${pp(P(a / 2, b, 0))}\\right]_{0}^{${T}}$`, `$=${tot.tex()}$ (L)`],
          };
        }
        if (level === 2) {
          const a = r.pick([2, 4, 6]),
            b = r.int(1, 8),
            c = r.int(2, 15),
            T = r.int(3, 10),
            V0 = r.int(5, 20) * 10;
          const net = pDef(P(a, b - c), 0, T);
          const V = net.add(V0);
          if (V.value <= 0) return this.gen(r, level);
          return {
            q: `물 $${V0}\\text{ L}$ 가 들어 있는 수조에서 물을 내보내면서 동시에 물을 넣습니다. $t$ 분 후 물이 들어오는 속도는 $${pp(P(a, b))}$ (L/분), 나가는 속도는 $${c}$ (L/분) 로 일정합니다. $${T}$ 분 후 수조에 들어 있는 물의 양은 몇 L 인가요?`,
            answer: { type: 'num', value: V.value, unit: 'L' },
            steps: [`물의 양의 변화율: $(${pp(P(a, b))})-${c}=${pp(P(a, b - c))}$`, `$\\int_{0}^{${T}}(${pp(P(a, b - c))})dt=${net.tex()}$`, `$${V0}${net.n < 0 ? '' : '+'}${net.tex()}=${V.tex()}$ (L)`],
          };
        }
        const a = r.int(1, 4),
          b = r.int(1, 10),
          k = r.int(2, 10);
        const S = a * k * k + b * k;
        return {
          q: `어떤 파일을 내려받기 시작한 지 $t$ 초 후의 내려받는 속도가 $r(t)=${pp(P(2 * a, b))}$ (MB/초) 입니다. 크기가 $${S}\\text{ MB}$ 인 파일을 모두 내려받는 데 몇 초가 걸리나요?`,
          answer: { type: 'num', value: k, unit: '초' },
          steps: [`$k$ 초 동안 내려받은 양: $\\int_{0}^{k}(${pp(P(2 * a, b))})dt=${pp(P(a, b, 0), 'k')}$`, `$${pp(P(a, b, -S), 'k')}=0$ → $(k-${k})(${pp(P(a, a * k + b), 'k')})=0$`, `$k>0$ 이므로 $k=${k}$ (초)`],
        };
      },
    },
  ],

  'cal1-7': [
    {
      id: 'motion-integral',
      title: '속도로 위치·거리 구하기 (활용)',
      gen(r, level) {
        if (level === 1) {
          const k = r.int(1, 4);
          const h0 = r.pick([0, 5, 10, 20, 30, 40]);
          return {
            q: `${h0 === 0 ? '지면에서' : `지면으로부터 $${h0}\\text{ m}$ 높이에서`} 똑바로 위로 쏘아 올린 물체의 $t$ 초 후의 속도가 $v(t)=${pp(P(-10, 10 * k))}$ (m/s) 입니다. 이 물체가 도달하는 최고 높이는 지면으로부터 몇 m 인가요?`,
            answer: { type: 'num', value: h0 + 5 * k * k, unit: 'm' },
            steps: [`최고 높이에서 $v(t)=0$ → $t=${k}$`, `$${h0}+\\int_{0}^{${k}}(${pp(P(-10, 10 * k))})dt=${h0}+\\left[${pp(P(-5, 10 * k, 0))}\\right]_{0}^{${k}}$`, `$=${h0}+${5 * k * k}=${h0 + 5 * k * k}$ (m)`],
          };
        }
        if (level === 2) {
          const T = r.int(1, 5),
            b = r.int(-4, 4),
            c = r.int(1, 6);
          const vP = P(3, b, c),
            vQ = P(b + 2 * T, c);
          return {
            q: `원점에서 동시에 출발하여 수직선 위를 움직이는 두 점 P, Q 의 시각 $t$ 에서의 속도가 각각 $v_{P}(t)=${pp(vP)}$, $v_{Q}(t)=${pp(vQ)}$ 입니다. 출발한 뒤 두 점이 다시 만나는 시각을 구하세요.`,
            answer: { type: 'num', value: T, unit: '초' },
            steps: [
              `$x_{P}(t)-x_{Q}(t)=\\int_{0}^{t}\\{v_{P}(s)-v_{Q}(s)\\}ds=\\int_{0}^{t}(${pp(P(3, -2 * T, 0), 's')})ds$`,
              `$=${pp(P(1, -T, 0, 0))}=t^{2}(t-${T})$`,
              `$t>0$ 에서 $0$ 이 되는 시각: $t=${T}$`,
            ],
          };
        }
        const k = r.int(1, 3),
          m = r.int(1, 2),
          sg = r.sign();
        const T = 3 * m;
        const v = P(3 * k * sg, -2 * T * k * sg, 0);
        return {
          q: `원점을 출발하여 수직선 위를 움직이는 점 P 의 시각 $t$ 에서의 속도가 $v(t)=${pp(v)}$ 입니다. 점 P 가 출발한 뒤 다시 원점으로 돌아올 때까지 움직인 거리를 구하세요.`,
          answer: { type: 'num', value: 8 * k * m ** 3 },
          steps: [
            `위치 $x(t)=${pp(pInt(v))}=${sg * k === 1 ? '' : sg * k === -1 ? '-' : sg * k}t^{2}(t-${T})$ → 다시 원점: $t=${T}$`,
            `$v(t)=0$ 인 $t=${2 * m}$ 에서 운동 방향이 바뀜, $|x(${2 * m})|=${4 * k * m ** 3}$`,
            `거리 $=\\int_{0}^{${T}}|v(t)|dt=${4 * k * m ** 3}+${4 * k * m ** 3}=${8 * k * m ** 3}$`,
          ],
          hint: '움직인 거리는 $|v(t)|$ 를 적분해요. 방향이 바뀌는 시각에서 구간을 나눠 보세요.',
        };
      },
    },
    {
      id: 'area-word',
      title: '넓이의 활용',
      gen(r, level) {
        if (level === 1) {
          const a = r.int(2, 6),
            h = r.pick([3, 6, 9, 12]);
          const what = r.pick(['아치형 출입문', '포물선 모양 터널 입구', '아치형 다리 밑 통로']);
          const coef = new F(h, a * a);
          return {
            q: `폭이 $${2 * a}\\text{ m}$, 높이가 $${h}\\text{ m}$ 인 ${what}의 단면은 포물선 $y=${h}-${coef.eq(1) ? '' : coef.tex()}x^{2}$ 과 $x$ 축으로 둘러싸인 모양입니다. 이 단면의 넓이를 구하세요.`,
            answer: { type: 'num', value: (4 * a * h) / 3, unit: 'm²' },
            steps: [`포물선과 $x$ 축의 교점: $x=\\pm${a}$`, `$\\int_{-${a}}^{${a}}\\left(${h}-${coef.eq(1) ? '' : coef.tex()}x^{2}\\right)dx=2\\left[${h}x-${coef.div(3).tex()}x^{3}\\right]_{0}^{${a}}$`, `$=2\\left(${h * a}-${coef.mul(a ** 3).div(3).tex()}\\right)=${new F(4 * a * h, 3).tex()}$ (m²)`],
          };
        }
        if (level === 2) {
          const p = r.int(-3, 2),
            q = p + r.int(1, 4);
          const line = P(p + q, -p * q);
          const area = new F((q - p) ** 3, 6);
          return {
            q: `정원 설계도에서 곡선 모양 산책로는 $y=x^{2}$, 곧은 산책로는 $y=${pp(line, 'x')}$ 입니다 (단위: m). 두 산책로로 둘러싸인 부분에 잔디를 심을 때, 잔디밭의 넓이를 구하세요.`,
            answer: { type: 'num', value: area.value, display: 'frac', unit: 'm²' },
            steps: [`교점: $x^{2}=${pp(line, 'x')}$ → $(x${p < 0 ? '+' : '-'}${Math.abs(p)})(x${q < 0 ? '+' : '-'}${Math.abs(q)})=0$, $x=${p}, ${q}$`.replace(/\(x[+-]0\)/g, 'x'), `$\\int_{${p}}^{${q}}\\{(${pp(line, 'x')})-x^{2}\\}dx=\\frac{(${q}-${sq(p)})^{3}}{6}$`, `$=${area.tex()}$ (m²)`],
          };
        }
        const [s, sd] = r.pick([
          [new F(1, 4), 4],
          [new F(4, 9), 9],
          [new F(9, 16), 16],
          [new F(1, 9), 9],
        ] as [F, number][]);
        const ratio = new F(s.n * Math.sqrt(s.n), s.d * Math.sqrt(s.d));
        const h = sd * r.int(1, 2);
        const b = r.int(1, 3);
        const k = new F(h).mul(new F(1).sub(s));
        return {
          q: `곡선 $y=${h}-${b === 1 ? '' : b}x^{2}$ 과 $x$ 축으로 둘러싸인 아치 모양의 창문에 $x$ 축에 평행한 막대 $y=k$ 를 설치하여, 막대 위쪽 부분의 넓이가 창문 전체 넓이의 $${ratio.tex()}$ 이 되게 하려고 합니다. 상수 $k$ 의 값을 구하세요.`,
          answer: { type: 'num', value: k.value },
          steps: [
            `높이 $H$, 폭 $2w$ 인 포물선 부분의 넓이는 $\\frac{4}{3}wH$ (여기서 $w=\\sqrt{\\frac{H}{${b}}}$) 이므로 넓이는 $H^{\\frac{3}{2}}$ 에 비례`,
            `위쪽 부분의 높이는 $${h}-k$: $\\left(\\frac{${h}-k}{${h}}\\right)^{\\frac{3}{2}}=${ratio.tex()}$ → $\\frac{${h}-k}{${h}}=${s.tex()}$`,
            `$k=${h}-${new F(h).mul(s).tex()}=${k.tex()}$`,
          ],
        };
      },
    },
  ],
};
