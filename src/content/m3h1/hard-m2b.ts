// 중2-2 심화 유형(skills 뒤에 이어 붙임)과 최상위 유형(top) — m2b.ts·word-m2b.ts 다음에 붙음
import type { Skill } from '../../core/types';
import type { Rng } from '../../core/rng';
import { F } from '../../core/frac';
import { gcd } from '../../core/nt';
import { geo, triples } from './util';
import { jo, deg, ov, ang } from './hard-util';

type P2 = [number, number];
const D2R = Math.PI / 180;
const fr = (n: number, d = 1) => new F(n, d);
const ftex = (n: number, d = 1) => new F(n, d).tex();

/** ∠XOY 의 두 반직선 위에 번갈아 찍은 점 (OA=AB=BC=…) */
function chainFig(x: number, n: number): string {
  const names = ['A', 'B', 'C', 'D', 'E'];
  const d: number[] = [];
  // OA=1, 이후 d[k] = d[k-2] + 2cos(kx)  (d[-1]=0)
  for (let k = 0; k < n; k++) d[k] = k === 0 ? 1 : (k >= 2 ? d[k - 2] : 0) + 2 * Math.cos(k * x * D2R);
  const pts: Record<string, P2> = { O: [0, 0] };
  const u: P2 = [Math.cos(x * D2R), Math.sin(x * D2R)];
  for (let k = 0; k < n; k++) pts[names[k]] = k % 2 === 0 ? [d[k], 0] : [d[k] * u[0], d[k] * u[1]];
  const mx = Math.max(...d) * 1.18;
  pts.X = [mx, 0];
  pts.Y = [mx * u[0], mx * u[1]];
  const segs: [string, string][] = [
    ['O', 'X'],
    ['O', 'Y'],
  ];
  for (let k = 0; k + 1 < n; k++) segs.push([names[k], names[k + 1]]);
  return geo(pts, { w: 300, h: 170, segs, angles: [['O', 'X', 'Y', `${x}°`]] });
}

const TRI = triples(30);

