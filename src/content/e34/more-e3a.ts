// e3a 심화 추가분 (v0.11): 단원마다 심화 유형 3개 + 최상위 2개
import type { ProblemDraft, Skill } from '../../core/types';
import { Svg } from '../../core/fig';
import { makeChoices } from '../../core/tex';
import { gcd, round } from '../../core/nt';
import { J, NAMES, c, fr, josa, nm, pick2Names, pickName } from './util';
import { ORD, boxes, perms, sum, until } from './hardutil';

const DIG = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const num = (ds: number[]) => ds.reduce((a, b) => a * 10 + b, 0);
const list = (xs: number[]) => xs.map((x) => `$${c(x)}$`).join(', ');
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
/** 초 → '$a$분 $b$초' */
const ms = (sec: number) => (sec >= 60 ? `$${Math.floor(sec / 60)}$분${sec % 60 ? ` $${sec % 60}$초` : ''}` : `$${sec}$초`);
/** 하루 중 분 → '오전 $9$시 $10$분' */
const tt = (m: number) => {
  const h = Math.floor(m / 60) % 24,
    mm = m % 60;
  return `${h < 12 ? '오전' : '오후'} $${h % 12 === 0 ? 12 : h % 12}$시${mm ? ` $${mm}$분` : ''}`;
};
const ampm = (m: number) => (Math.floor(m / 60) % 24 < 12 ? '오전' : '오후');
const hmFields = (m: number) => ({
  type: 'fields' as const,
  fields: [
    { label: '시', value: Math.floor(m / 60) % 12 === 0 ? 12 : Math.floor(m / 60) % 12 },
    { label: '분', value: m % 60 },
  ],
});
const msFields = (sec: number) => ({
  type: 'fields' as const,
  fields: [
    { label: '분', value: Math.floor(sec / 60) },
    { label: '초', value: sec % 60 },
  ],
});
/** m → '$a$ km $b$ m' */
const kmm = (m: number) => (m >= 1000 ? (m % 1000 ? `$${Math.floor(m / 1000)}$ km $${m % 1000}$ m` : `$${m / 1000}$ km`) : `$${m}$ m`);
const kmFields = (m: number) => ({
  type: 'fields' as const,
  fields: [
    { label: 'km', value: Math.floor(m / 1000) },
    { label: 'm', value: m % 1000 },
  ],
});
/** '□+□=x' 를 반으로 나누는 설명 */
function halfText(x: number): string {
  const y = x / 2;
  const big = y >= 100 ? Math.floor(y / 100) * 100 : Math.floor(y / 10) * 10;
  const rest = y - big;
  if (!big || !rest) return `$${y}+${y}=${x}$ 이므로 □ $=${y}$`;
  return `$${big}+${big}=${2 * big}$, $${rest}+${rest}=${2 * rest}$ 이므로 □ $=${y}$`;
}
const ro = (k: number) => josa(k, '으로/로');

// ═════════════════════════════ e3a-2 그림 도우미 ═════════════════════════════
type Seg = [number, number, number, number];
type P2 = [number, number];
function onSeg(p: P2, s: Seg): boolean {
  const [x1, y1, x2, y2] = s;
  const cr = (x2 - x1) * (p[1] - y1) - (y2 - y1) * (p[0] - x1);
  if (cr !== 0) return false;
  return Math.min(x1, x2) <= p[0] && p[0] <= Math.max(x1, x2) && Math.min(y1, y2) <= p[1] && p[1] <= Math.max(y1, y2);
}
/** 격자 선분 그림에서 직각삼각형을 모두 찾는다 (직각을 낀 변 길이 목록) */
function rightTris(W: number, H: number, segs: Seg[]): number[] {
  const pts: P2[] = [];
  for (let x = 0; x <= W; x++) for (let y = 0; y <= H; y++) if (segs.some((s) => onSeg([x, y], s))) pts.push([x, y]);
  // 한 직선 위에 이어 그은 선분 여러 개도 한 변으로 본다 (a→b 위의 반 칸 간격 점이 모두 선 위에 있으면 이어진 것)
  const joined = (a: P2, b: P2) => {
    const n = gcd(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
    const at = (i: number): P2 => [a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n];
    for (let i = 0; i < n; i++) {
      const p = at(i),
        q = at(i + 1);
      if (!segs.some((s) => onSeg(p, s) && onSeg(q, s))) return false;
    }
    return true;
  };
  const legs: number[] = [];
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++)
      for (let k = j + 1; k < pts.length; k++) {
        const [A, B, C] = [pts[i], pts[j], pts[k]];
        const cr = (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]);
        if (cr === 0) continue;
        if (!joined(A, B) || !joined(B, C) || !joined(A, C)) continue;
        const dot = (o: P2, p: P2, q: P2) => (p[0] - o[0]) * (q[0] - o[0]) + (p[1] - o[1]) * (q[1] - o[1]);
        let at: P2 | null = null,
          o1: P2 = A;
        if (dot(A, B, C) === 0) [at, o1] = [A, B];
        else if (dot(B, A, C) === 0) [at, o1] = [B, A];
        else if (dot(C, A, B) === 0) [at, o1] = [C, A];
        if (at) legs.push(Math.abs(o1[0] - at[0]) + Math.abs(o1[1] - at[1]));
      }
  return legs;
}
function segFig(W: number, H: number, segs: Seg[], mirror: boolean): string {
  const u = Math.min(56, 230 / W, 150 / H);
  const s = new Svg(Math.round(W * u + 24), Math.round(H * u + 24));
  const X = (x: number) => 12 + (mirror ? W - x : x) * u,
    Y = (y: number) => 12 + (H - y) * u;
  for (const [x1, y1, x2, y2] of segs) s.line(X(x1), Y(y1), X(x2), Y(y2), { cls: 'acc' });
  return s.toString();
}

