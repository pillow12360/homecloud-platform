# 헬스 체크 API 구현 상세 (Health Check API)

## 1. 개요
시스템의 가용성을 모니터링하기 위한 헬스 체크(Health Check) API입니다.
서버의 실행 상태뿐만 아니라 **데이터베이스 연결 상태**를 실시간으로 확인하여 시스템의 전반적인 건강 상태를 반환합니다.
Uptime Kuma와 같은 외부 모니터링 도구에서 주기적으로 호출하여 장애를 감지하는 데 사용됩니다.

## 2. 엔드포인트 정보
- **URL**: `/api/health`
- **Method**: `GET`
- **Access**: Public (인증 불필요)

## 3. 구현 상세

### 3.1 로직 흐름
1. **DB 연결 확인**: `prisma.$queryRaw\`SELECT 1\`` 쿼리를 실행하여 데이터베이스가 응답하는지 확인합니다.
2. **성공 시 (200 OK)**:
   - `status`: "ok"
   - `services.database`: "connected"
   - `uptime`: 서버 가동 시간 (초)
3. **실패 시 (503 Service Unavailable)**:
   - `status`: "error"
   - `services.database`: "disconnected"
   - `error`: 에러 메시지 포함

### 3.2 응답 형식 (Standardized Response)
프로젝트 공통 응답 포맷(`ApiResponse`)을 따릅니다.

#### 성공 응답 예시
```json
{
  "success": true,
  "message": "System is healthy",
  "data": {
    "status": "ok",
    "services": {
      "database": "connected",
      "server": "running"
    },
    "uptime": 123.45
  },
  "timestamp": "2025-11-26T10:00:00.000Z"
}
```

#### 실패 응답 예시
```json
{
  "success": false,
  "message": "System health check failed",
  "data": {
    "status": "error",
    "services": {
      "database": "disconnected",
      "server": "running"
    }
  },
  "timestamp": "2025-11-26T10:00:00.000Z"
}
```

## 4. 관련 파일
- `src/app/api/health/route.ts`: API 엔드포인트 구현
- `src/lib/api-response.ts`: 공통 API 응답 유틸리티 (`successResponse`, `errorResponse`)
