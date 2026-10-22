// e4a 심화 추가분 (v0.11): 단원마다 심화 유형 3개 + 최상위 2개
import type { Skill } from '../../core/types';
import type { Rng } from '../../core/rng';
import { Svg } from '../../core/fig';
import { makeChoices } from '../../core/tex';
import { J, josa, asymShape, c, cellKey, cellsFig, flipH, flipV, korNum, rotN, type Cells } from './util';
import { geoFig, ray, sum, until, ORD } from './hardutil';
import type { Pt } from './hardutil';

// ───────── 공용 ─────────
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const num = (ds: number[]) => ds.reduce((a, b) => a * 10 + b, 0);
/** 자리 이름 (0 = 일의 자리) */
const PLACE = ['일', '십', '백', '천', '만', '십만', '백만', '천만', '억', '십억', '백억', '천억'];
const KN = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
/** '이었/였' */
const was = (n: number) => (josa(n, '이/가') === '이' ? '이었' : '였');
const deg = (x: number) => `$${x}^{\\circ}$`;
/** 320000000 → '3억 2000만' */
function korShort(n: number): string {
  const parts: string[] = [];
  const jo = Math.floor(n / 1e12),
    eok = Math.floor((n % 1e12) / 1e8),
    man = Math.floor((n % 1e8) / 1e4),
    il = n % 1e4;
  if (jo) parts.push(`${jo}조`);
  if (eok) parts.push(`${eok}억`);
  if (man) parts.push(`${man}만`);
  if (il) parts.push(String(il));
  return parts.join(' ') || '0';
}
/** 두 직선 (p+s·u, q+t·v) 의 교점 */
function meet(p: Pt, u: Pt, q: Pt, v: Pt): Pt {
  const det = u[0] * -v[1] - u[1] * -v[0];
  const w: Pt = [q[0] - p[0], q[1] - p[1]];
  const s = (w[0] * -v[1] - w[1] * -v[0]) / det;
  return [p[0] + s * u[0], p[1] + s * u[1]];
}
const dir = (a: number): Pt => [Math.cos((a * Math.PI) / 180), Math.sin((a * Math.PI) / 180)];

// ═════════════ e4a-1 큰 수 ═════════════
const U1: Skill[] = [
  {
    id: 'digit-clues',
    title: '조건에 맞는 큰 수 알아맞히기',
    gen(r, level) {
      const L = level === 1 ? 5 : level === 2 ? 7 : 8;
      const pn = (i: number) => PLACE[L - 1 - i]; // i: 0 = 가장 높은 자리
      const D = Array.from({ length: L }, (_, i) => (i === 0 ? r.int(1, 9) : r.int(0, 9)));
      const free = level === 3 ? r.sample(range(1, L - 1), 2).sort((a, b) => a - b) : [];
      const zeros = level === 2 ? r.sample(range(1, L - 1), 2).sort((a, b) => a - b) : [];
      for (const z of zeros) D[z] = 0;
      const rest = r.shuffle(range(0, L - 1).filter((i) => !free.includes(i) && !zeros.includes(i)));
      const known: number[] = [];
      const clues: string[] = [];
      const how: string[] = [];
      const s0 = rest.shift()!;
      clues.push(`${pn(s0)}의 자리 숫자는 $${D[s0]}$입니다.`);
      how.push(`${pn(s0)}의 자리: $${D[s0]}$`);
      known.push(s0);
      if (zeros.length) {
        clues.push(`${pn(zeros[0])}의 자리와 ${pn(zeros[1])}의 자리 숫자는 $0$입니다.`);
        how.push(`${pn(zeros[0])}의 자리, ${pn(zeros[1])}의 자리: $0$`);
        known.push(...zeros);
      }
      for (const p of rest) {
        const q = r.pick(known);
        const a = D[p],
          b = D[q];
        const opts: string[] = [];
        if (a > b) opts.push('more', 'more');
        if (a < b) opts.push('less', 'less');
        if (a === b) opts.push('same');
        if (b > 0 && a === 2 * b) opts.push('double', 'double', 'double');
        if (a > 0 && b === 2 * a) opts.push('half', 'half', 'half');
        if (a + b > 0) opts.push('sum'); // '합은 0' 같은 어색한 조건은 내지 않음
        const t = r.pick(opts);
        const P = `${pn(p)}의 자리 숫자`,
          Q = `${pn(q)}의 자리 숫자`;
        if (t === 'more') {
          clues.push(`${P}는 ${Q}보다 $${a - b}$ 큽니다.`);
          how.push(`${pn(p)}의 자리: $${b}+${a - b}=${a}$`);
        } else if (t === 'less') {
          clues.push(`${P}는 ${Q}보다 $${b - a}$ 작습니다.`);
          how.push(`${pn(p)}의 자리: $${b}-${b - a}=${a}$`);
        } else if (t === 'same') {
          clues.push(`${P}는 ${Q}와 같습니다.`);
          how.push(`${pn(p)}의 자리: ${pn(q)}의 자리와 같은 $${a}$`);
        } else if (t === 'double') {
          clues.push(`${P}는 ${Q}의 $2$배입니다.`);
          how.push(`${pn(p)}의 자리: $${b}\\times2=${a}$`);
        } else if (t === 'half') {
          clues.push(`${Q}는 ${P}의 $2$배입니다.`);
          how.push(`${pn(p)}의 자리: $${b}\\div2=${a}$`);
        } else {
          clues.push(`${P}와 ${Q}의 합은 $${a + b}$입니다.`);
          how.push(`${pn(p)}의 자리: $${a + b}-${b}=${a}$`);
        }
        known.push(p);
      }
      const shown = level === 2 ? [clues[0], ...r.shuffle(clues.slice(1))] : clues;
      if (level <= 2) {
        const v = num(D);
        return {
          q: `다음 조건을 모두 만족하는 ${KN[L]} 자리 수를 구하세요.\n${shown.map((x) => `- ${x}`).join('\n')}`,
          answer: { type: 'num', value: v },
          steps: [...how, `답: $${c(v)}$`],
          hint: '숫자가 바로 주어진 자리부터 채우고, 그 자리와 관계있는 자리를 차례로 구해요.',
        };
      }
      // L3: 남은 두 자리의 조건을 만족하는 수의 개수
      const [f1, f2] = free;
      const kind = r.pick(['sum', 'sumgt', 'diffodd']);
      const [cnt, pairs, cond] = until(
        () => {
          const s = r.int(4, 14),
            k = r.int(1, 5);
          const ok = (a: number, b: number) => (kind === 'sum' ? a + b === s : kind === 'sumgt' ? a + b === s && a > b : a - b === k && b % 2 === 1);
          const ps: [number, number][] = [];
          for (let a = 0; a <= 9; a++) for (let b = 0; b <= 9; b++) if (ok(a, b)) ps.push([a, b]);
          const cd =
            kind === 'sum'
              ? [`${pn(f1)}의 자리 숫자와 ${pn(f2)}의 자리 숫자의 합은 $${s}$입니다.`]
              : kind === 'sumgt'
                ? [`${pn(f1)}의 자리 숫자와 ${pn(f2)}의 자리 숫자의 합은 $${s}$입니다.`, `${pn(f1)}의 자리 숫자는 ${pn(f2)}의 자리 숫자보다 큽니다.`]
                : [`${pn(f1)}의 자리 숫자는 ${pn(f2)}의 자리 숫자보다 $${k}$ 큽니다.`, `${pn(f2)}의 자리 숫자는 홀수입니다.`];
          return [ps.length, ps, cd] as [number, [number, number][], string[]];
        },
        ([n]) => n >= 2 && n <= 9,
      );
      const all = r.shuffle([...clues.slice(1), ...cond]);
      return {
        q: `다음 조건을 모두 만족하는 ${KN[L]} 자리 수는 모두 몇 개인가요?\n${[clues[0], ...all].map((x) => `- ${x}`).join('\n')}`,
        answer: { type: 'num', value: cnt, unit: '개' },
        steps: [
          ...how,
          `${pn(f1)}의 자리와 ${pn(f2)}의 자리 숫자만 정해지지 않았어요.`,
          `가능한 (${pn(f1)}, ${pn(f2)}): ${pairs.map(([a, b]) => `$(${a}, ${b})$`).join(', ')}`,
          `답: $${cnt}$개`,
        ],
        hint: '정해지는 자리를 먼저 모두 채우고, 남은 두 자리에 올 수 있는 숫자를 빠짐없이 찾아요.',
      };
    },
  },
  {
    id: 'times-ten',
    title: '10배·100배·1000배를 거꾸로 생각하기',
    gen(r, level) {
      const MUL = [10, 100, 1000, 10000];
      const zs = (m: number) => String(m).length - 1;
      if (level === 1) {
        const m = r.pick(MUL.slice(0, 3));
        const n = r.int(101, 9999) * r.pick([1, 10, 100]);
        const X = n * m;
        return {
          q: `어떤 수를 $${c(m)}$배 한 수는 $${c(X)}$입니다. 어떤 수는 얼마인가요?`,
          answer: { type: 'num', value: n },
          steps: [`어떤 수를 $${c(m)}$배 하면 각 숫자가 ${zs(m)}자리씩 높은 자리로 올라가고 끝에 $0$이 ${zs(m)}개 더 붙어요.`, `거꾸로 $${c(X)}$에서 끝의 $0$을 ${zs(m)}개 지우면 돼요.`, `어떤 수: $${c(n)}$`],
          hint: '거꾸로, 끝의 0을 지워 보세요.',
        };
      }
      if (level === 2) {
        const [m1, m2] = r.sample(MUL, 2);
        const n = r.int(1001, 99999);
        const X = n * m1,
          V = n * m2;
        return {
          q: `어떤 수를 $${c(m2)}$배 해야 할 것을 잘못하여 $${c(m1)}$배 했더니 $${c(X)}$이 되었습니다. 바르게 계산하면 얼마인가요?`,
          answer: { type: 'num', value: V },
          steps: [`$${c(X)}$에서 끝의 $0$을 ${zs(m1)}개 지우면 어떤 수: $${c(n)}$`, `바르게 계산: $${c(n)}$의 $${c(m2)}$배 → 끝에 $0$을 ${zs(m2)}개 붙여요.`, `$${c(V)}$`],
        };
      }
      const [m1, m2] = until(
        () => r.sample(MUL, 2),
        ([a, b]) => a !== b,
      );
      const [n, k] = until(
        () => {
          const n = r.int(10001, 99999);
          return [n, r.int(1, 9)] as [number, number];
        },
        ([n, k]) => String(n).split('').filter((x) => +x === k).length === 1,
      );
      const X = n * m1,
        V = n * m2;
      const pos = String(V).length - 1 - String(V).indexOf(String(k));
      const val = k * 10 ** pos;
      return {
        q: `어떤 수를 $${c(m1)}$배 한 수를 읽으면 '${korNum(X)}'입니다. 어떤 수를 $${c(m2)}$배 한 수에서 숫자 $${k}$${josa(k, '이/가')} 나타내는 값은 얼마인가요?`,
        answer: { type: 'num', value: val },
        steps: [
          `'${korNum(X)}' $=${c(X)}$`,
          `끝의 $0$을 ${zs(m1)}개 지우면 어떤 수: $${c(n)}$`,
          `어떤 수의 $${c(m2)}$배: $${c(V)}$`,
          `숫자 $${k}$${josa(k, '은/는')} ${PLACE[pos]}의 자리 숫자 → $${c(val)}$`,
        ],
        hint: '먼저 읽은 수를 숫자로 쓰고 어떤 수를 구해요.',
      };
    },
  },
  {
    id: 'numline-big',
    title: '수직선의 눈금으로 큰 수 알아내기',
    gen(r, level) {
      const N = level === 1 ? 10 : 11;
      let st: number, i1: number, i2: number, V1: number;
      if (level === 1) {
        st = r.pick([1e3, 1e4, 1e5, 1e6]);
        i1 = 0;
        i2 = 10;
        V1 = r.int(1, 9) * 10 * st + r.pick([0, 0, 1, 2]) * 100 * st;
      } else if (level === 2) {
        st = r.pick([1e5, 2e5, 5e5, 1e6, 2e6, 5e6, 2e7, 5e7]);
        i1 = r.int(1, 4);
        i2 = i1 + r.pick([4, 5]);
        V1 = r.int(i1 + 1, 40) * st;
      } else {
        st = r.pick([25e5, 4e6, 25e6, 4e7, 25e5 * 2, 5e7, 15e6, 2e8]);
        i1 = r.int(3, 5);
        i2 = i1 + r.pick([3, 4, 5]);
        V1 = r.int(i1 + 2, 60) * st;
      }
      const V2 = V1 + (i2 - i1) * st;
      const val = (i: number) => V1 + (i - i1) * st;
      const ka = until(
        () => r.int(level === 3 ? 0 : 1, level === 3 ? i1 - 1 : N - 1),
        (k) => k !== i1 && k !== i2,
      );
      const kb = level === 3 ? r.int(i2 + 1, N) : -1;
      const ask = level === 3 ? r.pick(['a', 'diff']) : 'a';
      // 그림
      const s = new Svg(330, 74);
      const X = (i: number) => 18 + (i * 294) / N;
      s.line(8, 40, 322, 40);
      for (let i = 0; i <= N; i++) s.line(X(i), 34, X(i), 46);
      s.text(X(i1), 60, korShort(V1), { size: 11 });
      s.text(X(i2), 60, korShort(V2), { size: 11 });
      s.text(X(ka), 18, '㉠', { size: 13, cls: 'acc' });
      s.line(X(ka), 25, X(ka), 33, { cls: 'acc', arrow: true });
      if (kb >= 0) {
        s.text(X(kb), 18, '㉡', { size: 13, cls: 'acc' });
        s.line(X(kb), 25, X(kb), 33, { cls: 'acc', arrow: true });
      }
      const A = val(ka),
        B = kb >= 0 ? val(kb) : 0;
      const ans = ask === 'a' ? A : B - A;
      const stepLine = `두 수의 차: $${c(V2)}-${c(V1)}=${c(V2 - V1)}$, 눈금 ${i2 - i1}칸 → 한 칸은 $${c(V2 - V1)}\\div${i2 - i1}=${c(st)}$`;
      const off = ka - i1;
      return {
        q: `수직선에서 ${ask === 'a' ? '㉠이 나타내는 수를' : '㉡이 나타내는 수와 ㉠이 나타내는 수의 차를'} 구하세요.`,
        fig: s.toString(),
        answer: { type: 'num', value: ans },
        steps: [
          stepLine,
          `㉠은 ${korShort(V1)}에서 ${off > 0 ? `오른쪽으로 ${off}칸` : `왼쪽으로 ${-off}칸`} → $${c(V1)}${off > 0 ? '+' : '-'}${c(st)}\\times${Math.abs(off)}=${c(A)}$`,
          ...(ask === 'diff' ? [`㉡은 ${korShort(V2)}에서 오른쪽으로 ${kb - i2}칸 → $${c(B)}$`, `차: ㉠에서 ㉡까지 ${kb - ka}칸 → $${c(st)}\\times${kb - ka}=${c(ans)}$`] : []),
          `답: $${c(ans)}$`,
        ],
        hint: '먼저 눈금 한 칸의 크기를 구해요.',
      };
    },
  },
];

