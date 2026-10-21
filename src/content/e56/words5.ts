// 초5 문장제 추가 유형 (단원별로 기존 skills 뒤에 덧붙임)
import type { Skill, ProblemDraft } from '../../core/types';
import type { Rng } from '../../core/rng';
import { F } from '../../core/frac';
import { gcd, lcm, divisors, round } from '../../core/nt';
import { comma, makeChoices } from '../../core/tex';
import { Svg } from '../../core/fig';
import { pickName, pickNames, josa, jo, fracAns, intAns, decAns, ft, mt, properFrac, dt, mkDec } from './util';
import { cuboidFig } from './fig56';

const won = (x: number) => `$${comma(x)}$ 원`;
/** 가분수 = 대분수 (같으면 한 번만) */
const fm = (f: F) => (f.tex() === f.mixedTex() ? f.tex() : `${f.tex()} = ${f.mixedTex()}`);
const POLY: Record<number, string> = { 3: '삼각', 4: '사각', 5: '오각', 6: '육각', 7: '칠각', 8: '팔각', 9: '구각', 10: '십각' };

/** 분모가 서로 다른 진분수 두 개 (통분 분모 ≤ maxL) */
function twoFracs(r: Rng, dmax: number, maxL: number): [F, F] {
  for (;;) {
    const a = properFrac(r, 2, dmax),
      b = properFrac(r, 2, dmax);
    if (a.d !== b.d && lcm(a.d, b.d) <= maxL && !a.eq(b)) return [a, b];
  }
}

// ═════════ 5-1-1 자연수의 혼합 계산 ═════════
const e5a1Price: Skill = {
  id: 'word-price',
  title: '물건값·거스름돈 문장제',
  gen(r, level) {
    const nm = pickName(r);
    const t = r.int(0, 1);
    if (level === 1 && t === 0) {
      const [it, u] = r.pick([
        ['공책', '권'],
        ['연필', '자루'],
        ['색연필', '자루'],
        ['지우개', '개'],
        ['아이스크림', '개'],
      ] as const);
      const p = r.pick([300, 400, 500, 600, 700, 800, 900, 1200]),
        n = r.int(2, 6);
      const m = p * n < 5000 ? 5000 : 10000;
      return {
        q: `${josa(nm, '은/는')} 한 ${u}에 ${won(p)}인 ${it} $${n}$ ${josa(u, '을/를')} 사고 ${won(m)}을 냈습니다. 거스름돈은 얼마인가요?`,
        answer: intAns(m - p * n, '원'),
        steps: [`식: $${comma(m)} - ${comma(p)} \\times ${n}$`, `곱셈을 먼저: $${comma(p)} \\times ${n} = ${comma(p * n)}$`, `$${comma(m)} - ${comma(p * n)} = ${comma(m - p * n)}$ (원)`],
      };
    }
    const place = r.pick(['미술관', '과학관', '박물관', '수영장', '놀이공원']);
    const a = r.pick([3000, 4000, 5000, 6000]),
      b = r.pick([1000, 1500, 2000, 2500]);
    const x = r.int(1, 3),
      y = r.int(1, 4);
    const tot = a * x + b * y;
    if (level === 1) {
      return {
        q: `${nm}네 가족은 어른 $${x}$ 명과 어린이 $${y}$ 명이 ${place}에 갔습니다. 입장료가 어른은 한 명에 ${won(a)}, 어린이는 한 명에 ${won(b)}이라면 입장료는 모두 얼마인가요?`,
        answer: intAns(tot, '원'),
        steps: [`식: $${comma(a)} \\times ${x} + ${comma(b)} \\times ${y}$`, `$= ${comma(a * x)} + ${comma(b * y)}$`, `$= ${comma(tot)}$ (원)`],
      };
    }
    const [i1, i2] = r.pick([
      ['과자', '사탕'],
      ['도넛', '쿠키'],
      ['김밥', '주먹밥'],
      ['볼펜', '형광펜'],
    ]);
    const u1 = r.int(3, 9) * 100,
      n1 = r.int(2, 5),
      u2 = r.int(1, 6) * 100,
      n2 = r.int(2, 5);
    const p1 = u1 * n1,
      p2 = u2 * n2;
    if (level === 2 && t === 0) {
      return {
        q: `${i1} $${n1}$ 개에 ${won(p1)}, ${i2} $${n2}$ 개에 ${won(p2)}입니다. ${i1} 한 개와 ${i2} 한 개를 사려면 얼마가 필요한가요?`,
        answer: intAns(u1 + u2, '원'),
        steps: [`식: $${comma(p1)} \\div ${n1} + ${comma(p2)} \\div ${n2}$`, `나눗셈을 먼저: $${comma(u1)} + ${comma(u2)}$`, `$= ${comma(u1 + u2)}$ (원)`],
      };
    }
    if (level === 2) {
      const c = r.int(2, 6),
        s = r.int(2, 5),
        bx = r.int(2, 6);
      const A = c * s,
        per = s * bx;
      const d = r.int(1, Math.max(1, Math.floor(per / 2)));
      const fr = r.pick(['귤', '사과', '감', '복숭아']);
      return {
        q: `${fr}${jo(fr, '이/가')} 한 상자에 $${A}$ 개씩 $${bx}$ 상자 있습니다. 이 ${josa(fr, '을/를')} $${c}$ 명이 똑같이 나누어 가진 뒤, 각자 $${d}$ 개씩 먹었습니다. 한 명에게 남은 ${fr}${jo(fr, '은/는')} 몇 개인가요?`,
        answer: intAns(per - d, '개'),
        steps: [`식: $${A} \\times ${bx} \\div ${c} - ${d}$`, `$= ${A * bx} \\div ${c} - ${d} = ${per} - ${d}$`, `$= ${per - d}$ (개)`],
      };
    }
    // level 3: 두 단계 + 거스름돈
    if (t === 0) {
      const m = tot < 30000 ? 30000 : 50000;
      return {
        q: `어른 $${x}$ 명과 어린이 $${y}$ 명이 ${place}에 가서 입장료로 ${won(m)}을 냈습니다. 입장료가 어른은 한 명에 ${won(a)}, 어린이는 한 명에 ${won(b)}일 때, 거스름돈은 얼마인가요?`,
        answer: intAns(m - tot, '원'),
        steps: [`식: $${comma(m)} - (${comma(a)} \\times ${x} + ${comma(b)} \\times ${y})$`, `괄호 안: $${comma(a * x)} + ${comma(b * y)} = ${comma(tot)}$`, `$${comma(m)} - ${comma(tot)} = ${comma(m - tot)}$ (원)`],
      };
    }
    const k1 = r.int(2, 4),
      k2 = r.int(2, 4);
    const cost = u1 * k1 + u2 * k2;
    const m = 10000;
    return {
      q: `${i1} $${n1}$ 개에 ${won(p1)}, ${i2} $${n2}$ 개에 ${won(p2)}입니다. ${josa(nm, '은/는')} ${i1} $${k1}$ 개와 ${i2} $${k2}$ 개를 사고 ${won(m)}을 냈습니다. 거스름돈은 얼마인가요?`,
      answer: intAns(m - cost, '원'),
      steps: [
        `식: $${comma(m)} - (${comma(p1)} \\div ${n1} \\times ${k1} + ${comma(p2)} \\div ${n2} \\times ${k2})$`,
        `${i1} 한 개 $${comma(u1)}$ 원, ${i2} 한 개 $${comma(u2)}$ 원`,
        `산 값: $${comma(u1)} \\times ${k1} + ${comma(u2)} \\times ${k2} = ${comma(cost)}$ (원)`,
        `$${comma(m)} - ${comma(cost)} = ${comma(m - cost)}$ (원)`,
      ],
    };
  },
};

