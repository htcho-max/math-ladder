// e4b 심화 추가분 유형 분류 (src/content/e34/more-e4b.ts 의 MORE_E4B 유형 id → 분류)
import type { Cat } from '../meta';

export const MORE_CATS_E4B: Record<string, Record<string, Cat>> = {
  'e4b-1': { 'frac-sum-cases': 'concept', 'frac-reverse': 'word', 'frac-ineq': 'calc' },
  'e4b-2': { 'eq-grid-count': 'concept', 'fold-equilateral': 'calc', 'iso-angle-count': 'concept' },
  'e4b-3': { 'dec-cards': 'calc', 'dec-clue': 'concept', 'dec-number-line': 'concept' },
  'e4b-4': { 'quad-count-grid': 'concept', 'quad-fold': 'calc', 'square-cut': 'word' },
  'e4b-5': { 'line-clue': 'word', 'line-vs-table': 'concept', 'line-grid-cells': 'concept' },
  'e4b-6': { 'poly-missing-angle': 'calc', 'regular-diag-angle': 'calc', 'diag-total-reverse': 'concept' },
};
