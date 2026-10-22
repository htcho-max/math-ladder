// 수학 사다리 — 핵심 타입 (콘텐츠 작성자와 앱이 공유하는 약속)
import type { Rng } from './rng';

/** 난이도: 1 기본, 2 보통, 3 심화(시험 응용), 4 최상위(최상위 문제집·경시 맛보기 — UnitContent.top 유형 전용) */
export type Level = 1 | 2 | 3 | 4;
/** 일반 유형 생성기가 받는 난이도 (최상위 4 는 top 유형만) */
export type GenLevel = 1 | 2 | 3;

/** 영역(계통): 수와 연산 / 문자와 식 / 함수와 미적분 / 도형과 측정 / 자료와 가능성 */
export type Strand = 'num' | 'alg' | 'func' | 'geo' | 'data';

export type AnswerSpec =
  /** 숫자 하나. 입력은 정수·소수·분수(3/4)·대분수(2 1/3)·음수 모두 값으로 비교 */
  | {
      type: 'num';
      value: number;
      unit?: string; // 입력칸 뒤에 표시 (cm, 개, ° …)
      display?: 'int' | 'dec' | 'frac' | 'mixed'; // 정답·보기 표시 방식 (생략 시 자동)
      requireReduced?: boolean; // 분수 입력이면 기약분수여야 정답
    }
  /** 이름 붙은 숫자 칸 여러 개 (몫/나머지, x/y, 분자/분모 …) */
  | {
      type: 'fields';
      fields: { label: string; value: number; unit?: string; display?: 'int' | 'dec' | 'frac' | 'mixed' }[];
    }
  /** 여러 개의 수, 순서 무관 (방정식의 해 등). 쉼표로 구분해 입력 */
  | { type: 'set'; values: number[] }
  /** 객관식. choices 는 $…$ 수식 포함 가능. 보통 4~5개, 서로 달라야 함 */
  | { type: 'choice'; choices: string[]; index: number };

export interface ProblemDraft {
  /** 문제 본문. $…$ 인라인 수식, $$…$$ 블록 수식, **굵게**, \n 줄바꿈 */
  q: string;
  /** 그림(SVG 문자열). fig.ts 의 Svg 도우미로 만들 것 */
  fig?: string;
  /** 표. 첫 행은 머리글. 칸 안에 $…$ 가능 */
  table?: string[][];
  answer: AnswerSpec;
  /** 풀이 단계 (각 원소 한 줄, $…$ 가능) — 반드시 1개 이상 */
  steps: string[];
  /** 힌트 (선택) */
  hint?: string;
}

export interface Skill {
  /** 단원 안에서 유일한 영문 slug (예: 'add-carry') */
  id: string;
  /** 학생에게 보이는 유형 이름 (예: '받아올림 있는 덧셈') */
  title: string;
  /** 문제 생성기: 같은 rng 시드면 같은 문제가 나와야 함 (Math.random 금지) */
  gen: (r: Rng, level: GenLevel) => ProblemDraft;
  /** 심화 전용으로 만든 유형 (심화 도전에서 먼저 나옴) */
  hard?: boolean;
}

export interface Concept {
  title: string;
  /** 설명 본문 ($…$, **굵게**, \n, 줄 앞 '- ' 목록 가능) */
  body: string;
  /** 예제 (선택) */
  example?: { q: string; a: string };
}

export interface UnitContent {
  concepts: Concept[];
  skills: Skill[];
  /** 최상위 도전 전용 유형 (level 4 로만 출제, 일반 연습·오늘의 학습·시험·숙련도에는 안 들어감) */
  top?: Skill[];
}

export type ContentMap = Record<string, UnitContent>;

/** 실제 출제된 문제 (draft + 출처). (unitId, skillId, level, seed) 로 언제든 다시 만들 수 있음 */
export interface Problem extends ProblemDraft {
  key: string; // `${unitId}/${skillId}/${level}/${seed}`
  unitId: string;
  skillId: string;
  level: Level;
  seed: number;
}

export interface CourseDef {
  id: string;
  title: string; // '초1-1', '중2-2', '공통수학1' …
  stage: 'e' | 'm' | 'h';
  grade: string; // '초등 1학년', '고등 선택' …
  order: number;
}

export interface UnitDef {
  id: string; // `${courseId}-${no}`
  course: string;
  no: number;
  title: string;
  strand: Strand;
  term: 'mid' | 'final';
  prereq: string[];
  /** 한 줄 요약 */
  summary: string;
}