// ═════════════════════════════ 심화 유형 ═════════════════════════════
export const MORE_E3A: Record<string, Skill[]> = {
  // ───────── e3a-1 덧셈과 뺄셈
  'e3a-1': [
    {
      id: 'sum-diff-pair',
      title: '합과 차로 두 수 구하기',
      gen(r, level) {
        if (level <= 2) {
          const small = level === 1 ? r.int(1, 4) * 10 + r.int(1, 4) : r.int(60, 240);
          const D = level === 1 ? r.int(2, 4) * 10 + r.int(1, 5) : r.int(25, 160);
          const big = small + D,
            S = small + big;
          const askSmall = r.chance(0.5);
          if (level === 1) {
            const [n1, n2] = pick2Names(r);
            const it = r.pick([
              { w: '구슬', u: '개' },
              { w: '딱지', u: '장' },
              { w: '색종이', u: '장' },
              { w: '스티커', u: '장' },
            ]);
            return {
              q: `${n1}와 ${n2}가 가진 ${J(it.w, '은/는')} 모두 $${S}$${it.u}입니다. ${nm(n1)}가 ${n2}보다 $${D}$${it.u} 더 많이 가지고 있습니다. ${askSmall ? n2 : n1}가 가진 ${J(it.w, '은/는')} 몇 ${it.u}인가요?`,
              answer: { type: 'num', value: askSmall ? small : big, unit: it.u },
              steps: [
                `전체에서 ${n1}가 더 가진 $${D}$${J(it.u, '을/를')} 빼면 두 사람의 수가 같아져요: $${S}-${D}=${S - D}$`,
                `같은 두 수의 합이 $${S - D}$ → ${halfText(S - D)}`,
                `${n2}: $${small}$${it.u}, ${n1}: $${small}+${D}=${big}$ (${it.u})`,
                `답: $${askSmall ? small : big}$${it.u}`,
              ],
              hint: '더 많은 만큼을 먼저 빼면 두 수가 같아져요.',
            };
          }
          const ctx = r.pick([
            { a: '남학생', b: '여학생', u: '명', all: '어느 학교 3학년 학생은 모두', what: '학생' },
            { a: '사과', b: '배', u: '개', all: '과수원에서 딴 사과와 배는 모두', what: '과일' },
            { a: '동화책', b: '위인전', u: '권', all: '학급 문고에 있는 동화책과 위인전은 모두', what: '책' },
          ]);
          return {
            q: `${ctx.all} $${S}$${ctx.u}입니다. ${J(ctx.a, '이/가')} ${ctx.b}보다 $${D}$${ctx.u} 더 많습니다. ${J(askSmall ? ctx.b : ctx.a, '은/는')} 몇 ${ctx.u}인가요?`,
            answer: { type: 'num', value: askSmall ? small : big, unit: ctx.u },
            steps: [
              `전체에서 ${ctx.a}가 더 많은 $${D}$${J(ctx.u, '을/를')} 빼면 ${J(ctx.a, '와/과')} ${ctx.b}의 수가 같아져요.`.replace(`${ctx.a}가`, J(ctx.a, '이/가')),
              `$${S}-${D}=${S - D}$`,
              `같은 두 수의 합이 $${S - D}$ → ${halfText(S - D)}`,
              `${ctx.b}: $${small}$${ctx.u}, ${ctx.a}: $${small}+${D}=${big}$ (${ctx.u})`,
            ],
            hint: '합에서 차를 빼면 작은 수가 두 번 더해진 셈이에요.',
          };
        }
        // 3단계: 합이 바로 주어지지 않음
        const small = r.int(110, 320),
          D = r.int(35, 190);
        const big = small + D,
          S = small + big;
        const p = r.int(Math.floor(S / 2) - 80, Math.floor(S / 2) + 80),
          q2 = S - p;
        const ctx = r.pick([
          { a: '동화책', b: '위인전', u: '권', place: '도서관에서 새로 들여온 책', d1: '어제', d2: '오늘' },
          { a: '어른', b: '어린이', u: '명', place: '과학관에 온 사람', d1: '토요일에', d2: '일요일에' },
          { a: '빨간 장미', b: '노란 장미', u: '송이', place: '꽃집에서 오늘 판 장미', d1: '오전에', d2: '오후에' },
        ]);
        return {
          q: `${J(ctx.place, '은/는')} ${ctx.d1} $${p}$${ctx.u}, ${ctx.d2} $${q2}$${ctx.u}입니다. 이것은 모두 ${J(ctx.a, '와/과')} ${ctx.b}이고, ${J(ctx.a, '이/가')} ${ctx.b}보다 $${D}$${ctx.u} 더 많습니다. ${J(ctx.a, '와/과')} ${J(ctx.b, '은/는')} 각각 몇 ${ctx.u}인가요?`,
          answer: {
            type: 'fields',
            fields: [
              { label: ctx.a, value: big, unit: ctx.u },
              { label: ctx.b, value: small, unit: ctx.u },
            ],
          },
          steps: [
            `모두: $${p}+${q2}=${S}$ (${ctx.u})`,
            `더 많은 $${D}$${J(ctx.u, '을/를')} 빼면 두 수가 같아져요: $${S}-${D}=${S - D}$`,
            `같은 두 수의 합이 $${S - D}$ → ${halfText(S - D)}`,
            `${ctx.b}: $${small}$${ctx.u}, ${ctx.a}: $${small}+${D}=${big}$ (${ctx.u})`,
            `확인: $${big}+${small}=${S}$, $${big}-${small}=${D}$`,
          ],
          hint: '먼저 전체가 몇인지 구한 다음, 더 많은 만큼을 빼 보세요.',
        };
      },
    },
    {
      id: 'box-range-count',
      title: '□ 안에 들어갈 수 있는 수의 개수',
      gen(r, level) {
        if (level <= 2) {
          type T = { h: number; o: number; C: number; T: number; kind: number; ok: number[] };
          const t = until(
            (): T => {
              const h = r.int(1, 7),
                o = r.int(0, 9);
              const kind = level === 1 ? r.int(0, 1) : r.int(2, 4);
              const C = r.int(level === 1 ? 110 : 150, level === 1 ? 300 : 480);
              const A = (d: number) => 100 * h + 10 * d + o;
              let T0: number, f: (d: number) => boolean;
              if (kind === 0) {
                T0 = A(r.int(1, 8)) + C + r.int(1, 9);
                f = (d) => A(d) + C < T0;
              } else if (kind === 1) {
                T0 = A(r.int(1, 8)) + C - r.int(1, 9);
                f = (d) => A(d) + C > T0;
              } else if (kind === 2) {
                T0 = A(r.int(1, 8)) - C + r.int(-9, 9);
                f = (d) => A(d) - C > T0;
              } else if (kind === 3) {
                T0 = A(r.int(1, 8)) - C + r.int(-9, 9);
                f = (d) => A(d) - C < T0;
              } else {
                // C' - A < T  (C' 큰 수)
                const Cb = r.int(800, 990);
                T0 = Cb - A(r.int(1, 8)) + r.int(-9, 9);
                return { h, o, C: Cb, T: T0, kind, ok: range(0, 9).filter((d) => Cb - A(d) < T0) };
              }
              return { h, o, C, T: T0, kind, ok: range(0, 9).filter(f) };
            },
            (t) => t.ok.length >= 2 && t.ok.length <= 8 && t.T > 0 && (t.kind < 2 || t.kind === 4 || 100 * t.h > t.C) && (t.kind !== 4 || 100 * t.h + 99 < t.C) && 100 * t.h + 99 + (t.kind < 2 ? t.C : 0) <= 999,
          );
          const A = `${t.h}\\square${t.o}`;
          const Av = (d: number) => 100 * t.h + 10 * d + t.o;
          const ops = [`${A}+${t.C}<${t.T}`, `${A}+${t.C}>${t.T}`, `${A}-${t.C}>${t.T}`, `${A}-${t.C}<${t.T}`, `${t.C}-${A}<${t.T}`];
          const eqs = [
            `$${A}<${t.T}-${t.C}=${t.T - t.C}$`,
            `$${A}>${t.T}-${t.C}=${t.T - t.C}$`,
            `$${A}>${t.T}+${t.C}=${t.T + t.C}$`,
            `$${A}<${t.T}+${t.C}=${t.T + t.C}$`,
            `$${A}>${t.C}-${t.T}=${t.C - t.T}$`,
          ];
          const bad = range(0, 9).filter((d) => !t.ok.includes(d));
          const lastOk = t.kind === 0 || t.kind === 3 ? Math.max(...t.ok) : Math.min(...t.ok);
          const firstBad = t.kind === 0 || t.kind === 3 ? Math.min(...bad) : Math.max(...bad);
          return {
            q: `$0$부터 $9$까지의 숫자 중에서 □ 안에 들어갈 수 있는 숫자는 모두 몇 개인가요? $$${ops[t.kind]}$$`,
            answer: { type: 'num', value: t.ok.length, unit: '개' },
            steps: [
              `덧셈과 뺄셈의 관계를 이용해 $${A}$의 범위를 구해요: ${eqs[t.kind]}`,
              `□ $=${lastOk}$: $${Av(lastOk)}$ (됨), □ $=${firstBad}$: $${Av(firstBad)}$ (안 됨)`,
              `□ 안에 들어갈 수 있는 숫자: ${list(t.ok)} → $${t.ok.length}$개`,
            ],
            hint: '□가 있는 수만 남기고 나머지 수를 반대쪽으로 옮겨 생각해 보세요.',
          };
        }
        // 3단계: 두 식에 공통으로 들어갈 수 있는 자연수
        const lo = r.int(150, 560),
          hi = lo + r.int(4, 13);
        const up =
          r.chance(0.5)
            ? (() => {
                const a = r.int(120, 990 - hi);
                return { t: `${a}+\\square<${a + hi}`, s: `$\\square<${a + hi}-${a}=${hi}$` };
              })()
            : (() => {
                const b = r.int(hi + 120, 999),
                  T = b - hi;
                return { t: `${b}-\\square>${T}`, s: `$\\square<${b}-${T}=${hi}$` };
              })();
        const down = r.chance(0.5)
          ? (() => {
              const b = r.int(100, lo - 30);
              return { t: `\\square-${b}>${lo - b}`, s: `$\\square>${lo - b}+${b}=${lo}$` };
            })()
          : (() => {
              const a = r.int(110, 999 - lo);
              return { t: `\\square+${a}>${lo + a}`, s: `$\\square>${lo + a}-${a}=${lo}$` };
            })();
        const both = r.chance(0.5) ? [up, down] : [down, up];
        const cnt = hi - lo - 1;
        return {
          q: `두 식의 □ 안에 공통으로 들어갈 수 있는 자연수는 모두 몇 개인가요? $$${both[0].t}\\qquad ${both[1].t}$$`,
          answer: { type: 'num', value: cnt, unit: '개' },
          steps: [
            `식마다 □의 범위를 구해요.`,
            `$${both[0].t}$ → ${both[0].s}`,
            `$${both[1].t}$ → ${both[1].s}`,
            `$${lo}$보다 크고 $${hi}$보다 작은 자연수: $${lo + 1}$부터 $${hi - 1}$까지`,
            `$${hi - 1}-${lo + 1}+1=${cnt}$ → $${cnt}$개`,
          ],
          hint: '두 식에서 각각 □가 얼마보다 크고 작은지 먼저 알아보세요.',
        };
      },
    },
    {
      id: 'pattern-add-sub',
      title: '덧셈·뺄셈 규칙으로 수 늘어놓기',
      gen(r, level) {
        if (level === 1) {
          const up = r.chance(0.6);
          const n = r.int(5, 6);
          const d = r.int(105, up ? 175 : 180);
          const a = up ? r.int(100, 999 - (n - 1) * d) : r.int(100 + (n - 1) * d, 999);
          const terms = range(0, n - 1).map((i) => (up ? a + i * d : a - i * d));
          return {
            q: `규칙에 따라 수를 늘어놓았습니다. ${ORD[n - 1]} 수는 얼마인가요? $$${terms.slice(0, 3).join(',\\;')},\\;\\cdots$$`,
            answer: { type: 'num', value: terms[n - 1] },
            steps: [
              up ? `$${terms[1]}-${terms[0]}=${d}$ → $${d}$씩 커져요.` : `$${terms[0]}-${terms[1]}=${d}$ → $${d}$씩 작아져요.`,
              ...range(3, n - 1).map((i) => `${ORD[i]}: $${terms[i - 1]}${up ? '+' : '-'}${d}=${terms[i]}$`),
              `답: $${terms[n - 1]}$`,
            ],
            hint: '이웃한 두 수의 차를 구해 보세요.',
          };
        }
        if (level === 2) {
          // 모든 수가 세 자리 수 범위(10~999) 안에 들도록 (음수가 나오지 않게) 다시 뽑음
          const { p, q2, n, terms } = until(
            () => {
              const p = r.int(120, 390),
                q2 = r.int(60, 300);
              const n = r.int(7, 9);
              const a = r.int(100, Math.max(100, 999 - Math.ceil(n / 2) * (p - q2) - q2 - 10));
              const terms = [a];
              for (let i = 1; i < n; i++) terms.push(terms[i - 1] + (i % 2 ? p : -q2));
              if (Math.max(...terms) > 999) {
                const shift = Math.max(...terms) - 999;
                for (let i = 0; i < n; i++) terms[i] -= shift;
              }
              return { p, q2, n, terms };
            },
            (g) => g.p > g.q2 + 20 && (g.p - g.q2) % 10 !== 0 && Math.min(...g.terms) >= 10,
          );
          return {
            q: `규칙에 따라 수를 늘어놓았습니다. ${ORD[n - 1]} 수는 얼마인가요? $$${terms.slice(0, 5).join(',\\;')},\\;\\cdots$$`,
            answer: { type: 'num', value: terms[n - 1] },
            steps: [
              `$${terms[0]}\\xrightarrow{+${p}}${terms[1]}\\xrightarrow{-${q2}}${terms[2]}\\xrightarrow{+${p}}${terms[3]}$ → $${p}$${josa(p, '을/를')} 더하고 $${q2}$${josa(q2, '을/를')} 빼는 것을 되풀이해요.`,
              ...range(5, n - 1).map((i) => `${ORD[i]}: $${terms[i - 1]}${i % 2 ? '+' + p : '-' + q2}=${terms[i]}$`),
              `답: $${terms[n - 1]}$`,
            ],
            hint: '수가 커졌다 작아졌다 해요. 얼마씩 바뀌는지 보세요.',
          };
        }
        if (r.chance(0.5)) {
          // 차가 일정하게 커지는 규칙
          const [a, d, k] = until(
            () => [r.int(100, 400), r.int(11, 60), r.int(5, 30)],
            ([a, d, k]) => a + 6 * d + 15 * k <= 999,
          );
          const terms = [a];
          for (let i = 1; i < 7; i++) terms.push(terms[i - 1] + d + (i - 1) * k);
          return {
            q: `규칙에 따라 수를 늘어놓았습니다. 일곱째 수는 얼마인가요? $$${terms.slice(0, 4).join(',\\;')},\\;\\cdots$$`,
            answer: { type: 'num', value: terms[6] },
            steps: [
              `이웃한 두 수의 차: $${d}$, $${d + k}$, $${d + 2 * k}$ → 차가 $${k}$씩 커져요.`,
              `다음 차는 $${d + 3 * k}$, $${d + 4 * k}$, $${d + 5 * k}$`,
              `다섯째: $${terms[3]}+${d + 3 * k}=${terms[4]}$, 여섯째: $${terms[4]}+${d + 4 * k}=${terms[5]}$`,
              `일곱째: $${terms[5]}+${d + 5 * k}=${terms[6]}$`,
            ],
            hint: '이웃한 두 수의 차를 차례로 써 보고, 그 차의 규칙을 찾아보세요.',
          };
        }
        // 앞의 두 수를 더하는 규칙
        const [a, b, n] = until(
          () => [r.int(11, 60), r.int(12, 70), r.int(7, 8)] as [number, number, number],
          ([a, b, n]) => {
            const t = [a, b];
            for (let i = 2; i < n; i++) t.push(t[i - 1] + t[i - 2]);
            return t[n - 1] <= 999 && t[n - 1] >= 300 && a !== b;
          },
        );
        const terms = [a, b];
        for (let i = 2; i < n; i++) terms.push(terms[i - 1] + terms[i - 2]);
        return {
          q: `규칙에 따라 수를 늘어놓았습니다. ${ORD[n - 1]} 수는 얼마인가요? $$${terms.slice(0, 4).join(',\\;')},\\;\\cdots$$`,
          answer: { type: 'num', value: terms[n - 1] },
          steps: [
            `$${a}+${b}=${terms[2]}$, $${b}+${terms[2]}=${terms[3]}$ → 앞의 두 수를 더하면 다음 수가 돼요.`,
            ...range(4, n - 1).map((i) => `${ORD[i]}: $${terms[i - 2]}+${terms[i - 1]}=${terms[i]}$`),
            `답: $${terms[n - 1]}$`,
          ],
          hint: '차가 일정하지 않다면, 앞의 수들을 더해 보세요.',
        };
      },
    },
  ],

  // ───────── e3a-2 평면도형
  'e3a-2': [
    {
      id: 'count-right-tri',
      title: '그림에서 크고 작은 직각삼각형 세기',
      gen(r, level) {
        const cfg = until(
          () => {
            const W = level === 1 ? r.int(1, 2) : level === 2 ? r.int(2, 3) : r.int(3, 4);
            const H = level === 1 ? (W === 1 ? 2 : r.int(1, 2)) : 2;
            const segs: Seg[] = [
              [0, 0, W, 0],
              [W, 0, W, H],
              [W, H, 0, H],
              [0, H, 0, 0],
            ];
            for (let x = 1; x < W; x++) if (level === 1 || r.chance(0.7)) segs.push([x, 0, x, H]);
            for (let y = 1; y < H; y++) if (level === 1 || r.chance(0.7)) segs.push([0, y, W, y]);
            const nd = level === 1 ? r.int(1, 2) : level === 2 ? r.int(2, 3) : r.int(2, 4);
            const used = new Set<string>();
            for (let i = 0; i < nd; i++) {
              const k = r.int(1, Math.min(W, H, 2));
              const x = r.int(0, W - k),
                y = r.int(0, H - k);
              const key = `${x},${y},${k}`;
              if (used.has(key)) continue;
              used.add(key);
              segs.push([x, y, x + k, y + k]);
            }
            const legs = rightTris(W, H, segs);
            return { W, H, segs, legs };
          },
          (g) => (level === 1 ? g.legs.length >= 3 && g.legs.length <= 6 : level === 2 ? g.legs.length >= 5 && g.legs.length <= 10 : g.legs.length >= 9 && g.legs.length <= 18),
        );
        const tot = cfg.legs.length;
        const groups = [...new Set(cfg.legs)].sort((a, b) => a - b).map((j) => ({ j, n: cfg.legs.filter((x) => x === j).length }));
        return {
          q: '그림에서 찾을 수 있는 크고 작은 **직각삼각형**은 모두 몇 개인가요? (바깥 사각형은 크기가 같은 정사각형 칸을 이어 붙인 모양이고, 가로 선과 세로 선은 직각으로 만나요.)',
          fig: segFig(cfg.W, cfg.H, cfg.segs, r.chance(0.5)),
          answer: { type: 'num', value: tot, unit: '개' },
          steps: [
            '직각삼각형은 한 각이 직각인 삼각형이에요. 직각은 가로 선과 세로 선이 만나는 곳에 생기고, 긴 변은 비스듬한 선이에요.',
            ...groups.map((g) => `직각을 낀 두 변이 작은 정사각형 한 변의 $${g.j}$배인 직각삼각형: $${g.n}$개`),
            groups.length > 1 ? `$${groups.map((g) => g.n).join('+')}=${tot}$ (개)` : `모두 $${tot}$개`,
          ],
          hint: '작은 것부터 크기별로 나누어 빠짐없이 세어 보세요.',
        };
      },
    },
    {
      id: 'split-square-perimeter',
      title: '정사각형을 똑같이 나눈 직사각형의 둘레',
      gen(r, level) {
        let rows: number, cols: number;
        if (level === 1) [rows, cols] = r.chance(0.5) ? [1, 2] : [2, 1];
        else if (level === 2) [rows, cols] = r.chance(0.5) ? [1, r.int(3, 4)] : [r.int(3, 4), 1];
        else
          [rows, cols] = r.pick([
            [2, 3],
            [3, 2],
            [2, 4],
            [4, 2],
            [2, 6],
            [6, 2],
            [3, 6],
          ]);
        const L = (rows * cols) / gcd(rows, cols);
        const w = L / cols,
          h = L / rows; // 직사각형 가로·세로 (칸)
        const per = 2 * (w + h);
        const t = r.int(level === 3 ? 2 : 2, Math.min(9, Math.floor(90 / per)));
        const P = per * t,
          side = L * t;
        const askPer = r.chance(0.5);
        const sz = 120;
        const s = new Svg(sz + 20, sz + 20);
        s.rect(10, 10, sz, sz, { cls: 'acc' });
        for (let i = 1; i < cols; i++) s.line(10 + (i * sz) / cols, 10, 10 + (i * sz) / cols, 10 + sz, { cls: 'acc' });
        for (let i = 1; i < rows; i++) s.line(10, 10 + (i * sz) / rows, 10 + sz, 10 + (i * sz) / rows, { cls: 'acc' });
        const k = rows * cols;
        const how = rows === 1 || cols === 1 ? `똑같이 $${k}$개의 직사각형으로` : `가로를 똑같이 $${cols}$칸, 세로를 똑같이 $${rows}$칸으로 잘라 똑같은 직사각형 $${k}$개로`;
        return {
          q: `정사각형 모양의 종이를 그림과 같이 ${how} 나누었습니다. 나눈 직사각형 하나의 네 변의 길이의 합이 $${P}$ cm일 때, 처음 정사각형의 ${askPer ? '네 변의 길이의 합은' : '한 변의 길이는'} 몇 cm인가요?`,
          fig: s.toString(),
          answer: { type: 'num', value: askPer ? 4 * side : side, unit: 'cm' },
          steps: [
            L === Math.max(rows, cols)
              ? `정사각형의 한 변을 똑같이 $${L}$칸으로 생각하면, 직사각형 하나는 긴 변이 $${Math.max(w, h)}$칸, 짧은 변이 $${Math.min(w, h)}$칸이에요.`
              : `정사각형의 한 변을 $${cols}$${ro(cols)}도 $${rows}$${ro(rows)}도 똑같이 나눌 수 있게 $${L}$칸으로 생각하면, 직사각형 하나는 가로 $${w}$칸, 세로 $${h}$칸이에요.`,
            `직사각형의 네 변: $${w}+${h}+${w}+${h}=${per}$ (칸) → $${per}$칸이 $${P}$ cm`,
            `한 칸: $${P}\\div${per}=${t}$ (cm)`,
            `정사각형의 한 변: $${L}$칸 → ${L === 1 ? `$${t}$` : `$${Array(L).fill(t).join('+')}=${side}$`} (cm)`,
            ...(askPer ? [`정사각형의 네 변의 길이의 합: $${side}+${side}+${side}+${side}=${4 * side}$ (cm)`] : []),
          ],
          hint: '직사각형의 긴 변과 짧은 변이 정사각형 한 변의 얼마만큼인지 생각해 보세요.',
        };
      },
    },
    {
      id: 'stick-squares',
      title: '막대로 정사각형 이어 만들기 규칙',
      gen(r, level) {
        const twoRows = level === 3;
        const drawRow = (n: number, rows: number) => {
          const u = 28;
          const s = new Svg(n * u + 20, rows * u + 20);
          for (let y = 0; y <= rows; y++) for (let x = 0; x < n; x++) s.line(10 + x * u + 2, 10 + y * u, 10 + (x + 1) * u - 2, 10 + y * u, { cls: 'acc', width: 3 });
          for (let y = 0; y < rows; y++) for (let x = 0; x <= n; x++) s.line(10 + x * u, 10 + y * u + 2, 10 + x * u, 10 + (y + 1) * u - 2, { cls: 'acc', width: 3 });
          return s.toString();
        };
        const thing = r.pick(['성냥개비', '수수깡', '나무 막대']);
        if (!twoRows) {
          const n = r.int(level === 1 ? 4 : 5, level === 1 ? 7 : 9);
          const M = 3 * n + 1;
          if (level === 1)
            return {
              q: `${J(thing, '으로/로')} 그림과 같이 정사각형을 한 줄로 이어 붙여 만들고 있습니다. 정사각형 $${n}$개를 만들려면 ${J(thing, '이/가')} 모두 몇 개 필요한가요?`,
              fig: drawRow(3, 1),
              answer: { type: 'num', value: M, unit: '개' },
              steps: [
                `정사각형 $1$개: $4$개, $2$개: $7$개, $3$개: $10$개 → 하나 늘 때마다 $3$개씩 더 필요해요.`,
                `정사각형 $${n}$개: $4$개에 $3$개씩 $${n - 1}$번 더해요.`,
                `$4+3\\times${n - 1}=4+${3 * (n - 1)}=${M}$ (개)`,
              ],
              hint: '정사각형이 하나 늘어날 때 막대가 몇 개씩 늘어나는지 보세요.',
            };
          return {
            q: `${J(thing, '으로/로')} 그림과 같이 정사각형을 한 줄로 이어 붙여 만들고 있습니다. ${thing} $${M}$개를 모두 사용하면 정사각형을 몇 개 만들 수 있나요?`,
            fig: drawRow(3, 1),
            answer: { type: 'num', value: n, unit: '개' },
            steps: [
              `처음 정사각형 $1$개에 $4$개, 그다음부터는 정사각형 하나에 $3$개씩 필요해요.`,
              `처음 정사각형을 만들고 남은 ${thing}: $${M}-4=${M - 4}$ (개)`,
              `$${M - 4}\\div3=${n - 1}$ → 정사각형 $${n - 1}$개를 더 만들 수 있어요.`,
              `$1+${n - 1}=${n}$ (개)`,
            ],
            hint: '첫 번째 정사각형과 그다음 정사각형에 드는 막대 수가 달라요.',
          };
        }
        const n = r.int(4, 9);
        const M = 5 * n + 2;
        if (r.chance(0.5))
          return {
            q: `${J(thing, '으로/로')} 그림과 같이 정사각형을 위아래 두 줄로 이어 붙여 만들고 있습니다. 한 줄에 정사각형이 $${n}$개씩 모두 $${2 * n}$개가 되게 만들려면 ${J(thing, '이/가')} 모두 몇 개 필요한가요?`,
            fig: drawRow(3, 2),
            answer: { type: 'num', value: M, unit: '개' },
            steps: [
              `가로로 놓인 ${thing}: $3$줄에 $${n}$개씩 → $3\\times${n}=${3 * n}$ (개)`,
              `세로로 놓인 ${thing}: $2$줄에 $${n + 1}$개씩 → $2\\times${n + 1}=${2 * (n + 1)}$ (개)`,
              `모두: $${3 * n}+${2 * (n + 1)}=${M}$ (개)`,
              `(확인: 한 칸 늘 때마다 $5$개씩 늘어나요. $${3 * 1 + 2 * 2}$개, $${3 * 2 + 2 * 3}$개, $${3 * 3 + 2 * 4}$개, …)`,
            ],
            hint: '가로로 놓인 막대와 세로로 놓인 막대를 따로 세어 보세요.',
          };
        return {
          q: `${J(thing, '으로/로')} 그림과 같이 정사각형을 위아래 두 줄로 이어 붙여 만들고 있습니다. ${thing} $${M}$개를 모두 사용하면 크기가 같은 작은 정사각형을 모두 몇 개 만들 수 있나요?`,
          fig: drawRow(3, 2),
          answer: { type: 'num', value: 2 * n, unit: '개' },
          steps: [
            `처음 위아래 정사각형 $2$개에 $7$개, 그다음부터는 한 칸(위아래 $2$개)에 $5$개씩 필요해요.`,
            `$${M}-7=${M - 7}$, $${M - 7}\\div5=${n - 1}$ → $${n - 1}$칸을 더 만들 수 있어요.`,
            `한 줄에 $1+${n - 1}=${n}$개씩 두 줄`,
            `작은 정사각형: $${n}\\times2=${2 * n}$ (개)`,
          ],
          hint: '한 칸(위아래 두 개)이 늘 때 막대가 몇 개씩 늘어나는지 보세요.',
        };
      },
    },
  ],

  // ───────── e3a-3 나눗셈
  'e3a-3': [
    {
      id: 'div-cards',
      title: '수 카드로 나누어떨어지는 나눗셈식 만들기',
      gen(r, level) {
        if (level <= 2) {
          const [cs, k, okn] = until(
            () => {
              const cs = r.sample(DIG, level === 1 ? 3 : 4);
              const k = r.int(3, 9);
              const okn = perms(cs, 2)
                .map(num)
                .filter((n) => n % k === 0 && n / k <= 9)
                .sort((a, b) => a - b);
              return [cs, k, okn] as [number[], number, number[]];
            },
            ([, , okn]) => (level === 1 ? okn.length === 1 : okn.length >= 2 && okn.length <= 4),
          );
          const table = range(1, 9)
            .map((q) => k * q)
            .filter((x) => x >= 10);
          if (level === 1)
            return {
              q: `수 카드 $${boxes(cs)}$ 중에서 $2$장을 골라 두 자리 수를 만들었습니다. 이 수를 $${k}$${ro(k)} 나누었더니 나누어떨어지고 몫이 한 자리 수였습니다. 몫은 얼마인가요?`,
              answer: { type: 'num', value: okn[0] / k },
              steps: [
                `몫이 한 자리 수이므로 만든 수는 $${k}$단 곱셈구구의 곱이에요: ${list(table)}`,
                `이 중 카드로 만들 수 있는 수는 $${okn[0]}$뿐이에요.`,
                `$${okn[0]}\\div${k}=${okn[0] / k}$`,
              ],
              hint: `$${k}$단 곱셈구구를 떠올려 보세요.`,
            };
          return {
            q: `수 카드 $${boxes(cs)}$ 중에서 $2$장을 골라 두 자리 수를 만들려고 합니다. 만든 수를 $${k}$${ro(k)} 나누었을 때 나누어떨어지고 몫이 한 자리 수가 되는 수는 모두 몇 개인가요?`,
            answer: { type: 'num', value: okn.length, unit: '개' },
            steps: [`몫이 한 자리 수이므로 만든 수는 $${k}$단 곱셈구구의 곱이에요: ${list(table)}`, `이 중 카드로 만들 수 있는 수: ${list(okn)}`, `모두 $${okn.length}$개`],
            hint: `$${k}$단 곱셈구구의 곱 중 카드로 만들 수 있는 것을 찾아보세요.`,
          };
        }
        const [cs, eqs, ask] = until(
          () => {
            const cs = r.sample(DIG, 4);
            const eqs = perms(cs, 3)
              .map(([a, b, d]) => ({ n: 10 * a + b, d }))
              .filter((e) => e.d >= 2 && e.n % e.d === 0 && e.n / e.d <= 9);
            return [cs, eqs, r.pick(['count', 'max', 'min'])] as [number[], { n: number; d: number }[], string];
          },
          ([, eqs, ask]) => eqs.length >= 2 && eqs.length <= 6 && (ask === 'count' || new Set(eqs.map((e) => e.n / e.d)).size >= 2),
        );
        const qs = eqs.map((e) => e.n / e.d);
        const best = ask === 'max' ? Math.max(...qs) : Math.min(...qs);
        return {
          q: `수 카드 $${boxes(cs)}$ 중에서 $3$장을 골라 한 번씩 사용하여 (두 자리 수)$\\div$(한 자리 수)의 나눗셈식을 만들려고 합니다. 나누어떨어지고 몫이 한 자리 수인 나눗셈식 중에서 ${ask === 'count' ? '만들 수 있는 식은 모두 몇 개인가요?' : `몫이 가장 ${ask === 'max' ? '큰' : '작은'} 식의 몫은 얼마인가요?`}`,
          answer: ask === 'count' ? { type: 'num', value: eqs.length, unit: '개' } : { type: 'num', value: best },
          steps: [
            '나누는 수를 하나씩 정하고, 남은 카드로 만든 두 자리 수가 그 단 곱셈구구의 곱이 되는지 살펴봐요.',
            `몫이 한 자리 수이려면 (나누는 수)$\\times9$보다 크지 않아야 해요.`,
            `만들 수 있는 식: ${eqs.map((e) => `$${e.n}\\div${e.d}=${e.n / e.d}$`).join(', ')}`,
            ask === 'count' ? `모두 $${eqs.length}$개` : `몫이 가장 ${ask === 'max' ? '큰' : '작은'} 것: $${best}$`,
          ],
          hint: '나누는 수(한 자리 수)를 먼저 정해 보세요.',
        };
      },
    },
    {
      id: 'reverse-share',
      title: '거꾸로 생각하여 처음 수 구하기',
      gen(r, level) {
        if (level === 1) {
          const a = r.int(2, 9),
            each = r.int(2, 9),
            b = r.int(2, 9);
          const name = pickName(r);
          const it = r.pick([
            { w: '구슬', u: '개' },
            { w: '딱지', u: '장' },
            { w: '사탕', u: '개' },
          ]);
          return {
            q: `${J(it.w, '을/를')} $${a}$명이 똑같이 나누어 가졌습니다. 그중 ${nm(name)}는 자기가 받은 ${it.w}에 $${b}$${J(it.u, '을/를')} 더 받아서 $${each + b}$${J(it.u, '이/가')} 되었습니다. 처음에 나누어 가진 ${J(it.w, '은/는')} 모두 몇 ${it.u}인가요?`,
            answer: { type: 'num', value: a * each, unit: it.u },
            steps: [`${name}가 처음 받은 ${it.w}: $${each + b}-${b}=${each}$ (${it.u})`, `$${a}$명이 $${each}$${it.u}씩 나누어 가졌으므로 (처음 ${it.w}) $\\div${a}=${each}$`, `처음 ${it.w}: $${each}\\times${a}=${a * each}$ (${it.u})`],
            hint: '마지막 수에서 거꾸로 거슬러 올라가 보세요.',
          };
        }
        if (level === 2) {
          if (r.chance(0.5)) {
            const [a, qv, b] = until(
              () => [r.int(2, 9), r.int(2, 9), r.int(2, 9)],
              ([a, qv, b]) => a * qv <= 81 && qv * b <= 81 && a * qv >= 10,
            );
            const x = a * qv,
              cv = qv * b;
            return {
              q: `어떤 수를 $${a}$${ro(a)} 나눈 몫에 $${b}$${josa(b, '을/를')} 곱했더니 $${cv}$${josa(cv, '이/가')} 되었습니다. 어떤 수는 얼마인가요?`,
              answer: { type: 'num', value: x },
              steps: [`(어떤 수) $\\div${a}=\\square$ 라 하면 $\\square\\times${b}=${cv}$`, `$\\square=${cv}\\div${b}=${qv}$`, `어떤 수 $=${qv}\\times${a}=${x}$`],
              hint: '곱셈은 나눗셈으로, 나눗셈은 곱셈으로 거꾸로 바꾸어 보세요.',
            };
          }
          const [a, x, b] = until(
            () => [r.int(2, 9), r.int(2, 9), r.int(2, 9)],
            ([a, x, b]) => a !== b && (a * x) % b === 0 && (a * x) / b >= 2 && (a * x) / b <= 9,
          );
          const cv = (a * x) / b;
          return {
            q: `어떤 수에 $${a}$${josa(a, '을/를')} 곱한 다음 $${b}$${ro(b)} 나누었더니 $${cv}$${josa(cv, '이/가')} 되었습니다. 어떤 수는 얼마인가요?`,
            answer: { type: 'num', value: x },
            steps: [`(어떤 수) $\\times${a}=\\square$ 라 하면 $\\square\\div${b}=${cv}$`, `$\\square=${cv}\\times${b}=${a * x}$`, `어떤 수 $=${a * x}\\div${a}=${x}$`],
            hint: '마지막에 한 계산부터 거꾸로 되돌려 보세요.',
          };
        }
        const [a, b, cv] = until(
          () => [r.int(2, 9), r.int(2, 4), r.int(2, 4)],
          ([a, b, cv]) => b * cv <= 9 && a * b * cv <= 81 && a * b * cv >= 16,
        );
        const d = r.int(3, 15);
        const box = b * cv,
          tot = a * box + d;
        const it = r.pick([
          { w: '귤', u: '개', act: '먹고', box: '상자' },
          { w: '밤', u: '개', act: '구워 먹고', box: '봉지' },
          { w: '딸기', u: '개', act: '먹고', box: '그릇' },
        ]);
        return {
          q: `체험 학습에서 ${J(it.w, '을/를')} 땄습니다. 그중 $${d}$${J(it.u, '을/를')} ${it.act}, 남은 ${J(it.w, '을/를')} $${a}$${it.box}에 똑같이 나누어 담았습니다. 그중 한 ${it.box}에 담긴 ${J(it.w, '을/를')} $${b}$명이 똑같이 나누어 가졌더니 한 명이 $${cv}$${it.u}씩 가졌습니다. 처음에 딴 ${J(it.w, '은/는')} 몇 ${it.u}인가요?`,
          answer: { type: 'num', value: tot, unit: it.u },
          steps: [
            `한 ${it.box}에 담긴 ${it.w}: $${b}$명이 $${cv}$${it.u}씩 → $${cv}\\times${b}=${box}$ (${it.u})`,
            `남은 ${it.w}: $${a}$${it.box}에 $${box}$${it.u}씩 → $${box}\\times${a}=${a * box}$ (${it.u})`,
            `처음에 딴 ${it.w}: 남은 ${it.w}에 먹은 $${d}$${J(it.u, '을/를')} 더해요 → $${a * box}+${d}=${tot}$ (${it.u})`,
          ],
          hint: '마지막 상황에서 거꾸로 거슬러 올라가 보세요.',
        };
      },
    },
    {
      id: 'div-both',
      title: '나눗셈 조건을 모두 만족하는 수 찾기',
      gen(r, level) {
        type C = { t: string; f: (n: number) => boolean };
        const div = (k: number): C => ({ t: `$${k}$${ro(k)} 나누면 나누어떨어지고, 몫이 한 자리 수입니다.`, f: (n) => n % k === 0 && n / k <= 9 });
        const pool = (): C[] => {
          const lo = r.int(1, 6) * 10 + r.int(0, 5),
            hi = lo + r.int(12, 30);
          const odd = r.chance(0.5);
          const s = r.int(5, 13);
          return [
            { t: `$${lo}$보다 크고 $${hi}$보다 작습니다.`, f: (n) => n > lo && n < hi },
            { t: odd ? '홀수입니다.' : '짝수입니다.', f: (n) => n % 2 === (odd ? 1 : 0) },
            { t: `십의 자리 숫자와 일의 자리 숫자의 합은 $${s}$입니다.`, f: (n) => Math.floor(n / 10) + (n % 10) === s },
            { t: '십의 자리 숫자가 일의 자리 숫자보다 큽니다.', f: (n) => Math.floor(n / 10) > n % 10 },
            { t: '십의 자리 숫자가 일의 자리 숫자보다 작습니다.', f: (n) => Math.floor(n / 10) < n % 10 },
          ];
        };
        const U = range(10, 99);
        const shrinks = (cs: C[]) => {
          let prev = U.length;
          for (let i = 1; i <= cs.length; i++) {
            const now = U.filter((n) => cs.slice(0, i).every((c0) => c0.f(n))).length;
            if (now >= prev) return false;
            prev = now;
          }
          return true;
        };
        const count = level === 3 && r.chance(0.4);
        const [cs, ans] = until(
          () => {
            const P = pool();
            const k1 = r.int(3, 9);
            const k2 = until(
              () => r.int(2, 9),
              (k) => k !== k1 && k1 % k !== 0 && k % k1 !== 0,
            );
            let cs: C[];
            if (level === 1) cs = [div(k1), P[0]];
            else if (level === 2) cs = [div(k1), div(k2), r.pick(P)];
            else if (count) cs = [div(k1), ...r.sample(P, 2)];
            else cs = r.chance(0.5) ? [div(k1), div(k2), ...r.sample(P, 2)] : [div(k1), ...r.sample(P, 3)];
            const xs = U.filter((n) => cs.every((c0) => c0.f(n)));
            const a = count ? (xs.length >= 2 && xs.length <= 4 ? xs.length : -1) : xs.length === 1 ? xs[0] : -1;
            return [cs, a] as [C[], number];
          },
          ([cs, a]) => a > 0 && shrinks(cs),
          5000,
        );
        const stepsC: string[] = [];
        for (let i = 1; i <= cs.length; i++) {
          const xs = U.filter((n) => cs.slice(0, i).every((c0) => c0.f(n)));
          stepsC.push(`${ORD[i - 1]} 조건${i > 1 ? '까지' : ''} 만족: ${list(xs)}`);
        }
        return {
          q: `다음 조건을 모두 만족하는 두 자리 수${count ? '는 모두 몇 개인가요?' : '를 구하세요.'}\n${cs.map((c0) => '- ' + c0.t).join('\n')}`,
          answer: count ? { type: 'num', value: ans, unit: '개' } : { type: 'num', value: ans },
          steps: ['나누어떨어지고 몫이 한 자리 수인 수는 그 단 곱셈구구의 곱이에요.', ...stepsC, count ? `모두 $${ans}$개` : `답: $${ans}$`],
          hint: '곱셈구구의 곱을 먼저 늘어놓고, 조건을 하나씩 따져 보세요.',
        };
      },
    },
  ],

  // ───────── e3a-4 곱셈
  'e3a-4': [
    {
      id: 'mul-digit-range',
      title: '곱셈식의 □ 안에 들어갈 수 있는 숫자',
      gen(r, level) {
        type E = { tex: (d: string) => string; v: (d: number) => number; op: '<' | '>'; T: number; digs: number[] };
        const mk = (tensBox: boolean, big: boolean): E => {
          const b = r.int(big ? 4 : 2, 9);
          const fixed = r.int(tensBox ? 0 : 1, 9);
          const v = (d: number) => (tensBox ? 10 * d + fixed : 10 * fixed + d) * b;
          const digs = tensBox ? range(1, 9) : range(0, 9);
          const pivot = r.pick(digs.slice(1, -1));
          const op = r.chance(0.5) ? '<' : '>';
          const T = v(pivot) + (op === '<' ? r.int(1, b * 1) : -r.int(0, b - 1));
          return { tex: (d) => (tensBox ? `${d}${fixed}` : `${fixed}${d}`) + `\\times${b}${op}${T}`, v, op, T, digs };
        };
        const okOf = (e: E) => e.digs.filter((d) => (e.op === '<' ? e.v(d) < e.T : e.v(d) > e.T));
        if (level <= 2) {
          const e = until(
            () => mk(level === 2 ? r.chance(0.7) : r.chance(0.3), level === 2),
            (e) => {
              const n = okOf(e).length;
              return n >= 2 && n < e.digs.length - 1 && (level === 1 ? e.T <= 200 : e.T >= 150);
            },
          );
          const ok = okOf(e);
          const bad = e.digs.filter((d) => !ok.includes(d));
          const edgeOk = e.op === '<' ? Math.max(...ok) : Math.min(...ok);
          const edgeBad = e.op === '<' ? Math.min(...bad) : Math.max(...bad);
          const tx = (d: number) => e.tex(String(d)).replace(/[<>].*$/, '');
          return {
            q: `${e.digs[0] === 0 ? '$0$부터' : '$1$부터'} $9$까지의 숫자 중에서 □ 안에 들어갈 수 있는 숫자는 모두 몇 개인가요? $$${e.tex('\\square')}$$`,
            answer: { type: 'num', value: ok.length, unit: '개' },
            steps: [
              `□에 수를 넣어 곱이 $${e.T}$ 근처가 되는 곳을 찾아요.`,
              `□ $=${edgeOk}$: $${tx(edgeOk)}=${e.v(edgeOk)}$ (됨)`,
              `□ $=${edgeBad}$: $${tx(edgeBad)}=${e.v(edgeBad)}$ (안 됨)`,
              `□ 안에 들어갈 수 있는 숫자: ${list(ok)} → $${ok.length}$개`,
            ],
            hint: '□에 숫자 하나를 넣어 계산해 보고, 더 크게 할지 작게 할지 정해 보세요.',
          };
        }
        const [e1, e2, both] = until(
          () => {
            const e1 = mk(r.chance(0.5), true),
              e2 = mk(true, true);
            e2.digs = range(1, 9);
            if (e1.digs[0] === 0) e1.digs = range(1, 9);
            const both = okOf(e1).filter((d) => okOf(e2).includes(d));
            return [e1, e2, both] as [E, E, number[]];
          },
          ([e1, e2, both]) => both.length >= 1 && both.length <= 5 && okOf(e1).length > both.length && okOf(e2).length > both.length && e1.op !== e2.op && (e1.v(1) !== e2.v(1) || e1.v(2) !== e2.v(2)),
        );
        return {
          q: `$1$부터 $9$까지의 숫자 중에서 두 식의 □ 안에 공통으로 들어갈 수 있는 숫자는 모두 몇 개인가요? $$${e1.tex('\\square')}\\qquad ${e2.tex('\\square')}$$`,
          answer: { type: 'num', value: both.length, unit: '개' },
          steps: [
            `$${e1.tex('\\square')}$ 를 만족하는 숫자: ${list(okOf(e1))}`,
            `$${e2.tex('\\square')}$ 를 만족하는 숫자: ${list(okOf(e2))}`,
            `공통으로 들어갈 수 있는 숫자: ${list(both)} → $${both.length}$개`,
          ],
          hint: '두 식을 따로 따져 본 다음 겹치는 숫자를 찾아보세요.',
        };
      },
    },
    {
      id: 'gap-length',
      title: '간격 수로 전체 길이 구하기',
      gen(r, level) {
        const tree = r.pick([
          { w: '나무', u: '그루' },
          { w: '가로등', u: '개' },
          { w: '깃발', u: '개' },
        ]);
        if (level === 1) {
          const n = r.int(4, 9),
            d = r.int(12, 38);
          return {
            q: `길 한쪽에 처음부터 끝까지 ${J(tree.w, '을/를')} $${d}$ m 간격으로 $${n}$${tree.u} ${tree.w === '나무' ? '심었' : '세웠'}습니다. 이 길의 길이는 몇 m인가요? (${tree.w}의 두께는 생각하지 않아요.)`,
            answer: { type: 'num', value: (n - 1) * d, unit: 'm' },
            steps: [`처음부터 끝까지 ${J(tree.w, '을/를')} ${tree.w === '나무' ? '심으면' : '세우면'} 간격의 수는 ${tree.w} 수보다 $1$ 작아요: $${n}-1=${n - 1}$ (군데)`, `길이: $${d}\\times${n - 1}=${(n - 1) * d}$ (m)`],
            hint: '나무 3그루 사이에는 간격이 몇 군데 있는지 그려 보세요.',
          };
        }
        if (level === 2) {
          if (r.chance(0.5)) {
            const n = r.int(5, 9),
              d = r.int(12, 45);
            const place = r.pick(['원 모양의 호수', '원 모양의 연못', '둥근 꽃밭']);
            return {
              q: `${place} 둘레에 ${J(tree.w, '을/를')} $${d}$ m 간격으로 $${n}$${tree.u} ${tree.w === '나무' ? '심었' : '세웠'}습니다. ${place}의 둘레는 몇 m인가요? (${tree.w}의 두께는 생각하지 않아요.)`,
              answer: { type: 'num', value: n * d, unit: 'm' },
              steps: [`둘레를 따라 한 바퀴 돌아 처음 자리로 오므로 간격의 수는 ${tree.w} 수와 같아요: $${n}$군데`, `둘레: $${d}\\times${n}=${n * d}$ (m)`],
              hint: '닫힌 둘레에서는 간격의 수와 세운 것의 수가 같아요.',
            };
          }
          const n = r.int(4, 9),
            d = r.int(12, 40);
          return {
            q: `길 양쪽에 처음부터 끝까지 ${J(tree.w, '을/를')} $${d}$ m 간격으로 ${tree.w === '나무' ? '심었' : '세웠'}더니 모두 $${2 * n}$${tree.u}였습니다. 이 길의 길이는 몇 m인가요? (${tree.w}의 두께는 생각하지 않아요.)`,
            answer: { type: 'num', value: (n - 1) * d, unit: 'm' },
            steps: [`한쪽에 ${tree.w === '나무' ? '심은' : '세운'} ${tree.w}: $${2 * n}$의 반 → $${n}$${tree.u}`, `한쪽의 간격 수: $${n}-1=${n - 1}$ (군데)`, `길이: $${d}\\times${n - 1}=${(n - 1) * d}$ (m)`],
            hint: '먼저 한쪽에 몇 개를 세웠는지 구해 보세요.',
          };
        }
        if (r.chance(0.5)) {
          const n = r.int(4, 8),
            w = r.int(35, 60),
            d = r.int(15, 35);
          const obj = r.pick([
            { w: '의자', u: '개', place: '강당 앞쪽 벽을 따라' },
            { w: '화분', u: '개', place: '창가를 따라' },
            { w: '사물함', u: '개', place: '복도 벽을 따라' },
          ]);
          const tot = n * w + (n - 1) * d;
          return {
            q: `${obj.place} 폭이 $${w}$ cm인 ${J(obj.w, '을/를')} $${n}$${obj.u} 한 줄로 놓았습니다. ${J(obj.w, '와/과')} ${obj.w} 사이는 모두 $${d}$ cm씩 띄웠습니다. 첫 번째 ${obj.w}의 왼쪽 끝에서 마지막 ${obj.w}의 오른쪽 끝까지의 길이는 몇 cm인가요?`,
            answer: { type: 'num', value: tot, unit: 'cm' },
            steps: [`${obj.w} $${n}$${obj.u}의 폭: $${w}\\times${n}=${n * w}$ (cm)`, `${obj.w} 사이의 간격: $${n}-1=${n - 1}$ (군데) → $${d}\\times${n - 1}=${(n - 1) * d}$ (cm)`, `전체: $${n * w}+${(n - 1) * d}=${tot}$ (cm)`],
            hint: '물건의 폭과 사이 간격을 따로 구해 더해요.',
          };
        }
        const [a, d1, d2] = until(
          () => [r.int(4, 9), r.int(6, 12), r.int(4, 9)],
          ([a, d1, d2]) => d1 !== d2 && ((a - 1) * d1) % d2 === 0 && ((a - 1) * d1) / d2 <= 9 && ((a - 1) * d1) / d2 >= 2,
        );
        const L = (a - 1) * d1,
          m = L / d2;
        return {
          q: `곧은 길 한쪽에 처음부터 끝까지 나무를 $${d1}$ m 간격으로 심었더니 $${a}$그루가 필요했습니다. 같은 길의 다른 쪽에는 처음부터 끝까지 $${d2}$ m 간격으로 나무를 심으려고 합니다. 다른 쪽에 필요한 나무는 몇 그루인가요? (나무의 두께는 생각하지 않아요.)`,
          answer: { type: 'num', value: m + 1, unit: '그루' },
          steps: [`길의 길이: 간격 $${a}-1=${a - 1}$군데 → $${d1}\\times${a - 1}=${L}$ (m)`, `다른 쪽 간격 수: $${L}\\div${d2}=${m}$ (군데)`, `나무 수는 간격 수보다 $1$ 많아요: $${m}+1=${m + 1}$ (그루)`],
          hint: '먼저 길의 길이를 구해 보세요.',
        };
      },
    },
    {
      id: 'mul-error',
      title: '곱셈에서 잘못 계산한 곳 찾기',
      gen(r, level) {
        const pick = () =>
          until(
            () => [r.int(2, 9), r.int(1, 9), r.int(2, 9)],
            ([T, u, b]) => u * b >= 10 && T * b >= 10,
          );
        const errs = (T: number, u: number, b: number) => {
          const cr = Math.floor((u * b) / 10),
            o = (u * b) % 10;
          return [T * b * 10 + o, (T + cr) * b * 10 + o, Number(`${T * b}${u * b}`), T * b + u * b];
        };
        const DESC = [
          '일의 자리에서 올림한 수를 십의 자리 곱에 더하지 않았습니다.',
          '일의 자리에서 올림한 수를 십의 자리 숫자에 먼저 더한 다음 곱했습니다.',
          '십의 자리의 곱과 일의 자리의 곱을 그대로 이어 붙여 썼습니다.',
          '십의 자리의 곱을 자리에 맞추지 않고 일의 자리의 곱에 그냥 더했습니다.',
        ];
        if (level === 1) {
          const [T, u, b] = pick();
          const a = 10 * T + u,
            W = errs(T, u, b)[0];
          const name = pickName(r);
          const cr = Math.floor((u * b) / 10);
          return {
            q: `${nm(name)}는 $${a}\\times${b}$를 계산하면서 일의 자리에서 올림한 수를 더하지 않아 $${W}$${josa(W, '이/가') === '이' ? '이라고' : '라고'} 답했습니다. 바르게 계산한 값은 얼마인가요?`,
            answer: { type: 'num', value: a * b },
            steps: [`일의 자리: $${u}\\times${b}=${u * b}$ → $${u * b % 10}$을 쓰고 $${cr}$을 십의 자리로 올림`, `십의 자리: $${T}\\times${b}=${T * b}$, 올림한 $${cr}$을 더해 $${T * b + cr}$`, `바른 답: $${a * b}$ (잘못한 답보다 $${cr * 10}$ 커요.)`],
            hint: '일의 자리 곱에서 십의 자리로 올림한 수를 찾아보세요.',
          };
        }
        if (level === 2) {
          const [T, u, b, k] = until(
            () => [...pick(), r.int(0, 3)],
            ([T, u, b]) => {
              const e = errs(T, u, b);
              return new Set([...e, (10 * T + u) * b]).size === 5;
            },
          );
          const a = 10 * T + u,
            W = errs(T, u, b)[k];
          const name = pickName(r);
          return {
            q: `${nm(name)}는 $${a}\\times${b}$를 계산하여 $${W}$${josa(W, '이/가') === '이' ? '이라고' : '라고'} 답했습니다. 잘못 계산한 까닭으로 알맞은 것을 고르세요.`,
            answer: makeChoices(
              r,
              DESC[k],
              DESC.filter((_, i) => i !== k),
              4,
            ),
            steps: [`바른 계산: $${u}\\times${b}=${u * b}$, $${T}\\times${b}=${T * b}$ → $${T * b * 10}+${u * b}=${a * b}$`, `$${W}$${josa(W, '이/가')} 나오는 경우를 따져 보면 → ${DESC[k]}`],
            hint: '각각의 실수대로 직접 계산해 보고 같은 답이 나오는 것을 찾아보세요.',
          };
        }
        const [T, u, b] = until(pick, ([T, u, b]) => {
          const W = errs(T, u, b)[0];
          // W 로부터 (십의 자리, 일의 자리)가 하나로 정해져야 함
          let n = 0;
          for (let t2 = 1; t2 <= 9; t2++) for (let u2 = 0; u2 <= 9; u2++) if (u2 * b >= 10 && errs(t2, u2, b)[0] === W) n++;
          return n === 1;
        });
        const W = errs(T, u, b)[0];
        const a = 10 * T + u;
        const cr = Math.floor((u * b) / 10);
        const cands = range(0, 9).filter((x) => (x * b) % 10 === W % 10);
        const askDiff = r.chance(0.35);
        return {
          q: `어떤 두 자리 수에 $${b}$${josa(b, '을/를')} 곱해야 하는데, 일의 자리에서 올림한 수를 십의 자리 곱에 더하지 않고 계산하여 $${W}$${josa(W, '이/가')} 나왔습니다. ${askDiff ? '바르게 계산한 값은 잘못 계산한 값보다 얼마나 더 큰가요?' : '바르게 계산한 값은 얼마인가요?'}`,
          answer: { type: 'num', value: askDiff ? a * b - W : a * b },
          steps: [
            `잘못 계산한 값의 일의 자리 $${W % 10}$은 (일의 자리 숫자)$\\times${b}$의 일의 자리예요.`,
            `앞부분 $${Math.floor(W / 10)}$${josa(Math.floor(W / 10), '은/는')} (십의 자리 숫자)$\\times${b}$ → 십의 자리 숫자 $=${Math.floor(W / 10)}\\div${b}=${T}$`,
            `일의 자리 숫자 후보: ${list(cands)} 중 올림이 생기는 것은 $${u}$뿐이에요. ($${u}\\times${b}=${u * b}$)`,
            `어떤 수 $=${a}$, 바른 계산: $${a}\\times${b}=${a * b}$`,
            ...(askDiff ? [`$${a * b}-${W}=${a * b - W}$ (올림한 $${cr}$이 십의 자리에서 빠졌기 때문)`] : []),
          ],
          hint: '잘못 계산한 값의 일의 자리와 앞부분을 따로 생각해 보세요.',
        };
      },
    },
  ],

  // ───────── e3a-5 길이와 시간
  'e3a-5': [
    {
      id: 'class-schedule',
      title: '수업과 쉬는 시간으로 시각 구하기',
      gen(r, level) {
        const ctx = r.pick([
          { les: 40, brk: 10, act: '수업', place: '학교', school: true },
          { les: 40, brk: 10, act: '수업', place: '학교', school: true },
          { les: 45, brk: 15, act: '강좌', place: '방과 후 교실', school: false },
          { les: 35, brk: 5, act: '활동', place: '체험 학습장', school: false },
        ]);
        const label = (n: number) => (ctx.school ? `$${n}$교시` : `${ORD[n - 1]} ${ctx.act}`);
        const subj = (n: number) => label(n) + josa(ctx.school ? '교시' : ctx.act, '이/가');
        // 학교 1교시는 오전 8시 30분 ~ 9시 사이에 시작 (현실적인 시각)
        const start = ctx.school ? r.pick([510, 520, 530, 540]) : r.int(8, 9) * 60 + r.pick([0, 10, 20, 30, 40, 50]);
        const lesText = `${ctx.act} 시간은 $${ctx.les}$분씩, 쉬는 시간은 $${ctx.brk}$분씩`;
        const dur = (n: number) => n * ctx.les + (n - 1) * ctx.brk;
        const hmT = (m: number) => (m >= 60 ? `$${Math.floor(m / 60)}$시간${m % 60 ? ` $${m % 60}$분` : ''}` : `$${m}$분`);
        if (level <= 2) {
          const n = level === 1 ? 2 : r.int(3, 5);
          const end = start + dur(n);
          return {
            q: `${ctx.place}에서 ${subj(1)} ${tt(start)}에 시작합니다. ${lesText}일 때, ${subj(n)} 끝나는 시각은 ${ampm(end)} 몇 시 몇 분인가요?`,
            answer: hmFields(end),
            steps: [
              `${subj(n)} 끝날 때까지 ${ctx.act} $${n}$번, 쉬는 시간 $${n - 1}$번이 있어요.`,
              `걸리는 시간: $${Array(n).fill(ctx.les).join('+')}+${Array(n - 1).fill(ctx.brk).join('+')}=${dur(n)}$ (분) $=$ ${hmT(dur(n))}`,
              `${tt(start)}에서 ${hmT(dur(n))} 후 → ${tt(end)}`,
            ],
            hint: '쉬는 시간은 수업 수보다 하나 적어요.',
          };
        }
        if (r.chance(0.5)) {
          const lunch = r.pick([40, 50, 60]);
          const st = r.pick([510, 520, 530, 540]);
          const e4 = st + 190;
          const s5 = e4 + lunch;
          const ask6 = r.chance(0.5);
          const ans = ask6 ? s5 + 90 : s5;
          return {
            q: `어느 학교는 $1$교시가 ${tt(st)}에 시작합니다. 수업 시간은 $40$분씩, 쉬는 시간은 $10$분씩이고, $4$교시가 끝나면 점심시간이 $${lunch}$분 있습니다. ${ask6 ? '$6$교시가 끝나는' : '$5$교시가 시작하는'} 시각은 ${ampm(ans)} 몇 시 몇 분인가요?`,
            answer: hmFields(ans),
            steps: [
              `$1$교시부터 $4$교시까지: 수업 $4$번, 쉬는 시간 $3$번 → $160+30=190$ (분) $=3$시간 $10$분`,
              `$4$교시가 끝나는 시각: ${tt(e4)}`,
              `점심시간 $${lunch}$분 후 $5$교시 시작: ${tt(s5)}`,
              ...(ask6 ? [`$5$교시 $40$분, 쉬는 시간 $10$분, $6$교시 $40$분 → $90$분 $=1$시간 $30$분 후: ${tt(ans)}`] : []),
            ],
            hint: '4교시가 끝나는 시각부터 먼저 구해 보세요.',
          };
        }
        const n = r.int(3, 5);
        const end = start + dur(n);
        return {
          q: `${ctx.place}에서 ${lesText} 이어서 진행합니다. ${subj(n)} 끝난 시각이 ${tt(end)}${end % 60 ? '이었' : '였'}다면, ${subj(1)} 시작한 시각은 ${ampm(start)} 몇 시 몇 분인가요?`,
          answer: hmFields(start),
          steps: [
            `${label(1)}부터 ${label(n)}까지 ${ctx.act} $${n}$번, 쉬는 시간 $${n - 1}$번`,
            `걸린 시간: $${ctx.les}\\times${n}+${ctx.brk}\\times${n - 1}=${n * ctx.les}+${(n - 1) * ctx.brk}=${dur(n)}$ (분) $=$ ${hmT(dur(n))}`,
            `거꾸로: ${tt(end)} $-$ ${hmT(dur(n))} $=$ ${tt(start)}`,
          ],
          hint: '끝난 시각에서 걸린 시간을 빼면 시작한 시각이에요.',
        };
      },
    },
    {
      id: 'track-laps',
      title: '트랙을 여러 바퀴 돈 거리',
      gen(r, level) {
        const name = pickName(r);
        if (level === 1) {
          const [lap, k] = until(
            () => [r.pick([250, 300, 350, 400, 450, 500]), r.int(3, 4)],
            ([lap, k]) => lap * k > 1000 && (lap * k) % 1000 !== 0,
          );
          const tot = lap * k;
          return {
            q: `한 바퀴가 $${lap}$ m인 운동장 트랙을 ${nm(name)}가 $${k}$바퀴 달렸습니다. ${nm(name)}가 달린 거리는 몇 km 몇 m인가요?`,
            answer: kmFields(tot),
            steps: [`$${Array(k).fill(lap).join('+')}=${tot}$ (m)`, `$1000$ m $=1$ km 이므로 $${tot}$ m $=$ ${kmm(tot)}`],
            hint: '1000 m는 1 km예요.',
          };
        }
        if (level === 2) {
          if (r.chance(0.5)) {
            const [p, k] = until(
              () => [r.int(2, 5), r.int(4, 9)],
              ([p, k]) => p * k >= 11 && (p * k) % 10 !== 0,
            );
            const lap = 100 * p,
              D = lap * k;
            return {
              q: `${nm(name)}는 한 바퀴가 $${lap}$ m인 공원 산책길을 걸어서 모두 ${kmm(D)}를 걸으려고 합니다. 산책길을 몇 바퀴 걸어야 하나요?`,
              answer: { type: 'num', value: k, unit: '바퀴' },
              steps: [`${kmm(D)} $=${D}$ m → $100$ m가 $${D / 100}$개`, `한 바퀴 $${lap}$ m → $100$ m가 $${p}$개`, `$${D / 100}\\div${p}=${k}$ → $${k}$바퀴`],
              hint: '100 m가 몇 개인지로 생각해 보세요.',
            };
          }
          const [n1, n2] = pick2Names(r);
          const [lap, k, D] = until(
            () => [r.pick([200, 250, 300, 400]), r.int(3, 6), r.int(11, 29) * 100 + r.pick([0, 50])],
            ([lap, k, D]) => Math.abs(lap * k - D) >= 50 && D % 1000 !== 0,
          );
          const A = lap * k;
          const more = A > D ? n1 : n2;
          return {
            q: `${nm(n1)}는 한 바퀴가 $${lap}$ m인 트랙을 $${k}$바퀴 달렸고, ${nm(n2)}는 ${kmm(D)}를 달렸습니다. 누가 몇 m 더 많이 달렸는지 구하려고 합니다. 두 사람이 달린 거리의 차는 몇 m인가요?`,
            answer: { type: 'num', value: Math.abs(A - D), unit: 'm' },
            steps: [`${n1}: $${Array(k).fill(lap).join('+')}=${A}$ (m)`, `${n2}: ${kmm(D)} $=${D}$ m`, `${more}가 $${Math.max(A, D)}-${Math.min(A, D)}=${Math.abs(A - D)}$ (m) 더 많이 달렸어요.`],
            hint: '두 거리를 같은 단위(m)로 바꾸어 비교해요.',
          };
        }
        const lap = r.pick([200, 300, 400, 500]),
          k = r.int(2, 4);
        const one = r.int(1, 2) * 1000 + r.int(1, 9) * 100 + r.int(0, 9) * 10;
        if (r.chance(0.5)) {
          const tot = 2 * one + lap * k;
          return {
            q: `${nm(name)}는 집에서 ${kmm(one)} 떨어진 공원까지 걸어가서, 한 바퀴가 $${lap}$ m인 공원 트랙을 $${k}$바퀴 달린 다음 같은 길로 집에 돌아왔습니다. ${nm(name)}가 움직인 거리는 모두 몇 km 몇 m인가요?`,
            answer: kmFields(tot),
            steps: [`집과 공원 사이 가고 오기: ${kmm(one)} $+$ ${kmm(one)} $=$ ${kmm(2 * one)}`, `트랙: $${Array(k).fill(lap).join('+')}=${lap * k}$ (m)`, `모두: ${kmm(2 * one)} $+$ $${lap * k}$ m $=$ ${kmm(tot)}`],
            hint: '갔다가 같은 길로 돌아왔으니 집과 공원 사이를 두 번 걸었어요.',
          };
        }
        const goal = r.int(6, 8) * 1000;
        const done = one + lap * k;
        return {
          q: `${nm(name)}는 오늘 모두 $${goal / 1000}$ km를 걷기로 했습니다. 아침에 ${kmm(one)}를 걷고, 저녁에 한 바퀴가 $${lap}$ m인 산책길을 $${k}$바퀴 걸었습니다. 목표만큼 걸으려면 몇 km 몇 m를 더 걸어야 하나요?`,
          answer: kmFields(goal - done),
          steps: [`저녁에 걸은 거리: $${Array(k).fill(lap).join('+')}=${lap * k}$ (m)`, `오늘 걸은 거리: ${kmm(one)} $+$ $${lap * k}$ m $=$ ${kmm(done)}`, `더 걸어야 할 거리: $${goal / 1000}$ km $-$ ${kmm(done)} $=$ ${kmm(goal - done)}`],
          hint: '지금까지 걸은 거리를 먼저 구해요.',
        };
      },
    },
    {
      id: 'record-relations',
      title: '기록의 관계로 시간 구하기',
      gen(r, level) {
        const ev = r.pick(['오래달리기', '수영 $100$ m', '줄넘기 $500$번 하기', '학교 한 바퀴 걷기']);
        const delta = (lv: number) => (lv === 1 ? r.int(15, 55) : lv === 2 ? r.int(12, 95) : r.int(20, 125));
        const rel = (a: string, b: string, d: number) => (d > 0 ? `${nm(a)}는 ${b}보다 ${ms(d)} 더 걸렸습니다.` : `${nm(a)}는 ${b}보다 ${ms(-d)} 덜 걸렸습니다.`);
        const base = r.int(3, 6) * 60 + r.int(5, 50);
        if (level === 1) {
          const [n1, n2] = pick2Names(r);
          const d = delta(1) * (r.chance(0.5) ? 1 : -1);
          const v = base + d;
          return {
            q: `${ev} 기록을 재었습니다. ${nm(n1)}의 기록은 ${ms(base)}입니다. ${rel(n2, n1, d)} ${nm(n2)}의 기록은 몇 분 몇 초인가요?`,
            answer: msFields(v),
            steps: [d > 0 ? `${ms(base)} $+$ ${ms(d)}` : `${ms(base)} $-$ ${ms(-d)}`, d > 0 ? '초끼리 더해 $60$초가 넘으면 $1$분으로 올려요.' : '초끼리 뺄 수 없으면 $1$분을 $60$초로 바꾸어 빼요.', `답: ${ms(v)}`],
            hint: '더 걸렸다면 더하고, 덜 걸렸다면 빼요.',
          };
        }
        const ns = r.sample(NAMES, 4);
        const [vals, ds] = until(
          () => {
            const ds = [0, 1, 2].map(() => delta(level) * (r.chance(0.5) ? 1 : -1));
            const vals = [base];
            for (const d of ds) vals.push(vals[vals.length - 1] + d);
            return [vals, ds] as [number[], number[]];
          },
          ([vals]) => new Set(vals).size === 4 && Math.min(...vals) > 90 && (level === 2 || Math.max(...vals) - Math.min(...vals) >= 60),
        );
        const lines = ds.map((d, i) => rel(ns[i + 1], ns[i], d));
        const stepsV = ds.map((d, i) => `${ns[i + 1]}: ${ms(vals[i])} ${d > 0 ? '$+$' : '$-$'} ${ms(Math.abs(d))} $=$ ${ms(vals[i + 1])}`);
        const iMin = vals.indexOf(Math.min(...vals)),
          iMax = vals.indexOf(Math.max(...vals));
        if (level === 2) {
          const fast = r.chance(0.5);
          const k = fast ? iMin : iMax;
          return {
            q: `네 사람이 ${ev} 기록을 재었습니다. ${nm(ns[0])}의 기록은 ${ms(base)}입니다.\n${lines.map((l) => '- ' + l).join('\n')}\n기록이 가장 ${fast ? '빠른' : '느린'} 사람은 누구인가요?`,
            answer: makeChoices(r, ns[k], ns.filter((_, i) => i !== k), 4),
            steps: [...stepsV, `걸린 시간이 ${fast ? '짧을수록 빠른' : '길수록 느린'} 기록이에요 → ${ns[k]} (${ms(vals[k])})`],
            hint: '한 사람씩 차례로 기록을 구해 보세요.',
          };
        }
        const diff = vals[iMax] - vals[iMin];
        return {
          q: `네 사람이 ${ev} 기록을 재었습니다. ${nm(ns[0])}의 기록은 ${ms(base)}입니다.\n${lines.map((l) => '- ' + l).join('\n')}\n기록이 가장 빠른 사람과 가장 느린 사람의 기록의 차는 몇 분 몇 초인가요?`,
          answer: msFields(diff),
          steps: [...stepsV, `가장 빠른 사람: ${ns[iMin]} (${ms(vals[iMin])}), 가장 느린 사람: ${ns[iMax]} (${ms(vals[iMax])})`, `${ms(vals[iMax])} $-$ ${ms(vals[iMin])} $=$ ${ms(diff)}`],
          hint: '한 사람씩 차례로 기록을 구한 뒤 비교해요.',
        };
      },
    },
  ],

  // ───────── e3a-6 분수와 소수
  'e3a-6': [
    {
      id: 'frac-reason',
      title: '분수와 소수의 까닭 알기',
      gen(r, level) {
        const [n1, n2] = pick2Names(r);
        if (level === 1) {
          const [a, b] = r.sample(range(2, 9), 2).sort((x, y) => x - y);
          const food = r.pick(['피자', '케이크', '떡', '부침개']);
          const right = `${n1}, 똑같이 나눈 조각 수가 적을수록 한 조각의 크기가 크기 때문입니다.`;
          return {
            q: `크기가 같은 ${food} 두 개 중 하나는 똑같이 $${a}$조각으로, 다른 하나는 똑같이 $${b}$조각으로 나누었습니다. ${nm(n1)}는 $${a}$조각으로 나눈 ${food} 한 조각을, ${nm(n2)}는 $${b}$조각으로 나눈 ${food} 한 조각을 먹었습니다. 더 많이 먹은 사람과 그 까닭으로 알맞은 것은?`,
            answer: makeChoices(
              r,
              right,
              [
                `${n2}, 똑같이 나눈 조각 수가 많을수록 한 조각의 크기가 크기 때문입니다.`,
                `${n2}, $${b}$${josa(b, '이/가')} $${a}$보다 크므로 $${fr(1, b)}$${josa(1, '이/가')} $${fr(1, a)}$보다 크기 때문입니다.`,
                `두 사람이 먹은 양은 같습니다. 두 사람 모두 한 조각씩 먹었기 때문입니다.`,
              ],
              4,
            ),
            steps: [`${n1}: 전체의 $${fr(1, a)}$, ${n2}: 전체의 $${fr(1, b)}$`, '전체의 크기가 같을 때, 똑같이 나눈 수가 많을수록 한 조각은 작아져요.', `$${fr(1, a)}>${fr(1, b)}$ → ${nm(n1)}가 더 많이 먹었어요.`],
            hint: '같은 피자를 많이 나눌수록 한 조각은 어떻게 될까요?',
          };
        }
        if (level === 2) {
          type St = { t: string; ok: boolean };
          const gens: (() => St)[] = [
            () => {
              const n = r.int(4, 9),
                m = r.int(2, n - 1);
              return r.chance(0.5) ? { t: `$${fr(m, n)}$${josa(m, '은/는')} $${fr(1, n)}$${josa(1, '이/가')} $${m}$개입니다.`, ok: true } : { t: `$${fr(m, n)}$${josa(m, '은/는')} $${fr(1, m)}$${josa(1, '이/가')} $${n}$개입니다.`, ok: false };
            },
            () => {
              const x = r.int(1, 9),
                y = r.int(1, 9);
              return r.chance(0.5) ? { t: `$${x}.${y}$${josa(y, '은/는')} $0.1$이 $${10 * x + y}$개인 수입니다.`, ok: true } : { t: `$${x}.${y}$${josa(y, '은/는')} $0.1$이 $${x + y}$개인 수입니다.`, ok: false };
            },
            () => {
              const [a, b] = r.sample(range(2, 9), 2);
              return { t: `$${fr(1, a)}$${josa(1, '은/는')} $${fr(1, b)}$보다 큽니다.`, ok: a < b };
            },
            () => {
              const n = r.int(5, 9);
              const [p, q2] = r.sample(range(1, n - 1), 2);
              return { t: `$${fr(p, n)}$${josa(p, '은/는')} $${fr(q2, n)}$보다 큽니다.`, ok: p > q2 };
            },
            () => {
              const k = r.int(1, 9),
                a = r.int(1, 9);
              return r.chance(0.5) ? { t: `$${a}$ cm $${k}$ mm는 $${a}.${k}$ cm입니다.`, ok: true } : { t: `$${a}$ cm $${k}$ mm는 $${a}.${k}$ mm입니다.`, ok: false };
            },
            () => {
              const n = r.int(2, 9);
              return r.chance(0.5) ? { t: `$${fr(n, n)}$${josa(n, '은/는')} $1$과 같습니다.`, ok: true } : { t: `$${fr(1, n)}$${josa(1, '이/가')} $${n + 1}$개이면 $1$입니다.`, ok: false };
            },
          ];
          const wantFalse = r.chance(0.6);
          const sts = until(
            () => r.sample(gens, 4).map((g) => g()),
            (s) => s.filter((x) => x.ok === !wantFalse).length === 1,
          );
          const good = sts.find((x) => x.ok === !wantFalse) ?? sts[0];
          const others = sts.filter((x) => x !== good);
          return {
            q: `${wantFalse ? '옳지 **않은** 것' : '옳은 것'}을 고르세요.`,
            answer: makeChoices(
              r,
              good.t,
              others.map((x) => x.t),
              4,
            ),
            steps: [...sts.map((x) => `${x.t} → ${x.ok ? '옳아요' : '틀려요'}`), `답: ${good.t}`],
            hint: '하나씩 따져 보고 옳은지 틀린지 표시해 보세요.',
          };
        }
        // 3단계: 잘못 말한 까닭 고르기
        const kind = r.int(0, 3);
        if (kind === 0) {
          const [a, b] = r.sample(range(2, 6), 2).sort((x, y) => x - y);
          return {
            q: `${nm(n1)}는 작은 피자 한 판의 $${fr(1, a)}$을, ${nm(n2)}는 큰 피자 한 판의 $${fr(1, b)}$을 먹었습니다. ${nm(n1)}가 "$${fr(1, a)}$${josa(1, '이/가')} $${fr(1, b)}$보다 크니까 내가 더 많이 먹었어."라고 말했습니다. ${nm(n1)}의 말이 옳지 않은 까닭으로 알맞은 것은?`,
            answer: makeChoices(
              r,
              '두 피자의 크기(전체)가 달라서 분수만으로는 누가 더 많이 먹었는지 알 수 없기 때문입니다.',
              [`단위분수는 분모가 클수록 크므로 $${fr(1, b)}$${josa(1, '이/가')} 더 크기 때문입니다.`, '두 사람 모두 한 조각씩 먹었으므로 먹은 양이 같기 때문입니다.', '큰 피자를 먹었으므로 언제나 더 많이 먹은 것이기 때문입니다.'],
              4,
            ),
            steps: ['분수로 크기를 비교하려면 전체의 크기가 같아야 해요.', '작은 피자의 $' + fr(1, a) + '$와 큰 피자의 $' + fr(1, b) + '$는 전체가 달라서 분수만으로 비교할 수 없어요.'],
            hint: '두 분수가 나타내는 전체가 같은지 살펴보세요.',
          };
        }
        if (kind === 1) {
          const k = r.int(3, 6);
          return {
            q: `${nm(n1)}는 색종이 한 장을 크기가 서로 다른 $${k}$조각으로 자른 다음 그중 한 조각을 보고 "이 조각은 색종이 전체의 $${fr(1, k)}$이야."라고 말했습니다. 이 말이 옳지 않은 까닭으로 알맞은 것은?`,
            answer: makeChoices(
              r,
              `색종이를 똑같이 $${k}$조각으로 나누지 않았기 때문입니다.`,
              ['색종이처럼 얇은 물건은 분수로 나타낼 수 없기 때문입니다.', `조각이 $${k}$개이면 $${fr(1, k + 1)}$이라고 해야 하기 때문입니다.`, '가장 큰 조각만 분수로 나타낼 수 있기 때문입니다.'],
              4,
            ),
            steps: [`분수 $${fr(1, k)}$${josa(1, '은/는')} 전체를 **똑같이** $${k}$로 나눈 것 중의 하나예요.`, '조각의 크기가 서로 다르면 분수로 나타낼 수 없어요.'],
            hint: '분수로 나타내려면 어떻게 나누어야 할까요?',
          };
        }
        if (kind === 2) {
          const x = r.int(1, 9),
            y = r.pick(range(1, 9).filter((d) => d !== x)); // x = y 이면 '자리를 바꾼 수' 보기가 정답과 같아짐
          const k = 10 * x + y;
          return {
            q: `${nm(n1)}는 "$0.1$이 $${k}$개인 수는 $0.${k}$이야."라고 말했습니다. 이 말이 옳지 않은 까닭으로 알맞은 것은?`,
            answer: makeChoices(
              r,
              `$0.1$이 $10$개이면 $1$이므로, $0.1$이 $${k}$개인 수는 $${x}.${y}$이기 때문입니다.`,
              [`$0.1$이 $${k}$개인 수는 $${k}$이기 때문입니다.`, `$0.1$이 $${k}$개인 수는 $${y}.${x}$이기 때문입니다.`, '$0.1$은 $10$개보다 많이 모을 수 없기 때문입니다.'],
              4,
            ),
            steps: [`$0.1$이 $10$개 → $1$`, `$0.1$이 $${k}$개 → $1$이 $${x}$개, $0.1$이 $${y}$개 → $${x}.${y}$`],
            hint: '0.1이 10개이면 얼마인지 떠올려 보세요.',
          };
        }
        const [a, b] = r.sample(range(2, 9), 2).sort((x, y) => x - y);
        return {
          q: `${nm(n1)}는 "$${b}$${josa(b, '이/가')} $${a}$보다 크니까 $${fr(1, b)}$${josa(1, '이/가')} $${fr(1, a)}$보다 커."라고 말했습니다. 이 말이 옳지 않은 까닭으로 알맞은 것은?`,
          answer: makeChoices(
            r,
            '단위분수는 분모가 클수록 전체를 더 많이 나눈 것이라 한 조각이 작아지기 때문입니다.',
            ['분자가 모두 $1$이라서 두 분수의 크기는 같기 때문입니다.', `$${fr(1, a)}$${josa(1, '와/과')} $${fr(1, b)}$${josa(1, '은/는')} 분모가 달라서 크기를 비교할 수 없기 때문입니다.`, `$${fr(1, b)}$${josa(1, '은/는')} $1$보다 크기 때문입니다.`],
            4,
          ),
          steps: [`$${fr(1, a)}$: 전체를 $${a}$로 나눈 것 중 하나, $${fr(1, b)}$: 전체를 $${b}$로 나눈 것 중 하나`, `더 많이 나눌수록 한 조각이 작으므로 $${fr(1, a)}>${fr(1, b)}$`],
          hint: '같은 끈을 2도막, 5도막으로 자르면 어느 쪽 한 도막이 길까요?',
        };
      },
    },
    {
      id: 'dec-line',
      title: '수직선의 눈금 크기로 소수 구하기',
      gen(r, level) {
        // 끝 두 수(0.1이 p개, q개), 칸 수 m, ㉠ 위치 i
        const [p, q2, m, i] = until(
          () => {
            if (level === 1) {
              const a = r.int(0, 8);
              return [10 * a, 10 * a + 10, 10, r.int(1, 9)];
            }
            if (level === 2) {
              const a = r.int(0, 8);
              return r.chance(0.6) ? [10 * a, 10 * a + 10, 5, r.int(1, 4)] : [10 * a, 10 * a + 20, 10, r.int(1, 9)];
            }
            const s = r.int(2, 4),
              mm = r.int(3, 6);
            const p0 = r.int(5, 60);
            return [p0, p0 + s * mm, mm, r.int(1, mm - 1)];
          },
          ([p, q2, m, i]) => (q2 - p) % m === 0 && (p + ((q2 - p) / m) * i) % 10 !== 0 && (level < 3 || (p % 10 !== 0 && q2 % 10 !== 0)),
        );
        const s = (q2 - p) / m;
        const v = p + s * i;
        const D = (t: number) => (t % 10 ? `${Math.floor(t / 10)}.${t % 10}` : String(t / 10));
        const W = 300,
          x0 = 24,
          x1 = W - 24;
        const fig = new Svg(W, 70);
        const X = (k: number) => x0 + ((x1 - x0) * k) / m;
        fig.line(8, 40, W - 8, 40, { arrow: true });
        for (let k = 0; k <= m; k++) fig.line(X(k), k === 0 || k === m ? 32 : 35, X(k), k === 0 || k === m ? 48 : 45);
        fig.text(X(0), 62, D(p), { size: 12 });
        fig.text(X(m), 62, D(q2), { size: 12 });
        fig.text(X(i), 18, '㉠', { size: 13, cls: 'acc' });
        fig.line(X(i), 22, X(i), 34, { cls: 'acc', arrow: true });
        return {
          q: `수직선에서 ㉠이 나타내는 수를 소수로 나타내세요.`,
          fig: fig.toString(),
          answer: { type: 'num', value: round(v / 10), display: 'dec' },
          steps: [
            `$${D(p)}$에서 $${D(q2)}$까지는 $0.1$이 $${q2 - p}$개예요.`,
            `이것을 똑같이 $${m}$칸으로 나누었으므로 한 칸은 $0.1$이 $${q2 - p}\\div${m}=${s}$개 ${s === 1 ? '($0.1$)' : `($0.${s}$)`}`,
            `㉠은 $${D(p)}$에서 $${i}$칸 → $0.1$이 $${p}+${s}\\times${i}=${v}$개`,
            `답: $${D(v)}$`,
          ],
          hint: '작은 눈금 한 칸이 0.1이 몇 개인지 먼저 구해 보세요.',
        };
      },
    },
    {
      id: 'frac-nested',
      title: '여러 번 나눈 도형에서 분수 구하기',
      gen(r, level) {
        type Rc = [number, number, number, number]; // x, y, w, h (4×4 칸)
        const [pieces, shaded] = until(
          () => {
            let pcs: Rc[] = [[0, 0, 4, 4]];
            const nSplit = level === 1 ? r.int(2, 3) : level === 2 ? r.int(3, 4) : r.int(4, 6);
            for (let t = 0; t < nSplit; t++) {
              const can = pcs.filter(([, , w, h]) => w * h >= 2);
              const pc = r.pick(can);
              const [x, y, w, h] = pc;
              const vert = w > h ? true : h > w ? false : r.chance(0.5);
              pcs = pcs.filter((q) => q !== pc);
              if (vert) pcs.push([x, y, w / 2, h], [x + w / 2, y, w / 2, h]);
              else pcs.push([x, y, w, h / 2], [x, y + h / 2, w, h / 2]);
            }
            const k = level === 1 ? 1 : level === 2 ? 2 : 3;
            const sh = r.sample(pcs, k);
            return [pcs, sh] as [Rc[], Rc[]];
          },
          ([pcs, sh]) => {
            const minA = Math.min(...pcs.map(([, , w, h]) => w * h));
            const tot = sum(sh.map(([, , w, h]) => w * h)) / minA,
              den = 16 / minA;
            if (gcd(tot, den) !== 1) return false;
            if (level === 1) return sh[0][2] * sh[0][3] === minA && den >= 4;
            if (new Set(sh.map(([, , w, h]) => w * h)).size < 2) return false;
            return level === 2 || den === 16;
          },
        );
        const minA = Math.min(...pieces.map(([, , w, h]) => w * h));
        const den = 16 / minA;
        const tot = sum(shaded.map(([, , w, h]) => w * h)) / minA;
        const u = 34;
        const s = new Svg(4 * u + 20, 4 * u + 20);
        for (const pc of pieces) {
          const [x, y, w, h] = pc;
          if (shaded.includes(pc)) s.rect(10 + x * u, 10 + y * u, w * u, h * u, { cls: 'acc', fill: true });
          s.rect(10 + x * u, 10 + y * u, w * u, h * u, { cls: 'acc' });
        }
        const isSq = '정사각형';
        const parts = shaded.map(([, , w, h]) => (w * h) / minA);
        return {
          q: `${isSq}을 그림과 같이 크기가 같게 둘로 나누는 일을 여러 번 했습니다. ${level === 1 ? '색칠한 조각 하나는' : '색칠한 부분은'} 전체의 몇 분의 몇인가요?`,
          fig: s.toString(),
          answer: { type: 'num', value: tot / den, display: 'frac' },
          steps: [
            `가장 작은 조각으로 전체를 빈틈없이 덮으면 $${den}$조각이 돼요. → 가장 작은 조각 하나는 전체의 $${fr(1, den)}$`,
            ...(level === 1 ? [] : [`색칠한 조각들은 가장 작은 조각 ${parts.map((x) => `$${x}$개`).join(', ')}만큼이에요.`, `모두 $${parts.join('+')}=${tot}$ (개)`]),
            `답: $${fr(tot, den)}$`,
          ],
          hint: '큰 조각이 가장 작은 조각 몇 개와 크기가 같은지 생각해 보세요.',
        };
      },
    },
  ],
};

