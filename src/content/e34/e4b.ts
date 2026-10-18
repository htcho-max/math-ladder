// 초4-2 콘텐츠
import type { ContentMap, Level, ProblemDraft } from '../../core/types';
import type { Rng } from '../../core/rng';
import { Svg, lineChart, regularPolygon } from '../../core/fig';
import { makeChoices } from '../../core/tex';
import { gcd, round } from '../../core/nt';
import { J, c, d, fr, mx, pick2Names, pickName, polyFig } from './util';
import { anglePoly } from './e4a';

// ───────── 분수 도우미 ─────────
/** 결과 분수(분자 n / 분모 den)의 분수 부분이 약분되지 않는 꼴인지 (4학년은 약분을 배우지 않음) */
const fracOk = (n: number, den: number) => n % den === 0 || gcd(n % den, den) === 1;
const fx = (n: number, den: number) => (n >= den ? mx(n, den) : fr(n, den));
const DENS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/** 조건을 만족할 때까지 다시 뽑기 */
function until<T>(gen: () => T, ok: (x: T) => boolean): T {
  let x = gen();
  for (let i = 0; i < 500 && !ok(x); i++) x = gen();
  return x;
}

// ───────── 소수 도우미 (천분의 일 단위 정수로 계산) ─────────
const D = (milli: number) => d(milli / 1000);
function decNum(r: Rng, places: number, lo: number, hi: number): number {
  // lo~hi 사이, 소수 places 자리 (끝자리 0 아님) → 천분의 일 정수
  const f = 10 ** (3 - places);
  for (;;) {
    const v = r.int(lo * 10 ** places, hi * 10 ** places);
    if (v % 10 !== 0 || places === 0) return v * f;
  }
}

// ───────── 꺾은선그래프 자료 ─────────
const LINE_THEMES = [
  { title: '어느 날의 운동장 기온', labels: ['9시', '10시', '11시', '12시', '1시', '2시'], unit: '°C', what: '기온', lo: 6, hi: 30, t1: 1, t2: 2, up: false },
  { title: '강낭콩 싹의 키', labels: ['1일', '3일', '5일', '7일', '9일', '11일'], unit: 'cm', what: '키', lo: 1, hi: 30, t1: 1, t2: 2, up: true },
  { title: '월별 강수량', labels: ['3월', '4월', '5월', '6월', '7월', '8월'], unit: 'mm', what: '강수량', lo: 20, hi: 250, t1: 5, t2: 10, up: false },
  { title: '연도별 학교 학생 수', labels: ['2019년', '2020년', '2021년', '2022년', '2023년', '2024년'], unit: '명', what: '학생 수', lo: 250, hi: 420, t1: 5, t2: 10, up: false },
];
function lineData(r: Rng, level: Level) {
  const th = r.pick(LINE_THEMES);
  const n = level === 1 ? 5 : 6;
  const labels = th.labels.slice(0, n);
  const tick = level === 1 ? th.t1 : th.t2;
  const loT = Math.ceil(th.lo / tick),
    hiT = Math.floor(th.hi / tick);
  let vt: number[] = [];
  for (let t = 0; t < 500; t++) {
    if (th.up) {
      let v = r.int(1, 3);
      vt = [v];
      for (let i = 1; i < n; i++) vt.push((v += r.int(1, 2)));
    } else {
      const base = r.int(loT, Math.max(loT, hiT - 10));
      vt = Array.from({ length: n }, () => base + r.int(0, 10));
    }
    const diffs = vt.slice(1).map((v, i) => Math.abs(v - vt[i]));
    const mxd = Math.max(...diffs);
    if (diffs.filter((x) => x === mxd).length === 1 && diffs.every((x) => x > 0) && new Set(vt).size === n) break;
  }
  const minT = Math.max(0, Math.min(...vt) - 1);
  const maxT = Math.max(...vt) + 1;
  const vals = vt.map((v) => v * tick);
  const raw = lineChart(labels, vals, { unit: th.unit, min: minT * tick, max: maxT * tick, step: tick });
  const fig = minT > 0 ? addWave(raw) : raw;
  return { th, labels, vals, tick, fig, wave: minT > 0 };
}
/** 세로축 아래쪽(0 과 첫 눈금 사이)에 물결선(≈)을 그려 넣음. lineChart 의 좌표(left=40, bottom=170)에 맞춤 */
function addWave(svg: string): string {
  const mark =
    '<line x1="34" y1="172" x2="34" y2="174"/>' +
    '<path d="M27,176 q3,-3 6,0 t6,0" class="nofill"/>' +
    '<path d="M27,181 q3,-3 6,0 t6,0" class="nofill"/>' +
    '<line x1="34" y1="183" x2="34" y2="186"/>' +
    '<text x="30" y="193" text-anchor="end" dominant-baseline="middle" font-size="10" class="muted">0</text>';
  return svg.replace(/<\/svg>\s*$/, mark + '</svg>');
}

// ───────── 삼각형 그림 ─────────
function isoFig(apex: number, o: { side?: string; base?: string; angles?: (string | null)[]; ticks?: boolean } = {}): string {
  const b = (180 - apex) / 2;
  const rad = (x: number) => (x * Math.PI) / 180;
  const h = Math.tan(rad(b)) * 1;
  const pts: [number, number][] = [
    [0, 0],
    [2, 0],
    [1, h],
  ];
  return polyFig(pts, {
    sides: [o.base ?? null, o.side ?? null, null],
    ticks: o.ticks === false ? undefined : [0, 1, 1],
    angles: o.angles,
    w: 240,
    h: 170,
  });
}

