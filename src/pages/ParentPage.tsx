// 부모 메뉴: PIN 으로 잠금 → 학습 리포트 + 설정(오늘의 학습 분량·학년·문제 형식·잠금·AI·백업)
import { useEffect, useMemo, useState } from 'react';
import { CONTENT } from '../content';
import { COURSE_BY_ID, UNIT_BY_ID, unitLabel } from '../core/curriculum';
import { answerText } from '../core/check';
import { problemFromKey, getSkill } from '../core/problem';
import { pitfalls } from '../content/meta';
import { unitMastery, unitAttempted } from '../lib/mastery';
import { levelInfo, rwOf, streakDays } from '../lib/reward';
import { checkPin, checkRecovery, hasPin, isUnlocked, lockNow, removePin, setPin } from '../lib/pin';
import { navigate } from '../lib/router';
import { activeProfile, dayKey, getState, switchProfile, useStore } from '../lib/store';
import { Header, Ring } from '../ui/bits';
import { DailyCalendar } from '../ui/DailyCalendar';
import { MathText } from '../ui/MathText';
import { SettingsPage } from './SettingsPage';


export function ParentPage({ tab = 'report' }: { tab?: string }) {
  const [, force] = useState(0);
  const pinOff = useStore((s) => s.settings.pinOff);
  if (!isUnlocked()) return <PinGate onOk={() => force((x) => x + 1)} />;
  if (!hasPin() && !pinOff) return <PinSetup first onDone={() => force((x) => x + 1)} />;
  return (
    <div className="page parent">
      <Header title="부모 메뉴" back="/">
        <button
          className="btn small"
          onClick={() => {
            lockNow();
            navigate('/');
          }}
        >
          🔒 잠그고 나가기
        </button>
      </Header>
      <div className="tabs">
        <button className={tab === 'report' ? 'on' : ''} onClick={() => navigate('/parent', true)}>
          학습 리포트
        </button>
        <button className={tab === 'settings' ? 'on' : ''} onClick={() => navigate('/parent/settings', true)}>
          설정
        </button>
      </div>
      {tab === 'settings' ? (
        <>
          <SettingsPage parent />
          <PinManage onChange={() => force((x) => x + 1)} />
        </>
      ) : (
        <Report />
      )}
    </div>
  );
}

// ───────── PIN 입력 ─────────
function Keypad({ value, onChange, onEnter, len = 4 }: { value: string; onChange: (v: string) => void; onEnter?: (v: string) => void; len?: number }) {
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key) && value.length < len) {
        const v = value + e.key;
        onChange(v);
        if (v.length === len) onEnter?.(v);
      } else if (e.key === 'Backspace') onChange(value.slice(0, -1));
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [value, onChange, onEnter, len]);
  const press = (k: string) => {
    if (k === '⌫') return onChange(value.slice(0, -1));
    if (value.length >= len) return;
    const v = value + k;
    onChange(v);
    if (v.length === len) onEnter?.(v);
  };
  return (
    <div className="pin">
      <div className="pin-dots" aria-label={`${value.length}자리 입력됨`}>
        {Array.from({ length: len }, (_, i) => (
          <span key={i} className={i < value.length ? 'on' : ''} />
        ))}
      </div>
      <div className="pin-keys">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) =>
          k ? (
            <button key={i} className="pin-key" onClick={() => press(k)} aria-label={k === '⌫' ? '지우기' : k}>
              {k}
            </button>
          ) : (
            <span key={i} />
          ),
        )}
      </div>
    </div>
  );
}