export const M2B_HARD: Record<string, Skill[]> = {
  // ───────── 삼각형의 성질 ─────────
  'm2b-1': [
    {
      id: 'iso-chain',
      title: '이등변삼각형이 이어진 각 (외각의 성질)',
      gen(r, level) {
        if (level === 1) {
          const x = r.int(12, 40);
          return {
            q: `그림과 같이 $${ang('XOY')}=${deg(x)}$ 이고 $${ov('OA')}=${ov('AB')}=${ov('BC')}$ 일 때, $${ang('ABC')}$ 의 크기를 구하세요.`,
            fig: chainFig(x, 3),
            answer: { type: 'num', value: 180 - 4 * x, unit: '°' },
            steps: [
              `$\\triangle OAB$ 는 $${ov('OA')}=${ov('AB')}$ 인 이등변삼각형이므로 $${ang('ABO')}=${ang('AOB')}=${deg(x)}$`,
              `외각의 성질: $${ang('BAC')}=${ang('AOB')}+${ang('ABO')}=${deg(2 * x)}$`,
              `$\\triangle ABC$ 는 $${ov('AB')}=${ov('BC')}$ 이므로 $${ang('BCA')}=${ang('BAC')}=${deg(2 * x)}$`,
              `$${ang('ABC')}=180^\\circ-2\\times${deg(2 * x)}=${deg(180 - 4 * x)}$`,
            ],
          };
        }
        if (level === 2) {
          const x = r.int(10, 28);
          return {
            q: `그림과 같이 $${ang('XOY')}=${deg(x)}$ 이고 $${ov('OA')}=${ov('AB')}=${ov('BC')}=${ov('CD')}$ 일 때, $${ang('BCD')}$ 의 크기를 구하세요.`,
            fig: chainFig(x, 4),
            answer: { type: 'num', value: 180 - 6 * x, unit: '°' },
            steps: [
              `$\\triangle OAB$ 에서 $${ang('ABO')}=${deg(x)}$, 외각 $${ang('BAC')}=${deg(2 * x)}$`,
              `$\\triangle ABC$ 에서 $${ang('BCA')}=${deg(2 * x)}$, $\\triangle OBC$ 의 외각 $${ang('CBD')}=${deg(x)}+${deg(2 * x)}=${deg(3 * x)}$`,
              `$\\triangle BCD$ 는 $${ov('BC')}=${ov('CD')}$ 이므로 $${ang('CDB')}=${ang('CBD')}=${deg(3 * x)}$`,
              `$${ang('BCD')}=180^\\circ-2\\times${deg(3 * x)}=${deg(180 - 6 * x)}$`,
            ],
          };
        }
        const x = r.int(7, 20);
        const kmax = Math.ceil(90 / x) - 1;
        return {
          q: `$${ang('XOY')}=${deg(x)}$ 일 때, 그림처럼 반직선 $OX$ 위의 점 $A$ 에서 시작하여 $${ov('OA')}=${ov('AB')}=${ov('BC')}=\\cdots$ 가 되도록 두 반직선 $OX$, $OY$ 위에 번갈아 점을 잡아 같은 길이의 선분을 계속 긋는다. $${ov('OA')}$ 를 포함하여 이런 선분을 최대 몇 개까지 그을 수 있는지 구하세요.`,
          fig: chainFig(x, 3),
          answer: { type: 'num', value: kmax + 1, unit: '개' },
          steps: [
            `첫째 이등변삼각형 $OAB$ 의 밑각은 $${deg(x)}$, 외각의 성질로 둘째 이등변삼각형 $ABC$ 의 밑각은 $${deg(2 * x)}$`,
            `같은 방법으로 셋째 이등변삼각형의 밑각은 $${deg(3 * x)}$, … $n$ 째 이등변삼각형의 밑각은 $${deg(`${x}n`)}$`,
            `이등변삼각형의 밑각은 $90^\\circ$ 보다 작아야 하므로 $${x}n<90$, $n<${ftex(90, x)}$`,
            `이등변삼각형은 최대 $${kmax}$ 개 만들 수 있다.`,
            `선분은 $${ov('OA')}$ 와 각 삼각형마다 새로 긋는 한 개씩이므로 $1+${kmax}=${kmax + 1}$ (개)`,
          ],
        };
      },
    },
  ],

  // ───────── 사각형의 성질 ─────────
  'm2b-2': [
    {
      id: 'para-bisector',
      title: '평행사변형과 각의 이등분선',
      gen(r, level) {
        if (level === 1) {
          const a = r.int(3, 12),
            b = a + r.int(2, 9);
          return {
            q: `평행사변형 $ABCD$ 에서 $${ov('AB')}=${a}\\,\\text{cm}$, $${ov('AD')}=${b}\\,\\text{cm}$ 이다. $${ang('A')}$ 의 이등분선이 변 $BC$ 와 만나는 점을 $E$ 라 할 때, $${ov('EC')}$ 의 길이를 구하세요.`,
            answer: { type: 'num', value: b - a, unit: 'cm' },
            steps: [
              `$AD\\parallel BC$ 이므로 $${ang('DAE')}=${ang('AEB')}$ (엇각)`,
              `$${ang('BAE')}=${ang('DAE')}$ 이므로 $${ang('BAE')}=${ang('AEB')}$, 곧 $\\triangle ABE$ 는 이등변삼각형`,
              `$${ov('BE')}=${ov('AB')}=${a}\\,\\text{cm}$`,
              `$${ov('EC')}=${ov('BC')}-${ov('BE')}=${b}-${a}=${b - a}\\,(\\text{cm})$`,
            ],
          };
        }
        if (level === 2) {
          const a = r.int(3, 10);
          let b = 0;
          do b = a + r.int(1, a + 6);
          while (b === 2 * a);
          const e = Math.abs(2 * a - b);
          return {
            q: `평행사변형 $ABCD$ 에서 $${ov('AB')}=${a}\\,\\text{cm}$, $${ov('AD')}=${b}\\,\\text{cm}$ 이다. $${ang('A')}$, $${ang('D')}$ 의 이등분선이 변 $BC$ 와 만나는 점을 각각 $E$, $F$ 라 할 때, $${ov('EF')}$ 의 길이를 구하세요.`,
            answer: { type: 'num', value: e, unit: 'cm' },
            steps: [
              `엇각과 이등분선으로 $\\triangle ABE$ 는 이등변삼각형: $${ov('BE')}=${ov('AB')}=${a}\\,\\text{cm}$`,
              `같은 방법으로 $\\triangle DFC$ 도 이등변삼각형: $${ov('CF')}=${ov('CD')}=${a}\\,\\text{cm}$`,
              b > 2 * a
                ? `$${ov('BE')}+${ov('CF')}=${2 * a}<${b}=${ov('BC')}$ 이므로 두 점은 겹치지 않고 $${ov('EF')}=${b}-${2 * a}=${e}\\,(\\text{cm})$`
                : `$${ov('BE')}+${ov('CF')}=${2 * a}>${b}=${ov('BC')}$ 이므로 두 선분이 겹치고 $${ov('EF')}=${2 * a}-${b}=${e}\\,(\\text{cm})$`,
            ],
          };
        }
        let p = 0,
          q = 0;
        for (;;) {
          p = r.int(1, 5);
          q = r.int(p + 1, 3 * p + 3);
          if (gcd(p, q) === 1 && q !== 2 * p) break;
        }
        const k = r.int(1, 4);
        const e = Math.abs(2 * p - q) * k;
        const a = p * k,
          b = q * k;
        return {
          q: `평행사변형 $ABCD$ 에서 $${ov('AB')}:${ov('AD')}=${p}:${q}$ 이다. $${ang('A')}$, $${ang('D')}$ 의 이등분선이 변 $BC$ 와 만나는 점을 각각 $E$, $F$ 라 하면 $${ov('EF')}=${e}\\,\\text{cm}$ 일 때, 평행사변형 $ABCD$ 의 둘레의 길이를 구하세요.`,
          answer: { type: 'num', value: 2 * (a + b), unit: 'cm' },
          steps: [
            `$${ov('AB')}=${p}k$, $${ov('AD')}=${q}k$ 로 놓는다.`,
            `엇각과 이등분선으로 $${ov('BE')}=${ov('AB')}=${p}k$, $${ov('CF')}=${ov('CD')}=${p}k$`,
            q > 2 * p ? `$${2 * p}k<${q}k$ 이므로 $${ov('EF')}=${q}k-${2 * p}k=${q - 2 * p}k$` : `$${2 * p}k>${q}k$ 이므로 두 선분이 겹쳐 $${ov('EF')}=${2 * p}k-${q}k=${2 * p - q}k$`,
            Math.abs(2 * p - q) === 1 ? `따라서 $k=${e}$` : `$${Math.abs(2 * p - q)}k=${e}$ 에서 $k=${k}$`,
            `둘레 $=2(${p * k}+${q * k})=${2 * (a + b)}\\,(\\text{cm})$`,
          ],
        };
      },
    },
  ],

  // ───────── 도형의 닮음 ─────────
  'm2b-3': [
    {
      id: 'trap-parallel',
      title: '사다리꼴에서 평행선의 길이',
      gen(r, level) {
        if (level === 1) {
          const a = r.int(3, 12),
            b = a + 2 * r.int(1, 6);
          const askPQ = r.chance(0.6);
          return {
            q: `$AD\\parallel BC$ 인 사다리꼴 $ABCD$ 에서 $${ov('AD')}=${a}\\,\\text{cm}$, $${ov('BC')}=${b}\\,\\text{cm}$ 이다. 두 변 $AB$, $DC$ 의 중점을 각각 $M$, $N$ 이라 하고, $${ov('MN')}$ 이 두 대각선 $BD$, $AC$ 와 만나는 점을 각각 $P$, $Q$ 라 할 때, ${askPQ ? `$${ov('PQ')}$` : `$${ov('MN')}$`} 의 길이를 구하세요.`,
            answer: { type: 'num', value: askPQ ? (b - a) / 2 : (a + b) / 2, unit: 'cm' },
            steps: [
              `$\\triangle ABD$ 에서 중점연결정리: $${ov('MP')}=\\frac{1}{2}${ov('AD')}=${fr(a, 2).tex()}$`,
              `$\\triangle ABC$ 에서 중점연결정리: $${ov('MQ')}=\\frac{1}{2}${ov('BC')}=${fr(b, 2).tex()}$`,
              askPQ
                ? `$${ov('PQ')}=${ov('MQ')}-${ov('MP')}=${fr(b, 2).tex()}-${fr(a, 2).tex()}=${(b - a) / 2}\\,(\\text{cm})$`
                : `같은 방법으로 $${ov('QN')}=\\frac{1}{2}${ov('AD')}$ 이므로 $${ov('MN')}=\\frac{1}{2}(${a}+${b})=${(a + b) / 2}\\,(\\text{cm})$`,
            ],
          };
        }
        if (level === 2) {
          let a = 0,
            b = 0,
            m = 0,
            n = 0;
          for (;;) {
            a = r.int(3, 12);
            b = a + r.int(3, 12);
            m = r.int(1, 4);
            n = r.int(1, 4);
            if (gcd(m, n) === 1 && (n * a + m * b) % (m + n) === 0) break;
          }
          const ef = (n * a + m * b) / (m + n);
          return {
            q: `$AD\\parallel BC$ 인 사다리꼴 $ABCD$ 에서 $${ov('AD')}=${a}\\,\\text{cm}$, $${ov('BC')}=${b}\\,\\text{cm}$ 이다. 변 $AB$ 위의 점 $E$ 에 대하여 $${ov('AE')}:${ov('EB')}=${m}:${n}$ 이고, 점 $E$ 를 지나 $BC$ 에 평행한 직선이 변 $DC$ 와 만나는 점을 $F$ 라 할 때, $${ov('EF')}$ 의 길이를 구하세요.`,
            answer: { type: 'num', value: ef, unit: 'cm' },
            steps: [
              `대각선 $AC$ 를 긋고 $${ov('EF')}$ 와 만나는 점을 $G$ 라 한다.`,
              `$\\triangle ABC$ 에서 $EG\\parallel BC$: $${ov('EG')}=${b}\\times\\frac{${m}}{${m + n}}=${fr(b * m, m + n).tex()}$`,
              `$\\triangle CDA$ 에서 $GF\\parallel AD$, $${ov('CG')}:${ov('CA')}=${n}:${m + n}$ 이므로 $${ov('GF')}=${a}\\times\\frac{${n}}{${m + n}}=${fr(a * n, m + n).tex()}$`,
              `$${ov('EF')}=${fr(b * m, m + n).tex()}+${fr(a * n, m + n).tex()}=${ef}\\,(\\text{cm})$`,
            ],
          };
        }
        const a = r.int(2, 12),
          b = a + r.int(2, 12);
        const ef = fr(2 * a * b, a + b);
        const eo = fr(a * b, a + b);
        return {
          q: `$AD\\parallel BC$ 인 사다리꼴 $ABCD$ 에서 $${ov('AD')}=${a}\\,\\text{cm}$, $${ov('BC')}=${b}\\,\\text{cm}$ 이다. 두 대각선의 교점 $O$ 를 지나 $BC$ 에 평행한 직선이 두 변 $AB$, $DC$ 와 만나는 점을 각각 $E$, $F$ 라 할 때, $${ov('EF')}$ 의 길이를 구하세요.`,
          answer: { type: 'num', value: ef.value, unit: 'cm', display: 'frac' },
          steps: [
            `$\\triangle OAD\\sim\\triangle OCB$ (AA 닮음) 이므로 $${ov('AO')}:${ov('OC')}=${a}:${b}$`,
            `$\\triangle ABC$ 에서 $EO\\parallel BC$, $${ov('AO')}:${ov('AC')}=${a}:${a + b}$`,
            `$${ov('EO')}=${b}\\times\\frac{${a}}{${a + b}}=${eo.tex()}$`,
            `같은 방법으로 $\\triangle DBC$ 에서 $${ov('OF')}=${eo.tex()}$`,
            `$${ov('EF')}=2\\times${eo.tex()}=${ef.tex()}\\,(\\text{cm})$`,
          ],
        };
      },
    },
  ],

  // ───────── 피타고라스 정리 ─────────
  'm2b-4': [
    {
      id: 'pyth-fold',
      title: '종이 접기와 피타고라스 정리',
      gen(r, level) {
        const [l1, l2, b] = r.pick(TRI.filter((t) => t[2] <= 30));
        const [a, w] = r.chance(0.5) ? [l1, l2] : [l2, l1];
        const fc = b - w;
        const x = fr(a * a + fc * fc, 2 * a);
        const pts: Record<string, P2> = { A: [0, a], B: [0, 0], C: [b, 0], D: [b, a], F: [w, 0], E: [b, a - x.value] };
        const fig = geo(pts, {
          w: 280,
          h: 190,
          segs: [
            ['A', 'B'],
            ['B', 'C'],
            ['C', 'E'],
            ['A', 'F'],
            ['F', 'E'],
            ['A', 'E'],
          ],
          dashed: [
            ['A', 'D'],
            ['D', 'E'],
          ],
        });
        const intro = `가로의 길이가 $${b}\\,\\text{cm}$, 세로의 길이가 $${a}\\,\\text{cm}$ 인 직사각형 $ABCD$ 를 그림과 같이 $${ov('AE')}$ 를 접는 선으로 하여 꼭짓점 $D$ 가 변 $BC$ 위의 점 $F$ 에 오도록 접었다. (단, $${ov('AB')}=${a}\\,\\text{cm}$, $${ov('AD')}=${b}\\,\\text{cm}$)`;
        const s1 = `접은 선분이므로 $${ov('AF')}=${ov('AD')}=${b}\\,\\text{cm}$`;
        const s2 = `$\\triangle ABF$ 에서 $${ov('BF')}=\\sqrt{${b}^2-${a}^2}=\\sqrt{${b * b - a * a}}=${w}\\,(\\text{cm})$`;
        if (level === 1) return { q: `${intro} $${ov('BF')}$ 의 길이를 구하세요.`, fig, answer: { type: 'num', value: w, unit: 'cm' }, steps: [s1, s2] };
        const s3 = `$${ov('FC')}=${b}-${w}=${fc}\\,(\\text{cm})$`;
        if (level === 2) return { q: `${intro} $${ov('FC')}$ 의 길이를 구하세요.`, fig, answer: { type: 'num', value: fc, unit: 'cm' }, steps: [s1, s2, s3] };
        return {
          q: `${intro} $${ov('DE')}$ 의 길이를 구하세요.`,
          fig,
          answer: { type: 'num', value: x.value, unit: 'cm', display: 'frac' },
          steps: [
            s1,
            s2,
            s3,
            `$${ov('DE')}=${ov('EF')}=x$ 라 하면 $${ov('EC')}=${a}-x$`,
            `$\\triangle EFC$ 에서 $x^2=(${a}-x)^2+${fc}^2$`,
            `$${2 * a}x=${a * a}+${fc * fc}$, $x=${x.tex()}$`,
          ],
        };
      },
    },
  ],

  // ───────── 확률 ─────────
  'm2b-5': [
    {
      id: 'dice-condition',
      title: '조건을 만족하는 경우를 세어 확률 구하기',
      gen(r, level) {
        type Cond = { t: string; f: (a: number, b: number) => boolean };
        let c: Cond;
        if (level === 1) {
          const k = r.pick([3, 4, 5]);
          const m = r.int(4, 6);
          c = r.chance(0.5) ? { t: `두 눈의 수의 합이 $${k}$ 의 배수`, f: (a, b) => (a + b) % k === 0 } : { t: `두 눈의 수의 합이 $${m}$ 이하`, f: (a, b) => a + b <= m };
        } else if (level === 2) {
          const k = r.int(2, 4);
          c = r.pick<Cond>([
            { t: '두 눈의 수의 곱이 짝수', f: (a, b) => (a * b) % 2 === 0 },
            { t: '두 눈의 수의 곱이 $3$ 의 배수', f: (a, b) => (a * b) % 3 === 0 },
            { t: `두 눈의 수의 차가 $${k}$ 이상`, f: (a, b) => Math.abs(a - b) >= k },
            { t: '$a>b$', f: (a, b) => a > b },
          ]);
        } else {
          const k = r.int(7, 13);
          const m = r.pick([3, 4]);
          const yv = r.int(-2, 2);
          c = r.pick<Cond>([
            { t: '$x$ 에 대한 방정식 $ax=b$ 의 해가 정수', f: (a, b) => b % a === 0 },
            { t: `$2a+b\\le ${k}$`, f: (a, b) => 2 * a + b <= k },
            { t: '$a$ 가 $b$ 의 약수이거나 $b$ 가 $a$ 의 약수', f: (a, b) => b % a === 0 || a % b === 0 },
            { t: `$a+2b$ 가 $${m}$ 의 배수`, f: (a, b) => (a + 2 * b) % m === 0 },
            { t: `점 $(a,\\,b)$ 가 직선 $y=x${yv === 0 ? '' : yv > 0 ? '+' + yv : yv}$ 보다 위쪽에 있을`, f: (a, b) => b > a + yv },
          ]);
        }
        const per: number[] = [];
        for (let a = 1; a <= 6; a++) {
          let cnt = 0;
          for (let b = 1; b <= 6; b++) if (c.f(a, b)) cnt++;
          per.push(cnt);
        }
        const tot = per.reduce((s, x) => s + x, 0);
        if (tot === 0 || tot === 36) return this.gen(r, level);
        const pr = fr(tot, 36);
        return {
          q: `서로 다른 두 개의 주사위 A, B 를 동시에 던져 나온 눈의 수를 각각 $a$, $b$ 라 할 때, ${c.t.endsWith('있을') ? c.t + ' 확률' : `${c.t}${c.t.endsWith('$') ? ' ' : ''}일 확률`}을 구하세요.`,
          answer: { type: 'num', value: pr.value, display: 'frac' },
          steps: [
            '모든 경우의 수는 $6\\times6=36$',
            `$a$ 의 값에 따라 조건을 만족하는 $b$ 의 개수: ${per.map((x, i) => `$a=${i + 1}$ 일 때 $${x}$ 개`).join(', ')}`,
            `조건을 만족하는 경우의 수는 $${per.join('+')}=${tot}$`,
            `확률은 $\\frac{${tot}}{36}${pr.d === 36 ? '' : '=' + pr.tex()}$`,
          ],
        };
      },
    },
  ],
};

