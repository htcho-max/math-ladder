// 초6-1 콘텐츠
import type { ContentMap } from '../../core/types';
import type { Rng } from '../../core/rng';
import { F } from '../../core/frac';
import { gcd, round } from '../../core/nt';
import { comma, makeChoices, numChoices } from '../../core/tex';
import { regularPolygon, Svg } from '../../core/fig';
import { pickName, josa, jo, nj, fracAns, intAns, decAns, ft, mt, properFrac, reduceTex, dt, mkDec, ro, fj } from './util';
import { cuboidFig, prismFig, bandFig, pieFig, pictureFig } from './fig56';

const POLY = ['', '', '', '삼각', '사각', '오각', '육각', '칠각', '팔각', '구각', '십각'];

/** 각기둥 전개도 (밑면 정n각형 한 변 a, 높이 h) */
function prismNetFig(n: number, o: { aLabel?: string; hLabel?: string } = {}): string {
  const a = 30,
    h = 52;
  const W = n * a + 84,
    R = a / (2 * Math.sin(Math.PI / n)),
    ap = a / (2 * Math.tan(Math.PI / n));
  const H = h + 2 * (R + ap) + 20;
  const s = new Svg(W, Math.round(H));
  const x0 = 30,
    y0 = R + ap + 10;
  for (let i = 0; i < n; i++) s.rect(x0 + i * a, y0, a, h, { cls: 'acc', fill: true });
  const k = Math.floor((n - 1) / 2);
  const cx = x0 + k * a + a / 2;
  s.poly(regularPolygon(n, cx, y0 - ap, R, 90 - 180 / n), { cls: 'acc', fill: true });
  s.poly(regularPolygon(n, cx, y0 + h + ap, R, -90 - 180 / n), { cls: 'acc', fill: true });
  if (o.aLabel) s.text(x0 + a / 2, y0 + h + 12, o.aLabel, { size: 11 });
  if (o.hLabel) s.text(x0 + n * a + 6, y0 + h / 2, o.hLabel, { size: 12, anchor: 'start' });
  return s.toString();
}

/** 합이 100 이 되는 5의 배수 백분율 k개 (각각 minP 이상 — 그림에 그릴 때는 글자가 겹치지 않게 10 이상) */
function percents(r: Rng, k: number, minP = 5): number[] {
  for (;;) {
    const cuts = r.sample([...Array(19)].map((_, i) => (i + 1) * 5), k - 1).sort((x, y) => x - y);
    const ps = [cuts[0], ...cuts.slice(1).map((c, i) => c - cuts[i]), 100 - cuts[cuts.length - 1]];
    if (ps.every((p) => p >= minP)) return ps.sort((x, y) => y - x);
  }
}

