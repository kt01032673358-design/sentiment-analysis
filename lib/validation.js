/**
 * lib/validation.js
 * 
 * [역할]
 * 1. 클라이언트(브라우저)에서 전달된 텍스트 입력값의 유효성을 서버 측에서 검증합니다.
 * 2. OpenAI로부터 반환된 JSON 분석 결과가 규격(sentiment, confidence, reason)에 맞는지 엄격하게 검증합니다.
 */

// 허용되는 감성 라벨 목록 (positive, negative, neutral 3가지만 허용)
export const ALLOWED_SENTIMENTS = ['positive', 'negative', 'neutral'];

// 최대 입력 허용 글자 수 (PRD 및 설계 문서 기준 5,000자)
export const MAX_TEXT_LENGTH = 5000;

/**
 * 사용자 입력 텍스트 검증 함수
 * @param {any} text - 클라이언트로부터 받은 텍스트 데이터
 * @returns {{ isValid: boolean, code?: string, message?: string, sanitizedText?: string }}
 */
export function validateInputText(text) {
  // 1. 데이터 타입 검사: 문자열이 아닌 경우 차단
  if (typeof text !== 'string') {
    return {
      isValid: false,
      code: 'INVALID_INPUT',
      message: '텍스트 형식이 올바르지 않습니다.'
    };
  }

  // 2. 앞뒤 공백 제거
  const trimmed = text.trim();

  // 3. 빈 입력값 검사: 공백만 입력했거나 비어있는 경우
  if (trimmed.length === 0) {
    return {
      isValid: false,
      code: 'INVALID_INPUT',
      message: '분석할 내용을 입력해 주세요.'
    };
  }

  // 4. 최대 글자 수 검사: 5,000자를 초과하는 경우 차단
  if (trimmed.length > MAX_TEXT_LENGTH) {
    return {
      isValid: false,
      code: 'TEXT_TOO_LONG',
      message: `입력 내용은 최대 ${MAX_TEXT_LENGTH.toLocaleString()}자까지 가능합니다.`
    };
  }

  // 모든 검증을 통과한 경우 앞뒤 공백이 정돈된 텍스트 반환
  return {
    isValid: true,
    sanitizedText: trimmed
  };
}

/**
 * OpenAI 모델의 응답 데이터 검증 함수
 * AI가 생성한 응답은 신뢰할 수 없는 외부 입력으로 간주하고 엄격히 검사합니다.
 * @param {any} data - OpenAI가 반환한 JSON 파싱 객체
 * @returns {{ isValid: boolean, validatedResult?: { sentiment: string, confidence: number, reason: string } }}
 */
export function validateAiResponse(data) {
  // 1. 데이터가 객체인지 확인
  if (!data || typeof data !== 'object') {
    return { isValid: false };
  }

  const { sentiment, confidence, reason } = data;

  // 2. sentiment 검증: positive, negative, neutral 중 하나여야 함
  if (typeof sentiment !== 'string' || !ALLOWED_SENTIMENTS.includes(sentiment.toLowerCase())) {
    return { isValid: false };
  }

  // 3. confidence 검증: 0 이상 1 이하의 유효한 숫자여야 함
  const parsedConfidence = Number(confidence);
  if (typeof confidence !== 'number' || !Number.isFinite(parsedConfidence) || parsedConfidence < 0 || parsedConfidence > 1) {
    return { isValid: false };
  }

  // 4. reason 검증: 문자열이어야 하며 비어 있지 않아야 함
  if (typeof reason !== 'string' || reason.trim().length === 0) {
    return { isValid: false };
  }

  // 모든 검증을 통과한 경우 정제된 결과 객체 반환
  return {
    isValid: true,
    validatedResult: {
      sentiment: sentiment.toLowerCase(),
      confidence: Number(parsedConfidence.toFixed(3)), // 소수점 3자리로 정규화
      reason: reason.trim()
    }
  };
}

