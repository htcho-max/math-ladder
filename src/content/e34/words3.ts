// 초3 (e3a, e3b) 문장제 유형 추가분 — e34.ts 에서 각 단원 skills 뒤에 붙임
import type { Skill } from '../../core/types';
import type { Rng } from '../../core/rng';
import { Svg } from '../../core/fig';
import { makeChoices } from '../../core/tex';
import { gcd } from '../../core/nt';
import { J, c, fr, josa, mx, nm, pick2Names, pickName, picGraph, polyFig } from './util';
/** '…이었습니다/였습니다' (숫자 받침에 맞게) */
const was = (n: number) => (josa(n, '이/가') === '이' ? '이었' : '였');

/** 조건을 만족할 때까지 다시 뽑기 */
function until<T>(gen: () => T, ok: (x: T) => boolean, tries = 400): T {
  let x = gen();
  for (let i = 0; i < tries && !ok(x); i++) x = gen();
  return x;
}
const pick3Names = (r: Rng) => r.sample(['민수', '지호', '수아', '준우', '시우', '지아', '현우', '유나', '서희', '예서', '태오', '세라'], 4) as string[];
/** mm → 'a cm b mm' (TeX 포함 문장) */
const cmmm = (mm: number) => (mm % 10 ? `$${Math.floor(mm / 10)}$ cm $${mm % 10}$ mm` : `$${mm / 10}$ cm`);
/** m → 'a km b m' */
const kmm = (m: number) => (m >= 1000 ? (m % 1000 ? `$${Math.floor(m / 1000)}$ km $${m % 1000}$ m` : `$${m / 1000}$ km`) : `$${m}$ m`);
/** g → 'a kg b g' */
const kgg = (g: number) => (g >= 1000 ? (g % 1000 ? `$${Math.floor(g / 1000)}$ kg $${g % 1000}$ g` : `$${g / 1000}$ kg`) : `$${g}$ g`);
/** mL → 'a L b mL' */
const lml = (ml: number) => (ml >= 1000 ? (ml % 1000 ? `$${Math.floor(ml / 1000)}$ L $${ml % 1000}$ mL` : `$${ml / 1000}$ L`) : `$${ml}$ mL`);

// ───────── 그림그래프 자료 (문장제용) ─────────
const G_THEMES = [
  {
    head: '마을',
    labels: ['가', '나', '다', '라'],
    suf: ' 마을',
    thing: '사과 생산량',
    of: (n: string) => `${n}의 사과 생산량`,
    unit: '상자',
    resUnit: '개',
    per: (k: number) => `사과가 한 상자에 $${k}$개씩 들어 있다면`,
    ask: (n: string) => `${n}에서 생산한 사과는 모두 몇 개인가요?`,
    diff: '사과 생산량이 가장 많은 마을과 가장 적은 마을의 사과는 몇 개 차이가 나나요?',
  },
  {
    head: '과수원',
    labels: ['햇살', '초록', '푸른', '별빛'],
    suf: ' 과수원',
    thing: '배 생산량',
    of: (n: string) => `${n}의 배 생산량`,
    unit: '상자',
    resUnit: '개',
    per: (k: number) => `배가 한 상자에 $${k}$개씩 들어 있다면`,
    ask: (n: string) => `${n}에서 딴 배는 모두 몇 개인가요?`,
    diff: '배 생산량이 가장 많은 과수원과 가장 적은 과수원의 배는 몇 개 차이가 나나요?',
  },
  {
    head: '반',
    labels: ['1반', '2반', '3반', '4반'],
    suf: '',
    thing: '모은 빈 병의 수',
    of: (n: string) => `${J(n, '이/가')} 모은 빈 병의 수`,
    unit: '개',
    resUnit: '원',
    per: (k: number) => `빈 병 한 개를 $${k}$원에 판다면`,
    ask: (n: string) => `${J(n, '이/가')} 모은 빈 병을 모두 팔아 받는 돈은 얼마인가요?`,
    diff: '빈 병을 가장 많이 모은 반은 가장 적게 모은 반보다 얼마를 더 받을 수 있나요?',
  },
  {
    head: '학교',
    labels: ['가', '나', '다', '라'],
    suf: ' 학교',
    thing: '심은 나무의 수',
    of: (n: string) => `${n}에서 심은 나무의 수`,
    unit: '그루',
    resUnit: 'L',
    per: (k: number) => `나무 한 그루에 물을 $${k}$ L씩 준다면`,
    ask: (n: string) => `${n}에서 심은 나무에 줄 물은 모두 몇 L인가요?`,
    diff: '나무를 가장 많이 심은 학교는 가장 적게 심은 학교보다 물이 몇 L 더 필요한가요?',
  },
];
function gData(r: Rng, level: number) {
  const th = r.pick(G_THEMES);
  const units = level === 1 ? [10, 1] : [100, 10];
  const vals = until(
    () => th.labels.map(() => (level === 1 ? r.int(11, 48) : r.int(11, 48) * 10)),
    (v) => new Set(v).size === v.length,
  );
  return { th, units, vals, name: (i: number) => th.labels[i] + th.suf };
}

