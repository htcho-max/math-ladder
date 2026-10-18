// 초3-2 콘텐츠
import type { ContentMap, Level } from '../../core/types';
import type { Rng } from '../../core/rng';
import { Svg } from '../../core/fig';
import { makeChoices } from '../../core/tex';
import { J, c, fr, josa, mx, pickName, picGraph } from './util';
import { divSteps, mul1Steps, mul2Steps } from './arith';

// ───────── 곱셈 도우미 ─────────
function carries(a: number, b: number): number {
  let carry = 0,
    k = 0;
  for (const d of String(a).split('').map(Number).reverse()) {
    const v = d * b + carry;
    carry = Math.floor(v / 10);
    if (carry) k++;
  }
  return k;
}
function mul31(r: Rng, level: Level): [number, number] {
  for (let t = 0; t < 2000; t++) {
    const a = r.int(101, 999),
      b = r.int(2, 9);
    const k = carries(a, b);
    if (level === 1 && k === 0) return [a, b];
    if (level === 2 && k === 1 && a * b < 1000) return [a, b];
    if (level === 3 && k >= 2) return [a, b];
  }
  return [213, 3];
}

// ───────── 원 그림 ─────────
function circleFig(R: number, o: { label?: string; kind?: 'r' | 'd'; letters?: boolean } = {}): string {
  const s = new Svg(180, 160);
  const rr = 62;
  s.circle(90, 80, rr);
  s.dot(90, 80);
  if (o.letters) s.text(90, 94, 'ㅇ', { size: 12 });
  if (o.kind === 'd') {
    s.line(90 - rr, 80, 90 + rr, 80, { cls: 'acc', width: 2 });
    s.text(90, 70, o.label ?? `${R * 2} cm`, { size: 13 });
  } else {
    s.line(90, 80, 90 + rr, 80, { cls: 'acc', width: 2 });
    s.text(90 + rr / 2, 70, o.label ?? `${R} cm`, { size: 13 });
  }
  return s.toString();
}

/** 맞닿은 원 세 개 (반지름 a,b,c) 와 중심을 이은 삼각형 */
function threeCircles(a: number, b: number, cc: number): string {
  const AB = a + b,
    AC = a + cc,
    BC = b + cc;
  const x = (AC * AC - BC * BC + AB * AB) / (2 * AB);
  const y = Math.sqrt(Math.max(0, AC * AC - x * x));
  const pts: [number, number, number][] = [
    [0, 0, a],
    [AB, 0, b],
    [x, y, cc],
  ];
  const minx = Math.min(...pts.map((p) => p[0] - p[2])),
    maxx = Math.max(...pts.map((p) => p[0] + p[2]));
  const miny = Math.min(...pts.map((p) => p[1] - p[2])),
    maxy = Math.max(...pts.map((p) => p[1] + p[2]));
  const W = 260,
    H = 220;
  const sc = Math.min((W - 20) / (maxx - minx), (H - 20) / (maxy - miny));
  const X = (v: number) => 10 + (v - minx) * sc;
  const Y = (v: number) => H - 10 - (v - miny) * sc;
  const s = new Svg(W, H);
  pts.forEach(([px, py, pr]) => {
    s.circle(X(px), Y(py), pr * sc);
    s.dot(X(px), Y(py));
  });
  s.poly(pts.map(([px, py]) => [X(px), Y(py)] as [number, number]), { cls: 'acc' });
  const labs = ['ㄱ', 'ㄴ', 'ㄷ'];
  pts.forEach(([px, py], i) => s.text(X(px), Y(py) + 13, labs[i], { size: 12, cls: 'acc' }));
  return s.toString();
}

// ───────── 그림그래프 자료 ─────────
const THEMES = [
  { head: '마을', labels: ['가', '나', '다', '라'], suf: ' 마을', thing: '사과 생산량', unit: '상자' },
  { head: '과수원', labels: ['햇살', '초록', '푸른', '별빛'], suf: ' 과수원', thing: '배 생산량', unit: '상자' },
  { head: '반', labels: ['1반', '2반', '3반', '4반'], suf: '', thing: '모은 빈 병의 수', unit: '개' },
  { head: '가게', labels: ['가', '나', '다', '라'], suf: ' 가게', thing: '하루 동안 팔린 우유', unit: '개' },
  { head: '농장', labels: ['하늘', '바다', '숲속', '들판'], suf: ' 농장', thing: '감자 수확량', unit: 'kg' },
];
function graphData(r: Rng, level: Level) {
  const th = r.pick(THEMES);
  const units = level === 1 ? [10, 1] : level === 2 ? [100, 10] : [100, 50, 10];
  let vals: number[] = [];
  for (let t = 0; t < 100; t++) {
    vals = th.labels.map(() => (level === 1 ? r.int(11, 48) : r.int(11, 48) * 10));
    if (new Set(vals).size === vals.length) break;
  }
  return { th, units, vals, name: (i: number) => th.labels[i] + th.suf };
}
function iconText(v: number, units: number[], th: { unit: string }): string {
  const parts: string[] = [];
  let rem = v;
  const names = units.length === 2 ? ['큰 그림', '작은 그림'] : ['큰 그림', '중간 그림', '작은 그림'];
  units.forEach((u, j) => {
    const k = Math.floor(rem / u);
    rem -= k * u;
    if (k) parts.push(`${names[j]}(${c(u)}${th.unit}) $${k}$개`);
  });
  return parts.join(', ');
}

