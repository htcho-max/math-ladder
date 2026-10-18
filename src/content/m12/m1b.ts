// 중1-2: 기본 도형 / 작도와 합동 / 평면도형의 성질 / 입체도형의 성질 / 자료의 정리와 해석
import type { ContentMap, ProblemDraft } from '../../core/types';
import type { Rng } from '../../core/rng';
import { nCr } from '../../core/nt';
import { Svg } from '../../core/fig';
import { textChoices } from './util';
import { type P2, type V3, angleMark, edgeFace, edgeRel, go, proj, triPts, vLabels } from './geo';

const DEG = '^{\\circ}';

/** SSA 에서 삼각형이 두 개 생기는 수치 [인접변, 각, 대변] */
function ssa(r: Rng): [number, number, number] {
  const T: [number, number, number][] = [
    [10, 30, 6], [10, 30, 7], [10, 30, 8], [10, 30, 9], [8, 30, 5], [8, 30, 6], [8, 30, 7], [12, 30, 7], [12, 30, 9], [12, 30, 11],
    [10, 40, 7], [10, 40, 8], [10, 40, 9], [9, 45, 7], [9, 45, 8], [12, 45, 9], [12, 45, 10], [12, 45, 11], [10, 50, 8], [10, 50, 9], [12, 55, 10], [12, 55, 11],
  ];
  return r.pick(T);
}
const POLY_KO = ['', '', '', '삼', '사', '오', '육', '칠', '팔', '구', '십', '십일', '십이'];

// ───────── 입체(직육면체·삼각기둥) ─────────
interface Solid {
  name: string;
  v: Record<string, V3>;
  edges: string[];
  faces: Record<string, string>;
  hidden: string; // 가려진 꼭짓점
}
function cuboid(w: number, d: number, h: number): Solid {
  return {
    name: '직육면체',
    v: { A: [0, 0, h], B: [w, 0, h], C: [w, d, h], D: [0, d, h], E: [0, 0, 0], F: [w, 0, 0], G: [w, d, 0], H: [0, d, 0] },
    edges: ['AB', 'BC', 'CD', 'DA', 'EF', 'FG', 'GH', 'HE', 'AE', 'BF', 'CG', 'DH'],
    faces: { ABCD: 'ABC', EFGH: 'EFG', ABFE: 'ABF', BCGF: 'BCG', CDHG: 'CDH', ADHE: 'ADH' },
    hidden: 'H',
  };
}
function triPrism(w: number, d: number, h: number): Solid {
  return {
    name: '삼각기둥',
    v: { A: [0, 0, h], B: [w, 0, h], C: [w * 0.45, d, h], D: [0, 0, 0], E: [w, 0, 0], F: [w * 0.45, d, 0] },
    edges: ['AB', 'BC', 'CA', 'DE', 'EF', 'FD', 'AD', 'BE', 'CF'],
    faces: { ABC: 'ABC', DEF: 'DEF', ABED: 'ABE', BCFE: 'BCF', ACFD: 'ACF' },
    hidden: 'F',
  };
}
function solidFig(S: Solid): string {
  const s = new Svg(240, 200);
  const xs = Object.values(S.v);
  const maxX = Math.max(...xs.map((v) => v[0] + 0.5 * v[1] * Math.cos((35 * Math.PI) / 180)));
  const maxZ = Math.max(...xs.map((v) => v[2] + 0.5 * v[1] * Math.sin((35 * Math.PI) / 180)));
  const k = Math.min(180 / maxX, 150 / maxZ);
  const P = (n: string) => proj(S.v[n], 30, 180, k);
  for (const e of S.edges) {
    const [a, b] = [P(e[0]), P(e[1])];
    s.line(a[0], a[1], b[0], b[1], { dash: e.includes(S.hidden), cls: e.includes(S.hidden) ? 'muted' : undefined });
  }
  const names = Object.keys(S.v);
  vLabels(s, names.map(P), names, 12);
  return s.toString();
}

