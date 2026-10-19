// 마스코트 "셈이" — 사다리 안테나를 단 동글동글 수 블록 (초등·중등 테마에서만 보임)
type Mood = 'happy' | 'cheer' | 'think' | 'sleepy';

export function Mascot({ mood = 'happy', size = 96, className }: { mood?: Mood; size?: number; className?: string }) {
  const eyes =
    mood === 'sleepy' ? (
      <>
        <path d="M35 52q5 4 10 0M55 52q5 4 10 0" className="m-line" />
      </>
    ) : mood === 'think' ? (
      <>
        <circle cx="41" cy="49" r="4.2" className="m-eye" />
        <circle cx="61" cy="49" r="4.2" className="m-eye" />
        <circle cx="42.5" cy="47.5" r="1.4" className="m-shine" />
        <circle cx="62.5" cy="47.5" r="1.4" className="m-shine" />
      </>
    ) : (
      <>
        <ellipse cx="40" cy="51" rx="4.6" ry="5.4" className="m-eye" />
        <ellipse cx="60" cy="51" rx="4.6" ry="5.4" className="m-eye" />
        <circle cx="41.6" cy="49" r="1.6" className="m-shine" />
        <circle cx="61.6" cy="49" r="1.6" className="m-shine" />
      </>
    );
  const mouth =
    mood === 'cheer' ? (
      <path d="M41 62q9 11 18 0z" className="m-mouth" />
    ) : mood === 'think' ? (
      <path d="M46 64h8" className="m-line" />
    ) : mood === 'sleepy' ? (
      <ellipse cx="50" cy="64" rx="3" ry="2.4" className="m-mouth" />
    ) : (
      <path d="M42 61q8 7 16 0" className="m-line" />
    );
  return (
    <svg className={'mascot ' + (className ?? '') + (mood === 'cheer' ? ' bounce' : '')} width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="마스코트 셈이">
      {/* 사다리 안테나 */}
      <g className="m-ladder">
        <path d="M44 6v20M56 6v20M44 11h12M44 17h12M44 23h12" />
      </g>
      {/* 팔 */}
      {mood === 'cheer' ? (
        <g className="m-arm">
          <path d="M18 54 8 38M82 54l10-16" />
        </g>
      ) : (
        <g className="m-arm">
          <path d="M17 60l-8 8M83 60l8 8" />
        </g>
      )}
      {/* 몸 */}
      <rect x="16" y="26" width="68" height="62" rx="24" className="m-body" />
      <rect x="22" y="30" width="30" height="14" rx="7" className="m-gloss" />
      {eyes}
      <ellipse cx="31" cy="60" rx="5" ry="3" className="m-cheek" />
      <ellipse cx="69" cy="60" rx="5" ry="3" className="m-cheek" />
      {mouth}
      {mood === 'think' && <text x="80" y="30" className="m-q">?</text>}
      {mood === 'sleepy' && <text x="78" y="28" className="m-q">z</text>}
    </svg>
  );
}