const T1: Skill[] = [
  {
    id: 'top-digit-sum-count',
    title: '각 자리 숫자의 합이 정해진 수 세기',
    gen(r) {
      const [N, s] = r.pick([
        [5, 3],
        [6, 3],
        [7, 3],
        [8, 3],
        [9, 3],
        [5, 4],
        [6, 4],
      ]);
      // 개수 (자리별로 세기)
      const ways = (len: number, tot: number): number => (len === 0 ? (tot === 0 ? 1 : 0) : range(0, Math.min(9, tot)).reduce((a, d) => a + ways(len - 1, tot - d), 0));
      let cnt = 0;
      for (let f = 1; f <= s; f++) cnt += ways(N - 1, s - f);
      const m = N - 1;
      const p2 = (m * (m - 1)) / 2;
      const p3 = (m * (m - 1) * (m - 2)) / 6;
      const ex = num([1, ...Array(N - 3).fill(0), s - 1, 0].slice(0, N));
      const steps =
        s === 3
          ? [
              `맨 앞자리 숫자가 $3$일 때: 나머지는 모두 $0$ → $1$개`,
              `맨 앞자리 숫자가 $2$일 때: 나머지 ${m}자리 중 한 곳만 $1$ → $${m}$개`,
              `맨 앞자리 숫자가 $1$일 때 (나머지 합 $2$): 한 곳이 $2$ → $${m}$개, 두 곳이 $1$ → $${range(1, m - 1)
                .reverse()
                .join('+')}=${p2}$개`,
              `모두: $1+${m}+${m}+${p2}=${cnt}$ (개)`,
            ]
          : [
              `맨 앞자리 숫자가 $4$일 때: $1$개, $3$일 때: 나머지 ${m}자리 중 한 곳이 $1$ → $${m}$개`,
              `맨 앞자리 숫자가 $2$일 때 (나머지 합 $2$): 한 곳이 $2$ → $${m}$개, 두 곳이 $1$ → $${p2}$개`,
              `맨 앞자리 숫자가 $1$일 때 (나머지 합 $3$): 한 곳이 $3$ → $${m}$개`,
              `$2$와 $1$을 한 곳씩 → $${m}\\times${m - 1}=${m * (m - 1)}$개, 세 곳이 $1$ → $${p3}$개`,
              `모두: $1+${m}+${m}+${p2}+${m}+${m * (m - 1)}+${p3}=${cnt}$ (개)`,
            ];
      return {
        q: `각 자리 숫자의 합이 $${s}$인 ${KN[N]} 자리 수는 모두 몇 개인가요? (예: $${c(ex)}$)`,
        answer: { type: 'num', value: cnt, unit: '개' },
        steps: ['맨 앞자리에는 $0$이 올 수 없으므로, 맨 앞자리 숫자에 따라 경우를 나누어 세요.', ...steps],
        hint: '맨 앞자리 숫자가 무엇인지에 따라 나누어 세어 보세요.',
      };
    },
  },
  {
    id: 'top-two-box-compare',
    title: '□와 △가 있는 두 수의 크기 비교',
    gen(r) {
      const g = until(
        () => {
          const L = r.int(6, 8);
          const i = r.int(1, 2);
          const qlen = r.int(0, 1);
          const tail = L - i - 2 - qlen;
          const P = [r.int(1, 9), ...Array.from({ length: i - 1 }, () => r.int(0, 9))];
          const b = r.int(2, 7);
          const Q = Array.from({ length: qlen }, () => r.int(0, 9));
          const aj = r.int(1, 8);
          const TA = Array.from({ length: tail }, () => r.int(0, 9));
          const TB = Array.from({ length: tail }, () => r.int(0, 9));
          return { L, i, qlen, tail, P, b, Q, aj, TA, TB, gt: r.chance(0.5) };
        },
        (g) => g.tail >= 1 && num(g.TA) !== num(g.TB),
      );
      const { L, i, P, b, Q, aj, TA, TB, gt } = g;
      const A = (x: number) => num([...P, x, ...Q, aj, ...TA]);
      const B = (y: number) => num([...P, b, ...Q, y, ...TB]);
      const ok = (x: number, y: number) => (gt ? A(x) > B(y) : A(x) < B(y));
      let total = 0,
        cBig = 0,
        cEq = 0;
      for (let x = 0; x <= 9; x++)
        for (let y = 0; y <= 9; y++)
          if (ok(x, y)) {
            total++;
            if (x === b) cEq++;
            else cBig++;
          }
      const tA = [...P.map(String), '\\square', ...[...Q, aj, ...TA].map(String)];
      const tB = [...[...P, b, ...Q].map(String), '\\triangle', ...TB.map(String)];
      const grp = (ds: string[]) => {
        const out: string[] = [];
        ds.forEach((d0, k) => {
          out.push(d0);
          const fromRight = ds.length - 1 - k;
          if (fromRight > 0 && fromRight % 3 === 0) out.push('{,}');
        });
        return out.join('');
      };
      const posBox = PLACE[L - 1 - i],
        posTri = PLACE[L - 1 - (i + 1 + Q.length)];
      const tailCmp = num(TA) > num(TB);
      return {
        q: `□와 △에는 $0$부터 $9$까지의 숫자가 들어갈 수 있습니다 (같은 숫자가 들어가도 됩니다). 다음 식이 성립하도록 (□, △)를 정하는 방법은 모두 몇 가지인가요? $$${grp(tA)}\\;${gt ? '>' : '<'}\\;${grp(tB)}$$`,
        answer: { type: 'num', value: total, unit: '가지' },
        steps: [
          `두 수는 ${KN[L]} 자리 수로 자리 수가 같아요. 높은 자리부터 비교하면 처음 달라질 수 있는 곳은 □가 있는 ${posBox}의 자리예요.`,
          gt
            ? `□가 $${b}$보다 클 때 (□$=${b + 1}$~$9$): △는 아무 숫자나 돼요 → $${9 - b}\\times10=${cBig}$가지`
            : `□가 $${b}$보다 작을 때 (□$=0$~$${b - 1}$): △는 아무 숫자나 돼요 → $${b}\\times10=${cBig}$가지`,
          `□가 $${b}$보다 ${gt ? '작으면' : '크면'} 식이 성립하지 않아요.`,
          `□$=${b}$일 때: ${posTri}의 자리에서 $${aj}$와 △를 비교해요. △가 $${aj}$보다 ${gt ? '작은' : '큰'} 경우 $${gt ? aj : 9 - aj}$가지`,
          `△$=${aj}$이면 그 아래 자리 $${TA.join('')}$와 $${TB.join('')}$를 비교 → ${(gt ? tailCmp : !tailCmp) ? '성립해요 ($1$가지)' : '성립하지 않아요'} → □$=${b}$일 때 $${cEq}$가지`,
          `모두: $${cBig}+${cEq}=${total}$ (가지)`,
        ],
        hint: '□가 아래 수의 같은 자리 숫자보다 클 때, 같을 때, 작을 때로 나누어 생각해요.',
      };
    },
  },
];

// ═════════════ e4a-2 각도 ═════════════
const SQ = [30, 45, 60];
const U2: Skill[] = [
  {
    id: 'set-square',
    title: '삼각자를 붙이거나 겹쳐서 만든 각',
    gen(r, level) {
      if (level === 1) {
        const [a, b] = until(
          () => [r.pick(SQ), r.pick(SQ)],
          ([a, b]) => a + b <= 120,
        );
        const U = ray(a, 1);
        const P: Record<string, Pt> = { O: [0, 0], A: [Math.cos((a * Math.PI) / 180), 0], U, V: ray(a + b, 1 / Math.cos((b * Math.PI) / 180)) };
        const fig = geoFig({
          P,
          polys: [
            ['O', 'A', 'U'],
            ['O', 'U', 'V'],
          ],
          angles: [
            { at: 'A', a: 'O', b: 'U', right: true },
            { at: 'U', a: 'O', b: 'V', right: true },
            { at: 'O', a: 'A', b: 'U', text: `${a}°` },
            { at: 'O', a: 'U', b: 'V', text: `${b}°` },
          ],
          labels: [],
          w: 240,
          h: 190,
        });
        return {
          q: `삼각자 두 개를 그림과 같이 붙여 놓았습니다. 두 삼각자로 만든 가장 큰 각 (바깥쪽 두 변 사이의 각)은 몇 도인가요?`,
          fig,
          answer: { type: 'num', value: a + b, unit: '°' },
          steps: [`붙여 놓은 두 각의 합을 구해요.`, `$${a}^{\\circ}+${b}^{\\circ}=${a + b}^{\\circ}$`],
        };
      }
      if (level === 2) {
        const [a, b] = r.pick([
          [60, 30],
          [60, 45],
          [45, 30],
        ]);
        const c1 = 1,
          c2 = r.pick([0.7, 1.25]);
        const P: Record<string, Pt> = {
          O: [0, 0],
          A1: [c1, 0],
          U1: [c1, c1 * Math.tan((a * Math.PI) / 180)],
          A2: [c2, 0],
          U2: [c2, c2 * Math.tan((b * Math.PI) / 180)],
        };
        const fig = geoFig({
          P,
          polys: [
            ['O', 'A1', 'U1'],
            ['O', 'A2', 'U2'],
          ],
          angles: [
            { at: 'A1', a: 'O', b: 'U1', right: true },
            { at: 'A2', a: 'O', b: 'U2', right: true },
            { at: 'U1', a: 'O', b: 'A1', text: `${90 - a}°` },
            { at: 'U2', a: 'O', b: 'A2', text: `${90 - b}°` },
            { at: 'O', a: 'U2', b: 'U1', text: '㉠' },
          ],
          labels: [],
          w: 250,
          h: 190,
        });
        return {
          q: `삼각자 두 개를 그림과 같이 한 꼭짓점과 한 변이 겹치도록 놓았습니다. ㉠의 각도는 몇 도인가요?`,
          fig,
          answer: { type: 'num', value: a - b, unit: '°' },
          steps: [
            `큰 각이 있는 삼각자: 왼쪽 아래 각 $=180^{\\circ}-90^{\\circ}-${90 - a}^{\\circ}=${a}^{\\circ}$`,
            `작은 각이 있는 삼각자: 왼쪽 아래 각 $=180^{\\circ}-90^{\\circ}-${90 - b}^{\\circ}=${b}^{\\circ}$`,
            `㉠ $=${a}^{\\circ}-${b}^{\\circ}=${a - b}^{\\circ}$`,
          ],
          hint: '삼각형의 세 각의 합은 180°예요.',
        };
      }
      const a = r.pick(SQ),
        b = r.pick(SQ);
      const side = r.chance(0.5);
      const ta = Math.tan((a * Math.PI) / 180),
        tb = Math.tan((b * Math.PI) / 180);
      const P: Record<string, Pt> = {
        L0: [-0.18, 0],
        L1: [1.18, 0],
        Pa: [0, 0],
        Ra: [0.85, 0],
        Ta: [0.85, 0.85 * ta],
        Qb: [1, 0],
        Rb: [0.15, 0],
        Tb: [0.15, 0.85 * tb],
      };
      P.X = meet(P.Pa, [1, ta], P.Qb, [-1, tb]);
      const fig = geoFig({
        P,
        polys: [
          ['Pa', 'Ra', 'Ta'],
          ['Qb', 'Rb', 'Tb'],
        ],
        segs: [{ a: 'L0', b: 'L1' }],
        angles: [
          { at: 'Ra', a: 'Pa', b: 'Ta', right: true },
          { at: 'Rb', a: 'Qb', b: 'Tb', right: true },
          { at: 'Ta', a: 'Pa', b: 'Ra', text: `${90 - a}°` },
          { at: 'Tb', a: 'Qb', b: 'Rb', text: `${90 - b}°` },
          side ? { at: 'X', a: 'Pa', b: 'Tb', text: '㉠' } : { at: 'X', a: 'Pa', b: 'Qb', text: '㉠' },
        ],
        labels: [],
        w: 270,
        h: 200,
      });
      const low = 180 - a - b;
      return {
        q: `삼각자 두 개를 그림과 같이 일직선 위에 겹쳐 놓았습니다. ㉠의 각도는 몇 도인가요?`,
        fig,
        answer: { type: 'num', value: side ? a + b : low, unit: '°' },
        steps: [
          `왼쪽 삼각자에서 일직선 위의 각: $180^{\\circ}-90^{\\circ}-${90 - a}^{\\circ}=${a}^{\\circ}$`,
          `오른쪽 삼각자에서 일직선 위의 각: $180^{\\circ}-90^{\\circ}-${90 - b}^{\\circ}=${b}^{\\circ}$`,
          `두 빗변과 일직선이 만드는 삼각형에서 두 빗변이 만나는 점의 아래쪽 각: $180^{\\circ}-${a}^{\\circ}-${b}^{\\circ}=${low}^{\\circ}$`,
          side ? `㉠은 그 각과 합쳐 일직선을 이루므로 $180^{\\circ}-${low}^{\\circ}=${a + b}^{\\circ}$` : `답: $${low}^{\\circ}$`,
        ],
        hint: '삼각자의 각을 먼저 알아내고, 삼각형의 세 각의 합을 이용해요.',
      };
    },
  },
  {
    id: 'clock-kind-count',
    title: '여러 시각에서 예각·둔각인 경우 세기',
    gen(r, level) {
      const ang = (h: number, m: number) => {
        const x = Math.abs(30 * (h % 12) + m / 2 - 6 * m);
        return Math.min(x, 360 - x);
      };
      const kindOf = (a: number) => (a > 0 && a < 90 ? 'acute' : a === 90 ? 'right' : a > 90 && a < 180 ? 'obtuse' : 'none');
      const KN2: Record<string, string> = { acute: '예각', obtuse: '둔각', right: '직각' };
      let times: [number, number][];
      let intro: string;
      if (level === 1) {
        const h1 = r.int(1, 5),
          h2 = r.int(h1 + 5, 12);
        times = range(h1, h2).map((h) => [h, 0]);
        intro = `$${h1}$시부터 $${h2}$시까지 정각마다 시계를 보았습니다.`;
      } else if (level === 2) {
        const h1 = r.int(1, 5),
          h2 = r.int(h1 + 4, 11);
        times = range(h1, h2).map((h) => [h, 30]);
        intro = `$${h1}$시 $30$분, $${h1 + 1}$시 $30$분, …, $${h2}$시 $30$분에 시계를 보았습니다.`;
      } else {
        const h1 = r.int(1, 6),
          h2 = r.int(h1 + 3, 11);
        times = [];
        for (let h = h1; h <= h2; h++) {
          times.push([h, 0]);
          if (h < h2) times.push([h, 30]);
        }
        intro = `$${h1}$시 정각부터 $${h2}$시 정각까지 $30$분마다 시계를 보았습니다.`;
      }
      const as = times.map(([h, m]) => ang(h, m));
      const cnt = (k: string) => as.filter((a) => kindOf(a) === k).length;
      let diffAsk = level === 3 && r.chance(0.5);
      if (diffAsk && cnt('acute') === cnt('obtuse')) diffAsk = false;
      let kind = level === 1 ? r.pick(['acute', 'obtuse', 'obtuse']) : r.pick(['acute', 'obtuse']);
      if (cnt(kind) === 0) kind = kind === 'acute' ? 'obtuse' : 'acute';
      const ans = diffAsk ? Math.abs(cnt('acute') - cnt('obtuse')) : cnt(kind);
      const list = times.map(([h, m], i) => `${h}시${m ? ' 30분' : ''} $${as[i]}^{\\circ}$`).join(', ');
      const special = as.some((a) => kindOf(a) === 'none' || a === 90);
      return {
        q: `${intro} 긴바늘과 짧은바늘이 이루는 작은 쪽의 각이 ${diffAsk ? '예각인 경우와 둔각인 경우는 몇 번 차이가 나나요?' : `${KN2[kind]}인 경우는 모두 몇 번인가요?`}`,
        answer: { type: 'num', value: ans, unit: '번' },
        steps: [
          level === 1 ? '시계의 숫자 사이는 $30^{\\circ}$예요.' : '짧은바늘은 $30$분 동안 숫자 사이의 반($15^{\\circ}$)만큼 움직여요. 긴바늘이 $6$을 가리킬 때 짧은바늘은 두 숫자의 한가운데에 있어요.',
          `각 시각의 작은 쪽 각: ${list}`,
          ...(special ? ['$90^{\\circ}$는 직각이고, $0^{\\circ}$와 $180^{\\circ}$는 예각도 둔각도 아니에요.'] : []),
          diffAsk ? `예각 $${cnt('acute')}$번, 둔각 $${cnt('obtuse')}$번 → 차: $${ans}$번` : `${KN2[kind]}: $${ans}$번`,
        ],
        hint: '시각마다 두 바늘 사이의 각을 구해 보세요.',
      };
    },
  },
  {
    id: 'dart-angle',
    title: '삼각형 안의 점으로 만든 각 (오목한 사각형)',
    gen(r, level) {
      const g = until(
        () => {
          const a = r.int(8, 16) * 5;
          const B0 = r.int(8, Math.min(18, (180 - a - 40) / 5)) * 5;
          const C0 = 180 - a - B0;
          const b = r.int(3, 7) * 5,
            cc = r.int(3, 7) * 5;
          return { a, B0, C0, b, cc };
        },
        (g) => g.C0 >= 40 && g.B0 - g.b >= 15 && g.C0 - g.cc >= 15,
      );
      const { a, B0, C0, b, cc } = g;
      const x = B0 - b,
        y = C0 - cc; // 각 ㄹㄴㄷ, 각 ㄹㄷㄴ
      const D0 = 180 - x - y; // 각 ㄴㄹㄷ = a + b + cc
      const P: Record<string, Pt> = { ㄴ: [0, 0], ㄷ: [1, 0] };
      P['ㄱ'] = meet(P['ㄴ'], dir(B0), P['ㄷ'], dir(180 - C0));
      P['ㄹ'] = meet(P['ㄴ'], dir(x), P['ㄷ'], dir(180 - y));
      const labelDir: Record<string, Pt> = { ㄹ: [0, 1], ㄱ: [0, 1], ㄴ: [-1, -0.4], ㄷ: [1, -0.4] };
      if (level === 1) {
        const fig = geoFig({
          P,
          polys: [['ㄱ', 'ㄴ', 'ㄷ']],
          segs: [
            { a: 'ㄴ', b: 'ㄹ' },
            { a: 'ㄷ', b: 'ㄹ' },
          ],
          angles: [
            { at: 'ㄴ', a: 'ㄹ', b: 'ㄷ', text: `${x}°` },
            { at: 'ㄷ', a: 'ㄴ', b: 'ㄹ', text: `${y}°` },
            { at: 'ㄹ', a: 'ㄴ', b: 'ㄷ', text: '?' },
          ],
          labelDir,
          w: 300,
          h: 230,
        });
        return {
          q: `삼각형 ㄱㄴㄷ 안에 점 ㄹ을 잡고 선분 ㄴㄹ, ㄷㄹ을 그었습니다. 각 ㄹㄴㄷ이 ${deg(x)}, 각 ㄹㄷㄴ이 ${deg(y)}일 때, 각 ㄴㄹㄷ은 몇 도인가요?`,
          fig,
          answer: { type: 'num', value: D0, unit: '°' },
          steps: [`삼각형 ㄹㄴㄷ의 세 각의 합은 $180^{\\circ}$`, `각 ㄴㄹㄷ $=180^{\\circ}-${x}^{\\circ}-${y}^{\\circ}=${D0}^{\\circ}$`],
        };
      }
      if (level === 2) {
        const fig = geoFig({
          P,
          polys: [['ㄱ', 'ㄴ', 'ㄷ']],
          segs: [
            { a: 'ㄴ', b: 'ㄹ' },
            { a: 'ㄷ', b: 'ㄹ' },
          ],
          angles: [
            { at: 'ㄴ', a: 'ㄱ', b: 'ㄹ', text: `${b}°` },
            { at: 'ㄷ', a: 'ㄹ', b: 'ㄱ', text: `${cc}°` },
            { at: 'ㄹ', a: 'ㄴ', b: 'ㄷ', text: '?' },
          ],
          labelDir,
          w: 300,
          h: 230,
        });
        return {
          q: `삼각형 ㄱㄴㄷ에서 각 ㄱㄴㄷ은 ${deg(B0)}, 각 ㄱㄷㄴ은 ${deg(C0)}입니다. 삼각형 안의 점 ㄹ에 대하여 각 ㄱㄴㄹ이 ${deg(b)}, 각 ㄱㄷㄹ이 ${deg(cc)}일 때, 각 ㄴㄹㄷ은 몇 도인가요?`,
          fig,
          answer: { type: 'num', value: D0, unit: '°' },
          steps: [
            `각 ㄹㄴㄷ $=${B0}^{\\circ}-${b}^{\\circ}=${x}^{\\circ}$`,
            `각 ㄹㄷㄴ $=${C0}^{\\circ}-${cc}^{\\circ}=${y}^{\\circ}$`,
            `각 ㄴㄹㄷ $=180^{\\circ}-${x}^{\\circ}-${y}^{\\circ}=${D0}^{\\circ}$`,
          ],
        };
      }
      const rev = r.chance(0.4);
      const fig = geoFig({
        P,
        polys: [['ㄱ', 'ㄴ', 'ㄹ', 'ㄷ']],
        angles: [
          { at: 'ㄱ', a: 'ㄴ', b: 'ㄷ', text: `${a}°` },
          { at: 'ㄴ', a: 'ㄱ', b: 'ㄹ', text: `${b}°` },
          { at: 'ㄷ', a: 'ㄹ', b: 'ㄱ', text: rev ? '?' : `${cc}°` },
          { at: 'ㄹ', a: 'ㄴ', b: 'ㄷ', text: rev ? `${D0}°` : '?' },
        ],
        labelDir,
        w: 300,
        h: 230,
      });
      return {
        q: rev
          ? `그림과 같은 오목한 사각형 ㄱㄴㄹㄷ에서 각 ㄴㄱㄷ은 ${deg(a)}, 각 ㄱㄴㄹ은 ${deg(b)}이고, 오목한 부분의 바깥쪽 각 ㄴㄹㄷ은 ${deg(D0)}입니다. 각 ㄱㄷㄹ은 몇 도인가요?`
          : `그림과 같은 오목한 사각형 ㄱㄴㄹㄷ에서 각 ㄴㄱㄷ은 ${deg(a)}, 각 ㄱㄴㄹ은 ${deg(b)}, 각 ㄱㄷㄹ은 ${deg(cc)}입니다. 오목한 부분의 바깥쪽 각 ㄴㄹㄷ은 몇 도인가요?`,
        fig,
        answer: { type: 'num', value: rev ? cc : D0, unit: '°' },
        steps: [
          '보조선 ㄴㄷ을 그어 삼각형 ㄱㄴㄷ과 삼각형 ㄹㄴㄷ을 만들어요.',
          `삼각형 ㄱㄴㄷ: 각 ㄱ $+$ (각 ㄱㄴㄹ $+$ 각 ㄹㄴㄷ) $+$ (각 ㄱㄷㄹ $+$ 각 ㄹㄷㄴ) $=180^{\\circ}$`,
          `삼각형 ㄹㄴㄷ: 각 ㄴㄹㄷ $+$ 각 ㄹㄴㄷ $+$ 각 ㄹㄷㄴ $=180^{\\circ}$`,
          '두 식을 비교하면 각 ㄴㄹㄷ $=$ 각 ㄱ $+$ 각 ㄱㄴㄹ $+$ 각 ㄱㄷㄹ',
          rev ? `각 ㄱㄷㄹ $=${D0}^{\\circ}-${a}^{\\circ}-${b}^{\\circ}=${cc}^{\\circ}$` : `각 ㄴㄹㄷ $=${a}^{\\circ}+${b}^{\\circ}+${cc}^{\\circ}=${D0}^{\\circ}$`,
        ],
        hint: '점 ㄴ과 점 ㄷ을 잇는 보조선을 그어 보세요.',
      };
    },
  },
];