// ═════════════════════════ 최상위 유형 ═════════════════════════

const POLY = ['', '', '', '', '정사각형', '정오각형', '정육각형'];
const VN = ['A', 'B', 'C', 'D', 'E', 'F'];

function oiAngle(r: Rng) {
  if (r.chance(0.5)) {
    let a = 0;
    do a = 4 * r.int(5, 21);
    while (a === 60);
    const B = (180 - a) / 2;
    const ans = Math.abs(90 - a - B / 2);
    return {
      q: `$${ov('AB')}=${ov('AC')}$ 인 이등변삼각형 $ABC$ 에서 $${ang('A')}=${deg(a)}$ 이다. 이 삼각형의 외심을 $O$, 내심을 $I$ 라 할 때, $${ang('OBI')}$ 의 크기를 구하세요.`,
      answer: { type: 'num' as const, value: ans, unit: '°' },
      steps: [
        `$${ang('ABC')}=${ang('ACB')}=\\frac{180^\\circ-${deg(a)}}{2}=${deg(B)}$`,
        `내심 $I$ 는 $${ang('B')}$ 의 이등분선 위에 있으므로 $${ang('IBC')}=${deg(B / 2)}$`,
        `외심 $O$ 에서 $${ang('BOC')}=2${ang('A')}=${deg(2 * a)}$ 이고 $${ov('OB')}=${ov('OC')}$ 이므로 $${ang('OBC')}=\\frac{180^\\circ-${deg(2 * a)}}{2}=${deg(90 - a)}$`,
        `이등변삼각형이므로 $O$, $I$ 는 모두 꼭짓점 $A$ 에서 $${ov('BC')}$ 에 내린 수선 위에 있고, 반직선 $BO$, $BI$ 는 $${ov('BC')}$ 에 대하여 같은 쪽에 있다.`,
        `$${ang('OBI')}=|${ang('OBC')}-${ang('IBC')}|=|${deg(90 - a)}-${deg(B / 2)}|=${deg(ans)}$`,
      ],
    };
  }
  let a = 0;
  do a = 2 * r.int(21, 44);
  while (a === 60);
  const d = 1.5 * a - 90;
  const cond = d > 0 ? `$${ang('BOC')}$ 의 크기가 $${ang('BIC')}$ 의 크기보다 $${deg(d)}$ 더 크다` : `$${ang('BIC')}$ 의 크기가 $${ang('BOC')}$ 의 크기보다 $${deg(-d)}$ 더 크다`;
  return {
    q: `예각삼각형 $ABC$ 의 외심을 $O$, 내심을 $I$ 라 하자. ${cond}고 할 때, $${ang('A')}$ 의 크기를 구하세요.`,
    answer: { type: 'num' as const, value: a, unit: '°' },
    steps: [
      `$${ang('A')}=${deg('x')}$ 라 하자.`,
      `외심: $\\triangle OAB$, $\\triangle OBC$, $\\triangle OCA$ 가 이등변삼각형이므로 $${ang('BOC')}=2${ang('A')}=${deg('2x')}$`,
      `내심: $${ang('BIC')}=90^\\circ+\\frac{1}{2}${ang('A')}=90^\\circ+\\frac{1}{2}x^\\circ$`,
      d > 0 ? `$2x-\\left(90+\\frac{1}{2}x\\right)=${d}$` : `$\\left(90+\\frac{1}{2}x\\right)-2x=${-d}$`,
      `$\\frac{3}{2}x=${90 + d}$, $x=${a}$`,
      `$${ang('A')}=${deg(a)}$ (예각이므로 조건에 맞음)`,
    ],
  };
}

