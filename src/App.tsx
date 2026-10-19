import { useEffect } from 'react';
import { useRoute, navigate } from './lib/router';
import { useStore } from './lib/store';
import { dueWrong } from './lib/mastery';
import { HomePage } from './pages/HomePage';
import { MapPage } from './pages/MapPage';
import { UnitPage, NotFound } from './pages/UnitPage';
import { PracticePage } from './pages/PracticePage';
import { WrongPage } from './pages/WrongPage';
import { ExamPrint, ExamResult, ExamRun, ExamSetup } from './pages/ExamPage';
import { StatsPage } from './pages/StatsPage';
import { SettingsPage } from './pages/SettingsPage';
import { BadgesPage } from './pages/BadgesPage';
import { ClosetPage } from './pages/ClosetPage';
import { Toasts } from './ui/Celebrate';
import { applyFreezes } from './lib/reward';
import { OfflineBadge } from './ui/Offline';
import { Icon } from './ui/Icon';
import { COURSE_BY_ID } from './core/curriculum';
import { activeProfile } from './lib/store';

const TABS = [
  { path: '', name: '홈', ic: 'home', match: ['', 'badges', 'closet'] },
  { path: 'map', name: '학습 지도', ic: 'map', match: ['map', 'unit', 'practice'] },
  { path: 'exam', name: '시험', ic: 'exam', match: ['exam'] },
  { path: 'wrong', name: '오답노트', ic: 'note', match: ['wrong', 'review', 'retry', 'similar'] },
  { path: 'stats', name: '기록', ic: 'chart', match: ['stats'] },
];

function Page({ r }: { r: string[] }) {
  const [a, b, c, d] = r;
  switch (a ?? '') {
    case '':
      return <HomePage />;
    case 'map':
      return <MapPage />;
    case 'unit':
      return <UnitPage id={b} />;
    case 'practice':
      if (b === 'c' && c && (d === 'calc' || d === 'concept' || d === 'word')) return <PracticePage mode={{ kind: 'unit', unitId: c, cat: d }} />;
      return b === 'u' && c ? <PracticePage mode={{ kind: 'unit', unitId: c, skillId: d }} /> : <NotFound />;
    case 'review':
      return <PracticePage mode={{ kind: 'review' }} />;
    case 'retry':
      return <PracticePage mode={{ kind: 'retry', key: b }} />;
    case 'similar':
      return <PracticePage mode={{ kind: 'similar', key: b }} />;
    case 'wrong':
      return <WrongPage />;
    case 'exam':
      if (b === 'run') return <ExamRun />;
      if (b === 'result' && c) return <ExamResult id={c} />;
      if (b === 'print' && c) return <ExamPrint id={c} />;
      if (b === 'new' && c === 'unit') return <ExamSetup presetUnit={d} />;
      return <ExamSetup />;
    case 'stats':
      return <StatsPage />;
    case 'settings':
      return <SettingsPage />;
    case 'badges':
      return <BadgesPage />;
    case 'closet':
      return <ClosetPage />;
    default:
      return <NotFound />;
  }
}

export function App() {
  const { parts, raw } = useRoute();
  const theme = useStore((s) => s.settings.theme);
  const look = useStore((s) => s.settings.look ?? 'auto');
  const myStage = useStore((s) => COURSE_BY_ID[activeProfile(s).course]?.stage ?? 'e');
  const stage = look === 'auto' ? myStage : look;
  useEffect(() => {
    document.documentElement.dataset.stage = stage;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', stage === 'e' ? '#3d7bff' : stage === 'm' ? '#0f9d8a' : '#3949c7');
  }, [stage]);
  const storageError = useStore((s) => s.storageError);
  const due = useStore((s) => dueWrong(s.data).length);
  useEffect(() => {
    applyFreezes();
  }, []);
  useEffect(() => {
    const el = document.documentElement;
    if (theme === 'auto') delete el.dataset.theme;
    else el.dataset.theme = theme;
  }, [theme]);
  const top = parts[0] ?? '';
  const inExam = top === 'exam' && parts[1] === 'run';
  return (
    <div className={'app' + (inExam ? ' focus' : '')}>
      <header className="topbar noprint">
        <button className="brand" onClick={() => navigate('/')}>
          <span className="logo">
            <Icon name="ladder" size={20} stroke={2.4} />
          </span>
          <span className="brand-t">수학 사다리</span>
        </button>
        <nav className="topnav">
          {TABS.map((t) => (
            <button key={t.path} className={t.match.includes(top) ? 'on' : ''} onClick={() => navigate('/' + t.path)}>
              {t.name}
              {t.path === 'wrong' && due > 0 && <span className="dotbadge">{due}</span>}
            </button>
          ))}
        </nav>
        <button className={'iconbtn' + (top === 'settings' ? ' on' : '')} aria-label="설정" onClick={() => navigate('/settings')}>
          <Icon name="gear" />
        </button>
      </header>
      <OfflineBadge />
      {storageError && <div className="storage-warn noprint">{storageError}</div>}
      <main>
        <Page key={raw} r={parts} />
      </main>
      <Toasts />
      <nav className="tabbar noprint">
        {TABS.map((t) => (
          <button key={t.path} className={t.match.includes(top) ? 'on' : ''} onClick={() => navigate('/' + t.path)}>
            <span className="tb-ic">
              <Icon name={t.ic} size={23} stroke={t.match.includes(top) ? 2.4 : 1.9} />
            </span>
            <span className="tb-t">{t.name}</span>
            {t.path === 'wrong' && due > 0 && <span className="dotbadge">{due}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}
