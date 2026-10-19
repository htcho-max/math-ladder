import type { MetaMap } from '../meta';

// 그룹 m3h1: 중2 2학기(m2b), 중3(m3a, m3b), 고1 공통수학1(hc1)
export const META: MetaMap = {
  // ───────── m2b ─────────
  'm2b-1': {
    pitfalls: [
      '외심과 내심을 헷갈려요 → 외심은 세 변의 수직이등분선의 교점(꼭짓점까지 거리가 같음), 내심은 세 내각의 이등분선의 교점(변까지 거리가 같음)이에요.',
      '내심에서 $\\angle BIC=90^\\circ+\\angle A$ 로 써요 → $\\angle A$ 의 절반을 더해야 해요: $\\angle BIC=90^\\circ+\\frac{1}{2}\\angle A$.',
      '직각삼각형 합동에서 빗변이 아닌 변으로 RHS 를 적용해요 → R(직각)과 H(빗변)가 반드시 같아야 RHS·RHA 합동이에요.',
    ],
    cats: {
      isosceles: 'calc',
      'right-congruence': 'calc',
      circumcenter: 'calc',
      incenter: 'calc',
      'centers-concept': 'concept',
    },
  },
  'm2b-2': {
    pitfalls: [
      '평행사변형에서 이웃한 두 각이 같다고 생각해요 → 대각끼리 같고, 이웃한 두 각의 합이 $180^\\circ$ 예요.',
      '대각선의 길이와 대각선 절반($\\overline{OA}$)을 혼동해요 → 평행사변형의 대각선은 서로를 이등분하므로 $\\overline{AC}=2\\overline{OA}$ 예요.',
      '한 쌍의 대변이 평행하고 다른 한 쌍의 대변이 같으면 평행사변형이라 해요 → 한 쌍의 대변이 평행하면서 그 대변의 길이가 같아야 해요.',
    ],
    cats: {
      'para-angle': 'calc',
      'para-diag': 'calc',
      'para-cond': 'concept',
      'special-quad': 'calc',
      'area-parallel': 'calc',
    },
  },
  'm2b-3': {
    pitfalls: [
      '닮음비 $m:n$ 을 넓이·부피에도 그대로 써요 → 넓이의 비는 $m^2:n^2$, 부피의 비는 $m^3:n^3$ 이에요.',
      '$DE\\parallel BC$ 일 때 $AD:DB=DE:BC$ 로 써요 → 밑변의 비는 $DE:BC=AD:AB$ 처럼 꼭짓점에서부터 잰 전체 변과 비교해요.',
      '무게중심이 중선을 $1:2$ 로 나눈다고 거꾸로 써요 → 꼭짓점 쪽이 길어서 $\\overline{AG}:\\overline{GD}=2:1$ 이에요.',
    ],
    cats: {
      'sim-ratio': 'calc',
      'sim-triangle': 'calc',
      'parallel-ratio': 'calc',
      midpoint: 'calc',
      centroid: 'calc',
    },
  },
  'm2b-4': {
    pitfalls: [
      '빗변이 아닌 변을 구할 때도 두 변의 제곱을 더해요 → 빗변 $c$ 가 주어지면 $a^2=c^2-b^2$ 처럼 빼야 해요.',
      '직각삼각형 판별에서 아무 두 변의 제곱의 합을 비교해요 → 가장 긴 변의 제곱과 나머지 두 변의 제곱의 합을 비교해요.',
      '$\\sqrt{a^2+b^2}=a+b$ 로 계산해요 → 제곱의 합을 먼저 구한 뒤 근호를 씌워요: $\\sqrt{3^2+4^2}=5\\ne7$.',
    ],
    cats: {
      'find-side': 'calc',
      'right-check': 'concept',
      'squares-area': 'calc',
      applied: 'calc',
      'sqrt-length': 'calc',
    },
  },
  'm2b-5': {
    pitfalls: [
      '순서가 있는 뽑기(회장·부회장)와 없는 뽑기(대표 2명)를 같은 방법으로 세요 → 대표처럼 순서가 없으면 순서 있게 센 수를 $2$ 로 나눠요.',
      '"적어도 하나" 를 경우마다 하나씩 세다가 빠뜨려요 → $1-(\\text{모두 아닐 확률})$ 로 구하면 간단하고 정확해요.',
      '꺼낸 것을 다시 넣지 않는데도 두 번째 확률의 분모를 그대로 둬요 → 하나를 꺼냈으면 전체 개수와 해당 개수가 하나씩 줄어요.',
    ],
    cats: {
      count: 'word',
      'basic-prob': 'word',
      complement: 'word',
      'and-or': 'word',
    },
  },

  // ───────── m3a ─────────
  'm3a-1': {
    pitfalls: [
      '$a$ 의 제곱근과 $\\sqrt{a}$ 를 같다고 해요 → $16$ 의 제곱근은 $\\pm4$ 두 개이고, $\\sqrt{16}=4$ 는 양의 제곱근 하나예요.',
      '$\\sqrt{(a-4)^2}=a-4$ 로 바로 벗겨요 → $\\sqrt{A^2}=|A|$ 이므로 $a<4$ 이면 $4-a$ 예요.',
      '근호가 있으면 모두 무리수라고 해요 → $\\sqrt{9}=3$ 처럼 근호를 벗길 수 있으면 유리수예요.',
    ],
    cats: {
      'sqrt-basic': 'calc',
      compare: 'calc',
      irrational: 'concept',
      'natural-sqrt': 'calc',
      'number-line': 'concept',
    },
  },
  'm3a-2': {
    pitfalls: [
      '$\\sqrt{2}+\\sqrt{3}=\\sqrt{5}$ 로 더해요 → 덧셈·뺄셈은 근호 안이 같은 것끼리만 계수를 더해요.',
      '$\\sqrt{a}$ 꼴로 바꿀 때 밖의 수를 제곱하지 않아요 → $3\\sqrt{3}=\\sqrt{3^2\\times3}=\\sqrt{27}$ 이에요.',
      '분모가 $\\sqrt{a}+\\sqrt{b}$ 일 때 $\\sqrt{a}$ 만 곱해요 → 켤레식 $\\sqrt{a}-\\sqrt{b}$ 를 분자·분모에 곱해야 근호가 사라져요.',
    ],
    cats: {
      'mul-div': 'calc',
      simplify: 'calc',
      rationalize: 'calc',
      'add-sub': 'calc',
      mixed: 'calc',
    },
  },
  'm3a-3': {
    pitfalls: [
      '$(a+b)^2=a^2+b^2$ 로 전개해요 → 가운데 항 $2ab$ 를 빠뜨리지 말아요: $(a+b)^2=a^2+2ab+b^2$.',
      '$3x^2-147$ 을 $(\\sqrt{3}x+\\ldots)$ 처럼 바로 나눠요 → 공통인수 $3$ 을 먼저 묶고 $3(x+7)(x-7)$ 로 끝까지 인수분해해요.',
      '완전제곱식이 되는 $k$ 를 하나만 구해요 → $x^2+kx+100$ 에서 $k=\\pm20$ 처럼 부호가 둘 다 가능해요.',
    ],
    cats: {
      expand: 'calc',
      coef: 'calc',
      factor: 'calc',
      'perfect-square': 'calc',
      'calc-trick': 'calc',
    },
  },
  'm3a-4': {
    pitfalls: [
      '$(x+6)^2=49$ 에서 $x+6=7$ 만 써요 → 제곱근은 $\\pm$ 두 개이므로 $x+6=\\pm7$ 로 근이 두 개예요.',
      '$=0$ 꼴로 정리하지 않고 인수분해해요 → $x(x+5)=2x+4$ 처럼 우변이 $0$ 이 아니면 먼저 이항해서 정리해요.',
      '활용 문제에서 구한 근을 모두 답으로 써요 → 길이·개수처럼 음수가 될 수 없는 근은 조건을 확인해 버려요.',
    ],
    cats: {
      'factor-solve': 'calc',
      'sqrt-solve': 'calc',
      formula: 'calc',
      discriminant: 'calc',
      word: 'word',
    },
  },
  'm3a-5': {
    pitfalls: [
      '$y=a(x-p)^2+q$ 의 꼭짓점을 $(-p,\\,q)$ 로 읽어요 → 괄호 안 부호를 바꾸기 전 값 그대로 $(p,\\,q)$ 예요.',
      '$x$ 축 방향으로 $5$ 만큼 이동할 때 $x$ 대신 $x+5$ 를 넣어요 → $x$ 대신 $x-5$ 를 넣어야 오른쪽으로 이동해요.',
      '일반형에서 꼭짓점을 구할 때 $a$ 를 묶지 않고 완전제곱식을 만들어요 → $x^2$ 의 계수로 먼저 묶은 뒤 완전제곱식으로 바꿔요.',
    ],
    cats: {
      vertex: 'calc',
      'graph-choice': 'concept',
      translate: 'calc',
      'find-eq': 'calc',
      property: 'concept',
    },
  },

  // ───────── m3b ─────────
  'm3b-1': {
    pitfalls: [
      '기준각을 바꾸지 않고 $\\sin$ 의 분자를 정해요 → 기준각의 대변이 높이예요. $\\sin A=\\frac{\\overline{BC}}{\\overline{AB}}$, $\\sin B=\\frac{\\overline{AC}}{\\overline{AB}}$ 예요.',
      '$\\sin30^\\circ$ 와 $\\cos30^\\circ$ 값을 바꿔 써요 → $\\sin30^\\circ=\\frac{1}{2}$, $\\cos30^\\circ=\\frac{\\sqrt{3}}{2}$ 이에요. 직각삼각형을 그려 확인해요.',
      '둔각 삼각형의 넓이에서 $\\sin150^\\circ$ 를 그대로 못 써요 → $\\frac{1}{2}ab\\sin(180^\\circ-C)$ 로 바꿔 $\\sin30^\\circ$ 를 써요.',
    ],
    cats: {
      'ratio-from-sides': 'calc',
      'special-values': 'calc',
      'side-length': 'calc',
      area: 'calc',
      'trig-table': 'calc',
    },
  },
  'm3b-2': {
    pitfalls: [
      '원주각을 중심각과 같다고 해요 → 원주각은 같은 호에 대한 중심각의 $\\frac{1}{2}$ 이에요.',
      '현의 길이를 구할 때 반쪽 길이를 답으로 써요 → 중심에서 내린 수선은 현을 이등분하므로 구한 값을 $2$ 배 해요.',
      '접선과 현이 이루는 각을 엉뚱한 원주각과 같다고 해요 → 그 각의 안쪽에 있는 호에 대한 원주각과 같아요.',
    ],
    cats: {
      chord: 'calc',
      tangent: 'calc',
      inscribed: 'calc',
      'tangent-chord': 'calc',
      'arc-ratio': 'calc',
    },
  },
  'm3b-3': {
    pitfalls: [
      '분산을 구할 때 편차를 그대로 더해 평균을 내요 → 편차의 합은 항상 $0$ 이에요. 편차를 제곱해서 더한 뒤 개수로 나눠요.',
      '표준편차를 분산과 같은 값으로 답해요 → 표준편차는 분산의 양의 제곱근이에요.',
      '변량을 $3x+5$ 로 바꾸면 분산도 $3\\times9+5$ 라고 해요 → 더한 수는 흩어짐에 영향이 없고 분산은 $3^2$ 배가 돼요.',
    ],
    cats: {
      deviation: 'calc',
      variance: 'calc',
      'std-dev': 'calc',
      spread: 'concept',
      boxplot: 'calc',
      scatter: 'concept',
    },
  },

  // ───────── hc1 ─────────
  'hc1-1': {
    pitfalls: [
      '$A-B$ 에서 $B$ 의 첫 항만 부호를 바꿔요 → 괄호를 풀 때 $B$ 의 모든 항의 부호를 바꿔야 해요.',
      '$x^2+y^2=(x+y)^2$ 로 계산해요 → $x^2+y^2=(x+y)^2-2xy$ 처럼 곱의 항을 빼줘야 해요.',
      '다항식 나눗셈에서 빠진 차수 자리를 비워 두지 않아요 → 없는 항은 $0x^2$ 처럼 자리를 맞춰 써야 계산이 어긋나지 않아요.',
    ],
    cats: {
      'add-sub': 'calc',
      'mul-coef': 'calc',
      'formula-value': 'calc',
      division: 'calc',
      expand3: 'calc',
    },
  },
  'hc1-2': {
    pitfalls: [
      '$3x-1$ 로 나눈 나머지를 $P(1)$ 이나 $P(3)$ 으로 구해요 → $3x-1=0$ 이 되는 $x=\\frac{1}{3}$ 을 넣어 $P\\left(\\frac{1}{3}\\right)$ 이에요.',
      '조립제법에서 $x+2$ 로 나누는데 $2$ 를 써요 → $x+2=0$ 의 근인 $-2$ 를 써요. $2x-1$ 이면 몫을 마지막에 $2$ 로 나눠요.',
      '이차식으로 나눈 나머지를 상수로 둬요 → 나머지는 나누는 식보다 차수가 낮으므로 $ax+b$ 로 놓아요.',
    ],
    cats: {
      identity: 'calc',
      remainder: 'calc',
      'factor-thm': 'calc',
      synthetic: 'calc',
      'coef-sum': 'calc',
    },
  },
  'hc1-3': {
    pitfalls: [
      '$a^3+b^3=(a+b)(a^2+2ab+b^2)$ 로 써요 → $a^3+b^3=(a+b)(a^2-ab+b^2)$ 처럼 가운데 항은 $-ab$ 이고 계수 $2$ 가 없어요.',
      '치환해서 인수분해한 뒤 원래 식으로 되돌리지 않거나 더 쪼갤 수 있는데 멈춰요 → 다시 대입하고 각 인수를 끝까지 인수분해해요.',
      '삼차식에서 대입할 값을 아무렇게나 고르다 지쳐요 → $\\pm\\frac{\\text{상수항의 약수}}{\\text{최고차항 계수의 약수}}$ 중에서 $P(a)=0$ 인 값을 찾아요.',
    ],
    cats: {
      cube: 'calc',
      substitution: 'calc',
      'factor-cubic': 'calc',
      'multi-var': 'calc',
      evaluate: 'calc',
    },
  },
  'hc1-4': {
    pitfalls: [
      '$i^2=1$ 로 계산해요 → $i^2=-1$ 이고, $i^4=1$ 이므로 거듭제곱은 지수를 $4$ 로 나눈 나머지로 정해요.',
      '복소수 나눗셈에서 분모의 실수부만 곱해요 → 분모의 켤레복소수를 분자·분모에 곱해 분모를 실수로 만들어요.',
      '근과 계수의 관계에서 $\\alpha+\\beta=\\frac{b}{a}$ 로 써요 → $\\alpha+\\beta=-\\frac{b}{a}$, $\\alpha\\beta=\\frac{c}{a}$ 처럼 합에는 부호가 붙어요.',
    ],
    cats: {
      'complex-arith': 'calc',
      'complex-eq': 'calc',
      discriminant: 'calc',
      vieta: 'calc',
      'make-eq': 'calc',
    },
  },
  'hc1-5': {
    pitfalls: [
      '제한된 범위의 최대·최소를 꼭짓점에서만 구해요 → 꼭짓점이 범위 밖이면 양 끝값을 비교하고, 안이면 꼭짓점과 끝값을 함께 봐요.',
      '직선과 접할 조건에서 이차함수의 판별식만 써요 → 두 식을 같게 놓아 만든 이차방정식의 판별식이 $D=0$ 이어야 해요.',
      '활용 문제에서 변수의 범위를 무시해요 → 길이·가격처럼 변수가 가질 수 있는 범위 안에서 최댓값을 확인해요.',
    ],
    cats: {
      'x-axis': 'calc',
      line: 'calc',
      'max-min': 'calc',
      applied: 'word',
      intercepts: 'calc',
    },
  },
  'hc1-6': {
    pitfalls: [
      '이차부등식 $x^2+2x-8\\ge0$ 의 해를 두 근 사이로 써요 → $a>0$ 일 때 $\\ge0$ 이면 두 근의 바깥쪽 $x\\le-4$ 또는 $x\\ge2$ 예요.',
      '부등식 양변에 음수를 곱하고 부등호 방향을 그대로 둬요 → 음수를 곱하거나 나누면 부등호 방향을 바꿔요.',
      '$\\omega^3=1$ 만 쓰고 $\\omega^2+\\omega+1=0$ 을 잊어요 → 지수는 $3$ 으로 나눈 나머지로 줄이고, 남은 식은 $\\omega^2+\\omega=-1$ 로 정리해요.',
    ],
    cats: {
      'higher-eq': 'calc',
      'system-quad': 'calc',
      'linear-ineq': 'calc',
      'quad-ineq': 'calc',
      omega: 'calc',
    },
  },
  'hc1-7': {
    pitfalls: [
      '순서가 없는 선택에 순열 ${}_n\\mathrm{P}_r$ 을 써요 → 대표 뽑기처럼 순서가 상관없으면 조합 ${}_n\\mathrm{C}_r$ 을 써요.',
      '숫자 카드로 자연수를 만들 때 $0$ 을 맨 앞자리에 놓는 경우까지 세요 → 맨 앞자리에는 $0$ 이 올 수 없으니 먼저 따로 정해요.',
      '이웃하는 경우를 셀 때 묶음 안의 자리 바꿈을 빠뜨려요 → 묶어서 한 줄로 세운 수에 묶음 안에서 바꾸는 수를 곱해요.',
    ],
    cats: {
      'sum-product': 'word',
      permutation: 'word',
      combination: 'word',
      digits: 'word',
      'npr-eq': 'calc',
    },
  },
  'hc1-8': {
    pitfalls: [
      '행렬의 곱을 같은 자리끼리 곱해요 → $AB$ 의 $(i,j)$ 성분은 $A$ 의 $i$ 행과 $B$ 의 $j$ 열을 차례로 곱해 더한 값이에요.',
      '$(i,j)$ 성분에서 $i$ 를 열, $j$ 를 행으로 읽어요 → $i$ 는 행(가로줄), $j$ 는 열(세로줄) 번호예요.',
      '$AB=BA$ 라고 생각해 순서를 바꿔 계산해요 → 행렬의 곱셈은 교환법칙이 성립하지 않으므로 순서를 지켜요.',
    ],
    cats: {
      element: 'calc',
      'add-scalar': 'calc',
      equality: 'calc',
      multiply: 'calc',
      power: 'calc',
    },
  },
};
