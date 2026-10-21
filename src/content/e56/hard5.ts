// 초5 심화 유형(skills 뒤에 덧붙임)과 최상위 유형(top) — 단원마다 심화 1개 + 최상위 2개
import type { Skill } from '../../core/types';
import { F } from '../../core/frac';
import { gcd, lcm, divisors, round } from '../../core/nt';
import { comma } from '../../core/tex';
import { Svg } from '../../core/fig';
import { pickName, pickNames, josa, jo, fracAns, intAns, decAns, ft, mt, dt } from './util';

// ───────── 공통 도우미 ─────────
export function perms<T>(a: readonly T[]): T[][] {
  if (a.length <= 1) return [a.slice()];
  const out: T[][] = [];
  a.forEach((x, i) => {
    for (const p of perms([...a.slice(0, i), ...a.slice(i + 1)])) out.push([x, ...p]);
  });
  return out;
}
const boxes = (cs: number[]) => cs.map((c) => `$\\boxed{${c}}$`).join(', ');
/** 수 카드 나열 + 을/를 (마지막 카드 숫자의 받침 기준) */
export const boxesJ = (cs: number[]) => `${boxes(cs)}${jo(String(cs[cs.length - 1]), '을/를')}`;
const won = (x: number) => `$${comma(x)}$ 원`;
const OPT: Record<string, string> = { '+': '+', '-': '-', '*': '\\times', '/': '\\div' };
/** 괄호 없는 식 계산 (×÷ 먼저). 나누어떨어지지 않거나 음수가 되면 null */
function evalFlat(ns: F[], os: string[]): F | null {
  const v: F[] = [ns[0]];
  const o: string[] = [];
  for (let k = 0; k < os.length; k++) {
    const op = os[k],
      x = ns[k + 1];
    if (op === '*') v[v.length - 1] = v[v.length - 1].mul(x);
    else if (op === '/') {
      if (x.n === 0) return null;
      const q = v[v.length - 1].div(x);
      if (!q.isInt()) return null;
      v[v.length - 1] = q;
    } else {
      o.push(op);
      v.push(x);
    }
  }
  let acc = v[0];
  for (let k = 0; k < o.length; k++) {
    acc = o[k] === '+' ? acc.add(v[k + 1]) : acc.sub(v[k + 1]);
    if (acc.n < 0) return null;
  }
  return acc;
}
const exprTex = (ns: (number | string)[], os: string[]) => ns.map((x, i) => (i ? ` ${OPT[os[i - 1]]} ` : '') + x).join('');

// ═════════ 5-1-1 자연수의 혼합 계산 ═════════
const e5a1Hard: Skill = {
  id: 'hard-paren',
  title: '괄호를 넣어 가장 큰(작은) 값 만들기',
  gen(r, level) {
    const n = level === 1 ? 3 : level === 2 ? 4 : 5;
    const mx = level === 1 ? 9 : level === 2 ? 12 : 15;
    for (;;) {
      const nums = Array.from({ length: n }, () => r.int(2, mx));
      const ops = Array.from({ length: n - 1 }, () => r.pick(level === 3 ? ['+', '-', '*', '/', '*'] : ['+', '-', '*']));
      if (!ops.includes('*')) continue;
      if (!ops.some((o) => o === '+' || o === '-')) continue;
      if (level === 3 && !ops.includes('/')) continue;
      const base = evalFlat(nums.map((x) => new F(x)), ops);
      if (!base) continue;
      const cands: { tex: string; v: F }[] = [];
      for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++) {
          if (i === 0 && j === n - 1) continue;
          const inner = evalFlat(nums.slice(i, j + 1).map((x) => new F(x)), ops.slice(i, j));
          if (!inner) continue;
          const ns2 = [...nums.slice(0, i).map((x) => new F(x)), inner, ...nums.slice(j + 1).map((x) => new F(x))];
          const os2 = [...ops.slice(0, i), ...ops.slice(j)];
          const v = evalFlat(ns2, os2);
          if (!v) continue;
          const shown: (number | string)[] = nums.slice();
          shown[i] = `(${shown[i]}`;
          shown[j] = `${shown[j]})`;
          cands.push({ tex: exprTex(shown, ops), v });
        }
      if (cands.length < 2) continue;
      const wantMax = level < 3 || r.chance(0.5);
      cands.sort((a, b) => (wantMax ? b.v.cmp(a.v) : a.v.cmp(b.v)));
      const best = cands[0];
      if (wantMax ? best.v.cmp(base) <= 0 : best.v.cmp(base) >= 0) continue;
      if (best.v.value > 3000) continue;
      const word = wantMax ? '가장 크게' : '가장 작게';
      const show = cands.slice(0, 3);
      return {
        q: `다음 식에 괄호를 한 번 넣어 계산 결과가 ${word} 되도록 하려고 합니다. 이때의 계산 결과를 구하세요.\n$$${exprTex(nums, ops)}$$`,
        answer: intAns(best.v.value),
        steps: [
          `괄호를 넣을 수 있는 곳마다 계산해 봐요.${level === 3 ? ' (나누어떨어지지 않거나 뺄 수 없는 식은 빼요.)' : ''}`,
          ...show.map((c) => `$${c.tex} = ${c.v.value}$`),
          `괄호가 없으면 $${base.value}$ 이므로, ${word} 되는 값은 $${best.v.value}$`,
        ],
        hint: wantMax ? '곱하는 수를 크게 만들 수 있는 곳에 괄호를 넣어 보세요.' : '빼는 수나 나누는 수를 크게 만들 수 있는 곳에 괄호를 넣어 보세요.',
      };
    }
  },
};

const CARD_T: { tex: (v: number[]) => string; f: (v: number[]) => number | null; div: boolean }[] = [
  {
    tex: (v) => `(${v[0]} + ${v[1]}) \\times ${v[2]} - ${v[3]} \\div ${v[4]}`,
    f: (v) => (v[3] % v[4] ? null : (v[0] + v[1]) * v[2] - v[3] / v[4]),
    div: true,
  },
  {
    tex: (v) => `${v[0]} \\times ${v[1]} - (${v[2]} + ${v[3]}) \\div ${v[4]}`,
    f: (v) => ((v[2] + v[3]) % v[4] ? null : v[0] * v[1] - (v[2] + v[3]) / v[4]),
    div: true,
  },
  {
    tex: (v) => `${v[0]} \\times (${v[1]} - ${v[2]}) + ${v[3]} \\div ${v[4]}`,
    f: (v) => (v[1] <= v[2] || v[3] % v[4] ? null : v[0] * (v[1] - v[2]) + v[3] / v[4]),
    div: true,
  },
  {
    tex: (v) => `(${v[0]} + ${v[1]}) \\times ${v[2]} \\div ${v[3]} - ${v[4]}`,
    f: (v) => (((v[0] + v[1]) * v[2]) % v[3] ? null : ((v[0] + v[1]) * v[2]) / v[3] - v[4]),
    div: true,
  },
  {
    tex: (v) => `${v[0]} + ${v[1]} \\times ${v[2]} - ${v[3]} \\times ${v[4]}`,
    f: (v) => v[0] + v[1] * v[2] - v[3] * v[4],
    div: false,
  },
];
const e5a1Card: Skill = {
  id: 'top-card-expr',
  title: '수 카드로 혼합 계산식의 가장 큰 값 만들기',
  gen(r) {
    for (;;) {
      const cards = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 5).sort((a, b) => a - b);
      const ti = r.int(0, CARD_T.length - 1);
      const T = CARD_T[ti];
      const res: { v: number; p: number[] }[] = [];
      for (const p of perms(cards)) {
        const v = T.f(p);
        if (v !== null && v >= 0) res.push({ v, p });
      }
      if (res.length < 3) continue;
      res.sort((a, b) => b.v - a.v);
      const best = res[0];
      const second = res.find((x) => x.v < best.v);
      if (!second) continue;
      const blank = T.tex(['\\square', '\\square', '\\square', '\\square', '\\square'] as unknown as number[]);
      return {
        q: `수 카드 ${boxesJ(cards)} 한 번씩 모두 $\\square$ 안에 넣어 식을 만들려고 합니다. 계산 결과가 가장 클 때의 값을 구하세요.${T.div ? ' (단, $\\div$ 의 계산은 나누어떨어져야 합니다.)' : ''}\n$$${blank}$$`,
        answer: intAns(best.v),
        steps: [
          '결과를 크게 하려면 곱하는 부분은 크게, 빼는 부분은 작게 만들어야 해요.',
          T.div ? '단, $\\div$ 는 나누어떨어져야 하므로 나누어떨어지는 짝을 먼저 생각해요.' : '큰 수끼리 곱해야 곱이 커지고, 빼는 곱은 작은 수끼리 곱해야 작아져요.',
          `가장 큰 값이 나오는 식: $${T.tex(best.p)}$`,
          `$${T.tex(best.p)} = ${best.v}$`,
          `다른 식, 예를 들어 $${T.tex(second.p)} = ${second.v}$ 보다 커요.`,
          `따라서 가장 큰 값은 $${best.v}$`,
        ],
        hint: '가장 큰 수를 어디에 넣어야 결과에 가장 크게 영향을 주는지 생각해 보세요.',
      };
    }
  },
};

const G = '\\text{가}',
  N = '\\text{나}';
const SYM: { tex: string; f: (x: number, y: number) => number; sub: (x: number, y: number) => string }[] = [
  { tex: `${G} \\times ${N} - (${G} + ${N})`, f: (x, y) => x * y - (x + y), sub: (x, y) => `${x} \\times ${y} - (${x} + ${y})` },
  { tex: `(${G} + ${N}) \\times ${G} - ${N}`, f: (x, y) => (x + y) * x - y, sub: (x, y) => `(${x} + ${y}) \\times ${x} - ${y}` },
  { tex: `${G} \\times ${N} + ${G} - ${N}`, f: (x, y) => x * y + x - y, sub: (x, y) => `${x} \\times ${y} + ${x} - ${y}` },
  { tex: `${G} \\times (${N} + 1) - ${N} \\times 2`, f: (x, y) => x * (y + 1) - y * 2, sub: (x, y) => `${x} \\times (${y} + 1) - ${y} \\times 2` },
];
const e5a1Sym: Skill = {
  id: 'top-symbol',
  title: '약속한 기호로 계산하기',
  gen(r) {
    for (;;) {
      const S = r.pick(SYM);
      const t = r.int(0, 2);
      const def = `$${G} \\star ${N} = ${S.tex}$`;
      if (t === 0) {
        const p = r.int(2, 7),
          q = r.int(2, 6),
          k = r.int(2, 5);
        const u = S.f(p, q);
        if (u < 2) continue;
        const v = S.f(u, k);
        if (v < 0 || v > 2000) continue;
        return {
          q: `기호 $\\star$ 를 다음과 같이 약속합니다.\n${def}\n다음을 계산하세요.\n$$(${p} \\star ${q}) \\star ${k}$$`,
          answer: intAns(v),
          steps: [
            '괄호 안을 먼저 약속대로 계산해요.',
            `$${p} \\star ${q} = ${S.sub(p, q)} = ${u}$`,
            `이제 $${u} \\star ${k}$ 를 계산해요. 가에 $${u}$, 나에 $${k}$ 를 넣어요.`,
            `$${u} \\star ${k} = ${S.sub(u, k)}$`,
            `$= ${v}$`,
          ],
        };
      }
      const q = r.int(2, 6);
      const x = r.int(2, t === 1 ? 15 : 6);
      const u = S.f(x, q);
      if (u < 2) continue;
      if (t === 1) {
        if (u > 400) continue;
        const sols = [];
        for (let z = 1; z <= 200; z++) if (S.f(z, q) === u) sols.push(z);
        if (sols.length !== 1) continue;
        return {
          q: `기호 $\\star$ 를 다음과 같이 약속합니다.\n${def}\n$\\square$ 안에 알맞은 자연수를 구하세요.\n$$\\square \\star ${q} = ${u}$$`,
          answer: intAns(x),
          steps: [
            `$\\square \\star ${q} = ${S.sub('\\square' as unknown as number, q)}$`,
            '$\\square$ 가 커질수록 계산 결과도 커지므로, 수를 차례로 넣어 보며 범위를 좁혀요.',
            x > 2 ? `$\\square = ${x - 1}$ 이면 $${S.sub(x - 1, q)} = ${S.f(x - 1, q)}$ → ${u}보다 작아요.` : `$\\square = ${x + 1}$ 이면 $${S.sub(x + 1, q)} = ${S.f(x + 1, q)}$ → ${u}보다 커요.`,
            `$\\square = ${x}$ 이면 $${S.sub(x, q)} = ${u}$ → 딱 맞아요.`,
            `따라서 $\\square = ${x}$`,
          ],
        };
      }
      const k = r.int(2, 4);
      const v = S.f(u, k);
      if (v < 0 || v > 1500) continue;
      const sols = [];
      for (let z = 1; z <= 60; z++) {
        const uu = S.f(z, q);
        if (uu >= 0 && S.f(uu, k) === v) sols.push(z);
      }
      if (sols.length !== 1) continue;
      return {
        q: `기호 $\\star$ 를 다음과 같이 약속합니다.\n${def}\n$\\square$ 안에 알맞은 자연수를 구하세요.\n$$(\\square \\star ${q}) \\star ${k} = ${v}$$`,
        answer: intAns(x),
        steps: [
          `괄호 안의 값을 $\\triangle$ 라 하면 $\\triangle \\star ${k} = ${v}$ 예요. 거꾸로 생각해요.`,
          `$\\triangle \\star ${k} = ${S.sub('\\triangle' as unknown as number, k)}$ 에 수를 넣어 보면 $\\triangle = ${u}$ 일 때 $${S.sub(u, k)} = ${v}$`,
          `이제 $\\square \\star ${q} = ${u}$ 인 $\\square$ 를 찾아요.`,
          `$\\square = ${x}$ 이면 $${S.sub(x, q)} = ${u}$`,
          `$\\square$ 가 커질수록 결과도 커지므로 답은 하나뿐이에요.`,
          `따라서 $\\square = ${x}$`,
        ],
      };
    }
  },
};

// ═════════ 5-1-2 약수와 배수 ═════════
const e5a2Hard: Skill = {
  id: 'hard-gcd-lcm',
  title: '최대공약수·최소공배수로 두 수 추론하기',
  gen(r, level) {
    for (;;) {
      if (level === 1) {
        const g = r.int(2, 6),
          p = r.int(2, 7),
          q = r.int(2, 7);
        if (p === q || gcd(p, q) !== 1) continue;
        const A = g * p,
          B = g * q,
          L = g * p * q;
        return {
          q: `두 수의 최대공약수는 $${g}$, 최소공배수는 $${L}$ 입니다. 한 수가 $${A}$ 일 때, 다른 한 수는 얼마인가요?`,
          answer: intAns(B),
          steps: [`$${A} = ${g} \\times ${p}$`, `최소공배수 $${L} = ${g} \\times ${p} \\times ${q}$`, `다른 수 $= ${g} \\times ${q} = ${B}$`],
          hint: '두 수를 각각 (최대공약수) × (어떤 수) 로 나타내 보세요.',
        };
      }
      if (level === 2) {
        const g = r.int(3, 12),
          p = r.int(2, 9),
          q = r.int(2, 9);
        if (p === q || gcd(p, q) !== 1) continue;
        const A = g * p,
          B = g * q;
        const P = A * B,
          L = g * p * q;
        if (P > 3000) continue;
        return {
          q: `두 자연수의 곱은 $${comma(P)}$ 이고, 최대공약수는 $${g}$ 입니다. 두 수의 최소공배수는 얼마인가요?`,
          answer: intAns(L),
          steps: [
            `두 수를 $${g} \\times ㉠$, $${g} \\times ㉡$ 이라 하면 최소공배수는 $${g} \\times ㉠ \\times ㉡$`,
            `두 수의 곱 $= ${g} \\times ${g} \\times ㉠ \\times ㉡ = ${g} \\times (\\text{최소공배수})$`,
            `최소공배수 $= ${comma(P)} \\div ${g} = ${L}$`,
          ],
          hint: '(두 수의 곱) = (최대공약수) × (최소공배수) 예요.',
        };
      }
      const g = r.int(3, 15),
        p = r.int(2, 9),
        q = r.int(2, 9);
      if (p >= q || gcd(p, q) !== 1) continue;
      const L = g * p * q;
      const pairs: [number, number][] = [];
      for (let a = 10; a <= 99; a++) for (let b = a + 1; b <= 99; b++) if (gcd(a, b) === g && lcm(a, b) === L) pairs.push([a, b]);
      if (pairs.length !== 1) continue;
      const [a, b] = pairs[0];
      const ks = divisors(p * q).filter((d) => gcd(d, (p * q) / d) === 1 && d < (p * q) / d);
      return {
        q: `두 자리 수인 두 자연수의 최대공약수는 $${g}$, 최소공배수는 $${L}$ 입니다. 두 수의 합은 얼마인가요?`,
        answer: intAns(a + b),
        steps: [
          `두 수를 $${g} \\times ㉠$, $${g} \\times ㉡$ (㉠, ㉡ 은 공약수가 $1$ 뿐) 이라 하면 $㉠ \\times ㉡ = ${L} \\div ${g} = ${p * q}$`,
          `곱이 $${p * q}$ 이고 공약수가 $1$ 뿐인 짝: ${ks.map((d) => `$(${d}, ${(p * q) / d})$`).join(', ')}`,
          `두 수가 모두 두 자리 수가 되는 짝은 $(${a / g}, ${b / g})$ → 두 수는 $${a}$, $${b}$`,
          `합: $${a} + ${b} = ${a + b}$`,
        ],
      };
    }
  },
};

