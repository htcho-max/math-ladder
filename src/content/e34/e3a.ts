// 초3-1 콘텐츠
import type { ContentMap, Level, ProblemDraft } from '../../core/types';
import type { Rng } from '../../core/rng';
import { Svg, clock, numberLine } from '../../core/fig';
import { makeChoices } from '../../core/tex';
import { gcd, round } from '../../core/nt';
import { J, N, c, dotsFig, fr, fracFig, josa, nm, pick2Names, pickName, polyFig } from './util';

// ───────── 받아올림·받아내림 도우미 ─────────
const digitsOf = (n: number) => [n % 10, Math.floor(n / 10) % 10, Math.floor(n / 100) % 10, Math.floor(n / 1000) % 10];
const PLACE = ['일', '십', '백', '천'];

function carryPattern(a: number, b: number): boolean[] {
  const A = digitsOf(a),
    B = digitsOf(b);
  let cin = 0;
  const out: boolean[] = [];
  for (let i = 0; i < 3; i++) {
    const s = A[i] + B[i] + cin;
    out.push(s >= 10);
    cin = s >= 10 ? 1 : 0;
  }
  return out;
}
function borrowPattern(a: number, b: number): boolean[] {
  const A = digitsOf(a),
    B = digitsOf(b);
  let bin = 0;
  const out: boolean[] = [];
  for (let i = 0; i < 3; i++) {
    const s = A[i] - bin - B[i];
    out.push(s < 0);
    bin = s < 0 ? 1 : 0;
  }
  return out;
}
export function addSteps(a: number, b: number): string[] {
  const A = digitsOf(a),
    B = digitsOf(b);
  const cols = Math.max(String(a).length, String(b).length);
  let cin = 0;
  const st: string[] = [];
  for (let i = 0; i < cols; i++) {
    const s = A[i] + B[i] + cin;
    const expr = `${A[i]}+${B[i]}${cin ? '+1' : ''}=${s}`;
    st.push(`${PLACE[i]}의 자리: $${expr}$${s >= 10 ? (i === cols - 1 ? '' : ` → $${s % 10}$ 쓰고 $1$ 받아올림`) : ''}`);
    cin = s >= 10 ? 1 : 0;
  }
  st.push(`따라서 $${c(a)}+${c(b)}=${c(a + b)}$`);
  return st;
}
export function subSteps(a: number, b: number): string[] {
  const A = digitsOf(a),
    B = digitsOf(b);
  let bin = 0;
  const st: string[] = [];
  const cols = String(a).length;
  for (let i = 0; i < cols; i++) {
    const top = A[i] - bin;
    if (top < 0) {
      st.push(`${PLACE[i]}의 자리: $0$이라서 ${PLACE[i + 1]}의 자리에서 받아내린 $10$ 중 $1$을 아랫자리에 주고 남은 $9$ → $9-${B[i]}=${9 - B[i]}$`);
      bin = 1;
    } else if (top < B[i]) {
      st.push(`${PLACE[i]}의 자리: $${top}$에서 ${N(B[i], '을/를')} 뺄 수 없으므로 ${PLACE[i + 1]}의 자리에서 받아내림 → $${top + 10}-${B[i]}=${top + 10 - B[i]}$`);
      bin = 1;
    } else {
      if (A[i] - bin === 0 && B[i] === 0 && i === cols - 1) continue;
      st.push(`${PLACE[i]}의 자리: $${top}-${B[i]}=${top - B[i]}$`);
      bin = 0;
    }
  }
  st.push(`따라서 $${c(a)}-${c(b)}=${c(a - b)}$`);
  return st;
}
const eqArr = (a: boolean[], b: boolean[]) => a.every((x, i) => x === b[i]);

function addPair(r: Rng, pat: boolean[]): [number, number] {
  for (let t = 0; t < 3000; t++) {
    const a = r.int(100, 899),
      b = r.int(100, 899);
    if (eqArr(carryPattern(a, b), pat)) return [a, b];
  }
  return [123, 456];
}
function subPair(r: Rng, pat: boolean[], zeroTens = false): [number, number] {
  for (let t = 0; t < 3000; t++) {
    let a = r.int(200, 999);
    if (zeroTens) a = Math.floor(a / 100) * 100 + r.int(0, 9);
    const b = r.int(100, a - 100);
    if (eqArr(borrowPattern(a, b), pat)) return [a, b];
  }
  return [856, 423];
}
function addByLevel(r: Rng, level: Level): [number, number] {
  if (level === 1) return addPair(r, [false, false, false]);
  if (level === 2) return addPair(r, r.pick([[true, false, false], [false, true, false]]));
  return addPair(r, r.pick([[true, true, false], [true, true, true], [false, true, true], [true, false, true]]));
}
function subByLevel(r: Rng, level: Level): [number, number] {
  if (level === 1) return subPair(r, [false, false, false]);
  if (level === 2) return subPair(r, r.pick([[true, false, false], [false, true, false]]));
  return subPair(r, [true, true, false], r.chance(0.5));
}

/** 세로셈 TeX (□ 포함 문자열 가능) */
const vert = (top: string, op: string, bot: string, res: string) =>
  `$$\\begin{array}{r} ${top} \\\\ ${op}\\; ${bot} \\\\ \\hline ${res} \\end{array}$$`;

// ───────── 평면도형 도우미 ─────────
const LETTERS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ'];

function rightCount(pts: [number, number][]): number {
  let k = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p = pts[(i + n - 1) % n],
      v = pts[i],
      q = pts[(i + 1) % n];
    const dot = (p[0] - v[0]) * (q[0] - v[0]) + (p[1] - v[1]) * (q[1] - v[1]);
    if (dot === 0) k++;
  }
  return k;
}
const SHAPES: { name: string; pts: [number, number][] }[] = [
  { name: '직사각형', pts: [[0, 0], [5, 0], [5, 3], [0, 3]] },
  { name: '정사각형', pts: [[0, 0], [3, 0], [3, 3], [0, 3]] },
  { name: '직각삼각형', pts: [[0, 0], [4, 0], [0, 3]] },
  { name: '삼각형', pts: [[0, 0], [5, 0], [2, 3]] },
  { name: '사각형', pts: [[0, 0], [5, 0], [3, 3], [0, 3]] },
  { name: '사각형', pts: [[0, 0], [4, 0], [5, 3], [1, 3]] },
  { name: '사각형', pts: [[0, 0], [5, 0], [4, 3], [1, 2]] },
  { name: '오각형', pts: [[0, 0], [4, 0], [4, 3], [2, 5], [0, 3]] },
  { name: '오각형', pts: [[0, 0], [4, 0], [4, 2], [2, 4], [0, 4]] },
  { name: '오각형', pts: [[0, 0], [3, 0], [5, 2], [5, 4], [0, 4]] },
  { name: '육각형', pts: [[1, 0], [4, 0], [5, 2], [4, 4], [1, 4], [0, 2]] },
  { name: '육각형', pts: [[0, 0], [4, 0], [5, 1], [5, 4], [1, 4], [0, 3]] },
];

/** 격자 위에 도형 여러 개 */
function gridShapes(items: { pts: [number, number][]; label: string }[]): string {
  const u = 16;
  const bw = 6 * u;
  const w = items.length * (bw + 16) + 16;
  const h = 6 * u + 30;
  const s = new Svg(w, h);
  items.forEach((it, i) => {
    const x0 = 16 + i * (bw + 16);
    const y0 = 8;
    for (let k = 0; k <= 6; k++) {
      s.line(x0, y0 + k * u, x0 + bw, y0 + k * u, { cls: 'grid' });
      s.line(x0 + k * u, y0, x0 + k * u, y0 + bw, { cls: 'grid' });
    }
    const offX = Math.floor((6 - Math.max(...it.pts.map((p) => p[0]))) / 2);
    const offY = Math.floor((6 - Math.max(...it.pts.map((p) => p[1]))) / 2);
    s.poly(
      it.pts.map(([x, y]) => [x0 + (x + offX) * u, y0 + bw - (y + offY) * u] as [number, number]),
      { cls: 'acc', fill: true },
    );
    if (it.label) s.text(x0 + bw / 2, y0 + bw + 14, it.label, { size: 13 });
  });
  return s.toString();
}

function gridRect(a: number, b: number): string {
  const u = Math.min(36, 220 / Math.max(a, b));
  const s = new Svg(b * u + 20, a * u + 20);
  for (let i = 0; i < a; i++) for (let j = 0; j < b; j++) s.rect(10 + j * u, 10 + i * u, u, u, { cls: 'acc' });
  return s.toString();
}

// ───────── 길이·시간 도우미 ─────────
const UNIT_BANK: { q: string; a: string }[] = [
  { q: '연필의 길이는 약 17', a: 'cm' },
  { q: '서울에서 부산까지의 거리는 약 400', a: 'km' },
  { q: '교실 문의 높이는 약 2', a: 'm' },
  { q: '개미의 몸길이는 약 6', a: 'mm' },
  { q: '동전의 두께는 약 2', a: 'mm' },
  { q: '한라산의 높이는 약 2', a: 'km' },
  { q: '운동장 한 바퀴의 길이는 약 200', a: 'm' },
  { q: '내 손 한 뼘의 길이는 약 15', a: 'cm' },
  { q: '줄넘기를 10번 하는 데 걸리는 시간은 약 10', a: '초' },
  { q: '점심 시간은 약 50', a: '분' },
  { q: '하룻밤 잠을 자는 시간은 약 9', a: '시간' },
  { q: '손뼉을 한 번 치는 데 걸리는 시간은 약 1', a: '초' },
  { q: '수학 수업 한 시간은 약 40', a: '분' },
  { q: '학교 건물의 높이는 약 15', a: 'm' },
  { q: '버스를 타고 옆 도시까지 가는 거리는 약 30', a: 'km' },
];

