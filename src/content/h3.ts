// h3 그룹: 확률과 통계(pst) · 미적분Ⅱ(cal2) · 기하(geo)
import type { ContentMap } from '../core/types';
import { pst } from './h3/pst';
import { cal2 } from './h3/cal2';
import { geo } from './h3/geo';

export const content: ContentMap = { ...pst, ...cal2, ...geo };