function rightInCircum(r: Rng) {
  const t = r.pick(TRI.filter((x) => x[2] <= 26));
  const k = t[2] % 2 === 0 ? r.pick([1, 2]) : 2;
  const [a, b, c] = t.map((x) => x * k);
  const R = c / 2,
    rr = (a + b - c) / 2;
  const ask = r.int(0, 2);
  const what = ['넓이', '둘레의 길이', '빗변이 아닌 두 변의 길이의 합'][ask];
  const val = [rr * (rr + 2 * R), 2 * rr + 4 * R, 2 * rr + 2 * R][ask];
  const steps = [
    `직각삼각형의 외심은 빗변의 중점이므로 빗변의 길이는 $2\\times${R}=${c}$`,
    '내접원과 두 직각변의 접점, 직각인 꼭짓점, 내심은 한 변이 $r$ 인 정사각형을 이룬다.',
    `한 꼭짓점에서 내접원까지 그은 두 접선의 길이는 같으므로 (두 직각변의 합) $-$ (빗변) $=2r=${2 * rr}$`,
    `두 직각변의 길이의 합은 $${2 * rr}+${c}=${2 * rr + c}$`,
  ];
  if (ask >= 1) steps.push(`둘레의 길이는 $${2 * rr + c}+${c}=${2 * rr + 2 * c}$`);
  if (ask === 0) steps.push(`둘레의 길이는 $${2 * rr + 2 * c}$`, `넓이 $=\\frac{1}{2}\\times(\\text{내접원의 반지름})\\times(\\text{둘레})=\\frac{1}{2}\\times${rr}\\times${2 * rr + 2 * c}=${val}$`);
  return {
    q: `직각삼각형 $ABC$ 의 외접원의 반지름의 길이가 $${R}\\,\\text{cm}$, 내접원의 반지름의 길이가 $${rr}\\,\\text{cm}$ 일 때, 삼각형 $ABC$ 의 ${what}${jo(what, '을', '를')} 구하세요.`,
    answer: { type: 'num' as const, value: val, unit: ask === 0 ? 'cm²' : 'cm' },
    steps,
  };
}

