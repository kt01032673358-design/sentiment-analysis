-- ========================================================
-- 마이그레이션 파일: 001_create_sentiment_analyses_table.sql
-- 설명: 감성 분석 결과를 저장하기 위한 테이블 생성 및 RLS 보안 설정
-- 실행 위치: Supabase 대시보드 -> SQL Editor
-- ========================================================

-- 1. 감성 분석 결과 저장 테이블(sentiment_analyses) 생성
-- id: 고유 식별자 (UUID v4 자동 생성)
-- input_text: 분석 대상이 된 사용자의 원본 텍스트
-- sentiment: 분석된 감정 라벨 ('positive', 'negative', 'neutral' 중 하나만 허용)
-- confidence: 분석 신뢰도 (0.000 ~ 1.000 사이의 소수점 3자리 숫자)
-- reason: 해당 감정으로 판단한 구체적인 한국어 이유
-- created_at: 분석 및 저장된 일시 (기본값: 현재 시각)
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

-- 2. 테이블 레벨 보안(Row Level Security, RLS) 활성화
-- RLS를 켜두면 기본적으로 모든 외부 접근(공개 익명 사용자 조회/쓰기)이 차단됩니다.
-- 데이터 저장은 안전한 서버 환경에서 'service_role' 비밀 키를 통해서만 수행됩니다.
alter table public.sentiment_analyses enable row level security;

-- 3. 참고 사항:
-- 이번 버전에서는 사용자 로그인 및 공개 조회 기능이 없으므로,
-- 익명 사용자(anon key)를 위한 SELECT/INSERT 정책을 추가하지 않습니다.
-- 서버(Vercel Function)의 Supabase 클라이언트에서 'SUPABASE_SERVICE_ROLE_KEY'를 사용하여
-- RLS를 안전하게 우회하고 안전하게 데이터를 추가(INSERT)합니다.
