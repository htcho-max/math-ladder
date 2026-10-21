// 초4 (e4a, e4b) 심화 유형(HARD4, 일반 skills 뒤에 붙임)과 최상위 유형(TOP4, UnitContent.top)
import type { Skill } from '../../core/types';
import { Svg, barChart } from '../../core/fig';
import { J, josa, asymShape, c, cellKey, cellsFig, d as dd, flipH, flipV, fr, mx, nm, rotN, type Cells } from './util';
import { divSteps, mul2Steps } from './arith';
import { boxes, geoFig, perms, ray, sum, until } from './hardutil';
import type { Pt } from './hardutil';

const DIG = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const num = (ds: number[]) => ds.reduce((a, b) => a * 10 + b, 0);
/** 천분의 일 단위 정수 → 소수 TeX */
const D = (milli: number) => dd(milli / 1000);
const POLY: Record<number, string> = {
  3: '삼각형',
  4: '사각형',
  5: '오각형',
  6: '육각형',
  7: '칠각형',
  8: '팔각형',
  9: '구각형',
  10: '십각형',
  11: '십일각형',
  12: '십이각형',
};
const IA: Record<number, number> = {
  3: 60,
  4: 90,
  5: 108,
  6: 120,
  8: 135,
  9: 140,
  10: 144,
  12: 150,
};

// ───────── 그래프 그리기 ─────────
interface BarOpt {
  step: number;
  max: number;
  nums?: boolean;
  title?: string;
  unit?: string;
}
function drawBars(s: Svg, x0: number, y0: number, W: number, H: number, labels: string[], values: number[], o: BarOpt) {
  const top = y0 + (o.title ? 22 : 12),
    bottom = y0 + H - 22,
    left = x0 + (o.nums === false ? 12 : 34);
  if (o.title) s.text(x0 + W / 2, y0 + 8, o.title, { size: 12 });
  const Y = (v: number) => bottom - (v / o.max) * (bottom - top);
  for (let v = 0; v <= o.max + 1e-9; v += o.step) {
    s.line(left, Y(v), x0 + W - 6, Y(v), { cls: 'grid' });
    if (o.nums !== false)
      s.text(left - 5, Y(v), String(v), {
        size: 10,
        anchor: 'end',
        cls: 'muted',
      });
  }
  if (o.unit && o.nums !== false)
    s.text(left - 5, top - 10, `(${o.unit})`, {
      size: 10,
      anchor: 'end',
      cls: 'muted',
    });
  const slot = (x0 + W - 6 - left) / labels.length;
  const bw = Math.min(30, slot - 10);
  labels.forEach((l, i) => {
    const cx = left + slot * i + slot / 2;
    s.rect(cx - bw / 2, Y(values[i]), bw, bottom - Y(values[i]), {
      cls: 'acc',
      fill: true,
    });
    s.text(cx, bottom + 12, l, { size: 11 });
  });
  s.line(left, bottom, x0 + W - 6, bottom);
}
interface LineOpt {
  min: number;
  max: number;
  step: number;
  nums?: boolean;
  unit?: string;
  names?: string[];
}
/** 꺾은선그래프 (여러 줄 가능, null 은 빠진 점) */
function lineFig(labels: string[], series: (number | null)[][], o: LineOpt): string {
  const w = Math.max(270, 48 * labels.length + 70),
    h = 210 + (o.names ? 16 : 0);
  const s = new Svg(w, h);
  const top = 22 + (o.names ? 16 : 0),
    bottom = h - 28,
    left = o.nums === false ? 18 : 42;
  const Y = (v: number) => bottom - ((v - o.min) / (o.max - o.min)) * (bottom - top);
  for (let v = o.min; v <= o.max + 1e-9; v += o.step) {
    s.line(left, Y(v), w - 10, Y(v), { cls: 'grid' });
    if (o.nums !== false)
      s.text(left - 6, Y(v), String(Math.round(v * 1000) / 1000), {
        size: 10,
        anchor: 'end',
        cls: 'muted',
      });
  }
  if (o.unit && o.nums !== false)
    s.text(left - 6, top - 10, `(${o.unit})`, {
      size: 10,
      anchor: 'end',
      cls: 'muted',
    });
  const X = (i: number) => left + 22 + i * ((w - left - 44) / Math.max(1, labels.length - 1));
  series.forEach((vals, si) => {
    const cls = si === 0 ? 'acc thick' : 'acc2 thick';
    for (let i = 0; i + 1 < vals.length; i++) {
      const a = vals[i],
        b = vals[i + 1];
      if (a !== null && b !== null) s.line(X(i), Y(a), X(i + 1), Y(b), { cls });
    }
    vals.forEach((v, i) => {
      if (v !== null) s.dot(X(i), Y(v), { cls: si === 0 ? 'acc' : 'acc2' });
    });
  });
  labels.forEach((l, i) => {
    s.text(X(i), bottom + 14, l, { size: 11 });
    if (series.some((vals) => vals[i] === null)) s.text(X(i), bottom - 12, '?', { size: 14, cls: 'acc2' });
  });
  s.line(left, bottom, w - 10, bottom);
  if (o.names)
    o.names.forEach((n, i) => {
      const x = left + 10 + i * 90;
      s.line(x, 12, x + 18, 12, { cls: i === 0 ? 'acc thick' : 'acc2 thick' });
      s.text(x + 24, 12, n, { size: 11, anchor: 'start' });
    });
  return s.toString();
}

