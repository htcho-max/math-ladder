// 초6-2 콘텐츠
import type { ContentMap, Level } from '../../core/types';
import type { Rng } from '../../core/rng';
import { F } from '../../core/frac';
import { gcd, lcm, round } from '../../core/nt';
import { comma, makeChoices, numChoices } from '../../core/tex';
import { Svg } from '../../core/fig';
import { pickName, pickNames, josa, jo, fracAns, intAns, decAns, ft, mt, properFrac, reduceTex, dt, mkDec, nj, ro } from './util';
import { circleFig, coneFig, cubesFig, cylinderFig, sphereFig, topViewFig, shapeFig, P } from './fig56';
import { WORD6 } from './words6';
import { attachHard } from './hard5';
import { HARD6 } from './hard6';

const piText = (pi: number) => `(원주율: $${pi}$)`;
const pickPi = (r: Rng, level: Level) => (level === 1 ? r.pick([3, 3.1]) : 3.14);

/** 쌓기나무 높이 배열 (행 0 = 뒤). staircase=true 면 앞·오른쪽으로 갈수록 낮아져 숨은 칸이 없음 */
function stack(r: Rng, R: number, C: number, maxH: number, staircase: boolean): number[][] {
  for (;;) {
    const h: number[][] = [];
    for (let i = 0; i < R; i++) {
      const row: number[] = [];
      for (let j = 0; j < C; j++) {
        let v = r.int(staircase ? 1 : 0, maxH);
        if (staircase) {
          if (i > 0) v = Math.min(v, h[i - 1][j]);
          if (j > 0) v = Math.min(v, row[j - 1]);
        }
        row.push(v);
      }
      h.push(row);
    }
    const tot = h.flat().reduce((a, b) => a + b, 0);
    // 빈 줄·빈 열이 없고 적당히 다양한 모양
    if (h.every((row) => row.some((x) => x > 0)) && h[0].every((_, j) => h.some((row) => row[j] > 0)) && tot >= R * C - 1 && Math.max(...h.flat()) >= 2) return h;
  }
}

