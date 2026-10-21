// 초6 심화 유형(skills 뒤에 덧붙임)과 최상위 유형(top) — 단원마다 심화 1개 + 최상위 2개
import type { Skill } from '../../core/types';
import type { Rng } from '../../core/rng';
import { F } from '../../core/frac';
import { gcd, lcm, round } from '../../core/nt';
import { comma } from '../../core/tex';
import { Svg } from '../../core/fig';
import { pickName, pickNames, josa, jo, fracAns, intAns, decAns, ft, mt, dt } from './util';
import { bandFig, topViewFig } from './fig56';
import { perms, boxesJ } from './hard5';

type Pt = [number, number];
const won = (x: number) => `$${comma(x)}$ 원`;
const piNote = (pi: number) => `(원주율: $${dt(pi)}$)`;
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
const POLY: Record<number, string> = { 3: '삼각', 4: '사각', 5: '오각', 6: '육각', 7: '칠각', 8: '팔각', 9: '구각', 10: '십각' };

// ═════════ 6-1-1 분수의 나눗셈 ═════════
const e6a1Hard: Skill = {
  id: 'hard-card-fdivn',
  title: '수 카드로 만든 (분수)÷(자연수)의 몫',
  gen(r, level) {
    for (;;) {
      const k = level === 3 ? 4 : 3;
      const cards = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], k).sort((a, b) => a - b);
      const big = level === 1 ? true : level === 2 ? false : r.chance(0.5);
      const all: { f: F; tx: string }[] = [];
      for (const p of perms(cards)) {
        if (k === 3) {
          if (p[0] < p[1]) all.push({ f: new F(p[0], p[1] * p[2]), tx: `\\frac{${p[0]}}{${p[1]}} \\div ${p[2]}` });
        } else if (p[1] < p[2]) all.push({ f: new F(p[0] * p[2] + p[1], p[2] * p[3]), tx: `${p[0]}\\frac{${p[1]}}{${p[2]}} \\div ${p[3]}` });
      }
      all.sort((a, b) => (big ? b.f.cmp(a.f) : a.f.cmp(b.f)));
      const best = all[0];
      const second = all.find((x) => !x.f.eq(best.f));
      if (!second) continue;
      const form = k === 3 ? '(진분수) $\\div$ (자연수)' : '(대분수) $\\div$ (자연수)';
      return {
        q: `수 카드 ${boxesJ(cards)} 한 번씩 모두 사용하여 ${form} 의 나눗셈식을 만들려고 합니다. 몫이 가장 ${big ? '클' : '작을'} 때의 몫을 기약분수로 나타내세요.`,
        answer: fracAns(best.f),
        steps: [
          big ? '몫이 크려면 나누어지는 분수는 크게, 나누는 자연수는 작게 해야 해요.' : '몫이 작으려면 나누어지는 분수는 작게, 나누는 자연수는 크게 해야 해요.',
          `(분수) $\\div$ (자연수) $=$ (분수) $\\times \\frac{1}{(\\text{자연수})}$ 로 계산해요.`,
          `가장 ${big ? '큰' : '작은'} 경우: $${best.tx} = ${mt(best.f)}$`,
          `비교: $${second.tx} = ${mt(second.f)}$`,
          `답: $${mt(best.f)}$`,
        ],
      };
    }
  },
};

const e6a1Diff: Skill = {
  id: 'top-quot-diff',
  title: '두 자연수로 나눈 몫의 차(합)로 어떤 분수 구하기',
  gen(r) {
    for (;;) {
      const d = r.int(2, 9),
        n = r.int(1, 3 * d);
      const x = new F(n, d);
      if (x.isInt()) continue;
      const a = r.int(2, 8),
        b = r.int(3, 9);
      if (a >= b) continue;
      const isSum = r.chance(0.4);
      const k = isSum ? new F(a + b, a * b) : new F(b - a, a * b);
      const D = x.mul(k);
      return {
        q: `어떤 분수를 $${a}$ 로 나눈 몫과 $${b}$ 로 나눈 몫의 ${isSum ? '합' : '차'}${isSum ? '이' : '가'} $${mt(D)}$ 입니다. 어떤 분수를 기약분수로 나타내세요.`,
        answer: fracAns(x),
        steps: [
          `어떤 분수를 □ 라 하면 □ $\\div ${a} =$ □ $\\times \\frac{1}{${a}}$, □ $\\div ${b} =$ □ $\\times \\frac{1}{${b}}$`,
          `${isSum ? '합' : '차'}: □ $\\times (\\frac{1}{${a}} ${isSum ? '+' : '-'} \\frac{1}{${b}})$ $=$ □ $\\times (\\frac{${b}}{${a * b}} ${isSum ? '+' : '-'} \\frac{${a}}{${a * b}})$ $=$ □ $\\times \\frac{${isSum ? a + b : b - a}}{${a * b}}$`,
          `□ $\\times \\frac{${isSum ? a + b : b - a}}{${a * b}} = ${mt(D)}$`,
          `□ 의 $\\frac{1}{${a * b}}$ 은 $${mt(D)} \\div ${isSum ? a + b : b - a} = ${mt(D.div(isSum ? a + b : b - a))}$`,
          `□ $= ${mt(D.div(isSum ? a + b : b - a))} \\times ${a * b} = ${mt(x)}$`,
          `확인: $${mt(x)} \\div ${a} ${isSum ? '+' : '-'} ${mt(x)} \\div ${b} = ${mt(x.div(a))} ${isSum ? '+' : '-'} ${mt(x.div(b))} = ${mt(D)}$`,
        ],
        hint: '두 몫을 모두 (어떤 분수) × (분수) 꼴로 나타내 보세요.',
      };
    }
  },
};

const e6a1Clock: Skill = {
  id: 'top-clock-slow',
  title: '늦어지는(빨라지는) 시계의 시각',
  gen(r) {
    for (;;) {
      const q = r.pick([2, 3, 4, 5, 6, 10, 12, 15]);
      const p = r.int(1, 2 * q);
      const dd = new F(p, q);
      if (dd.isInt()) continue;
      const X = dd.mul(7);
      const k = r.int(3, 20);
      const T = dd.mul(k);
      if (T.value >= 60 || T.isInt()) continue;
      const sec = T.mul(60);
      if (!sec.isInt()) continue;
      const tsec = sec.value;
      const slow = r.chance(0.55);
      const shown = slow ? 12 * 3600 - tsec : 12 * 3600 + tsec;
      const mm = Math.floor((shown % 3600) / 60),
        ss = shown % 60;
      const Tm = Math.floor(T.value),
        Ts = tsec - Tm * 60;
      return {
        q: `일주일에 $${mt(X)}$ 분씩 일정하게 ${slow ? '늦어지는' : '빨라지는'} 시계가 있습니다. 이 시계를 어느 날 낮 $12$ 시에 정확히 맞추어 놓았습니다. $${k}$ 일 뒤 낮 $12$ 시에 이 시계가 가리키는 시각은 ${slow ? '오전 $11$ 시' : '낮 $12$ 시'} 몇 분 몇 초인가요?`,
        answer: { type: 'fields', fields: [{ label: '분', value: mm }, { label: '초', value: ss }] },
        steps: [
          `하루에 ${slow ? '늦어지는' : '빨라지는'} 시간: $${mt(X)} \\div 7 = ${mt(dd)}$ (분)`,
          `$${k}$ 일 동안: $${mt(dd)} \\times ${k} = ${mt(T)}$ (분)`,
          `$${mt(T)}$ 분 $= ${Tm}$ 분 $+ ${ft(new F(T.n - Tm * T.d, T.d))} \\times 60$ 초 $= ${Tm}$ 분 $${Ts}$ 초`,
          slow ? `낮 $12$ 시보다 $${Tm}$ 분 $${Ts}$ 초 늦게 가리키므로 오전 $11$ 시 $${mm}$ 분 $${ss}$ 초` : `낮 $12$ 시보다 $${Tm}$ 분 $${Ts}$ 초 앞서므로 낮 $12$ 시 $${mm}$ 분 $${ss}$ 초`,
        ],
        hint: '먼저 하루에 몇 분씩 달라지는지 구하세요.',
      };
    }
  },
};

// ═════════ 6-1-2 각기둥과 각뿔 ═════════
const e6a2Hard: Skill = {
  id: 'hard-poly-sum',
  title: '꼭짓점·면·모서리 수의 합으로 입체 추론하기',
  gen(r, level) {
    for (;;) {
      if (level === 1) {
        const n = r.int(3, 10);
        return {
          q: `꼭짓점의 수와 면의 수의 합이 $${3 * n + 2}$ 개인 각기둥이 있습니다. 이 각기둥의 모서리는 몇 개인가요?`,
          answer: intAns(3 * n, '개'),
          steps: [`밑면의 변이 □ 개이면 꼭짓점 $\\square \\times 2$, 면 $\\square + 2$ 개`, `합: $\\square \\times 3 + 2 = ${3 * n + 2}$ → $\\square = ${n}$ (${POLY[n]}기둥)`, `모서리: $${n} \\times 3 = ${3 * n}$ (개)`],
        };
      }
      if (level === 2) {
        const n = r.int(3, 10);
        const pyr = r.chance(0.5);
        const S = pyr ? 4 * n + 2 : 6 * n + 2;
        const ask = r.pick(['꼭짓점', '면', '모서리'] as const);
        const v = pyr ? { 꼭짓점: n + 1, 면: n + 1, 모서리: 2 * n } : { 꼭짓점: 2 * n, 면: n + 2, 모서리: 3 * n };
        return {
          q: `꼭짓점, 면, 모서리의 수를 모두 더하면 $${S}$ 개인 ${pyr ? '각뿔' : '각기둥'}이 있습니다. 이 ${pyr ? '각뿔' : '각기둥'}의 ${josa(ask, '은/는')} 몇 개인가요?`,
          answer: intAns(v[ask], '개'),
          steps: [
            pyr ? '밑면의 변이 □ 개인 각뿔: 꼭짓점 $\\square + 1$, 면 $\\square + 1$, 모서리 $\\square \\times 2$' : '밑면의 변이 □ 개인 각기둥: 꼭짓점 $\\square \\times 2$, 면 $\\square + 2$, 모서리 $\\square \\times 3$',
            pyr ? `합: $\\square \\times 4 + 2 = ${S}$ → $\\square = ${n}$` : `합: $\\square \\times 6 + 2 = ${S}$ → $\\square = ${n}$`,
            `${POLY[n]}${pyr ? '뿔' : '기둥'}의 ${ask}: $${v[ask]}$ 개`,
          ],
        };
      }
      if (r.chance(0.5)) {
        const n = r.int(3, 9);
        const F0 = n + 2,
          m = 2 * n - 1;
        return {
          q: `면이 $${F0}$ 개인 각기둥과 꼭짓점의 수가 같은 각뿔이 있습니다. 이 각뿔의 모서리는 몇 개인가요?`,
          answer: intAns(2 * m, '개'),
          steps: [`각기둥의 면 $= \\square + 2 = ${F0}$ → $\\square = ${n}$ (${POLY[n]}기둥)`, `각기둥의 꼭짓점: $${n} \\times 2 = ${2 * n}$ (개)`, `각뿔의 꼭짓점 $= \\triangle + 1 = ${2 * n}$ → $\\triangle = ${m}$`, `각뿔의 모서리: $${m} \\times 2 = ${2 * m}$ (개)`],
        };
      }
      const n = 2 * r.int(2, 5);
      const m = (3 * n) / 2;
      return {
        q: `꼭짓점이 $${2 * n}$ 개인 각기둥과 모서리의 수가 같은 각뿔이 있습니다. 이 각뿔의 면은 몇 개인가요?`,
        answer: intAns(m + 1, '개'),
        steps: [`각기둥의 꼭짓점 $= \\square \\times 2 = ${2 * n}$ → $\\square = ${n}$`, `각기둥의 모서리: $${n} \\times 3 = ${3 * n}$ (개)`, `각뿔의 모서리 $= \\triangle \\times 2 = ${3 * n}$ → $\\triangle = ${m}$`, `각뿔의 면: $${m} + 1 = ${m + 1}$ (개)`],
      };
    }
  },
};

const e6a2Cut: Skill = {
  id: 'top-cut-vertex',
  title: '꼭짓점을 잘라 낸 입체의 꼭짓점·면·모서리',
  gen(r) {
    const n = r.int(3, 8);
    const t = r.int(0, 2);
    const ask = r.int(0, 3);
    const names = ['꼭짓점', '면', '모서리', '꼭짓점, 면, 모서리의 수의 합'];
    let V: number, Fc: number, E: number, desc: string, st: string[];
    if (t === 0) {
      const k = r.int(1, n);
      V = 2 * n + 2 * k;
      Fc = n + 2 + k;
      E = 3 * n + 3 * k;
      desc = `${POLY[n]}기둥의 꼭짓점 $${k}$ 개를 ${k > 1 ? '각각 ' : ''}그 꼭짓점에 모인 세 모서리를 지나는 평면으로 조금씩 잘라 냈습니다.${k > 1 ? ' (잘라 낸 부분끼리는 서로 만나지 않습니다.)' : ''}`;
      st = [
        `${POLY[n]}기둥: 꼭짓점 $${2 * n}$, 면 $${n + 2}$, 모서리 $${3 * n}$`,
        '꼭짓점 하나를 잘라 내면 그 자리에 삼각형 면이 하나 생겨요.',
        '→ 꼭짓점: $1$ 개 없어지고 $3$ 개 생겨 $2$ 개 늘고, 면 $1$ 개, 모서리 $3$ 개가 늘어요.',
        `꼭짓점 $${2 * n} + 2 \\times ${k} = ${V}$, 면 $${n + 2} + ${k} = ${Fc}$, 모서리 $${3 * n} + 3 \\times ${k} = ${E}$`,
      ];
    } else if (t === 1) {
      V = 2 * n;
      Fc = n + 2;
      E = 3 * n;
      desc = `${POLY[n]}뿔의 꼭짓점(옆면이 모두 만나는 점) 부분을 밑면에 평행한 평면으로 잘라 냈습니다.`;
      st = [
        `${POLY[n]}뿔: 꼭짓점 $${n + 1}$, 면 $${n + 1}$, 모서리 $${2 * n}$`,
        `각뿔의 꼭짓점에는 모서리가 $${n}$ 개 모여 있어서, 잘라 내면 그 자리에 ${POLY[n]}형 면이 생겨요.`,
        `꼭짓점: $1$ 개 없어지고 $${n}$ 개 생김 → $${n + 1} - 1 + ${n} = ${V}$`,
        `면: $${n + 1} + 1 = ${Fc}$, 모서리: $${2 * n} + ${n} = ${E}$`,
      ];
    } else {
      const k = r.int(1, n);
      V = n + 1 + 2 * k;
      Fc = n + 1 + k;
      E = 2 * n + 3 * k;
      desc = `${POLY[n]}뿔의 밑면의 꼭짓점 $${k}$ 개를 ${k > 1 ? '각각 ' : ''}그 꼭짓점에 모인 세 모서리를 지나는 평면으로 조금씩 잘라 냈습니다.${k > 1 ? ' (잘라 낸 부분끼리는 서로 만나지 않습니다.)' : ''}`;
      st = [
        `${POLY[n]}뿔: 꼭짓점 $${n + 1}$, 면 $${n + 1}$, 모서리 $${2 * n}$`,
        '밑면의 꼭짓점에는 모서리가 $3$ 개 모이므로, 하나를 잘라 내면 삼각형 면이 하나 생겨요.',
        '→ 꼭짓점 $2$ 개, 면 $1$ 개, 모서리 $3$ 개씩 늘어요.',
        `꼭짓점 $${n + 1} + 2 \\times ${k} = ${V}$, 면 $${n + 1} + ${k} = ${Fc}$, 모서리 $${2 * n} + 3 \\times ${k} = ${E}$`,
      ];
    }
    const vals = [V, Fc, E, V + Fc + E];
    if (ask === 3) st.push(`합: $${V} + ${Fc} + ${E} = ${V + Fc + E}$ (개)`);
    else st.push(`따라서 ${names[ask]}는 $${vals[ask]}$ 개`.replace('꼭짓점는', '꼭짓점은').replace('면는', '면은'));
    return {
      q: `${desc} 이렇게 만든 입체도형의 ${names[ask]}${ask === 3 ? '은' : ask === 1 ? '의 수는' : '의 수는'} 몇 개인가요?`,
      answer: intAns(vals[ask], '개'),
      steps: st,
      hint: '잘라 낸 자리에 어떤 모양의 면이 새로 생기는지 생각해 보세요.',
    };
  },
};

