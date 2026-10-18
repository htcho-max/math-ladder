// 검증용: 단원/과정의 모든 유형 × 레벨 × 시드 n개를 실제 앱과 같은 방식(makeProblem)으로 출력
// 사용: npx vite-node scripts/verify-dump.ts -- <과정id 또는 단원id> [시드수=3] [시작시드=1000]
import { CONTENT } from '../src/content';
import { UNITS } from '../src/core/curriculum';
import { answerText } from '../src/core/check';
import { makeProblem } from '../src/core/problem';
import type { Level } from '../src/core/types';
const args = process.argv.slice(2).filter((a) => a !== '--');
const target = args[0];
const n = Number(args[1] ?? 3);
const start = Number(args[2] ?? 1000);
for (const u of UNITS.filter((x) => x.id === target || x.course === target)) {
  console.log(`\n████ ${u.id} ${u.title}`);
  for (const sk of CONTENT[u.id]?.skills ?? []) {
    for (const lv of [1, 2, 3] as Level[]) for (let s = start; s < start + n; s++) {
      const p = makeProblem(u.id, sk.id, lv, s);
      console.log(`\n[${p.key}] ${p.q}`);
      if (p.table) console.log('  표: ' + p.table.map((r) => r.join(' | ')).join(' ; '));
      if (p.fig) console.log(`  그림: ${p.fig.replace(/<defs>.*?<\/defs>/, '').replace(/<(line|polygon|polyline|rect|circle|path)[^>]*>/g, (m) => m.length > 90 ? m.slice(0, 90) + '…>' : m).slice(0, 900)}`);
      if (p.answer.type === 'choice') console.log('  보기: ' + p.answer.choices.map((c, i) => `${i + 1}) ${c}`).join('   '));
      console.log(`  정답: ${answerText(p.answer)}`);
      console.log(`  풀이: ${p.steps.join(' ⟶ ')}`);
    }
  }
}