export const content: ContentMap = {
  // ═════════════ e3b-1 곱셈 ═════════════
  'e3b-1': {
    concepts: [
      {
        title: '(세 자리 수)×(한 자리 수)',
        body: '일의 자리, 십의 자리, 백의 자리 순서로 곱하고, 곱이 $10$을 넘으면 윗자리로 올림해요.\n$$213\\times3=639,\\quad 254\\times3=762$$\n- 1학기의 (두 자리 수)×(한 자리 수)를 한 자리 늘린 거예요.',
      },
      {
        title: '(몇십)×(몇십), (몇십몇)×(몇십)',
        body: '$40\\times30$ 은 $4\\times3=12$ 에 $0$을 두 개 붙여 $1200$.\n$23\\times40$ 은 $23\\times4=92$ 에 $0$을 하나 붙여 $920$.',
      },
      {
        title: '(두 자리 수)×(두 자리 수)',
        body: '곱하는 수를 일의 자리와 십의 자리로 나누어 곱한 뒤 더해요.\n$$34\\times27 = 34\\times7 + 34\\times20 = 238+680 = 918$$',
        example: { q: '$46\\times35$', a: '$46\\times5=230$, $46\\times30=1380$, $230+1380=1610$' },
      },
      {
        title: '어림하여 확인하기',
        body: '$48\\times21$ 은 약 $50\\times20=1000$ 이므로 답이 $1000$ 가까이 나와야 해요. 어림하면 자릿수 실수를 찾을 수 있어요.',
      },
    ],
    skills: [
      {
        id: 'mul31',
        title: '(세 자리 수)×(한 자리 수)',
        gen(r, level) {
          const [a, b] = mul31(r, level);
          return { q: `계산해 보세요. $$${a}\\times${b}$$`, answer: { type: 'num', value: a * b }, steps: mul1Steps(a, b) };
        },
      },
      {
        id: 'mul-tens',
        title: '(몇십)×(몇십), (몇십몇)×(몇십)',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(1, 9) * 10,
              b = r.int(1, 9) * 10;
            return {
              q: `계산해 보세요. $$${a}\\times${b}$$`,
              answer: { type: 'num', value: a * b },
              steps: [`$${a / 10}\\times${b / 10}=${(a * b) / 100}$`, `$0$을 두 개 붙이면 $${c(a * b)}$`],
            };
          }
          const a = r.int(11, 99),
            b = r.int(2, 9) * 10;
          if (level === 2)
            return {
              q: `계산해 보세요. $$${a}\\times${b}$$`,
              answer: { type: 'num', value: a * b },
              steps: [`$${a}\\times${b / 10}=${a * (b / 10)}$`, `$0$을 하나 붙이면 $${c(a * b)}$`],
            };
          // L3: 곱이 같은 것 / □
          const k = r.int(2, 9);
          const x = r.int(2, 9) * 10;
          const prod = k * 10 * x;
          const y = r.pick([2, 4, 5].filter((d) => (prod / d) % 10 === 0 && prod / d / 10 <= 99 && d * 10 !== x && d !== k));
          if (!y)
            return {
              q: `□ 안에 알맞은 수를 구하세요. $$${k * 10}\\times${x}=${x / 10}\\times\\square$$`,
              answer: { type: 'num', value: (k * 10 * x) / (x / 10) },
              steps: [`$${k * 10}\\times${x}=${c(prod)}$`, `$${x / 10}\\times\\square=${c(prod)}$ → $\\square=${c(prod / (x / 10))}$`],
            };
          return {
            q: `□ 안에 알맞은 수를 구하세요. $$${k * 10}\\times${x}=${y * 10}\\times\\square$$`,
            answer: { type: 'num', value: prod / (y * 10) },
            steps: [`$${k * 10}\\times${x}=${c(prod)}$`, `$${y * 10}\\times\\square=${c(prod)}$ → $${y}\\times\\square=${c(prod / 10)}$`, `$\\square=${c(prod / (y * 10))}$`],
          };
        },
      },
      {
        id: 'mul22',
        title: '(두 자리 수)×(두 자리 수)',
        gen(r, level) {
          let a: number, b: number;
          if (level === 1) {
            a = r.int(11, 34);
            b = r.int(11, 19);
          } else if (level === 2) {
            a = r.int(21, 59);
            b = r.int(21, 59);
          } else {
            a = r.int(45, 99);
            b = r.int(45, 99);
          }
          if (b % 10 === 0) b += 1;
          return { q: `계산해 보세요. $$${a}\\times${b}$$`, answer: { type: 'num', value: a * b }, steps: mul2Steps(a, b) };
        },
      },
      {
        id: 'word',
        title: '곱셈 문장제',
        gen(r, level) {
          const name = pickName(r);
          if (level === 1) {
            const [a, b] = mul31(r, 2);
            const tpl = r.int(0, 2);
            const q = [
              `한 상자에 구슬이 $${a}$개씩 들어 있습니다. $${b}$상자에 들어 있는 구슬은 모두 몇 개인가요?`,
              `${name}는 하루에 $${a}$ m씩 달리기를 합니다. $${b}$일 동안 달린 거리는 모두 몇 m인가요?`,
              `한 대에 $${a}$ kg을 실을 수 있는 수레 $${b}$대에 실을 수 있는 무게는 모두 몇 kg인가요?`,
            ][tpl];
            return { q, answer: { type: 'num', value: a * b, unit: ['개', 'm', 'kg'][tpl] }, steps: [`$${a}\\times${b}$`, ...mul1Steps(a, b).slice(-1)] };
          }
          if (level === 2) {
            const a = r.int(12, 60),
              b = r.int(12, 40);
            const tpl = r.int(0, 2);
            const q = [
              `한 반에 학생이 $${a}$명씩 $${b}$반 있습니다. 학생은 모두 몇 명인가요?`,
              `공책 한 권은 $${a}$장입니다. 공책 $${b}$권은 모두 몇 장인가요?`,
              `${name}는 매일 줄넘기를 $${a}$번씩 합니다. $${b}$일 동안 한 줄넘기는 모두 몇 번인가요?`,
            ][tpl];
            return { q, answer: { type: 'num', value: a * b, unit: ['명', '장', '번'][tpl] }, steps: [`같은 수를 여러 번 더하므로 $${a}\\times${b}$`, ...mul2Steps(a, b)] };
          }
          const a = r.int(15, 45),
            b = r.int(12, 30);
          const sold = r.int(50, a * b - 20);
          if (r.chance(0.5))
            return {
              q: `달걀이 한 판에 $${a}$개씩 $${b}$판 있습니다. 그중 $${sold}$개를 팔았다면 남은 달걀은 몇 개인가요?`,
              answer: { type: 'num', value: a * b - sold, unit: '개' },
              steps: [`전체: $${a}\\times${b}=${c(a * b)}$(개)`, `남은 달걀: $${c(a * b)}-${sold}=${c(a * b - sold)}$(개)`],
            };
          const p1 = r.int(3, 9) * 100,
            n1 = r.int(11, 25),
            p2 = r.int(11, 40) * 10,
            n2 = r.int(11, 30);
          return {
            q: `한 자루에 $${p1}$원인 연필 $${n1}$자루와 한 개에 $${p2}$원인 지우개 $${n2}$개를 샀습니다. 모두 얼마를 내야 하나요?`,
            answer: { type: 'num', value: p1 * n1 + p2 * n2, unit: '원' },
            steps: [`연필 값: $${p1}\\times${n1}=${c(p1 * n1)}$(원)`, `지우개 값: $${p2}\\times${n2}=${c(p2 * n2)}$(원)`, `모두: $${c(p1 * n1)}+${c(p2 * n2)}=${c(p1 * n1 + p2 * n2)}$(원)`],
          };
        },
      },
      {
        id: 'cards',
        title: '수 카드로 곱셈식 만들기',
        gen(r, level) {
          const k = level === 1 ? 4 : 4;
          const cards = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], k);
          const ct = cards.map((x) => `\\boxed{${x}}`).join('\\;');
          if (level === 1) {
            // (세 자리)×(한 자리) 곱이 가장 큰 경우
            let best = -1,
              ex = '';
            for (const p of perms(cards, 4)) {
              const v = (p[0] * 100 + p[1] * 10 + p[2]) * p[3];
              if (v > best) {
                best = v;
                ex = `${p[0]}${p[1]}${p[2]}\\times${p[3]}`;
              }
            }
            return {
              q: `수 카드 $${ct}$를 한 번씩 모두 사용하여 (세 자리 수)$\\times$(한 자리 수)를 만들려고 합니다. 곱이 가장 크게 되는 곱셈식의 곱을 구하세요.`,
              answer: { type: 'num', value: best },
              steps: ['가장 큰 수를 곱하는 수(한 자리)에 놓고, 나머지로 가장 큰 세 자리 수를 만들어요.', `$${ex}=${c(best)}$`],
            };
          }
          const want = level === 2 ? 'max' : 'min';
          let best = want === 'max' ? -1 : Infinity,
            ex = '';
          for (const p of perms(cards, 4)) {
            const v = (p[0] * 10 + p[1]) * (p[2] * 10 + p[3]);
            if ((want === 'max' && v > best) || (want === 'min' && v < best)) {
              best = v;
              ex = `${p[0]}${p[1]}\\times${p[2]}${p[3]}`;
            }
          }
          return {
            q: `수 카드 $${ct}$를 한 번씩 모두 사용하여 (두 자리 수)$\\times$(두 자리 수)를 만들려고 합니다. 곱이 가장 ${want === 'max' ? '큰' : '작은'} 곱셈식의 곱을 구하세요.`,
            answer: { type: 'num', value: best },
            steps: [
              want === 'max' ? '큰 두 수를 각각 십의 자리에 놓고, 여러 경우를 비교해요.' : '작은 두 수를 각각 십의 자리에 놓고, 여러 경우를 비교해요.',
              `가장 ${want === 'max' ? '큰' : '작은'} 곱: $${ex}=${c(best)}$`,
            ],
            hint: '십의 자리에 놓인 수가 곱에 가장 큰 영향을 줘요.',
          };
        },
      },
    ],
  },

  // ═════════════ e3b-2 나눗셈 ═════════════
  'e3b-2': {
    concepts: [
      {
        title: '(몇십)÷(몇)',
        body: '$60\\div3$ 은 $6\\div3=2$ 에 $0$을 붙여 $20$. 십 모형 $6$개를 $3$묶음으로 나누는 것과 같아요.\n- $70\\div5$ 처럼 십의 자리가 나누어떨어지지 않으면 남은 십을 일의 자리로 내려 계산해요: $14$.',
      },
      {
        title: '나머지가 있는 나눗셈',
        body: '$17\\div5$ 는 몫이 $3$이고 $2$가 남아요. 이때 $2$를 **나머지**라고 해요.\n- 나머지는 항상 **나누는 수보다 작아요**.\n- 나머지가 $0$이면 "나누어떨어진다"고 해요.',
        example: { q: '$47\\div6$', a: '$6\\times7=42$, $47-42=5$ → 몫 $7$, 나머지 $5$' },
      },
      {
        title: '(세 자리 수)÷(한 자리 수)',
        body: '높은 자리부터 차례로 나누어요. 백의 자리 숫자가 나누는 수보다 작으면 십의 자리까지 함께 나누어요.\n$$254\\div7 = 36 \\cdots 2$$',
      },
      {
        title: '맞게 계산했는지 확인하기',
        body: '(나누는 수)$\\times$(몫)$+$(나머지)$=$(나누어지는 수) 이면 바르게 계산한 거예요.\n- $47\\div6=7\\cdots5$ → $6\\times7+5=47$ ✓',
      },
    ],
    skills: [
      {
        id: 'div-tens',
        title: '나누어떨어지는 나눗셈',
        gen(r, level) {
          let a: number, b: number;
          if (level === 1) {
            b = r.int(2, 4);
            const q = r.int(1, Math.floor(9 / b)) * 10;
            a = b * q;
            if (r.chance(0.5)) {
              const qq = r.int(1, Math.floor(9 / b));
              const u = r.int(1, Math.floor(9 / b));
              a = b * (qq * 10 + u);
            }
          } else if (level === 2) {
            const pairs: [number, number][] = [];
            for (let t = 1; t <= 9; t++) for (let bb = 2; bb <= 9; bb++) if ((t * 10) % bb === 0 && t % bb !== 0 && t >= bb) pairs.push([t * 10, bb]);
            [a, b] = r.pick(pairs);
          } else {
            for (;;) {
              b = r.int(3, 9);
              const q = r.int(11, Math.floor(99 / b));
              a = b * q;
              if (Math.floor(a / 10) % b !== 0) break;
            }
          }
          return { q: `계산해 보세요. $$${a}\\div${b}$$`, answer: { type: 'num', value: a / b }, steps: divSteps(a, b) };
        },
      },
      {
        id: 'div-rem',
        title: '나머지가 있는 나눗셈',
        gen(r, level) {
          let a: number, b: number;
          if (level === 1) {
            b = r.int(2, 9);
            a = b * r.int(1, 9) + r.int(1, b - 1);
          } else {
            b = r.int(2, 9);
            const q = r.int(10, Math.floor(98 / b));
            a = b * q + r.int(1, b - 1);
            if (a > 99) a = b * 10 + 1;
          }
          if (level === 3) {
            const q = Math.floor(a / b),
              rem = a % b;
            const wrongR = rem + b;
            const correct = `$${a}\\div${b}=${q}\\cdots${rem}$`;
            return {
              q: '나눗셈을 **바르게** 계산한 것은?',
              answer: makeChoices(r, correct, [`$${a}\\div${b}=${q - 1}\\cdots${wrongR}$`, `$${a}\\div${b}=${q + 1}\\cdots${rem}$`, `$${a}\\div${b}=${q}\\cdots${rem + 1}$`, `$${a}\\div${b}=${q - 1}\\cdots${rem}$`].filter((s) => !s.includes('-')), 4),
              steps: [...divSteps(a, b), `나머지는 나누는 수 $${b}$보다 작아야 해요.`],
            };
          }
          return {
            q: `몫과 나머지를 구하세요. $$${a}\\div${b}$$`,
            answer: { type: 'fields', fields: [{ label: '몫', value: Math.floor(a / b) }, { label: '나머지', value: a % b }] },
            steps: divSteps(a, b),
          };
        },
      },
      {
        id: 'div3',
        title: '(세 자리 수)÷(한 자리 수)',
        gen(r, level) {
          let a = 0,
            b = 2;
          for (let t = 0; t < 500; t++) {
            b = r.int(2, 9);
            a = r.int(100, 999);
            const hundredsLess = Math.floor(a / 100) < b;
            if (level === 1 && a % b === 0 && !hundredsLess) break;
            if (level === 2 && a % b !== 0 && !hundredsLess) break;
            if (level === 3 && hundredsLess) break;
          }
          return {
            q: `몫과 나머지를 구하세요. $$${a}\\div${b}$$`,
            answer: { type: 'fields', fields: [{ label: '몫', value: Math.floor(a / b) }, { label: '나머지', value: a % b }] },
            steps: divSteps(a, b),
            hint: level === 3 ? '백의 자리 숫자가 나누는 수보다 작으면 십의 자리까지 함께 나누어요.' : undefined,
          };
        },
      },
      {
        id: 'check',
        title: '나눗셈 검산과 어떤 수',
        gen(r, level) {
          const b = r.int(3, 9);
          const q = r.int(5, 30);
          const rem = r.int(1, b - 1);
          const x = b * q + rem;
          if (level === 1)
            return {
              q: `어떤 수를 $${b}$로 나누었더니 몫이 $${q}$, 나머지가 $${rem}$입니다. 어떤 수는 얼마인가요?`,
              answer: { type: 'num', value: x },
              steps: [`(나누는 수)$\\times$(몫)$+$(나머지)$=$(어떤 수)`, `$${b}\\times${q}+${rem}=${x}$`],
            };
          if (level === 2) {
            const qq = r.int(4, 15);
            return {
              q: `어떤 수를 $${b}$로 나누었을 때 몫이 $${qq}$입니다. 나머지가 될 수 있는 수 중 가장 큰 수를 나머지로 할 때, 어떤 수는 얼마인가요?`,
              answer: { type: 'num', value: b * qq + b - 1 },
              steps: [`나머지는 나누는 수 $${b}$보다 작으므로 가장 큰 나머지는 $${b - 1}$`, `어떤 수: $${b}\\times${qq}+${b - 1}=${b * qq + b - 1}$`],
              hint: '나머지는 나누는 수보다 작아요.',
            };
          }
          let wrongB = r.int(2, 9);
          if (wrongB === b) wrongB = b === 9 ? 8 : b + 1;
          const wq = Math.floor(x / wrongB),
            wr = x % wrongB;
          return {
            q: `어떤 수를 $${b}$로 나누어야 할 것을 잘못하여 $${wrongB}$로 나누었더니 몫이 $${wq}$${wr ? `, 나머지가 $${wr}$` : ''}입니다. 바르게 계산했을 때의 몫과 나머지를 구하세요.`,
            answer: { type: 'fields', fields: [{ label: '몫', value: q }, { label: '나머지', value: rem }] },
            steps: [`어떤 수: $${wrongB}\\times${wq}${wr ? `+${wr}` : ''}=${x}$`, `바르게 계산: $${x}\\div${b}=${q}\\cdots${rem}$`],
          };
        },
      },
      {
        id: 'word',
        title: '나눗셈 문장제',
        gen(r, level) {
          const name = pickName(r);
          const b = r.int(3, 9);
          if (level === 1) {
            const q = r.int(11, Math.floor(99 / b));
            const a = b * q;
            return {
              q: `색종이 $${a}$장을 $${b}$명이 똑같이 나누어 가지려고 합니다. 한 명이 몇 장씩 가질 수 있나요?`,
              answer: { type: 'num', value: q, unit: '장' },
              steps: [`$${a}\\div${b}$`, ...divSteps(a, b).slice(-1)],
            };
          }
          const q = r.int(8, 40);
          const rem = r.int(1, b - 1);
          const a = b * q + rem;
          if (level === 2)
            return {
              q: `${nm2(name)} 사탕 $${a}$개를 한 봉지에 $${b}$개씩 담았습니다. 몇 봉지가 되고, 남는 사탕은 몇 개인가요?`,
              answer: { type: 'fields', fields: [{ label: '봉지', value: q }, { label: '남는 사탕', value: rem, unit: '개' }] },
              steps: [`$${a}\\div${b}$`, ...divSteps(a, b).slice(-1)],
            };
          if (r.chance(0.5))
            return {
              q: `학생 $${a}$명이 한 대에 $${b}$명씩 탈 수 있는 보트를 모두 타려고 합니다. 보트는 적어도 몇 대 필요한가요?`,
              answer: { type: 'num', value: q + 1, unit: '대' },
              steps: [`$${a}\\div${b}=${q}\\cdots${rem}$`, `남은 $${rem}$명도 타야 하므로 보트가 $1$대 더 필요해요.`, `$${q}+1=${q + 1}$(대)`],
              hint: '남는 사람도 모두 타야 해요.',
            };
          return {
            q: `리본 $${a}$ cm로 길이가 $${b}$ cm인 꽃 장식을 만들려고 합니다. 꽃 장식을 최대 몇 개 만들 수 있나요?`,
            answer: { type: 'num', value: q, unit: '개' },
            steps: [`$${a}\\div${b}=${q}\\cdots${rem}$`, `남은 $${rem}$ cm로는 장식을 만들 수 없으므로 $${q}$개`],
          };
        },
      },
    ],
  },

  // ═════════════ e3b-3 원 ═════════════
  'e3b-3': {
    concepts: [
      {
        title: '원의 중심과 반지름',
        body: '원을 그릴 때 누름 못이 꽂혔던 점을 **원의 중심**이라고 해요. 원의 중심과 원 위의 한 점을 이은 선분을 **반지름**이라고 해요.\n- 한 원에서 반지름은 무수히 많고, 길이가 모두 같아요.',
      },
      {
        title: '지름',
        body: '원 위의 두 점을 이은 선분이 원의 중심을 지날 때, 그 선분을 **지름**이라고 해요.\n- 지름은 원 안에 그을 수 있는 가장 긴 선분이에요.\n- 지름은 원을 똑같이 둘로 나누어요.\n$$(\\text{지름})=(\\text{반지름})\\times2$$',
        example: { q: '반지름이 $6$ cm인 원의 지름은?', a: '$6\\times2=12$ (cm)' },
      },
      {
        title: '컴퍼스로 원 그리기',
        body: '컴퍼스를 반지름만큼 벌리고, 침을 원의 중심에 꽂은 다음 한 바퀴 돌려 그려요.\n- 반지름이 $3$ cm인 원을 그리려면 컴퍼스를 $3$ cm 벌려요.',
      },
      {
        title: '원을 이용한 문제',
        body: '- 크기가 같은 원 여러 개를 맞닿게 늘어놓으면 전체 길이는 (지름)$\\times$(원의 수).\n- 맞닿은 두 원의 중심 사이의 거리는 두 원의 반지름의 합이에요.',
      },
    ],
    skills: [
      {
        id: 'radius-diameter',
        title: '반지름과 지름',
        gen(r, level) {
          const R = r.int(2, level === 1 ? 10 : 25);
          if (level === 1) {
            const toD = r.chance(0.5);
            return {
              q: toD ? '원의 지름은 몇 cm인가요?' : '원의 반지름은 몇 cm인가요?',
              fig: circleFig(R, { kind: toD ? 'r' : 'd' }),
              answer: { type: 'num', value: toD ? 2 * R : R, unit: 'cm' },
              steps: toD ? [`지름은 반지름의 $2$배: $${R}\\times2=${2 * R}$ (cm)`] : [`반지름은 지름의 반: $${2 * R}$의 반은 $${R}$ (cm)`],
            };
          }
          if (level === 2) {
            const s = new Svg(240, 140);
            const rr = 34;
            s.circle(120, 70, 2 * rr);
            s.circle(120 - rr, 70, rr);
            s.circle(120 + rr, 70, rr);
            s.dot(120 - rr, 70);
            s.dot(120 + rr, 70);
            s.dot(120, 70);
            s.line(120 + rr, 70, 120 + 2 * rr, 70, { cls: 'acc', width: 2 });
            s.text(120 + rr * 1.5, 60, `${R} cm`, { size: 12 });
            return {
              q: '크기가 같은 작은 원 $2$개를 큰 원 안에 꼭 맞게 그렸습니다. 큰 원의 지름은 몇 cm인가요?',
              fig: s.toString(),
              answer: { type: 'num', value: 4 * R, unit: 'cm' },
              steps: [`작은 원의 지름: $${R}\\times2=${2 * R}$ (cm)`, `큰 원의 지름은 작은 원의 지름 $2$개: $${2 * R}\\times2=${4 * R}$ (cm)`],
            };
          }
          const a = r.int(2, 9),
            b = r.int(a + 1, 15);
          const sc = 200 / (2 * a + 2 * b);
          const cy = b * sc + 8; // 큰 원이 잘리지 않게 높이를 큰 원에 맞춤
          const s = new Svg(260, 2 * b * sc + 16);
          s.circle(30 + a * sc, cy, a * sc);
          s.circle(30 + 2 * a * sc + b * sc, cy, b * sc);
          s.line(30, cy, 30 + 2 * (a + b) * sc, cy, { cls: 'acc', width: 2 });
          s.dot(30, cy);
          s.dot(30 + 2 * (a + b) * sc, cy);
          s.text(22, cy + 12, 'ㄱ', { size: 12 });
          s.text(38 + 2 * (a + b) * sc, cy + 12, 'ㄴ', { size: 12 });
          return {
            q: `반지름이 $${a}$ cm인 원과 반지름이 $${b}$ cm인 원을 그림과 같이 맞닿게 그렸습니다. 선분 ㄱㄴ의 길이는 몇 cm인가요?`,
            fig: s.toString(),
            answer: { type: 'num', value: 2 * (a + b), unit: 'cm' },
            steps: [`작은 원의 지름: $${a}\\times2=${2 * a}$ (cm), 큰 원의 지름: $${b}\\times2=${2 * b}$ (cm)`, `선분 ㄱㄴ: $${2 * a}+${2 * b}=${2 * (a + b)}$ (cm)`],
          };
        },
      },
      {
        id: 'circle-facts',
        title: '원의 성질',
        gen(r) {
          const T = [
            '한 원에서 반지름은 모두 길이가 같습니다.',
            '지름은 원의 중심을 지납니다.',
            '지름은 반지름의 2배입니다.',
            '원 안에 그을 수 있는 가장 긴 선분은 지름입니다.',
            '지름은 원을 똑같이 둘로 나눕니다.',
            '한 원에 반지름은 셀 수 없이 많이 그을 수 있습니다.',
            '컴퍼스를 벌린 길이는 원의 반지름이 됩니다.',
          ];
          const Fs = [
            '한 원에 지름은 1개뿐입니다.',
            '반지름은 지름의 2배입니다.',
            '한 원에서 반지름의 길이는 모두 다릅니다.',
            '원의 중심은 원 위에 있습니다.',
            '원 위의 두 점을 이은 선분은 모두 지름입니다.',
            '컴퍼스를 벌린 길이는 원의 지름이 됩니다.',
            '한 원에 원의 중심은 2개입니다.',
          ];
          const wantT = r.chance(0.5);
          const ans = r.pick(wantT ? T : Fs);
          return {
            q: wantT ? '원에 대한 설명으로 옳은 것은?' : '원에 대한 설명으로 옳지 **않은** 것은?',
            answer: makeChoices(r, ans, r.sample(wantT ? Fs : T, 4), 5),
            steps: [`${wantT ? '옳은 것' : '옳지 않은 것'}: ${ans}`, '원의 중심·반지름·지름의 뜻을 떠올려 보세요.'],
          };
        },
      },
      {
        id: 'circles-in-rect',
        title: '직사각형 안의 원',
        gen(r, level) {
          const n = r.int(2, level === 1 ? 3 : 5);
          const R = r.int(2, 9);
          const W = 2 * R * n,
            H = 2 * R;
          const u = Math.min(260 / (2 * n), 36);
          const s = new Svg(2 * u * n + 40, 90);
          s.rect(20, 10, 2 * u * n, 2 * u, { cls: 'acc' });
          for (let i = 0; i < n; i++) {
            s.circle(20 + u + 2 * u * i, 10 + u, u);
            s.dot(20 + u + 2 * u * i, 10 + u, { r: 2 });
          }
          if (level === 3) {
            return {
              q: `크기가 같은 원 $${n}$개를 직사각형 안에 꼭 맞게 이어 그렸습니다. 직사각형의 네 변의 길이의 합이 $${2 * (W + H)}$ cm일 때, 원의 반지름은 몇 cm인가요?`,
              fig: s.toString(),
              answer: { type: 'num', value: R, unit: 'cm' },
              steps: [
                `원의 지름을 □ cm라 하면 가로는 □$\\times${n}$, 세로는 □`,
                `네 변의 합 = □$\\times${2 * n + 2}=${2 * (W + H)}$ → 지름 $=${2 * R}$ cm`,
                `반지름 $=${R}$ cm`,
              ],
              hint: '가로는 지름 몇 개, 세로는 지름 1개인지 생각해 보세요.',
            };
          }
          s.text(20 + u, 10 + u - 8, `${R} cm`, { size: 11 });
          s.line(20 + u, 10 + u, 20 + 2 * u, 10 + u, { cls: 'acc2' });
          if (level === 1)
            return {
              q: `반지름이 $${R}$ cm인 원 $${n}$개를 직사각형 안에 꼭 맞게 이어 그렸습니다. 직사각형의 가로는 몇 cm인가요?`,
              fig: s.toString(),
              answer: { type: 'num', value: W, unit: 'cm' },
              steps: [`지름: $${R}\\times2=${2 * R}$ (cm)`, `가로는 지름 $${n}$개: $${2 * R}\\times${n}=${W}$ (cm)`],
            };
          return {
            q: `반지름이 $${R}$ cm인 원 $${n}$개를 직사각형 안에 꼭 맞게 이어 그렸습니다. 직사각형의 네 변의 길이의 합은 몇 cm인가요?`,
            fig: s.toString(),
            answer: { type: 'num', value: 2 * (W + H), unit: 'cm' },
            steps: [`가로: $${2 * R}\\times${n}=${W}$ (cm), 세로: $${H}$ cm`, `네 변의 합: $${W}+${H}+${W}+${H}=${2 * (W + H)}$ (cm)`],
          };
        },
      },
      {
        id: 'center-chain',
        title: '원의 중심을 이은 선분',
        gen(r, level) {
          const n = r.int(3, level === 1 ? 4 : 6);
          const R = r.int(2, 12);
          const u = Math.min(28, 240 / (n + 1));
          const s = new Svg((n + 1) * u + 40, 2 * u + 30);
          for (let i = 0; i < n; i++) {
            s.circle(20 + u + i * u, u + 15, u);
            s.dot(20 + u + i * u, u + 15, { r: 2.5 });
          }
          const full = level >= 2;
          if (full) s.line(20, u + 15, 20 + (n + 1) * u, u + 15, { cls: 'acc', width: 2 });
          else s.line(20 + u, u + 15, 20 + n * u, u + 15, { cls: 'acc', width: 2 });
          s.text(full ? 14 : 20 + u, u + 30, 'ㄱ', { size: 12 });
          s.text(full ? 26 + (n + 1) * u : 20 + n * u, u + 30, 'ㄴ', { size: 12 });
          const ans = full ? R * (n + 1) : R * (n - 1);
          if (level === 3)
            return {
              q: `크기가 같은 원 $${n}$개를 원의 중심이 다른 원 위에 오도록 겹쳐 그렸습니다. 선분 ㄱㄴ의 길이가 $${ans}$ cm일 때 원의 반지름은 몇 cm인가요?`,
              fig: s.toString(),
              answer: { type: 'num', value: R, unit: 'cm' },
              steps: [`선분 ㄱㄴ은 반지름 $${n + 1}$개의 길이와 같아요.`, `반지름: $${ans}\\div${n + 1}=${R}$ (cm)`],
            };
          return {
            q: `반지름이 $${R}$ cm인 원 $${n}$개를 원의 중심이 다른 원 위에 오도록 겹쳐 그렸습니다. 선분 ㄱㄴ의 길이는 몇 cm인가요?`,
            fig: s.toString(),
            answer: { type: 'num', value: ans, unit: 'cm' },
            steps: full ? [`선분 ㄱㄴ은 반지름 $${n + 1}$개의 길이와 같아요.`, `$${R}\\times${n + 1}=${ans}$ (cm)`] : [`이웃한 두 중심 사이는 반지름 하나, 중심 사이 간격은 $${n - 1}$개`, `$${R}\\times${n - 1}=${ans}$ (cm)`],
          };
        },
      },
      {
        id: 'center-triangle',
        title: '세 원의 중심을 이은 삼각형',
        gen(r, level) {
          let a = r.int(2, 9),
            b = a,
            cc = a;
          if (level >= 2) {
            [a, b, cc] = r.sample([2, 3, 4, 5, 6, 7, 8, 9], 3);
          }
          const per = 2 * (a + b + cc);
          const fig = threeCircles(a, b, cc);
          if (level === 1)
            return {
              q: `반지름이 $${a}$ cm인 원 $3$개를 서로 맞닿게 그리고, 세 원의 중심을 이어 삼각형 ㄱㄴㄷ을 만들었습니다. 삼각형의 세 변의 길이의 합은 몇 cm인가요?`,
              fig,
              answer: { type: 'num', value: per, unit: 'cm' },
              steps: [`한 변은 반지름 $2$개: $${a}\\times2=${2 * a}$ (cm)`, `세 변의 합: $${2 * a}\\times3=${per}$ (cm)`],
            };
          if (level === 2)
            return {
              q: `반지름이 각각 $${a}$ cm, $${b}$ cm, $${cc}$ cm인 원 ㄱ, ㄴ, ㄷ을 서로 맞닿게 그렸습니다. 세 원의 중심을 이은 삼각형 ㄱㄴㄷ의 세 변의 길이의 합은 몇 cm인가요?`,
              fig,
              answer: { type: 'num', value: per, unit: 'cm' },
              steps: [`변 ㄱㄴ $=${a}+${b}=${a + b}$, 변 ㄴㄷ $=${b}+${cc}=${b + cc}$, 변 ㄷㄱ $=${cc}+${a}=${cc + a}$`, `합: $${a + b}+${b + cc}+${cc + a}=${per}$ (cm)`],
            };
          return {
            q: `원 ㄱ, ㄴ, ㄷ을 서로 맞닿게 그렸습니다. 원 ㄱ의 반지름은 $${a}$ cm, 원 ㄴ의 반지름은 $${b}$ cm이고, 세 원의 중심을 이은 삼각형의 세 변의 길이의 합은 $${per}$ cm입니다. 원 ㄷ의 반지름은 몇 cm인가요?`,
            fig,
            answer: { type: 'num', value: cc, unit: 'cm' },
            steps: [`세 변의 합은 세 반지름의 합의 $2$배예요: (반지름의 합) $=${per}\\div2=${per / 2}$`, `원 ㄷ의 반지름: $${per / 2}-${a}-${b}=${cc}$ (cm)`],
            hint: '삼각형의 각 변은 두 원의 반지름을 더한 길이예요.',
          };
        },
      },
    ],
  },

  // ═════════════ e3b-4 분수 ═════════════
  'e3b-4': {
    concepts: [
      {
        title: '분수로 나타내기',
        body: '$12$를 $3$씩 묶으면 $4$묶음이에요. $9$는 그중 $3$묶음이므로 $12$의 $\\frac{3}{4}$이에요.\n- 전체를 몇 묶음으로 나누었는지가 분모, 그중 몇 묶음인지가 분자예요.\n- 1학기에 배운 "전체를 똑같이 나누기"를 물건의 묶음에 쓴 거예요.',
      },
      {
        title: '분수만큼은 얼마인지 알기',
        body: '$12$의 $\\frac{1}{4}$은 $12$를 똑같이 $4$묶음으로 나눈 것 중 $1$묶음 → $3$.\n$12$의 $\\frac{3}{4}$은 $3$묶음 → $9$.',
        example: { q: '$20$의 $\\frac{2}{5}$', a: '$20\\div5=4$, $4\\times2=8$' },
      },
      {
        title: '진분수, 가분수, 대분수',
        body: '- **진분수**: 분자가 분모보다 작은 분수 ($\\frac{2}{5}$)\n- **가분수**: 분자가 분모와 같거나 큰 분수 ($\\frac{5}{5}$, $\\frac{7}{5}$)\n- **대분수**: 자연수와 진분수로 이루어진 분수 ($1\\frac{2}{5}$, "1과 5분의 2")',
      },
      {
        title: '대분수와 가분수 바꾸기',
        body: '$1\\frac{2}{5}$ 에서 $1=\\frac{5}{5}$ 이므로 $\\frac{5}{5}+\\frac{2}{5}=\\frac{7}{5}$.\n반대로 $\\frac{13}{4}$ 은 $13\\div4=3\\cdots1$ 이므로 $3\\frac{1}{4}$.',
      },
      {
        title: '분모가 같은 분수의 크기 비교',
        body: '- 가분수끼리: 분자가 클수록 커요.\n- 대분수끼리: 자연수 부분이 클수록 크고, 같으면 분자를 비교해요.\n- 가분수와 대분수: 한 가지로 바꾸어 비교해요.',
      },
    ],
    skills: [
      {
        id: 'part-of-set',
        title: '분수만큼은 얼마',
        gen(r, level) {
          const n = r.int(2, 9);
          const g = r.int(2, level === 1 ? 6 : 9);
          const tot = n * g;
          const k = level === 1 ? 1 : r.int(2, n - 1 >= 2 ? n - 1 : 2);
          const kk = Math.min(k, n - 1) || 1;
          if (level === 3) {
            const name = pickName(r);
            const item = r.pick(['귤', '구슬', '사탕', '딱지']);
            const n3 = r.int(3, 9),
              g3 = r.int(3, 8),
              k3 = r.int(2, n3 - 1);
            const T = n3 * g3;
            return {
              q: `${name}는 ${item} $${T}$개 중에서 $${fr(k3, n3)}$을 동생에게 주었습니다. 남은 ${J(item, '은/는')} 몇 개인가요?`,
              answer: { type: 'num', value: T - g3 * k3, unit: '개' },
              steps: [`$${T}$의 $${fr(1, n3)}$: $${T}\\div${n3}=${g3}$`, `$${T}$의 $${fr(k3, n3)}$: $${g3}\\times${k3}=${g3 * k3}$(개)`, `남은 ${item}: $${T}-${g3 * k3}=${T - g3 * k3}$(개)`],
            };
          }
          return {
            q: `$${tot}$의 $${fr(kk, n)}$은 얼마인가요?`,
            answer: { type: 'num', value: g * kk },
            steps: [`$${tot}$을 똑같이 $${n}$묶음으로 나누면 한 묶음은 $${tot}\\div${n}=${g}$`, ...(kk > 1 ? [`$${kk}$묶음은 $${g}\\times${kk}=${g * kk}$`] : [`답: $${g}$`])],
          };
        },
      },
      {
        id: 'group-frac',
        title: '묶음을 분수로 나타내기',
        gen(r, level) {
          const g = r.int(2, level === 1 ? 4 : 8);
          const n = r.int(3, level === 1 ? 6 : 9);
          const k = r.int(1, n - 1);
          const tot = g * n,
            part = g * k;
          const correct = `$${fr(k, n)}$`;
          const q =
            level === 3
              ? `구슬 $${tot}$개를 $${g}$개씩 묶었습니다. 그중 $${part}$개를 친구에게 주었다면 남은 구슬은 전체의 몇 분의 몇인가요? (묶음으로 생각하세요.)`
              : `$${tot}$을 $${g}$씩 묶으면 $${part}$는 $${tot}$의 몇 분의 몇인가요?`;
          const ans = level === 3 ? `$${fr(n - k, n)}$` : correct;
          const ansV = level === 3 ? (n - k) / n : k / n;
          // 오답 후보 (정답과 크기가 같은 분수 — 예: 12/16 = 3/4 — 는 정답이 둘이 되므로 뺀다)
          const P = (a: number, b: number) => ({ t: `$${fr(a, b)}$`, v: a / b });
          const cand =
            level === 3
              ? [P(k, n), P(n - k, g), P(n - k, n + 1), P(n, n - k)]
              : [P(n - k, n), P(k, g), P(g, n), P(k, n + 1)];
          for (let i = 0; i < 8; i++) cand.push(P(((k + i) % (n - 1)) + 1, n + 2));
          const wr = cand.filter((x) => Math.abs(x.v - ansV) > 1e-9).map((x) => x.t);
          return {
            q,
            answer: makeChoices(r, ans, wr.slice(0, 4), 4, (i) => wr[4 + i] ?? `$${fr(i + 1, n + 3)}$`),
            steps:
              level === 3
                ? [`$${tot}\\div${g}=${n}$묶음 중 준 것은 $${part}\\div${g}=${k}$묶음`, `남은 것은 $${n - k}$묶음 → $${fr(n - k, n)}$`]
                : [`$${tot}$을 $${g}$씩 묶으면 $${n}$묶음`, `$${part}$는 $${k}$묶음 → $${fr(k, n)}$`],
          };
        },
      },
      {
        id: 'mixed-improper',
        title: '대분수와 가분수',
        gen(r, level) {
          const d = r.int(3, 9);
          const w = r.int(1, level === 1 ? 3 : 7);
          const n = r.int(1, d - 1);
          const imp = w * d + n;
          if (level === 1) {
            return {
              q: `$${w}${fr(n, d)}$을 가분수로 나타낸 것은?`,
              answer: makeChoices(r, `$${fr(imp, d)}$`, [`$${fr(w + n, d)}$`, `$${fr(w * n + d, d)}$`, `$${fr(imp, w)}$`, `$${fr(imp + 1, d)}$`, `$${fr(w * d, d)}$`], 4),
              steps: [`$${w}=${fr(w * d, d)}$`, `$${fr(w * d, d)}+${fr(n, d)}=${fr(imp, d)}$`],
            };
          }
          if (level === 2)
            return {
              q: `$${fr(imp, d)}$을 대분수로 나타낸 것은?`,
              answer: makeChoices(r, `$${mx(imp, d)}$`, [`$${w + 1}${fr(n, d)}$`, `$${w}${fr(d - n, d)}$`, `$${n}${fr(w, d)}$`, `$${w}${fr(n, imp)}$`].filter((x) => x !== `$${mx(imp, d)}$`), 4),
              steps: [`$${imp}\\div${d}=${w}\\cdots${n}$`, `자연수 부분 $${w}$, 분자 $${n}$ → $${mx(imp, d)}$`],
            };
          return {
            q: `□ 안에 알맞은 수를 구하세요. $$\\frac{\\square}{${d}}=${w}${fr(n, d)}$$`,
            answer: { type: 'num', value: imp },
            steps: [`$${w}${fr(n, d)}$에서 $${w}$은 $${fr(1, d)}$이 $${w * d}$개`, `$${w * d}+${n}=${imp}$ 이므로 $\\square=${imp}$`],
          };
        },
      },
      {
        id: 'frac-kind',
        title: '진분수·가분수·대분수 분류',
        gen(r, level) {
          if (level === 3) {
            const d = r.int(4, 12);
            if (r.chance(0.5))
              return {
                q: `분모가 $${d}$인 진분수는 모두 몇 개인가요?`,
                answer: { type: 'num', value: d - 1, unit: '개' },
                steps: [`진분수는 분자가 분모보다 작아요.`, `분자가 $1$부터 $${d - 1}$까지 → $${d - 1}$개`],
              };
            const w = r.int(2, 9);
            return {
              q: `$${w}\\frac{\\square}{${d}}$이 대분수가 되도록 □ 안에 들어갈 수 있는 자연수는 모두 몇 개인가요?`,
              answer: { type: 'num', value: d - 1, unit: '개' },
              steps: [`대분수의 분수 부분은 진분수여야 해요.`, `□는 $1$부터 $${d - 1}$까지 → $${d - 1}$개`],
            };
          }
          const items: { t: string; k: string }[] = [];
          const seen = new Set<string>();
          for (let t = 0; items.length < 6 && t < 200; t++) {
            const d = r.int(2, 9);
            const typ = r.int(0, 2);
            let s: string;
            if (typ === 0) s = fr(r.int(1, d - 1), d);
            else if (typ === 1) s = fr(r.int(d, 3 * d), d);
            else s = `${r.int(1, 5)}${fr(r.int(1, d - 1), d)}`;
            if (seen.has(s)) continue;
            seen.add(s);
            items.push({ t: s, k: ['진분수', '가분수', '대분수'][typ] });
          }
          // 보기 안에 실제로 있는 종류에서 고름 (개수가 0이 되지 않게)
          const kind = r.pick((['진분수', '가분수', '대분수'] as const).filter((k) => items.some((x) => x.k === k)));
          const cnt = items.filter((x) => x.k === kind).length;
          if (level === 1) {
            const pick = items.find((x) => x.k === kind)!;
            const others = items.filter((x) => x.k !== kind).map((x) => `$${x.t}$`);
            if (pick && others.length >= 2)
              return {
                q: `다음 중 **${kind}**는 어느 것인가요?`,
                answer: makeChoices(r, `$${pick.t}$`, others, 4),
                steps: [kind === '진분수' ? '분자가 분모보다 작은 분수를 찾아요.' : kind === '가분수' ? '분자가 분모와 같거나 큰 분수를 찾아요.' : '자연수와 진분수로 이루어진 분수를 찾아요.', `답: $${pick.t}$`],
              };
          }
          return {
            q: `다음 분수 중 ${kind}는 모두 몇 개인가요? $$${items.map((x) => x.t).join(',\\quad ')}$$`,
            answer: { type: 'num', value: cnt, unit: '개' },
            steps: [`${kind}: ${cnt ? items.filter((x) => x.k === kind).map((x) => `$${x.t}$`).join(', ') : '없음'}`, `모두 $${cnt}$개`],
          };
        },
      },
      {
        id: 'frac-compare',
        title: '분수의 크기 비교',
        gen(r, level) {
          const d = r.int(3, 9);
          if (level === 3) {
            const w1 = r.int(1, 4),
              n1 = r.int(1, d - 1);
            const w2 = w1 + r.int(1, 2),
              n2 = r.int(1, d - 1);
            const lo = w1 * d + n1,
              hi = w2 * d + n2;
            return {
              q: `□ 안에 들어갈 수 있는 자연수는 모두 몇 개인가요? $$${w1}${fr(n1, d)}<\\frac{\\square}{${d}}<${w2}${fr(n2, d)}$$`,
              answer: { type: 'num', value: hi - lo - 1, unit: '개' },
              steps: [`대분수를 가분수로: $${w1}${fr(n1, d)}=${fr(lo, d)}$, $${w2}${fr(n2, d)}=${fr(hi, d)}$`, `□는 $${lo}$보다 크고 $${hi}$보다 작은 수: $${lo + 1}$부터 $${hi - 1}$까지 → $${hi - lo - 1}$개`],
            };
          }
          const vals = r.sample(Array.from({ length: 4 * d }, (_, i) => i + d + 1).filter((v) => v % d !== 0), 4);
          const big = r.chance(0.5);
          const items = vals.map((v, i) => ({ t: level === 1 || i % 2 === 0 ? `$${fr(v, d)}$` : `$${mx(v, d)}$`, v }));
          const sorted = items.slice().sort((x, y) => (big ? y.v - x.v : x.v - y.v));
          return {
            q: `가장 ${big ? '큰' : '작은'} 분수는 어느 것인가요?`,
            answer: makeChoices(r, sorted[0].t, sorted.slice(1).map((x) => x.t), 4),
            steps: [`모두 가분수로 바꾸면 ${items.map((x) => `$${fr(x.v, d)}$`).join(', ')}`, `분자가 가장 ${big ? '큰' : '작은'} 것: ${sorted[0].t}`],
          };
        },
      },
    ],
  },

  // ═════════════ e3b-5 들이와 무게 ═════════════
  'e3b-5': {
    concepts: [
      {
        title: '들이 비교하기',
        body: '그릇에 물을 가득 채워 다른 그릇에 옮기거나, 같은 컵으로 몇 번 들어가는지 세어 들이를 비교해요. 컵 수가 많을수록 들이가 많아요.',
      },
      {
        title: '들이의 단위 L와 mL',
        body: '들이의 단위에는 리터(L)와 밀리리터(mL)가 있어요.\n$$1\\text{ L}=1000\\text{ mL}$$\n- $2$ L $300$ mL $=2300$ mL, $2$ L $30$ mL $=2030$ mL',
      },
      {
        title: '무게의 단위 kg, g, t',
        body: '$$1\\text{ kg}=1000\\text{ g},\\qquad 1\\text{ t}=1000\\text{ kg}$$\n- 가벼운 물건은 g, 사람·가방은 kg, 트럭·코끼리처럼 아주 무거운 것은 t(톤)으로 나타내요.',
      },
      {
        title: '들이와 무게의 덧셈과 뺄셈',
        body: '같은 단위끼리 계산해요. mL(g)끼리의 합이 $1000$이 넘으면 $1$ L($1$ kg)로 받아올림하고, 뺄 수 없으면 $1$ L$=1000$ mL로 받아내림해요.\n- 길이(cm·mm, km·m)의 계산과 같은 방법이에요.',
        example: { q: '$3$ kg $600$ g $+$ $1$ kg $700$ g', a: '$600+700=1300$ g $=1$ kg $300$ g → $5$ kg $300$ g' },
      },
    ],
    skills: [
      {
        id: 'convert',
        title: '단위 바꾸기',
        gen(r, level) {
          const sys = r.pick([
            { B: 'L', S: 'mL' },
            { B: 'kg', S: 'g' },
          ]);
          if (level === 3) {
            const k = r.int(2, 8),
              x = r.int(1, 9),
              y = r.int(1, 9);
            const ys = y === x ? (y % 9) + 1 : y;
            const opts = [
              { t: `$${k}$ ${sys.B} $${x}${ys}0$ ${sys.S}`, v: k * 1000 + x * 100 + ys * 10 },
              { t: `$${c(k * 1000 + ys * 100 + x * 10)}$ ${sys.S}`, v: k * 1000 + ys * 100 + x * 10 },
              { t: `$${k}$ ${sys.B} $${x}${ys}$ ${sys.S}`, v: k * 1000 + x * 10 + ys },
              { t: `$${c(k * 1000 + ys * 10 + x)}$ ${sys.S}`, v: k * 1000 + ys * 10 + x },
            ];
            const big = r.chance(0.5);
            const sorted = opts.slice().sort((p, q) => (big ? q.v - p.v : p.v - q.v));
            return {
              q: `가장 ${big ? (sys.B === 'L' ? '많은 들이' : '무거운 무게') : sys.B === 'L' ? '적은 들이' : '가벼운 무게'}는 어느 것인가요?`,
              answer: makeChoices(r, sorted[0].t, sorted.slice(1).map((o) => o.t), 4),
              steps: [...opts.map((o) => `${o.t} $=${c(o.v)}$ ${sys.S}`), `답: ${sorted[0].t}`],
              hint: `모두 ${sys.S} 단위로 바꾸어 비교해요.`,
            };
          }
          if (level === 2 && r.chance(0.4)) {
            const t = r.int(1, 9),
              kg = r.int(0, 9) * 100;
            return {
              q: `□ 안에 알맞은 수를 구하세요. $$${t}\\text{ t }${kg ? `${kg}\\text{ kg}` : ''}=\\square\\text{ kg}$$`,
              answer: { type: 'num', value: t * 1000 + kg, unit: 'kg' },
              steps: [`$1$ t $=1000$ kg`, `$${t * 1000}+${kg}=${c(t * 1000 + kg)}$ (kg)`],
            };
          }
          const a = r.int(1, 9);
          const b = level === 1 ? r.int(1, 9) * 100 : r.pick([r.int(10, 99), r.int(101, 999)]);
          if (r.chance(0.5))
            return {
              q: `□ 안에 알맞은 수를 구하세요. $$${a}\\text{ ${sys.B} }${b}\\text{ ${sys.S}}=\\square\\text{ ${sys.S}}$$`,
              answer: { type: 'num', value: a * 1000 + b, unit: sys.S },
              steps: [`$1$ ${sys.B} $=1000$ ${sys.S}`, `$${a * 1000}+${b}=${c(a * 1000 + b)}$ (${sys.S})`],
            };
          return {
            q: `$${c(a * 1000 + b)}$ ${sys.S}는 몇 ${sys.B} 몇 ${sys.S}인가요?`,
            answer: { type: 'fields', fields: [{ label: sys.B, value: a }, { label: sys.S, value: b }] },
            steps: [`$1000$ ${sys.S} $=1$ ${sys.B}`, `$${c(a * 1000 + b)}$ ${sys.S} $=${a}$ ${sys.B} $${b}$ ${sys.S}`],
          };
        },
      },
      {
        id: 'cap-calc',
        title: '들이의 덧셈과 뺄셈',
        gen(r, level) {
          return bigSmallCalc(r, level, 'L', 'mL');
        },
      },
      {
        id: 'wt-calc',
        title: '무게의 덧셈과 뺄셈',
        gen(r, level) {
          return bigSmallCalc(r, level, 'kg', 'g');
        },
      },
      {
        id: 'unit-estimate',
        title: '알맞은 단위 고르기',
        gen(r) {
          const bank = [
            { q: '우유 한 팩의 들이는 약 200', a: 'mL', g: 'cap' },
            { q: '양동이의 들이는 약 8', a: 'L', g: 'cap' },
            { q: '물병 하나의 들이는 약 500', a: 'mL', g: 'cap' },
            { q: '욕조의 들이는 약 200', a: 'L', g: 'cap' },
            { q: '숟가락 하나의 들이는 약 10', a: 'mL', g: 'cap' },
            { q: '주전자의 들이는 약 2', a: 'L', g: 'cap' },
            { q: '사과 한 개의 무게는 약 300', a: 'g', g: 'wt' },
            { q: '3학년 학생의 몸무게는 약 30', a: 'kg', g: 'wt' },
            { q: '트럭 한 대의 무게는 약 5', a: 't', g: 'wt' },
            { q: '연필 한 자루의 무게는 약 6', a: 'g', g: 'wt' },
            { q: '쌀 한 포대의 무게는 약 20', a: 'kg', g: 'wt' },
            { q: '코끼리 한 마리의 무게는 약 6', a: 't', g: 'wt' },
            { q: '책가방의 무게는 약 2', a: 'kg', g: 'wt' },
          ];
          const it = r.pick(bank);
          const pool = it.g === 'cap' ? ['mL', 'L', 'g', 'kg'] : ['g', 'kg', 't', 'mL'];
          return {
            q: `□ 안에 알맞은 단위를 고르세요.\n${it.q} □입니다.`,
            answer: makeChoices(r, it.a, pool.filter((p) => p !== it.a), 4),
            steps: [`실제 크기를 떠올리면 ${it.q} ${it.a}${josa(it.a, '이/가')} 알맞아요.`],
          };
        },
      },
      {
        id: 'word',
        title: '들이와 무게 문장제',
        gen(r, level) {
          const name = pickName(r);
          if (level === 1) {
            const a = r.int(1, 4) * 1000 + r.int(1, 9) * 100,
              b = r.int(1, 3) * 1000 + r.int(1, 9) * 100;
            const s = a + b;
            return {
              q: `물통에 물이 $${Math.floor(a / 1000)}$ L $${a % 1000}$ mL 들어 있습니다. 여기에 물 $${Math.floor(b / 1000)}$ L $${b % 1000}$ mL를 더 부었다면 물통에 들어 있는 물은 몇 L 몇 mL인가요?`,
              answer: { type: 'fields', fields: [{ label: 'L', value: Math.floor(s / 1000) }, { label: 'mL', value: s % 1000 }] },
              steps: [`mL끼리: $${a % 1000}+${b % 1000}=${(a % 1000) + (b % 1000)}$${(a % 1000) + (b % 1000) >= 1000 ? ' → $1$ L 받아올림' : ''}`, `답: $${Math.floor(s / 1000)}$ L $${s % 1000}$ mL`],
            };
          }
          if (level === 2) {
            const fruit = r.int(2, 6) * 1000 + r.int(1, 99) * 10,
              basket = r.int(20, 95) * 10;
            const tot = fruit + basket;
            return {
              q: `사과를 담은 바구니의 무게는 $${Math.floor(tot / 1000)}$ kg $${tot % 1000}$ g이고, 빈 바구니의 무게는 $${basket}$ g입니다. 사과만의 무게는 몇 kg 몇 g인가요?`,
              answer: { type: 'fields', fields: [{ label: 'kg', value: Math.floor(fruit / 1000) }, { label: 'g', value: fruit % 1000 }] },
              steps: [`사과의 무게 = (바구니째 무게) $-$ (빈 바구니 무게)`, `$${c(tot)}$ g $-$ $${basket}$ g $=${c(fruit)}$ g $=${Math.floor(fruit / 1000)}$ kg $${fruit % 1000}$ g`],
            };
          }
          const start = r.int(2, 4) * 1000 + r.int(1, 9) * 100;
          const used = r.int(3, 9) * 100 + r.int(1, 9) * 10;
          const add = r.int(1, 2) * 1000 + r.int(1, 9) * 100;
          const fin = start - used + add;
          return {
            q: `${name}네 어항에 물이 $${Math.floor(start / 1000)}$ L $${start % 1000}$ mL 있었습니다. 물을 $${used}$ mL 덜어 낸 뒤, 새 물 $${Math.floor(add / 1000)}$ L $${add % 1000}$ mL를 부었습니다. 지금 어항에 있는 물은 몇 L 몇 mL인가요?`,
            answer: { type: 'fields', fields: [{ label: 'L', value: Math.floor(fin / 1000) }, { label: 'mL', value: fin % 1000 }] },
            steps: [`덜어 낸 뒤: $${c(start)}-${used}=${c(start - used)}$ (mL)`, `부은 뒤: $${c(start - used)}+${c(add)}=${c(fin)}$ (mL)`, `$=${Math.floor(fin / 1000)}$ L $${fin % 1000}$ mL`],
          };
        },
      },
    ],
  },

  // ═════════════ e3b-6 그림그래프 ═════════════
  'e3b-6': {
    concepts: [
      {
        title: '그림그래프',
        body: '조사한 수를 **그림으로** 나타낸 그래프를 그림그래프라고 해요. 큰 그림과 작은 그림이 각각 얼마를 나타내는지 먼저 확인해요.\n- 2학년 때 배운 ○ 그래프보다 큰 수를 간단히 나타낼 수 있어요.',
      },
      {
        title: '그림그래프 읽기',
        body: '큰 그림 수 $\\times$ (큰 그림의 단위) $+$ 작은 그림 수 $\\times$ (작은 그림의 단위)\n- 큰 그림이 $10$상자, 작은 그림이 $1$상자일 때 큰 그림 $3$개, 작은 그림 $4$개 → $34$상자',
      },
      {
        title: '표를 그림그래프로 나타내기',
        body: '① 그림을 몇 가지로 나타낼지 정해요. ② 단위(예: $10$, $1$)를 정해요. ③ 조사한 수만큼 그림을 그려요. ④ 제목을 붙여요.\n- $230$을 $100$, $10$ 단위로 그리면 큰 그림 $2$개, 작은 그림 $3$개.',
      },
      {
        title: '그림그래프 해석하기',
        body: '그림의 크기와 수로 가장 많은 것, 가장 적은 것을 한눈에 알 수 있어요. 합계, 차이를 구해 여러 가지 사실을 알아낼 수 있어요.',
      },
    ],
    skills: [
      {
        id: 'read',
        title: '그림그래프 읽기',
        gen(r, level) {
          const { th, units, vals, name } = graphData(r, level);
          const i = r.int(0, 3);
          return {
            q: `${th.head}별 ${J(th.thing, '을/를')} 조사하여 나타낸 그림그래프입니다. ${name(i)}의 ${J(th.thing, '은/는')} 몇 ${th.unit}인가요?`,
            fig: picGraph(th.labels, vals, units, { unitName: th.unit, head: th.head }),
            answer: { type: 'num', value: vals[i], unit: th.unit },
            steps: [`${name(i)}: ${iconText(vals[i], units, th)}`, `$${c(vals[i])}$${th.unit}`],
          };
        },
      },
      {
        id: 'most-least',
        title: '가장 많은 것·적은 것',
        gen(r, level) {
          const { th, units, vals, name } = graphData(r, level);
          const most = r.chance(0.5);
          const target = most ? Math.max(...vals) : Math.min(...vals);
          const idx = vals.indexOf(target);
          return {
            q: `${th.head}별 ${J(th.thing, '을/를')} 나타낸 그림그래프입니다. ${J(th.thing, '이/가')} 가장 ${most ? '많은' : '적은'} ${J(th.head, '은/는')} 어디인가요?`,
            fig: picGraph(th.labels, vals, units, { unitName: th.unit, head: th.head }),
            answer: makeChoices(r, name(idx), th.labels.map((_, i) => name(i)).filter((_, i) => i !== idx), 4),
            steps: [...th.labels.map((_, i) => `${name(i)}: $${c(vals[i])}$${th.unit}`), `가장 ${most ? '많은' : '적은'} 곳: ${name(idx)}`],
            hint: '큰 그림의 수를 먼저 비교해요.',
          };
        },
      },
      {
        id: 'sum-diff',
        title: '합계와 차',
        gen(r, level) {
          const { th, units, vals, name } = graphData(r, level);
          const fig = picGraph(th.labels, vals, units, { unitName: th.unit, head: th.head });
          if (level === 3) {
            const mi = vals.indexOf(Math.max(...vals)),
              li = vals.indexOf(Math.min(...vals));
            return {
              q: `${th.head}별 ${J(th.thing, '을/를')} 나타낸 그림그래프입니다. 가장 많은 곳은 가장 적은 곳보다 몇 ${th.unit} 더 많은가요?`,
              fig,
              answer: { type: 'num', value: vals[mi] - vals[li], unit: th.unit },
              steps: [`가장 많은 곳: ${name(mi)} $${c(vals[mi])}$, 가장 적은 곳: ${name(li)} $${c(vals[li])}$`, `$${c(vals[mi])}-${c(vals[li])}=${c(vals[mi] - vals[li])}$(${th.unit})`],
            };
          }
          if (r.chance(0.5)) {
            const tot = vals.reduce((a, b) => a + b, 0);
            return {
              q: `${th.head}별 ${J(th.thing, '을/를')} 나타낸 그림그래프입니다. 네 ${th.head}의 ${J(th.thing, '은/는')} 모두 몇 ${th.unit}인가요?`,
              fig,
              answer: { type: 'num', value: tot, unit: th.unit },
              steps: [`${vals.map((v) => `$${c(v)}$`).join(' + ')}`, `$=${c(tot)}$(${th.unit})`],
            };
          }
          const [i, j] = r.sample([0, 1, 2, 3], 2);
          const [hi, lo] = vals[i] > vals[j] ? [i, j] : [j, i];
          return {
            q: `${th.head}별 ${J(th.thing, '을/를')} 나타낸 그림그래프입니다. ${J(name(hi), '은/는')} ${name(lo)}보다 몇 ${th.unit} 더 많은가요?`,
            fig,
            answer: { type: 'num', value: vals[hi] - vals[lo], unit: th.unit },
            steps: [`${name(hi)}: $${c(vals[hi])}$, ${name(lo)}: $${c(vals[lo])}$`, `$${c(vals[hi])}-${c(vals[lo])}=${c(vals[hi] - vals[lo])}$(${th.unit})`],
          };
        },
      },
      {
        id: 'to-graph',
        title: '그림그래프로 나타내기',
        gen(r, level) {
          const { th, units, vals, name } = graphData(r, level);
          const i = r.int(0, 3);
          const v = vals[i];
          const counts: number[] = [];
          let rem = v;
          units.forEach((u) => {
            const k = Math.floor(rem / u);
            counts.push(k);
            rem -= k * u;
          });
          const labels = units.length === 2 ? ['큰 그림', '작은 그림'] : ['큰 그림', '중간 그림', '작은 그림'];
          return {
            q: `표를 그림그래프로 나타내려고 합니다. 그림의 단위가 (${labels.map((l, j) => `${l}: ${units[j]}${th.unit}`).join(', ')})일 때, ${J(name(i), '은/는')} 각 그림을 몇 개씩 그려야 하나요? (그림 수가 가장 적게 되도록)`,
            table: [[th.head, ...th.labels.map((_, j) => name(j))], [`${th.thing}(${th.unit})`, ...vals.map((x) => `$${c(x)}$`)]],
            answer: { type: 'fields', fields: labels.map((l, j) => ({ label: l, value: counts[j], unit: '개' })) },
            steps: [`$${c(v)}=${units.map((u, j) => `${c(u)}\\times${counts[j]}`).join('+')}$`, labels.map((l, j) => `${l} $${counts[j]}$개`).join(', ')],
          };
        },
      },
      {
        id: 'missing',
        title: '지워진 자료 구하기',
        gen(r, level) {
          const { th, units, vals, name } = graphData(r, level);
          const i = r.int(0, 3);
          const tot = vals.reduce((a, b) => a + b, 0);
          const shown = vals.map((v, j) => (j === i ? 0 : v));
          const others = vals.filter((_, j) => j !== i);
          return {
            q: `${th.head}별 ${J(th.thing, '을/를')} 나타낸 그림그래프인데 ${name(i)}의 그림이 지워졌습니다. 네 ${th.head}의 ${J(th.thing, '이/가')} 모두 $${c(tot)}$${th.unit}일 때, ${name(i)}의 ${J(th.thing, '은/는')} 몇 ${th.unit}인가요?`,
            fig: picGraph(th.labels, shown, units, { unitName: th.unit, head: th.head }),
            answer: { type: 'num', value: vals[i], unit: th.unit },
            steps: [`나머지 세 곳의 합: ${others.map((v) => `$${c(v)}$`).join(' + ')} $=${c(tot - vals[i])}$`, `$${c(tot)}-${c(tot - vals[i])}=${c(vals[i])}$(${th.unit})`],
          };
        },
      },
    ],
  },
};

