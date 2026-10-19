// 마스코트 "셈이" — 사다리 안테나를 단 동글동글 수 블록 (초등·중등 테마에서만 보임)
// 꾸미기(outfit): 몸 색 · 모자 · 얼굴 · 손 · 효과 (lib/closet.ts)
import { useId } from 'react';
import { itemOf, type Outfit } from '../lib/closet';

const EMPTY: Outfit = {};
import { useStore } from '../lib/store';

type Mood = 'happy' | 'cheer' | 'think' | 'sleepy';

const INK = '#1b1f33';

function Hat({ id }: { id?: string }) {
  switch (id) {
    case 'ribbon':
      return (
        <g>
          <path d="M57 24l11 6-11 6zM79 24l-11 6 11 6z" fill="#ff6b9a" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="68" cy="30" r="3.4" fill="#ff3d7f" stroke={INK} strokeWidth="1.5" />
        </g>
      );
    case 'cap':
      return (
        <g stroke={INK} strokeWidth="1.8" strokeLinejoin="round">
          <path d="M22 32Q24 6 50 6T78 32z" fill="#ef4444" />
          <path d="M60 31h30q-2 7-30 5z" fill="#b91c1c" />
          <circle cx="50" cy="7" r="3" fill="#fff" />
        </g>
      );
    case 'catears':
      return (
        <g stroke={INK} strokeWidth="1.8" strokeLinejoin="round">
          <path d="M20 40L22 14l18 14z" fill="currentColor" className="m-fill" />
          <path d="M80 40L78 14 60 28z" fill="currentColor" className="m-fill" />
          <path d="M24 33l1.5-13 8 7z" fill="#ff9ab8" stroke="none" />
          <path d="M76 33l-1.5-13-8 7z" fill="#ff9ab8" stroke="none" />
        </g>
      );
    case 'santa':
      return (
        <g stroke={INK} strokeWidth="1.8" strokeLinejoin="round">
          <path d="M24 32Q34 2 66 6q10 2 14 14-12-6-20 2-8 6-8 10z" fill="#e11d48" />
          <rect x="20" y="27" width="60" height="9" rx="4.5" fill="#fff" />
          <circle cx="80" cy="20" r="5.5" fill="#fff" />
        </g>
      );
    case 'crown':
      return (
        <g stroke={INK} strokeWidth="1.8" strokeLinejoin="round">
          <path d="M26 31l3-21 11 10 10-16 10 16 11-10 3 21z" fill="#ffc83d" />
          <circle cx="50" cy="22" r="3" fill="#ff4d6d" />
          <circle cx="36" cy="25" r="2.2" fill="#4dabff" />
          <circle cx="64" cy="25" r="2.2" fill="#2ec4a6" />
        </g>
      );
    case 'headphones':
      return (
        <g stroke={INK} strokeWidth="1.8">
          <path d="M14 54Q12 14 50 14T86 54" fill="none" strokeWidth="5" stroke="#334155" />
          <rect x="7" y="44" width="12" height="20" rx="6" fill="#ef4444" />
          <rect x="81" y="44" width="12" height="20" rx="6" fill="#ef4444" />
        </g>
      );
    case 'wizard':
      return (
        <g stroke={INK} strokeWidth="1.8" strokeLinejoin="round">
          <path d="M30 31L56-10 70 31z" fill="#6d4aff" />
          <ellipse cx="50" cy="31" rx="30" ry="5.5" fill="#5536d6" />
          <path d="M52 8l1.6 3.4 3.7.4-2.8 2.5.8 3.7-3.3-1.9-3.3 1.9.8-3.7-2.8-2.5 3.7-.4z" fill="#ffd166" stroke="none" />
        </g>
      );
    case 'flower':
      return (
        <g stroke={INK} strokeWidth="1.4">
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={70 + 6 * Math.cos((a * Math.PI) / 180)} cy={26 + 6 * Math.sin((a * Math.PI) / 180)} r="4.6" fill="#ff8fab" />
          ))}
          <circle cx="70" cy="26" r="3.6" fill="#ffd166" />
        </g>
      );
    case 'grad':
      return (
        <g stroke={INK} strokeWidth="1.8" strokeLinejoin="round">
          <path d="M34 22v10h32V22" fill="#1f2937" />
          <path d="M18 18L50 7l32 11-32 11z" fill="#111827" />
          <path d="M70 21v15" stroke="#ffd166" strokeWidth="2.4" />
          <circle cx="70" cy="37" r="2.6" fill="#ffd166" stroke="none" />
        </g>
      );
    default:
      return null;
  }
}

/** 안테나(사다리)를 가리는 모자 */
const HIDE_ANTENNA = new Set(['cap', 'santa', 'crown', 'wizard', 'grad']);