const e5a2Rem: Skill = {
  id: 'top-remainder',
  title: '나머지 조건을 만족하는 수 찾기',
  gen(r) {
    const SETS = [
      [3, 4, 5],
      [4, 6, 9],
      [2, 5, 7],
      [3, 5, 6],
      [4, 5, 6],
      [6, 8, 9],
      [3, 4, 7],
      [5, 6, 8],
      [4, 6, 10],
      [6, 9, 12],
    ];
    const t = r.int(0, 2);
    if (t < 2) {
      const set = r.pick(SETS);
      const L = set.reduce((a, b) => lcm(a, b), 1);
      const big = r.chance(0.5);
      if (t === 0) {
        const rem = r.int(1, set[0] - 1);
        const ans = big ? Math.floor((999 - rem) / L) * L + rem : Math.ceil((100 - rem) / L) * L + rem;
        return {
          q: `어떤 세 자리 수를 ${set.map((x) => `$${x}$`).join(', ')} 로 나누면 나머지가 모두 $${rem}$ 입니다. 이런 수 중에서 가장 ${big ? '큰' : '작은'} 수를 구하세요.`,
          answer: intAns(ans),
          steps: [
            `(어떤 수) $- ${rem}$ 은 ${set.map((x) => `$${x}$`).join(', ')} 로 모두 나누어떨어져요.`,
            `즉 (어떤 수) $- ${rem}$ 은 세 수의 공배수 → 최소공배수 $${L}$ 의 배수`,
            `어떤 수는 $${L}$ 의 배수에 $${rem}$ 을 더한 수: $${L + rem}, ${2 * L + rem}, ${3 * L + rem}, \\ldots$`,
            big ? `$999 - ${rem} = ${999 - rem}$ 이하인 $${L}$ 의 배수 중 가장 큰 수는 $${ans - rem}$` : `$100 - ${rem} = ${100 - rem}$ 이상인 $${L}$ 의 배수 중 가장 작은 수는 $${ans - rem}$`,
            `따라서 $${ans - rem} + ${rem} = ${ans}$`,
          ],
          hint: '나머지를 빼면 어떤 수가 되는지 생각해 보세요.',
        };
      }
      const k = r.int(1, set[0] - 1);
      const ans = big ? Math.floor((999 + k) / L) * L - k : Math.ceil((100 + k) / L) * L - k;
      return {
        q: `어떤 세 자리 수를 ${set.map((x) => `$${x}$`).join(', ')} 로 나누면 나머지가 각각 ${set.map((x) => `$${x - k}$`).join(', ')} 입니다. 이런 수 중에서 가장 ${big ? '큰' : '작은'} 수를 구하세요.`,
        answer: intAns(ans),
        steps: [
          `나머지가 나누는 수보다 모두 $${k}$ 씩 작아요.`,
          `그래서 어떤 수에 $${k}$ 를 더하면 ${set.map((x) => `$${x}$`).join(', ')} 로 모두 나누어떨어져요.`,
          `(어떤 수) $+ ${k}$ 는 최소공배수 $${L}$ 의 배수`,
          big ? `$999 + ${k} = ${999 + k}$ 이하인 $${L}$ 의 배수 중 가장 큰 수: $${ans + k}$` : `$100 + ${k} = ${100 + k}$ 이상인 $${L}$ 의 배수 중 가장 작은 수: $${ans + k}$`,
          `따라서 어떤 수 $= ${ans + k} - ${k} = ${ans}$`,
        ],
        hint: '나머지가 나누는 수보다 얼마씩 모자란지 살펴보세요.',
      };
    }
    for (;;) {
      const a = r.int(4, 9),
        b = r.int(5, 12);
      if (a >= b || gcd(a, b) !== 1) continue;
      const r1 = r.int(1, a - 1),
        r2 = r.int(1, b - 1);
      if (r1 === r2) continue;
      let ans = 0;
      for (let n = 10; n < 1000; n++)
        if (n % a === r1 && n % b === r2) {
          ans = n;
          break;
        }
      const list: number[] = [];
      for (let n = r2; n <= ans; n += b) list.push(n);
      if (list.length < 3 || ans < 10) continue;
      return {
        q: `어떤 두 자리 수를 $${a}$ 로 나누면 나머지가 $${r1}$ 이고, $${b}$ 로 나누면 나머지가 $${r2}$ 입니다. 이런 수 중에서 가장 작은 수를 구하세요.`,
        answer: intAns(ans),
        steps: [
          `$${b}$ 로 나누면 나머지가 $${r2}$ 인 수: $${b}$ 의 배수 $+ ${r2}$`,
          `차례로 쓰면 $${list.slice(0, 6).join(', ')}${list.length > 6 ? ', \\ldots' : ''}$`,
          `이 중에서 $${a}$ 로 나누면 나머지가 $${r1}$ 인 수를 찾아요.`,
          `$${ans} = ${a} \\times ${Math.floor(ans / a)} + ${r1}$ 이므로 조건에 맞아요.`,
          `${ans >= 10 ? '두 자리 수 중' : ''} 가장 작은 수는 $${ans}$`,
        ],
        hint: '나누는 수가 큰 쪽의 조건부터 수를 차례로 써 보세요.',
      };
    }
  },
};

const e5a2Cnt: Skill = {
  id: 'top-divisor-count',
  title: '약수의 개수로 수 세기',
  gen(r) {
    const t = r.int(0, 2);
    if (t === 0 || t === 2) {
      const Nn = r.int(30, 200);
      const k = Math.floor(Math.sqrt(Nn));
      const sq = Array.from({ length: k }, (_, i) => (i + 1) ** 2);
      if (t === 0) {
        return {
          q: `$1$ 부터 $${Nn}$ 까지의 자연수 중에서 약수의 개수가 홀수인 수는 모두 몇 개인가요?`,
          answer: intAns(k, '개'),
          steps: [
            '약수는 곱해서 그 수가 되는 두 수끼리 짝을 지을 수 있어요. 예) $12$: $(1,12), (2,6), (3,4)$ → $6$ 개',
            '짝이 모두 서로 다른 두 수이면 약수의 개수는 짝수예요.',
            '같은 수를 두 번 곱한 수일 때만 짝이 하나 남아 홀수 개가 돼요. 예) $16$: $(1,16), (2,8), (4,4)$ → $5$ 개',
            `$${Nn}$ 이하에서 같은 수를 두 번 곱한 수: $${sq.length > 8 ? `${sq.slice(0, 6).join(', ')}, \\ldots, ${sq[k - 1]}` : sq.join(', ')}$`,
            `$${k} \\times ${k} = ${k * k} \\le ${Nn}$, $${k + 1} \\times ${k + 1} = ${(k + 1) ** 2} > ${Nn}$ 이므로 $${k}$ 개`,
          ],
          hint: '약수를 곱해서 그 수가 되는 짝으로 묶어 보세요.',
        };
      }
      return {
        q: `$1$ 번부터 $${Nn}$ 번까지 번호가 붙은 사물함이 모두 닫혀 있습니다. 학생 $${Nn}$ 명이 차례로 지나가는데, $1$ 번 학생은 모든 사물함을 열고, $2$ 번 학생은 $2$ 의 배수 번호 사물함의 상태를, $3$ 번 학생은 $3$ 의 배수 번호 사물함의 상태를 바꿉니다(열린 것은 닫고, 닫힌 것은 엽니다). 이렇게 $${Nn}$ 번 학생까지 지나간 뒤 열려 있는 사물함은 몇 개인가요?`,
        answer: intAns(k, '개'),
        steps: [
          '□ 번 사물함은 번호가 □ 의 약수인 학생이 지나갈 때마다 상태가 바뀌어요.',
          '그러므로 상태가 바뀌는 횟수 = □ 의 약수의 개수',
          '약수의 개수가 홀수이면 열린 채로, 짝수이면 닫힌 채로 끝나요.',
          '약수를 짝지으면 같은 수를 두 번 곱한 수만 약수의 개수가 홀수예요.',
          `$${Nn}$ 이하에서 그런 수: $${sq.length > 8 ? `${sq.slice(0, 6).join(', ')}, \\ldots, ${sq[k - 1]}` : sq.join(', ')}$ → $${k}$ 개`,
        ],
        hint: '한 사물함을 몇 명의 학생이 건드리는지 생각해 보세요.',
      };
    }
    const Nn = r.int(20, 360);
    const ps = [2, 3, 5, 7, 11, 13, 17].filter((p) => p * p <= Nn);
    return {
      q: `$1$ 부터 $${Nn}$ 까지의 자연수 중에서 약수가 정확히 $3$ 개인 수는 모두 몇 개인가요?`,
      answer: intAns(ps.length, '개'),
      steps: [
        '약수를 짝지으면, 약수가 홀수 개인 수는 같은 수를 두 번 곱한 수예요.',
        '약수가 $3$ 개이면 $1$, 자기 자신, 그리고 가운데 수 하나뿐이에요.',
        '가운데 수는 약수가 $1$ 과 자기 자신뿐인 수여야 해요: $2, 3, 5, 7, 11, \\ldots$',
        `그 수를 두 번 곱한 수 중 $${Nn}$ 이하: $${ps.map((p) => p * p).join(', ')}$`,
        `모두 $${ps.length}$ 개`,
      ],
      hint: '예를 들어 $9$ 의 약수는 $1, 3, 9$ 예요.',
    };
  },
};

// ═════════ 5-1-3 규칙과 대응 ═════════
type StickKind = 'sq' | 'tri' | 'grid';
function stickShape(s: Svg, kind: StickKind, n: number, x0: number, y0: number, u: number) {
  const L = (x1: number, y1: number, x2: number, y2: number) => s.line(x0 + x1 * u, y0 - y1 * u, x0 + x2 * u, y0 - y2 * u, { cls: 'acc', width: 2.5 });
  if (kind === 'sq') {
    L(0, 0, n, 0);
    L(0, 1, n, 1);
    for (let i = 0; i <= n; i++) L(i, 0, i, 1);
  } else if (kind === 'grid') {
    for (let j = 0; j <= 2; j++) L(0, j, n, j);
    for (let i = 0; i <= n; i++) L(i, 0, i, 2);
  } else {
    const h = 0.866;
    const pts: [number, number][] = [];
    for (let k = 0; k < n + 2; k++) pts.push(k % 2 === 0 ? [k / 2, 0] : [(k - 1) / 2 + 0.5, h]);
    for (let k = 0; k + 1 < pts.length; k++) L(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1]);
    const bs = pts.filter((p) => p[1] === 0),
      ts = pts.filter((p) => p[1] !== 0);
    L(bs[0][0], 0, bs[bs.length - 1][0], 0);
    if (ts.length > 1) L(ts[0][0], h, ts[ts.length - 1][0], h);
  }
}
function stickFig(kind: StickKind): string {
  const u = 22;
  const s = new Svg(320, kind === 'grid' ? 96 : 76);
  const y0 = kind === 'grid' ? 66 : 50;
  let x = 10;
  ['첫째', '둘째', '셋째'].forEach((lab, i) => {
    const n = i + 1;
    stickShape(s, kind, n, x, y0, u);
    const w = kind === 'tri' ? Math.ceil(n / 2) + (n % 2 === 0 ? 0.5 : 0) : n;
    s.text(x + (w * u) / 2, y0 + 16, lab, { size: 11, cls: 'muted' });
    x += w * u + 34;
  });
  return s.toString();
}
const e5a3Hard: Skill = {
  id: 'hard-stick-reverse',
  title: '성냥개비 수로 도형 개수 거꾸로 구하기',
  gen(r, level) {
    const kind: StickKind = level === 1 ? 'sq' : level === 2 ? 'tri' : r.pick(['grid', 'tri', 'grid'] as StickKind[]);
    const n = level === 1 ? r.int(8, 20) : level === 2 ? r.int(10, 30) : r.int(12, 40);
    const info = {
      sq: { what: '정사각형', a: 3, b: 1, desc: '정사각형을 한 줄로 이어 붙여', first: 4, unit: '정사각형' },
      tri: { what: '삼각형', a: 2, b: 1, desc: '삼각형을 한 줄로 이어 붙여', first: 3, unit: '삼각형' },
      grid: { what: '정사각형', a: 5, b: 2, desc: '정사각형을 위아래 두 줄로 이어 붙여', first: 7, unit: '세로 한 줄(정사각형 $2$ 개)' },
    }[kind];
    const S = info.a * n + info.b;
    const cnt = kind === 'grid' ? 2 * n : n;
    return {
      q: `성냥개비로 그림과 같이 ${info.desc} 만들고 있습니다. 같은 규칙으로 성냥개비 $${S}$ 개를 모두 사용하여 만든 모양에는 ${info.what}${jo(info.what, '이/가')} 몇 개 있나요?`,
      fig: stickFig(kind),
      answer: intAns(cnt, '개'),
      steps: [
        kind === 'grid'
          ? `세로 한 줄(정사각형 $2$ 개)이 늘 때마다 성냥개비가 $${info.a}$ 개씩 늘어요. 첫째는 $${info.first}$ 개`
          : `${info.what}${jo(info.what, '이/가')} 하나 늘 때마다 성냥개비가 $${info.a}$ 개씩 늘어요. 첫째는 $${info.first}$ 개`,
        `(성냥개비 수) $= ${info.a} \\times (\\text{${kind === 'grid' ? '세로 줄 수' : '도형 수'}}) + ${info.b}$`,
        `$${info.a} \\times \\square + ${info.b} = ${S}$ → $\\square = (${S} - ${info.b}) \\div ${info.a} = ${n}$`,
        kind === 'grid' ? `세로 줄이 $${n}$ 개이므로 정사각형은 $${n} \\times 2 = ${cnt}$ 개` : `${info.what}${jo(info.what, '은/는')} $${cnt}$ 개`,
      ],
      hint: '첫째, 둘째, 셋째 모양의 성냥개비 수를 표로 정리해 보세요.',
    };
  },
};

const e5a3Log: Skill = {
  id: 'top-log-cut',
  title: '자르는 횟수와 쉬는 시간 규칙',
  gen(r) {
    const nm = pickName(r);
    const a = r.int(3, 9),
      b = r.int(1, 4);
    const Nn = r.int(5, 16);
    const t = r.int(0, 2);
    const it = r.pick(['통나무', '긴 나무 막대', '쇠 파이프']);
    if (t === 2) {
      const T = Nn * a + (Nn - 1) * b;
      return {
        q: `${josa(nm, '은/는')} 고리 모양으로 이어진 굵은 밧줄을 자르려고 합니다. 한 번 자르는 데 $${a}$ 분이 걸리고, 한 번 자른 뒤에는 $${b}$ 분씩 쉽니다. 밧줄을 $${Nn}$ 도막으로 자르는 데 걸리는 시간은 모두 몇 분인가요? (마지막으로 자른 뒤에는 쉬지 않습니다.)`,
        answer: intAns(T, '분'),
        steps: [
          '고리 모양은 한 번 잘라도 끊어진 한 줄이 될 뿐, 도막이 늘지 않아요.',
          `그래서 고리를 $${Nn}$ 도막으로 자르려면 $${Nn}$ 번 잘라야 해요.`,
          `쉬는 횟수는 자르는 횟수보다 하나 적은 $${Nn - 1}$ 번`,
          `자르는 시간: $${a} \\times ${Nn} = ${a * Nn}$ (분), 쉬는 시간: $${b} \\times ${Nn - 1} = ${b * (Nn - 1)}$ (분)`,
          `모두 $${a * Nn} + ${b * (Nn - 1)} = ${T}$ (분)`,
        ],
        hint: '고리 모양 끈은 한 줄로 된 끈과 자르는 횟수가 달라요.',
      };
    }
    const T = (Nn - 1) * a + (Nn - 2) * b;
    if (t === 0) {
      return {
        q: `${josa(nm, '은/는')} ${josa(it, '을/를')} 자르려고 합니다. 한 번 자르는 데 $${a}$ 분이 걸리고, 한 번 자른 뒤에는 $${b}$ 분씩 쉽니다. ${josa(it, '을/를')} $${Nn}$ 도막으로 자르는 데 걸리는 시간은 모두 몇 분인가요? (마지막으로 자른 뒤에는 쉬지 않습니다.)`,
        answer: intAns(T, '분'),
        steps: [
          '(도막 수) $=$ (자른 횟수) $+ 1$ 이에요.',
          `$${Nn}$ 도막 → 자른 횟수 $${Nn} - 1 = ${Nn - 1}$ 번`,
          `쉬는 횟수는 마지막을 빼고 $${Nn - 1} - 1 = ${Nn - 2}$ 번`,
          `자르는 시간 $${a} \\times ${Nn - 1} = ${a * (Nn - 1)}$, 쉬는 시간 $${b} \\times ${Nn - 2} = ${b * (Nn - 2)}$`,
          `모두 $${a * (Nn - 1)} + ${b * (Nn - 2)} = ${T}$ (분)`,
        ],
        hint: '도막 수, 자른 횟수, 쉬는 횟수의 대응 관계를 표로 만들어 보세요.',
      };
    }
    return {
      q: `${josa(nm, '은/는')} ${josa(it, '을/를')} 똑같은 빠르기로 자르고 있습니다. 한 번 자르는 데 $${a}$ 분이 걸리고, 한 번 자른 뒤에는 $${b}$ 분씩 쉽니다. 마지막으로 자른 뒤에는 쉬지 않았고, 처음부터 끝까지 모두 $${T}$ 분이 걸렸습니다. ${josa(it, '은/는')} 몇 도막이 되었나요?`,
      answer: intAns(Nn, '도막'),
      steps: [
        `한 번 자르고 쉬는 데 $${a} + ${b} = ${a + b}$ 분씩 걸려요. 마지막 한 번은 $${a}$ 분만 걸려요.`,
        `마지막 자르기를 빼면 $${T} - ${a} = ${T - a}$ (분)`,
        `$${T - a} \\div ${a + b} = ${Nn - 2}$ → (자르고 쉬기)를 $${Nn - 2}$ 번 했어요.`,
        `자른 횟수는 모두 $${Nn - 2} + 1 = ${Nn - 1}$ 번`,
        `도막 수 $= ${Nn - 1} + 1 = ${Nn}$ (도막)`,
      ],
      hint: '마지막 한 번만 쉬지 않는다는 점을 먼저 처리해 보세요.',
    };
  },
};