const T2: Skill[] = [
  {
    id: 'top-fold-rect',
    title: '직사각형 종이를 접었을 때 생기는 각',
    gen(r) {
      const t = r.int(2, 8) * 5;
      const H = 1,
        W = 1.75;
      const m = H * Math.tan((t * Math.PI) / 180);
      const P: Record<string, Pt> = {
        ㄱ: [0, H],
        ㄴ: [0, 0],
        ㄷ: [W, 0],
        ㄹ: [W, H],
        ㅁ: [m, 0],
        ㅂ: [H * Math.sin((2 * t * Math.PI) / 180), H - H * Math.cos((2 * t * Math.PI) / 180)],
      };
      type K = 't' | 'u' | 'v' | 'w';
      const V: Record<K, number> = { t, u: 90 - t, v: 2 * t, w: 90 - 2 * t };
      const NAME: Record<K, string> = { t: '각 ㄴㄱㅁ', u: '각 ㄱㅁㄴ', v: '각 ㅂㅁㄷ', w: '각 ㄹㄱㅂ' };
      const ARC: Record<K, { at: string; a: string; b: string }> = {
        t: { at: 'ㄱ', a: 'ㄴ', b: 'ㅁ' },
        u: { at: 'ㅁ', a: 'ㄱ', b: 'ㄴ' },
        v: { at: 'ㅁ', a: 'ㅂ', b: 'ㄷ' },
        w: { at: 'ㄱ', a: 'ㄹ', b: 'ㅂ' },
      };
      const [gk, ak] = r.pick<[K, K]>([
        ['v', 'w'],
        ['w', 'v'],
        ['u', 'w'],
        ['w', 'u'],
        ['v', 't'],
        ['t', 'v'],
        ['u', 'v'],
        ['v', 'u'],
      ]);
      const fig = geoFig({
        P,
        segs: [
          { a: 'ㄱ', b: 'ㄹ' },
          { a: 'ㄹ', b: 'ㄷ' },
          { a: 'ㄷ', b: 'ㅁ' },
          { a: 'ㅁ', b: 'ㄴ', dash: true },
          { a: 'ㄴ', b: 'ㄱ', dash: true },
          { a: 'ㄱ', b: 'ㅁ' },
          { a: 'ㄱ', b: 'ㅂ' },
          { a: 'ㅂ', b: 'ㅁ' },
        ],
        angles: [
          { ...ARC[gk], text: `${V[gk]}°` },
          { ...ARC[ak], text: '?' },
        ],
        labelDir: { ㄱ: [-1, 1], ㄴ: [-1, -1], ㄷ: [1, -1], ㄹ: [1, 1], ㅁ: [0, -1], ㅂ: [0.6, -0.4] },
        w: 280,
        h: 190,
      });
      const toT: string[] =
        gk === 't'
          ? []
          : gk === 'u'
            ? [`삼각형 ㄱㄴㅁ에서 각 ㄴㄱㅁ $=180^{\\circ}-90^{\\circ}-${V.u}^{\\circ}=${t}^{\\circ}$`]
            : gk === 'v'
              ? [`선분 ㄴㄷ은 일직선이므로 각 ㄱㅁㄴ $+$ 각 ㄱㅁㅂ $=180^{\\circ}-${V.v}^{\\circ}=${180 - V.v}^{\\circ}$`, `두 각의 크기가 같으므로 각 ㄱㅁㄴ $=${180 - V.v}^{\\circ}\\div2=${V.u}^{\\circ}$`, `삼각형 ㄱㄴㅁ에서 각 ㄴㄱㅁ $=180^{\\circ}-90^{\\circ}-${V.u}^{\\circ}=${t}^{\\circ}$`]
              : [`각 ㄴㄱㅂ $=90^{\\circ}-${V.w}^{\\circ}=${2 * t}^{\\circ}$`, `각 ㄴㄱㅁ과 각 ㅂㄱㅁ의 크기가 같으므로 각 ㄴㄱㅁ $=${2 * t}^{\\circ}\\div2=${t}^{\\circ}$`];
      const fromT: string[] =
        ak === 't' || (gk === 'v' && ak === 'u')
          ? []
          : ak === 'u'
            ? [`삼각형 ㄱㄴㅁ에서 각 ㄱㅁㄴ $=180^{\\circ}-90^{\\circ}-${t}^{\\circ}=${V.u}^{\\circ}$`]
            : ak === 'w'
              ? [`각 ㄴㄱㅂ $=${t}^{\\circ}+${t}^{\\circ}=${2 * t}^{\\circ}$`, `각 ㄹㄱㅂ $=90^{\\circ}-${2 * t}^{\\circ}=${V.w}^{\\circ}$`]
              : [
                  ...(gk === 'u' ? [] : [`삼각형 ㄱㄴㅁ에서 각 ㄱㅁㄴ $=180^{\\circ}-90^{\\circ}-${t}^{\\circ}=${V.u}^{\\circ}$`]),
                  `각 ㄱㅁㅂ $=$ 각 ㄱㅁㄴ $=${V.u}^{\\circ}$ → 각 ㅂㅁㄷ $=180^{\\circ}-${V.u}^{\\circ}-${V.u}^{\\circ}=${V.v}^{\\circ}$`,
                ];
      const mid = gk === 'u' && ak === 'v' ? [] : toT;
      return {
        q: `직사각형 모양의 종이 ㄱㄴㄷㄹ을 선분 ㄱㅁ을 따라 접었더니 꼭짓점 ㄴ이 점 ㅂ에 닿았습니다. ${NAME[gk]}이 ${deg(V[gk])}일 때, ${NAME[ak]}은 몇 도인가요?`,
        fig,
        answer: { type: 'num', value: V[ak], unit: '°' },
        steps: [
          '접은 부분은 접기 전과 모양과 크기가 같아요: 각 ㄴㄱㅁ $=$ 각 ㅂㄱㅁ, 각 ㄱㅁㄴ $=$ 각 ㄱㅁㅂ, 각 ㄱㅂㅁ $=$ 각 ㄱㄴㅁ $=90^{\\circ}$',
          ...mid,
          ...fromT,
          `답: $${V[ak]}^{\\circ}$`,
        ],
        hint: '접힌 두 부분의 각의 크기가 같다는 것을 이용해요.',
      };
    },
  },
  {
    id: 'top-count-angle-kinds',
    title: '크고 작은 각 중 예각·둔각의 개수',
    gen(r) {
      const k = r.int(3, 4);
      const parts = until(
        () => {
          const p: number[] = [];
          let rem = 180;
          for (let i = 0; i < k; i++) {
            const v = r.int(3, 15) * 5;
            p.push(v);
            rem -= v;
          }
          p.push(rem);
          return p;
        },
        (p) => p.every((v) => v >= 15 && v <= 75),
      );
      const kind = r.pick(['acute', 'obtuse']);
      const isK = (a: number) => (kind === 'acute' ? a < 90 : a > 90 && a < 180);
      const n = parts.length;
      const groups: { len: number; vals: number[] }[] = [];
      let cnt = 0;
      for (let len = 1; len < n; len++) {
        const vals: number[] = [];
        for (let s0 = 0; s0 + len <= n; s0++) vals.push(sum(parts.slice(s0, s0 + len)));
        cnt += vals.filter(isK).length;
        groups.push({ len, vals });
      }
      // 그림: 일직선 위의 점 O 에서 반직선 (각 글자는 반지름을 번갈아 멀리)
      const names = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ'].slice(0, n + 1);
      const sv = new Svg(300, 170);
      const ox = 150,
        oy = 140,
        RL = 120;
      const pt = (a: number, rr: number): Pt => [ox + rr * Math.cos((a * Math.PI) / 180), oy - rr * Math.sin((a * Math.PI) / 180)];
      let acc = 180;
      names.forEach((nmz, i) => {
        const e = pt(acc, RL),
          lb = pt(acc, RL + 13);
        sv.line(ox, oy, e[0], e[1], { cls: 'acc' });
        sv.text(lb[0], lb[1], nmz, { size: 13 });
        if (i < n) {
          const a2 = acc - parts[i];
          sv.arc(ox, oy, i % 2 ? 30 : 22, a2, acc, { cls: 'acc2' });
          const tp = pt((acc + a2) / 2, i % 2 ? 82 : 56);
          sv.text(tp[0], tp[1], `${parts[i]}°`, { size: 12 });
          acc = a2;
        }
      });
      sv.dot(ox, oy);
      sv.text(ox, oy + 14, 'ㅇ', { size: 13 });
      const fig = sv.toString();
      const KN2 = kind === 'acute' ? '예각' : '둔각';
      return {
        q: `그림에서 선분 ${names[0]}${names[n]}은 일직선입니다. 그림에서 찾을 수 있는 크고 작은 각 중에서 ${KN2}은 모두 몇 개인가요? (일직선이 이루는 각은 세지 않습니다.)`,
        fig,
        answer: { type: 'num', value: cnt, unit: '개' },
        steps: [
          `작은 각을 $1$개, $2$개, …씩 이어 붙여 만든 각을 빠짐없이 모두 구해요.`,
          ...groups.map((g) => `작은 각 $${g.len}$개짜리: ${g.vals.map((v) => `$${v}^{\\circ}$`).join(', ')} → ${KN2} $${g.vals.filter(isK).length}$개`),
          `${kind === 'acute' ? '예각은 $0^{\\circ}$보다 크고 $90^{\\circ}$보다 작은 각' : '둔각은 $90^{\\circ}$보다 크고 $180^{\\circ}$보다 작은 각'}이에요. 모두 $${groups.map((g) => g.vals.filter(isK).length).join('+')}=${cnt}$ (개)`,
        ],
        hint: '작은 각 몇 개로 이루어진 각인지에 따라 나누어 세어 보세요.',
      };
    },
  },
];

