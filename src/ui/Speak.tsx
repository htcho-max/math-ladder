// 문제 읽어 주기 (브라우저 음성 합성, 한국어). 초등 저학년용
import { useEffect, useState } from 'react';
import { splitMath } from '../core/mathtext';
import type { Problem } from '../core/types';
import { useStore } from '../lib/store';

/** TeX → 읽기 쉬운 한국어 */
export function texToSpeech(t: string): string {
  let s = t.replace(/\{,\}/g, '').replace(/(\d+)\s*\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, ' $1와 $3분의 $2 ');
  for (let i = 0; i < 3; i++) {
    s = s.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, ' $2분의 $1 ');
    s = s.replace(/\\sqrt\{([^{}]*)\}/g, ' 루트 $1 ');
  }
  s = s
    .replace(/\^\{?2\}?/g, ' 제곱 ')
    .replace(/\^\{?3\}?/g, ' 세제곱 ')
    .replace(/\^\{([^{}]*)\}/g, ' 의 $1 제곱 ')
    .replace(/\\times/g, ' 곱하기 ')
    .replace(/\\div/g, ' 나누기 ')
    .replace(/\\square/g, ' 네모 ')
    .replace(/\\(le|leq)/g, ' 작거나 같다 ')
    .replace(/\\(ge|geq)/g, ' 크거나 같다 ')
    .replace(/\\ne/g, ' 같지 않다 ')
    .replace(/\\pi/g, ' 파이 ')
    .replace(/\\angle/g, ' 각 ')
    .replace(/\\triangle/g, ' 삼각형 ')
    .replace(/\\overline\{([^{}]*)\}/g, ' 선분 $1 ')
    .replace(/\\text\{([^{}]*)\}/g, ' $1 ')
    .replace(/\\(left|right|,|;|quad|qquad|displaystyle)/g, ' ')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/\+/g, ' 더하기 ')
    .replace(/([0-9a-zA-Z)가-힣])\s*-\s*/g, '$1 빼기 ')
    .replace(/-/g, ' 마이너스 ')
    .replace(/=/g, ' 는 ')
    .replace(/</g, ' 보다 작다 ')
    .replace(/>/g, ' 보다 크다 ')
    .replace(/[{}]/g, ' ')
    .replace(/(\d),(\d{3})/g, '$1$2');
  return s.replace(/\s+/g, ' ').trim();
}

export function problemSpeech(p: Problem): string {
  const q = splitMath(p.q)
    .map((g) => (g.t === 'text' ? g.s : texToSpeech(g.s)))
    .join(' ')
    .replace(/\*\*/g, '');
  let out = q;
  if (p.answer.type === 'choice') out += '. ' + p.answer.choices.map((c, i) => `${i + 1}번, ${splitMath(c).map((g) => (g.t === 'text' ? g.s : texToSpeech(g.s))).join(' ')}`).join('. ');
  return out;
}

export function speechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function SpeakButton({ p }: { p: Problem }) {
  const mode = useStore((s) => s.settings.tts ?? 'auto');
  const [on, setOn] = useState(false);
  useEffect(() => {
    return () => {
      if (speechAvailable()) speechSynthesis.cancel();
    };
  }, [p.key]);
  if (!speechAvailable() || mode === 'off') return null;
  if (mode === 'auto' && !/^e[1-4]/.test(p.unitId)) return null;
  const speak = () => {
    speechSynthesis.cancel();
    if (on) {
      setOn(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(problemSpeech(p));
    u.lang = 'ko-KR';
    u.rate = 0.9;
    const ko = speechSynthesis.getVoices().find((v) => v.lang.startsWith('ko'));
    if (ko) u.voice = ko;
    u.onend = () => setOn(false);
    u.onerror = () => setOn(false);
    setOn(true);
    speechSynthesis.speak(u);
  };
  return (
    <button className={'speak-btn' + (on ? ' on' : '')} onClick={speak} aria-label={on ? '읽기 멈추기' : '문제 읽어 주기'}>
      {on ? '⏹ 멈추기' : '🔊 읽어 주기'}
    </button>
  );
}
