import type { MetaMap } from '../meta';

export const META: MetaMap = {
  // ───────── 초3-1
  'e3a-1': {
    pitfalls: [
      '받아올림한 $1$을 윗자리에 더하는 것을 잊어요 → 받아올린 $1$을 작게 적어 두고 윗자리를 더할 때 꼭 함께 더해요.',
      '$310-139$ 처럼 $0$이 있는 뺄셈에서 받아내림을 한 번만 해요 → 십의 자리가 $0$이면 백의 자리에서 빌려 와 십의 자리를 $9$로 만들어요.',
    ],
    cats: { add3: 'calc', sub3: 'calc', word: 'word', 'missing-digit': 'calc', compare: 'calc', 'word-two': 'word', 'cards-sum-diff': 'calc' },
  },
  'e3a-2': {
    pitfalls: [
      '반직선 ㄱㄴ과 반직선 ㄴㄱ을 같다고 해요 → 반직선은 시작점과 늘어나는 방향이 달라서 서로 다른 도형이에요.',
      '크고 작은 사각형을 셀 때 작은 것만 세요 → 한 칸짜리, 두 칸짜리 … 크기별로 나누어 빠짐없이 세어요.',
      '정사각형은 직사각형이 아니라고 해요 → 네 각이 모두 직각이니 정사각형도 직사각형이에요.',
    ],
    cats: {
      'line-kind': 'concept',
      'count-angles': 'concept',
      'true-false': 'concept',
      'rect-perimeter': 'calc',
      'count-squares': 'concept',
      'shape-wire': 'word',
      'paper-cut': 'word',
      'rays-angles': 'concept',
    },
  },
  'e3a-3': {
    pitfalls: [
      '$\\square\\div6=4$ 에서 $6\\div4$ 를 하려고 해요 → 나누어지는 수를 구하는 것이니 곱셈으로 바꿔 $6\\times4=24$ 예요.',
      '$16$ cm 끈을 $4$ cm씩 자를 때 자르는 횟수를 도막 수 $4$라고 해요 → 마지막 도막은 자르지 않으니 $4-1=3$ 번이에요.',
    ],
    cats: { 'div-fact': 'calc', 'mul-div-relation': 'concept', 'repeated-sub': 'calc', 'share-word': 'word', 'div-compare': 'calc', 'div-word2': 'word', 'div-wrong': 'calc' },
  },
  'e3a-4': {
    pitfalls: [
      '$77\\times2$ 에서 일의 자리 곱 $14$를 그대로 써요 → $4$만 쓰고 $1$은 십의 자리로 올려 $14+1=15$ 처럼 더해요.',
      '"잘못하여 더했더니" 문제에서 잘못된 값으로 바로 곱해요 → 먼저 어떤 수를 구한 뒤 바르게 곱해요.',
    ],
    cats: { mul21: 'calc', 'mul-word': 'word', 'mul-missing': 'calc', 'mul-compare': 'calc', 'mul-cards': 'calc', 'mul-word2': 'word', 'guess-check': 'word' },
  },
  'e3a-5': {
    pitfalls: [
      '$1$분을 $100$초로 생각해 계산해요 → $1$분은 $60$초, $1$시간은 $60$분이에요. 받아내림할 때 $60$을 빌려 와요.',
      '$219$ mm를 $2$ cm $19$ mm라고 해요 → $1$ cm는 $10$ mm라서 $21$ cm $9$ mm예요.',
      '$1$ km를 $100$ m로 생각해요 → $1$ km는 $1000$ m예요. m끼리 더해 $1000$이 넘으면 km로 올려요.',
    ],
    cats: {
      'len-convert': 'calc',
      'len-calc': 'calc',
      'time-convert': 'calc',
      'time-calc': 'calc',
      'time-word': 'word',
      'unit-choose': 'concept',
      'len-word': 'word',
      'time-reverse': 'word',
    },
  },
  'e3a-6': {
    pitfalls: [
      '똑같이 나누지 않은 그림도 분수로 나타내요 → 전체를 크기가 같게 나눈 경우에만 분수로 나타낼 수 있어요.',
      '$\\frac{1}{3}$ 이 $\\frac{1}{5}$ 보다 작다고 해요 → 분자가 $1$이면 분모가 작을수록 한 조각이 커요.',
      '"남은 부분"을 묻는데 먹은 부분으로 답해요 → 전체 칸 수에서 먹은 칸 수를 빼서 남은 칸을 세어요.',
    ],
    cats: {
      'frac-fig': 'concept',
      'unit-frac-compare': 'concept',
      'part-whole': 'word',
      'decimal-read': 'calc',
      'decimal-compare': 'calc',
      'dec-word': 'word',
      'dec-cards': 'concept',
    },
  },
  // ───────── 초3-2
  'e3b-1': {
    pitfalls: [
      '$25\\times18$ 에서 십의 자리 곱 $25\\times1$ 을 한 칸 왼쪽으로 옮겨 쓰지 않아요 → 사실은 $25\\times10=250$ 이니 한 자리 밀어 써요.',
      '$80\\times80$ 을 $640$이라고 해요 → $8\\times8=64$ 뒤에 $0$을 두 개 붙여 $6400$이에요.',
    ],
    cats: { mul31: 'calc', 'mul-tens': 'calc', mul22: 'calc', word: 'word', cards: 'calc', 'word-two': 'word', 'mul-closest': 'calc' },
  },
  'e3b-2': {
    pitfalls: [
      '나머지가 나누는 수보다 크거나 같아도 그대로 써요 → 나머지는 항상 나누는 수보다 작아야 해요. 크면 몫을 더 키워요.',
      '$52$ cm로 $6$ cm짜리를 몇 개 만드는지에서 나머지까지 한 개로 세요 → 남은 $4$ cm로는 하나를 못 만드니 몫 $8$개만 답해요.',
      '검산을 $9\\times6$ 까지만 해요 → (나누는 수)$\\times$(몫)에 나머지를 꼭 더해야 나누어지는 수가 나와요.',
    ],
    cats: { 'div-tens': 'calc', 'div-rem': 'calc', div3: 'calc', check: 'calc', word: 'word', 'word-two': 'word', 'rem-condition': 'calc' },
  },
  'e3b-3': {
    pitfalls: [
      '반지름을 지름으로 착각해요 → 지름은 반지름의 $2$배예요. 원의 중심을 지나는 선분이 지름이에요.',
      '직사각형 안 원 $3$개에서 가로를 반지름 $\\times3$ 으로 구해요 → 가로에는 지름이 $3$개 들어가니 반지름 $\\times6$ 이에요.',
    ],
    cats: {
      'radius-diameter': 'calc',
      'circle-facts': 'concept',
      'circles-in-rect': 'calc',
      'center-chain': 'calc',
      'center-triangle': 'calc',
      'circle-life': 'word',
      'compass-word': 'word',
      'radius-chain': 'calc',
    },
  },
  'e3b-4': {
    pitfalls: [
      '$45$의 $\\frac{1}{9}$ 를 $45\\times9$ 로 계산해요 → $45$를 똑같이 $9$묶음으로 나눈 한 묶음이니 $45\\div9=5$ 예요.',
      '$1\\frac{2}{5}$ 를 가분수로 바꿀 때 $\\frac{3}{5}$ 처럼 $1$과 $2$를 더해요 → $1=\\frac{5}{5}$ 이니 $\\frac{5+2}{5}=\\frac{7}{5}$ 예요.',
      '$\\frac{5}{5}$ 를 진분수라고 해요 → 분자가 분모와 같거나 크면 가분수예요.',
    ],
    cats: {
      'part-of-set': 'calc',
      'group-frac': 'concept',
      'mixed-improper': 'calc',
      'frac-kind': 'concept',
      'frac-compare': 'calc',
      'frac-of-word': 'word',
      'mixed-word': 'word',
      'frac-reverse': 'word',
    },
  },
  'e3b-5': {
    pitfalls: [
      '$1$ L를 $100$ mL로 생각해요 → $1$ L $=1000$ mL, $1$ kg $=1000$ g이에요.',
      '$9$ kg $70$ g을 $9$ kg $700$ g처럼 읽어요 → $70$ g은 $070$ g이에요. 자리를 맞춰 계산해요.',
    ],
    cats: { convert: 'calc', 'cap-calc': 'calc', 'wt-calc': 'calc', 'unit-estimate': 'concept', word: 'word', 'word-two': 'word', 'container-weight': 'word' },
  },
  'e3b-6': {
    pitfalls: [
      '큰 그림과 작은 그림을 똑같이 한 개로 세요 → 그림마다 나타내는 수(예: 큰 그림 $10$, 작은 그림 $1$)를 확인하고 곱해서 더해요.',
      '그림 개수가 많으면 양도 많다고 해요 → 작은 그림이 많아도 큰 그림이 적으면 양이 적을 수 있어요. 수로 바꿔 비교해요.',
    ],
    cats: { read: 'concept', 'most-least': 'concept', 'sum-diff': 'calc', 'to-graph': 'concept', missing: 'calc', 'graph-use': 'word', 'graph-condition': 'word', 'graph-ratio': 'word' },
  },
  // ───────── 초4-1
  'e4a-1': {
    pitfalls: [
      '"이만 팔천칠백구십육"을 쓸 때 자리를 헷갈려요 → 네 자리씩 끊어 "만" 앞과 뒤를 따로 써요: $2$만 $8796$.',
      '빈 자리에 $0$을 쓰지 않아요 → 읽지 않은 자리는 $0$으로 채워야 해요. 쓴 뒤 자리 수를 세어 확인해요.',
      '자리 수가 다른 큰 수를 앞자리 숫자만 보고 비교해요 → 먼저 자리 수를 비교하고, 같으면 높은 자리부터 비교해요.',
    ],
    cats: { 'read-write': 'calc', 'place-value': 'concept', 'skip-count': 'calc', compare: 'calc', money: 'calc', 'save-skip': 'word', 'bill-count': 'word', 'big-cards': 'calc' },
  },
  'e4a-2': {
    pitfalls: [
      '각도기의 안쪽 눈금과 바깥쪽 눈금을 섞어 읽어요 → $0^{\\circ}$ 에서 시작한 쪽 눈금을 따라 읽어요.',
      '삼각형 세 각의 합을 $360^{\\circ}$ 로 해요 → 삼각형은 $180^{\\circ}$, 사각형은 $360^{\\circ}$ 예요.',
      '시계 바늘 사이 한 칸을 $5^{\\circ}$ 로 생각해요 → 숫자 한 칸은 $360^{\\circ}\\div12=30^{\\circ}$ 예요.',
    ],
    cats: {
      'angle-type': 'concept',
      'sum-diff': 'calc',
      'triangle-angle': 'calc',
      'quad-angle': 'calc',
      straight: 'calc',
      'clock-angle': 'calc',
      'angle-life': 'word',
      'angle-find': 'word',
      'overlap-angles': 'calc',
    },
  },
  'e4a-3': {
    pitfalls: [
      '$506\\times93$ 에서 $506\\times9$ 를 한 자리 밀어 쓰지 않아요 → 실제로는 $506\\times90$ 이니 일의 자리를 비우고 써요.',
      '버스 대수를 몫만 답해요 → 남은 학생도 타야 하니 나머지가 있으면 몫에 $1$을 더해요.',
    ],
    cats: { mul32: 'calc', div2: 'calc', check: 'calc', word: 'word', estimate: 'calc', 'word-two': 'word', 'cards-muldiv': 'calc' },
  },
  'e4a-4': {
    pitfalls: [
      '오른쪽으로 뒤집기와 시계 방향으로 돌리기를 헷갈려요 → 뒤집으면 좌우(또는 위아래)가 바뀌고, 돌리면 위쪽이 옆으로 가요.',
      '시계 방향 $90^{\\circ}$ 를 $5$번 돌리기를 $5$번 다 그려요 → $4$번 돌리면 제자리이니 $1$번 돌린 것과 같아요.',
      '같은 쪽으로 $2$번 뒤집으면 다른 모양이 된다고 해요 → $2$번 뒤집으면 처음 모양으로 돌아와요.',
    ],
    cats: { flip: 'concept', rotate: 'concept', combo: 'concept', 'which-move': 'concept', 'num-rotate': 'concept', 'letter-symmetry': 'concept' },
  },
  'e4a-5': {
    pitfalls: [
      '눈금 한 칸을 무조건 $1$로 읽어요 → 세로 눈금 숫자를 보고 한 칸이 얼마인지 먼저 구해요.',
      '막대가 길면 몇 배인지 길이 차로 답해요 → 몇 배는 큰 수를 작은 수로 나누어 구해요.',
    ],
    cats: { read: 'concept', compare: 'calc', 'table-link': 'calc', times: 'calc', interpret: 'concept', 'bar-use': 'word', 'bar-condition': 'word', 'bar-rescale': 'concept' },
  },
  'e4a-6': {
    pitfalls: [
      '$22+41=23+\\square$ 에서 $22+41$ 의 값 $63$을 답으로 써요 → 등호 양쪽 값이 같아야 하니 $63-23=40$ 이에요.',
      '수 배열에서 앞 두 수만 보고 규칙을 정해요 → 차가 일정한지, 차가 $1$씩 커지는지 여러 개를 비교해요.',
    ],
    cats: { 'num-table': 'calc', seq: 'calc', 'shape-pattern': 'concept', 'calc-pattern': 'calc', 'equal-sign': 'concept', 'pattern-life': 'word', 'number-pattern': 'word', 'seq-nth': 'calc' },
  },
  // ───────── 초4-2
  'e4b-1': {
    pitfalls: [
      '분모끼리도 더해요: $\\frac{1}{11}+\\frac{8}{11}\\ne\\frac{9}{22}$ → 분모가 같으면 분모는 그대로, 분자만 더해요.',
      '$3-2\\frac{1}{4}$ 에서 자연수 $3$을 그대로 두고 빼요 → $3$을 $2\\frac{4}{4}$ 로 바꾼 뒤 빼면 $\\frac{3}{4}$ 이에요.',
      '분자의 합이 분모보다 커도 그대로 둬요 → $\\frac{17}{11}$ 은 대분수 $1\\frac{6}{11}$ 로 바꿔 나타내요.',
    ],
    cats: {
      'add-proper': 'calc',
      'sub-proper': 'calc',
      'add-mixed': 'calc',
      'sub-mixed': 'calc',
      word: 'word',
      missing: 'calc',
      'word-two': 'word',
      'frac-cards': 'calc',
    },
  },
  'e4b-2': {
    pitfalls: [
      '이등변삼각형에서 길이가 같은 두 변이 어느 것인지 확인하지 않아요 → 그림의 표시나 조건을 보고 같은 두 변을 먼저 찾아요.',
      '두 각이 같으면 무조건 예각삼각형이라고 해요 → 나머지 한 각도 구해서 $90^{\\circ}$ 보다 크면 둔각삼각형이에요.',
    ],
    cats: { 'iso-side': 'calc', 'iso-angle': 'calc', 'classify-angle': 'concept', equilateral: 'calc', 'true-false': 'concept', 'tri-wire': 'word', 'tri-angle-word': 'word', 'count-triangles': 'concept' },
  },
  'e4b-3': {
    pitfalls: [
      '$8.1+16.554$ 를 오른쪽 끝에 맞춰 계산해요 → 소수점끼리 자리를 맞추고, 빈 자리는 $0$으로 채워요.',
      '$0.8$ 이 $0.75$ 보다 작다고 해요 → 자리 수가 많다고 크지 않아요. $0.80$ 과 $0.75$ 처럼 자리를 맞춰 비교해요.',
      '$1.967$ 의 $10$배를 $1.9670$ 처럼 $0$만 붙여요 → $10$배하면 소수점이 오른쪽으로 한 칸 옮겨져 $19.67$ 이에요.',
    ],
    cats: {
      'dec-place': 'concept',
      'dec-relation': 'calc',
      'dec-compare': 'calc',
      'dec-add': 'calc',
      'dec-sub': 'calc',
      word: 'word',
      'word-two': 'word',
      'dec-wrong': 'calc',
    },
  },
  'e4b-4': {
    pitfalls: [
      '평행사변형의 이웃한 두 각이 같다고 해요 → 마주 보는 각이 같고, 이웃한 두 각을 더하면 $180^{\\circ}$ 예요.',
      '평행선 사이의 거리를 비스듬한 선분 길이로 재요 → 두 평행선에 수직인 선분의 길이가 거리예요.',
      '정사각형은 마름모가 아니라고 해요 → 네 변의 길이가 모두 같으니 정사각형도 마름모예요.',
    ],
    cats: {
      'para-angle': 'calc',
      'quad-perimeter': 'calc',
      'quad-relation': 'concept',
      'perp-angle': 'calc',
      'parallel-distance': 'calc',
      'quad-wire': 'word',
      'quad-angle-word': 'word',
      'rhombus-diag-angle': 'calc',
    },
  },
  'e4b-5': {
    pitfalls: [
      '물결선(≈)이 있는 그래프에서 눈금을 $0$부터 센다고 생각해요 → 물결선 위 첫 눈금 숫자부터 읽어요.',
      '변화가 가장 큰 때를 값이 가장 큰 때로 답해요 → 선이 가장 많이 기울어진(두 점의 차가 가장 큰) 곳을 찾아요.',
    ],
    cats: { read: 'concept', change: 'concept', diff: 'calc', middle: 'calc', 'which-graph': 'concept', 'line-predict': 'word', 'line-use': 'word', 'line-missing': 'word' },
  },
  'e4b-6': {
    pitfalls: [
      '대각선을 셀 때 이웃한 꼭짓점끼리 이은 선(변)도 세요 → 대각선은 서로 이웃하지 않는 두 꼭짓점을 이은 선분이에요.',
      '한 꼭짓점에서 그은 대각선 수에 꼭짓점 수를 곱하고 끝내요 → 같은 대각선을 두 번 셌으니 $2$로 나누어요.',
      '변의 길이만 같으면 정다각형이라고 해요 → 변의 길이와 각의 크기가 모두 같아야 정다각형이에요.',
    ],
    cats: {
      'polygon-name': 'concept',
      'diag-count': 'calc',
      'regular-perimeter': 'calc',
      'regular-angle': 'calc',
      'diag-props': 'concept',
      'regular-wire': 'word',
      'polygon-word': 'word',
      'diag-vertex': 'concept',
    },
  },
};
