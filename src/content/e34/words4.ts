// 초4 (e4a, e4b) 문장제 유형 추가분 — e34.ts 에서 각 단원 skills 뒤에 붙임
import type { Skill } from '../../core/types';
import type { Rng } from '../../core/rng';
import { Svg, barChart, lineChart } from '../../core/fig';
import { makeChoices } from '../../core/tex';
import { gcd } from '../../core/nt';
import { J, c, d as dd, fr, josa, mx, nm, pick2Names, pickName } from './util';
/** '…이었습니다/였습니다' (숫자 받침에 맞게) */
const was = (n: number) => (josa(n, '이/가') === '이' ? '이었' : '였');

function until<T>(gen: () => T, ok: (x: T) => boolean, tries = 500): T {
  let x = gen();
  for (let i = 0; i < tries && !ok(x); i++) x = gen();
  return x;
}
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
const ORD = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째', '열째', '열한째', '열두째', '열셋째', '열넷째', '열다섯째'];
/** 천분의 일 단위 정수 → 소수 TeX */
const D = (milli: number) => dd(milli / 1000);
/** 분자가 분모와 서로소이거나 자연수 (약분이 필요 없는 결과만) */
const fracOk = (n: number, den: number) => n > 0 && (n % den === 0 || gcd(n % den, den) === 1);
const fx = (n: number, den: number) => (n >= den ? mx(n, den) : fr(n, den));
const POLY: Record<number, string> = {
  3: '삼각형',
  4: '사각형',
  5: '오각형',
  6: '육각형',
  7: '칠각형',
  8: '팔각형',
  9: '구각형',
  10: '십각형',
  12: '십이각형',
};

// ───────── 막대그래프 자료 ─────────
const BAR_W = [
  {
    title: '반별 모은 헌 종이의 무게',
    cats: ['1반', '2반', '3반', '4반', '5반'],
    unit: 'kg',
    u: ' kg',
    what: '헌 종이의 무게',
    of: (x: string) => `${J(x, '이/가')} 모은 헌 종이의 무게는`,
    per: (k: number) => `헌 종이 $1$ kg을 $${k}$원에 판다고 할 때`,
    ask: (x: string) => `${J(x, '이/가')} 모은 헌 종이를 팔면 얼마를 받을 수 있나요?`,
    all: '다섯 반이 모은 헌 종이를 모두 팔면 얼마를 받을 수 있나요?',
    top: '헌 종이를 가장 많이 모은 반은 헌 종이를 팔아 얼마를 받을 수 있나요?',
    ks: [100, 150, 200, 250],
    resUnit: '원',
  },
  {
    title: '요일별 도서관 방문자 수',
    cats: ['월', '화', '수', '목', '금'],
    unit: '명',
    u: '명',
    what: '방문자 수',
    of: (x: string) => `${x}의 방문자 수는`,
    per: (k: number) => `방문자 한 명에게 책갈피를 $${k}$개씩 나누어 주었다면`,
    ask: (x: string) => `${x}요일에 나누어 준 책갈피는 몇 개인가요?`,
    all: '5일 동안 나누어 준 책갈피는 모두 몇 개인가요?',
    top: '방문자가 가장 많은 요일에 나누어 준 책갈피는 몇 개인가요?',
    ks: [2, 3, 4, 5],
    resUnit: '개',
  },
  {
    title: '마을별 기르는 소의 수',
    cats: ['가', '나', '다', '라', '마'],
    unit: '마리',
    u: '마리',
    what: '소의 수',
    of: (x: string) => `${x}에서 기르는 소는`,
    per: (k: number) => `소 한 마리가 하루에 사료를 $${k}$ kg씩 먹는다면`,
    ask: (x: string) => `${x} 마을의 소가 하루에 먹는 사료는 모두 몇 kg인가요?`,
    all: '다섯 마을의 소가 하루에 먹는 사료는 모두 몇 kg인가요?',
    top: '소를 가장 많이 기르는 마을의 소가 하루에 먹는 사료는 모두 몇 kg인가요?',
    ks: [6, 7, 8, 9, 12, 15],
    resUnit: 'kg',
  },
  {
    title: '반별 학생들이 읽은 책의 수',
    cats: ['1반', '2반', '3반', '4반', '5반'],
    unit: '권',
    u: '권',
    what: '읽은 책의 수',
    of: (x: string) => `${J(x, '이/가')} 읽은 책은`,
    per: (k: number) => `책을 한 권 읽을 때마다 칭찬 붙임딱지를 $${k}$장씩 준다면`,
    ask: (x: string) => `${x} 학생들이 받는 칭찬 붙임딱지는 모두 몇 장인가요?`,
    all: '다섯 반 학생들이 받는 칭찬 붙임딱지는 모두 몇 장인가요?',
    top: '책을 가장 많이 읽은 반 학생들이 받는 칭찬 붙임딱지는 모두 몇 장인가요?',
    ks: [2, 3, 4, 5],
    resUnit: '장',
  },
];
function bars(r: Rng, level: number, n: number) {
  const step = level === 1 ? 1 : level === 2 ? 2 : 5;
  const vals = until(
    () => Array.from({ length: n }, () => r.int(2, 12) * step),
    (v) => new Set(v).size === n,
  );
  const max = Math.ceil(Math.max(...vals) / step) * step + 2 * step;
  return { step, vals, max };
}

// ───────── 꺾은선그래프 자료 ─────────
const LINE_UP = [
  {
    title: '강낭콩 싹의 키',
    lab: (i: number) => `${i + 1}일`,
    unit: 'cm',
    what: '싹의 키',
    start: [2, 6],
    d: [1, 3],
    tick: 1,
  },
  {
    title: '저금통에 모인 돈',
    lab: (i: number) => `${i + 3}월`,
    unit: '원',
    what: '모인 돈',
    start: [2, 6],
    d: [1, 3],
    tick: 500,
  },
];