// ═════════ 5-1-2 약수와 배수 ═════════
const e5a2Apply: Skill = {
  id: 'word-apply',
  title: '약수·배수 활용 문장제',
  gen(r, level) {
    const t = r.int(0, 1);
    if (level === 1 && t === 0) {
      const N = r.int(30, 60),
        k = r.int(3, 9);
      const q = Math.floor(N / k);
      return {
        q: `$1$ 번부터 $${N}$ 번까지 번호가 붙은 사물함이 있습니다. 번호가 $${k}$ 의 배수인 사물함에 노란 스티커를 붙이려고 합니다. 스티커를 붙일 사물함은 모두 몇 개인가요?`,
        answer: intAns(q, '개'),
        steps: [`$${k}$ 의 배수: $${k}, ${2 * k}, ${3 * k}, \\ldots, ${k * q}$`, `$${N} \\div ${k} = ${q} \\cdots ${N % k}$ 이므로 $${k} \\times ${q} = ${k * q}$ 까지`, `$${q}$ 개`],
      };
    }
    if (level === 1) {
      const n = r.pick([12, 18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48]);
      const ds = divisors(n).filter((x) => x >= 2);
      const it = r.pick(['사탕', '초콜릿', '쿠키', '젤리']);
      return {
        q: `${it} $${n}$ 개를 친구들에게 남김없이 똑같이 나누어 주려고 합니다. 친구는 $2$ 명 이상이라고 할 때, 나누어 줄 수 있는 친구 수는 모두 몇 가지인가요?`,
        answer: intAns(ds.length, '가지'),
        steps: [`친구 수는 $${n}$ 의 약수여야 해요.`, `$${n}$ 의 약수: $${divisors(n).join(', ')}$`, `$1$ 을 빼면 $${ds.join(', ')}$ → $${ds.length}$ 가지`],
      };
    }
    if (level === 2 && t === 0) {
      let a = 0,
        b = 0;
      for (;;) {
        a = r.int(12, 40);
        b = r.int(12, 40);
        if (a !== b && gcd(a, b) > 1 && lcm(a, b) <= 240 && a % b !== 0 && b % a !== 0) break;
      }
      const L = lcm(a, b);
      return {
        q: `톱니 수가 $${a}$ 개인 톱니바퀴 ㉮와 $${b}$ 개인 톱니바퀴 ㉯가 서로 맞물려 돌고 있습니다. 처음에 맞물렸던 두 톱니가 다시 처음으로 맞물리려면 톱니바퀴 ㉮는 적어도 몇 바퀴 돌아야 하나요?`,
        answer: intAns(L / a, '바퀴'),
        steps: [`다시 맞물릴 때까지 지나간 톱니 수는 $${a}$ 와 $${b}$ 의 공배수 → 처음은 최소공배수`, `$${a}$ 와 $${b}$ 의 최소공배수: $${L}$`, `㉮: $${L} \\div ${a} = ${L / a}$ (바퀴)`],
        hint: '두 톱니바퀴가 맞물려 지나간 톱니 수는 서로 같아요.',
      };
    }
    if (level === 2) {
      let k1 = 0,
        k2 = 0,
        N = 0;
      for (;;) {
        k1 = r.int(2, 9);
        k2 = r.int(2, 9);
        N = r.int(50, 100);
        if (k1 < k2 && k2 % k1 !== 0 && lcm(k1, k2) * 2 <= N) break;
      }
      const L = lcm(k1, k2);
      const q = Math.floor(N / L);
      return {
        q: `$1$ 번부터 $${N}$ 번까지 번호가 붙은 사물함 중에서 번호가 $${k1}$ 의 배수이면서 $${k2}$ 의 배수인 사물함은 모두 몇 개인가요?`,
        answer: intAns(q, '개'),
        steps: [`$${k1}$ 과 $${k2}$ 의 공배수 = 최소공배수 $${L}$ 의 배수`, `$${N} \\div ${L} = ${q} \\cdots ${N % L}$`, `$${q}$ 개`],
      };
    }
    if (t === 0) {
      const g = r.int(3, 12);
      let p = 0,
        q = 0;
      for (;;) {
        p = r.int(2, 7);
        q = r.int(2, 7);
        if (p !== q && gcd(p, q) === 1) break;
      }
      const w = g * p,
        h = g * q;
      const cnt = (2 * (w + h)) / g;
      return {
        q: `가로가 $${w}$ m, 세로가 $${h}$ m 인 직사각형 모양 땅의 둘레에 같은 간격으로 나무를 심으려고 합니다. 네 모퉁이에는 반드시 나무를 심고, 나무는 될 수 있는 대로 적게 심으려고 합니다. 필요한 나무는 모두 몇 그루인가요?`,
        answer: intAns(cnt, '그루'),
        steps: [`간격은 $${w}$ 와 $${h}$ 의 최대공약수 $${g}$ m`, `둘레: $(${w} + ${h}) \\times 2 = ${2 * (w + h)}$ (m)`, `둘레를 따라 한 바퀴 심으면 (둘레) $\\div$ (간격)만큼: $${2 * (w + h)} \\div ${g} = ${cnt}$ (그루)`],
        hint: '나무를 적게 심으려면 간격을 될 수 있는 대로 넓게 해야 해요.',
      };
    }
    const g = r.int(6, 15);
    let p = 0,
      q = 0;
    for (;;) {
      p = r.int(2, 8);
      q = r.int(2, 8);
      if (p !== q && gcd(p, q) === 1) break;
    }
    const r1 = r.int(1, g - 1),
      r2 = r.int(1, g - 1);
    const a = g * p + r1,
      b = g * q + r2;
    const [f1, f2] = r.pick([
      ['사과', '귤'],
      ['공책', '연필'],
      ['초콜릿', '사탕'],
    ]);
    return {
      q: `${f1} $${a}$ 개와 ${f2} $${b}$ 개를 될 수 있는 대로 많은 학생에게 똑같이 나누어 주었더니 ${f1}${jo(f1, '은/는')} $${r1}$ 개, ${f2}${jo(f2, '은/는')} $${r2}$ 개가 남았습니다. 나누어 받은 학생은 몇 명인가요?`,
      answer: intAns(g, '명'),
      steps: [`나누어 준 ${f1}: $${a} - ${r1} = ${a - r1}$, ${f2}: $${b} - ${r2} = ${b - r2}$`, `학생 수는 $${a - r1}$ 과 $${b - r2}$ 의 공약수 중 가장 큰 수`, `최대공약수: $${g}$ → $${g}$ 명 (남은 개수보다 크므로 알맞아요)`],
    };
  },
};

// ═════════ 5-1-4 약분과 통분 ═════════
type Cmp = { obj: string; verb: string; unit: string; more: string; most: string; least: string };
const CMP: Cmp[] = [
  { obj: '우유를', verb: '마셨습니다', unit: 'L', more: '더 많이 마신', most: '가장 많이 마신', least: '가장 적게 마신' },
  { obj: '', verb: '달렸습니다', unit: 'km', more: '더 멀리 달린', most: '가장 멀리 달린', least: '가장 적게 달린' },
  { obj: '딸기를', verb: '땄습니다', unit: 'kg', more: '더 많이 딴', most: '가장 많이 딴', least: '가장 적게 딴' },
  { obj: '리본을', verb: '사용했습니다', unit: 'm', more: '더 많이 사용한', most: '가장 많이 사용한', least: '가장 적게 사용한' },
  { obj: '물을', verb: '마셨습니다', unit: 'L', more: '더 많이 마신', most: '가장 많이 마신', least: '가장 적게 마신' },
];

const e5a4Compare: Skill = {
  id: 'word-compare',
  title: '분수의 크기 비교 문장제',
  gen(r, level) {
    const c = r.pick(CMP);
    const k = level === 1 ? 2 : 3;
    const names = pickNames(r, k);
    let fs: F[] = [];
    for (;;) {
      if (level === 1) {
        const d = r.int(2, 6),
          m = r.int(2, 3);
        const a = properFrac(r, d, d),
          b = properFrac(r, d * m, d * m);
        fs = [a, b];
      } else {
        fs = Array.from({ length: k }, () => properFrac(r, 2, 12));
      }
      const D = fs.reduce((x, f) => lcm(x, f.d), 1);
      const distinctVal = new Set(fs.map((f) => f.value)).size === fs.length;
      const distinctDen = new Set(fs.map((f) => f.d)).size === fs.length;
      if (distinctVal && distinctDen && D <= 60) break;
    }
    // 3단계: 한 사람은 소수로
    const decIdx = level === 3 ? r.int(0, k - 1) : -1;
    if (level === 3) {
      const v = r.pick([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.25, 0.75, 0.35, 0.45, 0.65]);
      fs[decIdx] = F.fromNumber(v);
      if (new Set(fs.map((f) => f.value)).size !== k) return e5a4Compare.gen(r, level);
    }
    const show = (i: number) => (i === decIdx ? dt(fs[i].value) : ft(fs[i]));
    const D = fs.reduce((x, f) => lcm(x, f.d), 1);
    const amt = (i: number) => `$${show(i)}$ ${c.unit}`;
    const parts = names.map((n, i) => `${josa(n, '은/는')} ${i === 0 && c.obj ? c.obj + ' ' : ''}${amt(i)}`);
    const ask = level === 1 ? 'more' : r.pick(['most', 'least'] as const);
    const order = fs.map((_, i) => i).sort((i, j) => fs[j].cmp(fs[i]));
    const win = ask === 'least' ? order[k - 1] : order[0];
    const conv = fs.map((f, i) => {
      const tx = `\\frac{${(f.n * D) / f.d}}{${D}}`;
      if (i === decIdx) return `$${show(i)} = ${ft(f)} = ${tx}$`;
      return f.d === D ? `$${ft(f)}$` : `$${ft(f)} = ${tx}$`;
    });
    const sorted = order.map((i) => `\\frac{${(fs[i].n * D) / fs[i].d}}{${D}}`).join(' > ');
    const label = ask === 'more' ? c.more : ask === 'most' ? c.most : c.least;
    const q = `${parts.join(', ')} ${c.verb}. ${c.obj ? c.obj + ' ' : ''}${label} 사람은 누구인가요?`;
    const steps = [
      level === 3 ? `소수를 분수로 바꾼 뒤 분모를 $${D}$ 로 통분해요.` : `분모를 $${D}$ 로 통분해서 비교해요.`,
      conv.join(', '),
      `$${sorted}$ 이므로 ${label} 사람은 ${names[win]}`,
    ];
    const answer = level === 1 ? makeChoices(r, names[win], [...names, '두 사람이 같아요']) : makeChoices(r, names[win], names);
    return { q: q.replace(/\s+/g, ' '), answer, steps };
  },
};

