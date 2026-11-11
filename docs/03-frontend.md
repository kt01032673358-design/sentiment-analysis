# 03 — 프론트엔드 구현 지침

## 1. 구현 범위
- `public/index.html`: 시맨틱 페이지 구조
- `public/css/styles.css`: 디자인 토큰, 레이아웃, 반응형, 상태 스타일
- `public/js/app.js`: 이벤트와 API 요청
- `public/js/ui.js`: 화면 상태 렌더링 및 DOM 업데이트

프레임워크 없이 Vanilla JavaScript ES Modules를 사용한다.

## 2. HTML 요소 계약
필수 요소에 다음 식별자를 사용한다(변경 시 모든 참조를 함께 수정하고 문서화).
- `#analysis-form`
- `#text-input`
- `#char-count`
- `#submit-button`
- `#form-error`
- `#loading-indicator`
- `#result-section`
- `#sentiment-label`
- `#confidence-value`
- `#reason-text`
- `#api-error`

폼은 `method`와 관계없이 JavaScript의 `submit` 이벤트를 처리하고 기본 페이지 이동을 막는다.

## 3. 입력 검증
- 앞뒤 공백을 제거한 값이 비어 있으면 요청하지 않는다.
- 최대 길이는 5,000자다.
- 글자 수는 사용자에게 표시되는 기준과 서버 검증 기준을 일치시킨다.
- 브라우저 검증만 신뢰하지 않고 서버에서도 동일하게 검증한다.
- 요청 중에는 버튼을 비활성화하고 중복 요청을 막는다.

## 4. API 요청
브라우저는 다음 엔드포인트만 호출한다.
`POST /api/analyze`

요청 JSON:
```json
{
  "text": "분석할 문장"
}
```
성공 응답:
```json
{
  "success": true,
  "result": {
    "sentiment": "positive",
    "confidence": 0.87,
    "reason": "긍정적인 표현과 기대를 나타내는 문장이 포함되어 있습니다."
  },
  "saved": true
}
```
오류 응답:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "분석할 내용을 입력해 주세요."
  }
}
```
실제 응답은 `docs/04-backend-ai.md`의 계약과 일치시킨다.

## 5. 화면 렌더링
- API 응답을 받은 뒤 결과의 라벨, confidence, reason을 각각 업데이트한다.
- 서버에서 받은 문자열은 `innerHTML`로 삽입하지 않는다. `textContent`를 사용한다.
- confidence는 0~1 값인지 확인한 후 `Math.round(confidence * 100)`으로 표시한다.
- `sentiment`는 허용된 세 값만 매핑한다. 알 수 없는 값은 표시하지 않고 오류 상태로 처리한다.
- 이전 결과가 새 요청 결과처럼 남지 않도록 요청 시작 시 결과 영역을 초기화하거나 로딩 상태와 명확히 분리한다.

## 6. 오류 처리
- HTTP 상태 코드와 응답 JSON을 함께 확인한다.
- JSON 파싱에 실패하거나 예상한 구조가 아니면 일반 오류 메시지를 표시한다.
- 사용자에게 기술 스택 트레이스, 내부 경로, API 제공자 응답 원문을 노출하지 않는다.
- 네트워크 오류는 재시도 안내를 제공한다.
- 오류 메시지는 `textContent`로 표시한다.

## 7. 사용자 경험
- 요청 중 버튼 문구를 `분석 중...` 등으로 바꿀 수 있다.
- 요청 종료 시 성공/실패와 관계없이 버튼을 복원한다.
- textarea 입력 시 글자 수를 실시간 갱신한다.
- Enter 키는 textarea의 줄바꿈으로 동작한다. 제출은 버튼으로 수행한다.
- 브라우저 새로고침 후 결과를 복구하는 기능은 필수 범위가 아니다.

## 8. 프론트엔드 완료 기준
- [ ] 빈 문자열과 공백 문자열을 차단한다.
- [ ] 5,000자 제한과 카운터가 일치한다.
- [ ] 유효 입력으로 API를 한 번만 호출한다.
- [ ] 로딩 중 중복 요청이 불가능하다.
- [ ] 세 라벨, 신뢰도, 분석 이유가 정확한 위치에 표시된다.
- [ ] 오류 응답 및 네트워크 단절 시 오류 안내가 표시된다.
- [ ] 사용자/서버 응답 문자열이 HTML로 실행되지 않는다.
- [ ] 키보드 조작과 모바일 레이아웃이 동작한다.
