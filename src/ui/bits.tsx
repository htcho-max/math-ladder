import { STRANDS, COURSE_BY_ID } from '../core/curriculum';
import type { Strand, UnitDef } from '../core/types';
import { navigate } from '../lib/router';

export function Ring({ value, size = 40, label }: { value: number | null; size?: number; label?: boolean }) {
  const v = value ?? 0;
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const color = value === null ? 'var(--line)' : v >= 80 ? 'var(--good)' : v >= 40 ? 'var(--accent)' : 'var(--warn)';
  return (
    <svg className="ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={value === null ? '준비 중' : `숙련도 ${v}`}>
      <circle cx={size / 2} cy={size / 2} r={r} className="ring-bg" />
      {value !== null && v > 0 && (
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeDasharray={`${(c * v) / 100} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} className="ring-fg" />
      )}
      {label !== false && (
        <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.3}>
          {value === null ? '–' : v >= 80 ? '✓' : v}
        </text>
      )}
    </svg>
  );
}

export function Bar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="bar">
      <div style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
    </div>
  );
}

export function StrandDot({ s }: { s: Strand }) {
  return <span className="sdot" style={{ background: STRANDS[s].color }} title={STRANDS[s].name} />;
}

export function StrandTag({ s }: { s: Strand }) {
  return (
    <span className="stag" style={{ color: STRANDS[s].color, borderColor: STRANDS[s].color }}>
      {STRANDS[s].name}
    </span>
  );
}

export function UnitLink({ u, mastery }: { u: UnitDef; mastery: number | null }) {
  return (
    <button className="unitlink" onClick={() => navigate(`/unit/${u.id}`)}>
      <StrandDot s={u.strand} />
      <span className="ul-course">{COURSE_BY_ID[u.course].title}</span>
      <span className="ul-title">{u.title}</span>
      <Ring value={mastery} size={28} />
    </button>
  );
}

export function Header({ title, back, children }: { title: string; back?: string | (() => void); children?: React.ReactNode }) {
  return (
    <div className="pagehead">
      {back && (
        <button className="iconbtn" aria-label="뒤로" onClick={() => (typeof back === 'string' ? navigate(back) : back())}>
          ‹
        </button>
      )}
      <h1>{title}</h1>
      <div className="ph-right">{children}</div>
    </div>
  );
}
