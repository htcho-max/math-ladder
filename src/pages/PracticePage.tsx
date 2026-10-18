import { useEffect, useMemo, useRef, useState } from 'react';
import { CONTENT } from '../content';
import { COURSE_BY_ID, UNIT_BY_ID } from '../core/curriculum';
import { judge, type UserAnswer, type Verdict } from '../core/check';
import { makeProblem, pickChoice, problemFromKey } from '../core/problem';
import { randomSeed } from '../core/rng';
import type { Level, Problem } from '../core/types';
import { dueWrong, recordAnswer, skillScore, startLevel, unitMastery } from '../lib/mastery';
import { navigate } from '../lib/router';
import { choiceRatio, getState, useStore } from '../lib/store';
import { Header, Ring, UnitLink } from '../ui/bits';
import { AnswerInput, Feedback, ProblemBody } from '../ui/ProblemView';
import { MathText } from '../ui/MathText';
import { NotFound } from './UnitPage';

export type PracticeMode =
  | { kind: 'unit'; unitId: string; skillId?: string }
  | { kind: 'review' }
  | { kind: 'retry'; key: string }
  | { kind: 'similar'; key: string };

const N = 10;

interface Plan {
  title: string;
  back: string;
  total: number;
  /** i번째 문제 만들기 (level: 현재 적응 레벨) */
  next: (i: number, level: Level, prevSkill?: string) => { p: Problem; reviewOf?: string } | null;
  startLevel: Level;
  unitId?: string;
  adaptive: boolean;
}

function buildPlan(mode: PracticeMode): Plan | null {
  const d = getState().data;
  if (mode.kind === 'unit') {
    const c = CONTENT[mode.unitId];
    const u = UNIT_BY_ID[mode.unitId];
    if (!c || !u) return null;
    const sk = mode.skillId ? c.skills.find((s) => s.id === mode.skillId) : undefined;
    if (mode.skillId && !sk) return null;
    const base = sk ? skillScore(d, u.id, sk.id) : unitMastery(d, u.id) ?? 0;
    return {
      title: sk ? sk.title : `${u.title} 연습`,
      back: `/unit/${u.id}`,
      total: N,
      startLevel: startLevel(base),
      unitId: u.id,
      adaptive: true,
      next(_i, level, prev) {
        let skillId = sk?.id;
        if (!skillId) {
          const dd = getState().data;
          // 약한 유형 위주, 직전 유형은 피함
          const ranked = c.skills
            .filter((s) => s.id !== prev || c.skills.length === 1)
            .map((s) => ({ id: s.id, w: skillScore(dd, u.id, s.id) + Math.random() * 45 }))
            .sort((a, b) => a.w - b.w);
          skillId = ranked[0].id;
        }
        const seed = randomSeed();
        return { p: makeProblem(u.id, skillId, level, seed, pickChoice(seed, choiceRatio(), u.id)) };
      },
    };
  }
  if (mode.kind === 'review') {
    const items = dueWrong(d).slice(0, 20);
    if (!items.length) return null;
    return {
      title: '오늘의 오답 복습',
      back: '/wrong',
      total: items.length,
      startLevel: 1,
      adaptive: false,
      next(i) {
        const p = problemFromKey(items[i].key);
        return p ? { p, reviewOf: items[i].key } : null;
      },
    };
  }
  const orig = problemFromKey(mode.key);
  if (!orig) return null;
  if (mode.kind === 'retry') {
    return { title: '다시 풀기', back: '/wrong', total: 1, startLevel: orig.level, adaptive: false, next: () => ({ p: orig, reviewOf: orig.key }) };
  }
  return {
    title: '비슷한 문제',
    back: '/wrong',
    total: 3,
    startLevel: orig.level,
    adaptive: false,
    next: () => {
      const seed = randomSeed();
      return { p: makeProblem(orig.unitId, orig.skillId, orig.level, seed, pickChoice(seed, choiceRatio(), orig.unitId)), reviewOf: orig.key };
    },
  };
}

interface Done {
  p: Problem;
  ok: boolean;
}

