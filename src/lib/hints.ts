// 3단계 힌트: ① 생각할 거리 → ② 첫 단계 → ③ 거의 다 된 풀이 (마지막 줄=정답은 숨김)
import { getSkill } from '../core/problem';
import type { Problem } from '../core/types';

export function hintSteps(p: Problem): string[] {
  const sk = getSkill(p.unitId, p.skillId);
  const out: string[] = [];
  out.push(p.hint ?? `**${sk?.title ?? '이 문제'}** 유형이에요. 무엇을 구하는지, 어떤 개념(공식)을 쓰면 될지 먼저 떠올려 봐요.`);
  const body = p.steps.slice(0, -1); // 마지막 줄은 정답이 나오므로 빼기
  if (body.length >= 1) out.push(`첫 단계: ${body[0]}`);
  if (body.length >= 2) out.push(body.join('\n'));
  return out;
}