const e5a3Stone: Skill = {
  id: 'top-stone-square',
  title: '정사각형 모양 바둑돌 배열의 규칙',
  gen(r) {
    const t = r.int(0, 2);
    if (t === 0) {
      const n = r.int(5, 16);
      const K = 4 * n - 4;
      return {
        q: `바둑돌을 빈틈없이 늘어놓아 정사각형 모양을 만들었습니다. 가장 바깥쪽 둘레에 놓인 바둑돌이 $${K}$ 개일 때, 정사각형 모양을 만드는 데 사용한 바둑돌은 모두 몇 개인가요?`,
        answer: intAns(n * n, '개'),
        steps: [
          '한 변에 놓인 바둑돌이 □ 개이면, 둘레의 바둑돌은 $4 \\times \\square - 4$ 개 (네 모퉁이를 두 번 세지 않도록 빼요).',
          `$4 \\times \\square - 4 = ${K}$ → $4 \\times \\square = ${K + 4}$`,
          `$\\square = ${K + 4} \\div 4 = ${n}$`,
          `전체 바둑돌: $${n} \\times ${n} = ${n * n}$ (개)`,
        ],
        hint: '모퉁이 바둑돌은 두 변에 함께 들어 있어요.',
      };
    }
    if (t === 1) {
      const n = r.int(6, 16);
      const W = 8 * n - 16;
      return {
        q: `바둑돌을 빈틈없이 늘어놓아 정사각형 모양을 만들고, 가장 바깥쪽 두 겹은 흰 바둑돌, 그 안쪽은 모두 검은 바둑돌로 놓았습니다. 흰 바둑돌이 $${W}$ 개일 때, 검은 바둑돌은 몇 개인가요?`,
        answer: intAns((n - 4) ** 2, '개'),
        steps: [
          '한 변의 바둑돌이 □ 개이면 가장 바깥 둘레는 $4 \\times \\square - 4$ 개, 그 안쪽 둘레는 한 변이 $\\square - 2$ 개라서 $4 \\times (\\square - 2) - 4$ 개',
          '두 겹을 합하면 $8 \\times \\square - 16$ 개',
          `$8 \\times \\square - 16 = ${W}$ → $\\square = (${W} + 16) \\div 8 = ${n}$`,
          `검은 바둑돌은 한 변이 $${n} - 4 = ${n - 4}$ 개인 정사각형 모양`,
          `$${n - 4} \\times ${n - 4} = ${(n - 4) ** 2}$ (개)`,
        ],
        hint: '두 겹의 바둑돌 수를 한 변의 바둑돌 수로 나타내 보세요.',
      };
    }
    const n = r.int(5, 12);
    const rings: number[] = [];
    for (let m = n; m > 0; m -= 2) rings.push(m === 1 ? 1 : 4 * m - 4);
    const black = rings.filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0);
    const white = rings.filter((_, i) => i % 2 === 1).reduce((a, b) => a + b, 0);
    return {
      q: `한 변에 바둑돌을 $${n}$ 개씩 놓아 빈틈없이 정사각형 모양을 만들었습니다. 가장 바깥쪽 둘레는 검은 바둑돌, 그 안쪽 둘레는 흰 바둑돌, 그 안쪽 둘레는 다시 검은 바둑돌 … 과 같이 번갈아 놓았습니다. 검은 바둑돌은 흰 바둑돌보다 몇 개 더 많은가요?`,
      answer: intAns(black - white, '개'),
      steps: [
        '한 변이 □ 개인 둘레에는 $4 \\times \\square - 4$ 개가 놓여요. (가운데 한 개만 남으면 $1$ 개)',
        `바깥쪽부터 한 변의 개수: $${rings.map((_, i) => n - 2 * i).join(', ')}$`,
        `둘레마다 바둑돌 수: $${rings.join(', ')}$`,
        `검은 바둑돌: $${rings.filter((_, i) => i % 2 === 0).join(' + ')} = ${black}$ (개)`,
        `흰 바둑돌: $${rings.filter((_, i) => i % 2 === 1).join(' + ')} = ${white}$ (개)`,
        `차: $${black} - ${white} = ${black - white}$ (개)`,
      ],
      hint: '안쪽으로 한 겹 들어갈 때마다 한 변의 바둑돌이 $2$ 개씩 줄어요.',
    };
  },
};

// ═════════ 5-1-4 약분과 통분 ═════════
const e5a4Hard: Skill = {
  id: 'hard-count-frac',
  title: '조건에 맞는 분수의 개수',
  gen(r, level) {
    const FR = [new F(1, 2), new F(1, 3), new F(2, 3), new F(1, 4), new F(3, 4), new F(2, 5), new F(3, 5), new F(4, 5), new F(1, 6), new F(5, 6), new F(1, 5)];
    for (;;) {
      const [x, y] = r.sample(FR, 2);
      const lo = x.cmp(y) < 0 ? x : y,
        hi = x.cmp(y) < 0 ? y : x;
      if (level === 2) {
        const Nn = lcm(lo.n, hi.n) * r.int(1, 4);
        if (Nn > 30 || Nn < 3) continue;
        const ds: number[] = [];
        for (let d = 1; d <= 300; d++) {
          const f = new F(Nn, d);
          if (f.cmp(lo) > 0 && f.cmp(hi) < 0) ds.push(d);
        }
        if (ds.length < 2 || ds.length > 12) continue;
        const a = Nn / lo.n,
          b = Nn / hi.n;
        return {
          q: `분자가 $${Nn}$ 인 분수 중에서 ${fjx(lo, '보다')} 크고 ${fjx(hi, '보다')} 작은 분수는 모두 몇 개인가요?`,
          answer: intAns(ds.length, '개'),
          steps: [
            `두 분수의 분자를 $${Nn}$ 으로 같게 만들어요: $${ft(lo)} = \\frac{${Nn}}{${lo.d * a}}$, $${ft(hi)} = \\frac{${Nn}}{${hi.d * b}}$`,
            `분자가 같으면 분모가 작을수록 큰 분수예요.`,
            `$\\frac{${Nn}}{${hi.d * b}} < \\frac{${Nn}}{\\square} < \\frac{${Nn}}{${lo.d * a}}$ → $${hi.d * b} < \\square < ${lo.d * a}$`,
            `$\\square$ 는 $${ds[0]}$ 부터 $${ds[ds.length - 1]}$ 까지 → $${ds.length}$ 개`,
          ],
          hint: '분모 대신 분자를 같게 만들어 비교해 보세요.',
        };
      }
      const D = lcm(lo.d, hi.d) * r.int(2, 4);
      if (D > 36) continue;
      const A = lo.value * D,
        B = hi.value * D;
      const ns: number[] = [];
      for (let k = A + 1; k < B; k++) if (level === 1 || gcd(k, D) === 1) ns.push(k);
      if (ns.length < 2 || ns.length > 12) continue;
      return {
        q: `분모가 $${D}$ 인 분수 중에서 ${fjx(lo, '보다')} 크고 ${fjx(hi, '보다')} 작은 ${level === 3 ? '**기약분수**' : '분수'}는 모두 몇 개인가요?`,
        answer: intAns(ns.length, '개'),
        steps: [
          `분모를 $${D}$ 로 통분: $${ft(lo)} = \\frac{${A}}{${D}}$, $${ft(hi)} = \\frac{${B}}{${D}}$`,
          `$\\frac{${A}}{${D}} < \\frac{\\square}{${D}} < \\frac{${B}}{${D}}$ → $\\square$ 는 $${A + 1}$ 부터 $${B - 1}$ 까지`,
          ...(level === 3 ? [`이 중 $${D}$ 와 공약수가 $1$ 뿐인 분자: $${ns.join(', ')}$`] : []),
          `모두 $${ns.length}$ 개`,
        ],
        hint: level === 3 ? '약분이 되는 분수는 기약분수가 아니에요.' : '두 분수를 분모가 같은 분수로 통분해 보세요.',
      };
    }
  },
};
/** 분수 + '보다' */
function fjx(f: F, post: string) {
  return `$${ft(f)}$ ${post}`;
}

const e5a4Same: Skill = {
  id: 'top-same-add',
  title: '분모·분자에 같은 수를 더하거나 빼기',
  gen(r) {
    for (;;) {
      const q = r.int(3, 9),
        p = r.int(1, q - 1);
      if (gcd(p, q) !== 1) continue;
      const k = r.int(2, 9),
        x = r.int(2, 25);
      const t = r.int(0, 2);
      const a = t === 0 ? p * k - x : t === 1 ? p * k + x : p * k - x;
      const b = t === 0 ? q * k - x : t === 1 ? q * k + x : q * k + x;
      if (a < 1 || a >= b || b > 90) continue;
      if (t === 2 && a <= 0) continue;
      const pq = new F(p, q);
      const orig = `\\frac{${a}}{${b}}`;
      if (t === 2) {
        return {
          q: `분수 $${orig}$ 의 분자에 어떤 수를 더하고, 분모에서 같은 수를 뺐더니 약분하여 $${ft(pq)}$ 가 되었습니다. 어떤 수를 구하세요.`,
          answer: intAns(x),
          steps: [
            '분자에 더한 만큼 분모에서 빼면, 분모와 분자의 **합**은 변하지 않아요.',
            `합: $${a} + ${b} = ${a + b}$`,
            `바뀐 분수는 $${ft(pq)}$ 와 크기가 같은 분수 중 분모와 분자의 합이 $${a + b}$ 인 분수예요.`,
            `$${p} + ${q} = ${p + q}$ 이고 $${a + b} \\div ${p + q} = ${k}$ → $\\frac{${p} \\times ${k}}{${q} \\times ${k}} = \\frac{${p * k}}{${q * k}}$`,
            `분자가 $${a}$ 에서 $${p * k}$ 로 바뀌었으므로 어떤 수 $= ${p * k} - ${a} = ${x}$`,
          ],
          hint: '분모와 분자의 합이 어떻게 되는지 살펴보세요.',
        };
      }
      const add = t === 0;
      return {
        q: `분수 $${orig}$ 의 분모와 분자${add ? '에' : '에서'} 같은 수를 ${add ? '더했더니' : '뺐더니'} 약분하여 $${ft(pq)}$ 가 되었습니다. ${add ? '더한' : '뺀'} 수를 구하세요.`,
        answer: intAns(x),
        steps: [
          `분모와 분자${add ? '에' : '에서'} 같은 수를 ${add ? '더해도' : '빼도'} 분모와 분자의 **차**는 변하지 않아요.`,
          `차: $${b} - ${a} = ${b - a}$`,
          `$${ft(pq)}$ 의 분모와 분자의 차는 $${q - p}$ 이고, $${b - a} \\div ${q - p} = ${k}$`,
          `바뀐 분수는 $\\frac{${p} \\times ${k}}{${q} \\times ${k}} = \\frac{${p * k}}{${q * k}}$`,
          add ? `분자가 $${a}$ 에서 $${p * k}$ 로 커졌으므로 더한 수 $= ${p * k} - ${a} = ${x}$` : `분자가 $${a}$ 에서 $${p * k}$ 로 작아졌으므로 뺀 수 $= ${a} - ${p * k} = ${x}$`,
        ],
        hint: '분모와 분자의 차가 어떻게 되는지 살펴보세요.',
      };
    }
  },
};

const e5a4Find: Skill = {
  id: 'top-find-frac',
  title: '조건으로 약분하기 전의 분수 찾기',
  gen(r) {
    for (;;) {
      const q = r.int(3, 11),
        p = r.int(1, q - 1);
      if (gcd(p, q) !== 1) continue;
      const k = r.int(2, 12);
      const t = r.int(0, 3);
      const n = p * k,
        d = q * k;
      let cond = '',
        st: string[] = [];
      if (t === 0) {
        cond = `분모와 분자의 합이 $${n + d}$`;
        st = [`$${ft(new F(p, q))}$ 와 크기가 같은 분수는 $\\frac{${p} \\times \\square}{${q} \\times \\square}$ 꼴`, `분모와 분자의 합은 $(${p} + ${q}) \\times \\square = ${p + q} \\times \\square$`, `$${p + q} \\times \\square = ${n + d}$ → $\\square = ${k}$`];
      } else if (t === 1) {
        cond = `분모와 분자의 차가 $${d - n}$`;
        st = [`$${ft(new F(p, q))}$ 와 크기가 같은 분수는 $\\frac{${p} \\times \\square}{${q} \\times \\square}$ 꼴`, `분모와 분자의 차는 $(${q} - ${p}) \\times \\square = ${q - p} \\times \\square$`, `$${q - p} \\times \\square = ${d - n}$ → $\\square = ${k}$`];
      } else if (t === 2) {
        if (p === 1) continue;
        cond = `분모와 분자의 최소공배수가 $${p * q * k}$`;
        st = [
          `구하는 분수를 $\\frac{${p} \\times \\square}{${q} \\times \\square}$ 라 하면, $${p}$ 와 $${q}$ 는 공약수가 $1$ 뿐이므로`,
          `분자와 분모의 최소공배수는 $${p} \\times ${q} \\times \\square = ${p * q} \\times \\square$`,
          `$${p * q} \\times \\square = ${p * q * k}$ → $\\square = ${k}$`,
        ];
      } else {
        if (p * q * k * k > 2000) continue;
        cond = `분모와 분자의 곱이 $${comma(n * d)}$`;
        st = [`구하는 분수를 $\\frac{${p} \\times \\square}{${q} \\times \\square}$ 라 하면`, `곱은 $${p} \\times ${q} \\times \\square \\times \\square = ${p * q} \\times \\square \\times \\square$`, `$\\square \\times \\square = ${comma(n * d)} \\div ${p * q} = ${k * k}$ → $\\square = ${k}$`];
      }
      return {
        q: `약분하면 $${ft(new F(p, q))}$ 가 되는 분수 중에서 ${cond}인 분수를 구하세요.`,
        answer: { type: 'fields', fields: [{ label: '분자', value: n }, { label: '분모', value: d }] },
        steps: [...st, `구하는 분수: $\\frac{${p} \\times ${k}}{${q} \\times ${k}} = \\frac{${n}}{${d}}$`, `확인: $\\frac{${n}}{${d}}$ 를 $${k}$ 로 약분하면 $${ft(new F(p, q))}$`],
        hint: '약분하기 전의 분수는 분모와 분자에 같은 수를 곱한 꼴이에요.',
      };
    }
  },
};

// ═════════ 5-1-5 분수의 덧셈과 뺄셈 ═════════
const e5a5Hard: Skill = {
  id: 'hard-card-mixed',
  title: '수 카드로 만든 분수의 덧셈·뺄셈',
  gen(r, level) {
    for (;;) {
      if (level < 3) {
        const cards = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 3).sort((a, b) => a - b);
        const all: { f: F; w: number; n: number; d: number }[] = [];
        for (const [w, n, d] of perms(cards)) if (n < d) all.push({ f: new F(w * d + n, d), w, n, d });
        all.sort((a, b) => a.f.cmp(b.f));
        const mn = all[0],
          mx = all[all.length - 1];
        const res = level === 1 ? mx.f.add(mn.f) : mx.f.sub(mn.f);
        const tx = (o: typeof mn) => `${o.w}\\frac{${o.n}}{${o.d}}`;
        return {
          q: `수 카드 ${boxesJ(cards)} 한 번씩 모두 사용하여 대분수를 만들려고 합니다. 만들 수 있는 가장 큰 대분수와 가장 작은 대분수의 ${level === 1 ? '합을' : '차를'} 구하세요.`,
          answer: fracAns(res),
          steps: [
            `가장 큰 대분수: 자연수 부분에 가장 큰 수 $${mx.w}$ → $${tx(mx)}$`,
            `가장 작은 대분수: 자연수 부분에 가장 작은 수 $${mn.w}$ → $${tx(mn)}$`,
            `$${tx(mx)} ${level === 1 ? '+' : '-'} ${tx(mn)} = ${mt(res)}$`,
          ],
          hint: '대분수의 크기는 먼저 자연수 부분이 결정해요.',
        };
      }
      const cards = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 4).sort((a, b) => a - b);
      const all: { f: F; p: number[] }[] = [];
      for (const p of perms(cards)) if (p[0] < p[1] && p[2] < p[3] && p[1] < p[3]) all.push({ f: new F(p[0], p[1]).add(new F(p[2], p[3])), p });
      const big = r.chance(0.5);
      all.sort((a, b) => (big ? b.f.cmp(a.f) : a.f.cmp(b.f)));
      const best = all[0];
      const second = all.find((x) => !x.f.eq(best.f));
      if (!second) continue;
      const tx = (p: number[]) => `\\frac{${p[0]}}{${p[1]}} + \\frac{${p[2]}}{${p[3]}}`;
      return {
        q: `수 카드 ${boxesJ(cards)} 한 번씩 모두 사용하여 진분수 두 개를 만들어 더하려고 합니다. 두 진분수의 합이 가장 ${big ? '클' : '작을'} 때의 합을 구하세요.`,
        answer: fracAns(best.f),
        steps: [
          big ? '합이 크려면 분자는 크게, 분모는 작게 하되 진분수가 되어야 해요.' : '합이 작으려면 분자는 작게, 분모는 크게 해야 해요.',
          big ? '가장 큰 수는 분모에 와야 해요(진분수이므로). 그다음 나머지 수를 비교해요.' : '가장 작은 두 수를 분자에, 큰 두 수를 분모에 놓고 짝을 비교해요.',
          `가장 ${big ? '큰' : '작은'} 경우: $${tx(best.p)} = ${mt(best.f)}$`,
          `다른 경우 예: $${tx(second.p)} = ${mt(second.f)}$`,
          `따라서 답은 $${mt(best.f)}$`,
        ],
      };
    }
  },
};

