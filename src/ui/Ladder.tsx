// 사다리 보기: 초1-1(맨 아래)부터 기하(맨 위)까지 과정 하나가 한 칸
import { useEffect, useRef } from 'react';
import { COURSES } from '../core/curriculum';
import { courseMastery } from '../lib/mastery';
import { courseStars, levelInfo, rwOf } from '../lib/reward';
import { activeProfile, useStore } from '../lib/store';
import { Mascot } from './Mascot';

const STAGE_NAME = { e: '초등학교', m: '중학교', h: '고등학교' } as const;

export function Ladder({ onPick }: { onPick: (courseId: string) => void }) {
  const s = useStore((x) => x);
  const d = s.data;
  const prof = activeProfile(s);
  const lv = levelInfo(rwOf(d).xp);
  const me = useRef<HTMLDivElement>(null);
  useEffect(() => {
    me.current?.scrollIntoView({ block: 'center' });
  }, []);
  const rows = [...COURSES].sort((a, b) => b.order - a.order);
  return (
    <div className="ladder">
      <div className="muted small ladder-help">한 칸이 한 과정이에요. 별을 모아 한 칸씩 올라가요. 칸을 누르면 그 과정 단원으로 가요.</div>
      <div className="ladder-body">
        {rows.map((c, i) => {
          const st = courseStars(d, c.id);
          const cm = courseMastery(d, c.id);
          const pct = st.max ? st.got / st.max : 0;
          const mine = c.id === prof.course;
          const cleared = cm.total > 0 && cm.done === cm.total;
          const stageStart = i === rows.length - 1 || rows[i + 1].stage !== c.stage;
          return (
            <div key={c.id}>
              <div ref={mine ? me : undefined} className={'rung' + (mine ? ' mine' : '') + (cleared ? ' cleared' : '') + (pct > 0 ? ' started' : '')}>
                <button className="rung-btn" onClick={() => onPick(c.id)}>
                  <span className="rung-t">
                    {c.title}
                    {cleared && <span className="rung-flag"> 🏁</span>}
                  </span>
                  <span className="rung-bar">
                    <span style={{ width: `${pct * 100}%` }} />
                  </span>
                  <span className="rung-n">
                    ⭐ {st.got}/{st.max}
                  </span>
                </button>
                {mine && (
                  <span className="climber" title={`Lv.${lv.level} ${lv.title}`}>
                    <Mascot size={38} mood="cheer" className="climber-m" />
                    <span className="climber-h">나</span>
                  </span>
                )}
              </div>
              {stageStart && <div className="stage-label">▲ {STAGE_NAME[c.stage]}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
