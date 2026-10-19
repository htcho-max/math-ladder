import { useEffect, useMemo, useState } from 'react';
import { COURSES, COURSE_BY_ID, UNIT_BY_ID, unitsOf } from '../core/curriculum';
import { answerText, judge, type UserAnswer } from '../core/check';
import { hasContent } from '../core/problem';
import { makeEssays } from '../lib/ai';
import { buildExam, diagUnits, examProblem, examTitle, gradeExam, MIX, type ExamState, type Mix } from '../lib/exam';
import { recordAnswer, unitMastery } from '../lib/mastery';
import { certifyUnits, rewardExam } from '../lib/reward';
import { ScratchButton, Scratchpad } from '../ui/Scratchpad';
import { Mascot } from '../ui/Mascot';
import { navigate } from '../lib/router';
import { activeProfile, getState, readProfileKey, updateData, useStore, writeProfileKey, type ExamKind, type ExamRecord } from '../lib/store';
import { Bar, Header, UnitLink } from '../ui/bits';
import { MathText } from '../ui/MathText';
import { AnswerInput, ProblemBody, Steps, userAnswerText } from '../ui/ProblemView';
import { NotFound } from './UnitPage';

const KINDS: { id: ExamKind; name: string; desc: string; ic: string }[] = [
  { id: 'unit', name: '단원평가', desc: '한 단원을 꼼꼼히', ic: '📄' },
  { id: 'mid', name: '중간고사', desc: '학기 앞 절반 범위', ic: '📘' },
  { id: 'final', name: '기말고사', desc: '학기 뒤 절반 범위', ic: '📗' },
  { id: 'custom', name: '범위 직접 선택', desc: '우리 학교 시험 범위대로', ic: '✏️' },
  { id: 'diag', name: '수준 진단', desc: '이전 학년 기초 점검', ic: '🩺' },
];

