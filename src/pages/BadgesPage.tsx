import { BADGES, levelInfo, rwOf, TITLES } from '../lib/reward';
import { useStore } from '../lib/store';
import { Header } from '../ui/bits';

export function BadgesPage() {
  const d = useStore((s) => s.data);
  const rw = rwOf(d);
  const lv = levelInfo(rw.xp);
  const groups = [...new Set(BADGES.map((b) => b.group))];
  const got = BADGES.filter((b) => rw.badges[b.id]).length;
  return (
    <div className="page">
      <Header title="배지와 칭호" back="/" />
      <section className="card">
        <div className="card-h">
          칭호 <span className="muted small">레벨이 오르면 바뀌어요</span>
        </div>
        <div className="titles">
          {TITLES.map((t) => (
            <span key={t.name} className={'titlechip' + (lv.level >= t.from ? ' on' : '')}>
              <span>{t.ic}</span>
              {t.name}
              <span className="muted small">Lv.{t.from}</span>
            </span>
          ))}
        </div>
      </section>
      <div className="muted small badge-count">
        모은 배지 {got} / {BADGES.length}
      </div>
      {groups.map((g) => (
        <section key={g} className="card">
          <div className="card-h">{g}</div>
          <div className="badges">
            {BADGES.filter((b) => b.group === g).map((b) => {
              const t = rw.badges[b.id];
              return (
                <div key={b.id} className={'badgecard' + (t ? ' got' : '')}>
                  <div className="b-ic" aria-hidden="true">
                    {t ? b.ic : '🔒'}
                  </div>
                  <div className="b-name">{b.name}</div>
                  <div className="b-desc">{b.desc}</div>
                  {t && <div className="b-date">{new Date(t).toLocaleDateString('ko-KR')}</div>}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
