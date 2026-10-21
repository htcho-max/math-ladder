// 중3-2 문장제(활용) 유형 추가분 — m3b.ts 의 단원별 skills 뒤에 이어 붙임
import type { Skill } from '../../core/types';
import { F } from '../../core/frac';
import { round, lcm } from '../../core/nt';
import { sqrtTex, termsTex, dec } from '../../core/tex';
import { NAMES, mc, tc, geo, triples, ga, neun } from './util';
import { texJosa } from '../h2/util';

const deg = (x: number) => `${x}^\\circ`;
const ov = (s: string) => `\\overline{${s}}`;
const ang = (s: string) => `\\angle ${s}`;
const u = (v: number | string, unit: string) => `${typeof v === 'number' ? dec(v) : v}\\,\\text{${unit}}`;
const TRI = triples(40);

/** p + q√3 (p, q 유리수) → 통분한 TeX */
function r3(p: F, q: F): string {
  const D = lcm(p.d, q.d);
  const P = (p.n * D) / p.d,
    Q = (q.n * D) / q.d;
  const t3 = { c: Q, v: '\\sqrt{3}' },
    t0 = { c: P, v: '' };
  const body = termsTex(Q < 0 && P > 0 ? [t0, t3] : [t3, t0]);
  if (D === 1) return body;
  if (P === 0 && Q < 0) return `-\\frac{${termsTex([{ c: -Q, v: '\\sqrt{3}' }])}}{${D}}`;
  return `\\frac{${body}}{${D}}`;
}
/** (p + q√3) 의 곱 */
const m3 = (a: [F, F], b: [F, F]): [F, F] => [a[0].mul(b[0]).add(a[1].mul(b[1]).mul(3)), a[0].mul(b[1]).add(a[1].mul(b[0]))];
/** 1/(p+q√3) */
function inv3([p, q]: [F, F]): [F, F] {
  const den = p.mul(p).sub(q.mul(q).mul(3));
  return [p.div(den), q.neg().div(den)];
}
/** cot θ 와 tan θ, sin θ 를 (p, q) 로 (특수각) */
const COT: Record<number, [F, F]> = { 30: [new F(0), new F(1)], 45: [new F(1), new F(0)], 60: [new F(0), new F(1, 3)] };
const TAN: Record<number, [F, F]> = { 30: [new F(0), new F(1, 3)], 45: [new F(1), new F(0)], 60: [new F(0), new F(1)] };
const TANTEX: Record<number, string> = { 30: '\\frac{\\sqrt{3}}{3}', 45: '1', 60: '\\sqrt{3}' };
/** k·√2/2 꼴 */
const r2 = (k: F) => (k.d === 1 ? `${k.n === 1 ? '' : k.n}\\sqrt{2}` : `\\frac{${k.n === 1 ? '' : k.n}\\sqrt{2}}{${k.d}}`);

/** 식 + m (항이 둘 이상이면 괄호) */
const unitM = (t: string) => (/[+-]/.test(t.replace(/^-/, '')) && !t.startsWith('\\frac') ? `(${t})\\,\\text{m}` : `${t}\\,\\text{m}`);

/** 이름 + 의 */
function nmP(name: string): string {
  const c = name.charCodeAt(name.length - 1);
  return (c - 0xac00) % 28 !== 0 ? `${name}이의` : `${name}의`;
}

