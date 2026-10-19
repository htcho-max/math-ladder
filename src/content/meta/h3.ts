import type { MetaMap } from '../meta';

export const META: MetaMap = {
  // ───────── 확률과 통계
  'pst-1': {
    pitfalls: [
      '원순열을 일렬로 세우듯 $n!$ 로 셉니다 → 회전하면 같은 배열이 $n$ 개씩 겹치므로 $(n-1)!$ 이에요.',
      '중복조합 ${}_{n}\\mathrm{H}_{r}$ 를 ${}_{n}\\mathrm{C}_{r}$ 로 계산해요 → ${}_{n}\\mathrm{H}_{r}={}_{n+r-1}\\mathrm{C}_{r}$ 로 바꿔서 계산해요.',
      '양의 정수해 개수를 음이 아닌 정수해처럼 바로 ${}_{n}\\mathrm{H}_{r}$ 로 세요 → 각 변수에 $1$ 씩 먼저 나눠 준 뒤 남은 수로 중복조합을 써요.',
    ],
    cats: {
      circular: 'word',
      'rep-perm': 'calc',
      'same-perm': 'calc',
      'rep-comb': 'calc',
      'symbol-value': 'calc',
    },
  },
  'pst-2': {
    pitfalls: [
      '$(x^{2}-\\frac{3}{x})^{6}$ 의 일반항에서 $-3$ 의 부호나 거듭제곱을 빠뜨려요 → ${}_{6}\\mathrm{C}_{r}(x^{2})^{6-r}(-3)^{r}x^{-r}$ 처럼 계수까지 통째로 거듭제곱해요.',
      '상수항을 찾을 때 $x$ 의 지수를 $0$ 으로 놓지 않고 $r=0$ 을 넣어요 → 일반항의 $x$ 지수를 $r$ 로 나타내 $0$ 이 되는 $r$ 을 구해요.',
      '이항계수의 합 ${}_{n}\\mathrm{C}_{0}+\\cdots+{}_{n}\\mathrm{C}_{n}$ 을 $n^{2}$ 등으로 써요 → $(1+1)^{n}$ 을 전개한 것이라 $2^{n}$ 이에요.',
    ],
    cats: {
      coef: 'calc',
      'coef-product': 'calc',
      'binom-sum': 'calc',
      pascal: 'concept',
      'find-param': 'calc',
    },
  },
  'pst-3': {
    pitfalls: [
      '두 주사위의 눈의 합이 $7$ 인 경우를 $(1,6)$, $(2,5)$, $(3,4)$ 세 가지로 셉니다 → 서로 다른 주사위라 순서쌍으로 세면 6가지예요.',
      '\'적어도 하나\' 를 경우를 나눠 더하다가 빠뜨려요 → 여사건 \'하나도 없음\' 의 확률을 $1$ 에서 빼는 것이 안전해요.',
      '$P(A\\cup B)=P(A)+P(B)$ 로 계산해요 → 배반이 아니면 $P(A\\cap B)$ 를 한 번 빼야 해요.',
    ],
    cats: {
      dice: 'calc',
      draw: 'calc',
      'add-rule': 'calc',
      complement: 'calc',
      arrange: 'word',
    },
  },
  'pst-4': {
    pitfalls: [
      '$P(B\\mid A)$ 를 $\\frac{P(A\\cap B)}{P(B)}$ 로 나눠요 → 조건인 사건 $A$ 로 나눠 $\\frac{P(A\\cap B)}{P(A)}$ 예요.',
      '배반사건과 독립사건을 같은 뜻으로 써요 → 배반은 $P(A\\cap B)=0$, 독립은 $P(A\\cap B)=P(A)P(B)$ 예요.',
      '독립시행 확률에서 ${}_{n}\\mathrm{C}_{r}$ 을 빠뜨려 $p^{r}(1-p)^{n-r}$ 만 써요 → 성공하는 $r$ 번의 위치를 고르는 경우 ${}_{n}\\mathrm{C}_{r}$ 을 곱해요.',
    ],
    cats: {
      'cond-table': 'word',
      'cond-formula': 'calc',
      multiply: 'calc',
      independent: 'calc',
      bernoulli: 'calc',
    },
  },
  'pst-5': {
    pitfalls: [
      '$V(aX+b)=aV(X)+b$ 로 계산해요 → 분산은 $b$ 에 영향을 받지 않고 $a^{2}$ 배가 되어 $V(aX+b)=a^{2}V(X)$ 예요.',
      '분산을 $E(X^{2})$ 로 끝내요 → $V(X)=E(X^{2})-\\{E(X)\\}^{2}$ 로 평균의 제곱을 빼야 해요.',
      '확률질량함수의 미정계수를 구할 때 확률의 합이 $1$ 이라는 조건을 쓰지 않아요 → 모든 $P(X=x)$ 를 더해 $1$ 로 놓아요.',
    ],
    cats: {
      'pmf-unknown': 'calc',
      'expect-var': 'calc',
      linear: 'calc',
      'binom-mean': 'calc',
      'binom-prob': 'calc',
    },
  },
  'pst-6': {
    pitfalls: [
      '$N(170, 4^{2})$ 을 표준화할 때 $Z=\\frac{X-170}{16}$ 으로 분산을 나눠요 → 표준편차로 나눠 $Z=\\frac{X-170}{4}$ 예요.',
      '$P(Z\\ge1)$ 을 표에서 읽은 $P(0\\le Z\\le1)$ 그대로 써요 → 대칭성으로 $0.5-P(0\\le Z\\le1)$ 을 계산해요.',
      '이항분포를 정규근사할 때 분산 $npq$ 를 표준편차로 그대로 써요 → 표준편차는 $\\sqrt{npq}$ 예요.',
    ],
    cats: {
      pdf: 'calc',
      standardize: 'calc',
      symmetry: 'concept',
      'normal-approx': 'calc',
      inverse: 'calc',
    },
  },
  'pst-7': {
    pitfalls: [
      '표본평균의 분산을 모분산 $\\sigma^{2}$ 그대로 써요 → 크기 $n$ 인 표본이면 $V(\\overline{X})=\\frac{\\sigma^{2}}{n}$ 이에요.',
      '신뢰구간을 $\\overline{x}\\pm1.96\\sigma$ 로 계산해요 → $\\overline{x}\\pm1.96\\frac{\\sigma}{\\sqrt{n}}$ 처럼 $\\sqrt{n}$ 으로 나눠야 해요.',
      '표본의 크기를 4배로 하면 신뢰구간 길이도 $\\frac{1}{4}$ 이 된다고 해요 → 길이는 $\\frac{1}{\\sqrt{n}}$ 에 비례하니 $\\frac{1}{2}$ 이 돼요.',
    ],
    cats: {
      'sample-mean': 'calc',
      'xbar-prob': 'calc',
      ci: 'calc',
      'ci-length': 'calc',
      concept: 'concept',
    },
  },

  // ───────── 미적분Ⅱ
  'cal2-1': {
    pitfalls: [
      '$\\frac{\\infty}{\\infty}$ 꼴에서 분자·분모의 최고차항이 아닌 상수항을 비교해요 → 분모의 최고차항으로 나눠 최고차항 계수의 비를 구해요.',
      '$\\{r^{n}\\}$ 이 $r=1$ 일 때도 발산한다고 해요 → $-1<r\\le1$ 에서 수렴하고, $r=-1$ 이면 진동해서 발산해요.',
      '$\\sqrt{n^{2}+5n}-n$ 을 $\\infty-\\infty=0$ 으로 처리해요 → 분자를 유리화하면 $\\frac{5n}{\\sqrt{n^{2}+5n}+n}\\to\\frac{5}{2}$ 예요.',
    ],
    cats: {
      rational: 'calc',
      'sqrt-diff': 'calc',
      geometric: 'calc',
      converge: 'concept',
      'limit-prop': 'calc',
    },
  },
  'cal2-2': {
    pitfalls: [
      '$\\lim a_n=0$ 이면 급수 $\\sum a_n$ 이 수렴한다고 해요 → 역은 성립하지 않아요: $\\sum\\frac{1}{n}$ 은 발산해요.',
      '등비급수의 수렴 조건을 $|r|\\le1$ 로 써요 → $-1<r<1$ 일 때만 수렴하고 합은 $\\frac{a}{1-r}$ 예요.',
      '공이 튀어 오르는 거리의 합에서 처음 떨어진 높이까지 2배 해요 → 처음 낙하는 한 번, 그 뒤 오르내림은 각각 2번씩 더해요.',
    ],
    cats: {
      telescope: 'calc',
      'geo-series': 'calc',
      'term-limit': 'concept',
      recurring: 'calc',
      figure: 'calc',
    },
  },
  'cal2-3': {
    pitfalls: [
      '$\\lim_{x\\to0}\\frac{\\sin7x}{3x}$ 를 $1$ 로 끝내요 → $\\frac{\\sin7x}{7x}\\cdot\\frac{7}{3}$ 로 맞춰 $\\frac{7}{3}$ 이에요.',
      '$(2^{x})\'=x2^{x-1}$ 처럼 거듭제곱 미분을 써요 → 지수함수는 $(a^{x})\'=a^{x}\\ln a$ 예요.',
      '삼각함수 극한에서 각을 도($^{\\circ}$) 단위로 생각해요 → $\\lim\\frac{\\sin x}{x}=1$ 은 호도법일 때만 성립해요.',
    ],
    cats: {
      'lim-e': 'calc',
      'lim-explog': 'calc',
      'lim-trig': 'calc',
      'deriv-value': 'calc',
      'trig-add': 'calc',
      'deriv-formula': 'calc',
    },
  },
  'cal2-4': {
    pitfalls: [
      '몫의 미분에서 분자 순서를 바꿔 $\\frac{fg\'-f\'g}{g^{2}}$ 로 써요 → $\\left(\\frac{f}{g}\\right)\'=\\frac{f\'g-fg\'}{g^{2}}$ 예요.',
      '$(3x+2)^{3}$ 을 미분할 때 속미분을 빠뜨려 $3(3x+2)^{2}$ 로 써요 → 합성함수는 겉미분 $\\times$ 속미분이라 $9(3x+2)^{2}$ 예요.',
      '역함수 미분 $g\'(b)$ 를 $\\frac{1}{f\'(b)}$ 로 계산해요 → $f(a)=b$ 인 $a$ 를 먼저 찾아 $\\frac{1}{f\'(a)}$ 예요.',
    ],
    cats: {
      quotient: 'calc',
      chain: 'calc',
      parametric: 'calc',
      implicit: 'calc',
      inverse: 'calc',
      second: 'calc',
    },
  },
  'cal2-5': {
    pitfalls: [
      '$f\'\'(a)=0$ 이면 항상 변곡점이라고 해요 → $x=a$ 좌우에서 $f\'\'(x)$ 의 부호가 바뀌어야 변곡점이에요.',
      '평면 위 운동의 속력을 $\\frac{dx}{dt}+\\frac{dy}{dt}$ 로 구해요 → 속력은 속도의 크기라서 $\\sqrt{(\\frac{dx}{dt})^{2}+(\\frac{dy}{dt})^{2}}$ 예요.',
      '$(x^{2}+ax+b)e^{x}$ 를 미분할 때 $e^{x}$ 만 미분해요 → 곱의 미분으로 $(x^{2}+(a+2)x+a+b)e^{x}$ 가 돼요.',
    ],
    cats: {
      tangent: 'calc',
      extremum: 'calc',
      inflection: 'calc',
      motion: 'calc',
      maxmin: 'calc',
    },
  },
  'cal2-6': {
    pitfalls: [
      '$\\int\\frac{1}{x}dx=\\ln x+C$ 로 절댓값을 빠뜨려요 → $\\ln|x|+C$ 예요.',
      '치환적분에서 $dx$ 를 $dt$ 로 바꾸지 않거나 적분 구간을 그대로 둬요 → $dt=g\'(x)dx$ 로 바꾸고 구간도 $t$ 의 값으로 바꿔요.',
      '부분적분에서 미분할 함수와 적분할 함수를 거꾸로 골라 식이 더 복잡해져요 → 로그·다항식은 미분, 지수·삼각함수는 적분 쪽으로 둬요.',
    ],
    cats: {
      antideriv: 'calc',
      'definite-basic': 'calc',
      substitution: 'calc',
      'log-type': 'calc',
      'by-parts': 'calc',
    },
  },
  'cal2-7': {
    pitfalls: [
      '$\\lim\\sum\\frac{1}{n}f\\left(\\frac{3k}{n}\\right)$ 를 $\\int_{0}^{3}f(x)dx$ 로 써요 → $\\frac{3k}{n}=x$ 로 놓으면 $\\frac{1}{3}\\int_{0}^{3}f(x)dx$ 예요.',
      '입체의 부피를 단면의 한 변 길이로 적분해요 → 단면의 넓이 $S(x)$ 를 구해 $\\int S(x)dx$ 로 계산해요.',
      '곡선의 길이를 $\\int\\sqrt{1+y\'}dx$ 로 써요 → 도함수를 제곱해 $\\int\\sqrt{1+(y\')^{2}}dx$ 예요.',
    ],
    cats: {
      riemann: 'calc',
      'riemann-form': 'concept',
      area: 'calc',
      volume: 'calc',
      distance: 'calc',
    },
  },

  // ───────── 기하
  'geo-1': {
    pitfalls: [
      '포물선 $y^{2}=-12x$ 의 초점을 $(3, 0)$ 으로 써요 → $y^{2}=4px$ 에서 $p=-3$ 이므로 초점 $(-3, 0)$, 준선 $x=3$ 이에요.',
      '타원과 쌍곡선의 $c$ 를 같은 식으로 구해요 → 타원은 $c^{2}=a^{2}-b^{2}$, 쌍곡선은 $c^{2}=a^{2}+b^{2}$ 예요.',
      '$\\frac{x^{2}}{64}+\\frac{y^{2}}{289}=1$ 의 초점을 $x$ 축 위에 놓아요 → 분모가 큰 쪽이 장축이라 초점이 $y$ 축 위에 있어요.',
    ],
    cats: {
      parabola: 'calc',
      ellipse: 'calc',
      hyperbola: 'calc',
      equation: 'calc',
      center: 'calc',
    },
  },
  'geo-2': {
    pitfalls: [
      '타원 위의 점 $(x_1, y_1)$ 에서의 접선을 $\\frac{x_1^{2}}{a^{2}}+\\frac{y_1^{2}}{b^{2}}=1$ 로 써요 → $\\frac{x_1x}{a^{2}}+\\frac{y_1y}{b^{2}}=1$ 이에요.',
      '포물선 $y^{2}=4px$ 위 접선을 $y_1y=4px$ 로 써요 → $x$ 쪽은 평균을 써서 $y_1y=2p(x+x_1)$ 이에요.',
      '기울기가 $m$ 인 접선을 하나만 구해요 → 타원·쌍곡선에는 기울기가 같은 접선이 두 개라 $y$ 절편의 $\\pm$ 두 값을 모두 확인해요.',
    ],
    cats: {
      position: 'calc',
      'tangent-point': 'calc',
      'slope-tangent': 'calc',
      external: 'calc',
      'tangent-area': 'calc',
    },
  },
  'geo-3': {
    pitfalls: [
      '$\\overrightarrow{AB}$ 를 $A-B$ 의 성분으로 계산해요 → 끝점에서 시작점을 빼 $\\overrightarrow{AB}=\\vec b-\\vec a$ 예요.',
      '벡터의 크기를 성분의 합 $|x+y|$ 로 구해요 → $|(x, y)|=\\sqrt{x^{2}+y^{2}}$ 예요.',
      '평행사변형 ABCD 의 D 를 $\\vec b+\\vec c-\\vec a$ 로 구해요 → 대각선 AC, BD 의 중점이 같으므로 $\\vec d=\\vec a+\\vec c-\\vec b$ 예요.',
    ],
    cats: {
      components: 'calc',
      magnitude: 'calc',
      parallel: 'calc',
      division: 'calc',
      express: 'concept',
    },
  },
  'geo-4': {
    pitfalls: [
      '내적의 결과를 벡터로 써요 → $\\vec a\\cdot\\vec b=|\\vec a||\\vec b|\\cos\\theta$ 는 실수예요.',
      '$|\\vec a+\\vec b|^{2}=|\\vec a|^{2}+|\\vec b|^{2}$ 으로 전개해요 → 가운데 항 $2\\vec a\\cdot\\vec b$ 를 꼭 넣어요.',
      '두 직선이 이루는 각을 방향벡터 내적으로 구하면서 둔각을 그대로 써요 → 직선 사이 각은 예각이라 $\\cos\\theta=\\frac{|\\vec u\\cdot\\vec v|}{|\\vec u||\\vec v|}$ 예요.',
    ],
    cats: {
      'dot-comp': 'calc',
      'dot-angle': 'calc',
      angle: 'calc',
      perpendicular: 'calc',
      'line-angle': 'calc',
      'circle-eq': 'calc',
    },
  },
  'geo-5': {
    pitfalls: [
      '만나지 않는 두 직선은 모두 평행하다고 생각해요 → 공간에서는 평행하지도 만나지도 않는 꼬인 위치가 있어요.',
      '정사영의 길이를 $l\\sin\\theta$ 로 구해요 → 평면과 이루는 각이 $\\theta$ 이면 정사영의 길이는 $l\\cos\\theta$ 예요.',
      '구와 $xy$ 평면이 만나는 원의 반지름을 구의 반지름 그대로 써요 → 중심의 $z$ 좌표가 거리 $d$ 이므로 $\\sqrt{r^{2}-d^{2}}$ 예요.',
    ],
    cats: {
      'solid-lines': 'concept',
      distance3: 'calc',
      division3: 'calc',
      projection: 'calc',
      sphere: 'calc',
    },
  },
};