function regPolyOn(p1: Pt, p2: Pt, n: number, out: Pt): Pt[] {
  // p1→p2 변 위에 정n각형을 out 쪽 반대편(바깥)으로 그림
  const pts: Pt[] = [p1, p2];
  const dx = p2[0] - p1[0],
    dy = p2[1] - p1[1];
  const ang = (2 * Math.PI) / n;
  for (const sgn of [1, -1]) {
    const res: Pt[] = [p1, p2];
    let d: Pt = [dx, dy];
    let cur = p2;
    for (let i = 0; i < n - 2; i++) {
      const c = Math.cos(sgn * ang),
        s = Math.sin(sgn * ang);
      d = [d[0] * c - d[1] * s, d[0] * s + d[1] * c];
      cur = [cur[0] + d[0], cur[1] + d[1]];
      res.push(cur);
    }
    const cx = sum(res.map((q) => q[0])) / n,
      cy = sum(res.map((q) => q[1])) / n;
    const mx = (p1[0] + p2[0]) / 2,
      my = (p1[1] + p2[1]) / 2;
    if ((cx - mx) * (out[0] - mx) + (cy - my) * (out[1] - my) < 0) return res;
  }
  return pts;
}
const e6a2Net: Skill = {
  id: 'top-net-perim',
  title: '각기둥·각뿔 전개도의 둘레',
  gen(r) {
    const n = r.int(3, 6);
    if (r.chance(0.5)) {
      const a = r.int(3, 8),
        l = a + r.int(2, 6);
      const rev = r.chance(0.4);
      // 그림
      const s0 = 14;
      const S = new Svg(260, 250);
      const Rr = (a * s0) / (2 * Math.sin(Math.PI / n));
      const cx = 130,
        cy = 125;
      const base: Pt[] = Array.from({ length: n }, (_, i) => {
        const t = -Math.PI / 2 + (i * 2 * Math.PI) / n + Math.PI / n;
        return [cx + Rr * Math.cos(t), cy + Rr * Math.sin(t)];
      });
      const ht = Math.sqrt(l * l - (a * a) / 4) * s0;
      const sc = Math.min(1, 115 / (Rr * Math.cos(Math.PI / n) + ht));
      const B2 = base.map((p) => [cx + (p[0] - cx) * sc, cy + (p[1] - cy) * sc] as Pt);
      const ht2 = ht * sc;
      S.poly(B2, { cls: 'acc', fill: true });
      B2.forEach((p, i) => {
        const q = B2[(i + 1) % n];
        const mx = (p[0] + q[0]) / 2,
          my = (p[1] + q[1]) / 2;
        const ox = mx - cx,
          oy = my - cy;
        const ol = Math.hypot(ox, oy);
        const apex: Pt = [mx + (ox / ol) * ht2, my + (oy / ol) * ht2];
        S.poly([p, q, apex], { cls: 'acc', fill: true });
        if (i === 0) {
          S.text((q[0] + apex[0]) / 2 + 14, (q[1] + apex[1]) / 2, rev ? '?' : `${l} cm`, { size: 12 });
          S.text(mx - (ox / ol) * 12, my - (oy / ol) * 12, `${a} cm`, { size: 11 });
        }
      });
      const P = 2 * n * l;
      return {
        q: rev
          ? `밑면이 정${POLY[n]}형이고 옆면이 모두 합동인 이등변삼각형인 ${POLY[n]}뿔의 전개도입니다. 밑면의 한 변이 $${a}$ cm 이고 전개도의 둘레가 $${P}$ cm 일 때, 이 각뿔의 옆 모서리 하나의 길이는 몇 cm 인가요?`
          : `밑면이 정${POLY[n]}형이고 옆면이 모두 합동인 이등변삼각형인 ${POLY[n]}뿔의 전개도입니다. 밑면의 한 변이 $${a}$ cm, 옆 모서리가 $${l}$ cm 일 때, 전개도의 둘레는 몇 cm 인가요?`,
        fig: S.toString(),
        answer: intAns(rev ? l : P, 'cm'),
        steps: [
          '전개도에서 밑면의 변은 모두 옆면과 붙어 있어서 둘레에 들어가지 않아요.',
          `둘레는 옆면(이등변삼각형)의 같은 두 변으로만 이루어져요 → 옆면 $${n}$ 개 $\\times 2$ 변 $= ${2 * n}$ 개`,
          rev ? `옆 모서리 $\\times ${2 * n} = ${P}$` : `둘레 $= ${l} \\times ${2 * n}$`,
          rev ? `옆 모서리 $= ${P} \\div ${2 * n} = ${l}$ (cm)` : `$= ${P}$ (cm)`,
          `(밑면의 한 변 $${a}$ cm 는 필요 없는 정보예요.)`,
        ],
        hint: '전개도의 둘레에 어떤 선분들이 들어가는지 세어 보세요.',
      };
    }
    const a = r.int(2, 6),
      h = r.int(3, 9);
    if (a === h) return e6a2Net.gen(r, 3);
    const u = Math.min(220 / (n * a), 9);
    const W = Math.round(n * a * u + 40);
    const ap = (a * u) / (2 * Math.tan(Math.PI / n));
    const H = Math.round(h * u + 4 * ap + 40);
    const S = new Svg(Math.max(W + 40, 160), H);
    const x0 = 20,
      y0 = 20 + 2 * ap;
    for (let i = 0; i < n; i++) S.rect(x0 + i * a * u, y0, a * u, h * u, { cls: 'acc', fill: true });
    const ti = r.int(0, n - 1),
      bi = r.int(0, n - 1);
    const top = regPolyOn([x0 + ti * a * u, y0], [x0 + (ti + 1) * a * u, y0], n, [x0 + ti * a * u + 1, y0 + 10]);
    const bot = regPolyOn([x0 + bi * a * u, y0 + h * u], [x0 + (bi + 1) * a * u, y0 + h * u], n, [x0 + bi * a * u + 1, y0 + h * u - 10]);
    S.poly(top, { cls: 'acc', fill: true });
    S.poly(bot, { cls: 'acc', fill: true });
    S.text(x0 + n * a * u + 6, y0 + (h * u) / 2, `${h} cm`, { size: 12, anchor: 'start' });
    {
      const li = [...Array(n).keys()].find((i) => i !== bi) ?? 0;
      S.text(x0 + (li + 0.5) * a * u, y0 + h * u + 12, `${a} cm`, { size: 11 });
    }
    const P = (4 * n - 4) * a + 2 * h;
    return {
      q: `밑면이 정${POLY[n]}형인 ${POLY[n]}기둥의 전개도입니다. 밑면의 한 변이 $${a}$ cm, 높이가 $${h}$ cm 일 때, 전개도의 둘레는 몇 cm 인가요?`,
      fig: S.toString(),
      answer: intAns(P, 'cm'),
      steps: [
        `옆면 $${n}$ 개를 이어 붙인 직사각형의 둘레: $${n * a} \\times 2 + ${h} \\times 2 = ${2 * n * a + 2 * h}$ (cm)`,
        `밑면 하나를 붙이면 붙은 변 $${a}$ cm 가 빠지고 나머지 $${n - 1}$ 개의 변이 더해져요 → $${a} \\times ${n - 2} = ${(n - 2) * a}$ cm 늘어요.`,
        `밑면이 $2$ 개이므로 $${(n - 2) * a} \\times 2 = ${2 * (n - 2) * a}$ (cm) 늘어요.`,
        `둘레: $${2 * n * a + 2 * h} + ${2 * (n - 2) * a} = ${P}$ (cm)`,
        `(둘레는 높이 모서리 $2$ 개와 밑면의 변 $${4 * n - 4}$ 개로 이루어져요.)`,
      ],
      hint: '둘레에 밑면의 변과 높이가 각각 몇 번 들어가는지 세어 보세요.',
    };
  },
};

// ═════════ 6-1-3 소수의 나눗셈 ═════════
const e6a3Hard: Skill = {
  id: 'hard-card-decdiv',
  title: '수 카드로 만든 (소수)÷(자연수)의 몫',
  gen(r, level) {
    for (;;) {
      const k = level + 2;
      const pool = level === 1 ? [1, 2, 4, 5, 8] : [0, 1, 2, 4, 5, 8];
      const cards = r.sample(pool, k).sort((a, b) => a - b);
      const big = r.chance(0.5);
      const all: { v: number; tx: string }[] = [];
      for (const p of perms(cards)) {
        const dv = p[k - 1];
        if (dv === 0) continue;
        let num: number, pl: number, tx: string;
        if (level === 1) {
          num = 10 * p[0] + p[1];
          pl = 1;
          tx = `${p[0]}.${p[1]}`;
        } else if (level === 2) {
          if (p[0] === 0) continue;
          num = 100 * p[0] + 10 * p[1] + p[2];
          pl = 1;
          tx = `${p[0]}${p[1]}.${p[2]}`;
        } else {
          if (p[0] === 0) continue;
          num = 1000 * p[0] + 100 * p[1] + 10 * p[2] + p[3];
          pl = 2;
          tx = `${p[0]}${p[1]}.${p[2]}${p[3]}`;
        }
        all.push({ v: round(num / 10 ** pl / dv, 8), tx: `${tx} \\div ${dv}` });
      }
      all.sort((a, b) => (big ? b.v - a.v : a.v - b.v));
      const best = all[0];
      const second = all.find((x) => x.v !== best.v);
      if (!second) continue;
      if ((String(best.v).split('.')[1] ?? '').length > 5) continue;
      const form = level === 1 ? '$\\square.\\square \\div \\square$' : level === 2 ? '$\\square\\square.\\square \\div \\square$' : '$\\square\\square.\\square\\square \\div \\square$';
      return {
        q: `수 카드 ${boxesJ(cards)} 한 번씩 모두 사용하여 ${form} 의 나눗셈식을 만들려고 합니다. 몫이 가장 ${big ? '클' : '작을'} 때의 몫을 구하세요.`,
        answer: decAns(best.v),
        steps: [
          big ? '몫이 크려면 나누어지는 수는 크게, 나누는 수는 작게 해야 해요.' : '몫이 작으려면 나누어지는 수는 작게, 나누는 수는 크게 해야 해요.',
          big ? '가장 작은 카드(0 제외)를 나누는 수로 하고, 나머지로 가장 큰 소수를 만들어요.' : '가장 큰 카드를 나누는 수로 하고, 나머지로 가장 작은 소수를 만들어요.',
          `$${best.tx} = ${dt(best.v)}$`,
          `비교: $${second.tx} = ${dt(second.v)}$`,
          `답: $${dt(best.v)}$`,
        ],
      };
    }
  },
};

const e6a3Tree: Skill = {
  id: 'top-tree-gap',
  title: '나무 심기 간격 (소수의 나눗셈)',
  gen(r) {
    const t = r.int(0, 2);
    const gap = round(r.int(25, 195) * 0.05, 4);
    if (t === 0) {
      const n = r.int(8, 26);
      const L = round(gap * (n - 1), 4);
      return {
        q: `길이가 $${dt(L)}$ m 인 산책로의 한쪽에 처음부터 끝까지 같은 간격으로 나무 $${n}$ 그루를 심으려고 합니다. 산책로의 처음과 끝에도 나무를 심는다면, 나무 사이의 간격은 몇 m 로 해야 하나요? (나무의 두께는 생각하지 않습니다.)`,
        answer: decAns(gap, 'm'),
        steps: ['처음과 끝에 모두 심으면 (간격의 수) $=$ (나무 수) $- 1$', `간격의 수: $${n} - 1 = ${n - 1}$ (군데)`, `간격: $${dt(L)} \\div ${n - 1} = ${dt(gap)}$ (m)`],
        hint: '나무 수와 간격 수의 관계를 작은 수로 그려 보세요.',
      };
    }
    if (t === 1) {
      const n = r.int(10, 40);
      const L = round(gap * n, 4);
      return {
        q: `둘레가 $${dt(L)}$ m 인 원 모양 호수의 둘레를 따라 같은 간격으로 나무 $${n}$ 그루를 심으려고 합니다. 나무 사이의 간격은 몇 m 로 해야 하나요? (나무의 두께는 생각하지 않습니다.)`,
        answer: decAns(gap, 'm'),
        steps: ['원 모양 둘레에 심으면 처음과 끝이 만나므로 (간격의 수) $=$ (나무 수)', `간격의 수: $${n}$ 군데`, `간격: $${dt(L)} \\div ${n} = ${dt(gap)}$ (m)`],
        hint: '닫힌 둘레에서는 나무 수와 간격 수가 같아요.',
      };
    }
    const per = r.int(8, 20);
    const L = round(gap * (per - 1), 4);
    return {
      q: `길이가 $${dt(L)}$ m 인 도로의 양쪽에 처음부터 끝까지 같은 간격으로 가로수를 심었더니 모두 $${2 * per}$ 그루가 필요했습니다. 도로의 처음과 끝에도 가로수를 심었다면, 가로수 사이의 간격은 몇 m 인가요? (가로수의 두께는 생각하지 않습니다.)`,
      answer: decAns(gap, 'm'),
      steps: [`양쪽에 심었으므로 한쪽에 심은 가로수: $${2 * per} \\div 2 = ${per}$ (그루)`, `한쪽의 간격 수: $${per} - 1 = ${per - 1}$ (군데)`, `간격: $${dt(L)} \\div ${per - 1} = ${dt(gap)}$ (m)`],
      hint: '먼저 한쪽에 심은 가로수가 몇 그루인지 구하세요.',
    };
  },
};

const e6a3Bottle: Skill = {
  id: 'top-bottle',
  title: '덜어 낸 양으로 빈 그릇의 무게 구하기',
  gen(r) {
    for (;;) {
      const t = r.int(0, 2);
      const c = round(r.int(30, 120) / 100, 4);
      if (t === 2) {
        const wFull = round(r.int(100, 300) / 100, 4);
        if ((Math.round(wFull * 100) % 2) !== 0) continue;
        const a = round(c + wFull, 4),
          b = round(c + wFull / 2, 4);
        return {
          q: `물이 가득 들어 있는 물통의 무게는 $${dt(a)}$ kg 입니다. 물을 절반만큼 마신 뒤 물통의 무게를 재었더니 $${dt(b)}$ kg 이었습니다. 빈 물통의 무게는 몇 kg 인가요?`,
          answer: decAns(c, 'kg'),
          steps: [
            `마신 물(전체 물의 절반): $${dt(a)} - ${dt(b)} = ${dt(round(a - b, 4))}$ (kg)`,
            `가득 든 물: $${dt(round(a - b, 4))} \\times 2 = ${dt(wFull)}$ (kg)`,
            `빈 물통: $${dt(a)} - ${dt(wFull)} = ${dt(c)}$ (kg)`,
          ],
        };
      }
      const w = round(r.int(12, 48) / 100, 4);
      const m = r.int(6, 15),
        k = r.int(2, m - 2);
      const a = round(c + m * w, 4),
        b = round(a - k * w, 4);
      const [it, cup, unit] = t === 0 ? (['주스가 가득 든 병', '컵', '잔'] as const) : (['같은 무게의 공책으로 가득 찬 상자', '공책', '권'] as const);
      const qq =
        t === 0
          ? `주스가 가득 든 병의 무게는 $${dt(a)}$ kg 입니다. 똑같은 컵으로 주스를 $${k}$ 잔 따라 낸 뒤 병의 무게를 재었더니 $${dt(b)}$ kg 이었습니다. 이 병에는 주스가 똑같은 컵으로 $${m}$ 잔 들어간다고 할 때, 빈 병의 무게는 몇 kg 인가요?`
          : `똑같은 공책 $${m}$ 권이 든 상자의 무게는 $${dt(a)}$ kg 입니다. 공책 $${k}$ 권을 꺼낸 뒤 상자의 무게를 재었더니 $${dt(b)}$ kg 이었습니다. 빈 상자의 무게는 몇 kg 인가요?`;
      void it;
      void cup;
      return {
        q: qq,
        answer: decAns(c, 'kg'),
        steps: [
          `덜어 낸 $${k}$ ${unit}의 무게: $${dt(a)} - ${dt(b)} = ${dt(round(a - b, 4))}$ (kg)`,
          `한 ${unit}의 무게: $${dt(round(a - b, 4))} \\div ${k} = ${dt(w)}$ (kg)`,
          `처음에 든 $${m}$ ${unit}의 무게: $${dt(w)} \\times ${m} = ${dt(round(w * m, 4))}$ (kg)`,
          `빈 ${t === 0 ? '병' : '상자'}: $${dt(a)} - ${dt(round(w * m, 4))} = ${dt(c)}$ (kg)`,
        ],
        hint: '덜어 낸 양의 무게로 한 개(한 잔)의 무게를 먼저 구하세요.',
      };
    }
  },
};