export const M3B_WORD: Record<string, Skill[]> = {
  // ───────── 삼각비 ─────────
  'm3b-1': [
    {
      id: 'height-word',
      title: '삼각비를 이용한 높이 구하기',
      gen(r, level) {
        if (level === 1) {
          const L = r.int(5, 40) * 2;
          const a = r.pick([30, 45, 60]);
          const half = new F(L, 2);
          const sinT = a === 30 ? half.tex() : a === 45 ? r2(half) : r3(new F(0), half);
          const cosT = a === 60 ? half.tex() : a === 45 ? r2(half) : r3(new F(0), half);
          const tanT = r3(...m3([new F(L), new F(0)], TAN[a]));
          const kite = r.chance(0.5);
          const name = r.pick(NAMES);
          return {
            q: kite
              ? `${ga(name)} 날리는 연의 줄의 길이가 $${u(L, 'm')}$ 이고, 연줄이 지면과 이루는 각의 크기가 $${deg(a)}$ 이다. 연은 지면으로부터 몇 m 높이에 있나요? (단, 연줄은 팽팽한 직선이고 손의 높이는 생각하지 않는다.)`
              : `경사각이 $${deg(a)}$ 인 곧은 비탈길을 따라 $${u(L, 'm')}$ 를 올라갔을 때, 처음 위치보다 몇 m 높아졌나요?`,
            answer: mc(r, `${sinT}\\,\\text{m}`, [cosT, tanT, `${L}`, r3(new F(0), new F(L)), r2(new F(L)), half.tex(), r3(new F(0), new F(L, 3))].filter((x) => x !== sinT).map((x) => `${x}\\,\\text{m}`)),
            steps: [`(높이) $=${L}\\times\\sin${deg(a)}$`, `$\\sin${deg(a)}=${a === 30 ? '\\frac{1}{2}' : a === 45 ? '\\frac{\\sqrt{2}}{2}' : '\\frac{\\sqrt{3}}{2}'}$ 이므로 $${sinT}\\,(\\text{m})$`],
          };
        }
        // 두 지점에서 올려본각
        const pairs: [number, number][] = level === 2 ? [[30, 60]] : [[30, 45], [45, 60], [30, 60]];
        const [al, be] = r.pick(pairs);
        const opp = level === 3 && r.chance(0.5);
        const d = r.int(2, 15) * (opp && al === 30 && be === 60 ? 4 : 2);
        // same side: d = h(cot α − cot β), opposite: d = h(cot α + cot β)
        const ca = COT[al],
          cb = COT[be];
        const sum: [F, F] = opp ? [ca[0].add(cb[0]), ca[1].add(cb[1])] : [ca[0].sub(cb[0]), ca[1].sub(cb[1])];
        const hv = m3([new F(d), new F(0)], inv3(sum));
        const right = r3(hv[0], hv[1]);
        const altSum: [F, F] = !opp ? [ca[0].add(cb[0]), ca[1].add(cb[1])] : [ca[0].sub(cb[0]), ca[1].sub(cb[1])];
        const altH = m3([new F(d), new F(0)], inv3(altSum));
        const val = (x: [F, F]) => x[0].value + x[1].value * Math.sqrt(3);
        const cands: [F, F][] = [altH, m3([new F(d), new F(0)], sum), [hv[0].mul(2), hv[1].mul(2)], [hv[1].mul(3), hv[0]], [hv[0], hv[1].neg()], [hv[0].neg(), hv[1]], [hv[0].mul(new F(1, 2)), hv[1].mul(new F(1, 2))]];
        const wrongVals: [string, number][] = cands.map((x) => [r3(x[0], x[1]), val(x)]);
        const hN = hv[0].value + hv[1].value * Math.sqrt(3);
        const A: [number, number] = [-hN * (al === 30 ? Math.sqrt(3) : al === 45 ? 1 : 1 / Math.sqrt(3)), 0];
        const xb = hN * (be === 30 ? Math.sqrt(3) : be === 45 ? 1 : 1 / Math.sqrt(3));
        const B: [number, number] = [opp ? xb : -xb, 0];
        const fig = geo(
          { P: [0, hN], H: [0, 0], A, B },
          { segs: [['P', 'H'], ['A', 'P'], ['B', 'P'], opp ? ['A', 'B'] : ['A', 'H']], right: [['H', 'P', opp ? 'B' : 'A']], angles: [['A', 'P', 'H', `${al}°`], ['B', 'P', 'H', `${be}°`]], w: 260, h: 170 },
        );
        const what = r.pick(['탑', '건물', '전망대', '등대']);
        return {
          q: opp
            ? `${what}의 꼭대기 $P$ 를 사이에 두고 서로 반대쪽에 있는 두 지점 $A$, $B$ 에서 $P$ 를 올려본각의 크기가 각각 $${deg(al)}$, $${deg(be)}$ 이다. $${ov('AB')}=${u(d, 'm')}$ 이고 세 점 $A$, $H$, $B$ 가 한 직선 위에 있을 때, ${what}의 높이 $${ov('PH')}$ 를 구하면? (단, $H$ 는 ${what}의 밑, 눈높이는 생각하지 않는다.)`
            : `${what}의 밑 $H$ 와 한 직선 위에 있는 두 지점 $A$, $B$ 에서 ${what}의 꼭대기 $P$ 를 올려본각의 크기가 각각 $${deg(al)}$, $${deg(be)}$ 이다. $${ov('AB')}=${u(d, 'm')}$ 일 때, ${what}의 높이 $${ov('PH')}$ 를 구하면? (단, $B$ 가 $A$ 보다 ${what}에 가깝고, 눈높이는 생각하지 않는다.)`,
          fig,
          answer: mc(r, unitM(right), wrongVals.filter(([w, v]) => w !== right && v > 0).map(([w]) => unitM(w))),
          steps: [
            `$${ov('PH')}=h$ 라 하면 $${ov('AH')}=\\frac{h}{\\tan${deg(al)}}$, $${ov('BH')}=\\frac{h}{\\tan${deg(be)}}$ ($\\tan${deg(al)}=${TANTEX[al]}$, $\\tan${deg(be)}=${TANTEX[be]}$)`,
            `$${opp ? `${ov('AH')}+${ov('BH')}` : `${ov('AH')}-${ov('BH')}`}=${d}$ 에서 $(${r3(...sum)})h=${d}$`,
            `$h=\\frac{${d}}{${r3(...sum)}}=${right}\\,(\\text{m})$`,
          ],
        };
      },
    },
    {
      id: 'distance-word',
      title: '삼각비를 이용한 거리 구하기',
      gen(r, level) {
        if (level === 1) {
          const A = r.int(10, 40);
          const sv = round(Math.sin((A * Math.PI) / 180), 4),
            cv = round(Math.cos((A * Math.PI) / 180), 4);
          const L = r.int(1, 20) * 10;
          const askH = r.chance(0.5);
          const val = round(L * (askH ? sv : cv), 4);
          return {
            q: `경사각이 $${deg(A)}$ 인 곧은 비탈길을 따라 $${u(L, 'm')}$ 를 걸어 올라갔다. ${askH ? '올라간 높이' : '이동한 수평 거리'}는 몇 m 인가요? (단, $\\sin${deg(A)}=${sv.toFixed(4)}$, $\\cos${deg(A)}=${cv.toFixed(4)}$ 로 계산한다.)`,
            answer: { type: 'num', value: val, unit: 'm', display: 'dec' },
            steps: [`비탈길이 빗변인 직각삼각형에서 ${askH ? '높이' : '수평 거리'} $=${L}\\${askH ? 'sin' : 'cos'}${deg(A)}$`, `$=${L}\\times${(askH ? sv : cv).toFixed(4)}=${dec(val)}\\,(\\text{m})$`],
          };
        }
        if (level === 2) {
          const a = r.pick([30, 45, 60]);
          const h = r.int(4, 30) * 3;
          const right = r3(...m3([new F(h), new F(0)], COT[a]));
          const name = r.pick(NAMES);
          const wr = [30, 45, 60].filter((x) => x !== a).map((x) => r3(...m3([new F(h), new F(0)], COT[x])));
          return {
            q: `높이가 $${u(h, 'm')}$ 인 등대 꼭대기에서 ${ga(name)} 바다 위의 배를 내려본각의 크기가 $${deg(a)}$ 였다. 등대의 밑에서 배까지의 거리는? (단, 등대는 해수면에 수직으로 서 있고 눈높이는 생각하지 않는다.)`,
            answer: mc(r, `${right}\\,\\text{m}`, [...wr, r3(...m3([new F(h), new F(0)], TAN[a])), `${2 * h}`, r3(new F(0), new F(h, 2))].filter((x) => x !== right).map((x) => `${x}\\,\\text{m}`)),
            steps: [`내려본각은 엇각으로 배에서 등대 꼭대기를 올려본각과 같으므로 $${deg(a)}$`, `(거리) $=\\frac{${h}}{\\tan${deg(a)}}=\\frac{${h}}{${TANTEX[a]}}$`, `$=${right}\\,(\\text{m})$`],
          };
        }
        const A = r.pick([60, 120]);
        const c = r.int(2, 8) * 2;
        const b = r.int(Math.floor(c / 2) + 2, 18);
        const AH = c / 2;
        const CH = A === 60 ? b - AH : b + AH;
        const BH2 = 3 * AH * AH;
        const BC2 = BH2 + CH * CH;
        const right = sqrtTex(BC2);
        const B: [number, number] = [c * Math.cos((A * Math.PI) / 180), c * Math.sin((A * Math.PI) / 180)];
        const fig = geo({ A: [0, 0], B, C: [b, 0], H: [B[0], 0] }, { segs: [['A', 'B'], ['A', 'C'], ['B', 'C'], A === 120 ? ['H', 'A'] : ['A', 'A']], dashed: [['B', 'H']], right: [['H', 'B', 'C']], w: 260, h: 160 });
        return {
          q: `호수의 양 끝 지점 $B$, $C$ 사이의 거리를 구하려고 호수 밖의 한 지점 $A$ 에서 측량하였더니 $${ov('AB')}=${u(c, 'm')}$, $${ov('AC')}=${u(b, 'm')}$, $${ang('BAC')}=${deg(A)}$ 였다. 두 지점 $B$, $C$ 사이의 거리는?`,
          fig,
          answer: mc(r, `${right}\\,\\text{m}`, [sqrtTex(b * b + c * c), sqrtTex(A === 60 ? BC2 + 2 * b * AH : BC2 - 2 * b * AH), `${b + c - 2}`, sqrtTex(BC2 + c), sqrtTex(AH * AH + CH * CH)].filter((x) => x !== right).map((x) => `${x}\\,\\text{m}`)),
          steps: [
            `점 $B$ 에서 직선 $AC$ 에 수선 $BH$ 를 그으면 ${A === 120 ? `$${ang('BAH')}=60^\\circ$ 이고 ` : ''}$${ov('BH')}=${c}\\sin60^\\circ=${sqrtTex(BH2)}$, $${ov('AH')}=${c}\\cos60^\\circ=${AH}$`,
            `$${ov('CH')}=${A === 60 ? `${b}-${AH}` : `${b}+${AH}`}=${CH}$`,
            `$${ov('BC')}=\\sqrt{(${sqrtTex(BH2)})^2+${CH}^2}=${right === `\\sqrt{${BC2}}` ? right : `\\sqrt{${BC2}}=${right}`}\\,(\\text{m})$`,
          ],
        };
      },
    },
  ],

  // ───────── 원의 성질 ─────────
  'm3b-2': [
    {
      id: 'plate-radius',
      title: '현의 성질 활용 (원래 원의 반지름)',
      gen(r, level) {
        const [p, q, c] = r.pick(TRI);
        const sw = r.chance(0.5);
        const a = sw ? p : q,
          b = sw ? q : p; // a: 현의 절반, b: 중심에서 현까지 거리
        if (level === 1) {
          return {
            q: `반지름의 길이가 $${u(c, 'm')}$ 인 원 모양의 호수 위에 곧은 다리를 놓았다. 호수의 중심에서 다리까지의 거리가 $${u(b, 'm')}$ 일 때, 다리의 길이를 구하세요. (단, 다리의 양 끝은 호숫가(원) 위에 있다.)`,
            answer: { type: 'num', value: 2 * a, unit: 'm' },
            steps: [`원의 중심에서 현에 내린 수선은 현을 이등분하므로 다리 길이의 절반을 $x$ 라 하면`, `$x=\\sqrt{${c}^2-${b}^2}=${a}$`, `다리의 길이 $=2\\times${a}=${2 * a}\\,(\\text{m})$`],
          };
        }
        if (level === 2) {
          const h = c - b;
          const M: [number, number] = [0, b];
          const fig = geo(
            { O: [0, 0], A: [-a, b], B: [a, b], M, C: [0, c] },
            { circles: [{ c: 'O', r: c }], segs: [['A', 'B'], ['M', 'C']], dashed: [['O', 'A'], ['O', 'M']], right: [['M', 'B', 'C']], dots: ['O'], w: 220, h: 220 },
          );
          return {
            q: `깨진 원 모양 접시의 조각에서 호의 양 끝 $A$, $B$ 를 이은 현의 길이가 $${u(2 * a, 'cm')}$ 이다. 현 $AB$ 의 중점 $M$ 에서 현에 수직인 직선이 호와 만나는 점을 $C$ 라 할 때 $${ov('MC')}=${u(h, 'cm')}$ 이었다. 원래 접시의 반지름의 길이를 구하세요.`,
            fig,
            answer: { type: 'num', value: c, unit: 'cm' },
            steps: [
              `현의 수직이등분선은 원의 중심 $O$ 를 지나므로 $O$ 는 직선 $CM$ 위에 있습니다. 반지름을 $r$ 이라 하면 $${ov('OM')}=r-${h}$`,
              `$\\triangle OAM$ 에서 $r^2=${a}^2+(r-${h})^2$, $${2 * h}r=${a * a + h * h}$`,
              `$r=${c}\\,(\\text{cm})$`,
            ],
          };
        }
        const H = c + b;
        return {
          q: `단면이 원의 일부인 터널이 있다. 터널 바닥(도로)의 폭은 $${u(2 * a, 'm')}$ 이고, 도로의 중앙에서 잰 터널의 가장 높은 곳의 높이는 $${u(H, 'm')}$ 이다. 이 원의 반지름의 길이를 구하세요. (단, 터널의 단면은 반원보다 크다.)`,
          answer: { type: 'num', value: c, unit: 'm' },
          steps: [
            `원의 중심 $O$ 는 도로의 중앙에서 위로 그은 수직선 위에 있습니다. 반지름을 $r$ 이라 하면 중심의 높이는 $${H}-r$`,
            `도로의 한쪽 끝과 중심, 도로 중앙이 이루는 직각삼각형에서 $r^2=${a}^2+(${H}-r)^2$`,
            `$${2 * H}r=${a * a + H * H}$, $r=${c}\\,(\\text{m})$`,
          ],
        };
      },
    },
    {
      id: 'tangent-word',
      title: '접선의 성질 활용',
      gen(r, level) {
        if (level <= 2) {
          const [p, q, c] = r.pick(TRI);
          const sw = r.chance(0.5);
          const a = sw ? p : q,
            b = sw ? q : p; // a 반지름, b 접선 길이
          if (level === 1) {
            return {
              q: `반지름의 길이가 $${u(a, 'm')}$ 인 원 모양 분수대의 중심 $O$ 에서 $${u(c, 'm')}$ 떨어진 지점 $P$ 에서 분수대의 가장자리에 접하도록 곧은 길을 내었다. 지점 $P$ 에서 접점 $T$ 까지 길의 길이를 구하세요.`,
              answer: { type: 'num', value: b, unit: 'm' },
              steps: [`접선은 접점을 지나는 반지름과 수직이므로 $${ang('OTP')}=90^\\circ$`, `$${ov('PT')}=\\sqrt{${c}^2-${a}^2}=\\sqrt{${b * b}}=${b}\\,(\\text{m})$`],
            };
          }
          const fig = geo(
            { O: [0, 0], P: [c, 0], A: [(a * a) / c, (a * b) / c], B: [(a * a) / c, -(a * b) / c] },
            { circles: [{ c: 'O', r: a }], segs: [['P', 'A'], ['P', 'B'], ['O', 'A'], ['O', 'B']], dashed: [['O', 'P']], dots: ['O'], w: 260, h: 180 },
          );
          return {
            q: `반지름의 길이가 $${u(a, 'm')}$ 인 원 모양 정원의 중심 $O$ 에서 $${u(c, 'm')}$ 떨어진 지점 $P$ 에서 정원에 두 접선 $PA$, $PB$ 를 따라 울타리를 쳤다. 사각형 $PAOB$ 의 넓이를 구하세요. (단, $A$, $B$ 는 접점)`,
            fig,
            answer: { type: 'num', value: a * b, unit: 'm²' },
            steps: [`$${ang('OAP')}=${ang('OBP')}=90^\\circ$ 이므로 $${ov('PA')}=${ov('PB')}=\\sqrt{${c}^2-${a}^2}=${b}$`, `$\\square PAOB=2\\triangle PAO=2\\times\\frac{1}{2}\\times${a}\\times${b}$`, `$=${a * b}\\,(\\text{m}^2)$`],
          };
        }
        if (r.chance(0.5)) {
          let a = 0,
            b = 0,
            c = 0;
          for (;;) {
            a = r.int(5, 20);
            b = r.int(5, 20);
            c = r.int(5, 20);
            if (a + b > c && b + c > a && c + a > b && (a + c - b) % 2 === 0 && a + c - b > 0) break;
          }
          const x = (a + c - b) / 2;
          return {
            q: `세 변의 길이가 $${ov('BC')}=${u(a, 'm')}$, $${ov('CA')}=${u(b, 'm')}$, $${ov('AB')}=${u(c, 'm')}$ 인 삼각형 모양의 땅 $ABC$ 안에 세 변에 모두 접하는 원 모양의 화단을 만들었다. 화단이 변 $BC$ 와 접하는 점을 $D$ 라 할 때, $${ov('BD')}$ 의 길이를 구하세요.`,
            answer: { type: 'num', value: x, unit: 'm' },
            steps: [
              `원 밖의 한 점에서 그은 두 접선의 길이는 같으므로 $${ov('BD')}=x$ 라 하면 $AB$ 위의 접점까지 $B$ 에서 $x$, $A$ 에서 $${c}-x$`,
              `$C$ 에서의 접선의 길이는 $${a}-x$ 이고, $A$ 에서의 두 접선 길이도 같으므로 $(${c}-x)+(${a}-x)=${b}$`,
              `$2x=${a + c - b}$, $x=${x}\\,(\\text{m})$`,
            ],
          };
        }
        const AB = r.int(6, 20),
          BC = r.int(6, 20),
          CD = r.int(6, 20);
        const DA = AB + CD - BC;
        if (DA < 4) return this.gen(r, level);
        const name = r.pick(NAMES);
        return {
          q: `${neun(name)} 원 모양의 연못 둘레에 네 변이 모두 연못에 접하도록 사각형 $ABCD$ 모양의 울타리를 쳤다. $${ov('AB')}=${u(AB, 'm')}$, $${ov('BC')}=${u(BC, 'm')}$, $${ov('CD')}=${u(CD, 'm')}$ 일 때, $${ov('DA')}$ 의 길이를 구하세요.`,
          answer: { type: 'num', value: DA, unit: 'm' },
          steps: [`원에 외접하는 사각형에서 두 쌍의 대변의 길이의 합은 같습니다: $${ov('AB')}+${ov('CD')}=${ov('AD')}+${ov('BC')}$`, `$${AB}+${CD}=${ov('DA')}+${BC}$`, `$${ov('DA')}=${DA}\\,(\\text{m})$`],
        };
      },
    },
  ],

  // ───────── 통계 ─────────
  'm3b-3': [
    {
      id: 'stat-interpret',
      title: '대푯값과 산포도 해석',
      gen(r, level) {
        if (level === 1) {
          const base = Array.from({ length: 6 }, () => r.int(20, 35) * 10);
          const big = r.int(10, 30) * 100;
          const vals = r.shuffle([...base, big]);
          const s = vals.slice().sort((x, y) => x - y);
          const med = s[3];
          const mean = round(vals.reduce((x, y) => x + y, 0) / 7, 1);
          return {
            q: `다음은 어느 작은 회사 직원 $7$ 명의 한 달 월급이다. (단위: 만 원)\n$$${vals.join(',\\ ')}$$\n이 자료에는 매우 큰 값이 있어 평균은 대푯값으로 적절하지 않다. 이 자료의 대푯값으로 적절한 중앙값을 구하세요.`,
            answer: { type: 'num', value: med, unit: '만 원' },
            steps: [`평균은 약 $${dec(mean)}$ 만 원으로 극단적인 값 $${big}$ 의 영향을 크게 받습니다.`, `작은 값부터 나열: $${s.join(',\\ ')}$`, `가운데(4번째) 값인 중앙값은 $${med}$ 만 원`],
          };
        }
        if (level === 2) {
          const [n1, n2] = r.sample(NAMES, 2);
          const m1 = r.int(70, 95) / 10,
            m2 = r.int(70, 95) / 10;
          const s1 = r.int(5, 25) / 10,
            s2 = r.int(5, 25) / 10;
          if (m1 === m2 || s1 === s2) return this.gen(r, level);
          const hiM = m1 > m2 ? n1 : n2,
            loM = m1 > m2 ? n2 : n1;
          const even = s1 < s2 ? n1 : n2,
            uneven = s1 < s2 ? n2 : n1;
          const wa = (n: string) => ((n.charCodeAt(n.length - 1) - 0xac00) % 28 !== 0 ? `${n}이` : n);
          const T = [`평균 점수는 ${wa(hiM)}가 더 높다.`, `${nmP(even)} 점수가 ${nmP(uneven)} 점수보다 더 고르다.`];
          const W = [`평균 점수는 ${wa(loM)}가 더 높다.`, `${nmP(uneven)} 점수가 ${nmP(even)} 점수보다 더 고르다.`, '표준편차가 클수록 점수가 평균 가까이에 모여 있다.', `${nmP(uneven)} 점수의 분산이 ${nmP(even)} 점수의 분산보다 작다.`, '평균이 높은 사람이 항상 점수가 더 고르다.'];
          const right = r.pick(T);
          return {
            q: `다음은 ${nm2(n1)}와 ${nmEnd(n2)} 사격 연습에서 얻은 점수의 평균과 표준편차이다. 옳은 것은?`,
            table: [['', n1, n2], ['평균(점)', `$${dec(m1)}$`, `$${dec(m2)}$`], ['표준편차(점)', `$${dec(s1)}$`, `$${dec(s2)}$`]],
            answer: tc(r, right, W),
            steps: [`평균: ${n1} $${dec(m1)}$, ${n2} $${dec(m2)}$ → ${wa(hiM)}가 더 높음`, `표준편차가 작을수록 고르므로 ${nmP(even)} 점수가 더 고름 (분산도 더 작음)`, `옳은 것: ${right}`],
          };
        }
        let n1 = 0,
          n2 = 0,
          v1 = 0,
          v2 = 0;
        for (let i = 0; i < 500; i++) {
          n1 = r.int(10, 30);
          n2 = r.int(10, 30);
          v1 = r.int(2, 30);
          v2 = r.int(2, 30);
          if (v1 !== v2 && (n1 * v1 + n2 * v2) % (n1 + n2) === 0) break;
          if (i === 499) {
            n1 = 20;
            n2 = 20;
            v1 = 10;
            v2 = 16;
          }
        }
        const m = r.int(60, 80);
        const V = (n1 * v1 + n2 * v2) / (n1 + n2);
        return {
          q: `A 반 학생 $${n1}$ 명과 B 반 학생 $${n2}$ 명의 수학 점수의 평균은 모두 $${m}$ 점이고, 분산은 각각 $${v1}$, $${v2}$ 이다. 두 반 전체 학생 $${n1 + n2}$ 명의 수학 점수의 분산을 구하세요.`,
          answer: { type: 'num', value: V },
          steps: [
            `두 반의 평균이 같으므로 전체 평균도 $${m}$ 점이고, 각 학생의 편차는 그대로입니다.`,
            `(편차)$^2$ 의 총합: A 반 $${n1}\\times${v1}=${n1 * v1}$, B 반 $${n2}\\times${v2}=${n2 * v2}$`,
            `전체 분산 $=\\frac{${n1 * v1}+${n2 * v2}}{${n1 + n2}}=${dec(V)}$`,
          ],
        };
      },
    },
    {
      id: 'stat-missing',
      title: '모르는 변량과 산포도 구하기',
      gen(r, level) {
        if (level === 1) {
          const m = r.int(70, 90);
          const sc = Array.from({ length: 4 }, () => m + r.int(-12, Math.min(12, 100 - m)));
          const x = 5 * m - sc.reduce((p, q) => p + q, 0);
          if (x < 0 || x > 100) return this.gen(r, level);
          const name = r.pick(NAMES);
          return {
            q: `${nmP(name)} 네 번의 수학 쪽지 시험 점수는 $${sc.join(',\\ ')}$ 점이다. 다섯 번째 시험까지의 점수의 평균이 $${m}$ 점이 되려면 다섯 번째 시험에서 몇 점을 받아야 하나요?`,
            answer: { type: 'num', value: x, unit: '점' },
            steps: [`다섯 번째 점수를 $x$ 점이라 하면 $\\frac{${sc.join('+')}+x}{5}=${m}$`, `$${sc.reduce((p, q) => p + q, 0)}+x=${5 * m}$`, `$x=${x}$ (점)`],
          };
        }
        if (level === 2) {
          const m = r.int(5, 25);
          let ds: number[] = [];
          for (;;) {
            ds = Array.from({ length: 4 }, () => r.int(-5, 5));
            const last = -ds.reduce((p, q) => p + q, 0);
            if (Math.abs(last) <= 6) {
              ds.push(last);
              break;
            }
          }
          const pos = r.int(0, 4);
          const vals = ds.map((d) => m + d);
          const x = vals[pos];
          const shown = vals.map((v, i) => (i === pos ? 'x' : `${v}`));
          const ss = ds.reduce((p, q) => p + q * q, 0);
          const V = ss / 5;
          return {
            q: `다음은 어느 도시의 5일 동안의 최저 기온을 조사한 것이다. (단위: °C)\n$$${shown.join(',\\quad ')}$$\n기온의 평균이 $${m}$ °C 일 때, $x$ 의 값과 분산을 구하세요.`,
            answer: { type: 'fields', fields: [{ label: 'x', value: x }, { label: '분산', value: V, display: 'dec' }] },
            steps: [
              `$\\frac{${vals.filter((_, i) => i !== pos).join('+')}+x}{5}=${m}$ 에서 $x=${5 * m}-${5 * m - x}=${x}$`,
              `편차: $${ds.join(',\\ ')}$, (편차)$^2$ 의 합 $=${ss}$`,
              `분산 $=\\frac{${ss}}{5}=${dec(V)}$`,
            ],
          };
        }
        const m = r.int(10, 30),
          v = r.int(3, 12);
        let al = 0,
          ga2 = 0,
          be = 0,
          de = 0;
        for (let i = 0; i < 500; i++) {
          al = r.int(-5, 5);
          ga2 = r.int(-5, 5);
          be = r.int(-5, 5);
          de = al + ga2 - be;
          const same = (al === be && ga2 === de) || (al === de && ga2 === be);
          if (Math.abs(de) <= 5 && !same && 10 * v + al * al + ga2 * ga2 - be * be - de * de > 0) break;
        }
        const [a, c, b, d] = [m + al, m + ga2, m + be, m + de];
        const diff = al * al + ga2 * ga2 - be * be - de * de;
        if ((a === b && c === d) || (a === d && c === b) || Math.abs(de) > 5 || 10 * v + diff <= 0) return this.gen(r, level);
        const V = round(v + diff / 10, 4);
        return {
          q: `변량 $10$ 개의 평균이 $${m}$, 분산이 $${v}$ ${texJosa(String(v), '으로', '로', true)} 계산되었다. 그런데 두 변량 $${a}$, $${c}$ ${texJosa(String(c), '을', '를')} 각각 $${b}$, $${d}$ ${texJosa(String(d), '으로', '로', true)} 잘못 보고 계산한 것이었다. 실제 분산을 구하세요.`,
          answer: { type: 'num', value: V, display: 'dec' },
          steps: [
            `$${a}+${c}=${b}+${d}=${a + c}$ 이므로 실제 평균도 $${m}$ 입니다.`,
            `잘못 계산한 (편차)$^2$ 의 합은 $10\\times${v}=${10 * v}$, 여기에서 잘못 넣은 값의 $(${b}-${m})^2+(${d}-${m})^2=${be * be + de * de}$ 만큼 빼고 실제 값의 $(${a}-${m})^2+(${c}-${m})^2=${al * al + ga2 * ga2}$ 만큼 더하면 $${10 * v + diff}$`,
            `실제 분산 $=\\frac{${10 * v + diff}}{10}=${dec(V)}$`,
          ],
        };
      },
    },
  ],
};


/** 이름 + 와/과 용: 서연이 / 민수 */
function nm2(name: string): string {
  const c = name.charCodeAt(name.length - 1);
  return (c - 0xac00) % 28 !== 0 ? `${name}이` : name;
}
/** 이름 + 가 (주격, 문장 중간): 서연이가 / 민수가 */
function nmEnd(name: string): string {
  return ga(name);
}
