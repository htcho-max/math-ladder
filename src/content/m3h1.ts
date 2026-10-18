// 중2-2, 중3-1, 중3-2, 공통수학1 콘텐츠 (단원별 파일은 ./m3h1/ 폴더)
import type { ContentMap } from '../core/types';
import { m2b } from './m3h1/m2b';
import { m3a } from './m3h1/m3a';
import { m3b } from './m3h1/m3b';
import { hc1 } from './m3h1/hc1';

export const content: ContentMap = { ...m2b, ...m3a, ...m3b, ...hc1 };
