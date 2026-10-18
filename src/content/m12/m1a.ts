// 중1-1: 정수와 유리수 / 문자의 사용과 식의 계산 / 일차방정식 / 좌표평면과 그래프
import type { ContentMap, ProblemDraft } from '../../core/types';
import type { Rng } from '../../core/rng';
import { F } from '../../core/frac';
import { divisors, gcd, lcm } from '../../core/nt';
import { dec, linTex, termsTex } from '../../core/tex';
import { Plane } from '../../core/fig';
import { NAMES, cst, fig, fp, jo, sp, texChoices, textChoices } from './util';

// ───────── 도우미 ─────────
type Item = { v: F; t: string };

function randRational(r: Rng, level: number): Item {
  if (level === 1) {
    const v = r.int(-9, 9);
    return { v: new F(v), t: String(v) };
  }
  const k = r.int(0, 2);
  if (k === 0) {
    const v = r.int(-5, 5);
    return { v: new F(v), t: String(v) };
  }
  if (k === 1) {
    const d = r.int(2, level === 2 ? 5 : 7);
    let n = r.nonzero(-3 * d, 3 * d);
    if (n % d === 0) n += 1;
    const f = new F(n, d);
    return { v: f, t: f.tex() };
  }
  let n = r.nonzero(-35, 35);
  if (n % 10 === 0) n += 1;
  return { v: new F(n, 10), t: dec(n / 10) };
}

/** 수식 안에서 a 다음에 '- b' 로 이어 쓸 때 괄호 처리 */
const parenNeg = (t: Item) => (t.v.n < 0 ? (t.v.d === 1 ? `(${t.t})` : `\\left(${t.t}\\right)`) : t.t);

const QUAD = ['제1사분면', '제2사분면', '제3사분면', '제4사분면', '어느 사분면에도 속하지 않는다'];
function quadOf(sx: number, sy: number): string {
  if (sx === 0 || sy === 0) return QUAD[4];
  if (sx > 0) return sy > 0 ? QUAD[0] : QUAD[3];
  return sy > 0 ? QUAD[1] : QUAD[2];
}
const quadChoice = (r: Rng, ans: string) =>
  textChoices(
    r,
    ans,
    QUAD.filter((q) => q !== ans),
  );

const plane = () => new Plane(-6, 6, -6, 6, { w: 240, h: 240 });

/** 정수 해를 갖도록 만든 ax+b 꼴 문자열 */
const lin = (a: number, b: number) => linTex(a, b);

