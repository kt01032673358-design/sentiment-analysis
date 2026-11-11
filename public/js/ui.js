/**
 * public/js/ui.js
 * 
 * [역할]
 * 웹 화면의 UI 요소(DOM)를 조작하고 렌더링을 담당하는 뷰 모듈입니다.
 * 
 * [보안 및 원칙]
 * 1. XSS(악성 스크립트 삽입)를 철저히 차단하기 위해 HTML 문자열 삽입(innerHTML)을
 *    절대 사용하지 않고 오직 textContent를 통해서만 텍스트를 출력합니다.
 * 2. 신뢰도(0~1)를 백분율(0~100%)로 변환하여 보기 쉽게 표시합니다.
 * 3. 긍정, 부정, 중립 감성에 맞추어 시각적 테마 클래스를 적용합니다.
 */

// 감성 라벨 한국어 매핑 테이블
const SENTIMENT_LABELS = {
  positive: '긍정 (Positive)',
  negative: '부정 (Negative)',
  neutral: '중립 (Neutral)'
};

// 주요 DOM 요소 캐싱
export const elements = {
  form: document.getElementById('analysis-form'),
  textInput: document.getElementById('text-input'),
  charCount: document.getElementById('char-count'),
  submitButton: document.getElementById('submit-button'),
  formError: document.getElementById('form-error'),
  loadingIndicator: document.getElementById('loading-indicator'),
  resultSection: document.getElementById('result-section'),
  sentimentLabel: document.getElementById('sentiment-label'),
  confidenceValue: document.getElementById('confidence-value'),
  reasonText: document.getElementById('reason-text'),
  saveStatus: document.getElementById('save-status'),
  apiError: document.getElementById('api-error')
};

/**
 * 글자 수 카운터 업데이트
 * @param {number} count - 현재 글자 수
 * @param {number} max - 최대 글자 수 (5,000자)
 */
export function updateCharCount(count, max = 5000) {
  if (elements.charCount) {
    elements.charCount.textContent = `${count.toLocaleString()} / ${max.toLocaleString()}`;
    if (count > max) {
      elements.charCount.style.color = 'var(--color-negative)';
    } else {
      elements.charCount.style.color = 'var(--color-muted)';
    }
  }
}

/**
 * 폼 입력 에러 표시
 * @param {string} message - 표시할 안내 문구
 */
export function showFormError(message) {
  if (elements.formError) {
    elements.formError.textContent = message;
    elements.formError.hidden = false;
  }
}

/**
 * 폼 입력 에러 숨김
 */
export function clearFormError() {
  if (elements.formError) {
    elements.formError.textContent = '';
    elements.formError.hidden = true;
  }
}

/**
 * API 호출 에러 표시
 * @param {string} message - 표시할 오류 문구
 */
export function showApiError(message) {
  if (elements.apiError) {
    elements.apiError.textContent = message;
    elements.apiError.hidden = false;
  }
}

/**
 * API 호출 에러 숨김
 */
export function clearApiError() {
  if (elements.apiError) {
    elements.apiError.textContent = '';
    elements.apiError.hidden = true;
  }
}

/**
 * 분석 중 로딩 상태 표시
 */
export function setLoadingState(isLoading) {
  if (elements.submitButton) {
    elements.submitButton.disabled = isLoading;
    elements.submitButton.textContent = isLoading ? '분석 중...' : '감정 분석하기';
  }

  if (elements.loadingIndicator) {
    elements.loadingIndicator.hidden = !isLoading;
  }

  // 새로운 분석을 시작할 때는 기존 결과 및 에러 숨김
  if (isLoading) {
    clearFormError();
    clearApiError();
    if (elements.resultSection) {
      elements.resultSection.hidden = true;
    }
  }
}

/**
 * 성공적인 분석 결과 화면에 렌더링
 * @param {object} result - { sentiment, confidence, reason }
 * @param {boolean} saved - Supabase 저장 성공 여부
 */
export function renderResult(result, saved) {
  if (!elements.resultSection) return;

  const { sentiment, confidence, reason } = result;

  // 1. 감성 라벨 및 클래스 적용
  const normalizedSentiment = (sentiment || '').toLowerCase();
  const labelText = SENTIMENT_LABELS[normalizedSentiment] || normalizedSentiment;
  
  if (elements.sentimentLabel) {
    elements.sentimentLabel.textContent = labelText;
    elements.sentimentLabel.className = 'sentiment-value'; // 기존 클래스 리셋
    elements.sentimentLabel.classList.add(`sentiment-${normalizedSentiment}`);
  }

  // 2. 신뢰도(confidence) 백분율 변환 (0.87 -> 87%)
  const percentage = Math.round(Number(confidence) * 100);
  if (elements.confidenceValue) {
    elements.confidenceValue.textContent = `${percentage}%`;
  }

  // 3. 분석 이유 출력 (안전하게 textContent 사용)
  if (elements.reasonText) {
    elements.reasonText.textContent = reason;
  }

  // 4. Supabase DB 저장 상태 안내
  if (elements.saveStatus) {
    if (saved) {
      elements.saveStatus.textContent = '✓ 기록 저장됨';
      elements.saveStatus.style.color = 'var(--color-positive)';
    } else {
      elements.saveStatus.textContent = '※ 결과 저장 실패 (참고용 표시)';
      elements.saveStatus.style.color = 'var(--color-muted)';
    }
  }

  // 결과 카드 표시
  elements.resultSection.hidden = false;
}

