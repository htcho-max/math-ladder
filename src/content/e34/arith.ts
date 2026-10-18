// e34 공용 계산 풀이 도우미 (곱셈·나눗셈 단계 설명)
import { comma } from '../../core/tex';

const PLACE = ['일', '십', '백', '천', '만'];

/** (여러 자리 수)×(한 자리 수) 자리별 풀이 */
export function mul1Steps(a: number, b: number): string[] {
  const ds = String(a).split('').map(Number).reverse();
  let carry = 0;
  const st: string[] = [];
  ds.forEach((d, i) => {
    const v = d * b + carry;
    const last = i === ds.length - 1;
    st.push(`${PLACE[i]}의 자리: $${d}\\times${b}${carry ? `+${carry}` : ''}=${v}$${!last && v >= 10 ? ` → $${v % 10}$ 쓰고 $${Math.floor(v / 10)}$ 올림` : ''}`);
    carry = Math.floor(v / 10);
  });
  st.push(`따라서 $${comma(a)}\\times${b}=${comma(a * b)}$`);
  return st;
}

/** (두·세 자리 수)×(두 자리 수) 풀이: 일의 자리 곱 + 십의 자리 곱 */
export function mul2Steps(a: number, b: number): string[] {
  const t = Math.floor(b / 10) * 10,
    u = b % 10;
  if (u === 0) return [`$${comma(a)}\\times${b / 10}=${comma(a * (b / 10))}$ 에 $0$을 하나 붙여요.`, `$${comma(a)}\\times${b}=${comma(a * b)}$`];
  return [`$${comma(a)}\\times${u}=${comma(a * u)}$`, `$${comma(a)}\\times${t}=${comma(a * t)}$`, `$${comma(a * u)}+${comma(a * t)}=${comma(a * b)}$`];
}

/** (여러 자리 수)÷(한 자리 또는 두 자리 수) 세로 나눗셈 풀이 */
export function divSteps(a: number, b: number): string[] {
  const ds = String(a).split('').map(Number);
  let rem = 0;
  let started = false;
  const st: string[] = [];
  for (let i = 0; i < ds.length; i++) {
    const cur = rem * 10 + ds[i];
    const q = Math.floor(cur / b);
    if (!started && q === 0) {
      rem = cur;
      if (i < ds.length - 1) continue;
    }
    started = true;
    const nr = cur - q * b;
    st.push(`$${comma(cur)}$ 안에 $${b}$가 $${q}$번: $${b}\\times${q}=${comma(b * q)}$, $${comma(cur)}-${comma(b * q)}=${nr}$`);
    rem = nr;
  }
  const Q = Math.floor(a / b),
    R = a % b;
  st.push(R ? `몫 $${comma(Q)}$, 나머지 $${R}$ (확인: $${b}\\times${comma(Q)}+${R}=${comma(a)}$)` : `몫 $${comma(Q)}$ (확인: $${b}\\times${comma(Q)}=${comma(a)}$)`);
  return st;
}
