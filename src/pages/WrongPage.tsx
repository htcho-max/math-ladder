import { useState } from 'react';
import { CONTENT } from '../content';
import { COURSE_BY_ID, UNIT_BY_ID } from '../core/curriculum';
import { problemFromKey } from '../core/problem';
import { BOX_DAYS, dueWrong } from '../lib/mastery';
import { enc, navigate } from '../lib/router';
import { updateData, useStore, type WrongItem } from '../lib/store';
import { Header } from '../ui/bits';
import { MathText } from '../ui/MathText';

export function WrongPage() {
  const d = useStore((s) => s.data);
  const [tab, setTab] = useState<'active' | 'grad'>('active');
  const all = Object.values(d.wrong).filter((w) => CONTENT[w.unitId]);
  const due = dueWrong(d);
  const list = all.filter((w) => (tab === 'grad' ? w.graduated : !w.graduated)).sort((a, b) => a.due - b.due);
  const now = Date.now();
  return (
    <div className="page">
      <Header title="오답노트" />
      <section className="card next">
        <div className="card-h">오늘 복습</div>
        {due.length ? (
          <>
            <div className="muted">
              복습할 때가 된 문제가 <b>{due.length}</b>개 있어요. 맞힐 때마다 복습 간격이 1일 → 3일 → 7일 → 14일로 늘어나고, 다섯 번 연속으로 맞히면 졸업해요.
            </div>
            <div className="btnrow">
              <button className="btn primary" onClick={() => navigate('/review')}>
                복습 시작
              </button>
            </div>
          </>
        ) : (
          <div className="muted">오늘 복습할 문제는 없어요. {all.filter((w) => !w.graduated).length ? '다음 복습일을 기다려요.' : '틀린 문제가 생기면 여기에 모여요.'}</div>
        )}
      </section>
      <div className="tabs">
        <button className={tab === 'active' ? 'on' : ''} onClick={() => setTab('active')}>
          복습 중 {all.filter((w) => !w.graduated).length}
        </button>
        <button className={tab === 'grad' ? 'on' : ''} onClick={() => setTab('grad')}>
          졸업 {all.filter((w) => w.graduated).length}
        </button>
      </div>
      <div className="wronglist">
        {list.map((w) => (
          <WrongRow key={w.key} w={w} now={now} />
        ))}
        {!list.length && <div className="card muted">비어 있어요.</div>}
      </div>
    </div>
  );
}

function WrongRow({ w, now }: { w: WrongItem; now: number }) {
  const p = problemFromKey(w.key);
  const u = UNIT_BY_ID[w.unitId];
  const sk = CONTENT[w.unitId]?.skills.find((s) => s.id === w.skillId);
  const days = Math.ceil((w.due - now) / 86400000);
  return (
    <section className="card wrow">
      <div className="wr-meta">
        <span className="muted small">
          {COURSE_BY_ID[u.course].title} {u.title} · {sk?.title ?? w.skillId}
        </span>
        <span className="boxes" title={`복습 단계 ${w.box + 1}/5`}>
          {BOX_DAYS.map((_, i) => (
            <i key={i} className={i <= w.box ? 'on' : ''} />
          ))}
        </span>
      </div>
      {p ? <MathText className="wr-q" text={p.q} /> : <div className="muted">문제를 다시 만들 수 없어요 (유형이 바뀜).</div>}
      <div className="wr-foot">
        <span className="small muted">
          {w.graduated ? '졸업 🎓' : days <= 0 ? '오늘 복습' : `${days}일 뒤 복습`} · 틀린 횟수 {w.wrongCount}
        </span>
        <span className="btnrow tight">
          {p && (
            <>
              <button className="btn small" onClick={() => navigate(`/retry/${enc(w.key)}`)}>
                다시 풀기
              </button>
              <button className="btn small" onClick={() => navigate(`/similar/${enc(w.key)}`)}>
                비슷한 문제
              </button>
            </>
          )}
          <button
            className="btn small ghost"
            aria-label="삭제"
            onClick={() =>
              updateData((d) => {
                const wrong = { ...d.wrong };
                delete wrong[w.key];
                return { ...d, wrong };
              })
            }
          >
            삭제
          </button>
        </span>
      </div>
    </section>
  );
}
