# mood / words — AI 텍스트 감성 분석 서비스

문장이나 짧은 글을 입력하면 AI가 전반적인 어조를 분석하여 **긍정(Positive)**, **부정(Negative)**, **중립(Neutral)** 중 하나의 결과와 **신뢰도**, 그리고 **판단 이유**를 제공하고 기록을 데이터베이스에 안전하게 보관하는 웹 서비스입니다.

---

## 🛠 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES Modules) — 프레임워크 없는 순수 웹 표준
- **Backend**: Node.js, Vercel Serverless Function (`POST /api/analyze`)
- **AI**: OpenAI API (`gpt-4o-mini`)
- **Database**: Supabase (PostgreSQL, Row Level Security 적용)
- **Deployment**: Vercel

---

## 📁 프로젝트 구조

```text
├── api/
│   └── analyze.js              # Vercel 서버리스 API 엔드포인트
├── public/
│   ├── index.html              # 시맨틱 웹 메인 페이지
│   ├── css/
│   │   └── styles.css          # 흑백 미니멀 반응형 디자인 (360px ~ 1120px)
│   └── js/
│       ├── app.js              # 이벤트 컨트롤러 및 API 통신
│       └── ui.js               # UI 상태 렌더링 및 XSS 방어 (textContent)
├── lib/
│   ├── openai.js               # OpenAI API 서버 전용 호출 로직
│   ├── supabase.js             # Supabase 서버 전용 DB 저장 로직
│   └── validation.js           # 텍스트 길이 및 AI 응답 유효성 검증
├── supabase/
│   └── migrations/
│       └── 001_create_sentiment_analyses_table.sql # DB 테이블 및 RLS 설정
├── dev-server.js               # 로컬 테스트용 개발 서버
├── package.json
├── .env.example                # 환경 변수 템플릿
└── .gitignore                  # 보안 및 제외 파일 목록
```

---

## 🚀 로컬 실행 방법

### 1. 환경 변수 설정
`.env.example` 파일을 복사하여 `.env` 파일을 만들고 키 값을 입력합니다:
```dotenv
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 2. 패키지 설치 및 개발 서버 실행
```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 으로 접속합니다.