export const WORDS4: Record<string, Skill[]> = {
  // ═════════════ e4a-1 큰 수 ═════════════
  'e4a-1': [
    {
      id: 'save-skip',
      title: '뛰어 세기 문장제 (저금·생산량)',
      gen(r, level) {
        const [n1, n2] = pick2Names(r);
        if (level === 1) {
          const a = r.int(12, 48) * 10,
            b = r.pick([10, 20, 30, 50]),
            k = r.int(3, 6);
          const seq = Array.from({ length: k + 1 }, (_, i) => a + b * i);
          return {
            q: `${nm(n1)}네 가족은 여행을 가려고 저금을 하고 있습니다. 지금 통장에 $${a}$만 원이 있고, 다음 달부터 매달 $${b}$만 원씩 저금한다면 $${k}$달 후 통장에 있는 돈은 몇만 원인가요?`,
            answer: { type: 'num', value: a + b * k, unit: '만 원' },
            steps: [`$${b}$만씩 $${k}$번 뛰어 세어요.`, seq.map((x) => `$${x}$만`).join(' → '), `답: $${a + b * k}$만 원`],
          };
        }
        if (level === 2) {
          if (r.chance(0.5)) {
            const b = r.pick([10, 20, 25, 50]),
              k = r.int(3, 6);
            const a = until(
              () => r.int(30, 95) * 10,
              (x) => x - b * k >= 50,
            );
            const seq = Array.from({ length: k + 1 }, (_, i) => a - b * i);
            return {
              q: `어느 공장에서 올해 장난감을 $${a}$만 개 만들었습니다. 이 공장은 해마다 장난감을 $${b}$만 개씩 더 많이 만들어 왔습니다. $${k}$년 전에는 장난감을 몇만 개 만들었나요?`,
              answer: { type: 'num', value: a - b * k, unit: '만 개' },
              steps: [`거꾸로 $${b}$만씩 $${k}$번 뛰어 세어요.`, seq.map((x) => `$${x}$만`).join(' → '), `답: $${a - b * k}$만 개`],
            };
          }
          const b = r.pick([100, 200, 500, 1000]),
            k = r.int(3, 5);
          const a = until(
            () => r.int(15, 80) * 100,
            (x) => x + b * k < 10000,
          );
          const seq = Array.from({ length: k + 1 }, (_, i) => a + b * i);
          return {
            q: `어느 회사의 올해 수출액은 $${c(a)}$억 원입니다. 수출액이 해마다 $${b}$억 원씩 늘어난다면 $${k}$년 후의 수출액은 몇억 원인가요?`,
            answer: { type: 'num', value: a + b * k, unit: '억 원' },
            steps: [`$${b}$억씩 $${k}$번 뛰어 세어요.`, seq.map((x) => `$${c(x)}$억`).join(' → '), `답: $${c(a + b * k)}$억 원`],
          };
        }
        if (r.chance(0.5)) {
          const b = r.int(3, 9) * 1000,
            dlt = r.int(1, 3) * 1000,
            m = r.int(3, 8);
          const cc = r.int(5, 30) * 1000;
          const a = cc + dlt * m;
          return {
            q: `저금통에 ${n1}는 $${c(a)}$원, ${n2}는 $${c(cc)}$원을 모아 두었습니다. 다음 달부터 ${n1}는 매달 $${c(b)}$원씩, ${n2}는 매달 $${c(b + dlt)}$원씩 저금한다면 몇 달 후에 두 사람이 모은 돈이 같아지나요?`,
            answer: { type: 'num', value: m, unit: '달' },
            steps: [
              `지금 두 사람의 차: $${c(a)}-${c(cc)}=${c(a - cc)}$(원)`,
              `한 달에 차가 $${c(b + dlt)}-${c(b)}=${c(dlt)}$(원)씩 줄어들어요.`,
              `$${c(dlt)}$씩 $${m}$번 줄면 $${c(a - cc)}$이 모두 줄어요 → $${m}$달 후`,
            ],
            hint: '두 사람의 돈의 차가 한 달에 얼마씩 줄어드는지 생각해요.',
          };
        }
        const name = pickName(r);
        const [a, b, T] = until(
          () => [r.int(10, 60) * 1000, r.int(5, 20) * 1000, r.int(12, 30) * 10000],
          ([a, b, T]) => (T - a) / b >= 4 && (T - a) / b <= 15,
        );
        const m = Math.ceil((T - a) / b);
        const it = r.pick(['자전거', '킥보드', '운동화', '책장']);
        return {
          q: `${nm(name)}는 지금 $${c(a)}$원을 모아 두었습니다. 다음 달부터 매달 $${c(b)}$원씩 저금하여 $${c(T)}$원짜리 ${J(it, '을/를')} 사려고 합니다. 몇 달 후에 처음으로 ${J(it, '을/를')} 살 수 있는 돈이 모이나요?`,
          answer: { type: 'num', value: m, unit: '달' },
          steps: [
            `더 모아야 할 돈: $${c(T)}-${c(a)}=${c(T - a)}$(원)`,
            `$${c(b)}$원씩 뛰어 세면 $${m - 1}$달 후 $${c(a + b * (m - 1))}$원, $${m}$달 후 $${c(a + b * m)}$원`,
            `처음으로 $${c(T)}$원 이상이 되는 때: $${m}$달 후`,
          ],
        };
      },
    },
    {
      id: 'bill-count',
      title: '지폐로 바꾸기·묶음 문장제',
      gen(r, level) {
        const name = pickName(r);
        if (level === 1) {
          if (r.chance(0.5)) {
            const k = r.int(12, 98) * 10;
            return {
              q: `은행에서 $${c(k * 1000)}$원을 모두 천 원짜리 지폐로 찾으려고 합니다. 천 원짜리 지폐는 몇 장 필요한가요?`,
              answer: { type: 'num', value: k, unit: '장' },
              steps: [`$1000$이 몇 개인지 세어요.`, `$${c(k * 1000)}$은 $1000$이 $${k}$개 → $${k}$장`],
            };
          }
          const k = r.int(25, 300);
          return {
            q: `${nm(name)}네 가족은 $${c(k * 10000)}$원을 모두 만 원짜리 지폐로 찾았습니다. 만 원짜리 지폐는 몇 장인가요?`,
            answer: { type: 'num', value: k, unit: '장' },
            steps: [`$${c(k * 10000)}$은 $10000$이 $${k}$개`, `만 원짜리 지폐 $${k}$장`],
          };
        }
        if (level === 2) {
          const N = until(
            () => r.int(12000, 98000),
            (x) => x % 100 !== 0,
          );
          if (r.chance(0.5))
            return {
              q: `공장에서 만든 연필 $${c(N)}$자루를 한 상자에 $100$자루씩 담아 팔려고 합니다. 연필을 최대 몇 상자까지 팔 수 있나요?`,
              answer: { type: 'num', value: Math.floor(N / 100), unit: '상자' },
              steps: [
                `$${c(N)}$에서 $100$이 몇 개인지 알아봐요: 백의 자리까지의 수는 $${c(Math.floor(N / 100))}$`,
                `남는 $${N % 100}$자루로는 한 상자를 채울 수 없으므로 $${c(Math.floor(N / 100))}$상자`,
              ],
            };
          const M = until(
            () => r.int(120, 980) * 100,
            (x) => x % 1000 !== 0,
          );
          return {
            q: `${nm(name)}네 반이 바자회에서 번 돈 $${c(M)}$원을 천 원짜리 지폐로 바꾸려고 합니다. 천 원짜리 지폐로 최대 몇 장까지 바꿀 수 있나요?`,
            answer: { type: 'num', value: Math.floor(M / 1000), unit: '장' },
            steps: [`$${c(M)}$에서 $1000$이 몇 개인지 알아봐요: 천의 자리까지의 수는 $${Math.floor(M / 1000)}$`, `남는 $${M % 1000}$원은 바꿀 수 없으므로 $${Math.floor(M / 1000)}$장`],
          };
        }
        const a = r.int(2, 9),
          b = r.int(12, 45),
          cc = r.int(15, 60);
        const tot = a * 10000 + b * 1000 + cc * 100;
        return {
          q: `${nm(name)}의 저금통에 만 원짜리 지폐 $${a}$장, 천 원짜리 지폐 $${b}$장, 백 원짜리 동전 $${cc}$개가 들어 있습니다. 이 돈을 만 원짜리 지폐로 바꾸면 최대 몇 장까지 바꿀 수 있나요?`,
          answer: { type: 'num', value: Math.floor(tot / 10000), unit: '장' },
          steps: [
            `모두: $${c(a * 10000)}+${c(b * 1000)}+${c(cc * 100)}=${c(tot)}$(원)`,
            `$${c(tot)}$에서 $10000$이 $${Math.floor(tot / 10000)}$개`,
            `만 원짜리 지폐 최대 $${Math.floor(tot / 10000)}$장`,
          ],
          hint: '먼저 모두 얼마인지 구해요.',
        };
      },
    },
  ],

  // ═════════════ e4a-2 각도 ═════════════
  'e4a-2': [
    {
      id: 'angle-life',
      title: '생활 속 각도 문장제',
      gen(r, level) {
        const name = pickName(r);
        if (level === 1) {
          if (r.chance(0.5)) {
            const [a, b] = until(
              () => [r.int(6, 20) * 5, r.int(4, 16) * 5],
              ([a, b]) => a + b < 180,
            );
            return {
              q: `${nm(name)}는 부채를 $${a}^{\\circ}$만큼 펼쳤다가 $${b}^{\\circ}$만큼 더 펼쳤습니다. 지금 부채가 펼쳐진 각도는 몇 도인가요?`,
              answer: { type: 'num', value: a + b, unit: '°' },
              steps: [`각도의 합: $${a}^{\\circ}+${b}^{\\circ}=${a + b}^{\\circ}$`],
            };
          }
          const k = r.pick([3, 4, 5, 6, 8, 9, 10, 12]);
          const food = r.pick(['피자', '케이크', '파이']);
          return {
            q: `원 모양 ${J(food, '을/를')} 중심에서 크기가 같게 $${k}$조각으로 잘랐습니다. 한 조각에서 원의 중심에 있는 각은 몇 도인가요?`,
            answer: { type: 'num', value: 360 / k, unit: '°' },
            steps: [`원의 중심을 한 바퀴 도는 각은 $360^{\\circ}$`, `$360^{\\circ}\\div${k}=${360 / k}^{\\circ}$`],
          };
        }
        if (level === 2) {
          if (r.chance(0.6)) {
            const m = r.int(1, 11) * 5;
            return {
              q: `시계의 긴바늘이 $${m}$분 동안 움직인 각도는 몇 도인가요?`,
              answer: { type: 'num', value: 6 * m, unit: '°' },
              steps: [`긴바늘은 $60$분에 한 바퀴($360^{\\circ}$) 돌아요. 숫자 한 칸($5$분)은 $30^{\\circ}$`, `$${m}$분은 $${m / 5}$칸 → $30^{\\circ}\\times${m / 5}=${6 * m}^{\\circ}$`],
            };
          }
          const h1 = r.int(1, 6),
            h = r.int(1, 5);
          return {
            q: `${nm(name)}는 $${h1}$시 정각부터 $${h1 + h}$시 정각까지 책을 읽었습니다. 그동안 시계의 짧은바늘이 움직인 각도는 몇 도인가요?`,
            answer: { type: 'num', value: 30 * h, unit: '°' },
            steps: [`짧은바늘은 $1$시간에 숫자 한 칸, $360^{\\circ}\\div12=30^{\\circ}$ 움직여요.`, `$${h}$시간: $30^{\\circ}\\times${h}=${30 * h}^{\\circ}$`],
          };
        }
        if (r.chance(0.5)) {
          const k = r.pick([5, 6, 8, 9, 10, 12]);
          const e = r.int(2, k - 2);
          const food = r.pick(['피자', '케이크']);
          return {
            q: `원 모양 ${J(food, '을/를')} 중심에서 크기가 같게 $${k}$조각으로 자른 뒤 $${e}$조각을 먹었습니다. 남은 조각들에서 원의 중심에 있는 각의 크기를 모두 더하면 몇 도인가요?`,
            answer: { type: 'num', value: (360 / k) * (k - e), unit: '°' },
            steps: [`한 조각의 각: $360^{\\circ}\\div${k}=${360 / k}^{\\circ}$`, `남은 조각: $${k}-${e}=${k - e}$(조각)`, `$${360 / k}^{\\circ}\\times${k - e}=${(360 / k) * (k - e)}^{\\circ}$`],
          };
        }
        const [a, b, cc] = until(
          () => [r.int(8, 24) * 5, r.int(2, 10) * 5, r.int(2, 14) * 5],
          ([a, b, cc]) => a - b > 10 && a - b + cc < 180,
        );
        return {
          q: `${nm(name)}는 가위의 두 날을 $${a}^{\\circ}$만큼 벌렸다가 $${b}^{\\circ}$만큼 오므린 뒤, 다시 $${cc}^{\\circ}$만큼 더 벌렸습니다. 지금 가위의 두 날이 벌어진 각도는 몇 도인가요?`,
          answer: { type: 'num', value: a - b + cc, unit: '°' },
          steps: [`오므린 뒤: $${a}^{\\circ}-${b}^{\\circ}=${a - b}^{\\circ}$`, `다시 벌린 뒤: $${a - b}^{\\circ}+${cc}^{\\circ}=${a - b + cc}^{\\circ}$`],
        };
      },
    },
    {
      id: 'angle-find',
      title: '각도 문장제 (직선·삼각형·사각형)',
      gen(r, level) {
        if (level === 1) {
          const a = r.int(5, 14) * 5;
          const s = new Svg(260, 130);
          const px = 150,
            py = 105;
          s.line(20, py, 245, py, { width: 2 });
          const rad = (a * Math.PI) / 180;
          s.line(px, py, px - 110 * Math.cos(rad), py - 110 * Math.sin(rad), {
            cls: 'acc',
            width: 3,
          });
          s.arc(px, py, 20, 180 - a, 180, { cls: 'acc2' });
          s.arc(px, py, 14, 0, 180 - a, { cls: 'acc2' });
          s.text(px - 40 * Math.cos(rad / 2), py - 40 * Math.sin(rad / 2) + 2, `${a}°`, { size: 12 });
          s.text(px + 24, py - 22, '?', { size: 14 });
          const obj = r.pick(['미끄럼틀의 판', '사다리', '시소의 판']);
          return {
            q: `곧은 바닥 위에 ${J(obj, '이/가')} 비스듬히 놓여 있습니다. ${J(obj, '와/과')} 바닥이 이루는 한쪽 각이 $${a}^{\\circ}$일 때, 그림의 ? 의 각도는 몇 도인가요?`,
            fig: s.toString(),
            answer: { type: 'num', value: 180 - a, unit: '°' },
            steps: [`곧은 바닥(직선)이 이루는 각은 $180^{\\circ}$`, `? $=180^{\\circ}-${a}^{\\circ}=${180 - a}^{\\circ}$`],
          };
        }
        if (level === 2) {
          const [a, b] = until(
            () => [r.int(6, 24) * 5, r.int(6, 24) * 5],
            ([a, b]) => a + b < 170 && a !== b,
          );
          const obj = r.pick(['삼각형 모양 깃발', '삼각형 모양 표지판', '삼각김밥 모양 지우개', '삼각형 모양 조각 케이크']);
          return {
            q: `${obj}의 세 각 중 두 각의 크기가 $${a}^{\\circ}$, $${b}^{\\circ}$입니다. 나머지 한 각의 크기는 몇 도인가요?`,
            answer: { type: 'num', value: 180 - a - b, unit: '°' },
            steps: [`삼각형의 세 각의 크기의 합은 $180^{\\circ}$`, `$180^{\\circ}-${a}^{\\circ}-${b}^{\\circ}=${180 - a - b}^{\\circ}$`],
          };
        }
        if (r.chance(0.5)) {
          const [a, b] = until(
            () => [r.int(10, 30) * 5, r.int(10, 30) * 5],
            ([a, b]) => a !== b && 360 - a - b > 60 && 360 - a - b < 320 && (360 - a - b) % 2 === 0 && (360 - a - b) / 2 < 180,
          );
          const x = (360 - a - b) / 2;
          return {
            q: `사각형 모양 연의 네 각 중 두 각의 크기는 $${a}^{\\circ}$, $${b}^{\\circ}$이고, 나머지 두 각의 크기는 서로 같습니다. 크기가 같은 두 각 중 한 각은 몇 도인가요?`,
            answer: { type: 'num', value: x, unit: '°' },
            steps: [
              `사각형의 네 각의 크기의 합은 $360^{\\circ}$`,
              `나머지 두 각의 합: $360^{\\circ}-${a}^{\\circ}-${b}^{\\circ}=${360 - a - b}^{\\circ}$`,
              `한 각: $${360 - a - b}^{\\circ}\\div2=${x}^{\\circ}$`,
            ],
          };
        }
        const [a, b, dlt] = until(
          () => [r.int(12, 24) * 5, r.int(12, 24) * 5, r.int(1, 6) * 5],
          ([a, b, dlt]) => {
            const x = 360 - a - b - (a + dlt);
            return x > 30 && x < 175 && a !== b;
          },
        );
        const x = 360 - a - b - (a + dlt);
        return {
          q: `사각형 ㄱㄴㄷㄹ에서 각 ㄱ은 $${a}^{\\circ}$, 각 ㄴ은 $${b}^{\\circ}$이고, 각 ㄷ은 각 ㄱ보다 $${dlt}^{\\circ}$ 더 큽니다. 각 ㄹ은 몇 도인가요?`,
          answer: { type: 'num', value: x, unit: '°' },
          steps: [
            `각 ㄷ: $${a}^{\\circ}+${dlt}^{\\circ}=${a + dlt}^{\\circ}$`,
            `사각형의 네 각의 합은 $360^{\\circ}$`,
            `각 ㄹ: $360^{\\circ}-${a}^{\\circ}-${b}^{\\circ}-${a + dlt}^{\\circ}=${x}^{\\circ}$`,
          ],
        };
      },
    },
  ],

  // ═════════════ e4a-3 곱셈과 나눗셈 ═════════════
  'e4a-3': [
    {
      id: 'word-two',
      title: '어떤 수·두 단계 문장제',
      gen(r, level) {
        if (level === 1) {
          const [b, q, rem] = until(
            () => [r.int(12, 39), r.int(5, 29), r.int(1, 38)],
            ([b, q, rem]) => rem < b && b * q + rem <= 999 && b * q + rem >= 100,
          );
          const x = b * q + rem;
          if (r.chance(0.5))
            return {
              q: `구슬을 한 봉지에 $${b}$개씩 담았더니 $${q}$봉지가 되고 $${rem}$개가 남았습니다. 구슬은 모두 몇 개인가요?`,
              answer: { type: 'num', value: x, unit: '개' },
              steps: [`봉지에 담은 구슬: $${b}\\times${q}=${b * q}$(개)`, `모두: $${b * q}+${rem}=${x}$(개)`],
            };
          return {
            q: `어떤 수를 $${b}$로 나누었더니 몫이 $${q}$이고 나머지가 $${rem}$이었습니다. 어떤 수는 얼마인가요?`,
            answer: { type: 'num', value: x },
            steps: [`(나누는 수)$\\times$(몫)$+$(나머지)$=$(어떤 수)`, `$${b}\\times${q}+${rem}=${x}$`],
          };
        }
        if (level === 2) {
          const [b, x] = until(
            () => [r.int(12, 45), r.int(150, 999)],
            ([b, x]) => x % b !== 0 && x / b >= 5,
          );
          return {
            q: `어떤 수에 $${b}$를 곱해야 할 것을 잘못하여 $${b}$로 나누었더니 몫이 $${Math.floor(x / b)}$이고 나머지가 $${x % b}$${was(x % b)}습니다. 바르게 계산하면 얼마인가요?`,
            answer: { type: 'num', value: x * b },
            steps: [`어떤 수: $${b}\\times${Math.floor(x / b)}+${x % b}=${x}$`, `바르게 계산: $${x}\\times${b}=${c(x * b)}$`],
            hint: '먼저 검산식으로 어떤 수를 구해요.',
          };
        }
        const [a, b, k] = until(
          () => [r.int(12, 30), r.int(12, 30), r.int(13, 35)],
          ([a, b, k]) => (a * b) % k !== 0 && (a * b) / k >= 8,
        );
        const tot = a * b;
        const it = r.pick([
          { w: '초콜릿', u: '개' },
          { w: '사탕', u: '개' },
          { w: '색연필', u: '자루' },
        ]);
        if (r.chance(0.5))
          return {
            q: `한 상자에 ${J(it.w, '이/가')} $${a}$${it.u}씩 들어 있는 상자가 $${b}$상자 있습니다. 이 ${J(it.w, '을/를')} $${k}$명에게 똑같이 나누어 주면 한 명에게 몇 ${it.u}씩 줄 수 있고, 몇 ${it.u}가 남나요?`,
            answer: {
              type: 'fields',
              fields: [
                { label: '한 명에게', value: Math.floor(tot / k), unit: it.u },
                { label: '남는 것', value: tot % k, unit: it.u },
              ],
            },
            steps: [`전체: $${a}\\times${b}=${tot}$(${it.u})`, `$${tot}\\div${k}=${Math.floor(tot / k)}\\cdots${tot % k}$`, `한 명에게 $${Math.floor(tot / k)}$${it.u}씩, $${tot % k}$${it.u} 남아요.`],
          };
        return {
          q: `한 상자에 ${J(it.w, '이/가')} $${a}$${it.u}씩 들어 있는 상자가 $${b}$상자 있습니다. 이 ${J(it.w, '을/를')} $${k}$명에게 남김없이 똑같이 나누어 주려면 ${J(it.w, '은/는')} 적어도 몇 ${it.u} 더 있어야 하나요?`,
          answer: { type: 'num', value: k - (tot % k), unit: it.u },
          steps: [
            `전체: $${a}\\times${b}=${tot}$(${it.u})`,
            `$${tot}\\div${k}=${Math.floor(tot / k)}\\cdots${tot % k}$`,
            `한 명에게 하나씩 더 주려면 $${k}-${tot % k}=${k - (tot % k)}$${J(it.u, '이/가')} 더 있어야 해요.`,
          ],
        };
      },
    },
  ],

  // ═════════════ e4a-5 막대그래프 ═════════════
  'e4a-5': [
    {
      id: 'bar-use',
      title: '막대그래프 활용 문장제',
      gen(r, level) {
        const th = r.pick(BAR_W);
        const n = level === 1 ? 4 : 5;
        const cats = th.cats.slice(0, n);
        const { step, vals, max } = bars(r, level, n);
        const k = r.pick(th.ks);
        const fig = barChart(cats, vals, { unit: th.unit, max, step });
        const intro = `${J(th.title, '을/를')} 나타낸 막대그래프입니다.`;
        if (level === 1) {
          const i = r.int(0, n - 1);
          return {
            q: `${intro} ${th.per(k)}, ${th.ask(cats[i])}`,
            fig,
            answer: { type: 'num', value: vals[i] * k, unit: th.resUnit },
            steps: [`그래프에서 ${cats[i]}: $${vals[i]}$${th.u} (눈금 한 칸 $${step}$${th.u})`, `$${vals[i]}\\times${k}=${c(vals[i] * k)}$ (${th.resUnit})`],
          };
        }
        if (level === 2) {
          const mi = vals.indexOf(Math.max(...vals));
          return {
            q: `${intro} ${th.per(k)}, ${th.top}`,
            fig,
            answer: { type: 'num', value: vals[mi] * k, unit: th.resUnit },
            steps: [`막대가 가장 긴 것: ${cats[mi]} $${vals[mi]}$${th.u}`, `$${vals[mi]}\\times${k}=${c(vals[mi] * k)}$ (${th.resUnit})`],
          };
        }
        const tot = sum(vals);
        return {
          q: `${intro} ${th.per(k)}, ${th.all}`,
          fig,
          answer: { type: 'num', value: tot * k, unit: th.resUnit },
          steps: [`전체: $${vals.join('+')}=${tot}$(${th.unit})`, `$${tot}\\times${k}=${c(tot * k)}$ (${th.resUnit})`],
          hint: '먼저 그래프의 값을 모두 더해요.',
        };
      },
    },
    {
      id: 'bar-condition',
      title: '조건으로 지워진 막대 구하기',
      gen(r, level) {
        const th = r.pick(BAR_W);
        const n = level === 1 ? 4 : 5;
        const cats = th.cats.slice(0, n);
        const { step, vals, max: max0 } = bars(r, level, n);
        const label = (i: number) => (th.unit === '명' ? `${cats[i]}요일` : th.cats[0] === '가' ? `${cats[i]} 마을` : cats[i]);
        const intro = `${J(th.title, '을/를')} 조사하여 나타낸 막대그래프인데`;
        if (level <= 2) {
          const [h, j] = r.sample(
            cats.map((_, i) => i),
            2,
          );
          let cond = '',
            how = '';
          if (level === 2 && vals[j] * 2 <= 14 * step && !vals.includes(vals[j] * 2)) {
            vals[h] = vals[j] * 2;
            cond = `${J(label(h), '은/는')} ${label(j)}의 $2$배입니다.`;
            how = `$${vals[j]}\\times2=${vals[h]}$`;
          } else {
            const dlt = vals[h] - vals[j];
            cond = `${J(label(h), '은/는')} ${label(j)}보다 $${Math.abs(dlt)}$${th.u} ${dlt > 0 ? '더 많습니다' : '더 적습니다'}.`;
            how = `$${vals[j]}${dlt > 0 ? '+' : '-'}${Math.abs(dlt)}=${vals[h]}$`;
          }
          const max = Math.max(max0, Math.ceil(Math.max(...vals) / step) * step + step);
          const shown = vals.map((v, i) => (i === h ? 0 : v));
          return {
            q: `${intro} ${label(h)}의 막대가 지워졌습니다. ${cond} ${th.of(label(h))} 몇 ${th.unit}인가요?`,
            fig: barChart(cats, shown, { unit: th.unit, max, step }),
            answer: { type: 'num', value: vals[h], unit: th.unit },
            steps: [`그래프에서 ${label(j)}: $${vals[j]}$${th.u}`, `${label(h)}: ${how}(${th.unit})`],
          };
        }
        const [h1, h2] = r.sample(
          cats.map((_, i) => i),
          2,
        );
        if (vals[h1] < vals[h2]) [vals[h1], vals[h2]] = [vals[h2], vals[h1]];
        const tot = sum(vals);
        const dlt = vals[h1] - vals[h2];
        const two = vals[h1] + vals[h2];
        const others = vals.filter((_, i) => i !== h1 && i !== h2);
        const shown = vals.map((v, i) => (i === h1 || i === h2 ? 0 : v));
        const ask = r.chance(0.5) ? h1 : h2;
        return {
          q: `${intro} ${J(label(h1), '와/과')} ${label(h2)}의 막대가 지워졌습니다. 전체 합계는 $${tot}$${th.u}이고, ${J(label(h1), '은/는')} ${label(h2)}보다 $${dlt}$${th.u} 더 많습니다. ${th.of(label(ask))} 몇 ${th.unit}인가요?`,
          fig: barChart(cats, shown, { unit: th.unit, max: max0, step }),
          answer: { type: 'num', value: vals[ask], unit: th.unit },
          steps: [
            `지워진 두 곳의 합: $${tot}-${others.join('-')}=${two}$`,
            `${label(h2)}: $(${two}-${dlt})\\div2=${vals[h2]}$, ${label(h1)}: $${vals[h2]}+${dlt}=${vals[h1]}$`,
            `답: $${vals[ask]}$${th.u}`,
          ],
          hint: '합에서 차를 빼면 작은 쪽의 2배가 돼요.',
        };
      },
    },
  ],

  // ═════════════ e4a-6 규칙 찾기 ═════════════
  'e4a-6': [
    {
      id: 'pattern-life',
      title: '생활 속 규칙 문장제',
      gen(r, level) {
        const name = pickName(r);
        if (level === 1) {
          const n = r.int(3, 5);
          const dd0 = r.int(1, n === 5 ? 2 : 7);
          const day = r.pick(['월요일', '화요일', '수요일', '목요일', '금요일', '토요일']);
          const mon = n === 5 ? r.pick([1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) : r.int(1, 12);
          return {
            q: `어느 해 ${mon}월 달력에서 첫째 ${J(day, '은/는')} ${mon}월 $${dd0}$일입니다. 이달의 ${ORD[n - 1]} ${J(day, '은/는')} ${mon}월 며칠인가요?`,
            answer: { type: 'num', value: dd0 + 7 * (n - 1), unit: '일' },
            steps: [`달력에서 같은 요일은 아래로 $7$씩 커져요.`, Array.from({ length: n }, (_, i) => `$${dd0 + 7 * i}$`).join(' → '), `${ORD[n - 1]} ${day}: $${dd0 + 7 * (n - 1)}$일`],
          };
        }
        if (level === 2) {
          if (r.chance(0.5)) {
            const a = r.int(5, 15),
              b = r.int(2, 5),
              k = r.int(5, 10);
            return {
              q: `${nm(name)}는 동화책을 첫째 날에 $${a}$쪽 읽고, 둘째 날부터는 전날보다 $${b}$쪽씩 더 많이 읽기로 했습니다. ${ORD[k - 1]} 날에는 몇 쪽을 읽게 되나요?`,
              table: [
                ['날', '첫째', '둘째', '셋째', '…'],
                ['읽은 쪽수', `$${a}$`, `$${a + b}$`, `$${a + 2 * b}$`, '…'],
              ],
              answer: { type: 'num', value: a + (k - 1) * b, unit: '쪽' },
              steps: [`하루에 $${b}$쪽씩 늘어나요.`, `${ORD[k - 1]} 날은 첫째 날보다 $${b}$쪽씩 $${k - 1}$번 늘어나요.`, `$${a}+${b}\\times${k - 1}=${a + (k - 1) * b}$(쪽)`],
            };
          }
          const h = r.int(6, 7),
            m = r.int(0, 6) * 5,
            g = r.pick([10, 12, 15, 20]),
            k = r.int(4, 6);
          const t = h * 60 + m + g * (k - 1);
          return {
            q: `어느 버스 정류장에서 첫 버스가 오전 $${h}$시 $${m}$분에 출발하고, 그 뒤로 $${g}$분 간격으로 버스가 출발합니다. ${ORD[k - 1]} 버스는 오전 몇 시 몇 분에 출발하나요?`,
            answer: {
              type: 'fields',
              fields: [
                { label: '시', value: Math.floor(t / 60) },
                { label: '분', value: t % 60 },
              ],
            },
            steps: [`$${g}$분씩 $${k - 1}$번 뛰어 세어요: $${g}\\times${k - 1}=${g * (k - 1)}$(분)`, `$${h}$시 $${m}$분에서 $${g * (k - 1)}$분 후 → $${Math.floor(t / 60)}$시 $${t % 60}$분`],
          };
        }
        const s = new Svg(260, 70);
        const u = 18;
        let x0 = 12;
        for (const k of [1, 2, 3]) {
          for (let i = 0; i < k; i++) s.rect(x0 + i * u, 14, u, u, { cls: 'acc' });
          s.text(x0 + (k * u) / 2, 50, `${4 + 3 * (k - 1)}개`, { size: 12 });
          x0 += k * u + 26;
        }
        if (r.chance(0.5)) {
          const n = r.int(8, 30);
          return {
            q: `성냥개비로 그림과 같이 정사각형을 한 줄로 이어 만들고 있습니다. 정사각형을 $${n}$개 만들려면 성냥개비는 모두 몇 개 필요한가요?`,
            fig: s.toString(),
            answer: { type: 'num', value: 3 * n + 1, unit: '개' },
            steps: [`정사각형이 $1$개 늘 때마다 성냥개비가 $3$개씩 늘어나요: $4, 7, 10, …$`, `정사각형 $${n}$개: $4+3\\times${n - 1}=${3 * n + 1}$(개)`],
            hint: '정사각형 수와 성냥개비 수를 표로 정리해 보세요.',
          };
        }
        const n = r.int(8, 30);
        return {
          q: `성냥개비로 그림과 같이 정사각형을 한 줄로 이어 만들고 있습니다. 성냥개비 $${3 * n + 1}$개를 모두 사용하면 정사각형을 몇 개 만들 수 있나요?`,
          fig: s.toString(),
          answer: { type: 'num', value: n, unit: '개' },
          steps: [`정사각형이 $1$개 늘 때마다 성냥개비가 $3$개씩 늘어나요. (정사각형 수)$\\times3+1=$(성냥개비 수)`, `$${3 * n + 1}-1=${3 * n}$, $${3 * n}\\div3=${n}$(개)`],
        };
      },
    },
    {
      id: 'number-pattern',
      title: '번호·저금 규칙 문장제',
      gen(r, level) {
        const name = pickName(r);
        if (level === 1) {
          const m = r.int(6, 10),
            row = r.int(2, 5),
            col = r.int(2, m);
          return {
            q: `사물함에 왼쪽 위부터 오른쪽으로 $1$번, $2$번, $3$번, … 처럼 차례로 번호가 붙어 있고, 한 줄에 $${m}$칸씩 있습니다. 위에서 ${ORD[row - 1]} 줄, 왼쪽에서 ${ORD[col - 1]} 칸의 번호는 몇 번인가요?`,
            answer: { type: 'num', value: (row - 1) * m + col, unit: '번' },
            steps: [
              `한 줄 아래로 내려가면 번호가 $${m}$씩 커져요.`,
              `${ORD[row - 1]} 줄 첫 칸: $1+${m}\\times${row - 1}=${(row - 1) * m + 1}$번`,
              `${ORD[col - 1]} 칸: $${(row - 1) * m + 1}+${col - 1}=${(row - 1) * m + col}$번`,
            ],
          };
        }
        if (level === 2) {
          const m = r.int(8, 15),
            row = r.int(3, 9),
            col = r.int(1, m);
          const sn = (row - 1) * m + col;
          return {
            q: `공연장 좌석에 첫째 줄은 $1$번부터 $${m}$번까지, 둘째 줄은 $${m + 1}$번부터 $${2 * m}$번까지, … 처럼 왼쪽부터 차례로 번호를 붙였습니다. $${sn}$번 좌석은 몇째 줄, 왼쪽에서 몇째 자리인가요?`,
            answer: {
              type: 'fields',
              fields: [
                { label: '줄', value: row, unit: '째 줄' },
                { label: '자리', value: col, unit: '째 자리' },
              ],
            },
            steps: [
              `한 줄에 $${m}$자리씩이에요.`,
              `$${sn}\\div${m}=${Math.floor(sn / m)}\\cdots${sn % m}$${sn % m === 0 ? ` → 나누어떨어지므로 ${ORD[row - 1]} 줄의 마지막 자리` : ` → ${Math.floor(sn / m)}줄을 채우고 다음 줄`}`,
              `${ORD[row - 1]} 줄, 왼쪽에서 ${ORD[col - 1]} 자리`,
            ],
            hint: '한 줄의 자리 수로 나누어 보세요.',
          };
        }
        const a = r.int(5, 20) * 100,
          b = r.int(1, 5) * 100,
          k = r.int(4, 6);
        const seq = Array.from({ length: k }, (_, i) => a + b * i);
        return {
          q: `${nm(name)}는 첫째 주에 $${c(a)}$원을 저금하고, 둘째 주부터는 전 주보다 $${b}$원씩 더 많이 저금하기로 했습니다. ${ORD[k - 1]} 주까지 저금한 돈은 모두 얼마인가요?`,
          answer: { type: 'num', value: sum(seq), unit: '원' },
          steps: [`주마다 저금한 돈: ${seq.map((v) => `$${c(v)}$`).join(', ')}`, `모두: $${seq.map((v) => c(v)).join('+')}=${c(sum(seq))}$(원)`],
        };
      },
    },
  ],

  // ═════════════ e4b-1 분수의 덧셈과 뺄셈 ═════════════
  'e4b-1': [
    {
      id: 'word-two',
      title: '처음 양·두 단계 분수 문장제',
      gen(r, level) {
        const name = pickName(r);
        const den = r.pick([3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
        if (level === 1) {
          const [a, b] = until(
            () => [r.int(1, den - 1), r.int(1, den - 1)],
            ([a, b]) => fracOk(a + b, den) && (a + b) % den !== 0,
          );
          return {
            q: `${nm(name)}는 리본을 $${fr(a, den)}$ m 사용했더니 $${fr(b, den)}$ m가 남았습니다. 처음에 있던 리본은 몇 m인가요?`,
            answer: {
              type: 'num',
              value: (a + b) / den,
              unit: 'm',
              display: 'mixed',
            },
            steps: [`(처음 리본) $=$ (사용한 리본) $+$ (남은 리본)`, `$${fr(a, den)}+${fr(b, den)}=${fr(a + b, den)}${a + b > den ? `=${fx(a + b, den)}` : ''}$ (m)`],
          };
        }
        if (level === 2) {
          const [w, p, q, k] = until(
            () => [r.int(2, 4), r.int(1, den - 1), r.int(1, den - 1), r.int(2, 3)],
            ([w, p, q, k]) => w * den + p - k * q > 0 && fracOk(w * den + p - k * q, den) && (w * den + p - k * q) % den !== 0,
          );
          const T = w * den + p;
          const res = T - k * q;
          return {
            q: `물통에 물이 $${w}${fr(p, den)}$ L 들어 있습니다. 하루에 $${fr(q, den)}$ L씩 $${k}$일 동안 마셨다면 남은 물은 몇 L인가요?`,
            answer: {
              type: 'num',
              value: res / den,
              unit: 'L',
              display: 'mixed',
            },
            steps: [
              `마신 물: $${Array.from({ length: k }, () => fr(q, den)).join('+')}=${fx(k * q, den)}$ (L)`,
              `남은 물: $${w}${fr(p, den)}-${fx(k * q, den)}=${fr(T, den)}-${fr(k * q, den)}=${fr(res, den)}=${fx(res, den)}$ (L)`,
            ],
            hint: '대분수를 가분수로 바꾸어 계산하면 편해요.',
          };
        }
        // 분모 3 은 네 조건을 동시에 만족할 수 없어서 제외
        const dn = den === 3 ? r.pick([4, 5, 7]) : den;
        const [X, S] = until(
          () => [r.int(3 * dn, 7 * dn), r.int(dn + 1, 3 * dn - 1)],
          ([X, S]) => X - S > dn && X % dn !== 0 && S % dn !== 0 && fracOk(X + S, dn) && (X - S) % dn !== 0 && (X + S) % dn !== 0,
        );
        const Y = X - S;
        return {
          q: `어떤 수에 $${mx(S, dn)}$를 더해야 할 것을 잘못하여 뺐더니 $${mx(Y, dn)}$가 되었습니다. 바르게 계산하면 얼마인가요?`,
          answer: { type: 'num', value: (X + S) / dn, display: 'mixed' },
          steps: [`어떤 수 $=${mx(Y, dn)}+${mx(S, dn)}=${mx(X, dn)}$`, `바르게 계산: $${mx(X, dn)}+${mx(S, dn)}=${mx(X + S, dn)}$`],
          hint: '먼저 어떤 수를 구해요.',
        };
      },
    },
  ],

  // ═════════════ e4b-2 삼각형 ═════════════
  'e4b-2': [
    {
      id: 'tri-wire',
      title: '철사로 삼각형 만들기',
      gen(r, level) {
        const name = pickName(r);
        if (level === 1) {
          const a = r.int(4, 30);
          if (r.chance(0.5))
            return {
              q: `${nm(name)}는 철사를 겹치는 부분 없이 사용하여 한 변이 $${a}$ cm인 정삼각형을 만들었습니다. 사용한 철사는 몇 cm인가요?`,
              answer: { type: 'num', value: 3 * a, unit: 'cm' },
              steps: [`정삼각형은 세 변의 길이가 모두 같아요.`, `$${a}\\times3=${3 * a}$ (cm)`],
            };
          return {
            q: `길이가 $${3 * a}$ cm인 끈을 남김없이 겹치지 않게 사용하여 정삼각형을 $1$개 만들었습니다. 정삼각형의 한 변은 몇 cm인가요?`,
            answer: { type: 'num', value: a, unit: 'cm' },
            steps: [`정삼각형은 세 변의 길이가 같아요.`, `$${3 * a}\\div3=${a}$ (cm)`],
          };
        }
        if (level === 2) {
          const [a, b] = until(
            () => [r.int(5, 25), r.int(3, 30)],
            ([a, b]) => b < 2 * a && b !== a,
          );
          const L = 2 * a + b;
          if (r.chance(0.5))
            return {
              q: `길이가 $${L}$ cm인 철사를 남김없이 사용하여 길이가 같은 두 변이 각각 $${a}$ cm인 이등변삼각형을 만들었습니다. 나머지 한 변은 몇 cm인가요?`,
              answer: { type: 'num', value: b, unit: 'cm' },
              steps: [`길이가 같은 두 변의 합: $${a}\\times2=${2 * a}$ (cm)`, `나머지 한 변: $${L}-${2 * a}=${b}$ (cm)`],
            };
          return {
            q: `길이가 $${L}$ cm인 철사를 남김없이 사용하여 나머지 한 변이 $${b}$ cm인 이등변삼각형을 만들었습니다. 길이가 같은 두 변 중 한 변은 몇 cm인가요?`,
            answer: { type: 'num', value: a, unit: 'cm' },
            steps: [`길이가 같은 두 변의 합: $${L}-${b}=${2 * a}$ (cm)`, `한 변: $${2 * a}\\div2=${a}$ (cm)`],
          };
        }
        if (r.chance(0.5)) {
          const [s, a] = until(
            () => [r.int(5, 20), r.int(4, 30)],
            ([s, a]) => {
              const b = 3 * s - 2 * a;
              return b > 0 && b < 2 * a && a !== s;
            },
          );
          const b = 3 * s - 2 * a;
          return {
            q: `한 변이 $${s}$ cm인 정삼각형을 만들었던 철사를 펴서, 남김없이 사용하여 길이가 같은 두 변이 각각 $${a}$ cm인 이등변삼각형을 만들었습니다. 이등변삼각형의 나머지 한 변은 몇 cm인가요?`,
            answer: { type: 'num', value: b, unit: 'cm' },
            steps: [`철사의 길이: $${s}\\times3=${3 * s}$ (cm)`, `길이가 같은 두 변: $${a}\\times2=${2 * a}$ (cm)`, `나머지 한 변: $${3 * s}-${2 * a}=${b}$ (cm)`],
          };
        }
        const [a, b] = until(
          () => [r.int(5, 25), r.int(3, 30)],
          ([a, b]) => b < 2 * a && b !== a && (2 * a + b) % 3 === 0,
        );
        const s = (2 * a + b) / 3;
        return {
          q: `길이가 같은 두 변이 각각 $${a}$ cm이고 나머지 한 변이 $${b}$ cm인 이등변삼각형을 만들었던 철사를 펴서, 남김없이 사용하여 정삼각형을 만들었습니다. 정삼각형의 한 변은 몇 cm인가요?`,
          answer: { type: 'num', value: s, unit: 'cm' },
          steps: [`철사의 길이: $${a}+${a}+${b}=${2 * a + b}$ (cm)`, `정삼각형의 한 변: $${2 * a + b}\\div3=${s}$ (cm)`],
        };
      },
    },
    {
      id: 'tri-angle-word',
      title: '삼각형 각도 문장제',
      gen(r, level) {
        if (level === 1) {
          const apex = r.int(6, 24) * 5;
          const ok = (180 - apex) % 2 === 0;
          const ap = ok ? apex : apex + 5;
          const obj = r.pick(['지붕', '옷걸이', '텐트 입구', '삼각 깃발']);
          return {
            q: `이등변삼각형 모양 ${obj}에서 길이가 같은 두 변 사이의 각(꼭짓점의 각)이 $${ap}^{\\circ}$입니다. 나머지 두 각 중 한 각은 몇 도인가요?`,
            answer: { type: 'num', value: (180 - ap) / 2, unit: '°' },
            steps: [`이등변삼각형은 나머지 두 각의 크기가 같아요.`, `두 각의 합: $180^{\\circ}-${ap}^{\\circ}=${180 - ap}^{\\circ}$`, `한 각: $${180 - ap}^{\\circ}\\div2=${(180 - ap) / 2}^{\\circ}$`],
          };
        }
        if (level === 2) {
          if (r.chance(0.5)) {
            const b = r.int(5, 17) * 5;
            return {
              q: `이등변삼각형 모양 표지판에서 크기가 같은 두 각 중 한 각이 $${b}^{\\circ}$입니다. 나머지 한 각은 몇 도인가요?`,
              answer: { type: 'num', value: 180 - 2 * b, unit: '°' },
              steps: [`크기가 같은 두 각의 합: $${b}^{\\circ}\\times2=${2 * b}^{\\circ}$`, `나머지 한 각: $180^{\\circ}-${2 * b}^{\\circ}=${180 - 2 * b}^{\\circ}$`],
            };
          }
          const [a, b] = until(
            () => [r.int(4, 22) * 5, r.int(4, 22) * 5],
            ([a, b]) => a + b < 170 && a !== b && 180 - a - b !== a && 180 - a - b !== b,
          );
          const x = 180 - a - b;
          const mxA = Math.max(a, b, x);
          const ans = mxA < 90 ? '예각삼각형' : mxA === 90 ? '직각삼각형' : '둔각삼각형';
          return {
            q: `삼각형 모양 색종이의 두 각의 크기가 $${a}^{\\circ}$, $${b}^{\\circ}$입니다. 이 삼각형은 어떤 삼각형인가요?`,
            answer: makeChoices(
              r,
              ans,
              ['예각삼각형', '직각삼각형', '둔각삼각형'].filter((t) => t !== ans),
              3,
            ),
            steps: [
              `나머지 한 각: $180^{\\circ}-${a}^{\\circ}-${b}^{\\circ}=${x}^{\\circ}$`,
              mxA < 90 ? '세 각이 모두 예각이므로 예각삼각형' : mxA === 90 ? '한 각이 직각이므로 직각삼각형' : `한 각($${mxA}^{\\circ}$)이 둔각이므로 둔각삼각형`,
            ],
          };
        }
        if (r.chance(0.6)) {
          const dif = r.pick([15, 30, 45, 60, 75, 90, 105, 120]);
          const base = (180 - dif) / 3;
          const apex = base + dif;
          const bigger = r.chance(0.5);
          return bigger
            ? {
                q: `이등변삼각형에서 크기가 다른 한 각(꼭짓점의 각)이 크기가 같은 두 각 중 한 각보다 $${dif}^{\\circ}$ 더 큽니다. 크기가 다른 한 각은 몇 도인가요?`,
                answer: { type: 'num', value: apex, unit: '°' },
                steps: [
                  `크기가 같은 한 각을 □라 하면 세 각은 □, □, □$+${dif}^{\\circ}$`,
                  `□$\\times3+${dif}^{\\circ}=180^{\\circ}$ → □$\\times3=${180 - dif}^{\\circ}$ → □$=${base}^{\\circ}$`,
                  `크기가 다른 한 각: $${base}^{\\circ}+${dif}^{\\circ}=${apex}^{\\circ}$`,
                ],
                hint: '크기가 같은 한 각을 □로 놓고 세 각의 합을 식으로 나타내요.',
              }
            : {
                q: `이등변삼각형에서 크기가 다른 한 각(꼭짓점의 각)이 크기가 같은 두 각 중 한 각보다 $${dif}^{\\circ}$ 더 큽니다. 크기가 같은 두 각 중 한 각은 몇 도인가요?`,
                answer: { type: 'num', value: base, unit: '°' },
                steps: [
                  `크기가 같은 한 각을 □라 하면 세 각은 □, □, □$+${dif}^{\\circ}$`,
                  `□$\\times3=180^{\\circ}-${dif}^{\\circ}=${180 - dif}^{\\circ}$`,
                  `□$=${180 - dif}^{\\circ}\\div3=${base}^{\\circ}$`,
                ],
              };
        }
        const m = r.pick([2, 3, 4, 7]);
        const base = 180 / (m + 2);
        return {
          q: `이등변삼각형에서 크기가 다른 한 각이 크기가 같은 두 각 중 한 각의 $${m}$배입니다. 크기가 다른 한 각은 몇 도인가요?`,
          answer: { type: 'num', value: base * m, unit: '°' },
          steps: [
            `크기가 같은 한 각을 □라 하면 세 각의 합은 □$+$□$+$□$\\times${m}$ $=$ □$\\times${m + 2}$`,
            `□$\\times${m + 2}=180^{\\circ}$ → □$=${base}^{\\circ}$`,
            `크기가 다른 한 각: $${base}^{\\circ}\\times${m}=${base * m}^{\\circ}$`,
          ],
        };
      },
    },
  ],

  // ═════════════ e4b-3 소수의 덧셈과 뺄셈 ═════════════
  'e4b-3': [
    {
      id: 'word-two',
      title: '두 단계 소수 문장제',
      gen(r, level) {
        const [n1, n2] = pick2Names(r);
        if (level === 1) {
          const h = r.int(120, 155) * 10,
            dl = r.int(3, 25) * 10;
          const taller = r.chance(0.5);
          const h2 = taller ? h + dl : h - dl;
          return {
            q: `${n1}의 키는 $${D(h)}$ m이고, ${n2}는 ${n1}보다 $${D(dl)}$ m 더 ${taller ? '큽니다' : '작습니다'}. ${n2}의 키는 몇 m인가요?`,
            answer: {
              type: 'num',
              value: h2 / 1000,
              unit: 'm',
              display: 'dec',
            },
            steps: [`$${D(h)}${taller ? '+' : '-'}${D(dl)}=${D(h2)}$ (m)`],
          };
        }
        if (level === 2) {
          if (r.chance(0.5)) {
            const [a, b, s] = until(
              () => [r.int(40, 180) * 10, r.int(40, 180) * 10, r.int(80, 250) * 10],
              ([a, b, s]) => s > Math.max(a, b) && a + b - s > 50 && a + b - s < 1500,
            );
            return {
              q: `${n1}네 집에서 공원까지는 $${D(a)}$ km, 공원에서 도서관까지는 $${D(b)}$ km입니다. 집에서 도서관으로 바로 가는 길은 $${D(s)}$ km입니다. 공원을 거쳐 가는 길은 바로 가는 길보다 몇 km 더 먼가요?`,
              answer: {
                type: 'num',
                value: (a + b - s) / 1000,
                unit: 'km',
                display: 'dec',
              },
              steps: [`공원을 거쳐 가는 길: $${D(a)}+${D(b)}=${D(a + b)}$ (km)`, `차: $${D(a + b)}-${D(s)}=${D(a + b - s)}$ (km)`],
            };
          }
          const bk = r.int(25, 80) * 10,
            ap = r.int(120, 350) * 10,
            pe = r.int(80, 250) * 10;
          return {
            q: `무게가 $${D(bk)}$ kg인 빈 바구니에 사과 $${D(ap)}$ kg과 배 $${D(pe)}$ kg을 담았습니다. 사과와 배를 담은 바구니의 무게는 몇 kg인가요?`,
            answer: {
              type: 'num',
              value: (bk + ap + pe) / 1000,
              unit: 'kg',
              display: 'dec',
            },
            steps: [`$${D(bk)}+${D(ap)}=${D(bk + ap)}$ (kg)`, `$${D(bk + ap)}+${D(pe)}=${D(bk + ap + pe)}$ (kg)`],
          };
        }
        if (r.chance(0.5)) {
          const [a, b, k] = until(
            () => [r.int(80, 250) * 10, r.int(80, 250) * 10, r.int(5, 40) * 10],
            ([a, b, k]) => k < Math.min(a, b) && a !== b,
          );
          const tot = a + b - k;
          return {
            q: `길이가 $${D(a)}$ m인 색 테이프와 $${D(b)}$ m인 색 테이프를 겹쳐서 이어 붙였더니 전체 길이가 $${D(tot)}$ m가 되었습니다. 겹친 부분의 길이는 몇 m인가요?`,
            answer: { type: 'num', value: k / 1000, unit: 'm', display: 'dec' },
            steps: [`두 색 테이프의 길이의 합: $${D(a)}+${D(b)}=${D(a + b)}$ (m)`, `겹친 부분: $${D(a + b)}-${D(tot)}=${D(k)}$ (m)`],
            hint: '겹치지 않고 이었을 때의 길이와 비교해요.',
          };
        }
        const a = r.int(60, 200) * 10,
          k = r.int(5, 30) * 10;
        const tot = 3 * a - 2 * k;
        return {
          q: `길이가 $${D(a)}$ m인 색 테이프 $3$장을 $${D(k)}$ m씩 겹쳐서 한 줄로 이어 붙였습니다. 이어 붙인 색 테이프의 전체 길이는 몇 m인가요?`,
          answer: { type: 'num', value: tot / 1000, unit: 'm', display: 'dec' },
          steps: [`$3$장의 길이의 합: $${D(a)}+${D(a)}+${D(a)}=${D(3 * a)}$ (m)`, `겹친 곳은 $2$군데: $${D(k)}+${D(k)}=${D(2 * k)}$ (m)`, `전체 길이: $${D(3 * a)}-${D(2 * k)}=${D(tot)}$ (m)`],
          hint: '3장을 이으면 겹친 곳은 몇 군데인지 생각해요.',
        };
      },
    },
  ],

  // ═════════════ e4b-4 사각형 ═════════════
  'e4b-4': [
    {
      id: 'quad-wire',
      title: '사각형 둘레 문장제',
      gen(r, level) {
        if (level === 1) {
          if (r.chance(0.5)) {
            const a = r.int(8, 40);
            const obj = r.pick(['창문', '거울', '타일', '쿠키']);
            return {
              q: `한 변이 $${a}$ cm인 마름모 모양 ${obj}의 네 변을 따라 테두리를 두르려고 합니다. 테두리는 몇 cm 필요한가요?`,
              answer: { type: 'num', value: 4 * a, unit: 'cm' },
              steps: [`마름모는 네 변의 길이가 모두 같아요.`, `$${a}\\times4=${4 * a}$ (cm)`],
            };
          }
          const a = r.int(6, 25),
            b = until(
              () => r.int(4, 20),
              (x) => x !== a,
            );
          return {
            q: `이웃한 두 변의 길이가 각각 $${a}$ m, $${b}$ m인 평행사변형 모양 꽃밭의 둘레에 울타리를 치려고 합니다. 울타리는 몇 m 필요한가요?`,
            answer: { type: 'num', value: 2 * (a + b), unit: 'm' },
            steps: [`평행사변형은 마주 보는 두 변의 길이가 같아요.`, `$${a}+${b}+${a}+${b}=${2 * (a + b)}$ (m)`],
          };
        }
        if (level === 2) {
          if (r.chance(0.5)) {
            const [a, b] = until(
              () => [r.int(6, 30), r.int(4, 25)],
              ([a, b]) => a !== b,
            );
            const P = 2 * (a + b);
            return {
              q: `네 변의 길이의 합이 $${P}$ cm인 평행사변형이 있습니다. 한 변의 길이가 $${a}$ cm일 때, 이 변과 이웃한 변의 길이는 몇 cm인가요?`,
              answer: { type: 'num', value: b, unit: 'cm' },
              steps: [`이웃한 두 변의 합은 둘레의 반: $${P}\\div2=${a + b}$ (cm)`, `이웃한 변: $${a + b}-${a}=${b}$ (cm)`],
            };
          }
          const a = r.int(6, 35);
          return {
            q: `길이가 $${4 * a}$ cm인 철사를 남김없이 겹치지 않게 사용하여 마름모를 $1$개 만들었습니다. 마름모의 한 변은 몇 cm인가요?`,
            answer: { type: 'num', value: a, unit: 'cm' },
            steps: [`마름모는 네 변의 길이가 같아요.`, `$${4 * a}\\div4=${a}$ (cm)`],
          };
        }
        if (r.chance(0.5)) {
          const [s, a] = until(
            () => [r.int(6, 25), r.int(3, 40)],
            ([s, a]) => 2 * s - a > 0 && a !== s && 2 * s - a !== a,
          );
          return {
            q: `한 변이 $${s}$ cm인 마름모를 만들었던 철사를 펴서, 남김없이 사용하여 한 변이 $${a}$ cm인 평행사변형을 만들었습니다. 이 평행사변형에서 길이가 $${a}$ cm인 변과 이웃한 변은 몇 cm인가요?`,
            answer: { type: 'num', value: 2 * s - a, unit: 'cm' },
            steps: [`철사의 길이: $${s}\\times4=${4 * s}$ (cm)`, `이웃한 두 변의 합: $${4 * s}\\div2=${2 * s}$ (cm)`, `이웃한 변: $${2 * s}-${a}=${2 * s - a}$ (cm)`],
          };
        }
        const [a, b] = until(
          () => [r.int(6, 30), r.int(4, 25)],
          ([a, b]) => a !== b && (a + b) % 2 === 0,
        );
        return {
          q: `가로가 $${a}$ cm, 세로가 $${b}$ cm인 직사각형을 만들었던 철사를 펴서, 남김없이 사용하여 마름모를 만들었습니다. 마름모의 한 변은 몇 cm인가요?`,
          answer: { type: 'num', value: (a + b) / 2, unit: 'cm' },
          steps: [`철사의 길이: $${a}+${b}+${a}+${b}=${2 * (a + b)}$ (cm)`, `마름모의 한 변: $${2 * (a + b)}\\div4=${(a + b) / 2}$ (cm)`],
        };
      },
    },
    {
      id: 'quad-angle-word',
      title: '사각형 각도 문장제',
      gen(r, level) {
        if (level === 1) {
          const a = until(
            () => r.int(7, 29) * 5,
            (x) => x !== 90,
          );
          const obj = r.pick(['평행사변형 모양 타일', '평행사변형 모양 액자', '마름모 모양 연', '마름모 모양 쿠키']);
          return {
            q: `${obj}의 한 각이 $${a}^{\\circ}$입니다. 이 각과 이웃한 각은 몇 도인가요?`,
            answer: { type: 'num', value: 180 - a, unit: '°' },
            steps: [`평행사변형(마름모)에서 이웃한 두 각의 크기의 합은 $180^{\\circ}$`, `$180^{\\circ}-${a}^{\\circ}=${180 - a}^{\\circ}$`],
          };
        }
        if (level === 2) {
          const a = until(
            () => r.int(7, 29) * 5,
            (x) => x !== 90,
          );
          if (r.chance(0.5))
            return {
              q: `평행사변형 모양 땅의 네 각 중 한 각이 $${a}^{\\circ}$입니다. 나머지 세 각의 크기의 합은 몇 도인가요?`,
              answer: { type: 'num', value: 360 - a, unit: '°' },
              steps: [`사각형의 네 각의 크기의 합은 $360^{\\circ}$`, `$360^{\\circ}-${a}^{\\circ}=${360 - a}^{\\circ}$`],
            };
          return {
            q: `마름모 모양 연의 한 각이 $${a}^{\\circ}$입니다. 이 각과 마주 보는 각, 이웃한 각은 각각 몇 도인가요?`,
            answer: {
              type: 'fields',
              fields: [
                { label: '마주 보는 각', value: a, unit: '°' },
                { label: '이웃한 각', value: 180 - a, unit: '°' },
              ],
            },
            steps: [`마름모에서 마주 보는 두 각의 크기는 같아요: $${a}^{\\circ}$`, `이웃한 두 각의 합은 $180^{\\circ}$: $180^{\\circ}-${a}^{\\circ}=${180 - a}^{\\circ}$`],
          };
        }
        if (r.chance(0.5)) {
          const k = r.int(2, 30) * 5;
          const kk = k % 2 === 0 ? k : k + 5;
          const big = (180 + kk) / 2;
          return {
            q: `평행사변형 모양 화단에서 이웃한 두 각 중 큰 각이 작은 각보다 $${kk}^{\\circ}$ 더 큽니다. 큰 각은 몇 도인가요?`,
            answer: { type: 'num', value: big, unit: '°' },
            steps: [
              `이웃한 두 각의 합은 $180^{\\circ}$`,
              `작은 각을 □라 하면 □$+$□$+${kk}^{\\circ}=180^{\\circ}$ → □$=${(180 - kk) / 2}^{\\circ}$`,
              `큰 각: $${(180 - kk) / 2}^{\\circ}+${kk}^{\\circ}=${big}^{\\circ}$`,
            ],
            hint: '이웃한 두 각의 합이 180°임을 이용해요.',
          };
        }
        const m = r.pick([2, 3, 4, 5, 8]);
        const small = 180 / (m + 1);
        return {
          q: `마름모 모양 창문에서 이웃한 두 각 중 큰 각이 작은 각의 $${m}$배입니다. 작은 각은 몇 도인가요?`,
          answer: { type: 'num', value: small, unit: '°' },
          steps: [`이웃한 두 각의 합은 $180^{\\circ}$`, `작은 각을 □라 하면 □$+$□$\\times${m}=$ □$\\times${m + 1}=180^{\\circ}$`, `□$=180^{\\circ}\\div${m + 1}=${small}^{\\circ}$`],
        };
      },
    },
  ],

  // ═════════════ e4b-5 꺾은선그래프 ═════════════
  'e4b-5': [
    {
      id: 'line-predict',
      title: '변화 규칙으로 예상하기',
      gen(r, level) {
        if (level === 3 && r.chance(0.5)) {
          // 타는 양초: 10분마다 일정하게 줄어듦
          const dl = r.int(2, 3),
            m = r.int(7, 12);
          const start = dl * m;
          const labels = ['0분', '10분', '20분', '30분', '40분'];
          const vals = labels.map((_, i) => start - dl * i);
          const fig = lineChart(labels, vals, {
            unit: 'cm',
            min: 0,
            max: start + 2,
            step: 2,
          });
          return {
            q: `불을 붙인 양초의 길이를 $10$분마다 재어 나타낸 꺾은선그래프입니다. 양초가 같은 빠르기로 탄다면 불을 붙이고 몇 분 후에 양초가 다 타서 없어지나요?`,
            fig,
            answer: { type: 'num', value: 10 * m, unit: '분' },
            steps: [`$10$분마다 $${dl}$ cm씩 줄어들어요. 처음 길이는 $${start}$ cm`, `$${start}\\div${dl}=${m}$ → $10$분씩 $${m}$번`, `$10\\times${m}=${10 * m}$(분) 후`],
          };
        }
        const th = r.pick(LINE_UP);
        const n = 5;
        const money = th.unit === '원';
        const d0 = r.int(th.d[0], th.d[1]),
          s0 = r.int(th.start[0], th.start[1]);
        const vt = Array.from({ length: n }, (_, i) => s0 + d0 * i);
        const vals = vt.map((v) => v * th.tick);
        const labels = vals.map((_, i) => th.lab(i));
        const mul = level === 1 ? 1 : level === 2 ? r.int(2, 3) : r.int(2, 5);
        const fig = lineChart(labels, vals, {
          unit: th.unit,
          min: 0,
          max: (Math.max(...vt) + 2) * th.tick,
          step: th.tick,
        });
        const tgt = n - 1 + mul;
        const pred = (s0 + d0 * tgt) * th.tick;
        const unitT = money ? '원' : 'cm';
        const predT = money ? `$${c(pred)}$원` : `$${pred}$ cm`;
        const stepT = `한 칸마다 $${c(d0 * th.tick)}$${money ? '원' : ' cm'}씩 늘어나요.`;
        if (level === 3) {
          return {
            q: `${J(th.title, '을/를')} 나타낸 꺾은선그래프입니다. 같은 규칙으로 계속 늘어난다면 ${money ? `저금통에 모인 돈이 처음으로 ${predT}이 되는 때는 몇 월인가요?` : `싹의 키가 처음으로 ${predT}가 되는 날은 며칠째 되는 날인가요?`}`,
            fig,
            answer: {
              type: 'num',
              value: money ? tgt + 3 : tgt + 1,
              unit: money ? '월' : '일째',
            },
            steps: [
              stepT,
              `${labels[n - 1]}의 $${c(vals[n - 1])}$에서 $${c(pred)}$까지: $(${c(pred)}-${c(vals[n - 1])})\\div${c(d0 * th.tick)}=${mul}$(칸)`,
              `${labels[n - 1]}에서 $${mul}$칸 뒤 → ${th.lab(tgt)}`,
            ],
          };
        }
        return {
          q: `${J(th.title, '을/를')} 나타낸 꺾은선그래프입니다. 같은 규칙으로 계속 늘어난다면 ${money ? `${th.lab(tgt)}에는 저금통에 모인 돈이 몇 원이 될까요?` : `${th.lab(tgt)}에는 싹의 키가 몇 cm가 될까요?`}`,
          fig,
          answer: { type: 'num', value: pred, unit: unitT },
          steps: [stepT, `${labels[n - 1]}: $${c(vals[n - 1])}$ → ${th.lab(tgt)}: $${c(vals[n - 1])}+${c(d0 * th.tick)}\\times${mul}=${c(pred)}$`],
        };
      },
    },
    {
      id: 'line-use',
      title: '꺾은선그래프 활용 문장제',
      gen(r, level) {
        const th = r.pick([
          {
            title: '월별 아이스크림 판매량',
            labels: ['5월', '6월', '7월', '8월', '9월'],
            item: '아이스크림',
            prices: [500, 700, 800, 1000, 1200],
          },
          {
            title: '요일별 빵 판매량',
            labels: ['월요일', '화요일', '수요일', '목요일', '금요일'],
            item: '빵',
            prices: [1200, 1500, 2000, 2500],
          },
          {
            title: '월별 우유 판매량',
            labels: ['3월', '4월', '5월', '6월', '7월'],
            item: '우유',
            prices: [600, 800, 900, 1100],
          },
        ]);
        const tick = 10;
        const vt = until(
          () => th.labels.map(() => r.int(4, 18)),
          (v) => new Set(v).size === v.length,
        );
        const vals = vt.map((v) => v * tick);
        const p = r.pick(th.prices);
        const fig = lineChart(th.labels, vals, {
          unit: '개',
          min: 0,
          max: (Math.max(...vt) + 2) * tick,
          step: 20,
        });
        const intro = `어느 가게의 ${J(th.title, '을/를')} 나타낸 꺾은선그래프입니다.`;
        if (level === 1) {
          const i = r.int(0, 4);
          return {
            q: `${intro} ${th.item} 한 개의 값이 $${c(p)}$원일 때, ${th.labels[i]}에 판 ${th.item}의 값은 모두 얼마인가요?`,
            fig,
            answer: { type: 'num', value: vals[i] * p, unit: '원' },
            steps: [`그래프에서 ${th.labels[i]}: $${vals[i]}$개`, `$${vals[i]}\\times${c(p)}=${c(vals[i] * p)}$(원)`],
          };
        }
        if (level === 2) {
          const i = r.int(0, 2);
          const part = vals.slice(i, i + 3);
          return {
            q: `${intro} ${th.labels[i]}부터 ${th.labels[i + 2]}까지 판 ${J(th.item, '은/는')} 모두 몇 개인가요?`,
            fig,
            answer: { type: 'num', value: sum(part), unit: '개' },
            steps: [
              `${th.labels
                .slice(i, i + 3)
                .map((l, k) => `${l} $${part[k]}$`)
                .join(', ')}`,
              `$${part.join('+')}=${sum(part)}$(개)`,
            ],
          };
        }
        const mi = vals.indexOf(Math.max(...vals)),
          li = vals.indexOf(Math.min(...vals));
        const dlt = vals[mi] - vals[li];
        return {
          q: `${intro} ${th.item} 한 개의 값이 $${c(p)}$원일 때, ${J(th.item, '을/를')} 가장 많이 판 때와 가장 적게 판 때의 판매 금액의 차는 얼마인가요?`,
          fig,
          answer: { type: 'num', value: dlt * p, unit: '원' },
          steps: [
            `가장 많이 판 때: ${th.labels[mi]} $${vals[mi]}$개, 가장 적게 판 때: ${th.labels[li]} $${vals[li]}$개`,
            `판매량의 차: $${vals[mi]}-${vals[li]}=${dlt}$(개)`,
            `금액의 차: $${dlt}\\times${c(p)}=${c(dlt * p)}$(원)`,
          ],
          hint: '판매량의 차를 먼저 구한 뒤 한 개의 값을 곱해요.',
        };
      },
    },
  ],

  // ═════════════ e4b-6 다각형 ═════════════
  'e4b-6': [
    {
      id: 'regular-wire',
      title: '철사로 정다각형 만들기',
      gen(r, level) {
        const name = pickName(r);
        const ns = [5, 6, 7, 8, 9, 10];
        if (level === 1) {
          const n = r.pick(ns),
            a = r.int(3, 20);
          return {
            q: `${nm(name)}는 철사를 겹치는 부분 없이 사용하여 한 변이 $${a}$ cm인 정${POLY[n]}을 만들었습니다. 사용한 철사는 몇 cm인가요?`,
            answer: { type: 'num', value: n * a, unit: 'cm' },
            steps: [`정${POLY[n]}은 변이 $${n}$개이고 길이가 모두 같아요.`, `$${a}\\times${n}=${n * a}$ (cm)`],
          };
        }
        if (level === 2) {
          const n = r.pick(ns),
            a = r.int(4, 25);
          return {
            q: `길이가 $${n * a}$ cm인 철사를 남김없이 겹치지 않게 사용하여 정${POLY[n]}을 $1$개 만들었습니다. 정${POLY[n]}의 한 변은 몇 cm인가요?`,
            answer: { type: 'num', value: a, unit: 'cm' },
            steps: [`정${POLY[n]}은 길이가 같은 변이 $${n}$개예요.`, `$${n * a}\\div${n}=${a}$ (cm)`],
          };
        }
        if (r.chance(0.5)) {
          const [n1, n2, a] = until(
            () => [r.pick([3, 4, 5, 6, 8, 9, 10, 12]), r.pick([3, 4, 5, 6, 8, 9, 10, 12]), r.int(4, 30)],
            ([n1, n2, a]) => n1 !== n2 && (n1 * a) % n2 === 0,
          );
          const L = n1 * a;
          return {
            q: `한 변이 $${a}$ cm인 정${POLY[n1]}을 만들었던 철사를 펴서, 남김없이 사용하여 정${POLY[n2]}을 만들었습니다. 정${POLY[n2]}의 한 변은 몇 cm인가요?`,
            answer: { type: 'num', value: L / n2, unit: 'cm' },
            steps: [`철사의 길이: $${a}\\times${n1}=${L}$ (cm)`, `정${POLY[n2]}의 한 변: $${L}\\div${n2}=${L / n2}$ (cm)`],
          };
        }
        const n = r.pick(ns),
          a = r.int(3, 12);
        const used = 2 * n * a;
        const L = Math.ceil((used + 5) / 50) * 50 + r.pick([0, 50]);
        return {
          q: `길이가 $${L}$ cm인 철사로 한 변이 $${a}$ cm인 정${POLY[n]}을 겹치는 부분 없이 $2$개 만들었습니다. 남은 철사는 몇 cm인가요?`,
          answer: { type: 'num', value: L - used, unit: 'cm' },
          steps: [`정${POLY[n]} $1$개: $${a}\\times${n}=${n * a}$ (cm)`, `$2$개: $${n * a}\\times2=${used}$ (cm)`, `남은 철사: $${L}-${used}=${L - used}$ (cm)`],
        };
      },
    },
    {
      id: 'polygon-word',
      title: '다각형의 각·대각선 문장제',
      gen(r, level) {
        if (level === 1) {
          const n = r.pick([5, 6, 8, 9, 10, 12]);
          const S = (n - 2) * 180;
          const obj = r.pick(['표지판', '탁자', '정원', '타일']);
          return {
            q: `정${POLY[n]} 모양 ${obj}의 모든 각의 크기의 합은 $${c(S)}^{\\circ}$입니다. 이 ${obj}의 한 각은 몇 도인가요?`,
            answer: { type: 'num', value: S / n, unit: '°' },
            steps: [`정${POLY[n]}은 각이 $${n}$개이고 크기가 모두 같아요.`, `$${c(S)}^{\\circ}\\div${n}=${S / n}^{\\circ}$`],
          };
        }
        if (level === 2) {
          if (r.chance(0.5)) {
            const n = r.int(5, 9);
            return {
              q: `${POLY[n]} 모양 정원의 꼭짓점마다 나무를 한 그루씩 심었습니다. 서로 이웃하지 않는 두 나무끼리 모두 줄로 이으려고 합니다. 줄은 모두 몇 개 필요한가요?`,
              answer: { type: 'num', value: (n * (n - 3)) / 2, unit: '개' },
              steps: [
                `이웃하지 않는 두 꼭짓점을 이은 선분은 대각선이에요.`,
                `한 꼭짓점에서 그을 수 있는 대각선: $${n}-3=${n - 3}$(개)`,
                `$${n - 3}\\times${n}\\div2=${(n * (n - 3)) / 2}$(개) (같은 대각선을 두 번 셌으므로 $2$로 나눠요)`,
              ],
            };
          }
          const n = r.pick([5, 6, 8, 10, 12]);
          const S = (n - 2) * 180;
          return {
            q: `정${POLY[n]} 모양 타일이 있습니다. 한 꼭짓점에서 대각선을 모두 그어 삼각형으로 나누는 방법으로 생각할 때, 이 타일의 한 각은 몇 도인가요?`,
            answer: { type: 'num', value: S / n, unit: '°' },
            steps: [
              `한 꼭짓점에서 대각선을 그으면 삼각형 $${n - 2}$개로 나뉘어요.`,
              `모든 각의 합: $180^{\\circ}\\times${n - 2}=${c(S)}^{\\circ}$`,
              `한 각: $${c(S)}^{\\circ}\\div${n}=${S / n}^{\\circ}$`,
            ],
          };
        }
        const a = r.int(3, 15);
        if (r.chance(0.5)) {
          const n = r.pick([5, 6, 7, 8, 9, 10, 12]);
          const S = (n - 2) * 180;
          return {
            q: `모든 각의 크기의 합이 $${c(S)}^{\\circ}$인 정다각형이 있습니다. 이 정다각형의 한 변이 $${a}$ cm일 때, 모든 변의 길이의 합은 몇 cm인가요?`,
            answer: { type: 'num', value: n * a, unit: 'cm' },
            steps: [`삼각형으로 나누면 $${c(S)}\\div180=${n - 2}$(개)`, `삼각형이 $${n - 2}$개이면 변은 $${n - 2}+2=${n}$개 → 정${POLY[n]}`, `둘레: $${a}\\times${n}=${n * a}$ (cm)`],
            hint: 'n각형은 한 꼭짓점에서 대각선을 그으면 삼각형 (n−2)개로 나뉘어요.',
          };
        }
        const n = r.pick([5, 6, 7, 8, 9, 10, 12]);
        return {
          q: `한 꼭짓점에서 그을 수 있는 대각선이 $${n - 3}$개인 정다각형이 있습니다. 이 정다각형의 한 변이 $${a}$ cm일 때, 모든 변의 길이의 합은 몇 cm인가요?`,
          answer: { type: 'num', value: n * a, unit: 'cm' },
          steps: [
            `한 꼭짓점에서는 자기 자신과 이웃한 두 꼭짓점을 뺀 꼭짓점으로 대각선을 그어요: (꼭짓점 수) $-3$`,
            `꼭짓점 수: $${n - 3}+3=${n}$ → 변도 $${n}$개`,
            `둘레: $${a}\\times${n}=${n * a}$ (cm)`,
          ],
        };
      },
    },
  ],
};
