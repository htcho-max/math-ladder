// 초1 문장제(이야기 문제) 유형 — 단원별 skills 끝에 덧붙임 (e1a.ts / e1b.ts 에서 합침)
import type { ProblemDraft, Skill } from '../../core/types';
import type { Rng } from '../../core/rng';
import { makeChoices } from '../../core/tex';
import { range } from '../../core/nt';
import { clock } from '../../core/fig';
import { J, jo, names, textChoices, lv, THINGS } from './util';
import { hstack } from './draw';

export const ORDS = ['', '첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째', '열째', '열한째', '열두째'];
const EDIBLE = ['사과', '사탕', '쿠키', '귤', '젤리'];

/** 서수 보기 (첫째~아홉째 안에서) */
function ordChoices(r: Rng, k: number, wrongs: number[], max = 9) {
  const ok = (x: number) => x >= 1 && x <= max && x !== k;
  const near = range(1, max).filter(ok).sort((a, b) => Math.abs(a - k) - Math.abs(b - k));
  return makeChoices(
    r,
    ORDS[k],
    wrongs.filter(ok).map((x) => ORDS[x]),
    4,
    (i) => ORDS[near[i] ?? k],
  );
}

/** 사람 이름 보기 */
function nameChoices(r: Rng, correct: string, all: string[]) {
  return textChoices(r, correct, all.filter((x) => x !== correct), Math.min(4, all.length));
}

const t = (h: number, m: number) => (m === 0 ? `$${h}$시` : `$${h}$시 $${m}$분`);

// ───────────────────────── e1a-1 9까지의 수
const e1a1: Skill[] = [
  {
    id: 'order-story',
    title: '순서 이야기 문제',
    gen(r, level): ProblemDraft {
      if (level === 1) {
        const n = r.int(4, 6);
        const ps = names(r, n);
        const race = r.chance(0.5);
        const k = r.int(1, n);
        const back = !race && r.chance(0.5);
        const idx = back ? n - k : k - 1;
        return race
          ? {
              q: `달리기 시합에서 ${ps.join(', ')} 순서로 결승선에 들어왔어요. ${ORDS[k]}로 들어온 사람은 누구인가요?`,
              answer: nameChoices(r, ps[idx], ps),
              steps: [`먼저 들어온 사람부터 첫째, 둘째, … 하고 세어요.`, `${ORDS[k]}는 ${J(ps[idx], '이에요')}.`],
            }
          : {
              q: `친구들이 앞에서부터 ${ps.join(', ')} 순서로 한 줄로 서 있어요. ${back ? '뒤' : '앞'}에서 ${ORDS[k]}에 서 있는 사람은 누구인가요?`,
              answer: nameChoices(r, ps[idx], ps),
              steps: [`${back ? '맨 뒤' : '맨 앞'}에 있는 ${ps[back ? n - 1 : 0]}부터 첫째, 둘째, … 하고 세어요.`, `${back ? '뒤' : '앞'}에서 ${ORDS[k]}는 ${J(ps[idx], '이에요')}.`],
            };
      }
      const ctx = r.pick(['line', 'shelf', 'floor'] as const);
      if (level === 2) {
        const n = r.int(5, 9);
        const k = r.int(2, n - 1);
        const ans = n - k + 1;
        const [p] = names(r, 1);
        const q =
          ctx === 'line'
            ? `어린이 $${n}$명이 한 줄로 서 있어요. ${p}는 앞에서 ${ORDS[k]}에 서 있어요. ${p}는 뒤에서 몇째에 서 있나요?`
            : ctx === 'shelf'
              ? `책꽂이에 책 $${n}$권이 한 줄로 꽂혀 있어요. 동화책은 왼쪽에서 ${ORDS[k]}에 꽂혀 있어요. 동화책은 오른쪽에서 몇째에 꽂혀 있나요?`
              : `$${n}$층까지 있는 건물에서 ${p}네 집은 아래에서 ${ORDS[k]} 층이에요. ${p}네 집은 위에서 몇째 층인가요?`;
        const [a, b] = ctx === 'line' ? ['앞', '뒤'] : ctx === 'shelf' ? ['왼쪽', '오른쪽'] : ['아래', '위'];
        return {
          q,
          answer: ordChoices(r, ans, [k, n - k, ans + 1, ans - 1]),
          steps: [`○를 $${n}$개 그리고 ${a}에서 ${ORDS[k]} ○에 표시해요.`, `표시한 ○를 ${b}에서부터 세어 보면 ${J(ORDS[ans], '이에요')}.`],
          hint: '○를 그려서 세어 보세요.',
        };
      }
      const a = r.int(2, 6);
      const b = r.int(2, 10 - a);
      const n = a + b - 1;
      const [p] = names(r, 1);
      const [q, unit, s1, s2] =
        ctx === 'line'
          ? [`${p}는 줄을 서 있어요. ${p}는 앞에서 ${ORDS[a]}, 뒤에서 ${ORDS[b]}에 서 있어요. 줄을 선 사람은 모두 몇 명인가요?`, '명', '앞', '뒤']
          : ctx === 'shelf'
            ? [`책꽂이에 책이 한 줄로 꽂혀 있어요. 위인전은 왼쪽에서 ${ORDS[a]}, 오른쪽에서 ${ORDS[b]}에 꽂혀 있어요. 책꽂이에 꽂힌 책은 모두 몇 권인가요?`, '권', '왼쪽', '오른쪽']
            : [`${p}네 집은 아래에서 ${ORDS[a]} 층이고, 위에서 ${ORDS[b]} 층이에요. 이 건물은 몇 층까지 있나요?`, '층', '아래', '위'];
      return {
        q,
        answer: { type: 'num', value: n, unit },
        steps: [`${s1}에서 ${ORDS[a]}가 되도록 ○를 $${a}$개 그려요. 마지막 ○가 ${J(ctx === 'floor' ? p + '네 집' : ctx === 'shelf' ? '위인전' : p, '이에요')}.`, `그 ○가 ${s2}에서 ${ORDS[b]}가 되도록 뒤로 ○를 $${b - 1}$개 더 그려요.`, `○를 모두 세면 $${n}$${J(unit, '이에요')}.`],
        hint: '○를 그려서 세어 보세요.',
      };
    },
  },
  {
    id: 'number-story',
    title: '이야기 속 수 (1 큰 수·1 작은 수·크기 비교)',
    gen(r, level): ProblemDraft {
      const [p1, p2, p3] = names(r, 3);
      if (level === 1) {
        const [thing, u] = r.pick(THINGS);
        const more = r.chance(0.5);
        const a = more ? r.int(1, 8) : r.int(1, 9);
        const ans = more ? a + 1 : a - 1;
        const act = more ? `${p2}에게 $1$${u}${jo(u, '를')} 더 받았어요` : EDIBLE.includes(thing) ? `그중 $1$${u}${jo(u, '를')} 먹었어요` : `그중 $1$${u}${jo(u, '를')} 동생에게 주었어요`;
        return {
          q: `${p1}는 ${thing} $${a}$${u}${jo(u, '를')} 가지고 있었어요. ${act}. 지금 ${p1}가 가진 ${J(thing, '은')} 몇 ${u}인가요?`,
          answer: { type: 'num', value: ans, unit: u },
          steps: [more ? `$1$${u} 더 받으면 $1$만큼 더 큰 수가 돼요.` : `$1$${u}${jo(u, '가')} 없어지면 $1$만큼 더 작은 수가 돼요.`, more ? `$${a}$보다 $1$만큼 더 큰 수는 $${ans}$예요.` : `$${a}$보다 $1$만큼 더 작은 수는 $${ans}$예요.`],
        };
      }
      const ctxs: [string, string, string][] = [
        ['어항에 물고기가', '마리', '어항'],
        ['꽃병에 꽃이', '송이', '꽃병'],
        ['필통에 연필이', '자루', '필통'],
        ['접시에 쿠키가', '개', '접시'],
        ['바구니에 귤이', '개', '바구니'],
      ];
      const [lead, u, box] = r.pick(ctxs);
      if (level === 2) {
        const [a, b] = r.sample(range(1, 9), 2);
        const most = r.chance(0.5);
        const ans = (a > b) === most ? p1 : p2;
        const item = lead.split(' ')[1].replace(/[이가]$/, '');
        return {
          q: `${p1}의 ${lead} $${a}$${u}, ${p2}의 ${box}에는 $${b}$${u} 있어요. 누구의 ${box}에 ${J(item, '이')} 더 ${most ? '많나요' : '적나요'}?`,
          answer: nameChoices(r, ans, [p1, p2]),
          steps: [`$${Math.max(a, b)}$는 $${Math.min(a, b)}$보다 커요. (수를 순서대로 쓰면 $${Math.max(a, b)}$가 뒤에 와요.)`, `${most ? '더 많은' : '더 적은'} 쪽은 ${ans}의 ${J(box, '이에요')}.`],
        };
      }
      const [thing, uu] = r.pick(THINGS);
      const k = r.int(2, 7);
      const more = r.chance(0.5);
      const mid = more ? k + 1 : k - 1;
      const ans = more ? k + 2 : k - 2;
      return {
        q: `${p1}는 ${p2}보다 ${thing}를 $1$${uu} 더 ${more ? '많이' : '적게'} 가지고 있고, ${p3}는 ${p1}보다 $1$${uu} 더 ${more ? '많이' : '적게'} 가지고 있어요. ${p2}가 ${thing} $${k}$${uu}${jo(uu, '를')} 가지고 있다면 ${p3}가 가진 ${J(thing, '은')} 몇 ${uu}인가요?`,
        answer: { type: 'num', value: ans, unit: uu },
        steps: [`${p1}: $${k}$보다 $1$만큼 더 ${more ? '큰' : '작은'} 수 → $${mid}$${uu}`, `${p3}: $${mid}$보다 $1$만큼 더 ${more ? '큰' : '작은'} 수 → $${ans}$${uu}`],
        hint: `${p2} → ${p1} → ${p3} 순서로 차례차례 구해요.`,
      };
    },
  },
];