// ═════════ 6-1-4 비와 비율 ═════════
const e6a4Hard: Skill = {
  id: 'hard-percent-chain',
  title: '비율로 기준량 거꾸로 구하기',
  gen(r, level) {
    for (;;) {
      const p = r.pick([15, 20, 25, 35, 40, 45, 60, 75, 80]);
      const B = r.int(2, 30) * 20;
      const X = (B * p) / 100;
      if (!Number.isInteger(X)) continue;
      if (level === 1) {
        return {
          q: `어떤 수의 $${p}\\%$ 가 $${X}$ 입니다. 어떤 수는 얼마인가요?`,
          answer: intAns(B),
          steps: [`$${p}\\% = \\frac{${p}}{100}$ 이므로 (어떤 수) $\\times \\frac{${p}}{100} = ${X}$`, `(어떤 수)의 $1\\%$ 는 $${X} \\div ${p} = ${dt(X / p)}$`, `어떤 수 $= ${dt(X / p)} \\times 100 = ${B}$`],
        };
      }
      if (level === 2) {
        const q = r.pick([10, 30, 55, 65, 70, 85, 90, 120]);
        const Y = (B * q) / 100;
        if (!Number.isInteger(Y) || q === p) continue;
        return {
          q: `어떤 수의 $${p}\\%$ 가 $${X}$ 일 때, 어떤 수의 $${q}\\%$ 는 얼마인가요?`,
          answer: intAns(Y),
          steps: [`어떤 수의 $1\\%$: $${X} \\div ${p} = ${dt(X / p)}$`, `어떤 수: $${dt(X / p)} \\times 100 = ${B}$`, `어떤 수의 $${q}\\%$: $${B} \\times \\frac{${q}}{100} = ${Y}$`],
        };
      }
      const nm = pickName(r);
      const T = r.int(10, 40) * 20;
      const q = r.pick([20, 25, 30, 40, 50, 60]);
      const boys = (T * p) / 100;
      const Z = (boys * q) / 100;
      if (!Number.isInteger(boys) || !Number.isInteger(Z) || Z < 5) continue;
      const [g, sub] = r.pick([
        ['남학생', '안경을 쓴 학생'],
        ['여학생', '자전거를 타고 오는 학생'],
        ['6학년', '방과 후 수업을 듣는 학생'],
      ] as const);
      return {
        q: `${nm}네 학교 학생 중 $${p}\\%$ 는 ${g}이고, ${g}의 $${q}\\%$ 는 ${sub}입니다. ${g} 중 ${sub}${jo(sub, '이/가')} $${Z}$ 명이라면, ${nm}네 학교 학생은 모두 몇 명인가요?`,
        answer: intAns(T, '명'),
        steps: [
          `${g}의 $${q}\\%$ 가 $${Z}$ 명 → ${g} $= ${Z} \\div ${q} \\times 100 = ${boys}$ (명)`,
          `전체의 $${p}\\%$ 가 $${boys}$ 명 → 전체 $= ${boys} \\div ${p} \\times 100 = ${T}$ (명)`,
          `확인: $${T} \\times \\frac{${p}}{100} \\times \\frac{${q}}{100} = ${Z}$`,
        ],
        hint: '기준량이 무엇인지 단계마다 확인하며 거꾸로 구하세요.',
      };
    }
  },
};

const e6a4Price: Skill = {
  id: 'top-price-chain',
  title: '이익·할인이 겹친 가격 계산',
  gen(r) {
    for (;;) {
      const t = r.int(0, 2);
      const p = r.pick([20, 25, 30, 40, 50]),
        q = r.pick([10, 15, 20, 25, 30]);
      if (t === 0) {
        const C = r.int(10, 60) * 1000;
        const P = (C * (100 + p)) / 100,
          S = (P * (100 - q)) / 100;
        if (!Number.isInteger(P) || !Number.isInteger(S) || S <= C) continue;
        return {
          q: `원가가 ${won(C)}인 물건에 원가의 $${p}\\%$ 만큼 이익을 붙여 정가를 정했습니다. 그런데 팔리지 않아 정가의 $${q}\\%$ 를 할인하여 팔았습니다. 이 물건 하나를 팔아 얻은 이익은 얼마인가요?`,
          answer: intAns(S - C, '원'),
          steps: [
            `정가: $${comma(C)} \\times \\frac{${100 + p}}{100} = ${comma(P)}$ (원)`,
            `할인 금액: $${comma(P)} \\times \\frac{${q}}{100} = ${comma(P - S)}$ (원)`,
            `판매 가격: $${comma(P)} - ${comma(P - S)} = ${comma(S)}$ (원)`,
            `이익: $${comma(S)} - ${comma(C)} = ${comma(S - C)}$ (원)`,
            `(정가에 붙인 이익 $${p}\\%$ 와 할인 $${q}\\%$ 는 기준량이 달라서 그냥 빼면 안 돼요.)`,
          ],
          hint: '이익은 원가가 기준, 할인은 정가가 기준이에요.',
        };
      }
      if (t === 1) {
        if (q < p) continue;
        const ch = 100 - ((100 + p) * (100 - q)) / 100;
        if (ch <= 0) continue;
        return {
          q: `어떤 물건의 가격을 $${p}\\%$ 올렸다가, 올린 가격에서 다시 $${q}\\%$ 내렸습니다. 마지막 가격은 처음 가격보다 몇 % 낮은가요?`,
          answer: decAns(ch, '%'),
          steps: [
            '처음 가격을 $100$ 이라 하고 생각해요.',
            `$${p}\\%$ 올린 가격: $100 \\times \\frac{${100 + p}}{100} = ${100 + p}$`,
            `$${q}\\%$ 내린 가격: $${100 + p} \\times \\frac{${100 - q}}{100} = ${dt(100 - ch)}$`,
            `처음보다 $100 - ${dt(100 - ch)} = ${dt(ch)}$ 낮아요 → $${dt(ch)}\\%$`,
            `(두 번째 할인은 올린 가격이 기준이라 $${q} - ${p} = ${q - p}$ % 가 아니에요.)`,
          ],
          hint: '처음 가격을 100으로 놓고 계산해 보세요.',
        };
      }
      const C = r.int(10, 60) * 1000;
      const P = (C * (100 + p)) / 100,
        S = (P * (100 - q)) / 100;
      if (!Number.isInteger(P) || !Number.isInteger(S)) continue;
      return {
        q: `어떤 물건에 원가의 $${p}\\%$ 만큼 이익을 붙여 정가를 정하고, 정가의 $${q}\\%$ 를 할인하여 ${won(S)}에 팔았습니다. 이 물건의 원가는 얼마인가요?`,
        answer: intAns(C, '원'),
        steps: [
          `판매 가격은 정가의 $100\\% - ${q}\\% = ${100 - q}\\%$`,
          `정가: $${comma(S)} \\div ${100 - q} \\times 100 = ${comma(P)}$ (원)`,
          `정가는 원가의 $${100 + p}\\%$`,
          `원가: $${comma(P)} \\div ${100 + p} \\times 100 = ${comma(C)}$ (원)`,
        ],
        hint: '거꾸로, 판매 가격 → 정가 → 원가 순서로 구하세요.',
      };
    }
  },
};

const e6a4Salt: Skill = {
  id: 'top-salt',
  title: '소금물의 진하기 바꾸기',
  gen(r) {
    for (;;) {
      const t = r.int(0, 3);
      const W = r.int(4, 30) * 20;
      const p = r.pick([4, 5, 6, 8, 10, 12, 15, 20]);
      const salt = (W * p) / 100;
      if (!Number.isInteger(salt)) continue;
      if (t === 0 || t === 1) {
        const q = r.pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 16, 20, 24, 25, 30]);
        if (t === 0 ? q <= p : q >= p) continue;
        const nt = (salt * 100) / q;
        if (!Number.isInteger(nt)) continue;
        const diff = Math.abs(nt - W);
        return {
          q: `진하기가 $${p}\\%$ 인 소금물 $${W}$ g 이 있습니다. 이 소금물${t === 0 ? '에서 물을 증발시켜' : '에 물을 더 넣어'} 진하기가 $${q}\\%$ 인 소금물을 만들려면 물을 몇 g ${t === 0 ? '증발시켜야' : '더 넣어야'} 하나요?`,
          answer: intAns(diff, 'g'),
          steps: [
            `소금의 양: $${W} \\times \\frac{${p}}{100} = ${salt}$ (g) — 물을 ${t === 0 ? '증발시켜도' : '넣어도'} 소금의 양은 그대로예요.`,
            `진하기 $${q}\\%$ 가 되려면 소금물 전체의 $${q}\\%$ 가 $${salt}$ g`,
            `새 소금물의 양: $${salt} \\div ${q} \\times 100 = ${nt}$ (g)`,
            t === 0 ? `증발시킬 물: $${W} - ${nt} = ${diff}$ (g)` : `더 넣을 물: $${nt} - ${W} = ${diff}$ (g)`,
          ],
          hint: '변하지 않는 양이 무엇인지 찾아보세요.',
        };
      }
      if (t === 2) {
        const B = r.int(4, 30) * 20;
        const q = r.pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20]);
        if (q === p) continue;
        const s2 = (B * q) / 100;
        const tot = salt + s2;
        const pc = (tot * 100) / (W + B);
        if (!Number.isInteger(s2) || !Number.isInteger(pc)) continue;
        return {
          q: `진하기가 $${p}\\%$ 인 소금물 $${W}$ g 과 진하기가 $${q}\\%$ 인 소금물 $${B}$ g 을 섞었습니다. 섞은 소금물의 진하기는 몇 % 인가요?`,
          answer: intAns(pc, '%'),
          steps: [
            `첫째 소금물의 소금: $${W} \\times \\frac{${p}}{100} = ${salt}$ (g)`,
            `둘째 소금물의 소금: $${B} \\times \\frac{${q}}{100} = ${s2}$ (g)`,
            `섞은 소금물: $${W} + ${B} = ${W + B}$ (g), 소금 $${tot}$ g`,
            `진하기: $\\frac{${tot}}{${W + B}} \\times 100 = ${pc}$ (%)`,
            `(두 진하기의 평균 $${dt((p + q) / 2)}\\%$ 가 아니에요. 양이 다르기 때문이에요.)`,
          ],
          hint: '두 소금물의 소금 양을 각각 구해 더해 보세요.',
        };
      }
      const q = r.pick([10, 12, 15, 20, 25, 28, 30, 36, 40]);
      if (q <= p) continue;
      const water = W - salt;
      const nt = (water * 100) / (100 - q);
      if (!Number.isInteger(nt)) continue;
      const x = nt - W;
      return {
        q: `진하기가 $${p}\\%$ 인 소금물 $${W}$ g 에 소금을 더 넣어 진하기가 $${q}\\%$ 인 소금물을 만들려고 합니다. 소금을 몇 g 더 넣어야 하나요?`,
        answer: intAns(x, 'g'),
        steps: [
          `처음 소금 $${salt}$ g, 물 $${W} - ${salt} = ${water}$ (g)`,
          '소금을 넣어도 **물의 양**은 변하지 않아요.',
          `진하기 $${q}\\%$ 이면 물은 소금물 전체의 $${100 - q}\\%$ → 전체 $= ${water} \\div ${100 - q} \\times 100 = ${nt}$ (g)`,
          `더 넣을 소금: $${nt} - ${W} = ${x}$ (g)`,
        ],
        hint: '소금을 넣을 때 변하지 않는 것은 무엇일까요?',
      };
    }
  },
};

// ═════════ 6-1-5 여러 가지 그래프 ═════════
const ITEMS = [
  ['운동', '축구', '농구', '야구', '배구', '수영'],
  ['과일', '사과', '포도', '귤', '배', '딸기'],
  ['계절', '봄', '여름', '가을', '겨울'],
  ['간식', '떡볶이', '피자', '치킨', '김밥', '빵'],
];
function pcts(r: Rng, n: number): number[] {
  for (;;) {
    const xs = Array.from({ length: n - 1 }, () => r.int(2, 8) * 5);
    const last = 100 - sum(xs);
    if (last >= 5 && last <= 45) return [...xs, last].sort((a, b) => b - a);
  }
}
const e6a5Hard: Skill = {
  id: 'hard-graph-two',
  title: '두 단계 비율로 그래프 해석하기',
  gen(r, level) {
    for (;;) {
      const set = r.pick(ITEMS);
      const n = r.int(4, Math.min(5, set.length - 1));
      const items = set.slice(1, n + 1);
      if (level < 3) {
        const pc = pcts(r, n);
        const N = r.int(5, 20) * 20;
        const i = r.int(0, n - 1);
        const q = r.pick([20, 25, 30, 40, 50, 60, 75, 80]);
        const cnt = (N * pc[i]) / 100;
        const sub = (cnt * q) / 100;
        if (!Number.isInteger(cnt) || !Number.isInteger(sub)) continue;
        const pctAll = (pc[i] * q) / 100;
        if (level === 2 && (String(pctAll).split('.')[1] ?? '').length > 1) continue;
        return {
          q:
            level === 1
              ? `학생 $${N}$ 명이 좋아하는 ${set[0]}${jo(set[0], '을/를')} 조사하여 나타낸 띠그래프입니다. ${josa(items[i], '을/를')} 좋아하는 학생 중 $${q}\\%$ 가 남학생이라면, ${josa(items[i], '을/를')} 좋아하는 남학생은 몇 명인가요?`
              : `학생들이 좋아하는 ${set[0]}${jo(set[0], '을/를')} 조사하여 나타낸 띠그래프입니다. ${josa(items[i], '을/를')} 좋아하는 학생 중 $${q}\\%$ 가 남학생이라면, ${josa(items[i], '을/를')} 좋아하는 남학생은 전체 학생의 몇 % 인가요?`,
          fig: bandFig(items, pc),
          answer: level === 1 ? intAns(sub, '명') : decAns(pctAll, '%'),
          steps:
            level === 1
              ? [`${josa(items[i], '을/를')} 좋아하는 학생: $${N} \\times \\frac{${pc[i]}}{100} = ${cnt}$ (명)`, `그중 남학생: $${cnt} \\times \\frac{${q}}{100} = ${sub}$ (명)`]
              : [`${items[i]}: 전체의 $${pc[i]}\\%$`, `그중 $${q}\\%$ → 전체에 대한 비율은 $${pc[i]} \\times \\frac{${q}}{100} = ${dt(pctAll)}$`, `따라서 전체의 $${dt(pctAll)}\\%$`],
          hint: level === 2 ? '"전체의 몇 %"이므로 기준량이 전체 학생이에요.' : undefined,
        };
      }
      const N1 = r.int(10, 30) * 20,
        N2 = r.int(10, 30) * 20;
      const p1 = r.int(3, 9) * 5,
        p2 = r.int(3, 9) * 5;
      const a1 = (N1 * p1) / 100,
        a2 = (N2 * p2) / 100;
      if (a2 <= a1 || N1 === N2 || p1 === p2) continue;
      const it = r.pick(items);
      return {
        q: `어느 학교에서 작년과 올해 좋아하는 ${set[0]}${jo(set[0], '을/를')} 조사하였습니다. ${josa(it, '을/를')} 좋아하는 학생은 작년보다 올해 몇 명 늘었나요?`,
        table: [
          ['', '조사한 학생 수', `${it}의 비율`],
          ['작년', `$${N1}$ 명`, `$${p1}\\%$`],
          ['올해', `$${N2}$ 명`, `$${p2}\\%$`],
        ],
        answer: intAns(a2 - a1, '명'),
        steps: [
          `작년: $${N1} \\times \\frac{${p1}}{100} = ${a1}$ (명)`,
          `올해: $${N2} \\times \\frac{${p2}}{100} = ${a2}$ (명)`,
          `늘어난 학생: $${a2} - ${a1} = ${a2 - a1}$ (명)`,
          '(조사한 학생 수가 다르므로 비율만 비교하면 안 돼요.)',
        ],
      };
    }
  },
};

const e6a5Pie: Skill = {
  id: 'top-pie-angle',
  title: '원그래프의 중심각과 비율 관계',
  gen(r) {
    for (;;) {
      const k = r.int(2, 5);
      const aAng = 36 * k;
      const A = 10 * k,
        B = 5 * k;
      const C = r.int(2, 6) * 5;
      const D = 100 - A - B - C;
      if (D < 5) continue;
      const N = r.int(6, 30) * 20;
      const set = r.pick(ITEMS);
      const [ia, ib, ic, id] = set.slice(1, 5);
      const askAng = r.chance(0.35);
      const cnt = (N * D) / 100;
      return {
        q: `학생 $${N}$ 명이 좋아하는 ${set[0]}${jo(set[0], '을/를')} 조사하여 원그래프로 나타냈습니다. ${ia}의 중심각은 $${aAng}°$ 이고, ${josa(ib, '을/를')} 좋아하는 학생 수는 ${ia}의 절반, ${ic}${jo(ic, '은/는')} 전체의 $${C}\\%$ 이며, 나머지는 모두 ${josa(id, '을/를')} 좋아합니다. ${askAng ? `원그래프에서 ${id}의 중심각은 몇 도인가요?` : `${josa(id, '을/를')} 좋아하는 학생은 몇 명인가요?`}`,
        answer: askAng ? intAns((D * 360) / 100, '°') : intAns(cnt, '명'),
        steps: [
          `원 전체의 중심각은 $360°$ → ${ia}: $${aAng} \\div 360 \\times 100 = ${A}$ (%)`,
          `${ib}: ${ia}의 절반 → $${A} \\div 2 = ${B}$ (%)`,
          `${id}: $100 - ${A} - ${B} - ${C} = ${D}$ (%)`,
          askAng ? `${id}의 중심각: $360 \\times \\frac{${D}}{100} = ${(D * 360) / 100}$ (°)` : `${id}: $${N} \\times \\frac{${D}}{100} = ${cnt}$ (명)`,
        ],
        hint: '중심각을 먼저 백분율로 바꾸어 보세요.',
      };
    }
  },
};