export const content: ContentMap = {
  // ═════════════ e4b-1 분수의 덧셈과 뺄셈 ═════════════
  'e4b-1': {
    concepts: [
      {
        title: '분모가 같은 진분수의 덧셈',
        body: '분모는 그대로 두고 **분자끼리 더해요**. $\\frac{1}{5}$이 몇 개인지 세는 것과 같아요.\n$$\\frac{2}{5}+\\frac{1}{5}=\\frac{3}{5},\\quad \\frac{4}{7}+\\frac{5}{7}=\\frac{9}{7}=1\\frac{2}{7}$$\n- 결과가 가분수이면 대분수로 바꾸어 나타내요 (3학년 2학기에서 배웠어요).',
      },
      {
        title: '분모가 같은 진분수의 뺄셈',
        body: '분모는 그대로, **분자끼리 빼요**. $\\frac{5}{8}-\\frac{2}{8}=\\frac{3}{8}$\n- $1-\\frac{3}{8}$ 은 $1=\\frac{8}{8}$ 로 바꾸어 $\\frac{8}{8}-\\frac{3}{8}=\\frac{5}{8}$',
      },
      {
        title: '대분수의 덧셈',
        body: '자연수끼리, 분수끼리 더해요. 분수끼리의 합이 가분수이면 자연수로 받아올림해요.\n$$2\\frac{3}{5}+1\\frac{4}{5}=3\\frac{7}{5}=4\\frac{2}{5}$$\n- 대분수를 가분수로 바꾸어 계산해도 돼요.',
      },
      {
        title: '대분수의 뺄셈',
        body: '자연수끼리, 분수끼리 빼요. 분수끼리 뺄 수 없으면 자연수에서 $1$을 받아내려 가분수로 바꿔요.\n$$3\\frac{1}{4}-1\\frac{3}{4}=2\\frac{5}{4}-1\\frac{3}{4}=1\\frac{2}{4}$$\n- $3-1\\frac{2}{5}$ 는 $3=2\\frac{5}{5}$ 로 바꾸어 계산해요.',
      },
    ],
    skills: [
      {
        id: 'add-proper',
        title: '진분수의 덧셈',
        gen(r, level) {
          const [den, a, b, e] = until(
            () => {
              const den = r.pick(DENS);
              return [den, r.int(1, den - 1), r.int(1, den - 1), level === 3 ? r.int(1, den - 1) : 0];
            },
            ([den, a, b, e]) => {
              const s = a + b + e;
              if (!fracOk(s, den)) return false;
              if (level === 1) return s < den;
              return s > den;
            },
          );
          const s = a + b + e;
          const expr = e ? `${fr(a, den)}+${fr(b, den)}+${fr(e, den)}` : `${fr(a, den)}+${fr(b, den)}`;
          return {
            q: `계산해 보세요. $$${expr}$$`,
            answer: { type: 'num', value: s / den, display: 'mixed' },
            steps: [`분모는 그대로, 분자끼리 더해요: $${expr}=\\frac{${e ? `${a}+${b}+${e}` : `${a}+${b}`}}{${den}}=${fr(s, den)}$`, ...(s > den ? [`가분수를 대분수로: $${fr(s, den)}=${fx(s, den)}$`] : [])],
          };
        },
      },
      {
        id: 'sub-proper',
        title: '진분수의 뺄셈',
        gen(r, level) {
          if (level === 1) {
            const [den, a, b] = until(
              () => {
                const den = r.pick(DENS);
                return [den, r.int(2, den - 1), r.int(1, den - 2)];
              },
              ([den, a, b]) => a > b && fracOk(a - b, den),
            );
            return {
              q: `계산해 보세요. $$${fr(a, den)}-${fr(b, den)}$$`,
              answer: { type: 'num', value: (a - b) / den, display: 'frac' },
              steps: [`분자끼리 빼요: $\\frac{${a}-${b}}{${den}}=${fr(a - b, den)}$`],
            };
          }
          const [den, w, a] = until(
            () => {
              const den = r.pick(DENS);
              return [den, level === 2 ? r.int(1, 3) : r.int(3, 6), r.int(1, den - 1)];
            },
            ([den, w, a]) => fracOk(w * den - a, den),
          );
          if (level === 2)
            return {
              q: `계산해 보세요. $$${w}-${fr(a, den)}$$`,
              answer: { type: 'num', value: w - a / den, display: 'mixed' },
              steps: [w === 1 ? `$1=${fr(den, den)}$` : `$${w}=${w - 1}${fr(den, den)}$`, `$${w === 1 ? fr(den, den) : `${w - 1}${fr(den, den)}`}-${fr(a, den)}=${fx(w * den - a, den)}$`],
            };
          const w2 = r.int(1, w - 1);
          const res = (w - w2) * den - a;
          return {
            q: `계산해 보세요. $$${w}-${w2}${fr(a, den)}$$`,
            answer: { type: 'num', value: res / den, display: 'mixed' },
            steps: [`$${w}=${w - 1}${fr(den, den)}$ 로 바꿔요.`, `자연수끼리: $${w - 1}-${w2}=${w - 1 - w2}$, 분수끼리: $${fr(den, den)}-${fr(a, den)}=${fr(den - a, den)}$`, `답: $${fx(res, den)}$`],
          };
        },
      },
      {
        id: 'add-mixed',
        title: '대분수의 덧셈',
        gen(r, level) {
          const [den, w1, a, w2, b] = until(
            () => {
              const den = r.pick(DENS);
              return [den, r.int(1, 5), r.int(1, den - 1), r.int(1, 4), r.int(1, den - 1)];
            },
            ([den, , a, , b]) => fracOk(a + b, den) && (level === 1 ? a + b < den : a + b > den),
          );
          const tot = (w1 + w2) * den + a + b;
          if (level === 3) {
            const imp = w2 * den + b;
            return {
              q: `계산해 보세요. $$${w1}${fr(a, den)}+${fr(imp, den)}$$`,
              answer: { type: 'num', value: tot / den, display: 'mixed' },
              steps: [`$${fr(imp, den)}=${w2}${fr(b, den)}$`, `자연수끼리: $${w1}+${w2}=${w1 + w2}$, 분수끼리: $${fr(a, den)}+${fr(b, den)}=${fr(a + b, den)}$`, `$${w1 + w2}${fr(a + b, den)}=${fx(tot, den)}$`],
            };
          }
          return {
            q: `계산해 보세요. $$${w1}${fr(a, den)}+${w2}${fr(b, den)}$$`,
            answer: { type: 'num', value: tot / den, display: 'mixed' },
            steps: [`자연수끼리: $${w1}+${w2}=${w1 + w2}$`, `분수끼리: $${fr(a, den)}+${fr(b, den)}=${fr(a + b, den)}$`, a + b >= den ? `$${w1 + w2}${fr(a + b, den)}=${fx(tot, den)}$ (받아올림)` : `답: $${fx(tot, den)}$`],
          };
        },
      },
      {
        id: 'sub-mixed',
        title: '대분수의 뺄셈',
        gen(r, level) {
          const [den, w1, a, w2, b] = until(
            () => {
              const den = r.pick(DENS);
              return [den, r.int(3, 8), r.int(1, den - 1), r.int(1, 2), r.int(1, den - 1)];
            },
            ([den, w1, a, w2, b]) => {
              const res = (w1 - w2) * den + a - b;
              if (res <= 0 || !fracOk(res, den)) return false;
              return level === 1 ? a > b : a < b;
            },
          );
          const res = (w1 - w2) * den + a - b;
          if (level === 3) {
            const imp = w2 * den + b;
            return {
              q: `계산해 보세요. $$${w1}${fr(a, den)}-${fr(imp, den)}$$`,
              answer: { type: 'num', value: res / den, display: 'mixed' },
              steps: [`$${fr(imp, den)}=${w2}${fr(b, den)}$`, `$${w1}${fr(a, den)}=${w1 - 1}${fr(a + den, den)}$ 로 바꿔요.`, `$${w1 - 1}${fr(a + den, den)}-${w2}${fr(b, den)}=${fx(res, den)}$`],
            };
          }
          return {
            q: `계산해 보세요. $$${w1}${fr(a, den)}-${w2}${fr(b, den)}$$`,
            answer: { type: 'num', value: res / den, display: 'mixed' },
            steps:
              a >= b
                ? [`자연수끼리: $${w1}-${w2}=${w1 - w2}$, 분수끼리: $${fr(a, den)}-${fr(b, den)}=${fr(a - b, den)}$`, `답: $${fx(res, den)}$`]
                : [`분수끼리 뺄 수 없으므로 $${w1}${fr(a, den)}=${w1 - 1}${fr(a + den, den)}$`, `자연수끼리: $${w1 - 1}-${w2}=${w1 - 1 - w2}$, 분수끼리: $${fr(a + den, den)}-${fr(b, den)}=${fr(a + den - b, den)}$`, `답: $${fx(res, den)}$`],
          };
        },
      },
      {
        id: 'word',
        title: '분수 문장제',
        gen(r, level) {
          const name = pickName(r);
          const den = r.pick(DENS);
          if (level === 1) {
            const [a, b] = until(
              () => [r.int(1, den - 1), r.int(1, den - 1)],
              ([a, b]) => fracOk(a + b, den),
            );
            return {
              q: `${name}는 우유를 오전에 $${fr(a, den)}$ L, 오후에 $${fr(b, den)}$ L 마셨습니다. 하루 동안 마신 우유는 모두 몇 L인가요?`,
              answer: { type: 'num', value: (a + b) / den, unit: 'L', display: 'mixed' },
              steps: [`$${fr(a, den)}+${fr(b, den)}=${fr(a + b, den)}${a + b > den ? `=${fx(a + b, den)}` : ''}$ (L)`],
            };
          }
          if (level === 2) {
            const [w1, a, w2, b] = until(
              () => [r.int(3, 6), r.int(1, den - 1), r.int(1, 2), r.int(1, den - 1)],
              ([w1, a, w2, b]) => fracOk((w1 - w2) * den + a - b, den) && (w1 - w2) * den + a - b > 0,
            );
            const res = (w1 - w2) * den + a - b;
            return {
              q: `리본이 $${w1}${fr(a, den)}$ m 있었습니다. 선물을 포장하는 데 $${w2}${fr(b, den)}$ m를 사용했다면 남은 리본은 몇 m인가요?`,
              answer: { type: 'num', value: res / den, unit: 'm', display: 'mixed' },
              steps: [`$${w1}${fr(a, den)}-${w2}${fr(b, den)}$`, a < b ? `$=${w1 - 1}${fr(a + den, den)}-${w2}${fr(b, den)}=${fx(res, den)}$ (m)` : `$=${fx(res, den)}$ (m)`],
            };
          }
          const [n1, n2] = pick2Names(r);
          const [w, a, b] = until(
            () => [r.int(3, 5), r.int(1, den - 1), r.int(1, den - 1)],
            ([w, a, b]) => {
              const res = w * den - (den + a) - (den + b);
              return res > 0 && fracOk(res, den);
            },
          );
          const res = w * den - (den + a) - (den + b);
          return {
            q: `물이 $${w}$ L 있습니다. ${n1}가 $1${fr(a, den)}$ L, ${n2}가 $1${fr(b, den)}$ L를 사용했다면 남은 물은 몇 L인가요?`,
            answer: { type: 'num', value: res / den, unit: 'L', display: 'mixed' },
            steps: [`사용한 물: $1${fr(a, den)}+1${fr(b, den)}=${fx(2 * den + a + b, den)}$ (L)`, `남은 물: $${w}-${fx(2 * den + a + b, den)}=${fx(res, den)}$ (L)`],
          };
        },
      },
      {
        id: 'missing',
        title: '□ 안에 알맞은 수',
        gen(r, level) {
          const den = r.pick(DENS.filter((x) => x >= 5));
          if (level === 1) {
            const a = r.int(1, den - 2),
              s = r.int(a + 1, den - 1);
            return {
              q: `□ 안에 알맞은 수를 구하세요. $$\\frac{\\square}{${den}}+${fr(a, den)}=${fr(s, den)}$$`,
              answer: { type: 'num', value: s - a },
              steps: [`분자끼리 생각하면 $\\square+${a}=${s}$`, `$\\square=${s}-${a}=${s - a}$`],
            };
          }
          if (level === 2) {
            const [w, x, k] = until(
              () => [r.int(1, 3), r.int(1, den - 1), r.int(1, den - 1)],
              ([w, x, k]) => w * den + x - k > 0 && fracOk(w * den + x - k, den) && fracOk(w * den + x + k, den) && x !== k,
            );
            const X = w * den + x;
            return {
              q: `어떤 수에 $${fr(k, den)}$을 더해야 할 것을 잘못하여 뺐더니 $${fx(X - k, den)}$이 되었습니다. 바르게 계산한 값을 구하세요.`,
              answer: { type: 'num', value: (X + k) / den, display: 'mixed' },
              steps: [`어떤 수 $=${fx(X - k, den)}+${fr(k, den)}=${fx(X, den)}$`, `바르게 계산: $${fx(X, den)}+${fr(k, den)}=${fx(X + k, den)}$`],
            };
          }
          const w1 = r.int(1, 2),
            a = r.int(1, den - 1);
          const w2 = w1 + r.int(1, 2),
            b = r.int(1, den - 1);
          const lo = w1 * den + a,
            hi = w2 * den + b;
          // lo/den + □/den < hi/den → □ < hi - lo
          const cnt = hi - lo - 1;
          return {
            q: `□ 안에 들어갈 수 있는 자연수는 모두 몇 개인가요? $$${w1}${fr(a, den)}+\\frac{\\square}{${den}}<${w2}${fr(b, den)}$$`,
            answer: { type: 'num', value: cnt, unit: '개' },
            steps: [`가분수로 바꾸면 $${fr(lo, den)}+\\frac{\\square}{${den}}<${fr(hi, den)}$`, `분자끼리: $${lo}+\\square<${hi}$ → $\\square<${hi - lo}$`, `$1$부터 $${hi - lo - 1}$까지 → $${cnt}$개`],
          };
        },
      },
    ],
  },

  // ═════════════ e4b-2 삼각형 ═════════════
  'e4b-2': {
    concepts: [
      {
        title: '변의 길이에 따라 분류하기',
        body: '- **이등변삼각형**: 두 변의 길이가 같은 삼각형\n- **정삼각형**: 세 변의 길이가 같은 삼각형\n- 정삼각형은 두 변의 길이도 같으므로 이등변삼각형이라고 할 수 있어요.',
      },
      {
        title: '이등변삼각형의 성질',
        body: '이등변삼각형은 길이가 같은 두 변과 함께하는 **두 각의 크기가 같아요**.\n- 꼭지각이 $40^{\\circ}$이면 나머지 두 각은 $(180^{\\circ}-40^{\\circ})\\div2=70^{\\circ}$씩\n- 4학년 1학기에 배운 "삼각형 세 각의 합 $180^{\\circ}$"를 이용해요.',
      },
      {
        title: '정삼각형의 성질',
        body: '정삼각형은 세 각의 크기가 모두 같아요: $180^{\\circ}\\div3=60^{\\circ}$',
      },
      {
        title: '각의 크기에 따라 분류하기',
        body: '- **예각삼각형**: 세 각이 모두 예각\n- **직각삼각형**: 한 각이 직각\n- **둔각삼각형**: 한 각이 둔각\n- 어느 삼각형이든 예각은 적어도 $2$개 있어요. 가장 큰 각을 보고 분류해요.',
        example: { q: '두 각이 $35^{\\circ}$, $40^{\\circ}$인 삼각형은?', a: '나머지 각 $105^{\\circ}$ → 둔각삼각형' },
      },
    ],
    skills: [
      {
        id: 'iso-side',
        title: '이등변삼각형의 변',
        gen(r, level) {
          const leg = r.int(4, 15);
          const base = until(
            () => r.int(3, 2 * leg - 1 > 18 ? 18 : 2 * leg - 1),
            (x) => x !== leg,
          );
          const per = 2 * leg + base;
          const apex = (2 * Math.asin(Math.min(0.95, base / (2 * leg))) * 180) / Math.PI;
          const fig = (o: { side?: string; base?: string }) => isoFig(Math.max(30, Math.min(140, apex)), o);
          if (level === 1)
            return {
              q: '이등변삼각형입니다. 세 변의 길이의 합은 몇 cm인가요?',
              fig: fig({ side: `${leg} cm`, base: `${base} cm` }),
              answer: { type: 'num', value: per, unit: 'cm' },
              steps: [`이등변삼각형은 두 변의 길이가 같아요: $${leg}$ cm, $${leg}$ cm`, `$${leg}+${leg}+${base}=${per}$ (cm)`],
            };
          if (level === 2) {
            if (r.chance(0.5))
              return {
                q: `세 변의 길이의 합이 $${per}$ cm인 이등변삼각형입니다. 길이가 같은 두 변 중 한 변의 길이는 몇 cm인가요?`,
                fig: fig({ side: '□ cm', base: `${base} cm` }),
                answer: { type: 'num', value: leg, unit: 'cm' },
                steps: [`같은 두 변의 합: $${per}-${base}=${2 * leg}$ (cm)`, `한 변: $${2 * leg}\\div2=${leg}$ (cm)`],
              };
            return {
              q: `세 변의 길이의 합이 $${per}$ cm인 이등변삼각형입니다. □ 안에 알맞은 수를 구하세요.`,
              fig: fig({ side: `${leg} cm`, base: '□ cm' }),
              answer: { type: 'num', value: base, unit: 'cm' },
              steps: [`$${per}-${leg}-${leg}=${base}$ (cm)`],
            };
          }
          const a = r.int(5, 14);
          const L = 3 * a;
          const b = until(
            () => r.int(Math.floor((3 * a) / 4) + 1, Math.ceil((3 * a) / 2) - 1),
            (x) => 3 * a - 2 * x > 0 && 3 * a - 2 * x < 2 * x && 3 * a - 2 * x !== x,
          );
          return {
            q: `철사를 겹치지 않게 모두 사용하여 한 변이 $${a}$ cm인 정삼각형을 만들었습니다. 이 철사를 다시 펴서 길이가 같은 두 변이 각각 $${b}$ cm인 이등변삼각형을 만들면, 나머지 한 변은 몇 cm인가요?`,
            answer: { type: 'num', value: L - 2 * b, unit: 'cm' },
            steps: [`철사의 길이: $${a}\\times3=${L}$ (cm)`, `나머지 한 변: $${L}-${b}-${b}=${L - 2 * b}$ (cm)`],
          };
        },
      },
      {
        id: 'iso-angle',
        title: '이등변삼각형의 각',
        gen(r, level) {
          if (level === 1) {
            const b = r.int(5, 16) * 5;
            const ap = 180 - 2 * b;
            return {
              q: '이등변삼각형입니다. □의 각도는 몇 도인가요?',
              fig: isoFig(ap, { angles: [`${b}°`, null, '□'] }),
              answer: { type: 'num', value: ap, unit: '°' },
              steps: [`이등변삼각형의 두 밑각은 같아요: $${b}^{\\circ}$, $${b}^{\\circ}$`, `□ $=180^{\\circ}-${b}^{\\circ}-${b}^{\\circ}=${ap}^{\\circ}$`],
            };
          }
          if (level === 2) {
            const ap = r.int(2, 14) * 10;
            const bb = (180 - ap) / 2;
            return {
              q: '이등변삼각형입니다. □의 각도는 몇 도인가요?',
              fig: isoFig(ap, { angles: ['□', null, `${ap}°`] }),
              answer: { type: 'num', value: bb, unit: '°' },
              steps: [`나머지 두 각의 합: $180^{\\circ}-${ap}^{\\circ}=${180 - ap}^{\\circ}$`, `두 각의 크기가 같으므로 □ $=${180 - ap}^{\\circ}\\div2=${bb}^{\\circ}$`],
            };
          }
          const ap = r.int(2, 14) * 10;
          const bb = (180 - ap) / 2;
          return {
            q: `이등변삼각형의 한 밑변을 늘였습니다. 꼭지각이 $${ap}^{\\circ}$일 때 □의 각도는 몇 도인가요?`,
            fig: anglePoly(r, [bb, bb, ap], [null, null, `${ap}°`], { ext: { at: 1, label: '□' } }),
            answer: { type: 'num', value: 180 - bb, unit: '°' },
            steps: [`밑각: $(180^{\\circ}-${ap}^{\\circ})\\div2=${bb}^{\\circ}$`, `일직선이므로 □ $=180^{\\circ}-${bb}^{\\circ}=${180 - bb}^{\\circ}$`],
          };
        },
      },
      {
        id: 'classify-angle',
        title: '예각·직각·둔각삼각형',
        gen(r, level) {
          if (level === 3) {
            const ap = r.pick([20, 30, 40, 50, 70, 80, 90, 100, 110, 120, 130, 140]);
            const bb = (180 - ap) / 2;
            const kind = ap < 90 ? '예각삼각형' : ap === 90 ? '직각삼각형' : '둔각삼각형';
            const choices = ['이등변삼각형, 예각삼각형', '이등변삼각형, 직각삼각형', '이등변삼각형, 둔각삼각형', '정삼각형, 예각삼각형'];
            return {
              q: `두 각의 크기가 각각 $${bb}^{\\circ}$인 삼각형이 있습니다. 이 삼각형의 이름으로 알맞은 것을 고르세요.`,
              answer: { type: 'choice', choices, index: choices.indexOf(`이등변삼각형, ${kind}`) },
              steps: [`나머지 한 각: $180^{\\circ}-${bb}^{\\circ}-${bb}^{\\circ}=${ap}^{\\circ}$`, `두 각이 같으므로 이등변삼각형, 가장 큰 각이 $${Math.max(ap, bb)}^{\\circ}$ → ${kind}`],
            };
          }
          const kindI = r.int(0, 2);
          let ang: number[];
          if (kindI === 1) {
            const a = r.int(3, 15) * 5;
            ang = [90, a, 90 - a];
          } else {
            ang = until(
              () => {
                const a = r.int(4, 28) * 5,
                  b = r.int(4, 28) * 5;
                return [a, b, 180 - a - b];
              },
              (x) => x[2] >= 15 && x.every((y) => y !== 90) && (kindI === 0 ? Math.max(...x) < 90 : Math.max(...x) > 90),
            );
          }
          ang = r.shuffle(ang);
          const names = ['예각삼각형', '직각삼각형', '둔각삼각형'];
          if (level === 1)
            return {
              q: `세 각의 크기가 $${ang[0]}^{\\circ}$, $${ang[1]}^{\\circ}$, $${ang[2]}^{\\circ}$인 삼각형은 어떤 삼각형인가요?`,
              answer: { type: 'choice', choices: names, index: kindI },
              steps: [`가장 큰 각: $${Math.max(...ang)}^{\\circ}$`, `따라서 ${names[kindI]}`],
            };
          return {
            q: `삼각형의 두 각이 $${ang[0]}^{\\circ}$, $${ang[1]}^{\\circ}$입니다. 이 삼각형은 어떤 삼각형인가요?`,
            answer: { type: 'choice', choices: names, index: kindI },
            steps: [`나머지 한 각: $180^{\\circ}-${ang[0]}^{\\circ}-${ang[1]}^{\\circ}=${ang[2]}^{\\circ}$`, `가장 큰 각이 $${Math.max(...ang)}^{\\circ}$ → ${names[kindI]}`],
            hint: '먼저 나머지 한 각을 구해요.',
          };
        },
      },
      {
        id: 'equilateral',
        title: '정삼각형',
        gen(r, level) {
          const a = r.int(3, 20);
          if (level === 1)
            return {
              q: '정삼각형입니다. 세 변의 길이의 합은 몇 cm인가요?',
              fig: polyFig([[0, 0], [2, 0], [1, Math.sqrt(3)]], { sides: [`${a} cm`, null, null], ticks: [1, 1, 1] }),
              answer: { type: 'num', value: 3 * a, unit: 'cm' },
              steps: [`정삼각형은 세 변의 길이가 같아요.`, `$${a}\\times3=${3 * a}$ (cm)`],
            };
          if (level === 2) {
            if (r.chance(0.5))
              return {
                q: `세 변의 길이의 합이 $${3 * a}$ cm인 정삼각형의 한 변의 길이는 몇 cm인가요?`,
                answer: { type: 'num', value: a, unit: 'cm' },
                steps: [`$${3 * a}\\div3=${a}$ (cm)`],
              };
            const k = r.int(1, 2);
            return {
              q: k === 1 ? '정삼각형의 한 각의 크기는 몇 도인가요?' : '정삼각형에서 두 각의 크기의 합은 몇 도인가요?',
              answer: { type: 'num', value: 60 * k, unit: '°' },
              steps: [`정삼각형의 세 각은 크기가 같으므로 한 각은 $180^{\\circ}\\div3=60^{\\circ}$`, ...(k === 2 ? [`$60^{\\circ}\\times2=120^{\\circ}$`] : [])],
            };
          }
          const n = r.int(3, 7);
          const s = new Svg(Math.min(300, n * 30 + 60), 80);
          const u = Math.min(52, 240 / ((n + 1) / 2));
          const hh = (u * Math.sqrt(3)) / 2;
          for (let i = 0; i < n; i++) {
            const x0 = 20 + (i * u) / 2;
            const up = i % 2 === 0;
            const pts: [number, number][] = up
              ? [[x0, 70], [x0 + u, 70], [x0 + u / 2, 70 - hh]]
              : [[x0, 70 - hh], [x0 + u, 70 - hh], [x0 + u / 2, 70]];
            s.poly(pts, { cls: 'acc' });
          }
          // 바깥쪽 둘레를 굵게
          const odd = n % 2 === 1;
          const br = 20 + ((odd ? n + 1 : n) * u) / 2,
            tr = 20 + ((odd ? n : n + 1) * u) / 2;
          s.poly([[20, 70], [br, 70], [tr, 70 - hh], [20 + u / 2, 70 - hh]], { cls: 'acc thick' });
          return {
            q: `한 변이 $${a}$ cm인 정삼각형 $${n}$개를 그림과 같이 이어 붙였습니다. 굵은 선으로 나타낸 바깥쪽 둘레는 몇 cm인가요?`,
            fig: s.toString(),
            answer: { type: 'num', value: (n + 2) * a, unit: 'cm' },
            steps: [`바깥쪽 둘레에는 정삼각형의 변이 $${n + 2}$개 있어요.`, `$${a}\\times${n + 2}=${(n + 2) * a}$ (cm)`],
            hint: '이어 붙인 곳의 변은 둘레에 들어가지 않아요.',
          };
        },
      },
      {
        id: 'true-false',
        title: '삼각형의 분류',
        gen(r) {
          const T = [
            '정삼각형은 이등변삼각형이라고 할 수 있습니다.',
            '정삼각형의 세 각은 모두 $60^{\\circ}$입니다.',
            '이등변삼각형은 두 각의 크기가 같습니다.',
            '직각삼각형에는 예각이 2개 있습니다.',
            '둔각삼각형에는 둔각이 1개 있습니다.',
            '정삼각형은 예각삼각형입니다.',
            '세 각이 모두 예각인 삼각형은 예각삼각형입니다.',
          ];
          const Fs = [
            '이등변삼각형은 모두 정삼각형입니다.',
            '둔각삼각형에는 둔각이 2개 있을 수 있습니다.',
            '직각삼각형은 이등변삼각형이 될 수 없습니다.',
            '정삼각형은 둔각삼각형이 될 수 있습니다.',
            '예각이 있는 삼각형은 모두 예각삼각형입니다.',
            '이등변삼각형은 세 각의 크기가 항상 같습니다.',
            '한 각이 직각인 삼각형은 둔각삼각형입니다.',
          ];
          const want = r.chance(0.5);
          const ans = r.pick(want ? T : Fs);
          return {
            q: want ? '옳은 것을 고르세요.' : '옳지 **않은** 것을 고르세요.',
            answer: makeChoices(r, ans, r.sample(want ? Fs : T, 4), 5),
            steps: [`${want ? '옳은' : '옳지 않은'} 것: ${ans}`, '변의 길이에 따른 분류(이등변·정삼각형)와 각에 따른 분류(예각·직각·둔각)를 함께 생각해요.'],
          };
        },
      },
    ],
  },

  // ═════════════ e4b-3 소수의 덧셈과 뺄셈 ═════════════
  'e4b-3': {
    concepts: [
      {
        title: '소수 두 자리 수, 세 자리 수',
        body: '$\\frac{1}{100}=0.01$ ("영 점 영일"), $\\frac{1}{1000}=0.001$ ("영 점 영영일")\n- $3.254$: $3$은 일의 자리, $2$는 소수 첫째 자리($0.2$), $5$는 소수 둘째 자리($0.05$), $4$는 소수 셋째 자리($0.004$)\n- 3학년 때 배운 소수 한 자리($0.1$)를 더 작게 나눈 거예요.',
      },
      {
        title: '소수의 크기 비교',
        body: '자연수 부분부터 비교하고, 같으면 소수 첫째 자리, 둘째 자리 … 순서로 비교해요.\n- $0.4=0.40$ 처럼 소수 끝자리의 $0$은 생략할 수 있어요.',
      },
      {
        title: '소수 사이의 관계',
        body: '- $10$배 하면 소수점이 **오른쪽으로 한 칸**: $0.25\\to2.5$\n- $\\frac{1}{10}$ 하면 소수점이 **왼쪽으로 한 칸**: $2.5\\to0.25$\n- $1$은 $0.1$의 $10$배, $0.01$의 $100$배, $0.001$의 $1000$배',
      },
      {
        title: '소수의 덧셈과 뺄셈',
        body: '**소수점의 자리를 맞추어** 세로로 쓰고, 자연수처럼 계산한 뒤 소수점을 그대로 내려 찍어요.\n$$3.5+1.27=4.77,\\qquad 5-2.36=2.64$$\n- 자리 수가 다르면 빈 자리에 $0$이 있다고 생각해요: $5=5.00$',
      },
    ],
    skills: [
      {
        id: 'dec-place',
        title: '소수의 자릿값',
        gen(r, level) {
          if (level === 3) {
            const k = r.int(1001, 9999);
            if (k % 10 === 0) return { q: `$0.01$이 $${k / 10}$개인 수를 소수로 나타내세요.`, answer: { type: 'num', value: k / 1000, display: 'dec' }, steps: [`$0.01$이 $100$개이면 $1$`, `$${D(k)}$`] };
            return {
              q: `$0.001$이 $${c(k)}$개인 수를 소수로 나타내세요.`,
              answer: { type: 'num', value: round(k / 1000), display: 'dec' },
              steps: [`$0.001$이 $1000$개이면 $1$이에요.`, `$${c(k)}$개 → $${D(k)}$`],
            };
          }
          const places = level === 1 ? 2 : 3;
          const v = decNum(r, places, 1, 9);
          const s = D(v);
          const fracDigits = s.split('.')[1] ?? '';
          const i = r.int(0, fracDigits.length - 1);
          const dg = +fracDigits[i];
          const val = dg / 10 ** (i + 1);
          const placeName = ['첫째', '둘째', '셋째'][i];
          if (dg === 0 || r.chance(0.4))
            return {
              q: `$${s}$에서 소수 ${placeName} 자리 숫자는 무엇인가요?`,
              answer: { type: 'num', value: dg },
              steps: [`소수점 오른쪽으로 ${i + 1}번째 숫자: $${dg}$`],
            };
          return {
            q: s.split(String(dg)).length > 2 ? `$${s}$에서 소수 ${placeName} 자리 숫자 $${dg}$가 나타내는 수는 얼마인가요?` : `$${s}$에서 숫자 $${dg}$가 나타내는 수는 얼마인가요?`,
            answer: { type: 'num', value: round(val), display: 'dec' },
            steps: [`$${dg}$는 소수 ${placeName} 자리 숫자예요.`, `나타내는 수: $${d(val)}$`],
          };
        },
      },
      {
        id: 'dec-relation',
        title: '소수 사이의 관계',
        gen(r, level) {
          const ops = level === 1 ? [10, 1 / 10] : [10, 100, 1 / 10, 1 / 100];
          const k = r.pick(ops);
          const maxPl = k >= 1 ? 3 : k === 0.1 ? 2 : 1;
          const v = decNum(r, r.int(1, maxPl), 0, 9);
          const res = round((v / 1000) * k, 6);
          const kt = k >= 1 ? `$${k}$배` : `$${fr(1, Math.round(1 / k))}$`;
          if (level === 3) {
            return {
              q: `어떤 수의 ${k >= 1 ? `$${k}$배는` : `$${fr(1, Math.round(1 / k))}$은`} $${d(res)}$입니다. 어떤 수는 얼마인가요?`,
              answer: { type: 'num', value: v / 1000, display: 'dec' },
              steps: [k >= 1 ? `거꾸로 $${fr(1, k)}$ 하면 돼요: 소수점을 왼쪽으로 $${String(k).length - 1}$칸` : `거꾸로 $${Math.round(1 / k)}$배 하면 돼요: 소수점을 오른쪽으로 $${String(Math.round(1 / k)).length - 1}$칸`, `어떤 수: $${D(v)}$`],
            };
          }
          return {
            q: `$${D(v)}$의 ${kt}${k >= 1 ? '는' : '은'} 얼마인가요?`,
            answer: { type: 'num', value: res, display: 'dec' },
            steps: [k >= 1 ? `$${k}$배 하면 소수점이 오른쪽으로 $${String(k).length - 1}$칸 옮겨져요.` : `$${fr(1, Math.round(1 / k))}$ 하면 소수점이 왼쪽으로 $${String(Math.round(1 / k)).length - 1}$칸 옮겨져요.`, `$${d(res)}$`],
          };
        },
      },
      {
        id: 'dec-compare',
        title: '소수의 크기 비교',
        gen(r, level) {
          if (level === 3) {
            // 답이 0개(들어갈 수 없음)나 10개(모두 들어감)가 되지 않을 때까지 다시 만듦
            for (let t = 0; ; t++) {
              const base = decNum(r, 3, 1, 9);
              const s = D(base);
              const [ip, fp] = s.split('.');
              const pos = r.int(1, 2);
              const fpad = fp.padEnd(3, '0');
              const tail = r.int(1, 9);
              const shownFrac = pos === 2 ? fpad.slice(0, 2) + '\\square ' : fpad.slice(0, 1) + '\\square ' + String(tail);
              const ref = +fpad;
              const candOf = (x: number) => (pos === 2 ? +(fpad.slice(0, 2) + x) : +(fpad.slice(0, 1) + x + tail));
              const digits = (bg: boolean) => Array.from({ length: 10 }, (_, x) => x).filter((x) => (bg ? candOf(x) > ref : candOf(x) < ref));
              let big = r.chance(0.5);
              const good = (bg: boolean) => digits(bg).length >= 1 && digits(bg).length <= 9;
              if (!good(big)) big = !big;
              if (!good(big) && t < 50) continue;
              const ok = digits(big);
              const cnt = ok.length;
              return {
                q: `$0$부터 $9$까지의 수 중에서 □ 안에 들어갈 수 있는 수는 모두 몇 개인가요? $$${ip}.${shownFrac} ${big ? '>' : '<'} ${s}$$`,
                answer: { type: 'num', value: cnt, unit: '개' },
                steps: [`자연수 부분이 같으므로 소수 부분을 높은 자리부터 비교해요.`, `□에 들어갈 수 있는 수: $${ok.join(', ')}$ → $${cnt}$개`],
              };
            }
          }
          const places = level === 1 ? 2 : 3;
          const base = decNum(r, places, 1, 5);
          const set = new Set<number>([base]);
          while (set.size < 4) {
            const t = r.int(0, 2);
            let v = base;
            if (t === 0) v = base + r.pick([-1, 1]) * 10 ** (3 - r.int(1, places)) * r.int(1, 3);
            else if (t === 1) v = decNum(r, r.int(1, places), 1, 5);
            else v = Math.floor(base / 1000) * 1000 + (base % 100) * 10;
            if (v > 0 && v % 1000 !== 0) set.add(v);
          }
          const arr = [...set];
          const big = r.chance(0.5);
          const sorted = arr.slice().sort((a, b) => (big ? b - a : a - b));
          return {
            q: `가장 ${big ? '큰' : '작은'} 수는 어느 것인가요?`,
            answer: makeChoices(r, `$${D(sorted[0])}$`, sorted.slice(1).map((x) => `$${D(x)}$`), 4),
            steps: ['자연수 부분 → 소수 첫째 자리 → 둘째 자리 … 순서로 비교해요.', `${sorted.map((x) => `$${D(x)}$`).join(big ? ' > ' : ' < ')}`],
          };
        },
      },
      {
        id: 'dec-add',
        title: '소수의 덧셈',
        gen(r, level) {
          const p1 = level === 1 ? 1 : level === 2 ? 2 : r.int(1, 3);
          const p2 = level === 1 ? 1 : level === 2 ? 2 : p1 === 3 ? r.int(1, 2) : 3;
          const a = decNum(r, p1, level === 1 ? 0 : 1, level === 1 ? 9 : 20),
            b = decNum(r, p2, level === 1 ? 0 : 1, level === 1 ? 9 : 20);
          const s = a + b;
          return {
            q: `계산해 보세요. $$${D(a)}+${D(b)}$$`,
            answer: { type: 'num', value: s / 1000, display: 'dec' },
            steps: [`소수점의 자리를 맞추어 세로로 써요.`, p1 !== p2 ? `자리 수가 다르면 빈 자리에 $0$이 있다고 생각해요.` : `같은 자리끼리 더하고 받아올림해요.`, `$${D(a)}+${D(b)}=${D(s)}$`],
          };
        },
      },
      {
        id: 'dec-sub',
        title: '소수의 뺄셈',
        gen(r, level) {
          let a: number, b: number;
          if (level === 3 && r.chance(0.5)) {
            a = r.int(2, 9) * 1000;
            b = decNum(r, r.int(2, 3), 0, a / 1000 - 1);
          } else {
            const p1 = level === 1 ? 1 : level === 2 ? 2 : 3;
            const p2 = level === 3 ? r.int(1, 2) : p1;
            a = decNum(r, p1, 2, level === 1 ? 9 : 20);
            const A = a;
            b = until(
              () => decNum(r, p2, 0, Math.floor(A / 1000)),
              (x) => x < A,
            );
            if (b >= a) b = 100;
          }
          return {
            q: `계산해 보세요. $$${D(a)}-${D(b)}$$`,
            answer: { type: 'num', value: (a - b) / 1000, display: 'dec' },
            steps: [`소수점의 자리를 맞추어 세로로 써요.${a % 1000 === 0 ? ` $${a / 1000}=${a / 1000}.000$ 으로 생각해요.` : ''}`, `같은 자리끼리 빼고, 뺄 수 없으면 받아내림해요.`, `$${D(a)}-${D(b)}=${D(a - b)}$`],
          };
        },
      },
      {
        id: 'word',
        title: '소수 문장제',
        gen(r, level) {
          const [n1, n2] = pick2Names(r);
          if (level === 1) {
            const a = decNum(r, 2, 1, 3),
              b = decNum(r, 2, 1, 3);
            return {
              q: `${n1}는 딸기를 $${D(a)}$ kg, ${n2}는 $${D(b)}$ kg 땄습니다. 두 사람이 딴 딸기는 모두 몇 kg인가요?`,
              answer: { type: 'num', value: (a + b) / 1000, unit: 'kg', display: 'dec' },
              steps: [`$${D(a)}+${D(b)}=${D(a + b)}$ (kg)`],
            };
          }
          if (level === 2) {
            const a = decNum(r, 2, 1, 2),
              b = decNum(r, 2, 1, 2);
            const [hi, lo] = a > b ? [a, b] : [b, a];
            if (hi === lo) return { q: `${n1}의 키는 $${D(hi)}$ m입니다. $0.1$ m 더 크면 몇 m인가요?`, answer: { type: 'num', value: (hi + 100) / 1000, unit: 'm', display: 'dec' }, steps: [`$${D(hi)}+0.1=${D(hi + 100)}$`] };
            return {
              q: `멀리뛰기 기록이 ${n1}는 $${D(hi)}$ m, ${n2}는 $${D(lo)}$ m입니다. ${n1}는 ${n2}보다 몇 m 더 멀리 뛰었나요?`,
              answer: { type: 'num', value: (hi - lo) / 1000, unit: 'm', display: 'dec' },
              steps: [`$${D(hi)}-${D(lo)}=${D(hi - lo)}$ (m)`],
            };
          }
          const x = decNum(r, 2, 1, 8),
            k = decNum(r, r.int(1, 3), 0, 2);
          if (r.chance(0.5) && x > k)
            return {
              q: `어떤 수에 $${D(k)}$를 더해야 할 것을 잘못하여 뺐더니 $${D(x - k)}$가 되었습니다. 바르게 계산한 값을 구하세요.`,
              answer: { type: 'num', value: (x + k) / 1000, display: 'dec' },
              steps: [`어떤 수 $=${D(x - k)}+${D(k)}=${D(x)}$`, `바르게 계산: $${D(x)}+${D(k)}=${D(x + k)}$`],
            };
          const tot = r.int(2, 5) * 1000;
          const u1 = decNum(r, 2, 0, 1),
            u2 = decNum(r, 3, 0, 1);
          return {
            q: `물 $${tot / 1000}$ L 중에서 ${n1}가 $${D(u1)}$ L, ${n2}가 $${D(u2)}$ L를 마셨습니다. 남은 물은 몇 L인가요?`,
            answer: { type: 'num', value: (tot - u1 - u2) / 1000, unit: 'L', display: 'dec' },
            steps: [`마신 물: $${D(u1)}+${D(u2)}=${D(u1 + u2)}$ (L)`, `남은 물: $${tot / 1000}-${D(u1 + u2)}=${D(tot - u1 - u2)}$ (L)`],
          };
        },
      },
    ],
  },

  // ═════════════ e4b-4 사각형 ═════════════
  'e4b-4': {
    concepts: [
      {
        title: '수직과 수선',
        body: '두 직선이 만나서 이루는 각이 직각일 때 두 직선은 서로 **수직**이라고 해요. 한 직선을 다른 직선에 대한 **수선**이라고 해요.',
      },
      {
        title: '평행과 평행선 사이의 거리',
        body: '서로 만나지 않는 두 직선을 **평행**하다고 하고, 평행한 두 직선을 평행선이라고 해요.\n- 평행선 사이에 그은 수선의 길이를 **평행선 사이의 거리**라고 해요. 이 거리는 어디서 재어도 같아요.',
      },
      {
        title: '사다리꼴과 평행사변형',
        body: '- **사다리꼴**: 평행한 변이 한 쌍이라도 있는 사각형\n- **평행사변형**: 마주 보는 두 쌍의 변이 서로 평행한 사각형\n  - 마주 보는 두 변의 길이가 같고, 마주 보는 두 각의 크기가 같아요.\n  - 이웃한 두 각의 크기의 합은 $180^{\\circ}$예요.',
      },
      {
        title: '마름모',
        body: '네 변의 길이가 모두 같은 사각형을 **마름모**라고 해요.\n- 마주 보는 두 쌍의 변이 평행하고, 마주 보는 각의 크기가 같아요.\n- 두 대각선이 서로 수직으로 만나고, 서로를 똑같이 둘로 나누어요.',
      },
      {
        title: '여러 가지 사각형의 관계',
        body: '정사각형 ⊂ 직사각형 ⊂ 평행사변형 ⊂ 사다리꼴, 정사각형 ⊂ 마름모 ⊂ 평행사변형\n- 예: 정사각형은 마름모라고 할 수 있지만, 마름모는 정사각형이라고 할 수 없어요.',
      },
    ],
    skills: [
      {
        id: 'para-angle',
        title: '평행사변형과 마름모의 각',
        gen(r, level) {
          const a = r.int(8, 17) * 5;
          const b = 180 - a;
          const rhombus = level === 2 && r.chance(0.5);
          const name = rhombus ? '마름모' : '평행사변형';
          const pts: [number, number][] = rhombus
            ? [[0, 0], [1, 0], [1 + Math.cos((a * Math.PI) / 180), Math.sin((a * Math.PI) / 180)], [Math.cos((a * Math.PI) / 180), Math.sin((a * Math.PI) / 180)]]
            : (() => {
                const L = 1.6,
                  M = 1;
                const cx = Math.cos((a * Math.PI) / 180),
                  sy = Math.sin((a * Math.PI) / 180);
                return [[0, 0], [L, 0], [L + M * cx, M * sy], [M * cx, M * sy]] as [number, number][];
              })();
          if (level === 3) {
            const diff = r.int(2, 14) * 10;
            const big = (180 + diff) / 2;
            return {
              q: `평행사변형에서 이웃한 두 각의 크기의 차가 $${diff}^{\\circ}$입니다. 큰 각의 크기는 몇 도인가요?`,
              answer: { type: 'num', value: big, unit: '°' },
              steps: [`이웃한 두 각의 합은 $180^{\\circ}$`, `큰 각 $=(180^{\\circ}+${diff}^{\\circ})\\div2=${big}^{\\circ}$`],
              hint: '합과 차를 알 때: 큰 수 = (합 + 차) ÷ 2',
            };
          }
          const askOpp = r.chance(0.5);
          const labels = askOpp ? [`${a}°`, null, '□', null] : [`${a}°`, '□', null, null];
          return {
            q: `${name}입니다. □의 각도는 몇 도인가요?`,
            fig: polyFig(pts, { angles: labels, ticks: rhombus ? [1, 1, 1, 1] : [1, 2, 1, 2] }),
            answer: { type: 'num', value: askOpp ? a : b, unit: '°' },
            steps: askOpp ? [`${J(name, '은/는')} 마주 보는 두 각의 크기가 같아요.`, `□ $=${a}^{\\circ}$`] : [`${name}의 이웃한 두 각의 합은 $180^{\\circ}$`, `□ $=180^{\\circ}-${a}^{\\circ}=${b}^{\\circ}$`],
          };
        },
      },
      {
        id: 'quad-perimeter',
        title: '평행사변형과 마름모의 변',
        gen(r, level) {
          const rh = r.chance(0.5);
          const a = r.int(4, 18),
            b = rh ? a : r.int(3, 15);
          const per = 2 * (a + b);
          const ang = 60 + r.int(0, 5) * 5;
          const cx = Math.cos((ang * Math.PI) / 180),
            sy = Math.sin((ang * Math.PI) / 180);
          const sc = rh ? 1 : b / a;
          const pts: [number, number][] = [[0, 0], [1, 0], [1 + sc * cx, sc * sy], [sc * cx, sc * sy]];
          const name = rh ? '마름모' : '평행사변형';
          if (level === 1)
            return {
              q: `${name}의 네 변의 길이의 합은 몇 cm인가요?`,
              fig: polyFig(pts, { sides: [`${a} cm`, rh ? null : `${b} cm`, null, null], ticks: rh ? [1, 1, 1, 1] : [1, 2, 1, 2] }),
              answer: { type: 'num', value: per, unit: 'cm' },
              steps: rh ? [`마름모는 네 변의 길이가 같아요.`, `$${a}\\times4=${per}$ (cm)`] : [`평행사변형은 마주 보는 두 변의 길이가 같아요.`, `$(${a}+${b})\\times2=${per}$ (cm)`],
            };
          if (level === 2)
            return rh
              ? { q: `네 변의 길이의 합이 $${per}$ cm인 마름모의 한 변은 몇 cm인가요?`, answer: { type: 'num', value: a, unit: 'cm' }, steps: [`$${per}\\div4=${a}$ (cm)`] }
              : {
                  q: `네 변의 길이의 합이 $${per}$ cm인 평행사변형입니다. □ 안에 알맞은 수를 구하세요.`,
                  fig: polyFig(pts, { sides: [`${a} cm`, '□ cm', null, null], ticks: [1, 2, 1, 2] }),
                  answer: { type: 'num', value: b, unit: 'cm' },
                  steps: [`이웃한 두 변의 합: $${per}\\div2=${per / 2}$ (cm)`, `□ $=${per / 2}-${a}=${b}$`],
                };
          const k = r.int(2, 4);
          const side = r.int(3, 9);
          return {
            q: `한 변이 $${side}$ cm인 마름모 $${k}$개를 한 변씩 맞대어 옆으로 나란히 이어 붙여 큰 평행사변형을 만들었습니다. 큰 평행사변형의 네 변의 길이의 합은 몇 cm인가요?`,
            answer: { type: 'num', value: 2 * (k * side + side), unit: 'cm' },
            steps: [`긴 변: $${side}\\times${k}=${k * side}$ (cm), 짧은 변: $${side}$ cm`, `$(${k * side}+${side})\\times2=${2 * (k * side + side)}$ (cm)`],
          };
        },
      },
      {
        id: 'quad-relation',
        title: '여러 가지 사각형',
        gen(r, level) {
          if (level === 1) {
            const qs = [
              { q: '마주 보는 두 쌍의 변이 서로 평행한 사각형을 무엇이라고 하나요?', a: '평행사변형', w: ['사다리꼴', '마름모', '직사각형'] },
              { q: '평행한 변이 한 쌍이라도 있는 사각형을 무엇이라고 하나요?', a: '사다리꼴', w: ['평행사변형', '마름모', '정사각형'] },
              { q: '네 변의 길이가 모두 같은 사각형을 무엇이라고 하나요?', a: '마름모', w: ['직사각형', '평행사변형', '사다리꼴'] },
              { q: '네 각이 모두 직각인 사각형을 무엇이라고 하나요?', a: '직사각형', w: ['마름모', '사다리꼴', '평행사변형'] },
              { q: '네 변의 길이가 같고 네 각이 모두 직각인 사각형을 무엇이라고 하나요?', a: '정사각형', w: ['마름모', '직사각형', '평행사변형'] },
            ];
            const it = r.pick(qs);
            return { q: it.q, answer: makeChoices(r, it.a, it.w, 4), steps: [`뜻을 떠올려 보세요: ${it.a}`] };
          }
          const T = [
            '정사각형은 마름모라고 할 수 있습니다.',
            '마름모는 평행사변형이라고 할 수 있습니다.',
            '직사각형은 사다리꼴이라고 할 수 있습니다.',
            '평행사변형은 사다리꼴이라고 할 수 있습니다.',
            '정사각형은 평행사변형이라고 할 수 있습니다.',
            '마름모의 마주 보는 각의 크기는 같습니다.',
            '평행사변형의 마주 보는 변의 길이는 같습니다.',
          ];
          const Fs = [
            '마름모는 정사각형이라고 할 수 있습니다.',
            '사다리꼴은 평행사변형이라고 할 수 있습니다.',
            '평행사변형은 마름모라고 할 수 있습니다.',
            '직사각형은 마름모라고 할 수 있습니다.',
            '사다리꼴은 마주 보는 두 쌍의 변이 평행합니다.',
            '평행사변형의 네 각은 항상 직각입니다.',
            '마름모의 네 각은 항상 같습니다.',
          ];
          const want = r.chance(0.5);
          const ans = r.pick(want ? T : Fs);
          return {
            q: want ? '옳은 것을 고르세요.' : '옳지 **않은** 것을 고르세요.',
            answer: makeChoices(r, ans, r.sample(want ? Fs : T, level === 3 ? 4 : 3), level === 3 ? 5 : 4),
            steps: [`${want ? '옳은' : '옳지 않은'} 것: ${ans}`, '정사각형 ⊂ 직사각형·마름모 ⊂ 평행사변형 ⊂ 사다리꼴 관계를 떠올려요.'],
          };
        },
      },
      {
        id: 'perp-angle',
        title: '수직을 이용한 각',
        gen(r, level) {
          const s = new Svg(240, 200);
          const O: [number, number] = [120, 100];
          s.line(20, 100, 220, 100, { cls: 'acc' });
          s.line(120, 190, 120, 10, { cls: 'acc' });
          s.rightAngle(120, 100, [1, 0], [0, -1], 10);
          s.text(214, 90, '가', { size: 12 });
          s.text(130, 16, '나', { size: 12 });
          const ray = (deg: number, lab?: string) => {
            const t = (deg * Math.PI) / 180;
            s.line(O[0], O[1], O[0] + 90 * Math.cos(t), O[1] - 90 * Math.sin(t), { cls: 'acc2' });
            if (lab) s.text(O[0] + 98 * Math.cos(t), O[1] - 98 * Math.sin(t), lab, { size: 12 });
          };
          const lab = (a1: number, a2: number, txt: string, rr = 34) => {
            s.arc(O[0], O[1], rr - 14, a1, a2, { cls: 'acc2' });
            const m = (((a1 + a2) / 2) * Math.PI) / 180;
            s.text(O[0] + rr * Math.cos(m) + 4, O[1] - rr * Math.sin(m), txt, { size: 12 });
          };
          if (level === 1) {
            const t = r.int(3, 15) * 5;
            ray(t);
            lab(0, t, `${t}°`, 44);
            lab(t, 90, '□', 40);
            return {
              q: '직선 가와 직선 나는 서로 수직입니다. □의 각도는 몇 도인가요?',
              fig: s.toString(),
              answer: { type: 'num', value: 90 - t, unit: '°' },
              steps: [`수직이므로 두 직선이 이루는 각은 $90^{\\circ}$`, `□ $=90^{\\circ}-${t}^{\\circ}=${90 - t}^{\\circ}$`],
            };
          }
          if (level === 2) {
            const [a, b] = until(
              () => [r.int(3, 10) * 5, r.int(3, 10) * 5],
              ([a, b]) => 90 - a - b >= 15,
            );
            ray(a);
            ray(a + b);
            lab(0, a, `${a}°`, 48);
            lab(a, a + b, '□', 42);
            lab(a + b, 90, `${90 - a - b}°`, 48);
            return {
              q: '직선 가와 직선 나는 서로 수직입니다. □의 각도는 몇 도인가요?',
              fig: s.toString(),
              answer: { type: 'num', value: b, unit: '°' },
              steps: [`세 각의 합은 $90^{\\circ}$`, `□ $=90^{\\circ}-${a}^{\\circ}-${90 - a - b}^{\\circ}=${b}^{\\circ}$`],
            };
          }
          const t1 = r.int(3, 15) * 5,
            t2 = r.int(3, 15) * 5;
          ray(t1);
          ray(90 + t2);
          lab(0, t1, `${t1}°`, 46);
          lab(90 + t2, 180, `${90 - t2}°`, 46);
          lab(t1, 90 + t2, '□', 30);
          return {
            q: '직선 가와 직선 나는 서로 수직입니다. 두 반직선 사이의 □의 각도는 몇 도인가요?',
            fig: s.toString(),
            answer: { type: 'num', value: 90 - t1 + t2, unit: '°' },
            steps: [`직선 나의 오른쪽 부분: $90^{\\circ}-${t1}^{\\circ}=${90 - t1}^{\\circ}$`, `직선 나의 왼쪽 부분: $90^{\\circ}-${90 - t2}^{\\circ}=${t2}^{\\circ}$`, `□ $=${90 - t1}^{\\circ}+${t2}^{\\circ}=${90 - t1 + t2}^{\\circ}$`],
          };
        },
      },
      {
        id: 'parallel-distance',
        title: '평행선 사이의 거리',
        gen(r, level) {
          const n = level === 3 ? 4 : 3;
          const ds = Array.from({ length: n - 1 }, () => r.int(2, 12));
          const names = ['가', '나', '다', '라'];
          const s = new Svg(260, 40 + (n - 1) * 45);
          let y = 20;
          const ys: number[] = [y];
          ds.forEach(() => ys.push((y += 45)));
          ys.forEach((yy, i) => {
            s.line(20, yy, 230, yy, { cls: 'acc' });
            s.text(244, yy, names[i], { size: 12 });
          });
          ds.forEach((dv, i) => {
            const x = 70 + i * 50;
            s.line(x, ys[i], x, ys[i + 1], { dash: true });
            s.text(x + 22, (ys[i] + ys[i + 1]) / 2, level === 2 && i === 1 ? '□' : `${dv} cm`, { size: 11 });
          });
          const tot = ds.reduce((a, b) => a + b, 0);
          if (level === 2)
            return {
              q: `직선 가, 나, 다는 서로 평행합니다. 직선 가와 직선 다 사이의 거리가 $${tot}$ cm일 때, 직선 나와 직선 다 사이의 거리는 몇 cm인가요?`,
              fig: s.toString(),
              answer: { type: 'num', value: ds[1], unit: 'cm' },
              steps: [`(가와 다 사이) $=$ (가와 나 사이) $+$ (나와 다 사이)`, `$${tot}-${ds[0]}=${ds[1]}$ (cm)`],
            };
          const last = names[n - 1];
          return {
            q: `직선 ${names.slice(0, n).join(', ')}는 서로 평행합니다. 직선 가와 직선 ${last} 사이의 거리는 몇 cm인가요?`,
            fig: s.toString(),
            answer: { type: 'num', value: tot, unit: 'cm' },
            steps: [`평행선 사이의 거리를 차례로 더해요.`, `$${ds.join('+')}=${tot}$ (cm)`],
          };
        },
      },
    ],
  },

  // ═════════════ e4b-5 꺾은선그래프 ═════════════
  'e4b-5': {
    concepts: [
      {
        title: '꺾은선그래프',
        body: '수량을 점으로 찍고, 그 점들을 선분으로 이어 그린 그래프를 **꺾은선그래프**라고 해요.\n- 시간에 따라 변하는 양(기온, 키, 몸무게)을 나타내기 좋아요.\n- 4학년 1학기의 막대그래프는 크기 비교, 꺾은선그래프는 **변화**를 보기 좋아요.',
      },
      {
        title: '꺾은선그래프 읽기',
        body: '- 선분이 오른쪽 위로 올라가면 늘어난 것, 내려가면 줄어든 것이에요.\n- **선이 많이 기울어질수록 변화가 커요.**\n- 점과 점 사이의 값은 중간쯤으로 짐작할 수 있어요.',
      },
      {
        title: '물결선',
        body: '필요 없는 부분을 줄여서 물결선(≈)으로 나타내면 세로 눈금 한 칸을 작게 할 수 있어 변화를 더 뚜렷하게 볼 수 있어요.',
      },
      {
        title: '꺾은선그래프 그리기',
        body: '① 가로·세로에 무엇을 나타낼지 정해요. ② 눈금 한 칸의 크기와 물결선 사용 여부를 정해요. ③ 값에 맞게 점을 찍고 선분으로 이어요. ④ 제목을 붙여요.',
      },
    ],
    skills: [
      {
        id: 'read',
        title: '꺾은선그래프 읽기',
        gen(r, level) {
          const { th, labels, vals, tick, fig, wave } = lineData(r, level);
          const i = r.int(0, labels.length - 1);
          return {
            q: `${J(th.title, '을/를')} 나타낸 꺾은선그래프입니다. ${labels[i]}의 ${J(th.what, '은/는')} 몇 ${th.unit}인가요?`,
            fig,
            answer: { type: 'num', value: vals[i], unit: th.unit },
            steps: [`세로 눈금 한 칸은 $${tick}$${th.unit}${wave ? ' (아래쪽은 물결선으로 줄였어요)' : ''}`, `${labels[i]}의 점: $${vals[i]}$${th.unit}`],
          };
        },
      },
      {
        id: 'change',
        title: '변화가 가장 큰 때',
        gen(r, level) {
          const { th, labels, vals, fig } = lineData(r, level);
          const diffs = vals.slice(1).map((v, k) => v - vals[k]);
          const absd = diffs.map(Math.abs);
          const k = absd.indexOf(Math.max(...absd));
          const mode = level === 1 ? 'any' : r.pick(['any', 'up', 'down'] as const);
          let idx = k;
          let word = '가장 크게 변한';
          if (mode !== 'any') {
            const cand = diffs.map((dv, j) => ({ dv, j })).filter((x) => (mode === 'up' ? x.dv > 0 : x.dv < 0));
            if (cand.length) {
              const best = cand.reduce((a, b) => (Math.abs(b.dv) > Math.abs(a.dv) ? b : a));
              if (cand.filter((x) => Math.abs(x.dv) === Math.abs(best.dv)).length === 1) {
                idx = best.j;
                word = mode === 'up' ? '가장 많이 늘어난' : '가장 많이 줄어든';
              }
            }
          }
          const opt = (j: number) => `${J(labels[j], '와/과')} ${labels[j + 1]} 사이`;
          return {
            q: `${J(th.title, '을/를')} 나타낸 꺾은선그래프입니다. ${J(th.what, '이/가')} ${word} 때는 언제인가요?`,
            fig,
            answer: makeChoices(r, opt(idx), diffs.map((_, j) => opt(j)).filter((_, j) => j !== idx), 4),
            steps: [`선분이 가장 많이 기울어진 곳을 찾아요.`, ...diffs.map((dv, j) => `${opt(j)}: $${Math.abs(dv)}$${th.unit} ${dv >= 0 ? '늘어남' : '줄어듦'}`).slice(0, 6), `답: ${opt(idx)}`],
          };
        },
      },
      {
        id: 'diff',
        title: '두 때의 차이',
        gen(r, level) {
          const { th, labels, vals, fig } = lineData(r, level);
          const [i, j] = r.sample(labels.map((_, k) => k), 2).sort((a, b) => a - b);
          if (level === 3) {
            const mi = vals.indexOf(Math.max(...vals)),
              li = vals.indexOf(Math.min(...vals));
            return {
              q: `${J(th.title, '을/를')} 나타낸 꺾은선그래프입니다. ${J(th.what, '이/가')} 가장 클 때와 가장 작을 때의 차는 몇 ${th.unit}인가요?`,
              fig,
              answer: { type: 'num', value: vals[mi] - vals[li], unit: th.unit },
              steps: [`가장 큰 값: ${labels[mi]} $${vals[mi]}$, 가장 작은 값: ${labels[li]} $${vals[li]}$`, `$${vals[mi]}-${vals[li]}=${vals[mi] - vals[li]}$(${th.unit})`],
            };
          }
          return {
            q: `${J(th.title, '을/를')} 나타낸 꺾은선그래프입니다. ${J(labels[i], '와/과')} ${labels[j]}의 ${th.what} 차는 몇 ${th.unit}인가요?`,
            fig,
            answer: { type: 'num', value: Math.abs(vals[j] - vals[i]), unit: th.unit },
            steps: [`${labels[i]}: $${vals[i]}$, ${labels[j]}: $${vals[j]}$`, `$${Math.max(vals[i], vals[j])}-${Math.min(vals[i], vals[j])}=${Math.abs(vals[j] - vals[i])}$(${th.unit})`],
          };
        },
      },
      {
        id: 'middle',
        title: '중간 값 짐작하기',
        gen(r, level) {
          const th = LINE_THEMES[0];
          const n = 6;
          const step = level === 1 ? 2 : level === 2 ? 2 : 1;
          let vals: number[] = [];
          let k = 0;
          for (let t = 0; t < 300; t++) {
            vals = Array.from({ length: n }, () => r.int(5, 13) * step);
            k = r.int(0, n - 2);
            if ((vals[k] + vals[k + 1]) % 2 === 0 && vals[k] !== vals[k + 1]) break;
          }
          const mid = (vals[k] + vals[k + 1]) / 2;
          const labels = th.labels;
          const max = Math.ceil(Math.max(...vals) / 2) * 2 + 2;
          return {
            q: `${J(th.title, '을/를')} 나타낸 꺾은선그래프입니다. ${labels[k].replace('시', '')}시 $30$분의 기온은 약 몇 °C였을지 짐작해 보세요. (두 점의 가운데 값으로 생각하세요.)`,
            fig: lineChart(labels, vals, { unit: '°C', min: 0, max, step: 2 }),
            answer: { type: 'num', value: mid, unit: '°C' },
            steps: [`${labels[k]}: $${vals[k]}$°C, ${labels[k + 1]}: $${vals[k + 1]}$°C`, `가운데 값: $(${vals[k]}+${vals[k + 1]})\\div2=${mid}$ (°C)`],
          };
        },
      },
      {
        id: 'which-graph',
        title: '알맞은 그래프 고르기',
        gen(r, level) {
          const lineItems = ['하루 동안 교실 기온의 변화', '1년 동안 내 키의 변화', '월별 강수량의 변화', '매일 잰 강낭콩 싹의 키', '연도별 우리 마을 인구의 변화', '시간별 운동장 그림자 길이의 변화'];
          const barItems = ['우리 반 학생들이 좋아하는 과일', '반별 학급 문고의 수', '마을별 기르는 소의 수', '친구들이 가 보고 싶은 나라', '종류별 모은 재활용품의 수', '좋아하는 운동별 학생 수'];
          const wantLine = level === 3 ? r.chance(0.5) : true;
          const ans = r.pick(wantLine ? lineItems : barItems);
          return {
            q: `${wantLine ? '꺾은선그래프' : '막대그래프'}로 나타내기에 **가장 알맞은** 것은?`,
            answer: makeChoices(r, ans, r.sample(wantLine ? barItems : lineItems, 3), 4),
            steps: [wantLine ? '시간에 따라 변하는 양은 꺾은선그래프가 알맞아요.' : '여러 항목의 크기를 비교할 때는 막대그래프가 알맞아요.', `답: ${ans}`],
          };
        },
      },
    ],
  },

  // ═════════════ e4b-6 다각형 ═════════════
  'e4b-6': {
    concepts: [
      {
        title: '다각형',
        body: '**선분으로만 둘러싸인** 도형을 다각형이라고 해요. 변의 수에 따라 삼각형, 사각형, 오각형, 육각형 … 이라고 불러요.\n- 원처럼 곡선이 있거나, 열려 있는 도형은 다각형이 아니에요.',
      },
      {
        title: '정다각형',
        body: '**변의 길이가 모두 같고, 각의 크기가 모두 같은** 다각형을 정다각형이라고 해요. (정삼각형, 정사각형, 정오각형 …)\n- 마름모는 변의 길이는 같지만 각의 크기가 다를 수 있어 정다각형이 아닐 수 있어요.\n- 정다각형의 둘레 $=$ (한 변) $\\times$ (변의 수)',
      },
      {
        title: '대각선',
        body: '이웃하지 않는 두 꼭짓점을 이은 선분을 **대각선**이라고 해요.\n- $n$각형의 한 꼭짓점에서 그을 수 있는 대각선은 $n-3$개\n- 전체 대각선의 수 $=n\\times(n-3)\\div2$\n- 삼각형에는 대각선이 없어요.',
        example: { q: '육각형의 대각선은 몇 개?', a: '$6\\times3\\div2=9$(개)' },
      },
      {
        title: '사각형의 대각선의 성질',
        body: '- 두 대각선의 길이가 같은 사각형: 직사각형, 정사각형\n- 두 대각선이 서로 수직인 사각형: 마름모, 정사각형\n- 한 대각선이 다른 대각선을 똑같이 둘로 나누는 사각형: 평행사변형, 직사각형, 마름모, 정사각형',
      },
      {
        title: '다각형의 각의 크기의 합',
        body: '한 꼭짓점에서 대각선을 그어 삼각형으로 나누면 각의 합을 구할 수 있어요. $n$각형은 삼각형 $(n-2)$개 → $180^{\\circ}\\times(n-2)$\n- 정오각형의 한 각: $540^{\\circ}\\div5=108^{\\circ}$',
      },
    ],
    skills: [
      {
        id: 'polygon-name',
        title: '다각형의 이름',
        gen(r, level) {
          const NM = ['', '', '', '삼각형', '사각형', '오각형', '육각형', '칠각형', '팔각형', '구각형', '십각형'];
          if (level === 3) {
            const n = r.int(5, 10);
            const sum = 2 * n;
            const correct = `정${NM[n]}`;
            return {
              q: `변의 길이가 모두 같고 각의 크기가 모두 같은 다각형이 있습니다. 이 도형의 변의 수와 꼭짓점의 수를 더하면 $${sum}$입니다. 이 도형의 이름은?`,
              answer: makeChoices(r, correct, [n - 1, n + 1, sum, n - 2].filter((x) => x >= 3 && x <= 10 && x !== n).map((x) => `정${NM[x]}`).concat([NM[n]]), 4),
              steps: [`다각형은 변의 수와 꼭짓점의 수가 같아요: $${sum}\\div2=${n}$`, `변의 길이와 각의 크기가 모두 같으므로 ${correct}`],
            };
          }
          const n = r.int(level === 1 ? 3 : 5, level === 1 ? 8 : 10);
          const regular = level === 2;
          let pts: [number, number][];
          if (regular) pts = regularPolygon(n, 0, 0, 1, r.int(0, 30)).map(([x, y]) => [x, -y] as [number, number]);
          else
            pts = regularPolygon(n, 0, 0, 1, r.int(0, 30)).map(([x, y], i) => {
              const k = 0.75 + 0.5 * ((i * 37 + n * 11) % 7) / 7;
              return [x * k, -y * k] as [number, number];
            });
          const correct = regular ? `정${NM[n]}` : NM[n];
          const wrongs = regular ? [`정${NM[n - 1]}`, `정${NM[n === 10 ? 9 : n + 1]}`, NM[n], `정${NM[n === 5 ? 6 : n - 2]}`] : [NM[n - 1] || '원', NM[n + 1] || '구각형', NM[n === 3 ? 5 : n - 2] || '팔각형', `정${NM[n]}`];
          return {
            q: regular ? '변의 길이와 각의 크기가 모두 같은 다각형입니다. 이름을 고르세요.' : '다각형의 이름을 고르세요.',
            fig: polyFig(pts, { w: 180, h: 160, ticks: regular ? pts.map(() => 1) : undefined, extra: regular ? undefined : (sv, P) => P.forEach(([x, y]) => sv.dot(x, y)) }),
            answer: makeChoices(r, correct, wrongs.filter((w) => w && w !== correct), 4),
            steps: [`변이 $${n}$개예요.`, regular ? `변의 길이와 각의 크기가 모두 같으므로 ${correct}` : `따라서 ${correct}`],
          };
        },
      },
      {
        id: 'diag-count',
        title: '대각선의 수',
        gen(r, level) {
          const NM = ['', '', '', '삼각형', '사각형', '오각형', '육각형', '칠각형', '팔각형', '구각형', '십각형', '십일각형', '십이각형'];
          if (level === 3) {
            const n = r.int(5, 12);
            const dg = (n * (n - 3)) / 2;
            return {
              q: `대각선을 모두 그었더니 $${dg}$개였습니다. 이 다각형은 몇 각형인가요? (숫자로 답하세요. 예: 오각형 → 5)`,
              answer: { type: 'num', value: n, unit: '각형' },
              steps: [`$n$각형의 대각선 수는 $n\\times(n-3)\\div2$`, `$${n}\\times${n - 3}\\div2=${dg}$ → ${NM[n]}`],
              hint: '여러 다각형의 대각선 수를 차례로 구해 보세요.',
            };
          }
          const n = level === 1 ? r.int(4, 7) : r.int(7, 12);
          const dg = (n * (n - 3)) / 2;
          let fig: string | undefined;
          if (level === 1) {
            const pts = regularPolygon(n, 0, 0, 1, -90).map(([x, y]) => [x, -y] as [number, number]);
            fig = polyFig(pts, { w: 170, h: 150 });
            if (r.chance(0.5))
              return {
                q: `${NM[n]}의 한 꼭짓점에서 그을 수 있는 대각선은 몇 개인가요?`,
                fig,
                answer: { type: 'num', value: n - 3, unit: '개' },
                steps: [`자기 자신과 이웃한 두 꼭짓점에는 대각선을 그을 수 없어요.`, `$${n}-3=${n - 3}$(개)`],
              };
          }
          return {
            q: `${NM[n]}의 대각선은 모두 몇 개인가요?`,
            fig,
            answer: { type: 'num', value: dg, unit: '개' },
            steps: [`한 꼭짓점에서 그을 수 있는 대각선: $${n}-3=${n - 3}$(개)`, `꼭짓점 $${n}$개에서 그으면 같은 대각선을 두 번씩 세므로 $${n}\\times${n - 3}\\div2=${dg}$(개)`],
          };
        },
      },
      {
        id: 'regular-perimeter',
        title: '정다각형의 둘레',
        gen(r, level) {
          const NM = ['', '', '', '정삼각형', '정사각형', '정오각형', '정육각형', '정칠각형', '정팔각형', '정구각형', '정십각형'];
          const n = r.int(3, 10);
          const a = r.int(3, 15);
          if (level === 1)
            return {
              q: `한 변의 길이가 $${a}$ cm인 ${NM[n]}의 모든 변의 길이의 합은 몇 cm인가요?`,
              fig: polyFig(regularPolygon(n, 0, 0, 1, -90).map(([x, y]) => [x, -y] as [number, number]), { w: 170, h: 150, sides: [`${a} cm`], ticks: Array(n).fill(1) }),
              answer: { type: 'num', value: n * a, unit: 'cm' },
              steps: [`${NM[n]}은 변이 $${n}$개이고 길이가 모두 같아요.`, `$${a}\\times${n}=${n * a}$ (cm)`],
            };
          if (level === 2)
            return {
              q: `모든 변의 길이의 합이 $${n * a}$ cm인 ${NM[n]}의 한 변은 몇 cm인가요?`,
              answer: { type: 'num', value: a, unit: 'cm' },
              steps: [`$${n * a}\\div${n}=${a}$ (cm)`],
            };
          const [n1, n2, side] = until(
            () => [r.int(3, 10), r.int(3, 10), r.int(2, 12)],
            ([x, y, s]) => x !== y && (x * s) % y === 0,
          );
          return {
            q: `철사를 겹치지 않게 모두 사용하여 한 변이 $${side}$ cm인 ${NM[n1]}을 만들었습니다. 이 철사를 다시 펴서 ${NM[n2]}을 만들면 한 변은 몇 cm인가요?`,
            answer: { type: 'num', value: (n1 * side) / n2, unit: 'cm' },
            steps: [`철사의 길이: $${side}\\times${n1}=${n1 * side}$ (cm)`, `${NM[n2]}의 한 변: $${n1 * side}\\div${n2}=${(n1 * side) / n2}$ (cm)`],
          };
        },
      },
      {
        id: 'regular-angle',
        title: '정다각형의 한 각',
        gen(r, level) {
          const NM = ['', '', '', '정삼각형', '정사각형', '정오각형', '정육각형', '', '정팔각형', '정구각형', '정십각형', '', '정십이각형'];
          const n = level === 1 ? r.pick([3, 4, 5, 6, 8]) : r.pick([5, 6, 8, 9, 10, 12]);
          const sum = 180 * (n - 2);
          const one = sum / n;
          if (level === 3)
            return {
              q: `한 각의 크기가 $${one}^{\\circ}$인 정다각형은 몇 각형인가요? (숫자로 답하세요. 예: 정오각형 → 5)`,
              answer: { type: 'num', value: n, unit: '각형' },
              steps: [`정$n$각형의 한 각: $180^{\\circ}\\times(n-2)\\div n$`, `$n=${n}$일 때 $180^{\\circ}\\times${n - 2}\\div${n}=${one}^{\\circ}$ → ${NM[n]}`],
              hint: '정오각형, 정육각형, 정팔각형 … 의 한 각을 차례로 구해 보세요.',
            };
          return {
            q: `${NM[n]}의 한 각의 크기는 몇 도인가요?`,
            fig: level === 1 ? polyFig(regularPolygon(n, 0, 0, 1, -90).map(([x, y]) => [x, -y] as [number, number]), { w: 170, h: 150, angles: ['□'] }) : undefined,
            answer: { type: 'num', value: one, unit: '°' },
            steps: [`한 꼭짓점에서 대각선을 그으면 삼각형 $${n - 2}$개로 나뉘어요.`, `모든 각의 합: $180^{\\circ}\\times${n - 2}=${sum}^{\\circ}$`, `한 각: $${sum}^{\\circ}\\div${n}=${one}^{\\circ}$`],
          };
        },
      },
      {
        id: 'diag-props',
        title: '사각형의 대각선',
        gen(r) {
          const items: ProblemDraft[] = [];
          const props = [
            { q: '두 대각선의 길이가 항상 같은 사각형은?', a: '직사각형', w: ['마름모', '평행사변형', '사다리꼴'] },
            { q: '두 대각선이 항상 서로 수직으로 만나는 사각형은?', a: '마름모', w: ['직사각형', '평행사변형', '사다리꼴'] },
            { q: '두 대각선의 길이가 같고 서로 수직으로 만나는 사각형은?', a: '정사각형', w: ['직사각형', '마름모', '평행사변형', '사다리꼴'] },
            { q: '한 대각선이 다른 대각선을 똑같이 둘로 나누지 않을 수 있는 사각형은?', a: '사다리꼴', w: ['평행사변형', '직사각형', '마름모', '정사각형'] },
          ];
          const p = r.pick(props);
          items.push({
            q: p.q,
            answer: makeChoices(r, p.a, p.w, 4),
            steps: ['- 길이가 같음: 직사각형, 정사각형\n- 서로 수직: 마름모, 정사각형', `답: ${p.a}`],
          });
          return items[0];
        },
      },
    ],
  },
};

