import { COURSE_BY_ID, STRANDS, UNIT_BY_ID, unitLabel } from '../core/curriculum';
import { isLocked, missingPrereqs } from '../ui/Lock';
import { dueWrong, recommend, unitMastery, courseMastery } from '../lib/mastery';
import { BADGES, levelInfo, questText, rwOf, streakDays, todayQuests, courseStars } from '../lib/reward';
import { navigate } from '../lib/router';
import { activeProfile, dayKey, useStore } from '../lib/store';
import { Bar, Ring } from '../ui/bits';
import { Mascot } from '../ui/Mascot';
import { Icon } from '../ui/Icon';

export function HomePage() {
  const s = useStore((x) => x);
  const prof = activeProfile(s);
  const d = s.data;
  const course = COURSE_BY_ID[prof.course];
  const rec0 = recommend(d, prof.course);
  // 잠금 모드면 잠긴 단원 대신 아직 못 마친 선수 단원을 먼저
  let rec = rec0;
  if (rec0 && isLocked(d, rec0.unit.id, s.settings)) {
    let u = rec0.unit;
    for (let i = 0; i < 30 && isLocked(d, u.id, s.settings); i++) u = UNIT_BY_ID[missingPrereqs(d, u.id)[0]];
    rec = { unit: u, reason: 'prereq', target: rec0.unit };
  }
  const due = dueWrong(d).length;
  const st = streakDays(d);
  const rw = rwOf(d);
  const lv = levelInfo(rw.xp);
  const quests = todayQuests(d);
  const myBadges = BADGES.filter((b) => rw.badges[b.id]).sort((a, b) => rw.badges[b.id] - rw.badges[a.id]);
  const cs = courseStars(d, prof.course);
  const today = d.days[dayKey()] ?? { n: 0, c: 0 };
  const cheer =
    today.n >= rw.goal
      ? '오늘 목표 달성! 정말 멋져요 🎉'
      : today.n > 0
        ? `오늘 ${today.n}문제 풀었어요. 목표까지 ${rw.goal - today.n}문제!`
        : st > 0
          ? `${st}일째 연속 학습 중! 오늘도 한 칸 올라가 볼까요?`
          : '오늘도 한 칸씩, 사다리를 올라가 볼까요?';
  const cm = courseMastery(d, prof.course);
  return (
    <div className="page">
      <section className="hero-banner">
        <div className="hb-text">
          <div className="hello">안녕, {prof.name}!</div>
          <div className="hb-msg">{cheer}</div>
          <button className="hb-chip" onClick={() => navigate('/settings')}>
            {course?.grade} · {course?.title} <span aria-hidden="true">›</span>
          </button>
        </div>
        <Mascot mood={today.n >= rw.goal ? 'cheer' : today.n > 0 ? 'happy' : st > 0 ? 'happy' : 'think'} size={104} className="hb-mascot" />
        <svg className="hb-deco" viewBox="0 0 200 120" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
          <text x="118" y="30">+</text>
          <text x="186" y="44">÷</text>
          <text x="104" y="112">π</text>
          <text x="190" y="112">×</text>
        </svg>
      </section>

      <section className="card lvcard">
        <div className="lv-avatar" aria-label={`레벨 ${lv.level}`}>
          <span className="lv-ic">{lv.icon}</span>
          <span className="lv-n">Lv.{lv.level}</span>
        </div>
        <div className="lv-main">
          <div className="lv-title">{lv.title}</div>
          <div className="xpbar" aria-label={`경험치 ${lv.into} / ${lv.need}`}>
            <div style={{ width: `${(lv.into / lv.need) * 100}%` }} />
          </div>
          <div className="muted small">
            다음 레벨까지 {lv.need - lv.into} XP · 모은 XP {rw.xp.toLocaleString()}
          </div>
        </div>
      </section>

      <div className="statrow">
        <div className="card stat">
          <div className="st-ic">{st > 0 ? '🔥' : '🪵'}</div>
          <div>
            <b>{st}일</b>
            <span>연속 학습</span>
          </div>
          <div className="freeze" title="얼음: 하루 쉬어도 연속 기록을 지켜 줘요">🧊×{rw.freezes}</div>
        </div>
        <div className="card stat goal">
          <GoalRing n={today.n} goal={rw.goal} />
          <div>
            <b>
              {today.n}/{rw.goal}
            </b>
            <span>오늘의 목표</span>
          </div>
        </div>
      </div>

      <section className="card">
        <div className="card-h">
          오늘의 퀘스트 <span className="muted small">하나에 +30 XP, 모두 하면 +50</span>
        </div>
        <div className="quests">
          {quests.map((q) => (
            <div key={q.id} className={'quest' + (q.done ? ' done' : '')}>
              <span className="q-check">{q.done ? '✓' : ''}</span>
              <span className="q-t">{questText(q)}</span>
              <span className="q-bar">
                <span style={{ width: `${(Math.min(q.progress, q.target) / q.target) * 100}%` }} />
              </span>
              <span className="q-n">
                {Math.min(q.progress, q.target)}/{q.target}
              </span>
            </div>
          ))}
        </div>
      </section>
      <section className="card next">
        <div className="card-h">이어서 학습</div>
        {rec ? (
          <>
            {s.settings.lockMode && rec.reason === 'prereq' && rec.unit.course !== prof.course && (
              <div className="tip">
                🔒 잠금 모드예요. 이미 아는 이전 학년 단원은{' '}
                <button className="link" onClick={() => navigate('/exam')}>
                  수준 진단
                </button>
                으로 한 번에 인증하면 바로 내 학년 단원으로 갈 수 있어요.
              </div>
            )}
            {rec.reason === 'prereq' && rec.target && (
              <div className="tip">
                <b>{rec.target.title}</b> 을(를) 하기 전에, 기초가 되는 단원을 먼저 다져요.
              </div>
            )}
            <div className="next-row">
              <Ring value={unitMastery(d, rec.unit.id)} size={56} />
              <div className="next-info">
                <div className="next-title">{unitLabel(rec.unit)}</div>
                <div className="muted small">{rec.unit.summary}</div>
              </div>
            </div>
            <div className="btnrow">
              <button className="btn primary" onClick={() => navigate(`/practice/u/${rec.unit.id}`)}>
                {rec.reason === 'start' ? '시작하기' : '연습하기'}
              </button>
              <button className="btn" onClick={() => navigate(`/unit/${rec.unit.id}`)}>
                개념 보기
              </button>
            </div>
          </>
        ) : (
          <div className="muted">
            {cm.total === 0 ? '이 과정의 문제는 준비 중이에요. 학습 지도에서 다른 단원을 골라 보세요.' : '이 과정의 단원을 모두 익혔어요! 시험으로 실력을 확인해 보세요.'}
          </div>
        )}
      </section>

      <div className="grid2">
        <button className="card tile" onClick={() => navigate(due ? '/review' : '/wrong')}>
          <div className="tile-ic"><Icon name="note" /></div>
          <div className="tile-t">오답 복습</div>
          <div className="tile-s">{due ? `오늘 ${due}문제` : '오늘은 없어요'}</div>
        </button>
        <button className="card tile" onClick={() => navigate('/exam')}>
          <div className="tile-ic"><Icon name="exam" /></div>
          <div className="tile-t">시험 보기</div>
          <div className="tile-s">단원평가 · 중간 · 기말</div>
        </button>
        <button className="card tile" onClick={() => navigate('/map')}>
          <div className="tile-ic"><Icon name="map" /></div>
          <div className="tile-t">학습 지도</div>
          <div className="tile-s">초1부터 미적분까지</div>
        </button>
        <button className="card tile" onClick={() => navigate('/stats')}>
          <div className="tile-ic"><Icon name="chart" /></div>
          <div className="tile-t">기록</div>
          <div className="tile-s">숙련도 · 시험 결과</div>
        </button>
      </div>

      {cm.total > 0 && (
        <section className="card">
          <div className="card-h">
            {course.title} 진도 <span className="muted small">{cm.done}/{cm.total} 단원 완료 · ⭐ {cs.got}/{cs.max}</span>
          </div>
          <Bar value={cm.avg} />
        </section>
      )}

      <section className="card">
        <div className="card-h">
          배지 <span className="muted small">{myBadges.length}/{BADGES.length}</span>
          <button className="link right" onClick={() => navigate('/badges')}>
            모두 보기
          </button>
        </div>
        {myBadges.length ? (
          <div className="badge-strip">
            {myBadges.slice(0, 6).map((b) => (
              <span key={b.id} className="bmini" title={b.desc}>
                <span>{b.ic}</span>
                {b.name}
              </span>
            ))}
          </div>
        ) : (
          <div className="muted small">첫 문제를 풀면 첫 배지를 받아요.</div>
        )}
      </section>

      <section className="card legend">
        <div className="card-h">수학의 다섯 갈래</div>
        <div className="legend-row">
          {Object.values(STRANDS).map((x) => (
            <span key={x.name} className="lg">
              <span className="sdot" style={{ background: x.color }} />
              {x.name}
            </span>
          ))}
        </div>
        <div className="muted small">모든 단원은 앞 단원과 이어져 있어요. 막히면 '먼저 배울 단원'으로 돌아가 보세요.</div>
      </section>
    </div>
  );
}

function GoalRing({ n, goal }: { n: number; goal: number }) {
  const size = 44;
  const r = 18;
  const c = 2 * Math.PI * r;
  const v = Math.min(1, n / goal);
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" className="goalring" aria-hidden="true">
      <circle cx="22" cy="22" r={r} className="ring-bg" />
      {v > 0 && <circle cx="22" cy="22" r={r} className="ring-fg goal-fg" strokeDasharray={`${c * v} ${c}`} transform="rotate(-90 22 22)" />}
      <text x="50%" y="53%" textAnchor="middle" dominantBaseline="middle" fontSize="15">
        {v >= 1 ? '🎯' : ''}
      </text>
    </svg>
  );
}