const e6a5Diff: Skill = {
  id: 'top-graph-diff',
  title: '항목 사이의 차로 전체와 가려진 항목 구하기',
  gen(r) {
    for (;;) {
      const set = r.pick(ITEMS);
      const n = r.int(4, Math.min(5, set.length - 1));
      const items = set.slice(1, n + 1);
      const pc = pcts(r, n);
      if (new Set(pc).size < n) continue;
      const N = r.int(2, 8) * 100;
      const hide = r.int(1, n - 1);
      const [i, j] = r.sample([...Array(n).keys()].filter((x) => x !== hide), 2).sort((a, b) => a - b);
      if (pc[i] === pc[j]) continue;
      const X = (N * (pc[i] - pc[j])) / 100;
      const askTot = r.chance(0.35);
      const ans = askTot ? N : (N * pc[hide]) / 100;
      return {
        q: `학생들이 좋아하는 ${set[0]}${jo(set[0], '을/를')} 조사하여 나타낸 띠그래프입니다. ${josa(items[i], '을/를')} 좋아하는 학생은 ${josa(items[j], '을/를')} 좋아하는 학생보다 $${X}$ 명 더 많습니다. ${askTot ? '조사한 학생은 모두 몇 명인가요?' : `${josa(items[hide], '을/를')} 좋아하는 학생은 몇 명인가요?`}`,
        fig: bandFig(items, pc, { hide }),
        answer: intAns(ans, '명'),
        steps: [
          `${items[i]}${jo(items[i], '과/와')} ${items[j]}의 비율 차: $${pc[i]} - ${pc[j]} = ${pc[i] - pc[j]}$ (%)`,
          `전체의 $${pc[i] - pc[j]}\\%$ 가 $${X}$ 명 → $1\\%$ 는 $${X} \\div ${pc[i] - pc[j]} = ${N / 100}$ (명)`,
          `전체: $${N / 100} \\times 100 = ${N}$ (명)`,
          ...(askTot
            ? []
            : [`${items[hide]}의 비율: $100 - (${pc.filter((_, k) => k !== hide).join(' + ')}) = ${pc[hide]}$ (%)`, `${items[hide]}: $${N / 100} \\times ${pc[hide]} = ${ans}$ (명)`]),
        ],
        hint: '두 항목의 차가 전체의 몇 %인지 먼저 구하세요.',
      };
    }
  },
};

// ═════════ 6-1-6 직육면체의 부피와 겉넓이 ═════════
const e6a6Hard: Skill = {
  id: 'hard-stack-cube',
  title: '정육면체를 붙인 입체의 겉넓이와 세 면으로 부피 구하기',
  gen(r, level) {
    for (;;) {
      if (level === 1) {
        const a = r.int(2, 10);
        return {
          q: `한 모서리가 $${a}$ cm 인 정육면체 $2$ 개를 면끼리 꼭 맞게 붙여 직육면체를 만들었습니다. 만든 직육면체의 겉넓이는 몇 cm² 인가요?`,
          answer: intAns(10 * a * a, 'cm²'),
          steps: [`정육면체 $2$ 개의 겉넓이: $${a} \\times ${a} \\times 6 \\times 2 = ${12 * a * a}$`, `붙은 면 $2$ 개가 겉면에서 빠져요: $${a * a} \\times 2 = ${2 * a * a}$`, `$${12 * a * a} - ${2 * a * a} = ${10 * a * a}$ (cm²)`],
        };
      }
      if (level === 2) {
        const a = r.int(2, 8),
          n = r.int(3, 8);
        return {
          q: `한 모서리가 $${a}$ cm 인 정육면체 $${n}$ 개를 한 줄로 꼭 맞게 붙여 직육면체를 만들었습니다. 만든 직육면체의 겉넓이는 몇 cm² 인가요?`,
          answer: intAns((4 * n + 2) * a * a, 'cm²'),
          steps: [
            `직육면체: 가로 $${n * a}$ cm, 세로 $${a}$ cm, 높이 $${a}$ cm`,
            `겉넓이: $(${n * a} \\times ${a} + ${a} \\times ${a} + ${n * a} \\times ${a}) \\times 2$`,
            `$= (${n * a * a} + ${a * a} + ${n * a * a}) \\times 2 = ${(4 * n + 2) * a * a}$ (cm²)`,
          ],
        };
      }
      const [a, b, c] = r.sample([2, 3, 4, 5, 6, 7, 8, 9, 10, 12], 3);
      const A = a * b,
        B = b * c,
        C = a * c;
      return {
        q: `모서리의 길이가 모두 자연수(cm)인 직육면체가 있습니다. 서로 다른 세 면의 넓이가 각각 $${A}$ cm², $${B}$ cm², $${C}$ cm² 일 때, 이 직육면체의 부피는 몇 cm³ 인가요?`,
        answer: intAns(a * b * c, 'cm³'),
        steps: [
          '가로·세로·높이를 ㉠, ㉡, ㉢ 이라 하면 ㉠ $\\times$ ㉡ $=' + ` ${A}$, ㉡ $\\times$ ㉢ $= ${B}$, ㉠ $\\times$ ㉢ $= ${C}$`,
          `두 넓이에 함께 들어 있는 모서리를 찾아요: $${A}$ 와 $${B}$ 에 모두 ㉡ 이 들어 있어요.`,
          `곱해서 $${A}$, $${B}$, $${C}$ 가 모두 맞는 세 수를 찾으면 ㉠ $= ${a}$, ㉡ $= ${b}$, ㉢ $= ${c}$`,
          `확인: $${a} \\times ${b} = ${A}$, $${b} \\times ${c} = ${B}$, $${a} \\times ${c} = ${C}$`,
          `부피: $${a} \\times ${b} \\times ${c} = ${a * b * c}$ (cm³)`,
        ],
        hint: '두 면이 함께 가지는 모서리를 생각해 보세요.',
      };
    }
  },
};

const e6a6Cut: Skill = {
  id: 'top-cut-surface',
  title: '직육면체를 잘랐을 때 늘어나는 겉넓이',
  gen(r) {
    if (r.chance(0.6)) {
      const a = r.int(4, 15),
        b = r.int(3, 12),
        c = r.int(2, 10);
      const p = r.int(1, 4),
        q = r.int(1, 4),
        s = r.int(1, 3);
      if (p * q * s < 3) return e6a6Cut.gen(r, 3);
      const orig = 2 * (a * b + b * c + a * c);
      const inc = 2 * ((p - 1) * b * c + (q - 1) * a * c + (s - 1) * a * b);
      const askTot = r.chance(0.5);
      return {
        q: `가로 $${a}$ cm, 세로 $${b}$ cm, 높이 $${c}$ cm 인 직육면체 모양 두부를 ${[p > 1 ? `가로는 $${p}$ 등분` : '', q > 1 ? `세로는 $${q}$ 등분` : '', s > 1 ? `높이는 $${s}$ 등분` : ''].filter(Boolean).join(', ')}이 되도록 면에 평행하게 잘라 작은 직육면체 $${p * q * s}$ 조각을 만들었습니다. ${askTot ? '작은 조각들의 겉넓이를 모두 더하면 몇 cm² 인가요?' : '작은 조각들의 겉넓이의 합은 처음 두부의 겉넓이보다 몇 cm² 늘어났나요?'}`,
        answer: intAns(askTot ? orig + inc : inc, 'cm²'),
        steps: [
          '한 번 자를 때마다 자른 면(단면) $2$ 개만큼 겉넓이가 늘어나요.',
          ...(p > 1 ? [`가로를 $${p}$ 등분 → $${p - 1}$ 번, 단면은 세로 $\\times$ 높이 $= ${b * c}$ cm² → $${b * c} \\times 2 \\times ${p - 1} = ${2 * (p - 1) * b * c}$`] : []),
          ...(q > 1 ? [`세로를 $${q}$ 등분 → $${q - 1}$ 번, 단면은 가로 $\\times$ 높이 $= ${a * c}$ cm² → $${a * c} \\times 2 \\times ${q - 1} = ${2 * (q - 1) * a * c}$`] : []),
          ...(s > 1 ? [`높이를 $${s}$ 등분 → $${s - 1}$ 번, 단면은 가로 $\\times$ 세로 $= ${a * b}$ cm² → $${a * b} \\times 2 \\times ${s - 1} = ${2 * (s - 1) * a * b}$`] : []),
          `늘어난 겉넓이: $${[2 * (p - 1) * b * c, 2 * (q - 1) * a * c, 2 * (s - 1) * a * b].filter((v) => v > 0).join(' + ')} = ${inc}$ (cm²)`,
          ...(askTot ? [`처음 겉넓이 $${orig}$ cm² 와 더하면 $${orig + inc}$ (cm²)`] : []),
        ],
        hint: '한 번 자르면 새로 생기는 면이 몇 개인지 생각해 보세요.',
      };
    }
    const k = r.int(1, 4),
      n = r.int(2, 6);
    return {
      q: `한 모서리가 $${n * k}$ cm 인 정육면체를 한 모서리가 $${k}$ cm 인 작은 정육면체로 빈틈없이 모두 잘랐습니다. 작은 정육면체들의 겉넓이를 모두 더하면 처음 정육면체의 겉넓이의 몇 배인가요?`,
      answer: intAns(n, '배'),
      steps: [
        `처음 겉넓이: $${n * k} \\times ${n * k} \\times 6 = ${6 * n * n * k * k}$ (cm²)`,
        `작은 정육면체 수: $${n} \\times ${n} \\times ${n} = ${n ** 3}$ (개)`,
        `작은 정육면체 하나의 겉넓이: $${k} \\times ${k} \\times 6 = ${6 * k * k}$ (cm²)`,
        `모두: $${6 * k * k} \\times ${n ** 3} = ${6 * k * k * n ** 3}$ (cm²)`,
        `$${6 * k * k * n ** 3} \\div ${6 * n * n * k * k} = ${n}$ (배)`,
      ],
      hint: '작은 정육면체의 개수와 하나의 겉넓이를 각각 구해 보세요.',
    };
  },
};

const e6a6Box: Skill = {
  id: 'top-open-box',
  title: '종이를 잘라 만든 상자의 가장 큰 부피',
  gen(r) {
    const W = r.int(10, 30),
      H = r.int(10, 30);
    const mx = Math.floor((Math.min(W, H) - 1) / 2);
    const rows = Array.from({ length: mx }, (_, i) => {
      const x = i + 1;
      return { x, v: (W - 2 * x) * (H - 2 * x) * x };
    });
    const best = rows.reduce((m0, o) => (o.v > m0.v ? o : m0));
    const show = rows.filter((o) => Math.abs(o.x - best.x) <= 2);
    return {
      q: `가로 $${W}$ cm, 세로 $${H}$ cm 인 직사각형 모양 종이의 네 귀퉁이에서 똑같은 크기의 정사각형을 잘라 내고 접어서 뚜껑이 없는 직육면체 모양 상자를 만들려고 합니다. 잘라 내는 정사각형의 한 변이 자연수(cm)일 때, 만들 수 있는 상자의 부피 중 가장 큰 부피는 몇 cm³ 인가요?`,
      answer: intAns(best.v, 'cm³'),
      steps: [
        '잘라 낸 정사각형의 한 변을 □ cm 라 하면 상자의 높이는 □ cm',
        `밑면: 가로 $${W} - \\square \\times 2$, 세로 $${H} - \\square \\times 2$`,
        ...show.map((o) => `□ $= ${o.x}$: $${W - 2 * o.x} \\times ${H - 2 * o.x} \\times ${o.x} = ${o.v}$`),
        `□ 가 커지면 높이는 높아지지만 밑면이 작아져요. 비교하면 □ $= ${best.x}$ 일 때 가장 커요.`,
        `가장 큰 부피: $${best.v}$ cm³`,
      ],
      hint: '잘라 내는 길이를 1 cm, 2 cm, … 로 바꾸며 표를 만들어 보세요.',
    };
  },
};

// ═════════ 6-2-1 분수의 나눗셈 ═════════
const e6b1Hard: Skill = {
  id: 'hard-div-range',
  title: '분수의 나눗셈에서 □ 안에 들어갈 자연수',
  gen(r, level) {
    const rf = () => {
      const d = r.int(2, 9);
      return new F(r.int(1, 2 * d), d);
    };
    for (;;) {
      if (level === 1) {
        const a = rf(),
          b = rf();
        const q = a.div(b);
        if (q.isInt() || q.value > 30 || q.value < 1) continue;
        const ans = Math.floor(q.value) + 1;
        return {
          q: `$\\square$ 안에 들어갈 수 있는 자연수 중에서 가장 작은 수를 구하세요.\n$$${mt(a)} \\div ${mt(b)} < \\square$$`,
          answer: intAns(ans),
          steps: [`$${mt(a)} \\div ${mt(b)} = ${ft(a)} \\times ${ft(b.inv())} = ${mt(q)}$`, `$${mt(q)} < \\square$ 이므로 $\\square$ 는 $${Math.floor(q.value)}$ 보다 커야 해요.`, `가장 작은 자연수: $${ans}$`],
        };
      }
      if (level === 2) {
        const a = rf(),
          b = rf(),
          c = rf(),
          d = rf();
        const q1 = a.div(b),
          q2 = c.div(d);
        if (q1.cmp(q2) >= 0) continue;
        const ns: number[] = [];
        for (let k = 1; k <= 60; k++) if (q1.cmp(k) < 0 && q2.cmp(k) > 0) ns.push(k);
        if (ns.length < 2 || ns.length > 12) continue;
        return {
          q: `$\\square$ 안에 들어갈 수 있는 자연수는 모두 몇 개인가요?\n$$${mt(a)} \\div ${mt(b)} < \\square < ${mt(c)} \\div ${mt(d)}$$`,
          answer: intAns(ns.length, '개'),
          steps: [`$${mt(a)} \\div ${mt(b)} = ${mt(q1)}$`, `$${mt(c)} \\div ${mt(d)} = ${mt(q2)}$`, `$${mt(q1)} < \\square < ${mt(q2)}$ → $\\square = ${ns[0]}, \\ldots, ${ns[ns.length - 1]}$`, `모두 $${ns.length}$ 개`],
        };
      }
      const p = r.int(2, 9),
        m = r.int(2, 9);
      const R = rf();
      const ns: number[] = [];
      for (let k = 1; k <= 200; k++) if (new F(p * m, k).cmp(R) > 0) ns.push(k);
      if (ns.length < 2 || ns.length > 15) continue;
      const lim = new F(p * m).div(R);
      return {
        q: `$\\square$ 안에 들어갈 수 있는 자연수는 모두 몇 개인가요?\n$$${p} \\div \\frac{\\square}{${m}} > ${mt(R)}$$`,
        answer: intAns(ns.length, '개'),
        steps: [
          `$${p} \\div \\frac{\\square}{${m}} = ${p} \\times \\frac{${m}}{\\square} = \\frac{${p * m}}{\\square}$`,
          `$\\frac{${p * m}}{\\square} > ${mt(R)}$ 이려면 $\\square < ${p * m} \\div ${mt(R)} = ${mt(lim)}$`,
          `$\\square$ 는 $1$ 부터 $${ns[ns.length - 1]}$ 까지 → $${ns.length}$ 개`,
        ],
        hint: '나눗셈을 곱셈으로 바꾸어 □ 가 어디에 있는지 보세요.',
      };
    }
  },
};

const e6b1Work: Skill = {
  id: 'top-work',
  title: '일의 양을 1로 보고 걸리는 시간 구하기',
  gen(r) {
    for (;;) {
      const t = r.int(0, 3);
      const [n1, n2] = pickNames(r, 2);
      const a = r.int(2, 15),
        b = r.int(3, 20);
      if (a === b) continue;
      const ra = new F(1, a),
        rb = new F(1, b);
      if (t === 0) {
        const ans = new F(1).div(ra.add(rb));
        return {
          q: `어떤 일을 ${josa(n1, '이/가')} 혼자 하면 $${a}$ 일, ${josa(n2, '이/가')} 혼자 하면 $${b}$ 일 걸립니다. 두 사람이 함께 하면 이 일을 마치는 데 며칠이 걸리나요? (기약분수로 나타내세요.)`,
          answer: fracAns(ans, { unit: '일' }),
          steps: [
            '전체 일의 양을 $1$ 로 생각해요.',
            `하루에 ${n1}: $\\frac{1}{${a}}$, ${n2}: $\\frac{1}{${b}}$`,
            `함께 하루에: $\\frac{1}{${a}} + \\frac{1}{${b}} = ${ft(ra.add(rb))}$`,
            `걸리는 날: $1 \\div ${ft(ra.add(rb))} = ${mt(ans)}$ (일)`,
          ],
          hint: '하루에 하는 일의 양을 분수로 나타내 보세요.',
        };
      }
      if (t === 1) {
        const c = r.int(2, a - 1);
        if (c < 2) continue;
        const rB = new F(1, c).sub(ra);
        if (rB.n <= 0) continue;
        const ans = new F(1).div(rB);
        if (ans.value > 60) continue;
        return {
          q: `어떤 일을 ${josa(n1, '이/가')} 혼자 하면 $${a}$ 일 걸리고, ${josa(n1, '과/와')} ${josa(n2, '이/가')} 함께 하면 $${c}$ 일 걸립니다. ${josa(n2, '이/가')} 혼자 하면 이 일을 마치는 데 며칠이 걸리나요? (기약분수로 나타내세요.)`,
          answer: fracAns(ans, { unit: '일' }),
          steps: [
            '전체 일의 양을 $1$ 로 생각해요.',
            `함께 하루에 $\\frac{1}{${c}}$, ${n1} 혼자 하루에 $\\frac{1}{${a}}$`,
            `${n2} 혼자 하루에: $\\frac{1}{${c}} - \\frac{1}{${a}} = ${ft(rB)}$`,
            `걸리는 날: $1 \\div ${ft(rB)} = ${mt(ans)}$ (일)`,
          ],
        };
      }
      if (t === 2) {
        const d = r.int(1, a - 1);
        const rest = new F(1).sub(new F(d, a));
        const ans = rest.div(ra.add(rb));
        return {
          q: `어떤 일을 ${josa(n1, '이/가')} 혼자 하면 $${a}$ 일, ${josa(n2, '이/가')} 혼자 하면 $${b}$ 일 걸립니다. 이 일을 ${josa(n1, '이/가')} 혼자 $${d}$ 일 동안 한 뒤, 나머지를 두 사람이 함께 하였습니다. 두 사람이 함께 한 날은 며칠인가요? (기약분수로 나타내세요.)`,
          answer: fracAns(ans, { unit: '일' }),
          steps: [
            '전체 일의 양을 $1$ 로 생각해요.',
            `${n1} 혼자 $${d}$ 일 동안 한 일: $\\frac{1}{${a}} \\times ${d} = ${ft(new F(d, a))}$`,
            `남은 일: $1 - ${ft(new F(d, a))} = ${ft(rest)}$`,
            `함께 하루에: $\\frac{1}{${a}} + \\frac{1}{${b}} = ${ft(ra.add(rb))}$`,
            `함께 한 날: $${ft(rest)} \\div ${ft(ra.add(rb))} = ${mt(ans)}$ (일)`,
          ],
        };
      }
      if (b <= a) continue;
      const net = ra.sub(rb);
      const ans = new F(1).div(net);
      if (ans.value > 120) continue;
      return {
        q: `빈 물탱크에 수도꼭지 ㉮로 물을 넣으면 $${a}$ 분 만에 가득 찹니다. 가득 찬 물탱크의 물은 배수구 ㉯로 $${b}$ 분 만에 모두 빠집니다. 빈 물탱크에 ㉮로 물을 넣으면서 동시에 ㉯도 열어 두면 물탱크가 가득 차는 데 몇 분이 걸리나요? (기약분수로 나타내세요.)`,
        answer: fracAns(ans, { unit: '분' }),
        steps: [
          '물탱크 전체를 $1$ 로 생각해요.',
          `1분에 ㉮로 $\\frac{1}{${a}}$ 차고, ㉯로 $\\frac{1}{${b}}$ 빠져요.`,
          `1분에 실제로 차는 양: $\\frac{1}{${a}} - \\frac{1}{${b}} = ${ft(net)}$`,
          `가득 차는 시간: $1 \\div ${ft(net)} = ${mt(ans)}$ (분)`,
        ],
      };
    }
  },
};

