import { useState } from 'react';
import { CONTENT } from '../content';
import { COURSE_BY_ID, UNIT_BY_ID, nextUnits } from '../core/curriculum';
import { skillScore, unitMastery } from '../lib/mastery';
import { navigate } from '../lib/router';
import { useStore } from '../lib/store';
import { Bar, Header, Ring, StrandTag, UnitLink } from '../ui/bits';
import { MathText } from '../ui/MathText';
import type { Concept } from '../core/types';

export function UnitPage({ id }: { id: string }) {
  const d = useStore((s) => s.data);
  const u = UNIT_BY_ID[id];
  if (!u) return <NotFound />;
  const c = CONTENT[id];
  const m = unitMastery(d, id);
  const nexts = nextUnits(id);
  return (
    <div className="page">
      <Header title={u.title} back="/map" />
      <section className="card unit-hero">
        <div className="uh-top">
          <div>
            <div className="muted small">
              {COURSE_BY_ID[u.course].title} · {u.no}단원 · {u.term === 'mid' ? '중간고사 범위' : '기말고사 범위'}
            </div>
            <div className="uh-sum">{u.summary}</div>
            <StrandTag s={u.strand} />
          </div>
          <Ring value={m} size={64} />
        </div>
        {c && (
          <div className="btnrow">
            <button className="btn primary" onClick={() => navigate(`/practice/u/${id}`)}>
              단원 전체 연습
            </button>
            <button className="btn" onClick={() => navigate(`/exam/new/unit/${id}`)}>
              단원평가
            </button>
          </div>
        )}
      </section>

      {(u.prereq.length > 0 || nexts.length > 0) && (
        <section className="card">
          <div className="card-h">개념의 연결</div>
          {u.prereq.length > 0 && (
            <>
              <div className="sub-h">⬅ 먼저 배울 단원</div>
              <div className="links">
                {u.prereq.map((p) => (
                  <UnitLink key={p} u={UNIT_BY_ID[p]} mastery={unitMastery(d, p)} />
                ))}
              </div>
            </>
          )}
          {nexts.length > 0 && (
            <>
              <div className="sub-h">이어지는 단원 ➡</div>
              <div className="links">
                {nexts.map((n) => (
                  <UnitLink key={n.id} u={n} mastery={unitMastery(d, n.id)} />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {!c ? (
        <section className="card">
          <div className="muted">이 단원의 개념 설명과 문제는 준비 중이에요.</div>
        </section>
      ) : (
        <>
          <section className="card">
            <div className="card-h">개념 익히기</div>
            <div className="concepts">
              {c.concepts.map((k, i) => (
                <ConceptCard key={i} k={k} i={i} />
              ))}
            </div>
          </section>
          <section className="card">
            <div className="card-h">문제 유형</div>
            <div className="skills">
              {c.skills.map((sk) => {
                const sc = Math.round(skillScore(d, id, sk.id));
                return (
                  <div key={sk.id} className="skill">
                    <div className="sk-info">
                      <div className="sk-t">{sk.title}</div>
                      <Bar value={sc} />
                    </div>
                    <span className="sk-sc">{sc}</span>
                    <button className="btn small" onClick={() => navigate(`/practice/u/${id}/${sk.id}`)}>
                      연습
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function ConceptCard({ k, i }: { k: Concept; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="concept">
      <div className="cc-h">
        <span className="cc-n">{i + 1}</span>
        <MathText as="span" text={k.title} />
      </div>
      <MathText className="cc-b" text={k.body} />
      {k.example && (
        <div className="example">
          <div className="ex-q">
            <span className="ex-tag">예제</span>
            <MathText as="span" text={k.example.q} />
          </div>
          {open ? (
            <MathText className="ex-a" text={k.example.a} />
          ) : (
            <button className="link" onClick={() => setOpen(true)}>
              정답 보기
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function NotFound() {
  return (
    <div className="page">
      <Header title="찾을 수 없어요" back="/" />
      <div className="card muted">요청한 화면이 없어요.</div>
    </div>
  );
}