function* perms(arr: number[], k: number): Generator<number[]> {
  if (k === 0) {
    yield [];
    return;
  }
  for (let i = 0; i < arr.length; i++) {
    const rest = arr.slice(0, i).concat(arr.slice(i + 1));
    for (const p of perms(rest, k - 1)) yield [arr[i], ...p];
  }
}

const nm2 = (name: string) => `${name}는`;

function bigSmallCalc(r: Rng, level: Level, B: string, S: string) {
  const add = r.chance(0.5);
  let a = 0,
    b = 0;
  for (let t = 0; t < 300; t++) {
    a = r.int(2, 9) * 1000 + (level === 1 ? r.int(1, 9) * 100 : r.int(1, 99) * 10);
    b = r.int(1, level === 1 ? 4 : 7) * 1000 + (level === 1 ? r.int(1, 9) * 100 : r.int(1, 99) * 10);
    if (!add && a <= b) continue;
    const carry = add ? (a % 1000) + (b % 1000) >= 1000 : a % 1000 < b % 1000;
    if (level === 1 ? !carry : carry) break;
  }
  if (level === 3) {
    // 세 수의 계산
    const cc = r.int(1, 2) * 1000 + r.int(1, 99) * 10;
    const res = add ? a + b - cc : a - b + cc;
    if (res > 0) {
      const f = (v: number) => `$${Math.floor(v / 1000)}$ ${B} $${v % 1000}$ ${S}`;
      return {
        q: `계산해 보세요.\n${f(a)} ${add ? '+' : '−'} ${f(b)} ${add ? '−' : '+'} ${f(cc)}`,
        answer: { type: 'fields' as const, fields: [{ label: B, value: Math.floor(res / 1000) }, { label: S, value: res % 1000 }] },
        steps: [`모두 ${S}로 바꾸면 $${c(a)}${add ? '+' : '-'}${c(b)}${add ? '-' : '+'}${c(cc)}$`, `앞에서부터: $${c(add ? a + b : a - b)}${add ? '-' : '+'}${c(cc)}=${c(res)}$ (${S})`, `$=${Math.floor(res / 1000)}$ ${B} $${res % 1000}$ ${S}`],
      };
    }
  }
  const res = add ? a + b : a - b;
  const f = (v: number) => `$${Math.floor(v / 1000)}$ ${B} $${v % 1000}$ ${S}`;
  const ay = a % 1000,
    by = b % 1000;
  return {
    q: `계산해 보세요.\n${f(a)} ${add ? '+' : '−'} ${f(b)}`,
    answer: { type: 'fields' as const, fields: [{ label: B, value: Math.floor(res / 1000) }, { label: S, value: res % 1000 }] },
    steps: add
      ? [`${S}끼리: $${ay}+${by}=${ay + by}$${ay + by >= 1000 ? ` → $1000$ ${S}$=1$ ${B} 받아올림` : ''}`, `${B}끼리: $${Math.floor(a / 1000)}+${Math.floor(b / 1000)}${ay + by >= 1000 ? '+1' : ''}=${Math.floor(res / 1000)}$`, `답: ${f(res)}`]
      : [
          ay < by ? `${S}끼리 뺄 수 없으므로 $1$ ${B}$=1000$ ${S} 받아내림: $${ay + 1000}-${by}=${ay + 1000 - by}$` : `${S}끼리: $${ay}-${by}=${ay - by}$`,
          `${B}끼리: $${Math.floor(a / 1000)}${ay < by ? '-1' : ''}-${Math.floor(b / 1000)}=${Math.floor(res / 1000)}$`,
          `답: ${f(res)}`,
        ],
  };
}

