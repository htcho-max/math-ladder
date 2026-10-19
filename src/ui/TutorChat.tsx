// 단원 화면의 AI 개념 튜터 대화 (Gemini 키가 있을 때)
import { useRef, useState } from 'react';
import { CONTENT } from '../content';
import { COURSE_BY_ID, UNIT_BY_ID } from '../core/curriculum';
import { tutorChat, type ChatMsg } from '../lib/ai';
import { navigate } from '../lib/router';
import { activeProfile, getState, useStore } from '../lib/store';
import { MathText } from './MathText';

const SUGGEST = ['이 단원에서 제일 중요한 건 뭐예요?', '쉬운 예를 하나 들어 주세요', '이전에 배운 것과 어떻게 이어져요?', '자주 틀리는 부분을 알려 주세요'];

export function TutorChat({ unitId }: { unitId: string }) {
  const settings = useStore((s) => s.settings);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const u = UNIT_BY_ID[unitId];

  if (!settings.geminiKey) {
    return (
      <section className="card tutor">
        <div className="card-h">🤖 AI 개념 튜터</div>
        <div className="muted small">
          설정에 Gemini API 키를 넣으면 이 단원에 대해 무엇이든 물어볼 수 있어요.{' '}
          <button className="link" onClick={() => navigate('/settings')}>
            설정으로
          </button>
        </div>
      </section>
    );
  }

  const send = async (q: string) => {
    const t = q.trim();
    if (!t || busy) return;
    const next: ChatMsg[] = [...msgs, { role: 'user', text: t }];
    setMsgs(next);
    setText('');
    setBusy(true);
    setErr('');
    try {
      const c = CONTENT[unitId];
      const concepts = (c?.concepts ?? []).map((k) => `- ${k.title}: ${k.body.replace(/\n/g, ' ')}`).join('\n');
      const grade = COURSE_BY_ID[activeProfile(getState()).course]?.grade ?? '';
      const ans = await tutorChat(settings.geminiKey, settings.geminiModel, { title: u.title, course: COURSE_BY_ID[u.course].title, summary: u.summary, concepts }, grade, next.slice(-12));
      setMsgs([...next, { role: 'model', text: ans }]);
      setTimeout(() => endRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 50);
    } catch (e) {
      setErr((e as Error).message);
      setMsgs(msgs);
      setText(t);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card tutor">
      <div className="card-h">
        🤖 AI 개념 튜터 <span className="muted small">「{u.title}」에 대해 물어보세요</span>
      </div>
      {msgs.length === 0 && (
        <div className="suggest">
          {SUGGEST.map((q) => (
            <button key={q} className="chipbtn" onClick={() => send(q)} disabled={busy}>
              {q}
            </button>
          ))}
        </div>
      )}
      <div className="chat">
        {msgs.map((m, i) => (
          <div key={i} className={'bubble ' + m.role}>
            {m.role === 'model' ? <MathText text={m.text} /> : m.text}
          </div>
        ))}
        {busy && <div className="bubble model muted">생각 중…</div>}
        <div ref={endRef} />
      </div>
      {err && <div className="err">{err}</div>}
      <form
        className="airow"
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        <input id={`tutor-${unitId}`} type="text" placeholder="궁금한 점을 써 보세요" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn primary" type="submit" disabled={busy || !text.trim()}>
          보내기
        </button>
      </form>
      <div className="muted small">AI 답변은 틀릴 수 있어요. 교과서 개념 카드와 함께 확인해요.</div>
    </section>
  );
}