// ═════════════ e4a-3 곱셈과 나눗셈 ═════════════
const U3: Skill[] = [
  {
    id: 'quot-rem-same',
    title: '몫과 나머지의 관계로 나누어지는 수 찾기',
    gen(r, level) {
      if (level === 1) {
        const d = r.int(12, 39);
        const v = r.chance(0.5) ? 'same' : 'one';
        const ans = v === 'same' ? d * (d - 1) + (d - 1) : d * d + (d - 1);
        return {
          q: `어떤 수를 $${d}$로 나누었더니 ${v === 'same' ? '몫과 나머지가 같았습니다' : '몫이 나머지보다 $1$ 컸습니다'}. 어떤 수가 될 수 있는 수 중에서 가장 큰 수를 구하세요.`,
          answer: { type: 'num', value: ans },
          steps: [
            `나머지는 나누는 수 $${d}$보다 작아야 하므로 가장 큰 나머지는 $${d - 1}$`,
            v === 'same' ? `몫도 $${d - 1}$` : `몫은 $${d - 1}+1=${d}$`,
            `어떤 수 $=${d}\\times${v === 'same' ? d - 1 : d}+${d - 1}=${c(ans)}$`,
          ],
          hint: '나머지가 될 수 있는 가장 큰 수부터 생각해요.',
        };
      }
      const L3 = level === 3;
      const [d, kind, list] = until(
        () => {
          const d = r.int(12, L3 ? 40 : 30);
          const kind = L3 ? r.pick(['r2q', 'q2r']) : 'same';
          const list: number[] = [];
          for (let n = 100; n <= 999; n++) {
            const q = Math.floor(n / d),
              rm = n % d;
            if (rm === 0) continue;
            if (kind === 'same' ? q === rm : kind === 'r2q' ? rm === 2 * q : q === 2 * rm) list.push(n);
          }
          return [d, kind, list] as [number, string, number[]];
        },
        ([, , l]) => l.length >= 2 && l.length <= 12,
      );
      const askMax = L3 && r.chance(0.4);
      const ans = askMax ? list[list.length - 1] : list.length;
      const cond = kind === 'same' ? '몫과 나머지가 같은' : kind === 'r2q' ? '나머지가 몫의 $2$배인' : '몫이 나머지의 $2$배인';
      const form = kind === 'same' ? `${d}\\times\\square+\\square=${d + 1}\\times\\square` : kind === 'r2q' ? `${d}\\times\\square+\\square\\times2=${d + 2}\\times\\square` : `${d}\\times(\\square\\times2)+\\square=${2 * d + 1}\\times\\square`;
      const qs = list.map((n) => (kind === 'q2r' ? n % d : Math.floor(n / d)));
      return {
        q: `세 자리 수 중에서 $${d}$로 나누었을 때 ${cond} 수${askMax ? '는 여러 개 있습니다. 그중 가장 큰 수를 구하세요.' : '는 모두 몇 개인가요?'}`,
        answer: askMax ? { type: 'num', value: ans } : { type: 'num', value: ans, unit: '개' },
        steps: [
          kind === 'q2r' ? `나머지를 □라 하면 몫은 □$\\times2$, 어떤 수 $=${form}$` : `몫을 □라 하면 ${kind === 'same' ? '나머지도 □' : '나머지는 □$\\times2$'}, 어떤 수 $=${form}$`,
          `나머지는 $${d}$보다 작아야 하므로 ${kind === 'r2q' ? `□$\\times2\\le${d - 1}$` : `□$\\le${d - 1}$`}`,
          `세 자리 수가 되는 □: $${qs[0]}$부터 $${qs[qs.length - 1]}$까지 → ${list.map((n) => `$${n}$`).join(', ')}`,
          askMax ? `가장 큰 수: $${ans}$` : `모두 $${ans}$개`,
        ],
        hint: '어떤 수 = (나누는 수)×(몫)+(나머지)로 나타내 보세요.',
      };
    },
  },
  {
    id: 'mul-missing-digit',
    title: '곱셈식의 지워진 숫자 추론하기',
    gen(r, level) {
      if (level === 1) {
        const A0 = until(
          () => [r.int(1, 9), r.int(0, 9), r.int(0, 9)],
          (a) => a[1] > 0,
        );
        const B = r.int(12, 49);
        const A = num(A0);
        const P = A * B;
        const zero = num([A0[0], 0, A0[2]]);
        return {
          q: `곱셈식에서 □ 안에 알맞은 숫자를 구하세요. $$${A0[0]}\\square${A0[2]}\\times${B}=${c(P)}$$`,
          answer: { type: 'num', value: A0[1] },
          steps: [
            `□가 $0$이라면 $${zero}\\times${B}=${c(zero * B)}$`,
            `□가 $1$ 커질 때마다 세 자리 수가 $10$ 커지므로 곱은 $10\\times${B}=${10 * B}$씩 커져요.`,
            `$${c(P)}-${c(zero * B)}=${c(P - zero * B)}$, $${c(P - zero * B)}\\div${10 * B}=${A0[1]}$`,
            `확인: $${A}\\times${B}=${c(P)}$ → □$=${A0[1]}$`,
          ],
          hint: '□에 0을 넣은 곱과 비교해 보세요.',
        };
      }
      if (level === 2) {
        const g = until(
          () => {
            const a1 = r.int(1, 9),
              a3 = r.int(1, 9),
              b1 = r.int(1, 9);
            const x = r.int(0, 9),
              y = r.int(1, 9);
            const P = num([a1, x, a3]) * num([b1, y]);
            const sols: [number, number][] = [];
            for (let p = 0; p <= 9; p++) for (let q = 0; q <= 9; q++) if (num([a1, p, a3]) * num([b1, q]) === P) sols.push([p, q]);
            return { a1, a3, b1, x, y, P, sols };
          },
          (g) => g.sols.length === 1 && g.a3 * g.y >= 10,
        );
        const { a1, a3, b1, x, y, P } = g;
        const last = P % 10;
        const cand = range(0, 9).filter((q) => (a3 * q) % 10 === last);
        return {
          q: `곱셈식에서 □와 △에 알맞은 숫자를 각각 구하세요. $$${a1}\\square${a3}\\times${b1}\\triangle=${c(P)}$$`,
          answer: {
            type: 'fields',
            fields: [
              { label: '□', value: x },
              { label: '△', value: y },
            ],
          },
          steps: [
            `곱의 일의 자리 숫자 $${last}$는 $${a3}\\times$△의 일의 자리 숫자와 같아요.`,
            `△가 될 수 있는 숫자: ${cand.map((q) => `$${q}$`).join(', ')}`,
            `각 경우에 □에 $0$부터 $9$까지 넣어 보면 곱이 $${c(P)}$${josa(P, '이/가')} 되는 것은 △$=${y}$, □$=${x}$일 때뿐이에요.`,
            `확인: $${num([a1, x, a3])}\\times${num([b1, y])}=${c(P)}$`,
          ],
          hint: '곱의 일의 자리 숫자부터 살펴보세요.',
        };
      }
      const g = until(
        () => {
          const a1 = r.int(2, 9),
            a3 = r.int(0, 9),
            b2 = r.int(0, 9);
          const mid = num([a1, r.int(0, 9), a3]) * num([r.int(1, 9), b2]);
          const lo = Math.floor(mid / 1000) * 1000 - r.pick([0, 1000]);
          const hi = lo + r.pick([2000, 3000]);
          const sols: [number, number][] = [];
          for (let p = 0; p <= 9; p++) for (let q = 1; q <= 9; q++) {
            const v = num([a1, p, a3]) * num([q, b2]);
            if (v > lo && v < hi) sols.push([p, q]);
          }
          return { a1, a3, b2, lo, hi, sols };
        },
        (g) => g.sols.length >= 3 && g.sols.length <= 10 && g.lo > 0,
      );
      const { a1, a3, b2, lo, hi, sols } = g;
      const byQ = new Map<number, number[]>();
      for (const [p, q] of sols) byQ.set(q, [...(byQ.get(q) ?? []), p]);
      return {
        q: `□와 △에 $0$부터 $9$까지의 숫자를 넣어 곱셈식을 만들려고 합니다 (△는 $0$이 아닙니다). 곱이 $${c(lo)}$보다 크고 $${c(hi)}$보다 작게 되는 (□, △)는 모두 몇 가지인가요? $$${a1}\\square${a3}\\times\\triangle${b2}$$`,
        answer: { type: 'num', value: sols.length, unit: '가지' },
        steps: [
          `어림하면 (세 자리 수)는 $${a1}00$쯤, (두 자리 수)는 △$0$쯤이에요. 먼저 △가 될 수 있는 숫자를 찾고, □를 하나씩 확인해요.`,
          ...[...byQ.entries()].sort((p, q) => p[0] - q[0]).map(([q, ps]) => `△$=${q}$: □$=${ps.join(', ')}$ → 예: $${num([a1, ps[0], a3])}\\times${num([q, b2])}=${c(num([a1, ps[0], a3]) * num([q, b2]))}$${ps.length > 1 ? `, $${num([a1, ps[ps.length - 1], a3])}\\times${num([q, b2])}=${c(num([a1, ps[ps.length - 1], a3]) * num([q, b2]))}$` : ''}`),
          `다른 △는 곱이 너무 작거나 커요. 모두 $${sols.length}$가지`,
        ],
        hint: '△가 하나 커질 때 곱이 얼마나 커지는지 어림해 보세요.',
      };
    },
  },
  {
    id: 'reverse-chain',
    title: '두 번 계산한 결과로 처음 수 구하기',
    gen(r, level) {
      if (level === 1) {
        const d = r.int(12, 35),
          qq = r.int(12, 40),
          k = r.int(2, 9);
        const R = qq * k,
          x = qq * d;
        return {
          q: `어떤 수를 $${d}$로 나누었더니 나누어떨어졌습니다. 그 몫에 $${k}$를 곱했더니 $${R}$이 되었습니다. 어떤 수는 얼마인가요?`,
          answer: { type: 'num', value: x },
          steps: [`거꾸로 생각해요. 몫 $=${R}\\div${k}=${qq}$`, `어떤 수 $=${qq}\\times${d}=${c(x)}$`],
          hint: '마지막 계산부터 거꾸로 되돌려요.',
        };
      }
      if (level === 2) {
        const [x, m, d] = until(
          () => [r.int(12, 99), r.int(12, 30), r.int(13, 45)],
          // 거꾸로 할 때 (세 자리 수)÷(두 자리 수)까지만 나오도록 (네 자리 수의 나눗셈은 배우지 않음)
          ([x, m, d]) => (x * m) % d !== 0 && x * m <= 999,
        );
        const P = x * m;
        const qq = Math.floor(P / d),
          rm = P % d;
        return {
          q: `어떤 수에 $${m}$을 곱한 다음 $${d}$로 나누었더니 몫이 $${qq}$이고 나머지가 $${rm}$${was(rm)}습니다. 어떤 수는 얼마인가요?`,
          answer: { type: 'num', value: x },
          steps: [`나누기 전의 수 $=${d}\\times${qq}+${rm}=${c(P)}$`, `어떤 수 $=${c(P)}\\div${m}=${x}$`],
          hint: '나누어지는 수 = (나누는 수)×(몫)+(나머지)',
        };
      }
      const d1 = r.int(12, 30),
        d2 = r.int(12, 25),
        q2 = r.int(2, 9),
        r2 = r.int(1, d2 - 1);
      const q1 = d2 * q2 + r2;
      const big = r.chance(0.4);
      const r1 = big ? d1 - 1 : r.int(1, d1 - 1);
      const x = q1 * d1 + r1;
      return {
        q: big
          ? `어떤 수를 $${d1}$로 나눈 몫을 다시 $${d2}$로 나누었더니 몫이 $${q2}$이고 나머지가 $${r2}$${was(r2)}습니다. 어떤 수가 될 수 있는 수 중에서 가장 큰 수를 구하세요.`
          : `어떤 수를 $${d1}$로 나누었더니 나머지가 $${r1}$${was(r1)}습니다. 이때의 몫을 다시 $${d2}$로 나누었더니 몫이 $${q2}$이고 나머지가 $${r2}$${was(r2)}습니다. 어떤 수는 얼마인가요?`,
        answer: { type: 'num', value: x },
        steps: [
          `처음 나눗셈의 몫 $=${d2}\\times${q2}+${r2}=${q1}$`,
          big ? `처음 나눗셈의 나머지는 $${d1}$보다 작아야 하므로 가장 큰 나머지는 $${d1 - 1}$` : `처음 나눗셈: 몫 $${q1}$, 나머지 $${r1}$`,
          `어떤 수 $=${d1}\\times${q1}+${r1}=${c(x)}$`,
        ],
        hint: '두 번째 나눗셈부터 거꾸로 되돌려요.',
      };
    },
  },
];

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MDAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const T3: Skill[] = [
  {
    id: 'top-consecutive-product',
    title: '곱을 보고 연속하는 수 어림하기',
    gen(r) {
      const v = r.pick(['two', 'two', 'three', 'even']);
      if (v === 'three') {
        const m = until(
          () => r.int(12, 39),
          (m) => m % 10 !== 0 && m % 10 !== 9 && m % 10 !== 1,
        );
        const P = (m - 1) * m * (m + 1);
        const T0 = Math.floor(m / 10) * 10;
        const last = P % 10;
        const cand = range(T0 + 1, T0 + 8).filter((x) => ((x - 1) * x * (x + 1)) % 10 === last);
        return {
          q: `연속하는 세 자연수의 곱이 $${c(P)}$입니다. 세 수 중 가운데 수는 얼마인가요?`,
          answer: { type: 'num', value: m },
          steps: [
            '세 수는 크기가 비슷하므로 가운데 수를 세 번 곱한 수와 곱이 비슷해요.',
            `$${T0}\\times${T0}\\times${T0}=${c(T0 ** 3)}$, $${T0 + 10}\\times${T0 + 10}\\times${T0 + 10}=${c((T0 + 10) ** 3)}$ → 가운데 수는 $${T0}$보다 크고 $${T0 + 10}$보다 작아요.`,
            `곱의 일의 자리 숫자가 $${last}$이 되는 경우: 가운데 수가 ${cand.map((x) => `$${x}$`).join(', ')}`,
            ...cand.map((x) => `$${x - 1}\\times${x}\\times${x + 1}=${c((x - 1) * x * (x + 1))}$`),
            `답: 가운데 수는 $${m}$`,
          ],
          hint: '같은 수를 세 번 곱한 수로 어림해 보세요.',
        };
      }
      const gap = v === 'even' ? 2 : 1;
      const n = until(
        () => (v === 'even' ? r.int(16, 49) * 2 : r.int(31, 98)),
        (n) => n % 10 !== 0,
      );
      const P = n * (n + gap);
      const T0 = Math.floor(n / 10) * 10;
      const last = P % 10;
      const cand = range(T0, T0 + 9).filter((x) => (v !== 'even' || x % 2 === 0) && (x * (x + gap)) % 10 === last);
      const askSum = r.chance(0.5);
      const ans = askSum ? 2 * n + gap : n + gap;
      return {
        q: `${v === 'even' ? '연속하는 두 짝수' : '연속하는 두 자연수'}의 곱이 $${c(P)}$입니다. ${askSum ? '두 수의 합을' : '두 수 중 큰 수를'} 구하세요.`,
        answer: { type: 'num', value: ans },
        steps: [
          '두 수는 크기가 비슷하므로 같은 수를 두 번 곱한 수로 어림해요.',
          `$${T0}\\times${T0}=${c(T0 * T0)}$, $${T0 + 10}\\times${T0 + 10}=${c((T0 + 10) ** 2)}$ → 작은 수는 $${T0}$대예요.`,
          `곱의 일의 자리 숫자가 $${last}$이므로 작은 수의 일의 자리 숫자를 따져 보면 작은 수는 ${cand.map((x) => `$${x}$`).join(', ')} 중 하나예요.`,
          ...cand.map((x) => `$${x}\\times${x + gap}=${c(x * (x + gap))}$`),
          `두 수는 $${n}$과 $${n + gap}$ → ${askSum ? `합: $${n}+${n + gap}=${ans}$` : `큰 수: $${n + gap}$`}`,
        ],
        hint: '몇십과 몇십의 곱으로 먼저 어림해 보세요.',
      };
    },
  },
  {
    id: 'top-weekday',
    title: '날수를 7로 나누어 요일 알아내기',
    gen(r) {
      const doy = (m: number, d: number) => sum(MDAYS.slice(0, m - 1)) + d;
      const [m1, d1, m2, d2] = until(
        () => {
          const m1 = r.int(1, 8);
          const m2 = r.int(m1 + 3, 12);
          return [m1, r.int(1, MDAYS[m1 - 1] - 1), m2, r.int(1, MDAYS[m2 - 1])];
        },
        ([m1, d1, m2, d2]) => (doy(m2, d2) - doy(m1, d1)) % 7 !== 0,
      );
      const w1 = r.int(0, 6);
      const D = doy(m2, d2) - doy(m1, d1);
      const rm = D % 7;
      const w2 = (w1 + rm) % 7;
      const left = MDAYS[m1 - 1] - d1;
      const mids = range(m1 + 1, m2 - 1);
      const feb = m1 <= 2 && m2 > 2;
      const ansT = `${DAYS[w2]}요일`;
      return {
        q: `어느 해 $${m1}$월 $${d1}$일은 ${DAYS[w1]}요일입니다. 같은 해 $${m2}$월 $${d2}$일은 무슨 요일인가요?${feb ? ' (그해 $2$월은 $28$일까지 있습니다.)' : ''}`,
        answer: makeChoices(
          r,
          ansT,
          DAYS.filter((_, i) => i !== w2).map((x) => `${x}요일`),
          5,
        ),
        steps: [
          `$${m1}$월 $${d1}$일 다음 날부터 $${m1}$월 말일까지: $${MDAYS[m1 - 1]}-${d1}=${left}$ (일)`,
          `${mids.map((m) => `$${m}$월`).join(', ')}: $${mids.map((m) => MDAYS[m - 1]).join('+')}=${sum(mids.map((m) => MDAYS[m - 1]))}$ (일)`,
          `$${m2}$월 $${d2}$일까지 $${d2}$일 → $${m2}$월 $${d2}$일은 $${m1}$월 $${d1}$일의 $${left}+${sum(mids.map((m) => MDAYS[m - 1]))}+${d2}=${D}$ (일) 후`,
          `요일은 $7$일마다 되풀이돼요: $${D}\\div7=${Math.floor(D / 7)}\\cdots${rm}$`,
          `${DAYS[w1]}요일에서 $${rm}$일 후의 요일 → ${ansT}`,
        ],
        hint: '두 날짜 사이의 날수를 구해 7로 나누어 보세요.',
      };
    },
  },
];

