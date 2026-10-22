// e3b 심화 추가분 유형 분류 (src/content/e34/more-e3b.ts 의 MORE_E3B 유형 id → 분류)
import type { Cat } from '../meta';

export const MORE_CATS_E3B: Record<string, Record<string, Cat>> = {
  'e3b-1': { 'mul-wrong-digit': 'calc', 'mul-rule': 'concept', 'mul-sum-product': 'calc' },
  'e3b-2': { 'div-cards': 'calc', 'div-reverse': 'word', 'div-weekday': 'word' },
  'e3b-3': { 'circle-overlap': 'calc', 'circle-frame': 'calc', 'circle-center-shape': 'concept' },
  'e3b-4': { 'frac-cards': 'concept', 'frac-range-count': 'concept', 'frac-sequence': 'concept' },
  'e3b-5': { 'water-rate': 'word', 'weight-pairs': 'word', 'pour-move': 'word' },
  'e3b-6': { 'graph-share': 'word', 'graph-redraw': 'concept', 'graph-possible': 'concept' },
};