const e5a4Reduce: Skill = {
  id: 'word-reduce',
  title: '전체의 몇 분의 몇 (기약분수) 문장제',
  gen(r, level) {
    const nm = pickName(r);
    if (level === 1) {
      const t = r.int(0, 1);
      if (t === 0) {
        let n = 0,
          k = 0;
        for (;;) {
          n = r.int(20, 32);
          k = r.int(4, n - 4);
          if (gcd(n, k) > 1) break;
        }
        const what = r.pick(['안경을 썼습니다', '자전거를 탈 줄 압니다', '강아지를 키웁니다', '동생이 있습니다', '수영을 할 줄 압니다']);
        const f = new F(k, n);
        return {
          q: `${nm}네 반 학생 $${n}$ 명 중에서 $${k}$ 명이 ${what}. 이 학생들은 반 전체 학생의 몇 분의 몇인지 기약분수로 나타내세요.`,
          answer: fracAns(f, { mixed: false }),
          steps: [`(부분) $\\div$ (전체) $= \\frac{${k}}{${n}}$`, `분모와 분자를 최대공약수 $${gcd(n, k)}$ 로 나누어요.`, `$\\frac{${k}}{${n}} = ${ft(f)}$`],
        };
      }
      const n = r.pick([8, 10, 12, 16]);
      let k = 0;
      do k = r.int(2, n - 2);
      while (gcd(n, k) === 1);
      const f = new F(k, n);
      const food = r.pick(['피자', '케이크', '파이']);
      return {
        q: `${food} 한 판을 똑같이 $${n}$ 조각으로 나누었습니다. ${josa(nm, '이/가')} $${k}$ 조각을 먹었다면 ${nm}${jo(nm, '이/가')} 먹은 ${food}${jo(food, '은/는')} 한 판의 몇 분의 몇인지 기약분수로 나타내세요.`,
        answer: fracAns(f, { mixed: false }),
        steps: [`$${n}$ 조각 중 $${k}$ 조각 → $\\frac{${k}}{${n}}$`, `최대공약수 $${gcd(n, k)}$ 로 약분: $${ft(f)}$`],
      };
    }
    if (level === 2) {
      const t = r.int(0, 2);
      if (t === 0) {
        const m = r.pick([10, 12, 15, 20, 24, 25, 30, 35, 36, 40, 45, 48, 50]);
        const f = new F(m, 60);
        const act = r.pick(['줄넘기를 했습니다', '책을 읽었습니다', '피아노를 연습했습니다', '공원을 산책했습니다']);
        return {
          q: `${josa(nm, '은/는')} $${m}$ 분 동안 ${act}. $${m}$ 분은 몇 시간인지 기약분수로 나타내세요.`,
          answer: fracAns(f, { mixed: false, unit: '시간' }),
          steps: [`$1$ 시간 $= 60$ 분이므로 $${m}$ 분 $= \\frac{${m}}{60}$ 시간`, `최대공약수 $${gcd(m, 60)}$ 로 약분: $${ft(f)}$ 시간`],
        };
      }
      if (t === 1) {
        let c = 0;
        do c = r.int(5, 95);
        while (gcd(c, 100) === 1);
        const f = new F(c, 100);
        const it = r.pick(['리본', '끈', '색 테이프']);
        return {
          q: `${it} $${c}$ cm 는 몇 m 인지 기약분수로 나타내세요.`,
          answer: fracAns(f, { mixed: false, unit: 'm' }),
          steps: [`$1$ m $= 100$ cm 이므로 $${c}$ cm $= \\frac{${c}}{100}$ m`, `최대공약수 $${gcd(c, 100)}$ 로 약분: $${ft(f)}$ m`],
        };
      }
      const g = r.pick([125, 200, 250, 300, 375, 400, 450, 500, 600, 625, 750, 800, 875]);
      const f = new F(g, 1000);
      const it = r.pick(['밀가루', '설탕', '소금', '찰흙']);
      return {
        q: `${it} $${g}$ g 은 몇 kg 인지 기약분수로 나타내세요.`,
        answer: fracAns(f, { mixed: false, unit: 'kg' }),
        steps: [`$1$ kg $= 1000$ g 이므로 $${g}$ g $= \\frac{${g}}{1000}$ kg`, `최대공약수 $${gcd(g, 1000)}$ 로 약분: $${ft(f)}$ kg`],
      };
    }
    // 3단계: 남은 부분
    if (r.chance(0.5)) {
      let n = 0,
        a = 0,
        b = 0;
      for (;;) {
        n = r.int(8, 30) * 10;
        a = r.int(n / 10, n / 3);
        b = r.int(n / 10, n / 3);
        const rem = n - a - b;
        if (rem > 0 && gcd(rem, n) > 1 && a !== b) break;
      }
      const rem = n - a - b;
      const f = new F(rem, n);
      return {
        q: `${josa(nm, '은/는')} 전체가 $${n}$ 쪽인 책을 첫째 날에 $${a}$ 쪽, 둘째 날에 $${b}$ 쪽 읽었습니다. 아직 읽지 않은 쪽수는 책 전체의 몇 분의 몇인지 기약분수로 나타내세요.`,
        answer: fracAns(f, { mixed: false }),
        steps: [`남은 쪽수: $${n} - ${a} - ${b} = ${rem}$ (쪽)`, `$\\frac{${rem}}{${n}}$ 을 최대공약수 $${gcd(rem, n)}$ 로 약분`, `$${ft(f)}$`],
      };
    }
    let h1 = 0,
      h2 = 0;
    for (;;) {
      h1 = r.int(7, 10);
      h2 = r.int(5, 8);
      if (gcd(24 - h1 - h2, 24) > 1) break;
    }
    const rem = 24 - h1 - h2;
    const f = new F(rem, 24);
    return {
      q: `${josa(nm, '은/는')} 하루 중 $${h1}$ 시간은 잠을 자고, $${h2}$ 시간은 학교에서 보냅니다. 나머지 시간은 하루의 몇 분의 몇인지 기약분수로 나타내세요.`,
      answer: fracAns(f, { mixed: false }),
      steps: [`하루는 $24$ 시간 → 나머지: $24 - ${h1} - ${h2} = ${rem}$ (시간)`, `$\\frac{${rem}}{24}$ 를 최대공약수 $${gcd(rem, 24)}$ 로 약분`, `$${ft(f)}$`],
    };
  },
};

