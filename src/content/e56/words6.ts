// 초6 문장제 추가 유형 (단원별로 기존 skills 뒤에 덧붙임)
import type { Skill, Level } from '../../core/types';
import type { Rng } from '../../core/rng';
import { F } from '../../core/frac';
import { round } from '../../core/nt';
import { comma } from '../../core/tex';
import { pickName, josa, jo, fracAns, intAns, decAns, ft, mt, properFrac, dt, mkDec } from './util';
import { cuboidFig, pieFig, prismFig, cylinderFig, circleFig } from './fig56';

const POLY: Record<number, string> = { 3: '삼각', 4: '사각', 5: '오각', 6: '육각', 7: '칠각', 8: '팔각', 9: '구각', 10: '십각' };
const won = (x: number) => `$${comma(x)}$ 원`;
/** 진분수 또는 대분수 (자연수 부분 0~k) */
const mixedFrac = (r: Rng, dmax: number, k: number) => properFrac(r, 2, dmax).add(r.int(0, k));

// ═════════ 6-1-1 분수의 나눗셈 ═════════
const e6a1Two: Skill = {
  id: 'word-two',
  title: '분수의 나눗셈 두 단계 문장제',
  gen(r, level) {
    const nm = pickName(r);
    const t = r.int(0, 1);
    if (level === 1) {
      const f = properFrac(r, 2, 9),
        m = r.int(2, 6),
        n = r.int(2, 5);
      const tot = f.mul(m),
        res = tot.div(n);
      const it = r.pick(['설탕', '밀가루', '쌀', '콩']);
      return {
        q: `${it}${jo(it, '이/가')} 한 봉지에 $${ft(f)}$ kg 씩 $${m}$ 봉지 있습니다. 이 ${josa(it, '을/를')} $${n}$ 명이 똑같이 나누어 가지면 한 명이 몇 kg 씩 가지게 되는지 기약분수로 나타내세요.`,
        answer: fracAns(res, { unit: 'kg' }),
        steps: [`식: $${ft(f)} \\times ${m} \\div ${n}$`, `전체: $${ft(f)} \\times ${m} = ${mt(tot)}$ (kg)`, `$${ft(tot)} \\div ${n} = ${ft(tot)} \\times \\frac{1}{${n}} = ${mt(res)}$ (kg)`],
      };
    }
    if (level === 2 && t === 0) {
      const per = properFrac(r, 2, 5).add(r.int(0, 1)),
        n = r.int(3, 8),
        bx = properFrac(r, 2, 5);
      const W = per.mul(n).add(bx);
      const it = r.pick(['멜론', '배', '파인애플', '통조림']);
      return {
        q: `무게가 같은 ${it} $${n}$ 개가 들어 있는 상자의 무게가 $${mt(W)}$ kg 입니다. 빈 상자의 무게가 $${ft(bx)}$ kg 이라면 ${it} 한 개의 무게는 몇 kg 인지 기약분수로 나타내세요.`,
        answer: fracAns(per, { unit: 'kg' }),
        steps: [`${it} $${n}$ 개의 무게: $${mt(W)} - ${ft(bx)} = ${mt(W.sub(bx))}$ (kg)`, `한 개: $${ft(W.sub(bx))} \\div ${n} = ${mt(per)}$ (kg)`],
      };
    }
    if (level === 2) {
      const L = mixedFrac(r, 8, 4).add(1),
        n = r.int(3, 8),
        k = r.int(2, n - 1);
      const res = L.div(n).mul(k);
      const it = r.pick(['끈', '리본', '철사']);
      return {
        q: `길이가 $${mt(L)}$ m 인 ${it}${jo(it, '을/를')} 똑같이 $${n}$ 도막으로 잘랐습니다. 그중 $${k}$ 도막의 길이는 몇 m 인지 기약분수로 나타내세요.`,
        answer: fracAns(res, { unit: 'm' }),
        steps: [`한 도막: $${ft(L)} \\div ${n} = ${mt(L.div(n))}$ (m)`, `$${k}$ 도막: $${ft(L.div(n))} \\times ${k} = ${mt(res)}$ (m)`],
      };
    }
    if (t === 0) {
      const x = mixedFrac(r, 9, 3),
        n = r.int(2, 6);
      const X = x.mul(n),
        res = x.div(n);
      return {
        q: `어떤 수를 $${n}$ 으로 나누어야 할 것을 잘못하여 $${n}$ 을 곱했더니 $${mt(X)}$ 가 되었습니다. 바르게 계산한 값을 기약분수로 나타내세요.`,
        answer: fracAns(res),
        steps: [`어떤 수: $${mt(X)} \\div ${n} = ${mt(x)}$`, `바른 계산: $${mt(x)} \\div ${n} = ${mt(res)}$`],
        hint: '잘못 계산한 식을 거꾸로 하여 어떤 수부터 구해요.',
      };
    }
    const k = r.int(2, 5),
      L = mixedFrac(r, 7, 3).add(1);
    const side = L.div(k).div(3);
    return {
      q: `${josa(nm, '은/는')} 길이가 $${mt(L)}$ m 인 철사를 겹치지 않게 모두 사용하여 크기가 같은 정삼각형 $${k}$ 개를 만들었습니다. 정삼각형의 한 변의 길이는 몇 m 인지 기약분수로 나타내세요.`,
      answer: fracAns(side, { unit: 'm' }),
      steps: [`정삼각형 한 개의 둘레: $${ft(L)} \\div ${k} = ${mt(L.div(k))}$ (m)`, `한 변: $${ft(L.div(k))} \\div 3 = ${mt(side)}$ (m)`],
    };
  },
};