function equalAreaChain(r: Rng) {
  let m = 0,
    n = 0;
  do {
    m = r.int(1, 5);
    n = r.int(1, 5);
  } while (gcd(m, n) !== 1);
  const t = r.int(1, 6);
  const S = 2 * (m + n) * t;
  const adf = m * t;
  const giveS = r.chance(0.6);
  const cond = `평행사변형 $ABCD$ 에서 변 $BC$ 위의 점 $E$ 는 $${ov('BE')}:${ov('EC')}=${m}:${n}$ 이고, 변 $CD$ 위의 점 $F$ 는 $EF\\parallel BD$ 를 만족한다.`;
  return {
    q: giveS ? `${cond} 평행사변형 $ABCD$ 의 넓이가 $${S}\\,\\text{cm}^2$ 일 때, $\\triangle AFD$ 의 넓이를 구하세요.` : `${cond} $\\triangle AFD$ 의 넓이가 $${adf}\\,\\text{cm}^2$ 일 때, 평행사변형 $ABCD$ 의 넓이를 구하세요.`,
    answer: { type: 'num' as const, value: giveS ? adf : S, unit: 'cm²' },
    steps: [
      `$AD\\parallel BE$ 이므로 밑변 $BE$ 가 같고 높이가 같은 $\\triangle ABE=\\triangle DBE$`,
      `$EF\\parallel BD$ 이므로 밑변 $BD$ 가 같은 $\\triangle DBE=\\triangle DBF$`,
      `$AB\\parallel DF$ 이므로 밑변 $DF$ 가 같은 $\\triangle DBF=\\triangle DAF$`,
      `따라서 $\\triangle AFD=\\triangle ABE=\\frac{${m}}{${m + n}}\\triangle ABC=\\frac{${m}}{${m + n}}\\times\\frac{1}{2}\\square ABCD$`,
      giveS ? `$\\triangle AFD=\\frac{${m}}{${2 * (m + n)}}\\times${S}=${adf}\\,(\\text{cm}^2)$` : `$\\frac{${m}}{${2 * (m + n)}}\\square ABCD=${adf}$ 이므로 $\\square ABCD=${S}\\,(\\text{cm}^2)$`,
    ],
  };
}

function trapezoidDiag(r: Rng) {
  let p = 0,
    q = 0;
  do {
    p = r.int(1, 4);
    q = r.int(p + 1, 6);
  } while (gcd(p, q) !== 1);
  const k = r.int(1, 4);
  const aod = p * p * k,
    aob = p * q * k,
    boc = q * q * k,
    tot = (p + q) ** 2 * k;
  const v = r.int(0, 2);
  const head = `$AD\\parallel BC$ 인 사다리꼴 $ABCD$ 에서 두 대각선의 교점을 $O$ 라 하자.`;
  const common = [
    `$AD\\parallel BC$ 이므로 $\\triangle ABD=\\triangle ACD$ (밑변 $AD$ 공통, 높이 같음), 각각에서 $\\triangle AOD$ 를 빼면 $\\triangle AOB=\\triangle COD$`,
    `높이가 같은 삼각형의 넓이의 비는 밑변의 비: $\\triangle AOD:\\triangle COD=${ov('AO')}:${ov('OC')}=\\triangle AOB:\\triangle BOC$`,
    `따라서 $\\triangle AOD\\times\\triangle BOC=\\triangle AOB\\times\\triangle COD=(\\triangle AOB)^2$`,
  ];
  if (v === 2) {
    return {
      q: `${head} $\\triangle AOD$ 의 넓이가 $${aod}\\,\\text{cm}^2$, $\\triangle OBC$ 의 넓이가 $${boc}\\,\\text{cm}^2$ 일 때, 사다리꼴 $ABCD$ 의 넓이를 구하세요.`,
      answer: { type: 'num' as const, value: tot, unit: 'cm²' },
      steps: [...common, `$(\\triangle AOB)^2=${aod}\\times${boc}=${aob * aob}$ 이므로 $\\triangle AOB=\\triangle COD=${aob}$`, `넓이는 $${aod}+${aob}+${aob}+${boc}=${tot}\\,(\\text{cm}^2)$`],
    };
  }
  return {
    q: `${head} $\\triangle AOD$ 의 넓이가 $${aod}\\,\\text{cm}^2$, $\\triangle ABO$ 의 넓이가 $${aob}\\,\\text{cm}^2$ 일 때, ${v === 0 ? '사다리꼴 $ABCD$' : '$\\triangle OBC$'} 의 넓이를 구하세요.`,
    answer: { type: 'num' as const, value: v === 0 ? tot : boc, unit: 'cm²' },
    steps: [
      ...common,
      `$\\triangle COD=${aob}$, $${aod}\\times\\triangle OBC=${aob}^2$ 이므로 $\\triangle OBC=${boc}$`,
      ...(v === 0 ? [`넓이는 $${aod}+${aob}+${aob}+${boc}=${tot}\\,(\\text{cm}^2)$`] : []),
    ],
  };
}

