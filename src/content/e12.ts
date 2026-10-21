// 초1-1 ~ 초2-2 콘텐츠 (단원별 파일은 ./e12/ 폴더)
import type { ContentMap, ProblemDraft } from '../core/types';
import { fixJosa } from './e12/util';
import { e1a } from './e12/e1a';
import { e1b } from './e12/e1b';
import { e2a } from './e12/e2a';
import { e2b } from './e12/e2b';

/** 생성된 글의 조사(을/를, 이/가 …)를 앞말에 맞게 고치는 마무리 */
/** 너무 넓은 그림은 화면 폭(최대 340px)에 맞게 표시 크기만 줄임 */
function fit(svg: string, maxW = 340): string {
  const m = svg.match(/^<svg[^>]*?width="([\d.]+)" height="([\d.]+)"/);
  if (!m) return svg;
  const w = Number(m[1]);
  const h = Number(m[2]);
  if (w <= maxW) return svg;
  const k = maxW / w;
  return svg.replace(`width="${m[1]}" height="${m[2]}"`, `width="${Math.round(w * k)}" height="${Math.round(h * k)}"`);
}

function polish(d: ProblemDraft): ProblemDraft {
  const out: ProblemDraft = { ...d, q: fixJosa(d.q), steps: d.steps.map(fixJosa) };
  if (d.fig) out.fig = fit(d.fig);
  if (d.hint) out.hint = fixJosa(d.hint);
  if (d.answer.type === 'choice') out.answer = { ...d.answer, choices: d.answer.choices.map(fixJosa) };
  return out;
}

function finish(map: ContentMap): ContentMap {
  const res: ContentMap = {};
  for (const [id, u] of Object.entries(map)) {
    res[id] = {
      concepts: u.concepts.map((c) => ({
        ...c,
        body: fixJosa(c.body),
        example: c.example ? { q: fixJosa(c.example.q), a: fixJosa(c.example.a) } : undefined,
      })),
      skills: u.skills.map((s) => ({ ...s, gen: (r, level) => polish(s.gen(r, level)) })),
      ...(u.top ? { top: u.top.map((s) => ({ ...s, gen: (r, level) => polish(s.gen(r, level)) })) } : {}),
    };
  }
  return res;
}

export const content: ContentMap = finish({ ...e1a, ...e1b, ...e2a, ...e2b });
