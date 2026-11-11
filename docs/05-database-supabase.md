# 05 — Supabase 데이터베이스 설계

## 1. 목적
성공한 감성 분석 기록을 저장한다. 이번 버전은 로그인 기능이 없으므로 사용자 계정별 조회/소유권 관리는 구현하지 않는다.

## 2. 테이블
테이블명: `sentiment_analyses`

| 컬럼 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| id | uuid | 예 | 기본 키, 자동 생성 |
| input_text | text | 예 | 분석한 원문 |
| sentiment | text | 예 | positive / negative / neutral |
| confidence | numeric(4,3) | 예 | 0.000~1.000 |
| reason | text | 예 | 분석 이유 |
| created_at | timestamptz | 예 | 생성 시각, 기본 now() |

## 3. SQL 초기 스키마
Supabase SQL Editor에서 사용자가 직접 실행할 수 있도록 다음 SQL을 제공한다.
```sql
create table if not exists public.sentiment_analyses (
  id uuid primary key default gen_random_uuid(),
  input_text text not null,
  sentiment text not null
    check (sentiment in ('positive', 'negative', 'neutral')),
  confidence numeric(4,3) not null
    check (confidence >= 0 and confidence <= 1),
  reason text not null,
  created_at timestamptz not null default now()
);

alter table public.sentiment_analyses enable row level security;
```

## 4. 접근 정책
- 기본 구현은 서버에서 Supabase `service_role` 키로 insert한다.
- `service_role` 키는 RLS를 우회할 수 있으므로 서버 환경 변수에만 둔다.
- 브라우저에서 테이블에 직접 접근하는 정책을 만들지 않는다.
- 공개 익명 사용자에게 SELECT/INSERT 정책을 무조건 허용하지 않는다.
- 기록 조회 화면이 추가 승인되기 전까지 공개 SELECT 정책을 만들지 않는다.
- 향후 로그인 기능을 도입하면 사용자 ID 컬럼, 인증 연동, 소유권 기반 RLS를 별도 설계한다.

## 5. 저장 동작
- AI 응답 검증이 성공한 뒤 저장한다.
- 원문, 라벨, confidence, reason을 하나의 레코드로 저장한다.
- 생성 시각은 DB 기본값을 사용한다.
- 저장 결과의 레코드 ID 등 내부 정보는 필요하지 않으면 브라우저에 전달하지 않는다.
- DB 저장 실패 시 AI 분석 결과 자체는 유지할 수 있으며 API의 `saved: false`로 표시한다.

## 6. 개인정보 고려
- 입력 원문이 저장된다는 점을 사용자에게 알린다.
- 운영자는 실제 서비스 출시 전에 보관 기간과 삭제 절차를 결정해야 한다.
- 민감한 정보 입력을 피하도록 안내한다.
- 테스트에는 실제 개인 정보 대신 임의의 예시 문장을 사용한다.

## 7. 데이터베이스 검증
- [ ] 테이블이 정상 생성된다.
- [ ] 허용된 라벨만 저장된다.
- [ ] confidence 0~1 범위 제약이 적용된다.
- [ ] 정상 분석 1건이 정확한 필드로 저장된다.
- [ ] 서버 키가 클라이언트 파일에 포함되지 않는다.
- [ ] 비인증 공개 사용자가 직접 테이블을 조회할 수 없다.
- [ ] DB 오류가 발생하면 `saved: false`로 전달된다.