// ───────────────────────── e1a-2 여러 가지 모양
type S3 = 'box' | 'cyl' | 'ball';
const SHAPE: Record<S3, string> = { box: '상자 모양', cyl: '둥근기둥 모양', ball: '공 모양' };
const OBJ: Record<S3, string[]> = {
  box: ['선물 상자', '주사위', '휴지 상자', '우유갑', '벽돌', '냉장고', '과자 상자', '책'],
  cyl: ['음료수 캔', '딱풀', '두루마리 휴지', '북', '통조림', '분유 통', '양초'],
  ball: ['축구공', '구슬', '수박', '야구공', '농구공', '지구본', '배구공'],
};
const ALL3: S3[] = ['box', 'cyl', 'ball'];

/** 각 모양별 개수만큼 물건을 뽑아 섞은 목록 */
function objList(r: Rng, counts: Record<S3, number>): { name: string; kind: S3 }[] {
  const out: { name: string; kind: S3 }[] = [];
  for (const k of ALL3) for (const nm of r.sample(OBJ[k], counts[k])) out.push({ name: nm, kind: k });
  return r.shuffle(out);
}

const e1a2: Skill[] = [
  {
    id: 'riddle-story',
    title: '설명을 듣고 물건 찾기',
    gen(r, level): ProblemDraft {
      const [p, p2] = names(r, 2);
      const kind = r.pick(ALL3);
      if (level < 3) {
        const CL1: Record<S3, string[]> = {
          box: ['뾰족한 부분이 있어요', '평평한 부분만 있고, 굴러가지 않아요'],
          cyl: ['눕히면 잘 굴러가고, 세우면 쌓을 수 있어요', '평평한 부분과 둥근 부분이 모두 있어요'],
          ball: ['모든 부분이 둥글어서 어느 쪽으로도 잘 굴러가요', '평평한 부분이 하나도 없어요'],
        };
        const CL2: Record<S3, string[]> = {
          box: ['평평한 부분이 있어요. 그런데 어떻게 놓아도 굴러가지 않아요', '쌓을 수 있어요. 그런데 둥근 부분은 없어요'],
          cyl: ['평평한 부분이 있어요. 그리고 굴러가기도 해요', '둥근 부분이 있어요. 그런데 쌓을 수도 있어요'],
          ball: ['둥근 부분이 있어요. 그런데 쌓을 수는 없어요', '잘 굴러가요. 그런데 평평한 부분은 없어요'],
        };
        const clue = r.pick((level === 1 ? CL1 : CL2)[kind]);
        const right = r.pick(OBJ[kind]);
        const others = ALL3.filter((k) => k !== kind);
        const wr = [r.pick(OBJ[others[0]]), r.pick(OBJ[others[1]]), r.pick(OBJ[r.pick(others)])];
        return {
          q: `${p}가 어떤 물건을 설명하고 있어요.\n"${clue}."\n${p}가 설명하는 물건은 무엇일까요?`,
          answer: makeChoices(r, right, wr, 4, (i) => OBJ[others[i % 2]][i % OBJ[others[i % 2]].length]),
          steps: [`설명에 맞는 모양은 ${J(SHAPE[kind], '이에요')}.`, `${SHAPE[kind]}인 물건은 ${J(right, '이에요')}.`],
          hint: '굴러가는지, 쌓을 수 있는지, 뾰족한 부분이 있는지 생각해 보세요.',
        };
      }
      const C3: Record<S3, [string, string][]> = {
        box: [['쌓을 수 있어요', '굴러가지 않아요'], ['평평한 부분이 있어요', '뾰족한 부분도 있어요']],
        cyl: [['쌓을 수 있어요', '눕히면 굴러가요'], ['평평한 부분이 있어요', '둥근 부분도 있어요']],
        ball: [['잘 굴러가요', '평평한 부분이 없어요'], ['둥근 부분만 있어요', '쌓을 수 없어요']],
      };
      const [c1, c2] = r.pick(C3[kind]);
      const counts = { box: r.int(1, 3), cyl: r.int(1, 3), ball: r.int(1, 3) } as Record<S3, number>;
      const list = objList(r, counts);
      const ans = counts[kind];
      return {
        q: `${p}와 ${p2}가 같은 모양을 설명하고 있어요.\n${p}: "${c1}."\n${p2}: "${c2}."\n다음 물건 중에서 두 사람이 설명하는 모양의 물건은 몇 개인가요?\n${list.map((x) => x.name).join(', ')}`,
        answer: { type: 'num', value: ans, unit: '개' },
        steps: [`두 설명에 모두 맞는 모양은 ${J(SHAPE[kind], '이에요')}.`, `${SHAPE[kind]} 물건: ${list.filter((x) => x.kind === kind).map((x) => x.name).join(', ')}`, `모두 $${ans}$개예요.`],
      };
    },
  },
  {
    id: 'sort-story',
    title: '물건 모양 세기 이야기',
    gen(r, level): ProblemDraft {
      const [p] = names(r, 1);
      const place = r.pick([`${p}네 집 거실`, '교실 사물함', '마트 진열대', `${p}의 장난감 상자`]);
      if (level === 1) {
        const kind = r.pick(ALL3);
        const counts = { box: r.int(1, 3), cyl: r.int(1, 3), ball: r.int(1, 3) } as Record<S3, number>;
        const list = objList(r, counts);
        return {
          q: `${place}에 있는 물건이에요.\n${list.map((x) => x.name).join(', ')}\n이 중에서 ${SHAPE[kind]}인 물건은 몇 개인가요?`,
          answer: { type: 'num', value: counts[kind], unit: '개' },
          steps: [`${SHAPE[kind]}: ${list.filter((x) => x.kind === kind).map((x) => x.name).join(', ')}`, `하나씩 세면 $${counts[kind]}$개예요.`],
        };
      }
      if (level === 2) {
        const conds: [string, S3[]][] = [
          ['평평한 부분이 있는', ['box', 'cyl']],
          ['둥근 부분이 있는', ['cyl', 'ball']],
          ['뾰족한 부분이 있는', ['box']],
          ['평평한 부분이 없는', ['ball']],
          ['어느 쪽으로도 잘 굴러가는', ['ball']],
          ['굴러가지 않는', ['box']],
        ];
        const [cond, ks] = r.pick(conds);
        const counts = { box: r.int(1, 3), cyl: r.int(1, 3), ball: r.int(1, 3) } as Record<S3, number>;
        const list = objList(r, counts);
        const ans = ks.reduce((s, k) => s + counts[k], 0);
        return {
          q: `${place}에 있는 물건이에요.\n${list.map((x) => x.name).join(', ')}\n이 중에서 ${cond} 물건은 몇 개인가요?`,
          answer: { type: 'num', value: ans, unit: '개' },
          steps: [`${cond} 모양은 ${J(ks.map((k) => SHAPE[k]).join('과 '), '이에요')}.`, `${list.filter((x) => ks.includes(x.kind)).map((x) => x.name).join(', ')}`, `모두 $${ans}$개예요.`],
          hint: '먼저 어떤 모양이 그런지 생각해 보세요.',
        };
      }
      const cs = r.shuffle([r.int(3, 4), 2, 1]);
      const counts = { box: cs[0], cyl: cs[1], ball: cs[2] } as Record<S3, number>;
      const list = objList(r, counts);
      const most = r.chance(0.6);
      const target = ALL3.reduce((a, k) => (most ? (counts[k] > counts[a] ? k : a) : counts[k] < counts[a] ? k : a), ALL3[0]);
      return {
        q: `${p}가 집에서 찾은 물건들이에요.\n${list.map((x) => x.name).join(', ')}\n이 물건들을 모양별로 나누었을 때, 물건이 가장 ${most ? '많은' : '적은'} 모양은 무엇인가요?`,
        answer: makeChoices(r, SHAPE[target], ALL3.filter((k) => k !== target).map((k) => SHAPE[k])),
        steps: [...ALL3.map((k) => `${SHAPE[k]}: ${list.filter((x) => x.kind === k).map((x) => x.name).join(', ')} → $${counts[k]}$개`), `가장 ${most ? '많은' : '적은'} 것은 ${J(SHAPE[target], '이에요')}.`],
      };
    },
  },
];