const e5a5Tele: Skill = {
  id: 'top-telescope',
  title: '규칙 있는 분수의 합 (단위분수의 차로)',
  gen(r) {
    if (r.chance(0.65)) {
      const a = r.int(1, 6),
        m = r.int(4, 8);
      const b = a + m - 1;
      const terms = Array.from({ length: m }, (_, i) => `\\frac{1}{${(a + i) * (a + i + 1)}}`);
      const shown = m <= 5 ? terms.join(' + ') : `${terms.slice(0, 3).join(' + ')} + \\cdots + ${terms[m - 1]}`;
      const ans = new F(1, a).sub(new F(1, b + 1));
      return {
        q: `다음 덧셈의 결과를 기약분수로 나타내세요.${m > 5 ? ` (분모는 이웃한 두 자연수의 곱이고, 모두 $${m}$ 개를 더합니다.)` : ''}\n$$${shown}$$`,
        answer: fracAns(ans),
        steps: [
          `분모를 이웃한 두 수의 곱으로 보면 $\\frac{1}{${a * (a + 1)}} = \\frac{1}{${a} \\times ${a + 1}}$, $\\frac{1}{${(a + 1) * (a + 2)}} = \\frac{1}{${a + 1} \\times ${a + 2}}$, …`,
          `$\\frac{1}{${a}} - \\frac{1}{${a + 1}} = \\frac{${a + 1}}{${a * (a + 1)}} - \\frac{${a}}{${a * (a + 1)}} = \\frac{1}{${a * (a + 1)}}$ 처럼 단위분수의 차로 바꿀 수 있어요.`,
          `식 $= (\\frac{1}{${a}} - \\frac{1}{${a + 1}}) + (\\frac{1}{${a + 1}} - \\frac{1}{${a + 2}}) + \\cdots + (\\frac{1}{${b}} - \\frac{1}{${b + 1}})$`,
          '가운데 수들은 더했다 뺐다 하며 모두 없어져요.',
          `$= \\frac{1}{${a}} - \\frac{1}{${b + 1}} = ${ft(ans)}$`,
        ],
        hint: '$\\frac{1}{2} - \\frac{1}{3}$ 을 계산해 보고 분모를 살펴보세요.',
      };
    }
    const n = r.int(5, 9);
    const terms = Array.from({ length: n }, (_, i) => `\\frac{1}{${2 ** (i + 1)}}`);
    const shown = n <= 5 ? terms.join(' + ') : `${terms.slice(0, 3).join(' + ')} + \\cdots + ${terms[n - 1]}`;
    const ans = new F(2 ** n - 1, 2 ** n);
    return {
      q: `다음 덧셈의 결과를 기약분수로 나타내세요.${n > 5 ? ` (분모가 $2$ 배씩 커지는 분수 $${n}$ 개를 더합니다.)` : ''}\n$$${shown}$$`,
      answer: fracAns(ans),
      steps: [
        '넓이가 $1$ 인 정사각형을 생각해요. 반을 칠하면 $\\frac{1}{2}$, 남은 부분의 반을 더 칠하면 $\\frac{1}{4}$ …',
        '이렇게 칠할 때마다 남는 부분은 방금 칠한 부분과 크기가 같아요.',
        `$\\frac{1}{${2 ** n}}$ 까지 칠하면 남는 부분은 $\\frac{1}{${2 ** n}}$`,
        `칠한 부분 $= 1 - \\frac{1}{${2 ** n}}$`,
        `$= \\frac{${2 ** n}}{${2 ** n}} - \\frac{1}{${2 ** n}} = ${ft(ans)}$`,
      ],
      hint: '$1$ 에서 얼마가 모자라는지 생각해 보세요.',
    };
  },
};

const e5a5Three: Skill = {
  id: 'top-three-sum',
  title: '두 개씩 더한 합으로 세 양 구하기',
  gen(r) {
    for (;;) {
      const mk = () => {
        const d = r.pick([2, 3, 4, 6]);
        return new F(r.int(0, 3) * d + r.int(1, d - 1), d);
      };
      const A = mk(),
        B = mk(),
        C = mk();
      if (A.eq(B) || B.eq(C) || A.eq(C)) continue;
      const p = A.add(B),
        q = B.add(C),
        s = A.add(C);
      if (p.isInt() || q.isInt() || s.isInt()) continue;
      const S = p.add(q).add(s),
        T = A.add(B).add(C);
      const it = r.pick([
        ['물병', 'L', '물의 양', '에 든 물의 양'],
        ['상자', 'kg', '무게', '의 무게'],
        ['리본', 'm', '길이', '의 길이'],
      ] as const);
      const ask = r.int(0, 3);
      const names = ['가', '나', '다'];
      const vals = [A, B, C];
      const restPair = [q, s, p];
      const restTx = ['나와 다', '가와 다', '가와 나'];
      const ans = ask === 3 ? T : vals[ask];
      const u = it[1];
      const qq = ask === 3 ? `세 ${it[0]}${it[3]}${jo(it[3], '을/를')} 모두 합하면` : `${it[0]} ${names[ask]}${it[3]}${jo(it[3], '은/는')}`;
      return {
        q: `${it[0]} 가, 나, 다가 있습니다. 가와 나${it[3]}${jo(it[3], '을/를')} 합하면 $${mt(p)}$ ${u}, 나와 다를 합하면 $${mt(q)}$ ${u}, 가와 다를 합하면 $${mt(s)}$ ${u}입니다. ${qq} 몇 ${u}인가요?`,
        answer: fracAns(ans, { unit: u }),
        steps: [
          '세 합을 모두 더하면 가, 나, 다가 각각 두 번씩 더해져요.',
          `$${mt(p)} + ${mt(q)} + ${mt(s)} = ${mt(S)}$ ${u}`,
          `이것은 (가 + 나 + 다)의 $2$ 배예요. $${mt(S)} = \\frac{${S.n * (12 / S.d)}}{12}$ 이므로 절반은 $\\frac{${(S.n * (12 / S.d)) / 2}}{12} = ${mt(T)}$`,
          ...(ask === 3
            ? [`따라서 세 ${it[0]}의 합은 $${mt(T)}$ ${u}`]
            : [`${names[ask]} $=$ (가 + 나 + 다) $-$ (${restTx[ask]})`, `$= ${mt(T)} - ${mt(restPair[ask])} = ${mt(ans)}$ ${u}`]),
        ],
        hint: '세 식을 모두 더하면 어떻게 되는지 생각해 보세요.',
      };
    }
  },
};

// ═════════ 5-1-6 다각형의 둘레와 넓이 ═════════
function twoRectFig(a: number, b: number, c: number, d: number, e: number, f: number, lab: { a: string; b: string; c: string; d: string; e: string; f: string }): string {
  const Wt = a - e + c,
    Ht = b - f + d;
  const s0 = Math.min(220 / Wt, 150 / Ht);
  const ox = 52,
    oy = 24;
  const S = new Svg(Math.round(Wt * s0 + 110), Math.round(Ht * s0 + 50));
  S.rect(ox, oy, a * s0, b * s0, { cls: 'acc', fill: true });
  S.rect(ox + (a - e) * s0, oy + (b - f) * s0, c * s0, d * s0, { cls: 'acc', fill: true });
  S.rect(ox + (a - e) * s0, oy + (b - f) * s0, e * s0, f * s0, { cls: 'acc2', fill: true });
  S.text(ox + (a * s0) / 2, oy - 10, lab.a, { size: 12 });
  S.text(ox - 6, oy + (b * s0) / 2, lab.b, { size: 12, anchor: 'end' });
  S.text(ox + (a - e) * s0 + (c * s0) / 2, oy + (b - f + d) * s0 + 13, lab.c, { size: 12 });
  S.text(ox + (a - e + c) * s0 + 6, oy + (b - f) * s0 + (d * s0) / 2, lab.d, { size: 12, anchor: 'start' });
  S.text(ox + (a - e) * s0 + (e * s0) / 2, oy + b * s0 + 12, lab.e, { size: 11, cls: 'acc2' });
  S.text(ox + a * s0 + 4, oy + (b - f) * s0 + (f * s0) / 2, lab.f, { size: 11, cls: 'acc2', anchor: 'start' });
  return S.toString();
}
const e5a6Hard: Skill = {
  id: 'hard-overlap',
  title: '겹쳐 놓은 도형의 넓이와 둘레',
  gen(r, level) {
    for (;;) {
      const sq = level === 2;
      const a = r.int(6, 16),
        b = sq ? a : r.int(5, 14),
        c = r.int(6, 16),
        d = sq ? c : r.int(5, 14);
      const e = r.int(2, Math.min(a, c) - 2),
        f = r.int(2, Math.min(b, d) - 2);
      if (e < 2 || f < 2) continue;
      const lab = { a: `${a} cm`, b: sq ? '' : `${b} cm`, c: `${c} cm`, d: sq ? '' : `${d} cm`, e: `${e} cm`, f: `${f} cm` };
      const fig = twoRectFig(a, b, c, d, e, f, lab);
      if (level === 1) {
        const A = a * b + c * d - e * f;
        return {
          q: `두 직사각형을 그림과 같이 겹쳐 놓았습니다. 겹친 부분도 직사각형일 때, 두 직사각형으로 덮인 전체 부분의 넓이는 몇 cm² 인가요?`,
          fig,
          answer: intAns(A, 'cm²'),
          steps: [`두 직사각형의 넓이: $${a} \\times ${b} = ${a * b}$, $${c} \\times ${d} = ${c * d}$`, `겹친 부분은 두 번 더해졌으므로 한 번 빼요: $${e} \\times ${f} = ${e * f}$`, `$${a * b} + ${c * d} - ${e * f} = ${A}$ (cm²)`],
        };
      }
      if (level === 2) {
        const A = a * a + c * c - 2 * e * f;
        return {
          q: `한 변이 $${a}$ cm 인 정사각형과 한 변이 $${c}$ cm 인 정사각형을 그림과 같이 겹쳐 놓았습니다. 두 정사각형에서 **겹치지 않은** 부분의 넓이의 합은 몇 cm² 인가요?`,
          fig,
          answer: intAns(A, 'cm²'),
          steps: [
            `두 정사각형의 넓이의 합: $${a} \\times ${a} + ${c} \\times ${c} = ${a * a + c * c}$`,
            `겹친 부분의 넓이: $${e} \\times ${f} = ${e * f}$`,
            '겹친 부분은 두 정사각형에 모두 들어 있으므로 두 번 빼요.',
            `$${a * a + c * c} - ${e * f} \\times 2 = ${A}$ (cm²)`,
          ],
        };
      }
      const P = 2 * (a + b) + 2 * (c + d) - 2 * (e + f);
      return {
        q: `두 직사각형을 그림과 같이 겹쳐 놓았습니다. 겹친 부분도 직사각형일 때, 두 직사각형으로 덮인 전체 도형의 둘레는 몇 cm 인가요?`,
        fig,
        answer: intAns(P, 'cm'),
        steps: [
          `두 직사각형의 둘레의 합: $(${a} + ${b}) \\times 2 + (${c} + ${d}) \\times 2 = ${2 * (a + b) + 2 * (c + d)}$`,
          '겹친 직사각형의 네 변은 전체 도형의 둘레가 아니라 안쪽에 들어가요.',
          `겹친 직사각형의 둘레: $(${e} + ${f}) \\times 2 = ${2 * (e + f)}$`,
          `$${2 * (a + b) + 2 * (c + d)} - ${2 * (e + f)} = ${P}$ (cm)`,
        ],
        hint: '겹친 부분의 변이 전체 도형의 둘레에 들어가는지 살펴보세요.',
      };
    }
  },
};

const e5a6Inner: Skill = {
  id: 'top-inner-area',
  title: '도형 안의 삼각형·정사각형 넓이 (발상)',
  gen(r) {
    if (r.chance(0.55)) {
      for (;;) {
        const W = 2 * r.int(5, 11),
          H = 2 * r.int(4, 8);
        const x = r.int(2, W - 2),
          y = r.int(2, H - 2);
        if (2 * x === W && 2 * y === H) continue;
        const bot = (W * y) / 2,
          top = (W * (H - y)) / 2,
          left = (H * x) / 2,
          right = (H * (W - x)) / 2;
        const areas = [top, right, bot, left];
        if (new Set(areas).size < 3) continue;
        const hide = r.int(0, 3);
        const ans = areas[hide];
        // 그림
        const u = Math.min(200 / W, 130 / H);
        const ox = 20,
          oy = 14;
        const S = new Svg(Math.round(W * u + 40), Math.round(H * u + 28));
        const P = (px: number, py: number): [number, number] => [ox + px * u, oy + (H - py) * u];
        S.rect(ox, oy, W * u, H * u, { cls: 'acc', fill: true });
        const pp = P(x, y);
        [P(0, 0), P(W, 0), P(W, H), P(0, H)].forEach((q) => S.line(pp[0], pp[1], q[0], q[1], { cls: 'acc' }));
        S.dot(pp[0], pp[1]);
        S.text(pp[0] + 8, pp[1] - 8, 'ㅇ', { size: 12 });
        const cent: [number, number][] = [
          [(0 + W + x) / 3, (H + H + y) / 3],
          [(W + W + x) / 3, (0 + H + y) / 3],
          [(0 + W + x) / 3, (0 + 0 + y) / 3],
          [(0 + 0 + x) / 3, (0 + H + y) / 3],
        ];
        const names = ['㉮', '㉯', '㉰', '㉱'];
        cent.forEach((c, i) => {
          const q = P(c[0], c[1]);
          S.text(q[0], q[1], names[i], { size: 13, cls: i === hide ? 'acc2' : undefined });
        });
        const known = [0, 1, 2, 3].filter((i) => i !== hide);
        const opp = (hide + 2) % 4;
        const others = known.filter((i) => i !== opp);
        return {
          q: `직사각형 안의 한 점 ㅇ과 네 꼭짓점을 이어 삼각형 ㉮, ㉯, ㉰, ㉱ 로 나누었습니다. ${known.map((i) => `${names[i]}의 넓이는 $${areas[i]}$ cm²`).join(', ')} 일 때, ${names[hide]}의 넓이는 몇 cm² 인가요?`,
          fig: S.toString(),
          answer: intAns(ans, 'cm²'),
          steps: [
            '마주 보는 두 삼각형 ㉮와 ㉰ 는 밑변이 직사각형의 가로로 같고, 두 높이를 더하면 직사각형의 세로가 돼요.',
            '그래서 (㉮ + ㉰) 는 직사각형 넓이의 절반이에요. ㉯ + ㉱ 도 마찬가지예요.',
            '즉 ㉮ + ㉰ $=$ ㉯ + ㉱',
            `${names[others[0]]} + ${names[others[1]]} $= ${areas[others[0]]} + ${areas[others[1]]} = ${areas[others[0]] + areas[others[1]]}$`,
            `${names[hide]} $= ${areas[others[0]] + areas[others[1]]} - ${areas[opp]} = ${ans}$ (cm²)`,
          ],
          hint: '마주 보는 두 삼각형의 넓이를 합하면 직사각형 넓이와 어떤 관계인지 생각해 보세요.',
        };
      }
    }
    for (;;) {
      const a = r.int(2, 9),
        b = r.int(2, 9);
      if (a === b) continue;
      const s0 = a + b;
      const u = 150 / s0;
      const S = new Svg(190, 190);
      const ox = 20,
        oy = 20;
      const P = (px: number, py: number): [number, number] => [ox + px * u, oy + (s0 - py) * u];
      S.rect(ox, oy, s0 * u, s0 * u, { cls: 'acc' });
      const inner: [number, number][] = [P(a, 0), P(s0, a), P(b, s0), P(0, b)];
      S.poly(inner, { cls: 'acc2', fill: true });
      const lb = (p: [number, number], t: string, dx: number, dy: number) => S.text(p[0] + dx, p[1] + dy, t, { size: 11 });
      lb(P(a / 2, 0), `${a}`, 0, 11);
      lb(P(a + b / 2, 0), `${b}`, 0, 11);
      lb(P(s0, a / 2), `${a}`, 10, 0);
      lb(P(s0, a + b / 2), `${b}`, 10, 0);
      const ans = a * a + b * b;
      const ask = r.int(0, 1);
      return {
        q: `한 변이 $${s0}$ cm 인 정사각형의 각 변을 $${a}$ cm 와 $${b}$ cm 로 나누는 점을 그림과 같이 이어 안쪽에 정사각형을 만들었습니다. ${ask === 0 ? '안쪽 정사각형의 넓이는' : '안쪽 정사각형을 뺀 나머지 네 삼각형의 넓이의 합은'} 몇 cm² 인가요?`,
        fig: S.toString(),
        answer: intAns(ask === 0 ? ans : 2 * a * b, 'cm²'),
        steps: [
          `바깥 정사각형의 넓이: $${s0} \\times ${s0} = ${s0 * s0}$ (cm²)`,
          `네 모퉁이의 삼각형은 모두 직각을 낀 두 변이 $${a}$ cm, $${b}$ cm 인 직각삼각형이에요.`,
          `삼각형 하나: $${a} \\times ${b} \\div 2 = ${(a * b) / 2}$, 네 개: $${(a * b) / 2} \\times 4 = ${2 * a * b}$ (cm²)`,
          ask === 0 ? `안쪽 정사각형: $${s0 * s0} - ${2 * a * b} = ${ans}$ (cm²)` : `네 삼각형의 넓이의 합은 $${2 * a * b}$ cm²`,
          ask === 0 ? `(참고: $${a} \\times ${a} + ${b} \\times ${b} = ${ans}$ 과 같아요.)` : `(안쪽 정사각형은 $${s0 * s0} - ${2 * a * b} = ${ans}$ cm²)`,
        ],
        hint: '바깥 정사각형에서 네 삼각형을 빼 보세요.',
      };
    }
  },
};

const e5a6Opt: Skill = {
  id: 'top-rect-opt',
  title: '조건에 맞는 직사각형의 가장 긴(짧은) 둘레·넓이',
  gen(r) {
    const t = r.int(0, 2);
    if (t === 0) {
      const A = r.pick([36, 48, 60, 72, 84, 90, 96, 100, 120, 144, 64, 80]);
      const pairs = divisors(A)
        .filter((d) => d * d <= A)
        .map((d) => [d, A / d]);
      const short = r.chance(0.5);
      const best = short ? pairs[pairs.length - 1] : pairs[0];
      const P = 2 * (best[0] + best[1]);
      return {
        q: `넓이가 $${A}$ cm² 인 직사각형을 그리려고 합니다. 가로와 세로가 모두 자연수(cm)일 때, 둘레가 가장 ${short ? '짧은' : '긴'} 직사각형의 둘레는 몇 cm 인가요? (정사각형도 직사각형입니다.)`,
        answer: intAns(P, 'cm'),
        steps: [
          `곱해서 $${A}$ 가 되는 (가로, 세로): ${pairs.map((p) => `$(${p[0]}, ${p[1]})$`).join(', ')}`,
          `둘레 $= (\\text{가로} + \\text{세로}) \\times 2$ 이므로 가로와 세로의 합이 ${short ? '작을' : '클'}수록 둘레가 ${short ? '짧아요' : '길어요'}.`,
          `합: ${pairs.map((p) => `$${p[0] + p[1]}$`).join(', ')}`,
          short ? '두 변의 길이가 가까울수록 합이 작아요.' : '두 변의 길이 차이가 클수록 합이 커요.',
          `둘레: $(${best[0]} + ${best[1]}) \\times 2 = ${P}$ (cm)`,
        ],
      };
    }
    if (t === 1) {
      const P = 2 * r.int(10, 30);
      const s = P / 2;
      const big = r.chance(0.6);
      const w = big ? Math.floor(s / 2) : 1;
      const A = w * (s - w);
      const ex = [1, 2, 3].map((k) => `$${k} \\times ${s - k} = ${k * (s - k)}$`);
      return {
        q: `둘레가 $${P}$ cm 인 직사각형을 그리려고 합니다. 가로와 세로가 모두 자연수(cm)일 때, 넓이가 가장 ${big ? '넓은' : '좁은'} 직사각형의 넓이는 몇 cm² 인가요? (정사각형도 직사각형입니다.)`,
        answer: intAns(A, 'cm²'),
        steps: [
          `가로 $+$ 세로 $= ${P} \\div 2 = ${s}$ (cm)`,
          `합이 $${s}$ 인 두 수의 곱을 차례로 구하면 ${ex.join(', ')}, …`,
          big ? '두 수의 차이가 작을수록 곱이 커요.' : '두 수의 차이가 클수록 곱이 작아요.',
          big ? `가장 가까운 두 수: $${w}$ 와 $${s - w}$` : `가장 차이가 큰 두 수: $1$ 과 $${s - 1}$`,
          `넓이: $${w} \\times ${s - w} = ${A}$ (cm²)`,
        ],
      };
    }
    const Nn = r.pick([24, 30, 36, 40, 42, 48, 60, 64, 72, 80, 84, 90, 96, 100]);
    const pairs = divisors(Nn)
      .filter((d) => d * d <= Nn)
      .map((d) => [d, Nn / d]);
    return {
      q: `한 변이 $1$ cm 인 정사각형 모양 타일 $${Nn}$ 장을 겹치지 않게 모두 사용하여 직사각형(정사각형 포함) 한 개를 만들려고 합니다. 만들 수 있는 직사각형은 모두 몇 가지인가요? (돌리거나 뒤집어서 같은 모양은 한 가지로 셉니다.)`,
      answer: intAns(pairs.length, '가지'),
      steps: [
        `가로 $\\times$ 세로 $= ${Nn}$ 이 되어야 해요.`,
        `$${Nn}$ 의 약수: $${divisors(Nn).join(', ')}$`,
        '가로와 세로를 바꾼 것은 같은 모양이므로 짝으로 묶어요.',
        `${pairs.map((p) => `$${p[0]} \\times ${p[1]}$`).join(', ')}`,
        `모두 $${pairs.length}$ 가지`,
      ],
    };
  },
};

