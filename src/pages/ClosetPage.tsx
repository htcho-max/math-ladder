// 셈이 꾸미기 화면
import { useState } from 'react';
import { ITEMS, SLOT_NAME, isUnlocked, outfitOf, setMood as saveMood, unlockText, unlockedCount, wear, type Outfit, type Slot } from '../lib/closet';
import { levelInfo, rwOf } from '../lib/reward';
import { useStore } from '../lib/store';
import { Header } from '../ui/bits';
import { Mascot } from '../ui/Mascot';

const SLOTS: Slot[] = ['color', 'hat', 'face', 'hand', 'fx'];
const MOODS = [
  ['happy', '방긋'],
  ['cheer', '신나'],
  ['think', '골똘'],
  ['sleepy', '졸려'],
] as const;

export function ClosetPage() {
  const d = useStore((s) => s.data);
  const outfit = outfitOf(d);
  const [slot, setSlot] = useState<Slot>('hat');
  const mood = outfit.mood ?? 'happy';
  const setMood = saveMood;
  const [peek, setPeek] = useState<Outfit | null>(null); // 잠긴 아이템 미리 보기
  const lv = levelInfo(rwOf(d).xp);
  const cnt = unlockedCount(d);
  const shown = peek ?? outfit;
  const cur = (outfit[slot] ?? (slot === 'color' ? 'default' : 'none')) as string;

  return (
    <div className="page closet">
      <Header title="셈이 꾸미기" back="/" />
      <section className="card closet-stage">
        <div className="closet-preview">
          <Mascot mood={mood} size={190} outfit={shown} />
          {peek && <div className="peek-tag">미리 보기</div>}
        </div>
        <div className="muted small mood-h">기본 표정 — 홈 화면과 문제 풀 때 이 표정이에요</div>
        <div className="seg">
          {MOODS.map(([k, label]) => (
            <button key={k} className={mood === k ? 'on' : ''} onClick={() => setMood(k)}>
              {label}
            </button>
          ))}
        </div>
        <div className="muted small">
          Lv.{lv.level} {lv.title} · 모은 아이템 {cnt.got}/{cnt.total} · 레벨이 오르거나 배지를 받으면 새 아이템이 열려요
        </div>
      </section>

      <div className="tabs closet-tabs">
        {SLOTS.map((s) => (
          <button key={s} className={slot === s ? 'on' : ''} onClick={() => (setSlot(s), setPeek(null))}>
            {SLOT_NAME[s]}
          </button>
        ))}
      </div>

      <section className="card">
        <div className="items">
          {ITEMS.filter((i) => i.slot === slot).map((it) => {
            const open = isUnlocked(it, d);
            const on = cur === it.id;
            const preview: Outfit = { ...outfit, [slot]: it.id };
            return (
              <button
                key={it.id}
                className={'itemcard' + (on ? ' on' : '') + (open ? '' : ' locked')}
                aria-pressed={on}
                onClick={() => {
                  if (open) {
                    wear(slot, it.id);
                    setPeek(null);
                  } else setPeek(preview);
                }}
              >
                <Mascot mood="happy" size={70} outfit={preview} />
                <span className="it-name">{it.name}</span>
                <span className="it-sub">{on ? '착용 중' : open ? '입기' : `🔒 ${unlockText(it)}`}</span>
              </button>
            );
          })}
        </div>
        {peek && <div className="muted small closet-note">잠긴 아이템은 미리 보기만 할 수 있어요. 조건을 채우면 바로 입을 수 있어요!</div>}
      </section>
    </div>
  );
}