export const content: ContentMap = {
  // ═════════════ e3a-1 덧셈과 뺄셈 ═════════════
  'e3a-1': {
    concepts: [
      {
        title: '세 자리 수의 덧셈',
        body: '같은 자리 숫자끼리 **일의 자리부터** 차례로 더해요.\n- 같은 자리의 합이 $10$이거나 $10$보다 크면 바로 윗자리로 $1$을 **받아올림**해요.\n- 2학년 때 배운 두 자리 수의 덧셈을 백의 자리까지 늘린 거예요.',
        example: { q: '$368+275$', a: '일의 자리 $8+5=13$ → $3$ 쓰고 $1$ 올림, 십의 자리 $1+6+7=14$ → $4$ 쓰고 $1$ 올림, 백의 자리 $1+3+2=6$ → $643$' },
      },
      {
        title: '세 자리 수의 뺄셈',
        body: '같은 자리 숫자끼리 일의 자리부터 빼요.\n- 빼는 수가 더 커서 뺄 수 없으면 바로 윗자리에서 **받아내림**해요. 받아내린 $1$은 아랫자리에서 $10$이 돼요.\n- 십의 자리가 $0$이면 백의 자리에서 먼저 받아내려야 해요. 예: $503-268$',
        example: { q: '$632-275$', a: '$12-5=7$, $12-7=5$ ($3$에서 $1$을 받아내려 $2$, 다시 백의 자리에서 받아내림), $5-2=3$ → $357$' },
      },
      {
        title: '어림하기와 검산',
        body: '계산하기 전에 몇백으로 어림하면 답이 맞는지 짐작할 수 있어요. 예: $298+405$ 는 약 $300+400=700$.\n- 뺄셈의 답은 덧셈으로 확인해요: $632-275=357$ 이면 $357+275=632$.',
      },
      {
        title: '문장제 풀기',
        body: '"모두", "합쳐서", "더 많이 생기면" → 덧셈\n"남은", "더 많은(차)", "얼마나 더" → 뺄셈\n- 어떤 수를 구할 때는 덧셈과 뺄셈의 관계를 이용해요: $\\square+25=80$ 이면 $\\square=80-25$.',
      },
    ],
    skills: [
      {
        id: 'add3',
        title: '세 자리 수의 덧셈',
        gen(r, level) {
          const [a, b] = addByLevel(r, level);
          const vertical = r.chance(0.5);
          return {
            q: vertical ? `계산해 보세요.${vert(c(a), '+', c(b), '')}` : `$${c(a)}+${c(b)}$ 를 계산해 보세요.`,
            answer: { type: 'num', value: a + b },
            steps: addSteps(a, b),
            hint: '일의 자리부터 더하고, 10이 넘으면 받아올림해요.',
          };
        },
      },
      {
        id: 'sub3',
        title: '세 자리 수의 뺄셈',
        gen(r, level) {
          const [a, b] = subByLevel(r, level);
          const vertical = r.chance(0.5);
          return {
            q: vertical ? `계산해 보세요.${vert(c(a), '-', c(b), '')}` : `$${c(a)}-${c(b)}$ 를 계산해 보세요.`,
            answer: { type: 'num', value: a - b },
            steps: subSteps(a, b),
            hint: '뺄 수 없으면 윗자리에서 받아내림해요.',
          };
        },
      },
      {
        id: 'word',
        title: '덧셈과 뺄셈 문장제',
        gen(r, level) {
          const [n1, n2] = pick2Names(r);
          if (level === 3) {
            if (r.chance(0.5)) {
              const x = r.int(250, 700);
              const k = r.int(120, Math.min(480, x - 50));
              const wrong = x - k;
              const right = x + k;
              return {
                q: `어떤 수에 $${k}$를 더해야 할 것을 잘못하여 뺐더니 $${wrong}$이 되었습니다. 바르게 계산하면 얼마인가요?`,
                answer: { type: 'num', value: right },
                steps: [`어떤 수 $-${k}=${wrong}$ 이므로 어떤 수 $=${wrong}+${k}=${x}$`, `바르게 계산하면 $${x}+${k}=${right}$`],
                hint: '먼저 어떤 수를 구해요.',
              };
            }
            const a = r.int(300, 600),
              b = r.int(150, 400);
            const used = r.int(200, a + b - 100);
            return {
              q: `${n1}는 색종이를 $${a}$장, ${n2}는 $${b}$장 가지고 있습니다. 두 사람이 만들기에 색종이를 $${used}$장 사용했다면 남은 색종이는 몇 장인가요?`,
              answer: { type: 'num', value: a + b - used, unit: '장' },
              steps: [`두 사람의 색종이: $${a}+${b}=${a + b}$(장)`, `남은 색종이: $${a + b}-${used}=${a + b - used}$(장)`],
            };
          }
          const kind = r.int(0, 3);
          if (kind === 0) {
            const [a, b] = addByLevel(r, level);
            return {
              q: `어느 학교의 남학생은 $${a}$명, 여학생은 $${b}$명입니다. 이 학교 학생은 모두 몇 명인가요?`,
              answer: { type: 'num', value: a + b, unit: '명' },
              steps: [`모두 → 덧셈: $${a}+${b}=${a + b}$(명)`],
            };
          }
          if (kind === 1) {
            const [a, b] = subByLevel(r, level);
            return {
              q: `줄넘기를 ${n1}는 $${a}$번, ${n2}는 $${b}$번 했습니다. ${n1}는 ${n2}보다 줄넘기를 몇 번 더 했나요?`,
              answer: { type: 'num', value: a - b, unit: '번' },
              steps: [`더 많이 한 횟수 → 뺄셈: $${a}-${b}=${a - b}$(번)`],
            };
          }
          if (kind === 2) {
            const [a, b] = subByLevel(r, level);
            const item = r.pick(['구슬', '스티커', '색종이', '딱지']);
            return {
              q: `${pickName(r)}는 ${J(item, '을/를')} $${a}$개 가지고 있었습니다. 그중 $${b}$개를 친구에게 주었다면 남은 ${J(item, '은/는')} 몇 개인가요?`,
              answer: { type: 'num', value: a - b, unit: '개' },
              steps: [`남은 개수 → 뺄셈: $${a}-${b}=${a - b}$(개)`],
            };
          }
          const [a, b] = addByLevel(r, level);
          return {
            q: `도서관에 동화책이 $${a}$권 있었습니다. 오늘 동화책 $${b}$권을 새로 들여왔다면 동화책은 모두 몇 권인가요?`,
            answer: { type: 'num', value: a + b, unit: '권' },
            steps: [`모두 → 덧셈: $${a}+${b}=${a + b}$(권)`],
          };
        },
      },
      {
        id: 'missing-digit',
        title: '□ 안에 알맞은 숫자',
        gen(r, level): ProblemDraft {
          const isSub = level >= 2 && r.chance(0.5);
          const [a, b] = isSub ? subByLevel(r, level) : addByLevel(r, level);
          const res = isSub ? a - b : a + b;
          const op = isSub ? '-' : '+';
          const strs = [String(a), String(b), String(res)];
          if (level <= 2) {
            const which = r.int(0, 2);
            const pos = r.int(0, strs[which].length - 1);
            const digit = +strs[which][pos];
            const sh = strs.map((s, i) => (i === which ? s.slice(0, pos) + '\\square ' + s.slice(pos + 1) : s));
            return {
              q: `□ 안에 알맞은 숫자를 써넣으세요.${vert(sh[0], op, sh[1], sh[2])}`,
              answer: { type: 'num', value: digit },
              steps: [
                ...(isSub ? subSteps(a, b) : addSteps(a, b)).slice(0, -1),
                `식을 완성하면 $${c(a)}${op}${c(b)}=${c(res)}$ 이므로 □ 안의 숫자는 $${digit}$`,
              ],
              hint: '일의 자리부터 차례로 따져 보세요.',
            };
          }
          // 두 칸: 서로 다른 수, 서로 다른 자리
          const p1 = r.int(0, 2);
          let p2 = r.int(0, 2);
          if (p2 === p1) p2 = (p1 + 1) % 3;
          const w1 = r.int(0, 1);
          const w2 = 1 - w1;
          const s1 = strs[w1],
            s2 = strs[w2];
          const d1 = +s1[p1],
            d2 = +s2[p2];
          const sh = strs.slice();
          sh[w1] = s1.slice(0, p1) + '\\square ' + s1.slice(p1 + 1);
          sh[w2] = s2.slice(0, p2) + '\\triangle ' + s2.slice(p2 + 1);
          return {
            q: `□와 △ 안에 알맞은 숫자를 구하세요.${vert(sh[0], op, sh[1], sh[2])}`,
            answer: { type: 'fields', fields: [{ label: '□', value: d1 }, { label: '△', value: d2 }] },
            steps: [...(isSub ? subSteps(a, b) : addSteps(a, b)).slice(0, -1), `완성된 식: $${c(a)}${op}${c(b)}=${c(res)}$ → □$=${d1}$, △$=${d2}$`],
            hint: '일의 자리부터 받아올림(받아내림)을 생각하며 거꾸로 따져 보세요.',
          };
        },
      },
      {
        id: 'compare',
        title: '계산 결과 비교하기',
        gen(r, level) {
          const exprs: { t: string; v: number }[] = [];
          const seen = new Set<number>();
          for (let t = 0; exprs.length < 4 && t < 200; t++) {
            const isSub = r.chance(0.5);
            const [a, b] = isSub ? subByLevel(r, level) : addByLevel(r, level);
            const v = isSub ? a - b : a + b;
            if (seen.has(v)) continue;
            seen.add(v);
            exprs.push({ t: `$${c(a)}${isSub ? '-' : '+'}${c(b)}$`, v });
          }
          const big = r.chance(0.5);
          const sorted = exprs.slice().sort((x, y) => (big ? y.v - x.v : x.v - y.v));
          return {
            q: `계산 결과가 가장 ${big ? '큰' : '작은'} 것은 어느 것인가요?`,
            answer: makeChoices(r, sorted[0].t, sorted.slice(1).map((e) => e.t), 4),
            steps: [...exprs.map((e) => `${e.t.slice(0, -1)}=${c(e.v)}$`), `가장 ${big ? '큰' : '작은'} 것은 ${sorted[0].t}`],
          };
        },
      },
    ],
  },

  // ═════════════ e3a-2 평면도형 ═════════════
  'e3a-2': {
    concepts: [
      {
        title: '선분, 반직선, 직선',
        body: '- **선분**: 두 점을 곧게 이은 선. 선분 ㄱㄴ = 선분 ㄴㄱ\n- **반직선**: 한 점에서 시작하여 한쪽으로 끝없이 늘인 곧은 선. 반직선 ㄱㄴ은 점 ㄱ에서 시작해 점 ㄴ 쪽으로 늘인 선이라서 반직선 ㄴㄱ과 달라요.\n- **직선**: 선분을 양쪽으로 끝없이 늘인 곧은 선. 직선 ㄱㄴ = 직선 ㄴㄱ',
      },
      {
        title: '각과 직각',
        body: '한 점에서 그은 두 반직선으로 이루어진 도형을 **각**이라고 해요. 그 점을 **꼭짓점**, 두 반직선을 **변**이라고 해요.\n- 종이를 반듯하게 두 번 접었을 때 생기는 각을 **직각**이라고 해요. 삼각자의 직각 부분을 대어 확인해요.',
        example: { q: '각 ㄱㄴㄷ의 꼭짓점은?', a: '가운데 글자인 점 ㄴ이에요.' },
      },
      {
        title: '직각삼각형',
        body: '한 각이 직각인 삼각형을 **직각삼각형**이라고 해요. 직각삼각형에는 직각이 **1개** 있어요.',
      },
      {
        title: '직사각형과 정사각형',
        body: '- **직사각형**: 네 각이 모두 직각인 사각형. 마주 보는 두 변의 길이가 같아요.\n- **정사각형**: 네 각이 모두 직각이고 **네 변의 길이가 모두 같은** 사각형.\n- 정사각형은 직사각형이라고 할 수 있지만, 직사각형은 정사각형이라고 할 수 없어요.',
      },
    ],
    skills: [
      {
        id: 'line-kind',
        title: '선분·반직선·직선',
        gen(r, level) {
          if (level === 3) {
            const n = r.int(4, 6);
            const kind = r.pick(['선분', '직선', '반직선']);
            const ans = kind === '반직선' ? n * (n - 1) : (n * (n - 1)) / 2;
            const s = new Svg(180, 160);
            const rot = r.int(0, 60);
            const pts = Array.from({ length: n }, (_, i) => {
              const a = ((rot + (360 * i) / n) * Math.PI) / 180;
              return [90 + 60 * Math.cos(a), 80 - 60 * Math.sin(a)] as [number, number];
            });
            pts.forEach(([x, y], i) => {
              s.dot(x, y, { cls: 'acc' });
              s.text(x + (x - 90) * 0.25, y + (y - 80) * 0.25, LETTERS[i], { size: 13 });
            });
            return {
              q: `그림과 같이 점 $${n}$개가 있습니다. 이 중 두 점을 골라 그을 수 있는 ${kind}은 모두 몇 개인가요?`,
              fig: s.toString(),
              answer: { type: 'num', value: ans, unit: '개' },
              steps:
                kind === '반직선'
                  ? [`반직선은 시작점이 중요해요. 한 점에서 다른 점 $${n - 1}$개 쪽으로 각각 그을 수 있어요.`, `$${n}$개 점에서 $${n - 1}$개씩: $${n}\\times${n - 1}=${ans}$(개)`]
                  : [`한 점에서 다른 점으로 $${n - 1}$개씩 그으면 $${n}\\times${n - 1}=${n * (n - 1)}$, 그런데 ${kind} ㄱㄴ과 ${kind} ㄴㄱ은 같으므로 둘씩 겹쳐요.`, `$${n * (n - 1)}$의 절반 $=${ans}$(개)`],
              hint: kind === '반직선' ? '반직선 ㄱㄴ과 반직선 ㄴㄱ은 서로 달라요.' : `${kind} ㄱㄴ과 ${kind} ㄴㄱ은 같아요.`,
            };
          }
          const [A, B] = r.sample(LETTERS, 2);
          const kind = r.pick(['seg', 'ray', 'ray', 'line'] as const);
          const reversed = r.chance(0.5);
          const s = new Svg(260, 70);
          const ang = r.int(-15, 15) * (Math.PI / 180);
          const P = (t: number): [number, number] => [130 + t * Math.cos(ang), 38 - t * Math.sin(ang)];
          const pa = P(-55),
            pb = P(55);
          const start = kind === 'seg' ? -55 : kind === 'line' ? -120 : reversed ? -120 : -55;
          const end = kind === 'seg' ? 55 : kind === 'line' ? 120 : reversed ? 55 : 120;
          s.line(...P(start), ...P(end), { cls: 'acc', width: 2 });
          s.dot(...pa);
          s.dot(...pb);
          s.text(pa[0], pa[1] + 16, A, { size: 14 });
          s.text(pb[0], pb[1] + 16, B, { size: 14 });
          const correct = kind === 'seg' ? `선분 ${A}${B}` : kind === 'line' ? `직선 ${A}${B}` : reversed ? `반직선 ${B}${A}` : `반직선 ${A}${B}`;
          const all = [`선분 ${A}${B}`, `직선 ${A}${B}`, `반직선 ${A}${B}`, `반직선 ${B}${A}`];
          const wrongs = all.filter((x) => x !== correct);
          if (level === 2) wrongs.push(kind === 'seg' ? `직선 ${B}${A}` : `선분 ${B}${A}`);
          const why =
            kind === 'seg'
              ? '두 점을 곧게 이은 선이므로 선분이에요.'
              : kind === 'line'
                ? '양쪽으로 끝없이 늘인 곧은 선이므로 직선이에요.'
                : `점 ${reversed ? B : A}에서 시작하여 점 ${reversed ? A : B} 쪽으로 끝없이 늘인 선이므로 반직선 ${reversed ? B + A : A + B}이에요.`;
          return {
            q: level === 1 ? '그림의 도형의 이름으로 알맞은 것은?' : '그림을 보고 바르게 읽은 것을 고르세요. (반직선은 시작하는 점을 먼저 읽어요.)',
            fig: s.toString(),
            answer: makeChoices(r, correct, wrongs, level === 1 ? 4 : 5),
            steps: [why, `따라서 ${correct}`],
          };
        },
      },
      {
        id: 'count-angles',
        title: '각과 직각의 수',
        gen(r, level) {
          if (level === 3) {
            const picks = r.sample(SHAPES, 3);
            const rc = picks.map((p) => rightCount(p.pts));
            if (new Set(rc).size < 3) {
              // 직각 수가 모두 다르도록 다시 고르기
              const byCount = new Map<number, (typeof SHAPES)[number][]>();
              SHAPES.forEach((sh) => {
                const k = rightCount(sh.pts);
                byCount.set(k, [...(byCount.get(k) ?? []), sh]);
              });
              const keys = r.sample([...byCount.keys()], 3);
              picks.splice(0, 3, ...keys.map((k) => r.pick(byCount.get(k)!)));
            }
            const counts = picks.map((p) => rightCount(p.pts));
            const labels = ['가', '나', '다'];
            const mx = Math.max(...counts);
            const ans = labels[counts.indexOf(mx)];
            return {
              q: '직각이 가장 많은 도형을 찾아 기호를 고르세요.',
              fig: gridShapes(picks.map((p, i) => ({ pts: p.pts, label: labels[i] }))),
              answer: { type: 'choice', choices: labels, index: counts.indexOf(mx) },
              steps: [...picks.map((_, i) => `도형 ${labels[i]}의 직각: $${counts[i]}$개`), `가장 많은 것은 ${ans}`],
              hint: '삼각자의 직각 부분을 대어 보듯이 격자의 칸을 이용해 보세요.',
            };
          }
          const ask = r.pick(['angle', 'right'] as const);
          const picks = level === 1 ? [r.pick(SHAPES)] : r.sample(SHAPES, 2);
          const vals = picks.map((p) => (ask === 'angle' ? p.pts.length : rightCount(p.pts)));
          const total = vals.reduce((a, b) => a + b, 0);
          const what = ask === 'angle' ? '각' : '직각';
          return {
            q: level === 1 ? `도형에서 ${what}은 모두 몇 개인가요?` : `두 도형 가와 나에 있는 ${what}의 수를 모두 더하면 몇 개인가요?`,
            fig: gridShapes(picks.map((p, i) => ({ pts: p.pts, label: level === 1 ? '' : ['가', '나'][i] }))),
            answer: { type: 'num', value: total, unit: '개' },
            steps:
              level === 1
                ? [ask === 'angle' ? `꼭짓점마다 각이 하나씩 있어요. 꼭짓점이 $${total}$개이므로 각은 $${total}$개` : `격자를 보고 직각인 곳을 세면 $${total}$개`]
                : [`가: $${vals[0]}$개, 나: $${vals[1]}$개`, `$${vals[0]}+${vals[1]}=${total}$(개)`],
          };
        },
      },
      {
        id: 'true-false',
        title: '도형의 성질 알기',
        gen(r) {
          const T = [
            '정사각형은 네 각이 모두 직각입니다.',
            '정사각형은 직사각형이라고 할 수 있습니다.',
            '직사각형은 마주 보는 두 변의 길이가 같습니다.',
            '직각삼각형에는 직각이 1개 있습니다.',
            '각은 한 점에서 그은 두 반직선으로 이루어진 도형입니다.',
            '직선은 양쪽으로 끝없이 늘인 곧은 선입니다.',
            '선분 ㄱㄴ과 선분 ㄴㄱ은 같습니다.',
            '직사각형은 네 각이 모두 직각입니다.',
            '정사각형은 네 변의 길이가 모두 같습니다.',
          ];
          const Fs = [
            '직사각형은 정사각형이라고 할 수 있습니다.',
            '직각삼각형에는 직각이 2개 있습니다.',
            '반직선 ㄱㄴ과 반직선 ㄴㄱ은 같습니다.',
            '직선은 양쪽 끝이 있습니다.',
            '모든 직사각형은 네 변의 길이가 같습니다.',
            '선분은 한쪽으로 끝없이 늘인 곧은 선입니다.',
            '각에는 꼭짓점이 2개 있습니다.',
            '모든 삼각형에는 직각이 있습니다.',
            '각의 두 변의 길이가 길수록 각이 커집니다.',
          ];
          const wantTrue = r.chance(0.5);
          const correct = r.pick(wantTrue ? T : Fs);
          const wrongs = r.sample(wantTrue ? Fs : T, 4);
          return {
            q: wantTrue ? '옳은 것을 고르세요.' : '옳지 **않은** 것을 고르세요.',
            answer: makeChoices(r, correct, wrongs, 5),
            steps: [wantTrue ? `옳은 설명: ${correct}` : `옳지 않은 설명: ${correct}`, '선분·반직선·직선, 각, 직각삼각형, 직사각형, 정사각형의 뜻을 떠올려 보세요.'],
          };
        },
      },
      {
        id: 'rect-perimeter',
        title: '직사각형·정사각형 변의 길이',
        gen(r, level) {
          const square = r.chance(0.4);
          const a = r.int(3, level === 1 ? 12 : 25);
          const b = square ? a : r.int(2, a - 1);
          const per = 2 * (a + b);
          const fig = polyFig([[0, 0], [a, 0], [a, b], [0, b]], { sides: [`${a} cm`, square ? null : `${b} cm`, null, null], right: [true, true, true, true] });
          const name = square ? '정사각형' : '직사각형';
          if (level === 1) {
            return {
              q: `${name}의 네 변의 길이의 합은 몇 cm인가요?`,
              fig,
              answer: { type: 'num', value: per, unit: 'cm' },
              steps: square ? [`정사각형은 네 변의 길이가 모두 같아요.`, `$${a}\\times4=${per}$ (cm)`] : [`직사각형은 마주 보는 변의 길이가 같아요.`, `$${a}+${b}+${a}+${b}=${per}$ (cm)`],
            };
          }
          if (level === 2) {
            if (square) {
              return {
                q: `네 변의 길이의 합이 $${per}$ cm인 정사각형이 있습니다. 한 변의 길이는 몇 cm인가요?`,
                answer: { type: 'num', value: a, unit: 'cm' },
                steps: [`정사각형은 네 변의 길이가 같으므로 한 변의 길이를 $4$번 더하면 $${per}$`, `$${a}\\times4=${per}$ 이므로 한 변은 $${a}$ cm`],
                hint: '같은 수를 4번 더해서 나오는 수를 찾아요.',
              };
            }
            return {
              q: `가로가 $${a}$ cm이고 네 변의 길이의 합이 $${per}$ cm인 직사각형이 있습니다. 세로는 몇 cm인가요?`,
              answer: { type: 'num', value: b, unit: 'cm' },
              steps: [`가로 두 변의 합: $${a}+${a}=${2 * a}$ (cm)`, `세로 두 변의 합: $${per}-${2 * a}=${2 * b}$ (cm)`, `세로 한 변: $${b}$ cm`],
            };
          }
          // L3: 정사각형 여러 개를 이어 붙인 직사각형
          const k = r.int(2, 5);
          const side = r.int(3, 9);
          const W = k * side;
          const total = 2 * (W + side);
          const u = Math.min(50, 270 / k);
          const s = new Svg(Math.min(300, k * 50 + 30), u + 50);
          for (let i = 0; i < k; i++) s.rect(15 + i * u, 15, u, u, { cls: 'acc' });
          s.text(15 + u / 2, 15 + u + 12, `${side} cm`, { size: 12 });
          return {
            q: `한 변이 $${side}$ cm인 정사각형 $${k}$개를 겹치지 않게 이어 붙여 직사각형을 만들었습니다. 만든 직사각형의 네 변의 길이의 합은 몇 cm인가요?`,
            fig: s.toString(),
            answer: { type: 'num', value: total, unit: 'cm' },
            steps: [`가로: $${side}\\times${k}=${W}$ (cm), 세로: $${side}$ cm`, `네 변의 합: $${W}+${side}+${W}+${side}=${total}$ (cm)`],
          };
        },
      },
      {
        id: 'count-squares',
        title: '크고 작은 사각형 세기',
        gen(r, level) {
          const dims: [number, number][] =
            level === 1 ? [[1, 2], [1, 3], [1, 4], [2, 2], [1, 5]] : level === 2 ? [[2, 2], [2, 3], [2, 4], [3, 3], [3, 4], [2, 5]] : [[1, 3], [1, 4], [2, 2], [2, 3], [1, 5], [2, 4]];
          const [a, b] = r.pick(dims);
          if (level < 3) {
            let tot = 0;
            const parts: string[] = [];
            for (let k = 1; k <= Math.min(a, b); k++) {
              const v = (a - k + 1) * (b - k + 1);
              tot += v;
              parts.push(`작은 칸 $${k * k}$개짜리 정사각형: $${v}$개`);
            }
            return {
              q: '그림에서 찾을 수 있는 크고 작은 **정사각형**은 모두 몇 개인가요?',
              fig: gridRect(a, b),
              answer: { type: 'num', value: tot, unit: '개' },
              steps: [...parts, `모두 $${tot}$개`],
              hint: '작은 정사각형 1개짜리, 4개짜리 … 로 나누어 세요.',
            };
          }
          const ra = (a * (a + 1)) / 2,
            rb = (b * (b + 1)) / 2;
          const tot = ra * rb;
          return {
            q: '그림에서 찾을 수 있는 크고 작은 **직사각형**은 모두 몇 개인가요? (정사각형도 직사각형이에요.)',
            fig: gridRect(a, b),
            answer: { type: 'num', value: tot, unit: '개' },
            steps: [`가로 방향으로 고를 수 있는 길이의 경우: $${b}$칸 중 이어진 칸 고르기 → $${rb}$가지`, `세로 방향: $${ra}$가지`, `모두 $${rb}\\times${ra}=${tot}$(개)`],
            hint: '정사각형도 직사각형이에요. 작은 칸 1개짜리, 2개짜리 … 로 나누어 세요.',
          };
        },
      },
    ],
  },

  // ═════════════ e3a-3 나눗셈 ═════════════
  'e3a-3': {
    concepts: [
      {
        title: '똑같이 나누기',
        body: '$12$개를 $3$명에게 똑같이 나누어 주면 한 명에게 $4$개씩 돌아가요. 이것을 나눗셈식으로 $12\\div3=4$ 라고 쓰고 "12 나누기 3은 4와 같습니다"라고 읽어요.\n- $12$는 나누어지는 수, $3$은 나누는 수, $4$는 **몫**이에요.',
      },
      {
        title: '묶어 덜어 내기',
        body: '$12$개를 $3$개씩 묶으면 $4$묶음이에요. 뺄셈식으로 $12-3-3-3-3=0$, 나눗셈식으로 $12\\div3=4$.\n- 몇 번 덜어 내야 $0$이 되는지가 몫이에요.',
      },
      {
        title: '곱셈과 나눗셈의 관계',
        body: '곱셈식 하나로 나눗셈식 두 개를 만들 수 있어요.\n$$3\\times4=12 \\;\\Rightarrow\\; 12\\div3=4,\\; 12\\div4=3$$',
        example: { q: '$5\\times7=35$ 로 나눗셈식 두 개 만들기', a: '$35\\div5=7$, $35\\div7=5$' },
      },
      {
        title: '곱셈구구로 몫 구하기',
        body: '$42\\div6$ 의 몫은 "$6$ 곱하기 몇이 $42$?"를 생각해요. $6\\times7=42$ 이므로 몫은 $7$이에요.\n- 2학년 때 외운 곱셈구구를 거꾸로 생각하면 나눗셈이에요.',
      },
    ],
    skills: [
      {
        id: 'div-fact',
        title: '곱셈구구로 몫 구하기',
        gen(r, level) {
          const b = level === 1 ? r.int(2, 5) : r.int(2, 9);
          const q = r.int(2, 9);
          const a = b * q;
          if (level === 3) {
            const form = r.int(0, 1);
            if (form === 0)
              return {
                q: `□ 안에 알맞은 수를 구하세요. $$\\square\\div${b}=${q}$$`,
                answer: { type: 'num', value: a },
                steps: [`나눗셈을 곱셈으로 바꾸면 $${b}\\times${q}=\\square$`, `$\\square=${a}$`],
                hint: '나누는 수와 몫을 곱하면 나누어지는 수가 돼요.',
              };
            return {
              q: `□ 안에 알맞은 수를 구하세요. $$${a}\\div\\square=${q}$$`,
              answer: { type: 'num', value: b },
              steps: [`$\\square\\times${q}=${a}$ 인 수를 찾아요.`, `$${b}\\times${q}=${a}$ 이므로 $\\square=${b}$`],
            };
          }
          return {
            q: `나눗셈의 몫을 구하세요. $$${a}\\div${b}$$`,
            answer: { type: 'num', value: q },
            steps: [`$${b}\\times\\square=${a}$ 를 생각해요.`, `$${b}\\times${q}=${a}$ 이므로 $${a}\\div${b}=${q}$`],
          };
        },
      },
      {
        id: 'mul-div-relation',
        title: '곱셈과 나눗셈의 관계',
        gen(r, level) {
          const b = r.int(2, 9);
          let q = r.int(2, 9);
          if (q === b) q = q === 9 ? 8 : q + 1;
          const a = b * q;
          if (level === 1) {
            const correct = r.chance(0.5) ? `$${a}\\div${b}=${q}$` : `$${a}\\div${q}=${b}$`;
            return {
              q: `곱셈식 $${b}\\times${q}=${a}$ 를 나눗셈식으로 바르게 나타낸 것은?`,
              answer: makeChoices(r, correct, [`$${b}\\div${a}=${q}$`, `$${a}\\div${b}=${b}$`, `$${q}\\div${b}=${a}$`, `$${a}\\div${q}=${q}$`, `$${b}\\div${q}=${a}$`], 4),
              steps: [`$${b}\\times${q}=${a}$ 에서 $${a}$를 $${b}$로 나누면 $${q}$, $${q}$로 나누면 $${b}$`, `$${a}\\div${b}=${q}$, $${a}\\div${q}=${b}$`],
            };
          }
          if (level === 2) {
            const correct = r.chance(0.5) ? `$${b}\\times${q}=${a}$` : `$${q}\\times${b}=${a}$`;
            return {
              q: `나눗셈식 $${a}\\div${b}=${q}$ 를 곱셈식으로 바르게 나타낸 것은?`,
              answer: makeChoices(r, correct, [`$${a}\\times${b}=${q}$`, `$${a}\\times${q}=${b}$`, `$${b}\\times${b}=${a}$`, `$${q}\\times${q}=${a}$`, `$${b}\\times${a}=${q}$`], 4),
              steps: [`나누는 수 $\\times$ 몫 $=$ 나누어지는 수`, `$${b}\\times${q}=${a}$`],
            };
          }
          return {
            q: `$${b}\\times\\square=${a}$ 일 때, $${a}\\div${b}$ 의 몫은 얼마인가요?`,
            answer: { type: 'num', value: q },
            steps: [`$${b}\\times${q}=${a}$ 이므로 $\\square=${q}$`, `곱셈과 나눗셈의 관계에서 $${a}\\div${b}=${q}$`],
          };
        },
      },
      {
        id: 'repeated-sub',
        title: '묶어 덜어 내기',
        gen(r, level) {
          const b = r.int(2, level === 1 ? 6 : 9);
          const q = r.int(level === 1 ? 2 : 3, level === 1 ? 6 : 9);
          const a = b * q;
          if (level === 1) {
            const expr = [a, ...Array(q).fill(b)].join('-') + '=0';
            return {
              q: `뺄셈식을 나눗셈식으로 나타낼 때 몫은 얼마인가요? $$${expr}$$`,
              fig: dotsFig(a, b * Math.max(1, Math.min(q, Math.floor(12 / b))), { groupBy: b }),
              answer: { type: 'num', value: q },
              steps: [`$${a}$에서 $${b}$씩 $${q}$번 빼면 $0$이 돼요.`, `$${a}\\div${b}=${q}$`],
            };
          }
          if (level === 2) {
            return {
              q: `$${a}$에서 $${b}$씩 몇 번 빼면 $0$이 되나요?`,
              answer: { type: 'num', value: q, unit: '번' },
              steps: [`뺄셈을 나눗셈으로 바꿔요: $${a}\\div${b}$`, `$${b}\\times${q}=${a}$ 이므로 $${q}$번`],
            };
          }
          const len = a;
          const name = pickName(r);
          return {
            q: `${name}는 길이가 $${len}$ cm인 끈을 $${b}$ cm씩 똑같이 잘라서 여러 도막으로 나누려고 합니다. 모두 몇 번 잘라야 하나요?`,
            answer: { type: 'num', value: q - 1, unit: '번' },
            steps: [`도막 수: $${len}\\div${b}=${q}$(도막)`, `마지막 도막은 자를 필요가 없으므로 자르는 횟수는 도막 수보다 $1$ 작아요.`, `$${q}-1=${q - 1}$(번)`],
            hint: '도막 수와 자르는 횟수는 달라요.',
          };
        },
      },
      {
        id: 'share-word',
        title: '나눗셈 문장제',
        gen(r, level) {
          const b = r.int(2, 9);
          const q = r.int(2, 9);
          const a = b * q;
          const name = pickName(r);
          const item = r.pick(['사탕', '구슬', '공책', '연필', '쿠키', '귤']);
          if (level === 3) {
            if (r.chance(0.5)) {
              const extra = r.int(3, 20);
              return {
                q: `${item} $${a + extra}$개 중에서 $${extra}$개를 동생에게 주고, 남은 ${J(item, '을/를')} 친구 $${b}$명에게 똑같이 나누어 주었습니다. 친구 한 명이 받은 ${J(item, '은/는')} 몇 개인가요?`,
                answer: { type: 'num', value: q, unit: '개' },
                steps: [`남은 ${item}: $${a + extra}-${extra}=${a}$(개)`, `한 명이 받은 수: $${a}\\div${b}=${q}$(개)`],
              };
            }
            const per = r.int(3, 9);
            const boxes = r.int(3, 9);
            const tot = per * boxes;
            const kids = r.pick([2, 3, 4, 5, 6, 7, 8, 9].filter((k) => tot % k === 0 && tot / k <= 9 && k !== per && k !== boxes));
            if (!kids) {
              return {
                q: `한 상자에 ${J(item, '이/가')} $${per}$개씩 $${boxes}$상자 있습니다. 이것을 $${per}$명에게 똑같이 나누어 주면 한 명에게 몇 개씩 줄 수 있나요?`,
                answer: { type: 'num', value: boxes, unit: '개' },
                steps: [`전체: $${per}\\times${boxes}=${tot}$(개)`, `$${tot}\\div${per}=${boxes}$(개)`],
              };
            }
            return {
              q: `한 상자에 ${J(item, '이/가')} $${per}$개씩 $${boxes}$상자 있습니다. 이것을 $${kids}$명에게 똑같이 나누어 주면 한 명에게 몇 개씩 줄 수 있나요?`,
              answer: { type: 'num', value: tot / kids, unit: '개' },
              steps: [`전체: $${per}\\times${boxes}=${tot}$(개)`, `$${tot}\\div${kids}=${tot / kids}$(개)`],
            };
          }
          if (level === 2) {
            const bags = r.int(2, 4),
              kids2 = r.int(2, 4),
              each = r.int(2, Math.floor(9 / kids2));
            const tot = bags * kids2 * each;
            return {
              q: `${item} $${tot}$개를 봉지 $${bags}$개에 똑같이 나누어 담았습니다. 그중 한 봉지에 든 ${J(item, '을/를')} $${kids2}$명이 똑같이 나누어 가지면 한 명이 몇 개씩 가지게 되나요?`,
              answer: { type: 'num', value: each, unit: '개' },
              steps: [`한 봉지: $${tot}\\div${bags}=${tot / bags}$(개)`, `한 명: $${tot / bags}\\div${kids2}=${each}$(개)`],
            };
          }
          if (r.chance(0.5))
            return {
              q: `${nm(name)}는 ${item} $${a}$개를 친구 $${b}$명에게 똑같이 나누어 주려고 합니다. 한 명에게 몇 개씩 줄 수 있나요?`,
              answer: { type: 'num', value: q, unit: '개' },
              steps: [`똑같이 나누어 주기 → $${a}\\div${b}$`, `$${b}\\times${q}=${a}$ 이므로 $${q}$개씩`],
            };
          return {
            q: `${item} $${a}$개를 한 봉지에 $${b}$개씩 담으려고 합니다. 봉지는 몇 개 필요한가요?`,
            answer: { type: 'num', value: q, unit: '개' },
            steps: [`$${b}$개씩 묶기 → $${a}\\div${b}$`, `$${b}\\times${q}=${a}$ 이므로 $${q}$봉지`],
          };
        },
      },
      {
        id: 'div-compare',
        title: '몫의 크기 비교',
        gen(r, level) {
          const items: { t: string; v: number }[] = [];
          const used = new Set<number>();
          for (let t = 0; items.length < 4 && t < 200; t++) {
            const b = r.int(2, 9),
              q = r.int(level === 1 ? 2 : 1, 9);
            if (used.has(q)) continue;
            used.add(q);
            items.push(level === 3 ? { t: `$\\square\\div${b}=${q}$`, v: b * q } : { t: `$${b * q}\\div${b}$`, v: q });
          }
          const big = level === 2 ? r.chance(0.5) : true;
          const sorted = items.slice().sort((x, y) => (big ? y.v - x.v : x.v - y.v));
          return {
            q: level === 3 ? '□ 안에 알맞은 수가 가장 큰 것은 어느 것인가요?' : `몫이 가장 ${big ? '큰' : '작은'} 것은 어느 것인가요?`,
            answer: makeChoices(r, sorted[0].t, sorted.slice(1).map((x) => x.t), 4),
            steps: [...items.map((x) => (level === 3 ? `${x.t} → □$=${x.v}$` : `${x.t.slice(0, -1)}=${x.v}$`)), `답: ${sorted[0].t}`],
          };
        },
      },
    ],
  },

  // ═════════════ e3a-4 곱셈 ═════════════
  'e3a-4': {
    concepts: [
      {
        title: '(몇십)×(몇)',
        body: '$30\\times2$ 는 $3\\times2=6$ 에 $0$을 하나 붙여 $60$이에요. 십 모형 $3$개씩 $2$묶음이라고 생각해요.',
      },
      {
        title: '올림이 없는 (몇십몇)×(몇)',
        body: '일의 자리와 십의 자리를 따로 곱해서 더해요.\n$$23\\times3 = 20\\times3 + 3\\times3 = 60+9 = 69$$',
      },
      {
        title: '올림이 있는 곱셈',
        body: '- **일의 자리에서 올림**: $26\\times3$ 에서 $6\\times3=18$ → $8$ 쓰고 $1$을 십의 자리로 올려요. $2\\times3+1=7$ → $78$\n- **십의 자리에서 올림**: $52\\times3$ 에서 $5\\times3=15$ 는 백의 자리까지 써요 → $156$',
        example: { q: '$47\\times6$', a: '$7\\times6=42$ → $2$ 쓰고 $4$ 올림, $4\\times6+4=28$ → $282$' },
      },
      {
        title: '곱셈 문장제',
        body: '"~씩 ~묶음", "한 상자에 ~개씩 ~상자" 처럼 같은 수를 여러 번 더할 때 곱셈을 써요. 곱셈구구를 확장한 것이에요.',
      },
    ],
    skills: [
      {
        id: 'mul21',
        title: '(두 자리 수)×(한 자리 수)',
        gen(r, level) {
          let t = 1,
            u = 0,
            b = 2;
          for (let k = 0; k < 500; k++) {
            t = r.int(1, 9);
            u = r.int(0, 9);
            b = r.int(2, 9);
            const c1 = u * b >= 10;
            const c2 = t * b + Math.floor((u * b) / 10) >= 10;
            if (level === 1 && !c1 && !c2) break;
            if (level === 2 && c1 !== c2) break;
            if (level === 3 && c1 && c2) break;
          }
          const a = 10 * t + u;
          const p = a * b;
          const carry = Math.floor((u * b) / 10);
          return {
            q: `계산해 보세요. $$${a}\\times${b}$$`,
            answer: { type: 'num', value: p },
            steps: [
              `일의 자리: $${u}\\times${b}=${u * b}$${carry ? ` → $${(u * b) % 10}$ 쓰고 $${carry}$ 올림` : ''}`,
              `십의 자리: $${t}\\times${b}${carry ? `+${carry}` : ''}=${t * b + carry}$`,
              `따라서 $${a}\\times${b}=${p}$`,
            ],
          };
        },
      },
      {
        id: 'mul-word',
        title: '곱셈 문장제',
        gen(r, level) {
          const name = pickName(r);
          const b = r.int(2, 9);
          const a = level === 1 ? r.pick([10, 20, 30, 40, 11, 12, 21, 13, 31, 22, 32, 23, 33, 41]) : r.int(13, 98);
          if (level === 3) {
            if (r.chance(0.5)) {
              const p = r.pick([120, 150, 180, 250, 90, 85, 75, 60, 95].filter((x) => x * b < 1000));
              return {
                q: `${nm(name)}는 한 개에 $${p}$원인 지우개를 $${b}$개 사고 $1000$원을 냈습니다. 거스름돈은 얼마인가요?`,
                answer: { type: 'num', value: 1000 - p * b, unit: '원' },
                steps: [`지우개 값: $${p}\\times${b}=${p * b}$(원)`, `거스름돈: $1000-${p * b}=${1000 - p * b}$(원)`],
              };
            }
            const eaten = r.int(5, 30);
            return {
              q: `귤이 한 상자에 $${a}$개씩 $${b}$상자 있습니다. 그중 $${eaten}$개를 먹었다면 남은 귤은 몇 개인가요?`,
              answer: { type: 'num', value: a * b - eaten, unit: '개' },
              steps: [`전체 귤: $${a}\\times${b}=${a * b}$(개)`, `남은 귤: $${a * b}-${eaten}=${a * b - eaten}$(개)`],
            };
          }
          const tpl = r.int(0, 2);
          const q =
            tpl === 0
              ? `한 상자에 사과가 $${a}$개씩 들어 있습니다. $${b}$상자에 들어 있는 사과는 모두 몇 개인가요?`
              : tpl === 1
                ? `${nm(name)}는 동화책을 하루에 $${a}$쪽씩 읽습니다. $${b}$일 동안 읽은 동화책은 모두 몇 쪽인가요?`
                : `운동장에 학생들이 한 줄에 $${a}$명씩 $${b}$줄로 서 있습니다. 학생은 모두 몇 명인가요?`;
          return {
            q,
            answer: { type: 'num', value: a * b, unit: tpl === 0 ? '개' : tpl === 1 ? '쪽' : '명' },
            steps: [`같은 수를 여러 번 더하므로 곱셈: $${a}\\times${b}$`, `$${a}\\times${b}=${a * b}$`],
          };
        },
      },
      {
        id: 'mul-missing',
        title: '□ 안에 알맞은 수',
        gen(r, level) {
          if (level === 3) {
            const x = r.int(12, 49);
            const b = r.int(3, 9);
            return {
              q: `어떤 수에 $${b}$를 곱해야 할 것을 잘못하여 더했더니 $${x + b}$가 되었습니다. 바르게 계산하면 얼마인가요?`,
              answer: { type: 'num', value: x * b },
              steps: [`어떤 수 $+${b}=${x + b}$ → 어떤 수 $=${x + b}-${b}=${x}$`, `바르게 계산: $${x}\\times${b}=${x * b}$`],
              hint: '잘못 계산한 식으로 어떤 수부터 구해요.',
            };
          }
          const t = r.int(1, 9),
            u = r.int(1, 9),
            b = r.int(2, 9);
          const a = 10 * t + u;
          const p = a * b;
          if (level === 1) {
            return {
              q: `□ 안에 알맞은 숫자를 구하세요. $$${t}\\square\\times${b}=${p}$$`,
              answer: { type: 'num', value: u },
              steps: [`곱의 일의 자리가 $${p % 10}$이 되도록 $\\square\\times${b}$ 를 찾아봐요.`, `$${a}\\times${b}=${p}$ 이므로 $\\square=${u}$`],
              hint: '0부터 9까지 넣어 보며 확인해 보세요.',
            };
          }
          return {
            q: `□ 안에 알맞은 숫자를 구하세요. $$\\square${u}\\times${b}=${p}$$`,
            answer: { type: 'num', value: t },
            steps: [`일의 자리: $${u}\\times${b}=${u * b}$ → 올림 $${Math.floor((u * b) / 10)}$`, `$\\square\\times${b}+${Math.floor((u * b) / 10)}=${Math.floor(p / 10)}$ 이므로 $\\square=${t}$`],
          };
        },
      },
      {
        id: 'mul-compare',
        title: '곱의 크기 비교',
        gen(r, level) {
          if (level === 3) {
            const a = r.int(12, 39);
            const res = r.int(4, 8);
            const limit = a * res + r.int(1, a - 1);
            return {
              q: `□ 안에 들어갈 수 있는 한 자리 수 중에서 가장 큰 수를 구하세요. $$${a}\\times\\square<${limit}$$`,
              answer: { type: 'num', value: res },
              steps: [`$${a}\\times${res}=${a * res}$ 은 $${limit}$보다 작고, $${a}\\times${res + 1}=${a * (res + 1)}$ 은 $${limit}$보다 작지 않아요.`, `따라서 가장 큰 수는 $${res}$`],
            };
          }
          const items: { t: string; v: number }[] = [];
          const vals = new Set<number>();
          for (let k = 0; items.length < 4 && k < 300; k++) {
            const a = level === 1 ? r.pick([11, 12, 13, 20, 21, 22, 23, 30, 31, 32, 33, 40, 41, 42, 43]) : r.int(13, 98);
            const b = r.int(2, level === 1 ? 3 : 9);
            if (a * b > 99 && level === 1) continue;
            if (vals.has(a * b)) continue;
            vals.add(a * b);
            items.push({ t: `$${a}\\times${b}$`, v: a * b });
          }
          const big = r.chance(0.5);
          const sorted = items.slice().sort((x, y) => (big ? y.v - x.v : x.v - y.v));
          return {
            q: `곱이 가장 ${big ? '큰' : '작은'} 것은 어느 것인가요?`,
            answer: makeChoices(r, sorted[0].t, sorted.slice(1).map((x) => x.t), 4),
            steps: [...items.map((x) => `${x.t.slice(0, -1)}=${x.v}$`), `답: ${sorted[0].t}`],
          };
        },
      },
      {
        id: 'mul-cards',
        title: '수 카드로 곱셈식 만들기',
        gen(r, level) {
          const k = level === 3 ? 4 : 3;
          const cards = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], k);
          const cardTex = cards.map((x) => `\\boxed{${x}}`).join('\\;');
          if (level === 1) {
            const sorted = cards.slice().sort((a, b) => b - a);
            const two = sorted[0] * 10 + sorted[1];
            const one = sorted[2];
            return {
              q: `수 카드 $${cardTex}$ 중 $2$장으로 만들 수 있는 가장 큰 두 자리 수와 남은 카드의 수의 곱을 구하세요.`,
              answer: { type: 'num', value: two * one },
              steps: [`가장 큰 두 자리 수: $${two}$, 남은 수: $${one}$`, `$${two}\\times${one}=${two * one}$`],
            };
          }
          const want = level === 2 ? 'max' : r.pick(['max', 'min'] as const);
          let best = want === 'max' ? -1 : Infinity;
          let bestExpr = '';
          for (const x of cards)
            for (const y of cards)
              for (const z of cards) {
                if (x === y || y === z || x === z) continue;
                const v = (10 * x + y) * z;
                if ((want === 'max' && v > best) || (want === 'min' && v < best)) {
                  best = v;
                  bestExpr = `${10 * x + y}\\times${z}`;
                }
              }
          return {
            q: `수 카드 $${cardTex}$ 중 $3$장을 한 번씩 골라 (두 자리 수)$\\times$(한 자리 수)를 만들려고 합니다. 곱이 가장 ${want === 'max' ? '큰' : '작은'} 곱셈식의 곱을 구하세요.`,
            answer: { type: 'num', value: best },
            steps: [
              want === 'max' ? '곱하는 한 자리 수에 큰 수를 놓을수록 곱이 커지기 쉬워요. 가능한 경우를 비교해요.' : '십의 자리와 곱하는 수에 작은 수를 놓아 비교해요.',
              `가장 ${want === 'max' ? '큰' : '작은'} 곱: $${bestExpr}=${best}$`,
            ],
            hint: '곱하는 수(한 자리)는 두 자리 수의 십의 자리와 일의 자리에 모두 곱해져요.',
          };
        },
      },
    ],
  },

  // ═════════════ e3a-5 길이와 시간 ═════════════
  'e3a-5': {
    concepts: [
      {
        title: '1 cm보다 작은 단위 mm',
        body: '$1$ cm를 $10$칸으로 똑같이 나눈 한 칸의 길이를 $1$ mm(밀리미터)라고 해요.\n$$1\\text{ cm}=10\\text{ mm}$$\n- $5$ cm $3$ mm $= 53$ mm',
      },
      {
        title: '1 m보다 큰 단위 km',
        body: '$1000$ m를 $1$ km(킬로미터)라고 해요.\n$$1\\text{ km}=1000\\text{ m}$$\n- $2$ km $300$ m $= 2300$ m, $2$ km $30$ m $= 2030$ m 처럼 자리를 조심해요.',
      },
      {
        title: '1분보다 작은 단위 초',
        body: '초바늘이 작은 눈금 한 칸을 가는 데 걸리는 시간이 $1$초예요. 초바늘이 한 바퀴 돌면 $60$초 $=1$분이에요.\n- $2$분 $15$초 $= 120+15 = 135$초',
      },
      {
        title: '시간의 덧셈과 뺄셈',
        body: '시는 시끼리, 분은 분끼리, 초는 초끼리 계산해요.\n- 초나 분의 합이 $60$이 넘으면 $60$초 $=1$분, $60$분 $=1$시간으로 받아올림해요.\n- 뺄 수 없으면 $1$분 $=60$초, $1$시간 $=60$분으로 받아내림해요.',
        example: { q: '$2$시 $40$분 $+$ $35$분', a: '$40+35=75$분 $=1$시간 $15$분 → $3$시 $15$분' },
      },
    ],
    skills: [
      {
        id: 'len-convert',
        title: '길이 단위 바꾸기',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(1, 30),
              b = r.int(1, 9);
            if (r.chance(0.5))
              return {
                q: `□ 안에 알맞은 수를 구하세요. $$${a}\\text{ cm }${b}\\text{ mm}=\\square\\text{ mm}$$`,
                answer: { type: 'num', value: a * 10 + b, unit: 'mm' },
                steps: [`$${a}$ cm $=${a * 10}$ mm`, `$${a * 10}+${b}=${a * 10 + b}$ (mm)`],
              };
            return {
              q: `$${a * 10 + b}$ mm는 몇 cm 몇 mm인가요?`,
              answer: { type: 'fields', fields: [{ label: 'cm', value: a }, { label: 'mm', value: b }] },
              steps: [`$10$ mm $=1$ cm 이므로 $${a * 10}$ mm $=${a}$ cm`, `$${a * 10 + b}$ mm $=${a}$ cm $${b}$ mm`],
            };
          }
          if (level === 2) {
            const a = r.int(1, 9);
            const b = r.pick([r.int(100, 999), r.int(10, 99), r.int(100, 999)]);
            if (r.chance(0.5))
              return {
                q: `□ 안에 알맞은 수를 구하세요. $$${a}\\text{ km }${b}\\text{ m}=\\square\\text{ m}$$`,
                answer: { type: 'num', value: a * 1000 + b, unit: 'm' },
                steps: [`$${a}$ km $=${a * 1000}$ m`, `$${a * 1000}+${b}=${c(a * 1000 + b)}$ (m)`],
                hint: b < 100 ? '십의 자리, 백의 자리를 조심하세요.' : undefined,
              };
            return {
              q: `$${c(a * 1000 + b)}$ m는 몇 km 몇 m인가요?`,
              answer: { type: 'fields', fields: [{ label: 'km', value: a }, { label: 'm', value: b }] },
              steps: [`$1000$ m $=1$ km 이므로 $${a * 1000}$ m $=${a}$ km`, `$${c(a * 1000 + b)}$ m $=${a}$ km $${b}$ m`],
            };
          }
          const k = r.int(2, 8);
          const x = r.int(1, 9),
            y = r.int(1, 9);
          if (x === y) return { q: `$${k}$ km $${x}0$ m는 몇 m인가요?`, answer: { type: 'num', value: k * 1000 + x * 10, unit: 'm' }, steps: [`$${k}$ km $=${k * 1000}$ m`, `$${k * 1000}+${x * 10}=${c(k * 1000 + x * 10)}$ (m)`] };
          const opts = [
            { t: `$${k}$ km $${x}${y}0$ m`, v: k * 1000 + x * 100 + y * 10 },
            { t: `$${c(k * 1000 + y * 100 + x * 10)}$ m`, v: k * 1000 + y * 100 + x * 10 },
            { t: `$${k}$ km $${x}${y}$ m`, v: k * 1000 + x * 10 + y },
            { t: `$${c(k * 1000 + y * 10 + x)}$ m`, v: k * 1000 + y * 10 + x },
          ];
          const sorted = opts.slice().sort((p, q) => q.v - p.v);
          return {
            q: '가장 긴 길이는 어느 것인가요?',
            answer: makeChoices(r, sorted[0].t, sorted.slice(1).map((o) => o.t), 4),
            steps: [...opts.map((o) => `${o.t} $=${c(o.v)}$ m`), `가장 긴 것: ${sorted[0].t}`],
            hint: '모두 m 단위로 바꾸어 비교해요.',
          };
        },
      },
      {
        id: 'len-calc',
        title: '길이의 합과 차',
        gen(r, level) {
          const big = level === 1 ? 'cm' : level === 2 ? r.pick(['cm', 'km']) : 'km';
          const small = big === 'cm' ? 'mm' : 'm';
          const f = big === 'cm' ? 10 : 1000;
          const add = r.chance(0.5);
          let a = 0,
            b = 0;
          for (let t = 0; t < 300; t++) {
            a = r.int(big === 'cm' ? 3 : 2, big === 'cm' ? 25 : 9) * f + r.int(1, f - 1);
            b = r.int(1, big === 'cm' ? 15 : 6) * f + r.int(1, f - 1);
            if (!add && a <= b) continue;
            const carry = add ? (a % f) + (b % f) >= f : a % f < b % f;
            if ((level === 1 && !carry) || (level >= 2 && carry)) break;
          }
          const res = add ? a + b : a - b;
          const fmt = (v: number) => `$${Math.floor(v / f)}$ ${big} $${v % f}$ ${small}`;
          const ax = Math.floor(a / f),
            ay = a % f,
            bx = Math.floor(b / f),
            by = b % f;
          const steps = add
            ? [
                `${small}끼리: $${ay}+${by}=${ay + by}$${ay + by >= f ? ` → $${f}$ ${small}$=1$ ${big} 받아올림` : ''}`,
                `${big}끼리: $${ax}+${bx}${ay + by >= f ? '+1' : ''}=${Math.floor(res / f)}$`,
                `답: ${fmt(res)}`,
              ]
            : [
                ay < by ? `${small}끼리 뺄 수 없으므로 $1$ ${big}$=${f}$ ${small} 받아내림: $${ay + f}-${by}=${ay + f - by}$` : `${small}끼리: $${ay}-${by}=${ay - by}$`,
                `${big}끼리: $${ax}${ay < by ? '-1' : ''}-${bx}=${Math.floor(res / f)}$`,
                `답: ${fmt(res)}`,
              ];
          return {
            q: `계산해 보세요.\n${fmt(a)} ${add ? '+' : '−'} ${fmt(b)}`,
            answer: { type: 'fields', fields: [{ label: big, value: Math.floor(res / f) }, { label: small, value: res % f }] },
            steps,
          };
        },
      },
      {
        id: 'time-convert',
        title: '시간 단위 바꾸기',
        gen(r, level) {
          if (level === 1) {
            const m = r.int(1, 9),
              s = r.int(0, 59);
            return {
              q: `□ 안에 알맞은 수를 구하세요. $$${m}\\text{분 }${s ? `${s}\\text{초}` : ''}=\\square\\text{초}$$`,
              answer: { type: 'num', value: m * 60 + s, unit: '초' },
              steps: [`$1$분 $=60$초 이므로 $${m}$분 $=${m * 60}$초`, ...(s ? [`$${m * 60}+${s}=${m * 60 + s}$(초)`] : [])],
            };
          }
          if (level === 2) {
            const t = r.int(70, 590);
            return {
              q: `$${t}$초는 몇 분 몇 초인가요?`,
              answer: { type: 'fields', fields: [{ label: '분', value: Math.floor(t / 60) }, { label: '초', value: t % 60 }] },
              steps: [`$60$초 $=1$분. $${t}$ 안에 $60$이 $${Math.floor(t / 60)}$번 들어가요: $60\\times${Math.floor(t / 60)}=${60 * Math.floor(t / 60)}$`, `남는 초: $${t}-${60 * Math.floor(t / 60)}=${t % 60}$ → $${Math.floor(t / 60)}$분 $${t % 60}$초`],
            };
          }
          if (r.chance(0.5)) {
            const h = r.int(1, 4),
              m = r.int(1, 59);
            return {
              q: `$${h}$시간 $${m}$분은 모두 몇 분인가요?`,
              answer: { type: 'num', value: h * 60 + m, unit: '분' },
              steps: [`$1$시간 $=60$분 이므로 $${h}$시간 $=${h * 60}$분`, `$${h * 60}+${m}=${h * 60 + m}$(분)`],
            };
          }
          const t = r.int(130, 400);
          return {
            q: `$${t}$분은 몇 시간 몇 분인가요?`,
            answer: { type: 'fields', fields: [{ label: '시간', value: Math.floor(t / 60) }, { label: '분', value: t % 60 }] },
            steps: [`$60$분 $=1$시간: $60\\times${Math.floor(t / 60)}=${60 * Math.floor(t / 60)}$`, `$${t}-${60 * Math.floor(t / 60)}=${t % 60}$ → $${Math.floor(t / 60)}$시간 $${t % 60}$분`],
          };
        },
      },
      {
        id: 'time-calc',
        title: '시간의 덧셈과 뺄셈',
        gen(r, level) {
          if (level === 1) {
            const h = r.int(1, 10),
              m = r.int(0, 11) * 5;
            const add = r.int(5, 59 - m > 5 ? 59 - m : 5);
            const tm = m + add;
            const fh = tm >= 60 ? h + 1 : h;
            return {
              q: `시계가 나타내는 시각에서 $${add}$분 후는 몇 시 몇 분인가요?`,
              fig: clock(h, m),
              answer: { type: 'fields', fields: [{ label: '시', value: fh }, { label: '분', value: tm % 60 }] },
              steps: [`시계의 시각: $${h}$시 $${m}$분`, `$${m}+${add}=${tm}$(분)${tm >= 60 ? ` → $1$시간 $${tm - 60}$분` : ''}`, `답: $${fh}$시 $${tm % 60}$분`],
            };
          }
          if (level === 2) {
            const h1 = r.int(1, 5),
              m1 = r.int(20, 59),
              h2 = r.int(1, 4),
              m2 = r.int(60 - m1, 59);
            const add = r.chance(0.5);
            if (add) {
              const tm = m1 + m2;
              return {
                q: `계산해 보세요.\n$${h1}$시간 $${m1}$분 $+$ $${h2}$시간 $${m2}$분`,
                answer: { type: 'fields', fields: [{ label: '시간', value: h1 + h2 + 1 }, { label: '분', value: tm - 60 }] },
                steps: [`분끼리: $${m1}+${m2}=${tm}$분 $=1$시간 $${tm - 60}$분`, `시간끼리: $${h1}+${h2}+1=${h1 + h2 + 1}$`, `답: $${h1 + h2 + 1}$시간 $${tm - 60}$분`],
              };
            }
            const H = h1 + h2 + 1,
              M = r.int(0, m1 - 1);
            return {
              q: `계산해 보세요.\n$${H}$시 $${M}$분 $-$ $${h1}$시간 $${m1}$분`,
              answer: { type: 'fields', fields: [{ label: '시', value: H - 1 - h1 }, { label: '분', value: M + 60 - m1 }] },
              steps: [`분끼리 뺄 수 없으므로 $1$시간 $=60$분 받아내림: $${M}+60-${m1}=${M + 60 - m1}$`, `시끼리: $${H}-1-${h1}=${H - 1 - h1}$`, `답: $${H - 1 - h1}$시 $${M + 60 - m1}$분`],
            };
          }
          const H = r.int(5, 11),
            M = r.int(1, 30),
            S = r.int(0, 30);
          const h = r.int(1, H - 2),
            m = r.int(M + 1, 59),
            s = r.int(S + 1, 59);
          const a = H * 3600 + M * 60 + S,
            b = h * 3600 + m * 60 + s;
          const dlt = a - b;
          const rh = Math.floor(dlt / 3600),
            rm = Math.floor((dlt % 3600) / 60),
            rs = dlt % 60;
          return {
            q: `두 시각 사이의 시간을 구하세요.\n$${H}$시 $${M}$분 $${S}$초 $-$ $${h}$시 $${m}$분 $${s}$초`,
            answer: { type: 'fields', fields: [{ label: '시간', value: rh }, { label: '분', value: rm }, { label: '초', value: rs }] },
            steps: [
              `초끼리 뺄 수 없으므로 $1$분 받아내림: $${S}+60-${s}=${S + 60 - s}$(초)`,
              `분끼리: $${M}-1$에서 $${m}$을 뺄 수 없으므로 $1$시간 받아내림: $${M - 1}+60-${m}=${M + 59 - m}$(분)`,
              `시끼리: $${H}-1-${h}=${H - 1 - h}$(시간)`,
              `답: $${rh}$시간 $${rm}$분 $${rs}$초`,
            ],
          };
        },
      },
      {
        id: 'time-word',
        title: '시간 문장제',
        gen(r, level) {
          const name = pickName(r);
          if (level === 1) {
            const h = r.int(1, 9),
              m = r.int(0, 5) * 10;
            const dur = r.int(65, 130);
            const end = h * 60 + m + dur;
            return {
              q: `${name}네 가족은 $${h}$시 $${m}$분에 시작하는 영화를 보았습니다. 영화 상영 시간이 $${dur}$분이라면 영화가 끝난 시각은 몇 시 몇 분인가요?`,
              answer: { type: 'fields', fields: [{ label: '시', value: Math.floor(end / 60) }, { label: '분', value: end % 60 }] },
              steps: [`$${dur}$분 $=${Math.floor(dur / 60)}$시간 $${dur % 60}$분`, `$${h}$시 $${m}$분 $+$ $${Math.floor(dur / 60)}$시간 $${dur % 60}$분 $=${Math.floor(end / 60)}$시 $${end % 60}$분`],
            };
          }
          if (level === 2) {
            const h1 = r.int(8, 11),
              m1 = r.int(1, 11) * 5,
              dur = r.int(70, 200);
            const e = h1 * 60 + m1 + dur;
            const ePM = Math.floor(e / 60);
            return {
              q: `${nm(name)}는 오전 $${h1}$시 $${m1}$분에 등산을 시작하여 ${ePM >= 12 ? '오후' : '오전'} $${ePM > 12 ? ePM - 12 : ePM}$시 $${e % 60}$분에 내려왔습니다. 등산하는 데 걸린 시간은 몇 시간 몇 분인가요?`,
              answer: { type: 'fields', fields: [{ label: '시간', value: Math.floor(dur / 60) }, { label: '분', value: dur % 60 }] },
              steps: [
                ePM >= 12 ? `오후 $${ePM > 12 ? ePM - 12 : 12}$시는 $${ePM}$시와 같아요.` : `둘 다 오전이에요.`,
                `$${ePM}$시 $${e % 60}$분 $-$ $${h1}$시 $${m1}$분 $=${Math.floor(dur / 60)}$시간 $${dur % 60}$분`,
              ],
            };
          }
          const [n1, n2] = pick2Names(r);
          const t1 = r.int(62, 130),
            t2 = r.int(40, t1 - 3);
          return {
            q: `달리기 기록이 ${n1}는 $${Math.floor(t1 / 60)}$분 $${t1 % 60}$초, ${n2}는 $${t2 >= 60 ? `${Math.floor(t2 / 60)}$분 $${t2 % 60}` : t2}$초입니다. 누가 몇 초 더 빨리 달렸나요? (더 빨리 달린 사람과의 기록 차이를 초로 쓰세요.)`,
            answer: { type: 'num', value: t1 - t2, unit: '초' },
            steps: [`${n1}: $${t1}$초, ${n2}: $${t2}$초`, `걸린 시간이 짧은 ${n2}가 더 빨라요.`, `차이: $${t1}-${t2}=${t1 - t2}$(초)`],
            hint: '모두 초 단위로 바꾸어요.',
          };
        },
      },
      {
        id: 'unit-choose',
        title: '알맞은 단위 고르기',
        gen(r) {
          const it = r.pick(UNIT_BANK);
          const pool = ['mm', 'cm', 'm', 'km', '초', '분', '시간'];
          const sameKind = ['초', '분', '시간'].includes(it.a) ? ['초', '분', '시간'] : ['mm', 'cm', 'm', 'km'];
          const wrongs = pool.filter((u) => u !== it.a && sameKind.includes(u));
          return {
            q: `□ 안에 알맞은 단위를 고르세요.\n${it.q} □입니다.`,
            answer: makeChoices(r, it.a, wrongs, 4),
            steps: [`실제 크기를 떠올려 보면 ${it.q} ${it.a}${josa(it.a, '이/가')} 알맞아요.`],
          };
        },
      },
    ],
  },

  // ═════════════ e3a-6 분수와 소수 ═════════════
  'e3a-6': {
    concepts: [
      {
        title: '똑같이 나누기와 분수',
        body: '전체를 **똑같이** $4$로 나눈 것 중의 $3$을 $\\frac{3}{4}$ 이라 쓰고 "4분의 3"이라고 읽어요.\n- 아래쪽 $4$는 **분모**, 위쪽 $3$은 **분자**예요.\n- 모양과 크기가 같게 나누어야 분수로 나타낼 수 있어요.',
        example: { q: '피자 $8$조각 중 $3$조각은 전체의 얼마?', a: '$\\frac{3}{8}$' },
      },
      {
        title: '단위분수',
        body: '$\\frac{1}{2}, \\frac{1}{3}, \\frac{1}{4}$ 처럼 분자가 $1$인 분수를 **단위분수**라고 해요.\n- 단위분수는 **분모가 클수록 작아요**: $\\frac{1}{2}>\\frac{1}{3}>\\frac{1}{4}$ (더 많이 나눌수록 한 조각이 작아져요)\n- $\\frac{3}{5}$ 은 $\\frac{1}{5}$ 이 $3$개예요.',
      },
      {
        title: '분모가 같은 분수의 크기 비교',
        body: '분모가 같으면 **분자가 클수록** 큰 분수예요. $\\frac{4}{7}>\\frac{2}{7}$ ($\\frac{1}{7}$ 이 $4$개와 $2$개)',
      },
      {
        title: '소수 한 자리',
        body: '$\\frac{1}{10}$ 을 $0.1$ 이라 쓰고 "영 점 일"이라고 읽어요.\n- $0.1$이 $7$개이면 $0.7$, $2$와 $0.7$만큼이면 $2.7$ ("이 점 칠")\n- $1$ cm $=10$ mm 이므로 $1$ mm $=0.1$ cm, $4$ cm $3$ mm $=4.3$ cm',
      },
      {
        title: '소수의 크기 비교',
        body: '자연수 부분을 먼저 비교하고, 같으면 소수 부분을 비교해요. $3.2<3.5$, $4.1>3.9$\n- $0.1$이 몇 개인지 세어 비교해도 돼요.',
      },
    ],
    skills: [
      {
        id: 'frac-fig',
        title: '그림을 분수로 나타내기',
        gen(r, level) {
          const n = level === 1 ? r.int(2, 6) : r.pick([4, 6, 8, 10, 12, 5, 7, 9]);
          const k = r.int(1, n - 1);
          const kind = r.pick(['circle', 'bar', 'grid'] as const);
          const fig = fracFig(n, k, kind);
          if (level === 3 && n - 2 * k > 0) {
            return {
              q: `색칠하지 않은 부분은 색칠한 부분보다 $${fr(1, n)}$이 몇 개 더 많은가요?`,
              fig,
              answer: { type: 'num', value: n - 2 * k, unit: '개' },
              steps: [`색칠한 부분: $${fr(k, n)}$, 색칠하지 않은 부분: $${fr(n - k, n)}$`, `$${fr(1, n)}$이 $${k}$개와 $${n - k}$개 → $${n - k}-${k}=${n - 2 * k}$(개)`],
            };
          }
          const unshaded = level >= 2 && r.chance(0.5);
          const v = unshaded ? n - k : k;
          return {
            q: `${unshaded ? '색칠하지 않은' : '색칠한'} 부분은 전체의 얼마인지 분수로 나타낸 것은?`,
            fig,
            answer: makeChoices(r, `$${fr(v, n)}$`, [`$${fr(n - v, n)}$`, `$${fr(v, n - v)}$`, `$${fr(n, v)}$`, `$${fr(v, n + 1)}$`].filter((s) => !s.includes('{0}')), 4, (i) => `$${fr(((v + i) % (n - 1)) + 1, n)}$`),
            steps: [`전체를 똑같이 $${n}$으로 나누었어요.`, `${unshaded ? '색칠하지 않은' : '색칠한'} 부분은 $${v}$칸 → $${fr(v, n)}$`],
          };
        },
      },
      {
        id: 'unit-frac-compare',
        title: '분수의 크기 비교',
        gen(r, level) {
          if (level === 3) {
            if (r.chance(0.5)) {
              const m = r.int(5, 12);
              return {
                q: `□ 안에 들어갈 수 있는 $1$보다 큰 자연수는 모두 몇 개인가요? $$\\frac{1}{\\square}>${fr(1, m)}$$`,
                answer: { type: 'num', value: m - 2, unit: '개' },
                steps: [`단위분수는 분모가 작을수록 커요. 그러므로 □는 $${m}$보다 작아야 해요.`, `$1$보다 큰 수: $2$부터 $${m - 1}$까지 → $${m - 2}$개`],
              };
            }
            const p = r.int(2, 5),
              m = r.int(p + 3, 12);
            return {
              q: `□ 안에 들어갈 수 있는 자연수는 모두 몇 개인가요? $$${fr(1, m)}<\\frac{1}{\\square}<${fr(1, p)}$$`,
              answer: { type: 'num', value: m - p - 1, unit: '개' },
              steps: [`단위분수는 분모가 작을수록 커요. □는 $${p}$보다 크고 $${m}$보다 작아요.`, `$${p + 1}$부터 $${m - 1}$까지 → $${m - p - 1}$개`],
            };
          }
          const big = r.chance(0.5);
          if (level === 1) {
            const ds = r.sample([2, 3, 4, 5, 6, 7, 8, 9, 10], 4).sort((a, b) => a - b);
            const ans = big ? ds[0] : ds[3];
            return {
              q: `가장 ${big ? '큰' : '작은'} 분수는 어느 것인가요?`,
              answer: makeChoices(r, `$${fr(1, ans)}$`, ds.filter((x) => x !== ans).map((x) => `$${fr(1, x)}$`), 4),
              steps: ['단위분수는 분모가 클수록 작아요.', `가장 ${big ? '큰' : '작은'} 분수: $${fr(1, ans)}$`],
            };
          }
          const den = r.int(6, 12);
          const nums = r.sample(Array.from({ length: den - 1 }, (_, i) => i + 1), 4).sort((a, b) => a - b);
          const ans = big ? nums[3] : nums[0];
          return {
            q: `가장 ${big ? '큰' : '작은'} 분수는 어느 것인가요?`,
            answer: makeChoices(r, `$${fr(ans, den)}$`, nums.filter((x) => x !== ans).map((x) => `$${fr(x, den)}$`), 4),
            steps: [`분모가 같으면 분자가 ${big ? '클' : '작을'}수록 ${big ? '커요' : '작아요'}.`, `답: $${fr(ans, den)}$`],
          };
        },
      },
      {
        id: 'part-whole',
        title: '분수 문장제',
        gen(r, level) {
          const name = pickName(r);
          const thing = r.pick([
            { w: '피자', u: '조각' },
            { w: '케이크', u: '조각' },
            { w: '색 테이프', u: '도막' },
            { w: '초콜릿', u: '칸' },
          ]);
          let n = 2,
            a = 1,
            b = 1;
          for (let t = 0; t < 300; t++) {
            n = r.int(4, 12);
            a = r.int(1, n - 2);
            b = level === 3 ? r.int(1, n - a - 1) : 0;
            const ans = level === 1 ? a : n - a - b;
            if (gcd(ans, n) === 1 && ans > 0) break;
          }
          if (level === 1)
            return {
              q: `${J(thing.w, '을/를')} 똑같이 $${n}$${thing.u}으로 나누어 ${nm(name)}가 $${a}$${thing.u}을 먹었습니다. ${name}가 먹은 ${J(thing.w, '은/는')} 전체의 몇 분의 몇인가요?`,
              answer: { type: 'num', value: a / n, display: 'frac' },
              steps: [`전체 $${n}$${thing.u} 중 $${a}$${thing.u} → $${fr(a, n)}$`],
            };
          if (level === 2)
            return {
              q: `${J(thing.w, '을/를')} 똑같이 $${n}$${thing.u}으로 나누어 ${nm(name)}가 $${a}$${thing.u}을 먹었습니다. 남은 ${J(thing.w, '은/는')} 전체의 몇 분의 몇인가요?`,
              answer: { type: 'num', value: (n - a) / n, display: 'frac' },
              steps: [`남은 ${thing.u}: $${n}-${a}=${n - a}$`, `남은 부분: $${fr(n - a, n)}$`],
            };
          const [n1, n2] = pick2Names(r);
          return {
            q: `${J(thing.w, '을/를')} 똑같이 $${n}$${thing.u}으로 나누었습니다. ${n1}가 $${a}$${thing.u}, ${n2}가 $${b}$${thing.u}을 먹었다면 남은 ${J(thing.w, '은/는')} 전체의 몇 분의 몇인가요?`,
            answer: { type: 'num', value: (n - a - b) / n, display: 'frac' },
            steps: [`먹은 ${thing.u}: $${a}+${b}=${a + b}$`, `남은 ${thing.u}: $${n}-${a + b}=${n - a - b}$ → $${fr(n - a - b, n)}$`],
          };
        },
      },
      {
        id: 'decimal-read',
        title: '소수로 나타내기',
        gen(r, level) {
          if (level === 1) {
            if (r.chance(0.5)) {
              const k = r.int(2, 99);
              if (k % 10 === 0) return { q: `$0.1$이 $${k}$개인 수는 얼마인가요?`, answer: { type: 'num', value: k / 10, display: 'dec' }, steps: [`$0.1$이 $10$개이면 $1$이에요.`, `$0.1$이 $${k}$개이면 $${k / 10}$`] };
              return {
                q: `$0.1$이 $${k}$개인 수를 소수로 나타내세요.`,
                answer: { type: 'num', value: round(k / 10), display: 'dec' },
                steps: [`$0.1$이 $10$개이면 $1$이에요.`, `$${k}$개 $=${Math.floor(k / 10)}$과 $0.1$이 $${k % 10}$개 → $${round(k / 10)}$`],
              };
            }
            const a = r.int(1, 9),
              b = r.int(1, 9);
            return {
              q: `$${a}$와 $0.${b}$만큼을 소수로 나타내세요.`,
              answer: { type: 'num', value: round(a + b / 10), display: 'dec' },
              steps: [`$${a}+0.${b}=${a}.${b}$`],
            };
          }
          if (level === 2) {
            const a = r.int(1, 20),
              b = r.int(1, 9);
            if (r.chance(0.5))
              return {
                q: `□ 안에 알맞은 소수를 구하세요. $$${a}\\text{ cm }${b}\\text{ mm}=\\square\\text{ cm}$$`,
                answer: { type: 'num', value: round(a + b / 10), unit: 'cm', display: 'dec' },
                steps: [`$1$ mm $=0.1$ cm 이므로 $${b}$ mm $=0.${b}$ cm`, `$${a}$ cm $${b}$ mm $=${a}.${b}$ cm`],
              };
            return {
              q: `$${a * 10 + b}$ mm는 몇 cm인지 소수로 나타내세요.`,
              answer: { type: 'num', value: round(a + b / 10), unit: 'cm', display: 'dec' },
              steps: [`$10$ mm $=1$ cm, $1$ mm $=0.1$ cm`, `$${a * 10 + b}$ mm $=${a}$ cm $${b}$ mm $=${a}.${b}$ cm`],
            };
          }
          const base = r.int(0, 5);
          const t = r.int(1, 19);
          if (t === 10) return { q: `수직선에서 $${base}$보다 $1$ 큰 수는 얼마인가요?`, fig: numberLine(base, base + 2, { step: 0.1, labelEvery: 10 }), answer: { type: 'num', value: base + 1 }, steps: [`$${base}+1=${base + 1}$`] };
          const v = round(base + t / 10);
          return {
            q: '수직선에서 ↓가 가리키는 수를 소수로 나타내세요.',
            fig: numberLine(base, base + 2, { step: 0.1, labelEvery: 10, points: [{ x: v, label: '↓' }] }),
            answer: { type: 'num', value: v, display: 'dec' },
            steps: [`작은 눈금 한 칸은 $1$을 $10$칸으로 나눈 것이므로 $0.1$이에요.`, `$${base}$에서 $${t}$칸 → $${v}$`],
          };
        },
      },
      {
        id: 'decimal-compare',
        title: '소수의 크기 비교',
        gen(r, level) {
          if (level === 3) {
            const a = r.int(1, 9),
              b = r.int(2, 9);
            const less = b === 9 ? true : r.chance(0.5); // 답이 0개가 되지 않게
            const cnt = less ? b : 9 - b;
            return {
              q: `$0$부터 $9$까지의 수 중에서 □ 안에 들어갈 수 있는 수는 모두 몇 개인가요? $$${a}.\\square ${less ? '<' : '>'} ${a}.${b}$$`,
              answer: { type: 'num', value: cnt, unit: '개' },
              steps: [`자연수 부분이 같으므로 소수 첫째 자리를 비교해요.`, less ? `□는 $${b}$보다 작은 수: $0$부터 $${b - 1}$까지 → $${cnt}$개` : b === 8 ? `□는 $8$보다 큰 수: $9$ → $1$개` : `□는 $${b}$보다 큰 수: $${b + 1}$부터 $9$까지 → $${cnt}$개`],
            };
          }
          const big = r.chance(0.5);
          let vals: number[];
          if (level === 1) vals = r.sample(Array.from({ length: 50 }, (_, i) => i + 1), 4);
          else {
            // 보기 2개는 분수(10분의 몇), 2개는 소수
            const fk = r.sample(Array.from({ length: 9 }, (_, i) => i + 1), 2);
            const dk = r.sample(Array.from({ length: 30 }, (_, i) => i + 1).filter((k) => !fk.includes(k)), 2);
            vals = [dk[0], fk[0], dk[1], fk[1]];
          }
          const items = vals.map((k, i) => {
            const v = k / 10;
            if (level === 2 && i % 2 === 1) return { t: `$${fr(k, 10)}$`, v };
            return { t: `$${round(v)}$`, v };
          });
          const sorted = items.slice().sort((x, y) => (big ? y.v - x.v : x.v - y.v));
          return {
            q: `가장 ${big ? '큰' : '작은'} 수는 어느 것인가요?`,
            answer: makeChoices(r, sorted[0].t, sorted.slice(1).map((x) => x.t), 4),
            steps: [level === 2 ? `분수 $${fr(1, 10)}$ $=0.1$ 이므로 모두 소수로 바꾸어 비교해요.` : '자연수 부분을 먼저, 같으면 소수 부분을 비교해요.', `답: ${sorted[0].t}`],
          };
        },
      },
    ],
  },
};