// ═════════ 5-2-1 수의 범위와 어림하기 ═════════
type RM = '올림' | '버림' | '반올림';
function roundTo(n: number, p: number, m: RM): number {
  if (m === '올림') return Math.ceil(n / p) * p;
  if (m === '버림') return Math.floor(n / p) * p;
  return Math.floor(n / p + 0.5) * p;
}
const PLACE: Record<number, string> = { 10: '십', 100: '백', 1000: '천' };
const e5b1Hard: Skill = {
  id: 'hard-card-round',
  title: '수 카드로 만든 수 어림하기',
  gen(r, level) {
    for (;;) {
      if (level === 1) {
        const cards = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 3);
        const big = r.chance(0.5);
        const sorted = [...cards].sort((a, b) => (big ? b - a : a - b));
        const num = Number(sorted.join(''));
        const m = r.pick(['올림', '버림', '반올림'] as RM[]);
        const p = r.pick([10, 100]);
        const v = roundTo(num, p, m);
        if (v === num) continue;
        return {
          q: `수 카드 ${boxesJ(cards)} 한 번씩 모두 사용하여 만들 수 있는 가장 ${big ? '큰' : '작은'} 세 자리 수를 ${m}하여 ${PLACE[p]}의 자리까지 나타내세요.`,
          answer: intAns(v),
          steps: [`가장 ${big ? '큰' : '작은'} 수: 높은 자리부터 ${big ? '큰' : '작은'} 수를 차례로 → $${num}$`, `$${num}$ 을 ${m}하여 ${PLACE[p]}의 자리까지: $${v}$`],
        };
      }
      const cards = r.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 4);
      const nums = [...new Set(perms(cards).filter((p) => p[0] !== 0).map((p) => Number(p.join(''))))];
      const m = r.pick(['올림', '버림', '반올림'] as RM[]);
      const p = level === 2 ? 100 : 1000;
      const groups = new Map<number, number[]>();
      for (const x of nums) {
        const v = roundTo(x, p, m);
        groups.set(v, [...(groups.get(v) ?? []), x]);
      }
      const good = [...groups.entries()].filter(([, xs]) => xs.length >= 2 && xs.length <= (level === 2 ? 8 : 18));
      if (!good.length) continue;
      const [X, xs] = r.pick(good);
      xs.sort((a, b) => a - b);
      if (level === 2) {
        return {
          q: `수 카드 ${boxesJ(cards)} 한 번씩 모두 사용하여 네 자리 수를 만들려고 합니다. 만든 수를 ${m}하여 백의 자리까지 나타내면 $${comma(X)}$ 가 되는 수는 모두 몇 개인가요?`,
          answer: intAns(xs.length, '개'),
          steps: [
            `${m}하여 백의 자리까지 나타내어 $${comma(X)}$ 가 되는 수의 범위: ${rangeText(X, p, m)}`,
            `카드로 만들 수 있는 수 중 이 범위에 드는 수: $${xs.map((x) => comma(x)).join(', ')}$`,
            `모두 $${xs.length}$ 개`,
          ],
          hint: '먼저 어림한 값이 되는 수의 범위를 구하세요.',
        };
      }
      const big = r.chance(0.5);
      const ans = big ? xs[xs.length - 1] : xs[0];
      return {
        q: `수 카드 ${boxesJ(cards)} 한 번씩 모두 사용하여 네 자리 수를 만들려고 합니다. ${m}하여 천의 자리까지 나타내면 $${comma(X)}$ 가 되는 수 중에서 가장 ${big ? '큰' : '작은'} 수를 구하세요.`,
        answer: intAns(ans),
        steps: [
          `${m}하여 천의 자리까지 나타내어 $${comma(X)}$ 가 되는 수의 범위: ${rangeText(X, p, m)}`,
          `이 범위에서 천의 자리와 백의 자리에 올 수 있는 카드를 먼저 정해요.`,
          `만들 수 있는 수 중 범위에 드는 수 가운데 가장 ${big ? '큰' : '작은'} 수: $${comma(ans)}$`,
        ],
        hint: '천의 자리 숫자가 될 수 있는 카드부터 생각해 보세요.',
      };
    }
  },
};
function rangeText(X: number, p: number, m: RM): string {
  if (m === '올림') return `$${comma(X - p)}$ 초과 $${comma(X)}$ 이하`;
  if (m === '버림') return `$${comma(X)}$ 이상 $${comma(X + p)}$ 미만`;
  return `$${comma(X - p / 2)}$ 이상 $${comma(X + p / 2)}$ 미만`;
}

const e5b1Same: Skill = {
  id: 'top-same-round',
  title: '두 가지 어림이 같아지는 수 세기',
  gen(r) {
    const pairs: [RM, RM][] = [
      ['올림', '반올림'],
      ['버림', '반올림'],
      ['올림', '버림'],
    ];
    const [m1, m2] = r.pick(pairs);
    const p = r.pick([10, 100]);
    let A: number, B: number, desc: string;
    if (p === 10) {
      if (r.chance(0.4)) {
        A = 10;
        B = 100;
        desc = '두 자리 수';
      } else {
        A = r.int(10, 40) * 10;
        B = A + r.int(5, 30) * 10;
        desc = `$${A}$ 이상 $${B}$ 미만인 자연수`;
      }
    } else if (r.chance(0.4)) {
      A = 100;
      B = 1000;
      desc = '세 자리 수';
    } else {
      A = r.int(10, 40) * 100;
      B = A + r.int(3, 20) * 100;
      desc = `$${comma(A)}$ 이상 $${comma(B)}$ 미만인 자연수`;
    }
    let cnt = 0;
    for (let x = A; x < B; x++) if (roundTo(x, p, m1) === roundTo(x, p, m2)) cnt++;
    const blocks = (B - A) / p;
    const per = cnt / blocks;
    const low = p === 10 ? '일의 자리 숫자' : '십의 자리 이하(아래 두 자리)';
    const cond =
      m1 === '올림' && m2 === '반올림'
        ? `${low}가 $0$ 이거나 반올림할 때 올리는 경우(${p === 10 ? '$5$ 이상' : '$50$ 이상'})`
        : m1 === '버림'
          ? `반올림할 때 버리는 경우, 즉 ${low}가 ${p === 10 ? '$0$ 부터 $4$ 까지' : '$00$ 부터 $49$ 까지'}`
          : `${low}가 모두 $0$ 인 경우(올림과 버림 모두 그대로)`;
    const ex = A;
    const exList =
      m1 === '올림' && m2 === '반올림'
        ? `$${comma(ex)}$, $${comma(ex + p / 2)}$ 부터 $${comma(ex + p - 1)}$ 까지`
        : m1 === '버림'
          ? `$${comma(ex)}$ 부터 $${comma(ex + p / 2 - 1)}$ 까지`
          : `$${comma(ex)}$`;
    return {
      q: `${desc} 중에서 ${m1}하여 ${PLACE[p]}의 자리까지 나타낸 수와 ${m2}하여 ${PLACE[p]}의 자리까지 나타낸 수가 같은 수는 모두 몇 개인가요?`,
      answer: intAns(cnt, '개'),
      steps: [
        `두 어림한 값이 같으려면 ${cond}여야 해요.`,
        m1 === '올림' && m2 !== '버림' ? `${low}가 $0$ 이 아니면서 반올림에서 버리는 경우에는 올림과 값이 달라져요.` : m1 === '버림' ? '반올림에서 올리는 경우에는 버림한 값보다 커져요.' : '아랫자리에 $0$ 이 아닌 숫자가 있으면 올림한 값이 버림한 값보다 커요.',
        `$${comma(ex)}$ 부터 $${comma(ex + p - 1)}$ 까지 $${p}$ 개 중 조건에 맞는 수: ${exList} → $${per}$ 개`,
        `이런 묶음이 $(${comma(B)} - ${comma(A)}) \\div ${p} = ${blocks}$ 개`,
        `$${per} \\times ${blocks} = ${cnt}$ (개)`,
      ],
      hint: `${PLACE[p]}의 자리 아랫부분에 따라 경우를 나누어 보세요.`,
    };
  },
};

const e5b1Cost: Skill = {
  id: 'top-min-cost',
  title: '어림을 이용한 가장 적은 비용',
  gen(r) {
    for (;;) {
      if (r.chance(0.5)) {
        const Nn = r.int(60, 220);
        const a = r.pick([45, 40, 35]),
          b = r.pick([25, 15, 12]);
        const x = r.int(30, 50) * 10000,
          y = r.int(12, 28) * 10000;
        if (y >= x || y / b <= x / a) continue;
        const opts: { i: number; j: number; c: number }[] = [];
        for (let i = 0; i <= Math.ceil(Nn / a); i++) {
          const j = Math.max(0, Math.ceil((Nn - i * a) / b));
          opts.push({ i, j, c: i * x + j * y });
        }
        const bo = opts.reduce((m0, o) => (o.c < m0.c ? o : m0));
        const best = bo.c;
        const naive = Math.ceil(Nn / a) * x;
        if (best >= naive || opts.length < 3) continue;
        const show = opts.filter((o) => Math.abs(o.i - bo.i) <= 1 && o.i !== Math.ceil(Nn / a)).map((o) => `대형 $${o.i}$ 대 $+$ 소형 $${o.j}$ 대: $${comma(o.c)}$ 원`);
        return {
          q: `학생 $${Nn}$ 명이 모두 버스를 타고 체험 학습을 가려고 합니다. $${a}$ 명까지 탈 수 있는 대형 버스는 한 대에 ${won(x)}, $${b}$ 명까지 탈 수 있는 소형 버스는 한 대에 ${won(y)}입니다. 학생들이 모두 타려면 버스 빌리는 값은 적어도 얼마인가요?`,
          answer: intAns(best, '원'),
          steps: [
            `한 사람당 값은 대형 버스가 더 싸므로 대형 버스를 많이 쓰되, 남는 자리가 많으면 소형 버스로 바꿔 봐요.`,
            `대형 버스만: $${Nn} \\div ${a}$ → 올림하여 $${Math.ceil(Nn / a)}$ 대, $${comma(naive)}$ 원`,
            '대형 버스 수를 하나씩 줄이고 모자란 자리는 소형 버스로 채워 비교해요.',
            ...show,
            `가장 적은 값: 대형 $${bo.i}$ 대, 소형 $${bo.j}$ 대 → $${comma(best)}$ 원`,
          ],
          hint: '대형 버스 수를 정하면 필요한 소형 버스 수는 올림으로 구할 수 있어요.',
        };
      }
      const pp = r.int(5, 12) * 100;
      const qq = r.int(6, 9) * pp - r.int(0, 4) * 100;
      const Nn = r.int(23, 98);
      if (Nn % 10 === 0) continue;
      const rem = Nn % 10;
      const it = r.pick(['공책', '연필', '스케치북', '색종이 묶음']);
      const u = it === '연필' ? '자루' : '권';
      const naive = Math.floor(Nn / 10) * qq + rem * pp;
      const alt = Math.ceil(Nn / 10) * qq;
      const best = Math.min(naive, alt);
      if (best >= naive) continue;
      return {
        q: `문구점에서 ${it}${jo(it, '을/를')} 낱개로 사면 한 ${u}에 ${won(pp)}이고, $10$ ${u} 묶음으로 사면 한 묶음에 ${won(qq)}입니다. ${it}${jo(it, '이/가')} 적어도 $${Nn}$ ${u} 필요할 때, 가장 적은 돈으로 사려면 얼마가 드나요? (필요한 것보다 많이 사도 됩니다.)`,
        answer: intAns(best, '원'),
        steps: [
          `$${Nn}$ ${u} $= 10$ ${u} 묶음 $${Math.floor(Nn / 10)}$ 개 $+$ 낱개 $${rem}$ ${u}`,
          `그대로 사면: $${comma(qq)} \\times ${Math.floor(Nn / 10)} + ${comma(pp)} \\times ${rem} = ${comma(naive)}$ 원`,
          `낱개 $${rem}$ ${u} 값 $${comma(pp * rem)}$ 원은 한 묶음 값 $${comma(qq)}$ 원보다 비싸요.`,
          `묶음을 올림하여 $${Math.ceil(Nn / 10)}$ 개 사면: $${comma(qq)} \\times ${Math.ceil(Nn / 10)} = ${comma(alt)}$ 원`,
          `가장 적은 돈: $${comma(best)}$ 원`,
        ],
        hint: '남는 낱개를 사는 값과 한 묶음 값을 비교해 보세요.',
      };
    }
  },
};

// ═════════ 5-2-2 분수의 곱셈 ═════════
const e5b2Hard: Skill = {
  id: 'hard-card-fmul',
  title: '수 카드로 만든 분수의 곱 가장 크게(작게)',
  gen(r, level) {
    for (;;) {
      const k = level === 1 ? 3 : level === 2 ? 4 : 5;
      const cards = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], k).sort((a, b) => a - b);
      const big = level === 1 || (level === 3 ? r.chance(0.7) : r.chance(0.3));
      const all: { f: F; tx: string }[] = [];
      for (const p of perms(cards)) {
        if (level === 1) {
          if (p[1] < p[2]) all.push({ f: new F(p[0] * p[1], p[2]), tx: `${p[0]} \\times \\frac{${p[1]}}{${p[2]}}` });
        } else if (level === 2) {
          if (p[0] < p[1] && p[2] < p[3] && p[0] < p[2]) all.push({ f: new F(p[0] * p[2], p[1] * p[3]), tx: `\\frac{${p[0]}}{${p[1]}} \\times \\frac{${p[2]}}{${p[3]}}` });
        } else if (p[1] < p[2] && p[3] < p[4]) {
          all.push({ f: new F(p[0] * p[2] + p[1], p[2]).mul(new F(p[3], p[4])), tx: `${p[0]}\\frac{${p[1]}}{${p[2]}} \\times \\frac{${p[3]}}{${p[4]}}` });
        }
      }
      all.sort((a, b) => (big ? b.f.cmp(a.f) : a.f.cmp(b.f)));
      const best = all[0];
      const second = all.find((x) => !x.f.eq(best.f));
      if (!second) continue;
      const form = level === 1 ? '(자연수) $\\times$ (진분수)' : level === 2 ? '(진분수) $\\times$ (진분수)' : '(대분수) $\\times$ (진분수)';
      return {
        q: `수 카드 ${boxesJ(cards)} 한 번씩 모두 사용하여 ${form} 의 곱셈식을 만들려고 합니다. 곱이 가장 ${big ? '클' : '작을'} 때의 곱을 구하세요.`,
        answer: fracAns(best.f),
        steps: [
          big ? '곱이 크려면 곱하는 수(자연수·분자)는 크게, 분모는 작게 해야 해요.' : '곱이 작으려면 분자는 작게, 분모는 크게 해야 해요.',
          level === 3 ? '대분수는 자연수 부분이 곱의 크기를 가장 크게 좌우해요.' : '진분수가 되어야 하므로 분자가 분모보다 작게 놓아요.',
          `가장 ${big ? '큰' : '작은'} 경우: $${best.tx} = ${mt(best.f)}$`,
          `비교: $${second.tx} = ${mt(second.f)}$`,
          `답: $${mt(best.f)}$`,
        ],
      };
    }
  },
};