const e6b1Small: Skill = {
  id: 'top-smallest-frac',
  title: '나누어도(곱해도) 자연수가 되는 가장 작은 분수',
  gen(r) {
    for (;;) {
      const mk = () => {
        const d = r.int(2, 15);
        return new F(r.int(d + 1, 3 * d), d);
      };
      const f1 = mk(),
        f2 = mk();
      if (f1.isInt() || f2.isInt() || f1.eq(f2)) continue;
      const mul = r.chance(0.4);
      // 나눌 때: x ÷ (n/d) = x × d/n → 분자는 n 의 배수, 분모는 d 의 약수
      const N = mul ? lcm(f1.d, f2.d) : lcm(f1.n, f2.n);
      const D = mul ? gcd(f1.n, f2.n) : gcd(f1.d, f2.d);
      const ans = new F(N, D);
      if (ans.isInt() || D === 1 || N > 400) continue;
      return {
        q: `${mul ? `어떤 분수에 $${mt(f1)}$ 를 곱해도, $${mt(f2)}$ 를 곱해도` : `어떤 분수를 $${mt(f1)}$ 로 나누어도, $${mt(f2)}$ 로 나누어도`} 계산 결과가 모두 자연수가 됩니다. 이런 분수 중에서 가장 작은 분수를 기약분수로 나타내세요.`,
        answer: fracAns(ans),
        steps: [
          mul
            ? `$${mt(f1)} = ${ft(f1)}$, $${mt(f2)} = ${ft(f2)}$ 를 곱해서 자연수가 되려면, 어떤 분수의 분모가 약분되어 없어지고 분자가 $${f1.d}$, $${f2.d}$ 로 약분되어야 해요.`
            : `$\\div ${ft(f1)}$ 는 $\\times ${ft(f1.inv())}$, $\\div ${ft(f2)}$ 는 $\\times ${ft(f2.inv())}$ 예요.`,
          mul ? `→ 분자는 $${f1.d}$ 와 $${f2.d}$ 의 공배수, 분모는 $${f1.n}$ 과 $${f2.n}$ 의 공약수` : `어떤 분수의 분자는 $${f1.n}$ 과 $${f2.n}$ 의 공배수, 분모는 $${f1.d}$ 와 $${f2.d}$ 의 공약수여야 해요.`,
          '가장 작은 분수는 분자는 가장 작게(최소공배수), 분모는 가장 크게(최대공약수) 해요.',
          mul ? `분자: $${f1.d}$ 와 $${f2.d}$ 의 최소공배수 $${N}$, 분모: $${f1.n}$ 과 $${f2.n}$ 의 최대공약수 $${D}$` : `분자: $${f1.n}$ 과 $${f2.n}$ 의 최소공배수 $${N}$, 분모: $${f1.d}$ 와 $${f2.d}$ 의 최대공약수 $${D}$`,
          `가장 작은 분수: $\\frac{${N}}{${D}} = ${mt(ans)}$`,
          `확인: $${ft(ans)} ${mul ? '\\times' : '\\div'} ${ft(f1)} = ${ft(mul ? ans.mul(f1) : ans.div(f1))}$, $${ft(ans)} ${mul ? '\\times' : '\\div'} ${ft(f2)} = ${ft(mul ? ans.mul(f2) : ans.div(f2))}$`,
        ],
        hint: '대분수를 가분수로 바꾸고, 결과가 자연수가 되려면 약분이 어떻게 되어야 하는지 생각해 보세요.',
      };
    }
  },
};

// ═════════ 6-2-2 소수의 나눗셈 ═════════
const DA = [0.4, 0.5, 0.8, 1.2, 1.5, 2.5, 0.25, 0.6, 1.6, 0.2, 2.4, 3.5];
const e6b2Hard: Skill = {
  id: 'hard-wrong-dec',
  title: '잘못 계산한 소수의 나눗셈 바르게 하기',
  gen(r, level) {
    for (;;) {
      const a = r.pick(DA);
      if (level === 1) {
        const q = round(r.int(11, 99) / 10, 4);
        const x = round(q * a, 6),
          c = round(x * a, 6);
        if ((String(c).split('.')[1] ?? '').length > 4) continue;
        return {
          q: `어떤 수에 $${dt(a)}$ 를 곱해야 할 것을 잘못하여 $${dt(a)}$ 로 나누었더니 $${dt(q)}$ 가 되었습니다. 바르게 계산한 값을 구하세요.`,
          answer: decAns(c),
          steps: [`어떤 수 $\\div ${dt(a)} = ${dt(q)}$ → 어떤 수 $= ${dt(q)} \\times ${dt(a)} = ${dt(x)}$`, `바른 계산: $${dt(x)} \\times ${dt(a)} = ${dt(c)}$`],
        };
      }
      if (level === 2) {
        const c = round(r.int(11, 99) / 10, 4);
        const x = round(c * a, 6),
          P = round(x * a, 6);
        if ((String(P).split('.')[1] ?? '').length > 4) continue;
        return {
          q: `어떤 수를 $${dt(a)}$ 로 나누어야 할 것을 잘못하여 $${dt(a)}$ 를 곱했더니 $${dt(P)}$ 가 되었습니다. 바르게 계산한 몫을 구하세요.`,
          answer: decAns(c),
          steps: [`어떤 수 $\\times ${dt(a)} = ${dt(P)}$ → 어떤 수 $= ${dt(P)} \\div ${dt(a)} = ${dt(x)}$`, `바른 계산: $${dt(x)} \\div ${dt(a)} = ${dt(c)}$`],
          hint: '먼저 거꾸로 계산해 어떤 수를 구하세요.',
        };
      }
      const c0 = round(r.int(11, 99) / 10, 4);
      const b = round(r.int(3, 30) / 10, 4);
      const x = round(c0 * a, 6);
      const W = round(x * a - b, 6);
      if (W <= 0 || (String(W).split('.')[1] ?? '').length > 4) continue;
      const ans = round(c0 + b, 6);
      return {
        q: `어떤 수를 $${dt(a)}$ 로 나눈 뒤 $${dt(b)}$ 를 더해야 할 것을 잘못하여 $${dt(a)}$ 를 곱한 뒤 $${dt(b)}$ 를 뺐더니 $${dt(W)}$ 가 되었습니다. 바르게 계산한 값을 구하세요.`,
        answer: decAns(ans),
        steps: [
          '잘못한 계산을 거꾸로 풀어 어떤 수를 구해요.',
          `(어떤 수) $\\times ${dt(a)} - ${dt(b)} = ${dt(W)}$ → (어떤 수) $\\times ${dt(a)} = ${dt(round(W + b, 6))}$`,
          `어떤 수 $= ${dt(round(W + b, 6))} \\div ${dt(a)} = ${dt(x)}$`,
          `바른 계산: $${dt(x)} \\div ${dt(a)} + ${dt(b)} = ${dt(c0)} + ${dt(b)} = ${dt(ans)}$`,
        ],
      };
    }
  },
};

const e6b2Train: Skill = {
  id: 'top-train',
  title: '기차가 터널·다리를 지나는 문제',
  gen(r) {
    for (;;) {
      const t = r.int(0, 2);
      const v = round(r.int(150, 350) / 10, 4);
      const c = r.int(20, 90);
      const tot = round(v * c, 4);
      if (t === 0) {
        const a = r.int(10, 30) * 10;
        const b = round(tot - a, 4);
        if (b < 200 || !Number.isInteger(b)) continue;
        return {
          q: `길이가 $${a}$ m 인 기차가 일정한 빠르기로 길이가 $${comma(b)}$ m 인 터널을 완전히 통과하는 데 $${c}$ 초가 걸렸습니다. 이 기차는 $1$ 초에 몇 m 를 가나요?`,
          answer: decAns(v, 'm'),
          steps: [
            '기차의 맨 앞이 터널에 들어갈 때부터 맨 뒤가 터널을 빠져나올 때까지가 "완전히 통과"예요.',
            `그동안 기차가 간 거리 $=$ (터널 길이) $+$ (기차 길이) $= ${comma(b)} + ${a} = ${comma(tot)}$ (m)`,
            `$1$ 초에 간 거리: $${comma(tot)} \\div ${c} = ${dt(v)}$ (m)`,
          ],
          hint: '기차의 길이도 움직인 거리에 들어가요.',
        };
      }
      if (t === 1) {
        const b = r.int(20, 120) * 10;
        const a = round(tot - b, 4);
        if (a < 60 || a > 400 || !Number.isInteger(a)) continue;
        return {
          q: `$1$ 초에 $${dt(v)}$ m 를 가는 기차가 길이가 $${comma(b)}$ m 인 다리를 완전히 건너는 데 $${c}$ 초가 걸렸습니다. 이 기차의 길이는 몇 m 인가요?`,
          answer: decAns(a, 'm'),
          steps: [`$${c}$ 초 동안 간 거리: $${dt(v)} \\times ${c} = ${comma(tot)}$ (m)`, '이 거리는 (다리 길이) $+$ (기차 길이)', `기차 길이: $${comma(tot)} - ${comma(b)} = ${dt(a)}$ (m)`],
          hint: '다리를 완전히 건너려면 기차 길이만큼 더 가야 해요.',
        };
      }
      const a = r.int(10, 30) * 10;
      const b = round(tot + a, 4);
      if (!Number.isInteger(b)) continue;
      return {
        q: `$1$ 초에 $${dt(v)}$ m 를 가는 길이 $${a}$ m 인 기차가 길이 $${comma(b)}$ m 인 터널을 지나갑니다. 기차가 터널 안에 완전히 들어가 밖에서 전혀 보이지 않는 시간은 몇 초인가요?`,
        answer: intAns(c, '초'),
        steps: [
          '기차의 맨 뒤가 터널에 들어간 순간부터 맨 앞이 터널을 나오기 직전까지 보이지 않아요.',
          `그동안 간 거리 $=$ (터널 길이) $-$ (기차 길이) $= ${comma(b)} - ${a} = ${comma(tot)}$ (m)`,
          `시간: $${comma(tot)} \\div ${dt(v)} = ${c}$ (초)`,
        ],
        hint: '보이지 않는 동안 기차가 움직인 거리를 그림으로 그려 보세요.',
      };
    }
  },
};

function decDigits(A: number, B: number, n: number): number[] {
  const out: number[] = [];
  let rem = A % B;
  for (let i = 0; i < n; i++) {
    rem *= 10;
    out.push(Math.floor(rem / B));
    rem %= B;
  }
  return out;
}
const e6b2Rep: Skill = {
  id: 'top-repeat-digit',
  title: '몫의 소수점 아래 숫자가 되풀이되는 규칙',
  gen(r) {
    for (;;) {
      const B0 = r.pick([7, 11, 13, 21, 27, 33, 37, 41]);
      const A0 = r.int(1, 3 * B0);
      const g = gcd(A0, B0);
      const A = A0 / g,
        B = B0 / g;
      if (B === 1 || A % B === 0) continue;
      const digs = decDigits(A, B, 200);
      let per = 1;
      while (per < 100) {
        let ok = true;
        for (let i = 0; i + per < 60; i++) if (digs[i] !== digs[i + per]) ok = false;
        if (ok) break;
        per++;
      }
      if (per < 2) continue;
      const n = r.int(per + 10, 100);
      const askSum = r.chance(0.4);
      const useDec = r.chance(0.5);
      const qt = useDec ? `${dt(A0 / 10)} \\div ${dt(B0 / 10)}` : `${A0} \\div ${B0}`;
      const pat = digs.slice(0, per);
      const full = Math.floor(n / per),
        rem = n % per;
      const sm = full * sum(pat) + sum(pat.slice(0, rem));
      const ans = askSum ? sm : digs[n - 1];
      const ip = Math.floor(A / B);
      return {
        q: `몫을 소수로 나타낼 때, ${askSum ? `소수 첫째 자리부터 소수 $${n}$ 째 자리까지의 숫자를 모두 더하면 얼마인가요?` : `소수 $${n}$ 째 자리 숫자를 구하세요.`}\n$$${qt}$$`,
        answer: intAns(ans),
        steps: [
          ...(useDec ? [`$${qt} = ${A0} \\div ${B0}$ (두 수에 똑같이 $10$ 을 곱해도 몫은 같아요.)`] : []),
          `나누어 보면 $${ip}.${digs.slice(0, per * 2).join('')}\\cdots$`,
          `소수점 아래에서 $${pat.join(', ')}$ 의 $${per}$ 개 숫자가 되풀이돼요.`,
          `$${n} \\div ${per} = ${full} \\cdots ${rem}$`,
          askSum
            ? `한 묶음의 합 $${sum(pat)}$ 이 $${full}$ 번, 나머지 $${rem}$ 개의 합 $${sum(pat.slice(0, rem))}$ → $${sum(pat)} \\times ${full} + ${sum(pat.slice(0, rem))} = ${sm}$`
            : `${rem === 0 ? `되풀이의 마지막 숫자` : `되풀이의 $${rem}$ 번째 숫자`} → $${ans}$`,
        ],
        hint: '몇 자리까지 나누어 보고 되풀이되는 숫자를 찾아보세요.',
      };
    }
  },
};

