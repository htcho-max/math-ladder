// e3b 심화 추가분 (v0.11): 단원마다 심화 유형 3개 + 최상위 2개
import type { ProblemDraft, Skill } from '../../core/types';
import type { Rng } from '../../core/rng';
import { Svg } from '../../core/fig';
import { gcd, lcm } from '../../core/nt';
import { makeChoices } from '../../core/tex';
import { J, N, c, fr, josa, mx, picGraph, pickName } from './util';
import { fracOk, perms, sum, until } from './hardutil';

const DIG = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const num = (ds: number[]) => ds.reduce((a, b) => a * 10 + b, 0);
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const kgg = (g: number) => (g >= 1000 ? (g % 1000 ? `$${Math.floor(g / 1000)}$ kg $${g % 1000}$ g` : `$${g / 1000}$ kg`) : `$${g}$ g`);
const lml = (ml: number) => (ml >= 1000 ? (ml % 1000 ? `$${Math.floor(ml / 1000)}$ L $${ml % 1000}$ mL` : `$${ml / 1000}$ L`) : `$${ml}$ mL`);
const DAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const ML = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
/** 요일 객관식 */
const dayChoice = (r: Rng, k: number) =>
  makeChoices(
    r,
    DAYS[k],
    DAYS.filter((_, i) => i !== k),
    5,
  );

// ───────── 원 그림 도우미 ─────────
interface Cc {
  x: number;
  y: number;
  r: number;
}
/** 원 여러 개 (수학 좌표, y 위쪽). pts: 이름 붙일 점, segs: 선분, rect: 사각형 [x0,y0,x1,y1] */
function circFig(cs: Cc[], o: { pts?: { x: number; y: number; t: string; dx?: number; dy?: number; dot?: boolean }[]; segs?: [number, number, number, number][]; rect?: [number, number, number, number]; polys?: [number, number][][]; w?: number; h?: number; tags?: { x: number; y: number; t: string }[] } = {}): string {
  const W = o.w ?? 300,
    H0 = o.h ?? 170,
    pad = 22;
  const xs = cs.flatMap((q) => [q.x - q.r, q.x + q.r]);
  const ys = cs.flatMap((q) => [q.y - q.r, q.y + q.r]);
  if (o.rect) xs.push(o.rect[0], o.rect[2]), ys.push(o.rect[1], o.rect[3]);
  const minx = Math.min(...xs),
    maxx = Math.max(...xs),
    miny = Math.min(...ys),
    maxy = Math.max(...ys);
  const sc = Math.min((W - 2 * pad) / (maxx - minx), (H0 - 2 * pad) / (maxy - miny));
  const H = Math.round((maxy - miny) * sc + 2 * pad);
  const ox = (W - (maxx - minx) * sc) / 2;
  const X = (x: number) => ox + (x - minx) * sc;
  const Y = (y: number) => H - pad - (y - miny) * sc;
  const s = new Svg(W, H);
  if (o.rect) {
    const [x0, y0, x1, y1] = o.rect;
    s.rect(X(x0), Y(y1), (x1 - x0) * sc, (y1 - y0) * sc, { cls: 'acc2' });
  }
  for (const q of cs) s.circle(X(q.x), Y(q.y), q.r * sc);
  for (const pg of o.polys ?? [])
    s.poly(
      pg.map(([x, y]) => [X(x), Y(y)] as [number, number]),
      { cls: 'acc' },
    );
  for (const [x1, y1, x2, y2] of o.segs ?? []) s.line(X(x1), Y(y1), X(x2), Y(y2), { cls: 'acc', width: 2 });
  for (const p of o.pts ?? []) {
    if (p.dot !== false) s.dot(X(p.x), Y(p.y), { cls: 'acc' });
    s.text(X(p.x) + (p.dx ?? 0), Y(p.y) + (p.dy ?? 13), p.t, { size: 12 });
  }
  for (const t of o.tags ?? []) s.text(X(t.x), Y(t.y), t.t, { size: 13 });
  return s.toString();
}

// ───────── 그림그래프 주제 ─────────
interface GTheme {
  head: string;
  labels: string[];
  suf: string;
  thing: string;
  unit: string;
  of: (n: string) => string;
}
const GT: GTheme[] = [
  { head: '마을', labels: ['가', '나', '다', '라'], suf: ' 마을', thing: '사과 수확량', unit: '상자', of: (n) => `${n}의 사과 수확량` },
  { head: '과수원', labels: ['햇살', '초록', '푸른', '별빛'], suf: ' 과수원', thing: '배 수확량', unit: '상자', of: (n) => `${n}의 배 수확량` },
  { head: '농장', labels: ['하늘', '바다', '숲속', '들판'], suf: ' 농장', thing: '감자 수확량', unit: 'kg', of: (n) => `${n}의 감자 수확량` },
  { head: '목장', labels: ['푸른', '초록', '하늘', '별빛'], suf: ' 목장', thing: '우유 생산량', unit: 'L', of: (n) => `${n}의 우유 생산량` },
  { head: '가게', labels: ['해님', '달님', '별님', '구름'], suf: ' 가게', thing: '하루 동안 팔린 빵의 수', unit: '개', of: (n) => `${n}에서 하루 동안 팔린 빵의 수` },
];
const gName = (th: GTheme, i: number) => th.labels[i] + th.suf;
const gFig = (th: GTheme, vals: number[], units: number[]) => picGraph(th.labels, vals, units, { unitName: th.unit, head: th.head });
const gIntro = (th: GTheme) => `${th.head}별 ${J(th.thing, '을/를')} 조사하여 나타낸 그림그래프입니다.`;
/** 그림 수가 가장 적게 되도록 나타낼 때 그림 개수들 */
function iconCounts(v: number, units: number[]): number[] {
  let rem = v;
  return units.map((u) => {
    const k = Math.floor(rem / u);
    rem -= k * u;
    return k;
  });
}
/** '…이었습니다/였습니다' (수 읽기 받침에 맞게) */
const was = (n: number) => (josa(n, '이/') ? '이었습니다' : '였습니다');
const UNIT_NAMES = (n: number) => (n === 2 ? ['큰 그림', '작은 그림'] : ['큰 그림', '중간 그림', '작은 그림']);

