import type { MetaMap } from '../meta';

// 중1~중2 (m1a m1b m2a) 단원 메타
export const META: MetaMap = {
  // ───────── 중1-1 ─────────
  'm1a-1': {
    pitfalls: [
      '$1$ 을 소수로, $2$ 를 합성수로 착각해요 → $1$ 은 소수도 합성수도 아니고, $2$ 는 유일한 짝수 소수예요.',
      '소인수분해를 $12=3\\times4$ 처럼 멈춰요 → 모든 인수가 소수가 될 때까지 나눠 $2^2\\times3$ 으로 써요.',
      '약수의 개수를 지수끼리 곱해요: $2^2\\times3$ → $2\\times1$ → 각 지수에 $1$ 을 더해 곱해서 $(2+1)(1+1)=6$ 개예요.',
    ],
    cats: { prime: 'concept', factorize: 'calc', 'divisor-count': 'calc', 'gcd-lcm': 'calc' },
  },
  'm1a-2': {
    pitfalls: [
      '음수끼리 절댓값이 큰 쪽을 더 크다고 해요: $-5>-2$ → 음수는 절댓값이 클수록 작아서 $-5<-2$ 예요.',
      '$-3^2$ 과 $(-3)^2$ 을 같게 계산해요 → $-3^2=-9$, $(-3)^2=9$ 예요. 괄호가 없으면 $3$ 만 제곱해요.',
      '빼기를 더하기로 바꿀 때 부호를 그대로 둬요: $5-(-3)=2$ → 빼는 수의 부호를 바꿔 $5+(+3)=8$ 이에요.',
    ],
    cats: { order: 'concept', 'count-int': 'concept', 'add-sub': 'calc', 'mul-div': 'calc', mixed: 'calc', word: 'word' },
  },
  'm1a-3': {
    pitfalls: [
      '분배법칙에서 뒤 항에 곱하기를 빠뜨려요: $-2(x-3)=-2x-6$ → 모든 항에 부호까지 곱해 $-2x+6$ 이에요.',
      '분수 꼴 식을 뺄 때 분자 전체에 빼기를 적용하지 않아요 → $-\\frac{x-2}{3}=\\frac{-x+2}{3}$ 처럼 분자를 괄호로 묶어 계산해요.',
      '음수를 대입할 때 괄호를 빠뜨려요: $x=-2$ 일 때 $x^2=-4$ → $(-2)^2=4$ 처럼 괄호를 씌워 대입해요.',
    ],
    cats: { 'omit-sign': 'concept', 'expr-value': 'calc', terms: 'concept', simplify: 'calc', 'word-expr': 'word' },
  },
  'm1a-4': {
    pitfalls: [
      '이항할 때 부호를 바꾸지 않아요: $x+3=7 \\Rightarrow x=7+3$ → 등호 반대편으로 옮기면 부호가 바뀌어 $x=7-3$ 이에요.',
      '계수가 분수인 방정식에서 한쪽 항에만 분모의 최소공배수를 곱해요 → 양변의 모든 항(상수항 포함)에 곱해요.',
      '거리·속력 문제에서 단위를 맞추지 않아요: 분과 시속을 섞어 써요 → 시간은 시간(h), 거리는 km 처럼 단위를 통일해요.',
    ],
    cats: { identity: 'concept', solve: 'calc', param: 'calc', 'word-number': 'word', 'word-speed': 'word' },
  },
  'm1a-5': {
    pitfalls: [
      '점의 좌표를 $(y, x)$ 순서로 써요 → 좌표는 항상 ($x$좌표, $y$좌표) 순서예요.',
      '축 위의 점도 어느 사분면에 속한다고 해요 → $x$축·$y$축 위의 점은 어느 사분면에도 속하지 않아요.',
      '반비례를 "$x$ 가 커지면 $y$ 가 작아지는 관계"로만 판단해요 → $xy$ 가 일정할 때, 즉 $y=\\frac{a}{x}$ 꼴일 때만 반비례예요.',
    ],
    cats: { coord: 'concept', quadrant: 'concept', direct: 'calc', inverse: 'calc', 'prop-word': 'word' },
  },
  // ───────── 중1-2 ─────────
  'm1b-1': {
    pitfalls: [
      '맞꼭지각과 동위각을 헷갈려요 → 맞꼭지각은 두 직선이 만날 때 마주 보는 각으로 항상 같고, 동위각·엇각은 평행할 때만 같아요.',
      '꼬인 위치를 평면에서도 찾아요 → 꼬인 위치는 공간에서 만나지도 평행하지도 않은 두 직선이에요.',
      '평행선 사이에 꺾인 선이 있을 때 각을 그냥 더해요 → 꺾인 점을 지나는 평행선을 하나 더 그어 엇각으로 나눠 구해요.',
    ],
    cats: { 'count-lines': 'concept', midpoint: 'calc', 'vertical-angle': 'calc', parallel: 'calc', position: 'concept' },
  },
  'm1b-2': {
    pitfalls: [
      '가장 긴 변을 확인하지 않고 아무 두 변의 합만 봐요 → (가장 긴 변) $<$ (나머지 두 변의 합) 이면 삼각형이 돼요.',
      '두 변과 한 각만 주어지면 항상 하나로 정해진다고 해요 → 그 각이 두 변의 끼인각일 때만 하나로 정해져요.',
      '세 각이 같으면 합동이라고 해요 → 세 각이 같아도 크기가 다를 수 있어요. 합동 조건은 SSS, SAS, ASA 뿐이에요.',
    ],
    cats: {
      construct: 'concept',
      'triangle-sides': 'concept',
      determined: 'concept',
      congruent: 'concept',
      'congruence-condition': 'concept',
    },
  },
  'm1b-3': {
    pitfalls: [
      '$n$각형의 대각선 수를 $n(n-3)$ 으로 해요 → 한 대각선을 양 끝에서 두 번 세었으니 $\\frac{n(n-3)}{2}$ 이에요.',
      '외각의 합도 $n$ 에 따라 커진다고 생각해요 → 다각형의 외각의 합은 항상 $360^\\circ$ 예요.',
      '부채꼴의 넓이에 $\\pi r^2$ 대신 $2\\pi r$ 을 써요 → 넓이는 $\\pi r^2\\times\\frac{x}{360}$, 호의 길이는 $2\\pi r\\times\\frac{x}{360}$ 이에요.',
    ],
    cats: { diagonals: 'calc', 'angle-sum': 'calc', 'triangle-angle': 'calc', 'polygon-angle': 'calc', sector: 'calc' },
  },
  'm1b-4': {
    pitfalls: [
      '뿔의 부피에 $\\frac{1}{3}$ 을 곱하지 않아요 → (뿔의 부피) $=\\frac{1}{3}\\times$ (밑넓이) $\\times$ (높이) 예요.',
      '구의 겉넓이와 부피 공식을 섞어 써요 → 겉넓이는 $4\\pi r^2$, 부피는 $\\frac{4}{3}\\pi r^3$ 이에요.',
      '각뿔의 겉넓이에서 옆면 삼각형의 높이 대신 각뿔의 높이를 써요 → 옆면은 그 삼각형 자체의 높이로 넓이를 구해요.',
    ],
    cats: { polyhedron: 'concept', regular: 'concept', rotation: 'concept', prism: 'calc', 'cone-sphere': 'calc' },
  },
  'm1b-5': {
    pitfalls: [
      '자료를 크기순으로 늘어놓지 않고 가운데 값을 중앙값으로 골라요 → 먼저 작은 값부터 정렬한 뒤 가운데 값을 찾아요.',
      '자료 개수가 짝수일 때 가운데 두 값 중 하나를 골라요 → 가운데 두 값의 평균이 중앙값이에요.',
      '상대도수를 백분율로 착각해 합이 $100$ 이라고 해요 → 상대도수는 (도수) $\\div$ (전체 도수) 이고 합은 $1$ 이에요.',
    ],
    cats: { 'median-mode': 'calc', mean: 'calc', 'stem-leaf': 'calc', 'freq-table': 'calc', histogram: 'calc', relative: 'calc' },
  },
  // ───────── 중2-1 ─────────
  'm2a-1': {
    pitfalls: [
      '기약분수로 만들기 전에 분모만 보고 유한소수 여부를 판단해요 → 먼저 약분한 뒤 분모의 소인수가 $2$ 나 $5$ 뿐인지 봐요.',
      '$0.1\\dot{2}$ 를 $\\frac{12}{99}$ 로 바꿔요 → 순환하지 않는 부분이 있으면 $\\frac{12-1}{90}=\\frac{11}{90}$ 이에요.',
      '순환소수는 유리수가 아니라고 생각해요 → 순환소수는 모두 분수로 나타낼 수 있으므로 유리수예요.',
    ],
    cats: { finite: 'concept', notation: 'concept', 'to-fraction': 'calc', 'rep-calc': 'calc', classify: 'concept' },
  },
  'm2a-2': {
    pitfalls: [
      '거듭제곱의 거듭제곱에서 지수를 더해요: $(a^2)^3=a^5$ → 지수끼리 곱해서 $a^6$ 이에요.',
      '같은 밑의 곱에서 지수를 곱해요: $a^2\\times a^3=a^6$ → 지수끼리 더해서 $a^5$ 예요.',
      '괄호 앞이 빼기일 때 뒤 항의 부호를 안 바꿔요: $-(3x-2y)=-3x-2y$ → 모든 항의 부호를 바꿔 $-3x+2y$ 예요.',
    ],
    cats: { 'exp-law': 'calc', mono: 'calc', 'poly-addsub': 'calc', 'mono-poly': 'calc', substitute: 'calc' },
  },
  'm2a-3': {
    pitfalls: [
      '양변을 음수로 나눌 때 부등호 방향을 그대로 둬요: $-2x<6 \\Rightarrow x<-3$ → 음수로 곱하거나 나누면 방향이 바뀌어 $x>-3$ 이에요.',
      '수직선에서 $\\le$ 와 $<$ 를 같은 점으로 그려요 → 등호가 있으면 색칠한 점(●), 없으면 빈 점(○)이에요.',
      '"최대 몇 개"를 구할 때 해를 반올림해요 → 부등식을 만족하는 가장 큰 자연수를 골라야 해요.',
    ],
    cats: { property: 'concept', solve: 'calc', 'number-line': 'concept', 'integer-sol': 'calc', word: 'word' },
  },
  'm2a-4': {
    pitfalls: [
      '가감법에서 한 식에만 수를 곱하고 다른 항에는 안 곱해요 → 곱할 때는 그 식의 모든 항(우변 포함)에 곱해요.',
      '한 문자의 값만 구하고 멈춰요 → 구한 값을 한 식에 대입해 나머지 문자도 구하고, 두 식에 모두 맞는지 확인해요.',
      '해가 무수히 많은 경우와 없는 경우를 헷갈려요 → 두 식의 계수비가 상수항까지 같으면 무수히 많고, 상수항만 다르면 해가 없어요.',
    ],
    cats: { solution: 'calc', solve: 'calc', param: 'calc', special: 'concept', word: 'word' },
  },
  'm2a-5': {
    pitfalls: [
      '기울기를 $\\frac{x\\text{의 증가량}}{y\\text{의 증가량}}$ 으로 계산해요 → 기울기는 $\\frac{y\\text{의 증가량}}{x\\text{의 증가량}}$ 이에요.',
      '$x$절편과 $y$절편을 바꿔 구해요 → $x$절편은 $y=0$ 을 대입한 $x$ 값, $y$절편은 $x=0$ 을 대입한 $y$ 값이에요.',
      '$y$축 방향으로 평행이동할 때 기울기도 바꿔요 → 평행이동하면 기울기는 그대로이고 $y$절편만 바뀌어요.',
    ],
    cats: { value: 'calc', intercept: 'calc', slope: 'calc', translate: 'calc', graph: 'concept', equation: 'calc' },
  },
  'm2a-6': {
    pitfalls: [
      '$x=3$ 의 그래프를 $x$축에 평행한 직선으로 그려요 → $x=3$ 은 $y$축에 평행한(세로) 직선, $y=3$ 은 $x$축에 평행한 직선이에요.',
      '일차방정식을 $y=$ 꼴로 바꿀 때 부호를 놓쳐요: $2x-y=4 \\Rightarrow y=2x+4$ → 이항하면 $y=2x-4$ 예요.',
      '기울기가 같으면 무조건 평행이라고 해요 → 기울기와 $y$절편이 모두 같으면 일치(해가 무수히 많음), 절편만 다르면 평행이에요.',
    ],
    cats: { 'eq-graph': 'calc', 'axis-line': 'concept', intersect: 'calc', position: 'concept', area: 'calc', apply: 'word' },
  },
};
