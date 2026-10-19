// 선수 단원 잠금 모드 (설정에서 켜기)
import { CONTENT } from '../content';
import { UNIT_BY_ID } from '../core/curriculum';
import { unitMastery } from '../lib/mastery';
import { unitStars } from '../lib/reward';
import { navigate } from '../lib/router';
import { useStore, type ProfileData, type Settings } from '../lib/store';
import { UnitLink } from './bits';

/** 잠금 모드에서 아직 별 1개를 못 받은 선수 단원들 */
export function missingPrereqs(d: ProfileData, unitId: string): string[] {
  return (UNIT_BY_ID[unitId]?.prereq ?? []).filter((p) => CONTENT[p] && unitStars(d, p) < 1);
}

export function isLocked(d: ProfileData, unitId: string, settings: Settings): boolean {
  return !!settings.lockMode && missingPrereqs(d, unitId).length > 0;
}

export function LockedCard({ unitId }: { unitId: string }) {
  const d = useStore((s) => s.data);
  const miss = missingPrereqs(d, unitId);
  return (
    <section className="card lockcard">
      <div className="lock-ic">🔒</div>
      <div className="card-h">먼저 배울 단원을 마치면 열려요</div>
      <div className="muted small">아래 단원에서 별 1개(숙련도 50)를 받으면 이 단원이 열려요. 이미 아는 내용이면 수준 진단으로 한 번에 인증할 수 있어요.</div>
      <div className="links">
        {miss.map((p) => (
          <UnitLink key={p} u={UNIT_BY_ID[p]} mastery={unitMastery(d, p)} />
        ))}
      </div>
      <div className="btnrow">
        <button className="btn primary" onClick={() => navigate(`/practice/u/${miss[0]}`)}>
          {UNIT_BY_ID[miss[0]]?.title} 연습하기
        </button>
        <button className="btn" onClick={() => navigate('/exam')}>
          수준 진단 보기
        </button>
      </div>
      <div className="muted small">잠금 모드는 설정에서 끌 수 있어요.</div>
    </section>
  );
}
