// 초1·2 공통 도우미: 이름, 조사, 수 읽기, 보기 만들기
import type { Rng } from '../../core/rng';
import { makeChoices } from '../../core/tex';

export const NAMES = ['민수', '서연', '지호', '하은', '도윤', '수아', '준서', '지아', '예준', '유나', '시우', '하린', '건우', '소율', '우진', '채원'];

export function names(r: Rng, k: number): string[] {
  return r.sample(NAMES, k);
}

const DIGIT_B = [true, true, false, true, false, false, true, true, true, false]; // 영 일 이 삼 사 오 육 칠 팔 구
const DIGIT_L = [false, true, false, false, false, false, false, true, true, false];

/** 마지막 글자의 받침 여부 / ㄹ 받침 여부 */
function tail(w: string | number): { b: boolean; l: boolean } {
  if (typeof w === 'number') {
    const n = Math.abs(Math.round(w));
    if (n === 0) return { b: true, l: false };
    const d = n % 10;
    if (d === 0) return { b: true, l: false }; // 십·백·천·만
    return { b: DIGIT_B[d], l: DIGIT_L[d] };
  }
  const s = w.replace(/[\s$)}\]]+$/g, '');
  const ch = s[s.length - 1] ?? '';
  if (/[0-9]/.test(ch)) {
    const m = s.match(/(\d+)$/);
    return tail(Number(m ? m[1] : ch));
  }
  const code = ch.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return { b: false, l: false };
  const jong = code % 28;
  return { b: jong !== 0, l: jong === 8 };
}

type JosaKey = '은' | '는' | '이' | '가' | '을' | '를' | '과' | '와' | '으로' | '로' | '이에요' | '예요';
const PAIRS: Record<JosaKey, [string, string]> = {
  은: ['은', '는'],
  는: ['은', '는'],
  이: ['이', '가'],
  가: ['이', '가'],
  을: ['을', '를'],
  를: ['을', '를'],
  과: ['과', '와'],
  와: ['과', '와'],
  으로: ['으로', '로'],
  로: ['으로', '로'],
  이에요: ['이에요', '예요'],
  예요: ['이에요', '예요'],
};

/** 조사만 돌려줌 */
export function jo(w: string | number, k: JosaKey): string {
  const t = tail(w);
  const [a, b] = PAIRS[k];
  if (k === '으로' || k === '로') return t.b && !t.l ? a : b;
  return t.b ? a : b;
}

/** 단어+조사 */
export function J(w: string, k: JosaKey): string {
  return w + jo(w, k);
}

/** $수$+조사 */
export function N(n: number, k: JosaKey): string {
  return `$${n}$${jo(n, k)}`;
}

const SINO = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
/** 한자어 읽기 (0~9999): 2305 → 이천삼백오 */
export function sino(n: number): string {
  if (n === 0) return '영';
  const units = ['', '십', '백', '천'];
  const ds = String(n).split('').map(Number).reverse();
  let out = '';
  for (let i = ds.length - 1; i >= 0; i--) {
    const d = ds[i];
    if (d === 0) continue;
    out += (d === 1 && i > 0 ? '' : SINO[d]) + units[i];
  }
  return out;
}