function PinGate({ onOk }: { onOk: () => void }) {
  const [v, setV] = useState('');
  const [err, setErr] = useState('');
  const [fails, setFails] = useState(0);
  const [waitUntil, setWaitUntil] = useState(0);
  const [forgot, setForgot] = useState(false);
  const [ans, setAns] = useState('');
  const [, tick] = useState(0);
  useEffect(() => {
    if (waitUntil <= Date.now()) return;
    const t = setInterval(() => tick((x) => x + 1), 500);
    return () => clearInterval(t);
  }, [waitUntil]);
  const waiting = waitUntil > Date.now();
  const rec = getState().settings.pinRecovery;
  const tryPin = async (pin: string) => {
    if (waiting) return;
    if (await checkPin(pin)) onOk();
    else {
      const f = fails + 1;
      setFails(f);
      setV('');
      if (f >= 5) {
        setWaitUntil(Date.now() + 30000);
        setFails(0);
        setErr('5번 틀려서 30초 동안 기다려야 해요.');
      } else setErr(`PIN 이 맞지 않아요 (${f}/5)`);
    }
  };
  return (
    <div className="page">
      <Header title="부모 메뉴" back="/" />
      <section className="card pin-card">
        <div className="pin-lock">🔒</div>
        <div className="card-h">부모님 PIN 을 입력하세요</div>
        {!forgot ? (
          <>
            <Keypad value={v} onChange={(x) => (setV(x), setErr(''))} onEnter={tryPin} />
            {waiting ? <div className="err">{Math.ceil((waitUntil - Date.now()) / 1000)}초 뒤에 다시 시도해 주세요.</div> : err && <div className="err">{err}</div>}
            <button className="link" onClick={() => setForgot(true)}>
              PIN 을 잊었어요
            </button>
          </>
        ) : rec ? (
          <form
            className="pin-forgot"
            onSubmit={async (e) => {
              e.preventDefault();
              if (await checkRecovery(ans)) {
                removePin();
                onOk();
              } else setErr('답이 맞지 않아요.');
            }}
          >
            <div className="muted small">확인 질문: {rec.q}</div>
            <input id="pin-recovery" type="text" value={ans} onChange={(e) => setAns(e.target.value)} placeholder="답" autoComplete="off" />
            <button className="btn primary" type="submit">
              확인하고 PIN 다시 만들기
            </button>
            {err && <div className="err">{err}</div>}
          </form>
        ) : (
          <div className="muted small">
            확인 질문을 만들지 않았어요. 이 기기 브라우저의 사이트 데이터를 지우면 PIN 이 없어지지만 학습 기록도 함께 지워져요. 먼저 부모 메뉴에서 받아 둔 백업 파일이 있다면 지운 뒤 불러오기로 되살릴 수 있어요.
          </div>
        )}
      </section>
    </div>
  );
}