// ═════════ 6-1-2 각기둥과 각뿔 ═════════
const e6a2Straw: Skill = {
  id: 'word-straw',
  title: '빨대와 찰흙으로 모형 만들기',
  gen(r, level) {
    const n = r.int(3, level === 1 ? 6 : 10);
    const prism = r.chance(0.5);
    const kind = prism ? '각기둥' : '각뿔';
    const full = `${POLY[n]}${prism ? '기둥' : '뿔'}`;
    const E = prism ? 3 * n : 2 * n,
      V = prism ? 2 * n : n + 1;
    const rule = prism ? `$${n}$각기둥: 모서리 $${n} \\times 3 = ${E}$ 개, 꼭짓점 $${n} \\times 2 = ${V}$ 개` : `$${n}$각뿔: 모서리 $${n} \\times 2 = ${E}$ 개, 꼭짓점 $${n} + 1 = ${V}$ 개`;
    const intro = '빨대는 모서리로, 찰흙 공은 꼭짓점으로 사용합니다.';
    if (level === 1 || level === 2) {
      let desc = full;
      const pre: string[] = [];
      if (level === 2) {
        const v = r.int(0, 1);
        if (prism) desc = v === 0 ? `옆면이 $${n}$ 개인 각기둥` : `면이 $${n + 2}$ 개인 각기둥`;
        else desc = v === 0 ? `밑면이 ${POLY[n]}형인 각뿔` : `면이 $${n + 1}$ 개인 각뿔`;
        if (prism) pre.push(v === 0 ? `옆면이 $${n}$ 개 → 밑면은 ${POLY[n]}형, ${POLY[n]}기둥` : `각기둥의 면 수 $=$ (밑면의 변 수) $+ 2$ → ${POLY[n]}기둥`);
        else pre.push(v === 0 ? `밑면이 ${POLY[n]}형 → ${POLY[n]}뿔` : `각뿔의 면 수 $=$ (밑면의 변 수) $+ 1$ → ${POLY[n]}뿔`);
      }
      return {
        q: `빨대와 찰흙 공으로 ${desc} 모형을 하나 만들려고 합니다. ${intro} 빨대와 찰흙 공은 각각 몇 개 필요한가요?`,
        fig: level === 1 ? prismFig(n, { pyramid: !prism }) : undefined,
        answer: { type: 'fields', fields: [{ label: '빨대', value: E, unit: '개' }, { label: '찰흙 공', value: V, unit: '개' }] },
        steps: [...pre, rule.replace(`$${n}$각`, `${POLY[n]}`)],
      };
    }
    if (r.chance(0.5)) {
      return {
        q: `빨대 $${E}$ 개를 모두 사용하여 ${kind} 모형을 하나 만들었습니다. ${intro} 사용한 찰흙 공은 몇 개인가요?`,
        answer: intAns(V, '개'),
        steps: [prism ? `각기둥의 모서리 수 $=$ (밑면의 변 수) $\\times 3$ → $${E} \\div 3 = ${n}$` : `각뿔의 모서리 수 $=$ (밑면의 변 수) $\\times 2$ → $${E} \\div 2 = ${n}$`, `${full}`, `찰흙 공(꼭짓점): $${V}$ 개`],
      };
    }
    return {
      q: `찰흙 공 $${V}$ 개를 모두 사용하여 ${kind} 모형을 하나 만들었습니다. ${intro} 사용한 빨대는 몇 개인가요?`,
      answer: intAns(E, '개'),
      steps: [prism ? `각기둥의 꼭짓점 수 $=$ (밑면의 변 수) $\\times 2$ → $${V} \\div 2 = ${n}$` : `각뿔의 꼭짓점 수 $=$ (밑면의 변 수) $+ 1$ → $${V} - 1 = ${n}$`, `${full}`, `빨대(모서리): $${E}$ 개`],
    };
  },
};

const e6a2Wire: Skill = {
  id: 'word-wire',
  title: '철사로 각기둥·각뿔 만들기',
  gen(r, level) {
    const n = r.int(3, 8);
    const a = r.int(3, 12);
    if (level === 1) {
      const b = r.int(a + 1, a + 10);
      return {
        q: `밑면은 한 변의 길이가 $${a}$ cm 인 정${POLY[n]}형이고, 옆면의 모서리는 모두 $${b}$ cm 인 ${POLY[n]}뿔 모양을 철사로 만들려고 합니다. 필요한 철사는 적어도 몇 cm 인가요?`,
        fig: prismFig(n, { pyramid: true, sideLabel: `${a} cm`, hLabel: `${b} cm` }),
        answer: intAns(n * a + n * b, 'cm'),
        steps: [`밑면의 모서리 $${n}$ 개: $${a} \\times ${n} = ${a * n}$ (cm)`, `옆면의 모서리 $${n}$ 개: $${b} \\times ${n} = ${b * n}$ (cm)`, `$${a * n} + ${b * n} = ${n * (a + b)}$ (cm)`],
      };
    }
    const h = r.int(4, 20);
    const S = 2 * n * a + n * h;
    if (level === 2) {
      return {
        q: `밑면은 한 변의 길이가 $${a}$ cm 인 정${POLY[n]}형이고 높이가 $${h}$ cm 인 ${POLY[n]}기둥 모양을 철사로 만들려고 합니다. 필요한 철사는 적어도 몇 cm 인가요?`,
        fig: prismFig(n, { sideLabel: `${a} cm`, hLabel: `${h} cm` }),
        answer: intAns(S, 'cm'),
        steps: [`밑면 $2$ 개의 모서리: $${a} \\times ${n} \\times 2 = ${2 * n * a}$ (cm)`, `높이 모서리 $${n}$ 개: $${h} \\times ${n} = ${n * h}$ (cm)`, `$${2 * n * a} + ${n * h} = ${S}$ (cm)`],
      };
    }
    if (r.chance(0.5)) {
      const L = Math.ceil((S + 10) / 50) * 50;
      return {
        q: `길이가 $${dt(L / 100)}$ m 인 철사로 밑면은 한 변이 $${a}$ cm 인 정${POLY[n]}형이고 높이가 $${h}$ cm 인 ${POLY[n]}기둥 모양을 하나 만들었습니다. 남은 철사는 몇 cm 인가요?`,
        answer: intAns(L - S, 'cm'),
        steps: [`$${dt(L / 100)}$ m $= ${L}$ cm`, `사용한 철사: $${a} \\times ${n} \\times 2 + ${h} \\times ${n} = ${S}$ (cm)`, `$${L} - ${S} = ${L - S}$ (cm)`],
      };
    }
    return {
      q: `철사 $${S}$ cm 를 겹치지 않게 모두 사용하여 밑면이 한 변 $${a}$ cm 인 정${POLY[n]}형인 ${POLY[n]}기둥 모양을 만들었습니다. 이 각기둥의 높이는 몇 cm 인가요?`,
      answer: intAns(h, 'cm'),
      steps: [`밑면 $2$ 개의 모서리: $${a} \\times ${n} \\times 2 = ${2 * n * a}$ (cm)`, `높이 모서리 $${n}$ 개의 합: $${S} - ${2 * n * a} = ${n * h}$ (cm)`, `높이: $${n * h} \\div ${n} = ${h}$ (cm)`],
    };
  },
};