// ═════════ 6-2-3 공간과 입체 ═════════
function viewsFig(foot: boolean[][], front: number[], side: number[]): string {
  const R = foot.length,
    C = foot[0].length;
  const u = 20;
  const mh = Math.max(...front, ...side);
  const H = Math.max(R, mh) * u + 40;
  const W = C * u + C * u + R * u + 90;
  const S = new Svg(W, H);
  const by = H - 22;
  let x = 10;
  for (let r0 = 0; r0 < R; r0++) for (let c = 0; c < C; c++) if (foot[r0][c]) S.rect(x + c * u, by - (R - r0) * u, u, u, { cls: 'acc', fill: true });
  S.text(x + (C * u) / 2, by + 12, '위', { size: 11, cls: 'muted' });
  x += C * u + 35;
  front.forEach((h, c) => {
    for (let k = 0; k < h; k++) S.rect(x + c * u, by - (k + 1) * u, u, u, { cls: 'acc', fill: true });
  });
  S.text(x + (C * u) / 2, by + 12, '앞', { size: 11, cls: 'muted' });
  x += C * u + 35;
  side.forEach((h, i) => {
    for (let k = 0; k < h; k++) S.rect(x + i * u, by - (k + 1) * u, u, u, { cls: 'acc', fill: true });
  });
  S.text(x + (R * u) / 2, by + 12, '오른쪽 옆', { size: 11, cls: 'muted' });
  return S.toString();
}
const e6b3Hard: Skill = {
  id: 'hard-views-count',
  title: '위·앞·옆 모양으로 쌓기나무가 가장 많을 때(적을 때)',
  gen(r, level) {
    const [R, C] = level === 1 ? [2, 2] : level === 2 ? [2, 3] : [3, 3];
    for (;;) {
      const Hs = Array.from({ length: R }, () => Array.from({ length: C }, () => r.int(1, 3)));
      if (level === 3) {
        const holes = r.int(0, 2);
        for (let k = 0; k < holes; k++) Hs[r.int(0, R - 1)][r.int(0, C - 1)] = 0;
      }
      const foot = Hs.map((row) => row.map((h) => h > 0));
      if (foot.some((row) => !row.some(Boolean)) || [...Array(C).keys()].some((c) => !foot.some((row) => row[c]))) continue;
      const front = [...Array(C).keys()].map((c) => Math.max(...Hs.map((row) => row[c])));
      const sideBR = Hs.map((row) => Math.max(...row)); // 행 0 = 뒤
      const side = [...sideBR].reverse(); // 왼쪽 = 앞줄
      const cells: [number, number][] = [];
      for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) if (foot[i][j]) cells.push([i, j]);
      let mn = Infinity,
        mx = -Infinity,
        mnA: number[][] = [],
        mxA: number[][] = [];
      const cur = Hs.map((row) => row.map(() => 0));
      const rec = (k: number) => {
        if (k === cells.length) {
          for (let c = 0; c < C; c++) if (Math.max(...cur.map((row) => row[c])) !== front[c]) return;
          for (let i = 0; i < R; i++) if (Math.max(...cur[i]) !== sideBR[i]) return;
          const s = sum(cur.flat());
          if (s < mn) {
            mn = s;
            mnA = cur.map((row) => row.slice());
          }
          if (s > mx) {
            mx = s;
            mxA = cur.map((row) => row.slice());
          }
          return;
        }
        const [i, j] = cells[k];
        for (let h = 1; h <= Math.min(front[j], sideBR[i]); h++) {
          cur[i][j] = h;
          rec(k + 1);
        }
        cur[i][j] = 0;
      };
      rec(0);
      if (mn === mx) continue;
      const askMin = level === 3 && r.chance(0.6);
      const rowName = (i: number) => (R === 2 ? ['뒷줄', '앞줄'][i] : ['뒷줄', '가운데 줄', '앞줄'][i]);
      const arr = (A: number[][]) => A.map((row, i) => `${rowName(i)}: $${row.map((h) => (h ? h : '\\times')).join(',\\ ')}$`).join(', ');
      return {
        q: `쌓기나무로 쌓은 모양을 위, 앞, 오른쪽 옆에서 본 모양입니다. 쌓기나무를 ${askMin ? '가장 적게' : '가장 많이'} 사용했을 때 쌓기나무는 몇 개인가요?`,
        fig: viewsFig(foot, front, side),
        answer: intAns(askMin ? mn : mx, '개'),
        steps: askMin
          ? [
              `앞에서 본 높이(왼쪽부터): $${front.join(', ')}$, 오른쪽 옆에서 본 높이(앞줄부터): $${side.join(', ')}$`,
              '위에서 본 모양의 칸마다 적어도 $1$ 개는 있어야 하고, 앞·옆에서 본 가장 높은 층이 한 번씩은 나타나야 해요.',
              '높은 층은 앞과 옆의 높이가 함께 맞는 칸에 놓아 두 조건을 한꺼번에 채우면 적게 쓸 수 있어요.',
              `가장 적은 경우 (위에서 본 모양의 칸마다 개수): ${arr(mnA)}`,
              `모두 $${mn}$ 개`,
            ]
          : [
              `앞에서 본 높이(왼쪽부터): $${front.join(', ')}$, 오른쪽 옆에서 본 높이(앞줄부터): $${side.join(', ')}$`,
              '각 칸에는 그 칸이 속한 세로줄의 앞 높이와 가로줄의 옆 높이 중 작은 수만큼까지 쌓을 수 있어요.',
              `가장 많은 경우 (위에서 본 모양의 칸마다 개수): ${arr(mxA)}`,
              `모두 $${mx}$ 개`,
            ],
        hint: '위에서 본 모양의 칸마다 쌓을 수 있는 개수를 적어 보세요.',
      };
    }
  },
};

const e6b3Surf: Skill = {
  id: 'top-stack-surface',
  title: '쌓기나무로 쌓은 입체의 겉넓이',
  gen(r) {
    for (;;) {
      const R = r.int(2, 3),
        C = r.int(2, 3);
      const Hs = Array.from({ length: R }, () => Array.from({ length: C }, () => 0));
      for (let i = 0; i < R; i++)
        for (let j = 0; j < C; j++) {
          const lim = Math.min(i > 0 ? Hs[i - 1][j] : 4, j > 0 ? Hs[i][j - 1] : 4);
          Hs[i][j] = r.int(1, lim);
        }
      if (sum(Hs.flat()) < R * C + 2) continue;
      const e = r.int(1, 3);
      const T = R * C;
      const Fr = sum(Hs[0]);
      const Sd = sum(Hs.map((row) => row[0]));
      const noBottom = r.chance(0.4);
      const faces = 2 * (T + Fr + Sd) - (noBottom ? T : 0);
      const ans = faces * e * e;
      return {
        q: `한 모서리가 $${e}$ cm 인 쌓기나무로 쌓은 모양을 위에서 본 모양에 쌓은 개수를 쓴 것입니다. 쌓은 모양의 겉넓이${noBottom ? '(바닥에 닿은 면은 빼고)' : '(바닥에 닿은 면 포함)'}는 몇 cm² 인가요? (뒤쪽 줄과 왼쪽 줄일수록 낮지 않게 쌓았습니다.)`,
        fig: topViewFig(Hs),
        answer: intAns(ans, 'cm²'),
        steps: [
          '겉면은 위·아래, 앞·뒤, 왼쪽·오른쪽 여섯 방향에서 보이는 면으로 나누어 셀 수 있어요. (숨어서 안 보이는 면이 없는 모양)',
          `위에서 보이는 면 $${T}$ 개${noBottom ? '' : `, 아래(바닥) $${T}$ 개`}`,
          `앞에서 보이는 면: 세로줄마다 가장 높은 층 $${Hs[0].join(' + ')} = ${Fr}$ 개, 뒤에서도 $${Fr}$ 개`,
          `옆에서 보이는 면: 가로줄마다 가장 높은 층 $${Hs.map((row) => row[0]).join(' + ')} = ${Sd}$ 개, 반대쪽도 $${Sd}$ 개`,
          `면의 수: $${noBottom ? `${T} + ` : `${T} \\times 2 + `}${Fr} \\times 2 + ${Sd} \\times 2 = ${faces}$ (개)`,
          `겉넓이: $${faces} \\times ${e} \\times ${e} = ${ans}$ (cm²)`,
        ],
        hint: '여섯 방향에서 본 모양의 칸 수를 세어 보세요.',
      };
    }
  },
};

const e6b3Tun: Skill = {
  id: 'top-tunnel',
  title: '큰 정육면체를 뚫고 남은 쌓기나무 수',
  gen(r) {
    const n = r.pick([3, 5, 7]);
    const k = r.int(2, 3);
    const dirs = r.sample([0, 1, 2], k).sort();
    const m = (n - 1) / 2;
    const removed = new Set<string>();
    for (const d of dirs)
      for (let t = 0; t < n; t++) {
        const p = [m, m, m];
        p[d] = t;
        removed.add(p.join(','));
      }
    const rem = n ** 3 - removed.size;
    const dname = ['앞에서 뒤로', '위에서 아래로', '왼쪽에서 오른쪽으로'];
    return {
      q: `쌓기나무 $${n ** 3}$ 개로 한 모서리에 $${n}$ 개씩 놓인 큰 정육면체를 만들었습니다. ${dirs.map((d) => dname[d]).join(', ')} 각 면의 한가운데 칸을 반대쪽 면까지 곧게 뚫어 그 줄의 쌓기나무를 모두 빼냈습니다. 남은 쌓기나무는 몇 개인가요?`,
      answer: intAns(rem, '개'),
      steps: [
        `처음 쌓기나무: $${n} \\times ${n} \\times ${n} = ${n ** 3}$ (개)`,
        `한 방향으로 뚫으면 한 줄 $${n}$ 개를 빼요. ${k}방향이면 $${n} \\times ${k} = ${n * k}$ 개`,
        k > 1 ? `그런데 뚫은 줄들은 한가운데 쌓기나무 $1$ 개에서 겹쳐요. 겹친 것은 한 번만 빼야 해요.` : '한 방향만 뚫었으므로 겹치는 부분이 없어요.',
        k > 1 ? `빼낸 쌓기나무: $${n * k} - ${k - 1} = ${removed.size}$ (개)` : `빼낸 쌓기나무: $${n}$ 개`,
        `남은 쌓기나무: $${n ** 3} - ${removed.size} = ${rem}$ (개)`,
      ],
      hint: '여러 방향으로 뚫을 때 두 번 빼는 쌓기나무가 있는지 확인하세요.',
    };
  },
};

// ═════════ 6-2-4 비례식과 비례배분 ═════════
const e6b4Hard: Skill = {
  id: 'hard-chain-ratio',
  title: '연결된 비와 비례배분',
  gen(r, level) {
    for (;;) {
      const [n1, n2, n3] = pickNames(r, 3);
      if (level === 1) {
        const a = r.int(1, 9),
          b = r.int(1, 9);
        if (a === b || gcd(a, b) !== 1) continue;
        const N = (a + b) * r.int(3, 40);
        return {
          q: `구슬 $${N}$ 개를 ${josa(n1, '과/와')} ${n2}가 $${a} : ${b}$ 의 비로 나누어 가졌습니다. 두 사람이 가진 구슬 수의 차는 몇 개인가요?`.replace(`${n2}가`, josa(n2, '이/가')),
          answer: intAns((N * Math.abs(a - b)) / (a + b), '개'),
          steps: [
            `${n1}: $${N} \\times \\frac{${a}}{${a + b}} = ${(N * a) / (a + b)}$ (개)`,
            `${n2}: $${N} \\times \\frac{${b}}{${a + b}} = ${(N * b) / (a + b)}$ (개)`,
            `차: $${Math.abs((N * a) / (a + b) - (N * b) / (a + b))}$ (개)`,
          ],
        };
      }
      let x: number, y: number, z: number, cond: string, st: string[];
      if (level === 2) {
        const a = r.int(1, 6),
          b = r.int(2, 7),
          c = r.int(2, 7),
          d = r.int(1, 6);
        if (gcd(a, b) !== 1 || gcd(c, d) !== 1 || b === c) continue;
        const L = lcm(b, c);
        x = (a * L) / b;
        y = L;
        z = (d * L) / c;
        cond = `${n1}${jo(n1, '과/와')} ${n2}의 비는 $${a} : ${b}$, ${n2}${jo(n2, '과/와')} ${n3}의 비는 $${c} : ${d}$`;
        st = [`${n2}의 몫을 $${b}$ 와 $${c}$ 의 최소공배수 $${L}$ 로 맞춰요.`, `$${a} : ${b}${x === a ? '' : ` = ${x} : ${L}`}$, $${c} : ${d}${z === d ? '' : ` = ${L} : ${z}`}$`, `${n1} : ${n2} : ${n3} $= ${x} : ${y} : ${z}$`];
      } else {
        const p = r.int(1, 4),
          q = r.int(p + 1, 6),
          s = r.int(1, 4),
          t = r.int(s + 1, 6);
        if (gcd(p, q) !== 1 || gcd(s, t) !== 1 || p * t === q * s) continue;
        // 가 × p/q = 나 × s/t → 가 : 나 = s/t : p/q = s×q : p×t
        const g0 = gcd(s * q, p * t);
        x = (s * q) / g0;
        y = (p * t) / g0;
        z = 0;
        cond = `${n1}${jo(n1, '이/가')} 가진 돈의 $\\frac{${p}}{${q}}$ 와 ${n2}${jo(n2, '이/가')} 가진 돈의 $\\frac{${s}}{${t}}$ 가 같습니다`;
        st = [
          `${n1} $\\times \\frac{${p}}{${q}} =$ ${n2} $\\times \\frac{${s}}{${t}}$`,
          `${n1} : ${n2} $= \\frac{${s}}{${t}} : \\frac{${p}}{${q}}$ (곱한 수를 바꾸어 놓은 비)`,
          `양쪽에 $${q * t}$ 를 곱하면 $${s * q} : ${p * t}$ → 가장 간단한 비 $${x} : ${y}$`,
        ];
      }
      const tot = x + y + z;
      const g = level === 3 ? 1000 : 1;
      const N = tot * r.int(2, 20) * g;
      if (N > 200000) continue;
      const who = r.int(0, level === 3 ? 1 : 2);
      const parts = [x, y, z];
      const nm = [n1, n2, n3][who];
      const ans = (N * parts[who]) / tot;
      const unit = level === 3 ? '원' : '개';
      return {
        q: level === 3 ? `${cond}. 두 사람이 가진 돈의 합이 ${won(N)}일 때, ${nm}${jo(nm, '이/가')} 가진 돈은 얼마인가요?` : `사탕 $${N}$ 개를 세 사람이 나누어 가졌습니다. ${cond}입니다. ${nm}${jo(nm, '이/가')} 가진 사탕은 몇 개인가요?`,
        answer: intAns(ans, unit),
        steps: [...st, `${nm}: $${comma(N)} \\times \\frac{${parts[who]}}{${tot}} = ${comma(ans)}$ (${unit})`],
        hint: level === 2 ? '두 비에 함께 나오는 사람의 몫을 같은 수로 맞춰 보세요.' : '같은 양을 두 가지로 나타낸 식에서 비를 만들어 보세요.',
      };
    }
  },
};

const e6b4Gear: Skill = {
  id: 'top-gear-three',
  title: '여러 톱니바퀴의 회전수',
  gen(r) {
    for (;;) {
      if (r.chance(0.5)) {
        const [tA, tB, tC] = r.sample([12, 15, 16, 18, 20, 24, 25, 28, 30, 32, 36, 40, 45, 48], 3);
        const x = r.int(2, 30);
        const ans = (x * tA) / tC;
        if (!Number.isInteger(ans) || ans > 200) continue;
        return {
          q: `톱니바퀴 ㉮, ㉯, ㉰가 있습니다. ㉮와 ㉯가 맞물려 있고, ㉯와 ㉰가 맞물려 돌아갑니다. 톱니 수는 ㉮가 $${tA}$ 개, ㉯가 $${tB}$ 개, ㉰가 $${tC}$ 개입니다. ㉮가 $${x}$ 바퀴 도는 동안 ㉰는 몇 바퀴 도나요?`,
          answer: intAns(ans, '바퀴'),
          steps: [
            '맞물린 두 톱니바퀴는 지나간 톱니 수가 같아요: (톱니 수) $\\times$ (회전수)',
            `㉮가 $${x}$ 바퀴 → 지나간 톱니 $${tA} \\times ${x} = ${tA * x}$ 개 → ㉯도 $${tA * x}$ 개`,
            `㉯와 맞물린 ㉰도 톱니 $${tA * x}$ 개가 지나가요. (㉯의 톱니 수와 상관없어요.)`,
            `㉰의 회전수: $${tA * x} \\div ${tC} = ${ans}$ (바퀴)`,
          ],
          hint: '가운데 톱니바퀴를 지나도 지나간 톱니 수는 그대로예요.',
        };
      }
      const tA = r.pick([12, 15, 16, 18, 20, 21, 24, 27, 28, 30, 36]);
      const p = r.int(2, 9),
        q = r.int(2, 9);
      if (p === q || gcd(p, q) !== 1) continue;
      const tB = (tA * p) / q;
      if (!Number.isInteger(tB) || tB < 8 || tB > 80) continue;
      const L = lcm(tA, tB);
      const ask = r.chance(0.5);
      return {
        q: `맞물려 돌아가는 두 톱니바퀴 ㉮, ㉯가 있습니다. ㉮가 $${p}$ 바퀴 도는 동안 ㉯는 $${q}$ 바퀴 돕니다. ㉮의 톱니가 $${tA}$ 개일 때, ${ask ? '처음에 맞물렸던 두 톱니가 다시 처음으로 맞물리려면 ㉮는 적어도 몇 바퀴 돌아야 하나요?' : '㉯의 톱니는 몇 개인가요?'}`,
        answer: intAns(ask ? L / tA : tB, ask ? '바퀴' : '개'),
        steps: [
          `(톱니 수) $\\times$ (회전수) 가 같으므로 톱니 수의 비는 회전수의 비와 거꾸로: ㉮ : ㉯ $= ${q} : ${p}$`,
          `㉯의 톱니: $${tA} \\times \\frac{${p}}{${q}} = ${tB}$ (개)`,
          ...(ask
            ? [`다시 맞물릴 때까지 지나간 톱니 수는 $${tA}$ 와 $${tB}$ 의 공배수 → 최소공배수 $${L}$`, `㉮의 회전수: $${L} \\div ${tA} = ${L / tA}$ (바퀴)`]
            : []),
        ],
        hint: '많이 도는 톱니바퀴일수록 톱니 수가 적어요.',
      };
    }
  },
};