// ═════════════ e4a-4 평면도형의 이동 ═════════════
type Mv = { name: string; f: (x: Cells) => Cells; inv: string };
const R90 = '시계 방향으로 $90^{\\circ}$만큼 돌리기',
  R180 = '시계 방향으로 $180^{\\circ}$만큼 돌리기',
  R270 = '시계 반대 방향으로 $90^{\\circ}$만큼 돌리기';
const MV: Mv[] = [
  { name: '오른쪽으로 뒤집기', f: flipH, inv: '오른쪽(또는 왼쪽)으로 뒤집기' },
  { name: '왼쪽으로 뒤집기', f: flipH, inv: '왼쪽(또는 오른쪽)으로 뒤집기' },
  { name: '위쪽으로 뒤집기', f: flipV, inv: '위쪽(또는 아래쪽)으로 뒤집기' },
  { name: '아래쪽으로 뒤집기', f: flipV, inv: '아래쪽(또는 위쪽)으로 뒤집기' },
  { name: R90, f: (x) => rotN(x, 1), inv: R270 },
  { name: R180, f: (x) => rotN(x, 2), inv: '$180^{\\circ}$만큼 돌리기' },
  { name: R270, f: (x) => rotN(x, 3), inv: R90 },
];
const LAB = ['가', '나', '다', '라', '마', '바', '사'];
const ALL8 = (sh: Cells): Cells[] => [0, 1, 2, 3].flatMap((k) => [rotN(sh, k), rotN(flipH(sh), k)]);
/** 정답 도형과 다른 모양 3개로 보기 만들기 */
function shapeOpts(r: Rng, base: Cells, target: Cells): { opts: Cells[]; idx: number } {
  const tk = cellKey(target);
  const seen = new Set<string>([tk]);
  const others: Cells[] = [];
  for (const w of r.shuffle(ALL8(base)))
    if (!seen.has(cellKey(w))) {
      seen.add(cellKey(w));
      others.push(w);
    }
  const opts = r.shuffle([target, ...others.slice(0, 3)]);
  return { opts, idx: opts.findIndex((o) => cellKey(o) === tk) };
}
/** 숫자 없는 시계 (12시 자리 눈금만 굵게) */
function plainClock(h: number, m: number, size = 130): string {
  const s = new Svg(size, size);
  const cc = size / 2,
    R = cc - 6;
  s.circle(cc, cc, R);
  for (let i = 0; i < 60; i++) {
    const a = ((90 - i * 6) * Math.PI) / 180;
    const l = i === 0 ? 12 : i % 5 === 0 ? 7 : 3;
    s.line(cc + R * Math.cos(a), cc - R * Math.sin(a), cc + (R - l) * Math.cos(a), cc - (R - l) * Math.sin(a), { width: i === 0 ? 3 : i % 5 === 0 ? 1.5 : 0.8 });
  }
  const ha = ((90 - ((h % 12) + m / 60) * 30) * Math.PI) / 180;
  const ma = ((90 - m * 6) * Math.PI) / 180;
  s.line(cc, cc, cc + R * 0.5 * Math.cos(ha), cc - R * 0.5 * Math.sin(ha), { width: 4, cls: 'acc2' });
  s.line(cc, cc, cc + R * 0.78 * Math.cos(ma), cc - R * 0.78 * Math.sin(ma), { width: 2.5, cls: 'acc' });
  s.dot(cc, cc, { r: 3 });
  return s.toString();
}
const U4: Skill[] = [
  {
    id: 'inverse-move',
    title: '움직인 결과를 보고 처음 도형 찾기',
    gen(r, level) {
      const k = level;
      const seq = until(
        () => Array.from({ length: k }, () => r.pick(MV)),
        (sq) => sq.every((m, i) => i === 0 || m.f !== sq[i - 1].f),
      );
      const start = asymShape(r, level === 3 ? 4 : 3, level === 3 ? 6 : 5);
      let res = start;
      for (const m of seq) res = m.f(res);
      const { opts, idx } = shapeOpts(r, res, start);
      const size = level === 3 ? 4 : 3;
      const fig = cellsFig([{ cells: res, label: '결과', mark: true }, ...opts.map((o, i) => ({ cells: o, label: LAB[i] }))], size, { cs: size === 4 ? 10 : 12 });
      const desc = seq.map((m) => `'${m.name}'`).join(', ');
      return {
        q: `어떤 도형을 ${desc}${josa(seq[seq.length - 1].name, '을/를')} ${seq.length > 1 ? '차례로 ' : ''}했더니 '결과'와 같은 도형이 되었습니다. 처음 도형을 고르세요.`,
        fig,
        answer: { type: 'choice', choices: LAB.slice(0, opts.length), index: idx },
        steps: [
          '거꾸로 생각해요: 결과 도형을 마지막 움직임부터 반대로 되돌려요.',
          ...[...seq].reverse().map((m) => `'${m.name}' 되돌리기 → ${m.inv}`),
          `되돌린 도형: ${LAB[idx]}`,
        ],
        hint: '뒤집기는 같은 방향으로 한 번 더 뒤집으면, 돌리기는 반대 방향으로 돌리면 처음으로 돌아와요.',
      };
    },
  },
  {
    id: 'equiv-move',
    title: '여러 번 움직인 것과 같은 한 번의 움직임',
    gen(r, level) {
      const NAMED: { name: string; f: (x: Cells) => Cells }[] = [
        { name: '처음 도형과 같아요', f: (x) => x },
        { name: R90, f: (x) => rotN(x, 1) },
        { name: R180, f: (x) => rotN(x, 2) },
        { name: R270, f: (x) => rotN(x, 3) },
        { name: '오른쪽으로 뒤집기', f: flipH },
        { name: '위쪽으로 뒤집기', f: flipV },
      ];
      const BASIC = [MV[0], MV[2], MV[3], MV[4], MV[5], MV[6]];
      const test = asymShape(r, 4, 6);
      const named = (x: Cells) => NAMED.findIndex((n) => cellKey(n.f(test)) === cellKey(x));
      const ng = level === 1 ? 1 : level === 2 ? 2 : 3;
      const g = until(
        () => {
          const groups = Array.from({ length: ng }, () => ({ m: r.pick(BASIC), n: level === 2 ? 1 : r.int(2, 9) }));
          let x = test;
          const states: number[] = [];
          for (const gr of groups) {
            for (let i = 0; i < gr.n; i++) x = gr.m.f(x);
            states.push(named(x));
          }
          return { groups, states };
        },
        (g) => g.states.every((s) => s >= 0) && g.groups.every((gr, i) => i === 0 || gr.m.f !== g.groups[i - 1].m.f) && (level === 1 || g.states[g.states.length - 1] !== 0 || r.chance(0.2)),
      );
      const ai = g.states[g.states.length - 1];
      const desc = g.groups.map((gr) => (gr.n === 1 ? `'${gr.m.name}'` : `'${gr.m.name}'를 $${gr.n}$번`)).join(' 한 다음, ');
      const ge = g.groups.map((gr) => {
        let x = test;
        for (let i = 0; i < gr.n; i++) x = gr.m.f(x);
        return named(x);
      });
      const CW = [0, 90, 180, 270];
      const reduce = (gr: { m: Mv; n: number }) => {
        if (gr.m.f === flipH || gr.m.f === flipV) return `같은 방향으로 $2$번 뒤집으면 처음과 같으므로 ${gr.n}번 → ${gr.n % 2 ? `$1$번 뒤집은 것과 같아요` : '처음과 같아요'}`;
        const ccw = gr.m.name === R270;
        const dg = (gr.m.name === R180 ? 180 : 90) * gr.n;
        const rem = dg % 360;
        const way = ccw ? '시계 반대 방향으로 ' : '시계 방향으로 ';
        const note = rem === 270 ? ` (${ccw ? '시계 방향으로' : '시계 반대 방향으로'} $90^{\\circ}$만큼 돌린 것과 같아요)` : ccw && rem === 180 ? ' (시계 방향으로 $180^{\\circ}$만큼 돌린 것과 같아요)' : '';
        return `${way}모두 $${dg}^{\\circ}$ 돌린 셈 → $360^{\\circ}$마다 제자리이므로 ${rem === 0 ? '처음과 같아요' : `${way}$${rem}^{\\circ}$만큼 돌린 것과 같아요${note}`}`;
      };
      const isRot = (k: number) => k >= 1 && k <= 3;
      const isFlip = (k: number) => k >= 4;
      const explain = (prev: number, eff: number, res: number) => {
        if (eff === 0) return `이 움직임은 처음과 같으므로 그대로 '${NAMED[res].name}'`;
        if (prev === 0) return `'${NAMED[res].name}'`;
        if (isRot(prev) && isRot(eff)) {
          const t = CW[prev] + CW[eff];
          return `시계 방향으로 따지면 $${CW[prev]}^{\\circ}+${CW[eff]}^{\\circ}=${t}^{\\circ}$${t >= 360 ? `, $${t}^{\\circ}-360^{\\circ}=${t - 360}^{\\circ}$` : ''} → '${NAMED[res].name}'`;
        }
        if (isFlip(prev) && isFlip(eff)) return prev === eff ? '같은 방향으로 두 번 뒤집으면 처음과 같아요' : `좌우로 한 번, 위아래로 한 번 뒤집으면 $180^{\\circ}$ 돌린 것과 같아요 → '${NAMED[res].name}'`;
        return `$180^{\\circ}$ 돌리면 위아래와 좌우가 모두 바뀌므로, 한 방향 뒤집기와 합치면 다른 방향으로 뒤집은 것과 같아요 → '${NAMED[res].name}'`;
      };
      const usedDown = g.groups.some((gr) => gr.m === MV[3]);
      return {
        q: `도형을 ${desc} 했습니다. 처음 도형을 한 번만 움직여 같은 도형을 만들려면 어떻게 움직여야 하나요?`,
        answer: makeChoices(
          r,
          NAMED[ai].name,
          NAMED.filter((_, i) => i !== ai).map((n) => n.name),
          5,
        ),
        steps: [
          ...g.groups.filter((gr) => gr.n > 1).map((gr) => `'${gr.m.name}' ${gr.n}번: ${reduce(gr)}`),
          ...g.groups.slice(1).map((gr, i) => `${ORD[i + 1]} 움직임('${gr.m.name}'${gr.n > 1 ? ` ${gr.n}번` : ''})까지 하면: ${explain(g.states[i], ge[i + 1], g.states[i + 1])}`),
          ...(ai === 5 && usedDown ? ['아래쪽으로 뒤집기와 위쪽으로 뒤집기는 결과가 같아요.'] : []),
          `답: ${NAMED[ai].name}`,
        ],
        hint: '돌리기는 360°마다, 같은 방향 뒤집기는 2번마다 처음으로 돌아와요.',
      };
    },
  },
  {
    id: 'mirror-clock',
    title: '거울에 비친 시계로 실제 시각 알기',
    gen(r, level) {
      const h = until(
        () => r.int(1, 11),
        (h) => level > 1 || h !== 6,
      );
      const m = level === 1 ? 0 : level === 2 ? r.pick([15, 30, 45, 10, 20, 40, 50]) : r.int(1, 11) * 5;
      // 보이는 시각 = 12시 - 실제 시각
      const tot = (12 * 60 - ((h % 12) * 60 + m)) % 720;
      const sh = Math.floor(tot / 60) || 12,
        sm = tot % 60;
      const add = level === 3 ? r.int(5, 19) * 5 : 0;
      const t2 = ((h % 12) * 60 + m + add) % 720;
      const ah = Math.floor(t2 / 60) || 12,
        am = t2 % 60;
      return {
        q: `벽시계를 거울에 비추어 보았더니 그림과 같았습니다. (숫자가 없는 시계이고, 굵은 눈금이 $12$를 나타냅니다.) ${level === 3 ? `실제 시각에서 $${add}$분 후는 몇 시 몇 분인가요?` : '실제 시각은 몇 시 몇 분인가요?'}`,
        fig: plainClock(sh, sm),
        answer: {
          type: 'fields',
          fields: [
            { label: '시', value: ah },
            { label: '분', value: am },
          ],
        },
        steps: [
          '거울에 비친 모습은 시계를 오른쪽(또는 왼쪽)으로 뒤집은 모양이에요. 위아래는 그대로이고 왼쪽과 오른쪽이 바뀌어요.',
          `그림의 바늘은 $${sh}$시 $${sm}$분처럼 보여요.`,
          `좌우가 바뀌면 $12$를 기준으로 거꾸로 돌아간 만큼이 되므로 (보이는 시각)$+$(실제 시각)$=12$시`,
          `실제 시각: $12$시 $-$ $${sh}$시 $${sm}$분 $=$ $${h}$시 $${m}$분`,
          ...(level === 3 ? [`$${h}$시 $${m}$분에서 $${add}$분 후 → $${ah}$시 $${am}$분`] : []),
        ],
        hint: '거울 속에서는 왼쪽과 오른쪽이 바뀌어요.',
      };
    },
  },
];

