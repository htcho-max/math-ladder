// 중2-1 (앞): 유리수와 순환소수 / 식의 계산 / 일차부등식
import type { ContentMap, ProblemDraft } from '../../core/types';
import type { Rng } from '../../core/rng';
import { F } from '../../core/frac';
import { factorize, gcd } from '../../core/nt';
import { linTex, termsTex } from '../../core/tex';
import { Svg } from '../../core/fig';
import { cst, mono, texChoices, textChoices, NAMES } from './util';


// ───────── 순환소수 도우미 ─────────
/** n/d (양수) 의 소수 전개: 정수부, 순환하지 않는 부분, 순환마디 */
export function expand(n: number, d: number): { ip: number; pre: string; rep: string } {
  const ip = Math.floor(n / d);
  let rem = n % d;
  const seen = new Map<number, number>();
  let digits = '';
  while (rem !== 0 && !seen.has(rem)) {
    seen.set(rem, digits.length);
    rem *= 10;
    digits += String(Math.floor(rem / d));
    rem %= d;
  }
  if (rem === 0) return { ip, pre: digits, rep: '' };
  const st = seen.get(rem)!;
  return { ip, pre: digits.slice(0, st), rep: digits.slice(st) };
}
/** 순환소수 TeX: 0.1\dot{2}\dot{3} */
export function dotTex(ip: number, pre: string, rep: string): string {
  if (rep.length === 0) return `${ip}.${pre}`;
  let r: string;
  if (rep.length === 1) r = `\\dot{${rep}}`;
  else if (rep.length === 2) r = `\\dot{${rep[0]}}\\dot{${rep[1]}}`;
  else r = `\\dot{${rep[0]}}${rep.slice(1, -1)}\\dot{${rep[rep.length - 1]}}`;
  return `${ip}.${pre}${r}`;
}
/** 순환소수 → 분수 */
function repToF(ip: number, pre: string, rep: string): F {
  const all = Number(pre + rep);
  const non = pre === '' ? 0 : Number(pre);
  const den = Number('9'.repeat(rep.length) + '0'.repeat(pre.length));
  return new F(ip * den + all - non, den);
}
/** 순환소수 풀어 쓰기: 0.1232323… */
function longForm(ip: number, pre: string, rep: string, n = 8): string {
  let s = pre;
  while (s.length < n) s += rep;
  return `${ip}.${s}\\cdots`;
}
/** 최소 표현인 순환소수 자릿수 만들기 */
function randRep(r: Rng, preLen: number, repLen: number): { pre: string; rep: string } {
  for (;;) {
    const pre = Array.from({ length: preLen }, () => String(r.int(0, 9))).join('');
    const rep = Array.from({ length: repLen }, () => String(r.int(0, 9))).join('');
    if (/^9+$/.test(rep) || /^0+$/.test(rep)) continue;
    if (repLen === 2 && rep[0] === rep[1]) continue;
    if (repLen === 3 && rep[0] === rep[1] && rep[1] === rep[2]) continue;
    if (preLen > 0 && pre[preLen - 1] === rep[repLen - 1]) continue;
    return { pre, rep };
  }
}

const IN = (sym: string) => ({ '<': '>', '>': '<', '\\le': '\\ge', '\\ge': '\\le' })[sym]!;

/** 다항식 (x², xy, y², x, y, 상수) TeX */
function p2(c: { x2?: F | number; xy?: F | number; y2?: F | number; x?: F | number; y?: F | number; k?: F | number }, X = 'x', Y = 'y'): string {
  return termsTex([
    { c: c.x2 ?? 0, v: `${X}^{2}` },
    { c: c.xy ?? 0, v: `${X}${Y}` },
    { c: c.y2 ?? 0, v: `${Y}^{2}` },
    { c: c.x ?? 0, v: X },
    { c: c.y ?? 0, v: Y },
    { c: c.k ?? 0, v: '' },
  ]);
}

type Mono = { c: F; x: number; y: number };
const mt = (m: Mono) => mono(m.c, [
  ['x', m.x],
  ['y', m.y],
]);
const mmul = (a: Mono, b: Mono): Mono => ({ c: a.c.mul(b.c), x: a.x + b.x, y: a.y + b.y });
const mdiv = (a: Mono, b: Mono): Mono => ({ c: a.c.div(b.c), x: a.x - b.x, y: a.y - b.y });
const mpow = (a: Mono, k: number): Mono => ({ c: a.c.pow(k), x: a.x * k, y: a.y * k });
/** 괄호 필요 단항식: (−2x)  */
const mp = (m: Mono) => (m.c.n < 0 || m.c.d !== 1 ? `\\left(${mt(m)}\\right)` : mt(m));