// ═════════ 5-1-5 분수의 덧셈과 뺄셈 ═════════
const e5a5Two: Skill = {
  id: 'word-two',
  title: '분수 덧셈·뺄셈 두 단계 문장제',
  gen(r, level) {
    const [n1, n2] = pickNames(r, 2);
    const t = r.int(0, 1);
    if (level === 1 && t === 0) {
      let a: F, b: F;
      for (;;) {
        [a, b] = twoFracs(r, 8, 24);
        if (a.add(b).cmp(1) < 0) break;
      }
      const rest = new F(1).sub(a).sub(b);
      const food = r.pick(['케이크', '피자', '수박', '빵']);
      return {
        q: `${josa(n1, '은/는')} ${food} 한 개의 $${ft(a)}$ 를, ${josa(n2, '은/는')} $${ft(b)}$ 를 먹었습니다. 남은 ${food}${jo(food, '은/는')} 전체의 몇 분의 몇인지 기약분수로 나타내세요.`,
        answer: fracAns(rest, { mixed: false }),
        steps: [`전체를 $1$ 로 보면 식: $1 - ${ft(a)} - ${ft(b)}$`, `먹은 양: $${ft(a)} + ${ft(b)} = ${ft(a.add(b))}$`, `$1 - ${ft(a.add(b))} = ${ft(rest)}$`],
      };
    }
    if (level === 1) {
      const [a, b] = twoFracs(r, 9, 36);
      const [c1, c2] = r.pick([
        ['빨간', '파란'],
        ['노란', '초록'],
      ]);
      const res = a.add(b);
      return {
        q: `${c1} 테이프의 길이는 $${ft(a)}$ m 이고, ${c2} 테이프는 ${c1} 테이프보다 $${ft(b)}$ m 더 깁니다. ${c2} 테이프는 몇 m 인지 기약분수로 나타내세요.`,
        answer: fracAns(res, { unit: 'm' }),
        steps: [`식: $${ft(a)} + ${ft(b)}$`, `통분: $${ft(a)} + ${ft(b)} = \\frac{${(a.n * lcm(a.d, b.d)) / a.d}}{${lcm(a.d, b.d)}} + \\frac{${(b.n * lcm(a.d, b.d)) / b.d}}{${lcm(a.d, b.d)}}$`, `$= ${mt(res)}$ (m)`],
      };
    }
    if (level === 2 && t === 0) {
      const [p, q] = twoFracs(r, 9, 36);
      const a = p.add(r.int(1, 4)),
        b = q.add(r.int(1, 3));
      let c = properFrac(r, 2, 8);
      while (lcm(lcm(a.d, b.d), c.d) > 48) c = properFrac(r, 2, 8);
      const res = a.add(b).sub(c);
      return {
        q: `길이가 $${mt(a)}$ m 인 색 테이프와 $${mt(b)}$ m 인 색 테이프를 $${ft(c)}$ m 가 겹치도록 이어 붙였습니다. 이어 붙인 색 테이프 전체의 길이는 몇 m 인지 기약분수로 나타내세요.`,
        answer: fracAns(res, { unit: 'm' }),
        steps: [`식: $${mt(a)} + ${mt(b)} - ${ft(c)}$ (겹친 부분은 한 번 빼요)`, `$${mt(a)} + ${mt(b)} = ${mt(a.add(b))}$`, `$${mt(a.add(b))} - ${ft(c)} = ${mt(res)}$ (m)`],
      };
    }
    if (level === 2) {
      let a: F, b: F;
      for (;;) {
        const [p, q] = twoFracs(r, 9, 36);
        a = p.add(r.int(1, 3));
        b = q;
        if (a.cmp(b) > 0) break;
      }
      const other = a.sub(b);
      const res = a.add(other);
      return {
        q: `${josa(n1, '은/는')} 물을 $${mt(a)}$ L 마셨고, ${josa(n2, '은/는')} ${n1}보다 $${ft(b)}$ L 적게 마셨습니다. 두 사람이 마신 물은 모두 몇 L 인지 기약분수로 나타내세요.`,
        answer: fracAns(res, { unit: 'L' }),
        steps: [`${n2}: $${mt(a)} - ${ft(b)} = ${mt(other)}$ (L)`, `모두: $${mt(a)} + ${mt(other)} = ${mt(res)}$ (L)`],
      };
    }
    // level 3
    if (t === 0) {
      let x: F, a: F;
      for (;;) {
        const [p, q] = twoFracs(r, 9, 36);
        x = p.add(r.int(3, 6));
        a = q.add(r.int(1, 2));
        if (x.cmp(a) > 0) break;
      }
      const addWrong = r.chance(0.5); // true: 더해야 하는데 뺐다
      const wrong = addWrong ? x.sub(a) : x.add(a);
      const right = addWrong ? x.add(a) : x.sub(a);
      return {
        q: `어떤 수${addWrong ? '에' : '에서'} $${mt(a)}$ 를 ${addWrong ? '더해야 할 것을 잘못하여 뺐더니' : '빼야 할 것을 잘못하여 더했더니'} $${mt(wrong)}$ 가 되었습니다. 바르게 계산한 값을 기약분수로 나타내세요.`,
        answer: fracAns(right),
        steps: [
          addWrong ? `어떤 수: $${mt(wrong)} + ${mt(a)} = ${mt(x)}$` : `어떤 수: $${mt(wrong)} - ${mt(a)} = ${mt(x)}$`,
          addWrong ? `바른 계산: $${mt(x)} + ${mt(a)} = ${mt(right)}$` : `바른 계산: $${mt(x)} - ${mt(a)} = ${mt(right)}$`,
        ],
        hint: '잘못 계산한 과정을 거꾸로 하여 어떤 수부터 구해요.',
      };
    }
    const [p, q] = twoFracs(r, 8, 24);
    const a = p.add(r.int(1, 3)),
      b = q.add(r.int(1, 3)),
      d = properFrac(r, 2, 6).add(1);
    const c = new F(1, r.pick([2, 3, 4, 5, 6]));
    const sum = a.add(b).add(d);
    const res = sum.sub(c.mul(2));
    return {
      q: `길이가 각각 $${mt(a)}$ m, $${mt(b)}$ m, $${mt(d)}$ m 인 색 테이프 $3$ 장을 $${ft(c)}$ m 씩 겹치도록 한 줄로 이어 붙였습니다. 이어 붙인 색 테이프 전체의 길이는 몇 m 인지 기약분수로 나타내세요.`,
      answer: fracAns(res, { unit: 'm' }),
      steps: [`$3$ 장을 한 줄로 이으면 겹친 곳은 $2$ 군데`, `세 장의 합: $${mt(a)} + ${mt(b)} + ${mt(d)} = ${mt(sum)}$`, `겹친 길이: $${ft(c)} + ${ft(c)} = ${ft(c.mul(2))}$`, `$${mt(sum)} - ${ft(c.mul(2))} = ${mt(res)}$ (m)`],
    };
  },
};

// ═════════ 5-1-6 다각형의 둘레와 넓이 ═════════
function roadFig(w: number, h: number): string {
  const W = 220,
    H = 150;
  const s = new Svg(W, H);
  const x0 = 30,
    y0 = 15,
    bw = 160,
    bh = 110;
  s.rect(x0, y0, bw, bh, { cls: 'acc' });
  s.rect(x0 + bw * 0.55, y0, 14, bh, { cls: 'muted', fill: true });
  s.rect(x0, y0 + bh * 0.4, bw, 14, { cls: 'muted', fill: true });
  s.text(x0 + bw / 2, y0 + bh + 18, `${w} m`, { size: 13 });
  s.text(x0 - 6, y0 + bh / 2 + 4, `${h} m`, { size: 13, anchor: 'end' });
  return s.toString();
}

const SHAPES = ['평행사변형', '삼각형', '마름모', '사다리꼴'] as const;
function shapeArea(r: Rng, place: string): { desc: string; area: number; steps: string[] } {
  const sh = r.pick(SHAPES);
  if (sh === '평행사변형') {
    const a = r.int(4, 20),
      h = r.int(3, 15);
    return { desc: `밑변의 길이가 $${a}$ m, 높이가 $${h}$ m 인 평행사변형 모양 ${place}`, area: a * h, steps: [`(밑변) $\\times$ (높이)`, `$${a} \\times ${h} = ${a * h}$ (m²)`] };
  }
  if (sh === '삼각형') {
    let a = 0,
      h = 0;
    do {
      a = r.int(4, 24);
      h = r.int(3, 18);
    } while ((a * h) % 2);
    return { desc: `밑변의 길이가 $${a}$ m, 높이가 $${h}$ m 인 삼각형 모양 ${place}`, area: (a * h) / 2, steps: [`(밑변) $\\times$ (높이) $\\div 2$`, `$${a} \\times ${h} \\div 2 = ${(a * h) / 2}$ (m²)`] };
  }
  if (sh === '마름모') {
    let a = 0,
      b = 0;
    do {
      a = r.int(4, 20);
      b = r.int(4, 20);
    } while ((a * b) % 2 || a === b);
    return { desc: `두 대각선의 길이가 각각 $${a}$ m, $${b}$ m 인 마름모 모양 ${place}`, area: (a * b) / 2, steps: [`(한 대각선) $\\times$ (다른 대각선) $\\div 2$`, `$${a} \\times ${b} \\div 2 = ${(a * b) / 2}$ (m²)`] };
  }
  let a = 0,
    b = 0,
    h = 0;
  do {
    a = r.int(3, 12);
    b = r.int(a + 2, 20);
    h = r.int(3, 12);
  } while (((a + b) * h) % 2);
  return {
    desc: `윗변이 $${a}$ m, 아랫변이 $${b}$ m, 높이가 $${h}$ m 인 사다리꼴 모양 ${place}`,
    area: ((a + b) * h) / 2,
    steps: [`((윗변) $+$ (아랫변)) $\\times$ (높이) $\\div 2$`, `$(${a} + ${b}) \\times ${h} \\div 2 = ${((a + b) * h) / 2}$ (m²)`],
  };
}

