/**
 * api/analyze.js
 * 
 * [역할]
 * Vercel 서버리스 함수 엔드포인트: POST /api/analyze
 * 
 * [처리 흐름]
 * 1. HTTP 메서드(POST) 검사
 * 2. 요청 본문(JSON) 및 텍스트 유효성 검증 (공백, 5000자 제한)
 * 3. OpenAI API를 통한 감성 분석 수행 (서버 전용)
 * 4. 분석 결과의 유효성 검증
 * 5. Supabase 'sentiment_analyses' 테이블에 비동기 저장
 * 6. 클라이언트에 정형화된 JSON 응답 반환
 */

import 'dotenv/config';
import { validateInputText } from '../lib/validation.js';
import { analyzeSentimentWithOpenAI } from '../lib/openai.js';
import { saveAnalysisResult } from '../lib/supabase.js';

export default async function handler(req, res) {
  // 1. HTTP Method 검증: 오직 POST 요청만 허용합니다.
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'POST 요청만 지원합니다.'
      }
    });
  }

  // 2. 요청 본문(Body) 데이터 확인
  const body = req.body;
  if (!body || typeof body !== 'object') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: '요청 본문(Body)이 올바른 JSON 형식이 아닙니다.'
      }
    });
  }

  // 3. 사용자 입력 텍스트 검증 (공백 여부, 5,000자 초과 검사)
  const validation = validateInputText(body.text);
  if (!validation.isValid) {
    const statusCode = validation.code === 'TEXT_TOO_LONG' ? 400 : 400;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: validation.code,
        message: validation.message
      }
    });
  }

  const inputText = validation.sanitizedText;

  try {
    // 4. OpenAI API를 통한 감성 분석 호출
    const aiResult = await analyzeSentimentWithOpenAI(inputText);

    // 5. Supabase 데이터베이스에 분석 결과 저장 시도
    // 주의: DB 저장이 실패하더라도 사용자는 AI 분석 결과를 확인할 수 있어야 하므로,
    // 전체 프로세스를 중단하지 않고 saved: false 플래그로 전달합니다.
    const isSaved = await saveAnalysisResult({
      inputText: inputText,
      sentiment: aiResult.sentiment,
      confidence: aiResult.confidence,
      reason: aiResult.reason
    });

    // 6. 성공 결과 클라이언트 반환
    return res.status(200).json({
      success: true,
      result: {
        sentiment: aiResult.sentiment,
        confidence: aiResult.confidence,
        reason: aiResult.reason
      },
      saved: isSaved
    });

  } catch (error) {
    // 내부 디버깅용 서버 로그 (사용자 화면에는 노출하지 않음)
    console.error('[API 처리 오류]:', error.message);

    // 환경 변수 미설정 오류인 경우
    if (error.code === 'CONFIG_ERROR') {
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 설정이 완료되지 않았습니다. 관리자에게 문의해 주세요.'
        }
      });
    }

    // AI 제공자(OpenAI) 호출 및 응답 오류인 경우
    if (error.code === 'AI_PROVIDER_ERROR' || error.status === 429) {
      const isRateLimit = error.status === 429;
      return res.status(isRateLimit ? 429 : 502).json({
        success: false,
        error: {
          code: isRateLimit ? 'RATE_LIMITED' : 'AI_PROVIDER_ERROR',
          message: isRateLimit
            ? '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.'
            : '현재 감성 분석을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.'
        }
      });
    }

    // 그 외 예상치 못한 내부 서버 오류
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
      }
    });
  }
}

