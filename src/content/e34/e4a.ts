// 초4-1 콘텐츠
import type { ContentMap, Level, ProblemDraft } from '../../core/types';
import type { Rng } from '../../core/rng';
import { Svg, barChart, clock } from '../../core/fig';
import { makeChoices } from '../../core/tex';
import {
  J,
  angleFig,
  asymShape,
  c,
  cellKey,
  cellsFig,
  flipH,
  flipV,
  korNum,
  pickName,
  polyFig,
  polyFromAngles,
  rotN,
  type Cells,
} from './util';
import { divSteps, mul2Steps } from './arith';

// ───────── 큰 수 ─────────
const PLACE_NAMES = ['일', '십', '백', '천', '만', '십만', '백만', '천만', '억', '십억', '백억', '천억', '조', '십조', '백조', '천조'];
function bigNum(r: Rng, level: Level): number {
  if (level === 1) return r.int(10000, 99999);
  if (level === 2) return r.int(1, 9999) * 10000 + r.int(0, 9999);
  return r.int(1, 9999) * 1e8 + r.int(0, 9999) * 1e4 + r.int(0, 9999);
}

// ───────── 각도 그림 ─────────
/** 일직선 위의 점에서 반직선을 그은 그림. parts: 왼쪽부터 각 크기, labels */
function straightFig(parts: number[], labels: string[]): string {
  const s = new Svg(260, 130);
  const cx = 130,
    cy = 100;
  s.line(15, cy, 245, cy, { cls: 'acc' });
  s.dot(cx, cy);
  let acc = 0;
  parts.forEach((p, i) => {
    const a1 = acc,
      a2 = acc + p;
    if (i < parts.length - 1) {
      const rad = (a2 * Math.PI) / 180;
      s.line(cx, cy, cx + 95 * Math.cos(rad), cy - 95 * Math.sin(rad), { cls: 'acc' });
    }
    s.arc(cx, cy, 18 + (i % 2) * 8, a1, a2, { cls: 'acc2' });
    const mid = (((a1 + a2) / 2) * Math.PI) / 180;
    const rr = p < 30 ? 62 : 44;
    s.text(cx + rr * Math.cos(mid), cy - rr * Math.sin(mid), labels[i], { size: 12 });
    acc = a2;
  });
  return s.toString();
}

/** 각도 꼴 정리: 내각들로 삼각형/사각형 그림 */
export function anglePoly(r: Rng, angles: number[], labels: (string | null)[], o: { ext?: { at: number; label: string } } = {}): string {
  const pts = polyFromAngles(r, angles);
  return polyFig(pts, {
    angles: labels,
    w: 260,
    h: 190,
    extra: o.ext
      ? (s, P) => {
          // 꼭짓점 at 에서 이전 변의 연장선
          const n = P.length;
          const i = o.ext!.at;
          const A = P[(i + n - 1) % n],
            B = P[i];
          const dx = B[0] - A[0],
            dy = B[1] - A[1];
          const L = Math.hypot(dx, dy);
          const E: [number, number] = [B[0] + (dx / L) * 50, B[1] + (dy / L) * 50];
          s.line(B[0], B[1], E[0], E[1], { dash: true });
          const C = P[(i + 1) % n];
          const u = [(E[0] - B[0]) / 50, (E[1] - B[1]) / 50];
          const vv = [C[0] - B[0], C[1] - B[1]];
          const vl = Math.hypot(vv[0], vv[1]);
          const bis = [u[0] + vv[0] / vl, u[1] + vv[1] / vl];
          const bl = Math.hypot(bis[0], bis[1]) || 1;
          const a1 = (Math.atan2(-u[1], u[0]) * 180) / Math.PI;
          const a2 = (Math.atan2(-vv[1] / vl, vv[0] / vl) * 180) / Math.PI;
          let [p, q] = [a1, a2];
          if ((((q - p) % 360) + 360) % 360 > 180) [p, q] = [q, p];
          s.arc(B[0], B[1], 13, p, q, { cls: 'acc2' });
          s.text(B[0] + (bis[0] / bl) * 30, B[1] + (bis[1] / bl) * 30, o.ext!.label, { size: 12 });
        }
      : undefined,
  });
}

/** 합이 total 인 각 n개 (각 lo 이상, step 단위) */
function splitAngles(r: Rng, total: number, n: number, lo: number, step = 5): number[] {
  for (;;) {
    const a: number[] = [];
    let rem = total;
    for (let i = 0; i < n - 1; i++) {
      const v = r.int(lo / step, Math.floor((rem - lo * (n - 1 - i)) / step)) * step;
      a.push(v);
      rem -= v;
    }
    a.push(rem);
    if (a.every((x) => x >= lo && x <= 150)) return a;
  }
}

// ───────── 평면도형의 이동 ─────────
type Move = { name: string; f: (c: Cells) => Cells };
const MOVES: Move[] = [
  { name: '오른쪽으로 뒤집기', f: flipH },
  { name: '왼쪽으로 뒤집기', f: flipH },
  { name: '위쪽으로 뒤집기', f: flipV },
  { name: '아래쪽으로 뒤집기', f: flipV },
  { name: '시계 방향으로 $90^{\\circ}$만큼 돌리기', f: (x) => rotN(x, 1) },
  { name: '시계 방향으로 $180^{\\circ}$만큼 돌리기', f: (x) => rotN(x, 2) },
  { name: '시계 반대 방향으로 $90^{\\circ}$만큼 돌리기', f: (x) => rotN(x, 3) },
  { name: '시계 방향으로 $270^{\\circ}$만큼 돌리기', f: (x) => rotN(x, 3) },
  { name: '시계 반대 방향으로 $180^{\\circ}$만큼 돌리기', f: (x) => rotN(x, 2) },
];
const ALL8 = (sh: Cells): Cells[] => [0, 1, 2, 3].flatMap((k) => [rotN(sh, k), rotN(flipH(sh), k)]);
const LAB4 = ['가', '나', '다', '라'];

/** 정답 도형 + 오답 3개를 섞어 가~라 보기 그림 만들기 */
function moveChoice(r: Rng, start: Cells, target: Cells, size: number, q: string, steps: string[], startLabel = '처음'): ProblemDraft {
  const tk = cellKey(target);
  const wrongs = r.shuffle(ALL8(start).filter((x) => cellKey(x) !== tk));
  const uniq: Cells[] = [];
  const seen = new Set<string>([tk]);
  for (const w of wrongs) {
    const k = cellKey(w);
    if (!seen.has(k)) {
      seen.add(k);
      uniq.push(w);
    }
  }
  const opts = r.shuffle([target, ...uniq.slice(0, 3)]);
  const idx = opts.findIndex((o) => cellKey(o) === tk);
  const items = [{ cells: start, label: startLabel, mark: true }, ...opts.map((o, i) => ({ cells: o, label: LAB4[i] }))];
  return {
    q,
    fig: cellsFig(items, size, { cs: size === 4 ? 10 : 12 }),
    answer: { type: 'choice', choices: LAB4.slice(0, opts.length), index: idx },
    steps: [...steps, `답: ${LAB4[idx]}`],
  };
}
const ROT_DIG: Record<string, string> = { '0': '0', '1': '1', '6': '9', '8': '8', '9': '6' };

// ───────── 막대그래프 자료 ─────────
const BAR_THEMES = [
  { title: '좋아하는 과일별 학생 수', cats: ['사과', '배', '포도', '귤', '딸기'], unit: '명', what: '학생 수' },
  { title: '좋아하는 운동별 학생 수', cats: ['축구', '야구', '수영', '줄넘기', '농구'], unit: '명', what: '학생 수' },
  { title: '반별 모은 헌 종이의 무게', cats: ['1반', '2반', '3반', '4반', '5반'], unit: 'kg', what: '무게' },
  { title: '요일별 도서관 방문자 수', cats: ['월', '화', '수', '목', '금'], unit: '명', what: '방문자 수' },
  { title: '마을별 기르는 소의 수', cats: ['가', '나', '다', '라', '마'], unit: '마리', what: '소의 수' },
];
function barData(r: Rng, level: Level) {
  const th = r.pick(BAR_THEMES);
  const n = level === 1 ? 4 : 5;
  const step = level === 1 ? 1 : level === 2 ? 2 : 5;
  let vals: number[] = [];
  for (let t = 0; t < 100; t++) {
    vals = Array.from({ length: n }, () => r.int(1, level === 1 ? 12 : 10) * step);
    if (new Set(vals).size === n) break;
  }
  const cats = th.cats.slice(0, n);
  const max = Math.ceil(Math.max(...vals) / step) * step + step;
  const fig = (v: number[] = vals) => barChart(cats, v, { unit: th.unit, max, step });
  return { th, cats, vals, step, fig };
}