export const content: ContentMap = {
  // ═════════════ 6-1-1 분수의 나눗셈 ═════════════
  'e6a-1': {
    concepts: [
      {
        title: '(자연수) ÷ (자연수) 의 몫을 분수로',
        body: '나눗셈의 몫을 분수로 나타낼 수 있어요. **나누어지는 수가 분자, 나누는 수가 분모**예요.\n$$3 \\div 4 = \\frac{3}{4}, \\qquad 7 \\div 3 = \\frac{7}{3} = 2\\frac{1}{3}$$',
      },
      {
        title: '분자가 자연수의 배수인 (분수) ÷ (자연수)',
        body: '분자를 자연수로 나누어요.\n$$\\frac{6}{7} \\div 3 = \\frac{6 \\div 3}{7} = \\frac{2}{7}$$',
      },
      {
        title: '(분수) ÷ (자연수) 를 곱셈으로',
        body: '$\\div (\\text{자연수})$ 는 $\\times \\frac{1}{\\text{자연수}}$ 와 같아요.\n$$\\frac{3}{5} \\div 4 = \\frac{3}{5} \\times \\frac{1}{4} = \\frac{3}{20}$$\n5학년에서 배운 분수의 곱셈을 이용해요.',
        example: { q: '$\\frac{4}{9} \\div 6$', a: '$\\frac{4}{9} \\times \\frac{1}{6} = \\frac{4}{54} = \\frac{2}{27}$' },
      },
      {
        title: '(대분수) ÷ (자연수)',
        body: '대분수를 **가분수로 바꾼 뒤** 나눠요.\n$$2\\frac{2}{3} \\div 4 = \\frac{8}{3} \\div 4 = \\frac{8 \\div 4}{3} = \\frac{2}{3}$$',
      },
    ],
    skills: [
      {
        id: 'nat-div-nat',
        title: '(자연수) ÷ (자연수) 를 분수로',
        gen(r, level) {
          let a: number, b: number;
          do {
            b = r.int(2, level === 3 ? 15 : 9);
            a = level === 1 ? r.int(1, b - 1) : r.int(b + 1, b * (level === 3 ? 6 : 3));
          } while (a % b === 0);
          const f = new F(a, b);
          if (level === 3) {
            return {
              q: `$\\square$ 안에 알맞은 수를 기약분수로 나타내세요.\n$$${b} \\times \\square = ${a}$$`,
              answer: fracAns(f),
              steps: [`$\\square = ${a} \\div ${b}$`, `$= ${reduceTex(a, b)}$`],
            };
          }
          return {
            q: `나눗셈의 몫을 기약분수로 나타내세요.\n$$${a} \\div ${b}$$`,
            answer: fracAns(f),
            steps: ['나누어지는 수가 분자, 나누는 수가 분모예요.', `$${a} \\div ${b} = ${reduceTex(a, b)}$`],
          };
        },
      },
      {
        id: 'frac-div-nat',
        title: '(분수) ÷ (자연수)',
        gen(r, level) {
          const k = r.int(2, level === 1 ? 5 : 9);
          if (level === 1) {
            const d = r.int(3, 11);
            const m = r.int(1, Math.max(1, Math.floor((d - 1) / k)));
            const n = m * k;
            // 기약분수가 아닌 분수(6/10 등)는 문제로 내지 않음
            if (n >= d || gcd(n, d) !== 1) return content['e6a-1'].skills[1].gen(r, level);
            return {
              q: `계산하세요.\n$$\\frac{${n}}{${d}} \\div ${k}$$`,
              answer: fracAns(new F(m, d)),
              steps: [`분자가 $${k}$ 의 배수이므로 분자를 나눠요.`, `$\\frac{${n} \\div ${k}}{${d}} = ${reduceTex(m, d)}$`],
            };
          }
          const base = level === 2 ? properFrac(r, 2, 12) : properFrac(r, 2, 9).add(r.int(1, 2));
          const res = base.div(k);
          return {
            q: `계산하세요.\n$$${ft(base)} \\div ${k}$$`,
            answer: fracAns(res),
            steps: [`$${ft(base)} \\div ${k} = ${ft(base)} \\times \\frac{1}{${k}}$`, `$= \\frac{${base.n}}{${base.d * k}}${new F(base.n, base.d * k).d !== base.d * k ? ` = ${mt(res)}` : ''}$`],
            hint: '÷ (자연수) 를 × 1/(자연수) 로 바꾸어 보세요.',
          };
        },
      },
      {
        id: 'mixed-div-nat',
        title: '(대분수) ÷ (자연수)',
        gen(r, level) {
          const k = r.int(2, level === 1 ? 4 : 9);
          let f: F;
          if (level === 1) {
            // 가분수의 분자가 k 의 배수
            for (;;) {
              const d = r.int(2, 7);
              const w = r.int(1, 4);
              const n = r.int(1, d - 1);
              if ((w * d + n) % k === 0) {
                f = new F(w * d + n, d);
                if (f.d === d) break;
              }
            }
          } else f = properFrac(r, 2, level === 2 ? 9 : 12).add(r.int(1, level === 2 ? 4 : 8));
          const res = f.div(k);
          return {
            q: `계산하세요.\n$$${mt(f)} \\div ${k}$$`,
            answer: fracAns(res),
            steps: [`가분수로: $${mt(f)} = ${ft(f)}$`, f.n % k === 0 ? `$\\frac{${f.n} \\div ${k}}{${f.d}} = ${mt(res)}$` : `$${ft(f)} \\times \\frac{1}{${k}} = \\frac{${f.n}}{${f.d * k}}${mt(res) !== `\\frac{${f.n}}{${f.d * k}}` ? ` = ${mt(res)}` : ''}$`],
          };
        },
      },
      {
        id: 'reverse',
        title: '어떤 수 구하기',
        gen(r, level) {
          const k = r.int(2, 9);
          const x = level === 1 ? properFrac(r, 2, 9) : properFrac(r, 2, 9).add(r.int(0, 3));
          const p = x.mul(k);
          if (level === 3) {
            const res = x.div(k);
            return {
              q: `어떤 수를 ${ro(k)} 나누어야 할 것을 잘못하여 곱했더니 ${fj(p, '이/가', true)} 되었습니다. 바르게 계산한 값을 기약분수로 나타내세요.`,
              answer: fracAns(res),
              steps: [`어떤 수 $= ${mt(p)} \\div ${k} = ${mt(x)}$`, `바른 계산: $${mt(x)} \\div ${k} = ${mt(res)}$`],
            };
          }
          return {
            q: `$\\square$ 안에 알맞은 수를 기약분수로 나타내세요.\n$$\\square \\times ${k} = ${mt(p)}$$`,
            answer: fracAns(x),
            steps: [`$\\square = ${mt(p)} \\div ${k}$`, `$= ${ft(p)} \\times \\frac{1}{${k}} = ${mt(x)}$`],
          };
        },
      },
      {
        id: 'word',
        title: '분수의 나눗셈 문장제',
        gen(r, level) {
          const nm = pickName(r);
          if (level === 1) {
            const n = r.int(2, 9);
            let L = r.int(1, 20);
            if (L % n === 0) L += 1;
            const res = new F(L, n);
            return {
              q: `주스 $${L}$ L 를 $${n}$ 명이 똑같이 나누어 마시려고 합니다. 한 명이 마실 수 있는 주스는 몇 L 인가요?`,
              answer: fracAns(res, { unit: 'L' }),
              steps: [`$${L} \\div ${n} = ${reduceTex(L, n)}$ (L)`],
            };
          }
          if (level === 2) {
            const f = properFrac(r, 2, 9).add(r.int(0, 2));
            const k = r.int(2, 6);
            const res = f.div(k);
            return {
              q: `${josa(nm, '은/는')} 길이가 $${mt(f)}$ m 인 끈을 $${k}$ 도막으로 똑같이 잘랐습니다. 한 도막의 길이는 몇 m 인가요?`,
              answer: fracAns(res, { unit: 'm' }),
              steps: [`$${mt(f)} \\div ${k}$`, `$= ${ft(f)} \\times \\frac{1}{${k}} = ${mt(res)}$ (m)`],
            };
          }
          if (r.chance(0.5)) {
            const n = r.int(3, 8);
            const per = properFrac(r, 2, 9).add(r.int(0, 3)).mul(n);
            const side = per.div(n);
            return {
              q: `둘레가 $${mt(per)}$ cm 인 정${POLY[n]}형이 있습니다. 이 정${POLY[n]}형의 한 변의 길이는 몇 cm 인가요?`,
              answer: fracAns(side, { unit: 'cm' }),
              steps: [`정${POLY[n]}형은 변이 $${n}$ 개이고 길이가 모두 같아요.`, `$${mt(per)} \\div ${n} = ${mt(side)}$ (cm)`],
            };
          }
          const w = r.int(2, 9);
          const area = properFrac(r, 2, 9).add(r.int(1, 6));
          const hgt = area.div(w);
          return {
            q: `넓이가 $${mt(area)}$ m² 이고 가로가 $${w}$ m 인 직사각형이 있습니다. 세로는 몇 m 인가요?`,
            answer: fracAns(hgt, { unit: 'm' }),
            steps: [`(세로) $=$ (넓이) $\\div$ (가로)`, `$${mt(area)} \\div ${w} = ${ft(area)} \\times \\frac{1}{${w}} = ${mt(hgt)}$ (m)`],
          };
        },
      },
    ],
  },

  // ═════════════ 6-1-2 각기둥과 각뿔 ═════════════
  'e6a-2': {
    concepts: [
      {
        title: '각기둥',
        body: '위아래에 있는 두 면이 서로 **평행하고 합동인 다각형**이고, 옆면이 모두 **직사각형**인 입체도형을 각기둥이라고 해요.\n- 평행한 두 면: **밑면**, 밑면과 만나는 면: **옆면**\n- 밑면의 모양에 따라 삼각기둥, 사각기둥, 오각기둥 … 이라고 해요.\n- 두 밑면 사이의 거리를 **높이**라고 해요.',
      },
      {
        title: '각기둥의 구성 요소',
        body: '밑면이 $n$각형인 각기둥은\n- 면의 수: $n + 2$\n- 모서리의 수: $n \\times 3$\n- 꼭짓점의 수: $n \\times 2$\n예) 오각기둥: 면 $7$, 모서리 $15$, 꼭짓점 $10$',
      },
      {
        title: '각뿔',
        body: '밑면이 **다각형**이고 옆면이 모두 **삼각형**인 입체도형을 각뿔이라고 해요.\n- 옆면이 모두 만나는 점: **각뿔의 꼭짓점**\n- 각뿔의 꼭짓점에서 밑면에 수직인 선분의 길이: **높이**\n- 밑면이 $n$각형이면 면 $n+1$, 모서리 $n \\times 2$, 꼭짓점 $n+1$',
      },
      {
        title: '각기둥의 전개도',
        body: '각기둥을 펼친 그림이에요. 밑면 $2$ 개와 옆면 $n$ 개(직사각형)로 이루어져요.\n- 옆면을 이어 붙인 큰 직사각형의 가로는 **밑면의 둘레**, 세로는 **각기둥의 높이**와 같아요.',
      },
    ],
    skills: [
      {
        id: 'name',
        title: '각기둥·각뿔의 이름',
        gen(r, level) {
          const n = r.int(3, level === 1 ? 6 : 8);
          const pyr = r.chance(0.5);
          const nm = (k: number, p: boolean) => `${POLY[k]}${p ? '뿔' : '기둥'}`;
          if (level === 3) {
            const faces = pyr ? n + 1 : n + 2;
            const edges = pyr ? 2 * n : 3 * n;
            const verts = pyr ? n + 1 : 2 * n;
            const which = r.int(0, 2);
            const info = which === 0 ? `옆면이 모두 ${pyr ? '삼각형' : '직사각형'}이고 면이 $${faces}$ 개` : which === 1 ? `옆면이 모두 ${pyr ? '삼각형' : '직사각형'}이고 모서리가 $${edges}$ 개` : `옆면이 모두 ${pyr ? '삼각형' : '직사각형'}이고 꼭짓점이 $${verts}$ 개`;
            return {
              q: `${info}인 입체도형의 이름은?`,
              answer: makeChoices(r, nm(n, pyr), [nm(n, !pyr), nm(n + 1, pyr), nm(n - 1, pyr), nm(n + 1, !pyr), nm(Math.max(3, n - 1), !pyr)], 5),
              steps: [`옆면이 ${pyr ? '삼각형 → 각뿔' : '직사각형 → 각기둥'}`, which === 0 ? `면의 수 $n ${pyr ? '+ 1' : '+ 2'} = ${faces}$ → $n = ${n}$` : which === 1 ? `모서리의 수 $n \\times ${pyr ? 2 : 3} = ${edges}$ → $n = ${n}$` : `꼭짓점의 수 $${pyr ? 'n + 1' : 'n \\times 2'} = ${verts}$ → $n = ${n}$`, `따라서 ${nm(n, pyr)}`],
            };
          }
          return {
            q: '다음 입체도형의 이름은?',
            fig: prismFig(n, { pyramid: pyr }),
            answer: makeChoices(r, nm(n, pyr), [nm(n, !pyr), nm(n + 1, pyr), nm(Math.max(3, n - 1), pyr), nm(n + 1, !pyr)], level === 1 ? 4 : 5),
            steps: [`옆면이 ${pyr ? '삼각형이므로 각뿔' : '직사각형이므로 각기둥'}이에요.`, `밑면이 ${POLY[n]}형이므로 ${nm(n, pyr)}`],
          };
        },
      },
      {
        id: 'count',
        title: '면·모서리·꼭짓점의 수',
        gen(r, level) {
          const n = r.int(3, level === 1 ? 8 : 12);
          const pyr = r.chance(0.5);
          const nm = `${POLY[n] ?? n + '각'}${pyr ? '뿔' : '기둥'}`;
          const v = { 면: pyr ? n + 1 : n + 2, 모서리: pyr ? 2 * n : 3 * n, 꼭짓점: pyr ? n + 1 : 2 * n };
          const keys = ['면', '모서리', '꼭짓점'] as const;
          if (level === 1) {
            const k = r.pick(keys);
            return {
              q: `${nm}의 ${josa(k, '은/는')} 모두 몇 개인가요?`,
              fig: prismFig(Math.min(n, 8), { pyramid: pyr }),
              answer: intAns(v[k], '개'),
              steps: [`밑면이 ${POLY[n]}형 ($n = ${n}$)`, `${nm}의 ${k}의 수: $${k === '면' ? (pyr ? `${n}+1` : `${n}+2`) : k === '모서리' ? `${n}\\times${pyr ? 2 : 3}` : pyr ? `${n}+1` : `${n}\\times2`} = ${v[k]}$`],
            };
          }
          if (level === 2) {
            const [k1, k2] = r.sample([...keys], 2);
            return {
              q: `${nm}의 ${k1}의 수와 ${k2}의 수의 합은 몇 개인가요?`,
              answer: intAns(v[k1] + v[k2], '개'),
              steps: [`${k1}: $${v[k1]}$ 개, ${k2}: $${v[k2]}$ 개`, `$${v[k1]} + ${v[k2]} = ${v[k1] + v[k2]}$ (개)`],
            };
          }
          const [k1, k2] = r.sample([...keys], 2);
          return {
            q: `${josa(k1, '이/가')} $${v[k1]}$ 개인 ${pyr ? '각뿔' : '각기둥'}이 있습니다. 이 ${pyr ? '각뿔' : '각기둥'}의 ${josa(k2, '은/는')} 몇 개인가요?`,
            answer: intAns(v[k2], '개'),
            steps: [`${pyr ? '각뿔' : '각기둥'}의 ${k1}의 수: ${k1 === '면' ? (pyr ? '$n+1$' : '$n+2$') : k1 === '모서리' ? (pyr ? '$n\\times2$' : '$n\\times3$') : pyr ? '$n+1$' : '$n\\times2$'} $= ${v[k1]}$ → $n = ${n}$ (${nm})`, `${k2}의 수: $${v[k2]}$ 개`],
          };
        },
      },
      {
        id: 'truth',
        title: '각기둥과 각뿔의 성질',
        gen(r, level) {
          const T = [
            '각기둥의 두 밑면은 서로 평행하고 합동입니다.',
            '각기둥의 옆면은 모두 직사각형입니다.',
            '각뿔의 옆면은 모두 삼각형입니다.',
            '각뿔의 밑면은 $1$ 개입니다.',
            '육각기둥의 꼭짓점은 $12$ 개입니다.',
            '오각뿔의 모서리는 $10$ 개입니다.',
            '각기둥의 밑면과 옆면은 서로 수직입니다.',
            '사각뿔의 면의 수와 꼭짓점의 수는 같습니다.',
          ];
          const Fs = [
            '각기둥의 옆면은 모두 삼각형입니다.',
            '각뿔의 밑면은 $2$ 개입니다.',
            '각뿔의 옆면은 모두 직사각형입니다.',
            '오각기둥의 모서리는 $10$ 개입니다.',
            '삼각뿔의 꼭짓점은 $3$ 개입니다.',
            '각기둥의 두 밑면은 서로 수직입니다.',
            '육각뿔의 면은 $8$ 개입니다.',
            '각뿔의 높이는 옆면의 모서리의 길이와 항상 같습니다.',
          ];
          const askTrue = level !== 2;
          const right = r.pick(askTrue ? T : Fs);
          const wr = r.sample(askTrue ? Fs : T, level === 1 ? 3 : 4);
          return {
            q: askTrue ? '각기둥과 각뿔에 대한 설명으로 **옳은** 것은?' : '각기둥과 각뿔에 대한 설명으로 **옳지 않은** 것은?',
            answer: makeChoices(r, right, wr, level === 1 ? 4 : 5),
            steps: [askTrue ? `옳은 설명: ${right}` : `옳지 않은 설명: ${right}`, '각기둥: 면 $n+2$, 모서리 $3n$, 꼭짓점 $2n$ / 각뿔: 면 $n+1$, 모서리 $2n$, 꼭짓점 $n+1$'],
          };
        },
      },
      {
        id: 'edge-sum',
        title: '모서리 길이의 합',
        gen(r, level) {
          const n = r.int(3, 6);
          const pyr = level === 2 ? true : level === 1 ? false : r.chance(0.5);
          const a = r.int(2, 9),
            h = r.int(4, 15);
          const total = pyr ? n * a + n * h : 2 * n * a + n * h;
          const nm = `${POLY[n]}${pyr ? '뿔' : '기둥'}`;
          if (level === 3) {
            return {
              q: `밑면이 한 변 $${a}$ cm 인 정${POLY[n]}형이고, 모든 모서리의 길이의 합이 $${total}$ cm 인 ${nm}${pyr ? '이 있습니다. 옆면의 모서리는 모두 길이가 같을 때, 옆면의 한 모서리의 길이는' : '이 있습니다. 이 각기둥의 높이는'} 몇 cm 인가요?`,
              answer: intAns(h, 'cm'),
              steps: [`밑면의 모서리: $${pyr ? '' : '2 \\times '}${n} \\times ${a} = ${pyr ? n * a : 2 * n * a}$ (cm)`, `${pyr ? '옆면의 모서리' : '높이를 나타내는 모서리'} $${n}$ 개의 합: $${total} - ${pyr ? n * a : 2 * n * a} = ${n * h}$`, `$${n * h} \\div ${n} = ${h}$ (cm)`],
            };
          }
          return {
            q: pyr ? `밑면이 한 변 $${a}$ cm 인 정${POLY[n]}형이고 옆면의 모서리가 모두 $${h}$ cm 인 ${nm}의 모든 모서리의 길이의 합은 몇 cm 인가요?` : `밑면이 한 변 $${a}$ cm 인 정${POLY[n]}형이고 높이가 $${h}$ cm 인 ${nm}의 모든 모서리의 길이의 합은 몇 cm 인가요?`,
            fig: prismFig(n, { pyramid: pyr, sideLabel: `${a} cm`, hLabel: pyr ? undefined : `${h} cm` }),
            answer: intAns(total, 'cm'),
            steps: pyr ? [`밑면의 모서리 $${n}$ 개: $${a} \\times ${n} = ${a * n}$`, `옆면의 모서리 $${n}$ 개: $${h} \\times ${n} = ${h * n}$`, `합: $${total}$ cm`] : [`밑면의 모서리 $${2 * n}$ 개: $${a} \\times ${2 * n} = ${2 * n * a}$`, `높이 모서리 $${n}$ 개: $${h} \\times ${n} = ${n * h}$`, `합: $${total}$ cm`],
          };
        },
      },
      {
        id: 'net',
        title: '각기둥의 전개도',
        gen(r, level) {
          const n = r.int(3, 6);
          const a = r.int(2, 9),
            h = r.int(3, 12);
          const fig = prismNetFig(n, { aLabel: `${a} cm`, hLabel: `${h} cm` });
          if (level === 1) {
            return {
              q: `밑면이 정${POLY[n]}형인 각기둥의 전개도입니다. 옆면을 모두 이어 붙인 직사각형의 가로는 몇 cm 인가요?`,
              fig,
              answer: intAns(n * a, 'cm'),
              steps: ['옆면을 이은 직사각형의 가로 $=$ 밑면의 둘레', `$${a} \\times ${n} = ${n * a}$ (cm)`],
            };
          }
          if (level === 2) {
            return {
              q: `밑면이 정${POLY[n]}형인 각기둥의 전개도입니다. 옆면 전체의 넓이는 몇 cm² 인가요?`,
              fig,
              answer: intAns(n * a * h, 'cm²'),
              steps: [`옆면을 이은 직사각형: 가로 $${a} \\times ${n} = ${n * a}$ cm, 세로 $${h}$ cm`, `넓이: $${n * a} \\times ${h} = ${n * a * h}$ (cm²)`],
            };
          }
          const per = n * a;
          return {
            q: `밑면이 정${POLY[n]}형인 각기둥의 전개도에서 옆면을 이어 붙인 직사각형의 넓이가 $${per * h}$ cm² 이고 높이가 $${h}$ cm 입니다. 밑면의 한 변의 길이는 몇 cm 인가요?`,
            fig: prismNetFig(n, { hLabel: `${h} cm` }),
            answer: intAns(a, 'cm'),
            steps: [`직사각형의 가로 $= ${per * h} \\div ${h} = ${per}$ (cm) $=$ 밑면의 둘레`, `한 변: $${per} \\div ${n} = ${a}$ (cm)`],
          };
        },
      },
    ],
  },

  // ═════════════ 6-1-3 소수의 나눗셈 ═════════════
  'e6a-3': {
    concepts: [
      {
        title: '자연수의 나눗셈을 이용한 (소수) ÷ (자연수)',
        body: '나누어지는 수가 $\\frac{1}{10}$ 배, $\\frac{1}{100}$ 배가 되면 몫도 $\\frac{1}{10}$ 배, $\\frac{1}{100}$ 배가 돼요.\n$$369 \\div 3 = 123 \\;\\Rightarrow\\; 36.9 \\div 3 = 12.3, \\; 3.69 \\div 3 = 1.23$$',
      },
      {
        title: '세로로 계산하기',
        body: '자연수의 나눗셈처럼 계산하고, 몫의 소수점은 **나누어지는 수의 소수점 위치에 맞추어** 찍어요.\n- 몫이 $1$ 보다 작으면 일의 자리에 $0$ 을 써요: $2.45 \\div 7 = 0.35$\n- 나누어지는 수의 자리가 모자라면 $0$ 을 내려 계속 계산해요: $3.4 \\div 4 = 0.85$\n- 중간에 나눌 수 없는 자리는 몫에 $0$ 을 써요: $6.12 \\div 6 = 1.02$',
      },
      {
        title: '(자연수) ÷ (자연수) 의 몫을 소수로',
        body: '나누어떨어지지 않으면 $0$ 을 내려 계속 나눠요.\n$$7 \\div 4 = 1.75$$',
      },
      {
        title: '몫 어림하기',
        body: '소수를 가까운 자연수로 어림해서 몫의 크기를 먼저 생각하면 소수점 위치를 확인할 수 있어요.\n$19.2 \\div 4$ → $20 \\div 4 = 5$ 쯤이므로 몫은 $4.8$',
      },
    ],
    skills: [
      {
        id: 'basic',
        title: '(소수) ÷ (자연수)',
        gen(r, level) {
          let n = level === 3 ? r.int(11, 25) : r.int(2, 9);
          if (n % 10 === 0) n += 1;
          const k = level === 1 ? 1 : 2;
          let qm = level === 1 ? r.int(11, 49) : r.int(101, level === 3 ? 499 : 999);
          while ((qm * n) % 10 === 0) qm++; // 나누어지는 수가 자연수(27)나 끝자리 0 이 되지 않게
          const dividend = mkDec(qm * n, k);
          const q = mkDec(qm, k);
          return {
            q: `계산하세요.\n$$${dt(dividend)} \\div ${n}$$`,
            answer: decAns(q),
            steps: [`자연수의 나눗셈: $${qm * n} \\div ${n} = ${qm}$`, `나누어지는 수가 $\\frac{1}{${k === 1 ? 10 : 100}}$ 배이므로 몫도 $\\frac{1}{${k === 1 ? 10 : 100}}$ 배: $${dt(q)}$`],
          };
        },
      },
      {
        id: 'less-one',
        title: '몫이 1보다 작은 나눗셈',
        gen(r, level) {
          const n = r.int(2, 9);
          const k = level === 1 ? 1 : 2;
          const qm = level === 1 ? r.int(1, 9) : r.int(11, 99);
          const q = mkDec(qm, k);
          const dividend = mkDec(qm * n, k);
          // 나누어지는 수의 끝자리가 0 이면 (1.80 → 1.8) 풀이의 자연수 나눗셈과 어긋나므로 다시
          if (dividend >= n || (qm * n) % 10 === 0) return content['e6a-3'].skills[1].gen(r, level);
          if (level === 3) {
            return {
              q: `몫이 $1$ 보다 작은 나눗셈을 고르세요.`,
              answer: makeChoices(r, `$${dt(dividend)} \\div ${n}$`, [`$${dt(round(dividend + n, 8))} \\div ${n}$`, `$${dt(round(dividend * 10, 8))} \\div ${n}$`, `$${dt(round(n + 0.5, 8))} \\div ${n}$`, `$${dt(round(n * 2 + dividend, 8))} \\div ${n}$`], 5),
              steps: ['나누어지는 수가 나누는 수보다 작으면 몫이 $1$ 보다 작아요.', `$${dt(dividend)} < ${n}$ 이므로 $${dt(dividend)} \\div ${n} = ${dt(q)}$`],
            };
          }
          return {
            q: `계산하세요.\n$$${dt(dividend)} \\div ${n}$$`,
            answer: decAns(q),
            steps: [`$${dt(dividend)} < ${n}$ 이므로 몫의 일의 자리에 $0$ 을 써요.`, `$${qm * n} \\div ${n} = ${qm}$ → $${dt(q)}$`],
          };
        },
      },
      {
        id: 'add-zero',
        title: '0을 내리거나 몫에 0을 쓰는 나눗셈',
        gen(r, level) {
          const n = r.pick([2, 4, 5, 6, 8]);
          if (level === 3) {
            // 몫 중간에 0
            const a = r.int(1, 9);
            let c = r.int(1, 9);
            while ((c * n) % 10 === 0) c = (c % 9) + 1; // 나누어지는 수가 소수 두 자리로 유지되게
            const qm = a * 100 + c; // a.0c
            const q = mkDec(qm, 2);
            const dividend = mkDec(qm * n, 2);
            return {
              q: `계산하세요.\n$$${dt(dividend)} \\div ${n}$$`,
              answer: decAns(q),
              steps: [`$${qm * n} \\div ${n} = ${qm}$`, `소수 첫째 자리에서 나눌 수 없으면 몫에 $0$ 을 써요: $${dt(q)}$`],
            };
          }
          // 나누어지는 수는 소수 k 자리, 몫은 k+1 자리
          const k = level === 1 ? 1 : 2;
          for (;;) {
            const qm = r.int(11, level === 1 ? 99 : 999);
            if ((qm * n) % 10 !== 0 || qm % 10 === 0) continue;
            const q = mkDec(qm, k + 1);
            const dividend = mkDec(qm * n, k + 1);
            if (String(dividend).split('.')[1]?.length !== k) continue;
            return {
              q: `계산하세요.\n$$${dt(dividend)} \\div ${n}$$`,
              answer: decAns(q),
              steps: [`나누어떨어지지 않으면 ${nj(dt(dividend), '을/를')} ${ro(dividend.toFixed(k + 1))} 생각하고 $0$ 을 내려 계산해요.`, `$${qm * n} \\div ${n} = ${qm}$ → $${dt(q)}$`],
            };
          }
        },
      },
      {
        id: 'nat-div-nat',
        title: '(자연수) ÷ (자연수) 의 몫을 소수로',
        gen(r, level) {
          const n = r.pick(level === 1 ? [2, 4, 5] : level === 2 ? [4, 5, 8, 20, 25] : [8, 16, 25, 40]);
          let a = r.int(level === 1 ? 1 : 3, level === 1 ? 19 : 99);
          if (a % n === 0) a += 1;
          const q = round(a / n, 8);
          return {
            q: `나눗셈의 몫을 소수로 나타내세요.\n$$${a} \\div ${n}$$`,
            answer: decAns(q),
            steps: [`$${a} \\div ${n} = ${Math.floor(a / n)} \\cdots ${a % n}$ 이므로 $0$ 을 내려 계속 나눠요.`, `$${a} \\div ${n} = ${dt(q)}$`],
          };
        },
      },
      {
        id: 'estimate',
        title: '어림하여 소수점 위치 찾기',
        gen(r, level) {
          const n = r.int(3, 9);
          let qm = r.int(level === 1 ? 11 : 101, level === 1 ? 99 : 999);
          if (qm % 10 === 0) qm += 1;
          const k = level === 1 ? 1 : r.int(1, 2);
          const q = mkDec(qm, k + (level === 3 ? 1 : 0));
          const dividend = round(q * n, 8);
          const est = Math.round(dividend);
          return {
            q: `$${qm * n} \\div ${n} = ${qm}$ 입니다. 어림하여 $${dt(dividend)} \\div ${n}$ 의 몫을 바르게 구한 것은?`,
            answer: numChoices(r, q, [q * 10, q / 10, q * 100, q / 100].map((x) => round(x, 8)), 4, 'dec'),
            steps: [`${nj(dt(dividend), '을/를')} 어림하면 약 $${est}$, $${est} \\div ${n}$ ${jo(String(n), '은/는')} 약 $${dt(round(est / n, 1))}$`, `따라서 몫은 $${dt(q)}$`],
          };
        },
      },
      {
        id: 'word',
        title: '소수의 나눗셈 문장제',
        gen(r, level) {
          const nm = pickName(r);
          const n = r.int(2, level === 3 ? 15 : 9);
          const qm = r.int(level === 1 ? 11 : 101, level === 1 ? 99 : 999);
          const k = level === 1 ? 1 : 2;
          const q = mkDec(qm, k);
          const tot = mkDec(qm * n, k);
          const t = level === 3 ? 3 : r.int(0, 2);
          if (t === 3) {
            const box = mkDec(r.int(3, 15), 1);
            const W = round(tot + box, 8);
            return {
              q: `무게가 같은 수박 $${n}$ 통이 들어 있는 상자의 무게가 $${dt(W)}$ kg 입니다. 빈 상자의 무게가 $${dt(box)}$ kg 이라면 수박 한 통의 무게는 몇 kg 인가요?`,
              answer: decAns(q, 'kg'),
              steps: [`수박 $${n}$ 통의 무게: $${dt(W)} - ${dt(box)} = ${dt(tot)}$ (kg)`, `한 통: $${dt(tot)} \\div ${n} = ${dt(q)}$ (kg)`],
            };
          }
          if (t === 0)
            return {
              q: `무게가 같은 수박 $${n}$ 통의 무게가 $${dt(tot)}$ kg 입니다. 수박 한 통의 무게는 몇 kg 인가요?`,
              answer: decAns(q, 'kg'),
              steps: [`$${dt(tot)} \\div ${n} = ${dt(q)}$ (kg)`],
            };
          if (t === 1)
            return {
              q: `${josa(nm, '은/는')} 일주일 동안 같은 거리를 매일 달려서 모두 ${level === 3 ? '' : ''}$${dt(round(q * 7, 8))}$ km 를 달렸습니다. 하루에 몇 km 를 달렸나요?`,
              answer: decAns(q, 'km'),
              steps: [`일주일 $= 7$ 일`, `$${dt(round(q * 7, 8))} \\div 7 = ${dt(q)}$ (km)`],
            };
          return {
            q: `넓이가 $${dt(tot)}$ m² 인 직사각형 모양 화단의 가로가 $${n}$ m 입니다. 세로는 몇 m 인가요?`,
            answer: decAns(q, 'm'),
            steps: [`(세로) $=$ (넓이) $\\div$ (가로)`, `$${dt(tot)} \\div ${n} = ${dt(q)}$ (m)`],
          };
        },
      },
    ],
  },

  // ═════════════ 6-1-4 비와 비율 ═════════════
  'e6a-4': {
    concepts: [
      {
        title: '두 수 비교하기',
        body: '두 양을 비교하는 방법에는 **뺄셈**(얼마나 더 많은지)과 **나눗셈**(몇 배인지)이 있어요.\n5학년의 대응 관계처럼, 한 양이 변할 때 다른 양이 몇 배로 변하는지 나눗셈으로 비교하면 관계가 일정하게 유지돼요.',
      },
      {
        title: '비',
        body: '두 수를 나눗셈으로 비교하기 위해 기호 $:$ 를 사용하여 나타낸 것을 **비**라고 해요.\n$3 : 5$ 는 "$3$ 대 $5$", "$3$ 과 $5$ 의 비", "$5$ 에 대한 $3$ 의 비", "$3$ 의 $5$ 에 대한 비" 라고 읽어요.\n- 기호 $:$ 의 오른쪽 $5$ 는 **기준량**, 왼쪽 $3$ 은 **비교하는 양**이에요.',
      },
      {
        title: '비율',
        body: '기준량에 대한 비교하는 양의 크기를 **비율**이라고 해요.\n$$(\\text{비율}) = (\\text{비교하는 양}) \\div (\\text{기준량})$$\n$3 : 5$ 의 비율은 $\\frac{3}{5} = 0.6$',
      },
      {
        title: '백분율',
        body: '기준량을 $100$ 으로 할 때의 비율을 **백분율**이라 하고 기호 $\\%$ 를 써요.\n$$(\\text{백분율}) = (\\text{비율}) \\times 100$$\n$\\frac{3}{4} = 0.75 = 75\\%$',
      },
      {
        title: '비율이 사용되는 경우',
        body: '- 걸린 시간에 대한 간 거리의 비율 (빠르기)\n- 넓이에 대한 인구의 비율 (인구 밀도)\n- 용액의 양에 대한 용질의 양의 비율 (진하기)\n- 할인율, 득표율, 성공률, 타율 등',
      },
    ],
    skills: [
      {
        id: 'ratio-read',
        title: '비 읽기와 기준량',
        gen(r, level) {
          let a = r.int(2, 15),
            b = r.int(2, 15);
          if (a === b) b += 1;
          if (level === 1) {
            const askBase = r.chance(0.5);
            return {
              q: `비 $${a} : ${b}$ 에서 ${askBase ? '기준량' : '비교하는 양'}은 얼마인가요?`,
              answer: intAns(askBase ? b : a),
              steps: [`기호 $:$ 의 오른쪽이 기준량, 왼쪽이 비교하는 양이에요.`, `${askBase ? '기준량' : '비교하는 양'}: $${askBase ? b : a}$`],
            };
          }
          const goods = [`$${a}$ 대 $${b}$`, `${nj(a, '과/와')} $${b}$ 의 비`, `$${b}$ 에 대한 $${a}$ 의 비`, `$${a}$ 의 $${b}$ 에 대한 비`];
          const bads = [`$${a}$ 에 대한 $${b}$ 의 비`, `$${b}$ 의 $${a}$ 에 대한 비`, `$${b}$ 대 $${a}$`];
          if (level === 2) {
            const bad = r.pick(bads);
            return {
              q: `비 $${a} : ${b}$ ${jo(String(b), '을/를')} **잘못** 읽은 것은?`,
              answer: makeChoices(r, bad, goods, 5),
              steps: [`$${a} : ${b}$ 의 기준량은 $${b}$`, `${bad} 는 기준량이 $${a}$ 인 $${b} : ${a}$ 를 읽은 것이에요.`],
            };
          }
          const nm = pickName(r);
          const boys = r.int(8, 18),
            girls = r.int(8, 18) + (r.chance(0.5) ? 0 : 1);
          const tot = boys + girls;
          const ask = r.int(0, 2);
          const [x, y, txt] = ask === 0 ? [girls, tot, '전체 학생 수에 대한 여학생 수의 비'] : ask === 1 ? [boys, girls, '여학생 수에 대한 남학생 수의 비'] : [tot, boys, '남학생 수에 대한 전체 학생 수의 비'];
          return {
            q: `${nm}네 반은 남학생이 $${boys}$ 명, 여학생이 $${girls}$ 명입니다. ${txt}를 바르게 나타낸 것은?`,
            answer: makeChoices(r, `$${x} : ${y}$`, [`$${y} : ${x}$`, `$${boys} : ${girls}$`, `$${girls} : ${boys}$`, `$${girls} : ${tot}$`, `$${tot} : ${boys}$`, `$${boys} : ${tot}$`], 4),
            steps: [`"~에 대한" 앞의 양이 기준량(오른쪽)이에요.`, `${txt}: $${x} : ${y}$`],
          };
        },
      },
      {
        id: 'ratio-value',
        title: '비율 구하기',
        gen(r, level) {
          const b = r.pick(level === 1 ? [2, 4, 5, 10] : [4, 5, 8, 20, 25, 50]);
          let a = r.int(1, level === 3 ? b * 2 : b - 1);
          if (a === b) a += 1;
          const f = new F(a, b);
          if (level === 3 || r.chance(0.5)) {
            return {
              q: `비 $${a} : ${b}$ 의 비율을 소수로 나타내세요.`,
              answer: decAns(f.value),
              steps: [`(비율) $=$ (비교하는 양) $\\div$ (기준량)`, `$${a} \\div ${b} = ${dt(f.value)}$`],
            };
          }
          return {
            q: `비 $${a} : ${b}$ 의 비율을 기약분수로 나타내세요.`,
            answer: fracAns(f, { mixed: false }),
            steps: [`(비율) $=$ (비교하는 양) $\\div$ (기준량)`, `$${a} \\div ${b} = ${reduceTex(a, b, false)}$`],
          };
        },
      },
      {
        id: 'percent',
        title: '백분율',
        gen(r, level) {
          if (level === 1) {
            const d = r.pick([2, 4, 5, 10, 20, 25, 50]);
            let n = r.int(1, d - 1);
            const f = new F(n, d);
            n = f.n;
            return {
              q: `비율 ${fj(f, '을/를', false)} 백분율로 나타내면 몇 % 인가요?`,
              answer: intAns(round(f.value * 100, 6), '%'),
              steps: [`(백분율) $=$ (비율) $\\times 100$`, `$${ft(f)} \\times 100 = ${round(f.value * 100, 6)}$ (%)`],
            };
          }
          if (level === 2) {
            const v = mkDec(r.int(1, 199), r.chance(0.5) ? 2 : 3);
            return {
              q: `비율 ${nj(dt(v), '을/를')} 백분율로 나타내면 몇 % 인가요?`,
              answer: decAns(round(v * 100, 6), '%'),
              steps: [`$${dt(v)} \\times 100 = ${dt(round(v * 100, 6))}$ (%)`],
            };
          }
          const p = r.pick([4, 5, 8, 12, 15, 20, 24, 25, 35, 40, 45, 60, 64, 75, 80, 85, 125, 150]);
          const f = new F(p, 100);
          return {
            q: `$${p}\\%$ 를 기약분수로 나타내세요.`,
            answer: fracAns(f, { mixed: false }),
            steps: [`$${p}\\% = \\frac{${p}}{100}$`, `$= ${ft(f)}$`],
          };
        },
      },
      {
        id: 'word-rate',
        title: '비율이 사용되는 경우',
        gen(r, level) {
          const nm = pickName(r);
          const k = level === 1 ? r.int(0, 1) : level === 2 ? r.int(1, 3) : r.int(3, 4);
          if (k === 0) {
            const tries = r.pick([10, 20, 25, 40, 50]);
            const ok = r.int(1, tries - 1);
            return {
              q: `${josa(nm, '은/는')} 농구 자유투를 $${tries}$ 번 던져서 $${ok}$ 번 넣었습니다. 던진 횟수에 대한 넣은 횟수의 비율을 소수로 나타내세요.`,
              answer: decAns(ok / tries),
              steps: [`기준량: 던진 횟수 $${tries}$, 비교하는 양: 넣은 횟수 $${ok}$`, `$${ok} \\div ${tries} = ${dt(round(ok / tries, 8))}$`],
            };
          }
          if (k === 1) {
            const votes = r.pick([200, 250, 400, 500, 800]);
            const got = r.int(1, 19) * (votes / 20);
            return {
              q: `전교 회장 선거에서 투표한 학생 $${votes}$ 명 중 ${josa(nm, '이/가')} $${got}$ 표를 얻었습니다. ${nm}의 득표율은 몇 % 인가요?`,
              answer: intAns(round((got / votes) * 100, 6), '%'),
              steps: [`득표율 $=$ (얻은 표 수) $\\div$ (전체 투표 수) $\\times 100$`, `$${got} \\div ${votes} \\times 100 = ${round((got / votes) * 100, 6)}$ (%)`],
            };
          }
          if (k === 2) {
            const t = r.int(2, 5),
              v = r.int(40, 90);
            return {
              q: `자동차가 $${t}$ 시간 동안 $${v * t}$ km 를 달렸습니다. 걸린 시간에 대한 달린 거리의 비율은 얼마인가요?`,
              answer: intAns(v),
              steps: [`기준량: 시간 $${t}$, 비교하는 양: 거리 $${v * t}$`, `$${v * t} \\div ${t} = ${v}$ (1시간에 $${v}$ km 를 간 셈)`],
            };
          }
          if (k === 3) {
            const water = r.pick([180, 190, 240, 285, 380, 460]);
            const tot0 = water;
            const salt = r.pick([20, 10, 15, 60, 40]);
            const tot = tot0 + salt;
            const pct = round((salt / tot) * 100, 6);
            return {
              q: `물 $${water}$ g 에 소금 $${salt}$ g 을 넣어 소금물을 만들었습니다. 소금물의 양에 대한 소금의 양의 비율은 몇 % 인가요? (나누어떨어지지 않으면 반올림하여 일의 자리까지)`,
              answer: intAns(Math.round(pct), '%'),
              steps: [`소금물의 양 $= ${water} + ${salt} = ${tot}$ (g) ← 기준량`, `$${salt} \\div ${tot} \\times 100 = ${dt(round(pct, 2))}${Number.isInteger(round(pct * 100, 6)) ? '' : '\\cdots'}$ → $${Math.round(pct)}\\%$`],
              hint: '기준량은 물이 아니라 소금물 전체의 양이에요.',
            };
          }
          // 인구 밀도 비교
          const [c1, c2] = ['가', '나'];
          const a1 = r.int(2, 9),
            a2 = r.int(2, 9);
          const d1 = r.int(30, 90) * 10,
            d2 = r.int(30, 90) * 10 + (r.chance(0.5) ? 0 : 5);
          const big = d1 > d2 ? c1 : c2;
          return {
            q: `${c1} 마을은 넓이가 $${a1}$ km² 이고 인구가 $${comma(a1 * d1)}$ 명, ${c2} 마을은 넓이가 $${a2}$ km² 이고 인구가 $${comma(a2 * d2)}$ 명입니다. 넓이에 대한 인구의 비율이 더 높은 마을의 비율(1 km² 당 인구)은 얼마인가요?`,
            answer: intAns(Math.max(d1, d2), '명'),
            steps: [`${c1} 마을: $${comma(a1 * d1)} \\div ${a1} = ${comma(d1)}$`, `${c2} 마을: $${comma(a2 * d2)} \\div ${a2} = ${comma(d2)}$`, d1 === d2 ? `두 마을이 같아요: $${comma(d1)}$` : `${big} 마을이 더 높아요: $${comma(Math.max(d1, d2))}$`],
          };
        },
      },
      {
        id: 'discount',
        title: '할인율과 이자율',
        gen(r, level) {
          const price = r.int(2, 30) * 1000;
          const rate = r.pick([10, 20, 25, 30, 40, 50, 15, 35]);
          const off = (price * rate) / 100;
          if (level === 1) {
            return {
              q: `$${comma(price)}$ 원짜리 물건을 $${rate}\\%$ 할인하여 판다고 합니다. 할인 금액은 얼마인가요?`,
              answer: intAns(off, '원'),
              steps: [`$${comma(price)} \\times \\frac{${rate}}{100} = ${comma(off)}$ (원)`],
            };
          }
          if (level === 2) {
            return r.chance(0.5)
              ? {
                  q: `$${comma(price)}$ 원짜리 운동화를 $${rate}\\%$ 할인하여 판매합니다. 운동화의 판매 가격은 얼마인가요?`,
                  answer: intAns(price - off, '원'),
                  steps: [`할인 금액: $${comma(price)} \\times ${rate / 100} = ${comma(off)}$ (원)`, `판매 가격: $${comma(price)} - ${comma(off)} = ${comma(price - off)}$ (원)`],
                }
              : {
                  q: `정가가 $${comma(price)}$ 원인 가방을 $${comma(price - off)}$ 원에 샀습니다. 가방의 할인율은 몇 % 인가요?`,
                  answer: intAns(rate, '%'),
                  steps: [`할인 금액: $${comma(price)} - ${comma(price - off)} = ${comma(off)}$ (원)`, `할인율: $${comma(off)} \\div ${comma(price)} \\times 100 = ${rate}$ (%)`],
                };
          }
          const dep = r.pick([50000, 100000, 200000, 300000, 400000]);
          const ir = r.pick([2, 3, 4, 5]);
          const tot = dep + (dep * ir) / 100;
          if (r.chance(0.5)) {
            return {
              q: `은행에 $${comma(dep)}$ 원을 예금하였더니 1년 뒤에 $${comma(tot)}$ 원이 되었습니다. 예금한 돈에 대한 이자의 비율(이자율)은 몇 % 인가요?`,
              answer: intAns(ir, '%'),
              steps: [`이자: $${comma(tot)} - ${comma(dep)} = ${comma(tot - dep)}$ (원)`, `$${comma(tot - dep)} \\div ${comma(dep)} \\times 100 = ${ir}$ (%)`],
            };
          }
          const p2 = price - off;
          const rate2 = r.pick([10, 20]);
          const fin = p2 - (p2 * rate2) / 100;
          if (!Number.isInteger(fin)) {
            return {
              q: `$${comma(price)}$ 원짜리 물건을 $${rate}\\%$ 할인하여 판다고 합니다. 판매 가격은 얼마인가요?`,
              answer: intAns(p2, '원'),
              steps: [`$${comma(price)} \\times (1 - ${rate / 100}) = ${comma(p2)}$ (원)`],
            };
          }
          return {
            q: `$${comma(price)}$ 원짜리 물건을 $${rate}\\%$ 할인한 가격에서, 회원이라서 다시 $${rate2}\\%$ 를 더 할인받았습니다. 낸 돈은 얼마인가요?`,
            answer: intAns(fin, '원'),
            steps: [`첫 할인 후: $${comma(price)} - ${comma(off)} = ${comma(p2)}$ (원)`, `두 번째 할인 금액: $${comma(p2)} \\times ${rate2 / 100} = ${comma((p2 * rate2) / 100)}$`, `낸 돈: $${comma(fin)}$ 원`],
            hint: '두 번째 할인은 처음 가격이 아니라 할인된 가격을 기준으로 해요.',
          };
        },
      },
    ],
  },

  // ═════════════ 6-1-5 여러 가지 그래프 ═════════════
  'e6a-5': {
    concepts: [
      {
        title: '그림그래프',
        body: '알려고 하는 수(조사한 수)를 **그림의 크기와 개수**로 나타낸 그래프예요. 큰 그림과 작은 그림이 나타내는 수를 먼저 확인해요.\n지역별 자료를 지도 위에 나타내면 한눈에 비교하기 좋아요.',
      },
      {
        title: '띠그래프',
        body: '전체에 대한 각 부분의 비율을 **띠 모양**에 나타낸 그래프예요.\n- 각 항목의 백분율을 구해 띠를 나누고, 백분율의 합계는 $100\\%$ 예요.\n- 백분율 $=$ (항목의 수) $\\div$ (전체 수) $\\times 100$',
      },
      {
        title: '원그래프',
        body: '전체에 대한 각 부분의 비율을 **원 모양**에 나타낸 그래프예요.\n- 원의 중심을 따라 $100$ 등분 된 눈금을 이용해요.\n- 비율이 큰 항목일수록 차지하는 부분이 넓어요.',
      },
      {
        title: '그래프 해석과 활용',
        body: '- (항목의 수) $=$ (전체 수) $\\times$ (항목의 백분율) $\\div 100$\n- 항목 A 가 B 의 몇 배인지는 백분율끼리 나누어 구해요.\n- 자료의 특성에 맞는 그래프를 골라요: 변화 → 꺾은선, 비율 → 띠·원그래프',
      },
    ],
    skills: [
      {
        id: 'picture',
        title: '그림그래프 읽기',
        gen(r, level) {
          const big = level === 1 ? 10 : 100,
            small = level === 1 ? 1 : 10;
          // 1단계는 반별 책 수, 2·3단계는 지역별 쌀 생산량
          const regions = level === 1 ? ['1반', '2반', '3반', '4반'] : r.pick([
            ['가 마을', '나 마을', '다 마을', '라 마을'],
            ['동부', '서부', '남부', '북부'],
          ]);
          const vals = regions.map(() => r.int(1, 5) * big + r.int(0, 6) * small);
          const what = level === 1 ? '읽은 책 수(권)' : '쌀 생산량(t)';
          if (level === 3) {
            const tot = vals.reduce((a, b) => a + b, 0);
            return {
              q: `그림그래프는 지역별 ${what}을 나타낸 것입니다. 네 지역의 생산량의 합은 몇 t 인가요?`,
              fig: pictureFig(regions, vals, big, small),
              answer: intAns(tot, 't'),
              steps: [`큰 그림 $${big}$, 작은 그림 $${small}$`, `$${vals.join(' + ')} = ${comma(tot)}$ (t)`],
            };
          }
          const [i, j] = r.sample([0, 1, 2, 3], 2);
          if (level === 2) {
            return {
              q: `그림그래프는 지역별 ${what}을 나타낸 것입니다. ${regions[i]}${jo2(regions[i])} ${regions[j]}의 생산량의 차는 몇 t 인가요?`,
              fig: pictureFig(regions, vals, big, small),
              answer: intAns(Math.abs(vals[i] - vals[j]), 't'),
              steps: [`${regions[i]}: $${vals[i]}$ t, ${regions[j]}: $${vals[j]}$ t`, `차: $${Math.abs(vals[i] - vals[j])}$ t`],
            };
          }
          return {
            q: `그림그래프는 반별로 ${what}를 나타낸 것입니다. ${regions[i]}에서 읽은 책은 몇 권인가요?`,
            fig: pictureFig(regions, vals, big, small),
            answer: intAns(vals[i], '권'),
            steps: [`큰 그림은 $${big}$ 권, 작은 그림은 $${small}$ 권`, `${regions[i]}: $${vals[i]}$ 권`],
          };
        },
      },
      {
        id: 'percent-table',
        title: '백분율 구하기',
        gen(r, level) {
          const tot = r.pick(level === 1 ? [20, 50] : [25, 40, 200, 400]);
          const items = r.pick([
            ['봄', '여름', '가을', '겨울'],
            ['축구', '야구', '농구', '배구'],
            ['사과', '배', '포도', '귤'],
          ]);
          const ps = percents(r, 4).filter(() => true);
          // 각 항목 수가 정수가 되도록 조정
          const unit = 100 / tot;
          let counts = ps.map((p) => Math.round(p / unit));
          const diff = tot - counts.reduce((a, b) => a + b, 0);
          counts[0] += diff;
          counts = counts.map((c) => Math.max(1, c));
          const T = counts.reduce((a, b) => a + b, 0);
          const i = r.int(0, 3);
          const pct = round((counts[i] / T) * 100, 6);
          if (!Number.isInteger(pct * 10)) return content['e6a-5'].skills[1].gen(r, level);
          const table = [['항목', ...items, '합계'], ['학생 수(명)', ...counts.map((c) => `$${c}$`), `$${T}$`]];
          if (level === 3) {
            const pcts = counts.map((c) => round((c / T) * 100, 6));
            const [a, b] = r.sample([0, 1, 2, 3], 2);
            return {
              q: `좋아하는 항목별 학생 수를 조사한 표입니다. 띠그래프로 나타낼 때 ${items[a]}${jo2(items[a])} ${josa(items[b], '이/가')} 차지하는 백분율의 합은 몇 % 인가요?`,
              table,
              answer: decAns(pcts[a] + pcts[b], '%'),
              steps: [`${items[a]}: $${counts[a]} \\div ${T} \\times 100 = ${dt(pcts[a])}$ (%)`, `${items[b]}: $${counts[b]} \\div ${T} \\times 100 = ${dt(pcts[b])}$ (%)`, `합: $${dt(round(pcts[a] + pcts[b], 6))}\\%$`],
            };
          }
          return {
            q: `좋아하는 항목별 학생 수를 조사한 표입니다. ${josa(items[i], '을/를')} 좋아하는 학생은 전체의 몇 % 인가요?`,
            table,
            answer: decAns(pct, '%'),
            steps: [`(백분율) $=$ (항목의 수) $\\div$ (전체 수) $\\times 100$`, `$${counts[i]} \\div ${T} \\times 100 = ${dt(pct)}$ (%)`],
          };
        },
      },
      {
        id: 'band',
        title: '띠그래프 해석',
        gen(r, level) {
          const items = r.pick([
            ['버스', '도보', '자전거', '기타'],
            ['과학', '수학', '국어', '체육'],
            ['한식', '양식', '중식', '일식'],
          ]);
          const ps = percents(r, 4, 10);
          const tot = r.pick([20, 40, 60, 80, 100, 200, 300, 400, 500]);
          const i = r.int(0, 3);
          const cnt = (tot * ps[i]) / 100;
          if (!Number.isInteger(cnt)) return content['e6a-5'].skills[2].gen(r, level);
          if (level === 1) {
            // 가장 큰 비율이 둘 이상이면 '두 번째로 많은 것'이 애매하므로 다시 만든다
            if (ps[0] === ps[1]) return content['e6a-5'].skills[2].gen(r, level);
            const [a, b] = [0, 1];
            return {
              q: `학생들이 좋아하는 것을 조사하여 나타낸 띠그래프입니다. 가장 많은 학생이 좋아하는 것은 두 번째로 많은 것의 몇 배인가요?`,
              fig: bandFig(items, ps),
              answer: fracAns(new F(ps[a], ps[b]), { reduced: false }),
              steps: [`가장 큰 비율: ${items[a]} $${ps[a]}\\%$, 두 번째: ${items[b]} $${ps[b]}\\%$`, `$${ps[a]} \\div ${ps[b]} = ${reduceTex(ps[a], ps[b])}$ (배)`],
            };
          }
          if (level === 2) {
            return {
              q: `학생 $${tot}$ 명을 조사하여 나타낸 띠그래프입니다. ${josa(items[i], '을/를')} 고른 학생은 몇 명인가요?`,
              fig: bandFig(items, ps),
              answer: intAns(cnt, '명'),
              steps: [`$${tot} \\times \\frac{${ps[i]}}{100} = ${cnt}$ (명)`],
            };
          }
          const h = r.int(0, 3);
          const hide = (tot * ps[h]) / 100;
          if (!Number.isInteger(hide)) return content['e6a-5'].skills[2].gen(r, level);
          return {
            q: `학생 $${tot}$ 명을 조사하여 나타낸 띠그래프입니다. ${items[h]}의 비율이 가려져 있을 때, ${josa(items[h], '을/를')} 고른 학생은 몇 명인가요?`,
            fig: bandFig(items, ps, { hide: h }),
            answer: intAns(hide, '명'),
            steps: [`${items[h]}의 비율: $100 - (${ps.filter((_, k) => k !== h).join(' + ')}) = ${ps[h]}\\%$`, `$${tot} \\times \\frac{${ps[h]}}{100} = ${hide}$ (명)`],
          };
        },
      },
      {
        id: 'pie',
        title: '원그래프 해석',
        gen(r, level) {
          const items = r.pick([
            ['빨강', '파랑', '노랑', '초록', '보라'],
            ['강아지', '고양이', '햄스터', '물고기', '새'],
            ['쌀', '보리', '콩', '밀', '옥수수'],
          ]);
          const k = level === 1 ? 4 : 5;
          const ps = percents(r, k, 10);
          const its = items.slice(0, k);
          if (level === 1) {
            const h = r.int(0, k - 1);
            return {
              q: `원그래프에서 ${its[h]}의 비율은 몇 % 인가요?`,
              fig: pieFig(its, ps, { hide: h }),
              answer: intAns(ps[h], '%'),
              steps: [`백분율의 합은 $100\\%$`, `$100 - (${ps.filter((_, j) => j !== h).join(' + ')}) = ${ps[h]}$ (%)`],
            };
          }
          if (level === 2) {
            const [a, b] = [0, k - 1];
            const ratio = round(ps[a] / ps[b], 8);
            if (!Number.isInteger(round(ratio * 100, 6))) return content['e6a-5'].skills[3].gen(r, level);
            return {
              q: `원그래프에서 ${its[a]}의 비율은 ${its[b]}의 비율의 몇 배인가요?`,
              fig: pieFig(its, ps),
              answer: decAns(ratio, '배'),
              steps: [`${its[a]} $${ps[a]}\\%$, ${its[b]} $${ps[b]}\\%$`, `$${ps[a]} \\div ${ps[b]} = ${dt(ratio)}$ (배)`],
            };
          }
          // 한 항목의 수로 전체 구하기
          const i = r.int(0, k - 1);
          const unitCnt = r.int(1, 6);
          const cnt = (ps[i] / 5) * unitCnt; // 5% 당 unitCnt 명
          const tot = 20 * unitCnt;
          const j = (i + 1) % k;
          return {
            q: `원그래프에서 ${josa(its[i], '을/를')} 고른 학생이 $${cnt}$ 명일 때, ${josa(its[j], '을/를')} 고른 학생은 몇 명인가요?`,
            fig: pieFig(its, ps),
            answer: intAns((tot * ps[j]) / 100, '명'),
            steps: [`전체 학생 수: $${cnt} \\div \\frac{${ps[i]}}{100} = ${tot}$ (명)`, `${its[j]}: $${tot} \\times \\frac{${ps[j]}}{100} = ${(tot * ps[j]) / 100}$ (명)`],
          };
        },
      },
      {
        id: 'choose-graph',
        title: '알맞은 그래프 고르기',
        gen(r, level) {
          const S: [string, string][] = [
            ['한 달 동안 매일 잰 강낭콩 키의 변화', '꺾은선그래프'],
            ['하루 동안 기온의 변화', '꺾은선그래프'],
            ['학생들이 좋아하는 운동별 학생 수의 비율', '원그래프'],
            ['우리 반 학생들의 혈액형별 비율', '띠그래프'],
            ['지역별 사과 생산량을 지도 위에 나타내기', '그림그래프'],
            ['반별 안경 쓴 학생 수 비교', '막대그래프'],
            ['권역별 인구를 지도에 그림으로 나타내기', '그림그래프'],
            ['용돈 쓴 곳별 금액이 전체에서 차지하는 비율', '원그래프'],
          ];
          const G = ['꺾은선그래프', '막대그래프', '그림그래프', '띠그래프', '원그래프'];
          if (level === 3) {
            const pct = r.pick([10, 20, 25, 30, 40, 50]);
            const len = r.pick([10, 20, 30, 40]);
            return {
              q: `전체 길이가 $${len}$ cm 인 띠그래프에서 $${pct}\\%$ 를 차지하는 항목은 띠에서 몇 cm 인가요?`,
              answer: decAns(round((len * pct) / 100, 8), 'cm'),
              steps: [`$${len} \\times \\frac{${pct}}{100} = ${dt(round((len * pct) / 100, 8))}$ (cm)`],
            };
          }
          const [what, g] = r.pick(S);
          const right = g;
          const opts = g === '원그래프' || g === '띠그래프' ? G.filter((x) => x !== (g === '원그래프' ? '띠그래프' : '원그래프')) : G;
          return {
            q: `다음 자료를 나타내기에 가장 알맞은 그래프는?\n${what}`,
            answer: makeChoices(r, right, opts, level === 1 ? 4 : 4),
            steps: ['변화 → 꺾은선그래프, 크기 비교 → 막대그래프, 지역별 수량 → 그림그래프, 전체에 대한 비율 → 띠·원그래프', `따라서 ${right}`],
          };
        },
      },
    ],
  },

  // ═════════════ 6-1-6 직육면체의 부피와 겉넓이 ═════════════
  'e6a-6': {
    concepts: [
      {
        title: '부피 비교와 1 cm³',
        body: '한 모서리가 $1$ cm 인 정육면체의 부피를 $1$ cm³(세제곱센티미터)라고 해요.\n쌓기나무처럼 $1$ cm³ 가 몇 개 들어가는지 세면 부피를 비교할 수 있어요.',
      },
      {
        title: '직육면체와 정육면체의 부피',
        body: '- (직육면체의 부피) $=$ (가로) $\\times$ (세로) $\\times$ (높이) $=$ (밑면의 넓이) $\\times$ (높이)\n- (정육면체의 부피) $=$ (한 모서리) $\\times$ (한 모서리) $\\times$ (한 모서리)',
        example: { q: '가로 $5$ cm, 세로 $4$ cm, 높이 $3$ cm', a: '$5 \\times 4 \\times 3 = 60$ (cm³)' },
      },
      {
        title: '1 m³',
        body: '한 모서리가 $1$ m 인 정육면체의 부피를 $1$ m³ 라고 해요.\n$$1 \\text{ m}^3 = 100 \\times 100 \\times 100 = 1000000 \\text{ cm}^3$$',
      },
      {
        title: '직육면체의 겉넓이',
        body: '여섯 면의 넓이의 합을 겉넓이라고 해요.\n- (세 면의 넓이의 합) $\\times 2$\n- (한 밑면의 넓이) $\\times 2$ $+$ (옆면의 넓이) — 옆면은 가로가 밑면의 둘레인 직사각형\n- 정육면체의 겉넓이 $=$ (한 면의 넓이) $\\times 6$',
      },
    ],
    skills: [
      {
        id: 'volume',
        title: '직육면체의 부피',
        gen(r, level) {
          const a = r.int(2, level === 1 ? 9 : 15),
            b = r.int(2, level === 1 ? 8 : 12),
            c = r.int(2, level === 1 ? 8 : 12);
          if (level === 3) {
            // 큰 직육면체에서 작은 직육면체를 뺀 모양
            const a2 = r.int(1, a - 1),
              c2 = r.int(1, c - 1);
            const V = a * b * c - a2 * b * c2;
            return {
              q: `가로 $${a}$ cm, 세로 $${b}$ cm, 높이 $${c}$ cm 인 직육면체의 한쪽 모서리에서 가로 $${a2}$ cm, 세로 $${b}$ cm, 높이 $${c2}$ cm 인 직육면체를 잘라 냈습니다. 남은 입체도형의 부피는 몇 cm³ 인가요?`,
              fig: cuboidFig(a, b, c, { labels: [`${a} cm`, `${b} cm`, `${c} cm`] }),
              answer: intAns(V, 'cm³'),
              steps: [`처음 부피: $${a} \\times ${b} \\times ${c} = ${a * b * c}$ (cm³)`, `잘라 낸 부피: $${a2} \\times ${b} \\times ${c2} = ${a2 * b * c2}$ (cm³)`, `$${a * b * c} - ${a2 * b * c2} = ${V}$ (cm³)`],
            };
          }
          return {
            q: '다음 직육면체의 부피는 몇 cm³ 인가요?',
            fig: cuboidFig(a, b, c, { labels: [`${a} cm`, `${b} cm`, `${c} cm`] }),
            answer: intAns(a * b * c, 'cm³'),
            steps: [`(가로) $\\times$ (세로) $\\times$ (높이)`, `$${a} \\times ${b} \\times ${c} = ${a * b * c}$ (cm³)`],
          };
        },
      },
      {
        id: 'cube',
        title: '정육면체의 부피와 겉넓이',
        gen(r, level) {
          const a = r.int(2, 12);
          if (level === 1) {
            return {
              q: `한 모서리가 $${a}$ cm 인 정육면체의 부피는 몇 cm³ 인가요?`,
              fig: cuboidFig(a, a, a, { labels: [`${a} cm`, null, null] }),
              answer: intAns(a ** 3, 'cm³'),
              steps: [`$${a} \\times ${a} \\times ${a} = ${a ** 3}$ (cm³)`],
            };
          }
          if (level === 2) {
            return {
              q: `한 모서리가 $${a}$ cm 인 정육면체의 겉넓이는 몇 cm² 인가요?`,
              fig: cuboidFig(a, a, a, { labels: [`${a} cm`, null, null] }),
              answer: intAns(6 * a * a, 'cm²'),
              steps: [`한 면의 넓이: $${a} \\times ${a} = ${a * a}$ (cm²)`, `$${a * a} \\times 6 = ${6 * a * a}$ (cm²)`],
            };
          }
          return r.chance(0.5)
            ? {
                q: `겉넓이가 $${6 * a * a}$ cm² 인 정육면체의 부피는 몇 cm³ 인가요?`,
                answer: intAns(a ** 3, 'cm³'),
                steps: [`한 면의 넓이: $${6 * a * a} \\div 6 = ${a * a}$ → 한 모서리 $${a}$ cm`, `부피: $${a} \\times ${a} \\times ${a} = ${a ** 3}$ (cm³)`],
              }
            : {
                q: `부피가 $${a ** 3}$ cm³ 인 정육면체의 겉넓이는 몇 cm² 인가요?`,
                answer: intAns(6 * a * a, 'cm²'),
                steps: [`같은 수를 세 번 곱해 ${nj(a ** 3, '이/가')} 되는 수: $${a}$ → 한 모서리 $${a}$ cm`, `겉넓이: $${a} \\times ${a} \\times 6 = ${6 * a * a}$ (cm²)`],
              };
        },
      },
      {
        id: 'surface',
        title: '직육면체의 겉넓이',
        gen(r, level) {
          const a = r.int(2, level === 1 ? 9 : 15),
            b = r.int(2, level === 1 ? 8 : 12),
            c = r.int(2, level === 1 ? 8 : 12);
          const S = 2 * (a * b + b * c + a * c);
          if (level === 3) {
            const V = a * b * c;
            return {
              q: `부피가 $${V}$ cm³ 이고 가로가 $${a}$ cm, 세로가 $${b}$ cm 인 직육면체의 겉넓이는 몇 cm² 인가요?`,
              answer: intAns(S, 'cm²'),
              steps: [`높이: $${V} \\div (${a} \\times ${b}) = ${c}$ (cm)`, `겉넓이: $(${a * b} + ${b * c} + ${a * c}) \\times 2 = ${S}$ (cm²)`],
            };
          }
          return {
            q: '다음 직육면체의 겉넓이는 몇 cm² 인가요?',
            fig: cuboidFig(a, b, c, { labels: [`${a} cm`, `${b} cm`, `${c} cm`] }),
            answer: intAns(S, 'cm²'),
            steps: [`세 면의 넓이: $${a}\\times${b} = ${a * b}$, $${b}\\times${c} = ${b * c}$, $${a}\\times${c} = ${a * c}$`, `$(${a * b} + ${b * c} + ${a * c}) \\times 2 = ${S}$ (cm²)`],
          };
        },
      },
      {
        id: 'unit',
        title: '부피의 단위',
        gen(r, level) {
          if (level === 1) {
            const m = r.int(2, 9);
            return {
              q: `$${m}$ m³ 는 몇 cm³ 인가요?`,
              answer: intAns(m * 1000000, 'cm³'),
              steps: [`$1$ m³ $= 1000000$ cm³`, `$${m}$ m³ $= ${comma(m * 1000000)}$ cm³`],
            };
          }
          if (level === 2) {
            const v = mkDec(r.int(1, 99), 1);
            return {
              q: `$${comma(round(v * 1000000, 6))}$ cm³ 는 몇 m³ 인가요?`,
              answer: decAns(v, 'm³'),
              steps: [`$1000000$ cm³ $= 1$ m³`, `$${comma(round(v * 1000000, 6))} \\div 1000000 = ${dt(v)}$ (m³)`],
            };
          }
          const a = r.int(1, 9) * 100,
            b = r.int(1, 9) * 100,
            c = r.int(1, 5) * 100;
          const V = (a / 100) * (b / 100) * (c / 100);
          return {
            q: `가로 $${a}$ cm, 세로 $${b}$ cm, 높이 $${c}$ cm 인 직육면체의 부피는 몇 m³ 인가요?`,
            answer: numChoices(r, V, [V * 100, V * 1000, V * 10, V / 10, a * b * c].filter((x) => x !== V), 5, 'dec'),
            steps: [`단위를 m 로: $${a / 100}$ m, $${b / 100}$ m, $${c / 100}$ m`, `$${a / 100} \\times ${b / 100} \\times ${c / 100} = ${V}$ (m³)`],
          };
        },
      },
      {
        id: 'reverse',
        title: '부피로 길이 구하기',
        gen(r, level) {
          const a = r.int(2, 12),
            b = r.int(2, 10),
            c = r.int(2, 10);
          if (level === 3) {
            const k = r.pick([2, 3, 4, 5]);
            const A = a * k,
              B = b * k,
              C = c * k;
            return {
              q: `가로 $${A}$ cm, 세로 $${B}$ cm, 높이 $${C}$ cm 인 직육면체 모양 상자에 한 모서리가 $${k}$ cm 인 정육면체 모양 블록을 빈틈없이 넣으려고 합니다. 블록은 모두 몇 개 들어가나요?`,
              fig: cuboidFig(A, B, C, { labels: [`${A} cm`, `${B} cm`, `${C} cm`] }),
              answer: intAns(a * b * c, '개'),
              steps: [`가로 $${A} \\div ${k} = ${a}$ 개, 세로 $${B} \\div ${k} = ${b}$ 개, 높이 $${C} \\div ${k} = ${c}$ 개`, `$${a} \\times ${b} \\times ${c} = ${a * b * c}$ (개)`],
            };
          }
          const V = a * b * c;
          if (level === 2) {
            return {
              q: `밑면의 넓이가 $${a * b}$ cm² 이고 부피가 $${V}$ cm³ 인 직육면체의 높이는 몇 cm 인가요?`,
              answer: intAns(c, 'cm'),
              steps: [`(부피) $=$ (밑면의 넓이) $\\times$ (높이)`, `높이: $${V} \\div ${a * b} = ${c}$ (cm)`],
            };
          }
          return {
            q: `부피가 $${V}$ cm³ 인 직육면체입니다. $\\square$ 안에 알맞은 수를 구하세요.`,
            fig: cuboidFig(a, b, c, { labels: [`${a} cm`, `${b} cm`, '□ cm'] }),
            answer: intAns(c, 'cm'),
            steps: [`밑면의 넓이: $${a} \\times ${b} = ${a * b}$ (cm²)`, `높이: $${V} \\div ${a * b} = ${c}$ (cm)`],
          };
        },
      },
    ],
  },
};

/** 받침에 따라 '과/와' (한글 단어) */
function jo2(w: string): string {
  const ch = w.charCodeAt(w.length - 1);
  return ch >= 0xac00 && ch <= 0xd7a3 && (ch - 0xac00) % 28 !== 0 ? '과' : '와';
}

