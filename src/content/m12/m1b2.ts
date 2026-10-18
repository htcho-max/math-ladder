// 중1-2 (뒤): 평면도형의 성질 / 입체도형의 성질 / 자료의 정리와 해석
import type { ContentMap } from '../../core/types';
import type { Rng } from '../../core/rng';
import { F } from '../../core/frac';
import { round } from '../../core/nt';
import { dec } from '../../core/tex';
import { Svg, barChart, regularPolygon } from '../../core/fig';
import { NAMES, piTex, sum, texChoices, textChoices } from './util';
import { type P2, angleMark, dirOf, go, triPts, vLabels } from './geo';
import { lastSound } from './josa';

const DEG = '^{\\circ}';
const POLY_KO = ['', '', '', '삼', '사', '오', '육', '칠', '팔', '구', '십', '십일', '십이', '십삼', '십사', '십오', '십육', '십칠', '십팔', '십구', '이십'];
const pk = (n: number) => (n <= 20 ? `${POLY_KO[n]}각형` : `$${n}$각형`);

/** 볼록 다각형(정다각형을 살짝 흔든 모양)과 실제 내각 */
function wobblyPolygon(r: Rng, n: number, cx: number, cy: number, R: number): { pts: P2[]; ang: number[] } {
  for (;;) {
    const base = regularPolygon(n, cx, cy, R, -90 + r.int(-10, 10));
    const pts = base.map(([x, y]) => {
      const k = 0.8 + r.next() * 0.32;
      return [cx + (x - cx) * k, cy + (y - cy) * k] as P2;
    });
    const ang = pts.map((p, i) => {
      const a = pts[(i + n - 1) % n];
      const b = pts[(i + 1) % n];
      const u = [a[0] - p[0], a[1] - p[1]];
      const v = [b[0] - p[0], b[1] - p[1]];
      return (Math.acos((u[0] * v[0] + u[1] * v[1]) / (Math.hypot(u[0], u[1]) * Math.hypot(v[0], v[1]))) * 180) / Math.PI;
    });
    if (Math.abs(sum(ang) - 180 * (n - 2)) < 0.5 && ang.every((a) => a > 65 && a < 168)) return { pts, ang };
  }
}
/** 다각형 꼭짓점 i 의 내각 표시 */
function innerMark(s: Svg, pts: P2[], i: number, label: string, cls = 'acc') {
  const n = pts.length;
  const p = pts[i];
  const d1 = dirOf(p, pts[(i + 1) % n]);
  const d2 = dirOf(p, pts[(i + n - 1) % n]);
  let sw = d2 - d1;
  while (sw < 0) sw += 360;
  if (sw < 180) angleMark(s, p, d1, d2, label, { r: 14, lr: 30, cls });
  else angleMark(s, p, d2, d1, label, { r: 14, lr: 30, cls });
}

function median(a: number[]): number {
  const b = [...a].sort((x, y) => x - y);
  const n = b.length;
  return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2;
}

function stemLeaf(data: number[]): string[][] {
  const stems = [...new Set(data.map((x) => Math.floor(x / 10)))].sort((a, b) => a - b);
  const rows: string[][] = [['줄기', '잎']];
  for (let s = stems[0]; s <= stems[stems.length - 1]; s++) {
    const leaves = data
      .filter((x) => Math.floor(x / 10) === s)
      .map((x) => x % 10)
      .sort((a, b) => a - b);
    rows.push([String(s), leaves.length ? leaves.join('  ') : '-']);
  }
  return rows;
}

/** 합이 N 인 도수 k개 (봉우리 모양) */
function freqs(r: Rng, k: number, N: number): number[] {
  for (;;) {
    const peak = r.int(1, k - 2);
    const w = Array.from({ length: k }, (_, i) => Math.max(1, 6 - 2 * Math.abs(i - peak) + r.int(-1, 2)));
    const tot = sum(w);
    const f = w.map((x) => Math.max(1, Math.round((x * N) / tot)));
    const diff = N - sum(f);
    f[peak] += diff;
    if (f.every((x) => x >= 1) && new Set(f).size >= 3) {
      const mx = Math.max(...f);
      if (f.filter((x) => x === mx).length === 1) return f;
    }
  }
}

/** 부채꼴 그림 (중심각 th, 반지름 라벨), inner: 안쪽 반지름 비율(도넛 모양) */
function sectorFig(th: number, label: string, inner?: number, innerLabel?: string): string {
  const s = new Svg(220, 190);
  const R = 80;
  const c: P2 = th <= 180 ? [110, 150] : [110, 100];
  const a1 = 90 - th / 2;
  const a2 = a1 + th;
  s.arc(c[0], c[1], R, a1, a2, { sector: true, cls: 'acc' });
  const p1 = go(c, a1, R);
  const p2 = go(c, a2, R);
  s.line(c[0], c[1], p1[0], p1[1]);
  s.line(c[0], c[1], p2[0], p2[1]);
  if (inner) s.arc(c[0], c[1], R * inner, a1, a2, { cls: 'acc2' });
  angleMark(s, c, a1, a2, `${th}°`, { r: 14, lr: th < 60 ? 34 : 26 });
  const q = go(c, a1, R * 0.62);
  const off = go([0, 0], a1 - 90, 12);
  s.text(q[0] + off[0], q[1] + off[1], label, { size: 12 });
  if (inner && innerLabel) {
    const q2 = go(c, a2, R * inner * 0.55);
    const off2 = go([0, 0], a2 + 90, 12);
    s.text(q2[0] + off2[0], q2[1] + off2[1], innerLabel, { size: 12 });
  }
  return s.toString();
}

