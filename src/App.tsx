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

const TABS = [
  { path: '', name: '홈', ic: '🏠', match: [''] },
  { path: 'map', name: '학습 지도', ic: '🗺️', match: ['map', 'unit', 'practice'] },
  { path: 'exam', name: '시험', ic: '📝', match: ['exam'] },
  { path: 'wrong', name: '오답노트', ic: '📒', match: ['wrong', 'review', 'retry', 'similar'] },
  { path: 'stats', name: '기록', ic: '📈', match: ['stats'] },
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
    default:
      return <NotFound />;
  }
}

export function App() {
  const { parts, raw } = useRoute();
  const theme = useStore((s) => s.settings.theme);
  const storageError = useStore((s) => s.storageError);
  const due = useStore((s) => dueWrong(s.data).length);
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
          <span className="logo">∑</span> 수학 사다리
        </button>
        <nav className="topnav">
          {TABS.map((t) => (
            <button key={t.path} className={t.match.includes(top) ? 'on' : ''} onClick={() => navigate('/' + t.path)}>
              {t.name}
              {t.path === 'wrong' && due > 0 && <span className="dotbadge">{due}</span>}
            </button>
          ))}
        </nav>
        <button className="iconbtn" aria-label="설정" onClick={() => navigate('/settings')}>
          ⚙️
        </button>
      </header>
      {storageError && <div className="storage-warn noprint">{storageError}</div>}
      <main>
        <Page key={raw} r={parts} />
      </main>
      <nav className="tabbar noprint">
        {TABS.map((t) => (
          <button key={t.path} className={t.match.includes(top) ? 'on' : ''} onClick={() => navigate('/' + t.path)}>
            <span className="tb-ic">{t.ic}</span>
            <span className="tb-t">{t.name}</span>
            {t.path === 'wrong' && due > 0 && <span className="dotbadge">{due}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}
