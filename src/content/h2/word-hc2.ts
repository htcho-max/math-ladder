// 공통수학2 활용(문장제) 유형 — hc2.ts 의 각 단원 skills 뒤에 덧붙임
import type { Skill } from '../../core/types';
import { F } from '../../core/frac';
import { comma, termsTex } from '../../core/tex';
import { NAMES, circleTex, josa, lineTex, pt, texJosa } from './util';

const km = '\\text{ km}';
const T5: [number, number][] = [
  [3, 4],
  [4, 3],
  [-3, 4],
  [-4, 3],
  [3, -4],
  [4, -3],
  [-3, -4],
  [-4, -3],
  [0, 5],
  [0, -5],
];
const T13: [number, number][] = [
  [5, 12],
  [12, 5],
  [-5, 12],
  [-12, 5],
  [5, -12],
  [12, -5],
  [-5, -12],
  [-12, -5],
];
/** 직각삼각형 (밑변, 높이, 빗변) */
const TRI: [number, number, number][] = [
  [3, 4, 5],
  [4, 3, 5],
  [6, 8, 10],
  [8, 6, 10],
  [5, 12, 13],
  [12, 5, 13],
  [9, 12, 15],
  [12, 9, 15],
  [8, 15, 17],
  [15, 8, 17],
];
const won = (n: number) => comma(n);