export function PracticePage({ mode }: { mode: PracticeMode }) {
  const modeKey = JSON.stringify(mode);
  const plan = useMemo(() => buildPlan(mode), [modeKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const d = useStore((s) => s.data);
  const startMastery = useRef<number | null>(plan?.unitId ? unitMastery(getState().data, plan.unitId) : null);
  const [idx, setIdx] = useState(0);
  const [level, setLevel] = useState<Level>(plan?.startLevel ?? 1);
  const [run, setRun] = useState(0); // 연속 정답
  const [cur, setCur] = useState<{ p: Problem; reviewOf?: string } | null>(() => plan?.next(0, plan.startLevel) ?? null);
  const [ans, setAns] = useState<UserAnswer | undefined>(undefined);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [hint, setHint] = useState(false);
  const [done, setDone] = useState<Done[]>([]);
  const [finished, setFinished] = useState(false);
  const nextBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (verdict) nextBtn.current?.focus();
  }, [verdict]);

  if (!plan) {
    if (mode.kind === 'review')
      return (
        <div className="page">
          <Header title="오답 복습" back="/wrong" />
          <div className="card muted">오늘 복습할 문제가 없어요. 잘했어요!</div>
        </div>
      );
    return <NotFound />;
  }

  const grade = () => {
    if (!cur || verdict) return;
    if (ans === undefined || ans === '' || (Array.isArray(ans) && ans.every((x) => !x))) return;
    const v = judge(cur.p.answer, ans);
    setVerdict(v);
    recordAnswer(cur.p, v.ok, cur.reviewOf);
    setDone((x) => [...x, { p: cur.p, ok: v.ok }]);
    if (plan.adaptive) {
      if (v.ok) {
        const r = run + 1;
        if (r >= 2 && level < 3) {
          setLevel((level + 1) as Level);
          setRun(0);
        } else setRun(r);
      } else {
        setRun(0);
        if (level > 1) setLevel((level - 1) as Level);
      }
    }
  };

  const next = () => {
    if (idx + 1 >= plan.total) {
      setFinished(true);
      return;
    }
    const n = plan.next(idx + 1, level, cur?.p.skillId);
    setIdx(idx + 1);
    setCur(n);
    setAns(undefined);
    setVerdict(null);
    setHint(false);
  };

  if (finished || !cur) {
    const correct = done.filter((x) => x.ok).length;
    const rate = done.length ? correct / done.length : 0;
    const u = plan.unitId ? UNIT_BY_ID[plan.unitId] : undefined;
    const endM = u ? unitMastery(d, u.id) : null;
    return (
      <div className="page">
        <Header title={plan.title} back={plan.back} />
        <section className="card result-card">
          <div className="big">{Math.round(rate * 100)}%</div>
          <div className="muted">
            {done.length}문제 중 {correct}문제 정답
          </div>
          <div className="resmsg">{rate >= 0.9 ? '완벽해요! 👏' : rate >= 0.7 ? '잘하고 있어요!' : rate >= 0.5 ? '조금만 더 연습해 봐요.' : '개념을 다시 읽고 천천히 풀어 봐요.'}</div>
          {u && (
            <div className="mchange">
              <Ring value={startMastery.current} size={48} />
              <span>→</span>
              <Ring value={endM} size={56} />
              <span className="muted small">단원 숙련도</span>
            </div>
          )}
        </section>
        {u && rate < 0.6 && u.prereq.length > 0 && (
          <section className="card warnbox">
            <div className="card-h">먼저 복습하면 좋은 단원</div>
            <div className="muted small">이 단원은 아래 단원의 개념 위에 쌓여 있어요. 기초를 다지고 다시 도전해 봐요.</div>
            <div className="links">
              {u.prereq.map((p) => (
                <UnitLink key={p} u={UNIT_BY_ID[p]} mastery={unitMastery(d, p)} />
              ))}
            </div>
          </section>
        )}
        <section className="card">
          <div className="card-h">푼 문제</div>
          <div className="donelist">
            {done.map((x, i) => (
              <div key={i} className={'doneitem ' + (x.ok ? 'ok' : 'no')}>
                <span className="mark">{x.ok ? '○' : '✕'}</span>
                <MathText className="dq" text={x.p.q.split('\n')[0]} />
              </div>
            ))}
          </div>
        </section>
        <div className="btnrow">
          {mode.kind === 'unit' && (
            <button className="btn primary" onClick={() => navigate(`/practice/u/${mode.unitId}${mode.skillId ? '/' + mode.skillId : ''}?${Date.now()}`)}>
              한 번 더
            </button>
          )}
          <button className="btn" onClick={() => navigate(plan.back)}>
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const p = cur.p;
  const u = UNIT_BY_ID[p.unitId];
  const skill = CONTENT[p.unitId]?.skills.find((s) => s.id === p.skillId);
  return (
    <div className="page practice">
      <Header title={plan.title} back={plan.back}>
        <span className="muted small">
          {idx + 1} / {plan.total}
        </span>
      </Header>
      <div className="progress">
        <div style={{ width: `${(idx / plan.total) * 100}%` }} />
      </div>
      <section className="card pcard">
        <div className="pmeta">
          <span className="lv" data-lv={p.level}>
            {['기본', '보통', '심화'][p.level - 1]}
          </span>
          <span className="muted small">
            {COURSE_BY_ID[u.course].title} {u.title} · {skill?.title}
          </span>
        </div>
        <ProblemBody p={p} />
        <AnswerInput p={p} value={ans} onChange={setAns} locked={!!verdict} onEnter={verdict ? next : grade} />
        {!verdict && hint && p.hint && (
          <div className="hint">
            💡 <MathText as="span" text={p.hint} />
          </div>
        )}
        {verdict && <Feedback p={p} verdict={verdict} mine={ans} />}
        <div className="btnrow">
          {!verdict ? (
            <>
              {p.hint && !hint && (
                <button className="btn ghost" onClick={() => setHint(true)}>
                  힌트
                </button>
              )}
              <button className="btn primary grow" onClick={grade}>
                채점하기
              </button>
            </>
          ) : (
            <button ref={nextBtn} className="btn primary grow" onClick={next}>
              {idx + 1 >= plan.total ? '결과 보기' : '다음 문제'}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