function PinSetup({ first, onDone }: { first?: boolean; onDone: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [q, setQ] = useState('');
  const [qa, setQa] = useState('');
  const [err, setErr] = useState('');
  return (
    <div className={first ? 'page' : ''}>
      {first && <Header title="부모 메뉴" back="/" />}
      <section className="card pin-card">
        <div className="pin-lock">🔐</div>
        {step === 1 && (
          <>
            <div className="card-h">부모님 PIN 만들기 (숫자 4자리)</div>
            <div className="muted small">오늘의 학습 분량, 학년, 문제 형식 같은 설정과 학습 리포트를 아이가 바꾸지 못하게 잠가요.</div>
            <Keypad value={a} onChange={setA} onEnter={() => setStep(2)} />
            {first && (
              <button className="link" onClick={() => (removePin(true), onDone())}>
                PIN 없이 쓰기
              </button>
            )}
          </>
        )}
        {step === 2 && (
          <>
            <div className="card-h">한 번 더 입력해 주세요</div>
            <Keypad
              value={b}
              onChange={(x) => (setB(x), setErr(''))}
              onEnter={(v) => {
                if (v === a) setStep(3);
                else {
                  setErr('두 번 입력한 PIN 이 달라요. 처음부터 다시 해 주세요.');
                  setA('');
                  setB('');
                  setStep(1);
                }
              }}
            />
          </>
        )}
        {step === 3 && (
          <form
            className="pin-forgot"
            onSubmit={async (e) => {
              e.preventDefault();
              await setPin(a, { q, a: qa });
              onDone();
            }}
          >
            <div className="card-h">PIN 을 잊었을 때 쓸 확인 질문 (선택)</div>
            <div className="muted small">예: "아이가 태어난 병원 이름은?" — 아이가 모르는 질문으로 정해 주세요.</div>
            <input id="pin-q" type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="질문" autoComplete="off" />
            <input id="pin-a" type="text" value={qa} onChange={(e) => setQa(e.target.value)} placeholder="답" autoComplete="off" />
            <button className="btn primary" type="submit">
              {q.trim() && qa.trim() ? '저장하기' : '질문 없이 저장'}
            </button>
          </form>
        )}
        {err && <div className="err">{err}</div>}
      </section>
    </div>
  );
}

function PinManage({ onChange }: { onChange: () => void }) {
  const [changing, setChanging] = useState(false);
  if (changing) return <PinSetup onDone={() => (setChanging(false), onChange())} />;
  return (
    <section className="card form">
      <div className="card-h">부모 PIN</div>
      <div className="muted small">{hasPin() ? 'PIN 이 설정돼 있어요. 부모 메뉴는 열고 10분 동안만 열려 있어요.' : 'PIN 이 없어서 누구나 부모 메뉴를 열 수 있어요.'}</div>
      <div className="btnrow">
        <button className="btn" onClick={() => setChanging(true)}>
          {hasPin() ? 'PIN 바꾸기' : 'PIN 만들기'}
        </button>
        {hasPin() && (
          <button className="btn ghost" onClick={() => (removePin(true), onChange())}>
            PIN 없애기
          </button>
        )}
      </div>
    </section>
  );
}

// ───────── 학습 리포트 ─────────
const DAY = 86400000;

function Report() {
  const s = useStore((x) => x);
  const d = s.data;
  const prof = activeProfile(s);
  const rw = rwOf(d);
  const lv = levelInfo(rw.xp);
  const week = Array.from({ length: 7 }, (_, i) => {
    const t = Date.now() - (6 - i) * DAY;
    const k = dayKey(t);
    return { k, date: new Date(t), ...(d.days[k] ?? { n: 0, c: 0 }), done: !!rw.dailyDone?.[k] };
  });
  const wn = week.reduce((a, x) => a + x.n, 0);
  const wc = week.reduce((a, x) => a + x.c, 0);
  const wDone = week.filter((x) => x.done).length;
  const max = Math.max(5, ...week.map((x) => x.n));

  // 지도가 필요한 단원: 풀어 본 단원 중 숙련도 60 미만
  const weakUnits = useMemo(() => {
    const out: { id: string; m: number; acc: number; n: number; weakSkill?: string; last: number }[] = [];
    for (const id of Object.keys(CONTENT)) {
      if (!unitAttempted(d, id)) continue;
      const m = unitMastery(d, id) ?? 0;
      if (m >= 60) continue;
      let n = 0,
        c = 0,
        last = 0,
        worst: { id: string; sc: number } | null = null;
      for (const sk of CONTENT[id].skills) {
        const st = d.skills[`${id}/${sk.id}`];
        if (!st || !st.n) continue;
        n += st.n;
        c += st.c;
        last = Math.max(last, st.last);
        if (!worst || st.score < worst.sc) worst = { id: sk.id, sc: st.score };
      }
      out.push({ id, m, acc: n ? c / n : 0, n, weakSkill: worst ? CONTENT[id].skills.find((x) => x.id === worst!.id)?.title : undefined, last });
    }
    return out.sort((a, b) => a.m - b.m || b.last - a.last).slice(0, 5);
  }, [d]);

  // 자주 틀리는 유형 (복습 중인 오답)
  const wrongSkills = useMemo(() => {
    const g: Record<string, { unitId: string; skillId: string; cnt: number; key: string; last: number }> = {};
    for (const w of Object.values(d.wrong)) {
      if (w.graduated || !CONTENT[w.unitId]) continue;
      const k = `${w.unitId}/${w.skillId}`;
      const cur = g[k] ?? { unitId: w.unitId, skillId: w.skillId, cnt: 0, key: w.key, last: 0 };
      cur.cnt += w.wrongCount;
      if (w.lastWrong > cur.last) {
        cur.last = w.lastWrong;
        cur.key = w.key;
      }
      g[k] = cur;
    }
    return Object.values(g)
      .sort((a, b) => b.cnt - a.cnt || b.last - a.last)
      .slice(0, 5);
  }, [d]);

  const tips: string[] = [];
  if (wDone < 3) tips.push('이번 주 오늘의 학습을 끝낸 날이 적어요. 매일 같은 시간에 하도록 정해 주면 좋아요.');
  if (wn > 0 && wc / wn < 0.6) tips.push('최근 정답률이 60% 아래예요. 하루 목표를 조금 줄이고 개념 카드를 함께 읽어 보세요.');
  if (weakUnits.length) tips.push(`「${UNIT_BY_ID[weakUnits[0].id].title}」를 가장 어려워해요. 아래 '흔한 실수'를 같이 보며 이야기해 주세요.`);
  if (wn > 0 && wc / wn >= 0.85 && wDone >= 5) tips.push('아주 잘하고 있어요! 칭찬해 주고, 하루 목표를 조금 늘리거나 심화 문제에 도전하게 해 보세요.');

  return (
    <>
      {s.profiles.length > 1 && (
        <div className="seg prof-switch">
          {s.profiles.map((p) => (
            <button key={p.id} className={p.id === s.active ? 'on' : ''} onClick={() => switchProfile(p.id)}>
              {p.name}
            </button>
          ))}
        </div>
      )}
      <section className="card">
        <div className="card-h">
          {prof.name} · {COURSE_BY_ID[prof.course]?.title} <span className="muted small">최근 7일</span>
        </div>
        <div className="rep-stats">
          <div>
            <b>{wn}</b>
            <span>푼 문제</span>
          </div>
          <div>
            <b>{wn ? Math.round((100 * wc) / wn) : 0}%</b>
            <span>정답률</span>
          </div>
          <div>
            <b>{wDone}/7</b>
            <span>오늘의 학습</span>
          </div>
          <div>
            <b>{streakDays(d)}일</b>
            <span>연속 학습</span>
          </div>
          <div>
            <b>Lv.{lv.level}</b>
            <span>{lv.title}</span>
          </div>
          <div>
            <b>{rw.overcome ?? 0}</b>
            <span>오답 극복</span>
          </div>
        </div>
        <div className="rep-week">
          {week.map((x) => (
            <div key={x.k} className="rw-col" title={`${x.k}: ${x.n}문제, ${x.c}개 정답`}>
              <div className="rw-bar">
                <div style={{ height: `${(x.n / max) * 100}%` }}>
                  <div className="rw-ok" style={{ height: x.n ? `${(x.c / x.n) * 100}%` : 0 }} />
                </div>
              </div>
              <span className="rw-n">{x.n || ''}</span>
              <span className={'rw-d' + (x.done ? ' done' : '')}>{['일', '월', '화', '수', '목', '금', '토'][x.date.getDay()]}</span>
            </div>
          ))}
        </div>
        <div className="muted small">막대 진한 부분 = 맞힌 문제 · 초록 요일 = 오늘의 학습 완료 · 하루 목표 {rw.goal}문제</div>
      </section>

      {tips.length > 0 && (
        <section className="card tipbox">
          <div className="card-h">💡 이렇게 도와주세요</div>
          <ul>
            {tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="card">
        <div className="card-h">지도가 필요한 단원</div>
        {weakUnits.length === 0 ? (
          <div className="muted small">숙련도 60 미만인 단원이 없어요. 잘하고 있어요!</div>
        ) : (
          <div className="weaklist">
            {weakUnits.map((w) => (
              <div key={w.id} className="weakrow">
                <Ring value={w.m} size={44} />
                <div className="wk-info">
                  <div className="b">{unitLabel(UNIT_BY_ID[w.id])}</div>
                  <div className="muted small">
                    정답률 {Math.round(w.acc * 100)}% · {w.n}문제 풀었음{w.weakSkill ? ` · 가장 약한 유형: ${w.weakSkill}` : ''}
                  </div>
                  {pitfalls(w.id)[0] && (
                    <div className="wk-tip">
                      ⚠️ <MathText as="span" text={pitfalls(w.id)[0]} />
                    </div>
                  )}
                </div>
                <button className="btn small" onClick={() => navigate(`/unit/${w.id}`)}>
                  개념 같이 보기
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <div className="card-h">자주 틀리는 유형</div>
        {wrongSkills.length === 0 ? (
          <div className="muted small">복습 중인 오답이 없어요.</div>
        ) : (
          wrongSkills.map((w) => <WrongSample key={w.key} unitId={w.unitId} skillId={w.skillId} cnt={w.cnt} probKey={w.key} />)
        )}
      </section>

      <DailyCalendar />

      <section className="card">
        <div className="card-h">최근 시험</div>
        {d.exams.length === 0 ? (
          <div className="muted small">아직 본 시험이 없어요.</div>
        ) : (
          <div className="examlist">
            {d.exams.slice(0, 5).map((e) => (
              <button key={e.id} className="examrow" onClick={() => navigate(`/exam/result/${e.id}`)}>
                <span className="b">{e.score}점</span>
                <span className="grow">{e.title}</span>
                <span className="muted small">{new Date(e.date).toLocaleDateString('ko-KR')}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function WrongSample({ unitId, skillId, cnt, probKey }: { unitId: string; skillId: string; cnt: number; probKey: string }) {
  const [open, setOpen] = useState(false);
  const p = problemFromKey(probKey);
  const sk = getSkill(unitId, skillId);
  return (
    <div className="wsample">
      <div className="ws-h">
        <span className="b">{sk?.title ?? skillId}</span>
        <span className="muted small">
          {COURSE_BY_ID[UNIT_BY_ID[unitId].course].title} {UNIT_BY_ID[unitId].title} · {cnt}번 틀림
        </span>
        <button className="link" onClick={() => setOpen(!open)}>
          {open ? '접기' : '틀린 문제 보기'}
        </button>
      </div>
      {open && p && (
        <div className="ws-body">
          <MathText text={p.q} />
          {p.answer.type === 'choice' && (
            <ol className="ws-choices">
              {p.answer.choices.map((c, i) => (
                <li key={i}>
                  <MathText as="span" text={c} />
                </li>
              ))}
            </ol>
          )}
          <div className="small">
            정답: <MathText as="span" text={answerText(p.answer, p.unitId)} />
          </div>
          <ol className="small">
            {p.steps.map((x, i) => (
              <li key={i}>
                <MathText as="span" text={x} />
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