const e6b4Ov: Skill = {
  id: 'top-overlap-ratio',
  title: '겹친 부분의 비율로 두 도형의 넓이 구하기',
  gen(r) {
    for (;;) {
      const q1 = r.int(2, 7),
        p1 = r.int(1, q1 - 1),
        q2 = r.int(2, 7),
        p2 = r.int(1, q2 - 1);
      if (gcd(p1, q1) !== 1 || gcd(p2, q2) !== 1 || p1 * q2 === p2 * q1) continue;
      const k = r.int(1, 6);
      const O = k * p1 * p2;
      const A = (O * q1) / p1,
        B = (O * q2) / p2;
      const g = gcd(A, B);
      const a = A / g,
        b = B / g;
      const ask = r.int(0, 2);
      const asks = ['나의 넓이는', '겹치지 않은 부분의 넓이의 합은', '두 도형이 덮고 있는 전체 넓이는'];
      const ans = [B, A + B - 2 * O, A + B - O][ask];
      return {
        q: `도형 가와 나가 겹쳐 있습니다. 겹친 부분의 넓이는 가의 넓이의 $\\frac{${p1}}{${q1}}$ 이고, 나의 넓이의 $\\frac{${p2}}{${q2}}$ 입니다. 가와 나의 넓이의 합이 $${A + B}$ cm² 일 때, ${asks[ask]} 몇 cm² 인가요?`,
        answer: intAns(ans, 'cm²'),
        steps: [
          `가 $\\times \\frac{${p1}}{${q1}} =$ 나 $\\times \\frac{${p2}}{${q2}}$ (둘 다 겹친 부분)`,
          `가 : 나 $= \\frac{${p2}}{${q2}} : \\frac{${p1}}{${q1}} = ${p2 * q1} : ${p1 * q2}${a === p2 * q1 ? '' : ` = ${a} : ${b}`}$`,
          `가 $= ${A + B} \\times \\frac{${a}}{${a + b}} = ${A}$, 나 $= ${A + B} \\times \\frac{${b}}{${a + b}} = ${B}$ (cm²)`,
          `겹친 부분: $${A} \\times \\frac{${p1}}{${q1}} = ${O}$ (cm²)`,
          ask === 0 ? `나의 넓이: $${B}$ cm²` : ask === 1 ? `겹치지 않은 부분: $${A + B} - ${O} \\times 2 = ${ans}$ (cm²)` : `전체: $${A + B} - ${O} = ${ans}$ (cm²)`,
        ],
        hint: '겹친 부분을 가와 나로 각각 나타내어 비를 만들어 보세요.',
      };
    }
  },
};

// ═════════ 6-2-5 원의 넓이 ═════════
function trackPath(x0: number, y0: number, L: number, d: number): string {
  const rr = d / 2;
  return `M${x0},${y0} L${x0 + L},${y0} A${rr},${rr} 0 0 1 ${x0 + L},${y0 + d} L${x0},${y0 + d} A${rr},${rr} 0 0 1 ${x0},${y0} Z`;
}
const e6b5Hard: Skill = {
  id: 'hard-track',
  title: '운동장 트랙의 둘레와 넓이',
  gen(r, level) {
    const pi = level === 1 ? 3 : 3.14;
    const L = r.int(4, 12) * 10,
      d = r.int(3, 8) * 10;
    const w = r.int(1, 3);
    const s0 = 200 / (L + d + (level === 3 ? 4 * w * 3 : 0));
    const S = new Svg(260, Math.round(d * s0 + 60));
    const x0 = 20 + (d * s0) / 2 + (level === 3 ? 8 : 0),
      y0 = 30;
    if (level === 3) S.path(trackPath(x0, y0 - 12, L * s0, d * s0 + 24), { cls: 'acc2' });
    S.path(trackPath(x0, y0, L * s0, d * s0), { cls: 'acc', fill: level === 2 });
    S.line(x0, y0, x0, y0 + d * s0, { dash: true });
    S.line(x0 + L * s0, y0, x0 + L * s0, y0 + d * s0, { dash: true });
    S.text(x0 + (L * s0) / 2, y0 + 14, `${L} m`, { size: 12 });
    S.text(x0 + L * s0 - 22, y0 + (d * s0) / 2, `${d} m`, { size: 12 });
    if (level === 3) S.text(x0 + (L * s0) / 2, y0 - 20, `폭 ${w} m`, { size: 11, cls: 'acc2' });
    const fig = S.toString();
    if (level === 1) {
      const P = round(2 * L + pi * d, 6);
      return {
        q: `직사각형의 양쪽에 반원을 붙인 모양의 운동장 트랙입니다. 트랙의 둘레(파란 선)는 몇 m 인가요? ${piNote(pi)}`,
        fig,
        answer: decAns(P, 'm'),
        steps: [`곧은 부분: $${L} \\times 2 = ${2 * L}$ (m)`, `양쪽 반원 $2$ 개를 합하면 지름 $${d}$ m 인 원 하나: $${d} \\times ${dt(pi)} = ${dt(pi * d)}$ (m)`, `둘레: $${2 * L} + ${dt(pi * d)} = ${dt(P)}$ (m)`],
      };
    }
    if (level === 2) {
      const A = round(L * d + pi * (d / 2) ** 2, 6);
      return {
        q: `직사각형의 양쪽에 반원을 붙인 모양의 운동장입니다. 운동장의 넓이는 몇 m² 인가요? ${piNote(pi)}`,
        fig,
        answer: decAns(A, 'm²'),
        steps: [`직사각형: $${L} \\times ${d} = ${L * d}$ (m²)`, `반원 $2$ 개 $=$ 반지름 $${d / 2}$ m 인 원: $${d / 2} \\times ${d / 2} \\times ${dt(pi)} = ${dt(round(pi * (d / 2) ** 2, 6))}$ (m²)`, `넓이: $${L * d} + ${dt(round(pi * (d / 2) ** 2, 6))} = ${dt(A)}$ (m²)`],
      };
    }
    const diff = round(2 * pi * w, 6);
    return {
      q: `직사각형의 양쪽에 반원을 붙인 모양의 트랙에 폭이 $${w}$ m 인 레인이 있습니다. 안쪽 선(파란 선)을 따라 한 바퀴 도는 거리와 바깥쪽 선(주황 선)을 따라 한 바퀴 도는 거리의 차는 몇 m 인가요? ${piNote(pi)}`,
      fig,
      answer: decAns(diff, 'm'),
      steps: [
        `곧은 부분은 안쪽과 바깥쪽이 $${L}$ m 로 같아요.`,
        `안쪽 곡선 부분: 지름 $${d}$ m 인 원의 둘레, 바깥쪽: 지름 $${d} + ${w} \\times 2 = ${d + 2 * w}$ m 인 원의 둘레`,
        `차: $${d + 2 * w} \\times ${dt(pi)} - ${d} \\times ${dt(pi)} = ${2 * w} \\times ${dt(pi)}$`,
        `$= ${dt(diff)}$ (m)  (트랙의 길이와 상관없이 폭만으로 정해져요.)`,
      ],
      hint: '곧은 부분과 곡선 부분을 나누어 비교해 보세요.',
    };
  },
};

const e6b5Roll: Skill = {
  id: 'top-rolling-circle',
  title: '직사각형 둘레를 따라 굴러간 원',
  gen(r) {
    const pi = 3.14;
    const a = r.int(8, 30),
      b = r.int(5, 20),
      rr = r.int(1, 3);
    if (Math.min(a, b) <= 4 * rr || a < b + 3) return e6b5Roll.gen(r, 3);
    const t = r.int(0, 2);
    const s0 = Math.min(160 / (a + 4 * rr), 110 / (b + 4 * rr));
    const S = new Svg(Math.round((a + 4 * rr) * s0 + 40), Math.round((b + 4 * rr) * s0 + 40));
    const x0 = 20 + 2 * rr * s0,
      y0 = 20 + 2 * rr * s0;
    S.rect(x0, y0, a * s0, b * s0, { cls: 'acc', fill: true });
    S.text(x0 + (a * s0) / 2, y0 + (b * s0) / 2, `${a} cm`, { size: 12 });
    S.text(x0 + 6, y0 + (b * s0) / 2 + 16, `${b} cm`, { size: 12, anchor: 'start' });
    if (t === 2) {
      S.circle(x0 + rr * s0, y0 + rr * s0, rr * s0, { cls: 'acc2' });
      S.rect(x0 + rr * s0, y0 + rr * s0, (a - 2 * rr) * s0, (b - 2 * rr) * s0, { cls: 'acc2' });
    } else {
      S.circle(x0 + (a * s0) / 2, y0 - rr * s0, rr * s0, { cls: 'acc2' });
      const R0 = rr * s0;
      S.path(`M${x0},${y0 - R0} L${x0 + a * s0},${y0 - R0} A${R0},${R0} 0 0 1 ${x0 + a * s0 + R0},${y0} L${x0 + a * s0 + R0},${y0 + b * s0} A${R0},${R0} 0 0 1 ${x0 + a * s0},${y0 + b * s0 + R0} L${x0},${y0 + b * s0 + R0} A${R0},${R0} 0 0 1 ${x0 - R0},${y0 + b * s0} L${x0 - R0},${y0} A${R0},${R0} 0 0 1 ${x0},${y0 - R0} Z`, { cls: 'acc2' });
    }
    if (t === 0) {
      const ans = round(2 * (a + b) + 2 * pi * rr, 6);
      return {
        q: `반지름이 $${rr}$ cm 인 원이 가로 $${a}$ cm, 세로 $${b}$ cm 인 직사각형의 바깥쪽 둘레를 따라 떨어지지 않게 한 바퀴 굴러 제자리로 돌아왔습니다. 원의 중심이 움직인 거리는 몇 cm 인가요? ${piNote(pi)}`,
        fig: S.toString(),
        answer: decAns(ans, 'cm'),
        steps: [
          '원의 중심은 변을 따라갈 때는 변과 나란히 곧게, 모퉁이에서는 꼭짓점을 중심으로 돌아요.',
          `곧은 부분: 직사각형의 둘레 $(${a} + ${b}) \\times 2 = ${2 * (a + b)}$ (cm)`,
          `모퉁이 $4$ 곳에서 원의 $\\frac{1}{4}$ 씩 돌므로 합하면 반지름 $${rr}$ cm 인 원 하나의 둘레: $${rr} \\times 2 \\times ${dt(pi)} = ${dt(round(2 * pi * rr, 6))}$ (cm)`,
          `모두: $${2 * (a + b)} + ${dt(round(2 * pi * rr, 6))} = ${dt(ans)}$ (cm)`,
        ],
        hint: '모퉁이에서 원의 중심이 어떻게 움직이는지 그려 보세요.',
      };
    }
    if (t === 1) {
      const D = 2 * rr;
      const ans = round(2 * (a + b) * D + pi * D * D, 6);
      return {
        q: `반지름이 $${rr}$ cm 인 원이 가로 $${a}$ cm, 세로 $${b}$ cm 인 직사각형의 바깥쪽 둘레를 따라 떨어지지 않게 한 바퀴 굴러 제자리로 돌아왔습니다. 원이 지나간 부분의 넓이는 몇 cm² 인가요? ${piNote(pi)}`,
        fig: S.toString(),
        answer: decAns(ans, 'cm²'),
        steps: [
          `원이 지나간 자리는 폭이 지름 $${D}$ cm 인 띠예요.`,
          `변을 따라 생긴 직사각형 $4$ 개: $(${a} \\times ${D} + ${b} \\times ${D}) \\times 2 = ${2 * (a + b) * D}$ (cm²)`,
          `모퉁이 $4$ 곳은 반지름 $${D}$ cm 인 원의 $\\frac{1}{4}$ 씩 → 합하면 원 하나: $${D} \\times ${D} \\times ${dt(pi)} = ${dt(round(pi * D * D, 6))}$ (cm²)`,
          `모두: $${2 * (a + b) * D} + ${dt(round(pi * D * D, 6))} = ${dt(ans)}$ (cm²)`,
        ],
        hint: '변을 따라가는 부분과 모퉁이 부분으로 나누어 보세요.',
      };
    }
    const ans = 2 * (a - 2 * rr + b - 2 * rr);
    return {
      q: `반지름이 $${rr}$ cm 인 원이 가로 $${a}$ cm, 세로 $${b}$ cm 인 직사각형의 안쪽 둘레를 따라 떨어지지 않게 한 바퀴 굴러 제자리로 돌아왔습니다. 원의 중심이 움직인 거리는 몇 cm 인가요? ${piNote(pi)}`,
      fig: S.toString(),
      answer: intAns(ans, 'cm'),
      steps: [
        '안쪽을 따라 구르면 원의 중심은 모퉁이에서 돌지 않고 직사각형 모양으로 움직여요.',
        `중심이 그리는 직사각형: 가로 $${a} - ${rr} \\times 2 = ${a - 2 * rr}$, 세로 $${b} - ${rr} \\times 2 = ${b - 2 * rr}$ (cm)`,
        `움직인 거리: $(${a - 2 * rr} + ${b - 2 * rr}) \\times 2 = ${ans}$ (cm)`,
        '(이 경우에는 원주율이 필요 없어요.)',
      ],
      hint: '원이 모퉁이에 닿았을 때 중심이 어디에 있는지 그려 보세요.',
    };
  },
};

const e6b5Lune: Skill = {
  id: 'top-lune',
  title: '겹친 원의 일부로 만든 모양의 넓이',
  gen(r) {
    const pi = 3.14;
    const t = r.int(0, 2);
    if (t === 2) {
      const [p0, q0, h0] = r.pick([
        [3, 4, 5],
        [6, 8, 10],
        [5, 12, 13],
        [9, 12, 15],
        [8, 15, 17],
        [12, 16, 20],
      ]);
      const sc = 150 / h0;
      const S = new Svg(200, 150);
      const Ax = 25,
        Ay = 120,
        Bx = 25 + h0 * sc;
      const cosA = p0 / h0;
      const Cx = Ax + p0 * sc * cosA,
        Cy = Ay - p0 * sc * Math.sqrt(1 - cosA * cosA);
      const R = (h0 * sc) / 2;
      S.poly([
        [Ax, Ay],
        [Bx, Ay],
        [Cx, Cy],
      ], { cls: 'acc' });
      S.path(`M${Ax},${Ay} A${R},${R} 0 0 1 ${Bx},${Ay}`, { cls: 'acc' });
      const r1 = (p0 * sc) / 2,
        r2 = (q0 * sc) / 2;
      S.path(`M${Ax},${Ay} A${r1},${r1} 0 0 1 ${round(Cx, 2)},${round(Cy, 2)} A${R},${R} 0 0 0 ${Ax},${Ay} Z`, { cls: 'acc2', fill: true });
      S.path(`M${round(Cx, 2)},${round(Cy, 2)} A${r2},${r2} 0 0 1 ${Bx},${Ay} A${R},${R} 0 0 0 ${round(Cx, 2)},${round(Cy, 2)} Z`, { cls: 'acc2', fill: true });
      S.text((Ax + Bx) / 2, Ay + 14, `${h0} cm`, { size: 12 });
      S.text((Ax + Cx) / 2 + 10, (Ay + Cy) / 2 + 8, `${p0}`, { size: 11 });
      S.text((Bx + Cx) / 2 - 10, (Ay + Cy) / 2 + 8, `${q0}`, { size: 11 });
      return {
        q: `세 변의 길이가 $${p0}$ cm, $${q0}$ cm, $${h0}$ cm 인 직각삼각형의 각 변을 지름으로 하는 반원을 그렸습니다. 색칠한 두 초승달 모양의 넓이의 합은 몇 cm² 인가요? ${piNote(pi)}`,
        fig: S.toString(),
        answer: intAns((p0 * q0) / 2, 'cm²'),
        steps: [
          '색칠한 부분 $=$ (작은 반원 두 개) $+$ (직각삼각형) $-$ (큰 반원)',
          `작은 반원 두 개: $(${dt(p0 / 2)} \\times ${dt(p0 / 2)} + ${dt(q0 / 2)} \\times ${dt(q0 / 2)}) \\times ${dt(pi)} \\div 2 = ${dt(round(((p0 * p0 + q0 * q0) / 4) * pi / 2, 6))}$`,
          `큰 반원: $${dt(h0 / 2)} \\times ${dt(h0 / 2)} \\times ${dt(pi)} \\div 2 = ${dt(round(((h0 * h0) / 4) * pi / 2, 6))}$ → 작은 반원 두 개의 합과 같아요!`,
          `그래서 색칠한 부분 $=$ 직각삼각형의 넓이`,
          `$${p0} \\times ${q0} \\div 2 = ${(p0 * q0) / 2}$ (cm²)`,
        ],
        hint: '전체 모양을 여러 도형의 더하기·빼기로 나타내 보세요.',
      };
    }
    const a = 2 * r.int(2, 10);
    const ans = round(a * a * (pi / 2 - 1), 6);
    const u = 140 / a;
    const S = new Svg(180, 180);
    const x0 = 20,
      y0 = 20,
      W = a * u;
    S.rect(x0, y0, W, W, { cls: 'acc' });
    if (t === 0) {
      S.path(`M${x0},${y0} A${W},${W} 0 0 1 ${x0 + W},${y0 + W} A${W},${W} 0 0 1 ${x0},${y0} Z`, { cls: 'acc2', fill: true });
      S.text(x0 + W / 2, y0 + W + 12, `${a} cm`, { size: 12 });
      return {
        q: `한 변이 $${a}$ cm 인 정사각형 안에, 마주 보는 두 꼭짓점을 각각 중심으로 하고 반지름이 $${a}$ cm 인 원의 $\\frac{1}{4}$ 을 두 개 그렸습니다. 두 부분이 겹친 색칠한 부분의 넓이는 몇 cm² 인가요? ${piNote(pi)}`,
        fig: S.toString(),
        answer: decAns(ans, 'cm²'),
        steps: [
          `원의 $\\frac{1}{4}$ 하나: $${a} \\times ${a} \\times ${dt(pi)} \\div 4 = ${dt(round((a * a * pi) / 4, 6))}$ (cm²)`,
          '두 개를 더하면 정사각형을 덮고, 겹친 부분은 두 번 더해져요.',
          `(원의 $\\frac{1}{4}$ 두 개) $-$ (정사각형) $=$ (겹친 부분)`,
          `$${dt(round((a * a * pi) / 4, 6))} \\times 2 - ${a * a} = ${dt(ans)}$ (cm²)`,
        ],
        hint: '두 부분을 더하면 정사각형보다 얼마나 넓은지 생각해 보세요.',
      };
    }
    const h = W / 2;
    const cx = x0 + h,
      cy = y0 + h;
    const corners: Pt[] = [
      [x0, y0],
      [x0 + W, y0],
      [x0 + W, y0 + W],
      [x0, y0 + W],
    ];
    corners.forEach((c) => S.path(`M${cx},${cy} A${h},${h} 0 0 1 ${c[0]},${c[1]} A${h},${h} 0 0 1 ${cx},${cy} Z`, { cls: 'acc2', fill: true }));
    S.text(x0 + W / 2, y0 + W + 12, `${a} cm`, { size: 12 });
    return {
      q: `한 변이 $${a}$ cm 인 정사각형의 각 변을 지름으로 하는 반원 $4$ 개를 정사각형 안쪽에 그렸더니 꽃잎 모양이 생겼습니다. 색칠한 꽃잎 $4$ 장의 넓이의 합은 몇 cm² 인가요? ${piNote(pi)}`,
      fig: S.toString(),
      answer: decAns(ans, 'cm²'),
      steps: [
        `반원 하나: $${a / 2} \\times ${a / 2} \\times ${dt(pi)} \\div 2 = ${dt(round(((a * a) / 4) * pi / 2, 6))}$ (cm²)`,
        '반원 $4$ 개를 더하면 정사각형을 모두 덮고, 꽃잎 부분만 두 번 더해져요.',
        `꽃잎 $=$ (반원 $4$ 개) $-$ (정사각형) $= ${dt(round(((a * a) / 4) * pi / 2, 6))} \\times 4 - ${a * a}$`,
        `$= ${dt(round((a * a * pi) / 2, 6))} - ${a * a} = ${dt(ans)}$ (cm²)`,
      ],
      hint: '반원 4개의 넓이의 합과 정사각형의 넓이를 비교해 보세요.',
    };
  },
};

