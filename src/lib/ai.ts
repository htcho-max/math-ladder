// Gemini REST 호출
import { answerText } from '../core/check';
import { COURSE_BY_ID } from '../core/curriculum';
import type { Problem } from '../core/types';
import type { EssayItem } from './store';

export interface ChatMsg {
  role: 'user' | 'model';
  text: string;
}

async function call(key: string, model: string, text: string | ChatMsg[], json = false, system?: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: typeof text === 'string' ? [{ role: 'user', parts: [{ text }] }] : text.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
      generationConfig: { temperature: json ? 0.7 : 0.4, ...(json ? { responseMimeType: 'application/json' } : {}) },
    }),
  });
  if (!res.ok) {
    let msg = `${res.status}`;
    try {
      const j = await res.json();
      msg += ' ' + (j?.error?.message ?? '');
    } catch {
      /* 무시 */
    }
    throw new Error(`AI 요청 실패: ${msg}`);
  }
  const j = await res.json();
  const out = j?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
  if (!out) throw new Error('AI 응답이 비어 있어요');
  return out;
}

function answerDesc(p: Problem, mine: string): string {
  if (p.answer.type === 'choice') return p.answer.choices.map((c, i) => `${i + 1}) ${c}`).join('  ') + `\n학생이 고른 보기: ${mine}`;
  return `학생 답: ${mine || '(없음)'}`;
}

export async function explainProblem(key: string, model: string, p: Problem, mine: string, gradeLabel: string, question?: string): Promise<string> {
  const text = `너는 친절한 한국 수학 선생님이야. 학생 학년: ${gradeLabel}. 그 학년 눈높이에 맞는 말로 설명해.
수식은 반드시 $...$ (인라인) 또는 $$...$$ (블록) 안에 LaTeX 로 써. 마크다운 제목(#)은 쓰지 말고, **굵게** 와 줄 앞 '- ' 목록 정도만 써. 300자~600자 정도로.

[문제]
${p.q}
${p.table ? '표: ' + p.table.map((r) => r.join(' | ')).join(' / ') : ''}
${answerDesc(p, mine)}
정답: ${answerText(p.answer, p.unitId)}
교재 풀이: ${p.steps.join(' → ')}

${question ? `학생 질문: ${question}\n질문에 먼저 답하고,` : '학생이 왜 틀렸을지 짐작해서 짚어 주고,'} 단계별로 풀이를 설명한 뒤, 비슷한 문제를 풀 때 기억할 요령을 한 줄로 알려 줘.`;
  return call(key, model, text);
}

export async function makeEssays(key: string, model: string, unitTitles: string[], courseId?: string): Promise<EssayItem[]> {
  const grade = courseId ? COURSE_BY_ID[courseId]?.grade ?? '' : '';
  const text = `한국 2022 개정 교육과정 ${grade} 수학 내신 시험의 서술형 문항 2개를 만들어 줘.
범위 단원: ${unitTitles.join(', ')}
조건: 풀이 과정을 써야 하는 문항, 정답이 하나로 정해질 것, 수식은 $...$ LaTeX.
JSON 배열로만 답해: [{"q":"문제","answer":"모범 답안(풀이 과정 포함, 단계마다 줄바꿈 \\n)","rubric":"채점 기준(부분 점수 포함)"}]`;
  const out = await call(key, model, text, true);
  const arr = JSON.parse(out.replace(/^```json\s*|```$/g, ''));
  if (!Array.isArray(arr)) throw new Error('AI 응답 형식 오류');
  return arr.slice(0, 2).map((e: { q?: string; answer?: string; rubric?: string }) => ({ q: String(e.q ?? ''), answer: String(e.answer ?? ''), rubric: String(e.rubric ?? '') }));
}

/** 단원 개념 튜터 대화 */
export async function tutorChat(key: string, model: string, unit: { title: string; course: string; summary: string; concepts: string }, gradeLabel: string, history: ChatMsg[]): Promise<string> {
  const system = `너는 친절한 한국 수학 선생님(개념 튜터)이야. 학생 학년: ${gradeLabel}.
지금 단원: ${unit.course} 「${unit.title}」 — ${unit.summary}
단원 개념 요약:
${unit.concepts}
규칙: 학생 눈높이의 쉬운 말로, 짧게(3~8문장) 답해. 수식은 반드시 $...$ 또는 $$...$$ 안에 LaTeX 로. 마크다운 제목(#) 금지, **굵게** 와 '- ' 목록만.
숙제 답만 원하면 바로 답을 주지 말고 생각할 질문이나 첫 단계를 먼저 줘(소크라테스식). 수학과 관계없는 질문이면 공부 이야기로 부드럽게 돌려.`;
  return call(key, model, history, false, system);
}
