// 부모 PIN: 숫자 4자리, 소금 + SHA-256 해시로 저장. 풀린 상태는 메모리에만 10분 유지
import { getState, updateSettings } from './store';

export interface PinRec {
  salt: string;
  hash: string;
}

const UNLOCK_MS = 10 * 60 * 1000;
let unlockedUntil = 0;

async function sha(text: string): Promise<string> {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // subtle 이 없는 환경(드묾): 간단한 해시
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
    return (h >>> 0).toString(16);
  }
}

function salt(): string {
  const a = new Uint8Array(8);
  crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function makeRec(secret: string): Promise<PinRec> {
  const s = salt();
  return { salt: s, hash: await sha(s + ':' + secret.trim()) };
}

export async function matches(rec: PinRec | undefined, secret: string): Promise<boolean> {
  if (!rec) return false;
  return (await sha(rec.salt + ':' + secret.trim())) === rec.hash;
}

export function hasPin(): boolean {
  return !!getState().settings.parentPin;
}

export function isUnlocked(): boolean {
  return !hasPin() || Date.now() < unlockedUntil;
}

export function unlock(): void {
  unlockedUntil = Date.now() + UNLOCK_MS;
}

export function lockNow(): void {
  unlockedUntil = 0;
}

export async function setPin(pin: string, recovery?: { q: string; a: string }): Promise<void> {
  const parentPin = await makeRec(pin);
  const pinRecovery = recovery && recovery.q.trim() && recovery.a.trim() ? { q: recovery.q.trim(), ...(await makeRec(recovery.a.toLowerCase().replace(/\s+/g, ''))) } : undefined;
  updateSettings({ parentPin, pinRecovery, pinOff: false });
  unlock();
}

export async function checkPin(pin: string): Promise<boolean> {
  const ok = await matches(getState().settings.parentPin, pin);
  if (ok) unlock();
  return ok;
}

export async function checkRecovery(answer: string): Promise<boolean> {
  const r = getState().settings.pinRecovery;
  if (!r) return false;
  return matches(r, answer.toLowerCase().replace(/\s+/g, ''));
}

/** PIN 삭제. off=true 면 'PIN 없이 쓰기'(다시 만들라고 묻지 않음) */
export function removePin(off = false): void {
  updateSettings({ parentPin: undefined, pinRecovery: undefined, pinOff: off });
  lockNow();
}