function Face({ id }: { id?: string }) {
  switch (id) {
    case 'glasses':
      return (
        <g fill="none" stroke={INK} strokeWidth="2.2">
          <circle cx="40" cy="51" r="8.5" />
          <circle cx="60" cy="51" r="8.5" />
          <path d="M48.5 50h3M31.5 49l-6-3M68.5 49l6-3" />
        </g>
      );
    case 'sunglasses':
      return (
        <g stroke={INK} strokeWidth="1.8">
          <rect x="29" y="44" width="19" height="13" rx="5" fill="#111827" />
          <rect x="52" y="44" width="19" height="13" rx="5" fill="#111827" />
          <path d="M48 49h4" />
          <path d="M33 47l5 0" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M56 47l5 0" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      );
    case 'mustache':
      return <path d="M50 58c-4-4-10-4-13 1 4-1 8 1 13 1 5 0 9-2 13-1-3-5-9-5-13-1z" fill="#5b3a29" />;
    case 'hearts':
      return (
        <g fill="#ff4d79">
          <path d="M31 63c-6-4-6-8-3-9 2-1 3 1 3 1s1-2 3-1c3 1 3 5-3 9z" />
          <path d="M69 63c-6-4-6-8-3-9 2-1 3 1 3 1s1-2 3-1c3 1 3 5-3 9z" />
        </g>
      );
    case 'stareyes':
      return (
        <g fill="#ffc83d" stroke={INK} strokeWidth="1.2" strokeLinejoin="round">
          {[40, 60].map((x) => (
            <path key={x} d={`M${x} 43l2.3 5 5.4.6-4 3.7 1.1 5.3-4.8-2.8-4.8 2.8 1.1-5.3-4-3.7 5.4-.6z`} />
          ))}
        </g>
      );
    default:
      return null;
  }
}

function HandItem({ id }: { id?: string }) {
  const s = { stroke: INK, strokeWidth: 1.6, strokeLinejoin: 'round' as const };
  switch (id) {
    case 'pencil':
      return (
        <g transform="rotate(-35)">
          <rect x="-3" y="-20" width="6" height="22" fill="#ffc83d" {...s} />
          <path d="M-3 2l3 6 3-6z" fill="#f5d0a9" {...s} />
          <rect x="-3" y="-24" width="6" height="4" fill="#ff8fab" {...s} />
        </g>
      );
    case 'ruler':
      return (
        <g transform="rotate(-30)">
          <rect x="-4" y="-26" width="8" height="30" fill="#7dd3fc" {...s} />
          {[-22, -17, -12, -7, -2].map((y) => (
            <path key={y} d={`M-4 ${y}h4`} stroke={INK} strokeWidth="1.2" />
          ))}
        </g>
      );
    case 'protractor':
      return (
        <g transform="translate(0,-4)">
          <path d="M-14 0a14 14 0 0 1 28 0z" fill="#a7f3d0" fillOpacity="0.9" {...s} />
          <path d="M0 0l9-9" stroke={INK} strokeWidth="1.4" />
        </g>
      );
    case 'compass':
      return (
        <g transform="rotate(-15)" {...s} fill="none">
          <circle cx="0" cy="-22" r="3" fill="#94a3b8" />
          <path d="M0-19L-7 4M0-19L7 4" strokeWidth="2.4" stroke="#475569" />
          <path d="M7 4l1 4" stroke={INK} />
        </g>
      );
    case 'calculator':
      return (
        <g transform="rotate(-10) translate(-8,-22)">
          <rect width="16" height="22" rx="3" fill="#475569" {...s} />
          <rect x="3" y="3" width="10" height="5" fill="#bbf7d0" />
          {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={3 + c * 3.6} y={10 + r * 3.8} width="2.6" height="2.6" fill="#e2e8f0" />))}
        </g>
      );
    case 'trophy':
      return (
        <g transform="translate(0,-14)" {...s}>
          <path d="M-9-10h18v6a9 9 0 0 1-18 0z" fill="#ffc83d" />
          <path d="M-9-7h-4a4 4 0 0 0 4 6M9-7h4a4 4 0 0 1-4 6" fill="none" />
          <rect x="-2" y="4" width="4" height="5" fill="#ffc83d" />
          <rect x="-7" y="9" width="14" height="4" rx="1.5" fill="#a16207" />
        </g>
      );
    case 'flag':
      return (
        <g>
          <path d="M0 6V-30" stroke="#475569" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M1-30l18 6-18 7z" fill="#ef4444" {...s} />
        </g>
      );
    default:
      return null;
  }
}

