// 모든 단원 콘텐츠 모음
import type { ContentMap } from '../core/types';
import { content as e12 } from './e12';
import { content as e34 } from './e34';
import { content as e56 } from './e56';
import { content as m12 } from './m12';
import { content as m3h1 } from './m3h1';
import { content as h2 } from './h2';
import { content as h3 } from './h3';

export const CONTENT: ContentMap = { ...e12, ...e34, ...e56, ...m12, ...m3h1, ...h2, ...h3 };

/** 콘텐츠 파일별 담당 과정 (테스트용) */
export const GROUPS: Record<string, string[]> = {
  e12: ['e1a', 'e1b', 'e2a', 'e2b'],
  e34: ['e3a', 'e3b', 'e4a', 'e4b'],
  e56: ['e5a', 'e5b', 'e6a', 'e6b'],
  m12: ['m1a', 'm1b', 'm2a'],
  m3h1: ['m2b', 'm3a', 'm3b', 'hc1'],
  h2: ['hc2', 'alg', 'cal1'],
  h3: ['pst', 'cal2', 'geo'],
};
