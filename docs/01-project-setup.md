# 01 — 프로젝트 생성 및 개발 환경

## 1. 목표
HTML/CSS/JavaScript와 Node.js 기반으로 Vercel에 배포 가능한 최소 프로젝트를 구성한다. 프레임워크를 추가하지 않는다.

## 2. 권장 폴더 구조
```text
project-root/
├─ api/
│  └─ analyze.js              # Vercel 서버리스 API
├─ public/
│  ├─ index.html
│  ├─ css/
│  │  └─ styles.css
│  ├─ js/
│  │  ├─ app.js
│  │  └─ ui.js
│  └─ assets/
├─ lib/
│  ├─ openai.js               # 서버 전용 AI 호출
│  ├─ supabase.js             # 서버 전용 DB 연결
│  └─ validation.js           # 서버 입력/응답 검증
├─ docs/
├─ AGENTS.md
├─ PRD.md
├─ package.json
├─ vercel.json                # 필요한 경우에만 설정
├─ .env.example
└─ .gitignore
```

## 3. 생성 지침
- 정적 파일은 `public/` 아래 둔다.
- Vercel Functions 규칙에 맞춰 `api/` 아래 서버 엔드포인트를 둔다.
- 서버에서만 사용하는 모듈은 `lib/`에 둔다.
- 브라우저 코드와 서버 코드를 import 경로로 혼합하지 않는다.
- `package.json`은 필요한 스크립트와 SDK만 포함한다.
- 불필요한 빌드 도구나 번들러는 추가하지 않는다. Vercel에서 정적 파일과 Node.js Function을 제공하는 기본 구조를 우선한다.

## 4. 환경 변수
`.env.example`에 아래 이름만 기록한다.
```dotenv
OPENAI_API_KEY=
OPENAI_MODEL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```
- `OPENAI_API_KEY`: OpenAI 서버 인증 키
- `OPENAI_MODEL`: 배포자가 선택한 사용 가능 모델명
- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_SERVICE_ROLE_KEY`: 서버에서만 사용하는 비밀 키

실제 값은 로컬 개발용 비밀 환경 파일 및 Vercel Project Settings → Environment Variables에 등록한다. 비밀 환경 파일은 `.gitignore`에 포함한다.

## 5. 실행 스크립트
- `npm run dev`: 로컬 개발 서버 실행
- `npm run test`: 자동화 테스트 실행(테스트 도구를 도입할 경우)
- `npm run lint`: 린터를 도입하기로 승인된 경우에만 제공

로컬에서 Vercel Function을 테스트할 때는 Vercel CLI 사용 여부를 사용자에게 확인하거나, 프로젝트에서 이미 설치된 개발 서버 방식을 따른다. 임의로 개발 서버 패키지를 추가하지 않는다.

## 6. 생성 완료 검증
- [ ] 폴더 구조가 문서와 일치한다.
- [ ] `public/index.html`이 브라우저에서 표시된다.
- [ ] 정적 CSS/JS 파일이 정상 로드된다.
- [ ] API 경로가 Vercel Function으로 인식된다.
- [ ] 비밀 키가 Git 추적 대상이 아니다.
- [ ] 앱이 프레임워크 없이 HTML/CSS/Vanilla JS로 구성됐다.