export const content: ContentMap = {
  // ═════════════ 6-2-1 분수의 나눗셈 ═════════════
  'e6b-1': {
    concepts: [
      {
        title: '분모가 같은 (분수) ÷ (분수)',
        body: '분모가 같으면 **분자끼리 나누어요**.\n$$\\frac{6}{7} \\div \\frac{2}{7} = 6 \\div 2 = 3, \\qquad \\frac{5}{9} \\div \\frac{2}{9} = 5 \\div 2 = \\frac{5}{2} = 2\\frac{1}{2}$$\n"$\\frac{6}{7}$ 안에 $\\frac{2}{7}$ 가 몇 번 들어가나?" 와 같은 뜻이에요.',
      },
      {
        title: '분모가 다른 (분수) ÷ (분수)',
        body: '**통분한 뒤** 분자끼리 나누어요.\n$$\\frac{3}{4} \\div \\frac{1}{6} = \\frac{9}{12} \\div \\frac{2}{12} = 9 \\div 2 = 4\\frac{1}{2}$$',
      },
      {
        title: '(자연수) ÷ (분수)',
        body: '$6 \\div \\frac{3}{4}$ 은 "$\\frac{1}{4}$ 이 $3$ 개면 $6$, $1$ 개는 $6 \\div 3 = 2$, $\\frac{4}{4}$ 는 $2 \\times 4 = 8$" 이에요.\n$$6 \\div \\frac{3}{4} = (6 \\div 3) \\times 4 = 8$$',
      },
      {
        title: '(분수) ÷ (분수) 를 곱셈으로',
        body: '나누는 분수의 **분모와 분자를 바꾸어 곱해요**.\n$$\\frac{2}{3} \\div \\frac{5}{7} = \\frac{2}{3} \\times \\frac{7}{5} = \\frac{14}{15}$$\n- 대분수는 가분수로 바꾼 뒤 계산해요.\n- 1보다 작은 수로 나누면 몫이 나누어지는 수보다 커져요.',
        example: { q: '$1\\frac{1}{2} \\div \\frac{3}{4}$', a: '$\\frac{3}{2} \\times \\frac{4}{3} = 2$' },
      },
    ],
    skills: [
      {
        id: 'same-den',
        title: '분모가 같은 분수의 나눗셈',
        gen(r, level) {
          const d = r.int(level === 1 ? 5 : 7, level === 1 ? 12 : 19);
          let b = r.int(1, Math.floor((d - 1) / 2));
          let a = 1;
          if (level === 1) {
            const k = r.int(2, Math.max(2, Math.floor((d - 1) / b)));
            a = b * k;
            if (a >= d) {
              b = 1;
              a = r.int(2, d - 1);
            }
          } else {
            for (let t = 0; t < 100; t++) {
              b = r.int(1, Math.floor((d - 1) / 2));
              a = r.int(b + 1, d - 1);
              if (a % b !== 0 && gcd(a, d) === 1 && gcd(b, d) === 1) break;
            }
          }
          if (level === 3) {
            const w = r.int(1, 3);
            const A = w * d + a;
            const res3 = new F(A, b);
            return {
              q: `계산하세요.\n$$${w}\\frac{${a}}{${d}} \\div \\frac{${b}}{${d}}$$`,
              answer: fracAns(res3),
              steps: [`가분수로: $${w}\\frac{${a}}{${d}} = \\frac{${A}}{${d}}$`, '분모가 같으므로 분자끼리 나누어요.', `$${A} \\div ${b} = ${reduceTex(A, b)}$`],
            };
          }
          const res = new F(a, b);
          return {
            q: `계산하세요.\n$$\\frac{${a}}{${d}} \\div \\frac{${b}}{${d}}$$`,
            answer: fracAns(res),
            steps: ['분모가 같으므로 분자끼리 나누어요.', `$${a} \\div ${b} = ${reduceTex(a, b)}$`],
            hint: level === 1 ? undefined : '분자끼리 나누어떨어지지 않으면 몫을 분수로 나타내요.',
          };
        },
      },
      {
        id: 'diff-den',
        title: '분모가 다른 분수의 나눗셈',
        gen(r, level) {
          let fa: F, fb: F;
          for (;;) {
            fa = properFrac(r, 2, level === 1 ? 8 : 12);
            fb = properFrac(r, 2, level === 1 ? 8 : 12);
            if (fa.d === fb.d) continue;
            const L = lcm(fa.d, fb.d);
            if (L > 48) continue;
            const na = (fa.n * L) / fa.d,
              nb = (fb.n * L) / fb.d;
            if (level === 1 && na % nb !== 0) continue;
            break;
          }
          if (level === 3) fa = fa.add(r.int(1, 3));
          const L = lcm(fa.d, fb.d);
          const na = (fa.n * L) / fa.d,
            nb = (fb.n * L) / fb.d;
          const res = fa.div(fb);
          if (level === 3) {
            return {
              q: `계산하세요.\n$$${mt(fa)} \\div ${ft(fb)}$$`,
              answer: fracAns(res),
              steps: [`가분수로 바꾸고 통분: $\\frac{${na}}{${L}} \\div \\frac{${nb}}{${L}}$`, `분자끼리: $${na} \\div ${nb} = ${reduceTex(na, nb)}$`],
            };
          }
          return {
            q: `계산하세요.\n$$${ft(fa)} \\div ${ft(fb)}$$`,
            answer: fracAns(res),
            steps: [`통분: $\\frac{${na}}{${L}} \\div \\frac{${nb}}{${L}}$`, `분자끼리: $${na} \\div ${nb} = ${reduceTex(na, nb)}$`],
          };
        },
      },
      {
        id: 'nat-div-frac',
        title: '(자연수) ÷ (분수)',
        gen(r, level) {
          const f = properFrac(r, 2, level === 1 ? 7 : 12);
          const k = level === 1 ? f.n * r.int(1, 6) : r.int(2, 20);
          const res = new F(k).div(f);
          if (level === 3) {
            const g = f.add(r.int(1, 2));
            const res3 = new F(k).div(g);
            return {
              q: `계산하세요.\n$$${k} \\div ${mt(g)}$$`,
              answer: fracAns(res3),
              steps: [`$${mt(g)} = ${ft(g)}$`, `$${k} \\times \\frac{${g.d}}{${g.n}} = ${reduceTex(k * g.d, g.n)}$`],
            };
          }
          return {
            q: `계산하세요.\n$$${k} \\div ${ft(f)}$$`,
            answer: fracAns(res),
            steps: k % f.n === 0 ? [`$(${k} \\div ${f.n}) \\times ${f.d}$`, `$= ${k / f.n} \\times ${f.d} = ${k * f.d / f.n}$`] : [`$${k} \\times \\frac{${f.d}}{${f.n}} = \\frac{${k * f.d}}{${f.n}}$`, `$= ${mt(res)}$`],
          };
        },
      },
      {
        id: 'by-mult',
        title: '분수의 나눗셈을 곱셈으로',
        gen(r, level) {
          const fa = level === 3 ? properFrac(r, 2, 9).add(r.int(1, 3)) : properFrac(r, 2, 12);
          const fb = level === 1 ? properFrac(r, 2, 9) : level === 2 ? properFrac(r, 2, 12) : properFrac(r, 2, 7).add(r.int(1, 2));
          const res = fa.div(fb);
          if (level === 2 && r.chance(0.4)) {
            const right = `$${ft(fa)} \\times ${ft(fb.inv())}$`;
            return {
              q: `$${ft(fa)} \\div ${ft(fb)}$ 를 곱셈식으로 바르게 나타낸 것은?`,
              answer: makeChoices(r, right, [`$${ft(fa)} \\times ${ft(fb)}$`, `$${ft(fa.inv())} \\times ${ft(fb)}$`, `$${ft(fa.inv())} \\times ${ft(fb.inv())}$`, `$\\frac{${fa.n * fb.n}}{${fa.d}} \\times \\frac{1}{${fb.d}}$`], 4),
              steps: ['나누는 분수의 분모와 분자를 바꾸어 곱해요.', `${right}`],
            };
          }
          return {
            q: `계산하세요.\n$$${mt(fa)} \\div ${mt(fb)}$$`,
            answer: fracAns(res),
            steps: [level === 3 ? `가분수로: $${ft(fa)} \\div ${ft(fb)}$` : '나누는 분수의 분모와 분자를 바꾸어 곱해요.', `$${ft(fa)} \\times ${ft(fb.inv())} = ${reduceTex(fa.n * fb.d, fa.d * fb.n)}$`],
          };
        },
      },
      {
        id: 'word',
        title: '분수의 나눗셈 문장제',
        gen(r, level) {
          const nm = pickName(r);
          const k = level === 1 ? 0 : level === 2 ? r.int(1, 2) : r.int(3, 4);
          if (k === 0) {
            const per = properFrac(r, 2, 8);
            const n = r.int(2, 9);
            const tot = per.mul(n);
            return {
              q: `물 $${mt(tot)}$ L 를 한 병에 $${ft(per)}$ L 씩 나누어 담으려고 합니다. 병은 몇 개 필요한가요?`,
              answer: intAns(n, '개'),
              steps: [`$${mt(tot)} \\div ${ft(per)}$`, `$= ${ft(tot)} \\times ${ft(per.inv())} = ${n}$ (개)`],
            };
          }
          if (k === 1) {
            const a = properFrac(r, 2, 9).add(r.int(0, 3)),
              b = properFrac(r, 2, 9);
            const res = a.div(b);
            return {
              q: `${josa(nm, '은/는')} $${mt(a)}$ kg, 동생은 $${mt(b)}$ kg 의 딸기를 땄습니다. ${nm}${jo(nm, '이/가')} 딴 딸기는 동생이 딴 딸기의 몇 배인가요?`,
              answer: fracAns(res, { unit: '배' }),
              steps: [`$${mt(a)} \\div ${mt(b)}$`, `$= ${ft(a)} \\times ${ft(b.inv())} = ${mt(res)}$ (배)`],
            };
          }
          if (k === 2) {
            const len = properFrac(r, 2, 6).add(r.int(0, 2));
            const w = properFrac(r, 2, 9).add(r.int(1, 4));
            const res = w.div(len);
            return {
              q: `길이가 $${mt(len)}$ m 인 철근의 무게가 $${mt(w)}$ kg 입니다. 철근 $1$ m 의 무게는 몇 kg 인가요?`,
              answer: fracAns(res, { unit: 'kg' }),
              steps: ['($1$ m 의 무게) $=$ (무게) $\\div$ (길이)', `$${mt(w)} \\div ${mt(len)} = ${ft(w)} \\times ${ft(len.inv())} = ${mt(res)}$ (kg)`],
            };
          }
          if (k === 3) {
            const t = properFrac(r, 2, 5);
            const sp = r.int(2, 9) * t.n;
            const dist = t.mul(sp);
            return {
              q: `자전거를 타고 $${ft(t)}$ 시간 동안 $${mt(dist)}$ km 를 갔습니다. 같은 빠르기로 $1$ 시간 동안 갈 수 있는 거리는 몇 km 인가요?`,
              answer: fracAns(new F(sp), { unit: 'km' }),
              steps: [`$${mt(dist)} \\div ${ft(t)}$`, `$= ${ft(dist)} \\times ${ft(t.inv())} = ${sp}$ (km)`],
            };
          }
          const area = properFrac(r, 2, 9).add(r.int(2, 8));
          const w = properFrac(r, 2, 5).add(r.int(1, 3));
          const h = area.div(w);
          return {
            q: `넓이가 $${mt(area)}$ m² 인 평행사변형의 밑변의 길이가 $${mt(w)}$ m 입니다. 높이는 몇 m 인가요?`,
            answer: fracAns(h, { unit: 'm' }),
            steps: ['(높이) $=$ (넓이) $\\div$ (밑변)', `$${ft(area)} \\times ${ft(w.inv())} = ${mt(h)}$ (m)`],
          };
        },
      },
    ],
  },

  // ═════════════ 6-2-2 소수의 나눗셈 ═════════════
  'e6b-2': {
    concepts: [
      {
        title: '자연수의 나눗셈을 이용한 (소수) ÷ (소수)',
        body: '나누어지는 수와 나누는 수에 **같은 수를 곱해도 몫은 같아요**.\n$$1.8 \\div 0.3 = 18 \\div 3 = 6, \\qquad 4.32 \\div 0.12 = 432 \\div 12 = 36$$',
      },
      {
        title: '자릿수가 다른 (소수) ÷ (소수)',
        body: '나누는 수가 자연수가 되도록 **두 수의 소수점을 똑같이 옮겨요**.\n$$5.76 \\div 2.4 = 57.6 \\div 24 = 2.4$$\n몫의 소수점은 옮긴 나누어지는 수의 소수점 위치에 맞추어 찍어요.',
      },
      {
        title: '(자연수) ÷ (소수)',
        body: '나누는 수의 소수점을 옮긴 만큼 자연수 뒤에 $0$ 을 붙여요.\n$$12 \\div 1.5 = 120 \\div 15 = 8, \\qquad 9 \\div 0.25 = 900 \\div 25 = 36$$',
      },
      {
        title: '몫을 반올림하기, 나누어 주고 남는 양',
        body: '- 몫이 나누어떨어지지 않으면 구하려는 자리 **바로 아래 자리에서 반올림**해요.\n- "몇 개까지 담을 수 있나?" 처럼 몫을 자연수까지 구하고 남는 양을 구할 때는 (나누어지는 수) $=$ (나누는 수) $\\times$ (몫) $+$ (남는 양) 으로 확인해요.\n예) $15.3 \\div 2 = 7 \\cdots 1.3$',
      },
    ],
    skills: [
      {
        id: 'same-places',
        title: '자릿수가 같은 (소수) ÷ (소수)',
        gen(r, level) {
          const k = level === 1 ? 1 : 2;
          let dm = level === 1 ? r.int(2, 9) : level === 2 ? r.int(11, 49) : r.int(101, 499);
          if (dm % 10 === 0) dm += 1; // 0.20 → 0.2 처럼 자릿수가 줄어들지 않게
          const kk = level === 3 ? 2 : k;
          let q = r.int(2, level === 1 ? 9 : 30);
          for (let t = 0; t < 20 && (dm * q) % 10 === 0; t++) q += 1;
          const d = mkDec(dm, kk),
            a = mkDec(dm * q, kk);
          return {
            q: `계산하세요.\n$$${dt(a)} \\div ${dt(d)}$$`,
            answer: intAns(q),
            steps: [`두 수에 $${kk === 1 ? 10 : 100}$ 을 곱해요: $${dm * q} \\div ${dm}$`, `$= ${q}$`],
          };
        },
      },
      {
        id: 'diff-places',
        title: '자릿수가 다른 (소수) ÷ (소수)',
        gen(r, level) {
          let dm = r.int(level === 1 ? 2 : 11, level === 1 ? 9 : 49);
          if (dm % 10 === 0) dm += 1; // 2.0 처럼 나누는 수가 자연수가 되지 않게
          let qm = r.int(level === 1 ? 11 : 11, level === 1 ? 49 : 99);
          while ((dm * qm) % 10 === 0) qm++; // 나누어지는 수가 소수 두 자리로 유지되게 (0.80 → 0.8 방지)
          // 나누는 수 소수 한 자리, 몫 소수 한 자리 → 나누어지는 수 소수 두 자리
          const d = mkDec(dm, 1),
            q = mkDec(qm, 1),
            a = mkDec(dm * qm, 2);
          if (level === 3) {
            const d2 = mkDec(dm, 2);
            const a2 = mkDec(dm * qm, 2);
            const q2 = round(a2 / d2, 8);
            return {
              q: `계산하세요.\n$$${dt(a2)} \\div ${dt(d2)}$$`,
              answer: decAns(q2),
              steps: [`두 수의 소수점을 오른쪽으로 두 칸씩: $${dm * qm} \\div ${dm}$`, `$= ${dt(q2)}$`],
            };
          }
          return {
            q: `계산하세요.\n$$${dt(a)} \\div ${dt(d)}$$`,
            answer: decAns(q),
            steps: [`두 수의 소수점을 오른쪽으로 한 칸씩: $${dt(round(a * 10, 8))} \\div ${dm}$`, `$= ${dt(q)}$`],
          };
        },
      },
      {
        id: 'nat-div-dec',
        title: '(자연수) ÷ (소수)',
        gen(r, level) {
          if (level === 3) {
            // 몫이 소수 한 자리인 (자연수) ÷ (소수 두 자리): 예) 3 ÷ 0.08 = 37.5
            const dm = r.pick([8, 16, 24, 32, 125, 375]);
            const qm = dm < 100 ? 125 * r.pick([1, 3, 5, 7]) : r.pick([16, 24, 32, 48, 56, 64, 72, 88]);
            const a = (dm * qm) / 1000;
            const d = mkDec(dm, 2),
              q = mkDec(qm, 1);
            return {
              q: `몫을 소수로 나타내세요.\n$$${a} \\div ${dt(d)}$$`,
              answer: decAns(q),
              steps: [`나누는 수를 자연수로: 두 수에 $100$ 을 곱해 $${a * 100} \\div ${dm}$`, `나누어떨어지지 않으면 $0$ 을 내려 계속 나눠요: $${a * 100} \\div ${dm} = ${dt(q)}$`],
            };
          }
          const k = level === 1 ? 1 : 2;
          const dm = level === 1 ? r.pick([2, 4, 5, 6, 8]) : r.pick([4, 5, 8, 12, 15, 16, 25, 75]);
          const q = r.int(2, 20);
          const prod = dm * q;
          if (prod % p10(k) !== 0) {
            // 나누어지는 수가 자연수가 되도록 q 조정
            const need = p10(k) / gcd(dm, p10(k));
            const q2 = need * r.int(1, 6);
            const a2 = (dm * q2) / p10(k);
            const d2 = mkDec(dm, k);
            return {
              q: `계산하세요.\n$$${a2} \\div ${dt(d2)}$$`,
              answer: intAns(q2),
              steps: [`나누는 수를 자연수로: 두 수에 ${nj(p10(k), '을/를')} 곱해 $${a2 * p10(k)} \\div ${dm}$`, `$= ${q2}$`],
            };
          }
          const a = prod / p10(k),
            d = mkDec(dm, k);
          return {
            q: `계산하세요.\n$$${a} \\div ${dt(d)}$$`,
            answer: intAns(q),
            steps: [`나누는 수를 자연수로: 두 수에 ${nj(p10(k), '을/를')} 곱해 $${prod} \\div ${dm}$`, `$= ${q}$`],
          };
        },
      },
      {
        id: 'round-quot',
        title: '몫을 반올림하여 나타내기',
        gen(r, level) {
          for (;;) {
            const a = mkDec(r.int(11, 999), 1);
            const d = level === 1 ? r.pick([3, 6, 7, 9]) : mkDec(r.pick([3, 6, 7, 9, 11, 13]), 1);
            const exact = a / d;
            const place = level === 3 ? 2 : 1;
            const f = p10(place);
            const ans = Math.floor(exact * f + 0.5 + 1e-9) / f;
            if (Number.isInteger(round(exact * 1000, 6))) continue; // 나누어떨어지는 것은 제외
            const shown = Math.floor(exact * f * 10 + 1e-9) / (f * 10);
            return {
              q: `몫을 반올림하여 소수 ${place === 1 ? '첫째' : '둘째'} 자리까지 나타내세요.\n$$${dt(a)} \\div ${dt(d)}$$`,
              answer: decAns(round(ans, 6)),
              steps: [`소수 ${place === 1 ? '둘째' : '셋째'} 자리까지 계산하면 $${dt(a)} \\div ${dt(d)} = ${shown.toFixed(place + 1)}\\cdots$`, `소수 ${place === 1 ? '둘째' : '셋째'} 자리 숫자가 $${Math.floor(exact * f * 10 + 1e-9) % 10}$ 이므로 ${Math.floor(exact * f * 10 + 1e-9) % 10 >= 5 ? '올림' : '버림'} → $${dt(round(ans, 6))}$`],
            };
          }
        },
      },
      {
        id: 'remainder',
        title: '나누어 주고 남는 양',
        gen(r, level) {
          const perM = r.int(11, 35);
          const per = level === 1 ? r.int(2, 5) : level === 2 ? r.int(2, 9) : mkDec(perM % 10 === 0 ? perM + 1 : perM, 1);
          const n = r.int(3, 12);
          const remM = r.int(1, Math.round(per * 10) - 1);
          const rem = mkDec(remM, 1);
          const tot = round(per * n + rem, 8);
          const item = r.pick([
            ['끈', 'm'],
            ['주스', 'L'],
            ['밀가루', 'kg'],
          ]);
          return {
            q: `${item[0]} $${dt(tot)}$ ${item[1]} ${item[1] === 'kg' ? '을' : '를'} 한 사람에게 $${dt(per)}$ ${item[1]} 씩 나누어 주려고 합니다. 몇 명에게 나누어 줄 수 있고, 남는 ${josa(item[0], '은/는')} 몇 ${item[1]}인가요?`,
            answer: {
              type: 'fields',
              fields: [
                { label: '사람 수', value: n, unit: '명' },
                { label: '남는 양', value: rem, unit: item[1] },
              ],
            },
            steps: [`$${dt(tot)} \\div ${dt(per)}$ 의 몫을 자연수까지 구하면 $${n}$`, `남는 양: $${dt(tot)} - ${dt(per)} \\times ${n} = ${dt(rem)}$ (${item[1]})`],
            hint: '몫은 자연수까지만 구해요.',
          };
        },
      },
      {
        id: 'word',
        title: '소수의 나눗셈 문장제',
        gen(r, level) {
          const nm = pickName(r);
          const k = level === 1 ? 0 : level === 2 ? r.int(1, 2) : 3;
          if (k === 0) {
            const per = mkDec(r.int(2, 9), 1);
            const n = r.int(3, 12);
            return {
              q: `리본 $${dt(round(per * n, 8))}$ m 를 $${dt(per)}$ m 씩 자르면 몇 도막이 되나요?`,
              answer: intAns(n, '도막'),
              steps: [`$${dt(round(per * n, 8))} \\div ${dt(per)} = ${round(per * n * 10, 6)} \\div ${round(per * 10, 6)} = ${n}$ (도막)`],
            };
          }
          if (k === 1) {
            const a = mkDec(r.int(11, 49), 1);
            const m = mkDec(r.int(11, 39), 1);
            const b = round(a * m, 8);
            return {
              q: `${josa(nm, '이/가')} 기르는 강아지의 무게는 $${dt(b)}$ kg, 고양이의 무게는 $${dt(a)}$ kg 입니다. 강아지의 무게는 고양이의 무게의 몇 배인가요?`,
              answer: decAns(m, '배'),
              steps: [`$${dt(b)} \\div ${dt(a)} = ${dt(m)}$ (배)`],
            };
          }
          if (k === 2) {
            const L = mkDec(r.int(11, 49), 1);
            const km = mkDec(r.int(101, 199), 1);
            const per = round(km / L, 8);
            if (!Number.isInteger(round(per * 100, 6))) {
              const q = r.int(8, 18);
              const L2 = mkDec(r.int(11, 49), 1);
              return {
                q: `휘발유 $${dt(L2)}$ L 로 $${dt(round(L2 * q, 8))}$ km 를 가는 자동차가 있습니다. 휘발유 $1$ L 로 몇 km 를 갈 수 있나요?`,
                answer: intAns(q, 'km'),
                steps: [`$${dt(round(L2 * q, 8))} \\div ${dt(L2)} = ${q}$ (km)`],
              };
            }
            return {
              q: `휘발유 $${dt(L)}$ L 로 $${dt(km)}$ km 를 가는 자동차가 있습니다. 휘발유 $1$ L 로 몇 km 를 갈 수 있나요?`,
              answer: decAns(per, 'km'),
              steps: [`$${dt(km)} \\div ${dt(L)} = ${dt(per)}$ (km)`],
            };
          }
          const area = mkDec(r.int(101, 999), 1);
          const w = mkDec(r.int(21, 69), 1);
          const h = Math.floor((area / w) * 10 + 0.5) / 10;
          return {
            q: `넓이가 $${dt(area)}$ m² 인 직사각형 모양의 밭의 가로가 $${dt(w)}$ m 입니다. 세로는 약 몇 m 인지 반올림하여 소수 첫째 자리까지 나타내세요.`,
            answer: decAns(round(h, 6), 'm'),
            steps: [`(세로) $=$ (넓이) $\\div$ (가로) $= ${dt(area)} \\div ${dt(w)} = ${(Math.floor((area / w) * 100 + 1e-9) / 100).toFixed(2)}\\cdots$`, `반올림하여 $${dt(round(h, 6))}$ m`],
          };
        },
      },
    ],
  },

  // ═════════════ 6-2-3 공간과 입체 ═════════════
  'e6b-3': {
    concepts: [
      {
        title: '어느 방향에서 본 모양',
        body: '같은 물체도 **보는 방향**(위, 앞, 옆)에 따라 모양이 달라요. 사진이나 그림이 어느 방향에서 본 것인지 찾아봐요.',
      },
      {
        title: '쌓기나무의 개수 구하기',
        body: '쌓은 모양만 보면 보이지 않는 쌓기나무가 있을 수 있어요. **위에서 본 모양**과 함께 보면 개수를 정확히 알 수 있어요.\n- 위에서 본 모양의 각 칸에 쌓은 개수를 쓰고, 모두 더해요.',
        example: { q: '위에서 본 모양에 $2, 1, 3, 1$ 이 쓰여 있으면', a: '$2+1+3+1 = 7$ (개)' },
      },
      {
        title: '위, 앞, 옆에서 본 모양',
        body: '- **위**에서 본 모양: 바닥에 닿은 칸의 모양\n- **앞**에서 본 모양: 각 줄(세로줄)에서 **가장 높은** 층수\n- **옆**에서 본 모양: 옆에서 본 각 줄에서 가장 높은 층수',
      },
      {
        title: '층별로 나타내기',
        body: '쌓기나무를 $1$ 층, $2$ 층, $3$ 층으로 나누어 위에서 본 모양을 그리면 쌓은 모양을 정확히 알 수 있어요.\n$2$ 층 이상의 칸은 반드시 아래층에 쌓기나무가 있어야 해요.',
      },
    ],
    skills: [
      {
        id: 'top-count',
        title: '위에서 본 모양으로 개수 세기',
        gen(r, level) {
          const R = level === 1 ? 2 : 3,
            C = level === 1 ? 2 : 3;
          const h = stack(r, R, C, level === 3 ? 4 : 3, false);
          const tot = h.flat().reduce((a, b) => a + b, 0);
          if (level === 3) {
            const third = h.flat().filter((x) => x >= 3).length;
            const two = h.flat().filter((x) => x >= 2).length;
            const ask = r.chance(0.5) ? 2 : 3;
            const v = ask === 2 ? two : third;
            if (v > 0)
              return {
                q: `위에서 본 모양에 쌓기나무의 개수를 쓴 것입니다. ${ask}층에 쌓은 쌓기나무는 몇 개인가요?`,
                fig: topViewFig(h),
                answer: intAns(v, '개'),
                steps: [`${ask}층에 쌓기나무가 있으려면 그 칸의 수가 $${ask}$ 이상이어야 해요.`, `$${ask}$ 이상인 칸: $${v}$ 개`],
              };
          }
          return {
            q: '위에서 본 모양에 쌓기나무의 개수를 쓴 것입니다. 사용한 쌓기나무는 모두 몇 개인가요?',
            fig: topViewFig(h),
            answer: intAns(tot, '개'),
            steps: ['각 칸의 수를 모두 더해요.', `$${h.flat().filter((x) => x > 0).join(' + ')} = ${tot}$ (개)`],
          };
        },
      },
      {
        id: 'iso-count',
        title: '쌓은 모양 보고 개수 세기',
        gen(r, level) {
          const R = level === 1 ? 2 : 3,
            C = level === 1 ? 2 : 3;
          const h = stack(r, R, C, level === 1 ? 2 : 3, true);
          const tot = h.flat().reduce((a, b) => a + b, 0);
          if (level === 3) {
            return {
              q: '쌓기나무로 쌓은 모양과 위에서 본 모양입니다. 똑같은 모양으로 쌓으려면 쌓기나무는 몇 개 필요한가요?',
              fig: cubesFig(h, 26, true),
              answer: intAns(tot, '개'),
              steps: ['위에서 본 모양의 각 칸에 몇 층으로 쌓았는지 그림에서 세어 적어요.', `$${h.flat().join(' + ')} = ${tot}$ (개)`],
            };
          }
          return {
            q: '쌓기나무로 쌓은 모양입니다. 사용한 쌓기나무는 모두 몇 개인가요? (보이지 않는 곳에 숨은 쌓기나무는 없고, 뒤쪽 줄이 앞쪽 줄보다 낮지 않습니다.)',
            fig: cubesFig(h),
            answer: intAns(tot, '개'),
            steps: ['줄별로 층수를 세어 더해요.', `$${h.flat().join(' + ')} = ${tot}$ (개)`],
          };
        },
      },
      {
        id: 'view-heights',
        title: '앞·옆에서 본 모양',
        gen(r, level) {
          const R = level === 1 ? 2 : 3,
            C = 3;
          const h = stack(r, R, C, 3, false);
          const side = level === 3 && r.chance(0.5);
          // 앞: 열마다 최댓값 (왼쪽부터), 오른쪽 옆: 행마다 최댓값 (앞에서부터 왼쪽 → 오른쪽으로 보면 앞줄이 왼쪽)
          const front = h[0].map((_, j) => Math.max(...h.map((row) => row[j])));
          const right = h.map((row) => Math.max(...row)).reverse(); // 오른쪽에서 볼 때 왼쪽이 앞줄
          const ans = side ? right : front;
          const fmt = (a: number[]) => `$${a.join(',\\ ')}$`;
          const wr = [ans.slice().reverse(), ans.map((x, i) => (i === 0 ? (x > 1 ? x - 1 : x + 1) : x)), ans.map((x, i) => (i === ans.length - 1 ? (x > 1 ? x - 1 : x + 1) : x)), ans.map((x, i) => (i === 1 ? (x < 3 ? x + 1 : x - 1) : x))];
          const alt = side ? front : right;
          if (alt.length === ans.length) wr.push(alt);
          if (level === 2) {
            const faces = front.reduce((a, b) => a + b, 0);
            return {
              q: '위에서 본 모양에 쌓기나무의 개수를 쓴 것입니다. 앞에서 보았을 때 보이는 쌓기나무 면은 모두 몇 개인가요?',
              fig: topViewFig(h),
              answer: intAns(faces, '개'),
              steps: [`앞에서 보면 각 세로줄에서 가장 높은 층수가 보여요: 왼쪽부터 $${front.join(', ')}$`, `$${front.join(' + ')} = ${faces}$ (개)`],
            };
          }
          return {
            q: `위에서 본 모양에 쌓기나무의 개수를 쓴 것입니다. ${side ? '오른쪽 옆' : '앞'}에서 본 모양의 층수를 ${side ? '왼쪽(앞줄)' : '왼쪽'}부터 차례로 바르게 나타낸 것은?`,
            fig: topViewFig(h),
            answer: makeChoices(r, fmt(ans), wr.map(fmt), 4),
            steps: [side ? '오른쪽 옆에서 보면 각 가로줄에서 가장 큰 수가 보여요 (앞줄이 왼쪽).' : '앞에서 보면 각 세로줄에서 가장 큰 수가 보여요.', `${fmt(ans)}`],
          };
        },
      },
      {
        id: 'more-needed',
        title: '정육면체를 만들려면',
        gen(r, level) {
          const n = level === 1 ? 2 : 3;
          const h = stack(r, n, n, n, false);
          const tot = h.flat().reduce((a, b) => a + b, 0);
          if (level === 3) {
            const big = 4;
            return {
              q: `위에서 본 모양에 쌓기나무의 개수를 쓴 것입니다. 이 모양에 쌓기나무를 더 쌓아서 가장 작은 정육면체 모양을 만들려고 합니다. 이 모양을 그대로 두고 쌓을 때, 쌓기나무는 적어도 몇 개 더 필요한가요?`,
              fig: topViewFig(h),
              answer: intAns(Math.max(...h.flat()) <= 3 ? 27 - tot : big ** 3 - tot, '개'),
              steps: [`가장 높은 층이 $${Math.max(...h.flat())}$ 층이고 바닥이 $3 \\times 3$ 이므로 한 모서리에 $3$ 개씩인 정육면체`, `$3 \\times 3 \\times 3 = 27$, $27 - ${tot} = ${27 - tot}$ (개)`],
            };
          }
          return {
            q: `위에서 본 모양에 쌓기나무의 개수를 쓴 것입니다. 쌓기나무를 더 쌓아서 한 모서리에 $${n}$ 개씩 놓인 정육면체를 만들려면 쌓기나무는 몇 개 더 필요한가요?`,
            fig: topViewFig(h),
            answer: intAns(n ** 3 - tot, '개'),
            steps: [`정육면체: $${n} \\times ${n} \\times ${n} = ${n ** 3}$ (개)`, `지금: $${tot}$ 개 → $${n ** 3} - ${tot} = ${n ** 3 - tot}$ (개)`],
          };
        },
      },
    ],
  },

  // ═════════════ 6-2-4 비례식과 비례배분 ═════════════
  'e6b-4': {
    concepts: [
      {
        title: '비의 성질',
        body: '비 $3 : 5$ 에서 $3$ 을 **전항**, $5$ 를 **후항**이라고 해요.\n- 전항과 후항에 $0$ 이 아닌 같은 수를 **곱해도** 비율은 같아요: $3 : 5 = 6 : 10$\n- 전항과 후항을 $0$ 이 아닌 같은 수로 **나누어도** 비율은 같아요: $12 : 8 = 3 : 2$',
      },
      {
        title: '간단한 자연수의 비로 나타내기',
        body: '- 자연수의 비: 최대공약수로 나눠요. $18 : 24 = 3 : 4$\n- 소수의 비: $10, 100$ 을 곱해 자연수로. $0.6 : 1.5 = 6 : 15 = 2 : 5$\n- 분수의 비: 분모의 최소공배수를 곱해요. $\\frac{1}{2} : \\frac{2}{3} = 3 : 4$',
      },
      {
        title: '비례식',
        body: '비율이 같은 두 비를 등호로 나타낸 식을 **비례식**이라고 해요. $2 : 3 = 4 : 6$\n- 바깥쪽 두 수를 **외항**, 안쪽 두 수를 **내항**이라고 해요.\n- 비례식에서 **외항의 곱과 내항의 곱은 같아요**: $2 \\times 6 = 3 \\times 4$',
        example: { q: '$3 : 4 = \\square : 20$', a: '$4 \\times \\square = 3 \\times 20 = 60$, $\\square = 15$' },
      },
      {
        title: '비례배분',
        body: '전체를 주어진 비로 나누는 것을 **비례배분**이라고 해요.\n전체 $\\bigcirc$ 를 $가 : 나$ 로 나누면\n$$\\bigcirc \\times \\frac{가}{가 + 나}, \\quad \\bigcirc \\times \\frac{나}{가 + 나}$$',
      },
    ],
    skills: [
      {
        id: 'ratio-prop',
        title: '비의 성질',
        gen(r, level) {
          let a = r.int(1, 9),
            b = r.int(2, 9);
          if (a === b) b += 1;
          const k = r.int(2, level === 1 ? 5 : 9);
          if (level === 1) {
            return {
              q: `$\\square$ 안에 알맞은 수를 구하세요.\n$$${a} : ${b} = ${a * k} : \\square$$`,
              answer: intAns(b * k),
              steps: [`전항에 ${nj(k, '을/를')} 곱했으므로 후항에도 ${nj(k, '을/를')} 곱해요.`, `$${b} \\times ${k} = ${b * k}$`],
            };
          }
          if (level === 2) {
            return {
              q: `$\\square$ 안에 알맞은 수를 구하세요.\n$$${a * k} : ${b * k} = \\square : ${b}$$`,
              answer: intAns(a),
              steps: [`후항을 ${ro(k)} 나누었으므로 전항도 ${ro(k)} 나눠요.`, `$${a * k} \\div ${k} = ${a}$`],
            };
          }
          const g = gcd(a, b);
          a /= g;
          b /= g;
          const opts = [`$${a * k} : ${b * k}$`, `$${a + k} : ${b + k}$`, `$${a * k} : ${b + k}$`, `$${b * k} : ${a * k}$`, `$${a * k + 1} : ${b * k}$`];
          return {
            q: `비율이 $${a} : ${b}$ ${jo(String(b), '과/와')} 같은 비는?`,
            answer: makeChoices(r, opts[0], opts.slice(1), 5),
            steps: [`전항과 후항에 같은 수를 곱해야 비율이 같아요.`, `$${a} : ${b} = ${a * k} : ${b * k}$ (각각 $${k}$ 배)`],
          };
        },
      },
      {
        id: 'simplify',
        title: '간단한 자연수의 비로 나타내기',
        gen(r, level) {
          let p = r.int(1, 9),
            q = r.int(1, 9);
          while (gcd(p, q) !== 1 || p === q) {
            p = r.int(1, 9);
            q = r.int(1, 9);
          }
          const fields = (x: number, y: number) => ({
            type: 'fields' as const,
            fields: [
              { label: '전항', value: x },
              { label: '후항', value: y },
            ],
          });
          if (level === 1) {
            const g = r.int(2, 12);
            return {
              q: `$${p * g} : ${q * g}$ ${jo(String(q * g), '을/를')} 가장 간단한 자연수의 비로 나타내세요.`,
              answer: fields(p, q),
              steps: [`${nj(p * g, '과/와')} $${q * g}$ 의 최대공약수: $${g}$`, `$${p * g} \\div ${g} : ${q * g} \\div ${g} = ${p} : ${q}$`],
            };
          }
          if (level === 2) {
            const g = r.int(1, 6);
            const a = mkDec(p * g, 1),
              b = r.chance(0.5) ? mkDec(q * g, 1) : mkDec(q * g * 10, 2);
            const bm = Math.round(b * 10 * (places2(b) === 2 ? 10 : 1));
            const am = Math.round(a * 10 * (places2(b) === 2 ? 10 : 1));
            const gg = gcd(am, bm);
            return {
              q: `$${dt(a)} : ${dt(b)}$ ${jo(String(dt(b)), '을/를')} 가장 간단한 자연수의 비로 나타내세요.`,
              answer: fields(am / gg, bm / gg),
              steps: [`전항과 후항에 $${places2(b) === 2 ? 100 : 10}$ 을 곱하면 $${am} : ${bm}$`, `최대공약수 ${ro(gg)} 나누면 $${am / gg} : ${bm / gg}$`],
            };
          }
          const fa = properFrac(r, 2, 7),
            fb = r.chance(0.5) ? properFrac(r, 2, 9) : new F(r.int(1, 9), 10);
          const useDec = fa.d !== 10 && (fb.d === 10 || fb.d === 5 || fb.d === 2) && r.chance(0.7);
          const L = lcm(fa.d, fb.d);
          const x = (fa.n * L) / fa.d,
            y = (fb.n * L) / fb.d;
          const g = gcd(x, y);
          return {
            q: `$${ft(fa)} : ${useDec ? dt(fb.value) : ft(fb)}$ ${jo(String(useDec ? dt(fb.value) : fb.n), '을/를')} 가장 간단한 자연수의 비로 나타내세요.`,
            answer: fields(x / g, y / g),
            steps: [useDec ? `소수를 분수로: $${dt(fb.value)} = ${ft(fb)}$` : '분모의 최소공배수를 곱해요.', `전항과 후항에 ${nj(L, '을/를')} 곱하면 $${x} : ${y}$`, ...(g > 1 ? [`최대공약수 ${ro(g)} 나누면 $${x / g} : ${y / g}$`] : [])],
          };
        },
      },
      {
        id: 'proportion',
        title: '비례식 풀기',
        gen(r, level) {
          let a = r.int(1, level === 1 ? 9 : 15),
            b = r.int(2, level === 1 ? 12 : 20);
          if (a === b) b += 1;
          const k = level === 1 ? r.int(2, 6) : r.int(3, 12);
          const c = a * k,
            d = b * k;
          const pos = r.int(0, 3);
          const vals = [a, b, c, d];
          const show = vals.map((v, i) => (i === pos ? '\\square' : String(v)));
          if (level === 3) {
            // 분수·소수가 섞인 비례식
            let dd = r.int(2, 5);
            while (gcd(a, dd) !== 1) dd += 1;
            const fa = new F(a, dd);
            const q2 = fa.mul(d).div(b);
            return {
              q: `$\\square$ 안에 알맞은 수를 구하세요.\n$$${ft(fa)} : ${b} = \\square : ${d}$$`,
              answer: fracAns(q2),
              steps: [`외항의 곱 $=$ 내항의 곱: $${ft(fa)} \\times ${d} = ${b} \\times \\square$`, `$${b} \\times \\square = ${mt(fa.mul(d))}$`, `$\\square = ${mt(q2)}$`],
            };
          }
          const prodOut = pos === 0 || pos === 3 ? null : a * d;
          const prodIn = pos === 1 || pos === 2 ? null : b * c;
          const known = prodOut ?? prodIn!;
          const other = pos === 0 ? d : pos === 3 ? a : pos === 1 ? c : b;
          return {
            q: `$\\square$ 안에 알맞은 수를 구하세요.\n$$${show[0]} : ${show[1]} = ${show[2]} : ${show[3]}$$`,
            answer: intAns(vals[pos]),
            steps: [`외항의 곱과 내항의 곱은 같아요.`, `${pos === 0 || pos === 3 ? '내항의 곱' : '외항의 곱'}: $${known}$ → $${other} \\times \\square = ${known}$`, `$\\square = ${known} \\div ${other} = ${vals[pos]}$`],
          };
        },
      },
      {
        id: 'word-prop',
        title: '비례식 활용',
        gen(r, level) {
          const k = level === 1 ? 0 : level === 2 ? r.int(1, 2) : r.int(3, 4);
          if (k === 0) {
            const a = r.int(2, 5);
            let b = r.int(3, 9);
            while (gcd(a, b) !== 1) b++; // 4 : 4 처럼 간단히 할 수 있는 비는 피함
            const m = r.int(2, 8);
            return {
              q: `밀가루와 설탕을 $${a} : ${b}$ 의 비로 섞어 반죽을 만들려고 합니다. 밀가루를 $${a * m}$ 컵 넣는다면 설탕은 몇 컵 넣어야 하나요?`,
              answer: intAns(b * m, '컵'),
              steps: [`$${a} : ${b} = ${a * m} : \\square$`, `$${a} \\times \\square = ${b} \\times ${a * m}$ → $\\square = ${b * m}$`],
            };
          }
          if (k === 1) {
            const scale = r.pick([10000, 20000, 25000, 50000]);
            const cm = r.int(2, 12);
            const realM = (cm * scale) / 100;
            return {
              q: `실제 거리를 $\\frac{1}{${comma(scale)}}$ 로 줄여 그린 지도에서 두 지점 사이의 거리가 $${cm}$ cm 입니다. 실제 거리는 몇 m 인가요?`,
              answer: intAns(realM, 'm'),
              steps: [`$1 : ${comma(scale)} = ${cm} : \\square$ → $\\square = ${comma(cm * scale)}$ (cm)`, `$${comma(cm * scale)}$ cm $= ${comma(realM)}$ m`],
            };
          }
          if (k === 2) {
            // 실제 빠르기에 맞게: 자동차가 1시간에 40~90 km
            const t = r.int(2, 5),
              d = r.pick([40, 50, 60, 70, 80, 90]) * t;
            let t2 = r.int(3, 9);
            if (t2 === t) t2 += 1;
            return {
              q: `일정한 빠르기로 $${t}$ 시간 동안 $${d}$ km 를 가는 자동차가 있습니다. 같은 빠르기로 $${t2}$ 시간 동안 가는 거리는 몇 km 인가요?`,
              answer: intAns((d / t) * t2, 'km'),
              steps: [`$${t} : ${d} = ${t2} : \\square$`, `$${t} \\times \\square = ${d} \\times ${t2}$ → $\\square = ${(d / t) * t2}$`],
            };
          }
          if (k === 3) {
            const a = r.int(2, 7),
              b = r.int(2, 7) + 1;
            const m = r.int(3, 12);
            const price = r.pick([500, 700, 800, 1200, 1500]);
            return {
              q: `연필 $${a}$ 자루의 값이 $${comma(price * a)}$ 원입니다. 같은 연필 $${a * m + b}$ 자루의 값은 얼마인가요?`,
              answer: intAns(price * (a * m + b), '원'),
              steps: [`$${a} : ${comma(price * a)} = ${a * m + b} : \\square$`, `$${a} \\times \\square = ${comma(price * a)} \\times ${a * m + b}$`, `$\\square = ${comma(price * (a * m + b))}$ (원)`],
            };
          }
          // 톱니바퀴: 맞물린 톱니 수 × 회전수 같음
          const t1 = r.pick([12, 15, 20, 30]),
            t2 = r.pick([16, 18, 24, 36, 40, 45]);
          const g = lcm(t1, t2);
          const rot1 = (g / t1) * r.int(1, 3);
          const rot2 = (rot1 * t1) / t2;
          return {
            q: `톱니가 $${t1}$ 개인 톱니바퀴 ㉮와 톱니가 $${t2}$ 개인 톱니바퀴 ㉯가 맞물려 돌고 있습니다. ㉮가 $${rot1}$ 바퀴 도는 동안 ㉯는 몇 바퀴 도나요?`,
            answer: intAns(rot2, '바퀴'),
            steps: ['맞물린 톱니의 수는 같아요: (톱니 수) $\\times$ (회전수)가 같음', `$${t1} \\times ${rot1} = ${t2} \\times \\square$ → $\\square = ${t1 * rot1} \\div ${t2} = ${rot2}$`],
            hint: '외항의 곱 = 내항의 곱 성질과 같은 원리예요.',
          };
        },
      },
      {
        id: 'distribute',
        title: '비례배분',
        gen(r, level) {
          let a = r.int(1, 7),
            b = r.int(1, 7);
          while (a === b || gcd(a, b) !== 1) {
            a = r.int(1, 7);
            b = r.int(1, 7);
          }
          const m = r.int(2, level === 1 ? 8 : 30);
          const tot = (a + b) * m;
          const [n1, n2] = pickNames(r, 2);
          if (level === 3) {
            const c = r.int(1, 5);
            const T = (a + b + c) * m;
            return {
              q: `사탕 $${T}$ 개를 ${n1}, ${n2}, 동생에게 $${a} : ${b} : ${c}$ 의 비로 나누어 주려고 합니다. ${n2}${jo(n2, '은/는')} 몇 개를 받게 되나요?`,
              answer: intAns(b * m, '개'),
              steps: [`전체를 $${a} + ${b} + ${c} = ${a + b + c}$ ${jo(String(a + b + c), '과/와') === '과' && !'178'.includes(String(a + b + c).slice(-1)) ? '으로' : '로'} 나누면 한 몫이 $${T} \\div ${a + b + c} = ${m}$`, `${n2}: $${T} \\times \\frac{${b}}{${a + b + c}} = ${b * m}$ (개)`],
            };
          }
          const item = r.pick([
            ['색종이', '장'],
            ['구슬', '개'],
            ['용돈', '원'],
          ]);
          const unit = item[1] === '원' ? 100 : 1;
          return {
            q: `${item[0]} $${comma(tot * unit)}$ ${item[1]}${item[1] === '개' ? '를' : '을'} ${n1}와 ${n2}가 $${a} : ${b}$ 의 비로 나누어 가지려고 합니다. 두 사람은 각각 얼마씩 가지게 되나요?`.replace(`${n1}와`, `${n1}${jo(n1, '과/와')}`).replace(`${n2}가`, `${n2}${jo(n2, '이/가')}`),
            answer: {
              type: 'fields',
              fields: [
                { label: n1, value: a * m * unit, unit: item[1] },
                { label: n2, value: b * m * unit, unit: item[1] },
              ],
            },
            steps: [`${n1}: $${comma(tot * unit)} \\times \\frac{${a}}{${a} + ${b}} = ${comma(a * m * unit)}$`, `${n2}: $${comma(tot * unit)} \\times \\frac{${b}}{${a} + ${b}} = ${comma(b * m * unit)}$`],
          };
        },
      },
    ],
  },

  // ═════════════ 6-2-5 원의 넓이 ═════════════
  'e6b-5': {
    concepts: [
      {
        title: '원주와 원주율',
        body: '원의 둘레를 **원주**라고 해요. 원의 크기와 관계없이 (원주) $\\div$ (지름)의 값은 항상 일정한데, 이 값을 **원주율**이라고 해요.\n$$(\\text{원주율}) = (\\text{원주}) \\div (\\text{지름}) = 3.1415926\\ldots$$\n필요에 따라 $3$, $3.1$, $3.14$ 등으로 어림해서 사용해요.',
      },
      {
        title: '원주 구하기',
        body: '$$(\\text{원주}) = (\\text{지름}) \\times (\\text{원주율}) = (\\text{반지름}) \\times 2 \\times (\\text{원주율})$$\n- 원주를 알면 지름 $=$ 원주 $\\div$ 원주율 로 거꾸로 구할 수 있어요.',
        example: { q: '지름 $10$ cm 인 원의 원주 (원주율 $3.14$)', a: '$10 \\times 3.14 = 31.4$ (cm)' },
      },
      {
        title: '원의 넓이',
        body: '원을 잘게 잘라 붙이면 가로가 원주의 $\\frac{1}{2}$, 세로가 반지름인 직사각형에 가까워져요.\n$$(\\text{원의 넓이}) = (\\text{반지름}) \\times (\\text{반지름}) \\times (\\text{원주율})$$',
      },
      {
        title: '여러 가지 원의 넓이',
        body: '색칠한 부분의 넓이는 큰 도형의 넓이에서 빈 부분의 넓이를 빼거나, 여러 부분을 더해서 구해요.\n- 반원: 원의 넓이의 $\\frac{1}{2}$\n- 고리 모양: (큰 원) $-$ (작은 원)\n5학년에서 배운 다각형의 넓이와 함께 써요.',
      },
    ],
    skills: [
      {
        id: 'circumference',
        title: '원주 구하기',
        gen(r, level) {
          const pi = pickPi(r, level);
          const rad = r.int(2, level === 1 ? 10 : 20);
          const useD = r.chance(0.5);
          const C = round(2 * rad * pi, 8);
          if (level === 3) {
            // 반원의 둘레
            return {
              q: `지름이 $${2 * rad}$ cm 인 반원의 둘레는 몇 cm 인가요? ${piText(pi)}`,
              fig: (() => {
                const s = new Svg(200, 120);
                s.arc(100, 100, 80, 0, 180, { cls: 'acc', sector: true });
                s.line(20, 100, 180, 100, { cls: 'acc' });
                s.text(100, 114, `${2 * rad} cm`, { size: 12 });
                return s.toString();
              })(),
              answer: decAns(round(C / 2 + 2 * rad, 8), 'cm'),
              steps: [`곡선 부분: $${2 * rad} \\times ${pi} \\div 2 = ${dt(round(C / 2, 8))}$ (cm)`, `지름 부분을 더해요: $${dt(round(C / 2, 8))} + ${2 * rad} = ${dt(round(C / 2 + 2 * rad, 8))}$ (cm)`],
              hint: '반원의 둘레에는 곡선 부분과 지름이 모두 들어가요.',
            };
          }
          return {
            q: `원주는 몇 cm 인가요? ${piText(pi)}`,
            fig: useD ? circleFig({ dLabel: `${2 * rad} cm` }) : circleFig({ rLabel: `${rad} cm` }),
            answer: decAns(C, 'cm'),
            steps: [useD ? `(원주) $=$ (지름) $\\times$ (원주율)` : `지름: $${rad} \\times 2 = ${2 * rad}$ (cm)`, `$${2 * rad} \\times ${pi} = ${dt(C)}$ (cm)`],
          };
        },
      },
      {
        id: 'reverse-c',
        title: '원주로 지름·반지름 구하기',
        gen(r, level) {
          const pi = pickPi(r, level);
          const rad = r.int(2, 25);
          const C = round(2 * rad * pi, 8);
          if (level === 3) {
            // 굴렁쇠
            const turns = r.int(3, 12);
            const dist = round(C * turns, 8);
            return {
              q: `굴렁쇠를 $${turns}$ 바퀴 굴렸더니 $${dt(dist)}$ cm 를 갔습니다. 굴렁쇠의 지름은 몇 cm 인가요? ${piText(pi)}`,
              answer: intAns(2 * rad, 'cm'),
              steps: [`한 바퀴 거리(원주): $${dt(dist)} \\div ${turns} = ${dt(C)}$ (cm)`, `지름: $${dt(C)} \\div ${pi} = ${2 * rad}$ (cm)`],
            };
          }
          const askR = level === 2;
          return {
            q: `원주가 $${dt(C)}$ cm 인 원의 ${askR ? '반지름' : '지름'}은 몇 cm 인가요? ${piText(pi)}`,
            answer: intAns(askR ? rad : 2 * rad, 'cm'),
            steps: [`지름 $=$ 원주 $\\div$ 원주율 $= ${dt(C)} \\div ${pi} = ${2 * rad}$ (cm)`, ...(askR ? [`반지름: $${2 * rad} \\div 2 = ${rad}$ (cm)`] : [])],
          };
        },
      },
      {
        id: 'area',
        title: '원의 넓이',
        gen(r, level) {
          const pi = pickPi(r, level);
          const rad = r.int(2, level === 1 ? 10 : 15);
          const A = round(rad * rad * pi, 8);
          if (level === 3) {
            const C = round(2 * rad * pi, 8);
            return {
              q: `원주가 $${dt(C)}$ cm 인 원의 넓이는 몇 cm² 인가요? ${piText(pi)}`,
              answer: decAns(A, 'cm²'),
              steps: [`지름: $${dt(C)} \\div ${pi} = ${2 * rad}$ → 반지름 $${rad}$ cm`, `넓이: $${rad} \\times ${rad} \\times ${pi} = ${dt(A)}$ (cm²)`],
            };
          }
          const useD = level === 2;
          return {
            q: `원의 넓이는 몇 cm² 인가요? ${piText(pi)}`,
            fig: useD ? circleFig({ dLabel: `${2 * rad} cm` }) : circleFig({ rLabel: `${rad} cm` }),
            answer: decAns(A, 'cm²'),
            steps: [useD ? `반지름: $${2 * rad} \\div 2 = ${rad}$ (cm)` : '(반지름) $\\times$ (반지름) $\\times$ (원주율)', `$${rad} \\times ${rad} \\times ${pi} = ${dt(A)}$ (cm²)`],
            hint: useD ? '지름이 아니라 반지름을 두 번 곱해요.' : undefined,
          };
        },
      },
      {
        id: 'shaded',
        title: '색칠한 부분의 넓이',
        gen(r, level) {
          const pi = level === 1 ? 3 : 3.14;
          const k = level === 1 ? r.int(0, 1) : level === 2 ? r.int(1, 2) : r.int(2, 3);
          const s = new Svg(200, 200);
          if (k === 0) {
            // 반원
            const rad = r.int(2, 10) * 2;
            s.arc(100, 130, 80, 0, 180, { cls: 'acc', sector: true });
            s.line(20, 130, 180, 130, { cls: 'acc' });
            s.text(100, 146, `${2 * rad} cm`, { size: 12 });
            const A = round((rad * rad * pi) / 2, 8);
            return {
              q: `색칠한 반원의 넓이는 몇 cm² 인가요? ${piText(pi)}`,
              fig: s.toString(),
              answer: decAns(A, 'cm²'),
              steps: [`반지름: $${rad}$ cm`, `$${rad} \\times ${rad} \\times ${pi} \\div 2 = ${dt(A)}$ (cm²)`],
            };
          }
          if (k === 1) {
            // 고리
            const R = r.int(4, 12),
              rr = r.int(2, R - 1);
            s.circle(100, 100, 80, { cls: 'acc', fill: true });
            s.circle(100, 100, (80 * rr) / R, { cls: 'acc bgfill' });
            s.dot(100, 100, { r: 2.5 });
            s.line(100, 100, 100 + 80 * Math.cos(-0.6), 100 + 80 * Math.sin(-0.6), { cls: 'acc2' });
            s.text(100 + 70 * Math.cos(-0.6) + 10, 100 + 70 * Math.sin(-0.6) - 4, `${R} cm`, { size: 12, anchor: 'start' });
            s.line(100, 100, 100 - (80 * rr) / R, 100, { cls: 'acc2' });
            s.text(100 - (40 * rr) / R, 92, `${rr} cm`, { size: 12 });
            const A = round((R * R - rr * rr) * pi, 8);
            return {
              q: `색칠한 부분의 넓이는 몇 cm² 인가요? ${piText(pi)}`,
              fig: s.toString(),
              answer: decAns(A, 'cm²'),
              steps: [`큰 원: $${R} \\times ${R} \\times ${pi} = ${dt(round(R * R * pi, 8))}$`, `작은 원: $${rr} \\times ${rr} \\times ${pi} = ${dt(round(rr * rr * pi, 8))}$`, `$${dt(round(R * R * pi, 8))} - ${dt(round(rr * rr * pi, 8))} = ${dt(A)}$ (cm²)`],
            };
          }
          if (k === 2) {
            // 정사각형 안의 원 (빈 부분)
            const a = r.int(2, 10) * 2;
            s.rect(20, 20, 160, 160, { cls: 'acc', fill: true });
            s.circle(100, 100, 80, { cls: 'acc bgfill' });
            s.text(100, 194, `${a} cm`, { size: 12 });
            const A = round(a * a - (a / 2) * (a / 2) * pi, 8);
            return {
              q: `정사각형 안에 꼭 맞는 원을 그렸습니다. 색칠한 부분의 넓이는 몇 cm² 인가요? ${piText(pi)}`,
              fig: s.toString(),
              answer: decAns(A, 'cm²'),
              steps: [`정사각형: $${a} \\times ${a} = ${a * a}$`, `원 (반지름 $${a / 2}$): $${a / 2} \\times ${a / 2} \\times ${pi} = ${dt(round((a / 2) ** 2 * pi, 8))}$`, `$${a * a} - ${dt(round((a / 2) ** 2 * pi, 8))} = ${dt(A)}$ (cm²)`],
            };
          }
          // 원 안의 정사각형(마름모) — 원 넓이 - 정사각형 넓이
          const rad = r.int(2, 10);
          s.circle(100, 100, 80, { cls: 'acc', fill: true });
          s.poly(
            [
              [100, 20],
              [180, 100],
              [100, 180],
              [20, 100],
            ],
            { cls: 'acc bgfill' },
          );
          s.line(20, 100, 180, 100, { dash: true, cls: 'acc2' });
          s.line(100, 20, 100, 180, { dash: true, cls: 'acc2' });
          s.dot(100, 100, { r: 2.5 });
          s.text(140, 92, `${rad} cm`, { size: 12 });
          const A = round(rad * rad * pi - 2 * rad * rad, 8);
          return {
            q: `원 안에 꼭짓점이 원 위에 있는 정사각형을 그렸습니다. 색칠한 부분의 넓이는 몇 cm² 인가요? ${piText(pi)}`,
            fig: s.toString(),
            answer: decAns(A, 'cm²'),
            steps: [`원: $${rad} \\times ${rad} \\times ${pi} = ${dt(round(rad * rad * pi, 8))}$`, `정사각형(마름모): 대각선 $${2 * rad}$ cm → $${2 * rad} \\times ${2 * rad} \\div 2 = ${2 * rad * rad}$`, `$${dt(round(rad * rad * pi, 8))} - ${2 * rad * rad} = ${dt(A)}$ (cm²)`],
          };
        },
      },
      {
        id: 'pi-ratio',
        title: '원주율과 원의 크기 비교',
        gen(r, level) {
          if (level === 1) {
            const d = r.int(2, 30);
            const C = round(d * 3.14, 8);
            return {
              q: `지름이 $${d}$ cm 인 원의 원주가 $${dt(C)}$ cm 입니다. (원주) $\\div$ (지름) 을 계산하세요.`,
              answer: decAns(3.14),
              steps: [`$${dt(C)} \\div ${d} = 3.14$`, '이 값이 원주율이에요. 원의 크기와 관계없이 일정해요.'],
            };
          }
          const pi = 3.14;
          const a = r.int(2, 9),
            k = r.int(2, 4);
          if (level === 2) {
            return {
              q: `반지름이 $${a}$ cm 인 원과 반지름이 $${a * k}$ cm 인 원이 있습니다. 큰 원의 원주는 작은 원의 원주의 몇 배인가요?`,
              answer: intAns(k, '배'),
              steps: [`원주는 지름(반지름)에 비례해요.`, `$${a * k} \\div ${a} = ${k}$ (배)`],
            };
          }
          return {
            q: `반지름이 $${a}$ cm 인 원과 반지름이 $${a * k}$ cm 인 원이 있습니다. 큰 원의 넓이는 작은 원의 넓이의 몇 배인가요?`,
            answer: numChoices(r, k * k, [k, 2 * k, k * k * 2, k + 1], 5),
            steps: [`작은 원: $${a} \\times ${a} \\times ${pi}$, 큰 원: $${a * k} \\times ${a * k} \\times ${pi}$`, `반지름이 $${k}$ 배이면 넓이는 $${k} \\times ${k} = ${k * k}$ (배)`],
          };
        },
      },
    ],
  },

  // ═════════════ 6-2-6 원기둥, 원뿔, 구 ═════════════
  'e6b-6': {
    concepts: [
      {
        title: '원기둥',
        body: '두 면이 서로 **평행하고 합동인 원**이고, 옆면이 굽은 면인 입체도형을 원기둥이라고 해요.\n- 평행한 두 면: **밑면**, 굽은 면: **옆면**, 두 밑면 사이의 거리: **높이**\n- 각기둥과 달리 꼭짓점과 모서리가 없어요.',
      },
      {
        title: '원기둥의 전개도',
        body: '밑면 $2$ 개(원)와 옆면 $1$ 개(직사각형)로 이루어져요.\n- 옆면의 **가로 $=$ 밑면의 둘레** $=$ (지름) $\\times$ (원주율)\n- 옆면의 **세로 $=$ 원기둥의 높이**',
      },
      {
        title: '원뿔',
        body: '평평한 면이 원이고 옆면이 굽은 뿔 모양의 입체도형이에요.\n- 뾰족한 점: **원뿔의 꼭짓점**, 꼭짓점과 밑면의 원 둘레의 한 점을 이은 선분: **모선**\n- 꼭짓점에서 밑면에 수직인 선분의 길이: **높이**\n- 모선은 무수히 많고 길이가 모두 같아요. 모선이 높이보다 길어요.',
      },
      {
        title: '구',
        body: '공 모양의 입체도형을 구라고 해요.\n- 가장 안쪽의 점: **구의 중심**, 중심에서 겉면의 한 점을 이은 선분: **구의 반지름**\n- 어느 방향에서 보아도 모양이 원이에요.',
      },
      {
        title: '돌려서 만든 입체도형',
        body: '평면도형을 한 직선을 축으로 한 바퀴 돌리면\n- 직사각형 → **원기둥**\n- 직각삼각형 → **원뿔**\n- 반원 → **구**',
      },
    ],
    skills: [
      {
        id: 'cyl-net',
        title: '원기둥의 전개도',
        gen(r, level) {
          const pi = pickPi(r, level);
          const rad = r.int(2, 10),
            h = r.int(3, 15);
          const C = round(2 * rad * pi, 8);
          const fig = cylinderFig({ rLabel: `${rad} cm`, hLabel: `${h} cm` });
          if (level === 1) {
            return {
              q: `원기둥의 전개도를 그렸을 때, 옆면의 가로는 몇 cm 인가요? ${piText(pi)}`,
              fig,
              answer: decAns(C, 'cm'),
              steps: ['옆면의 가로 $=$ 밑면의 둘레', `$${rad} \\times 2 \\times ${pi} = ${dt(C)}$ (cm)`],
            };
          }
          if (level === 2) {
            return {
              q: `원기둥의 전개도를 그렸을 때, 옆면의 넓이는 몇 cm² 인가요? ${piText(pi)}`,
              fig,
              answer: decAns(round(C * h, 8), 'cm²'),
              steps: [`옆면의 가로: $${rad} \\times 2 \\times ${pi} = ${dt(C)}$ (cm), 세로: $${h}$ cm`, `넓이: $${dt(C)} \\times ${h} = ${dt(round(C * h, 8))}$ (cm²)`],
            };
          }
          const P = round(2 * (C + h), 8);
          return {
            q: `원기둥의 전개도에서 옆면의 둘레가 $${dt(P)}$ cm 이고 원기둥의 높이가 $${h}$ cm 입니다. 밑면의 반지름은 몇 cm 인가요? ${piText(pi)}`,
            answer: intAns(rad, 'cm'),
            steps: [`옆면(직사각형)의 가로: $${dt(P)} \\div 2 - ${h} = ${dt(C)}$ (cm)`, `가로 $=$ 밑면의 둘레이므로 지름 $= ${dt(C)} \\div ${pi} = ${2 * rad}$`, `반지름: $${rad}$ cm`],
          };
        },
      },
      {
        id: 'cone-parts',
        title: '원뿔의 구성 요소',
        gen(r, level) {
          const t = r.pick([
            [3, 4, 5],
            [6, 8, 10],
            [5, 12, 13],
            [9, 12, 15],
            [8, 15, 17],
            [12, 16, 20],
          ]);
          const [rad, h, l] = t;
          if (level === 1) {
            const ask = r.int(0, 2);
            const names = ['모선의 길이', '높이', '밑면의 반지름'];
            const vals = [l, h, rad];
            return {
              q: `원뿔에서 ${names[ask]}는 몇 cm 인가요?`,
              fig: coneFig({ rLabel: `${rad} cm`, hLabel: `${h} cm`, lLabel: `${l} cm` }),
              answer: intAns(vals[ask], 'cm'),
              steps: ['꼭짓점에서 밑면에 수직인 선분이 높이, 꼭짓점과 밑면 둘레의 한 점을 이은 선분이 모선이에요.', `${names[ask]}: $${vals[ask]}$ cm`],
            };
          }
          if (level === 2) {
            return {
              q: '원뿔을 앞에서 본 모양은 삼각형입니다. 이 삼각형의 둘레는 몇 cm 인가요?',
              fig: coneFig({ rLabel: `${rad} cm`, hLabel: `${h} cm`, lLabel: `${l} cm` }),
              answer: intAns(2 * l + 2 * rad, 'cm'),
              steps: [`앞에서 본 모양: 두 변이 모선($${l}$ cm), 밑변이 지름($${2 * rad}$ cm)인 이등변삼각형`, `$${l} + ${l} + ${2 * rad} = ${2 * l + 2 * rad}$ (cm)`],
            };
          }
          return {
            q: `밑면의 지름이 $${2 * rad}$ cm, 높이가 $${h}$ cm, 모선의 길이가 $${l}$ cm 인 원뿔을 앞에서 본 모양의 넓이는 몇 cm² 인가요?`,
            fig: coneFig({ dLabel: `${2 * rad} cm`, hLabel: `${h} cm`, lLabel: `${l} cm` }),
            answer: intAns(rad * h, 'cm²'),
            steps: [`앞에서 본 모양: 밑변 $${2 * rad}$ cm, 높이 $${h}$ cm 인 삼각형`, `$${2 * rad} \\times ${h} \\div 2 = ${rad * h}$ (cm²)`],
            hint: '모선은 삼각형의 높이가 아니에요.',
          };
        },
      },
      {
        id: 'rotate',
        title: '돌려서 만든 입체도형',
        gen(r, level) {
          const a = r.int(2, 9),
            b = r.int(3, 12);
          const kind = level === 1 ? r.int(0, 2) : r.int(0, 1);
          if (level === 1) {
            const shapes = ['직사각형', '직각삼각형', '반원'];
            const res = ['원기둥', '원뿔', '구'];
            return {
              q: `${shapes[kind]} 모양의 종이를 ${kind === 2 ? '지름' : kind === 1 ? '직각을 낀 한 변' : '한 변'}을 축으로 하여 한 바퀴 돌리면 어떤 입체도형이 되나요?`,
              answer: makeChoices(r, res[kind], ['원기둥', '원뿔', '구', '각기둥', '각뿔'], 5),
              steps: [`${shapes[kind]} → ${res[kind]}`],
            };
          }
          const pts: P[] =
            kind === 0
              ? [
                  [0, 0],
                  [a, 0],
                  [a, b],
                  [0, b],
                ]
              : [
                  [0, 0],
                  [a, 0],
                  [0, b],
                ];
          const fig = shapeFig(pts, { sides: [`${a} cm`, kind === 0 ? `${b} cm` : null, null, kind === 0 ? null : undefined], extraLines: [{ a: [0, -1], b: [0, b + 1], dash: true, cls: 'acc2' }], rightAt: [0], W: 200, H: 180, })
          const solid = kind === 0 ? '원기둥' : '원뿔';
          if (level === 2) {
            return {
              q: `${kind === 0 ? '직사각형' : '직각삼각형'}을 점선을 축으로 하여 한 바퀴 돌려 ${solid}을 만들었습니다. 만든 ${solid}의 밑면의 지름은 몇 cm 인가요? ${kind === 1 ? `(높이는 $${b}$ cm 입니다.)` : ''}`,
              fig,
              answer: intAns(2 * a, 'cm'),
              steps: [`축에 수직인 변 $${a}$ cm 가 밑면의 반지름이 돼요.`, `지름: $${a} \\times 2 = ${2 * a}$ (cm)`],
            };
          }
          const area = kind === 0 ? 2 * a * b : a * b;
          return {
            q: `${kind === 0 ? '직사각형' : '직각삼각형'}을 점선을 축으로 하여 한 바퀴 돌려 만든 ${solid}을 앞에서 본 모양의 넓이는 몇 cm² 인가요? ${kind === 1 ? `(삼각형의 높이는 $${b}$ cm 입니다.)` : ''}`,
            fig,
            answer: intAns(area, 'cm²'),
            steps: [kind === 0 ? `앞에서 본 모양: 가로 $${2 * a}$ cm, 세로 $${b}$ cm 인 직사각형` : `앞에서 본 모양: 밑변 $${2 * a}$ cm, 높이 $${b}$ cm 인 이등변삼각형`, kind === 0 ? `$${2 * a} \\times ${b} = ${area}$ (cm²)` : `$${2 * a} \\times ${b} \\div 2 = ${area}$ (cm²)`],
          };
        },
      },
      {
        id: 'sphere',
        title: '구',
        gen(r, level) {
          const rad = r.int(2, 15);
          if (level === 1) {
            const askD = r.chance(0.5);
            return {
              q: `구의 ${askD ? '지름' : '반지름'}은 몇 cm 인가요?`,
              fig: askD ? sphereFig({ rLabel: `${rad} cm` }) : sphereFig({ dLabel: `${2 * rad} cm` }),
              answer: intAns(askD ? 2 * rad : rad, 'cm'),
              steps: [askD ? `지름 $=$ 반지름 $\\times 2 = ${2 * rad}$ (cm)` : `반지름 $=$ 지름 $\\div 2 = ${rad}$ (cm)`],
            };
          }
          if (level === 2) {
            return {
              q: `지름이 $${2 * rad}$ cm 인 반원을 지름을 축으로 하여 한 바퀴 돌려 만든 입체도형의 반지름은 몇 cm 인가요?`,
              answer: intAns(rad, 'cm'),
              steps: ['반원을 지름을 축으로 돌리면 구가 돼요.', `구의 반지름 $=$ 반원의 반지름 $= ${rad}$ cm`],
            };
          }
          const pi = 3.14;
          return {
            q: `반지름이 $${rad}$ cm 인 구를 앞에서 본 모양의 넓이는 몇 cm² 인가요? ${piText(pi)}`,
            fig: sphereFig({ rLabel: `${rad} cm` }),
            answer: decAns(round(rad * rad * pi, 8), 'cm²'),
            steps: [`구를 어느 방향에서 보아도 반지름 $${rad}$ cm 인 원이에요.`, `$${rad} \\times ${rad} \\times ${pi} = ${dt(round(rad * rad * pi, 8))}$ (cm²)`],
          };
        },
      },
      {
        id: 'compare',
        title: '입체도형 비교하기',
        gen(r, level) {
          const T = [
            '원기둥의 두 밑면은 서로 평행하고 합동입니다.',
            '원뿔의 꼭짓점은 $1$ 개입니다.',
            '구는 어느 방향에서 보아도 원 모양입니다.',
            '원기둥의 전개도에서 옆면은 직사각형입니다.',
            '원뿔의 모선은 무수히 많습니다.',
            '원기둥, 원뿔, 구는 모두 굽은 면이 있습니다.',
            '원뿔을 앞에서 본 모양은 삼각형입니다.',
          ];
          const Fs = [
            '원기둥은 꼭짓점이 $2$ 개 있습니다.',
            '원뿔의 밑면은 $2$ 개입니다.',
            '구에는 꼭짓점이 $1$ 개 있습니다.',
            '원뿔의 모선의 길이는 높이보다 짧습니다.',
            '원기둥을 위에서 본 모양은 직사각형입니다.',
            '원기둥의 옆면은 평평한 면입니다.',
            '각기둥과 원기둥은 모두 모서리가 있습니다.',
          ];
          const askTrue = level !== 2;
          const right = r.pick(askTrue ? T : Fs);
          const wr = r.sample(askTrue ? Fs : T, level === 1 ? 3 : 4);
          return {
            q: askTrue ? '원기둥, 원뿔, 구에 대한 설명으로 **옳은** 것은?' : '원기둥, 원뿔, 구에 대한 설명으로 **옳지 않은** 것은?',
            answer: makeChoices(r, right, wr, level === 1 ? 4 : 5),
            steps: [`${askTrue ? '옳은' : '옳지 않은'} 설명: ${right}`, '원기둥: 밑면 $2$ 개, 꼭짓점 없음 / 원뿔: 밑면 $1$ 개, 꼭짓점 $1$ 개 / 구: 밑면·꼭짓점 없음'],
          };
        },
      },
    ],
  },
};

function places2(x: number): number {
  const s = String(round(x, 8));
  return (s.split('.')[1] ?? '').length;
}
const p10 = (k: number) => 10 ** k;

// 문장제 추가 유형 (words6.ts) — 기존 유형 뒤에 덧붙임 (기존 id·순서 유지)
for (const [u, sks] of Object.entries(WORD6)) content[u]?.skills.push(...sks);

// 심화 유형(hard6.ts) — skills 맨 뒤에 덧붙이고, 최상위 유형은 top 에 넣음 (기존 id·순서 유지)
attachHard(content, HARD6);