const T4: Skill[] = [
  {
    id: 'top-board-moves',
    title: '수 판을 여러 번 움직였을 때 한 칸의 수',
    gen(r) {
      const n = 4;
      type BM = { name: string; src: (i: number, j: number) => [number, number] };
      const BMS: BM[] = [
        { name: '오른쪽으로 뒤집기', src: (i, j) => [i, n - 1 - j] },
        { name: '왼쪽으로 뒤집기', src: (i, j) => [i, n - 1 - j] },
        { name: '위쪽으로 뒤집기', src: (i, j) => [n - 1 - i, j] },
        { name: '아래쪽으로 뒤집기', src: (i, j) => [n - 1 - i, j] },
        { name: R90, src: (i, j) => [n - 1 - j, i] },
        { name: R180, src: (i, j) => [n - 1 - i, n - 1 - j] },
        { name: R270, src: (i, j) => [j, n - 1 - i] },
      ];
      const sig = (m: BM) => [m.src(0, 1), m.src(1, 3)].join('|');
      const k = r.int(3, 4);
      const seq = until(
        () => Array.from({ length: k }, () => r.pick(BMS)),
        (sq) => sq.every((m, i) => i === 0 || sig(m) !== sig(sq[i - 1])),
      );
      const start = range(0, n - 1).map((i) => range(0, n - 1).map((j) => i * n + j + 1));
      let bd = start;
      for (const m of seq) bd = range(0, n - 1).map((i) => range(0, n - 1).map((j) => { const [a, b] = m.src(i, j); return bd[a][b]; }));
      const [ti, tj] = [r.int(0, n - 1), r.int(0, n - 1)];
      const ans = bd[ti][tj];
      // 거꾸로 따라가기
      const trace: string[] = [];
      let [pi, pj] = [ti, tj];
      for (let s0 = seq.length - 1; s0 >= 0; s0--) {
        [pi, pj] = seq[s0].src(pi, pj);
        trace.push(`'${seq[s0].name}' 하기 전: 위에서 ${ORD[pi]} 줄, 왼쪽에서 ${ORD[pj]} 칸`);
      }
      if (start[pi][pj] !== ans) throw new Error('board trace');
      const cs = 26;
      const s = new Svg(n * cs + 20, n * cs + 20);
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          s.rect(10 + j * cs, 10 + i * cs, cs, cs, { cls: 'acc' });
          s.text(10 + j * cs + cs / 2, 10 + i * cs + cs / 2, String(start[i][j]), { size: 12 });
        }
      return {
        q: `그림과 같은 수 판을 ${seq.map((m) => `'${m.name}'`).join(', ')}의 순서로 움직였습니다. 움직인 뒤 위에서 ${ORD[ti]} 줄, 왼쪽에서 ${ORD[tj]} 칸에 있는 수는 무엇인가요?`,
        fig: s.toString(),
        answer: { type: 'num', value: ans },
        steps: [
          '판 전체를 다시 그리지 않고, 마지막에 그 칸에 온 수가 움직이기 전에 어디에 있었는지 거꾸로 따라가요.',
          `움직인 뒤: 위에서 ${ORD[ti]} 줄, 왼쪽에서 ${ORD[tj]} 칸`,
          ...trace,
          `처음 판의 그 칸에 있는 수: $${ans}$`,
        ],
        hint: '마지막 움직임부터 거꾸로, 그 칸이 어디에서 왔는지 생각해요.',
      };
    },
  },
  {
    id: 'top-same-shape-count',
    title: '돌리거나 뒤집어 같은 모양끼리 묶기',
    gen(r) {
      const rotOnly = r.chance(0.5);
      const canonAll = (x: Cells) => ALL8(x).map(cellKey).sort()[0];
      const canonRot = (x: Cells) => [0, 1, 2, 3].map((k) => cellKey(rotN(x, k))).sort()[0];
      const g = until(
        () => {
          const nb = r.int(2, 3);
          const bases: Cells[] = [];
          for (let t = 0; t < 50 && bases.length < nb; t++) {
            const b = asymShape(r, 4, 5);
            if (!bases.some((x) => canonAll(x) === canonAll(b))) bases.push(b);
          }
          const items: Cells[] = bases.map((b) => r.pick(ALL8(b)));
          while (items.length < 6) items.push(r.pick(ALL8(r.pick(bases))));
          const sh = r.shuffle(items);
          const key = rotOnly ? canonRot : canonAll;
          const cls = new Map<string, number[]>();
          sh.forEach((x, i) => cls.set(key(x), [...(cls.get(key(x)) ?? []), i]));
          const nAll = new Set(sh.map(canonAll)).size;
          return { sh, cls, nb: bases.length, nAll };
        },
        (g) => g.nb >= 2 && (!rotOnly || g.cls.size > g.nAll) && g.cls.size < 6,
      );
      const groups = [...g.cls.values()];
      const fig = cellsFig(
        g.sh.map((x, i) => ({ cells: x, label: LAB[i] })),
        4,
        { cs: 9 },
      );
      return {
        q: `다음 도형들 중에서 ${rotOnly ? '돌리기만 하여' : '돌리거나 뒤집어서'} 서로 완전히 겹쳐지는 것끼리는 같은 모양이라고 합니다. 서로 다른 모양은 모두 몇 가지인가요?${rotOnly ? ' (뒤집기는 할 수 없습니다.)' : ''}`,
        fig,
        answer: { type: 'num', value: g.cls.size, unit: '가지' },
        steps: [
          rotOnly ? '돌리기만 할 수 있으므로 뒤집어야만 겹쳐지는 도형은 다른 모양이에요.' : '돌리기와 뒤집기를 모두 할 수 있으므로, 한 도형을 돌리거나 뒤집어 다른 도형과 겹쳐 보아요.',
          ...groups.map((gr) => (gr.length === 1 ? `${LAB[gr[0]]}: 다른 도형과 겹쳐지지 않아요.` : `${gr.map((i) => LAB[i]).join(', ')}: 같은 모양`)),
          ...(rotOnly ? [`(뒤집기까지 할 수 있다면 $${g.nAll}$가지가 돼요.)`] : []),
          `답: $${g.cls.size}$가지`,
        ],
        hint: '한 도형을 기준으로 정하고, 다른 도형을 돌리거나 뒤집어 겹쳐 보세요.',
      };
    },
  },
];

// ═════════════ e4a-5 막대그래프 ═════════════
interface BarO {
  step: number;
  max: number;
  unit?: string;
  nums?: boolean;
  names?: string[];
  every?: number;
}
/** 세로 막대그래프 (series 여러 개면 묶은 막대, null 은 지워진 막대) */
function barsFig(labels: string[], series: (number | null)[][], o: BarO): string {
  const ns = series.length;
  const w = Math.max(250, labels.length * (ns === 1 ? 52 : 66) + 60),
    h = 210 + (o.names ? 16 : 0);
  const s = new Svg(w, h);
  const top = 26 + (o.names ? 16 : 0),
    bottom = h - 28,
    left = o.nums === false ? 16 : 42;
  const Y = (v: number) => bottom - (v / o.max) * (bottom - top);
  const every = o.every ?? o.step;
  for (let v = 0; v <= o.max + 1e-9; v += o.step) {
    s.line(left, Y(v), w - 8, Y(v), { cls: 'grid' });
    if (o.nums !== false && Math.round(v) % every === 0) s.text(left - 6, Y(v), String(v), { size: 10, anchor: 'end', cls: 'muted' });
  }
  if (o.unit && o.nums !== false) s.text(left - 6, top - 13, `(${o.unit})`, { size: 10, anchor: 'end', cls: 'muted' });
  const slot = (w - 8 - left) / labels.length;
  const bw = Math.min(ns === 1 ? 30 : 18, (slot - 10) / ns);
  labels.forEach((l, i) => {
    const cx = left + slot * i + slot / 2;
    series.forEach((vals, si) => {
      const x0 = cx - (ns * bw) / 2 + si * bw;
      const v = vals[i];
      if (v === null) s.text(x0 + bw / 2, bottom - 12, '?', { size: 15, cls: 'acc2' });
      else s.rect(x0, Y(v), bw, bottom - Y(v), { cls: si === 0 ? 'acc' : 'acc2', fill: si === 0 });
    });
    s.text(cx, bottom + 13, l, { size: 11 });
  });
  s.line(left, bottom, w - 8, bottom);
  (o.names ?? []).forEach((nmz, i) => {
    const x = left + 10 + i * 84;
    s.rect(x, 7, 12, 10, { cls: i === 0 ? 'acc' : 'acc2', fill: i === 0 });
    s.text(x + 17, 12, nmz, { size: 11, anchor: 'start' });
  });
  return s.toString();
}
const argMax = (a: number[]) => a.indexOf(Math.max(...a));
const argMin = (a: number[]) => a.indexOf(Math.min(...a));
const uniqMax = (a: number[]) => a.filter((x) => x === Math.max(...a)).length === 1;
const uniqMin = (a: number[]) => a.filter((x) => x === Math.min(...a)).length === 1;

const U5: Skill[] = [
  {
    id: 'bar-pair',
    title: '남학생·여학생을 함께 나타낸 막대그래프',
    gen(r, level) {
      const th = r.pick([
        { t: '좋아하는 운동', cats: ['축구', '야구', '농구', '수영'], w: '운동' },
        { t: '좋아하는 계절', cats: ['봄', '여름', '가을', '겨울'], w: '계절' },
        { t: '좋아하는 과목', cats: ['국어', '수학', '과학', '체육'], w: '과목' },
      ]);
      const sc = level === 3 ? 2 : 1;
      const g = until(
        () => {
          const m = th.cats.map(() => r.int(1, 10) * sc),
            f = th.cats.map(() => r.int(1, 10) * sc);
          return { m, f };
        },
        ({ m, f }) => {
          const d = m.map((x, i) => Math.abs(x - f[i]));
          const t = m.map((x, i) => x + f[i]);
          if (level === 2) return uniqMax(d) && Math.max(...d) >= 2 * sc;
          if (level === 3) {
            const single = m.map((x, i) => Math.max(x, f[i]));
            return uniqMax(t) && uniqMin(t) && argMax(single) !== argMax(t);
          }
          return true;
        },
      );
      const { m, f } = g;
      const fig = barsFig(th.cats, [m, f], { step: sc, max: 11 * sc, unit: '명', names: ['남학생', '여학생'] });
      const intro = `${J(th.t, '을/를')} 조사하여 남학생과 여학생으로 나누어 나타낸 막대그래프입니다. (색칠한 막대가 남학생, 색칠하지 않은 막대가 여학생입니다.)`;
      const read = `남학생: ${th.cats.map((ct, i) => `${ct} $${m[i]}$`).join(', ')} / 여학생: ${th.cats.map((ct, i) => `${ct} $${f[i]}$`).join(', ')}`;
      if (level === 1) {
        const i = r.int(0, 3);
        return {
          q: `${intro} ${J(th.cats[i], '을/를')} 좋아하는 학생은 모두 몇 명인가요?`,
          fig,
          answer: { type: 'num', value: m[i] + f[i], unit: '명' },
          steps: [`${th.cats[i]}: 남학생 $${m[i]}$명, 여학생 $${f[i]}$명`, `$${m[i]}+${f[i]}=${m[i] + f[i]}$ (명)`],
        };
      }
      if (level === 2) {
        const d = m.map((x, i) => Math.abs(x - f[i]));
        const bi = argMax(d);
        return {
          q: `${intro} 남학생 수와 여학생 수의 차가 가장 큰 ${th.w}은 무엇인가요?`,
          fig,
          answer: makeChoices(r, th.cats[bi], th.cats.filter((_, i) => i !== bi), 4),
          steps: [read, `차: ${th.cats.map((ct, i) => `${ct} $${d[i]}$`).join(', ')}`, `답: ${th.cats[bi]}`],
          hint: '같은 항목의 두 막대가 몇 칸 차이 나는지 비교해요.',
        };
      }
      const t = m.map((x, i) => x + f[i]);
      const hi = argMax(t),
        lo = argMin(t);
      return {
        q: `${intro} 남학생과 여학생을 합한 학생 수가 가장 많은 ${th.w}과 가장 적은 ${th.w}의 학생 수의 차는 몇 명인가요?`,
        fig,
        answer: { type: 'num', value: t[hi] - t[lo], unit: '명' },
        steps: [
          `세로 눈금 한 칸은 $${sc}$명이에요.`,
          read,
          `합: ${th.cats.map((ct, i) => `${ct} $${t[i]}$`).join(', ')}`,
          `가장 많은 ${th.w}: ${th.cats[hi]} $${t[hi]}$명, 가장 적은 ${th.w}: ${th.cats[lo]} $${t[lo]}$명 → $${t[hi]}-${t[lo]}=${t[hi] - t[lo]}$ (명)`,
        ],
        hint: '가장 긴 막대 하나만 보지 말고, 두 막대를 더해서 비교해요.',
      };
    },
  },
  {
    id: 'bar-whose-bar',
    title: '조건을 보고 어떤 막대인지 알아내기',
    gen(r, level) {
      const th = r.pick([
        { t: '좋아하는 운동별 학생 수', items: ['축구', '야구', '수영', '농구', '배구'], v: '좋아하는', k: '운동' },
        { t: '좋아하는 과일별 학생 수', items: ['사과', '포도', '딸기', '복숭아', '귤'], v: '좋아하는', k: '과일' },
        { t: '기르고 싶은 동물별 학생 수', items: ['강아지', '고양이', '토끼', '햄스터', '앵무새'], v: '기르고 싶은', k: '동물' },
      ]);
      const n = level + 2;
      const sc = level === 3 ? 2 : 1;
      const items = r.sample(th.items, n);
      const BL = ['㉠', '㉡', '㉢', '㉣', '㉤'].slice(0, n);
      const W = (i: number) => `${J(items[i], '을/를')} ${th.v} 학생`;
      const allP = (k: number): number[][] => (k === 0 ? [[]] : allP(k - 1).flatMap((p) => range(0, n - 1).filter((x) => !p.includes(x)).map((x) => [...p, x])));
      const PERMS = allP(n);
      type Clue = { text: string; ok: (x: number[]) => boolean; why: (bv: number[]) => string };
      const g = until(
        () => {
          const bv = until(
            () => BL.map(() => r.int(2, 11) * sc),
            (v) => new Set(v).size === n,
          );
          const truth = r.shuffle(range(0, n - 1)); // item i → bar truth[i]
          const v = items.map((_, i) => bv[truth[i]]);
          const cand: Clue[] = [];
          const pairsWith = (f: (a: number, b: number) => boolean) => {
            const out: string[] = [];
            for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) if (a !== b && f(bv[a], bv[b])) out.push(`${BL[a]}($${bv[a]}$)과 ${BL[b]}($${bv[b]}$)`);
            return out.join(', ');
          };
          for (let i = 0; i < n; i++)
            for (let j = 0; j < n; j++) {
              if (i === j) continue;
              const d = v[i] - v[j];
              if (d > 0) {
                cand.push({ text: `${W(i)}은 ${items[j]}보다 $${d}$명 많습니다.`, ok: (x) => x[i] - x[j] === d, why: () => `${d}명 차이: ${pairsWith((a, b) => a - b === d)}` });
                if (level < 3) cand.push({ text: `${W(i)}은 ${items[j]}보다 많습니다.`, ok: (x) => x[i] > x[j], why: () => `${items[i]} > ${items[j]}` });
              }
              if (v[i] === 2 * v[j]) cand.push({ text: `${W(i)}은 ${items[j]}의 $2$배입니다.`, ok: (x) => x[i] === 2 * x[j], why: () => `$2$배인 두 막대: ${pairsWith((a, b) => a === 2 * b)}` });
              if (i < j) cand.push({ text: `${items[i]}${josa(items[i], '와/과')} ${J(items[j], '을/를')} ${th.v} 학생을 합하면 $${v[i] + v[j]}$명입니다.`, ok: (x) => x[i] + x[j] === v[i] + v[j], why: () => `합이 $${v[i] + v[j]}$인 두 막대: ${pairsWith((a, b) => a < b && a + b === v[i] + v[j])}` });
            }
          if (level < 3) {
            const mi = argMax(v),
              ni = argMin(v);
            cand.push({ text: `${W(mi)}이 가장 많습니다.`, ok: (x) => argMax(x) === mi, why: () => `가장 긴 막대 ${BL[argMax(bv)]}($${Math.max(...bv)}$) → ${items[mi]}` });
            cand.push({ text: `${W(ni)}이 가장 적습니다.`, ok: (x) => argMin(x) === ni, why: () => `가장 짧은 막대 ${BL[argMin(bv)]}($${Math.min(...bv)}$) → ${items[ni]}` });
          }
          // 조건을 하나씩 더해 답이 하나로 정해질 때까지
          let sols = PERMS;
          const used: Clue[] = [];
          for (const cl of r.shuffle(cand)) {
            const nx = sols.filter((p) => cl.ok(items.map((_, i) => bv[p[i]])));
            if (nx.length < sols.length && nx.length > 0) {
              sols = nx;
              used.push(cl);
            }
            if (sols.length === 1) break;
          }
          // 필요 없는 조건 빼기
          for (let k = used.length - 1; k >= 0 && sols.length === 1; k--) {
            const rest = used.filter((_, i) => i !== k);
            const ss = PERMS.filter((p) => rest.every((cl) => cl.ok(items.map((_, i) => bv[p[i]]))));
            if (ss.length === 1) used.splice(k, 1);
          }
          return { bv, truth, v, used, ok: sols.length === 1 };
        },
        (g) => g.ok && g.used.length >= 2 && g.used.length <= (level === 1 ? 2 : level === 2 ? 3 : 4),
      );
      const { bv, truth, v, used } = g;
      const ai = r.int(0, n - 1);
      const fig = barsFig(BL, [bv], { step: sc, max: 12 * sc, unit: '명', every: sc === 1 ? 2 : 4 });
      return {
        q: `${J(th.t, '을/를')} 조사하여 막대그래프로 나타냈는데, 막대가 나타내는 ${th.k}의 이름이 지워졌습니다. 다음 조건을 보고 ${W(ai)}은 몇 명인지 구하세요.\n${used.map((cl) => `- ${cl.text}`).join('\n')}`,
        fig,
        answer: { type: 'num', value: v[ai], unit: '명' },
        steps: [
          `그래프 읽기 (한 칸 $${sc}$명): ${BL.map((b, i) => `${b} $${bv[i]}$명`).join(', ')}`,
          ...used.map((cl) => cl.why(bv)),
          `조건을 모두 만족하도록 맞추면: ${items.map((it, i) => `${it} ${BL[truth[i]]}`).join(', ')}`,
          `${items[ai]}: $${v[ai]}$명`,
        ],
        hint: '조건에 맞는 막대의 짝을 먼저 찾아보세요.',
      };
    },
  },
  {
    id: 'bar-price',
    title: '막대그래프와 가격표로 판매 금액 구하기',
    gen(r, level) {
      const fr2 = r.sample(
        [
          ['사과', 900],
          ['배', 1500],
          ['귤', 300],
          ['복숭아', 1200],
          ['참외', 800],
          ['감', 600],
        ] as [string, number][],
        4,
      );
      const cats = fr2.map((x) => x[0]),
        price = fr2.map((x) => x[1]);
      const sc = level === 3 ? 5 : 2;
      const cnt = until(
        () => cats.map(() => r.int(2, 11) * sc),
        (cn) => {
          const rev = cn.map((x, i) => x * price[i]);
          return new Set(cn).size === 4 && (level < 3 || (uniqMax(rev) && uniqMin(rev) && argMax(cn) !== argMax(rev)));
        },
      );
      const rev = cnt.map((x, i) => x * price[i]);
      const fig = barsFig(cats, [cnt], { step: sc, max: 12 * sc, unit: '개', every: sc === 2 ? 4 : 10 });
      const table = [['과일', ...cats], ['한 개의 값', ...price.map((p) => `$${c(p)}$원`)]];
      const intro = '어느 가게에서 하루 동안 팔린 과일의 수를 나타낸 막대그래프와 과일 한 개의 값을 나타낸 표입니다.';
      if (level === 1) {
        const i = r.int(0, 3);
        return {
          q: `${intro} 이날 팔린 ${cats[i]}의 값은 모두 얼마인가요?`,
          fig,
          table,
          answer: { type: 'num', value: rev[i], unit: '원' },
          steps: [`${cats[i]}: $${cnt[i] / sc}$칸 $\\times${sc}=${cnt[i]}$ (개)`, `$${c(price[i])}\\times${cnt[i]}=${c(rev[i])}$ (원)`],
        };
      }
      if (level === 2)
        return {
          q: `${intro} 이날 과일을 판 돈은 모두 얼마인가요?`,
          fig,
          table,
          answer: { type: 'num', value: sum(rev), unit: '원' },
          steps: [
            `팔린 수: ${cats.map((ct, i) => `${ct} $${cnt[i]}$개`).join(', ')}`,
            `판 돈: ${cats.map((ct, i) => `${ct} $${c(price[i])}\\times${cnt[i]}=${c(rev[i])}$`).join(', ')}`,
            `모두: $${rev.map(c).join('+')}=${c(sum(rev))}$ (원)`,
          ],
        };
      const hi = argMax(rev),
        lo = argMin(rev);
      return {
        q: `${intro} 판 돈이 가장 많은 과일과 가장 적은 과일의 판 돈의 차는 얼마인가요?`,
        fig,
        table,
        answer: { type: 'num', value: rev[hi] - rev[lo], unit: '원' },
        steps: [
          `세로 눈금 한 칸은 $${sc}$개 → ${cats.map((ct, i) => `${ct} $${cnt[i]}$개`).join(', ')}`,
          `판 돈: ${cats.map((ct, i) => `${ct} $${c(rev[i])}$원`).join(', ')}`,
          `가장 많이 팔린 것은 ${cats[argMax(cnt)]}이지만, 판 돈이 가장 많은 것은 ${cats[hi]}예요.`,
          `$${c(rev[hi])}-${c(rev[lo])}=${c(rev[hi] - rev[lo])}$ (원)`,
        ],
        hint: '팔린 수가 많다고 판 돈이 많은 것은 아니에요. 과일마다 판 돈을 구해 비교해요.',
      };
    },
  },
];

