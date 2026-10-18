// 초5-1 콘텐츠
import type { ContentMap, Level, ProblemDraft } from '../../core/types';
import type { Rng } from '../../core/rng';
import { F } from '../../core/frac';
import { gcd, lcm, divisors, round } from '../../core/nt';
import { comma, makeChoices, numChoices } from '../../core/tex';
import { regularPolygon, Svg } from '../../core/fig';
import { pickName, pickNames, josa, jo, fracAns, intAns, decAns, ft, mt, properFrac, reduceTex, dt, places, nj, ro, fj, p10 } from './util';
import { shapeFig, P } from './fig56';

// ───────────── 혼합 계산 (식 나무) ─────────────
type Op = '+' | '-' | '*' | '/';
type E = { v: number } | { op: Op; l: E; r: E };
const PREC: Record<Op, number> = { '+': 1, '-': 1, '*': 2, '/': 2 };
const SYM: Record<Op, string> = { '+': '+', '-': '-', '*': '\\times', '/': '\\div' };
const isLeaf = (e: E): e is { v: number } => 'v' in e;

function needParen(child: E, parentOp: Op | undefined, right: boolean): boolean {
  if (isLeaf(child) || !parentOp) return false;
  return PREC[child.op] < PREC[parentOp] || (right && PREC[child.op] === PREC[parentOp]);
}
function texE(e: E, parentOp?: Op, right = false): string {
  if (isLeaf(e)) return comma(e.v);
  const s = `${texE(e.l, e.op, false)} ${SYM[e.op]} ${texE(e.r, e.op, true)}`;
  return needParen(e, parentOp, right) ? `(${s})` : s;
}
/** 자연수 범위에서 계산 (음수·나누어떨어지지 않음 → null) */
function evalE(e: E): number | null {
  if (isLeaf(e)) return e.v;
  const a = evalE(e.l),
    b = evalE(e.r);
  if (a === null || b === null) return null;
  switch (e.op) {
    case '+':
      return a + b;
    case '-':
      return a - b >= 0 ? a - b : null;
    case '*':
      return a * b;
    case '/':
      return b !== 0 && a % b === 0 ? a / b : null;
  }
}
/** 계산 순서대로 한 단계 */
function stepE(e: E): E {
  type Cand = { path: string[]; depth: number; md: boolean; ord: number };
  const cands: Cand[] = [];
  let ord = 0;
  const walk = (x: E, path: string[], depth: number, parentOp?: Op, right = false) => {
    if (isLeaf(x)) return;
    const d = depth + (needParen(x, parentOp, right) ? 1 : 0);
    walk(x.l, [...path, 'l'], d, x.op, false);
    if (isLeaf(x.l) && isLeaf(x.r)) cands.push({ path, depth: d, md: x.op === '*' || x.op === '/', ord: ord++ });
    walk(x.r, [...path, 'r'], d, x.op, true);
  };
  walk(e, [], 0);
  cands.sort((a, b) => b.depth - a.depth || Number(b.md) - Number(a.md) || a.ord - b.ord);
  const target = cands[0].path;
  const rep = (x: E, i: number): E => {
    if (isLeaf(x)) return x;
    if (i === target.length) return { v: evalE(x)! };
    return target[i] === 'l' ? { ...x, l: rep(x.l, i + 1) } : { ...x, r: rep(x.r, i + 1) };
  };
  return rep(e, 0);
}
function stepsE(e: E): string[] {
  const out: string[] = [];
  let cur = e;
  while (!isLeaf(cur)) {
    const nx = stepE(cur);
    out.push(`$${texE(cur)} = ${texE(nx)}$`);
    cur = nx;
  }
  return out;
}
/** 모양 문자열 '(#+#)*#-#/#' → 나무 */
function parseShape(src: string): E {
  let i = 0;
  const peek = () => src[i];
  const atom = (): E => {
    if (peek() === '(') {
      i++;
      const e = expr();
      i++; // ')'
      return e;
    }
    i++; // '#'
    return { v: 0 };
  };
  const term = (): E => {
    let l = atom();
    while (peek() === '*' || peek() === '/') {
      const op = src[i++] as Op;
      l = { op, l, r: atom() };
    }
    return l;
  };
  const expr = (): E => {
    let l = term();
    while (peek() === '+' || peek() === '-') {
      const op = src[i++] as Op;
      l = { op, l, r: term() };
    }
    return l;
  };
  return expr();
}
/** 잎에 수 채우기 */
function fillE(r: Rng, e: E, level: Level, parentOp?: Op): E {
  if (isLeaf(e)) {
    if (parentOp === '*' || parentOp === '/') return { v: r.int(2, level === 3 ? 12 : 9) };
    return { v: r.int(level === 1 ? 5 : 10, level === 1 ? 60 : level === 2 ? 99 : 150) };
  }
  if (e.op === '/') {
    const rr = fillE(r, e.r, level, '/');
    const rv = evalE(rr);
    if (isLeaf(e.l) && rv !== null && rv > 0 && rv <= 40) return { op: '/', l: { v: rv * r.int(2, level === 1 ? 9 : 12) }, r: rr };
    return { op: '/', l: fillE(r, e.l, level, '/'), r: rr };
  }
  return { op: e.op, l: fillE(r, e.l, level, e.op), r: fillE(r, e.r, level, e.op) };
}
function makeExpr(r: Rng, shapes: string[], level: Level, max = 999): { e: E; v: number } {
  for (let t = 0; t < 2000; t++) {
    const e = fillE(r, parseShape(r.pick(shapes)), level);
    const v = evalE(e);
    if (v !== null && v <= max) {
      // 모든 중간값도 자연수 범위 확인됨(evalE). 0 결과는 피함
      if (v > 0) return { e, v };
    }
  }
  const e: E = { op: '+', l: { v: 12 }, r: { op: '*', l: { v: 3 }, r: { v: 4 } } };
  return { e, v: 24 };
}

function exprSkill(shapes: Record<Level, string[]>, max: Record<Level, number>) {
  return (r: Rng, level: Level): ProblemDraft => {
    const { e, v } = makeExpr(r, shapes[level], level, max[level]);
    return {
      q: `다음을 계산하세요.\n$$${texE(e)}$$`,
      answer: intAns(v),
      steps: stepsE(e),
      hint: '괄호 안 → 곱셈·나눗셈 → 덧셈·뺄셈 순서로, 같은 단계는 왼쪽부터 계산해요.',
    };
  };
}

// ───────────── 도형 그림 ─────────────
const para = (b: number, h: number, s: number): P[] => [
  [0, 0],
  [b, 0],
  [b + s, h],
  [s, h],
];

