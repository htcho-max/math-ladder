// e4a 심화 추가분 유형 분류 (src/content/e34/more-e4a.ts 의 MORE_E4A 유형 id → 분류)
import type { Cat } from '../meta';

export const MORE_CATS_E4A: Record<string, Record<string, Cat>> = {
  'e4a-1': { 'digit-clues': 'concept', 'times-ten': 'calc', 'numline-big': 'concept' },
  'e4a-2': { 'set-square': 'concept', 'clock-kind-count': 'word', 'dart-angle': 'calc' },
  'e4a-3': { 'quot-rem-same': 'concept', 'mul-missing-digit': 'calc', 'reverse-chain': 'word' },
  'e4a-4': { 'inverse-move': 'concept', 'equiv-move': 'concept', 'mirror-clock': 'word' },
  'e4a-5': { 'bar-pair': 'concept', 'bar-whose-bar': 'word', 'bar-price': 'word' },
  'e4a-6': { 'repeat-cycle': 'concept', 'io-machine': 'calc', 'stone-frame': 'concept' },
};