const BTH = [
  { t: '마을별 기르는 소의 수', cats: ['가', '나', '다', '라', '마'], suf: ' 마을', unit: '마리', obj: '소' },
  { t: '모둠별 모은 구슬의 수', cats: ['1모둠', '2모둠', '3모둠', '4모둠', '5모둠'], suf: '', unit: '개', obj: '구슬' },
  { t: '상자별 들어 있는 사과의 수', cats: ['가', '나', '다', '라', '마'], suf: ' 상자', unit: '개', obj: '사과' },
];
const T5: Skill[] = [
  {
    id: 'top-bar-move-equal',
    title: '옮겨서 몇 배·차가 되게 하기',
    gen(r) {
      const th = r.pick(BTH);
      const sc = r.pick([2, 5]);
      const kind = r.pick(['k1', 'k2', 'k3', 'diff']);
      const k = kind === 'k1' ? 1 : kind === 'k2' ? 2 : kind === 'k3' ? 3 : 0;
      const g = until(
        () => {
          const cells = th.cats.slice(0, 4).map(() => r.int(1, 11));
          const [xi, yi] = r.sample([0, 1, 2, 3], 2);
          const X = cells[xi] * sc,
            Y = cells[yi] * sc,
            S = X + Y;
          const d = kind === 'diff' ? r.int(1, 5) * 2 : 0;
          const Yp = kind === 'diff' ? (S - d) / 2 : S / (k + 1);
          return { cells, xi, yi, X, Y, S, d, Yp, t: Yp - Y };
        },
        (g) => Number.isInteger(g.Yp) && g.t > 0 && g.X - g.t > 0 && (kind !== 'diff' || g.X - g.t > g.Yp),
      );
      const { cells, xi, yi, X, Y, S, d, Yp, t } = g;
      const L = (i: number) => th.cats[i] + th.suf;
      const fig = barsFig(th.cats.slice(0, 4), [cells.map((x) => x * sc)], { step: sc, max: 12 * sc, unit: th.unit, every: sc === 2 ? 4 : 10 });
      const goal = kind === 'diff' ? `${L(xi)}의 ${J(th.obj, '이/가')} ${L(yi)}보다 $${d}$${th.unit} 더 많아지나요?` : k === 1 ? `두 곳의 ${th.obj} 수가 같아지나요?` : `${L(xi)}의 ${th.obj} 수가 ${L(yi)}의 $${k}$배가 되나요?`;
      const Xp = X - t;
      return {
        q: `${J(th.t, '을/를')} 나타낸 막대그래프입니다. ${L(xi)}에서 ${L(yi)}${josa(L(yi), '으로/로')} ${J(th.obj, '을/를')} 몇 ${th.unit} 옮기면 ${goal}`,
        fig,
        answer: { type: 'num', value: t, unit: th.unit },
        steps: [
          `세로 눈금 한 칸은 $${sc}$${th.unit} → ${L(xi)} $${X}$${th.unit}, ${L(yi)} $${Y}$${th.unit}`,
          `옮겨도 두 곳의 ${J(th.obj, '을/를')} 합한 수는 변하지 않아요: $${X}+${Y}=${S}$`,
          kind === 'diff'
            ? `옮긴 뒤 ${L(yi)}의 수를 □라 하면 ${J(L(xi), '은/는')} □$+${d}$ → □$+$□$+${d}=${S}$ → □$=(${S}-${d})\\div2=${Yp}$`
            : k === 1
              ? `옮긴 뒤 두 곳의 수는 각각 $${S}\\div2=${Yp}$`
              : `옮긴 뒤 ${L(yi)}의 수를 □라 하면 ${J(L(xi), '은/는')} □$\\times${k}$ → 합이 □의 $${k + 1}$배 → □$=${S}\\div${k + 1}=${Yp}$`,
          `옮긴 수: $${Yp}-${Y}=${t}$ (${th.unit})`,
          `확인: ${L(xi)} $${X}-${t}=${Xp}$, ${L(yi)} $${Y}+${t}=${Yp}$${kind === 'diff' ? ` → 차 $${Xp - Yp}$` : k > 1 ? ` → $${Yp}\\times${k}=${Xp}$` : ''}`,
        ],
        hint: '옮기기 전과 후에 두 곳의 합이 같다는 것을 이용해요.',
      };
    },
  },
  {
    id: 'top-bar-scale-missing',
    title: '눈금과 막대가 지워진 그래프 완성하기',
    gen(r) {
      const th = r.pick(BTH);
      const sc = r.pick([2, 3, 4, 5, 10]);
      const mul = r.pick([2, 3]);
      const g = until(
        () => {
          const cells = th.cats.map(() => r.int(1, 11));
          const [p, q, gi] = r.sample([0, 1, 2, 3, 4], 3);
          const qc = r.int(1, Math.floor(11 / mul));
          cells[q] = qc;
          cells[p] = qc * mul;
          return { cells, p, q, gi };
        },
        (g) => g.cells[g.gi] >= 2 && new Set(g.cells).size >= 4,
      );
      const { cells, p, q, gi } = g;
      const vals = cells.map((x) => x * sc);
      const T = sum(vals);
      const L = (i: number) => th.cats[i] + th.suf;
      const shown = cells.map((x, i) => (i === p || i === q ? null : x));
      const fig = barsFig(th.cats, [shown], { step: 1, max: 12, nums: false });
      const knownIdx = range(0, 4).filter((i) => i !== p && i !== q);
      const knownSum = sum(knownIdx.map((i) => vals[i]));
      const hid = T - knownSum;
      const ask = r.chance(0.5) ? p : q;
      return {
        q: `${J(th.t, '을/를')} 나타낸 막대그래프인데 세로 눈금의 숫자와 ${J(L(p), '와/과')} ${L(q)}의 막대가 지워졌습니다. ${L(gi)}의 ${J(th.obj, '은/는')} $${vals[gi]}$${th.unit}이고, 다섯 곳의 ${J(th.obj, '은/는')} 모두 $${T}$${th.unit}입니다. ${L(p)}의 ${th.obj} 수가 ${L(q)}의 $${mul}$배일 때, ${L(ask)}의 ${J(th.obj, '은/는')} 몇 ${th.unit}인가요?`,
        fig,
        answer: { type: 'num', value: vals[ask], unit: th.unit },
        steps: [
          `${L(gi)}의 막대는 $${cells[gi]}$칸이므로 눈금 한 칸: $${vals[gi]}\\div${cells[gi]}=${sc}$ (${th.unit})`,
          `남은 막대: ${knownIdx.map((i) => `${L(i)} $${cells[i]}$칸`).join(', ')} → $(${knownIdx.map((i) => cells[i]).join('+')})\\times${sc}=${knownSum}$`,
          `${J(L(p), '와/과')} ${L(q)}의 합: $${T}-${knownSum}=${hid}$`,
          `${J(L(q), '을/를')} $1$묶음이라 하면 ${J(L(p), '은/는')} $${mul}$묶음 → 합은 $${mul + 1}$묶음: ${L(q)} $=${hid}\\div${mul + 1}=${vals[q]}$`,
          `${L(p)} $=${vals[q]}\\times${mul}=${vals[p]}$`,
          `답: $${vals[ask]}$${th.unit}`,
        ],
        hint: '먼저 눈금 한 칸의 크기를 구해요.',
      };
    },
  },
];