// ───────────────────────── e1a-3 덧셈과 뺄셈
const e1a3: Skill[] = [
  {
    id: 'split-story',
    title: '가르기·모르는 수 이야기',
    gen(r, level): ProblemDraft {
      const [p1, p2] = names(r, 2);
      if (level === 1) {
        const n = r.int(3, 9);
        const a = r.int(1, n - 1);
        const ctx = r.pick([
          [`쿠키 $${n}$개를 두 접시에 나누어 담았어요. 한 접시에 $${a}$개를 담았다면 다른 접시에는 몇 개를 담았나요?`, '개', '쿠키'],
          [`${p1}와 ${p2}가 구슬 $${n}$개를 나누어 가졌어요. ${p1}가 $${a}$개를 가졌다면 ${p2}는 몇 개를 가졌나요?`, '개', '구슬'],
          [`풍선 $${n}$개 중에서 $${a}$개는 빨간색이고 나머지는 노란색이에요. 노란색 풍선은 몇 개인가요?`, '개', '풍선'],
          [`연못에 오리 $${n}$마리가 있어요. 그중 $${a}$마리는 물속에 있고 나머지는 물 밖에 있어요. 물 밖에 있는 오리는 몇 마리인가요?`, '마리', '오리'],
        ] as [string, string, string][]);
        return {
          q: ctx[0],
          answer: { type: 'num', value: n - a, unit: ctx[1] },
          steps: [`$${n}$은 $${a}$와 $\\square$로 가를 수 있어요.`, `$${n}-${a}=${n - a}$ (${ctx[1]})`],
        };
      }
      if (level === 2) {
        const n = r.int(4, 9);
        const a = r.int(1, n - 1);
        const [thing, u] = r.pick(THINGS);
        const forms: [string, string, number, string][] = [
          [`${p1}는 ${thing} $${a}$${u}${jo(u, '를')} 가지고 있었는데, ${p2}에게 몇 ${u}${jo(u, '를')} 더 받았더니 $${n}$${u}${jo(u, '가')} 되었어요. ${p1}가 받은 ${J(thing, '은')} 몇 ${u}인가요?`, u, n - a, `$${a}+\\square=${n}$`],
          [`나뭇가지에 참새가 $${n}$마리 앉아 있었는데, 몇 마리가 날아가서 $${a}$마리가 남았어요. 날아간 참새는 몇 마리인가요?`, '마리', n - a, `$${n}-\\square=${a}$`],
          [`놀이터에 어린이가 몇 명 있었는데 $${n - a}$명이 더 와서 $${n}$명이 되었어요. 처음에 놀이터에 있던 어린이는 몇 명인가요?`, '명', a, `$\\square+${n - a}=${n}$`],
        ];
        const [q, uu, ans, eq] = r.pick(forms);
        return {
          q,
          answer: { type: 'num', value: ans, unit: uu },
          steps: [`모르는 수를 $\\square$로 하여 식을 세워요: ${eq}`, `$${n}$을 가르기 하면 $${ans}$와 $${n - ans}$예요.`, `$\\square=${ans}$ (${uu})`],
          hint: '모르는 수를 □로 놓고 식을 써 보세요.',
        };
      }
      if (r.chance(0.5)) {
        const n = r.int(4, 9);
        const [thing, u] = r.pick(THINGS);
        const pairs = range(1, n - 1).map((x) => `(${x}, ${n - x})`);
        return {
          q: `${p1}와 ${p2}가 ${thing} $${n}$${u}${jo(u, '를')} 나누어 가지려고 해요. 두 사람 모두 적어도 $1$${u}씩은 가진다면, 나누어 가지는 방법은 모두 몇 가지인가요?`,
          answer: { type: 'num', value: n - 1, unit: '가지' },
          steps: [`(${p1}, ${p2})${jo(p2, '으로')} 가르기 해 보면 ${pairs.join(', ')}`, `모두 $${n - 1}$가지예요.`],
          hint: `${p1}가 $1$${u}, $2$${u}, … 가질 때를 차례로 써 보세요.`,
        };
      }
      let n = 0;
      let d = 0;
      do {
        n = r.int(4, 9);
        d = r.int(1, n - 2);
      } while ((n + d) % 2 !== 0);
      const big = (n + d) / 2;
      const small = (n - d) / 2;
      const askBig = r.chance(0.5);
      const [thing, u] = r.pick(THINGS);
      return {
        q: `${p1}와 ${p2}가 가진 ${J(thing, '은')} 모두 $${n}$${J(u, '이에요')}. ${p1}가 ${p2}보다 $${d}$${u} 더 많이 가지고 있다면 ${askBig ? p1 : p2}가 가진 ${J(thing, '은')} 몇 ${u}인가요?`,
        answer: { type: 'num', value: askBig ? big : small, unit: u },
        steps: [`$${n}$을 두 수로 가르기 해 보면서 차가 $${d}$인 것을 찾아요.`, `$${n}$은 $${big}$와 $${small}$로 가를 수 있고, $${big}-${small}=${d}$`, `${p1}는 $${big}$${u}, ${p2}는 $${small}$${u} → 답: $${askBig ? big : small}$${u}`],
        hint: '두 수로 가르기 한 것을 모두 써 보세요.',
      };
    },
  },
];

// ───────────────────────── e1a-4 비교하기
const ATTR: { obj: string; big: string; small: string; bigA: string; smallA: string }[] = [
  { obj: '키', big: '커요', small: '작아요', bigA: '큰', smallA: '작은' },
  { obj: '가방', big: '무거워요', small: '가벼워요', bigA: '무거운', smallA: '가벼운' },
  { obj: '줄넘기 줄', big: '길어요', small: '짧아요', bigA: '긴', smallA: '짧은' },
  { obj: '색종이', big: '넓어요', small: '좁아요', bigA: '넓은', smallA: '좁은' },
  { obj: '연필', big: '길어요', small: '짧아요', bigA: '긴', smallA: '짧은' },
];

function cmpSentence(a: string, b: string, at: (typeof ATTR)[number], bigger: boolean): string {
  const adj = bigger ? at.big : at.small;
  if (at.obj === '키') return `${a}는 ${b}보다 키가 더 ${adj}.`;
  return `${a}의 ${J(at.obj, '은')} ${b}의 ${at.obj}보다 더 ${adj}.`;
}