// ═════════ 6-2-6 원기둥, 원뿔, 구 ═════════
const e6b6Hard: Skill = {
  id: 'hard-rotate-offset',
  title: '돌려 만든 입체를 위·앞에서 본 모양',
  gen(r, level) {
    const pi = level === 1 ? 3 : 3.14;
    const a = r.int(2, 8),
      b = r.int(3, 10),
      d = level === 1 ? 0 : r.int(1, 5);
    const u = Math.min(16, 120 / (a + d + 1), 120 / b);
    const S = new Svg(Math.round((a + d) * u + 80), Math.round(b * u + 40));
    const ax = 30;
    S.line(ax, 10, ax, b * u + 30, { dash: true, cls: 'acc2' });
    S.rect(ax + d * u, 20, a * u, b * u, { cls: 'acc', fill: true });
    S.text(ax + d * u + (a * u) / 2, 12, `${a} cm`, { size: 11 });
    S.text(ax + (d + a) * u + 6, 20 + (b * u) / 2, `${b} cm`, { size: 11, anchor: 'start' });
    if (d) S.text(ax + (d * u) / 2, 20 + b * u + 12, `${d} cm`, { size: 11 });
    const fig = S.toString();
    if (level === 1) {
      const P = 2 * (2 * a + b);
      return {
        q: `직사각형 모양의 종이를 점선을 회전축으로 하여 한 바퀴 돌려 입체도형을 만들었습니다. 이 입체도형을 앞에서 본 모양의 둘레는 몇 cm 인가요?`,
        fig,
        answer: intAns(P, 'cm'),
        steps: [`만든 입체는 밑면의 반지름 $${a}$ cm, 높이 $${b}$ cm 인 원기둥`, `앞에서 본 모양: 가로 $${a} \\times 2 = ${2 * a}$ cm, 세로 $${b}$ cm 인 직사각형`, `둘레: $(${2 * a} + ${b}) \\times 2 = ${P}$ (cm)`],
      };
    }
    const R2 = d + a;
    if (level === 2) {
      const A = round(pi * (R2 * R2 - d * d), 6);
      return {
        q: `직사각형 모양의 종이를 회전축(점선)에서 $${d}$ cm 떨어진 채로 한 바퀴 돌려 가운데가 빈 입체도형을 만들었습니다. 이 입체도형을 위에서 본 모양의 넓이는 몇 cm² 인가요? ${piNote(pi)}`,
        fig,
        answer: decAns(A, 'cm²'),
        steps: [
          `위에서 보면 반지름 $${d} + ${a} = ${R2}$ cm 인 원에서 반지름 $${d}$ cm 인 원을 뺀 고리 모양`,
          `큰 원: $${R2} \\times ${R2} \\times ${dt(pi)} = ${dt(round(pi * R2 * R2, 6))}$, 작은 원: $${d} \\times ${d} \\times ${dt(pi)} = ${dt(round(pi * d * d, 6))}$`,
          `넓이: $${dt(round(pi * R2 * R2, 6))} - ${dt(round(pi * d * d, 6))} = ${dt(A)}$ (cm²)`,
        ],
      };
    }
    const P = round(2 * pi * R2 + 2 * pi * d, 6);
    return {
      q: `직사각형 모양의 종이를 회전축(점선)에서 $${d}$ cm 떨어진 채로 한 바퀴 돌려 가운데가 빈 입체도형을 만들었습니다. 이 입체도형을 위에서 본 모양에서 안쪽과 바깥쪽 경계선의 길이의 합은 몇 cm 인가요? ${piNote(pi)}`,
      fig,
      answer: decAns(P, 'cm'),
      steps: [
        `위에서 본 모양은 반지름 $${R2}$ cm 인 원과 반지름 $${d}$ cm 인 원으로 둘러싸인 고리 모양`,
        `바깥 원주: $${R2} \\times 2 \\times ${dt(pi)} = ${dt(round(2 * pi * R2, 6))}$ (cm)`,
        `안쪽 원주: $${d} \\times 2 \\times ${dt(pi)} = ${dt(round(2 * pi * d, 6))}$ (cm)`,
        `합: $${dt(round(2 * pi * R2, 6))} + ${dt(round(2 * pi * d, 6))} = ${dt(P)}$ (cm)`,
      ],
      hint: '돌릴 때 직사각형의 안쪽 변과 바깥쪽 변이 각각 어떤 원을 그리는지 생각해 보세요.',
    };
  },
};

const e6b6Sec: Skill = {
  id: 'top-cyl-section',
  title: '앞에서 본 모양과 전개도로 원기둥 알아내기',
  gen(r) {
    const pi = r.pick([3, 3.14]);
    const t = r.int(0, 2);
    if (t === 0) {
      const d = 2 * r.int(2, 10);
      const ans = round(pi * d * d, 6);
      return {
        q: `원기둥을 앞에서 본 모양이 둘레가 $${4 * d}$ cm 인 정사각형입니다. 이 원기둥의 전개도에서 옆면의 넓이는 몇 cm² 인가요? ${piNote(pi)}`,
        answer: decAns(ans, 'cm²'),
        steps: [
          '원기둥을 앞에서 본 모양은 가로가 밑면의 지름, 세로가 높이인 직사각형이에요.',
          `정사각형이므로 지름 $=$ 높이 $= ${4 * d} \\div 4 = ${d}$ (cm)`,
          `옆면의 가로 $=$ 밑면의 둘레 $= ${d} \\times ${dt(pi)} = ${dt(round(pi * d, 6))}$ (cm), 세로 $=$ 높이 $${d}$ cm`,
          `옆면의 넓이: $${dt(round(pi * d, 6))} \\times ${d} = ${dt(ans)}$ (cm²)`,
        ],
        hint: '앞에서 본 모양의 가로와 세로가 원기둥의 어디인지 생각해 보세요.',
      };
    }
    if (t === 1) {
      const d = r.int(3, 16),
        h = r.int(3, 20);
      if (d === h) return e6b6Sec.gen(r, 3);
      const P = 2 * (d + h);
      const ans = round(pi * d * h, 6);
      return {
        q: `높이가 $${h}$ cm 인 원기둥을 앞에서 본 모양의 둘레가 $${P}$ cm 입니다. 이 원기둥의 전개도에서 옆면의 넓이는 몇 cm² 인가요? ${piNote(pi)}`,
        answer: decAns(ans, 'cm²'),
        steps: [
          '앞에서 본 모양: 가로 $=$ 밑면의 지름, 세로 $=$ 높이인 직사각형',
          `지름 $+$ 높이 $= ${P} \\div 2 = ${P / 2}$ → 지름 $= ${P / 2} - ${h} = ${d}$ (cm)`,
          `옆면의 가로: $${d} \\times ${dt(pi)} = ${dt(round(pi * d, 6))}$ (cm)`,
          `옆면의 넓이: $${dt(round(pi * d, 6))} \\times ${h} = ${dt(ans)}$ (cm²)`,
        ],
      };
    }
    const rr = r.int(1, 8);
    const H = round(2 * pi * rr, 6);
    const ans = round(2 * rr * H, 6);
    return {
      q: `전개도에서 옆면이 정사각형인 원기둥이 있습니다. 밑면의 반지름이 $${rr}$ cm 일 때, 이 원기둥을 앞에서 본 모양의 넓이는 몇 cm² 인가요? ${piNote(pi)}`,
      answer: decAns(ans, 'cm²'),
      steps: [
        `옆면의 가로 $=$ 밑면의 둘레 $= ${rr} \\times 2 \\times ${dt(pi)} = ${dt(H)}$ (cm)`,
        `옆면이 정사각형이므로 높이도 $${dt(H)}$ cm`,
        `앞에서 본 모양: 가로 $=$ 지름 $${2 * rr}$ cm, 세로 $=$ 높이 $${dt(H)}$ cm 인 직사각형`,
        `넓이: $${2 * rr} \\times ${dt(H)} = ${dt(ans)}$ (cm²)`,
      ],
      hint: '옆면의 가로와 세로가 원기둥의 어느 부분과 같은지 생각해 보세요.',
    };
  },
};

const e6b6Wrap: Skill = {
  id: 'top-wrap-cans',
  title: '원기둥 통 여러 개를 묶은 끈의 길이',
  gen(r) {
    const pi = 3.14;
    const rr = r.int(3, 10);
    const t = r.int(0, 3);
    let centers: Pt[];
    let straight: number, desc: string, stx: string;
    if (t === 0) {
      const n = r.int(2, 5);
      centers = Array.from({ length: n }, (_, i) => [i * 2, 0] as Pt);
      straight = 4 * rr * (n - 1);
      desc = `$${n}$ 개를 한 줄로`;
      stx = `곧은 부분 $2$ 군데, 각각 지름 $\\times ${n - 1}$ → $${2 * rr} \\times ${n - 1} \\times 2 = ${straight}$ (cm)`;
    } else if (t === 1) {
      centers = [
        [0, 0],
        [2, 0],
        [1, Math.sqrt(3)],
      ];
      straight = 6 * rr;
      desc = '$3$ 개를 그림과 같이 삼각형 모양으로';
      stx = `곧은 부분 $3$ 군데, 각각 지름과 같아요 → $${2 * rr} \\times 3 = ${straight}$ (cm)`;
    } else if (t === 2) {
      centers = [
        [0, 0],
        [2, 0],
        [2, 2],
        [0, 2],
      ];
      straight = 8 * rr;
      desc = '$4$ 개를 그림과 같이 정사각형 모양으로';
      stx = `곧은 부분 $4$ 군데, 각각 지름과 같아요 → $${2 * rr} \\times 4 = ${straight}$ (cm)`;
    } else {
      centers = [
        [0, 0],
        [2, 0],
        [4, 0],
        [4, 2],
        [2, 2],
        [0, 2],
      ];
      straight = 12 * rr;
      desc = '$6$ 개를 그림과 같이 $2$ 줄로';
      stx = `곧은 부분: 긴 쪽 $2$ 군데는 지름 $\\times 2$, 짧은 쪽 $2$ 군데는 지름 → $${2 * rr} \\times (2 + 2 + 1 + 1) = ${straight}$ (cm)`;
    }
    const knot = r.chance(0.4) ? r.int(10, 30) : 0;
    const ans = round(straight + 2 * pi * rr + knot, 6);
    // 그림: 볼록 껍질(순서대로) 바깥에 띠
    const u = Math.min(28, 200 / (Math.max(...centers.map((c) => c[0])) + 2));
    const ox = 20 + u,
      oy = 20 + u;
    const maxY = Math.max(...centers.map((c) => c[1]));
    const P = (c: Pt): Pt => [ox + c[0] * u, oy + (maxY - c[1]) * u];
    const S = new Svg(Math.round((Math.max(...centers.map((c) => c[0])) + 2) * u + 40), Math.round((maxY + 2) * u + 40));
    centers.forEach((c) => {
      const p = P(c);
      S.circle(p[0], p[1], u, { cls: 'acc', fill: true });
    });
    const hull: Pt[] = t === 0 ? [centers[0], centers[centers.length - 1]] : centers;
    let H2 = hull.map(P);
    let area2 = 0;
    for (let i = 0; i < H2.length; i++) {
      const A = H2[i],
        B = H2[(i + 1) % H2.length];
      area2 += A[0] * B[1] - B[0] * A[1];
    }
    if (area2 < 0) H2 = H2.slice().reverse(); // 화면에서 시계 방향으로
    let d = '';
    const nrm = (A: Pt, B: Pt): Pt => {
      const l = Math.hypot(B[0] - A[0], B[1] - A[1]);
      return [(B[1] - A[1]) / l, -(B[0] - A[0]) / l];
    };
    for (let i = 0; i < H2.length; i++) {
      const A = H2[i],
        B = H2[(i + 1) % H2.length],
        C = H2[(i + 2) % H2.length];
      const n1 = nrm(A, B),
        n2 = nrm(B, C);
      if (i === 0) d += `M${round(A[0] + n1[0] * u, 2)},${round(A[1] + n1[1] * u, 2)} `;
      d += `L${round(B[0] + n1[0] * u, 2)},${round(B[1] + n1[1] * u, 2)} `;
      d += `A${round(u, 2)},${round(u, 2)} 0 0 1 ${round(B[0] + n2[0] * u, 2)},${round(B[1] + n2[1] * u, 2)} `;
    }
    S.path(d + 'Z', { cls: 'acc2' });
    return {
      q: `밑면의 반지름이 $${rr}$ cm 인 원기둥 모양 통 ${desc} 붙여 놓고, 끈으로 겹치지 않게 한 바퀴 둘러 묶었습니다. ${knot ? `매듭을 짓는 데 $${knot}$ cm 를 썼다면, 사용한 끈은 모두 몇 cm 인가요?` : '매듭을 짓는 데 쓴 끈을 빼면, 둘러 묶은 끈의 길이는 몇 cm 인가요?'} ${piNote(pi)}`,
      fig: S.toString(),
      answer: decAns(ans, 'cm'),
      steps: [
        '끈은 곧은 부분과 통에 감긴 곡선 부분으로 나뉘어요.',
        stx,
        '곡선 부분은 바깥쪽 통마다 조금씩 감기는데, 모두 합하면 통 하나를 한 바퀴 도는 것과 같아요(돌아간 각도의 합이 $360°$).',
        `곡선 부분: $${rr} \\times 2 \\times ${dt(pi)} = ${dt(round(2 * pi * rr, 6))}$ (cm)`,
        `${knot ? `매듭 $${knot}$ cm 까지 ` : ''}모두: $${straight} + ${dt(round(2 * pi * rr, 6))}${knot ? ` + ${knot}` : ''} = ${dt(ans)}$ (cm)`,
      ],
      hint: '곡선 부분들을 모으면 어떤 모양이 되는지 생각해 보세요.',
    };
  },
};

export const HARD6: Record<string, { skill: Skill; top: Skill[] }> = {
  'e6a-1': { skill: e6a1Hard, top: [e6a1Diff, e6a1Clock] },
  'e6a-2': { skill: e6a2Hard, top: [e6a2Cut, e6a2Net] },
  'e6a-3': { skill: e6a3Hard, top: [e6a3Tree, e6a3Bottle] },
  'e6a-4': { skill: e6a4Hard, top: [e6a4Price, e6a4Salt] },
  'e6a-5': { skill: e6a5Hard, top: [e6a5Pie, e6a5Diff] },
  'e6a-6': { skill: e6a6Hard, top: [e6a6Cut, e6a6Box] },
  'e6b-1': { skill: e6b1Hard, top: [e6b1Work, e6b1Small] },
  'e6b-2': { skill: e6b2Hard, top: [e6b2Train, e6b2Rep] },
  'e6b-3': { skill: e6b3Hard, top: [e6b3Surf, e6b3Tun] },
  'e6b-4': { skill: e6b4Hard, top: [e6b4Gear, e6b4Ov] },
  'e6b-5': { skill: e6b5Hard, top: [e6b5Roll, e6b5Lune] },
  'e6b-6': { skill: e6b6Hard, top: [e6b6Sec, e6b6Wrap] },
};
