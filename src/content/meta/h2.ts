import type { MetaMap } from '../meta';

export const META: MetaMap = {
  // ───────── 공통수학2
  'hc2-1': {
    pitfalls: [
      '내분점 공식에서 비율을 거꾸로 곱해 $\\frac{mx_1+nx_2}{m+n}$ 로 써요 → $m:n$ 내분점은 $m$ 이 먼 끝점 $B$ 에 곱해져 $\\frac{mx_2+nx_1}{m+n}$ 이에요.',
      '수직 조건을 기울기가 서로 역수라고 착각해요 → 두 기울기의 곱이 $-1$, 즉 $m\'=-\\frac{1}{m}$ 이에요.',
      '점과 직선 사이 거리에서 직선을 $y=mx+n$ 꼴 그대로 넣어요 → 먼저 $ax+by+c=0$ 꼴로 정리한 뒤 공식에 대입해요.',
    ],
    cats: {
      distance: 'calc',
      'internal-point': 'calc',
      'line-equation': 'calc',
      'parallel-perp': 'calc',
      'point-line-distance': 'calc',
    },
  },
  'hc2-2': {
    pitfalls: [
      '$(x-2)^{2}+(y+3)^{2}=16$ 의 중심을 $(-2, 3)$, 반지름을 $16$ 으로 읽어요 → 부호를 바꾼 $(2, -3)$ 이 중심, 반지름은 $\\sqrt{16}=4$ 예요.',
      '일반형 $x^{2}+y^{2}+Ax+By+C=0$ 을 완전제곱식으로 바꿀 때 더한 상수를 우변에 더하지 않아요 → 양변에 똑같이 더해 반지름의 제곱을 구해요.',
      '현의 길이를 구할 때 중심과 직선 사이 거리 $d$ 를 그대로 반으로 써요 → 현의 절반은 $\\sqrt{r^{2}-d^{2}}$ 이고 현의 길이는 그 2배예요.',
    ],
    cats: {
      'center-radius': 'calc',
      'circle-equation': 'calc',
      'circle-line-position': 'concept',
      'tangent-line': 'calc',
      'chord-length': 'calc',
    },
  },
  'hc2-3': {
    pitfalls: [
      '도형을 $x$ 축 방향으로 $a$ 만큼 옮길 때 $x$ 대신 $x+a$ 를 넣어요 → 도형의 평행이동은 $x$ 대신 $x-a$, $y$ 대신 $y-b$ 를 넣어요.',
      '점의 평행이동과 도형의 평행이동을 같은 부호로 처리해요 → 점은 좌표에 $+a$, 도형의 방정식은 $x$ 에 $-a$ 를 대입해요.',
      '$y=x$ 대칭과 원점 대칭을 헷갈려요 → $y=x$ 대칭은 $(a,b)\\to(b,a)$, 원점 대칭은 $(a,b)\\to(-a,-b)$ 예요.',
    ],
    cats: {
      'point-translate': 'calc',
      'point-reflect': 'calc',
      'figure-translate': 'calc',
      'figure-reflect': 'calc',
    },
  },
  'hc2-4': {
    pitfalls: [
      '$n(A\\cup B)=n(A)+n(B)$ 로 계산해 공통부분을 두 번 세요 → $n(A)+n(B)-n(A\\cap B)$ 로 한 번 빼 줘야 해요.',
      '$A\\subset X\\subset B$ 인 $X$ 의 개수를 $2^{n(B)}$ 로 셉니다 → 반드시 들어갈 원소를 빼고 $2^{n(B)-n(A)}$ 개예요.',
      '공집합 $\\varnothing$ 이나 자기 자신을 부분집합에서 빠뜨려요 → 원소가 $n$ 개면 이 둘을 포함해 부분집합은 $2^{n}$ 개예요.',
    ],
    cats: {
      'subset-count': 'calc',
      'set-operations': 'calc',
      'count-union': 'calc',
      'set-builder': 'calc',
    },
  },
  'hc2-5': {
    pitfalls: [
      '\'$p$ 이고 $q$\' 의 부정을 \'$\\sim p$ 이고 $\\sim q$\' 로 써요 → \'이고\' 는 \'또는\' 으로 바뀌어 \'$\\sim p$ 또는 $\\sim q$\' 예요.',
      '명제가 참이면 역도 참이라고 생각해요 → 항상 참값이 같은 것은 대우뿐이고, 역·이는 따로 확인해야 해요.',
      '산술·기하평균으로 최솟값을 구하고 등호 조건을 확인하지 않아요 → 등호가 성립하는 $x$ 가 조건 안에 있는지 꼭 확인해요.',
    ],
    cats: {
      'necessary-sufficient': 'concept',
      'converse-contrapositive': 'concept',
      'truth-set-range': 'calc',
      negation: 'concept',
      'am-gm': 'calc',
    },
  },
  'hc2-6': {
    pitfalls: [
      '$(g\\circ f)(x)$ 를 $g$ 부터 계산해 $f(g(x))$ 로 구해요 → 오른쪽 함수가 먼저라서 $g(f(x))$ 예요.',
      '$f^{-1}(7)$ 을 $\\frac{1}{f(7)}$ 로 계산해요 → $f(k)=7$ 을 만족하는 $k$ 를 찾는 것이 역함수의 함숫값이에요.',
      '역함수를 구한 뒤 정의역 조건을 버려요 → 원래 함수의 치역이 역함수의 정의역이 되니 범위를 함께 써요.',
    ],
    cats: {
      'composite-value': 'calc',
      'inverse-value': 'calc',
      'inverse-formula': 'calc',
      'one-to-one': 'calc',
      'function-count': 'calc',
    },
  },
  'hc2-7': {
    pitfalls: [
      '$y=\\frac{2x-11}{x-3}$ 의 점근선을 $y=-11$ 등으로 읽어요 → $y=\\frac{k}{x-p}+q$ 꼴로 바꾸면 점근선은 $x=p$, $y=q$ 예요.',
      '$y=\\sqrt{-3x-12}$ 의 정의역을 $x\\ge -4$ 로 써요 → 근호 안이 $0$ 이상이 되게 $-3x-12\\ge0$ 을 풀면 $x\\le -4$ 예요.',
      '유리함수 최대·최소를 구간 양 끝값으로만 구하면서 그래프의 증감을 무시해요 → 점근선 기준으로 증가·감소를 먼저 확인해요.',
    ],
    cats: {
      asymptote: 'calc',
      'rational-maxmin': 'calc',
      'irrational-domain-range': 'calc',
      'irrational-value': 'calc',
      'rational-graph': 'concept',
    },
  },

  // ───────── 대수
  'alg-1': {
    pitfalls: [
      '$\\sqrt[4]{16}$ 과 \'$16$ 의 네제곱근\' 을 같게 봐요 → $16$ 의 네제곱근 중 실수는 $\\pm2$ 두 개이고, $\\sqrt[4]{16}=2$ 는 양수 하나예요.',
      '$\\log_a(M+N)=\\log_a M+\\log_a N$ 으로 계산해요 → 덧셈이 되는 건 곱일 때뿐이에요: $\\log_a MN=\\log_a M+\\log_a N$.',
      '음수 지표의 상용로그를 $-1.7$ 그대로 지표 $-1$ 로 읽어요 → $-1.7=-2+0.3$ 처럼 가수가 $0$ 이상이 되게 바꿔 지표를 정해요.',
    ],
    cats: {
      'nth-root': 'calc',
      'exponent-calc': 'calc',
      'log-calc': 'calc',
      'log-letters': 'calc',
      'common-log': 'calc',
    },
  },
  'alg-2': {
    pitfalls: [
      '밑이 $1$ 보다 작은 부등식 $\\left(\\frac{1}{2}\\right)^{x}>\\frac{1}{8}$ 을 $x>3$ 으로 풀어요 → 밑이 $0<a<1$ 이면 부등호 방향이 바뀌어 $x<3$ 이에요.',
      '로그방정식을 풀고 진수 조건을 확인하지 않아요 → 구한 해가 (진수)$>0$, 밑 조건을 만족하는지 꼭 대입해 봐요.',
      '$3^{x}=t$ 로 치환하고 $t$ 의 범위를 잊어요 → $t>0$ 이므로 음수인 $t$ 값은 버려야 해요.',
    ],
    cats: {
      'exp-equation': 'calc',
      'log-equation': 'calc',
      'exp-log-inequality': 'calc',
      'graph-property': 'calc',
      'compare-size': 'calc',
    },
  },
  'alg-3': {
    pitfalls: [
      '부채꼴의 호의 길이를 $r\\theta$ 로 쓰면서 $\\theta$ 에 도($^{\\circ}$) 값을 그대로 넣어요 → $l=r\\theta$, $S=\\frac{1}{2}r^{2}\\theta$ 는 호도법일 때만 성립해요.',
      '$\\sin\\theta$ 로 $\\cos\\theta$ 를 구할 때 부호를 항상 $+$ 로 해요 → $\\theta$ 가 속한 사분면을 보고 부호를 정해요.',
      '$y=a\\sin bx$ 의 주기를 $2\\pi b$ 로 계산해요 → 주기는 $\\frac{2\\pi}{|b|}$ 이고 $\\tan$ 은 $\\frac{\\pi}{|b|}$ 예요.',
    ],
    cats: {
      radian: 'calc',
      sector: 'calc',
      'special-values': 'calc',
      'trig-relation': 'calc',
      'period-maxmin': 'calc',
      'trig-equation': 'calc',
    },
  },
  'alg-4': {
    pitfalls: [
      '사인법칙을 $\\frac{a}{\\sin A}=R$ 로 써서 반지름을 2배로 구해요 → $\\frac{a}{\\sin A}=2R$ 이에요.',
      '코사인법칙에서 $-2bc\\cos A$ 의 부호를 놓쳐 둔각이면 오히려 빼 버려요 → $\\cos120^{\\circ}=-\\frac{1}{2}$ 를 넣으면 $+bc$ 가 돼요.',
      '삼각형 넓이를 $\\frac{1}{2}bc\\cos A$ 로 계산해요 → 넓이는 끼인각의 사인을 써서 $\\frac{1}{2}bc\\sin A$ 예요.',
    ],
    cats: {
      'sine-law': 'calc',
      'cosine-side': 'calc',
      'triangle-shape': 'calc',
      'triangle-area': 'calc',
      'law-word': 'word',
    },
  },
  'alg-5': {
    pitfalls: [
      '등차수열의 제$n$항을 $a+nd$ 로 써서 한 칸 밀려요 → 첫째항에서 $n-1$ 번 더하므로 $a_n=a+(n-1)d$ 예요.',
      '$S_n$ 으로 $a_n=S_n-S_{n-1}$ 을 구하고 $n=1$ 에도 그대로 써요 → $a_1=S_1$ 을 따로 구해 식과 맞는지 확인해요.',
      '등비수열의 합을 $\\frac{a(r^{n}-1)}{r-1}$ 에 $r=1$ 일 때도 대입해요 → $r=1$ 이면 합은 $na$ 예요.',
    ],
    cats: {
      'arith-term': 'calc',
      'arith-sum': 'calc',
      'geo-term': 'calc',
      'geo-sum': 'calc',
      means: 'calc',
      'sum-to-term': 'calc',
    },
  },
  'alg-6': {
    pitfalls: [
      '$\\sum_{k=1}^{n}a_kb_k=\\sum a_k\\times\\sum b_k$ 로 나눠요 → $\\Sigma$ 는 합·차·상수배만 나눌 수 있고, 곱은 전개해서 계산해요.',
      '$\\sum_{k=1}^{n}c$ 를 $c$ 로 써요 → 상수 $c$ 를 $n$ 번 더하므로 $cn$ 이에요.',
      '분수 꼴 합을 부분분수로 나눈 뒤 앞뒤에 남는 항을 빠뜨려요 → 몇 개 항을 직접 써 보며 지워지지 않는 항을 확인해요.',
    ],
    cats: {
      'sigma-poly': 'calc',
      'sigma-property': 'concept',
      telescoping: 'calc',
      'sigma-geometric': 'calc',
      'sigma-expression': 'concept',
    },
  },
  'alg-7': {
    pitfalls: [
      '귀납적 정의에서 $a_{n+1}$ 을 구할 때 $a_n$ 대신 $n$ 을 넣어요 → 점화식은 앞의 항 값을 넣어 다음 항을 차례로 구해요.',
      '주기가 있는 수열의 합에서 마지막에 남는 항을 빼먹어요 → (한 주기의 합)$\\times$(주기 수)에 나머지 항을 더해요.',
      '수학적 귀납법에서 $n=k$ 일 때의 식을 쓰고 바로 $n=k+1$ 이 성립한다고 써요 → 가정한 식의 양변에 다음 항을 더해 $k+1$ 꼴로 정리해야 해요.',
    ],
    cats: {
      'recursive-term': 'calc',
      'recursive-type': 'calc',
      periodic: 'calc',
      'induction-blank': 'concept',
    },
  },

  // ───────── 미적분Ⅰ
  'cal1-1': {
    pitfalls: [
      '$\\frac{0}{0}$ 꼴인데 그대로 대입해 극한이 없다고 해요 → 분자·분모를 인수분해해 약분한 뒤 대입해요.',
      '$\\lim_{x\\to\\infty}(\\sqrt{x^{2}+6x}-x)$ 를 $\\infty-\\infty=0$ 으로 처리해요 → 유리화해서 $\\frac{6x}{\\sqrt{x^{2}+6x}+x}\\to3$ 처럼 계산해요.',
      '극한값이 존재하고 분모가 $0$ 으로 가는데 분자 조건을 쓰지 않아요 → 분자도 $0$ 으로 가야 하니 (분자)$=0$ 으로 식을 하나 세워요.',
    ],
    cats: {
      'limit-poly': 'calc',
      'limit-infinity': 'calc',
      'one-sided': 'concept',
      undetermined: 'calc',
      rationalize: 'calc',
    },
  },
  'cal1-2': {
    pitfalls: [
      '극한값만 있으면 연속이라고 판단해요 → $\\lim_{x\\to a}f(x)$ 가 있고, $f(a)$ 가 정의되고, 둘이 같아야 연속이에요.',
      '구간별 함수에서 경계점의 좌극한·우극한 중 하나만 맞춰요 → 경계마다 좌극한$=$우극한$=f(a)$ 를 모두 세워요.',
      '사잇값 정리로 실근 존재를 말하면서 연속성을 확인하지 않아요 → 닫힌구간에서 연속이고 $f(a)f(b)<0$ 일 때 실근이 있어요.',
    ],
    cats: {
      'piecewise-continuous': 'calc',
      'discontinuity-count': 'concept',
      ivt: 'concept',
      'continuity-product': 'calc',
    },
  },
  'cal1-3': {
    pitfalls: [
      '$\\lim_{h\\to0}\\frac{f(1+2h)-f(1)}{h}$ 를 $f\'(1)$ 로 써요 → 분모를 $2h$ 로 맞추면 $2f\'(1)$ 이에요.',
      '곱의 미분을 $\\{f(x)g(x)\\}\'=f\'(x)g\'(x)$ 로 해요 → $f\'(x)g(x)+f(x)g\'(x)$ 예요.',
      '미분가능 조건에서 미분계수만 맞추고 연속 조건을 빠뜨려요 → 먼저 연속(함숫값 일치), 그다음 좌우 미분계수 일치를 둘 다 세워요.',
    ],
    cats: {
      'avg-rate': 'calc',
      'derivative-value': 'calc',
      'limit-form': 'calc',
      'derivative-formula': 'calc',
      'differentiable-piecewise': 'calc',
    },
  },
  'cal1-4': {
    pitfalls: [
      '$f\'(a)=0$ 이면 항상 극값이라고 해요 → $x=a$ 의 좌우에서 $f\'(x)$ 의 부호가 바뀌어야 극값이에요.',
      '닫힌구간 최대·최소를 극값만 비교해 구해요 → 극값과 구간 양 끝의 함숫값을 모두 비교해요.',
      '실수 전체에서 증가할 조건을 $f\'(x)>0$ 의 판별식 $D<0$ 으로만 잡아요 → $f\'(x)\\ge0$ 이면 되므로 $D\\le0$ 이에요.',
    ],
    cats: {
      tangent: 'calc',
      extremum: 'calc',
      monotonic: 'calc',
      'max-min': 'calc',
      'root-count': 'calc',
      velocity: 'calc',
    },
  },
  'cal1-5': {
    pitfalls: [
      '부정적분 결과에 적분상수 $C$ 를 빠뜨려요 → 부정적분은 $F(x)+C$ 꼴로 써야 해요.',
      '$\\int(2x-3)^{2}dx$ 를 $\\frac{(2x-3)^{3}}{3}$ 로 바로 써요 → 먼저 전개해서 항별로 적분해요.',
      '$\\frac{d}{dx}\\int f(x)dx$ 와 $\\int\\left\\{\\frac{d}{dx}f(x)\\right\\}dx$ 를 같게 봐요 → 앞은 $f(x)$, 뒤는 $f(x)+C$ 예요.',
    ],
    cats: {
      antiderivative: 'calc',
      'antiderivative-condition': 'calc',
      'curve-slope': 'calc',
      'diff-int-relation': 'concept',
      'integral-coefficient': 'calc',
    },
  },
  'cal1-6': {
    pitfalls: [
      '$\\int_{a}^{b}f(x)dx=F(a)-F(b)$ 로 순서를 바꿔 빼요 → 위끝에서 아래끝을 빼서 $F(b)-F(a)$ 예요.',
      '$\\int_{0}^{7}|x-3|dx$ 를 절댓값을 그대로 둔 채 적분해요 → $x=3$ 에서 구간을 나눠 부호를 정한 뒤 적분해요.',
      '$\\frac{d}{dx}\\int_{a}^{x}f(t)dt$ 를 $f(x)-f(a)$ 로 써요 → 결과는 $f(x)$ 이고, $x=a$ 를 넣으면 정적분은 $0$ 이에요.',
    ],
    cats: {
      definite: 'calc',
      'abs-piecewise': 'calc',
      'integral-function': 'calc',
      'limit-integral': 'calc',
      'integral-property': 'concept',
    },
  },
  'cal1-7': {
    pitfalls: [
      '곡선이 $x$ 축 아래로 내려간 부분까지 한 번에 적분해 넓이가 줄어요 → $x$ 축과의 교점에서 나눠 $\\int|f(x)|dx$ 로 구해요.',
      '두 곡선 사이 넓이에서 위·아래 함수를 바꿔 빼요 → 교점 사이에서 (위 함수)$-$(아래 함수)를 적분해요.',
      '움직인 거리를 $\\int v(t)dt$ 로 구해요 → 그건 위치의 변화량이고, 거리는 $\\int|v(t)|dt$ 예요.',
    ],
    cats: {
      'area-axis': 'calc',
      'area-curves': 'calc',
      'velocity-distance': 'calc',
      'area-parameter': 'calc',
    },
  },
};