function Fx({ id }: { id?: string }) {
  switch (id) {
    case 'sparkle':
      return (
        <g fill="#ffd166" className="m-fx">
          {[
            [6, 20, 1],
            [94, 14, 0.8],
            [100, 70, 0.7],
            [0, 78, 0.9],
          ].map(([x, y, k], i) => (
            <path key={i} transform={`translate(${x},${y}) scale(${k})`} d="M0-8C1-2 2-1 8 0 2 1 1 2 0 8-1 2-2 1-8 0-2-1-1-2 0-8z" />
          ))}
        </g>
      );
    case 'notes':
      return (
        <g className="m-fx" fontSize="15" fontWeight="800" fill="#7c6bff">
          <text x="-6" y="24">+</text>
          <text x="96" y="20">π</text>
          <text x="100" y="82">÷</text>
          <text x="-8" y="86">√</text>
        </g>
      );
    case 'fire':
      return (
        <g className="m-fx">
          {[
            [4, 60],
            [96, 60],
          ].map(([x, y], i) => (
            <path key={i} transform={`translate(${x},${y})`} d="M0 10c-7 0-9-7-5-12 0 4 3 4 3 1 0-5 3-8 6-11 0 5 6 8 4 15-1 4-4 7-8 7z" fill="#ff8a3d" stroke="#e8590c" strokeWidth="1" />
          ))}
        </g>
      );
    default:
      return null;
  }
}

export function Mascot({ mood = 'happy', size = 96, className, outfit }: { mood?: Mood; size?: number; className?: string; outfit?: Outfit }) {
  const saved = useStore((s) => s.data.rw?.outfit); // 저장된 참조 그대로 (새 객체를 만들면 무한 렌더)
  const o: Outfit = outfit ?? saved ?? EMPTY;
  const gid = useId().replace(/:/g, '');
  const color = itemOf('color', o.color);
  const fill = color?.fill === 'rainbow' ? `url(#rb${gid})` : color?.fill;
  const custom = !!fill;
  const hand: [number, number] = mood === 'cheer' ? [92, 37] : [92, 69];

  const eyes =
    o.face === 'stareyes' ? null : mood === 'sleepy' ? (
      <path d="M35 52q5 4 10 0M55 52q5 4 10 0" className="m-line" />
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
  const bodyStyle = custom ? { fill } : undefined;
  const armStyle = custom ? { stroke: color?.fill === 'rainbow' ? '#9b6bff' : fill } : undefined;
  return (
    <svg
      className={'mascot ' + (custom ? 'custom ' : '') + (className ?? '') + (mood === 'cheer' ? ' bounce' : '')}
      width={size}
      height={(size * 114) / 128}
      viewBox="-14 -14 128 114"
      role="img"
      aria-label="마스코트 셈이"
      style={custom && color?.fill !== 'rainbow' ? { color: fill } : undefined}
    >
      {color?.fill === 'rainbow' && (
        <defs>
          <linearGradient id={`rb${gid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff6b8b" />
            <stop offset="0.35" stopColor="#ffc93c" />
            <stop offset="0.65" stopColor="#2ec4a6" />
            <stop offset="1" stopColor="#7c6bff" />
          </linearGradient>
        </defs>
      )}
      <Fx id={o.fx} />
      {!HIDE_ANTENNA.has(o.hat ?? '') && (
        <g className="m-ladder">
          <path d="M44 6v20M56 6v20M44 11h12M44 17h12M44 23h12" />
        </g>
      )}
      <g className="m-arm">{mood === 'cheer' ? <path d="M18 54 8 38M82 54l10-16" style={armStyle} /> : <path d="M17 60l-8 8M83 60l8 8" style={armStyle} />}</g>
      <rect x="16" y="26" width="68" height="62" rx="24" className="m-body" style={bodyStyle} />
      <rect x="22" y="30" width="30" height="14" rx="7" className="m-gloss" />
      {eyes}
      {o.face !== 'hearts' && (
        <>
          <ellipse cx="31" cy="60" rx="5" ry="3" className="m-cheek" />
          <ellipse cx="69" cy="60" rx="5" ry="3" className="m-cheek" />
        </>
      )}
      {mouth}
      <Face id={o.face} />
      <Hat id={o.hat} />
      {o.hand && o.hand !== 'none' && (
        <g transform={`translate(${hand[0]},${hand[1]})`}>
          <HandItem id={o.hand} />
        </g>
      )}
      {mood === 'think' && !o.fx && (
        <text x="80" y="30" className="m-q">
          ?
        </text>
      )}
      {mood === 'sleepy' && (
        <text x="80" y="28" className="m-q">
          z
        </text>
      )}
    </svg>
  );
}