const UFR = [new F(1, 2), new F(1, 3), new F(2, 3), new F(1, 4), new F(3, 4), new F(2, 5), new F(3, 5), new F(1, 5), new F(1, 6), new F(5, 6), new F(3, 8)];
const e5b2Rev: Skill = {
  id: 'top-remain-reverse',
  title: '남은 양으로 처음 양 거꾸로 구하기',
  gen(r) {
    for (;;) {
      const nm = pickName(r);
      if (r.chance(0.55)) {
        const [f1, f2, f3] = [r.pick(UFR), r.pick(UFR), r.pick(UFR)];
        const k = r.int(1, 4);
        const T = k * f1.d * f2.d * f3.d;
        if (T > 720 || T < 30) continue;
        const r1 = new F(T).mul(new F(1).sub(f1)),
          r2 = r1.mul(new F(1).sub(f2)),
          r3 = r2.mul(new F(1).sub(f3));
        if (!r1.isInt() || !r2.isInt() || !r3.isInt() || r3.value < 3) continue;
        const g = (f: F) => new F(1).sub(f);
        return {
          q: `${josa(nm, '은/는')} 책 한 권을 읽었습니다. 첫째 날에는 전체의 $${ft(f1)}$ 를, 둘째 날에는 남은 쪽수의 $${ft(f2)}$ 를, 셋째 날에는 그 나머지의 $${ft(f3)}$ 를 읽었더니 $${r3.value}$ 쪽이 남았습니다. 이 책은 모두 몇 쪽인가요?`,
          answer: intAns(T, '쪽'),
          steps: [
            '끝에서부터 거꾸로 생각해요.',
            `셋째 날에 읽고 남은 $${r3.value}$ 쪽은 셋째 날 읽기 전 쪽수의 $1 - ${ft(f3)} = ${ft(g(f3))}$ → 셋째 날 전: $${r3.value} \\div ${g(f3).n} \\times ${g(f3).d} = ${r2.value}$ (쪽)`,
            `$${r2.value}$ 쪽은 둘째 날 읽기 전의 $${ft(g(f2))}$ → 둘째 날 전: $${r2.value} \\div ${g(f2).n} \\times ${g(f2).d} = ${r1.value}$ (쪽)`,
            `$${r1.value}$ 쪽은 전체의 $${ft(g(f1))}$ → 전체: $${r1.value} \\div ${g(f1).n} \\times ${g(f1).d} = ${T}$ (쪽)`,
            `확인: $${T} \\times ${ft(g(f1))} \\times ${ft(g(f2))} \\times ${ft(g(f3))} = ${r3.value}$`,
          ],
          hint: '남은 양이 그 전 양의 몇 분의 몇인지 생각해 보세요.',
        };
      }
      const [f1, f2] = [r.pick(UFR), r.pick(UFR)];
      const m = r.int(2, 9);
      const k = r.int(1, 6);
      const T = k * f1.d * f2.d;
      if (T > 600 || T < 24) continue;
      const r1 = new F(T).mul(new F(1).sub(f1));
      const use2 = r1.mul(f2);
      if (!r1.isInt() || !use2.isInt()) continue;
      const r2 = r1.value - use2.value - m;
      if (r2 < 3) continue;
      const it = r.pick([
        ['사탕', '개'],
        ['구슬', '개'],
        ['색종이', '장'],
      ] as const);
      const g1 = new F(1).sub(f1),
        g2 = new F(1).sub(f2);
      return {
        q: `${josa(nm, '은/는')} 가지고 있던 ${it[0]} 중에서 전체의 $${ft(f1)}$ 를 동생에게 주고, 남은 것의 $${ft(f2)}$ 보다 $${m}$ ${it[1]} 더 많이 친구에게 주었더니 $${r2}$ ${it[1]}${jo(it[1], '이/가')} 남았습니다. 처음에 가지고 있던 ${it[0]}${jo(it[0], '은/는')} 몇 ${it[1]}인가요?`,
        answer: intAns(T, it[1]),
        steps: [
          '끝에서부터 거꾸로 생각해요.',
          `친구에게 더 준 $${m}$ ${it[1]}${jo(it[1], '을/를')} 되돌리면 $${r2} + ${m} = ${r2 + m}$ (${it[1]}) → 동생에게 주고 남은 것의 $1 - ${ft(f2)} = ${ft(g2)}$`,
          `동생에게 주고 남은 것: $${r2 + m} \\div ${g2.n} \\times ${g2.d} = ${r1.value}$ (${it[1]})`,
          `$${r1.value}$ ${it[1]}${jo(it[1], '은/는')} 처음의 $1 - ${ft(f1)} = ${ft(g1)}$`,
          `처음: $${r1.value} \\div ${g1.n} \\times ${g1.d} = ${T}$ (${it[1]})`,
        ],
        hint: '"보다 몇 개 더" 준 부분을 먼저 되돌려 놓아 보세요.',
      };
    }
  },
};

const e5b2Ball: Skill = {
  id: 'top-bounce',
  title: '튀어 오르는 공이 움직인 거리',
  gen(r) {
    const k = r.pick([new F(1, 2), new F(2, 3), new F(3, 4), new F(3, 5), new F(2, 5), new F(4, 5)]);
    const t = r.int(0, 2);
    if (t === 1) {
      const c = r.int(1, 3);
      const h = c * k.d ** 3;
      if (h > 400) return e5b2Ball.gen(r, 3);
      const X = new F(h).mul(k.pow(3));
      return {
        q: `어떤 공은 떨어진 높이의 $${ft(k)}$ 만큼 튀어 오릅니다. 이 공을 어떤 높이에서 떨어뜨렸더니 세 번째로 튀어 오른 높이가 $${mt(X)}$ m 였습니다. 처음에 공을 떨어뜨린 높이는 몇 m 인가요?`,
        answer: intAns(h, 'm'),
        steps: [
          `한 번 튈 때마다 높이가 그 전 높이의 $${ft(k)}$ 가 돼요.`,
          `세 번째로 튀어 오른 높이 $=$ 처음 높이 $\\times ${ft(k)} \\times ${ft(k)} \\times ${ft(k)} = $ 처음 높이 $\\times ${ft(k.pow(3))}$`,
          `처음 높이의 $${ft(k.pow(3))}$ 가 $${mt(X)}$ m 이므로 처음 높이의 $\\frac{1}{${k.pow(3).d}}$ 은 $${mt(X)} \\div ${k.pow(3).n} = ${mt(X.div(k.pow(3).n))}$ (m)`,
          `처음 높이: $${mt(X.div(k.pow(3).n))} \\times ${k.pow(3).d} = ${h}$ (m)`,
          `확인: $${h} \\times ${ft(k.pow(3))} = ${mt(X)}$`,
        ],
        hint: '거꾸로 생각해요. 세 번 튄 높이는 처음 높이의 몇 분의 몇일까요?',
      };
    }
    const m = r.int(2, 4);
    const h = r.chance(0.6) ? r.int(1, 3) * k.d ** (m - 1) : r.int(5, 30);
    if (h > 300) return e5b2Ball.gen(r, 3);
    const hs: F[] = [];
    for (let i = 1; i < m; i++) hs.push(new F(h).mul(k.pow(i)));
    const up = hs.reduce((a, b) => a.add(b), new F(0));
    if (t === 0) {
      const tot = up.mul(2).add(h);
      return {
        q: `어떤 공은 떨어진 높이의 $${ft(k)}$ 만큼 튀어 오릅니다. 이 공을 $${h}$ m 높이에서 떨어뜨렸을 때, 공이 땅에 $${m}$ 번째로 닿을 때까지 움직인 거리는 모두 몇 m 인가요?`,
        answer: fracAns(tot, { unit: 'm' }),
        steps: [
          `튀어 오른 높이: ${hs.map((x, i) => `${i + 1} 번째 $${mt(x)}$ m`).join(', ')}`,
          '처음 떨어진 거리는 한 번, 튀어 오른 높이는 올라갔다가 다시 내려오므로 두 번씩 더해요.',
          hs.length > 1 ? `튀어 오른 높이의 합: $${hs.map((x) => mt(x)).join(' + ')} = ${mt(up)}$ (m)` : `튀어 오른 높이는 $${mt(up)}$ m 한 번뿐이에요.`,
          `움직인 거리: $${h} + ${mt(up)} \\times 2$`,
          `$= ${h} + ${mt(up.mul(2))} = ${mt(tot)}$ (m)`,
        ],
        hint: '튀어 오른 거리는 올라갈 때와 내려올 때 두 번 움직여요.',
      };
    }
    const last = new F(h).mul(k.pow(m));
    const tot = up.mul(2).add(h).add(last);
    return {
      q: `어떤 공은 떨어진 높이의 $${ft(k)}$ 만큼 튀어 오릅니다. 이 공을 $${h}$ m 높이에서 떨어뜨렸을 때, 공이 $${m}$ 번째로 튀어 올라 가장 높은 곳에 이를 때까지 움직인 거리는 모두 몇 m 인가요?`,
      answer: fracAns(tot, { unit: 'm' }),
      steps: [
        `튀어 오른 높이: ${[...hs, last].map((x, i) => `${i + 1} 번째 $${mt(x)}$ m`).join(', ')}`,
        `$${m - 1}$ 번째까지는 올라갔다 내려오므로 두 번씩, $${m}$ 번째는 올라가기만 하므로 한 번 더해요.`,
        `$${h} + ${hs.length > 1 ? `(${hs.map((x) => mt(x)).join(' + ')})` : mt(hs[0])} \\times 2 + ${mt(last)}$`,
        `$= ${h} + ${mt(up.mul(2))} + ${mt(last)}$`,
        `$= ${mt(tot)}$ (m)`,
      ],
      hint: '마지막으로 튀어 오를 때는 다시 내려오지 않아요.',
    };
  },
};

// ═════════ 5-2-3 합동과 대칭 ═════════
type Pt = [number, number];
function angLabel(S: Svg, v: Pt, a: Pt, b: Pt, t: string, d = 26) {
  const u1 = [a[0] - v[0], a[1] - v[1]],
    u2 = [b[0] - v[0], b[1] - v[1]];
  const l1 = Math.hypot(u1[0], u1[1]),
    l2 = Math.hypot(u2[0], u2[1]);
  let bx = u1[0] / l1 + u2[0] / l2,
    by = u1[1] / l1 + u2[1] / l2;
  const bl = Math.hypot(bx, by) || 1;
  bx /= bl;
  by /= bl;
  S.text(v[0] + bx * d, v[1] + by * d, t, { size: 12, cls: 'acc2' });
}
function vLabel(S: Svg, p: Pt, c: Pt, t: string) {
  const dx = p[0] - c[0],
    dy = p[1] - c[1];
  const l = Math.hypot(dx, dy) || 1;
  S.text(p[0] + (dx / l) * 13, p[1] + (dy / l) * 13, t, { size: 13 });
}
const e5b3Hard: Skill = {
  id: 'hard-fold',
  title: '접은 도형에서 합동을 이용해 각도 구하기',
  gen(r, level) {
    const x = level === 3 ? 2 * r.int(6, 15) : r.int(12, 30);
    const W = 8,
      H = 7;
    const rad = (d: number) => (d * Math.PI) / 180;
    const u = 22,
      ox = 30,
      oy = 20;
    const P = (px: number, py: number): Pt => [ox + px * u, oy + (H - py) * u];
    const A = P(0, H),
      B = P(0, 0),
      C = P(W, 0),
      D = P(W, H);
    const E = P(W, W * Math.tan(rad(x)));
    const Fp = P(W * Math.cos(rad(2 * x)), W * Math.sin(rad(2 * x)));
    const S = new Svg(Math.round(W * u + 60), Math.round(H * u + 44));
    S.poly([A, B, E, D], { cls: 'acc', fill: true });
    S.poly([B, C, E], { cls: 'muted', dash: true });
    S.poly([B, Fp, E], { cls: 'acc2', fill: true });
    const cen: Pt = [ox + (W * u) / 2, oy + (H * u) / 2];
    vLabel(S, A, cen, 'ㄱ');
    vLabel(S, B, cen, 'ㄴ');
    vLabel(S, C, cen, 'ㄷ');
    vLabel(S, D, cen, 'ㄹ');
    S.text(E[0] + 12, E[1], 'ㅁ', { size: 13 });
    vLabel(S, Fp, B, 'ㅂ');
    const y = 90 - 2 * x;
    if (level === 3) angLabel(S, B, A, Fp, `${y}°`, 30);
    else angLabel(S, B, C, E, `${x}°`, 40);
    const intro = '직사각형 모양의 종이 ㄱㄴㄷㄹ 을 선분 ㄴㅁ 을 따라 접었더니 꼭짓점 ㄷ 이 점 ㅂ 에 왔습니다.';
    if (level === 1) {
      return {
        q: `${intro} 각 ㅁㄴㄷ 이 $${x}°$ 일 때, 각 ㄴㅁㅂ 은 몇 도인가요?`,
        fig: S.toString(),
        answer: intAns(90 - x, '°'),
        steps: [
          '접은 부분 삼각형 ㄴㅂㅁ 과 처음 삼각형 ㄴㄷㅁ 은 서로 합동이에요.',
          `삼각형 ㄴㄷㅁ 에서 각 ㄴㄷㅁ $= 90°$ 이므로 각 ㄴㅁㄷ $= 180° - 90° - ${x}° = ${90 - x}°$`,
          `합동이므로 각 ㄴㅁㅂ $=$ 각 ㄴㅁㄷ $= ${90 - x}°$`,
        ],
      };
    }
    if (level === 2) {
      return {
        q: `${intro} 각 ㅁㄴㄷ 이 $${x}°$ 일 때, 각 ㄱㄴㅂ 은 몇 도인가요?`,
        fig: S.toString(),
        answer: intAns(90 - 2 * x, '°'),
        steps: [
          '접은 삼각형 ㄴㅂㅁ 과 삼각형 ㄴㄷㅁ 은 합동이므로 각 ㅂㄴㅁ $=$ 각 ㄷㄴㅁ',
          `각 ㅂㄴㅁ $= ${x}°$`,
          `각 ㄱㄴㄷ $= 90°$ 이므로 각 ㄱㄴㅂ $= 90° - ${x}° - ${x}° = ${90 - 2 * x}°$`,
        ],
      };
    }
    return {
      q: `${intro} 각 ㄱㄴㅂ 이 $${y}°$ 일 때, 각 ㅂㅁㄹ 은 몇 도인가요?`,
      fig: S.toString(),
      answer: intAns(2 * x, '°'),
      steps: [
        '삼각형 ㄴㅂㅁ 과 삼각형 ㄴㄷㅁ 은 합동이므로 각 ㅂㄴㅁ $=$ 각 ㄷㄴㅁ',
        `각 ㅂㄴㅁ $+$ 각 ㄷㄴㅁ $= 90° - ${y}° = ${90 - y}°$ → 각 ㄷㄴㅁ $= ${x}°$`,
        `삼각형 ㄴㄷㅁ 에서 각 ㄴㅁㄷ $= 180° - 90° - ${x}° = ${90 - x}°$, 합동이므로 각 ㄴㅁㅂ $= ${90 - x}°$`,
        `각 ㅂㅁㄹ $= 180° - ${90 - x}° - ${90 - x}° = ${2 * x}°$`,
      ],
      hint: '접기 전과 접은 뒤의 삼각형은 합동이에요.',
    };
  },
};

const e5b3Sq: Skill = {
  id: 'top-overlap-square',
  title: '한 꼭짓점이 중심에 있는 두 정사각형의 겹친 넓이',
  gen(r) {
    const a = 2 * r.int(3, 10);
    const b = a + r.int(1, 4);
    const th = r.pick([-35, -28, -20, -14, -8, 8, 14, 20, 28, 35]);
    const ask = r.int(0, 2);
    const rad = (th * Math.PI) / 180;
    const h0 = a / 2;
    const uu0: Pt = [Math.cos(rad), Math.sin(rad)],
      vv0: Pt = [-Math.sin(rad), Math.cos(rad)];
    const allP: Pt[] = [[-h0, -h0], [h0, h0], [0, 0], [b * uu0[0], b * uu0[1]], [b * (uu0[0] + vv0[0]), b * (uu0[1] + vv0[1])], [b * vv0[0], b * vv0[1]]];
    const xs = allP.map((q) => q[0]),
      ys = allP.map((q) => q[1]);
    const W0 = 250,
      H0 = 230;
    const sc = Math.min((W0 - 30) / (Math.max(...xs) - Math.min(...xs)), (H0 - 30) / (Math.max(...ys) - Math.min(...ys)));
    const S = new Svg(W0, H0);
    const cx = 15 - Math.min(...xs) * sc,
      cy = 15 + Math.max(...ys) * sc;
    const M = (x: number, y: number): Pt => [cx + x * sc, cy - y * sc];
    const h = a / 2;
    S.poly([M(-h, -h), M(h, -h), M(h, h), M(-h, h)], { cls: 'acc', fill: true });
    const uu: Pt = [Math.cos(rad), Math.sin(rad)],
      vv: Pt = [-Math.sin(rad), Math.cos(rad)];
    const Bq = [M(0, 0), M(b * uu[0], b * uu[1]), M(b * (uu[0] + vv[0]), b * (uu[1] + vv[1])), M(b * vv[0], b * vv[1])];
    S.poly(Bq as Pt[], { cls: 'acc2' });
    const Pp = M(h, h * Math.tan(rad)),
      Qq = M(-h * Math.tan(rad), h);
    S.poly([M(0, 0), Pp, M(h, h), Qq], { cls: 'acc2', fill: true });
    S.dot(cx, cy);
    S.text(cx - 10, cy + 12, 'ㅇ', { size: 12 });
    S.text(cx - h * sc + 16, cy + h * sc - 12, '가', { size: 14 });
    const bc = M((b * (uu[0] + vv[0])) / 2 + 0.5, (b * (uu[1] + vv[1])) / 2 + 0.5);
    S.text(bc[0], bc[1], '나', { size: 14, cls: 'acc2' });
    const ov = (a * a) / 4;
    const ansV = ask === 0 ? ov : ask === 1 ? a * a - ov : a * a + b * b - ov;
    const qtxt = ['두 정사각형이 겹친 부분의 넓이', '정사각형 가에서 겹치지 않은 부분의 넓이', '두 정사각형으로 덮인 전체 부분의 넓이'][ask];
    return {
      q: `한 변이 $${a}$ cm 인 정사각형 가와 한 변이 $${b}$ cm 인 정사각형 나가 있습니다. 정사각형 나의 한 꼭짓점을 정사각형 가의 두 대각선이 만나는 점 ㅇ에 놓고 그림과 같이 겹쳤습니다. ${qtxt}는 몇 cm² 인가요?`,
      fig: S.toString(),
      answer: intAns(ansV, 'cm²'),
      steps: [
        '점 ㅇ에서 정사각형 가의 두 꼭짓점으로 선분을 그어 가를 합동인 삼각형 $4$ 개로 나누어 생각해요.',
        '정사각형 나의 두 변이 직각을 이루므로, 겹친 부분에서 잘려 나간 작은 삼각형과 새로 들어온 작은 삼각형은 서로 합동이에요.',
        '그래서 나를 어떻게 돌려 놓아도 겹친 부분의 넓이는 정사각형 가의 $\\frac{1}{4}$ 로 같아요.',
        `겹친 부분: $${a} \\times ${a} \\div 4 = ${ov}$ (cm²)`,
        ask === 0
          ? `따라서 $${ov}$ cm²`
          : ask === 1
            ? `가에서 겹치지 않은 부분: $${a * a} - ${ov} = ${ansV}$ (cm²)`
            : `전체: $${a * a} + ${b * b} - ${ov} = ${ansV}$ (cm²)`,
      ],
      hint: '정사각형 나를 돌려서 변이 정사각형 가의 변과 나란하게 놓였을 때를 생각해 보세요.',
    };
  },
};