export const m2a: ContentMap = {
  // ═══════════════ m2a-1 유리수와 순환소수 ═══════════════
  'm2a-1': {
    concepts: [
      {
        title: '유한소수와 무한소수',
        body: '- **유한소수**: 소수점 아래 0이 아닌 숫자가 유한 개인 소수 ($0.25$, $1.6$)\n- **무한소수**: 소수점 아래 0이 아닌 숫자가 무한히 계속되는 소수 ($0.333\\cdots$, $\\pi = 3.1415\\cdots$)\n정수가 아닌 유리수는 유한소수 또는 순환소수로 나타낼 수 있어요.',
      },
      {
        title: '유한소수로 나타낼 수 있는 분수',
        body: '분수를 **기약분수로 나타내고** 분모를 소인수분해했을 때\n- 분모의 소인수가 **2나 5뿐**이면 유한소수\n- 2나 5 이외의 소인수가 있으면 순환소수\n예: $\\frac{3}{40} = \\frac{3}{2^{3} \\times 5}$ → 유한소수, $\\frac{7}{30} = \\frac{7}{2 \\times 3 \\times 5}$ → 순환소수\n(반드시 **먼저 약분**! $\\frac{6}{30} = \\frac{1}{5}$ 은 유한소수)',
      },
      {
        title: '순환소수와 순환마디',
        body: '소수점 아래 어떤 자리부터 일정한 숫자의 배열이 한없이 되풀이되는 무한소수를 **순환소수**, 되풀이되는 부분을 **순환마디**라 해요.\n순환마디의 **처음과 끝 숫자 위에 점**을 찍어 나타내요.\n$$0.333\\cdots = 0.\\dot{3}, \\quad 0.1252525\\cdots = 0.1\\dot{2}\\dot{5}, \\quad 0.142857142857\\cdots = 0.\\dot{1}4285\\dot{7}$$',
      },
      {
        title: '순환소수를 분수로',
        body: '$x = 0.\\dot{2}\\dot{7}$ 이면 $100x = 27.2727\\cdots$ 에서 $100x - x = 27$, $x = \\frac{27}{99} = \\frac{3}{11}$\n**공식**: 분모는 순환마디 숫자 개수만큼 9, 순환하지 않는 숫자 개수만큼 0\n$$0.1\\dot{2}\\dot{5} = \\frac{125 - 1}{990} = \\frac{124}{990} = \\frac{62}{495}$$\n분자는 (전체 숫자) − (순환하지 않는 부분)',
      },
      {
        title: '유리수와 소수의 관계',
        body: '- 유한소수, 순환소수는 **모두 유리수**예요 (분수로 나타낼 수 있으니까).\n- 정수가 아닌 유리수는 유한소수 또는 순환소수로 나타낼 수 있어요.\n- 순환하지 않는 무한소수는 유리수가 아니에요 (중3에서 무리수로 배워요).\n- $0.\\dot{9} = 1$ 이에요.',
      },
    ],
    skills: [
      {
        id: 'finite',
        title: '유한소수로 나타낼 수 있는 분수',
        gen(r, level) {
          if (level <= 2) {
            const good = () => {
              for (;;) {
                const den = 2 ** r.int(0, 3) * 5 ** r.int(0, 2);
                if (den === 1) continue;
                if (level === 1) {
                  const n = r.int(1, den * 2);
                  if (gcd(n, den) !== 1 || n % den === 0) continue;
                  return { t: `\\frac{${n}}{${den}}`, n, d: den };
                }
                const bad = r.pick([3, 7, 3, 11]);
                const n = bad * r.int(1, 9);
                if (n % (den * bad) === 0) continue;
                return { t: `\\frac{${n}}{${factTexD(den * bad)}}`, n, d: den * bad };
              }
            };
            const badF = () => {
              for (;;) {
                const den = 2 ** r.int(0, 2) * 5 ** r.int(0, 1) * r.pick([3, 7, 9, 11, 3]);
                const n = r.int(1, den);
                const g = gcd(n, den);
                const d2 = den / g;
                if (d2 === 1 || factorize(d2).every(([p]) => p === 2 || p === 5)) continue;
                return { t: level === 1 ? `\\frac{${n}}{${den}}` : `\\frac{${n}}{${factTexD(den)}}`, n, d: den };
              }
            };
            const ans = good();
            const wr = Array.from({ length: 8 }, () => badF().t);
            const red = new F(ans.n, ans.d);
            return {
              q: '다음 분수 중 **유한소수**로 나타낼 수 있는 것은?',
              answer: texChoices(r, ans.t, wr),
              steps: [...(ans.t === red.tex() ? [] : [`$${ans.t} = ${red.tex()}$`]), `기약분수의 분모 $${red.d}$ ${red.d === 1 || factTexD(red.d) === String(red.d) ? '' : `$= ${factTexD(red.d)}$ `}의 소인수가 2나 5뿐이므로 유한소수입니다.`, '나머지는 기약분수로 고쳐도 분모에 2, 5 이외의 소인수가 있어요.'],
              hint: '먼저 약분한 뒤 분모를 소인수분해하세요.',
            };
          }
          if (r.chance(0.5)) {
            const bads = r.pick([[3], [7], [3, 7], [11], [3, 11], [3, 3]]);
            const badProd = bads.reduce((a, b) => a * b, 1);
            const den = 2 ** r.int(1, 3) * 5 ** r.int(0, 1) * badProd;
            let n = r.int(1, 20);
            const keep = badProd / gcd(n, badProd);
            if (keep === 1) n += 1;
            const need = badProd / gcd(n, badProd);
            return {
              q: `분수 $\\frac{${n}}{${factTexD(den)}} \\times x$ 를 소수로 나타내면 유한소수가 될 때, $x$ 가 될 수 있는 가장 작은 자연수를 구하세요.`,
              answer: { type: 'num', value: need },
              steps: [`분모의 소인수 중 2, 5 이외의 것: $${bads.join(' \\times ')}$`, `분자 $${n}$ 이 약분해 주는 부분을 빼면 $${need}$ 이 남습니다.`, `따라서 $x$ 는 $${need}$ 의 배수, 가장 작은 자연수는 $${need}$`],
            };
          }
          const bad = r.pick([3, 7, 9, 11, 21, 33]);
          const den = bad * 2 ** r.int(1, 3) * 5 ** r.int(0, 1);
          const N = r.pick([30, 50, 60, 80, 100]);
          const cnt = Math.floor(N / bad);
          return {
            q: `분수 $\\frac{n}{${den}}$ 을 소수로 나타내면 유한소수가 됩니다. $n$ 이 $1$ 이상 $${N}$ 이하의 자연수일 때, 가능한 $n$ 의 개수를 구하세요.`,
            answer: { type: 'num', value: cnt, unit: '개' },
            steps: [`$${den} = ${factTexD(den)}$`, `유한소수가 되려면 $n$ 이 $${bad}$ 의 배수여야 합니다.`, `$${N}$ 이하의 $${bad}$ 의 배수: $${cnt}$ 개`],
          };
        },
      },
      {
        id: 'notation',
        title: '순환소수의 표현',
        gen(r, level) {
          if (level <= 2) {
            const preLen = level === 1 ? r.int(0, 1) : r.int(1, 2);
            const repLen = level === 1 ? r.int(1, 2) : r.int(2, 3);
            const ip = level === 1 ? 0 : r.int(0, 3);
            const { pre, rep } = randRep(r, preLen, repLen);
            const ans = dotTex(ip, pre, rep);
            const wr: string[] = [];
            const allDots = (s: string) => s.split('').map((c) => `\\dot{${c}}`).join('');
            wr.push(`${ip}.${pre}${allDots(rep)}`);
            if (pre) wr.push(dotTex(ip, pre.slice(0, -1), pre.slice(-1) + rep));
            wr.push(`${ip}.${pre}\\dot{${rep[0]}}${rep.slice(1)}`);
            wr.push(`${ip}.${allDots(pre + rep)}`);
            if (rep.length >= 2) wr.push(`${ip}.${pre}${rep.slice(0, -1)}\\dot{${rep.slice(-1)}}`);
            if (pre) wr.push(dotTex(ip, '', rep), dotTex(ip, rep, pre));
            wr.push(`${ip}.${pre}${rep}`, dotTex(ip, pre + '0', rep), dotTex(ip, pre, '0' + rep));
            if (rep.length >= 2) wr.push(dotTex(ip, pre + rep[0], rep.slice(1)), dotTex(ip, pre, rep + rep[0]));
            return {
              q: `순환소수 $${longForm(ip, pre, rep, Math.max(8, pre.length + 3 * rep.length))}$ 를 순환마디에 점을 찍어 바르게 나타낸 것은?`,
              answer: texChoices(r, ans, wr.filter((w) => w !== ans)),
              steps: [`순환마디: $${rep}$`, `순환마디의 처음과 끝 숫자 위에 점을 찍어 $${ans}$`],
              hint: '되풀이되는 부분이 어디서 시작하는지 찾으세요.',
            };
          }
          const preLen = r.int(0, 2);
          const repLen = r.int(2, 4);
          const { pre, rep } = randRep(r, preLen, repLen);
          const k = r.int(20, 120);
          const idx = k <= pre.length ? k - 1 : pre.length + ((k - pre.length - 1) % rep.length);
          const digit = Number((pre + rep)[idx]);
          return {
            q: `순환소수 $${dotTex(0, pre, rep)}$ 의 소수점 아래 $${k}$ 번째 자리의 숫자를 구하세요.`,
            answer: { type: 'num', value: digit },
            steps: [
              pre.length ? `순환하지 않는 숫자 $${pre.length}$ 개를 빼면 $${k} - ${pre.length} = ${k - pre.length}$ 번째 순환마디 자리` : `순환마디 $${rep}$ 의 숫자는 $${rep.length}$ 개`,
              (k - pre.length) % rep.length === 0
                ? `$${k - pre.length} = ${rep.length} \\times ${(k - pre.length) / rep.length}$ 이므로 순환마디의 마지막 숫자`
                : `$${k - pre.length} = ${rep.length} \\times ${Math.floor((k - pre.length) / rep.length)} + ${(k - pre.length) % rep.length}$ 이므로 순환마디의 $${(k - pre.length) % rep.length}$ 번째 숫자`,
              `$${digit}$`,
            ],
          };
        },
      },
      {
        id: 'to-fraction',
        title: '순환소수를 분수로 나타내기',
        gen(r, level) {
          const [preLen, repLen, ip] = level === 1 ? [0, r.int(1, 2), 0] : level === 2 ? [1, r.int(1, 2), r.int(0, 2)] : [r.int(1, 2), r.int(2, 3), r.int(0, 3)];
          const { pre, rep } = randRep(r, preLen, repLen);
          const f = repToF(ip, pre, rep);
          const den = '9'.repeat(rep.length) + '0'.repeat(pre.length);
          const all = `${ip === 0 ? '' : ip}${pre}${rep}`;
          const non = `${ip === 0 ? '' : ip}${pre}` || '0';
          const num = Number(all) - Number(non);
          const t = dotTex(ip, pre, rep);
          return {
            q: `순환소수 $${t}$ 를 기약분수로 나타내세요.`,
            answer: { type: 'num', value: f.value, display: 'frac', requireReduced: true },
            steps: [
              `$x = ${t}$ 라 하면 $${10 ** (pre.length + rep.length)}x - ${10 ** pre.length === 1 ? '' : 10 ** pre.length}x$ 로 순환하는 부분을 없앱니다.`,
              `$x = \\frac{${Number(all)} - ${Number(non)}}{${den}} = \\frac{${num}}{${den}}$`,
              ...(f.d === Number(den) ? [] : [`$= ${f.tex()}$`]),
            ],
            hint: '분모: 순환마디 숫자 개수만큼 9, 순환하지 않는 숫자 개수만큼 0',
          };
        },
      },
      {
        id: 'rep-calc',
        title: '순환소수의 활용',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(1, 8);
            const b = r.int(1, 8);
            if (r.chance(0.5)) {
              const s = new F(a + b, 9);
              return {
                q: `$0.\\dot{${a}} + 0.\\dot{${b}}$ 를 기약분수로 나타내세요.`,
                answer: { type: 'num', value: s.value, display: 'frac', requireReduced: true },
                steps: [`$0.\\dot{${a}} = \\frac{${a}}{9}$, $0.\\dot{${b}} = \\frac{${b}}{9}$`, `$\\frac{${a + b}}{9} = ${s.tex()}$`],
              };
            }
            const { rep } = randRep(r, 0, 2);
            const f = new F(Number(rep), 99);
            return {
              q: `순환소수 $0.\\dot{${rep[0]}}\\dot{${rep[1]}}$ 를 기약분수 $\\frac{b}{a}$ 로 나타낼 때, $a + b$ 의 값을 구하세요.`,
              answer: { type: 'num', value: f.n + f.d },
              steps: [`$0.\\dot{${rep[0]}}\\dot{${rep[1]}} = \\frac{${Number(rep)}}{99}${f.d === 99 ? '' : ` = ${f.tex()}`}$`, `$a + b = ${f.d} + ${f.n} = ${f.n + f.d}$`],
            };
          }
          if (level === 2) {
            const preLen = r.int(0, 1);
            const { pre, rep } = randRep(r, preLen, r.int(1, 2));
            const f = repToF(0, pre, rep);
            return {
              q: `순환소수 $${dotTex(0, pre, rep)}$ 에 자연수 $a$ 를 곱하면 자연수가 됩니다. 가장 작은 자연수 $a$ 를 구하세요.`,
              answer: { type: 'num', value: f.d },
              steps: [`$${dotTex(0, pre, rep)} = ${f.tex()}$`, `$${f.tex()} \\times a$ 가 자연수가 되려면 $a$ 는 $${f.d}$ 의 배수`, `가장 작은 $a = ${f.d}$`],
            };
          }
          if (r.chance(0.5)) {
            const k = r.int(1, 9);
            const d = r.pick([3, 6, 9]);
            const rd = d === 3 ? { c: '0.\\dot{3}', w: '0.3', f: new F(1, 3), wf: new F(3, 10) } : d === 6 ? { c: '0.\\dot{6}', w: '0.6', f: new F(2, 3), wf: new F(3, 5) } : { c: '0.1\\dot{6}', w: '0.16', f: new F(1, 6), wf: new F(4, 25) };
            const diff = rd.f.sub(rd.wf);
            const n = new F(k).div(diff);
            if (!n.isInt()) return this.gen(r, level);
            const name = r.pick(NAMES);
            return {
              q: `${name}는 어떤 자연수에 $${rd.c}$ 를 곱해야 할 것을 잘못하여 $${rd.w}$ 를 곱했더니, 바르게 계산한 값보다 $${k}$ 만큼 작아졌습니다. 어떤 자연수를 구하세요.`,
              answer: { type: 'num', value: n.value },
              steps: [`$${rd.c} = ${rd.f.tex()}$, $${rd.w} = ${rd.wf.tex()}$`, `어떤 수를 $x$ 라 하면 $${rd.f.tex()}x - ${rd.wf.tex()}x = ${k}$`, `$${diff.tex()}x = ${k}$, $x = ${n.value}$`],
            };
          }
          const { rep } = randRep(r, 0, 2);
          const ip = r.int(1, 3);
          const val = ip * 99 + Number(rep);
          return {
            q: `$${ip}.\\dot{${rep[0]}}\\dot{${rep[1]}} = a \\times 0.\\dot{0}\\dot{1}$ 일 때, 자연수 $a$ 의 값을 구하세요.`,
            answer: { type: 'num', value: val },
            steps: [`$${ip}.\\dot{${rep[0]}}\\dot{${rep[1]}} = \\frac{${ip}${rep} - ${ip}}{99} = \\frac{${val}}{99}$`, `$0.\\dot{0}\\dot{1} = \\frac{1}{99}$`, `$a = ${val}$`],
          };
        },
      },
      {
        id: 'classify',
        title: '유리수와 소수의 관계',
        gen(r, level) {
          const T = ['모든 순환소수는 유리수이다.', '모든 유한소수는 유리수이다.', '정수가 아닌 유리수는 유한소수 또는 순환소수로 나타낼 수 있다.', '순환하지 않는 무한소수는 유리수가 아니다.', '기약분수의 분모의 소인수가 2나 5뿐이면 유한소수로 나타낼 수 있다.', '$0.\\dot{9} = 1$ 이다.', '$0.\\dot{3} = \\frac{1}{3}$ 이다.'];
          const Fs = ['모든 무한소수는 유리수이다.', '순환소수 중에는 유리수가 아닌 것도 있다.', '유리수는 모두 유한소수로 나타낼 수 있다.', '분모에 3이 있는 분수는 모두 순환소수가 된다.', '$0.\\dot{9}$ 는 $1$ 보다 작다.', '$\\frac{1}{7}$ 은 유한소수로 나타낼 수 있다.', '$0.\\dot{1}\\dot{2}$ 와 $0.1\\dot{2}$ 는 같은 수이다.'];
          const L = level === 1 ? 4 : level === 2 ? 6 : 7;
          const t = T.slice(0, L);
          const fs = Fs.slice(0, L);
          const wantTrue = level === 1 ? r.chance(0.5) : r.chance(0.4);
          const ans = r.pick(wantTrue ? t : fs);
          return {
            q: `다음 중 ${wantTrue ? '**옳은**' : '**옳지 않은**'} 것은?`,
            answer: textChoices(r, ans, r.sample(wantTrue ? fs : t, 4)),
            steps: [ans, wantTrue ? '유한소수와 순환소수는 분수로 나타낼 수 있으므로 유리수예요.' : '무한소수 중 순환소수만 유리수이고, 분수는 약분한 뒤 분모의 소인수를 보고 판단해요.'],
          };
        },
      },
    ],
  },

  // ═══════════════ m2a-2 식의 계산 ═══════════════
  'm2a-2': {
    concepts: [
      {
        title: '지수법칙 (1)',
        body: '$m$, $n$ 이 자연수일 때\n$$a^{m} \\times a^{n} = a^{m+n}, \\qquad (a^{m})^{n} = a^{mn}$$\n곱하면 지수끼리 **더하고**, 거듭제곱의 거듭제곱은 지수끼리 **곱해요**.\n주의: $a^{2} + a^{2} = 2a^{2}$ (지수를 더하지 않아요), $a^{2} \\times a^{3} \\ne a^{6}$',
      },
      {
        title: '지수법칙 (2)',
        body: '$$a^{m} \\div a^{n} = \\begin{cases} a^{m-n} & (m > n) \\\\ 1 & (m = n) \\\\ \\dfrac{1}{a^{n-m}} & (m < n) \\end{cases}$$\n$$(ab)^{n} = a^{n}b^{n}, \\qquad \\left(\\frac{a}{b}\\right)^{n} = \\frac{a^{n}}{b^{n}}$$\n음수의 거듭제곱은 부호에 주의: $(-2x)^{3} = -8x^{3}$',
      },
      {
        title: '단항식의 곱셈과 나눗셈',
        body: '- **곱셈**: 계수는 계수끼리, 문자는 문자끼리 곱해요. $3x^{2} \\times (-2xy) = -6x^{3}y$\n- **나눗셈**: 분수 꼴로 바꾸거나 역수를 곱해요. $6x^{3}y \\div 2xy = \\frac{6x^{3}y}{2xy} = 3x^{2}$\n- 곱셈·나눗셈이 섞이면 **앞에서부터 차례로** (역수의 곱으로 바꾸면 편해요)',
      },
      {
        title: '다항식의 덧셈과 뺄셈',
        body: '- 괄호를 풀고 **동류항**끼리 모아 계산해요.\n- 괄호 앞이 $-$ 이면 괄호 안 모든 항의 부호를 바꿔요.\n- 괄호가 여러 겹이면 ( ) → { } → [ ] 순서로\n- **이차식**: 차수가 가장 큰 항의 차수가 2인 다항식 ($2x^{2} - x + 3$)\n중1 일차식의 계산과 같은 방법이에요.',
      },
      {
        title: '단항식과 다항식의 곱셈·나눗셈',
        body: '- (단항식) × (다항식): 분배법칙으로 **전개** $2x(3x - 4y) = 6x^{2} - 8xy$\n- (다항식) ÷ (단항식): 각 항을 나누거나 역수를 곱해요\n$$(6x^{2}y - 9xy^{2}) \\div 3xy = 2x - 3y$$',
      },
    ],
    skills: [
      {
        id: 'exp-law',
        title: '지수법칙',
        gen(r, level) {
          const v = r.pick(['a', 'x', 'b']);
          if (level === 1) {
            const p = r.int(2, 6);
            const q = r.int(2, 6);
            const t = r.int(0, 2);
            if (t === 0)
              return {
                q: `다음 $\\square$ 안에 알맞은 수를 구하세요.\n$$${v}^{${p}} \\times ${v}^{\\square} = ${v}^{${p + q}}$$`,
                answer: { type: 'num', value: q },
                steps: [`$${v}^{${p}} \\times ${v}^{\\square} = ${v}^{${p} + \\square}$`, `$${p} + \\square = ${p + q}$, $\\square = ${q}$`],
              };
            if (t === 1)
              return {
                q: `다음 $\\square$ 안에 알맞은 수를 구하세요.\n$$(${v}^{${p}})^{\\square} = ${v}^{${p * q}}$$`,
                answer: { type: 'num', value: q },
                steps: [`$(${v}^{${p}})^{\\square} = ${v}^{${p} \\times \\square}$`, `$${p} \\times \\square = ${p * q}$, $\\square = ${q}$`],
              };
            return {
              q: `다음 $\\square$ 안에 알맞은 수를 구하세요.\n$$${v}^{${p + q}} \\div ${v}^{\\square} = ${v}^{${p}}$$`,
              answer: { type: 'num', value: q },
              steps: [`$${v}^{${p + q}} \\div ${v}^{\\square} = ${v}^{${p + q} - \\square}$`, `$\\square = ${q}$`],
            };
          }
          if (level === 2) {
            if (r.chance(0.5)) {
              const [p, q, s, t] = [r.int(2, 4), r.int(2, 3), r.int(1, 6), r.int(1, 8)];
              const e = p * q + s - t;
              if (e <= 0) return this.gen(r, level);
              return {
                q: `다음 식을 간단히 하면 $${v}^{\\square}$ 입니다. $\\square$ 안에 알맞은 수를 구하세요.\n$$(${v}^{${p}})^{${q}} \\times ${v}^{${s}} \\div ${v}^{${t}}$$`,
                answer: { type: 'num', value: e },
                steps: [`$${v}^{${p * q}} \\times ${v}^{${s}} \\div ${v}^{${t}}$`, `$= ${v}^{${p * q} + ${s} - ${t}} = ${v}^{${e}}$`],
              };
            }
            const [a, b, c] = [r.int(2, 4), r.int(1, 4), r.int(2, 4)];
            const k = r.int(2, 3);
            return {
              q: `$\\left(${k}x^{${a}}y^{A}\\right)^{${c}} = Bx^{${a * c}}y^{${b * c}}$ 일 때, 자연수 $A$, $B$ 의 값을 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'A', value: b }, { label: 'B', value: k ** c }] },
              steps: [`좌변 $= ${k}^{${c}}x^{${a * c}}y^{${c}A}$`, `$${c}A = ${b * c}$ 에서 $A = ${b}$, $B = ${k}^{${c}} = ${k ** c}$`],
            };
          }
          const t = r.int(0, 2);
          if (t === 0) {
            const base = r.pick([2, 3]);
            const big = base === 2 ? r.pick([4, 8]) : 9;
            const e = big === 4 || big === 9 ? 2 : 3;
            const x = r.int(1, 5);
            const m = r.int(1, 4);
            const total = x + 1 + e * m;
            return {
              q: `$${base}^{x+1} \\times ${big}^{${m}} = ${base}^{${total}}$ 일 때, 자연수 $x$ 의 값을 구하세요.`,
              answer: { type: 'num', value: x },
              steps: [`$${big} = ${base}^{${e}}$ 이므로 $${big}^{${m}} = ${base}^{${e * m}}$`, `$${base}^{x+1+${e * m}} = ${base}^{${total}}$`, `$x + 1 + ${e * m} = ${total}$, $x = ${x}$`],
            };
          }
          if (t === 1) {
            const base = r.int(2, 5);
            const n = base;
            const x = r.int(2, 8);
            return {
              q: `$${Array(n).fill(`${base}^{x}`).join(' + ')} = ${base}^{${x + 1}}$ 일 때, 자연수 $x$ 의 값을 구하세요.`,
              answer: { type: 'num', value: x },
              steps: [`좌변 $= ${n} \\times ${base}^{x} = ${base}^{x+1}$`, `$x + 1 = ${x + 1}$, $x = ${x}$`],
              hint: '같은 수를 여러 번 더하면 곱셈이에요.',
            };
          }
          const p = r.int(5, 12);
          const q = p + r.int(1, 3);
          const extra = 5 ** (q - p);
          const digits = p + String(extra).length;
          return {
            q: `$2^{${p}} \\times 5^{${q}}$ 은 몇 자리 자연수인지 구하세요.`,
            answer: { type: 'num', value: digits, unit: '자리' },
            steps: [`$2^{${p}} \\times 5^{${q}} = (2 \\times 5)^{${p}} \\times 5^{${q - p}} = ${extra} \\times 10^{${p}}$`, `$${extra}$ 뒤에 0이 $${p}$ 개이므로 $${digits}$ 자리`],
            hint: '$2 \\times 5 = 10$ 을 만들어 보세요.',
          };
        },
      },
      {
        id: 'mono',
        title: '단항식의 곱셈과 나눗셈',
        gen(r, level) {
          const M = (c: number | F, x: number, y: number): Mono => ({ c: F.of(c), x, y });
          let expr: string, res: Mono, wr: Mono[];
          if (level === 1) {
            const A = M(r.nonzero(-6, 6), r.int(1, 3), r.int(0, 2));
            const B = M(r.nonzero(-5, 5), r.int(1, 3), r.int(0, 2));
            if (r.chance(0.5)) {
              expr = `${mt(A)} \\times ${mp(B)}`;
              res = mmul(A, B);
              wr = [{ ...res, c: res.c.neg() }, { c: res.c, x: A.x * B.x || res.x + 1, y: res.y }, { c: A.c.add(B.c), x: res.x, y: res.y }, { c: res.c, x: res.x, y: res.y + 1 }];
            } else {
              const P = mmul(A, B);
              expr = `${mt(P)} \\div ${mp(B)}`;
              res = A;
              wr = [{ ...A, c: A.c.neg() }, { c: P.c.div(B.c), x: P.x + B.x, y: P.y + B.y }, { c: P.c.mul(B.c), x: A.x, y: A.y }, { c: A.c, x: A.x + 1, y: A.y }];
            }
          } else if (level === 2) {
            const A = M(r.nonzero(-3, 3), r.int(1, 2), r.int(0, 2));
            const k = r.int(2, 3);
            const B = M(r.nonzero(-6, 6), r.int(1, 3), r.int(1, 2));
            const Ak = mpow(A, k);
            if (r.chance(0.5)) {
              expr = `\\left(${mt(A)}\\right)^{${k}} \\times ${mp(B)}`;
              res = mmul(Ak, B);
              wr = [{ ...res, c: res.c.neg() }, { c: A.c.mul(k).mul(B.c), x: res.x, y: res.y }, { c: res.c, x: A.x + k + B.x, y: res.y }, { c: res.c, x: res.x, y: A.y + B.y }];
            } else {
              const P = mmul(Ak, B);
              expr = `${mt(P)} \\div \\left(${mt(A)}\\right)^{${k}}`;
              res = B;
              wr = [{ ...B, c: B.c.neg() }, { c: P.c.div(A.c), x: B.x, y: B.y }, { c: B.c, x: P.x - A.x, y: P.y - A.y }, { c: B.c.mul(2), x: B.x, y: B.y }];
            }
          } else {
            const A = M(r.nonzero(-4, 4), r.int(1, 3), r.int(1, 2));
            const B = M(new F(r.pick([-1, 1]), r.int(1, 3)), r.int(1, 2), r.int(0, 2));
            const k = 2;
            const B2 = mpow(B, k);
            const C = M(r.nonzero(-4, 4) * (r.chance(0.5) ? 1 : 2), r.int(0, 2), r.int(0, 2));
            const top = mmul(A, B2);
            if (top.x - C.x < 0 || top.y - C.y < 0) return this.gen(r, level);
            if (B.c.n === 1 && B.c.d === 1 && B.x + B.y === 1) return this.gen(r, level); // (x)^2 처럼 괄호가 무의미한 경우
            expr = `${mt(A)} \\times \\left(${mt(B)}\\right)^{${k}} \\div ${mp(C)}`;
            res = mdiv(top, C);
            wr = [{ ...res, c: res.c.neg() }, { c: A.c.mul(B.c.mul(2)).div(C.c), x: res.x, y: res.y }, { c: res.c, x: top.x + C.x, y: top.y + C.y }, { c: top.c.mul(C.c), x: res.x, y: res.y }];
          }
          const ans = mt(res);
          return {
            q: `다음 식을 간단히 하면?\n$$${expr}$$`,
            answer: texChoices(r, ans, wr.filter((w) => w.x >= 0 && w.y >= 0).map(mt)),
            steps: ['계수는 계수끼리, 같은 문자는 지수법칙으로 계산합니다.', ...(expr.includes('\\div') ? ['나눗셈은 역수의 곱셈으로 바꿉니다.'] : []), `$${expr} = ${ans}$`],
            hint: '부호를 먼저 정하면 실수가 줄어요.',
          };
        },
      },
      {
        id: 'poly-addsub',
        title: '다항식의 덧셈과 뺄셈',
        gen(r, level) {
          if (level === 1) {
            const [a, b, c, d] = [r.nonzero(-6, 6), r.nonzero(-6, 6), r.nonzero(-6, 6), r.nonzero(-6, 6)];
            const minus = r.chance(0.6);
            const s = minus ? -1 : 1;
            const ans = p2({ x: a + s * c, y: b + s * d });
            return {
              q: `다음 식을 간단히 하면?\n$$(${p2({ x: a, y: b })}) ${minus ? '-' : '+'} (${p2({ x: c, y: d })})$$`,
              answer: texChoices(r, ans, [p2({ x: a - s * c, y: b + s * d }), p2({ x: a + s * c, y: b - s * d }), p2({ x: a + c, y: b + d }), p2({ x: -(a + s * c), y: b + s * d }), p2({ x: a + s * c, y: -(b + s * d) })].filter((w) => w !== ans)),
              steps: [`괄호를 풀면 $${p2({ x: a, y: b })} ${termsTex([{ c: s * c, v: 'x' }, { c: s * d, v: 'y' }]).replace(/^(?=[^-])/, '+')}$`, `동류항끼리 정리: $${ans}$`],
            };
          }
          if (level === 2) {
            const A = [r.nonzero(-5, 5), r.int(-6, 6), r.int(-8, 8)];
            const B = [r.nonzero(-5, 5), r.int(-6, 6), r.int(-8, 8)];
            const k = r.int(1, 3);
            const R = A.map((v, i) => v - k * B[i]);
            if (R[0] === 0) return this.gen(r, level);
            const P = (c: number[]) => p2({ x2: c[0], x: c[1], k: c[2] });
            const ans = P(R);
            return {
              q: `다음 식을 간단히 하면?\n$$(${P(A)}) - ${k === 1 ? '' : k}(${P(B)})$$`,
              answer: texChoices(r, ans, [P(A.map((v, i) => (i === 2 ? v + k * B[i] : v - k * B[i]))), P(A.map((v, i) => (i === 0 ? v + k * B[i] : v - k * B[i]))), k === 1 ? P(A.map((v, i) => v + B[i])) : P(A.map((v, i) => v - B[i])), P(R.map((v) => -v)), P([R[0], R[1] + 1, R[2]])].filter((w) => w !== ans)),
              steps: [`괄호를 풀면 $${P(A)} ${termsTex([{ c: -k * B[0], v: 'x^{2}' }, { c: -k * B[1], v: 'x' }, { c: -k * B[2], v: '' }]).replace(/^(?=[^-])/, '+')}$`, `동류항끼리 정리: $${ans}$`],
              hint: '이차항, 일차항, 상수항끼리 모으세요.',
            };
          }
          const [p, q] = r.pick([
            [2, 3],
            [3, 4],
            [2, 5],
            [3, 2],
            [4, 3],
          ]);
          const [a, b, c, d] = [r.nonzero(-4, 4), r.nonzero(-4, 4), r.nonzero(-4, 4), r.nonzero(-4, 4)];
          const X = new F(a, p).sub(new F(c, q));
          const Y = new F(b, p).sub(new F(d, q));
          if (X.n === 0 || Y.n === 0) return this.gen(r, level);
          const ans = p2({ x: X, y: Y });
          return {
            q: `다음 식을 간단히 하면?\n$$\\frac{${p2({ x: a, y: b })}}{${p}} - \\frac{${p2({ x: c, y: d })}}{${q}}$$`,
            answer: texChoices(r, ans, [p2({ x: X, y: new F(b, p).add(new F(d, q)) }), p2({ x: new F(a, p).add(new F(c, q)), y: Y }), p2({ x: new F(a - c, p * q), y: new F(b - d, p * q) }), p2({ x: X.neg(), y: Y.neg() }), p2({ x: Y, y: X })].filter((w) => w !== ans)),
            steps: [`통분: $\\frac{${q}(${p2({ x: a, y: b })}) - ${p}(${p2({ x: c, y: d })})}{${p * q}}$`, `$= \\frac{${p2({ x: q * a - p * c, y: q * b - p * d })}}{${p * q}} = ${ans}$`],
          };
        },
      },
      {
        id: 'mono-poly',
        title: '단항식과 다항식의 곱셈·나눗셈',
        gen(r, level) {
          if (level === 1) {
            const k = r.nonzero(-5, 5);
            const [a, b] = [r.nonzero(-5, 5), r.nonzero(-6, 6)];
            const withY = r.chance(0.5);
            const inner = withY ? p2({ x: a, y: b }) : p2({ x: a, k: b });
            const ans = withY ? p2({ x2: k * a, xy: k * b }) : p2({ x2: k * a, x: k * b });
            const wrong = (u: number, v: number) => (withY ? p2({ x2: u, xy: v }) : p2({ x2: u, x: v }));
            return {
              q: `다음 식을 전개하면?\n$$${termsTex([{ c: k, v: 'x' }])}(${inner})$$`,
              answer: texChoices(r, ans, [wrong(k * a, b), wrong(k * a, -k * b), wrong(-k * a, k * b), withY ? p2({ x: k * a, y: k * b }) : p2({ x: k * a, k: k * b }), wrong(k + a, k * b)].filter((w) => w !== ans)),
              steps: [`분배법칙: $${par(termsTex([{ c: k, v: 'x' }]))} \\times ${par(termsTex([{ c: a, v: 'x' }]))} + ${par(termsTex([{ c: k, v: 'x' }]))} \\times ${par(termsTex([{ c: b, v: withY ? 'y' : '' }]))}$`, `$= ${ans}$`],
            };
          }
          if (level === 2) {
            const m: Mono = { c: F.of(r.nonzero(-4, 4)), x: 1, y: 1 };
            const [a, b] = [r.nonzero(-5, 5), r.nonzero(-5, 5)];
            const top = termsTex([
              { c: m.c.mul(a), v: 'x^{2}y' },
              { c: m.c.mul(b), v: 'xy^{2}' },
            ]);
            const ans = p2({ x: a, y: b });
            return {
              q: `다음 식을 간단히 하면?\n$$(${top}) \\div ${mp(m)}$$`,
              answer: texChoices(r, ans, [p2({ x: -a, y: b }), p2({ x: a, y: -b }), p2({ x: b, y: a }), p2({ x2: a, y2: b }), p2({ x: m.c.mul(a).mul(m.c), y: m.c.mul(b).mul(m.c) })].filter((w) => w !== ans)),
              steps: [`각 항을 $${mt(m)}$ 로 나눕니다.`, `$\\frac{${mt({ c: m.c.mul(a), x: 2, y: 1 })}}{${mt(m)}} + \\frac{${mt({ c: m.c.mul(b), x: 1, y: 2 })}}{${mt(m)}} = ${ans}$`],
            };
          }
          const k = r.nonzero(-3, 3);
          const [a, b] = [r.nonzero(-4, 4), r.nonzero(-4, 4)];
          const e = r.nonzero(-3, 3);
          const [c, d] = [r.nonzero(-4, 4), r.nonzero(-4, 4)];
          // kx(ax + by) - (c e x²y + d e x y²) ÷ ey = (ka - c)x² + (kb - d)xy
          const X2 = k * a - c;
          const XY = k * b - d;
          if (X2 === 0 || XY === 0) return this.gen(r, level);
          const ans = p2({ x2: X2, xy: XY });
          const div = termsTex([
            { c: c * e, v: 'x^{2}y' },
            { c: d * e, v: 'xy^{2}' },
          ]);
          return {
            q: `다음 식을 간단히 하면?\n$$${termsTex([{ c: k, v: 'x' }])}(${p2({ x: a, y: b })}) - (${div}) \\div ${mp({ c: F.of(e), x: 0, y: 1 })}$$`,
            answer: texChoices(r, ans, [p2({ x2: k * a + c, xy: XY }), p2({ x2: X2, xy: k * b + d }), p2({ x2: X2, y2: XY }), p2({ x2: -X2, xy: -XY }), p2({ x2: k * a - c * e, xy: k * b - d * e })].filter((w) => w !== ans)),
            steps: [`$${termsTex([{ c: k, v: 'x' }])}(${p2({ x: a, y: b })}) = ${p2({ x2: k * a, xy: k * b })}$`, `$(${div}) \\div ${mp({ c: F.of(e), x: 0, y: 1 })} = ${p2({ x2: c, xy: d })}$`, `$${p2({ x2: k * a, xy: k * b })} - (${p2({ x2: c, xy: d })}) = ${ans}$`],
            hint: '나눗셈을 먼저 한 뒤 빼세요.',
          };
        },
      },
      {
        id: 'substitute',
        title: '식의 대입',
        gen(r, level) {
          if (level <= 2) {
            const [a, b, c, d] = [r.nonzero(-4, 4), r.nonzero(-4, 4), r.nonzero(-4, 4), r.nonzero(-4, 4)];
            const p = level === 1 ? 1 : r.int(2, 3);
            const q = r.int(1, 3) * r.sign();
            const X = p * a - q * c;
            const Y = p * b - q * d;
            if (X === 0 && Y === 0) return this.gen(r, level);
            const ans = p2({ x: X, y: Y });
            const exprAB = termsTex([
              { c: p, v: 'A' },
              { c: -q, v: 'B' },
            ]);
            return {
              q: `$A = ${p2({ x: a, y: b })}$, $B = ${p2({ x: c, y: d })}$ 일 때, $${exprAB}$ 를 $x$, $y$ 에 대한 식으로 나타내면?`,
              answer: texChoices(r, ans, [p2({ x: p * a + q * c, y: p * b + q * d }), p2({ x: p * a - q * c, y: p * b + q * d }), p2({ x: a - q * c, y: b - q * d }), p2({ x: -X, y: -Y }), p2({ x: X, y: -Y })].filter((w) => w !== ans)),
              steps: [`$${exprAB} = ${p === 1 ? '' : p}(${p2({ x: a, y: b })}) ${q > 0 ? '-' : '+'} ${Math.abs(q) === 1 ? '' : Math.abs(q)}(${p2({ x: c, y: d })})$`, `$= ${ans}$`],
              hint: '대입할 때 괄호로 묶어서 넣으세요.',
            };
          }
          const m = r.nonzero(-4, 4);
          const n = r.nonzero(-5, 5);
          const [a, b, c] = [r.nonzero(-5, 5), r.nonzero(-5, 5), r.nonzero(-9, 9)];
          // y = mx + n 을 ax + by + c 에 대입
          const X = a + b * m;
          const K = b * n + c;
          if (X === 0) return this.gen(r, level);
          const ans = p2({ x: X, k: K });
          return {
            q: `$y = ${linTex(m, n)}$ 일 때, $${p2({ x: a, y: b, k: c })}$ 를 $x$ 에 대한 식으로 나타내면?`,
            answer: texChoices(r, ans, [p2({ x: a + m, k: n + c }), p2({ x: a - b * m, k: c - b * n }), p2({ x: X, k: c - b * n }), p2({ x: a + b * m, k: b + n + c }), p2({ x: -X, k: K })].filter((w) => w !== ans)),
            steps: [`$${p2({ x: a, k: c })} ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}(${linTex(m, n)})$`.replace(/\+ -/, '-'), `$= ${ans}$`],
          };
        },
      },
    ],
  },

  // ═══════════════ m2a-3 일차부등식 ═══════════════
  'm2a-3': {
    concepts: [
      {
        title: '부등식과 그 해',
        body: '부등호 $<, >, \\le, \\ge$ 를 사용하여 수 또는 식의 대소 관계를 나타낸 식을 **부등식**이라 해요.\n- $x \\ge 3$: $x$ 는 3 이상, $x > 3$: $x$ 는 3 초과\n- $x \\le 3$: $x$ 는 3 이하, $x < 3$: $x$ 는 3 미만\n부등식을 참이 되게 하는 $x$ 의 값을 **해**라 해요.',
      },
      {
        title: '부등식의 성질',
        body: '$a < b$ 일 때\n- $a + c < b + c$, $a - c < b - c$ (부등호 방향 그대로)\n- $c > 0$ 이면 $ac < bc$, $\\frac{a}{c} < \\frac{b}{c}$\n- $c < 0$ 이면 $ac > bc$, $\\frac{a}{c} > \\frac{b}{c}$ (**음수를 곱하거나 나누면 방향이 바뀜!**)',
      },
      {
        title: '일차부등식의 풀이',
        body: '이항하여 정리했을 때 $ax > b$, $ax \\le b$ 처럼 (일차식) 꼴이 되는 부등식을 **일차부등식**이라 해요.\n1. $x$ 항은 좌변, 상수항은 우변으로 이항\n2. $ax > b$ 꼴로 정리\n3. 양변을 $a$ 로 나누기 ($a < 0$ 이면 방향 바꾸기)\n**수직선**: 포함하면 ●, 포함하지 않으면 ○',
        example: { q: '$-2x + 3 \\le 7$', a: '$-2x \\le 4$, $x \\ge -2$' },
      },
      {
        title: '여러 가지 일차부등식',
        body: '- 괄호: 분배법칙으로 풀기\n- 계수가 소수: 양변에 10, 100, … 곱하기\n- 계수가 분수: 양변에 분모의 최소공배수 곱하기 (양수를 곱하므로 방향 그대로)\n일차방정식의 풀이와 같지만 **음수로 나눌 때 방향**만 조심하면 돼요.',
      },
      {
        title: '일차부등식의 활용',
        body: '1. 구하려는 것을 $x$ 로 놓기\n2. "이상, 이하, 초과, 미만, 넘지 않는, 적어도" 등을 부등호로\n3. 풀고, 문제의 뜻에 맞는 답 고르기 (개수는 자연수 → 가장 큰/작은 자연수)\n예: 묶음 할인, 입장료 단체 할인, 거리·속력(시간 이내), 농도(이상) 문제',
      },
    ],
    skills: [
      {
        id: 'property',
        title: '부등식의 성질',
        gen(r, level) {
          if (level <= 2) {
            const rel = r.pick(['<', '>']);
            const c = r.int(1, 9);
            const k = r.int(2, 7);
            const T: string[] = [];
            const Fs: string[] = [];
            const pair = (L: string, R: string, s: string) => {
              T.push(`${L} ${s} ${R}`);
              Fs.push(`${L} ${IN(s)} ${R}`);
            };
            pair(`a + ${c}`, `b + ${c}`, rel);
            pair(`a - ${c}`, `b - ${c}`, rel);
            pair(`${k}a`, `${k}b`, rel);
            pair(`-${k}a`, `-${k}b`, IN(rel));
            pair(`\\frac{a}{${k}}`, `\\frac{b}{${k}}`, rel);
            pair(`-\\frac{a}{${k}}`, `-\\frac{b}{${k}}`, IN(rel));
            if (level === 2) {
              pair(`${c} - ${k}a`, `${c} - ${k}b`, IN(rel));
              pair(`${k}a - ${c}`, `${k}b - ${c}`, rel);
              pair(`-\\frac{a}{${k}} + ${c}`, `-\\frac{b}{${k}} + ${c}`, IN(rel));
            }
            const wantFalse = r.chance(0.6);
            const ans = r.pick(wantFalse ? Fs : T);
            return {
              q: `$a ${rel} b$ 일 때, 다음 중 ${wantFalse ? '**옳지 않은**' : '**옳은**'} 것은?`,
              answer: texChoices(r, ans, r.sample(wantFalse ? T : Fs, 4)),
              steps: ['양변에 같은 수를 더하거나 빼도, 양수를 곱하거나 나누어도 부등호 방향은 그대로입니다.', '음수를 곱하거나 나누면 부등호 방향이 바뀝니다.', `따라서 ${wantFalse ? '옳지 않은' : '옳은'} 것은 $${ans}$`],
            };
          }
          const p = r.int(-5, 2);
          const q = p + r.int(2, 6);
          const k = r.nonzero(-4, 4);
          const c = r.int(-6, 6);
          const incL = r.chance(0.5);
          const incR = !incL || r.chance(0.3);
          const ls = incL ? '\\le' : '<';
          const rs = incR ? '\\le' : '<';
          const lo = k > 0 ? k * p + c : k * q + c;
          const hi = k > 0 ? k * q + c : k * p + c;
          const loS = k > 0 ? ls : rs;
          const hiS = k > 0 ? rs : ls;
          const A = linTex(k, c);
          const mk = (a: number, s1: string, s2: string, b: number) => `${a} ${s1} A ${s2} ${b}`;
          const ans = mk(lo, loS, hiS, hi);
          return {
            q: `$${p} ${ls} x ${rs} ${q}$ 일 때, $A = ${A}$ 의 값의 범위는?`,
            answer: texChoices(r, ans, [mk(lo, hiS, loS, hi), mk(lo, ls, rs, hi), mk(lo, loS, hiS, hi + Math.abs(k)), mk(lo - Math.abs(k), loS, hiS, hi), mk(-hi, loS, hiS, -lo), k > 0 ? mk(k * p, loS, hiS, k * q) : mk(k * q, loS, hiS, k * p), mk(lo, '\\le', '\\le', hi)].filter((w) => w !== ans)),
            steps: [`각 변에 $${k}$ 를 곱하면 ${k < 0 ? '(음수이므로 부등호 방향이 바뀜) ' : ''}$${Math.min(k * p, k * q)} ${k > 0 ? ls : rs} ${termsTex([{ c: k, v: 'x' }])} ${k > 0 ? rs : ls} ${Math.max(k * p, k * q)}$`, c === 0 ? `따라서 $${ans}$` : `각 변에 $${c}$ 를 더하면 $${ans}$`],
            hint: '음수를 곱할 때 부등호 방향과 등호 위치가 함께 바뀌어요.',
          };
        },
      },
      {
        id: 'solve',
        title: '일차부등식의 풀이',
        gen(r, level) {
          const syms = ['<', '>', '\\le', '\\ge'];
          const sym = r.pick(syms);
          const k = r.int(-6, 6);
          let q: string, steps: string[], fin: string;
          if (level === 1) {
            const a = r.nonzero(-6, 6);
            const b = r.nonzero(-9, 9);
            const c = a * k + b;
            q = `${linTex(a, b)} ${sym} ${c}`;
            fin = a > 0 ? sym : IN(sym);
            steps = [`$${b}$ 를 이항: $${termsTex([{ c: a, v: 'x' }])} ${sym} ${c - b}$`, `양변을 $${a}$ 로 나누면${a < 0 ? ' (음수 → 방향 바뀜)' : ''} $x ${fin} ${k}$`];
          } else if (level === 2) {
            const p = r.nonzero(-4, 4);
            const s = r.nonzero(-5, 5);
            let c = r.nonzero(-5, 5);
            if (c === p) c = p + 1 || 2;
            const d = p * (k + s) - c * k;
            q = `${p === 1 ? linTex(1, s) : `${p === -1 ? '-' : p}(${linTex(1, s)})`} ${sym} ${linTex(c, d)}`;
            const coef = p - c;
            fin = coef > 0 ? sym : IN(sym);
            steps = [`괄호를 풀면 $${linTex(p, p * s)} ${sym} ${linTex(c, d)}$`, `이항: $${termsTex([{ c: coef, v: 'x' }])} ${sym} ${d - p * s}$`, `$x ${fin} ${k}$`];
          } else {
            for (;;) {
              const [pp, qq] = r.pick([
                [2, 3],
                [3, 4],
                [4, 6],
                [2, 5],
                [3, 2],
                [6, 4],
              ]);
              const a = r.nonzero(-4, 4);
              const b = r.nonzero(-4, 4);
              const num = qq * (k + a) - pp * (k - b);
              if (num % (pp * qq) !== 0) continue;
              const c = num / (pp * qq);
              q = `\\frac{${linTex(1, a)}}{${pp}} - \\frac{${linTex(1, -b)}}{${qq}} ${sym} ${c}`;
              const L = (pp * qq) / gcd(pp, qq);
              const coef = L / pp - L / qq;
              fin = coef > 0 ? sym : IN(sym);
              steps = [`양변에 $${L}$ 를 곱하면 $${L / pp}(${linTex(1, a)}) - ${L / qq}(${linTex(1, -b)}) ${sym} ${c * L}$`, `$${termsTex([{ c: coef, v: 'x' }])} ${sym} ${c * L - (L / pp) * a - (L / qq) * b}$`, `$x ${fin} ${k}$`];
              break;
            }
          }
          if (steps.length >= 2 && steps[steps.length - 1] === `$x ${fin} ${k}$` && steps[steps.length - 2].endsWith(`$x ${fin} ${k}$`) && steps[steps.length - 2].includes('나누면') === false) steps.pop();
          if (level === 1 && steps[1].startsWith('양변을 $1$')) steps.pop();
          const ans = `x ${fin} ${k}`;
          const strictSwap = ({ '<': '\\le', '>': '\\ge', '\\le': '<', '\\ge': '>' } as Record<string, string>)[fin];
          return {
            q: `다음 일차부등식을 풀면?\n$$${q}$$`,
            answer: texChoices(r, ans, [`x ${IN(fin)} ${k}`, `x ${strictSwap} ${k}`, `x ${fin} ${-k}`, `x ${IN(fin)} ${-k}`, `x ${fin} ${k + 1}`].filter((w) => w !== ans)),
            steps,
            hint: 'x 의 계수가 음수이면 나눌 때 부등호 방향이 바뀌어요.',
          };
        },
      },
      {
        id: 'number-line',
        title: '부등식의 해와 수직선',
        gen(r, level) {
          const k = r.int(-4, 4);
          const right = r.chance(0.5);
          const closed = r.chance(0.5);
          const sym = right ? (closed ? '\\ge' : '>') : closed ? '\\le' : '<';
          const fig = ineqLine(k, right, closed);
          if (level === 1) {
            const mk = (s: string, kk: number) => {
              const a = r.nonzero(-4, 4);
              const b = r.nonzero(-6, 6);
              return `${linTex(a, b)} ${a > 0 ? s : IN(s)} ${a * kk + b}`;
            };
            const ans = mk(sym, k);
            const strict = ({ '<': '\\le', '>': '\\ge', '\\le': '<', '\\ge': '>' } as Record<string, string>)[sym];
            return {
              q: '다음 중 해를 수직선 위에 나타냈을 때 그림과 같은 부등식은?',
              fig,
              answer: texChoices(r, ans, [mk(IN(sym), k), mk(strict, k), mk(sym, -k === k ? k + 2 : -k), mk(sym, k + 1)]),
              steps: [`그림의 해: $x ${sym} ${k}$`, `$${ans}$ 를 풀면 $x ${sym} ${k}$`],
            };
          }
          if (level === 2) {
            if (k === 0) return this.gen(r, level); // ax > 0 꼴이면 a 가 하나로 정해지지 않음
            const a = r.nonzero(-5, 5);
            const b = r.int(1, 9);
            // a x - b (sym') c  → x sym k
            const s0 = a > 0 ? sym : IN(sym);
            const c = a * k - b;
            return {
              q: `$x$ 에 대한 일차부등식 $ax - ${b} ${s0} ${c}$ 의 해를 수직선 위에 나타내면 그림과 같을 때, 상수 $a$ 의 값을 구하세요.`,
              fig,
              answer: { type: 'num', value: a },
              steps: [`$ax ${s0} ${c + b}$`, `해가 $x ${sym} ${k}$ 이므로 ${a > 0 ? '부등호 방향이 그대로 → $a > 0$' : '부등호 방향이 바뀜 → $a < 0$'}`, `$\\frac{${c + b}}{a} = ${k}$, $a = ${a}$`],
            };
          }
          if (k === 0) return this.gen(r, level);
          const d = r.nonzero(-3, 3);
          const p = r.int(1, 5);
          const qq = p - d;
          const c = r.nonzero(-6, 6);
          // px - a (s0) qq x + c  →  d x (s0) a + c  → x sym k
          const s0 = d > 0 ? sym : IN(sym);
          const a = d * k - c;
          return {
            q: `$x$ 에 대한 일차부등식 $${p === 1 ? '' : p}x - a ${s0} ${linTex(qq, c)}$ 의 해를 수직선 위에 나타내면 그림과 같을 때, 상수 $a$ 의 값을 구하세요.`,
            fig,
            answer: { type: 'num', value: a },
            steps: d === 1 ? [`이항하면 $x ${sym} a ${cst(c)}$`, `$a ${cst(c)} = ${k}$ 에서 $a = ${a}$`] : d === -1 ? [`이항하면 $-x ${s0} a ${cst(c)}$`, `양변에 $-1$ 을 곱하면 (방향이 바뀜) $x ${sym} -(a ${cst(c)})$`, `$-(a ${cst(c)}) = ${k}$ 에서 $a = ${a}$`] : [`이항하면 $${termsTex([{ c: d, v: 'x' }])} ${s0} a ${cst(c)}$`, d > 0 ? `$x ${sym} \\frac{a ${cst(c)}}{${d}}$` : `$x ${sym} \\frac{a ${cst(c)}}{${d}}$ (음수로 나누어 방향이 바뀜)`, `$\\frac{a ${cst(c)}}{${d}} = ${k}$ 에서 $a = ${a}$`],
          };
        },
      },
      {
        id: 'integer-sol',
        title: '부등식을 만족하는 정수',
        gen(r, level) {
          if (level === 1) {
            const n = r.int(2, 9);
            const a = r.int(2, 6);
            const b = r.int(-9, 9);
            const c = a * n + b;
            return {
              q: `일차부등식 $${linTex(a, b)} \\le ${c}$ 를 만족하는 자연수 $x$ 의 개수를 구하세요.`,
              answer: { type: 'num', value: n, unit: '개' },
              steps: [`$${a}x \\le ${c - b}$, $x \\le ${n}$`, `자연수 $x$: $${n <= 3 ? Array.from({ length: n }, (_, i) => i + 1).join(', ') : `1, 2, \\ldots, ${n}`}$ → $${n}$ 개`],
            };
          }
          if (level === 2) {
            for (;;) {
              const a = r.nonzero(-5, 5);
              const b = r.nonzero(-9, 9);
              const c = r.int(-15, 15);
              const bound = new F(c - b, a);
              if (bound.isInt() || Math.abs(a) === 1) continue;
              const sym = r.pick(['<', '>']);
              const fin = a > 0 ? sym : IN(sym);
              const askMax = fin === '<';
              const ans = askMax ? Math.floor(bound.value) : Math.ceil(bound.value);
              return {
                q: `일차부등식 $${linTex(a, b)} ${sym} ${c}$ 를 만족하는 정수 $x$ 중 가장 ${askMax ? '큰' : '작은'} 수를 구하세요.`,
                answer: { type: 'num', value: ans },
                steps: [`$${termsTex([{ c: a, v: 'x' }])} ${sym} ${c - b}$`, `$x ${fin} ${bound.tex()}$`, `가장 ${askMax ? '큰' : '작은'} 정수: $${ans}$`],
              };
            }
          }
          const d = r.int(2, 5);
          const n = r.int(2, 5);
          const lo = d * n;
          const hi = d * (n + 1);
          const ans = `${lo} \\le a < ${hi}`;
          const p = d + r.int(1, 3);
          return {
            q: `$x$ 에 대한 일차부등식 $${p}x - a \\le ${p - d === 1 ? '' : p - d}x$ 를 만족하는 자연수 $x$ 가 $${n}$ 개일 때, 상수 $a$ 의 값의 범위는?`,
            answer: texChoices(r, ans, [`${lo} < a \\le ${hi}`, `${lo} \\le a \\le ${hi}`, `${lo} < a < ${hi}`, `${lo - d} \\le a < ${lo}`, `${n} \\le a < ${n + 1}`]),
            steps: [`$${d}x \\le a$, $x \\le \\frac{a}{${d}}$`, `자연수 해가 $${n <= 5 ? Array.from({ length: n }, (_, i) => i + 1).join(', ') : `1, 2, \\ldots, ${n}`}$ 이 되려면 $${n} \\le \\frac{a}{${d}} < ${n + 1}$`, `$${ans}$`],
            hint: '수직선 위에 $\\frac{a}{' + d + '}$ 의 위치를 그려 보세요.',
          };
        },
      },
      {
        id: 'word',
        title: '일차부등식의 활용',
        gen(r, level): ProblemDraft {
          const name = r.pick(NAMES);
          if (level === 1) {
            const a = r.int(5, 15) * 100;
            const b = r.int(2, 10) * 100;
            const c = r.int(5, 20) * 1000;
            const n = Math.floor((c - b) / a);
            return {
              q: `${name}는 한 자루에 $${a}$ 원인 볼펜 몇 자루를 사서 $${b}$ 원짜리 상자에 담아 선물하려고 합니다. 전체 금액이 $${c}$ 원 이하가 되게 하려면 볼펜을 최대 몇 자루까지 살 수 있는지 구하세요.`,
              answer: { type: 'num', value: n, unit: '자루' },
              steps: [`볼펜을 $x$ 자루 산다고 하면 $${a}x + ${b} \\le ${c}$`, `$x \\le ${new F(c - b, a).tex()}$`, `최대 $${n}$ 자루`],
            };
          }
          if (level === 2) {
            for (;;) {
              const a = r.int(10, 30) * 100;
              const b = a - r.int(2, 8) * 100;
              const t = r.int(20, 60) * 100;
              const bound = t / (a - b);
              const n = Math.floor(bound) + 1;
              if (n < 2) continue;
              return {
                q: `동네 가게에서 한 개에 $${a}$ 원인 음료수가 할인 매장에서는 $${b}$ 원입니다. 할인 매장에 다녀오려면 왕복 교통비가 $${t}$ 원 들 때, 음료수를 몇 개 이상 사야 할인 매장에서 사는 것이 유리한지 구하세요.`,
                answer: { type: 'num', value: n, unit: '개' },
                steps: [`$x$ 개를 산다고 하면 $${b}x + ${t} < ${a}x$`, `$${a - b}x > ${t}$, $x > ${new F(t, a - b).tex()}$`, `$${n}$ 개 이상`],
                hint: '"유리하다" 는 비용이 더 적다는 뜻이에요.',
              };
            }
          }
          for (;;) {
            const a = r.int(2, 6);
            const b = r.int(2, 6);
            if (a === b) continue;
            const t = r.int(1, 4);
            const bound = new F(t * a * b, a + b);
            const n = bound.value;
            if (!bound.isInt()) continue;
            return {
              q: `${name}는 산책로를 따라 갈 때는 시속 $${a}$ km, 같은 길로 돌아올 때는 시속 $${b}$ km 로 걸으려고 합니다. 전체 걸리는 시간을 $${t}$ 시간 이내로 하려면 최대 몇 km 지점까지 갔다 올 수 있는지 구하세요.`,
              answer: { type: 'num', value: n, unit: 'km' },
              steps: [`$x$ km 지점까지 간다고 하면 $\\frac{x}{${a}} + \\frac{x}{${b}} \\le ${t}$`, `양변에 $${a * b}$ 를 곱하면 $${b}x + ${a}x \\le ${t * a * b}$`, `$x \\le ${n}$, 최대 $${n}$ km`],
            };
          }
        },
      },
    ],
  },
};

function factTexD(n: number): string {
  return factorize(n)
    .map(([p, e]) => (e === 1 ? `${p}` : `${p}^{${e}}`))
    .join(' \\times ');
}


const par = (t: string) => (t.startsWith('-') ? `(${t})` : t);

/** 교과서식 부등식 해 수직선: 점에서 위로 올라가 화살표 방향으로 굵은 선 */
function ineqLine(k: number, right: boolean, closed: boolean): string {
  const w = 320;
  const s = new Svg(w, 70);
  const X = (x: number) => 20 + ((x + 6) / 12) * (w - 40);
  const y0 = 44;
  s.line(6, y0, w - 6, y0, { arrow: true });
  for (let x = -6; x <= 6; x++) {
    s.line(X(x), y0 - 5, X(x), y0 + 5);
    s.text(X(x), y0 + 17, String(x), { size: 11 });
  }
  const top = 18;
  s.line(X(k), y0, X(k), top, { cls: 'acc thick' });
  s.line(X(k), top, right ? w - 12 : 12, top, { cls: 'acc thick', arrow: true });
  if (closed) s.dot(X(k), y0, { cls: 'acc', r: 4.5 });
  else s.circle(X(k), y0, 4.5, { cls: 'acc bgfill' });
  return s.toString();
}
