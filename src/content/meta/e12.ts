import type { MetaMap } from '../meta';

export const META: MetaMap = {
  // ───────── 초1-1
  'e1a-1': {
    pitfalls: [
      '같은 것을 두 번 세거나 하나를 빼먹어요 → 센 것에 표시를 하면서 하나씩 짚어 세어요.',
      '"뒤에서 몇째"를 앞에서부터 세어 버려요 → 어느 쪽에서 세는지 먼저 보고, 그쪽 끝에서 첫째부터 세어요.',
      '"$5$보다 크고 $9$보다 작은 수"에 $5$와 $9$도 넣어요 → 두 수 사이에 있는 $6, 7, 8$만 세어요.',
    ],
    cats: { count: 'calc', read: 'concept', order: 'calc', 'one-more-less': 'calc', compare: 'calc', 'order-story': 'word', 'number-story': 'word' },
  },
  'e1a-2': {
    pitfalls: [
      '크기나 색이 다르면 다른 모양이라고 생각해요 → 크기·색은 신경 쓰지 말고 생김새(상자, 둥근기둥, 공)만 보아요.',
      '둥근기둥 모양은 잘 안 굴러간다고 해요 → 눕히면 잘 굴러가고, 세우면 쌓을 수 있어요. 공 모양은 쌓기 어려워요.',
    ],
    cats: { 'name-solid': 'concept', 'count-solid': 'concept', feature: 'concept', objects: 'concept', build: 'concept', 'riddle-story': 'word', 'sort-story': 'word' },
  },
  'e1a-3': {
    pitfalls: [
      '"주었다", "먹었다"인데 더해 버려요 → 없어지는 이야기는 빼기, 받거나 모으는 이야기는 더하기예요.',
      '$\\square+2=3$ 에서 $3$과 $2$를 더해 $5$라고 써요 → 무엇에 $2$를 더하면 $3$이 되는지 생각하면 $1$이에요.',
    ],
    cats: { 'gather-split': 'calc', add: 'calc', sub: 'calc', word: 'word', 'choose-sign': 'calc', 'split-story': 'word' },
  },
  'e1a-4': {
    pitfalls: [
      '한쪽 끝을 맞추지 않고 길이를 비교해요 → 한쪽 끝을 똑같이 맞춘 다음 다른 쪽 끝을 보아요.',
      '시소에서 위로 올라간 쪽이 더 무겁다고 해요 → 무거운 쪽이 아래로 내려가요. 올라간 쪽이 더 가벼워요.',
      '컵으로 부은 횟수가 많으면 컵이 크다고 해요 → 같은 물통을 채울 때 여러 번 부어야 하면 컵이 더 작아요.',
    ],
    cats: { length: 'concept', weight: 'concept', area: 'concept', capacity: 'concept', words: 'concept', 'order-story': 'word', 'measure-story': 'word' },
  },
  'e1a-5': {
    pitfalls: [
      '$10$개씩 묶음 $2$개와 낱개 $13$개를 $213$이라고 써요 → 낱개 $13$개는 $10$개 묶음 $1$개와 낱개 $3$개라서 모두 $33$이에요.',
      '$34$와 $26$을 낱개 숫자 $4$와 $6$으로 비교해요 → 먼저 $10$개씩 묶음(앞자리) 수를 비교해요.',
    ],
    cats: { 'make-ten': 'calc', bundles: 'calc', read: 'concept', order: 'calc', compare: 'calc', 'bundle-story': 'word', 'compare-story': 'word' },
  },
  // ───────── 초1-2
  'e1b-1': {
    pitfalls: [
      '"일흔"을 $17$로 써요 → 일흔은 $10$개씩 묶음 $7$개라서 $70$이에요.',
      '$8\\square>87$ 에서 $7$도 넣어요 → $87>87$ 은 아니니까 $7$은 안 되고 $8, 9$만 돼요.',
      '"$30$과 $40$ 사이"에 $30$, $40$도 세요 → 사이에 있는 수는 두 수를 빼고 세어요.',
    ],
    cats: { bundles: 'calc', read: 'concept', order: 'calc', compare: 'calc', 'even-odd': 'concept', 'bundle-story': 'word', 'order-story': 'word' },
  },
  'e1b-2': {
    pitfalls: [
      '$64+4$ 에서 $4$를 십의 자리에 더해 $104$라고 해요 → 낱개는 낱개끼리, $10$개 묶음은 묶음끼리 더해요.',
      '세로셈에서 자리를 맞추지 않고 써요 → 일의 자리 숫자끼리 오른쪽 끝을 맞춰 세워 써요.',
    ],
    cats: { add: 'calc', sub: 'calc', vertical: 'calc', word: 'word', 'compare-calc': 'calc', 'more-less-story': 'word' },
  },
  'e1b-3': {
    pitfalls: [
      '$6$시 $30$분인데 짧은바늘이 $6$과 $7$ 사이라서 $7$시라고 읽어요 → 짧은바늘이 지나온 숫자 $6$을 읽어 $6$시예요.',
      '긴바늘과 짧은바늘을 바꿔서 읽어요 → 짧은바늘은 "시", 긴바늘은 "분"이에요. 긴바늘이 $6$이면 $30$분이에요.',
      '동그라미(● 모양)에도 뾰족한 곳이 있다고 해요 → ● 모양은 곧은 선도, 뾰족한 곳도 없어요.',
    ],
    cats: { 'name-flat': 'concept', 'count-flat': 'concept', corner: 'concept', 'read-clock': 'concept', 'clock-hands': 'concept', 'clock-story': 'word', 'shape-story': 'word' },
  },
  'e1b-4': {
    pitfalls: [
      '$7-5+1$ 을 $5+1$ 부터 해서 $1$이라고 해요 → 세 수의 계산은 앞에서부터 차례로 해요: $7-5=2$, $2+1=3$.',
      '$10-7$ 을 $7$이라고 써요 → $10$에서 $7$을 덜어 내면 $3$이 남아요. $7+3=10$ 으로 확인해요.',
    ],
    cats: { three: 'calc', 'make-ten': 'calc', 'ten-minus': 'calc', 'make-ten-add': 'calc', word: 'word', 'ten-story': 'word' },
  },
  'e1b-5': {
    pitfalls: [
      '처음 두 개만 보고 규칙을 정해요 → 되풀이되는 묶음(예: 포도, 감, 감)이 몇 개인지 끝까지 확인해요.',
      '$16, 18, 20$ 다음을 $21$이라고 써요 → 얼마씩 커지는지 먼저 보아요. $2$씩 커지니까 $22$예요.',
    ],
    cats: {
      'shape-next': 'concept',
      'word-pattern': 'concept',
      'number-pattern': 'calc',
      'hundred-chart': 'calc',
      'repeat-count': 'concept',
      'pattern-story': 'word',
      'number-story': 'word',
    },
  },
  'e1b-6': {
    pitfalls: [
      '$5+9$ 를 $5$에서 하나씩 세다가 틀려요 → $9$에 $1$을 주어 $10$을 만들면 $10+4=14$ 예요.',
      '$14-6$ 에서 $6-4$ 를 해서 $12$라고 해요 → $14$를 $10$과 $4$로 갈라 $10-6=4$, $4+4=8$ 이에요.',
    ],
    cats: { 'add-carry': 'calc', 'sub-borrow': 'calc', method: 'calc', word: 'word', 'table-pattern': 'calc', 'diff-story': 'word' },
  },
  // ───────── 초2-1
  'e2a-1': {
    pitfalls: [
      '"사백구십"을 $400$과 $90$을 붙여 $40090$으로 써요 → 백의 자리 $4$, 십의 자리 $9$, 일의 자리 $0$이라서 $490$이에요.',
      '$163$의 $6$은 그냥 $6$이라고 해요 → 십의 자리에 있으니 $60$을 나타내요.',
      '$10$이 $14$개를 십의 자리에 $14$로 써요 → $10$이 $14$개는 $140$이니 백의 자리로 $1$을 올려요.',
    ],
    cats: { blocks: 'calc', 'place-value': 'concept', 'read-write': 'concept', 'skip-count': 'calc', compare: 'calc', 'money-story': 'word', 'count-story': 'word' },
  },
  'e2a-2': {
    pitfalls: [
      '원에도 변과 꼭짓점이 있다고 해요 → 원은 굽은 선뿐이라 변도 꼭짓점도 없어요.',
      '꼭짓점을 셀 때 같은 곳을 두 번 세요 → 하나 센 꼭짓점에 표시를 하며 돌아가며 세어요.',
      '쌓기나무에서 아래에 받친 것을 빼먹어요 → 위에 있는 쌓기나무 밑에는 받치는 쌓기나무가 있어요. 층별로 세어요.',
    ],
    cats: { 'name-shape': 'concept', parts: 'concept', 'count-shapes': 'concept', cubes: 'concept', 'true-false': 'concept', 'sticks-story': 'word', 'cube-story': 'word' },
  },
  'e2a-3': {
    pitfalls: [
      '받아올림한 $1$을 십의 자리에 더하지 않아요 → $26+9$ 는 일의 자리 $15$에서 $1$을 올려 $35$예요.',
      '$71-3$ 에서 큰 수에서 작은 수를 빼 $3-1$ 을 해요 → $1$에서 $3$을 못 빼면 십의 자리에서 $10$을 빌려 $11-3$ 을 해요.',
      '"잘못하여 뺐더니" 문제에서 바로 답을 써요 → 먼저 어떤 수를 거꾸로 구한 뒤 바르게 다시 계산해요.',
    ],
    cats: { 'add-carry': 'calc', 'sub-borrow': 'calc', box: 'calc', three: 'calc', word: 'word', 'unknown-story': 'word' },
  },
  'e2a-4': {
    pitfalls: [
      '자의 눈금 $1$부터 끝을 맞추고 끝 숫자를 읽어요 → 눈금 $0$에 맞추거나, 몇 칸인지 세어서 길이를 구해요.',
      '뼘으로 잰 횟수가 많으면 뼘이 길다고 해요 → 같은 길이를 여러 번 재야 하면 뼘이 더 짧아요.',
    ],
    cats: { ruler: 'concept', units: 'concept', 'grid-cm': 'concept', estimate: 'concept', compare: 'word', 'unit-story': 'word' },
  },
  'e2a-5': {
    pitfalls: [
      '"예쁜 것", "좋아하는 것"으로 나눠요 → 사람마다 다르면 안 돼요. 색·모양·다리 수처럼 누가 해도 같은 기준을 골라요.',
      '셀 때 빠뜨리거나 두 번 세요 → 하나 셀 때마다 표시(/)를 하고, 다 센 뒤 모두 더해 전체 수와 맞는지 보아요.',
    ],
    cats: { criterion: 'concept', 'sort-count': 'concept', tally: 'concept', group: 'concept', result: 'concept', 'survey-story': 'word', 'sort-story': 'word' },
  },
  'e2a-6': {
    pitfalls: [
      '$4+4+4+4+4$ 를 $4\\times4$ 로 써요 → $4$를 몇 번 더했는지 세어요. $5$번이니 $4\\times5$ 예요.',
      '"$8$의 $2$배"를 $8+2$ 로 해요 → $2$배는 $8$을 $2$번 더하는 것이니 $8\\times2=16$ 이에요.',
    ],
    cats: { groups: 'calc', times: 'calc', 'add-to-mul': 'concept', word: 'word', 'skip-line': 'calc', 'times-story': 'word' },
  },
  // ───────── 초2-2
  'e2b-1': {
    pitfalls: [
      '"구천육십구"를 $969$로 써요 → 백의 자리가 비었으니 $0$을 꼭 써서 $9069$예요.',
      '가장 작은 네 자리 수를 만들 때 $0$을 맨 앞에 놓아요 → $0$은 천의 자리에 올 수 없어요. 둘째로 작은 숫자를 맨 앞에 놓아요.',
    ],
    cats: { cards: 'calc', 'place-value': 'concept', 'read-write': 'concept', 'skip-count': 'calc', compare: 'calc', 'money-story': 'word', 'skip-story': 'word' },
  },
  'e2b-2': {
    pitfalls: [
      '$9\\times1$ 을 $10$이나 $1$이라고 해요 → 어떤 수에 $1$을 곱하면 그 수 그대로예요. $9\\times1=9$.',
      '$0$점 칸에 맞힌 것도 점수를 더해요 → $0$에 몇을 곱해도 $0$이에요.',
      '$3\\times\\square>16$ 에서 $3\\times5=15$ 도 답이라고 해요 → $3$단을 차례로 외워 $16$보다 처음 커지는 $3\\times6$ 을 찾아요.',
    ],
    cats: { fact: 'calc', box: 'calc', word: 'word', table: 'calc', compare: 'calc', 'zero-one': 'word' },
  },
  'e2b-3': {
    pitfalls: [
      '$5$ m $9$ cm를 $59$ cm라고 해요 → $1$ m는 $100$ cm라서 $500+9=509$ cm예요.',
      'cm끼리 더한 값이 $100$을 넘어도 그대로 써요 → $100$ cm는 $1$ m로 바꿔 m에 $1$을 올려요.',
    ],
    cats: { convert: 'calc', add: 'word', sub: 'word', estimate: 'concept', compare: 'calc' },
  },
  'e2b-4': {
    pitfalls: [
      '$1$시간을 $100$분으로 생각해요 → $1$시간은 $60$분이에요. $80$분은 $1$시간 $20$분이에요.',
      '오전 $8$시에서 오후 $3$시까지를 $8-3=5$ 시간이라고 해요 → 낮 $12$시까지 $4$시간, 그 뒤 $3$시간을 더해 $7$시간이에요.',
      '하루를 $12$시간이라고 해요 → 하루는 오전 $12$시간과 오후 $12$시간을 합한 $24$시간이에요.',
    ],
    cats: { 'read-clock': 'concept', 'hour-min': 'calc', elapsed: 'word', day: 'calc', calendar: 'concept', 'schedule-story': 'word' },
  },
  'e2b-5': {
    pitfalls: [
      '표의 합계 칸 수를 한 항목의 수로 읽어요 → 합계는 모두 더한 수예요. 항목 이름이 있는 칸을 찾아 읽어요.',
      '○ 그래프에서 ○를 세지 않고 칸 번호만 보아요 → 한 줄에 그려진 ○의 개수를 하나씩 세어요.',
    ],
    cats: {
      'make-table': 'concept',
      'table-blank': 'calc',
      'graph-read': 'concept',
      'table-vs-graph': 'concept',
      'graph-check': 'concept',
      'table-story': 'word',
      'graph-story': 'word',
    },
  },
  'e2b-6': {
    pitfalls: [
      '13째를 셀 때 처음부터 하나씩 세다가 틀려요 → 되풀이되는 묶음의 길이로 나누어, 남는 수로 자리를 찾아요.',
      '쌓기나무 모양이 몇 개씩 늘어나는지 보지 않아요 → 첫째, 둘째, 셋째의 개수 차를 먼저 구해 규칙을 찾아요.',
    ],
    cats: { rotate: 'concept', stack: 'concept', 'add-table': 'calc', 'mul-table': 'calc', life: 'word', 'grow-story': 'word' },
  },
};