// ═════════ 6-1-3 소수의 나눗셈 ═════════
const e6a3Two: Skill = {
  id: 'word-two',
  title: '소수의 나눗셈 활용 (두 단계)',
  gen(r, level) {
    const t = r.int(0, 1);
    if (level === 1 && t === 0) {
      const n = r.int(3, 8),
        s = mkDec(r.int(12, 95), 1);
      const P = round(s * n, 8);
      return {
        q: `둘레가 $${dt(P)}$ cm 인 정${POLY[n]}형이 있습니다. 이 정${POLY[n]}형의 한 변의 길이는 몇 cm 인가요?`,
        answer: decAns(s, 'cm'),
        steps: [`정${POLY[n]}형은 변 $${n}$ 개의 길이가 모두 같아요.`, `$${dt(P)} \\div ${n} = ${dt(s)}$ (cm)`],
      };
    }
    if (level === 1) {
      const n = r.int(2, 6),
        s = mkDec(r.int(105, 380), 2);
      const T = round(s * n, 8);
      const it = r.pick(['리본', '끈', '색 테이프']);
      return {
        q: `${it} $${dt(T)}$ m 를 $${n}$ 명이 똑같이 나누어 가지려고 합니다. 한 명이 가지는 ${it}${jo(it, '은/는')} 몇 m 인가요?`,
        answer: decAns(s, 'm'),
        steps: [`식: $${dt(T)} \\div ${n}$`, `$= ${dt(s)}$ (m)`],
      };
    }
    if (level === 2 && t === 0) {
      const n = r.int(3, 9),
        s = mkDec(r.int(85, 160), 1);
      const D = round(s * n, 8);
      return {
        q: `휘발유 $${n}$ L 로 $${dt(D)}$ km 를 가는 자동차가 있습니다. 이 자동차는 휘발유 $1$ L 로 몇 km 를 가는 셈인가요?`,
        answer: decAns(s, 'km'),
        steps: [`식: $${dt(D)} \\div ${n}$`, `$= ${dt(s)}$ (km)`],
      };
    }
    if (level === 2) {
      // 나누어떨어질 때까지 0 을 내려 계산
      const n = r.pick([4, 5, 8]);
      let T = 0,
        s = 0;
      for (;;) {
        T = mkDec(r.int(31, 99), 1);
        s = round(T / n, 8);
        if (String(s).split('.')[1]?.length >= 2 && String(s).split('.')[1].length <= 3) break;
      }
      return {
        q: `길이가 $${dt(T)}$ m 인 철사를 똑같이 $${n}$ 도막으로 잘랐습니다. 한 도막의 길이는 몇 m 인가요?`,
        answer: decAns(s, 'm'),
        steps: [`식: $${dt(T)} \\div ${n}$`, `나누어떨어질 때까지 소수점 아래에 $0$ 을 내려 계산해요.`, `$= ${dt(s)}$ (m)`],
      };
    }
    if (t === 0) {
      const n = r.int(4, 9),
        k = r.int(2, n - 1),
        s = mkDec(r.int(15, 95), 2);
      const T = round(s * n, 8),
        res = round(s * k, 8);
      const it = r.pick(['쌀', '콩', '밀가루']);
      return {
        q: `${it} $${dt(T)}$ kg 을 봉지 $${n}$ 개에 똑같이 나누어 담았습니다. 그중 $${k}$ 봉지에 담긴 ${it}${jo(it, '은/는')} 몇 kg 인가요?`,
        answer: decAns(res, 'kg'),
        steps: [`한 봉지: $${dt(T)} \\div ${n} = ${dt(s)}$ (kg)`, `$${k}$ 봉지: $${dt(s)} \\times ${k} = ${dt(res)}$ (kg)`],
      };
    }
    const n = r.int(2, 5),
      s = mkDec(r.int(12, 60), 1);
    const T = round(s * 3 * n, 8);
    return {
      q: `길이가 $${dt(T)}$ m 인 철사를 겹치지 않게 모두 사용하여 크기가 같은 정삼각형 $${n}$ 개를 만들었습니다. 정삼각형의 한 변의 길이는 몇 m 인가요?`,
      answer: decAns(s, 'm'),
      steps: [`정삼각형 한 개의 둘레: $${dt(T)} \\div ${n} = ${dt(round(T / n, 8))}$ (m)`, `한 변: $${dt(round(T / n, 8))} \\div 3 = ${dt(s)}$ (m)`],
    };
  },
};

// ═════════ 6-1-5 여러 가지 그래프 ═════════
const SURVEY = [
  ['좋아하는 계절', ['봄', '여름', '가을', '겨울']],
  ['좋아하는 운동', ['축구', '피구', '줄넘기', '수영']],
  ['좋아하는 과일', ['사과', '포도', '딸기', '귤']],
  ['등교 방법', ['걸어서', '버스', '자전거', '자동차']],
] as const;

const e6a5Survey: Skill = {
  id: 'word-survey',
  title: '조사 결과와 백분율 문장제',
  gen(r, level) {
    const nm = pickName(r);
    const [topic, items] = r.pick(SURVEY);
    const [A, B] = r.sample(items, 2);
    const what = topic === '등교 방법' ? (x: string) => `${x === '걸어서' ? '걸어서' : x + '로'} 등교하는` : (x: string) => `${josa(x, '을/를')} 좋아하는`;
    if (level === 1) {
      for (;;) {
        const N = r.pick([20, 25, 40, 50, 200, 300]);
        const p = r.int(2, 12) * 5;
        if ((N * p) % 100) continue;
        const k = (N * p) / 100;
        return {
          q: `${nm}네 학교 6학년 학생 $${N}$ 명의 ${topic}${jo(topic, '을/를')} 조사했더니 ${what(A)} 학생이 $${k}$ 명이었습니다. 띠그래프로 나타낼 때 ${what(A)} 학생은 전체의 몇 % 인가요?`,
          answer: intAns(p, '%'),
          steps: [`(백분율) $=$ (항목의 수) $\\div$ (전체 수) $\\times 100$`, `$${k} \\div ${N} \\times 100 = ${p}$ (%)`],
        };
      }
    }
    if (level === 2) {
      for (;;) {
        const N = r.pick([40, 50, 80, 120, 200, 250, 300, 400]);
        const p = r.int(5, 9) * 5,
          q = r.int(2, 5) * 5;
        if ((N * p) % 100 || (N * q) % 100 || p <= q) continue;
        const a = (N * p) / 100,
          b = (N * q) / 100;
        return {
          q: `학생 $${N}$ 명의 ${topic}${jo(topic, '을/를')} 조사하여 띠그래프로 나타냈더니 ${A}${jo(A, '은/는')} $${p}\\%$, ${B}${jo(B, '은/는')} $${q}\\%$ 였습니다. ${what(A)} 학생은 ${what(B)} 학생보다 몇 명 더 많은가요?`,
          answer: intAns(a - b, '명'),
          steps: [`${A}: $${N} \\times \\frac{${p}}{100} = ${a}$ (명)`, `${B}: $${N} \\times \\frac{${q}}{100} = ${b}$ (명)`, `$${a} - ${b} = ${a - b}$ (명)`],
        };
      }
    }
    for (;;) {
      const N = r.pick([200, 300, 400, 500, 600, 800, 1000]);
      const p = r.int(3, 8) * 5,
        q = r.int(2, 8) * 10;
      const a = (N * p) / 100;
      if (!Number.isInteger(a) || (a * q) % 100) continue;
      const g = (a * q) / 100;
      return {
        q: `학생 $${N}$ 명의 ${topic}${jo(topic, '을/를')} 조사했더니 ${what(A)} 학생이 전체의 $${p}\\%$ 였습니다. ${what(A)} 학생 중 $${q}\\%$ 가 여학생이라면, ${what(A)} 여학생은 몇 명인가요?`,
        answer: intAns(g, '명'),
        steps: [`${A}: $${N} \\times \\frac{${p}}{100} = ${a}$ (명)`, `그중 여학생: $${a} \\times \\frac{${q}}{100} = ${g}$ (명)`],
        hint: '여학생의 비율은 전체가 아니라 그 항목 학생 수에 대한 비율이에요.',
      };
    }
  },
};