// ───────────────────────── 시험 만들기 ─────────────────────────
export function ExamSetup({ presetUnit }: { presetUnit?: string }) {
  const s = useStore((x) => x);
  const prof = activeProfile(s);
  const current = readProfileKey<ExamState>('exam');
  const [kind, setKind] = useState<ExamKind>(presetUnit ? 'unit' : 'mid');
  const [course, setCourse] = useState(presetUnit ? UNIT_BY_ID[presetUnit]?.course ?? prof.course : prof.course);
  const [unit, setUnit] = useState(presetUnit ?? unitsOf(prof.course).find((u) => hasContent(u.id))?.id ?? unitsOf(prof.course)[0]?.id);
  const [custom, setCustom] = useState<Set<string>>(new Set());
  const [count, setCount] = useState(presetUnit ? 15 : 20);
  const [mix, setMix] = useState<Mix>('standard');
  const [time, setTime] = useState(0);
  const [essay, setEssay] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (kind === 'unit' && UNIT_BY_ID[unit]?.course !== course) setUnit(unitsOf(course)[0]?.id);
  }, [course, kind]); // eslint-disable-line react-hooks/exhaustive-deps

  const units: string[] = useMemo(() => {
    if (kind === 'unit') return unit ? [unit] : [];
    if (kind === 'mid' || kind === 'final') return unitsOf(course).filter((u) => u.term === kind).map((u) => u.id);
    if (kind === 'custom') return [...custom];
    return diagUnits(course);
  }, [kind, unit, course, custom]);
  const ready = units.filter((u) => hasContent(u));

  const start = async () => {
    setErr('');
    if (!ready.length) return;
    const ex = buildExam({
      kind,
      title: examTitle(kind, course, unit),
      units: ready,
      count: kind === 'diag' ? Math.min(20, ready.length) : count,
      mix,
      timeLimitMin: time,
      courseId: course,
    });
    if (essay && s.settings.geminiKey && kind !== 'diag') {
      setBusy(true);
      try {
        ex.essays = await makeEssays(s.settings.geminiKey, s.settings.geminiModel, ready.map((u) => UNIT_BY_ID[u].title), course);
      } catch (e) {
        setErr('AI 서술형을 만들지 못했어요: ' + (e as Error).message + ' — 서술형 없이 시작하려면 체크를 끄세요.');
        setBusy(false);
        return;
      }
      setBusy(false);
    }
    writeProfileKey('exam', ex);
    navigate('/exam/run');
  };

  const stageCourses = (st: string) => COURSES.filter((c) => c.stage === st);

  return (
    <div className="page">
      <Header title="시험 보기" />
      {current && (
        <section className="card warnbox">
          <div className="card-h">보던 시험이 있어요</div>
          <div className="muted small">{current.title}</div>
          <div className="btnrow">
            <button className="btn primary" onClick={() => navigate('/exam/run')}>
              이어서 보기
            </button>
            <button className="btn ghost" onClick={() => (writeProfileKey('exam', null), navigate('/exam?' + Date.now(), true))}>
              버리기
            </button>
          </div>
        </section>
      )}
      <div className="kinds">
        {KINDS.map((k) => (
          <button key={k.id} className={'card kind' + (kind === k.id ? ' on' : '')} onClick={() => setKind(k.id)}>
            <span className="tile-ic">{k.ic}</span>
            <span className="tile-t">{k.name}</span>
            <span className="tile-s">{k.desc}</span>
          </button>
        ))}
      </div>

      <section className="card form">
        {kind !== 'custom' && (
          <label className="frow">
            <span>과정</span>
            <select value={course} onChange={(e) => setCourse(e.target.value)}>
              {(['e', 'm', 'h'] as const).map((st) => (
                <optgroup key={st} label={st === 'e' ? '초등' : st === 'm' ? '중등' : '고등'}>
                  {stageCourses(st).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        )}
        {kind === 'unit' && (
          <label className="frow">
            <span>단원</span>
            <select value={unit} onChange={(e) => setUnit(e.target.value)}>
              {unitsOf(course).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.no}. {u.title}
                  {hasContent(u.id) ? '' : ' (준비 중)'}
                </option>
              ))}
            </select>
          </label>
        )}
        {kind === 'custom' && <CustomPicker sel={custom} setSel={setCustom} defaultCourse={prof.course} />}
        {(kind === 'mid' || kind === 'final' || kind === 'diag') && (
          <div className="frow col">
            <span>범위 {kind === 'diag' && <span className="muted small">(선수 단원 1문항씩)</span>}</span>
            <div className="scope">
              {units.length === 0 && <span className="muted small">{kind === 'diag' ? '이 과정은 진단할 이전 단원이 없어요.' : '단원이 없어요.'}</span>}
              {units.map((u) => (
                <span key={u} className={'scopechip' + (hasContent(u) ? '' : ' dim')}>
                  {kind === 'diag' ? COURSE_BY_ID[UNIT_BY_ID[u].course].title + ' ' : ''}
                  {UNIT_BY_ID[u].title}
                </span>
              ))}
            </div>
          </div>
        )}
        {kind !== 'diag' && (
          <>
            <div className="frow">
              <span>문항 수</span>
              <div className="seg">
                {[10, 15, 20, 25].map((n) => (
                  <button key={n} className={count === n ? 'on' : ''} onClick={() => setCount(n)}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="frow">
              <span>난이도</span>
              <div className="seg">
                {(Object.keys(MIX) as Mix[]).map((m) => (
                  <button key={m} className={mix === m ? 'on' : ''} onClick={() => setMix(m)}>
                    {MIX[m].name}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        <div className="frow">
          <span>시간</span>
          <div className="seg">
            {[0, 30, 45, 50].map((t) => (
              <button key={t} className={time === t ? 'on' : ''} onClick={() => setTime(t)}>
                {t ? `${t}분` : '없음'}
              </button>
            ))}
          </div>
        </div>
        {kind !== 'diag' && (
          <label className="frow check">
            <input type="checkbox" checked={essay} onChange={(e) => setEssay(e.target.checked)} disabled={!s.settings.geminiKey} />
            <span>
              AI 서술형 2문항 추가 {!s.settings.geminiKey && <span className="muted small">(설정에서 Gemini 키를 넣으면 쓸 수 있어요)</span>}
            </span>
          </label>
        )}
        {units.length > ready.length && <div className="muted small">문제가 준비되지 않은 단원 {units.length - ready.length}개는 빠져요.</div>}
        {err && <div className="err">{err}</div>}
        <div className="btnrow">
          <button className="btn primary grow" disabled={!ready.length || busy} onClick={start}>
            {busy ? 'AI 서술형 만드는 중…' : ready.length ? '시험 시작' : '출제할 수 있는 단원이 없어요'}
          </button>
        </div>
      </section>
      <ExamHistory />
    </div>
  );
}

function CustomPicker({ sel, setSel, defaultCourse }: { sel: Set<string>; setSel: (s: Set<string>) => void; defaultCourse: string }) {
  const [c, setC] = useState(defaultCourse);
  const toggle = (id: string) => {
    const n = new Set(sel);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    setSel(n);
  };
  return (
    <div className="frow col">
      <span>단원 고르기 (여러 과정 가능) · {sel.size}개 선택</span>
      <select value={c} onChange={(e) => setC(e.target.value)}>
        {COURSES.map((x) => (
          <option key={x.id} value={x.id}>
            {x.title}
          </option>
        ))}
      </select>
      <div className="checklist">
        {unitsOf(c).map((u) => (
          <label key={u.id} className={'ck' + (hasContent(u.id) ? '' : ' dim')}>
            <input type="checkbox" checked={sel.has(u.id)} onChange={() => toggle(u.id)} />
            {u.no}. {u.title}
            {hasContent(u.id) ? '' : ' (준비 중)'}
          </label>
        ))}
      </div>
      {sel.size > 0 && (
        <div className="scope">
          {[...sel].map((u) => (
            <button key={u} className="scopechip" onClick={() => toggle(u)}>
              {COURSE_BY_ID[UNIT_BY_ID[u].course].title} {UNIT_BY_ID[u].title} ✕
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ExamHistory() {
  const exams = useStore((s) => s.data.exams);
  if (!exams.length) return null;
  return (
    <section className="card">
      <div className="card-h">지난 시험</div>
      <div className="hist">
        {exams.slice(0, 8).map((e) => (
          <button key={e.id} className="histrow" onClick={() => navigate(`/exam/result/${e.id}`)}>
            <span className="hscore">{e.score}</span>
            <span className="ht">
              <span>{e.title}</span>
              <span className="muted small">
                {new Date(e.date).toLocaleDateString('ko-KR')} · {e.correct}/{e.count}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

// ───────────────────────── 시험 보기 ─────────────────────────
export function ExamRun() {
  const [scratch, setScratch] = useState(false);
  const [ex, setEx] = useState<ExamState | null>(() => readProfileKey<ExamState>('exam'));
  const [i, setI] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [confirm, setConfirm] = useState(false);
  const problems = useMemo(() => ex?.items.map((it) => examProblem(it)) ?? [], [ex?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const remain = ex && ex.timeLimitMin ? ex.startedAt + ex.timeLimitMin * 60000 - now : Infinity;
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (ex && remain <= 0) submit();
  }, [remain <= 0]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ex)
    return (
      <div className="page">
        <Header title="시험" back="/exam" />
        <div className="card muted">진행 중인 시험이 없어요.</div>
      </div>
    );

  const setAnswer = (v: UserAnswer) => {
    const answers = [...ex.answers];
    answers[i] = v;
    const n = { ...ex, answers };
    setEx(n);
    writeProfileKey('exam', n);
  };
  const setEssayAns = (k: number, v: string) => {
    const essays = (ex.essays ?? []).map((e, j) => (j === k ? { ...e, mine: v } : e));
    const n = { ...ex, essays };
    setEx(n);
    writeProfileKey('exam', n);
  };

  function submit() {
    if (!ex) return;
    const res = gradeExam(ex);
    res.per.forEach((x) => recordAnswer(x.problem, x.ok));
    const rec: ExamRecord = {
      id: ex.id,
      date: Date.now(),
      kind: ex.kind,
      title: ex.title,
      score: res.score,
      correct: res.correct,
      count: res.count,
      durationSec: Math.round((Date.now() - ex.startedAt) / 1000),
      units: res.units,
      items: ex.items.map((it, k) => ({ key: it.key, asChoice: it.asChoice, answer: ex.answers[k] ?? null, ok: res.per[k]?.ok ?? false, points: res.per[k]?.points ?? 0 })),
      essays: ex.essays,
    };
    if (ex.kind === 'diag') {
      // 진단에서 맞힌 단원은 별 1개(숙련도 50)로 인증 → 다시 처음부터 반복하지 않아도 됨
      const okUnits = Object.entries(res.units)
        .filter(([, v]) => v.c === v.n)
        .map(([u]) => u);
      rec.certified = certifyUnits(okUnits);
    }
    updateData((d) => ({ ...d, exams: [rec, ...d.exams.filter((e) => e.id !== rec.id)].slice(0, 60) }));
    rewardExam(rec.score, res.per.map((x) => x.problem.unitId));
    writeProfileKey('exam', null);
    navigate(`/exam/result/${rec.id}`, true);
  }

  const total = problems.length + (ex.essays?.length ?? 0);
  const answered = (k: number) => {
    const a = ex.answers[k];
    return a !== undefined && a !== '' && !(Array.isArray(a) && a.every((x) => !x));
  };
  const nAnswered = problems.filter((_, k) => answered(k)).length;
  const isEssay = i >= problems.length;
  const p = problems[i];
  const mm = Math.max(0, Math.floor(remain / 60000));
  const ss = Math.max(0, Math.floor((remain % 60000) / 1000));

  return (
    <div className="page exam">
      <Header title={ex.title} back={() => navigate('/exam')}>
        <ScratchButton on={scratch} onToggle={() => setScratch(!scratch)} />
        {ex.timeLimitMin > 0 && <span className={'timer' + (remain < 300000 ? ' low' : '')}>{`${mm}:${String(ss).padStart(2, '0')}`}</span>}
      </Header>
      <div className="qnav">
        {problems.map((_, k) => (
          <button key={k} className={(k === i ? 'cur ' : '') + (answered(k) ? 'done' : '')} onClick={() => setI(k)}>
            {k + 1}
          </button>
        ))}
        {(ex.essays ?? []).map((e, k) => (
          <button key={'e' + k} className={(i === problems.length + k ? 'cur ' : '') + (e.mine ? 'done' : '')} onClick={() => setI(problems.length + k)}>
            서{k + 1}
          </button>
        ))}
      </div>
      <section className="card pcard">
        {!isEssay && p ? (
          <>
            <div className="pmeta">
              <span className="muted small">
                {i + 1}번 · {['3', '4', '5'][p.level - 1]}점 · {UNIT_BY_ID[p.unitId].title}
              </span>
            </div>
            <ProblemBody p={p} />
            <AnswerInput p={p} value={ex.answers[i]} onChange={setAnswer} onEnter={() => i + 1 < total && setI(i + 1)} />
          </>
        ) : isEssay && ex.essays ? (
          <>
            <div className="pmeta">
              <span className="ai-badge">AI 생성 서술형</span>
              <span className="muted small">스스로 채점해요</span>
            </div>
            <MathText className="pq" text={ex.essays[i - problems.length].q} />
            <textarea className="essay" rows={7} placeholder="풀이 과정을 써 보세요" value={ex.essays[i - problems.length].mine ?? ''} onChange={(e) => setEssayAns(i - problems.length, e.target.value)} />
          </>
        ) : null}
        <div className="btnrow">
          <button className="btn" disabled={i === 0} onClick={() => setI(i - 1)}>
            이전
          </button>
          {i + 1 < total ? (
            <button className="btn primary grow" onClick={() => setI(i + 1)}>
              다음
            </button>
          ) : (
            <button className="btn primary grow" onClick={() => setConfirm(true)}>
              제출하기
            </button>
          )}
        </div>
      </section>
      <div className="btnrow">
        <button className="btn ghost" onClick={() => navigate('/exam/print/current')}>
          🖨 시험지 인쇄
        </button>
        <button className="btn ghost" onClick={() => setConfirm(true)}>
          제출 ({nAnswered}/{problems.length} 답함)
        </button>
      </div>
      {confirm && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="card modal-card">
            <div className="card-h">제출할까요?</div>
            <div className="muted">
              {problems.length}문항 중 {nAnswered}문항에 답했어요.{nAnswered < problems.length && ' 답하지 않은 문항은 틀린 것으로 처리돼요.'}
            </div>
            <div className="btnrow">
              <button className="btn" onClick={() => setConfirm(false)}>
                계속 풀기
              </button>
              <button className="btn primary" onClick={submit}>
                제출
              </button>
            </div>
          </div>
        </div>
      )}
      {scratch && <Scratchpad resetKey={String(i)} onClose={() => setScratch(false)} />}
    </div>
  );
}

// ───────────────────────── 결과 ─────────────────────────
export function ExamResult({ id }: { id: string }) {
  const d = useStore((s) => s.data);
  const rec = d.exams.find((e) => e.id === id);
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [onlyWrong, setOnlyWrong] = useState(false);
  const problems = useMemo(() => rec?.items.map((it) => examProblem(it)) ?? [], [rec?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!rec) return <NotFound />;
  const weak = Object.entries(rec.units)
    .filter(([, v]) => v.c < v.n)
    .map(([u]) => u);
  const setSelf = (k: number, v: 'ok' | 'part' | 'no') =>
    updateData((dd) => ({
      ...dd,
      exams: dd.exams.map((e) => (e.id === rec.id ? { ...e, essays: e.essays?.map((x, j) => (j === k ? { ...x, self: v } : x)) } : e)),
    }));
  return (
    <div className="page">
      <Header title="시험 결과" back="/exam">
        <button className="btn small ghost" onClick={() => navigate(`/exam/print/${rec.id}`)}>
          🖨 인쇄
        </button>
      </Header>
      <section className="card result-card">
        <Mascot mood={rec.score >= 70 ? 'cheer' : rec.score >= 50 ? 'happy' : 'think'} size={88} className="res-mascot" />
        <div className="muted small">{rec.title}</div>
        <div className="big">
          {rec.score}
          <small>점</small>
        </div>
        <div className="muted">
          {rec.count}문항 중 {rec.correct}문항 정답 · {Math.floor(rec.durationSec / 60)}분 {rec.durationSec % 60}초
        </div>
        <div className="resmsg">{rec.score >= 90 ? '아주 훌륭해요! 🏆' : rec.score >= 70 ? '잘했어요! 틀린 문제만 다시 보면 완벽해요.' : rec.score >= 50 ? '기본은 갖췄어요. 약한 단원을 연습해 봐요.' : '개념부터 차근차근 다시 해 봐요.'}</div>
      </section>
      <section className="card">
        <div className="card-h">단원별 정답률</div>
        <div className="ubars">
          {Object.entries(rec.units).map(([u, v]) => (
            <div key={u} className="ubar">
              <button className="link" onClick={() => navigate(`/unit/${u}`)}>
                {rec.kind === 'diag' || rec.kind === 'custom' ? COURSE_BY_ID[UNIT_BY_ID[u].course].title + ' ' : ''}
                {UNIT_BY_ID[u].title}
              </button>
              <Bar value={(100 * v.c) / v.n} color={v.c === v.n ? 'var(--good)' : v.c / v.n >= 0.5 ? 'var(--accent)' : 'var(--warn)'} />
              <span className="small muted">
                {v.c}/{v.n}
              </span>
            </div>
          ))}
        </div>
      </section>
      {rec.certified && rec.certified.length > 0 && (
        <section className="card goodbox">
          <div className="card-h">🎓 인증된 단원 {rec.certified.length}개</div>
          <div className="muted small">진단에서 맞힌 단원은 별 1개(숙련도 50)로 인증했어요. 처음부터 반복하지 않고 다음 단계로 바로 갈 수 있어요.</div>
          <div className="links">
            {rec.certified.map((u) => (
              <UnitLink key={u} u={UNIT_BY_ID[u]} mastery={unitMastery(d, u)} />
            ))}
          </div>
        </section>
      )}
      {weak.length > 0 && (
        <section className="card warnbox">
          <div className="card-h">{rec.kind === 'diag' ? '다시 다져야 할 기초 단원' : '더 연습할 단원'}</div>
          <div className="links">
            {weak.map((u) => (
              <UnitLink key={u} u={UNIT_BY_ID[u]} mastery={unitMastery(d, u)} />
            ))}
          </div>
          <div className="muted small">틀린 문제는 오답노트에 자동으로 들어갔어요.</div>
        </section>
      )}
      {rec.essays && rec.essays.length > 0 && (
        <section className="card">
          <div className="card-h">
            서술형 <span className="ai-badge">AI 생성 · 자기 채점</span>
          </div>
          {rec.essays.map((e, k) => (
            <div key={k} className="essayres">
              <MathText className="pq" text={`**서${k + 1}.** ${e.q}`} />
              <div className="sub-h">내 답</div>
              <div className="mine">{e.mine || '(무응답)'}</div>
              <div className="sub-h">모범 답안</div>
              <MathText text={e.answer} />
              <div className="sub-h">채점 기준</div>
              <MathText className="muted small" text={e.rubric} />
              <div className="seg selfgrade">
                {(['ok', 'part', 'no'] as const).map((v) => (
                  <button key={v} className={e.self === v ? 'on' : ''} onClick={() => setSelf(k, v)}>
                    {v === 'ok' ? '맞음' : v === 'part' ? '부분 점수' : '틀림'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
      <section className="card">
        <div className="card-h">
          문항별 확인
          <label className="small check inline">
            <input type="checkbox" checked={onlyWrong} onChange={(e) => setOnlyWrong(e.target.checked)} /> 틀린 문제만
          </label>
        </div>
        <div className="review">
          {problems.map((p, k) => {
            if (!p) return null;
            const it = rec.items[k];
            if (onlyWrong && it.ok) return null;
            const isOpen = open.has(k);
            return (
              <div key={k} className={'rv ' + (it.ok ? 'ok' : 'no')}>
                <button
                  className="rv-h"
                  onClick={() => {
                    const n = new Set(open);
                    if (n.has(k)) n.delete(k);
                    else n.add(k);
                    setOpen(n);
                  }}
                >
                  <span className="mark">{it.ok ? '○' : '✕'}</span>
                  <span className="rv-n">{k + 1}번</span>
                  <span className="muted small">
                    {UNIT_BY_ID[p.unitId].title} · {it.points}점
                  </span>
                  <span className="chev">{isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && (
                  <div className="rv-b">
                    <ProblemBody p={p} />
                    {p.answer.type === 'choice' && <AnswerInput p={p} value={it.answer as UserAnswer} onChange={() => {}} locked autoFocus={false} />}
                    <div className="rv-ans">
                      <div>
                        내 답: <MathText as="span" text={userAnswerText(p, (it.answer ?? undefined) as UserAnswer | undefined)} />
                        {judge(p.answer, (it.answer ?? undefined) as UserAnswer | undefined).note && <span className="muted small"> ({judge(p.answer, it.answer as UserAnswer).note})</span>}
                      </div>
                      <div>
                        정답: <MathText as="span" text={answerText(p.answer, p.unitId)} />
                      </div>
                    </div>
                    <Steps steps={p.steps} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
      <div className="btnrow">
        <button className="btn primary" onClick={() => navigate('/exam')}>
          새 시험
        </button>
        <button className="btn" onClick={() => navigate('/wrong')}>
          오답노트
        </button>
      </div>
    </div>
  );
}

// ───────────────────────── 인쇄 ─────────────────────────
export function ExamPrint({ id }: { id: string }) {
  const [withAns, setWithAns] = useState(true);
  const src = useMemo(() => {
    if (id === 'current') {
      const ex = readProfileKey<ExamState>('exam');
      return ex ? { title: ex.title, items: ex.items, essays: ex.essays, back: '/exam/run' } : null;
    }
    const rec = getState().data.exams.find((e) => e.id === id);
    return rec ? { title: rec.title, items: rec.items, essays: rec.essays, back: `/exam/result/${id}` } : null;
  }, [id]);
  if (!src) return <NotFound />;
  const problems = src.items.map((it) => examProblem(it));
  const prof = activeProfile(getState());
  return (
    <div className="page printpage">
      <div className="noprint">
        <Header title="시험지 인쇄" back={src.back} />
        <div className="card">
          <label className="check">
            <input type="checkbox" checked={withAns} onChange={(e) => setWithAns(e.target.checked)} /> 정답·풀이 페이지 함께 인쇄
          </label>
          <div className="btnrow">
            <button className="btn primary" onClick={() => window.print()}>
              인쇄하기
            </button>
          </div>
        </div>
      </div>
      <div className="sheet">
        <div className="sheet-h">
          <div className="sheet-t">{src.title}</div>
          <div className="sheet-name">
            이름: <span className="blank">{prof.name}</span> 날짜: <span className="blank" /> 점수: <span className="blank" />
          </div>
        </div>
        {problems.map((p, k) =>
          p ? (
            <div key={k} className="sq">
              <div className="sq-pts">[{['3', '4', '5'][p.level - 1]}점]</div>
              <ProblemBody p={p} num={k + 1} />
              {p.answer.type === 'choice' ? (
                <div className="sq-choices">
                  {p.answer.choices.map((c, j) => (
                    <span key={j} className="sqc">
                      {'①②③④⑤⑥'[j]} <MathText as="span" text={c} />
                    </span>
                  ))}
                </div>
              ) : (
                <div className="sq-blank">
                  답:{' '}
                  {p.answer.type === 'fields' ? p.answer.fields.map((f) => `${f.label} ______ `).join('  ') : '________________'}
                  {p.answer.type === 'num' && p.answer.unit ? ' ' + p.answer.unit : ''}
                </div>
              )}
            </div>
          ) : null,
        )}
        {(src.essays ?? []).map((e, k) => (
          <div key={'e' + k} className="sq">
            <MathText className="pq" text={`**서술형 ${k + 1}.** ${e.q}`} />
            <div className="sq-essay" />
          </div>
        ))}
      </div>
      {withAns && (
        <div className="sheet answers">
          <div className="sheet-t">정답 및 풀이 — {src.title}</div>
          {problems.map((p, k) =>
            p ? (
              <div key={k} className="sa">
                <b>{k + 1}.</b> <MathText as="span" text={answerText(p.answer, p.unitId)} />
                <div className="sa-steps">
                  {p.steps.map((s, j) => (
                    <MathText key={j} text={s} />
                  ))}
                </div>
              </div>
            ) : null,
          )}
          {(src.essays ?? []).map((e, k) => (
            <div key={'e' + k} className="sa">
              <b>서술형 {k + 1}.</b>
              <MathText text={e.answer} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
