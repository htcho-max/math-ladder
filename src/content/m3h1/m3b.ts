// 중3-2: 삼각비, 원의 성질, 통계
import type { ContentMap } from '../../core/types';
import { numChoices } from '../../core/tex';
import { F } from '../../core/frac';
import { round, lcm } from '../../core/nt';
import { Plane } from '../../core/fig';
import { NAMES, mc, tc, geo, triples, onCircle, figStr, isSq, ga } from './util';

const deg = (x: number) => `${x}^\\circ`;
const ov = (s: string) => `\\overline{${s}}`;
const ang = (s: string) => `\\angle ${s}`;
const TRI = triples(52);

// ───────────── a + b√2 + c√3 + d√6 (유리 계수) ─────────────
type Q = [F, F, F, F];
const Q0 = (): Q => [new F(0), new F(0), new F(0), new F(0)];
const qadd = (x: Q, y: Q): Q => x.map((v, i) => v.add(y[i])) as Q;
const qsub = (x: Q, y: Q): Q => x.map((v, i) => v.sub(y[i])) as Q;
function qmul(x: Q, y: Q): Q {
  // 기저 1, √2, √3, √6 의 곱 표
  const out = Q0();
  const T: [number, number][][] = [
    [[0, 1], [1, 1], [2, 1], [3, 1]],
    [[1, 1], [0, 2], [3, 1], [2, 2]],
    [[2, 1], [3, 1], [0, 3], [1, 3]],
    [[3, 1], [2, 2], [1, 3], [0, 6]],
  ];
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      const [k, m] = T[i][j];
      out[k] = out[k].add(x[i].mul(y[j]).mul(m));
    }
  return out;
}
function qtex(x: Q): string {
  const D = x.reduce((acc, f) => lcm(acc, f.d), 1);
  const nums = x.map((f) => (f.n * D) / f.d);
  const rad = ['', '\\sqrt{2}', '\\sqrt{3}', '\\sqrt{6}'];
  let neg = nums.every((n) => n <= 0) && nums.some((n) => n < 0);
  const ns = neg ? nums.map((n) => -n) : nums;
  let body = '';
  ns.forEach((n, i) => {
    if (n === 0) return;
    const a = Math.abs(n);
    const t = i === 0 ? `${a}` : a === 1 ? rad[i] : `${a}${rad[i]}`;
    body += (body === '' ? (n < 0 ? '-' : '') : n < 0 ? '-' : '+') + t;
  });
  if (body === '') {
    neg = false;
    body = '0';
  }
  const s = D === 1 ? body : `\\frac{${body}}{${D}}`;
  return (neg ? '-' : '') + s;
}
const qr = (a: number, b = 0, c = 0, d = 0, den = 1): Q => [new F(a, den), new F(b, den), new F(c, den), new F(d, den)];

type Fn = 'sin' | 'cos' | 'tan';
function trigQ(fn: Fn, a: 30 | 45 | 60): Q {
  const t: Record<Fn, Record<number, Q>> = {
    sin: { 30: qr(1, 0, 0, 0, 2), 45: qr(0, 1, 0, 0, 2), 60: qr(0, 0, 1, 0, 2) },
    cos: { 30: qr(0, 0, 1, 0, 2), 45: qr(0, 1, 0, 0, 2), 60: qr(1, 0, 0, 0, 2) },
    tan: { 30: qr(0, 0, 1, 0, 3), 45: qr(1), 60: qr(0, 0, 1) },
  };
  return t[fn][a];
}
const SPECIAL = [30, 45, 60] as const;

/** 원 위의 점들 그림. pts: 이름 → 각도(도), extra: 원 밖 점 */
function circFig(on: Record<string, number>, o: { segs?: [string, string][]; center?: boolean; extra?: Record<string, [number, number]>; angles?: [string, string, string, string][]; right?: [string, string, string][]; hide?: string[] } = {}) {
  const pts: Record<string, [number, number]> = { O: [0, 0] };
  for (const k in on) pts[k] = onCircle(on[k], 1);
  Object.assign(pts, o.extra ?? {});
  return geo(pts, { circles: [{ c: 'O', r: 1 }], segs: o.segs, dots: o.center === false ? [] : ['O'], hide: o.center === false ? ['O', ...(o.hide ?? [])] : o.hide, angles: o.angles, right: o.right, w: 220, h: 200 });
}