const e1a4: Skill[] = [
  {
    id: 'order-story',
    title: '누가 가장 ~할까요? (비교 이야기)',
    gen(r, level): ProblemDraft {
      const at = r.pick(ATTR);
      const n = lv(level, 2, 3, 4);
      const ps = names(r, n); // ps[0] 이 가장 큼 … ps[n-1] 가장 작음
      const sents: string[] = [];
      for (let i = 0; i < n - 1; i++) {
        const fwd = level === 1 ? true : r.chance(0.5);
        sents.push(fwd ? cmpSentence(ps[i], ps[i + 1], at, true) : cmpSentence(ps[i + 1], ps[i], at, false));
      }
      const order = level === 3 ? r.shuffle(sents) : sents;
      const most = r.chance(0.5);
      const ans = most ? ps[0] : ps[n - 1];
      const ask = n === 2 ? `더 ${most ? at.bigA : at.smallA}` : `가장 ${most ? at.bigA : at.smallA}`;
      const tail = at.obj === '키' ? `키가 ${ask} 사람은 누구인가요?` : `${J(at.obj, '이')} ${ask} 사람은 누구인가요?`;
      return {
        q: `${order.join(' ')}\n${tail}`,
        answer: nameChoices(r, ans, r.shuffle(ps)),
        steps: [
          `${at.bigA} 쪽부터 차례로 놓아 보면 ${ps.join(' → ')}`,
          `${ask} 사람은 ${J(ans, '이에요')}.`,
        ],
        hint: n > 2 ? '두 사람씩 비교한 것을 이어서 한 줄로 세워 보세요.' : undefined,
      };
    },
  },
  {
    id: 'measure-story',
    title: '재어 본 횟수로 비교하기',
    gen(r, level): ProblemDraft {
      const n = lv(level, 2, 3, 3);
      const ps = names(r, n);
      const cnt = r.sample(range(2, 9), n);
      const inverse = level === 1 ? r.chance(0.5) : level === 3;
      const most = r.chance(0.5);
      if (!inverse) {
        // 같은 컵으로 서로 다른 그릇 채우기 → 많이 부은 그릇이 큼
        const cont = r.sample(['주전자', '물병', '냄비', '어항', '양동이'], n);
        const ix = cnt.indexOf(most ? Math.max(...cnt) : Math.min(...cnt));
        const ask = n === 2 ? `더 ${most ? '많이' : '적게'}` : `가장 ${most ? '많이' : '적게'}`;
        return {
          q: `${ps[0]}가 똑같은 컵으로 물을 부어 그릇을 가득 채웠어요. ${cont.map((c, i) => `${J(c, '은')} $${cnt[i]}$번`).join(', ')} 부었어요. 물이 ${ask} 들어가는 그릇은 무엇인가요?`,
          answer: makeChoices(r, cont[ix], cont.filter((_, i) => i !== ix)),
          steps: ['같은 컵으로 부었으니 많이 부은 그릇일수록 물이 많이 들어가요.', `${ask} 부은 그릇은 ${J(cont[ix], '이에요')}. ($${cnt[ix]}$번)`],
        };
      }
      const cup = r.chance(0.5);
      // 같은 것을 재거나 채울 때 횟수가 적을수록 단위가 큼
      const ix = cnt.indexOf(most ? Math.min(...cnt) : Math.max(...cnt));
      const ask = n === 2 ? '더' : '가장';
      if (cup) {
        return {
          q: `${ps.join(', ')}가 각자 자기 컵으로 똑같은 물통에 물을 가득 채웠어요. ${ps.map((p, i) => `${J(p, '은')} $${cnt[i]}$번`).join(', ')} 부었어요. ${ask} ${most ? '큰' : '작은'} 컵을 가진 사람은 누구인가요?`,
          answer: nameChoices(r, ps[ix], ps),
          steps: ['같은 물통을 채울 때 컵이 클수록 적게 부어도 돼요.', `${n === 2 ? '더' : '가장'} ${most ? '적게' : '많이'} 부은 사람은 ${ps[ix]}($${cnt[ix]}$번)이니 ${ps[ix]}의 컵이 ${ask} ${most ? '커요' : '작아요'}.`],
          hint: '부은 횟수가 많으면 컵이 큰 걸까요, 작은 걸까요?',
        };
      }
      const what = r.pick(['책상의 긴 쪽', '칠판의 긴 쪽', '교실 문의 긴 쪽', '식탁의 긴 쪽']);
      return {
        q: `${ps.join(', ')}가 ${J(what, '을')} 각자 자기 뼘으로 재었어요. ${ps.map((p, i) => `${J(p, '은')} $${cnt[i]}$뼘`).join(', ')}이었어요. 한 뼘의 길이가 ${ask} ${most ? '긴' : '짧은'} 사람은 누구인가요?`,
        answer: nameChoices(r, ps[ix], ps),
        steps: ['같은 길이를 잴 때 뼘이 길수록 잰 횟수가 적어요.', `${n === 2 ? '더' : '가장'} ${most ? '적게' : '많이'} 잰 사람은 ${ps[ix]}($${cnt[ix]}$뼘)이니 ${ps[ix]}의 뼘이 ${ask} ${most ? '길어요' : '짧아요'}.`],
        hint: '잰 횟수가 많으면 뼘이 긴 걸까요, 짧은 걸까요?',
      };
    },
  },
];

// ───────────────────────── e1a-5 50까지의 수
const e1a5: Skill[] = [
  {
    id: 'bundle-story',
    title: '10개씩 묶음 이야기',
    gen(r, level): ProblemDraft {
      const [thing, u] = r.pick(THINGS);
      const [p] = names(r, 1);
      const pack = u === '개' ? r.pick(['봉지', '상자']) : '묶음';
      const [put, putting] = pack === '묶음' ? ['묶었더니', '묶으려고'] : ['담았더니', '담으려고'];
      if (level === 1) {
        const tn = r.int(1, 4);
        const o = r.int(1, 9);
        return {
          q: `${p}는 ${J(thing, '을')} $10$${u}씩 ${pack === '묶음' ? '한 묶음으로' : `한 ${pack}에`} ${put} $${tn}$${pack}${jo(pack, '이')} 되고 $${o}$${u}${jo(u, '가')} 남았어요. ${p}가 가진 ${J(thing, '은')} 모두 몇 ${u}인가요?`,
          answer: { type: 'num', value: tn * 10 + o, unit: u },
          steps: [`$10$${u}씩 $${tn}$${pack} → $${tn * 10}$`, `낱개 $${o}$${u}${jo(u, '와')} 함께 $${tn * 10 + o}$${J(u, '이에요')}.`],
        };
      }
      if (level === 2) {
        const tn = r.int(1, 4);
        const o = r.int(1, 9);
        const n = tn * 10 + o;
        return {
          q: `${thing} $${n}$${u}${jo(u, '를')} $10$${u}씩 ${pack === '묶음' ? '한 묶음으로' : `한 ${pack}에`} ${putting} 해요. 몇 ${pack}${jo(pack, '이')} 되고, 몇 ${u}${jo(u, '가')} 남나요?`,
          answer: { type: 'fields', fields: [{ label: pack, value: tn, unit: pack }, { label: `남는 ${thing}`, value: o, unit: u }] },
          steps: [`$${n}$은 $10$개씩 묶음 $${tn}$개와 낱개 $${o}$개예요.`, `$${tn}$${pack}, 남는 것 $${o}$${u}`],
        };
      }
      if (r.chance(0.5)) {
        const tn = r.int(1, 3);
        const o = r.int(11, Math.min(19, 50 - tn * 10));
        const n = tn * 10 + o;
        return {
          q: `${p}는 색종이를 $10$장씩 묶음 $${tn}$개와 낱장 $${o}$장을 가지고 있어요. ${p}가 가진 색종이는 모두 몇 장인가요?`,
          answer: { type: 'num', value: n, unit: '장' },
          steps: [`낱장 $${o}$장은 $10$장씩 묶음 $1$개와 낱장 $${o - 10}$장이에요.`, `$10$장씩 묶음 $${tn + 1}$개와 낱장 $${o - 10}$장 → $${n}$장`],
          hint: '낱장이 10장보다 많으면 10장을 한 묶음으로 만들어요.',
        };
      }
      const tn = r.int(2, 5);
      const n = tn * 10 - r.int(1, 7);
      return {
        q: `${p}는 구슬 $${n}$개를 가지고 있어요. 구슬을 $10$개씩 묶음 $${tn}$개로 만들려면 구슬이 몇 개 더 있어야 하나요?`,
        answer: { type: 'num', value: tn * 10 - n, unit: '개' },
        steps: [`$10$개씩 묶음 $${tn}$개는 $${tn * 10}$개예요.`, `$${n}$에서 $${tn * 10}$까지 이어 세면 ${range(n + 1, tn * 10).map((x) => `$${x}$`).join(', ')}`, `$${tn * 10 - n}$개 더 있어야 해요.`],
      };
    },
  },
  {
    id: 'compare-story',
    title: '50까지의 수 비교 이야기',
    gen(r, level): ProblemDraft {
      const ps = names(r, 3);
      if (level === 1) {
        const [a, b] = r.sample(range(11, 50), 2);
        const [thing, u] = r.pick(THINGS);
        const most = r.chance(0.5);
        const ans = (a > b) === most ? ps[0] : ps[1];
        return {
          q: `${ps[0]}는 ${thing} $${a}$${u}, ${ps[1]}는 $${b}$${u}${jo(u, '를')} 모았어요. ${thing}를 더 ${most ? '많이' : '적게'} 모은 사람은 누구인가요?`,
          answer: nameChoices(r, ans, ps.slice(0, 2)),
          steps: [`$10$개씩 묶음의 수를 먼저 비교하고, 같으면 낱개의 수를 비교해요.`, `$${Math.max(a, b)}>${Math.min(a, b)}$ → 더 ${most ? '많이' : '적게'} 모은 사람은 ${J(ans, '이에요')}.`],
        };
      }
      if (level === 2) {
        const a = r.int(11, 42);
        const b = a + r.int(3, 8);
        const ctx = r.pick([
          [`${ps[0]}의 사물함은 $${a}$번이고, ${ps[1]}의 사물함은 $${b}$번이에요. 두 사물함 사이에 있는 사물함은 몇 개인가요?`, '개'],
          [`은행에서 ${ps[0]}는 $${a}$번 번호표를, ${ps[1]}는 $${b}$번 번호표를 뽑았어요. 두 사람 사이에 있는 번호표는 몇 장인가요?`, '장'],
          [`책의 $${a}$쪽과 $${b}$쪽 사이에는 몇 쪽이 있나요?`, '쪽'],
        ]);
        return {
          q: ctx[0],
          answer: { type: 'num', value: b - a - 1, unit: ctx[1] },
          steps: [`$${a}$와 $${b}$ 사이의 수: ${range(a + 1, b - 1).map((x) => `$${x}$`).join(', ')}`, `$${a}$와 $${b}$는 빼고 세면 $${b - a - 1}$${J(ctx[1], '이에요')}.`],
          hint: '두 수는 넣지 않고 사이에 있는 수만 세어요.',
        };
      }
      let A: [number, number];
      let B: [number, number];
      let va: number, vb: number;
      do {
        A = [r.int(1, 3), r.int(11, 16)];
        B = [r.int(2, 4), r.int(1, 9)];
        va = A[0] * 10 + A[1];
        vb = B[0] * 10 + B[1];
      } while (va === vb || va > 50 || vb > 50);
      const most = r.chance(0.5);
      const ans = (va > vb) === most ? ps[0] : ps[1];
      return {
        q: `${ps[0]}는 딱지를 $10$장씩 묶음 $${A[0]}$개와 낱장 $${A[1]}$장, ${ps[1]}는 $10$장씩 묶음 $${B[0]}$개와 낱장 $${B[1]}$장 가지고 있어요. 딱지를 더 ${most ? '많이' : '적게'} 가진 사람은 누구인가요?`,
        answer: nameChoices(r, ans, ps.slice(0, 2)),
        steps: [`${ps[0]}: 낱장 $${A[1]}$장 = $10$장씩 묶음 $1$개와 낱장 $${A[1] - 10}$장 → $${va}$장`, `${ps[1]}: $${vb}$장`, `$${Math.max(va, vb)}>${Math.min(va, vb)}$ → ${ans}`],
        hint: '낱장이 10장보다 많은지 먼저 살펴보세요.',
      };
    },
  },
];

