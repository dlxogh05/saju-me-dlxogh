# SAJU ME

이름과 생년월일로 성격·기질을 풀어 주는 사주 해석 서비스입니다.

**지금 보기:** [saju-me-dlxogh.vercel.app](https://saju-me-dlxogh.vercel.app)

명식을 펼치면 성격, 기질과 재능, 약점, 돋보이는 특징이 한 편의 글로 읽힙니다. 비회원도 바로 볼 수 있고, Google로 로그인하면 결과가 저장되며 공유 링크를 만들 수 있습니다.

## 기능

- 이름, 생년월일, 태어난 시간, 성별, 양력/음력으로 기본 차트 해석
- 비회원은 앞부분만 공개되고, 로그인하면 나머지 해석과 저장이 이어짐
- Google 로그인, 프로필 저장, 과거 해석 목록
- `/result/:shareId` 공개 공유 페이지
- 지금까지 펼쳐진 사주 횟수 표시

해석은 참고용이며 미래 예언이 아닙니다.

## 기술

| 구분 | 사용 |
| --- | --- |
| 프론트 | React 19, Vite |
| 해석 | Google Gemini |
| 인증·저장 | Supabase (Auth, Postgres) |
| 배포 | Vercel |

## 로컬 실행

Node.js 22 이상을 권장합니다.

```bash
git clone https://github.com/dlxogh05/saju-me-dlxogh.git
cd saju-me-dlxogh
npm install
cp .env.example .env
```

`.env`에 아래 값을 채웁니다.

```
VITE_GEMINI_API_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`을 엽니다.

## 스크립트

```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
npm test         # Vitest
npm run lint     # ESLint
```

## 폴더 구조

```
src/
  App.jsx                 # 홈 / 공유 페이지 분기
  pages/                  # HomePage, SharedResultPage
  components/             # layout, sidebar, form, result, profile
  hooks/                  # 화면 상태와 핸들러
  api/                    # Gemini 호출
  lib/                    # 프로필, 공유, 프롬프트, Supabase
  styles/                 # 화면별 CSS
supabase/migrations/      # 프로필·해석·공유 스키마
```

`App.jsx`는 페이지를 조립하고, 기능별 UI는 `src/components/`에 나뉩니다.

## 배포

`main`에 푸시하면 Vercel이 프로덕션을 배포합니다.

- 사이트: https://saju-me-dlxogh.vercel.app
- SPA 라우팅: `vercel.json`의 rewrite로 `/result/:id`를 `index.html`에 연결
- 환경 변수는 Vercel 프로젝트에도 동일하게 설정해야 합니다
