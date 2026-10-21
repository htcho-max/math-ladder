// 중1 활용(문장제) 유형 추가분 — m12.ts 에서 각 단원 skills 뒤에 붙인다
import type { ProblemDraft, Skill } from '../../core/types';
import type { Rng } from '../../core/rng';
import { F } from '../../core/frac';
import { dec } from '../../core/tex';
import { factorize, gcd, lcm } from '../../core/nt';
import { Svg, clock } from '../../core/fig';
import { NAMES, jo, piTex, texChoices, sum } from './util';

const DEG = '^{\\circ}';
const factTex = (n: number) =>
  factorize(n)
    .map(([p, e]) => (e === 1 ? `${p}` : `${p}^{${e}}`))
    .join(' \\times ');
const POLY = ['', '', '', '정삼각형', '정사각형', '정오각형', '정육각형', '정칠각형', '정팔각형', '정구각형', '정십각형', '', '정십이각형', '', '', '정십오각형', '', '', '정십팔각형', '', '정이십각형'];
const two = (r: Rng) => {
  const a = r.pick(NAMES);
  let b = r.pick(NAMES);
  while (b === a) b = r.pick(NAMES);
  return [a, b];
};
const signed = (v: number) => (v > 0 ? `+${dec(v)}` : dec(v));

export const word1: Record<string, Skill[]> = {
  // ═══════════ m1a-1 소인수분해 ═══════════
  'm1a-1': [
    {
      id: 'gcd-word',
      title: '최대공약수의 활용',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          for (;;) {
            const g = r.int(2, 12);
            const p = r.int(2, 9);
            const q = r.int(2, 9);
            if (p === q || gcd(p, q) !== 1 || g * p > 100 || g * q > 100) continue;
            const [A, B, ua, ub] = r.pick([
              ['사과', '배', '개', '개'],
              ['연필', '지우개', '자루', '개'],
              ['초콜릿', '사탕', '개', '개'],
              ['공책', '색연필', '권', '자루'],
            ]);
            const a = g * p;
            const b = g * q;
            return {
              q: `${A} $${a}$ ${jo(ua, '과/와')} ${B} $${b}$ ${jo(ub, '을/를')} 될 수 있는 대로 많은 학생에게 남김없이 똑같이 나누어 주려고 합니다. 몇 명에게 나누어 줄 수 있는지 구하세요.`,
              answer: { type: 'num', value: g, unit: '명' },
              steps: [
                `학생 수는 $${a}$ 와 $${b}$ 의 공약수이고, 가장 많은 학생 수이므로 최대공약수입니다.`,
                `$${a} = ${factTex(a)}$, $${b} = ${factTex(b)}$`,
                `최대공약수는 $${g}$ 이므로 $${g}$ 명에게 나누어 줄 수 있어요. (한 명당 ${A} $${p}$ ${ua}, ${B} $${q}$ ${ub})`,
              ],
              hint: '"남김없이 똑같이, 가장 많이" → 최대공약수',
            };
          }
        }
        if (level === 2) {
          for (;;) {
            const g = r.int(3, 15);
            const p = r.int(2, 8);
            const q = r.int(2, 8);
            if (p === q || gcd(p, q) !== 1 || g * p > 180 || g * q > 180) continue;
            const W = g * Math.max(p, q);
            const H = g * Math.min(p, q);
            const wall = r.chance(0.5);
            return {
              q: wall
                ? `가로 $${W}$ cm, 세로 $${H}$ cm 인 직사각형 모양의 벽에 크기가 같은 정사각형 모양의 타일을 빈틈없이 붙이려고 합니다. 타일을 될 수 있는 대로 크게 할 때, 필요한 타일은 몇 장인지 구하세요.`
                : `가로 $${W}$ cm, 세로 $${H}$ cm 인 직사각형 모양의 종이를 남는 부분 없이 잘라 크기가 같은 정사각형 여러 개를 만들려고 합니다. 정사각형을 될 수 있는 대로 크게 할 때, 정사각형은 몇 개 만들어지는지 구하세요.`,
              answer: { type: 'num', value: p * q, unit: wall ? '장' : '개' },
              steps: [
                `정사각형의 한 변의 길이는 $${W}$ 와 $${H}$ 의 최대공약수입니다.`,
                `$${W} = ${factTex(W)}$, $${H} = ${factTex(H)}$ → 최대공약수 $${g}$, 한 변 $${g}$ cm`,
                `가로 $${W} \\div ${g} = ${W / g}$ ${wall ? '장' : '개'}, 세로 $${H} \\div ${g} = ${H / g}$ ${wall ? '장' : '개'}`,
                `$${W / g} \\times ${H / g} = ${p * q}$ ${wall ? '장' : '개'}`,
              ],
            };
          }
        }
        if (r.chance(0.5)) {
          for (;;) {
            const g = r.int(5, 15);
            const p = r.int(2, 9);
            const q = r.int(2, 9);
            const s = r.int(2, 9);
            if (gcd(gcd(p, q), s) !== 1) continue;
            const r1 = r.int(1, Math.min(4, g - 1));
            const r2 = r.int(1, Math.min(4, g - 1));
            const a = g * p + r1;
            const b = g * q - r2;
            const c = g * s;
            if (Math.max(a, b, c) > 120) continue;
            return {
              q: `연필 $${a}$ 자루, 지우개 $${b}$ 개, 공책 $${c}$ 권을 될 수 있는 대로 많은 학생에게 똑같이 나누어 주려고 했더니 연필은 $${r1}$ 자루가 남고, 지우개는 $${r2}$ 개가 모자라고, 공책은 남김없이 나누어졌습니다. 학생은 몇 명인지 구하세요.`,
              answer: { type: 'num', value: g, unit: '명' },
              steps: [
                `학생 수를 $x$ 명이라 하면 연필 $${a} - ${r1} = ${a - r1}$, 지우개 $${b} + ${r2} = ${b + r2}$, 공책 $${c}$ 이 모두 $x$ 로 나누어떨어집니다.`,
                `$${a - r1} = ${factTex(a - r1)}$, $${b + r2} = ${factTex(b + r2)}$, $${c} = ${factTex(c)}$`,
                `가장 많은 학생 수는 세 수의 최대공약수 $${g}$ 이고, 남거나 모자란 수 $${r1}$, $${r2}$ 보다 크므로 조건에 맞아요.`,
                `답: $${g}$ 명`,
              ],
              hint: '남은 것은 빼고, 모자란 것은 더해서 나누어떨어지는 수를 만드세요.',
            };
          }
        }
        for (;;) {
          const g = r.int(2, 8);
          const p = r.int(1, 6);
          const q = r.int(2, 6);
          const s = r.int(2, 6);
          if (gcd(gcd(p, q), s) !== 1 || (p === q && q === s)) continue;
          const [a, b, c] = [g * p, g * q, g * s];
          if (Math.max(a, b, c) > 60) continue;
          return {
            q: `가로 $${a}$ cm, 세로 $${b}$ cm, 높이 $${c}$ cm 인 직육면체 모양의 나무토막을 남김없이 잘라서 될 수 있는 대로 큰 정육면체 모양의 나무토막을 만들려고 합니다. 정육면체 모양의 나무토막은 몇 개 만들어지는지 구하세요.`,
            answer: { type: 'num', value: p * q * s, unit: '개' },
            steps: [
              `정육면체의 한 모서리의 길이는 $${a}$, $${b}$, $${c}$ 의 최대공약수 $${g}$ cm 입니다.`,
              `가로 $${a / g}$ 개, 세로 $${b / g}$ 개, 높이 $${c / g}$ 개씩 만들어져요.`,
              `$${p} \\times ${q} \\times ${s} = ${p * q * s}$ 개`,
            ],
          };
        }
      },
    },
    {
      id: 'lcm-word',
      title: '최소공배수의 활용',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          for (;;) {
            const [a, b] = r.sample([6, 8, 9, 10, 12, 15, 18, 20, 24, 25, 30], 2).sort((x, y) => x - y);
            const L = lcm(a, b);
            if (L > 180 || L === b) continue;
            if (r.chance(0.5)) {
              const h = r.int(6, 8);
              const H = h + Math.floor(L / 60);
              const M = L % 60;
              return {
                q: `버스 터미널에서 A 버스는 $${a}$ 분마다, B 버스는 $${b}$ 분마다 출발합니다. 오전 $${h}$ 시에 두 버스가 동시에 출발했을 때, 그 다음에 처음으로 다시 동시에 출발하는 시각을 구하세요.`,
                answer: { type: 'fields', fields: [{ label: '오전 (시)', value: H }, { label: '분', value: M }] },
                steps: [
                  `두 버스가 다시 동시에 출발하는 때는 $${a}$ 와 $${b}$ 의 공배수만큼 지난 뒤이고, 처음은 최소공배수입니다.`,
                  `$${a} = ${factTex(a)}$, $${b} = ${factTex(b)}$ → 최소공배수 $${L}$`,
                  L < 60
                    ? `$${L}$ 분 후이므로 오전 $${H}$ 시 $${M}$ 분`
                    : `$${L}$ 분 $= ${Math.floor(L / 60)}$ 시간 $${M}$ 분 후이므로 오전 $${H}$ 시 $${M}$ 분`,
                ],
              };
            }
            return {
              q: `두 전구 A, B 가 있습니다. A 는 $${a}$ 초마다, B 는 $${b}$ 초마다 한 번씩 켜집니다. 두 전구가 동시에 켜진 후 처음으로 다시 동시에 켜지는 것은 몇 초 후인지 구하세요.`,
              answer: { type: 'num', value: L, unit: '초 후' },
              steps: [`$${a}$ 와 $${b}$ 의 최소공배수를 구합니다.`, `$${a} = ${factTex(a)}$, $${b} = ${factTex(b)}$`, `최소공배수: $${factTex(L)} = ${L}$ → $${L}$ 초 후`],
            };
          }
        }
        if (level === 2) {
          for (;;) {
            const a = r.int(4, 20);
            const b = r.int(4, 20);
            if (a === b) continue;
            const L = lcm(a, b);
            if (L > 120 || L === Math.max(a, b)) continue;
            if (r.chance(0.5)) {
              return {
                q: `가로 $${a}$ cm, 세로 $${b}$ cm 인 직사각형 모양의 타일을 같은 방향으로 빈틈없이 붙여서 될 수 있는 대로 작은 정사각형을 만들려고 합니다. 타일은 모두 몇 장 필요한지 구하세요.`,
                answer: { type: 'num', value: (L / a) * (L / b), unit: '장' },
                steps: [
                  `정사각형의 한 변의 길이는 $${a}$ 와 $${b}$ 의 최소공배수 $${L}$ cm 입니다.`,
                  `가로로 $${L} \\div ${a} = ${L / a}$ 장, 세로로 $${L} \\div ${b} = ${L / b}$ 장`,
                  `$${L / a} \\times ${L / b} = ${(L / a) * (L / b)}$ 장`,
                ],
              };
            }
            if (a < 8 || b < 8) continue;
            return {
              q: `톱니의 수가 각각 $${a}$ 개, $${b}$ 개인 두 톱니바퀴 A, B 가 서로 맞물려 돌고 있습니다. 처음에 맞물렸던 두 톱니가 처음으로 다시 맞물리는 것은 톱니바퀴 A 가 몇 바퀴 회전한 후인지 구하세요.`,
              answer: { type: 'num', value: L / a, unit: '바퀴' },
              steps: [
                `다시 맞물릴 때까지 맞물린 톱니의 수는 $${a}$ 와 $${b}$ 의 공배수이고, 처음은 최소공배수 $${L}$ 입니다.`,
                `A 의 회전 수: $${L} \\div ${a} = ${L / a}$ 바퀴`,
              ],
            };
          }
        }
        for (;;) {
          const ds = r.sample([3, 4, 5, 6, 8, 9, 10, 12, 15], 3).sort((x, y) => x - y);
          const L = ds.reduce((x, y) => lcm(x, y), 1);
          if (L > 180 || L === ds[2]) continue;
          if (r.chance(0.5)) {
            const k = r.int(1, ds[0] - 1);
            const t = Math.ceil((100 - k) / L);
            const N = L * t + k;
            if (N > 999) continue;
            return {
              q: `어떤 자연수를 $${ds[0]}$, $${ds[1]}$, $${ds[2]}$ 중 어느 것으로 나누어도 나머지가 $${k}$ 입니다. 이러한 자연수 중 가장 작은 세 자리의 자연수를 구하세요.`,
              answer: { type: 'num', value: N },
              steps: [
                `구하는 수를 $N$ 이라 하면 $N - ${k}$ 는 $${ds.join('$, $')}$ 의 공배수입니다.`,
                `최소공배수는 $${L}$ 이므로 $N - ${k}$ 는 $${L}$ 의 배수: $N = ${L} \\times (\\text{자연수}) + ${k}$`,
                `$${L} \\times ${t - 1} + ${k} = ${L * (t - 1) + k}$ 는 세 자리가 아니고, $${L} \\times ${t} + ${k} = ${N}$`,
                `가장 작은 세 자리 자연수는 $${N}$`,
              ],
              hint: '나머지를 빼면 세 수로 모두 나누어떨어져요.',
            };
          }
          const t = Math.ceil(101 / L);
          const N = L * t - 1;
          if (N > 999) continue;
          return {
            q: `$${ds[0]}$ 으로 나누면 $${ds[0] - 1}$ 이 남고, $${ds[1]}$ 로 나누면 $${ds[1] - 1}$ 이 남고, $${ds[2]}$ 로 나누면 $${ds[2] - 1}$ 이 남는 자연수 중 가장 작은 세 자리의 자연수를 구하세요.`,
            answer: { type: 'num', value: N },
            steps: [
              `구하는 수를 $N$ 이라 하면 $N + 1$ 은 $${ds.join('$, $')}$ 로 모두 나누어떨어집니다. (나머지가 나누는 수보다 $1$ 작으므로)`,
              `세 수의 최소공배수는 $${L}$ 이므로 $N + 1$ 은 $${L}$ 의 배수`,
              `$N = ${L} \\times ${t - 1} - 1 = ${L * (t - 1) - 1}$ 은 세 자리가 아니고, $N = ${L} \\times ${t} - 1 = ${N}$`,
              `가장 작은 세 자리 자연수는 $${N}$`,
            ],
            hint: '1을 더하면 어떻게 될까요?',
          };
        }
      },
    },
  ],

  // ═══════════ m1a-2 정수와 유리수 ═══════════
  'm1a-2': [
    {
      id: 'real-life',
      title: '실생활 속 정수와 유리수 (기온·해발·수위)',
      gen(r, level): ProblemDraft {
        const name = r.pick(NAMES);
        if (level === 1) {
          if (r.chance(0.5)) {
            const a = r.int(-5, 10);
            const b = r.int(2, 5);
            const c = r.int(2, 6);
            const city = r.pick(['철원', '대관령', '평창', '태백', '인제']);
            return {
              q: `어느 겨울밤 ${city}의 기온이 오후 $9$ 시에 $${a}$°C 였습니다. 그 후 $1$ 시간마다 기온이 $${b}$°C 씩 $${c}$ 시간 동안 내려갔다면, 이때의 기온은 몇 °C 인지 구하세요.`,
              answer: { type: 'num', value: a - b * c, unit: '°C' },
              steps: [`기온의 변화: $(-${b}) \\times ${c} = -${b * c}$`, `$${a} + (-${b * c}) = ${a - b * c}$`, `답: $${a - b * c}$°C`],
            };
          }
          const a = r.int(5, 19) * 100;
          const b = r.int(2, 40) * 10;
          return {
            q: `해수면을 $0$ m 로 하여 해수면보다 높은 곳은 양수, 낮은 곳은 음수로 나타냅니다. 해발 $${a}$ m 인 산 정상과 해발 $-${b}$ m 인 바닷속 잠수부가 있는 곳의 높이의 차는 몇 m 인지 구하세요.`,
            answer: { type: 'num', value: a + b, unit: 'm' },
            steps: [`(높이의 차) $= (+${a}) - (-${b})$`, `$= ${a} + ${b} = ${a + b}$`, `답: $${a + b}$ m`],
          };
        }
        if (level === 2) {
          if (r.chance(0.5)) {
            const a = r.int(10, 30);
            const h = r.int(3, 9);
            return {
              q: `지면에서 $1$ km 높아질 때마다 기온이 $6$°C 씩 내려간다고 합니다. 지면의 기온이 $${a}$°C 일 때, 지면에서 $${h}$ km 높이의 하늘을 나는 비행기 밖의 기온은 몇 °C 인지 구하세요.`,
              answer: { type: 'num', value: a - 6 * h, unit: '°C' },
              steps: [`$${h}$ km 높아질 때 기온의 변화: $(-6) \\times ${h} = -${6 * h}$`, `$${a} + (-${6 * h}) = ${a - 6 * h}$`, `답: $${a - 6 * h}$°C`],
            };
          }
          const start = r.int(3, 9) * 1000;
          const ch = Array.from({ length: 4 }, () => r.nonzero(-6, 6) * 500);
          const fin = start + sum(ch);
          if (fin < 0) return this.gen(r, level);
          return {
            q: `${name}의 통장에 $${start}$ 원이 있었습니다. 그 후 일주일 동안 입금은 양수, 출금은 음수로 나타낸 기록이 다음과 같을 때, 통장에 남은 금액을 구하세요.`,
            table: [
              ['횟수', '1회', '2회', '3회', '4회'],
              ['금액 (원)', ...ch.map((v) => `$${signed(v)}$`)],
            ],
            answer: { type: 'num', value: fin, unit: '원' },
            steps: [`$${start} + ${ch.map((v) => `(${signed(v)})`).join(' + ')}$`, `$= ${start} + (${signed(sum(ch))}) = ${fin}$`, `답: $${fin}$ 원`],
          };
        }
        for (;;) {
          const a = r.nonzero(-8, 8) * 0.5;
          const ch = Array.from({ length: 4 }, () => r.nonzero(-9, 9) * 0.5);
          const lv = [a];
          ch.forEach((c) => lv.push(lv[lv.length - 1] + c));
          const mx = Math.max(...lv);
          const mn = Math.min(...lv);
          const days = ['월', '화', '수', '목', '금'];
          if (lv.filter((v) => v === mx).length > 1 || lv.filter((v) => v === mn).length > 1) continue;
          if (!lv.some((v) => v > 0) || !lv.some((v) => v < 0)) continue;
          const d = mx - mn;
          return {
            q: `어느 저수지의 수위를 기준 수위보다 높으면 양수, 낮으면 음수로 나타냅니다. 월요일의 수위는 기준 수위보다 $${dec(a)}$ m 였고, 화요일부터 금요일까지 전날과 비교한 수위의 변화는 다음 표와 같습니다. 월요일부터 금요일까지 중 수위가 가장 높았던 날과 가장 낮았던 날의 수위의 차는 몇 m 인지 구하세요.`,
            table: [
              ['요일', '화', '수', '목', '금'],
              ['전날과 비교한 변화 (m)', ...ch.map((v) => `$${signed(v)}$`)],
            ],
            answer: { type: 'num', value: d, unit: 'm' },
            steps: [
              `요일별 수위(기준 대비): ${lv.map((v, i) => `${days[i]} $${dec(v)}$`).join(', ')}`,
              `가장 높은 날: ${days[lv.indexOf(mx)]}요일 $${dec(mx)}$ m, 가장 낮은 날: ${days[lv.indexOf(mn)]}요일 $${dec(mn)}$ m`,
              `차: $${dec(mx)} - ${mn < 0 ? `(${dec(mn)})` : dec(mn)} = ${dec(d)}$ (m)`,
            ],
            hint: '전날 수위에 변화량을 차례로 더해 각 요일의 수위를 먼저 구하세요.',
          };
        }
      },
    },
  ],

  // ═══════════ m1a-3 문자의 사용과 식의 계산 ═══════════
  'm1a-3': [
    {
      id: 'formula-word',
      title: '식의 값과 규칙 찾기 활용',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const x = r.int(1, 7) * 5;
          if (r.chance(0.5)) {
            const v = 331 + (3 * x) / 5;
            return {
              q: `기온이 $x$°C 일 때 공기 중에서 소리의 속력은 초속 $(331 + 0.6x)$ m 입니다. 기온이 $${x}$°C 일 때 소리의 속력은 초속 몇 m 인지 구하세요.`,
              answer: { type: 'num', value: v, unit: 'm' },
              steps: [`$331 + 0.6x$ 에 $x = ${x}$ 를 대입`, `$331 + 0.6 \\times ${x} = 331 + ${(3 * x) / 5} = ${v}$`, `답: 초속 $${v}$ m`],
            };
          }
          const v = (9 * x) / 5 + 32;
          return {
            q: `섭씨온도 $x$°C 를 화씨온도로 나타내면 $\\left(\\frac{9}{5}x + 32\\right)$°F 입니다. $${x}$°C 는 화씨온도로 몇 °F 인지 구하세요.`,
            answer: { type: 'num', value: v, unit: '°F' },
            steps: [`$\\frac{9}{5}x + 32$ 에 $x = ${x}$ 를 대입`, `$\\frac{9}{5} \\times ${x} + 32 = ${(9 * x) / 5} + 32 = ${v}$`, `답: $${v}$°F`],
          };
        }
        if (level === 2) {
          const [shape, s] = r.pick([
            ['정삼각형', 3],
            ['정사각형', 4],
            ['정오각형', 5],
            ['정육각형', 6],
          ] as [string, number][]);
          const n = r.int(8, 30);
          const v = (s - 1) * n + 1;
          return {
            q: `성냥개비로 ${jo(shape, '을/를')} 한 줄로 이어 붙여 만들고 있습니다. 첫 번째 ${shape} 하나에는 $${s}$ 개, 그 뒤로 ${shape} 하나를 붙일 때마다 $${s - 1}$ 개씩 성냥개비가 더 필요합니다. ${shape} $${n}$ 개를 만드는 데 필요한 성냥개비는 몇 개인지 구하세요.`,
            answer: { type: 'num', value: v, unit: '개' },
            steps: [
              `${shape} $x$ 개를 만들 때 성냥개비 수: $${s} + ${s - 1}(x - 1) = ${s - 1}x + 1$`,
              `$x = ${n}$ 을 대입: $${s - 1} \\times ${n} + 1 = ${v}$`,
              `답: $${v}$ 개`,
            ],
            hint: '처음 1개에 더해지는 개수가 일정하게 늘어나요.',
          };
        }
        for (;;) {
          const a = r.int(5, 12) * 1000;
          const b = r.int(2, 8) * 500;
          if (b >= a) continue;
          const c = r.int(2, 9);
          const d = r.int(1, 3);
          const k = r.int(d + 1, 8);
          const total = a * (k - d) + (a / 2) * d + b * (k + c);
          const coef = a + b;
          const cons = b * c - (a / 2) * d;
          return {
            q: `어느 박물관의 입장료는 어른 $${a}$ 원, 학생 $${b}$ 원이고, 어른 중 경로 우대 대상자는 어른 입장료의 반값만 냅니다. 어른 $x$ 명과 어른보다 $${c}$ 명 많은 학생이 입장하였고, 어른 중 $${d}$ 명은 경로 우대 대상자였습니다. 전체 입장료를 $x$ 에 대한 식으로 간단히 나타낸 뒤, $x = ${k}$ 일 때 전체 입장료를 구하세요.`,
            answer: { type: 'num', value: total, unit: '원' },
            steps: [
              `어른: $${a}(x - ${d}) + ${a / 2} \\times ${d}$, 학생: $${b}(x + ${c})$`,
              `전체: $${a}x - ${a * d} + ${(a / 2) * d} + ${b}x + ${b * c} = ${coef}x ${cons >= 0 ? '+' : '-'} ${Math.abs(cons)}$`,
              `$x = ${k}$ 대입: $${coef} \\times ${k} ${cons >= 0 ? '+' : '-'} ${Math.abs(cons)} = ${total}$`,
              `답: $${total}$ 원`,
            ],
            hint: '경로 우대 어른과 일반 어른을 나누어 식을 세우세요.',
          };
        }
      },
    },
  ],

  // ═══════════ m1a-4 일차방정식 ═══════════
  'm1a-4': [
    {
      id: 'word-work',
      title: '활용 (도형·일·기차)',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          if (r.chance(0.5)) {
            const h = r.int(3, 15);
            const d = r.int(1, 8);
            const P = 2 * (2 * h + d);
            return {
              q: `가로의 길이가 세로의 길이보다 $${d}$ cm 긴 직사각형의 둘레의 길이가 $${P}$ cm 입니다. 이 직사각형의 가로의 길이를 구하세요.`,
              answer: { type: 'num', value: h + d, unit: 'cm' },
              steps: [`세로를 $x$ cm 라 하면 가로는 $(x + ${d})$ cm`, `$2\\{x + (x + ${d})\\} = ${P}$, $2x + ${d} = ${P / 2}$`, `$x = ${h}$ 이므로 가로는 $${h} + ${d} = ${h + d}$ cm`, `확인: $2(${h + d} + ${h}) = ${P}$ ✓`],
            };
          }
          for (;;) {
            const x = r.int(2, 10);
            const d = r.int(1, 6);
            const ht = r.pick([2, 4, 6, 8]);
            const S = ((2 * x + d) * ht) / 2;
            return {
              q: `아랫변의 길이가 윗변의 길이보다 $${d}$ cm 길고 높이가 $${ht}$ cm 인 사다리꼴의 넓이가 $${S}$ cm² 입니다. 윗변의 길이를 구하세요.`,
              answer: { type: 'num', value: x, unit: 'cm' },
              steps: [`윗변을 $x$ cm 라 하면 아랫변은 $(x + ${d})$ cm`, `$\\frac{1}{2}\\{x + (x + ${d})\\} \\times ${ht} = ${S}$`, `$${ht / 2}(2x + ${d}) = ${S}$, $2x + ${d} = ${(2 * x + d)}$, $x = ${x}$`, `답: $${x}$ cm`],
            };
          }
        }
        if (level === 2) {
          const [a, b] = r.shuffle(r.pick([[6, 3], [12, 4], [10, 15], [20, 30], [12, 6], [24, 12], [15, 10], [20, 5], [40, 10], [8, 24], [28, 21], [18, 9]]));
          const t = (a * b) / (a + b);
          const [p1, p2] = two(r);
          if (r.chance(0.5)) {
            return {
              q: `어떤 일을 완성하는 데 ${jo(p1, '이/가')} 혼자 하면 $${a}$ 일, ${jo(p2, '이/가')} 혼자 하면 $${b}$ 일이 걸립니다. 이 일을 두 사람이 함께 하면 완성하는 데 며칠이 걸리는지 구하세요.`,
              answer: { type: 'num', value: t, unit: '일' },
              steps: [`전체 일의 양을 $1$ 이라 하면 하루에 ${jo(p1, '은/는')} $\\frac{1}{${a}}$, ${jo(p2, '은/는')} $\\frac{1}{${b}}$ 만큼 합니다.`, `$x$ 일 걸린다고 하면 $\\left(\\frac{1}{${a}} + \\frac{1}{${b}}\\right)x = 1$`, `양변에 $${lcm(a, b)}$ 를 곱하면 $${(lcm(a, b) / a + lcm(a, b) / b)}x = ${lcm(a, b)}$, $x = ${t}$`, `답: $${t}$ 일`],
            };
          }
          return {
            q: `빈 물탱크에 물을 가득 채우는 데 A 호스로만 넣으면 $${a}$ 분, B 호스로만 넣으면 $${b}$ 분이 걸립니다. 두 호스로 동시에 물을 넣으면 가득 채우는 데 몇 분이 걸리는지 구하세요.`,
            answer: { type: 'num', value: t, unit: '분' },
            steps: [`물탱크의 들이를 $1$ 이라 하면 1분에 A 는 $\\frac{1}{${a}}$, B 는 $\\frac{1}{${b}}$ 만큼 채웁니다.`, `$x$ 분 걸린다고 하면 $\\left(\\frac{1}{${a}} + \\frac{1}{${b}}\\right)x = 1$`, `$x = ${t}$`, `답: $${t}$ 분`],
          };
        }
        if (r.chance(0.5)) {
          for (;;) {
            const a = r.int(4, 30);
            const b = r.int(4, 30);
            if (a === b) continue;
            const k = r.int(1, a - 1);
            const num = (a - k) * b;
            if (num % (a + b) !== 0) continue;
            const x = num / (a + b);
            if (x < 1) continue;
            const [p1, p2] = two(r);
            return {
              q: `어떤 일을 ${jo(p1, '이/가')} 혼자 하면 $${a}$ 일, ${jo(p2, '이/가')} 혼자 하면 $${b}$ 일 만에 끝낼 수 있습니다. 이 일을 ${jo(p1, '이/가')} 먼저 혼자 $${k}$ 일 동안 한 뒤, 나머지를 두 사람이 함께 하여 끝냈습니다. 두 사람이 함께 일한 날은 며칠인지 구하세요.`,
              answer: { type: 'num', value: x, unit: '일' },
              steps: [
                `전체 일의 양을 $1$ 이라 하고 함께 일한 날을 $x$ 일이라 하면`,
                `$\\frac{${k}}{${a}} + \\left(\\frac{1}{${a}} + \\frac{1}{${b}}\\right)x = 1$`,
                `양변에 $${a * b}$ 를 곱하면 $${k * b} + ${a + b}x = ${a * b}$, $${a + b}x = ${num}$`,
                `$x = ${x}$, 답: $${x}$ 일`,
              ],
              hint: '전체 일의 양을 1로 놓으세요.',
            };
          }
        }
        for (;;) {
          const v = r.int(10, 30);
          const x = r.int(10, 30) * 10;
          const L1 = r.int(4, 15) * 100;
          const L2 = r.int(4, 15) * 100;
          if (L1 === L2 || (L1 + x) % v !== 0 || (L2 + x) % v !== 0) continue;
          const t1 = (L1 + x) / v;
          const t2 = (L2 + x) / v;
          if (t1 > 120 || t2 > 120) continue;
          return {
            q: `일정한 속력으로 달리는 기차가 길이 $${L1}$ m 인 터널을 완전히 통과하는 데 $${t1}$ 초, 길이 $${L2}$ m 인 다리를 완전히 통과하는 데 $${t2}$ 초가 걸렸습니다. 이 기차의 길이는 몇 m 인지 구하세요.`,
            answer: { type: 'num', value: x, unit: 'm' },
            steps: [
              `기차의 길이를 $x$ m 라 하면, 완전히 통과할 때 달린 거리는 (터널·다리의 길이) $+ x$ 입니다.`,
              `속력이 같으므로 $\\frac{${L1} + x}{${t1}} = \\frac{${L2} + x}{${t2}}$`,
              `$${t2}(${L1} + x) = ${t1}(${L2} + x)$, $${t2 * L1} + ${t2}x = ${t1 * L2} + ${t1}x$`,
              `$${t2 - t1 > 0 ? t2 - t1 : t1 - t2}x = ${Math.abs(t1 * L2 - t2 * L1)}$, $x = ${x}$ (속력은 초속 $${v}$ m)`,
            ],
            hint: '기차가 완전히 통과하려면 기차 길이만큼 더 달려야 해요.',
          };
        }
      },
    },
  ],

  // ═══════════ m1a-5 좌표평면과 그래프 ═══════════
  'm1a-5': [
    {
      id: 'two-people',
      title: '표로 보는 정비례 활용 (두 사람 비교)',
      gen(r, level): ProblemDraft {
        const [p1, p2] = two(r);
        if (level === 1) {
          const a = r.int(4, 9) * 10;
          const t = r.int(6, 30);
          const D = a * t;
          const km = D % 100 === 0;
          const Dt = km ? `${dec(D / 1000)}$ km` : `${D}$ m`;
          return {
            q: `${jo(p1, '이/가')} 일정한 빠르기로 걸을 때, 걸은 시간 $x$ 분과 걸은 거리 $y$ m 사이의 관계가 다음 표와 같습니다. ${jo(p1, '이/가')} $${Dt} 를 걷는 데 몇 분이 걸리는지 구하세요.`,
            table: [
              ['$x$ (분)', '$1$', '$2$', '$3$', '$4$'],
              ['$y$ (m)', ...[1, 2, 3, 4].map((k) => `$${a * k}$`)],
            ],
            answer: { type: 'num', value: t, unit: '분' },
            steps: [`$\\frac{y}{x} = ${a}$ 로 일정하므로 $y = ${a}x$ (정비례)`, km ? `$${dec(D / 1000)}$ km $= ${D}$ m 이므로 $${D} = ${a}x$` : `$${D} = ${a}x$`, `$x = ${t}$, 답: $${t}$ 분`],
          };
        }
        if (level === 2) {
          const a = r.int(4, 9) * 10;
          let b = r.int(4, 9) * 10;
          if (b === a) b += 10;
          const k = r.int(5, 20);
          return {
            q: `${jo(p1, '과/와')} ${jo(p2, '이/가')} 같은 곳에서 동시에 출발하여 같은 방향으로 일정한 빠르기로 걷고 있습니다. 출발한 지 $x$ 분 후 각자 걸은 거리 $y$ m 를 나타낸 표가 다음과 같을 때, 출발한 지 $${k}$ 분 후 두 사람 사이의 거리는 몇 m 인지 구하세요.`,
            table: [
              ['$x$ (분)', '$1$', '$2$', '$3$'],
              [`${p1}의 $y$ (m)`, ...[1, 2, 3].map((t) => `$${a * t}$`)],
              [`${p2}의 $y$ (m)`, ...[1, 2, 3].map((t) => `$${b * t}$`)],
            ],
            answer: { type: 'num', value: Math.abs(a - b) * k, unit: 'm' },
            steps: [`${p1}: $y = ${a}x$, ${p2}: $y = ${b}x$`, `$x = ${k}$ 일 때 ${p1} $${a * k}$ m, ${p2} $${b * k}$ m`, `두 사람 사이의 거리: $${Math.max(a, b) * k} - ${Math.min(a, b) * k} = ${Math.abs(a - b) * k}$ m`],
          };
        }
        for (;;) {
          const a = r.int(4, 9) * 10;
          const b = r.int(4, 9) * 10;
          if (a === b) continue;
          const L = lcm(a, b);
          const D = L * r.int(1, 4);
          if (D > 3000 || D < 600) continue;
          const late = r.int(0, 8);
          const ta = D / a;
          const tb = D / b + late;
          if (ta === tb) continue;
          const first = ta < tb ? p1 : p2;
          const w = Math.abs(ta - tb);
          return {
            q: `같은 아파트에 사는 ${jo(p1, '과/와')} ${jo(p2, '이/가')} 아파트 입구에서 $${D}$ m 떨어진 도서관까지 걸어가려고 합니다. 두 사람이 각자 일정한 빠르기로 걸을 때, 걸은 시간 $x$ 분과 걸은 거리 $y$ m 사이의 관계는 ${jo(p1, '은/는')} $y = ${a}x$, ${jo(p2, '은/는')} $y = ${b}x$ 입니다. ${late === 0 ? '두 사람이 동시에 출발했다면' : `${jo(p2, '이/가')} ${p1}보다 $${late}$ 분 늦게 출발했다면`}, 도서관에 먼저 도착한 사람은 다른 사람이 도착할 때까지 몇 분을 기다려야 하는지 구하세요.`,
            answer: { type: 'num', value: w, unit: '분' },
            steps: [
              `${p1}: $${D} = ${a}x$ 에서 $x = ${ta}$ → 출발 기준 $${ta}$ 분 후 도착`,
              `${p2}: $${D} = ${b}x$ 에서 $x = ${D / b}$${late ? ` → ${p1} 출발 기준 $${D / b} + ${late} = ${tb}$ 분 후 도착` : ''}`,
              `먼저 도착한 사람은 ${first}, 기다리는 시간: $${Math.max(ta, tb)} - ${Math.min(ta, tb)} = ${w}$ 분`,
            ],
          };
        }
      },
    },
  ],

  // ═══════════ m1b-1 기본 도형 ═══════════
  'm1b-1': [
    {
      id: 'clock-angle',
      title: '시곗바늘이 이루는 각',
      gen(r, level): ProblemDraft {
        // 정각에서 12시(0°)·6시(180°, 작은 쪽이 정해지지 않음)는 빼요
        const h = level === 1 ? r.pick([1, 2, 3, 4, 5, 7, 8, 9, 10, 11]) : r.int(1, 12);
        const m = level === 1 ? 0 : level === 2 ? r.pick([10, 20, 30, 40, 50]) : r.pick([4, 8, 12, 14, 16, 18, 22, 24, 26, 28, 32, 34, 36, 38, 42, 44, 46, 48, 52, 54, 56, 58]);
        const H = 30 * (h % 12) + m / 2;
        const M = 6 * m;
        let d = Math.abs(H - M);
        if (d > 180) d = 360 - d;
        const askBig = level === 3 && d !== 180 && r.chance(0.4);
        const ans = askBig ? 360 - d : d;
        const tTxt = m === 0 ? `$${h}$ 시` : `$${h}$ 시 $${m}$ 분`;
        return {
          q: `시계가 ${jo(tTxt, '을/를')} 가리킬 때, 시침과 분침이 이루는 각 중 ${askBig ? '**큰** 쪽' : '작은 쪽'}의 크기를 구하세요.`,
          fig: clock(h, m, 150),
          answer: { type: 'num', value: ans, unit: '°' },
          steps: [
            '시침은 1시간에 $30' + DEG + '$, 1분에 $0.5' + DEG + '$ 씩, 분침은 1분에 $6' + DEG + '$ 씩 움직입니다.',
            `12시 방향에서 시침: $30${DEG} \\times ${h % 12}${m ? ` + 0.5${DEG} \\times ${m}` : ''} = ${dec(H)}${DEG}$, 분침: $6${DEG} \\times ${m} = ${M}${DEG}$`,
            `두 바늘의 각: $|${dec(H)}${DEG} - ${M}${DEG}| = ${dec(Math.abs(H - M))}${DEG}$${Math.abs(H - M) > 180 ? ` → 작은 쪽은 $360${DEG} - ${dec(Math.abs(H - M))}${DEG} = ${dec(d)}${DEG}$` : ''}`,
            askBig ? `큰 쪽: $360${DEG} - ${dec(d)}${DEG} = ${dec(ans)}${DEG}$` : `답: $${dec(ans)}${DEG}$`,
          ],
          hint: level === 1 ? '숫자 한 칸 사이의 각은 30°예요.' : '분이 지나면 시침도 조금씩 움직여요.',
        };
      },
    },
    {
      id: 'angle-ratio',
      title: '평각·맞꼭지각을 이용한 각의 활용',
      gen(r, level): ProblemDraft {
        if (level <= 2) {
          for (;;) {
            const k = level === 1 ? 2 : 3;
            const ps = Array.from({ length: k }, () => r.int(1, 7));
            const S = sum(ps);
            if (180 % S !== 0 || new Set(ps).size < k) continue;
            const u = 180 / S;
            const names = k === 2 ? ['\\angle AOC', '\\angle COB'] : ['\\angle AOC', '\\angle COD', '\\angle DOB'];
            const idx = level === 1 ? ps.indexOf(Math.max(...ps)) : r.int(0, 2);
            const ask = names[idx];
            return {
              q:
                k === 2
                  ? `점 O 는 직선 AB 위의 점이고, 반직선 OC 는 직선 AB 위에 있지 않습니다. $${names[0]} : ${names[1]} = ${ps[0]} : ${ps[1]}$ 일 때, 둘 중 큰 각의 크기를 구하세요.`
                  : `점 O 는 직선 AB 위의 점이고, 반직선 OC, OD 가 직선 AB 의 같은 쪽에 차례로 있습니다. $${names[0]} : ${names[1]} : ${names[2]} = ${ps.join(' : ')}$ 일 때, $${ask}$ 의 크기를 구하세요.`,
              answer: { type: 'num', value: ps[idx] * u, unit: '°' },
              steps: [
                `세 점 A, O, B 가 일직선 위에 있으므로 각의 합은 평각 $180${DEG}$ 입니다.`,
                `비의 합은 $${ps.join(' + ')} = ${S}$ 이므로 $180${DEG} \\times \\frac{${ps[idx]}}{${S}} = ${ps[idx] * u}${DEG}$`,
                `답: $${ask} = ${ps[idx] * u}${DEG}$`,
              ],
            };
          }
        }
        for (;;) {
          const x = r.int(5, 40);
          const p = r.int(2, 5);
          const q = r.int(p + 1, 7);
          const a = r.nonzero(-20, 40);
          const th = p * x + a;
          const b = q * x - th;
          if (th < 20 || th > 160 || th === 90 || b <= 0) continue;
          return {
            q: `두 직선이 한 점 O 에서 만나서 생기는 네 각 중에서 서로 마주 보는 두 각의 크기가 각각 $(${p}x ${a >= 0 ? '+' : '-'} ${Math.abs(a)})${DEG}$, $(${q}x - ${b})${DEG}$ 입니다. 이 각과 이웃한 각의 크기를 구하세요.`,
            answer: { type: 'num', value: 180 - th, unit: '°' },
            steps: [
              `맞꼭지각의 크기는 같으므로 $${p}x ${a >= 0 ? '+' : '-'} ${Math.abs(a)} = ${q}x - ${b}$`,
              `$${q - p}x = ${b + a}$, $x = ${x}$ → 한 각은 $${th}${DEG}$`,
              `이웃한 두 각의 합은 $180${DEG}$ 이므로 $180${DEG} - ${th}${DEG} = ${180 - th}${DEG}$`,
            ],
            hint: '맞꼭지각은 크기가 같고, 이웃한 두 각은 합이 180°예요.',
          };
        }
      },
    },
  ],

  // ═══════════ m1b-2 작도와 합동 ═══════════
  'm1b-2': [
    {
      id: 'congruence-apply',
      title: '합동을 이용한 활용',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const k = r.int(12, 60);
          const s = r.int(10, 40);
          const sv = new Svg(280, 230);
          const A: [number, number] = [40, 22];
          const B: [number, number] = [40, 115];
          const C: [number, number] = [140, 115];
          const D: [number, number] = [240, 115];
          const E: [number, number] = [2 * C[0] - A[0], 2 * C[1] - A[1]];
          sv.raw('<rect x="0" y="38" width="280" height="62" class="soft"/>');
          sv.text(255, 70, '강', { size: 13 });
          sv.line(A[0], A[1], E[0], E[1]);
          sv.line(A[0], A[1], B[0], B[1]);
          sv.line(B[0], B[1], D[0], D[1]);
          sv.line(D[0], D[1], E[0], E[1]);
          sv.dot(A[0], A[1]);
          sv.text(A[0] - 12, A[1], 'A');
          sv.text(B[0] - 12, B[1] + 4, 'B');
          sv.text(C[0], C[1] + 16, 'C');
          sv.text(D[0] + 12, D[1] - 4, 'D');
          sv.text(E[0] + 12, E[1], 'E');
          sv.rightAngle(B[0], B[1], [1, 0], [0, -1]);
          sv.rightAngle(D[0], D[1], [-1, 0], [0, 1]);
          return {
            q: `강 건너편의 A 지점과 강가의 B 지점 사이의 거리를 알아보기 위해 그림과 같이 $\\overline{AB} \\perp \\overline{BD}$ 가 되도록 점 B 에서 직선을 따라 $\\overline{BC} = \\overline{CD} = ${s}$ m 인 두 점 C, D 를 잡고, 점 D 에서 $\\overline{BD}$ 에 수직으로 걸어가 세 점 A, C, E 가 한 직선 위에 있도록 점 E 를 잡았습니다. $\\overline{DE} = ${k}$ m 일 때, 두 지점 A, B 사이의 거리를 구하세요.`,
            fig: sv.toString(),
            answer: { type: 'num', value: k, unit: 'm' },
            steps: [
              `△ABC 와 △EDC 에서 $\\overline{BC} = \\overline{DC}$, $\\angle ABC = \\angle EDC = 90${DEG}$, $\\angle ACB = \\angle ECD$ (맞꼭지각)`,
              '따라서 △ABC ≡ △EDC (ASA 합동)',
              `$\\overline{AB} = \\overline{ED} = ${k}$ m`,
            ],
          };
        }
        if (level === 2) {
          const a = r.int(2, 12) * 2;
          const ov = (a * a) / 4;
          const askUnion = r.chance(0.5);
          const ans = askUnion ? 2 * a * a - ov : ov;
          return {
            q: `한 변의 길이가 $${a}$ cm 인 두 정사각형 ABCD 와 OEFG 가 있습니다. 점 O 가 정사각형 ABCD 의 두 대각선의 교점이 되도록 두 정사각형을 겹쳐 놓았을 때, ${askUnion ? '두 정사각형으로 덮인 전체 부분의 넓이' : '두 정사각형이 겹쳐진 부분의 넓이'}를 구하세요. (단, 정사각형 OEFG 의 두 변 OE, OG 는 각각 정사각형 ABCD 의 변과 만난다.)`,
            answer: { type: 'num', value: ans, unit: 'cm²' },
            steps: [
              '두 변 OE, OG 가 정사각형 ABCD 의 변과 만나는 점으로 생기는 두 삼각형은 ASA 합동입니다. (대각선이 이루는 각 $45' + DEG + '$, $\\overline{OB} = \\overline{OC}$, 끼인각이 같음)',
              `그래서 겹쳐진 부분의 넓이는 정사각형 ABCD 넓이의 $\\frac{1}{4}$ 로 항상 같아요: $${a} \\times ${a} \\times \\frac{1}{4} = ${ov}$ cm²`,
              askUnion ? `전체 넓이: $${a * a} \\times 2 - ${ov} = ${ans}$ cm²` : `답: $${ov}$ cm²`,
            ],
            hint: '겹쳐진 부분을 정사각형의 대각선으로 나누어 합동인 삼각형을 찾아보세요.',
          };
        }
        const a = r.int(6, 16);
        const c = r.int(1, a - 1);
        const sv = new Svg(260, 230);
        const Bp: [number, number] = [30, 190];
        const Cp: [number, number] = [190, 190];
        const Ap: [number, number] = [110, 190 - 160 * Math.sin(Math.PI / 3)];
        const t = c / a;
        const Dp: [number, number] = [Bp[0] + (Cp[0] - Bp[0]) * t, 190];
        // A 중심 회전 (B → C) 으로 D → E
        const rot = (p: [number, number], ang: number): [number, number] => {
          const dx = p[0] - Ap[0];
          const dy = p[1] - Ap[1];
          return [Ap[0] + dx * Math.cos(ang) - dy * Math.sin(ang), Ap[1] + dx * Math.sin(ang) + dy * Math.cos(ang)];
        };
        let ang = -Math.PI / 3;
        const tc = rot(Bp, ang);
        if (Math.hypot(tc[0] - Cp[0], tc[1] - Cp[1]) > 1) ang = Math.PI / 3;
        const Ep = rot(Dp, ang);
        sv.poly([Ap, Bp, Cp]);
        sv.poly([Ap, Dp, Ep], { cls: 'acc' });
        sv.line(Cp[0], Cp[1], Ep[0], Ep[1], { cls: 'acc2' });
        sv.text(Ap[0], Ap[1] - 12, 'A');
        sv.text(Bp[0] - 12, Bp[1] + 4, 'B');
        sv.text(Cp[0] + 4, Cp[1] + 14, 'C');
        sv.text(Dp[0], Dp[1] + 14, 'D');
        sv.text(Ep[0] + 12, Ep[1], 'E');
        return {
          q: `그림에서 △ABC 는 정삼각형이고, 점 D 는 변 BC 위의 점입니다. $\\overline{AD}$ 를 한 변으로 하는 정삼각형 ADE 를 그렸더니 $\\overline{CE} = ${c}$ cm 였습니다. 정삼각형 ABC 의 한 변의 길이가 $${a}$ cm 일 때, $\\overline{CD}$ 의 길이를 구하세요.`,
          fig: sv.toString(),
          answer: { type: 'num', value: a - c, unit: 'cm' },
          steps: [
            `△ABD 와 △ACE 에서 $\\overline{AB} = \\overline{AC}$, $\\overline{AD} = \\overline{AE}$`,
            `$\\angle BAD = 60${DEG} - \\angle DAC = \\angle CAE$ 이므로 △ABD ≡ △ACE (SAS 합동)`,
            `$\\overline{BD} = \\overline{CE} = ${c}$ cm`,
            `$\\overline{CD} = \\overline{BC} - \\overline{BD} = ${a} - ${c} = ${a - c}$ cm`,
          ],
          hint: '합동인 두 삼각형 △ABD, △ACE 를 찾으세요.',
        };
      },
    },
    {
      id: 'perimeter-triangle',
      title: '둘레가 주어진 삼각형 만들기',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const a = r.int(2, 7);
          const b = r.int(2 * a, 2 * a + 6);
          const [x, y] = r.chance(0.5) ? [a, b] : [b, a];
          return {
            q: `두 변의 길이가 $${x}$ cm, $${y}$ cm 인 이등변삼각형의 둘레의 길이를 구하세요.`,
            answer: { type: 'num', value: 2 * b + a, unit: 'cm' },
            steps: [
              `① 세 변이 $${a}$, $${a}$, $${b}$ 이면 $${b} \\ge ${a} + ${a}$ 이므로 삼각형이 될 수 없어요.`,
              `② 세 변이 $${b}$, $${b}$, $${a}$ 이면 $${b} < ${b} + ${a}$ 이므로 삼각형이 됩니다.`,
              `둘레: $${b} + ${b} + ${a} = ${2 * b + a}$ cm`,
            ],
            hint: '같은 두 변이 어느 쪽인지 두 경우를 모두 확인하세요.',
          };
        }
        if (level === 2) {
          const P = r.int(10, 32);
          const legs: number[] = [];
          for (let a = 1; a < P; a++) if (P - 2 * a >= 1 && P - 2 * a < 2 * a) legs.push(a);
          return {
            q: `길이가 $${P}$ cm 인 철사를 남김없이 구부려 세 변의 길이가 모두 자연수(cm)인 이등변삼각형을 만들려고 합니다. 만들 수 있는 이등변삼각형은 모두 몇 개인지 구하세요. (단, 정삼각형도 이등변삼각형에 포함한다.)`,
            answer: { type: 'num', value: legs.length, unit: '개' },
            steps: [
              `같은 두 변을 $a$ cm 라 하면 나머지 변은 $(${P} - 2a)$ cm`,
              `$${P} - 2a \\ge 1$ 이고 $${P} - 2a < 2a$ (가장 긴 변 조건) 이므로 $\\frac{${P}}{4} < a < \\frac{${P}}{2}$`,
              `가능한 세 변: ${legs.map((a) => `$(${a}, ${a}, ${P - 2 * a})$`).join(', ')}`,
              `답: $${legs.length}$ 개`,
            ],
          };
        }
        const P = r.int(9, 20);
        const scal = r.chance(0.5);
        const ts: [number, number, number][] = [];
        for (let a = 1; a <= P; a++)
          for (let b = a; b <= P; b++) {
            const c = P - a - b;
            if (c < b) continue;
            if (c < a + b && (!scal || (a < b && b < c))) ts.push([a, b, c]);
          }
        if (ts.length === 0) return this.gen(r, level);
        return {
          q: `둘레의 길이가 $${P}$ cm 이고 세 변의 길이가 모두 자연수(cm)인 삼각형 중에서 ${scal ? '세 변의 길이가 **모두 다른**' : '세 변의 길이의 조합이 서로 다른'} 삼각형은 모두 몇 개인지 구하세요.`,
          answer: { type: 'num', value: ts.length, unit: '개' },
          steps: [
            `세 변을 $a \\le b \\le c$ 라 하면 $a + b + c = ${P}$ 이고 $c < a + b$ 이므로 $c < \\frac{${P}}{2}$`,
            `가능한 세 변: ${ts.map((t) => `$(${t.join(', ')})$`).join(', ')}`,
            `답: $${ts.length}$ 개`,
          ],
          hint: '가장 긴 변의 길이부터 정해 보세요.',
        };
      },
    },
  ],

  // ═══════════ m1b-3 다각형·원과 부채꼴 ═══════════
  'm1b-3': [
    {
      id: 'polygon-word',
      title: '정다각형의 활용',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const n = r.pick([3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20]);
          const e = 360 / n;
          const who = r.pick(['로봇', '드론', '거북이 로봇']);
          return {
            q: `${jo(who, '이/가')} 일정한 거리를 곧게 나아간 뒤 왼쪽으로 $${e}${DEG}$ 회전하는 것을 되풀이했더니, 처음 출발한 자리로 돌아오면서 정다각형을 그렸습니다. ${jo(who, '이/가')} 그린 도형은 정몇각형인지 구하세요.`,
            answer: { type: 'num', value: n, unit: '각형' },
            steps: [`회전한 각은 정다각형의 한 외각이고, 한 바퀴 돌아오면 외각의 합은 $360${DEG}$ 입니다.`, `$360${DEG} \\div ${e}${DEG} = ${n}$`, `답: ${POLY[n]}`],
          };
        }
        if (level === 2) {
          const n = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20]);
          const e = 360 / n;
          const i = 180 - e;
          const g = gcd(i, e);
          return {
            q: `한 내각의 크기와 한 외각의 크기의 비가 $${i / g} : ${e / g}$ 인 정다각형의 대각선의 개수를 구하세요.`,
            answer: { type: 'num', value: (n * (n - 3)) / 2, unit: '개' },
            steps: [
              `(한 내각) + (한 외각) $= 180${DEG}$ 이므로 한 외각은 $180${DEG} \\times \\frac{${e / g}}{${i / g + e / g}} = ${e}${DEG}$`,
              `$360${DEG} \\div ${e}${DEG} = ${n}$ → ${POLY[n]}`,
              `대각선: $\\frac{${n} \\times ${n - 3}}{2} = ${(n * (n - 3)) / 2}$ 개`,
            ],
          };
        }
        const n = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20]);
        const e = 360 / n;
        const I = 180 - e;
        if (r.chance(0.5)) {
          return {
            q: `어떤 정다각형의 내각의 크기의 합과 외각의 크기의 합을 더했더니 $${180 * n}${DEG}$ 였습니다. 이 정다각형의 한 내각의 크기를 구하세요.`,
            answer: { type: 'num', value: I, unit: '°' },
            steps: [
              `$n$각형이라 하면 $180${DEG} \\times (n - 2) + 360${DEG} = 180${DEG} \\times n = ${180 * n}${DEG}$`,
              `$n = ${n}$ → ${POLY[n]}`,
              `한 내각: $\\frac{180${DEG} \\times ${n - 2}}{${n}} = ${I}${DEG}$`,
            ],
          };
        }
        const d = I - e;
        return {
          q: `한 내각의 크기가 한 외각의 크기보다 $${d}${DEG}$ 큰 정다각형이 있습니다. 이 정다각형의 한 꼭짓점에서 그을 수 있는 대각선의 개수와 대각선의 총 개수를 각각 구하세요.`,
          answer: { type: 'fields', fields: [{ label: '한 꼭짓점에서', value: n - 3, unit: '개' }, { label: '총 개수', value: (n * (n - 3)) / 2, unit: '개' }] },
          steps: [
            `한 외각을 $x${DEG}$ 라 하면 한 내각은 $(x + ${d})${DEG}$ 이고 $x + (x + ${d}) = 180$`,
            `$2x = ${180 - d}$, $x = ${e}$ → $360 \\div ${e} = ${n}$, ${POLY[n]}`,
            `한 꼭짓점에서 $${n} - 3 = ${n - 3}$ 개, 총 $\\frac{${n} \\times ${n - 3}}{2} = ${(n * (n - 3)) / 2}$ 개`,
          ],
        };
      },
    },
    {
      id: 'sector-word',
      title: '실생활 속 부채꼴 (피자·와이퍼·염소)',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const rr = r.pick([10, 12, 15, 16, 18, 20]);
          const n = r.pick([4, 6, 8, 10, 12]);
          const S = new F(rr * rr, n);
          const L = new F(2 * rr, n);
          return {
            q: `반지름의 길이가 $${rr}$ cm 인 원 모양의 피자를 중심을 지나게 잘라 크기가 같은 $${n}$ 조각으로 나누었습니다. 한 조각의 넓이를 구하세요. (단위: cm²)`,
            answer: texChoices(r, piTex(S), [piTex(L), piTex(S.mul(2)), piTex(S.div(2)), piTex(new F(rr * rr)), piTex(new F(rr, n))]),
            steps: [`한 조각은 중심각이 $360${DEG} \\div ${n} = ${360 / n}${DEG}$ 인 부채꼴입니다.`, `$\\pi \\times ${rr}^2 \\times \\frac{${360 / n}}{360} = ${piTex(S)}$ (cm²)`],
          };
        }
        if (level === 2) {
          for (;;) {
            const R = r.int(4, 9) * 10;
            const l = r.int(2, 6) * 5;
            const th = r.pick([60, 90, 120, 135, 150]);
            if (l >= R) continue;
            const rIn = R - l;
            const S = new F((R * R - rIn * rIn) * th, 360);
            const wiper = r.chance(0.5);
            const wrongs = [piTex(new F(l * l * th, 360)), piTex(new F(R * R * th, 360)), piTex(new F(2 * l * th, 360)), piTex(new F((R * R - rIn * rIn) * th, 180)), piTex(new F((R - rIn) * (R - rIn), 1))];
            return {
              q: wiper
                ? `자동차 와이퍼의 막대는 회전 중심에서 끝까지 길이가 $${R}$ cm 이고, 유리를 닦는 고무날은 막대의 바깥쪽 끝에서부터 $${l}$ cm 부분에 붙어 있습니다. 와이퍼가 회전 중심을 기준으로 $${th}${DEG}$ 만큼 움직일 때, 고무날이 닦는 부분의 넓이를 구하세요. (단위: cm²)`
                : `부챗살의 길이가 $${R}$ cm 인 부채를 $${th}${DEG}$ 만큼 펼쳤습니다. 종이는 부챗살의 바깥쪽 끝에서부터 $${l}$ cm 부분에만 붙어 있을 때, 종이 부분의 넓이를 구하세요. (단위: cm²)`,
              answer: texChoices(r, piTex(S), wrongs),
              steps: [
                `닦는(종이) 부분 = (반지름 $${R}$ 인 부채꼴) − (반지름 $${rIn}$ 인 부채꼴), 중심각 $${th}${DEG}$`,
                `$\\pi \\times ${R}^2 \\times \\frac{${th}}{360} - \\pi \\times ${rIn}^2 \\times \\frac{${th}}{360}$`,
                `$= \\pi \\times (${R * R} - ${rIn * rIn}) \\times \\frac{${th}}{360} = ${piTex(S)}$ (cm²)`,
              ],
              hint: '큰 부채꼴에서 작은 부채꼴을 빼세요.',
            };
          }
        }
        const a = r.pick([3, 4, 5, 6, 8, 10]);
        const L = r.int(a + 1, 2 * a);
        const main = new F(3 * L * L, 4);
        const side = new F((L - a) * (L - a), 4);
        const S = main.add(side.mul(2));
        return {
          q: `한 변의 길이가 $${a}$ m 인 정사각형 모양의 창고가 있습니다. 창고의 한 꼭짓점에 길이가 $${L}$ m 인 끈으로 염소를 묶어 두었을 때, 염소가 창고 밖에서 움직일 수 있는 영역의 최대 넓이를 구하세요. (단, 끈의 매듭과 염소의 크기는 생각하지 않으며, 염소는 창고 안으로 들어갈 수 없다. 단위: m²)`,
          answer: texChoices(r, piTex(S), [piTex(main), piTex(new F(L * L)), piTex(main.add(side)), piTex(main.add(side.mul(4))), piTex(new F(L * L).add(side.mul(2)))]),
          steps: [
            `묶인 꼭짓점을 중심으로 반지름 $${L}$, 중심각 $270${DEG}$ 인 부채꼴: $\\pi \\times ${L}^2 \\times \\frac{3}{4} = ${piTex(main)}$`,
            `끈이 창고 모서리에 걸려 이웃한 두 꼭짓점을 중심으로 반지름 $${L} - ${a} = ${L - a}$, 중심각 $90${DEG}$ 인 부채꼴 2개: $${piTex(side)} \\times 2 = ${piTex(side.mul(2))}$`,
            `전체: $${piTex(main)} + ${piTex(side.mul(2))} = ${piTex(S)}$ (m²)`,
          ],
          hint: '끈이 창고 모서리에 걸리면 반지름이 줄어든 부채꼴이 생겨요.',
        };
      },
    },
  ],

  // ═══════════ m1b-4 입체도형 ═══════════
  'm1b-4': [
    {
      id: 'water-tank',
      title: '그릇에 물 채우기',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          for (;;) {
            const [a, b, c] = [r.int(3, 10) * 10, r.int(2, 8) * 10, r.int(2, 8) * 10];
            const v = r.pick([2, 3, 4, 5, 6]);
            const V = a * b * c;
            if ((V / 1000) % v !== 0) continue;
            return {
              q: `안쪽의 가로가 $${a}$ cm, 세로가 $${b}$ cm, 높이가 $${c}$ cm 인 직육면체 모양의 빈 물통에 $1$ 분에 $${v}$ L 씩 물을 넣습니다. 물통을 가득 채우는 데 몇 분이 걸리는지 구하세요. (단, $1$ L $= 1000$ cm³)`,
              answer: { type: 'num', value: V / 1000 / v, unit: '분' },
              steps: [`물통의 부피: $${a} \\times ${b} \\times ${c} = ${V}$ cm³ $= ${V / 1000}$ L`, `$${V / 1000} \\div ${v} = ${V / 1000 / v}$`, `답: $${V / 1000 / v}$ 분`],
            };
          }
        }
        if (level === 2) {
          if (r.chance(0.5)) {
            const rr = r.int(3, 10);
            const h1 = r.int(5, 15);
            const dh = r.int(1, 6);
            const V = new F(rr * rr * dh);
            return {
              q: `밑면의 반지름의 길이가 $${rr}$ cm 인 원기둥 모양의 그릇에 물이 $${h1}$ cm 높이까지 들어 있습니다. 이 그릇에 돌 하나를 완전히 잠기도록 넣었더니 물의 높이가 $${h1 + dh}$ cm 가 되었습니다. 돌의 부피를 구하세요. (단, 물은 넘치지 않았다. 단위: cm³)`,
              answer: texChoices(r, piTex(V), [piTex(new F(rr * rr * (h1 + dh))), piTex(new F(2 * rr * dh)), piTex(new F(rr * dh)), piTex(V.div(3)), piTex(new F(rr * rr * h1))]),
              steps: [`늘어난 물의 부피가 돌의 부피입니다.`, `늘어난 높이: $${h1 + dh} - ${h1} = ${dh}$ cm`, `$\\pi \\times ${rr}^2 \\times ${dh} = ${piTex(V)}$ (cm³)`],
            };
          }
          for (;;) {
            const rc = r.int(3, 9);
            const H = r.int(6, 30);
            const R = r.int(2, 9);
            const num = rc * rc * H;
            if (num % (3 * R * R) !== 0) continue;
            const h = num / (3 * R * R);
            if (h < 2) continue;
            return {
              q: `밑면의 반지름의 길이가 $${rc}$ cm, 높이가 $${H}$ cm 인 원뿔 모양의 그릇에 물을 가득 채운 뒤, 이 물을 밑면의 반지름의 길이가 $${R}$ cm 인 원기둥 모양의 빈 그릇에 모두 옮겨 부었습니다. 원기둥 모양의 그릇에 담긴 물의 높이를 구하세요.`,
              answer: { type: 'num', value: h, unit: 'cm' },
              steps: [
                `원뿔 그릇의 물의 부피: $\\frac{1}{3} \\times \\pi \\times ${rc}^2 \\times ${H} = ${piTex(new F(num, 3))}$ cm³`,
                `원기둥의 물의 높이를 $h$ cm 라 하면 $\\pi \\times ${R}^2 \\times h = ${piTex(new F(num, 3))}$`,
                `$${R * R}h = ${new F(num, 3).tex()}$, $h = ${h}$`,
              ],
            };
          }
        }
        for (;;) {
          const r0 = r.int(2, 5);
          const h0 = r.int(3, 9);
          const R = r.int(r0 + 1, 12);
          const H = r.int(15, 40);
          const hw = r.int(0, 8);
          const num = 3 * R * R * (H - hw);
          const den = r0 * r0 * h0;
          if (num % den !== 0) continue;
          const n = num / den;
          if (n < 3 || n > 80) continue;
          return {
            q: `밑면의 반지름의 길이가 $${R}$ cm, 높이가 $${H}$ cm 인 원기둥 모양의 물통에${hw ? ` 물이 $${hw}$ cm 높이까지 들어 있습니다. 이 물통에` : ''} 밑면의 반지름의 길이가 $${r0}$ cm, 높이가 $${h0}$ cm 인 원뿔 모양의 컵으로 물을 가득 떠서 부으려고 합니다. 물통을 가득 채우려면 컵으로 물을 적어도 몇 번 부어야 하는지 구하세요.`,
            answer: { type: 'num', value: n, unit: '번' },
            steps: [
              `더 채워야 할 부피: $\\pi \\times ${R}^2 \\times ${hw ? `(${H} - ${hw})` : H} = ${piTex(new F(R * R * (H - hw)))}$ cm³`,
              `컵 한 번의 부피: $\\frac{1}{3} \\times \\pi \\times ${r0}^2 \\times ${h0} = ${piTex(new F(den, 3))}$ cm³`,
              `$${piTex(new F(R * R * (H - hw)))} \\div ${piTex(new F(den, 3))} = ${n}$`,
              `답: $${n}$ 번`,
            ],
            hint: '원뿔의 부피는 같은 밑면·높이인 원기둥의 1/3 이에요.',
          };
        }
      },
    },
    {
      id: 'recast',
      title: '녹여서 다시 만들기·물에 잠기기',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const rr = r.int(1, 3);
          const k = r.int(2, 4);
          const R = rr * k;
          return {
            q: `반지름의 길이가 $${R}$ cm 인 쇠공 한 개를 녹여서 반지름의 길이가 $${rr}$ cm 인 쇠공을 만들려고 합니다. 쇠공은 최대 몇 개 만들 수 있는지 구하세요. (단, 녹이는 과정에서 버려지는 쇠는 없다.)`,
            answer: { type: 'num', value: k ** 3, unit: '개' },
            steps: [`큰 공의 부피: $\\frac{4}{3}\\pi \\times ${R}^3 = ${piTex(new F(4 * R ** 3, 3))}$ cm³`, `작은 공의 부피: $\\frac{4}{3}\\pi \\times ${rr}^3 = ${piTex(new F(4 * rr ** 3, 3))}$ cm³`, `$${piTex(new F(4 * R ** 3, 3))} \\div ${piTex(new F(4 * rr ** 3, 3))} = ${k ** 3}$ 개`],
          };
        }
        if (level === 2) {
          for (;;) {
            const Rc = r.int(2, 10);
            const H = r.int(2, 20);
            const rr = r.int(1, 3);
            const num = 3 * Rc * Rc * H;
            const den = 4 * rr ** 3;
            if (num % den !== 0) continue;
            const n = num / den;
            if (n < 2 || n > 120) continue;
            return {
              q: `밑면의 반지름의 길이가 $${Rc}$ cm, 높이가 $${H}$ cm 인 원기둥 모양의 찰흙을 남김없이 사용하여 반지름의 길이가 $${rr}$ cm 인 공 모양을 만들려고 합니다. 공 모양은 몇 개 만들 수 있는지 구하세요.`,
              answer: { type: 'num', value: n, unit: '개' },
              steps: [`원기둥의 부피: $\\pi \\times ${Rc}^2 \\times ${H} = ${piTex(new F(Rc * Rc * H))}$ cm³`, `공 한 개의 부피: $\\frac{4}{3}\\pi \\times ${rr}^3 = ${piTex(new F(den, 3))}$ cm³`, `$${piTex(new F(Rc * Rc * H))} \\div ${piTex(new F(den, 3))} = ${n}$ 개`],
            };
          }
        }
        for (;;) {
          const R = r.int(3, 10);
          const rr = r.int(1, 3);
          const H = r.int(15, 30);
          const h0 = r.int(Math.max(2 * rr, 5), H - 3);
          const room = 3 * R * R * (H - h0);
          const ball = 4 * rr ** 3;
          const n = Math.floor(room / ball);
          if (n < 2 || n > 150) continue;
          const exact = room % ball === 0;
          return {
            q: `밑면의 반지름의 길이가 $${R}$ cm, 높이가 $${H}$ cm 인 원기둥 모양의 그릇에 물이 $${h0}$ cm 높이까지 들어 있습니다. 이 그릇에 반지름의 길이가 $${rr}$ cm 인 쇠구슬을 하나씩 넣을 때, 물이 넘치지 않게 하려면 쇠구슬을 최대 몇 개까지 넣을 수 있는지 구하세요. (단, 쇠구슬은 모두 물에 완전히 잠긴다.)`,
            answer: { type: 'num', value: n, unit: '개' },
            steps: [
              `물이 더 올라갈 수 있는 부피: $\\pi \\times ${R}^2 \\times (${H} - ${h0}) = ${piTex(new F(R * R * (H - h0)))}$ cm³`,
              `구슬 한 개의 부피: $\\frac{4}{3}\\pi \\times ${rr}^3 = ${piTex(new F(ball, 3))}$ cm³`,
              `구슬을 $x$ 개 넣는다고 하면 $${piTex(new F(ball, 3))} \\times x \\le ${piTex(new F(R * R * (H - h0)))}$, $x \\le ${new F(room, ball).tex()}$`,
              `${exact ? '' : '자연수 중 가장 큰 값은 '}$${n}$ 개`,
            ],
            hint: '잠긴 구슬의 부피만큼 물의 높이가 올라가요.',
          };
        }
      },
    },
  ],

  // ═══════════ m1b-5 자료의 정리와 해석 ═══════════
  'm1b-5': [
    {
      id: 'rep-value-word',
      title: '대푯값의 활용',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const sizes = [230, 235, 240, 245, 250, 255, 260];
          const mode = r.pick(sizes);
          const others = r.sample(sizes.filter((s) => s !== mode), 4);
          const cnt = r.int(3, 4);
          const data = [...Array(cnt).fill(mode)];
          others.forEach((s, i) => {
            for (let k = 0; k < (i < 2 ? cnt - 1 : 1); k++) data.push(s);
          });
          const shuffled = r.shuffle(data);
          return {
            q: `어느 신발 가게에서 하루 동안 팔린 운동화의 크기(mm)를 조사하였더니 다음과 같았습니다. 이 가게에서 다음에 운동화를 주문할 때 가장 많이 주문해야 할 크기를 대푯값으로 정하려고 합니다. 그 크기는 몇 mm 인지 구하세요.\n$$${shuffled.join(',\\ ')}$$`,
            answer: { type: 'num', value: mode, unit: 'mm' },
            steps: ['가장 많이 팔린 크기를 알아야 하므로 대푯값으로 **최빈값**이 알맞아요.', `$${mode}$ mm 가 $${cnt}$ 번으로 가장 많아요.`, `답: $${mode}$ mm`],
          };
        }
        if (level === 2) {
          for (;;) {
            const v = Array.from({ length: 6 }, () => r.int(2, 30)).sort((a, b) => a - b);
            if (new Set(v).size < 6) continue;
            const x = v[3];
            const med = (v[2] + x) / 2;
            const shown = v.map((a, i) => (i === 3 ? 'x' : String(a)));
            return {
              q: `다음은 학생 $6$ 명이 한 달 동안 도서관을 방문한 횟수(회)를 작은 값부터 크기순으로 나열한 것입니다. 이 자료의 중앙값이 $${dec(med)}$ 일 때, $x$ 의 값을 구하세요.\n$$${shown.join(',\\ ')}$$`,
              answer: { type: 'num', value: x },
              steps: [`자료가 $6$ 개이므로 중앙값은 $3$ 번째와 $4$ 번째 값의 평균입니다.`, `$\\frac{${v[2]} + x}{2} = ${dec(med)}$`, `$${v[2]} + x = ${dec(2 * med)}$, $x = ${x}$`],
            };
          }
        }
        for (;;) {
          const v = Array.from({ length: 7 }, () => r.int(50, 99));
          const S = sum(v);
          if (S % 7 !== 0 || new Set(v).size < 7) continue;
          const mean = S / 7;
          const k = r.int(-8, 12);
          const g = mean + k;
          if (v.includes(g) || g > 100) continue;
          const all = [...v, g].sort((a, b) => a - b);
          const med = (all[3] + all[4]) / 2;
          const name = r.pick(NAMES);
          return {
            q: `모둠 학생 $7$ 명의 수학 점수가 다음과 같습니다. 여기에 전학 온 ${name}의 점수를 더했는데, ${name}의 점수는 처음 $7$ 명의 평균보다 $${Math.abs(k)}$ 점 ${k >= 0 ? '높습니다' : '낮습니다'}. ${jo(name, '을/를')} 포함한 $8$ 명의 점수의 중앙값을 구하세요.\n$$${v.join(',\\ ')}$$`,
            answer: { type: 'num', value: med, unit: '점' },
            steps: [
              `처음 $7$ 명의 평균: $${S} \\div 7 = ${mean}$ 점 → ${name}의 점수 $${mean} ${k >= 0 ? '+' : '-'} ${Math.abs(k)} = ${g}$ 점`,
              `$8$ 명을 크기순으로: $${all.join(',\\ ')}$`,
              `중앙값: $\\frac{${all[3]} + ${all[4]}}{2} = ${dec(med)}$ 점`,
            ],
            hint: '먼저 새 학생의 점수를 구하고, 8개를 크기순으로 늘어놓으세요.',
          };
        }
      },
    },
    {
      id: 'freq-word',
      title: '도수분포표의 해석',
      gen(r, level): ProblemDraft {
        const topic = r.pick([
          { what: '통학 시간', unit: '분', s0: 0, st: 10, who: '학생' },
          { what: '키', unit: 'cm', s0: 140, st: 5, who: '학생' },
          { what: '수학 점수', unit: '점', s0: 50, st: 10, who: '학생' },
          { what: '하루 운동 시간', unit: '분', s0: 0, st: 20, who: '회원' },
        ]);
        const lab = (i: number) => `$${topic.s0 + i * topic.st}$ 이상 ~ $${topic.s0 + (i + 1) * topic.st}$ 미만`;
        const bnd = (i: number) => topic.s0 + i * topic.st;
        const part = (N: number) => {
          for (;;) {
            const f = Array.from({ length: 5 }, () => r.int(1, Math.ceil((N * 2) / 5)));
            const d = N - sum(f.slice(0, 4));
            if (d >= 1 && d <= (N * 2) / 5) {
              f[4] = d;
              return f;
            }
          }
        };
        const head = [`${topic.what} (${topic.unit})`, `도수 (명)`];
        if (level === 1) {
          const N = r.pick([20, 25, 50]);
          const f = part(N);
          const k = f[3] + f[4];
          return {
            q: `다음은 어느 반 ${topic.who} $${N}$ 명의 ${jo(topic.what, '을/를')} 조사하여 나타낸 도수분포표입니다. ${jo(topic.what, '이/가')} $${bnd(3)}$ ${topic.unit} 이상인 ${jo(topic.who, '은/는')} 전체의 몇 % 인지 구하세요.`,
            table: [head, ...f.map((c, i) => [lab(i), `$${c}$`]), ['합계', `$${N}$`]],
            answer: { type: 'num', value: (k * 100) / N, unit: '%' },
            steps: [`$${bnd(3)}$ ${topic.unit} 이상: $${f[3]} + ${f[4]} = ${k}$ 명`, `$\\frac{${k}}{${N}} \\times 100 = ${(k * 100) / N}$ (%)`],
          };
        }
        if (level === 2) {
          for (;;) {
            const N = r.int(16, 50);
            const f = part(N);
            const low = f[0] + f[1];
            if ((low * 100) % N !== 0) continue;
            const p = (low * 100) / N;
            if (p === 0 || p >= 100) continue;
            const K = N - f[1];
            return {
              q: `다음은 어느 동아리 ${topic.who}들의 ${jo(topic.what, '을/를')} 조사하여 나타낸 도수분포표입니다. ${jo(topic.what, '이/가')} $${bnd(2)}$ ${topic.unit} 미만인 ${jo(topic.who, '이/가')} 전체의 $${p}$% 일 때, $A$ 의 값을 구하세요.`,
              table: [head, ...f.map((c, i) => [lab(i), i === 1 ? '$A$' : `$${c}$`])],
              answer: { type: 'num', value: f[1] },
              steps: [
                `전체 도수: $${K} + A$, $${bnd(2)}$ ${topic.unit} 미만: $${f[0]} + A$`,
                `$\\frac{${f[0]} + A}{${K} + A} \\times 100 = ${p}$ → $100(${f[0]} + A) = ${p}(${K} + A)$`,
                `$${100 - p}A = ${p * K - 100 * f[0]}$, $A = ${f[1]}$`,
                `확인: $\\frac{${low}}{${N}} \\times 100 = ${p}$ ✓`,
              ],
              hint: '전체 도수에도 A 가 들어 있어요.',
            };
          }
        }
        const N = r.pick([20, 25, 40, 50]);
        for (;;) {
          const f = part(N);
          const hi = f[3] + f[4];
          if ((hi * 100) % N !== 0) continue;
          const p = (hi * 100) / N;
          return {
            q: `다음은 어느 반 ${topic.who} $${N}$ 명의 ${jo(topic.what, '을/를')} 조사하여 나타낸 도수분포표인데, 일부가 찢어져 $A$, $B$ 로 나타내었습니다. ${jo(topic.what, '이/가')} $${bnd(3)}$ ${topic.unit} 이상인 ${jo(topic.who, '이/가')} 전체의 $${p}$% 일 때, $A$, $B$ 의 값을 각각 구하세요.`,
            table: [head, ...f.map((c, i) => [lab(i), i === 1 ? '$A$' : i === 3 ? '$B$' : `$${c}$`]), ['합계', `$${N}$`]],
            answer: { type: 'fields', fields: [{ label: 'A', value: f[1] }, { label: 'B', value: f[3] }] },
            steps: [
              `$${bnd(3)}$ ${topic.unit} 이상: $${N} \\times \\frac{${p}}{100} = ${hi}$ 명 → $B + ${f[4]} = ${hi}$, $B = ${f[3]}$`,
              `합계에서 $${f[0]} + A + ${f[2]} + ${f[3]} + ${f[4]} = ${N}$`,
              `$A = ${f[1]}$`,
            ],
          };
        }
      },
    },
  ],
};
