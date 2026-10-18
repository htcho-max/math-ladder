import { COURSE_BY_ID, STRANDS, unitLabel } from '../core/curriculum';
import { dueWrong, recommend, streak, unitMastery, courseMastery } from '../lib/mastery';
import { navigate } from '../lib/router';
import { activeProfile, dayKey, useStore } from '../lib/store';
import { Bar, Ring } from '../ui/bits';

export function HomePage() {
  const s = useStore((x) => x);
  const prof = activeProfile(s);
  const d = s.data;
  const course = COURSE_BY_ID[prof.course];
  const rec = recommend(d, prof.course);
  const due = dueWrong(d).length;
  const st = streak(d);
  const today = d.days[dayKey()] ?? { n: 0, c: 0 };
  const cm = courseMastery(d, prof.course);
  return (
    <div className="page">
      <section className="hero">
        <div>
          <div className="hello">안녕, {prof.name}!</div>
          <div className="sub">
            {course?.grade} · {course?.title} 과정{' '}
            <button className="link" onClick={() => navigate('/settings')}>
              바꾸기
            </button>
          </div>
        </div>
        <div className="hero-stats">
          <div className="hs">
            <b>{st}</b>
            <span>연속 학습일</span>
          </div>
          <div className="hs">
            <b>{today.n}</b>
            <span>오늘 푼 문제</span>
          </div>
        </div>
      </section>

      <section className="card next">
        <div className="card-h">이어서 학습</div>
        {rec ? (
          <>
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
          <div className="tile-ic">📒</div>
          <div className="tile-t">오답 복습</div>
          <div className="tile-s">{due ? `오늘 ${due}문제` : '오늘은 없어요'}</div>
        </button>
        <button className="card tile" onClick={() => navigate('/exam')}>
          <div className="tile-ic">📝</div>
          <div className="tile-t">시험 보기</div>
          <div className="tile-s">단원평가 · 중간 · 기말</div>
        </button>
        <button className="card tile" onClick={() => navigate('/map')}>
          <div className="tile-ic">🗺️</div>
          <div className="tile-t">학습 지도</div>
          <div className="tile-s">초1부터 미적분까지</div>
        </button>
        <button className="card tile" onClick={() => navigate('/stats')}>
          <div className="tile-ic">📈</div>
          <div className="tile-t">기록</div>
          <div className="tile-s">숙련도 · 시험 결과</div>
        </button>
      </div>

      {cm.total > 0 && (
        <section className="card">
          <div className="card-h">
            {course.title} 진도 <span className="muted small">{cm.done}/{cm.total} 단원 완료</span>
          </div>
          <Bar value={cm.avg} />
        </section>
      )}

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
