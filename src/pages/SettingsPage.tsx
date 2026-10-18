import { rwOf, setGoal } from '../lib/reward';
import { useRef, useState } from 'react';
import { COURSES } from '../core/curriculum';
import {
  activeProfile,
  addProfile,
  deleteProfile,
  exportBackup,
  importBackup,
  resetData,
  switchProfile,
  updateProfile,
  updateSettings,
  useStore,
} from '../lib/store';
import { Header } from '../ui/bits';

function CourseSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {(['e', 'm', 'h'] as const).map((st) => (
        <optgroup key={st} label={st === 'e' ? '초등' : st === 'm' ? '중등' : '고등'}>
          {COURSES.filter((c) => c.stage === st).map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} ({c.grade})
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

export function SettingsPage() {
  const s = useStore((x) => x);
  const prof = activeProfile(s);
  const [newName, setNewName] = useState('');
  const [newCourse, setNewCourse] = useState('e1a');
  const [showKey, setShowKey] = useState(false);
  const [msg, setMsg] = useState('');
  const file = useRef<HTMLInputElement>(null);

  const download = () => {
    const blob = new Blob([exportBackup()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const dt = new Date();
    a.download = `수학사다리-백업-${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, '0')}${String(dt.getDate()).padStart(2, '0')}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  return (
    <div className="page">
      <Header title="설정" back="/" />
      <section className="card form">
        <div className="card-h">내 프로필</div>
        <label className="frow">
          <span>이름</span>
          <input type="text" value={prof.name} onChange={(e) => updateProfile(prof.id, { name: e.target.value })} />
        </label>
        <label className="frow">
          <span>학년(과정)</span>
          <CourseSelect value={prof.course} onChange={(v) => updateProfile(prof.id, { course: v })} />
        </label>
        <div className="muted small">학년은 홈의 '이어서 학습' 추천과 시험 기본 범위에 쓰여요.</div>
      </section>

      <section className="card form">
        <div className="card-h">프로필 ({s.profiles.length})</div>
        {s.profiles.map((p) => (
          <div key={p.id} className="profrow">
            <span className={p.id === s.active ? 'b' : ''}>
              {p.name} <span className="muted small">{COURSES.find((c) => c.id === p.course)?.title}</span>
            </span>
            <span className="btnrow tight">
              {p.id !== s.active && (
                <button className="btn small" onClick={() => switchProfile(p.id)}>
                  전환
                </button>
              )}
              {p.id === s.active && <span className="badge">사용 중</span>}
              {s.profiles.length > 1 && (
                <button className="btn small ghost" onClick={() => confirm(`${p.name} 프로필과 기록을 삭제할까요?`) && deleteProfile(p.id)}>
                  삭제
                </button>
              )}
            </span>
          </div>
        ))}
        <div className="frow wrap">
          <input type="text" placeholder="새 프로필 이름" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <CourseSelect value={newCourse} onChange={setNewCourse} />
          <button
            className="btn"
            disabled={!newName.trim()}
            onClick={() => {
              addProfile(newName.trim(), newCourse);
              setNewName('');
            }}
          >
            추가
          </button>
        </div>
      </section>

      <section className="card form">
        <div className="card-h">AI 선생님 (선택)</div>
        <div className="muted small">Google Gemini API 키를 넣으면 문제마다 'AI 선생님에게 묻기'와 시험의 AI 서술형 문항을 쓸 수 있어요. 키는 이 기기에만 저장돼요.</div>
        <label className="frow">
          <span>API 키</span>
          <span className="inrow grow">
            <input type={showKey ? 'text' : 'password'} value={s.settings.geminiKey} placeholder="AIza…" onChange={(e) => updateSettings({ geminiKey: e.target.value.trim() })} autoComplete="off" />
            <button className="btn small ghost" onClick={() => setShowKey(!showKey)}>
              {showKey ? '숨기기' : '보기'}
            </button>
          </span>
        </label>
        <label className="frow">
          <span>모델</span>
          <input type="text" value={s.settings.geminiModel} onChange={(e) => updateSettings({ geminiModel: e.target.value.trim() || 'gemini-2.5-flash-lite' })} />
        </label>
      </section>

      <section className="card form">
        <div className="card-h">목표와 보상</div>
        <div className="frow">
          <span>하루 목표</span>
          <div className="seg">
            {[10, 20, 30, 50].map((g) => (
              <button key={g} className={rwOf(s.data).goal === g ? 'on' : ''} onClick={() => setGoal(g)}>
                {g}문제
              </button>
            ))}
          </div>
        </div>
        <div className="frow">
          <span>축하 효과</span>
          <div className="seg">
            <button className={s.settings.effects !== false ? 'on' : ''} onClick={() => updateSettings({ effects: true })}>
              켜기
            </button>
            <button className={s.settings.effects === false ? 'on' : ''} onClick={() => updateSettings({ effects: false })}>
              끄기
            </button>
          </div>
        </div>
        <div className="muted small">하루 목표는 지금 프로필에만 적용돼요. 축하 효과는 레벨 업·배지 때 색종이가 날려요.</div>
      </section>

      <section className="card form">
        <div className="card-h">문제 형식</div>
        <div className="frow">
          <span>연습 문제</span>
          <div className="seg">
            {([
              ['mix', '섞어서'],
              ['open', '주관식 위주'],
              ['choice', '객관식 위주'],
            ] as const).map(([k, label]) => (
              <button key={k} className={(s.settings.choiceMode ?? 'mix') === k ? 'on' : ''} onClick={() => updateSettings({ choiceMode: k })}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="muted small">섞어서: 주관식과 객관식이 반반쯤 나와요. 시험(단원평가·중간·기말)은 실제 학교 시험처럼 객관식이 더 많이 나와요.</div>
      </section>

      <section className="card form">
        <div className="card-h">화면</div>
        <div className="frow">
          <span>테마</span>
          <div className="seg">
            {(['auto', 'light', 'dark'] as const).map((t) => (
              <button key={t} className={s.settings.theme === t ? 'on' : ''} onClick={() => updateSettings({ theme: t })}>
                {t === 'auto' ? '자동' : t === 'light' ? '밝게' : '어둡게'}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="card form">
        <div className="card-h">백업</div>
        <div className="muted small">기록은 이 기기의 브라우저에 저장돼요. 기기를 바꾸거나 브라우저 기록을 지우기 전에 백업해 두세요.</div>
        <div className="btnrow">
          <button className="btn" onClick={download}>
            백업 내보내기
          </button>
          <button className="btn" onClick={() => file.current?.click()}>
            백업 불러오기
          </button>
          <input
            ref={file}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                importBackup(await f.text());
                setMsg('백업을 불러왔어요.');
              } catch (err) {
                setMsg('불러오기 실패: ' + (err as Error).message);
              }
              e.target.value = '';
            }}
          />
        </div>
        {msg && <div className="small">{msg}</div>}
        <div className="btnrow">
          <button className="btn danger" onClick={() => confirm(`${prof.name}의 학습 기록·오답노트·시험 기록을 모두 지울까요?`) && resetData()}>
            이 프로필 기록 초기화
          </button>
        </div>
      </section>
      <div className="muted small center">수학 사다리 v{__APP_VERSION__} · 2022 개정 교육과정 기준</div>
    </div>
  );
}