export const m3b: ContentMap = {
  // ───────────────────────── 삼각비 ─────────────────────────
  'm3b-1': {
    concepts: [
      {
        title: '삼각비의 뜻',
        body: '$\\angle C=90^\\circ$ 인 직각삼각형 $ABC$ 에서 $\\angle A$ 에 대하여\n$$\\sin A=\\frac{\\overline{BC}}{\\overline{AB}},\\quad \\cos A=\\frac{\\overline{AC}}{\\overline{AB}},\\quad \\tan A=\\frac{\\overline{BC}}{\\overline{AC}}$$\n(높이/빗변, 밑변/빗변, 높이/밑변) 닮은 직각삼각형에서는 삼각비가 같다 (중2 닮음).',
        example: { q: '세 변이 $3,4,5$ 이고 $\\angle A$ 의 대변이 $3$ 일 때 $\\sin A$ 는?', a: '$\\frac{3}{5}$' },
      },
      {
        title: '특수각의 삼각비',
        body: '- $\\sin30^\\circ=\\frac{1}{2}$, $\\cos30^\\circ=\\frac{\\sqrt{3}}{2}$, $\\tan30^\\circ=\\frac{\\sqrt{3}}{3}$\n- $\\sin45^\\circ=\\cos45^\\circ=\\frac{\\sqrt{2}}{2}$, $\\tan45^\\circ=1$\n- $\\sin60^\\circ=\\frac{\\sqrt{3}}{2}$, $\\cos60^\\circ=\\frac{1}{2}$, $\\tan60^\\circ=\\sqrt{3}$\n세 변의 비: $30^\\circ$-$60^\\circ$-$90^\\circ$ 는 $1:\\sqrt{3}:2$, $45^\\circ$-$45^\\circ$-$90^\\circ$ 는 $1:1:\\sqrt{2}$',
      },
      {
        title: '삼각비의 표와 활용',
        body: '$0^\\circ\\sim90^\\circ$ 의 삼각비 값은 삼각비의 표에서 찾는다.\n- 빗변 $c$, 한 예각 $A$ 이면 대변 $=c\\sin A$, 이웃변 $=c\\cos A$\n- 높이 구하기: (거리)$\\times\\tan$(올려본각)',
      },
      {
        title: '삼각형의 넓이',
        body: '두 변 $a$, $b$ 와 끼인각 $C$ 를 알 때\n$$S=\\frac{1}{2}ab\\sin C\\ (C\\text{ 가 예각}),\\qquad S=\\frac{1}{2}ab\\sin(180^\\circ-C)\\ (C\\text{ 가 둔각})$$\n평행사변형의 넓이는 $ab\\sin x$',
      },
    ],
    skills: [
      {
        id: 'ratio-from-sides',
        title: '변의 길이로 삼각비 구하기',
        gen(r, level) {
          const [a, b, c] = r.pick(TRI.filter((t) => t[2] <= (level === 1 ? 26 : 52)));
          const sw = r.chance(0.5);
          const bc = sw ? a : b,
            ac = sw ? b : a;
          const C: [number, number] = [0, 0],
            B: [number, number] = [0, bc],
            A: [number, number] = [ac, 0];
          const fn = r.pick(['sin', 'cos', 'tan'] as Fn[]);
          const val = fn === 'sin' ? new F(bc, c) : fn === 'cos' ? new F(ac, c) : new F(bc, ac);
          if (level === 1) {
            return {
              q: `$${ang('C')}=90^\\circ$ 인 직각삼각형 $ABC$ 에서 $${ov('AB')}=${c}$, $${ov('BC')}=${bc}$, $${ov('AC')}=${ac}$ 일 때, $\\${fn} A$ 의 값을 구하세요.`,
              fig: geo({ A, B, C }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'A']], right: [['C', 'A', 'B']], sides: [['A', 'B', String(c)], ['B', 'C', String(bc)], ['A', 'C', String(ac)]], w: 230, h: 180 }),
              answer: { type: 'num', value: val.value, display: 'frac' },
              steps: [fn === 'sin' ? `$\\sin A=\\frac{${ov('BC')}}{${ov('AB')}}$` : fn === 'cos' ? `$\\cos A=\\frac{${ov('AC')}}{${ov('AB')}}$` : `$\\tan A=\\frac{${ov('BC')}}{${ov('AC')}}$`, `$=${val.tex()}$`],
            };
          }
          if (level === 2) {
            const sinA = new F(bc, c),
              cosA = new F(ac, c),
              tanA = new F(bc, ac);
            return {
              q: `$${ang('C')}=90^\\circ$ 인 직각삼각형 $ABC$ 에서 $${ov('AB')}=${c}$, $${ov('AC')}=${ac}$ 일 때, $\\${fn} A$ 의 값은?`,
              fig: geo({ A, B, C }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'A']], right: [['C', 'A', 'B']], sides: [['A', 'B', String(c)], ['A', 'C', String(ac)]], w: 230, h: 180 }),
              answer: mc(r, val.tex(), [sinA, cosA, tanA, new F(ac, bc), new F(c, ac), new F(c, bc)].map((x) => x.tex())),
              steps: [`$${ov('BC')}=\\sqrt{${c}^2-${ac}^2}=${bc}$`, `$\\${fn} A=${val.tex()}$`],
            };
          }
          const sinA = new F(bc, c);
          const ask = r.pick(['cos+tan', 'cos*tan', 'sin-cos']);
          const cosA = new F(ac, c),
            tanA = new F(bc, ac);
          const v = ask === 'cos+tan' ? cosA.add(tanA) : ask === 'cos*tan' ? cosA.mul(tanA) : sinA.sub(cosA);
          const expr = ask === 'cos+tan' ? '\\cos A+\\tan A' : ask === 'cos*tan' ? '\\cos A\\times\\tan A' : '\\sin A-\\cos A';
          return {
            q: `$${ang('C')}=90^\\circ$ 인 직각삼각형 $ABC$ 에서 $\\sin A=${sinA.tex()}$ 일 때, $${expr}$ 의 값을 구하세요.`,
            answer: { type: 'num', value: v.value, display: 'frac' },
            steps: [`빗변을 $${c}k$, 대변을 $${bc}k$ 로 놓으면 이웃변은 $\\sqrt{${c * c}-${bc * bc}}\\,k=${ac}k$`, `$\\cos A=${cosA.tex()}$, $\\tan A=${tanA.tex()}$`, `$${expr}=${v.tex()}$`],
          };
        },
      },
      {
        id: 'special-values',
        title: '특수각의 삼각비 계산',
        gen(r, level) {
          const fns: Fn[] = ['sin', 'cos', 'tan'];
          if (level === 3) {
            const target = r.pick(SPECIAL);
            const fn = r.pick(fns);
            const m = r.pick([1, 2, 3]);
            const off = r.int(-10, 15) * 1;
            // fn(m x + off) = value(target), 0 < m x + off < 90
            if ((target - off) % m !== 0 || (target - off) / m <= 0) return this.gen(r, level);
            const x = (target - off) / m;
            const inside = `${m === 1 ? '' : m}x${off === 0 ? '' : off > 0 ? '+' + off : off}`;
            return {
              q: `$\\${fn}(${inside})^\\circ=${qtex(trigQ(fn, target))}$ 일 때, $x$ 의 값을 구하세요. (단, $0<${inside}<90$)`,
              answer: { type: 'num', value: x },
              steps: [`$\\${fn}${deg(target)}=${qtex(trigQ(fn, target))}$ 이므로 $${inside}=${target}$`, `$x=${x}$`],
            };
          }
          const t1 = { f: r.pick(fns), a: r.pick(SPECIAL) };
          const t2 = { f: r.pick(fns), a: r.pick(SPECIAL) };
          const t3 = { f: r.pick(fns), a: r.pick(SPECIAL) };
          const op = level === 1 ? r.pick(['+', '\\times']) : r.pick(['+', '-']);
          const calc = (A: Q, B: Q, C: Q) => (level === 1 ? (op === '+' ? qadd(A, B) : qmul(A, B)) : op === '+' ? qadd(qmul(A, B), C) : qsub(qmul(A, B), C));
          const v = calc(trigQ(t1.f, t1.a), trigQ(t2.f, t2.a), trigQ(t3.f, t3.a));
          const T = (t: { f: Fn; a: number }) => `\\${t.f}${deg(t.a)}`;
          const expr = level === 1 ? `${T(t1)}${op}${T(t2)}` : `${T(t1)}\\times${T(t2)}${op}${T(t3)}`;
          const swapF = (f: Fn): Fn => (f === 'sin' ? 'cos' : f === 'cos' ? 'sin' : 'tan');
          const swapA = (a: 30 | 45 | 60) => (a === 30 ? 60 : a === 60 ? 30 : 45) as 30 | 45 | 60;
          const wr = [
            calc(trigQ(swapF(t1.f), t1.a), trigQ(t2.f, t2.a), trigQ(t3.f, t3.a)),
            calc(trigQ(t1.f, t1.a), trigQ(swapF(t2.f), t2.a), trigQ(t3.f, t3.a)),
            calc(trigQ(t1.f, swapA(t1.a)), trigQ(t2.f, t2.a), trigQ(t3.f, t3.a)),
            calc(trigQ(t1.f, t1.a), trigQ(t2.f, swapA(t2.a)), trigQ(swapF(t3.f), t3.a)),
            calc(trigQ(t1.f, t1.a), trigQ(t2.f, t2.a), trigQ(t3.f, swapA(t3.a))),
            qadd(v, qr(1)),
            qadd(v, qr(1, 0, 0, 0, 2)),
          ].map(qtex);
          return {
            q: `$${expr}$ 의 값은?`,
            answer: mc(r, qtex(v), wr),
            steps: [`${[t1, t2, ...(level === 1 ? [] : [t3])].map((t) => `$${T(t)}=${qtex(trigQ(t.f, t.a))}$`).join(', ')}`, `$${expr}=${qtex(v)}$`],
          };
        },
      },
      {
        id: 'side-length',
        title: '삼각비로 변의 길이 구하기',
        gen(r, level) {
          if (level === 1) {
            const k = r.int(2, 9);
            const a = r.pick([30, 60] as const);
            const askOpp = r.chance(0.5);
            const hyp = 2 * k;
            // ∠B = a, ∠C = 90, AB = hyp. AC = hyp sin a, BC = hyp cos a
            const sinQ = trigQ('sin', a),
              cosQ = trigQ('cos', a);
            const ac = qmul(qr(hyp), sinQ),
              bc = qmul(qr(hyp), cosQ);
            const right = qtex(askOpp ? ac : bc);
            const Bp: [number, number] = [0, 0],
              C: [number, number] = [hyp * Math.cos((a * Math.PI) / 180), 0],
              A: [number, number] = [C[0], hyp * Math.sin((a * Math.PI) / 180)];
            return {
              q: `$${ang('C')}=90^\\circ$ 인 직각삼각형 $ABC$ 에서 $${ov('AB')}=${hyp}$, $${ang('B')}=${deg(a)}$ 일 때, $${askOpp ? ov('AC') : ov('BC')}$ 의 길이는?`,
              fig: geo({ A, B: Bp, C }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'A']], right: [['C', 'A', 'B']], angles: [['B', 'A', 'C', `${a}°`]], w: 230, h: 180 }),
              answer: mc(r, right, [qtex(askOpp ? bc : ac), `${hyp}`, qtex(qmul(qr(hyp), trigQ('tan', a))), qtex(qmul(qr(k), qr(0, 1))), `${k}\\sqrt{2}`, `${hyp}\\sqrt{3}`]),
              steps: [`$${askOpp ? ov('AC') : ov('BC')}=${ov('AB')}\\${askOpp ? 'sin' : 'cos'} B=${hyp}\\times\\${askOpp ? 'sin' : 'cos'}${deg(a)}$`, `$=${right}$`],
            };
          }
          if (level === 2) {
            const [a, b, c] = r.pick(TRI.filter((t) => t[2] <= 52));
            const k = r.int(1, 2);
            return {
              q: `$${ang('C')}=90^\\circ$ 인 직각삼각형 $ABC$ 에서 $${ov('BC')}=${b * k}$, $\\tan B=${new F(a, b).tex()}$ 일 때, $${ov('AC')}$ 와 $${ov('AB')}$ 의 길이를 구하세요.`,
              answer: { type: 'fields', fields: [{ label: 'AC', value: a * k }, { label: 'AB', value: c * k }] },
              steps: [`$\\tan B=\\frac{${ov('AC')}}{${ov('BC')}}$ 이므로 $${ov('AC')}=${b * k}\\times${new F(a, b).tex()}=${a * k}$`, `$${ov('AB')}=\\sqrt{${b * k}^2+${a * k}^2}=${c * k}$`],
            };
          }
          const d = r.int(3, 20) * 3;
          const e = r.pick([1.5, 1.6, 1.7, 2]);
          const a = r.pick([30, 45, 60] as const);
          const name = r.pick(NAMES);
          const q = `눈높이가 $${e}\\,\\text{m}$ 인 ${ga(name)} 나무로부터 $${d}\\,\\text{m}$ 떨어진 곳에서 나무 꼭대기를 올려본각의 크기가 $${deg(a)}$ 였다. 나무의 높이는 몇 m 인가요?`;
          if (a === 45) {
            return {
              q,
              answer: { type: 'num', value: round(d + e, 4), unit: 'm', display: 'dec' },
              steps: [`(나무의 높이) $=${d}\\tan45^\\circ+${e}$`, `$=${d}+${e}=${round(d + e, 4)}\\,(\\text{m})$`],
            };
          }
          const c = a === 60 ? d : d / 3;
          const c2 = a === 60 ? d / 3 : d;
          const s3 = (k: number) => (k === 1 ? '\\sqrt{3}' : `${k}\\sqrt{3}`);
          const right = `${e}+${s3(c)}`;
          return {
            q,
            answer: mc(r, right, [s3(c), `${e}+${s3(c2)}`, `${e}+${c}`, `${e}+${s3(2 * c)}`, `${round(e + 1, 2)}+${s3(c)}`]),
            steps: [`(나무의 높이) $=${d}\\tan${deg(a)}+${e}$`, `$\\tan${deg(a)}=${qtex(trigQ('tan', a))}$ 이므로 $${right}\\,(\\text{m})$`],
          };
        },
      },
      {
        id: 'area',
        title: '삼각형과 평행사변형의 넓이',
        gen(r, level) {
          const a = r.int(2, 12),
            b = r.int(2, 12);
          if (level === 1) {
            const C = r.pick([30, 150]);
            const S = new F(a * b, 4);
            return {
              q: `$\\triangle ABC$ 에서 $${ov('CA')}=${a}\\,\\text{cm}$, $${ov('CB')}=${b}\\,\\text{cm}$, $${ang('C')}=${deg(C)}$ 일 때, $\\triangle ABC$ 의 넓이를 구하세요.`,
              answer: { type: 'num', value: S.value, unit: 'cm²' },
              steps: [C === 30 ? `$S=\\frac{1}{2}\\times${a}\\times${b}\\times\\sin30^\\circ$` : `$S=\\frac{1}{2}\\times${a}\\times${b}\\times\\sin(180^\\circ-150^\\circ)$`, `$=\\frac{1}{2}\\times${a * b}\\times\\frac{1}{2}=${S.tex()}\\,(\\text{cm}^2)$`],
            };
          }
          const C = r.pick([45, 60, 120, 135]);
          const base = (C > 90 ? 180 - C : C) as 45 | 60;
          const para = level === 3;
          const S = qmul(qr(para ? a * b : a * b, 0, 0, 0, para ? 1 : 2), trigQ('sin', base));
          const wrong = [qmul(qr(a * b, 0, 0, 0, para ? 2 : 1), trigQ('sin', base)), qmul(qr(a * b, 0, 0, 0, para ? 1 : 2), trigQ('cos', base === 45 ? 60 : 45)), qmul(qr(a * b, 0, 0, 0, para ? 1 : 2), trigQ('sin', base === 45 ? 60 : 45)), qr(a * b, 0, 0, 0, para ? 1 : 2), qmul(qr(a * b, 0, 0, 0, para ? 1 : 4), trigQ('sin', base))].map(qtex);
          return {
            q: para ? `이웃한 두 변의 길이가 $${a}\\,\\text{cm}$, $${b}\\,\\text{cm}$ 이고 그 끼인각의 크기가 $${deg(C)}$ 인 평행사변형의 넓이는?` : `$\\triangle ABC$ 에서 $${ov('CA')}=${a}\\,\\text{cm}$, $${ov('CB')}=${b}\\,\\text{cm}$, $${ang('C')}=${deg(C)}$ 일 때, $\\triangle ABC$ 의 넓이는?`,
            answer: mc(r, qtex(S), wrong),
            steps: [para ? `$S=${a}\\times${b}\\times\\sin${C > 90 ? `(180^\\circ-${deg(C)})` : deg(C)}$` : `$S=\\frac{1}{2}\\times${a}\\times${b}\\times\\sin${C > 90 ? `(180^\\circ-${deg(C)})` : deg(C)}$`, `$\\sin${deg(base)}=${qtex(trigQ('sin', base))}$ 이므로 $S=${qtex(S)}\\,(\\text{cm}^2)$`],
          };
        },
      },
      {
        id: 'trig-table',
        title: '삼각비의 표 이용하기',
        gen(r, level) {
          const a0 = r.int(20, 68);
          const angs = [a0, a0 + 1, a0 + 2];
          const v = (f: Fn, x: number) => round(f === 'sin' ? Math.sin((x * Math.PI) / 180) : f === 'cos' ? Math.cos((x * Math.PI) / 180) : Math.tan((x * Math.PI) / 180), 4);
          const table = [['각도', '$\\sin$', '$\\cos$', '$\\tan$'], ...angs.map((x) => [`$${deg(x)}$`, `$${v('sin', x).toFixed(4)}$`, `$${v('cos', x).toFixed(4)}$`, `$${v('tan', x).toFixed(4)}$`])];
          const A = r.pick(angs);
          if (level === 1) {
            const f = r.pick(['sin', 'cos', 'tan'] as Fn[]);
            const val = v(f, A);
            const others = angs.filter((x) => x !== A);
            return {
              q: `삼각비의 표를 보고 $\\${f} x=${val.toFixed(4)}$ 를 만족하는 $x$ 의 값을 구하세요.`,
              table,
              answer: { type: 'num', value: A, unit: '°' },
              steps: [`표의 $\\${f}$ 열에서 $${val.toFixed(4)}$ 를 찾으면 $x=${deg(A)}$`, `(참고: $${others.map((o) => `\\${f}${deg(o)}=${v(f, o).toFixed(4)}`).join(',\\ ')}$)`],
            };
          }
          const c = r.int(1, 9) * 10;
          const f = r.pick(['sin', 'cos'] as Fn[]);
          const val = v(f, A);
          const len = round(c * val, 4);
          if (level === 2) {
            return {
              q: `$${ang('C')}=90^\\circ$ 인 직각삼각형 $ABC$ 에서 $${ov('AB')}=${c}$, $${ang('A')}=${deg(A)}$ 일 때, 아래 표를 이용하여 $${f === 'sin' ? ov('BC') : ov('AC')}$ 의 길이를 구하세요.`,
              table,
              answer: { type: 'num', value: len, display: 'dec' },
              steps: [`$${f === 'sin' ? ov('BC') : ov('AC')}=${c}\\${f}${deg(A)}$`, `$=${c}\\times${val.toFixed(4)}=${len}$`],
            };
          }
          const d = r.int(1, 9) * 10;
          const tv = v('tan', A);
          const h = round(d * tv, 4);
          return {
            q: `건물로부터 $${d}\\,\\text{m}$ 떨어진 지면의 한 지점에서 건물의 꼭대기를 올려본각의 크기가 $${deg(A)}$ 이었다. 아래 표를 이용하여 건물의 높이를 구하세요. (단위: m)`,
            table,
            answer: { type: 'num', value: h, unit: 'm', display: 'dec' },
            steps: [`(높이) $=${d}\\tan${deg(A)}$`, `$=${d}\\times${tv.toFixed(4)}=${h}\\,(\\text{m})$`],
          };
        },
      },
    ],
  },

  // ───────────────────────── 원의 성질 ─────────────────────────
  'm3b-2': {
    concepts: [
      {
        title: '원의 중심과 현',
        body: '- 원의 중심에서 현에 내린 수선은 그 현을 **이등분**한다.\n- 현의 수직이등분선은 원의 중심을 지난다.\n- 중심에서 같은 거리에 있는 두 현의 길이는 같다.\n피타고라스 정리로 $\\left(\\frac{\\text{현}}{2}\\right)^2+d^2=r^2$',
      },
      {
        title: '원의 접선',
        body: '- 접선은 접점을 지나는 반지름과 **수직**이다.\n- 원 밖의 한 점에서 그은 두 접선의 길이는 같다: $\\overline{PA}=\\overline{PB}$\n- 원에 외접하는 사각형: $\\overline{AB}+\\overline{CD}=\\overline{AD}+\\overline{BC}$',
      },
      {
        title: '원주각',
        body: '- 한 호에 대한 원주각의 크기는 그 호에 대한 중심각의 크기의 $\\frac{1}{2}$\n- 한 호에 대한 원주각의 크기는 모두 같다.\n- 반원에 대한 원주각은 $90^\\circ$\n- 원주각의 크기와 호의 길이는 정비례한다.',
        example: { q: '중심각이 $100^\\circ$ 인 호에 대한 원주각은?', a: '$50^\\circ$' },
      },
      {
        title: '원에 내접하는 사각형과 접선과 현이 이루는 각',
        body: '- 원에 내접하는 사각형의 마주 보는 두 각의 합은 $180^\\circ$, 한 외각의 크기는 그 내대각의 크기와 같다.\n- 원의 접선과 그 접점을 지나는 현이 이루는 각의 크기는 그 각의 내부에 있는 호에 대한 원주각의 크기와 같다.',
      },
    ],
    skills: [
      {
        id: 'chord',
        title: '원의 중심과 현의 길이',
        gen(r, level) {
          const [d, l, R] = r.pick(TRI.filter((t) => t[2] <= 30)).slice() as [number, number, number];
          const swap = r.chance(0.5);
          const dd = swap ? l : d,
            ll = swap ? d : l;
          const th = (Math.atan2(ll, dd) * 180) / Math.PI;
          const fig = circFig({ A: -90 - th, B: -90 + th }, { segs: [['A', 'B'], ['O', 'M'], ['O', 'A']], extra: { M: [0, -dd / R] }, right: [['M', 'O', 'B']] });
          if (level === 1) {
            return {
              q: `반지름의 길이가 $${R}\\,\\text{cm}$ 인 원 $O$ 의 중심에서 현 $AB$ 까지의 거리가 $${dd}\\,\\text{cm}$ 일 때, 현 $AB$ 의 길이를 구하세요.`,
              fig,
              answer: { type: 'num', value: 2 * ll, unit: 'cm' },
              steps: [`중심에서 현에 내린 수선의 발을 $M$ 이라 하면 $${ov('AM')}=\\sqrt{${R}^2-${dd}^2}=${ll}$`, `수선은 현을 이등분하므로 $${ov('AB')}=2\\times${ll}=${2 * ll}\\,\\text{cm}$`],
            };
          }
          if (level === 2) {
            return {
              q: `원 $O$ 에서 현 $AB$ 의 길이가 $${2 * ll}\\,\\text{cm}$ 이고 중심 $O$ 에서 현 $AB$ 까지의 거리가 $${dd}\\,\\text{cm}$ 일 때, 원의 반지름의 길이는?`,
              fig,
              answer: numChoices(r, R, [2 * ll, ll + dd, Math.round(Math.sqrt(4 * ll * ll + dd * dd)), R + 1].filter((x) => x !== R)),
              steps: [`$${ov('AM')}=${2 * ll}\\div2=${ll}$`, `$r=\\sqrt{${ll}^2+${dd}^2}=${R}\\,\\text{cm}$`],
            };
          }
          const h = R - dd;
          return {
            q: `깨진 원 모양 접시의 일부분이 있다. 이 조각의 현의 길이가 $${2 * ll}\\,\\text{cm}$ 이고, 현의 중점에서 호까지의 거리(현의 수직이등분선 위)가 $${h}\\,\\text{cm}$ 일 때, 원래 접시의 반지름의 길이를 구하세요.`,
            fig: circFig({ A: -90 - th, B: -90 + th }, { segs: [['A', 'B'], ['M', 'H'], ['O', 'A']], extra: { M: [0, -dd / R], H: [0, -1] } }),
            answer: { type: 'num', value: R, unit: 'cm' },
            steps: [`반지름을 $r$ 라 하면 중심에서 현까지의 거리는 $r-${h}$`, `$r^2=${ll}^2+(r-${h})^2$, $${2 * h}r=${ll * ll + h * h}$`, `$r=${R}\\,\\text{cm}$`],
          };
        },
      },
      {
        id: 'tangent',
        title: '원의 접선',
        gen(r, level) {
          if (level === 1) {
            const [a, b, c] = r.pick(TRI.filter((t) => t[2] <= 30));
            const R = a,
              t = b;
            const th = (Math.acos(R / c) * 180) / Math.PI;
            return {
              q: `원 밖의 점 $P$ 에서 원 $O$ 에 그은 접선의 접점을 $A$ 라 하자. 원의 반지름의 길이가 $${R}$, $${ov('OP')}=${c}$ 일 때, $${ov('PA')}$ 의 길이를 구하세요.`,
              fig: circFig({ A: th }, { segs: [['O', 'A'], ['O', 'P'], ['P', 'A']], extra: { P: [c / R, 0] }, right: [['A', 'O', 'P']] }),
              answer: { type: 'num', value: t },
              steps: [`접선은 접점을 지나는 반지름과 수직: $${ang('OAP')}=90^\\circ$`, `$${ov('PA')}=\\sqrt{${c}^2-${R}^2}=${t}$`],
            };
          }
          if (level === 2) {
            const x = r.int(10, 40) * 2; // 짝수로 잡아 ∠PAB 가 정수가 되게
            const half = (180 - x) / 2;
            const d = 1 / Math.sin((x / 2) * (Math.PI / 180));
            return {
              q: `원 밖의 점 $P$ 에서 원 $O$ 에 그은 두 접선의 접점을 각각 $A$, $B$ 라 하자. $${ang('APB')}=${deg(x)}$ 일 때, $${ang('AOB')}$ 와 $${ang('PAB')}$ 의 크기를 구하세요.`,
              fig: circFig({ A: 90 - x / 2 + 0, B: -(90 - x / 2) }, { segs: [['O', 'A'], ['O', 'B'], ['P', 'A'], ['P', 'B'], ['A', 'B']], extra: { P: [d, 0] } }),
              answer: { type: 'fields', fields: [{ label: '∠AOB', value: 180 - x, unit: '°' }, { label: '∠PAB', value: half, unit: '°' }] },
              steps: [`$${ang('OAP')}=${ang('OBP')}=90^\\circ$ 이므로 $${ang('AOB')}=360^\\circ-180^\\circ-${deg(x)}=${deg(180 - x)}$`, `$${ov('PA')}=${ov('PB')}$ 이므로 $${ang('PAB')}=(180^\\circ-${deg(x)})\\div2=${deg(half)}$`],
            };
          }
          const ab = r.int(5, 14),
            bc = r.int(5, 14),
            cd = r.int(5, 14);
          const ad = ab + cd - bc;
          if (ad <= 2) return this.gen(r, level);
          const per = 2 * (ab + cd);
          const askPer = r.chance(0.5);
          return {
            q: `원 $O$ 에 외접하는 사각형 $ABCD$ 에서 $${ov('AB')}=${ab}$, $${ov('BC')}=${bc}$, $${ov('CD')}=${cd}$ 일 때, ${askPer ? '사각형 $ABCD$ 의 둘레의 길이' : `$${ov('AD')}$ 의 길이`}를 구하세요.`,
            answer: { type: 'num', value: askPer ? per : ad },
            steps: [`원에 외접하는 사각형: $${ov('AB')}+${ov('CD')}=${ov('AD')}+${ov('BC')}$`, `$${ab}+${cd}=${ov('AD')}+${bc}$ 에서 $${ov('AD')}=${ad}$`, ...(askPer ? [`둘레 $=${ab}+${bc}+${cd}+${ad}=${per}$`] : [])],
          };
        },
      },
      {
        id: 'inscribed',
        title: '원주각과 중심각',
        gen(r, level) {
          if (level === 1) {
            const c = r.int(20, 80) * 2;
            const toCenter = r.chance(0.5);
            const fig = circFig({ A: -90 - c / 2, B: -90 + c / 2, P: 90 + r.int(-30, 30) }, { segs: [['P', 'A'], ['P', 'B'], ['O', 'A'], ['O', 'B']] });
            if (toCenter) {
              return {
                q: `원 $O$ 에서 $${ang('APB')}=${deg(c / 2)}$ 일 때, $${ang('AOB')}$ 의 크기를 구하세요.`,
                fig,
                answer: { type: 'num', value: c, unit: '°' },
                steps: ['(중심각) $=2\\times$(원주각)', `$${ang('AOB')}=2\\times${deg(c / 2)}=${deg(c)}$`],
              };
            }
            return {
              q: `원 $O$ 에서 $${ang('AOB')}=${deg(c)}$ 일 때, 호 $AB$ 에 대한 원주각 $${ang('APB')}$ 의 크기를 구하세요.`,
              fig,
              answer: { type: 'num', value: c / 2, unit: '°' },
              steps: ['(원주각) $=\\frac{1}{2}\\times$(중심각)', `$${ang('APB')}=\\frac{1}{2}\\times${deg(c)}=${deg(c / 2)}$`],
            };
          }
          if (level === 2) {
            if (r.chance(0.5)) {
              const x = r.int(15, 75);
              const pAng = 180 - 2 * x; // P 의 위치: ∠PAB = x → 중심각 PB = 2x
              return {
                q: `$${ov('AB')}$ 가 원 $O$ 의 지름이고 점 $P$ 는 원 위의 점이다. $${ang('PAB')}=${deg(x)}$ 일 때, $${ang('PBA')}$ 의 크기는?`,
                fig: circFig({ A: 180, B: 0, P: 2 * x }, { segs: [['A', 'B'], ['P', 'A'], ['P', 'B']], right: [['P', 'A', 'B']] }),
                answer: numChoices(r, 90 - x, [x, 2 * x, 180 - 2 * x, 90 + x].filter((v) => v > 0 && v !== 90 - x)),
                steps: [`반원에 대한 원주각이므로 $${ang('APB')}=90^\\circ$`, `$${ang('PBA')}=180^\\circ-90^\\circ-${deg(x)}=${deg(90 - x)}$`, ...(pAng ? [] : [])],
              };
            }
            const x = r.int(20, 70);
            const y = r.int(20, 70);
            return {
              q: `원 위의 네 점 $A$, $B$, $C$, $D$ 에 대하여 $${ov('AC')}$ 와 $${ov('BD')}$ 의 교점을 $P$ 라 하자. $${ang('ABD')}=${deg(x)}$, $${ang('BDC')}=${deg(y)}$ 일 때, $${ang('APD')}$ 의 크기를 구하세요.`,
              fig: circFig({ A: 160, B: 220, C: 220 + 2 * y, D: 160 - 2 * x }, { segs: [['A', 'B'], ['C', 'D'], ['A', 'C'], ['B', 'D']], center: false }),
              answer: { type: 'num', value: x + y, unit: '°' },
              steps: [`호 $BC$ 에 대한 원주각: $${ang('BAC')}=${ang('BDC')}=${deg(y)}$`, `$${ang('APD')}$ 는 $\\triangle ABP$ 의 외각이므로 $${ang('APD')}=${ang('ABP')}+${ang('BAP')}=${deg(x)}+${deg(y)}=${deg(x + y)}$`],
            };
          }
          // 내접사각형: 네 호 AB, BC, CD, DA
          let arcs: number[] = [];
          for (;;) {
            arcs = [r.int(4, 14), r.int(4, 14), r.int(4, 14)].map((v) => v * 10);
            const last = 360 - arcs.reduce((u, v) => u + v, 0);
            if (last >= 40 && last <= 160) {
              arcs.push(last);
              break;
            }
          }
          const [al, be, ga2, de] = arcs;
          const x = (be + ga2) / 2,
            y = (ga2 + de) / 2;
          const pA = 120,
            pB = pA + al,
            pC = pB + be,
            pD = pC + ga2;
          return {
            q: `사각형 $ABCD$ 가 원에 내접하고 $${ang('BAD')}=${deg(x)}$, $${ang('ABC')}=${deg(y)}$ 이다. $${ang('BCD')}$ 의 크기와 $${ang('D')}$ 의 외각의 크기를 구하세요.`,
            fig: circFig({ A: pA, B: pB, C: pC, D: pD }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A']], center: false }),
            answer: { type: 'fields', fields: [{ label: '∠BCD', value: 180 - x, unit: '°' }, { label: '∠D 의 외각', value: y, unit: '°' }] },
            steps: [`대각의 합은 $180^\\circ$: $${ang('BCD')}=180^\\circ-${deg(x)}=${deg(180 - x)}$`, `한 외각의 크기는 그 내대각의 크기와 같으므로 $${ang('D')}$ 의 외각 $=${ang('B')}=${deg(y)}$`],
          };
        },
      },
      {
        id: 'tangent-chord',
        title: '접선과 현이 이루는 각',
        gen(r, level) {
          if (level <= 2) {
            const x = r.int(30, 80);
            const y = r.int(30, 150 - x);
            // A 가 접점(아래), 접선 수평. 호 AB(∠BAT 쪽) 에 대한 원주각 = x
            const pA = -90,
              pB = -90 + 2 * x,
              pC = pB + 2 * (180 - x - y);
            const pts = { A: pA, B: pB, C: pC };
            const fig = circFig(pts, { segs: [['A', 'B'], ['B', 'C'], ['C', 'A'], ['T', "T'"]], center: false, extra: { T: [1.4, -1], "T'": [-1.4, -1] } });
            if (level === 1) {
              return {
                q: `직선 $TT'$ 은 원의 접선이고 점 $A$ 는 접점이다. $${ang('BAT')}=${deg(x)}$ 일 때, $${ang('ACB')}$ 의 크기를 구하세요.`,
                fig,
                answer: { type: 'num', value: x, unit: '°' },
                steps: ['접선과 현이 이루는 각의 크기는 그 각 안의 호에 대한 원주각의 크기와 같습니다.', `$${ang('ACB')}=${ang('BAT')}=${deg(x)}$`],
              };
            }
            const z = 180 - x - y;
            return {
              q: `직선 $TT'$ 은 원의 접선이고 점 $A$ 는 접점이다. $${ang('BAT')}=${deg(x)}$, $${ang('ABC')}=${deg(y)}$ 일 때, $${ang('BAC')}$ 의 크기는?`,
              fig,
              answer: numChoices(r, z, [x, y, 180 - x, 180 - y, 90 - x].filter((v) => v > 0 && v !== z)),
              steps: [`$${ang('ACB')}=${ang('BAT')}=${deg(x)}$`, `$${ang('BAC')}=180^\\circ-${deg(x)}-${deg(y)}=${deg(z)}$`],
            };
          }
          const g = r.int(20, 50),
            b = g + r.int(20, 60);
          if (b + g >= 170) return this.gen(r, level);
          return {
            q: `원 밖의 점 $P$ 에서 그은 접선의 접점을 $A$ 라 하고, $P$ 를 지나는 직선이 원과 만나는 두 점을 $P$ 에 가까운 쪽부터 $B$, $C$ 라 하자. $${ang('ABC')}=${deg(b)}$, $${ang('ACB')}=${deg(g)}$ 일 때, $${ang('APB')}$ 의 크기를 구하세요.`,
            answer: { type: 'num', value: b - g, unit: '°' },
            steps: [`접선과 현이 이루는 각: $${ang('PAB')}=${ang('ACB')}=${deg(g)}$`, `$\\triangle PAB$ 에서 $${ang('ABC')}$ 는 외각이므로 $${ang('ABC')}=${ang('APB')}+${ang('PAB')}$`, `$${ang('APB')}=${deg(b)}-${deg(g)}=${deg(b - g)}$`],
          };
        },
      },
      {
        id: 'arc-ratio',
        title: '원주각과 호의 길이',
        gen(r, level) {
          if (level === 1) {
            const x = r.int(10, 40);
            const l = r.int(2, 6);
            const m = r.int(2, 4);
            return {
              q: `한 원에서 호 $AB$ 의 길이가 $${l}\\,\\text{cm}$ 이고 그에 대한 원주각의 크기가 $${deg(x)}$ 이다. 길이가 $${l * m}\\,\\text{cm}$ 인 호 $CD$ 에 대한 원주각의 크기를 구하세요.`,
              answer: { type: 'num', value: x * m, unit: '°' },
              steps: ['원주각의 크기와 호의 길이는 정비례합니다.', `$${deg(x)}\\times${m}=${deg(x * m)}$`],
            };
          }
          for (;;) {
            const p = r.int(1, 6),
              q = r.int(1, 6),
              s = r.int(1, 6);
            const t = p + q + s;
            if (180 % t !== 0 || new Set([p, q, s]).size < 2) continue;
            const u = 180 / t;
            // 호 AB:BC:CA = p:q:s → ∠C = p u, ∠A = q u, ∠B = s u
            const fig = circFig({ A: 90, B: 90 + 360 * (p / t), C: 90 + 360 * ((p + q) / t) }, { segs: [['A', 'B'], ['B', 'C'], ['C', 'A']], center: false });
            if (level === 2) {
              return {
                q: `$\\triangle ABC$ 가 원에 내접하고 $\\overset{\\frown}{AB}:\\overset{\\frown}{BC}:\\overset{\\frown}{CA}=${p}:${q}:${s}$ 일 때, $${ang('C')}$ 의 크기는?`,
                fig,
                answer: numChoices(r, p * u, [q * u, s * u, 2 * p * u, (360 * p) / t].filter((v) => v !== p * u)),
                steps: [`세 원주각의 합은 $180^\\circ$ 이고 호의 길이에 정비례`, `$${ang('C')}$ 는 호 $AB$ 에 대한 원주각: $180^\\circ\\times\\frac{${p}}{${t}}=${deg(p * u)}$`],
              };
            }
            return {
              q: `$\\triangle ABC$ 가 원에 내접하고 $\\overset{\\frown}{AB}:\\overset{\\frown}{BC}:\\overset{\\frown}{CA}=${p}:${q}:${s}$ 일 때, $${ang('A')}$, $${ang('B')}$, $${ang('C')}$ 의 크기를 구하세요.`,
              fig,
              answer: { type: 'fields', fields: [{ label: '∠A', value: q * u, unit: '°' }, { label: '∠B', value: s * u, unit: '°' }, { label: '∠C', value: p * u, unit: '°' }] },
              steps: [`$${ang('A')}$ 는 호 $BC$, $${ang('B')}$ 는 호 $CA$, $${ang('C')}$ 는 호 $AB$ 에 대한 원주각`, `$180^\\circ\\div${t}=${deg(u)}$ 이므로 $${ang('A')}=${deg(q * u)}$, $${ang('B')}=${deg(s * u)}$, $${ang('C')}=${deg(p * u)}$`],
            };
          }
        },
      },
    ],
  },

  // ───────────────────────── 통계 ─────────────────────────
  'm3b-3': {
    concepts: [
      {
        title: '대푯값과 편차',
        body: '평균·중앙값·최빈값은 자료 전체를 대표하는 값 (중1). **편차** $=$ (변량) $-$ (평균)\n- 편차의 합은 항상 $0$\n- 편차가 양수면 평균보다 크고, 음수면 평균보다 작다.',
      },
      {
        title: '분산과 표준편차',
        body: '$$\\text{분산}=\\frac{(\\text{편차})^2\\text{ 의 합}}{(\\text{변량의 개수})},\\qquad \\text{표준편차}=\\sqrt{\\text{분산}}$$\n- 분산·표준편차가 작을수록 자료가 평균 주위에 모여 있다 (고르다).',
        example: { q: '편차가 $-2,0,2$ 일 때 분산은?', a: '$\\frac{4+0+4}{3}=\\frac{8}{3}$' },
      },
      {
        title: '상자그림',
        body: '자료를 작은 값부터 나열해 최솟값, 제1사분위수 $Q_1$, 중앙값 $Q_2$, 제3사분위수 $Q_3$, 최댓값으로 나타낸 그림.\n- $Q_1$: 중앙값 아래쪽 자료의 중앙값, $Q_3$: 위쪽 자료의 중앙값\n- 사분위범위 $=Q_3-Q_1$',
      },
      {
        title: '산점도와 상관관계',
        body: '두 변량의 순서쌍을 좌표평면에 나타낸 그림이 산점도.\n- 한 변량이 커질 때 다른 변량도 커지면 **양의 상관관계**, 작아지면 **음의 상관관계**, 뚜렷한 경향이 없으면 상관관계가 없다.',
      },
    ],
    skills: [
      {
        id: 'deviation',
        title: '편차',
        gen(r, level) {
          if (level === 1) {
            const n = r.int(4, 6);
            const ds = Array.from({ length: n - 1 }, () => r.int(-6, 6));
            const x = -ds.reduce((a, b) => a + b, 0);
            const names = ['A', 'B', 'C', 'D', 'E', 'F'].slice(0, n);
            const pos = r.int(0, n - 1);
            const all = [...ds.slice(0, pos), NaN, ...ds.slice(pos)];
            return {
              q: `학생 $${n}$ 명의 수학 점수의 편차가 다음과 같을 때, $x$ 의 값을 구하세요.`,
              table: [['학생', ...names], ['편차(점)', ...all.map((d) => (Number.isNaN(d) ? '$x$' : `$${d}$`))]],
              answer: { type: 'num', value: x },
              steps: ['편차의 합은 $0$ 입니다.', `$${ds.map((d) => (d < 0 ? `(${d})` : `${d}`)).join('+')}+x=0$`, `$x=${x}$`],
            };
          }
          if (level === 2) {
            const m = r.int(60, 85);
            const d = r.nonzero(-12, 12);
            const name = r.pick(NAMES);
            if (r.chance(0.5)) {
              return {
                q: `어느 반의 영어 점수의 평균이 $${m}$ 점이고, ${nmP(name)} 점수의 편차가 $${d}$ 점일 때, ${nmP(name)} 점수를 구하세요.`,
                answer: { type: 'num', value: m + d, unit: '점' },
                steps: ['(변량) $=$ (평균) $+$ (편차)', `$${m}+(${d})=${m + d}$ (점)`],
              };
            }
            return {
              q: `어느 반의 키의 평균이 $${m + 80}\\,\\text{cm}$ 이고 ${nmP(name)} 키가 $${m + 80 + d}\\,\\text{cm}$ 일 때, ${nmP(name)} 키의 편차는?`,
              answer: numChoices(r, d, [-d, m + 80 + d, d * 2, d + 1].filter((v) => v !== d)),
              steps: ['(편차) $=$ (변량) $-$ (평균)', `$${m + 80 + d}-${m + 80}=${d}\\,(\\text{cm})$`],
            };
          }
          const n = 5;
          const m = r.int(10, 30);
          const vals = Array.from({ length: n - 1 }, () => m + r.int(-6, 6));
          const x = n * m - vals.reduce((a, b) => a + b, 0);
          const k = r.int(0, n - 2);
          return {
            q: `다섯 개의 변량 $${vals.join(',\\ ')},\\ x$ 의 평균이 $${m}$ 일 때, $x$ 의 값과 변량 $${vals[k]}$ 의 편차를 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'x', value: x }, { label: `${vals[k]} 의 편차`, value: vals[k] - m }] },
            steps: [`$\\frac{${vals.join('+')}+x}{5}=${m}$ 에서 $x=${5 * m}-${vals.reduce((a, b) => a + b, 0)}=${x}$`, `편차 $=${vals[k]}-${m}=${vals[k] - m}$`],
          };
        },
      },
      {
        id: 'variance',
        title: '분산 구하기',
        gen(r, level) {
          if (level <= 2) {
            const n = r.pick([4, 5]);
            let ds: number[] = [];
            for (;;) {
              ds = Array.from({ length: n - 1 }, () => r.int(-5, 5));
              const last = -ds.reduce((a, b) => a + b, 0);
              if (Math.abs(last) <= 6) {
                ds.push(last);
                break;
              }
            }
            const ss = ds.reduce((a, b) => a + b * b, 0);
            const v = ss / n;
            if (level === 1) {
              return {
                q: `어떤 자료의 편차가 $${ds.join(',\\ ')}$ 일 때, 분산을 구하세요.`,
                answer: { type: 'num', value: v },
                steps: [`(편차)$^2$ 의 합 $=${ds.map((d) => `${d < 0 ? `(${d})` : d}^2`).join('+')}=${ss}$`, `분산 $=\\frac{${ss}}{${n}}=${round(v, 4)}$`],
              };
            }
            const m = r.int(5, 20);
            const vals = ds.map((d) => m + d);
            return {
              q: `다음 자료의 분산을 구하세요.\n$$${vals.join(',\\quad ')}$$`,
              answer: { type: 'num', value: v },
              steps: [`평균 $=\\frac{${vals.join('+')}}{${n}}=${m}$`, `편차: $${ds.join(',\\ ')}$, (편차)$^2$ 의 합 $=${ss}$`, `분산 $=\\frac{${ss}}{${n}}=${round(v, 4)}$`],
            };
          }
          const xs = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 4).sort((a, b) => a - b);
          let fs: number[] = [];
          for (let i = 0; i < 5000; i++) {
            fs = xs.map(() => r.int(1, 6));
            const N = fs.reduce((a, b) => a + b, 0);
            const S = xs.reduce((a, x, i2) => a + x * fs[i2], 0);
            if ((N === 10 || N === 20 || N === 5 || N === 8) && S % N === 0) break;
            if (i === 4999) fs = [2, 3, 3, 2]; // 대칭이 아니어도 N=10, 아래에서 평균이 정수가 되게 보정
          }
          if (xs.reduce((a, x, i) => a + x * fs[i], 0) % fs.reduce((a, b) => a + b, 0) !== 0) {
            xs[3] = xs[0] + xs[3] - xs[0];
            fs = [1, 1, 1, 1];
            xs.splice(0, 4, 2, 4, 6, 8);
          }
          const N = fs.reduce((a, b) => a + b, 0);
          const M = xs.reduce((a, x, i) => a + x * fs[i], 0) / N;
          const ss = xs.reduce((a, x, i) => a + (x - M) ** 2 * fs[i], 0);
          const v = ss / N;
          return {
            q: '다음은 어느 반 학생들의 1주일 동안의 도서관 방문 횟수를 조사한 도수분포표이다. 방문 횟수의 분산을 구하세요.',
            table: [['횟수(회)', ...xs.map((x) => `$${x}$`), '합계'], ['학생 수(명)', ...fs.map((f) => `$${f}$`), `$${N}$`]],
            answer: { type: 'num', value: round(v, 6) },
            steps: [`평균 $=\\frac{${xs.map((x, i) => `${x}\\times${fs[i]}`).join('+')}}{${N}}=${round(M, 4)}$`, `(편차)$^2\\times$(도수) 의 합 $=${xs.map((x, i) => `${round((x - M) ** 2, 4)}\\times${fs[i]}`).join('+')}=${round(ss, 4)}$`, `분산 $=\\frac{${round(ss, 4)}}{${N}}=${round(v, 4)}$`],
          };
        },
      },
      {
        id: 'std-dev',
        title: '표준편차',
        gen(r, level) {
          if (level <= 2) {
            const n = r.pick([4, 5, 6]);
            let ds: number[] = [];
            for (let i = 0; i < 2000; i++) {
              ds = Array.from({ length: n - 1 }, () => r.int(-6, 6));
              const last = -ds.reduce((a, b) => a + b, 0);
              ds.push(last);
              const ss = ds.reduce((a, b) => a + b * b, 0);
              if (Math.abs(last) <= 7 && ss > 0 && ss % n === 0 && isSq(ss / n)) break;
              if (i === 1999) ds = r.shuffle(n === 4 ? [-1, -1, 1, 1] : n === 5 ? [-1, -1, -1, -1, 4] : [-1, -1, -1, 1, 1, 1]);
            }
            const ss = ds.reduce((a, b) => a + b * b, 0);
            const sd = Math.sqrt(ss / n);
            const m = r.int(50, 90);
            const vals = ds.map((d) => m + d);
            if (level === 1) {
              return {
                q: `어떤 자료의 편차가 $${ds.join(',\\ ')}$ 일 때, 표준편차를 구하세요.`,
                answer: { type: 'num', value: sd },
                steps: [`분산 $=\\frac{${ss}}{${n}}=${ss / n}$`, `표준편차 $=\\sqrt{${ss / n}}=${sd}$`],
              };
            }
            return {
              q: `학생 $${n}$ 명의 수학 점수가 다음과 같을 때, 표준편차는?\n$$${vals.join(',\\quad ')}$$`,
              answer: numChoices(r, sd, [ss / n, sd + 1, sd * 2, Math.max(1, sd - 1)].filter((v) => v !== sd)),
              steps: [`평균 $=${m}$, 편차: $${ds.join(',\\ ')}$`, `분산 $=\\frac{${ss}}{${n}}=${ss / n}$`, `표준편차 $=${sd}$ 점`],
            };
          }
          // 네 수 a, b, c, x, y 의 평균·분산 조건 → x²+y²
          const others = [r.int(2, 9), r.int(2, 9), r.int(2, 9)];
          const M = r.int(4, 8);
          const x = r.int(1, 12),
            y = 5 * M - others.reduce((a, b) => a + b, 0) - x;
          if (y < 0) return this.gen(r, level);
          const all = [...others, x, y];
          const V = all.reduce((a, v) => a + (v - M) ** 2, 0) / 5;
          if (!Number.isInteger(V * 5)) return this.gen(r, level);
          const sq = x * x + y * y;
          return {
            q: `다섯 개의 변량 $${others.join(',\\ ')},\\ x,\\ y$ 의 평균이 $${M}$ 이고 분산이 $${round(V, 4)}$ 일 때, $x^2+y^2$ 의 값을 구하세요.`,
            answer: { type: 'num', value: sq },
            steps: [
              `평균: $${others.join('+')}+x+y=${5 * M}$ 이므로 $x+y=${x + y}$`,
              `분산: $\\frac{${others.map((o) => `(${o}-${M})^2`).join('+')}+(x-${M})^2+(y-${M})^2}{5}=${round(V, 4)}$`,
              `$(x-${M})^2+(y-${M})^2=${round(5 * V - others.reduce((a, o) => a + (o - M) ** 2, 0), 4)}$ 를 전개하면 $x^2+y^2-${2 * M}(x+y)+${2 * M * M}=${round(5 * V - others.reduce((a, o) => a + (o - M) ** 2, 0), 4)}$`,
              `$x^2+y^2=${sq}$`,
            ],
          };
        },
      },
      {
        id: 'spread',
        title: '자료의 흩어진 정도 비교',
        gen(r, level) {
          if (level === 1) {
            const cls = ['1반', '2반', '3반', '4반', '5반'];
            const sds = r.sample([1.2, 1.5, 2, 2.4, 3, 3.5, 4, 4.2, 5, 6], 5);
            const ms = cls.map(() => r.int(60, 80));
            const best = sds.indexOf(Math.min(...sds));
            return {
              q: '다음은 5개 반의 수학 점수의 평균과 표준편차이다. 점수가 가장 고르게 분포된 반은?',
              table: [['반', ...cls], ['평균(점)', ...ms.map((m) => `$${m}$`)], ['표준편차(점)', ...sds.map((s) => `$${s}$`)]],
              answer: tc(r, cls[best], cls.filter((_, i) => i !== best)),
              steps: ['표준편차가 작을수록 자료가 평균 주위에 모여 있어 고르게 분포합니다.', `표준편차가 가장 작은 반: ${cls[best]} ($${sds[best]}$ 점)`],
            };
          }
          if (level === 2) {
            const m = r.int(5, 15);
            const A = [m - 1, m, m, m + 1, m];
            const k = r.int(3, 5);
            const B = [m - k, m - 1, m, m + 1, m + k];
            const C = [m - 2, m - 2, m, m + 2, m + 2];
            const sets: [string, number[]][] = r.shuffle([
              ['A', A],
              ['B', B],
              ['C', C],
            ]);
            const v = (xs: number[]) => xs.reduce((a, x) => a + (x - m) ** 2, 0) / xs.length;
            const big = sets.reduce((p, c) => (v(c[1]) > v(p[1]) ? c : p));
            const lbl = sets.map(([n]) => n);
            return {
              q: `세 자료 ${sets.map(([n, xs]) => `$${n}:\\ ${xs.join(',')}$`).join(', ')} 의 평균은 모두 $${m}$ 이다. 분산이 가장 큰 자료는?`,
              answer: tc(r, `자료 ${big[0]}`, [...lbl.filter((x) => x !== big[0]).map((x) => `자료 ${x}`), '세 자료 모두 같다']),
              steps: [sets.map(([n, xs]) => `${n} 의 분산 $=${round(v(xs), 4)}$`).join(', '), `분산이 가장 큰 것은 자료 ${big[0]}`],
            };
          }
          const a = r.pick([2, 3, -2, 3, 4]),
            b = r.int(-10, 10);
          const m = r.int(5, 20),
            V = r.int(2, 9);
          return {
            q: `변량 $x_1,x_2,\\cdots,x_n$ 의 평균이 $${m}$, 분산이 $${V}$ 일 때, 변량 $${a}x_1${b >= 0 ? '+' : ''}${b},\\ ${a}x_2${b >= 0 ? '+' : ''}${b},\\ \\cdots,\\ ${a}x_n${b >= 0 ? '+' : ''}${b}$ 의 평균과 분산을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: '평균', value: a * m + b }, { label: '분산', value: a * a * V }] },
            steps: [`평균: $${a}\\times${m}${b >= 0 ? '+' : ''}${b}=${a * m + b}$`, `상수를 더하거나 빼는 것은 흩어진 정도에 영향이 없고, $${a}$ 배하면 분산은 $${a < 0 ? `(${a})` : a}^2$ 배`, `분산: $${a * a}\\times${V}=${a * a * V}$`],
          };
        },
      },
      {
        id: 'boxplot',
        title: '사분위수와 상자그림',
        gen(r, level) {
          const n = level === 1 ? r.pick([7, 9]) : r.pick([7, 11, 8]);
          const vals = Array.from({ length: n }, () => r.int(10, 60));
          const s = vals.slice().sort((a, b) => a - b);
          const med = (xs: number[]) => (xs.length % 2 ? xs[(xs.length - 1) / 2] : (xs[xs.length / 2 - 1] + xs[xs.length / 2]) / 2);
          const half = Math.floor(n / 2);
          const lo = s.slice(0, half),
            hi = s.slice(n - half);
          const Q2 = med(s),
            Q1 = med(lo),
            Q3 = med(hi);
          if (level === 1) {
            return {
              q: `다음 자료의 중앙값을 구하세요.\n$$${vals.join(',\\ ')}$$`,
              answer: { type: 'num', value: Q2 },
              steps: [`작은 값부터 나열: $${s.join(',\\ ')}$`, `가운데 값: $${Q2}$`],
            };
          }
          if (level === 2) {
            return {
              q: `다음 자료의 제1사분위수 $Q_1$ 과 제3사분위수 $Q_3$ 을 구하세요.\n$$${vals.join(',\\ ')}$$`,
              answer: { type: 'fields', fields: [{ label: 'Q₁', value: Q1 }, { label: 'Q₃', value: Q3 }] },
              steps: [`작은 값부터 나열: $${s.join(',\\ ')}$, 중앙값 $${Q2}$`, `아래쪽 자료 $${lo.join(',')}$ 의 중앙값 $Q_1=${Q1}$`, `위쪽 자료 $${hi.join(',')}$ 의 중앙값 $Q_3=${Q3}$`],
            };
          }
          return {
            q: `다음 자료로 상자그림을 그릴 때, 사분위범위($Q_3-Q_1$)와 (최댓값)$-$(최솟값)을 구하세요.\n$$${vals.join(',\\ ')}$$`,
            answer: { type: 'fields', fields: [{ label: '사분위범위', value: Q3 - Q1 }, { label: '최댓값-최솟값', value: s[n - 1] - s[0] }] },
            steps: [`작은 값부터 나열: $${s.join(',\\ ')}$`, `$Q_1=${Q1}$, $Q_3=${Q3}$ 이므로 사분위범위 $=${Q3 - Q1}$`, `최댓값 $${s[n - 1]}$, 최솟값 $${s[0]}$ → $${s[n - 1] - s[0]}$`],
          };
        },
      },
      {
        id: 'scatter',
        title: '산점도와 상관관계',
        gen(r, level) {
          const kind = r.pick(['pos', 'neg', 'none'] as const);
          const N = level === 1 ? 10 : 14;
          const noise = level === 3 ? 2.2 : 1.2;
          const pl = new Plane(0, 10, 0, 10, { w: 220, h: 220, labels: false });
          const pts: [number, number][] = [];
          for (let i = 0; i < N; i++) {
            const x = 0.8 + (8.4 * i) / (N - 1) + (r.next() - 0.5) * 0.6;
            let y = kind === 'pos' ? 1 + 0.8 * x : kind === 'neg' ? 9 - 0.8 * x : 1.5 + r.next() * 7;
            if (kind !== 'none') y += (r.next() - 0.5) * 2 * noise;
            y = Math.max(0.5, Math.min(9.5, y));
            pts.push([round(x, 2), round(y, 2)]);
            pl.point(x, y);
          }
          const label = { pos: '양의 상관관계', neg: '음의 상관관계', none: '상관관계가 없다' }[kind];
          if (level <= 2) {
            return {
              q: '다음 산점도에서 두 변량 $x$, $y$ 사이의 상관관계로 알맞은 것은?',
              fig: figStr(pl),
              answer: tc(r, label, ['양의 상관관계', '음의 상관관계', '상관관계가 없다', '정비례 관계', '반비례 관계'].filter((x) => x !== label)),
              steps: [kind === 'pos' ? '$x$ 의 값이 커질수록 $y$ 의 값도 대체로 커집니다.' : kind === 'neg' ? '$x$ 의 값이 커질수록 $y$ 의 값은 대체로 작아집니다.' : '점들이 흩어져 있어 뚜렷한 경향이 없습니다.', `따라서 ${label}`],
            };
          }
          const EX: Record<string, string[]> = {
            pos: ['키와 몸무게', '공부 시간과 시험 점수', '여름철 기온과 아이스크림 판매량', '자동차의 이동 거리와 연료 사용량'],
            neg: ['산의 높이와 기온', '자동차의 속력과 걸리는 시간', '물건의 가격과 판매량', '겨울철 기온과 난방비'],
            none: ['키와 수학 점수', '발 크기와 지능 지수', '머리카락 길이와 시력', '몸무게와 통학 거리'],
          };
          const right = r.pick(EX[kind]);
          const others = (Object.keys(EX) as (keyof typeof EX)[]).filter((k) => k !== kind).flatMap((k) => r.sample(EX[k], 2));
          return {
            q: `다음 중 두 변량 사이의 관계가 **${label}${kind === 'none' ? '' : '인'}** 것은?`.replace('없다인', '없는').replace('없다**', '없는**'),
            answer: tc(r, right, others),
            steps: [kind === 'none' ? `'${right}' 사이에는 상관관계가 없습니다.` : `'${right}' 사이에는 ${label}가 있습니다.`],
          };
        },
      },
    ],
  },
};

/** 이름 + 의: 서연이의, 민수의 */
function nmP(name: string): string {
  const c = name.charCodeAt(name.length - 1);
  return (c - 0xac00) % 28 !== 0 ? `${name}이의` : `${name}의`;
}