export const m1b2: ContentMap = {
  // ═══════════════ m1b-3 평면도형의 성질 ═══════════════
  'm1b-3': {
    concepts: [
      {
        title: '다각형과 대각선',
        body: '선분으로만 둘러싸인 평면도형이 다각형이에요. 변의 길이와 내각의 크기가 모두 같으면 **정다각형**.\n- $n$각형의 한 꼭짓점에서 그을 수 있는 대각선: $n - 3$ 개\n- $n$각형의 대각선의 총 개수: $\\dfrac{n(n-3)}{2}$ 개\n(한 대각선을 양 끝에서 두 번 세었으므로 2로 나눠요.)',
      },
      {
        title: '삼각형의 내각과 외각',
        body: '- 삼각형의 세 내각의 크기의 합은 $180' + DEG + '$\n- 한 꼭짓점에서 (내각) + (외각) = $180' + DEG + '$\n- **삼각형의 한 외각의 크기는 그와 이웃하지 않는 두 내각의 크기의 합과 같아요.**\n$$\\angle ACD = \\angle A + \\angle B$$',
      },
      {
        title: '다각형의 내각과 외각의 합',
        body: '$n$각형은 한 꼭짓점에서 대각선을 그어 $(n-2)$ 개의 삼각형으로 나눌 수 있어요.\n- 내각의 크기의 합: $180' + DEG + ' \\times (n-2)$\n- **외각의 크기의 합은 항상 $360' + DEG + '$**\n- 정$n$각형의 한 내각: $\\dfrac{180' + DEG + '(n-2)}{n}$, 한 외각: $\\dfrac{360' + DEG + '}{n}$',
      },
      {
        title: '원과 부채꼴',
        body: '- **호**: 원 위의 두 점 사이의 원의 일부, **현**: 원 위의 두 점을 이은 선분\n- **부채꼴**: 두 반지름과 호로 이루어진 도형, 두 반지름이 이루는 각이 **중심각**\n- 한 원에서 **부채꼴의 호의 길이와 넓이는 중심각의 크기에 정비례**해요. (현의 길이는 정비례하지 않아요!)',
      },
      {
        title: '부채꼴의 호의 길이와 넓이',
        body: '반지름 $r$, 중심각 $x' + DEG + '$ 인 부채꼴에서 (원주율은 $\\pi$)\n$$l = 2\\pi r \\times \\frac{x}{360}, \\quad S = \\pi r^{2} \\times \\frac{x}{360}$$\n호의 길이 $l$ 을 알면 $S = \\dfrac{1}{2} r l$ 로도 넓이를 구할 수 있어요.\n초등학교의 원주율 3.14 대신 중학교에서는 기호 $\\pi$ 를 써요.',
        example: { q: '반지름 6 cm, 중심각 60° 인 부채꼴의 호의 길이', a: '$2\\pi \\times 6 \\times \\frac{60}{360} = 2\\pi$ cm' },
      },
    ],
    skills: [
      {
        id: 'diagonals',
        title: '다각형의 대각선',
        gen(r, level) {
          if (level === 1) {
            const n = r.int(5, 15);
            const v = (n * (n - 3)) / 2;
            return {
              q: `${pk(n)}의 대각선의 개수를 구하세요.`,
              answer: { type: 'num', value: v, unit: '개' },
              steps: [`$\\frac{n(n-3)}{2}$ 에 $n = ${n}$ 을 대입`, `$\\frac{${n} \\times ${n - 3}}{2} = ${v}$ 개`],
            };
          }
          if (level === 2) {
            const n = r.int(5, 14);
            const v = (n * (n - 3)) / 2;
            if (r.chance(0.5)) {
              return {
                q: `대각선의 개수가 $${v}$ 개인 다각형은 몇 각형인지 구하세요.`,
                answer: { type: 'num', value: n, unit: '각형' },
                steps: [`$\\frac{n(n-3)}{2} = ${v}$ 에서 $n(n-3) = ${2 * v}$`, `$${n} \\times ${n - 3} = ${2 * v}$ 이므로 $n = ${n}$, ${pk(n)}`],
                hint: '차가 3인 두 자연수의 곱을 찾아보세요.',
              };
            }
            return {
              q: `한 꼭짓점에서 그을 수 있는 대각선의 개수가 $${n - 3}$ 개인 다각형의 대각선의 총 개수를 구하세요.`,
              answer: { type: 'num', value: v, unit: '개' },
              steps: [`$n - 3 = ${n - 3}$ 이므로 $n = ${n}$`, `$\\frac{${n} \\times ${n - 3}}{2} = ${v}$ 개`],
            };
          }
          const n = r.int(6, 15);
          const v = (n * (n - 3)) / 2;
          const t = r.int(0, 2);
          if (t === 0) {
            return {
              q: `어떤 다각형의 한 꼭짓점에서 대각선을 모두 그었더니 $${n - 2}$ 개의 삼각형으로 나누어졌습니다. 이 다각형의 대각선의 총 개수를 구하세요.`,
              answer: { type: 'num', value: v, unit: '개' },
              steps: [`$n$각형은 $(n - 2)$ 개의 삼각형으로 나누어지므로 $n = ${n}$`, `대각선: $\\frac{${n} \\times ${n - 3}}{2} = ${v}$ 개`],
            };
          }
          if (t === 1) {
            return {
              q: `내각의 크기의 합이 $${comma180(n)}${DEG}$ 인 다각형의 대각선의 개수를 구하세요.`,
              answer: { type: 'num', value: v, unit: '개' },
              steps: [`$180${DEG} \\times (n - 2) = ${comma180(n)}${DEG}$ 에서 $n = ${n}$`, `대각선: $\\frac{${n} \\times ${n - 3}}{2} = ${v}$ 개`],
            };
          }
          const name = r.pick(NAMES);
          return {
            q: `${name}네 반 학생 $${n}$ 명이 원탁에 둘러앉아 양옆에 앉은 사람을 제외한 모든 사람과 한 번씩 악수를 하려고 합니다. 악수는 모두 몇 번 하게 되는지 구하세요.`,
            answer: { type: 'num', value: v, unit: '번' },
            steps: [`학생을 꼭짓점으로 보면 ${pk(n)}의 대각선의 개수와 같습니다.`, `$\\frac{${n} \\times ${n - 3}}{2} = ${v}$ 번`],
          };
        },
      },
      {
        id: 'angle-sum',
        title: '다각형의 내각과 외각의 합',
        gen(r, level) {
          const regs = [5, 6, 8, 9, 10, 12, 15, 18, 20];
          if (level === 1) {
            if (r.chance(0.5)) {
              const n = r.int(5, 12);
              return {
                q: `${pk(n)}의 내각의 크기의 합을 구하세요.`,
                answer: { type: 'num', value: 180 * (n - 2), unit: '°' },
                steps: [`$180${DEG} \\times (${n} - 2) = ${180 * (n - 2)}${DEG}$`],
              };
            }
            const n = r.pick(regs.slice(0, 6));
            return {
              q: `정${pk(n)}의 한 내각의 크기를 구하세요.`,
              answer: { type: 'num', value: (180 * (n - 2)) / n, unit: '°' },
              steps: [`내각의 합: $180${DEG} \\times ${n - 2} = ${180 * (n - 2)}${DEG}$`, `한 내각: $${180 * (n - 2)}${DEG} \\div ${n} = ${(180 * (n - 2)) / n}${DEG}$`],
            };
          }
          if (level === 2) {
            const n = r.pick(regs);
            const t = r.int(0, 2);
            if (t === 0) {
              return {
                q: `정${pk(n)}의 한 외각의 크기를 구하세요.`,
                answer: { type: 'num', value: 360 / n, unit: '°' },
                steps: [`외각의 크기의 합은 $360${DEG}$`, `$360${DEG} \\div ${n} = ${360 / n}${DEG}$`],
              };
            }
            if (t === 1) {
              return {
                q: `한 외각의 크기가 $${360 / n}${DEG}$ 인 정다각형은 몇 각형인지 구하세요.`,
                answer: { type: 'num', value: n, unit: '각형' },
                steps: [`$360${DEG} \\div ${360 / n}${DEG} = ${n}$`, `정${pk(n)}`],
              };
            }
            return {
              q: `한 내각의 크기가 $${180 - 360 / n}${DEG}$ 인 정다각형은 몇 각형인지 구하세요.`,
              answer: { type: 'num', value: n, unit: '각형' },
              steps: [`한 외각: $180${DEG} - ${180 - 360 / n}${DEG} = ${360 / n}${DEG}$`, `$360${DEG} \\div ${360 / n}${DEG} = ${n}$ 이므로 정${pk(n)}`],
              hint: '외각의 합이 항상 360° 인 것을 이용하세요.',
            };
          }
          const n = r.pick(regs);
          if (r.chance(0.5)) {
            const f = new F(n - 2, 2);
            const v = (n * (n - 3)) / 2;
            return {
              q: `한 내각의 크기와 한 외각의 크기의 비가 $${f.n} : ${f.d}$ 인 정다각형의 대각선의 개수를 구하세요.`,
              answer: { type: 'num', value: v, unit: '개' },
              steps: [`한 외각: $180${DEG} \\times \\frac{${f.d}}{${f.n + f.d}} = ${360 / n}${DEG}$`, `$360 \\div ${360 / n} = ${n}$ 이므로 정${pk(n)}`, `대각선: $\\frac{${n} \\times ${n - 3}}{2} = ${v}$ 개`],
            };
          }
          const m = r.int(5, 14);
          const S = 180 * (m - 2) + 360;
          return {
            q: `내각의 크기의 합과 외각의 크기의 합을 더하면 $${comma(S)}${DEG}$ 인 다각형은 몇 각형인지 구하세요.`,
            answer: { type: 'num', value: m, unit: '각형' },
            steps: [`$180${DEG}(n - 2) + 360${DEG} = 180${DEG} \\times n = ${comma(S)}${DEG}$`, `$n = ${m}$, ${pk(m)}`],
          };
        },
      },
      {
        id: 'triangle-angle',
        title: '삼각형의 내각과 외각',
        gen(r, level) {
          const A = r.int(8, 18) * 5;
          const B = r.int(7, 15) * 5;
          const C = 180 - A - B;
          if (C < 25) return this.gen(r, level);
          const s = new Svg(300, 190);
          const [pA, pB, pC] = triPts(A, B, C, 20, 25, 200, 140);
          s.poly([pA, pB, pC], { cls: 'acc' });
          vLabels(s, [pA, pB, pC], ['A', 'B', 'C']);
          if (level <= 2) {
            const pD: P2 = [Math.min(pC[0] + 70, 292), pC[1]];
            s.line(pC[0], pC[1], pD[0], pD[1]);
            s.text(pD[0], pD[1] + 13, 'D', { size: 14 });
            const ext = A + B;
            const dA = dirOf(pA, pB);
            const dA2 = dirOf(pA, pC);
            if (level === 1) {
              const askB = r.chance(0.4);
              angleMark(s, pA, Math.min(dA, dA2), Math.max(dA, dA2), `${A}°`, { r: 16, lr: 30 });
              angleMark(s, pB, 0, B, askB ? 'x' : `${B}°`, { r: 18, lr: 32, cls: askB ? 'acc2' : 'acc' });
              angleMark(s, pC, 0, 180 - C, askB ? `${ext}°` : 'x', { r: 18, lr: 32, cls: askB ? 'acc' : 'acc2' });
              return {
                q: '그림의 $\\triangle ABC$ 에서 $\\angle x$ 의 크기를 구하세요.',
                fig: s.toString(),
                answer: { type: 'num', value: askB ? B : ext, unit: '°' },
                steps: askB ? [`외각의 성질: $\\angle ACD = \\angle A + \\angle B$`, `$${ext}${DEG} = ${A}${DEG} + \\angle x$, $\\angle x = ${B}${DEG}$`] : ['삼각형의 한 외각의 크기는 이웃하지 않는 두 내각의 크기의 합과 같습니다.', `$\\angle x = ${A}${DEG} + ${B}${DEG} = ${ext}${DEG}$`],
              };
            }
            const x0 = r.int(10, 35);
            const c1 = A - x0;
            const c2 = ext - 2 * x0;
            const e1 = `x${c1 === 0 ? '' : c1 > 0 ? '+' + c1 : c1}`;
            const e2 = `2x${c2 === 0 ? '' : c2 > 0 ? '+' + c2 : c2}`;
            angleMark(s, pA, Math.min(dA, dA2), Math.max(dA, dA2), `(${e1})°`, { r: 16, lr: 34 });
            angleMark(s, pB, 0, B, `${B}°`, { r: 18, lr: 32 });
            angleMark(s, pC, 0, 180 - C, `(${e2})°`, { r: 18, lr: 40, cls: 'acc2' });
            return {
              q: '그림의 $\\triangle ABC$ 에서 $x$ 의 값을 구하세요.',
              fig: s.toString(),
              answer: { type: 'num', value: x0 },
              steps: ['$\\angle ACD = \\angle A + \\angle B$ 이므로', `$${e2} = (${e1}) + ${B}$`, `$x = ${x0}$`],
            };
          }
          if (A % 2) return this.gen(r, level);
          // 내심: 변 길이 가중 평균
          const a = Math.hypot(pB[0] - pC[0], pB[1] - pC[1]);
          const b = Math.hypot(pA[0] - pC[0], pA[1] - pC[1]);
          const c = Math.hypot(pA[0] - pB[0], pA[1] - pB[1]);
          const I: P2 = [(a * pA[0] + b * pB[0] + c * pC[0]) / (a + b + c), (a * pA[1] + b * pB[1] + c * pC[1]) / (a + b + c)];
          s.line(pB[0], pB[1], I[0], I[1], { dash: true });
          s.line(pC[0], pC[1], I[0], I[1], { dash: true });
          s.dot(I[0], I[1]);
          s.text(I[0], I[1] - 12, 'I', { size: 13 });
          const dA = dirOf(pA, pB);
          const dA2 = dirOf(pA, pC);
          angleMark(s, pA, Math.min(dA, dA2), Math.max(dA, dA2), `${A}°`, { r: 16, lr: 30 });
          const v = 90 + A / 2;
          return {
            q: `그림의 $\\triangle ABC$ 에서 $\\angle B$ 와 $\\angle C$ 의 이등분선의 교점을 I 라 하자. $\\angle A = ${A}${DEG}$ 일 때, $\\angle BIC$ 의 크기를 구하세요.`,
            fig: s.toString(),
            answer: { type: 'num', value: v, unit: '°' },
            steps: [`$\\angle B + \\angle C = 180${DEG} - ${A}${DEG} = ${180 - A}${DEG}$`, `$\\angle IBC + \\angle ICB = \\frac{1}{2} \\times ${180 - A}${DEG} = ${(180 - A) / 2}${DEG}$`, `$\\angle BIC = 180${DEG} - ${(180 - A) / 2}${DEG} = ${v}${DEG}$`],
            hint: '△IBC 의 내각의 합을 이용하세요.',
          };
        },
      },
      {
        id: 'polygon-angle',
        title: '다각형의 한 각 구하기',
        gen(r, level) {
          const n = level === 1 ? 4 : level === 2 ? 5 : 6;
          const s = new Svg(260, 220);
          const { pts, ang } = wobblyPolygon(r, n, 130, 112, 88);
          s.poly(pts, { cls: 'acc' });
          const k = r.int(0, n - 1);
          const ints = ang.map((a) => Math.round(a));
          const others = ints.filter((_, i) => i !== k);
          const x = 180 * (n - 2) - sum(others);
          const extIdx = level === 3 ? (k + r.int(1, n - 1)) % n : -1;
          pts.forEach((_, i) => {
            if (i === k) innerMark(s, pts, i, 'x', 'acc2');
            else if (i !== extIdx) innerMark(s, pts, i, `${ints[i]}°`);
          });
          let extTxt = '';
          if (extIdx >= 0) {
            const p = pts[extIdx];
            const prev = pts[(extIdx + n - 1) % n];
            const dOut = dirOf(prev, p);
            const e = go(p, dOut, 45);
            s.line(p[0], p[1], e[0], e[1], { dash: true });
            const dNext = dirOf(p, pts[(extIdx + 1) % n]);
            let sw = dNext - dOut;
            while (sw < 0) sw += 360;
            const extV = 180 - ints[extIdx];
            if (sw < 180) angleMark(s, p, dOut, dNext, `${extV}°`, { r: 14, lr: 30 });
            else angleMark(s, p, dNext, dOut, `${extV}°`, { r: 14, lr: 30 });
            extTxt = `한 외각이 $${extV}${DEG}$ 이므로 그 내각은 $${ints[extIdx]}${DEG}$`;
          }
          const total = 180 * (n - 2);
          return {
            q: `그림의 ${pk(n)}에서 $\\angle x$ 의 크기를 구하세요.`,
            fig: s.toString(),
            answer: { type: 'num', value: x, unit: '°' },
            steps: [`${pk(n)}의 내각의 합: $180${DEG} \\times ${n - 2} = ${total}${DEG}$`, ...(extTxt ? [extTxt] : []), `$\\angle x = ${total}${DEG} - (${others.join(' + ')})${DEG} = ${x}${DEG}$`],
            hint: level === 3 ? '외각이 주어진 곳은 내각으로 바꾸어 생각하세요.' : undefined,
          };
        },
      },
      {
        id: 'sector',
        title: '부채꼴의 호의 길이와 넓이',
        gen(r, level) {
          const ths = [30, 40, 45, 60, 72, 90, 120, 135, 150, 180, 240, 270];
          if (level === 1) {
            const rr = r.int(2, 12);
            const th = r.pick(ths);
            const arc = new F(rr * th, 180);
            const area = new F(rr * rr * th, 360);
            const askArc = r.chance(0.5);
            const fig = sectorFig(th, `${rr} cm`);
            if (askArc) {
              return {
                q: `반지름의 길이가 $${rr}$ cm 이고 중심각의 크기가 $${th}${DEG}$ 인 부채꼴의 **호의 길이**는?`,
                fig,
                answer: texChoices(r, `${piTex(arc)}\\text{ cm}`, [area, arc.mul(2), new F(rr * th, 360), arc.add(rr * 2), new F(rr * rr * th, 180)].map((w) => `${piTex(w)}\\text{ cm}`)),
                steps: [`$l = 2\\pi \\times ${rr} \\times \\frac{${th}}{360}$`, `$= ${piTex(arc)}$ (cm)`],
              };
            }
            return {
              q: `반지름의 길이가 $${rr}$ cm 이고 중심각의 크기가 $${th}${DEG}$ 인 부채꼴의 **넓이**는?`,
              fig,
              answer: texChoices(r, `${piTex(area)}\\text{ cm}^{2}`, [arc, area.mul(2), new F(rr * rr * th, 180), new F(rr * th, 360), area.mul(new F(1, 2))].map((w) => `${piTex(w)}\\text{ cm}^{2}`)),
              steps: [`$S = \\pi \\times ${rr}^{2} \\times \\frac{${th}}{360}$`, `$= ${piTex(area)}$ (cm²)`],
            };
          }
          if (level === 2) {
            const rr = r.int(3, 12);
            const th = r.pick(ths);
            const arc = new F(rr * th, 180);
            if (r.chance(0.5)) {
              return {
                q: `반지름의 길이가 $${rr}$ cm 이고 호의 길이가 $${piTex(arc)}$ cm 인 부채꼴의 중심각의 크기를 구하세요.`,
                answer: { type: 'num', value: th, unit: '°' },
                steps: [`$2\\pi \\times ${rr} \\times \\frac{x}{360} = ${piTex(arc)}$`, `$\\frac{x}{360} = ${arc.div(2 * rr).tex()}$, $x = ${th}$`],
              };
            }
            const area = arc.mul(rr).div(2);
            return {
              q: `반지름의 길이가 $${rr}$ cm 이고 호의 길이가 $${piTex(arc)}$ cm 인 부채꼴의 넓이는?`,
              answer: texChoices(r, `${piTex(area)}\\text{ cm}^{2}`, [arc.mul(rr), area.mul(2), arc.mul(rr).div(4), arc.div(2), area.add(rr)].map((w) => `${piTex(w)}\\text{ cm}^{2}`)),
              steps: ['$S = \\frac{1}{2} r l$', `$= \\frac{1}{2} \\times ${rr} \\times ${piTex(arc)} = ${piTex(area)}$ (cm²)`],
              hint: '중심각을 몰라도 넓이를 구할 수 있어요.',
            };
          }
          const t = r.int(0, 2);
          if (t === 2) {
            const a = r.pick([20, 30, 40, 45, 60]);
            const kk = r.int(2, 5);
            const b = a * kk;
            const S = r.int(2, 9) * (r.chance(0.5) ? 1 : 2);
            return {
              q: `한 원에서 중심각의 크기가 $${a}${DEG}$ 인 부채꼴의 넓이가 $${S}$ cm² 일 때, 중심각의 크기가 $${b}${DEG}$ 인 부채꼴의 넓이를 구하세요.`,
              answer: { type: 'num', value: S * kk, unit: 'cm²' },
              steps: ['한 원에서 부채꼴의 넓이는 중심각의 크기에 정비례합니다.', `$${a} : ${b} = ${S} : x$, $x = ${S * kk}$`],
            };
          }
          const th = r.pick([60, 90, 120, 135, 150, 45]);
          const R = r.int(4, 12);
          const r0 = r.int(2, R - 2);
          const fig = sectorFig(th, `${R} cm`, r0 / R, `${r0} cm`);
          if (t === 0) {
            const area = new F((R * R - r0 * r0) * th, 360);
            return {
              q: `그림과 같이 중심이 같고 반지름의 길이가 각각 $${R}$ cm, $${r0}$ cm 이며 중심각의 크기가 $${th}${DEG}$ 인 두 부채꼴에서, 큰 부채꼴에서 작은 부채꼴을 뺀 부분의 넓이는?`,
              fig,
              answer: texChoices(r, `${piTex(area)}\\text{ cm}^{2}`, [new F((R - r0) * (R - r0) * th, 360), new F(R * R * th, 360), new F((R * R + r0 * r0) * th, 360), new F((R * R - r0 * r0) * th, 180), new F((R - r0) * th, 180)].map((w) => `${piTex(w)}\\text{ cm}^{2}`)),
              steps: [`큰 부채꼴: $\\pi \\times ${R}^{2} \\times \\frac{${th}}{360} = ${piTex(new F(R * R * th, 360))}$`, `작은 부채꼴: $\\pi \\times ${r0}^{2} \\times \\frac{${th}}{360} = ${piTex(new F(r0 * r0 * th, 360))}$`, `차: $${piTex(area)}$ (cm²)`],
            };
          }
          const arcs = new F((R + r0) * th, 180);
          const lin = 2 * (R - r0);
          const ans = `\\left(${piTex(arcs)} + ${lin}\\right)\\text{ cm}`;
          return {
            q: `그림과 같이 중심이 같고 반지름의 길이가 각각 $${R}$ cm, $${r0}$ cm 이며 중심각의 크기가 $${th}${DEG}$ 인 두 부채꼴에서, 큰 부채꼴에서 작은 부채꼴을 뺀 부분의 둘레의 길이는?`,
            fig,
            answer: texChoices(r, ans, [`\\left(${piTex(arcs)} + ${lin / 2}\\right)\\text{ cm}`, `\\left(${piTex(new F((R - r0) * th, 180))} + ${lin}\\right)\\text{ cm}`, `${piTex(arcs)}\\text{ cm}`, `\\left(${piTex(arcs.mul(2))} + ${lin}\\right)\\text{ cm}`, `\\left(${piTex(new F(R * th, 180))} + ${lin}\\right)\\text{ cm}`]),
            steps: [`큰 호: $${piTex(new F(R * th, 180))}$, 작은 호: $${piTex(new F(r0 * th, 180))}$`, `직선 부분: $2 \\times (${R} - ${r0}) = ${lin}$`, `둘레: $${piTex(arcs)} + ${lin}$ (cm)`],
            hint: '호 두 개와 선분 두 개로 이루어져 있어요.',
          };
        },
      },
    ],
  },

  // ═══════════════ m1b-4 입체도형의 성질 ═══════════════
  'm1b-4': {
    concepts: [
      {
        title: '다면체',
        body: '다각형인 면으로만 둘러싸인 입체도형을 **다면체**라 해요.\n- $n$각기둥: 면 $n+2$, 모서리 $3n$, 꼭짓점 $2n$\n- $n$각뿔: 면 $n+1$, 모서리 $2n$, 꼭짓점 $n+1$\n- $n$각뿔대: 면 $n+2$, 모서리 $3n$, 꼭짓점 $2n$\n(꼭짓점) − (모서리) + (면) = 2 가 항상 성립해요.',
      },
      {
        title: '정다면체',
        body: '모든 면이 합동인 정다각형이고, 각 꼭짓점에 모인 면의 개수가 같은 다면체. **다섯 가지뿐**이에요.\n- 정사면체(정삼각형, 3개), 정육면체(정사각형, 3개), 정팔면체(정삼각형, 4개)\n- 정십이면체(정오각형, 3개), 정이십면체(정삼각형, 5개)\n괄호 안은 (면의 모양, 한 꼭짓점에 모인 면의 개수)',
      },
      {
        title: '회전체',
        body: '평면도형을 한 직선(회전축)을 중심으로 1회전 시킬 때 생기는 입체도형.\n- 직사각형 → 원기둥, 직각삼각형 → 원뿔, 반원 → 구, 직각사다리꼴 → 원뿔대\n- 회전축에 **수직인 평면**으로 자른 단면: 항상 **원**\n- 회전축을 **포함하는 평면**으로 자른 단면: 회전축에 대해 선대칭인 도형 (원기둥 → 직사각형, 원뿔 → 이등변삼각형)',
      },
      {
        title: '기둥의 겉넓이와 부피',
        body: '- 겉넓이 = (밑넓이) × 2 + (옆넓이)\n- 부피 = (밑넓이) × (높이)\n원기둥 (반지름 $r$, 높이 $h$): $S = 2\\pi r^{2} + 2\\pi r h$, $V = \\pi r^{2} h$\n옆면을 펼치면 가로가 밑면의 둘레인 직사각형이 돼요.',
      },
      {
        title: '뿔과 구의 겉넓이와 부피',
        body: '- 뿔의 부피 = $\\frac{1}{3}$ × (밑넓이) × (높이)\n- 원뿔 (반지름 $r$, 모선 $l$): 겉넓이 $\\pi r^{2} + \\pi r l$\n- 구 (반지름 $r$): 겉넓이 $4\\pi r^{2}$, 부피 $\\frac{4}{3}\\pi r^{3}$\n원기둥 안에 꼭 맞는 원뿔·구·원기둥의 부피의 비는 $1 : 2 : 3$',
      },
    ],
    skills: [
      {
        id: 'polyhedron',
        title: '다면체의 면·모서리·꼭짓점',
        gen(r, level) {
          const n = r.int(3, 10);
          const kind = r.pick(['기둥', '뿔', '뿔대']);
          const FEV = kind === '뿔' ? [n + 1, 2 * n, n + 1] : [n + 2, 3 * n, 2 * n];
          const W = ['면', '모서리', '꼭짓점'];
          if (level === 1) {
            const i = r.int(0, 2);
            return {
              q: `${POLY_KO[n]}각${kind}의 ${W[i]}의 개수를 구하세요.`,
              answer: { type: 'num', value: FEV[i], unit: '개' },
              steps: [`$n$각${kind}의 ${W[i]}의 개수: $${kind === '뿔' ? ['n+1', '2n', 'n+1'][i] : ['n+2', '3n', '2n'][i]}$`, `$n = ${n}$ 이므로 $${FEV[i]}$ 개`],
            };
          }
          if (level === 2) {
            const i = r.int(0, 2);
            let j = r.int(0, 2);
            if (j === i) j = (i + 1) % 3;
            return {
              q: `${W[i]}의 개수가 $${FEV[i]}$ 개인 각${kind}의 ${W[j]}의 개수를 구하세요.`,
              answer: { type: 'num', value: FEV[j], unit: '개' },
              steps: [`${W[i]}의 개수로부터 ${POLY_KO[n]}각${kind}입니다.`, `${W[j]}의 개수: $${FEV[j]}$ 개`],
            };
          }
          if (kind === '뿔') {
            const tot = FEV[1] + FEV[2];
            return {
              q: `모서리의 개수와 꼭짓점의 개수의 합이 $${tot}$ 인 각뿔의 면의 개수를 구하세요.`,
              answer: { type: 'num', value: FEV[0], unit: '개' },
              steps: [`$n$각뿔: $2n + (n + 1) = ${tot}$, $n = ${n}$`, `면의 개수: $${n} + 1 = ${FEV[0]}$ 개`],
            };
          }
          const tot = FEV[1] + FEV[2];
          return {
            q: `모서리의 개수와 꼭짓점의 개수의 합이 $${tot}$ 인 각${kind}의 면의 개수를 구하세요.`,
            answer: { type: 'num', value: FEV[0], unit: '개' },
            steps: [`$n$각${kind}: $3n + 2n = ${tot}$, $n = ${n}$`, `면의 개수: $${n} + 2 = ${FEV[0]}$ 개`],
          };
        },
      },
      {
        id: 'regular',
        title: '정다면체',
        gen(r, level) {
          const P = [
            { n: '정사면체', f: '정삼각형', k: 3, F: 4, E: 6, V: 4 },
            { n: '정육면체', f: '정사각형', k: 3, F: 6, E: 12, V: 8 },
            { n: '정팔면체', f: '정삼각형', k: 4, F: 8, E: 12, V: 6 },
            { n: '정십이면체', f: '정오각형', k: 3, F: 12, E: 30, V: 20 },
            { n: '정이십면체', f: '정삼각형', k: 5, F: 20, E: 30, V: 12 },
          ];
          const p = r.pick(P);
          if (level === 1) {
            return {
              q: `면의 모양이 ${p.f}이고, 한 꼭짓점에 모인 면의 개수가 $${p.k}$ 개인 정다면체는?`,
              answer: textChoices(
                r,
                p.n,
                P.filter((x) => x !== p).map((x) => x.n),
              ),
              steps: [`${p.f} 모양의 면이 한 꼭짓점에 $${p.k}$ 개씩 모이는 정다면체는 ${p.n}입니다.`],
            };
          }
          if (level === 2) {
            const w = r.pick(['모서리', '꼭짓점'] as const);
            const v = w === '모서리' ? p.E : p.V;
            return {
              q: `${p.n}의 ${w}의 개수를 구하세요.`,
              answer: { type: 'num', value: v, unit: '개' },
              steps: w === '모서리' ? [`면 $${p.F}$ 개, 한 면의 변 $${p.f === '정삼각형' ? 3 : p.f === '정사각형' ? 4 : 5}$ 개, 한 모서리는 두 면이 공유`, `$${p.F} \\times ${p.f === '정삼각형' ? 3 : p.f === '정사각형' ? 4 : 5} \\div 2 = ${p.E}$ 개`] : [`면 $${p.F}$ 개의 꼭짓점을 모두 세면 $${p.F * (p.f === '정삼각형' ? 3 : p.f === '정사각형' ? 4 : 5)}$ 개, 한 꼭짓점에 $${p.k}$ 개의 면이 모임`, `$${p.F * (p.f === '정삼각형' ? 3 : p.f === '정사각형' ? 4 : 5)} \\div ${p.k} = ${p.V}$ 개`],
            };
          }
          const [a, b] = r.sample(P, 2);
          const wa = r.pick(['면', '모서리', '꼭짓점'] as const);
          const wb = r.pick(['면', '모서리', '꼭짓점'] as const);
          const g = (x: (typeof P)[number], w: string) => (w === '면' ? x.F : w === '모서리' ? x.E : x.V);
          if (r.chance(0.5)) {
            const v = g(a, wa) + g(b, wb);
            return {
              q: `${a.n}의 ${wa}의 개수를 $x$, ${b.n}의 ${wb}의 개수를 $y$ 라 할 때, $x + y$ 의 값을 구하세요.`,
              answer: { type: 'num', value: v },
              steps: [`$x = ${g(a, wa)}$, $y = ${g(b, wb)}$`, `$x + y = ${v}$`],
            };
          }
          return {
            q: `모서리의 개수가 $${p.E}$ 개, 꼭짓점의 개수가 $${p.V}$ 개인 정다면체의 한 꼭짓점에 모인 면의 개수를 구하세요.`,
            answer: { type: 'num', value: p.k, unit: '개' },
            steps: [`(꼭짓점) − (모서리) + (면) = 2 에서 면의 개수는 $2 - ${p.V} + ${p.E} = ${p.F}$`, `모서리 $${p.E}$, 면 $${p.F}$ 개이므로 ${p.n}`, `한 꼭짓점에 모인 면: $${p.k}$ 개`],
          };
        },
      },
      {
        id: 'rotation',
        title: '회전체와 단면',
        gen(r, level) {
          const B = [
            { shape: '직사각형', body: '원기둥', sec: '직사각형' },
            { shape: '직각삼각형', body: '원뿔', sec: '이등변삼각형' },
            { shape: '반원', body: '구', sec: '원' },
            { shape: '직각사다리꼴', body: '원뿔대', sec: '사다리꼴' },
          ];
          const b = r.pick(B);
          const axis = { 직사각형: '한 변', 직각삼각형: '직각을 낀 한 변', 반원: '지름', 직각사다리꼴: '두 밑변에 수직인 변' }[b.shape];
          if (level === 1) {
            return {
              q: `${b.shape}을 ${axis}을 회전축으로 하여 1회전 시킬 때 생기는 회전체는?`,
              answer: textChoices(
                r,
                b.body,
                [...B.filter((x) => x !== b).map((x) => x.body), '삼각뿔'],
              ),
              steps: [`${b.shape} → ${b.body}`],
            };
          }
          if (level === 2) {
            const perp = r.chance(0.35);
            const ans = perp ? '원' : b.sec;
            return {
              q: `${b.body}${eul(b.body)} 회전축${perp ? '에 **수직인**' : '을 **포함하는**'} 평면으로 자를 때 생기는 단면의 모양은?`,
              answer: textChoices(
                r,
                ans,
                ['직사각형', '이등변삼각형', '원', '사다리꼴', '직각삼각형'].filter((x) => x !== ans),
              ),
              steps: perp ? ['회전체를 회전축에 수직인 평면으로 자르면 단면은 항상 원입니다.'] : [`${b.body}${eul(b.body)} 회전축을 포함하는 평면으로 자르면 단면은 ${b.sec}입니다.`, '회전축을 대칭축으로 하는 선대칭도형이에요.'],
            };
          }
          const a = r.int(2, 9);
          const h = r.int(3, 12);
          if (r.chance(0.5)) {
            return {
              q: `가로의 길이가 $${a}$ cm, 세로의 길이가 $${h}$ cm 인 직사각형을 세로를 회전축으로 하여 1회전 시켰습니다. 이 회전체를 회전축을 포함하는 평면으로 자를 때 생기는 단면의 넓이를 구하세요.`,
              answer: { type: 'num', value: 2 * a * h, unit: 'cm²' },
              steps: [`회전체는 밑면의 반지름이 $${a}$ cm, 높이가 $${h}$ cm 인 원기둥`, `단면은 가로 $${2 * a}$ cm, 세로 $${h}$ cm 인 직사각형`, `넓이: $${2 * a} \\times ${h} = ${2 * a * h}$ cm²`],
            };
          }
          return {
            q: `밑변의 길이가 $${a}$ cm, 높이가 $${h}$ cm 인 직각삼각형을 높이를 회전축으로 하여 1회전 시켰습니다. 이 회전체를 회전축을 포함하는 평면으로 자를 때 생기는 단면의 넓이를 구하세요.`,
            answer: { type: 'num', value: a * h, unit: 'cm²' },
            steps: [`회전체는 밑면의 반지름이 $${a}$ cm, 높이가 $${h}$ cm 인 원뿔`, `단면은 밑변 $${2 * a}$ cm, 높이 $${h}$ cm 인 이등변삼각형`, `넓이: $\\frac{1}{2} \\times ${2 * a} \\times ${h} = ${a * h}$ cm²`],
          };
        },
      },
      {
        id: 'prism',
        title: '기둥의 겉넓이와 부피',
        gen(r, level) {
          if (level === 1) {
            if (r.chance(0.5)) {
              const [a, b, c] = [r.int(2, 12), r.int(2, 12), r.int(2, 12)];
              if (r.chance(0.5)) {
                return {
                  q: `가로 $${a}$ cm, 세로 $${b}$ cm, 높이 $${c}$ cm 인 직육면체의 부피를 구하세요.`,
                  answer: { type: 'num', value: a * b * c, unit: 'cm³' },
                  steps: [`(밑넓이) × (높이) $= ${a} \\times ${b} \\times ${c} = ${a * b * c}$ cm³`],
                };
              }
              const S = 2 * (a * b + b * c + c * a);
              return {
                q: `가로 $${a}$ cm, 세로 $${b}$ cm, 높이 $${c}$ cm 인 직육면체의 겉넓이를 구하세요.`,
                answer: { type: 'num', value: S, unit: 'cm²' },
                steps: [`밑넓이: $${a * b}$, 옆넓이: $2 \\times (${a} + ${b}) \\times ${c} = ${2 * (a + b) * c}$`, `$${a * b} \\times 2 + ${2 * (a + b) * c} = ${S}$ cm²`],
              };
            }
            const k = r.int(1, 3);
            const h = r.int(2, 12);
            const [p, q, hy] = [3 * k, 4 * k, 5 * k];
            if (r.chance(0.5)) {
              return {
                q: `밑면이 직각을 낀 두 변의 길이가 $${p}$ cm, $${q}$ cm 인 직각삼각형이고, 높이가 $${h}$ cm 인 삼각기둥의 부피를 구하세요.`,
                answer: { type: 'num', value: (p * q * h) / 2, unit: 'cm³' },
                steps: [`밑넓이: $\\frac{1}{2} \\times ${p} \\times ${q} = ${(p * q) / 2}$ cm²`, `부피: $${(p * q) / 2} \\times ${h} = ${(p * q * h) / 2}$ cm³`],
              };
            }
            const S = p * q + (p + q + hy) * h;
            return {
              q: `밑면이 세 변의 길이가 $${p}$ cm, $${q}$ cm, $${hy}$ cm 인 직각삼각형이고, 높이가 $${h}$ cm 인 삼각기둥의 겉넓이를 구하세요.`,
              answer: { type: 'num', value: S, unit: 'cm²' },
              steps: [`밑넓이: $\\frac{1}{2} \\times ${p} \\times ${q} = ${(p * q) / 2}$ cm²`, `옆넓이: $(${p} + ${q} + ${hy}) \\times ${h} = ${(p + q + hy) * h}$ cm²`, `겉넓이: $${(p * q) / 2} \\times 2 + ${(p + q + hy) * h} = ${S}$ cm²`],
            };
          }
          if (level === 2) {
            const rr = r.int(2, 9);
            const h = r.int(2, 12);
            if (r.chance(0.5)) {
              const V = rr * rr * h;
              return {
                q: `밑면의 반지름의 길이가 $${rr}$ cm, 높이가 $${h}$ cm 인 원기둥의 부피는?`,
                answer: texChoices(r, `${piTex(V)}\\text{ cm}^{3}`, [rr * h, 2 * rr * h, 2 * rr * rr * h, rr * h * h, (rr * rr * h) / 3].filter((x) => Number.isInteger(x)).map((w) => `${piTex(w)}\\text{ cm}^{3}`)),
                steps: [`$V = \\pi r^{2} h = \\pi \\times ${rr}^{2} \\times ${h}$`, `$= ${piTex(V)}$ cm³`],
              };
            }
            const S = 2 * rr * rr + 2 * rr * h;
            return {
              q: `밑면의 반지름의 길이가 $${rr}$ cm, 높이가 $${h}$ cm 인 원기둥의 겉넓이는?`,
              answer: texChoices(r, `${piTex(S)}\\text{ cm}^{2}`, [rr * rr + 2 * rr * h, 2 * rr * rr + rr * h, 2 * rr * h, 2 * rr * rr * h, 4 * rr * rr + 2 * rr * h].map((w) => `${piTex(w)}\\text{ cm}^{2}`)),
              steps: [`밑넓이: $\\pi \\times ${rr}^{2} = ${piTex(rr * rr)}$`, `옆넓이: $2\\pi \\times ${rr} \\times ${h} = ${piTex(2 * rr * h)}$`, `겉넓이: $${piTex(rr * rr)} \\times 2 + ${piTex(2 * rr * h)} = ${piTex(S)}$ cm²`],
            };
          }
          const R = r.int(4, 10);
          const r0 = r.int(1, R - 2);
          const h = r.int(3, 12);
          if (r.chance(0.5)) {
            const V = (R * R - r0 * r0) * h;
            return {
              q: `밑면의 반지름이 $${R}$ cm 이고 높이가 $${h}$ cm 인 원기둥의 가운데에 밑면의 반지름이 $${r0}$ cm 인 원기둥 모양의 구멍을 뚫었습니다. 남은 입체도형의 부피는?`,
              answer: texChoices(r, `${piTex(V)}\\text{ cm}^{3}`, [(R - r0) * (R - r0) * h, R * R * h, (R * R + r0 * r0) * h, (R * R - r0 * r0) * h * 2, (R - r0) * h].map((w) => `${piTex(w)}\\text{ cm}^{3}`)),
              steps: [`큰 원기둥: $\\pi \\times ${R}^{2} \\times ${h} = ${piTex(R * R * h)}$`, `구멍: $\\pi \\times ${r0}^{2} \\times ${h} = ${piTex(r0 * r0 * h)}$`, `$${piTex(R * R * h)} - ${piTex(r0 * r0 * h)} = ${piTex(V)}$ cm³`],
            };
          }
          const S = 2 * (R * R - r0 * r0) + 2 * (R + r0) * h;
          return {
            q: `밑면의 반지름이 $${R}$ cm 이고 높이가 $${h}$ cm 인 원기둥의 가운데에 밑면의 반지름이 $${r0}$ cm 인 원기둥 모양의 구멍을 뚫었습니다. 남은 입체도형의 겉넓이는?`,
            answer: texChoices(r, `${piTex(S)}\\text{ cm}^{2}`, [2 * (R * R - r0 * r0) + 2 * R * h, 2 * R * R + 2 * (R + r0) * h, 2 * (R * R - r0 * r0) + 2 * (R - r0) * h, (R * R - r0 * r0) + 2 * (R + r0) * h, 2 * (R * R + r0 * r0) + 2 * (R + r0) * h].map((w) => `${piTex(w)}\\text{ cm}^{2}`)),
            steps: [`밑넓이: $\\pi(${R}^{2} - ${r0}^{2}) = ${piTex(R * R - r0 * r0)}$ (2개)`, `바깥 옆넓이 $${piTex(2 * R * h)}$, 안쪽 옆넓이 $${piTex(2 * r0 * h)}$`, `겉넓이: $${piTex(2 * (R * R - r0 * r0))} + ${piTex(2 * R * h)} + ${piTex(2 * r0 * h)} = ${piTex(S)}$ cm²`],
            hint: '구멍 안쪽의 옆넓이도 겉넓이에 들어가요.',
          };
        },
      },
      {
        id: 'cone-sphere',
        title: '뿔과 구의 겉넓이와 부피',
        gen(r, level) {
          if (level === 1) {
            const a = r.int(2, 10);
            const h = r.int(1, 5) * 3;
            if (r.chance(0.5)) {
              return {
                q: `밑면이 한 변의 길이가 $${a}$ cm 인 정사각형이고 높이가 $${h}$ cm 인 사각뿔의 부피를 구하세요.`,
                answer: { type: 'num', value: (a * a * h) / 3, unit: 'cm³' },
                steps: [`$\\frac{1}{3} \\times (\\text{밑넓이}) \\times (\\text{높이})$`, `$\\frac{1}{3} \\times ${a * a} \\times ${h} = ${(a * a * h) / 3}$ cm³`],
              };
            }
            const sl = r.int(a, a + 8);
            const S = a * a + 2 * a * sl;
            return {
              q: `밑면이 한 변의 길이가 $${a}$ cm 인 정사각형이고, 옆면이 높이가 $${sl}$ cm 인 합동인 이등변삼각형 4개로 이루어진 정사각뿔의 겉넓이를 구하세요.`,
              answer: { type: 'num', value: S, unit: 'cm²' },
              steps: [`밑넓이: $${a}^{2} = ${a * a}$`, `옆넓이: $\\frac{1}{2} \\times ${a} \\times ${sl} \\times 4 = ${2 * a * sl}$`, `겉넓이: $${a * a} + ${2 * a * sl} = ${S}$ cm²`],
            };
          }
          if (level === 2) {
            const rr = r.int(2, 9);
            if (r.chance(0.5)) {
              const h = r.int(1, 5) * 3;
              const V = (rr * rr * h) / 3;
              return {
                q: `밑면의 반지름의 길이가 $${rr}$ cm, 높이가 $${h}$ cm 인 원뿔의 부피는?`,
                answer: texChoices(r, `${piTex(V)}\\text{ cm}^{3}`, [rr * rr * h, (rr * h) / 3, (2 * rr * rr * h) / 3, (rr * rr * h) / 2, rr * h].filter((x) => Number.isInteger(x)).map((w) => `${piTex(w)}\\text{ cm}^{3}`)),
                steps: [`$V = \\frac{1}{3}\\pi r^{2} h = \\frac{1}{3} \\times \\pi \\times ${rr}^{2} \\times ${h}$`, `$= ${piTex(V)}$ cm³`],
              };
            }
            const l = r.int(rr + 1, rr + 9);
            const S = rr * rr + rr * l;
            return {
              q: `밑면의 반지름의 길이가 $${rr}$ cm, 모선의 길이가 $${l}$ cm 인 원뿔의 겉넓이는?`,
              answer: texChoices(r, `${piTex(S)}\\text{ cm}^{2}`, [rr * l, rr * rr + 2 * rr * l, 2 * rr * rr + rr * l, rr * rr * l, l * l + rr * l].map((w) => `${piTex(w)}\\text{ cm}^{2}`)),
              steps: [`밑넓이: $\\pi \\times ${rr}^{2} = ${piTex(rr * rr)}$`, `옆넓이 (부채꼴): $\\pi r l = \\pi \\times ${rr} \\times ${l} = ${piTex(rr * l)}$`, `겉넓이: $${piTex(S)}$ cm²`],
            };
          }
          const rr = r.int(1, 4) * 3;
          const t = r.int(0, 3);
          if (t === 0) {
            const V = new F(4 * rr ** 3, 3);
            return {
              q: `반지름의 길이가 $${rr}$ cm 인 구의 부피는?`,
              answer: texChoices(r, `${piTex(V)}\\text{ cm}^{3}`, [new F(4 * rr * rr), new F(rr ** 3), new F(4 * rr ** 3), new F(2 * rr ** 3, 3), new F(8 * rr ** 3, 3)].map((w) => `${piTex(w)}\\text{ cm}^{3}`)),
              steps: [`$V = \\frac{4}{3}\\pi r^{3} = \\frac{4}{3} \\times \\pi \\times ${rr}^{3}$`, `$= ${piTex(V)}$ cm³`],
            };
          }
          if (t === 1) {
            const S = 3 * rr * rr;
            return {
              q: `반지름의 길이가 $${rr}$ cm 인 반구의 겉넓이는?`,
              answer: texChoices(r, `${piTex(S)}\\text{ cm}^{2}`, [2 * rr * rr, 4 * rr * rr, rr * rr, 5 * rr * rr, 6 * rr * rr].map((w) => `${piTex(w)}\\text{ cm}^{2}`)),
              steps: [`곡면: $\\frac{1}{2} \\times 4\\pi \\times ${rr}^{2} = ${piTex(2 * rr * rr)}$`, `밑면(원): $\\pi \\times ${rr}^{2} = ${piTex(rr * rr)}$`, `겉넓이: $${piTex(S)}$ cm²`],
              hint: '잘린 면(원)의 넓이를 빠뜨리지 마세요.',
            };
          }
          if (t === 2) {
            const V = 2 * rr ** 3;
            return {
              q: `반지름의 길이가 $${rr}$ cm 인 구가 원기둥 안에 꼭 맞게 들어 있습니다. 원기둥의 부피는?`,
              answer: texChoices(r, `${piTex(V)}\\text{ cm}^{3}`, [new F(4 * rr ** 3, 3), new F(2 * rr ** 3, 3), new F(rr ** 3), new F(4 * rr ** 3), new F(3 * rr ** 3)].map((w) => `${piTex(w)}\\text{ cm}^{3}`)),
              steps: [`원기둥의 밑면의 반지름 $${rr}$ cm, 높이 $${2 * rr}$ cm`, `$\\pi \\times ${rr}^{2} \\times ${2 * rr} = ${piTex(V)}$ cm³`, '(원뿔 : 구 : 원기둥 = 1 : 2 : 3)'],
            };
          }
          return {
            q: `반지름의 길이가 $${rr}$ cm 인 구와 부피가 같은 원기둥이 있습니다. 원기둥의 밑면의 반지름의 길이도 $${rr}$ cm 일 때, 원기둥의 높이를 구하세요.`,
            answer: { type: 'num', value: (4 * rr) / 3, unit: 'cm' },
            steps: [`구의 부피: $\\frac{4}{3}\\pi \\times ${rr}^{3} = ${piTex(new F(4 * rr ** 3, 3))}$`, `$\\pi \\times ${rr}^{2} \\times h = ${piTex(new F(4 * rr ** 3, 3))}$`, `$h = ${(4 * rr) / 3}$ cm`],
          };
        },
      },
    ],
  },

  // ═══════════════ m1b-5 자료의 정리와 해석 ═══════════════
  'm1b-5': {
    concepts: [
      {
        title: '대푯값',
        body: '자료 전체의 특징을 대표하는 값.\n- **평균**: (변량의 총합) ÷ (변량의 개수)\n- **중앙값**: 크기순으로 나열했을 때 한가운데 값. 개수가 짝수이면 가운데 두 값의 평균\n- **최빈값**: 가장 많이 나타나는 값 (두 개 이상일 수도 있어요)\n극단적인 값이 있으면 평균보다 중앙값이 자료를 더 잘 대표해요.',
      },
      {
        title: '줄기와 잎 그림',
        body: '변량을 **줄기**(큰 자리의 숫자)와 **잎**(나머지 자리의 숫자)으로 나누어 나타낸 그림.\n- 예: 37 → 줄기 3, 잎 7\n- 잎은 보통 크기순으로 써요. 잎의 개수 = 변량의 개수\n자료의 분포를 한눈에 보면서 원래 값도 알 수 있어요.',
      },
      {
        title: '도수분포표',
        body: '- **계급**: 변량을 일정한 간격으로 나눈 구간 (예: 60 이상 70 미만)\n- **계급의 크기**: 구간의 너비, **도수**: 각 계급에 속하는 변량의 개수\n- **계급값**: 계급의 가운데 값 $= \\dfrac{(\\text{양 끝 값의 합})}{2}$\n도수분포표에서 평균 $= \\dfrac{\\{(\\text{계급값}) \\times (\\text{도수})\\}\\text{의 총합}}{(\\text{도수의 총합})}$',
      },
      {
        title: '히스토그램과 도수분포다각형',
        body: '- **히스토그램**: 가로축에 계급, 세로축에 도수를 써서 직사각형으로 나타낸 그래프\n- (직사각형의 넓이의 합) = (계급의 크기) × (도수의 총합)\n- **도수분포다각형**: 히스토그램 각 직사각형 윗변의 중점을 이은 꺾은선. 양 끝에 도수 0인 계급을 하나씩 추가해요. 다각형과 가로축이 둘러싼 넓이 = 히스토그램 넓이',
      },
      {
        title: '상대도수',
        body: '$$(\\text{상대도수}) = \\frac{(\\text{그 계급의 도수})}{(\\text{도수의 총합})}$$\n- 상대도수의 총합은 항상 $1$\n- (그 계급의 도수) = (도수의 총합) × (상대도수)\n- 도수의 총합이 다른 두 집단을 비교할 때 편리해요. 백분율(%)로 바꾸려면 100을 곱해요.',
      },
    ],
    skills: [
      {
        id: 'median-mode',
        title: '중앙값과 최빈값',
        gen(r, level) {
          if (level === 1) {
            const n = r.pick([5, 7, 9]);
            const data = Array.from({ length: n }, () => r.int(1, 30));
            if (r.chance(0.6)) {
              const md = median(data);
              const sorted = [...data].sort((a, b) => a - b);
              return {
                q: `다음 자료의 중앙값을 구하세요.\n$$${data.join(',\\ ')}$$`,
                answer: { type: 'num', value: md },
                steps: [`크기순으로 나열: $${sorted.join(', ')}$`, `$${n}$ 개 중 $${(n + 1) / 2}$ 번째 값: $${md}$`],
              };
            }
            const mode = r.pick(data);
            const d2 = [...data, mode, mode];
            const cnt = new Map<number, number>();
            d2.forEach((x) => cnt.set(x, (cnt.get(x) ?? 0) + 1));
            const mx = Math.max(...cnt.values());
            if ([...cnt.values()].filter((c) => c === mx).length > 1) return this.gen(r, level);
            const sh = r.shuffle(d2);
            return {
              q: `다음 자료의 최빈값을 구하세요.\n$$${sh.join(',\\ ')}$$`,
              answer: { type: 'num', value: mode },
              steps: [`$${mode}$ 이 $${mx}$ 번으로 가장 많이 나타납니다.`, `최빈값: $${mode}$`],
            };
          }
          if (level === 2) {
            const n = r.pick([6, 8, 10]);
            const data = Array.from({ length: n }, () => r.int(10, 60));
            const md = median(data);
            const sorted = [...data].sort((a, b) => a - b);
            const item = r.pick(['턱걸이 횟수(회)', '하루 독서 시간(분)', '줄넘기 기록(회)', '키보드 타자 수(타/10초)']);
            return {
              q: `다음은 학생 $${n}$ 명의 ${item}입니다. 중앙값을 구하세요.\n$$${data.join(',\\ ')}$$`,
              answer: { type: 'num', value: md },
              steps: [`크기순: $${sorted.join(', ')}$`, `가운데 두 값 $${sorted[n / 2 - 1]}$, $${sorted[n / 2]}$ 의 평균: $${dec(md)}$`],
              hint: '변량의 개수가 짝수이면 가운데 두 값의 평균이에요.',
            };
          }
          for (;;) {
            const ks = r.sample([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], 5).sort((a, b) => a - b);
            if (ks[2] - ks[1] < 2) continue;
            const x = r.int(ks[1] + 1, ks[2] - 1);
            const M = (x + ks[2]) / 2;
            const shown = r.shuffle([...ks.map(String), 'x']);
            return {
              q: `다음 자료의 중앙값이 $${dec(M)}$ 일 때, $x$ 의 값을 구하세요.\n$$${shown.join(',\\ ')}$$`,
              answer: { type: 'num', value: x },
              steps: [`$x$ 를 뺀 다섯 수를 크기순으로: $${ks.join(', ')}$`, `변량이 6개이므로 중앙값은 3, 4번째 값의 평균이고, $${dec(M)}$ 은 $${ks[1]}$ 과 $${ks[2]}$ 사이이므로 $x$ 가 3번째 값입니다.`, `$\\frac{x + ${ks[2]}}{2} = ${dec(M)}$, $x = ${x}$`],
            };
          }
        },
      },
      {
        id: 'mean',
        title: '평균',
        gen(r, level) {
          const name = r.pick(NAMES);
          if (level === 1) {
            for (;;) {
              const m = r.int(60, 90);
              const xs = Array.from({ length: 4 }, () => m + r.int(-12, 12));
              const last = 5 * m - sum(xs);
              if (last < 40 || last > 100) continue;
              const data = [...xs, last];
              return {
                q: `${name}의 다섯 번의 수학 쪽지 시험 점수가 다음과 같습니다. 평균을 구하세요.\n$$${data.join(',\\ ')}$$`,
                answer: { type: 'num', value: m, unit: '점' },
                steps: [`총합: $${data.join(' + ')} = ${5 * m}$`, `평균: $${5 * m} \\div 5 = ${m}$ 점`],
              };
            }
          }
          if (level === 2) {
            for (;;) {
              const n = r.int(4, 6);
              const m = r.int(10, 30);
              const xs = Array.from({ length: n - 1 }, () => m + r.int(-8, 8));
              const x = n * m - sum(xs);
              if (x < 1 || x > 60) continue;
              return {
                q: `다음 자료의 평균이 $${m}$ 일 때, $x$ 의 값을 구하세요.\n$$${r.shuffle([...xs.map(String), 'x']).join(',\\ ')}$$`,
                answer: { type: 'num', value: x },
                steps: [`(총합) = (평균) × (개수) $= ${m} \\times ${n} = ${n * m}$`, `$x = ${n * m} - ${sum(xs)} = ${x}$`],
              };
            }
          }
          if (r.chance(0.5)) {
            for (;;) {
              const n1 = r.int(10, 25);
              const n2 = r.int(10, 25);
              const m1 = r.int(60, 85);
              const m2 = r.int(60, 85);
              const tot = n1 * m1 + n2 * m2;
              const mean = tot / (n1 + n2);
              if (Math.abs(mean * 10 - Math.round(mean * 10)) > 1e-9 || m1 === m2) continue;
              return {
                q: `A 반 학생 $${n1}$ 명의 수학 평균은 $${m1}$ 점, B 반 학생 $${n2}$ 명의 수학 평균은 $${m2}$ 점입니다. 두 반 전체 학생의 수학 평균을 구하세요.`,
                answer: { type: 'num', value: round(mean, 1), unit: '점' },
                steps: [`A 반 총점: $${n1} \\times ${m1} = ${n1 * m1}$, B 반 총점: $${n2} \\times ${m2} = ${n2 * m2}$`, `전체 평균: $\\frac{${tot}}{${n1 + n2}} = ${dec(mean)}$ 점`],
                hint: '두 평균을 그냥 더해서 2로 나누면 안 돼요.',
              };
            }
          }
          for (;;) {
            const n = r.pick([5, 8, 10]);
            const m = r.int(15, 40);
            const wrong = r.int(10, 60);
            const right = r.int(10, 60);
            const newMean = (n * m - wrong + right) / n;
            if (wrong === right || Math.abs(newMean * 10 - Math.round(newMean * 10)) > 1e-9) continue;
            return {
              q: `변량 $${n}$ 개의 평균을 구했더니 $${m}$ ${lastSound(String(m))?.[0] ? '이었는데' : '였는데'}, 변량 하나를 $${right}$ 대신 $${wrong}$ 로 잘못 보고 계산한 것이었습니다. 바른 평균을 구하세요.`,
              answer: { type: 'num', value: round(newMean, 1) },
              steps: [`잘못 구한 총합: $${m} \\times ${n} = ${m * n}$`, `바른 총합: $${m * n} - ${wrong} + ${right} = ${m * n - wrong + right}$`, `바른 평균: $${m * n - wrong + right} \\div ${n} = ${dec(newMean)}$`],
            };
          }
        },
      },
      {
        id: 'stem-leaf',
        title: '줄기와 잎 그림',
        gen(r, level) {
          const N = 20;
          const lo = r.int(4, 6);
          let data: number[] = [];
          while (data.length < N) {
            const v = r.int(lo * 10, 99);
            if (!data.includes(v)) data.push(v);
          }
          data = data.sort((a, b) => a - b);
          const table = stemLeaf(data);
          const what = r.pick(['수학 점수', '영어 점수', '과학 수행평가 점수']);
          const head = `다음은 어느 반 학생 $${N}$ 명의 ${what}를 줄기와 잎 그림으로 나타낸 것입니다. (단, $6|3$ 은 63점)`;
          if (level === 1) {
            if (r.chance(0.5)) {
              const cnts = table.slice(1).map((row) => (row[1] === '-' ? 0 : row[1].split(/\s+/).length));
              const mx = Math.max(...cnts);
              if (cnts.filter((c) => c === mx).length > 1) return this.gen(r, level);
              const stem = Number(table[1 + cnts.indexOf(mx)][0]);
              return {
                q: `${head}\n잎이 가장 많은 줄기를 구하세요.`,
                table,
                answer: { type: 'num', value: stem },
                steps: [`줄기별 잎의 개수: ${table.slice(1).map((row, i) => `$${row[0]}$ → $${cnts[i]}$ 개`).join(', ')}`, `잎이 가장 많은 줄기: $${stem}$`],
              };
            }
            return {
              q: `${head}\n가장 높은 점수와 가장 낮은 점수의 차를 구하세요.`,
              table,
              answer: { type: 'num', value: data[N - 1] - data[0], unit: '점' },
              steps: [`가장 높은 점수 $${data[N - 1]}$ 점, 가장 낮은 점수 $${data[0]}$ 점`, `$${data[N - 1]} - ${data[0]} = ${data[N - 1] - data[0]}$ 점`],
            };
          }
          if (level === 2) {
            if (r.chance(0.5)) {
              const k = r.pick(data.slice(5, 16));
              const c = data.filter((x) => x >= k).length;
              return {
                q: `${head}\n점수가 $${k}$ 점 이상인 학생 수를 구하세요.`,
                table,
                answer: { type: 'num', value: c, unit: '명' },
                steps: [`$${k}$ 점 이상: $${data.filter((x) => x >= k).join(', ')}$`, `$${c}$ 명`],
              };
            }
            const md = median(data);
            return {
              q: `${head}\n중앙값을 구하세요.`,
              table,
              answer: { type: 'num', value: md, unit: '점' },
              steps: [`$20$ 명이므로 $10$ 번째와 $11$ 번째 점수의 평균`, `$\\frac{${data[9]} + ${data[10]}}{2} = ${dec(md)}$ 점`],
            };
          }
          if (r.chance(0.5)) {
            const k = r.int(3, 8);
            return {
              q: `${head}\n점수가 높은 쪽에서 $${k}$ 번째인 학생의 점수를 구하세요.`,
              table,
              answer: { type: 'num', value: data[N - k], unit: '점' },
              steps: ['가장 아래 줄기의 큰 잎부터 거꾸로 셉니다.', `높은 쪽부터: $${data.slice(N - k).reverse().join(', ')}$`, `$${k}$ 번째: $${data[N - k]}$ 점`],
            };
          }
          const k = r.pick(data.slice(8, 18));
          const c = data.filter((x) => x >= k).length;
          return {
            q: `${head}\n점수가 $${k}$ 점 이상인 학생은 전체의 몇 % 인지 구하세요.`,
            table,
            answer: { type: 'num', value: (c / N) * 100, unit: '%' },
            steps: [`$${k}$ 점 이상인 학생: $${c}$ 명`, `$\\frac{${c}}{${N}} \\times 100 = ${(c / N) * 100}$ %`],
          };
        },
      },
      {
        id: 'freq-table',
        title: '도수분포표',
        gen(r, level) {
          const w = r.pick([5, 10]);
          const a0 = w === 10 ? r.pick([40, 50]) : r.pick([10, 15, 20]);
          const k = 5;
          const N = r.pick([20, 25, 30, 40]);
          const f = freqs(r, k, N);
          const unit = w === 10 ? '점' : '회';
          const subj = w === 10 ? '수학 점수(점)' : '턱걸이 기록(회)';
          const rows = f.map((v, i) => [`$${a0 + w * i}$ 이상 ~ $${a0 + w * (i + 1)}$ 미만`, String(v)]);
          if (level === 1) {
            const hid = r.int(0, k - 1);
            const table = [[subj, '학생 수(명)'], ...rows.map((row, i) => (i === hid ? [row[0], 'A'] : row)), ['합계', String(N)]];
            return {
              q: '다음 도수분포표에서 $A$ 의 값을 구하세요.',
              table,
              answer: { type: 'num', value: f[hid] },
              steps: [`$A = ${N} - (${f.filter((_, i) => i !== hid).join(' + ')})$`, `$= ${f[hid]}$`],
            };
          }
          const table = [[subj, '학생 수(명)'], ...rows, ['합계', String(N)]];
          if (level === 2) {
            if (r.chance(0.5)) {
              const i = f.indexOf(Math.max(...f));
              const cv = a0 + w * i + w / 2;
              return {
                q: '다음 도수분포표에서 도수가 가장 큰 계급의 계급값을 구하세요.',
                table,
                answer: { type: 'num', value: cv, unit },
                steps: [`도수가 가장 큰 계급: $${a0 + w * i}$ 이상 $${a0 + w * (i + 1)}$ 미만 ($${f[i]}$ 명)`, `계급값: $\\frac{${a0 + w * i} + ${a0 + w * (i + 1)}}{2} = ${dec(cv)}$ ${unit}`],
              };
            }
            const j = r.int(2, k - 1);
            const c = sum(f.slice(j));
            const pct = (c / N) * 100;
            const exact = Number.isInteger(round(pct * 10, 6)); // 소수 첫째 자리에서 끝나는지
            const pct1 = Math.round(round(pct * 10, 6)) / 10;
            return {
              q: `다음 도수분포표에서 기록이 $${a0 + w * j}$ ${unit} 이상인 학생은 전체의 몇 % 인지 구하세요.${exact ? '' : ' (반올림하여 소수점 아래 첫째 자리까지)'}`,
              table,
              answer: { type: 'num', value: pct1, unit: '%' },
              steps: [`$${a0 + w * j}$ ${unit} 이상: ${f.length - j > 1 ? `$${f.slice(j).join(' + ')} = ${c}$` : `$${c}$`} 명`, `$\\frac{${c}}{${N}} \\times 100 ${exact ? '=' : '\\approx'} ${dec(pct1)}$ %`],
            };
          }
          const cvs = f.map((_, i) => a0 + w * i + w / 2);
          const tot = sum(f.map((v, i) => v * cvs[i]));
          const mean = tot / N;
          return {
            q: `다음 도수분포표에서 평균을 구하세요.${Number.isInteger(round(mean * 10, 6)) ? '' : ' (반올림하여 소수점 아래 첫째 자리까지)'}`,
            table,
            answer: { type: 'num', value: Math.round(round(mean * 10, 6)) / 10, unit },
            steps: [
              `계급값: $${cvs.map((v) => dec(v)).join(', ')}$`,
              `(계급값 × 도수) 의 합: $${f.map((v, i) => `${dec(cvs[i])} \\times ${v}`).join(' + ')} = ${dec(tot)}$`,
              Number.isInteger(round(mean * 10, 6)) ? `평균: $${dec(tot)} \\div ${N} = ${dec(round(mean, 4))}$ ${unit}` : `평균: $${dec(tot)} \\div ${N} = ${dec(round(mean, 4))}\\cdots \\approx ${dec(Math.round(round(mean * 10, 6)) / 10)}$ ${unit}`,
            ],
            hint: '각 계급의 변량은 계급값이라고 생각해요.',
          };
        },
      },
      {
        id: 'histogram',
        title: '히스토그램',
        gen(r, level) {
          const w = r.pick([2, 5, 10]);
          const a0 = w === 10 ? r.pick([40, 50]) : w === 5 ? r.pick([10, 20, 30]) : r.pick([140, 150]) / 10;
          const k = r.int(5, 6);
          const N = r.pick([20, 25, 30, 32, 36, 40]);
          const f = freqs(r, k, N);
          const labels = f.map((_, i) => `${a0 + w * i}~${a0 + w * (i + 1)}`);
          const fig = barChart(labels, f, { unit: '명' });
          const subj = w === 10 ? '수학 점수(점)' : w === 5 ? '1분 동안 윗몸 일으키기 횟수(회)' : '일주일 동안의 운동 시간(시간)';
          const sname = subj.split('(')[0];
          const hu = subj.split('(')[1].replace(')', '');
          const head = `다음은 어느 반 학생들의 ${sname}${eul(sname)} 조사하여 나타낸 히스토그램입니다. (각 막대 아래 수는 계급 "이상 ~ 미만", 단위: ${subj.split('(')[1].replace(')', '')})`;
          if (level === 1) {
            return {
              q: `${head}\n전체 학생 수를 구하세요.`,
              fig,
              answer: { type: 'num', value: N, unit: '명' },
              steps: [`각 계급의 도수의 합: $${f.join(' + ')} = ${N}$ 명`],
            };
          }
          if (level === 2) {
            const sortedF = [...f].sort((a, b) => b - a);
            const t = r.int(0, 1);
            if (t === 0 && sortedF[1] !== sortedF[2] && sortedF[0] !== sortedF[1]) {
              const i = f.indexOf(sortedF[1]);
              return {
                q: `${head}\n도수가 두 번째로 큰 계급의 계급값을 구하세요.`,
                fig,
                answer: { type: 'num', value: a0 + w * i + w / 2 },
                steps: [`도수가 두 번째로 큰 계급: $${a0 + w * i}$ 이상 $${a0 + w * (i + 1)}$ 미만 ($${f[i]}$ 명)`, `계급값: $${dec(a0 + w * i + w / 2)}$`],
              };
            }
            const j = r.int(1, k - 2);
            return {
              q: `${head}\n${hu === '점' ? '점수가 ' : hu === '회' ? '기록이 ' : '운동 시간이 '}$${a0 + w * j}$ ${hu} 미만인 학생 수를 구하세요.`,
              fig,
              answer: { type: 'num', value: sum(f.slice(0, j)), unit: '명' },
              steps: [j > 1 ? `$${a0 + w * j}$ ${hu} 미만인 계급들의 도수의 합: $${f.slice(0, j).join(' + ')} = ${sum(f.slice(0, j))}$ 명` : `$${a0}$ ${hu} 이상 $${a0 + w}$ ${hu} 미만인 계급의 도수: $${f[0]}$ 명`],
            };
          }
          if (r.chance(0.5)) {
            return {
              q: `${head}\n히스토그램의 모든 직사각형의 넓이의 합을 구하세요. (가로 = 계급의 크기, 세로 = 도수)`,
              fig,
              answer: { type: 'num', value: w * N },
              steps: [`계급의 크기: $${w}$, 도수의 총합: $${N}$`, `넓이의 합 = (계급의 크기) × (도수의 총합) $= ${w} \\times ${N} = ${w * N}$`],
            };
          }
          const j = r.int(1, k - 1);
          const c = sum(f.slice(j));
          const pct = (c / N) * 100;
          const exact = Number.isInteger(round(pct * 10, 6));
          const pct1 = Math.round(round(pct * 10, 6)) / 10;
          return {
            q: `${head}\n${hu === '점' ? '점수가 ' : hu === '회' ? '기록이 ' : '운동 시간이 '}$${a0 + w * j}$ ${hu} 이상인 학생은 전체의 몇 % 인지 구하세요.${exact ? '' : ' (반올림하여 소수점 아래 첫째 자리까지)'}`,
            fig,
            answer: { type: 'num', value: pct1, unit: '%' },
            steps: [`$${a0 + w * j}$ ${hu} 이상: ${k - j > 1 ? `$${f.slice(j).join(' + ')} = ${c}$` : `$${c}$`} 명`, `$\\frac{${c}}{${N}} \\times 100 ${exact ? '=' : '\\approx'} ${dec(pct1)}$ %`],
          };
        },
      },
      {
        id: 'relative',
        title: '상대도수',
        gen(r, level) {
          const N = r.pick([20, 25, 40, 50]);
          if (level === 1) {
            const f = r.int(1, N / 2);
            return {
              q: `전체 학생 $${N}$ 명 중 어떤 계급의 도수가 $${f}$ 명일 때, 이 계급의 상대도수를 구하세요.`,
              answer: { type: 'num', value: f / N, display: 'dec' },
              steps: [`$\\frac{${f}}{${N}} = ${dec(f / N)}$`],
            };
          }
          if (level === 2) {
            const f = r.int(2, N / 2);
            const rel = f / N;
            if (r.chance(0.5)) {
              return {
                q: `도수의 총합이 $${N}$ 인 도수분포표에서 상대도수가 $${dec(rel)}$ 인 계급의 도수를 구하세요.`,
                answer: { type: 'num', value: f },
                steps: [`(도수) = (도수의 총합) × (상대도수)`, `$${N} \\times ${dec(rel)} = ${f}$`],
              };
            }
            return {
              q: `어떤 계급의 도수가 $${f}$ 이고 상대도수가 $${dec(rel)}$ 일 때, 도수의 총합을 구하세요.`,
              answer: { type: 'num', value: N },
              steps: [`(도수의 총합) = (도수) ÷ (상대도수)`, `$${f} \\div ${dec(rel)} = ${N}$`],
            };
          }
          const k = 5;
          const f = freqs(r, k, N);
          const hid = r.int(0, k - 1);
          const rows = f.map((v, i) => [`$${50 + 10 * i}$ 이상 ~ $${60 + 10 * i}$ 미만`, i === hid ? 'A' : dec(v / N)]);
          return {
            q: `다음은 어느 학년 학생 $${N}$ 명의 점수에 대한 상대도수의 분포표입니다. $A$ 에 해당하는 계급의 학생 수를 구하세요.`,
            table: [['점수(점)', '상대도수'], ...rows, ['합계', '1']],
            answer: { type: 'num', value: f[hid], unit: '명' },
            steps: [`상대도수의 총합은 1이므로 $A = 1 - (${f.filter((_, i) => i !== hid).map((v) => dec(v / N)).join(' + ')}) = ${dec(f[hid] / N)}$`, `학생 수: $${N} \\times ${dec(f[hid] / N)} = ${f[hid]}$ 명`],
          };
        },
      },
    ],
  },
};

function comma(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '{,}');
}
function comma180(n: number): string {
  return comma(180 * (n - 2));
}

/** 받침 있으면 '을', 없으면 '를' */
function eul(w: string): string {
  const c = w.charCodeAt(w.length - 1) - 0xac00;
  return c >= 0 && c < 11172 && c % 28 !== 0 ? '을' : '를';
}
