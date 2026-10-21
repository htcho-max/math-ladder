import type { MetaMap } from '../meta';

// 초등 5~6학년 (e5a e5b e6a e6b) 단원 메타
export const META: MetaMap = {
  // ───────── 5-1 ─────────
  'e5a-1': {
    pitfalls: [
      '앞에서부터 차례로만 계산해요: $3+4\\times2=14$ → 곱셈·나눗셈을 덧셈·뺄셈보다 먼저 해서 $3+8=11$ 이에요.',
      '괄호 앞의 뺄셈을 잊고 계산해요: $20-(5+3)$ 을 $20-5+3$ 으로 → 괄호 안을 먼저 계산하거나, 괄호를 풀 때 안의 덧셈도 빼기로 바꿔요.',
      '곱셈과 나눗셈이 섞였는데 곱셈부터 해요: $24\\div4\\times2=3$ → 곱셈·나눗셈끼리는 앞에서부터 차례로 계산해 $12$ 예요.',
    ],
    cats: { 'add-sub': 'calc', 'mul-div': 'calc', 'four-ops': 'calc', missing: 'calc', word: 'word', 'word-price': 'word', 'hard-paren': 'calc' },
  },
  'e5a-2': {
    pitfalls: [
      '약수를 셀 때 $1$ 과 자기 자신을 빠뜨려요 → $1$ 과 그 수도 약수예요. 곱해서 그 수가 되는 짝을 짝지어 찾으면 빠뜨리지 않아요.',
      '최대공약수와 최소공배수를 헷갈려요 → "똑같이 나누어 줄 수 있는 가장 많은 수"는 최대공약수, "처음으로 다시 만나는 때"는 최소공배수예요.',
      '두 수를 곱한 값을 최소공배수로 써요: $4$ 와 $6$ → $24$ → 공통인 약수를 한 번만 곱해야 해서 최소공배수는 $12$ 예요.',
    ],
    cats: { divisors: 'calc', multiples: 'calc', relation: 'concept', gcd: 'calc', lcm: 'calc', word: 'word', 'word-apply': 'word', 'hard-gcd-lcm': 'word' },
  },
  'e5a-3': {
    pitfalls: [
      '첫 번째 짝만 보고 규칙을 정해요 → 찾은 대응 관계가 표의 모든 짝에 맞는지 꼭 확인해요.',
      '성냥개비 정사각형을 $4\\times(\\text{개수})$ 로 세요 → 붙어 있는 변은 같이 써서, 처음 $4$ 개에 하나 늘 때마다 $3$ 개씩 더해요.',
      '나이 문제에서 두 사람의 나이를 같은 수만큼 곱해요 → 시간이 지나도 두 사람의 나이 차는 항상 같아요.',
    ],
    cats: { 'table-fill': 'calc', 'find-rule': 'concept', pattern: 'concept', 'make-expr': 'word', word: 'word', 'hard-stick-reverse': 'concept' },
  },
  'e5a-4': {
    pitfalls: [
      '분모와 분자에 같은 수를 더해도 크기가 같다고 생각해요 → 분모와 분자에 같은 수를 곱하거나 나누어야 크기가 같은 분수예요.',
      '한 번만 약분하고 멈춰요: $\\frac{12}{18}=\\frac{6}{9}$ → 최대공약수 $6$ 으로 나누어 $\\frac{2}{3}$ 처럼 더는 약분되지 않을 때까지 해요.',
      '분모만 바꾸고 분자는 그대로 둬요: $\\frac{1}{3}=\\frac{1}{6}$ → 분모에 곱한 수를 분자에도 똑같이 곱해 $\\frac{2}{6}$ 이에요.',
    ],
    cats: { equiv: 'calc', reduce: 'calc', 'reduce-choice': 'concept', 'common-den': 'calc', compare: 'calc', 'frac-dec': 'calc', 'word-compare': 'word', 'word-reduce': 'word', 'hard-count-frac': 'concept' },
  },
  'e5a-5': {
    pitfalls: [
      '분모끼리도 더해 버려요: $\\frac{1}{2}+\\frac{1}{3}\\ne\\frac{2}{5}$ → 먼저 통분해서 분모를 같게 만든 뒤 분자만 더해요.',
      '대분수 뺄셈에서 분자끼리 뺄 수 없으면 거꾸로 빼요 → 자연수에서 $1$ 을 받아내려 분수로 바꾼 뒤 빼요.',
      '"잘못 계산한" 문제에서 잘못된 답에 바로 바른 계산을 해요 → 먼저 거꾸로 계산해 어떤 수를 구한 다음, 바르게 계산해요.',
    ],
    cats: { 'add-proper': 'calc', 'sub-proper': 'calc', 'add-mixed': 'calc', 'sub-mixed': 'calc', word: 'word', missing: 'calc', 'word-two': 'word', 'hard-card-mixed': 'calc' },
  },
  'e5a-6': {
    pitfalls: [
      '삼각형 넓이에서 $\\div2$ 를 잊거나, 평행사변형에도 $\\div2$ 를 해요 → 평행사변형은 밑변×높이, 삼각형은 그 절반이에요.',
      '높이 대신 비스듬한 옆변의 길이를 곱해요 → 높이는 밑변과 수직으로 잰 길이예요.',
      '$1\\,\\text{m}^2=100\\,\\text{cm}^2$ 로 생각해요 → 가로·세로가 모두 $100$ 배이므로 $1\\,\\text{m}^2=10000\\,\\text{cm}^2$ 예요.',
    ],
    cats: { perimeter: 'calc', 'rect-area': 'calc', 'para-tri': 'calc', 'rhombus-trap': 'calc', 'area-unit': 'calc', 'find-length': 'calc', 'word-area': 'word', 'word-perimeter': 'word', 'hard-overlap': 'calc' },
  },
  // ───────── 5-2 ─────────
  'e5b-1': {
    pitfalls: [
      '"초과·미만"에 경계의 수를 넣어요 → 초과·미만은 그 수를 포함하지 않고, 이상·이하는 포함해요.',
      '버림·올림을 반올림처럼 해요 → 올림은 아랫자리가 $0$ 이 아니면 무조건 올리고, 버림은 무조건 버려요.',
      '"모두 타려면 몇 번"에 버림을 써요: $81\\div30$ → $2$ 번 → 남는 학생도 타야 하니 올림해서 $3$ 번이에요.',
    ],
    cats: { 'range-count': 'calc', 'range-line': 'concept', round: 'calc', 'round-reverse': 'concept', word: 'word', 'word-range': 'word', 'hard-card-round': 'concept' },
  },
  'e5b-2': {
    pitfalls: [
      '대분수를 그대로 곱해요: $2\\frac{1}{2}\\times3=6\\frac{1}{2}$ → 가분수로 바꾸어 $\\frac{5}{2}\\times3=\\frac{15}{2}$ 처럼 계산해요.',
      '분수×자연수에서 분모에도 자연수를 곱해요 → 분자에만 곱해요. 분모와 분자를 모두 곱하면 크기가 그대로예요.',
      '"남은 것의 $\\frac{1}{3}$"을 전체의 $\\frac{1}{3}$ 로 계산해요 → 무엇의 몇 분의 몇인지, 기준이 되는 양을 먼저 구해요.',
    ],
    cats: { 'frac-x-nat': 'calc', 'nat-x-frac': 'calc', 'frac-x-frac': 'calc', 'mixed-x': 'calc', three: 'calc', word: 'word', 'word-two': 'word', 'hard-card-fmul': 'calc' },
  },
  'e5b-3': {
    pitfalls: [
      '합동인 두 도형에서 위치가 같아 보이는 변을 대응변으로 골라요 → 꼭짓점을 쓴 순서대로 짝을 지어 대응변·대응각을 찾아요.',
      '선대칭도형의 둘레를 구할 때 보이는 변만 더해요 → 대칭축으로 접으면 겹치는 변끼리 길이가 같으니 반대쪽 변도 함께 더해요.',
      '정다각형의 대칭축 수를 꼭짓점 수의 절반으로 세요 → 정$n$각형의 대칭축은 $n$ 개예요.',
    ],
    cats: { 'cong-side': 'concept', 'cong-angle': 'concept', 'line-sym': 'concept', 'point-sym': 'concept', 'sym-kind': 'concept', 'hard-fold': 'concept' },
  },
  'e5b-4': {
    pitfalls: [
      '소수×소수에서 소수점을 한 자리만 옮겨요: $0.2\\times0.2=0.4$ → 두 수의 소수점 아래 자릿수를 더한 만큼, $0.04$ 예요.',
      '곱이 끝이 $0$ 일 때 소수점 위치를 잘못 세요: $0.5\\times0.4$ → $2.0$ 이 아니라 $0.20=0.2$ 예요.',
      '$\\times100$ 할 때 소수점을 왼쪽으로 옮겨요 → $10,100,1000$ 을 곱하면 소수점이 오른쪽으로 $0$ 의 개수만큼 옮겨져요.',
    ],
    cats: { 'dec-x-nat': 'calc', 'nat-x-dec': 'calc', 'dec-x-dec': 'calc', 'point-pos': 'calc', 'use-known': 'concept', word: 'word', 'word-two': 'word', 'hard-card-dmul': 'calc' },
  },
  'e5b-5': {
    pitfalls: [
      '모서리 길이의 합을 보이는 모서리만 세요 → 직육면체는 길이가 같은 모서리가 $4$ 개씩 $3$ 종류, 모두 $12$ 개예요.',
      '전개도에서 바로 옆에 붙은 면을 평행한 면으로 골라요 → 접었을 때 만나지 않는 면, 보통 한 칸 건너뛴 면이 마주 보는 면이에요.',
    ],
    cats: { parts: 'concept', 'edge-sum': 'calc', 'face-relation': 'concept', 'net-opposite': 'concept', 'net-length': 'calc', 'word-wire': 'word', 'word-ribbon': 'word', 'hard-cube-block': 'word' },
  },
  'e5b-6': {
    pitfalls: [
      '평균을 구할 때 자료의 개수 대신 다른 수로 나눠요 → (자료 값의 합) $\\div$ (자료의 개수) 예요. $0$ 인 자료도 개수에 넣어요.',
      '두 모둠 전체 평균을 두 평균의 평균으로 구해요 → 인원이 다르면 각 모둠의 합을 구해 더한 뒤 전체 인원으로 나눠요.',
      '"반드시 일어나는 일"의 가능성을 $\\frac{1}{2}$ 로 써요 → 확실하면 $1$, 불가능하면 $0$, 반반이면 $\\frac{1}{2}$ 이에요.',
    ],
    cats: {
      mean: 'calc',
      missing: 'calc',
      'compare-mean': 'calc',
      'add-member': 'word',
      'possibility-word': 'concept',
      'possibility-num': 'concept',
      'word-mean': 'word',
      'hard-mean-reason': 'word',
    },
  },
  // ───────── 6-1 ─────────
  'e6a-1': {
    pitfalls: [
      '나눗셈의 몫을 분수로 쓸 때 분모·분자를 바꿔요: $3\\div5=\\frac{5}{3}$ → 나누어지는 수가 분자, 나누는 수가 분모라서 $\\frac{3}{5}$ 예요.',
      '분수÷자연수에서 분자와 분모를 모두 나눠요 → $\\times\\frac{1}{(\\text{자연수})}$ 로 바꾸어 분모에 자연수를 곱해요.',
      '대분수를 자연수 부분과 분수 부분으로 따로 나누다 실수해요 → 대분수를 가분수로 바꾼 뒤 나눠요.',
    ],
    cats: { 'nat-div-nat': 'calc', 'frac-div-nat': 'calc', 'mixed-div-nat': 'calc', reverse: 'calc', word: 'word', 'word-two': 'word', 'hard-card-fdivn': 'calc' },
  },
  'e6a-2': {
    pitfalls: [
      '각뿔의 이름을 옆면의 모양으로 정해요 → 각기둥·각뿔의 이름은 밑면의 모양(삼각형, 사각형 …)으로 정해요.',
      '$n$각기둥과 $n$각뿔의 꼭짓점 수를 같게 써요 → $n$각기둥은 $2n$ 개, $n$각뿔은 $n+1$ 개예요.',
      '모서리 길이의 합에서 높이를 한 번만 더해요 → 각기둥은 밑면의 변 수만큼 높이 모서리가 있어요.',
    ],
    cats: { name: 'concept', count: 'concept', truth: 'concept', 'edge-sum': 'calc', net: 'calc', 'word-straw': 'word', 'word-wire': 'word', 'hard-poly-sum': 'concept' },
  },
  'e6a-3': {
    pitfalls: [
      '몫의 소수점을 나누어지는 수보다 앞이나 뒤에 찍어요 → 몫의 소수점은 나누어지는 수의 소수점 바로 위에 찍어요.',
      '몫 중간에 $0$ 을 빠뜨려요: $6.12\\div6=1.2$ → 나눌 수 없는 자리에는 몫에 $0$ 을 써서 $1.02$ 예요.',
      '나누어떨어지지 않으면 나머지를 남기고 멈춰요 → 소수점 아래에 $0$ 을 내려 계속 나눠요.',
    ],
    cats: { basic: 'calc', 'less-one': 'calc', 'add-zero': 'calc', 'nat-div-nat': 'calc', estimate: 'concept', word: 'word', 'word-two': 'word', 'hard-card-decdiv': 'calc' },
  },
  'e6a-4': {
    pitfalls: [
      '기준량과 비교하는 양을 바꿔 써요 → "$\\square$ 에 대한 $\\triangle$ 의 비"는 $\\triangle:\\square$, 기준량은 "에 대한" 앞의 $\\square$ 예요.',
      '비율을 백분율로 바꿀 때 $100$ 을 곱하지 않아요: $0.25=0.25\\%$ → $0.25\\times100=25\\%$ 예요.',
      '할인 금액과 할인한 가격을 헷갈려요 → 할인 금액은 원래 가격×할인율, 낸 돈은 원래 가격에서 할인 금액을 뺀 값이에요.',
    ],
    cats: { 'ratio-read': 'concept', 'ratio-value': 'calc', percent: 'calc', 'word-rate': 'word', discount: 'word', 'hard-percent-chain': 'word' },
  },
  'e6a-5': {
    pitfalls: [
      '그림그래프에서 큰 그림과 작은 그림을 같은 값으로 세요 → 그림 하나가 나타내는 수를 먼저 확인하고 그림별로 따로 세요.',
      '띠그래프·원그래프의 백분율을 사람 수로 그대로 읽어요 → (전체 수) $\\times$ (백분율) $\\div100$ 으로 바꿔야 실제 수예요.',
      '백분율의 합이 $100\\%$ 인지 확인하지 않아요 → 가려진 항목은 $100\\%$ 에서 나머지를 빼서 구해요.',
    ],
    cats: { picture: 'calc', 'percent-table': 'calc', band: 'calc', pie: 'calc', 'choose-graph': 'concept', 'word-survey': 'word', 'word-budget': 'word', 'hard-graph-two': 'word' },
  },
  'e6a-6': {
    pitfalls: [
      '겉넓이를 세 면의 넓이만 더해요 → 마주 보는 면이 같으므로 (서로 다른 세 면의 넓이의 합) $\\times2$ 예요.',
      '$1\\,\\text{m}^3=100\\,\\text{cm}^3$ 또는 $10000\\,\\text{cm}^3$ 로 생각해요 → 가로·세로·높이가 모두 $100$ 배라서 $1000000\\,\\text{cm}^3$ 예요.',
      '정육면체 겉넓이를 한 모서리×$6$ 으로 해요 → 한 면의 넓이(한 모서리×한 모서리)에 $6$ 을 곱해요.',
    ],
    cats: { volume: 'calc', cube: 'calc', surface: 'calc', unit: 'calc', reverse: 'calc', 'word-volume': 'word', 'word-surface': 'word', 'hard-stack-cube': 'calc' },
  },
  // ───────── 6-2 ─────────
  'e6b-1': {
    pitfalls: [
      '나누는 분수 대신 나누어지는 분수를 뒤집어요 → $\\div\\frac{b}{a}$ 를 $\\times\\frac{a}{b}$ 로, 뒤의 분수만 뒤집어요.',
      '대분수를 가분수로 바꾸지 않고 뒤집어요 → 대분수는 먼저 가분수로 바꾼 뒤 역수를 곱해요.',
      '몫이 나누어지는 수보다 클 수 없다고 생각해요 → $1$ 보다 작은 수로 나누면 몫이 더 커져요: $4\\div\\frac{1}{3}=12$.',
    ],
    cats: { 'same-den': 'calc', 'diff-den': 'calc', 'nat-div-frac': 'calc', 'by-mult': 'calc', word: 'word', 'word-two': 'word', 'hard-div-range': 'calc' },
  },
  'e6b-2': {
    pitfalls: [
      '나누는 수의 소수점만 옮기고 나누어지는 수는 그대로 둬요 → 두 수의 소수점을 같은 자리 수만큼 함께 오른쪽으로 옮겨요.',
      '나머지의 소수점을 옮긴 뒤 자리로 써요: $22\\div2.6$ 의 나머지를 $12$ 로 → 나머지는 처음 나누어지는 수의 소수점 위치를 따라 $1.2$ 예요.',
      '반올림할 자리까지만 나누고 멈춰요 → 한 자리 더 구한 뒤 그 숫자를 보고 반올림해요.',
    ],
    cats: { 'same-places': 'calc', 'diff-places': 'calc', 'nat-div-dec': 'calc', 'round-quot': 'calc', remainder: 'word', word: 'word', 'hard-wrong-dec': 'calc' },
  },
  'e6b-3': {
    pitfalls: [
      '쌓은 모양 그림에서 보이는 쌓기나무만 세요 → 위에서 본 모양의 칸마다 몇 층인지 적은 뒤 모두 더해요.',
      '앞에서 본 모양을 각 줄의 쌓기나무 수의 합으로 그려요 → 앞에서 보면 각 세로줄에서 가장 높은 층수만 보여요.',
    ],
    cats: { 'top-count': 'concept', 'iso-count': 'concept', 'view-heights': 'concept', 'more-needed': 'concept', 'hard-views-count': 'concept' },
  },
  'e6b-4': {
    pitfalls: [
      '비의 앞과 뒤에 같은 수를 더해도 비율이 같다고 생각해요 → 같은 수를 곱하거나 나누어야 비율이 같아요.',
      '비례식에서 외항끼리, 내항끼리 곱한 값을 맞추지 않아요 → (외항의 곱) $=$ (내항의 곱) 으로 $\\square$ 를 구해요.',
      '비례배분에서 전체를 비의 한 항으로 나눠요: $3:1$ → $\\times\\frac{3}{1}$ → 전체에 $\\frac{3}{3+1}$ 처럼 비의 합을 분모로 곱해요.',
    ],
    cats: { 'ratio-prop': 'concept', simplify: 'calc', proportion: 'calc', 'word-prop': 'word', distribute: 'word', 'hard-chain-ratio': 'word' },
  },
  'e6b-5': {
    pitfalls: [
      '원주를 반지름×원주율로 구해요 → 원주는 지름×원주율, 즉 반지름×$2$×원주율이에요.',
      '원의 넓이에 지름을 두 번 곱해요 → 넓이는 반지름×반지름×원주율이에요.',
      '반원의 둘레에서 지름을 빼먹어요 → 반원의 둘레는 (원주의 절반) $+$ (지름) 이에요.',
    ],
    cats: { circumference: 'calc', 'reverse-c': 'calc', area: 'calc', shaded: 'calc', 'pi-ratio': 'concept', 'word-wheel': 'word', 'word-area': 'word', 'hard-track': 'calc' },
  },
  'e6b-6': {
    pitfalls: [
      '원기둥 전개도의 옆면 가로를 지름으로 써요 → 옆면은 밑면 둘레를 감싸므로 가로는 밑면의 원주예요.',
      '원뿔의 모선과 높이를 헷갈려요 → 높이는 꼭짓점에서 밑면에 수직으로 내린 길이, 모선은 꼭짓점과 밑면 둘레를 잇는 선분이에요.',
      '원뿔을 앞에서 본 삼각형의 밑변을 반지름으로 써요 → 앞에서 본 모양의 밑변은 밑면의 지름이에요.',
    ],
    cats: { 'cyl-net': 'calc', 'cone-parts': 'concept', rotate: 'concept', sphere: 'concept', compare: 'concept', 'word-roller': 'word', 'word-label': 'word', 'hard-rotate-offset': 'concept' },
  },
};
