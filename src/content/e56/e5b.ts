// 초5-2 콘텐츠
import type { ContentMap } from '../../core/types';
import type { Rng } from '../../core/rng';
import { F } from '../../core/frac';
import { round } from '../../core/nt';
import { comma, makeChoices, numChoices } from '../../core/tex';
import { numberLine, regularPolygon, Svg } from '../../core/fig';
import { pickName, pickNames, nj, josa, reduceTex, fracAns, intAns, decAns, ft, mt, properFrac, dt, mkDec, p10, fj, fro } from './util';
import { cuboidFig, gridNetFig, multiShapeFig, rectNetFig, shapeFig, P } from './fig56';
import { WORD5 } from './words5';

// ───────────── 어림하기 ─────────────
type Mode = '올림' | '버림' | '반올림';
function roundBy(x: number, unit: number, mode: Mode): number {
  const q = x / unit;
  const v = mode === '올림' ? Math.ceil(round(q, 8)) : mode === '버림' ? Math.floor(round(q, 8)) : Math.floor(round(q, 8) + 0.5);
  return round(v * unit, 8);
}
const PLACE_NAME: Record<string, string> = { '1000': '천의', '100': '백의', '10': '십의', '1': '일의', '0.1': '소수 첫째', '0.01': '소수 둘째', '0.001': '소수 셋째' };
const placeTo = (u: number) => `${PLACE_NAME[String(u)]} 자리까지`;

// ───────────── 정육면체 전개도 접기 ─────────────
/** 칸(열,행)에 놓인 6개 정사각형을 접었을 때 각 칸의 실제 면 번호 (0↔1, 2↔3, 4↔5 가 마주 봄). 전개도가 아니면 null */
function foldCube(cells: P[]): number[] | null {
  type St = { B: number; T: number; N: number; S: number; E: number; W: number };
  const st: (St | null)[] = cells.map(() => null);
  st[0] = { B: 0, T: 1, N: 2, S: 3, E: 4, W: 5 };
  const queue = [0];
  while (queue.length) {
    const i = queue.shift()!;
    const s = st[i]!;
    cells.forEach((c, j) => {
      if (st[j]) return;
      const dx = c[0] - cells[i][0],
        dy = c[1] - cells[i][1];
      if (Math.abs(dx) + Math.abs(dy) !== 1) return;
      let n: St;
      if (dx === 1) n = { B: s.E, E: s.T, T: s.W, W: s.B, N: s.N, S: s.S };
      else if (dx === -1) n = { B: s.W, W: s.T, T: s.E, E: s.B, N: s.N, S: s.S };
      else if (dy === 1) n = { B: s.S, S: s.T, T: s.N, N: s.B, E: s.E, W: s.W };
      else n = { B: s.N, N: s.T, T: s.S, S: s.B, E: s.E, W: s.W };
      st[j] = n;
      queue.push(j);
    });
  }
  if (st.some((x) => !x)) return null;
  const b = st.map((x) => x!.B);
  return new Set(b).size === 6 ? b : null;
}
const opp = (f: number) => (f % 2 === 0 ? f + 1 : f - 1);
const NETS: P[][] = (() => {
  const out: P[][] = [];
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++)
      out.push([
        [i, 0],
        [0, 1],
        [1, 1],
        [2, 1],
        [3, 1],
        [j, 2],
      ]);
  for (let k = 1; k < 4; k++)
    out.push([
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
      [3, 1],
      [k, 2],
    ]);
  out.push([
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
    [2, 2],
    [3, 2],
  ]);
  out.push([
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
    [3, 1],
    [4, 1],
  ]);
  return out.filter((n) => foldCube(n));
})();

const FACE = ['가', '나', '다', '라', '마', '바'];

/** 평균이 avg (+extra/n) 인 자연수 n 개 (모두 1 이상, 편차 ≤ spread) */
function valuesWithMean(r: Rng, n: number, avg: number, spread: number, extra: number): number[] {
  for (;;) {
    const v: number[] = [];
    for (let i = 0; i < n - 1; i++) v.push(avg + r.int(-Math.min(spread, avg - 1), spread));
    const last = avg * n + extra - v.reduce((a, b) => a + b, 0);
    if (last >= 1 && Math.abs(last - avg) <= spread + extra) return [...v, last];
  }
}

