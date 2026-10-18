// 유리수(분수) — 항상 기약, 분모 양수
import { gcd } from './nt';

export class F {
  readonly n: number;
  readonly d: number;
  constructor(n: number, d = 1) {
    if (d === 0) throw new Error('분모 0');
    if (!Number.isInteger(n) || !Number.isInteger(d)) {
      throw new Error(`F 는 정수만: ${n}/${d}`);
    }
    if (d < 0) {
      n = -n;
      d = -d;
    }
    const g = gcd(Math.abs(n), d) || 1;
    this.n = n / g;
    this.d = d / g;
    if (Object.is(this.n, -0)) (this as { n: number }).n = 0;
  }
  static of(x: F | number): F {
    return x instanceof F ? x : new F(x, 1);
  }
  /** 유한소수/작은 분모 실수 → 분수 (분모 ≤ maxDen) */
  static fromNumber(x: number, maxDen = 10000): F {
    const r = approxFrac(x, maxDen);
    if (!r) throw new Error(`분수로 바꿀 수 없음: ${x}`);
    return new F(r[0], r[1]);
  }
  add(o: F | number): F {
    const b = F.of(o);
    return new F(this.n * b.d + b.n * this.d, this.d * b.d);
  }
  sub(o: F | number): F {
    const b = F.of(o);
    return new F(this.n * b.d - b.n * this.d, this.d * b.d);
  }
  mul(o: F | number): F {
    const b = F.of(o);
    return new F(this.n * b.n, this.d * b.d);
  }
  div(o: F | number): F {
    const b = F.of(o);
    return new F(this.n * b.d, this.d * b.n);
  }
  neg(): F {
    return new F(-this.n, this.d);
  }
  inv(): F {
    return new F(this.d, this.n);
  }
  pow(k: number): F {
    let r = new F(1);
    const base: F = k < 0 ? this.inv() : this;
    for (let i = 0; i < Math.abs(k); i++) r = r.mul(base);
    return r;
  }
  eq(o: F | number): boolean {
    const b = F.of(o);
    return this.n === b.n && this.d === b.d;
  }
  cmp(o: F | number): number {
    const b = F.of(o);
    return Math.sign(this.n * b.d - b.n * this.d);
  }
  get value(): number {
    return this.n / this.d;
  }
  isInt(): boolean {
    return this.d === 1;
  }
  /** TeX: 정수면 정수, 아니면 \frac (음수는 앞에 -) */
  tex(): string {
    if (this.d === 1) return String(this.n);
    const s = this.n < 0 ? '-' : '';
    return `${s}\\frac{${Math.abs(this.n)}}{${this.d}}`;
  }
  /** TeX 대분수: 2\frac{1}{3} (가분수가 아니면 그냥 분수) */
  mixedTex(): string {
    if (this.d === 1) return String(this.n);
    const a = Math.abs(this.n);
    const w = Math.floor(a / this.d);
    const r = a % this.d;
    const s = this.n < 0 ? '-' : '';
    if (w === 0) return `${s}\\frac{${r}}{${this.d}}`;
    return `${s}${w}\\frac{${r}}{${this.d}}`;
  }
  /** 일반 텍스트 '3/4' */
  toString(): string {
    return this.d === 1 ? String(this.n) : `${this.n}/${this.d}`;
  }
}

/** 연분수로 x ≈ p/q (q ≤ maxDen, 오차 1e-9) */
export function approxFrac(x: number, maxDen = 10000): [number, number] | null {
  if (!Number.isFinite(x)) return null;
  const sign = x < 0 ? -1 : 1;
  let v = Math.abs(x);
  let h0 = 0,
    h1 = 1,
    k0 = 1,
    k1 = 0;
  for (let i = 0; i < 40; i++) {
    const a = Math.floor(v);
    const h2 = a * h1 + h0;
    const k2 = a * k1 + k0;
    if (k2 > maxDen) break;
    h0 = h1;
    h1 = h2;
    k0 = k1;
    k1 = k2;
    if (Math.abs(Math.abs(x) - h1 / k1) < 1e-9 * Math.max(1, Math.abs(x))) {
      return [sign * h1, k1];
    }
    const frac = v - a;
    if (frac < 1e-12) break;
    v = 1 / frac;
  }
  if (k1 > 0 && Math.abs(Math.abs(x) - h1 / k1) < 1e-9 * Math.max(1, Math.abs(x))) return [sign * h1, k1];
  return null;
}