function ratioCevian(r: Rng) {
  let p = 0,
    q = 0,
    s = 0,
    t = 0;
  do {
    p = r.int(1, 4);
    q = r.int(1, 4);
    s = r.int(1, 4);
    t = r.int(1, 4);
  } while (gcd(p, q) !== 1 || gcd(s, t) !== 1);
  let A = p * (s + t),
    B = q * t;
  const g = gcd(A, B);
  A /= g;
  B /= g;
  const k = r.int(1, 3);
  const L = (A + B) * k;
  const fd = fr(q * t, s + t);
  return {
    q: `$\\triangle ABC$ 에서 변 $AB$ 위의 점 $D$ 는 $${ov('AD')}:${ov('DB')}=${p}:${q}$, 변 $BC$ 위의 점 $E$ 는 $${ov('BE')}:${ov('EC')}=${s}:${t}$ ${jo(String(t), '을', '를')} 만족한다. $${ov('AE')}$ 와 $${ov('CD')}$ 의 교점을 $P$ 라 하고 $${ov('AE')}=${L}\\,\\text{cm}$ 일 때, $${ov('AP')}$ 의 길이를 구하세요.`,
    answer: { type: 'num' as const, value: A * k, unit: 'cm' },
    steps: [
      `점 $E$ 를 지나 $${ov('CD')}$ 에 평행한 직선이 $${ov('AB')}$ 와 만나는 점을 $F$ 라 하자 (보조선).`,
      `$${ov('AD')}=${p}a$, $${ov('DB')}=${q}a$ 로 놓는다.`,
      `$\\triangle BCD$ 에서 $FE\\parallel DC$ 이므로 $${ov('BF')}:${ov('FD')}=${ov('BE')}:${ov('EC')}=${s}:${t}$, $${ov('FD')}=${q}a\\times\\frac{${t}}{${s + t}}=${fd.d === 1 ? fd.n : fd.tex()}a$`,
      `$\\triangle AFE$ 에서 $DP\\parallel FE$ 이므로 $${ov('AP')}:${ov('PE')}=${ov('AD')}:${ov('DF')}=${p}:${fd.tex()}=${A}:${B}$`,
      `$${ov('AP')}=${L}\\times\\frac{${A}}{${A + B}}=${A * k}\\,(\\text{cm})$`,
    ],
  };
}

function rightSimChain(r: Rng) {
  const base = r.pick<[number, number, number]>([
    [3, 4, 5],
    [4, 3, 5],
    [5, 12, 13],
    [12, 5, 13],
  ]);
  const [x, y, z] = base;
  const tt = z === 5 ? r.pick([1, 2]) : 1;
  const BD = x * x * tt,
    DC = y * y * tt,
    AD = x * y * tt,
    AB = x * z * tt;
  const ask = r.int(0, 2);
  const lab = ['DE', 'BE', 'AE'][ask];
  const val = [fr(AD * BD, AB), fr(BD * BD, AB), fr(AD * AD, AB)][ask];
  const last = [
    `$\\triangle ABD$ 의 넓이를 두 가지로: $\\frac{1}{2}\\times${ov('AD')}\\times${ov('BD')}=\\frac{1}{2}\\times${ov('AB')}\\times${ov('DE')}$`,
    `$\\triangle BED\\sim\\triangle BDA$ (AA 닮음) 이므로 $${ov('BD')}^2=${ov('BE')}\\times${ov('BA')}$`,
    `$\\triangle AED\\sim\\triangle ADB$ (AA 닮음) 이므로 $${ov('AD')}^2=${ov('AE')}\\times${ov('AB')}$`,
  ][ask];
  const calc = [`$${AD}\\times${BD}=${AB}\\times${ov('DE')}$, $${ov('DE')}=${val.tex()}$`, `$${BD}^2=${ov('BE')}\\times${AB}$, $${ov('BE')}=${val.tex()}$`, `$${AD}^2=${ov('AE')}\\times${AB}$, $${ov('AE')}=${val.tex()}$`][ask];
  return {
    q: `$${ang('A')}=90^\\circ$ 인 직각삼각형 $ABC$ 의 꼭짓점 $A$ 에서 빗변 $BC$ 에 내린 수선의 발을 $D$, 점 $D$ 에서 $${ov('AB')}$ 에 내린 수선의 발을 $E$ 라 하자. $${ov('BD')}=${BD}$, $${ov('DC')}=${DC}$ 일 때, $${ov(lab)}$ 의 길이를 구하세요.`,
    answer: { type: 'num' as const, value: val.value, display: 'frac' as const },
    steps: [
      `$\\triangle ABC\\sim\\triangle DBA\\sim\\triangle DAC$ (AA 닮음)`,
      `$\\triangle DBA\\sim\\triangle DAC$ 에서 $${ov('AD')}^2=${ov('BD')}\\times${ov('DC')}=${BD}\\times${DC}=${AD * AD}$, $${ov('AD')}=${AD}$`,
      `$\\triangle ABC\\sim\\triangle DBA$ 에서 $${ov('AB')}^2=${ov('BD')}\\times${ov('BC')}=${BD}\\times${BD + DC}=${AB * AB}$, $${ov('AB')}=${AB}$`,
      `$\\triangle ADB$ 는 $${ang('ADB')}=90^\\circ$ 인 직각삼각형이고 $${ov('DE')}$ 는 빗변 $AB$ 에 내린 수선`,
      last,
      calc,
    ],
  };
}

