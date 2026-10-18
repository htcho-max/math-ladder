// '$…$' 인라인 / '$$…$$' 블록 수식이 섞인 문자열 쪼개기
export type Seg = { t: 'text' | 'inline' | 'display'; s: string };

export function splitMath(src: string): Seg[] {
  const out: Seg[] = [];
  let i = 0;
  let buf = '';
  while (i < src.length) {
    if (src[i] === '\\' && src[i + 1] === '$') {
      buf += '$';
      i += 2;
      continue;
    }
    if (src[i] === '$') {
      const display = src[i + 1] === '$';
      const open = display ? 2 : 1;
      const close = display ? src.indexOf('$$', i + 2) : findClose(src, i + 1);
      if (close < 0) {
        buf += src.slice(i);
        break;
      }
      if (buf) out.push({ t: 'text', s: buf });
      buf = '';
      out.push({ t: display ? 'display' : 'inline', s: src.slice(i + open, close) });
      i = close + open;
      continue;
    }
    buf += src[i++];
  }
  if (buf) out.push({ t: 'text', s: buf });
  return out;
}

function findClose(s: string, from: number): number {
  for (let j = from; j < s.length; j++) {
    if (s[j] === '\\') {
      j++;
      continue;
    }
    if (s[j] === '$') return j;
  }
  return -1;
}