export const m1a: ContentMap = {
  // ═══════════════ m1a-2 정수와 유리수 ═══════════════
  'm1a-2': {
    concepts: [
      {
        title: '양수와 음수',
        body: '0을 기준으로 서로 반대되는 성질을 가진 양을 **양의 부호 $+$** 와 **음의 부호 $-$** 로 나타내요.\n- 영상 $5$°C → $+5$°C, 영하 $3$°C → $-3$°C\n- 이익 ↔ 손해, 해발 ↔ 해저, 증가 ↔ 감소\n0보다 큰 수를 양수, 0보다 작은 수를 음수라 하고, **0은 양수도 음수도 아니에요**.',
      },
      {
        title: '정수와 유리수',
        body: '- **정수**: 양의 정수(자연수) $1, 2, 3, \\ldots$, $0$, 음의 정수 $-1, -2, \\ldots$\n- **유리수**: $\\dfrac{a}{b}$ ($a, b$ 는 정수, $b \\ne 0$) 꼴로 나타낼 수 있는 수. 정수도 유리수예요 ($3 = \\frac{3}{1}$).\n초등학교에서 배운 분수·소수에 음의 부호가 붙은 수까지 모두 유리수예요.',
        example: { q: '$-0.5$ 는 정수인가요, 유리수인가요?', a: '$-0.5 = -\\frac{1}{2}$ 이므로 정수가 아닌 유리수예요.' },
      },
      {
        title: '수직선과 절댓값',
        body: '수직선에서 원점(0)과 어떤 수를 나타내는 점 사이의 거리를 그 수의 **절댓값**이라 하고 $|a|$ 로 나타내요.\n$$|-4| = 4,\\quad |+4| = 4,\\quad |0| = 0$$\n**수의 대소**: 수직선에서 오른쪽에 있을수록 커요.\n- 양수는 0보다 크고, 음수는 0보다 작아요.\n- 음수끼리는 **절댓값이 큰 수가 더 작아요**: $-5 < -2$',
      },
      {
        title: '덧셈과 뺄셈',
        body: '- 부호가 같은 두 수의 합: 절댓값의 합에 **공통인 부호**\n- 부호가 다른 두 수의 합: 절댓값의 차에 **절댓값이 큰 수의 부호**\n- 뺄셈은 **빼는 수의 부호를 바꾸어 더해요**: $a - (-b) = a + (+b)$\n덧셈은 교환법칙·결합법칙이 성립해서 양수끼리, 음수끼리 모아 계산하면 편해요.',
        example: { q: '$(-7) - (-10)$', a: '$(-7) + (+10) = +3$' },
      },
      {
        title: '곱셈과 나눗셈, 혼합 계산',
        body: '- 두 수의 곱·몫: 부호가 같으면 $+$, 다르면 $-$\n- 여러 수의 곱: **음수가 짝수 개면 $+$, 홀수 개면 $-$**\n- 나눗셈은 **역수를 곱해요**: $a \\div \\frac{b}{c} = a \\times \\frac{c}{b}$\n- $(-2)^{2} = 4$ 이지만 $-2^{2} = -4$ 예요.\n**계산 순서**: 거듭제곱 → 괄호 ( ) → { } → 곱셈·나눗셈 → 덧셈·뺄셈',
      },
    ],
    skills: [
      {
        id: 'order',
        title: '수의 대소와 절댓값',
        gen(r, level): ProblemDraft {
          const kinds = level === 1 ? ['max', 'min', 'absMax'] : ['max', 'min', 'absMax', 'absMin'];
          const kind = r.pick(kinds);
          for (;;) {
            const items: Item[] = [];
            while (items.length < 5) {
              const it = randRational(r, level);
              if (!items.some((x) => x.v.eq(it.v))) items.push(it);
            }
            if (level === 3 && items.filter((x) => x.v.n < 0).length < 3) continue;
            const plain = kind === 'max' || kind === 'min';
            const key = (x: Item) => (plain ? x.v.value : Math.abs(x.v.value));
            const sorted = [...items].sort((a, b) => key(a) - key(b));
            const top = kind === 'max' || kind === 'absMax';
            const best = top ? sorted[4] : sorted[0];
            const second = top ? sorted[3] : sorted[1];
            if (Math.abs(key(best) - key(second)) < 1e-9) continue;
            const label = { max: '가장 큰 수', min: '가장 작은 수', absMax: '절댓값이 가장 큰 수', absMin: '절댓값이 가장 작은 수' }[kind]!;
            const absT = (x: Item) => (x.v.n < 0 ? (x.t.startsWith('-') ? x.t.slice(1) : x.v.neg().tex()) : x.t);
            const steps = plain
              ? [`작은 수부터 나열하면 $${sorted.map((x) => x.t).join(' < ')}$`, `따라서 ${label}는 $${best.t}$`]
              : [`절댓값: ${items.map((x) => `$|${x.t}| = ${absT(x)}$`).join(', ')}`, `따라서 ${label}는 $${best.t}$`];
            return {
              q: `다음 중 **${label}**는?`,
              answer: texChoices(
                r,
                best.t,
                items.filter((x) => x !== best).map((x) => x.t),
              ),
              steps,
              hint: plain ? '음수끼리는 절댓값이 클수록 작아요.' : '절댓값은 원점에서의 거리예요.',
            };
          }
        },
      },
      {
        id: 'count-int',
        title: '수직선과 정수의 개수',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(1, 8);
            const b = r.int(1, 8);
            const cnt = a + b - 1;
            return {
              q: `두 수 $-${a}$ 와 $${b}$ 사이에 있는 정수는 모두 몇 개인지 구하세요.`,
              answer: { type: 'num', value: cnt, unit: '개' },
              steps: [`$-${a}$ 보다 크고 $${b}$ 보다 작은 정수: $${Array.from({ length: cnt }, (_, i) => -a + 1 + i).join(', ')}$`, `모두 $${cnt}$ 개`],
              hint: '양 끝의 두 수는 포함하지 않아요.',
            };
          }
          if (level === 2) {
            const q1 = r.int(2, 5);
            let p1 = r.int(q1 + 1, 4 * q1);
            if (p1 % q1 === 0) p1++;
            const q2 = r.int(2, 5);
            let p2 = r.int(q2 + 1, 4 * q2);
            if (p2 % q2 === 0) p2++;
            const lo = new F(-p1, q1);
            const hi = new F(p2, q2);
            const a = Math.ceil(lo.value);
            const b = Math.floor(hi.value);
            const cnt = b - a + 1;
            return {
              q: `두 유리수 $${lo.tex()}$ 와 $${hi.tex()}$ 사이에 있는 정수는 모두 몇 개인지 구하세요.`,
              answer: { type: 'num', value: cnt, unit: '개' },
              steps: [`$${lo.tex()} = ${lo.mixedTex()}$, $${hi.tex()} = ${hi.mixedTex()}$`, `두 수 사이의 정수는 $${a}$ 부터 $${b}$ 까지이므로 $${b} - ${fp(a)} + 1 = ${cnt}$ 개`],
            };
          }
          if (r.chance(0.5)) {
            const q = r.int(2, 7);
            let p = r.int(q + 1, 5 * q);
            if (p % q === 0) p++;
            const k = Math.floor(p / q);
            const f = new F(p, q);
            const cnt = 2 * k + 1;
            return {
              q: `절댓값이 $${f.tex()}$ 보다 작은 정수는 모두 몇 개인지 구하세요.`,
              answer: { type: 'num', value: cnt, unit: '개' },
              steps: [`$${f.tex()} = ${f.mixedTex()}$ 이므로 절댓값이 $${k}$ 이하인 정수를 찾습니다.`, `$-${k}, \\ldots, 0, \\ldots, ${k}$ → $2\\times ${k} + 1 = ${cnt}$ 개`],
              hint: '0도 정수예요.',
            };
          }
          const a = r.int(1, 9);
          const d = r.int(2, 9);
          const big = -a + d;
          return {
            q: `수직선 위에서 $-${a}$ 를 나타내는 점으로부터 거리가 $${d}$ 인 점이 나타내는 두 수 중 **큰 수**를 구하세요.`,
            answer: { type: 'num', value: big },
            steps: [`두 수는 $-${a} - ${d} = ${-a - d}$, $-${a} + ${d} = ${big}$`, `큰 수는 $${big}$`],
          };
        },
      },
      {
        id: 'add-sub',
        title: '유리수의 덧셈과 뺄셈',
        gen(r, level) {
          if (level === 1) {
            const a = r.nonzero(-15, 15);
            const b = r.nonzero(-15, 15);
            const op = r.pick(['+', '-']);
            const v = op === '+' ? a + b : a - b;
            return {
              q: `다음을 계산하세요.\n$$${sp(a)} ${op} ${sp(b)}$$`,
              answer: { type: 'num', value: v },
              steps: op === '+' ? [`$${sp(a)} + ${sp(b)} = ${v}$`] : [`빼는 수의 부호를 바꾸어 더합니다: $${sp(a)} + ${sp(-b)}$`, `$= ${v}$`],
            };
          }
          if (level === 2) {
            const mk = () => {
              const d = r.pick([2, 3, 4, 5, 6, 8, 10]);
              let n = r.nonzero(-2 * d, 2 * d);
              if (n % d === 0) n += n > 0 ? 1 : -1;
              return new F(n, d);
            };
            const a = mk();
            const b = mk();
            const op = r.pick(['+', '-']);
            const v = op === '+' ? a.add(b) : a.sub(b);
            const L = lcm(a.d, b.d);
            const bb = op === '+' ? b : b.neg();
            const ex = (f: F) => {
              const n = f.n * (L / f.d);
              return n < 0 ? `\\left(-\\frac{${-n}}{${L}}\\right)` : `\\left(+\\frac{${n}}{${L}}\\right)`;
            };
            return {
              q: `다음을 계산하세요.\n$$${sp(a)} ${op} ${sp(b)}$$`,
              answer: { type: 'num', value: v.value, display: 'frac', requireReduced: true },
              steps: [
                ...(op === '-' ? [`$= ${sp(a)} + ${sp(bb)}$`] : []),
                L === 1 ? `$= ${v.tex()}$` : `분모를 $${L}$ 로 통분: $${ex(a)} + ${ex(bb)}$`,
                `$= ${v.tex()}$`,
              ],
              hint: '분모를 통분한 뒤 부호 규칙을 적용하세요.',
            };
          }
          const terms: Item[] = [];
          for (let i = 0; i < 4; i++) {
            const k = i === 0 ? 1 : r.int(0, 2);
            if (k === 0) {
              const v = r.nonzero(-6, 6);
              terms.push({ v: new F(v), t: String(v) });
            } else if (k === 1) {
              const d = r.pick([2, 3, 4, 6]);
              let n = r.nonzero(-2 * d, 2 * d);
              if (n % d === 0) n += 1;
              const f = new F(n, d);
              terms.push({ v: f, t: f.tex() });
            } else {
              const n = r.pick([-25, -15, -5, 5, 15, 25, -12, 12, -75, 75]);
              const f = new F(n, n % 25 === 0 ? 100 : 10);
              terms.push({ v: f, t: dec(f.value) });
            }
          }
          let s = terms[0].t;
          let total = terms[0].v;
          const asAdd: string[] = [terms[0].t];
          for (let i = 1; i < 4; i++) {
            const t = terms[i];
            if (r.chance(0.5)) {
              s += ` - ${parenNeg(t)}`;
              total = total.sub(t.v);
              asAdd.push(fp(t.v.neg()));
            } else {
              s += t.v.n < 0 ? ` ${t.t}` : ` + ${t.t}`;
              total = total.add(t.v);
              asAdd.push(fp(t.v));
            }
          }
          return {
            q: `다음을 계산하세요.\n$$${s}$$`,
            answer: { type: 'num', value: total.value, display: 'frac', requireReduced: true },
            steps: [`소수는 분수로, 뺄셈은 덧셈으로 고치면 $${terms[0].v.tex()} + ${asAdd.slice(1).join(' + ')}$`, '양수끼리, 음수끼리 모아 통분하여 계산합니다.', `$= ${total.tex()}$`],
            hint: '소수를 분수로 바꾸면 통분하기 쉬워요.',
          };
        },
      },
      {
        id: 'mul-div',
        title: '유리수의 곱셈과 나눗셈',
        gen(r, level) {
          if (level === 1) {
            if (r.chance(0.5)) {
              const xs = [r.nonzero(-6, 6), r.nonzero(-6, 6), r.nonzero(-5, 5)];
              const v = xs[0] * xs[1] * xs[2];
              const neg = xs.filter((x) => x < 0).length;
              return {
                q: `다음을 계산하세요.\n$$${xs.map(sp).join(' \\times ')}$$`,
                answer: { type: 'num', value: v },
                steps: [`음수가 $${neg}$ 개이므로 부호는 $${neg % 2 ? '-' : '+'}$`, `절댓값의 곱: $${xs.map(Math.abs).join('\\times')} = ${Math.abs(v)}$`, `$= ${v}$`],
              };
            }
            const b = r.nonzero(-9, 9);
            const q = r.nonzero(-9, 9);
            const a = b * q;
            return {
              q: `다음을 계산하세요.\n$$${sp(a)} \\div ${sp(b)}$$`,
              answer: { type: 'num', value: q },
              steps: [`부호가 ${a * b > 0 ? '같으므로 $+$' : '다르므로 $-$'}`, `$${Math.abs(a)} \\div ${Math.abs(b)} = ${Math.abs(q)}$ 이므로 $${q}$`],
            };
          }
          if (level === 2) {
            const mkF = () => new F(r.nonzero(-9, 9), r.int(2, 9));
            const a = mkF();
            const b = mkF();
            const c = mkF();
            const v = a.div(b).mul(c);
            return {
              q: `다음을 계산하세요.\n$$${sp(a)} \\div ${sp(b)} \\times ${sp(c)}$$`,
              answer: { type: 'num', value: v.value, display: 'frac', requireReduced: true },
              steps: [`나눗셈은 역수의 곱으로: $${sp(a)} \\times ${sp(b.inv())} \\times ${sp(c)}$`, `$= ${v.tex()}$`],
              hint: '나누는 수의 역수를 곱하세요.',
            };
          }
          const base = r.pick([2, 3]);
          const e = base === 3 ? 2 : r.int(2, 3);
          const negSq = r.chance(0.4);
          const lead = negSq ? `-${base}^{${e}}` : `(-${base})^{${e}}`;
          const leadV = negSq ? new F(-(base ** e)) : new F(-base).pow(e);
          const f2 = new F(r.pick([-1, 1]) * r.int(1, 3), r.int(2, 4));
          const p2 = f2.pow(2);
          const c = r.nonzero(-6, 6);
          const v = leadV.mul(p2).div(c);
          return {
            q: `다음을 계산하세요.\n$$${lead} \\times \\left(${f2.tex()}\\right)^{2} \\div ${sp(c)}$$`,
            answer: { type: 'num', value: v.value, display: 'frac', requireReduced: true },
            steps: [`거듭제곱 먼저: $${lead} = ${leadV.tex()}$, $\\left(${f2.tex()}\\right)^{2} = ${p2.tex()}$`, `$${fp(leadV)} \\times ${p2.tex()} \\times ${fp(new F(1, c))}$`, `$= ${v.tex()}$`],
            hint: negSq ? '$-a^{2}$ 은 $(-a)^{2}$ 과 달라요.' : '거듭제곱을 먼저 계산하세요.',
          };
        },
      },
      {
        id: 'mixed',
        title: '혼합 계산',
        gen(r, level) {
          if (level === 1) {
            const a = r.nonzero(-9, 9);
            const b = r.nonzero(-6, 6);
            const c = r.nonzero(-6, 6);
            if (r.chance(0.5)) {
              const v = a + b * c;
              return {
                q: `다음을 계산하세요.\n$$${a} + ${fp(b)} \\times ${fp(c)}$$`,
                answer: { type: 'num', value: v },
                steps: [`곱셈 먼저: $${fp(b)} \\times ${fp(c)} = ${b * c}$`, `$${a} + ${fp(b * c)} = ${v}$`],
                hint: '곱셈을 덧셈보다 먼저 해요.',
              };
            }
            const bb = b * c;
            const v = a - bb / c;
            return {
              q: `다음을 계산하세요.\n$$${a} - ${fp(bb)} \\div ${fp(c)}$$`,
              answer: { type: 'num', value: v },
              steps: [`나눗셈 먼저: $${fp(bb)} \\div ${fp(c)} = ${b}$`, `$${a} - ${fp(b)} = ${v}$`],
              hint: '나눗셈을 뺄셈보다 먼저 해요.',
            };
          }
          if (level === 2) {
            const k = r.int(2, 3);
            const p = (-2) ** k;
            const a = r.nonzero(-5, 5);
            const c = r.int(2, 6);
            const qv = r.nonzero(-6, 6);
            const b = c * qv;
            const v = p * a - b / -c;
            return {
              q: `다음을 계산하세요.\n$$(-2)^{${k}} \\times ${fp(a)} - ${fp(b)} \\div (-${c})$$`,
              answer: { type: 'num', value: v },
              steps: [`$(-2)^{${k}} = ${p}$`, `$${fp(p)} \\times ${fp(a)} = ${p * a}$, $${fp(b)} \\div (-${c}) = ${-qv}$`, `$${p * a} - ${fp(-qv)} = ${v}$`],
            };
          }
          if (r.chance(0.5)) {
            // a - {b + (c - d) × e} ÷ f
            const f = r.pick([2, 3, 4, -2, -3]);
            const c = r.int(-5, 5);
            const d = r.int(-5, 5);
            const e = r.nonzero(-4, 4);
            const inner = (c - d) * e;
            let b = r.int(-8, 8);
            b += ((-(b + inner) % f) + f) % f; // b+inner 이 f 의 배수가 되게
            const a = r.int(-9, 9);
            const brace = b + inner;
            const v = a - brace / f;
            return {
              q: `다음을 계산하세요.\n$$${a} - \\{${b} + (${c} ${d < 0 ? '+' : '-'} ${Math.abs(d)}) \\times ${fp(e)}\\} \\div ${fp(f)}$$`,
              answer: { type: 'num', value: v },
              steps: [`( ) 안: $${c} ${d < 0 ? '+' : '-'} ${Math.abs(d)} = ${c - d}$`, `{ } 안: $${b} + ${fp(c - d)} \\times ${fp(e)} = ${b} + ${fp(inner)} = ${brace}$`, `$${a} - ${fp(brace)} \\div ${fp(f)} = ${a} - ${fp(brace / f)} = ${v}$`],
              hint: '( ) → { } 순서로 계산하세요.',
            };
          }
          const p = new F(r.nonzero(-5, 5), r.int(2, 5));
          const sq = new F(-1, r.int(2, 3));
          const t = r.nonzero(-4, 4);
          const sqv = sq.pow(2);
          const v = p.div(sqv).sub(t);
          return {
            q: `다음을 계산하세요.\n$$${p.tex()} \\div \\left(${sq.tex()}\\right)^{2} - ${fp(t)}$$`,
            answer: { type: 'num', value: v.value, display: 'frac', requireReduced: true },
            steps: [`$\\left(${sq.tex()}\\right)^{2} = ${sqv.tex()}$`, `$${p.tex()} \\div ${sqv.tex()} = ${p.tex()} \\times ${sqv.inv().tex()} = ${p.div(sqv).tex()}$`, `$${p.div(sqv).tex()} - ${fp(t)} = ${v.tex()}$`],
          };
        },
      },
      {
        id: 'word',
        title: '정수와 유리수의 활용',
        gen(r, level) {
          const name = r.pick(NAMES);
          if (level === 1) {
            const hi = r.int(-3, 12);
            const lo = hi - r.int(4, 15);
            const city = r.pick(['서울', '평창', '철원', '대관령', '춘천']);
            return {
              q: `어느 날 ${city}의 최고 기온은 $${hi}$°C, 최저 기온은 $${lo}$°C 였습니다. 이날의 일교차(최고 기온 − 최저 기온)는 몇 °C 인가요?`,
              answer: { type: 'num', value: hi - lo, unit: '°C' },
              steps: [`$${hi} - ${fp(lo)} = ${hi} + ${fp(-lo)} = ${hi - lo}$`],
            };
          }
          if (level === 2) {
            const w = r.int(3, 8);
            const l = r.int(2, 7);
            const winP = r.int(2, 5);
            const loseP = r.int(1, 3);
            const v = w * winP - l * loseP;
            return {
              q: `${name}는 게임에서 이기면 $+${winP}$ 점, 지면 $-${loseP}$ 점을 받습니다. 처음 $0$ 점에서 시작하여 ${w}번 이기고 ${l}번 졌을 때 ${name}의 점수를 구하세요.`,
              answer: { type: 'num', value: v, unit: '점' },
              steps: [`$(+${winP}) \\times ${w} + (-${loseP}) \\times ${l}$`, `$= ${w * winP} + (-${l * loseP}) = ${v}$`],
            };
          }
          const a = new F(r.int(1, 9), r.pick([1, 2, 3, 4]));
          const b = new F(r.nonzero(-9, 9), r.pick([1, 2, 3, 6]));
          const plusWrong = r.chance(0.5);
          // 잘못: x - (-a) = b  (더해야 할 것을 뺌) 또는 x + (-a) = b (빼야 할 것을 더함)
          const x = plusWrong ? b.sub(a) : b.add(a);
          const right = plusWrong ? x.add(a.neg()) : x.sub(a.neg());
          return {
            q: `어떤 수${plusWrong ? '에' : '에서'} $${sp(a.neg())}$ 를 ${plusWrong ? '더해야' : '빼야'} 할 것을 잘못하여 ${plusWrong ? '뺐더니' : '더했더니'} $${b.tex()}$ 가 되었습니다. 바르게 계산한 값을 구하세요.`,
            answer: { type: 'num', value: right.value, display: 'frac' },
            steps: [
              plusWrong ? `어떤 수를 $x$ 라 하면 $x - ${sp(a.neg())} = ${b.tex()}$, $x = ${x.tex()}$` : `어떤 수를 $x$ 라 하면 $x + ${sp(a.neg())} = ${b.tex()}$, $x = ${x.tex()}$`,
              plusWrong ? `바른 계산: $${x.tex()} + ${sp(a.neg())} = ${right.tex()}$` : `바른 계산: $${x.tex()} - ${sp(a.neg())} = ${right.tex()}$`,
            ],
            hint: '먼저 어떤 수를 구하세요.',
          };
        },
      },
    ],
  },

  // ═══════════════ m1a-3 문자의 사용과 식의 계산 ═══════════════
  'm1a-3': {
    concepts: [
      {
        title: '문자를 사용한 식',
        body: '수량 사이의 관계를 문자를 써서 간단히 나타낼 수 있어요.\n- (거리) = (속력) × (시간)\n- (소금의 양) = $\\dfrac{(\\text{농도})}{100}$ × (소금물의 양)\n- 정가 $x$원에서 $a$% 할인: $x - \\dfrac{a}{100}x$ (원)\n초등학교의 □ 대신 문자 $x$ 를 쓴다고 생각하면 돼요.',
      },
      {
        title: '곱셈·나눗셈 기호의 생략',
        body: '- 곱셈 기호 $\\times$ 는 생략하고, **수를 문자 앞에** 써요: $x \\times 3 = 3x$\n- 문자는 보통 알파벳 순서로: $b \\times a = ab$\n- $1$ 과 $-1$ 은 생략: $1 \\times a = a$, $(-1) \\times a = -a$\n- 같은 문자의 곱은 거듭제곱으로: $a \\times a = a^{2}$\n- 나눗셈은 분수로: $a \\div b = \\dfrac{a}{b}$ (또는 역수의 곱)',
        example: { q: '$a \\div b \\times c$', a: '$a \\times \\frac{1}{b} \\times c = \\frac{ac}{b}$' },
      },
      {
        title: '식의 값',
        body: '문자에 수를 넣는 것을 **대입**이라 하고, 대입해서 계산한 값을 **식의 값**이라 해요.\n- 음수를 대입할 때는 반드시 **괄호**를 써요: $x = -2$ 이면 $x^{2} = (-2)^{2} = 4$\n- 분모에 분수를 대입하면 나눗셈으로 바꿔요: $\\dfrac{6}{x}$ 에 $x = \\frac{1}{2}$ → $6 \\div \\frac{1}{2} = 12$',
      },
      {
        title: '다항식과 일차식',
        body: '- **항**: 수 또는 문자의 곱으로만 된 식 ($3x$, $-5$)\n- **상수항**: 수로만 된 항, **계수**: 문자 앞의 수\n- **다항식**: 항이 하나 이상, **단항식**: 항이 하나\n- **차수**: 문자가 곱해진 개수. 차수가 가장 큰 항의 차수가 다항식의 차수\n- **일차식**: 차수가 1인 다항식 ($2x - 1$, $\\frac{x}{3}$). $\\frac{1}{x}$ 은 다항식이 아니에요.',
      },
      {
        title: '일차식의 계산',
        body: '- 수 × 일차식은 **분배법칙**: $-3(2x - 1) = -6x + 3$\n- 문자와 차수가 같은 항(**동류항**)끼리 모아 계산: $3x + 5x = 8x$\n- 괄호 앞이 $-$ 이면 괄호 안 **모든 항의 부호**를 바꿔요.\n- 분수 꼴은 통분: $\\dfrac{x+1}{2} - \\dfrac{x}{3} = \\dfrac{3(x+1) - 2x}{6}$',
      },
    ],
    skills: [
      {
        id: 'omit-sign',
        title: '기호를 생략하여 나타내기',
        gen(r, level) {
          const [x, y, z] = r.pick([
            ['a', 'b', 'c'],
            ['x', 'y', 'z'],
            ['p', 'q', 'r'],
          ]);
          const k = r.int(2, 9);
          const t = r.int(0, 2);
          let expr: string, ans: string, wrongs: string[];
          if (level === 1) {
            if (t === 0) {
              expr = `${y} \\times ${x} \\times (-${k})`;
              ans = `-${k}${x}${y}`;
              wrongs = [`${k}${x}${y}`, `${x}${y}-${k}`, `-\\frac{${x}${y}}{${k}}`, `-${k}+${x}${y}`];
            } else if (t === 1) {
              expr = `${x} \\times ${y} \\times ${x} \\times ${k}`;
              ans = `${k}${x}^{2}${y}`;
              wrongs = [`2${k}${x}${y}`, `${k}${x}${y}^{2}`, `${k}${x}${y}`, `${k * 2}${x}${y}`];
            } else {
              expr = `${x} \\div ${k}`;
              ans = `\\frac{${x}}{${k}}`;
              wrongs = [`\\frac{${k}}{${x}}`, `${k}${x}`, `${x}-${k}`, `\\frac{1}{${k}${x}}`];
            }
          } else if (level === 2) {
            if (t === 0) {
              expr = `${x} \\div ${y} \\times ${z}`;
              ans = `\\frac{${x}${z}}{${y}}`;
              wrongs = [`\\frac{${x}}{${y}${z}}`, `\\frac{${x}${y}}{${z}}`, `${x}${y}${z}`, `\\frac{${y}${z}}{${x}}`];
            } else if (t === 1) {
              expr = `${x} \\times (-1) \\div ${y} \\times ${k}`;
              ans = `-\\frac{${k}${x}}{${y}}`;
              wrongs = [`\\frac{${k}${x}}{${y}}`, `-\\frac{${x}}{${k}${y}}`, `-${k}${x}${y}`, `-\\frac{${k}${y}}{${x}}`];
            } else {
              expr = `(${x}+${y}) \\div ${k}`;
              ans = `\\frac{${x}+${y}}{${k}}`;
              wrongs = [`${x}+\\frac{${y}}{${k}}`, `\\frac{${k}}{${x}+${y}}`, `${k}(${x}+${y})`, `\\frac{${x}}{${k}}+${y}`];
            }
          } else {
            if (t === 0) {
              expr = `${x} \\div (${y} \\div ${z})`;
              ans = `\\frac{${x}${z}}{${y}}`;
              wrongs = [`\\frac{${x}}{${y}${z}}`, `\\frac{${x}${y}}{${z}}`, `\\frac{${z}}{${x}${y}}`, `${x}${y}${z}`];
            } else if (t === 1) {
              expr = `${x} \\div ${y} \\div ${z} \\times (-${k})`;
              ans = `-\\frac{${k}${x}}{${y}${z}}`;
              wrongs = [`-\\frac{${k}${x}${z}}{${y}}`, `-\\frac{${x}}{${k}${y}${z}}`, `\\frac{${k}${x}}{${y}${z}}`, `-\\frac{${k}${y}${z}}{${x}}`];
            } else {
              // 역방향: ab/c 와 같은 것
              const target = `\\frac{${x}${y}}{${z}}`;
              return {
                q: `다음 중 $${target}$ 와 같은 것은?`,
                answer: texChoices(r, `${x} \\div ${z} \\times ${y}`, [`${x} \\div ${y} \\times ${z}`, `${x} \\div (${y} \\times ${z})`, `${x} \\div ${y} \\div ${z}`, `${z} \\div (${x} \\times ${y})`]),
                steps: [`$${x} \\div ${z} \\times ${y} = ${x} \\times \\frac{1}{${z}} \\times ${y} = ${target}$`, `$${x} \\div ${y} \\times ${z} = \\frac{${x}${z}}{${y}}$, $${x} \\div ${y} \\div ${z} = \\frac{${x}}{${y}${z}}$ 이므로 다릅니다.`],
                hint: '나눗셈은 역수의 곱셈으로 바꾸어 보세요.',
              };
            }
          }
          return {
            q: `다음 식을 곱셈 기호 $\\times$ 와 나눗셈 기호 $\\div$ 를 생략하여 나타내면?\n$$${expr}$$`,
            answer: texChoices(r, ans, wrongs),
            steps: ['나눗셈은 역수의 곱셈으로 바꿉니다.', '수는 문자 앞에, 문자는 알파벳 순서로 씁니다.', `$${expr} = ${ans}$`],
            hint: '$a \\div b = a \\times \\frac{1}{b}$',
          };
        },
      },
      {
        id: 'expr-value',
        title: '식의 값',
        gen(r, level) {
          if (level === 1) {
            const a = r.nonzero(-5, 5);
            const p = r.nonzero(-6, 6);
            const q = r.nonzero(-9, 9);
            const v = p * a + q;
            return {
              q: `$x = ${a}$ 일 때, $${lin(p, q)}$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v },
              steps: [`$${p === 1 ? '' : p === -1 ? '-' : p + ' \\times '}${fp(a)} ${cst(q)}$`, `$= ${p * a} ${cst(q)} = ${v}$`],
              hint: '음수를 대입할 때는 괄호를 쓰세요.',
            };
          }
          if (level === 2) {
            const a = -r.int(1, 5);
            if (r.chance(0.5)) {
              const s = r.pick([1, -1]);
              const p = r.nonzero(-5, 5);
              const q = r.int(-9, 9);
              const v = s * a * a + p * a + q;
              const expr = termsTex([
                { c: s, v: 'x^{2}' },
                { c: p, v: 'x' },
                { c: q, v: '' },
              ]);
              return {
                q: `$x = ${a}$ 일 때, $${expr}$ 의 값을 구하세요.`,
                answer: { type: 'num', value: v },
                steps: [`$${s < 0 ? '-' : ''}(${a})^{2} ${p < 0 ? '-' : '+'} ${Math.abs(p) === 1 ? '' : Math.abs(p) + ' \\times '}(${a}) ${cst(q)}$`, `$= ${s * a * a} ${cst(p * a)} ${cst(q)} = ${v}$`],
                hint: s < 0 ? '$-x^{2}$ 은 $-(x^{2})$ 이에요.' : '$(-a)^{2}$ 은 양수예요.',
              };
            }
            const ds = divisors(12 * r.int(1, 3)).filter((d) => d > 1 && d <= 6);
            const xv = -r.pick(ds);
            const N = 12 * r.int(1, 3);
            const N2 = N - (N % Math.abs(xv));
            const k = r.nonzero(-4, 4);
            const v = N2 / xv + k * xv;
            return {
              q: `$x = ${xv}$ 일 때, $\\frac{${N2}}{x} ${k < 0 ? '-' : '+'} ${Math.abs(k) === 1 ? '' : Math.abs(k)}x$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v },
              steps: [`$\\frac{${N2}}{${fp(xv)}} = ${N2 / xv}$, $${k}\\times ${fp(xv)} = ${k * xv}$`, `$${N2 / xv} ${cst(k * xv)} = ${v}$`],
            };
          }
          const mx = r.int(2, 5);
          const ny = r.int(2, 5);
          const a = r.nonzero(-6, 6);
          const b = r.nonzero(-6, 6);
          // x = 1/mx, y = -1/ny : a/x - b/y
          const v = a * mx + b * ny;
          const t1 = `${a < 0 ? '-' : ''}\\frac{${Math.abs(a)}}{x}`;
          const t2 = `${b < 0 ? '+' : '-'} \\frac{${Math.abs(b)}}{y}`;
          return {
            q: `$x = \\frac{1}{${mx}}$, $y = -\\frac{1}{${ny}}$ 일 때, $${t1} ${t2}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: v },
            steps: [`$\\frac{1}{x} = ${mx}$, $\\frac{1}{y} = -${ny}$`, `$${a} \\times ${mx} - ${fp(b)} \\times (-${ny}) = ${a * mx} ${cst(b * ny)} = ${v}$`],
            hint: '분모에 분수를 대입하면 나눗셈이 돼요. $\\frac{a}{x} = a \\times \\frac{1}{x}$',
          };
        },
      },
      {
        id: 'terms',
        title: '다항식과 일차식',
        gen(r, level) {
          if (level === 1) {
            const a = r.nonzero(-9, 9);
            const b = r.nonzero(-9, 9);
            const swap = r.chance(0.5);
            const expr = swap ? termsTex([{ c: b, v: '' }, { c: a, v: 'x' }]) : lin(a, b);
            return {
              q: `일차식 $${expr}$ 에서 $x$ 의 계수를 $a$, 상수항을 $b$ 라 할 때, $a + b$ 의 값을 구하세요.`,
              answer: { type: 'num', value: a + b },
              steps: [`$x$ 의 계수 $a = ${a}$, 상수항 $b = ${b}$`, `$a + b = ${a} + ${fp(b)} = ${a + b}$`],
              hint: '계수와 상수항은 부호까지 포함해요.',
            };
          }
          if (level === 2) {
            const a = r.nonzero(-5, 5);
            const b = r.nonzero(-9, 9);
            const c = r.nonzero(-9, 9);
            const expr = termsTex([
              { c: b, v: 'x' },
              { c: a, v: 'x^{2}' },
              { c: c, v: '' },
            ]);
            const v = 2 + b + c;
            return {
              q: `다항식 $${expr}$ 의 차수를 $p$, $x$ 의 계수를 $q$, 상수항을 $r$ 라 할 때, $p + q + r$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v },
              steps: [`차수가 가장 큰 항은 $${termsTex([{ c: a, v: 'x^{2}' }])}$ 이므로 $p = 2$`, `$q = ${b}$, $r = ${c}$`, `$p + q + r = 2 ${cst(b)} ${cst(c)} = ${v}$`],
            };
          }
          const k = r.int(2, 7);
          const c = r.int(1, 9);
          const linear = [`\\frac{x}{${k}} - ${c}`, `${c} - ${k}x`, `0.${k}x + ${c}`, `\\frac{x+${c}}{${k}}`, `x^{2} - x^{2} + ${k}x`, `-${k}x`];
          const nonlinear = [`\\frac{${k}}{x} + ${c}`, `x^{2} - ${k}x`, `${c}`, `0 \\times x + ${c}`, `\\frac{1}{x+${c}}`, `x^{2} + ${k}`];
          if (r.chance(0.5)) {
            const ans = r.pick(linear);
            return {
              q: '다음 중 **일차식**인 것은?',
              answer: texChoices(r, ans, r.sample(nonlinear, 4)),
              steps: [`$${ans}$ 은 정리하면 차수가 1인 다항식입니다.`, '분모에 문자가 있는 식은 다항식이 아니고, $0 \\times x + c$ 는 상수항뿐이에요.'],
              hint: '정리한 뒤 차수를 확인하세요.',
            };
          }
          const ans = r.pick(nonlinear);
          return {
            q: '다음 중 **일차식이 아닌** 것은?',
            answer: texChoices(r, ans, r.sample(linear, 4)),
            steps: [`$${ans}$ 은 일차식이 아닙니다.`, '분모에 문자가 있거나, 차수가 2 이상이거나, 상수항뿐인 식은 일차식이 아니에요.'],
            hint: '$x^{2} - x^{2}$ 처럼 없어지는 항에 주의하세요.',
          };
        },
      },
      {
        id: 'simplify',
        title: '일차식의 계산',
        gen(r, level) {
          if (level === 1) {
            let k = r.nonzero(-6, 6);
            if (k === 1) k = r.int(2, 6); // 1(x-4) 같은 식은 피함
            const a = r.nonzero(-5, 5);
            const b = r.nonzero(-9, 9);
            const ans = lin(k * a, k * b);
            return {
              q: `다음 식을 간단히 하면?\n$$${k}(${lin(a, b)})$$`,
              answer: texChoices(r, ans, [lin(k * a, b), lin(k * a, -k * b), lin(-k * a, k * b), lin(k + a, k * b), lin(a, k * b)]),
              steps: [`분배법칙: $${k} \\times ${a === 1 ? 'x' : a === -1 ? '(-x)' : fp(a) + 'x'} + ${fp(k)} \\times ${fp(b)}$`, `$= ${ans}$`],
            };
          }
          if (level === 2) {
            const p = r.int(2, 5);
            const q = r.int(2, 5);
            const a = r.nonzero(-5, 5);
            const b = r.nonzero(-7, 7);
            const c = r.nonzero(-5, 5);
            const d = r.nonzero(-7, 7);
            const A = p * a - q * c;
            const B = p * b - q * d;
            const ans = lin(A, B);
            return {
              q: `다음 식을 간단히 하면?\n$$${p}(${lin(a, b)}) - ${q}(${lin(c, d)})$$`,
              answer: texChoices(r, ans, [lin(A, p * b + q * d), lin(p * a + q * c, B), lin(p * a - c, p * b - d), lin(A, p * b - d), lin(-A, -B)]),
              steps: [`$${lin(p * a, p * b)} ${termsTex([{ c: -q * c, v: 'x' }, { c: -q * d, v: '' }]).replace(/^(?=[^-])/, '+')}$`, `동류항끼리 모으면 $${ans}$`],
              hint: '괄호 앞의 $-$ 는 괄호 안 모든 항에 곱해져요.',
            };
          }
          const [p, q] = r.pick([
            [2, 3],
            [3, 4],
            [2, 5],
            [4, 3],
            [3, 2],
            [6, 4],
          ]);
          const a = r.nonzero(-4, 4);
          const b = r.nonzero(-5, 5);
          const c = r.nonzero(-4, 4);
          const d = r.nonzero(-5, 5);
          const A = new F(a, p).sub(new F(c, q));
          const B = new F(b, p).sub(new F(d, q));
          if (A.n === 0) return this.gen(r, level);
          const ans = linTex(A, B);
          return {
            q: `다음 식을 간단히 하면?\n$$\\frac{${lin(a, b)}}{${p}} - \\frac{${lin(c, d)}}{${q}}$$`,
            answer: texChoices(r, ans, [linTex(A, new F(b, p).add(new F(d, q))), linTex(new F(a, p).add(new F(c, q)), B), linTex(new F(a - c, p * q), new F(b - d, p * q)), linTex(A.neg(), B), linTex(A, B.neg())]),
            steps: [`통분: $\\frac{${q}(${lin(a, b)}) - ${p}(${lin(c, d)})}{${p * q}}$`, `$= \\frac{${lin(q * a - p * c, q * b - p * d)}}{${p * q}}$`, `$= ${ans}$`],
            hint: '분모의 최소공배수로 통분하세요.',
          };
        },
      },
      {
        id: 'word-expr',
        title: '문자로 식 세우기',
        gen(r, level) {
          const t = r.int(0, 2);
          if (level === 1) {
            if (t === 0) {
              const a = r.int(3, 15) * 100;
              const b = r.int(5, 20) * 100;
              return {
                q: `한 개에 $${a}$ 원인 연필 $x$ 자루와 한 권에 $${b}$ 원인 공책 $y$ 권의 값을 식으로 나타내면? (단위: 원)`,
                answer: texChoices(r, `${a}x+${b}y`, [`${a + b}xy`, `${a + b}(x+y)`, `${b}x+${a}y`, `${a}+x+${b}+y`]),
                steps: [`연필 값: $${a} \\times x = ${a}x$`, `공책 값: $${b} \\times y = ${b}y$`, `합: $${a}x+${b}y$ (원)`],
              };
            }
            if (t === 1) {
              const n = r.int(3, 8);
              const poly = ['', '', '', '삼', '사', '오', '육', '칠', '팔'][n];
              return {
                q: `한 변의 길이가 $x$ cm 인 정${poly}각형의 둘레의 길이를 식으로 나타내면? (단위: cm)`,
                answer: texChoices(r, `${n}x`, [`x^{${n}}`, `x+${n}`, `\\frac{x}{${n}}`, `${n * 2}x`]),
                steps: [`정${poly}각형은 변이 $${n}$ 개이고 길이가 모두 같습니다.`, `$x \\times ${n} = ${n}x$ (cm)`],
              };
            }
            const b = r.int(5, 10) * 1000;
            const k = r.int(2, 6);
            return {
              q: `$${b}$ 원을 내고 한 권에 $x$ 원인 공책 $${k}$ 권을 샀을 때 받는 거스름돈을 식으로 나타내면? (단위: 원)`,
              answer: texChoices(r, `${b}-${k}x`, [`${b}-x`, `${k}x-${b}`, `${b}+${k}x`, `${b * k}-x`]),
              steps: [`공책 값: $${k}x$ 원`, `거스름돈: $${b}-${k}x$ (원)`],
            };
          }
          if (level === 2) {
            if (t === 0) {
              const v = r.int(3, 9) * 10;
              return {
                q: `$y$ km 떨어진 곳까지 시속 $${v}$ km 로 갈 때 걸리는 시간을 식으로 나타내면? (단위: 시간)`,
                answer: texChoices(r, `\\frac{y}{${v}}`, [`${v}y`, `\\frac{${v}}{y}`, `y-${v}`, `\\frac{y}{${v * 60}}`]),
                steps: ['(시간) = (거리) ÷ (속력)', `$y \\div ${v} = \\frac{y}{${v}}$ (시간)`],
              };
            }
            if (t === 1) {
              const sw = r.chance(0.5);
              return {
                q: `십의 자리 숫자가 ${sw ? '$b$' : '$a$'}, 일의 자리 숫자가 ${sw ? '$a$' : '$b$'} 인 두 자리 자연수를 식으로 나타내면?`,
                answer: texChoices(r, sw ? '10b+a' : '10a+b', ['ab', 'a+b', sw ? '10a+b' : '10b+a', '10(a+b)', sw ? 'ba' : '100a+b']),
                steps: ['두 자리 자연수 = $10 \\times$ (십의 자리 숫자) + (일의 자리 숫자)', `$${sw ? '10b+a' : '10a+b'}$`],
                hint: '예: 35 = 10×3 + 5',
              };
            }
            const p = r.pick([3, 5, 8, 12, 15, 20, 25, 30, 40]);
            const f = new F(p, 100);
            const ans = `${f.tex()}x`;
            return {
              q: `$x$ 원의 $${p}$% 를 식으로 나타내면? (단위: 원)`,
              answer: texChoices(r, ans, [`${p}x`, `\\frac{100}{${p}}x`, `x+${p}`, `${new F(100 - p, 100).tex()}x`, `${p * 100}x`]),
              steps: [`$${p}$% $= \\frac{${p}}{100}$`, `$\\frac{${p}}{100} \\times x = ${ans}$ (원)`],
            };
          }
          if (t === 0) {
            const p = r.pick([10, 15, 20, 25, 30, 40]);
            const ans = `${new F(100 - p, 100).tex()}x`;
            return {
              q: `정가가 $x$ 원인 물건을 $${p}$% 할인하여 판매하는 가격을 식으로 나타내면? (단위: 원)`,
              answer: texChoices(r, ans, [`${new F(p, 100).tex()}x`, `x-${p}`, `x-${p}x`, `${new F(100 + p, 100).tex()}x`, `\\frac{x}{${p}}`]),
              steps: [`할인 금액: $\\frac{${p}}{100}x$ 원`, `$x - \\frac{${p}}{100}x = ${ans}$ (원)`],
            };
          }
          if (t === 1) {
            const a = r.int(5, 30);
            return {
              q: `물 $x$ g 에 소금 $${a}$ g 을 녹인 소금물의 농도를 식으로 나타내면? (단위: %)`,
              answer: texChoices(r, `\\frac{${100 * a}}{x+${a}}`, [`\\frac{${100 * a}}{x}`, `\\frac{${a}}{x+${a}}`, `\\frac{x+${a}}{${100 * a}}`, `\\frac{${a}x}{100}`]),
              steps: ['(농도) = (소금의 양) ÷ (소금물의 양) × 100', `소금물의 양은 $(x+${a})$ g`, `$\\frac{${a}}{x+${a}} \\times 100 = \\frac{${100 * a}}{x+${a}}$ (%)`],
              hint: '소금물 = 물 + 소금',
            };
          }
          const a = r.int(60, 90);
          let b = r.int(60, 90);
          if (b === a) b++;
          return {
            q: `남학생 $x$ 명의 수학 점수 평균이 $${a}$ 점, 여학생 $y$ 명의 평균이 $${b}$ 점일 때, 전체 학생의 평균을 식으로 나타내면? (단위: 점)`,
            answer: texChoices(r, `\\frac{${a}x+${b}y}{x+y}`, [`\\frac{${a + b}}{2}`, `\\frac{${a}x+${b}y}{2}`, `${a}x+${b}y`, `\\frac{${a}+${b}}{x+y}`]),
            steps: [`전체 점수의 합: $${a}x+${b}y$ 점`, `전체 학생 수: $x+y$ 명`, `평균: $\\frac{${a}x+${b}y}{x+y}$ (점)`],
          };
        },
      },
    ],
  },

  // ═══════════════ m1a-4 일차방정식 ═══════════════
  'm1a-4': {
    concepts: [
      {
        title: '방정식과 항등식',
        body: '등호(=)를 사용하여 나타낸 식을 **등식**이라 해요.\n- **방정식**: 미지수의 값에 따라 참이 되기도, 거짓이 되기도 하는 등식. 참이 되게 하는 값이 **해(근)**\n- **항등식**: 미지수에 어떤 값을 넣어도 항상 참인 등식 (예: $2(x+1) = 2x + 2$)\n$ax + b = cx + d$ 가 항등식 ⇔ $a = c$, $b = d$',
      },
      {
        title: '등식의 성질',
        body: '$a = b$ 이면\n- $a + c = b + c$, $a - c = b - c$\n- $ac = bc$\n- $\\dfrac{a}{c} = \\dfrac{b}{c}$ (단, $c \\ne 0$)\n양쪽에 똑같은 일을 하면 등식은 그대로예요. 초등학교 □ 구하기를 정리한 규칙이에요.',
      },
      {
        title: '이항과 일차방정식의 풀이',
        body: '등식의 한 변에 있는 항을 부호를 바꾸어 다른 변으로 옮기는 것을 **이항**이라 해요.\n**풀이 순서**\n- 괄호가 있으면 분배법칙으로 풉니다.\n- $x$ 항은 좌변, 상수항은 우변으로 이항\n- 정리하여 $ax = b$ 꼴로 → 양변을 $a$ 로 나누기',
        example: { q: '$3x - 5 = x + 7$', a: '$3x - x = 7 + 5$, $2x = 12$, $x = 6$' },
      },
      {
        title: '계수가 분수·소수인 방정식',
        body: '- 계수가 **소수**이면 양변에 $10, 100, \\ldots$ 을 곱해 정수로\n- 계수가 **분수**이면 양변에 **분모의 최소공배수**를 곱해 정수로\n모든 항에 빠짐없이 곱하는 것이 중요해요 (상수항도!).',
      },
      {
        title: '일차방정식의 활용',
        body: '1. 구하려는 것을 $x$ 로 놓기\n2. 문제의 관계에 맞게 방정식 세우기\n3. 풀기\n4. 구한 해가 문제의 뜻에 맞는지 확인 (개수는 자연수, 길이는 양수 …)\n자주 쓰는 관계: (거리) = (속력) × (시간), (소금의 양) = $\\frac{\\text{농도}}{100}$ × (소금물의 양)',
      },
    ],
    skills: [
      {
        id: 'identity',
        title: '방정식의 해와 항등식',
        gen(r, level) {
          if (level === 1) {
            const p = r.int(2, 5);
            const q = r.nonzero(-6, 6);
            const a = r.int(4, 8);
            const b = r.int(1, a - 2);
            const ans = r.chance(0.5) ? `${p}(${lin(1, q)}) = ${lin(p, p * q)}` : `${a}x - ${b}x = ${a - b}x`;
            return {
              q: '다음 중 $x$ 에 대한 **항등식**인 것은?',
              answer: texChoices(r, ans, [`${p}(${lin(1, q)}) = ${lin(p, q)}`, `${lin(a, q)} = ${b}`, `x + ${a} = ${a}x`, `${a}x - ${b}x = ${a - b}`, `${lin(p, q)}`]),
              steps: [`$${ans}$ 은 좌변을 정리하면 우변과 같아지므로 항등식입니다.`, '항등식은 $x$ 에 어떤 값을 넣어도 참이에요.'],
              hint: '좌변을 정리해서 우변과 똑같아지는지 보세요.',
            };
          }
          if (level === 2) {
            const k = r.nonzero(-5, 5);
            const mk = (sol: number) => {
              const a = r.nonzero(-5, 5);
              const b = r.nonzero(-9, 9);
              return `${lin(a, b)} = ${a * sol + b}`;
            };
            const ans = mk(k);
            const wr = [k + 1, k - 1, -k, k + 2, k * 2].filter((v) => v !== k).map(mk);
            return {
              q: `다음 방정식 중 해가 $x = ${k}$ 인 것은?`,
              answer: texChoices(r, ans, wr),
              steps: [`각 방정식에 $x = ${k}$ 를 대입하여 (좌변) = (우변) 인지 확인합니다.`, `$${ans}$ 은 $x = ${k}$ 를 대입하면 참이 됩니다.`],
            };
          }
          const A = r.int(2, 6);
          const B = r.nonzero(-5, 5);
          const a = -A * B;
          const b = A;
          const ask = r.chance(0.5) ? 'sum' : 'prod';
          const v = ask === 'sum' ? a + b : a * b;
          return {
            q: `등식 $${A}x + a = b(${lin(1, -B)})$ 가 $x$ 에 대한 항등식일 때, 상수 $a$, $b$ 에 대하여 $${ask === 'sum' ? 'a + b' : 'ab'}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: v },
            steps: [`우변을 전개하면 $bx ${B > 0 ? '-' : '+'} ${Math.abs(B)}b$`, `항등식이므로 $x$ 의 계수: $b = ${A}$, 상수항: $a = ${-B} \\times ${A} = ${a}$`, `$${ask === 'sum' ? `a + b = ${a} + ${b}` : `ab = ${fp(a)} \\times ${b}`} = ${v}$`],
            hint: '양변의 $x$ 의 계수와 상수항이 각각 같아야 해요.',
          };
        },
      },
      {
        id: 'solve',
        title: '일차방정식 풀기',
        gen(r, level) {
          const s = r.int(-9, 9);
          if (level === 1) {
            if (r.chance(0.5)) {
              const a = r.nonzero(-9, 9);
              const b = r.nonzero(-12, 12);
              const c = a * s + b;
              return {
                q: `다음 일차방정식을 푸세요.\n$$${lin(a, b)} = ${c}$$`,
                answer: { type: 'num', value: s },
                steps: [`$${b}$ 를 이항: $${termsTex([{ c: a, v: 'x' }])} = ${c} ${cst(-b)} = ${c - b}$`, ...(a === 1 ? [] : [`양변을 $${a}$ 로 나누면 $x = ${s}$`])],
              };
            }
            const a = r.int(2, 9);
            let c = r.int(1, 8);
            if (c === a) c = a + 1;
            const b = r.nonzero(-10, 10);
            const d = (a - c) * s + b;
            return {
              q: `다음 일차방정식을 푸세요.\n$$${lin(a, b)} = ${lin(c, d)}$$`,
              answer: { type: 'num', value: s },
              steps: [`이항: $${a}x - ${c === 1 ? '' : c}x = ${d} ${cst(-b)}$`, `$${a - c}x = ${d - b}$`, `$x = ${s}$`],
            };
          }
          if (level === 2) {
            // 괄호 앞 계수가 1 이면 '(x+3) = …' 처럼 어색하므로 1 은 피함
            let p = r.nonzero(-5, 5);
            if (p === 1) p = r.int(2, 5);
            const q = r.nonzero(-6, 6);
            let rr = r.nonzero(-4, 4);
            while (rr === p || rr === 1) rr = rr >= 4 ? -4 : rr + 1 || 2;
            const t = r.nonzero(-6, 6);
            const u = p * (s + q) - rr * (s + t);
            const L = `${p === 1 ? '' : p === -1 ? '-' : p}(${lin(1, q)})`;
            const R = `${rr === 1 ? '' : rr === -1 ? '-' : rr}(${lin(1, t)}) ${cst(u)}`;
            return {
              q: `다음 일차방정식을 푸세요.\n$$${L} = ${R}$$`,
              answer: { type: 'num', value: s },
              steps: [`괄호를 풀면 $${lin(p, p * q)} = ${lin(rr, rr * t + u)}$`, `이항하여 정리: $${termsTex([{ c: p - rr, v: 'x' }])} = ${rr * t + u - p * q}$`, `$x = ${s}$`],
            };
          }
          if (r.chance(0.5)) {
            for (;;) {
              const [p, q] = r.pick([
                [2, 3],
                [3, 4],
                [2, 5],
                [4, 6],
                [3, 2],
                [6, 4],
              ]);
              const a = r.nonzero(-5, 5);
              const b = r.nonzero(-5, 5);
              if (p === q) continue;
              const num = q * (s + a) - p * (s - b);
              if (num % (p * q) !== 0) continue;
              const c = num / (p * q);
              const L = p * q / gcd(p, q);
              return {
                q: `다음 일차방정식을 푸세요.\n$$\\frac{${lin(1, a)}}{${p}} - \\frac{${lin(1, -b)}}{${q}} = ${c}$$`,
                answer: { type: 'num', value: s },
                steps: [`양변에 $${L}$ 를 곱하면 $${L / p}(${lin(1, a)}) - ${L / q}(${lin(1, -b)}) = ${c * L}$`, `$${lin(L / p - L / q, (L / p) * a + (L / q) * b)} = ${c * L}$`, `$x = ${s}$`],
                hint: '분모의 최소공배수를 양변에 곱하세요.',
              };
            }
          }
          for (;;) {
            const a1 = r.int(2, 9);
            const c1 = r.int(1, 9);
            const b1 = r.nonzero(-20, 20);
            const d1 = (a1 - c1) * s - b1; // (a1 x - b1)/10 = (c1 x + d1)/10
            if (a1 === c1 || d1 === 0 || Math.abs(d1) > 40) continue;
            const D = (n: number) => dec(n / 10);
            const lhs = `${D(a1)}x ${b1 < 0 ? '+' : '-'} ${D(Math.abs(b1))}`;
            const rhs = `${D(c1)}x ${d1 < 0 ? '-' : '+'} ${D(Math.abs(d1))}`;
            return {
              q: `다음 일차방정식을 푸세요.\n$$${lhs} = ${rhs}$$`,
              answer: { type: 'num', value: s },
              steps: [`양변에 $10$ 을 곱하면 $${lin(a1, -b1)} = ${lin(c1, d1)}$`, `$${termsTex([{ c: a1 - c1, v: 'x' }])} = ${d1 + b1}$`, `$x = ${s}$`],
              hint: '양변에 10을 곱해 계수를 정수로 만드세요.',
            };
          }
        },
      },
      {
        id: 'param',
        title: '해가 주어진 방정식의 미지수',
        gen(r, level) {
          const s = r.nonzero(-6, 6);
          if (level === 1) {
            const a = r.nonzero(-7, 7);
            const b = r.nonzero(-9, 9);
            const c = a * s + b;
            return {
              q: `$x = ${s}$ 가 일차방정식 $ax ${cst(b)} = ${c}$ 의 해일 때, 상수 $a$ 의 값을 구하세요.`,
              answer: { type: 'num', value: a },
              steps: [`$x = ${s}$ 를 대입: $${s}a ${cst(b)} = ${c}$`, `$${s}a = ${c - b}$, $a = ${a}$`],
            };
          }
          if (level === 2) {
            const p = r.nonzero(-5, 5);
            const q = r.nonzero(-9, 9);
            const rr = p * s + q;
            const mm = r.int(2, 6);
            const n = r.nonzero(-9, 9);
            const a = mm * s - n;
            return {
              q: `두 일차방정식 $${lin(p, q)} = ${rr}$, $${mm}x - a = ${n}$ 의 해가 같을 때, 상수 $a$ 의 값을 구하세요.`,
              answer: { type: 'num', value: a },
              steps: [`$${lin(p, q)} = ${rr}$ 을 풀면 $x = ${s}$`, `$${mm} \\times ${fp(s)} - a = ${n}$`, `$a = ${mm * s} - ${fp(n)} = ${a}$`],
              hint: '먼저 상수가 없는 방정식을 푸세요.',
            };
          }
          const p = r.int(2, 5);
          const q = r.nonzero(-9, 9);
          const rr = p * s + q;
          const rel = r.int(0, 2);
          const t = rel === 0 ? 2 * s : rel === 1 ? 3 * s : s + 3;
          const relTxt = rel === 0 ? '2배' : rel === 1 ? '3배' : '보다 3만큼 크다';
          const pp = r.int(3, 7);
          const qq = r.int(1, pp - 1);
          const c = r.nonzero(-9, 9);
          const a = (pp - qq) * t - c;
          return {
            q: `$x$ 에 대한 일차방정식 $${pp}x - a = ${lin(qq, c)}$ 의 해가 방정식 $${lin(p, q)} = ${rr}$ 의 해${rel === 2 ? '보다 $3$ 만큼 클' : `의 ${relTxt}일`} 때, 상수 $a$ 의 값을 구하세요.`,
            answer: { type: 'num', value: a },
            steps: [`$${lin(p, q)} = ${rr}$ 의 해: $x = ${s}$`, `따라서 첫 번째 방정식의 해는 $x = ${t}$`, `$${pp} \\times ${fp(t)} - a = ${qq === 1 ? '' : qq + ' \\times '}${fp(t)} ${cst(c)}$ 에서 $a = ${a}$`],
          };
        },
      },
      {
        id: 'word-number',
        title: '활용 (수·나이·과부족)',
        gen(r, level) {
          const name = r.pick(NAMES);
          if (level === 1) {
            const x = r.int(2, 30);
            const k = r.int(2, 6);
            const b = r.int(1, 20);
            if (r.chance(0.5)) {
              return {
                q: `어떤 수의 $${k}$ 배에 $${b}$ 를 더하면 $${k * x + b}$ 가 됩니다. 어떤 수를 구하세요.`,
                answer: { type: 'num', value: x },
                steps: [`어떤 수를 $x$ 라 하면 $${k}x + ${b} = ${k * x + b}$`, `$${k}x = ${k * x}$, $x = ${x}$`],
              };
            }
            return {
              q: `어떤 수에서 $${b}$ 를 뺀 것의 $${k}$ 배는 $${k * (x - b)}$ 입니다. 어떤 수를 구하세요.`,
              answer: { type: 'num', value: x },
              steps: [`어떤 수를 $x$ 라 하면 $${k}(x - ${b}) = ${k * (x - b)}$`, `$x - ${b} = ${x - b}$, $x = ${x}$`],
            };
          }
          if (level === 2) {
            if (r.chance(0.5)) {
              const mid = r.int(5, 60);
              const even = r.chance(0.5);
              const mm = even ? mid * 2 : mid;
              const S = 3 * mm;
              return {
                q: `연속하는 세 ${even ? '짝수' : '자연수'}의 합이 $${S}$ 일 때, 세 수 중 가장 큰 수를 구하세요.`,
                answer: { type: 'num', value: mm + (even ? 2 : 1) },
                steps: [`가운데 수를 $x$ 라 하면 $(x - ${even ? 2 : 1}) + x + (x + ${even ? 2 : 1}) = ${S}$`, `$3x = ${S}$, $x = ${mm}$`, `가장 큰 수는 $${mm + (even ? 2 : 1)}$`],
              };
            }
            const a = r.int(8, 15);
            const k = r.int(2, 3);
            const x = r.int(2, 15);
            const A = k * (a + x) - x;
            return {
              q: `현재 아버지의 나이는 $${A}$ 세, ${name}의 나이는 $${a}$ 세입니다. 몇 년 후에 아버지의 나이가 ${name}의 나이의 $${k}$ 배가 되는지 구하세요.`,
              answer: { type: 'num', value: x, unit: '년 후' },
              steps: [`$x$ 년 후라 하면 $${A} + x = ${k}(${a} + x)$`, `$${A} + x = ${k * a} + ${k}x$, $${k - 1 === 1 ? '' : k - 1}x = ${A - k * a}$`, ...(k === 2 ? [] : [`$x = ${x}$`])],
            };
          }
          if (r.chance(0.5)) {
            const n = r.int(5, 30);
            const a = r.int(2, 6);
            const c = a + r.int(1, 3);
            const b = r.int(1, 15);
            const d = (c - a) * n - b;
            if (d <= 0) return this.gen(r, level);
            const item = r.pick(['사탕', '연필', '공책', '귤']);
            return {
              q: `학생들에게 ${item}을 나누어 주는데 한 명에게 $${a}$ 개씩 주면 $${b}$ 개가 남고, $${c}$ 개씩 주면 $${d}$ 개가 모자랍니다. ${item}은 모두 몇 개인지 구하세요.`,
              answer: { type: 'num', value: a * n + b, unit: '개' },
              steps: [`학생 수를 $x$ 라 하면 $${a}x + ${b} = ${c}x - ${d}$`, c - a === 1 ? `$x = ${n}$` : `$${c - a}x = ${b + d}$, $x = ${n}$`, `${item}: $${a} \\times ${n} + ${b} = ${a * n + b}$ 개`],
              hint: '학생 수를 $x$ 로 놓으면 편해요.',
            };
          }
          const cost = r.int(2, 20) * 1000;
          const p = r.pick([20, 30, 40, 50]);
          const disc = r.int(1, 5) * 100;
          const profit = (cost * p) / 100 - disc;
          if (profit <= 0) return this.gen(r, level);
          return {
            q: `원가에 $${p}$% 의 이익을 붙여 정가를 정했다가, 정가에서 $${disc}$ 원을 할인하여 팔았더니 $${profit}$ 원의 이익이 생겼습니다. 이 물건의 원가를 구하세요.`,
            answer: { type: 'num', value: cost, unit: '원' },
            steps: [`원가를 $x$ 원이라 하면 판매 가격은 $${new F(100 + p, 100).tex()}x - ${disc}$`, `(판매 가격) − (원가) = (이익): $${new F(p, 100).tex()}x - ${disc} = ${profit}$`, `$x = ${cost}$`],
          };
        },
      },
      {
        id: 'word-speed',
        title: '활용 (거리·속력·농도)',
        gen(r, level) {
          const name = r.pick(NAMES);
          if (level === 1) {
            for (;;) {
              const a = r.int(2, 6);
              const b = r.int(2, 6);
              if (a === b) continue;
              const L = lcm(a, b);
              const d = L * r.int(1, 3);
              const t = d / a + d / b;
              if (t > 12) continue;
              return {
                q: `${name}는 집에서 공원까지 갈 때는 시속 $${a}$ km 로, 올 때는 같은 길을 시속 $${b}$ km 로 걸어서 모두 $${t}$ 시간이 걸렸습니다. 집에서 공원까지의 거리를 구하세요.`,
                answer: { type: 'num', value: d, unit: 'km' },
                steps: [`거리를 $x$ km 라 하면 $\\frac{x}{${a}} + \\frac{x}{${b}} = ${t}$`, `양변에 $${L}$ 를 곱하면 $${L / a === 1 ? '' : L / a}x + ${L / b === 1 ? '' : L / b}x = ${t * L}$`, `$${L / a + L / b}x = ${t * L}$, $x = ${d}$`],
                hint: '(시간) = (거리) ÷ (속력)',
              };
            }
          }
          if (level === 2) {
            for (;;) {
              const a = r.int(4, 8) * 10;
              const dd = r.int(1, 6) * 10;
              const k = r.int(3, 15);
              if ((a * k) % dd !== 0) continue;
              const x = (a * k) / dd;
              if (x > 40) continue;
              const b = a + dd;
              const sib = r.pick(['동생', '언니', '누나', '형']);
              return {
                q: `${jo(sib, '이/가')} 집을 출발한 지 $${k}$ 분 후에 ${jo(name, '이/가')} 같은 길로 따라 나섰습니다. ${jo(sib, '은/는')} 분속 $${a}$ m, ${jo(name, '은/는')} 분속 $${b}$ m 로 걸을 때, ${jo(name, '이/가')} 출발한 지 몇 분 후에 ${jo(sib, '을/를')} 만나는지 구하세요.`,
                answer: { type: 'num', value: x, unit: '분 후' },
                steps: [`$x$ 분 후에 만난다고 하면 두 사람이 이동한 거리가 같으므로 $${b}x = ${a}(x + ${k})$`, `$${dd}x = ${a * k}$`, `$x = ${x}$`],
              };
            }
          }
          if (r.chance(0.5)) {
            for (;;) {
              const a = r.int(2, 8);
              const c = a + r.int(1, 6);
              const b = c + r.int(1, 8);
              const mm = r.int(1, 6) * 100;
              const num = mm * (c - a);
              if (num % (b - c) !== 0) continue;
              const x = num / (b - c);
              if (x > 1500) continue;
              return {
                q: `$${a}$% 의 소금물 $${mm}$ g 에 $${b}$% 의 소금물을 섞어서 $${c}$% 의 소금물을 만들려고 합니다. $${b}$% 의 소금물을 몇 g 섞어야 하는지 구하세요.`,
                answer: { type: 'num', value: x, unit: 'g' },
                steps: [`섞는 소금물을 $x$ g 이라 하면 (소금의 양) 이 같으므로`, `$\\frac{${a}}{100} \\times ${mm} + \\frac{${b}}{100}x = \\frac{${c}}{100}(${mm} + x)$`, `$${a * mm} + ${b}x = ${c * mm} + ${c}x$, ${b - c === 1 ? `$x = ${x}$` : `$${b - c}x = ${num}$, $x = ${x}$`}`],
                hint: '섞기 전과 후의 소금의 양은 같아요.',
              };
            }
          }
          for (;;) {
            const a = r.int(2, 10);
            const c = a + r.int(1, 10);
            const mm = r.int(1, 8) * 100;
            const num = mm * (c - a);
            if (num % c !== 0) continue;
            const x = num / c;
            return {
              q: `$${a}$% 의 소금물 $${mm}$ g 에서 물을 증발시켜 $${c}$% 의 소금물을 만들려고 합니다. 물을 몇 g 증발시켜야 하는지 구하세요.`,
              answer: { type: 'num', value: x, unit: 'g' },
              steps: [`증발시킬 물을 $x$ g 이라 하면 소금의 양은 변하지 않으므로`, `$\\frac{${a}}{100} \\times ${mm} = \\frac{${c}}{100}(${mm} - x)$`, `$${a * mm} = ${c * mm} - ${c}x$, $x = ${x}$`],
            };
          }
        },
      },
    ],
  },

  // ═══════════════ m1a-5 좌표평면과 그래프 ═══════════════
  'm1a-5': {
    concepts: [
      {
        title: '순서쌍과 좌표',
        body: '두 수의 순서를 정해 짝 지어 나타낸 쌍 $(a, b)$ 를 **순서쌍**이라 해요. $(2, 3)$ 과 $(3, 2)$ 는 서로 달라요.\n좌표평면에서 점 P 의 좌표가 $(a, b)$ 이면 $a$ 는 **$x$좌표**, $b$ 는 **$y$좌표** 예요. 원점 O 의 좌표는 $(0, 0)$.\n- $x$축 위의 점: $(a, 0)$, $y$축 위의 점: $(0, b)$',
      },
      {
        title: '사분면',
        body: '좌표축은 좌표평면을 네 부분으로 나눠요.\n- 제1사분면 $(+, +)$, 제2사분면 $(-, +)$\n- 제3사분면 $(-, -)$, 제4사분면 $(+, -)$\n**좌표축 위의 점은 어느 사분면에도 속하지 않아요.**\n**대칭인 점**: 점 $(a, b)$ 와 $x$축 대칭 $(a, -b)$, $y$축 대칭 $(-a, b)$, 원점 대칭 $(-a, -b)$',
      },
      {
        title: '그래프',
        body: '두 변수 $x$, $y$ 의 순서쌍 $(x, y)$ 를 좌표평면에 점으로 나타낸 것을 그래프라 해요. 그래프를 보면 시간에 따른 거리·온도 같은 변화를 한눈에 알 수 있어요.\n- 오른쪽 위로 올라가면 증가, 오른쪽 아래로 내려가면 감소, 수평이면 변화 없음',
      },
      {
        title: '정비례 $y = ax$',
        body: '$x$ 가 2배, 3배, … 가 될 때 $y$ 도 2배, 3배, … 가 되면 **$y$ 는 $x$ 에 정비례**한다고 해요. 식은 $y = ax$ ($a \\ne 0$), 즉 $\\dfrac{y}{x} = a$ (일정).\n**그래프**: 원점을 지나는 직선\n- $a > 0$: 제1, 3사분면, 오른쪽 위로 향함\n- $a < 0$: 제2, 4사분면, 오른쪽 아래로 향함\n- $|a|$ 가 클수록 $y$축에 가까워요.',
      },
      {
        title: '반비례 $y = \\frac{a}{x}$',
        body: '$x$ 가 2배, 3배, … 가 될 때 $y$ 는 $\\frac{1}{2}$배, $\\frac{1}{3}$배, … 가 되면 **$y$ 는 $x$ 에 반비례**한다고 해요. 식은 $y = \\dfrac{a}{x}$ ($a \\ne 0$), 즉 $xy = a$ (일정).\n**그래프**: 좌표축에 한없이 가까워지는 한 쌍의 매끄러운 곡선\n- $a > 0$: 제1, 3사분면 / $a < 0$: 제2, 4사분면',
      },
    ],
    skills: [
      {
        id: 'coord',
        title: '좌표 읽기와 대칭점',
        gen(r, level) {
          if (level === 1) {
            const x = r.nonzero(-5, 5);
            const y = r.nonzero(-5, 5);
            const P = plane().point(x, y, 'P');
            return {
              q: '좌표평면 위의 점 P 의 좌표를 구하세요.',
              fig: fig(P),
              answer: { type: 'fields', fields: [{ label: 'x좌표', value: x }, { label: 'y좌표', value: y }] },
              steps: [`점 P 에서 $x$축에 수선을 내리면 $${x}$, $y$축에 수선을 내리면 $${y}$`, `P$(${x}, ${y})$`],
            };
          }
          if (level === 2) {
            const x = r.nonzero(-5, 5);
            const y = r.nonzero(-5, 5);
            const kind = r.pick(['x축', 'y축', '원점']);
            const [qx, qy] = kind === 'x축' ? [x, -y] : kind === 'y축' ? [-x, y] : [-x, -y];
            return {
              q: `점 A$(${x}, ${y})$ 와 ${kind}에 대하여 대칭인 점 B 의 좌표를 구하세요.`,
              fig: plane().point(x, y, 'A').toString(),
              answer: { type: 'fields', fields: [{ label: 'x좌표', value: qx }, { label: 'y좌표', value: qy }] },
              steps: [kind === 'x축' ? '$x$축 대칭: $y$좌표의 부호만 바뀝니다.' : kind === 'y축' ? '$y$축 대칭: $x$좌표의 부호만 바뀝니다.' : '원점 대칭: 두 좌표의 부호가 모두 바뀝니다.', `B$(${qx}, ${qy})$`],
            };
          }
          for (;;) {
            const pts: [number, number][] = [
              [r.int(-5, 5), r.int(-5, 5)],
              [r.int(-5, 5), r.int(-5, 5)],
              [r.int(-5, 5), r.int(-5, 5)],
            ];
            if (r.chance(0.6)) pts[1][1] = pts[0][1]; // 밑변이 수평인 경우가 많게
            const [[x1, y1], [x2, y2], [x3, y3]] = pts;
            const s2 = Math.abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1));
            if (s2 < 6 || s2 > 50) continue;
            const P = plane().polygon(pts, { fill: true });
            P.point(x1, y1, 'A').point(x2, y2, 'B').point(x3, y3, 'C');
            const area = s2 / 2;
            const bx0 = Math.min(x1, x2, x3);
            const bx1 = Math.max(x1, x2, x3);
            const by0 = Math.min(y1, y2, y3);
            const by1 = Math.max(y1, y2, y3);
            return {
              q: `세 점 A$(${x1}, ${y1})$, B$(${x2}, ${y2})$, C$(${x3}, ${y3})$ 을 꼭짓점으로 하는 삼각형 ABC 의 넓이를 구하세요.`,
              fig: fig(P),
              answer: { type: 'num', value: area },
              steps:
                y1 === y2
                  ? [`밑변 AB 의 길이: $|${x2} - ${fp(x1)}| = ${Math.abs(x2 - x1)}$`, `높이: $|${y3} - ${fp(y1)}| = ${Math.abs(y3 - y1)}$`, `넓이: $\\frac{1}{2} \\times ${Math.abs(x2 - x1)} \\times ${Math.abs(y3 - y1)} = ${area}$`]
                  : [`삼각형을 둘러싼 직사각형(가로 $${bx1 - bx0}$, 세로 $${by1 - by0}$)의 넓이에서 바깥 직각삼각형들의 넓이를 뺍니다.`, `넓이 $= ${area}$`],
              hint: '좌표를 이용해 밑변과 높이를 구하거나, 둘러싼 직사각형에서 빼 보세요.',
            };
          }
        },
      },
      {
        id: 'quadrant',
        title: '사분면',
        gen(r, level) {
          if (level === 1) {
            const z = r.chance(0.2);
            const x = z && r.chance(0.5) ? 0 : r.nonzero(-9, 9);
            const y = z && x !== 0 ? 0 : r.nonzero(-9, 9);
            const ans = quadOf(Math.sign(x), Math.sign(y));
            return {
              q: `점 $(${x}, ${y})$ 는 어느 사분면 위의 점인가요?`,
              answer: quadChoice(r, ans),
              steps: [x === 0 || y === 0 ? '좌표 중 0이 있으면 좌표축 위의 점입니다.' : `$x$좌표의 부호 $${x > 0 ? '+' : '-'}$, $y$좌표의 부호 $${y > 0 ? '+' : '-'}$`, ans],
            };
          }
          let sa: number, sb: number, cond: string, reason: string;
          if (level === 2) {
            const k = r.int(1, 4);
            sa = k === 1 || k === 4 ? 1 : -1;
            sb = k <= 2 ? 1 : -1;
            cond = `점 $(a, b)$ 가 제${k}사분면 위의 점일 때`;
            reason = `$a ${sa > 0 ? '>' : '<'} 0$, $b ${sb > 0 ? '>' : '<'} 0$`;
          } else {
            const c = r.int(0, 3);
            if (c === 0) {
              [sa, sb] = [1, -1];
              cond = '$ab < 0$, $a > b$ 일 때';
              reason = '$ab < 0$ 이면 부호가 다르고, $a > b$ 이므로 $a > 0$, $b < 0$';
            } else if (c === 1) {
              [sa, sb] = [-1, -1];
              cond = '$ab > 0$, $a + b < 0$ 일 때';
              reason = '$ab > 0$ 이면 부호가 같고, $a + b < 0$ 이므로 $a < 0$, $b < 0$';
            } else if (c === 2) {
              [sa, sb] = [-1, 1];
              cond = '$\\frac{a}{b} < 0$, $a < b$ 일 때';
              reason = '$\\frac{a}{b} < 0$ 이면 부호가 다르고, $a < b$ 이므로 $a < 0$, $b > 0$';
            } else {
              [sa, sb] = [1, 1];
              cond = '$ab > 0$, $a + b > 0$ 일 때';
              reason = '$ab > 0$ 이면 부호가 같고, $a + b > 0$ 이므로 $a > 0$, $b > 0$';
            }
          }
          const ex: { t: string; s: number }[] = [
            { t: 'a', s: sa },
            { t: '-a', s: -sa },
            { t: 'b', s: sb },
            { t: '-b', s: -sb },
            { t: 'ab', s: sa * sb },
            { t: '-ab', s: -sa * sb },
            { t: '\\frac{b}{a}', s: sa * sb },
          ];
          if (sa !== sb) ex.push({ t: 'a-b', s: sa }, { t: 'b-a', s: sb });
          else ex.push({ t: 'a+b', s: sa });
          const [e1, e2] = r.sample(ex, 2);
          const ans = quadOf(e1.s, e2.s);
          return {
            q: `${cond}, 점 $(${e1.t}, ${e2.t})$ 는 어느 사분면 위의 점인가요?`,
            answer: quadChoice(r, ans),
            steps: [reason, `$${e1.t} ${e1.s > 0 ? '>' : '<'} 0$, $${e2.t} ${e2.s > 0 ? '>' : '<'} 0$`, ans],
          };
        },
      },
      {
        id: 'direct',
        title: '정비례',
        gen(r, level) {
          if (level === 1) {
            const a = r.nonzero(-6, 6);
            const p = r.nonzero(-5, 5);
            let s = r.nonzero(-9, 9);
            if (s === p) s = p + 1 || 2;
            return {
              q: `$y$ 가 $x$ 에 정비례하고, $x = ${p}$ 일 때 $y = ${a * p}$ 입니다. $x = ${s}$ 일 때 $y$ 의 값을 구하세요.`,
              answer: { type: 'num', value: a * s },
              steps: [`$y = ax$ 에 대입: $${a * p} = ${p === 1 ? '' : p === -1 ? '-' : p}a$, $a = ${a}$`, `$y = ${termsTex([{ c: a, v: 'x' }])}$ 에 $x = ${s}$ 대입: $y = ${a * s}$`],
            };
          }
          if (level === 2) {
            for (;;) {
              const p = r.int(1, 5) * r.sign();
              const q = r.nonzero(-5, 5);
              if (gcd(Math.abs(p), Math.abs(q)) !== 1 || Math.abs(p) === 1) continue;
              const a = new F(q, p);
              const s = p * r.pick([2, -2, 3, -1]);
              if (Math.abs(s) > 12) continue;
              const P = plane();
              P.fn((x) => a.value * x).point(p, q, `(${p}, ${q})`);
              const k = a.mul(s);
              return {
                q: `그림은 $y = ax$ 의 그래프입니다. 점 $(${s}, k)$ 가 이 그래프 위에 있을 때, $k$ 의 값을 구하세요.`,
                fig: fig(P),
                answer: { type: 'num', value: k.value },
                steps: [`그래프가 점 $(${p}, ${q})$ 를 지나므로 $${q} = ${p}a$, $a = ${a.tex()}$`, `$k = ${a.tex()} \\times ${fp(s)} = ${k.tex()}$`],
              };
            }
          }
          for (;;) {
            const k = r.int(2, 6);
            const ak = r.int(1, 8);
            const a = new F(ak, k);
            if (gcd(k, ak) === k && ak > k * 2) continue;
            const S = new F(k * ak, 2);
            const P = new Plane(-1, 7, -1, 9, { w: 220, h: 240 });
            P.fn((x) => a.value * x)
              .seg(k, 0, k, ak, { dash: true })
              .point(k, ak, 'A')
              .point(k, 0, 'B', { dy: 12 });
            return {
              q: `그림과 같이 정비례 관계 $y = ax$ $(a > 0)$ 의 그래프 위의 점 A 의 $x$좌표가 $${k}$ 이고, 점 A 에서 $x$축에 내린 수선의 발을 B 라 하면 삼각형 AOB 의 넓이가 $${S.tex()}$ 입니다. 상수 $a$ 의 값을 구하세요.`,
              fig: fig(P),
              answer: { type: 'num', value: a.value, display: 'frac' },
              steps: [`A$(${k}, ${k}a)$ 이므로 $\\overline{OB} = ${k}$, $\\overline{AB} = ${k}a$`, `$\\frac{1}{2} \\times ${k} \\times ${k}a = ${S.tex()}$`, `$a = ${a.tex()}$`],
            };
          }
        },
      },
      {
        id: 'inverse',
        title: '반비례',
        gen(r, level) {
          if (level === 1) {
            const a = r.pick([6, 8, 12, 18, 24, 30, 36]) * r.sign();
            const ds = divisors(Math.abs(a));
            const p = r.pick(ds) * r.sign();
            let s = r.pick(ds) * r.sign();
            if (s === p) s = -s;
            return {
              q: `$y$ 가 $x$ 에 반비례하고, $x = ${p}$ 일 때 $y = ${a / p}$ 입니다. $x = ${s}$ 일 때 $y$ 의 값을 구하세요.`,
              answer: { type: 'num', value: a / s },
              steps: [`$xy = a$ (일정): $a = ${fp(p)} \\times ${fp(a / p)} = ${a}$`, `$y = \\frac{${a}}{x}$ 에 $x = ${s}$ 대입: $y = ${a / s}$`].map((t) => t.replace('\\frac{-', '-\\frac{')),
            };
          }
          if (level === 2) {
            const a = r.pick([4, 6, 8, 12]) * r.sign();
            const ds = divisors(Math.abs(a)).filter((d) => d <= 6 && Math.abs(a) / d <= 6);
            const p = r.pick(ds);
            const q = a / p;
            const P = plane();
            P.fn((x) => a / x, { b: -0.05 }).fn((x) => a / x, { a: 0.05 }).point(p, q, `(${p}, ${q})`);
            const s = r.pick(divisors(Math.abs(a)).filter((d) => d !== p)) * r.sign();
            return {
              q: `그림은 $y = \\frac{a}{x}$ 의 그래프입니다. 점 $(${s}, k)$ 가 이 그래프 위에 있을 때, $k$ 의 값을 구하세요.`,
              fig: fig(P),
              answer: { type: 'num', value: a / s },
              steps: [`그래프가 점 $(${p}, ${q})$ 를 지나므로 $a = ${p} \\times ${fp(q)} = ${a}$`, `$k = \\frac{${a}}{${fp(s)}} = ${a / s}$`.replace('\\frac{-', '-\\frac{')],
            };
          }
          if (r.chance(0.5)) {
            const a = r.pick([6, 8, 10, 12, 16, 18, 20, 24, 28, 30, 36]) * r.sign();
            const cnt = divisors(Math.abs(a)).length * 2;
            return {
              q: `반비례 관계 $y = ${a < 0 ? '-' : ''}\\frac{${Math.abs(a)}}{x}$ 의 그래프 위의 점 중에서 $x$좌표와 $y$좌표가 모두 정수인 점의 개수를 구하세요.`,
              answer: { type: 'num', value: cnt, unit: '개' },
              steps: [`$x$ 는 $${Math.abs(a)}$ 의 약수 또는 그 약수에 $-$ 를 붙인 수여야 합니다.`, `$${Math.abs(a)}$ 의 약수: $${divisors(Math.abs(a)).join(', ')}$ ($${cnt / 2}$ 개)`, `음수까지 $2 \\times ${cnt / 2} = ${cnt}$ 개`],
              hint: '$x$ 가 음수인 경우도 잊지 마세요.',
            };
          }
          const a = r.pick([4, 6, 8, 10, 12, 14, 15, 16, 18, 20, 24]);
          const px = r.pick(divisors(a).filter((d) => d <= 8 && a / d <= 8));
          const P = new Plane(-1, 9, -1, 9, { w: 220, h: 220 });
          const py = a / px;
          P.fn((x) => a / x, { a: 0.3 })
            .polygon(
              [
                [0, 0],
                [px, 0],
                [px, py],
                [0, py],
              ].map(([x, y]) => [Math.min(x, 9), Math.min(y, 9)] as [number, number]),
              { fill: true },
            )
            .point(Math.min(px, 9), Math.min(py, 9), 'P');
          return {
            q: `그림과 같이 반비례 관계 $y = \\frac{a}{x}$ $(x > 0)$ 의 그래프 위의 한 점 P 에서 $x$축, $y$축에 각각 수선을 그어 만든 직사각형의 넓이가 $${a}$ 입니다. 상수 $a$ 의 값을 구하세요.`,
            fig: fig(P),
            answer: { type: 'num', value: a },
            steps: ['점 P 의 좌표를 $(p, \\frac{a}{p})$ 라 하면', `직사각형의 넓이 $= p \\times \\frac{a}{p} = a$`, `$a > 0$ 이므로 $a = ${a}$`],
            hint: '반비례에서는 $xy$ 가 일정해요.',
          };
        },
      },
      {
        id: 'prop-word',
        title: '정비례·반비례의 활용',
        gen(r, level) {
          const name = r.pick(NAMES);
          if (level === 1) {
            if (r.chance(0.5)) {
              const a = r.int(2, 9);
              const t = r.int(3, 20);
              return {
                q: `빈 물통에 1분에 $${a}$ L 씩 물을 넣습니다. $x$ 분 동안 넣은 물의 양을 $y$ L 라 할 때, $${t}$ 분 동안 넣은 물의 양을 구하세요.`,
                answer: { type: 'num', value: a * t, unit: 'L' },
                steps: [`$y = ${a}x$ (정비례)`, `$x = ${t}$ 일 때 $y = ${a} \\times ${t} = ${a * t}$`],
              };
            }
            const a = r.int(8, 18);
            const y = a * r.int(5, 30);
            return {
              q: `휘발유 1L 로 $${a}$ km 를 가는 자동차가 있습니다. 휘발유 $x$ L 로 갈 수 있는 거리를 $y$ km 라 할 때, $${y}$ km 를 가려면 휘발유가 몇 L 필요한지 구하세요.`,
              answer: { type: 'num', value: y / a, unit: 'L' },
              steps: [`$y = ${a}x$`, `$${y} = ${a}x$, $x = ${y / a}$`],
            };
          }
          if (level === 2) {
            if (r.chance(0.5)) {
              const a = r.pick([12, 15, 18, 20, 24, 30, 36]);
              const b = r.int(2, 6);
              const ab = a * b;
              const c = r.pick(divisors(ab).filter((d) => d >= 8 && d !== a && d <= 60));
              return {
                q: `서로 맞물려 돌아가는 두 톱니바퀴 A, B 가 있습니다. 톱니가 $${a}$ 개인 A 가 1분에 $${b}$ 번 회전할 때, 톱니가 $x$ 개인 B 는 1분에 $y$ 번 회전합니다. B 의 톱니가 $${c}$ 개일 때 B 는 1분에 몇 번 회전하는지 구하세요.`,
                answer: { type: 'num', value: ab / c, unit: '번' },
                steps: [`맞물린 톱니 수가 같으므로 $${a} \\times ${b} = xy$, $y = \\frac{${ab}}{x}$`, `$x = ${c}$ 일 때 $y = \\frac{${ab}}{${c}} = ${ab / c}$`],
                hint: '(톱니 수) × (회전 수) 가 같아요.',
              };
            }
            const V = r.pick([60, 72, 84, 90, 96, 120]);
            const c = r.pick(divisors(V).filter((d) => d >= 3 && d <= 20));
            return {
              q: `$${V}$ L 들이 물통에 1분에 $x$ L 씩 물을 넣으면 가득 채우는 데 $y$ 분이 걸립니다. 1분에 $${c}$ L 씩 넣으면 몇 분이 걸리는지 구하세요.`,
              answer: { type: 'num', value: V / c, unit: '분' },
              steps: [`$xy = ${V}$ 이므로 $y = \\frac{${V}}{x}$ (반비례)`, `$x = ${c}$ 일 때 $y = ${V / c}$`],
            };
          }
          const S = r.pick([24, 36, 48, 60]);
          const D = r.pick([60, 120, 150]);
          const a = r.int(3, 9) * 100;
          const n = r.int(3, 8);
          const poly = ['', '', '', '삼', '사', '오', '육', '칠', '팔'][n];
          const inverse = [`넓이가 $${S}$ cm² 인 직사각형의 가로 $x$ cm 와 세로 $y$ cm`, `$${D}$ km 를 시속 $x$ km 로 갈 때 걸리는 시간 $y$ 시간`, `사탕 $${S}$ 개를 $x$ 명이 똑같이 나누어 가질 때 한 명이 받는 사탕 $y$ 개`];
          const direct = [`한 자루에 $${a}$ 원인 연필 $x$ 자루의 값 $y$ 원`, `한 변의 길이가 $x$ cm 인 정${poly}각형의 둘레 $y$ cm`, `시속 $${D / 2}$ km 로 $x$ 시간 동안 달린 거리 $y$ km`];
          const neither = [`${name}보다 $${n}$ 살 많은 형의 나이 $x$ 세와 ${name}의 나이 $y$ 세`, `둘레가 $${S}$ cm 인 직사각형의 가로 $x$ cm 와 세로 $y$ cm`, `$${a * 10}$ 원으로 $x$ 원짜리 물건을 사고 남은 돈 $y$ 원`];
          const wantInv = r.chance(0.5);
          const ans = r.pick(wantInv ? inverse : direct);
          const wr = r.sample([...(wantInv ? direct : inverse), ...neither], 4);
          return {
            q: `다음 중 $y$ 가 $x$ 에 **${wantInv ? '반비례' : '정비례'}**하는 것은?`,
            answer: textChoices(r, ans, wr),
            steps: [wantInv ? '$xy$ 가 일정하면 반비례, 즉 $y = \\frac{a}{x}$ 꼴입니다.' : '$\\frac{y}{x}$ 가 일정하면 정비례, 즉 $y = ax$ 꼴입니다.', `정답: ${ans}`],
            hint: '각 상황을 $y$ 에 대한 식으로 나타내 보세요.',
          };
        },
      },
    ],
  },
};

