// 답 입력 해석과 채점
import type { AnswerSpec } from './types';
import { gcd } from './nt';
import { numTex } from './tex';
import { approxFrac } from './frac';

export interface Parsed {
  value: number;
  /** 분수로 입력했을 때 [분자, 분모] (대분수는 가분수로) */
  frac?: [number, number];
}

/** '3', '-2.5', '3/4', '-3/4', '2 1/3', '2와 1/3', '1,200', '−5' 를 수로 */
export function parseNum(raw: string): Parsed | null {
  let s = raw
    .trim()
    .replace(/[−–—]/g, '-')
    .replace(/＋/g, '+')
    .replace(/\s*와\s*/g, ' ')
    .replace(/\s+/g, ' ');
  if (s === '') return null;
  // 천 단위 쉼표 제거 (1,200 / 12,345,678)
  if (/^[+-]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, '');
  let m = s.match(/^([+-])?\s*(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (m) {
    const sign = m[1] === '-' ? -1 : 1;
    const w = +m[2],
      a = +m[3],
      b = +m[4];
    if (b === 0) return null;
    const n = w * b + a;
    return { value: (sign * n) / b, frac: [sign * n, b] };
  }
  m = s.match(/^([+-])?\s*(\d+)\s*\/\s*(\d+)$/);
  if (m) {
    const sign = m[1] === '-' ? -1 : 1;
    const a = +m[2],
      b = +m[3];
    if (b === 0) return null;
    return { value: (sign * a) / b, frac: [sign * a, b] };
  }
  m = s.match(/^([+-])?\s*(\d+\.?\d*|\.\d+)$/);
  if (m) {
    const v = parseFloat(m[2]) * (m[1] === '-' ? -1 : 1);
    return { value: v };
  }
  return null;
}

export function near(a: number, b: number): boolean {
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
}

export type UserAnswer = string | string[] | number; // num/set: 문자열, fields: 문자열 배열, choice: 인덱스

export interface Verdict {
  ok: boolean;
  /** 형식 문제 안내 (예: 기약분수로) */
  note?: string;
}

export function judge(spec: AnswerSpec, ans: UserAnswer | undefined): Verdict {
  if (ans === undefined || ans === '') return { ok: false };
  switch (spec.type) {
    case 'num': {
      const p = parseNum(String(ans));
      if (!p) return { ok: false, note: '숫자로 입력해 주세요' };
      if (!near(p.value, spec.value)) return { ok: false };
      if (spec.requireReduced && p.frac && gcd(p.frac[0], p.frac[1]) !== 1) {
        return { ok: false, note: '값은 맞지만 기약분수로 나타내야 해요' };
      }
      return { ok: true };
    }
    case 'fields': {
      const arr = Array.isArray(ans) ? ans : [];
      const ok = spec.fields.every((f, i) => {
        const p = parseNum(arr[i] ?? '');
        return !!p && near(p.value, f.value);
      });
      return { ok };
    }
    case 'set': {
      const parts = String(ans)
        .split(/[,，;]|\s+또는\s+|\s+/)
        .map((t) => t.trim())
        .filter(Boolean);
      const vals = parts.map((t) => parseNum(t));
      if (vals.some((v) => !v)) return { ok: false, note: '수를 쉼표로 구분해 입력해 주세요' };
      const want = [...new Set(spec.values.map((v) => Math.round(v * 1e9) / 1e9))];
      const got = [...new Set(vals.map((v) => Math.round(v!.value * 1e9) / 1e9))];
      if (want.length !== got.length) return { ok: false };
      return { ok: want.every((w) => got.some((g) => near(g, w))) };
    }
    case 'choice':
      return { ok: Number(ans) === spec.index };
  }
}

/** 표시 방식이 정해지지 않은 중·고등 답: 분모 100 이하 분수로 깔끔히 나타나면 분수 (0.75 → 3/4, 2.5 는 그대로) */
export function autoDisplay(v: number, unitId: string): 'frac' | undefined {
  if (unitId.startsWith('e') || Number.isInteger(v)) return undefined;
  const places = (String(Math.round(v * 1e10) / 1e10).split('.')[1] ?? '').length;
  if (places <= 1) return undefined;
  const f = approxFrac(v, 100);
  return f ? 'frac' : undefined;
}

/** 정답을 보여 줄 문자열 ($…$ 포함 가능) */
export function answerText(spec: AnswerSpec, unitId = ''): string {
  const auto = (v: number, d?: 'int' | 'dec' | 'frac' | 'mixed') => numTex(v, d ?? autoDisplay(v, unitId));
  switch (spec.type) {
    case 'num':
      return `$${auto(spec.value, spec.display)}$${spec.unit ? ' ' + spec.unit : ''}`;
    case 'fields':
      return spec.fields.map((f) => `${f.label}: $${auto(f.value, f.display)}$${f.unit ? ' ' + f.unit : ''}`).join(', ');
    case 'set':
      return [...spec.values]
        .sort((a, b) => a - b)
        .map((v) => `$${auto(v)}$`)
        .join(', ');
    case 'choice':
      return `${'①②③④⑤⑥⑦⑧'[spec.index]} ${spec.choices[spec.index]}`;
  }
}