function pythHeight(r: Rng) {
  const legs: [number, number, number][] = [];
  for (const [p, q, c] of triples(50)) {
    legs.push([p, q, c], [q, p, c]); // [u, h, c]
  }
  for (;;) {
    const [u1, h, c1] = r.pick(legs);
    const others = legs.filter((l) => l[1] === h && l[0] !== u1);
    if (!others.length) continue;
    const [u2, , c2] = r.pick(others);
    const obtuse = r.chance(0.4);
    const a = obtuse ? Math.abs(u1 - u2) : u1 + u2;
    if (a > 50 || a < 2) continue;
    // AB = c, AC = b, BH = x
    const [c, b, x] = obtuse ? (u1 > u2 ? [c1, c2, u1] : [c2, c1, u2]) : [c1, c2, u1];
    const askArea = r.chance(0.6);
    const area = (a * h) / 2;
    return {
      q: `세 변의 길이가 $${ov('AB')}=${c}$, $${ov('BC')}=${a}$, $${ov('CA')}=${b}$ 인 $\\triangle ABC$ 의 ${askArea ? '넓이' : `꼭짓점 $A$ 에서 직선 $BC$ 까지의 거리`}를 구하세요.`,
      answer: { type: 'num' as const, value: askArea ? area : h },
      steps: [
        `꼭짓점 $A$ 에서 직선 $BC$ 에 내린 수선의 발을 $H$, $${ov('BH')}=x$ 라 하자.`,
        `$\\triangle ABH$, $\\triangle ACH$ 에서 $${ov('AH')}^2=${c}^2-x^2=${b}^2-(${a}-x)^2$`,
        `$${c * c}-x^2=${b * b}-${a * a}+${2 * a}x-x^2$ 이므로 $${2 * a}x=${c * c - b * b + a * a}$, $x=${x}$`,
        x > a ? `$x=${x}>${a}$ 이므로 $H$ 는 변 $BC$ 의 연장선 위에 있다 (둔각삼각형).` : `$0<x<${a}$ 이므로 $H$ 는 변 $BC$ 위에 있다.`,
        `$${ov('AH')}=\\sqrt{${c}^2-${x}^2}=\\sqrt{${h * h}}=${h}$`,
        ...(askArea ? [`넓이 $=\\frac{1}{2}\\times${a}\\times${h}=${area}$`] : []),
      ],
    };
  }
}

function lune(r: Rng) {
  const t = r.pick(TRI.filter((x) => x[2] <= 30));
  const [a, b] = r.chance(0.5) ? [t[0], t[1]] : [t[1], t[0]];
  const c = t[2];
  const S = (a * b) / 2;
  const desc = `$${ang('C')}=90^\\circ$ 인 직각삼각형 $ABC$ 에서 빗변 $AB$ 를 지름으로 하는 반원을 점 $C$ 쪽에 그리고, 두 변 $BC$, $CA$ 를 각각 지름으로 하는 반원을 삼각형의 바깥쪽에 그렸다. 두 작은 반원에서 큰 반원과 겹치지 않는 두 초승달 모양 부분의 넓이의 합이 $${S}\\,\\text{cm}^2$ 이다.`;
  const common = [
    `$${ov('BC')}=a$, $${ov('CA')}=b$, $${ov('AB')}=c$ 라 하면 세 반원의 넓이는 $\\frac{\\pi}{8}a^2$, $\\frac{\\pi}{8}b^2$, $\\frac{\\pi}{8}c^2$`,
    '피타고라스 정리 $a^2+b^2=c^2$ 에서 (두 작은 반원의 넓이의 합) $=$ (큰 반원의 넓이)',
    '초승달 두 개 $=$ (두 작은 반원 $+\\triangle ABC$) $-$ (큰 반원) $=\\triangle ABC$',
    `따라서 $\\triangle ABC=\\frac{1}{2}ab=${S}$`,
  ];
  if (r.chance(0.5)) {
    const h = fr(2 * S, c);
    return {
      q: `${desc} $${ov('AB')}=${c}\\,\\text{cm}$ 일 때, 꼭짓점 $C$ 에서 빗변 $AB$ 에 내린 수선의 길이를 구하세요.`,
      answer: { type: 'num' as const, value: h.value, unit: 'cm', display: 'frac' as const },
      steps: [...common, `수선의 길이를 $h$ 라 하면 $\\frac{1}{2}\\times${c}\\times h=${S}$, $h=${h.tex()}\\,(\\text{cm})$`],
    };
  }
  return {
    q: `${desc} $${ov('BC')}=${a}\\,\\text{cm}$ 일 때, 삼각형 $ABC$ 의 둘레의 길이를 구하세요.`,
    answer: { type: 'num' as const, value: a + b + c, unit: 'cm' },
    steps: [...common, `$\\frac{1}{2}\\times${a}\\times b=${S}$ 에서 $b=${b}$`, `$c=\\sqrt{${a}^2+${b}^2}=\\sqrt{${c * c}}=${c}$`, `둘레는 $${a}+${b}+${c}=${a + b + c}\\,(\\text{cm})$`],
  };
}

function diceWalk(r: Rng) {
  const n = r.int(4, 6);
  const j = r.int(1, n - 1);
  const back = r.chance(0.4);
  let cnt = 0;
  const sums: number[] = [];
  for (let a = 1; a <= 6; a++)
    for (let b = 1; b <= 6; b++) {
      const pos = (((back ? a - b : a + b) % n) + n) % n;
      if (pos === j) {
        cnt++;
        const s = back ? a - b : a + b;
        if (!sums.includes(s)) sums.push(s);
      }
    }
  sums.sort((x, y) => x - y);
  const name = VN.slice(0, n).join('');
  const pr = fr(cnt, 36);
  const target = VN[j];
  const rule = back
    ? `첫 번째에 나온 눈의 수만큼 시계 방향으로, 두 번째에 나온 눈의 수만큼 시계 반대 방향으로 꼭짓점을 따라 이동한다`
    : `두 번 나온 눈의 수의 합만큼 시계 방향으로 꼭짓점을 따라 이동한다`;
  return {
    q: `${POLY[n]} $${name}$ 의 꼭짓점 $A$ 에 말이 놓여 있다. 꼭짓점은 시계 방향으로 $${VN.slice(0, n).join('\\to ')}$ 의 순서로 놓여 있고, 주사위를 두 번 던져 ${rule}. 이동을 마친 말이 꼭짓점 $${target}$ 에 있을 확률을 구하세요.`,
    answer: { type: 'num' as const, value: pr.value, display: 'frac' as const },
    steps: [
      `두 눈의 수를 차례로 $a$, $b$ 라 하면 모든 경우의 수는 $36$`,
      back ? `말은 시계 방향으로 $a-b$ 칸 이동한 것과 같다 ($-5\\le a-b\\le 5$, 음수면 반대 방향)` : `말은 시계 방향으로 $a+b$ 칸 이동한다 ($2\\le a+b\\le 12$)`,
      `$${n}$ 칸 움직이면 제자리이므로, $${target}$ 에 있으려면 이동한 칸 수가 $${j}$ 에 $${n}$ 의 배수를 더한 수 ($${j - n}$, $${j}$, $${j + n}$, …) 이어야 한다.`,
      `가능한 이동 칸 수: ${sums.map((s) => `$${s}$`).join(', ')}`,
      `각 경우의 $(a,\\,b)$ 를 세면 모두 $${cnt}$ 가지`,
      `확률은 $\\frac{${cnt}}{36}${pr.d === 36 ? '' : '=' + pr.tex()}$`,
    ],
  };
}