/** 5의 배수 백분율 4개 (각 ≥10, 합 100) */
function pct4(r: Rng): number[] {
  for (;;) {
    const a = r.int(2, 9) * 5,
      b = r.int(2, 8) * 5,
      c = r.int(2, 6) * 5;
    const d = 100 - a - b - c;
    if (d >= 10) return [a, b, c, d];
  }
}

const e6a5Budget: Skill = {
  id: 'word-budget',
  title: '그래프로 나타낸 양 구하기 문장제',
  gen(r, level) {
    const nm = pickName(r);
    if (level === 1) {
      const M = r.pick([10000, 20000, 30000, 40000, 50000]);
      const labels = ['저축', '간식', '학용품', '기타'];
      const ps = pct4(r);
      const i = r.int(0, 2);
      const v = (M * ps[i]) / 100;
      return {
        q: `${nm}의 한 달 용돈 ${won(M)}을 쓴 곳별로 나누어 원그래프로 나타냈습니다. ${labels[i]}에 쓴 돈은 얼마인가요?`,
        fig: pieFig(labels, ps),
        answer: intAns(v, '원'),
        steps: [`${labels[i]}: $${ps[i]}\\%$`, `$${comma(M)} \\times \\frac{${ps[i]}}{100} = ${comma(v)}$ (원)`],
      };
    }
    if (level === 2) {
      for (;;) {
        const N = r.pick([120, 160, 200, 240, 300, 400]);
        const p = r.int(6, 10) * 5,
          q = r.int(3, 6) * 5;
        const rest = 100 - p - q;
        if (rest < 10 || (N * rest) % 100) continue;
        return {
          q: `학급 문고에 있는 책 $${N}$ 권 중 동화책은 $${p}\\%$, 과학책은 $${q}\\%$ 이고, 나머지는 위인전입니다. 위인전은 몇 권인가요?`,
          answer: intAns((N * rest) / 100, '권'),
          steps: [`위인전의 비율: $100 - ${p} - ${q} = ${rest}$ (%)`, `$${N} \\times \\frac{${rest}}{100} = ${(N * rest) / 100}$ (권)`],
        };
      }
    }
    if (r.chance(0.5)) {
      for (;;) {
        const L = r.pick([10, 20, 25, 40, 50]);
        const p = r.int(2, 8) * 5;
        const N = r.pick([60, 80, 120, 200, 240, 300, 400]);
        const c = round((L * p) / 100, 8);
        if ((N * p) % 100 || !Number.isInteger(c * 10)) continue;
        const it = r.pick(['피구', '축구', '수영', '줄넘기']);
        return {
          q: `학생 $${N}$ 명이 좋아하는 운동을 조사하여 전체 길이가 $${L}$ cm 인 띠그래프로 나타냈습니다. ${josa(it, '을/를')} 좋아하는 학생이 띠에서 $${dt(c)}$ cm 를 차지한다면, ${josa(it, '을/를')} 좋아하는 학생은 몇 명인가요?`,
          answer: intAns((N * p) / 100, '명'),
          steps: [`${it}의 비율: $${dt(c)} \\div ${L} \\times 100 = ${p}$ (%)`, `$${N} \\times \\frac{${p}}{100} = ${(N * p) / 100}$ (명)`],
        };
      }
    }
    for (;;) {
      const p = r.int(5, 9) * 5,
        q = r.int(2, 5) * 5;
      const x = r.int(2, 12) * 3;
      if (p <= q || (x * 100) % (p - q)) continue;
      const N = (x * 100) / (p - q);
      if (!Number.isInteger((N * p) / 100) || N > 1000) continue;
      const [A, B] = r.sample(['강아지', '고양이', '햄스터', '물고기'], 2);
      return {
        q: `학생들이 기르고 싶은 동물을 조사하여 원그래프로 나타냈더니 ${A}${jo(A, '은/는')} $${p}\\%$, ${B}${jo(B, '은/는')} $${q}\\%$ 였습니다. ${josa(A, '을/를')} 고른 학생이 ${josa(B, '을/를')} 고른 학생보다 $${x}$ 명 더 많다면, 조사한 학생은 모두 몇 명인가요?`,
        answer: intAns(N, '명'),
        steps: [`비율의 차: $${p} - ${q} = ${p - q}$ (%) → $${x}$ 명`, `전체 학생 수를 $\\square$ 명이라 하면 $\\square \\times \\frac{${p - q}}{100} = ${x}$`, `$\\square = ${x} \\times 100 \\div ${p - q} = ${N}$ (명)`],
      };
    }
  },
};