// ═════════════════════════════ 심화 유형 ═════════════════════════════
export const MORE_E3B: Record<string, Skill[]> = {
  // ───────── e3b-1 곱셈
  'e3b-1': [
    {
      id: 'mul-wrong-digit',
      title: '잘못 계산한 곱셈 바르게 하기',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const b = r.int(3, 9);
          if (r.chance(0.5)) {
            const q = r.int(12, 40),
              x = q * b;
            return {
              q: `어떤 수에 ${N(b, '을/를')} 곱해야 할 것을 잘못하여 $${b}$${josa(b, '으로/로')} 나누었더니 ${N(q, '이/가')} 되었습니다. 바르게 계산하면 얼마인가요?`,
              answer: { type: 'num', value: x * b },
              steps: [`어떤 수 $\\div${b}=${q}$ → 어떤 수 $=${q}\\times${b}=${x}$`, `바르게 계산: $${x}\\times${b}=${c(x * b)}$`],
              hint: '먼저 잘못 계산한 식으로 어떤 수를 구해요.',
            };
          }
          // 어떤 수는 몇십 (세 자리 수 ÷ 한 자리 수는 다음 단원이라 곱셈구구로 거꾸로 찾게 함)
          const t = r.int(2, 9),
            x = 10 * t;
          return {
            q: `어떤 수에서 ${N(b, '을/를')} 빼야 할 것을 잘못하여 ${N(b, '을/를')} 곱했더니 ${N(x * b, '이/가')} 되었습니다. 바르게 계산하면 얼마인가요?`,
            answer: { type: 'num', value: x - b },
            steps: [`어떤 수 $\\times${b}=${x * b}$ → $${t}\\times${b}=${t * b}$이므로 $${x}\\times${b}=${x * b}$ → 어떤 수 $=${x}$`, `바르게 계산: $${x}-${b}=${x - b}$`],
            hint: '곱셈과 나눗셈의 관계를 이용해 어떤 수부터 구해요.',
          };
        }
        if (level === 2) {
          if (r.chance(0.5)) {
            const t = r.int(2, 9),
              x = 10 * t; // 세 자리 수 ÷ 한 자리 수는 다음 단원 → 곱셈구구로 거꾸로 찾을 수 있게 몇십
            const a = r.int(1, 9),
              b = r.int(2, 9),
              m = 10 * a + b;
            return {
              q: `${pickName(r)}는 어떤 두 자리 수에 ${N(m, '을/를')} 곱하는 세로셈을 하다가, 십의 자리 계산을 빠뜨리고 일의 자리 숫자 $${b}$만 곱한 값 ${N(x * b, '을/를')} 답으로 썼습니다. 바르게 계산하면 얼마인가요?`,
              answer: { type: 'num', value: x * m },
              steps: [`잘못 계산한 식: 어떤 수 $\\times${b}=${x * b}$`, `$${t}\\times${b}=${t * b}$이므로 $${x}\\times${b}=${x * b}$ → 어떤 수 $=${x}$`, `바르게 계산: $${x}\\times${m}=${c(x * m)}$`],
              hint: '잘못 계산한 식은 (어떤 수)×(일의 자리 숫자)예요.',
            };
          }
          const m = r.int(12, 49),
            y = r.int(m + 3, 99);
          return {
            q: `어떤 수에 ${N(m, '을/를')} 곱해야 할 것을 잘못하여 ${N(m, '을/를')} 뺐더니 ${N(y - m, '이/가')} 되었습니다. 바르게 계산하면 얼마인가요?`,
            answer: { type: 'num', value: y * m },
            steps: [`어떤 수 $-${m}=${y - m}$ → 어떤 수 $=${y - m}+${m}=${y}$`, `바르게 계산: $${y}\\times${m}=${c(y * m)}$`],
            hint: '뺄셈을 거꾸로 하면 덧셈이에요.',
          };
        }
        const a = r.int(1, 8),
          b = r.int(1, 9),
          m = 10 * a + b;
        const tens = r.chance(0.5);
        // 세 자리 수 ÷ 한 자리 수는 다음 단원: 십의 자리는 1 차이로만 잘못 보게 하고(÷10), 일의 자리를 잘못 본 경우 어떤 수는 몇십
        const x = tens ? r.int(12, 89) : 10 * r.int(2, 9);
        let wrongDigit: number, mw: number;
        if (tens) {
          wrongDigit = a === 1 ? 2 : r.chance(0.5) ? a - 1 : a + 1;
          mw = 10 * wrongDigit + b;
        } else {
          wrongDigit = until(
            () => r.int(0, 9),
            (v) => v !== b,
          );
          mw = 10 * a + wrongDigit;
        }
        const diff = Math.abs(mw - m);
        const D = x * diff;
        const big = mw > m;
        const origDigit = tens ? a : b;
        return {
          q: `어떤 두 자리 수에 ${N(m, '을/를')} 곱해야 할 것을 잘못하여 $${m}$의 ${tens ? '십의 자리' : '일의 자리'} 숫자 ${N(origDigit, '을/를')} $${wrongDigit}$${josa(wrongDigit, '으로/로')} 잘못 보고 곱했더니, 바르게 계산한 값보다 $${c(D)}$만큼 ${big ? '커졌습니다' : '작아졌습니다'}. 바르게 계산한 값은 얼마인가요?`,
          answer: { type: 'num', value: x * m },
          steps: [
            `잘못 본 수는 $${mw}$이고, $${Math.max(m, mw)}-${Math.min(m, mw)}=${diff}$${josa(diff, '이에요/예요')}.`,
            `곱하는 수가 $${diff}$만큼 ${big ? '커졌으므로 어떤 수를' : '작아졌으므로 어떤 수를'} $${diff}$번 ${big ? '더' : '덜'} 더한 셈이에요 → 어떤 수 $\\times${diff}=${c(D)}$`,
            tens ? `어떤 수 $=${c(D)}\\div10=${x}$` : `$${x / 10}\\times${diff}=${(x / 10) * diff}$이므로 $${x}\\times${diff}=${c(D)}$ → 어떤 수 $=${x}$`,
            `바르게 계산: $${x}\\times${m}=${c(x * m)}$`,
          ],
          hint: '바른 곱과 잘못된 곱의 차는 (어떤 수)×(두 곱하는 수의 차)예요.',
        };
      },
    },
    {
      id: 'mul-rule',
      title: '곱셈식의 규칙을 찾아 계산하기',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const k = r.int(4, 9);
          const kkk = 111 * k;
          const ask = r.chance(0.5);
          return {
            q: `곱셈식을 보고 규칙을 찾았습니다. $$37\\times3=111\\quad 37\\times6=222\\quad 37\\times9=333$$ 규칙을 이용하여 ${ask ? `$37\\times\\square=${kkk}$일 때 □ 안에 알맞은 수를 구하세요.` : `$37\\times${3 * k}$의 값을 구하세요.`}`,
            answer: { type: 'num', value: ask ? 3 * k : kkk },
            steps: [`곱하는 수가 $3$씩 커지면 곱은 $111$씩 커져요.`, `$37\\times${3 * k}$는 $37\\times3$의 $${k}$배 → $111\\times${k}=${kkk}$`, ask ? `□ $=${3 * k}$` : `답: $${kkk}$`],
          };
        }
        if (level === 2) {
          if (r.chance(0.5)) {
            const pool = DIG.flatMap((a) => DIG.filter((b) => a + b <= 9).map((b) => 10 * a + b));
            const [t, ...ex] = r.sample(pool, 4);
            const a = Math.floor(t / 10),
              b = t % 10;
            return {
              q: `곱셈식을 보고 규칙을 찾았습니다. $$${ex.map((e) => `11\\times${e}=${11 * e}`).join('\\quad ')}$$ 규칙을 이용하여 $11\\times\\square=${11 * t}$일 때 □ 안에 알맞은 두 자리 수를 구하세요.`,
              answer: { type: 'num', value: t },
              steps: [`$11\\times$(두 자리 수)의 곱은 백의 자리에 십의 자리 숫자, 일의 자리에 일의 자리 숫자, 십의 자리에 두 숫자의 합이 와요.`, `$${11 * t}$: 백의 자리 $${a}$, 일의 자리 $${b}$ (가운데 $${a + b}=${a}+${b}$)`, `□ $=${t}$`],
            };
          }
          const [t, ...ex] = r.sample(range(12, 98).filter((v) => v % 10 !== 0 && v % 11 !== 0), 4);
          return {
            q: `곱셈식을 보고 규칙을 찾았습니다. $$${ex.map((e) => `101\\times${e}=${c(101 * e)}`).join('\\quad ')}$$ 규칙을 이용하여 $101\\times\\square=${c(101 * t)}$일 때 □ 안에 알맞은 수를 구하세요.`,
            answer: { type: 'num', value: t },
            steps: [`$101\\times$(두 자리 수)는 그 두 자리 수를 두 번 이어 쓴 네 자리 수가 돼요.`, `$${c(101 * t)}$은 $${t}$를 두 번 이어 쓴 수`, `□ $=${t}$`],
          };
        }
        if (r.chance(0.5)) {
          const [a, ...ex] = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 4);
          const t = 10 * a + 5;
          const exs = ex.sort((x, y) => x - y).map((e) => `${10 * e + 5}\\times${10 * e + 5}=${c((10 * e + 5) ** 2)}`);
          return {
            q: `곱셈식을 보고 규칙을 찾았습니다. $$${exs.join('\\quad ')}$$ 일의 자리 숫자가 $5$인 같은 두 자리 수를 두 번 곱했더니 $${c(t * t)}$이 되었습니다. 곱한 두 자리 수를 구하세요.`,
            answer: { type: 'num', value: t },
            steps: [
              `규칙: $\\square5\\times\\square5$의 곱은 (□)$\\times$(□$+1$) 뒤에 $25$를 붙인 수예요. 예) $${10 * ex[0] + 5}\\times${10 * ex[0] + 5}$ → $${ex[0]}\\times${ex[0] + 1}=${ex[0] * (ex[0] + 1)}$, 뒤에 $25$`,
              `$${c(t * t)}$에서 $25$ 앞의 수는 $${a * (a + 1)}$`,
              `$${a}\\times${a + 1}=${a * (a + 1)}$이므로 □ $=${a}$`,
              `곱한 수는 $${t}$ ($${t}\\times${t}=${c(t * t)}$)`,
            ],
            hint: '곱의 앞부분과 십의 자리 숫자 사이의 관계를 찾아보세요.',
          };
        }
        const pool = range(1, 8).flatMap((a) => range(1, 9).filter((b) => a + b >= 10).map((b) => 10 * a + b));
        const [t, ...ex] = r.sample(pool, 4);
        const a = Math.floor(t / 10),
          b = t % 10;
        const P = 11 * t;
        return {
          q: `곱셈식을 보고 규칙을 찾았습니다. $$${ex.map((e) => `11\\times${e}=${11 * e}`).join('\\quad ')}$$ 규칙을 이용하여 $11\\times\\square=${P}$일 때 □ 안에 알맞은 두 자리 수를 구하세요.`,
          answer: { type: 'num', value: t },
          steps: [
            `$11\\times$(두 자리 수)는 두 숫자의 합을 가운데에 넣은 수예요. 합이 $10$ 이상이면 받아올림이 있어요.`,
            `곱의 일의 자리 $${b}$ → □의 일의 자리 숫자는 $${b}$`,
            `곱의 백의 자리 $${a + 1}$은 (□의 십의 자리 숫자)$+1$ (받아올림) → 십의 자리 숫자는 $${a}$`,
            `확인: 가운데 $${a}+${b}=${a + b}$ → $${(a + b) % 10}$을 쓰고 $1$을 받아올림`,
            `□ $=${t}$`,
          ],
          hint: '예시에서 두 숫자의 합이 $10$을 넘을 때 어떻게 되는지 살펴보세요.',
        };
      },
    },
    {
      id: 'mul-sum-product',
      title: '곱과 합으로 두 수 찾기',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const n = r.int(11, 31);
          const t = Math.floor(n / 10) * 10;
          return {
            q: `연속하는 두 자연수의 곱이 $${c(n * (n + 1))}$입니다. 두 수 중 작은 수를 구하세요.`,
            answer: { type: 'num', value: n },
            steps: [`어림하기: $${t}\\times${t}=${c(t * t)}$, $${t + 10}\\times${t + 10}=${c((t + 10) ** 2)}$ → 두 수는 $${t}$과 $${t + 10}$ 사이`, `일의 자리를 맞추어 보면 $${n}\\times${n + 1}=${c(n * (n + 1))}$`, `작은 수: $${n}$`],
            hint: '같은 몇십끼리 곱해 어림해 보세요.',
          };
        }
        if (level === 2) {
          if (r.chance(0.5)) {
            const n = r.int(21, 69);
            const t = Math.floor(n / 10) * 10;
            return {
              q: `연속하는 두 자연수의 곱이 $${c(n * (n + 1))}$입니다. 두 수의 합을 구하세요.`,
              answer: { type: 'num', value: 2 * n + 1 },
              steps: [`어림하기: $${t}\\times${t}=${c(t * t)}$, $${t + 10}\\times${t + 10}=${c((t + 10) ** 2)}$ → 두 수는 $${t}$과 $${t + 10}$ 사이`, `곱의 일의 자리 숫자 $${(n * (n + 1)) % 10}$에 맞는 수를 찾으면 $${n}\\times${n + 1}=${c(n * (n + 1))}$`, `합: $${n}+${n + 1}=${2 * n + 1}$`],
              hint: '먼저 몇십끼리의 곱으로 어림해 보세요.',
            };
          }
          const n = r.int(6, 34) * 2;
          const t = Math.floor(n / 10) * 10;
          return {
            q: `연속하는 두 짝수의 곱이 $${c(n * (n + 2))}$입니다. 두 수 중 큰 수를 구하세요.`,
            answer: { type: 'num', value: n + 2 },
            steps: [`어림하기: $${t}\\times${t}=${c(t * t)}$, $${t + 10}\\times${t + 10}=${c((t + 10) ** 2)}$ → 두 수는 $${t}$ 근처부터 $${t + 10}$ 근처 사이`, `차가 $2$인 짝수끼리 곱해 보면 $${n}\\times${n + 2}=${c(n * (n + 2))}$`, `큰 수: $${n + 2}$`],
            hint: '연속하는 두 짝수는 $2$ 차이 나요.',
          };
        }
        const [a, b] = until(
          () => {
            const a = r.int(12, 60);
            return [a, a + r.int(2, 14)];
          },
          ([a, b]) => b <= 79 && a % 10 !== 0 && b % 10 !== 0,
        );
        const S = a + b,
          P = a * b;
        const ask = r.pick(['big', 'small', 'diff'] as const);
        const m1 = Math.floor(S / 2),
          m2 = S - m1;
        const k2 = Math.floor((b - a) / 2) >= 2 ? [m1 - 1, m2 + 1] : null;
        return {
          q: `합이 $${S}$이고 곱이 $${c(P)}$인 두 자리 수 두 개가 있습니다. ${ask === 'big' ? '두 수 중 큰 수를 구하세요.' : ask === 'small' ? '두 수 중 작은 수를 구하세요.' : '두 수의 차를 구하세요.'}`,
          answer: { type: 'num', value: ask === 'big' ? b : ask === 'small' ? a : b - a },
          steps: [
            `합이 $${S}$인 두 수를 가운데부터 생각해요: $${m1}\\times${m2}=${c(m1 * m2)}$ → $${c(P)}$보다 커요.`,
            `합이 같을 때 두 수의 차가 커질수록 곱은 작아져요.`,
            ...(k2 ? [`$${k2[0]}\\times${k2[1]}=${c(k2[0] * k2[1])}$ → 아직 커요.`] : []),
            `차를 더 늘려 보면 $${a}\\times${b}=${c(P)}$ (합 $${a}+${b}=${S}$)`,
            `두 수는 $${a}$, $${b}$ → 답: $${ask === 'big' ? b : ask === 'small' ? a : b - a}$`,
          ],
          hint: '합이 같은 두 수의 곱은 두 수가 가까울수록 커요.',
        };
      },
    },
  ],

  // ───────── e3b-2 나눗셈
  'e3b-2': [
    {
      id: 'div-cards',
      title: '수 카드로 몫이 가장 크거나 작은 나눗셈 만들기',
      gen(r, level): ProblemDraft {
        type Arr = { a: number; d: number; q: number; m: number };
        const all = (cards: number[], k: number): Arr[] =>
          perms(cards, k + 1).map((p) => {
            const a = num(p.slice(0, k)),
              d = p[k];
            return { a, d, q: Math.floor(a / d), m: a % d };
          });
        const k = level === 1 ? 2 : 3;
        const n = level === 1 ? 3 : 4;
        const kind = level === 3 ? r.pick(['min', 'exact'] as const) : 'max';
        const [cards, best, list] = until(
          () => {
            const cards = r.sample([2, 3, 4, 5, 6, 7, 8, 9], n).sort((x, y) => x - y);
            let list = all(cards, k);
            if (kind === 'exact') list = list.filter((x) => x.m === 0);
            list.sort((x, y) => (kind === 'min' ? x.q - y.q : y.q - x.q));
            return [cards, list[0], list] as [number[], Arr | undefined, Arr[]];
          },
          ([cards, best, list]) => {
            if (!best || list.length < 2 || list[1].q === best.q) return false;
            if (kind === 'max') return best.d === cards[0] && best.a === num([...cards.slice(1)].reverse().slice(0, k));
            if (kind === 'min') return best.d === cards[n - 1] && best.a === num(cards.slice(0, k));
            return list.length >= 3;
          },
        );
        const ct = cards.map((x) => `\\boxed{${x}}`).join('\\;');
        const shape = k === 2 ? '(두 자리 수)$\\div$(한 자리 수)' : '(세 자리 수)$\\div$(한 자리 수)';
        const use = level === 1 ? '모두 한 번씩 사용하여' : '한 번씩 모두 사용하여';
        const fields = { type: 'fields' as const, fields: [{ label: '몫', value: best!.q }, { label: '나머지', value: best!.m }] };
        if (kind === 'exact') {
          return {
            q: `수 카드 $${ct}$를 ${use} ${shape}의 나눗셈식을 만들려고 합니다. 나누어떨어지는 나눗셈식 중에서 몫이 가장 큰 식의 몫을 구하세요.`,
            answer: { type: 'num', value: best!.q },
            steps: [
              `몫이 크려면 나누어지는 수는 크고, 나누는 수는 작아야 해요. 하지만 나누어떨어져야 해요.`,
              `나누어떨어지는 식을 몫이 큰 것부터 찾으면:`,
              ...list.slice(0, 3).map((x) => `$${x.a}\\div${x.d}=${x.q}$`),
              `몫이 가장 큰 것: $${best!.a}\\div${best!.d}=${best!.q}$`,
            ],
            hint: '나누는 수를 하나씩 정해 놓고 나누어떨어지는 가장 큰 수를 찾아보세요.',
          };
        }
        const isMax = kind === 'max';
        return {
          q: `수 카드 $${ct}$를 ${use} ${shape}의 나눗셈식을 만들려고 합니다. 몫이 가장 ${isMax ? '큰' : '작은'} 나눗셈식을 만들었을 때의 몫과 나머지를 구하세요.`,
          answer: fields,
          steps: [
            isMax ? '몫이 가장 크려면 나누어지는 수는 가장 크게, 나누는 수는 가장 작게 해야 해요.' : '몫이 가장 작으려면 나누어지는 수는 가장 작게, 나누는 수는 가장 크게 해야 해요.',
            `나누는 수: $${best!.d}$, 나머지 카드로 만든 가장 ${isMax ? '큰' : '작은'} 수: $${best!.a}$`,
            `$${best!.a}\\div${best!.d}=${best!.q}\\cdots${best!.m}$`,
            `몫 $${best!.q}$, 나머지 $${best!.m}$`,
          ],
        };
      },
    },
    {
      id: 'div-reverse',
      title: '거꾸로 생각하여 나누기 전의 수 구하기',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const b = r.int(2, 9);
          if (r.chance(0.5)) {
            const q = r.int(3, Math.floor(99 / b)),
              cc = r.int(5, 40);
            const x = q * b;
            return {
              q: `어떤 수를 $${b}$${josa(b, '으로/로')} 나눈 몫에 ${N(cc, '을/를')} 더했더니 ${N(q + cc, '이/가')} 되었습니다. 어떤 수를 구하세요. (어떤 수는 $${b}$${josa(b, '으로/로')} 나누어떨어집니다.)`,
              answer: { type: 'num', value: x },
              steps: [`거꾸로: $${q + cc}-${cc}=${q}$ (나눈 몫)`, `어떤 수 $=${q}\\times${b}=${x}$`],
              hint: '마지막 계산부터 거꾸로 해요.',
            };
          }
          const q = r.int(4, 15),
            cc = r.int(2, b * q - 1);
          const x = q * b - cc;
          return {
            q: `어떤 수에 ${N(cc, '을/를')} 더한 다음 $${b}$${josa(b, '으로/로')} 나누었더니 몫이 $${q}$이고 나누어떨어졌습니다. 어떤 수를 구하세요.`,
            answer: { type: 'num', value: x },
            steps: [`거꾸로: 나누기 전의 수 $=${q}\\times${b}=${q * b}$`, `어떤 수 $=${q * b}-${cc}=${x}$`],
            hint: '나눗셈을 거꾸로 하면 곱셈이에요.',
          };
        }
        if (level === 2) {
          const b = r.int(3, 9),
            m = r.int(2, 9),
            q = r.int(6, 40),
            a = r.int(5, 60);
          const x = q * b + a;
          return {
            q: `어떤 수에서 ${N(a, '을/를')} 뺀 다음 $${b}$${josa(b, '으로/로')} 나누고, 그 몫에 ${N(m, '을/를')} 곱했더니 ${N(q * m, '이/가')} 되었습니다. 어떤 수를 구하세요. (나눗셈은 나누어떨어집니다.)`,
            answer: { type: 'num', value: x },
            steps: [`거꾸로 ①: $${q * m}\\div${m}=${q}$ (나눈 몫)`, `거꾸로 ②: $${q}\\times${b}=${q * b}$ (나누기 전의 수)`, `거꾸로 ③: $${q * b}+${a}=${x}$`, `어떤 수: $${x}$`],
            hint: '빼기 → 나누기 → 곱하기의 순서를 거꾸로, 반대 계산으로 해요.',
          };
        }
        const a = r.int(3, 9),
          b = r.int(3, 6);
        const r1 = r.int(1, a - 1),
          r2 = r.int(1, b - 1),
          q2 = r.int(3, 9);
        const bags = q2 * b + r2;
        const x = bags * a + r1;
        if (r.chance(0.35)) {
          return {
            q: `어떤 수를 $${a}$${josa(a, '으로/로')} 나누었더니 나머지가 $${r1}$${was(r1)}. 이때의 몫을 다시 $${b}$${josa(b, '으로/로')} 나누었더니 몫이 $${q2}$, 나머지가 $${r2}$${was(r2)}. 어떤 수를 구하세요.`,
            answer: { type: 'num', value: x },
            steps: [`처음 나눗셈의 몫 $=${b}\\times${q2}+${r2}=${bags}$`, `어떤 수 $=${a}\\times${bags}+${r1}$`, `$=${a * bags}+${r1}=${x}$`, `확인: $${x}\\div${a}=${bags}\\cdots${r1}$, $${bags}\\div${b}=${q2}\\cdots${r2}$`],
            hint: '두 번째 나눗셈부터 거꾸로 검산식을 써요.',
          };
        }
        const th = r.pick([
          { w: '사탕', u: '개', g: '봉지', box: '상자' },
          { w: '쿠키', u: '개', g: '봉지', box: '바구니' },
          { w: '연필', u: '자루', g: '묶음', box: '상자' },
          { w: '색종이', u: '장', g: '묶음', box: '상자' },
        ]);
        const name = pickName(r);
        return {
          q: `${name}는 ${J(th.w, '을/를')} 한 ${th.g}에 $${a}$${th.u}씩 담았더니 $${r1}$${J(th.u, '이/가')} 남았습니다. 이 ${th.g}들을 다시 한 ${th.box}에 $${b}$${th.g}씩 담았더니 $${q2}$${th.box}가 되고 $${r2}$${J(th.g, '이/가')} 남았습니다. 처음에 있던 ${J(th.w, '은/는')} 몇 ${th.u}인가요?`,
          answer: { type: 'num', value: x, unit: th.u },
          steps: [
            `${th.g}의 수: $${b}\\times${q2}+${r2}=${bags}$ (${th.g})`,
            `${th.g}에 담은 ${th.w}: $${a}\\times${bags}=${a * bags}$ (${th.u})`,
            `처음 ${th.w}: $${a * bags}+${r1}=${x}$ (${th.u})`,
            `확인: $${x}\\div${a}=${bags}\\cdots${r1}$, $${bags}\\div${b}=${q2}\\cdots${r2}$`,
          ],
          hint: `먼저 ${J(th.g, '이/가')} 모두 몇 ${th.g}인지 구해요.`,
        };
      },
    },
    {
      id: 'div-weekday',
      title: '나머지로 요일 알아보기',
      gen(r, level): ProblemDraft {
        const d0 = r.int(0, 6);
        if (level === 1) {
          const n = r.int(10, 65);
          const k = (d0 + n) % 7;
          return {
            q: `오늘은 ${DAYS[d0]}입니다. 오늘부터 $${n}$일 후는 무슨 요일인가요?`,
            answer: dayChoice(r, k),
            steps: [`같은 요일은 $7$일마다 돌아와요.`, `$${n}\\div7=${Math.floor(n / 7)}\\cdots${n % 7}$`, `$${Math.floor(n / 7)}$주 후는 다시 ${DAYS[d0]}, 그로부터 $${n % 7}$일 후 → ${DAYS[k]}`],
            hint: '$7$로 나눈 나머지만큼 요일을 옮겨요.',
          };
        }
        if (level === 2) {
          const m = r.int(3, 11);
          const d1 = r.int(1, ML[m - 1] - 3),
            d2 = r.int(1, 28);
          const n = ML[m - 1] - d1 + d2;
          const k = (d0 + n) % 7;
          return {
            q: `어느 해 $${m}$월 $${d1}$일은 ${DAYS[d0]}입니다. 같은 해 $${m + 1}$월 $${d2}$일은 무슨 요일인가요?`,
            answer: dayChoice(r, k),
            steps: [
              `$${m}$월은 $${ML[m - 1]}$일까지 있어요. $${m}$월 $${d1}$일부터 $${m}$월 $${ML[m - 1]}$일까지 $${ML[m - 1] - d1}$일, 거기서 $${d2}$일 더 → $${ML[m - 1] - d1}+${d2}=${n}$(일) 후`,
              `$${n}\\div7=${Math.floor(n / 7)}\\cdots${n % 7}$`,
              `${DAYS[d0]}에서 $${n % 7}$일 후 → ${DAYS[k]}`,
            ],
            hint: '먼저 며칠 후인지 구해요.',
          };
        }
        if (r.chance(0.5)) {
          const n = r.int(100, 365);
          const k = (d0 + n - 1) % 7;
          return {
            q: `${pickName(r)}는 ${DAYS[d0]}인 오늘부터 매일 줄넘기를 하기로 했습니다. 오늘을 첫째 날로 하여 줄넘기를 시작한 지 $${n}$째 되는 날은 무슨 요일인가요?`,
            answer: dayChoice(r, k),
            steps: [`첫째 날이 오늘이므로 $${n}$째 날은 오늘부터 $${n}-1=${n - 1}$(일) 후예요.`, `$${n - 1}\\div7=${Math.floor((n - 1) / 7)}\\cdots${(n - 1) % 7}$`, `${DAYS[d0]}에서 $${(n - 1) % 7}$일 후 → ${DAYS[k]}`],
            hint: '$n$째 날은 $n$일 후가 아니에요.',
          };
        }
        const m1 = r.int(3, 9),
          gap = r.int(2, 3),
          m2 = m1 + gap;
        const d1 = r.int(1, 28),
          d2 = r.int(1, 28);
        const mids = range(m1 + 1, m2 - 1);
        const n = ML[m1 - 1] - d1 + sum(mids.map((m) => ML[m - 1])) + d2;
        const k = (d0 + n) % 7;
        return {
          q: `어느 해 $${m1}$월 $${d1}$일은 ${DAYS[d0]}입니다. 같은 해 $${m2}$월 $${d2}$일은 무슨 요일인가요?`,
          answer: dayChoice(r, k),
          steps: [
            `$${m1}$월 $${d1}$일 → $${m1}$월 $${ML[m1 - 1]}$일: $${ML[m1 - 1] - d1}$일`,
            `${mids.map((m) => `$${m}$월: $${ML[m - 1]}$일`).join(', ')}, $${m2}$월 $${d2}$일까지 $${d2}$일`,
            `모두 $${[ML[m1 - 1] - d1, ...mids.map((m) => ML[m - 1]), d2].join('+')}=${n}$(일) 후`,
            `$${n}\\div7=${Math.floor(n / 7)}\\cdots${n % 7}$ → ${DAYS[d0]}에서 $${n % 7}$일 후`,
            `답: ${DAYS[k]}`,
          ],
          hint: '달마다 날수(30일, 31일)를 확인해요.',
        };
      },
    },
  ],

  // ───────── e3b-3 원
  'e3b-3': [
    {
      id: 'circle-overlap',
      title: '겹쳐 그린 원에서 선분의 길이 구하기',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const R = r.int(4, 12),
            w = r.int(2, R);
          const cx2 = 2 * R - w;
          const fig = circFig(
            [
              { x: 0, y: 0, r: R },
              { x: cx2, y: 0, r: R },
            ],
            {
              segs: [[-R, 0, cx2 + R, 0]],
              pts: [
                { x: -R, y: 0, t: 'ㄱ', dx: -8, dy: 4 },
                { x: cx2 - R, y: 0, t: 'ㄷ', dx: -6, dy: 13 },
                { x: R, y: 0, t: 'ㄹ', dx: 6, dy: 13 },
                { x: cx2 + R, y: 0, t: 'ㄴ', dx: 8, dy: 4 },
              ],
            },
          );
          return {
            q: `반지름이 $${R}$ cm인 원 $2$개를 그림과 같이 겹쳐 그렸습니다. 선분 ㄷㄹ의 길이가 $${w}$ cm일 때, 선분 ㄱㄴ의 길이는 몇 cm인가요? (선분 ㄱㄴ은 두 원의 중심을 지납니다.)`,
            fig,
            answer: { type: 'num', value: 4 * R - w, unit: 'cm' },
            steps: [`선분 ㄱㄹ과 선분 ㄷㄴ은 각각 원의 지름: $${R}\\times2=${2 * R}$ (cm)`, `두 지름을 더하면 겹친 부분 ㄷㄹ을 두 번 더한 셈이에요.`, `ㄱㄴ $=${2 * R}+${2 * R}-${w}=${4 * R - w}$ (cm)`],
            hint: '원의 지름 두 개를 더한 뒤 겹친 부분을 빼요.',
          };
        }
        if (level === 2) {
          const [a, b] = until(
            () => [r.int(5, 14), r.int(3, 10)],
            ([a, b]) => a > b + 1,
          );
          const w = r.int(2, b - 1);
          const cx2 = a + b - w; // 중심 사이 거리 (작은 원의 중심은 큰 원 밖)
          const L = 2 * a + 2 * b - w;
          const ask = r.chance(0.5) ? 'w' : 'center';
          const fig = circFig(
            [
              { x: 0, y: 0, r: a },
              { x: cx2, y: 0, r: b },
            ],
            {
              segs: [[-a, 0, cx2 + b, 0]],
              pts: [
                { x: -a, y: 0, t: 'ㄱ', dx: -8, dy: 4 },
                { x: cx2 - b, y: 0, t: 'ㄷ', dx: -6, dy: 13 },
                { x: a, y: 0, t: 'ㄹ', dx: 6, dy: 13 },
                { x: cx2 + b, y: 0, t: 'ㄴ', dx: 8, dy: 4 },
                { x: 0, y: 0, t: 'ㅇ', dy: -9 },
                { x: cx2, y: 0, t: 'ㅅ', dy: -9 },
              ],
            },
          );
          return {
            q: `점 ㅇ을 원의 중심으로 하는 반지름 $${a}$ cm인 원과 점 ㅅ을 원의 중심으로 하는 반지름 $${b}$ cm인 원을 그림과 같이 겹쳐 그렸습니다. 선분 ㄱㄴ의 길이가 $${L}$ cm일 때, ${ask === 'w' ? '선분 ㄷㄹ' : '선분 ㅇㅅ'}의 길이는 몇 cm인가요?`,
            fig,
            answer: { type: 'num', value: ask === 'w' ? w : cx2, unit: 'cm' },
            steps:
              ask === 'w'
                ? [`두 원의 지름: $${2 * a}$ cm, $${2 * b}$ cm`, `두 지름의 합은 ㄱㄴ보다 겹친 부분 ㄷㄹ만큼 길어요.`, `ㄷㄹ $=${2 * a}+${2 * b}-${L}=${w}$ (cm)`]
                : [`ㄱㅇ은 큰 원의 반지름 $${a}$ cm, ㅅㄴ은 작은 원의 반지름 $${b}$ cm`, `ㅇㅅ $=$ ㄱㄴ $-$ ㄱㅇ $-$ ㅅㄴ`, `$${L}-${a}-${b}=${cx2}$ (cm)`],
            hint: '선분 ㄱㄴ을 반지름·지름으로 나누어 보세요.',
          };
        }
        const n = r.int(3, 5),
          R = r.int(4, 12),
          w = r.int(2, R - 1);
        const L = 2 * R * n - (n - 1) * w;
        const step = 2 * R - w;
        const cs = range(0, n - 1).map((i) => ({ x: i * step, y: 0, r: R }));
        const fig = circFig(cs, {
          segs: [[-R, 0, (n - 1) * step + R, 0]],
          pts: [
            { x: -R, y: 0, t: 'ㄱ', dx: -8, dy: 4 },
            { x: (n - 1) * step + R, y: 0, t: 'ㄴ', dx: 8, dy: 4 },
          ],
        });
        return {
          q: `크기가 같은 원 $${n}$개를 그림과 같이 한 줄로 겹쳐 그렸습니다. 이웃한 두 원이 겹쳐진 부분에서 선분 ㄱㄴ 위에 놓인 부분의 길이는 각각 $${w}$ cm이고, 선분 ㄱㄴ의 길이는 $${L}$ cm입니다. 원의 반지름은 몇 cm인가요?`,
          fig,
          answer: { type: 'num', value: R, unit: 'cm' },
          steps: [
            `원 $${n}$개의 지름을 모두 더하면 겹친 부분 $${n - 1}$곳을 한 번씩 더 센 길이예요.`,
            `지름 $${n}$개의 합 $=${L}+${w}\\times${n - 1}=${L}+${w * (n - 1)}=${L + w * (n - 1)}$ (cm)`,
            `지름: $${L + w * (n - 1)}\\div${n}=${2 * R}$ (cm)`,
            `반지름: $${2 * R}\\div2=${R}$ (cm)`,
          ],
          hint: '지름을 모두 더한 길이와 선분 ㄱㄴ의 차이를 생각해 보세요.',
        };
      },
    },
    {
      id: 'circle-frame',
      title: '직사각형 모양으로 늘어놓은 원',
      gen(r, level): ProblemDraft {
        const R = r.int(2, 9);
        const frame = (m: number, n: number, outer: boolean) => {
          const cs: Cc[] = [];
          for (let i = 0; i < m; i++)
            for (let j = 0; j < n; j++) if (i === 0 || j === 0 || i === m - 1 || j === n - 1) cs.push({ x: i * 2 * R, y: j * 2 * R, r: R });
          const W = 2 * R * (m - 1),
            H = 2 * R * (n - 1);
          return circFig(
            cs,
            outer
              ? { rect: [-R, -R, W + R, H + R], w: 280, h: 200 }
              : {
                  polys: [
                    [
                      [0, 0],
                      [W, 0],
                      [W, H],
                      [0, H],
                    ],
                  ],
                  w: 280,
                  h: 200,
                  pts: [
                    [0, 0],
                    [W, 0],
                    [W, H],
                    [0, H],
                  ].map(([x, y]) => ({ x, y, t: '', dy: 0 })),
                },
          );
        };
        if (level <= 2) {
          const [m, n] = until(
            () => (level === 1 ? [r.int(3, 4), r.int(3, 4)] : [r.int(4, 6), r.int(3, 4)]),
            ([m, n]) => level === 1 || m !== n,
          );
          const outer = level === 2;
          const ans = outer ? 2 * (2 * R * m + 2 * R * n) : 2 * (2 * R * (m - 1) + 2 * R * (n - 1));
          return {
            q: outer
              ? `반지름이 $${R}$ cm인 원을 서로 맞닿게 그림과 같이 직사각형 모양으로 늘어놓고, 원들을 꼭 맞게 둘러싸는 직사각형을 그렸습니다. 이 직사각형의 네 변의 길이의 합은 몇 cm인가요?`
              : `반지름이 $${R}$ cm인 원을 서로 맞닿게 그림과 같이 늘어놓았습니다. 네 모퉁이에 있는 원의 중심을 이어 만든 직사각형의 네 변의 길이의 합은 몇 cm인가요?`,
            fig: frame(m, n, outer),
            answer: { type: 'num', value: ans, unit: 'cm' },
            steps: outer
              ? [`가로로 원 $${m}$개 → 가로는 지름 $${m}$개: $${2 * R}\\times${m}=${2 * R * m}$ (cm)`, `세로로 원 $${n}$개 → 세로는 지름 $${n}$개: $${2 * R}\\times${n}=${2 * R * n}$ (cm)`, `네 변의 합: $(${2 * R * m}+${2 * R * n})\\times2=${ans}$ (cm)`]
              : [
                  `맞닿은 두 원의 중심 사이 거리는 지름과 같아요: $${2 * R}$ cm`,
                  `가로: 원 $${m}$개 → 중심 사이 $${m - 1}$칸 → $${2 * R}\\times${m - 1}=${2 * R * (m - 1)}$ (cm)`,
                  `세로: 원 $${n}$개 → $${2 * R}\\times${n - 1}=${2 * R * (n - 1)}$ (cm)`,
                  `네 변의 합: $(${2 * R * (m - 1)}+${2 * R * (n - 1)})\\times2=${ans}$ (cm)`,
                ],
            hint: outer ? '직사각형의 가로에는 원의 지름이 몇 개 들어가나요?' : '중심 사이의 칸 수는 원의 수보다 하나 적어요.',
          };
        }
        const [m, n] = until(
          () => [r.int(4, 8), r.int(3, 6)],
          ([m, n]) => m !== n && m + n - 2 <= 9,
        );
        const Ntot = 2 * m + 2 * n - 4;
        const P = 4 * R * (m + n - 2);
        return {
          q: `크기가 같은 원 $${Ntot}$개를 서로 맞닿게 직사각형의 테두리 모양으로 늘어놓았습니다. 가로 한 줄에는 원이 $${m}$개씩 놓였고, 네 모퉁이에 있는 원의 중심을 이어 만든 직사각형의 네 변의 길이의 합은 $${P}$ cm입니다. 원의 반지름은 몇 cm인가요?`,
          answer: { type: 'num', value: R, unit: 'cm' },
          steps: [
            `가로 두 줄에 $${m}\\times2=${2 * m}$개, 나머지 $${Ntot}-${2 * m}=${Ntot - 2 * m}$개는 세로 두 줄의 가운데 → 세로 한 줄에는 $${(Ntot - 2 * m) / 2}+2=${n}$개`,
            `중심 사이 칸 수: 가로 $${m - 1}$칸, 세로 $${n - 1}$칸 → 네 변에 모두 $(${m - 1}+${n - 1})\\times2=${2 * (m + n - 2)}$칸`,
            `한 칸은 지름: $${P}\\div${2 * (m + n - 2)}$ → $${P / 2}\\div${m + n - 2}=${2 * R}$ (cm)`,
            `반지름: $${2 * R}\\div2=${R}$ (cm)`,
          ],
          hint: '먼저 세로 한 줄에 원이 몇 개 있는지 구해요. 모퉁이 원은 가로줄과 세로줄에 함께 들어가요.',
        };
      },
    },
    {
      id: 'circle-center-shape',
      title: '원의 중심과 원 위의 점으로 만든 도형',
      gen(r, level): ProblemDraft {
        if (level <= 2) {
          const R = r.int(4, 15),
            L = r.int(Math.ceil(R / 2), 2 * R - 1);
          const th = 2 * Math.asin(L / (2 * R));
          const a0 = -Math.PI / 2 - th / 2;
          const pA = { x: R * Math.cos(a0), y: R * Math.sin(a0) },
            pB = { x: R * Math.cos(a0 + th), y: R * Math.sin(a0 + th) };
          const fig = circFig([{ x: 0, y: 0, r: R }], {
            polys: [
              [
                [0, 0],
                [pA.x, pA.y],
                [pB.x, pB.y],
              ],
            ],
            pts: [
              { x: 0, y: 0, t: 'ㅇ', dy: -9 },
              { x: pA.x, y: pA.y, t: 'ㄱ', dx: -10, dy: 10 },
              { x: pB.x, y: pB.y, t: 'ㄴ', dx: 10, dy: 10 },
            ],
            w: 200,
            h: 180,
          });
          const P = 2 * R + L;
          if (level === 1)
            return {
              q: `점 ㅇ은 원의 중심이고, 점 ㄱ과 점 ㄴ은 원 위의 점입니다. 원의 반지름이 $${R}$ cm이고 선분 ㄱㄴ의 길이가 $${L}$ cm일 때, 삼각형 ㄱㅇㄴ의 세 변의 길이의 합은 몇 cm인가요?`,
              fig,
              answer: { type: 'num', value: P, unit: 'cm' },
              steps: [`선분 ㅇㄱ과 선분 ㅇㄴ은 원의 반지름: 각각 $${R}$ cm`, `세 변의 합: $${R}+${R}+${L}=${P}$ (cm)`],
              hint: '원의 중심에서 원 위의 점까지는 모두 반지름이에요.',
            };
          return {
            q: `점 ㅇ은 원의 중심이고, 점 ㄱ과 점 ㄴ은 원 위의 점입니다. 삼각형 ㄱㅇㄴ의 세 변의 길이의 합이 $${P}$ cm이고 선분 ㄱㄴ의 길이가 $${L}$ cm일 때, 원의 지름은 몇 cm인가요?`,
            fig,
            answer: { type: 'num', value: 2 * R, unit: 'cm' },
            steps: [`선분 ㅇㄱ, ㅇㄴ은 반지름이므로 길이가 같아요.`, `두 반지름의 합: $${P}-${L}=${2 * R}$ (cm)`, `두 반지름의 합은 지름과 같으므로 지름은 $${2 * R}$ cm`],
            hint: '반지름 두 개를 더하면 지름이에요.',
          };
        }
        const R = r.int(3, 15);
        const h = (R * Math.sqrt(3)) / 2;
        const fig = circFig(
          [
            { x: 0, y: 0, r: R },
            { x: R, y: 0, r: R },
          ],
          {
            polys: [
              [
                [0, 0],
                [R / 2, h],
                [R, 0],
                [R / 2, -h],
              ],
            ],
            segs: [[0, 0, R, 0]],
            pts: [
              { x: 0, y: 0, t: 'ㄱ', dx: -9, dy: 4 },
              { x: R, y: 0, t: 'ㄴ', dx: 9, dy: 4 },
              { x: R / 2, y: h, t: 'ㄷ', dy: -7 },
              { x: R / 2, y: -h, t: 'ㄹ', dy: 15 },
            ],
            w: 260,
            h: 170,
          },
        );
        const kind = r.pick(['quad', 'tri', 'tri-rev'] as const);
        const intro = `크기가 같은 두 원을 그림과 같이 한 원의 중심이 다른 원 위에 오도록 겹쳐 그렸습니다. 점 ㄱ, ㄴ은 두 원의 중심이고, 점 ㄷ, ㄹ은 두 원이 만나는 점입니다.`;
        if (kind === 'quad') {
          return {
            q: `${intro} 사각형 ㄱㄷㄴㄹ의 네 변의 길이의 합이 $${4 * R}$ cm일 때, 원의 지름은 몇 cm인가요?`,
            fig,
            answer: { type: 'num', value: 2 * R, unit: 'cm' },
            steps: [`ㄱㄷ, ㄱㄹ은 원 ㄱ의 반지름, ㄴㄷ, ㄴㄹ은 원 ㄴ의 반지름이에요.`, `두 원의 크기가 같으므로 네 변의 길이가 모두 반지름으로 같아요.`, `반지름: $${4 * R}\\div4=${R}$ (cm)`, `지름: $${R}\\times2=${2 * R}$ (cm)`],
            hint: '사각형의 네 변이 각각 어느 원의 반지름인지 찾아보세요.',
          };
        }
        if (kind === 'tri') {
          return {
            q: `${intro} 원의 지름이 $${2 * R}$ cm일 때, 삼각형 ㄱㄴㄷ의 세 변의 길이의 합은 몇 cm인가요?`,
            fig,
            answer: { type: 'num', value: 3 * R, unit: 'cm' },
            steps: [`반지름: $${2 * R}\\div2=${R}$ (cm)`, `ㄱㄴ: 점 ㄴ이 원 ㄱ 위에 있으므로 원 ㄱ의 반지름`, `ㄱㄷ은 원 ㄱ의 반지름, ㄴㄷ은 원 ㄴ의 반지름`, `세 변의 합: $${R}\\times3=${3 * R}$ (cm)`],
            hint: '점 ㄴ은 원 ㄱ 위의 점이에요.',
          };
        }
        return {
          q: `${intro} 삼각형 ㄱㄴㄷ의 세 변의 길이의 합이 $${3 * R}$ cm일 때, 사각형 ㄱㄷㄴㄹ의 네 변의 길이의 합은 몇 cm인가요?`,
          fig,
          answer: { type: 'num', value: 4 * R, unit: 'cm' },
          steps: [`삼각형 ㄱㄴㄷ의 세 변은 모두 반지름 → 반지름: $${3 * R}\\div3=${R}$ (cm)`, `사각형 ㄱㄷㄴㄹ의 네 변도 모두 반지름`, `네 변의 합: $${R}\\times4=${4 * R}$ (cm)`],
          hint: '두 도형의 변이 모두 반지름이에요.',
        };
      },
    },
  ],

  // ───────── e3b-4 분수
  'e3b-4': [
    {
      id: 'frac-cards',
      title: '수 카드로 가장 큰 분수·가장 작은 분수 만들기',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const big = r.chance(0.5);
          const [cards, w, n, d] = until(
            () => {
              const cards = r.sample(DIG, 3).sort((x, y) => x - y);
              const [w, n, d] = big ? [cards[2], cards[0], cards[1]] : [cards[0], cards[1], cards[2]];
              return [cards, w, n, d];
            },
            ([, , n, d]) => gcd(n, d) === 1,
          );
          const ct = (cards as number[]).map((x) => `\\boxed{${x}}`).join('\\;');
          return {
            q: `수 카드 $${ct}$를 한 번씩 모두 사용하여 대분수를 만들려고 합니다. 만들 수 있는 가장 ${big ? '큰' : '작은'} 대분수를 구하세요.`,
            answer: { type: 'num', value: (w as number) + (n as number) / (d as number), display: 'mixed' },
            steps: [`대분수는 자연수 부분이 ${big ? '클수록 커요 → 가장 큰' : '작을수록 작아요 → 가장 작은'} $${w}$를 자연수 부분에 놓아요.`, `남은 두 수로 진분수를 만들어요: 분자가 분모보다 작아야 하므로 $${fr(n as number, d as number)}$`, `답: $${w}${fr(n as number, d as number)}$`],
            hint: '진분수는 분자가 분모보다 작아요.',
          };
        }
        if (level === 2) {
          const [cards, d, w, n] = until(
            () => {
              const cards = r.sample(DIG, 4).sort((x, y) => x - y);
              const d = r.pick(cards.slice(1));
              const others = cards.filter((x) => x !== d);
              let best = { v: -1, w: 0, n: 0 };
              for (const [w, n] of perms(others, 2)) if (n < d && w + n / d > best.v) best = { v: w + n / d, w, n };
              return [cards, d, best.w, best.n];
            },
            ([cards, d, w, n]) => {
              const others = cards.filter((x) => x !== d);
              return n > 0 && gcd(n, d) === 1 && w === Math.max(...others) && others.filter((x) => x < d).length >= 2;
            },
          );
          const ct = cards.map((x) => `\\boxed{${x}}`).join('\\;');
          const top = w * d + n;
          return {
            q: `수 카드 $${ct}$ 중에서 $3$장을 골라 한 번씩만 사용하여 분모가 $${d}$인 대분수를 만들려고 합니다. 만들 수 있는 가장 큰 대분수를 가분수로 나타내세요.`,
            answer: { type: 'num', value: top / d, display: 'frac' },
            steps: [
              `분모는 $${d}$로 정해져 있어요. 남은 카드: ${cards
                .filter((x) => x !== d)
                .map((x) => `$${x}$`)
                .join(', ')}`,
              `자연수 부분이 클수록 크므로 자연수 부분은 $${w}$`,
              `분자는 $${d}$보다 작아야 하므로 남은 수 중 $${d}$보다 작은 가장 큰 수 $${n}$ → $${w}${fr(n, d)}$`,
              `가분수로: $${d}\\times${w}+${n}=${top}$ → $${fr(top, d)}$`,
            ],
            hint: '대분수 $\\square\\frac{a}{b}$를 가분수로 바꾸면 분자는 $b\\times\\square+a$예요.',
          };
        }
        const big = r.chance(0.5);
        const [cards, list] = until(
          () => {
            const cards = r.sample([2, 3, 4, 5, 6, 7, 8, 9], 3).sort((x, y) => x - y);
            const list = perms(cards, 3)
              .map((p) => ({ n: 10 * p[0] + p[1], d: p[2] }))
              .sort((x, y) => (big ? y.n / y.d - x.n / x.d : x.n / x.d - y.n / y.d));
            return [cards, list] as [number[], { n: number; d: number }[]];
          },
          ([, list]) => fracOk(list[0].n, list[0].d) && list[0].n % list[0].d !== 0 && Math.floor(list[0].n / list[0].d) !== Math.floor(list[1].n / list[1].d),
        );
        const ct = cards.map((x) => `\\boxed{${x}}`).join('\\;');
        const b0 = list[0],
          b1 = list[1];
        return {
          q: `수 카드 $${ct}$를 한 번씩 모두 사용하여 분자는 두 자리 수, 분모는 한 자리 수인 가분수를 만들려고 합니다. 만들 수 있는 가장 ${big ? '큰' : '작은'} 가분수를 대분수로 나타내세요.`,
          answer: { type: 'num', value: b0.n / b0.d, display: 'mixed' },
          steps: [
            big ? '분모는 작을수록, 분자는 클수록 큰 분수예요.' : '분모는 클수록, 분자는 작을수록 작은 분수예요.',
            `후보: $${fr(b0.n, b0.d)}=${mx(b0.n, b0.d)}$, $${fr(b1.n, b1.d)}=${mx(b1.n, b1.d)}$`,
            `대분수로 바꾸어 자연수 부분을 비교하면 $${Math.floor(b0.n / b0.d)}${big ? '>' : '<'}${Math.floor(b1.n / b1.d)}$`,
            `가장 ${big ? '큰' : '작은'} 가분수: $${fr(b0.n, b0.d)}=${mx(b0.n, b0.d)}$`,
          ],
          hint: '분모가 다른 가분수는 대분수로 바꾸어 자연수 부분을 비교해 보세요.',
        };
      },
    },
    {
      id: 'frac-range-count',
      title: '조건에 맞는 분수의 개수',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const [d, lo, hi] = until(
            () => {
              const d = r.int(3, 9);
              const lo = r.int(d + 1, 4 * d);
              return [d, lo, lo + r.int(4, 14)];
            },
            ([d, lo, hi]) => fracOk(lo, d) && fracOk(hi, d) && lo % d !== 0 && hi % d !== 0,
          );
          const leftMixed = r.chance(0.5);
          const L = leftMixed ? mx(lo, d) : fr(lo, d),
            H = leftMixed ? fr(hi, d) : mx(hi, d);
          const cnt = hi - lo - 1;
          return {
            q: `□ 안에 들어갈 수 있는 자연수는 모두 몇 개인가요? $$${L}<${fr(1, d).replace('{1}', '{\\square}')}<${H}$$`,
            answer: { type: 'num', value: cnt, unit: '개' },
            steps: [leftMixed ? `$${L}=${fr(lo, d)}$` : `$${H}=${fr(hi, d)}$`, `$${fr(lo, d)}<\\frac{\\square}{${d}}<${fr(hi, d)}$ → □는 $${lo + 1}$부터 $${hi - 1}$까지`, `$${hi - 1}-${lo + 1}+1=${cnt}$(개)`],
            hint: '대분수를 가분수로 바꾸어 분자끼리 비교해요.',
          };
        }
        if (level === 2) {
          if (r.chance(0.4)) {
            const b = r.int(2, 6),
              a = b + r.int(4, 12);
            return {
              q: `□ 안에 들어갈 수 있는 자연수는 모두 몇 개인가요? $$${fr(1, a)}<\\frac{1}{\\square}<${fr(1, b)}$$`,
              answer: { type: 'num', value: a - b - 1, unit: '개' },
              steps: [`분자가 $1$인 분수는 분모가 작을수록 커요.`, `$${fr(1, a)}$보다 크려면 □는 $${a}$보다 작고, $${fr(1, b)}$보다 작으려면 □는 $${b}$보다 커요.`, `□: $${b + 1}$부터 $${a - 1}$까지 → $${a - b - 1}$개`],
              hint: '단위분수는 분모가 클수록 작아요.',
            };
          }
          const [d, lo, hi] = until(
            () => {
              const d = r.int(3, 9);
              const lo = r.int(d + 1, 5 * d);
              return [d, lo, lo + r.int(5, 2 * d + 3)];
            },
            ([d, lo, hi]) => fracOk(lo, d) && fracOk(hi, d) && lo % d !== 0 && hi % d !== 0 && Math.floor(lo / d) !== Math.floor(hi / d),
          );
          const cnt = hi - lo - 1;
          return {
            q: `□ 안에 들어갈 수 있는 자연수는 모두 몇 개인가요? $$${mx(lo, d)}<\\frac{\\square}{${d}}<${mx(hi, d)}$$`,
            answer: { type: 'num', value: cnt, unit: '개' },
            steps: [`$${mx(lo, d)}=${fr(lo, d)}$, $${mx(hi, d)}=${fr(hi, d)}$`, `□는 $${lo}$보다 크고 $${hi}$보다 작은 수: $${lo + 1}$부터 $${hi - 1}$까지`, `$${hi - 1}-${lo + 1}+1=${cnt}$(개)`],
            hint: '두 대분수를 모두 가분수로 바꾸어요.',
          };
        }
        const [d, w1, w2, m, list] = until(
          () => {
            const d = r.int(3, 9),
              w1 = r.int(1, 5),
              w2 = w1 + r.int(1, 2),
              m = r.int(2, 5);
            const list = range(w1 * d + 1, w2 * d - 1).filter((x) => x % m === 0);
            return [d, w1, w2, m, list] as [number, number, number, number, number[]];
          },
          ([d, , , m, list]) => list.length >= 2 && list.length <= 9 && m !== d,
        );
        return {
          q: `다음 조건을 모두 만족하는 분수는 몇 개인가요?\n- 분모가 $${d}$인 가분수입니다.\n- $${w1}$보다 크고 $${w2}$보다 작습니다.\n- 분자는 $${m}$${josa(m, '으로/로')} 나누어떨어집니다.`,
          answer: { type: 'num', value: list.length, unit: '개' },
          steps: [
            `$${w1}=${fr(w1 * d, d)}$, $${w2}=${fr(w2 * d, d)}$ → 분자는 $${w1 * d}$보다 크고 $${w2 * d}$보다 작은 수`,
            `분자가 될 수 있는 수: $${w1 * d + 1}$부터 $${w2 * d - 1}$까지`,
            `이 중 $${m}$${josa(m, '으로/로')} 나누어떨어지는 수: ${list.map((x) => `$${x}$`).join(', ')}`,
            `분수: ${list.map((x) => `$${fr(x, d)}$`).join(', ')} → $${list.length}$개`,
          ],
          hint: '자연수를 분모가 같은 분수로 나타내 보세요.',
        };
      },
    },
    {
      id: 'frac-sequence',
      title: '규칙에 따라 늘어놓은 분수',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const [d, n] = until(
            () => [r.int(3, 9), r.int(10, 40)],
            ([d, n]) => n > d && n % d !== 0 && fracOk(n, d),
          );
          const seq = range(1, 4).map((k) => `\\frac{${k}}{${d}}`);
          return {
            q: `규칙에 따라 분수를 늘어놓았습니다. $$${seq.join(',\\ ')},\\ \\dots$$ $${n}$째 분수를 대분수로 나타내세요.`,
            answer: { type: 'num', value: n / d, display: 'mixed' },
            steps: [`분모는 $${d}$로 같고 분자가 $1$씩 커져요 → $${n}$째 분수는 $${fr(n, d)}$`, `$${n}\\div${d}=${Math.floor(n / d)}\\cdots${n % d}$ → $${mx(n, d)}$`],
            hint: '$n$째 분수의 분자는 $n$이에요.',
          };
        }
        if (level === 2) {
          const [d, a, s, n] = until(
            () => [r.pick([5, 7, 8, 9]), r.int(1, 4), r.int(2, 4), r.int(8, 20)],
            ([d, a, s, n]) => {
              const t = a + (n - 1) * s;
              return s !== d && a < d && fracOk(t, d) && t % d !== 0;
            },
          );
          const t = a + (n - 1) * s;
          const seq = range(0, 3).map((k) => `\\frac{${a + k * s}}{${d}}`);
          return {
            q: `규칙에 따라 분수를 늘어놓았습니다. $$${seq.join(',\\ ')},\\ \\dots$$ $${n}$째 분수를 대분수로 나타내세요.`,
            answer: { type: 'num', value: t / d, display: 'mixed' },
            steps: [
              `분모는 $${d}$로 같고 분자는 $${a}$부터 $${s}$씩 커져요.`,
              `$${n}$째 분수의 분자: $${a}$에 $${s}$를 $${n - 1}$번 더한 수 → $${a}+${s}\\times${n - 1}=${t}$`,
              `$${fr(t, d)}$ → $${t}\\div${d}=${Math.floor(t / d)}\\cdots${t % d}$ → $${mx(t, d)}$`,
            ],
            hint: '첫째 분수에서 분자가 몇 번 커졌는지 세어 보세요.',
          };
        }
        const T = (q: number) => (q * (q - 1)) / 2; // 분모가 q 이하인 진분수 개수
        const shown = '\\frac{1}{2},\\ \\frac{1}{3},\\ \\frac{2}{3},\\ \\frac{1}{4},\\ \\frac{2}{4},\\ \\frac{3}{4},\\ \\frac{1}{5},\\ \\dots';
        if (r.chance(0.5)) {
          const n = until(
            () => r.int(16, 60),
            (n) => !range(2, 12).some((q) => T(q) === n),
          );
          let q = 2;
          while (T(q) < n) q++;
          const p = n - T(q - 1);
          return {
            q: `규칙에 따라 진분수를 늘어놓았습니다. $$${shown}$$ 처음부터 $${n}$째에 놓이는 분수의 분자와 분모를 구하세요.`,
            answer: { type: 'fields', fields: [{ label: '분자', value: p }, { label: '분모', value: q }] },
            steps: [
              `분모가 $2$인 것 $1$개, $3$인 것 $2$개, $4$인 것 $3$개, … 분모가 □인 분수는 (□$-1$)개예요.`,
              `분모가 $${q - 1}$인 분수까지: $${range(1, q - 2).join('+')}=${T(q - 1)}$(개)`,
              `$${n}-${T(q - 1)}=${p}$ → 분모가 $${q}$인 분수 중 $${p}$째`,
              `$${n}$째 분수: $${fr(p, q)}$ (분자 $${p}$, 분모 $${q}$)`,
            ],
            hint: '분모가 같은 분수끼리 묶어 개수를 세어 보세요.',
          };
        }
        const q = r.int(7, 12),
          p = r.int(1, q - 1);
        const pos = T(q - 1) + p;
        return {
          q: `규칙에 따라 진분수를 늘어놓았습니다. $$${shown}$$ $${fr(p, q)}$는 처음부터 몇째에 놓이나요?`,
          answer: { type: 'num', value: pos, unit: '째' },
          steps: [
            `분모가 □인 분수는 $\\frac{1}{\\square}$부터 $\\frac{\\square-1}{\\square}$까지 (□$-1$)개예요.`,
            `분모가 $${q - 1}$인 분수까지: $${range(1, q - 2).join('+')}=${T(q - 1)}$(개)`,
            `$${fr(p, q)}$는 분모가 $${q}$인 분수 중 $${p}$째`,
            `$${T(q - 1)}+${p}=${pos}$ → $${pos}$째`,
          ],
          hint: '분모가 같은 분수끼리 묶어 생각해요.',
        };
      },
    },
  ],

  // ───────── e3b-5 들이와 무게
  'e3b-5': [
    {
      id: 'water-rate',
      title: '물을 받는 데 걸리는 시간',
      gen(r, level): ProblemDraft {
        const per1L = (a: number) => 1000 / a;
        if (level === 1) {
          const a = r.pick([100, 200, 250, 500]);
          const X = r.int(2, a === 100 ? 4 : 9),
            Y = r.int(0, 1000 / a - 1) * a;
          const C = 1000 * X + Y;
          const t = C / a;
          const tank = r.pick(['물통', '어항', '양동이', '욕조']);
          return {
            q: `$1$분에 $${a}$ mL씩 물이 나오는 수도로 들이가 ${lml(C)}인 빈 ${J(tank, '을/를')} 가득 채우려고 합니다. 몇 분이 걸리나요?`,
            answer: { type: 'num', value: t, unit: '분' },
            steps: [`$${a}\\times${per1L(a)}=1000$ → $${per1L(a)}$분에 $1$ L`, `$${X}$ L: $${per1L(a)}\\times${X}=${per1L(a) * X}$(분)`, ...(Y ? [`$${Y}$ mL: $${Y}\\div${a}=${Y / a}$(분)`] : []), `모두 $${t}$분`],
            hint: '$1$ L $=1000$ mL를 채우는 데 몇 분 걸리는지 먼저 구해요.',
          };
        }
        if (level === 2) {
          const net = r.pick([100, 200, 250, 500]);
          const b = r.int(1, 6) * 50,
            a = net + b;
          const X = r.int(2, net === 100 ? 4 : 8),
            Y = r.int(0, 1000 / net - 1) * net;
          const C = 1000 * X + Y;
          const t = C / net;
          return {
            q: `$1$분에 $${a}$ mL씩 물이 나오는 수도로 들이가 ${lml(C)}인 빈 수조에 물을 받습니다. 그런데 수조 바닥의 작은 구멍으로 $1$분에 $${b}$ mL씩 물이 샙니다. 수조에 물이 가득 차는 데 몇 분이 걸리나요?`,
            answer: { type: 'num', value: t, unit: '분' },
            steps: [`$1$분 동안 실제로 늘어나는 물: $${a}-${b}=${net}$ (mL)`, `$${net}\\times${per1L(net)}=1000$ → $${per1L(net)}$분에 $1$ L`, `${lml(C)} $=${c(C)}$ mL → $${per1L(net)}\\times${X}${Y ? `+${Y / net}` : ''}=${t}$(분)`],
            hint: '나오는 물에서 새는 물을 빼 보세요.',
          };
        }
        const [a, b, m, t] = until(
          () => [r.int(2, 8) * 50, r.int(2, 8) * 50, r.int(2, 6), r.int(3, 9)],
          ([a, b]) => (a + b) % 100 === 0 && a !== b,
        );
        const k = (a + b) / 100;
        const C = a * m + (a + b) * t;
        const ask = r.chance(0.5) ? 'both' : 'all';
        return {
          q: `빈 수조에 물을 받으려고 합니다. 가 수도에서는 $1$분에 $${a}$ mL씩, 나 수도에서는 $1$분에 $${b}$ mL씩 물이 나옵니다. 처음 $${m}$분 동안은 가 수도만 틀었고, 그다음부터는 두 수도를 함께 틀었더니 수조에 물이 ${lml(C)} 찼습니다. ${ask === 'both' ? '두 수도를 함께 튼 시간은 몇 분인가요?' : '물을 받기 시작해서 다 받을 때까지 모두 몇 분이 걸렸나요?'}`,
          answer: { type: 'num', value: ask === 'both' ? t : m + t, unit: '분' },
          steps: [
            `가 수도만 튼 $${m}$분 동안: $${a}\\times${m}=${c(a * m)}$ (mL)`,
            `남은 물: ${lml(C)} $-$ $${c(a * m)}$ mL $=$ $${c(C - a * m)}$ mL`,
            `두 수도를 함께 틀면 $1$분에 $${a}+${b}=${a + b}$ (mL)`,
            `$${c(C - a * m)}\\div${a + b}$ → 백 mL가 $${(C - a * m) / 100}$개를 $${k}$개씩 묶기 → $${t}$분`,
            ask === 'both' ? `두 수도를 함께 튼 시간: $${t}$분` : `모두: $${m}+${t}=${m + t}$(분)`,
          ],
          hint: '가 수도만 틀었을 때 받은 물부터 빼 보세요.',
        };
      },
    },
    {
      id: 'weight-pairs',
      title: '두 개씩 잰 무게로 각각의 무게 구하기',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const it = r.pick([
            { a: '멜론', b: '파인애플', lo: 90, hi: 220 },
            { a: '사전', b: '동화책', lo: 30, hi: 150 },
            { a: '강아지', b: '고양이', lo: 200, hi: 600 },
            { a: '수박', b: '호박', lo: 150, hi: 600 },
          ]);
          const [A, B] = until(
            () => [r.int(it.lo, it.hi) * 10, r.int(it.lo, it.hi) * 10],
            ([A, B]) => A - B >= 50 && A - B <= 1500,
          );
          const askA = r.chance(0.5);
          return {
            q: `${J(it.a, '와/과')} ${it.b}의 무게를 더하면 ${kgg(A + B)}이고, ${J(it.a, '이/가')} ${it.b}보다 $${c(A - B)}$ g 더 무겁습니다. ${it[askA ? 'a' : 'b']}의 무게는 몇 g인가요?`,
            answer: { type: 'num', value: askA ? A : B, unit: 'g' },
            steps: [`${kgg(A + B)} $=$ $${c(A + B)}$ g`, `${it.b}의 무게의 $2$배 $=${c(A + B)}-${c(A - B)}=${c(2 * B)}$ (g) → ${it.b}: $${c(2 * B)}\\div2=${c(B)}$ (g)`, askA ? `${it.a}: $${c(B)}+${c(A - B)}=${c(A)}$ (g)` : `답: $${c(B)}$ g`],
            hint: '합에서 차를 빼면 가벼운 것의 $2$배예요.',
          };
        }
        // 물건마다 실제와 비슷한 무게 범위 (10 g 단위)
        const it = r.pick([
          { n: ['강아지', '고양이', '토끼'], rg: [[300, 600], [250, 450], [100, 250]] },
          { n: ['수박', '멜론', '파인애플'], rg: [[300, 600], [120, 200], [90, 150]] },
          { n: ['사전', '앨범', '동화책'], rg: [[90, 160], [50, 90], [20, 45]] },
          { n: ['가방', '신발', '모자'], rg: [[40, 120], [30, 80], [10, 30]] },
        ]);
        const w = until(
          () => it.rg.map(([lo, hi]) => r.int(lo, hi) * 10),
          (w) => new Set(w).size === 3,
        );
        const [A, B, C] = it.n;
        if (level === 2) {
          const ask = r.int(0, 2);
          const tot = sum(w);
          const s = [w[0] + w[1], w[1] + w[2], w[0] + w[2]];
          const opp = [s[1], s[2], s[0]][ask]; // ask 를 뺀 나머지 둘의 합
          return {
            q: `저울로 두 개씩 무게를 재었더니 ${J(A, '와/과')} ${J(B, '은/는')} ${kgg(s[0])}, ${J(B, '와/과')} ${J(C, '은/는')} ${kgg(s[1])}, ${J(A, '와/과')} ${J(C, '은/는')} ${kgg(s[2])}이었습니다. ${it.n[ask]}의 무게는 몇 g인가요?`,
            answer: { type: 'num', value: w[ask], unit: 'g' },
            steps: [`세 번 잰 무게를 모두 더하면 세 물건의 무게를 각각 $2$번씩 더한 것: $${c(s[0])}+${c(s[1])}+${c(s[2])}=${c(2 * tot)}$ (g)`, `세 물건의 무게의 합: $${c(2 * tot)}\\div2=${c(tot)}$ (g)`, `${it.n[ask]}: $${c(tot)}-${c(opp)}=${c(w[ask])}$ (g)`],
            hint: '세 무게를 모두 더해 보세요. 각 물건이 몇 번씩 들어 있나요?',
          };
        }
        const tot = sum(w);
        const s1 = w[0] + w[1],
          s2 = w[1] + w[2];
        return {
          q: `${A}, ${B}, ${C}의 무게를 모두 더하면 ${kgg(tot)}입니다. ${J(A, '와/과')} ${B}의 무게를 더하면 ${kgg(s1)}이고, ${J(B, '와/과')} ${C}의 무게를 더하면 ${kgg(s2)}입니다. ${B}의 무게는 몇 g인가요?`,
          answer: { type: 'num', value: w[1], unit: 'g' },
          steps: [
            `${C}: (세 무게의 합) $-$ (${A}$+$${B}) $=${c(tot)}-${c(s1)}=${c(w[2])}$ (g)`,
            `${B}: (${B}$+$${C}) $-$ ${C} $=${c(s2)}-${c(w[2])}=${c(w[1])}$ (g)`,
            `다른 방법: (${A}$+$${B})$+$(${B}$+$${C})는 ${J(B, '을/를')} $2$번 더한 것 → $${c(s1)}+${c(s2)}-${c(tot)}=${c(w[1])}$ (g)`,
          ],
          hint: '두 무게의 합을 더하면 가운데 물건이 두 번 들어가요.',
        };
      },
    },
    {
      id: 'pour-move',
      title: '물을 옮겨 담은 뒤의 들이',
      gen(r, level): ProblemDraft {
        if (level === 1) {
          const [X, Y] = until(
            () => [r.int(12, 40) * 100, r.int(3, 30) * 100],
            ([X, Y]) => X - Y >= 400 && (X - Y) % 200 === 0,
          );
          const m = (X - Y) / 2;
          return {
            q: `가 그릇에는 물이 ${lml(X)}, 나 그릇에는 물이 ${lml(Y)} 들어 있습니다. 가 그릇의 물을 나 그릇으로 몇 mL 옮기면 두 그릇의 물의 양이 같아지나요?`,
            answer: { type: 'num', value: m, unit: 'mL' },
            steps: [`두 그릇의 물의 차: $${c(X)}-${c(Y)}=${c(X - Y)}$ (mL)`, `차의 반만큼 옮기면 같아져요: $${c(X - Y)}\\div2=${c(m)}$ (mL)`, `확인: $${c(X - m)}$ mL, $${c(Y + m)}$ mL`],
            hint: '차를 모두 옮기면 반대로 나 그릇이 더 많아져요.',
          };
        }
        if (level === 2) {
          const [x0, y0, m] = until(
            () => [r.int(15, 45) * 100, r.int(5, 30) * 100, r.int(2, 9) * 100],
            ([x0, y0, m]) => y0 + m - (x0 - m) >= 200,
          );
          const x1 = x0 - m,
            y1 = y0 + m;
          const T = x0 + y0,
            d = y1 - x1;
          return {
            q: `가 그릇과 나 그릇에 들어 있는 물은 모두 ${lml(T)}입니다. 가 그릇의 물 $${m}$ mL를 나 그릇으로 옮겼더니 나 그릇의 물이 가 그릇의 물보다 ${lml(d)} 더 많아졌습니다. 처음 가 그릇에 들어 있던 물은 몇 mL인가요?`,
            answer: { type: 'num', value: x0, unit: 'mL' },
            steps: [`옮긴 뒤에도 두 그릇의 물은 모두 $${c(T)}$ mL`, `옮긴 뒤 가 그릇: $(${c(T)}-${c(d)})\\div2=${c(x1)}$ (mL)`, `처음 가 그릇: 옮긴 $${m}$ mL를 다시 더해 $${c(x1)}+${m}=${c(x0)}$ (mL)`],
            hint: '물을 옮겨도 두 그릇의 물의 합은 그대로예요.',
          };
        }
        const [F, a, b, cc] = until(
          () => [r.int(8, 25) * 100, r.int(2, 9) * 100, r.int(2, 9) * 100, r.int(2, 9) * 100],
          ([F, a, b, cc]) => F - cc + a > 0 && F - a + b > 0 && F - b + cc > 0 && new Set([a, b, cc]).size === 3,
        );
        const init = [F - cc + a, F - a + b, F - b + cc];
        const ask = r.int(0, 2);
        const names = ['가', '나', '다'];
        return {
          q: `가, 나, 다 세 그릇에 물이 들어 있습니다. 가 그릇에서 나 그릇으로 $${a}$ mL, 나 그릇에서 다 그릇으로 $${b}$ mL, 다 그릇에서 가 그릇으로 $${cc}$ mL를 차례로 옮겼더니 세 그릇의 물이 모두 ${lml(F)}가 되었습니다. 처음 ${names[ask]} 그릇에 들어 있던 물은 몇 mL인가요?`,
          answer: { type: 'num', value: init[ask], unit: 'mL' },
          steps: [
            `마지막부터 거꾸로: 다 → 가로 $${cc}$ mL를 되돌리면 가 $${c(F - cc)}$, 다 $${c(F + cc)}$`,
            `나 → 다로 $${b}$ mL를 되돌리면 나 $${c(F + b)}$, 다 $${c(F + cc - b)}$`,
            `가 → 나로 $${a}$ mL를 되돌리면 가 $${c(F - cc + a)}$, 나 $${c(F + b - a)}$`,
            `처음: 가 $${c(init[0])}$ mL, 나 $${c(init[1])}$ mL, 다 $${c(init[2])}$ mL`,
            `답: $${c(init[ask])}$ mL`,
          ],
          hint: '마지막으로 옮긴 것부터 거꾸로 되돌려 보세요.',
        };
      },
    },
  ],

  // ───────── e3b-6 그림그래프
  'e3b-6': [
    {
      id: 'graph-share',
      title: '그림그래프의 자료를 나누고 옮기기',
      gen(r, level): ProblemDraft {
        const th = r.pick(GT);
        if (level === 1) {
          const [vals, k] = until(
            () => [th.labels.map(() => r.int(11, 48)), r.int(2, 6)] as [number[], number],
            ([v, k]) => new Set(v).size === 4 && sum(v) % k === 0,
          );
          const tot = sum(vals);
          return {
            q: `${gIntro(th)} 네 ${th.head}의 것을 모두 모아 복지관 $${k}$곳에 똑같이 나누어 보내려고 합니다. 복지관 한 곳에 몇 ${th.unit}씩 보낼 수 있나요?`,
            fig: gFig(th, vals, [10, 1]),
            answer: { type: 'num', value: tot / k, unit: th.unit },
            steps: [`그래프 읽기: ${vals.map((v, i) => `${gName(th, i)} $${v}$`).join(', ')}`, `모두: $${vals.join('+')}=${tot}$ (${th.unit})`, `$${tot}\\div${k}=${tot / k}$ (${th.unit})`],
          };
        }
        if (level === 2) {
          const [vals, cap] = until(
            () => [th.labels.map(() => r.int(11, 48) * 10), r.pick([200, 300, 400, 500])] as [number[], number],
            ([v, cap]) => new Set(v).size === 4 && sum(v) % cap !== 0 && sum(v) / cap <= 9,
          );
          const tot = sum(vals);
          const q = Math.floor(tot / cap);
          return {
            q: `${gIntro(th)} 네 ${th.head}의 것을 모두 한 번에 $${cap}$${th.unit}씩 나를 수 있는 트럭으로 나르려고 합니다. 트럭은 적어도 몇 번 날라야 하나요?`,
            fig: gFig(th, vals, [100, 10]),
            answer: { type: 'num', value: q + 1, unit: '번' },
            steps: [`모두: $${vals.map((v) => c(v)).join('+')}=${c(tot)}$ (${th.unit})`, `$${cap}\\times${q}=${c(cap * q)}$, 남는 것 $${c(tot)}-${c(cap * q)}=${tot - cap * q}$ (${th.unit})`, `남은 $${tot - cap * q}$${th.unit}도 날라야 하므로 $${q}+1=${q + 1}$(번)`],
            hint: '나머지가 있으면 한 번 더 날라야 해요.',
          };
        }
        if (r.chance(0.5)) {
          const vals = until(
            () => th.labels.map(() => r.int(11, 48) * 10),
            (v) => new Set(v).size === 4 && sum(v) % 40 === 0 && Math.max(...v) - sum(v) / 4 >= 30,
          );
          const tot = sum(vals),
            avg = tot / 4;
          const mi = vals.indexOf(Math.max(...vals));
          return {
            q: `${gIntro(th)} 네 ${th.head}의 양이 모두 같아지도록 서로 나누어 가지려고 합니다. ${J(gName(th, mi), '은/는')} 몇 ${J(th.unit, '을/를')} 다른 ${th.head}에 나누어 주어야 하나요?`,
            fig: gFig(th, vals, [100, 10]),
            answer: { type: 'num', value: vals[mi] - avg, unit: th.unit },
            steps: [`네 ${th.head}의 합: $${vals.map((v) => c(v)).join('+')}=${c(tot)}$ (${th.unit})`, `똑같이 나누면 한 ${th.head}에 $${c(tot)}\\div4=${avg}$ (${th.unit})`, `${gName(th, mi)}: $${vals[mi]}$ → $${vals[mi]}-${avg}=${vals[mi] - avg}$ (${th.unit})${josa(th.unit, '을/를')} 나누어 주어요.`],
            hint: '먼저 똑같이 나누었을 때 한 곳의 양을 구해요.',
          };
        }
        const vals = until(
          () => th.labels.map(() => r.int(11, 48) * 10),
          (v) => new Set(v).size === 4 && (Math.max(...v) - Math.min(...v)) % 20 === 0,
        );
        const mi = vals.indexOf(Math.max(...vals)),
          li = vals.indexOf(Math.min(...vals));
        const m = (vals[mi] - vals[li]) / 2;
        return {
          q: `${gIntro(th)} 가장 많은 ${th.head}에서 가장 적은 ${J(th.head, '으로/로')} 몇 ${J(th.unit, '을/를')} 옮기면 두 ${th.head}의 양이 같아지나요?`,
          fig: gFig(th, vals, [100, 10]),
          answer: { type: 'num', value: m, unit: th.unit },
          steps: [`가장 많은 곳: ${gName(th, mi)} $${vals[mi]}$, 가장 적은 곳: ${gName(th, li)} $${vals[li]}$`, `차: $${vals[mi]}-${vals[li]}=${vals[mi] - vals[li]}$`, `차의 반을 옮겨요: $${vals[mi] - vals[li]}\\div2=${m}$ (${th.unit})`],
          hint: '차를 모두 옮기면 거꾸로 차가 생겨요.',
        };
      },
    },
    {
      id: 'graph-redraw',
      title: '그림의 단위를 바꾸어 다시 그리기',
      gen(r, level): ProblemDraft {
        const th = r.pick(GT);
        const oldU = level === 1 ? [10, 1] : [100, 10];
        const newU = level === 1 ? [10, 5, 1] : [100, 50, 10];
        const mul = level === 1 ? 1 : 10;
        const nm3 = UNIT_NAMES(3);
        const unitDesc = newU.map((u, j) => `${nm3[j]} $${u}$${th.unit}`).join(', ');
        if (level <= 2) {
          const vals = until(
            () => th.labels.map(() => r.int(11, 48) * mul),
            (v) => new Set(v).size === 4 && v.filter((x) => (x / mul) % 10 >= 5).length >= 2,
          );
          const cnts = vals.map((v) => iconCounts(v, newU));
          if (level === 1) {
            const i = until(
              () => r.int(0, 3),
              (i) => (vals[i] / mul) % 10 >= 5,
            );
            const t = sum(cnts[i]);
            return {
              q: `${gIntro(th)} 그림의 단위를 (${unitDesc})${th.unit === 'kg' ? '으로' : '로'} 바꾸어 그림 수가 가장 적게 되도록 다시 그리려고 합니다. ${gName(th, i)}에는 그림을 모두 몇 개 그려야 하나요?`,
              fig: gFig(th, vals, oldU),
              answer: { type: 'num', value: t, unit: '개' },
              steps: [`${gName(th, i)}: $${vals[i]}$${th.unit}`, `$${vals[i]}=${newU.map((u, j) => `${u}\\times${cnts[i][j]}`).join('+')}$`, `${nm3.map((l, j) => `${l} $${cnts[i][j]}$개`).join(', ')} → 모두 $${t}$개`],
            };
          }
          const tot = sum(cnts.map(sum));
          return {
            q: `${gIntro(th)} 그림의 단위를 (${unitDesc})${th.unit === 'kg' ? '으로' : '로'} 바꾸어 네 ${th.head} 모두 그림 수가 가장 적게 되도록 다시 그리려고 합니다. 그림은 모두 몇 개 그려야 하나요?`,
            fig: gFig(th, vals, oldU),
            answer: { type: 'num', value: tot, unit: '개' },
            steps: [...vals.map((v, i) => `${gName(th, i)} $${v}$: ${cnts[i].map((k, j) => `${nm3[j]} $${k}$`).join(', ')} → $${sum(cnts[i])}$개`), `모두: $${cnts.map(sum).join('+')}=${tot}$(개)`],
            hint: '작은 그림 $5$개는 중간 그림 $1$개로 바꿀 수 있어요.',
          };
        }
        const [vals, cnts] = until(
          () => {
            const v = th.labels.map(() => r.int(11, 48) * 10);
            return [v, v.map((x) => sum(iconCounts(x, newU)))] as [number[], number[]];
          },
          ([v, cn]) => {
            const mx2 = Math.max(...cn);
            return new Set(v).size === 4 && cn.filter((x) => x === mx2).length === 1 && cn.indexOf(mx2) !== v.indexOf(Math.max(...v));
          },
        );
        const ans = cnts.indexOf(Math.max(...cnts));
        const choices = makeChoices(
          r,
          gName(th, ans),
          th.labels.map((_, i) => gName(th, i)).filter((_, i) => i !== ans),
          4,
        );
        return {
          q: `${gIntro(th)} 그림의 단위를 (${unitDesc})${th.unit === 'kg' ? '으로' : '로'} 바꾸어 그림 수가 가장 적게 되도록 다시 그리려고 합니다. 다시 그렸을 때 그림을 가장 많이 그려야 하는 ${J(th.head, '은/는')} 어디인가요?`,
          fig: gFig(th, vals, oldU),
          answer: choices,
          steps: [
            ...vals.map(
              (v, i) =>
                `${gName(th, i)} $${v}$: ${iconCounts(v, newU)
                  .map((k, j) => `${nm3[j]} $${k}$`)
                  .join(', ')} → $${cnts[i]}$개`,
            ),
            `수가 가장 큰 곳이 그림도 가장 많은 것은 아니에요. 그림이 가장 많은 곳: ${gName(th, ans)}`,
          ],
          hint: '각 곳의 그림 수를 직접 세어 비교해 보세요.',
        };
      },
    },
    {
      id: 'graph-possible',
      title: '조건에 맞는 자료의 가짓수',
      gen(r, level): ProblemDraft {
        const th = r.pick(GT);
        if (level === 1) {
          const [vals, h, i, j] = until(
            () => {
              const v = th.labels.map(() => r.int(11, 48));
              const [h, i, j] = r.sample([0, 1, 2, 3], 3);
              return [v, h, i, j] as [number[], number, number, number];
            },
            ([v, h, i, j]) => new Set(v).size === 4 && v[i] < v[h] && v[h] < v[j] && v[j] - v[i] - 1 >= 3 && v[j] - v[i] - 1 <= 14,
          );
          const shown = vals.map((v, k) => (k === h ? 0 : v));
          const cnt = vals[j] - vals[i] - 1;
          return {
            q: `${th.head}별 ${J(th.thing, '을/를')} 조사하여 나타낸 그림그래프인데 ${gName(th, h)}의 그림이 지워졌습니다. ${J(th.of(gName(th, h)), '은/는')} ${gName(th, i)}보다 많고 ${gName(th, j)}보다 적습니다. ${gName(th, h)}의 자료가 될 수 있는 수는 모두 몇 가지인가요? (자료는 $1$${th.unit} 단위로 조사했습니다.)`,
            fig: gFig(th, shown, [10, 1]),
            answer: { type: 'num', value: cnt, unit: '가지' },
            steps: [`${gName(th, i)}: $${vals[i]}$, ${gName(th, j)}: $${vals[j]}$`, `$${vals[i]}$보다 크고 $${vals[j]}$보다 작은 수: $${vals[i] + 1}$부터 $${vals[j] - 1}$까지`, `$${vals[j] - 1}-${vals[i] + 1}+1=${cnt}$(가지)`],
            hint: '경계의 두 수는 들어가지 않아요.',
          };
        }
        if (level === 2) {
          const [vals, h, i, T, cnt] = until(
            () => {
              const v = th.labels.map(() => r.int(11, 45) * 10);
              const [h, i] = r.sample([0, 1, 2, 3], 2);
              const T = sum(v) + r.int(2, 9) * 10;
              const others = sum(v) - v[h];
              const ok = range(1, 99)
                .map((k) => k * 10)
                .filter((x) => x > v[i] && x + others < T);
              return [v, h, i, T, ok.length] as [number[], number, number, number, number];
            },
            ([v, h, i, , cnt]) => new Set(v).size === 4 && v[h] > v[i] && cnt >= 2 && cnt <= 10,
          );
          const shown = vals.map((v, k) => (k === h ? 0 : v));
          const others = sum(vals) - vals[h];
          const hi = T - others;
          const list = range(1, 99)
            .map((k) => k * 10)
            .filter((x) => x > vals[i] && x < hi);
          return {
            q: `${th.head}별 ${J(th.thing, '을/를')} 조사하여 나타낸 그림그래프인데 ${gName(th, h)}의 그림이 지워졌습니다. ${J(th.of(gName(th, h)), '은/는')} ${gName(th, i)}보다 많고, 네 ${th.head}의 것을 모두 더하면 $${c(T)}$${th.unit}보다 적습니다. ${gName(th, h)}의 자료가 될 수 있는 수는 모두 몇 가지인가요? (자료는 $10$${th.unit} 단위로 조사했습니다.)`,
            fig: gFig(th, shown, [100, 10]),
            answer: { type: 'num', value: cnt, unit: '가지' },
            steps: [
              `그림이 남은 세 곳의 합: $${vals
                .filter((_, k) => k !== h)
                .map((v) => c(v))
                .join('+')}=${c(others)}$`,
              `${J(gName(th, h), '은/는')} $${c(T)}-${c(others)}=${hi}$보다 적어야 해요.`,
              `또 ${gName(th, i)}의 $${vals[i]}$보다 많아야 해요.`,
              `$10$${th.unit} 단위의 수: ${list.map((x) => `$${x}$`).join(', ')} → $${cnt}$가지`,
            ],
            hint: '두 조건을 모두 만족하는 범위를 먼저 구해요.',
          };
        }
        const [vals, h1, h2, k, list] = until(
          () => {
            const v = th.labels.map(() => r.int(11, 45) * 10);
            const [h1, h2, k] = r.sample([0, 1, 2, 3], 3);
            const S = v[h1] + v[h2];
            const list = range(1, 99)
              .map((t) => t * 10)
              .filter((y) => y > v[k] && S - y > y);
            return [v, h1, h2, k, list] as [number[], number, number, number, number[]];
          },
          ([v, h1, h2, k, list]) => new Set(v).size === 4 && v[h1] > v[h2] && v[h2] > v[k] && list.length >= 2 && list.length <= 9,
        );
        const tot = sum(vals);
        const S = vals[h1] + vals[h2];
        const shown = vals.map((v, t) => (t === h1 || t === h2 ? 0 : v));
        return {
          q: `${th.head}별 ${J(th.thing, '을/를')} 조사하여 나타낸 그림그래프인데 ${J(gName(th, h1), '와/과')} ${gName(th, h2)}의 그림이 지워졌습니다. 네 ${th.head}의 것을 모두 더하면 $${c(tot)}$${th.unit}이고, ${J(gName(th, h1), '은/는')} ${gName(th, h2)}보다 많으며, ${J(gName(th, h2), '은/는')} ${gName(th, k)}보다 많습니다. 지워진 두 곳의 자료로 알맞은 경우는 모두 몇 가지인가요? (자료는 $10$${th.unit} 단위로 조사했습니다.)`,
          fig: gFig(th, shown, [100, 10]),
          answer: { type: 'num', value: list.length, unit: '가지' },
          steps: [
            `지워진 두 곳의 합: $${c(tot)}-${c(tot - S)}=${S}$ (${th.unit})`,
            `${J(gName(th, h2), '을/를')} □라 하면 ${J(gName(th, h1), '은/는')} $${S}-$□이고, $${S}-$□가 □보다 커야 하므로 □는 $${S / 2}$보다 작아요.`,
            `또 □는 ${gName(th, k)}의 $${vals[k]}$보다 커야 해요.`,
            `□: ${list.map((y) => `$${y}$`).join(', ')}`,
            `모두 $${list.length}$가지`,
          ],
          hint: '지워진 두 곳의 합을 먼저 구하고, 작은 쪽의 범위를 생각해요.',
        };
      },
    },
  ],
};