// ═════════════════════════════ 최상위 유형 ═════════════════════════════

export const MORE_TOP_E3A: Record<string, Skill[]> = {
  // ───────── e3a-1
  'e3a-1': [
    {
      id: 'top-reverse-diff',
      title: '자리를 바꾼 두 수의 차로 수 찾기',
      gen(r) {
        const k = r.int(2, 8);
        const D = 99 * k;
        const xs = range(100, 999).filter((n) => {
          const a = Math.floor(n / 100),
            b = Math.floor(n / 10) % 10,
            cc = n % 10;
          return cc >= 1 && new Set([a, b, cc]).size === 3 && n - (100 * cc + 10 * b + a) === D;
        });
        const ask = r.pick(['max', 'min', 'count', 'sum']);
        const mx = Math.max(...xs),
          mn = Math.min(...xs);
        const val = ask === 'max' ? mx : ask === 'min' ? mn : ask === 'count' ? xs.length : mx + mn;
        const ex = r.pick(xs);
        const rev = (n: number) => 100 * (n % 10) + 10 * (Math.floor(n / 10) % 10) + Math.floor(n / 100);
        const askText = { max: '이러한 ㉠ 중에서 가장 큰 수는 얼마인가요?', min: '이러한 ㉠ 중에서 가장 작은 수는 얼마인가요?', count: '이러한 ㉠은 모두 몇 개인가요?', sum: '이러한 ㉠ 중에서 가장 큰 수와 가장 작은 수의 합은 얼마인가요?' }[ask];
        return {
          q: `세 자리 수 ㉠의 백의 자리 숫자와 일의 자리 숫자를 서로 바꾸어 만든 세 자리 수를 ㉡이라고 합니다. ㉠의 각 자리 숫자는 모두 다르고, ㉠$-$㉡$=${D}$입니다. ${askText}`,
          answer: ask === 'count' ? { type: 'num', value: val, unit: '개' } : { type: 'num', value: val },
          steps: [
            '㉠과 ㉡은 십의 자리 숫자가 같아서, 차는 백의 자리 숫자와 일의 자리 숫자의 차로만 정해져요.',
            `예: $${ex}-${rev(ex)}=${D}$. 여러 수로 해 보면 (백의 자리 숫자) $-$ (일의 자리 숫자)가 $1$이면 차가 $99$, $2$이면 $198$, $3$이면 $297$, … 처럼 $99$씩 커져요.`,
            `$${D}$${josa(D, '은/는')} $99$를 $${k}$번 더한 수 → (백의 자리 숫자) $-$ (일의 자리 숫자) $=${k}$`,
            `(백, 일)로 가능한 것: ${range(1, 9 - k)
              .map((cc) => `$(${cc + k},${cc})$`)
              .join(', ')} → $${9 - k}$가지 (㉡도 세 자리 수라 일의 자리는 $0$이 될 수 없어요.)`,
            ask === 'count'
              ? `십의 자리에는 그 두 숫자를 뺀 $8$가지 → $${9 - k}\\times8=${xs.length}$ (개)`
              : ask === 'max'
                ? `가장 큰 수: 백의 자리 $9$, 일의 자리 $${9 - k}$, 십의 자리는 남은 숫자 중 가장 큰 수 → $${mx}$`
                : ask === 'min'
                  ? `가장 작은 수: 백의 자리 $${1 + k}$, 일의 자리 $1$, 십의 자리 $0$ → $${mn}$`
                  : `가장 큰 수 $${mx}$, 가장 작은 수 $${mn}$`,
            ask === 'sum' ? `$${mx}+${mn}=${mx + mn}$` : `확인: $${ask === 'min' ? mn : mx}-${rev(ask === 'min' ? mn : mx)}=${D}$`,
          ],
          hint: '십의 자리 숫자는 차에 어떤 영향을 줄까요? 몇 개 직접 빼 보세요.',
        };
      },
    },
    {
      id: 'top-perm-sum',
      title: '만들 수 있는 세 자리 수를 모두 더하기',
      gen(r) {
        const kind = r.pick(['all', 'zero', 'odd']);
        if (kind === 'zero') {
          const [a, b] = r.sample(DIG, 2);
          const cs = [0, a, b];
          const ns = perms(cs, 3)
            .filter((p) => p[0] !== 0)
            .map(num)
            .sort((x, y) => x - y);
          const s = a + b,
            tot = sum(ns);
          return {
            q: `수 카드 $${boxes(r.shuffle(cs))}$을 한 번씩 모두 사용하여 만들 수 있는 세 자리 수를 모두 더하면 얼마인가요?`,
            answer: { type: 'num', value: tot },
            steps: [
              `$0$은 백의 자리에 올 수 없으므로 만들 수 있는 수는 ${list(ns)}의 $4$개예요.`,
              `백의 자리: $${a}$, $${b}$가 $2$번씩 → $(${a}+${b})\\times2=${2 * s}$ → $${200 * s}$`,
              `십의 자리: $${a}$, $${b}$, $0$, $0$ → $${s}$ → $${10 * s}$`,
              `일의 자리: 마찬가지로 $${s}$`,
              `$${200 * s}+${10 * s}+${s}=${tot}$`,
              `확인: ${ns.map((n) => `$${n}$`).join(' $+$ ')} $=${tot}$`,
            ],
            hint: '각 자리에 어떤 숫자가 몇 번씩 오는지 세어 보세요.',
          };
        }
        const cs = kind === 'odd' ? until(
          () => r.sample(DIG, 3),
          (x) => x.filter((d) => d % 2 === 1).length === 2,
        ) : r.sample(DIG, 3);
        const ns = perms(cs, 3)
          .map(num)
          .sort((x, y) => x - y);
        const s = sum(cs);
        if (kind === 'all') {
          const tot = sum(ns);
          return {
            q: `수 카드 $${boxes(r.shuffle(cs))}$을 한 번씩 모두 사용하여 만들 수 있는 세 자리 수를 모두 더하면 얼마인가요?`,
            answer: { type: 'num', value: tot },
            steps: [
              `만들 수 있는 수: ${list(ns)} → $6$개`,
              `백의 자리에 $${cs[0]}$, $${cs[1]}$, $${cs[2]}$가 $2$번씩 와요. 십의 자리, 일의 자리도 마찬가지예요.`,
              `한 자리의 숫자 합: $(${cs.join('+')})\\times2=${2 * s}$`,
              `백의 자리 → $${200 * s}$, 십의 자리 → $${20 * s}$, 일의 자리 → $${2 * s}$`,
              `$${200 * s}+${20 * s}+${2 * s}=${tot}$`,
            ],
            hint: '6개를 하나하나 더하기 전에, 각 자리에 어떤 숫자가 몇 번 오는지 보세요.',
          };
        }
        const odds = ns.filter((n) => n % 2 === 1);
        const tot = sum(odds);
        const od = cs.filter((d) => d % 2 === 1);
        return {
          q: `수 카드 $${boxes(r.shuffle(cs))}$을 한 번씩 모두 사용하여 만들 수 있는 세 자리 수 중에서 홀수를 모두 더하면 얼마인가요?`,
          answer: { type: 'num', value: tot },
          steps: [
            `홀수는 일의 자리 숫자가 홀수예요 → 일의 자리에 ${od.map((d) => `$${d}$`).join(', ')}${od.length > 1 ? ' 중 하나' : ''}`,
            ...od.map((d) => {
              const rest = cs.filter((x) => x !== d);
              return `일의 자리가 $${d}$: $${num([rest[0], rest[1], d])}$, $${num([rest[1], rest[0], d])}$`;
            }),
            `홀수: ${list(odds)} → $${odds.length}$개`,
            `일의 자리 합: $${odds.map((n) => n % 10).join('+')}=${sum(odds.map((n) => n % 10))}$, 십의 자리 합: $${odds.map((n) => Math.floor(n / 10) % 10).join('+')}=${sum(odds.map((n) => Math.floor(n / 10) % 10))}$, 백의 자리 합: $${odds.map((n) => Math.floor(n / 100)).join('+')}=${sum(odds.map((n) => Math.floor(n / 100)))}$`,
            `$${sum(odds.map((n) => Math.floor(n / 100))) * 100}+${sum(odds.map((n) => Math.floor(n / 10) % 10)) * 10}+${sum(odds.map((n) => n % 10))}=${tot}$`,
          ],
          hint: '홀수가 되려면 일의 자리에 어떤 카드가 와야 할까요?',
        };
      },
    },
  ],

  // ───────── e3a-2
  'e3a-2': [
    {
      id: 'top-rect-with-mark',
      title: '표시한 칸을 포함하는 직사각형의 수',
      gen(r) {
        const [m, n, cells] = until(
          () => {
            const m = r.int(2, 4),
              n = r.int(3, 6);
            const two = r.chance(0.5);
            const a: P2 = [r.int(0, m - 1), r.int(0, n - 1)];
            const cells: P2[] = [a];
            if (two) {
              const b: P2 = [r.int(0, m - 1), r.int(0, n - 1)];
              if (b[0] !== a[0] || b[1] !== a[1]) cells.push(b);
            }
            return [m, n, cells] as [number, number, P2[]];
          },
          ([m, n, cells]) => {
            let cnt = 0;
            for (let r1 = 0; r1 < m; r1++)
              for (let r2 = r1; r2 < m; r2++)
                for (let c1 = 0; c1 < n; c1++)
                  for (let c2 = c1; c2 < n; c2++) if (cells.every(([y, x]) => y >= r1 && y <= r2 && x >= c1 && x <= c2)) cnt++;
            return cnt >= 6 && cnt <= 60 && m * n >= 8;
          },
        );
        let cnt = 0;
        for (let r1 = 0; r1 < m; r1++)
          for (let r2 = r1; r2 < m; r2++)
            for (let c1 = 0; c1 < n; c1++) for (let c2 = c1; c2 < n; c2++) if (cells.every(([y, x]) => y >= r1 && y <= r2 && x >= c1 && x <= c2)) cnt++;
        const rmin = Math.min(...cells.map((q) => q[0])),
          rmax = Math.max(...cells.map((q) => q[0]));
        const cmin = Math.min(...cells.map((q) => q[1])),
          cmax = Math.max(...cells.map((q) => q[1]));
        const L = cmin + 1,
          R = n - cmax,
          T = rmin + 1,
          B = m - rmax;
        const u = 30;
        const s = new Svg(n * u + 20, m * u + 20);
        for (let y = 0; y < m; y++) for (let x = 0; x < n; x++) s.rect(10 + x * u, 10 + y * u, u, u, { cls: 'acc' });
        const marks = ['★', '●'];
        cells.forEach(([y, x], i) => s.text(10 + x * u + u / 2, 10 + y * u + u / 2, marks[i], { size: 15, cls: 'acc' }));
        const two = cells.length === 2;
        return {
          q: `그림과 같이 크기가 같은 정사각형 $${m * n}$개로 만든 직사각형이 있습니다. 그림에서 찾을 수 있는 크고 작은 직사각형 중에서 ${two ? '★과 ●를 모두' : '★을'} 포함하는 직사각형은 모두 몇 개인가요? (정사각형도 직사각형이에요.)`,
          fig: s.toString(),
          answer: { type: 'num', value: cnt, unit: '개' },
          steps: [
            `직사각형은 왼쪽 변, 오른쪽 변이 될 세로선과 위쪽 변, 아래쪽 변이 될 가로선을 하나씩 고르면 정해져요.`,
            `${two ? '두 표시를' : '★을'} 포함하려면 왼쪽 변은 ${two ? '왼쪽 표시' : '★'}의 왼쪽 세로선 $${L}$개 중 하나, 오른쪽 변은 ${two ? '오른쪽 표시' : '★'}의 오른쪽 세로선 $${R}$개 중 하나 → $${L}\\times${R}=${L * R}$ (가지)`,
            `위쪽 변은 위쪽 가로선 $${T}$개 중 하나, 아래쪽 변은 아래쪽 가로선 $${B}$개 중 하나 → $${T}\\times${B}=${T * B}$ (가지)`,
            `가로 방향 $${L * R}$가지마다 세로 방향 $${T * B}$가지씩 짝지을 수 있어요.`,
            `$${L * R}\\times${T * B}=${cnt}$ (개)`,
          ],
          hint: '직사각형의 네 변이 될 선을 고르는 방법을 세어 보세요.',
        };
      },
    },
    {
      id: 'top-poly-perimeter',
      title: '정사각형을 이어 붙인 도형의 가장 짧은·긴 둘레',
      gen(r) {
        const k = r.int(5, 12),
          a = r.int(2, 9);
        const w = Math.ceil(Math.sqrt(k)),
          h = Math.ceil(k / w);
        const minU = 2 * (w + h),
          maxU = 2 * k + 2;
        const ask = r.pick(['min', 'max', 'diff']);
        const val = ask === 'min' ? minU * a : ask === 'max' ? maxU * a : (maxU - minU) * a;
        const askText = ask === 'min' ? '둘레가 가장 짧은 도형의 둘레는 몇 cm인가요?' : ask === 'max' ? '둘레가 가장 긴 도형의 둘레는 몇 cm인가요?' : '둘레가 가장 긴 도형과 가장 짧은 도형의 둘레의 차는 몇 cm인가요?';
        const shared = 4 * k - minU;
        return {
          q: `한 변이 $${a}$ cm인 정사각형 $${k}$개를 변과 변이 꼭 맞닿도록 겹치지 않게 이어 붙여서 여러 가지 도형을 만들려고 합니다. 만들 수 있는 도형 중에서 ${askText}`,
          answer: { type: 'num', value: val, unit: 'cm' },
          steps: [
            `정사각형 $${k}$개의 변은 모두 $4\\times${k}=${4 * k}$개예요. 두 정사각형이 맞닿으면 변 $2$개가 둘레에서 빠져요.`,
            `가장 긴 둘레: 맞닿은 곳이 가장 적게 (한 줄로 이으면 $${k - 1}$군데) → 변 $${4 * k}-${2 * (k - 1)}=${maxU}$개`,
            `가장 짧은 둘레: 맞닿은 곳이 가장 많게, 정사각형에 가까운 모양으로 모아요 → 가로 $${w}$칸, 세로 $${h}$칸${w * h === k ? '인 직사각형' : `에 채운 모양 (빈 칸 $${w * h - k}$개는 모서리 쪽)`}`,
            `이 모양의 둘레는 가로 $${w}$칸, 세로 $${h}$칸인 직사각형의 둘레와 같아요 → 변 $${w}+${h}+${w}+${h}=${minU}$개 (맞닿은 곳 $${shared / 2}$군데)`,
            ask === 'min' ? `$${a}\\times${minU}=${minU * a}$ (cm)` : ask === 'max' ? `$${a}\\times${maxU}=${maxU * a}$ (cm)` : `변의 수의 차: $${maxU}-${minU}=${maxU - minU}$개 → $${a}\\times${maxU - minU}=${(maxU - minU) * a}$ (cm)`,
          ],
          hint: '두 정사각형이 맞닿을 때마다 둘레가 얼마씩 줄어드는지 생각해 보세요.',
        };
      },
    },
  ],

  // ───────── e3a-3
  'e3a-3': [
    {
      id: 'top-div-digits',
      title: '서로 다른 숫자로 나눗셈식 만들기',
      gen(r) {
        type Eq = { n: number; d: number; q: number };
        const [kind, f, eqs] = until(
          () => {
            const kind = r.chance(0.5) ? 'tens' : 'ones';
            const f = r.int(1, 8);
            const eqs: Eq[] = [];
            for (let d = 2; d <= 9; d++)
              for (let q = 1; q <= 9; q++) {
                const n = d * q;
                if (n < 10 || n > 99) continue;
                const t = Math.floor(n / 10),
                  o = n % 10;
                if ((kind === 'tens' ? t : o) !== f) continue;
                const ds = [t, o, d, q];
                if (ds.includes(0) || new Set(ds).size !== 4) continue;
                eqs.push({ n, d, q });
              }
            return [kind, f, eqs] as [string, number, Eq[]];
          },
          ([, , eqs]) => eqs.length >= 2 && eqs.length <= 6,
        );
        const tex = kind === 'tens' ? `${f}\\square\\div\\square=\\square` : `\\square ${f}\\div\\square=\\square`;
        const all: number[] = [];
        for (let d = 2; d <= 9; d++)
          for (let q = 1; q <= 9; q++) {
            const n = d * q;
            if (n >= 10 && n <= 99 && (kind === 'tens' ? Math.floor(n / 10) : n % 10) === f && !all.includes(n)) all.push(n);
          }
        all.sort((x, y) => x - y);
        return {
          q: `$1$부터 $9$까지의 숫자 중에서 골라 □ 안에 하나씩 써넣어 나눗셈식을 완성하려고 합니다. 식에 쓰인 네 숫자가 모두 다를 때, 만들 수 있는 나눗셈식은 모두 몇 개인가요? $$${tex}$$`,
          answer: { type: 'num', value: eqs.length, unit: '개' },
          steps: [
            `몫이 한 자리 수이므로 (나누는 수)$\\times$(몫)$=$(두 자리 수)인 곱셈구구를 찾으면 돼요.`,
            `${kind === 'tens' ? `십의 자리가 $${f}$인` : `일의 자리가 $${f}$인`} 곱셈구구의 곱: ${list(all)}`,
            '각각을 두 한 자리 수의 곱으로 나타내고, 네 숫자가 모두 다른지($0$이 없는지) 확인해요.',
            `가능한 식: ${eqs.map((e) => `$${e.n}\\div${e.d}=${e.q}$`).join(', ')}`,
            `모두 $${eqs.length}$개`,
          ],
          hint: '나눗셈식을 곱셈식으로 바꾸어 생각해 보세요.',
        };
      },
    },
    {
      id: 'top-share-more-people',
      title: '사람 수가 바뀌어도 남김없이 나누어지는 수',
      gen(r) {
        const [a, b, k, n, more] = until(
          () => {
            const more = r.chance(0.6);
            const a = r.int(3, 9),
              b = r.int(2, 9),
              k = r.int(1, 4);
            // more: a·n = b·(n+k) (a>b) / fewer: a·n = b·(n−k) (b>a)
            const hi = more ? a : b,
              lo = more ? b : a;
            const top = more ? b * k : a * k;
            const n = top % (hi - lo) === 0 ? (more ? (b * k) / (a - b) : (b * k) / (b - a)) : -1;
            return [a, b, k, n, more] as [number, number, number, number, boolean];
          },
          ([a, b, k, n, more]) => a !== b && (more ? a > b : b > a) && n >= 2 && (more ? n + k : n) <= 9 && (!more || n - 0 >= 2) && (more || n - k >= 2) && a * n <= 81 && a * n >= 12,
        );
        const tot = a * n;
        const n2 = more ? n + k : n - k;
        const it = r.pick([
          { w: '사탕', u: '개' },
          { w: '색연필', u: '자루' },
          { w: '쿠키', u: '개' },
        ]);
        const askTotal = r.chance(0.6);
        const tryN = range(more ? 1 : k + 1, n).map((x) => `$${x}$명: $${a}\\times${x}=${a * x}$, $${b}\\times${more ? x + k : x - k}=${b * (more ? x + k : x - k)}$`);
        return {
          q: `${J(it.w, '을/를')} 친구들에게 똑같이 나누어 주려고 합니다. 한 명에게 $${a}$${it.u}씩 주면 남김없이 딱 맞습니다. 그런데 친구가 $${k}$명 ${more ? '더 와서' : '빠져서'} 한 명에게 $${b}$${it.u}씩 주었더니 이번에도 남김없이 딱 맞았습니다. ${askTotal ? `${J(it.w, '은/는')} 모두 몇 ${it.u}인가요?` : '처음 친구는 몇 명이었나요?'}`,
          answer: askTotal ? { type: 'num', value: tot, unit: it.u } : { type: 'num', value: n, unit: '명' },
          steps: [
            `처음 친구 수를 □명이라 하면 (${it.w} 수) $=${a}\\times$□ $=${b}\\times$(□${more ? '+' : '-'}${k})`,
            more
              ? `한 명당 $${a}-${b}=${a - b}$${it.u}씩 덜 받는 만큼을 모아서, 새로 온 $${k}$명에게 $${b}$${it.u}씩 주었어요.`
              : `빠진 $${k}$명 몫 $${a}\\times${k}=${a * k}$${J(it.u, '을/를')} 남은 친구들이 $${b}-${a}=${b - a}$${it.u}씩 더 나누어 가졌어요.`,
            more ? `$${a - b}\\times$□ $=${b}\\times${k}=${b * k}$ → □ $=${b * k}\\div${a - b}=${n}$` : `$${b - a}\\times$(□$-${k}$) $=${a * k}$ → □$-${k}=${(a * k) / (b - a)}$ → □ $=${n}$`,
            `표로 확인: ${tryN.slice(-3).join(' / ')}`,
            `처음 친구: $${n}$명, ${it.w}: $${a}\\times${n}=${tot}$ (${it.u}) ($${n2}$명에게 $${b}$${it.u}씩: $${b}\\times${n2}=${tot}$)`,
          ],
          hint: '친구 수를 1명, 2명, … 늘려 가며 표를 만들어 보세요.',
        };
      },
    },
  ],

  // ───────── e3a-4
  'e3a-4': [
    {
      id: 'top-square-array',
      title: '정사각형 모양으로 늘어놓은 바둑돌',
      gen(r) {
        const n = r.int(5, 10);
        const P = 4 * (n - 1);
        const kind = r.pick(['total', 'inner', 'diff']);
        const inner = (n - 2) * (n - 2);
        const val = kind === 'total' ? n * n : kind === 'inner' ? inner : Math.abs(inner - P);
        const askText = kind === 'total' ? '늘어놓은 바둑돌은 모두 몇 개인가요?' : kind === 'inner' ? '가장 바깥쪽 둘레에 놓인 바둑돌을 모두 빼면 남는 바둑돌은 몇 개인가요?' : '안쪽의 검은 바둑돌과 바깥쪽 둘레의 흰 바둑돌의 수의 차는 몇 개인가요?';
        return {
          q: `바둑돌을 빈틈없이 늘어놓아 가로와 세로에 놓인 돌의 수가 같은 정사각형 모양을 만들었습니다. ${kind === 'diff' ? '가장 바깥쪽 둘레에는 흰 바둑돌을, 그 안쪽에는 모두 검은 바둑돌을 놓았더니 흰 바둑돌이' : '가장 바깥쪽 둘레에 놓인 바둑돌이'} $${P}$개였습니다. ${askText}`,
          answer: { type: 'num', value: val, unit: '개' },
          steps: [
            '한 변에 놓인 돌을 □개라 하면, 네 변에 □개씩 세면 네 꼭짓점의 돌을 두 번씩 세게 돼요.',
            `둘레의 돌: $4\\times$□$-4=${P}$ → $4\\times$□$=${P + 4}$ → □$=${n}$`,
            `한 변에 $${n}$개씩 놓인 정사각형 모양이에요.`,
            kind === 'total' ? `전체: $${n}\\times${n}=${n * n}$ (개)` : `안쪽은 한 변에 $${n}-2=${n - 2}$개씩 → $${n - 2}\\times${n - 2}=${inner}$ (개)`,
            ...(kind === 'diff' ? [`흰 돌 $${P}$개, 검은 돌 $${inner}$개 → 차: $${Math.max(P, inner)}-${Math.min(P, inner)}=${val}$ (개)`] : kind === 'inner' ? [`(확인: 전체 $${n * n}$개 $-$ 둘레 $${P}$개 $=${inner}$개)`] : []),
          ],
          hint: '꼭짓점에 놓인 돌은 두 변에 함께 들어 있어요.',
        };
      },
    },
    {
      id: 'top-fence-posts',
      title: '직사각형 둘레에 세운 말뚝',
      gen(r) {
        const [d, g, v] = until(
          () => [r.int(3, 9), r.int(5, 9), r.int(2, 7)],
          ([, g, v]) => v < g - 1,
        );
        const T = 2 * (g - 1) + 2 * v;
        const ask = r.pick(['height', 'perimeter', 'diff']);
        const W = (g - 1) * d,
          H = v * d;
        const val = ask === 'height' ? H : ask === 'perimeter' ? T * d : W - H;
        const askText = ask === 'height' ? '밭의 세로는 몇 m인가요?' : ask === 'perimeter' ? '밭의 둘레는 몇 m인가요?' : '밭의 가로는 세로보다 몇 m 더 긴가요?';
        return {
          q: `가로가 세로보다 긴 직사각형 모양의 밭 둘레에 $${d}$ m 간격으로 말뚝을 세웠습니다. 네 꼭짓점에는 반드시 말뚝을 세웠고, 말뚝은 모두 $${T}$개입니다. 밭의 가로 한 변에 세운 말뚝이 양 끝을 포함하여 $${g}$개일 때, ${askText}`,
          answer: { type: 'num', value: val, unit: 'm' },
          steps: [
            `둘레를 한 바퀴 돌면 처음 말뚝으로 돌아오므로 간격의 수는 말뚝 수와 같은 $${T}$군데예요.`,
            ...(ask === 'perimeter'
              ? [`둘레: $${d}\\times${T}=${T * d}$ (m)`, `(가로 한 변의 말뚝 수는 몰라도 구할 수 있어요.)`]
              : [
                  `가로 한 변의 간격: $${g}-1=${g - 1}$군데 → 가로 두 변에 $${2 * (g - 1)}$군데`,
                  `세로 두 변의 간격: $${T}-${2 * (g - 1)}=${2 * v}$군데 → 세로 한 변에 $${v}$군데`,
                  `가로: $${d}\\times${g - 1}=${W}$ (m), 세로: $${d}\\times${v}=${H}$ (m)`,
                  ask === 'height' ? `답: $${H}$ m` : `$${W}-${H}=${W - H}$ (m)`,
                ]),
          ],
          hint: '닫힌 둘레에서는 간격 수와 말뚝 수가 같아요.',
        };
      },
    },
  ],

  // ───────── e3a-5
  'e3a-5': [
    {
      id: 'top-broken-ruler',
      title: '눈금이 지워진 자로 잴 수 있는 길이',
      gen(r) {
        const [L, marks, ds, ask] = until(
          () => {
            const L = r.int(8, 15);
            const inner = r.sample(range(1, L - 1), r.int(2, 3)).sort((a, b) => a - b);
            const marks = [0, ...inner, L];
            const ds = new Set<number>();
            for (let i = 0; i < marks.length; i++) for (let j = i + 1; j < marks.length; j++) ds.add(marks[j] - marks[i]);
            return [L, marks, [...ds].sort((a, b) => a - b), r.pick(['can', 'cannot', 'cannot-min'])] as [number, number[], number[], string];
          },
          ([L, , ds]) => ds.length >= 5 && ds.length <= L - 1,
        );
        const cannot = range(1, L).filter((x) => !ds.includes(x));
        const val = ask === 'can' ? ds.length : ask === 'cannot' ? cannot.length : cannot[0];
        const W = 300;
        const s = new Svg(W, 70);
        const X = (x: number) => 18 + ((W - 36) * x) / L;
        s.rect(X(0), 18, X(L) - X(0), 26, { cls: 'acc' });
        for (const m of marks) {
          s.line(X(m), 18, X(m), 32, { cls: 'acc' });
          s.text(X(m), 60, String(m), { size: 12 });
        }
        s.text(X(L) + 2, 14, 'cm', { size: 11, anchor: 'end' });
        const rows = marks.slice(0, -1).map((m, i) => `$${m}$에서: ${marks
          .slice(i + 1)
          .map((x) => `$${x - m}$`)
          .join(', ')} (cm)`);
        const askText = ask === 'can' ? '이 자를 한 번만 대어 잴 수 있는 길이는 모두 몇 가지인가요?' : ask === 'cannot' ? `$1$ cm부터 $${L}$ cm까지의 길이 중에서 이 자를 한 번만 대어서는 잴 수 없는 길이는 모두 몇 가지인가요? (길이는 cm 단위의 자연수로만 생각해요.)` : '이 자를 한 번만 대어서는 잴 수 없는 길이 중에서 가장 짧은 길이는 몇 cm인가요? (길이는 cm 단위의 자연수로만 생각해요.)';
        return {
          q: `길이가 $${L}$ cm인 자의 눈금이 대부분 지워져서 그림과 같이 ${marks.map((m) => `$${m}$`).join(', ')} 눈금만 남았습니다. ${askText}`,
          fig: s.toString(),
          answer: ask === 'cannot-min' ? { type: 'num', value: val, unit: 'cm' } : { type: 'num', value: val, unit: '가지' },
          steps: [
            '남은 두 눈금 사이의 길이만 잴 수 있어요. 두 눈금을 골라 큰 수에서 작은 수를 빼요.',
            ...rows,
            `서로 다른 길이: ${ds.map((x) => `$${x}$`).join(', ')} → $${ds.length}$가지`,
            ask === 'can' ? `답: $${ds.length}$가지` : `잴 수 없는 길이: ${cannot.map((x) => `$${x}$`).join(', ')}${ask === 'cannot' ? ` → $${cannot.length}$가지` : ` → 가장 짧은 것은 $${cannot[0]}$ cm`}`,
          ],
          hint: '눈금 두 개를 고르는 모든 경우를 빠짐없이 따져 보세요.',
        };
      },
    },
    {
      id: 'top-interval-time',
      title: '간격의 수로 걸리는 시간 구하기',
      gen(r) {
        const kind = r.pick(['elevator', 'log', 'bell']);
        const ans = (sec: number): ProblemDraft['answer'] => (sec >= 60 ? msFields(sec) : { type: 'num', value: sec, unit: '초' });
        const askU = (sec: number) => (sec >= 60 ? '몇 분 몇 초' : '몇 초');
        if (kind === 'elevator') {
          const [p, a, c0, d0] = until(
            () => [r.int(3, 9), r.int(3, 6), r.int(2, 6), r.int(10, 20)],
            ([p, a, c0, d0]) => (a - 1) * p <= 81 && (a - 1) * p >= 10 && d0 - c0 >= 6 && (d0 - c0) * p >= 60,
          );
          const t = (a - 1) * p,
            tot = (d0 - c0) * p;
          return {
            q: `어느 건물의 엘리베이터가 $1$층에서 $${a}$층까지 쉬지 않고 올라가는 데 ${ms(t)}가 걸렸습니다. 이 엘리베이터가 같은 빠르기로 $${c0}$층에서 $${d0}$층까지 쉬지 않고 올라가는 데 걸리는 시간은 ${askU(tot)}인가요?`,
            answer: ans(tot),
            steps: [
              `$1$층에서 $${a}$층까지는 $${a}$층이 아니라 층 사이 $${a - 1}$칸을 올라가요.`,
              `${t >= 60 ? `${ms(t)} $=${t}$초, ` : ''}한 층 올라가는 데: $${t}\\div${a - 1}=${p}$ (초)`,
              `$${c0}$층에서 $${d0}$층까지: $${d0}-${c0}=${d0 - c0}$칸`,
              `$${p}\\times${d0 - c0}=${tot}$ (초)${tot >= 60 ? ` $=$ ${ms(tot)}` : ''}`,
            ],
            hint: '올라가는 층의 수가 아니라 층과 층 사이의 수를 세어 보세요.',
          };
        }
        if (kind === 'log') {
          const cut = r.int(4, 9) * 10 + r.pick([0, 5]),
            rest = r.int(2, 6) * 5,
            n = r.int(4, 8);
          const tot = (n - 1) * cut + (n - 2) * rest;
          return {
            q: `통나무 한 개를 똑같은 길이로 $${n}$도막이 되게 자르려고 합니다. 한 번 자르는 데 ${ms(cut)}${josa(cut % 60 ? '초' : '분', '이/가')} 걸리고, 한 번 자른 뒤에는 $${rest}$초씩 쉬었다가 다음 번을 자릅니다. 처음 자르기 시작해서 마지막으로 다 자를 때까지 걸리는 시간은 몇 분 몇 초인가요?`,
            answer: msFields(tot),
            steps: [
              `$${n}$도막이 되려면 $${n}-1=${n - 1}$번 잘라야 해요.`,
              `쉬는 것은 자르는 사이사이에만 하므로 $${n - 1}-1=${n - 2}$번`,
              `자르는 시간: ${cut >= 60 ? `${ms(cut)} $=${cut}$초, ` : ''}$${cut}\\times${n - 1}=${(n - 1) * cut}$ (초)`,
              `쉬는 시간: $${rest}\\times${n - 2}=${(n - 2) * rest}$ (초)`,
              `모두: $${(n - 1) * cut}+${(n - 2) * rest}=${tot}$ (초) $=$ ${ms(tot)}`,
            ],
            hint: '자르는 횟수와 쉬는 횟수는 도막 수보다 각각 몇 적을까요?',
          };
        }
        const [g, a, b] = until(
          () => [r.int(2, 9), r.int(3, 6), r.int(7, 12)],
          ([g, a, b]) => (a - 1) * g <= 45 && (a - 1) * g >= 6 && (b - 1) * g >= 20,
        );
        const t = (a - 1) * g,
          tot = (b - 1) * g;
        return {
          q: `어느 시계탑은 정각마다 그 시각의 수만큼 종을 칩니다. 오후 $${a}$시에 종을 $${a}$번 치는 데 첫 번째 종부터 마지막 종까지 $${t}$초가 걸렸습니다. 종을 치는 간격이 늘 같다면, ${b === 12 ? '밤' : '오후'} $${b}$시에 종을 $${b}$번 치는 데 걸리는 시간은 ${askU(tot)}인가요? (종을 치는 순간의 시간은 생각하지 않아요.)`,
          answer: ans(tot),
          steps: [
            `종을 $${a}$번 치면 종과 종 사이의 간격은 $${a - 1}$군데예요.`,
            `간격 한 군데: $${t}\\div${a - 1}=${g}$ (초)`,
            `종을 $${b}$번 치면 간격은 $${b - 1}$군데`,
            `$${g}\\times${b - 1}=${tot}$ (초)${tot >= 60 ? ` $=$ ${ms(tot)}` : ''}`,
          ],
          hint: '종을 치는 횟수와 간격의 수는 같을까요?',
        };
      },
    },
  ],

  // ───────── e3a-6
  'e3a-6': [
    {
      id: 'top-two-ribbons',
      title: '똑같이 나눈 두 끈의 한 도막 차로 전체 길이 구하기',
      gen(r) {
        const [a, b, t] = until(
          () => {
            const [a, b] = r.sample(range(2, 9), 2).sort((x, y) => x - y);
            return [a, b, r.int(1, 6)];
          },
          ([a, b, t]) => {
            const L0 = (a * b) / gcd(a, b);
            return L0 <= 36 && L0 / a - L0 / b >= 1 && L0 / a - L0 / b <= 9 && L0 * t <= 150 && L0 * t >= 12 && (L0 / a - L0 / b) * t >= 2;
          },
        );
        const L0 = (a * b) / gcd(a, b);
        const pa = L0 / a,
          pb = L0 / b;
        const d = (pa - pb) * t,
          L = L0 * t;
        const [c1, c2] = r.pick([
          ['빨간', '파란'],
          ['노란', '초록'],
          ['분홍', '하얀'],
        ]);
        const ask = r.pick(['total', 'piece', 'both']);
        const val = ask === 'total' ? L : ask === 'piece' ? pa * t : 2 * L;
        const askText = ask === 'total' ? '끈 한 개의 길이는 몇 cm인가요?' : ask === 'piece' ? `${c1} 끈 한 도막의 길이는 몇 cm인가요?` : '두 끈의 길이의 합은 몇 cm인가요?';
        return {
          q: `길이가 같은 ${c1} 끈과 ${c2} 끈이 있습니다. ${c1} 끈은 똑같이 $${a}$도막으로, ${c2} 끈은 똑같이 $${b}$도막으로 잘랐더니 ${c1} 끈 한 도막이 ${c2} 끈 한 도막보다 $${d}$ cm 더 길었습니다. ${askText}`,
          answer: { type: 'num', value: val, unit: 'cm' },
          steps: [
            `${c1} 끈 한 도막은 전체의 $${fr(1, a)}$, ${c2} 끈 한 도막은 전체의 $${fr(1, b)}$이에요.`,
            `끈을 $${a}$${ro(a)}도 $${b}$${ro(b)}도 똑같이 나눌 수 있게 작은 칸 $${L0}$칸으로 생각해요.`,
            `${c1} 한 도막: $${L0}$칸을 $${a}$묶음 → $${pa}$칸, ${c2} 한 도막: $${L0}$칸을 $${b}$묶음 → $${pb}$칸`,
            `차: $${pa}-${pb}=${pa - pb}$칸이 $${d}$ cm → 한 칸 $=${d}\\div${pa - pb}=${t}$ (cm)`,
            ask === 'total' ? `끈 한 개: $${L0}$칸 → $${t}\\times${L0}=${L}$ (cm)` : ask === 'piece' ? `${c1} 한 도막: $${pa}$칸 → $${t}\\times${pa}=${pa * t}$ (cm)` : `끈 한 개: $${t}\\times${L0}=${L}$ (cm), 두 끈: $${L}+${L}=${2 * L}$ (cm)`,
            `확인: ${c1} $${pa * t}$ cm, ${c2} $${pb * t}$ cm → 차 $${d}$ cm`,
          ],
          hint: '두 가지로 똑같이 나눌 수 있는 작은 칸을 생각해 보세요.',
        };
      },
    },
    {
      id: 'top-repeat-split',
      title: '거듭 나눈 조각이 전체의 얼마인지 알기',
      gen(r) {
        const kind = r.pick(['half', 'keep', 'first']);
        if (kind === 'half') {
          const n = r.int(3, 5);
          const den = 2 ** n;
          const askLeft = r.chance(0.5);
          return {
            q: `정사각형 모양 종이 전체의 반을 색칠하고, 색칠하지 않은 부분의 반을 또 색칠하는 일을 모두 $${n}$번 했습니다. ${askLeft ? '마지막까지 색칠하지 않고 남은 부분은' : `${ORD[n - 1]}에 색칠한 부분은`} 전체의 몇 분의 몇인가요?`,
            answer: { type: 'num', value: 1 / den, display: 'frac' },
            steps: [
              '첫째: 전체의 $\\frac{1}{2}$을 색칠 → 남은 부분 $\\frac{1}{2}$',
              '둘째: 남은 $\\frac{1}{2}$의 반 → 전체를 똑같이 $4$로 나눈 것 중 하나 $\\frac{1}{4}$을 색칠 → 남은 부분 $\\frac{1}{4}$',
              '셋째: 남은 $\\frac{1}{4}$의 반 → $\\frac{1}{8}$을 색칠 → 남은 부분 $\\frac{1}{8}$',
              ...(n >= 4 ? [`넷째: $\\frac{1}{16}$을 색칠 → 남은 부분 $\\frac{1}{16}$`] : []),
              ...(n >= 5 ? [`다섯째: $\\frac{1}{32}$을 색칠 → 남은 부분 $\\frac{1}{32}$`] : []),
              `한 번 할 때마다 분모가 $2$배가 돼요. → ${askLeft ? '남은 부분' : `${ORD[n - 1]}에 색칠한 부분`}: $${fr(1, den)}$`,
            ],
            hint: '한 번씩 할 때마다 색칠한 부분과 남은 부분을 차례로 써 보세요.',
          };
        }
        const m = r.pick([2, 3, 4]);
        const thing = r.pick([
          { w: '리본', act: '도막' },
          { w: '색 테이프', act: '도막' },
          { w: '끈', act: '도막' },
        ]);
        if (kind === 'keep') {
          const n = m === 2 ? r.int(4, 6) : m === 3 ? r.int(2, 4) : r.int(2, 3);
          const den = m ** n;
          return {
            q: `${J(thing.w, '을/를')} 똑같이 $${m}$${thing.act}으로 자른 다음, 그중 한 ${thing.act}을 다시 똑같이 $${m}$${thing.act}으로 자르는 일을 모두 $${n}$번 했습니다. 마지막에 자른 한 ${thing.act}은 처음 ${thing.w} 전체의 몇 분의 몇인가요?`,
            answer: { type: 'num', value: 1 / den, display: 'frac' },
            steps: [
              `첫째: 전체를 똑같이 $${m}$${thing.act} → 한 ${thing.act}은 $${fr(1, m)}$`,
              `둘째: 그 한 ${thing.act}을 또 $${m}$${thing.act} → 전체를 똑같이 $${m}\\times${m}=${m * m}$${thing.act}으로 나눈 것과 같아요 → $${fr(1, m * m)}$`,
              ...(n >= 3 ? [`셋째: $${m * m}\\times${m}=${m ** 3}$ → $${fr(1, m ** 3)}$`] : []),
              ...range(4, n).map((i) => `${ORD[i - 1]}: $${m ** (i - 1)}\\times${m}=${m ** i}$ → $${fr(1, m ** i)}$`),
              `답: $${fr(1, den)}$`,
            ],
            hint: '처음 전체를 기준으로, 똑같이 몇 도막으로 나눈 것과 같은지 생각해 보세요.',
          };
        }
        const [N, k] = until(
          () => {
            const N = r.int(10, 90);
            let k = 1;
            while (m ** k <= N) k++;
            return [N, k];
          },
          ([N, k]) => m ** (k - 1) !== N && k >= 3 && k <= 6,
        );
        return {
          q: `${J(thing.w, '을/를')} 똑같이 $${m}$${thing.act}으로 자른 다음, 그중 한 ${thing.act}을 다시 똑같이 $${m}$${thing.act}으로 자르는 일을 되풀이합니다. 마지막에 자른 한 ${thing.act}이 처음 ${thing.w} 전체의 $${fr(1, N)}$보다 처음으로 짧아지는 것은 몇 번째로 잘랐을 때인가요?`,
          answer: { type: 'num', value: k, unit: '번째' },
          steps: [
            `$1$번째: $${fr(1, m)}$, $2$번째: $${fr(1, m * m)}$, … 한 번 자를 때마다 분모가 $${m}$배가 돼요.`,
            `분모: ${range(1, k)
              .map((i) => `$${m ** i}$`)
              .join(', ')}`,
            `단위분수는 분모가 클수록 작아요. $${fr(1, N)}$보다 작으려면 분모가 $${N}$보다 커야 해요.`,
            `$${k - 1}$번째: $${fr(1, m ** (k - 1))}$ (분모 $${m ** (k - 1)}<${N}$ → 아직 더 김), $${k}$번째: $${fr(1, m ** k)}$ (분모 $${m ** k}>${N}$)`,
            `답: $${k}$번째`,
          ],
          hint: '자를 때마다 한 도막이 전체의 몇 분의 일이 되는지 차례로 써 보세요.',
        };
      },
    },
  ],
};