// ═════════ 6-1-6 직육면체의 부피와 겉넓이 ═════════
const e6a6Volume: Skill = {
  id: 'word-volume',
  title: '부피 실생활 문장제',
  gen(r, level) {
    const t = r.int(0, 2);
    if (level === 1) {
      if (t < 2) {
        const a = r.int(5, 30),
          b = r.int(4, 20),
          c = r.int(2, 15);
        const it = r.pick(['선물 상자', '필통', '보석함', '과자 상자']);
        return {
          q: `가로 $${a}$ cm, 세로 $${b}$ cm, 높이 $${c}$ cm 인 직육면체 모양 ${it}의 부피는 몇 cm³ 인가요?`,
          answer: intAns(a * b * c, 'cm³'),
          steps: [`(가로) $\\times$ (세로) $\\times$ (높이)`, `$${a} \\times ${b} \\times ${c} = ${a * b * c}$ (cm³)`],
        };
      }
      const a = r.int(3, 15);
      return {
        q: `한 모서리의 길이가 $${a}$ cm 인 정육면체 모양 상자의 부피는 몇 cm³ 인가요?`,
        answer: intAns(a ** 3, 'cm³'),
        steps: [`(한 모서리) $\\times$ (한 모서리) $\\times$ (한 모서리)`, `$${a} \\times ${a} \\times ${a} = ${a ** 3}$ (cm³)`],
      };
    }
    if (level === 2) {
      if (t < 2) {
        const k = r.int(2, 5);
        const x = r.int(2, 6),
          y = r.int(2, 6),
          z = r.int(2, 5);
        return {
          q: `가로 $${k * x}$ cm, 세로 $${k * y}$ cm, 높이 $${k * z}$ cm 인 직육면체 모양 상자에 한 모서리가 $${k}$ cm 인 정육면체 모양 블록을 빈틈없이 쌓으려고 합니다. 블록은 모두 몇 개 들어가나요?`,
          answer: intAns(x * y * z, '개'),
          steps: [`가로 $${k * x} \\div ${k} = ${x}$ 개, 세로 $${k * y} \\div ${k} = ${y}$ 개, 높이 $${k * z} \\div ${k} = ${z}$ 층`, `$${x} \\times ${y} \\times ${z} = ${x * y * z}$ (개)`],
        };
      }
      const a = r.int(2, 6),
        b = r.int(2, 5),
        c = r.int(2, 4);
      return {
        q: `가로 $${a}$ m, 세로 $${b * 100}$ cm, 높이 $${c}$ m 인 직육면체 모양 창고의 부피는 몇 m³ 인가요?`,
        answer: intAns(a * b * c, 'm³'),
        steps: [`$${b * 100}$ cm $= ${b}$ m`, `$${a} \\times ${b} \\times ${c} = ${a * b * c}$ (m³)`],
      };
    }
    const a = r.int(15, 40),
      b = r.int(10, 30);
    const H = r.int(20, 40);
    const h1 = r.int(8, H - 8);
    const d = r.int(2, Math.min(6, H - h1 - 1));
    const fig = cuboidFig(a, b, H, { labels: [`${a} cm`, `${b} cm`, `${H} cm`] });
    if (t === 0) {
      return {
        q: `가로 $${a}$ cm, 세로 $${b}$ cm 인 직육면체 모양 수조에 물이 $${h1}$ cm 높이까지 들어 있습니다. 이 수조에 돌을 완전히 잠기도록 넣었더니 물의 높이가 $${h1 + d}$ cm 가 되었습니다. 돌의 부피는 몇 cm³ 인가요?`,
        fig,
        answer: intAns(a * b * d, 'cm³'),
        steps: [`돌의 부피 $=$ 늘어난 물의 부피`, `늘어난 높이: $${h1 + d} - ${h1} = ${d}$ (cm)`, `$${a} \\times ${b} \\times ${d} = ${a * b * d}$ (cm³)`],
      };
    }
    if (t === 1) {
      return {
        q: `가로 $${a}$ cm, 세로 $${b}$ cm 인 직육면체 모양 수조에 물이 들어 있습니다. 부피가 $${a * b * d}$ cm³ 인 돌을 완전히 잠기도록 넣으면 물의 높이는 몇 cm 높아지나요? (물은 넘치지 않습니다.)`,
        fig,
        answer: intAns(d, 'cm'),
        steps: [`돌의 부피만큼 물의 부피가 늘어나요.`, `밑면의 넓이: $${a} \\times ${b} = ${a * b}$ (cm²)`, `높아진 높이: $${a * b * d} \\div ${a * b} = ${d}$ (cm)`],
      };
    }
    return {
      q: `가로 $${a}$ cm, 세로 $${b}$ cm, 높이 $${H}$ cm 인 직육면체 모양 수조에 물이 $${h1}$ cm 높이까지 들어 있습니다. 수조에 물을 가득 채우려면 물을 몇 cm³ 더 부어야 하나요?`,
      fig,
      answer: intAns(a * b * (H - h1), 'cm³'),
      steps: [`더 채울 높이: $${H} - ${h1} = ${H - h1}$ (cm)`, `$${a} \\times ${b} \\times ${H - h1} = ${a * b * (H - h1)}$ (cm³)`],
    };
  },
};

const e6a6Surface: Skill = {
  id: 'word-surface',
  title: '겉넓이 실생활 문장제',
  gen(r, level) {
    if (level === 1) {
      const a = r.int(4, 20);
      return {
        q: `한 모서리의 길이가 $${a}$ cm 인 정육면체 모양 상자의 겉면을 포장지로 겹치지 않게 빈틈없이 싸려고 합니다. 필요한 포장지의 넓이는 적어도 몇 cm² 인가요?`,
        answer: intAns(6 * a * a, 'cm²'),
        steps: [`정육면체의 겉넓이 $=$ (한 면의 넓이) $\\times 6$`, `$${a} \\times ${a} \\times 6 = ${6 * a * a}$ (cm²)`],
      };
    }
    const a = r.int(5, 25),
      b = r.int(4, 20),
      c = r.int(3, 15);
    if (level === 2) {
      const S = 2 * (a * b + b * c + a * c);
      return {
        q: `가로 $${a}$ cm, 세로 $${b}$ cm, 높이 $${c}$ cm 인 직육면체 모양 나무 상자의 겉면 전체에 페인트를 칠하려고 합니다. 페인트를 칠할 넓이는 몇 cm² 인가요?`,
        fig: cuboidFig(a, b, c, { labels: [`${a} cm`, `${b} cm`, `${c} cm`] }),
        answer: intAns(S, 'cm²'),
        steps: [`서로 다른 세 면: $${a} \\times ${b} = ${a * b}$, $${b} \\times ${c} = ${b * c}$, $${a} \\times ${c} = ${a * c}$`, `$(${a * b} + ${b * c} + ${a * c}) \\times 2 = ${S}$ (cm²)`],
      };
    }
    const t = r.int(0, 2);
    if (t === 0) {
      const S = a * b + 2 * (a * c + b * c);
      return {
        q: `가로 $${a}$ cm, 세로 $${b}$ cm, 높이 $${c}$ cm 인 뚜껑 없는 직육면체 모양 상자가 있습니다. 이 상자의 바깥쪽 면에 색종이를 겹치지 않게 빈틈없이 붙이려면 색종이는 몇 cm² 필요한가요?`,
        fig: cuboidFig(a, b, c, { labels: [`${a} cm`, `${b} cm`, `${c} cm`] }),
        answer: intAns(S, 'cm²'),
        steps: [`뚜껑이 없으므로 윗면은 빼고 아랫면 $1$ 개와 옆면 $4$ 개`, `아랫면: $${a} \\times ${b} = ${a * b}$, 옆면: $(${a} \\times ${c} + ${b} \\times ${c}) \\times 2 = ${2 * (a * c + b * c)}$`, `$${a * b} + ${2 * (a * c + b * c)} = ${S}$ (cm²)`],
      };
    }
    const s = r.int(2, 12);
    if (t === 1) {
      return {
        q: `겉넓이가 $${6 * s * s}$ cm² 인 정육면체 모양 상자가 있습니다. 이 상자의 부피는 몇 cm³ 인가요?`,
        answer: intAns(s ** 3, 'cm³'),
        steps: [`한 면의 넓이: $${6 * s * s} \\div 6 = ${s * s}$ (cm²)`, `$${s} \\times ${s} = ${s * s}$ 이므로 한 모서리는 $${s}$ cm`, `부피: $${s} \\times ${s} \\times ${s} = ${s ** 3}$ (cm³)`],
      };
    }
    return {
      q: `한 모서리의 길이가 $${s}$ cm 인 정육면체 모양 상자 $2$ 개를 면끼리 꼭 맞게 붙여 직육면체를 만들었습니다. 만든 직육면체의 겉넓이는 몇 cm² 인가요?`,
      answer: intAns(10 * s * s, 'cm²'),
      steps: [`붙인 직육면체: 가로 $${2 * s}$ cm, 세로 $${s}$ cm, 높이 $${s}$ cm`, `$(${2 * s} \\times ${s} + ${s} \\times ${s} + ${2 * s} \\times ${s}) \\times 2 = ${10 * s * s}$ (cm²)`, `(정육면체 $2$ 개의 겉넓이 $${12 * s * s}$ 에서 붙은 두 면 $${2 * s * s}$ 를 뺀 것과 같아요.)`],
    };
  },
};