const e5b3Ang: Skill = {
  id: 'top-cong-angle',
  title: '합동인 삼각형을 찾아 각도 구하기',
  gen(r) {
    const x = r.int(16, 40);
    const s0 = 6;
    const t0 = s0 * Math.tan((x * Math.PI) / 180);
    const u = 24,
      ox = 26,
      oy = 22;
    const M = (px: number, py: number): Pt => [ox + px * u, oy + (s0 - py) * u];
    const A = M(0, s0),
      B = M(0, 0),
      C = M(s0, 0),
      D = M(s0, s0),
      E = M(t0, 0),
      Fp = M(s0, t0);
    // ㄱㅁ 과 ㄴㅂ 의 교점
    const k = (s0 * s0) / (s0 * s0 + t0 * t0);
    const Gm = M(k * t0 * 1, s0 - k * s0); // ㄱ(0,s)→ㅁ(t,0) 위의 점
    const S = new Svg(Math.round(s0 * u + 56), Math.round(s0 * u + 46));
    S.poly([A, B, C, D], { cls: 'acc', fill: true });
    S.line(A[0], A[1], E[0], E[1], { cls: 'acc2' });
    S.line(B[0], B[1], Fp[0], Fp[1], { cls: 'acc2' });
    const cen: Pt = [ox + (s0 * u) / 2, oy + (s0 * u) / 2];
    vLabel(S, A, cen, 'ㄱ');
    vLabel(S, B, cen, 'ㄴ');
    vLabel(S, C, cen, 'ㄷ');
    vLabel(S, D, cen, 'ㄹ');
    S.text(E[0], E[1] + 13, 'ㅁ', { size: 13 });
    S.text(Fp[0] + 12, Fp[1], 'ㅂ', { size: 13 });
    S.text(Gm[0] + 4, Gm[1] - 12, 'ㅅ', { size: 13 });
    angLabel(S, A, B, E, `${x}°`, 34);
    const ask = r.int(0, 2);
    const qs = ['각 ㄱㅅㄴ', '각 ㄴㅂㄹ', '각 ㄱㅅㄴ 과 각 ㄴㅂㄷ 의 크기의 합'];
    const ans = [90, 90 + x, 180 - x][ask];
    return {
      q: `정사각형 ㄱㄴㄷㄹ 에서 변 ㄴㄷ 위의 점 ㅁ과 변 ㄷㄹ 위의 점 ㅂ을 선분 ㄴㅁ 과 선분 ㄷㅂ 의 길이가 같도록 잡았습니다. 선분 ㄱㅁ 과 선분 ㄴㅂ 이 만나는 점을 ㅅ이라 할 때, 각 ㄴㄱㅁ 이 $${x}°$ 입니다. ${qs[ask]}은 몇 도인가요? (삼각형 ㄱㄴㅁ 과 삼각형 ㄴㄷㅂ 은 서로 합동입니다.)`,
      fig: S.toString(),
      answer: intAns(ans, '°'),
      steps: [
        '삼각형 ㄱㄴㅁ 과 삼각형 ㄴㄷㅂ 은 합동이므로 대응각의 크기가 같아요.',
        `각 ㄷㄴㅂ $=$ 각 ㄴㄱㅁ $= ${x}°$, 각 ㄴㅂㄷ $=$ 각 ㄱㅁㄴ $= 180° - 90° - ${x}° = ${90 - x}°$`,
        `삼각형 ㅅㄴㅁ 에서 각 ㅅㄴㅁ $= ${x}°$, 각 ㅅㅁㄴ $= ${90 - x}°$`,
        `각 ㄴㅅㅁ $= 180° - ${x}° - ${90 - x}° = 90°$ 이므로 각 ㄱㅅㄴ $= 180° - 90° = 90°$`,
        ask === 0 ? '두 선분 ㄱㅁ 과 ㄴㅂ 은 직각으로 만나요. → $90°$' : ask === 1 ? `각 ㄴㅂㄹ $= 180° - ${90 - x}° = ${90 + x}°$` : `$90° + ${90 - x}° = ${180 - x}°$`,
      ],
      hint: '합동인 두 삼각형에서 크기가 같은 각을 찾아 표시해 보세요.',
    };
  },
};

// ═════════ 5-2-4 소수의 곱셈 ═════════
const e5b4Hard: Skill = {
  id: 'hard-card-dmul',
  title: '수 카드로 만든 소수의 곱 가장 크게(작게)',
  gen(r, level) {
    for (;;) {
      const k = level + 2;
      const cards = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], k).sort((a, b) => a - b);
      const big = level === 1 ? true : r.chance(0.6);
      const all: { v: number; tx: string }[] = [];
      for (const p of perms(cards)) {
        if (level === 1) all.push({ v: round(((10 * p[0] + p[1]) * p[2]) / 10, 6), tx: `${p[0]}.${p[1]} \\times ${p[2]}` });
        else if (level === 2) {
          if (p[0] * 10 + p[1] > p[2] * 10 + p[3]) continue;
          all.push({ v: round(((10 * p[0] + p[1]) * (10 * p[2] + p[3])) / 100, 6), tx: `${p[0]}.${p[1]} \\times ${p[2]}.${p[3]}` });
        } else all.push({ v: round(((100 * p[0] + 10 * p[1] + p[2]) * (10 * p[3] + p[4])) / 1000, 6), tx: `${p[0]}.${p[1]}${p[2]} \\times ${p[3]}.${p[4]}` });
      }
      all.sort((a, b) => (big ? b.v - a.v : a.v - b.v));
      const best = all[0];
      const second = all.find((x) => x.v !== best.v);
      if (!second) continue;
      const form = level === 1 ? '$\\square.\\square \\times \\square$' : level === 2 ? '$\\square.\\square \\times \\square.\\square$' : '$\\square.\\square\\square \\times \\square.\\square$';
      return {
        q: `수 카드 ${boxesJ(cards)} 한 번씩 모두 사용하여 ${form} 의 곱셈식을 만들려고 합니다. 곱이 가장 ${big ? '클' : '작을'} 때의 곱을 구하세요.`,
        answer: decAns(best.v),
        steps: [
          big ? '곱이 크려면 두 수의 가장 높은 자리에 큰 수를 놓아야 해요.' : '곱이 작으려면 두 수의 가장 높은 자리에 작은 수를 놓아야 해요.',
          '높은 자리를 정한 뒤, 남은 카드의 자리를 바꾸어 곱을 비교해요.',
          `가장 ${big ? '큰' : '작은'} 경우: $${best.tx} = ${dt(best.v)}$`,
          `비교: $${second.tx} = ${dt(second.v)}$`,
          `답: $${dt(best.v)}$`,
        ],
      };
    }
  },
};

const e5b4Pow: Skill = {
  id: 'top-dec-power',
  title: '같은 소수를 여러 번 곱한 수의 규칙',
  gen(r) {
    const d = r.pick([2, 3, 4, 7, 8, 9]);
    const n = r.int(11, 60);
    const one = r.chance(0.4);
    const base = one ? `1.${d}` : `0.${d}`;
    const cyc: number[] = [];
    let x = d % 10;
    for (let i = 0; i < 4; i++) {
      cyc.push(x);
      x = (x * d) % 10;
    }
    const period = cyc[0] === cyc[2] ? 2 : 4;
    const pc = cyc.slice(0, period);
    const last = pc[(n - 1) % period];
    const ask = r.int(0, 1);
    return {
      q: `$${base}$ 를 $${n}$ 번 곱한 수가 있습니다.${ask === 0 ? ` 이 수를 소수로 나타낼 때 소수 $${n}$ 째 자리 숫자를 구하세요.` : ` 이 수는 소수 몇 자리 수이고, 소수점 아래 마지막 자리 숫자는 무엇인가요?`}`,
      answer:
        ask === 0
          ? intAns(last)
          : {
              type: 'fields',
              fields: [
                { label: '소수 몇 자리', value: n },
                { label: '마지막 자리 숫자', value: last },
              ],
            },
      steps: [
        `소수 한 자리 수를 한 번 곱할 때마다 소수점 아래 자리 수가 하나씩 늘어나요. → $${n}$ 번 곱하면 소수 $${n}$ 자리 수`,
        `마지막 자리 숫자는 ${one ? `$1${d}$` : `$${d}$`} 를 거듭 곱할 때 일의 자리 숫자와 같아요.`,
        `$${d}$ 를 거듭 곱한 일의 자리 숫자: $${cyc.join(', ')}, \\ldots$ → $${pc.join(', ')}$ 가 되풀이돼요.`,
        `$${n} \\div ${period} = ${Math.floor(n / period)} \\cdots ${n % period}$ → ${n % period === 0 ? `되풀이의 마지막` : `되풀이의 $${n % period}$ 번째`} 숫자`,
        `따라서 소수 $${n}$ 째 자리(마지막 자리) 숫자는 $${last}$`,
      ],
      hint: '몇 번 곱해 보고 끝자리 숫자의 규칙을 찾아보세요.',
    };
  },
};

const MIN_DEC: [number, number][] = [
  [6, 0.1],
  [12, 0.2],
  [15, 0.25],
  [18, 0.3],
  [24, 0.4],
  [30, 0.5],
  [36, 0.6],
  [42, 0.7],
  [45, 0.75],
  [48, 0.8],
  [54, 0.9],
];
const e5b4Fuel: Skill = {
  id: 'top-dec-travel',
  title: '시간을 소수로 바꾸어 여러 단계로 계산하기',
  gen(r) {
    for (;;) {
      const [m, md] = r.pick(MIN_DEC);
      const h = r.int(1, 3);
      const t = round(h + md, 6);
      if (r.chance(0.55)) {
        const v = r.int(30, 45) * 2;
        const a = r.pick([0.05, 0.06, 0.08, 0.12, 0.15]);
        const dist = round(v * t, 6);
        const fuel = round(dist * a, 6);
        const pr = r.pick([1500, 1600, 1650, 1700, 1750, 1800]);
        const cost = round(fuel * pr, 6);
        const askCost = Number.isInteger(cost) && r.chance(0.6);
        if ((String(fuel).split('.')[1] ?? '').length > 3) continue;
        return {
          q: `어떤 자동차는 $1$ km 를 달리는 데 휘발유가 $${dt(a)}$ L 필요합니다. 이 자동차가 한 시간에 $${v}$ km 를 가는 빠르기로 $${h}$ 시간 $${m}$ 분 동안 달렸습니다. ${askCost ? `휘발유 $1$ L 의 값이 ${won(pr)}일 때, 사용한 휘발유의 값은 얼마인가요?` : '사용한 휘발유는 몇 L 인가요?'}`,
          answer: askCost ? intAns(cost, '원') : decAns(fuel, 'L'),
          steps: [
            `$${m}$ 분 $= \\frac{${m}}{60}$ 시간 $= ${dt(md)}$ 시간 → $${h}$ 시간 $${m}$ 분 $= ${dt(t)}$ 시간`,
            `달린 거리: $${v} \\times ${dt(t)} = ${dt(dist)}$ (km)`,
            `휘발유: $${dt(dist)} \\times ${dt(a)} = ${dt(fuel)}$ (L)`,
            ...(askCost ? [`값: $${dt(fuel)} \\times ${comma(pr)} = ${comma(cost)}$ (원)`] : []),
          ],
          hint: '분을 시간 단위의 소수로 먼저 바꾸어 보세요.',
        };
      }
      const [n1, n2] = pickNames(r, 2);
      const s1 = round(r.int(30, 55) / 10, 6),
        s2 = round(r.int(30, 55) / 10, 6);
      const tot = round((s1 + s2) * t, 6);
      return {
        q: `${josa(n1, '은/는')} 한 시간에 $${dt(s1)}$ km, ${josa(n2, '은/는')} 한 시간에 $${dt(s2)}$ km 를 걷습니다. 두 사람이 같은 곳에서 동시에 출발하여 서로 반대 방향으로 $${h}$ 시간 $${m}$ 분 동안 걸었다면, 두 사람 사이의 거리는 몇 km 인가요?`,
        answer: decAns(tot, 'km'),
        steps: [
          `$${m}$ 분 $= ${dt(md)}$ 시간 → 걸은 시간 $${dt(t)}$ 시간`,
          `반대 방향이므로 한 시간에 두 사람 사이는 $${dt(s1)} + ${dt(s2)} = ${dt(round(s1 + s2, 6))}$ (km) 씩 멀어져요.`,
          `$${dt(round(s1 + s2, 6))} \\times ${dt(t)} = ${dt(tot)}$ (km)`,
        ],
        hint: '두 사람이 한 시간 동안 멀어지는 거리를 먼저 구하세요.',
      };
    }
  },
};

// ═════════ 5-2-5 직육면체 ═════════
const e5b5Hard: Skill = {
  id: 'hard-cube-block',
  title: '정육면체를 붙여 만든 직육면체의 모서리',
  gen(r, level) {
    for (;;) {
      if (level === 1) {
        const a = r.int(2, 12);
        return {
          q: `한 모서리가 $${a}$ cm 인 정육면체 $2$ 개를 면끼리 꼭 맞게 붙여 직육면체를 만들었습니다. 만든 직육면체의 모든 모서리의 길이의 합은 몇 cm 인가요?`,
          answer: intAns(16 * a, 'cm'),
          steps: [`직육면체의 가로 $${2 * a}$ cm, 세로 $${a}$ cm, 높이 $${a}$ cm`, '길이가 같은 모서리가 $4$ 개씩 있어요.', `$(${2 * a} + ${a} + ${a}) \\times 4 = ${16 * a}$ (cm)`],
        };
      }
      const p = r.int(2, 5),
        q = r.int(1, 4),
        c = r.int(1, 3);
      const a = r.int(2, 9);
      if (p * q * c < 4) continue;
      const S = 4 * a * (p + q + c);
      if (level === 2) {
        return {
          q: `한 모서리가 $${a}$ cm 인 정육면체 $${p * q * c}$ 개를 빈틈없이 쌓아 가로에 $${p}$ 개, 세로에 $${q}$ 개, 높이에 $${c}$ 개가 놓인 직육면체를 만들었습니다. 이 직육면체의 모든 모서리의 길이의 합은 몇 cm 인가요?`,
          answer: intAns(S, 'cm'),
          steps: [
            `가로 $${a} \\times ${p} = ${a * p}$, 세로 $${a} \\times ${q} = ${a * q}$, 높이 $${a} \\times ${c} = ${a * c}$ (cm)`,
            '길이가 같은 모서리가 $4$ 개씩 있어요.',
            `$(${a * p} + ${a * q} + ${a * c}) \\times 4 = ${S}$ (cm)`,
          ],
        };
      }
      return {
        q: `똑같은 정육면체 $${p * q * c}$ 개를 빈틈없이 쌓아 가로에 $${p}$ 개, 세로에 $${q}$ 개, 높이에 $${c}$ 개가 놓인 직육면체를 만들었더니, 직육면체의 모든 모서리의 길이의 합이 $${S}$ cm 였습니다. 정육면체 한 개의 한 모서리는 몇 cm 인가요?`,
        answer: intAns(a, 'cm'),
        steps: [
          '정육면체의 한 모서리를 □ cm 라 하면',
          `직육면체의 가로 $${p} \\times \\square$, 세로 $${q} \\times \\square$, 높이 $${c} \\times \\square$`,
          `모서리의 합 $= (${p} + ${q} + ${c}) \\times \\square \\times 4 = ${4 * (p + q + c)} \\times \\square$`,
          `$${4 * (p + q + c)} \\times \\square = ${S}$ → $\\square = ${S} \\div ${4 * (p + q + c)} = ${a}$ (cm)`,
        ],
      };
    }
  },
};

const e5b5Paint: Skill = {
  id: 'top-paint-cube',
  title: '색칠한 직육면체를 잘랐을 때 칠해진 면의 수',
  gen(r) {
    const cube = r.chance(0.5);
    const a = r.int(3, 7),
      b = cube ? a : r.int(3, 7),
      c = cube ? a : r.int(3, 6);
    if (!cube && a === b && b === c) return e5b5Paint.gen(r, 3);
    const k = r.int(0, 3);
    let cnt = 0;
    for (let i = 0; i < a; i++)
      for (let j = 0; j < b; j++)
        for (let l = 0; l < c; l++) {
          const f = (i === 0 || i === a - 1 ? 1 : 0) + (j === 0 || j === b - 1 ? 1 : 0) + (l === 0 || l === c - 1 ? 1 : 0);
          if (k === 3 ? f >= 1 : f === k) cnt++;
        }
    const A = a - 2,
      B = b - 2,
      C = c - 2;
    const what = ['한 면도 색칠되지 않은', '한 면만 색칠된', '두 면만 색칠된', '적어도 한 면이 색칠된'][k];
    const shape = cube ? `한 모서리에 쌓기나무가 $${a}$ 개씩 놓인 정육면체` : `가로에 $${a}$ 개, 세로에 $${b}$ 개, 높이에 $${c}$ 개의 쌓기나무가 놓인 직육면체`;
    const st: string[] = [
      `색칠된 면의 수는 쌓기나무가 놓인 위치로 정해져요: 꼭짓점 $3$ 면, 모서리(꼭짓점 제외) $2$ 면, 면의 가운데 $1$ 면, 속 $0$ 면`,
    ];
    if (k === 0) st.push(`속에 있는 쌓기나무는 가로·세로·높이에서 양 끝을 하나씩 빼요: $${A} \\times ${B} \\times ${C}$`, `$= ${cnt}$ (개)`);
    else if (k === 1) {
      st.push(`면마다 가운데 부분(테두리를 뺀 부분): 가로·세로 면 $${A} \\times ${B}$, 세로·높이 면 $${B} \\times ${C}$, 가로·높이 면 $${A} \\times ${C}$`);
      st.push(`같은 면이 $2$ 개씩 있으므로 $(${A * B} + ${B * C} + ${A * C}) \\times 2 = ${cnt}$ (개)`);
    } else if (k === 2) {
      st.push(`모서리마다 양 끝 꼭짓점을 뺀 개수: 가로 방향 $${A}$, 세로 방향 $${B}$, 높이 방향 $${C}$`);
      st.push(`같은 방향 모서리가 $4$ 개씩 있으므로 $(${A} + ${B} + ${C}) \\times 4 = ${cnt}$ (개)`);
    } else {
      st.push(`전체 $${a} \\times ${b} \\times ${c} = ${a * b * c}$ 개에서 한 면도 칠해지지 않은 속의 쌓기나무를 빼요.`);
      st.push(`속: $${A} \\times ${B} \\times ${C} = ${A * B * C}$ → $${a * b * c} - ${A * B * C} = ${cnt}$ (개)`);
    }
    return {
      q: `똑같은 쌓기나무로 ${shape}를 빈틈없이 만든 뒤, 겉면(바닥 포함)을 모두 색칠했습니다. 이것을 다시 쌓기나무 하나하나로 떼어 놓을 때, ${what} 쌓기나무는 몇 개인가요?`,
      answer: intAns(cnt, '개'),
      steps: st,
      hint: '꼭짓점, 모서리, 면의 가운데, 속으로 나누어 세어 보세요.',
    };
  },
};

