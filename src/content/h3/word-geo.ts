// 기하 활용(문장제) 유형 — geo.ts 의 각 단원 skills 뒤에 덧붙임
import type { Skill } from '../../core/types';
import { F } from '../../core/frac';
import { QUADS, TRIPLES, fAns, texChoices } from './util';

const fr = (n: number, d = 1) => new F(n, d);
const T = (f: F) => f.tex();
const vec = (...c: number[]) => `(${c.join(', ')})`;
const pr = (n: number) => (n < 0 ? `(${n})` : `${n}`);
/** 피타고라스 수 (순서·부호 섞기) */
const LEGS: [number, number, number][] = TRIPLES.slice(0, 6).flatMap(([a, b, c]) => [
  [a, b, c],
  [b, a, c],
]);

export const GEO_WORD: Record<string, Skill[]> = {
  'geo-1': [
    {
      id: 'conic-word',
      title: '이차곡선의 활용',
      gen(r, level) {
        if (level === 1) {
          let t: number, d: number;
          for (;;) {
            t = r.int(3, 10);
            const ds = [];
            for (let x = 2; x <= t; x++) if ((t * t) % x === 0) ds.push(x);
            if (ds.length) {
              d = r.pick(ds);
              break;
            }
          }
          const p = (t * t) / d;
          return {
            q: `단면이 포물선 모양인 접시 안테나의 입구의 지름이 $${4 * t}\\text{ cm}$, 깊이가 $${d}\\text{ cm}$ 입니다. 전파를 모으는 수신기를 포물선의 초점에 설치할 때, 포물선의 꼭짓점에서 수신기까지의 거리는 몇 cm 인가요?`,
            answer: { type: 'num', value: p, unit: 'cm' },
            steps: [`꼭짓점을 원점, 축을 $x$ 축으로 놓으면 단면은 $y^{2}=4px$`, `입구의 끝점 $(${d}, ${2 * t})$ ${/[013678]$/.test(String(2 * t)) ? '을' : '를'} 지나므로 $${4 * t * t}=4p\\times${d}$`, `$p=${p}$ → 초점 $(${p}, 0)$, 거리 $${p}$ cm`],
          };
        }
        if (level === 2) {
          const u = r.int(1, 4),
            v = r.int(u + 1, 6);
          const p = u * u,
            q = v * v;
          return {
            q: `어떤 혜성은 태양을 한 초점으로 하는 타원 궤도를 돕니다. 혜성이 태양에 가장 가까울 때의 거리는 $${p}$, 가장 멀 때의 거리는 $${q}$ 입니다 (단위: 억 km). 이 타원의 장축과 단축의 길이를 구하세요.`,
            answer: {
              type: 'fields',
              fields: [
                { label: '장축', value: p + q },
                { label: '단축', value: 2 * u * v },
              ],
            },
            steps: [`장축의 길이 $2a$, 초점 거리 $c$: $a-c=${p}$, $a+c=${q}$ → $2a=${p + q}$`, `$a=${T(fr(p + q, 2))}$, $c=${T(fr(q - p, 2))}$, $b^{2}=a^{2}-c^{2}=(a+c)(a-c)=${p * q}$`, `$b=${u * v}$ → 단축의 길이 $${2 * u * v}$`],
          };
        }
        const k = r.int(1, 2);
        const b = 5 * r.int(1, 3);
        const [dd, hh] = r.pick([
          [3, 4],
          [4, 3],
        ]);
        const a = 5 * k,
          d = dd * k;
        const H = (b * hh) / 5;
        return {
          q: `단면이 반타원 모양인 터널의 폭이 $${2 * a}\\text{ m}$, 가장 높은 곳의 높이가 $${b}\\text{ m}$ 입니다. 폭이 $${2 * d}\\text{ m}$ 인 트럭이 터널의 한가운데로 지나가려면 트럭의 높이는 몇 m 이하여야 하나요?`,
          answer: { type: 'num', value: H, unit: 'm' },
          steps: [`터널 단면: $\\frac{x^{2}}{${a * a}}+\\frac{y^{2}}{${b * b}}=1\\,(y\\ge0)$`, `트럭의 양 끝 $x=\\pm${d}$: $\\frac{y^{2}}{${b * b}}=1-\\frac{${d * d}}{${a * a}}=\\frac{${hh * hh}}{25}$`, `$y=${b}\\times\\frac{${hh}}{5}=${H}$ (m)`],
        };
      },
    },
  ],

  'geo-3': [
    {
      id: 'force-word',
      title: '벡터의 활용 (힘·속도)',
      gen(r, level) {
        if (level === 1) {
          const [p, q, h] = r.pick(LEGS);
          const S = [p * r.sign(), q * r.sign()];
          const F1 = [r.int(-6, 6), r.int(-6, 6)];
          const F2 = [S[0] - F1[0], S[1] - F1[1]];
          return {
            q: `한 물체에 두 힘 $\\vec{F_1}=${vec(...F1)}$, $\\vec{F_2}=${vec(...F2)}$ 가 동시에 작용합니다 (단위: N). 두 힘의 합력의 크기는 몇 N 인가요?`,
            answer: { type: 'num', value: h, unit: 'N' },
            steps: [`합력 $\\vec{F_1}+\\vec{F_2}=${vec(...S)}$`, `크기 $\\sqrt{${pr(S[0])}^{2}+${pr(S[1])}^{2}}=${h}$ (N)`],
          };
        }
        if (level === 2) {
          const [w, vb, h] = r.pick(LEGS);
          if (r.chance(0.5)) {
            return {
              q: `강물이 동쪽으로 초속 $${w}\\text{ m}$ 로 흐르고 있습니다. 잔잔한 물에서 초속 $${vb}\\text{ m}$ 로 움직이는 배가 뱃머리를 정북쪽으로 향하고 나아갈 때, 강가에서 본 배의 실제 속력은 초속 몇 m 인가요?`,
              answer: { type: 'num', value: h, unit: 'm/s' },
              steps: [`강물의 속도 $(${w}, 0)$, 배의 속도 $(0, ${vb})$`, `실제 속도 $(${w}, ${vb})$, 속력 $\\sqrt{${w * w}+${vb * vb}}=${h}$ (m/s)`],
            };
          }
          return {
            q: `강물이 동쪽으로 초속 $${w}\\text{ m}$ 로 흐르고 있습니다. 잔잔한 물에서 초속 $${h}\\text{ m}$ 로 움직이는 배가 강을 정북쪽으로 똑바로 건너려면 뱃머리를 비스듬히 상류 쪽으로 향해야 합니다. 이때 배가 강을 건너는 실제 속력은 초속 몇 m 인가요?`,
            answer: { type: 'num', value: vb, unit: 'm/s' },
            steps: [`배 자체의 속도 $(x, y)$ 에 강물 $(${w}, 0)$ 을 더한 것이 정북쪽이어야 함: $x+${w}=0$`, `$|(x, y)|=${h}$ 이므로 $y=\\sqrt{${h * h}-${w * w}}=${vb}$`, `실제 속도 $(0, ${vb})$, 속력 $${vb}$ (m/s)`],
          };
        }
        const [p, q, h] = r.pick(LEGS);
        const S = [p * r.sign(), q * r.sign()];
        const F1 = [r.int(-8, 8), r.int(-8, 8)];
        const F2 = [-S[0] - F1[0], -S[1] - F1[1]];
        return {
          q: `한 물체에 세 힘 $\\vec{F_1}=${vec(...F1)}$, $\\vec{F_2}=${vec(...F2)}$, $\\vec{F_3}=(a, b)$ 가 작용하여 물체가 움직이지 않고 평형을 이룹니다 (단위: N). $a$, $b$ 의 값과 $\\vec{F_3}$ 의 크기를 구하세요.`,
          answer: {
            type: 'fields',
            fields: [
              { label: 'a', value: S[0] },
              { label: 'b', value: S[1] },
              { label: '크기', value: h, unit: 'N' },
            ],
          },
          steps: [`평형: $\\vec{F_1}+\\vec{F_2}+\\vec{F_3}=\\vec{0}$`, `$\\vec{F_1}+\\vec{F_2}=${vec(-S[0], -S[1])}$ 이므로 $\\vec{F_3}=${vec(...S)}$`, `$|\\vec{F_3}|=\\sqrt{${S[0] * S[0]}+${S[1] * S[1]}}=${h}$ (N)`],
        };
      },
    },
  ],

  'geo-4': [
    {
      id: 'work-word',
      title: '내적의 활용 (일·성분)',
      gen(r, level) {
        if (level === 1) {
          for (;;) {
            const Fv = [r.int(-8, 8), r.int(-8, 8)];
            const A = [r.int(-5, 5), r.int(-5, 5)],
              B = [r.int(-5, 5), r.int(-5, 5)];
            const d = [B[0] - A[0], B[1] - A[1]];
            const W = Fv[0] * d[0] + Fv[1] * d[1];
            if (W <= 0) continue;
            return {
              q: `힘 $\\vec{F}=${vec(...Fv)}$ (N) 이 작용하여 물체가 점 $A${vec(...A)}$ 에서 점 $B${vec(...B)}$ 까지 곧게 움직였습니다 (단위: m). 이 힘이 한 일 $W=\\vec{F}\\cdot\\overrightarrow{AB}$ 는 몇 J 인가요?`,
              answer: { type: 'num', value: W, unit: 'J' },
              steps: [`$\\overrightarrow{AB}=${vec(...d)}$`, `$W=${pr(Fv[0])}\\times${pr(d[0])}+${pr(Fv[1])}\\times${pr(d[1])}=${W}$ (J)`],
            };
          }
        }
        if (level === 2) {
          const Fm = 10 * r.int(1, 5),
            d = r.int(2, 10);
          const th = r.pick([30, 45, 60]);
          const what = r.pick(['썰매', '수레', '상자']);
          const q = `${what}에 연결된 줄을 수평면과 $${th}^{\\circ}$ 를 이루는 방향으로 $${Fm}\\text{ N}$ 의 힘으로 당겨 ${what}를 수평 방향으로 $${d}\\text{ m}$ 옮겼습니다. 이 힘이 한 일은 몇 J 인가요?`;
          if (th === 60) {
            return {
              q,
              answer: { type: 'num', value: (Fm * d) / 2, unit: 'J' },
              steps: [`$W=|\\vec{F}||\\vec{s}|\\cos${th}^{\\circ}=${Fm}\\times${d}\\times\\frac{1}{2}$`, `$=${(Fm * d) / 2}$ (J)`],
            };
          }
          const c = (Fm * d) / 2;
          const right = th === 30 ? `${c}\\sqrt{3}` : `${c}\\sqrt{2}`;
          return {
            q,
            answer: texChoices(r, right, [`${c}`, `${Fm * d}`, th === 30 ? `${c}\\sqrt{2}` : `${c}\\sqrt{3}`, `${Fm * d}\\sqrt{${th === 30 ? 3 : 2}}`, `${c / 2}\\sqrt{${th === 30 ? 3 : 2}}`]),
            steps: [`$W=|\\vec{F}||\\vec{s}|\\cos${th}^{\\circ}=${Fm}\\times${d}\\times\\frac{\\sqrt{${th === 30 ? 3 : 2}}}{2}$`, `$=${right}$ (J)`],
          };
        }
        const [p, q0, h] = r.pick(LEGS);
        const u = [p * r.sign(), q0 * r.sign()];
        let Fv: number[], dot: number;
        do {
          Fv = [r.int(-9, 9), r.int(-9, 9)];
          dot = Fv[0] * u[0] + Fv[1] * u[1];
        } while (dot <= 0);
        const comp = fr(dot, h);
        return {
          q: `물체가 벡터 $\\vec{u}=${vec(...u)}$ 의 방향으로 놓인 레일을 따라서만 움직일 수 있습니다. 이 물체에 힘 $\\vec{F}=${vec(...Fv)}$ (N) 이 작용할 때, 레일 방향으로 작용하는 힘의 크기(정사영의 길이)는 몇 N 인가요?`,
          answer: fAns(comp, 'N'),
          steps: [`레일 방향 단위벡터 $\\frac{\\vec{u}}{|\\vec{u}|}=\\frac{1}{${h}}${vec(...u)}$`, `$\\vec{F}\\cdot\\frac{\\vec{u}}{|\\vec{u}|}=\\frac{${pr(Fv[0])}\\times${pr(u[0])}+${pr(Fv[1])}\\times${pr(u[1])}}{${h}}=\\frac{${dot}}{${h}}$`, `$=${T(comp)}$ (N)`],
        };
      },
    },
  ],

  'geo-5': [
    {
      id: 'space-word',
      title: '공간좌표의 활용',
      gen(r, level) {
        if (level === 1) {
          const q = r.pick(QUADS);
          const sh = r.shuffle([q[0], q[1], q[2]]).map((v) => v * r.sign());
          const P = [r.int(-10, 10), r.int(-10, 10), r.int(5, 20)];
          const Q = [P[0] + sh[0], P[1] + sh[1], P[2] + Math.abs(sh[2])];
          return {
            q: `지면 위의 한 지점을 원점, 동쪽을 $x$ 축, 북쪽을 $y$ 축, 위쪽을 $z$ 축의 양의 방향으로 하는 좌표공간에서 두 드론의 위치가 $P${vec(...P)}$, $Q${vec(...Q)}$ 입니다 (단위: m). 두 드론 사이의 거리는 몇 m 인가요?`,
            answer: { type: 'num', value: q[3], unit: 'm' },
            steps: [`$\\overline{PQ}=\\sqrt{${pr(Q[0] - P[0])}^{2}+${pr(Q[1] - P[1])}^{2}+${pr(Q[2] - P[2])}^{2}}$`, `$=\\sqrt{${q[3] * q[3]}}=${q[3]}$ (m)`],
          };
        }
        if (level === 2) {
          const [cn, cd, sn, sd] = r.pick([
            [3, 5, 4, 5],
            [4, 5, 3, 5],
            [5, 13, 12, 13],
            [12, 13, 5, 13],
            [1, 2, 0, 0],
          ] as [number, number, number, number][]);
          const S = cd * r.int(2, 12);
          const shadow = fr(S * cn, cd);
          const how = cn === 1 && cd === 2 ? `지면과 $60^{\\circ}$ 를 이루도록` : `지면과 이루는 각 $\\theta$ 가 $\\sin\\theta=\\frac{${sn}}{${sd}}$ 가 되도록`;
          return {
            q: `넓이가 $${S}\\text{ m}^{2}$ 인 평평한 판을 ${how} 기울여 세웠습니다. 햇빛이 지면에 수직으로 비칠 때, 지면에 생기는 판의 그림자의 넓이는 몇 $\\text{m}^{2}$ 인가요?`,
            answer: fAns(shadow, 'm²'),
            steps: [
              `그림자는 판의 지면 위로의 정사영: (그림자 넓이) $=S\\cos\\theta$`,
              cn === 1 && cd === 2 ? `$\\cos60^{\\circ}=\\frac{1}{2}$` : `$\\cos\\theta=\\sqrt{1-\\left(\\frac{${sn}}{${sd}}\\right)^{2}}=\\frac{${cn}}{${cd}}$`,
              `$${S}\\times${T(fr(cn, cd))}=${T(shadow)}$ (m²)`,
            ],
          };
        }
        const [a, b, c] = r.pick([
          [3, 4, 12],
          [4, 3, 12],
          [9, 12, 8],
          [12, 9, 8],
          [9, 12, 20],
          [12, 16, 15],
          [6, 8, 24],
        ] as [number, number, number][]);
        const g = Math.round(Math.sqrt(a * a + b * b));
        const d = Math.round(Math.sqrt(g * g + c * c));
        return {
          q: `가로 $${a}\\text{ m}$, 세로 $${b}\\text{ m}$, 높이 $${c}\\text{ m}$ 인 직육면체 모양의 창고가 있습니다. 바닥의 한 꼭짓점에서 천장의 대각선 반대쪽 꼭짓점까지 줄을 팽팽하게 연결할 때, 줄의 길이와 줄이 바닥면과 이루는 각 $\\theta$ 에 대하여 $\\cos\\theta$ 의 값을 구하세요.`,
          answer: {
            type: 'fields',
            fields: [
              { label: '줄의 길이', value: d, unit: 'm' },
              { label: 'cos θ', value: g / d, display: 'frac' },
            ],
          },
          steps: [`바닥 대각선 $\\sqrt{${a * a}+${b * b}}=${g}$`, `줄의 길이 $\\sqrt{${g * g}+${c * c}}=${d}$`, `줄의 바닥 위로의 정사영이 바닥 대각선이므로 $\\cos\\theta=\\frac{${g}}{${d}}${fr(g, d).d !== d ? `=${T(fr(g, d))}` : ''}$`],
        };
      },
    },
  ],
};
