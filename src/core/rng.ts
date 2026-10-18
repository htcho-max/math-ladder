// 시드 고정 난수 (mulberry32). 문제 생성기는 반드시 이것만 사용.
export class Rng {
  private s: number;
  constructor(seed: number) {
    this.s = seed >>> 0 || 0x9e3779b9;
  }
  /** [0,1) */
  next(): number {
    let t = (this.s = (this.s + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  /** a 이상 b 이하 정수 */
  int(a: number, b: number): number {
    if (b < a) [a, b] = [b, a];
    return a + Math.floor(this.next() * (b - a + 1));
  }
  /** a 이상 b 이하, 0 제외 정수 */
  nonzero(a: number, b: number): number {
    for (let i = 0; i < 100; i++) {
      const v = this.int(a, b);
      if (v !== 0) return v;
    }
    return b > 0 ? b : a;
  }
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
  /** 서로 다른 k개 */
  sample<T>(arr: readonly T[], k: number): T[] {
    return this.shuffle(arr).slice(0, k);
  }
  shuffle<T>(arr: readonly T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  chance(p: number): boolean {
    return this.next() < p;
  }
  sign(): 1 | -1 {
    return this.next() < 0.5 ? 1 : -1;
  }
}

/** 문자열 → 32비트 해시 */
export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function randomSeed(): number {
  return (Math.random() * 2 ** 31) >>> 0;
}