// ───────────────────────── e1b-1 100까지의 수
const e1b1: Skill[] = [
  {
    id: 'bundle-story',
    title: '100까지의 수 묶음 이야기',
    gen(r, level): ProblemDraft {
      const [p] = names(r, 1);
      const ctxs: [string, string, string][] = [
        ['귤', '개', '상자'],
        ['달걀', '개', '줄'],
        ['색연필', '자루', '통'],
        ['딸기', '개', '팩'],
        ['스티커', '장', '묶음'],
        ['밤', '개', '봉지'],
      ];
      const [thing, u, pack] = r.pick(ctxs);
      const iga = jo(pack, '이');
      if (level === 1) {
        const tn = r.int(5, 9);
        const o = r.int(0, 9);
        return {
          q: `가게에 ${J(thing, '이')} $10$${u}씩 $${tn}$${pack}${o ? `${jo(pack, '와')} 낱개 $${o}$${u}` : ''} 있어요. ${J(thing, '은')} 모두 몇 ${u}인가요?`,
          answer: { type: 'num', value: tn * 10 + o, unit: u },
          steps: [`$10$${u}씩 $${tn}$${pack} → $${tn * 10}$`, o ? `$${tn * 10}$과 $${o}$ → $${tn * 10 + o}$${u}` : `$${tn * 10}$${u}`],
        };
      }
      if (level === 2) {
        const tn = r.int(5, 9);
        const o = r.int(1, 9);
        const n = tn * 10 + o;
        return {
          q: `${p}네 가게에 ${J(thing, '이')} $${n}$${u} 있어요. $10$${u}씩 ${pack === '묶음' ? '묶으면' : `한 ${pack}에 담으면`} 몇 ${pack}${iga} 되고, 몇 ${u}${jo(u, '가')} 남나요?`,
          answer: { type: 'fields', fields: [{ label: pack, value: tn, unit: pack }, { label: '남는 것', value: o, unit: u }] },
          steps: [`$${n}$은 $10$개씩 묶음 $${tn}$개와 낱개 $${o}$개예요.`, `$${tn}$${pack}${iga} 되고 $${o}$${u}${jo(u, '가')} 남아요.`],
        };
      }
      if (r.chance(0.5)) {
        const tn = r.int(4, 7);
        const o = r.int(12, Math.min(29, 99 - tn * 10));
        const n = tn * 10 + o;
        return {
          q: `${p}네 집에는 ${J(thing, '이')} $10$${u}씩 $${tn}$${pack} 있고, 낱개로 $${o}$${u}${jo(u, '가')} 더 있어요. ${p}가 가진 ${J(thing, '은')} 모두 몇 ${u}인가요?`,
          answer: { type: 'num', value: n, unit: u },
          steps: [`낱개 $${o}$${u}${jo(u, '는')} $10$개씩 묶음 $${Math.floor(o / 10)}$개와 낱개 $${o % 10}$개예요.`, `$10$개씩 묶음 $${tn + Math.floor(o / 10)}$개와 낱개 $${o % 10}$개 → $${n}$${u}`],
          hint: '낱개가 10개보다 많으면 10개씩 묶어 보세요.',
        };
      }
      const n = r.int(90, 98);
      return {
        q: `${p}는 줄넘기를 $${n}$번 넘었어요. $100$번을 채우려면 몇 번을 더 넘어야 하나요?`,
        answer: { type: 'num', value: 100 - n, unit: '번' },
        steps: [`$99$보다 $1$만큼 더 큰 수가 $100$이에요.`, `$${n}$에서 $100$까지 이어 세면 ${range(n + 1, 100).map((x) => `$${x}$`).join(', ')}`, `$${100 - n}$번 더 넘어야 해요.`],
      };
    },
  },
  {
    id: 'order-story',
    title: '수의 순서·짝수 홀수 이야기',
    gen(r, level): ProblemDraft {
      const [p1, p2] = names(r, 2);
      if (level === 1) {
        const n = r.int(51, 98);
        const after = r.chance(0.5);
        const ctx = r.pick(['번호표', '사물함', '좌석']);
        const q =
          ctx === '번호표'
            ? `은행에서 ${p1}는 $${n}$번 번호표를 뽑았어요. ${p1} 바로 ${after ? '다음' : '앞'} 사람의 번호는 몇 번인가요?`
            : ctx === '사물함'
              ? `${p1}의 사물함은 $${n}$번이에요. ${p2}의 사물함은 ${p1}의 사물함 바로 ${after ? '뒤' : '앞'} 번호예요. ${p2}의 사물함은 몇 번인가요?`
              : `공연장에서 ${p1}는 $${n}$번 자리에 앉았어요. ${p2}는 ${p1} 바로 ${after ? '다음' : '앞'} 번호 자리에 앉았어요. ${p2}의 자리는 몇 번인가요?`;
        return {
          q,
          answer: { type: 'num', value: after ? n + 1 : n - 1, unit: '번' },
          steps: [after ? '바로 다음 수는 $1$만큼 더 큰 수예요.' : '바로 앞의 수는 $1$만큼 더 작은 수예요.', `$${n}$ → $${after ? n + 1 : n - 1}$`],
        };
      }
      if (level === 2) {
        const a = r.int(50, 90);
        const b = a + r.int(3, 9);
        const [p3] = names(r, 3).filter((x) => x !== p1 && x !== p2);
        return {
          q: `줄넘기 시합에서 ${p1}는 $${a}$번, ${p2}는 $${b}$번 넘었어요. ${p3}는 ${p1}보다 많이, ${p2}보다 적게 넘었어요. ${p3}가 넘었을 수 있는 횟수는 모두 몇 가지인가요?`,
          answer: { type: 'num', value: b - a - 1, unit: '가지' },
          steps: [`$${a}$보다 크고 $${b}$보다 작은 수: ${range(a + 1, b - 1).map((x) => `$${x}$`).join(', ')}`, `$${b - a - 1}$가지예요.`],
          hint: '두 수는 빼고 사이에 있는 수만 세어요.',
        };
      }
      const a = r.int(50, 85);
      const b = a + r.int(6, 12);
      const even = r.chance(0.5);
      const list = range(a, b).filter((x) => (x % 2 === 0) === even);
      const ctx = r.pick([
        [`$${a}$번부터 $${b}$번까지의 사물함 중에서 번호가 ${even ? '짝수' : '홀수'}인 사물함은 몇 개인가요?`, '개'],
        [`학급 문고의 책에 $${a}$번부터 $${b}$번까지 번호가 붙어 있어요. 이 중에서 번호가 ${even ? '짝수' : '홀수'}인 책은 몇 권인가요?`, '권'],
      ]);
      return {
        q: ctx[0],
        answer: { type: 'num', value: list.length, unit: ctx[1] },
        steps: [`${even ? '짝수는 낱개의 수가 $0, 2, 4, 6, 8$' : '홀수는 낱개의 수가 $1, 3, 5, 7, 9$'}인 수예요.`, `${list.map((x) => `$${x}$`).join(', ')}`, `모두 $${list.length}$${J(ctx[1], '이에요')}.`],
        hint: '두 수도 넣어서 세어요.',
      };
    },
  },
];

