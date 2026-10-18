import { COURSES, STRANDS, UNITS } from '../core/curriculum';
import type { Strand } from '../core/types';
import { courseMastery, unitMastery } from '../lib/mastery';
import { navigate } from '../lib/router';
import { dayKey, useStore } from '../lib/store';
import { Bar, Header } from '../ui/bits';

export function StatsPage() {
  const d = useStore((s) => s.data);
  const days = Array.from({ length: 30 }, (_, i) => {
    const t = Date.now() - (29 - i) * 86400000;
    const k = dayKey(t);
    return { k, date: new Date(t), ...(d.days[k] ?? { n: 0, c: 0 }) };
  });
  const max = Math.max(5, ...days.map((x) => x.n));
  const totalN = Object.values(d.days).reduce((a, x) => a + x.n, 0);
  const totalC = Object.values(d.days).reduce((a, x) => a + x.c, 0);
  const strand = (Object.keys(STRANDS) as Strand[]).map((s) => {
    const ms = UNITS.filter((u) => u.strand === s)
      .map((u) => ({ m: unitMastery(d, u.id), att: Object.keys(d.skills).some((k) => k.startsWith(u.id + '/')) }))
      .filter((x) => x.m !== null && x.att);
    return { s, avg: ms.length ? Math.round(ms.reduce((a, x) => a + (x.m ?? 0), 0) / ms.length) : 0, n: ms.length };
  });
  const started = COURSES.map((c) => ({ c, ...courseMastery(d, c.id) })).filter((x) => x.avg > 0);
  return (
    <div className="page">
      <Header title="기록" />
      <div className="grid3">
        <div className="card statbox">
          <b>{totalN}</b>
          <span>푼 문제</span>
        </div>
        <div className="card statbox">
          <b>{totalN ? Math.round((100 * totalC) / totalN) : 0}%</b>
          <span>정답률</span>
        </div>
        <div className="card statbox">
          <b>{d.exams.length}</b>
          <span>본 시험</span>
        </div>
      </div>
      <section className="card">
        <div className="card-h">최근 30일</div>
        <div className="days">
          {days.map((x) => (
            <div key={x.k} className="dcol" title={`${x.k}: ${x.n}문제, ${x.c}개 정답`}>
              <div className="dbar" style={{ height: `${(x.n / max) * 100}%` }}>
                <div className="dok" style={{ height: x.n ? `${(x.c / x.n) * 100}%` : 0 }} />
              </div>
              <span className="dlab">{x.date.getDate() === 1 ? `${x.date.getMonth() + 1}/1` : x.date.getDate() % 5 === 0 && x.date.getDate() < 30 ? x.date.getDate() : ''}</span>
            </div>
          ))}
        </div>
        <div className="muted small">진한 부분 = 맞힌 문제</div>
      </section>
      <section className="card">
        <div className="card-h">갈래별 숙련도</div>
        {strand.map((x) => (
          <div key={x.s} className="ubar">
            <span>{STRANDS[x.s].name}</span>
            <Bar value={x.avg} color={STRANDS[x.s].color} />
            <span className="small muted">{x.n ? x.avg : '–'}</span>
          </div>
        ))}
        <div className="muted small">공부를 시작한 단원들의 평균이에요.</div>
      </section>
      <section className="card">
        <div className="card-h">과정별 숙련도</div>
        {started.length === 0 && <div className="muted">아직 기록이 없어요.</div>}
        {started.map((x) => (
          <div key={x.c.id} className="ubar">
            <span>{x.c.title}</span>
            <Bar value={x.avg} />
            <span className="small muted">
              {x.done}/{x.total}
            </span>
          </div>
        ))}
      </section>
      <section className="card">
        <div className="card-h">시험 기록</div>
        {d.exams.length === 0 && <div className="muted">아직 본 시험이 없어요.</div>}
        <div className="hist">
          {d.exams.map((e) => (
            <button key={e.id} className="histrow" onClick={() => navigate(`/exam/result/${e.id}`)}>
              <span className="hscore">{e.score}</span>
              <span className="ht">
                <span>{e.title}</span>
                <span className="muted small">
                  {new Date(e.date).toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' })} · {e.correct}/{e.count}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
