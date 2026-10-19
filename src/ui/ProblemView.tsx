import { useEffect, useRef, useState } from 'react';
import { answerText, type UserAnswer, type Verdict } from '../core/check';
import type { Problem } from '../core/types';
import { explainProblem } from '../lib/ai';
import { getState, activeProfile, useStore } from '../lib/store';
import { COURSE_BY_ID } from '../core/curriculum';
import { Fig, MathText, Table } from './MathText';
import { pitfalls } from '../content/meta';

const CIRCLED = '①②③④⑤⑥⑦⑧';

export function ProblemBody({ p, num }: { p: Problem; num?: number }) {
  return (
    <div className="pbody">
      <div className="pq">
        {num !== undefined && <span className="pnum">{num}.</span>}
        <MathText text={p.q} />
      </div>
      {p.fig && <Fig svg={p.fig} />}
      {p.table && <Table rows={p.table} />}
    </div>
  );
}

export function AnswerInput({
  p,
  value,
  onChange,
  locked,
  onEnter,
  autoFocus = true,
}: {
  p: Problem;
  value: UserAnswer | undefined;
  onChange: (v: UserAnswer) => void;
  locked?: boolean;
  onEnter?: () => void;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus && !locked && window.matchMedia('(pointer: fine)').matches) ref.current?.focus();
  }, [p.key, autoFocus, locked]);
  const a = p.answer;
  const key = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onEnter?.();
    }
  };
  if (a.type === 'choice') {
    return (
      <div className="choices" role="radiogroup">
        {a.choices.map((c, i) => {
          const sel = value === i;
          const cls = ['choice', sel ? 'sel' : '', locked && i === a.index ? 'right' : '', locked && sel && i !== a.index ? 'wrong' : ''].join(' ');
          return (
            <button key={i} className={cls} role="radio" aria-checked={sel} disabled={locked} onClick={() => onChange(i)}>
              <span className="cnum" aria-label={`${i + 1}번`}>{i + 1}</span>
              <MathText as="span" text={c.replace(/\\frac/g, '\\dfrac')} />
            </button>
          );
        })}
      </div>
    );
  }
  if (a.type === 'fields') {
    const arr = Array.isArray(value) ? value : a.fields.map(() => '');
    return (
      <div className="fields">
        {a.fields.map((f, i) => (
          <label key={i} className="field">
            <span className="flabel">
              <MathText as="span" text={f.label} />
            </span>
            <span className="inrow">
              <input
                ref={i === 0 ? ref : undefined}
                className="ans"
                type="text"
                inputMode="text"
                autoComplete="off"
                value={arr[i] ?? ''}
                disabled={locked}
                onChange={(e) => {
                  const next = [...arr];
                  next[i] = e.target.value;
                  onChange(next);
                }}
                onKeyDown={key}
              />
              {f.unit && <span className="unit">{f.unit}</span>}
            </span>
          </label>
        ))}
        <InputHelp unitId={p.unitId} />
      </div>
    );
  }
  return (
    <div className="single">
      <span className="inrow">
        <input
          ref={ref}
          className="ans"
          type="text"
          inputMode="text"
          autoComplete="off"
          placeholder={a.type === 'set' ? '예: 2, -3' : '답'}
          value={typeof value === 'string' ? value : ''}
          disabled={locked}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={key}
        />
        {a.type === 'num' && a.unit && <span className="unit">{a.unit}</span>}
      </span>
      {a.type === 'set' ? <div className="ihelp">답이 여러 개면 쉼표(,)로 구분해요.</div> : <InputHelp unitId={p.unitId} />}
    </div>
  );
}

function InputHelp({ unitId }: { unitId: string }) {
  // 초등 1~2학년은 안내 생략, 초등 3~6학년은 분수만, 중·고등은 음수까지
  if (/^e[12]/.test(unitId)) return null;
  if (unitId.startsWith('e')) return <div className="ihelp">분수는 3/4, 대분수는 2 1/3 처럼 입력해요.</div>;
  return <div className="ihelp">분수는 3/4, 대분수는 2 1/3, 음수는 -5 처럼 입력해요.</div>;
}

export function userAnswerText(p: Problem, v: UserAnswer | undefined): string {
  if (v === undefined || v === '') return '(무응답)';
  const a = p.answer;
  if (a.type === 'choice') return typeof v === 'number' ? `${CIRCLED[v]} ${a.choices[v]}` : '(무응답)';
  if (a.type === 'fields') return a.fields.map((f, i) => `${f.label}: ${(v as string[])[i] || '?'}`).join(', ');
  return String(v);
}

export function Feedback({ p, verdict, mine, showAi = true }: { p: Problem; verdict: Verdict; mine: UserAnswer | undefined; showAi?: boolean }) {
  return (
    <div className={'feedback ' + (verdict.ok ? 'ok' : 'no')}>
      <div className="fb-head">{verdict.ok ? '정답이에요! 🎉' : '아쉬워요, 다시 확인해 봐요'}</div>
      {verdict.note && <div className="fb-note">{verdict.note}</div>}
      {!verdict.ok && (
        <div className="fb-ans">
          정답: <MathText as="span" text={answerText(p.answer, p.unitId)} />
        </div>
      )}
      <Steps steps={p.steps} />
      {!verdict.ok && pitfalls(p.unitId).length > 0 && (
        <details className="fb-pit">
          <summary>⚠️ 이 단원에서 자주 하는 실수</summary>
          <ul>
            {pitfalls(p.unitId).map((t, i) => (
              <li key={i}>
                <MathText as="span" text={t} />
              </li>
            ))}
          </ul>
        </details>
      )}
      {showAi && <AiHelp p={p} mine={userAnswerText(p, mine)} />}
    </div>
  );
}

export function Steps({ steps }: { steps: string[] }) {
  return (
    <div className="steps">
      <div className="steps-h">풀이</div>
      <ol>
        {steps.map((s, i) => (
          <li key={i}>
            <MathText text={s} />
          </li>
        ))}
      </ol>
    </div>
  );
}

export function AiHelp({ p, mine }: { p: Problem; mine: string }) {
  const settings = useStore((s) => s.settings);
  const [out, setOut] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  useEffect(() => {
    setOut(null);
    setErr('');
    setQ('');
  }, [p.key]);
  if (!settings.geminiKey) return null;
  const ask = async () => {
    setBusy(true);
    setErr('');
    try {
      const grade = COURSE_BY_ID[activeProfile(getState()).course]?.grade ?? '';
      setOut(await explainProblem(settings.geminiKey, settings.geminiModel, p, mine, grade, q.trim() || undefined));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="aihelp">
      {out ? (
        <div className="aiout">
          <div className="ai-badge">AI 선생님</div>
          <MathText text={out} />
        </div>
      ) : null}
      <div className="airow">
        <input type="text" placeholder="궁금한 점 (선택)" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn ghost" onClick={ask} disabled={busy}>
          {busy ? '생각 중…' : out ? '다시 묻기' : '🤖 AI 선생님에게 묻기'}
        </button>
      </div>
      {err && <div className="err">{err}</div>}
    </div>
  );
}