const e5a6Area: Skill = {
  id: 'word-area',
  title: '넓이 실생활 문장제',
  gen(r, level) {
    const place = r.pick(['밭', '화단', '땅', '텃밭', '꽃밭']);
    if (level === 1) {
      if (r.chance(0.5)) {
        const a = r.int(3, 15),
          b = r.int(2, 12);
        return {
          q: `가로가 $${a}$ m, 세로가 $${b}$ m 인 직사각형 모양 ${place}의 넓이는 몇 m² 인가요?`,
          answer: intAns(a * b, 'm²'),
          steps: [`(가로) $\\times$ (세로)`, `$${a} \\times ${b} = ${a * b}$ (m²)`],
        };
      }
      const a = r.int(3, 15);
      return {
        q: `한 변의 길이가 $${a}$ m 인 정사각형 모양 ${place}의 넓이는 몇 m² 인가요?`,
        answer: intAns(a * a, 'm²'),
        steps: [`(한 변) $\\times$ (한 변)`, `$${a} \\times ${a} = ${a * a}$ (m²)`],
      };
    }
    if (level === 2) {
      const s = shapeArea(r, place);
      return { q: `${s.desc}의 넓이는 몇 m² 인가요?`, answer: intAns(s.area, 'm²'), steps: s.steps };
    }
    if (r.chance(0.5)) {
      const w = r.int(1, 3),
        a = r.int(8, 25),
        b = r.int(6, 20);
      const A = (a - w) * (b - w);
      return {
        q: `가로가 $${a}$ m, 세로가 $${b}$ m 인 직사각형 모양 ${place}에 그림과 같이 폭이 $${w}$ m 인 길을 가로와 세로로 하나씩 수직으로 냈습니다. 길을 뺀 나머지 ${place}의 넓이는 몇 m² 인가요?`,
        fig: roadFig(a, b),
        answer: intAns(A, 'm²'),
        steps: [`길을 가장자리로 옮겨 붙여도 남은 넓이는 같아요.`, `남은 부분: 가로 $${a} - ${w} = ${a - w}$ (m), 세로 $${b} - ${w} = ${b - w}$ (m)`, `$${a - w} \\times ${b - w} = ${A}$ (m²)`],
        hint: '길을 한쪽 끝으로 모으면 남은 땅이 하나의 직사각형이 돼요.',
      };
    }
    const s = shapeArea(r, place);
    const p = r.pick([2000, 3000, 4000, 5000]);
    const item = r.pick(['잔디', '꽃모종', '자갈']);
    return {
      q: `${s.desc}에 ${josa(item, '을/를')} 깔려고 합니다. $1$ m² 에 ${item}${jo(item, '을/를')} 까는 데 $${comma(p)}$ 원이 든다면, ${place} 전체에 까는 데 드는 돈은 얼마인가요?`,
      answer: intAns(s.area * p, '원'),
      steps: [...s.steps, `$${s.area} \\times ${comma(p)} = ${comma(s.area * p)}$ (원)`],
    };
  },
};

const e5a6Perim: Skill = {
  id: 'word-perimeter',
  title: '둘레 실생활 문장제',
  gen(r, level) {
    const t = r.int(0, 1);
    if (level === 1 && t === 0) {
      const a = r.int(4, 20),
        b = r.int(3, 15);
      const place = r.pick(['화단', '텃밭', '수영장', '운동장']);
      return {
        q: `가로가 $${a}$ m, 세로가 $${b}$ m 인 직사각형 모양 ${place}의 둘레에 울타리를 치려고 합니다. 울타리는 모두 몇 m 필요한가요?`,
        answer: intAns(2 * (a + b), 'm'),
        steps: [`(직사각형의 둘레) $=$ ((가로) $+$ (세로)) $\\times 2$`, `$(${a} + ${b}) \\times 2 = ${2 * (a + b)}$ (m)`],
      };
    }
    if (level === 1) {
      const n = r.int(3, 8),
        a = r.int(5, 30);
      const it = r.pick(['표지판', '타일', '탁자', '액자']);
      return {
        q: `한 변의 길이가 $${a}$ cm 인 정${POLY[n]}형 모양 ${it}${jo(it, '이/가')} 있습니다. 이 ${it}의 둘레는 몇 cm 인가요?`,
        answer: intAns(n * a, 'cm'),
        steps: [`정${POLY[n]}형은 변이 $${n}$ 개이고 길이가 모두 같아요.`, `$${a} \\times ${n} = ${n * a}$ (cm)`],
      };
    }
    if (level === 2 && t === 0) {
      const a = r.int(6, 25),
        b = r.int(3, 20);
      const P = 2 * (a + b);
      return {
        q: `둘레가 $${P}$ m 인 직사각형 모양 텃밭이 있습니다. 가로가 $${a}$ m 라면 세로는 몇 m 인가요?`,
        answer: intAns(b, 'm'),
        steps: [`(가로) $+$ (세로) $=$ (둘레) $\\div 2 = ${P} \\div 2 = ${P / 2}$ (m)`, `세로: $${P / 2} - ${a} = ${b}$ (m)`],
      };
    }
    if (level === 2) {
      const n = r.int(3, 8),
        s = r.int(4, 25);
      return {
        q: `길이가 $${n * s}$ cm 인 끈을 겹치지 않게 모두 사용하여 정${POLY[n]}형 하나를 만들었습니다. 이 정${POLY[n]}형의 한 변의 길이는 몇 cm 인가요?`,
        answer: intAns(s, 'cm'),
        steps: [`정${POLY[n]}형의 변은 $${n}$ 개로 길이가 모두 같아요.`, `$${n * s} \\div ${n} = ${s}$ (cm)`],
      };
    }
    if (t === 0) {
      let a = 0,
        b = 0;
      do {
        a = r.int(8, 30);
        b = r.int(4, 20);
      } while ((a + b) % 2 || a === b);
      const P = 2 * (a + b),
        s = (a + b) / 2;
      return {
        q: `철사를 겹치지 않게 모두 사용하여 가로 $${a}$ cm, 세로 $${b}$ cm 인 직사각형을 만들었습니다. 이 철사를 다시 펴서 겹치지 않게 모두 사용하여 정사각형을 만들면 정사각형의 넓이는 몇 cm² 인가요?`,
        answer: intAns(s * s, 'cm²'),
        steps: [`철사의 길이: $(${a} + ${b}) \\times 2 = ${P}$ (cm)`, `정사각형의 한 변: $${P} \\div 4 = ${s}$ (cm)`, `넓이: $${s} \\times ${s} = ${s * s}$ (cm²)`],
      };
    }
    const b = r.int(4, 15),
      d = r.int(2, 9);
    const a = b + d;
    const P = 2 * (a + b);
    return {
      q: `둘레가 $${P}$ cm 인 직사각형이 있습니다. 가로가 세로보다 $${d}$ cm 더 길 때, 이 직사각형의 넓이는 몇 cm² 인가요?`,
      answer: intAns(a * b, 'cm²'),
      steps: [`(가로) $+$ (세로) $= ${P} \\div 2 = ${P / 2}$`, `세로: $(${P / 2} - ${d}) \\div 2 = ${b}$ (cm), 가로: $${b} + ${d} = ${a}$ (cm)`, `넓이: $${a} \\times ${b} = ${a * b}$ (cm²)`],
    };
  },
};

