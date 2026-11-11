/**
 * lib/supabase.js
 * 
 * [역할]
 * 서버 측 전용 Supabase 클라이언트를 초기화하고,
 * 감성 분석 완료 결과를 'sentiment_analyses' 테이블에 안전하게 저장합니다.
 * 
 * [보안 지침]
 * - RLS(Row Level Security)가 적용된 테이블에 데이터를 안전하게 쓰기 위해
 *   서버 환경 변수의 'SUPABASE_SERVICE_ROLE_KEY'를 사용합니다.
 * - 이 모듈은 오직 서버 환경에서만 실행되며 브라우저로 노출되지 않습니다.
 */

import { createClient } from '@supabase/supabase-js';

let supabaseClient = null;

/**
 * Supabase 서버 클라이언트 초기화 함수 (싱글톤 패턴)
 * @returns {import('@supabase/supabase-js').SupabaseClient | null}
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // 환경 변수가 올바르게 설정되어 있는지 확인
  if (
    !supabaseUrl ||
    !serviceRoleKey ||
    supabaseUrl.includes('your-project-id') ||
    serviceRoleKey.includes('your_supabase_service_role_key')
  ) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return supabaseClient;
}

/**
 * 감성 분석 결과를 Supabase에 저장하는 함수
 * @param {object} params
 * @param {string} params.inputText - 사용자가 입력한 원본 텍스트
 * @param {string} params.sentiment - 긍정('positive') / 부정('negative') / 중립('neutral')
 * @param {number} params.confidence - 신뢰도 (0.000 ~ 1.000)
 * @param {string} params.reason - 분석 이유
 * @returns {Promise<boolean>} 저장 성공 여부 (true / false)
 */
export async function saveAnalysisResult({ inputText, sentiment, confidence, reason }) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('[Supabase] 환경 변수 미설정으로 저장을 건너뜁니다.');
      return false;
    }

    const { error } = await supabase
      .from('sentiment_analyses')
      .insert([
        {
          input_text: inputText,
          sentiment: sentiment,
          confidence: confidence,
          reason: reason
        }
      ]);

    if (error) {
      // 서버 로그에만 에러를 남기고, 민감 정보는 노출하지 않음
      console.error('[Supabase 저장 실패 에러]:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Supabase 예기치 않은 오류]:', err.message);
    return false;
  }
}