export const content: ContentMap = {
  // ═════════════ 5-1-1 자연수의 혼합 계산 ═════════════
  'e5a-1': {
    concepts: [
      {
        title: '덧셈과 뺄셈이 섞인 식',
        body: '덧셈과 뺄셈만 있는 식은 **앞에서부터 차례로** 계산해요.\n( ) 가 있으면 **( ) 안을 먼저** 계산해요.\n$$30 - 12 + 5 = 18 + 5 = 23$$\n$$30 - (12 + 5) = 30 - 17 = 13$$',
        example: { q: '$45 - (15 + 8)$ 을 계산하세요.', a: '$45 - 23 = 22$' },
      },
      {
        title: '곱셈과 나눗셈이 섞인 식',
        body: '곱셈과 나눗셈만 있는 식도 **앞에서부터 차례로** 계산하고, ( ) 가 있으면 ( ) 안을 먼저 계산해요.\n$$24 \\div 4 \\times 2 = 6 \\times 2 = 12$$\n$$24 \\div (4 \\times 2) = 24 \\div 8 = 3$$',
      },
      {
        title: '덧셈, 뺄셈, 곱셈, 나눗셈이 섞인 식',
        body: '계산 순서를 꼭 지켜요.\n- ① ( ) 안\n- ② 곱셈과 나눗셈 (앞에서부터)\n- ③ 덧셈과 뺄셈 (앞에서부터)\n$$20 + 12 \\div 3 \\times 2 - 5 = 20 + 4 \\times 2 - 5 = 20 + 8 - 5 = 23$$',
        example: { q: '$(7 + 5) \\times 3 - 16 \\div 4$', a: '$12 \\times 3 - 4 = 36 - 4 = 32$' },
      },
      {
        title: '하나의 식으로 나타내기',
        body: '문장제는 먼저 **무엇을 먼저 구해야 하는지** 생각하고, 먼저 계산할 부분에 ( ) 를 써서 하나의 식으로 나타내요.\n예) 사과 $12$ 개와 배 $8$ 개를 $4$ 명이 똑같이 나누면 → $(12 + 8) \\div 4 = 5$ (개)',
      },
    ],
    skills: [
      {
        id: 'add-sub',
        title: '덧셈과 뺄셈이 섞인 식',
        gen: exprSkill(
          { 1: ['#+#-#', '#-#+#', '#-#-#'], 2: ['#-(#+#)', '#-(#-#)', '#+#-(#+#)'], 3: ['#-(#+#)+#', '#+#-(#-#)', '#-(#-#)-#', '(#+#)-(#-#)'] },
          { 1: 200, 2: 300, 3: 600 },
        ),
      },
      {
        id: 'mul-div',
        title: '곱셈과 나눗셈이 섞인 식',
        gen: exprSkill(
          { 1: ['#*#/#', '#/#*#'], 2: ['#/(#*#)', '#*#/#', '#/#*#'], 3: ['#*#/(#*#)', '#/#*#/#', '#/(#*#)*#'] },
          { 1: 200, 2: 300, 3: 1000 },
        ),
      },
      {
        id: 'four-ops',
        title: '사칙연산이 섞인 식',
        gen: exprSkill(
          { 1: ['#+#*#', '#-#*#', '#*#-#', '#+#/#', '#/#+#'], 2: ['#+#*#-#', '#-#/#+#', '(#+#)*#', '#*(#-#)', '(#+#)/#'], 3: ['(#+#)*#-#/#', '#-(#+#)/#*#', '#*(#-#)+#/#', '#+#*#-#/#'] },
          { 1: 300, 2: 500, 3: 999 },
        ),
      },
      {
        id: 'missing',
        title: '□ 안에 알맞은 수',
        gen(r, level) {
          const x = r.int(level === 1 ? 5 : 10, level === 1 ? 40 : 90);
          if (level === 1) {
            const b = r.int(2, 9),
              c = r.int(2, 9);
            const d = x + b * c;
            return {
              q: `$\\square$ 안에 알맞은 수를 구하세요.\n$$\\square + ${b} \\times ${c} = ${d}$$`,
              answer: intAns(x),
              steps: [`곱셈을 먼저: $${b} \\times ${c} = ${b * c}$`, `$\\square + ${b * c} = ${d}$ 이므로 $\\square = ${d} - ${b * c} = ${x}$`],
              hint: '곱셈 부분을 먼저 계산해 보세요.',
            };
          }
          if (level === 2) {
            const b = r.int(2, Math.min(9, x - 1)),
              c = r.int(2, 9);
            if (r.chance(0.5)) {
              const d = (x - b) * c;
              return {
                q: `$\\square$ 안에 알맞은 수를 구하세요.\n$$(\\square - ${b}) \\times ${c} = ${d}$$`,
                answer: intAns(x),
                steps: [`$\\square - ${b} = ${d} \\div ${c} = ${x - b}$`, `$\\square = ${x - b} + ${b} = ${x}$`],
              };
            }
            const q0 = r.int(3, 15);
            const xx = q0 * c;
            const d = q0 + b;
            return {
              q: `$\\square$ 안에 알맞은 수를 구하세요.\n$$\\square \\div ${c} + ${b} = ${d}$$`,
              answer: intAns(xx),
              steps: [`$\\square \\div ${c} = ${d} - ${b} = ${q0}$`, `$\\square = ${q0} \\times ${c} = ${xx}$`],
            };
          }
          const c = r.int(3, 9),
            b = r.int(2, 30);
          const k0 = Math.ceil((b + 5) / c);
          const kk = r.int(k0, k0 + 8);
          const xv = kk * c - b;
          const m = r.int(2, 5);
          const a = kk * m + r.int(5, 60);
          const d = a - kk * m;
          return {
            q: `$\\square$ 안에 알맞은 수를 구하세요.\n$$${a} - (\\square + ${b}) \\div ${c} \\times ${m} = ${d}$$`,
            answer: intAns(xv),
            steps: [
              `$(\\square + ${b}) \\div ${c} \\times ${m} = ${a} - ${d} = ${a - d}$`,
              `$(\\square + ${b}) \\div ${c} = ${a - d} \\div ${m} = ${kk}$`,
              `$\\square + ${b} = ${kk} \\times ${c} = ${kk * c}$`,
              `$\\square = ${kk * c} - ${b} = ${xv}$`,
            ],
            hint: '계산 순서를 거꾸로 따라가며 하나씩 되돌려 보세요.',
          };
        },
      },
      {
        id: 'word',
        title: '하나의 식으로 나타내어 풀기',
        gen(r, level) {
          const nm = pickName(r);
          const t = level === 1 ? r.int(0, 1) : level === 2 ? r.int(2, 3) : r.int(4, 5);
          if (t === 0) {
            const a = r.int(6, 12),
              b = r.int(3, 9),
              c = r.int(5, a * b - 5);
            return {
              q: `${josa(nm, '은/는')} 연필을 한 묶음에 $${a}$ 자루씩 $${b}$ 묶음 가지고 있었습니다. 그중에서 $${c}$ 자루를 친구들에게 주었다면 남은 연필은 몇 자루인가요?`,
              answer: intAns(a * b - c, '자루'),
              steps: [`식: $${a} \\times ${b} - ${c}$`, `$= ${a * b} - ${c} = ${a * b - c}$ (자루)`],
            };
          }
          if (t === 1) {
            const c = r.int(2, 6),
              q = r.int(3, 12),
              a = r.pick([4, 5, 6, 8, 10, 12]);
            const total = c * q;
            // a × b = total 이 되도록 조정
            const b0 = Math.max(1, Math.round(total / a));
            const T = a * b0;
            const cc = divisors(T).filter((x) => x >= 2 && x <= 9);
            const ppl = cc.length ? r.pick(cc) : 1;
            return {
              q: `구슬이 한 봉지에 $${a}$ 개씩 $${b0}$ 봉지 있습니다. 이 구슬을 $${ppl}$ 명이 똑같이 나누어 가지면 한 명이 몇 개씩 가지게 되나요?`,
              answer: intAns(T / ppl, '개'),
              steps: [`식: $${a} \\times ${b0} \\div ${ppl}$`, `$= ${T} \\div ${ppl} = ${T / ppl}$ (개)`],
            };
          }
          if (t === 2) {
            const k = r.int(3, 8),
              q = r.int(4, 12);
            const T = k * q;
            const a = r.int(Math.ceil(T / 3), T - 3);
            const b = T - a;
            const [f1, f2] = r.pick([
              ['사과', '배'],
              ['초콜릿', '사탕'],
              ['빨간 색종이', '파란 색종이'],
            ]);
            return {
              q: `${f1} $${a}$ 개와 ${f2} $${b}$ 개를 섞어서 $${k}$ 명에게 똑같이 나누어 주려고 합니다. 한 명에게 몇 개씩 줄 수 있나요?`,
              answer: intAns(q, '개'),
              steps: [`먼저 모두 더한 뒤 나누어요. 식: $(${a} + ${b}) \\div ${k}$`, `$= ${T} \\div ${k} = ${q}$ (개)`],
            };
          }
          if (t === 3) {
            const g = r.int(3, 6),
              boys = r.int(8, 20);
            const tot = g * r.int(Math.ceil((boys + 5) / g), Math.ceil((boys + 25) / g));
            const girls = tot - boys;
            return {
              q: `어느 반 남학생은 $${boys}$ 명, 여학생은 $${girls}$ 명입니다. 한 모둠에 $${g}$ 명씩 모둠을 만들면 모둠은 모두 몇 개인가요?`,
              answer: intAns(tot / g, '개'),
              steps: [`식: $(${boys} + ${girls}) \\div ${g}$`, `$= ${tot} \\div ${g} = ${tot / g}$ (개)`],
            };
          }
          if (t === 4) {
            const p1 = r.pick([800, 900, 1200, 1500]),
              n1 = r.int(2, 4),
              p2 = r.pick([500, 600, 700]),
              money = r.pick([5000, 10000]);
            const spent = p1 * n1 + p2;
            const m = spent < money ? money : 10000;
            return {
              q: `${josa(nm, '은/는')} $${comma(m)}$ 원을 가지고 문구점에 가서 한 권에 $${comma(p1)}$ 원인 공책 $${n1}$ 권과 $${comma(p2)}$ 원인 지우개 한 개를 샀습니다. 남은 돈은 얼마인가요?`,
              answer: intAns(m - spent, '원'),
              steps: [`식: $${comma(m)} - (${comma(p1)} \\times ${n1} + ${comma(p2)})$`, `$= ${comma(m)} - (${comma(p1 * n1)} + ${comma(p2)}) = ${comma(m)} - ${comma(spent)}$`, `$= ${comma(m - spent)}$ (원)`],
            };
          }
          const a = r.int(6, 15),
            b = r.int(3, 6),
            d = r.int(3, 6);
          const extra0 = r.int(1, 20);
          const T0 = a * b + extra0;
          const T = T0 - (T0 % d) + d;
          const c = T - a * b;
          return {
            q: `사탕이 한 봉지에 $${a}$ 개씩 $${b}$ 봉지 있고, 낱개로 $${c}$ 개가 더 있습니다. 이 사탕을 $${d}$ 명이 똑같이 나누어 가지면 한 명이 몇 개씩 가지나요?`,
            answer: intAns(T / d, '개'),
            steps: [`식: $(${a} \\times ${b} + ${c}) \\div ${d}$`, `$= (${a * b} + ${c}) \\div ${d} = ${T} \\div ${d}$`, `$= ${T / d}$ (개)`],
          };
        },
      },
    ],
  },

  // ═════════════ 5-1-2 약수와 배수 ═════════════
  'e5a-2': {
    concepts: [
      {
        title: '약수',
        body: '어떤 수를 **나누어떨어지게 하는 수**를 그 수의 약수라고 해요.\n$12 \\div 1, 12\\div 2, 12\\div 3, 12\\div 4, 12\\div 6, 12\\div 12$ 가 나누어떨어지므로 $12$ 의 약수는 $1, 2, 3, 4, 6, 12$ 예요.\n- $1$ 은 모든 수의 약수이고, 자기 자신도 약수예요.',
      },
      {
        title: '배수',
        body: '어떤 수를 $1$ 배, $2$ 배, $3$ 배, … 한 수를 그 수의 **배수**라고 해요.\n$4$ 의 배수: $4, 8, 12, 16, \\ldots$ (끝없이 있어요)\n- **약수와 배수의 관계**: $12 = 3 \\times 4$ 이면 $3$ 과 $4$ 는 $12$ 의 약수, $12$ 는 $3$ 과 $4$ 의 배수예요.',
      },
      {
        title: '공약수와 최대공약수',
        body: '두 수의 공통인 약수를 **공약수**, 그중 가장 큰 수를 **최대공약수**라고 해요.\n- 두 수의 공약수는 최대공약수의 약수와 같아요.\n- 두 수를 공통으로 나누는 수로 계속 나누고, 나눈 수들을 곱하면 최대공약수예요.',
        example: { q: '$18$ 과 $24$ 의 최대공약수', a: '$2)\\,18\\;24 \\to 3)\\,9\\;12 \\to 3\\;4$ 이므로 $2\\times3 = 6$' },
      },
      {
        title: '공배수와 최소공배수',
        body: '두 수의 공통인 배수를 **공배수**, 그중 가장 작은 수를 **최소공배수**라고 해요.\n- 두 수의 공배수는 최소공배수의 배수와 같아요.\n- 공통으로 나눈 수와 마지막 몫을 모두 곱하면 최소공배수예요: $18, 24 \\to 2\\times3\\times3\\times4 = 72$',
      },
    ],
    skills: [
      {
        id: 'divisors',
        title: '약수 구하기',
        gen(r, level) {
          const pool = Array.from({ length: level === 1 ? 26 : level === 2 ? 50 : 90 }, (_, i) => i + (level === 1 ? 6 : level === 2 ? 20 : 30)).filter((n) => divisors(n).length >= 4);
          const n = r.pick(pool);
          const ds = divisors(n);
          if (level === 2 && r.chance(0.5)) {
            const non = Array.from({ length: n - 1 }, (_, i) => i + 2).filter((x) => n % x !== 0);
            const bad = r.pick(non);
            const goods = r.sample(ds.filter((d) => d > 1), 4);
            const ch = makeChoices(r, `$${bad}$`, goods.map((g) => `$${g}$`), Math.min(5, goods.length + 1));
            return {
              q: `다음 중 $${n}$ 의 약수가 **아닌** 것은?`,
              answer: ch,
              steps: [`$${n}$ 의 약수: $${ds.join(', ')}$`, `$${n} \\div ${bad}$ 는 나누어떨어지지 않으므로 ${nj(bad, '은/는')} 약수가 아니에요.`],
            };
          }
          if (level === 3) {
            const sum = ds.reduce((a, b) => a + b, 0);
            return {
              q: `$${n}$ 의 약수를 모두 더하면 얼마인가요?`,
              answer: intAns(sum),
              steps: [`곱해서 ${nj(n, '이/가')} 되는 두 수를 짝지어 찾아요.`, `$${n}$ 의 약수: $${ds.join(', ')}$`, `합: $${ds.join('+')} = ${sum}$`],
            };
          }
          const pairs = ds.filter((d) => d * d <= n).map((d) => `${d}\\times${n / d}`);
          return {
            q: `$${n}$ 의 약수는 모두 몇 개인가요?`,
            answer: intAns(ds.length, '개'),
            steps: [`$${n} = ${pairs.join(' = ')}$`, `약수: $${ds.join(', ')}$ → $${ds.length}$ 개`],
            hint: '곱해서 그 수가 되는 두 수를 짝지어 찾아보세요.',
          };
        },
      },
      {
        id: 'multiples',
        title: '배수 구하기',
        gen(r, level) {
          if (level === 1) {
            const n = r.int(3, 15),
              k = r.int(4, 12);
            return {
              q: `$${n}$ 의 배수를 가장 작은 수부터 차례로 쓸 때, $${k}$ 번째 수는 무엇인가요?`,
              answer: intAns(n * k),
              steps: [`$${n}$ 의 배수: $${n}, ${n * 2}, ${n * 3}, \\ldots$`, `$${k}$ 번째 수는 $${n} \\times ${k} = ${n * k}$`],
            };
          }
          if (level === 2) {
            const n = r.int(4, 13),
              a = r.int(10, 60),
              b = a + r.int(40, 120);
            const cnt = Math.floor(b / n) - Math.floor((a - 1) / n);
            const first = Math.ceil(a / n) * n,
              last = Math.floor(b / n) * n;
            return {
              q: `$${a}$ 부터 $${b}$ 까지의 수 중에서 $${n}$ 의 배수는 모두 몇 개인가요?`,
              answer: intAns(cnt, '개'),
              steps: [`가장 작은 배수: $${first} = ${n}\\times${first / n}$, 가장 큰 배수: $${last} = ${n}\\times${last / n}$`, `$${last / n} - ${first / n} + 1 = ${cnt}$ (개)`],
            };
          }
          const t = r.pick([100, 200, 300, 500]);
          let n = r.int(6, 19);
          while (t % n === 0) n++; // t 자체가 배수이면 답이 t 가 되어 의미가 없음
          const lo = Math.floor(t / n) * n,
            hi = lo + n;
          const ans = t - lo <= hi - t ? lo : hi;
          const tie = t - lo === hi - t;
          if (tie) {
            return {
              q: `$${n}$ 의 배수 중에서 $${t}$ 보다 큰 수 가운데 가장 작은 수는 무엇인가요?`,
              answer: intAns(hi),
              steps: [`$${t} \\div ${n} = ${Math.floor(t / n)} \\cdots ${t % n}$`, `$${n} \\times ${Math.floor(t / n) + 1} = ${hi}$`],
            };
          }
          return {
            q: `$${n}$ 의 배수 중에서 $${t}$ 에 가장 가까운 수는 무엇인가요?`,
            answer: intAns(ans),
            steps: [`$${t} \\div ${n} = ${Math.floor(t / n)} \\cdots ${t % n}$`, `$${t}$ 에 가까운 배수: $${lo}$ (차 $${t - lo}$), $${hi}$ (차 $${hi - t}$)`, `가장 가까운 수는 $${ans}$`],
          };
        },
      },
      {
        id: 'relation',
        title: '약수와 배수의 관계',
        gen(r, level) {
          const mk = (good: boolean): [number, number] => {
            for (;;) {
              const a = r.int(2, level === 1 ? 9 : 15);
              const b = good ? a * r.int(2, level === 1 ? 6 : 9) : r.int(a + 1, a * 8);
              if (good || b % a !== 0) return [a, b];
            }
          };
          const asked = level === 3 ? 'bad' : 'good';
          const goodP = mk(true);
          const pairs = [mk(false), mk(false), mk(false), mk(true)];
          if (asked === 'good') {
            const right = `$(${goodP[0]},\\ ${goodP[1]})$`;
            const wr = pairs.slice(0, 3).map(([a, b]) => `$(${a},\\ ${b})$`);
            return {
              q: '두 수가 **약수와 배수의 관계**인 것은?',
              answer: makeChoices(r, right, wr, 4),
              steps: [`$${goodP[1]} = ${goodP[0]} \\times ${goodP[1] / goodP[0]}$ 이므로 ${nj(goodP[0], '은/는')} $${goodP[1]}$ 의 약수, ${nj(goodP[1], '은/는')} $${goodP[0]}$ 의 배수예요.`, '나머지는 큰 수가 작은 수로 나누어떨어지지 않아요.'],
            };
          }
          const bad = mk(false);
          const goods = [mk(true), mk(true), mk(true), mk(true)];
          const right = `$(${bad[0]},\\ ${bad[1]})$`;
          return {
            q: '두 수가 약수와 배수의 관계가 **아닌** 것은?',
            answer: makeChoices(r, right, goods.map(([a, b]) => `$(${a},\\ ${b})$`), 5),
            steps: [`$${bad[1]} \\div ${bad[0]} = ${Math.floor(bad[1] / bad[0])} \\cdots ${bad[1] % bad[0]}$ 이므로 나누어떨어지지 않아요.`, `따라서 $(${bad[0]},\\ ${bad[1]})$ 은 약수와 배수의 관계가 아니에요.`],
          };
        },
      },
      {
        id: 'gcd',
        title: '최대공약수 구하기',
        gen(r, level) {
          const g = r.int(2, level === 1 ? 6 : level === 2 ? 12 : 18);
          let p = 1,
            q = 1;
          for (;;) {
            p = r.int(2, level === 1 ? 6 : 9);
            q = r.int(2, level === 1 ? 7 : 11);
            if (p !== q && gcd(p, q) === 1) break;
          }
          const a = g * Math.min(p, q),
            b = g * Math.max(p, q);
          const ladder: string[] = [];
          let x = a,
            y = b;
          for (let d = 2; d <= Math.min(x, y); ) {
            if (x % d === 0 && y % d === 0) {
              ladder.push(`$${d})\\ ${x},\\ ${y} \\to ${x / d},\\ ${y / d}$`);
              x /= d;
              y /= d;
            } else d++;
          }
          if (level === 3) {
            const cnt = divisors(g).length;
            return {
              q: `${nj(a, '과/와')} $${b}$ 의 공약수는 모두 몇 개인가요?`,
              answer: intAns(cnt, '개'),
              steps: [...ladder.slice(0, 3), `최대공약수는 $${g}$`, `공약수는 최대공약수의 약수: $${divisors(g).join(', ')}$ → $${cnt}$ 개`],
            };
          }
          return {
            q: `${nj(a, '과/와')} $${b}$ 의 최대공약수를 구하세요.`,
            answer: intAns(g),
            steps: [...ladder.slice(0, 4), `나눈 수를 모두 곱하면 최대공약수: $${g}$`],
            hint: '두 수를 공통으로 나눌 수 있는 수로 계속 나누어 보세요.',
          };
        },
      },
      {
        id: 'lcm',
        title: '최소공배수 구하기',
        gen(r, level) {
          let g = 1,
            p = 1,
            q = 1;
          for (;;) {
            g = r.int(level === 1 ? 1 : 2, level === 1 ? 4 : 8);
            p = r.int(2, level === 1 ? 6 : 9);
            q = r.int(2, level === 1 ? 7 : 10);
            // 3단계(공배수 개수)는 최소공배수가 150 이하가 되게
            if (p !== q && gcd(p, q) === 1 && (level !== 3 || g * p * q <= 150)) break;
          }
          const a = g * Math.min(p, q),
            b = g * Math.max(p, q);
          const L = lcm(a, b);
          if (level === 3) {
            const lim = r.pick([100, 150, 200, 300].filter((x) => x >= L * 2));
            const cnt = Math.floor(lim / L);
            if (cnt >= 1)
              return {
                q: `${nj(a, '과/와')} $${b}$ 의 공배수 중에서 $${lim}$ 보다 작거나 같은 수는 모두 몇 개인가요?`,
                answer: intAns(cnt, '개'),
                steps: [`최소공배수: $${L}$`, `공배수는 최소공배수의 배수: $${Array.from({ length: Math.min(cnt, 5) }, (_, i) => L * (i + 1)).join(', ')}${cnt > 5 ? ', \\ldots' : ''}$`, `$${lim} \\div ${L} = ${cnt} \\cdots ${lim % L}$ 이므로 $${cnt}$ 개`],
              };
          }
          const steps = g > 1 ? [`$${g})\\ ${a},\\ ${b} \\to ${a / g},\\ ${b / g}$`, `최소공배수: $${g} \\times ${a / g} \\times ${b / g} = ${L}$`] : [`${nj(a, '과/와')} ${nj(b, '은/는')} 1 말고 공약수가 없어요.`, `최소공배수: $${a} \\times ${b} = ${L}$`];
          return {
            q: `${nj(a, '과/와')} $${b}$ 의 최소공배수를 구하세요.`,
            answer: level === 2 && r.chance(0.5) ? numChoices(r, L, [a * b, gcd(a, b), L * 2, L / 2].filter((x) => Number.isInteger(x) && x > 0), 5) : intAns(L),
            steps,
          };
        },
      },
      {
        id: 'word',
        title: '최대공약수·최소공배수 활용',
        gen(r, level) {
          const kind = r.int(0, level === 1 ? 1 : 3);
          if (kind === 0) {
            const g = r.int(3, level === 1 ? 8 : 15);
            let p = 2,
              q = 3;
            for (;;) {
              p = r.int(2, 8);
              q = r.int(2, 9);
              if (p !== q && gcd(p, q) === 1) break;
            }
            const [it1, it2] = r.pick([
              ['사탕', '초콜릿'],
              ['연필', '지우개'],
              ['사과', '귤'],
              ['공책', '색연필'],
            ]);
            return {
              q: `${it1} $${g * p}$ 개와 ${it2} $${g * q}$ 개를 될 수 있는 대로 많은 학생에게 남김없이 똑같이 나누어 주려고 합니다. 몇 명에게 나누어 줄 수 있나요?`,
              answer: intAns(g, '명'),
              steps: ['남김없이 똑같이 → 공약수, 될 수 있는 대로 많이 → **최대공약수**', `${nj(g * p, '과/와')} $${g * q}$ 의 최대공약수는 $${g}$ 이므로 $${g}$ 명`],
            };
          }
          if (kind === 1) {
            const a = r.int(2, 9) * (level === 1 ? 2 : 3),
              b = r.int(2, 9) * 2;
            const aa = a === b ? a + 2 : a;
            const L = lcm(aa, b);
            return {
              q: `한 정류장에서 ㉮ 버스는 $${aa}$ 분마다, ㉯ 버스는 $${b}$ 분마다 출발합니다. 오전 $8$ 시에 두 버스가 동시에 출발했다면, 다음번에 처음으로 동시에 출발하는 것은 몇 분 후인가요?`,
              answer: intAns(L, '분'),
              steps: ['동시에 출발하는 때 → 공배수, 처음으로 → **최소공배수**', `${nj(aa, '과/와')} $${b}$ 의 최소공배수: $${L}$ → $${L}$ 분 후`],
            };
          }
          if (kind === 2) {
            const g = r.int(3, 12);
            let p = 2,
              q = 3;
            for (;;) {
              p = r.int(2, 9);
              q = r.int(2, 9);
              if (p !== q && gcd(p, q) === 1) break;
            }
            const w = g * p,
              h = g * q;
            const ask = level === 3 ? 'count' : 'side';
            return {
              q: `가로 $${w}$ cm, 세로 $${h}$ cm 인 직사각형 모양 종이를 남는 부분 없이 될 수 있는 대로 큰 정사각형 여러 장으로 자르려고 합니다. ${ask === 'side' ? '정사각형의 한 변을 몇 cm 로 해야 하나요?' : '정사각형은 모두 몇 장이 되나요?'}`,
              answer: ask === 'side' ? intAns(g, 'cm') : intAns(p * q, '장'),
              steps: [`한 변의 길이는 ${nj(w, '과/와')} $${h}$ 의 최대공약수: $${g}$ cm`, ...(ask === 'count' ? [`가로 $${w} \\div ${g} = ${p}$ 장, 세로 $${h} \\div ${g} = ${q}$ 장`, `$${p} \\times ${q} = ${p * q}$ (장)`] : [])],
            };
          }
          const a = r.int(3, 12),
            b = r.int(4, 15);
          const bb = a === b ? b + 1 : b;
          const L = lcm(a, bb);
          const ask = level === 3 ? 'count' : 'side';
          return {
            q: `가로 $${a}$ cm, 세로 $${bb}$ cm 인 직사각형 모양 카드를 같은 방향으로 빈틈없이 늘어놓아 될 수 있는 대로 작은 정사각형을 만들려고 합니다. ${ask === 'side' ? '정사각형의 한 변은 몇 cm 인가요?' : '카드는 모두 몇 장 필요한가요?'}`,
            answer: ask === 'side' ? intAns(L, 'cm') : intAns((L / a) * (L / bb), '장'),
            steps: [`정사각형의 한 변은 ${nj(a, '과/와')} $${bb}$ 의 최소공배수: $${L}$ cm`, ...(ask === 'count' ? [`가로로 $${L} \\div ${a} = ${L / a}$ 장, 세로로 $${L} \\div ${bb} = ${L / bb}$ 장`, `$${L / a} \\times ${L / bb} = ${(L / a) * (L / bb)}$ (장)`] : [])],
          };
        },
      },
    ],
  },

  // ═════════════ 5-1-3 규칙과 대응 ═════════════
  'e5a-3': {
    concepts: [
      {
        title: '대응 관계',
        body: '한 양이 변할 때 다른 양이 그에 따라 **일정하게 변하는 관계**를 대응 관계라고 해요.\n예) 세발자전거 $1$ 대 → 바퀴 $3$ 개, $2$ 대 → $6$ 개, $3$ 대 → $9$ 개',
      },
      {
        title: '표로 나타내기',
        body: '두 양을 표로 나타내면 규칙을 찾기 쉬워요. 위 칸과 아래 칸을 비교해 **더하는지, 곱하는지** 살펴봐요.\n4학년에서 배운 수 배열의 규칙 찾기와 같은 방법이에요.',
      },
      {
        title: '식으로 나타내기',
        body: '대응 관계는 $\\bigcirc$, $\\triangle$, $\\square$, ☆ 같은 기호를 써서 식으로 나타낼 수 있어요.\n$$\\triangle = \\bigcirc \\times 3 \\quad \\text{또는} \\quad \\bigcirc = \\triangle \\div 3$$\n- 같은 관계를 두 가지 식으로 나타낼 수 있어요.',
        example: { q: '형은 동생보다 $3$ 살 많아요. 동생 나이 $\\bigcirc$, 형 나이 $\\triangle$', a: '$\\triangle = \\bigcirc + 3$' },
      },
      {
        title: '생활 속 대응 관계',
        body: '시간과 거리, 개수와 값, 도형의 수와 성냥개비 수처럼 생활 속에서 대응 관계를 찾아 식으로 나타내면, 큰 수도 쉽게 구할 수 있어요.',
      },
    ],
    skills: [
      {
        id: 'table-fill',
        title: '표에서 □ 구하기',
        gen(r, level) {
          const a = level === 1 ? r.pick([1, 2, 3, 4, 5]) : r.int(2, 9);
          const b = level === 1 ? (a === 1 ? r.int(2, 9) : 0) : level === 2 ? (r.chance(0.5) ? 0 : r.int(1, 9)) : r.int(1, 12);
          const xs: number[] = [];
          if (level === 3) xs.push(...r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15], 5).sort((x, y) => x - y));
          else for (let v = r.int(1, 3); xs.length < 5; v += r.int(1, 2)) xs.push(v);
          const ys = xs.map((x) => a * x + b);
          const hi = r.int(level === 3 ? 0 : 1, 4);
          const reverse = level === 3 && r.chance(0.5);
          const row1 = ['$\\bigcirc$', ...xs.map((x, i) => (reverse && i === hi ? '$\\square$' : `$${x}$`))];
          const row2 = ['$\\triangle$', ...ys.map((y, i) => (!reverse && i === hi ? '$\\square$' : `$${y}$`))];
          const rule = b === 0 ? `\\triangle = \\bigcirc \\times ${a}` : a === 1 ? `\\triangle = \\bigcirc + ${b}` : `\\triangle = \\bigcirc \\times ${a} + ${b}`;
          return {
            q: '표를 보고 대응 관계를 찾아 $\\square$ 안에 알맞은 수를 구하세요.',
            table: [row1, row2],
            answer: intAns(reverse ? xs[hi] : ys[hi]),
            steps: [`대응 관계: $${rule}$`, reverse ? `$\\triangle = ${ys[hi]}$ 일 때 거꾸로 계산하면 $\\bigcirc = ${xs[hi]}$` : `$\\bigcirc = ${xs[hi]}$ 일 때 $\\triangle = ${ys[hi]}$`],
          };
        },
      },
      {
        id: 'find-rule',
        title: '대응 관계를 식으로',
        gen(r, level) {
          const kind = level === 1 ? r.pick(['add', 'mul']) : level === 2 ? r.pick(['add', 'mul', 'sub']) : 'lin';
          const a = r.int(2, 9),
            b = r.int(1, 9);
          const xs = [1, 2, 3, 4].map((x) => x + (kind === 'sub' ? b : 0));
          const f = (x: number) => (kind === 'add' ? x + b : kind === 'sub' ? x - b : kind === 'mul' ? x * a : x * a + b);
          const ys = xs.map(f);
          const O = '\\bigcirc',
            T = '\\triangle';
          const right =
            kind === 'add' ? `$${T} = ${O} + ${b}$` : kind === 'sub' ? `$${T} = ${O} - ${b}$` : kind === 'mul' ? `$${T} = ${O} \\times ${a}$` : `$${T} = ${O} \\times ${a} + ${b}$`;
          const wrongs = [
            `$${T} = ${O} + ${ys[0] - xs[0] + 1}$`,
            `$${O} = ${T} \\times ${a}$`,
            `$${T} = ${O} \\times ${ys[0] / xs[0] === Math.floor(ys[0] / xs[0]) ? ys[0] / xs[0] + (kind === 'mul' ? 1 : 0) : a}$`,
            `$${T} = ${O} + ${ys[0] - xs[0]}$`,
            `$${T} = ${O} \\times ${a} - ${b}$`,
            ...(kind === 'sub' ? [] : [`$${O} = ${T} + ${b}$`]), // sub 일 때 ○ = △ + b 는 정답과 같은 식
            `$${T} = ${O} \\times ${a + 1}$`,
          ].filter((w) => {
            if (/[-+] -|\\times -|\\times 0\b|\+ 0\$/.test(w)) return false;
            // 표 전체에 맞는 식은 오답에서 제외
            const m = w.match(/\$\\triangle = \\bigcirc (\+|-|\\times) (\d+)(?: (\+|-) (\d+))?\$/);
            if (!m) return true;
            const g = (x: number) => {
              let v = m[1] === '+' ? x + +m[2] : m[1] === '-' ? x - +m[2] : x * +m[2];
              if (m[3]) v = m[3] === '+' ? v + +m[4] : v - +m[4];
              return v;
            };
            return !xs.every((x, i) => g(x) === ys[i]);
          });
          return {
            q: '$\\bigcirc$ 와 $\\triangle$ 사이의 대응 관계를 바르게 나타낸 식은?',
            table: [['$\\bigcirc$', ...xs.map((x) => `$${x}$`)], ['$\\triangle$', ...ys.map((y) => `$${y}$`)]],
            answer: makeChoices(r, right, wrongs, 4),
            steps: [`$${xs.map((x, i) => `${x} \\to ${ys[i]}`).join(',\\ ')}$`, `모든 칸에서 맞는 식은 ${right}`],
            hint: '첫 칸만 맞는 식이 아니라, 모든 칸에 맞는 식을 찾아요.',
          };
        },
      },
      {
        id: 'pattern',
        title: '도형 배열의 대응 관계',
        gen(r, level) {
          const kind = r.int(0, 2);
          const n = level === 1 ? r.int(5, 9) : level === 2 ? r.int(10, 30) : r.int(31, 99);
          const per = kind === 0 ? 3 : kind === 1 ? 2 : 2;
          const add = kind === 0 ? 1 : kind === 1 ? 1 : 2;
          const s = new Svg(260, 70);
          const z = 22;
          if (kind === 0) {
            for (let i = 0; i < 3; i++) s.rect(20 + i * z, 20, z, z, { cls: 'acc' });
          } else if (kind === 1) {
            for (let i = 0; i < 3; i++) {
              const x = 20 + (i * z) / 2;
              if (i % 2 === 0)
                s.poly(
                  [
                    [x, 50],
                    [x + z, 50],
                    [x + z / 2, 50 - z * 0.87],
                  ],
                  { cls: 'acc', fill: false },
                );
            }
            s.line(20 + z / 2, 50 - z * 0.87, 20 + z * 1.5, 50 - z * 0.87, { cls: 'acc' });
          } else {
            for (let i = 0; i < 3; i++) {
              s.rect(30 + i * 34, 28, 34, 16, { cls: 'acc', fill: true });
            }
            for (let i = 0; i < 3; i++) {
              s.circle(47 + i * 34, 18, 5, { cls: 'acc2' });
              s.circle(47 + i * 34, 54, 5, { cls: 'acc2' });
            }
            s.circle(20, 36, 5, { cls: 'acc2' });
            s.circle(30 + 3 * 34 + 10, 36, 5, { cls: 'acc2' });
          }
          const what = kind === 0 ? ['정사각형', '성냥개비'] : kind === 1 ? ['삼각형', '성냥개비'] : ['탁자', '의자'];
          const ex = kind === 0 ? '정사각형 3개를 만드는 데 성냥개비 10개' : kind === 1 ? '삼각형 3개를 만드는 데 성냥개비 7개' : '탁자 3개를 이어 붙이면 의자 8개';
          const ans = per * n + add;
          return {
            q:
              kind === 2
                ? `그림과 같이 탁자를 한 줄로 이어 붙이고 둘레에 의자를 놓습니다. (${ex}) 탁자 $${n}$ 개를 이어 붙이면 의자는 몇 개 필요한가요?`
                : `그림과 같이 성냥개비로 ${what[0]}${kind === 0 ? '을' : '을'} 한 줄로 이어 만듭니다. (${ex}) ${what[0]} $${n}$ 개를 만들려면 성냥개비는 몇 개 필요한가요?`,
            fig: s.toString(),
            table: [
              [what[0] + ' 수', '$1$', '$2$', '$3$', '$4$'],
              [what[1] + ' 수', ...[1, 2, 3, 4].map((k) => `$${per * k + add}$`)],
            ],
            answer: intAns(ans, '개'),
            steps: [`${what[0]}${jo(what[0], '이/가')} 1개 늘 때마다 ${what[1]}${jo(what[1], '은/는')} $${per}$ 개씩 늘어요.`, `${what[0]} 수를 $\\bigcirc$, ${what[1]} 수를 $\\triangle$ 라 하면 $\\triangle = \\bigcirc \\times ${per} + ${add}$`, `$${n} \\times ${per} + ${add} = ${ans}$ (개)`],
          };
        },
      },
      {
        id: 'make-expr',
        title: '생활 속 대응 관계 식',
        gen(r, level) {
          const O = '\\bigcirc',
            T = '\\triangle';
          const k = r.int(0, 4);
          let q = '',
            right = '',
            wr: string[] = [];
          if (k === 0) {
            const d = r.int(2, 9);
            q = `형은 동생보다 $${d}$ 살 많습니다. 동생의 나이를 $${O}$, 형의 나이를 $${T}$ 라고 할 때`;
            right = `$${T} = ${O} + ${d}$`;
            wr = [`$${T} = ${O} - ${d}$`, `$${T} = ${O} \\times ${d}$`, `$${O} = ${T} + ${d}$`, `$${O} = ${T} \\times ${d}$`];
          } else if (k === 1) {
            const n = r.pick([3, 4, 5, 6, 8]);
            const thing = n === 3 ? '세발자전거' : n === 4 ? '자동차' : n === 5 ? '불가사리(다리)' : n === 6 ? '곤충(다리)' : '문어(다리)';
            q = `${thing} 한 ${n === 4 || n === 3 ? '대' : '마리'}에 ${n === 3 || n === 4 ? '바퀴' : '다리'}가 $${n}$ 개씩 있습니다. ${n === 3 || n === 4 ? '대' : '마리'} 수를 $${O}$, ${n === 3 || n === 4 ? '바퀴' : '다리'} 수를 $${T}$ 라고 할 때`;
            right = level === 3 ? `$${O} = ${T} \\div ${n}$` : `$${T} = ${O} \\times ${n}$`;
            wr = [`$${T} = ${O} + ${n}$`, `$${O} = ${T} \\times ${n}$`, `$${T} = ${O} \\div ${n}$`, `$${O} = ${T} + ${n}$`];
          } else if (k === 2) {
            q = `긴 끈을 한 번에 한 곳씩 자릅니다. 자른 횟수를 $${O}$, 끈 도막의 수를 $${T}$ 라고 할 때`;
            right = level === 3 ? `$${O} = ${T} - 1$` : `$${T} = ${O} + 1$`;
            wr = [`$${T} = ${O} - 1$`, `$${T} = ${O} \\times 2$`, `$${O} = ${T} + 1$`, `$${T} = ${O}$`];
          } else if (k === 3) {
            const p = r.pick([300, 500, 700, 800, 1200]);
            q = `한 개에 $${comma(p)}$ 원인 지우개를 삽니다. 지우개 수를 $${O}$, 내야 할 돈을 $${T}$ 원이라고 할 때`;
            right = `$${T} = ${O} \\times ${comma(p)}$`;
            wr = [`$${T} = ${O} + ${comma(p)}$`, `$${O} = ${T} \\times ${comma(p)}$`, `$${T} = ${O} \\div ${comma(p)}$`, `$${O} = ${T} + ${comma(p)}$`];
          } else {
            const d = r.int(1, 8);
            q = `서울이 오후 $${d + 3}$ 시일 때 어느 도시는 오후 $3$ 시입니다. 서울의 시각을 $${O}$, 그 도시의 시각을 $${T}$ 라고 할 때 (같은 날 오후 기준)`;
            right = level === 3 ? `$${O} = ${T} + ${d}$` : `$${T} = ${O} - ${d}$`;
            wr = [`$${T} = ${O} + ${d}$`, `$${O} = ${T} - ${d}$`, `$${T} = ${O} \\times ${d}$`, `$${T} = ${O} - ${d + 3}$`];
          }
          return {
            q: `${q}, 두 양 사이의 대응 관계를 바르게 나타낸 식은?`,
            answer: makeChoices(r, right, wr, level === 1 ? 4 : 5),
            steps: ['두 양 중 하나가 변할 때 다른 하나가 어떻게 변하는지 한두 가지 예를 들어 봐요.', `대응 관계를 식으로 나타내면 ${right}`],
          };
        },
      },
      {
        id: 'word',
        title: '대응 관계로 값 구하기',
        gen(r, level) {
          const k = r.int(0, 3);
          if (k === 0) {
            const per = r.int(3, 9),
              n = level === 1 ? r.int(5, 12) : level === 2 ? r.int(15, 40) : r.int(50, 120);
            if (level === 3) {
              return {
                q: `꽃 한 송이에 꽃잎이 $${per}$ 장씩 있습니다. 꽃잎이 모두 $${per * n}$ 장이라면 꽃은 몇 송이인가요?`,
                answer: intAns(n, '송이'),
                steps: [`꽃의 수 $\\bigcirc$, 꽃잎 수 $\\triangle$ 라 하면 $\\triangle = \\bigcirc \\times ${per}$`, `$\\bigcirc = \\triangle \\div ${per} = ${per * n} \\div ${per} = ${n}$ (송이)`],
              };
            }
            return {
              q: `꽃 한 송이에 꽃잎이 $${per}$ 장씩 있습니다. 꽃 $${n}$ 송이의 꽃잎은 모두 몇 장인가요?`,
              answer: intAns(per * n, '장'),
              steps: [`$\\triangle = \\bigcirc \\times ${per}$`, `$${n} \\times ${per} = ${per * n}$ (장)`],
            };
          }
          if (k === 1) {
            const nm = pickName(r);
            const age = r.int(9, 12),
              diff = r.int(25, 38),
              later = level === 1 ? r.int(2, 9) : r.int(10, 30);
            return {
              q: `올해 ${josa(nm, '은/는')} $${age}$ 살이고, 어머니는 $${age + diff}$ 살입니다. ${nm}${jo(nm, '이/가')} $${age + later}$ 살이 될 때 어머니는 몇 살이 되나요?`,
              answer: intAns(age + later + diff, '살'),
              steps: [`두 사람의 나이 차는 항상 $${age + diff} - ${age} = ${diff}$ 살`, `$\\triangle = \\bigcirc + ${diff}$ → $${age + later} + ${diff} = ${age + later + diff}$ (살)`],
            };
          }
          if (k === 2) {
            const n = level === 1 ? r.int(4, 9) : level === 2 ? r.int(10, 25) : r.int(26, 60);
            if (level === 3) {
              return {
                q: `색 테이프를 한 번 자를 때마다 도막이 하나씩 늘어납니다. 색 테이프를 잘라 $${n}$ 도막을 만들려면 몇 번 잘라야 하나요?`,
                answer: intAns(n - 1, '번'),
                steps: [`자른 횟수 $\\bigcirc$, 도막 수 $\\triangle$: $\\triangle = \\bigcirc + 1$`, `$\\bigcirc = ${n} - 1 = ${n - 1}$ (번)`],
              };
            }
            return {
              q: `색 테이프를 한 번 자를 때마다 도막이 하나씩 늘어납니다. 색 테이프를 $${n}$ 번 자르면 몇 도막이 되나요?`,
              answer: intAns(n + 1, '도막'),
              steps: [`$\\triangle = \\bigcirc + 1$`, `$${n} + 1 = ${n + 1}$ (도막)`],
            };
          }
          const per = r.int(2, 5),
            n = level === 1 ? r.int(4, 10) : level === 2 ? r.int(11, 30) : r.int(31, 80);
          return {
            q: `길이가 $1$ m 인 끈마다 구슬을 $${per}$ 개씩 꿰어 장식을 만듭니다. 끈 $${n}$ 개로 장식을 만들 때 필요한 구슬은 몇 개인가요?`,
            answer: intAns(per * n, '개'),
            steps: [`끈 수 $\\bigcirc$, 구슬 수 $\\triangle$: $\\triangle = \\bigcirc \\times ${per}$`, `$${n} \\times ${per} = ${per * n}$ (개)`],
          };
        },
      },
    ],
  },

  // ═════════════ 5-1-4 약분과 통분 ═════════════
  'e5a-4': {
    concepts: [
      {
        title: '크기가 같은 분수',
        body: '분모와 분자에 **0이 아닌 같은 수를 곱하거나**, 분모와 분자를 **같은 수로 나누면** 크기가 같은 분수가 돼요.\n$$\\frac{2}{3} = \\frac{4}{6} = \\frac{6}{9} = \\frac{8}{12}$$',
      },
      {
        title: '약분과 기약분수',
        body: '분모와 분자를 그 **공약수로 나누어** 간단하게 하는 것을 약분이라고 해요.\n분모와 분자의 공약수가 $1$ 뿐인 분수를 **기약분수**라고 해요. 최대공약수로 나누면 한 번에 기약분수가 돼요.\n$$\\frac{18}{24} = \\frac{18 \\div 6}{24 \\div 6} = \\frac{3}{4}$$',
        example: { q: '$\\frac{20}{30}$ 을 기약분수로', a: '최대공약수 $10$ 으로 나누면 $\\frac{2}{3}$' },
      },
      {
        title: '통분',
        body: '분수의 분모를 같게 하는 것을 통분, 같게 한 분모를 **공통분모**라고 해요.\n- 두 분모의 곱을 공통분모로: $\\frac{1}{4}, \\frac{5}{6} \\to \\frac{6}{24}, \\frac{20}{24}$\n- 두 분모의 **최소공배수**를 공통분모로 (수가 작아 편리): $\\frac{3}{12}, \\frac{10}{12}$',
      },
      {
        title: '분수와 소수의 크기 비교',
        body: '분모가 다른 분수는 **통분해서** 분자를 비교해요.\n분수와 소수는 분수를 소수로 (또는 소수를 분수로) 바꾸어 비교해요. $\\frac{3}{5} = \\frac{6}{10} = 0.6$',
      },
    ],
    skills: [
      {
        id: 'equiv',
        title: '크기가 같은 분수',
        gen(r, level) {
          const f = properFrac(r, 2, level === 1 ? 9 : 12);
          const k = r.int(2, level === 1 ? 5 : 9);
          if (level === 1) {
            return {
              q: `$\\square$ 안에 알맞은 수를 구하세요.\n$$${ft(f)} = \\frac{\\square}{${f.d * k}}$$`,
              answer: intAns(f.n * k),
              steps: [`분모에 ${nj(k, '을/를')} 곱했으므로 분자에도 ${nj(k, '을/를')} 곱해요.`, `$${f.n} \\times ${k} = ${f.n * k}$`],
            };
          }
          if (level === 2) {
            return {
              q: `$\\square$ 안에 알맞은 수를 구하세요.\n$$\\frac{${f.n * k}}{${f.d * k}} = \\frac{\\square}{${f.d}}$$`,
              answer: intAns(f.n),
              steps: [`분모를 ${ro(k)} 나누었으므로 분자도 ${ro(k)} 나눠요.`, `$${f.n * k} \\div ${k} = ${f.n}$`],
            };
          }
          let k2 = r.int(2, 6);
          if (k2 === k) k2 = k2 === 6 ? 2 : k2 + 1; // 처음 분수와 같은 분모가 되지 않게
          return {
            q: `두 $\\square$ 안에 들어갈 수의 합을 구하세요.\n$$\\frac{${f.n * k}}{${f.d * k}} = \\frac{${f.n}}{\\square} = \\frac{\\square}{${f.d * k2}}$$`,
            answer: intAns(f.d + f.n * k2),
            steps: [`$\\frac{${f.n * k}}{${f.d * k}} = ${ft(f)}$ 이므로 첫째 $\\square = ${f.d}$`, `$${ft(f)} = \\frac{${f.n * k2}}{${f.d * k2}}$ 이므로 둘째 $\\square = ${f.n * k2}$`, `합: $${f.d} + ${f.n * k2} = ${f.d + f.n * k2}$`],
          };
        },
      },
      {
        id: 'reduce',
        title: '기약분수로 나타내기',
        gen(r, level) {
          const f = properFrac(r, 3, level === 1 ? 9 : level === 2 ? 15 : 20);
          const g = level === 1 ? r.int(2, 5) : level === 2 ? r.int(3, 9) : r.int(6, 15);
          const n = f.n * g,
            d = f.d * g;
          return {
            q: `$\\frac{${n}}{${d}}$ ${jo(String(n), '을/를')} 기약분수로 나타내세요.`,
            answer: fracAns(f, { mixed: false }),
            steps: [`${nj(n, '과/와')} $${d}$ 의 최대공약수는 $${g}$`, `$\\frac{${n} \\div ${g}}{${d} \\div ${g}} = ${ft(f)}$`],
            hint: '분모와 분자의 최대공약수로 나누어 보세요.',
          };
        },
      },
      {
        id: 'reduce-choice',
        title: '약분한 분수 찾기',
        gen(r, level) {
          const f = properFrac(r, 2, level === 1 ? 5 : 7);
          const G = r.pick(level === 1 ? [6, 8, 12] : level === 2 ? [12, 18, 20] : [24, 36, 30]);
          const n = f.n * G,
            d = f.d * G;
          const ds = divisors(G).filter((x) => x > 1);
          const goods = ds.map((x) => `$\\frac{${n / x}}{${d / x}}$`);
          let bad = '',
            badN = n + 1;
          for (let t = 0; t < 50; t++) {
            const x = r.pick(ds);
            const nn = n / x + r.pick([1, -1, 2]);
            if (nn > 0 && nn < d / x && !new F(nn, d / x).eq(f)) {
              bad = `$\\frac{${nn}}{${d / x}}$`;
              badN = nn;
              break;
            }
          }
          if (!bad) bad = `$\\frac{${n + 1}}{${d}}$`;
          return {
            q: `$\\frac{${n}}{${d}}$ ${jo(String(n), '을/를')} 약분한 분수가 **아닌** 것은?`,
            answer: makeChoices(r, bad, goods, 5),
            steps: [`${nj(n, '과/와')} $${d}$ 의 공약수: $${ds.join(', ')}$ (1 제외)`, `공약수로 나눈 분수: ${goods.join(', ')}`, `${bad} ${jo(String(badN), '은/는')} 크기가 달라요.`],
          };
        },
      },
      {
        id: 'common-den',
        title: '통분하기',
        gen(r, level) {
          let a: F, b: F;
          for (;;) {
            a = properFrac(r, 2, level === 1 ? 8 : 12);
            b = properFrac(r, 2, level === 1 ? 10 : 15);
            const dv = Math.max(a.d, b.d) % Math.min(a.d, b.d) === 0;
            if (a.d !== b.d && (level === 1 ? dv : level === 2 ? !dv : !dv && gcd(a.d, b.d) > 1)) break;
          }
          const L = lcm(a.d, b.d);
          return {
            q: `${fj(a, '과/와', false)} ${fj(b, '을/를', false)} 분모의 **최소공배수**를 공통분모로 하여 통분하세요.`,
            answer: {
              type: 'fields',
              fields: [
                { label: '공통분모', value: L },
                { label: '첫째 분수의 분자', value: (a.n * L) / a.d },
                { label: '둘째 분수의 분자', value: (b.n * L) / b.d },
              ],
            },
            steps: [`${nj(a.d, '과/와')} $${b.d}$ 의 최소공배수: $${L}$`, `$${ft(a)} = \\frac{${a.n}\\times${L / a.d}}{${a.d}\\times${L / a.d}} = \\frac{${(a.n * L) / a.d}}{${L}}$`, `$${ft(b)} = \\frac{${b.n}\\times${L / b.d}}{${b.d}\\times${L / b.d}} = \\frac{${(b.n * L) / b.d}}{${L}}$`],
          };
        },
      },
      {
        id: 'compare',
        title: '분수의 크기 비교',
        gen(r, level) {
          if (level === 1) {
            let a: F, b: F;
            do {
              a = properFrac(r, 2, 10);
              b = properFrac(r, 2, 10);
            } while (a.d === b.d || a.eq(b));
            const L = lcm(a.d, b.d);
            const sign = a.cmp(b) > 0 ? '>' : '<';
            return {
              q: `두 분수의 크기를 비교하여 알맞은 것을 고르세요.\n$$${ft(a)} \\;\\bigcirc\\; ${ft(b)}$$`,
              answer: makeChoices(r, `$${sign}$`, ['$>$', '$<$', '$=$'], 3),
              steps: [`통분: $${ft(a)} = \\frac{${(a.n * L) / a.d}}{${L}}$, $${ft(b)} = \\frac{${(b.n * L) / b.d}}{${L}}$`, `분자를 비교하면 $${ft(a)} ${sign} ${ft(b)}$`],
            };
          }
          const fs: F[] = [];
          while (fs.length < 4) {
            const f = properFrac(r, 2, level === 2 ? 12 : 15);
            if (!fs.some((g) => g.eq(f))) fs.push(f);
          }
          const big = level === 3 ? r.chance(0.5) : true;
          const target = fs.reduce((m, f) => (big ? (f.cmp(m) > 0 ? f : m) : f.cmp(m) < 0 ? f : m));
          const show = (f: F, i: number) => (level === 3 && i === 0 && [2, 4, 5, 10, 20, 25].includes(f.d) ? `$${round(f.value, 6)}$` : `$${ft(f)}$`);
          const labels = fs.map(show);
          const right = labels[fs.indexOf(target)];
          return {
            q: `다음 중 가장 ${big ? '큰' : '작은'} 수는?`,
            answer: makeChoices(r, right, labels.filter((l) => l !== right), 4),
            steps: [`소수로 어림하거나 통분하여 비교해요: ${fs.map((f, i) => `${labels[i]} $\\approx ${round(f.value, 3)}$`).join(', ')}`, `가장 ${big ? '큰' : '작은'} 수는 ${right}`],
          };
        },
      },
      {
        id: 'frac-dec',
        title: '분수와 소수',
        gen(r, level) {
          const d = r.pick(level === 1 ? [2, 5, 10] : level === 2 ? [4, 5, 20, 25, 50] : [8, 20, 25, 40, 50]);
          let n = r.int(1, d - 1);
          while (gcd(n, d) !== 1) n = r.int(1, d - 1);
          // 3단계: 대분수(자연수 부분 1~3) 또는 분모 8·40 (소수 세 자리)
          const w = level === 3 && r.chance(0.5) ? r.int(1, 3) : 0;
          const f = new F(n, d).add(w);
          const den = d <= 10 && 10 % d === 0 ? 10 : 100 % d === 0 ? 100 : 1000;
          if (r.chance(0.5) || level === 1) {
            const fTex = w ? mt(f) : ft(f);
            return {
              q: `$${fTex}$ ${jo(String(n), '을/를')} 소수로 나타내세요.`,
              answer: decAns(f.value),
              steps:
                d === 10
                  ? [`$${fTex} = ${dt(f.value)}$`]
                  : [`분모를 ${den}으로: $\\frac{${n}}{${d}} = \\frac{${n * (den / d)}}{${den}} = ${dt(n / d)}$`, ...(w ? [`$${fTex} = ${w} + ${dt(n / d)} = ${dt(f.value)}$`] : [])],
            };
          }
          const v = f.value;
          const den2 = p10(places(v));
          return {
            q: `${nj(dt(v), '을/를')} 기약분수로 나타내세요.`,
            answer: fracAns(f, { mixed: w > 0 }),
            steps: [`$${dt(v)} = \\frac{${round(v * den2)}}{${den2}}$`, `약분하면 $${reduceTex(round(v * den2), den2, w > 0)}$`],
          };
        },
      },
    ],
  },

  // ═════════════ 5-1-5 분수의 덧셈과 뺄셈 ═════════════
  'e5a-5': {
    concepts: [
      {
        title: '분모가 다른 진분수의 덧셈',
        body: '분모가 다르면 먼저 **통분**한 다음, 분자끼리 더해요. 결과는 약분하고, 가분수면 대분수로 나타내요.\n$$\\frac{1}{4} + \\frac{5}{6} = \\frac{3}{12} + \\frac{10}{12} = \\frac{13}{12} = 1\\frac{1}{12}$$',
      },
      {
        title: '분모가 다른 진분수의 뺄셈',
        body: '통분한 다음 분자끼리 빼요.\n$$\\frac{3}{4} - \\frac{1}{6} = \\frac{9}{12} - \\frac{2}{12} = \\frac{7}{12}$$\n4학년에서 배운 분모가 같은 분수의 계산과 같은 원리예요.',
      },
      {
        title: '대분수의 덧셈',
        body: '- 방법 1: **자연수끼리, 분수끼리** 더해요. 분수 부분이 가분수가 되면 자연수로 올려요.\n- 방법 2: 대분수를 **가분수로** 바꾸어 더해요.\n$$1\\frac{2}{3} + 2\\frac{1}{2} = 3 + \\frac{4}{6} + \\frac{3}{6} = 3\\frac{7}{6} = 4\\frac{1}{6}$$',
      },
      {
        title: '대분수의 뺄셈',
        body: '자연수끼리, 분수끼리 빼요. 분수끼리 뺄 수 없으면 자연수에서 $1$ 을 **받아내림**해요.\n$$3\\frac{1}{4} - 1\\frac{2}{3} = 2\\frac{15}{12} - 1\\frac{8}{12} = 1\\frac{7}{12}$$',
      },
    ],
    skills: [
      {
        id: 'add-proper',
        title: '진분수의 덧셈',
        gen(r, level) {
          let a: F, b: F;
          for (;;) {
            a = properFrac(r, 2, level === 1 ? 8 : 12);
            b = properFrac(r, 2, level === 1 ? 9 : 15);
            if (a.d === b.d) continue;
            const L = lcm(a.d, b.d);
            if (level === 1 && Math.max(a.d, b.d) % Math.min(a.d, b.d) !== 0) continue;
            if (level === 1 && a.add(b).cmp(1) >= 0) continue;
            if (level === 3 && (a.add(b).cmp(1) <= 0 || L === a.d * b.d)) continue;
            if (L <= 60) break;
          }
          const L = lcm(a.d, b.d);
          const na = (a.n * L) / a.d,
            nb = (b.n * L) / b.d;
          const s = a.add(b);
          return {
            q: `계산하세요.\n$$${ft(a)} + ${ft(b)}$$`,
            answer: fracAns(s),
            steps: [`통분: $\\frac{${na}}{${L}} + \\frac{${nb}}{${L}}$`, `$= ${reduceTex(na + nb, L)}$`],
            hint: '분모의 최소공배수로 통분해 보세요.',
          };
        },
      },
      {
        id: 'sub-proper',
        title: '진분수의 뺄셈',
        gen(r, level) {
          let a: F, b: F;
          for (;;) {
            a = properFrac(r, 2, level === 1 ? 8 : 12);
            b = properFrac(r, 2, level === 1 ? 9 : 15);
            if (a.d === b.d || a.cmp(b) <= 0) continue;
            if (level === 1 && Math.max(a.d, b.d) % Math.min(a.d, b.d) !== 0) continue;
            // 3단계: 최소공배수 < 두 분모의 곱, 결과를 약분해야 함
            if (level === 3 && (lcm(a.d, b.d) === a.d * b.d || Math.max(a.d, b.d) % Math.min(a.d, b.d) === 0 || a.sub(b).d === lcm(a.d, b.d))) continue;
            if (lcm(a.d, b.d) <= 60) break;
          }
          const L = lcm(a.d, b.d);
          const na = (a.n * L) / a.d,
            nb = (b.n * L) / b.d;
          return {
            q: `계산하세요.\n$$${ft(a)} - ${ft(b)}$$`,
            answer: fracAns(a.sub(b)),
            steps: [`통분: $\\frac{${na}}{${L}} - \\frac{${nb}}{${L}}$`, `$= ${reduceTex(na - nb, L)}$`],
          };
        },
      },
      {
        id: 'add-mixed',
        title: '대분수의 덧셈',
        gen(r, level) {
          let a: F, b: F;
          for (;;) {
            const fa = properFrac(r, 2, level === 1 ? 6 : 10),
              fb = properFrac(r, 2, level === 1 ? 8 : 12);
            if (fa.d === fb.d) continue;
            const carry = fa.add(fb).cmp(1) >= 0;
            if (level === 1 && carry) continue;
            if (level === 3 && !carry) continue;
            a = fa.add(r.int(1, level === 3 ? 9 : 5));
            b = fb.add(r.int(1, level === 3 ? 9 : 5));
            if (lcm(fa.d, fb.d) <= 48) break;
          }
          const L = lcm(a.d, b.d);
          const wa = Math.floor(a.value),
            wb = Math.floor(b.value);
          const na = ((a.n - wa * a.d) * L) / a.d,
            nb = ((b.n - wb * b.d) * L) / b.d;
          const s = a.add(b);
          return {
            q: `계산하세요.\n$$${mt(a)} + ${mt(b)}$$`,
            answer: fracAns(s),
            steps: [`자연수끼리: $${wa} + ${wb} = ${wa + wb}$`, `분수끼리 통분해서: $\\frac{${na}}{${L}} + \\frac{${nb}}{${L}} = \\frac{${na + nb}}{${L}}$`, `$${wa + wb} + \\frac{${na + nb}}{${L}} = ${mt(s)}$`],
          };
        },
      },
      {
        id: 'sub-mixed',
        title: '대분수의 뺄셈',
        gen(r, level) {
          let a: F, b: F;
          for (;;) {
            const fa = properFrac(r, 2, level === 1 ? 6 : 10),
              fb = properFrac(r, 2, level === 1 ? 8 : 12);
            if (fa.d === fb.d) continue;
            const borrow = fa.cmp(fb) < 0;
            if (level === 1 && borrow) continue;
            if (level === 3 && !borrow) continue;
            const wb = r.int(1, 5);
            const wa = wb + r.int(1, 4);
            a = fa.add(wa);
            b = fb.add(wb);
            if (lcm(fa.d, fb.d) <= 48) break;
          }
          const L = lcm(a.d, b.d);
          const wa = Math.floor(a.value),
            wb = Math.floor(b.value);
          const na = ((a.n - wa * a.d) * L) / a.d,
            nb = ((b.n - wb * b.d) * L) / b.d;
          const res = a.sub(b);
          const steps =
            na >= nb
              ? [`통분: $${wa}\\frac{${na}}{${L}} - ${wb}\\frac{${nb}}{${L}}$`, `자연수끼리 $${wa - wb}$, 분수끼리 $\\frac{${na - nb}}{${L}}$`, `$= ${mt(res)}$`]
              : [`통분: $${wa}\\frac{${na}}{${L}} - ${wb}\\frac{${nb}}{${L}}$`, `분수끼리 뺄 수 없으므로 받아내림: $${wa - 1}\\frac{${na + L}}{${L}} - ${wb}\\frac{${nb}}{${L}}$`, `$= ${wa - 1 - wb > 0 ? wa - 1 - wb : ''}\\frac{${na + L - nb}}{${L}}${new F(na + L - nb, L).d === L ? '' : ` = ${mt(res)}`}$`];
          return {
            q: `계산하세요.\n$$${mt(a)} - ${mt(b)}$$`,
            answer: fracAns(res),
            steps,
            hint: level === 3 ? '분수 부분끼리 뺄 수 없으면 자연수에서 1을 받아내림해요.' : undefined,
          };
        },
      },
      {
        id: 'word',
        title: '분수 덧셈·뺄셈 문장제',
        gen(r, level) {
          const nm = pickName(r);
          const k = level === 3 ? 3 : r.int(0, 3);
          const mixed = level >= 2;
          let a: F, b: F;
          for (;;) {
            a = properFrac(r, 2, 10);
            b = properFrac(r, 2, 12);
            if (a.d !== b.d && lcm(a.d, b.d) <= 40 && a.cmp(b) !== 0) break;
          }
          if (mixed) {
            a = a.add(r.int(1, 4));
            b = b.add(r.int(1, 3));
          }
          if (a.cmp(b) < 0) [a, b] = [b, a];
          if (k === 0) {
            return {
              q: `${josa(nm, '은/는')} 우유를 오전에 $${mt(b)}$ L, 오후에 $${mt(a)}$ L 마셨습니다. 하루 동안 마신 우유는 모두 몇 L 인가요?`,
              answer: fracAns(a.add(b), { unit: 'L' }),
              steps: [`식: $${mt(b)} + ${mt(a)}$`, `$= ${mt(a.add(b))}$ (L)`],
            };
          }
          if (k === 1) {
            return {
              q: `길이가 $${mt(a)}$ m 인 리본 중에서 $${mt(b)}$ m 를 사용했습니다. 남은 리본은 몇 m 인가요?`,
              answer: fracAns(a.sub(b), { unit: 'm' }),
              steps: [`식: $${mt(a)} - ${mt(b)}$`, `$= ${mt(a.sub(b))}$ (m)`],
            };
          }
          if (k === 2) {
            const nm2 = pickNames(r, 2).find((x) => x !== nm) ?? '지우';
            return {
              q: `${josa(nm, '은/는')} $${mt(a)}$ km, ${josa(nm2, '은/는')} $${mt(b)}$ km 를 걸었습니다. 누가 몇 km 더 많이 걸었는지 구할 때, 더 걸은 거리는 몇 km 인가요?`,
              answer: fracAns(a.sub(b), { unit: 'km' }),
              steps: [`$${mt(a)} > ${mt(b)}$ 이므로 ${nm}${jo(nm, '이/가')} 더 많이 걸었어요.`, `$${mt(a)} - ${mt(b)} = ${mt(a.sub(b))}$ (km)`],
            };
          }
          // 세 수
          const tot = a.add(b);
          let c = properFrac(r, 2, 8);
          if (level === 1) c = new F(1, c.d);
          if (level === 3) c = c.add(1);
          while (c.cmp(tot) >= 0) c = new F(1, c.d + 1);
          const res = tot.sub(c);
          return {
            q: `밀가루가 $${mt(a)}$ kg 있었는데 $${mt(b)}$ kg 을 더 사 왔습니다. 그중에서 빵을 만드는 데 $${mt(c)}$ kg 을 사용했다면 남은 밀가루는 몇 kg 인가요?`,
            answer: fracAns(res, { unit: 'kg' }),
            steps: [`식: $${mt(a)} + ${mt(b)} - ${mt(c)}$`, `$${mt(a)} + ${mt(b)} = ${mt(tot)}$`, `$${mt(tot)} - ${mt(c)} = ${mt(res)}$ (kg)`],
          };
        },
      },
      {
        id: 'missing',
        title: '어떤 수 구하기',
        gen(r, level) {
          let a: F, b: F;
          for (;;) {
            a = properFrac(r, 2, 9);
            b = properFrac(r, 2, 12);
            if (a.d !== b.d && lcm(a.d, b.d) <= 36) break;
          }
          if (level >= 2) {
            a = a.add(r.int(1, 3));
            b = b.add(r.int(1, 3));
          }
          if (level === 3) {
            // 어떤 수에서 b 를 빼야 할 것을 잘못하여 더했더니 a+... 가 됨
            const x = a;
            const wrong = x.add(b);
            const right = x.sub(b).cmp(0) > 0 ? x.sub(b) : null;
            if (right) {
              return {
                q: `어떤 수에서 ${fj(b, '을/를', true)} 빼야 할 것을 잘못하여 더했더니 ${fj(wrong, '이/가', true)} 되었습니다. 바르게 계산하면 얼마인가요?`,
                answer: fracAns(right),
                steps: [`어떤 수 $= ${mt(wrong)} - ${mt(b)} = ${mt(x)}$`, `바른 계산: $${mt(x)} - ${mt(b)} = ${mt(right)}$`],
              };
            }
            const w2 = x.add(b).add(b);
            return {
              q: `어떤 수에 ${fj(b, '을/를', true)} 더해야 할 것을 잘못하여 뺐더니 ${fj(x, '이/가', true)} 되었습니다. 바르게 계산하면 얼마인가요?`,
              answer: fracAns(w2),
              steps: [`어떤 수 $= ${mt(x)} + ${mt(b)} = ${mt(x.add(b))}$`, `바른 계산: $${mt(x.add(b))} + ${mt(b)} = ${mt(w2)}$`],
            };
          }
          const s = a.add(b);
          return {
            q: `$\\square$ 안에 알맞은 수를 구하세요.\n$$\\square + ${mt(b)} = ${mt(s)}$$`,
            answer: fracAns(a),
            steps: [`$\\square = ${mt(s)} - ${mt(b)}$`, `$= ${mt(a)}$`],
          };
        },
      },
    ],
  },

  // ═════════════ 5-1-6 다각형의 둘레와 넓이 ═════════════
  'e5a-6': {
    concepts: [
      {
        title: '다각형의 둘레',
        body: '- 정다각형의 둘레 $=$ (한 변의 길이) $\\times$ (변의 수)\n- 직사각형의 둘레 $=$ ((가로) $+$ (세로)) $\\times 2$\n- 평행사변형의 둘레 $=$ ((한 변) $+$ (다른 한 변)) $\\times 2$\n- 마름모의 둘레 $=$ (한 변) $\\times 4$',
      },
      {
        title: '넓이의 단위',
        body: '한 변이 $1$ cm 인 정사각형의 넓이를 $1$ cm²(제곱센티미터)라고 해요.\n- $1$ m² $= 10000$ cm² ($100 \\times 100$)\n- $1$ km² $= 1000000$ m² ($1000 \\times 1000$)',
      },
      {
        title: '직사각형과 정사각형의 넓이',
        body: '- 직사각형의 넓이 $=$ (가로) $\\times$ (세로)\n- 정사각형의 넓이 $=$ (한 변) $\\times$ (한 변)',
        example: { q: '가로 $8$ cm, 세로 $5$ cm 인 직사각형', a: '$8 \\times 5 = 40$ (cm²)' },
      },
      {
        title: '평행사변형과 삼각형의 넓이',
        body: '- 평행사변형의 넓이 $=$ (밑변) $\\times$ (높이) — 잘라 붙이면 직사각형이 돼요.\n- 삼각형의 넓이 $=$ (밑변) $\\times$ (높이) $\\div 2$ — 똑같은 삼각형 2개로 평행사변형을 만들 수 있어요.\n- 높이는 밑변에 **수직인** 선분의 길이예요.',
      },
      {
        title: '마름모와 사다리꼴의 넓이',
        body: '- 마름모의 넓이 $=$ (한 대각선) $\\times$ (다른 대각선) $\\div 2$\n- 사다리꼴의 넓이 $=$ ((윗변) $+$ (아랫변)) $\\times$ (높이) $\\div 2$',
      },
    ],
    skills: [
      {
        id: 'perimeter',
        title: '다각형의 둘레',
        gen(r, level) {
          if (level === 1) {
            const n = r.int(3, 8),
              a = r.int(3, 15);
            const nm = ['', '', '', '정삼각형', '정사각형', '정오각형', '정육각형', '정칠각형', '정팔각형'][n];
            const s = new Svg(180, 150);
            const pts = regularPolygon(n, 90, 80, 60);
            s.poly(pts, { cls: 'acc', fill: true });
            const [p, q] = [pts[n - 1], pts[0]];
            s.text((p[0] + q[0]) / 2 - 18, (p[1] + q[1]) / 2 - 2, `${a} cm`, { size: 12 });
            return {
              q: `한 변의 길이가 $${a}$ cm 인 ${nm}의 둘레는 몇 cm 인가요?`,
              fig: s.toString(),
              answer: intAns(a * n, 'cm'),
              steps: [`${nm}은 변이 $${n}$ 개이고 길이가 모두 같아요.`, `$${a} \\times ${n} = ${a * n}$ (cm)`],
            };
          }
          if (level === 2) {
            const a = r.int(4, 20),
              b = r.int(3, 15);
            const isRect = r.chance(0.5);
            const pts: P[] = isRect
              ? [
                  [0, 0],
                  [a, 0],
                  [a, b * 0.8],
                  [0, b * 0.8],
                ]
              : para(a, b * 0.7, b * 0.4);
            return {
              q: `다음 ${isRect ? '직사각형' : '평행사변형'}의 둘레는 몇 cm 인가요?`,
              fig: shapeFig(pts, { sides: [`${a} cm`, isRect ? `${b} cm` : `${b} cm`] }),
              answer: intAns(2 * (a + b), 'cm'),
              steps: [`마주 보는 변의 길이가 같아요.`, `$(${a} + ${b}) \\times 2 = ${2 * (a + b)}$ (cm)`],
            };
          }
          const W = r.int(8, 20),
            H = r.int(6, 15),
            w = r.int(2, W - 3),
            h = r.int(2, H - 2);
          const pts: P[] = [
            [0, 0],
            [W, 0],
            [W, H - h],
            [W - w, H - h],
            [W - w, H],
            [0, H],
          ];
          return {
            q: '다음 도형의 둘레는 몇 cm 인가요? (모든 각은 직각입니다.)',
            fig: shapeFig(pts, { sides: [`${W} cm`, `${H - h} cm`, null, null, `${W - w} cm`, `${H} cm`] }),
            answer: intAns(2 * (W + H), 'cm'),
            steps: ['변을 옮겨 보면 가로 $' + W + '$ cm, 세로 $' + H + '$ cm 인 직사각형의 둘레와 같아요.', `$(${W} + ${H}) \\times 2 = ${2 * (W + H)}$ (cm)`],
            hint: '꺾인 변을 밀어서 직사각형 모양으로 생각해 보세요.',
          };
        },
      },
      {
        id: 'rect-area',
        title: '직사각형·정사각형의 넓이',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(3, 15),
              b = r.int(2, 12);
            const sq = a === b;
            return {
              q: `다음 ${sq ? '정사각형' : '직사각형'}의 넓이는 몇 cm² 인가요?`,
              fig: shapeFig(
                [
                  [0, 0],
                  [a, 0],
                  [a, b],
                  [0, b],
                ],
                { sides: [`${a} cm`, `${b} cm`], rightAt: [0] },
              ),
              answer: intAns(a * b, 'cm²'),
              steps: [`$${a} \\times ${b} = ${a * b}$ (cm²)`],
            };
          }
          if (level === 2) {
            const P = r.int(8, 30) * 2;
            const a = r.int(2, P / 2 - 2);
            const b = P / 2 - a;
            const sq = r.chance(0.3);
            if (sq) {
              const s = r.int(3, 15);
              return {
                q: `둘레가 $${4 * s}$ cm 인 정사각형의 넓이는 몇 cm² 인가요?`,
                answer: intAns(s * s, 'cm²'),
                steps: [`한 변: $${4 * s} \\div 4 = ${s}$ (cm)`, `넓이: $${s} \\times ${s} = ${s * s}$ (cm²)`],
              };
            }
            return {
              q: `둘레가 $${P}$ cm 이고 가로가 $${a}$ cm 인 직사각형의 넓이는 몇 cm² 인가요?`,
              answer: intAns(a * b, 'cm²'),
              steps: [`가로 + 세로 $= ${P} \\div 2 = ${P / 2}$ (cm)`, `세로: $${P / 2} - ${a} = ${b}$ (cm)`, `넓이: $${a} \\times ${b} = ${a * b}$ (cm²)`],
            };
          }
          const W = r.int(8, 20),
            H = r.int(6, 15),
            w = r.int(2, W - 3),
            h = r.int(2, H - 2);
          const pts: P[] = [
            [0, 0],
            [W, 0],
            [W, H - h],
            [W - w, H - h],
            [W - w, H],
            [0, H],
          ];
          const A = W * H - w * h;
          return {
            q: '다음 도형의 넓이는 몇 cm² 인가요? (모든 각은 직각입니다.)',
            fig: shapeFig(pts, { sides: [`${W} cm`, `${H - h} cm`, null, null, `${W - w} cm`, `${H} cm`] }),
            answer: intAns(A, 'cm²'),
            steps: [`큰 직사각형: $${W} \\times ${H} = ${W * H}$ (cm²)`, `빈 부분: 가로 $${W} - ${W - w} = ${w}$, 세로 $${H} - ${H - h} = ${h}$ → $${w} \\times ${h} = ${w * h}$ (cm²)`, `$${W * H} - ${w * h} = ${A}$ (cm²)`],
          };
        },
      },
      {
        id: 'para-tri',
        title: '평행사변형·삼각형의 넓이',
        gen(r, level) {
          const b = r.int(5, level === 1 ? 12 : 20),
            h = r.int(3, level === 1 ? 10 : 16);
          /** 높이 h, 수평 거리 ≤ maxOff 인 정수 길이 빗변 (없으면 null) */
          const slant = (hh: number, minOff: number, maxOff: number): number | null => {
            const cs: number[] = [];
            for (let c = hh + 1; c * c <= hh * hh + maxOff * maxOff; c++) if (c * c >= hh * hh + minOff * minOff) cs.push(c);
            return cs.length ? r.pick(cs) : null;
          };
          const tri = r.chance(0.5);
          if (level === 3 && !tri) {
            // 평행사변형의 다른 높이
            const A = b * h;
            const cs = divisors(A).filter((c) => c > h && c < b + h && c !== b && A / c < c * 2);
            if (cs.length) {
              const c = r.pick(cs);
              const h2 = A / c;
              const off = Math.sqrt(Math.max(c * c - h * h, 0.01));
              const pts = para(b, h, off);
              return {
                q: `평행사변형에서 변 ㄱㄴ 을 밑변으로 할 때의 높이는 몇 cm 인가요?`,
                fig: shapeFig(pts, { verts: ['ㄴ', 'ㄷ', 'ㄹ', 'ㄱ'], sides: [`${b} cm`, null, null, `${c} cm`], dashed: [{ a: [off, h], b: [off, 0], label: `${h} cm`, right: true }] }),
                answer: intAns(h2, 'cm'),
                steps: [`넓이: (밑변 ㄴㄷ) $\\times$ (높이) $= ${b} \\times ${h} = ${A}$ (cm²)`, `변 ㄱㄴ 을 밑변으로 하면 $${c} \\times \\square = ${A}$`, `$\\square = ${A} \\div ${c} = ${h2}$ (cm)`],
                hint: '어느 변을 밑변으로 해도 넓이는 같아요.',
              };
            }
          }
          if (tri) {
            const hh = (b * h) % 2 === 0 ? h : h + 1;
            if (level === 3) {
              // 높이가 삼각형 밖에 있는 둔각삼각형
              const ext = r.int(2, 6);
              const pts: P[] = [
                [0, 0],
                [b, 0],
                [b + ext, hh],
              ];
              return {
                q: '다음 삼각형의 넓이는 몇 cm² 인가요?',
                fig: shapeFig(pts, { sides: [`${b} cm`], dashed: [{ a: [b + ext, hh], b: [b + ext, 0], label: `${hh} cm`, right: true }], extraLines: [{ a: [b, 0], b: [b + ext, 0], dash: true }] }),
                answer: intAns((b * hh) / 2, 'cm²'),
                steps: ['높이는 밑변의 연장선에 수직으로 그은 선분이에요.', `$${b} \\times ${hh} \\div 2 = ${(b * hh) / 2}$ (cm²)`],
                hint: '높이가 삼각형 밖에 있어도 (밑변) × (높이) ÷ 2 예요.',
              };
            }
            const c = level === 2 ? slant(hh, b * 0.2, b * 0.8) : null;
            const off = c ? Math.sqrt(c * c - hh * hh) : r.pick([0.3, 0.5, 0.7]) * b;
            const apex = b - off;
            const pts: P[] = [
              [0, 0],
              [b, 0],
              [apex, hh],
            ];
            return {
              q: '다음 삼각형의 넓이는 몇 cm² 인가요?',
              fig: shapeFig(pts, { sides: [`${b} cm`, c ? `${c} cm` : null], dashed: [{ a: [apex, hh], b: [apex, 0], label: `${hh} cm`, right: true }] }),
              answer: intAns((b * hh) / 2, 'cm²'),
              steps: [`삼각형의 넓이 $=$ (밑변) $\\times$ (높이) $\\div 2$`, `$${b} \\times ${hh} \\div 2 = ${(b * hh) / 2}$ (cm²)`],
              hint: c ? '높이는 밑변과 수직인 선분이에요.' : undefined,
            };
          }
          const c = level >= 2 ? slant(h, b * 0.2, b * 0.6) : null;
          const sh = c ? Math.sqrt(c * c - h * h) : r.pick([0.3, 0.4, 0.5]) * b;
          const pts = para(b, h, sh);
          return {
            q: '다음 평행사변형의 넓이는 몇 cm² 인가요?',
            fig: shapeFig(pts, { sides: [`${b} cm`, null, null, c ? `${c} cm` : null], dashed: [{ a: [sh, h], b: [sh, 0], label: `${h} cm`, right: true }] }),
            answer: intAns(b * h, 'cm²'),
            steps: [`평행사변형의 넓이 $=$ (밑변) $\\times$ (높이)`, `$${b} \\times ${h} = ${b * h}$ (cm²)`],
          };
        },
      },
      {
        id: 'rhombus-trap',
        title: '마름모·사다리꼴의 넓이',
        gen(r, level) {
          if (r.chance(0.5)) {
            const d1 = r.int(4, level === 1 ? 12 : 20) * (level === 1 ? 1 : 1),
              d2 = r.int(2, level === 1 ? 10 : 16) * 2;
            const pts: P[] = [
              [0, d2 / 2],
              [d1 / 2, 0],
              [d1, d2 / 2],
              [d1 / 2, d2],
            ];
            if (level === 3) {
              // 넓이와 한 대각선으로 다른 대각선 구하기
              const A = (d1 * d2) / 2;
              return {
                q: `넓이가 $${A}$ cm² 인 마름모입니다. 다른 대각선의 길이는 몇 cm 인가요?`,
                fig: shapeFig(pts, {
                  dashed: [
                    { a: [0, d2 / 2], b: [d1, d2 / 2], label: `${d1} cm` },
                    { a: [d1 / 2, d2], b: [d1 / 2, 0], label: '? cm' },
                  ],
                }),
                answer: intAns(d2, 'cm'),
                steps: [`(한 대각선) $\\times$ (다른 대각선) $\\div 2 = ${A}$`, `$${d1} \\times \\square = ${A * 2}$`, `$\\square = ${A * 2} \\div ${d1} = ${d2}$ (cm)`],
              };
            }
            return {
              q: '다음 마름모의 넓이는 몇 cm² 인가요?',
              fig: shapeFig(pts, {
                dashed: [
                  { a: [0, d2 / 2], b: [d1, d2 / 2], label: `${d1} cm` },
                  { a: [d1 / 2, d2], b: [d1 / 2, 0], label: `${d2} cm` },
                ],
              }),
              answer: intAns((d1 * d2) / 2, 'cm²'),
              steps: [`마름모의 넓이 $=$ (한 대각선) $\\times$ (다른 대각선) $\\div 2$`, `$${d1} \\times ${d2} \\div 2 = ${(d1 * d2) / 2}$ (cm²)`],
            };
          }
          const a = r.int(3, level === 1 ? 8 : 14),
            b = a + r.int(2, 8),
            h0 = r.int(3, level === 1 ? 8 : 14);
          const h = ((a + b) * h0) % 2 === 0 ? h0 : h0 + 1;
          const s = r.pick([0.2, 0.4, 0.6]) * (b - a);
          const pts: P[] = [
            [0, 0],
            [b, 0],
            [s + a, h],
            [s, h],
          ];
          if (level === 3) {
            const A = ((a + b) * h) / 2;
            return {
              q: `넓이가 $${A}$ cm² 인 사다리꼴입니다. 높이는 몇 cm 인가요?`,
              fig: shapeFig(pts, { sides: [`${b} cm`, null, `${a} cm`], dashed: [{ a: [s, h], b: [s, 0], label: '? cm', right: true }] }),
              answer: intAns(h, 'cm'),
              steps: [`(윗변 + 아랫변) $\\times$ (높이) $\\div 2 = ${A}$`, `$(${a} + ${b}) \\times \\square = ${A * 2}$`, `$\\square = ${A * 2} \\div ${a + b} = ${h}$ (cm)`],
            };
          }
          return {
            q: '다음 사다리꼴의 넓이는 몇 cm² 인가요?',
            fig: shapeFig(pts, { sides: [`${b} cm`, null, `${a} cm`], dashed: [{ a: [s, h], b: [s, 0], label: `${h} cm`, right: true }] }),
            answer: intAns(((a + b) * h) / 2, 'cm²'),
            steps: [`사다리꼴의 넓이 $=$ ((윗변) $+$ (아랫변)) $\\times$ (높이) $\\div 2$`, `$(${a} + ${b}) \\times ${h} \\div 2 = ${((a + b) * h) / 2}$ (cm²)`],
          };
        },
      },
      {
        id: 'area-unit',
        title: '넓이의 단위',
        gen(r, level) {
          if (level === 1) {
            const m = r.int(2, 30);
            return {
              q: `$${m}$ m² 는 몇 cm² 인가요?`,
              answer: intAns(m * 10000, 'cm²'),
              steps: [`$1$ m² $= 10000$ cm²`, `$${m}$ m² $= ${comma(m * 10000)}$ cm²`],
            };
          }
          if (level === 2) {
            const k = r.int(2, 9);
            const big = r.chance(0.5);
            const v = big ? k * 1000000 : k * 10000;
            return {
              q: big ? `$${comma(v)}$ m² 는 몇 km² 인가요?` : `$${comma(v)}$ cm² 는 몇 m² 인가요?`,
              answer: intAns(k, big ? 'km²' : 'm²'),
              steps: [big ? '$1$ km² $= 1000000$ m²' : '$1$ m² $= 10000$ cm²', `$${comma(v)} \\div ${big ? '1000000' : '10000'} = ${k}$`],
            };
          }
          const a = r.int(2, 9) * 100,
            b = r.int(2, 9) * 100;
          const ar = (a * b) / 10000;
          return {
            q: `가로 $${a}$ cm, 세로 $${b}$ cm 인 직사각형 모양 텃밭의 넓이는 몇 m² 인가요?`,
            answer: numChoices(r, ar, [a * b, (a * b) / 100, ar * 10, ar / 10].filter((x) => x !== ar), 5, 'dec'),
            steps: [`$${a}$ cm $= ${a / 100}$ m, $${b}$ cm $= ${b / 100}$ m`, `$${a / 100} \\times ${b / 100} = ${ar}$ (m²)`],
          };
        },
      },
      {
        id: 'find-length',
        title: '넓이로 길이 구하기',
        gen(r, level) {
          const k = level === 1 ? 0 : level === 2 ? r.int(0, 1) : r.int(1, 2);
          if (k === 0) {
            const a = r.int(3, 15),
              b = r.int(3, 15);
            return {
              q: `넓이가 $${a * b}$ cm² 이고 가로가 $${a}$ cm 인 직사각형의 세로는 몇 cm 인가요?`,
              answer: intAns(b, 'cm'),
              steps: [`(가로) $\\times$ (세로) $= ${a * b}$`, `세로 $= ${a * b} \\div ${a} = ${b}$ (cm)`],
            };
          }
          if (k === 1) {
            const b = r.int(4, 16),
              h = r.int(3, 14);
            const A2 = b * h;
            const A = A2 % 2 === 0 ? A2 / 2 : A2;
            const isTri = A2 % 2 === 0;
            return {
              q: `넓이가 $${A}$ cm² 이고 밑변이 $${b}$ cm 인 ${isTri ? '삼각형' : '평행사변형'}의 높이는 몇 cm 인가요?`,
              answer: intAns(h, 'cm'),
              steps: isTri ? [`(밑변) $\\times$ (높이) $\\div 2 = ${A}$`, `높이 $= ${A} \\times 2 \\div ${b} = ${h}$ (cm)`] : [`(밑변) $\\times$ (높이) $= ${A}$`, `높이 $= ${A} \\div ${b} = ${h}$ (cm)`],
            };
          }
          // 같은 넓이: 평행사변형 → 삼각형 높이
          const b = r.int(3, 10),
            h = r.int(3, 10),
            b2 = r.pick(divisors(2 * b * h).filter((x) => x >= 4 && x <= 30 && x !== b));
          const h2 = (2 * b * h) / b2;
          return {
            q: `밑변 $${b}$ cm, 높이 $${h}$ cm 인 평행사변형과 넓이가 같은 삼각형이 있습니다. 삼각형의 밑변이 $${b2}$ cm 라면 높이는 몇 cm 인가요?`,
            answer: intAns(h2, 'cm'),
            steps: [`평행사변형의 넓이: $${b} \\times ${h} = ${b * h}$ (cm²)`, `삼각형: $${b2} \\times \\square \\div 2 = ${b * h}$`, `$\\square = ${b * h} \\times 2 \\div ${b2} = ${h2}$ (cm)`],
          };
        },
      },
    ],
  },
};