// ═════════ 5-2-1 수의 범위와 어림하기 ═════════
const e5b1Range: Skill = {
  id: 'word-range',
  title: '수의 범위 활용 문장제',
  gen(r, level): ProblemDraft {
    if (level === 1) {
      const L = r.pick([120, 125, 130, 135, 140]);
      const kind = r.pick(['이상', '초과', '미만', '이하'] as const);
      const ns = pickNames(r, 6);
      const hs = ns.map(() => L + r.int(-9, 9));
      hs[r.int(0, 5)] = L; // 경계값 하나는 꼭
      const ok = (h: number) => (kind === '이상' ? h >= L : kind === '초과' ? h > L : kind === '미만' ? h < L : h <= L);
      const pass = ns.filter((_, i) => ok(hs[i]));
      if (pass.length === 0) return e5b1Range.gen(r, level);
      return {
        q: `키가 $${L}$ cm ${kind}인 어린이만 탈 수 있는 놀이 기구가 있습니다. 다음 어린이 중에서 이 놀이 기구를 탈 수 있는 어린이는 몇 명인가요?`,
        table: [['이름', ...ns], ['키(cm)', ...hs.map((h) => `$${h}$`)]],
        answer: intAns(pass.length, '명'),
        steps: [
          `$${L}$ cm ${josa(kind, '은/는')} $${L}$ 을 ${kind === '이상' || kind === '이하' ? '포함해요.' : '포함하지 않아요.'}`,
          `탈 수 있는 어린이: ${pass.join(', ')}`,
          `$${pass.length}$ 명`,
        ],
      };
    }
    if (level === 2) {
      if (r.chance(0.5)) {
        const fees = [4000, 5000, 7000];
        const fee = (w: number) => (w <= 2 ? fees[0] : w <= 5 ? fees[1] : fees[2]);
        const pickW = () => r.pick([1, 1.5, 2, 2, 2.4, 3, 4.5, 5, 5, 5.2, 6, 7.5, 8, 10]);
        const w1 = pickW();
        let w2 = pickW();
        while (w2 === w1) w2 = pickW();
        const tot = fee(w1) + fee(w2);
        return {
          q: `무게에 따른 택배 요금표입니다. 무게가 $${dt(w1)}$ kg 인 상자와 $${dt(w2)}$ kg 인 상자를 하나씩 보낼 때, 요금은 모두 얼마인가요?`,
          table: [
            ['무게', '$2$ kg 이하', '$2$ kg 초과 $5$ kg 이하', '$5$ kg 초과 $10$ kg 이하'],
            ['요금(원)', ...fees.map((f) => `$${comma(f)}$`)],
          ],
          answer: intAns(tot, '원'),
          steps: [`$${dt(w1)}$ kg → $${comma(fee(w1))}$ 원, $${dt(w2)}$ kg → $${comma(fee(w2))}$ 원`, `$${comma(fee(w1))} + ${comma(fee(w2))} = ${comma(tot)}$ (원)`],
          hint: '경계의 수가 이하에 포함되는지, 초과에 포함되는지 확인해요.',
        };
      }
      const nm = pickName(r);
      const fee = (a: number) => (a <= 7 ? 0 : a <= 13 ? 1500 : a <= 19 ? 2000 : 3000);
      const ages = [r.int(35, 48), r.int(35, 48)];
      const kids = r.int(2, 3);
      for (let i = 0; i < kids; i++) ages.push(r.pick([5, 7, 8, 10, 12, 13, 14, 16, 19]));
      const tot = ages.reduce((s, a) => s + fee(a), 0);
      return {
        q: `어느 박물관의 입장료표입니다. ${nm}네 가족의 나이가 ${ages.map((a) => `$${a}$ 세`).join(', ')}일 때, 가족 모두의 입장료는 얼마인가요?`,
        table: [
          ['나이', '$7$ 세 이하', '$8$ 세 이상 $13$ 세 이하', '$14$ 세 이상 $19$ 세 이하', '$20$ 세 이상'],
          ['입장료(원)', '무료', '$1{,}500$', '$2{,}000$', '$3{,}000$'],
        ],
        answer: intAns(tot, '원'),
        steps: [`각 사람: ${ages.map((a) => `$${a}$ 세 → $${comma(fee(a))}$`).join(', ')}`, `합: $${ages.map((a) => comma(fee(a))).join(' + ')} = ${comma(tot)}$ (원)`],
      };
    }
    const t = r.int(0, 2);
    if (t === 0) {
      const c = r.pick([25, 30, 35, 40, 45]),
        k = r.int(3, 7);
      return {
        q: `한 대에 $${c}$ 명까지 탈 수 있는 버스에 학생들이 모두 타려면 버스가 적어도 $${k}$ 대 필요합니다. 학생 수가 될 수 있는 가장 많은 수와 가장 적은 수를 각각 구하세요.`,
        answer: { type: 'fields', fields: [{ label: '가장 많은 수', value: c * k, unit: '명' }, { label: '가장 적은 수', value: c * (k - 1) + 1, unit: '명' }] },
        steps: [`버스 $${k - 1}$ 대로는 부족하고 $${k}$ 대면 모두 탈 수 있어요.`, `$${c} \\times ${k - 1} = ${c * (k - 1)}$ 명 초과, $${c} \\times ${k} = ${c * k}$ 명 이하`, `가장 많은 수 $${c * k}$ 명, 가장 적은 수 $${c * (k - 1) + 1}$ 명`],
      };
    }
    if (t === 1) {
      const X = r.int(12, 49) * 100;
      return {
        q: `어느 마을의 사람 수를 반올림하여 백의 자리까지 나타내면 $${comma(X)}$ 명입니다. 이 마을의 사람 수가 될 수 있는 가장 많은 수와 가장 적은 수를 각각 구하세요.`,
        answer: { type: 'fields', fields: [{ label: '가장 많은 수', value: X + 49, unit: '명' }, { label: '가장 적은 수', value: X - 50, unit: '명' }] },
        steps: [`십의 자리에서 반올림해요: $${comma(X - 50)}$ 이상 $${comma(X + 50)}$ 미만`, `가장 많은 수 $${comma(X + 49)}$ 명, 가장 적은 수 $${comma(X - 50)}$ 명`],
      };
    }
    const n = r.int(12, 40);
    const fr = r.pick(['귤', '사과', '달걀']);
    return {
      q: `${fr}${jo(fr, '을/를')} 한 상자에 $10$ 개씩 담았더니 $${n}$ 상자가 되었고, 상자에 담고 남은 ${fr}${jo(fr, '은/는')} $10$ 개보다 적었습니다. (남은 ${fr}${jo(fr, '이/가')} 없을 수도 있습니다.) 처음 ${fr}의 수가 될 수 있는 가장 많은 수와 가장 적은 수를 각각 구하세요.`,
      answer: { type: 'fields', fields: [{ label: '가장 많은 수', value: 10 * n + 9, unit: '개' }, { label: '가장 적은 수', value: 10 * n, unit: '개' }] },
      steps: [`버림하여 십의 자리까지 나타내면 $${10 * n}$ 인 수예요.`, `$${10 * n}$ 이상 $${10 * n + 9}$ 이하`, `가장 많은 수 $${10 * n + 9}$ 개, 가장 적은 수 $${10 * n}$ 개`],
    };
  },
};

// ═════════ 5-2-2 분수의 곱셈 ═════════
const e5b2Two: Skill = {
  id: 'word-two',
  title: '분수의 곱셈 활용 (넓이·두 단계)',
  gen(r, level) {
    const t = r.int(0, 1);
    if (level === 1 && t === 0) {
      const [a, b] = twoFracs(r, 9, 90);
      const res = a.mul(b);
      return {
        q: `가로가 $${ft(a)}$ m, 세로가 $${ft(b)}$ m 인 직사각형 모양 종이의 넓이는 몇 m² 인지 기약분수로 나타내세요.`,
        answer: fracAns(res, { unit: 'm²', mixed: false }),
        steps: [`식: $${ft(a)} \\times ${ft(b)}$`, `$= \\frac{${a.n} \\times ${b.n}}{${a.d} \\times ${b.d}} = ${ft(res)}$ (m²)`],
      };
    }
    if (level === 1) {
      const a = properFrac(r, 2, 9);
      const it = r.pick(['손수건', '색종이', '타일']);
      const res = a.mul(a);
      return {
        q: `한 변의 길이가 $${ft(a)}$ m 인 정사각형 모양 ${it}의 넓이는 몇 m² 인가요?`,
        answer: fracAns(res, { unit: 'm²', mixed: false }),
        steps: [`식: $${ft(a)} \\times ${ft(a)}$`, `$= ${ft(res)}$ (m²)`],
      };
    }
    if (level === 2 && t === 0) {
      const [p, q] = twoFracs(r, 6, 30);
      const a = p.add(r.int(1, 3)),
        b = q.add(r.int(1, 4));
      const res = a.mul(b);
      const it = r.pick(['철근', '나무 막대', '쇠파이프']);
      return {
        q: `$1$ m 의 무게가 $${mt(a)}$ kg 인 ${it}${jo(it, '이/가')} 있습니다. 이 ${it} $${mt(b)}$ m 의 무게는 몇 kg 인지 기약분수로 나타내세요.`,
        answer: fracAns(res, { unit: 'kg' }),
        steps: [`식: $${mt(a)} \\times ${mt(b)}$`, `가분수로: $${ft(a)} \\times ${ft(b)}$`, `$= ${fm(res)}$ (kg)`],
      };
    }
    if (level === 2) {
      const [p, q] = twoFracs(r, 6, 30);
      const a = p.add(r.int(2, 5)),
        b = q.add(r.int(1, 4));
      const res = a.mul(b);
      return {
        q: `가로가 $${mt(a)}$ m, 세로가 $${mt(b)}$ m 인 직사각형 모양 텃밭의 넓이는 몇 m² 인지 기약분수로 나타내세요.`,
        answer: fracAns(res, { unit: 'm²' }),
        steps: [`식: $${mt(a)} \\times ${mt(b)} = ${ft(a)} \\times ${ft(b)}$`, `$= ${fm(res)}$ (m²)`],
      };
    }
    if (t === 0) {
      const d = r.int(3, 5),
        n = r.int(1, d - 1);
      const k = new F(n, d);
      const h = r.int(1, 2) * d * d;
      const h1 = k.mul(h),
        h2 = h1.mul(k);
      return {
        q: `어떤 공은 떨어진 높이의 $${ft(k)}$ 만큼 튀어 오릅니다. 이 공을 $${h}$ m 높이에서 떨어뜨렸을 때, 두 번째로 튀어 오른 높이는 몇 m 인지 기약분수로 나타내세요.`,
        answer: fracAns(h2, { unit: 'm' }),
        steps: [`첫 번째: $${h} \\times ${ft(k)} = ${mt(h1)}$ (m)`, `두 번째: $${mt(h1)} \\times ${ft(k)} = ${mt(h2)}$ (m)`],
        hint: '두 번째로 튀어 오른 높이는 첫 번째로 튀어 오른 높이의 몇 분의 몇인지 생각해요.',
      };
    }
    const a = r.int(4, 12),
      b = properFrac(r, 2, 5).add(r.int(2, 6));
    const c = properFrac(r, 2, 8);
    const veg = r.pick(['고추', '상추', '토마토', '감자']);
    const area = b.mul(a);
    const res = area.mul(c);
    return {
      q: `가로가 $${a}$ m, 세로가 $${mt(b)}$ m 인 직사각형 모양 밭의 $${ft(c)}$ 에 ${josa(veg, '을/를')} 심었습니다. ${josa(veg, '을/를')} 심은 밭의 넓이는 몇 m² 인지 기약분수로 나타내세요.`,
      answer: fracAns(res, { unit: 'm²' }),
      steps: [`밭의 넓이: $${a} \\times ${mt(b)} = ${mt(area)}$ (m²)`, `${veg}: $${mt(area)} \\times ${ft(c)} = ${mt(res)}$ (m²)`],
    };
  },
};