// ═════════ 6-2-1 분수의 나눗셈 ═════════
const e6b1Two: Skill = {
  id: 'word-two',
  title: '분수의 나눗셈 활용 (두 단계)',
  gen(r, level) {
    const t = r.int(0, 1);
    if (level === 1 && t === 0) {
      const a = properFrac(r, 2, 9),
        ans = mixedFrac(r, 6, 3).add(1);
      const b = ans.mul(a);
      return {
        q: `페인트 $${ft(a)}$ L 로 벽 $${mt(b)}$ m² 를 칠했습니다. 같은 방법으로 페인트 $1$ L 로 칠할 수 있는 벽의 넓이는 몇 m² 인지 기약분수로 나타내세요.`,
        answer: fracAns(ans, { unit: 'm²' }),
        steps: [`식: (칠한 넓이) $\\div$ (페인트 양) $= ${mt(b)} \\div ${ft(a)}$`, `$= ${ft(b)} \\times ${ft(a.inv())} = ${mt(ans)}$ (m²)`],
      };
    }
    if (level === 1) {
      const piece = properFrac(r, 2, 9),
        n = r.int(3, 12);
      const L = piece.mul(n);
      const it = r.pick(['리본', '끈', '색 테이프']);
      return {
        q: `길이가 $${mt(L)}$ m 인 ${it}${jo(it, '을/를')} 한 도막이 $${ft(piece)}$ m 가 되도록 자르려고 합니다. 모두 몇 도막이 되나요?`,
        answer: intAns(n, '도막'),
        steps: [`식: $${mt(L)} \\div ${ft(piece)}$`, `$= ${ft(L)} \\times ${ft(piece.inv())} = ${n}$ (도막)`],
      };
    }
    const a = properFrac(r, 3, 9);
    const cap = r.int(2, 9).valueOf();
    const capF = new F(cap).add(r.chance(0.5) ? new F(1, r.pick([2, 3, 4])) : 0);
    const water = capF.mul(a);
    if (level === 2 && t === 0) {
      const p = properFrac(r, 2, 8),
        A = mixedFrac(r, 5, 3).add(1);
      const res = p.div(A);
      return {
        q: `페인트 $${ft(p)}$ L 로 벽 $${mt(A)}$ m² 를 칠했습니다. 같은 방법으로 벽 $1$ m² 를 칠하는 데 필요한 페인트는 몇 L 인지 기약분수로 나타내세요.`,
        answer: fracAns(res, { unit: 'L' }),
        steps: [`식: (페인트 양) $\\div$ (칠한 넓이) $= ${ft(p)} \\div ${mt(A)}$`, `$= ${ft(p)} \\times ${ft(A.inv())} = ${mt(res)}$ (L)`],
        hint: '1 m² 에 필요한 양을 구하므로 넓이로 나누어요.',
      };
    }
    if (level === 2) {
      return {
        q: `물통의 $${ft(a)}$ 만큼 물이 들어 있습니다. 들어 있는 물이 $${mt(water)}$ L 라면, 물통에 물을 가득 채웠을 때의 물의 양은 몇 L 인지 기약분수로 나타내세요.`,
        answer: fracAns(capF, { unit: 'L' }),
        steps: [`(전체) $\\times ${ft(a)} = ${mt(water)}$`, `(전체) $= ${mt(water)} \\div ${ft(a)} = ${ft(water)} \\times ${ft(a.inv())} = ${mt(capF)}$ (L)`],
      };
    }
    if (t === 0) {
      const x = mixedFrac(r, 7, 3).add(1);
      const d = r.chance(0.5) ? properFrac(r, 2, 7) : properFrac(r, 2, 5).add(1);
      const X = x.mul(d),
        res = x.div(d);
      return {
        q: `어떤 수를 $${mt(d)}$ 로 나누어야 할 것을 잘못하여 곱했더니 $${mt(X)}$ 가 되었습니다. 바르게 계산한 값을 기약분수로 나타내세요.`,
        answer: fracAns(res),
        steps: [`어떤 수: $${mt(X)} \\div ${mt(d)} = ${mt(x)}$`, `바른 계산: $${mt(x)} \\div ${mt(d)} = ${ft(x)} \\times ${ft(d.inv())} = ${mt(res)}$`],
        hint: '곱하기를 거꾸로 하면 나누기예요. 어떤 수부터 구해요.',
      };
    }
    const more = capF.sub(water);
    return {
      q: `물통의 $${ft(a)}$ 만큼 물이 들어 있습니다. 들어 있는 물이 $${mt(water)}$ L 일 때, 물통을 가득 채우려면 물을 몇 L 더 부어야 하는지 기약분수로 나타내세요.`,
      answer: fracAns(more, { unit: 'L' }),
      steps: [`물통의 들이: $${mt(water)} \\div ${ft(a)} = ${mt(capF)}$ (L)`, `더 부을 물: $${mt(capF)} - ${mt(water)} = ${mt(more)}$ (L)`],
    };
  },
};

// ═════════ 6-2-5 원의 넓이 ═════════
const piOf = (r: Rng, level: Level) => (level === 1 ? r.pick([3, 3.1]) : 3.14);
const piNote = (pi: number) => `(원주율: $${dt(pi)}$)`;