// ───────────────────────── e1b-2 덧셈과 뺄셈(1)
function noCarry(test: (a: number, b: number) => boolean, gen: () => [number, number]): [number, number] {
  for (let i = 0; i < 300; i++) {
    const [a, b] = gen();
    if (test(a, b)) return [a, b];
  }
  return [21, 13];
}
const ones = (x: number) => x % 10;
const tens = (x: number) => Math.floor(x / 10);

const e1b2: Skill[] = [
  {
    id: 'more-less-story',
    title: '모두·더 필요한 수·~보다 많은 수 이야기',
    gen(r, level): ProblemDraft {
      const [p1, p2] = names(r, 2);
      if (level === 1) {
        const [a, b] = noCarry((x, y) => ones(x) + ones(y) < 10 && x + y <= 99, () => [r.int(20, 65), r.chance(0.5) ? r.int(1, 8) : r.int(11, 34)]);
        const ctx = r.pick([
          [`농장에 닭이 $${a}$마리, 오리가 $${b}$마리 있어요. 닭과 오리는 모두 몇 마리인가요?`, '마리'],
          [`과일 가게에 사과가 $${a}$개, 배가 $${b}$개 있어요. 사과와 배는 모두 몇 개인가요?`, '개'],
          [`도서관에 남학생이 $${a}$명, 여학생이 $${b}$명 있어요. 도서관에 있는 학생은 모두 몇 명인가요?`, '명'],
        ]);
        return {
          q: ctx[0],
          answer: { type: 'num', value: a + b, unit: ctx[1] },
          steps: ['모두 몇인지 구하니까 덧셈이에요.', `낱개끼리, $10$개씩 묶음끼리 더해요: $${a}+${b}=${a + b}$ (${ctx[1]})`],
        };
      }
      if (level === 2) {
        const [a, b] = noCarry((x, y) => ones(x) >= ones(y) && x > y, () => [r.int(30, 99), r.int(11, 60)]);
        const ctx = r.pick([
          [`${p1}는 줄넘기를 $${a}$번 넘기로 했어요. 지금까지 $${b}$번 넘었다면 몇 번을 더 넘어야 하나요?`, '번'],
          [`${p2}는 $${a}$쪽짜리 동화책을 $${b}$쪽까지 읽었어요. 다 읽으려면 몇 쪽을 더 읽어야 하나요?`, '쪽'],
          [`색종이 $${a}$장으로 종이학을 접으려고 해요. 지금까지 $${b}$장을 썼다면 남은 색종이는 몇 장인가요?`, '장'],
        ]);
        return {
          q: ctx[0],
          answer: { type: 'num', value: a - b, unit: ctx[1] },
          steps: ['전체에서 한 것만큼 빼요.', `$${a}-${b}=${a - b}$ (${ctx[1]})`],
        };
      }
      const more = r.chance(0.5);
      const [a, d] = noCarry(
        (x, y) => {
          const b = more ? x + y : x - y;
          if (b <= 0 || b > 99) return false;
          if (more) return ones(x) + ones(y) < 10 && ones(x) + ones(b) < 10 && tens(x) + tens(b) < 10;
          return ones(x) >= ones(y) && ones(x) + ones(b) < 10 && tens(x) + tens(b) < 10;
        },
        () => [r.int(12, 45), r.int(2, 23)],
      );
      const b = more ? a + d : a - d;
      const [thing, u] = r.pick(THINGS);
      return {
        q: `${p1}는 ${thing} $${a}$${u}${jo(u, '를')} 가지고 있고, ${p2}는 ${p1}보다 $${d}$${u} 더 ${more ? '많이' : '적게'} 가지고 있어요. 두 사람이 가진 ${J(thing, '은')} 모두 몇 ${u}인가요?`,
        answer: { type: 'num', value: a + b, unit: u },
        steps: [`${p2}가 가진 것: $${a}${more ? '+' : '-'}${d}=${b}$`, `두 사람이 가진 것: $${a}+${b}=${a + b}$ (${u})`],
        hint: `먼저 ${p2}가 가진 수를 구하세요.`,
      };
    },
  },
];

// ───────────────────────── e1b-3 모양과 시각
const FLATOBJ: Record<'sq' | 'tri' | 'cir', string[]> = {
  sq: ['액자', '공책', '창문', '칠판', '손수건', '수첩'],
  tri: ['삼각김밥', '트라이앵글', '삼각자', '양보 표지판', '샌드위치 한 조각'],
  cir: ['동전', '접시', '단추', '둥근 거울', 'CD', '피자 한 판'],
};
const FLATNM = { sq: '■ 모양', tri: '▲ 모양', cir: '● 모양' } as const;
const CORN = { sq: 4, tri: 3, cir: 0 } as const;