// ═════════ 5-2-4 소수의 곱셈 ═════════
const MIN: [number, number][] = [
  [6, 0.1],
  [12, 0.2],
  [15, 0.25],
  [18, 0.3],
  [24, 0.4],
  [30, 0.5],
  [36, 0.6],
  [42, 0.7],
  [45, 0.75],
  [48, 0.8],
  [54, 0.9],
];
const e5b4Two: Skill = {
  id: 'word-two',
  title: '소수의 곱셈 활용 (두 단계)',
  gen(r, level) {
    const nm = pickName(r);
    const t = r.int(0, 1);
    if (level === 1 && t === 0) {
      const a = mkDec(r.int(85, 160), 1),
        b = r.int(3, 20);
      const res = round(a * b, 8);
      return {
        q: `휘발유 $1$ L 로 $${dt(a)}$ km 를 가는 자동차가 있습니다. 이 자동차가 휘발유 $${b}$ L 로 갈 수 있는 거리는 몇 km 인가요?`,
        answer: decAns(res, 'km'),
        steps: [`식: $${dt(a)} \\times ${b}$`, `$= ${dt(res)}$ (km)`],
      };
    }
    if (level === 1) {
      const a = r.pick([0.15, 0.2, 0.25, 0.3, 0.35, 0.4]),
        n = r.int(3, 12);
      const res = round(a * n, 8);
      const what = r.pick(['우유', '주스', '두유']);
      return {
        q: `${josa(nm, '은/는')} 매일 ${what} $${dt(a)}$ L 씩 마십니다. $${n}$ 일 동안 마신 ${what}${jo(what, '은/는')} 모두 몇 L 인가요?`,
        answer: decAns(res, 'L'),
        steps: [`식: $${dt(a)} \\times ${n}$`, `$= ${dt(res)}$ (L)`],
      };
    }
    if (level === 2 && t === 0) {
      const a = mkDec(r.int(105, 480), 2),
        b = mkDec(r.int(15, 95), 1);
      const res = round(a * b, 8);
      const it = r.pick(['철근', '쇠막대', '구리선']);
      return {
        q: `$1$ m 의 무게가 $${dt(a)}$ kg 인 ${it}${jo(it, '이/가')} 있습니다. 이 ${it} $${dt(b)}$ m 의 무게는 몇 kg 인가요?`,
        answer: decAns(res, 'kg'),
        steps: [`식: $${dt(a)} \\times ${dt(b)}$`, `소수점 아래 자릿수 $2 + 1 = 3$ 자리`, `$= ${dt(res)}$ (kg)`],
      };
    }
    if (level === 2) {
      const a = mkDec(r.int(300, 450), 1),
        b = r.pick([1.5, 1.6, 1.8, 1.9, 2.1, 1.75]);
      const res = round(a * b, 8);
      return {
        q: `${nm}의 몸무게는 $${dt(a)}$ kg 이고, 아버지의 몸무게는 ${nm} 몸무게의 $${dt(b)}$ 배입니다. 아버지의 몸무게는 몇 kg 인가요?`,
        answer: decAns(res, 'kg'),
        steps: [`식: $${dt(a)} \\times ${dt(b)}$`, `$= ${dt(res)}$ (kg)`],
      };
    }
    const k = r.int(0, 2);
    if (k === 0) {
      const m = r.int(40, 60),
        p = r.pick([0.6, 0.7, 0.8, 0.9]),
        s = r.pick([0.5, 0.6, 0.75, 0.8]);
      const me = round(m * p, 8),
        sib = round(me * s, 8);
      return {
        q: `어머니의 몸무게는 $${m}$ kg 입니다. ${nm}의 몸무게는 어머니 몸무게의 $${dt(p)}$ 배이고, 동생의 몸무게는 ${nm} 몸무게의 $${dt(s)}$ 배입니다. 동생의 몸무게는 몇 kg 인가요?`,
        answer: decAns(sib, 'kg'),
        steps: [`${nm}: $${m} \\times ${dt(p)} = ${dt(me)}$ (kg)`, `동생: $${dt(me)} \\times ${dt(s)} = ${dt(sib)}$ (kg)`],
      };
    }
    if (k === 1) {
      const sp = mkDec(r.int(85, 180), 1),
        h = r.int(1, 2);
      const [mm, md] = r.pick(MIN);
      const T = round(h + md, 8);
      const res = round(sp * T, 8);
      return {
        q: `한 시간에 $${dt(sp)}$ km 를 가는 자전거가 있습니다. 같은 빠르기로 $${h}$ 시간 $${mm}$ 분 동안 간다면 몇 km 를 갈 수 있나요?`,
        answer: decAns(res, 'km'),
        steps: [`$${mm}$ 분 $= \\frac{${mm}}{60}$ 시간 $= ${dt(md)}$ 시간 → $${h}$ 시간 $${mm}$ 분 $= ${dt(T)}$ 시간`, `식: $${dt(sp)} \\times ${dt(T)}$`, `$= ${dt(res)}$ (km)`],
      };
    }
    const a = mkDec(r.int(25, 60), 1),
      b = mkDec(r.int(18, 35), 1),
      c = r.pick([0.2, 0.25, 0.3, 0.4, 0.15]);
    const A = round(a * b, 8),
      res = round(A * c, 8);
    return {
      q: `벽 $1$ m² 를 칠하는 데 페인트가 $${dt(c)}$ L 필요합니다. 가로 $${dt(a)}$ m, 세로 $${dt(b)}$ m 인 직사각형 모양 벽을 모두 칠하려면 페인트는 몇 L 필요한가요?`,
      answer: decAns(res, 'L'),
      steps: [`벽의 넓이: $${dt(a)} \\times ${dt(b)} = ${dt(A)}$ (m²)`, `페인트: $${dt(A)} \\times ${dt(c)} = ${dt(res)}$ (L)`],
    };
  },
};

// ═════════ 5-2-5 직육면체 ═════════
const e5b5Wire: Skill = {
  id: 'word-wire',
  title: '철사로 직육면체 만들기',
  gen(r, level) {
    const t = r.int(0, 1);
    if (level === 1 && t === 0) {
      const a = r.int(3, 15);
      return {
        q: `철사로 한 모서리의 길이가 $${a}$ cm 인 정육면체 모양을 만들려고 합니다. 필요한 철사는 적어도 몇 cm 인가요?`,
        answer: intAns(12 * a, 'cm'),
        steps: [`정육면체의 모서리는 $12$ 개이고 길이가 모두 같아요.`, `$${a} \\times 12 = ${12 * a}$ (cm)`],
      };
    }
    const a = r.int(4, level === 1 ? 12 : 25),
      b = r.int(3, level === 1 ? 10 : 20),
      c = r.int(2, level === 1 ? 10 : 18);
    const S = 4 * (a + b + c);
    const fig = cuboidFig(a, b, c, { labels: [`${a} cm`, `${b} cm`, `${c} cm`] });
    if (level === 1 || (level === 2 && t === 0)) {
      return {
        q: `철사로 그림과 같은 직육면체 모양을 만들려고 합니다. 필요한 철사는 적어도 몇 cm 인가요?`,
        fig,
        answer: intAns(S, 'cm'),
        steps: [`길이가 같은 모서리가 $4$ 개씩 $3$ 쌍 있어요.`, `$(${a} + ${b} + ${c}) \\times 4 = ${S}$ (cm)`],
      };
    }
    if (level === 2) {
      const s = r.int(4, 20);
      return {
        q: `철사 $${12 * s}$ cm 를 겹치지 않게 모두 사용하여 정육면체 모양을 하나 만들었습니다. 이 정육면체의 한 모서리의 길이는 몇 cm 인가요?`,
        answer: intAns(s, 'cm'),
        steps: [`정육면체의 모서리는 $12$ 개`, `$${12 * s} \\div 12 = ${s}$ (cm)`],
      };
    }
    if (t === 0) {
      const L = Math.ceil((S + 10) / 50) * 50;
      const Lm = L / 100;
      return {
        q: `길이가 $${dt(Lm)}$ m 인 철사로 가로 $${a}$ cm, 세로 $${b}$ cm, 높이 $${c}$ cm 인 직육면체 모양을 하나 만들었습니다. 남은 철사는 몇 cm 인가요?`,
        answer: intAns(L - S, 'cm'),
        steps: [`$${dt(Lm)}$ m $= ${L}$ cm`, `사용한 철사: $(${a} + ${b} + ${c}) \\times 4 = ${S}$ (cm)`, `남은 철사: $${L} - ${S} = ${L - S}$ (cm)`],
      };
    }
    return {
      q: `모든 모서리의 길이의 합이 $${S}$ cm 인 직육면체가 있습니다. 이 직육면체의 가로가 $${a}$ cm, 세로가 $${b}$ cm 일 때, 높이는 몇 cm 인가요?`,
      answer: intAns(c, 'cm'),
      steps: [`(가로) $+$ (세로) $+$ (높이) $= ${S} \\div 4 = ${S / 4}$ (cm)`, `높이: $${S / 4} - ${a} - ${b} = ${c}$ (cm)`],
    };
  },
};

