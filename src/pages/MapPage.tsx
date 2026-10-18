import { useState } from 'react';
import { COURSES, STRANDS, unitsOf, UNITS } from '../core/curriculum';
import type { Strand } from '../core/types';
import { hasContent } from '../core/problem';
import { courseMastery, unitMastery } from '../lib/mastery';
import { navigate } from '../lib/router';
import { activeProfile, useStore } from '../lib/store';
import { Bar, Ring, Stars, StrandDot } from '../ui/bits';
import { courseStars, starsFor } from '../lib/reward';
import { Ladder } from '../ui/Ladder';

const STAGES = [
  { id: 'e', name: '초등' },
  { id: 'm', name: '중등' },
  { id: 'h', name: '고등' },
] as const;

function readPref<T extends string>(k: string, d: T): T {
  try {
    return (sessionStorage.getItem(k) as T) ?? d;
  } catch {
    return d;
  }
}
function writePref(k: string, v: string) {
  try {
    sessionStorage.setItem(k, v);
  } catch {
    /* 무시 */
  }
}

export function MapPage() {
  const s = useStore((x) => x);
  const prof = activeProfile(s);
  const myStage = COURSES.find((c) => c.id === prof.course)?.stage ?? 'e';
  const [stage, setStage] = useState<'e' | 'm' | 'h'>(readPref('map.stage', myStage));
  const [view, setView] = useState<'list' | 'tree' | 'ladder'>(readPref('map.view', 'list'));
  const courses = COURSES.filter((c) => c.stage === stage);
  const d = s.data;
  return (
    <div className="page">
      <div className="pagehead">
        <h1>학습 지도</h1>
        <div className="ph-right seg">
          <button className={view === 'list' ? 'on' : ''} onClick={() => (setView('list'), writePref('map.view', 'list'))}>
            과정별
          </button>
          <button className={view === 'tree' ? 'on' : ''} onClick={() => (setView('tree'), writePref('map.view', 'tree'))}>
            계통도
          </button>
          <button className={view === 'ladder' ? 'on' : ''} onClick={() => (setView('ladder'), writePref('map.view', 'ladder'))}>
            사다리
          </button>
        </div>
      </div>
      {view === 'ladder' ? (
        <Ladder
          onPick={(cid) => {
            const st = COURSES.find((c) => c.id === cid)!.stage;
            setStage(st);
            writePref('map.stage', st);
            setView('list');
            writePref('map.view', 'list');
            setTimeout(() => document.getElementById(`c-${cid}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
          }}
        />
      ) : (
      <>
      <div className="tabs">
        {STAGES.map((st) => (
          <button key={st.id} className={stage === st.id ? 'on' : ''} onClick={() => (setStage(st.id), writePref('map.stage', st.id))}>
            {st.name}
          </button>
        ))}
      </div>

      {view === 'list' ? (
        <div className="courses">
          {courses.map((c) => {
            const cm = courseMastery(d, c.id);
            return (
              <section key={c.id} className={'card course' + (c.id === prof.course ? ' mine' : '')} id={`c-${c.id}`}>
                <div className="course-h">
                  <div>
                    <div className="course-t">
                      {c.title} {c.id === prof.course && <span className="badge">내 학년</span>}
                    </div>
                    <div className="muted small">{c.grade}</div>
                  </div>
                  <div className="course-m">
                    <span className="small muted">{cm.total ? `⭐ ${courseStars(d, c.id).got}/${courseStars(d, c.id).max}` : '준비 중'}</span>
                    <Bar value={cm.avg} />
                  </div>
                </div>
                <div className="unitlist">
                  {unitsOf(c.id).map((u) => {
                    const ok = hasContent(u.id);
                    return (
                      <button key={u.id} className={'urow' + (ok ? '' : ' dim')} onClick={() => navigate(`/unit/${u.id}`)}>
                        <span className="uno">{u.no}</span>
                        <StrandDot s={u.strand} />
                        <span className="ut">
                          <span className="ut-t">{u.title}</span>
                          <span className="ut-s">{ok ? u.summary : '문제 준비 중'}</span>
                        </span>
                        <span className="uterm">{u.term === 'mid' ? '중간' : '기말'}</span>
                        {ok && <Stars n={starsFor(unitMastery(d, u.id))} small />}
                        <Ring value={unitMastery(d, u.id)} size={34} />
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <>
          <div className="muted small tree-help">같은 줄은 같은 갈래예요. 왼쪽에서 오른쪽으로 개념이 이어져요. 칩을 누르면 단원으로 가요.</div>
          <div className="treewrap">
            <table className="tree">
              <thead>
                <tr>
                  <th className="sticky">갈래</th>
                  {courses.map((c) => (
                    <th key={c.id} className={c.id === prof.course ? 'mine' : ''}>
                      {c.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(Object.keys(STRANDS) as Strand[]).map((st) => (
                  <tr key={st}>
                    <th className="sticky" style={{ color: STRANDS[st].color }}>
                      {STRANDS[st].name}
                    </th>
                    {courses.map((c) => (
                      <td key={c.id}>
                        {UNITS.filter((u) => u.course === c.id && u.strand === st).map((u) => {
                          const m = unitMastery(d, u.id);
                          return (
                            <button
                              key={u.id}
                              className={'chip' + (m === null ? ' dim' : '') + (m !== null && m >= 80 ? ' done' : '')}
                              style={{ borderColor: STRANDS[st].color, ['--p' as string]: `${m ?? 0}%` }}
                              onClick={() => navigate(`/unit/${u.id}`)}
                              title={u.summary}
                            >
                              {u.title}
                            </button>
                          );
                        })}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      </>
      )}
    </div>
  );
}