// ═════════════════════════════ 심화 유형 ═════════════════════════════
export const HARD4: Record<string, Skill[]> = {
  // ───────── e4a-1 큰 수
  'e4a-1': [
    {
      id: 'big-cards',
      title: '수 카드로 조건에 맞는 큰 수 만들기',
      gen(r, level) {
        if (level <= 2) {
          const k = level === 1 ? 6 : 8;
          const cs = r.chance(0.7) ? [0, ...r.sample(DIG, k - 1)] : r.sample(DIG, k);
          const shown = r.shuffle(cs);
          const desc = [...cs].sort((a, b) => b - a);
          const asc = [...cs].sort((a, b) => a - b);
          if (asc[0] === 0) [asc[0], asc[1]] = [asc[1], asc[0]];
          const mode = level === 1 ? r.pick(['max', 'min']) : r.pick(['min', 'second']);
          const second = [...desc];
          [second[k - 1], second[k - 2]] = [second[k - 2], second[k - 1]];
          const v = num(mode === 'max' ? desc : mode === 'min' ? asc : second);
          const what = mode === 'max' ? '가장 큰' : mode === 'min' ? '가장 작은' : '둘째로 큰';
          return {
            q: `수 카드 $${boxes(shown)}$를 한 번씩 모두 사용하여 ${k === 6 ? '여섯' : '여덟'} 자리 수를 만들려고 합니다. 만들 수 있는 ${what} 수를 구하세요.`,
            answer: { type: 'num', value: v },
            steps: [
              mode === 'max'
                ? '높은 자리부터 큰 숫자를 차례로 놓아요.'
                : mode === 'min'
                  ? `높은 자리부터 작은 숫자를 차례로 놓아요.${cs.includes(0) ? ' 단, $0$은 맨 앞에 올 수 없으니 둘째 자리에 놓아요.' : ''}`
                  : `가장 큰 수는 $${c(num(desc))}$${josa(num(desc), '이에요/예요')}. 둘째로 큰 수는 끝의 두 숫자(십의 자리와 일의 자리)를 바꾼 수예요.`,
              `답: $${c(v)}$`,
            ],
          };
        }
        const PN = ['천만', '백만', '십만', '만', '천', '백', '십', '일'];
        const pos = r.int(1, 5);
        const cs = [0, ...r.sample(DIG, 7)];
        const f = r.pick(cs);
        const want = r.pick(['min', 'max']);
        const rest = cs.filter((x) => x !== f);
        const ds: number[] = new Array(8).fill(-1);
        ds[pos] = f;
        const pool = want === 'min' ? [...rest].sort((a, b) => a - b) : [...rest].sort((a, b) => b - a);
        // 첫 자리 (0 은 안 됨)
        const first = want === 'min' ? pool.find((x) => x !== 0)! : pool[0];
        ds[0] = first;
        const others = pool.filter((x) => x !== first);
        let k = 0;
        for (let i = 1; i < 8; i++) if (ds[i] < 0) ds[i] = others[k++];
        const v = num(ds);
        return {
          q: `수 카드 $${boxes(r.shuffle(cs))}$을 한 번씩 모두 사용하여 여덟 자리 수를 만들려고 합니다. ${PN[pos]}의 자리 숫자가 $${f}$인 수 중에서 가장 ${want === 'min' ? '작은' : '큰'} 수를 구하세요.`,
          answer: { type: 'num', value: v },
          steps: [
            `${PN[pos]}의 자리에 $${f}$을 먼저 놓아요.`,
            want === 'min' ? `남은 카드 중 맨 앞(천만의 자리)에는 $0$이 아닌 가장 작은 숫자 $${first}$를 놓아요.` : `남은 카드 중 가장 큰 숫자 $${first}$를 맨 앞(천만의 자리)에 놓아요.`,
            `나머지 자리에는 남은 숫자를 ${want === 'min' ? '작은' : '큰'} 것부터 차례로 놓아요.`,
            `답: $${c(v)}$`,
          ],
          hint: '조건으로 정해진 자리를 먼저 채우세요.',
        };
      },
    },
  ],

  // ───────── e4a-2 각도
  'e4a-2': [
    {
      id: 'overlap-angles',
      title: '겹치거나 나누어진 각의 크기',
      gen(r, level) {
        if (level === 1) {
          const x = r.int(4, 14) * 5;
          const P: Record<string, Pt> = {
            ㅇ: [0, 0],
            ㄱ: ray(0),
            ㄴ: ray(90 - x),
            ㄷ: ray(90),
            ㄹ: ray(180 - x),
          };
          const fig = geoFig({
            P,
            segs: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'].map((b) => ({ a: 'ㅇ', b })),
            angles: [
              { at: 'ㅇ', a: 'ㄱ', b: 'ㄷ', right: true },
              { at: 'ㅇ', a: 'ㄴ', b: 'ㄷ', text: `${x}°` },
            ],
            labelDir: {
              ㅇ: [0, -1],
              ㄱ: [1, 0],
              ㄴ: ray(90 - x),
              ㄷ: [0, 1],
              ㄹ: ray(180 - x),
            },
            w: 240,
            h: 170,
          });
          return {
            q: `각 ㄱㅇㄷ과 각 ㄴㅇㄹ은 모두 직각입니다. 각 ㄴㅇㄷ이 $${x}^{\\circ}$일 때, 각 ㄱㅇㄹ은 몇 도인가요?`,
            fig,
            answer: { type: 'num', value: 180 - x, unit: '°' },
            steps: [`각 ㄱㅇㄴ $=90^{\\circ}-${x}^{\\circ}=${90 - x}^{\\circ}$`, `각 ㄱㅇㄹ $=$ 각 ㄱㅇㄴ $+$ 각 ㄴㅇㄹ $=${90 - x}^{\\circ}+90^{\\circ}=${180 - x}^{\\circ}$`],
            hint: '두 직각이 겹친 부분을 생각해 보세요.',
          };
        }
        if (level === 2) {
          const a = r.int(4, 9) * 5;
          const k = r.int(2, 3);
          const ang = [a, k * a, 180 - (k + 1) * a];
          if (ang[2] < 20) ang[2] = 0;
          const [A, B] = ang[2] < 20 ? [a, 2] : [a, k];
          const t3 = 180 - (B + 1) * A;
          const P: Record<string, Pt> = {
            ㅇ: [0, 0],
            ㄱ: ray(180),
            ㄴ: ray(180 - A),
            ㄷ: ray(180 - A - B * A),
            ㄹ: ray(0),
          };
          const fig = geoFig({
            P,
            segs: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'].map((b) => ({ a: 'ㅇ', b })),
            angles: [
              { at: 'ㅇ', a: 'ㄱ', b: 'ㄴ', text: `${A}°` },
              { at: 'ㅇ', a: 'ㄷ', b: 'ㄹ', text: '?' },
            ],
            labelDir: {
              ㅇ: [0, -1],
              ㄱ: [-1, 0],
              ㄴ: ray(180 - A),
              ㄷ: ray(180 - A - B * A),
              ㄹ: [1, 0],
            },
            w: 260,
            h: 150,
          });
          return {
            q: `선분 ㄱㄹ은 일직선입니다. 각 ㄱㅇㄴ은 $${A}^{\\circ}$이고, 각 ㄴㅇㄷ은 각 ㄱㅇㄴ의 $${B}$배입니다. 각 ㄷㅇㄹ은 몇 도인가요?`,
            fig,
            answer: { type: 'num', value: t3, unit: '°' },
            steps: [`각 ㄴㅇㄷ $=${A}^{\\circ}\\times${B}=${A * B}^{\\circ}$`, `일직선은 $180^{\\circ}$ → 각 ㄷㅇㄹ $=180^{\\circ}-${A}^{\\circ}-${A * B}^{\\circ}=${t3}^{\\circ}$`],
          };
        }
        const a = r.int(5, 13) * 5;
        const b = 90 - a;
        const ask = r.pick(['ㄹㅇㅁ', 'ㄱㅇㄹ', 'ㄴㅇㅁ']);
        const ans = ask === 'ㄹㅇㅁ' ? b : ask === 'ㄱㅇㄹ' ? 2 * a + b : a + 2 * b;
        const dirs = [180, 180 - a, 180 - 2 * a, 180 - 2 * a - b, 0];
        const nmz = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ'];
        const P: Record<string, Pt> = { ㅇ: [0, 0] };
        const labelDir: Record<string, Pt> = { ㅇ: [0, -1] };
        nmz.forEach((n, i) => {
          P[n] = ray(dirs[i]);
          labelDir[n] = ray(dirs[i]);
        });
        const fig = geoFig({
          P,
          segs: nmz.map((b2) => ({ a: 'ㅇ', b: b2 })),
          angles: [
            { at: 'ㅇ', a: 'ㄱ', b: 'ㄴ', text: `${a}°` },
            { at: 'ㅇ', a: 'ㄴ', b: 'ㄷ' },
            { at: 'ㅇ', a: 'ㄷ', b: 'ㄹ', text: '•' },
            { at: 'ㅇ', a: 'ㄹ', b: 'ㅁ', text: '•' },
          ],
          labelDir,
          w: 260,
          h: 150,
        });
        return {
          q: `선분 ㄱㅁ은 일직선입니다. 각 ㄱㅇㄴ과 각 ㄴㅇㄷ의 크기가 같고, 각 ㄷㅇㄹ과 각 ㄹㅇㅁ의 크기가 같습니다. 각 ㄱㅇㄴ이 $${a}^{\\circ}$일 때, 각 ${ask}은 몇 도인가요?`,
          fig,
          answer: { type: 'num', value: ans, unit: '°' },
          steps: [
            `각 ㄱㅇㄷ $=${a}^{\\circ}\\times2=${2 * a}^{\\circ}$`,
            `각 ㄷㅇㅁ $=180^{\\circ}-${2 * a}^{\\circ}=${180 - 2 * a}^{\\circ}$ → 각 ㄷㅇㄹ $=$ 각 ㄹㅇㅁ $=${180 - 2 * a}^{\\circ}\\div2=${b}^{\\circ}$`,
            ask === 'ㄹㅇㅁ'
              ? `답: $${b}^{\\circ}$`
              : ask === 'ㄱㅇㄹ'
                ? `각 ㄱㅇㄹ $=${2 * a}^{\\circ}+${b}^{\\circ}=${ans}^{\\circ}$`
                : `각 ㄴㅇㅁ $=${a}^{\\circ}+${2 * b}^{\\circ}=${ans}^{\\circ}$`,
          ],
          hint: '일직선이 이루는 각은 180°예요.',
        };
      },
    },
  ],

  // ───────── e4a-3 곱셈과 나눗셈
  'e4a-3': [
    {
      id: 'cards-muldiv',
      title: '수 카드로 곱셈식·나눗셈식 만들기',
      gen(r, level) {
        if (level === 1) {
          const cs = r.sample(DIG, 3);
          const big = num([...cs].sort((a, b) => b - a));
          const k = r.int(12, 39);
          return {
            q: `수 카드 $${boxes(cs)}$을 한 번씩 모두 사용하여 만들 수 있는 가장 큰 세 자리 수에 $${k}$를 곱하면 얼마인가요?`,
            answer: { type: 'num', value: big * k },
            steps: [`가장 큰 세 자리 수: $${big}$`, ...mul2Steps(big, k)],
          };
        }
        if (level === 2) {
          const cs = r.chance(0.5) ? [0, ...r.sample(DIG, 4)] : r.sample(DIG, 5);
          const desc = [...cs].sort((a, b) => b - a);
          const big = num(desc.slice(0, 3));
          const rest = desc.slice(3).sort((a, b) => a - b);
          const small = rest[0] === 0 ? rest[1] * 10 : rest[0] * 10 + rest[1];
          const Q = Math.floor(big / small),
            R = big % small;
          return {
            q: `수 카드 $${boxes(r.shuffle(cs))}$ 중 $3$장으로 가장 큰 세 자리 수를 만들고, 남은 $2$장으로 가장 작은 두 자리 수를 만들었습니다. (세 자리 수)$\\div$(두 자리 수)의 몫과 나머지를 구하세요.`,
            answer: {
              type: 'fields',
              fields: [
                { label: '몫', value: Q },
                { label: '나머지', value: R },
              ],
            },
            steps: [`가장 큰 세 자리 수: $${big}$, 남은 카드로 만든 가장 작은 두 자리 수: $${small}$`, ...divSteps(big, small)],
          };
        }
        const cs = r.sample(DIG, 5);
        const all = perms(cs, 5).map((p) => ({
          a: num(p.slice(0, 3)),
          b: num(p.slice(3)),
          v: num(p.slice(0, 3)) * num(p.slice(3)),
        }));
        all.sort((x, y) => y.v - x.v);
        const seen = new Set<number>();
        const top = all.filter((x) => (seen.has(x.v) ? false : (seen.add(x.v), true))).slice(0, 3);
        const ds = [...cs].sort((a, b) => b - a);
        return {
          q: `수 카드 $${boxes(cs)}$를 한 번씩 모두 사용하여 (세 자리 수)$\\times$(두 자리 수)를 만들려고 합니다. 곱이 가장 크게 될 때의 곱을 구하세요.`,
          answer: { type: 'num', value: top[0].v },
          steps: [
            `가장 큰 두 숫자 $${ds[0]}$, $${ds[1]}$를 두 수의 가장 높은 자리(백의 자리, 십의 자리)에 놓아요.`,
            `남은 숫자를 바꾸어 가며 곱을 비교해요: ${top.map((x) => `$${x.a}\\times${x.b}=${c(x.v)}$`).join(', ')}`,
            `가장 큰 곱: $${top[0].a}\\times${top[0].b}=${c(top[0].v)}$`,
          ],
          hint: '두 자리 수의 십의 자리에도 큰 숫자가 와야 곱이 커져요.',
        };
      },
    },
  ],

  // ───────── e4a-4 평면도형의 이동
  'e4a-4': [
    {
      id: 'letter-symmetry',
      title: '뒤집거나 돌려도 처음과 같은 글자',
      gen(r, level) {
        const LR = 'AHIMOTUVWX'.split('');
        const UD = 'BCDEHIOX'.split('');
        const ROT = 'HINOSXZ'.split('');
        const ALL = 'ABCDEFGHIJLMNOPRSTUVWXZ'.split('');
        const props = [
          { name: '오른쪽으로 뒤집었을 때', set: LR },
          { name: '아래쪽으로 뒤집었을 때', set: UD },
          { name: '시계 방향으로 $180^{\\circ}$만큼 돌렸을 때', set: ROT },
        ];
        const k = level === 1 ? 5 : level === 2 ? 7 : 8;
        const pr = level === 1 ? props[0] : level === 2 ? r.pick(props) : null;
        const letters = until(
          () => r.sample(ALL, k),
          (ls) => {
            const set = pr ? pr.set : ROT;
            const n = ls.filter((x) => set.includes(x)).length;
            return n >= 2 && n <= k - 2;
          },
        );
        const show = `$${letters.map((x) => `\\boxed{\\mathsf{${x}}}`).join('\\;')}$`;
        if (pr) {
          const ok = letters.filter((x) => pr.set.includes(x));
          return {
            q: `다음 글자 카드 중에서 ${pr.name} 처음 글자와 같은 것은 모두 몇 개인가요? ${show}`,
            answer: { type: 'num', value: ok.length, unit: '개' },
            steps: [
              pr === props[0]
                ? '오른쪽으로 뒤집으면 왼쪽과 오른쪽이 바뀌어요. 세로로 반을 접어 겹쳐지는 글자를 찾아요.'
                : pr === props[1]
                  ? '아래쪽으로 뒤집으면 위와 아래가 바뀌어요. 가로로 반을 접어 겹쳐지는 글자를 찾아요.'
                  : '$180^{\\circ}$ 돌리면 위아래와 왼쪽 오른쪽이 모두 바뀌어요.',
              `처음과 같은 글자: ${ok.map((x) => `$\\mathsf{${x}}$`).join(', ')}`,
              `답: $${ok.length}$개`,
            ],
          };
        }
        const ok = letters.filter((x) => ROT.includes(x));
        return {
          q: `다음 글자 카드를 오른쪽으로 뒤집은 다음 다시 아래쪽으로 뒤집었습니다. 처음 글자와 같은 모양이 되는 것은 모두 몇 개인가요? ${show}`,
          answer: { type: 'num', value: ok.length, unit: '개' },
          steps: [
            '오른쪽으로 뒤집으면 좌우가, 다시 아래쪽으로 뒤집으면 위아래가 바뀌어요.',
            '좌우와 위아래가 모두 바뀌는 것은 $180^{\\circ}$ 돌린 것과 같아요.',
            `$180^{\\circ}$ 돌려도 같은 글자: ${ok.map((x) => `$\\mathsf{${x}}$`).join(', ')}`,
            `답: $${ok.length}$개`,
          ],
          hint: '두 번 뒤집은 결과는 한 번 돌린 결과와 같아요.',
        };
      },
    },
  ],

  // ───────── e4a-5 막대그래프
  'e4a-5': [
    {
      id: 'bar-rescale',
      title: '눈금 한 칸의 크기를 바꾸어 다시 그리기',
      gen(r, level) {
        const th = r.pick([
          {
            title: '좋아하는 운동별 학생 수',
            cats: ['축구', '야구', '수영', '농구', '배구'],
            unit: '명',
          },
          {
            title: '반별 모은 헌 종이의 무게',
            cats: ['1반', '2반', '3반', '4반', '5반'],
            unit: 'kg',
          },
          {
            title: '요일별 도서관 방문자 수',
            cats: ['월', '화', '수', '목', '금'],
            unit: '명',
          },
        ]);
        const [s1, s2] =
          level === 1
            ? [2, 1]
            : level === 2
              ? r.pick([
                  [5, 2],
                  [2, 5],
                  [10, 4],
                ])
              : r.pick([
                  [2, 5],
                  [5, 2],
                  [4, 10],
                ]);
        const lcm = [1, 2, 4, 5, 10, 20, 40].find((x) => x % s1 === 0 && x % s2 === 0) ?? s1 * s2;
        const lab = (k: number) => (th.cats[0] === '월' ? `${th.cats[k]}요일` : th.cats[k]);
        const vals = until(
          () => th.cats.map(() => r.int(1, level === 1 ? 8 : 6) * lcm),
          (v) => new Set(v).size === 5,
        );
        const max = Math.ceil((Math.max(...vals) + s1) / s1) * s1;
        // 눈금 칸이 많으면 세로 눈금 숫자가 겹치므로 몇 칸마다 하나씩만 적음
        const every = max / s1 <= 12 ? s1 : ([2, 5, 10].map((k) => k * s1).find((e) => max / e <= 8) ?? s1 * 10);
        const fig = barChart(th.cats, vals, { step: s1, max, unit: th.unit }).replace(/<text([^>]*class="muted"[^>]*)>(\d+)<\/text>/g, (m, _a, v) =>
          Number(v) % every === 0 ? m : '',
        );
        if (level <= 2) {
          const i = r.int(0, 4);
          return {
            q: `${J(th.title, '을/를')} 세로 눈금 한 칸이 $${s1}$${th.unit}인 막대그래프로 나타낸 것입니다. 세로 눈금 한 칸이 $${s2}$${th.unit}이 되도록 다시 그리면 ${lab(i)}의 막대는 몇 칸이 되나요?`,
            fig,
            answer: { type: 'num', value: vals[i] / s2, unit: '칸' },
            steps: [`${lab(i)}: $${vals[i] / s1}$칸 $\\times${s1}=${vals[i]}$ (${th.unit})`, `새 그래프: $${vals[i]}\\div${s2}=${vals[i] / s2}$ (칸)`],
            hint: '먼저 실제 양을 구해요.',
          };
        }
        const mxv = Math.max(...vals),
          mnv = Math.min(...vals);
        return {
          q: `${J(th.title, '을/를')} 세로 눈금 한 칸이 $${s1}$${th.unit}인 막대그래프로 나타낸 것입니다. 세로 눈금 한 칸이 $${s2}$${th.unit}이 되도록 다시 그리면, 가장 긴 막대와 가장 짧은 막대는 몇 칸 차이가 나나요?`,
          fig,
          answer: { type: 'num', value: (mxv - mnv) / s2, unit: '칸' },
          steps: [
            `가장 긴 막대: $${mxv / s1}$칸 → $${mxv}$${th.unit}, 가장 짧은 막대: $${mnv / s1}$칸 → $${mnv}$${th.unit}`,
            `차: $${mxv}-${mnv}=${mxv - mnv}$ (${th.unit})`,
            `새 그래프에서: $${mxv - mnv}\\div${s2}=${(mxv - mnv) / s2}$ (칸)`,
          ],
          hint: '실제 양의 차를 새 눈금 한 칸의 크기로 나누어요.',
        };
      },
    },
  ],

  // ───────── e4a-6 규칙 찾기
  'e4a-6': [
    {
      id: 'seq-nth',
      title: '규칙을 찾아 몇 번째 수 구하기',
      gen(r, level) {
        const a = r.int(3, 30),
          dd2 = r.int(2, 9);
        const t = (n: number) => a + dd2 * (n - 1);
        const show = `$$${[1, 2, 3, 4].map((n) => c(t(n))).join(',\\;')},\\;\\cdots$$`;
        if (level <= 2) {
          const n = level === 1 ? r.int(8, 12) : r.int(25, 50);
          return {
            q: `일정한 규칙으로 수를 늘어놓았습니다. ${n}번째 수를 구하세요.${show}`,
            answer: { type: 'num', value: t(n) },
            steps: [`$${dd2}$씩 커지는 규칙이에요.`, `${n}번째 수는 첫째 수에 $${dd2}$를 $${n - 1}$번 더한 수`, `$${a}+${dd2}\\times${n - 1}=${c(t(n))}$`],
            hint: '첫째 수에서 몇 번 더했는지 세어 보세요.',
          };
        }
        const M = r.int(200, 600);
        const n = Math.floor((M - a) / dd2) + 2; // 처음으로 M 보다 커지는 째
        return {
          q: `일정한 규칙으로 수를 늘어놓았습니다. 처음으로 $${M}$보다 커지는 수는 몇 번째 수인가요? (숫자로 답하세요.)${show}`,
          answer: { type: 'num', value: n, unit: '번째' },
          steps: [
            `$${dd2}$씩 커지므로 □번째 수 $=${a}+${dd2}\\times($□$-1)$`,
            `$${M}-${a}=${M - a}$, $${M - a}\\div${dd2}=${Math.floor((M - a) / dd2)}$ … $${(M - a) % dd2}$`,
            `$${n - 1}$번째 수: $${c(t(n - 1))}$ ($${M}$ 이하), $${n}$번째 수: $${c(t(n))}$`,
            `답: $${n}$번째`,
          ],
          hint: '몇 번 더해야 그 수를 넘는지 나눗셈으로 구해요.',
        };
      },
    },
  ],

  // ───────── e4b-1 분수의 덧셈과 뺄셈
  'e4b-1': [
    {
      id: 'frac-cards',
      title: '수 카드로 대분수 만들어 계산하기',
      gen(r, level) {
        if (level === 1) {
          const den = 7;
          const cs = r.sample([1, 2, 3, 4, 5, 6], 3);
          const ds = [...cs].sort((a, b) => b - a);
          const a = r.int(1, 6);
          const tot = ds[0] * den + ds[1] + a;
          return {
            q: `수 카드 $${boxes(cs)}$ 중에서 $2$장을 골라 분모가 $${den}$인 가장 큰 대분수 $\\square\\frac{\\square}{${den}}$를 만들었습니다. 이 대분수와 $${fr(a, den)}$의 합을 구하세요.`,
            answer: { type: 'num', value: tot / den, display: 'mixed' },
            steps: [
              `자연수 부분에 가장 큰 수 $${ds[0]}$, 분자에 둘째로 큰 수 $${ds[1]}$ → $${ds[0]}${fr(ds[1], den)}$`,
              `$${ds[0]}${fr(ds[1], den)}+${fr(a, den)}=${ds[0]}${fr(ds[1] + a, den)}${ds[1] + a >= den ? `=${mx(tot, den)}` : ''}$`,
            ],
          };
        }
        const den = r.pick([11, 13]);
        if (level === 2) {
          const cs = r.sample(DIG, 4);
          const ds = [...cs].sort((a, b) => b - a);
          const big = ds[0] * den + ds[1],
            small = ds[3] * den + ds[2];
          return {
            q: `수 카드 $${boxes(cs)}$ 중에서 $2$장을 골라 분모가 $${den}$인 대분수를 만들려고 합니다. 만들 수 있는 가장 큰 대분수와 가장 작은 대분수의 차를 구하세요.`,
            answer: { type: 'num', value: (big - small) / den, display: 'mixed' },
            steps: [
              `가장 큰 대분수: 자연수 부분에 가장 큰 수, 분자에 둘째로 큰 수 → $${ds[0]}${fr(ds[1], den)}$`,
              `가장 작은 대분수: 자연수 부분에 가장 작은 수, 분자에 둘째로 작은 수 → $${ds[3]}${fr(ds[2], den)}$`,
              `$${ds[0]}${fr(ds[1], den)}-${ds[3]}${fr(ds[2], den)}=${ds[1] >= ds[2] ? `${ds[0] - ds[3]}${fr(ds[1] - ds[2], den)}` : `${fr(big, den)}-${fr(small, den)}=${fr(big - small, den)}`}${ds[1] >= ds[2] ? '' : `=${mx(big - small, den)}`}$`,
            ],
            hint: '자연수 부분이 클수록 큰 대분수예요.',
          };
        }
        const cs = r.sample(DIG, 4);
        const want = r.pick(['sum', 'diff']);
        let best = -1,
          ex: number[] = [];
        for (const p of perms(cs, 4)) {
          const A = p[0] * den + p[1],
            B = p[2] * den + p[3];
          const v = want === 'sum' ? A + B : A - B;
          if (v > best) {
            best = v;
            ex = p;
          }
        }
        const A = ex[0] * den + ex[1],
          B = ex[2] * den + ex[3];
        return {
          q: `수 카드 $${boxes(cs)}$를 한 번씩 모두 사용하여 분모가 $${den}$인 대분수 $2$개를 만들려고 합니다. 두 대분수의 ${want === 'sum' ? '합이' : '차가'} 가장 클 때의 ${want === 'sum' ? '합' : '차'}을 구하세요.`.replace(
            '차을',
            '차를',
          ),
          answer: { type: 'num', value: best / den, display: 'mixed' },
          steps: [
            want === 'sum' ? '자연수 부분이 합에 가장 큰 영향을 주므로 큰 두 수를 자연수 부분에 놓아요.' : '큰 대분수는 자연수 부분을 가장 크게, 작은 대분수는 자연수 부분을 가장 작게 해요.',
            want === 'sum' ? '남은 두 수는 분자가 돼요.' : '남은 두 수 중 큰 수는 큰 대분수의 분자, 작은 수는 작은 대분수의 분자로 해요.',
            `$${ex[0]}${fr(ex[1], den)}${want === 'sum' ? '+' : '-'}${ex[2]}${fr(ex[3], den)}=${fr(A, den)}${want === 'sum' ? '+' : '-'}${fr(B, den)}=${fr(best, den)}=${mx(best, den)}$`,
          ],
          hint: '자연수 부분과 분자 중 어느 쪽이 더 큰 영향을 주는지 생각해 보세요.',
        };
      },
    },
  ],

  // ───────── e4b-2 삼각형
  'e4b-2': [
    {
      id: 'count-triangles',
      title: '크고 작은 삼각형 세기',
      gen(r, level) {
        const k = level === 1 ? r.int(1, 2) : level === 2 ? r.int(2, 4) : r.int(1, 3);
        const cut = level === 3;
        const xs = until(
          () => Array.from({ length: k }, () => r.int(-80, 80) / 100).sort((a, b) => a - b),
          (v) => v.every((x, i) => i === 0 || x - v[i - 1] > 0.3) && v.every((x) => Math.abs(x) < 0.8),
        );
        const P: Record<string, Pt> = { T: [0, 1.4], L: [-1, 0], R: [1, 0] };
        xs.forEach((x, i) => (P[`b${i}`] = [x, 0]));
        const segs = xs.map((_, i) => ({ a: 'T', b: `b${i}` }));
        if (cut) {
          P['ML'] = [-0.5, 0.7];
          P['MR'] = [0.5, 0.7];
          segs.push({ a: 'ML', b: 'MR' });
        }
        const fig = geoFig({
          P,
          polys: [['T', 'L', 'R']],
          segs,
          labels: [],
          w: 220,
          h: 170,
        });
        const base = ((k + 2) * (k + 1)) / 2;
        const tot = cut ? 2 * base : base;
        return {
          q: `그림에서 찾을 수 있는 크고 작은 삼각형은 모두 몇 개인가요?`,
          fig,
          answer: { type: 'num', value: tot, unit: '개' },
          steps: [
            `꼭대기에서 아래로 그은 선분(양쪽 변 포함)은 $${k + 2}$개예요.`,
            `밑변 위의 삼각형: 작은 삼각형 $1$개짜리 $${k + 1}$개, $2$개짜리 $${k}$개, … → $${Array.from({ length: k + 1 }, (_, i) => k + 1 - i).join('+')}=${base}$개`,
            ...(cut ? [`가로로 그은 선분 위에도 같은 방법으로 $${base}$개가 생겨요.`, `모두 $${base}+${base}=${tot}$개`] : [`답: $${base}$개`]),
          ],
          hint: '작은 삼각형 1개짜리, 2개짜리, … 로 나누어 세요.',
        };
      },
    },
  ],

  // ───────── e4b-3 소수의 덧셈과 뺄셈
  'e4b-3': [
    {
      id: 'dec-wrong',
      title: '잘못 계산한 소수의 덧셈과 뺄셈',
      gen(r, level) {
        if (level === 1) {
          const a = r.int(110, 899) * 10,
            x = r.int(a / 10 + 50, 990) * 10; // 소수 둘째 자리까지
          const W = x - a;
          return {
            q: `어떤 수에 $${D(a)}$를 더해야 할 것을 잘못하여 뺐더니 $${D(W)}$가 되었습니다. 바르게 계산하면 얼마인가요?`,
            answer: { type: 'num', value: (x + a) / 1000, display: 'dec' },
            steps: [`어떤 수 $=${D(W)}+${D(a)}=${D(x)}$`, `바르게 계산: $${D(x)}+${D(a)}=${D(x + a)}$`],
          };
        }
        if (level === 2) {
          const a = r.int(101, 899) * 10; // 예: 3.25
          const x = r.int(100, 2500) * 10;
          const W = x + 10 * a;
          return {
            q: `어떤 수에 $${D(a)}$를 더해야 할 것을 잘못하여 $${D(a)}$의 소수점을 오른쪽으로 한 자리 옮긴 수를 더했더니 $${D(W)}$가 되었습니다. 바르게 계산하면 얼마인가요?`,
            answer: { type: 'num', value: (x + a) / 1000, display: 'dec' },
            steps: [`잘못 더한 수: $${D(a)}$의 $10$배 $=${D(10 * a)}$`, `어떤 수 $=${D(W)}-${D(10 * a)}=${D(x)}$`, `바르게 계산: $${D(x)}+${D(a)}=${D(x + a)}$`],
            hint: '소수점을 오른쪽으로 한 자리 옮기면 10배가 돼요.',
          };
        }
        const a = r.int(110, 899) * 10;
        const x = r.int(a / 10 + 20, 1500) * 10 + r.int(0, 9);
        const W = x - a / 10;
        const ask = r.pick(['right', 'diff']);
        return {
          q: `어떤 수에서 $${D(a)}$를 빼야 할 것을 잘못하여 $${D(a)}$의 소수점을 왼쪽으로 한 자리 옮긴 수를 뺐더니 $${D(W)}$가 되었습니다. ${ask === 'right' ? '바르게 계산하면 얼마인가요?' : '바르게 계산한 값과 잘못 계산한 값의 차는 얼마인가요?'}`,
          answer: {
            type: 'num',
            value: (ask === 'right' ? x - a : a - a / 10) / 1000,
            display: 'dec',
          },
          steps: [
            `잘못 뺀 수: $${D(a)}$의 $${fr(1, 10)}$ $=${D(a / 10)}$`,
            `어떤 수 $=${D(W)}+${D(a / 10)}=${D(x)}$`,
            `바르게 계산: $${D(x)}-${D(a)}=${D(x - a)}$`,
            ...(ask === 'diff' ? [`차: $${D(W)}-${D(x - a)}=${D(a - a / 10)}$ (뺀 두 수의 차 $${D(a)}-${D(a / 10)}$와 같아요)`] : []),
          ],
          hint: '소수점을 왼쪽으로 한 자리 옮기면 1/10이 돼요.',
        };
      },
    },
  ],

  // ───────── e4b-4 사각형
  'e4b-4': [
    {
      id: 'rhombus-diag-angle',
      title: '마름모의 대각선과 이등변삼각형으로 각 구하기',
      gen(r, level) {
        const beta = level === 1 ? 180 - r.int(28, 70) * 2 : r.int(20, 55) * 2;
        const b = (beta * Math.PI) / 180;
        const P: Record<string, Pt> = {
          ㄴ: [0, 0],
          ㄷ: [1, 0],
          ㄱ: [Math.cos(b), Math.sin(b)],
          ㄹ: [1 + Math.cos(b), Math.sin(b)],
        };
        if (level <= 2) {
          const fig = geoFig({
            P,
            polys: [['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ']],
            segs: [{ a: 'ㄴ', b: 'ㄹ' }],
            angles:
              level === 1
                ? [
                    { at: 'ㄱ', a: 'ㄴ', b: 'ㄹ', text: `${180 - beta}°` },
                    { at: 'ㄴ', a: 'ㄱ', b: 'ㄹ', text: '?' },
                  ]
                : [
                    { at: 'ㄴ', a: 'ㄱ', b: 'ㄷ', text: `${beta}°` },
                    { at: 'ㄹ', a: 'ㄱ', b: 'ㄴ', text: '?' },
                  ],
            w: 260,
            h: 170,
          });
          if (level === 1)
            return {
              q: `마름모 ㄱㄴㄷㄹ에 대각선 ㄴㄹ을 그었습니다. 각 ㄴㄱㄹ이 $${180 - beta}^{\\circ}$일 때, 각 ㄱㄴㄹ은 몇 도인가요?`,
              fig,
              answer: { type: 'num', value: beta / 2, unit: '°' },
              steps: [
                '마름모는 네 변의 길이가 같으니 삼각형 ㄱㄴㄹ은 변 ㄱㄴ과 변 ㄱㄹ의 길이가 같은 이등변삼각형이에요.',
                `각 ㄱㄴㄹ $=$ 각 ㄱㄹㄴ $=(180^{\\circ}-${180 - beta}^{\\circ})\\div2=${beta / 2}^{\\circ}$`,
              ],
            };
          return {
            q: `마름모 ㄱㄴㄷㄹ에 대각선 ㄴㄹ을 그었습니다. 각 ㄱㄴㄷ이 $${beta}^{\\circ}$일 때, 각 ㄱㄹㄴ은 몇 도인가요?`,
            fig,
            answer: { type: 'num', value: beta / 2, unit: '°' },
            steps: [
              `마름모의 이웃한 두 각의 합은 $180^{\\circ}$ → 각 ㄴㄱㄹ $=180^{\\circ}-${beta}^{\\circ}=${180 - beta}^{\\circ}$`,
              '삼각형 ㄱㄴㄹ은 변 ㄱㄴ과 변 ㄱㄹ의 길이가 같은 이등변삼각형',
              `각 ㄱㄹㄴ $=(180^{\\circ}-${180 - beta}^{\\circ})\\div2=${beta / 2}^{\\circ}$`,
            ],
            hint: '마름모는 네 변의 길이가 모두 같아요.',
          };
        }
        // 정삼각형 ㄷㄹㅁ 을 바깥쪽에
        const C = P['ㄷ'],
          Dd = P['ㄹ'];
        const mid: Pt = [(C[0] + Dd[0]) / 2, (C[1] + Dd[1]) / 2];
        const v: Pt = [Dd[0] - C[0], Dd[1] - C[1]];
        let nrm: Pt = [v[1], -v[0]];
        const cen: Pt = [(1 + Math.cos(b)) / 2, Math.sin(b) / 2];
        if (nrm[0] * (mid[0] - cen[0]) + nrm[1] * (mid[1] - cen[1]) < 0) nrm = [-nrm[0], -nrm[1]];
        P['ㅁ'] = [mid[0] + (nrm[0] * Math.sqrt(3)) / 2, mid[1] + (nrm[1] * Math.sqrt(3)) / 2];
        const ans = (120 - beta) / 2;
        const fig = geoFig({
          P,
          polys: [
            ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'],
            ['ㄷ', 'ㅁ', 'ㄹ'],
          ],
          segs: [{ a: 'ㄱ', b: 'ㅁ' }],
          angles: [
            { at: 'ㄴ', a: 'ㄱ', b: 'ㄷ', text: `${beta}°` },
            { at: 'ㄱ', a: 'ㄹ', b: 'ㅁ', text: '?' },
          ],
          w: 270,
          h: 190,
        });
        return {
          q: `마름모 ㄱㄴㄷㄹ의 변 ㄷㄹ에 정삼각형 ㄷㄹㅁ을 붙여 그리고, 점 ㄱ과 점 ㅁ을 이었습니다. 각 ㄱㄴㄷ이 $${beta}^{\\circ}$일 때, 각 ㄹㄱㅁ은 몇 도인가요?`,
          fig,
          answer: { type: 'num', value: ans, unit: '°' },
          steps: [
            `마름모의 마주 보는 각은 같으니 각 ㄱㄹㄷ $=$ 각 ㄱㄴㄷ $=${beta}^{\\circ}$`,
            `각 ㄱㄹㅁ $=${beta}^{\\circ}+60^{\\circ}=${beta + 60}^{\\circ}$`,
            '변 ㄹㄱ $=$ 변 ㄹㄷ $=$ 변 ㄹㅁ 이므로 삼각형 ㄹㄱㅁ은 이등변삼각형',
            `각 ㄹㄱㅁ $=(180^{\\circ}-${beta + 60}^{\\circ})\\div2=${ans}^{\\circ}$`,
          ],
          hint: '마름모의 변과 정삼각형의 변의 길이가 모두 같아요.',
        };
      },
    },
  ],

  // ───────── e4b-5 꺾은선그래프
  'e4b-5': [
    {
      id: 'line-missing',
      title: '찢어진 꺾은선그래프의 값 구하기',
      gen(r, level) {
        const th = r.pick([
          {
            title: '요일별 도서관 방문자 수',
            labs: ['월요일', '화요일', '수요일', '목요일', '금요일'],
            unit: '명',
            step: 10,
            lo: 3,
            hi: 12,
          },
          // 값을 모두 더하는 문제이므로 더해서 뜻이 있는 양(개수)만 씀 (기온·키는 더하지 않음)
          {
            title: '주별 모은 칭찬 붙임딱지의 수',
            labs: ['1주', '2주', '3주', '4주', '5주'],
            unit: '장',
            step: 2,
            lo: 1,
            hi: 12,
          },
          {
            title: '월별 팔린 우산의 수',
            labs: ['3월', '4월', '5월', '6월', '7월'],
            unit: '개',
            step: 5,
            lo: 2,
            hi: 13,
          },
        ]);
        const vals = until(
          () => th.labs.map(() => r.int(th.lo, th.hi) * th.step),
          (v) => new Set(v).size >= 4,
        );
        const tot = sum(vals);
        const max = (th.hi + 2) * th.step;
        const i = r.int(1, 3);
        if (level <= 2) {
          const shown = vals.map((v, k) => (k === i ? null : v));
          const fig = lineFig(th.labs, [shown], {
            min: 0,
            max,
            step: th.step,
            unit: th.unit,
          });
          const known = tot - vals[i];
          if (level === 1)
            return {
              q: `${J(th.title, '을/를')} 나타낸 꺾은선그래프의 일부가 찢어져 ${th.labs[i]}의 값이 보이지 않습니다. 다섯 번 조사한 값을 모두 더하면 $${tot}$${th.unit}일 때, ${th.labs[i]}의 값은 얼마인가요?`,
              fig,
              answer: { type: 'num', value: vals[i], unit: th.unit },
              steps: [`보이는 값의 합: $${vals.filter((_, k) => k !== i).join('+')}=${known}$`, `${th.labs[i]}: $${tot}-${known}=${vals[i]}$ (${th.unit})`],
            };
          const diffs = vals.slice(1).map((v, k) => v - vals[k]);
          const mxd = Math.max(...diffs);
          if (mxd <= 0 || diffs.filter((x) => x === mxd).length > 1)
            return {
              q: `${J(th.title, '을/를')} 나타낸 꺾은선그래프의 일부가 찢어져 ${th.labs[i]}의 값이 보이지 않습니다. 다섯 번 조사한 값을 모두 더하면 $${tot}$${th.unit}일 때, 가장 높은 값과 가장 낮은 값의 차는 얼마인가요?`,
              fig,
              answer: {
                type: 'num',
                value: Math.max(...vals) - Math.min(...vals),
                unit: th.unit,
              },
              steps: [
                `${th.labs[i]}: $${tot}-${known}=${vals[i]}$ (${th.unit})`,
                `가장 높은 값 $${Math.max(...vals)}$, 가장 낮은 값 $${Math.min(...vals)}$`,
                `차: $${Math.max(...vals) - Math.min(...vals)}$ (${th.unit})`,
              ],
            };
          const at = diffs.indexOf(mxd);
          return {
            q: `${J(th.title, '을/를')} 나타낸 꺾은선그래프의 일부가 찢어져 ${th.labs[i]}의 값이 보이지 않습니다. 다섯 번 조사한 값을 모두 더하면 $${tot}$${th.unit}일 때, 바로 전에 비해 가장 많이 늘어난 때는 얼마만큼 늘었나요?`,
            fig,
            answer: { type: 'num', value: mxd, unit: th.unit },
            steps: [
              `${th.labs[i]}: $${tot}-${known}=${vals[i]}$ (${th.unit})`,
              `바로 전과의 차: ${diffs.map((x, k) => `${th.labs[k + 1]} $${x >= 0 ? '+' : ''}${x}$`).join(', ')}`,
              `가장 많이 늘어난 때: ${th.labs[at]}에서 ${th.labs[at + 1]} 사이, $${mxd}$${th.unit}`,
            ],
            hint: '먼저 찢어진 부분의 값을 구해요.',
          };
        }
        const dv = until(
          () => r.int(1, 4) * th.step,
          () => true,
        );
        vals[i + 1] = vals[i] + dv;
        if (vals[i + 1] > max - th.step) vals[i] -= 2 * dv;
        vals[i + 1] = vals[i] + dv;
        const t2 = sum(vals);
        const shown = vals.map((v, k) => (k === i || k === i + 1 ? null : v));
        const fig = lineFig(th.labs, [shown], {
          min: 0,
          max,
          step: th.step,
          unit: th.unit,
        });
        const known = t2 - vals[i] - vals[i + 1];
        const askI = r.pick([i, i + 1]);
        return {
          q: `${J(th.title, '을/를')} 나타낸 꺾은선그래프의 일부가 찢어져 ${J(th.labs[i], '와/과')} ${th.labs[i + 1]}의 값이 보이지 않습니다. 다섯 번 조사한 값을 모두 더하면 $${t2}$${th.unit}이고, ${th.labs[i + 1]}의 값은 ${th.labs[i]}보다 $${dv}$${th.unit} 더 큽니다. ${th.labs[askI]}의 값은 얼마인가요?`,
          fig,
          answer: { type: 'num', value: vals[askI], unit: th.unit },
          steps: [
            `보이는 세 값의 합: $${known}$ → 보이지 않는 두 값의 합: $${t2}-${known}=${t2 - known}$`,
            `${J(th.labs[i], '을/를')} □라 하면 □ $+$ □ $+${dv}=${t2 - known}$`,
            `□의 $2$배 $=${t2 - known - dv}$ → □ $=${vals[i]}$`,
            `${th.labs[i + 1]}: $${vals[i]}+${dv}=${vals[i + 1]}$`,
            `답: $${vals[askI]}$${th.unit}`,
          ],
          hint: '보이지 않는 두 값의 합과 차를 이용해요.',
        };
      },
    },
  ],

  // ───────── e4b-6 다각형
  'e4b-6': [
    {
      id: 'diag-vertex',
      title: '한 꼭짓점에서 그은 대각선으로 다각형 알아내기',
      gen(r, level) {
        if (level === 1) {
          const k = r.int(2, 9);
          return {
            q: `한 꼭짓점에서 그을 수 있는 대각선이 $${k}$개인 다각형은 몇 각형인가요? (숫자로 답하세요. 예: 오각형 → 5)`,
            answer: { type: 'num', value: k + 3 },
            steps: ['한 꼭짓점에서는 자기 자신과 이웃한 두 꼭짓점을 뺀 나머지 꼭짓점으로 대각선을 그을 수 있어요.', `꼭짓점의 수 $=${k}+3=${k + 3}$ → ${POLY[k + 3] ?? `${k + 3}각형`}`],
          };
        }
        if (level === 2) {
          const k = r.int(3, 9);
          const n = k + 3;
          return {
            q: `한 꼭짓점에서 그을 수 있는 대각선이 $${k}$개인 다각형이 있습니다. 이 다각형에 그을 수 있는 대각선은 모두 몇 개인가요?`,
            answer: { type: 'num', value: (n * k) / 2, unit: '개' },
            steps: [`꼭짓점의 수: $${k}+3=${n}$`, `꼭짓점마다 $${k}$개씩 그으면 $${n}\\times${k}=${n * k}$개인데, 대각선 하나를 양 끝에서 두 번 센 것이에요.`, `$${n * k}\\div2=${(n * k) / 2}$ (개)`],
            hint: '같은 대각선을 두 번 세지 않도록 주의해요.',
          };
        }
        const k = r.int(4, 9);
        const n = 2 * k;
        const ask = r.pick(['n', 'total']);
        return {
          q: `어떤 다각형에 그을 수 있는 대각선의 수는 한 꼭짓점에서 그을 수 있는 대각선의 수의 $${k}$배입니다. ${ask === 'n' ? '이 다각형은 몇 각형인가요? (숫자로 답하세요. 예: 오각형 → 5)' : '이 다각형의 대각선은 모두 몇 개인가요?'}`,
          answer: ask === 'n' ? { type: 'num', value: n } : { type: 'num', value: k * (n - 3), unit: '개' },
          steps: [
            '꼭짓점이 □개이면 한 꼭짓점에서 그을 수 있는 대각선은 (□$-3$)개',
            '대각선 전체는 (□$-3$)개를 □번 세고 $2$로 나눈 수 → 한 꼭짓점에서 그은 수의 (□$\\div2$)배',
            `□$\\div2=${k}$ → □ $=${n}$`,
            ask === 'n' ? `답: $${n}$각형` : `대각선 수: $${n}\\times${n - 3}\\div2=${k * (n - 3)}$ (개)`,
          ],
          hint: '대각선 전체의 수를 한 꼭짓점에서 그은 수와 꼭짓점의 수로 나타내 보세요.',
        };
      },
    },
  ],
};