const e6b5Wheel: Skill = {
  id: 'word-wheel',
  title: '굴렁쇠·바퀴와 원주 문장제',
  gen(r, level) {
    const pi = piOf(r, level);
    if (level === 1) {
      const d = r.int(4, 16) * 5;
      const it = r.pick(['굴렁쇠', '훌라후프', '자전거 바퀴']);
      const C = round(d * pi, 8);
      return {
        q: `지름이 $${d}$ cm 인 ${josa(it, '을/를')} 한 바퀴 굴렸습니다. ${it}${jo(it, '이/가')} 굴러간 거리는 몇 cm 인가요? ${piNote(pi)}`,
        fig: circleFig({ dLabel: `${d} cm` }),
        answer: decAns(C, 'cm'),
        steps: [`한 바퀴 굴러간 거리 $=$ 원주 $=$ (지름) $\\times$ (원주율)`, `$${d} \\times ${dt(pi)} = ${dt(C)}$ (cm)`],
      };
    }
    const t = r.int(0, 1);
    if (level === 2) {
      const d = r.int(4, 16) * 5,
        n = r.int(3, 12);
      const D = round(d * pi * n, 8);
      if (t === 0) {
        return {
          q: `지름이 $${d}$ cm 인 바퀴가 $${n}$ 바퀴 굴러갔습니다. 바퀴가 굴러간 거리는 몇 cm 인가요? ${piNote(pi)}`,
          answer: decAns(D, 'cm'),
          steps: [`한 바퀴: $${d} \\times ${dt(pi)} = ${dt(round(d * pi, 8))}$ (cm)`, `$${n}$ 바퀴: $${dt(round(d * pi, 8))} \\times ${n} = ${dt(D)}$ (cm)`],
        };
      }
      return {
        q: `굴렁쇠를 $${n}$ 바퀴 굴렸더니 $${dt(D)}$ cm 를 굴러갔습니다. 이 굴렁쇠의 지름은 몇 cm 인가요? ${piNote(pi)}`,
        answer: intAns(d, 'cm'),
        steps: [`한 바퀴 굴러간 거리(원주): $${dt(D)} \\div ${n} = ${dt(round(d * pi, 8))}$ (cm)`, `지름: $${dt(round(d * pi, 8))} \\div ${dt(pi)} = ${d}$ (cm)`],
      };
    }
    if (t === 0) {
      for (;;) {
        const D = r.int(10, 40) * 2,
          a = r.int(3, 10);
        const C = 3 * D;
        if (C % a || C / a < 10) continue;
        return {
          q: `지름이 $${D}$ m 인 원 모양 호수의 둘레를 따라 $${a}$ m 간격으로 나무를 심으려고 합니다. 나무는 모두 몇 그루 필요한가요? (원주율: $3$)`,
          answer: intAns(C / a, '그루'),
          steps: [`호수의 둘레: $${D} \\times 3 = ${C}$ (m)`, `원 모양 둘레에 심으면 처음과 끝이 만나므로 (둘레) $\\div$ (간격)`, `$${C} \\div ${a} = ${C / a}$ (그루)`],
        };
      }
    }
    const rad = r.int(2, 7) * 5,
      n = r.int(10, 50);
    const cm = round(2 * rad * pi * n, 8);
    return {
      q: `반지름이 $${rad}$ cm 인 자전거 바퀴가 $${n}$ 바퀴 굴러갔습니다. 자전거가 간 거리는 몇 m 인가요? ${piNote(pi)}`,
      answer: decAns(round(cm / 100, 8), 'm'),
      steps: [`한 바퀴: $${rad} \\times 2 \\times ${dt(pi)} = ${dt(round(2 * rad * pi, 8))}$ (cm)`, `$${n}$ 바퀴: $${dt(round(2 * rad * pi, 8))} \\times ${n} = ${dt(cm)}$ (cm)`, `$${dt(cm)}$ cm $= ${dt(round(cm / 100, 8))}$ m`],
    };
  },
};

const e6b5Area: Skill = {
  id: 'word-area',
  title: '원의 넓이 실생활 문장제',
  gen(r, level) {
    const pi = piOf(r, level);
    const t = r.int(0, 1);
    if (level === 1) {
      if (t === 0) {
        const rad = r.int(2, 12);
        const place = r.pick(['꽃밭', '연못', '광장', '잔디밭']);
        const A = round(rad * rad * pi, 8);
        return {
          q: `반지름이 $${rad}$ m 인 원 모양 ${place}의 넓이는 몇 m² 인가요? ${piNote(pi)}`,
          answer: decAns(A, 'm²'),
          steps: [`(반지름) $\\times$ (반지름) $\\times$ (원주율)`, `$${rad} \\times ${rad} \\times ${dt(pi)} = ${dt(A)}$ (m²)`],
        };
      }
      const d = r.int(10, 20) * 2;
      const it = r.pick(['피자', '접시', '시계']);
      const A = round((d / 2) ** 2 * pi, 8);
      return {
        q: `지름이 $${d}$ cm 인 원 모양 ${it}${jo(it, '이/가')} 있습니다. 이 ${it}의 넓이는 몇 cm² 인가요? ${piNote(pi)}`,
        fig: circleFig({ dLabel: `${d} cm` }),
        answer: decAns(A, 'cm²'),
        steps: [`반지름: $${d} \\div 2 = ${d / 2}$ (cm)`, `$${d / 2} \\times ${d / 2} \\times ${dt(pi)} = ${dt(A)}$ (cm²)`],
      };
    }
    if (level === 2) {
      const rad = r.int(2, 15);
      const A = round(rad * rad * pi, 8);
      if (t === 0) {
        const C = round(2 * rad * pi, 8);
        return {
          q: `둘레가 $${dt(C)}$ m 인 원 모양 연못이 있습니다. 이 연못의 넓이는 몇 m² 인가요? ${piNote(pi)}`,
          answer: decAns(A, 'm²'),
          steps: [`지름: $${dt(C)} \\div ${dt(pi)} = ${2 * rad}$ (m), 반지름: $${rad}$ m`, `넓이: $${rad} \\times ${rad} \\times ${dt(pi)} = ${dt(A)}$ (m²)`],
        };
      }
      return {
        q: `넓이가 $${dt(A)}$ m² 인 원 모양 꽃밭이 있습니다. 이 꽃밭의 반지름은 몇 m 인가요? ${piNote(pi)}`,
        answer: intAns(rad, 'm'),
        steps: [`(반지름) $\\times$ (반지름) $= ${dt(A)} \\div ${dt(pi)} = ${rad * rad}$`, `$${rad} \\times ${rad} = ${rad * rad}$ 이므로 반지름은 $${rad}$ m`],
      };
    }
    if (t === 0) {
      const R = r.int(6, 20),
        rr = r.int(2, R - 2);
      const A = round((R * R - rr * rr) * pi, 8);
      return {
        q: `반지름이 $${R}$ m 인 원 모양 광장의 한가운데에 반지름이 $${rr}$ m 인 원 모양 분수대가 있습니다. 분수대를 뺀 광장의 넓이는 몇 m² 인가요? ${piNote(pi)}`,
        answer: decAns(A, 'm²'),
        steps: [`광장: $${R} \\times ${R} \\times ${dt(pi)} = ${dt(round(R * R * pi, 8))}$ (m²)`, `분수대: $${rr} \\times ${rr} \\times ${dt(pi)} = ${dt(round(rr * rr * pi, 8))}$ (m²)`, `$${dt(round(R * R * pi, 8))} - ${dt(round(rr * rr * pi, 8))} = ${dt(A)}$ (m²)`],
      };
    }
    const a = r.int(3, 15) * 2;
    const circ = round((a / 2) ** 2 * pi, 8);
    const A = round(a * a - circ, 8);
    return {
      q: `한 변의 길이가 $${a}$ m 인 정사각형 모양 땅 안에 그릴 수 있는 가장 큰 원 모양의 꽃밭을 만들었습니다. 꽃밭을 뺀 나머지 땅의 넓이는 몇 m² 인가요? ${piNote(pi)}`,
      answer: decAns(A, 'm²'),
      steps: [`가장 큰 원의 지름 $=$ 정사각형의 한 변 → 반지름 $${a / 2}$ m`, `꽃밭: $${a / 2} \\times ${a / 2} \\times ${dt(pi)} = ${dt(circ)}$ (m²)`, `땅: $${a} \\times ${a} = ${a * a}$ (m²) → $${a * a} - ${dt(circ)} = ${dt(A)}$ (m²)`],
    };
  },
};