const NAT1 = ['', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉'];
const NAT10 = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔'];
/** 고유어 읽기 (1~99): 26 → 스물여섯 */
export function native(n: number): string {
  return NAT10[Math.floor(n / 10)] + NAT1[n % 10];
}
/** 세는 말 앞 고유어 (한 개, 두 개 …) */
export function nativeCount(n: number): string {
  const one = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉'];
  if (n === 20) return '스무';
  return NAT10[Math.floor(n / 10)] + one[n % 10];
}

/** 정수 객관식: 오답은 [min,max] 안에서만. 모자라면 가까운 수로 채움 */
export function intChoices(
  r: Rng,
  correct: number,
  wrongs: number[] = [],
  o: { min?: number; max?: number; count?: number; step?: number } = {},
) {
  const min = o.min ?? 0;
  const max = o.max ?? Number.MAX_SAFE_INTEGER;
  const step = o.step ?? 1;
  const ok = (x: number) => Number.isInteger(x) && x >= min && x <= max && x !== correct;
  const t = (x: number) => `$${x}$`;
  const near: number[] = [];
  for (let k = 1; near.length < 12 && k < 40; k++) {
    for (const v of [correct + k * step, correct - k * step]) if (ok(v)) near.push(v);
  }
  const fills = r.shuffle(near.slice(0, 4)).concat(near.slice(4));
  return makeChoices(r, t(correct), wrongs.filter(ok).map(t), o.count ?? 4, (i) => t(fills[i] ?? correct));
}

/** 글자 보기 (정답 + 오답들) */
export function textChoices(r: Rng, correct: string, wrongs: string[], count = 4) {
  return makeChoices(r, correct, wrongs, count);
}

/** 모든 종류가 적어도 1개씩 있게 (이미 2개 이상인 종류의 항목을 바꿈) */
export function ensureEach<K>(items: { kind: K }[], kinds: readonly K[]): void {
  for (const k of kinds) {
    if (items.some((x) => x.kind === k)) continue;
    const j = items.findIndex((x) => items.filter((y) => y.kind === x.kind).length > 1);
    if (j >= 0) items[j].kind = k;
  }
}

/** 레벨별 값 고르기 */
export function lv<T>(level: number, a: T, b: T, c: T): T {
  return level === 1 ? a : level === 2 ? b : c;
}

/** 세로셈 TeX (두 수) */
export function vert(a: number, b: number, op: '+' | '-', ans?: string): string {
  const res = ans === undefined ? '\\phantom{0}' : ans;
  return `\\begin{array}{r} ${a} \\\\ ${op}\\;\\; ${b} \\\\ \\hline ${res} \\end{array}`;
}

/** 물건 (이름, 세는 단위) */
export const THINGS: [string, string][] = [
  ['사과', '개'],
  ['사탕', '개'],
  ['구슬', '개'],
  ['연필', '자루'],
  ['공책', '권'],
  ['색종이', '장'],
  ['딱지', '장'],
  ['풍선', '개'],
  ['꽃', '송이'],
  ['쿠키', '개'],
  ['귤', '개'],
  ['스티커', '장'],
  ['동화책', '권'],
  ['젤리', '개'],
];

// ───────────── 조사 자동 교정 ─────────────
const JOSA_RE = /(\$[^$]+\$|'[^']+')(이에요|예요|이라고|라고|으로|로|은|는|이|가|을|를|과|와)(?=[\s.,?!)(]|$)/g;
const NAME_RE = new RegExp(`(${NAMES.join('|')})(이|가|은|는|을|를|과|와)(?=[\\s.,?!])`, 'g');

/** '$5$를' → '$5$을', '도윤는' → '도윤은' 처럼 앞말에 맞게 조사를 고쳐 줌 */
export function fixJosa(text: string): string {
  let out = text.replace(JOSA_RE, (all, w: string, p: string) => {
    let key: string | number;
    if (w.startsWith('$')) {
      const m = w.slice(1, -1).match(/(\d+)\s*$/);
      if (!m) return all;
      key = Number(m[1]);
    } else key = w.slice(1, -1);
    const base = p === '이에요' || p === '예요' ? '이에요' : p === '이라고' || p === '라고' ? '이라고' : p;
    if (base === '이라고') return w + (jo(key, '이') === '이' ? '이라고' : '라고');
    return w + jo(key, base as JosaKey);
  });
  out = out.replace(NAME_RE, (_a, n: string, p: string) => n + jo(n, p as JosaKey));
  out = out.replace(WORD_RE, (_a, w: string, p: string) => {
    if (p === '이에요' || p === '예요') return w + jo(w, '이에요');
    return w + jo(w, p as JosaKey);
  });
  return out;
}

const UNITS = ['개', '장', '자루', '권', '송이', '명', '마리', '번', '칸', '군데', '시', '분', '시간', '일', '주일', '개월', '년', '층', '원', '점', '걸음', '뼘', '바퀴', '줄', '묶음', '봉지', '상자', '대', '켤레', '접시'];
const NOUNS = ['포도', '배', '딸기', '감', '귤', '사과', '수박', '인형', '공', '컵', '책', '필통', '지우개', '가방', '풀', '모양', '도형', '삼각형', '사각형', '원', '오각형', '육각형', '쌓기나무', '자', '막대', '끈', '리본', '테이프', '줄넘기', '버스', '기차', '자동차', '자전거', '비행기', '배드민턴', '축구', '야구', '농구', '수영', '줄넘기', '피구', '빨간색', '파란색', '노란색', '초록색', '강아지', '고양이', '토끼', '햄스터', '물고기', '봄', '여름', '가을', '겨울', '우유', '주스', '물', '빵', '김밥', '피자', '떡볶이', '라면', '클립', '못', '선', '변', '꼭짓점', '맛', '동물', '채소', '과일', '학용품', '것', '탈것', '색깔', '운동', '종이', '그릇', '물통', '주전자', '사탕', '쿠키', '꽃잎', '바퀴', '시계', '달력', '요일', '날짜', '그래프', '표', '빨강', '노랑', '파랑', '초록', '장미', '튤립', '국화', '해바라기', '과자', '떡', '탄산수', '계절', '간식', '피구', '달리기', '도넛', '초콜릿', '리본', '색 테이프', '위쪽', '아래쪽', '왼쪽', '오른쪽'];
const WORD_LIST = [...new Set([...THINGS.map((t) => t[0]), ...UNITS, ...NOUNS])].sort((a, b) => b.length - a.length);
const WORD_RE = new RegExp(`(?<=^|[\\s$'(])(${WORD_LIST.join('|')})(이에요|예요|으로|로|은|는|이|가|을|를|과|와)(?=[\\s.,?!)]|$)`, 'g');
