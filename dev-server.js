/**
 * dev-server.js
 * 
 * [역할]
 * 추가 패키지 설치 없이 Node.js 기본 내장 모듈(http, fs, path)만을 사용하여
 * 로컬에서 웹 페이지(public/)와 백엔드 API(api/analyze.js)를 동시에 실행하는 개발용 서버입니다.
 * 
 * [실행 방법]
 * 터미널에서: node dev-server.js
 * 접속 주소: http://localhost:3000
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import analyzeHandler from './api/analyze.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

// 지원하는 파일 확장자별 MIME 타입
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // 1. 감성 분석 API 라우팅: /api/analyze
  if (pathname === '/api/analyze') {
    let bodyData = '';
    req.on('data', chunk => {
      bodyData += chunk;
    });

    req.on('end', async () => {
      try {
        req.body = bodyData ? JSON.parse(bodyData) : {};
      } catch (e) {
        req.body = null;
      }

      // Vercel Function 형태의 res 객체 래퍼 생성
      const mockRes = {
        statusCode: 200,
        headers: {},
        setHeader(name, value) {
          this.headers[name] = value;
          return this;
        },
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          res.writeHead(this.statusCode, {
            'Content-Type': 'application/json; charset=UTF-8',
            ...this.headers
          });
          res.end(JSON.stringify(data));
        }
      };

      try {
        await analyzeHandler(req, mockRes);
      } catch (handlerErr) {
        console.error('[서버 에러]:', handlerErr);
        mockRes.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: '서버 내부 오류가 발생했습니다.'
          }
        });
      }
    });
    return;
  }

  // 2. 정적 파일 서빙: public/ 폴더
  let relativeFilePath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(__dirname, 'public', relativeFilePath);

  // 정적 파일 존재 여부 확인
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('========================================================');
  console.log(`🚀 [로컬 개발 서버 실행 중] http://localhost:${PORT}`);
  console.log('브라우저에서 위 주소를 열어 감성 분석 서비스를 확인하세요.');
  console.log('종료하려면 터미널에서 Ctrl + C 를 누르세요.');
  console.log('========================================================');
});

