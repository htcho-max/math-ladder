// 디지털 연습장: 화면 위에 펜으로 계산하는 투명 캔버스 (펜·형광펜·지우개·색·굵기·전체 지우기)
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';

type Tool = 'pen' | 'hl' | 'eraser';
const COLORS = ['#1e293b', '#2563eb', '#dc2626', '#16a34a'];
const COLORS_DARK = ['#e5e9f2', '#60a5fa', '#f87171', '#4ade80'];

export function ScratchButton({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button className={'iconbtn scratch-btn' + (on ? ' on' : '')} aria-pressed={on} onClick={onToggle} title="연습장 (손으로 계산하기)">
      <Icon name="pencil" size={21} />
    </button>
  );
}

export function Scratchpad({ resetKey, onClose }: { resetKey: string; onClose: () => void }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState(0);
  const [width, setWidth] = useState(3);
  const [hidden, setHidden] = useState(false); // 잠깐 치워 두고 답 입력
  const drawing = useRef<{ x: number; y: number } | null>(null);
  const dark = typeof window !== 'undefined' && getComputedStyle(document.documentElement).colorScheme.includes('dark');
  const palette = dark ? COLORS_DARK : COLORS;

  const fit = () => {
    const c = cv.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = window.innerWidth;
    const h = Math.max(document.documentElement.scrollHeight, window.innerHeight);
    if (c.width === Math.round(w * dpr) && c.height === Math.round(h * dpr)) return;
    const old = document.createElement('canvas');
    old.width = c.width;
    old.height = c.height;
    old.getContext('2d')?.drawImage(c, 0, 0);
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    c.style.width = w + 'px';
    c.style.height = h + 'px';
    const g = c.getContext('2d')!;
    g.drawImage(old, 0, 0);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  useEffect(() => {
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  // 문제가 바뀌면 지우기
  useEffect(() => {
    const c = cv.current;
    if (c) c.getContext('2d')?.clearRect(0, 0, c.width, c.height);
  }, [resetKey]);

  const pos = (e: React.PointerEvent) => {
    const r = cv.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const down = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    drawing.current = pos(e);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const g = cv.current!.getContext('2d')!;
    const p = pos(e);
    g.lineCap = 'round';
    g.lineJoin = 'round';
    if (tool === 'eraser') {
      g.globalCompositeOperation = 'destination-out';
      g.lineWidth = width * 6;
      g.strokeStyle = '#000';
      g.globalAlpha = 1;
    } else {
      g.globalCompositeOperation = 'source-over';
      g.strokeStyle = tool === 'hl' ? '#facc15' : palette[color];
      g.globalAlpha = tool === 'hl' ? 0.35 : 1;
      g.lineWidth = tool === 'hl' ? width * 5 : width * (e.pressure && e.pointerType === 'pen' ? 0.5 + e.pressure : 1);
    }
    g.beginPath();
    g.moveTo(drawing.current.x, drawing.current.y);
    g.lineTo(p.x, p.y);
    g.stroke();
    drawing.current = p;
  };
  const up = () => {
    drawing.current = null;
  };
  const clear = () => {
    const c = cv.current;
    if (c) c.getContext('2d')?.clearRect(0, 0, c.width, c.height);
  };

  return createPortal(
    <>
      <canvas
        ref={cv}
        className={'scratch-canvas' + (hidden ? ' off' : '')}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        aria-label="연습장"
      />
      <div className="scratch-bar noprint" role="toolbar" aria-label="연습장 도구">
        <button className={tool === 'pen' ? 'on' : ''} onClick={() => setTool('pen')} title="펜">
          ✒️
        </button>
        <button className={tool === 'hl' ? 'on' : ''} onClick={() => setTool('hl')} title="형광펜">
          🖍️
        </button>
        <button className={tool === 'eraser' ? 'on' : ''} onClick={() => setTool('eraser')} title="지우개">
          🧽
        </button>
        <span className="sb-sep" />
        {palette.map((c, i) => (
          <button key={c} className={'sb-color' + (color === i && tool === 'pen' ? ' on' : '')} style={{ background: c }} onClick={() => (setColor(i), setTool('pen'))} aria-label={`색 ${i + 1}`} />
        ))}
        <span className="sb-sep" />
        {[2, 3, 5].map((w) => (
          <button key={w} className={width === w ? 'on' : ''} onClick={() => setWidth(w)} aria-label={`굵기 ${w}`}>
            <span className="sb-dot" style={{ width: w * 2 + 2, height: w * 2 + 2 }} />
          </button>
        ))}
        <span className="sb-sep" />
        <button onClick={clear} title="전체 지우기">
          🗑️
        </button>
        <button onClick={() => setHidden(!hidden)} title={hidden ? '연습장 다시 쓰기' : '잠깐 치우고 답 입력'}>
          {hidden ? '✍️' : '👆'}
        </button>
        <button onClick={onClose} title="연습장 닫기">
          ✕
        </button>
      </div>
    </>,
    document.body,
  );
}
