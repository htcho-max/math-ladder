import katex from 'katex';
import { memo } from 'react';
import { splitMath } from '../core/mathtext';

const cache = new Map<string, string>();

function tex(s: string, display: boolean): string {
  const k = (display ? 'D' : 'I') + s;
  let h = cache.get(k);
  if (h === undefined) {
    try {
      h = katex.renderToString(s, { displayMode: display, throwOnError: false, strict: 'ignore', output: 'html' });
    } catch {
      h = escapeHtml(s);
    }
    if (cache.size > 3000) cache.clear();
    cache.set(k, h);
  }
  return h;
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function textHtml(s: string): string {
  return escapeHtml(s);
}

/** '$…$' 수식, '**굵게**', 줄바꿈, '- ' 목록 렌더 */
export function mathHtml(src: string): string {
  const segs = splitMath(src);
  let html = '';
  for (const g of segs) {
    if (g.t === 'text') html += textHtml(g.s);
    else html += g.t === 'display' ? `<div class="mdisp">${tex(g.s, true)}</div>` : tex(g.s, false);
  }
  // 줄 단위 처리 (굵게는 수식을 사이에 둔 경우도 있어 합친 뒤 줄마다 처리)
  const lines = html.split('\n').map((l) => l.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'));
  let out = '';
  let inList = false;
  for (const line of lines) {
    const m = line.match(/^\s*- (.*)$/);
    if (m) {
      if (!inList) out += '<ul>';
      inList = true;
      out += `<li>${m[1]}</li>`;
      continue;
    }
    if (inList) {
      out += '</ul>';
      inList = false;
    } else if (out) out += '<br>';
    out += line;
  }
  if (inList) out += '</ul>';
  return out.replace(/<br>(<div class="mdisp">)/g, '$1').replace(/(<\/div>)<br>/g, '$1');
}

export const MathText = memo(function MathText({ text, className, as = 'div' }: { text: string; className?: string; as?: 'div' | 'span' }) {
  const Tag = as;
  return <Tag className={'mt ' + (className ?? '')} dangerouslySetInnerHTML={{ __html: mathHtml(text) }} />;
});

export function Fig({ svg }: { svg: string }) {
  return <div className="figwrap" dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function Table({ rows }: { rows: string[][] }) {
  return (
    <div className="tablewrap">
      <table className="ptable">
        <thead>
          <tr>
            {rows[0].map((c, i) => (
              <th key={i}>
                <MathText as="span" text={c} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(1).map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>
                  <MathText as="span" text={c} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