export const m1b: ContentMap = {
  // ═══════════════ m1b-1 기본 도형 ═══════════════
  'm1b-1': {
    concepts: [
      {
        title: '점·선·면과 교점·교선',
        body: '도형의 기본 요소는 점, 선, 면이에요. 점이 움직이면 선, 선이 움직이면 면이 돼요.\n- **교점**: 선과 선 또는 선과 면이 만나서 생기는 점\n- **교선**: 면과 면이 만나서 생기는 선\n평면으로만 둘러싸인 입체도형에서 (교점의 개수) = (꼭짓점의 개수), (교선의 개수) = (모서리의 개수)',
      },
      {
        title: '직선·반직선·선분',
        body: '- 직선 AB ($\\overleftrightarrow{AB}$): 양쪽으로 끝없이 뻗은 곧은 선\n- 반직선 AB ($\\overrightarrow{AB}$): 점 A 에서 시작해 B 쪽으로 뻗은 선. $\\overrightarrow{AB} \\ne \\overrightarrow{BA}$\n- 선분 AB ($\\overline{AB}$): A 에서 B 까지. 그 길이가 두 점 사이의 거리\n- **중점** M: $\\overline{AM} = \\overline{MB} = \\frac{1}{2}\\overline{AB}$',
      },
      {
        title: '각과 맞꼭지각',
        body: '- 평각 $180' + DEG + '$, 직각 $90' + DEG + '$, 예각 $0' + DEG + '$~$90' + DEG + '$, 둔각 $90' + DEG + '$~$180' + DEG + '$\n- 두 직선이 만나서 생기는 네 각 중 서로 마주 보는 두 각을 **맞꼭지각**이라 하고, **맞꼭지각의 크기는 서로 같아요**.\n- 두 직선이 직각으로 만나면 서로 **수직**($\\perp$), 한 직선이 다른 선분의 중점을 수직으로 지나면 **수직이등분선**',
      },
      {
        title: '위치 관계',
        body: '**평면에서 두 직선**: 한 점에서 만난다 / 평행하다($\\parallel$) / 일치한다\n**공간에서 두 직선**: 위 세 가지 + **꼬인 위치** (만나지도 평행하지도 않음)\n**직선과 평면**: 포함된다 / 한 점에서 만난다 / 평행하다\n직육면체의 모서리로 위치 관계를 생각하면 쉬워요.',
      },
      {
        title: '평행선의 성질',
        body: '두 직선이 다른 한 직선과 만날 때 생기는 각 중\n- 같은 위치에 있는 각: **동위각**\n- 엇갈린 위치에 있는 (안쪽) 각: **엇각**\n두 직선이 **평행하면 동위각, 엇각의 크기가 각각 같아요**. 거꾸로 동위각(또는 엇각)의 크기가 같으면 두 직선은 평행해요.\n같은 쪽 안쪽에 있는 두 각(동측내각)의 합은 $180' + DEG + '$',
      },
    ],
    skills: [
      {
        id: 'count-lines',
        title: '교점·교선과 직선의 개수',
        gen(r, level) {
          if (level === 1) {
            const n = r.int(3, 8);
            const prism = r.chance(0.5);
            const V = prism ? 2 * n : n + 1;
            const E = prism ? 3 * n : 2 * n;
            return {
              q: `${POLY_KO[n]}각${prism ? '기둥' : '뿔'}에서 교점의 개수를 $a$, 교선의 개수를 $b$ 라 할 때, $a + b$ 의 값을 구하세요.`,
              answer: { type: 'num', value: V + E },
              steps: [`교점의 개수 = 꼭짓점의 개수 = $${V}$`, `교선의 개수 = 모서리의 개수 = $${E}$`, `$a + b = ${V + E}$`],
            };
          }
          if (level === 2) {
            const n = r.int(3, 7);
            const kind = r.pick(['직선', '반직선', '선분']);
            const v = kind === '직선' ? 1 : kind === '반직선' ? 2 * (n - 1) : nCr(n, 2);
            return {
              q: `한 직선 위에 서로 다른 $${n}$ 개의 점이 있습니다. 이 중 두 점을 골라 만들 수 있는 서로 다른 **${kind}**의 개수를 구하세요.`,
              answer: { type: 'num', value: v, unit: '개' },
              steps:
                kind === '직선'
                  ? ['모든 점이 한 직선 위에 있으므로 어느 두 점을 골라도 같은 직선입니다.', '$1$ 개']
                  : kind === '반직선'
                    ? ['양 끝 점에서는 한 방향, 가운데 점에서는 양방향으로 서로 다른 반직선이 생깁니다.', `$1 + 1 + 2 \\times ${n - 2} = ${v}$ 개`]
                    : [`두 점을 고르는 방법의 수: $\\frac{${n} \\times ${n - 1}}{2} = ${v}$ 개`],
              hint: '반직선은 시작점과 방향이 같아야 같은 반직선이에요.',
            };
          }
          const n = r.int(5, 9);
          const k = r.int(3, n - 1);
          const v = nCr(n, 2) - nCr(k, 2) + 1;
          return {
            q: `평면 위에 $${n}$ 개의 점이 있고, 이 중 $${k}$ 개의 점만 한 직선 위에 있습니다. 두 점을 지나는 서로 다른 직선의 개수를 구하세요.`,
            answer: { type: 'num', value: v, unit: '개' },
            steps: [`어느 세 점도 한 직선 위에 있지 않다면 $\\frac{${n} \\times ${n - 1}}{2} = ${nCr(n, 2)}$ 개`, `한 직선 위의 $${k}$ 개 점으로 만든 $${nCr(k, 2)}$ 개는 모두 같은 직선 1개`, `$${nCr(n, 2)} - ${nCr(k, 2)} + 1 = ${v}$ 개`],
          };
        },
      },
      {
        id: 'midpoint',
        title: '선분의 중점',
        gen(r, level) {
          const s = new Svg(300, 60);
          const line = (labels: [string, number][]) => {
            s.line(20, 34, 280, 34);
            for (const [t, x] of labels) {
              s.dot(20 + 260 * x, 34);
              s.text(20 + 260 * x, 16, t, { size: 14 });
            }
          };
          if (level === 1) {
            const am = r.int(3, 15);
            const ask = r.pick(['AB', 'AN']);
            line([
              ['A', 0],
              ['M', 0.5],
              ['N', 0.75],
              ['B', 1],
            ]);
            const v = ask === 'AB' ? 2 * am : am + am / 2;
            if (ask === 'AN' && am % 2) return this.gen(r, level);
            return {
              q: `그림에서 점 M 은 $\\overline{AB}$ 의 중점이고, 점 N 은 $\\overline{MB}$ 의 중점입니다. $\\overline{AM} = ${am}$ cm 일 때, $\\overline{${ask}}$ 의 길이를 구하세요.`,
              fig: s.toString(),
              answer: { type: 'num', value: v, unit: 'cm' },
              steps: ask === 'AB' ? [`$\\overline{AB} = 2\\overline{AM} = ${v}$ cm`] : [`$\\overline{MB} = \\overline{AM} = ${am}$ cm, $\\overline{MN} = \\frac{1}{2}\\overline{MB} = ${am / 2}$ cm`, `$\\overline{AN} = ${am} + ${am / 2} = ${v}$ cm`],
            };
          }
          if (level === 2) {
            const ab = r.int(3, 12) * 4;
            line([
              ['A', 0],
              ['N', 0.25],
              ['M', 0.5],
              ['B', 1],
            ]);
            const ask = r.pick(['NB', 'NM', 'NB']);
            const v = ask === 'NB' ? (ab * 3) / 4 : ab / 4;
            return {
              q: `그림에서 점 M 은 $\\overline{AB}$ 의 중점이고, 점 N 은 $\\overline{AM}$ 의 중점입니다. $\\overline{AB} = ${ab}$ cm 일 때, $\\overline{${ask}}$ 의 길이를 구하세요.`,
              fig: s.toString(),
              answer: { type: 'num', value: v, unit: 'cm' },
              steps: [`$\\overline{AM} = \\frac{1}{2} \\times ${ab} = ${ab / 2}$ cm, $\\overline{NM} = \\frac{1}{2} \\times ${ab / 2} = ${ab / 4}$ cm`, ask === 'NB' ? `$\\overline{NB} = \\overline{NM} + \\overline{MB} = ${ab / 4} + ${ab / 2} = ${v}$ cm` : `$\\overline{NM} = ${v}$ cm`],
            };
          }
          const ab = r.int(2, 10) * 2;
          const bc = r.int(2, 10) * 2;
          const ac = ab + bc;
          line([
            ['A', 0],
            ['M', ab / ac / 2],
            ['B', ab / ac],
            ['N', ab / ac + bc / ac / 2],
            ['C', 1],
          ]);
          if (r.chance(0.5)) {
            return {
              q: `세 점 A, B, C 가 이 순서로 한 직선 위에 있고, 점 M, N 은 각각 $\\overline{AB}$, $\\overline{BC}$ 의 중점입니다. $\\overline{AC} = ${ac}$ cm 일 때, $\\overline{MN}$ 의 길이를 구하세요.`,
              fig: s.toString(),
              answer: { type: 'num', value: ac / 2, unit: 'cm' },
              steps: [`$\\overline{MN} = \\overline{MB} + \\overline{BN} = \\frac{1}{2}\\overline{AB} + \\frac{1}{2}\\overline{BC}$`, `$= \\frac{1}{2}\\overline{AC} = ${ac / 2}$ cm`],
              hint: '$\\overline{AB}$, $\\overline{BC}$ 의 길이를 몰라도 구할 수 있어요.',
            };
          }
          return {
            q: `세 점 A, B, C 가 이 순서로 한 직선 위에 있고, 점 M, N 은 각각 $\\overline{AB}$, $\\overline{BC}$ 의 중점입니다. $\\overline{MN} = ${ac / 2}$ cm, $\\overline{AB} = ${ab}$ cm 일 때, $\\overline{NC}$ 의 길이를 구하세요.`,
            fig: s.toString(),
            answer: { type: 'num', value: bc / 2, unit: 'cm' },
            steps: [`$\\overline{AC} = 2\\overline{MN} = ${ac}$ cm`, `$\\overline{BC} = ${ac} - ${ab} = ${bc}$ cm`, `$\\overline{NC} = \\frac{1}{2} \\times ${bc} = ${bc / 2}$ cm`],
          };
        },
      },
      {
        id: 'vertical-angle',
        title: '맞꼭지각',
        gen(r, level) {
          const c: P2 = [150, 100];
          const s = new Svg(300, 200);
          const ray = (d: number) => {
            const a = go(c, d, 95);
            const b = go(c, d + 180, 95);
            s.line(a[0], a[1], b[0], b[1]);
          };
          if (level <= 2) {
            const alpha = r.int(7, 29) * 5;
            const d1 = r.int(-15, 20);
            const d2 = d1 + alpha;
            ray(d1);
            ray(d2);
            if (level === 1) {
              const adj = r.chance(0.5);
              angleMark(s, c, d1, d2, `${alpha}°`);
              angleMark(s, c, adj ? d2 : d1 + 180, adj ? d1 + 180 : d2 + 180, 'x', { cls: 'acc2' });
              const v = adj ? 180 - alpha : alpha;
              return {
                q: '그림과 같이 두 직선이 한 점에서 만날 때, $\\angle x$ 의 크기를 구하세요.',
                fig: s.toString(),
                answer: { type: 'num', value: v, unit: '°' },
                steps: adj ? [`평각은 $180${DEG}$ 이므로 $\\angle x + ${alpha}${DEG} = 180${DEG}$`, `$\\angle x = ${v}${DEG}$`] : [`맞꼭지각의 크기는 같으므로 $\\angle x = ${v}${DEG}$`],
              };
            }
            const x0 = r.int(5, 30);
            const vertical = r.chance(0.6);
            const p = r.int(1, 5);
            let q2 = r.int(1, 5);
            if (p === q2) q2 = p + 1;
            const beta = vertical ? alpha : 180 - alpha;
            const qa = alpha - p * x0;
            const qb = beta - q2 * x0;
            if (Math.abs(qa) > 60 || Math.abs(qb) > 60) return this.gen(r, level);
            const exN = (k: number, t: number) => `${k === 1 ? '' : k}x${t === 0 ? '' : t > 0 ? '+' + t : t}`;
            const ex = (k: number, t: number) => `(${exN(k, t)})°`;
            angleMark(s, c, d1, d2, ex(p, qa));
            if (vertical) angleMark(s, c, d1 + 180, d2 + 180, ex(q2, qb), { cls: 'acc2' });
            else angleMark(s, c, d2, d1 + 180, ex(q2, qb), { cls: 'acc2' });
            return {
              q: '그림과 같이 두 직선이 한 점에서 만날 때, $x$ 의 값을 구하세요.',
              fig: s.toString(),
              answer: { type: 'num', value: x0 },
              steps: vertical
                ? [`맞꼭지각의 크기는 같으므로 $${exN(p, qa)} = ${exN(q2, qb)}$`, `$${p - q2 === 1 ? '' : p - q2 === -1 ? '-' : p - q2}x = ${qb - qa}$, $x = ${x0}$`]
                : [`평각이므로 $(${exN(p, qa)}) + (${exN(q2, qb)}) = 180$`, `$${p + q2}x = ${180 - qa - qb}$, $x = ${x0}$`],
            };
          }
          const a = r.int(6, 14) * 5;
          const b = r.int(6, 14) * 5;
          const x = 180 - a - b;
          if (x < 30) return this.gen(r, level);
          const d1 = r.int(-10, 10);
          const d2 = d1 + a;
          const d3 = d2 + x;
          ray(d1);
          ray(d2);
          ray(d3);
          angleMark(s, c, d1, d2, `${a}°`, { r: 22 });
          angleMark(s, c, d2, d3, 'x', { r: 22, cls: 'acc2' });
          angleMark(s, c, d3 + 180, d1 + 360, `${b}°`, { r: 22 });
          return {
            q: '그림과 같이 세 직선이 한 점에서 만날 때, $\\angle x$ 의 크기를 구하세요.',
            fig: s.toString(),
            answer: { type: 'num', value: x, unit: '°' },
            steps: [`$${b}${DEG}$ 인 각의 맞꼭지각은 $\\angle x$ 옆에 있는 각과 같습니다.`, `평각이므로 $${a}${DEG} + \\angle x + ${b}${DEG} = 180${DEG}$`, `$\\angle x = ${x}${DEG}$`],
            hint: '맞꼭지각을 찾아 한 직선 위에 모아 보세요.',
          };
        },
      },
      {
        id: 'parallel',
        title: '평행선의 성질',
        gen(r, level) {
          const s = new Svg(300, 200);
          const yl = 60;
          const ym = 140;
          s.line(15, yl, 285, yl);
          s.line(15, ym, 285, ym);
          s.text(290, yl - 10, 'l', { size: 14, italic: true });
          s.text(290, ym - 10, 'm', { size: 14, italic: true });
          if (level <= 2) {
            const th = r.int(8, 28) * 5 + (r.chance(0.5) ? 0 : 0);
            if (th === 90) return this.gen(r, level);
            const t = 80 / Math.tan((th * Math.PI) / 180);
            const P: P2 = [150 + t / 2, yl];
            const Q: P2 = [150 - t / 2, ym];
            const e1 = go(P, th, 40);
            const e2 = go(Q, th + 180, 40);
            s.line(e1[0], e1[1], e2[0], e2[1]);
            const sec = (k: number): [number, number] => [[0, th], [th, 180], [180, 180 + th], [180 + th, 360]][k] as [number, number];
            const size = (k: number) => (k % 2 === 0 ? th : 180 - th);
            const rel = r.pick(['동위각', '엇각', '동측내각']);
            let up: number, lo: number;
            if (rel === '동위각') {
              up = r.int(0, 3);
              lo = up;
            } else if (rel === '엇각') {
              up = r.pick([2, 3]);
              lo = up === 2 ? 0 : 1;
            } else {
              up = r.pick([2, 3]);
              lo = up === 2 ? 1 : 0;
            }
            const A = size(up);
            const X = size(lo);
            if (level === 1) {
              angleMark(s, P, ...sec(up), `${A}°`, { r: 18 });
              angleMark(s, Q, ...sec(lo), 'x', { r: 18, cls: 'acc2' });
              return {
                q: '그림에서 $l \\parallel m$ 일 때, $\\angle x$ 의 크기를 구하세요.',
                fig: s.toString(),
                answer: { type: 'num', value: X, unit: '°' },
                steps:
                  rel === '동측내각'
                    ? [`$${A}${DEG}$ 의 엇각(또는 동위각)과 $\\angle x$ 는 평각을 이룹니다.`, `$\\angle x = 180${DEG} - ${A}${DEG} = ${X}${DEG}$`]
                    : [`$l \\parallel m$ 이므로 ${rel}의 크기는 같습니다.`, `$\\angle x = ${X}${DEG}$`],
              };
            }
            const x0 = r.int(5, 25);
            const p = r.int(2, 5);
            let q = r.int(1, 4);
            if (q === p) q = p - 1;
            const ca = A - p * x0;
            const cb = X - q * x0;
            if (Math.abs(ca) > 70 || Math.abs(cb) > 70) return this.gen(r, level);
            const ex = (k: number, c: number) => `${k === 1 ? '' : k}x${c === 0 ? '' : c > 0 ? '+' + c : c}`;
            angleMark(s, P, ...sec(up), `(${ex(p, ca)})°`, { r: 18, lr: 40 });
            angleMark(s, Q, ...sec(lo), `(${ex(q, cb)})°`, { r: 18, lr: 40, cls: 'acc2' });
            return {
              q: '그림에서 $l \\parallel m$ 일 때, $x$ 의 값을 구하세요.',
              fig: s.toString(),
              answer: { type: 'num', value: x0 },
              steps:
                rel === '동측내각'
                  ? [`두 각의 합이 $180${DEG}$ 이므로 $(${ex(p, ca)}) + (${ex(q, cb)}) = 180$`, `$${p + q}x = ${180 - ca - cb}$, $x = ${x0}$`]
                  : [`${rel}의 크기가 같으므로 $${ex(p, ca)} = ${ex(q, cb)}$`, p - q === 1 ? `$x = ${x0}$` : `$${p - q}x = ${cb - ca}$, $x = ${x0}$`],
            };
          }
          const a = r.int(5, 13) * 5;
          const b = r.int(5, 13) * 5;
          const P: P2 = [210, 100];
          const A: P2 = [P[0] - 40 / Math.tan((a * Math.PI) / 180), yl];
          const B: P2 = [P[0] - 40 / Math.tan((b * Math.PI) / 180), ym];
          s.line(A[0] - 40, A[1] + 40 * Math.tan((a * Math.PI) / 180) * 0, A[0], A[1]);
          s.line(A[0], A[1], P[0], P[1], { cls: 'acc' });
          s.line(B[0], B[1], P[0], P[1], { cls: 'acc' });
          s.line(P[0], P[1], 285, P[1], { dash: true, cls: 'muted' });
          angleMark(s, A, -a, 0, `${a}°`, { r: 20, lr: 32 });
          angleMark(s, B, 0, b, `${b}°`, { r: 20, lr: 32 });
          angleMark(s, P, 180 - a, 180 + b, 'x', { r: 18, lr: 30, cls: 'acc2' });
          return {
            q: '그림에서 $l \\parallel m$ 일 때, $\\angle x$ 의 크기를 구하세요.',
            fig: s.toString(),
            answer: { type: 'num', value: a + b, unit: '°' },
            steps: ['꺾인 점을 지나고 직선 $l$, $m$ 에 평행한 보조선을 긋습니다.', `엇각의 성질에 의해 $\\angle x$ 는 $${a}${DEG}$ 와 $${b}${DEG}$ 로 나누어집니다.`, `$\\angle x = ${a}${DEG} + ${b}${DEG} = ${a + b}${DEG}$`],
            hint: '꺾인 점에서 평행선을 하나 더 그어 보세요.',
          };
        },
      },
      {
        id: 'position',
        title: '공간에서의 위치 관계',
        gen(r, level) {
          const S = level === 3 && r.chance(0.7) ? triPrism(4, 3, 3) : cuboid(4, 3, 2.4);
          const fig = solidFig(S);
          const useFace = level === 2 && r.chance(0.5);
          if (useFace) {
            const fname = r.pick(Object.keys(S.faces));
            const f = S.faces[fname].split('').map((c) => S.v[c]);
            const kind = r.pick(['parallel', 'perp'] as const);
            const list = S.edges.filter((e) => edgeFace(S.v[e[0]], S.v[e[1]], f) === kind);
            const txt = kind === 'parallel' ? '평행한' : '수직인';
            return {
              q: `그림의 ${S.name}에서 면 ${fname} 와 ${txt} 모서리의 개수를 구하세요.`,
              fig,
              answer: { type: 'num', value: list.length, unit: '개' },
              steps: [`면 ${fname} 와 ${txt} 모서리: ${list.map((e) => `$\\overline{${e}}$`).join(', ')}`, `$${list.length}$ 개`],
            };
          }
          const e = r.pick(S.edges);
          if (level >= 2 && r.chance(0.35)) {
            const fname = r.pick(Object.keys(S.faces));
            const f = S.faces[fname].split('').map((c) => S.v[c]);
            const list = S.edges.filter((o) => o !== e && edgeRel(S.v[e[0]], S.v[e[1]], S.v[o[0]], S.v[o[1]]) === 'skew' && edgeFace(S.v[o[0]], S.v[o[1]], f) === 'parallel');
            const skew = S.edges.filter((o) => o !== e && edgeRel(S.v[e[0]], S.v[e[1]], S.v[o[0]], S.v[o[1]]) === 'skew');
            return {
              q: `그림의 ${S.name}에서 모서리 ${e} 와 꼬인 위치에 있으면서 면 ${fname} 와 평행한 모서리의 개수를 구하세요.`,
              fig,
              answer: { type: 'num', value: list.length, unit: '개' },
              steps: [`모서리 ${e} 와 꼬인 위치: ${skew.map((x) => `$\\overline{${x}}$`).join(', ') || '없음'}`, `이 중 면 ${fname} 와 평행한 것: ${list.map((x) => `$\\overline{${x}}$`).join(', ') || '없음'}`, `$${list.length}$ 개`],
            };
          }
          const kinds = level === 1 ? (['parallel', 'meet'] as const) : (['skew', 'parallel', 'meet', 'skew'] as const);
          const kind = r.pick(kinds);
          const list = S.edges.filter((o) => o !== e && edgeRel(S.v[e[0]], S.v[e[1]], S.v[o[0]], S.v[o[1]]) === kind);
          const txt = kind === 'parallel' ? '평행한' : kind === 'skew' ? '꼬인 위치에 있는' : S.name === '직육면체' ? '수직으로 만나는' : '한 점에서 만나는';
          return {
            q: `그림의 ${S.name}에서 모서리 ${e} 와 ${txt} 모서리의 개수를 구하세요.`,
            fig,
            answer: { type: 'num', value: list.length, unit: '개' },
            steps: [
              ...(kind === 'skew' ? [`모서리 ${e} 와 만나지도 않고 평행하지도 않은 모서리를 찾습니다.`] : []),
              `${list.map((x) => `$\\overline{${x}}$`).join(', ')}`,
              `$${list.length}$ 개`,
            ],
            hint: kind === 'skew' ? '평행한 모서리와 만나는 모서리를 먼저 빼 보세요.' : undefined,
          };
        },
      },
    ],
  },

  // ═══════════════ m1b-2 작도와 합동 ═══════════════
  'm1b-2': {
    concepts: [
      {
        title: '작도',
        body: '**눈금 없는 자와 컴퍼스만** 사용하여 도형을 그리는 것을 작도라고 해요.\n- 눈금 없는 자: 두 점을 연결하는 선분을 긋거나 선분을 연장할 때\n- 컴퍼스: 원을 그리거나 **선분의 길이를 재어 옮길 때**\n작도로 길이가 같은 선분, 크기가 같은 각, 평행선(동위각·엇각 이용)을 그릴 수 있어요.',
      },
      {
        title: '삼각형의 세 변의 길이 사이의 관계',
        body: '삼각형에서 **한 변의 길이는 나머지 두 변의 길이의 합보다 작아요**.\n세 변의 길이가 주어졌을 때는 **(가장 긴 변) < (나머지 두 변의 합)** 만 확인하면 돼요.\n예: $3, 4, 8$ → $8 > 3 + 4$ 이므로 삼각형을 만들 수 없어요.',
      },
      {
        title: '삼각형이 하나로 정해지는 조건',
        body: '- 세 변의 길이가 주어질 때\n- 두 변의 길이와 그 **끼인각**의 크기가 주어질 때\n- 한 변의 길이와 그 **양 끝 각**의 크기가 주어질 때\n**하나로 정해지지 않는 경우**: 세 각의 크기만 주어질 때(모양만 같은 삼각형이 무수히 많음), 두 변과 끼인각이 아닌 각이 주어질 때, 가장 긴 변이 나머지 합보다 길거나 같을 때, 두 각의 합이 $180' + DEG + '$ 이상일 때',
      },
      {
        title: '도형의 합동',
        body: '모양과 크기가 같아서 완전히 포개어지는 두 도형을 **합동**이라 하고 $\\triangle ABC \\equiv \\triangle DEF$ 처럼 **대응하는 꼭짓점 순서대로** 써요.\n합동인 두 도형에서 **대응변의 길이와 대응각의 크기는 각각 같아요**.',
      },
      {
        title: '삼각형의 합동 조건',
        body: '- **SSS 합동**: 세 쌍의 대응변의 길이가 각각 같을 때\n- **SAS 합동**: 두 쌍의 대응변의 길이와 그 끼인각의 크기가 각각 같을 때\n- **ASA 합동**: 한 쌍의 대응변의 길이와 그 양 끝 각의 크기가 각각 같을 때\n두 각이 같으면 나머지 한 각도 같아요(삼각형 내각의 합 $180' + DEG + '$). 그래서 "한 변과 두 각"이 같으면 ASA 합동이에요.',
      },
    ],
    skills: [
      {
        id: 'construct',
        title: '작도의 뜻과 도구',
        gen(r, level) {
          const T1 = ['작도할 때는 눈금 없는 자와 컴퍼스만 사용한다.', '눈금 없는 자는 두 점을 연결하는 선분을 그릴 때 사용한다.', '컴퍼스는 원을 그릴 때 사용한다.', '컴퍼스는 선분의 길이를 재어 다른 곳으로 옮길 때 사용한다.', '눈금 없는 자는 선분을 연장할 때 사용한다.'];
          const F1 = ['작도할 때 선분의 길이는 자의 눈금으로 잰다.', '작도할 때 각의 크기는 각도기로 잰다.', '컴퍼스는 두 점을 연결하는 선분을 그릴 때 사용한다.', '눈금 없는 자로 선분의 길이를 다른 직선 위로 옮긴다.'];
          const T2 = ['크기가 같은 각의 작도를 이용하여 평행선을 작도할 수 있다.', '평행선의 작도에는 동위각 또는 엇각의 크기가 같으면 두 직선이 평행하다는 성질을 이용한다.', '세 변의 길이가 주어지면 (가장 긴 변이 나머지 두 변의 합보다 짧을 때) 삼각형을 하나로 작도할 수 있다.', '두 변의 길이와 그 끼인각의 크기가 주어지면 삼각형을 하나로 작도할 수 있다.'];
          const F2 = ['세 각의 크기가 주어지면 삼각형을 하나로 작도할 수 있다.', '두 변의 길이와 한 각의 크기가 주어지면 항상 삼각형을 하나로 작도할 수 있다.', '세 변의 길이가 각각 3 cm, 4 cm, 7 cm 인 삼각형을 작도할 수 있다.', '평행선의 작도에는 맞꼭지각의 크기가 같다는 성질만 이용한다.'];
          const T = level === 1 ? T1 : [...T1, ...T2];
          const Fs = level === 1 ? F1 : level === 2 ? [...F1, ...F2] : F2.concat(F1.slice(0, 2));
          const wantTrue = r.chance(0.5);
          const ans = r.pick(wantTrue ? T : Fs);
          const wr = r.sample(wantTrue ? Fs : T, 4);
          return {
            q: `작도에 대한 설명으로 ${wantTrue ? '**옳은** 것' : '**옳지 않은** 것'}은?`,
            answer: textChoices(r, ans, wr),
            steps: wantTrue ? [`옳은 것: ${ans}`, '작도에는 눈금 없는 자와 컴퍼스만 사용해요.'] : [`옳지 않은 것: ${ans}`, '작도에는 눈금 없는 자와 컴퍼스만 사용하고, 삼각형은 세 변 / 두 변과 끼인각 / 한 변과 양 끝 각이 주어질 때 하나로 정해져요.'],
          };
        },
      },
      {
        id: 'triangle-sides',
        title: '삼각형의 세 변의 길이',
        gen(r, level) {
          if (level === 1) {
            const ok = () => {
              for (;;) {
                const t = [r.int(2, 12), r.int(2, 12), r.int(2, 12)].sort((a, b) => a - b);
                if (t[2] < t[0] + t[1]) return t;
              }
            };
            const bad = () => {
              const a = r.int(2, 7);
              const b = r.int(2, 7);
              return [a, b, a + b + r.int(0, 3)].sort((x, y) => x - y);
            };
            const fmt = (t: number[]) => t.map((x) => `$${x}$ cm`).join(', ');
            const wantBad = r.chance(0.6);
            const ans = wantBad ? bad() : ok();
            const wr = Array.from({ length: 6 }, () => fmt(wantBad ? ok() : bad()));
            return {
              q: `다음 중 삼각형의 세 변의 길이가 될 수 ${wantBad ? '**없는**' : '**있는**'} 것은?`,
              answer: textChoices(r, fmt(ans), wr),
              steps: ['(가장 긴 변의 길이) < (나머지 두 변의 길이의 합) 인지 확인합니다.', `$${ans[2]} ${ans[2] < ans[0] + ans[1] ? '<' : '\\ge'} ${ans[0]} + ${ans[1]} = ${ans[0] + ans[1]}$`],
            };
          }
          if (level === 2) {
            const a = r.int(3, 12);
            let b = r.int(3, 12);
            if (a === b) b++;
            const lo = Math.abs(a - b);
            const hi = a + b;
            const cnt = hi - lo - 1;
            return {
              q: `세 변의 길이가 $${a}$ cm, $${b}$ cm, $x$ cm 인 삼각형이 있습니다. $x$ 가 될 수 있는 자연수의 개수를 구하세요.`,
              answer: { type: 'num', value: cnt, unit: '개' },
              steps: [`두 변의 차 < $x$ < 두 변의 합: $${lo} < x < ${hi}$`, `자연수 $x$ 는 $${lo + 1}$ 부터 $${hi - 1}$ 까지 $${cnt}$ 개`],
              hint: '$x$ 가 가장 긴 변일 때와 아닐 때를 모두 생각하세요.',
            };
          }
          const sticks = r.sample([2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 5).sort((a, b) => a - b);
          const ok: string[] = [];
          for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) for (let k = j + 1; k < 5; k++) if (sticks[k] < sticks[i] + sticks[j]) ok.push(`(${sticks[i]}, ${sticks[j]}, ${sticks[k]})`);
          if (ok.length === 0) return this.gen(r, level);
          return {
            q: `길이가 각각 $${sticks.join('$ cm, $')}$ cm 인 막대 5개 중 3개를 골라 삼각형을 만들려고 합니다. 만들 수 있는 서로 다른 삼각형의 개수를 구하세요.`,
            answer: { type: 'num', value: ok.length, unit: '개' },
            steps: ['세 막대 중 가장 긴 것이 나머지 두 개의 합보다 짧아야 합니다.', `가능한 경우: $${ok.join(', ')}$`, `$${ok.length}$ 개`],
          };
        },
      },
      {
        id: 'determined',
        title: '삼각형이 하나로 정해지는 조건',
        gen(r, level) {
          const seg = (n: string, v: number) => `$\\overline{${n}} = ${v}$`;
          const ang = (n: string, v: number) => `$\\angle ${n} = ${v}${DEG}$`;
          const sides = () => {
            for (;;) {
              const t = [r.int(3, 10), r.int(3, 10), r.int(3, 10)];
              const m = [...t].sort((a, b) => a - b);
              if (m[2] < m[0] + m[1]) return t;
            }
          };
          const mk: Record<string, () => string> = {
            SSS: () => {
              const [a, b, c] = sides();
              return `${seg('AB', a)}, ${seg('BC', b)}, ${seg('CA', c)}`;
            },
            SAS: () => `${seg('AB', r.int(3, 9))}, ${seg('BC', r.int(3, 9))}, ${ang('B', r.int(4, 24) * 5)}`,
            ASA: () => `${seg('BC', r.int(3, 9))}, ${ang('B', r.int(6, 14) * 5)}, ${ang('C', r.int(6, 14) * 5)}`,
            AAS: () => `${seg('AB', r.int(3, 9))}, ${ang('A', r.int(6, 14) * 5)}, ${ang('C', r.int(6, 14) * 5)}`,
            SSSbad: () => {
              const a = r.int(2, 6);
              const b = r.int(2, 6);
              return `${seg('AB', a)}, ${seg('BC', b)}, ${seg('CA', a + b + r.int(0, 2))}`;
            },
            SSA: () => {
              // 두 삼각형이 생기는 경우: AB·sinA < BC < AB
              const [ab, A, bc] = ssa(r);
              return `${seg('AB', ab)}, ${seg('BC', bc)}, ${ang('A', A)}`;
            },
            AAA: () => {
              const a = r.int(6, 14) * 5;
              const b = r.int(6, 14) * 5;
              return `${ang('A', a)}, ${ang('B', b)}, ${ang('C', 180 - a - b)}`;
            },
            ASAbad: () => {
              const a = r.int(14, 24) * 5;
              return `${seg('BC', r.int(3, 9))}, ${ang('B', a)}, ${ang('C', 180 - a + r.int(0, 4) * 5)}`;
            },
          };
          const good = level === 1 ? ['SSS', 'SAS', 'ASA'] : ['SSS', 'SAS', 'ASA', 'AAS'];
          const bad = level === 1 ? ['SSSbad', 'AAA', 'SSA'] : level === 2 ? ['SSA', 'AAA', 'SSSbad'] : ['SSA', 'AAA', 'SSSbad', 'ASAbad'];
          const wantGood = level === 2 ? false : level === 1 ? true : r.chance(0.5);
          const ansKind = r.pick(wantGood ? good : bad);
          const ans = mk[ansKind]();
          const pool = wantGood ? bad : good;
          const wr = Array.from({ length: 8 }, (_, i) => mk[pool[i % pool.length]]());
          const why: Record<string, string> = {
            SSS: '세 변의 길이가 주어지고 가장 긴 변이 나머지 두 변의 합보다 짧으므로 하나로 정해집니다.',
            SAS: '두 변과 그 끼인각이 주어졌으므로 하나로 정해집니다.',
            ASA: '한 변과 그 양 끝 각이 주어졌으므로 하나로 정해집니다.',
            AAS: '두 각을 알면 나머지 한 각도 알 수 있으므로 한 변과 양 끝 각이 주어진 것과 같아 하나로 정해집니다.',
            SSSbad: '가장 긴 변이 나머지 두 변의 합보다 짧지 않으므로 삼각형이 만들어지지 않습니다.',
            SSA: '$\\angle A$ 는 두 변 $\\overline{AB}$, $\\overline{BC}$ 의 끼인각이 아니므로 하나로 정해지지 않습니다.',
            AAA: '세 각의 크기만 주어지면 모양이 같고 크기가 다른 삼각형이 무수히 많습니다.',
            ASAbad: '두 각의 크기의 합이 $180' + DEG + '$ 이상이므로 삼각형이 만들어지지 않습니다.',
          };
          return {
            q: `다음 중 $\\triangle ABC$ 가 하나로 ${wantGood ? '**정해지는**' : '**정해지지 않는**'} 것은? (길이의 단위는 cm)`,
            answer: textChoices(r, ans, wr),
            steps: [ans, why[ansKind]],
            hint: '세 변 / 두 변과 끼인각 / 한 변과 양 끝 각',
          };
        },
      },
      {
        id: 'congruent',
        title: '합동인 도형의 성질',
        gen(r, level) {
          const A = r.int(9, 18) * 5;
          const B = r.int(8, 15) * 5;
          const C = 180 - A - B;
          if (C < 30) return this.gen(r, level);
          const s = new Svg(340, 160);
          const t1 = triPts(A, B, C, 18, 22, 120, 108);
          const t2raw = triPts(A, B, C, 200, 22, 120, 108);
          // 두 번째는 좌우 뒤집기
          const t2 = t2raw.map(([x, y]) => [520 - x, y] as P2) as [P2, P2, P2];
          s.poly(t1, { cls: 'acc' });
          s.poly(t2, { cls: 'acc2' });
          vLabels(s, t1, ['A', 'B', 'C']);
          vLabels(s, t2, ['D', 'E', 'F']);
          const ab = r.int(4, 12);
          const bc = r.int(4, 12);
          const fig = s.toString();
          if (level === 1) {
            const ask = r.pick(['DE', 'EF']);
            return {
              q: `그림에서 $\\triangle ABC \\equiv \\triangle DEF$ 이고 $\\overline{AB} = ${ab}$ cm, $\\overline{BC} = ${bc}$ cm 일 때, $\\overline{${ask}}$ 의 길이를 구하세요.`,
              fig,
              answer: { type: 'num', value: ask === 'DE' ? ab : bc, unit: 'cm' },
              steps: [`$\\overline{${ask}}$ 의 대응변은 $\\overline{${ask === 'DE' ? 'AB' : 'BC'}}$`, `$\\overline{${ask}} = ${ask === 'DE' ? ab : bc}$ cm`],
            };
          }
          if (level === 2) {
            return {
              q: `그림에서 $\\triangle ABC \\equiv \\triangle DEF$ 이고 $\\angle A = ${A}${DEG}$, $\\angle E = ${B}${DEG}$ 일 때, $\\angle F$ 의 크기를 구하세요.`,
              fig,
              answer: { type: 'num', value: C, unit: '°' },
              steps: [`$\\angle D = \\angle A = ${A}${DEG}$`, `$\\angle F = 180${DEG} - (${A}${DEG} + ${B}${DEG}) = ${C}${DEG}$`],
            };
          }
          const x = r.int(2, 9);
          const p = r.int(2, 4);
          const q = r.int(1, 9);
          const de = p * x - q;
          if (de <= 2) return this.gen(r, level);
          const k = r.int(2, 9);
          const rem = C % k;
          const y = (C - rem) / k;
          const fx = `${k}y${rem ? '+' + rem : ''}`;
          return {
            q: `그림에서 $\\triangle ABC \\equiv \\triangle DEF$ 이고 $\\overline{AB} = ${de}$ cm, $\\overline{DE} = (${p}x - ${q})$ cm, $\\angle C = ${C}${DEG}$, $\\angle F = (${fx})${DEG}$ 일 때, $x + y$ 의 값을 구하세요.`,
            fig,
            answer: { type: 'num', value: x + y },
            steps: [`대응변: $${p}x - ${q} = ${de}$ 에서 $x = ${x}$`, `대응각: $${fx} = ${C}$ 에서 $y = ${y}$`, `$x + y = ${x + y}$`],
          };
        },
      },
      {
        id: 'congruence-condition',
        title: '삼각형의 합동 조건',
        gen(r, level): ProblemDraft {
          const OPTS = ['SSS 합동', 'SAS 합동', 'ASA 합동', '합동이라고 할 수 없다'];
          const choose = (ans: string) =>
            textChoices(
              r,
              ans,
              OPTS.filter((o) => o !== ans),
              4,
            );
          if (level <= 2) {
            const kind = r.pick(['SSS', 'SAS', 'ASA', 'NO1', 'NO2']);
            const order = r.shuffle([0, 1, 2]);
            const L1 = ['A', 'B', 'C'];
            const L2 = ['D', 'E', 'F'];
            const sideOf = (i: number) => [`${L1[i]}${L1[(i + 1) % 3]}`, `${L2[i]}${L2[(i + 1) % 3]}`]; // 변 i: i, i+1
            const conds: string[] = [];
            const num = level === 2;
            const val = () => r.int(3, 12);
            const sideC = (i: number, fixed?: number) => {
              const [a, b] = sideOf(i);
              const v = fixed ?? val();
              return num ? `$\\overline{${a}} = \\overline{${b}} = ${v}$ cm` : `$\\overline{${a}} = \\overline{${b}}$`;
            };
            const angC = (i: number, fixed?: number) => {
              const v = fixed ?? r.int(6, 20) * 5;
              return num ? `$\\angle ${L1[i]} = \\angle ${L2[i]} = ${v}${DEG}$` : `$\\angle ${L1[i]} = \\angle ${L2[i]}$`;
            };
            const i = order[0];
            // 수치를 줄 때는 실제로 존재하는 삼각형이 되도록: 세 변은 삼각형의 조건, 세 각은 합이 180°
            let tri = [3, 4, 5];
            for (;;) {
              tri = [val(), val(), val()];
              const m = [...tri].sort((a, b) => a - b);
              if (m[2] < m[0] + m[1]) break;
            }
            const A1 = r.int(6, 16) * 5;
            const A2 = r.int(6, Math.min(20, 30 - A1 / 5)) * 5; // A1 + A2 ≤ 150
            const angs = [A1, A2, 180 - A1 - A2];
            let ans: string;
            if (kind === 'SSS') {
              conds.push(sideC(0, tri[0]), sideC(1, tri[1]), sideC(2, tri[2]));
              ans = OPTS[0];
            } else if (kind === 'SAS') {
              // 변 i-1, i 와 끼인각 i (꼭짓점 i 는 변 i-1 과 변 i 의 공통점)
              conds.push(sideC((i + 2) % 3), angC(i), sideC(i));
              ans = OPTS[1];
            } else if (kind === 'ASA') {
              conds.push(angC(i, angs[0]), sideC(i), angC((i + 1) % 3, angs[1]));
              ans = OPTS[2];
            } else if (kind === 'NO1') {
              // 끼인각이 아닌 각: 수치가 있으면 실제로 두 삼각형이 생기도록 (인접변·sinA < 대변 < 인접변)
              const [ab, A, bc] = ssa(r);
              conds.push(sideC(i, ab), sideC((i + 1) % 3, bc), angC(i, A));
              ans = OPTS[3];
            } else {
              conds.push(angC(0, angs[0]), angC(1, angs[1]), angC(2, angs[2]));
              ans = OPTS[3];
            }
            const cs = r.shuffle(conds);
            return {
              q: `$\\triangle ABC$ 와 $\\triangle DEF$ 에서 ${cs.join(', ')} 일 때, 두 삼각형은 어떤 합동 조건을 만족하는지 고르세요.`,
              answer: choose(ans),
              steps: [
                kind === 'SSS' ? '세 쌍의 대응변의 길이가 각각 같습니다.' : kind === 'SAS' ? '두 쌍의 대응변과 그 끼인각이 각각 같습니다.' : kind === 'ASA' ? '한 쌍의 대응변과 그 양 끝 각이 각각 같습니다.' : kind === 'NO1' ? '주어진 각이 두 변의 끼인각이 아니므로 합동이라고 할 수 없습니다.' : '세 각이 같아도 크기가 다를 수 있으므로 합동이라고 할 수 없습니다.',
                ans,
              ],
            };
          }
          const t = r.int(0, 3);
          const [P, Q] = r.pick([
            ['A', 'B'],
            ['P', 'Q'],
          ]);
          if (t === 0) {
            return {
              q: `두 선분 AB 와 CD 가 점 O 에서 만나고 $\\overline{OA} = \\overline{OB}$, $\\overline{OC} = \\overline{OD}$ 입니다. $\\triangle AOC \\equiv \\triangle BOD$ 일 때 이용된 합동 조건은?`,
              answer: choose(OPTS[1]),
              steps: ['$\\overline{OA} = \\overline{OB}$, $\\overline{OC} = \\overline{OD}$', '$\\angle AOC = \\angle BOD$ (맞꼭지각)', '두 변과 그 끼인각이 같으므로 SAS 합동'],
            };
          }
          if (t === 1) {
            return {
              q: `사각형 ABCD 에서 $\\overline{AB} = \\overline{AD}$, $\\overline{BC} = \\overline{DC}$ 입니다. 대각선 AC 를 그었을 때 $\\triangle ABC \\equiv \\triangle ADC$ 임을 보이는 합동 조건은?`,
              answer: choose(OPTS[0]),
              steps: ['$\\overline{AB} = \\overline{AD}$, $\\overline{BC} = \\overline{DC}$', '$\\overline{AC}$ 는 공통', '세 변이 같으므로 SSS 합동'],
            };
          }
          if (t === 2) {
            return {
              q: `두 선분 AD 와 BC 가 점 M 에서 만나고, 점 M 은 $\\overline{BC}$ 의 중점이며 $\\overline{AB} \\parallel \\overline{CD}$ 입니다. $\\triangle ABM \\equiv \\triangle DCM$ 임을 보이는 합동 조건은?`,
              answer: choose(OPTS[2]),
              steps: ['$\\overline{BM} = \\overline{CM}$ (중점)', '$\\angle ABM = \\angle DCM$ (엇각), $\\angle AMB = \\angle DMC$ (맞꼭지각)', '한 변과 그 양 끝 각이 같으므로 ASA 합동'],
            };
          }
          return {
            q: `$\\angle XOY$ 의 이등분선 위의 한 점 ${P} 에서 두 변 OX, OY 에 내린 수선의 발을 각각 ${Q}, R 이라 할 때, $\\triangle ${P}O${Q} \\equiv \\triangle ${P}OR$ 임을 보이는 합동 조건은?`,
            answer: choose(OPTS[2]),
            steps: [`$\\angle ${P}O${Q} = \\angle ${P}OR$, $\\angle O${Q}${P} = \\angle OR${P} = 90${DEG}$ 이므로 $\\angle O${P}${Q} = \\angle O${P}R$`, `$\\overline{O${P}}$ 는 공통`, '한 변과 그 양 끝 각이 같으므로 ASA 합동'],
          };
        },
      },
    ],
  },
};