// ═════════════ e4a-6 규칙 찾기 ═════════════
const SHP = ['\\bigcirc', '\\triangle', '\\square', '\\diamondsuit', '\\heartsuit'];
const BEAD = ['빨간 구슬', '파란 구슬', '노란 구슬', '초록 구슬', '흰 구슬'];
const U6: Skill[] = [
  {
    id: 'repeat-cycle',
    title: '되풀이되는 규칙과 나머지',
    gen(r, level) {
      const beads = r.chance(0.5);
      const pool = beads ? BEAD : SHP;
      const show = (k: number) => (beads ? pool[k] : `$${pool[k]}$`);
      const L = r.int(3, 5);
      const sym = r.sample(range(0, pool.length - 1), r.int(2, 3));
      const pat = until(
        () => Array.from({ length: L }, () => r.pick(sym)),
        (p) => new Set(p).size >= 2 && range(1, L - 1).every((d) => L % d !== 0 || p.some((x, i) => x !== p[i % d])),
      );
      const at = (n: number) => pat[(n - 1) % L];
      const seqText = beads ? `${range(1, 2 * L + 1).map((n) => pool[at(n)]).join(', ')}, …` : `$$${range(1, 2 * L + 1).map((n) => pool[at(n)]).join(',\\;')},\\;\\cdots$$`;
      const intro = beads ? `구슬을 다음과 같은 규칙으로 한 줄로 꿰었습니다. ${seqText}` : `다음과 같은 규칙으로 모양을 늘어놓았습니다. ${seqText}`;
      const cyc = `${pat.map((k) => show(k)).join(', ')}의 ${L}개가 되풀이돼요.`;
      if (level === 1) {
        const n = r.int(20, 60);
        const k = at(n),
          rm = n % L || L;
        return {
          q: `${intro} ${n}번째에 놓이는 ${beads ? '구슬' : '모양'}은 무엇인가요?`,
          answer: makeChoices(
            r,
            show(k),
            range(0, pool.length - 1)
              .filter((x) => x !== k)
              .map(show),
            4,
          ),
          steps: [cyc, `$${n}\\div${L}=${Math.floor(n / L)}\\cdots${n % L}$ → ${n % L === 0 ? `묶음의 마지막(${L}번째)` : `묶음의 ${rm}번째`}와 같아요.`, `답: ${show(k)}`],
          hint: '몇 개씩 되풀이되는지 먼저 찾아요.',
        };
      }
      const S = r.pick([...new Set(pat)]);
      const per = pat.filter((x) => x === S).length;
      const countTo = (n: number) => range(1, n).filter((i) => at(i) === S).length;
      if (level === 2) {
        const n = r.int(30, 80);
        const q = Math.floor(n / L),
          rm = n % L;
        const extra = pat.slice(0, rm).filter((x) => x === S).length;
        return {
          q: `${intro} 처음부터 ${n}번째까지 놓인 것 중에서 ${show(S)}${beads ? josa(pool[S], '은/는') : '는'} 모두 몇 개인가요?`,
          answer: { type: 'num', value: countTo(n), unit: '개' },
          steps: [cyc, `한 묶음에 ${show(S)}${beads ? josa(pool[S], '이/가') : '가'} $${per}$개 있어요.`, `$${n}\\div${L}=${q}\\cdots${rm}$ → ${q}묶음과 ${rm}개`, `$${per}\\times${q}+${extra}=${countTo(n)}$ (개)`],
          hint: '한 묶음에 몇 개씩 들어 있는지 세어 보세요.',
        };
      }
      if (r.chance(0.5)) {
        const k = r.int(10, 30);
        let pos = 0,
          seen = 0;
        while (seen < k) {
          pos++;
          if (at(pos) === S) seen++;
        }
        const q = Math.floor((k - 1) / per),
          rr = k - q * per;
        const inPos = range(1, L).filter((i) => pat[i - 1] === S);
        return {
          q: `${intro} ${show(S)}${beads ? josa(pool[S], '이/가') : '가'} ${k}번째로 나오는 것은 처음부터 몇 번째인가요? (숫자로 답하세요.)`,
          answer: { type: 'num', value: pos, unit: '번째' },
          steps: [
            cyc,
            `한 묶음 안에서 ${show(S)}${beads ? josa(pool[S], '은/는') : '는'} ${inPos.map((i) => `${i}번째`).join(', ')} → $${per}$개`,
            `$${k}$번째 ${show(S)}: 앞의 ${q}묶음에 $${per * q}$개가 있고, 그다음 묶음의 ${rr}번째 ${show(S)}`,
            `$${L}\\times${q}+${inPos[rr - 1]}=${pos}$ (번째)`,
          ],
          hint: '한 묶음에 몇 개씩 나오는지 생각하며 거꾸로 위치를 찾아요.',
        };
      }
      const n1 = r.int(15, 40),
        n2 = r.int(n1 + 25, n1 + 60);
      const ans = countTo(n2) - countTo(n1 - 1);
      return {
        q: `${intro} ${n1}번째부터 ${n2}번째까지 놓인 것 중에서 ${show(S)}${beads ? josa(pool[S], '은/는') : '는'} 모두 몇 개인가요?`,
        answer: { type: 'num', value: ans, unit: '개' },
        steps: [
          cyc,
          `${n2}번째까지: $${n2}\\div${L}=${Math.floor(n2 / L)}\\cdots${n2 % L}$ → $${countTo(n2)}$개`,
          `${n1 - 1}번째까지: $${n1 - 1}\\div${L}=${Math.floor((n1 - 1) / L)}\\cdots${(n1 - 1) % L}$ → $${countTo(n1 - 1)}$개`,
          `$${countTo(n2)}-${countTo(n1 - 1)}=${ans}$ (개)`,
        ],
        hint: '처음부터 세어서 빼 보세요.',
      };
    },
  },
  {
    id: 'io-machine',
    title: '계산 상자의 규칙 찾기',
    gen(r, level) {
      const mk = (lo: number) =>
        until(
          () => ({ a: r.int(2, 9), b: r.int(1, 12), plus: r.chance(0.5) }),
          (f) => f.plus || f.a * lo - f.b > 0,
        );
      const ap = (f: { a: number; b: number; plus: boolean }, x: number) => (f.plus ? f.a * x + f.b : f.a * x - f.b);
      const rule = (f: { a: number; b: number; plus: boolean }) => `(넣은 수)$\\times${f.a}${f.plus ? '+' : '-'}${f.b}$`;
      const ruleWhy = (f: { a: number; b: number; plus: boolean }, x0: number) =>
        `넣은 수가 $1$ 커질 때마다 나온 수는 $${f.a}$씩 커져요. $${x0}\\times${f.a}=${x0 * f.a}$이고 나온 수는 $${ap(f, x0)}$ → 나온 수 $=$ ${rule(f)}`;
      if (level <= 2) {
        const s0 = r.int(1, 5);
        const xs = level === 1 ? [s0, s0 + 1, s0 + 2, s0 + 3] : until(
          () => r.sample(range(1, 12), 4).sort((a, b) => a - b),
          (v) => v[1] - v[0] !== v[2] - v[1] || v[3] - v[2] !== v[2] - v[1],
        );
        const f = mk(xs[0]);
        const table = [['넣은 수', ...xs.map((x) => `$${x}$`)], ['나온 수', ...xs.map((x) => `$${ap(f, x)}$`)]];
        const X = r.int(13, 40);
        const Yv = ap(f, X);
        if (level === 1)
          return {
            q: `어떤 수를 넣으면 규칙에 따라 계산한 수가 나오는 상자가 있습니다. 표를 보고 $${X}$을 넣으면 얼마가 나오는지 구하세요.`,
            table,
            answer: { type: 'num', value: Yv },
            steps: [ruleWhy(f, xs[0]), `$${X}\\times${f.a}${f.plus ? '+' : '-'}${f.b}=${Yv}$`],
            hint: '넣은 수가 1 커질 때 나온 수가 얼마씩 커지는지 보세요.',
          };
        return {
          q: `어떤 수를 넣으면 규칙에 따라 계산한 수가 나오는 상자가 있습니다. 표를 보고, $${Yv}$이 나왔을 때 넣은 수를 구하세요.`,
          table,
          answer: { type: 'num', value: X },
          steps: [
            `넣은 수가 $${xs[1] - xs[0]}$ 커지면 나온 수는 $${ap(f, xs[1]) - ap(f, xs[0])}$ 커지므로, $1$ 커질 때마다 $${f.a}$씩 커져요.`,
            `$${xs[0]}\\times${f.a}=${xs[0] * f.a}$이고 나온 수는 $${ap(f, xs[0])}$ → 나온 수 $=$ ${rule(f)}`,
            `거꾸로: $(${Yv}${f.plus ? '-' : '+'}${f.b})\\div${f.a}=${X}$`,
          ],
          hint: '규칙을 찾은 다음 거꾸로 계산해요.',
        };
      }
      const s0 = r.int(1, 4);
      const xs = [s0, s0 + 1, s0 + 2, s0 + 3];
      const fA = mk(1),
        fB = mk(1);
      const first = r.chance(0.5) ? 'A' : 'B';
      const [f1, f2] = first === 'A' ? [fA, fB] : [fB, fA];
      const [n1, n2] = first === 'A' ? ['가', '나'] : ['나', '가'];
      const x = r.int(3, 15);
      const mid = ap(f1, x),
        F = ap(f2, mid);
      const table = [['넣은 수', ...xs.map((v) => `$${v}$`)], ['가 상자에서 나온 수', ...xs.map((v) => `$${ap(fA, v)}$`)], ['나 상자에서 나온 수', ...xs.map((v) => `$${ap(fB, v)}$`)]];
      return {
        q: `규칙에 따라 계산한 수가 나오는 가 상자와 나 상자가 있습니다. 표는 각 상자에 수를 넣었을 때 나온 수입니다. 어떤 수를 ${n1} 상자에 넣고, 나온 수를 다시 ${n2} 상자에 넣었더니 $${F}$${josa(F, '이/가')} 나왔습니다. 처음에 넣은 수는 얼마인가요?`,
        table,
        answer: { type: 'num', value: x },
        steps: [
          `가 상자: 나온 수 $=$ ${rule(fA)}`,
          `나 상자: 나온 수 $=$ ${rule(fB)}`,
          `거꾸로: ${n2} 상자에 넣은 수 $=(${F}${f2.plus ? '-' : '+'}${f2.b})\\div${f2.a}=${mid}$`,
          `${n1} 상자에 넣은 수 $=(${mid}${f1.plus ? '-' : '+'}${f1.b})\\div${f1.a}=${x}$`,
        ],
        hint: '각 상자의 규칙을 찾은 다음, 마지막 상자부터 거꾸로 계산해요.',
      };
    },
  },
  {
    id: 'stone-frame',
    title: '바둑돌 배열의 규칙 (테두리·직사각형)',
    gen(r, level) {
      type Pat = { key: string; f: (n: number) => number; dims: (n: number) => [number, number]; hollow: boolean; why: string };
      const PATS: Pat[] = [
        { key: 'sq', f: (n) => 4 * n, dims: (n) => [n + 1, n + 1], hollow: true, why: '한 변에 놓인 돌이 $2, 3, 4, \\dots$개인 정사각형 테두리 → 바둑돌이 $4$개씩 늘어나요. □번째: $4\\times$□' },
        { key: 'rf', f: (n) => 4 * n + 2, dims: (n) => [n + 1, n + 2], hollow: true, why: '가로·세로가 $1$개씩 늘어나는 직사각형 테두리 → $4$개씩 늘어나요. □번째: $4\\times$□$+2$' },
        { key: 'rect', f: (n) => n * (n + 1), dims: (n) => [n, n + 1], hollow: false, why: '□번째는 세로 □줄, 가로 (□$+1$)줄인 직사각형 → □$\\times$(□$+1$)' },
      ];
      const p = level === 1 ? r.pick([PATS[0], PATS[1]]) : level === 2 ? r.pick(PATS) : r.pick([PATS[0], PATS[2]]);
      // 그림
      const u = 9;
      const s = new Svg(320, 96);
      let x0 = 10;
      for (let n = 1; n <= 4; n++) {
        const [rows, cols] = p.dims(n);
        const y0 = 80 - rows * u;
        for (let i = 0; i < rows; i++)
          for (let j = 0; j < cols; j++) if (!p.hollow || i === 0 || j === 0 || i === rows - 1 || j === cols - 1) s.circle(x0 + j * u + u / 2, y0 + i * u + u / 2, 3.3, { cls: 'acc', fill: true });
        s.text(x0 + (cols * u) / 2, 90, ORD[n - 1], { size: 11 });
        x0 += cols * u + 22;
      }
      const fig = s.toString();
      const first4 = [1, 2, 3, 4].map(p.f).join(', ');
      if (level === 1 || (level === 2 && p.key === 'rect')) {
        const n = r.int(7, 15);
        return {
          q: `규칙에 따라 바둑돌을 늘어놓았습니다. ${ORD[n - 1] ?? `${n}번째`} 모양에 놓이는 바둑돌은 몇 개인가요?`,
          fig,
          answer: { type: 'num', value: p.f(n), unit: '개' },
          steps: [`바둑돌의 수: $${first4}, \\dots$`, p.why, `$${n}$번째: $${p.f(n)}$개`],
          hint: '모양이 하나씩 늘어날 때 바둑돌이 어떻게 늘어나는지 보세요.',
        };
      }
      if (level === 2) {
        const n = r.int(12, 40);
        const N = p.f(n);
        return {
          q: `규칙에 따라 바둑돌을 늘어놓았습니다. 바둑돌 $${N}$개를 모두 사용하여 만든 모양은 몇 번째 모양인가요? (숫자로 답하세요.)`,
          fig,
          answer: { type: 'num', value: n, unit: '번째' },
          steps: [`바둑돌의 수: $${first4}, \\dots$`, p.why, p.key === 'sq' ? `$4\\times$□$=${N}$ → □$=${N}\\div4=${n}$` : `$4\\times$□$+2=${N}$ → $4\\times$□$=${N - 2}$ → □$=${n}$`],
          hint: '□번째 모양의 바둑돌 수를 식으로 나타내 보세요.',
        };
      }
      if (p.key === 'sq') {
        const n = r.int(8, 20);
        return {
          q: `규칙에 따라 검은 바둑돌로 정사각형 테두리를 만들고 있습니다. ${n}번째 모양의 테두리 안쪽을 흰 바둑돌로 빈틈없이 채운다면 흰 바둑돌은 몇 개 필요한가요?`,
          fig,
          answer: { type: 'num', value: (n - 1) * (n - 1), unit: '개' },
          steps: [`□번째 모양은 한 변에 바둑돌이 (□$+1$)개인 정사각형 테두리`, `${n}번째: 한 변에 $${n + 1}$개`, `안쪽은 한 변에 $${n + 1}-2=${n - 1}$개인 정사각형`, `흰 바둑돌: $${n - 1}\\times${n - 1}=${(n - 1) * (n - 1)}$ (개)`],
          hint: '테두리 안쪽의 한 변에는 바둑돌이 몇 개 들어갈까요?',
        };
      }
      const M = r.int(15, 45) * 10;
      let n = 1;
      while (p.f(n) <= M) n++;
      return {
        q: `규칙에 따라 바둑돌을 늘어놓았습니다. 바둑돌이 처음으로 $${M}$개보다 많아지는 것은 몇 번째 모양인가요? (숫자로 답하세요.)`,
        fig,
        answer: { type: 'num', value: n, unit: '번째' },
        steps: [`바둑돌의 수: $${first4}, \\dots$`, p.why, `어림: $${n - 1}\\times${n}=${p.f(n - 1)}$ ($${M}$ 이하), $${n}\\times${n + 1}=${p.f(n)}$ ($${M}$보다 많음)`, `답: $${n}$번째`],
        hint: '□×(□+1)이 얼마쯤 되는지 어림해 보세요.',
      };
    },
  },
];

const T6: Skill[] = [
  {
    id: 'top-odd-sum',
    title: '연속하는 홀수·짝수의 합의 규칙',
    gen(r) {
      const v = r.pick(['range', 'range', 'rev', 'even']);
      const oddRule = '$$\\begin{aligned}1&=1\\times1\\\\1+3&=2\\times2\\\\1+3+5&=3\\times3\\\\1+3+5+7&=4\\times4\\end{aligned}$$';
      const evenRule = '$$\\begin{aligned}2&=1\\times2\\\\2+4&=2\\times3\\\\2+4+6&=3\\times4\\\\2+4+6+8&=4\\times5\\end{aligned}$$';
      if (v === 'rev') {
        const q = r.int(12, 40);
        return {
          q: `다음 계산식의 규칙을 이용하여 □ 안에 알맞은 수를 구하세요. ${oddRule} $$1+3+5+\\cdots+\\square=${c(q * q)}$$`,
          answer: { type: 'num', value: 2 * q - 1 },
          steps: [
            '$1$부터 연속하는 홀수 □개를 더하면 □$\\times$□가 돼요.',
            `$${c(q * q)}=${q}\\times${q}$ → 홀수 $${q}$개를 더한 것`,
            `$${q}$번째 홀수: $2\\times${q}-1=${2 * q - 1}$`,
            `확인: 첫째 $1$, 둘째 $3$, 셋째 $5$, … □번째 홀수는 $2\\times$□$-1$`,
            `답: $${2 * q - 1}$`,
          ],
          hint: '몇 개의 홀수를 더한 것인지 먼저 찾아요.',
        };
      }
      const p = r.int(4, 20),
        q = r.int(p + 6, Math.min(50, p + 35));
      if (v === 'even') {
        const a = 2 * p + 2,
          b = 2 * q;
        const ans = q * (q + 1) - p * (p + 1);
        return {
          q: `다음 계산식의 규칙을 이용하여 계산하세요. ${evenRule} $$${a}+${a + 2}+${a + 4}+\\cdots+${b}$$`,
          answer: { type: 'num', value: ans },
          steps: [
            '$2$부터 연속하는 짝수 □개를 더하면 □$\\times$(□$+1$)이 돼요.',
            `$2+4+\\cdots+${b}$: 짝수 $${q}$개 → $${q}\\times${q + 1}=${c(q * (q + 1))}$`,
            `$2+4+\\cdots+${a - 2}$: 짝수 $${p}$개 → $${p}\\times${p + 1}=${p * (p + 1)}$`,
            `구하는 합은 큰 합에서 앞부분을 뺀 것`,
            `$${c(q * (q + 1))}-${p * (p + 1)}=${c(ans)}$`,
          ],
          hint: '2부터 더한 합 두 개의 차로 생각해 보세요.',
        };
      }
      const a = 2 * p + 1,
        b = 2 * q - 1;
      const ans = q * q - p * p;
      return {
        q: `다음 계산식의 규칙을 이용하여 계산하세요. ${oddRule} $$${a}+${a + 2}+${a + 4}+\\cdots+${b}$$`,
        answer: { type: 'num', value: ans },
        steps: [
          '$1$부터 연속하는 홀수 □개를 더하면 □$\\times$□가 돼요.',
          `$${b}$은 $${q}$번째 홀수 → $1+3+\\cdots+${b}=${q}\\times${q}=${c(q * q)}$`,
          `$${a - 2}$는 $${p}$번째 홀수 → $1+3+\\cdots+${a - 2}=${p}\\times${p}=${p * p}$`,
          '구하는 합은 큰 합에서 앞부분을 뺀 것',
          `$${c(q * q)}-${p * p}=${c(ans)}$`,
        ],
        hint: '1부터 더한 합 두 개의 차로 생각해 보세요.',
      };
    },
  },
  {
    id: 'top-gnomon-stones',
    title: '검은 돌과 흰 돌을 번갈아 놓는 규칙',
    gen(r) {
      const ask = r.pick(['diff', 'white', 'black']);
      const n = ask === 'diff' ? r.int(15, 40) : r.int(10, 30);
      const cnt = (N: number) => {
        let bl = 0,
          wh = 0;
        for (let k = 1; k <= N; k++) {
          if (k % 2) bl += 2 * k - 1;
          else wh += 2 * k - 1;
        }
        return { bl, wh };
      };
      const { bl, wh } = cnt(n);
      const ans = ask === 'diff' ? Math.abs(bl - wh) : ask === 'white' ? wh : bl;
      const u = 9;
      const s = new Svg(250, 70);
      let x0 = 10;
      for (let N = 1; N <= 4; N++) {
        for (let i = 0; i < N; i++)
          for (let j = 0; j < N; j++) {
            const k = Math.max(i, j) + 1;
            const cx = x0 + j * u + u / 2,
              cy = 52 - (N - i) * u + u / 2;
            if (k % 2) s.circle(cx, cy, 3.4, { cls: 'acc', fill: true, dot: true });
            else s.circle(cx, cy, 3.4, { cls: 'acc' });
          }
        s.text(x0 + (N * u) / 2, 63, ORD[N - 1], { size: 11 });
        x0 += N * u + 26;
      }
      const odd = n % 2 === 1;
      const tot = n * n;
      return {
        q: `그림과 같이 규칙에 따라 검은 바둑돌과 흰 바둑돌을 정사각형 모양으로 늘어놓았습니다. ${n}번째 모양에서 ${ask === 'diff' ? '검은 바둑돌과 흰 바둑돌의 수의 차는 몇 개인가요?' : ask === 'white' ? '흰 바둑돌은 몇 개인가요?' : '검은 바둑돌은 몇 개인가요?'}`,
        fig: s.toString(),
        answer: { type: 'num', value: ans, unit: '개' },
        steps: [
          '□번째 모양은 앞의 모양 바깥에 꺾인 모양으로 (□$\\times2-1$)개를 더 놓은 것이고, 더하는 돌의 색은 검은색과 흰색이 번갈아 나와요.',
          '더하는 돌: 검은 돌 $1$, 흰 돌 $3$, 검은 돌 $5$, 흰 돌 $7$, …',
          '앞에서부터 (검은 돌, 흰 돌)을 둘씩 짝 지으면 한 짝마다 흰 돌이 $2$개씩 더 많아요.',
          odd
            ? `${n}번째: 짝이 $${(n - 1) / 2}$개 → 흰 돌이 $${n - 1}$개 더 많고, 마지막에 검은 돌 $${2 * n - 1}$개를 더 놓으므로 검은 돌이 $${2 * n - 1}-${n - 1}=${n}$개 더 많아요.`
            : `${n}번째: 짝이 $${n / 2}$개 → 흰 돌이 $2\\times${n / 2}=${n}$개 더 많아요.`,
          ...(ask === 'diff'
            ? []
            : [`전체 바둑돌은 $${n}\\times${n}=${tot}$개 → ${odd ? '검은 돌' : '흰 돌'} $=(${tot}+${n})\\div2=${(tot + n) / 2}$, ${odd ? '흰 돌' : '검은 돌'} $=(${tot}-${n})\\div2=${(tot - n) / 2}$`]),
          `답: $${ans}$개`,
        ],
        hint: '새로 더해지는 돌의 수를 짝 지어 비교해 보세요.',
      };
    },
  },
];

export const MORE_E4A: Record<string, Skill[]> = {
  'e4a-1': U1,
  'e4a-2': U2,
  'e4a-3': U3,
  'e4a-4': U4,
  'e4a-5': U5,
  'e4a-6': U6,
};
/** UnitContent.top 에 더해지는 최상위 유형 */
export const MORE_TOP_E4A: Record<string, Skill[]> = {
  'e4a-1': T1,
  'e4a-2': T2,
  'e4a-3': T3,
  'e4a-4': T4,
  'e4a-5': T5,
  'e4a-6': T6,
};