const e5b5Edge: Skill = {
  id: 'top-edge-relation',
  title: '모서리 길이의 합과 관계로 길이 구하기',
  gen(r) {
    for (;;) {
      if (r.chance(0.55)) {
        const x = r.int(4, 15),
          p = r.int(1, 6),
          q = r.int(1, 3);
        if (x - q < 2) continue;
        const S = 4 * (3 * x + p - q);
        const ask = r.int(0, 2);
        const val = [x, x + p, x - q][ask];
        const nameA = ['가로', '세로', '높이'][ask];
        return {
          q: `직육면체의 세로는 가로보다 $${p}$ cm 길고, 높이는 가로보다 $${q}$ cm 짧습니다. 이 직육면체의 모든 모서리의 길이의 합이 $${S}$ cm 일 때, ${nameA}는 몇 cm 인가요?`,
          answer: intAns(val, 'cm'),
          steps: [
            '직육면체는 가로·세로·높이 모서리가 $4$ 개씩 있어요.',
            `가로 $+$ 세로 $+$ 높이 $= ${S} \\div 4 = ${S / 4}$ (cm)`,
            `세로와 높이를 가로에 맞추면: 가로 $\\times 3 + ${p} - ${q} = ${S / 4}$`,
            `가로 $\\times 3 = ${S / 4 - p + q}$ → 가로 $= ${x}$ (cm)`,
            ask === 0 ? `가로: $${x}$ cm` : ask === 1 ? `세로: $${x} + ${p} = ${x + p}$ (cm)` : `높이: $${x} - ${q} = ${x - q}$ (cm)`,
          ],
          hint: '한 꼭짓점에서 만나는 세 모서리의 합을 먼저 구해 보세요.',
        };
      }
      const a = r.int(6, 20),
        p = r.int(1, 4);
      const b = a - p,
        c = 2 * b;
      if ((a + b + c) % 3 || b < 2) continue;
      const e = (a + b + c) / 3;
      return {
        q: `가로가 $${a}$ cm 이고, 세로는 가로보다 $${p}$ cm 짧으며, 높이는 세로의 $2$ 배인 직육면체가 있습니다. 이 직육면체와 모든 모서리의 길이의 합이 같은 정육면체의 한 모서리는 몇 cm 인가요?`,
        answer: intAns(e, 'cm'),
        steps: [
          `세로 $= ${a} - ${p} = ${b}$ (cm), 높이 $= ${b} \\times 2 = ${c}$ (cm)`,
          `직육면체의 모서리 합: $(${a} + ${b} + ${c}) \\times 4 = ${4 * (a + b + c)}$ (cm)`,
          '정육면체는 길이가 같은 모서리가 $12$ 개',
          `한 모서리: $${4 * (a + b + c)} \\div 12 = ${e}$ (cm)`,
        ],
      };
    }
  },
};

// ═════════ 5-2-6 평균과 가능성 ═════════
const e5b6Hard: Skill = {
  id: 'hard-mean-reason',
  title: '평균 조건으로 거꾸로 추론하기',
  gen(r, level) {
    for (;;) {
      const nm = pickName(r);
      if (level === 1) {
        const n = r.int(4, 6);
        const a = r.int(60, 99),
          b = r.int(60, 99);
        const m = r.int(70, 90);
        if (a === b || (a - b) % n) continue;
        const c = m + (a - b) / n;
        if (c > 100) continue;
        return {
          q: `${nm}네 모둠 $${n}$ 명의 수학 점수 평균을 구하는데, 한 명의 점수 $${a}$ 점을 $${b}$ 점으로 잘못 보고 계산하여 평균이 $${m}$ 점이 되었습니다. 바르게 계산한 평균은 몇 점인가요?`,
          answer: intAns(c, '점'),
          steps: [
            `잘못 계산한 합: $${m} \\times ${n} = ${m * n}$ (점)`,
            `바른 합: $${m * n} ${a > b ? '+' : '-'} ${Math.abs(a - b)} = ${m * n + a - b}$ (점)`,
            `바른 평균: $${m * n + a - b} \\div ${n} = ${c}$ (점)`,
          ],
        };
      }
      if (level === 2) {
        const n1 = r.int(4, 12),
          m1 = r.int(60, 95),
          M = r.int(55, 90),
          m2 = r.int(50, 90);
        if (!(m1 > M && M > m2)) continue;
        if ((n1 * (m1 - M)) % (M - m2)) continue;
        const n2 = (n1 * (m1 - M)) / (M - m2);
        if (n2 < 3 || n2 > 20) continue;
        return {
          q: `가 모둠 $${n1}$ 명의 줄넘기 기록 평균은 $${m1}$ 회이고, 나 모둠의 평균은 $${m2}$ 회입니다. 두 모둠 전체의 평균이 $${M}$ 회일 때, 나 모둠은 몇 명인가요?`,
          answer: intAns(n2, '명'),
          steps: [
            `가 모둠은 전체 평균보다 한 명당 $${m1} - ${M} = ${m1 - M}$ 회씩 많아요 → 모두 $${m1 - M} \\times ${n1} = ${(m1 - M) * n1}$ 회 많음`,
            `나 모둠은 한 명당 $${M} - ${m2} = ${M - m2}$ 회씩 적어요.`,
            '많은 만큼과 적은 만큼이 같아야 평균이 맞아요.',
            `나 모둠 인원: $${(m1 - M) * n1} \\div ${M - m2} = ${n2}$ (명)`,
          ],
          hint: '전체 평균보다 많은 부분과 적은 부분을 비교해 보세요.',
        };
      }
      const n = r.int(5, 6);
      const xs = Array.from({ length: n }, () => r.int(50, 99));
      const s = xs.reduce((a, b) => a + b, 0);
      const mx = Math.max(...xs),
        mn = Math.min(...xs);
      if (s % n || (s - mx) % (n - 1) || (s - mn) % (n - 1) || mx === mn) continue;
      if (xs.filter((x) => x === mx).length > 1 || xs.filter((x) => x === mn).length > 1) continue;
      const m = s / n,
        m1 = (s - mx) / (n - 1),
        m2 = (s - mn) / (n - 1);
      return {
        q: `학생 $${n}$ 명의 수학 점수의 평균은 $${m}$ 점입니다. 점수가 가장 높은 학생을 빼면 평균이 $${m1}$ 점, 점수가 가장 낮은 학생을 빼면 평균이 $${m2}$ 점입니다. 가장 높은 점수와 가장 낮은 점수의 차는 몇 점인가요?`,
        answer: intAns(mx - mn, '점'),
        steps: [
          `전체 합: $${m} \\times ${n} = ${s}$ (점)`,
          `가장 높은 학생을 뺀 합: $${m1} \\times ${n - 1} = ${s - mx}$ → 가장 높은 점수 $= ${s} - ${s - mx} = ${mx}$ (점)`,
          `가장 낮은 학생을 뺀 합: $${m2} \\times ${n - 1} = ${s - mn}$ → 가장 낮은 점수 $= ${s} - ${s - mn} = ${mn}$ (점)`,
          `차: $${mx} - ${mn} = ${mx - mn}$ (점)`,
        ],
        hint: '평균에 사람 수를 곱해 합을 구해 보세요.',
      };
    }
  },
};

const e5b6Pair: Skill = {
  id: 'top-pair-mean',
  title: '몇 명씩 짝지은 평균으로 각자의 값 구하기',
  gen(r) {
    for (;;) {
      if (r.chance(0.55)) {
        const names = pickNames(r, 3);
        const par = r.int(0, 1);
        const v = names.map(() => 2 * r.int(15, 28) + par);
        if (new Set(v).size < 3) continue;
        const p = (v[0] + v[1]) / 2,
          q = (v[1] + v[2]) / 2,
          s = (v[0] + v[2]) / 2;
        const tot = v[0] + v[1] + v[2];
        if (tot % 3) continue;
        const ask = r.int(0, 3);
        const ans = ask === 3 ? tot / 3 : v[ask];
        const restPair = [q, s, p];
        return {
          q: `${names[0]}, ${names[1]}, ${names[2]} 세 사람의 몸무게를 두 사람씩 재어 평균을 구했더니 ${josa(names[0], '과/와')} ${josa(names[1], '은/는')} $${p}$ kg, ${josa(names[1], '과/와')} ${josa(names[2], '은/는')} $${q}$ kg, ${josa(names[0], '과/와')} ${josa(names[2], '은/는')} $${s}$ kg 이었습니다. ${ask === 3 ? '세 사람의 몸무게의 평균은' : `${names[ask]}의 몸무게는`} 몇 kg 인가요?`,
          answer: intAns(ans, 'kg'),
          steps: [
            `두 사람씩의 합: $${p} \\times 2 = ${2 * p}$, $${q} \\times 2 = ${2 * q}$, $${s} \\times 2 = ${2 * s}$`,
            '세 합을 더하면 세 사람의 몸무게가 두 번씩 더해져요.',
            `$${2 * p} + ${2 * q} + ${2 * s} = ${2 * tot}$ → 세 사람의 합 $= ${2 * tot} \\div 2 = ${tot}$ (kg)`,
            ask === 3 ? `평균: $${tot} \\div 3 = ${ans}$ (kg)` : `${names[ask]} $=$ (세 사람의 합) $-$ (나머지 두 사람의 합) $= ${tot} - ${2 * restPair[ask]} = ${ans}$ (kg)`,
          ],
          hint: '평균에 2를 곱해 두 사람씩의 합을 먼저 구하세요.',
        };
      }
      const names = pickNames(r, 4);
      const c = r.int(0, 2);
      const v = names.map(() => 3 * r.int(20, 32) + c);
      if (new Set(v).size < 4) continue;
      const tot = v.reduce((a, b) => a + b, 0);
      const t = v.map((x) => (tot - x) / 3);
      const ask = r.int(0, 3);
      return {
        q: `${names.join(', ')} 네 사람의 수학 점수가 있습니다. 한 사람씩 빼고 나머지 세 사람의 점수 평균을 구했더니 ${names.map((nm, i) => `${josa(nm, '을/를')} 뺐을 때 $${t[i]}$ 점`).join(', ')}이었습니다. ${names[ask]}의 점수는 몇 점인가요?`,
        answer: intAns(v[ask], '점'),
        steps: [
          `세 사람씩의 합: ${t.map((x) => `$${x} \\times 3 = ${3 * x}$`).join(', ')}`,
          '네 합을 모두 더하면 각 사람의 점수가 세 번씩 더해져요.',
          `$${t.map((x) => 3 * x).join(' + ')} = ${3 * tot}$ → 네 사람의 합 $= ${3 * tot} \\div 3 = ${tot}$ (점)`,
          `${josa(names[ask], '을/를')} 뺀 세 사람의 합은 $${3 * t[ask]}$ 이므로`,
          `${names[ask]} $= ${tot} - ${3 * t[ask]} = ${v[ask]}$ (점)`,
        ],
        hint: '네 가지 합을 모두 더하면 한 사람이 몇 번씩 더해지는지 생각해 보세요.',
      };
    }
  },
};

const e5b6Ext: Skill = {
  id: 'top-mean-extreme',
  title: '평균이 주어질 때 가장 큰(작은) 값 추론',
  gen(r) {
    for (;;) {
      const n = r.int(4, 6);
      const m = r.int(70, 88);
      const tot = n * m;
      const t = r.int(0, 2);
      if (t === 0) {
        const L = r.int(40, 70);
        const mids = Array.from({ length: n - 2 }, (_, i) => L + 1 + i);
        const hi = tot - L - mids.reduce((a, b) => a + b, 0);
        if (hi > 100 || hi <= mids[mids.length - 1]) continue;
        return {
          q: `학생 $${n}$ 명의 수학 점수 평균이 $${m}$ 점입니다. 점수는 모두 서로 다른 자연수이고, 가장 낮은 점수는 $${L}$ 점입니다. 가장 높은 점수가 될 수 있는 가장 큰 점수는 몇 점인가요? (만점은 $100$ 점)`,
          answer: intAns(hi, '점'),
          steps: [
            `점수의 합: $${m} \\times ${n} = ${tot}$ (점)`,
            '가장 높은 점수를 크게 하려면 나머지 학생의 점수를 될 수 있는 대로 작게 해야 해요.',
            `가장 낮은 점수가 $${L}$ 점이고 모두 다르므로 나머지는 $${mids.join(', ')}$ 점`,
            `가장 높은 점수: $${tot} - ${L} - (${mids.join(' + ')}) = ${hi}$ (점)`,
            `$${hi}$ 점은 $100$ 점 이하이므로 가능해요.`,
          ],
          hint: '가장 높은 점수를 크게 하려면 다른 점수는 어떻게 해야 할까요?',
        };
      }
      if (t === 1) {
        const M = Math.ceil((tot + (n * (n - 1)) / 2) / n);
        if (M > 100) continue;
        const ex = Array.from({ length: n }, (_, i) => M - i);
        const exSum = ex.reduce((a, b) => a + b, 0);
        const lower = Array.from({ length: n }, (_, i) => M - 1 - i).reduce((a, b) => a + b, 0);
        return {
          q: `학생 $${n}$ 명의 수학 점수 평균이 $${m}$ 점이고, 점수는 모두 서로 다른 자연수입니다. 가장 높은 점수가 될 수 있는 가장 작은 점수는 몇 점인가요?`,
          answer: intAns(M, '점'),
          steps: [
            `점수의 합: $${m} \\times ${n} = ${tot}$ (점)`,
            '가장 높은 점수를 작게 하려면 점수들이 서로 가까워야 해요. 서로 다르므로 $1$ 점씩 차이 나게 놓아 봐요.',
            `가장 높은 점수가 $${M - 1}$ 점이면 합은 많아야 $${Array.from({ length: n }, (_, i) => M - 1 - i).join(' + ')} = ${lower}$ → $${tot}$ 보다 작아요.`,
            `가장 높은 점수가 $${M}$ 점이면 많게는 $${ex.join(' + ')} = ${exSum}$ 까지 되어 $${tot}$ 을 만들 수 있어요.`,
            `따라서 가장 작은 경우는 $${M}$ 점`,
          ],
          hint: '서로 다른 점수를 가장 촘촘하게 놓아 보세요.',
        };
      }
      const H = r.int(92, 100);
      let best = -1;
      for (let L = 1; L < H; L++) {
        const minSum = H + Array.from({ length: n - 1 }, (_, i) => L + i).reduce((a, b) => a + b, 0);
        const maxSum = H + Array.from({ length: n - 1 }, (_, i) => H - 1 - i).reduce((a, b) => a + b, 0);
        if (L + n - 2 < H && minSum <= tot && tot <= maxSum) best = L;
      }
      if (best < 40) continue;
      const others = Array.from({ length: n - 2 }, (_, i) => best + 1 + i);
      const minS = H + best + others.reduce((a, b) => a + b, 0);
      return {
        q: `학생 $${n}$ 명의 수학 점수 평균이 $${m}$ 점입니다. 점수는 모두 서로 다른 자연수이고, 가장 높은 점수는 $${H}$ 점입니다. 가장 낮은 점수가 될 수 있는 가장 큰 점수는 몇 점인가요?`,
        answer: intAns(best, '점'),
        steps: [
          `점수의 합: $${m} \\times ${n} = ${tot}$ (점), 가장 높은 점수를 빼면 $${tot - H}$ 점`,
          `나머지 $${n - 1}$ 명의 점수가 모두 서로 다르고 가장 낮은 점수가 □ 이면, 합은 적어도 $\\square + (\\square + 1) + \\cdots + (\\square + ${n - 2})$`,
          `□ $= ${best}$ 이면 적어도 $${best} + ${others.join(' + ')} = ${minS - H}$ → $${tot - H}$ 이하이므로 가능해요.`,
          `□ $= ${best + 1}$ 이면 적어도 $${minS - H + (n - 1)}$ → $${tot - H}$ 보다 커서 불가능해요.`,
          `따라서 가장 낮은 점수가 될 수 있는 가장 큰 점수는 $${best}$ 점`,
        ],
        hint: '가장 낮은 점수를 크게 하려면 나머지 점수들은 가장 낮은 점수 바로 위에 촘촘히 놓여야 해요.',
      };
    }
  },
};

export const HARD5: Record<string, { skill: Skill; top: Skill[] }> = {
  'e5a-1': { skill: e5a1Hard, top: [e5a1Card, e5a1Sym] },
  'e5a-2': { skill: e5a2Hard, top: [e5a2Rem, e5a2Cnt] },
  'e5a-3': { skill: e5a3Hard, top: [e5a3Log, e5a3Stone] },
  'e5a-4': { skill: e5a4Hard, top: [e5a4Same, e5a4Find] },
  'e5a-5': { skill: e5a5Hard, top: [e5a5Tele, e5a5Three] },
  'e5a-6': { skill: e5a6Hard, top: [e5a6Inner, e5a6Opt] },
  'e5b-1': { skill: e5b1Hard, top: [e5b1Same, e5b1Cost] },
  'e5b-2': { skill: e5b2Hard, top: [e5b2Rev, e5b2Ball] },
  'e5b-3': { skill: e5b3Hard, top: [e5b3Sq, e5b3Ang] },
  'e5b-4': { skill: e5b4Hard, top: [e5b4Pow, e5b4Fuel] },
  'e5b-5': { skill: e5b5Hard, top: [e5b5Paint, e5b5Edge] },
  'e5b-6': { skill: e5b6Hard, top: [e5b6Pair, e5b6Ext] },
};

/** 콘텐츠 맵에 심화 유형(skills 뒤)과 최상위 유형(top)을 덧붙임 */
export function attachHard(content: Record<string, { skills: Skill[]; top?: Skill[] }>, map: Record<string, { skill: Skill; top: Skill[] }>) {
  for (const [u, h] of Object.entries(map)) {
    const c = content[u];
    if (!c) continue;
    c.skills.push(h.skill);
    c.top = [...(c.top ?? []), ...h.top];
  }
}
