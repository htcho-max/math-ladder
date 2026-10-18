# 수학 사다리

초등 1학년 덧셈부터 고등 미적분·기하까지, 2022 개정 교육과정 148개 단원·757개 문제 유형을 **이어지는 개념**으로 배우는 PWA.

- 학습 지도(과정별 / 계통도), 단원마다 먼저 배울 단원·이어지는 단원 연결
- 개념 카드 → 유형별 연습(난이도 1·2·3 자동 조절) → 숙련도
- 단원평가 · 중간고사 · 기말고사 · 범위 직접 선택 · 수준 진단, 시험지 인쇄
- 오답노트(복습 간격 0·1·3·7·14일), 비슷한 문제
- 문제는 규칙 기반 생성기(단원당 4~6유형, 시드로 재생성) — 오프라인 동작
- 선택: Gemini API 키를 설정에 넣으면 AI 선생님 해설·AI 서술형 문항

## 개발
```
npm install
npm run dev          # http://localhost:5173 (같은 Wi-Fi 휴대폰은 http://PC-IP:5173)
npm test             # 전 단원 생성기 검사 + 핵심 테스트
npm run build        # dist/
npm run build:demo   # dist-demo/index.html (한 파일)
npx vite-node scripts/verify-dump.ts -- m1a 2   # 문제 견본 출력
```
콘텐츠 작성 규칙: `docs/CONTENT_GUIDE.md`. 구조: `src/core`(타입·난수·분수·그림·채점·교육과정), `src/content`(단원별 개념·생성기), `src/lib`(저장·숙련도·시험·AI), `src/pages`, `src/ui`.

## 배포
GitHub 에 `math-ladder` 저장소를 만들고 push → Settings › Pages › Source: GitHub Actions. `.github/workflows/deploy.yml` 이 자동 배포.