const e1b3: Skill[] = [
  {
    id: 'clock-story',
    title: '시각 이야기 문제',
    gen(r, level): ProblemDraft {
      const ps = names(r, 3);
      if (level === 1) {
        let A: [number, number], B: [number, number];
        do {
          A = [r.int(1, 6), r.pick([0, 30])];
          B = [r.int(1, 6), r.pick([0, 30])];
        } while (A[0] * 60 + A[1] === B[0] * 60 + B[1]);
        const early = r.chance(0.5);
        const ma = A[0] * 60 + A[1];
        const mb = B[0] * 60 + B[1];
        const ans = (ma < mb) === early ? ps[0] : ps[1];
        const [act, actA] = r.pick([
          ['놀이터에 도착했어요', '놀이터에 도착한'],
          ['도서관에 갔어요', '도서관에 간'],
          ['숙제를 시작했어요', '숙제를 시작한'],
          ['간식을 먹었어요', '간식을 먹은'],
        ] as [string, string][]);
        return {
          q: `토요일 오후에 ${J(ps[0], '은')} ${t(A[0], A[1])}에, ${J(ps[1], '은')} ${t(B[0], B[1])}에 ${act}. 더 ${early ? '먼저' : '나중에'} ${actA} 사람은 누구인가요?`,
          answer: nameChoices(r, ans, ps.slice(0, 2)),
          steps: [`${t(A[0], A[1])}와 ${t(B[0], B[1])}를 비교해요.`, `더 ${early ? '이른' : '늦은'} 시각은 ${(ma < mb) === early ? t(A[0], A[1]) : t(B[0], B[1])}이니 ${J(ans, '이에요')}.`],
        };
      }
      if (level === 2) {
        const h = r.int(1, 11);
        const half = r.chance(0.6);
        const nx = h + 1;
        const act = r.pick(['공원에 도착했을 때', '저녁을 먹기 시작할 때', '피아노 학원에 들어갈 때', '집에 돌아왔을 때']);
        return {
          q: `${ps[0]}가 ${act} 시계를 보았더니 짧은바늘은 ${half ? `$${h}$와 $${nx}$의 가운데를` : `$${h}$를`}, 긴바늘은 $${half ? 6 : 12}$를 가리키고 있었어요. 이때 시각은 몇 시 몇 분인가요?`,
          answer: { type: 'fields', fields: [{ label: '시', value: h }, { label: '분', value: half ? 30 : 0 }] },
          steps: [half ? '긴바늘이 $6$을 가리키면 "몇 시 30분"이에요.' : '긴바늘이 $12$를 가리키면 "몇 시"예요.', half ? `짧은바늘은 지나온 숫자 $${h}$를 읽어요 → $${h}$시 $30$분` : `짧은바늘이 $${h}$ → $${h}$시 $0$분`],
        };
      }
      const times: number[] = r.sample(range(2, 13), 3).map((x) => x); // 반 시간 단위: 1시 ~ 6시 30분
      const tm = times.map((x) => [Math.floor(x / 2), (x % 2) * 30] as [number, number]);
      const last = r.chance(0.5);
      const sorted = [...times].sort((a, b) => a - b);
      const pickIx = r.chance(0.5) ? (last ? 2 : 0) : 1;
      const target = sorted[pickIx];
      const ans = ps[times.indexOf(target)];
      const ask = pickIx === 1 ? '둘째로' : last ? '가장 늦게' : '가장 먼저';
      return {
        q: `세 친구가 학교 앞 문구점에 도착한 시각을 시계로 나타냈어요. (왼쪽부터 ${ps.join(', ')}) ${ask} 도착한 사람은 누구인가요?`,
        fig: hstack(tm.map(([h, m]) => clock(h, m, 110))),
        answer: nameChoices(r, ans, ps),
        steps: [`${ps.map((p, i) => `${p} ${t(tm[i][0], tm[i][1])}`).join(', ')}`, `이른 시각부터 차례로: ${sorted.map((x) => ps[times.indexOf(x)]).join(' → ')}`, `${ask} 도착한 사람은 ${J(ans, '이에요')}.`],
        hint: '먼저 세 시계의 시각을 읽어 보세요.',
      };
    },
  },
  {
    id: 'shape-story',
    title: '■▲● 모양 이야기',
    gen(r, level): ProblemDraft {
      const [p] = names(r, 1);
      const K = ['sq', 'tri', 'cir'] as const;
      if (level === 1) {
        const kind = r.pick(K);
        const CL = {
          sq: ['뾰족한 곳이 $4$군데 있고 곧은 선으로 둘러싸여 있어요', '곧은 선이 $4$개 있어요'],
          tri: ['뾰족한 곳이 $3$군데 있어요', '곧은 선이 $3$개 있어요'],
          cir: ['곧은 선도 뾰족한 곳도 없고 둥글어요', '어느 곳도 뾰족하지 않고 둥글어요'],
        };
        const right = r.pick(FLATOBJ[kind]);
        const others = K.filter((k) => k !== kind);
        return {
          q: `${p}가 본뜬 물건의 모양을 설명하고 있어요.\n"${r.pick(CL[kind])}."\n${p}가 본뜬 물건은 무엇일까요?`,
          answer: makeChoices(r, right, [...r.sample(FLATOBJ[others[0]], 2), ...r.sample(FLATOBJ[others[1]], 2)], 4),
          steps: [`설명에 맞는 모양은 ${J(FLATNM[kind], '이에요')}.`, `${FLATNM[kind]}인 물건은 ${J(right, '이에요')}.`],
        };
      }
      const c = level === 2 ? { sq: r.int(0, 2), tri: r.int(0, 2), cir: 0 } : { sq: r.int(1, 2), tri: r.int(1, 3), cir: r.int(1, 3) };
      if (c.sq + c.tri === 0) c.tri = 1;
      if (level === 2 && c.sq + c.tri === 1) c.sq += 1;
      const total = c.sq * 4 + c.tri * 3;
      const used = K.filter((k) => c[k] > 0);
      const what = r.pick(['로봇', '집', '기차', '꽃']);
      const parts: string[] = [];
      for (const k of used) for (let i = 0; i < c[k]; i++) parts.push(String(CORN[k]));
      return {
        q: `${p}는 ${used.map((k) => `${FLATNM[k]} $${c[k]}$개`).join(', ')}를 붙여서 ${J(what, '을')} 꾸몄어요. 사용한 모양들의 뾰족한 곳은 모두 몇 군데인가요?`,
        answer: { type: 'num', value: total, unit: '군데' },
        steps: [`■ 모양은 $4$군데, ▲ 모양은 $3$군데 뾰족하고, ● 모양은 뾰족한 곳이 없어요.`, `$${parts.join('+')}=${total}$ (군데)`],
        hint: level === 3 ? '● 모양에도 뾰족한 곳이 있을까요?' : undefined,
      };
    },
  },
];

// ───────────────────────── e1b-4 덧셈과 뺄셈(2)
const e1b4: Skill[] = [
  {
    id: 'ten-story',
    title: '10을 이용한 이야기 문제',
    gen(r, level): ProblemDraft {
      const [p1, p2, p3] = names(r, 3);
      const [thing, u] = r.pick(THINGS);
      if (level === 1) {
        const a = r.int(1, 9);
        const act = EDIBLE.includes(thing) ? '먹었어요' : '친구에게 주었어요';
        return {
          q: `${p1}는 ${thing} $10$${u}${jo(u, '를')} 가지고 있었어요. 그중 $${a}$${u}${jo(u, '를')} ${act}. 남은 ${J(thing, '은')} 몇 ${u}인가요?`,
          answer: { type: 'num', value: 10 - a, unit: u },
          steps: ['남은 것을 구하니까 뺄셈이에요.', `$10-${a}=${10 - a}$ (${u})`],
        };
      }
      if (level === 2) {
        const a = r.int(1, 9);
        if (r.chance(0.5))
          return {
            q: `${p1}는 칭찬 붙임딱지를 $${a}$장 모았어요. $10$장을 모으면 선물을 받을 수 있어요. 몇 장을 더 모아야 하나요?`,
            answer: { type: 'num', value: 10 - a, unit: '장' },
            steps: [`$${a}+\\square=10$`, `$${a}$와 더해서 $10$이 되는 수는 $${10 - a}$예요.`],
          };
        return {
          q: `달걀 $10$개가 들어가는 달걀판에 달걀이 $${a}$개 들어 있어요. 달걀판을 가득 채우려면 달걀이 몇 개 더 있어야 하나요?`,
          answer: { type: 'num', value: 10 - a, unit: '개' },
          steps: [`$${a}+\\square=10$`, `$${a}$와 더해서 $10$이 되는 수는 $${10 - a}$예요.`],
        };
      }
      if (r.chance(0.5)) {
        const a = r.int(2, 8);
        const b = r.int(1, 9);
        return {
          q: `${p1}는 딱지 $10$장 중에서 $${a}$장을 ${p2}에게 주었어요. 그다음 ${p3}에게 딱지 $${b}$장을 받았어요. 지금 ${p1}가 가진 딱지는 몇 장인가요?`,
          answer: { type: 'num', value: 10 - a + b, unit: '장' },
          steps: [`준 것은 빼요: $10-${a}=${10 - a}$`, `받은 것은 더해요: $${10 - a}+${b}=${10 - a + b}$ (장)`],
        };
      }
      const a = r.int(1, 7);
      const b = r.int(1, 8 - a);
      return {
        q: `${thing} $10$${u}${jo(u, '를')} ${p1}, ${p2}, ${p3}가 모두 나누어 가졌어요. ${p1}는 $${a}$${u}, ${p2}는 $${b}$${u}${jo(u, '를')} 가졌다면 ${p3}는 몇 ${u}${jo(u, '를')} 가졌나요?`,
        answer: { type: 'num', value: 10 - a - b, unit: u },
        steps: [`$10-${a}-${b}$`, `$=${10 - a}-${b}=${10 - a - b}$ (${u})`],
        hint: '10에서 두 사람이 가진 것을 차례로 빼요.',
      };
    },
  },
];

// ───────────────────────── e1b-5 규칙 찾기
const PAT_CTX: { lead: (p: string) => string; items: string[]; u: string; noun: string }[] = [
  { lead: (p) => `${p}는 구슬을`, items: ['빨간 구슬', '파란 구슬', '노란 구슬'], u: '개', noun: '구슬' },
  { lead: (p) => `${p}는 꼬치에 과일을`, items: ['딸기', '포도', '귤'], u: '개', noun: '과일' },
  { lead: () => `운동장에 깃발을`, items: ['빨간 깃발', '파란 깃발', '초록 깃발'], u: '개', noun: '깃발' },
  { lead: (p) => `${p}는 화단에 꽃을`, items: ['장미', '튤립', '국화'], u: '송이', noun: '꽃' },
];

