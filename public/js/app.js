/**
 * public/js/app.js
 * 
 * [역할]
 * 프론트엔드의 메인 컨트롤러 모듈입니다.
 * 사용자 입력 이벤트(글자 수 카운팅, 폼 제출)를 수신하고
 * 백엔드 서버(/api/analyze)로 분석을 요청한 뒤 결과를 UI 모듈로 전달합니다.
 */

import {
  elements,
  updateCharCount,
  showFormError,
  clearFormError,
  showApiError,
  clearApiError,
  setLoadingState,
  renderResult
} from './ui.js';

const MAX_LENGTH = 5000;

/**
 * 실시간 글자 수 입력 이벤트 핸들러
 */
function handleTextInput() {
  if (!elements.textInput) return;
  const currentLength = elements.textInput.value.length;
  updateCharCount(currentLength, MAX_LENGTH);

  // 입력을 시작하면 기존 에러 메시지 초기화
  if (currentLength > 0 && currentLength <= MAX_LENGTH) {
    clearFormError();
  }
}

/**
 * 폼 제출 이벤트 핸들러 (감정 분석 요청)
 * @param {Event} event
 */
async function handleFormSubmit(event) {
  event.preventDefault(); // 기본 페이지 새로고침 방지

  if (!elements.textInput) return;

  const rawText = elements.textInput.value;
  const trimmedText = rawText.trim();

  // 1. 클라이언트 측 유효성 검사: 빈 텍스트 확인
  if (trimmedText.length === 0) {
    showFormError('분석할 내용을 입력해 주세요.');
    elements.textInput.focus();
    return;
  }

  // 2. 클라이언트 측 유효성 검사: 글자 수 초과 확인
  if (trimmedText.length > MAX_LENGTH) {
    showFormError(`입력 내용은 최대 ${MAX_LENGTH.toLocaleString()}자까지 가능합니다.`);
    elements.textInput.focus();
    return;
  }

  // 3. 로딩 상태 시작 (버튼 비활성화 및 스피너 표시)
  setLoadingState(true);

  try {
    // 4. 서버리스 백엔드 API (/api/analyze) 호출
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: trimmedText })
    });

    let data;
    try {
      data = await response.json();
    } catch (parseErr) {
      throw new Error('서버로부터 올바른 응답을 받지 못했습니다. 잠시 후 다시 시도해 주세요.');
    }

    // 5. 서버 응답 결과 확인
    if (!response.ok || !data.success) {
      const errorMessage = data?.error?.message || '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
      showApiError(errorMessage);
      return;
    }

    // 6. 성공적인 분석 결과 렌더링
    renderResult(data.result, data.saved);

  } catch (err) {
    // 네트워크 단절 또는 기타 요청 예외 처리
    console.error('[클라이언트 요청 실패]:', err);
    showApiError('네트워크 연결 상태를 확인한 후 다시 시도해 주세요.');
  } finally {
    // 7. 로딩 상태 종료 (버튼 복원)
    setLoadingState(false);
  }
}

/**
 * 애플리케이션 초기화 함수
 */
function initApp() {
  if (elements.textInput) {
    elements.textInput.addEventListener('input', handleTextInput);
  }

  if (elements.form) {
    elements.form.addEventListener('submit', handleFormSubmit);
  }

  // 초기 글자 수 표시 (0 / 5,000)
  updateCharCount(0, MAX_LENGTH);
}

// DOM 준비 완료 시 앱 초기화 실행
document.addEventListener('DOMContentLoaded', initApp);