export const HC2_WORD: Record<string, Skill[]> = {
  'hc2-1': [
    {
      id: 'coord-word',
      title: '좌표와 직선의 활용',
      gen(r, level) {
        if (level === 1) {
          const m = r.int(1, 4);
          let n = r.int(1, 4);
          if (n === m) n = m === 4 ? 1 : m + 1;
          const u = [r.nonzero(-3, 3), r.nonzero(-3, 3)];
          const P = [r.int(-5, 5), r.int(-5, 5)];
          const A = [P[0] - m * u[0], P[1] - m * u[1]];
          const B = [P[0] + n * u[0], P[1] + n * u[1]];
          const who = r.pick(NAMES);
          return {
            q: `좌표평면 위의 두 점 $A${pt(A[0], A[1])}$, $B${pt(B[0], B[1])}$ 에 각각 마을이 있습니다. ${who}네 마을은 두 마을을 잇는 곧은 도로 위에서 $A$ 와 $B$ 까지의 거리의 비가 $${m}:${n}$ 인 지점 $P$ 에 쉼터를 만들려고 합니다. 점 $P$ 의 좌표를 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'x', value: P[0] }, { label: 'y', value: P[1] }] },
            steps: [
              `$P$ 는 선분 $AB$ 를 $${m}:${n}$ ${texJosa(String(n), '으로', '로', true)} 내분하는 점`,
              `$x=\\frac{${m}\\times${B[0] < 0 ? `(${B[0]})` : B[0]}+${n}\\times${A[0] < 0 ? `(${A[0]})` : A[0]}}{${m}+${n}}=${P[0]}$, $y=\\frac{${m}\\times${B[1] < 0 ? `(${B[1]})` : B[1]}+${n}\\times${A[1] < 0 ? `(${A[1]})` : A[1]}}{${m}+${n}}=${P[1]}$`,
              `$P${pt(P[0], P[1])}$`,
            ],
            hint: '$m:n$ 내분점은 $\\left(\\frac{mx_2+nx_1}{m+n}, \\frac{my_2+ny_1}{m+n}\\right)$ 이에요.',
          };
        }
        if (level === 2) {
          const [a0, b0, c0] = r.pick([
            [3, 4, 5],
            [4, 3, 5],
            [5, 12, 13],
            [12, 5, 13],
            [8, 15, 17],
            [15, 8, 17],
          ] as [number, number, number][]);
          const a = a0,
            b = b0 * r.sign();
          const px = r.int(-6, 6),
            py = r.int(-6, 6);
          const d = r.int(1, 6);
          const c = r.sign() * d * c0 - a * px - b * py;
          const place = r.pick(['캠핑장', '마을', '학교', '전망대']);
          const L = lineTex(a, b, c);
          const top = a * px + b * py + c;
          return {
            q: `좌표평면 위의 점 $P${pt(px, py)}$ 에 ${place}${josa(place, '이', '가')} 있고, 직선 $${L}$ 을 따라 곧은 도로가 나 있습니다. ${place}에서 도로까지 가장 짧은 길을 새로 내려고 할 때, 그 길의 길이는 몇 km 인가요? (단, 좌표의 단위는 km)`,
            answer: { type: 'num', value: d, unit: 'km' },
            steps: [
              `가장 짧은 길은 점 $P$ 에서 직선에 내린 수선 → 점과 직선 사이의 거리`,
              `$\\frac{|${a}\\times${px < 0 ? `(${px})` : px}+${b < 0 ? `(${b})` : b}\\times${py < 0 ? `(${py})` : py}+${c < 0 ? `(${c})` : c}|}{\\sqrt{${a}^{2}+${b < 0 ? `(${b})` : b}^{2}}}=\\frac{${Math.abs(top)}}{${c0}}=${d}$`,
              `$${d}${km}$`,
            ],
          };
        }
        const set = r.chance(0.5) ? T5 : T13;
        const R = set === T5 ? 5 : 13;
        const k = set === T5 ? r.int(1, 2) : 1;
        let v1: [number, number], v2: [number, number];
        do {
          [v1, v2] = r.sample(set, 2);
        } while (v1[0] === v2[0]);
        const p = r.int(-5, 5);
        const A = [p + v1[0] * k, v1[1] * k],
          B = [p + v2[0] * k, v2[1] * k];
        const sA = A[0] ** 2 + A[1] ** 2,
          sB = B[0] ** 2 + B[1] ** 2;
        return {
          q: `$x$ 축을 따라 곧은 도로가 있고, 두 점 $A${pt(A[0], A[1])}$, $B${pt(B[0], B[1])}$ 에 각각 마을이 있습니다. 도로 위의 한 지점 $P(p, 0)$ 에 버스 정류장을 세워 두 마을까지의 거리가 같게 하려고 합니다. $p$ 의 값과 정류장에서 마을 $A$ 까지의 거리 $\\overline{PA}$ 를 구하세요. (단, 좌표의 단위는 km)`,
          answer: { type: 'fields', fields: [{ label: 'p', value: p }, { label: 'PA', value: R * k, unit: 'km' }] },
          steps: [
            `$\\overline{PA}^{2}=\\overline{PB}^{2}$: $(p${A[0] < 0 ? '+' : '-'}${Math.abs(A[0])})^{2}+${A[1] ** 2}=(p${B[0] < 0 ? '+' : '-'}${Math.abs(B[0])})^{2}+${B[1] ** 2}$`.replace(/\(p[+-]0\)/g, 'p'),
            `전개하면 $${termsTex([{ c: -2 * A[0], v: 'p' }, { c: sA, v: '' }])}=${termsTex([{ c: -2 * B[0], v: 'p' }, { c: sB, v: '' }])}$ → $${2 * (B[0] - A[0])}p=${sB - sA}$, $p=${p}$`,
            `$\\overline{PA}=\\sqrt{${(A[0] - p) ** 2}+${A[1] ** 2}}=${R * k}$ km`,
          ],
        };
      },
    },
  ],

  'hc2-2': [
    {
      id: 'circle-word',
      title: '원의 방정식의 활용',
      gen(r, level) {
        const a = r.int(-5, 5),
          b = r.int(-5, 5);
        if (level === 1) {
          const [d, h, R] = r.pick([
            [3, 4, 5],
            [4, 3, 5],
            [6, 8, 10],
            [8, 6, 10],
            [5, 12, 13],
            [12, 5, 13],
          ] as [number, number, number][]);
          const k = b + r.sign() * d;
          return {
            q: `어느 기지국의 전파가 닿는 범위는 좌표평면에서 원 $${circleTex(a, b, R * R)}$ 의 내부(경계 포함)입니다. 직선 $y=${k}$ ${texJosa(String(k), '을', '를')} 따라 난 도로에서 전파가 닿는 구간의 길이는 몇 km 인가요? (단, 좌표의 단위는 km)`,
            answer: { type: 'num', value: 2 * h, unit: 'km' },
            steps: [
              `중심 $${pt(a, b)}$, 반지름 $${R}$`,
              `중심에서 도로 $y=${k}$ 까지의 거리: $|${k}-${b < 0 ? `(${b})` : b}|=${d}$`,
              `현의 길이의 절반 $\\sqrt{${R}^{2}-${d}^{2}}=${h}$ → 구간의 길이 $${2 * h}${km}$`,
            ],
          };
        }
        if (level === 2) {
          const [d, h, R] = r.pick([
            [3, 4, 5],
            [4, 3, 5],
            [6, 8, 10],
            [8, 6, 10],
          ] as [number, number, number][]);
          const [la, lb] = r.pick([
            [3, 4],
            [4, 3],
            [3, -4],
            [4, -3],
          ] as [number, number][]);
          const c = r.sign() * 5 * d - la * a - lb * b;
          const C = a * a + b * b - R * R;
          const gen = termsTex([
            { c: 1, v: 'x^{2}' },
            { c: 1, v: 'y^{2}' },
            { c: -2 * a, v: 'x' },
            { c: -2 * b, v: 'y' },
            { c: C, v: '' },
          ]);
          return {
            q: `전파가 닿는 범위가 원 $${gen}=0$ 의 내부(경계 포함)인 기지국이 있습니다. 직선 $${lineTex(la, lb, c)}$ 을 따라 난 도로에서 전파가 닿는 구간의 길이는 몇 km 인가요? (단, 좌표의 단위는 km)`,
            answer: { type: 'num', value: 2 * h, unit: 'km' },
            steps: [
              `완전제곱식으로: $${circleTex(a, b, R * R)}$ → 중심 $${pt(a, b)}$, 반지름 $${R}$`,
              `중심과 직선 사이의 거리 $\\frac{|${la * a + lb * b + c}|}{5}=${d}$`,
              `구간의 길이 $2\\sqrt{${R * R}-${d * d}}=2\\times${h}=${2 * h}${km}$`,
            ],
          };
        }
        const R = r.int(1, 5);
        const D = R + r.int(1, 6);
        const [la, lb] = r.pick([
          [3, 4],
          [4, 3],
          [3, -4],
          [4, -3],
        ] as [number, number][]);
        const c = r.sign() * 5 * D - la * a - lb * b;
        return {
          q: `원 $${circleTex(a, b, R * R)}$ 모양의 호수가 있고, 직선 $${lineTex(la, lb, c)}$ 을 따라 곧은 도로가 나 있습니다. 호숫가(원 위)의 한 지점 $P$ 에서 도로까지의 거리의 최댓값과 최솟값을 구하세요. (단, 좌표의 단위는 km)`,
          answer: {
            type: 'fields',
            fields: [
              { label: '최댓값', value: D + R, unit: 'km' },
              { label: '최솟값', value: D - R, unit: 'km' },
            ],
          },
          steps: [
            `중심 $${pt(a, b)}$ 에서 직선까지의 거리 $\\frac{|${la * a + lb * b + c}|}{5}=${D}$, 반지름 $${R}$ → 원과 직선은 만나지 않음`,
            `최댓값 $${D}+${R}=${D + R}$, 최솟값 $${D}-${R}=${D - R}$`,
          ],
          hint: '원 위의 점과 직선 사이 거리는 (중심과 직선 사이 거리) $\\pm$ (반지름) 사이에 있어요.',
        };
      },
    },
  ],

  'hc2-3': [
    {
      id: 'shortest-path',
      title: '대칭이동과 최단 거리',
      gen(r, level) {
        if (level <= 2) {
          const [dx, dy, h] = r.pick(TRI);
          const a2 = r.int(1, dy - 1),
            b2 = dy - a2;
          const a1 = r.int(-4, 4),
            b1 = a1 + r.sign() * dx;
          const who = r.pick(NAMES);
          const q0 = `강이 $x$ 축을 따라 흐르고, 강의 같은 쪽에 있는 점 $A${pt(a1, a2)}$ 에 집이, 점 $B${pt(b1, b2)}$ 에 텃밭이 있습니다. ${who}${josa(who, '이는', '는')} 집에서 출발하여 강가의 한 지점 $P$ 에서 물을 길은 뒤 텃밭으로 가려고 합니다.`;
          const st = [`$B$ 를 $x$ 축에 대하여 대칭이동: $B'${pt(b1, -b2)}$, $\\overline{PB}=\\overline{PB'}$`, `$\\overline{AP}+\\overline{PB}=\\overline{AP}+\\overline{PB'}\\ge\\overline{AB'}=\\sqrt{${dx}^{2}+${dy}^{2}}=${h}$`];
          if (level === 1) {
            return {
              q: `${q0} 이동 거리 $\\overline{AP}+\\overline{PB}$ 의 최솟값을 구하세요.`,
              answer: { type: 'num', value: h },
              steps: [...st, `최솟값 $${h}$`],
              hint: '한 점을 $x$ 축에 대하여 대칭이동해 보세요.',
            };
          }
          const px = new F(a1).add(new F((b1 - a1) * a2, dy));
          return {
            q: `${q0} 이동 거리 $\\overline{AP}+\\overline{PB}$ 가 최소가 되도록 할 때, 그 최솟값과 점 $P$ 의 $x$ 좌표를 구하세요.`,
            answer: {
              type: 'fields',
              fields: [
                { label: '최솟값', value: h },
                { label: 'P의 x좌표', value: px.value, display: 'frac' },
              ],
            },
            steps: [...st, `$P$ 는 선분 $AB'$ 와 $x$ 축의 교점: $AB'$ 를 $${a2}:${b2}$ ${texJosa(String(b2), '으로', '로', true)} 내분하는 점이므로 $x=\\frac{${a2}\\times${b1 < 0 ? `(${b1})` : b1}+${b2}\\times${a1 < 0 ? `(${a1})` : a1}}{${dy}}=${px.tex()}$`],
          };
        }
        let dx: number, dy: number, h: number, a1: number, a2: number;
        for (;;) {
          [dx, dy, h] = r.pick(TRI);
          a1 = r.int(1, dx - 1);
          a2 = r.int(1, dy - 1);
          if (a1 * (dy - a2) > a2 * (dx - a1)) break;
        }
        const b1 = dx - a1,
          b2 = dy - a2;
        return {
          q: `좌표평면 위의 두 점 $A${pt(a1, a2)}$, $B${pt(b1, b2)}$ 에 대하여, 점 $A$ 에서 출발하여 $x$ 축 위의 점 $P$, $y$ 축 위의 점 $Q$ 를 차례로 거쳐 점 $B$ 까지 가는 경로가 있습니다. $\\overline{AP}+\\overline{PQ}+\\overline{QB}$ 의 최솟값을 구하세요.`,
          answer: { type: 'num', value: h },
          steps: [
            `$A$ 를 $x$ 축에 대하여 대칭: $A'${pt(a1, -a2)}$, $B$ 를 $y$ 축에 대하여 대칭: $B'${pt(-b1, b2)}$`,
            `$\\overline{AP}+\\overline{PQ}+\\overline{QB}=\\overline{A'P}+\\overline{PQ}+\\overline{QB'}\\ge\\overline{A'B'}$`,
            `$\\overline{A'B'}=\\sqrt{${dx}^{2}+${dy}^{2}}=${h}$`,
          ],
          hint: '두 축에 대하여 각각 한 번씩 대칭이동하면 꺾인 선이 한 선분으로 펴져요.',
        };
      },
    },
  ],

  'hc2-4': [
    {
      id: 'set-word',
      title: '집합의 활용',
      gen(r, level) {
        const [s1, s2, s3] = r.sample(['수학', '영어', '과학', '음악', '미술', '체육'], 3);
        if (level === 1) {
          const x = r.int(2, 10),
            a = x + r.int(3, 12),
            b = x + r.int(3, 12),
            none = r.int(1, 8);
          const N = a + b - x + none;
          const askOnly = r.chance(0.5);
          return {
            q: `학생 $${N}$ 명에게 조사했더니 ${s1}${josa(s1, '을', '를')} 좋아하는 학생이 $${a}$ 명, ${s2}${josa(s2, '을', '를')} 좋아하는 학생이 $${b}$ 명, 두 과목을 모두 좋아하는 학생이 $${x}$ 명이었습니다. ${askOnly ? '두 과목 중 한 과목만 좋아하는' : '두 과목 중 어느 것도 좋아하지 않는'} 학생은 몇 명인가요?`,
            answer: { type: 'num', value: askOnly ? a + b - 2 * x : none, unit: '명' },
            steps: askOnly
              ? [`${s1}만: $${a}-${x}=${a - x}$, ${s2}만: $${b}-${x}=${b - x}$`, `$${a - x}+${b - x}=${a + b - 2 * x}$ 명`]
              : [`$n(A\\cup B)=${a}+${b}-${x}=${a + b - x}$`, `$n((A\\cup B)^{C})=${N}-${a + b - x}=${none}$ 명`],
          };
        }
        if (level === 2) {
          const t = r.int(1, 4);
          const ab = r.int(1, 5),
            bc = r.int(1, 5),
            ca = r.int(1, 5);
          const ao = r.int(2, 10),
            bo = r.int(2, 10),
            co = r.int(2, 10);
          const nA = ao + ab + ca + t,
            nB = bo + ab + bc + t,
            nC = co + bc + ca + t;
          const U = ao + bo + co + ab + bc + ca + t;
          const [c1, c2, c3] = r.pick([
            ['코딩', '밴드', '축구'],
            ['독서', '토론', '봉사'],
            ['댄스', '요리', '사진'],
          ]);
          return {
            q: `어느 반 학생들이 방과후 수업 ${c1}, ${c2}, ${c3}${josa(c3, '을', '를')} 신청했습니다. ${c1}${josa(c1, '은', '는')} $${nA}$ 명, ${c2}${josa(c2, '은', '는')} $${nB}$ 명, ${c3}${josa(c3, '은', '는')} $${nC}$ 명이 신청했고, ${c1}${josa(c1, '과', '와')} ${c2}${josa(c2, '을', '를')} 모두 신청한 학생은 $${ab + t}$ 명, ${c2}${josa(c2, '과', '와')} ${c3}${josa(c3, '을', '를')} 모두 신청한 학생은 $${bc + t}$ 명, ${c3}${josa(c3, '과', '와')} ${c1}${josa(c1, '을', '를')} 모두 신청한 학생은 $${ca + t}$ 명, 세 수업을 모두 신청한 학생은 $${t}$ 명입니다. 적어도 한 수업을 신청한 학생은 몇 명인가요?`,
            answer: { type: 'num', value: U, unit: '명' },
            steps: [
              `$n(A\\cup B\\cup C)=n(A)+n(B)+n(C)-n(A\\cap B)-n(B\\cap C)-n(C\\cap A)+n(A\\cap B\\cap C)$`,
              `$=${nA}+${nB}+${nC}-${ab + t}-${bc + t}-${ca + t}+${t}=${U}$ 명`,
            ],
          };
        }
        const N = r.int(25, 40);
        const a = r.int(Math.ceil(N / 2), N - 3),
          b = r.int(N - a + 2, N - 2);
        void s3;
        return {
          q: `학생 $${N}$ 명 중 ${s1}${josa(s1, '을', '를')} 좋아하는 학생은 $${a}$ 명, ${s2}${josa(s2, '을', '를')} 좋아하는 학생은 $${b}$ 명입니다. 두 과목을 모두 좋아하는 학생 수의 최댓값과 최솟값을 구하세요.`,
          answer: {
            type: 'fields',
            fields: [
              { label: '최댓값', value: Math.min(a, b), unit: '명' },
              { label: '최솟값', value: a + b - N, unit: '명' },
            ],
          },
          steps: [
            `$n(A\\cap B)\\le n(A)$, $n(A\\cap B)\\le n(B)$ 이므로 최댓값은 $${Math.min(a, b)}$ (적은 쪽이 다른 쪽에 모두 포함될 때)`,
            `$n(A\\cup B)=${a}+${b}-n(A\\cap B)\\le${N}$ 이므로 $n(A\\cap B)\\ge${a + b - N}$`,
            `최댓값 $${Math.min(a, b)}$ 명, 최솟값 $${a + b - N}$ 명`,
          ],
        };
      },
    },
  ],

  'hc2-5': [
    {
      id: 'am-gm-word',
      title: '절대부등식의 활용',
      gen(r, level) {
        const who = r.pick(NAMES);
        if (level === 1) {
          const k = r.int(3, 15);
          const L = 4 * k;
          return {
            q: `${who}${josa(who, '이는', '는')} 길이가 $${L}\\text{ m}$ 인 철망을 모두 사용하여 직사각형 모양의 울타리를 만들려고 합니다. 울타리 안쪽의 넓이의 최댓값은 몇 $\\text{m}^{2}$ 인가요?`,
            answer: { type: 'num', value: k * k, unit: 'm²' },
            steps: [`가로 $x$, 세로 $y$ 라 하면 $2(x+y)=${L}$, $x+y=${2 * k}$`, `산술평균·기하평균: $x+y\\ge2\\sqrt{xy}$ → $${2 * k}\\ge2\\sqrt{xy}$, $xy\\le${k * k}$`, `등호는 $x=y=${k}$ 일 때, 최댓값 $${k * k}$`],
          };
        }
        const k = r.int(2, 12);
        if (level === 2) {
          const L = 4 * k;
          return {
            q: `한쪽 면이 곧은 담장인 땅에, 길이가 $${L}\\text{ m}$ 인 철망으로 담장을 한 변으로 하는 직사각형 모양의 닭장을 만들려고 합니다. (담장 쪽에는 철망을 치지 않습니다.) 닭장의 넓이의 최댓값은 몇 $\\text{m}^{2}$ 인가요?`,
            answer: { type: 'num', value: 2 * k * k, unit: 'm²' },
            steps: [
              `담장에 수직인 변 $x$, 평행한 변 $y$: $2x+y=${L}$`,
              `$2x+y\\ge2\\sqrt{2xy}$ → $${L}\\ge2\\sqrt{2xy}$, $xy\\le\\frac{${L * L}}{8}=${2 * k * k}$`,
              `등호는 $2x=y=${2 * k}$ 일 때, 최댓값 $${2 * k * k}$`,
            ],
          };
        }
        const S = 2 * k * k;
        return {
          q: `한쪽 면이 곧은 담장인 땅에 넓이가 $${S}\\text{ m}^{2}$ 인 직사각형 모양의 화단을 만들고, 담장 쪽을 뺀 나머지 세 변에 울타리를 치려고 합니다. 울타리의 길이가 최소일 때, 그 최솟값과 담장에 수직인 변의 길이를 구하세요.`,
          answer: {
            type: 'fields',
            fields: [
              { label: '최솟값', value: 4 * k, unit: 'm' },
              { label: '수직인 변', value: k, unit: 'm' },
            ],
          },
          steps: [
            `담장에 수직인 변 $x$, 평행한 변 $y$: $xy=${S}$, 울타리 길이 $2x+y$`,
            `$2x+y\\ge2\\sqrt{2xy}=2\\sqrt{${2 * S}}=${4 * k}$`,
            `등호는 $2x=y$ 일 때: $2x^{2}=${S}$, $x=${k}$ → 최솟값 $${4 * k}$ m`,
          ],
        };
      },
    },
  ],

  'hc2-6': [
    {
      id: 'function-word',
      title: '함수의 활용',
      gen(r, level) {
        if (level === 1) {
          const pct = r.pick([10, 20]);
          const c = r.pick([1000, 2000, 3000, 5000]);
          const x = r.int(2, 9) * 10000;
          const g = (v: number) => (v * (100 - pct)) / 100;
          const f = (v: number) => v - c;
          const dFirst = r.chance(0.5);
          const val = dFirst ? f(g(x)) : g(f(x));
          return {
            q: `어느 가게에서 물건값 $x$ 원에 $${pct}\\%$ 할인을 적용한 금액을 $g(x)=${(100 - pct) / 100}x$, $${won(c)}$ 원 할인 쿠폰을 적용한 금액을 $f(x)=x-${won(c)}$ 라 합니다. 정가 $${won(x)}$ 원인 물건에 ${dFirst ? `$${pct}\\%$ 할인을 먼저 적용한 뒤 쿠폰을 사용할` : `쿠폰을 먼저 사용한 뒤 $${pct}\\%$ 할인을 적용할`} 때 내야 할 금액 $${dFirst ? '(f\\circ g)' : '(g\\circ f)'}(${won(x)})$ 을 구하세요.`,
            answer: { type: 'num', value: val, unit: '원' },
            steps: dFirst
              ? [`$g(${won(x)})=${won(g(x))}$`, `$f(${won(g(x))})=${won(g(x))}-${won(c)}=${won(val)}$ (원)`]
              : [`$f(${won(x)})=${won(x)}-${won(c)}=${won(f(x))}$`, `$g(${won(f(x))})=${(100 - pct) / 100}\\times${won(f(x))}=${won(val)}$ (원)`],
          };
        }
        if (level === 2) {
          const base = r.pick([10000, 20000, 30000]);
          const per = r.int(3, 12) * 1000;
          const x = r.int(2, 12);
          const k = base + per * x;
          const thing = r.pick(['자전거', '전동 킥보드', '캠핑 장비', '카메라']);
          return {
            q: `${thing}${josa(thing, '을', '를')} $x$ 시간 빌리는 요금은 $f(x)=${won(per)}x+${won(base)}$ (원)입니다. 요금으로 $${won(k)}$ 원을 냈을 때, 빌린 시간 $f^{-1}(${won(k)})$ 은 몇 시간인가요?`,
            answer: { type: 'num', value: x, unit: '시간' },
            steps: [`$f^{-1}(${won(k)})=a$ 라 하면 $f(a)=${won(k)}$`, `$${won(per)}a+${won(base)}=${won(k)}$ → $${won(per)}a=${won(per * x)}$`, `$a=${x}$ (시간)`],
          };
        }
        const t = r.int(-6, 20);
        const Fh = 9 * t + 32,
          K = 5 * t + 273;
        const inv = r.chance(0.7);
        return {
          q: `화씨온도 $x\\,{}^{\\circ}\\mathrm{F}$ 를 섭씨온도로 바꾸는 함수는 $f(x)=\\frac{5}{9}(x-32)$, 섭씨온도 $x\\,{}^{\\circ}\\mathrm{C}$ 를 절대온도(K)로 바꾸는 함수는 $g(x)=x+273$ 입니다. $h=g\\circ f$ 일 때, ${inv ? `$h^{-1}(${K})$ 의 값, 즉 절대온도 $${K}$ K 를 화씨온도로 나타낸 값을 구하세요.` : `$h(${Fh})$ 의 값, 즉 $${Fh}\\,{}^{\\circ}\\mathrm{F}$ 를 절대온도로 나타낸 값을 구하세요.`}`,
          answer: { type: 'num', value: inv ? Fh : K },
          steps: inv
            ? [`$h(x)=g(f(x))=\\frac{5}{9}(x-32)+273$`, `$h(a)=${K}$ 이면 $\\frac{5}{9}(a-32)=${K - 273}$`, `$a-32=${9 * t}$, $a=${Fh}$`]
            : [`$h(x)=g(f(x))=\\frac{5}{9}(x-32)+273$`, `$h(${Fh})=\\frac{5}{9}\\times${9 * t < 0 ? `(${9 * t})` : 9 * t}+273=${5 * t}+273=${K}$`],
        };
      },
    },
  ],

  'hc2-7': [
    {
      id: 'rational-word',
      title: '유리함수의 활용',
      gen(r, level) {
        const item = r.pick(['머그컵', '티셔츠', '에코백', '모자']);
        if (level === 1) {
          const n = r.pick([10, 20, 25, 40, 50]);
          const j = r.int(2, 9);
          const C = n * j;
          const v = r.int(1, 5);
          return {
            q: `어느 공방에서 ${item}${josa(item, '을', '를')} 만드는 데 기계 비용 $${C}$ 만 원이 들고, ${item} 한 개를 만들 때마다 재료비 $${v}$ 만 원이 듭니다. ${item}${josa(item, '을', '를')} $x$ 개 만들 때 한 개당 평균 비용은 $f(x)=\\frac{${v}x+${C}}{x}$ (만 원)입니다. $${n}$ 개를 만들 때 한 개당 평균 비용은 몇 만 원인가요?`,
            answer: { type: 'num', value: v + j, unit: '만 원' },
            steps: [`$f(x)=\\frac{${C}}{x}+${v}$`, `$f(${n})=\\frac{${C}}{${n}}+${v}=${j}+${v}=${v + j}$ (만 원)`],
          };
        }
        if (level === 2) {
          const C = r.int(4, 30) * 50;
          const v = r.int(1, 5);
          const g = r.int(1, 4);
          const k = v + g;
          const need = Math.ceil(C / g);
          return {
            q: `${item}${josa(item, '을', '를')} 만드는 데 기계 비용 $${C}$ 만 원이 들고, 한 개를 만들 때마다 재료비 $${v}$ 만 원이 듭니다. 한 개당 평균 비용 $f(x)=\\frac{${v}x+${C}}{x}$ (만 원)이 $${k}$ 만 원 이하가 되려면 최소 몇 개를 만들어야 하나요?`,
            answer: { type: 'num', value: need, unit: '개' },
            steps: [`$\\frac{${C}}{x}+${v}\\le${k}$ → $\\frac{${C}}{x}\\le${g}$`, `$x>0$ 이므로 $x\\ge\\frac{${C}}{${g}}${C % g === 0 ? '' : `=${new F(C, g).tex()}`}$`, `최소 $${need}$ 개`],
            hint: '평균 비용 $\\frac{C}{x}+v$ 는 $x$ 가 커질수록 작아져요.',
          };
        }
        let a: number, b: number, W: number, x: number, c: number;
        for (;;) {
          a = r.int(2, 10);
          b = r.int(a + 6, 30);
          W = r.pick([100, 200, 300, 400]);
          x = r.int(1, 12) * 50;
          const num = a * W + b * x;
          if (num % (W + x) === 0) {
            c = num / (W + x);
            if (c > a && c < b) break;
          }
        }
        return {
          q: `농도가 $${a}\\%$ 인 소금물 $${W}\\text{ g}$ 에 농도가 $${b}\\%$ 인 소금물 $x\\text{ g}$ 을 섞으면 농도는 $f(x)=\\frac{${b}x+${a * W}}{x+${W}}\\,(\\%)$ 가 됩니다. 섞은 소금물의 농도가 $${c}\\%$ 가 되게 하려면 $${b}\\%$ 소금물을 몇 g 섞어야 하나요?`,
          answer: { type: 'num', value: x, unit: 'g' },
          steps: [
            `$f(x)=\\frac{${b}(x+${W})${a * W - b * W < 0 ? '-' : '+'}${Math.abs(a * W - b * W)}}{x+${W}}=${b}-\\frac{${b * W - a * W}}{x+${W}}$ (많이 섞을수록 $${b}\\%$ 에 가까워짐)`,
            `$\\frac{${b}x+${a * W}}{x+${W}}=${c}$ → $${b}x+${a * W}=${c}x+${c * W}$`,
            `${b - c === 1 ? '' : `$${b - c}x=${c * W - a * W}$, `}$x=${x}$ (g)`,
          ],
        };
      },
    },
  ],
};