// ═════════ 6-2-6 원기둥, 원뿔, 구 ═════════
const e6b6Roller: Skill = {
  id: 'word-roller',
  title: '롤러로 칠한 넓이 (원기둥 옆면)',
  gen(r, level) {
    const pi = level === 1 ? 3 : 3.14;
    const rad = r.int(2, 6),
      h = r.int(4, 12) * 5;
    const one = round(2 * rad * pi * h, 8);
    const fig = cylinderFig({ rLabel: `${rad} cm`, hLabel: `${h} cm` });
    const intro = `밑면의 반지름이 $${rad}$ cm, 높이가 $${h}$ cm 인 원기둥 모양 롤러에 페인트를 묻혀`;
    const base = [`롤러가 한 바퀴 돌며 칠한 부분 $=$ 원기둥의 옆면(직사각형)`, `옆면의 가로 $=$ 밑면의 둘레 $= ${rad} \\times 2 \\times ${dt(pi)} = ${dt(round(2 * rad * pi, 8))}$ (cm), 세로 $= ${h}$ cm`];
    if (level === 1) {
      return {
        q: `${intro} 한 바퀴 굴렸습니다. 페인트가 칠해진 부분의 넓이는 몇 cm² 인가요? (원주율: $3$)`,
        fig,
        answer: decAns(one, 'cm²'),
        steps: [...base, `$${dt(round(2 * rad * pi, 8))} \\times ${h} = ${dt(one)}$ (cm²)`],
      };
    }
    const n = r.int(2, 8);
    const tot = round(one * n, 8);
    if (level === 2) {
      return {
        q: `${intro} 쉬지 않고 $${n}$ 바퀴 굴렸습니다. 페인트가 칠해진 부분의 넓이는 몇 cm² 인가요? ${piNote(pi)}`,
        fig,
        answer: decAns(tot, 'cm²'),
        steps: [...base, `한 바퀴: $${dt(round(2 * rad * pi, 8))} \\times ${h} = ${dt(one)}$ (cm²)`, `$${n}$ 바퀴: $${dt(one)} \\times ${n} = ${dt(tot)}$ (cm²)`],
      };
    }
    if (r.chance(0.5)) {
      return {
        q: `${intro} 쉬지 않고 굴렸더니 칠해진 부분의 넓이가 $${dt(tot)}$ cm² 였습니다. 롤러를 몇 바퀴 굴린 것인가요? ${piNote(pi)}`,
        fig,
        answer: intAns(n, '바퀴'),
        steps: [...base, `한 바퀴에 칠하는 넓이: $${dt(one)}$ cm²`, `$${dt(tot)} \\div ${dt(one)} = ${n}$ (바퀴)`],
      };
    }
    const len = round(2 * rad * pi * n, 8);
    return {
      q: `${intro} 벽에 한 방향으로 곧게 굴렸더니 칠해진 부분이 가로 $${dt(len)}$ cm, 세로 $${h}$ cm 인 직사각형이 되었습니다. 롤러를 몇 바퀴 굴린 것인가요? ${piNote(pi)}`,
      fig,
      answer: intAns(n, '바퀴'),
      steps: [`롤러가 한 바퀴 구르면 밑면의 둘레만큼 나아가요.`, `한 바퀴에 나아가는 길이: $${rad} \\times 2 \\times ${dt(pi)} = ${dt(round(2 * rad * pi, 8))}$ (cm)`, `$${dt(len)} \\div ${dt(round(2 * rad * pi, 8))} = ${n}$ (바퀴)`],
    };
  },
};

const e6b6Label: Skill = {
  id: 'word-label',
  title: '원기둥 통의 옆면 상표 문장제',
  gen(r, level) {
    const pi = level === 1 ? 3 : 3.14;
    const d = r.int(3, 10) * 2,
      h = r.int(8, 20);
    const it = r.pick(['음료수 캔', '통조림 통', '과자 통', '참치 캔']);
    const W = round(d * pi, 8);
    const A = round(W * h, 8);
    const fig = cylinderFig({ dLabel: `${d} cm`, hLabel: `${h} cm` });
    const intro = `밑면의 지름이 $${d}$ cm, 높이가 $${h}$ cm 인 원기둥 모양 ${it}의 옆면을 직사각형 모양 상표로 겹치지 않게 빈틈없이 둘러쌌습니다.`;
    if (level === 1) {
      return {
        q: `${intro} 상표의 가로와 세로는 각각 몇 cm 인가요? (원주율: $3$)`,
        fig,
        answer: { type: 'fields', fields: [{ label: '가로', value: W, unit: 'cm' }, { label: '세로', value: h, unit: 'cm' }] },
        steps: [`상표는 원기둥의 옆면 → 가로 $=$ 밑면의 둘레, 세로 $=$ 높이`, `가로: $${d} \\times 3 = ${dt(W)}$ (cm), 세로: $${h}$ cm`],
      };
    }
    if (level === 2) {
      return {
        q: `${intro} 상표의 넓이는 몇 cm² 인가요? ${piNote(pi)}`,
        fig,
        answer: decAns(A, 'cm²'),
        steps: [`가로 $=$ 밑면의 둘레: $${d} \\times ${dt(pi)} = ${dt(W)}$ (cm), 세로 $=$ 높이 $${h}$ cm`, `$${dt(W)} \\times ${h} = ${dt(A)}$ (cm²)`],
      };
    }
    return {
      q: `높이가 $${h}$ cm 인 원기둥 모양 ${it}의 옆면을 직사각형 모양 상표로 겹치지 않게 빈틈없이 둘러쌌더니 상표의 넓이가 $${dt(A)}$ cm² 였습니다. 이 ${it}의 밑면의 반지름은 몇 cm 인가요? ${piNote(pi)}`,
      answer: intAns(d / 2, 'cm'),
      steps: [`상표의 가로(밑면의 둘레): $${dt(A)} \\div ${h} = ${dt(W)}$ (cm)`, `지름: $${dt(W)} \\div ${dt(pi)} = ${d}$ (cm)`, `반지름: $${d} \\div 2 = ${d / 2}$ (cm)`],
    };
  },
};

export const WORD6: Record<string, Skill[]> = {
  'e6a-1': [e6a1Two],
  'e6a-2': [e6a2Straw, e6a2Wire],
  'e6a-3': [e6a3Two],
  'e6a-5': [e6a5Survey, e6a5Budget],
  'e6a-6': [e6a6Volume, e6a6Surface],
  'e6b-1': [e6b1Two],
  'e6b-5': [e6b5Wheel, e6b5Area],
  'e6b-6': [e6b6Roller, e6b6Label],
};
