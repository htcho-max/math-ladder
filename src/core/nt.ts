// 정수론·수 도우미
export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}
export function lcm(a: number, b: number): number {
  return a === 0 || b === 0 ? 0 : Math.abs(a / gcd(a, b) * b);
}
export function isPrime(n: number): boolean {
  if (n < 2 || !Number.isInteger(n)) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}
export function divisors(n: number): number[] {
  const out: number[] = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) out.push(i);
  return out;
}
/** 소인수분해: [[2,3],[5,1]] = 2^3·5 */
export function factorize(n: number): [number, number][] {
  const out: [number, number][] = [];
  let m = n;
  for (let p = 2; p * p <= m; p++) {
    let e = 0;
    while (m % p === 0) {
      m /= p;
      e++;
    }
    if (e) out.push([p, e]);
  }
  if (m > 1) out.push([m, 1]);
  return out;
}
/** 부동소수 오차 정리: round(0.1+0.2, 10) = 0.3 */
export function round(x: number, places = 10): number {
  const f = 10 ** places;
  const r = Math.round(x * f) / f;
  return Object.is(r, -0) ? 0 : r;
}
export function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}
export function nCr(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  r = Math.min(r, n - r);
  let v = 1;
  for (let i = 0; i < r; i++) v = (v * (n - i)) / (i + 1);
  return Math.round(v);
}
export function nPr(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  let v = 1;
  for (let i = 0; i < r; i++) v *= n - i;
  return v;
}
/** 완전제곱 인수 빼기: 72 → [6, 2] (= 6√2) */
export function simplifySqrt(n: number): [number, number] {
  let out = 1;
  let inner = n;
  for (let k = Math.floor(Math.sqrt(n)); k > 1; k--) {
    if (inner % (k * k) === 0) {
      out *= k;
      inner /= k * k;
      k = Math.floor(Math.sqrt(inner)) + 1;
    }
  }
  return [out, inner];
}
export function range(a: number, b: number): number[] {
  const out: number[] = [];
  for (let i = a; i <= b; i++) out.push(i);
  return out;
}