// ═════════════════════════════ 최상위 유형 ═════════════════════════════
export const MORE_TOP_E3B: Record<string, Skill[]> = {
  'e3b-1': [
    {
      id: 'top-cards-32',
      title: '수 카드 5장으로 (세 자리 수)×(두 자리 수) 만들기',
      gen(r): ProblemDraft {
        const withZero = r.chance(0.4);
        const want = r.pick(['max', 'min'] as const);
        const cards = (withZero ? [0, ...r.sample(DIG, 4)] : r.sample(DIG, 5)).sort((x, y) => x - y);
        const list = perms(cards, 5)
          .filter((p) => p[0] !== 0 && p[3] !== 0)
          .map((p) => ({ a: num(p.slice(0, 3)), b: num(p.slice(3)), v: num(p.slice(0, 3)) * num(p.slice(3)) }))
          .sort((x, y) => (want === 'max' ? y.v - x.v : x.v - y.v));
        const seen = new Set<number>();
        const top = list.filter((x) => (seen.has(x.v) ? false : (seen.add(x.v), true))).slice(0, 3);
        const ct = cards.map((x) => `\\boxed{${x}}`).join('\\;');
        const nz = cards.filter((x) => x !== 0);
        const lead = want === 'max' ? [cards[4], cards[3]] : [nz[0], nz[1]];
        return {
          q: `수 카드 $${ct}$를 한 번씩 모두 사용하여 (세 자리 수)$\\times$(두 자리 수)의 곱셈식을 만들려고 합니다. 곱이 가장 ${want === 'max' ? '큰' : '작은'} 곱셈식을 만들 때, 그 곱을 구하세요.`,
          answer: { type: 'num', value: top[0].v },
          steps: [
            `곱에 가장 큰 영향을 주는 자리는 세 자리 수의 백의 자리와 두 자리 수의 십의 자리예요.`,
            want === 'max' ? `두 자리에 가장 큰 두 숫자 $${lead[0]}$, $${lead[1]}$를 나누어 놓아요.` : `두 자리에 $0$이 아닌 가장 작은 두 숫자 $${lead[0]}$, $${lead[1]}$를 나누어 놓아요.${withZero ? ' ($0$은 맨 앞자리에 올 수 없어요.)' : ''}`,
            `나머지 숫자도 ${want === 'max' ? '큰' : '작은'} 수가 높은 자리에 오도록 여러 경우를 비교해요.`,
            ...top.map((x) => `$${x.a}\\times${x.b}=${c(x.v)}$`),
            `곱이 가장 ${want === 'max' ? '큰' : '작은'} 식: $${top[0].a}\\times${top[0].b}=${c(top[0].v)}$`,
          ],
          hint: '어느 자리의 숫자가 곱을 가장 크게 바꾸는지 생각해 보세요.',
        };
      },
    },
    {
      id: 'top-mul-digit-pairs',
      title: '곱의 범위에 맞는 숫자 짝 찾기',
      gen(r): ProblemDraft {
        const [p, q, L, U, rows] = until(
          () => {
            const p = r.int(1, 9),
              q = r.int(2, 9);
            const A0 = r.int(2, 8);
            const L = Math.floor(((10 * A0 + p) * (10 * q + r.int(0, 9))) / 100) * 100;
            const U = L + r.int(3, 12) * 100;
            const rows = range(1, 9)
              .map((A) => ({ A, Bs: range(0, 9).filter((B) => (10 * A + p) * (10 * q + B) > L && (10 * A + p) * (10 * q + B) < U) }))
              .filter((x) => x.Bs.length > 0);
            return [p, q, L, U, rows] as [number, number, number, number, { A: number; Bs: number[] }[]];
          },
          ([, , , , rows]) => {
            const cnt = sum(rows.map((x) => x.Bs.length));
            return rows.length >= 2 && rows.length <= 3 && cnt >= 3 && cnt <= 14 && rows[rows.length - 1].A - rows[0].A === rows.length - 1;
          },
        );
        const cnt = sum(rows.map((x) => x.Bs.length));
        const a0 = rows[0].A,
          a1 = rows[rows.length - 1].A;
        const f = (A: number) => 10 * A + p;
        return {
          q: `두 자리 수 $\\square${p}$와 $${q}\\triangle$의 곱이 $${c(L)}$보다 크고 $${c(U)}$보다 작습니다. □와 △에 들어갈 수 있는 숫자의 짝 (□, △)는 모두 몇 가지인가요? (□는 $1$부터 $9$까지, △는 $0$부터 $9$까지의 숫자입니다.)`,
          answer: { type: 'num', value: cnt, unit: '가지' },
          steps: [
            `△가 커질수록, □가 커질수록 곱이 커져요. 먼저 □의 범위를 어림해요.`,
            ...(a0 > 1 ? [`□$=${a0 - 1}$이면 가장 큰 곱이 $${f(a0 - 1)}\\times${q}9=${c(f(a0 - 1) * (10 * q + 9))}$ → $${c(L)}$보다 크지 않아요.`] : []),
            ...(a1 < 9 ? [`□$=${a1 + 1}$이면 가장 작은 곱이 $${f(a1 + 1)}\\times${q}0=${c(f(a1 + 1) * 10 * q)}$ → $${c(U)}$보다 작지 않아요.`] : []),
            ...rows.map((x) => {
              const b0 = x.Bs[0],
                b1 = x.Bs[x.Bs.length - 1];
              return b0 === b1 ? `□$=${x.A}$: $${f(x.A)}\\times${q}${b0}=${c(f(x.A) * (10 * q + b0))}$만 범위 안 → △는 $${b0}$, $1$가지` : `□$=${x.A}$: $${f(x.A)}\\times${q}${b0}=${c(f(x.A) * (10 * q + b0))}$ ~ $${f(x.A)}\\times${q}${b1}=${c(f(x.A) * (10 * q + b1))}$ → △는 $${b0}$~$${b1}$, $${x.Bs.length}$가지`;
            }),
            `모두 $${rows.map((x) => x.Bs.length).join('+')}=${cnt}$(가지)`,
          ],
          hint: '□를 먼저 정하고, 그때 △가 될 수 있는 수를 세어 보세요.',
        };
      },
    },
  ],

  'e3b-2': [
    {
      id: 'top-rem-two-divisors',
      title: '두 수로 나눈 나머지가 정해진 수',
      gen(r): ProblemDraft {
        const [a, b] = r.pick([
          [3, 4],
          [3, 5],
          [4, 5],
          [4, 6],
          [5, 6],
          [3, 8],
          [4, 7],
          [6, 8],
          [3, 7],
          [2, 9],
        ]);
        const same = r.chance(0.55);
        const L = lcm(a, b);
        const ask = r.pick(['max2', 'min3', 'count2'] as const);
        const [r1, r2, sols] = until(
          () => {
            let r1: number, r2: number;
            if (same) {
              const k = r.int(1, a - 1);
              r1 = a - k;
              r2 = b - k;
            } else {
              r1 = r.int(1, a - 1);
              r2 = r.int(1, b - 1);
            }
            const sols = range(1, 999).filter((x) => x % a === r1 && x % b === r2);
            return [r1, r2, sols] as [number, number, number[]];
          },
          ([r1, r2, sols]) => sols.length > 0 && (same || a - r1 !== b - r2) && r1 > 0 && r2 > 0 && (ask !== 'count2' || sols.filter((x) => x >= 10 && x <= 99).length <= 9),
        );
        const two = sols.filter((x) => x >= 10 && x <= 99);
        const ans = ask === 'max2' ? two[two.length - 1] : ask === 'min3' ? sols.find((x) => x >= 100)! : two.length;
        const x0 = sols[0];
        const k = a - r1;
        const head = same
          ? [`$${a}$로 나누면 $${r1}$ 남고 $${b}$로 나누면 $${r2}$ 남는 수에 $${k}$를 더하면 $${a}$${josa(a, '으로/로')}도 $${b}$${josa(b, '으로/로')}도 나누어떨어져요.`, `$${a}$${josa(a, '으로/로')}도 $${b}$${josa(b, '으로/로')}도 나누어떨어지는 가장 작은 수는 $${L}$이고, 그다음은 $${L}$씩 커져요: $${L}, ${2 * L}, ${3 * L}, \\dots$`, `조건에 맞는 수는 여기서 $${k}$를 뺀 $${L - k}, ${2 * L - k}, ${3 * L - k}, \\dots$`]
          : [
              `$${b}$로 나누면 $${r2}$ 남는 수: ${range(0, 5)
                .map((t) => `$${b * t + r2}$`)
                .join(', ')}, …`,
              `이 중 $${a}$로 나누면 $${r1}$ 남는 가장 작은 수는 $${x0}$ ($${x0}\\div${a}=${Math.floor(x0 / a)}\\cdots${r1}$)`,
              `$${a}$와 $${b}$로 모두 나누어떨어지는 가장 작은 수 $${L}$씩 더해도 두 나머지는 그대로 → $${x0}, ${x0 + L}, ${x0 + 2 * L}, \\dots$`,
            ];
        const tail =
          ask === 'max2'
            ? [`두 자리 수 중 가장 큰 수: $${ans}$ (다음 수 $${ans + L}$은 세 자리 수)`]
            : ask === 'min3'
              ? [`세 자리 수 중 가장 작은 수: $${ans}$ (바로 앞의 수 $${ans - L}$은 두 자리 수)`]
              : [`두 자리 수: ${two.map((x) => `$${x}$`).join(', ')}`, `모두 $${two.length}$개`];
        return {
          q: `$${a}$로 나누면 나머지가 $${r1}$이고, $${b}$로 나누면 나머지가 $${r2}$인 수가 있습니다. ${ask === 'max2' ? '이런 수 중에서 가장 큰 두 자리 수를 구하세요.' : ask === 'min3' ? '이런 수 중에서 가장 작은 세 자리 수를 구하세요.' : '이런 수 중에서 두 자리 수는 모두 몇 개인가요?'}`,
          answer: ask === 'count2' ? { type: 'num', value: ans, unit: '개' } : { type: 'num', value: ans },
          steps: [...head, ...tail],
          hint: same ? '나머지에 무엇을 더하면 나누어떨어질지 생각해 보세요.' : '한 조건에 맞는 수를 늘어놓고 다른 조건을 확인해 보세요.',
        };
      },
    },
    {
      id: 'top-find-divisor',
      title: '나머지로 나누는 수 알아내기',
      gen(r): ProblemDraft {
        if (r.chance(0.5)) {
          const [Nn, rr, ds] = until(
            () => {
              const Nn = r.int(30, 99),
                rr = r.int(1, 5);
              const ds = range(2, 9).filter((d) => d > rr && (Nn - rr) % d === 0);
              return [Nn, rr, ds] as [number, number, number[]];
            },
            ([, , ds]) => ds.length >= 2,
          );
          const M = Nn - rr;
          const small = range(2, rr).filter((d) => M % d === 0);
          const ask = r.chance(0.5) ? 'sum' : 'count';
          return {
            q: `${N(Nn, '을/를')} 어떤 한 자리 수로 나누었더니 나머지가 $${rr}$${was(rr)}. 어떤 수가 될 수 있는 수를 ${ask === 'sum' ? '모두 더하면 얼마인가요?' : '모두 찾으면 몇 개인가요?'}`,
            answer: ask === 'sum' ? { type: 'num', value: sum(ds) } : { type: 'num', value: ds.length, unit: '개' },
            steps: [
              `나머지가 $${rr}$이므로 $${Nn}-${rr}=${M}$은 어떤 수로 나누어떨어져요.`,
              `$${M}$을 나누어떨어지게 하는 한 자리 수: ${range(2, 9)
                .filter((d) => M % d === 0)
                .map((d) => `$${d}$`)
                .join(', ')}`,
              `나머지는 나누는 수보다 작아야 하므로 어떤 수는 $${rr}$보다 커야 해요.${small.length ? ` → ${small.map((d) => `$${d}$`).join(', ')}는 안 돼요.` : ''}`,
              `어떤 수: ${ds.map((d) => `$${d}$`).join(', ')}`,
              ask === 'sum' ? `합: $${ds.join('+')}=${sum(ds)}$` : `모두 $${ds.length}$개`,
            ],
            hint: '나머지를 빼면 나누어떨어지는 수가 돼요.',
          };
        }
        const [A, B, r1, r2, d] = until(
          () => {
            const d = r.int(4, 9);
            const r1 = r.int(1, d - 1),
              r2 = r.int(1, d - 1);
            const A = d * r.int(3, Math.floor((99 - r1) / d)) + r1;
            const B = d * r.int(3, Math.floor((99 - r2) / d)) + r2;
            return [A, B, r1, r2, d];
          },
          ([A, B, r1, r2, d]) => A !== B && r1 !== r2 && range(2, 9).filter((x) => A % x === r1 && B % x === r2).length === 1 && d > 0,
        );
        const listA = range(2, 9).filter((x) => (A - r1) % x === 0 && x > r1);
        const listB = range(2, 9).filter((x) => (B - r2) % x === 0 && x > r2);
        return {
          q: `$${A}$${josa(A, '와/과')} ${N(B, '을/를')} 같은 한 자리 수로 나누었더니 나머지가 각각 $${r1}$, $${r2}$${was(r2)}. 나눈 한 자리 수를 구하세요.`,
          answer: { type: 'num', value: d },
          steps: [
            `$${A}-${r1}=${A - r1}$과 $${B}-${r2}=${B - r2}$는 모두 그 수로 나누어떨어져요.`,
            `그 수는 나머지 $${Math.max(r1, r2)}$보다 커야 해요.`,
            `$${A - r1}$을 나누어떨어지게 하는 $${r1}$보다 큰 한 자리 수: ${listA.map((x) => `$${x}$`).join(', ')}`,
            `$${B - r2}$를 나누어떨어지게 하는 $${r2}$보다 큰 한 자리 수: ${listB.map((x) => `$${x}$`).join(', ')}`,
            `두 조건에 모두 맞는 수: $${d}$`,
            `확인: $${A}\\div${d}=${Math.floor(A / d)}\\cdots${r1}$, $${B}\\div${d}=${Math.floor(B / d)}\\cdots${r2}$`,
          ],
          hint: '각 수에서 나머지를 빼 보세요.',
        };
      },
    },
  ],

  'e3b-3': [
    {
      id: 'top-overlap-rect',
      title: '서로의 중심을 지나는 원과 직사각형',
      gen(r): ProblemDraft {
        const kind = r.pick(['r', 'n', 'two'] as const);
        if (kind === 'two') {
          const n = r.int(3, 4),
            R = r.int(2, 9);
          const P = 2 * R * (n + 5);
          const cs: Cc[] = [];
          for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++) cs.push({ x: i * R, y: j * 2 * R, r: R });
          return {
            q: `크기가 같은 원을 가로로는 이웃한 원의 중심을 지나도록 겹쳐서 $${n}$개씩, 세로로는 서로 맞닿게 $2$줄로 그리고, 직사각형으로 꼭 맞게 둘러쌌습니다. 직사각형의 네 변의 길이의 합이 $${P}$ cm일 때, 원의 반지름은 몇 cm인가요?`,
            fig: circFig(cs, { rect: [-R, -R, (n - 1) * R + R, 3 * R], w: 260, h: 180 }),
            answer: { type: 'num', value: R, unit: 'cm' },
            steps: [
              `이웃한 원이 서로의 중심을 지나므로 가로로 이웃한 중심 사이의 거리는 반지름과 같아요.`,
              `가로: 반지름 $+$ (반지름 $${n - 1}$개) $+$ 반지름 → 반지름의 $${n + 1}$배`,
              `세로: 지름 $2$개 → 반지름의 $4$배`,
              `네 변의 합: 반지름의 $(${n + 1}+4)\\times2=${2 * (n + 5)}$배`,
              `반지름: $${P}\\div2=${P / 2}$, $${P / 2}\\div${n + 5}=${R}$ (cm)`,
            ],
            hint: '모든 길이를 반지름 몇 개로 나타내 보세요.',
          };
        }
        const n = r.int(3, 6),
          R = r.int(2, 9);
        const P = 2 * R * (n + 3);
        const cs = range(0, n - 1).map((i) => ({ x: i * R, y: 0, r: R }));
        const fig = circFig(cs, { rect: [-R, -R, (n - 1) * R + R, R], w: 280, h: 140 });
        const base = [`이웃한 원이 서로의 중심을 지나므로 이웃한 중심 사이의 거리는 반지름과 같아요.`, `가로: 반지름 $+$ (반지름 $${n - 1}$개) $+$ 반지름 → 반지름의 $${n + 1}$배`, `세로: 지름 → 반지름의 $2$배`];
        if (kind === 'r')
          return {
            q: `크기가 같은 원 $${n}$개를 이웃한 원의 중심을 지나도록 한 줄로 겹쳐 그리고, 직사각형으로 꼭 맞게 둘러쌌습니다. 직사각형의 네 변의 길이의 합이 $${P}$ cm일 때, 원의 반지름은 몇 cm인가요?`,
            fig,
            answer: { type: 'num', value: R, unit: 'cm' },
            steps: [...base, `네 변의 합: 반지름의 $(${n + 1}+2)\\times2=${2 * (n + 3)}$배`, `반지름: $${P}\\div2=${P / 2}$, $${P / 2}\\div${n + 3}=${R}$ (cm)`],
            hint: '가로와 세로를 반지름 몇 개로 나타내 보세요.',
          };
        return {
          q: `반지름이 $${R}$ cm인 원 여러 개를 이웃한 원의 중심을 지나도록 한 줄로 겹쳐 그리고, 직사각형으로 꼭 맞게 둘러쌌더니 직사각형의 네 변의 길이의 합이 $${P}$ cm가 되었습니다. 그린 원은 모두 몇 개인가요?`,
          answer: { type: 'num', value: n, unit: '개' },
          steps: [...base.slice(0, 1), `원을 □개 그리면 가로는 반지름의 (□$+1$)배, 세로는 반지름의 $2$배`, `가로와 세로의 합: $${P}\\div2=${P / 2}$ (cm) → $${P / 2}\\div${R}=${P / 2 / R}$이므로 반지름 $${P / 2 / R}$개의 길이`, `(□$+1$)$+2=${n + 3}$ → □$=${n}$`, `원은 $${n}$개`],
          hint: '가로와 세로의 합이 반지름 몇 개인지 구해요.',
        };
      },
    },
    {
      id: 'top-nested-circles',
      title: '큰 원 안에 꼭 맞게 들어간 원들',
      gen(r): ProblemDraft {
        const kind = r.pick(['diff', 'times', 'three'] as const);
        let R: number, x: number, y: number, z = 0;
        if (kind === 'diff') {
          [R, x, y] = until(
            () => {
              const y = r.int(2, 10),
                x = y + r.int(1, 8);
              return [x + y, x, y];
            },
            ([R]) => R <= 20,
          );
        } else if (kind === 'times') {
          const k = r.int(2, 4);
          y = r.int(2, 6);
          x = k * y;
          R = x + y;
        } else {
          y = r.int(2, 5); // 다 반지름
          const d = r.int(1, 4);
          x = 2 * y; // 나
          z = y + d; // 라
          R = x + y + z;
        }
        const cs: Cc[] = [{ x: 0, y: 0, r: R }];
        const ty = (rr: number) => (rr >= 0.3 * R ? rr * 0.45 : rr + 0.1 * R);
        const tags: { x: number; y: number; t: string }[] = [{ x: R * 0.8, y: R * 0.8, t: '가' }];
        cs.push({ x: -R + x, y: 0, r: x });
        tags.push({ x: -R + x, y: ty(x), t: '나' });
        cs.push({ x: -R + 2 * x + y, y: 0, r: y });
        tags.push({ x: -R + 2 * x + y, y: ty(y), t: '다' });
        if (kind === 'three') {
          cs.push({ x: R - z, y: 0, r: z });
          tags.push({ x: R - z, y: ty(z), t: '라' });
        }
        const fig = circFig(cs, { segs: [[-R, 0, R, 0]], tags, pts: kind === 'three' ? [] : [{ x: 0, y: 0, t: 'ㅇ', dy: 13 }], w: 220, h: 200 });
        if (kind === 'diff') {
          const ask = r.chance(0.5) ? 'x' : 'dist';
          return {
            q: `점 ㅇ을 원의 중심으로 하는 반지름 $${R}$ cm인 원 가 안에 원 나와 원 다가 그림과 같이 원 가의 지름 위에 서로 맞닿게 꼭 맞추어 들어 있습니다. 원 나의 반지름이 원 다의 반지름보다 $${x - y}$ cm 더 길 때, ${ask === 'x' ? '원 나의 반지름은 몇 cm인가요?' : '점 ㅇ에서 원 나의 중심까지의 거리는 몇 cm인가요?'}`,
            fig,
            answer: { type: 'num', value: ask === 'x' ? x : R - x, unit: 'cm' },
            steps: [
              `원 가의 지름 $=$ 원 나의 지름 $+$ 원 다의 지름`,
              `양쪽을 반으로 나누면: (원 나의 반지름) $+$ (원 다의 반지름) $=${R}$ cm`,
              `두 반지름의 합은 $${R}$, 차는 $${x - y}$ → 원 다의 반지름 $=(${R}-${x - y})\\div2=${y}$ (cm)`,
              `원 나의 반지름 $=${y}+${x - y}=${x}$ (cm)`,
              ...(ask === 'dist' ? [`원 나의 중심은 원 가의 왼쪽 끝에서 $${x}$ cm, 점 ㅇ은 $${R}$ cm → $${R}-${x}=${R - x}$ (cm)`] : []),
            ],
            hint: '큰 원의 지름을 두 작은 원의 지름으로 나타내 보세요.',
          };
        }
        if (kind === 'times') {
          const k = x / y;
          return {
            q: `점 ㅇ을 원의 중심으로 하는 반지름 $${R}$ cm인 원 가 안에 원 나와 원 다가 그림과 같이 원 가의 지름 위에 서로 맞닿게 꼭 맞추어 들어 있습니다. 원 나의 반지름은 원 다의 반지름의 $${k}$배입니다. 점 ㅇ에서 원 다의 중심까지의 거리는 몇 cm인가요?`,
            fig,
            answer: { type: 'num', value: R - y, unit: 'cm' },
            steps: [
              `(원 나의 반지름) $+$ (원 다의 반지름) $=$ (원 가의 반지름) $=${R}$ cm`,
              `원 다의 반지름을 □라 하면 원 나의 반지름은 □의 $${k}$배 → □의 $${k + 1}$배 $=${R}$`,
              `□ $=${R}\\div${k + 1}=${y}$ (cm)`,
              `원 다의 중심은 원 가의 오른쪽 끝에서 $${y}$ cm 안쪽`,
              `점 ㅇ에서의 거리: $${R}-${y}=${R - y}$ (cm)`,
            ],
            hint: '두 작은 원의 반지름의 합은 큰 원의 반지름과 같아요.',
          };
        }
        return {
          q: `원 가 안에 원 나, 다, 라가 그림과 같이 원 가의 지름 위에 서로 맞닿게 꼭 맞추어 들어 있습니다. 원 나의 반지름은 원 다의 반지름의 $2$배이고, 원 라의 반지름은 원 다의 반지름보다 $${z - y}$ cm 더 깁니다. 원 가의 반지름이 $${R}$ cm일 때, 원 라의 지름은 몇 cm인가요?`,
          fig,
          answer: { type: 'num', value: 2 * z, unit: 'cm' },
          steps: [
            `세 원의 지름의 합 $=$ 원 가의 지름 → 세 원의 반지름의 합 $=${R}$ cm`,
            `원 다의 반지름을 □라 하면: 나 $=$ □$\\times2$, 라 $=$ □$+${z - y}$`,
            `□$\\times2+$□$+$□$+${z - y}=${R}$ → □의 $4$배 $=${R}-${z - y}=${R - (z - y)}$`,
            `□ $=${R - (z - y)}\\div4=${y}$ (cm)`,
            `원 라의 반지름: $${y}+${z - y}=${z}$ (cm) → 지름 $${2 * z}$ cm`,
          ],
          hint: '모든 반지름을 원 다의 반지름으로 나타내 보세요.',
        };
      },
    },
  ],

  'e3b-4': [
    {
      id: 'top-frac-cards-count',
      title: '수 카드로 만들 수 있는 대분수의 개수',
      gen(r): ProblemDraft {
        const k = r.pick([4, 4, 5]);
        const cards = r.sample(DIG, k).sort((x, y) => x - y);
        const ct = cards.map((x) => `\\boxed{${x}}`).join('\\;');
        const ranged = r.chance(0.5);
        let A = 0,
          B = 0;
        if (ranged) {
          A = r.int(cards[0], cards[k - 2]);
          B = r.int(A + 2, Math.min(cards[k - 1] + 1, A + 5));
          if (B <= A + 1) B = A + 2;
        }
        const ok = (w: number) => !ranged || (w >= A && w < B);
        const per = cards.map((d) => {
          let n = 0;
          for (const nu of cards) for (const w of cards) if (nu < d && w !== d && w !== nu && nu !== d && ok(w)) n++;
          return { d, n };
        });
        const total = sum(per.map((x) => x.n));
        const rows = per.filter((x) => cards.some((nu) => nu < x.d));
        return {
          q: `수 카드 $${ct}$ 중에서 $3$장을 골라 한 번씩만 사용하여 대분수를 만들려고 합니다. ${ranged ? `만들 수 있는 대분수 중에서 $${A}$보다 크고 $${B}$보다 작은 것은 모두 몇 개인가요?` : '만들 수 있는 대분수는 모두 몇 개인가요?'}`,
          answer: { type: 'num', value: total, unit: '개' },
          steps: [
            `대분수의 분수 부분은 진분수 → 분자가 분모보다 작아야 해요. 분모를 먼저 정해 세어요.`,
            ...(ranged ? [`$${A}$보다 크고 $${B}$보다 작으려면 자연수 부분이 ${range(A, B - 1).map((x) => `$${x}$`).join(', ')} 중 하나여야 해요.`] : []),
            ...rows.map((x) => {
              const nus = cards.filter((nu) => nu < x.d);
              if (ranged) {
                const ms: string[] = [];
                for (const nu of nus) for (const w of cards) if (w !== x.d && w !== nu && ok(w)) ms.push(`$${w}\\frac{${nu}}{${x.d}}$`);
                return `분모 $${x.d}$: ${ms.length ? ms.join(', ') : '없음'} → $${x.n}$개`;
              }
              return `분모 $${x.d}$: 분자 ${nus.map((v) => `$${v}$`).join(', ')} 중 하나, 자연수 부분은 남은 카드 $${k - 2}$장 중 하나 → $${x.n}$개`;
            }),
            `모두 $${rows.map((x) => x.n).join('+')}=${total}$(개)`,
          ],
          hint: '분모가 될 카드를 하나씩 정해 놓고 세어 보세요.',
        };
      },
    },
    {
      id: 'top-bounce-ball',
      title: '튀어 오르는 공의 높이',
      gen(r): ProblemDraft {
        const [p, q] = r.pick([
          [1, 2],
          [2, 3],
          [3, 4],
          [3, 5],
          [2, 5],
          [4, 5],
        ]);
        const kind = r.pick(['back', 'dist', 'both'] as const);
        const k = r.int(2, 3);
        const [t] = until(
          () => [r.int(1, 30)],
          ([t]) => t * q ** k <= 1000 && t * q ** k >= 60 && t * p ** k >= 4,
        );
        const H = t * q ** k;
        const hs = range(0, k).map((i) => (H / q ** i) * p ** i); // hs[0]=H, hs[i]=i번째 튀어 오른 높이
        const ORDN = ['', '첫 번째', '두 번째', '세 번째', '네 번째'];
        const inv = p === 1 ? `\\times${q}` : `\\div${p}\\times${q}`;
        const rule = `공을 떨어뜨리면 떨어진 높이의 $${fr(p, q)}$만큼 튀어 오릅니다.`;
        if (kind === 'back') {
          const back = range(1, k)
            .reverse()
            .map((i) => `${ORDN[i]}로 튀어 오른 $${hs[i]}$ cm는 그 전 높이 $${hs[i - 1]}$ cm의 $${fr(p, q)}$ ($${hs[i]}${inv}=${hs[i - 1]}$)`);
          return {
            q: `${rule} 어떤 높이에서 공을 떨어뜨렸더니 ${ORDN[k]}로 튀어 오른 높이가 $${hs[k]}$ cm였습니다. 처음 공을 떨어뜨린 높이는 몇 cm인가요?`,
            answer: { type: 'num', value: H, unit: 'cm' },
            steps: [`□의 $${fr(p, q)}$가 △이면 □를 $${q}$묶음으로 나눈 것 중 $${p}$묶음이 △ → □$=$△$${inv}$`, ...back, `처음 높이: $${H}$ cm`],
            hint: '튀어 오른 높이에서 거꾸로 그 전 높이를 구해요.',
          };
        }
        if (kind === 'dist') {
          const ups = hs.slice(1, k);
          const D = H + 2 * sum(ups);
          return {
            q: `${rule} $${H}$ cm 높이에서 공을 떨어뜨렸을 때, 공이 땅에 ${ORDN[k]}로 닿을 때까지 움직인 거리는 모두 몇 cm인가요?`,
            answer: { type: 'num', value: D, unit: 'cm' },
            steps: [
              ...ups.map((h, i) => `${ORDN[i + 1]}로 튀어 오른 높이: $${hs[i]}$의 $${fr(p, q)}$ → $${hs[i]}\\div${q}${p === 1 ? '' : `\\times${p}`}=${h}$ (cm)`),
              `땅에 ${ORDN[k]}로 닿을 때까지: 처음 내려온 $${H}$ cm, 그 뒤 ${ups.length}번 오르내림`,
              `튀어 오른 만큼 다시 내려오므로 오르내린 거리는 높이의 $2$배씩`,
              `$${H}+${ups.map((h) => `${h}\\times2`).join('+')}=${D}$ (cm)`,
            ],
            hint: '튀어 오른 높이만큼 다시 떨어져요.',
          };
        }
        return {
          q: `${rule} 어떤 높이에서 공을 떨어뜨렸더니 ${ORDN[k]}로 튀어 오른 높이가 $${hs[k]}$ cm였습니다. 공을 떨어뜨린 때부터 ${ORDN[k]}로 튀어 올라 가장 높은 곳에 닿을 때까지 공이 움직인 거리는 모두 몇 cm인가요?`,
          answer: { type: 'num', value: H + sum(hs.slice(1, k)) * 2 + hs[k], unit: 'cm' },
          steps: [
            `거꾸로: □의 $${fr(p, q)}$가 △이면 □$=$△$${inv}$`,
            `튀어 오른 높이를 거꾸로 구하면 ${range(0, k)
              .reverse()
              .map((i) => `$${hs[i]}$`)
              .join(' → ')} (cm) → 처음 높이 $${H}$ cm`,
            `움직인 거리: 처음 $${H}$ cm 내려옴`,
            `${range(1, k - 1)
              .map((i) => `$${hs[i]}$ cm 오르내림`)
              .join(', ')}${k > 1 ? ', ' : ''}마지막에 $${hs[k]}$ cm 올라감`,
            `$${H}+${hs
              .slice(1, k)
              .map((h) => `${h}\\times2`)
              .join('+')}+${hs[k]}=${H + sum(hs.slice(1, k)) * 2 + hs[k]}$ (cm)`,
          ],
          hint: '먼저 처음 높이를 구하고, 오르내린 길이를 빠짐없이 더해요.',
        };
      },
    },
  ],

  'e3b-5': [
    {
      id: 'top-weights-count',
      title: '추로 잴 수 있는 무게의 가짓수',
      gen(r): ProblemDraft {
        if (r.chance(0.5)) {
          const ws = until(
            () => r.sample([100, 200, 300, 400, 500, 600, 800], 4).sort((x, y) => x - y),
            (ws) => {
              const s = new Set<number>();
              for (let m = 1; m < 16; m++) s.add(sum(ws.filter((_, i) => m & (1 << i))));
              return s.size < 15;
            },
          );
          const byK: number[][] = [[], [], [], [], []];
          for (let m = 1; m < 16; m++) {
            const sel = ws.filter((_, i) => m & (1 << i));
            byK[sel.length].push(sum(sel));
          }
          const all = [...new Set(byK.flat())].sort((x, y) => x - y);
          return {
            q: `무게가 ${ws.map((w) => `$${w}$ g`).join(', ')}인 추가 하나씩 있습니다. 저울의 한쪽 접시에만 추를 올려서 잴 수 있는 무게는 모두 몇 가지인가요? (추는 한 개만 올려도 되고, 여러 개를 함께 올려도 됩니다.)`,
            answer: { type: 'num', value: all.length, unit: '가지' },
            steps: [
              ...[1, 2, 3, 4].map(
                (k) =>
                  `추 $${k}$개: ${[...byK[k]]
                    .sort((x, y) => x - y)
                    .map((v) => `$${c(v)}$`)
                    .join(', ')}`,
              ),
              `만들 수 있는 경우는 $15$가지이지만 같은 무게가 겹쳐요.`,
              `서로 다른 무게: ${all.map((v) => `$${c(v)}$`).join(', ')} (g) → $${all.length}$가지`,
            ],
            hint: '추의 개수별로 나누어 빠짐없이 쓰고, 같은 무게는 한 번만 세요.',
          };
        }
        const base = r.pick([1, 10, 100]);
        const set0 = r.pick([
          [1, 3, 9],
          [1, 2, 5],
          [1, 3, 7],
          [2, 3, 8],
          [1, 4, 6],
          [2, 5, 6],
          [1, 2, 6],
        ]);
        const ws = set0.map((w) => w * base);
        const one = new Set<number>(),
          two = new Set<number>();
        for (const a of [-1, 0, 1])
          for (const b of [-1, 0, 1])
            for (const cc of [-1, 0, 1]) {
              const v = a * ws[0] + b * ws[1] + cc * ws[2];
              if (v <= 0) continue;
              if (a >= 0 && b >= 0 && cc >= 0) one.add(v);
              else two.add(v);
            }
        const onlyTwo = [...two].filter((v) => !one.has(v)).sort((x, y) => x - y);
        const all = [...new Set([...one, ...two])].sort((x, y) => x - y);
        return {
          q: `무게가 ${ws.map((w) => `$${c(w)}$ g`).join(', ')}인 추가 하나씩 있습니다. 양팔 저울의 양쪽 접시에 추를 올릴 수 있을 때, 잴 수 있는 물건의 무게는 모두 몇 가지인가요? (추는 한 번에 여러 개를 함께 써도 됩니다.)`,
          answer: { type: 'num', value: all.length, unit: '가지' },
          steps: [
            `추를 물건의 반대쪽에만 올리면 추의 무게의 합을 잴 수 있어요: ${[...one]
              .sort((x, y) => x - y)
              .map((v) => `$${c(v)}$`)
              .join(', ')}`,
            `추를 물건과 같은 쪽에도 올리면 무게의 차를 잴 수 있어요. 예) 물건 $+${c(ws[0])}$ g $=$ $${c(ws[1])}$ g → 물건 $${c(ws[1] - ws[0])}$ g`,
            `차로 새로 생기는 무게: ${onlyTwo.length ? onlyTwo.map((v) => `$${c(v)}$`).join(', ') : '없음'}`,
            `모두: ${all.map((v) => `$${c(v)}$`).join(', ')} (g)`,
            `$${all.length}$가지`,
          ],
          hint: '물건과 같은 쪽에 올린 추는 빼는 것과 같아요.',
        };
      },
    },
    {
      id: 'top-scale-swap',
      title: '저울 두 개로 바꾸어 무게 구하기',
      gen(r): ProblemDraft {
        const [A, B, C] = r.pick([
          ['사과', '배', '귤'],
          ['감', '멜론', '자두'],
          ['오렌지', '파인애플', '키위'],
          ['참외', '멜론', '자두'],
        ]);
        const [p, q, s, t, kk] = until(
          () => {
            const p = r.int(1, 2),
              tp = r.int(1, 2),
              kk = r.int(2, 4);
            const qs = tp * kk; // q + s
            const q = r.int(1, qs - 1);
            return [p, q, qs - q, p + tp, kk];
          },
          ([p, q, s, t]) => q >= 1 && s >= 1 && t > p,
        );
        const g = r.int(5, 15) * 10;
        const wA = kk * g,
          wB = p * wA + q * g;
        const ask = r.chance(0.6) ? 'B' : 'A';
        const ea = (n: number, w: string) => (n === 1 ? `${w} $1$개` : `${w} $${n}$개`);
        return {
          q: `양팔 저울로 과일의 무게를 비교했습니다.\n- ${ea(1, B)}의 무게는 ${ea(p, A)}와 ${ea(q, C)}의 무게를 더한 것과 같습니다.\n- ${ea(1, B)}와 ${ea(s, C)}를 한쪽 접시에, ${ea(t, A)}를 다른 쪽 접시에 올렸더니 수평이 되었습니다.\n${C} $1$개의 무게가 $${g}$ g일 때, ${ask === 'B' ? B : A} $1$개의 무게는 몇 g인가요? (같은 과일끼리는 무게가 같습니다.)`,
          answer: { type: 'num', value: ask === 'B' ? wB : wA, unit: 'g' },
          steps: [
            `둘째 저울의 ${B} $1$개 대신 첫째 조건의 (${ea(p, A)} $+$ ${ea(q, C)})를 넣어요.`,
            `${ea(p, A)} $+$ ${ea(q + s, C)} $=$ ${ea(t, A)}`,
            `양쪽에서 ${ea(p, A)}씩 덜어 내면: ${ea(q + s, C)} $=$ ${ea(t - p, A)}`,
            t - p === 1 ? `${A} $1$개 $=$ ${C} $${kk}$개 $=${g}\\times${kk}=${wA}$ (g)` : `${A} $1$개 $=$ ${C} $${(q + s) / (t - p)}$개 $=${g}\\times${kk}=${wA}$ (g)`,
            `${B} $1$개 $=${wA}\\times${p}+${g}\\times${q}=${wB}$ (g)`,
            `답: $${ask === 'B' ? wB : wA}$ g`,
          ],
          hint: `${B} 대신 다른 과일로 바꾸어 넣어 보세요.`,
        };
      },
    },
  ],

  'e3b-6': [
    {
      id: 'top-graph-table',
      title: '그림그래프와 표를 함께 해석하기',
      gen(r): ProblemDraft {
        const th = r.pick([
          { head: '마을', labels: ['가', '나', '다', '라'], suf: ' 마을', gFull: '사과 수확량', tFull: '배 수확량', both: '사과와 배의 수확량을 합한 것', unit: '상자' },
          { head: '반', labels: ['1반', '2반', '3반', '4반'], suf: '', gFull: '모은 빈 병의 수', tFull: '모은 빈 캔의 수', both: '모은 빈 병과 빈 캔의 수를 합한 것', unit: '개' },
          { head: '가게', labels: ['해님', '달님', '별님', '구름'], suf: ' 가게', gFull: '우유 판매량', tFull: '주스 판매량', both: '우유와 주스의 판매량을 합한 것', unit: '개' },
        ]);
        const nmG = (i: number) => th.labels[i] + th.suf;
        const [G, T, e, b, dd] = until(
          () => {
            const G = th.labels.map(() => r.int(11, 45) * 10);
            const T = th.labels.map(() => r.int(11, 45) * 10);
            const [e, b] = r.sample([0, 1, 2, 3], 2);
            return [G, T, e, b, G[e] - T[b]] as [number[], number[], number, number, number];
          },
          ([G, T, e, b, dd]) => {
            const S = G.map((v, i) => v + T[i]);
            const mxv = Math.max(...S),
              mnv = Math.min(...S);
            return dd > 0 && new Set(G).size === 4 && S.filter((x) => x === mxv).length === 1 && S.filter((x) => x === mnv).length === 1 && e !== b;
          },
        );
        const S = G.map((v, i) => v + T[i]);
        const totT = sum(T);
        const mi = S.indexOf(Math.max(...S)),
          li = S.indexOf(Math.min(...S));
        const shownG = G.map((v, i) => (i === e ? 0 : v));
        const { gFull, tFull } = th;
        return {
          q: `${th.head}별 ${J(gFull, '을/를')} 나타낸 그림그래프와 ${J(tFull, '을/를')} 나타낸 표입니다. 그림그래프에서 ${nmG(e)}의 그림이 지워졌고, 표에서 ${nmG(b)}의 칸이 비어 있습니다.\n- 네 ${th.head}의 ${J(tFull, '은/는')} 모두 $${c(totT)}$${th.unit}입니다.\n- ${nmG(e)}의 ${J(gFull, '은/는')} ${nmG(b)}의 ${tFull}보다 $${dd}$${th.unit} 더 많습니다.\n${th.both}이 가장 많은 ${J(th.head, '은/는')} 가장 적은 ${th.head}보다 몇 ${th.unit} 더 많은가요?`,
          fig: picGraph(th.labels, shownG, [100, 10], { unitName: th.unit, head: th.head }),
          table: [[th.head, ...th.labels.map((_, i) => nmG(i))], [`${tFull}(${th.unit})`, ...T.map((v, i) => (i === b ? '' : `$${v}$`))]],
          answer: { type: 'num', value: S[mi] - S[li], unit: th.unit },
          steps: [
            `표의 빈칸 ${nmG(b)}: $${c(totT)}-${T.filter((_, i) => i !== b).join('-')}=${T[b]}$`,
            `그래프의 ${nmG(e)}: $${T[b]}+${dd}=${G[e]}$`,
            `${th.head}별 합: ${S.map((v, i) => `${nmG(i)} $${G[i]}+${T[i]}=${v}$`).join(', ')}`,
            `가장 많은 곳 ${nmG(mi)} $${S[mi]}$, 가장 적은 곳 ${nmG(li)} $${S[li]}$`,
            `차: $${S[mi]}-${S[li]}=${S[mi] - S[li]}$ (${th.unit})`,
          ],
          hint: '먼저 비어 있는 두 자료를 차례로 구해요.',
        };
      },
    },
    {
      id: 'top-graph-icon-cases',
      title: '그림의 개수로 자료의 경우 따지기',
      gen(r): ProblemDraft {
        const three = r.chance(0.5);
        const th = r.pick(GT);
        const units = three ? [100, 50, 10] : [100, 10];
        const n = three ? r.int(4, 9) : r.int(6, 15);
        const cases: number[][] = [];
        if (three) {
          for (let b = 0; b <= 1; b++) for (let s = 0; s <= 4; s++) if (n - b - s >= 0) cases.push([n - b - s, b, s]);
        } else for (let s = 0; s <= 9; s++) if (n - s >= 0) cases.push([n - s, s]);
        const vals = cases.map((cs) => sum(cs.map((k, j) => k * units[j]))).sort((x, y) => x - y);
        const ask = three ? r.pick(['count', 'diff', 'second'] as const) : r.pick(['diff', 'second'] as const);
        const nm3 = UNIT_NAMES(units.length);
        const sMax = Math.min(9, n);
        const ans = ask === 'count' ? vals.length : ask === 'diff' ? vals[vals.length - 1] - vals[0] : vals[1];
        const ofx = th.of(gName(th, 0));
        const rule = three ? `중간 그림은 $1$개까지, 작은 그림은 $4$개까지만 그립니다` : `작은 그림은 $9$개까지만 그립니다`;
        return {
          q: `${th.head}별 ${J(th.thing, '을/를')} ${units.map((u, j) => `${nm3[j]}(${u}${th.unit})`).join(', ')}으로 나타낸 그림그래프에서, 그림 수가 가장 적게 되도록 그렸기 때문에 ${rule}. ${J(gName(th, 0), '을/를')} 나타낸 그림이 모두 $${n}$개일 때, ${ofx}${josa(ofx, '으로/로')} 생각할 수 있는 수${ask === 'count' ? '는 모두 몇 가지인가요?' : ask === 'diff' ? ` 중 가장 큰 수와 가장 작은 수의 차는 몇 ${th.unit}인가요?` : ` 중 두 번째로 작은 수는 몇 ${th.unit}인가요?`}`,
          answer: { type: 'num', value: ans, unit: ask === 'count' ? '가지' : th.unit },
          steps: [
            `${three ? '중간 그림 ($0$~$1$개)과 작은 그림 ($0$~$4$개)의 개수' : '작은 그림의 개수 ($0$~$9$개)'}를 정하면 큰 그림의 개수가 정해져요.`,
            ...(three
              ? [0, 1].map(
                  (b) =>
                    `중간 그림 $${b}$개: ${cases
                      .filter((cs) => cs[1] === b)
                      .map((cs) => `$${sum(cs.map((k, j) => k * units[j]))}$`)
                      .join(', ')}`,
                )
              : [`작은 그림 $0$개 → $${c(n * 100)}$, $1$개 → $${c((n - 1) * 100 + 10)}$, …, $${sMax}$개 → $${c((n - sMax) * 100 + 10 * sMax)}$ (작은 그림이 $1$개 늘 때마다 $90$씩 작아져요)${sMax < 9 ? ` — 그림이 $${n}$개뿐이라 작은 그림은 $${n}$개까지` : ''}`]),
            `생각할 수 있는 수: ${vals.length <= 10 ? vals.map((v) => `$${c(v)}$`).join(', ') : `$${c(vals[0])}$부터 $${c(vals[vals.length - 1])}$까지 $${vals.length}$가지`}`,
            ask === 'count' ? `모두 $${vals.length}$가지` : ask === 'diff' ? `$${c(vals[vals.length - 1])}-${c(vals[0])}=${c(ans)}$ (${th.unit})` : `두 번째로 작은 수: $${c(vals[1])}$${th.unit}`,
          ],
          hint: '작은 그림의 개수를 기준으로 경우를 나누어 보세요.',
        };
      },
    },
  ],
};
