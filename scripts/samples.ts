// 문제 견본 출력 (눈으로 검토용)
// 사용: npx vite-node scripts/samples.ts -- m1a-1 [개수=2]
//       npx vite-node scripts/samples.ts -- m1a        (과정 전체)
import { CONTENT } from '../src/content';
import { UNITS } from '../src/core/curriculum';
import { answerText } from '../src/core/check';
import { Rng, hashStr } from '../src/core/rng';
import type { Level } from '../src/core/types';

const args = process.argv.slice(2).filter((a) => a !== '--');
const prefix = args[0] ?? '';
const n = Number(args[1] ?? 2);

for (const u of UNITS.filter((x) => x.id === prefix || x.course === prefix || (prefix.endsWith('*') && x.id.startsWith(prefix.slice(0, -1))))) {
  const c = CONTENT[u.id];
  console.log(`\n████ ${u.id} ${u.title} ${c ? '' : '(콘텐츠 없음)'}`);
  if (!c) continue;
  for (const sk of c.skills) {
    console.log(`\n── ${sk.id}: ${sk.title}`);
    for (const level of [1, 2, 3] as Level[]) {
      for (let s = 1; s <= n; s++) {
        const d = sk.gen(new Rng((s * 7919) ^ hashStr(`${u.id}/${sk.id}`)), level as 1 | 2 | 3);
        console.log(`[L${level}] ${d.q.replace(/\n/g, ' / ')}`);
        if (d.table) console.log('   표: ' + d.table.map((r) => r.join(' | ')).join(' ; '));
        if (d.fig) console.log(`   (그림 ${d.fig.length}자)`);
        if (d.answer.type === 'choice') console.log('   보기: ' + d.answer.choices.map((c, i) => `${i + 1}) ${c}`).join('  '));
        console.log(`   정답: ${answerText(d.answer)}`);
        console.log(`   풀이: ${d.steps.join(' ⟶ ')}`);
      }
    }
  }
}