const e1b5: Skill[] = [
  {
    id: 'pattern-story',
    title: '생활 속 무늬 규칙 이야기',
    gen(r, level): ProblemDraft {
      const [p] = names(r, 1);
      const c = r.pick(PAT_CTX);
      const unitPat: number[] = level === 1 ? [0, 1] : r.pick([[0, 1, 1], [0, 0, 1], [0, 1, 2], [0, 1, 1, 2]]);
      const items = r.shuffle(c.items);
      const L = unitPat.length;
      const seq = (n: number) => range(0, n - 1).map((i) => items[unitPat[i % L]]);
      const verb = c.noun === '꽃' ? '심었어요' : c.noun === '깃발' ? '꽂았어요' : '꿰었어요';
      const lead = `${c.lead(p)} ${seq(L * 2).join(', ')}, … 의 순서로 되풀이하여 ${verb}`;
      const uniq = [...new Set(unitPat)].map((k) => items[k]);
      if (level < 3) {
        const k = level === 1 ? r.int(L * 2 + 1, L * 2 + 3) : r.int(8, 12);
        const ans = items[unitPat[(k - 1) % L]];
        return {
          q: `${lead}. ${ORDS[k]}에 오는 것은 무엇인가요?`,
          answer: makeChoices(r, ans, uniq.concat(items).filter((x) => x !== ans), Math.min(4, new Set(items).size)),
          steps: [`${J(seq(L).join(', '), '이')} 되풀이돼요. ($${L}$개씩 한 묶음)`, `이어서 써 보면 ${seq(k).join(', ')}`, `${ORDS[k]}는 ${J(ans, '이에요')}.`],
          hint: '되풀이되는 부분에 선을 그어 보세요.',
        };
      }
      const n = r.int(9, 12);
      const kIx = r.pick([...new Set(unitPat)]);
      const s = seq(n);
      const cnt = s.filter((x) => x === items[kIx]).length;
      return {
        q: `${lead}. 처음부터 $${n}$${c.u}${jo(c.u, '를')} 놓았을 때 ${J(items[kIx], '은')} 모두 몇 ${c.u}인가요?`.replace('놓았을', verb.replace('었어요', '었을').replace('았어요', '았을')),
        answer: { type: 'num', value: cnt, unit: c.u },
        steps: [`${J(seq(L).join(', '), '이')} 되풀이돼요.`, `$${n}$${c.u}${jo(c.u, '를')} 차례로 쓰면 ${s.join(', ')}`, `${J(items[kIx], '을')} 세면 $${cnt}$${J(c.u, '이에요')}.`],
      };
    },
  },
  {
    id: 'number-story',
    title: '수 규칙 이야기',
    gen(r, level): ProblemDraft {
      const [p] = names(r, 1);
      const d = level === 1 ? r.pick([2, 5, 10]) : r.pick([2, 3, 4, 5, 10]);
      const ctx = r.pick([
        { what: '줄넘기를', u: '번', verb: '넘어요', ask: '넘나요' },
        { what: '동화책을', u: '쪽', verb: '읽어요', ask: '읽나요' },
        { what: '칭찬 붙임딱지를', u: '장', verb: '모아요', ask: '모으나요' },
        { what: '종이학을', u: '개', verb: '접어요', ask: '접나요' },
      ]);
      if (level < 3) {
        const down = level === 2 && r.chance(0.4);
        const k = level === 1 ? 4 : r.int(5, 6);
        const s = down ? d * (k - 1) + r.int(5, 40) : r.int(1, 20);
        const v = (i: number) => (down ? s - d * (i - 1) : s + d * (i - 1));
        if (down) {
          return {
            q: `사탕 $${s}$개가 있어요. ${p}는 날마다 사탕을 $${d}$개씩 먹어요. 첫째 날 먹고 남은 사탕은 $${v(2)}$개, 둘째 날 먹고 남은 사탕은 $${v(3)}$개예요. ${ORDS[k - 1]} 날 먹고 남은 사탕은 몇 개인가요?`,
            answer: { type: 'num', value: v(k), unit: '개' },
            steps: [`$${d}$씩 작아지는 규칙이에요.`, `${range(1, k).map((i) => `$${v(i)}$`).join(' → ')}`, `$${v(k)}$개`],
          };
        }
        return {
          q: `${p}는 ${ctx.what} 첫째 날 $${v(1)}$${ctx.u}, 둘째 날 $${v(2)}$${ctx.u}, 셋째 날 $${v(3)}$${ctx.u}, … 처럼 날마다 $${d}$${ctx.u}씩 늘려서 ${ctx.verb}. ${ORDS[k]} 날에는 몇 ${ctx.u}${jo(ctx.u, '를')} ${ctx.ask}?`,
          answer: { type: 'num', value: v(k), unit: ctx.u },
          steps: [`$${d}$씩 커지는 규칙이에요.`, `${range(1, k).map((i) => `$${v(i)}$`).join(' → ')}`, `${ORDS[k]} 날: $${v(k)}$${ctx.u}`],
        };
      }
      // 처음으로 목표에 도달하는 날 (모은 수가 쌓임)
      const s = r.int(1, 9);
      const k = r.int(5, 9);
      const goal = s + d * k;
      return {
        q: `${p}의 저금통에는 지금 $10$원짜리 동전이 $${s}$개 있어요. 내일부터 날마다 $10$원짜리 동전을 $${d}$개씩 넣는다면, 동전이 $${goal}$개가 되는 것은 며칠 뒤인가요?`,
        answer: { type: 'num', value: k, unit: '일' },
        steps: [`$${d}$씩 뛰어 세어요.`, `${range(0, k).map((i) => `$${s + d * i}$`).join(' → ')}`, `$${k}$번 뛰어 세었으니 $${k}$일 뒤예요.`],
        hint: `$${s}$부터 $${d}$씩 뛰어 세어 보세요.`,
      };
    },
  },
];

// ───────────────────────── e1b-6 덧셈과 뺄셈(3)
const e1b6: Skill[] = [
  {
    id: 'diff-story',
    title: '차와 더 많은 수 이야기',
    gen(r, level): ProblemDraft {
      const [p1, p2, p3] = names(r, 3);
      if (level === 1) {
        const a = r.int(11, 18);
        const b = r.int(a - 9, 9);
        const ctx = r.pick([
          [`${p1}는 제기차기를 $${a}$번, ${p2}는 $${b}$번 했어요. ${p1}는 ${p2}보다 몇 번 더 많이 했나요?`, '번'],
          [`어항에 금붕어가 $${a}$마리, 열대어가 $${b}$마리 있어요. 금붕어는 열대어보다 몇 마리 더 많나요?`, '마리'],
          [`꽃밭에 장미가 $${a}$송이, 튤립이 $${b}$송이 피었어요. 장미는 튤립보다 몇 송이 더 많나요?`, '송이'],
        ]);
        return {
          q: ctx[0],
          answer: { type: 'num', value: a - b, unit: ctx[1] },
          steps: ['몇 더 많은지 구하니까 뺄셈이에요.', `$${a}$를 $10$과 $${a - 10}$으로 가르기 해요: $10-${b}=${10 - b}$, $${10 - b}+${a - 10}=${a - b}$`, `$${a}-${b}=${a - b}$ (${ctx[1]})`],
        };
      }
      if (level === 2) {
        const goal = r.int(11, 18);
        const now = r.int(goal - 9, 9);
        const ctx = r.pick([
          [`${p1}네 반은 화분 $${goal}$개를 꾸미기로 했어요. 지금까지 $${now}$개를 꾸몄다면 몇 개를 더 꾸며야 하나요?`, '개'],
          [`버스 좌석이 $${goal}$개 있어요. 지금 $${now}$명이 앉아 있다면 몇 명이 더 앉을 수 있나요?`, '명'],
          [`${p2}는 동요 $${goal}$곡을 외우기로 했어요. $${now}$곡을 외웠다면 몇 곡을 더 외워야 하나요?`, '곡'],
        ]);
        return {
          q: ctx[0],
          answer: { type: 'num', value: goal - now, unit: ctx[1] },
          steps: [`$${now}+\\square=${goal}$ 또는 $${goal}-${now}=\\square$`, `$${goal}-${now}=${goal - now}$ (${ctx[1]})`],
        };
      }
      const a = r.int(4, 9);
      const b = r.int(11 - a, 9);
      const s = a + b;
      let c = r.int(s - 9, 9);
      if (c === b) c = c === 9 ? c - 1 : c + 1;
      const [thing, u] = r.pick(THINGS);
      return {
        q: `${p1}는 ${thing} $${a}$${u}${jo(u, '를')} 가지고 있어요. ${p2}는 ${p1}보다 $${b}$${u} 더 많이 가지고 있고, ${p3}는 ${p2}보다 $${c}$${u} 더 적게 가지고 있어요. ${p3}가 가진 ${J(thing, '은')} 몇 ${u}인가요?`,
        answer: { type: 'num', value: s - c, unit: u },
        steps: [`${p2}: $${a}+${b}=${s}$`, `${p3}: $${s}-${c}=${s - c}$ (${u})`],
        hint: `먼저 ${p2}가 가진 수를 구하세요.`,
      };
    },
  },
];

export const WORDS_1: Record<string, Skill[]> = {
  'e1a-1': e1a1,
  'e1a-2': e1a2,
  'e1a-3': e1a3,
  'e1a-4': e1a4,
  'e1a-5': e1a5,
  'e1b-1': e1b1,
  'e1b-2': e1b2,
  'e1b-3': e1b3,
  'e1b-4': e1b4,
  'e1b-5': e1b5,
  'e1b-6': e1b6,
};