export const content: ContentMap = {
  // ═════════════ 5-2-1 수의 범위와 어림하기 ═════════════
  'e5b-1': {
    concepts: [
      {
        title: '이상과 이하',
        body: '$5$, $6$, $7$, … 처럼 $5$ 와 **같거나 큰 수**를 $5$ **이상**인 수라고 해요.\n$5$ 와 **같거나 작은 수**를 $5$ **이하**인 수라고 해요.\n수직선에서는 $5$ 를 **●**(채운 점)으로 나타내요.',
      },
      {
        title: '초과와 미만',
        body: '$5$ 보다 **큰 수**를 $5$ **초과**인 수, $5$ 보다 **작은 수**를 $5$ **미만**인 수라고 해요. $5$ 는 들어가지 않아요.\n수직선에서는 $5$ 를 **○**(빈 점)으로 나타내요.',
        example: { q: '$3$ 초과 $7$ 이하인 자연수', a: '$4, 5, 6, 7$ (4개)' },
      },
      {
        title: '올림과 버림',
        body: '- **올림**: 구하려는 자리 아래 수를 **올려서** 나타내요. $213 \\to 220$ (십의 자리까지)\n- **버림**: 구하려는 자리 아래 수를 **버려서** 나타내요. $219 \\to 210$ (십의 자리까지)\n- 아래 자리가 모두 $0$ 이면 그대로예요.',
      },
      {
        title: '반올림',
        body: '구하려는 자리 **바로 아래 자리의 숫자**가 $0, 1, 2, 3, 4$ 이면 버리고, $5, 6, 7, 8, 9$ 이면 올려요.\n$$3{,}650 \\to 3{,}700 \\;(\\text{백의 자리까지})$$\n$$2.348 \\to 2.3 \\;(\\text{소수 첫째 자리까지})$$',
      },
      {
        title: '어림하기의 활용',
        body: '- 모자라면 안 될 때 → **올림** (예: 버스 대수, 상자 수)\n- 남는 것은 셀 수 없을 때 → **버림** (예: 동전으로 바꾸기, 팔 수 있는 상자 수)\n- 대략의 값 → **반올림** (예: 키, 인구)',
      },
    ],
    skills: [
      {
        id: 'range-count',
        title: '범위에 있는 자연수',
        gen(r, level) {
          const a = r.int(level === 1 ? 3 : 10, level === 1 ? 20 : 60);
          const b = a + r.int(level === 1 ? 4 : 8, level === 1 ? 12 : 30);
          const lo = r.pick(['이상', '초과'] as const),
            hi = r.pick(['이하', '미만'] as const);
          const first = lo === '이상' ? a : a + 1,
            last = hi === '이하' ? b : b - 1;
          if (level === 3) {
            const k = r.pick([2, 3, 4, 5]);
            const nums: number[] = [];
            for (let x = first; x <= last; x++) if (x % k === 0) nums.push(x);
            return {
              q: `$${a}$ ${lo} $${b}$ ${hi}인 자연수 중에서 $${k}$ 의 배수는 모두 몇 개인가요?`,
              answer: intAns(nums.length, '개'),
              steps: [`범위에 드는 수: $${first}$ 부터 $${last}$ 까지 (${lo === '이상' ? `$${a}$ 포함` : `$${a}$ 빠짐`}, ${hi === '이하' ? `$${b}$ 포함` : `$${b}$ 빠짐`})`, `그중 $${k}$ 의 배수: $${nums.length > 6 ? nums.slice(0, 3).join(', ') + ', \\ldots, ' + nums[nums.length - 1] : nums.join(', ')}$`, `$${nums.length}$ 개`],
            };
          }
          return {
            q: `$${a}$ ${lo} $${b}$ ${hi}인 자연수는 모두 몇 개인가요?`,
            answer: intAns(last - first + 1, '개'),
            steps: [`${lo === '이상' ? `$${a}$ 이상은 ${nj(a, '을/를')} 포함` : `$${a}$ 초과는 ${nj(a, '을/를')} 포함하지 않음`}, ${hi === '이하' ? `$${b}$ 이하는 $${b}$ 포함` : `$${b}$ 미만은 ${nj(b, '을/를')} 포함하지 않음`}`, `$${first}$ 부터 $${last}$ 까지: $${last} - ${first} + 1 = ${last - first + 1}$ (개)`],
            hint: '경계의 수가 들어가는지 먼저 확인하세요.',
          };
        },
      },
      {
        id: 'range-line',
        title: '수직선에 나타낸 범위',
        gen(r, level) {
          const a = r.int(level === 1 ? 2 : 10, level === 1 ? 6 : 40);
          const len = r.int(2, 5);
          const b = a + len;
          const loIn = r.chance(0.5),
            hiIn = r.chance(0.5);
          const one = level === 1 && r.chance(0.5);
          if (one) {
            const up = r.chance(0.5);
            const inc = r.chance(0.5);
            const fig = numberLine(a - 3, a + 4, { points: [{ x: a, open: !inc }], range: up ? { a, b: a + 4 } : { a: a - 3, b: a } });
            const right = `$${a}$ ${up ? (inc ? '이상' : '초과') : inc ? '이하' : '미만'}인 수`;
            const all = ['이상', '이하', '초과', '미만'].map((w) => `$${a}$ ${w}인 수`);
            return {
              q: '수직선에 나타낸 수의 범위를 바르게 읽은 것은?',
              fig,
              answer: makeChoices(r, right, all, 4),
              steps: [`점이 ${inc ? '●(채운 점)이므로 ' + nj(a, '을/를') + ' 포함' : '○(빈 점)이므로 ' + nj(a, '을/를') + ' 포함하지 않음'}`, `${up ? '오른쪽(큰 쪽)' : '왼쪽(작은 쪽)'}으로 뻗어 있으므로 ${right}`],
            };
          }
          const fig = numberLine(a - 2, b + 2, { points: [{ x: a, open: !loIn }, { x: b, open: !hiIn }], range: { a, b } });
          const desc = (li: boolean, hi: boolean) => `$${a}$ ${li ? '이상' : '초과'} $${b}$ ${hi ? '이하' : '미만'}인 수`;
          const right = desc(loIn, hiIn);
          const all = [desc(true, true), desc(true, false), desc(false, true), desc(false, false)];
          if (level === 3) {
            const nat: number[] = [];
            for (let x = loIn ? a : a + 1; x <= (hiIn ? b : b - 1); x++) nat.push(x);
            const s = nat.reduce((p, q) => p + q, 0);
            return {
              q: '수직선에 나타낸 수의 범위에 들어가는 자연수를 모두 더하면 얼마인가요?',
              fig,
              answer: intAns(s),
              steps: [`수직선의 범위: ${right}`, `들어가는 자연수: $${nat.join(', ')}$`, `합: $${s}$`],
            };
          }
          return {
            q: '수직선에 나타낸 수의 범위를 바르게 읽은 것은?',
            fig,
            answer: makeChoices(r, right, all, 4),
            steps: [`$${a}$: ${loIn ? '● → 이상' : '○ → 초과'}, $${b}$: ${hiIn ? '● → 이하' : '○ → 미만'}`, `따라서 ${right}`],
          };
        },
      },
      {
        id: 'round',
        title: '올림·버림·반올림',
        gen(r, level) {
          const mode = r.pick(['올림', '버림', '반올림'] as const);
          let x: number, u: number;
          if (level === 1) {
            u = r.pick([10, 100]);
            x = r.int(100, 999);
          } else if (level === 2) {
            u = r.pick([100, 1000]);
            x = r.int(1000, 99999);
          } else {
            u = r.pick([0.1, 0.01]);
            x = mkDec(r.int(1000, 99999), 3);
          }
          if (roundBy(x, u, '올림') === roundBy(x, u, '버림')) x = round(x + u / 3, 3);
          const ans = roundBy(x, u, mode);
          const wr = (['올림', '버림', '반올림'] as Mode[]).map((m) => roundBy(x, u, m)).concat([roundBy(x, u * 10, mode), roundBy(x, u / 10 >= 0.001 ? u / 10 : u, mode)]);
          const body = `${nj(x, '을/를')} ${mode}하여 ${placeTo(u)} 나타내세요.`;
          const steps = [
            mode === '반올림' ? `${PLACE_NAME[String(u / 10 >= 0.001 ? round(u / 10, 4) : u)]} 자리 숫자를 보고 $5$ 이상이면 올리고, $4$ 이하면 버려요.` : `${PLACE_NAME[String(u)]} 자리 아래 수를 ${mode === '올림' ? '올려요' : '버려요'}.`,
            `$${dt(x)} \\to ${dt(ans)}$`,
          ];
          if (level === 2) return { q: body.replace('나타내세요.', '나타낸 수는?'), answer: numChoices(r, ans, wr, 4, 'dec'), steps };
          return { q: body, answer: level === 3 ? decAns(ans) : intAns(ans), steps };
        },
      },
      {
        id: 'round-reverse',
        title: '어림한 수로 원래 수 찾기',
        gen(r, level) {
          const mode: Mode = level === 1 ? '반올림' : r.pick(['올림', '버림', '반올림'] as const);
          const u = level === 1 ? 10 : r.pick([10, 100]);
          const res = r.int(level === 1 ? 3 : 2, level === 1 ? 50 : 60) * u;
          const lo = mode === '올림' ? res - u + 1 : mode === '버림' ? res : res - u / 2;
          const hi = mode === '올림' ? res : mode === '버림' ? res + u - 1 : res + u / 2 - 1;
          if (level === 3) {
            return {
              q: `어떤 자연수를 ${mode}하여 ${placeTo(u)} 나타내었더니 ${nj(comma(res), '이/가')} 되었습니다. 어떤 수가 될 수 있는 가장 작은 수와 가장 큰 수를 구하세요.`,
              answer: {
                type: 'fields',
                fields: [
                  { label: '가장 작은 수', value: lo },
                  { label: '가장 큰 수', value: hi },
                ],
              },
              steps: [`${mode}하여 ${nj(comma(res), '이/가')} 되는 수의 범위: $${comma(lo)}$ 이상 $${comma(hi)}$ 이하`, `가장 작은 수 $${comma(lo)}$, 가장 큰 수 $${comma(hi)}$`],
            };
          }
          const big = r.chance(0.5);
          return {
            q: `어떤 자연수를 ${mode}하여 ${placeTo(u)} 나타내었더니 ${nj(comma(res), '이/가')} 되었습니다. 어떤 수가 될 수 있는 가장 ${big ? '큰' : '작은'} 수는 얼마인가요?`,
            answer: intAns(big ? hi : lo),
            steps: [`${mode}하여 ${nj(comma(res), '이/가')} 되는 수: $${comma(lo)}$ 이상 $${comma(hi)}$ 이하`, `가장 ${big ? '큰' : '작은'} 수: $${comma(big ? hi : lo)}$`],
          };
        },
      },
      {
        id: 'word',
        title: '어림하기 활용',
        gen(r, level) {
          const k = level === 1 ? r.int(0, 1) : level === 2 ? r.int(0, 3) : r.int(4, 5);
          if (k === 4) {
            const cap = r.pick([25, 30, 35, 40, 45]);
            const n = r.int(cap * 2 + 1, cap * 8);
            const price = r.pick([150000, 200000, 250000, 300000]);
            const buses = Math.ceil(n / cap);
            return {
              q: `학생 $${n}$ 명이 체험 학습을 가려고 합니다. 버스 한 대에 $${cap}$ 명까지 탈 수 있고, 버스 한 대를 빌리는 데 $${comma(price)}$ 원이 듭니다. 버스를 빌리는 데 드는 돈은 최소 얼마인가요?`,
              answer: intAns(buses * price, '원'),
              steps: [`$${n} \\div ${cap} = ${Math.floor(n / cap)} \\cdots ${n % cap}$ → 남은 학생도 타야 하므로 올림: $${buses}$ 대`, `$${comma(price)} \\times ${buses} = ${comma(buses * price)}$ (원)`],
            };
          }
          if (k === 5) {
            const per = r.pick([3, 4, 5, 6]);
            const price = r.pick([1000, 1500, 2000, 2500]);
            const n = r.int(per * 10 + 1, per * 60);
            const sets = Math.floor(n / per);
            return {
              q: `귤 $${n}$ 개를 한 봉지에 $${per}$ 개씩 담아 한 봉지에 $${comma(price)}$ 원씩 받고 팔려고 합니다. 귤을 팔아서 받을 수 있는 돈은 최대 얼마인가요?`,
              answer: intAns(sets * price, '원'),
              steps: [`$${n} \\div ${per} = ${sets} \\cdots ${n % per}$ → 봉지에 다 차지 않는 귤은 팔 수 없으므로 버림: $${sets}$ 봉지`, `$${comma(price)} \\times ${sets} = ${comma(sets * price)}$ (원)`],
            };
          }
          if (k === 0) {
            const cap = r.pick([10, 15, 20, 25, 30, 40, 45]);
            const n = r.int(cap + 1, cap * (level === 1 ? 4 : 9));
            const ans = Math.ceil(n / cap);
            return {
              q: `학생 $${n}$ 명이 한 번에 $${cap}$ 명까지 탈 수 있는 케이블카를 타려고 합니다. 모든 학생이 타려면 케이블카는 적어도 몇 번 운행해야 하나요?`,
              answer: intAns(ans, '번'),
              steps: [`$${n} \\div ${cap} = ${Math.floor(n / cap)} \\cdots ${n % cap}$`, n % cap ? `남은 $${n % cap}$ 명도 타야 하므로 **올림**: $${ans}$ 번` : `나누어떨어지므로 $${ans}$ 번`],
            };
          }
          if (k === 1) {
            const m = r.int(1000, level === 1 ? 9999 : 99999);
            const unit = level === 1 ? 1000 : r.pick([1000, 10000]);
            const cnt = Math.floor(m / unit);
            return {
              q: `동전으로 $${comma(m)}$ 원이 있습니다. 이 돈을 $${comma(unit)}$ 원짜리 지폐로 바꾸면 최대 몇 장까지 바꿀 수 있나요?`,
              answer: intAns(cnt, '장'),
              steps: [`$${comma(unit)}$ 원이 안 되는 돈은 지폐로 바꿀 수 없으므로 **버림**`, `$${comma(m)} \\to ${comma(cnt * unit)}$ 이므로 $${cnt}$ 장`],
            };
          }
          if (k === 2) {
            const per = r.pick([10, 12, 15, 20, 24, 30]);
            const n = r.int(per * 3, per * 30);
            const ans = Math.floor(n / per);
            return {
              q: `사과 $${n}$ 개를 한 상자에 $${per}$ 개씩 담아서 팔려고 합니다. 팔 수 있는 사과는 최대 몇 상자인가요?`,
              answer: intAns(ans, '상자'),
              steps: [`$${n} \\div ${per} = ${ans} \\cdots ${n % per}$`, `$${per}$ 개가 안 되는 나머지는 상자로 팔 수 없으므로 $${ans}$ 상자`],
            };
          }
          const nm = pickName(r);
          const h = mkDec(r.int(1300, 1599), 1);
          const ans = roundBy(h, 1, '반올림');
          return {
            q: `${nm}의 키는 $${dt(h)}$ cm 입니다. ${nm}의 키를 반올림하여 일의 자리까지 나타내면 몇 cm 인가요?`,
            answer: intAns(ans, 'cm'),
            steps: [`소수 첫째 자리 숫자가 $${Math.round((h * 10) % 10)}$ 이므로 ${Math.round((h * 10) % 10) >= 5 ? '올려요' : '버려요'}.`, `$${dt(h)} \\to ${ans}$ (cm)`],
          };
        },
      },
    ],
  },

  // ═════════════ 5-2-2 분수의 곱셈 ═════════════
  'e5b-2': {
    concepts: [
      {
        title: '(분수) × (자연수)',
        body: '분자와 자연수를 곱해요. 곱하기 전이나 후에 약분할 수 있어요.\n$$\\frac{3}{8} \\times 4 = \\frac{3 \\times 4}{8} = \\frac{12}{8} = 1\\frac{1}{2}$$\n대분수는 가분수로 바꾸거나, 자연수 부분과 분수 부분에 각각 곱해요.',
      },
      {
        title: '(자연수) × (분수)',
        body: '자연수와 분자를 곱해요. "$12$ 의 $\\frac{3}{4}$" 은 $12 \\times \\frac{3}{4} = 9$ 예요.\n- 진분수를 곱하면 원래 수보다 **작아지고**, $1$ 보다 큰 분수를 곱하면 **커져요**.',
      },
      {
        title: '(분수) × (분수)',
        body: '분자는 분자끼리, 분모는 분모끼리 곱해요.\n$$\\frac{2}{3} \\times \\frac{5}{7} = \\frac{2 \\times 5}{3 \\times 7} = \\frac{10}{21}$$\n- 단위분수끼리: $\\frac{1}{3} \\times \\frac{1}{4} = \\frac{1}{12}$\n- 약분할 수 있으면 먼저 약분하면 계산이 쉬워요.',
      },
      {
        title: '대분수의 곱셈',
        body: '대분수는 **가분수로 바꾼 뒤** 곱해요.\n$$1\\frac{1}{2} \\times 2\\frac{2}{3} = \\frac{3}{2} \\times \\frac{8}{3} = 4$$\n세 분수의 곱셈도 앞에서부터 차례로, 또는 한꺼번에 곱해요.',
      },
    ],
    skills: [
      {
        id: 'frac-x-nat',
        title: '(분수) × (자연수)',
        gen(r, level) {
          const f = properFrac(r, 2, level === 1 ? 9 : 15);
          const k = r.int(2, level === 1 ? 6 : 12);
          const base = level === 3 ? f.add(r.int(1, 4)) : f;
          const res = base.mul(k);
          if (level === 3) {
            return {
              q: `계산하세요.\n$$${mt(base)} \\times ${k}$$`,
              answer: fracAns(res),
              steps: [`가분수로: $${mt(base)} = ${ft(base)}$`, `$${ft(base)} \\times ${k} = \\frac{${base.n} \\times ${k}}{${base.d}} = ${mt(res)}$`],
            };
          }
          return {
            q: `계산하세요.\n$$${ft(f)} \\times ${k}$$`,
            answer: fracAns(res),
            steps: [`$${ft(f)} \\times ${k} = \\frac{${f.n} \\times ${k}}{${f.d}} = \\frac{${f.n * k}}{${f.d}}$`, `$= ${mt(res)}$`],
          };
        },
      },
      {
        id: 'nat-x-frac',
        title: '(자연수) × (분수)',
        gen(r, level) {
          const f = properFrac(r, 2, level === 1 ? 9 : 12);
          const k = level === 1 ? f.d * r.int(1, 5) : r.int(2, 30);
          const base = level === 3 ? f.add(r.int(1, 3)) : f;
          const res = base.mul(k);
          if (level === 1) {
            return {
              q: `$${k}$ 의 ${fj(f, '은/는', false)} 얼마인가요?`,
              answer: fracAns(res),
              steps: [`$${k} \\times ${ft(f)} = \\frac{${k} \\times ${f.n}}{${f.d}}$`, `$= ${mt(res)}$`],
            };
          }
          return {
            q: `계산하세요.\n$$${k} \\times ${mt(base)}$$`,
            answer: fracAns(res),
            steps: [level === 3 ? `$${mt(base)} = ${ft(base)}$` : `분모 ${nj(f.d, '과/와')} ${nj(k, '을/를')} 약분할 수 있으면 먼저 약분해요.`, `$${k} \\times ${ft(base)} = \\frac{${k * base.n}}{${base.d}} = ${mt(res)}$`],
          };
        },
      },
      {
        id: 'frac-x-frac',
        title: '(분수) × (분수)',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(2, 9),
              b = r.int(2, 9);
            const unitF = r.chance(0.5);
            const fa = unitF ? new F(1, a) : properFrac(r, 2, 9);
            const fb = unitF ? new F(1, b) : properFrac(r, 2, 9);
            const res = fa.mul(fb);
            return {
              q: `계산하세요.\n$$${ft(fa)} \\times ${ft(fb)}$$`,
              answer: fracAns(res),
              steps: [`분자끼리, 분모끼리 곱해요.`, `$\\frac{${fa.n} \\times ${fb.n}}{${fa.d} \\times ${fb.d}} = ${reduceTex(fa.n * fb.n, fa.d * fb.d, false)}$`],
            };
          }
          const fa = properFrac(r, 2, 15);
          let fb = properFrac(r, 2, 15);
          const res = fa.mul(fb);
          if (level === 3) {
            return {
              q: `다음 중 계산 결과가 $${ft(res)}$ 인 것은?`,
              answer: makeChoices(
                r,
                `$${ft(fa)} \\times ${ft(fb)}$`,
                [`$${ft(fa)} \\times ${ft(new F(fb.n + 1, fb.d))}$`, `$${ft(new F(fa.n + 1, fa.d))} \\times ${ft(fb)}$`, `$${ft(fa)} + ${ft(fb)}$`, `$${ft(fa)} \\times ${ft(fb.inv())}$`],
                4,
              ),
              steps: [`$${ft(fa)} \\times ${ft(fb)} = ${reduceTex(fa.n * fb.n, fa.d * fb.d, false)}$`, '나머지 보기는 계산 결과가 달라요.'],
            };
          }
          return {
            q: `계산하세요.\n$$${ft(fa)} \\times ${ft(fb)}$$`,
            answer: fracAns(res),
            steps: [`분자끼리, 분모끼리 곱해요.`, `$\\frac{${fa.n} \\times ${fb.n}}{${fa.d} \\times ${fb.d}} = ${reduceTex(fa.n * fb.n, fa.d * fb.d, false)}$`],
            hint: '곱하기 전에 분자와 분모를 약분하면 계산이 쉬워요.',
          };
        },
      },
      {
        id: 'mixed-x',
        title: '대분수의 곱셈',
        gen(r, level) {
          const a = properFrac(r, 2, 6).add(r.int(1, 3));
          const b = level === 1 ? new F(r.int(2, 6)) : level === 2 ? properFrac(r, 2, 9) : properFrac(r, 2, 6).add(r.int(1, 3));
          const res = a.mul(b);
          return {
            q: `계산하세요.\n$$${mt(a)} \\times ${mt(b)}$$`,
            answer: fracAns(res),
            steps: [`대분수를 가분수로: $${mt(a)} = ${ft(a)}$${b.d > 1 && b.n > b.d ? `, $${mt(b)} = ${ft(b)}$` : ''}`, `$${ft(a)} \\times ${ft(b)} = \\frac{${a.n * b.n}}{${a.d * b.d}}$`, `$= ${mt(res)}$`],
            hint: '대분수를 먼저 가분수로 바꾸세요.',
          };
        },
      },
      {
        id: 'three',
        title: '세 분수의 곱셈',
        gen(r, level) {
          const fs = [properFrac(r, 2, 9), properFrac(r, 2, 9), level === 1 ? new F(1, r.int(2, 6)) : properFrac(r, 2, 9)];
          if (level === 3) fs[0] = fs[0].add(r.int(1, 2));
          const res = fs[0].mul(fs[1]).mul(fs[2]);
          return {
            q: `계산하세요.\n$$${fs.map(mt).join(' \\times ')}$$`,
            answer: fracAns(res),
            steps: [`${level === 3 ? `$${mt(fs[0])} = ${ft(fs[0])}$ 로 바꾸고, ` : ''}분자끼리, 분모끼리 한꺼번에 곱해요.`, `$\\frac{${fs.map((f) => f.n).join(' \\times ')}}{${fs.map((f) => f.d).join(' \\times ')}} = \\frac{${fs.reduce((p, f) => p * f.n, 1)}}{${fs.reduce((p, f) => p * f.d, 1)}}$`, `$= ${mt(res)}$`],
          };
        },
      },
      {
        id: 'word',
        title: '분수의 곱셈 문장제',
        gen(r, level) {
          const nm = pickName(r);
          const k = level === 1 ? r.int(0, 1) : level === 2 ? r.pick([1, 3]) : r.pick([2, 4]);
          if (k === 4) {
            const a = properFrac(r, 2, 5),
              b = properFrac(r, 2, 6);
            const rest1 = new F(1).sub(a),
              rest2 = new F(1).sub(b);
            const unit = a.d * b.d;
            const money = unit * r.int(1, 4) * (unit < 20 ? 1000 : 100);
            const left = rest1.mul(rest2).mul(money);
            return {
              q: `${josa(nm, '은/는')} 용돈 $${comma(money)}$ 원 중에서 ${fro(a, false)} 책을 사고, 남은 돈의 ${fro(b, false)} 학용품을 샀습니다. 남은 돈은 얼마인가요?`,
              answer: intAns(left.value, '원'),
              steps: [`책을 사고 남은 돈: 전체의 $1 - ${ft(a)} = ${ft(rest1)}$`, `학용품을 사고 남은 돈: 전체의 $${ft(rest1)} \\times ${ft(rest2)} = ${ft(rest1.mul(rest2))}$`, `$${comma(money)} \\times ${ft(rest1.mul(rest2))} = ${comma(left.value)}$ (원)`],
            };
          }
          if (k === 0) {
            const f = properFrac(r, 2, 8);
            const total = f.d * r.int(2, 8);
            const res = f.mul(total);
            return {
              q: `${nm}네 반 학생은 $${total}$ 명입니다. 그중 ${fj(f, '이/가', false)} 안경을 썼다면 안경을 쓴 학생은 몇 명인가요?`,
              answer: intAns(res.value, '명'),
              steps: [`$${total} \\times ${ft(f)} = ${res.value}$ (명)`],
            };
          }
          if (k === 1) {
            const f = level === 1 ? properFrac(r, 2, 9) : properFrac(r, 2, 9).add(r.int(1, 3));
            const n = r.int(2, 9);
            const res = f.mul(n);
            return {
              q: `한 병에 $${mt(f)}$ L 씩 들어 있는 주스가 $${n}$ 병 있습니다. 주스는 모두 몇 L 인가요?`,
              answer: fracAns(res, { unit: 'L' }),
              steps: [`$${mt(f)} \\times ${n}$${f.n > f.d ? ` $= ${ft(f)} \\times ${n}$` : ''}`, `$= ${mt(res)}$ (L)`],
            };
          }
          if (k === 2) {
            const a = properFrac(r, 2, 6),
              b = properFrac(r, 2, 8);
            const res = a.mul(b);
            return {
              q: `${nm}네 밭의 $${ft(a)}$ 에는 채소를 심었고, 채소를 심은 부분의 $${ft(b)}$ 에는 배추를 심었습니다. 배추를 심은 부분은 밭 전체의 몇 분의 몇인가요?`,
              answer: fracAns(res, { mixed: false }),
              steps: [`전체의 $${ft(a)}$ 의 $${ft(b)}$ $\\to$ $${ft(a)} \\times ${ft(b)}$`, `$= ${ft(res)}$`],
            };
          }
          const sp = properFrac(r, 2, 5).add(r.int(2, 6));
          const t = r.pick([new F(1, 2), new F(1, 3), new F(3, 4), new F(2, 3), new F(3, 2), new F(5, 4)]);
          const res = sp.mul(t);
          return {
            q: `한 시간에 $${mt(sp)}$ km 를 걷는 사람이 같은 빠르기로 $${mt(t)}$ 시간 동안 걸으면 몇 km 를 걷게 되나요?`,
            answer: fracAns(res, { unit: 'km' }),
            steps: [`$${mt(sp)} \\times ${mt(t)} = ${ft(sp)} \\times ${ft(t)}$`, `$= ${mt(res)}$ (km)`],
          };
        },
      },
    ],
  },

  // ═════════════ 5-2-3 합동과 대칭 ═════════════
  'e5b-3': {
    concepts: [
      {
        title: '합동인 도형',
        body: '모양과 크기가 같아서 **포개었을 때 완전히 겹치는** 두 도형을 서로 합동이라고 해요.\n겹치는 점을 **대응점**, 겹치는 변을 **대응변**, 겹치는 각을 **대응각**이라고 해요.',
      },
      {
        title: '합동인 도형의 성질',
        body: '- 각각의 대응변의 길이가 서로 같아요.\n- 각각의 대응각의 크기가 서로 같아요.\n삼각형 세 각의 합은 $180°$, 사각형 네 각의 합은 $360°$ 라는 것(4학년)과 함께 자주 쓰여요.',
      },
      {
        title: '선대칭도형',
        body: '한 직선을 따라 접었을 때 완전히 겹치는 도형을 선대칭도형, 그 직선을 **대칭축**이라고 해요.\n- 대응변의 길이와 대응각의 크기가 같아요.\n- 대응점을 이은 선분은 대칭축과 **수직**으로 만나고, 대칭축이 그 선분을 **둘로 똑같이** 나눠요.\n- 정$n$각형의 대칭축은 $n$ 개예요.',
      },
      {
        title: '점대칭도형',
        body: '한 점을 중심으로 $180°$ 돌렸을 때 처음 도형과 완전히 겹치는 도형을 점대칭도형, 그 점을 **대칭의 중심**이라고 해요.\n- 대응변의 길이와 대응각의 크기가 같아요.\n- 대칭의 중심은 대응점을 이은 선분을 **둘로 똑같이** 나눠요.\n- 평행사변형, 마름모, 직사각형, 정사각형, 정육각형은 점대칭도형이에요.',
      },
    ],
    skills: [
      {
        id: 'cong-side',
        title: '합동인 도형의 변의 길이',
        gen(r, level) {
          let a = 0,
            b = 0,
            c = 0;
          for (;;) {
            a = r.int(4, 13);
            b = r.int(4, 13);
            c = r.int(5, 14);
            if (a + b > c + 2 && a + c > b + 2 && b + c > a + 2 && new Set([a, b, c]).size === 3) break;
          }
          // ㄱ(0,0) ㄴ(c,0) ㄷ ; ㄱㄴ=c, ㄴㄷ=a, ㄷㄱ=b
          const x = (b * b + c * c - a * a) / (2 * c),
            y = Math.sqrt(b * b - x * x);
          const T1: P[] = [
            [0, 0],
            [c, 0],
            [x, y],
          ];
          const off = c + Math.max(c, x) * 0.4 + 4;
          // 180° 돌린 합동 삼각형 (ㄹ↔ㄱ, ㅁ↔ㄴ, ㅂ↔ㄷ)
          const T2: P[] = T1.map(([px, py]) => [off + c - px, y - py] as P);
          const which = r.int(0, 2);
          const names2 = ['변 ㄹㅁ', '변 ㅁㅂ', '변 ㅂㄹ'];
          const vals = [c, a, b];
          if (level === 3) {
            const P0 = a + b + c;
            return {
              q: `삼각형 ㄱㄴㄷ과 삼각형 ㄹㅁㅂ은 서로 합동입니다. 삼각형 ㄱㄴㄷ의 둘레가 $${P0}$ cm 일 때, 변 ㄹㅂ은 몇 cm 인가요?`,
              fig: multiShapeFig([
                { pts: T1, verts: ['ㄱ', 'ㄴ', 'ㄷ'], sides: [`${c} cm`] },
                { pts: T2, verts: ['ㄹ', 'ㅁ', 'ㅂ'], sides: [null, `${a} cm`] },
              ]),
              answer: intAns(b, 'cm'),
              steps: [`변 ㅁㅂ의 대응변은 변 ㄴㄷ 이므로 변 ㄴㄷ $= ${a}$ cm`, `변 ㄷㄱ $= ${P0} - ${c} - ${a} = ${b}$ (cm)`, `변 ㄹㅂ은 변 ㄱㄷ의 대응변이므로 $${b}$ cm`],
            };
          }
          if (level === 2) {
            return {
              q: '삼각형 ㄱㄴㄷ과 삼각형 ㄹㅁㅂ은 서로 합동입니다. 삼각형 ㄹㅁㅂ의 둘레는 몇 cm 인가요?',
              fig: multiShapeFig([
                { pts: T1, verts: ['ㄱ', 'ㄴ', 'ㄷ'], sides: [`${c} cm`, `${a} cm`] },
                { pts: T2, verts: ['ㄹ', 'ㅁ', 'ㅂ'], sides: [null, null, `${b} cm`] },
              ]),
              answer: intAns(a + b + c, 'cm'),
              steps: [`대응변의 길이가 같으므로 변 ㄹㅁ $= ${c}$ cm, 변 ㅁㅂ $= ${a}$ cm`, `둘레: $${c} + ${a} + ${b} = ${a + b + c}$ (cm)`],
            };
          }
          return {
            q: `삼각형 ㄱㄴㄷ과 삼각형 ㄹㅁㅂ은 서로 합동입니다. ${names2[which]}은 몇 cm 인가요?`,
            fig: multiShapeFig([
              { pts: T1, verts: ['ㄱ', 'ㄴ', 'ㄷ'], sides: [`${c} cm`, `${a} cm`, `${b} cm`] },
              { pts: T2, verts: ['ㄹ', 'ㅁ', 'ㅂ'] },
            ]),
            answer: intAns(vals[which], 'cm'),
            steps: [`${names2[which]}의 대응변은 ${['변 ㄱㄴ', '변 ㄴㄷ', '변 ㄷㄱ'][which]}이에요.`, `대응변의 길이는 같으므로 $${vals[which]}$ cm`],
          };
        },
      },
      {
        id: 'cong-angle',
        title: '합동인 도형의 각의 크기',
        gen(r, level) {
          const A = r.int(5, 10) * 5 + (level === 3 ? r.int(1, 4) : 0),
            B = r.int(6, 13) * 5;
          const C = 180 - A - B;
          const toR = (d: number) => (d * Math.PI) / 180;
          // ㄱ(0,0) ㄴ(1,0), ㄱ의 각 A, ㄴ의 각 B
          const t = Math.sin(toR(B)) / Math.sin(toR(C));
          const T1: P[] = [
            [0, 0],
            [1, 0],
            [t * Math.cos(toR(A)), t * Math.sin(toR(A))],
          ];
          const off = 1.6;
          const T2: P[] = T1.map(([x, y]) => [off + x, y] as P);
          if (level === 1) {
            return {
              q: '삼각형 ㄱㄴㄷ과 삼각형 ㄹㅁㅂ은 서로 합동입니다. 각 ㄹㅁㅂ은 몇 도인가요?',
              fig: multiShapeFig([
                { pts: T1, verts: ['ㄱ', 'ㄴ', 'ㄷ'], angles: [{ i: 0, text: `${A}°` }, { i: 1, text: `${B}°` }] },
                { pts: T2, verts: ['ㄹ', 'ㅁ', 'ㅂ'] },
              ]),
              answer: intAns(B, '°'),
              steps: ['각 ㄹㅁㅂ의 대응각은 각 ㄱㄴㄷ 이에요.', `대응각의 크기는 같으므로 $${B}°$`],
            };
          }
          return {
            q: '삼각형 ㄱㄴㄷ과 삼각형 ㄹㅁㅂ은 서로 합동입니다. 각 ㄹㅂㅁ은 몇 도인가요?',
            fig: multiShapeFig([
              { pts: T1, verts: ['ㄱ', 'ㄴ', 'ㄷ'], angles: [{ i: 0, text: `${A}°` }] },
              { pts: T2, verts: ['ㄹ', 'ㅁ', 'ㅂ'], angles: [{ i: 1, text: `${B}°` }] },
            ]),
            answer: intAns(C, '°'),
            steps: [`각 ㄱㄴㄷ $=$ 각 ㄹㅁㅂ $= ${B}°$, 각 ㄹ $=$ 각 ㄱ $= ${A}°$`, `삼각형의 세 각의 합은 $180°$`, `각 ㄹㅂㅁ $= 180° - ${A}° - ${B}° = ${C}°$`],
          };
        },
      },
      {
        id: 'line-sym',
        title: '선대칭도형의 성질',
        gen(r, level) {
          if (level === 3) {
            // 연 모양: 위 각 α, 아래 각 γ → 옆 각 β
            const al = r.int(25, 50) * 2,
              ga = r.int(50, 80) * 2;
            const be = (360 - al - ga) / 2;
            const T = 1 / Math.tan(((al / 2) * Math.PI) / 180),
              Bt = 1 / Math.tan(((ga / 2) * Math.PI) / 180);
            const pts: P[] = [
              [0, T],
              [1, 0],
              [0, -Bt],
              [-1, 0],
            ];
            return {
              q: '직선 ㄱㄷ 을 대칭축으로 하는 선대칭도형입니다. 각 ㄱㄷㄹ 은 몇 도인가요?',
              fig: shapeFig(pts, { verts: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'], angles: [{ i: 0, text: `${al}°` }, { i: 1, text: `${be}°` }], extraLines: [{ a: [0, T + 0.3], b: [0, -Bt - 0.3], dash: true, cls: 'acc2' }], W: 220, H: 200 }),
              answer: intAns(ga / 2, '°'),
              steps: [`대응각이 같으므로 각 ㄱㄹㄷ $=$ 각 ㄱㄴㄷ $= ${be}°$`, `사각형의 네 각의 합 $360°$: 각 ㄴㄷㄹ $= 360° - ${al}° - ${be}° - ${be}° = ${ga}°$`, `대칭축이 각 ㄴㄷㄹ 을 반으로 나누므로 각 ㄱㄷㄹ $= ${ga}° \\div 2 = ${ga / 2}°$`],
            };
          }
          const a = r.int(5, 15),
            b = r.int(5, 18);
          const x = Math.min(a, b) * 0.65;
          const t = Math.sqrt(a * a - x * x),
            u = Math.sqrt(b * b - x * x);
          const pts: P[] = [
            [0, t],
            [x, 0],
            [0, -u],
            [-x, 0],
          ];
          const axis = { a: [0, t + 1.5] as P, b: [0, -u - 1.5] as P, dash: true, cls: 'acc2' };
          if (level === 1) {
            return {
              q: '직선 ㄱㄷ 을 대칭축으로 하는 선대칭도형입니다. 이 도형의 둘레는 몇 cm 인가요?',
              fig: shapeFig(pts, { verts: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'], sides: [`${a} cm`, `${b} cm`], extraLines: [axis], W: 220, H: 200 }),
              answer: intAns(2 * (a + b), 'cm'),
              steps: [`대응변의 길이가 같으므로 변 ㄱㄹ $= ${a}$ cm, 변 ㄷㄹ $= ${b}$ cm`, `둘레: $(${a} + ${b}) \\times 2 = ${2 * (a + b)}$ (cm)`],
            };
          }
          return {
            q: `직선 ㄱㄷ 을 대칭축으로 하는 선대칭도형입니다. 도형의 둘레가 $${2 * (a + b)}$ cm 일 때, 변 ㄷㄹ 은 몇 cm 인가요?`,
            fig: shapeFig(pts, { verts: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'], sides: [null, null, null, `${a} cm`], extraLines: [axis], W: 220, H: 200 }),
            answer: intAns(b, 'cm'),
            steps: [`변 ㄱㄴ $=$ 변 ㄱㄹ $= ${a}$ cm, 변 ㄴㄷ $=$ 변 ㄷㄹ`, `변 ㄷㄹ $\\times 2 = ${2 * (a + b)} - ${a} \\times 2 = ${2 * b}$`, `변 ㄷㄹ $= ${b}$ cm`],
          };
        },
      },
      {
        id: 'point-sym',
        title: '점대칭도형의 성질',
        gen(r, level) {
          if (level === 3) {
            const a = r.int(4, 12),
              k = r.int(1, 3),
              m = r.int(1, 2);
            const v1: P = [a, 0],
              v2: P = [3 * k, 4 * k],
              v3: P = [-4 * m, 3 * m];
            const p0: P = [0, 0];
            const p1: P = [v1[0], 0];
            const p2: P = [p1[0] + v2[0], v2[1]];
            const p3: P = [p2[0] + v3[0], p2[1] + v3[1]];
            const p4: P = [p3[0] - v1[0], p3[1]];
            const p5: P = [p4[0] - v2[0], p4[1] - v2[1]];
            const ctr: P = [p3[0] / 2, p3[1] / 2];
            const per = 2 * (a + 5 * k + 5 * m);
            return {
              q: '점 ㅇ을 대칭의 중심으로 하는 점대칭도형입니다. 이 도형의 둘레는 몇 cm 인가요?',
              fig: shapeFig([p0, p1, p2, p3, p4, p5], { sides: [`${a} cm`, `${5 * k} cm`, `${5 * m} cm`], dots: [{ p: ctr, label: 'ㅇ' }], W: 240, H: 190 }),
              answer: intAns(per, 'cm'),
              steps: ['점대칭도형에서 대응변의 길이는 같아요.', `둘레: $(${a} + ${5 * k} + ${5 * m}) \\times 2 = ${per}$ (cm)`],
            };
          }
          const b = r.int(6, 14),
            h = r.int(4, 9),
            cSide = r.int(h + 1, h + 2),
            s0 = Math.sqrt(cSide * cSide - h * h);
          const pts: P[] = [
            [s0, h],
            [s0 + b, h],
            [b, 0],
            [0, 0],
          ];
          const O: P = [(s0 + b) / 2, h / 2];
          if (level === 1) {
            const p = r.int(3, 12);
            return {
              q: `평행사변형 ㄱㄴㄷㄹ은 점 ㅇ을 대칭의 중심으로 하는 점대칭도형입니다. 선분 ㄱㅇ 이 $${p}$ cm 일 때 선분 ㄱㄷ 은 몇 cm 인가요?`,
              fig: shapeFig(pts, {
                verts: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'],
                extraLines: [
                  { a: pts[0], b: pts[2], dash: true },
                  { a: pts[1], b: pts[3], dash: true },
                ],
                dots: [{ p: O, label: 'ㅇ' }],
              }),
              answer: intAns(2 * p, 'cm'),
              steps: ['대칭의 중심은 대응점을 이은 선분을 둘로 똑같이 나눠요.', `선분 ㄱㄷ $= ${p} \\times 2 = ${2 * p}$ (cm)`],
            };
          }
          const ang = r.int(11, 16) * 5;
          return r.chance(0.5)
            ? {
                q: '점 ㅇ을 대칭의 중심으로 하는 점대칭도형 ㄱㄴㄷㄹ의 둘레는 몇 cm 인가요?',
                fig: shapeFig(pts, { verts: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'], sides: [`${b} cm`, `${cSide} cm`], dots: [{ p: O, label: 'ㅇ' }] }),
                answer: intAns(2 * (b + cSide), 'cm'),
                steps: ['대응변: 변 ㄱㄴ ↔ 변 ㄷㄹ, 변 ㄴㄷ ↔ 변 ㄹㄱ', `둘레: $(${b} + ${cSide}) \\times 2 = ${2 * (b + cSide)}$ (cm)`],
              }
            : {
                q: `점 ㅇ을 대칭의 중심으로 하는 점대칭도형 ㄱㄴㄷㄹ에서 각 ㄹㄱㄴ 이 $${ang}°$ 일 때, 각 ㄱㄴㄷ 은 몇 도인가요?`,
                fig: shapeFig(pts, { verts: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'], angles: [{ i: 0, text: `${ang}°` }], dots: [{ p: O, label: 'ㅇ' }] }),
                answer: intAns(180 - ang, '°'),
                steps: [`대응각: 각 ㄴㄷㄹ $=$ 각 ㄹㄱㄴ $= ${ang}°$, 각 ㄷㄹㄱ $=$ 각 ㄱㄴㄷ`, `네 각의 합 $360°$: 각 ㄱㄴㄷ $\\times 2 = 360° - ${ang}° \\times 2 = ${360 - 2 * ang}°$`, `각 ㄱㄴㄷ $= ${180 - ang}°$`],
              };
        },
      },
      {
        id: 'sym-kind',
        title: '선대칭·점대칭 도형 찾기',
        gen(r, level) {
          const LINE_ONLY = ['정삼각형', '이등변삼각형', '정오각형', '등변사다리꼴', '연 모양 사각형'];
          const POINT_ONLY = ['평행사변형'];
          const BOTH = ['직사각형', '정사각형', '마름모', '정육각형'];
          const NONE = ['일반 사다리꼴', '세 변의 길이가 다른 삼각형'];
          if (level === 1) {
            const n = r.int(3, 10);
            const nm = ['', '', '', '정삼각형', '정사각형', '정오각형', '정육각형', '정칠각형', '정팔각형', '정구각형', '정십각형'][n];
            const s = new Svg(160, 150);
            s.poly(regularPolygon(n, 80, 75, 60), { cls: 'acc', fill: true });
            return {
              q: `${nm}의 대칭축은 모두 몇 개인가요?`,
              fig: s.toString(),
              answer: intAns(n, '개'),
              steps: [`정$n$각형의 대칭축은 $n$ 개예요.`, `${nm}: $${n}$ 개`],
            };
          }
          const kind = r.int(0, level === 2 ? 1 : 3);
          if (kind === 0) {
            const right = r.pick([...POINT_ONLY, ...BOTH]);
            return {
              q: '다음 중 **점대칭도형**인 것은?',
              answer: makeChoices(r, right, r.sample([...LINE_ONLY, ...NONE], 4), 5),
              steps: [`${josa(right, '은/는')} 한 점을 중심으로 $180°$ 돌리면 처음 도형과 겹쳐요.`, '정삼각형, 정오각형, 이등변삼각형, 등변사다리꼴은 선대칭도형이지만 점대칭도형은 아니에요.'],
            };
          }
          if (kind === 1) {
            const right = r.pick([...POINT_ONLY, ...NONE]);
            return {
              q: '다음 중 **선대칭도형이 아닌** 것은?',
              answer: makeChoices(r, right, r.sample([...LINE_ONLY, ...BOTH], 4), 5),
              steps: [`${josa(right, '은/는')} 어떤 직선으로 접어도 완전히 겹치지 않아요.`, '평행사변형은 점대칭도형이지만 선대칭도형은 아니에요.'],
            };
          }
          if (kind === 2) {
            const right = r.pick(BOTH);
            return {
              q: '다음 중 선대칭도형이면서 점대칭도형인 것은?',
              answer: makeChoices(r, right, [...LINE_ONLY, ...POINT_ONLY].slice(0), 5),
              steps: [`${josa(right, '은/는')} 대칭축이 있고, $180°$ 돌려도 겹쳐요.`],
            };
          }
          const items: [string, number][] = [
            ['직사각형', 2],
            ['마름모', 2],
            ['정사각형', 4],
            ['정육각형', 6],
            ['정삼각형', 3],
            ['이등변삼각형', 1],
            ['등변사다리꼴', 1],
            ['정오각형', 5],
          ];
          const [x, y] = r.sample(items, 2);
          return {
            q: `${x[0]}의 대칭축의 수와 ${y[0]}의 대칭축의 수의 합은 몇 개인가요?`,
            answer: intAns(x[1] + y[1], '개'),
            steps: [`${x[0]}: $${x[1]}$ 개, ${y[0]}: $${y[1]}$ 개`, `$${x[1]} + ${y[1]} = ${x[1] + y[1]}$ (개)`],
          };
        },
      },
    ],
  },

  // ═════════════ 5-2-4 소수의 곱셈 ═════════════
  'e5b-4': {
    concepts: [
      {
        title: '(소수) × (자연수)',
        body: '$0.3 \\times 4$ 는 $0.1$ 이 $3 \\times 4 = 12$ 개이므로 $1.2$ 예요.\n자연수의 곱셈처럼 계산한 다음, **곱해지는 수의 소수점 위치에 맞추어** 소수점을 찍어요.\n$$2.45 \\times 6 = 14.7 \\quad (245 \\times 6 = 1470)$$',
      },
      {
        title: '(자연수) × (소수)',
        body: '$6 \\times 0.7$ 은 $6$ 의 $\\frac{7}{10}$ 이므로 $\\frac{42}{10} = 4.2$ 예요.\n1보다 작은 소수를 곱하면 처음 수보다 작아져요.',
      },
      {
        title: '(소수) × (소수)',
        body: '자연수처럼 곱한 뒤, **두 수의 소수점 아래 자릿수를 더한 만큼** 소수점을 왼쪽으로 옮겨요.\n$$1.2 \\times 0.35 = 0.42 \\quad (12 \\times 35 = 420, \\text{소수 세 자리} \\to 0.420)$$',
        example: { q: '$0.6 \\times 0.8$', a: '$6 \\times 8 = 48$, 소수 두 자리 → $0.48$' },
      },
      {
        title: '곱의 소수점 위치',
        body: '- $10, 100, 1000$ 을 곱하면 소수점이 **오른쪽으로** $1, 2, 3$ 칸 옮겨져요: $3.25 \\times 100 = 325$\n- $0.1, 0.01, 0.001$ 을 곱하면 소수점이 **왼쪽으로** 옮겨져요: $325 \\times 0.01 = 3.25$',
      },
    ],
    skills: [
      {
        id: 'dec-x-nat',
        title: '(소수) × (자연수)',
        gen(r, level) {
          const k = level === 1 ? 1 : level === 2 ? r.int(1, 2) : 2;
          let m = level === 1 ? r.int(1, 9) : level === 2 ? r.int(11, 99) : r.int(101, 999);
          if (m % 10 === 0) m += 1; // 끝자리가 0 이면 소수 자릿수가 줄어 (4.50 → 4.5) 풀이와 어긋남
          const n = level === 3 ? r.int(11, 40) : r.int(2, 9);
          const a = mkDec(m, k);
          const prod = mkDec(m * n, k);
          return {
            q: `계산하세요.\n$$${dt(a)} \\times ${n}$$`,
            answer: decAns(prod),
            steps: [`자연수처럼 곱하기: $${m} \\times ${n} = ${m * n}$`, `${nj(dt(a), '은/는')} 소수 ${k === 1 ? '한' : '두'} 자리이므로 $${dt(prod)}$`],
          };
        },
      },
      {
        id: 'nat-x-dec',
        title: '(자연수) × (소수)',
        gen(r, level) {
          const k = level === 1 ? 1 : r.int(1, 2);
          let m = level === 1 ? r.int(1, 9) : level === 2 ? r.int(2, 99) : r.int(101, 499);
          if (m % 10 === 0) m += 1; // 49.0 처럼 자연수가 되지 않게
          const n = level === 1 ? r.int(2, 9) : level === 2 ? r.int(2, 30) : r.int(12, 60);
          const b = mkDec(m, k);
          const prod = mkDec(m * n, k);
          return {
            q: `계산하세요.\n$$${n} \\times ${dt(b)}$$`,
            answer: decAns(prod),
            steps: [`$${n} \\times ${m} = ${n * m}$`, `곱하는 소수가 소수 ${k === 1 ? '한' : '두'} 자리이므로 $${dt(prod)}$`],
          };
        },
      },
      {
        id: 'dec-x-dec',
        title: '(소수) × (소수)',
        gen(r, level) {
          const [ka, kb] = level === 1 ? [1, 1] : level === 2 ? [1, 1] : r.pick([
            [2, 1],
            [1, 2],
            [2, 2],
          ]);
          let ma = level === 1 ? r.int(1, 9) : r.int(11, level === 2 ? 49 : 299);
          let mb = level === 1 ? r.int(1, 9) : r.int(11, 49);
          if (ma % 10 === 0) ma += 1; // 2.0 처럼 자연수가 되지 않게
          if (mb % 10 === 0) mb += 1;
          const a = mkDec(ma, ka),
            b = mkDec(mb, kb);
          const prod = mkDec(ma * mb, ka + kb);
          return {
            q: `계산하세요.\n$$${dt(a)} \\times ${dt(b)}$$`,
            answer: decAns(prod),
            steps: [`자연수처럼: $${ma} \\times ${mb} = ${ma * mb}$`, `소수점 아래 자릿수 $${ka} + ${kb} = ${ka + kb}$ 자리 → $${dt(prod)}$`],
          };
        },
      },
      {
        id: 'point-pos',
        title: '곱의 소수점 위치',
        gen(r, level) {
          const m = r.int(101, 9999);
          const k = r.int(1, 3);
          const a = mkDec(m, k);
          if (level === 1) {
            const e = r.int(1, 3);
            const res = round(a * p10(e), 8);
            return {
              q: `계산하세요.\n$$${dt(a)} \\times ${comma(p10(e))}$$`,
              answer: decAns(res),
              steps: [`${nj(comma(p10(e)), '을/를')} 곱하면 소수점이 오른쪽으로 $${e}$ 칸 옮겨져요.`, `$${dt(res)}$`],
            };
          }
          if (level === 2) {
            const e = r.int(1, 3);
            const mult = mkDec(1, e);
            const res = round(m * mult, 8);
            return {
              q: `계산하세요.\n$$${comma(m)} \\times ${dt(mult)}$$`,
              answer: decAns(res),
              steps: [`${nj(dt(mult), '을/를')} 곱하면 소수점이 왼쪽으로 $${e}$ 칸 옮겨져요.`, `$${dt(res)}$`],
            };
          }
          const e = r.pick([-3, -2, -1, 1, 2, 3]);
          const res = round(a * p10(e), 8);
          const mult = round(p10(e), 8);
          const opts = [-3, -2, -1, 1, 2, 3].map((x) => `$${dt(round(p10(x), 8))}$`);
          return {
            q: `$\\square$ 안에 알맞은 수는?\n$$${dt(a)} \\times \\square = ${dt(res)}$$`,
            answer: makeChoices(r, `$${dt(mult)}$`, opts, 5),
            steps: [`$${dt(a)} \\to ${dt(res)}$: 소수점이 ${e > 0 ? '오른쪽' : '왼쪽'}으로 $${Math.abs(e)}$ 칸`, `$\\square = ${dt(mult)}$`],
          };
        },
      },
      {
        id: 'use-known',
        title: '자연수의 곱셈 이용하기',
        gen(r, level) {
          const a = r.int(11, 99),
            b = r.int(11, level === 1 ? 19 : 99);
          const c = a * b;
          const ka = level === 1 ? 1 : r.int(1, 2),
            kb = level === 3 ? r.int(1, 3) : 1;
          const A = mkDec(a, ka),
            B = mkDec(b, kb);
          const res = mkDec(c, ka + kb);
          return {
            q: `$${a} \\times ${b} = ${comma(c)}$ 입니다. 이를 이용하여 $${dt(A)} \\times ${dt(B)}$ 의 값을 구하면?`,
            answer: numChoices(r, res, [mkDec(c, ka + kb - 1), mkDec(c, ka + kb + 1), mkDec(c, ka + kb + 2), mkDec(c, Math.max(0, ka + kb - 2))], 4, 'dec'),
            steps: [`${nj(dt(A), '은/는')} 소수 ${ka} 자리, ${nj(dt(B), '은/는')} 소수 ${kb} 자리`, `곱은 소수 $${ka + kb}$ 자리: $${dt(res)}$`],
          };
        },
      },
      {
        id: 'word',
        title: '소수의 곱셈 문장제',
        gen(r, level) {
          const k = level === 3 ? r.int(4, 5) : r.int(0, 3);
          const nm = pickName(r);
          if (k === 4) {
            const per = mkDec(r.int(70, 95), 2),
              L = mkDec(r.int(21, 59), 1),
              can = mkDec(r.int(3, 9), 1);
            const tot = round(per * L + can, 8);
            return {
              q: `$1$ L 의 무게가 $${dt(per)}$ kg 인 식용유 $${dt(L)}$ L 를 무게가 $${dt(can)}$ kg 인 빈 통에 담았습니다. 식용유를 담은 통 전체의 무게는 몇 kg 인가요?`,
              answer: decAns(tot, 'kg'),
              steps: [`식용유의 무게: $${dt(per)} \\times ${dt(L)} = ${dt(round(per * L, 8))}$ (kg)`, `통 전체: $${dt(round(per * L, 8))} + ${dt(can)} = ${dt(tot)}$ (kg)`],
            };
          }
          if (k === 5) {
            const a = r.int(4, 15),
              b = r.int(3, 12);
            const fa = mkDec(r.int(11, 19), 1),
              fb = mkDec(r.int(5, 9), 1);
            const na = round(a * fa, 8),
              nb = round(b * fb, 8);
            return {
              q: `가로가 $${a}$ m, 세로가 $${b}$ m 인 직사각형 모양의 땅이 있습니다. 가로를 $${dt(fa)}$ 배로 늘이고 세로를 $${dt(fb)}$ 배로 줄여서 새로운 땅을 만들었다면, 새로운 땅의 넓이는 몇 m² 인가요?`,
              answer: decAns(na * nb, 'm²'),
              steps: [`새 가로: $${a} \\times ${dt(fa)} = ${dt(na)}$ (m), 새 세로: $${b} \\times ${dt(fb)} = ${dt(nb)}$ (m)`, `넓이: $${dt(na)} \\times ${dt(nb)} = ${dt(round(na * nb, 8))}$ (m²)`],
            };
          }
          if (k === 0) {
            const w = mkDec(r.int(level === 1 ? 2 : 11, level === 1 ? 9 : 99), level === 1 ? 1 : 2);
            const n = r.int(3, level === 3 ? 25 : 9);
            return {
              q: `한 개의 무게가 $${dt(w)}$ kg 인 멜론이 $${n}$ 개 있습니다. 멜론 전체의 무게는 몇 kg 인가요?`,
              answer: decAns(w * n, 'kg'),
              steps: [`$${dt(w)} \\times ${n} = ${dt(round(w * n, 8))}$ (kg)`],
            };
          }
          if (k === 1) {
            const a = mkDec(r.int(11, 49), 1),
              b = mkDec(r.int(level === 1 ? 2 : 11, level === 1 ? 9 : 39), 1);
            return {
              q: `가로가 $${dt(a)}$ m, 세로가 $${dt(b)}$ m 인 직사각형 모양 꽃밭의 넓이는 몇 m² 인가요?`,
              answer: decAns(a * b, 'm²'),
              steps: [`$${dt(a)} \\times ${dt(b)} = ${dt(round(a * b, 8))}$ (m²)`],
            };
          }
          if (k === 2) {
            // 학생 수가 자연수가 되도록: 전체는 10(3단계 100)의 배수
            const total = level === 1 ? r.int(3, 9) * 10 : level === 2 ? r.int(11, 60) * 10 : r.int(10, 99) * 100;
            const rate = level === 3 ? mkDec(r.pick([...Array(99).keys()].map((i) => i + 1).filter((x) => x % 10 !== 0)), 2) : mkDec(r.int(1, 9), 1);
            return {
              q: `${nm}네 학교 학생은 $${comma(total)}$ 명입니다. 그중 $${dt(rate)}$ 만큼이 자전거로 등교한다면 자전거로 등교하는 학생은 몇 명인가요?`,
              answer: intAns(round(total * rate, 8), '명'),
              steps: [`$${comma(total)} \\times ${dt(rate)} = ${dt(round(total * rate, 8))}$ (명)`],
            };
          }
          let spI = r.int(31, 89);
          if (spI % 10 === 0) spI += 3;
          const sp = mkDec(spI, 1);
          const t = level === 1 ? r.int(2, 5) : mkDec(r.int(11, 35), 1);
          return {
            q: `한 시간에 $${dt(sp)}$ km 를 가는 자전거가 같은 빠르기로 $${dt(t)}$ 시간 동안 가면 몇 km 를 가나요?`,
            answer: decAns(sp * t, 'km'),
            steps: [`$${dt(sp)} \\times ${dt(t)} = ${dt(round(sp * t, 8))}$ (km)`],
          };
        },
      },
    ],
  },

  // ═════════════ 5-2-5 직육면체 ═════════════
  'e5b-5': {
    concepts: [
      {
        title: '직육면체와 정육면체',
        body: '직사각형 6개로 둘러싸인 도형을 **직육면체**, 정사각형 6개로 둘러싸인 도형을 **정육면체**라고 해요.\n- 정육면체는 직육면체라고 할 수 있지만, 직육면체는 정육면체라고 할 수 없어요.',
      },
      {
        title: '면, 모서리, 꼭짓점',
        body: '직육면체와 정육면체는 모두\n- 면 $6$ 개, 모서리 $12$ 개, 꼭짓점 $8$ 개\n- 정육면체는 모서리의 길이가 모두 같아요.',
      },
      {
        title: '평행한 면과 수직인 면',
        body: '- 마주 보는 두 면은 **평행**하고, 서로 평행한 면은 $3$ 쌍이에요. 평행한 면을 **밑면**이라고 해요.\n- 한 면과 만나는 면은 그 면과 **수직**이에요. 한 면에 수직인 면은 $4$ 개예요.',
      },
      {
        title: '겨냥도',
        body: '직육면체 모양을 잘 알 수 있게 보이는 모서리는 실선, **보이지 않는 모서리는 점선**으로 그린 그림이에요.\n- 보이는 면 $3$ 개, 보이는 모서리 $9$ 개, 보이는 꼭짓점 $7$ 개\n- 보이지 않는 면 $3$ 개, 보이지 않는 모서리 $3$ 개, 보이지 않는 꼭짓점 $1$ 개',
      },
      {
        title: '전개도',
        body: '직육면체의 모서리를 잘라 펼친 그림이에요. 잘린 모서리는 실선, 잘리지 않은 모서리는 점선으로 그려요.\n- 접었을 때 **마주 보는 면**끼리는 서로 평행하고, 만나는 면끼리는 수직이에요.\n- 맞닿는 모서리의 길이는 같아야 해요.',
      },
    ],
    skills: [
      {
        id: 'parts',
        title: '직육면체의 구성 요소',
        gen(r, level) {
          const L1: [string, number][] = [
            ['직육면체의 면은 모두 몇 개인가요?', 6],
            ['직육면체의 모서리는 모두 몇 개인가요?', 12],
            ['직육면체의 꼭짓점은 모두 몇 개인가요?', 8],
            ['정육면체에서 한 꼭짓점에서 만나는 면은 몇 개인가요?', 3],
            ['직육면체에서 한 면에 수직인 면은 몇 개인가요?', 4],
            ['직육면체에서 서로 평행한 면은 모두 몇 쌍인가요?', 3],
          ];
          const L2: [string, number][] = [
            ['직육면체의 겨냥도에서 보이지 않는 모서리는 몇 개인가요?', 3],
            ['직육면체의 겨냥도에서 보이는 모서리는 몇 개인가요?', 9],
            ['직육면체의 겨냥도에서 보이는 꼭짓점은 몇 개인가요?', 7],
            ['직육면체의 겨냥도에서 보이는 면은 몇 개인가요?', 3],
            ['직육면체의 겨냥도에서 보이지 않는 꼭짓점은 몇 개인가요?', 1],
          ];
          const L3: [string, number][] = [
            ['직육면체의 면, 모서리, 꼭짓점의 수를 모두 더하면 몇 개인가요?', 26],
            ['직육면체의 겨냥도에서 보이는 모서리의 수와 보이지 않는 꼭짓점의 수의 합은 몇 개인가요?', 10],
            ['직육면체의 겨냥도에서 보이는 꼭짓점의 수와 보이지 않는 모서리의 수의 차는 몇 개인가요?', 4],
            ['직육면체에서 한 모서리와 평행한 모서리는 몇 개인가요?', 3],
            ['직육면체의 모서리의 수는 꼭짓점의 수보다 몇 개 더 많은가요?', 4],
            ['직육면체에서 한 면에 수직인 면의 수와 서로 평행한 면의 쌍의 수의 합은 몇 개인가요?', 7],
          ];
          const [q, a] = r.pick(level === 1 ? L1 : level === 2 ? L2 : L3);
          return {
            q,
            fig: level >= 2 ? cuboidFig(r.int(4, 7), r.int(3, 6), r.int(3, 6)) : undefined,
            answer: intAns(a, q.includes('쌍인가요') ? '쌍' : '개'),
            steps: ['직육면체: 면 $6$, 모서리 $12$, 꼭짓점 $8$ / 겨냥도: 보이는 면 $3$, 모서리 $9$, 꼭짓점 $7$', `답: $${a}$`],
          };
        },
      },
      {
        id: 'edge-sum',
        title: '모서리 길이의 합',
        gen(r, level) {
          if (level === 3) {
            const isCube = r.chance(0.5);
            if (isCube) {
              const a = r.int(3, 15);
              return {
                q: `모든 모서리의 길이의 합이 $${12 * a}$ cm 인 정육면체가 있습니다. 한 모서리의 길이는 몇 cm 인가요?`,
                answer: intAns(a, 'cm'),
                steps: ['정육면체는 길이가 같은 모서리가 $12$ 개', `$${12 * a} \\div 12 = ${a}$ (cm)`],
              };
            }
            const a = r.int(4, 12),
              b = r.int(3, 10),
              c = r.int(3, 10);
            return {
              q: `모든 모서리의 길이의 합이 $${4 * (a + b + c)}$ cm 인 직육면체입니다. $\\square$ 안에 알맞은 수를 구하세요.`,
              fig: cuboidFig(a, b, c, { labels: [`${a} cm`, `${b} cm`, '□ cm'] }),
              answer: intAns(c, 'cm'),
              steps: [`길이가 같은 모서리가 $4$ 개씩: $(${a} + ${b} + \\square) \\times 4 = ${4 * (a + b + c)}$`, `$${a} + ${b} + \\square = ${a + b + c}$`, `$\\square = ${c}$`],
            };
          }
          const cube = level === 1 && r.chance(0.5);
          const a = r.int(3, 12),
            b = cube ? a : r.int(2, 10),
            c = cube ? a : r.int(2, 10);
          return {
            q: `다음 ${cube ? '정육면체' : '직육면체'}의 모든 모서리의 길이의 합은 몇 cm 인가요?`,
            fig: cuboidFig(a, b, c, { labels: cube ? [`${a} cm`, null, null] : [`${a} cm`, `${b} cm`, `${c} cm`] }),
            answer: intAns(4 * (a + b + c), 'cm'),
            steps: cube ? ['정육면체의 모서리 $12$ 개는 길이가 모두 같아요.', `$${a} \\times 12 = ${12 * a}$ (cm)`] : ['길이가 같은 모서리가 $4$ 개씩 $3$ 쌍', `$(${a} + ${b} + ${c}) \\times 4 = ${4 * (a + b + c)}$ (cm)`],
          };
        },
      },
      {
        id: 'face-relation',
        title: '평행한 면과 수직인 면',
        gen(r, level) {
          const faces = ['ㄱㄴㄷㄹ', 'ㅁㅂㅅㅇ', 'ㄹㄷㅅㅇ', 'ㄱㄴㅂㅁ', 'ㄱㄹㅇㅁ', 'ㄴㄷㅅㅂ'];
          const pairOf = (i: number) => (i % 2 === 0 ? i + 1 : i - 1);
          const i = r.int(0, 5);
          const fig = cuboidFig(6, 4, 4, { names: true });
          if (level === 3) {
            // 모서리와 평행한 모서리
            const edges: [string, string[]][] = [
              ['ㄱㄴ', ['ㄹㄷ', 'ㅁㅂ', 'ㅇㅅ']],
              ['ㄴㄷ', ['ㄱㄹ', 'ㅂㅅ', 'ㅁㅇ']],
              ['ㄱㅁ', ['ㄴㅂ', 'ㄷㅅ', 'ㄹㅇ']],
            ];
            const [e, par] = r.pick(edges);
            const others = ['ㄱㄴ', 'ㄴㄷ', 'ㄷㄹ', 'ㄹㄱ', 'ㅁㅂ', 'ㅂㅅ', 'ㅅㅇ', 'ㅇㅁ', 'ㄱㅁ', 'ㄴㅂ', 'ㄷㅅ', 'ㄹㅇ'].filter((x) => x !== e && !par.some((p) => p === x || p === x[1] + x[0]));
            const right = `모서리 ${r.pick(par)}`;
            return {
              q: `직육면체에서 모서리 ${e} 과 평행한 모서리는?`,
              fig,
              answer: makeChoices(r, right, r.sample(others, 4).map((x) => `모서리 ${x}`), 5),
              steps: [`모서리 ${e} 과 평행한 모서리: ${par.map((p) => '모서리 ' + p).join(', ')}`],
            };
          }
          const others = faces.filter((_, k) => k !== i && k !== pairOf(i));
          if (level === 1) {
            return {
              q: `직육면체에서 면 ${faces[i]} 과 평행한 면은?`,
              fig,
              answer: makeChoices(r, `면 ${faces[pairOf(i)]}`, others.map((f) => `면 ${f}`), 5),
              steps: [`면 ${faces[i]} 과 마주 보는 면이 평행한 면이에요.`, `면 ${faces[pairOf(i)]}`],
            };
          }
          return {
            q: `직육면체에서 면 ${faces[i]} 과 **수직이 아닌** 면은?`,
            fig,
            answer: makeChoices(r, `면 ${faces[pairOf(i)]}`, others.map((f) => `면 ${f}`), 5),
            steps: [`면 ${faces[i]} 과 만나는 면 $4$ 개는 모두 수직이에요.`, `만나지 않는 면, 즉 평행한 면 ${faces[pairOf(i)]} 이 수직이 아니에요.`],
          };
        },
      },
      {
        id: 'net-opposite',
        title: '정육면체의 전개도',
        gen(r, level) {
          const net = r.pick(NETS);
          const fold = foldCube(net)!;
          if (level === 3) {
            // 주사위: 마주 보는 면의 눈의 합 7
            const val: number[] = [];
            const phys = [0, 1, 2, 3, 4, 5];
            const pairs = r.shuffle([
              [1, 6],
              [2, 5],
              [3, 4],
            ]);
            const map: Record<number, number> = {};
            pairs.forEach(([x, y], k) => {
              const sw = r.chance(0.5);
              map[phys[2 * k]] = sw ? y : x;
              map[phys[2 * k + 1]] = sw ? x : y;
            });
            fold.forEach((f, k) => (val[k] = map[f]));
            const hide = r.int(0, 5);
            const labels = val.map((v, k) => (k === hide ? '?' : String(v)));
            return {
              q: '마주 보는 면의 눈의 수의 합이 $7$ 인 주사위의 전개도입니다. ? 에 알맞은 눈의 수를 구하세요.',
              fig: gridNetFig(net, labels),
              answer: intAns(val[hide]),
              steps: [`? 와 마주 보는 면을 찾으면 눈의 수가 $${7 - val[hide]}$`, `$7 - ${7 - val[hide]} = ${val[hide]}$`],
              hint: '전개도를 접었을 때 한 칸 건너 있는 면이 마주 보는 경우가 많아요.',
            };
          }
          const labels = r.shuffle(FACE);
          const k = r.int(0, 5);
          const oppIdx = fold.indexOf(opp(fold[k]));
          const others = labels.filter((_, j) => j !== k && j !== oppIdx);
          if (level === 1) {
            return {
              q: `정육면체의 전개도를 접었을 때, 면 ${labels[k]}와 평행한 면은?`,
              fig: gridNetFig(net, labels),
              answer: makeChoices(r, `면 ${labels[oppIdx]}`, others.map((x) => `면 ${x}`), 5),
              steps: [`면 ${labels[k]}와 이웃한 면은 수직, 마주 보는 면은 평행해요.`, `접으면 면 ${labels[k]}와 마주 보는 면은 면 ${labels[oppIdx]}`],
            };
          }
          return {
            q: `정육면체의 전개도를 접었을 때, 면 ${labels[k]}와 **수직인** 면이 **아닌** 것은?`,
            fig: gridNetFig(net, labels),
            answer: makeChoices(r, `면 ${labels[oppIdx]}`, others.map((x) => `면 ${x}`), 5),
            steps: [`접으면 면 ${labels[k]}와 마주 보는(평행한) 면은 면 ${labels[oppIdx]}`, '나머지 $4$ 개의 면은 모두 수직이에요.'],
          };
        },
      },
      {
        id: 'net-length',
        title: '직육면체의 전개도',
        gen(r, level) {
          const [a, b, c] = [r.int(5, 8), r.int(2, 4), r.int(3, 7)];
          if (c === a) return content['e5b-5'].skills.find((x) => x.id === 'net-length')!.gen(r, level);
          // 가운데 세로줄: 윗면(a×b), 앞면(a×c), 밑면(a×b), 뒷면(a×c), 앞면 양옆에 옆면(b×c)
          const rects = [
            { x: b, y: 0, w: a, h: b },
            { x: b, y: b, w: a, h: c },
            { x: b, y: b + c, w: a, h: b },
            { x: b, y: 2 * b + c, w: a, h: c },
            { x: 0, y: b, w: b, h: c },
            { x: a + b, y: b, w: b, h: c },
          ];
          if (level === 1) {
            return {
              q: '직육면체의 전개도입니다. 이 전개도를 접어서 만든 직육면체의 모든 모서리의 길이의 합은 몇 cm 인가요?',
              fig: rectNetFig(rects, [
                { x: b + a / 2, y: 0, dy: -9, text: `${a} cm` },
                { x: b + a, y: b / 2, dx: 6, text: `${b} cm`, anchor: 'start' },
                { x: b, y: 2 * b + c + c / 2, dx: -6, text: `${c} cm`, anchor: 'end' },
              ]),
              answer: intAns(4 * (a + b + c), 'cm'),
              steps: [`직육면체의 세 모서리: $${a}$ cm, $${b}$ cm, $${c}$ cm`, `$(${a} + ${b} + ${c}) \\times 4 = ${4 * (a + b + c)}$ (cm)`],
            };
          }
          const per = 2 * a + 8 * b + 4 * c;
          if (level === 2) {
            return {
              q: '직육면체의 전개도입니다. 전개도의 둘레는 몇 cm 인가요?',
              fig: rectNetFig(rects, [
                { x: b + a / 2, y: 0, dy: -9, text: `${a} cm` },
                { x: b + a, y: b / 2, dx: 6, text: `${b} cm`, anchor: 'start' },
                { x: b, y: 2 * b + c + c / 2, dx: -6, text: `${c} cm`, anchor: 'end' },
              ]),
              answer: intAns(per, 'cm'),
              steps: [`둘레에는 $${a}$ cm 인 선분 $2$ 개, $${b}$ cm 인 선분 $8$ 개, $${c}$ cm 인 선분 $4$ 개가 있어요.`, `$${a} \\times 2 + ${b} \\times 8 + ${c} \\times 4 = ${per}$ (cm)`],
              hint: '전개도의 바깥쪽 선분을 길이별로 세어 보세요.',
            };
          }
          const area = 2 * (a * b + b * c + a * c);
          return {
            q: '직육면체의 전개도입니다. 전개도의 넓이(여섯 면의 넓이의 합)는 몇 cm² 인가요?',
            fig: rectNetFig(rects, [
              { x: b + a / 2, y: 0, dy: -9, text: `${a} cm` },
              { x: b + a, y: b / 2, dx: 6, text: `${b} cm`, anchor: 'start' },
              { x: b, y: 2 * b + c + c / 2, dx: -6, text: `${c} cm`, anchor: 'end' },
            ]),
            answer: intAns(area, 'cm²'),
            steps: [`넓이가 같은 면이 $2$ 개씩: $${a}\\times${b}$, $${a}\\times${c}$, $${b}\\times${c}$`, `$(${a * b} + ${a * c} + ${b * c}) \\times 2 = ${area}$ (cm²)`],
          };
        },
      },
    ],
  },

  // ═════════════ 5-2-6 평균과 가능성 ═════════════
  'e5b-6': {
    concepts: [
      {
        title: '평균',
        body: '자료의 값을 모두 더해 자료의 수로 나눈 값을 **평균**이라고 해요. 평균은 자료를 대표하는 값이에요.\n$$(\\text{평균}) = (\\text{자료 값의 합}) \\div (\\text{자료의 수})$$\n- 평균을 기준으로 높은 값과 낮은 값을 고르게 해서 구할 수도 있어요.',
        example: { q: '$4, 7, 6, 3$ 의 평균', a: '$(4+7+6+3) \\div 4 = 5$' },
      },
      {
        title: '평균 이용하기',
        body: '- 자료 값의 합 $=$ (평균) $\\times$ (자료의 수)\n- 모르는 값 $=$ (평균 $\\times$ 자료의 수) $-$ (아는 값들의 합)\n- 자료의 수가 다른 두 모둠도 평균으로 비교할 수 있어요.',
      },
      {
        title: '일이 일어날 가능성',
        body: '가능성의 정도는 **불가능하다 → ~아닐 것 같다 → 반반이다 → ~일 것 같다 → 확실하다** 로 표현해요.',
      },
      {
        title: '가능성을 수로 나타내기',
        body: '- 불가능하다: $0$\n- 반반이다: $\\frac{1}{2}$\n- 확실하다: $1$\n예) 주사위를 굴려 $7$ 이 나올 가능성은 $0$, 동전을 던져 그림 면이 나올 가능성은 $\\frac{1}{2}$',
      },
    ],
    skills: [
      {
        id: 'mean',
        title: '평균 구하기',
        gen(r, level) {
          // 5학년은 (자연수)÷(자연수)의 몫을 소수로 나타내기 전이므로 평균은 자연수로
          const n = level === 1 ? r.int(3, 4) : level === 2 ? r.int(4, 6) : r.int(6, 8);
          const avg = level === 1 ? r.int(8, 20) : level === 2 ? r.int(20, 90) : r.int(110, 190);
          const vals = valuesWithMean(r, n, avg, level === 1 ? 5 : level === 2 ? 12 : 25, 0);
          const tot = vals.reduce((a, b) => a + b, 0);
          const mean = round(tot / n, 6);
          const ctx = r.pick([
            { what: '줄넘기 기록', unit: '번' },
            { what: '독서 시간', unit: '분' },
            { what: '턱걸이 기록', unit: '번' },
            { what: '읽은 책 쪽수', unit: '쪽' },
          ]);
          const names = pickNames(r, n);
          return {
            q: `${josa(ctx.what, '을/를')} 조사하여 나타낸 표입니다. ${ctx.what}의 평균은 몇 ${ctx.unit}인가요?`,
            table: [['이름', ...names], [`기록(${ctx.unit})`, ...vals.map((v) => `$${v}$`)]],
            answer: intAns(mean, ctx.unit),
            steps: [`합: $${vals.join(' + ')} = ${tot}$`, `평균: $${tot} \\div ${n} = ${dt(mean)}$ (${ctx.unit})`],
          };
        },
      },
      {
        id: 'missing',
        title: '평균으로 모르는 값 구하기',
        gen(r, level) {
          const n = level === 1 ? 4 : r.int(4, 6);
          const A = r.int(level === 1 ? 10 : 50, level === 1 ? 30 : level === 2 ? 90 : 85);
          let vals = valuesWithMean(r, n, A, level === 1 ? 6 : 12, 0);
          while (level === 3 && Math.max(...vals) > 100) vals = valuesWithMean(r, n, A, 12, 0); // 시험 점수는 100 점 이하
          const hide = level === 3 ? n - 1 : r.int(0, n - 1);
          const known = vals.filter((_, i) => i !== hide);
          const names = ['1회', '2회', '3회', '4회', '5회', '6회'].slice(0, n);
          if (level === 3) {
            const sumK = known.reduce((a, b) => a + b, 0);
            return {
              q: `${pickName(r)}의 수학 시험 점수입니다. ${n}회까지의 평균 점수가 $${A}$ 점 이상이 되려면 ${n}회에는 적어도 몇 점을 받아야 하나요?`,
              table: [['회', ...names.slice(0, n - 1)], ['점수(점)', ...known.map((v) => `$${v}$`)]],
              answer: intAns(vals[hide], '점'),
              steps: [`필요한 총점: $${A} \\times ${n} = ${A * n}$ (점)`, `지금까지의 합: $${sumK}$`, `$${A * n} - ${sumK} = ${vals[hide]}$ (점)`],
            };
          }
          return {
            q: `윗몸 말아 올리기 기록의 평균이 $${A}$ 번일 때, ? 에 알맞은 수를 구하세요.`,
            table: [['회', ...names], ['기록(번)', ...vals.map((v, i) => (i === hide ? '?' : `$${v}$`))]],
            answer: intAns(vals[hide], '번'),
            steps: [`기록의 합: $${A} \\times ${n} = ${A * n}$ (번)`, `? $= ${A * n} - (${known.join(' + ')}) = ${vals[hide]}$`],
          };
        },
      },
      {
        id: 'compare-mean',
        title: '평균 비교하기',
        gen(r, level) {
          const mk = (n: number, avg: number) => valuesWithMean(r, n, avg, 6, 0);
          const nA = r.int(3, 5),
            nB = level === 1 ? nA : r.int(3, 6);
          let aA = r.int(20, 40),
            aB = r.int(20, 40);
          if (aA === aB) aB += 2;
          const A = mk(nA, aA),
            B = mk(nB, aB);
          if (level === 3) {
            // 두 모둠 전체 평균 (나누어떨어지도록 나 모둠 평균을 조정 — 5학년은 몫을 소수로 나타내기 전)
            while ((aA * nA + aB * nB) % (nA + nB) !== 0 || aA === aB) aB = aB >= 45 ? 20 : aB + 1;
            const tot = aA * nA + aB * nB;
            const n = nA + nB;
            return {
              q: `가 모둠 $${nA}$ 명의 평균 점수는 $${aA}$ 점, 나 모둠 $${nB}$ 명의 평균 점수는 $${aB}$ 점입니다. 두 모둠 전체 학생의 평균 점수는 몇 점인가요?`,
              answer: intAns(tot / n, '점'),
              steps: [`가 모둠 합: $${aA} \\times ${nA} = ${aA * nA}$, 나 모둠 합: $${aB} \\times ${nB} = ${aB * nB}$`, `전체 학생 수: $${nA} + ${nB} = ${n}$ (명)`, `전체 평균: $${tot} \\div ${n} = ${tot / n}$ (점)`],
            };
          }
          return {
            q: '가 모둠과 나 모둠의 고리 던지기 기록입니다. 어느 모둠의 평균이 몇 개 더 많은지 구할 때, 평균의 차는 몇 개인가요?',
            table: [
              ['가 모둠(개)', ...A.map((v) => `$${v}$`)],
              ['나 모둠(개)', ...B.map((v) => `$${v}$`)],
            ],
            answer: intAns(Math.abs(aA - aB), '개'),
            steps: [`가 모둠: $${A.reduce((a, b) => a + b, 0)} \\div ${nA} = ${aA}$ (개)`, `나 모둠: $${B.reduce((a, b) => a + b, 0)} \\div ${nB} = ${aB}$ (개)`, `차: $${Math.abs(aA - aB)}$ 개`],
          };
        },
      },
      {
        id: 'add-member',
        title: '평균의 변화',
        gen(r, level) {
          const n = r.int(4, 8);
          const avg = r.int(30, 60);
          let newAvg = avg + r.pick([1, 2, 3, -1, -2]);
          if (level === 1) newAvg = avg + r.int(1, 3);
          const x = newAvg * (n + 1) - avg * n;
          const nm = pickName(r);
          if (level === 3) {
            return {
              q: `${nm}네 모둠 $${n}$ 명의 몸무게 평균은 $${avg}$ kg 입니다. 새로운 친구 한 명이 들어와서 평균이 $${newAvg}$ kg 이 되었다면, 새로운 친구의 몸무게는 몇 kg 인가요?`,
              answer: intAns(x, 'kg'),
              steps: [`처음 합: $${avg} \\times ${n} = ${avg * n}$`, `새 합: $${newAvg} \\times ${n + 1} = ${newAvg * (n + 1)}$`, `$${newAvg * (n + 1)} - ${avg * n} = ${x}$ (kg)`],
            };
          }
          return {
            q: `${nm}네 모둠 $${n}$ 명의 수학 점수 평균은 $${avg}$ 점입니다. 점수가 $${x}$ 점인 학생 한 명이 더 들어오면 평균은 몇 점이 되나요?`,
            answer: intAns(newAvg, '점'),
            steps: [`$${n}$ 명의 합: $${avg} \\times ${n} = ${avg * n}$`, `$(${avg * n} + ${x}) \\div ${n + 1} = ${newAvg}$ (점)`],
          };
        },
      },
      {
        id: 'possibility-word',
        title: '가능성을 말로 표현하기',
        gen(r, level) {
          const W = ['불가능하다', '~아닐 것 같다', '반반이다', '~일 것 같다', '확실하다'];
          const fixed: [string, number][] = [
            ['주사위를 한 번 굴릴 때 주사위 눈의 수가 $7$ 이 나올 가능성', 0],
            ['주사위를 한 번 굴릴 때 주사위 눈의 수가 $6$ 이하로 나올 가능성', 4],
            ['동전을 한 번 던질 때 숫자 면이 나올 가능성', 2],
            ['주사위를 한 번 굴릴 때 짝수가 나올 가능성', 2],
            ['12월 31일 다음 날이 1월 1일일 가능성', 4],
            ['내일 해가 서쪽에서 뜰 가능성', 0],
            ['1부터 6까지 쓰인 카드 중 한 장을 뽑을 때 홀수가 나올 가능성', 2],
          ];
          if (level === 1) {
            const [q, a] = r.pick(fixed);
            return {
              q: `다음 일이 일어날 가능성을 알맞게 표현한 것은?\n${q}`,
              answer: makeChoices(r, W[a], W, 5),
              steps: [`${q}은 '${W[a]}' 예요.`],
            };
          }
          if (level === 3) {
            const n = r.pick([10, 12, 20]);
            const evs: [string, (x: number) => boolean][] = [
              ['짝수', (x) => x % 2 === 0],
              ['$3$의 배수', (x) => x % 3 === 0],
              [`$${n}$ 이하인 수`, (x) => x <= n],
              [`$${n + 1}$ 이상인 수`, (x) => x > n],
              ['$2$ 이상인 수', (x) => x >= 2],
              ['$5$의 배수', (x) => x % 5 === 0],
              ['$4$ 초과인 수', (x) => x > 4],
            ];
            const [nm, f] = r.pick(evs);
            let c = 0;
            for (let x = 1; x <= n; x++) if (f(x)) c++;
            const a = c === 0 ? 0 : c === n ? 4 : 2 * c === n ? 2 : 2 * c < n ? 1 : 3;
            return {
              q: `$1$ 부터 $${n}$ 까지의 수가 하나씩 적힌 카드 $${n}$ 장 중에서 한 장을 뽑을 때, ${nm}가 나올 가능성을 알맞게 표현한 것은?`,
              answer: makeChoices(r, W[a], W, 5),
              steps: [`$${n}$ 장 중 ${nm}는 $${c}$ 장`, `${c === 0 ? '하나도 없으므로' : c === n ? '모두 해당하므로' : 2 * c === n ? '절반이므로' : 2 * c < n ? '절반보다 적으므로' : '절반보다 많으므로'} '${W[a]}'`],
            };
          }
          const red = r.int(0, 10),
            blue = 10 - red;
          const tgt = r.pick(['빨간', '파란']);
          const c = tgt === '빨간' ? red : blue;
          const a = c === 0 ? 0 : c === 10 ? 4 : c === 5 ? 2 : c < 5 ? 1 : 3;
          return {
            q: `${red === 0 ? `파란 공만 $${blue}$ 개` : blue === 0 ? `빨간 공만 $${red}$ 개` : `빨간 공 $${red}$ 개와 파란 공 $${blue}$ 개`}가 들어 있는 상자에서 공 한 개를 꺼낼 때, ${tgt} 공이 나올 가능성을 알맞게 표현한 것은?`,
            answer: makeChoices(r, W[a], W, 5),
            steps: [`전체 $10$ 개 중 ${tgt} 공은 $${c}$ 개`, `${c === 0 ? '하나도 없으므로' : c === 10 ? '모두 그 색이므로' : c === 5 ? '절반이므로' : c < 5 ? '절반보다 적으므로' : '절반보다 많으므로'} '${W[a]}'`],
          };
        },
      },
      {
        id: 'possibility-num',
        title: '가능성을 수로 나타내기',
        gen(r, level) {
          const items: [string, number][] = [
            ['동전을 한 번 던질 때 그림 면이 나올 가능성', 1],
            ['주사위를 한 번 굴릴 때 눈의 수가 $0$ 이 나올 가능성', 0],
            ['주사위를 한 번 굴릴 때 눈의 수가 $1$ 이상일 가능성', 2],
            ['주사위를 한 번 굴릴 때 홀수가 나올 가능성', 1],
            ['흰 바둑돌만 $5$ 개 들어 있는 주머니에서 검은 바둑돌을 꺼낼 가능성', 0],
            ['흰 바둑돌만 $5$ 개 들어 있는 주머니에서 흰 바둑돌을 꺼낼 가능성', 2],
          ];
          const V = ['$0$', '$\\frac{1}{2}$', '$1$'];
          if (level <= 2) {
            const [q, a] = r.pick(items);
            const nr = r.int(1, 4);
            const bag: [string, number] = [`빨간 구슬 $${nr}$ 개와 노란 구슬 $${nr}$ 개가 든 주머니에서 빨간 구슬을 꺼낼 가능성`, 1];
            const [qq, aa] = level === 2 && r.chance(0.4) ? bag : [q, a];
            return {
              q: `다음 일이 일어날 가능성을 수로 나타내면?\n${qq}`,
              answer: makeChoices(r, V[aa], V, 3),
              steps: [`${['불가능하다', '반반이다', '확실하다'][aa]} → ${V[aa]}`],
            };
          }
          const [x, y] = r.sample(items, 2);
          const val = [0, 0.5, 1];
          const s = val[x[1]] + val[y[1]];
          return {
            q: `두 가능성을 수로 나타내어 더하면 얼마인가요?\n㉠ ${x[0]}\n㉡ ${y[0]}`,
            answer: { type: 'num', value: s, display: 'frac' },
            steps: [`㉠ ${V[x[1]]}, ㉡ ${V[y[1]]}`, `합: $${new F(Math.round(s * 2), 2).tex()}$`],
          };
        },
      },
    ],
  },
};


// 문장제 추가 유형 (words5.ts) — 기존 유형 뒤에 덧붙임 (기존 id·순서 유지)
for (const [u, sks] of Object.entries(WORD5)) content[u]?.skills.push(...sks);
