// 초5-1 ~ 초6-2 콘텐츠 (e56 그룹)
import type { ContentMap } from '../core/types';
import { content as e5a } from './e56/e5a';
import { content as e5b } from './e56/e5b';
import { content as e6a } from './e56/e6a';
import { content as e6b } from './e56/e6b';
import { withJosaFix } from './m12/josa';

/** 수식 뒤 조사(을/를, 이/가 …)를 자동 교정해서 내보냄 */
export const content: ContentMap = withJosaFix({ ...e5a, ...e5b, ...e6a, ...e6b });
