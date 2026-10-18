// location.hash 기반 간단한 라우터
import { useEffect, useState } from 'react';

export function parseHash(h = location.hash): string[] {
  const path = h.replace(/^#\/?/, '').split('?')[0];
  return path ? path.split('/').map((s) => decodeURIComponent(s)) : [];
}

export function navigate(path: string, replace = false): void {
  const h = '#' + (path.startsWith('/') ? path : '/' + path);
  if (replace) history.replaceState(null, '', h);
  else location.hash = h;
  if (replace) window.dispatchEvent(new HashChangeEvent('hashchange'));
}

export function useRoute(): { parts: string[]; raw: string } {
  const [r, setR] = useState({ parts: parseHash(), raw: location.hash });
  useEffect(() => {
    const f = () => {
      setR({ parts: parseHash(), raw: location.hash });
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return r;
}

export const enc = encodeURIComponent;
