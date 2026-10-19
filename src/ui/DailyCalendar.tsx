// 오늘의 학습 달력: 완료한 날은 도장, 조금이라도 공부한 날은 점, 얼음으로 지킨 날은 🧊
import { useState } from 'react';
import { rwOf } from '../lib/reward';
import { dayKey, useStore } from '../lib/store';

const WD = ['일', '월', '화', '수', '목', '금', '토'];

export function DailyCalendar() {
  const d = useStore((s) => s.data);
  const rw = rwOf(d);
  const now = new Date();
  const [ym, setYm] = useState<[number, number]>([now.getFullYear(), now.getMonth()]);
  const [y, m] = ym;
  const first = new Date(y, m, 1);
  const days = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first.getDay()).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const key = (day: number) => dayKey(new Date(y, m, day).getTime());
  const today = dayKey();
  const doneCount = Array.from({ length: days }, (_, i) => key(i + 1)).filter((k) => rw.dailyDone?.[k]).length;
  const isThisMonth = y === now.getFullYear() && m === now.getMonth();
  const move = (k: number) => {
    const t = new Date(y, m + k, 1);
    setYm([t.getFullYear(), t.getMonth()]);
  };
  return (
    <section className="card dcal">
      <div className="card-h">
        <button className="iconbtn small" onClick={() => move(-1)} aria-label="이전 달">
          ‹
        </button>
        <span>
          {y}년 {m + 1}월
        </span>
        <button className="iconbtn small" onClick={() => move(1)} aria-label="다음 달" disabled={isThisMonth}>
          ›
        </button>
        <span className="muted small right">오늘의 학습 {doneCount}일 완료</span>
      </div>
      <div className="dcal-grid" role="grid">
        {WD.map((w, i) => (
          <div key={w} className={'dcal-wd' + (i === 0 ? ' sun' : i === 6 ? ' sat' : '')}>
            {w}
          </div>
        ))}
        {cells.map((c, i) => {
          if (c === null) return <div key={i} />;
          const k = key(c);
          const done = !!rw.dailyDone?.[k];
          const studied = !!d.days[k]?.n;
          const frozen = !!rw.frozen[k];
          return (
            <div key={i} className={'dcal-cell' + (done ? ' done' : '') + (k === today ? ' today' : '')} title={done ? '오늘의 학습 완료' : studied ? `${d.days[k].n}문제` : frozen ? '얼음으로 지킨 날' : ''}>
              <span className="dcal-n">{c}</span>
              {done ? <span className="dcal-stamp">참잘</span> : frozen ? <span className="dcal-ice">🧊</span> : studied ? <span className="dcal-dot" /> : null}
            </div>
          );
        })}
      </div>
      <div className="dcal-legend muted small">
        <span>
          <span className="dcal-stamp mini">참잘</span> 오늘의 학습 완료
        </span>
        <span>
          <span className="dcal-dot" /> 조금 공부함
        </span>
        <span>🧊 얼음으로 지킴</span>
      </div>
    </section>
  );
}

/** 홈용: 이번 주 7칸 */
export function WeekStrip() {
  const d = useStore((s) => s.data);
  const rw = rwOf(d);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const today = dayKey();
  return (
    <div className="week">
      {Array.from({ length: 7 }, (_, i) => {
        const t = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        const k = dayKey(t.getTime());
        const done = !!rw.dailyDone?.[k];
        const studied = !!d.days[k]?.n;
        return (
          <div key={k} className={'wk' + (done ? ' done' : '') + (k === today ? ' today' : '') + (k > today ? ' future' : '')}>
            <span className="wk-d">{WD[i]}</span>
            <span className="wk-m">{done ? '✓' : studied ? '·' : t.getDate()}</span>
          </div>
        );
      })}
    </div>
  );
}