export const WORDS3: Record<string, Skill[]> = {
  // ═════════════ e3a-1 덧셈과 뺄셈 ═════════════
  'e3a-1': [
    {
      id: 'word-two',
      title: '처음 수 구하기·두 단계 문장제',
      gen(r, level) {
        const [n1, n2] = pick2Names(r);
        if (level === 1) {
          const x = r.int(150, 600),
            b = r.int(110, 350);
          if (r.chance(0.5)) {
            const it = r.pick([
              { w: '구슬', u: '개' },
              { w: '딱지', u: '장' },
              { w: '칭찬 붙임딱지', u: '장' },
              { w: '종이학', u: '마리' },
            ]);
            return {
              q: `${n1}는 ${J(it.w, '을/를')} 몇 ${it.u} 가지고 있었습니다. 오늘 ${n2}에게서 $${b}$${J(it.u, '을/를')} 더 받았더니 모두 $${x + b}$${J(it.u, '이/가')} 되었습니다. ${n1}가 처음에 가지고 있던 ${J(it.w, '은/는')} 몇 ${it.u}인가요?`,
              answer: { type: 'num', value: x, unit: it.u },
              steps: [`처음 수를 □라 하면 □ $+${b}=${x + b}$`, `덧셈과 뺄셈의 관계로 □ $=${x + b}-${b}=${x}$`, `답: $${x}$${it.u}`],
              hint: '처음 수를 □로 놓고 식을 세워 보세요.',
            };
          }
          return {
            q: `학교 도서관 책장에 책이 몇 권 꽂혀 있었습니다. 학생들이 그중 $${b}$권을 빌려 가서 $${x}$권이 남았습니다. 처음 책장에 꽂혀 있던 책은 몇 권인가요?`,
            answer: { type: 'num', value: x + b, unit: '권' },
            steps: [`처음 책 수를 □라 하면 □ $-${b}=${x}$`, `□ $=${x}+${b}=${x + b}$`, `답: $${x + b}$권`],
            hint: '빌려 간 책과 남은 책을 더하면 처음 책 수예요.',
          };
        }
        if (level === 2) {
          const a = r.int(150, 450),
            d = r.int(30, 150);
          const more = r.chance(0.5);
          const b = more ? a + d : a - d;
          const tpl = r.int(0, 2);
          const q = [
            `${n1}는 줄넘기를 $${a}$번 했고, ${n2}는 ${n1}보다 $${d}$번 ${more ? '더 많이' : '더 적게'} 했습니다. 두 사람이 한 줄넘기는 모두 몇 번인가요?`,
            `${n1}는 종이학을 $${a}$마리 접었고, ${n2}는 ${n1}보다 $${d}$마리 ${more ? '더 많이' : '더 적게'} 접었습니다. 두 사람이 접은 종이학은 모두 몇 마리인가요?`,
            `과수원에서 사과를 오전에 $${a}$개 땄고, 오후에는 오전보다 $${d}$개 ${more ? '더 많이' : '더 적게'} 땄습니다. 하루 동안 딴 사과는 모두 몇 개인가요?`,
          ][tpl];
          const who = tpl === 2 ? '오후' : n2;
          return {
            q,
            answer: {
              type: 'num',
              value: a + b,
              unit: ['번', '마리', '개'][tpl],
            },
            steps: [`${who}: $${a}${more ? '+' : '-'}${d}=${b}$`, `모두: $${a}+${b}=${a + b}$`, `답: $${a + b}$${['번', '마리', '개'][tpl]}`],
            hint: `먼저 ${tpl === 2 ? '오후에 딴 사과' : `${n2}의 수`}를 구해요.`,
          };
        }
        if (r.chance(0.5)) {
          const [a, b, cc, d] = until(
            () => [r.int(400, 800), r.int(100, 250), r.int(100, 300), r.int(100, 250)],
            ([a, b, cc, d]) => a - b + cc - d > 50,
          );
          const fin = a - b + cc - d;
          return {
            q: `기차에 $${a}$명이 타고 있었습니다. 첫 번째 역에서 $${b}$명이 내리고 $${cc}$명이 탔습니다. 두 번째 역에서 $${d}$명이 내렸다면 지금 기차에 타고 있는 사람은 몇 명인가요?`,
            answer: { type: 'num', value: fin, unit: '명' },
            steps: [`첫 번째 역에서 내린 뒤: $${a}-${b}=${a - b}$(명)`, `탄 뒤: $${a - b}+${cc}=${a - b + cc}$(명)`, `두 번째 역에서 내린 뒤: $${a - b + cc}-${d}=${fin}$(명)`],
          };
        }
        const [p, q2, s] = until(
          () => [r.int(200, 500), r.int(200, 500), r.int(250, 700)],
          ([p, q2, s]) => s > Math.max(p, q2) && p + q2 - s >= 50 && p + q2 - s <= 300,
        );
        const place = r.pick(['도서관', '우체국', '문구점', '놀이터']);
        return {
          q: `${nm(n1)}네 집에서 ${place}까지는 $${p}$ m, ${place}에서 학교까지는 $${q2}$ m입니다. 집에서 학교로 바로 가는 길은 $${s}$ m입니다. ${J(place, '을/를')} 거쳐 가는 길은 바로 가는 길보다 몇 m 더 먼가요?`,
          answer: { type: 'num', value: p + q2 - s, unit: 'm' },
          steps: [`${J(place, '을/를')} 거쳐 가는 길: $${p}+${q2}=${p + q2}$ (m)`, `차: $${p + q2}-${s}=${p + q2 - s}$ (m)`],
          hint: '거쳐 가는 길의 길이부터 구해요.',
        };
      },
    },
  ],

  // ═════════════ e3a-2 평면도형 ═════════════
  'e3a-2': [
    {
      id: 'shape-wire',
      title: '철사·리본으로 도형 만들기',
      gen(r, level) {
        const name = pickName(r);
        if (level === 1) {
          if (r.chance(0.5)) {
            const a = r.int(5, 25);
            const obj = r.pick(['액자', '손수건', '타일', '쿠션']);
            return {
              q: `${nm(name)}는 한 변이 $${a}$ cm인 정사각형 모양 ${obj}의 네 변을 따라 리본을 겹치지 않게 붙이려고 합니다. 필요한 리본은 몇 cm인가요?`,
              answer: { type: 'num', value: 4 * a, unit: 'cm' },
              steps: ['정사각형은 네 변의 길이가 모두 같아요.', `$${a}+${a}+${a}+${a}=${4 * a}$ (cm)`],
            };
          }
          const a = r.int(8, 30),
            b = r.int(4, a - 2);
          const obj = r.pick(['공책', '게시판', '사진', '방석']);
          return {
            q: `가로가 $${a}$ cm, 세로가 $${b}$ cm인 직사각형 모양 ${obj}의 네 변을 따라 색 테이프를 겹치지 않게 붙였습니다. 붙인 색 테이프는 모두 몇 cm인가요?`,
            answer: { type: 'num', value: 2 * (a + b), unit: 'cm' },
            steps: ['직사각형은 마주 보는 두 변의 길이가 같아요.', `$${a}+${b}+${a}+${b}=${2 * (a + b)}$ (cm)`],
          };
        }
        if (level === 2) {
          const [a, b, T] = until(
            () => [r.int(6, 20), r.int(3, 15), r.int(5, 15) * 10],
            ([a, b, T]) => a > b && T - 2 * (a + b) >= 4,
          );
          return {
            q: `길이가 $${T}$ cm인 철사로 가로가 $${a}$ cm, 세로가 $${b}$ cm인 직사각형을 겹치는 부분 없이 $1$개 만들었습니다. 남은 철사는 몇 cm인가요?`,
            answer: { type: 'num', value: T - 2 * (a + b), unit: 'cm' },
            steps: [`직사각형을 만드는 데 쓴 철사: $${a}+${b}+${a}+${b}=${2 * (a + b)}$ (cm)`, `남은 철사: $${T}-${2 * (a + b)}=${T - 2 * (a + b)}$ (cm)`],
          };
        }
        if (r.chance(0.5)) {
          const s = r.int(6, 20);
          const a = r.int(s + 1, 2 * s - 2);
          const b = 2 * s - a;
          return {
            q: `한 변이 $${s}$ cm인 정사각형을 만들었던 철사를 펴서, 겹치는 부분 없이 가로가 $${a}$ cm인 직사각형을 만들었습니다. 이 직사각형의 세로는 몇 cm인가요?`,
            answer: { type: 'num', value: b, unit: 'cm' },
            steps: [
              `철사의 길이: $${s}+${s}+${s}+${s}=${4 * s}$ (cm)`,
              `가로 두 변: $${a}+${a}=${2 * a}$ (cm), 세로 두 변: $${4 * s}-${2 * a}=${2 * b}$ (cm)`,
              `세로 한 변: $${b}$ cm ($${b}+${b}=${2 * b}$)`,
            ],
            hint: '정사각형의 네 변의 길이의 합이 철사의 길이예요.',
          };
        }
        const [a, b] = until(
          () => [r.int(8, 25), r.int(3, 15)],
          ([a, b]) => a > b && (a + b) % 2 === 0,
        );
        const s = (a + b) / 2;
        return {
          q: `가로가 $${a}$ cm, 세로가 $${b}$ cm인 직사각형을 만들었던 철사를 펴서, 겹치는 부분 없이 정사각형 $1$개를 만들었습니다. 정사각형의 한 변은 몇 cm인가요?`,
          answer: { type: 'num', value: s, unit: 'cm' },
          steps: [
            `철사의 길이: $${a}+${b}+${a}+${b}=${2 * (a + b)}$ (cm)`,
            `정사각형은 네 변이 같으므로 같은 수를 $4$번 더해 $${2 * (a + b)}$가 되는 수를 찾아요.`,
            `$${s}+${s}+${s}+${s}=${4 * s}$ → 한 변은 $${s}$ cm`,
          ],
        };
      },
    },
    {
      id: 'paper-cut',
      title: '종이 자르기·이어 붙이기',
      gen(r, level) {
        if (level <= 2) {
          const b = r.int(4, 15),
            a = r.int(b + 2, b + 15);
          const fig = polyFig(
            [
              [0, 0],
              [a, 0],
              [a, b],
              [0, b],
            ],
            {
              sides: [`${a} cm`, `${b} cm`, null, null],
              right: [true, true, true, true],
            },
          );
          if (level === 1)
            return {
              q: `가로가 $${a}$ cm, 세로가 $${b}$ cm인 직사각형 모양 종이를 잘라서 가장 큰 정사각형을 $1$개 만들었습니다. 만든 정사각형의 네 변의 길이의 합은 몇 cm인가요?`,
              fig,
              answer: { type: 'num', value: 4 * b, unit: 'cm' },
              steps: [`가장 큰 정사각형의 한 변은 짧은 변의 길이와 같아요: $${b}$ cm`, `네 변의 길이의 합: $${b}+${b}+${b}+${b}=${4 * b}$ (cm)`],
              hint: '정사각형의 한 변은 종이의 짧은 변보다 길 수 없어요.',
            };
          return {
            q: `가로가 $${a}$ cm, 세로가 $${b}$ cm인 직사각형 모양 종이에서 가장 큰 정사각형을 $1$개 잘라 냈습니다. 남은 종이도 직사각형일 때, 남은 직사각형의 네 변의 길이의 합은 몇 cm인가요?`,
            fig,
            answer: { type: 'num', value: 2 * a, unit: 'cm' },
            steps: [`잘라 낸 정사각형의 한 변: $${b}$ cm`, `남은 직사각형: 가로 $${a}-${b}=${a - b}$ (cm), 세로 $${b}$ cm`, `네 변의 합: $${a - b}+${b}+${a - b}+${b}=${2 * a}$ (cm)`],
          };
        }
        const k = r.int(2, 4);
        const a = r.int(3, 9),
          b = until(
            () => r.int(2, 9),
            (x) => x !== a,
          );
        const W = a * k;
        const u = Math.min(12, 230 / W);
        const x0 = 50;
        const fig = new Svg(Math.round(W * u + x0 + 20), Math.round(b * u + 44));
        for (let i = 0; i < k; i++)
          fig.rect(x0 + i * a * u, 12, a * u, b * u, {
            cls: 'acc',
            fill: true,
          });
        fig.text(x0 + (a * u) / 2, 12 + b * u + 14, `${a} cm`, { size: 12 });
        fig.text(x0 - 6, 12 + (b * u) / 2, `${b} cm`, {
          size: 12,
          anchor: 'end',
        });
        const per = 2 * (W + b);
        return {
          q: `가로가 $${a}$ cm, 세로가 $${b}$ cm인 직사각형 모양 카드 $${k}$장을 겹치지 않게 옆으로 나란히 이어 붙여 큰 직사각형을 만들었습니다. 큰 직사각형의 네 변의 길이의 합은 몇 cm인가요?`,
          fig: fig.toString(),
          answer: { type: 'num', value: per, unit: 'cm' },
          steps: [`큰 직사각형의 가로: $${a}\\times${k}=${W}$ (cm), 세로: $${b}$ cm`, `네 변의 합: $${W}+${b}+${W}+${b}=${per}$ (cm)`],
          hint: '이어 붙인 뒤 큰 직사각형의 가로와 세로를 먼저 구해요.',
        };
      },
    },
  ],

  // ═════════════ e3a-3 나눗셈 ═════════════
  'e3a-3': [
    {
      id: 'div-word2',
      title: '묶어 세기·간격 문장제',
      gen(r, level) {
        const [n1, n2] = pick2Names(r);
        if (level === 1) {
          const tpl = r.int(0, 3);
          const q = r.int(2, 9);
          if (tpl === 0) {
            const w = r.pick([3, 4]);
            const toy = w === 3 ? '세발자전거' : '장난감 자동차';
            return {
              q: `${toy} 한 대를 만드는 데 바퀴가 $${w}$개 필요합니다. 바퀴 $${w * q}$개로 ${J(toy, '을/를')} 몇 대 만들 수 있나요?`,
              answer: { type: 'num', value: q, unit: '대' },
              steps: [`바퀴를 $${w}$개씩 묶어요: $${w * q}\\div${w}$`, `$${w}\\times${q}=${w * q}$ 이므로 $${q}$대`],
            };
          }
          if (tpl === 1) {
            const b = r.int(2, 9);
            return {
              q: `긴 의자 한 개에 $${b}$명씩 앉을 수 있습니다. 학생 $${b * q}$명이 모두 앉으려면 긴 의자는 몇 개 필요한가요?`,
              answer: { type: 'num', value: q, unit: '개' },
              steps: [`$${b * q}\\div${b}$`, `$${b}\\times${q}=${b * q}$ 이므로 $${q}$개`],
            };
          }
          if (tpl === 2) {
            const b = r.int(2, 9);
            return {
              q: `꽃 $${b * q}$송이를 꽃병 $${b}$개에 똑같이 나누어 꽂으려고 합니다. 꽃병 한 개에 몇 송이씩 꽂으면 되나요?`,
              answer: { type: 'num', value: q, unit: '송이' },
              steps: [`$${b * q}\\div${b}$`, `$${b}\\times${q}=${b * q}$ 이므로 $${q}$송이씩`],
            };
          }
          return {
            q: `${nm(n1)}는 $${7 * q}$일 동안 하루도 빠짐없이 피아노를 연습했습니다. 피아노를 연습한 기간은 몇 주인가요?`,
            answer: { type: 'num', value: q, unit: '주' },
            steps: ['$1$주일은 $7$일이에요.', `$${7 * q}\\div7=${q}$ (주)`],
          };
        }
        const k = r.int(2, 9),
          q = r.int(2, 9);
        const L = k * q;
        if (level === 2) {
          if (r.chance(0.5)) {
            const w = r.pick(['리본', '통나무', '가래떡', '철사']);
            return {
              q: `길이가 $${L}$ cm인 ${J(w, '을/를')} $${k}$ cm씩 똑같이 자르려고 합니다. 모두 몇 번 잘라야 하나요?`,
              answer: { type: 'num', value: q - 1, unit: '번' },
              steps: [`도막 수: $${L}\\div${k}=${q}$(도막)`, `마지막 도막은 자르지 않아도 되므로 자르는 횟수는 $${q}-1=${q - 1}$(번)`],
              hint: '도막 수와 자르는 횟수는 달라요. 그림을 그려 보세요.',
            };
          }
          return {
            q: `길이가 $${L}$ m인 길의 한쪽에 처음부터 끝까지 $${k}$ m 간격으로 나무를 심으려고 합니다. 나무는 모두 몇 그루 필요한가요? (나무의 두께는 생각하지 않아요.)`,
            answer: { type: 'num', value: q + 1, unit: '그루' },
            steps: [`간격 수: $${L}\\div${k}=${q}$(군데)`, `처음과 끝에 모두 심으므로 나무 수는 간격 수보다 $1$ 커요: $${q}+1=${q + 1}$(그루)`],
            hint: '간격 수와 나무 수의 관계를 생각해 보세요.',
          };
        }
        if (r.chance(0.5)) {
          return {
            q: `길이가 $${L}$ m인 길의 양쪽에 처음부터 끝까지 $${k}$ m 간격으로 가로등을 세우려고 합니다. 가로등은 모두 몇 개 필요한가요? (가로등의 두께는 생각하지 않아요.)`,
            answer: { type: 'num', value: 2 * (q + 1), unit: '개' },
            steps: [`간격 수: $${L}\\div${k}=${q}$(군데)`, `한쪽에 필요한 가로등: $${q}+1=${q + 1}$(개)`, `양쪽: $${q + 1}+${q + 1}=${2 * (q + 1)}$(개)`],
          };
        }
        const [kids, each] = [r.int(3, 9), r.int(3, 9)];
        const tot = kids * each;
        const a = r.int(Math.max(5, tot - 40), tot - 5);
        const b = tot - a;
        const item = r.pick(['사탕', '쿠키', '젤리', '밤']);
        return {
          q: `${n1}는 ${J(item, '을/를')} $${a}$개, ${n2}는 $${b}$개 가지고 있습니다. 두 사람이 가진 ${J(item, '을/를')} 모두 모아 $${kids}$명에게 똑같이 나누어 주면 한 명에게 몇 개씩 줄 수 있나요?`,
          answer: { type: 'num', value: each, unit: '개' },
          steps: [`모은 ${item}: $${a}+${b}=${tot}$(개)`, `한 명에게: $${tot}\\div${kids}=${each}$(개)`],
        };
      },
    },
  ],

  // ═════════════ e3a-4 곱셈 ═════════════
  'e3a-4': [
    {
      id: 'mul-word2',
      title: '몇 배·두 단계 곱셈 문장제',
      gen(r, level) {
        const [n1, n2] = pick2Names(r);
        if (level === 1) {
          if (r.chance(0.3)) {
            const age = r.int(10, 12),
              k = r.pick([3, 4]);
            const who = k === 3 ? '이모' : '삼촌';
            return {
              q: `${nm(n1)}는 $${age}$살입니다. ${who}의 나이는 ${n1} 나이의 $${k}$배입니다. ${J(who, '은/는')} 몇 살인가요?`,
              answer: { type: 'num', value: age * k, unit: '살' },
              steps: [`${n1} 나이의 $${k}$배 → $${age}\\times${k}$`, `$${age}\\times${k}=${age * k}$ (살)`],
            };
          }
          const a = r.int(11, 49),
            k = r.int(2, 9);
          const it = r.pick([
            { w: '딱지', u: '장' },
            { w: '구슬', u: '개' },
            { w: '색종이', u: '장' },
            { w: '우표', u: '장' },
          ]);
          return {
            q: `${n1}는 ${J(it.w, '을/를')} $${a}$${it.u} 가지고 있고, ${n2}는 ${n1}가 가진 수의 $${k}$배만큼 가지고 있습니다. ${n2}가 가진 ${J(it.w, '은/는')} 몇 ${it.u}인가요?`,
            answer: { type: 'num', value: a * k, unit: it.u },
            steps: [`$${a}$의 $${k}$배 → $${a}\\times${k}$`, `$${a}\\times${k}=${a * k}$ (${it.u})`],
          };
        }
        if (level === 2) {
          const tpl = r.int(0, 2);
          if (tpl === 0) {
            const a = r.int(12, 45),
              b = r.int(11, 24);
            return {
              q: `농장에 닭이 $${a}$마리, 돼지가 $${b}$마리 있습니다. 닭과 돼지의 다리는 모두 몇 개인가요?`,
              answer: { type: 'num', value: 2 * a + 4 * b, unit: '개' },
              steps: [`닭의 다리: $${a}\\times2=${2 * a}$(개)`, `돼지의 다리: $${b}\\times4=${4 * b}$(개)`, `모두: $${2 * a}+${4 * b}=${2 * a + 4 * b}$(개)`],
              hint: '닭은 다리가 2개, 돼지는 4개예요.',
            };
          }
          if (tpl === 1) {
            const a = r.int(12, 35),
              b = r.int(11, 25);
            return {
              q: `공원에 두발자전거가 $${a}$대, 세발자전거가 $${b}$대 있습니다. 자전거 바퀴는 모두 몇 개인가요?`,
              answer: { type: 'num', value: 2 * a + 3 * b, unit: '개' },
              steps: [`두발자전거 바퀴: $${a}\\times2=${2 * a}$(개)`, `세발자전거 바퀴: $${b}\\times3=${3 * b}$(개)`, `모두: $${2 * a}+${3 * b}=${2 * a + 3 * b}$(개)`],
            };
          }
          const per = r.pick([12, 24, 18, 16, 36]),
            k = r.int(3, 9),
            extra = r.int(3, 11);
          return {
            q: `색연필이 한 통에 $${per}$자루씩 $${k}$통 있고, 낱개로 $${extra}$자루가 더 있습니다. 색연필은 모두 몇 자루인가요?`,
            answer: { type: 'num', value: per * k + extra, unit: '자루' },
            steps: [`통에 든 색연필: $${per}\\times${k}=${per * k}$(자루)`, `모두: $${per * k}+${extra}=${per * k + extra}$(자루)`],
          };
        }
        if (r.chance(0.5)) {
          const [a, b, cc, d] = until(
            () => [r.int(25, 80), r.int(3, 9), r.int(25, 80), r.int(3, 9)],
            ([a, b, cc, d]) => a !== cc && b !== d && a * b !== cc * d,
          );
          const A = a * b,
            B = cc * d;
          return {
            q: `줄넘기를 ${n1}는 하루에 $${a}$번씩 $${b}$일 동안 했고, ${n2}는 하루에 $${cc}$번씩 $${d}$일 동안 했습니다. 줄넘기를 더 많이 한 사람은 덜 한 사람보다 몇 번 더 많이 했나요?`,
            answer: { type: 'num', value: Math.abs(A - B), unit: '번' },
            steps: [`${n1}: $${a}\\times${b}=${A}$(번)`, `${n2}: $${cc}\\times${d}=${B}$(번)`, `${A > B ? n1 : n2}가 $${Math.max(A, B)}-${Math.min(A, B)}=${Math.abs(A - B)}$(번) 더 많이 했어요.`],
          };
        }
        const [a, b, cc, d] = until(
          () => [r.int(12, 40), r.int(2, 9), r.int(12, 40), r.int(2, 9)],
          ([a, b, cc, d]) => a !== cc && b !== d,
        );
        return {
          q: `가 가게에는 사탕이 한 봉지에 $${a}$개씩 $${b}$봉지, 나 가게에는 한 봉지에 $${cc}$개씩 $${d}$봉지 있습니다. 두 가게에 있는 사탕은 모두 몇 개인가요?`,
          answer: { type: 'num', value: a * b + cc * d, unit: '개' },
          steps: [`가 가게: $${a}\\times${b}=${a * b}$(개)`, `나 가게: $${cc}\\times${d}=${cc * d}$(개)`, `모두: $${a * b}+${cc * d}=${a * b + cc * d}$(개)`],
        };
      },
    },
  ],

  // ═════════════ e3a-5 길이와 시간 ═════════════
  'e3a-5': [
    {
      id: 'len-word',
      title: '길이 문장제',
      gen(r, level) {
        const name = pickName(r);
        if (level === 1) {
          const [p, q] = until(
            () => [r.int(1, 3) * 1000 + r.int(1, 9) * 100 + r.pick([0, 0, 50]), r.int(2, 9) * 100 + r.pick([0, 0, 50])],
            ([p, q]) => (p + q) % 1000 !== 0,
          );
          const tot = p + q;
          const [A, B, C] = r.pick([
            ['집', '학교', '도서관'],
            ['집', '공원', '수영장'],
            ['학교', '박물관', '공원'],
          ]);
          return {
            q: `${nm(name)}네 ${A === '집' ? '' : '동네 '}${A}에서 ${B}까지는 ${kmm(p)}이고, ${B}에서 ${C}까지는 ${kmm(q)}입니다. ${A}에서 ${J(B, '을/를')} 거쳐 ${C}까지 가는 거리는 몇 km 몇 m인가요?`,
            answer: {
              type: 'fields',
              fields: [
                { label: 'km', value: Math.floor(tot / 1000) },
                { label: 'm', value: tot % 1000 },
              ],
            },
            steps: [`m끼리: $${p % 1000}+${q}=${(p % 1000) + q}$${(p % 1000) + q >= 1000 ? ` → $1000$ m를 $1$ km로 받아올림` : ''}`, `답: ${kmm(tot)}`],
            hint: '$1$ km $=1000$ m예요.',
          };
        }
        if (level === 2) {
          const [a, b] = until(
            () => [r.int(150, 400), r.int(40, 200)],
            ([a, b]) => a - b > 20 && (a - b) % 10 !== 0 && a % 10 !== 0 && b % 10 !== 0 && a % 10 !== b % 10,
          );
          const w = r.pick(['색 테이프', '리본', '끈']);
          return {
            q: `${J(w, '이/가')} ${cmmm(a)} 있었습니다. 그중 ${cmmm(b)}를 사용했다면 남은 ${J(w, '은/는')} 몇 cm 몇 mm인가요?`,
            answer: {
              type: 'fields',
              fields: [
                { label: 'cm', value: Math.floor((a - b) / 10) },
                { label: 'mm', value: (a - b) % 10 },
              ],
            },
            steps: [
              a % 10 < b % 10
                ? `mm끼리 뺄 수 없으므로 $1$ cm $=10$ mm를 받아내림: $${(a % 10) + 10}-${b % 10}=${(a % 10) + 10 - (b % 10)}$ (mm)`
                : `mm끼리: $${a % 10}-${b % 10}=${(a % 10) - (b % 10)}$ (mm)`,
              `cm끼리: $${Math.floor(a / 10)}${a % 10 < b % 10 ? '-1' : ''}-${Math.floor(b / 10)}=${Math.floor((a - b) / 10)}$ (cm)`,
              `답: ${cmmm(a - b)}`,
            ],
          };
        }
        if (r.chance(0.5)) {
          const [a, k] = until(
            () => [r.int(80, 250), r.int(5, 25)],
            ([a, k]) => a % 10 !== 0 && (2 * a - k) % 10 !== 0,
          );
          const tot = 2 * a - k;
          return {
            q: `길이가 각각 ${cmmm(a)}인 색 테이프 $2$장을 $${k}$ mm만큼 겹쳐서 이어 붙였습니다. 이어 붙인 색 테이프의 전체 길이는 몇 cm 몇 mm인가요?`,
            answer: {
              type: 'fields',
              fields: [
                { label: 'cm', value: Math.floor(tot / 10) },
                { label: 'mm', value: tot % 10 },
              ],
            },
            steps: [`mm로 바꾸면 한 장은 $${a}$ mm`, `두 장의 길이: $${a}+${a}=${2 * a}$ (mm)`, `겹친 부분을 빼면: $${2 * a}-${k}=${tot}$ (mm) $=$ ${cmmm(tot)}`],
            hint: '겹친 부분은 두 번 센 셈이니 한 번 빼요.',
          };
        }
        const [p, q, s] = until(
          () => [r.int(6, 19) * 100 + r.pick([0, 50]), r.int(4, 15) * 100 + r.pick([0, 50]), r.int(14, 28) * 100],
          ([p, q, s]) => p + q - s >= 100 && p + q - s <= 900 && s > Math.max(p, q) && p > 1000,
        );
        return {
          q: `${nm(name)}네 집에서 공원까지는 ${kmm(p)}, 공원에서 도서관까지는 ${kmm(q)}입니다. 집에서 도서관으로 바로 가는 길은 ${kmm(s)}입니다. 공원을 거쳐 가는 길은 바로 가는 길보다 몇 m 더 먼가요?`,
          answer: { type: 'num', value: p + q - s, unit: 'm' },
          steps: [`모두 m로 바꾸어요: $${c(p)}$ m, $${c(q)}$ m, $${c(s)}$ m`, `공원을 거쳐 가는 길: $${c(p)}+${c(q)}=${c(p + q)}$ (m)`, `차: $${c(p + q)}-${c(s)}=${p + q - s}$ (m)`],
        };
      },
    },
  ],

  // ═════════════ e3a-6 분수와 소수 ═════════════
  'e3a-6': [
    {
      id: 'dec-word',
      title: '소수 문장제',
      gen(r, level) {
        const name = pickName(r);
        if (level === 1) {
          const k = r.int(1, 9);
          if (r.chance(0.5)) {
            const food = r.pick(['피자', '케이크', '떡', '수박']);
            return {
              q: `${J(food, '을/를')} 똑같이 $10$조각으로 나누어 ${nm(name)}네 가족이 $${k}$조각을 먹었습니다. 먹은 ${J(food, '은/는')} 전체의 얼마인지 소수로 나타내세요.`,
              answer: { type: 'num', value: k / 10, display: 'dec' },
              steps: [`$10$조각 중 $${k}$조각 → $${fr(k, 10)}$`, `$${fr(k, 10)}=0.${k}$`],
            };
          }
          return {
            q: `우유 $1$ L를 컵 $10$개에 똑같이 나누어 담았습니다. ${nm(name)}가 그중 $${k}$컵을 마셨다면 마신 우유는 몇 L인지 소수로 나타내세요.`,
            answer: { type: 'num', value: k / 10, unit: 'L', display: 'dec' },
            steps: [`한 컵은 $${fr(1, 10)}$ L $=0.1$ L`, `$0.1$이 $${k}$개 → $0.${k}$ L`],
          };
        }
        if (level === 2) {
          const names = pick3Names(r);
          const vals = until(
            () => names.map(() => r.int(31, 89)),
            (v) => new Set(v).size === 4 && v.every((x) => x % 10 !== 0),
          );
          const fmt = r.shuffle([0, 1, 2, 3]);
          const show = (mm: number, i: number) => (fmt[i] % 3 === 0 ? `$${Math.floor(mm / 10)}.${mm % 10}$ cm` : fmt[i] % 3 === 1 ? `$${Math.floor(mm / 10)}$ cm $${mm % 10}$ mm` : `$${mm}$ mm`);
          const long = r.chance(0.5);
          const target = long ? Math.max(...vals) : Math.min(...vals);
          const idx = vals.indexOf(target);
          return {
            q: `네 사람이 키운 강낭콩 싹의 길이를 재었습니다. 싹이 가장 ${long ? '긴' : '짧은'} 사람은 누구인가요?\n${names.map((n, i) => `${n}: ${show(vals[i], i)}`).join(', ')}`,
            answer: makeChoices(
              r,
              names[idx],
              names.filter((_, i) => i !== idx),
              4,
            ),
            steps: [
              `모두 cm 단위 소수로 나타내요: ${names.map((n, i) => `${n} $${Math.floor(vals[i] / 10)}.${vals[i] % 10}$`).join(', ')}`,
              `가장 ${long ? '긴' : '짧은'} 것: $${Math.floor(target / 10)}.${target % 10}$ cm → ${names[idx]}`,
            ],
            hint: '$1$ mm $=0.1$ cm예요.',
          };
        }
        if (r.chance(0.5)) {
          const [p, e] = until(
            () => [r.int(2, 4), r.int(5, 30)],
            ([p, e]) => 10 * p - e > 10 && (10 * p - e) % 10 !== 0,
          );
          const left = 10 * p - e;
          return {
            q: `피자 $${p}$판을 각각 똑같이 $10$조각으로 나누었습니다. 친구들과 함께 $${e}$조각을 먹었다면 남은 피자는 몇 판인지 소수로 나타내세요.`,
            answer: {
              type: 'num',
              value: left / 10,
              unit: '판',
              display: 'dec',
            },
            steps: [
              `전체 조각: $10$조각씩 $${p}$판 → $${10 * p}$조각`,
              `남은 조각: $${10 * p}-${e}=${left}$(조각)`,
              `한 조각은 $0.1$판이므로 $0.1$이 $${left}$개 → $${Math.floor(left / 10)}.${left % 10}$판`,
            ],
          };
        }
        const L = until(
          () => r.int(11, 49),
          (x) => x % 10 !== 0,
        );
        return {
          q: `길이가 $${Math.floor(L / 10)}.${L % 10}$ m인 끈을 $0.1$ m씩 똑같이 잘랐습니다. 끈은 모두 몇 도막이 되나요?`,
          answer: { type: 'num', value: L, unit: '도막' },
          steps: [
            `$${Math.floor(L / 10)}.${L % 10}$은 $0.1$이 몇 개인지 생각해요.`,
            `$${Math.floor(L / 10)}$은 $0.1$이 $${Math.floor(L / 10) * 10}$개, $0.${L % 10}$은 $0.1$이 $${L % 10}$개`,
            `모두 $${L}$개 → $${L}$도막`,
          ],
        };
      },
    },
  ],

  // ═════════════ e3b-1 곱셈 ═════════════
  'e3b-1': [
    {
      id: 'word-two',
      title: '어떤 수·두 단계 곱셈 문장제',
      gen(r, level) {
        const name = pickName(r);
        if (level === 1) {
          if (r.chance(0.5)) {
            const a = r.pick([15, 20, 25, 30, 35, 40, 45]),
              b = r.int(11, 31);
            return {
              q: `${nm(name)}는 매일 $${a}$분씩 운동을 합니다. $${b}$일 동안 운동한 시간은 모두 몇 분인가요?`,
              answer: { type: 'num', value: a * b, unit: '분' },
              steps: [`$${a}\\times${b}$`, `$${a}\\times${b}=${a * b}$ (분)`],
            };
          }
          const a = r.int(2, 9) * 10,
            b = r.int(2, 9) * 10;
          const it = r.pick([
            { w: '도토리', box: '자루', u: '개' },
            { w: '귤', box: '상자', u: '개' },
            { w: '공책', box: '묶음', u: '권' },
          ]);
          return {
            q: `한 ${it.box}에 ${J(it.w, '이/가')} $${a}$${it.u}씩 들어 있습니다. $${b}$${it.box}에 들어 있는 ${J(it.w, '은/는')} 모두 몇 ${it.u}인가요?`,
            answer: { type: 'num', value: a * b, unit: it.u },
            steps: [`$${a}\\times${b}$ → $${a / 10}\\times${b / 10}=${(a * b) / 100}$ 뒤에 $0$을 두 개 붙여요.`, `$${a}\\times${b}=${c(a * b)}$ (${it.u})`],
          };
        }
        if (level === 2) {
          const x = r.int(12, 60),
            b = r.int(12, 39);
          return {
            q: `어떤 수에 $${b}$를 곱해야 할 것을 잘못하여 더했더니 $${x + b}$가 되었습니다. 바르게 계산하면 얼마인가요?`,
            answer: { type: 'num', value: x * b },
            steps: [`어떤 수 $+${b}=${x + b}$ → 어떤 수 $=${x + b}-${b}=${x}$`, `바르게 계산: $${x}\\times${b}=${c(x * b)}$`],
            hint: '잘못 계산한 식으로 어떤 수부터 구해요.',
          };
        }
        if (r.chance(0.5)) {
          const [p, n, pay] = until(
            () => [r.int(15, 95) * 10, r.int(3, 9), r.pick([5000, 10000])],
            ([p, n, pay]) => p * n < pay && pay - p * n >= 200,
          );
          const it = r.pick(['공책', '필통', '색연필 세트', '스케치북']);
          return {
            q: `${nm(name)}는 한 개에 $${c(p)}$원인 ${J(it, '을/를')} $${n}$개 사고 $${c(pay)}$원을 냈습니다. 거스름돈은 얼마인가요?`,
            answer: { type: 'num', value: pay - p * n, unit: '원' },
            steps: [`${it} 값: $${c(p)}\\times${n}=${c(p * n)}$(원)`, `거스름돈: $${c(pay)}-${c(p * n)}=${c(pay - p * n)}$(원)`],
          };
        }
        const a = r.int(21, 35),
          b = r.int(12, 25),
          rest = r.int(5, 40);
        return {
          q: `색종이를 학생 $${a}$명에게 $${b}$장씩 나누어 주었더니 $${rest}$장이 남았습니다. 처음에 있던 색종이는 몇 장인가요?`,
          answer: { type: 'num', value: a * b + rest, unit: '장' },
          steps: [`나누어 준 색종이: $${a}\\times${b}=${a * b}$(장)`, `처음 색종이: $${a * b}+${rest}=${a * b + rest}$(장)`],
        };
      },
    },
  ],

  // ═════════════ e3b-2 나눗셈 ═════════════
  'e3b-2': [
    {
      id: 'word-two',
      title: '어떤 수·두 단계 나눗셈 문장제',
      gen(r, level) {
        const name = pickName(r);
        if (level === 1) {
          const b = r.int(2, 6),
            q = r.int(11, Math.floor(99 / b));
          const a = b * q;
          if (r.chance(0.5))
            return {
              q: `${nm(name)}는 $${a}$쪽짜리 동화책을 하루에 $${b}$쪽씩 읽으려고 합니다. 동화책을 다 읽으려면 며칠이 걸리나요?`,
              answer: { type: 'num', value: q, unit: '일' },
              steps: [`$${a}\\div${b}$`, `$${b}\\times${q}=${a}$ 이므로 $${q}$일`],
            };
          return {
            q: `귤 $${a}$개를 한 바구니에 $${b}$개씩 담으려고 합니다. 바구니는 몇 개 필요한가요?`,
            answer: { type: 'num', value: q, unit: '개' },
            steps: [`$${a}\\div${b}$`, `$${b}\\times${q}=${a}$ 이므로 $${q}$개`],
          };
        }
        if (level === 2) {
          const b = r.int(3, 9),
            q = r.int(11, 40),
            rem = r.int(1, b - 1);
          const x = b * q + rem;
          if (r.chance(0.5))
            return {
              q: `구슬을 친구 $${b}$명에게 $${q}$개씩 똑같이 나누어 주었더니 $${rem}$개가 남았습니다. 처음에 있던 구슬은 몇 개인가요?`,
              answer: { type: 'num', value: x, unit: '개' },
              steps: [`나누어 준 구슬: $${b}\\times${q}=${b * q}$(개)`, `처음 구슬: $${b * q}+${rem}=${x}$(개)`],
            };
          return {
            q: `어떤 수를 $${b}$로 나누었더니 몫이 $${q}$이고 나머지가 $${rem}$이었습니다. 어떤 수는 얼마인가요?`,
            answer: { type: 'num', value: x },
            steps: [`검산식: (나누는 수)$\\times$(몫)$+$(나머지)$=$(나누어지는 수)`, `$${b}\\times${q}+${rem}=${x}$`],
          };
        }
        if (r.chance(0.5)) {
          const [x, b, w] = until(
            () => [r.int(100, 600), r.int(3, 9), r.int(3, 9)],
            ([x, b, w]) => b !== w && x % b !== 0 && x % w !== 0,
          );
          return {
            q: `어떤 수를 $${b}$로 나누어야 할 것을 잘못하여 $${w}$로 나누었더니 몫이 $${Math.floor(x / w)}$이고 나머지가 $${x % w}$${was(x % w)}습니다. 바르게 계산했을 때의 몫과 나머지를 구하세요.`,
            answer: {
              type: 'fields',
              fields: [
                { label: '몫', value: Math.floor(x / b) },
                { label: '나머지', value: x % b },
              ],
            },
            steps: [`어떤 수: $${w}\\times${Math.floor(x / w)}+${x % w}=${x}$`, `바르게 계산: $${x}\\div${b}=${Math.floor(x / b)}\\cdots${x % b}$`],
            hint: '먼저 검산식으로 어떤 수를 구해요.',
          };
        }
        const b = r.int(4, 9),
          q = r.int(12, 60),
          rem = r.int(1, b - 1);
        const a = b * q + rem;
        const fruit = r.pick(['사과', '복숭아', '배', '참외']);
        return {
          q: `${fruit} $${a}$개를 한 상자에 $${b}$개씩 남김없이 모두 담으려고 합니다. ${J(fruit, '은/는')} 적어도 몇 개 더 있어야 하나요?`,
          answer: { type: 'num', value: b - rem, unit: '개' },
          steps: [`$${a}\\div${b}=${q}\\cdots${rem}$`, `남은 $${rem}$개로 한 상자를 더 채우려면 $${b}-${rem}=${b - rem}$, 즉 $${b - rem}$개가 더 있어야 해요.`],
        };
      },
    },
  ],

  // ═════════════ e3b-3 원 ═════════════
  'e3b-3': [
    {
      id: 'circle-life',
      title: '생활 속 원 문장제',
      gen(r, level) {
        const {
          w: obj,
          lo,
          hi,
        } = r.pick([
          { w: '접시', lo: 6, hi: 15 },
          { w: '훌라후프', lo: 30, hi: 45 },
          { w: '벽시계', lo: 12, hi: 20 },
          { w: '컵받침', lo: 4, hi: 7 },
          { w: '굴렁쇠', lo: 20, hi: 35 },
          { w: '피자', lo: 12, hi: 20 },
        ]);
        if (level === 1) {
          if (r.chance(0.5)) {
            const R = r.int(lo, hi);
            return {
              q: `지름이 $${2 * R}$ cm인 원 모양 ${J(obj, '이/가')} 있습니다. 이 ${obj}의 반지름은 몇 cm인가요?`,
              answer: { type: 'num', value: R, unit: 'cm' },
              steps: ['반지름은 지름의 반이에요.', `$${2 * R}\\div2=${R}$ (cm)`],
            };
          }
          const R = r.int(lo, hi);
          return {
            q: `반지름이 $${R}$ cm인 원 모양 ${J(obj, '이/가')} 있습니다. 이 ${obj}의 지름은 몇 cm인가요?`,
            answer: { type: 'num', value: 2 * R, unit: 'cm' },
            steps: ['지름은 반지름의 $2$배예요.', `$${R}\\times2=${2 * R}$ (cm)`],
          };
        }
        if (level === 2) {
          const k = r.int(3, 9);
          const { w: it, R } = r.pick([
            { w: '컵받침', R: r.int(4, 6) },
            { w: '접시', R: r.int(6, 12) },
            { w: '쿠키', R: r.int(3, 5) },
            { w: '거울', R: r.int(5, 9) },
          ]);
          if (r.chance(0.5))
            return {
              q: `반지름이 $${R}$ cm인 원 모양 ${it} $${k}$개를 겹치지 않게 한 줄로 맞닿도록 늘어놓았습니다. 늘어놓은 ${it}의 처음부터 끝까지의 길이는 몇 cm인가요?`,
              answer: { type: 'num', value: 2 * R * k, unit: 'cm' },
              steps: [`${it} 한 개의 지름: $${R}\\times2=${2 * R}$ (cm)`, `지름 $${k}$개의 길이: $${2 * R}\\times${k}=${2 * R * k}$ (cm)`],
            };
          return {
            q: `가로가 $${2 * R * k}$ cm인 직사각형 모양 상자에 크기가 같은 공 $${k}$개를 한 줄로 넣었더니 가로에 꼭 맞았습니다. 공의 반지름은 몇 cm인가요?`,
            answer: { type: 'num', value: R, unit: 'cm' },
            steps: [`공 $${k}$개의 지름의 합이 $${2 * R * k}$ cm`, `공 한 개의 지름: $${2 * R * k}\\div${k}=${2 * R}$ (cm)`, `반지름: $${2 * R}\\div2=${R}$ (cm)`],
          };
        }
        if (r.chance(0.5)) {
          const R = r.int(2, 5),
            m = r.int(2, 5),
            n = r.int(2, 4);
          return {
            q: `가로가 $${2 * R * m}$ cm, 세로가 $${2 * R * n}$ cm인 직사각형 모양 상자의 바닥에 반지름이 $${R}$ cm인 원 모양 쿠키를 가로와 세로로 줄을 맞추어 겹치지 않게 놓으려고 합니다. 쿠키를 한 층에 모두 몇 개 놓을 수 있나요?`,
            answer: { type: 'num', value: m * n, unit: '개' },
            steps: [`쿠키의 지름: $${R}\\times2=${2 * R}$ (cm)`, `가로에 $${2 * R * m}\\div${2 * R}=${m}$(개), 세로에 $${2 * R * n}\\div${2 * R}=${n}$(개)`, `모두 $${m}\\times${n}=${m * n}$(개)`],
          };
        }
        const k = r.int(2, 4),
          rs = r.int(2, 9);
        const Rb = rs * k;
        const s = new Svg(200, 140);
        const big = 60;
        s.circle(100, 70, big);
        s.dot(100, 70, { r: 2.5 });
        for (let i = 0; i < k; i++)
          s.circle(100 - big + (big / k) * (2 * i + 1), 70, big / k, {
            cls: 'acc',
          });
        return {
          q: `반지름이 $${Rb}$ cm인 큰 원 모양 쟁반 안에 크기가 같은 원 모양 접시 $${k}$개를 그림과 같이 큰 원의 지름 위에 꼭 맞게 나란히 놓았습니다. 접시 한 개의 반지름은 몇 cm인가요?`,
          fig: s.toString(),
          answer: { type: 'num', value: rs, unit: 'cm' },
          steps: [
            `큰 원의 지름: $${Rb}\\times2=${2 * Rb}$ (cm)`,
            `작은 원 $${k}$개의 지름의 합이 $${2 * Rb}$ cm이므로 작은 원의 지름: $${2 * Rb}\\div${k}=${2 * rs}$ (cm)`,
            `반지름: $${2 * rs}\\div2=${rs}$ (cm)`,
          ],
        };
      },
    },
    {
      id: 'compass-word',
      title: '컴퍼스로 원 그리기 문장제',
      gen(r, level) {
        const [n1, n2] = pick2Names(r);
        if (level === 1) {
          const R = r.int(2, 12);
          if (r.chance(0.5))
            return {
              q: `${nm(n1)}는 컴퍼스를 $${R}$ cm만큼 벌려서 원을 그렸습니다. ${n1}가 그린 원의 지름은 몇 cm인가요?`,
              answer: { type: 'num', value: 2 * R, unit: 'cm' },
              steps: ['컴퍼스를 벌린 길이가 원의 반지름이에요.', `지름: $${R}\\times2=${2 * R}$ (cm)`],
            };
          return {
            q: `지름이 $${2 * R}$ cm인 원을 그리려고 합니다. 컴퍼스를 몇 cm만큼 벌려야 하나요?`,
            answer: { type: 'num', value: R, unit: 'cm' },
            steps: ['컴퍼스를 벌린 길이가 원의 반지름이에요.', `반지름: $${2 * R}\\div2=${R}$ (cm)`],
          };
        }
        if (level === 2) {
          const R = r.int(2, 8),
            k = r.int(1, 6);
          return {
            q: `${nm(n1)}는 컴퍼스를 $${R}$ cm만큼 벌려 원을 그린 뒤, 같은 점을 원의 중심으로 하여 컴퍼스를 $${k}$ cm 더 벌려 큰 원을 그렸습니다. 큰 원의 지름은 몇 cm인가요?`,
            answer: { type: 'num', value: 2 * (R + k), unit: 'cm' },
            steps: [`큰 원의 반지름: $${R}+${k}=${R + k}$ (cm)`, `큰 원의 지름: $${R + k}\\times2=${2 * (R + k)}$ (cm)`],
          };
        }
        const [a, b] = until(
          () => [r.int(3, 12), r.int(3, 12) * 2],
          ([a, b]) => 2 * a !== b,
        );
        const A = 2 * a;
        return {
          q: `${nm(n1)}는 컴퍼스를 $${a}$ cm만큼 벌려서 원을 그렸고, ${nm(n2)}는 지름이 $${b}$ cm인 원을 그렸습니다. 누가 그린 원의 지름이 몇 cm 더 긴지 구하려고 합니다. 두 원의 지름의 차는 몇 cm인가요?`,
          answer: { type: 'num', value: Math.abs(A - b), unit: 'cm' },
          steps: [`${n1}의 원: 반지름 $${a}$ cm → 지름 $${A}$ cm`, `${n2}의 원: 지름 $${b}$ cm`, `${A > b ? n1 : n2}의 원이 $${Math.max(A, b)}-${Math.min(A, b)}=${Math.abs(A - b)}$ (cm) 더 길어요.`],
          hint: '반지름과 지름 중 한 가지로 맞추어 비교해요.',
        };
      },
    },
  ],

  // ═════════════ e3b-4 분수 ═════════════
  'e3b-4': [
    {
      id: 'frac-of-word',
      title: '전체의 분수만큼 문장제',
      gen(r, level) {
        const [n1, n2] = pick2Names(r);
        const it = r.pick([
          { w: '구슬', u: '개' },
          { w: '사탕', u: '개' },
          { w: '색종이', u: '장' },
          { w: '연필', u: '자루' },
          { w: '딸기', u: '개' },
        ]);
        if (level === 1) {
          const k = r.int(2, 9),
            q = r.int(2, 9);
          return {
            q: `${nm(n1)}는 ${it.w} $${k * q}$${it.u}의 $${fr(1, k)}$을 동생에게 주었습니다. 동생에게 준 ${J(it.w, '은/는')} 몇 ${it.u}인가요?`,
            answer: { type: 'num', value: q, unit: it.u },
            steps: [`$${k * q}$${J(it.u, '을/를')} 똑같이 $${k}$묶음으로 나누면 한 묶음은 $${k * q}\\div${k}=${q}$`, `$${fr(1, k)}$은 $${k}$묶음 중 $1$묶음 → $${q}$${it.u}`],
          };
        }
        if (level === 2) {
          const tpl = r.int(0, 2);
          if (tpl === 0) {
            const k = r.int(3, 9),
              q = r.int(2, 8),
              p = r.int(2, k - 1);
            return {
              q: `${it.w} $${k * q}$${it.u} 중에서 $${fr(p, k)}$만큼을 ${n1}가 가졌습니다. 남은 ${J(it.w, '은/는')} 몇 ${it.u}인가요?`,
              answer: { type: 'num', value: k * q - p * q, unit: it.u },
              steps: [`$${k * q}$의 $${fr(1, k)}$: $${k * q}\\div${k}=${q}$`, `$${k * q}$의 $${fr(p, k)}$: $${q}\\times${p}=${p * q}$`, `남은 것: $${k * q}-${p * q}=${k * q - p * q}$(${it.u})`],
            };
          }
          if (tpl === 1) {
            const k = r.pick([2, 3, 4, 5, 6, 10, 12]);
            const p = until(
              () => r.int(1, k - 1),
              (x) => gcd(x, k) === 1,
            );
            const [act, ask] = r.pick([
              ['책을 읽었습니다', '책을 읽은'],
              ['줄넘기를 했습니다', '줄넘기를 한'],
              ['숙제를 했습니다', '숙제를 한'],
              ['피아노를 연습했습니다', '피아노를 연습한'],
            ]);
            return {
              q: `${nm(n1)}는 $1$시간의 $${fr(p, k)}$ 동안 ${act}. ${n1}가 ${ask} 시간은 몇 분인가요?`,
              answer: { type: 'num', value: (60 / k) * p, unit: '분' },
              steps: [`$1$시간 $=60$분`, `$60$분의 $${fr(1, k)}$: $60\\div${k}=${60 / k}$(분)`, `$${fr(p, k)}$: $${60 / k}\\times${p}=${(60 / k) * p}$(분)`],
            };
          }
          const k = r.pick([2, 4, 5, 10]);
          const p = until(
            () => r.int(1, k - 1),
            (x) => gcd(x, k) === 1,
          );
          return {
            q: `길이가 $1$ m인 리본의 $${fr(p, k)}$만큼을 잘라 선물을 포장했습니다. 포장에 사용한 리본은 몇 cm인가요?`,
            answer: { type: 'num', value: (100 / k) * p, unit: 'cm' },
            steps: [`$1$ m $=100$ cm`, `$100$의 $${fr(1, k)}$: $100\\div${k}=${100 / k}$ (cm)`, `$${fr(p, k)}$: $${100 / k}\\times${p}=${(100 / k) * p}$ (cm)`],
          };
        }
        const [a, b, m] = until(
          () => [r.int(2, 5), r.int(2, 5), r.int(1, 4)],
          ([a, b, m]) => a * b * m <= 60 && a * b * m >= 12,
        );
        const T = a * b * m;
        const first = T / a;
        const rest1 = T - first;
        const second = rest1 / b;
        return {
          q: `${it.w} $${T}$${it.u} 중에서 $${fr(1, a)}$을 ${n1}가 가지고, 남은 ${it.w}의 $${fr(1, b)}$을 ${n2}가 가졌습니다. 두 사람이 가지고 남은 ${J(it.w, '은/는')} 몇 ${it.u}인가요?`,
          answer: { type: 'num', value: rest1 - second, unit: it.u },
          steps: [
            `${n1}: $${T}\\div${a}=${first}$(${it.u}), 남은 것: $${T}-${first}=${rest1}$(${it.u})`,
            `${n2}: $${rest1}\\div${b}=${second}$(${it.u})`,
            `남은 것: $${rest1}-${second}=${rest1 - second}$(${it.u})`,
          ],
          hint: `${n2}는 처음 전체가 아니라 '남은 것'의 $${fr(1, b)}$을 가졌어요.`,
        };
      },
    },
    {
      id: 'mixed-word',
      title: '가분수·대분수 문장제',
      gen(r, level) {
        const name = pickName(r);
        if (level === 1) {
          const [k, m] = until(
            () => [r.int(3, 8), r.int(4, 30)],
            ([k, m]) => m > k && m % k !== 0 && m < 4 * k && gcd(m % k, k) === 1,
          );
          const food = r.pick(['피자', '케이크', '파이']);
          return {
            q: `크기가 같은 ${food} 여러 판을 각각 똑같이 $${k}$조각으로 나누었습니다. ${nm(name)}네 반 학생들이 먹은 ${J(food, '이/가')} $${m}$조각이라면 먹은 ${J(food, '은/는')} 몇 판인지 대분수로 나타내세요.`,
            answer: { type: 'num', value: m / k, unit: '판', display: 'mixed' },
            steps: [`한 조각은 $${fr(1, k)}$판 → $${m}$조각은 $${fr(m, k)}$판`, `$${m}\\div${k}=${Math.floor(m / k)}\\cdots${m % k}$ 이므로 $${fr(m, k)}=${mx(m, k)}$ (판)`],
          };
        }
        if (level === 2) {
          const names = pick3Names(r);
          const k = r.int(3, 9);
          const vals = until(
            () => names.map(() => r.int(k + 1, 4 * k)),
            (v) => new Set(v).size === 4 && v.every((x) => x % k !== 0),
          );
          const kinds = r.shuffle([0, 0, 1, 1]);
          const show = (v: number, i: number) => (kinds[i] === 0 ? `$${fr(v, k)}$ L` : `$${mx(v, k)}$ L`);
          const most = r.chance(0.5);
          const target = most ? Math.max(...vals) : Math.min(...vals);
          const idx = vals.indexOf(target);
          return {
            q: `네 사람이 하루 동안 마신 물의 양입니다. 물을 가장 ${most ? '많이' : '적게'} 마신 사람은 누구인가요?\n${names.map((n, i) => `${n}: ${show(vals[i], i)}`).join(', ')}`,
            answer: makeChoices(
              r,
              names[idx],
              names.filter((_, i) => i !== idx),
              4,
            ),
            steps: [
              `모두 가분수로 나타내요: ${names.map((n, i) => `${n} $${fr(vals[i], k)}$`).join(', ')}`,
              `분모가 같으면 분자가 클수록 커요. 가장 ${most ? '많이' : '적게'} 마신 사람: ${names[idx]}`,
            ],
            hint: '대분수를 가분수로 바꾸어 분자끼리 비교해요.',
          };
        }
        if (r.chance(0.5)) {
          const k = r.int(3, 9),
            w = r.int(1, 4),
            p = r.int(1, k - 1);
          return {
            q: `길이가 $${w}${fr(p, k)}$ m인 철사를 $${fr(1, k)}$ m씩 잘랐습니다. 철사는 모두 몇 도막이 되나요?`,
            answer: { type: 'num', value: w * k + p, unit: '도막' },
            steps: [`대분수를 가분수로: $${w}${fr(p, k)}=${fr(w * k + p, k)}$`, `$${fr(w * k + p, k)}$은 $${fr(1, k)}$이 $${w * k + p}$개 → $${w * k + p}$도막`],
          };
        }
        const [n1, n2] = pick2Names(r);
        const [k, a, b] = until(
          () => [r.int(3, 8), r.int(2, 9), r.int(2, 9)],
          ([k, a, b]) => a + b > k && (a + b) % k !== 0 && gcd((a + b) % k, k) === 1,
        );
        return {
          q: `들이가 $${fr(1, k)}$ L인 컵으로 ${n1}는 우유를 $${a}$컵, ${n2}는 $${b}$컵 마셨습니다. 두 사람이 마신 우유는 모두 몇 L인지 대분수로 나타내세요.`,
          answer: {
            type: 'num',
            value: (a + b) / k,
            unit: 'L',
            display: 'mixed',
          },
          steps: [`마신 컵 수: $${a}+${b}=${a + b}$(컵)`, `$${fr(1, k)}$이 $${a + b}$개 → $${fr(a + b, k)}$ L`, `$${fr(a + b, k)}=${mx(a + b, k)}$ (L)`],
        };
      },
    },
  ],

  // ═════════════ e3b-5 들이와 무게 ═════════════
  'e3b-5': [
    {
      id: 'word-two',
      title: '들이·무게 두 단계 문장제',
      gen(r, level) {
        const name = pickName(r);
        if (level === 1) {
          const [a, b] = until(
            () => [r.int(1, 4) * 1000 + r.int(10, 95) * 10, r.int(15, 95) * 10],
            ([a, b]) => (a + b) % 1000 !== 0,
          );
          const it = r.pick(['물통', '도시락', '필통', '책 한 권']);
          const s = a + b;
          return {
            q: `${nm(name)}의 책가방 무게는 ${kgg(a)}입니다. 여기에 무게가 $${b}$ g인 ${J(it, '을/를')} 넣으면 책가방의 무게는 몇 kg 몇 g이 되나요?`,
            answer: {
              type: 'fields',
              fields: [
                { label: 'kg', value: Math.floor(s / 1000) },
                { label: 'g', value: s % 1000 },
              ],
            },
            steps: [`g끼리: $${a % 1000}+${b}=${(a % 1000) + b}$${(a % 1000) + b >= 1000 ? ' → $1000$ g을 $1$ kg으로 받아올림' : ''}`, `답: ${kgg(s)}`],
          };
        }
        if (level === 2) {
          const [b, k] = until(
            () => [r.pick([150, 200, 250, 300, 350, 400, 450, 600, 700, 800]), r.int(3, 9)],
            ([b, k]) => b * k > 1000 && (b * k) % 1000 !== 0,
          );
          const pot = r.pick(['냄비', '어항', '물뿌리개', '주전자']);
          return {
            q: `들이가 $${b}$ mL인 컵으로 물을 가득 채워 $${k}$번 부었더니 빈 ${J(pot, '이/가')} 가득 찼습니다. ${pot}의 들이는 몇 L 몇 mL인가요?`,
            answer: {
              type: 'fields',
              fields: [
                { label: 'L', value: Math.floor((b * k) / 1000) },
                { label: 'mL', value: (b * k) % 1000 },
              ],
            },
            steps: [`$${b}\\times${k}=${c(b * k)}$ (mL)`, `$${c(b * k)}$ mL $=$ ${lml(b * k)}`],
          };
        }
        if (r.chance(0.5)) {
          const box = r.int(30, 90) * 10,
            book = r.int(40, 90) * 10;
          const w3 = box + 3 * book,
            w1 = box + book;
          return {
            q: `빈 상자에 무게가 같은 책 $3$권을 넣었더니 무게가 ${kgg(w3)}이었습니다. 이 상자에서 책 $2$권을 꺼냈더니 무게가 ${kgg(w1)}이 되었습니다. 빈 상자의 무게는 몇 g인가요?`,
            answer: { type: 'num', value: box, unit: 'g' },
            steps: [`책 $2$권의 무게: $${c(w3)}-${c(w1)}=${c(w3 - w1)}$ (g)`, `책 $1$권: $${c(w3 - w1)}\\div2=${book}$ (g)`, `빈 상자: $${c(w1)}-${book}=${box}$ (g)`],
            hint: '꺼낸 책 2권의 무게부터 구해요.',
          };
        }
        const [t, w, k] = until(
          () => [r.int(1, 3), r.int(12, 60), r.int(11, 40)],
          ([t, w, k]) => 1000 * t - w * k >= 50,
        );
        return {
          q: `$${t}$ t까지 실을 수 있는 트럭에 무게가 $${w}$ kg인 상자를 $${k}$개 실었습니다. 이 트럭에 더 실을 수 있는 무게는 몇 kg인가요?`,
          answer: { type: 'num', value: 1000 * t - w * k, unit: 'kg' },
          steps: [`$${t}$ t $=${c(1000 * t)}$ kg`, `실은 상자의 무게: $${w}\\times${k}=${c(w * k)}$ (kg)`, `더 실을 수 있는 무게: $${c(1000 * t)}-${c(w * k)}=${c(1000 * t - w * k)}$ (kg)`],
        };
      },
    },
  ],

  // ═════════════ e3b-6 그림그래프 ═════════════
  'e3b-6': [
    {
      id: 'graph-use',
      title: '그림그래프 활용 문장제',
      gen(r, level) {
        const { th, units, vals, name } = gData(r, level);
        const fig = picGraph(th.labels, vals, units, {
          unitName: th.unit,
          head: th.head,
        });
        const ks = th.resUnit === '원' ? (level === 1 ? [10, 20, 30, 50] : [10, 20]) : th.resUnit === 'L' ? [2, 3, 4, 5] : level === 1 ? [12, 15, 20, 24, 25, 30] : [12, 15, 20];
        const k = r.pick(ks);
        const intro = `${th.head}별 ${J(th.thing, '을/를')} 조사하여 나타낸 그림그래프입니다.`;
        if (level <= 2) {
          const i = r.int(0, 3);
          return {
            q: `${intro} ${th.per(k)}, ${th.ask(name(i))}`,
            fig,
            answer: { type: 'num', value: vals[i] * k, unit: th.resUnit },
            steps: [`그래프에서 ${name(i)}: $${vals[i]}$${th.unit}`, `$${vals[i]}\\times${k}=${c(vals[i] * k)}$ (${th.resUnit})`],
          };
        }
        const mi = vals.indexOf(Math.max(...vals)),
          li = vals.indexOf(Math.min(...vals));
        const d = vals[mi] - vals[li];
        return {
          q: `${intro} ${th.per(k)}, ${th.diff}`,
          fig,
          answer: { type: 'num', value: d * k, unit: th.resUnit },
          steps: [
            `가장 많은 곳: ${name(mi)} $${vals[mi]}$${th.unit}, 가장 적은 곳: ${name(li)} $${vals[li]}$${th.unit}`,
            `차이: $${vals[mi]}-${vals[li]}=${d}$(${th.unit})`,
            `$${d}\\times${k}=${c(d * k)}$ (${th.resUnit})`,
          ],
          hint: '먼저 그래프에서 차이를 구한 뒤 곱해요.',
        };
      },
    },
    {
      id: 'graph-condition',
      title: '조건으로 그림그래프 완성하기',
      gen(r, level) {
        const { th, units, vals, name } = gData(r, level);
        const intro = `${th.head}별 ${J(th.thing, '을/를')} 조사하여 나타낸 그림그래프인데`;
        if (level <= 2) {
          let h = 0,
            j = 1,
            cond = '',
            how = '';
          const twice = level === 2 && r.chance(0.6);
          if (twice) {
            const small = until(
              () => r.int(11, 24) * 10,
              (x) => !vals.includes(x) && !vals.includes(2 * x),
            );
            [h, j] = r.sample([0, 1, 2, 3], 2);
            vals[j] = small;
            vals[h] = 2 * small;
            cond = `${J(name(h), '은/는')} ${name(j)}의 $2$배입니다.`;
            how = `$${small}\\times2=${2 * small}$`;
          } else {
            [h, j] = r.sample([0, 1, 2, 3], 2);
            const d = vals[h] - vals[j];
            cond = `${J(name(h), '은/는')} ${name(j)}보다 $${Math.abs(d)}$${th.unit} ${d > 0 ? '더 많습니다' : '더 적습니다'}.`;
            how = `$${vals[j]}${d > 0 ? '+' : '-'}${Math.abs(d)}=${vals[h]}$`;
          }
          const shown = vals.map((v, i) => (i === h ? 0 : v));
          return {
            q: `${intro} ${name(h)}의 그림이 지워졌습니다. ${cond} ${J(th.of(name(h)), '은/는')} 몇 ${th.unit}인가요?`,
            fig: picGraph(th.labels, shown, units, {
              unitName: th.unit,
              head: th.head,
            }),
            answer: { type: 'num', value: vals[h], unit: th.unit },
            steps: [`그래프에서 ${name(j)}: $${vals[j]}$${th.unit}`, `${name(h)}: ${how}(${th.unit})`],
          };
        }
        const [h1, h2] = r.sample([0, 1, 2, 3], 2);
        if (vals[h1] < vals[h2]) [vals[h1], vals[h2]] = [vals[h2], vals[h1]];
        const tot = vals.reduce((a, b) => a + b, 0);
        const d = vals[h1] - vals[h2];
        const two = vals[h1] + vals[h2];
        const shown = vals.map((v, i) => (i === h1 || i === h2 ? 0 : v));
        const ask = r.chance(0.5) ? h1 : h2;
        return {
          q: `${intro} ${J(name(h1), '와/과')} ${name(h2)}의 그림이 지워졌습니다. ${J(th.of(`네 ${th.head}`), '은/는')} 모두 $${c(tot)}$${th.unit}이고, ${J(name(h1), '은/는')} ${name(h2)}보다 $${d}$${th.unit} 더 많습니다. ${J(th.of(name(ask)), '은/는')} 몇 ${th.unit}인가요?`,
          fig: picGraph(th.labels, shown, units, {
            unitName: th.unit,
            head: th.head,
          }),
          answer: { type: 'num', value: vals[ask], unit: th.unit },
          steps: [
            `두 곳의 합: $${c(tot)}-${vals.filter((_, i) => i !== h1 && i !== h2).join('-')}=${two}$`,
            `${name(h2)}: $(${two}-${d})\\div2=${vals[h2]}$, ${name(h1)}: $${vals[h2]}+${d}=${vals[h1]}$`,
            `답: $${vals[ask]}$${th.unit}`,
          ],
          hint: '먼저 지워진 두 곳의 합을 구해요. 합에서 차를 빼면 작은 쪽의 2배예요.',
        };
      },
    },
  ],
};