// ═════════════════════════════ 최상위 유형 ═════════════════════════════
const LAB4 = ['가', '나', '다', '라'];
const ALL8 = (sh: Cells): Cells[] => [0, 1, 2, 3].flatMap((k) => [rotN(sh, k), rotN(flipH(sh), k)]);

export const TOP4: Record<string, Skill[]> = {
  // ───────── e4a-1
  'e4a-1': [
    {
      id: 'top-closest-target',
      title: '수 카드로 어떤 수에 가장 가까운 수 만들기',
      gen(r) {
        const seven = r.chance(0.5);
        const cs = r.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], seven ? 7 : 8);
        const len = cs.length;
        const [lead, below, above] = until(
          () => {
            const t = r.int(2, 9);
            const rest = cs.filter((x) => x !== t - 1);
            const bel = num([t - 1, ...rest.sort((a, b) => b - a)]);
            const rest2 = cs.filter((x) => x !== t);
            const abv = num([t, ...rest2.sort((a, b) => a - b)]);
            return [t, bel, abv] as [number, number, number];
          },
          ([t, bel, abv]) => cs.includes(t) && cs.includes(t - 1) && abv - t * 10 ** (len - 1) !== t * 10 ** (len - 1) - bel,
        );
        const T = lead * 10 ** (len - 1);
        const d1 = T - below,
          d2 = above - T;
        const ans = d1 < d2 ? below : above;
        const Tname = seven ? `${lead}백만` : `${lead}천만`;
        return {
          q: `수 카드 $${boxes(r.shuffle(cs))}$를 한 번씩 모두 사용하여 ${seven ? '일곱' : '여덟'} 자리 수를 만들려고 합니다. 만들 수 있는 수 중에서 ${Tname}($${c(T)}$)에 가장 가까운 수를 구하세요.`,
          answer: { type: 'num', value: ans },
          steps: [
            `가장 높은 자리 숫자는 $${lead - 1}$ 또는 $${lead}$이어야 해요.`,
            `$${c(T)}$보다 작은 수 중 가장 큰 수: 맨 앞에 $${lead - 1}$, 나머지는 큰 숫자부터 → $${c(below)}$`,
            `$${c(T)}$보다 큰 수 중 가장 작은 수: 맨 앞에 $${lead}$, 나머지는 작은 숫자부터 → $${c(above)}$`,
            `차: $${c(T)}-${c(below)}=${c(d1)}$, $${c(above)}-${c(T)}=${c(d2)}$`,
            `더 가까운 수: $${c(ans)}$`,
          ],
          hint: '기준이 되는 수보다 조금 작은 수와 조금 큰 수를 각각 만들어 비교해요.',
        };
      },
    },
    {
      id: 'top-money-ways',
      title: '수표와 지폐로 금액 만드는 방법의 수',
      gen(r) {
        const [M, k, sols] = until(
          () => {
            const M = r.int(120, 480);
            const k = r.int(12, 45);
            const sols: [number, number, number][] = [];
            for (let x = 0; 100 * x <= M; x++)
              for (let y = 0; 100 * x + 10 * y <= M; y++) {
                const z = M - 100 * x - 10 * y;
                if (x + y + z === k) sols.push([x, y, z]);
              }
            return [M, k, sols] as [number, number, [number, number, number][]];
          },
          ([, , s]) => s.length >= 2 && s.length <= 4,
        );
        const need = M - k;
        return {
          q: `십만 원짜리 수표, 만 원짜리 지폐, 천 원짜리 지폐가 충분히 있습니다. 수표와 지폐를 합하여 모두 $${k}$장을 사용해서 $${c(M * 1000)}$원을 만드는 방법은 모두 몇 가지인가요? (사용하지 않는 종류가 있어도 됩니다.)`,
          answer: { type: 'num', value: sols.length, unit: '가지' },
          steps: [
            `$${k}$장이 모두 천 원짜리라면 $${c(k * 1000)}$원 → $${c(need * 1000)}$원이 모자라요.`,
            '천 원짜리 $1$장을 만 원짜리로 바꾸면 $9{,}000$원, 수표로 바꾸면 $99{,}000$원이 늘어나요.',
            `(수표 수)$\\times99{,}000+$(만 원짜리 수)$\\times9{,}000=${c(need * 1000)}$ 이 되는 경우를 찾아요.`,
            ...sols.map(([x, y, z]) => `수표 $${x}$장, 만 원짜리 $${y}$장, 천 원짜리 $${z}$장`),
            `답: $${sols.length}$가지`,
          ],
          hint: '모두 천 원짜리라고 생각하고 바꾸어 보세요.',
        };
      },
    },
  ],

  // ───────── e4a-2
  'e4a-2': [
    {
      id: 'top-star-angles',
      title: '별 모양의 다섯 꼭짓점 각',
      gen(r) {
        const t = until(
          () => Array.from({ length: 5 }, () => r.int(4, 11) * 5),
          (v) => sum(v) === 180,
        );
        // 점 P0..P4 를 원 위에 놓음. 꼭짓점 Pi 의 각 = 호 P(i+2)P(i+3) 의 반
        const th: number[] = [90];
        for (let j = 0; j < 4; j++) th.push(th[j] + 2 * t[(j - 2 + 5) % 5]);
        const names = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ'];
        const P: Record<string, Pt> = {};
        const labelDir: Record<string, Pt> = {};
        names.forEach((n, i) => {
          P[n] = ray(th[i]);
          labelDir[n] = ray(th[i]);
        });
        const qi = r.int(0, 4);
        const fig = geoFig({
          P,
          segs: names.map((n, i) => ({ a: n, b: names[(i + 2) % 5] })),
          angles: names.map((n, i) => ({
            at: n,
            a: names[(i + 2) % 5],
            b: names[(i + 3) % 5],
            text: i === qi ? '?' : `${t[i]}°`,
          })),
          labelDir,
          w: 250,
          h: 230,
        });
        const known = t.filter((_, i) => i !== qi);
        return {
          q: `그림과 같은 별 모양에서 네 꼭짓점의 각의 크기가 주어져 있습니다. 꼭짓점 ${names[qi]}의 각의 크기는 몇 도인가요?`,
          fig,
          answer: { type: 'num', value: t[qi], unit: '°' },
          steps: [
            '삼각형의 한 바깥쪽 각은 이웃하지 않은 두 안쪽 각의 합과 같아요. (세 각의 합 $180^{\\circ}$와 일직선 $180^{\\circ}$를 이용)',
            '꼭짓점 ㄷ, ㅁ을 품은 작은 삼각형에서 이 성질을 쓰면, 꼭짓점 ㄱ에서 만나는 두 선분과 선분 ㄴㅁ이 만드는 삼각형의 한 각은 (ㄷ의 각)$+$(ㅁ의 각)이에요.',
            '같은 방법으로 그 삼각형의 다른 한 각은 (ㄴ의 각)$+$(ㄹ의 각)이에요.',
            '따라서 별의 다섯 꼭짓점의 각을 모두 더하면 삼각형의 세 각의 합 $180^{\\circ}$와 같아요.',
            `꼭짓점 ${names[qi]}: $180^{\\circ}-(${known.join('+')})^{\\circ}=180^{\\circ}-${sum(known)}^{\\circ}=${t[qi]}^{\\circ}$`,
          ],
          hint: '다섯 꼭짓점의 각을 한 삼각형 안으로 모아 보세요.',
        };
      },
    },
    {
      id: 'top-clock-angle',
      title: '시각에 따른 두 바늘 사이의 각도',
      gen(r) {
        const [h, m] = until(
          () => [r.int(1, 11), r.int(1, 29) * 2],
          ([h, m]) => {
            const x = Math.abs(30 * h - 5.5 * m);
            const sm = Math.min(x, 360 - x);
            return sm > 0 && sm !== 180 && m % 10 !== 0;
          },
        );
        const long = 6 * m,
          short = 30 * h + m / 2;
        const x = Math.abs(short - long);
        const ans = Math.min(x, 360 - x);
        return {
          q: `시계가 $${h}$시 $${m}$분을 가리키고 있습니다. 긴바늘과 짧은바늘이 이루는 작은 쪽의 각은 몇 도인가요?`,
          answer: { type: 'num', value: ans, unit: '°' },
          steps: [
            `긴바늘은 $1$분에 $360^{\\circ}\\div60=6^{\\circ}$ → $12$에서 $6^{\\circ}\\times${m}=${long}^{\\circ}$ 움직였어요.`,
            `짧은바늘은 $1$시간에 $30^{\\circ}$, $2$분에 $1^{\\circ}$씩 움직여요.`,
            `짧은바늘: $30^{\\circ}\\times${h}+${m}\\div2=${30 * h}^{\\circ}+${m / 2}^{\\circ}=${short}^{\\circ}$`,
            `두 바늘 사이: $${Math.max(long, short)}^{\\circ}-${Math.min(long, short)}^{\\circ}=${x}^{\\circ}$${x > 180 ? ` → 작은 쪽은 $360^{\\circ}-${x}^{\\circ}=${ans}^{\\circ}$` : ''}`,
            `답: $${ans}^{\\circ}$`,
          ],
          hint: '짧은바늘도 분에 따라 조금씩 움직인다는 것을 잊지 마세요.',
        };
      },
    },
  ],

  // ───────── e4a-3
  'e4a-3': [
    {
      id: 'top-count-rem',
      title: '범위 안에서 나머지가 같은 수 세기',
      gen(r) {
        const [A, B, d, rm] = until(
          () => {
            const d = r.int(12, 39);
            return [r.int(100, 350), r.int(600, 999), d, r.int(1, d - 1)];
          },
          ([A, , d, rm]) => A % d !== rm,
        );
        const q1 = Math.ceil((A - rm) / d),
          q2 = Math.floor((B - rm) / d);
        const first = q1 * d + rm,
          last = q2 * d + rm;
        const ask = r.pick(['count', 'sumEnds']);
        return {
          q: `$${A}$부터 $${B}$까지의 자연수 중에서 $${d}$로 나누었을 때 나머지가 $${rm}$인 수${ask === 'count' ? '는 모두 몇 개인가요?' : ' 중 가장 작은 수와 가장 큰 수의 합을 구하세요.'}`,
          answer: ask === 'count' ? { type: 'num', value: q2 - q1 + 1, unit: '개' } : { type: 'num', value: first + last },
          steps: [
            `$${d}$로 나누어 나머지가 $${rm}$인 수는 $${d}\\times$(몫)$+${rm}$`,
            `$${A}\\div${d}=${Math.floor(A / d)}$ … $${A % d}$ → 가장 작은 수: $${d}\\times${q1}+${rm}=${first}$`,
            `$${B}\\div${d}=${Math.floor(B / d)}$ … $${B % d}$ → 가장 큰 수: $${d}\\times${q2}+${rm}=${last}$`,
            ask === 'count' ? `몫이 $${q1}$부터 $${q2}$까지 → $${q2}-${q1}+1=${q2 - q1 + 1}$ (개)` : `$${first}+${last}=${c(first + last)}$`,
          ],
          hint: '조건에 맞는 수의 몫이 어디부터 어디까지인지 찾아요.',
        };
      },
    },
    {
      id: 'top-guess-price',
      title: '모두 한 가지라고 가정하여 개수 구하기',
      gen(r) {
        const th = r.pick([
          { a: '어른', b: '어린이', w: '입장권', u: '장' },
          { a: '볼펜', b: '연필', w: '', u: '자루' },
          { a: '큰 우표', b: '작은 우표', w: '', u: '장' },
        ]);
        const [pa, pb, n, t] = until(
          () => [r.int(30, 90) * 10, r.int(15, 60) * 10, r.int(20, 45), r.int(3, 30)],
          ([pa, pb, n, t]) => pa > pb && pa - pb >= 50 && t < n - 2,
        );
        const T = pa * t + pb * (n - t);
        const nameA = th.w ? `${th.a} ${th.w}` : th.a,
          nameB = th.w ? `${th.b} ${th.w}` : th.b;
        const askA = r.chance(0.5);
        return {
          q: `한 ${th.u}에 $${c(pa)}$원인 ${J(nameA, '와/과')} 한 ${th.u}에 $${c(pb)}$원인 ${J(nameB, '을/를')} 모두 $${n}$${th.u} 사고 $${c(T)}$원을 냈습니다. ${J(askA ? nameA : nameB, '은/는')} 몇 ${th.u} 샀나요?`,
          answer: { type: 'num', value: askA ? t : n - t, unit: th.u },
          steps: [
            `모두 ${nm(nameB)}라고 생각하면 $${c(pb)}\\times${n}=${c(pb * n)}$ (원)`,
            `실제 낸 돈과의 차: $${c(T)}-${c(pb * n)}=${c(T - pb * n)}$ (원)`,
            `${nameB} $1$${J(th.u, '을/를')} ${nameA} $1$${J(th.u, '으로/로')} 바꿀 때마다 $${c(pa)}-${c(pb)}=${pa - pb}$ (원)씩 늘어나요.`,
            `${nameA}: $${c(T - pb * n)}\\div${pa - pb}=${t}$ (${th.u})`,
            ...(askA ? [] : [`${nameB}: $${n}-${t}=${n - t}$ (${th.u})`]),
          ],
          hint: '모두 싼 것을 샀다고 생각해 보세요.',
        };
      },
    },
  ],

  // ───────── e4a-4
  'e4a-4': [
    {
      id: 'top-rot-symmetric-num',
      title: '180° 돌려도 같은 수의 개수',
      gen(r) {
        const ROT: Record<number, number> = { 0: 0, 1: 1, 8: 8, 6: 9, 9: 6 };
        const [cards, len] = until(
          () => {
            const base = r.sample([0, 1, 8, 6, 9], r.int(3, 5));
            const extra = r.sample([2, 3, 4, 5, 7], r.int(0, 2));
            return [[...base, ...extra].sort((a, b) => a - b), r.int(3, 5)] as [number[], number];
          },
          ([cs]) => cs.some((x) => x !== 0 && ROT[x] !== undefined && cs.includes(ROT[x])) && cs.filter((x) => [0, 1, 8].includes(x)).length >= 1,
        );
        const ok = (n: number) => {
          const s = String(n);
          if (s.length !== len) return false;
          const rot = s
            .split('')
            .reverse()
            .map((ch) => (ROT[+ch] === undefined ? 'x' : String(ROT[+ch])))
            .join('');
          return rot === s;
        };
        let cnt = 0;
        const lo = 10 ** (len - 1),
          hi = 10 ** len - 1;
        const set = new Set(cards);
        for (let n = lo; n <= hi; n++) {
          if (
            !String(n)
              .split('')
              .every((ch) => set.has(+ch))
          )
            continue;
          if (ok(n)) cnt++;
        }
        const firsts = cards.filter((x) => x !== 0 && ROT[x] !== undefined && set.has(ROT[x]));
        const pairs = cards.filter((x) => ROT[x] !== undefined && set.has(ROT[x]));
        const mids = cards.filter((x) => [0, 1, 8].includes(x));
        const half = Math.floor(len / 2);
        const formula = [firsts.length, ...Array.from({ length: half - 1 }, () => pairs.length), ...(len % 2 ? [mids.length] : [])];
        return {
          q: `숫자 카드 $${boxes(cards)}$가 여러 장씩 있습니다. 이 카드를 늘어놓아 ${['', '', '', '세', '네', '다섯'][len]} 자리 수를 만들 때, 시계 방향으로 $180^{\\circ}$만큼 돌려도 처음 수와 같은 수는 모두 몇 개인가요? (같은 숫자 카드를 여러 번 써도 됩니다. $180^{\\circ}$ 돌리면 $0, 1, 8$은 그대로, $6$은 $9$로, $9$는 $6$으로 보이고, 다른 숫자는 숫자가 되지 않아요.)`,
          answer: { type: 'num', value: cnt, unit: '개' },
          steps: [
            '$180^{\\circ}$ 돌리면 숫자의 순서가 거꾸로 되므로, 맨 앞 숫자를 돌린 것이 맨 끝 숫자, 둘째 숫자를 돌린 것이 끝에서 둘째 숫자가 되어야 해요.',
            `맨 앞에 올 수 있는 숫자($0$이 아니고 돌린 숫자도 카드에 있는 것): ${firsts.map((x) => `$${x}$`).join(', ')} → $${firsts.length}$가지`,
            ...(half > 1 ? [`둘째 자리에 올 수 있는 숫자: ${pairs.map((x) => `$${x}$`).join(', ')} → $${pairs.length}$가지`] : []),
            ...(len % 2 ? [`가운데 자리는 돌려도 그대로인 숫자: ${mids.map((x) => `$${x}$`).join(', ')} → $${mids.length}$가지`] : []),
            `앞쪽 숫자를 정하면 뒤쪽 숫자는 저절로 정해져요: $${formula.join('\\times')}=${cnt}$ (개)`,
          ],
          hint: '앞쪽 절반의 숫자만 정하면 나머지는 저절로 정해져요.',
        };
      },
    },
    {
      id: 'top-move-repeat',
      title: '같은 움직임을 여러 번 반복한 도형',
      gen(r) {
        const OPS = [
          {
            name: '시계 방향으로 $90^{\\circ}$만큼 돌리고 오른쪽으로 뒤집기',
            f: (x: Cells) => flipH(rotN(x, 1)),
          },
          {
            name: '오른쪽으로 뒤집고 아래쪽으로 뒤집기',
            f: (x: Cells) => flipV(flipH(x)),
          },
          {
            name: '시계 방향으로 $90^{\\circ}$만큼 돌리고 다시 시계 방향으로 $180^{\\circ}$만큼 돌리기',
            f: (x: Cells) => rotN(x, 3),
          },
          {
            name: '위쪽으로 뒤집고 시계 반대 방향으로 $90^{\\circ}$만큼 돌리기',
            f: (x: Cells) => rotN(flipV(x), 3),
          },
          {
            name: '시계 방향으로 $90^{\\circ}$만큼 두 번 돌리기',
            f: (x: Cells) => rotN(x, 2),
          },
        ];
        const op = r.pick(OPS);
        const n = r.int(10, 40);
        const size = 3;
        const sh = asymShape(r, size, 5);
        const k0 = cellKey(sh);
        let per = 1,
          cur = op.f(sh);
        while (cellKey(cur) !== k0 && per < 8) {
          cur = op.f(cur);
          per++;
        }
        const rem = n % per;
        let res = sh;
        for (let i = 0; i < rem; i++) res = op.f(res);
        const tk = cellKey(res);
        const wrongs = r.shuffle(ALL8(sh).filter((x) => cellKey(x) !== tk));
        const uniq: Cells[] = [];
        const seen = new Set<string>([tk]);
        for (const w of wrongs)
          if (!seen.has(cellKey(w))) {
            seen.add(cellKey(w));
            uniq.push(w);
          }
        const opts = r.shuffle([res, ...uniq.slice(0, 3)]);
        const idx = opts.findIndex((o) => cellKey(o) === tk);
        const fig = cellsFig([{ cells: sh, label: '처음', mark: true }, ...opts.map((o, i) => ({ cells: o, label: LAB4[i] }))], size, { cs: 12 });
        return {
          q: `'${op.name}'를 한 번 움직임이라고 할 때, 처음 도형을 이렇게 $${n}$번 움직인 도형을 고르세요.`,
          fig,
          answer: {
            type: 'choice',
            choices: LAB4.slice(0, opts.length),
            index: idx,
          },
          steps: [
            `한 번 움직이고, 두 번 움직이고, … 하며 처음 모양으로 돌아오는 때를 찾아요.`,
            per === 2 ? '두 번 움직이면 처음 도형과 같아져요.' : `$${per}$번 움직이면 처음 도형과 같아져요.`,
            rem === 0
              ? `$${n}=${per}\\times${Math.floor(n / per)}$ → $${n}$번 움직이면 처음 도형으로 돌아와요.`
              : `$${n}=${per}\\times${Math.floor(n / per)}+${rem}$ → $${n}$번 움직인 도형은 $${rem}$번 움직인 도형과 같아요.`,
            rem === 0 ? '따라서 처음 도형과 같아요.' : `$${rem}$번 움직인 도형을 찾으면 돼요.`,
            `답: ${LAB4[idx]}`,
          ],
          hint: '몇 번마다 처음 모양으로 돌아오는지 찾아보세요.',
        };
      },
    },
  ],

  // ───────── e4a-5
  'e4a-5': [
    {
      id: 'top-bar-two-scales',
      title: '눈금이 다른 두 막대그래프 합쳐 읽기',
      gen(r) {
        const cats = r.pick([
          ['축구', '야구', '농구', '배구'],
          ['사과', '배', '포도', '귤'],
          ['동화', '만화', '위인전', '과학책'],
        ]);
        const what = cats[0] === '축구' ? '운동' : cats[0] === '사과' ? '과일' : '책';
        const [s1, s2] = r.pick([
          [1, 2],
          [2, 5],
          [1, 5],
        ]);
        const [v1, v2] = until(
          () => [cats.map(() => r.int(2, 9) * s1), cats.map(() => r.int(2, 9) * s2)],
          ([a, b]) => {
            const tot = a.map((x, i) => x + b[i]);
            const mx2 = Math.max(...tot);
            if (tot.filter((x) => x === mx2).length !== 1) return false;
            // 막대 칸 수만 더하면 다른 답이 나오게 (함정)
            const cells = a.map((x, i) => x / s1 + b[i] / s2);
            const mc = Math.max(...cells);
            return cells.indexOf(mc) !== tot.indexOf(mx2);
          },
        );
        const tot = v1.map((x, i) => x + v2[i]);
        const bi = tot.indexOf(Math.max(...tot));
        const s = new Svg(440, 200);
        const m1 = (Math.max(...v1) / s1 + 1) * s1,
          m2 = (Math.max(...v2) / s2 + 1) * s2;
        drawBars(s, 0, 0, 215, 200, cats, v1, {
          step: s1,
          max: m1,
          title: '1반',
          unit: '명',
        });
        drawBars(s, 225, 0, 215, 200, cats, v2, {
          step: s2,
          max: m2,
          title: '2반',
          unit: '명',
        });
        return {
          q: `1반과 2반 학생들이 좋아하는 ${J(what, '을/를')} 조사하여 나타낸 막대그래프입니다. 두 반을 합했을 때 가장 많은 학생이 좋아하는 ${what}의 학생 수는 모두 몇 명인가요?`,
          fig: s.toString(),
          answer: { type: 'num', value: tot[bi], unit: '명' },
          steps: [
            `두 그래프는 눈금 한 칸의 크기가 달라요: 1반은 $${s1}$명, 2반은 $${s2}$명`,
            `1반: ${cats.map((ct, i) => `${ct} $${v1[i]}$`).join(', ')}`,
            `2반: ${cats.map((ct, i) => `${ct} $${v2[i]}$`).join(', ')}`,
            `합: ${cats.map((ct, i) => `${ct} $${tot[i]}$`).join(', ')}`,
            `가장 많은 것은 ${cats[bi]}, $${tot[bi]}$명 (막대 길이만 더해 비교하면 틀려요.)`,
          ],
          hint: '막대의 길이가 아니라 눈금이 나타내는 수로 바꾸어 더해요.',
        };
      },
    },
    {
      id: 'top-bar-unknown-scale',
      title: '눈금 숫자가 지워진 막대그래프',
      gen(r) {
        const th = r.pick([
          {
            cats: ['가', '나', '다', '라', '마'],
            suf: ' 마을',
            title: '마을별 기르는 소의 수',
            unit: '마리',
            top: '소를 가장 많이 기르는 마을은 소를 몇 마리 기르나요?',
            all: '다섯 마을에서 기르는 소는 모두 몇 마리인가요?',
          },
          {
            cats: ['1반', '2반', '3반', '4반', '5반'],
            suf: '',
            title: '반별 모은 빈 병의 수',
            unit: '개',
            top: '빈 병을 가장 많이 모은 반은 몇 개를 모았나요?',
            all: '다섯 반이 모은 빈 병은 모두 몇 개인가요?',
          },
          {
            cats: ['월', '화', '수', '목', '금'],
            suf: '요일',
            title: '요일별 도서관 방문자 수',
            unit: '명',
            top: '방문자가 가장 많은 요일에는 몇 명이 방문했나요?',
            all: '5일 동안의 방문자는 모두 몇 명인가요?',
          },
        ]);
        const sc = r.pick([2, 3, 4, 5, 10, 20]);
        const cells = until(
          () => th.cats.map(() => r.int(2, 11)),
          (v) => new Set(v).size >= 4,
        );
        const [i, j] = until(
          () => r.sample([0, 1, 2, 3, 4], 2),
          ([i, j]) => cells[i] > cells[j],
        );
        const Dv = (cells[i] - cells[j]) * sc;
        const tot = sum(cells) * sc;
        const s = new Svg(300, 200);
        drawBars(s, 0, 0, 300, 200, th.cats, cells, {
          step: 1,
          max: 12,
          nums: false,
        });
        const nm2 = (k: number) => th.cats[k] + th.suf;
        const ask = r.pick(['total', 'max']);
        const mi = cells.indexOf(Math.max(...cells));
        return {
          q: `${J(th.title, '을/를')} 나타낸 막대그래프인데 세로 눈금의 숫자가 모두 지워졌습니다. ${J(nm2(i), '은/는')} ${nm2(j)}보다 $${Dv}$${th.unit} 더 많습니다. ${ask === 'total' ? th.all : th.top}`,
          fig: s.toString(),
          answer: {
            type: 'num',
            value: ask === 'total' ? tot : cells[mi] * sc,
            unit: th.unit,
          },
          steps: [
            `막대의 칸 수: ${th.cats.map((ct, k) => `${ct} $${cells[k]}$`).join(', ')}`,
            `${J(nm2(i), '와/과')} ${nm2(j)}의 차: $${cells[i]}-${cells[j]}=${cells[i] - cells[j]}$칸 $=${Dv}$${th.unit}`,
            `눈금 한 칸: $${Dv}\\div${cells[i] - cells[j]}=${sc}$ (${th.unit})`,
            ask === 'total' ? `모두: $(${cells.join('+')})\\times${sc}=${sum(cells)}\\times${sc}=${c(tot)}$ (${th.unit})` : `가장 많은 곳: $${cells[mi]}\\times${sc}=${cells[mi] * sc}$ (${th.unit})`,
          ],
          hint: '두 막대의 칸 수 차이가 실제로 얼마인지 생각해요.',
        };
      },
    },
  ],

  // ───────── e4a-6
  'e4a-6': [
    {
      id: 'top-group-seq',
      title: '묶어서 규칙 찾기 (늘어나는 묶음)',
      gen(r) {
        const kind = r.pick(['A', 'B', 'first']);
        const T = (m: number) => (m * (m + 1)) / 2;
        if (kind === 'first') {
          const k = r.int(6, 13);
          const pos = T(k);
          return {
            q: `다음과 같이 규칙에 따라 수를 늘어놓았습니다. 수 $${k}$가 처음으로 나오는 것은 몇 번째인가요? (숫자로 답하세요.) $$1,\\;1,\\;2,\\;1,\\;2,\\;3,\\;1,\\;2,\\;3,\\;4,\\;1,\\;\\cdots$$`,
            answer: { type: 'num', value: pos, unit: '번째' },
            steps: [
              '$(1)$, $(1, 2)$, $(1, 2, 3)$, … 처럼 묶으면 □번째 묶음에는 수가 □개 있고, 그 묶음의 마지막 수가 □예요.',
              `$${k}$가 처음 나오는 곳은 $${k}$번째 묶음의 마지막`,
              `$1$번째부터 $${k}$번째 묶음까지의 수의 개수: $${Array.from({ length: k }, (_, i) => i + 1).join('+')}=${pos}$`,
              `답: $${pos}$번째`,
            ],
            hint: '수를 묶음으로 나누어 보세요.',
          };
        }
        const N = r.int(30, 95);
        let m = 1;
        while (T(m) < N) m++;
        const posIn = N - T(m - 1);
        const ans = kind === 'A' ? posIn : m;
        return {
          q: `다음과 같이 규칙에 따라 수를 늘어놓았습니다. ${N}번째에 놓이는 수는 무엇인가요? $$${kind === 'A' ? '1,\\;1,\\;2,\\;1,\\;2,\\;3,\\;1,\\;2,\\;3,\\;4,\\;1,\\;\\cdots' : '1,\\;2,\\;2,\\;3,\\;3,\\;3,\\;4,\\;4,\\;4,\\;4,\\;5,\\;\\cdots'}$$`,
          answer: { type: 'num', value: ans },
          steps: [
            kind === 'A' ? '$(1)$, $(1, 2)$, $(1, 2, 3)$, … 처럼 묶으면 □번째 묶음에는 $1$부터 □까지 □개의 수가 있어요.' : '$(1)$, $(2, 2)$, $(3, 3, 3)$, … 처럼 묶으면 □번째 묶음에는 □가 □개 있어요.',
            `묶음까지의 수의 개수: ${Array.from({ length: m }, (_, i) => `$${T(i + 1)}$`)
              .slice(Math.max(0, m - 4))
              .join(', ')} (각각 ${Math.max(1, m - 3)}번째~${m}번째 묶음까지)`,
            `$${T(m - 1)}<${N}\\le${T(m)}$ 이므로 ${N}번째 수는 $${m}$번째 묶음에 있어요.`,
            kind === 'A' ? `$${m}$번째 묶음의 $${N}-${T(m - 1)}=${posIn}$번째 수 → $${posIn}$` : `$${m}$번째 묶음의 수는 모두 $${m}$`,
            `답: $${ans}$`,
          ],
          hint: '묶음마다 수가 몇 개씩 있는지 세어 보세요.',
        };
      },
    },
    {
      id: 'top-calendar-sum',
      title: '달력에서 묶은 수의 합',
      gen(r) {
        const shapes = [
          {
            name: '십자(+) 모양으로 $5$개',
            cells: [
              [-1, 0],
              [0, -1],
              [0, 0],
              [0, 1],
              [1, 0],
            ],
            k: 5,
            big: 7,
            small: -7,
            rel: '위 $-7$, 아래 $+7$, 왼쪽 $-1$, 오른쪽 $+1$',
          },
          {
            name: '$3\\times3$ 정사각형 모양으로 $9$개',
            cells: [-1, 0, 1].flatMap((a) => [-1, 0, 1].map((b) => [a, b])),
            k: 9,
            big: 8,
            small: -8,
            rel: '가운데 수를 중심으로 마주 보는 두 수의 합이 가운데 수의 $2$배',
          },
          {
            name: '세로로 $3$개',
            cells: [
              [-1, 0],
              [0, 0],
              [1, 0],
            ],
            k: 3,
            big: 7,
            small: -7,
            rel: '위 $-7$, 아래 $+7$',
          },
          {
            name: '세로로 $5$개',
            cells: [
              [-2, 0],
              [-1, 0],
              [0, 0],
              [1, 0],
              [2, 0],
            ],
            k: 5,
            big: 14,
            small: -14,
            rel: '한 주 위는 $-7$, 한 주 아래는 $+7$',
          },
        ];
        const sh = r.pick(shapes);
        const cMin = 1 - sh.small,
          cMax = 31 - sh.big;
        const cen = r.int(cMin, cMax);
        const S = sh.k * cen;
        const ask = r.pick(['big', 'small']);
        const s = new Svg(140, 130);
        const rows = Math.max(...sh.cells.map((x) => Math.abs(x[0])));
        for (const [a, b] of sh.cells) s.rect(70 + b * 26 - 13, 65 + a * (rows > 1 ? 24 : 26) - 12, 26, rows > 1 ? 24 : 26, { cls: 'acc', fill: true });
        return {
          q: `어느 달의 달력에서 그림과 같이 ${sh.name}의 수를 묶었더니, 묶은 수의 합이 $${S}$${josa(S, '이/가') === '이' ? '이었습니다' : '였습니다'}. 묶은 수 중에서 가장 ${ask === 'big' ? '큰' : '작은'} 수는 얼마인가요?`,
          fig: s.toString(),
          answer: {
            type: 'num',
            value: ask === 'big' ? cen + sh.big : cen + sh.small,
          },
          steps: [
            '달력에서 바로 아래 칸의 수는 $7$ 크고, 바로 오른쪽 칸의 수는 $1$ 커요.',
            `가운데 수를 □라 하면 (${sh.rel}) 묶은 수의 합은 □의 $${sh.k}$배예요.`,
            `□ $=${S}\\div${sh.k}=${cen}$`,
            ask === 'big' ? `가장 큰 수: $${cen}+${sh.big}=${cen + sh.big}$` : `가장 작은 수: $${cen}-${-sh.small}=${cen + sh.small}$`,
          ],
          hint: '가운데 수와 다른 수의 차이를 생각해 보세요.',
        };
      },
    },
  ],

  // ───────── e4b-1
  'e4b-1': [
    {
      id: 'top-frac-pair-sum',
      title: '짝 지어 분수의 합 구하기',
      gen(r) {
        const den = r.pick([7, 11, 13]);
        const alt = r.chance(0.4);
        const k = r.int(den - 1, Math.min(2 * den + 3, 26));
        const terms = (a: number) => fr(a, den);
        if (!alt) {
          const S = (k * (k + 1)) / 2;
          const pairs = Math.floor(k / 2);
          return {
            q: `계산해 보세요. $$${terms(1)}+${terms(2)}+${terms(3)}+\\cdots+${terms(k - 1)}+${terms(k)}$$`,
            answer: { type: 'num', value: S / den, display: 'mixed' },
            steps: [
              '분모가 같으니 분자끼리 더해요: $1+2+3+\\cdots+' + k + '$',
              `앞과 뒤에서 하나씩 짝을 지으면 $1+${k}=${k + 1}$, $2+${k - 1}=${k + 1}$, … 처럼 합이 $${k + 1}$인 짝이 $${pairs}$개${k % 2 ? `이고 가운데 $${(k + 1) / 2}$이 남아요` : ''}`,
              `분자의 합: $${k + 1}\\times${pairs}${k % 2 ? `+${(k + 1) / 2}` : ''}=${S}$`,
              `$${fr(S, den)}=${mx(S, den)}$`,
            ],
            hint: '처음과 끝을 짝 지어 더해 보세요.',
          };
        }
        const pairs = Math.floor(k / 2);
        const S = pairs + (k % 2);
        return {
          q: `계산해 보세요. $$${terms(k)}-${terms(k - 1)}+${terms(k - 2)}-${terms(k - 3)}+\\cdots${k % 2 ? `-${terms(2)}+${terms(1)}` : `+${terms(2)}-${terms(1)}`}$$`,
          answer: {
            type: 'num',
            value: S / den,
            display: S % den === 0 || S < den ? 'frac' : 'mixed',
          },
          steps: [
            '덧셈과 뺄셈이 번갈아 나올 때는 두 개씩 묶어 보면 규칙이 보여요.',
            `앞에서부터 두 개씩 묶으면 $(${terms(k)}-${terms(k - 1)})+(${terms(k - 2)}-${terms(k - 3)})+\\cdots$`,
            `묶음 하나는 모두 $${terms(1)}$이고, 묶음은 $${pairs}$개${k % 2 ? `, 마지막에 $${terms(1)}$이 하나 남아요` : ''}`,
            `$${terms(1)}\\times${pairs}${k % 2 ? `+${terms(1)}` : ''}=${fr(S, den)}${S >= den ? `=${mx(S, den)}` : ''}$`,
            `답: $${S >= den ? mx(S, den) : fr(S, den)}$`,
          ],
          hint: '두 개씩 묶어 계산해 보세요.',
        };
      },
    },
    {
      id: 'top-frac-sum-diff2',
      title: '합과 차로 두 분수 구하기',
      gen(r) {
        const den = r.pick([7, 11, 13]);
        const [n1, n2] = until(
          () => [r.int(den + 1, 5 * den), r.int(2, 4 * den)],
          ([a, b]) => a > b && (a - b) % 2 === 0 && a % den !== 0 && b % den !== 0 && (a + b) % den !== 0 && (a - b) % den !== 0 && a - b > 2,
        );
        const askBig = r.chance(0.6);
        return {
          q: `분모가 $${den}$인 두 분수가 있습니다. 두 분수의 합은 $${mx(n1 + n2, den)}$이고, 차는 $${mx(n1 - n2, den)}$입니다. 두 분수 중 ${askBig ? '큰' : '작은'} 분수를 대분수${askBig || n2 > den ? '로' : '(또는 진분수)로'} 나타내세요.`,
          answer: {
            type: 'num',
            value: (askBig ? n1 : n2) / den,
            display: 'mixed',
          },
          steps: [
            `합과 차를 가분수로 바꾸면 $${fr(n1 + n2, den)}$, $${fr(n1 - n2, den)}$`,
            `분자끼리 생각하면 (큰 분자)$+$(작은 분자)$=${n1 + n2}$, (큰 분자)$-$(작은 분자)$=${n1 - n2}$`,
            `큰 분자의 $2$배 $=${n1 + n2}+${n1 - n2}=${2 * n1}$ → 큰 분자 $=${n1}$, 작은 분자 $=${n1 + n2}-${n1}=${n2}$`,
            `큰 분수 $${fr(n1, den)}=${mx(n1, den)}$, 작은 분수 $${n2 > den ? `${fr(n2, den)}=${mx(n2, den)}` : fr(n2, den)}$`,
            `답: $${mx(askBig ? n1 : n2, den)}$`,
          ],
          hint: '분모가 같으니 분자만 생각해도 돼요.',
        };
      },
    },
  ],

  // ───────── e4b-2
  'e4b-2': [
    {
      id: 'top-iso-chain',
      title: '이어진 이등변삼각형의 각',
      gen(r) {
        const m = r.int(4, 5);
        const x = m === 5 ? r.int(12, 20) : r.int(12, 28);
        const ask = r.pick(['base', 'reverse', 'apex']);
        const rad = (x * Math.PI) / 180;
        const u1: Pt = [1, 0],
          u2: Pt = [Math.cos(rad), Math.sin(rad)];
        const pts: Pt[] = [
          [0, 0],
          [1, 0],
        ];
        for (let i = 1; i < m; i++) {
          const u = i % 2 === 1 ? u2 : u1;
          const p = pts[i];
          const dot = p[0] * u[0] + p[1] * u[1];
          const disc = dot * dot - (p[0] * p[0] + p[1] * p[1]) + 1;
          const t = dot + Math.sqrt(Math.max(0, disc));
          pts.push([t * u[0], t * u[1]]);
        }
        const names = ['ㅇ', 'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ'].slice(0, m + 1);
        const P: Record<string, Pt> = {};
        names.forEach((n, i) => (P[n] = pts[i]));
        const far1 = Math.max(...pts.filter((_, i) => i % 2 === 1 || i === 0).map((p) => p[0])) + 0.4;
        const far2 = Math.max(...pts.filter((_, i) => i % 2 === 0 && i > 0).map((p) => Math.hypot(p[0], p[1]))) + 0.4;
        P['e1'] = [far1, 0];
        P['e2'] = [far2 * u2[0], far2 * u2[1]];
        const last = names[m],
          prev = names[m - 1],
          prev2 = names[m - 2];
        const base = (m - 1) * x;
        const segs = [{ a: 'ㅇ', b: 'e1' }, { a: 'ㅇ', b: 'e2' }, ...names.slice(1, m).map((n, i) => ({ a: n, b: names[i + 2] }))];
        const fig = geoFig({
          P,
          segs,
          labels: names,
          angles: [
            {
              at: 'ㅇ',
              a: 'e1',
              b: 'e2',
              text: ask === 'reverse' ? '?' : `${x}°`,
            },
            ...(ask === 'reverse' ? [] : [ask === 'base' ? { at: last, a: 'ㅇ', b: prev, text: '?' } : { at: prev, a: prev2, b: last, text: '?' }]),
          ],
          labelDir: Object.fromEntries(names.map((n, i) => [n, i === 0 ? [-1, 0] : i % 2 === 1 ? [0, -1] : [-u2[1], u2[0]]])) as Record<string, Pt>,
          w: 300,
          h: 170,
        });
        const segNames = ['ㅇㄱ', ...names.slice(1, m).map((n, i) => n + names[i + 2])];
        const R = ask === 'reverse';
        const v = (t: number) => (R ? (t === 1 ? '□' : `□의 $${t}$배`) : `$${t * x}^{\\circ}$`);
        const lines = [
          `삼각형 ㅇㄱㄴ: 선분 ㅇㄱ $=$ 선분 ㄱㄴ → 각 ㄱㄴㅇ $=$ 각 ㄱㅇㄴ $=$ ${v(1)}`,
          `각 ㄴㄱㄷ(삼각형 ㅇㄱㄴ의 바깥쪽 각) $=$ ${v(2)}, 삼각형 ㄱㄴㄷ은 이등변삼각형이라 각 ㄱㄷㄴ도 같아요.`,
          `이런 식으로 밑각이 ${v(1)}, ${v(2)}, ${v(3)}, …로 커져요.`,
          `마지막 삼각형 ${prev2}${prev}${last}의 밑각 각 ${prev2}${last}${prev} $=$ 각 ㅇ${last}${prev} $=$ ${v(m - 1)}`,
        ];
        if (ask === 'base')
          return {
            q: `그림에서 선분 ${segNames.join(', 선분 ')}의 길이가 모두 같습니다. 각 ㄱㅇㄴ이 $${x}^{\\circ}$일 때, 각 ㅇ${last}${prev}은 몇 도인가요?`,
            fig,
            answer: { type: 'num', value: base, unit: '°' },
            steps: [...lines, `답: $${base}^{\\circ}$`],
            hint: '삼각형의 바깥쪽 각은 이웃하지 않은 두 안쪽 각의 합과 같아요.',
          };
        if (ask === 'reverse')
          return {
            q: `그림에서 선분 ${segNames.join(', 선분 ')}의 길이가 모두 같습니다. 각 ㅇ${last}${prev}이 $${base}^{\\circ}$일 때, 각 ㄱㅇㄴ은 몇 도인가요?`,
            fig,
            answer: { type: 'num', value: x, unit: '°' },
            steps: [...lines, `□의 $${m - 1}$배 $=${base}^{\\circ}$ → □ $=${base}\\div${m - 1}=${x}$`],
            hint: '각 ㄱㅇㄴ을 □로 놓고 차례로 나타내 보세요.',
          };
        return {
          q: `그림에서 선분 ${segNames.join(', 선분 ')}의 길이가 모두 같습니다. 각 ㄱㅇㄴ이 $${x}^{\\circ}$일 때, 각 ${prev2}${prev}${last}은 몇 도인가요?`,
          fig,
          answer: { type: 'num', value: 180 - 2 * base, unit: '°' },
          steps: [...lines, `각 ${prev2}${prev}${last} $=180^{\\circ}-${base}^{\\circ}\\times2=${180 - 2 * base}^{\\circ}$`],
          hint: '삼각형의 바깥쪽 각은 이웃하지 않은 두 안쪽 각의 합과 같아요.',
        };
      },
    },
    {
      id: 'top-iso-cases',
      title: '이등변삼각형의 각 — 경우 나누기',
      gen(r) {
        const x = until(
          () => (r.chance(0.8) ? r.int(10, 44) * 2 : r.int(46, 84) * 2),
          (v) => v !== 60,
        );
        const askBig = r.chance(0.6);
        const cases: { desc: string; angs: number[] }[] = [];
        cases.push({
          desc: `$${x}^{\\circ}$가 크기가 다른 한 각일 때: 나머지 두 각은 $(180^{\\circ}-${x}^{\\circ})\\div2=${(180 - x) / 2}^{\\circ}$씩`,
          angs: [x, (180 - x) / 2, (180 - x) / 2],
        });
        if (x < 90)
          cases.push({
            desc: `$${x}^{\\circ}$가 크기가 같은 두 각 중 하나일 때: 나머지 한 각은 $180^{\\circ}-${x}^{\\circ}\\times2=${180 - 2 * x}^{\\circ}$`,
            angs: [x, x, 180 - 2 * x],
          });
        else
          cases.push({
            desc: `$${x}^{\\circ}$가 크기가 같은 두 각 중 하나라면 두 각의 합이 $${2 * x}^{\\circ}$로 $180^{\\circ}$를 넘어 삼각형이 될 수 없어요.`,
            angs: [],
          });
        const vals = [...new Set(cases.filter((cs) => cs.angs.length).map((cs) => (askBig ? Math.max(...cs.angs) : Math.min(...cs.angs))))];
        const ans = sum(vals);
        return {
          q: `한 각의 크기가 $${x}^{\\circ}$인 이등변삼각형이 있습니다. 이 삼각형에서 가장 ${askBig ? '큰' : '작은'} 각의 크기가 될 수 있는 각도를 모두 더하면 몇 도인가요?`,
          answer: { type: 'num', value: ans, unit: '°' },
          steps: [
            '이등변삼각형은 두 각의 크기가 같아요. 주어진 각이 어느 각인지 경우를 나누어요.',
            ...cases.map((cs) => cs.desc + (cs.angs.length ? ` → 가장 ${askBig ? '큰' : '작은'} 각 $${askBig ? Math.max(...cs.angs) : Math.min(...cs.angs)}^{\\circ}$` : '')),
            vals.length > 1 ? `$${vals.join('^{\\circ}+')}^{\\circ}=${ans}^{\\circ}$` : `될 수 있는 각도는 $${ans}^{\\circ}$ 하나뿐이에요.`,
          ],
          hint: '주어진 각이 크기가 같은 두 각 중 하나일 때와 아닐 때로 나누어 보세요.',
        };
      },
    },
  ],

  // ───────── e4b-3
  'e4b-3': [
    {
      id: 'top-dec-closest',
      title: '수 카드로 어떤 수에 가장 가까운 소수 만들기',
      gen(r) {
        const k = r.chance(0.5) ? 4 : 5;
        const [cs, t] = until(
          () => {
            const cs = r.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], k);
            return [cs, r.int(1, 9)] as [number[], number];
          },
          ([cs, t]) => {
            if (!cs.includes(t) || !cs.includes(t - 1)) return false;
            const rest1 = cs
              .filter((x) => x !== t - 1)
              .sort((a, b) => b - a)
              .slice(0, 3);
            const rest2 = cs
              .filter((x) => x !== t)
              .sort((a, b) => a - b)
              .slice(0, 3);
            const bel = num([t - 1, ...rest1]),
              abv = num([t, ...rest2]);
            return t * 1000 - bel !== abv - t * 1000;
          },
        );
        const rest1 = cs
          .filter((x) => x !== t - 1)
          .sort((a, b) => b - a)
          .slice(0, 3);
        const rest2 = cs
          .filter((x) => x !== t)
          .sort((a, b) => a - b)
          .slice(0, 3);
        const bel = num([t - 1, ...rest1]),
          abv = num([t, ...rest2]);
        const d1 = t * 1000 - bel,
          d2 = abv - t * 1000;
        const ans = d1 < d2 ? bel : abv;
        return {
          q: `수 카드 $${boxes(r.shuffle(cs))}$ 중에서 $4$장을 골라 한 번씩 사용하여 소수 세 자리 수 $\\square.\\square\\square\\square$를 만들려고 합니다. 만들 수 있는 소수 중에서 $${t}$에 가장 가까운 수를 구하세요.`
            .replace('중에서 $4$장을 골라', k === 4 ? '를 모두' : '중에서 $4$장을 골라')
            .replace('를 모두 한 번씩', '를 한 번씩 모두'),
          answer: { type: 'num', value: ans / 1000, display: 'dec' },
          steps: [
            `$${t}$에 가까우려면 일의 자리 숫자는 $${t - 1}$ 또는 $${t}$이어야 해요.`,
            `$${t}$보다 작은 수 중 가장 큰 수: $${D(bel)}$`,
            `$${t}$보다 큰 수 중 가장 작은 수: $${D(abv)}$`,
            `차: $${t}-${D(bel)}=${D(d1)}$, $${D(abv)}-${t}=${D(d2)}$`,
            `더 가까운 수: $${D(ans)}$`,
          ],
          hint: '기준보다 조금 작은 수와 조금 큰 수를 만들어 비교해요.',
        };
      },
    },
    {
      id: 'top-dec-three-sums',
      title: '두 개씩 더한 무게로 하나의 무게 구하기',
      gen(r) {
        const [A, B, C] = until(
          () => [r.int(100, 600), r.int(100, 600), r.int(100, 600)],
          (v) => new Set(v).size === 3 && v.every((x) => x % 10 !== 0),
        );
        const th = r.pick([
          { w: '상자', u: 'kg', n: ['가', '나', '다'] },
          { w: '통나무', u: 'm', n: ['가', '나', '다'] },
        ]);
        const isLen = th.u === 'm';
        const T = A + B + C,
          x = A + B,
          y = B + C;
        const ask = r.pick(['B', 'CA']);
        const ansv = ask === 'B' ? B : C - A;
        const E = (v: number) => dd(v / 100);
        const what = isLen ? '길이' : '무게';
        return {
          q: `${th.w} ${th.n.join(', ')}가 있습니다. 세 ${th.w}의 ${what}의 합은 $${E(T)}$ ${th.u}, ${th.w} 가와 나의 ${what}의 합은 $${E(x)}$ ${th.u}, ${th.w} 나와 다의 ${what}의 합은 $${E(y)}$ ${th.u}입니다. ${ask === 'B' ? `${th.w} 나의 ${what}는 몇 ${th.u}인가요?` : `${th.w} 다는 ${th.w} 가보다 몇 ${th.u} 더 ${isLen ? '긴가요' : '무거운가요'}? (더 ${isLen ? '짧으면' : '가벼우면'} 차를 쓰세요.)`}`.replace(
            `${what}는`,
            J(what, '은/는'),
          ),
          answer: {
            type: 'num',
            value: Math.abs(ansv) / 100,
            unit: th.u,
            display: 'dec',
          },
          steps: [
            `(가$+$나)$+$(나$+$다)$=${E(x)}+${E(y)}=${E(x + y)}$ → 가, 나, 다를 모두 더하고 나를 한 번 더 더한 값`,
            ask === 'B' ? `나 $=${E(x + y)}-${E(T)}=${E(B)}$ (${th.u})` : `다 $=${E(T)}-${E(x)}=${E(C)}$, 가 $=${E(T)}-${E(y)}=${E(A)}$`,
            ...(ask === 'CA'
              ? [
                  `차: $${E(Math.max(A, C))}-${E(Math.min(A, C))}=${E(Math.abs(C - A))}$ (${th.u})`,
                  `또는 (가$+$나)와 (나$+$다)의 차 $${E(Math.max(x, y))}-${E(Math.min(x, y))}=${E(Math.abs(x - y))}$와 같아요.`,
                ]
              : []),
          ],
          hint: '두 합을 더하면 무엇이 두 번 더해질까요?',
        };
      },
    },
  ],

  // ───────── e4b-4
  'e4b-4': [
    {
      id: 'top-trap-count',
      title: '평행선 위의 점으로 만드는 사각형 세기',
      gen(r) {
        const m = r.int(3, 5),
          n = r.int(3, 6);
        const C2 = (k: number) => (k * (k - 1)) / 2;
        const ask = r.chance(0.7) ? 'trap' : 'tri';
        const ans = ask === 'trap' ? C2(m) * C2(n) : C2(m) * n + C2(n) * m;
        const s = new Svg(280, 120);
        s.line(10, 30, 270, 30, { cls: 'acc' });
        s.line(10, 90, 270, 90, { cls: 'acc' });
        s.text(18, 18, '가', { size: 12 });
        s.text(18, 104, '나', { size: 12 });
        for (let i = 0; i < m; i++)
          s.dot(50 + (i * 200) / (m - 1) + (i % 2 ? 8 : 0), 30, {
            cls: 'acc',
            r: 4,
          });
        for (let i = 0; i < n; i++)
          s.dot(40 + (i * 210) / (n - 1) - (i % 2 ? 6 : 0), 90, {
            cls: 'acc',
            r: 4,
          });
        return {
          q: `서로 평행한 두 직선 가와 나가 있습니다. 직선 가 위에 점 $${m}$개, 직선 나 위에 점 $${n}$개가 있을 때, 이 점들 중에서 ${ask === 'trap' ? '$4$개를 이어 만들 수 있는 사다리꼴' : '$3$개를 이어 만들 수 있는 삼각형'}은 모두 몇 개인가요?`,
          fig: s.toString(),
          answer: { type: 'num', value: ans, unit: '개' },
          steps:
            ask === 'trap'
              ? [
                  '한 직선 위의 점 $3$개 이상을 고르면 사각형이 되지 않아요. 직선 가에서 $2$개, 직선 나에서 $2$개를 골라야 해요.',
                  '이렇게 만든 사각형은 위아래 변이 평행하므로 모두 사다리꼴이에요.',
                  `직선 가에서 점 $2$개 고르기: $${Array.from({ length: m - 1 }, (_, i) => m - 1 - i).join('+')}=${C2(m)}$ (가지)`,
                  `직선 나에서 점 $2$개 고르기: $${Array.from({ length: n - 1 }, (_, i) => n - 1 - i).join('+')}=${C2(n)}$ (가지)`,
                  `$${C2(m)}\\times${C2(n)}=${ans}$ (개)`,
                ]
              : [
                  '한 직선 위의 점 $3$개로는 삼각형이 안 돼요.',
                  `가에서 $2$개, 나에서 $1$개: $${C2(m)}\\times${n}=${C2(m) * n}$ (개)`,
                  `나에서 $2$개, 가에서 $1$개: $${C2(n)}\\times${m}=${C2(n) * m}$ (개)`,
                  `모두 $${C2(m) * n}+${C2(n) * m}=${ans}$ (개)`,
                ],
          hint: '각 직선에서 점을 몇 개씩 골라야 하는지 생각해 보세요.',
        };
      },
    },
    {
      id: 'top-para-iso',
      title: '평행사변형 속 이등변삼각형의 각',
      gen(r) {
        const beta = r.int(25, 40) * 2;
        const a = 180 - beta;
        const b = (beta * Math.PI) / 180;
        const L = 1.9;
        const P: Record<string, Pt> = {
          ㄴ: [0, 0],
          ㄷ: [L, 0],
          ㄱ: [Math.cos(b), Math.sin(b)],
          ㄹ: [L + Math.cos(b), Math.sin(b)],
          ㅁ: [1 + Math.cos(b), Math.sin(b)],
        };
        const ask = r.pick(['ㅁㄴㄷ', 'ㄴㅁㄹ']);
        const ans = ask === 'ㄴㅁㄹ' ? 180 - beta / 2 : beta / 2;
        const angleAt: Record<string, { at: string; a: string; b: string }> = {
          ㅁㄴㄷ: { at: 'ㄴ', a: 'ㅁ', b: 'ㄷ' },
          ㄴㅁㄹ: { at: 'ㅁ', a: 'ㄴ', b: 'ㄹ' },
          ㄱㅁㄴ: { at: 'ㅁ', a: 'ㄱ', b: 'ㄴ' },
        };
        const fig = geoFig({
          P,
          polys: [['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ']],
          segs: [{ a: 'ㄴ', b: 'ㅁ' }],
          angles: [
            { at: 'ㄱ', a: 'ㄴ', b: 'ㄹ', text: `${a}°` },
            { ...angleAt[ask], text: '?' },
          ],
          labelDir: { ㅁ: [0, 1] },
          w: 280,
          h: 160,
        });
        return {
          q: `평행사변형 ㄱㄴㄷㄹ의 변 ㄱㄹ 위에 선분 ㄱㄴ과 선분 ㄱㅁ의 길이가 같도록 점 ㅁ을 잡고, 점 ㄴ과 점 ㅁ을 이었습니다. 각 ㄴㄱㄹ이 $${a}^{\\circ}$일 때, 각 ${ask}은 몇 도인가요?`,
          fig,
          answer: { type: 'num', value: ans, unit: '°' },
          steps: [
            '삼각형 ㄱㄴㅁ은 선분 ㄱㄴ $=$ 선분 ㄱㅁ인 이등변삼각형이에요.',
            `각 ㄱㄴㅁ $=$ 각 ㄱㅁㄴ $=(180^{\\circ}-${a}^{\\circ})\\div2=${beta / 2}^{\\circ}$`,
            ...(ask === 'ㅁㄴㄷ'
              ? [`평행사변형의 이웃한 두 각의 합은 $180^{\\circ}$ → 각 ㄱㄴㄷ $=180^{\\circ}-${a}^{\\circ}=${beta}^{\\circ}$`, `각 ㅁㄴㄷ $=${beta}^{\\circ}-${beta / 2}^{\\circ}=${ans}^{\\circ}$`]
              : []),
            ...(ask === 'ㄴㅁㄹ' ? [`선분 ㄱㄹ은 곧은 선이므로 각 ㄴㅁㄹ $=180^{\\circ}-${beta / 2}^{\\circ}=${ans}^{\\circ}$`] : []),
            `답: $${ans}^{\\circ}$`,
          ],
          hint: '길이가 같은 두 선분을 찾아 이등변삼각형을 이용해요.',
        };
      },
    },
  ],

  // ───────── e4b-5
  'e4b-5': [
    {
      id: 'top-two-plants',
      title: '두 꺾은선이 만나는 때 예상하기',
      gen(r) {
        const [a, p, b, q, eq] = until(
          () => [r.int(2, 8), r.int(3, 6), r.int(10, 30), r.int(1, 3), r.chance(0.4)] as [number, number, number, number, boolean],
          ([a, p, b, q, eq]) => {
            if (p <= q || b <= a) return false;
            const gap = b - a,
              dpq = p - q;
            const day = eq ? gap / dpq + 1 : Math.floor(gap / dpq) + 2;
            return (eq ? gap % dpq === 0 : true) && day >= 6 && day <= 14 && b + 3 * q <= 45 && a + 3 * p <= 45;
          },
        );
        const gap = b - a,
          dpq = p - q;
        const day = eq ? gap / dpq + 1 : Math.floor(gap / dpq) + 2;
        const labs = ['1일', '2일', '3일', '4일'];
        const s1 = labs.map((_, i) => a + p * i),
          s2 = labs.map((_, i) => b + q * i);
        const fig = lineFig(labs, [s1, s2], {
          min: 0,
          max: 50,
          step: 5,
          unit: 'cm',
          names: ['식물 가', '식물 나'],
        });
        return {
          q: `식물 가와 식물 나의 키를 $4$일 동안 매일 재어 나타낸 꺾은선그래프입니다. 두 식물이 매일 같은 길이만큼씩 자란다면, ${eq ? '두 식물의 키가 처음으로 같아지는 날은' : '식물 가의 키가 처음으로 식물 나보다 커지는 날은'} 며칠째인가요?`,
          fig,
          answer: { type: 'num', value: day, unit: '일째' },
          steps: [
            `가는 하루에 $${s1[1]}-${s1[0]}=${p}$ (cm)씩, 나는 $${s2[1]}-${s2[0]}=${q}$ (cm)씩 자라요.`,
            `1일째 키의 차: $${b}-${a}=${gap}$ (cm), 하루에 $${p}-${q}=${dpq}$ (cm)씩 줄어들어요.`,
            eq
              ? `차가 $0$이 되려면 $${gap}\\div${dpq}=${gap / dpq}$일이 지나야 해요.`
              : `$${gap}\\div${dpq}=${Math.floor(gap / dpq)}$ … $${gap % dpq}$ → $${Math.floor(gap / dpq)}$일 지나면 차가 $${gap % dpq}$ cm${gap % dpq === 0 ? '로 같아지고' : '이고'}, 하루 더 지나야 가가 더 커져요.`,
            `1일째에서 $${day - 1}$일 지난 날 → $${day}$일째 (가: $${a + p * (day - 1)}$ cm, 나: $${b + q * (day - 1)}$ cm)`,
          ],
          hint: '두 식물의 키의 차가 하루에 얼마씩 줄어드는지 생각해요.',
        };
      },
    },
    {
      id: 'top-line-tick',
      title: '눈금 숫자가 지워진 꺾은선그래프',
      gen(r) {
        const labs = ['1월', '2월', '3월', '4월', '5월'];
        const sc = r.pick([2, 5, 10, 20, 50]);
        const base = r.int(1, 10) * sc * 2;
        const cells = until(
          () => labs.map(() => r.int(1, 9)),
          (v) => new Set(v).size >= 4,
        );
        const ask = r.pick(['max', 'min']);
        const ext = ask === 'max' ? Math.max(...cells) : Math.min(...cells);
        if (cells.filter((x) => x === ext).length > 1) cells[cells.lastIndexOf(ext)] = ask === 'max' ? ext - 1 : ext + 1;
        const k = cells.indexOf(ext);
        const [i, j] = until(
          () =>
            r
              .sample(
                [0, 1, 2, 3, 4].filter((x) => x !== k),
                2,
              )
              .sort((x, y) => x - y),
          ([i, j]) => cells[i] !== cells[j],
        );
        const vals = cells.map((cl) => base + cl * sc);
        const fig = lineFig(labs, [cells], {
          min: 0,
          max: 10,
          step: 1,
          nums: false,
        });
        const th = r.pick([
          { what: '저금통에 모인 돈', u: '원', mul: 100 },
          { what: '도서관에서 빌려 간 책의 수', u: '권', mul: 1 },
          { what: '공장의 자전거 생산량', u: '대', mul: 1 },
        ]);
        const V = (v: number) => v * th.mul;
        return {
          q: `${J(th.what, '을/를')} 월별로 나타낸 꺾은선그래프인데 세로 눈금의 숫자가 지워졌습니다. ${labs[i]}에는 $${c(V(vals[i]))}$${th.u}, ${labs[j]}에는 $${c(V(vals[j]))}$${th.u}${th.u === '대' ? '였' : '이었'}습니다. ${ask === 'max' ? '가장 많았던' : '가장 적었던'} 달에는 몇 ${th.u}${th.u === '대' ? '였' : '이었'}나요?`,
          fig,
          answer: { type: 'num', value: V(vals[k]), unit: th.u },
          steps: [
            `그래프에서 ${labs[j]}의 점은 ${labs[i]}보다 $${Math.abs(cells[j] - cells[i])}$칸 ${cells[j] > cells[i] ? '높아요' : '낮아요'}.`,
            `실제 차: $${c(V(Math.abs(vals[j] - vals[i])))}$${th.u} → 눈금 한 칸 $=${c(V(Math.abs(vals[j] - vals[i])))}\\div${Math.abs(cells[j] - cells[i])}=${c(V(sc))}$ (${th.u})`,
            `${labs[k]}의 점은 ${labs[i]}보다 $${Math.abs(cells[k] - cells[i])}$칸 ${cells[k] >= cells[i] ? '높아요' : '낮아요'}.`,
            `${labs[k]}: $${c(V(vals[i]))}${cells[k] >= cells[i] ? '+' : '-'}${c(V(sc))}\\times${Math.abs(cells[k] - cells[i])}=${c(V(vals[k]))}$ (${th.u})`,
          ],
          hint: '두 달의 칸 수 차이와 실제 차이로 눈금 한 칸의 크기를 구해요.',
        };
      },
    },
  ],

  // ───────── e4b-6
  'e4b-6': [
    {
      id: 'top-regular-attach',
      title: '붙여 놓은 두 정다각형 사이의 각',
      gen(r) {
        const pairs = [
          [4, 5],
          [4, 6],
          [5, 5],
          [5, 6],
          [6, 6],
          [4, 10],
          [5, 10],
          [6, 10],
          [4, 12],
          [5, 12],
          [6, 9],
          [4, 9],
          [5, 9],
          [8, 8],
          [3, 9],
          [3, 10],
          [3, 12],
        ];
        const [n, m] = r.pick(pairs);
        const an = IA[n],
          am = IA[m];
        const top = 360 - an - am;
        const baseA = (180 - top) / 2;
        const ask = r.pick(['base', 'top']);
        // 공유 변 ㄱ(0,0)-ㄴ(1,0). m각형은 위쪽, n각형은 아래쪽
        const build = (k: number, up: boolean): Pt[] => {
          const pts: Pt[] = [
            [0, 0],
            [1, 0],
          ];
          let dir = 0;
          for (let i = 2; i < k; i++) {
            dir += (up ? 1 : -1) * (360 / k);
            const p = pts[i - 1];
            pts.push([p[0] + Math.cos((dir * Math.PI) / 180), p[1] + Math.sin((dir * Math.PI) / 180)]);
          }
          return pts;
        };
        const up = build(m, true),
          dn = build(n, false);
        const P: Record<string, Pt> = {
          ㄱ: [0, 0],
          ㄴ: [1, 0],
          ㄷ: dn[n - 1],
          ㄹ: up[m - 1],
        };
        up.slice(2, m - 1).forEach((p, i) => (P[`u${i}`] = p));
        dn.slice(2, n - 1).forEach((p, i) => (P[`d${i}`] = p));
        const polyU = ['ㄱ', 'ㄴ', ...up.slice(2, m - 1).map((_, i) => `u${i}`), 'ㄹ'];
        const polyD = ['ㄱ', 'ㄴ', ...dn.slice(2, n - 1).map((_, i) => `d${i}`), 'ㄷ'];
        const fig = geoFig({
          P,
          polys: [polyU, polyD],
          segs: [{ a: 'ㄷ', b: 'ㄹ', dash: true }],
          labels: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'],
          labelDir: { ㄱ: [0.9, 0.45] },
          angles: [ask === 'base' ? { at: 'ㄹ', a: 'ㄱ', b: 'ㄷ', text: '?' } : { at: 'ㄱ', a: 'ㄹ', b: 'ㄷ', text: '?' }],
          w: 260,
          h: 230,
        });
        const nm2 = (k: number) => (POLY[k] ? `정${POLY[k]}` : `정${k}각형`);
        return {
          q: `${n === m ? `한 변의 길이가 같은 ${nm2(n)} 두 개` : J(nm2(m), '와/과') + ' ' + nm2(n)}의 한 변 ㄱㄴ을 맞대어 그림과 같이 붙이고, 점 ㄷ과 점 ㄹ을 이었습니다. 각 ${ask === 'base' ? 'ㄱㄹㄷ' : 'ㄷㄱㄹ'}은 몇 도인가요? (각 ㄷㄱㄹ은 두 도형 바깥쪽의 각이에요.)`,
          fig,
          answer: {
            type: 'num',
            value: ask === 'base' ? baseA : top,
            unit: '°',
          },
          steps: [
            `${nm2(m)}의 한 각: $180^{\\circ}\\times${m - 2}\\div${m}=${am}^{\\circ}$`,
            ...(n === m ? [] : [`${nm2(n)}의 한 각: $180^{\\circ}\\times${n - 2}\\div${n}=${an}^{\\circ}$`]),
            `점 ㄱ을 한 바퀴 돌면 $360^{\\circ}$ → 각 ㄷㄱㄹ $=360^{\\circ}-${am}^{\\circ}-${an}^{\\circ}=${top}^{\\circ}$`,
            ...(ask === 'base'
              ? [`두 정다각형은 한 변의 길이가 같으니 선분 ㄱㄷ $=$ 선분 ㄱㄹ → 삼각형 ㄱㄷㄹ은 이등변삼각형`, `각 ㄱㄹㄷ $=(180^{\\circ}-${top}^{\\circ})\\div2=${baseA}^{\\circ}$`]
              : [`답: $${top}^{\\circ}$`]),
          ],
          hint: '정다각형의 한 각의 크기부터 구해요.',
        };
      },
    },
    {
      id: 'top-wire-regular',
      title: '철사로 여러 정다각형 만들기',
      gen(r) {
        const [p, q, s, x, cc] = until(
          () => [r.int(1, 3), r.int(1, 3), r.int(3, 12), r.int(1, 9), r.pick([5, 6, 8, 9, 10])],
          ([p, q, s, x, cc]) => {
            const L = s * (3 * p + 4 * q) + x;
            return x < s && L % (cc * s) !== 0 && Math.floor(L / (cc * s)) >= 1 && L <= 400;
          },
        );
        const L = s * (3 * p + 4 * q) + x;
        const k = Math.floor(L / (cc * s)),
          left = L - k * cc * s;
        return {
          q: `길이가 $${L}$ cm인 철사로 한 변의 길이가 모두 같은 정삼각형 $${p}$개와 정사각형 $${q}$개를 겹치는 부분 없이 만들었더니 $${x}$ cm가 남았습니다. 처음 철사 전체로 같은 한 변의 길이를 가진 정${POLY[cc]}을 될 수 있는 대로 많이 만들면, 몇 개를 만들고 몇 cm가 남나요?`,
          answer: {
            type: 'fields',
            fields: [
              { label: '개수', value: k, unit: '개' },
              { label: '남는 길이', value: left, unit: 'cm' },
            ],
          },
          steps: [
            `사용한 철사: $${L}-${x}=${L - x}$ (cm)`,
            `변의 수: 정삼각형 $${p}$개 $\\rightarrow$ $${3 * p}$개, 정사각형 $${q}$개 $\\rightarrow$ $${4 * q}$개 → 모두 $${3 * p + 4 * q}$개`,
            `한 변: $${L - x}\\div${3 * p + 4 * q}=${s}$ (cm)`,
            `정${POLY[cc]} 한 개에 드는 철사: $${s}\\times${cc}=${cc * s}$ (cm)`,
            `$${L}\\div${cc * s}=${k}$ … $${left}$ → $${k}$개를 만들고 $${left}$ cm가 남아요.`,
          ],
          hint: '먼저 변이 모두 몇 개인지 세어 한 변의 길이를 구해요.',
        };
      },
    },
  ],
};