function probMixed(r: Rng) {
  const v = r.int(0, 2);
  if (v === 0) {
    const red = r.int(2, 7),
      blue = r.int(2, 7);
    const n = red + blue;
    const p1 = fr(red * (red - 1), n * (n - 1)),
      p2 = fr(blue * red, n * (n - 1));
    const pr = fr(red, n);
    return {
      q: `주머니에 빨간 공 $${red}$ 개와 파란 공 $${blue}$ 개가 들어 있다. 이 주머니에서 공을 한 개씩 두 번 꺼낼 때, 두 번째에 꺼낸 공이 빨간 공일 확률을 구하세요. (단, 꺼낸 공은 다시 넣지 않는다.)`,
      answer: { type: 'num' as const, value: pr.value, display: 'frac' as const },
      steps: [
        '첫 번째 공의 색에 따라 경우를 나눈다.',
        `(i) 빨강 → 빨강: $\\frac{${red}}{${n}}\\times\\frac{${red - 1}}{${n - 1}}=${p1.tex()}$`,
        `(ii) 파랑 → 빨강: $\\frac{${blue}}{${n}}\\times\\frac{${red}}{${n - 1}}=${p2.tex()}$`,
        '두 사건은 동시에 일어나지 않으므로 확률을 더한다.',
        `$${p1.tex()}+${p2.tex()}=${pr.tex()}$`,
        '(참고: 처음 꺼내는 공이 빨간 공일 확률과 같다.)',
      ],
    };
  }
  if (v === 1) {
    const n = r.pick([3, 4]);
    const tot = 3 ** n;
    const dec = 3 * (2 ** n - 2);
    const askDraw = r.chance(0.5);
    const pr = askDraw ? fr(tot - dec, tot) : fr(dec, tot);
    return {
      q: `$${n}$ 명이 가위바위보를 한 번 할 때, ${askDraw ? '승부가 나지 않을' : '승부가 날'} 확률을 구하세요. (단, 각자 가위, 바위, 보를 낼 가능성은 모두 같다.)`,
      answer: { type: 'num' as const, value: pr.value, display: 'frac' as const },
      steps: [
        `모든 경우의 수는 $3^${n}=${tot}$`,
        '승부가 나려면 세 가지 중 정확히 두 가지 손 모양만 나와야 한다.',
        `두 가지 손 모양을 고르는 방법 $3$ 가지, 그 두 가지로 $${n}$ 명이 내는 방법 중 한 가지로만 내는 $2$ 가지를 빼면 $2^${n}-2=${2 ** n - 2}$`,
        `승부가 나는 경우의 수는 $3\\times${2 ** n - 2}=${dec}$`,
        askDraw ? `승부가 나지 않을 확률 $=1-\\frac{${dec}}{${tot}}=${pr.tex()}$` : `확률은 $\\frac{${dec}}{${tot}}=${pr.tex()}$`,
      ],
    };
  }
  const n = r.pick([3, 4]),
    m = r.pick([4, 5]);
  const tot = m ** n;
  const p0 = (m - 1) ** n,
    p1 = n * (m - 1) ** (n - 1);
  const pr = fr(tot - p0 - p1, tot);
  return {
    q: `${m}지선다형 문제 $${n}$ 개에 답을 임의로 하나씩 고를 때, 적어도 $2$ 개를 맞힐 확률을 구하세요. (단, 각 문제의 정답은 한 개이다.)`,
    answer: { type: 'num' as const, value: pr.value, display: 'frac' as const },
    steps: [
      `한 문제를 맞힐 확률 $\\frac{1}{${m}}$, 틀릴 확률 $\\frac{${m - 1}}{${m}}$`,
      '여사건: "맞힌 문제가 $0$ 개 또는 $1$ 개"',
      `$0$ 개: $\\left(\\frac{${m - 1}}{${m}}\\right)^${n}=\\frac{${p0}}{${tot}}$`,
      `$1$ 개: 맞힌 문제를 고르는 $${n}$ 가지 $\\times\\frac{1}{${m}}\\times\\left(\\frac{${m - 1}}{${m}}\\right)^${n - 1}=\\frac{${p1}}{${tot}}$`,
      `구하는 확률 $=1-\\frac{${p0}}{${tot}}-\\frac{${p1}}{${tot}}=${pr.tex()}$`,
    ],
  };
}

export const M2B_TOP: Record<string, Skill[]> = {
  'm2b-1': [
    { id: 'top-oi-angle', title: '외심과 내심이 함께 있는 각', gen: (r) => oiAngle(r) },
    { id: 'top-right-in-circum', title: '직각삼각형의 외접원·내접원과 넓이', gen: (r) => rightInCircum(r) },
  ],
  'm2b-2': [
    { id: 'top-equal-area-chain', title: '평행선을 따라 넓이가 같은 삼각형 잇기', gen: (r) => equalAreaChain(r) },
    { id: 'top-trapezoid-diag', title: '사다리꼴의 대각선으로 나뉜 네 삼각형', gen: (r) => trapezoidDiag(r) },
  ],
  'm2b-3': [
    { id: 'top-ratio-cevian', title: '보조선(평행선)으로 선분의 비 구하기', gen: (r) => ratioCevian(r) },
    { id: 'top-right-sim-chain', title: '직각삼각형의 닮음을 여러 번 쓰기', gen: (r) => rightSimChain(r) },
  ],
  'm2b-4': [
    { id: 'top-pyth-height', title: '세 변으로 높이 구하기 (피타고라스 두 번)', gen: (r) => pythHeight(r) },
    { id: 'top-lune', title: '히포크라테스의 초승달', gen: (r) => lune(r) },
  ],
  'm2b-5': [
    { id: 'top-dice-walk', title: '주사위로 움직이는 말의 위치 확률', gen: (r) => diceWalk(r) },
    { id: 'top-prob-mixed', title: '경우 나누기와 여사건으로 확률 구하기', gen: (r) => probMixed(r) },
  ],
};

