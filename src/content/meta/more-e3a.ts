// e3a 심화 추가분 유형 분류 (src/content/e34/more-e3a.ts 의 MORE_E3A 유형 id → 분류)
import type { Cat } from '../meta';

export const MORE_CATS_E3A: Record<string, Record<string, Cat>> = {
  'e3a-1': { 'sum-diff-pair': 'word', 'box-range-count': 'concept', 'pattern-add-sub': 'calc' },
  'e3a-2': { 'count-right-tri': 'concept', 'split-square-perimeter': 'word', 'stick-squares': 'concept' },
  'e3a-3': { 'div-cards': 'calc', 'reverse-share': 'word', 'div-both': 'concept' },
  'e3a-4': { 'mul-digit-range': 'calc', 'gap-length': 'word', 'mul-error': 'concept' },
  'e3a-5': { 'class-schedule': 'word', 'track-laps': 'word', 'record-relations': 'word' },
  'e3a-6': { 'frac-reason': 'concept', 'dec-line': 'concept', 'frac-nested': 'concept' },
};