const RIB = '상자의 윗면과 아랫면에서 리본이 십자 모양이 되도록, 가로 방향으로 한 바퀴, 세로 방향으로 한 바퀴 둘러 묶었습니다';
const e5b5Ribbon: Skill = {
  id: 'word-ribbon',
  title: '상자를 리본으로 묶기',
  gen(r, level) {
    if (level === 1) {
      const a = r.int(5, 20);
      return {
        q: `한 모서리의 길이가 $${a}$ cm 인 정육면체 모양 상자를 ${RIB}. 사용한 리본은 몇 cm 인가요? (매듭에 쓴 리본은 생각하지 않습니다.)`,
        fig: cuboidFig(a, a, a, { labels: [`${a} cm`, null, null] }),
        answer: intAns(8 * a, 'cm'),
        steps: [`한 바퀴를 두르면 모서리 $4$ 개 길이만큼 → 두 바퀴면 $8$ 개`, `$${a} \\times 8 = ${8 * a}$ (cm)`],
      };
    }
    const a = r.int(10, 30),
      b = r.int(8, 25),
      c = r.int(5, 15);
    const k = r.int(3, 8) * 5;
    const used = 2 * a + 2 * b + 4 * c;
    const fig = cuboidFig(a, b, c, { labels: [`${a} cm`, `${b} cm`, `${c} cm`] });
    const base = [`가로 방향 한 바퀴: $(${a} + ${c}) \\times 2 = ${2 * (a + c)}$ (cm)`, `세로 방향 한 바퀴: $(${b} + ${c}) \\times 2 = ${2 * (b + c)}$ (cm)`];
    if (level === 2) {
      return {
        q: `가로 $${a}$ cm, 세로 $${b}$ cm, 높이 $${c}$ cm 인 직육면체 모양 상자를 ${RIB}. 매듭을 짓는 데 리본 $${k}$ cm 를 사용했다면, 사용한 리본은 모두 몇 cm 인가요?`,
        fig,
        answer: intAns(used + k, 'cm'),
        steps: [...base, `모두: $${2 * (a + c)} + ${2 * (b + c)} + ${k} = ${used + k}$ (cm)`],
      };
    }
    if (r.chance(0.5)) {
      const L = Math.ceil((used + k + 10) / 50) * 50;
      return {
        q: `리본 $${dt(L / 100)}$ m 로 가로 $${a}$ cm, 세로 $${b}$ cm, 높이 $${c}$ cm 인 직육면체 모양 상자를 ${RIB}. 매듭을 짓는 데 $${k}$ cm 를 사용했다면 남은 리본은 몇 cm 인가요?`,
        fig,
        answer: intAns(L - used - k, 'cm'),
        steps: [`$${dt(L / 100)}$ m $= ${L}$ cm`, ...base, `남은 리본: $${L} - (${2 * (a + c)} + ${2 * (b + c)} + ${k}) = ${L - used - k}$ (cm)`],
      };
    }
    return {
      q: `가로 $${a}$ cm, 세로 $${b}$ cm 인 직육면체 모양 상자를 ${RIB}. 매듭에 쓴 $${k}$ cm 를 포함하여 리본을 모두 $${used + k}$ cm 사용했다면, 상자의 높이는 몇 cm 인가요?`,
      answer: intAns(c, 'cm'),
      steps: [`리본은 가로 $2$ 번, 세로 $2$ 번, 높이 $4$ 번을 지나요.`, `높이 $4$ 번의 길이: $${used + k} - ${k} - ${a} \\times 2 - ${b} \\times 2 = ${4 * c}$ (cm)`, `높이: $${4 * c} \\div 4 = ${c}$ (cm)`],
    };
  },
};

// ═════════ 5-2-6 평균과 가능성 ═════════
const e5b6Mean: Skill = {
  id: 'word-mean',
  title: '평균 활용 문장제',
  gen(r, level) {
    const nm = pickName(r);
    if (level === 1) {
      if (r.chance(0.5)) {
        const avg = r.int(12, 40),
          n = r.pick([5, 6, 7]);
        return {
          q: `${josa(nm, '은/는')} 하루에 평균 $${avg}$ 쪽씩 책을 읽었습니다. $${n}$ 일 동안 읽은 책은 모두 몇 쪽인가요?`,
          answer: intAns(avg * n, '쪽'),
          steps: [`(자료 값의 합) $=$ (평균) $\\times$ (자료의 수)`, `$${avg} \\times ${n} = ${avg * n}$ (쪽)`],
        };
      }
      const avg = r.int(40, 120),
        n = r.pick([4, 5, 6, 7]);
      return {
        q: `${josa(nm, '은/는')} $${n}$ 일 동안 줄넘기를 모두 $${avg * n}$ 번 했습니다. 하루에 평균 몇 번 한 셈인가요?`,
        answer: intAns(avg, '번'),
        steps: [`(평균) $=$ (자료 값의 합) $\\div$ (자료의 수)`, `$${avg * n} \\div ${n} = ${avg}$ (번)`],
      };
    }
    if (level === 2) {
      const n = r.pick([4, 5]);
      for (;;) {
        const sc = Array.from({ length: n - 1 }, () => r.int(70, 98));
        const sum = sc.reduce((a, b) => a + b, 0);
        const X = r.int(80, 92);
        const last = X * n - sum;
        if (last < 60 || last > 100) continue;
        const subj = r.pick(['수학', '국어', '과학', '영어']);
        return {
          q: `${nm}의 ${subj} 단원평가 점수를 나타낸 표입니다. $${n}$ 회까지의 평균 점수가 $${X}$ 점이 되려면 $${n}$ 회에는 몇 점을 받아야 하나요?`,
          table: [['회', ...sc.map((_, i) => `$${i + 1}$ 회`), `$${n}$ 회`], ['점수(점)', ...sc.map((s) => `$${s}$`), '?']],
          answer: intAns(last, '점'),
          steps: [`$${n}$ 회까지 점수의 합: $${X} \\times ${n} = ${X * n}$ (점)`, `$${n - 1}$ 회까지의 합: $${sc.join(' + ')} = ${sum}$ (점)`, `$${X * n} - ${sum} = ${last}$ (점)`],
        };
      }
    }
    const [what, unit] = r.pick([
      ['몸무게', 'kg'],
      ['줄넘기 기록', '회'],
      ['키', 'cm'],
    ] as const);
    const lo = unit === 'kg' ? 30 : unit === '회' ? 50 : 135;
    for (;;) {
      const m = r.int(8, 15),
        n = r.int(8, 15),
        a = r.int(lo, lo + 20),
        b = r.int(lo, lo + 20);
      const tot = m * a + n * b;
      if (a === b || m === n || tot % (m + n)) continue;
      const avg = tot / (m + n);
      return {
        q: `${nm}네 반 남학생 $${m}$ 명의 ${what} 평균은 $${a}$ ${unit}, 여학생 $${n}$ 명의 ${what} 평균은 $${b}$ ${unit}입니다. ${nm}네 반 전체 학생의 ${what} 평균은 몇 ${unit}인가요?`,
        answer: intAns(avg, unit),
        steps: [`남학생 합: $${a} \\times ${m} = ${comma(a * m)}$, 여학생 합: $${b} \\times ${n} = ${comma(b * n)}$`, `전체 합: $${comma(a * m)} + ${comma(b * n)} = ${comma(tot)}$, 전체 학생 수: $${m + n}$ 명`, `평균: $${comma(tot)} \\div ${m + n} = ${avg}$ (${unit})`],
        hint: '두 평균을 더해 2로 나누면 안 돼요. 인원이 달라요.',
      };
    }
  },
};

export const WORD5: Record<string, Skill[]> = {
  'e5a-1': [e5a1Price],
  'e5a-2': [e5a2Apply],
  'e5a-4': [e5a4Compare, e5a4Reduce],
  'e5a-5': [e5a5Two],
  'e5a-6': [e5a6Area, e5a6Perim],
  'e5b-1': [e5b1Range],
  'e5b-2': [e5b2Two],
  'e5b-4': [e5b4Two],
  'e5b-5': [e5b5Wire, e5b5Ribbon],
  'e5b-6': [e5b6Mean],
};
