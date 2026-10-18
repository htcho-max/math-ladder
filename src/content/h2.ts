// h2 그룹: 공통수학2(hc2), 대수(alg), 미적분Ⅰ(cal1)
import type { ContentMap } from '../core/types';
import { hc2 } from './h2/hc2';
import { alg } from './h2/alg';
import { cal1 } from './h2/cal1';

export const content: ContentMap = { ...hc2, ...alg, ...cal1 };