export const content: ContentMap = {
  // ═════════════ e4a-1 큰 수 ═════════════
  'e4a-1': {
    concepts: [
      {
        title: '만과 다섯 자리 수',
        body: '$1000$이 $10$개이면 $10000$이에요. 이것을 **만** 또는 **일만**이라고 읽어요.\n- $35207$은 "삼만 오천이백칠"이라고 읽고, $3$은 만의 자리 숫자로 $30000$을 나타내요.',
      },
      {
        title: '십만, 백만, 천만, 억, 조',
        body: '- 만이 $10$개 → 십만, $100$개 → 백만, $1000$개 → 천만\n- 천만이 $10$개 → **억** ($100000000$, 0이 8개)\n- 천억이 $10$개 → **조** (0이 12개)\n- 큰 수는 뒤에서부터 네 자리씩 끊어 읽으면 쉬워요: $5{,}2340{,}0000$ → 5억 2340만',
      },
      {
        title: '뛰어 세기',
        body: '$10000$씩 뛰어 세면 만의 자리 숫자가 $1$씩 커져요. $35000 \\to 45000 \\to 55000$\n- $10$배씩 뛰어 세면 수의 끝에 $0$이 하나씩 늘어나요.',
      },
      {
        title: '수의 크기 비교',
        body: '① 자리 수가 많은 쪽이 더 커요.\n② 자리 수가 같으면 가장 높은 자리부터 차례로 비교해요.\n- $523000 > 99999$ (여섯 자리 > 다섯 자리)\n- $47{,}315 < 47{,}520$ (백의 자리에서 $3<5$)',
      },
    ],
    skills: [
      {
        id: 'read-write',
        title: '큰 수 읽고 쓰기',
        gen(r, level) {
          if (level === 3) {
            const a = r.int(1, 99),
              b = r.int(1, 9999),
              d = r.int(1, 9999);
            const v = a * 1e8 + b * 1e4 + d;
            return {
              q: `억이 $${a}$개, 만이 $${b}$개, 일이 $${d}$개인 수를 숫자로 쓰세요.`,
              answer: { type: 'num', value: v },
              steps: [`억이 $${a}$개 → $${c(a * 1e8)}$, 만이 $${b}$개 → $${c(b * 1e4)}$, 일이 $${d}$개 → $${d}$`, `모두 더하면 $${c(v)}$`],
              hint: '네 자리씩 끊어서 생각해요.',
            };
          }
          const n = bigNum(r, level);
          if (r.chance(0.5))
            return {
              q: `다음을 수로 쓰세요.\n**${korNum(n)}**`,
              answer: { type: 'num', value: n },
              steps: [`만 앞의 수: $${Math.floor(n / 1e4)}$, 만 뒤의 네 자리: $${String(n % 1e4).padStart(4, '0')}$`, `$${c(n)}$`],
              hint: '읽지 않은 자리에는 0을 써요.',
            };
          const w1 = korNum(n + (n % 10 === 9 ? -1 : 1));
          const w2 = korNum(n + 1000 * (Math.floor(n / 1000) % 10 === 9 ? -1 : 1));
          const w3 = korNum(Math.floor(n / 10));
          const w4 = korNum(n * 10);
          return {
            q: `$${c(n)}$을 바르게 읽은 것은?`,
            answer: makeChoices(r, korNum(n), [w1, w2, w3, w4], 4),
            steps: [`뒤에서부터 네 자리씩 끊어 읽어요.`, `$${c(n)}$ → ${korNum(n)}`],
          };
        },
      },
      {
        id: 'place-value',
        title: '자릿값 알기',
        gen(r, level) {
          const n = bigNum(r, level);
          const s = String(n);
          if (level === 3) {
            // 같은 숫자 두 개의 값 비교
            for (let t = 0; t < 100; t++) {
              const m = bigNum(r, 3);
              const ms = String(m);
              for (let dgt = 1; dgt <= 9; dgt++) {
                const pos = [...ms].map((ch, i) => (ch === String(dgt) ? ms.length - 1 - i : -1)).filter((p) => p >= 0);
                if (pos.length >= 2) {
                  const [hi, lo] = [pos[0], pos[pos.length - 1]];
                  return {
                    q: `$${c(m)}$에서 숫자 $${dgt}$이 두 번 이상 나옵니다. 가장 왼쪽의 $${dgt}$이 나타내는 값은 가장 오른쪽의 $${dgt}$이 나타내는 값의 몇 배인가요?`,
                    answer: { type: 'num', value: 10 ** (hi - lo), unit: '배' },
                    steps: [`왼쪽 $${dgt}$: ${PLACE_NAMES[hi]}의 자리 → $${c(dgt * 10 ** hi)}$`, `오른쪽 $${dgt}$: ${PLACE_NAMES[lo]}의 자리 → $${c(dgt * 10 ** lo)}$`, `$${c(10 ** (hi - lo))}$배`],
                    hint: '한 자리 왼쪽으로 갈 때마다 10배가 돼요.',
                  };
                }
              }
            }
          }
          const uniq = [...s].map((_, k) => k).filter((k) => s[k] !== '0' && s.split(s[k]).length === 2);
          let pos = uniq.length ? r.pick(uniq) : r.int(0, s.length - 1);
          while (s[pos] === '0') pos = (pos + 1) % s.length;
          const dgt = +s[pos];
          const place = s.length - 1 - pos;
          if (r.chance(0.5) || level === 3)
            return {
              q: `$${c(n)}$에서 숫자 $${dgt}$이 나타내는 값은 얼마인가요?${s.split(String(dgt)).length > 2 ? ` (${PLACE_NAMES[place]}의 자리 숫자)` : ''}`,
              answer: { type: 'num', value: dgt * 10 ** place },
              steps: [`$${dgt}$은 ${PLACE_NAMES[place]}의 자리 숫자예요.`, `나타내는 값: $${c(dgt * 10 ** place)}$`],
            };
          return {
            q: `$${c(n)}$에서 ${PLACE_NAMES[place]}의 자리 숫자는 무엇인가요?`,
            answer: { type: 'num', value: dgt },
            steps: [`일의 자리부터 차례로 세어 ${PLACE_NAMES[place]}의 자리를 찾아요.`, `${PLACE_NAMES[place]}의 자리 숫자: $${dgt}$`],
          };
        },
      },
      {
        id: 'skip-count',
        title: '뛰어 세기',
        gen(r, level) {
          if (level === 3) {
            const start = r.int(1, 9) * 10 ** r.int(2, 5) + (r.chance(0.5) ? r.int(1, 9) * 10 ** r.int(0, 1) : 0);
            const seq = [0, 1, 2, 3, 4].map((k) => start * 10 ** k);
            const hide = r.int(2, 4);
            return {
              q: `규칙에 따라 뛰어 세었습니다. □ 안에 알맞은 수를 구하세요. $$${seq.map((v, i) => (i === hide ? '\\square' : c(v))).join(',\\;')}$$`,
              answer: { type: 'num', value: seq[hide] },
              steps: [`앞의 수의 $10$배씩 커지는 규칙이에요.`, `□ $=${c(seq[hide])}$`],
            };
          }
          const stepOpts = level === 1 ? [1000, 10000, 100] : [100000, 1000000, 10000000, 100000000];
          const st = r.pick(stepOpts);
          const start = level === 1 ? r.int(10, 60) * 1000 + r.int(0, 9) * 100 : r.int(1, 30) * 1e7 + r.int(0, 99) * 1e5;
          const down = level === 2 && r.chance(0.4);
          const seq = [0, 1, 2, 3, 4].map((k) => (down ? start + 4 * st - k * st : start + k * st));
          const hide = r.int(1, 4);
          return {
            q: `규칙에 따라 뛰어 세었습니다. □ 안에 알맞은 수를 구하세요. $$${seq.map((v, i) => (i === hide ? '\\square' : c(v))).join(',\\;')}$$`,
            answer: { type: 'num', value: seq[hide] },
            steps: [`$${c(st)}$씩 ${down ? '거꾸로 ' : ''}뛰어 센 규칙이에요.`, `□ $=${c(seq[hide - 1])}${down ? '-' : '+'}${c(st)}=${c(seq[hide])}$`],
          };
        },
      },
      {
        id: 'compare',
        title: '수의 크기 비교',
        gen(r, level) {
          if (level === 3) {
            const k = r.int(2, 4);
            const dgt = r.int(1, 8); // □ 자리 숫자를 1~8로 두어 답이 0개나 10개가 되지 않게
            const s0 = String(r.int(100000, 999999));
            const s = s0.slice(0, k) + dgt + s0.slice(k + 1);
            const big = r.chance(0.5);
            // other□ > n 이 되려면
            const restOther = r.int(0, 999);
            const tail = String(restOther).padStart(s.length - k - 1, '0').slice(-(s.length - k - 1));
            const tex = `${s.slice(0, k)}\\square ${tail}`;
            const tailN = +tail;
            const restN = +s.slice(k + 1);
            // tex 수 (□=x) 와 n 비교: x>dgt 이면 크고, x<dgt 면 작고, 같으면 tail vs rest
            let cnt = 0;
            for (let x = 0; x <= 9; x++) {
              const cmp = x !== dgt ? x - dgt : tailN - restN;
              if (big ? cmp > 0 : cmp < 0) cnt++;
            }
            return {
              q: `$0$부터 $9$까지의 수 중에서 □ 안에 들어갈 수 있는 수는 모두 몇 개인가요? $$${tex} ${big ? '>' : '<'} ${s}$$`,
              answer: { type: 'num', value: cnt, unit: '개' },
              steps: [
                `높은 자리부터 비교하면 □가 있는 자리에서 크기가 정해져요.`,
                `□ $=${dgt}$일 때: $${s.slice(0, k)}${dgt}${tail}$과 $${s}$ 비교 → ${tailN === restN ? '같음' : (big ? tailN > restN : tailN < restN) ? '조건에 맞음' : '조건에 맞지 않음'}`,
                `${big ? `$${dgt}$보다 큰 수` : `$${dgt}$보다 작은 수`}${(big ? tailN > restN : tailN < restN) ? `와 $${dgt}$` : ''} → $${cnt}$개`,
              ],
            };
          }
          const nums = new Set<number>();
          const base = bigNum(r, level);
          while (nums.size < 4) {
            const len = String(base).length;
            const pick = r.int(0, 3);
            let v = base;
            if (pick === 0) v = base + r.int(1, 9) * 10 ** r.int(0, len - 2);
            else if (pick === 1) v = Math.max(10000, base - r.int(1, 9) * 10 ** r.int(0, len - 2));
            else if (pick === 2) v = +String(base).split('').reverse().join('') || base + 7;
            else v = r.int(1, 9) * 10 ** (len - 1) + r.int(0, 10 ** (len - 1) - 1);
            nums.add(v);
          }
          const arr = [...nums];
          const big = r.chance(0.5);
          const sorted = arr.slice().sort((a, b) => (big ? b - a : a - b));
          const tx = (v: number, i: number) => (level === 2 && i % 2 === 1 && v >= 1e4 ? `${Math.floor(v / 1e4)}만 ${v % 1e4 ? v % 1e4 : ''}`.trim() : `$${c(v)}$`);
          const txt = arr.map((v, i) => tx(v, i));
          const ansT = txt[arr.indexOf(sorted[0])];
          return {
            q: `가장 ${big ? '큰' : '작은'} 수는 어느 것인가요?`,
            answer: makeChoices(r, ansT, txt.filter((t) => t !== ansT), 4),
            steps: [`자리 수를 먼저 비교하고, 같으면 높은 자리부터 비교해요.`, `${sorted.map((v) => `$${c(v)}$`).join(big ? ' > ' : ' < ')}`],
          };
        },
      },
      {
        id: 'money',
        title: '큰 수의 활용',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(1, 9),
              b = r.int(1, 9),
              d = r.int(1, 9);
            return {
              q: `${pickName(r)}는 만 원짜리 지폐 $${a}$장, 천 원짜리 지폐 $${b}$장, 백 원짜리 동전 $${d}$개를 가지고 있습니다. 모두 얼마인가요?`,
              answer: { type: 'num', value: a * 10000 + b * 1000 + d * 100, unit: '원' },
              steps: [`$${c(a * 10000)}+${c(b * 1000)}+${d * 100}=${c(a * 10000 + b * 1000 + d * 100)}$(원)`],
            };
          }
          if (level === 2) {
            const pairs: [number, number, string, string][] = [
              [1e8, 1e7, '1억', '1000만'],
              [1e8, 1e6, '1억', '100만'],
              [1e4, 1e3, '1만', '1000'],
              [1e12, 1e11, '1조', '1000억'],
              [1e12, 1e8, '1조', '1억'],
              [1e8, 1e4, '1억', '1만'],
            ];
            const [A, B, ta, tb] = r.pick(pairs);
            return {
              q: `${J(ta, '은/는')} ${tb}의 몇 배인가요?`,
              answer: { type: 'num', value: A / B, unit: '배' },
              steps: [`${ta} $=${c(A)}$, ${tb} $=${c(B)}$`, `$${c(B)}$에 $0$을 ${String(A / B).length - 1}개 붙이면 $${c(A)}$ → $${c(A / B)}$배`],
            };
          }
          const st = r.pick([1e6, 1e7, 1e5]);
          const k = r.int(3, 6);
          const res = r.int(10, 90) * 1e7;
          const start = res - k * st;
          return {
            q: `어떤 수에서 $${c(st)}$씩 $${k}$번 뛰어 세었더니 $${c(res)}$이 되었습니다. 어떤 수는 얼마인가요?`,
            answer: { type: 'num', value: start },
            steps: [`거꾸로 $${c(st)}$씩 $${k}$번 뛰어 세면 돼요: $${c(st)}\\times${k}=${c(st * k)}$`, `$${c(res)}-${c(st * k)}=${c(start)}$`],
          };
        },
      },
    ],
  },

  // ═════════════ e4a-2 각도 ═════════════
  'e4a-2': {
    concepts: [
      {
        title: '각의 크기와 단위',
        body: '각의 두 변이 벌어진 정도를 **각의 크기**라고 해요. 직각을 똑같이 $90$으로 나눈 하나를 $1$도($1^{\\circ}$)라고 해요.\n- 직각 $=90^{\\circ}$, 일직선(평각) $=180^{\\circ}$, 한 바퀴 $=360^{\\circ}$\n- 변의 길이와 각의 크기는 관계없어요.',
      },
      {
        title: '예각과 둔각',
        body: '- **예각**: $0^{\\circ}$보다 크고 직각보다 작은 각\n- **둔각**: 직각보다 크고 $180^{\\circ}$보다 작은 각\n- 3학년 때 배운 직각을 기준으로 나누어요.',
      },
      {
        title: '각도의 합과 차',
        body: '각도의 합과 차는 자연수의 덧셈·뺄셈처럼 계산하고 단위 $^{\\circ}$를 붙여요.\n- $35^{\\circ}+70^{\\circ}=105^{\\circ}$, $180^{\\circ}-65^{\\circ}=115^{\\circ}$',
      },
      {
        title: '삼각형과 사각형의 각의 합',
        body: '- 삼각형의 세 각을 잘라 모으면 일직선 → **세 각의 합 $=180^{\\circ}$**\n- 사각형은 삼각형 $2$개로 나눌 수 있어요 → **네 각의 합 $=360^{\\circ}$**',
        example: { q: '삼각형의 두 각이 $50^{\\circ}$, $70^{\\circ}$일 때 나머지 한 각은?', a: '$180^{\\circ}-50^{\\circ}-70^{\\circ}=60^{\\circ}$' },
      },
    ],
    skills: [
      {
        id: 'angle-type',
        title: '예각과 둔각',
        gen(r, level) {
          if (level === 1) {
            const kind = r.int(0, 2);
            const deg = kind === 0 ? r.int(4, 14) * 5 : kind === 1 ? 90 : r.int(22, 34) * 5;
            const name = ['예각', '직각', '둔각'][kind];
            return {
              q: '그림의 각은 예각, 직각, 둔각 중 어느 것인가요?',
              fig: angleFig(deg, { rot: r.int(0, 8) * 10 }),
              answer: { type: 'choice', choices: ['예각', '직각', '둔각'], index: kind },
              steps: [kind === 1 ? '두 변이 직각을 이루어요.' : kind === 0 ? '직각보다 작은 각이에요.' : '직각보다 크고 일직선보다 작은 각이에요.', `답: ${name}`],
            };
          }
          if (level === 2) {
            const kind = r.pick(['예각', '둔각'] as const);
            const angs = r.sample([15, 25, 40, 55, 70, 85, 90, 95, 110, 125, 140, 160, 175, 180], 6);
            const cnt = angs.filter((a) => (kind === '예각' ? a < 90 : a > 90 && a < 180)).length;
            return {
              q: `다음 각도 중 ${J(kind, '은/는')} 모두 몇 개인가요? $$${angs.map((a) => `${a}^{\\circ}`).join(',\\quad ')}$$`,
              answer: { type: 'num', value: cnt, unit: '개' },
              steps: [kind === '예각' ? '예각: $0^{\\circ}$보다 크고 $90^{\\circ}$보다 작은 각' : '둔각: $90^{\\circ}$보다 크고 $180^{\\circ}$보다 작은 각', `해당하는 각: ${angs.filter((a) => (kind === '예각' ? a < 90 : a > 90 && a < 180)).map((a) => `$${a}^{\\circ}$`).join(', ') || '없음'} → $${cnt}$개`],
            };
          }
          const obtuseH = [4, 5, 7, 8];
          const acuteH = [1, 2, 10, 11];
          const wantObtuse = r.chance(0.5);
          const h = r.pick(wantObtuse ? obtuseH : acuteH);
          const wr = r.sample([...(wantObtuse ? acuteH : obtuseH), 3, 9, 6], 3);
          const ang = (x: number) => 30 * Math.min(x, 12 - x);
          return {
            q: `시계의 긴바늘과 짧은바늘이 이루는 작은 쪽의 각이 **${wantObtuse ? '둔각' : '예각'}**인 시각은?`,
            answer: makeChoices(r, `${h}시`, wr.map((x) => `${x}시`), 4),
            steps: [`정각에서 짧은바늘은 숫자 한 칸마다 $30^{\\circ}$씩 벌어져요.`, `${h}시: $${ang(h)}^{\\circ}$ → ${wantObtuse ? '둔각' : '예각'}`, ...wr.map((x) => `${x}시: $${ang(x)}^{\\circ}$`)],
          };
        },
      },
      {
        id: 'sum-diff',
        title: '각도의 합과 차',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(3, 17) * 5,
              b = r.int(3, 17) * 5;
            const add = r.chance(0.5);
            const [x, y] = add ? [a, b] : [Math.max(a, b) + 20, Math.min(a, b)];
            return {
              q: `계산해 보세요. $$${x}^{\\circ}${add ? '+' : '-'}${y}^{\\circ}$$`,
              answer: { type: 'num', value: add ? x + y : x - y, unit: '°' },
              steps: [`자연수처럼 계산하고 $^{\\circ}$를 붙여요: $${x}${add ? '+' : '-'}${y}=${add ? x + y : x - y}$`],
            };
          }
          if (level === 2) {
            const a = r.int(20, 80),
              b = r.int(20, 80),
              d = r.int(10, Math.min(60, a + b - 10));
            const v = a + b - d;
            return {
              q: `계산해 보세요. $$${a}^{\\circ}+${b}^{\\circ}-${d}^{\\circ}$$`,
              answer: { type: 'num', value: v, unit: '°' },
              steps: [`$${a}+${b}=${a + b}$`, `$${a + b}-${d}=${v}$ → $${v}^{\\circ}$`],
            };
          }
          const a = r.int(15, 75);
          const typ = r.int(0, 2);
          if (typ === 0)
            return {
              q: `직각에서 $${a}^{\\circ}$를 뺀 각도와 일직선(평각)에서 $${a}^{\\circ}$를 뺀 각도의 합은 몇 도인가요?`,
              answer: { type: 'num', value: 90 - a + 180 - a, unit: '°' },
              steps: [`$90^{\\circ}-${a}^{\\circ}=${90 - a}^{\\circ}$, $180^{\\circ}-${a}^{\\circ}=${180 - a}^{\\circ}$`, `합: $${90 - a}^{\\circ}+${180 - a}^{\\circ}=${270 - 2 * a}^{\\circ}$`],
            };
          const parts = splitAngles(r, 180, 3, 25);
          return {
            q: '그림에서 □의 각도는 몇 도인가요?',
            fig: straightFig(parts, [`${parts[0]}°`, '□', `${parts[2]}°`]),
            answer: { type: 'num', value: parts[1], unit: '°' },
            steps: [`일직선이 이루는 각은 $180^{\\circ}$`, `□ $=180^{\\circ}-${parts[0]}^{\\circ}-${parts[2]}^{\\circ}=${parts[1]}^{\\circ}$`],
          };
        },
      },
      {
        id: 'triangle-angle',
        title: '삼각형의 세 각의 합',
        gen(r, level) {
          const ang = splitAngles(r, 180, 3, 25);
          const hide = r.int(0, 2);
          if (level === 3) {
            const at = (hide + 1) % 3; // 외각 위치 : 꼭짓점 at, 그 외각 = 180 - ang[at]
            const others = [0, 1, 2].filter((i) => i !== at);
            const labels: (string | null)[] = [null, null, null];
            others.forEach((i) => (labels[i] = `${ang[i]}°`));
            return {
              q: '그림과 같이 삼각형의 한 변을 늘였습니다. □의 각도는 몇 도인가요?',
              fig: anglePoly(r, ang, labels, { ext: { at, label: '□' } }),
              answer: { type: 'num', value: 180 - ang[at], unit: '°' },
              steps: [`삼각형의 나머지 한 각: $180^{\\circ}-${ang[others[0]]}^{\\circ}-${ang[others[1]]}^{\\circ}=${ang[at]}^{\\circ}$`, `일직선이므로 □ $=180^{\\circ}-${ang[at]}^{\\circ}=${180 - ang[at]}^{\\circ}$`],
              hint: '먼저 삼각형 안의 각을 구해요.',
            };
          }
          const labels = ang.map((a, i) => (i === hide ? '□' : `${a}°`));
          const kn = [0, 1, 2].filter((i) => i !== hide);
          if (level === 2 && r.chance(0.5)) {
            return {
              q: `삼각형의 두 각이 $${ang[kn[0]]}^{\\circ}$, $${ang[kn[1]]}^{\\circ}$입니다. 나머지 한 각은 몇 도인가요?`,
              answer: { type: 'num', value: ang[hide], unit: '°' },
              steps: [`삼각형의 세 각의 합은 $180^{\\circ}$`, `$180^{\\circ}-${ang[kn[0]]}^{\\circ}-${ang[kn[1]]}^{\\circ}=${ang[hide]}^{\\circ}$`],
            };
          }
          return {
            q: '삼각형에서 □의 각도는 몇 도인가요?',
            fig: anglePoly(r, ang, labels),
            answer: { type: 'num', value: ang[hide], unit: '°' },
            steps: [`삼각형의 세 각의 합은 $180^{\\circ}$`, `□ $=180^{\\circ}-${ang[kn[0]]}^{\\circ}-${ang[kn[1]]}^{\\circ}=${ang[hide]}^{\\circ}$`],
          };
        },
      },
      {
        id: 'quad-angle',
        title: '사각형의 네 각의 합',
        gen(r, level) {
          const ang = splitAngles(r, 360, 4, 50);
          const hide = r.int(0, 3);
          const kn = [0, 1, 2, 3].filter((i) => i !== hide);
          if (level === 3) {
            const at = hide;
            const nxt = (at + 1) % 4;
            // 꼭짓점 at 의 외각을 주고, 다른 한 각(nxt)을 구하게 함
            const labels: (string | null)[] = [null, null, null, null];
            [0, 1, 2, 3].filter((i) => i !== at && i !== nxt).forEach((i) => (labels[i] = `${ang[i]}°`));
            labels[nxt] = '□';
            const others = [0, 1, 2, 3].filter((i) => i !== at && i !== nxt);
            return {
              q: '그림과 같이 사각형의 한 변을 늘였습니다. □의 각도는 몇 도인가요?',
              fig: anglePoly(r, ang, labels, { ext: { at, label: `${180 - ang[at]}°` } }),
              answer: { type: 'num', value: ang[nxt], unit: '°' },
              steps: [`일직선이므로 사각형 안의 각: $180^{\\circ}-${180 - ang[at]}^{\\circ}=${ang[at]}^{\\circ}$`, `□ $=360^{\\circ}-${ang[at]}^{\\circ}-${ang[others[0]]}^{\\circ}-${ang[others[1]]}^{\\circ}=${ang[nxt]}^{\\circ}$`],
            };
          }
          if (level === 2) {
            // 두 각이 같은 경우
            const pair = splitAngles(r, 360, 3, 50);
            const known = pair.slice(0, 2);
            const rest = 360 - known[0] - known[1];
            if (rest % 2 === 0 && rest / 2 >= 30 && rest / 2 <= 150) {
              const x = rest / 2;
              const A = [known[0], x, known[1], x];
              return {
                q: '사각형에서 ㉠과 ㉡의 크기가 같을 때, ㉠의 각도는 몇 도인가요?',
                fig: anglePoly(r, A, [`${known[0]}°`, '㉠', `${known[1]}°`, '㉡']),
                answer: { type: 'num', value: x, unit: '°' },
                steps: [`사각형의 네 각의 합은 $360^{\\circ}$`, `㉠$+$㉡ $=360^{\\circ}-${known[0]}^{\\circ}-${known[1]}^{\\circ}=${rest}^{\\circ}$`, `㉠ $=${rest}^{\\circ}$의 반 $=${x}^{\\circ}$`],
              };
            }
          }
          return {
            q: '사각형에서 □의 각도는 몇 도인가요?',
            fig: anglePoly(r, ang, ang.map((a, i) => (i === hide ? '□' : `${a}°`))),
            answer: { type: 'num', value: ang[hide], unit: '°' },
            steps: [`사각형의 네 각의 합은 $360^{\\circ}$`, `□ $=360^{\\circ}-${kn.map((i) => `${ang[i]}^{\\circ}`).join('-')}=${ang[hide]}^{\\circ}$`],
          };
        },
      },
      {
        id: 'straight',
        title: '일직선과 직각을 이용한 각',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(4, 32) * 5;
            const left = r.chance(0.5);
            const parts = left ? [180 - a, a] : [a, 180 - a];
            return {
              q: '그림에서 □의 각도는 몇 도인가요?',
              fig: straightFig(parts, left ? ['□', `${a}°`] : [`${a}°`, '□']),
              answer: { type: 'num', value: 180 - a, unit: '°' },
              steps: [`일직선이 이루는 각은 $180^{\\circ}$`, `□ $=180^{\\circ}-${a}^{\\circ}=${180 - a}^{\\circ}$`],
            };
          }
          if (level === 2) {
            const a = r.int(4, 14) * 5;
            const parts = [a, 90 - a, 90];
            const hideFirst = r.chance(0.5);
            return {
              q: '그림에서 □의 각도는 몇 도인가요? (왼쪽 각은 직각입니다.)',
              fig: straightFig(parts, hideFirst ? ['□', `${90 - a}°`, '90°'] : [`${a}°`, '□', '90°']),
              answer: { type: 'num', value: hideFirst ? a : 90 - a, unit: '°' },
              steps: [`일직선 $180^{\\circ}$에서 직각 $90^{\\circ}$를 빼면 $90^{\\circ}$`, `□ $=90^{\\circ}-${hideFirst ? 90 - a : a}^{\\circ}=${hideFirst ? a : 90 - a}^{\\circ}$`],
            };
          }
          const parts = splitAngles(r, 180, 4, 20);
          const h = r.int(0, 3);
          return {
            q: '그림에서 □의 각도는 몇 도인가요?',
            fig: straightFig(parts, parts.map((p, i) => (i === h ? '□' : `${p}°`))),
            answer: { type: 'num', value: parts[h], unit: '°' },
            steps: [`일직선이 이루는 각은 $180^{\\circ}$`, `□ $=180^{\\circ}-${parts.filter((_, i) => i !== h).map((p) => `${p}^{\\circ}`).join('-')}=${parts[h]}^{\\circ}$`],
          };
        },
      },
      {
        id: 'clock-angle',
        title: '시계와 각도',
        gen(r, level) {
          if (level === 1) {
            const h = r.int(1, 11);
            const ang = 30 * Math.min(h, 12 - h);
            return {
              q: `시계가 ${h}시를 가리킬 때, 긴바늘과 짧은바늘이 이루는 작은 쪽의 각은 몇 도인가요?`,
              fig: clock(h, 0),
              answer: { type: 'num', value: ang, unit: '°' },
              steps: [`시계의 큰 눈금 한 칸은 $360^{\\circ}\\div12=30^{\\circ}$`, `두 바늘 사이는 $${Math.min(h, 12 - h)}$칸 → $30^{\\circ}\\times${Math.min(h, 12 - h)}=${ang}^{\\circ}$`],
            };
          }
          if (level === 2) {
            const m = r.int(1, 11) * 5;
            return {
              q: `시계의 긴바늘이 $${m}$분 동안 움직인 각도는 몇 도인가요?`,
              answer: { type: 'num', value: m * 6, unit: '°' },
              steps: [`긴바늘은 $60$분에 $360^{\\circ}$ → $1$분에 $6^{\\circ}$`, `$6^{\\circ}\\times${m}=${m * 6}^{\\circ}$`],
            };
          }
          const hrs = r.int(1, 5);
          const half = r.chance(0.5);
          const v = hrs * 30 + (half ? 15 : 0);
          return {
            q: `시계의 짧은바늘이 $${hrs}$시간${half ? ' $30$분' : ''} 동안 움직인 각도는 몇 도인가요?`,
            answer: { type: 'num', value: v, unit: '°' },
            steps: [`짧은바늘은 $1$시간에 숫자 한 칸, $30^{\\circ}$를 움직여요.`, half ? `$30$분에는 그 절반인 $15^{\\circ}$` : `$${hrs}$시간: $30^{\\circ}\\times${hrs}$`, `$${v}^{\\circ}$`],
          };
        },
      },
    ],
  },

  // ═════════════ e4a-3 곱셈과 나눗셈 ═════════════
  'e4a-3': {
    concepts: [
      {
        title: '(세 자리 수)×(몇십)',
        body: '$123\\times40$ 은 $123\\times4=492$ 에 $0$을 하나 붙여 $4920$.',
      },
      {
        title: '(세 자리 수)×(두 자리 수)',
        body: '곱하는 수를 일의 자리와 십의 자리로 나누어 곱한 뒤 더해요.\n$$254\\times36 = 254\\times6 + 254\\times30 = 1524+7620 = 9144$$\n- 3학년 2학기의 (두 자리 수)×(두 자리 수)와 같은 방법이에요.',
      },
      {
        title: '몇십으로 나누기',
        body: '$240\\div30$ 은 $24\\div3$ 과 몫이 같아요 → $8$.\n- $250\\div30=8\\cdots10$ (나머지에는 $0$을 붙여야 해요)',
      },
      {
        title: '(두·세 자리 수)÷(두 자리 수)',
        body: '나누는 수를 몇십으로 어림해 몫을 짐작한 뒤, 곱해서 확인하고 고쳐요.\n- $195\\div24$: $24$를 $20$으로 어림하면 몫은 약 $9$ → $24\\times9=216$ 은 너무 커요 → $24\\times8=192$, 나머지 $3$\n- 몫이 두 자리이면 앞의 두 자리부터 나누어요.',
        example: { q: '$847\\div23$', a: '$84\\div23=3\\cdots15$, $157\\div23=6\\cdots19$ → 몫 $36$, 나머지 $19$' },
      },
      {
        title: '검산',
        body: '(나누는 수)$\\times$(몫)$+$(나머지)$=$(나누어지는 수). 나머지는 나누는 수보다 작아야 해요.',
      },
    ],
    skills: [
      {
        id: 'mul32',
        title: '(세 자리 수)×(두 자리 수)',
        gen(r, level) {
          const a = r.int(101, 999);
          const b = level === 1 ? r.int(2, 9) * 10 : level === 2 ? r.int(11, 49) : r.int(51, 99);
          return { q: `계산해 보세요. $$${a}\\times${b}$$`, answer: { type: 'num', value: a * b }, steps: mul2Steps(a, b) };
        },
      },
      {
        id: 'div2',
        title: '(두·세 자리 수)÷(두 자리 수)',
        gen(r, level) {
          let a: number, b: number;
          if (level === 1) {
            b = r.int(2, 9) * 10;
            a = b * r.int(2, 9) + (r.chance(0.6) ? r.int(1, b / 10 - 1 > 0 ? b / 10 - 1 : 1) * 10 : 0);
          } else if (level === 2) {
            b = r.int(12, 49);
            a = b * r.int(2, 9) + r.int(0, b - 1);
          } else {
            b = r.int(12, 49);
            a = b * r.int(11, Math.floor(999 / b)) + r.int(0, b - 1);
            if (a > 999) a = b * 11 + 3;
          }
          return {
            q: `몫과 나머지를 구하세요. $$${a}\\div${b}$$`,
            answer: { type: 'fields', fields: [{ label: '몫', value: Math.floor(a / b) }, { label: '나머지', value: a % b }] },
            steps: divSteps(a, b),
            hint: level >= 2 ? `$${b}$를 몇십으로 어림해 몫을 짐작해 보세요.` : undefined,
          };
        },
      },
      {
        id: 'check',
        title: '검산과 어떤 수',
        gen(r, level) {
          const b = r.int(12, 45);
          const q = r.int(11, 30);
          const rem = r.int(1, b - 1);
          const x = b * q + rem;
          if (level === 1)
            return {
              q: `□ 안에 알맞은 수를 구하세요. $$\\square\\div${b}=${q}\\cdots${rem}$$`,
              answer: { type: 'num', value: x },
              steps: [`□ $=${b}\\times${q}+${rem}$`, `$=${b * q}+${rem}=${x}$`],
            };
          if (level === 2) {
            const k = r.int(12, 40);
            const y = r.int(12, 60) * k;
            return {
              q: `어떤 수에 $${k}$를 곱해야 할 것을 잘못하여 나누었더니 몫이 $${y / k}$이고 나누어떨어졌습니다. 바르게 계산하면 얼마인가요?`,
              answer: { type: 'num', value: y * k },
              steps: [`어떤 수 $=${k}\\times${y / k}=${y}$`, `바르게 계산: $${y}\\times${k}=${c(y * k)}$`],
            };
          }
          const qq = r.int(12, 30);
          return {
            q: `어떤 수를 $${b}$로 나누었더니 몫이 $${qq}$이고, 나머지는 될 수 있는 수 중 가장 큰 수였습니다. 어떤 수는 얼마인가요?`,
            answer: { type: 'num', value: b * qq + b - 1 },
            steps: [`가장 큰 나머지는 나누는 수보다 $1$ 작은 $${b - 1}$`, `어떤 수 $=${b}\\times${qq}+${b - 1}=${b * qq + b - 1}$`],
          };
        },
      },
      {
        id: 'word',
        title: '곱셈과 나눗셈 문장제',
        gen(r, level) {
          const name = pickName(r);
          if (level === 1) {
            const a = r.int(120, 650),
              b = r.int(12, 40);
            const tpl = r.int(0, 1);
            return {
              q: tpl === 0 ? `공장에서 하루에 장난감을 $${a}$개씩 만듭니다. $${b}$일 동안 만든 장난감은 모두 몇 개인가요?` : `${name}네 학교 학생 $${b}$명이 $${a}$원씩 모아 불우이웃을 도왔습니다. 모은 돈은 모두 얼마인가요?`,
              answer: { type: 'num', value: a * b, unit: tpl === 0 ? '개' : '원' },
              steps: [`$${a}\\times${b}$`, ...mul2Steps(a, b)],
            };
          }
          const b = r.int(12, 35);
          const q = r.int(5, 25);
          const rem = r.int(1, b - 1);
          const a = b * q + rem;
          if (level === 2)
            return {
              q: `연필 $${a}$자루를 한 상자에 $${b}$자루씩 담으려고 합니다. 몇 상자가 되고 몇 자루가 남나요?`,
              answer: { type: 'fields', fields: [{ label: '상자', value: q }, { label: '남는 연필', value: rem, unit: '자루' }] },
              steps: [`$${a}\\div${b}$`, ...divSteps(a, b).slice(-1)],
            };
          if (r.chance(0.5))
            return {
              q: `학생 $${a}$명이 한 대에 $${b}$명씩 탈 수 있는 버스를 타고 체험 학습을 가려고 합니다. 버스는 적어도 몇 대 필요한가요?`,
              answer: { type: 'num', value: q + 1, unit: '대' },
              steps: [`$${a}\\div${b}=${q}\\cdots${rem}$`, `남는 $${rem}$명도 타야 하므로 $${q}+1=${q + 1}$(대)`],
            };
          const price = r.int(12, 48) * 10;
          const n = r.int(12, 35);
          const tot = price * n;
          const each = r.pick([2, 4, 5, 8, 10].filter((d) => tot % d === 0));
          return {
            q: `한 개에 $${price}$원인 공책을 $${n}$권 사고, 그 값을 $${each}$명이 똑같이 나누어 내려고 합니다. 한 명이 얼마씩 내야 하나요?`,
            answer: { type: 'num', value: tot / each, unit: '원' },
            steps: [`공책 값: $${price}\\times${n}=${c(tot)}$(원)`, `한 명: $${c(tot)}\\div${each}=${c(tot / each)}$(원)`],
          };
        },
      },
      {
        id: 'estimate',
        title: '계산 결과 비교하기',
        gen(r, level) {
          const items: { t: string; v: number }[] = [];
          const seen = new Set<number>();
          for (let t = 0; items.length < 4 && t < 300; t++) {
            if (level === 1 || (level === 3 && t % 2 === 0)) {
              const a = r.int(101, 499),
                b = level === 1 ? r.int(2, 9) * 10 : r.int(11, 40);
              if (seen.has(a * b)) continue;
              seen.add(a * b);
              items.push({ t: `$${a}\\times${b}$`, v: a * b });
            } else {
              const b = r.int(12, 40),
                q = r.int(5, 24);
              const a = b * q;
              if (seen.has(q) || a > 999) continue;
              seen.add(q);
              items.push({ t: `$${a}\\div${b}$`, v: q });
            }
          }
          if (level === 3) {
            // 곱과 몫이 섞이면 비교가 쉬우므로 곱끼리만 비교
            const prods = items.filter((x) => x.t.includes('times'));
            while (prods.length < 4) {
              const a = r.int(101, 499),
                b = r.int(11, 40);
              if (!prods.some((p) => p.v === a * b)) prods.push({ t: `$${a}\\times${b}$`, v: a * b });
            }
            items.splice(0, items.length, ...prods.slice(0, 4));
          }
          const big = r.chance(0.5);
          const sorted = items.slice().sort((x, y) => (big ? y.v - x.v : x.v - y.v));
          return {
            q: `계산 결과가 가장 ${big ? '큰' : '작은'} 것은 어느 것인가요?`,
            answer: makeChoices(r, sorted[0].t, sorted.slice(1).map((x) => x.t), 4),
            steps: [...items.map((x) => `${x.t.slice(0, -1)}=${c(x.v)}$`), `답: ${sorted[0].t}`],
          };
        },
      },
    ],
  },

  // ═════════════ e4a-4 평면도형의 이동 ═════════════
  'e4a-4': {
    concepts: [
      {
        title: '밀기',
        body: '도형을 어느 방향으로 밀어도 **모양과 크기는 변하지 않고** 위치만 바뀌어요.',
      },
      {
        title: '뒤집기',
        body: '- 오른쪽(왼쪽)으로 뒤집으면 도형의 **왼쪽과 오른쪽**이 서로 바뀌어요.\n- 위쪽(아래쪽)으로 뒤집으면 도형의 **위쪽과 아래쪽**이 서로 바뀌어요.\n- 같은 방향으로 두 번 뒤집으면 처음 도형과 같아요.',
      },
      {
        title: '돌리기',
        body: '- 시계 방향으로 $90^{\\circ}$ 돌리면 위쪽이 오른쪽으로 가요.\n- 시계 방향으로 $90^{\\circ}$ = 시계 반대 방향으로 $270^{\\circ}$\n- $180^{\\circ}$ 돌리면 위와 아래, 왼쪽과 오른쪽이 모두 바뀌어요.\n- $360^{\\circ}$ 돌리면 처음과 같아요.',
        example: { q: '시계 방향으로 $90^{\\circ}$씩 $5$번 돌린 도형은?', a: '$4$번이면 제자리이므로 시계 방향으로 $90^{\\circ}$ 한 번 돌린 것과 같아요.' },
      },
      {
        title: '뒤집고 돌리기',
        body: '여러 번 움직일 때는 **순서대로 한 번씩** 움직여 보아요. 순서가 바뀌면 결과가 달라질 수 있어요.\n- 오른쪽으로 뒤집고 위쪽으로 뒤집은 도형 = $180^{\\circ}$ 돌린 도형',
      },
    ],
    skills: [
      {
        id: 'flip',
        title: '뒤집기',
        gen(r, level) {
          const size = 3;
          const sh = asymShape(r, size, level === 1 ? 4 : 5);
          if (level === 3) {
            const twice = r.chance(0.5);
            if (twice) {
              const dir = r.pick(['오른쪽', '위쪽']);
              return moveChoice(r, sh, sh, size, `처음 도형을 ${dir}으로 $2$번 뒤집은 도형을 고르세요.`, [`같은 방향으로 두 번 뒤집으면 처음 도형과 같아요.`]);
            }
            return moveChoice(r, sh, flipV(flipH(sh)), size, '처음 도형을 오른쪽으로 뒤집은 다음 아래쪽으로 뒤집은 도형을 고르세요.', ['오른쪽으로 뒤집으면 왼쪽과 오른쪽이 바뀌고, 아래쪽으로 뒤집으면 위와 아래가 바뀌어요.', '결과는 $180^{\\circ}$ 돌린 도형과 같아요.']);
          }
          const h = r.chance(0.5);
          const dir = h ? r.pick(['오른쪽', '왼쪽']) : r.pick(['위쪽', '아래쪽']);
          return moveChoice(r, sh, h ? flipH(sh) : flipV(sh), size, `처음 도형을 ${dir}으로 뒤집은 도형을 고르세요.`, [h ? '왼쪽과 오른쪽이 서로 바뀌어요.' : '위쪽과 아래쪽이 서로 바뀌어요.']);
        },
      },
      {
        id: 'rotate',
        title: '돌리기',
        gen(r, level) {
          const size = 3;
          const sh = asymShape(r, size, level === 1 ? 4 : 5);
          if (level === 3) {
            const k = r.pick([5, 6, 7, 9, 10, 11]);
            const cw = r.chance(0.5);
            const eff = (cw ? k : 4 - (k % 4)) % 4;
            return moveChoice(r, sh, rotN(sh, eff), size, `처음 도형을 시계 ${cw ? '' : '반대 '}방향으로 $90^{\\circ}$씩 $${k}$번 돌린 도형을 고르세요.`, [
              `$90^{\\circ}$씩 $4$번 돌리면 $360^{\\circ}$로 처음과 같아요.`,
              `$${k}\\div4=${Math.floor(k / 4)}\\cdots${k % 4}$ → 시계 ${cw ? '' : '반대 '}방향으로 $90^{\\circ}$씩 $${k % 4}$번 돌린 것과 같아요.`,
            ]);
          }
          const opts = level === 1 ? [0, 1] : [2, 3, 4];
          const m = MOVES.slice(4)[r.pick(opts)];
          return moveChoice(r, sh, m.f(sh), size, `처음 도형을 ${m.name.replace('돌리기', '돌린')} 도형을 고르세요.`, [`도형의 위쪽 부분이 어디로 가는지 따라가 보세요.`, m.name]);
        },
      },
      {
        id: 'combo',
        title: '뒤집고 돌리기',
        gen(r, level) {
          const size = 3;
          const sh = asymShape(r, size, 5);
          const flip = r.pick([MOVES[0], MOVES[2]]);
          const rot = r.pick(MOVES.slice(4, 7));
          if (level === 3) {
            // 결과를 보고 처음 도형 찾기: 시계 방향 90° 돌린 결과 → 처음은 반시계 90°
            const k = r.int(1, 3);
            const res = rotN(sh, k);
            const names = ['', '시계 방향으로 $90^{\\circ}$', '시계 방향으로 $180^{\\circ}$', '시계 반대 방향으로 $90^{\\circ}$'];
            const back = ['', '시계 반대 방향으로 $90^{\\circ}$', '$180^{\\circ}$', '시계 방향으로 $90^{\\circ}$'];
            return moveChoice(r, res, sh, size, `어떤 도형을 ${names[k]}만큼 돌렸더니 색칠된 왼쪽 도형이 되었습니다. 처음 도형을 고르세요.`, [`거꾸로 생각해요: 왼쪽 도형을 ${back[k]}만큼 돌리면 처음 도형이에요.`], '돌린 후');
          }
          const first = level === 1 ? flip : r.chance(0.5) ? flip : rot;
          const second = first === flip ? rot : flip;
          const res = second.f(first.f(sh));
          return moveChoice(r, sh, res, size, `처음 도형을 ${first.name.replace('기', '고')}, 다시 ${second.name.replace('돌리기', '돌린').replace('뒤집기', '뒤집은')} 도형을 고르세요.`, [`먼저 ${first.name}, 그다음 ${second.name}를 차례로 해요.`]);
        },
      },
      {
        id: 'which-move',
        title: '어떻게 움직였는지 알기',
        gen(r, level) {
          const size = 3;
          const sh = asymShape(r, size, level === 1 ? 4 : 5);
          const cands: { name: string; f: (x: Cells) => Cells }[] = [
            { name: '밀기', f: (x) => x },
            { name: '오른쪽으로 뒤집기', f: flipH },
            { name: '아래쪽으로 뒤집기', f: flipV },
            { name: '시계 방향으로 $90^{\\circ}$만큼 돌리기', f: (x) => rotN(x, 1) },
            { name: '시계 방향으로 $180^{\\circ}$만큼 돌리기', f: (x) => rotN(x, 2) },
            { name: '시계 반대 방향으로 $90^{\\circ}$만큼 돌리기', f: (x) => rotN(x, 3) },
          ];
          const pool = level === 1 ? cands.slice(0, 3) : cands;
          const ans = r.pick(level === 1 ? pool : cands.slice(1));
          const res = ans.f(sh);
          return {
            q: '왼쪽 도형을 한 번 움직였더니 오른쪽 도형이 되었습니다. 어떻게 움직인 것인가요?',
            fig: cellsFig([{ cells: sh, label: '처음', mark: true }, { cells: res, label: '움직인 후' }], size, { cs: 16 }),
            answer: makeChoices(r, ans.name, cands.filter((x) => x !== ans).map((x) => x.name), 4),
            steps: [`처음 도형의 부분들이 어디로 갔는지 비교해 보세요.`, `답: ${ans.name}`],
          };
        },
      },
      {
        id: 'num-rotate',
        title: '수 카드 돌리기',
        gen(r, level) {
          const len = level === 1 ? 2 : 3;
          let s = '';
          for (let t = 0; t < 100; t++) {
            s = Array.from({ length: len }, () => r.pick(['1', '6', '8', '9', '0'])).join('');
            const rot = s.split('').reverse().map((ch) => ROT_DIG[ch]).join('');
            if (s[0] !== '0' && rot[0] !== '0' && rot !== s) break;
          }
          const rot = s.split('').reverse().map((ch) => ROT_DIG[ch]).join('');
          const a = +s,
            b = +rot;
          const card = s.split('').map((ch) => `\\boxed{${ch}}`).join('');
          if (level === 1)
            return {
              q: `수 카드 $${card}$를 시계 방향으로 $180^{\\circ}$만큼 돌렸을 때 만들어지는 수는 얼마인가요?`,
              answer: { type: 'num', value: b },
              steps: ['$180^{\\circ}$ 돌리면 카드의 순서가 거꾸로 되고, $6$은 $9$로, $9$는 $6$으로 보여요. $0, 1, 8$은 그대로예요.', `$${s}$ → $${rot}$`],
            };
          return {
            q: `수 카드 $${card}$를 시계 방향으로 $180^{\\circ}$만큼 돌렸을 때 만들어지는 수와 처음 수의 ${level === 2 ? '합을' : '차를'} 구하세요.`,
            answer: { type: 'num', value: level === 2 ? a + b : Math.abs(a - b) },
            steps: [
              '$180^{\\circ}$ 돌리면 순서가 거꾸로 되고 $6 \\leftrightarrow 9$로 바뀌어요.',
              `돌린 수: $${b}$`,
              level === 2 ? `$${a}+${b}=${a + b}$` : `$${Math.max(a, b)}-${Math.min(a, b)}=${Math.abs(a - b)}$`,
            ],
          };
        },
      },
    ],
  },

  // ═════════════ e4a-5 막대그래프 ═════════════
  'e4a-5': {
    concepts: [
      {
        title: '막대그래프',
        body: '조사한 자료의 수량을 **막대의 길이**로 나타낸 그래프를 막대그래프라고 해요.\n- 가로와 세로가 무엇을 나타내는지, 눈금 한 칸이 얼마인지 먼저 확인해요.\n- 3학년 때 배운 그림그래프보다 크기 비교가 한눈에 잘 보여요.',
      },
      {
        title: '막대그래프 읽기',
        body: '막대 끝이 닿은 눈금을 읽어요. 눈금 한 칸이 $2$명이면 $5$칸은 $10$명이에요.\n- 막대가 가장 긴 항목이 가장 많아요.',
      },
      {
        title: '막대그래프 그리기',
        body: '① 가로·세로에 무엇을 쓸지 정해요. ② 눈금 한 칸의 크기를 정해요(가장 큰 값이 들어가게). ③ 조사한 수에 맞게 막대를 그려요. ④ 제목을 붙여요.',
      },
      {
        title: '막대그래프로 알 수 있는 것',
        body: '가장 많은 것과 적은 것, 두 항목의 차이, 몇 배인지 등을 알 수 있어요. 표는 정확한 수와 합계를 알기 쉽고, 막대그래프는 크기 비교가 쉬워요.',
      },
    ],
    skills: [
      {
        id: 'read',
        title: '막대그래프 읽기',
        gen(r, level) {
          const { th, cats, vals, step, fig } = barData(r, level);
          const i = r.int(0, cats.length - 1);
          return {
            q: `${th.title}를 나타낸 막대그래프입니다. ${cats[i]}의 ${th.what}는 몇 ${th.unit}인가요?`,
            fig: fig(),
            answer: { type: 'num', value: vals[i], unit: th.unit },
            steps: [`세로 눈금 한 칸은 $${step}$${th.unit}`, `${cats[i]}의 막대는 $${vals[i] / step}$칸 → $${vals[i]}$${th.unit}`],
          };
        },
      },
      {
        id: 'compare',
        title: '가장 많은 것과 차이',
        gen(r, level) {
          const { th, cats, vals, fig } = barData(r, level);
          const mi = vals.indexOf(Math.max(...vals)),
            li = vals.indexOf(Math.min(...vals));
          if (level === 1) {
            const most = r.chance(0.5);
            const idx = most ? mi : li;
            return {
              q: `${th.title}를 나타낸 막대그래프입니다. ${th.what}가 가장 ${most ? '많은' : '적은'} 것은 무엇인가요?`,
              fig: fig(),
              answer: makeChoices(r, cats[idx], cats.filter((_, j) => j !== idx), 4),
              steps: [`막대가 가장 ${most ? '긴' : '짧은'} 것을 찾아요.`, `답: ${cats[idx]}`],
            };
          }
          if (level === 2) {
            return {
              q: `${th.title}를 나타낸 막대그래프입니다. 가장 많은 것과 가장 적은 것의 차는 몇 ${th.unit}인가요?`,
              fig: fig(),
              answer: { type: 'num', value: vals[mi] - vals[li], unit: th.unit },
              steps: [`가장 많은 것: ${cats[mi]} $${vals[mi]}$, 가장 적은 것: ${cats[li]} $${vals[li]}$`, `$${vals[mi]}-${vals[li]}=${vals[mi] - vals[li]}$(${th.unit})`],
            };
          }
          const [i, j] = r.sample(cats.map((_, k) => k), 2);
          const tot = vals.reduce((a, b) => a + b, 0);
          return {
            q: `${th.title}를 나타낸 막대그래프입니다. 전체에서 ${J(cats[i], '와/과')} ${J(cats[j], '을/를')} 뺀 나머지는 모두 몇 ${th.unit}인가요?`,
            fig: fig(),
            answer: { type: 'num', value: tot - vals[i] - vals[j], unit: th.unit },
            steps: [`전체: ${vals.map((v) => `$${v}$`).join('+')} $=${tot}$`, `$${tot}-${vals[i]}-${vals[j]}=${tot - vals[i] - vals[j]}$(${th.unit})`],
          };
        },
      },
      {
        id: 'table-link',
        title: '표와 막대그래프',
        gen(r, level) {
          const { th, cats, vals, step, fig } = barData(r, level);
          const i = r.int(0, cats.length - 1);
          const tot = vals.reduce((a, b) => a + b, 0);
          if (level === 1) {
            return {
              q: `${th.title}를 조사하여 막대그래프로 나타냈습니다. 표의 □에 알맞은 수를 구하세요.`,
              fig: fig(),
              table: [['항목', ...cats, '합계'], [`${th.what}(${th.unit})`, ...vals.map((v, j) => (j === i ? '□' : `$${v}$`)), `$${tot}$`]],
              answer: { type: 'num', value: vals[i], unit: th.unit },
              steps: [`그래프에서 ${cats[i]}의 막대를 읽거나, 합계에서 나머지를 빼요.`, `$${tot}-${vals.filter((_, j) => j !== i).join('-')}=${vals[i]}$`],
            };
          }
          const hidden = vals.map((v, j) => (j === i ? 0 : v));
          return {
            q: `${th.title}를 조사한 막대그래프에서 ${cats[i]}의 막대가 지워졌습니다. 전체 합계가 $${tot}$${th.unit}일 때, ${cats[i]}의 막대는 눈금 몇 칸으로 그려야 하나요?`,
            fig: fig(hidden),
            answer: { type: 'num', value: vals[i] / step, unit: '칸' },
            steps: [`${cats[i]}: $${tot}-${vals.filter((_, j) => j !== i).join('-')}=${vals[i]}$(${th.unit})`, `눈금 한 칸이 $${step}$${th.unit}이므로 $${vals[i]}\\div${step}=${vals[i] / step}$(칸)`],
            hint: '먼저 지워진 항목의 수를 구한 뒤, 눈금 한 칸의 크기로 나누어요.',
          };
        },
      },
      {
        id: 'times',
        title: '몇 배인지 알기',
        gen(r, level) {
          const th = r.pick(BAR_THEMES);
          const step = level === 1 ? 1 : level === 2 ? 2 : 5;
          const s0 = r.int(2, 4);
          let k = r.int(2, level === 1 ? 3 : 4);
          while (s0 * k - s0 - 1 < 2) k++;
          const mids = r.sample(Array.from({ length: s0 * k - s0 - 1 }, (_, i) => s0 + 1 + i), 2);
          const cats = th.cats.slice(0, 4);
          const vals = r.shuffle([s0 * k, s0, ...mids].map((x) => x * step));
          const mi = vals.indexOf(Math.max(...vals)),
            li = vals.indexOf(Math.min(...vals));
          const max = Math.ceil(Math.max(...vals) / step) * step + step;
          return {
            q: `${th.title}를 나타낸 막대그래프입니다. 가장 많은 것은 가장 적은 것의 몇 배인가요?`,
            fig: barChart(cats, vals, { unit: th.unit, max, step }),
            answer: { type: 'num', value: vals[mi] / vals[li], unit: '배' },
            steps: [`가장 많은 것: ${cats[mi]} $${vals[mi]}$, 가장 적은 것: ${cats[li]} $${vals[li]}$`, `$${vals[mi]}\\div${vals[li]}=${vals[mi] / vals[li]}$(배)`],
          };
        },
      },
      {
        id: 'interpret',
        title: '막대그래프 해석하기',
        gen(r, level) {
          const { th, cats, vals, fig } = barData(r, level);
          const mi = vals.indexOf(Math.max(...vals)),
            li = vals.indexOf(Math.min(...vals));
          const tot = vals.reduce((a, b) => a + b, 0);
          const [i, j] = r.sample(cats.map((_, k) => k), 2);
          const diff = Math.abs(vals[i] - vals[j]);
          const [hi, lo] = vals[i] > vals[j] ? [i, j] : [j, i];
          const truths = [
            `${th.what}가 가장 많은 것은 ${cats[mi]}입니다.`,
            `${th.what}가 가장 적은 것은 ${cats[li]}입니다.`,
            `${J(cats[hi], '은/는')} ${cats[lo]}보다 ${diff}${th.unit} 더 많습니다.`,
            `전체 ${th.what}는 ${tot}${th.unit}입니다.`,
          ];
          const falses = [
            `${th.what}가 가장 많은 것은 ${cats[li]}입니다.`,
            `${th.what}가 가장 적은 것은 ${cats[mi]}입니다.`,
            `${J(cats[lo], '은/는')} ${cats[hi]}보다 ${diff}${th.unit} 더 많습니다.`,
            `전체 ${th.what}는 ${tot + vals[i]}${th.unit}입니다.`,
            `${J(cats[hi], '은/는')} ${cats[lo]}보다 ${diff + vals[lo]}${th.unit} 더 많습니다.`,
          ];
          const wantTrue = r.chance(0.5);
          const ans = r.pick(wantTrue ? truths : falses);
          return {
            q: `${th.title}를 나타낸 막대그래프를 보고 ${wantTrue ? '옳은' : '옳지 **않은**'} 것을 고르세요.`,
            fig: fig(),
            answer: makeChoices(r, ans, r.sample(wantTrue ? falses : truths, 3), 4),
            steps: [...cats.map((ct, k) => `${ct}: $${vals[k]}$`).slice(0, 5), `${wantTrue ? '옳은' : '옳지 않은'} 것: ${ans}`],
          };
        },
      },
    ],
  },

  // ═════════════ e4a-6 규칙 찾기 ═════════════
  'e4a-6': {
    concepts: [
      {
        title: '수 배열의 규칙',
        body: '수 배열표에서 → 방향, ↓ 방향, ↘ 방향으로 수가 얼마씩 변하는지 찾아요.\n- 예: 오른쪽으로 $100$씩, 아래로 $1000$씩 커져요.',
      },
      {
        title: '도형 배열의 규칙',
        body: '모양이 바뀔 때마다 사각형(또는 바둑돌)이 몇 개씩 늘어나는지 찾아요.\n- $1, 3, 5, 7, \\dots$ → $2$개씩 늘어나요.\n- $1, 3, 6, 10, \\dots$ → $2, 3, 4$개씩 늘어나요.',
      },
      {
        title: '계산식의 규칙',
        body: '계산식을 차례로 늘어놓으면 규칙이 보여요.\n$$101\\times11=1111,\\; 202\\times11=2222,\\; 303\\times11=3333$$\n- 규칙을 찾으면 계산하지 않고도 다음 계산식의 결과를 알 수 있어요.',
      },
      {
        title: '등호(=)가 있는 식',
        body: '$=$는 양쪽의 크기가 같다는 뜻이에요.\n- $15+8=16+7$: 앞의 수가 $1$ 커지면 뒤의 수가 $1$ 작아져야 합이 같아요.\n- $12\\times6=24\\times3$: 앞의 수가 $2$배가 되면 뒤의 수는 반이 되어야 곱이 같아요.',
      },
    ],
    skills: [
      {
        id: 'num-table',
        title: '수 배열표의 규칙',
        gen(r, level) {
          const right = level === 1 ? r.pick([1, 10, 100]) : r.pick([11, 100, 101, 1000, 110]);
          const down = level === 1 ? r.pick([10, 100, 1000].filter((x) => x !== right)) : r.pick([1000, 10000, 1010, 2000]);
          const start = level === 1 ? r.int(1, 9) * 100 + r.int(0, 9) : r.int(10, 50) * 1000 + r.int(0, 9) * 10 + r.int(0, 9);
          const R = 3,
            C = 4;
          const val = (i: number, j: number) => start + i * down + j * right;
          if (level === 3) {
            const ti = R,
              tj = r.int(0, C - 1);
            const table = [['', ...Array.from({ length: C }, (_, j) => `${j + 1}열`)], ...Array.from({ length: R }, (_, i) => [`${i + 1}행`, ...Array.from({ length: C }, (_, j) => `$${c(val(i, j))}$`)])];
            return {
              q: `수 배열표의 규칙에 따라 표를 아래로 한 줄 더 늘리면, ${ti + 1}행 ${tj + 1}열에 올 수는 얼마인가요?`,
              table,
              answer: { type: 'num', value: val(ti, tj) },
              steps: [`오른쪽으로 $${c(right)}$씩, 아래로 $${c(down)}$씩 커져요.`, `${ti}행 ${tj + 1}열 $${c(val(ti - 1, tj))}$에서 $${c(down)}$ 큰 수: $${c(val(ti, tj))}$`],
            };
          }
          const hi = r.int(0, R - 1),
            hj = r.int(1, C - 1);
          const table = [['', ...Array.from({ length: C }, (_, j) => `${j + 1}열`)], ...Array.from({ length: R }, (_, i) => [`${i + 1}행`, ...Array.from({ length: C }, (_, j) => (i === hi && j === hj ? '□' : `$${c(val(i, j))}$`))])];
          return {
            q: '수 배열표에서 규칙을 찾아 □ 안에 알맞은 수를 구하세요.',
            table,
            answer: { type: 'num', value: val(hi, hj) },
            steps: [`오른쪽으로 $${c(right)}$씩, 아래로 $${c(down)}$씩 커지는 규칙이에요.`, `□ $=${c(val(hi, hj - 1))}+${c(right)}=${c(val(hi, hj))}$`],
          };
        },
      },
      {
        id: 'seq',
        title: '수의 규칙',
        gen(r, level) {
          let seq: number[];
          let rule: string;
          if (level === 1) {
            const st = r.pick([2, 3, 5, 10, 25, 50, 100]);
            const a = r.int(1, 50);
            const down = r.chance(0.3);
            seq = Array.from({ length: 6 }, (_, k) => (down ? a + 5 * st - k * st : a + k * st));
            rule = `$${st}$씩 ${down ? '작아지는' : '커지는'} 규칙`;
          } else if (level === 2) {
            const m = r.pick([2, 3]);
            const a = r.int(1, 7);
            seq = Array.from({ length: 6 }, (_, k) => a * m ** k);
            rule = `앞의 수에 $${m}$을 곱하는 규칙`;
          } else {
            const a = r.int(1, 20),
              d0 = r.int(1, 4),
              dd = r.int(1, 3);
            seq = [a];
            for (let k = 1; k < 6; k++) seq.push(seq[k - 1] + d0 + dd * (k - 1));
            rule = `더하는 수가 $${d0}, ${d0 + dd}, ${d0 + 2 * dd}, \\dots$ 처럼 $${dd}$씩 커지는 규칙`;
          }
          const h = r.int(3, 5);
          return {
            q: `규칙을 찾아 □ 안에 알맞은 수를 구하세요. $$${seq.map((v, i) => (i === h ? '\\square' : c(v))).join(',\\; ')}$$`,
            answer: { type: 'num', value: seq[h] },
            steps: [`${rule}이에요.`, `□ $=${c(seq[h])}$`],
          };
        },
      },
      {
        id: 'shape-pattern',
        title: '도형 배열의 규칙',
        gen(r, level) {
          type Pat = { name: string; f: (n: number) => number; draw: (s: Svg, n: number, x0: number, y0: number, u: number) => number; why: string };
          const pats: Pat[] = [
            {
              name: 'line',
              f: (n) => 2 * n - 1,
              why: '사각형이 $2$개씩 늘어나요. $n$째: $2\\times n-1$',
              draw: (s, n, x0, y0, u) => {
                for (let i = 0; i < n; i++) s.rect(x0 + i * u, y0, u, u, { cls: 'acc', fill: true });
                for (let i = 1; i < n; i++) s.rect(x0, y0 - i * u, u, u, { cls: 'acc', fill: true });
                return n * u;
              },
            },
            {
              name: 'stair',
              f: (n) => (n * (n + 1)) / 2,
              why: '늘어나는 사각형의 수가 $2, 3, 4, \\dots$ 로 $1$씩 커져요.',
              draw: (s, n, x0, y0, u) => {
                for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) s.rect(x0 + i * u, y0 - j * u, u, u, { cls: 'acc', fill: true });
                return n * u;
              },
            },
            {
              name: 'square',
              f: (n) => n * n,
              why: '가로와 세로가 $1$칸씩 늘어나는 정사각형 모양이에요. $n$째: $n\\times n$',
              draw: (s, n, x0, y0, u) => {
                for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) s.rect(x0 + i * u, y0 - j * u, u, u, { cls: 'acc', fill: true });
                return n * u;
              },
            },
            {
              name: 'cross',
              f: (n) => 4 * n - 3,
              why: '사각형이 $4$개씩 늘어나요.',
              draw: (s, n, x0, y0, u) => {
                const cxp = x0 + (n - 1) * u;
                const cy = y0 - (n - 1) * u;
                s.rect(cxp, cy, u, u, { cls: 'acc', fill: true });
                for (let k = 1; k < n; k++) {
                  s.rect(cxp + k * u, cy, u, u, { cls: 'acc', fill: true });
                  s.rect(cxp - k * u, cy, u, u, { cls: 'acc', fill: true });
                  s.rect(cxp, cy + k * u, u, u, { cls: 'acc', fill: true });
                  s.rect(cxp, cy - k * u, u, u, { cls: 'acc', fill: true });
                }
                return (2 * n - 1) * u;
              },
            },
          ];
          const p = level === 1 ? r.pick([pats[0], pats[3]]) : level === 2 ? r.pick([pats[1], pats[2]]) : r.pick(pats);
          const u = p.name === 'cross' ? 7 : 9;
          const s = new Svg(300, 110);
          let x = 10;
          for (let n = 1; n <= 4; n++) {
            const w = p.draw(s, n, x, p.name === 'cross' ? 50 + 3 * u : 90 - u, u);
            s.text(x + w / 2, 104, `${['첫째', '둘째', '셋째', '넷째'][n - 1]}`, { size: 11 });
            x += Math.max(w, 26) + 16;
          }
          const target = level === 3 ? r.int(7, 10) : r.int(5, 7);
          const ord = ['', '첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째', '열째'][target];
          return {
            q: `규칙에 따라 사각형을 늘어놓았습니다. ${ord} 모양에서 사각형은 모두 몇 개인가요?`,
            fig: s.toString(),
            answer: { type: 'num', value: p.f(target), unit: '개' },
            steps: [`첫째부터 넷째까지: $${[1, 2, 3, 4].map(p.f).join(', ')}$`, p.why, `${ord}: $${p.f(target)}$개`],
          };
        },
      },
      {
        id: 'calc-pattern',
        title: '계산식의 규칙',
        gen(r, level) {
          type T = { rows: (k: number) => [string, number]; max: number };
          const temps: T[] = [
            { rows: (k) => [`${k}0${k}\\times11`, 1111 * k], max: 9 },
            { rows: (k) => [`37\\times${3 * k}`, 111 * k], max: 9 },
            { rows: (k) => [`${'1'.repeat(k)}\\times${'1'.repeat(k)}`, Number('1'.repeat(k)) ** 2], max: 5 },
            { rows: (k) => [`${Array.from({ length: k }, (_, i) => i + 1).concat(Array.from({ length: k - 1 }, (_, i) => k - 1 - i)).join('+')}`, k * k], max: 9 },
            { rows: (k) => [`${k * 100}+${(k + 1) * 100}-${k * 100 + 50}`, (k + 1) * 100 - 50], max: 9 },
            { rows: (k) => [`${k}\\times 9+${k + 1}`, k * 9 + k + 1], max: 9 },
          ];
          const T0 = level === 1 ? r.pick([temps[0], temps[1], temps[4]]) : level === 2 ? r.pick([temps[2], temps[3], temps[5]]) : r.pick(temps);
          const startK = T0 === temps[2] || T0 === temps[3] ? 1 : r.int(1, 3);
          const shown = [0, 1, 2].map((i) => T0.rows(startK + i));
          const targetK = Math.min(T0.max, startK + (level === 3 ? r.int(4, 5) : 3));
          const [expr, v] = T0.rows(targetK);
          const ord = targetK - startK + 1;
          return {
            q: `계산식의 규칙을 찾아 ${['', '첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째'][ord]} 계산식의 계산 결과를 구하세요. $$\\begin{aligned}${shown.map(([e, x]) => `${e}&=${c(x)}`).join('\\\\')}\\end{aligned}$$`,
            answer: { type: 'num', value: v },
            steps: [`계산식과 결과가 일정한 규칙으로 변해요.`, `${['', '첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째'][ord]} 계산식: $${expr}=${c(v)}$`],
          };
        },
      },
      {
        id: 'equal-sign',
        title: '등호가 있는 식',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(20, 80),
              b = r.int(10, 60),
              k = r.int(1, 9);
            return {
              q: `□ 안에 알맞은 수를 구하세요. $$${a}+${b}=${a + k}+\\square$$`,
              answer: { type: 'num', value: b - k },
              steps: [`$${a}$이 $${a + k}$로 $${k}$ 커졌으므로 □는 $${b}$보다 $${k}$ 작아야 해요.`, `□ $=${b}-${k}=${b - k}$`],
            };
          }
          if (level === 2) {
            const a = r.int(3, 15),
              b = r.pick([4, 6, 8, 10, 12, 14, 16, 18, 20]);
            const typ = r.int(0, 1);
            if (typ === 0)
              return {
                q: `□ 안에 알맞은 수를 구하세요. $$${a}\\times${b}=${a * 2}\\times\\square$$`,
                answer: { type: 'num', value: b / 2 },
                steps: [`$${a}$이 $2$배가 되었으므로 □는 $${b}$의 반이어야 곱이 같아요.`, `□ $=${b / 2}$`],
              };
            const x = r.int(40, 90),
              y = r.int(10, 39),
              k = r.int(1, 9);
            return {
              q: `□ 안에 알맞은 수를 구하세요. $$${x}-${y}=${x + k}-\\square$$`,
              answer: { type: 'num', value: y + k },
              steps: [`빼지는 수가 $${k}$ 커졌으므로 빼는 수도 $${k}$ 커져야 차가 같아요.`, `□ $=${y}+${k}=${y + k}$`],
            };
          }
          const a = r.int(12, 40),
            b = r.int(12, 40),
            k = r.int(2, 9);
          const good = `$${a}+${b}=${a + k}+${b - k}$`;
          const y = r.int(k + 1, k + 9);
          const bads = [`$${a}+${b}=${a + k}+${b + k}$`, `$${a + 20}-${y}=${a + 20 + k}-${y - k}$`, `$${a}\\times4=${a * 2}\\times8$`, `$${a}+${b}=${a - k}+${b - k}$`, `$${a * 2}\\div2=${a}\\div4$`];
          return {
            q: '옳은 식을 고르세요.',
            answer: makeChoices(r, good, bads, 4),
            steps: [`$${a}+${b}=${a + b}$, $${a + k}+${b - k}=${a + b}$ → 같아요.`, `답: ${good}`],
          };
        },
      },
    ],
  },
};

