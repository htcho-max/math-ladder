// 보상 알림(토스트)과 색종이 효과
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { UNIT_BY_ID, COURSE_BY_ID } from '../core/curriculum';
import { BADGE_BY_ID, eventQueue, popEvent, subscribeEvents, type RewardEvent } from '../lib/reward';
import { getState } from '../lib/store';
import { itemsAtLevel, ITEMS } from '../lib/closet';
import { navigate } from '../lib/router';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

export function confetti(power = 1): void {
  if (getState().settings.effects === false) return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('canvas');
  c.className = 'confetti';
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  c.width = innerWidth * dpr;
  c.height = innerHeight * dpr;
  document.body.appendChild(c);
  const g = c.getContext('2d');
  if (!g) {
    c.remove();
    return;
  }
  g.scale(dpr, dpr);
  const n = Math.round(90 * power);
  const parts = Array.from({ length: n }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * innerWidth * 0.3,
    y: innerHeight * 0.35,
    vx: (Math.random() - 0.5) * 12,
    vy: -Math.random() * 11 - 4,
    r: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    w: 6 + Math.random() * 6,
    h: 4 + Math.random() * 4,
    col: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));
  const t0 = performance.now();
  const step = (t: number) => {
    const el = t - t0;
    g.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.32;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      g.save();
      g.globalAlpha = Math.max(0, 1 - el / 1800);
      g.translate(p.x, p.y);
      g.rotate(p.r);
      g.fillStyle = p.col;
      g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      g.restore();
    }
    if (el < 1800) requestAnimationFrame(step);
    else c.remove();
  };
  requestAnimationFrame(step);
}

function describe(e: RewardEvent): { ic: string; title: string; sub?: string; big?: boolean; go?: string } {
  switch (e.kind) {
    case 'level':
      {
        const items = itemsAtLevel(e.level);
        return { ic: e.icon, title: `레벨 ${e.level} 달성!`, sub: items.length ? `새 꾸미기: ${items.map((i) => i.name).join(', ')}` : `칭호: ${e.title}`, big: true, go: items.length ? '/closet' : undefined };
      }
    case 'badge': {
      const b = BADGE_BY_ID[e.badge];
      const gift = ITEMS.filter((i) => i.badge === b.id);
      return { ic: b.ic, title: `배지 획득: ${b.name}`, sub: gift.length ? `꾸미기 선물: ${gift.map((i) => i.name).join(', ')}` : b.desc, big: true, go: gift.length ? '/closet' : '/badges' };
    }
    case 'quest':
      return { ic: '✅', title: '퀘스트 완료 +30 XP', sub: e.text };
    case 'quests-all':
      return { ic: '🎁', title: '오늘의 퀘스트 모두 완료!', sub: '보너스 +50 XP', big: true };
    case 'star': {
      const u = UNIT_BY_ID[e.unitId];
      return { ic: '⭐'.repeat(e.stars), title: `별 ${e.stars}개!`, sub: `${COURSE_BY_ID[u.course].title} ${u.title}`, big: e.stars >= 2 };
    }
    case 'goal':
      return { ic: '🎯', title: '오늘의 목표 달성! +50 XP', sub: `오늘 ${e.goal}문제를 풀었어요`, big: true };
    case 'freeze-used':
      return { ic: '🧊', title: '얼음이 연속 기록을 지켰어요', sub: `쉬었던 ${e.days}일을 얼음으로 메웠어요` };
    case 'freeze-got':
      return { ic: '🧊', title: '얼음 1개 획득', sub: '하루 쉬어도 연속 기록이 이어져요' };
    case 'streak':
      return { ic: '🔥', title: `${e.days}일 연속 학습!`, big: true };
  }
}

export function Toasts() {
  const q = useSyncExternalStore(subscribeEvents, eventQueue);
  const shown = q.slice(0, 2);
  const celebrated = useRef(new Set<number>());
  useEffect(() => {
    for (const e of shown) {
      if (celebrated.current.has(e.id)) continue;
      celebrated.current.add(e.id);
      const d = describe(e);
      if (d.big) confetti(e.kind === 'level' || e.kind === 'quests-all' ? 1.4 : 0.8);
      setTimeout(() => popEvent(e.id), d.big ? 4200 : 3000);
    }
  }, [shown]);
  if (!shown.length) return null;
  return (
    <div className="toasts noprint" role="status" aria-live="polite">
      {shown.map((e) => {
        const d = describe(e);
        return (
          <button
            key={e.id}
            className={'toast' + (d.big ? ' big' : '')}
            onClick={() => {
              popEvent(e.id);
              if (d.go) navigate(d.go);
            }}
          >
            <span className="t-ic">{d.ic}</span>
            <span className="t-body">
              <b>{d.title}</b>
              {d.sub && <span>{d.sub}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
